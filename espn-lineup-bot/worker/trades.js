// Trade proposals. Pure. Finds 1-for-1, 2-for-1, 1-for-2 and 2-for-2 packages that lift my best
// weekly lineup for the rest of the season without costing the other side enough to say no.
import { NO_PLAY, makePlayer, optimize, projectedTotal } from "./optimizer.js";

export const MIN_MY_GAIN = 1.0, MAX_THEIR_LOSS = 0.5, MAX_VALUE_ASK = 1.15, PER_TEAM = 3, PER_LEAGUE = 10;
// The side that consolidates (gets the best player in the deal) pays a premium in total value.
export const CONSOLIDATION_PREMIUM = 1.35;
// A package has to beat the best simpler trade inside it by this much, or the simpler trade is offered instead.
export const PACKAGE_MARGIN = 0.5;
// Only each side's most valuable tradeable players go into packages; singles consider everyone.
// Pairs come from the top PACKAGE_POOL, triples from the top TRIPLE_POOL.
export const PACKAGE_POOL = 7, TRIPLE_POOL = 5;

export function playerValue(projAvg, actualAvg, games) {
  projAvg = Number(projAvg || 0); actualAvg = Number(actualAvg || 0);
  const r2 = (x) => Math.round(x * 100) / 100;
  if (projAvg <= 0) return r2(actualAvg);
  if (games <= 0 || actualAvg <= 0) return r2(projAvg);
  const w = Math.min(games, 8) / 16;
  return r2((1 - w) * projAvg + w * actualAvg);
}

export function rosterPlayer(name, position, eligible, status, value, playerId = null, proTeam = "") {
  return makePlayer({ name, position, eligible, slot: "BE", proj: value, status, playerId, proTeam });
}

export const lineupValue = (roster, slotCounts) => projectedTotal(optimize(roster, slotCounts));

/** Short stable id for a proposal, so a link can name it and the server can find it again in the cached bundle. */
export function tradeId(teamKey, give, get) {
  const s = `${teamKey}:${give.map((p) => p.name).join("|")}>${get.map((p) => p.name).join("|")}`;
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16).padStart(8, "0");
}

const sum = (ps) => ps.reduce((n, p) => n + p.proj, 0);
const filled = (assignment) => Object.values(assignment).reduce((n, ps) => n + ps.length, 0);
const r1 = (x) => Math.round(x * 10) / 10;
const tradeable = (ps) => ps.filter((p) => !NO_PLAY.has(p.status) && p.proj > 0);

/** All singles, every pair from the top `pool`, and every triple from the top `tpool`, by value. */
function packages(players, pool = PACKAGE_POOL, tpool = TRIPLE_POOL) {
  const out = players.map((p) => [p]);
  const top = players.slice().sort((a, b) => b.proj - a.proj).slice(0, pool);
  for (let i = 0; i < top.length; i++) for (let j = i + 1; j < top.length; j++) out.push([top[i], top[j]]);
  const t3 = top.slice(0, tpool);
  for (let i = 0; i < t3.length; i++) for (let j = i + 1; j < t3.length; j++) for (let k = j + 1; k < t3.length; k++) out.push([t3[i], t3[j], t3[k]]);
  return out;
}

/** Where each player starts after a trade, for the pitch. */
function slotOf(assignment, name) {
  for (const [slot, ps] of Object.entries(assignment)) if (ps.some((p) => p.name === name)) return slot;
  return null;
}

/**
 * @param mine     my roster as rosterPlayer()s (proj = rest-of-season weekly value)
 * @param others   { teamName: players[] } or { teamName: { id, players } }
 */
export function proposeTrades(mine, others, slotCounts, opts = {}) {
  const minMyGain = opts.minMyGain ?? MIN_MY_GAIN, maxTheirLoss = opts.maxTheirLoss ?? MAX_THEIR_LOSS, maxAsk = opts.maxValueAsk ?? MAX_VALUE_ASK;
  const perTeam = opts.perTeam ?? PER_TEAM, perLeague = opts.perLeague ?? PER_LEAGUE;
  const myBase = optimize(mine, slotCounts), baseMine = projectedTotal(myBase);
  const myPackages = packages(tradeable(mine));
  const ideas = [];
  for (const [teamName, entry] of Object.entries(others)) {
    const theirs = Array.isArray(entry) ? entry : entry.players;
    const theirId = Array.isArray(entry) ? null : entry.id;
    const theirLogo = Array.isArray(entry) ? "" : entry.logo || "";
    const theirBase = optimize(theirs, slotCounts), baseTheirs = projectedTotal(theirBase);
    const theirPackages = packages(tradeable(theirs));
    const teamIdeas = [];
    const gainOf = new Map(); // "giveNames>getNames" -> my_gain, for the package-vs-sub-trade check
    const key = (give, get) => `${give.map((p) => p.name).sort().join("|")}>${get.map((p) => p.name).sort().join("|")}`;
    for (const give of myPackages) {
      const giveSum = sum(give), giveBest = Math.max(...give.map((p) => p.proj));
      for (const get of theirPackages) {
        if (!fair(give, get, giveSum, giveBest, maxAsk)) continue;
        const newMine = mine.filter((p) => !give.includes(p)).concat(get);
        const newTheirs = theirs.filter((p) => !get.includes(p)).concat(give);
        const myAfter = optimize(newMine, slotCounts), theirAfter = optimize(newTheirs, slotCounts);
        // A deal that leaves either side unable to fill a starting slot is not a real offer.
        if (filled(myAfter) < filled(myBase) || filled(theirAfter) < filled(theirBase)) continue;
        const myGain = r1(projectedTotal(myAfter) - baseMine), theirGain = r1(projectedTotal(theirAfter) - baseTheirs);
        if (myGain < minMyGain || theirGain < -maxTheirLoss) continue;
        gainOf.set(key(give, get), myGain);
        const pj = (p) => ({ name: p.name, pos: p.position, value: p.weekly ?? p.proj, season_value: p.proj, avail: p.avail ?? 1, byes: p.byes || [], player_id: p.playerId, team: p.proTeam });
        teamIdeas.push({
          id: tradeId(theirId ?? teamName, give, get), with: teamName, with_team_id: theirId, with_logo: theirLogo, kind: `${give.length}-for-${get.length}`,
          give: give.map(pj), get: get.map(pj), my_gain: myGain, their_gain: theirGain,
          weeks_left: opts.weeksLeft || null, season_gain: opts.weeksLeft ? r1(myGain * opts.weeksLeft) : null,
          // Legacy scalar fields, kept for the Flask templates and older callers.
          give_names: give.map((p) => p.name).join(" + "), get_names: get.map((p) => p.name).join(" + "),
          give_pos: give.map((p) => p.position).join("/"), get_pos: get.map((p) => p.position).join("/"),
          give_value: r1(giveSum), get_value: r1(sum(get)),
          pitch: pitch({ give, get, myGain, theirGain, teamName, myBase, myAfter, theirBase, theirAfter, weeksLeft: opts.weeksLeft, horizon: opts.horizonNote }),
        });
      }
    }
    // A package only earns its place if no simpler trade inside it does nearly as well.
    const simpler = (t) => {
      if (t.give.length + t.get.length <= 2) return false;
      for (const g of subsets(t.give)) for (const r of subsets(t.get)) {
        if (g.length + r.length >= t.give.length + t.get.length) continue;
        const k = `${g.map((p) => p.name).sort().join("|")}>${r.map((p) => p.name).sort().join("|")}`;
        if (gainOf.has(k) && gainOf.get(k) >= t.my_gain - PACKAGE_MARGIN) return true;
      }
      return false;
    };
    const kept = teamIdeas.filter((t) => !simpler(t));
    // Best first; never the same outgoing package twice for one team, so the list reads as distinct options.
    kept.sort((x, y) => (y.my_gain - x.my_gain) || (y.their_gain - x.their_gain) || (x.give.length + x.get.length) - (y.give.length + y.get.length));
    const seen = new Set();
    for (const t of kept) {
      if (seen.has(t.give_names)) continue;
      seen.add(t.give_names); ideas.push(t);
      if (seen.size >= perTeam) break;
    }
  }
  ideas.sort((x, y) => (y.my_gain - x.my_gain) || (y.their_gain - x.their_gain));
  return ideas.slice(0, perLeague);
}

/** Score any package by the same lineup math as the board: what each side's best lineup gains per week. */
export function evaluateTrade(mine, theirs, giveIds, getIds, slotCounts) {
  const give = mine.filter((p) => giveIds.includes(p.playerId)), get = theirs.filter((p) => getIds.includes(p.playerId));
  if (give.length !== giveIds.length || get.length !== getIds.length) return null;
  const myBase = optimize(mine, slotCounts), theirBase = optimize(theirs, slotCounts);
  const myAfter = optimize(mine.filter((p) => !give.includes(p)).concat(get), slotCounts);
  const theirAfter = optimize(theirs.filter((p) => !get.includes(p)).concat(give), slotCounts);
  const pj = (p) => ({ name: p.name, pos: p.position, value: p.weekly ?? p.proj, player_id: p.playerId, team: p.proTeam });
  return { give: give.map(pj), get: get.map(pj), my_gain: r1(projectedTotal(myAfter) - projectedTotal(myBase)), their_gain: r1(projectedTotal(theirAfter) - projectedTotal(theirBase)),
    give_names: give.map((p) => p.name).join(" + "), get_names: get.map((p) => p.name).join(" + "), kind: `${give.length}-for-${get.length}` };
}

/**
 * The best set of offers that can all be out at once: best gain first, never the same outgoing player in two offers,
 * at most one offer per manager, and never a player ESPN already has in a pending offer (pass their ids in `busy`).
 */
export function blitzSet(trades, { busy = new Set(), max = 6 } = {}) {
  const used = new Set(busy), partners = new Set(), out = [];
  for (const t of trades.slice().sort((a, b) => b.my_gain - a.my_gain)) {
    if (t.with_team_id == null || partners.has(t.with_team_id)) continue;
    if (t.give.some((p) => used.has(p.player_id)) || t.get.some((p) => used.has(p.player_id))) continue;
    out.push(t); partners.add(t.with_team_id);
    for (const p of [...t.give, ...t.get]) used.add(p.player_id);
    if (out.length >= max) break;
  }
  return out;
}

/**
 * Value fairness, by shape. maxAsk is how much more total value you may ask for than you give.
 * - Even swaps: total asked <= total given * maxAsk, and the best player you get <= the best you give * maxAsk.
 * - You consolidate (give more players, get fewer): you may receive the best player in the deal, but total asked
 *   still <= total given * maxAsk, so you overpay in depth to get the star.
 * - They consolidate (you give fewer, get more): they get the best player, and in return you may take up to
 *   CONSOLIDATION_PREMIUM times the value you give.
 */
function fair(give, get, giveSum, giveBest, maxAsk) {
  const getSum = sum(get), getBest = Math.max(...get.map((p) => p.proj));
  if (give.length === get.length) return getSum <= giveSum * maxAsk && getBest <= giveBest * maxAsk;
  if (give.length > get.length) return getSum <= giveSum * maxAsk;
  return getBest <= giveBest && getSum <= giveSum * CONSOLIDATION_PREMIUM;
}

/** Every non-empty subset of a package (packages are at most three players). */
function subsets(ps) {
  const out = [];
  for (let m = 1; m < (1 << ps.length); m++) out.push(ps.filter((_, i) => m & (1 << i)));
  return out;
}

const list = (names) => names.length <= 1 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;

/** The analyst's case for a trade, built from where the players actually land in each lineup. */
export function pitch({ give, get, myGain, theirGain, teamName, myBase, myAfter, theirBase, theirAfter, weeksLeft = null, horizon = "" }) {
  const f1 = (x) => x.toFixed(1);
  const names = (ps) => ps.map((p) => `${p.name} (${p.position})`).join(" and ");
  const sentences = [];
  // What I get and where it plays.
  const bySlot = {};
  for (const p of get) { const s = slotOf(myAfter, p.name); if (s) (bySlot[s] ||= []).push(p.name); }
  const slots = Object.entries(bySlot);
  if (slots.length) {
    const displaced = Object.values(myBase).flat().filter((p) => !slotOf(myAfter, p.name) && !give.includes(p));
    const over = displaced.length ? ` over ${list(displaced.map((p) => p.name))}` : "";
    sentences.push(`${slots.map(([s, ns]) => `${list(ns)} start${ns.length === 1 ? "s" : ""} at ${s} for you`).join(" and ")}${over}.`);
  } else {
    sentences.push(`${names(get)} ${get.length > 1 ? "deepen" : "deepens"} your bench without a starting role yet; the gain comes from the bye weeks and injuries ahead.`);
  }
  // What it costs me.
  const myStartersLost = give.filter((p) => slotOf(myBase, p.name));
  sentences.push(myStartersLost.length
    ? `You give up ${names(give)}; ${myStartersLost.length === 1 ? "that spot is" : "those spots are"} covered by what comes back.`
    : `${names(give)} ${give.length > 1 ? "were" : "was"} sitting on your bench anyway.`);
  // Why they say yes.
  const theirStarts = give.filter((p) => slotOf(theirAfter, p.name));
  let why;
  if (theirGain > 0) why = `${theirStarts.length ? `${list(theirStarts.map((p) => p.name))} start${theirStarts.length === 1 ? "s" : ""} for ${teamName} right away and the` : "The"} lineup on their side improves by ${f1(theirGain)} a week, so this sells itself`;
  else if (theirGain === 0) why = `${teamName} loses nothing on paper, so it costs them nothing to say yes`;
  else why = `${teamName} gives up only ${f1(Math.abs(theirGain))} a week`;
  if (give.length > get.length) why += `; they will need to clear a roster spot to accept`;
  else if (get.length > give.length) why += `; you will need to clear a roster spot when it goes through`;
  sentences.push(`${why}.`);
  sentences.push(weeksLeft ? `Net for you: about ${f1(myGain)} points a week, roughly ${f1(myGain * weeksLeft)} over the ${weeksLeft} weeks left${horizon ? `, ${horizon}` : ""}.`
    : `Net for you: about ${f1(myGain)} points a week for the rest of the season.`);
  return sentences.join(" ");
}
