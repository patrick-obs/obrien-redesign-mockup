# Fantasy Advisor

A private web app (and a command-line tool) for ESPN fantasy football, hosted free on Cloudflare. Log in, see every
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

## Deploy on Cloudflare (free plan, dashboard only, about 15 minutes)

The web app runs as a Cloudflare Worker plus one Durable Object (`worker/`, `wrangler.jsonc`).
Both are on the free plan. Everything below happens in the Cloudflare dashboard; nothing runs
on your computer.

1. **Create the Worker from GitHub**: Workers & Pages, Create, Workers, "Import a repository",
   connect GitHub and pick this repo. Build settings:
   - Root directory: `espn-lineup-bot` (blank if the app is at the root of its own repo)
   - Production branch: `espn-lineup-bot` (or `main` in its own repo)
   - Build command: leave empty
   - Deploy command: `npx wrangler deploy`
   Save; the first build takes a minute.
2. **Secrets**: open the Worker, Settings, Variables and Secrets, add these four as secrets:
   - `APP_PASSWORD`: the passphrase she logs in with. Make it long.
   - `SECRET_KEY`: any long random string (signs the login cookie).
   - `ESPN_S2` and `SWID`: her ESPN cookies (see below).
   Secrets apply to the next deployment: Deployments, Deploy (or push any commit).
3. **Check it**: open the `*.workers.dev` URL, log in. The first load pulls every league from
   ESPN (a few seconds); after that pages are cached for 10 minutes, and a scheduled job
   pre-builds everything Thursday, Saturday and Sunday mornings.
4. **Subdomain**: Worker, Settings, Domains and Routes, Add, Custom domain,
   `christinewoodsfantasy.patrick-obrien.com`. This needs `patrick-obrien.com` to be a zone on
   Cloudflare (nameservers pointed at Cloudflare, free plan). Cloudflare creates the DNS record
   and certificate itself. If the domain is not on Cloudflare yet, use the workers.dev URL for
   now and add the domain under Cloudflare, Domains, Add a domain.

When the ESPN cookies expire, paste new ones on the app's Settings page. They are stored in the
Durable Object and survive redeploys, so the dashboard secrets only matter for the first start.

Free plan limits that matter: 100,000 requests a day (this app uses a few dozen) and 50
outbound requests per page load (a league needs about 10). Durable Objects on the free plan get
30 seconds of CPU per request, which is why the app lives there and not in the Worker itself.

### Other ways to run it

- `python app.py` runs the same app as a Flask server (`Dockerfile` included) for a home
  machine behind a Cloudflare Tunnel, or any Docker host.
- `lineup.py` is the command-line version.

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
npm test                 # Worker: optimizer, trades, parsing, report, app routes (18 tests)
ESPN_S2=... SWID=... npm run smoke   # Worker code against your real leagues, from your machine
pip install pytest && pytest tests   # Python CLI and Flask app (21 tests)
```

## Look and feel

- All CSS lives in one place per version: the `CSS` constant in `worker/html.js` (Worker) and the
  `<style>` block in `templates/base.html` (Flask). They are identical; change both.
- Headings use Fraunces from Google Fonts; body text is the system font. Colors are the theme
  variables at the top of the stylesheet, with a dark set under `prefers-color-scheme: dark`.
- The mascot, favicon and home-screen icon are in `public/` (served by Cloudflare as static assets,
  see `assets` in `wrangler.jsonc`) and duplicated in `static/` for Flask. They were made from the
  original black-and-white drawing: background knocked out, ink tinted theme pink, so one file
  works on both light and dark.

## Known limits

- ESPN's API is unofficial. Reads have been stable for years; the lineup write uses the same
  request ESPN's own site sends, but ESPN can change it without notice. If "Set lineups" starts
  failing, the app tells you and you set the lineup on ESPN by hand.
- Writes are not retried, because a retried write submits the move twice. Press once.
- Adding, dropping, and sending trade offers are deliberately left to you.
- Automated roster moves are against the spirit of ESPN's terms. This is a personal tool.
