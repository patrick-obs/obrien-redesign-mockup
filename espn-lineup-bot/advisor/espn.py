"""ESPN access: league discovery, report building, and lineup writes.

Everything that talks to ESPN lives here. The optimizer and trade logic
are pure and live in their own modules.
"""

import json
from datetime import datetime
from typing import Dict, List, Optional

import requests

from .optimizer import (
    Player, BENCH_SLOTS, NO_PLAY, SHAKY,
    optimize, diff_lineup, warnings_for, slot_counts_from_lineup, projected_total,
)

SLOT_DISPLAY_ORDER = ["QB", "RB", "WR", "TE", "RB/WR/TE", "RB/WR", "WR/TE", "OP", "D/ST", "K"]
FLEX_SLOTS = {"RB/WR/TE", "RB/WR", "WR/TE", "OP", "TQB"}
# ESPN's lineupSlotId numbers. Stable for years; the espn_api library uses the same table.
SLOT_IDS = {"QB": 0, "TQB": 1, "RB": 2, "RB/WR": 3, "WR": 4, "WR/TE": 5, "TE": 6, "OP": 7, "DT": 8, "DE": 9,
            "LB": 10, "DL": 11, "CB": 12, "S": 13, "DB": 14, "DP": 15, "D/ST": 16, "K": 17, "P": 18, "HC": 19,
            "BE": 20, "IR": 21, "RB/WR/TE": 23, "ER": 24}
TROUBLE = NO_PLAY | SHAKY
FAN_API = "https://fan.api.espn.com/apis/v2/fans/"
WRITE_API = "https://lm-api-writes.fantasy.espn.com/apis/v3/games/ffl/seasons/{year}/segments/0/leagues/{league_id}/transactions/"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) fantasy-advisor"


class EspnError(Exception):
    pass


def current_season(now: Optional[datetime] = None) -> int:
    now = now or datetime.now()
    # The NFL season that starts in September runs into the next calendar year.
    return now.year if now.month >= 8 else now.year - 1


def norm_status(s: Optional[str]) -> str:
    s = (s or "ACTIVE").upper()
    return "ACTIVE" if s in ("NORMAL", "") else s


def record(t) -> str:
    return f"{t.wins}-{t.losses}" + (f"-{t.ties}" if t.ties else "")


def games_played(t) -> int:
    return t.wins + t.losses + t.ties


def avg_pf(t) -> float:
    g = games_played(t)
    return round(t.points_for / g, 1) if g else 0.0


# ---------------------------------------------------------------- discovery

def discover_leagues(swid: str, espn_s2: str, season: int, session=None) -> List[dict]:
    """Every fantasy football league this ESPN account is in for the season."""
    if not swid:
        raise EspnError("SWID is required to discover leagues.")
    s = session or requests.Session()
    sid = "%7B" + swid.strip("{}") + "%7D"
    r = s.get(FAN_API + sid, params={"displayEvents": "false", "source": "espncom-fantasy-main"},
              cookies={"espn_s2": espn_s2, "SWID": swid}, headers={"User-Agent": UA}, timeout=30)
    if r.status_code != 200:
        raise EspnError(f"ESPN fan API returned {r.status_code}. Check SWID and ESPN_S2.")
    out = []
    for pref in r.json().get("preferences", []):
        entry = pref.get("metaData", {}).get("entry", {})
        if not entry or str(entry.get("gameId")) != "1" or int(entry.get("seasonId", 0)) != season:
            continue
        for g in entry.get("groups", []):
            out.append({"league_id": int(g["groupId"]), "league_name": g.get("groupName", ""),
                        "team_id": int(entry["entryId"]), "team_name": entry.get("entryMetadata", {}).get("teamName", ""),
                        "season": season})
    return out


def load_league(league_id: int, season: int, espn_s2: Optional[str], swid: Optional[str]):
    from espn_api.football import League  # imported late so tests can stub it
    return League(league_id=league_id, year=season, espn_s2=espn_s2, swid=swid)


def league_started(league) -> bool:
    return bool(league.current_week) and any(getattr(t, "roster", None) for t in league.teams)


def find_team(league, swid: Optional[str] = None, team_id: Optional[int] = None):
    if team_id:
        for t in league.teams:
            if t.team_id == team_id:
                return t
        raise EspnError(f"Team {team_id} not found. Teams: " +
                        ", ".join(f"{t.team_id}={t.team_name}" for t in league.teams))
    if swid:
        want = swid.strip("{}").lower()
        for t in league.teams:
            for o in t.owners:
                oid = (o.get("id") if isinstance(o, dict) else str(o)) or ""
                if oid.strip("{}").lower() == want:
                    return t
    raise EspnError("Could not match your SWID to a team. Set TEAM_ID. Teams: " +
                    ", ".join(f"{t.team_id}={t.team_name}" for t in league.teams))


# ---------------------------------------------------------------- conversion

def recent_average(box_player, week: int, n: int = 3) -> Optional[float]:
    pts = []
    for wk in range(week - 1, max(0, week - 1 - n), -1):
        s = getattr(box_player, "stats", {}).get(wk)
        if s and "points" in s:
            pts.append(s["points"])
    return round(sum(pts) / len(pts), 1) if pts else None


def to_player(bp, week: int, current_week: int, now: datetime) -> Player:
    game_date = getattr(bp, "game_date", None)
    locked = week < current_week or (game_date is not None and now >= game_date)
    return Player(
        name=bp.name, position=bp.position, eligible=list(bp.eligibleSlots),
        slot=bp.slot_position, proj=float(bp.projected_points or 0),
        status=norm_status(bp.injuryStatus), bye=bool(getattr(bp, "on_bye_week", False)),
        locked=locked, pro_team=bp.proTeam, opponent=getattr(bp, "pro_opponent", "") or "",
        opp_rank=int(getattr(bp, "pro_pos_rank", 0) or 0), recent_avg=recent_average(bp, week),
        percent_owned=getattr(bp, "percent_owned", None), player_id=getattr(bp, "playerId", None),
    )


def starting_slot_counts(league, players: List[Player]) -> Dict[str, int]:
    """League settings first (they include slots left empty); lineup as fallback."""
    try:
        counts = {k: v for k, v in league.settings.position_slot_counts.items() if v and k not in BENCH_SLOTS}
    except Exception:
        counts = {}
    return counts or slot_counts_from_lineup(players)


def slot_order_for(slot_counts: Dict[str, int]) -> List[str]:
    return [s for s in SLOT_DISPLAY_ORDER if s in slot_counts] + [s for s in slot_counts if s not in SLOT_DISPLAY_ORDER]


def fmt_status(p: Player) -> str:
    bits = []
    if p.bye:
        bits.append("BYE")
    if p.status != "ACTIVE":
        bits.append(p.status.replace("_", " ").title())
    if p.locked:
        bits.append("locked")
    return ", ".join(bits)


def lineup_problems(players: List[Player], slot_counts: Dict[str, int]) -> List[str]:
    probs = [f"{p.name} {fmt_status(p)}" for p in players if p.starting and (p.bye or p.status in TROUBLE)]
    empty = sum(slot_counts.values()) - sum(1 for p in players if p.starting)
    if empty > 0:
        probs.append(f"{empty} empty slot{'s' if empty > 1 else ''}")
    return probs


def roster_injuries(team) -> List[str]:
    out = []
    for p in getattr(team, "roster", []) or []:
        st = norm_status(getattr(p, "injuryStatus", None))
        if st in TROUBLE:
            out.append(f"{p.name} ({p.position}) {st.replace('_', ' ').title()}")
    return out


def player_json(p: Player) -> dict:
    return {"name": p.name, "pos": p.position, "team": p.pro_team,
            "opp": p.opponent if p.opponent and p.opponent != "None" else "bye",
            "opp_rank": p.opp_rank, "proj": p.proj, "effective_proj": p.effective_proj,
            "status": p.status, "bye": p.bye, "locked": p.locked, "recent_avg": p.recent_avg,
            "slot": p.slot, "notes": fmt_status(p), "player_id": p.player_id}


# ---------------------------------------------------------------- waivers

def waiver_watch(league, week, my_players, assignment, slot_counts, now, current_week) -> Dict[str, list]:
    out = {}
    threshold: Dict[str, float] = {}
    for ps in assignment.values():
        for p in ps:
            threshold[p.position] = min(threshold.get(p.position, 1e9), p.effective_proj)
    for slot, n in slot_counts.items():
        if len(assignment.get(slot, [])) < n and slot not in FLEX_SLOTS:
            threshold[slot] = 0.0
    mine = {p.name for p in my_players}
    for pos in ("QB", "RB", "WR", "TE", "D/ST", "K"):
        if pos not in threshold:
            continue
        try:
            fas = league.free_agents(week=week, size=25, position=pos)
        except Exception as e:
            out[pos] = [{"error": str(e)}]
            continue
        picks = []
        for fa in fas:
            p = to_player(fa, week, current_week, now)
            if p.name in mine or not p.can_play:
                continue
            edge = round(p.effective_proj - threshold[pos], 1)
            if edge > 0:
                picks.append({"name": p.name, "team": p.pro_team, "opp": p.opponent, "proj": p.proj,
                              "edge": edge, "owned": p.percent_owned, "status": p.status,
                              "fills_empty_slot": threshold[pos] == 0.0})
        picks.sort(key=lambda d: -d["edge"])
        if picks:
            out[pos] = picks[:3]
    return out


# ---------------------------------------------------------------- report

def build_report(league, me, week: Optional[int] = None, now: Optional[datetime] = None,
                 waivers: bool = True, league_wide: bool = True) -> dict:
    """Everything the CLI and the web app show, as one JSON-friendly dict."""
    now = now or datetime.now()
    current_week = league.current_week
    week = week or current_week

    boxes = league.box_scores(week=week)
    box = next((b for b in boxes if me.team_id in (b.home_team.team_id, b.away_team.team_id)), None)
    if box is None:
        raise EspnError(f"No matchup found for {me.team_name} in week {week} (bye week or playoffs?).")
    home = box.home_team.team_id == me.team_id
    my_lineup = box.home_lineup if home else box.away_lineup
    opp_lineup = box.away_lineup if home else box.home_lineup
    opp_team = box.away_team if home else box.home_team
    my_proj_espn = box.home_projected if home else box.away_projected
    opp_proj_espn = box.away_projected if home else box.home_projected

    mine = [to_player(bp, week, current_week, now) for bp in my_lineup]
    theirs = [to_player(bp, week, current_week, now) for bp in opp_lineup]
    slot_counts = starting_slot_counts(league, mine)
    order = slot_order_for(slot_counts)

    rec = optimize(mine, slot_counts)
    current_assignment = {s: [p for p in mine if p.slot == s] for s in slot_counts}
    rec_names = {q.name for ps in rec.values() for q in ps}
    bench = [p for p in mine if p.name not in rec_names]
    opp_rec = optimize(theirs, slot_counts)

    rep = {
        "league_id": league.league_id, "league": league.settings.name, "season": league.year,
        "week": week, "current_week": current_week, "generated_at": now.isoformat(timespec="minutes"),
        "team_id": me.team_id, "team": me.team_name, "record": record(me),
        "opponent": opp_team.team_name, "opponent_record": record(opp_team),
        "espn_projection": {"me": my_proj_espn, "opponent": opp_proj_espn},
        "current_lineup_proj": projected_total(current_assignment),
        "recommended_lineup_proj": projected_total(rec),
        "slot_counts": slot_counts, "slot_order": order,
        "recommended": {s: [player_json(p) for p in rec.get(s, [])] for s in order},
        "bench": [player_json(p) for p in sorted(bench, key=lambda x: -x.proj)],
        "moves": diff_lineup(mine, rec), "warnings": warnings_for(mine, rec, slot_counts),
        "lineup_items": plan_lineup_items(mine, rec),
        "opponent_lineup": {s: [player_json(p) for p in opp_rec.get(s, [])] for s in order},
        "opponent_best_proj": projected_total(opp_rec),
        "opponent_issues": lineup_problems(theirs, slot_counts),
        "waivers": waiver_watch(league, week, mine, rec, slot_counts, now, current_week) if waivers else {},
    }

    standings = league.standings()
    rep["standings"] = [{"rank": i + 1, "team": t.team_name, "team_id": t.team_id, "record": record(t),
                         "pf": round(t.points_for, 1), "pa": round(t.points_against, 1), "avg_pf": avg_pf(t)}
                        for i, t in enumerate(standings)]

    if league_wide:
        matchups = []
        for b in boxes:
            sides = []
            for team, lineup, proj in ((b.home_team, b.home_lineup, b.home_projected),
                                       (b.away_team, b.away_lineup, b.away_projected)):
                if team is None or isinstance(team, int):
                    continue
                ps = [to_player(bp, week, current_week, now) for bp in lineup]
                sides.append({"team": team.team_name, "team_id": team.team_id, "record": record(team),
                              "espn_proj": proj, "best_lineup_proj": projected_total(optimize(ps, slot_counts)),
                              "problems": lineup_problems(ps, slot_counts)})
            matchups.append(sides)
        rep["matchups"] = matchups
        rep["injury_report"] = [{"team": t.team_name, "team_id": t.team_id, "injuries": roster_injuries(t)}
                                for t in standings]

        reg = getattr(league.settings, "reg_season_count", None) or len(me.schedule)
        past, future = [], []
        for i, opp in enumerate(me.schedule[:reg]):
            wk = i + 1
            if isinstance(opp, int):
                continue
            entry = {"week": wk, "opponent": opp.team_name, "record": record(opp), "avg_pf": avg_pf(opp)}
            decided = i < len(me.outcomes) and me.outcomes[i] in ("W", "L", "T")
            if wk < current_week or (wk == current_week and decided):
                entry.update({"result": me.outcomes[i] if i < len(me.outcomes) else "?",
                              "score": me.scores[i] if i < len(me.scores) else None,
                              "opp_score": opp.scores[i] if i < len(opp.scores) else None})
                past.append(entry)
            elif wk > current_week:
                entry["injuries"] = roster_injuries(opp)
                future.append(entry)
        rep["results"], rep["schedule"] = past, future
    return rep


# ---------------------------------------------------------------- lineup writes

def plan_lineup_items(players: List[Player], assignment: Dict[str, List[Player]]) -> List[dict]:
    """Slot moves that turn the current lineup into the recommended one.
    Never touches locked players or the IR slot; never adds or drops anyone."""
    target = {p.name: slot for slot, ps in assignment.items() for p in ps}
    items = []
    for p in players:
        if p.locked or p.slot == "IR" or p.player_id is None:
            continue
        to_slot = target.get(p.name, "BE")
        if to_slot == p.slot:
            continue
        if to_slot not in SLOT_IDS or p.slot not in SLOT_IDS:
            continue
        items.append({"playerId": p.player_id, "name": p.name, "from": p.slot, "to": to_slot,
                      "fromLineupSlotId": SLOT_IDS[p.slot], "toLineupSlotId": SLOT_IDS[to_slot]})
    return items


def build_lineup_transaction(team_id: int, swid: str, week: int, items: List[dict]) -> dict:
    """The payload ESPN's own web client sends for a lineup change."""
    return {"isLeagueManager": False, "teamId": team_id, "type": "ROSTER", "memberId": swid,
            "scoringPeriodId": week, "executionType": "EXECUTE",
            "items": [{"playerId": it["playerId"], "type": "LINEUP",
                       "fromLineupSlotId": it["fromLineupSlotId"], "toLineupSlotId": it["toLineupSlotId"]}
                      for it in items]}


def apply_lineup(league_id: int, season: int, team_id: int, week: int, items: List[dict],
                 espn_s2: str, swid: str, session=None) -> dict:
    """POST the lineup change to ESPN. One call per team; no retries, because a
    retried write submits the move twice."""
    if not items:
        return {"ok": True, "status": 0, "message": "No changes needed."}
    s = session or requests.Session()
    payload = build_lineup_transaction(team_id, swid, week, items)
    r = s.post(WRITE_API.format(year=season, league_id=league_id), json=payload,
               cookies={"espn_s2": espn_s2, "SWID": swid},
               headers={"Content-Type": "application/json", "User-Agent": UA}, timeout=30)
    ok = 200 <= r.status_code < 300
    try:
        body = r.json()
    except ValueError:
        body = r.text[:500]
    msg = "Lineup set." if ok else _error_message(body, r.status_code)
    return {"ok": ok, "status": r.status_code, "message": msg, "response": body}


def _error_message(body, status: int) -> str:
    if isinstance(body, dict):
        msgs = body.get("messages") or [d.get("message") for d in body.get("details", []) if d.get("message")]
        if msgs:
            return f"ESPN rejected the change ({status}): " + "; ".join(str(m) for m in msgs)
    return f"ESPN rejected the change ({status})."
