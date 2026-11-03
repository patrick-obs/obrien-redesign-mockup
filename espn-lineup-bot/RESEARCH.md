# What a seasoned manager weighs, and where the app gets it

Research pass on 2026-11-02 into the variables experienced fantasy managers and the analytics
community use, mapped to what this app can compute from ESPN's fantasy API, ESPN's public
scoreboard, and its own history. Each item says whether it is built, partial, or not possible
with the data we have.

## Weekly win chance

- Model each week as a normal distribution; win chance is the normal CDF of the projected gap over
  the spread. Reported league-level weekly standard deviations run from about 17 to 23 points, and
  should be estimated from the league's own scores rather than assumed. **Built:** `season.js`
  `leagueSd` pools every team's weekly scores (clamped 14 to 30, fallback 24) and feeds
  `winProbability`, the schedule outlook and the playoff simulation.
- Score so far plus remaining projection during the week; the spread shrinks as games finish.
  **Built.**
- Ceiling versus floor: when you need to outscore a stronger team, start high-variance players; when
  favoured, start safe ones. **Built:** per-player weekly histories give a volatility figure; the
  report computes a "ceiling lineup" (projection plus 0.6 standard deviations) and offers it when the
  win chance is under 40%.

Sources: [Fantasy Sports Analytics FAQ](https://fantasy-sports-analytics.com/faqs),
[Fantasy Sports Ventures playoff odds](https://fantasysportsventures.com/tools/playoff-odds/),
[R2 Ted projection system](https://www.r2sportsmetrics.com/post/introducing-r2-ted-dfs-fantasy-football-projection-system),
[Fantasy Points WAR](https://www.fantasypoints.com/nfl/articles/season/2021/fantasy-war-part-1-theory).

## Start / sit inputs

- Vegas implied team total is widely called the best single predictor of weekly scoring; big
  favourites tend to run in the second half (fewer pass attempts). **Built:** `vegas.js` reads
  ESPN's public scoreboard (line, over/under, home favourite, venue, weather) and `contextFactor`
  moves the Advisor projection by up to +/-15%: implied total vs 23, a 9.5+ point favourite's
  passing game down 3% and backs up 3%.
- Weather: wind and rain hurt kickers and passing; indoor games are exempt. **Partial:** the
  scoreboard gives a text condition and indoor flag but no wind speed; wet/windy text applies a
  kicker -12%, QB/WR -5%, D/ST +4%.
- Usage: snap share, route share, target share (12% target share on full snaps is marginal; RBs
  above a 45-65% committee threshold). **Not available** from the fantasy API; recent average and
  season average stand in for role.
- Defense-vs-position rank: common tiebreaker. **Built** (ESPN positional ratings, +/-8%).
- Injury designations: questionable 0.9x, doubtful 0.25x. **Built.**

Sources: [Rotostreet start/sit rules](https://www.rotostreetjournal.com/2026/10/21/start-sit-rules-fantasy-football-strategy/),
[Yahoo Fantasy University](https://sports.yahoo.com/fantasy-football-advice-how-to-make-start-sit-decisions-rankings-211556515.html),
[Target share and snap counts](https://fantasystartsit.com/target-share-and-snap-counts).

## Trades

- Rest-of-season value is the baseline; one week's matchup should not move a player's season value.
  **Built** (season projection blended with results, weighted over remaining weeks).
- Bye weeks ahead and the fantasy playoff weeks (15 to 17) matter; playoff schedule is worth a few
  percent as a tiebreaker, not a driver. **Built:** byes remove weeks from the horizon; playoff weeks
  weigh 1.5x when contending; `playoffSos` adjusts value by up to +/-5% from the opponents' rank
  against the position in weeks 15 to 17.
- Consolidation: do not give up the one player you never have to think about starting just to get
  more names. **Built:** your top two assets are protected unless the return includes a better one.
- Positional scarcity and league settings: **partial** (positional strength ranks against the league).

Sources: [RotoWire trade analyzer](https://www.rotowire.com/football/article/fantasy-football-trade-analyzer-find-and-grade-redraft-fantasy-football-trades-in-2026-134904),
[FantasyLife rate my trade](https://www.fantasylife.com/tools/rate-my-trade),
[AFFL trade analyzer guide](https://affl.com/ultimate-guide-fantasy-football-trade-p8pm.html).

## Waivers and FAAB

- Price the role you are buying, not last week's points; check injury status and usage. **Partial.**
- Never spend budget on streaming defenses or kickers: free-agent adds or $0 bids. **Built** in the
  bid suggestion.
- Bid by position as a share of budget (QB about 1%, TE about 10-12% in a $100 league), avoid round
  numbers, and spend down late in the season because unspent budget scores nothing. **Built:** the
  add page suggests a bid from edge, position, weeks left and budget left, nudged above round numbers.
- Consider who else will bid (a manager who just lost a starter). **Not built.**

Sources: [FantasyPros FAAB advice](https://www.fantasypros.com/2025/08/fantasy-football-strategy-faab-waiver-wire-advice/),
[4for4 waiver and FAAB guide](https://www.4for4.com/2025/preseason/ultimate-guide-waiver-wire-faab-strategy-2025),
[Signals Fantasy FAAB strategy](https://signalsfantasy.com/guides/faab-waiver-wire-strategy).

## Playoff push

- Playoffs usually weeks 15 to 17; the next week always matters more than the one after. **Built**
  (contention mode, playoff weighting).
- Handcuffs for your RB1 gain value in December; opinions differ on how much. **Not built** (no depth
  chart data).
- Do not stack one shaky offense across your lineup. **Not built.**

Sources: [RotoBaller playoff schedules](https://www.rotoballer.com/best-fantasy-football-playoff-schedules-for-waiver-wire-streamers-stashes-weeks-15-17-2025/1757718),
[FTN handcuff strategy](https://ftnfantasy.com/nfl/fantasy-football-handcuff-strategy-for-2026),
[CBS week 15 mailbag](https://www.cbssports.com/fantasy/football/news/fantasy-football-week-15-mailbag-playoff-strategies-handcuffs-and-startsit-questions-galore).

## Guardrails that came from mistakes

- A slot that is empty because its player is on bye this week is not a roster hole; it fills itself
  next week. Late in the week, think about next week. (`bye_cover`)
- A trade that leaves one quarterback should say which week that quarterback's bye is.
- Never auto-add via a waiver claim; never auto-drop a recommended starter.

## Writes: the shapes ESPN's own client sends

Every roster, waiver and trade action is one `POST` to
`lm-api-writes.fantasy.espn.com/apis/v3/games/ffl/seasons/{season}/segments/0/leagues/{id}/transactions/` with the
envelope `{ isLeagueManager: false, teamId, type, memberId: SWID, scoringPeriodId, executionType, items?, relatedTransactionId? }`.
`scoringPeriodId` must be the league's current period (`status.latestScoringPeriod`) or ESPN answers 409
"Transaction type can only be executed in the current scoring period"; the one exception is `FUTURE_ROSTER`, where it is
the target week.

| Action | `type` | `executionType` | Notes | Status |
|---|---|---|---|---|
| Lineup, this week | `ROSTER` | `EXECUTE` | `LINEUP` items with from/to slot ids | confirmed live (ours) |
| Lineup, a later week | `FUTURE_ROSTER` | `EXECUTE` | same items, `scoringPeriodId` = that week | bundle + live records (benchboss) |
| Add / claim | `FREEAGENT` / `WAIVER` | `EXECUTE` | `ADD` and `DROP` items, `bidAmount` on claims | confirmed live (ours) |
| Propose a trade | `TRADE_PROPOSAL` | `EXECUTE` | `TRADE` items with fromTeamId/toTeamId | confirmed live (ours) |
| Withdraw my offer | `TRADE_PROPOSAL` | `CANCEL` | `relatedTransactionId` = the offer, no items | live capture, 200 (jwulff) |
| Accept an offer | `TRADE_ACCEPT` | `EXECUTE` | `relatedTransactionId`; `DROP` items only to make room | bundle + live records |
| Decline an offer | `TRADE_DECLINE` | `EXECUTE` | `relatedTransactionId`, optional `comment` | bundle + live records |

What the log (`mTransactions2`) then shows: the proposal's own row stays `PENDING`; the withdrawal, decline and
acceptance are separate rows that point at it through `relatedTransactionId` (acceptance twice: the manager's
`TRADE_ACCEPT`, then the server's `TRADE_ACCEPT` with `executionType: PROCESS` when the players move). `espn.js`
`tradeTransactions` folds those into one status per offer. Calls ESPN does not accept: `DELETE /transactions/{id}` (405),
`POST /transactions/{id}/cancel` (404), `PUT`/`PATCH /transactions/{id}` (405).

Sources: [jwulff/fantasy-sports, brief 07 and the captured t2-cancel request](https://github.com/jwulff/fantasy-sports/blob/main/docs/research/07-espn-trade-surface.md),
[ValeQRamos/benchboss, writes reconstructed from ESPN's kona bundle](https://github.com/ValeQRamos/benchboss/blob/main/docs/api/04-writes-transactions.md),
[jessie-red/ff-manager, captured proposal and bundle-read acceptTrade](https://github.com/jessie-red/ff-manager/blob/main/src/espn/transactions.ts).
