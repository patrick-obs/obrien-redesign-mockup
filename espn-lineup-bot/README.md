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

## Dashboard, season strategy and automation

- **Win chance.** Each league card leads with the chance of winning this week, from the gap between the two
  projected finishes and how much of the week is left to play (a normal model with a 24-point weekly
  spread that shrinks as games finish). Below it: score now, projected finish (ESPN's live projection
  during games, otherwise the lineup as set), and the best possible lineup. Everything is a link.
- **To do.** Every card lists the concrete next clicks: set the lineup, add or claim the top waiver
  pick (drop pre-filled), propose the best trade, open the game plan. With nothing to fix it still
  offers "Review lineup" and the plan.
- **Advisor projection.** Beside ESPN's number for every starter: ESPN blended with the player's last
  three games and season average, nudged by the opponent's rank against the position, discounted for
  questionable/doubtful. Totals for both lineups appear in the matchup header; the optimizer still
  sets lineups on ESPN's projection.
- **Game plan** (`worker/season.js`). Playoff odds and expected wins from 1,500 simulations of the
  remaining schedule (each game won with a probability from the two teams' average scores, standings
  by wins then points), a mode (lock / contend / push / long shot), your starters ranked by position
  against the league, each remaining game with a win chance, byes still to come for starters, and an
  ordered list of moves. Claude writes the plan in the same call as the analyst's take; the rules
  version is the fallback.
- **Trades look further out.** Player values are weighted over the remaining weeks: bye weeks count
  against a player, playoff weeks count 1.5x when you are in contention (playoff odds >= 35%) and
  0.5x when not. Packages go up to three players a side. Cards show the per-week and rest-of-season
  gain.
- **Automatic lineups.** On every cron run (Thu/Sat/Sun 8am ET, Thu 6pm, Sun noon) the Worker sets
  each lineup to the recommendation, logging to `auto:<league>:<week>`. It only acts while the lineup
  still matches what it last set that week; a manual change on ESPN makes it stand down for the
  week. Off switch in Settings. "Fill empty slots automatically" (off by default) adds the best free
  agent for a slot nobody on the roster can fill and drops the lowest-value bench player; it never
  places waiver claims.
- **Orphaned leagues.** A league that reached the season without a draft is shown as "Not renewed"
  with an explanation and a Hide button; hidden leagues can be shown again from Settings.
- "Locked" is shown as a small lock, not a warning; byes are grey; amber is only for real uncertainty.

## Trades, waivers and the analyst

- **Analyst's take.** Every league page opens with a short read of the week: the matchup, what the
  lineup as set leaves on the bench, the biggest risk, the one waiver move and the one trade that
  matter, and where you stand against the playoff line. It is built from the numbers in
  `worker/analyst.js`. If the Worker has an `ANTHROPIC_API_KEY` secret, Claude rewrites the same
  facts into better prose (model `claude-opus-5-5`, low effort, 25 s timeout); without the key, or
  if the call fails, the rules-based text is shown. The take is cached with the league report.
- **Claude spending controls.** One call per league per report rebuild (reports are cached for
  `CACHE_SECONDS`, default 10 minutes, and rebuilt by the cron three mornings a week). On top of
  that: `ANALYST_DAILY_CAP` (plain variable, default 60) caps calls per UTC day, counted in the
  Durable Object; `ANALYST_ENABLED=0` switches Claude off without removing the key; `max_tokens`
  is 1500 and the prompt is a few hundred tokens, so a call costs well under a cent. Settings shows
  the key status and today's count. Set a monthly spend limit in the Anthropic Console as the
  outer guard. API calls are billed to the Console account, not to a Claude.ai subscription.
- **Trade ideas** (`worker/trades.js`) now include two-player packages: 1-for-1, 2-for-1, 1-for-2
  and 2-for-2. Each is scored by what both sides' best weekly lineups gain for the rest of the
  season. Filters: you never ask for clearly more value than you give (the side that gets the best
  player in the deal pays a premium in depth), nobody is left with an empty starting slot, injured
  and IR players are never involved, and a package is only shown when no simpler trade inside it
  does nearly as well. Three per team, ten per league.
- **Propose this trade on ESPN** sends the offer as an ESPN trade proposal. The other manager gets
  ESPN's normal notice and accepts or declines there; nothing changes on your roster until then.
  Only trades the app computed (and that are still in the cached report) can be sent.
- **Add / Claim** on the waiver watch opens a confirm page. If the roster is full it picks the drop
  for you (lowest rest-of-season value on the bench, never IR, never a locked player, starters
  listed last) and lets you change it. Players on waivers become a waiver claim with a bid field in
  FAAB leagues; free agents are added immediately. Drops only happen as part of an add.
- These writes use the same unofficial ESPN transactions endpoint as "Set lineups" (types
  `TRADE_PROPOSAL`, `FREEAGENT`, `WAIVER`). Any ESPN rejection is shown verbatim on the result page.
- The older Flask version in `app.py`/`templates/` shares the theme but does not have these features.

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
