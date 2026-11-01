import test from "node:test";
import assert from "node:assert/strict";
import { makePlayer, optimize, diffLineup, warningsFor, slotCountsFromLineup, projectedTotal } from "../optimizer.js";
import { ELIG } from "./fixtures.mjs";

const P = (name, pos, slot, proj, extra = {}) => makePlayer({ name, position: pos, eligible: ELIG[pos], slot, proj, ...extra });
const SLOTS = { QB: 1, RB: 2, WR: 2, TE: 1, "RB/WR/TE": 1, "D/ST": 1, K: 1 };

test("flex takes best leftover", () => {
  const roster = [P("QB1", "QB", "QB", 20), P("RB1", "RB", "RB", 15), P("RB2", "RB", "RB", 12), P("RB3", "RB", "BE", 11),
    P("WR1", "WR", "WR", 14), P("WR2", "WR", "WR", 10), P("WR3", "WR", "RB/WR/TE", 8), P("TE1", "TE", "TE", 9), P("K1", "K", "K", 8), P("D1", "D/ST", "D/ST", 7)];
  const a = optimize(roster, SLOTS);
  assert.deepEqual(a["RB/WR/TE"].map((p) => p.name), ["RB3"]);
  const moves = diffLineup(roster, a);
  assert.ok(moves.some((m) => m.includes("START RB3")) && moves.some((m) => m.includes("SIT   WR3")));
  assert.equal(projectedTotal(a), 106.0);
});

test("bye and out players benched", () => {
  const roster = [P("QB1", "QB", "QB", 20, { bye: true }), P("QB2", "QB", "BE", 14), P("RB1", "RB", "RB", 15, { status: "OUT" }), P("RB2", "RB", "RB", 12),
    P("RB3", "RB", "BE", 6), P("WR1", "WR", "WR", 14), P("WR2", "WR", "WR", 10), P("WR3", "WR", "RB/WR/TE", 8), P("TE1", "TE", "TE", 9), P("K1", "K", "K", 8), P("D1", "D/ST", "D/ST", 7)];
  const a = optimize(roster, SLOTS);
  assert.equal(a.QB[0].name, "QB2");
  assert.deepEqual(new Set(a.RB.map((p) => p.name)), new Set(["RB2", "RB3"]));
  const moves = diffLineup(roster, a);
  assert.ok(moves.some((m) => m.includes("SIT   QB1") && m.includes("bye")));
  assert.ok(moves.some((m) => m.includes("SIT   RB1") && m.includes("out")));
});

test("locked starter stays put", () => {
  const roster = [P("QB1", "QB", "QB", 10, { locked: true }), P("QB2", "QB", "BE", 25), P("RB1", "RB", "RB", 15), P("RB2", "RB", "RB", 12),
    P("WR1", "WR", "WR", 14), P("WR2", "WR", "WR", 10), P("WR3", "WR", "RB/WR/TE", 8), P("TE1", "TE", "TE", 9), P("K1", "K", "K", 8), P("D1", "D/ST", "D/ST", 7)];
  const a = optimize(roster, SLOTS);
  assert.equal(a.QB[0].name, "QB1");
  assert.ok(warningsFor(roster, a, SLOTS).some((w) => w.includes("locked")));
});

test("empty slot warns and unplayable players never fill it", () => {
  const roster = [P("RB1", "RB", "RB", 15), P("K1", "K", "BE", 9, { bye: true })];
  const slots = { RB: 1, K: 1 };
  const a = optimize(roster, slots);
  assert.equal(a.K.length, 0);
  assert.ok(warningsFor(roster, a, slots).some((w) => w.includes("No eligible player for K")));
});

test("slot counts inferred", () => {
  assert.deepEqual(slotCountsFromLineup([P("QB1", "QB", "QB", 1), P("RB1", "RB", "RB", 1), P("RB2", "RB", "RB", 1), P("RB3", "RB", "BE", 1), P("X", "RB", "IR", 1)]), { QB: 1, RB: 2 });
});

test("doubtful discounted, questionable kept", () => {
  const roster = [P("WR1", "WR", "WR", 12, { status: "DOUBTFUL" }), P("WR2", "WR", "BE", 6), P("WR3", "WR", "BE", 9, { status: "QUESTIONABLE" })];
  const a = optimize(roster, { WR: 2 });
  assert.deepEqual(new Set(a.WR.map((p) => p.name)), new Set(["WR3", "WR2"]));
});
