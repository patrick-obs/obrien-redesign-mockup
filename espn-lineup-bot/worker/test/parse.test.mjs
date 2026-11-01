import test from "node:test";
import assert from "node:assert/strict";
import { parseLeague, parseBoxPlayer, proScheduleForWeek, findTeam } from "../espn.js";

const season = 2026;
const raw = {
  draftDetail: { drafted: true }, scoringPeriodId: 8, seasonId: season,
  status: { currentMatchupPeriod: 8, finalScoringPeriod: 17, latestScoringPeriod: 8 },
  settings: { name: "UR1NE", rosterSettings: { lineupSlotCounts: { 0: 1, 2: 2, 4: 2, 6: 1, 16: 1, 17: 1, 20: 7, 21: 2, 23: 1, 3: 0 } },
    scheduleSettings: { matchupPeriodCount: 14, matchupPeriods: { 1: [1], 2: [2] } } },
  members: [{ id: "{AAA}", displayName: "fan1" }],
  teams: [{ id: 6, abbrev: "WOOD", name: "Woodslayer", owners: ["{AAA}"], playoffSeed: 4, record: { overall: { wins: 3, losses: 4, ties: 0, pointsFor: 821.9, pointsAgainst: 866.123 } } },
    { id: 1, abbrev: "SP", name: "Serving Punt", owners: ["{BBB}"], playoffSeed: 1, record: { overall: { wins: 5, losses: 2, ties: 0, pointsFor: 993.9, pointsAgainst: 817.6 } } }],
  schedule: [{ id: 2, matchupPeriodId: 2, home: { teamId: 6, totalPoints: 127.7 }, away: { teamId: 1, totalPoints: 151.8 }, winner: "AWAY" },
    { id: 1, matchupPeriodId: 1, home: { teamId: 1, totalPoints: 86.5 }, away: { teamId: 6, totalPoints: 114.0 }, winner: "AWAY" },
    { id: 3, matchupPeriodId: 3, home: { teamId: 6, totalPoints: 0 }, winner: "UNDECIDED" }],
};

test("parseLeague", () => {
  const lg = parseLeague(raw, season, 1740217857);
  assert.equal(lg.name, "UR1NE"); assert.equal(lg.currentWeek, 8); assert.equal(lg.started, true); assert.equal(lg.regSeasonCount, 14);
  assert.deepEqual(lg.slotCounts, { QB: 1, RB: 2, WR: 2, TE: 1, "D/ST": 1, K: 1, BE: 7, IR: 2, "RB/WR/TE": 1 });
  const me = lg.byId[6];
  assert.deepEqual(me.schedule, [1, 1, 6]); assert.deepEqual(me.outcomes, ["W", "L", "U"]); assert.deepEqual(me.scores, [114.0, 127.7, 0]);
  assert.equal(me.pointsAgainst, 866.12);
  assert.equal(findTeam(lg, "{aaa}").id, 6);
  assert.throws(() => findTeam(lg, "{nope}"), /Could not match/);
  assert.equal(parseLeague({ ...raw, draftDetail: { drafted: false }, scoringPeriodId: 0 }, season, 1).started, false);
});

test("parseBoxPlayer from a roster entry", () => {
  const all = { 12: { 8: [{ homeProTeamId: 12, awayProTeamId: 2, date: Date.UTC(2026, 10, 1, 18) }] }, 23: {} };
  const sched = proScheduleForWeek(all, 8);
  assert.deepEqual(sched[12], { opp: 2, date: Date.UTC(2026, 10, 1, 18) });
  const ratings = { 1: { 2: 17 } };
  const entry = { lineupSlotId: 0, injuryStatus: "NORMAL", playerPoolEntry: { player: { id: 3918298, fullName: "Josh Allen", defaultPositionId: 1, proTeamId: 12,
    eligibleSlots: [0, 7, 20, 21], injuryStatus: "ACTIVE", ownership: { percentOwned: 99.9 },
    stats: [{ seasonId: 2026, scoringPeriodId: 8, statSourceId: 1, statSplitTypeId: 1, appliedTotal: 23.7 },
      { seasonId: 2026, scoringPeriodId: 7, statSourceId: 0, statSplitTypeId: 1, appliedTotal: 30.1, proTeamId: 12 },
      { seasonId: 2026, scoringPeriodId: 0, statSourceId: 1, statSplitTypeId: 0, appliedTotal: 300, appliedAverage: 22.5 },
      { seasonId: 2026, scoringPeriodId: 0, statSourceId: 1, statSplitTypeId: 2, appliedTotal: 999, appliedAverage: 99 },
      { seasonId: 2025, scoringPeriodId: 8, statSourceId: 1, statSplitTypeId: 1, appliedTotal: 1 }] } } };
  const before = Date.UTC(2026, 10, 1, 17), after = Date.UTC(2026, 10, 1, 19);
  const p = parseBoxPlayer(entry, 2026, 8, sched, ratings, before);
  assert.equal(p.name, "Josh Allen"); assert.equal(p.position, "QB"); assert.equal(p.slot, "QB"); assert.equal(p.proj, 23.7);
  assert.equal(p.proTeam, "KC"); assert.equal(p.opponent, "BUF"); assert.equal(p.oppRank, 17); assert.equal(p.locked, false); assert.equal(p.bye, false);
  assert.deepEqual(p.eligible, ["QB", "OP", "BE", "IR"]); assert.equal(p.status, "ACTIVE"); assert.equal(p.recentAvg, 30.1); assert.equal(p.seasonProjAvg, 22.5);
  assert.equal(parseBoxPlayer(entry, 2026, 8, sched, ratings, after).locked, true);
  const byeEntry = { lineupSlotId: 20, injuryStatus: "QUESTIONABLE", playerPoolEntry: { player: { id: 1, fullName: "Bye Guy", defaultPositionId: 2, proTeamId: 23, eligibleSlots: [2, 23, 20], stats: [] } } };
  const b = parseBoxPlayer(byeEntry, 2026, 8, sched, ratings, before);
  assert.equal(b.bye, true); assert.equal(b.slot, "BE"); assert.equal(b.status, "QUESTIONABLE"); assert.equal(b.proTeam, "PIT"); assert.equal(b.locked, false);
  // kona free-agent wrap shape
  const fa = parseBoxPlayer({ player: { id: 5, fullName: "FA Guy", defaultPositionId: 16, proTeamId: 12, eligibleSlots: [16, 20], stats: [] }, status: "FREEAGENT" }, 2026, 8, sched, ratings, before);
  assert.equal(fa.slot, "FA"); assert.equal(fa.position, "D/ST"); assert.deepEqual(fa.eligible, ["D/ST", "BE"]);
});
