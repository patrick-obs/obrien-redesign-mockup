// The application: routing, auth, caching, and orchestration of ESPN calls.
// Runs inside one Durable Object. Pure enough to test in Node with fakes.
import * as espnMod from "./espn.js";
import { buildReport, waiverThresholds } from "./report.js";
import { playerValue, rosterPlayer, proposeTrades } from "./trades.js";
import { analystTake, polishTake } from "./analyst.js";
import { makeSession, verifySession, csrfFor, parseCookies, sessionCookie, clearSessionCookie, SESSION_COOKIE, timingSafeEqual } from "./auth.js";
import { loginPage, errorPage, settingsPage, indexPage, leaguePage, lineupsPage, tradePage, addPage } from "./html.js";

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
    return s;
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
      const b = { league_id: leagueId, name: league.name, started: league.started };
      if (!league.started) return b;
      const me = this.espn.findTeam(league, s.swid, null);
      const week = league.currentWeek;
      const [allSched, ratings] = await Promise.all([
        this.cached(`prosched:${s.season}`, 6 * 3600, false, () => this.espn.proSchedule(f, c, s.season)),
        this.espn.positionalRatings(f, c, s.season, leagueId, week),
      ]);
      const sched = this.espn.proScheduleForWeek(allSched, week);
      const boxes = await this.espn.boxScores(f, c, league, week, sched, ratings, now);
      let rep = buildReport(league, me, boxes, week, now, null);
      // waivers: only the positions worth scanning
      const faByPos = {};
      const positions = Object.keys(rep.waiver_thresholds);
      const results = await pool(positions.map((pos) => async () => {
        try { return await this.espn.freeAgents(f, c, league, week, pos, sched, ratings, now); } catch (e) { return { error: e.message }; }
      }));
      positions.forEach((pos, i) => { faByPos[pos] = results[i]; });
      rep = buildReport(league, me, boxes, week, now, faByPos);
      // trades
      let trades = [];
      try {
        const rosters = await this.espn.rosters(f, c, league);
        const conv = (t) => (rosters[t.id] || []).map((p) => rosterPlayer(p.name, p.position, p.eligible, p.status,
          playerValue(p.seasonProjAvg, p.seasonAvg, this.espn.gamesPlayed(t)), p.playerId, p.proTeam));
        const mine = conv(me);
        const others = Object.fromEntries(league.teams.filter((t) => t.id !== me.id).map((t) => [t.name, { id: t.id, logo: t.logo || "", players: conv(t) }]));
        trades = proposeTrades(mine, others, rep.slot_counts);
      } catch (e) { console.warn("trades failed", e?.message); }
      const problem_count = rep.warnings.filter((w) => /No eligible|BYE| is out|injury reserve|suspension/.test(w)).length;
      // The analyst's take: rules first, Claude's rewrite of the same facts when a key is configured and the daily cap allows.
      let analyst = null;
      try {
        analyst = analystTake({ report: rep, trades, league });
        if (await this.claudeAllowed()) {
          const polished = await polishTake(analyst, { apiKey: this.env.ANTHROPIC_API_KEY, fetchFn: f });
          if (polished) analyst = polished;
        }
        delete analyst.facts;
      } catch (e) { console.warn("analyst failed", e?.message); }
      return { ...b, report: rep, trades, analyst, team_id: me.id, week, problem_count };
    });
  }

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
      if (path === "/") return this.index(url);
      if (path.startsWith("/league/")) return this.league(Number(path.split("/")[2]), url);
      if (path === "/lineups") return this.lineups(request, url);
      if (path === "/trade") return this.trade(request, url);
      if (path === "/add") return this.add(request, url);
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

  async index(url) {
    const s = await this.settings();
    if (!(s.espn_s2 && s.swid)) return redirect("/settings");
    const force = url.searchParams.get("refresh") === "1";
    const leagues = await this.leagues(force);
    const bundles = [], errors = [];
    for (const lg of leagues) {
      try { bundles.push(await this.bundle(lg.league_id, force)); }
      catch (e) { errors.push(`${lg.league_name}: ${e?.message || e}`); }
    }
    bundles.sort((a, b) => (a.started === b.started ? a.name.localeCompare(b.name) : a.started ? -1 : 1));
    const totalMoves = bundles.reduce((n, b) => n + (b.report ? b.report.lineup_items.length : 0), 0);
    const saved = url.searchParams.get("saved");
    if (saved) errors.unshift(`Saved. ESPN reports ${saved} league(s) for this account.`);
    return html(indexPage({ bundles, errors, totalMoves, season: s.season, now: this.now() }));
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
    }
    await this.clearCache();
    return html(lineupsPage({ bundles, results, only, csrf }));
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
    await this.clearCache();
    return html(tradePage(b, trade, csrf, result));
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
    await this.clearCache();
    return html(addPage(b, pick, csrf, { ...state, result }));
  }

  async settingsPage(request) {
    const s = await this.settings();
    s.claude = { ...this.claudeConfig(), hasKey: !!this.env.ANTHROPIC_API_KEY, today: await this.claudeCallsToday() };
    s.cacheSeconds = this.cacheSeconds;
    const csrf = await this.csrf(request);
    if (request.method === "POST") {
      const form = await request.formData();
      if (!(await this.checkCsrf(request, form))) return html(errorPage("Form expired. Go back and try again.", true), 400);
      const espn_s2 = (form.get("espn_s2") || "").trim(), swid = (form.get("swid") || "").trim();
      if (!(espn_s2 && swid)) return html(settingsPage(s, csrf, ["Both cookies are required."]));
      let leagues;
      try { leagues = await this.espn.discoverLeagues(this.fetchFn, { espn_s2, swid }, s.season); }
      catch (e) { return html(settingsPage(s, csrf, [e?.message || String(e)])); }
      await this.storage.put("settings", { espn_s2, swid });
      await this.clearCache();
      return redirect(`/?saved=${leagues.length}`);
    }
    return html(settingsPage(s, csrf));
  }

  /** Called by the cron trigger to pre-build every league before game days. */
  async warm(request) {
    if (!timingSafeEqual(request.headers.get("x-warm-key") || "", this.env.SECRET_KEY || "x")) return new Response("no", { status: 403 });
    const leagues = await this.leagues(true);
    for (const lg of leagues) { try { await this.bundle(lg.league_id, true); } catch (e) { console.warn("warm failed", lg.league_name, e?.message); } }
    return new Response(`warmed ${leagues.length}`);
  }
}
