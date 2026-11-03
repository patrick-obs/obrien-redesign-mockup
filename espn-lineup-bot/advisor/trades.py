"""Trade proposals. Pure logic: give it rosters, get ranked 1-for-1 ideas.

A player's trade value is a rest-of-season estimate: the average of ESPN's
season projection per game and what the player has actually averaged so far.
A trade is proposed when it raises the projected weekly total of your best
lineup and does not cost the other side much, so it is one they might take.
"""

from typing import Dict, List, Optional

from .optimizer import Player, NO_PLAY, optimize, projected_total

MIN_MY_GAIN = 1.0       # projected points per week
MAX_THEIR_LOSS = 0.5    # they should roughly break even or gain
MAX_VALUE_ASK = 1.15    # never ask for more than 15% more player value than you give
PER_TEAM = 2
PER_LEAGUE = 8


def player_value(proj_avg: float, actual_avg: float, games: int) -> float:
    """Blend of projection and results; leans on results as the season goes on."""
    proj_avg, actual_avg = float(proj_avg or 0), float(actual_avg or 0)
    if proj_avg <= 0:
        return round(actual_avg, 2)
    if games <= 0 or actual_avg <= 0:
        return round(proj_avg, 2)
    w = min(games, 8) / 16.0  # 0.06 after one game, 0.5 by mid season
    return round((1 - w) * proj_avg + w * actual_avg, 2)


def roster_player(name, position, eligible, status, value, player_id=None, pro_team="") -> Player:
    return Player(name=name, position=position, eligible=list(eligible), slot="BE", proj=value,
                  status=status, player_id=player_id, pro_team=pro_team)


def lineup_value(roster: List[Player], slot_counts: Dict[str, int]) -> float:
    return projected_total(optimize(roster, slot_counts))


def propose_trades(mine: List[Player], others: Dict[str, List[Player]], slot_counts: Dict[str, int],
                   min_my_gain: float = MIN_MY_GAIN, max_their_loss: float = MAX_THEIR_LOSS,
                   max_value_ask: float = MAX_VALUE_ASK) -> List[dict]:
    base_mine = lineup_value(mine, slot_counts)
    ideas = []
    for team_name, theirs in others.items():
        base_theirs = lineup_value(theirs, slot_counts)
        team_ideas = []
        for a in mine:
            if a.status in NO_PLAY:
                continue  # nobody accepts an injured player as the centerpiece
            for b in theirs:
                if b.status in NO_PLAY:
                    continue  # do not trade for players who cannot play
                if b.proj > a.proj * max_value_ask:
                    continue  # lopsided on paper; they would say no
                new_mine = [p for p in mine if p is not a] + [b]
                new_theirs = [p for p in theirs if p is not b] + [a]
                my_gain = round(lineup_value(new_mine, slot_counts) - base_mine, 1)
                their_gain = round(lineup_value(new_theirs, slot_counts) - base_theirs, 1)
                if my_gain >= min_my_gain and their_gain >= -max_their_loss:
                    team_ideas.append({
                        "with": team_name, "give": a.name, "give_pos": a.position, "give_value": a.proj,
                        "get": b.name, "get_pos": b.position, "get_value": b.proj,
                        "my_gain": my_gain, "their_gain": their_gain,
                        "pitch": _pitch(a, b, my_gain, their_gain),
                    })
        team_ideas.sort(key=lambda d: (-d["my_gain"], -d["their_gain"]))
        ideas.extend(team_ideas[:PER_TEAM])
    ideas.sort(key=lambda d: (-d["my_gain"], -d["their_gain"]))
    return ideas[:PER_LEAGUE]


def _pitch(a: Player, b: Player, my_gain: float, their_gain: float) -> str:
    if their_gain > 0:
        why = f"it also lifts their starting lineup by {their_gain:.1f} a week, so it is an easy sell"
    elif their_gain == 0:
        why = "their starting lineup stays the same, so it costs them nothing on paper"
    else:
        why = f"it costs their lineup only {abs(their_gain):.1f} a week"
    return (f"Offer {a.name} ({a.position}) for {b.name} ({b.position}). "
            f"Your best lineup gains about {my_gain:.1f} points a week; {why}.")
