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
  assert.match(h, /Test League/); assert.match(h, /Dead League/); assert.match(h, /Not started/);
  assert.match(h, /Set all lineups/); assert.match(h, /lineup change/); assert.match(h, /START RB C/); assert.match(h, /1 problem/);
  const l = await (await app.handle(req("/league/1", { cookie }))).text();
  for (const s of ["Recommended lineup", "EMPTY", "nobody eligible", "Trade ideas", "Waiver watch", "League injury report", "Remaining schedule", "Standings", "fills your EMPTY slot", "TE FA"]) assert.match(l, new RegExp(s));
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

test("warm endpoint needs the key and fills the cache", async () => {
  const app = makeApp();
  assert.equal((await app.handle(req("/__warm"))).status, 403);
  const r = await app.handle(new Request("https://advisor.internal/__warm", { headers: { "x-warm-key": "test-secret" } }));
  assert.equal(await r.text(), "warmed 2");
  assert.ok(await app.storage.get("league:1"));
});
