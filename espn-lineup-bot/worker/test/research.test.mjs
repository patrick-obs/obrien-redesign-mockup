import test from "node:test";
import assert from "node:assert/strict";
import { parseScoreboard, contextFactor } from "../vegas.js";
import { leagueSd, winProbability } from "../season.js";
import { makePlayer, volatility, optimizeCeiling, optimize } from "../optimizer.js";
import { proposeTrades, rosterPlayer, playoffSos, sosFactor } from "../trades.js";
import { fakeLeague } from "./fixtures.mjs";
import { App } from "../app.js";
import { fakeEspn, FakeStorage } from "./fixtures.mjs";

const sb = { events: [
  { date: "2026-11-08T18:00Z", weather: { displayValue: "Intermittent clouds", temperature: 56 }, competitions: [{ venue: { indoor: false }, odds: [{ details: "KC -9.5", overUnder: 46.5, spread: -9.5, homeTeamOdds: { favorite: true } }],
    competitors: [{ id: "12", homeAway: "home", team: { abbreviation: "KC" } }, { id: "20", homeAway: "away", team: { abbreviation: "NYJ" } }] }] },
  { date: "2026-11-06T01:15Z", weather: { displayValue: "Rain and wind", temperature: 50 }, competitions: [{ venue: { indoor: false }, odds: [{ details: "JAX -8.5", overUnder: 42.5, spread: 8.5 }],
    competitors: [{ id: "33", homeAway: "home", team: { abbreviation: "BAL" } }, { id: "30", homeAway: "away", team: { abbreviation: "JAX" } }] }] },
  { date: "2026-11-08T18:00Z", weather: null, competitions: [{ venue: { indoor: true }, odds: [], competitors: [{ id: "1", homeAway: "home", team: {} }, { id: "4", homeAway: "away", team: {} }] }] },
] };

test("scoreboard: implied totals from the line, favourite from the home spread, weather and domes", () => {
  const g = parseScoreboard(sb);
  assert.equal(g[12].implied, 28); assert.equal(g[20].implied, 18.5); assert.equal(g[12].favorite, true); assert.equal(g[12].big_favorite, true); assert.equal(g[20].favorite, false);
  assert.equal(g[33].implied, 17); assert.equal(g[30].implied, 25.5); assert.equal(g[30].favorite, true);
  assert.equal(g[33].wet, true); assert.equal(g[33].windy, true); assert.equal(g[12].wet, false);
  assert.equal(g[1].indoor, true); assert.equal(g[1].implied, null);
  assert.ok(contextFactor(g[12], "WR") > 1 && contextFactor(g[12], "WR") < contextFactor(g[12], "RB"), "big favourite: backs over receivers");
  assert.ok(contextFactor(g[20], "WR") < 1, "low implied total hurts");
  assert.ok(contextFactor(g[33], "K") < contextFactor(g[33], "RB"), "weather hurts kickers most");
  assert.equal(contextFactor(null, "QB"), 1); assert.equal(contextFactor(g[1], "QB"), 1);
});

test("league scoring spread comes from the league's own scores, with a sane fallback", () => {
  const league = fakeLeague();
  assert.equal(leagueSd(league), 24, "too few decided games in the fixture: fallback");
  league.teams[0].scores = [80, 130, 95, 140, 100, 120, 90, 150]; league.teams[1].scores = [100, 60, 140, 110, 90, 130, 70, 120];
  league.teams[1].outcomes = ["W", "L", "W", "W", "L", "W", "L", "W"];
  const sd = leagueSd(league);
  assert.ok(sd > 20 && sd < 30, String(sd));
  assert.ok(winProbability(110, 100, 1, sd) < winProbability(110, 100, 1, 14), "a wider spread makes the same lead less safe");
  assert.equal(leagueSd({ teams: [] }), 24);
});

test("volatility and the ceiling lineup", () => {
  const P = (name, pos, slot, proj, history) => makePlayer({ name, position: pos, eligible: [pos, "BE"], slot, proj, history });
  const steady = P("Steady", "WR", "WR", 12, [12, 11, 13, 12]), boom = P("Boom", "WR", "BE", 11, [2, 25, 1, 24]), noHist = P("New", "WR", "BE", 9, []);
  assert.equal(volatility(steady), 0.8); assert.ok(volatility(boom) > 10); assert.equal(volatility(noHist), null);
  const slots = { WR: 1 };
  assert.equal(optimize([steady, boom, noHist], slots).WR[0].name, "Steady", "projection picks the steady player");
  assert.equal(optimizeCeiling([steady, boom, noHist], slots).WR[0].name, "Boom", "upside picks the boom-or-bust player");
  assert.equal(optimizeCeiling([steady, boom, noHist], slots).WR[0], boom, "returns the original object");
});

test("star protection: your best player only leaves for someone at least as good", () => {
  const ELIG = { QB: ["QB", "BE"], RB: ["RB", "RB/WR/TE", "BE"], WR: ["WR", "RB/WR/TE", "BE"], TE: ["TE", "RB/WR/TE", "BE"] };
  let n = 500; const rp = (name, pos, v) => rosterPlayer(name, pos, ELIG[pos], "ACTIVE", v, n++);
  const mine = [rp("Star", "RB", 24), rp("QB1", "QB", 18), rp("RB2", "RB", 10), rp("WR1", "WR", 9), rp("WR2", "WR", 3), rp("TE1", "TE", 7)];
  const theirs = [rp("QBx", "QB", 17), rp("RBa", "RB", 14), rp("WRa", "WR", 16), rp("WRb", "WR", 15), rp("WRc", "WR", 13), rp("TEx", "TE", 7)];
  const SLOTS = { QB: 1, RB: 2, WR: 2, TE: 1, "RB/WR/TE": 1 };
  const ideas = proposeTrades(mine, { Them: { id: 7, players: theirs } }, SLOTS, { perTeam: 20, perLeague: 40 });
  assert.ok(!ideas.some((i) => i.give.some((p) => p.name === "Star")), "nobody on their roster is worth the star");
  const unprotected = proposeTrades(mine, { Them: { id: 7, players: theirs } }, SLOTS, { perTeam: 20, perLeague: 40, protectIds: [] });
  assert.ok(unprotected.length >= ideas.length);
});

test("playoff strength of schedule nudges value by a few percent at most", () => {
  const sched = { 12: { 15: [{ homeProTeamId: 12, awayProTeamId: 2 }], 16: [{ homeProTeamId: 5, awayProTeamId: 12 }], 17: [] } };
  const ratings = { 2: 30, 5: 28 };
  assert.equal(playoffSos(12, [15, 16, 17], sched, ratings), 29);
  assert.equal(playoffSos(99, [15], sched, ratings), null);
  assert.ok(sosFactor(29) > 1 && sosFactor(29) <= 1.05); assert.ok(sosFactor(4) < 1 && sosFactor(4) >= 0.95); assert.equal(sosFactor(null), 1);
});

test("bid suggestion: nothing for streamers, more for real holes, rises late, dodges round numbers", async () => {
  const app = new App({ env: { APP_PASSWORD: "x", SECRET_KEY: "s", ESPN_S2: "a", SWID: "{abc-123}" }, storage: new FakeStorage(), fetchFn: async () => { throw new Error("no network"); }, espn: fakeEspn() });
  const b = await app.bundle(1);
  assert.equal(app.suggestBid(b, { pos: "D/ST", fills_empty_slot: true, edge: 6 }), 0);
  const hole = app.suggestBid(b, { pos: "RB", fills_empty_slot: true, edge: 2 }), edge = app.suggestBid(b, { pos: "RB", fills_empty_slot: false, edge: 2 });
  assert.ok(hole > edge && hole <= b.report.budget_left);
  const late = app.suggestBid({ ...b, season: { ...b.season, weeks_left: 2 } }, { pos: "RB", fills_empty_slot: false, edge: 2 });
  assert.ok(late > edge, "spend down late");
  for (const v of [hole, edge, late]) assert.ok(v % 5 !== 0 || v === 0, `not a round number: ${v}`);
  // The add page prefills it.
  const r = await app.handle(new Request("https://advisor.test/login", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: "password=x" }));
  const cookie = r.headers.get("set-cookie").split(";")[0];
  const dst = b.report.waivers["D/ST"][0];
  const page = await (await app.handle(new Request(`https://advisor.test/add?league=1&player=${dst.player_id}`, { headers: { cookie } }))).text();
  assert.match(page, /Suggested: \$0\. Never spend budget on a streaming defense/);
  // Ceiling mode on the lineup route renders.
  const c = await (await app.handle(new Request("https://advisor.test/lineups?league=1&mode=ceiling", { headers: { cookie } }))).text();
  assert.match(c, /Set the ceiling lineup/);
  // The lineup table shows a range when a player has history.
  const l = await (await app.handle(new Request("https://advisor.test/league/1", { headers: { cookie } }))).text();
  assert.match(l, /Last 3 · range/);
});
