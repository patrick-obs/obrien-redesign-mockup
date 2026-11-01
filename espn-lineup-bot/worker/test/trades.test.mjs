import test from "node:test";
import assert from "node:assert/strict";
import { proposeTrades, playerValue, rosterPlayer, tradeId } from "../trades.js";
import { buildLineupTransaction, buildTradeTransaction, buildAddTransaction } from "../espn.js";
import { planLineupItems } from "../report.js";
import { makePlayer, optimize } from "../optimizer.js";

const ELIG = { QB: ["QB", "BE"], RB: ["RB", "RB/WR/TE", "BE"], WR: ["WR", "RB/WR/TE", "BE"], TE: ["TE", "RB/WR/TE", "BE"] };
const SLOTS = { QB: 1, RB: 2, WR: 2, TE: 1, "RB/WR/TE": 1 };
let nextId = 100;
const rp = (name, pos, value, status = "ACTIVE") => rosterPlayer(name, pos, ELIG[pos], status, value, nextId++);

test("player value blends toward results", () => {
  assert.equal(playerValue(10, 20, 0), 10);
  assert.equal(playerValue(10, 20, 8), 15);
  assert.equal(playerValue(0, 7, 3), 7);
});

test("trade found when both sides gain", () => {
  const mine = [rp("QB1", "QB", 18), rp("RB1", "RB", 15), rp("RB2", "RB", 14), rp("RB3", "RB", 13), rp("RB4", "RB", 12), rp("WR1", "WR", 8), rp("WR2", "WR", 2), rp("TE1", "TE", 8)];
  const theirs = [rp("QBx", "QB", 17), rp("WRa", "WR", 15), rp("WRb", "WR", 14), rp("WRc", "WR", 13), rp("WRd", "WR", 12), rp("RBa", "RB", 8), rp("RBb", "RB", 2), rp("TEx", "TE", 8)];
  const ideas = proposeTrades(mine, { Them: { id: 7, players: theirs } }, SLOTS);
  assert.ok(ideas.length);
  const best = ideas[0];
  assert.ok(best.give.some((p) => p.pos === "RB") && best.get.every((p) => p.pos === "WR"), JSON.stringify(best));
  assert.ok(best.my_gain >= 1 && best.their_gain > 0);
  assert.equal(best.with_team_id, 7); assert.match(best.kind, /^[12]-for-[12]$/); assert.match(best.id, /^[0-9a-f]{8}$/);
  assert.ok(best.give.every((p) => typeof p.player_id === "number"));
  assert.match(best.pitch, /starts? at WR for you/); assert.match(best.pitch, /Net for you/);
  // Packages appear alongside singles and are never duplicated per outgoing package.
  const all = proposeTrades(mine, { Them: { id: 7, players: theirs } }, SLOTS, { perTeam: 20, perLeague: 40 });
  const kinds = new Set(all.map((i) => i.kind));
  assert.ok(kinds.has("1-for-1") && kinds.size >= 2, [...kinds].join(","));
  const keys = all.map((i) => `${i.with}|${i.give_names}`);
  assert.equal(new Set(keys).size, keys.length);
  assert.equal(tradeId(7, [{ name: "a" }], [{ name: "b" }]), tradeId(7, [{ name: "a" }], [{ name: "b" }]));
});

test("packages: a 2-for-1 is offered when consolidating helps both sides", () => {
  // I have four decent RBs and a hole at WR2; they have one star WR and bad RBs.
  const mine = [rp("QB1", "QB", 18), rp("RB1", "RB", 14), rp("RB2", "RB", 13), rp("RB3", "RB", 12), rp("RB4", "RB", 11), rp("WR1", "WR", 12), rp("WR2", "WR", 3), rp("TE1", "TE", 8)];
  const theirs = [rp("QBx", "QB", 17), rp("WRstar", "WR", 15), rp("WRb", "WR", 11), rp("WRc", "WR", 10), rp("RBa", "RB", 6), rp("RBb", "RB", 4), rp("RBc", "RB", 3), rp("TEx", "TE", 8)];
  const ideas = proposeTrades(mine, { Them: theirs }, SLOTS, { perTeam: 20, perLeague: 40 });
  const two = ideas.find((i) => i.kind === "2-for-1" && i.get[0].name === "WRstar");
  assert.ok(two, ideas.map((i) => `${i.kind} ${i.give_names}>${i.get_names}`).join(", "));
  assert.match(two.pitch, /clear a roster spot/);
  assert.ok(!two.give_names.includes("TE1"), "never trade away your only TE and leave the slot empty");
  // Nobody is asked to give two starters for one of equal value, and no package merely bolts a lateral swap onto a 1-for-1.
  assert.ok(ideas.every((i) => i.kind !== "1-for-2" || i.get_value <= i.give_value * 1.35));
  assert.ok(!ideas.some((i) => i.give_names.includes("TE1") && i.get_names.includes("TEx")), "lateral TE swap should be pruned");
  assert.equal(ideas[0].kind, "1-for-1");
});

test("never trade for injured, never offer injured, never ask too much", () => {
  const mine = [rp("QB1", "QB", 18), rp("RB1", "RB", 15), rp("RB2", "RB", 14), rp("WR1", "WR", 12), rp("WR2", "WR", 11), rp("TE1", "TE", 8), rp("WRir", "WR", 9, "INJURY_RESERVE"), rp("RBlow", "RB", 4)];
  const theirs = [rp("QBx", "QB", 17), rp("RBa", "RB", 20, "INJURY_RESERVE"), rp("RBb", "RB", 12), rp("WRa", "WR", 14), rp("WRb", "WR", 13), rp("TEx", "TE", 8), rp("WRc", "WR", 12)];
  const ideas = proposeTrades(mine, { Them: theirs }, SLOTS);
  const names = (ps) => ps.map((p) => p.name);
  assert.ok(ideas.every((i) => !names(i.get).includes("RBa") && !names(i.give).includes("WRir")));
  assert.ok(ideas.every((i) => Math.max(...i.get.map((p) => p.value)) <= Math.max(...i.give.map((p) => p.value)) * 1.15));
});

test("trade and add transaction payloads", () => {
  const tx = buildTradeTransaction(3, "{SWID}", 9, 7, [11, 12], [21]);
  assert.equal(tx.type, "TRADE_PROPOSAL"); assert.equal(tx.teamId, 3); assert.equal(tx.items.length, 3);
  assert.deepEqual(tx.items[0], { playerId: 11, type: "TRADE", fromTeamId: 3, toTeamId: 7 });
  assert.deepEqual(tx.items[2], { playerId: 21, type: "TRADE", fromTeamId: 7, toTeamId: 3 });
  const fa = buildAddTransaction(3, "{SWID}", 9, { addId: 5, dropId: 6 });
  assert.equal(fa.type, "FREEAGENT"); assert.ok(!("bidAmount" in fa));
  assert.deepEqual(fa.items, [{ playerId: 5, type: "ADD", toTeamId: 3, toLineupSlotId: 20 }, { playerId: 6, type: "DROP", fromTeamId: 3 }]);
  const wv = buildAddTransaction(3, "{SWID}", 9, { addId: 5, waiver: true, bid: 12 });
  assert.equal(wv.type, "WAIVER"); assert.equal(wv.bidAmount, 12); assert.equal(wv.items.length, 1);
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
