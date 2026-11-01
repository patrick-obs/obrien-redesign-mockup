"""Turn espn_api roster objects into trade-valued Players."""

from typing import Dict, List

from .optimizer import Player
from .trades import player_value, roster_player
from .espn import norm_status, games_played


def roster_players(team) -> List[Player]:
    games = games_played(team)
    out = []
    for p in getattr(team, "roster", []) or []:
        value = player_value(getattr(p, "projected_avg_points", 0), getattr(p, "avg_points", 0), games)
        out.append(roster_player(p.name, p.position, p.eligibleSlots, norm_status(getattr(p, "injuryStatus", None)),
                                 value, getattr(p, "playerId", None), getattr(p, "proTeam", "")))
    return out


def league_rosters(league, me) -> (List[Player], Dict[str, List[Player]]):
    mine = roster_players(me)
    others = {t.team_name: roster_players(t) for t in league.teams if t.team_id != me.team_id}
    return mine, others
