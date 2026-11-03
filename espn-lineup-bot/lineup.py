#!/usr/bin/env python3
"""ESPN fantasy football lineup advisor, command-line version. Read-only.

Usage:
    python lineup.py                # this week's recommendation
    python lineup.py --week 9       # a specific week
    python lineup.py --league 123   # a different league than the one in .env
    python lineup.py --trades       # add 1-for-1 trade ideas
    python lineup.py --json         # machine-readable output
    python lineup.py --no-waivers   # skip the free-agent scan (faster)
    python lineup.py --brief        # your matchup only, skip the league-wide sections

Config comes from a .env file next to this script (see .env.example) or from
environment variables: LEAGUE_ID, ESPN_S2, SWID, and optionally TEAM_ID and SEASON.
"""

import argparse
import json
import os
import sys
from pathlib import Path

from advisor.espn import (EspnError, build_report, current_season, find_team, league_started, load_league)
from advisor.text import render_text

HERE = Path(__file__).resolve().parent


def load_env(path: Path = HERE / ".env") -> None:
    if not path.exists():
        return
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        k, v = k.strip(), v.strip().strip('"').strip("'")
        if v:
            os.environ.setdefault(k, v)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--league", type=int, help="league ID (overrides LEAGUE_ID in .env)")
    ap.add_argument("--team", type=int, help="your team ID (overrides TEAM_ID in .env)")
    ap.add_argument("--week", type=int, help="NFL week (default: current)")
    ap.add_argument("--year", type=int, help="season (default: current)")
    ap.add_argument("--trades", action="store_true", help="include trade ideas")
    ap.add_argument("--json", action="store_true", help="print JSON instead of text")
    ap.add_argument("--no-waivers", action="store_true", help="skip the free-agent scan")
    ap.add_argument("--brief", action="store_true", help="skip the league-wide sections")
    args = ap.parse_args()

    load_env()
    league_id = args.league or os.environ.get("LEAGUE_ID")
    if not league_id:
        sys.exit("LEAGUE_ID is not set. Copy .env.example to .env and fill it in, or pass --league.")
    season = int(args.year or os.environ.get("SEASON") or current_season())
    team_id = args.team or os.environ.get("TEAM_ID")
    espn_s2, swid = os.environ.get("ESPN_S2"), os.environ.get("SWID")

    try:
        league = load_league(int(league_id), season, espn_s2, swid)
    except ImportError:
        sys.exit("espn_api is not installed. Run: pip install -r requirements.txt")
    except Exception as e:
        sys.exit(f"Could not load league {league_id} for {season}: {e}\n"
                 "If the league is private, check ESPN_S2 and SWID in .env (they expire).")
    if not league_started(league):
        sys.exit(f"{league.settings.name} ({season}) has not started: no scoring week and no rosters yet. "
                 "If this is last year's league, pass --year.")
    try:
        me = find_team(league, swid, int(team_id) if team_id else None)
        rep = build_report(league, me, week=args.week, waivers=not args.no_waivers, league_wide=not args.brief)
    except EspnError as e:
        sys.exit(str(e))
    except Exception as e:
        sys.exit(f"ESPN returned data the library could not read: {e}")

    trades = None
    if args.trades:
        from advisor.rosters import league_rosters
        from advisor.trades import propose_trades
        mine, others = league_rosters(league, me)
        trades = propose_trades(mine, others, rep["slot_counts"])

    if args.json:
        if trades is not None:
            rep["trades"] = trades
        print(json.dumps(rep, indent=2, default=str))
    else:
        print(render_text(rep, show_waivers=not args.no_waivers, league_wide=not args.brief, trades=trades))


if __name__ == "__main__":
    main()
