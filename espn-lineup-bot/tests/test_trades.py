import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from advisor.trades import propose_trades, player_value, roster_player
from advisor.espn import build_lineup_transaction, plan_lineup_items
from advisor.optimizer import Player, optimize

ELIG = {"QB": ["QB", "BE"], "RB": ["RB", "RB/WR/TE", "BE"], "WR": ["WR", "RB/WR/TE", "BE"], "TE": ["TE", "RB/WR/TE", "BE"]}
SLOTS = {"QB": 1, "RB": 2, "WR": 2, "TE": 1, "RB/WR/TE": 1}


def rp(name, pos, value, status="ACTIVE"):
    return roster_player(name, pos, ELIG[pos], status, value, player_id=hash(name) % 10000)


def test_player_value_blends_toward_results():
    assert player_value(10, 20, 0) == 10
    assert player_value(10, 20, 8) == 15
    assert player_value(0, 7, 3) == 7


def test_trade_found_when_both_sides_gain():
    # I have a 4th RB rotting on my bench and a hole at WR; they have the mirror problem.
    mine = [rp("QB1", "QB", 18), rp("RB1", "RB", 15), rp("RB2", "RB", 14), rp("RB3", "RB", 13), rp("RB4", "RB", 12),
            rp("WR1", "WR", 8), rp("WR2", "WR", 2), rp("TE1", "TE", 8)]
    theirs = [rp("QBx", "QB", 17), rp("WRa", "WR", 15), rp("WRb", "WR", 14), rp("WRc", "WR", 13), rp("WRd", "WR", 12),
              rp("RBa", "RB", 8), rp("RBb", "RB", 2), rp("TEx", "TE", 8)]
    ideas = propose_trades(mine, {"Them": theirs}, SLOTS)
    assert ideas, "expected a surplus-for-need trade"
    top = ideas[0]
    assert top["give_pos"] == "RB" and top["get_pos"] == "WR"
    assert top["my_gain"] >= 1.0 and top["their_gain"] > 0
    assert "Offer" in top["pitch"]


def test_no_trade_for_injured_or_lopsided():
    mine = [rp("QB1", "QB", 18), rp("RB1", "RB", 15), rp("RB2", "RB", 14), rp("WR1", "WR", 12), rp("WR2", "WR", 11), rp("TE1", "TE", 8)]
    theirs = [rp("QBx", "QB", 17), rp("RBa", "RB", 20, status="INJURY_RESERVE"), rp("WRa", "WR", 12), rp("WRb", "WR", 11), rp("TEx", "TE", 8)]
    ideas = propose_trades(mine, {"Them": theirs}, SLOTS)
    assert all(i["get"] != "RBa" for i in ideas)


def test_never_offer_injured_or_ask_too_much():
    mine = [rp("QB1", "QB", 18), rp("RB1", "RB", 15), rp("RB2", "RB", 14), rp("WR1", "WR", 12), rp("WR2", "WR", 11),
            rp("TE1", "TE", 8), rp("WRir", "WR", 9, status="INJURY_RESERVE"), rp("RBlow", "RB", 4)]
    theirs = [rp("QBx", "QB", 17), rp("RBa", "RB", 13), rp("RBb", "RB", 12), rp("WRa", "WR", 14), rp("WRb", "WR", 13),
              rp("TEx", "TE", 8), rp("WRc", "WR", 12)]
    ideas = propose_trades(mine, {"Them": theirs}, SLOTS)
    assert all(i["give"] != "WRir" for i in ideas)
    assert all(i["get_value"] <= i["give_value"] * 1.15 for i in ideas)


def test_lineup_transaction_payload():
    players = [Player("A", "RB", ["RB", "BE"], "BE", 10, player_id=1), Player("B", "RB", ["RB", "BE"], "RB", 5, player_id=2),
               Player("C", "WR", ["WR", "BE"], "WR", 9, player_id=3, locked=True)]
    rec = optimize(players, {"RB": 1, "WR": 1})
    items = plan_lineup_items(players, rec)
    assert {(i["playerId"], i["fromLineupSlotId"], i["toLineupSlotId"]) for i in items} == {(1, 20, 2), (2, 2, 20)}
    tx = build_lineup_transaction(6, "{SWID}", 8, items)
    assert tx["teamId"] == 6 and tx["scoringPeriodId"] == 8 and tx["executionType"] == "EXECUTE"
    assert all(it["type"] == "LINEUP" for it in tx["items"]) and len(tx["items"]) == 2
