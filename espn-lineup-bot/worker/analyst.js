// The resident analyst. Turns a league report into a short, confident read of the week: matchup, lineup,
// risk, waivers, trades and the standings picture. Works from the numbers alone; if ANTHROPIC_API_KEY is
// set, Claude rewrites the same facts into better prose (never new facts).

const f1 = (x) => Number(x).toFixed(1);

/** Facts the take is built from. Kept separate so the Claude rewrite sees exactly what the rules saw. */
export function analystFacts({ report: r, trades = [], league = {} }) {
  const myBest = r.recommended_lineup_proj, oppBest = r.opponent_best_proj, asSet = r.current_lineup_proj;
  const edge = Math.round((myBest - oppBest) * 10) / 10;
  const benchCost = Math.round((myBest - asSet) * 10) / 10;
  const problems = r.warnings.filter((w) => /No eligible|BYE| is out|injury reserve|suspension/.test(w));
  const shaky = r.warnings.filter((w) => /questionable|doubtful|day to day/i.test(w));
  const picks = Object.entries(r.waivers).flatMap(([pos, ps]) => ps.filter((p) => !p.error).map((p) => ({ ...p, pos })));
  picks.sort((a, b) => (b.fills_empty_slot - a.fills_empty_slot) || (b.edge - a.edge));
  const me = r.standings.find((t) => t.team_id === r.team_id);
  const rank = me ? me.rank : null;
  const playoffTeams = league.playoffTeamCount || 0;
  const weeksLeft = Math.max(0, (league.regSeasonCount || 0) - r.week + 1);
  const rem = r.schedule || [];
  const toughest = rem.slice().sort((a, b) => b.avg_pf - a.avg_pf)[0] || null;
  return { team: r.team, record: r.record, week: r.week, opponent: r.opponent, opponent_record: r.opponent_record,
    my_best: myBest, opp_best: oppBest, edge, as_set: asSet, bench_cost: benchCost, moves: r.moves, problems, shaky,
    top_pick: picks[0] || null, top_trade: trades[0] || null, rank, teams: r.standings.length, playoff_teams: playoffTeams,
    weeks_left: weeksLeft, toughest_remaining: toughest, points_for_rank: pointsForRank(r.standings, r.team_id) };
}

function pointsForRank(standings, teamId) {
  const byPf = standings.slice().sort((a, b) => b.pf - a.pf);
  const i = byPf.findIndex((t) => t.team_id === teamId);
  return i < 0 ? null : i + 1;
}

/** Rule-based take: a headline plus three short paragraphs. */
export function analystTake(input) {
  const f = analystFacts(input);
  const p = [];
  // 1. The matchup.
  let headline, matchup;
  if (f.opp_best < 0 || f.opponent === "bye") { headline = "Bye week. Use it to fix the roster."; matchup = `No opponent this week, which makes it the right time to work the waiver wire and shop a trade.`; }
  else if (f.edge >= 8) { headline = `You're a clear favorite over ${f.opponent}.`; matchup = `Best lineup against best lineup, you project ${f1(f.my_best)} to ${f.opponent}'s ${f1(f.opp_best)}. That is a cushion of ${f1(f.edge)} points, and the only way to lose it is to leave points on the bench.`; }
  else if (f.edge >= 2.5) { headline = `Slight edge to you against ${f.opponent}.`; matchup = `You project ${f1(f.my_best)} to ${f.opponent}'s ${f1(f.opp_best)} with both lineups set right. ${f1(f.edge)} points is real but not comfortable; every start-sit call matters this week.`; }
  else if (f.edge > -2.5) { headline = `Coin flip against ${f.opponent}.`; matchup = `${f1(f.my_best)} for you against ${f1(f.opp_best)} for ${f.opponent}, with both lineups at their best. This one comes down to who sets their lineup and who gets the bounces.`; }
  else { headline = `You're the underdog against ${f.opponent}.`; matchup = `${f.opponent} projects ${f1(f.opp_best)} to your ${f1(f.my_best)}, a gap of ${f1(Math.abs(f.edge))} points. You need upside, not safety: start the players with the big ceilings and check the waiver wire for anyone who out-projects your weakest starter.`; }
  p.push(matchup);
  // 2. Lineup and risk.
  const bits = [];
  if (f.bench_cost >= 1) bits.push(`Right now the lineup as set leaves ${f1(f.bench_cost)} points on the bench; ${f.moves.length === 1 ? "one move fixes it" : `${f.moves.length} moves fix it`}.`);
  else bits.push("The lineup is already optimal, so there is nothing to fix there.");
  if (f.problems.length) bits.push(`The real risk is ${lower(f.problems[0])}${f.problems.length > 1 ? `, and ${f.problems.length - 1} more like it` : ""}.`);
  else if (f.shaky.length) bits.push(`Watch the injury report: ${lower(f.shaky[0])}.`);
  if (f.top_pick) bits.push(f.top_pick.fills_empty_slot
    ? `Top waiver priority is ${f.top_pick.name} (${f.top_pick.pos}); he fills a slot you cannot fill from the roster.`
    : `If you make one waiver move, make it ${f.top_pick.name} (${f.top_pick.pos}), who out-projects your weakest starter there by ${f1(f.top_pick.edge)}.`);
  p.push(bits.join(" "));
  // 3. Season picture and trade angle.
  const season = [];
  if (f.rank) {
    const inside = f.playoff_teams ? f.rank <= f.playoff_teams : null;
    season.push(`At ${f.record} you sit ${ordinal(f.rank)} of ${f.teams}${f.playoff_teams ? `, ${inside ? "inside" : "outside"} the ${f.playoff_teams}-team playoff line` : ""}${f.weeks_left ? ` with ${f.weeks_left} week${f.weeks_left === 1 ? "" : "s"} of regular season left` : ""}.`);
    if (f.points_for_rank && f.points_for_rank < f.rank - 1) season.push(`You are ${ordinal(f.points_for_rank)} in points scored, so the record undersells this roster.`);
    else if (f.points_for_rank && f.points_for_rank > f.rank + 1) season.push(`You are only ${ordinal(f.points_for_rank)} in points scored, so the record is better than the roster; add talent while the standing is good.`);
  }
  if (f.toughest_remaining) season.push(`The hardest game left is week ${f.toughest_remaining.week} against ${f.toughest_remaining.opponent} (${f1(f.toughest_remaining.avg_pf)} a week).`);
  if (f.top_trade) season.push(`The trade to make: ${f.top_trade.give_names} to ${f.top_trade.with} for ${f.top_trade.get_names}, worth about ${f1(f.top_trade.my_gain)} a week to you${f.top_trade.their_gain >= 0 ? " and fair for them" : ""}.`);
  else season.push("No trade on the board clearly helps you without hurting the other side; keep checking as injuries move values.");
  p.push(season.join(" "));
  return { headline, paragraphs: p, source: "rules", facts: f };
}

// First letter down, trailing period off, and any inner full stop softened so the sentence can be embedded.
const lower = (s) => s.replace(/\.$/, "").replace(/\. /g, "; ").replace(/^(\w)/, (c) => c.toLowerCase());
const ordinal = (n) => `${n}${["th", "st", "nd", "rd"][(n % 100 > 10 && n % 100 < 14) ? 0 : Math.min(n % 10, 4) % 4] || "th"}`;

const MODEL = "claude-opus-5-5";
const SYSTEM = `You are the resident analyst for a private fantasy football app used by one manager. Write like a sharp, likeable TV analyst: confident, specific, second person, plain words, no hype, no emoji, no headers, no bullet points. You may only use the facts in the JSON you are given; never invent players, stats, injuries or news. Numbers are ESPN projections. Return exactly this shape: a first line that is a headline of at most twelve words, a blank line, then two or three short paragraphs totalling 120 to 180 words that cover the matchup, the lineup and biggest risk, and the season picture with the one trade or waiver move that matters most.`;

/**
 * Optional rewrite by Claude. Returns a take with source "claude", or null on any failure, so callers fall back to the rules.
 * Plain fetch: the Worker has no runtime dependencies by design.
 */
export async function polishTake(take, { apiKey, fetchFn = fetch, timeoutMs = 25000, model = MODEL } = {}) {
  if (!apiKey) return null;
  try {
    const r = await fetchFn("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": apiKey, "anthropic-version": "2026-10-21", "anthropic-beta": "server-side-fallback-2026-07-01", "content-type": "application/json" },
      body: JSON.stringify({ model, max_tokens: 1500, fallbacks: "default", output_config: { effort: "low" }, system: SYSTEM,
        messages: [{ role: "user", content: `Facts:\n${JSON.stringify(take.facts)}\n\nA rules-based draft you may improve on but must not contradict:\n${take.headline}\n\n${take.paragraphs.join("\n\n")}` }] }),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!r.ok) { console.warn("analyst: claude returned", r.status); return null; }
    const d = await r.json();
    if (d.stop_reason === "refusal") return null;
    const text = (d.content || []).filter((b) => b.type === "text").map((b) => b.text).join("").trim();
    const [headline, ...rest] = text.split(/\n\s*\n/);
    if (!headline || rest.length === 0) return null;
    return { headline: headline.replace(/^#+\s*/, "").trim(), paragraphs: rest.map((s) => s.trim()).filter(Boolean), source: "claude", facts: take.facts };
  } catch (e) {
    console.warn("analyst: claude failed", e?.message);
    return null;
  }
}
