// The application: routing, auth, caching, and orchestration of ESPN calls.
// Runs inside one Durable Object. Pure enough to test in Node with fakes.
import * as espnMod from "./espn.js";
import { buildReport, waiverThresholds } from "./report.js";
import { playerValue, rosterPlayer, proposeTrades, blitzSet, evaluateTrade } from "./trades.js";
import { analystTake, polishTake } from "./analyst.js";
import { byeWeeks, horizonWeights, availability, simulateSeason, scheduleOutlook, positionalStrength, gamePlan } from "./season.js";
import { makeSession, verifySession, csrfFor, parseCookies, sessionCookie, clearSessionCookie, SESSION_COOKIE, timingSafeEqual } from "./auth.js";
import { loginPage, errorPage, settingsPage, indexPage, leaguePage, lineupsPage, tradePage, addPage, blitzPage } from "./html.js";

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
    s.auto_lineup = prefs.auto_lineup !== false;          // on unless switched off
    s.auto_fill_empty = prefs.auto_fill_empty === true;    // off unless switched on
    s.hidden = Array.isArray(prefs.hidden) ? prefs.hidden : [];
    return s;
  }
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
      const boxes = await this.espn.boxScores(f, c, league, week, sched, ratings, now);
      // Season context: playoff odds decide how much the playoff weeks count when valuing players.
      const odds = simulateSeason(league, { sims: 1500, seed: leagueId });
      const myOdds = odds.by_team[me.id] || null;
      const contending = (myOdds?.playoff_odds ?? 50) >= 35;
      const weights = horizonWeights(league, week, contending);
      const weeksLeft = Object.keys(weights).length;
      const byes = byeWeeks(allSched, week + 1, league.finalScoringPeriod || 17);
      const abbrToId = Object.fromEntries(Object.entries(this.espn.PRO_TEAM || {}).map(([id, ab]) => [ab, Number(id)]));
      const byesFor = (abbr) => byes[abbrToId[abbr]] || [];
      let rep = buildReport(league, me, boxes, week, now, null);
      // waivers: only the positions worth scanning
      const faByPos = {};
      const positions = Object.keys(rep.waiver_thresholds);
      const results = await pool(positions.map((pos) => async () => {
        try { return await this.espn.freeAgents(f, c, league, week, pos, sched, ratings, now); } catch (e) { return { error: e.message }; }
      }));
      positions.forEach((pos, i) => { faByPos[pos] = results[i]; });
      rep = buildReport(league, me, boxes, week, now, faByPos);
      // Trades and roster shape, valued over the rest of the season: weekly value times the share of the weighted
      // remaining weeks the player is available for (bye weeks removed, playoff weeks weighted by contention).
      let trades = [], strength = null, byesAhead = [], pending = [];
      try {
        const rosters = await this.espn.rosters(f, c, league);
        const conv = (t) => (rosters[t.id] || []).map((p) => {
          const weekly = playerValue(p.seasonProjAvg, p.seasonAvg, this.espn.gamesPlayed(t));
          const pb = byesFor(p.proTeam), avail = availability(weights, pb);
          const rp = rosterPlayer(p.name, p.position, p.eligible, p.status, Math.round(weekly * avail * 100) / 100, p.playerId, p.proTeam);
          rp.weekly = weekly; rp.avail = avail; rp.byes = pb;
          return rp;
        });
        const mine = conv(me);
        const others = Object.fromEntries(league.teams.filter((t) => t.id !== me.id).map((t) => [t.name, { id: t.id, logo: t.logo || "", players: conv(t) }]));
        trades = proposeTrades(mine, others, rep.slot_counts, { weeksLeft, horizonNote: contending ? "with the playoff weeks counted extra" : "" });
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
      const outlook = scheduleOutlook(league, me);
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
      return { ...b, report: rep, trades, pending, analyst, season, team_id: me.id, week, problem_count };
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
        await this.logActivity({ kind: "settled", league: league.name, league_id: league.id, week: league.currentWeek, ok: ["ACCEPTED", "EXECUTED"].includes(t.status), outcome: what,
          with: t.with, give: names(t.give, mine), get: names(t.get, byTeamId[t.with_team_id] || []), mine: t.mine, by: "espn", message: `${t.mine ? "Your offer to" : "The offer from"} ${t.with} was ${what}.` });
      }
    }
    await this.storage.put(key, next);
  }

  // ------------------------------------------------------------ activity log
  /** Everything the app ever sends to ESPN, newest first, capped at 200 entries. */
  async logActivity(entry) {
    const log = (await this.storage.get("activity")) || [];
    log.unshift({ at: this.now(), ...entry });
    await this.storage.put("activity", log.slice(0, 200));
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
      if (path === "/health") return new Response("ok");
      if (path === "/login") return this.login(request, url);
      if (path === "/logout" && request.method === "POST") return redirect("/login", { "set-cookie": clearSessionCookie() });
      if (!(await this.authed(request))) return redirect(`/login?next=${encodeURIComponent(path)}`);
      if (path === "/") return this.index(url, request);
      if (path.startsWith("/league/")) return this.league(Number(path.split("/")[2]), url);
      if (path === "/lineups") return this.lineups(request, url);
      if (path === "/trade") return this.trade(request, url);
      if (path === "/trades") return this.blitz(request, url);
      if (path === "/withdraw" && request.method === "POST") return this.withdraw(request);
      if (path === "/add") return this.add(request, url);
      if (path === "/hide" && request.method === "POST") return this.hide(request);
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
    for (const lg of leagues) {
      if (s.hidden.includes(lg.league_id)) continue;
      try {
        const b = await this.bundle(lg.league_id, force);
        if (b.started) b.auto = await this.storage.get(`auto:${b.league_id}:${b.week}`);
        bundles.push(b);
      } catch (e) { errors.push(`${lg.league_name}: ${e?.message || e}`); }
    }
    bundles.sort((a, b) => (a.started === b.started ? a.name.localeCompare(b.name) : a.started ? -1 : 1));
    const totalMoves = bundles.reduce((n, b) => n + (b.report ? b.report.lineup_items.length : 0), 0);
    const saved = url.searchParams.get("saved");
    if (saved) errors.unshift(`Saved. ESPN reports ${saved} league(s) for this account.`);
    return html(indexPage({ bundles, errors, totalMoves, season: s.season, now: this.now(), csrf: await this.csrf(url.request || new Request(url.href)), hiddenCount: s.hidden.length, activity: (await this.activity()).slice(0, 12) }));
  }

  async league(id, url) {
    if (!id) return html(errorPage("Bad league id.", true), 404);
    const b = await this.bundle(id, url.searchParams.get("refresh") === "1");
    if (!b.started) return html(errorPage(`${b.name} has not started this season.`, true));
    return html(leaguePage(b));
  }

  async lineups(request, url) {
    const s = await this.settings();
    const form = request.method === "POST" ? await request.formData() : null;
    const only = Number((form && form.get("league")) || url.searchParams.get("league") || 0) || null;
    const leagues = (await this.leagues()).filter((lg) => !only || lg.league_id === only);
    const bundles = (await Promise.all(leagues.map((lg) => this.bundle(lg.league_id)))).filter((b) => b.started);
    const csrf = await this.csrf(request);
    if (request.method !== "POST") return html(lineupsPage({ bundles, results: null, only, csrf }));
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
    // Players already in a pending offer stay out of new offers unless that offer is withdrawn first.
    const keep = form ? new Set(form.getAll("withdraw")) : new Set();
    const busy = new Set((b.pending || []).filter((t) => !keep.has(String(t.id))).flatMap((t) => [...t.give_ids, ...t.get_ids]));
    const picks = blitzSet(b.trades || [], { busy });
    const csrf = await this.csrf(request);
    if (request.method !== "POST") return html(blitzPage(b, blitzSet(b.trades || [], { busy: new Set((b.pending || []).flatMap((t) => [...t.give_ids, ...t.get_ids])) }), csrf, { freed: blitzSet(b.trades || []), moves: this.waiverMoves(b) }));
    if (!(await this.checkCsrf(request, form))) return html(errorPage("Form expired. Go back and try again.", true), 400);
    const chosen = new Set(form.getAll("id"));
    const toSend = picks.filter((t) => chosen.has(t.id));
    const moves = this.waiverMoves(b).filter((m) => form.getAll("move").includes(String(m.player_id)));
    if (!toSend.length && !moves.length && !keep.size) return html(blitzPage(b, picks, csrf, { flash: "Tick at least one offer or waiver move to send.", moves: this.waiverMoves(b) }));
    const results = [];
    for (const m of moves) {
      const result = await this.espn.addPlayer(this.fetchFn, this.cookies(s), s.season, b.league_id, b.team_id, b.week, { addId: m.player_id, dropId: m.drop ? m.drop.player_id : null, waiver: m.on_waivers, bid: 0 });
      await this.logActivity({ kind: m.on_waivers ? "claim" : "add", league: b.name, league_id: b.league_id, week: b.week, ok: result.ok, message: result.message, add: m.name, drop: m.drop ? m.drop.name : null, bid: m.on_waivers ? 0 : null, by: "you" });
      results.push({ move: m, result });
    }
    // Withdraw first, so the replacements are not blocked by the offers they replace.
    for (const id of keep) {
      const p = (b.pending || []).find((t) => String(t.id) === id);
      if (!p || !p.mine) continue;
      const result = await this.espn.cancelTrade(this.fetchFn, this.cookies(s), s.season, b.league_id, b.team_id, p.id);
      await this.logActivity({ kind: "withdraw", league: b.name, league_id: b.league_id, week: b.week, ok: result.ok, message: result.message, with: p.with, give: p.give_names, get: p.get_names, by: "you" });
      results.push({ trade: p, result, withdrawn: true });
    }
    for (const t of toSend) {
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
    const bid = Math.max(0, Math.floor(Number(get("bid")) || 0));
    const csrf = await this.csrf(request);
    const state = { drop, bid, waiver: !!pick.on_waivers };
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
    try { s.hidden_leagues = (await this.leagues()).filter((lg) => s.hidden.includes(lg.league_id)).map((lg) => ({ id: lg.league_id, name: lg.league_name })); } catch { s.hidden_leagues = s.hidden.map((id) => ({ id, name: `League ${id}` })); }
    const csrf = await this.csrf(request);
    if (request.method === "POST") {
      const form = await request.formData();
      if (!(await this.checkCsrf(request, form))) return html(errorPage("Form expired. Go back and try again.", true), 400);
      if (form.get("prefs") === "1") {
        await this.savePrefs({ auto_lineup: form.get("auto_lineup") === "1", auto_fill_empty: form.get("auto_fill_empty") === "1" });
        return redirect("/settings?prefs=saved");
      }
      const espn_s2 = (form.get("espn_s2") || "").trim(), swid = (form.get("swid") || "").trim();
      if (!(espn_s2 && swid)) return html(settingsPage(s, csrf, ["Both cookies are required."]));
      let leagues;
      try { leagues = await this.espn.discoverLeagues(this.fetchFn, { espn_s2, swid }, s.season); }
      catch (e) { return html(settingsPage(s, csrf, [e?.message || String(e)])); }
      await this.storage.put("settings", { espn_s2, swid });
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
      } catch (e) { console.warn("warm failed", lg.league_name, e?.message); }
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
    await this.storage.put(key, prev);
    if (acted) { this.mem.delete(`league:${b.league_id}`); await this.storage.delete(`league:${b.league_id}`); }
    return acted;
  }
}
