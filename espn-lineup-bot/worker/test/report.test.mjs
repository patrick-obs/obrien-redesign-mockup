import test from "node:test";
import assert from "node:assert/strict";
import { buildReport } from "../report.js";
import { fakeLeague, fakeBoxes, FA, NOW } from "./fixtures.mjs";

test("report: lineup, warnings, waivers, league-wide sections", () => {
  const league = fakeLeague();
  const me = league.byId[3];
  const r = buildReport(league, me, fakeBoxes(league), 9, NOW, FA);
  assert.equal(r.team, "Patrick's Team"); assert.equal(r.opponent, "Rival"); assert.equal(r.record, "5-3");
  assert.ok(r.moves.some((m) => m.startsWith("START RB C")) && r.moves.some((m) => m.startsWith("SIT   RB B") && m.includes("out")));
  assert.ok(r.moves.some((m) => m.startsWith("SIT   TE A") && m.includes("bye")) && r.moves.some((m) => m.startsWith("START TE B")));
  assert.ok(r.warnings.some((w) => w.includes("No eligible player for D/ST")));
  assert.ok(r.warnings.some((w) => w.includes("WR A (WR) is questionable")) && !r.warnings.some((w) => w.includes("locked")));
  assert.deepEqual(r.recommended["D/ST"], []);
  assert.equal(r.recommended.TE[0].name, "TE B");
  assert.ok(r.recommended_lineup_proj > r.current_lineup_proj);
  // waivers
  assert.equal(r.waivers["D/ST"][0].name, "D FA"); assert.equal(r.waivers["D/ST"][0].fills_empty_slot, true);
  assert.equal(r.waivers.TE[0].name, "TE FA"); assert.equal(r.waivers.TE[0].owned, 22);
  assert.ok(!r.waivers.RB);
  // lineup items
  const items = new Set(r.lineup_items.map((i) => `${i.name}:${i.from}>${i.to}`));
  assert.ok(items.has("RB C:BE>RB") && items.has("RB B:RB>BE") && items.has("TE B:BE>TE") && items.has("TE A:TE>BE"));
  assert.ok(!r.lineup_items.some((i) => ["K A", "WR D", "D A"].includes(i.name)));
  // opponent + league-wide
  assert.deepEqual(r.opponent_issues, ["WR Z Doubtful"]);
  assert.equal(r.matchups.length, 2);
  assert.equal(r.matchups[1][0].team, "Third"); assert.equal(r.matchups[1][0].best_lineup_proj, 15); assert.equal(r.matchups[1][0].problems[0], "RB O Out");
  assert.deepEqual(r.injury_report.find((t) => t.team === "Third").injuries, ["RB O (RB) Out"]);
  assert.deepEqual(r.injury_report.find((t) => t.team === "Fourth").injuries, []);
  assert.equal(r.results.length, 8); assert.equal(r.results[0].score, 100); assert.equal(r.results[0].opp_score, 90);
  assert.equal(r.schedule[0].week, 10); assert.equal(r.schedule[0].opponent, "Rival"); assert.equal(r.schedule[0].injuries.length, 1);
  assert.equal(r.schedule[1].opponent, "Third"); assert.deepEqual(r.schedule[1].injuries, ["RB O (RB) Out"]);
  assert.equal(r.standings[0].team, "Fourth"); assert.equal(r.standings[1].team_id, 3);
});
