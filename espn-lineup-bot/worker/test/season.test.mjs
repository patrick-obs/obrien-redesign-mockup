import test from "node:test";
import assert from "node:assert/strict";
import { winProbability, normalCdf, byeWeeks, horizonWeights, availability, simulateSeason, scheduleOutlook, positionalStrength, gamePlan, playoffWeeks } from "../season.js";
import { fakeLeague, fakeBoxes, FA, NOW, MINE, THEIRS, OTHERS } from "./fixtures.mjs";
import { buildReport } from "../report.js";
import { rosterPlayer, playerValue } from "../trades.js";

test("win probability: even is 50%, big lead late is near-certain", () => {
  assert.ok(Math.abs(normalCdf(0) - 0.5) < 1e-6);
  assert.equal(winProbability(100, 100, 1), 0.5);
  assert.ok(winProbability(110, 100, 1) > 0.6 && winProbability(110, 100, 1) < 0.75);
  assert.ok(winProbability(110, 100, 0.05) > 0.95, "same lead with the week nearly over");
  assert.equal(winProbability(-1, 100), null);
});

test("byes, horizon weights and availability", () => {
  const sched = { 12: { 10: [{}], 11: [], 12: [{}] }, 2: { 10: [{}], 11: [{}], 12: [{}] } };
  assert.deepEqual(byeWeeks(sched, 10, 12), { 12: [11] });
  const league = fakeLeague();
  assert.deepEqual(playoffWeeks(league), [15, 16, 17]);
  const w = horizonWeights(league, 9, true);
  assert.equal(w[10], 1); assert.equal(w[15], 1.5); assert.equal(Object.keys(w).length, 8);
  assert.ok(availability(w, [11]) < 1 && availability(w, []) === 1);
  assert.ok(availability(horizonWeights(league, 9, false), [15]) > availability(w, [15]), "a playoff bye costs less when not contending");
});

test("season simulation: deterministic, odds sum to the spots, better record wins more", () => {
  const league = fakeLeague();
  const a = simulateSeason(league, { sims: 500, seed: 1 }), b = simulateSeason(league, { sims: 500, seed: 1 });
  assert.deepEqual(a, b);
  const total = Object.values(a.by_team).reduce((s, t) => s + t.playoff_odds, 0);
  assert.ok(Math.abs(total - 200) <= 3, `two spots: ${total}`);
  assert.ok(a.by_team[10].playoff_odds > a.by_team[9].playoff_odds, "6-2 beats 2-6");
  assert.ok(a.by_team[3].expected_wins >= 5 && a.by_team[3].expected_wins <= 11);
  const outlook = scheduleOutlook(league, league.byId[3]);
  assert.equal(outlook[0].week, 10); assert.ok(outlook.every((g) => g.win_prob >= 0 && g.win_prob <= 100));
});

test("positional strength ranks my starters against the league", () => {
  const conv = (ps) => ps.map((p) => rosterPlayer(p.name, p.position, p.eligible, p.status, playerValue(p.seasonProjAvg, p.seasonAvg, 8), p.playerId));
  const rosters = { 3: conv(MINE()), 7: conv(THEIRS()), 9: conv(OTHERS()) };
  const s = positionalStrength(rosters, 3, { QB: 1, RB: 2, WR: 2, TE: 1, "RB/WR/TE": 1, "D/ST": 1, K: 1 });
  assert.equal(s.QB.rank, 2); assert.equal(s.QB.teams, 3); assert.equal(s.WR.rank, 1); assert.equal(s["D/ST"].rank, 2);
});

test("game plan reads the situation", () => {
  const league = fakeLeague(); const me = league.byId[3];
  const r = buildReport(league, me, fakeBoxes(league), 9, NOW, FA);
  assert.equal(r.score.me, 0); assert.equal(r.projected_finish.me, 95); assert.equal(r.projected_finish.opponent, 110);
  assert.ok(r.win_prob > 0.2 && r.win_prob < 0.5); assert.equal(r.live, false);
  assert.ok(!r.warnings.some((w) => /locked/.test(w)), "locked is no longer a warning");
  const odds = simulateSeason(league, { sims: 300, seed: 2 });
  const plan = gamePlan({ report: r, odds, outlook: scheduleOutlook(league, me), strength: { TE: { mine: 6, league_avg: 7, rank: 4, teams: 4 }, WR: { mine: 30, league_avg: 20, rank: 1, teams: 4 } }, trades: [], weeksLeft: 5, byesAhead: [{ name: "QB A", week: 11 }] });
  assert.ok(["lock", "contend", "push", "long shot"].includes(plan.mode));
  assert.ok(plan.bullets.length >= 4);
  assert.ok(plan.bullets.some((b) => /Weakest spot is TE/.test(b) && /sell from WR/.test(b)));
  assert.ok(plan.bullets.some((b) => /set the lineup \(4 changes/.test(b)));
  assert.ok(plan.bullets.some((b) => /QB A week 11/.test(b)));
});
