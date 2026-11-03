// Game context from ESPN's public scoreboard (no login): betting line, implied team totals, venue and weather.
// Implied team totals are the most-cited single predictor of weekly fantasy scoring; see RESEARCH.md.

export const SCOREBOARD = "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard";

/** { proTeamId: { opponent_id, home, total, spread, implied, favorite, indoor, weather, temperature, kickoff, wind_risk, wet } } */
export function parseScoreboard(d) {
  const out = {};
  for (const e of d?.events || []) {
    const c = (e.competitions || [])[0]; if (!c) continue;
    const odds = (c.odds || [])[0] || {};
    const home = (c.competitors || []).find((t) => t.homeAway === "home"), away = (c.competitors || []).find((t) => t.homeAway === "away");
    if (!home || !away) continue;
    const total = Number(odds.overUnder) || null;
    // ESPN's spread is from the home side: negative when the home team is favoured.
    const spread = odds.spread != null ? Number(odds.spread) : null;
    const weather = e.weather?.displayValue || "", temp = e.weather?.temperature ?? null, indoor = !!c.venue?.indoor;
    const wet = !indoor && /rain|snow|storm|shower|sleet|drizzle/i.test(weather), windy = !indoor && /wind|gust|breez/i.test(weather);
    const mk = (me, opp, isHome) => {
      const mySpread = spread == null ? null : (isHome ? spread : -spread);           // negative = favoured
      const implied = total != null && mySpread != null ? Math.round(((total - mySpread) / 2) * 10) / 10 : null;
      return { opponent_id: Number(opp.id), home: isHome, total, spread: mySpread, implied, favorite: mySpread != null && mySpread < 0,
        big_favorite: mySpread != null && mySpread <= -9.5, indoor, weather, temperature: temp, kickoff: e.date || null, wet, windy, line: odds.details || "" };
    };
    out[Number(home.id)] = mk(home, away, true);
    out[Number(away.id)] = mk(away, home, false);
  }
  return out;
}

export async function fetchScoreboard(fetchFn, season, week) {
  const r = await fetchFn(`${SCOREBOARD}?seasontype=2&week=${week}&dates=${season}`, { headers: { Accept: "application/json" } });
  if (r.status !== 200) throw new Error(`scoreboard ${r.status}`);
  return parseScoreboard(await r.json());
}

/**
 * How much a player's projection moves on game context, as a multiplier. Scaled so a 28-point implied total is about
 * +8% and an 18-point one about -8%; a 10-point favourite's passing game loses a touch (they run out the clock) and its
 * backs gain; wet or windy outdoor games hurt kickers and passing. Bounded to +/-15%.
 */
export function contextFactor(g, position) {
  if (!g) return 1;
  let f = 1;
  if (g.implied != null) f *= 1 + Math.max(-0.3, Math.min(0.3, (g.implied - 23) / 23)) * 0.35;
  if (g.big_favorite) f *= position === "RB" ? 1.03 : ["QB", "WR", "TE"].includes(position) ? 0.97 : 1;
  if (g.wet || g.windy) f *= position === "K" ? 0.88 : ["QB", "WR"].includes(position) ? 0.95 : position === "D/ST" ? 1.04 : 1;
  return Math.max(0.85, Math.min(1.15, f));
}
