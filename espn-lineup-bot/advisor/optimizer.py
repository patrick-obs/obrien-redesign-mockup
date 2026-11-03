"""Pure lineup logic. No network, no ESPN objects: easy to test.

A "player" here is a small dict:
    name, position, eligible (list of slot labels), slot (current slot label),
    proj (float), status (injury status string), bye (bool), locked (bool)
"""

from dataclasses import dataclass, field
from typing import Dict, List, Optional

BENCH_SLOTS = {"BE", "IR"}

# Statuses that mean the player will not play this week.
NO_PLAY = {"OUT", "INJURY_RESERVE", "SUSPENSION", "IR"}
# Statuses to flag but still consider.
SHAKY = {"QUESTIONABLE", "DOUBTFUL", "DAY_TO_DAY"}

# Fill the most restrictive slots first so flex slots take the leftovers.
SLOT_ORDER = ["QB", "K", "D/ST", "TE", "RB", "WR", "P", "HC",
              "DT", "DE", "LB", "DL", "CB", "S", "DB", "DP",
              "WR/TE", "RB/WR", "RB/WR/TE", "OP", "TQB"]


@dataclass
class Player:
    name: str
    position: str
    eligible: List[str]
    slot: str
    proj: float
    status: str = "ACTIVE"
    bye: bool = False
    locked: bool = False
    pro_team: str = ""
    opponent: str = ""
    opp_rank: int = 0
    recent_avg: Optional[float] = None
    percent_owned: Optional[float] = None
    player_id: Optional[int] = None
    flags: List[str] = field(default_factory=list)

    @property
    def starting(self) -> bool:
        return self.slot not in BENCH_SLOTS

    @property
    def can_play(self) -> bool:
        return not self.bye and self.status not in NO_PLAY

    @property
    def effective_proj(self) -> float:
        """Projection used for ranking. Zero if the player cannot play,
        discounted when doubtful."""
        if not self.can_play:
            return 0.0
        if self.status == "DOUBTFUL":
            return round(self.proj * 0.25, 2)
        return self.proj


def slot_counts_from_lineup(players: List[Player]) -> Dict[str, int]:
    """Infer the league's starting-slot shape from a current lineup."""
    counts: Dict[str, int] = {}
    for p in players:
        if p.starting:
            counts[p.slot] = counts.get(p.slot, 0) + 1
    return counts


def _slot_rank(slot: str) -> int:
    try:
        return SLOT_ORDER.index(slot)
    except ValueError:
        return len(SLOT_ORDER)


def optimize(players: List[Player], slot_counts: Dict[str, int]) -> Dict[str, List[Player]]:
    """Return {slot: [players]} for the best projected lineup.

    Locked players stay where they are. A locked starter keeps its slot;
    a locked bench player stays on the bench. Everyone else is placed by
    effective projection, most restrictive slot first. A player who cannot
    play (bye, out, IR, suspended) is never placed: an empty slot is the
    honest answer and the report flags it.
    """
    assignment: Dict[str, List[Player]] = {s: [] for s in slot_counts}
    remaining = {s: n for s, n in slot_counts.items()}
    pool: List[Player] = []

    for p in players:
        if p.locked and p.starting and p.slot in remaining and remaining[p.slot] > 0:
            assignment[p.slot].append(p)
            remaining[p.slot] -= 1
        elif p.locked:
            continue  # locked on bench or IR, cannot move
        else:
            pool.append(p)

    for slot in sorted(remaining, key=_slot_rank):
        while remaining[slot] > 0:
            candidates = [p for p in pool if slot in p.eligible and p.can_play]
            if not candidates:
                break
            best = max(candidates, key=lambda p: (p.effective_proj, p.proj))
            assignment[slot].append(best)
            pool.remove(best)
            remaining[slot] -= 1

    return assignment


def diff_lineup(players: List[Player], assignment: Dict[str, List[Player]]) -> List[str]:
    """Human-readable changes between the current lineup and the recommendation."""
    recommended = {p.name: slot for slot, ps in assignment.items() for p in ps}
    current = {p.name: p.slot for p in players if p.starting}
    moves = []

    sit = [p for p in players if p.name in current and p.name not in recommended]
    start = [p for p in players if p.name in recommended and p.name not in current]
    shift = [p for p in players
             if p.name in recommended and p.name in current
             and recommended[p.name] != current[p.name]]

    for p in sorted(start, key=lambda x: -x.effective_proj):
        moves.append(f"START {p.name} ({p.position}, {p.effective_proj:.1f} proj) at {recommended[p.name]}")
    for p in sorted(sit, key=lambda x: -x.proj):
        why = _why_benched(p)
        moves.append(f"SIT   {p.name} ({p.position}, {p.proj:.1f} proj){why}")
    for p in shift:
        moves.append(f"MOVE  {p.name} from {current[p.name]} to {recommended[p.name]}")
    return moves


def _why_benched(p: Player) -> str:
    if p.bye:
        return " - on bye"
    if p.status in NO_PLAY:
        return f" - {p.status.replace('_', ' ').lower()}"
    if p.status == "DOUBTFUL":
        return " - doubtful"
    return ""


def warnings_for(players: List[Player], assignment: Dict[str, List[Player]],
                 slot_counts: Dict[str, int]) -> List[str]:
    out = []
    for slot, n in slot_counts.items():
        filled = len(assignment.get(slot, []))
        if filled < n:
            out.append(f"No eligible player for {slot} ({filled}/{n} filled). Look at waivers.")
    for slot, ps in assignment.items():
        for p in ps:
            if p.bye:
                out.append(f"{p.name} is starting at {slot} but is on BYE.")
            elif p.status in NO_PLAY:
                out.append(f"{p.name} is starting at {slot} but is {p.status.replace('_', ' ').lower()}.")
            elif p.status in SHAKY:
                out.append(f"{p.name} ({slot}) is {p.status.lower()}. Check status before kickoff.")
            if p.locked:
                out.append(f"{p.name} ({slot}) is locked; game already started.")
    return out


def projected_total(assignment: Dict[str, List[Player]]) -> float:
    return round(sum(p.effective_proj for ps in assignment.values() for p in ps), 1)
