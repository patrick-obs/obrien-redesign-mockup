// Builds the per-league report dict from parsed ESPN data. Mirrors advisor/espn.py build_report.
import { makePlayer, isStarting, effectiveProj, canPlay, optimize, diffLineup, warningsFor, projectedTotal, slotCountsFromLineup, NO_PLAY, SHAKY, BENCH_SLOTS } from "./optimizer.js";
import { SLOT_IDS, FLEX_SLOTS, record, avgPf, standings, gamesPlayed } from "./espn.js";
import { playerValue } from "./trades.js";

export const SLOT_DISPLAY_ORDER = ["QB", "RB", "WR", "TE", "RB/WR/TE", "RB/WR", "WR/TE", "OP", "D/ST", "K"];
const TROUBLE = new Set([...NO_PLAY, ...SHAKY]);

export const toPlayer = (bp) => makePlayer(bp);

export function startingSlotCounts(league, players) {
  const counts = {};
  for (const [k, v] of Object.entries(league.slotCounts || {})) if (v && !BENCH_SLOTS.has(k)) counts[k] = v;
  return Object.keys(counts).length ? counts : slotCountsFromLineup(players);
}

export const slotOrderFor = (slotCounts) =>
  SLOT_DISPLAY_ORDER.filter((s) => s in slotCounts).concat(Object.keys(slotCounts).filter((s) => !SLOT_DISPLAY_ORDER.includes(s)));

export function fmtStatus(p) {
  const bits = [];
  if (p.bye) bits.push("BYE");
  if (p.status !== "ACTIVE") bits.push(p.status.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()));
  if (p.locked) bits.push("locked");
  return bits.join(", ");
}

export function lineupProblems(players, slotCounts) {
  const probs = players.filter((p) => isStarting(p) && (p.bye || TROUBLE.has(p.status))).map((p) => `${p.name} ${fmtStatus(p)}`);
  const empty = Object.values(slotCounts).reduce((a, b) => a + b, 0) - players.filter(isStarting).length;
  if (empty > 0) probs.push(`${empty} empty slot${empty > 1 ? "s" : ""}`);
  return probs;
}

export const rosterInjuries = (players) =>
  players.filter((p) => TROUBLE.has(p.status)).map((p) => `${p.name} (${p.position}) ${p.status.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}`);

export function playerJson(p) {
  return { name: p.name, pos: p.position, team: p.proTeam, opp: p.opponent && p.opponent !== "None" ? p.opponent : "bye",
    opp_rank: p.oppRank, proj: p.proj, effective_proj: effectiveProj(p), status: p.status, bye: p.bye, locked: p.locked,
    recent_avg: p.recentAvg, slot: p.slot, notes: fmtStatus(p), player_id: p.playerId };
}

/** Positions worth scanning on waivers, with the projection a free agent must beat. */
export function waiverThresholds(assignment, slotCounts) {
  const t = {};
  for (const ps of Object.values(assignment)) for (const p of ps) t[p.position] = Math.min(t[p.position] ?? 1e9, effectiveProj(p));
  for (const [slot, n] of Object.entries(slotCounts)) if ((assignment[slot] || []).length < n && !FLEX_SLOTS.has(slot)) t[slot] = 0;
  const out = {};
  for (const pos of ["QB", "RB", "WR", "TE", "D/ST", "K"]) if (pos in t) out[pos] = t[pos];
  return out;
}

export function waiverWatch(thresholds, mine, faByPos) {
  const out = {};
  const names = new Set(mine.map((p) => p.name));
  for (const [pos, thr] of Object.entries(thresholds)) {
    const fas = faByPos[pos];
    if (!fas) continue;
    if (fas.error) { out[pos] = [{ error: fas.error }]; continue; }
    const picks = [];
    for (const raw of fas) {
      const p = makePlayer(raw);
      if (names.has(p.name) || !canPlay(p)) continue;
      const edge = Math.round((effectiveProj(p) - thr) * 10) / 10;
      if (edge > 0) picks.push({ name: p.name, pos: p.position, team: p.proTeam, opp: p.opponent, proj: p.proj, edge, owned: p.percentOwned, status: p.status,
        fills_empty_slot: thr === 0, player_id: p.playerId, on_waivers: p.acquisition === "WAIVERS",
        value: playerValue(p.seasonProjAvg, p.seasonAvg, 8) });
    }
    picks.sort((a, b) => b.edge - a.edge);
    if (picks.length) out[pos] = picks.slice(0, 3);
  }
  return out;
}

/**
 * Who to drop to make room for an add: cheapest rest-of-season value first, never IR, never a locked player.
 * Recommended starters are listed last and flagged, so the default pick is always a bench player.
 */
export function dropCandidates(players, assignment, games) {
  const starters = new Set(Object.values(assignment).flat().map((p) => p.name));
  return players
    .filter((p) => p.slot !== "IR" && !p.locked && p.playerId != null)
    .map((p) => ({ player_id: p.playerId, name: p.name, pos: p.position, team: p.proTeam, slot: p.slot, starter: starters.has(p.name),
      value: playerValue(p.seasonProjAvg, p.seasonAvg, games), notes: fmtStatus(p),
      reason: !canPlay(p) ? (p.bye ? "on bye this week" : p.status.replace(/_/g, " ").toLowerCase()) : starters.has(p.name) ? "recommended starter" : "lowest rest-of-season value on your bench" }))
    .sort((a, b) => (a.starter - b.starter) || (a.value - b.value));
}

/** Slot moves that turn the current lineup into the recommended one. Never locked players, never IR, never add/drop. */
export function planLineupItems(players, assignment) {
  const target = {}; for (const [slot, ps] of Object.entries(assignment)) for (const p of ps) target[p.name] = slot;
  const items = [];
  for (const p of players) {
    if (p.locked || p.slot === "IR" || p.playerId == null) continue;
    const to = target[p.name] || "BE";
    if (to === p.slot || !(to in SLOT_IDS) || !(p.slot in SLOT_IDS)) continue;
    items.push({ playerId: p.playerId, name: p.name, from: p.slot, to, fromLineupSlotId: SLOT_IDS[p.slot], toLineupSlotId: SLOT_IDS[to] });
  }
  return items;
}

/**
 * @param league parsed league (espn.parseLeague)
 * @param me team object
 * @param boxes output of espn.boxScores for `week`
 * @param faByPos {pos: [players]} for the positions from waiverThresholds (or null to skip)
 */
export function buildReport(league, me, boxes, week, now, faByPos = null) {
  const box = boxes.find((b) => [b.home?.teamId, b.away?.teamId].includes(me.id));
  if (!box) throw new Error(`No matchup found for ${me.name} in week ${week} (bye week or playoffs?).`);
  const home = box.home?.teamId === me.id;
  const mySide = home ? box.home : box.away, oppSide = home ? box.away : box.home;
  const mine = mySide.lineup.map(toPlayer), theirs = (oppSide?.lineup || []).map(toPlayer);
  const slotCounts = startingSlotCounts(league, mine);
  const order = slotOrderFor(slotCounts);
  const rec = optimize(mine, slotCounts);
  const current = {}; for (const s of Object.keys(slotCounts)) current[s] = mine.filter((p) => p.slot === s);
  const recNames = new Set(Object.values(rec).flat().map((p) => p.name));
  const bench = mine.filter((p) => !recNames.has(p.name)).sort((a, b) => b.proj - a.proj);
  const oppRec = optimize(theirs, slotCounts);
  const opp = oppSide?.team;
  const thresholds = waiverThresholds(rec, slotCounts);

  const rep = {
    league_id: league.id, league: league.name, season: league.season, week, current_week: league.currentWeek,
    generated_at: new Date(now).toISOString().slice(0, 16).replace("T", " "),
    team_id: me.id, team: me.name, record: record(me),
    opponent: opp ? opp.name : "bye", opponent_record: opp ? record(opp) : "",
    espn_projection: { me: mySide.projected, opponent: oppSide ? oppSide.projected : -1 },
    current_lineup_proj: projectedTotal(current), recommended_lineup_proj: projectedTotal(rec),
    slot_counts: slotCounts, slot_order: order,
    recommended: Object.fromEntries(order.map((s) => [s, (rec[s] || []).map(playerJson)])),
    bench: bench.map(playerJson), moves: diffLineup(mine, rec), warnings: warningsFor(mine, rec, slotCounts),
    lineup_items: planLineupItems(mine, rec),
    opponent_lineup: Object.fromEntries(order.map((s) => [s, (oppRec[s] || []).map(playerJson)])),
    opponent_best_proj: projectedTotal(oppRec), opponent_issues: lineupProblems(theirs, slotCounts),
    waiver_thresholds: thresholds, waivers: faByPos ? waiverWatch(thresholds, mine, faByPos) : {},
    drop_candidates: dropCandidates(mine, rec, gamesPlayed(me)),
    roster_size: league.rosterSize || 0, roster_count: mine.filter((p) => p.slot !== "IR").length,
    acquisition: league.acquisition || { type: "", usesBudget: false, budget: 0 },
    budget_left: league.acquisition?.usesBudget ? Math.max(0, (league.acquisition.budget || 0) - (me.budgetSpent || 0)) : null,
  };
  rep.open_spots = rep.roster_size ? Math.max(0, rep.roster_size - rep.roster_count) : 0;
  const st = standings(league);
  rep.standings = st.map((t, i) => ({ rank: i + 1, team: t.name, team_id: t.id, record: record(t), pf: Math.round(t.pointsFor * 10) / 10,
    pa: Math.round(t.pointsAgainst * 10) / 10, avg_pf: avgPf(t) }));

  // league-wide
  const rosterByTeam = {};
  rep.matchups = boxes.map((b) => {
    const sides = [];
    for (const side of [b.home, b.away]) {
      if (!side || !side.team) continue;
      const ps = side.lineup.map(toPlayer);
      rosterByTeam[side.teamId] = ps;
      sides.push({ team: side.team.name, team_id: side.teamId, record: record(side.team), espn_proj: side.projected,
        best_lineup_proj: projectedTotal(optimize(ps, slotCounts)), problems: lineupProblems(ps, slotCounts) });
    }
    return sides;
  });
  rep.injury_report = st.map((t) => ({ team: t.name, team_id: t.id, injuries: rosterInjuries(rosterByTeam[t.id] || []) }));

  const reg = league.regSeasonCount || me.schedule.length;
  const past = [], future = [];
  me.schedule.slice(0, reg).forEach((oppId, i) => {
    const wk = i + 1, o = league.byId[oppId];
    if (!o) return;
    const entry = { week: wk, opponent: o.name, record: record(o), avg_pf: avgPf(o) };
    const decided = ["W", "L", "T"].includes(me.outcomes[i]);
    if (wk < league.currentWeek || (wk === league.currentWeek && decided)) {
      past.push({ ...entry, result: me.outcomes[i] || "?", score: me.scores[i] ?? null, opp_score: o.scores[i] ?? null });
    } else if (wk > league.currentWeek) {
      future.push({ ...entry, injuries: rosterInjuries(rosterByTeam[o.id] || []) });
    }
  });
  rep.results = past; rep.schedule = future;
  return rep;
}
