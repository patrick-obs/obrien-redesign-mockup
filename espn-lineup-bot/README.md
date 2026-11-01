# Fantasy Advisor

A private web app (and a command-line tool) for ESPN fantasy football. Log in, see every
league your ESPN account is in, press one button to set all your lineups, and read trade
and waiver ideas. It uses ESPN's own projections and ESPN's unofficial API.

What the web app does:

- **Dashboard**: every league, your record, this week's opponent, ESPN's projection for both
  sides, and how many points your lineup as set leaves on the bench.
- **Set all lineups**: previews every slot change across all leagues, then sends them to ESPN
  on confirm. Only slot moves. It never adds or drops anyone, never moves locked players, and
  never touches IR.
- **League page**: recommended lineup, changes to make, warnings (byes, injuries, empty slots),
  bench, your opponent's best lineup and their problems, waiver suggestions, trade ideas, every
  matchup in the league, a league-wide injury report, your results, your remaining schedule
  with each opponent's strength, and standings.
- **Trade ideas**: one-for-one swaps that raise your best lineup's weekly projection for the
  rest of the season, filtered to offers the other side could reasonably accept (no injured
  players, no lopsided value, their lineup roughly breaks even or improves).
- **Settings**: paste fresh ESPN cookies when they expire.

Nothing here guarantees a win. It maximizes projected points and stops the avoidable mistakes:
empty slots, bye-week starters, injured starters, better players on the bench.

## How it decides

- Projections are ESPN's weekly projections. Trade values blend ESPN's season projection with
  results so far.
- Out, IR, suspended, and bye-week players are treated as zero. Doubtful players are discounted
  to a quarter of their projection. Questionable players are kept but flagged.
- Players whose game has already started are left where they are.
- Slots are filled most-restrictive first (QB, K, D/ST, TE, RB, WR), then flex slots take the
  best leftovers. Slot shape comes from the league settings, so a slot you left empty on ESPN
  still counts and is shown as EMPTY with waiver options to fill it.
- `OppRk` is ESPN's opponent rank against the position, the same number the ESPN site shows.

## Deploy the web app (Render, about 15 minutes)

The app needs a small always-on server because it holds your ESPN session and talks to ESPN on
your behalf. Render's free web service is enough.

1. Push this repo to GitHub (it already is, if you are reading this there).
2. At render.com, New, Blueprint, pick this repo. Render reads `render.yaml`.
3. Fill in the environment variables it asks for:
   - `APP_PASSWORD`: the passphrase she will log in with. Make it long.
   - `ESPN_S2` and `SWID`: her ESPN cookies (see below). These can also be pasted later on
     the app's Settings page, but the Settings page save does not survive a redeploy on the
     free plan, so set them here too.
   - `SECRET_KEY` is generated for you.
4. Deploy. Open the Render URL, log in, check the dashboard loads (first load takes 20 to 30
   seconds while it pulls every league from ESPN; after that it is cached for 10 minutes).
5. Custom domain: in the Render service, Settings, Custom Domains, add
   `christinewoodsfantasy.patrick-obrien.com` (or any name you like). Render shows a CNAME
   target.
6. DNS: in the Squarespace panel for patrick-obrien.com, add a CNAME record for
   `christinewoodsfantasy` pointing at the target Render gave you. Render issues the TLS
   certificate itself once DNS resolves, usually within minutes.

Any Docker host works too (`Dockerfile` is included; mount `/data` to keep settings).

### Getting the ESPN cookies

Logged in at fantasy.espn.com, press F12, open Application, then Cookies, then
`https://fantasy.espn.com`. Copy the values of `espn_s2` and `SWID` (keep the curly braces on
SWID). They expire every so often; when the app says it cannot load a league, paste fresh ones
on the Settings page.

The cookies act like a password to the ESPN account. Keep them in Render's environment
variables or the app's Settings page, never in the repo.

## Command line (optional)

For a quick report without the web app:

```
cp .env.example .env     # fill in LEAGUE_ID, ESPN_S2, SWID
./run.sh                 # Mac/Linux      run.bat on Windows
./run.sh --trades        # add trade ideas
./run.sh --league 1740217857 --week 9
./run.sh --json
```

## Run locally

```
python -m venv .venv && . .venv/bin/activate     (Windows: .venv\Scripts\activate)
pip install -r requirements.txt
APP_PASSWORD=test SECRET_KEY=dev ESPN_S2=... SWID=... python app.py
```

Then open http://127.0.0.1:5000.

## Tests

```
pip install pytest
pytest tests        # 21 tests: optimizer, trades, lineup payload, CLI, and the web app with ESPN stubbed
```

## Known limits

- ESPN's API is unofficial. Reads have been stable for years; the lineup write uses the same
  request ESPN's own site sends, but ESPN can change it without notice. If "Set lineups" starts
  failing, the app tells you and you set the lineup on ESPN by hand.
- Writes are not retried, because a retried write submits the move twice. Press once.
- Adding, dropping, and sending trade offers are deliberately left to you.
- Automated roster moves are against the spirit of ESPN's terms. This is a personal tool.
