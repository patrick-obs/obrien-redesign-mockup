"""Runs lineup.py end to end against a fake League so no ESPN credentials are needed."""
import json, os, sys, types
from datetime import datetime, timedelta
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

ELIG = {
    "QB": ["QB", "OP", "BE"], "RB": ["RB", "RB/WR", "RB/WR/TE", "OP", "BE"],
    "WR": ["WR", "RB/WR", "WR/TE", "RB/WR/TE", "OP", "BE"],
    "TE": ["TE", "WR/TE", "RB/WR/TE", "OP", "BE"], "K": ["K", "BE"], "D/ST": ["D/ST", "BE"],
}


def bp(name, pos, slot, proj, status="ACTIVE", bye=False, game_in_hours=24, pts=None, owned=50.0):
    o = types.SimpleNamespace(
        name=name, position=pos, eligibleSlots=ELIG[pos], slot_position=slot,
        projected_points=proj, injuryStatus=status, on_bye_week=bye, proTeam="KC",
        pro_opponent="BUF" if not bye else "None", pro_pos_rank=12, percent_owned=owned,
        stats={w: {"points": p} for w, p in (pts or {}).items()},
        game_date=datetime.now() + timedelta(hours=game_in_hours),
    )
    return o


class Team:
    def __init__(self, tid, name, owners, w, l):
        self.team_id, self.team_name, self.owners = tid, name, owners
        self.wins, self.losses, self.ties = w, l, 0
        self.points_for, self.points_against = 900.5, 850.25


class Box:
    def __init__(self, home, away, hl, al):
        self.home_team, self.away_team = home, away
        self.home_lineup, self.away_lineup = hl, al
        self.home_projected, self.away_projected = 110.0, 95.0


class FakeLeague:
    def __init__(self, league_id, year, espn_s2=None, swid=None):
        self.current_week = 9
        self.settings = types.SimpleNamespace(name="Test League", position_slot_counts={})
        self.me = Team(3, "Patrick's Team", [{"id": "{ABC-123}"}], 5, 3)
        self.opp = Team(7, "Rival", [{"id": "{XYZ}"}], 4, 4)
        self.teams = [self.me, self.opp]

    def box_scores(self, week=None):
        mine = [
            bp("QB A", "QB", "QB", 18.0, pts={8: 20, 7: 15, 6: 25}),
            bp("RB A", "RB", "RB", 14.0), bp("RB B", "RB", "RB", 9.0, status="OUT"),
            bp("RB C", "RB", "BE", 11.0), bp("WR A", "WR", "WR", 13.0, status="QUESTIONABLE"),
            bp("WR B", "WR", "WR", 10.0), bp("WR C", "WR", "RB/WR/TE", 7.0),
            bp("TE A", "TE", "TE", 8.0, bye=True), bp("TE B", "TE", "BE", 6.0),
            bp("K A", "K", "K", 8.0, game_in_hours=-2), bp("D A", "D/ST", "D/ST", 7.0),
            bp("WR D", "WR", "IR", 0.0, status="INJURY_RESERVE"),
        ]
        theirs = [
            bp("QB Z", "QB", "QB", 19.0), bp("RB Z", "RB", "RB", 12.0), bp("RB Y", "RB", "RB", 10.0),
            bp("WR Z", "WR", "WR", 11.0, status="DOUBTFUL"), bp("WR Y", "WR", "WR", 9.0),
            bp("TE Z", "TE", "TE", 7.0), bp("WR X", "WR", "RB/WR/TE", 6.0),
            bp("K Z", "K", "K", 7.0), bp("D Z", "D/ST", "D/ST", 6.0),
        ]
        return [Box(self.opp, self.me, theirs, mine)]

    def free_agents(self, week=None, size=50, position=None):
        if position == "TE":
            return [bp("TE FA", "TE", "FA", 9.5, owned=22.0)]
        if position == "RB":
            return [bp("RB FA", "RB", "FA", 5.0)]
        return []

    def standings(self):
        return [self.me, self.opp]


def run(monkeypatch, capsys, argv):
    fake_mod = types.ModuleType("espn_api.football"); fake_mod.League = FakeLeague
    pkg = types.ModuleType("espn_api"); pkg.football = fake_mod
    monkeypatch.setitem(sys.modules, "espn_api", pkg)
    monkeypatch.setitem(sys.modules, "espn_api.football", fake_mod)
    monkeypatch.setenv("LEAGUE_ID", "1"); monkeypatch.setenv("SWID", "{abc-123}")
    monkeypatch.delenv("TEAM_ID", raising=False)
    monkeypatch.setattr(sys, "argv", ["lineup.py"] + argv)
    import lineup
    lineup.main()
    return capsys.readouterr().out


def test_text_report(monkeypatch, capsys):
    out = run(monkeypatch, capsys, [])
    assert "Patrick's Team (5-3)  vs  Rival (4-4)" in out
    assert "START RB C" in out and "SIT   RB B" in out and "out" in out
    assert "SIT   TE A" in out and "on bye" in out
    assert "START TE B" in out
    assert "WR A (WR) is questionable" in out
    assert "K A (K) is locked" in out
    assert "TE FA" in out and "22% owned" in out
    assert "RB FA" not in out            # does not beat the weakest RB starter
    assert "Their problems: WR Z (WR) Doubtful" in out
    assert "<- you" in out
    assert "L3avg" in out and "20.0" in out


def test_json_report(monkeypatch, capsys):
    out = run(monkeypatch, capsys, ["--json", "--no-waivers"])
    d = json.loads(out)
    assert d["team"] == "Patrick's Team" and d["opponent"] == "Rival"
    assert d["waivers"] == {}
    assert d["recommended"]["TE"][0]["name"] == "TE B"
    assert d["recommended_lineup_proj"] > d["current_lineup_proj"]
    assert any(m.startswith("START RB C") for m in d["moves"])
