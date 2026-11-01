import test from "node:test";
import assert from "node:assert/strict";
import { proposeTrades, playerValue, rosterPlayer } from "../trades.js";
import { buildLineupTransaction } from "../espn.js";
import { planLineupItems } from "../report.js";
import { makePlayer, optimize } from "../optimizer.js";

const ELIG = { QB: ["QB", "BE"], RB: ["RB", "RB/WR/TE", "BE"], WR: ["WR", "RB/WR/TE", "BE"], TE: ["TE", "RB/WR/TE", "BE"] };
const SLOTS = { QB: 1, RB: 2, WR: 2, TE: 1, "RB/WR/TE": 1 };
const rp = (name, pos, value, status = "ACTIVE") => rosterPlayer(name, pos, ELIG[pos], status, value, name.length);

test("player value blends toward results", () => {
  assert.equal(playerValue(10, 20, 0), 10);
  assert.equal(playerValue(10, 20, 8), 15);
  assert.equal(playerValue(0, 7, 3), 7);
});

test("trade found when both sides gain", () => {
  const mine = [rp("QB1", "QB", 18), rp("RB1", "RB", 15), rp("RB2", "RB", 14), rp("RB3", "RB", 13), rp("RB4", "RB", 12), rp("WR1", "WR", 8), rp("WR2", "WR", 2), rp("TE1", "TE", 8)];
  const theirs = [rp("QBx", "QB", 17), rp("WRa", "WR", 15), rp("WRb", "WR", 14), rp("WRc", "WR", 13), rp("WRd", "WR", 12), rp("RBa", "RB", 8), rp("RBb", "RB", 2), rp("TEx", "TE", 8)];
  const ideas = proposeTrades(mine, { Them: theirs }, SLOTS);
  assert.ok(ideas.length);
  assert.equal(ideas[0].give_pos, "RB"); assert.equal(ideas[0].get_pos, "WR");
  assert.ok(ideas[0].my_gain >= 1 && ideas[0].their_gain > 0);
  assert.match(ideas[0].pitch, /^Offer/);
});

test("never trade for injured, never offer injured, never ask too much", () => {
  const mine = [rp("QB1", "QB", 18), rp("RB1", "RB", 15), rp("RB2", "RB", 14), rp("WR1", "WR", 12), rp("WR2", "WR", 11), rp("TE1", "TE", 8), rp("WRir", "WR", 9, "INJURY_RESERVE"), rp("RBlow", "RB", 4)];
  const theirs = [rp("QBx", "QB", 17), rp("RBa", "RB", 20, "INJURY_RESERVE"), rp("RBb", "RB", 12), rp("WRa", "WR", 14), rp("WRb", "WR", 13), rp("TEx", "TE", 8), rp("WRc", "WR", 12)];
  const ideas = proposeTrades(mine, { Them: theirs }, SLOTS);
  assert.ok(ideas.every((i) => i.get !== "RBa" && i.give !== "WRir" && i.get_value <= i.give_value * 1.15));
});

test("lineup transaction payload", () => {
  const players = [makePlayer({ name: "A", position: "RB", eligible: ["RB", "BE"], slot: "BE", proj: 10, playerId: 1 }),
    makePlayer({ name: "B", position: "RB", eligible: ["RB", "BE"], slot: "RB", proj: 5, playerId: 2 }),
    makePlayer({ name: "C", position: "WR", eligible: ["WR", "BE"], slot: "WR", proj: 9, playerId: 3, locked: true })];
  const items = planLineupItems(players, optimize(players, { RB: 1, WR: 1 }));
  assert.deepEqual(new Set(items.map((i) => `${i.playerId}:${i.fromLineupSlotId}>${i.toLineupSlotId}`)), new Set(["1:20>2", "2:2>20"]));
  const tx = buildLineupTransaction(6, "{SWID}", 8, items);
  assert.equal(tx.teamId, 6); assert.equal(tx.scoringPeriodId, 8); assert.equal(tx.executionType, "EXECUTE");
  assert.ok(tx.items.every((it) => it.type === "LINEUP") && tx.items.length === 2);
});
