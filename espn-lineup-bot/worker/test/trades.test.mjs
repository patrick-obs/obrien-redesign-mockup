import test from "node:test";
import assert from "node:assert/strict";
import { proposeTrades, playerValue, rosterPlayer, tradeId, blitzSet, robustSet } from "../trades.js";
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

test("blitz set: best first, no player twice, one offer per manager, busy players skipped", () => {
  const mk = (id, withId, give, get, gain) => ({ id, with_team_id: withId, give: give.map((n) => ({ player_id: n })), get: get.map((n) => ({ player_id: n })), my_gain: gain });
  const board = [mk("a", 7, [1], [20], 6), mk("b", 7, [2], [21], 5.5), mk("c", 9, [1], [30], 5), mk("d", 9, [3], [31], 4), mk("e", 10, [4, 5], [40], 3), mk("f", 11, [6], [41], 2)];
  assert.deepEqual(blitzSet(board).map((t) => t.id), ["a", "d", "e", "f"]);
  assert.deepEqual(blitzSet(board, { busy: new Set([1]) }).map((t) => t.id), ["b", "d", "e", "f"]);
  assert.deepEqual(blitzSet(board, { max: 2 }).map((t) => t.id), ["a", "d"]);
});

test("value parity: a bench player does not buy a starter unless their lineup clearly improves", () => {
  const ELIG = { QB: ["QB", "BE"], RB: ["RB", "RB/WR/TE", "BE"], WR: ["WR", "RB/WR/TE", "BE"], TE: ["TE", "RB/WR/TE", "BE"] };
  let n = 900; const rp = (name, pos, v) => rosterPlayer(name, pos, ELIG[pos], "ACTIVE", v, n++);
  // My backup QB (15) for their starting WR (14): their lineup barely moves (they already start a 20-point QB) and they lose value.
  const mine = [rp("QB1", "QB", 24), rp("QBb", "QB", 15), rp("RB1", "RB", 14), rp("RB2", "RB", 12), rp("WR1", "WR", 12), rp("WR2", "WR", 3), rp("TE1", "TE", 7)];
  // They have an equal receiver on the bench, so their lineup does not move; a rational manager still says no to a backup QB.
  const theirs = [rp("QBx", "QB", 20), rp("RBa", "RB", 13), rp("RBb", "RB", 12), rp("WRa", "WR", 14), rp("WRb", "WR", 13), rp("WRc", "WR", 12), rp("WRd", "WR", 14), rp("TEx", "TE", 7)];
  const SLOTS = { QB: 1, RB: 2, WR: 2, TE: 1, "RB/WR/TE": 1 };
  const ideas = proposeTrades(mine, { Them: { id: 7, players: theirs } }, SLOTS, { perTeam: 20, perLeague: 40 });
  assert.ok(!ideas.some((i) => i.give_names === "QBb"), ideas.map((i) => `${i.give_names}>${i.get_names}`).join(", "));
  const loose = proposeTrades(mine, { Them: { id: 7, players: theirs } }, SLOTS, { perTeam: 20, perLeague: 40, parity: 0, requireStart: false });
  assert.ok(loose.some((i) => i.give_names === "QBb"), "without the rules the engine would offer it: " + loose.map((i) => `${i.give_names}>${i.get_names}`).join(", "));
});

test("robust set: two offers that are each fine alone but empty a slot together are not both sent", () => {
  const ELIG = { QB: ["QB", "BE"], RB: ["RB", "BE"], WR: ["WR", "BE"], TE: ["TE", "BE"] };
  let n = 700; const rp = (name, pos, v) => rosterPlayer(name, pos, ELIG[pos], "ACTIVE", v, n++);
  const SLOTS = { QB: 1, RB: 1, WR: 2, TE: 1 };
  // Three receivers for two slots: trading any one for a better back helps; trading two leaves a WR slot empty.
  const mine = [rp("QB1", "QB", 18), rp("RB1", "RB", 8), rp("WR1", "WR", 12), rp("WR2", "WR", 11), rp("WR3", "WR", 10), rp("TE1", "TE", 7)];
  const teamA = [rp("RBa", "RB", 16), rp("QBa", "QB", 15), rp("WRa", "WR", 9), rp("WRb", "WR", 9), rp("TEa", "TE", 6)];
  const teamB = [rp("RBb", "RB", 15), rp("QBb", "QB", 15), rp("WRc", "WR", 9), rp("WRd", "WR", 9), rp("TEb", "TE", 6)];
  const pj = (p) => ({ name: p.name, pos: p.position, value: p.proj, player_id: p.playerId });
  const offer = (id, withId, give, get, gain) => ({ id, with: `T${withId}`, with_team_id: withId, give: give.map(pj), get: get.map(pj), my_gain: gain, give_names: give.map((p) => p.name).join(" + "), get_names: get.map((p) => p.name).join(" + "), their_gain: 0, pitch: "" });
  const board = [offer("a", 1, [mine[2]], [teamA[0]], 8), offer("b", 2, [mine[3]], [teamB[0]], 7)];
  const set = robustSet(board, { mine, rosters: { 1: teamA, 2: teamB }, slotCounts: SLOTS });
  assert.equal(set.offers.length, 1, "only one of the two can be out safely: " + set.offers.map((o) => o.id).join(","));
  assert.equal(set.offers[0].id, "a");
  // With a fourth receiver both are safe together.
  const deeper = mine.concat([rp("WR4", "WR", 9)]);
  const set2 = robustSet(board, { mine: deeper, rosters: { 1: teamA, 2: teamB }, slotCounts: SLOTS });
  assert.equal(set2.offers.length, 2); assert.ok(set2.if_all_accepted > 0);
  // Roster limit: a 1-for-2 that would overfill the roster is skipped.
  const two = offer("c", 1, [mine[2]], [teamA[0], teamA[2]], 9);
  const set3 = robustSet([two], { mine, rosters: { 1: teamA, 2: teamB }, slotCounts: SLOTS, rosterSize: 6, rosterCount: 6 });
  assert.equal(set3.offers.length, 0);
});
