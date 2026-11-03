import test from "node:test";
import assert from "node:assert/strict";
import { App } from "../app.js";
import { fakeEspn, FakeStorage } from "./fixtures.mjs";

function makeApp(posts = []) {
  const env = { APP_PASSWORD: "open-sesame", SECRET_KEY: "test-secret", ESPN_S2: "s2cookie", SWID: "{abc-123}" };
  return new App({ env, storage: new FakeStorage(), fetchFn: async () => { throw new Error("no network in tests"); }, espn: fakeEspn({ posts }) });
}
const form = (data) => new URLSearchParams(data).toString();
const req = (path, { method = "GET", cookie = "", body } = {}) =>
  new Request(`https://advisor.test${path}`, { method, headers: { ...(cookie ? { cookie } : {}), ...(body !== undefined ? { "content-type": "application/x-www-form-urlencoded" } : {}) }, body });

async function login(app) {
  const r = await app.handle(req("/login", { method: "POST", body: form({ password: "open-sesame" }) }));
  assert.equal(r.status, 302);
  const cookie = r.headers.get("set-cookie").split(";")[0];
  return cookie;
}

test("requires login; wrong passphrase rejected", async () => {
  const app = makeApp();
  const r = await app.handle(req("/"));
  assert.equal(r.status, 302); assert.match(r.headers.get("location"), /\/login/);
  const bad = await app.handle(req("/login", { method: "POST", body: form({ password: "nope" }) }));
  assert.equal(bad.status, 401); assert.match(await bad.text(), /Wrong passphrase/);
});

test("dashboard and league page render", async () => {
  const app = makeApp();
  const cookie = await login(app);
  const r = await app.handle(req("/", { cookie }));
  assert.equal(r.status, 200);
  const h = await r.text();
  assert.match(h, /Test League/); assert.match(h, /Dead League/); assert.match(h, /Not renewed|Not started/);
  assert.match(h, /Set all lineups/); assert.match(h, /lineup change/); assert.match(h, /START RB C/); assert.match(h, /1 problem/);
  const l = await (await app.handle(req("/league/1", { cookie }))).text();
  for (const s of ["Recommended lineup", "EMPTY", "nobody eligible", "Trade ideas", "Waiver watch", "League injury report", "Remaining schedule", "Standings", "covers D A's bye this week only", "TE FA", "Analyst's take", "/add\\?league=1&amp;player=", "Claim</a>"]) assert.match(l, new RegExp(s));
  assert.match(h, /class="take"/);
  assert.ok(!l.includes("RB FA"));
  const dead = await app.handle(req("/league/2", { cookie }));
  assert.match(await dead.text(), /has not started/);
});

test("preview then apply with CSRF; IR never touched", async () => {
  const posts = [];
  const app = makeApp(posts);
  const cookie = await login(app);
  const preview = await (await app.handle(req("/lineups", { cookie }))).text();
  assert.match(preview, /Confirm and send to ESPN/); assert.match(preview, /RB C/); assert.ok(!preview.includes("Dead League"));
  assert.equal(posts.length, 0);
  const noCsrf = await app.handle(req("/lineups", { method: "POST", cookie, body: form({}) }));
  assert.equal(noCsrf.status, 400);
  const csrf = preview.match(/name="csrf" value="([0-9a-f]+)"/)[1];
  const done = await app.handle(req("/lineups", { method: "POST", cookie, body: form({ csrf }) }));
  assert.match(await done.text(), /Lineup set\./);
  assert.equal(posts.length, 1);
  assert.equal(posts[0].teamId, 3); assert.equal(posts[0].leagueId, 1); assert.deepEqual(posts[0].cookies, { espn_s2: "s2cookie", swid: "{abc-123}" });
  assert.ok(posts[0].items.every((i) => i.fromLineupSlotId !== 21 && i.toLineupSlotId !== 21));
});

test("settings saves cookies to storage", async () => {
  const app = makeApp();
  const cookie = await login(app);
  const page = await (await app.handle(req("/settings", { cookie }))).text();
  const csrf = page.match(/name="csrf" value="([0-9a-f]+)"/)[1];
  const r = await app.handle(req("/settings", { method: "POST", cookie, body: form({ csrf, swid: "{new}", espn_s2: "new2" }) }));
  assert.equal(r.status, 302); assert.equal(r.headers.get("location"), "/?saved=2");
  assert.match(await (await app.handle(req("/?saved=2", { cookie }))).text(), /ESPN reports 2 league/);
  assert.deepEqual(await app.storage.get("settings"), { espn_s2: "new2", swid: "{new}" });
  assert.equal((await app.settings()).swid, "{new}");
});

test("warm endpoint needs the key, fills the cache, sets lineups once and respects overrides", async () => {
  const posts = [];
  const app = makeApp(posts);
  await app.savePrefs({ auto_trades: false, auto_fill_empty: false });
  assert.equal((await app.handle(req("/__warm"))).status, 403);
  const warm = () => app.handle(new Request("https://advisor.internal/__warm", { headers: { "x-warm-key": "test-secret" } }));
  assert.equal(await (await warm()).text(), "warmed 2, auto-managed 1");
  assert.equal(posts.filter((p) => p.kind === "lineup").length, 1); assert.equal(posts[0].leagueId, 1);
  const log1 = await app.storage.get("auto:1:9");
  assert.equal(log1.events[0].kind, "lineup"); assert.equal(log1.events[0].changes, 4); assert.equal(log1.target["RB C"], "RB");
  // The fake roster never changes, which looks exactly like a manual override: the second run must leave it alone.
  assert.equal(await (await warm()).text(), "warmed 2, auto-managed 0");
  assert.equal(posts.filter((p) => p.kind === "lineup").length, 1);
  assert.equal((await app.storage.get("auto:1:9")).events[1].skipped, true);
  // Switched off: nothing is sent.
  await app.savePrefs({ auto_lineup: false, auto_trades: false });
  const app2 = new App({ env: { APP_PASSWORD: "open-sesame", SECRET_KEY: "test-secret", ESPN_S2: "s2cookie", SWID: "{abc-123}" }, storage: app.storage, fetchFn: async () => { throw new Error("no network"); }, espn: fakeEspn({ posts }) });
  await app2.clearCache();
  assert.equal(await (await app2.handle(new Request("https://advisor.internal/__warm", { headers: { "x-warm-key": "test-secret" } }))).text(), "warmed 2, auto-managed 0");
  // Opt-in empty-slot fill: D FA is on waivers in the fixture, so nothing is added (claims are never automatic).
  await app2.savePrefs({ auto_lineup: false, auto_fill_empty: true, auto_trades: false });
  await app2.handle(new Request("https://advisor.internal/__warm", { headers: { "x-warm-key": "test-secret" } }));
  assert.equal(posts.filter((p) => p.kind === "add").length, 0);
  // Dashboard shows the automatic set, and the orphaned league is called out and can be hidden.
  const cookie = await login(app);
  const h = await (await app.handle(req("/", { cookie }))).text();
  assert.match(h, /Set automatically/); assert.match(h, /never drafted|not renewed/i); assert.match(h, /name="action" value="hide"/);
  const csrf = h.match(/name="csrf" value="([0-9a-f]+)"/)[1];
  const hid = await app.handle(req("/hide", { method: "POST", cookie, body: form({ csrf, league: 2 }) }));
  assert.equal(hid.status, 302);
  const h2 = await (await app.handle(req("/", { cookie }))).text();
  assert.ok(!h2.includes("Dead League")); assert.match(h2, /1 hidden league/);
  const sp = await (await app.handle(req("/settings", { cookie }))).text();
  assert.match(sp, /Dead League/); assert.match(sp, /name="action" value="show"/);
  await app.handle(req("/hide", { method: "POST", cookie, body: form({ csrf, league: 2, action: "show" }) }));
  assert.match(await (await app.handle(req("/", { cookie }))).text(), /Dead League/);
  // Preferences form.
  const saved = await app.handle(req("/settings", { method: "POST", cookie, body: form({ csrf, prefs: 1, auto_lineup: 0, auto_fill_empty: 1 }) }));
  assert.equal(saved.status, 302);
  assert.deepEqual((await app.storage.get("prefs")).auto_lineup, false); assert.equal((await app.storage.get("prefs")).auto_fill_empty, true);
});

test("dashboard and league page carry the win chance, both projections, playoff odds and the game plan", async () => {
  const app = makeApp();
  const cookie = await login(app);
  const h = await (await app.handle(req("/", { cookie }))).text();
  assert.match(h, /Win chance/); assert.match(h, /class="pct[ "]/); assert.match(h, /To do/); assert.match(h, /Review lineup|Set this lineup/);
  const l = await (await app.handle(req("/league/1", { cookie }))).text();
  for (const s of ["Game plan", "Playoff odds", "Advisor", "Weakest spot|No weak position", "Remaining schedule", "win chance", "What owned means|share of ESPN leagues"]) assert.match(l, new RegExp(s));
  const b = await app.bundle(1);
  assert.ok(b.season.odds.playoff_odds >= 0 && b.season.odds.playoff_odds <= 100);
  assert.ok(b.season.plan.bullets.length >= 3); assert.equal(b.season.plan.source, "rules");
  assert.ok(b.trades.every((t) => t.weeks_left === 8 && t.season_gain === Math.round(t.my_gain * 8 * 10) / 10));
  assert.ok(b.report.advisor.me > 0 && b.report.recommended.QB[0].our_proj > 0);
});

test("analyst take is built from the numbers and never claims to be Claude without a key", async () => {
  const app = makeApp();
  const cookie = await login(app);
  await app.handle(req("/league/1", { cookie }));
  const b = await app.bundle(1);
  assert.equal(b.analyst.source, "rules");
  assert.ok(b.analyst.headline.length > 5 && b.analyst.headline.length < 80);
  assert.equal(b.analyst.paragraphs.length, 3);
  assert.match(b.analyst.paragraphs[0], /Rival/);
  assert.match(b.analyst.paragraphs[1], /leaves 17\.0 points on the bench/);
  assert.match(b.analyst.paragraphs[2], /2nd of 4/);
  assert.ok(!("facts" in b.analyst));
});

test("trade: preview then propose with CSRF; unknown ids rejected", async () => {
  const posts = [];
  const app = makeApp(posts);
  const cookie = await login(app);
  const b = await app.bundle(1);
  assert.ok(b.trades.length, "fixture should produce at least one trade");
  const t = b.trades[0];
  const page = await app.handle(req(`/trade?league=1&id=${t.id}`, { cookie }));
  assert.equal(page.status, 200);
  const ph = await page.text();
  assert.match(ph, /Send this offer to/); assert.match(ph, new RegExp(t.give[0].name));
  assert.equal((await app.handle(req("/trade?league=1&id=deadbeef", { cookie }))).status, 404);
  const csrf = ph.match(/name="csrf" value="([0-9a-f]+)"/)[1];
  const noCsrf = await app.handle(req("/trade", { method: "POST", cookie, body: form({ league: 1, id: t.id }) }));
  assert.equal(noCsrf.status, 400); assert.equal(posts.length, 0);
  const done = await app.handle(req("/trade", { method: "POST", cookie, body: form({ league: 1, id: t.id, csrf }) }));
  assert.match(await done.text(), /Trade proposed/);
  assert.equal(posts.length, 1);
  assert.equal(posts[0].kind, "trade"); assert.equal(posts[0].teamId, 3); assert.equal(posts[0].theirTeamId, t.with_team_id);
  assert.deepEqual(posts[0].giveIds, t.give.map((p) => p.player_id)); assert.deepEqual(posts[0].getIds, t.get.map((p) => p.player_id));
});

test("add: full roster forces a drop, default is the cheapest bench player, waivers become a claim with a bid", async () => {
  const posts = [];
  const app = makeApp(posts);
  const cookie = await login(app);
  const b = await app.bundle(1);
  const r = b.report;
  assert.equal(r.open_spots, 0); assert.equal(r.budget_left, 100);
  assert.ok(r.drop_candidates.length); assert.equal(r.drop_candidates[0].starter, false);
  assert.ok(r.drop_candidates.every((c) => c.slot !== "IR" && c.name !== "K A"), "IR and locked players are never drop candidates");
  const te = r.waivers.TE[0], dst = r.waivers["D/ST"][0];
  assert.equal(te.on_waivers, false); assert.equal(dst.on_waivers, true);
  // Free agent: preview shows a drop select with the cheapest bench player chosen.
  const page = await (await app.handle(req(`/add?league=1&player=${te.player_id}`, { cookie }))).text();
  assert.match(page, /your roster is full/); assert.match(page, new RegExp(`and drop ${r.drop_candidates[0].name}`));
  const csrf = page.match(/name="csrf" value="([0-9a-f]+)"/)[1];
  const done = await app.handle(req("/add", { method: "POST", cookie, body: form({ league: 1, player: te.player_id, drop: r.drop_candidates[1].player_id, csrf }) }));
  assert.match(await done.text(), /Player added/);
  assert.equal(posts.length, 1); assert.equal(posts[0].kind, "add"); assert.equal(posts[0].addId, te.player_id);
  assert.equal(posts[0].dropId, r.drop_candidates[1].player_id); assert.equal(posts[0].waiver, false);
  // A drop that is not a candidate (the IR player) is refused.
  const b2 = await app.bundle(1);
  const page2 = await (await app.handle(req(`/add?league=1&player=${dst.player_id}`, { cookie }))).text();
  const csrf2 = page2.match(/name="csrf" value="([0-9a-f]+)"/)[1];
  assert.match(page2, /Submit claim/); assert.match(page2, /Bid \(you have \$100 left\)/);
  const bad = await app.handle(req("/add", { method: "POST", cookie, body: form({ league: 1, player: dst.player_id, drop: 999999, csrf: csrf2 }) }));
  assert.match(await bad.text(), /Pick a drop from the list/); assert.equal(posts.length, 1);
  const over = await app.handle(req("/add", { method: "POST", cookie, body: form({ league: 1, player: dst.player_id, drop: b2.report.drop_candidates[0].player_id, bid: 500, csrf: csrf2 }) }));
  assert.match(await over.text(), /only have \$100/); assert.equal(posts.length, 1);
  const claim = await app.handle(req("/add", { method: "POST", cookie, body: form({ league: 1, player: dst.player_id, drop: b2.report.drop_candidates[0].player_id, bid: 7, csrf: csrf2 }) }));
  assert.match(await claim.text(), /Claim submitted/);
  assert.equal(posts.length, 2); assert.equal(posts[1].waiver, true); assert.equal(posts[1].bid, 7);
  assert.equal((await app.handle(req("/add?league=1&player=424242", { cookie }))).status, 404);
});

test("Claude rewrite: counted per day, capped, switchable, and falls back on failure", async () => {
  let calls = 0;
  const claude = async (url, init) => {
    if (!String(url).includes("api.anthropic.com")) throw new Error("no network in tests");
    calls++;
    const body = JSON.parse(init.body);
    assert.equal(body.model, "claude-opus-5-5"); assert.equal(body.fallbacks, "default"); assert.equal(body.output_config.effort, "low");
    assert.equal(init.headers["anthropic-version"], "2026-10-21");
    return new Response(JSON.stringify({ stop_reason: "end_turn", content: [{ type: "text", text: "Rival is in trouble.\n\nPara one.\n\nPara two." }] }), { status: 200 });
  };
  const env = { APP_PASSWORD: "open-sesame", SECRET_KEY: "test-secret", ESPN_S2: "s2cookie", SWID: "{abc-123}", ANTHROPIC_API_KEY: "sk-test", ANALYST_DAILY_CAP: "2" };
  const app = new App({ env, storage: new FakeStorage(), fetchFn: claude, espn: fakeEspn() });
  const b1 = await app.bundle(1, true);
  assert.equal(b1.analyst.source, "claude"); assert.equal(b1.analyst.headline, "Rival is in trouble."); assert.deepEqual(b1.analyst.paragraphs, ["Para one.", "Para two."]);
  await app.bundle(1, true);
  const b3 = await app.bundle(1, true);
  assert.equal(calls, 2, "third rebuild must not call Claude once the daily cap is hit");
  assert.equal(b3.analyst.source, "rules");
  const cookie = await login(app);
  const page = await (await app.handle(req("/settings", { cookie }))).text();
  assert.match(page, /Calls today/); assert.match(page, /<span class="v">2<\/span><span class="m">\/ 2<\/span>/);
  // Kill switch.
  const off = new App({ env: { ...env, ANALYST_ENABLED: "0", ANALYST_DAILY_CAP: "100" }, storage: new FakeStorage(), fetchFn: claude, espn: fakeEspn() });
  assert.equal((await off.bundle(1, true)).analyst.source, "rules"); assert.equal(calls, 2);
  // A 500 from the API leaves the rules text in place and does not throw.
  const broken = new App({ env: { ...env, ANALYST_DAILY_CAP: "100" }, storage: new FakeStorage(), fetchFn: async (u) => { if (String(u).includes("api.anthropic.com")) return new Response("nope", { status: 500 }); throw new Error("no network"); }, espn: fakeEspn() });
  assert.equal((await broken.bundle(1, true)).analyst.source, "rules");
});

test("everything sent to ESPN is recorded and shown on the dashboard", async () => {
  const posts = [];
  const app = makeApp(posts);
  await app.savePrefs({ auto_trades: false, auto_fill_empty: false });
  const cookie = await login(app);
  let h = await (await app.handle(req("/", { cookie }))).text();
  assert.match(h, /Nothing has been sent yet/);
  const b = await app.bundle(1);
  const t = b.trades[0];
  const csrf = (await (await app.handle(req(`/trade?league=1&id=${t.id}`, { cookie }))).text()).match(/name="csrf" value="([0-9a-f]+)"/)[1];
  await app.handle(req("/trade", { method: "POST", cookie, body: form({ league: 1, id: t.id, csrf }) }));
  const te = b.report.waivers.TE[0];
  await app.handle(req("/add", { method: "POST", cookie, body: form({ league: 1, player: te.player_id, drop: b.report.drop_candidates[0].player_id, csrf }) }));
  await app.handle(req("/lineups", { method: "POST", cookie, body: form({ csrf }) }));
  await app.handle(new Request("https://advisor.internal/__warm", { headers: { "x-warm-key": "test-secret" } }));
  const log = await app.activity();
  assert.deepEqual(log.map((e) => e.kind), ["lineup", "lineup", "add", "trade"]);
  assert.equal(log[0].by, "auto"); assert.equal(log[1].by, "you"); assert.equal(log[3].with, t.with);
  h = await (await app.handle(req("/", { cookie }))).text();
  assert.match(h, /Sent to ESPN/); assert.match(h, new RegExp(`Trade offer to ${t.with}`)); assert.match(h, /Added TE FA, dropped/); assert.match(h, /automatic/);
});

test("recommended moves: one page, one button, sends the plan and logs each piece", async () => {
  const posts = [];
  const app = makeApp(posts);
  const cookie = await login(app);
  const page = await (await app.handle(req("/trades?league=1", { cookie }))).text();
  assert.match(page, /Recommended moves/); assert.match(page, /Do all of this on ESPN/); assert.match(page, /checked for every combination/);
  assert.match(page, /<summary[^>]*>Adjust<\/summary>/);
  const csrf = page.match(/name="csrf" value="([0-9a-f]+)"/)[1];
  const done = await (await app.handle(req("/trades", { method: "POST", cookie, body: form({ csrf, league: 1 }) }))).text();
  // The fixture's pending offer (RB B for D W) is rated likely declined, so the plan withdraws it and sends the robust set.
  assert.match(done, /1 of 1 withdrawn/);
  assert.ok(posts.some((p) => p.kind === "withdraw") && posts.some((p) => p.kind === "trade"), posts.map((p) => p.kind).join(","));
  const kinds = (await app.activity()).map((e) => e.kind);
  assert.ok(kinds.includes("withdraw") && kinds.includes("trade"));
});

test("pending offers: listed, scored, judged, and replaceable through Adjust", async () => {
  const posts = [];
  const app = makeApp(posts);
  const cookie = await login(app);
  const b = await app.bundle(1);
  assert.equal(b.pending.length, 1); assert.equal(b.pending[0].mine, true); assert.equal(b.pending[0].give_names, "RB B"); assert.equal(b.pending[0].get_names, "D W");
  assert.ok(b.pending[0].my_gain > 0); assert.equal(b.pending[0].acceptable, false, "an injured back would not start for Rival and their lineup does not improve");
  const l = await (await app.handle(req("/league/1", { cookie }))).text();
  assert.match(l, /Offers out on ESPN/); assert.match(l, /likely declined/);
  const page = await (await app.handle(req("/trades?league=1", { cookie }))).text();
  assert.match(page, /Withdraw your offer to Rival/);
  // Adjust: withdraw nothing, send nothing: refused with a message, nothing posted.
  const csrf = page.match(/name="csrf" value="([0-9a-f]+)"/)[1];
  const none = await (await app.handle(req("/trades", { method: "POST", cookie, body: form({ csrf, league: 1, adjusted: 1 }) }))).text();
  assert.match(none, /Nothing to send/); assert.equal(posts.length, 0);
  // Direct withdraw route refuses an offer that is not yours.
  const bad = await app.handle(req("/withdraw", { method: "POST", cookie, body: form({ csrf, league: 1, tx: 999 }) }));
  assert.equal(bad.status, 404);
});

test("accepted or declined offers are noticed on the next rebuild; blitz can send waiver moves too", async () => {
  const posts = [];
  const espn = fakeEspn({ posts });
  const app = new App({ env: { APP_PASSWORD: "open-sesame", SECRET_KEY: "test-secret", ESPN_S2: "s2cookie", SWID: "{abc-123}" }, storage: new FakeStorage(), fetchFn: async () => { throw new Error("no network"); }, espn });
  await app.bundle(1, true);
  assert.equal((await app.activity()).length, 0);
  espn.tradeStatus = "REJECTED";
  await app.bundle(1, true);
  const log = await app.activity();
  assert.equal(log.length, 1); assert.equal(log[0].kind, "settled"); assert.equal(log[0].outcome, "declined"); assert.match(log[0].message, /Your offer to Rival was declined/);
  await app.bundle(1, true);
  assert.equal((await app.activity()).length, 1, "only logged once");
  const cookie = await login(app);
  assert.match(await (await app.handle(req("/", { cookie }))).text(), /was declined/);
  // Waiver moves on the blitz page: the D/ST claim is pre-ticked because it fills an empty slot; sending it posts a claim with a drop.
  const page = await (await app.handle(req("/trades?league=1", { cookie }))).text();
  assert.match(page, /Pickups/); assert.match(page, /covers D A's bye this week only/);
  const dst = (await app.bundle(1)).report.waivers["D/ST"][0];
  const csrf = page.match(/name="csrf" value="([0-9a-f]+)"/)[1];
  const done = await (await app.handle(req("/trades", { method: "POST", cookie, body: form({ csrf, league: 1, adjusted: 1, move: dst.player_id }) }))).text();
  assert.match(done, /1 of 1 waiver move done/);
  const add = posts.find((p) => p.kind === "add");
  assert.ok(add && add.waiver === true && add.addId === dst.player_id && add.dropId != null);
});

test("a slot empty only because of a bye is cover-only: not urgent, not pre-ticked, never auto-filled", async () => {
  const posts = [];
  const app = makeApp(posts);
  const b = await app.bundle(1);
  const dst = b.report.waivers["D/ST"][0];
  assert.equal(dst.fills_empty_slot, true); assert.equal(dst.bye_cover, true); assert.equal(dst.returning, "D A");
  const cookie = await login(app);
  const h = await (await app.handle(req("/", { cookie }))).text();
  assert.match(h, /empty this week only \(D A is on bye\); optional/);
  const page = await (await app.handle(req("/trades?league=1", { cookie }))).text();
  assert.ok(!new RegExp(`name="move" value="${dst.player_id}" checked`).test(page), "the bye-gap defense is not pre-ticked");
  await app.savePrefs({ auto_lineup: false, auto_fill_empty: true });
  await app.handle(new Request("https://advisor.internal/__warm", { headers: { "x-warm-key": "test-secret" } }));
  assert.equal(posts.filter((p) => p.kind === "add").length, 0);
});

test("Automanage master switch stops every automatic action", async () => {
  const posts = [];
  const app = makeApp(posts);
  await app.savePrefs({ automanage: false, auto_lineup: true, auto_fill_empty: true });
  assert.equal(await (await app.handle(new Request("https://advisor.internal/__warm", { headers: { "x-warm-key": "test-secret" } }))).text(), "warmed 2, auto-managed 0");
  assert.equal(posts.length, 0);
  const cookie = await login(app);
  const sp = await (await app.handle(req("/settings", { cookie }))).text();
  assert.match(sp, /id="automanage" name="automanage" value="1">/); assert.ok(!/id="automanage" name="automanage" value="1" checked/.test(sp));
});

test("autopilot: withdraws the losing offer, sends the robust set once, backs off after a decline", async () => {
  const posts = [];
  const espn = fakeEspn({ posts });
  let t = Date.UTC(2026, 10, 2, 12, 0, 0);
  const app = new App({ env: { APP_PASSWORD: "open-sesame", SECRET_KEY: "test-secret", ESPN_S2: "s2cookie", SWID: "{abc-123}" }, storage: new FakeStorage(), fetchFn: async () => { throw new Error("no network"); }, espn, now: () => t });
  await app.savePrefs({ auto_lineup: false, auto_fill_empty: false });
  const warm = () => app.handle(new Request("https://advisor.internal/__warm", { headers: { "x-warm-key": "test-secret" } }));
  await warm();
  assert.deepEqual(posts.map((p) => p.kind), ["withdraw", "trade"], "withdraw RB B for D W, then offer the robust set");
  const sent = posts[1]; assert.equal(sent.theirTeamId, 7);
  const log = await app.activity();
  assert.ok(log.some((e) => e.kind === "trade" && e.by === "auto") && log.some((e) => e.kind === "withdraw" && e.by === "auto"));
  // Same day again: the package was already offered, nothing new goes out.
  t += 3600e3; await warm();
  assert.equal(posts.length, 2);
  // The fixture's pending offer (now canceled) is not re-sent; the manager declined nothing, so no cooldown applies yet.
  const st = await app.storage.get("autotrade:1");
  assert.equal(Object.keys(st.offered).length, 1);
  // Simulate the counterparty declining the offer the autopilot sent is not possible with a static fake; simulate a
  // decline of the original pending offer instead and check the cooldown blocks new offers to that manager.
  espn.tradeStatus = "PENDING"; // make it reappear...
  await app.bundle(1, true);
  espn.tradeStatus = "REJECTED"; // ...and get declined
  await app.bundle(1, true);
  const st2 = await app.storage.get("autotrade:1");
  assert.ok(st2.cooldown[7], "Rival declined: cooldown recorded");
  const before = posts.length;
  t += 8 * 86400e3; // a week later the earlier package may be re-sent, but Rival's cooldown is 48h, long past
  await warm();
  assert.ok(posts.length > before, "after a week the robust set goes out again");
  // Master switch off: nothing.
  await app.savePrefs({ automanage: false });
  const n = posts.length; t += 86400e3; await warm(); assert.equal(posts.length, n);
});
