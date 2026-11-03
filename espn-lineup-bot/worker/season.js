// Season-level thinking, pure: win chances, playoff odds, rest-of-season horizons, positional strength, a game plan.
import { optimize, projectedTotal, canPlay } from "./optimizer.js";

const r1 = (x) => Math.round(x * 10) / 10;
export const erf = (x) => {
  // Abramowitz-Stegun 7.1.26, good to ~1e-7.
  const s = x < 0 ? -1 : 1; x = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * x);
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return s * y;
};
export const normalCdf = (z) => 0.5 * (1 + erf(z / Math.SQRT2));

/** Weekly fantasy scores vary by roughly this many points around their projection (fallback when a league has too few games). */
export const WEEK_SD = 24;

/** This league's own weekly scoring spread: pooled standard deviation of every team's scores around its mean, clamped to a sane range. */
export function leagueSd(league) {
  let ss = 0, n = 0;
  for (const t of league.teams || []) {
    const sc = (t.scores || []).filter((x, i) => ["W", "L", "T"].includes((t.outcomes || [])[i]) && x > 0);
    if (sc.length < 3) continue;
    const m = sc.reduce((a, b) => a + b, 0) / sc.length;
    for (const x of sc) ss += (x - m) ** 2; n += sc.length - 1;
  }
  if (n < 8) return WEEK_SD;
  return Math.round(Math.max(14, Math.min(30, Math.sqrt(ss / n))) * 10) / 10;
}

/**
 * Chance of winning this matchup given both sides' projected finals and how much of the week is still to be played
 * (1 before kickoff, 0 when every game is final). Returns 0..1.
 */
export function winProbability(myProj, oppProj, remainingShare = 1, weekSd = WEEK_SD) {
  if (!(myProj >= 0) || !(oppProj >= 0)) return null;
  const sd = Math.max(1.5, weekSd * Math.sqrt(Math.max(0, Math.min(1, remainingShare))));
  return Math.round(normalCdf((myProj - oppProj) / sd) * 1000) / 1000;
}

/** Pro teams' bye weeks between fromWeek and toWeek, from the all-season pro schedule: { proTeamId: [weeks] }. */
export function byeWeeks(allSched, fromWeek, toWeek) {
  const out = {};
  for (const [id, games] of Object.entries(allSched || {})) {
    const byes = [];
    for (let w = fromWeek; w <= toWeek; w++) if (!(games[String(w)] || []).length) byes.push(w);
    if (byes.length) out[Number(id)] = byes;
  }
  return out;
}

/** Playoff weeks for the league (matchup periods after the regular season), as scoring-period numbers. */
export function playoffWeeks(league) {
  const reg = league.regSeasonCount || 14;
  const weeks = [];
  for (const [mp, ws] of Object.entries(league.matchupPeriods || {})) if (Number(mp) > reg) weeks.push(...ws.map(Number));
  if (weeks.length) return weeks.sort((a, b) => a - b);
  const out = []; for (let w = reg + 1; w <= (league.finalScoringPeriod || 17); w++) out.push(w);
  return out;
}

/**
 * How much each remaining week counts when valuing a player for the rest of the season. Regular-season weeks count 1;
 * playoff weeks count more when you are in contention (they decide the title) and less when you are not.
 */
export function horizonWeights(league, currentWeek, contending = true) {
  const w = {}; const po = new Set(playoffWeeks(league));
  for (let k = currentWeek + 1; k <= (league.finalScoringPeriod || 17); k++) w[k] = po.has(k) ? (contending ? 1.5 : 0.5) : 1;
  return w;
}

/** Share of the weighted horizon a player is actually available for (bye weeks removed). */
export function availability(weights, byes = []) {
  const bye = new Set(byes); let have = 0, total = 0;
  for (const [k, wt] of Object.entries(weights)) { total += wt; if (!bye.has(Number(k))) have += wt; }
  return total ? have / total : 1;
}

/** Deterministic RNG so tests are repeatable. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

const avgPf = (t) => { const g = t.wins + t.losses + t.ties; return g ? t.pointsFor / g : 0; };

/**
 * Simulate the rest of the regular season many times. Each remaining game is won with probability from the two teams'
 * average scores; the standings are then sorted by wins, with points for as the tiebreak. Returns per team:
 * playoff odds, expected final wins, and the chance of finishing first.
 */
export function simulateSeason(league, { sims = 2000, seed = 7, sd = WEEK_SD } = {}) {
  const teams = league.teams, reg = league.regSeasonCount || teams[0]?.schedule.length || 14, spots = league.playoffTeamCount || Math.max(1, Math.floor(teams.length / 2));
  const idx = Object.fromEntries(teams.map((t, i) => [t.id, i]));
  const pf = teams.map(avgPf);
  // Remaining games: each undecided regular-season week, listed once (from the lower team id).
  const games = [];
  for (const t of teams) t.schedule.slice(0, reg).forEach((oppId, i) => {
    if (["W", "L", "T"].includes(t.outcomes[i]) || oppId === t.id || !(oppId in idx)) return;
    if (t.id < oppId) games.push([idx[t.id], idx[oppId], normalCdf((pf[idx[t.id]] - pf[idx[oppId]]) / (sd * Math.SQRT2))]);
  });
  const rnd = mulberry32(seed);
  const playoffs = new Array(teams.length).fill(0), first = new Array(teams.length).fill(0), winsSum = new Array(teams.length).fill(0);
  for (let s = 0; s < sims; s++) {
    const wins = teams.map((t) => t.wins + t.ties * 0.5), pts = teams.map((t) => t.pointsFor);
    for (const [a, b, p] of games) {
      const ra = pf[a] + (rnd() - 0.5) * sd, rb = pf[b] + (rnd() - 0.5) * sd;
      pts[a] += Math.max(0, ra); pts[b] += Math.max(0, rb);
      if (rnd() < p) wins[a] += 1; else wins[b] += 1;
    }
    const order = teams.map((_, i) => i).sort((x, y) => (wins[y] - wins[x]) || (pts[y] - pts[x]));
    order.slice(0, spots).forEach((i) => { playoffs[i] += 1; });
    first[order[0]] += 1;
    wins.forEach((w, i) => { winsSum[i] += w; });
  }
  const out = {};
  teams.forEach((t, i) => { out[t.id] = { playoff_odds: Math.round((playoffs[i] / sims) * 100), first_odds: Math.round((first[i] / sims) * 100), expected_wins: r1(winsSum[i] / sims), games_left: games.filter((g) => g[0] === i || g[1] === i).length }; });
  return { by_team: out, spots, games_left: games.length };
}

/** Per-game win chances for my remaining regular-season schedule, from average scores. */
export function scheduleOutlook(league, me, sd = WEEK_SD) {
  const reg = league.regSeasonCount || me.schedule.length, mine = avgPf(me);
  const out = [];
  me.schedule.slice(0, reg).forEach((oppId, i) => {
    if (["W", "L", "T"].includes(me.outcomes[i]) || i + 1 <= league.currentWeek) return;
    const o = league.byId[oppId]; if (!o) return;
    out.push({ week: i + 1, opponent: o.name, opponent_id: o.id, logo: o.logo || "", avg_pf: r1(avgPf(o)), win_prob: Math.round(normalCdf((mine - avgPf(o)) / (sd * Math.SQRT2)) * 100) });
  });
  return out;
}

const POSITIONS = ["QB", "RB", "WR", "TE", "K", "D/ST"];

/**
 * How my starters at each position compare with the league: the sum of my best N at the position (N = starting slots,
 * flex counted as half a slot for RB/WR/TE) against every other team's, ranked 1 = best.
 */
export function positionalStrength(rosters, myTeamId, slotCounts) {
  const flex = (slotCounts["RB/WR/TE"] || 0) + (slotCounts["RB/WR"] || 0) + (slotCounts["WR/TE"] || 0) + (slotCounts.OP || 0);
  const need = {}; for (const p of POSITIONS) need[p] = (slotCounts[p] || 0) + (["RB", "WR", "TE"].includes(p) && flex ? 0.5 : 0);
  const score = (players, pos) => {
    const n = Math.ceil(need[pos]); if (!n) return 0;
    const top = players.filter((p) => p.position === pos && canPlay(p)).map((p) => p.proj).sort((a, b) => b - a).slice(0, n);
    return r1(top.reduce((s, v) => s + v, 0));
  };
  const out = {};
  for (const pos of POSITIONS) {
    if (!need[pos]) continue;
    const all = Object.entries(rosters).map(([id, ps]) => ({ id: Number(id), v: score(ps, pos) })).sort((a, b) => b.v - a.v);
    const mine = all.find((x) => x.id === myTeamId);
    if (!mine) continue;
    const avg = r1(all.reduce((s, x) => s + x.v, 0) / all.length);
    out[pos] = { mine: mine.v, league_avg: avg, rank: all.findIndex((x) => x.id === myTeamId) + 1, teams: all.length, best: all[0].v };
  }
  return out;
}

/** Rules-based game plan: ordered, concrete, from the numbers. */
export function gamePlan({ report: r, odds, outlook, strength, trades = [], weeksLeft, byesAhead = [] }) {
  const f1 = (x) => Number(x).toFixed(1);
  const me = odds?.by_team?.[r.team_id];
  const bullets = [];
  let mode = "contend";
  if (me) {
    if (me.playoff_odds >= 85) mode = "lock";
    else if (me.playoff_odds >= 35) mode = "contend";
    else if (me.playoff_odds >= 8) mode = "push";
    else mode = "long shot";
  }
  const positions = Object.entries(strength || {});
  const weak = positions.filter(([, s]) => s.rank > Math.ceil(s.teams / 2)).sort((a, b) => (b[1].rank / b[1].teams) - (a[1].rank / a[1].teams));
  const strong = positions.filter(([, s]) => s.rank <= 2).map(([p]) => p);
  // 1. Where you stand.
  if (me) bullets.push(mode === "lock" ? `Playoff spot is close to locked (${me.playoff_odds}% odds). Play for seeding and for the playoff weeks: that is where depth and matchups win it.`
    : mode === "contend" ? `You are in the race (${me.playoff_odds}% playoff odds, ${f1(me.expected_wins)} expected wins). Every week counts; favour sure points over upside until the spot is safe.`
    : mode === "push" ? `Outside looking in (${me.playoff_odds}% playoff odds). You need wins now: start ceilings over floors, be aggressive on waivers, and make the trade that helps this week even if it costs a little later.`
    : `Playoffs are a long shot (${me.playoff_odds}%). Keep setting the best lineup, chase points-for as the tiebreak, and take any trade that is clearly good value; nothing else is worth much now.`);
  // 2. This week's non-negotiables.
  const fix = [];
  if (r.lineup_items.length) fix.push(`set the lineup (${r.lineup_items.length} change${r.lineup_items.length === 1 ? "" : "s"}, ${f1(r.recommended_lineup_proj - r.current_lineup_proj)} points)`);
  const picks = Object.entries(r.waivers).flatMap(([pos, ps]) => ps.filter((p) => !p.error).map((p) => ({ ...p, pos }))).sort((a, b) => ((b.fills_empty_slot && !b.bye_cover) - (a.fills_empty_slot && !a.bye_cover)) || (b.edge - a.edge));
  if (picks[0]) fix.push(picks[0].fills_empty_slot ? (picks[0].bye_cover ? `${picks[0].pos} is empty this week only (${picks[0].returning} on bye); adding ${picks[0].name} is optional` : `add ${picks[0].name} (${picks[0].pos}) to fill the empty ${picks[0].pos} slot`) : `add ${picks[0].name} (${picks[0].pos}), +${f1(picks[0].edge)} over your weakest starter there`);
  if (fix.length) bullets.push(`This week: ${fix.join("; ")}.`);
  // 3. Roster shape.
  if (weak.length) {
    const [pos, s] = weak[0];
    bullets.push(`Weakest spot is ${pos}: ${ordinal(s.rank)} of ${s.teams} teams (${f1(s.mine)} a week against a league average of ${f1(s.league_avg)}). That is the position to buy${strong.length ? `; you can afford to sell from ${strong.join(" or ")}, where you rank top two` : ""}.`);
  } else if (strong.length) bullets.push(`No weak position; you rank top two at ${strong.join(", ")}. Hold the core and only trade for a clear upgrade.`);
  // 4. The trade.
  if (trades[0]) bullets.push(`Best trade on the board: ${trades[0].give_names} to ${trades[0].with} for ${trades[0].get_names}, about ${f1(trades[0].my_gain)} a week${weeksLeft ? ` (${f1(trades[0].my_gain * weeksLeft)} points over the remaining ${weeksLeft} weeks)` : ""}; the other side ${trades[0].their_gain >= 0 ? "gains too" : "barely loses"}, so send it.`);
  // 5. Schedule and byes.
  if (outlook && outlook.length) {
    const hard = outlook.filter((g) => g.win_prob < 45), easy = outlook.filter((g) => g.win_prob >= 60);
    const n = outlook.length;
    bullets.push(!easy.length && !hard.length ? `Remaining schedule: ${n} game${n === 1 ? "" : "s"}, all close calls on paper; your lineup decisions will decide them.`
      : `Remaining schedule: ${n} game${n === 1 ? "" : "s"}, ${easy.length} where you are favoured and ${hard.length} where you are not${hard.length ? ` (${hard.map((g) => `week ${g.week} vs ${g.opponent}, ${g.win_prob}%`).join("; ")})` : ""}.`);
  }
  if (byesAhead.length) bullets.push(`Byes still to come for starters: ${byesAhead.map((b) => `${b.name} week ${b.week}`).join(", ")}. Line up cover a week early rather than scrambling on Sunday.`);
  return { mode, bullets };
}

const ordinal = (n) => `${n}${["th", "st", "nd", "rd"][(n % 100 > 10 && n % 100 < 14) ? 0 : Math.min(n % 10, 4) % 4] || "th"}`;
