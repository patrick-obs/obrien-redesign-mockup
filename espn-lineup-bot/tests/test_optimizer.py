import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from optimizer import Player, optimize, diff_lineup, warnings_for, slot_counts_from_lineup, projected_total


def P(name, pos, slot, proj, **kw):
    elig = {
        "QB": ["QB", "OP", "BE"],
        "RB": ["RB", "RB/WR", "RB/WR/TE", "OP", "BE"],
        "WR": ["WR", "RB/WR", "WR/TE", "RB/WR/TE", "OP", "BE"],
        "TE": ["TE", "WR/TE", "RB/WR/TE", "OP", "BE"],
        "K": ["K", "BE"],
        "D/ST": ["D/ST", "BE"],
    }[pos]
    return Player(name=name, position=pos, eligible=elig, slot=slot, proj=proj, **kw)


SLOTS = {"QB": 1, "RB": 2, "WR": 2, "TE": 1, "RB/WR/TE": 1, "D/ST": 1, "K": 1}


def test_flex_takes_best_leftover():
    roster = [
        P("QB1", "QB", "QB", 20),
        P("RB1", "RB", "RB", 15), P("RB2", "RB", "RB", 12), P("RB3", "RB", "BE", 11),
        P("WR1", "WR", "WR", 14), P("WR2", "WR", "WR", 10), P("WR3", "WR", "RB/WR/TE", 8),
        P("TE1", "TE", "TE", 9), P("K1", "K", "K", 8), P("D1", "D/ST", "D/ST", 7),
    ]
    a = optimize(roster, SLOTS)
    assert [p.name for p in a["RB/WR/TE"]] == ["RB3"]
    moves = diff_lineup(roster, a)
    assert any("START RB3" in m for m in moves)
    assert any("SIT   WR3" in m for m in moves)
    assert projected_total(a) == 106.0


def test_bye_and_out_players_benched():
    roster = [
        P("QB1", "QB", "QB", 20, bye=True), P("QB2", "QB", "BE", 14),
        P("RB1", "RB", "RB", 15, status="OUT"), P("RB2", "RB", "RB", 12), P("RB3", "RB", "BE", 6),
        P("WR1", "WR", "WR", 14), P("WR2", "WR", "WR", 10), P("WR3", "WR", "RB/WR/TE", 8),
        P("TE1", "TE", "TE", 9), P("K1", "K", "K", 8), P("D1", "D/ST", "D/ST", 7),
    ]
    a = optimize(roster, SLOTS)
    assert a["QB"][0].name == "QB2"
    assert {p.name for p in a["RB"]} == {"RB2", "RB3"}
    moves = diff_lineup(roster, a)
    assert any("SIT   QB1" in m and "bye" in m for m in moves)
    assert any("SIT   RB1" in m and "out" in m for m in moves)


def test_locked_starter_stays_put():
    roster = [
        P("QB1", "QB", "QB", 10, locked=True), P("QB2", "QB", "BE", 25),
        P("RB1", "RB", "RB", 15), P("RB2", "RB", "RB", 12),
        P("WR1", "WR", "WR", 14), P("WR2", "WR", "WR", 10), P("WR3", "WR", "RB/WR/TE", 8),
        P("TE1", "TE", "TE", 9), P("K1", "K", "K", 8), P("D1", "D/ST", "D/ST", 7),
    ]
    a = optimize(roster, SLOTS)
    assert a["QB"][0].name == "QB1"
    w = warnings_for(roster, a, SLOTS)
    assert any("locked" in x for x in w)


def test_empty_slot_warns():
    roster = [P("RB1", "RB", "RB", 15)]
    slots = {"RB": 1, "K": 1}
    a = optimize(roster, slots)
    w = warnings_for(roster, a, slots)
    assert any("No eligible player for K" in x for x in w)


def test_slot_counts_inferred():
    roster = [P("QB1", "QB", "QB", 1), P("RB1", "RB", "RB", 1), P("RB2", "RB", "RB", 1),
              P("RB3", "RB", "BE", 1), P("X", "RB", "IR", 1)]
    assert slot_counts_from_lineup(roster) == {"QB": 1, "RB": 2}


def test_doubtful_discounted_but_questionable_kept():
    roster = [P("WR1", "WR", "WR", 12, status="DOUBTFUL"), P("WR2", "WR", "BE", 6),
              P("WR3", "WR", "BE", 9, status="QUESTIONABLE")]
    a = optimize(roster, {"WR": 2})
    assert {p.name for p in a["WR"]} == {"WR3", "WR2"}
