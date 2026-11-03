import test from "node:test";
import assert from "node:assert/strict";
import { buildCancelTransaction, buildRespondTransaction, buildLineupTransaction, cancelTrade, respondTrade, applyLineup, tradeTransactions } from "../espn.js";

const cookies = { swid: "{ABC}", espn_s2: "s2" };
const capture = (posts, status = 200, body = { status: "CANCELED" }) => async (url, init) => { posts.push({ url, method: init.method, body: JSON.parse(init.body) }); return { status, text: async () => JSON.stringify(body), json: async () => body, headers: { get: () => null } }; };

test("withdrawing an offer is ESPN's TRADE_PROPOSAL + CANCEL posted to the collection with the current week", async () => {
  const posts = [];
  const r = await cancelTrade(capture(posts), cookies, 2026, 42, 3, "f420-1", 9);
  assert.equal(r.ok, true); assert.equal(posts.length, 1);
  assert.match(posts[0].url, /leagues\/42\/transactions\/$/); assert.equal(posts[0].method, "POST");
  assert.deepEqual(posts[0].body, { isLeagueManager: false, teamId: 3, type: "TRADE_PROPOSAL", memberId: "{ABC}", scoringPeriodId: 9, executionType: "CANCEL", relatedTransactionId: "f420-1" });
  const none = await cancelTrade(capture(posts), cookies, 2026, 42, 3, "f420-1", null);
  assert.equal(none.ok, false); assert.equal(posts.length, 1, "no week, nothing sent");
});

test("accepting and declining are TRADE_ACCEPT / TRADE_DECLINE naming the offer", async () => {
  const posts = [];
  await respondTrade(capture(posts), cookies, 2026, 42, 3, "offer-1", true, 9);
  await respondTrade(capture(posts), cookies, 2026, 42, 3, "offer-1", false, 9);
  assert.equal(posts[0].body.type, "TRADE_ACCEPT"); assert.equal(posts[0].body.executionType, "EXECUTE"); assert.equal(posts[0].body.relatedTransactionId, "offer-1"); assert.equal(posts[0].body.scoringPeriodId, 9); assert.equal(posts[0].body.items, undefined);
  assert.equal(posts[1].body.type, "TRADE_DECLINE");
  assert.deepEqual(buildRespondTransaction(3, "{ABC}", 9, "offer-1", true, [111]).items, [{ playerId: 111, type: "DROP", fromTeamId: 3 }]);
  assert.equal(buildCancelTransaction(3, "{ABC}", 9, "x").relatedTransactionId, "x");
});

test("a lineup for a later week than ESPN's current one goes as FUTURE_ROSTER", async () => {
  const posts = [];
  const items = [{ playerId: 1, from: "BE", to: "RB" }];
  await applyLineup(capture(posts), cookies, 2026, 42, 3, 9, items, 9);
  await applyLineup(capture(posts), cookies, 2026, 42, 3, 10, items, 9);
  await applyLineup(capture(posts), cookies, 2026, 42, 3, 10, items);
  assert.equal(posts[0].body.type, "ROSTER"); assert.equal(posts[1].body.type, "FUTURE_ROSTER"); assert.equal(posts[1].body.scoringPeriodId, 10);
  assert.equal(posts[2].body.type, "ROSTER", "without the current week we cannot tell, so the plain type");
  assert.equal(buildLineupTransaction(3, "{ABC}", 10, items, true).type, "FUTURE_ROSTER");
});

test("the transaction log folds cancel, decline and accept rows into the proposal's status", async () => {
  const league = { season: 2026, id: 42, byId: { 7: { name: "Rival", logo: "" }, 8: { name: "Other" } } };
  const items = (a, b) => [{ type: "TRADE", playerId: 1, fromTeamId: a, toTeamId: b }, { type: "TRADE", playerId: 2, fromTeamId: b, toTeamId: a }];
  const far = Date.now() + 86400e3, past = Date.now() - 1000;
  const data = { transactions: [
    { id: "p1", type: "TRADE_PROPOSAL", teamId: 3, status: "PENDING", items: items(3, 7), expirationDate: far },
    { id: "c1", type: "TRADE_PROPOSAL", teamId: 3, status: "CANCELED", executionType: "CANCEL", relatedTransactionId: "p1", items: items(3, 7) },
    { id: "p2", type: "TRADE_PROPOSAL", teamId: 3, status: "PENDING", items: items(3, 8), expirationDate: far },
    { id: "d2", type: "TRADE_DECLINE", teamId: 8, relatedTransactionId: "p2" },
    { id: "p3", type: "TRADE_PROPOSAL", teamId: 7, status: "PENDING", items: items(7, 3), expirationDate: far },
    { id: "a3", type: "TRADE_ACCEPT", teamId: 3, relatedTransactionId: "p3" },
    { id: "p4", type: "TRADE_PROPOSAL", teamId: 3, status: "PENDING", items: items(3, 7), expirationDate: far },
    { id: "a4", type: "TRADE_ACCEPT", teamId: 7, relatedTransactionId: "p4" },
    { id: "x4", type: "TRADE_ACCEPT", teamId: 3, executionType: "PROCESS", status: "EXECUTED", relatedTransactionId: "p4" },
    { id: "p5", type: "TRADE_PROPOSAL", teamId: 3, status: "PENDING", items: items(3, 7), expirationDate: past },
    { id: "p6", type: "TRADE_PROPOSAL", teamId: 3, status: "PENDING", items: items(3, 7), expirationDate: far },
    { id: "p7", type: "TRADE_PROPOSAL", teamId: 7, status: "PENDING", items: items(7, 8), expirationDate: far },
  ] };
  const fetchFn = async () => ({ status: 200, text: async () => JSON.stringify(data), json: async () => data, headers: { get: () => null } });
  const out = await tradeTransactions(fetchFn, cookies, league, 3);
  const by = Object.fromEntries(out.map((t) => [t.id, t.status]));
  assert.deepEqual(by, { p1: "CANCELED", p2: "REJECTED", p3: "ACCEPTED", p4: "EXECUTED", p5: "EXPIRED", p6: "PENDING" });
  assert.ok(!out.some((t) => t.id === "c1"), "the cancel row is not a second offer");
  assert.equal(out.find((t) => t.id === "p3").mine, false);
});
