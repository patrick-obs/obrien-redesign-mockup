"""Runs lineup.py end to end against a fake League so no ESPN credentials are needed."""
import json, os, sys, types
from datetime import datetime, timedelta
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

ELIG = {
    "QB": ["QB", "OP", "BE"], "RB": ["RB", "RB/WR", "RB/WR/TE", "OP", "BE"],
    "WR": ["WR", "RB/WR", "WR/TE", "RB/WR/TE", "OP", "BE"],
    "TE": ["TE", "WR/TE", "RB/WR/TE", "OP", "BE"], "K": ["K", "BE"], "D/ST": ["D/ST", "BE"],
}
SLOTS = {"QB": 1, "RB": 2, "WR": 2, "TE": 1, "RB/WR/TE": 1, "D/ST": 1, "K": 1, "BE": 7, "IR": 2}


_ids = {}


def bp(name, pos, slot, proj, status="ACTIVE", bye=False, game_in_hours=24, pts=None, owned=50.0):
    return types.SimpleNamespace(
        playerId=_ids.setdefault(name, 1000 + len(_ids)), name=name, position=pos, eligibleSlots=ELIG[pos], slot_position=slot,
        projected_points=proj, injuryStatus=status, on_bye_week=bye, proTeam="KC",
        pro_opponent="BUF" if not bye else "None", pro_pos_rank=12, percent_owned=owned,
        stats={w: {"points": p} for w, p in (pts or {}).items()},
        projected_avg_points=proj, avg_points=proj,
        game_date=datetime.now() + timedelta(hours=game_in_hours),
    )


class Team:
    def __init__(self, tid, name, owners, w, l, roster=()):
        self.team_id, self.team_name, self.owners = tid, name, owners
        self.wins, self.losses, self.ties = w, l, 0
        self.points_for, self.points_against = 900.5, 850.25
        self.roster = list(roster)
        self.schedule, self.scores, self.outcomes = [], [], []


class Box:
    def __init__(self, home, away, hl, al, hp=110.0, ap=95.0):
        self.home_team, self.away_team = home, away
        self.home_lineup, self.away_lineup = hl, al
        self.home_projected, self.away_projected = hp, ap


MINE = [
    bp("QB A", "QB", "QB", 18.0, pts={8: 20, 7: 15, 6: 25}),
    bp("RB A", "RB", "RB", 14.0), bp("RB B", "RB", "RB", 9.0, status="OUT"),
    bp("RB C", "RB", "BE", 11.0), bp("WR A", "WR", "WR", 13.0, status="QUESTIONABLE"),
    bp("WR B", "WR", "WR", 10.0), bp("WR C", "WR", "RB/WR/TE", 7.0),
    bp("TE A", "TE", "TE", 8.0, bye=True), bp("TE B", "TE", "BE", 6.0),
    bp("K A", "K", "K", 8.0, game_in_hours=-2),
    bp("D A", "D/ST", "BE", 0.0, bye=True),               # D/ST slot left empty, only D/ST on bye
    bp("WR D", "WR", "IR", 0.0, status="INJURY_RESERVE"),
]
THEIRS = [
    bp("QB Z", "QB", "QB", 19.0), bp("RB Z", "RB", "RB", 12.0), bp("RB Y", "RB", "RB", 10.0),
    bp("WR Z", "WR", "WR", 11.0, status="DOUBTFUL"), bp("WR Y", "WR", "WR", 9.0),
    bp("TE Z", "TE", "TE", 7.0), bp("WR X", "WR", "RB/WR/TE", 6.0),
    bp("K Z", "K", "K", 7.0), bp("D Z", "D/ST", "D/ST", 6.0),
]
OTHERS = [bp("QB O", "QB", "QB", 15.0), bp("RB O", "RB", "RB", 10.0, status="OUT")]


class FakeLeague:
    started = True

    def __init__(self, league_id, year, espn_s2=None, swid=None):
        self.current_week = 9 if self.started else 0
        self.league_id, self.year = league_id, year
        self.settings = types.SimpleNamespace(name="Test League", position_slot_counts=SLOTS, reg_season_count=14)
        self.me = Team(3, "Patrick's Team", [{"id": "{ABC-123}"}], 5, 3, roster=MINE if self.started else [])
        self.opp = Team(7, "Rival", [{"id": "{XYZ}"}], 4, 4, roster=THEIRS if self.started else [])
        self.t3 = Team(9, "Third", [], 2, 6, roster=OTHERS if self.started else [])
        self.t4 = Team(10, "Fourth", [], 6, 2, roster=[] if not self.started else [bp("QB F", "QB", "QB", 1.0)])
        self.teams = [self.me, self.opp, self.t3, self.t4]
        # schedule: weeks 1..14 for me; week 9 is current
        self.me.schedule = [self.opp, self.t3, self.t4] * 5
        self.me.scores = [100.0] * 8
        self.me.outcomes = ["W", "L", "W", "W", "L", "W", "L", "W", "U", "U", "U", "U", "U", "U"]
        self.opp.scores = [90.0] * 8

    def box_scores(self, week=None):
        return [Box(self.opp, self.me, THEIRS, MINE), Box(self.t3, self.t4, OTHERS, [], hp=60.0, ap=-1)]

    def free_agents(self, week=None, size=50, position=None):
        return {"TE": [bp("TE FA", "TE", "FA", 9.5, owned=22.0)],
                "RB": [bp("RB FA", "RB", "FA", 5.0)],
                "D/ST": [bp("D FA", "D/ST", "FA", 6.5, owned=10.0)]}.get(position, [])

    def standings(self):
        return [self.t4, self.me, self.opp, self.t3]


class DormantLeague(FakeLeague):
    started = False


def run(monkeypatch, capsys, argv, league_cls=FakeLeague):
    fake_mod = types.ModuleType("espn_api.football"); fake_mod.League = league_cls
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
    # empty D/ST slot comes from league settings, not from the lineup as set
    assert "-- EMPTY --" in out and "No eligible player for D/ST" in out
    assert "D FA" in out and "fills your EMPTY slot" in out
    assert "TE FA" in out and "22% owned" in out
    assert "RB FA" not in out            # does not beat the weakest RB starter
    assert "Their problems as set: WR Z Doubtful" in out
    # league-wide sections
    assert "ALL MATCHUPS, WEEK 9" in out
    assert "Third (2-6) 60.0/15.0  vs  Fourth (6-2) n/a/0.0" in out
    assert "Third: RB O Out" in out
    assert "LEAGUE INJURY REPORT" in out and "Third: RB O (RB) Out" in out and "Fourth: healthy" in out
    assert "YOUR SEASON SO FAR" in out and "wk  1  W  100.0-90.0" in out
    assert "YOUR REMAINING SCHEDULE" in out and "wk 10  Rival" in out and "injuries: 1" in out
    assert "<- you" in out and "L3avg" in out and "20.0" in out


def test_lineup_items_are_planned(monkeypatch, capsys):
    out = run(monkeypatch, capsys, ["--json", "--no-waivers", "--brief"])
    d = json.loads(out)
    items = {(i["name"], i["from"], i["to"]) for i in d["lineup_items"]}
    assert ("RB C", "BE", "RB") in items and ("RB B", "RB", "BE") in items
    assert ("TE B", "BE", "TE") in items and ("TE A", "TE", "BE") in items
    assert all(i["name"] != "K A" for i in d["lineup_items"])      # locked, never moved
    assert all(i["name"] != "WR D" for i in d["lineup_items"])     # IR slot, never touched
    assert all(i["name"] != "D A" for i in d["lineup_items"])      # bye D/ST stays on bench


def test_trades_flag(monkeypatch, capsys):
    out = run(monkeypatch, capsys, ["--trades", "--no-waivers", "--brief"])
    assert "TRADE IDEAS" in out


def test_brief_skips_league_sections(monkeypatch, capsys):
    out = run(monkeypatch, capsys, ["--brief", "--no-waivers"])
    assert "ALL MATCHUPS" not in out and "LEAGUE INJURY REPORT" not in out
    assert "STANDINGS" in out


def test_json_report(monkeypatch, capsys):
    out = run(monkeypatch, capsys, ["--json", "--no-waivers"])
    d = json.loads(out)
    assert d["team"] == "Patrick's Team" and d["opponent"] == "Rival"
    assert d["waivers"] == {}
    assert d["recommended"]["TE"][0]["name"] == "TE B"
    assert d["recommended"]["D/ST"] == []
    assert d["recommended_lineup_proj"] > d["current_lineup_proj"]
    assert any(m.startswith("START RB C") for m in d["moves"])
    assert len(d["matchups"]) == 2
    assert next(t for t in d["injury_report"] if t["team"] == "Third")["injuries"] == ["RB O (RB) Out"]
    assert d["schedule"][0]["week"] == 10 and len(d["results"]) == 8


def test_dormant_league_exits_cleanly(monkeypatch, capsys):
    import pytest
    with pytest.raises(SystemExit) as ex:
        run(monkeypatch, capsys, [], league_cls=DormantLeague)
    assert "has not started" in str(ex.value)
