# ESPN Lineup Advisor

Run it whenever you want (Thursday morning, Sunday morning) and it prints:

- your matchup this week, with ESPN's projected score for both sides
- the best lineup from your roster by projection, with injuries, byes, and locked players handled
- the exact start/sit changes to make, and how many projected points they are worth
- warnings: questionable starters, empty slots, players on bye
- your opponent's best lineup and their problems
- free agents who out-project your weakest starter at each position
- league standings

It is read-only. It never touches your roster. You make the moves on ESPN.

## Setup (once)

1. Install Python 3.10 or newer from python.org (tick "Add to PATH" on Windows).
2. Copy `.env.example` to `.env`.
3. Fill in `LEAGUE_ID` from your league URL.
4. If the league is private, fill in `ESPN_S2` and `SWID`:
   open fantasy.espn.com logged in, press F12, go to Application, Cookies,
   `https://fantasy.espn.com`, and copy the two values. Keep the braces on SWID.

## Run

Windows: double-click `run.bat`, or in a terminal:

```
run.bat
run.bat --week 9
run.bat --no-waivers
run.bat --json
```

Mac/Linux:

```
./run.sh
./run.sh --week 9
```

The first run creates a virtual environment and installs the one dependency.

## How it decides

- Projection source is ESPN's own weekly projection for each player.
- Players who are Out, on IR, suspended, or on bye are treated as zero.
- Doubtful players are discounted to a quarter of their projection. Questionable players
  are kept but flagged.
- Players whose game has already started are left where they are.
- Slots are filled most-restrictive first (QB, K, D/ST, TE, RB, WR), then flex slots take
  the best leftovers. Your league's slot shape is read from your current lineup.
- `L3avg` is the player's average actual score over the last three weeks, when ESPN
  returns it.
- `OppRk` is ESPN's opponent rank against the position, the same number the ESPN site shows.

## When it breaks

- "Could not load league": your cookies expired. Re-copy `ESPN_S2` and `SWID`.
- "Could not match your SWID to a team": set `TEAM_ID` in `.env`. The error lists the IDs.
- ESPN's API is unofficial. If ESPN changes it, update the library with
  `pip install -U espn_api` inside `.venv`.

## Tests

```
pip install pytest
pytest tests
```
