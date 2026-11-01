"""Web app tests with ESPN stubbed out: login, dashboard, league page, preview and apply."""
import os, sys, types
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import pytest

import test_report as fr  # fake league fixtures


class FakeSession:
    """Stands in for requests.Session; records the lineup POST."""
    posts = []

    def post(self, url, json=None, cookies=None, headers=None, timeout=None):
        FakeSession.posts.append({"url": url, "json": json, "cookies": cookies})
        return types.SimpleNamespace(status_code=200, json=lambda: {"id": "tx1"}, text="")


@pytest.fixture
def client(monkeypatch, tmp_path):
    monkeypatch.setenv("APP_PASSWORD", "open-sesame")
    monkeypatch.setenv("SECRET_KEY", "test")
    monkeypatch.setenv("ESPN_S2", "s2cookie")
    monkeypatch.setenv("SWID", "{abc-123}")
    monkeypatch.setenv("DATA_DIR", str(tmp_path))
    import app as webapp
    import advisor.espn as espn
    monkeypatch.setattr(webapp, "DATA_DIR", tmp_path)
    def fake_load(lid, season, s2, swid):
        lg = fr.FakeLeague(lid, season) if lid == 1 else fr.DormantLeague(lid, season)
        if lid != 1:
            lg.settings.name = "Dead League"
        return lg
    monkeypatch.setattr(webapp, "load_league", fake_load)
    monkeypatch.setattr(webapp, "discover_leagues", lambda swid, s2, season: [
        {"league_id": 1, "league_name": "Test League", "team_id": 3, "team_name": "Patrick's Team", "season": season},
        {"league_id": 2, "league_name": "Dead League", "team_id": 1, "team_name": "X", "season": season}])
    monkeypatch.setattr(webapp, "apply_lineup", lambda *a, **kw: espn.apply_lineup(*a, session=FakeSession(), **kw))
    webapp.clear_cache()
    FakeSession.posts.clear()
    webapp.app.config["TESTING"] = True
    return webapp.app.test_client()


def login(c):
    return c.post("/login", data={"password": "open-sesame"}, follow_redirects=True)


def test_requires_login(client):
    r = client.get("/")
    assert r.status_code == 302 and "/login" in r.headers["Location"]
    r = client.post("/login", data={"password": "nope"})
    assert b"Wrong passphrase" in r.data


def test_dashboard_and_league_page(client):
    r = login(client)
    assert r.status_code == 200
    html = r.data.decode()
    assert "Test League" in html and "Dead League" in html and "Not started" in html
    assert "Set all lineups" in html and "lineup change" in html
    assert "START RB C" in html
    r = client.get("/league/1")
    html = r.data.decode()
    assert "Recommended lineup" in html and "EMPTY" in html and "nobody eligible" in html
    assert "Trade ideas" in html and "Waiver watch" in html and "League injury report" in html
    assert "Remaining schedule" in html and "Standings" in html


def test_preview_then_apply(client):
    login(client)
    r = client.get("/lineups")
    html = r.data.decode()
    assert "Confirm and send to ESPN" in html and "RB C" in html and "Dead League" not in html
    assert FakeSession.posts == []           # preview never writes
    # a POST without the CSRF token is refused
    assert client.post("/lineups", data={}).status_code == 400
    with client.session_transaction() as s:
        token = s["csrf"]
    r = client.post("/lineups", data={"csrf": token})
    assert b"Lineup set." in r.data
    assert len(FakeSession.posts) == 1
    tx = FakeSession.posts[0]["json"]
    assert tx["teamId"] == 3 and tx["type"] == "ROSTER" and tx["memberId"] == "{abc-123}"
    moved = {(i["playerId"], i["fromLineupSlotId"], i["toLineupSlotId"]) for i in tx["items"]}
    assert all(f != 21 and t != 21 for _, f, t in moved)   # IR untouched
    assert "leagues/1/transactions" in FakeSession.posts[0]["url"]
    assert FakeSession.posts[0]["cookies"] == {"espn_s2": "s2cookie", "SWID": "{abc-123}"}


def test_settings_saves_cookies(client, tmp_path):
    login(client)
    client.get("/settings")  # renders the form, which issues the CSRF token
    with client.session_transaction() as s:
        token = s["csrf"]
    r = client.post("/settings", data={"csrf": token, "swid": "{new}", "espn_s2": "new2"}, follow_redirects=True)
    assert b"Found 2 league(s)" in r.data
    assert (tmp_path / "settings.json").exists()
