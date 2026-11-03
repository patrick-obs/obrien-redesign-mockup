// The application: routing, auth, caching, and orchestration of ESPN calls.
// Runs inside one Durable Object. Pure enough to test in Node with fakes.
import * as espnMod from "./espn.js";
import { buildReport, waiverThresholds } from "./report.js";
import { playerValue, rosterPlayer, proposeTrades, blitzSet, robustSet, evaluateTrade } from "./trades.js";
import { analystTake, polishTake } from "./analyst.js";
import { byeWeeks, horizonWeights, availability, simulateSeason, scheduleOutlook, positionalStrength, gamePlan, leagueSd, playoffWeeks } from "./season.js";
import { playoffSos, sosFactor } from "./trades.js";
import { fetchScoreboard } from "./vegas.js";
import { makeSession, verifySession, csrfFor, parseCookies, sessionCookie, clearSessionCookie, SESSION_COOKIE, timingSafeEqual } from "./auth.js";
import { loginPage, errorPage, settingsPage, indexPage, leaguePage, lineupsPage, tradePage, addPage, blitzPage } from "./html.js";

const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;
const html = (body, status = 200, headers = {}) => new Response(body, { status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", ...headers } });
const redirect = (to, headers = {}) => new Response(null, { status: 302, headers: { location: to, ...headers } });

/** Run async jobs with limited concurrency (Durable Objects allow 6 simultaneous connections). */
async function pool(jobs, limit = 4) {
  const out = new Array(jobs.length); let i = 0;
  await Promise.all(Array.from({ length: Math.min(limit, jobs.length) }, async () => {
    while (i < jobs.length) { const k = i++; out[k] = await jobs[k](); }
  }));
  return out;
}

export class App {
  /**
   * @param env   APP_PASSWORD, SECRET_KEY, ESPN_S2, SWID, SEASON?, CACHE_SECONDS?
   * @param storage  Durable Object storage (get/put/delete) or a fake
   * @param fetchFn  fetch
   * @param espn     the espn module (injectable for tests)
   */
  constructor({ env, storage, fetchFn, espn = espnMod, now = () => Date.now() }) {
    this.env = env; this.storage = storage; this.fetchFn = fetchFn; this.espn = espn; this.now = now;
    this.mem = new Map();
    this.cacheSeconds = Number(env.CACHE_SECONDS || 600);
  }

  // ------------------------------------------------------------ settings + cache
  async settings() {
    const s = { espn_s2: this.env.ESPN_S2 || "", swid: this.env.SWID || "", season: Number(this.env.SEASON || this.espn.currentSeason(new Date(this.now()))) };
    const saved = await this.storage.get("settings");
    if (saved) { if (saved.espn_s2) s.espn_s2 = saved.espn_s2; if (saved.swid) s.swid = saved.swid; }
    const prefs = (await this.storage.get("prefs")) || {};
    s.automanage = prefs.automanage !== false;            // master switch: on unless switched off
    s.auto_lineup = prefs.auto_lineup !== false;          // on unless switched off
    s.auto_fill_empty = prefs.auto_fill_empty !== false;   // on unless switched off (real holes only, never bye cover)
    s.auto_trades = prefs.auto_trades !== false;           // on unless switched off (robust plan only, with guardrails)
    s.hidden = Array.isArray(prefs.hidden) ? prefs.hidden : [];
    s.league_auto = prefs.league_auto && typeof prefs.league_auto === "object" ? prefs.league_auto : {};
    return s;
  }
  /** Autopilot applies to a league when the master switch is on and the league's own switch is not off. */
  autoFor(s, leagueId) { return !!s.automanage && s.league_auto[String(leagueId)] !== false; }
  async savePrefs(patch) {
    const prefs = (await this.storage.get("prefs")) || {};
    await this.storage.put("prefs", { ...prefs, ...patch });
  }
  cookies(s) { return { espn_s2: s.espn_s2, swid: s.swid }; }

  async cached(key, ttl, force, compute) {
    const t = this.now();
    if (!force) {
      const m = this.mem.get(key);
      if (m && t - m.ts < ttl * 1000) return m.data;
      const d = await this.storage.get(key);
      if (d && t - d.ts < ttl * 1000) { this.mem.set(key, d); return d.data; }
    }
    const data = await compute();
    const entry = { ts: t, data };
    this.mem.set(key, entry);
    try { await this.storage.put(key, entry); } catch (e) { console.warn("cache put failed", key, e?.message); }
    return data;
  }
  async clearCache() {
    const keys = [...this.mem.keys()];
    this.mem.clear();
    for (const k of keys) await this.storage.delete(k);
    for (const k of ["leagues"]) await this.storage.delete(k);
    const all = await this.storage.list?.({ prefix: "league:" });
    if (all) for (const k of all.keys()) await this.storage.delete(k);
  }

  // ------------------------------------------------------------ data
  async leagues(force = false) {
    const s = await this.settings();
    return this.cached("leagues", 3600, force, () => this.espn.discoverLeagues(this.fetchFn, this.cookies(s), s.season));
  }

  async bundle(leagueId, force = false) {
    const s = await this.settings();
    return this.cached(`league:${leagueId}`, this.cacheSeconds, force, async () => {
      const f = this.fetchFn, c = this.cookies(s), now = this.now();
      const league = await this.espn.loadLeague(f, c, s.season, leagueId);
      const b = { league_id: leagueId, name: league.name, started: league.started, drafted: !!league.drafted, teams: league.teams.length, current_week: league.currentWeek };
      // A league that reached the season without a draft was never renewed: nobody is running it this year.
      // ESPN reports week 0 for an undrafted league, so also treat "undrafted in September or later" as orphaned.
      const inSeason = league.currentWeek > 0 || new Date(now).getUTCMonth() + 1 >= 9;
      b.orphaned = !league.started && !league.drafted && league.teams.length > 0 && inSeason;
      if (!league.started) return b;
      const me = this.espn.findTeam(league, s.swid, null);
      const week = league.currentWeek;
      const [allSched, ratings] = await Promise.all([
        this.cached(`prosched:${s.season}`, 6 * 3600, false, () => this.espn.proSchedule(f, c, s.season)),
        this.espn.positionalRatings(f, c, s.season, leagueId, week),
      ]);
      const sched = this.espn.proScheduleForWeek(allSched, week);
      // Game context for the week from ESPN's public scoreboard (no login). Optional: a failure just means no Vegas tilt.
      const vegas = await this.cached(`vegas:${s.season}:${week}`, 3600, false, async () => { try { return await fetchScoreboard(f, s.season, week); } catch (e) { console.warn("scoreboard failed", e?.message); return {}; } });
      const weekSd = leagueSd(league);
      const boxes = await this.espn.boxScores(f, c, league, week, sched, ratings, now);
      // When there is no matchup this week (playoff bye / eliminated), the roster still needs managing: use the mRoster view as the lineup.
      let rosterLineup = [];
      if (!boxes.some((bx) => [bx.home?.teamId, bx.away?.teamId].includes(me.id)) && this.espn.rosterLineup) {
        try { rosterLineup = await this.espn.rosterLineup(f, c, league, me.id, week, sched, ratings, now); } catch (e) { console.warn("roster lineup failed", e?.message); }
      }
      // Week-by-week points for everyone in my matchup: recent form, volatility, floor and ceiling. Optional.
      if (this.espn.playerWeeklyStats) {
        try {
          const box = boxes.find((b) => [b.home?.teamId, b.away?.teamId].includes(me.id));
          const ps = [...(box?.home?.lineup || []), ...(box?.away?.lineup || [])].filter((p) => p.playerId != null);
          const hist = await this.cached(`hist:${leagueId}:${week}`, this.cacheSeconds, false, () => this.espn.playerWeeklyStats(f, c, league, ps.map((p) => p.playerId), week));
          for (const p of ps) {
            const h = hist[p.playerId]; if (!h) continue;
            const weeks = Object.keys(h).map(Number).sort((a, b) => a - b);
            if (!weeks.length) continue;
            p.history = weeks.map((w) => h[w]);
            const last = weeks.slice(-3).map((w) => h[w]);
            p.recentAvg = Math.round((last.reduce((a, b) => a + b, 0) / last.length) * 10) / 10;
          }
        } catch (e) { console.warn("weekly stats failed", e?.message); }
      }
      // Season context: playoff odds decide how much the playoff weeks count when valuing players.
      const odds = simulateSeason(league, { sims: 1500, seed: leagueId, sd: weekSd });
      const myOdds = odds.by_team[me.id] || null;
      const contending = (myOdds?.playoff_odds ?? 50) >= 35;
      const weights = horizonWeights(league, week, contending);
      const weeksLeft = Object.keys(weights).length;
      const byes = byeWeeks(allSched, week + 1, league.finalScoringPeriod || 17);
      const abbrToId = Object.fromEntries(Object.entries(this.espn.PRO_TEAM || {}).map(([id, ab]) => [ab, Number(id)]));
      const byesFor = (abbr) => byes[abbrToId[abbr]] || [];
      // Players in any pending offer must never be dropped (it would void the offer).
      let protectedIds = [];
      try { if (this.espn.tradeTransactions) protectedIds = (await this.espn.tradeTransactions(f, c, league, me.id)).filter((t) => t.status === "PENDING").flatMap((t) => [...t.give, ...t.get]); } catch (e) { console.warn("protected ids failed", e?.message); }
      const ctx = { vegas, weekSd, protectedIds, rosterLineup };
      let rep = buildReport(league, me, boxes, week, now, null, ctx);
      // waivers: only the positions worth scanning
      const faByPos = {};
      const positions = Object.keys(rep.waiver_thresholds);
      const results = await pool(positions.map((pos) => async () => {
        try { return await this.espn.freeAgents(f, c, league, week, pos, sched, ratings, now); } catch (e) { return { error: e.message }; }
      }));
      positions.forEach((pos, i) => { faByPos[pos] = results[i]; });
      rep = buildReport(league, me, boxes, week, now, faByPos, ctx);
      rep.trade_deadline = league.tradeDeadline || null;
      rep.trades_closed = !!(league.tradeDeadline && now > league.tradeDeadline);
      // Trades and roster shape, valued over the rest of the season: weekly value times the share of the weighted
      // remaining weeks the player is available for (bye weeks removed, playoff weeks weighted by contention).
      let trades = [], strength = null, byesAhead = [], pending = [], rosterPlayers = null;
      try {
        const rosters = await this.espn.rosters(f, c, league);
        const POS_ID = { QB: 1, RB: 2, WR: 3, TE: 4, K: 5, "D/ST": 16 };
        const poWeeks = playoffWeeks(league);
        const playoffShare = Object.entries(weights).filter(([k]) => poWeeks.includes(Number(k))).reduce((n, [, w]) => n + w, 0) / Math.max(1, Object.values(weights).reduce((a, b) => a + b, 0));
        const conv = (t) => (rosters[t.id] || []).map((p) => {
          const weekly = playerValue(p.seasonProjAvg, p.seasonAvg, this.espn.gamesPlayed(t));
          const pb = byesFor(p.proTeam), avail = availability(weights, pb);
          const sos = playoffSos(abbrToId[p.proTeam], poWeeks, allSched, ratings[String(POS_ID[p.position])]);
          const rp = rosterPlayer(p.name, p.position, p.eligible, p.status, Math.round(weekly * avail * sosFactor(sos, playoffShare) * 100) / 100, p.playerId, p.proTeam);
          rp.weekly = weekly; rp.avail = avail; rp.byes = pb; rp.playoff_sos = sos;
          return rp;
        });
        const mine = conv(me);
        const others = Object.fromEntries(league.teams.filter((t) => t.id !== me.id).map((t) => [t.name, { id: t.id, logo: t.logo || "", players: conv(t) }]));
        // Kept for the blitz, which simulates combinations of accepted offers against real rosters.
        const slim = (ps) => ps.map((p) => ({ name: p.name, position: p.position, eligible: p.eligible, slot: "BE", proj: p.proj, status: p.status, playerId: p.playerId, proTeam: p.proTeam, weekly: p.weekly }));
        rosterPlayers = { [me.id]: slim(mine), ...Object.fromEntries(Object.values(others).map((o) => [o.id, slim(o.players)])) };
        trades = rep.trades_closed ? [] : proposeTrades(mine, others, rep.slot_counts, { weeksLeft, horizonNote: contending ? "with the playoff weeks counted extra" : "" });
        strength = positionalStrength({ [me.id]: mine, ...Object.fromEntries(Object.values(others).map((o) => [o.id, o.players])) }, me.id, rep.slot_counts);
        const starters = new Set(Object.values(rep.recommended).flat().map((p) => p.name));
        byesAhead = mine.filter((p) => starters.has(p.name) && p.byes.length).map((p) => ({ name: p.name, pos: p.position, week: p.byes[0] })).sort((a, b) => a.week - b.week);
        // Offers already out on ESPN, scored by the same math so they can be compared with the board.
        try {
          const byTeamId = Object.fromEntries(Object.values(others).map((o) => [o.id, o.players]));
          const all = this.espn.tradeTransactions ? await this.espn.tradeTransactions(f, c, league, me.id) : await this.espn.pendingTrades(f, c, league, me.id);
          await this.trackTrades(league, me.id, all, mine, byTeamId);
          pending = all.filter((t) => t.status === "PENDING").map((t) => {
            const ev = evaluateTrade(mine, byTeamId[t.with_team_id] || [], t.give, t.get, rep.slot_counts);
            const names = (ids, pool) => ids.map((id) => pool.find((p) => p.playerId === id)?.name || `#${id}`);
            return { ...t, ...(ev || { give_names: names(t.give, mine).join(" + "), get_names: names(t.get, byTeamId[t.with_team_id] || []).join(" + "), my_gain: null, their_gain: null, kind: `${t.give.length}-for-${t.get.length}` }), give_ids: t.give, get_ids: t.get };
          });
        } catch (e) { console.warn("pending trades failed", e?.message); }
      } catch (e) { console.warn("trades failed", e?.message); }
      const outlook = scheduleOutlook(league, me, weekSd);
      const plan = gamePlan({ report: rep, odds, outlook, strength, trades, weeksLeft, byesAhead });
      const problem_count = rep.warnings.filter((w) => /No eligible|BYE| is out|injury reserve|suspension/.test(w)).length;
      // The analyst's take: rules first, Claude's rewrite of the same facts when a key is configured and the daily cap allows.
      let analyst = null;
      try {
        analyst = analystTake({ report: rep, trades, league, odds: myOdds, strength, plan });
        if (await this.claudeAllowed()) {
          const polished = await polishTake(analyst, { apiKey: this.env.ANTHROPIC_API_KEY, fetchFn: f });
          if (polished) analyst = polished;
        }
        delete analyst.facts;
      } catch (e) { console.warn("analyst failed", e?.message); }
      const season = { odds: myOdds, spots: odds.spots, outlook, strength, plan: { ...plan, bullets: analyst?.plan?.length ? analyst.plan : plan.bullets, source: analyst?.source === "claude" && analyst.plan?.length ? "claude" : "rules" }, weeks_left: weeksLeft, contending, byes_ahead: byesAhead,
        standings_odds: Object.fromEntries(Object.entries(odds.by_team).map(([id, o]) => [id, o.playoff_odds])) };
      return { ...b, report: rep, trades, pending, rosters: rosterPlayers, analyst, season, team_id: me.id, week, problem_count };
    });
  }

  /** Notice when an offer we have seen stops being pending, and log what happened to it. */
  async trackTrades(league, myId, all, mine, byTeamId) {
    const key = `trades:${league.id}`;
    const seen = (await this.storage.get(key)) || {};
    const names = (ids, pool) => ids.map((id) => pool.find((p) => p.playerId === id)?.name || `#${id}`).join(" + ");
    const next = {};
    for (const t of all) {
      next[t.id] = t.status;
      const before = seen[t.id];
      if (before === "PENDING" && t.status !== "PENDING") {
        const what = { ACCEPTED: "accepted", EXECUTED: "accepted", REJECTED: "declined", CANCELED: "withdrawn", EXPIRED: "expired" }[t.status] || t.status.toLowerCase();
        if (t.mine && (what === "declined" || what === "expired")) {
          // Remember the package and the manager, so the autopilot does not nag.
          const st = (await this.storage.get(`autotrade:${league.id}`)) || { declined: {}, cooldown: {}, offered: {} };
          st.declined[[...t.give].sort().join("+") + ">" + [...t.get].sort().join("+")] = this.now();
          st.cooldown[t.with_team_id] = this.now();
          await this.storage.put(`autotrade:${league.id}`, st);
        }
        await this.logActivity({ kind: "settled", league: league.name, league_id: league.id, week: league.currentWeek, ok: ["ACCEPTED", "EXECUTED"].includes(t.status), outcome: what,
          with: t.with, give: names(t.give, mine), get: names(t.get, byTeamId[t.with_team_id] || []), mine: t.mine, by: "espn", message: `${t.mine ? "Your offer to" : "The offer from"} ${t.with} was ${what}.` });
      }
    }
    await this.storage.put(key, next);
  }

  /** Remember whether ESPN is accepting the cookies, and say so once in the feed when it stops. */
  async noteAuth(ok, message = "") {
    const a = (await this.storage.get("espn_auth")) || { failed: false };
    if (ok && a.failed) { await this.storage.put("espn_auth", { failed: false }); await this.logActivity({ kind: "auth", ok: true, league: "all leagues", week: null, message: "ESPN accepted the cookies again.", by: "espn" }); }
    else if (!ok && !a.failed) { await this.storage.put("espn_auth", { failed: true, since: this.now(), message }); await this.logActivity({ kind: "auth", ok: false, league: "all leagues", week: null, message: `ESPN rejected the cookies: ${message}. Lineups, pickups and trades are paused until new cookies are saved under Settings.`, by: "espn" }); }
  }

  // ------------------------------------------------------------ notifications
  /** Push a short message to NOTIFY_URL if set (an ntfy.sh topic URL or any webhook that accepts a text POST). Never throws. */
  async notify(title, text) {
    const url = this.env.NOTIFY_URL; if (!url) return;
    try {
      const isSlack = /hooks\.slack\.com/.test(url);
      await this.fetchFn(url, { method: "POST", headers: isSlack ? { "content-type": "application/json" } : { "content-type": "text/plain", Title: title.replace(/[^\x20-\x7e]/g, "") }, body: isSlack ? JSON.stringify({ text: `*${title}*\n${text}` }) : text, signal: AbortSignal.timeout(8000) });
    } catch (e) { console.warn("notify failed", e?.message); }
  }

  // ------------------------------------------------------------ activity log
  /** Everything the app ever sends to ESPN, newest first, capped at 200 entries. */
  async logActivity(entry) {
    const log = (await this.storage.get("activity")) || [];
    log.unshift({ at: this.now(), ...entry });
    await this.storage.put("activity", log.slice(0, 200));
    // Tell the phone about anything that changes the roster or needs a human.
    const line = entry.kind === "trade" ? `Offer to ${entry.with}: ${entry.give} for ${entry.get}` : entry.kind === "withdraw" ? `Withdrew offer to ${entry.with}` : entry.kind === "settled" ? entry.message
      : entry.kind === "claim" ? `Claim ${entry.add}${entry.drop ? `, drop ${entry.drop}` : ""}` : entry.kind === "add" ? `Added ${entry.add}${entry.drop ? `, dropped ${entry.drop}` : ""}` : entry.kind === "lineup" ? `Lineup set (${entry.changes} changes)`
      : entry.kind === "auth" ? entry.message : entry.kind === "incoming" ? entry.message : null;
    if (line) await this.notify(`${entry.league}${entry.ok === false ? " (failed)" : ""}`, `${line}${entry.ok === false ? ` — ${entry.message}` : ""}${entry.by === "auto" ? " (autopilot)" : ""}`);
  }
  async activity() { return (await this.storage.get("activity")) || []; }

  // ------------------------------------------------------------ Claude guardrails
  /** Spending controls for the optional Claude rewrite: a kill switch and a per-day call cap, counted in storage. */
  claudeConfig() {
    return { enabled: !!this.env.ANTHROPIC_API_KEY && this.env.ANALYST_ENABLED !== "0", cap: Math.max(0, Number(this.env.ANALYST_DAILY_CAP || 60)) };
  }
  claudeKey() { return `claude:${new Date(this.now()).toISOString().slice(0, 10)}`; }
  async claudeCallsToday() { return Number(await this.storage.get(this.claudeKey())) || 0; }
  /** True (and counts the call) only when Claude is configured, switched on, and under today's cap. */
  async claudeAllowed() {
    const c = this.claudeConfig();
    if (!c.enabled) return false;
    const n = await this.claudeCallsToday();
    if (n >= c.cap) { console.warn(`analyst: daily Claude cap of ${c.cap} reached`); return false; }
    await this.storage.put(this.claudeKey(), n + 1);
    return true;
  }

  // ------------------------------------------------------------ auth
  async authed(request) {
    const c = parseCookies(request.headers.get("cookie"));
    return verifySession(this.env.SECRET_KEY, c[SESSION_COOKIE], this.now());
  }
  async csrf(request) {
    const c = parseCookies(request.headers.get("cookie"));
    return csrfFor(this.env.SECRET_KEY, c[SESSION_COOKIE] || "");
  }
  async checkCsrf(request, form) {
    const want = await this.csrf(request);
    return timingSafeEqual(form.get("csrf") || "", want);
  }

  // ------------------------------------------------------------ routing
  async handle(request) {
    const url = new URL(request.url);
    const path = url.pathname;
    try {
      if (path === "/__warm") return this.warm(request);
      if (path === "/health") { const a = await this.storage.get("espn_auth"); return a?.failed ? new Response(`espn-auth-failed since ${new Date(a.since).toISOString()}`, { status: 503 }) : new Response("ok"); }
      if (path === "/login") return this.login(request, url);
      if (path === "/logout" && request.method === "POST") return redirect("/login", { "set-cookie": clearSessionCookie() });
      if (!(await this.authed(request))) return redirect(`/login?next=${encodeURIComponent(path)}`);
      if (path === "/") return this.index(url, request);
      if (path.startsWith("/league/")) return this.league(Number(path.split("/")[2]), url, request);
      if (path === "/lineups") return this.lineups(request, url);
      if (path === "/trade") return this.trade(request, url);
      if (path === "/trades") return this.blitz(request, url);
      if (path === "/withdraw" && request.method === "POST") return this.withdraw(request);
      if (path === "/add") return this.add(request, url);
      if (path === "/hide" && request.method === "POST") return this.hide(request);
      if (path === "/autopilot" && request.method === "POST") return this.runNow(request);
      if (path === "/respond" && request.method === "POST") return this.respond(request);
      if (path === "/settings") return this.settingsPage(request);
      if (path === "/refresh" && request.method === "POST") { await this.clearCache(); return redirect("/"); }
      return html(errorPage("Page not found.", true), 404);
    } catch (e) {
      console.error("request failed", e);
      return html(errorPage(e?.message || String(e), true), 502);
    }
  }

  async login(request, url) {
    const expected = this.env.APP_PASSWORD || "";
    if (request.method === "POST") {
      const form = await request.formData();
      if (expected && timingSafeEqual(form.get("password") || "", expected)) {
        const token = await makeSession(this.env.SECRET_KEY, this.now());
        const next = url.searchParams.get("next") || "/";
        return redirect(next.startsWith("/") ? next : "/", { "set-cookie": sessionCookie(token, url.protocol === "https:") });
      }
      await new Promise((r) => setTimeout(r, 800));
      return html(loginPage(!!expected, ["Wrong passphrase."]), 401);
    }
    return html(loginPage(!!expected));
  }

  async index(url, request = null) {
    const s = await this.settings();
    if (request) url.request = request;
    if (!(s.espn_s2 && s.swid)) return redirect("/settings");
    const force = url.searchParams.get("refresh") === "1";
    const leagues = await this.leagues(force);
    const bundles = [], errors = [];
    const auth = await this.storage.get("espn_auth");
    if (auth?.failed) errors.push(`ESPN has been rejecting the cookies since ${new Date(auth.since).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/New_York" })} ET. Nothing is being set, picked up or offered until fresh espn_s2 and SWID are saved under Settings.`);
    for (const lg of leagues) {
      if (s.hidden.includes(lg.league_id)) continue;
      try {
        const b = await this.bundle(lg.league_id, force);
        if (b.started) b.auto = await this.storage.get(`auto:${b.league_id}:${b.week}`);
        bundles.push(b);
        await this.noteAuth(true);
      } catch (e) {
        errors.push(`${lg.league_name}: ${e?.message || e}`);
        if (/\b401\b|cookies/i.test(e?.message || "")) await this.noteAuth(false, e.message);
      }
    }
    bundles.sort((a, b) => (a.started === b.started ? a.name.localeCompare(b.name) : a.started ? -1 : 1));
    const totalMoves = bundles.reduce((n, b) => n + (b.report ? b.report.lineup_items.length : 0), 0);
    const saved = url.searchParams.get("saved");
    if (saved) errors.unshift(`Saved. ESPN reports ${saved} league(s) for this account.`);
    const ran = url.searchParams.get("ran");
    if (ran === "off") errors.unshift("Automanage is switched off, so the autopilot did not run. Turn it on under Settings.");
    else if (ran != null) errors.unshift(`Autopilot ran: acted in ${plural(Number(ran), "league")}. Details are in Sent to ESPN below.`);
    return html(indexPage({ bundles, errors, totalMoves, season: s.season, now: this.now(), csrf: await this.csrf(url.request || new Request(url.href)), hiddenCount: s.hidden.length, activity: (await this.activity()).slice(0, 12), automanage: s.automanage }));
  }

  async league(id, url, request) {
    if (!id) return html(errorPage("Bad league id.", true), 404);
    const b = await this.bundle(id, url.searchParams.get("refresh") === "1");
    if (!b.started) return html(errorPage(`${b.name} has not started this season.`, true));
    return html(leaguePage({ ...b, csrf: await this.csrf(request) }));
  }

  async lineups(request, url) {
    const s = await this.settings();
    const form = request.method === "POST" ? await request.formData() : null;
    const only = Number((form && form.get("league")) || url.searchParams.get("league") || 0) || null;
    // mode=ceiling swaps in the high-upside lineup for the chosen league (underdog weeks).
    const ceiling = ((form && form.get("mode")) || url.searchParams.get("mode")) === "ceiling" && !!only;
    const leagues = (await this.leagues()).filter((lg) => !only || lg.league_id === only);
    let bundles = (await Promise.all(leagues.map((lg) => this.bundle(lg.league_id)))).filter((b) => b.started);
    if (ceiling) bundles = bundles.map((b) => ({ ...b, report: { ...b.report, lineup_items: b.report.ceiling?.items || b.report.lineup_items, recommended_lineup_proj: b.report.ceiling?.lineup_proj ?? b.report.recommended_lineup_proj, ceiling_mode: true } }));
    const csrf = await this.csrf(request);
    if (request.method !== "POST") return html(lineupsPage({ bundles, results: null, only, csrf, ceiling }));
    if (!(await this.checkCsrf(request, form))) return html(errorPage("Form expired. Go back and try again.", true), 400);
    const results = [];
    for (const b of bundles) {
      const items = b.report.lineup_items;
      const result = await this.espn.applyLineup(this.fetchFn, this.cookies(s), s.season, b.league_id, b.team_id, b.week, items);
      results.push({ name: b.name, items, result });
      if (items.length) await this.logActivity({ kind: "lineup", league: b.name, league_id: b.league_id, week: b.week, ok: result.ok, message: result.message, changes: items.length, items: items.map((it) => `${it.name} ${it.from}→${it.to}`), by: "you" });
    }
    await this.clearCache();
    return html(lineupsPage({ bundles, results, only, csrf }));
  }

  /**
   * Offers other managers sent us. Accept when the deal is clearly good and safe (gain >= 2 a week, every slot still
   * filled, roster within its limit); decline when it costs us; leave the in-between for you, and say so once.
   */
  async autoRespond(b, s, log) {
    const incoming = (b.pending || []).filter((t) => !t.mine);
    if (!incoming.length || b.report.trades_closed) return false;
    const seenKey = `incoming:${b.league_id}`; const seen = (await this.storage.get(seenKey)) || {};
    let acted = false;
    for (const t of incoming) {
      if (seen[t.id]) continue;
      let decision = null;
      if (t.my_gain != null && t.my_gain < 0) decision = false;
      else if (t.my_gain != null && t.my_gain >= 2.0) {
        const mine = (b.rosters || {})[b.team_id] || [];
        const check = mine.length ? robustSet([{ ...t, with_team_id: t.with_team_id, give: t.give, get: t.get, my_gain: t.my_gain }], { mine, rosters: b.rosters || {}, slotCounts: b.report.slot_counts, rosterSize: b.report.roster_size, rosterCount: b.report.roster_count, max: 1 }) : { offers: [] };
        decision = check.offers.length === 1;
      }
      if (decision == null) {
        seen[t.id] = "ask";
        await this.logActivity({ kind: "incoming", league: b.name, league_id: b.league_id, week: b.week, ok: true, message: `${t.with} offered ${t.get_names} for ${t.give_names} (${t.my_gain == null ? "unscored" : `${t.my_gain >= 0 ? "+" : ""}${t.my_gain.toFixed(1)}/wk for you`}). Your call: accept or decline on the league page.`, by: "espn" });
        continue;
      }
      const result = await this.espn.respondTrade(this.fetchFn, this.cookies(s), s.season, b.league_id, b.team_id, t.id, decision);
      seen[t.id] = decision ? "accepted" : "declined";
      log({ kind: decision ? "accept" : "decline", ok: result.ok, with: t.with, message: result.message });
      await this.logActivity({ kind: "incoming", league: b.name, league_id: b.league_id, week: b.week, ok: result.ok, message: `${decision ? "Accepted" : "Declined"} ${t.with}'s offer of ${t.get_names} for ${t.give_names} (${t.my_gain >= 0 ? "+" : ""}${t.my_gain.toFixed(1)}/wk for you).${result.ok ? "" : ` ESPN said: ${result.message}`}`, by: "auto" });
      acted = true;
    }
    await this.storage.put(seenKey, seen);
    return acted;
  }

  /** Manual accept or decline of an incoming offer. */
  async respond(request) {
    const s = await this.settings();
    const form = await request.formData();
    if (!(await this.checkCsrf(request, form))) return html(errorPage("Form expired. Go back and try again.", true), 400);
    const leagueId = Number(form.get("league") || 0), txId = String(form.get("tx") || ""), accept = form.get("action") === "accept";
    const b = await this.bundle(leagueId);
    const t = (b.pending || []).find((x) => String(x.id) === txId && !x.mine);
    if (!t) return html(errorPage("That offer is not pending, or it is one of yours.", true), 404);
    const result = await this.espn.respondTrade(this.fetchFn, this.cookies(s), s.season, b.league_id, b.team_id, t.id, accept);
    const seen = (await this.storage.get(`incoming:${b.league_id}`)) || {}; seen[t.id] = accept ? "accepted" : "declined"; await this.storage.put(`incoming:${b.league_id}`, seen);
    await this.logActivity({ kind: "incoming", league: b.name, league_id: b.league_id, week: b.week, ok: result.ok, message: `${accept ? "Accepted" : "Declined"} ${t.with}'s offer of ${t.get_names} for ${t.give_names}.${result.ok ? "" : ` ESPN said: ${result.message}`}`, by: "you" });
    await this.clearCache();
    return html(errorPage(result.ok ? `${accept ? "Accepted" : "Declined"}: ${t.get_names} for ${t.give_names} from ${t.with}.` : result.message, true), result.ok ? 200 : 502);
  }

  /** "Run autopilot now": the same pass the cron makes, on demand. */
  async runNow(request) {
    const form = await request.formData();
    if (!(await this.checkCsrf(request, form))) return html(errorPage("Form expired. Go back and try again.", true), 400);
    const s = await this.settings();
    if (!s.automanage) return redirect("/?ran=off");
    const leagues = await this.leagues(true);
    let acted = 0;
    for (const lg of leagues) {
      if (s.hidden.includes(lg.league_id)) continue;
      try { const b = await this.bundle(lg.league_id, true); if (b.started && (await this.autoManage(b, s))) acted++; await this.noteAuth(true); }
      catch (e) { console.warn("run now failed", lg.league_name, e?.message); if (/\b401\b|cookies/i.test(e?.message || "")) await this.noteAuth(false, e.message); }
    }
    return redirect(`/?ran=${acted}`);
  }

  /** Hide a league from the dashboard (an orphaned one, say) or show it again. */
  async hide(request) {
    const form = await request.formData();
    if (!(await this.checkCsrf(request, form))) return html(errorPage("Form expired. Go back and try again.", true), 400);
    const id = Number(form.get("league") || 0), show = form.get("action") === "show";
    if (!id) return html(errorPage("No league given.", true), 400);
    const s = await this.settings();
    const hidden = new Set(s.hidden);
    if (show) hidden.delete(id); else hidden.add(id);
    await this.savePrefs({ hidden: [...hidden] });
    return redirect(show ? "/settings" : "/");
  }

  /** Preview, then send, one trade proposal the advisor computed. Only proposals in the cached bundle can be sent. */
  async trade(request, url) {
    const s = await this.settings();
    const form = request.method === "POST" ? await request.formData() : null;
    const leagueId = Number((form && form.get("league")) || url.searchParams.get("league") || 0);
    const id = (form && form.get("id")) || url.searchParams.get("id") || "";
    if (!leagueId || !id) return html(errorPage("That trade link is incomplete. Go back to the league page and pick a trade.", true), 404);
    const b = await this.bundle(leagueId);
    const trade = (b.trades || []).find((t) => t.id === id);
    if (!trade) return html(errorPage("That trade is no longer on the board; projections or rosters changed since the page was built. Go back to the league page for the current ideas.", true), 404);
    const csrf = await this.csrf(request);
    if (request.method !== "POST") return html(tradePage(b, trade, csrf));
    if (!(await this.checkCsrf(request, form))) return html(errorPage("Form expired. Go back and try again.", true), 400);
    const give = trade.give.map((p) => p.player_id), get = trade.get.map((p) => p.player_id);
    if (trade.with_team_id == null || give.some((x) => x == null) || get.some((x) => x == null)) return html(errorPage("ESPN ids are missing for this trade, so it cannot be sent from here. Propose it on ESPN by hand.", true));
    const result = await this.espn.proposeTrade(this.fetchFn, this.cookies(s), s.season, b.league_id, b.team_id, b.week, trade.with_team_id, give, get);
    await this.logActivity({ kind: "trade", league: b.name, league_id: b.league_id, week: b.week, ok: result.ok, message: result.message, with: trade.with, give: trade.give_names, get: trade.get_names, my_gain: trade.my_gain, their_gain: trade.their_gain, by: "you" });
    await this.clearCache();
    return html(tradePage(b, trade, csrf, result));
  }

  /** Several offers to several managers in one go: the non-overlapping best set, each one sent as its own ESPN proposal. */
  async blitz(request, url) {
    const s = await this.settings();
    const form = request.method === "POST" ? await request.formData() : null;
    const leagueId = Number((form && form.get("league")) || url.searchParams.get("league") || 0);
    if (!leagueId) return html(errorPage("Pick a league first.", true), 404);
    const b = await this.bundle(leagueId);
    if (!b.started) return html(errorPage(`${b.name} has not started this season.`, true));
    const plan = this.blitzPlan(b);
    // The form may override the plan (Adjust); otherwise the plan is exactly what gets sent.
    const keep = form && form.get("adjusted") === "1" ? new Set(form.getAll("withdraw")) : new Set(plan.withdraw.map((t) => String(t.id)));
    const picks = plan.offers;
    const csrf = await this.csrf(request);
    if (request.method !== "POST") return html(blitzPage(b, picks, csrf, { plan, moves: this.waiverMoves(b) }));
    if (!(await this.checkCsrf(request, form))) return html(errorPage("Form expired. Go back and try again.", true), 400);
    const adjusted = form.get("adjusted") === "1";
    const chosen = adjusted ? new Set(form.getAll("id")) : new Set(picks.map((t) => t.id));
    const toSend = picks.filter((t) => chosen.has(t.id));
    const wantMoves = adjusted ? form.getAll("move") : plan.moves.map((m) => String(m.player_id));
    const moves = this.waiverMoves(b).filter((m) => wantMoves.includes(String(m.player_id)));
    if (!toSend.length && !moves.length && !keep.size) return html(blitzPage(b, picks, csrf, { flash: "Nothing to send: the board has no offer that is safe whichever way it goes.", plan, moves: this.waiverMoves(b) }));
    const results = [];
    for (const m of moves) {
      const result = await this.espn.addPlayer(this.fetchFn, this.cookies(s), s.season, b.league_id, b.team_id, b.week, { addId: m.player_id, dropId: m.drop ? m.drop.player_id : null, waiver: m.on_waivers, bid: 0 });
      await this.logActivity({ kind: m.on_waivers ? "claim" : "add", league: b.name, league_id: b.league_id, week: b.week, ok: result.ok, message: result.message, add: m.name, drop: m.drop ? m.drop.name : null, bid: m.on_waivers ? 0 : null, by: "you" });
      results.push({ move: m, result });
    }
    // Withdraw first, so the replacements are not blocked by the offers they replace.
    const stillBusy = new Set();
    for (const id of keep) {
      const p = (b.pending || []).find((t) => String(t.id) === id);
      if (!p || !p.mine) continue;
      const result = await this.espn.cancelTrade(this.fetchFn, this.cookies(s), s.season, b.league_id, b.team_id, p.id);
      await this.logActivity({ kind: "withdraw", league: b.name, league_id: b.league_id, week: b.week, ok: result.ok, message: result.message, with: p.with, give: p.give_names, get: p.get_names, by: "you" });
      results.push({ trade: p, result, withdrawn: true });
      if (!result.ok) for (const x of [...p.give_ids, ...p.get_ids]) stillBusy.add(x);
    }
    for (const t of toSend) {
      if ([...t.give, ...t.get].some((p) => stillBusy.has(p.player_id))) { results.push({ trade: t, result: { ok: false, message: "Not sent: it overlaps an offer that could not be withdrawn." } }); continue; }
      const give = t.give.map((p) => p.player_id), get = t.get.map((p) => p.player_id);
      let result;
      if (give.some((x) => x == null) || get.some((x) => x == null)) result = { ok: false, message: "ESPN ids missing for this offer; propose it on ESPN by hand." };
      else result = await this.espn.proposeTrade(this.fetchFn, this.cookies(s), s.season, b.league_id, b.team_id, b.week, t.with_team_id, give, get);
      await this.logActivity({ kind: "trade", league: b.name, league_id: b.league_id, week: b.week, ok: result.ok, message: result.message, with: t.with, give: t.give_names, get: t.get_names, my_gain: t.my_gain, their_gain: t.their_gain, by: "you" });
      results.push({ trade: t, result });
    }
    await this.clearCache();
    return html(blitzPage(b, picks, csrf, { results }));
  }

  /**
   * The one-button plan: withdraw pending offers the engine now rates as likely declined or clearly beaten, then send
   * the robust set of new offers (safe under any combination of acceptances), and make the waiver moves that fill
   * real holes. Everything else is left alone.
   */
  blitzPlan(b) {
    const r = b.report, mine = (b.rosters || {})[b.team_id] || [];
    const REPLACE_MARGIN = 1.0, STALE_GAIN = 0.5;
    const pending = (b.pending || []).filter((t) => t.mine);
    const robust = (busy) => mine.length ? robustSet(b.trades || [], { mine, rosters: b.rosters || {}, slotCounts: r.slot_counts, rosterSize: r.roster_size, rosterCount: r.roster_count, busy, max: 4 })
      : { offers: blitzSet(b.trades || [], { busy, max: 4 }), if_all_accepted: null, robust: false };
    const gainOf = (set) => set.offers.reduce((s, t) => s + t.my_gain, 0);
    const busyOf = (keep) => new Set(keep.flatMap((t) => [...t.give_ids, ...t.get_ids]));
    // 1. Offers that will not be accepted, or whose value to you has collapsed, come back.
    const withdraw = pending.filter((t) => t.acceptable === false || (t.my_gain != null && t.my_gain < STALE_GAIN));
    const why = withdraw.map((t) => t.acceptable === false ? `${t.give_names} for ${t.get_names} to ${t.with}: the other side comes out behind, so it is not going to be accepted.`
      : `${t.give_names} for ${t.get_names} to ${t.with}: it is now worth only ${t.my_gain.toFixed(1)} a week to you.`);
    // 2. Every other active offer is re-examined: if freeing its players lets a clearly better set go out, replace it.
    let keep = pending.filter((t) => !withdraw.includes(t));
    let set = robust(busyOf(keep));
    let improved = true;
    while (improved) {
      improved = false;
      for (const t of keep) {
        const without = keep.filter((x) => x !== t);
        const alt = robust(busyOf(without));
        if (gainOf(alt) >= gainOf(set) + (t.my_gain || 0) + REPLACE_MARGIN) {
          withdraw.push(t); why.push(`${t.give_names} for ${t.get_names} to ${t.with}: a better use of ${t.give_names} is on the board (${gainOf(alt).toFixed(1)} a week against ${(gainOf(set) + (t.my_gain || 0)).toFixed(1)}).`);
          keep = without; set = alt; improved = true; break;
        }
      }
    }
    // Never burn a roster spot on one-week bye cover automatically; real holes and clear upgrades only.
    const inOffers = new Set([...set.offers.flatMap((t) => t.give.map((p) => p.player_id)), ...keep.flatMap((t) => t.give_ids || [])]);
    const moves = this.waiverMoves(b).filter((m) => !m.bye_cover && (m.fills_empty_slot || m.edge >= 2) && !(m.drop && inOffers.has(m.drop.player_id)));
    return { withdraw, offers: set.offers, if_all_accepted: set.if_all_accepted, robust: set.robust, moves, why };
  }

  /** The top waiver move per position, each with its drop chosen the same way the add page would: cheapest non-starter first. */
  waiverMoves(b) {
    const r = b.report, cands = (r.drop_candidates || []).filter((c) => !c.starter);
    const out = []; const used = new Set();
    for (const [pos, picks] of Object.entries(r.waivers || {})) {
      const p = picks.find((x) => !x.error && x.player_id != null);
      if (!p) continue;
      let drop = null;
      if (r.open_spots - out.filter((m) => !m.drop).length <= 0) { drop = cands.find((c) => !used.has(c.player_id)) || null; if (!drop) continue; used.add(drop.player_id); }
      out.push({ ...p, pos: p.pos || pos, drop });
    }
    return out.sort((a, b) => ((b.fills_empty_slot && !b.bye_cover) - (a.fills_empty_slot && !a.bye_cover)) || (b.edge - a.edge));
  }

  /** Withdraw one pending offer of yours. */
  async withdraw(request) {
    const s = await this.settings();
    const form = await request.formData();
    if (!(await this.checkCsrf(request, form))) return html(errorPage("Form expired. Go back and try again.", true), 400);
    const leagueId = Number(form.get("league") || 0), txId = String(form.get("tx") || "");
    const b = await this.bundle(leagueId);
    const p = (b.pending || []).find((t) => String(t.id) === txId && t.mine);
    if (!p) return html(errorPage("That offer is not one of yours, or it is no longer pending.", true), 404);
    const result = await this.espn.cancelTrade(this.fetchFn, this.cookies(s), s.season, b.league_id, b.team_id, p.id);
    await this.logActivity({ kind: "withdraw", league: b.name, league_id: b.league_id, week: b.week, ok: result.ok, message: result.message, with: p.with, give: p.give_names, get: p.get_names, by: "you" });
    await this.clearCache();
    return html(errorPage(result.ok ? `Withdrawn: ${p.give_names} for ${p.get_names} to ${p.with}.` : result.message, true), result.ok ? 200 : 502);
  }

  /**
   * FAAB bid suggestion (see RESEARCH.md): nothing for streaming D/ST or K; otherwise a share of the original budget
   * from the edge and whether the slot is a real hole, scaled up as the season runs down (unspent budget is worthless),
   * nudged just above a round number, capped by what is left.
   */
  suggestBid(b, pick) {
    const r = b.report; if (r.budget_left == null) return null;
    if (["D/ST", "K"].includes(pick.pos)) return 0;
    const budget = r.acquisition?.budget || 100;
    let pct = pick.fills_empty_slot && !pick.bye_cover ? 0.12 : Math.min(0.25, 0.04 + (pick.edge || 0) * 0.02);
    const weeksLeft = b.season?.weeks_left || 8;
    pct *= 1 + Math.max(0, (14 - weeksLeft) / 14) * 0.6;
    let bid = Math.round(budget * pct);
    if (bid > 0 && bid % 5 === 0) bid += 1;
    return Math.max(0, Math.min(r.budget_left, bid));
  }

  /** Preview, then submit, a free-agent add or waiver claim, dropping someone if the roster is full. */
  async add(request, url) {
    const s = await this.settings();
    const form = request.method === "POST" ? await request.formData() : null;
    const get = (k) => (form && form.get(k)) ?? url.searchParams.get(k) ?? "";
    const leagueId = Number(get("league") || 0), playerId = Number(get("player") || 0);
    if (!leagueId || !playerId) return html(errorPage("That add link is incomplete. Go back to the league page and pick a player.", true), 404);
    const b = await this.bundle(leagueId);
    const pick = Object.values(b.report?.waivers || {}).flat().find((p) => !p.error && p.player_id === playerId);
    if (!pick) return html(errorPage("That player is no longer on the waiver watch; someone may have picked him up, or projections moved. Go back to the league page for the current list.", true), 404);
    const r = b.report, candidates = r.drop_candidates || [];
    const dropId = get("drop") === "" ? (r.open_spots > 0 ? null : candidates[0]?.player_id ?? null) : Number(get("drop"));
    const drop = dropId == null ? null : candidates.find((c) => c.player_id === dropId) || null;
    const suggested = this.suggestBid(b, pick);
    const bid = get("bid") === "" || get("bid") == null ? (suggested ?? 0) : Math.max(0, Math.floor(Number(get("bid")) || 0));
    const csrf = await this.csrf(request);
    const state = { drop, bid, waiver: !!pick.on_waivers, suggested };
    if (request.method !== "POST") return html(addPage(b, pick, csrf, state));
    if (!(await this.checkCsrf(request, form))) return html(errorPage("Form expired. Go back and try again.", true), 400);
    if (dropId != null && !drop) return html(addPage(b, pick, csrf, { ...state, flash: "Pick a drop from the list." }));
    if (!drop && r.open_spots <= 0) return html(addPage(b, pick, csrf, { ...state, flash: "Your roster is full, so you have to drop someone to add him." }));
    if (r.budget_left != null && bid > r.budget_left) return html(addPage(b, pick, csrf, { ...state, flash: `You only have $${r.budget_left} of waiver budget left.` }));
    const result = await this.espn.addPlayer(this.fetchFn, this.cookies(s), s.season, b.league_id, b.team_id, b.week,
      { addId: pick.player_id, dropId: drop ? drop.player_id : null, waiver: !!pick.on_waivers, bid });
    await this.logActivity({ kind: pick.on_waivers ? "claim" : "add", league: b.name, league_id: b.league_id, week: b.week, ok: result.ok, message: result.message, add: pick.name, drop: drop ? drop.name : null, bid: pick.on_waivers ? bid : null, by: "you" });
    await this.clearCache();
    return html(addPage(b, pick, csrf, { ...state, result }));
  }

  async settingsPage(request) {
    const s = await this.settings();
    s.claude = { ...this.claudeConfig(), hasKey: !!this.env.ANTHROPIC_API_KEY, today: await this.claudeCallsToday() };
    s.cacheSeconds = this.cacheSeconds;
    try {
      const all = await this.leagues();
      s.hidden_leagues = all.filter((lg) => s.hidden.includes(lg.league_id)).map((lg) => ({ id: lg.league_id, name: lg.league_name }));
      s.auto_leagues = all.filter((lg) => !s.hidden.includes(lg.league_id)).map((lg) => ({ id: lg.league_id, name: lg.league_name, on: s.league_auto[String(lg.league_id)] !== false }));
    } catch { s.hidden_leagues = s.hidden.map((id) => ({ id, name: `League ${id}` })); s.auto_leagues = []; }
    const csrf = await this.csrf(request);
    if (request.method === "POST") {
      const form = await request.formData();
      if (!(await this.checkCsrf(request, form))) return html(errorPage("Form expired. Go back and try again.", true), 400);
      if (form.get("prefs") === "1") {
        const league_auto = {};
        for (const [k, v] of form.entries()) { const m = /^league_auto_(\d+)$/.exec(k); if (m) league_auto[m[1]] = v === "1"; }
        await this.savePrefs({ automanage: form.get("automanage") === "1", auto_lineup: form.get("auto_lineup") === "1", auto_fill_empty: form.get("auto_fill_empty") === "1", auto_trades: form.get("auto_trades") === "1", league_auto: { ...s.league_auto, ...league_auto } });
        return redirect("/settings?prefs=saved");
      }
      const espn_s2 = (form.get("espn_s2") || "").trim(), swid = (form.get("swid") || "").trim();
      if (!(espn_s2 && swid)) return html(settingsPage(s, csrf, ["Both cookies are required."]));
      let leagues;
      try { leagues = await this.espn.discoverLeagues(this.fetchFn, { espn_s2, swid }, s.season); }
      catch (e) { return html(settingsPage(s, csrf, [e?.message || String(e)])); }
      await this.storage.put("settings", { espn_s2, swid });
      await this.noteAuth(true);
      await this.clearCache();
      return redirect(`/?saved=${leagues.length}`);
    }
    return html(settingsPage(s, csrf, new URL(request.url).searchParams.get("prefs") === "saved" ? ["Preferences saved."] : []));
  }

  /** Called by the cron trigger to pre-build every league before game days, and to set lineups automatically. */
  async warm(request) {
    if (!timingSafeEqual(request.headers.get("x-warm-key") || "", this.env.SECRET_KEY || "x")) return new Response("no", { status: 403 });
    const s = await this.settings();
    const leagues = await this.leagues(true);
    let acted = 0;
    for (const lg of leagues) {
      if (s.hidden.includes(lg.league_id)) continue;
      try {
        const b = await this.bundle(lg.league_id, true);
        if (b.started && (await this.autoManage(b, s))) acted++;
        await this.noteAuth(true);
      } catch (e) {
        console.warn("warm failed", lg.league_name, e?.message);
        if (/\b401\b|cookies/i.test(e?.message || "")) await this.noteAuth(false, e.message);
      }
    }
    return new Response(`warmed ${leagues.length}, auto-managed ${acted}`);
  }

  /**
   * Automatic management for one league, run from the cron. Sets the lineup to the recommendation, but only while the
   * lineup still matches what we last set this week: if you moved anyone on ESPN since, your override stands.
   * With auto_fill_empty on, also fills a starting slot that has nobody eligible with the best free agent, dropping the
   * lowest-value bench player. Returns true when anything was sent to ESPN. Everything is logged under auto:<league>:<week>.
   */
  async autoManage(b, s) {
    if (!this.autoFor(s, b.league_id)) return false;
    const r = b.report, key = `auto:${b.league_id}:${b.week}`;
    const prev = (await this.storage.get(key)) || { week: b.week, events: [] };
    const slots = {}; for (const p of [...Object.values(r.recommended).flat(), ...r.bench]) if (p.name) slots[p.name] = p.slot;
    const log = (e) => { prev.events.push({ at: this.now(), ...e }); };
    let acted = false;
    if (s.auto_lineup && r.lineup_items.length) {
      const overridden = prev.target && Object.entries(prev.target).some(([name, slot]) => name in slots && slots[name] !== slot);
      if (overridden) log({ kind: "lineup", skipped: true, message: "Left alone: the lineup was changed on ESPN after the last automatic set." });
      else {
        const result = await this.espn.applyLineup(this.fetchFn, this.cookies(s), s.season, b.league_id, b.team_id, b.week, r.lineup_items);
        prev.target = { ...slots }; for (const it of r.lineup_items) prev.target[it.name] = it.to;
        log({ kind: "lineup", ok: result.ok, changes: r.lineup_items.length, message: result.message, items: r.lineup_items.map((it) => `${it.name} ${it.from}→${it.to}`) });
        await this.logActivity({ kind: "lineup", league: b.name, league_id: b.league_id, week: b.week, ok: result.ok, message: result.message, changes: r.lineup_items.length, items: r.lineup_items.map((it) => `${it.name} ${it.from}→${it.to}`), by: "auto" });
        acted = true;
      }
    }
    if (s.auto_fill_empty && !prev.filled) {
      const pick = Object.values(r.waivers).flat().find((p) => !p.error && p.fills_empty_slot && !p.bye_cover && p.player_id != null && !p.on_waivers);
      const drop = r.open_spots > 0 ? null : (r.drop_candidates || []).find((c) => !c.starter) || null;
      if (pick && (drop || r.open_spots > 0)) {
        const result = await this.espn.addPlayer(this.fetchFn, this.cookies(s), s.season, b.league_id, b.team_id, b.week, { addId: pick.player_id, dropId: drop ? drop.player_id : null, waiver: false, bid: 0 });
        prev.filled = true;
        log({ kind: "add", ok: result.ok, message: result.message, add: pick.name, drop: drop ? drop.name : null });
        await this.logActivity({ kind: "add", league: b.name, league_id: b.league_id, week: b.week, ok: result.ok, message: result.message, add: pick.name, drop: drop ? drop.name : null, by: "auto" });
        acted = true;
      }
    }
    // Trades first, so pickups can avoid dropping anyone who is in an offer (sent now or already out).
    if (s.auto_trades) { if (await this.autoTrades(b, s, log)) acted = true; if (await this.autoRespond(b, s, log)) acted = true; }
    if (s.auto_fill_empty) {
      // The plan's pickups: real holes and clear upgrades, drops never a recommended starter, never bye cover.
      // Claims are conditional on ESPN's side (the drop only happens if the claim wins); at most two per run, no repeats this week.
      const claimed = new Set(prev.claimed || []);
      let made = 0;
      const inOffers = new Set([...(b.pending || []).flatMap((t) => [...(t.give_ids || []), ...(t.get_ids || [])]), ...(prev.offered_players || [])]);
      for (const m of this.blitzPlan(b).moves) {
        if (made >= 2) break;
        if (claimed.has(m.player_id)) continue;
        if (!m.drop && r.open_spots <= 0) continue;
        if (m.drop && inOffers.has(m.drop.player_id)) continue; // never drop a player who is in an offer
        const bid = m.on_waivers ? (this.suggestBid(b, m) ?? 0) : 0;
        const result = await this.espn.addPlayer(this.fetchFn, this.cookies(s), s.season, b.league_id, b.team_id, b.week, { addId: m.player_id, dropId: m.drop ? m.drop.player_id : null, waiver: !!m.on_waivers, bid });
        claimed.add(m.player_id); made++;
        log({ kind: m.on_waivers ? "claim" : "add", ok: result.ok, message: result.message, add: m.name, drop: m.drop ? m.drop.name : null });
        await this.logActivity({ kind: m.on_waivers ? "claim" : "add", league: b.name, league_id: b.league_id, week: b.week, ok: result.ok, message: result.message, add: m.name, drop: m.drop ? m.drop.name : null, bid: m.on_waivers ? bid : null, by: "auto" });
        acted = true;
      }
      prev.claimed = [...claimed];
    }
    const latest = (await this.storage.get(key)) || {};
    await this.storage.put(key, { ...prev, offered_players: latest.offered_players || prev.offered_players || [] });
    if (acted) { this.mem.delete(`league:${b.league_id}`); await this.storage.delete(`league:${b.league_id}`); }
    return acted;
  }

  /**
   * Autopilot for trades. Withdraws our pending offers the engine now rates as likely declined, then sends the robust
   * plan's offers, subject to: gain of at least AUTO_MIN_GAIN a week, at most AUTO_MAX_OPEN offers out per league,
   * a package declined or expired in the last 7 days is not re-sent, and a manager who declined gets 48 hours of quiet.
   */
  async autoTrades(b, s, log) {
    if (b.report.trades_closed) return false;
    const AUTO_MIN_GAIN = 2.0, AUTO_MAX_OPEN = 3, WEEK = 7 * 86400e3, COOLDOWN = 48 * 3600e3;
    const stKey = `autotrade:${b.league_id}`;
    const st = (await this.storage.get(stKey)) || { declined: {}, cooldown: {}, offered: {} };
    const plan = this.blitzPlan(b);
    let acted = false, open = (b.pending || []).filter((t) => t.mine).length;
    // Players in offers that could not be withdrawn stay busy: no replacement goes out over a live offer.
    const stillBusy = new Set(), stillWith = new Set();
    for (const p of plan.withdraw) {
      const result = await this.espn.cancelTrade(this.fetchFn, this.cookies(s), s.season, b.league_id, b.team_id, p.id);
      await this.logActivity({ kind: "withdraw", league: b.name, league_id: b.league_id, week: b.week, ok: result.ok, message: result.message, with: p.with, give: p.give_names, get: p.get_names, by: "auto" });
      log({ kind: "withdraw", ok: result.ok, with: p.with, message: result.message });
      if (result.ok) open--; else { for (const id of [...p.give_ids, ...p.get_ids]) stillBusy.add(id); stillWith.add(p.with_team_id); }
      acted = true;
    }
    const prevLog = (await this.storage.get(`auto:${b.league_id}:${b.week}`)) || {};
    const offeredPlayers = new Set(prevLog.offered_players || []);
    for (const t of plan.offers) {
      if (open >= AUTO_MAX_OPEN) break;
      if (stillWith.has(t.with_team_id) || [...t.give, ...t.get].some((p) => stillBusy.has(p.player_id))) continue;
      if (t.my_gain < AUTO_MIN_GAIN) continue;
      const give = t.give.map((p) => p.player_id), get = t.get.map((p) => p.player_id);
      if (give.some((x) => x == null) || get.some((x) => x == null)) continue;
      const pkg = [...give].sort().join("+") + ">" + [...get].sort().join("+");
      if (st.declined[pkg] && this.now() - st.declined[pkg] < WEEK) continue;
      if (st.offered[pkg] && this.now() - st.offered[pkg] < WEEK) continue;
      if (st.cooldown[t.with_team_id] && this.now() - st.cooldown[t.with_team_id] < COOLDOWN) continue;
      const result = await this.espn.proposeTrade(this.fetchFn, this.cookies(s), s.season, b.league_id, b.team_id, b.week, t.with_team_id, give, get);
      await this.logActivity({ kind: "trade", league: b.name, league_id: b.league_id, week: b.week, ok: result.ok, message: result.message, with: t.with, give: t.give_names, get: t.get_names, my_gain: t.my_gain, their_gain: t.their_gain, by: "auto" });
      log({ kind: "trade", ok: result.ok, with: t.with, give: t.give_names, get: t.get_names, message: result.message });
      st.offered[pkg] = this.now();
      if (result.ok) { open++; for (const id of give) offeredPlayers.add(id); }
      acted = true;
    }
    await this.storage.put(stKey, st);
    if (offeredPlayers.size) await this.storage.put(`auto:${b.league_id}:${b.week}`, { ...prevLog, offered_players: [...offeredPlayers] });
    return acted;
  }
}
