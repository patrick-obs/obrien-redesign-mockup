"""Fantasy advisor web app.

One person logs in with a passphrase, sees every league their ESPN account is in,
and can set all lineups with one button (after a preview), read trade ideas, and
see waiver suggestions. ESPN cookies come from environment variables and can be
updated on the Settings page.

Environment:
    APP_PASSWORD   passphrase for the login page (required)
    SECRET_KEY     random string for signing the session cookie (required)
    ESPN_S2, SWID  ESPN cookies (can also be set on the Settings page)
    SEASON         override the NFL season (default: current)
    DATA_DIR       where settings.json is kept (default: ./data)
    CACHE_SECONDS  how long league data is reused before refetching (default: 600)
"""

import hmac
import json
import os
import secrets
import threading
import time
from datetime import datetime
from functools import wraps
from pathlib import Path

from flask import Flask, abort, flash, redirect, render_template, request, session, url_for

from advisor.espn import (EspnError, apply_lineup, build_report, current_season, discover_leagues,
                          find_team, league_started, load_league)
from advisor.rosters import league_rosters
from advisor.trades import propose_trades

app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY") or secrets.token_hex(32)
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["PERMANENT_SESSION_LIFETIME"] = 60 * 60 * 24 * 30

DATA_DIR = Path(os.environ.get("DATA_DIR", "data"))
CACHE_SECONDS = int(os.environ.get("CACHE_SECONDS", "600"))
_cache = {}
_lock = threading.Lock()


# ---------------------------------------------------------------- settings

def settings() -> dict:
    s = {"espn_s2": os.environ.get("ESPN_S2", ""), "swid": os.environ.get("SWID", ""),
         "season": int(os.environ.get("SEASON") or current_season())}
    f = DATA_DIR / "settings.json"
    if f.exists():
        try:
            s.update({k: v for k, v in json.loads(f.read_text()).items() if v})
        except ValueError:
            pass
    return s


def save_settings(espn_s2: str, swid: str) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    f = DATA_DIR / "settings.json"
    f.write_text(json.dumps({"espn_s2": espn_s2.strip(), "swid": swid.strip()}))
    try:
        f.chmod(0o600)
    except OSError:
        pass


# ---------------------------------------------------------------- auth

def login_required(fn):
    @wraps(fn)
    def wrapper(*a, **kw):
        if not session.get("auth"):
            return redirect(url_for("login", next=request.path))
        return fn(*a, **kw)
    return wrapper


def csrf_token() -> str:
    if "csrf" not in session:
        session["csrf"] = secrets.token_hex(16)
    return session["csrf"]


def check_csrf():
    if not hmac.compare_digest(request.form.get("csrf", ""), session.get("csrf", "x")):
        abort(400)


app.jinja_env.globals["csrf_token"] = csrf_token


@app.route("/login", methods=["GET", "POST"])
def login():
    expected = os.environ.get("APP_PASSWORD", "")
    if request.method == "POST":
        if expected and hmac.compare_digest(request.form.get("password", ""), expected):
            session.clear()
            session.permanent = True
            session["auth"] = True
            return redirect(request.args.get("next") or url_for("index"))
        time.sleep(1)
        flash("Wrong passphrase.")
    return render_template("login.html", configured=bool(expected))


@app.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return redirect(url_for("login"))


# ---------------------------------------------------------------- data

def get_leagues(force: bool = False) -> list:
    s = settings()
    with _lock:
        hit = _cache.get("leagues")
        if hit and not force and time.time() - hit["ts"] < 3600:
            return hit["data"]
    data = discover_leagues(s["swid"], s["espn_s2"], s["season"])
    with _lock:
        _cache["leagues"] = {"ts": time.time(), "data": data}
    return data


def get_league_bundle(league_id: int, force: bool = False) -> dict:
    """Report, trades, and the live objects for one league, cached."""
    key = f"league:{league_id}"
    with _lock:
        hit = _cache.get(key)
        if hit and not force and time.time() - hit["ts"] < CACHE_SECONDS:
            return hit["data"]
    s = settings()
    league = load_league(league_id, s["season"], s["espn_s2"], s["swid"])
    bundle = {"league_id": league_id, "name": league.settings.name, "started": league_started(league)}
    if bundle["started"]:
        me = find_team(league, s["swid"])
        rep = build_report(league, me)
        mine, others = league_rosters(league, me)
        bundle.update({"report": rep, "trades": propose_trades(mine, others, rep["slot_counts"]),
                       "team_id": me.team_id, "week": rep["week"],
                       "problem_count": sum(1 for w in rep["warnings"] if "No eligible" in w or "BYE" in w
                                            or " is out" in w or "injury reserve" in w or "suspension" in w)})
    with _lock:
        _cache[key] = {"ts": time.time(), "data": bundle}
    return bundle


def clear_cache():
    with _lock:
        _cache.clear()


# ---------------------------------------------------------------- pages

@app.route("/")
@login_required
def index():
    s = settings()
    if not (s["espn_s2"] and s["swid"]):
        return redirect(url_for("settings_page"))
    force = request.args.get("refresh") == "1"
    try:
        leagues = get_leagues(force)
    except EspnError as e:
        return render_template("error.html", message=str(e)), 502
    bundles, errors = [], []
    for lg in leagues:
        try:
            bundles.append(get_league_bundle(lg["league_id"], force))
        except Exception as e:  # one bad league should not hide the others
            errors.append(f"{lg['league_name']}: {e}")
    bundles.sort(key=lambda b: (not b["started"], b["name"]))
    total_moves = sum(len(b["report"]["lineup_items"]) for b in bundles if b.get("report"))
    return render_template("index.html", bundles=bundles, errors=errors, total_moves=total_moves,
                           season=s["season"], now=datetime.now())


@app.route("/league/<int:league_id>")
@login_required
def league_page(league_id):
    try:
        b = get_league_bundle(league_id, request.args.get("refresh") == "1")
    except Exception as e:
        return render_template("error.html", message=str(e)), 502
    if not b["started"]:
        return render_template("error.html", message=f"{b['name']} has not started this season."), 200
    return render_template("league.html", b=b, r=b["report"])


@app.route("/lineups", methods=["GET", "POST"])
@login_required
def lineups():
    """Preview every lineup change across all leagues, then apply on confirm."""
    s = settings()
    only = request.values.get("league", type=int)
    try:
        leagues = [lg for lg in get_leagues() if not only or lg["league_id"] == only]
        bundles = [get_league_bundle(lg["league_id"]) for lg in leagues]
    except Exception as e:
        return render_template("error.html", message=str(e)), 502
    bundles = [b for b in bundles if b["started"]]
    if request.method == "GET":
        return render_template("lineups.html", bundles=bundles, results=None, only=only)

    check_csrf()
    results = []
    for b in bundles:
        items = b["report"]["lineup_items"]
        res = apply_lineup(b["league_id"], s["season"], b["team_id"], b["week"], items, s["espn_s2"], s["swid"])
        results.append({"name": b["name"], "items": items, "result": res})
    clear_cache()  # ESPN now has new lineups; refetch next time
    return render_template("lineups.html", bundles=bundles, results=results, only=only)


@app.route("/settings", methods=["GET", "POST"])
@login_required
def settings_page():
    s = settings()
    if request.method == "POST":
        check_csrf()
        espn_s2, swid = request.form.get("espn_s2", "").strip(), request.form.get("swid", "").strip()
        if not (espn_s2 and swid):
            flash("Both cookies are required.")
        else:
            try:
                leagues = discover_leagues(swid, espn_s2, s["season"])
            except EspnError as e:
                flash(str(e))
                return render_template("settings.html", s=s)
            save_settings(espn_s2, swid)
            clear_cache()
            flash(f"Saved. Found {len(leagues)} league(s).")
            return redirect(url_for("index"))
    return render_template("settings.html", s=s)


@app.route("/refresh", methods=["POST"])
@login_required
def refresh():
    check_csrf()
    clear_cache()
    return redirect(url_for("index"))


@app.template_filter("pts")
def pts(v):
    try:
        return f"{float(v):.1f}" if v is not None and float(v) >= 0 else "n/a"
    except (TypeError, ValueError):
        return "n/a"


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=int(os.environ.get("PORT", 5000)), debug=False)
