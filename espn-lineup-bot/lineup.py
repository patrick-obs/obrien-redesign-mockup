#!/usr/bin/env python3
"""ESPN fantasy football lineup advisor. Read-only: it never changes your roster.

Usage:
    python lineup.py                # this week's recommendation
    python lineup.py --week 9       # a specific week
    python lineup.py --json         # machine-readable output
    python lineup.py --no-waivers   # skip the free-agent scan (faster)

Config comes from a .env file next to this script (see .env.example) or
from environment variables: LEAGUE_ID, ESPN_S2, SWID, and optionally
TEAM_ID and SEASON.
"""

import argparse
import json
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

from optimizer import (
    Player, BENCH_SLOTS, NO_PLAY, SHAKY,
    optimize, diff_lineup, warnings_for, slot_counts_from_lineup, projected_total,
)

HERE = Path(__file__).resolve().parent


# ---------------------------------------------------------------- config

def load_env(path: Path = HERE / ".env") -> None:
    """Minimal .env loader so there is no extra dependency."""
    if not path.exists():
        return
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        k, v = k.strip(), v.strip().strip('"').strip("'")
        os.environ.setdefault(k, v)


def current_season() -> int:
    now = datetime.now()
    # The NFL season that starts in September runs into the next calendar year.
    return now.year if now.month >= 8 else now.year - 1


def get_config(args) -> dict:
    load_env()
    cfg = {
        "league_id": os.environ.get("LEAGUE_ID"),
        "espn_s2": os.environ.get("ESPN_S2"),
        "swid": os.environ.get("SWID"),
        "team_id": os.environ.get("TEAM_ID"),
        "season": args.year or os.environ.get("SEASON") or current_season(),
    }
    if not cfg["league_id"]:
        sys.exit("LEAGUE_ID is not set. Copy .env.example to .env and fill it in.")
    cfg["league_id"] = int(cfg["league_id"])
    cfg["season"] = int(cfg["season"])
    cfg["team_id"] = int(cfg["team_id"]) if cfg["team_id"] else None
    return cfg


# ---------------------------------------------------------------- ESPN -> Player

def recent_average(box_player, week: int, n: int = 3) -> Optional[float]:
    """Average actual points over the last n completed weeks, if present."""
    pts = []
    for wk in range(week - 1, max(0, week - 1 - n), -1):
        s = box_player.stats.get(wk)
        if s and "points" in s:
            pts.append(s["points"])
    return round(sum(pts) / len(pts), 1) if pts else None


def to_player(bp, week: int, current_week: int, now: datetime) -> Player:
    game_date = getattr(bp, "game_date", None)
    locked = week < current_week or (game_date is not None and now >= game_date)
    status = (bp.injuryStatus or "ACTIVE").upper()
    return Player(
        name=bp.name,
        position=bp.position,
        eligible=list(bp.eligibleSlots),
        slot=bp.slot_position,
        proj=float(bp.projected_points or 0),
        status=status,
        bye=bool(getattr(bp, "on_bye_week", False)),
        locked=locked,
        pro_team=bp.proTeam,
        opponent=getattr(bp, "pro_opponent", "") or "",
        opp_rank=int(getattr(bp, "pro_pos_rank", 0) or 0),
        recent_avg=recent_average(bp, week),
        percent_owned=getattr(bp, "percent_owned", None),
    )


def find_my_team(league, swid: Optional[str], team_id: Optional[int]):
    if team_id:
        for t in league.teams:
            if t.team_id == team_id:
                return t
        sys.exit(f"TEAM_ID {team_id} not found. Teams: " +
                 ", ".join(f"{t.team_id}={t.team_name}" for t in league.teams))
    if swid:
        want = swid.strip("{}").lower()
        for t in league.teams:
            for o in t.owners:
                oid = (o.get("id") if isinstance(o, dict) else str(o)) or ""
                if oid.strip("{}").lower() == want:
                    return t
    sys.exit("Could not match your SWID to a team. Set TEAM_ID in .env. Teams: " +
             ", ".join(f"{t.team_id}={t.team_name}" for t in league.teams))


# ---------------------------------------------------------------- report pieces

def fmt_status(p: Player) -> str:
    bits = []
    if p.bye:
        bits.append("BYE")
    if p.status not in ("ACTIVE", "NORMAL", ""):
        bits.append(p.status.replace("_", " ").title())
    if p.locked:
        bits.append("locked")
    return ", ".join(bits)


def table(rows: List[List[str]], headers: List[str]) -> str:
    widths = [len(h) for h in headers]
    for r in rows:
        for i, c in enumerate(r):
            widths[i] = max(widths[i], len(str(c)))
    line = "  ".join(h.ljust(widths[i]) for i, h in enumerate(headers))
    out = [line, "  ".join("-" * w for w in widths)]
    for r in rows:
        out.append("  ".join(str(c).ljust(widths[i]) for i, c in enumerate(r)))
    return "\n".join(out)


def lineup_rows(assignment: Dict[str, List[Player]], slot_order: List[str]) -> List[List[str]]:
    rows = []
    for slot in slot_order:
        for p in assignment.get(slot, []):
            opp = f"{p.opponent}" if p.opponent and p.opponent != "None" else "bye"
            rank = f"#{p.opp_rank}" if p.opp_rank else ""
            rows.append([slot, p.name, p.position, p.pro_team, opp, rank,
                         f"{p.proj:.1f}",
                         f"{p.recent_avg:.1f}" if p.recent_avg is not None else "",
                         fmt_status(p)])
    return rows


def waiver_watch(league, week: int, my_players: List[Player], assignment, now, current_week) -> Dict[str, list]:
    """Free agents who out-project the weakest player you'd start at that slot."""
    out = {}
    worst_by_pos: Dict[str, float] = {}
    for ps in assignment.values():
        for p in ps:
            worst_by_pos[p.position] = min(worst_by_pos.get(p.position, 1e9), p.effective_proj)
    mine = {p.name for p in my_players}
    for pos in ("QB", "RB", "WR", "TE", "D/ST", "K"):
        if pos not in worst_by_pos:
            continue
        try:
            fas = league.free_agents(week=week, size=25, position=pos)
        except Exception as e:  # keep the report alive if this view fails
            out[pos] = [{"error": str(e)}]
            continue
        picks = []
        for fa in fas:
            p = to_player(fa, week, current_week, now)
            if p.name in mine or not p.can_play:
                continue
            edge = round(p.effective_proj - worst_by_pos[pos], 1)
            if edge > 0:
                picks.append({"name": p.name, "team": p.pro_team, "opp": p.opponent,
                              "proj": p.proj, "edge": edge,
                              "owned": p.percent_owned, "status": p.status})
        picks.sort(key=lambda d: -d["edge"])
        if picks:
            out[pos] = picks[:3]
    return out


# ---------------------------------------------------------------- main

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--week", type=int, help="NFL week (default: current)")
    ap.add_argument("--year", type=int, help="season (default: current)")
    ap.add_argument("--json", action="store_true", help="print JSON instead of text")
    ap.add_argument("--no-waivers", action="store_true", help="skip the free-agent scan")
    args = ap.parse_args()
    cfg = get_config(args)

    try:
        from espn_api.football import League
    except ImportError:
        sys.exit("espn_api is not installed. Run: pip install -r requirements.txt")

    try:
        league = League(league_id=cfg["league_id"], year=cfg["season"],
                        espn_s2=cfg["espn_s2"], swid=cfg["swid"])
    except Exception as e:
        sys.exit(f"Could not load league {cfg['league_id']} for {cfg['season']}: {e}\n"
                 "If the league is private, check ESPN_S2 and SWID in .env (they expire).")

    now = datetime.now()
    current_week = league.current_week
    week = args.week or current_week
    me = find_my_team(league, cfg["swid"], cfg["team_id"])

    boxes = league.box_scores(week=week)
    box = next((b for b in boxes if me.team_id in (b.home_team.team_id, b.away_team.team_id)), None)
    if box is None:
        sys.exit(f"No matchup found for {me.team_name} in week {week} (bye week or playoffs?).")
    home = box.home_team.team_id == me.team_id
    my_lineup = box.home_lineup if home else box.away_lineup
    opp_lineup = box.away_lineup if home else box.home_lineup
    opp_team = box.away_team if home else box.home_team
    my_proj_espn = box.home_projected if home else box.away_projected
    opp_proj_espn = box.away_projected if home else box.home_projected

    mine = [to_player(bp, week, current_week, now) for bp in my_lineup]
    theirs = [to_player(bp, week, current_week, now) for bp in opp_lineup]

    slot_counts = slot_counts_from_lineup(mine)
    if not slot_counts:
        slot_counts = {k: v for k, v in league.settings.position_slot_counts.items()
                       if v and k not in BENCH_SLOTS}
    slot_order = [s for s in ["QB", "RB", "WR", "TE", "RB/WR/TE", "RB/WR", "WR/TE", "OP",
                              "D/ST", "K"] if s in slot_counts] + \
                 [s for s in slot_counts if s not in ["QB", "RB", "WR", "TE", "RB/WR/TE",
                                                      "RB/WR", "WR/TE", "OP", "D/ST", "K"]]

    rec = optimize(mine, slot_counts)
    current_assignment = {s: [p for p in mine if p.slot == s] for s in slot_counts}
    moves = diff_lineup(mine, rec)
    warns = warnings_for(mine, rec, slot_counts)
    starters_now = projected_total(current_assignment)
    starters_rec = projected_total(rec)
    bench = [p for p in mine if p.name not in {q.name for ps in rec.values() for q in ps}]

    opp_rec = optimize(theirs, slot_counts_from_lineup(theirs) or slot_counts)
    opp_issues = [f"{p.name} ({p.position}) {fmt_status(p)}" for p in theirs
                  if p.starting and (p.bye or p.status in NO_PLAY or p.status in SHAKY)]

    waivers = {} if args.no_waivers else waiver_watch(league, week, mine, rec, now, current_week)

    standings = league.standings()

    if args.json:
        def pj(p: Player):
            return {"name": p.name, "pos": p.position, "team": p.pro_team, "opp": p.opponent,
                    "proj": p.proj, "effective_proj": p.effective_proj, "status": p.status,
                    "bye": p.bye, "locked": p.locked, "recent_avg": p.recent_avg}
        print(json.dumps({
            "league": league.settings.name, "season": cfg["season"], "week": week,
            "team": me.team_name, "record": f"{me.wins}-{me.losses}-{me.ties}",
            "opponent": opp_team.team_name,
            "opponent_record": f"{opp_team.wins}-{opp_team.losses}-{opp_team.ties}",
            "espn_projection": {"me": my_proj_espn, "opponent": opp_proj_espn},
            "current_lineup_proj": starters_now, "recommended_lineup_proj": starters_rec,
            "recommended": {s: [pj(p) for p in ps] for s, ps in rec.items()},
            "bench": [pj(p) for p in bench], "moves": moves, "warnings": warns,
            "opponent_lineup": {s: [pj(p) for p in ps] for s, ps in opp_rec.items()},
            "opponent_issues": opp_issues, "waivers": waivers,
            "standings": [{"rank": i + 1, "team": t.team_name, "record": f"{t.wins}-{t.losses}-{t.ties}",
                           "pf": round(t.points_for, 1), "pa": round(t.points_against, 1)}
                          for i, t in enumerate(standings)],
        }, indent=2, default=str))
        return

    H = ["Slot", "Player", "Pos", "Team", "Opp", "OppRk", "Proj", "L3avg", "Notes"]
    print(f"\n{league.settings.name}  |  {cfg['season']} week {week}"
          f"{'' if week == current_week else f'  (current week is {current_week})'}")
    print(f"{me.team_name} ({me.wins}-{me.losses}{'-'+str(me.ties) if me.ties else ''})"
          f"  vs  {opp_team.team_name} ({opp_team.wins}-{opp_team.losses}{'-'+str(opp_team.ties) if opp_team.ties else ''})")
    print(f"ESPN projects: you {my_proj_espn:.1f}  |  them {opp_proj_espn:.1f}")
    print(f"Your starters as set: {starters_now:.1f}  |  recommended: {starters_rec:.1f}"
          f"  ({starters_rec - starters_now:+.1f})")

    print("\nRECOMMENDED LINEUP")
    print(table(lineup_rows(rec, slot_order), H))

    print("\nCHANGES TO MAKE" if moves else "\nCHANGES TO MAKE\n  None. Your lineup already matches the projections.")
    for m in moves:
        print(f"  {m}")

    if warns:
        print("\nWATCH OUT")
        for w in warns:
            print(f"  ! {w}")

    print("\nBENCH")
    for p in sorted(bench, key=lambda x: -x.proj):
        print(f"  {p.name:<24}{p.position:<5}{p.pro_team:<5}{p.proj:>5.1f}  {fmt_status(p)}")

    print(f"\nOPPONENT: {opp_team.team_name}  (best lineup from their roster: {projected_total(opp_rec):.1f})")
    print(table(lineup_rows(opp_rec, slot_order), H))
    if opp_issues:
        print("  Their problems: " + "; ".join(opp_issues))

    if waivers:
        print("\nWAIVER WATCH  (free agents projected above your weakest starter at that position)")
        for pos, picks in waivers.items():
            for d in picks:
                if "error" in d:
                    print(f"  {pos}: could not load ({d['error']})")
                    continue
                owned = f"{d['owned']:.0f}% owned" if d.get("owned") is not None else ""
                print(f"  {pos:<5}{d['name']:<24}{d['team']:<5}vs {d['opp']:<5}"
                      f"{d['proj']:>5.1f} proj  (+{d['edge']:.1f})  {owned}  {d['status'] if d['status'] not in ('ACTIVE','NORMAL') else ''}")
    elif not args.no_waivers:
        print("\nWAIVER WATCH\n  No free agent out-projects your starters this week.")

    print("\nSTANDINGS")
    for i, t in enumerate(standings, 1):
        me_mark = " <- you" if t.team_id == me.team_id else ""
        print(f"  {i:>2}. {t.team_name:<28}{t.wins}-{t.losses}{'-'+str(t.ties) if t.ties else ''}"
              f"   PF {t.points_for:>7.1f}   PA {t.points_against:>7.1f}{me_mark}")
    print("\nOPRK: ESPN's opponent rank against that position, as shown on the ESPN site.")
    print("This tool only reads your league. Make the moves on ESPN yourself.\n")


if __name__ == "__main__":
    main()
