// Pure lineup logic. No network. Mirrors advisor/optimizer.py.

export const BENCH_SLOTS = new Set(["BE", "IR"]);
export const NO_PLAY = new Set(["OUT", "INJURY_RESERVE", "SUSPENSION", "IR"]);
export const SHAKY = new Set(["QUESTIONABLE", "DOUBTFUL", "DAY_TO_DAY"]);
const SLOT_ORDER = ["QB", "K", "D/ST", "TE", "RB", "WR", "P", "HC", "DT", "DE", "LB", "DL", "CB", "S", "DB", "DP",
  "WR/TE", "RB/WR", "RB/WR/TE", "OP", "TQB"];

export function makePlayer(p) {
  return {
    name: p.name, position: p.position, eligible: p.eligible || [], slot: p.slot || "BE",
    proj: Number(p.proj || 0), status: p.status || "ACTIVE", bye: !!p.bye, locked: !!p.locked,
    proTeam: p.proTeam || "", opponent: p.opponent || "", oppRank: p.oppRank || 0,
    recentAvg: p.recentAvg ?? null, percentOwned: p.percentOwned ?? null, playerId: p.playerId ?? null,
    seasonProjAvg: Number(p.seasonProjAvg || 0), seasonAvg: Number(p.seasonAvg || 0), acquisition: p.acquisition || "",
    history: Array.isArray(p.history) ? p.history : [], proTeamId: p.proTeamId || 0, ctx: p.ctx || null,
  };
}

export const isStarting = (p) => !BENCH_SLOTS.has(p.slot);
export const canPlay = (p) => !p.bye && !NO_PLAY.has(p.status);
export function effectiveProj(p) {
  if (!canPlay(p)) return 0;
  if (p.status === "DOUBTFUL") return Math.round(p.proj * 0.25 * 100) / 100;
  return p.proj;
}

export function slotCountsFromLineup(players) {
  const counts = {};
  for (const p of players) if (isStarting(p)) counts[p.slot] = (counts[p.slot] || 0) + 1;
  return counts;
}

const slotRank = (s) => { const i = SLOT_ORDER.indexOf(s); return i < 0 ? SLOT_ORDER.length : i; };

export function optimize(players, slotCounts) {
  const assignment = {}; const remaining = {};
  for (const s of Object.keys(slotCounts)) { assignment[s] = []; remaining[s] = slotCounts[s]; }
  let pool = [];
  for (const p of players) {
    if (p.locked && isStarting(p) && remaining[p.slot] > 0) { assignment[p.slot].push(p); remaining[p.slot] -= 1; }
    else if (p.locked) continue;
    else pool.push(p);
  }
  for (const slot of Object.keys(remaining).sort((a, b) => slotRank(a) - slotRank(b))) {
    while (remaining[slot] > 0) {
      const cands = pool.filter((p) => p.eligible.includes(slot) && canPlay(p));
      if (!cands.length) break;
      let best = cands[0];
      for (const c of cands) {
        const [ce, be] = [effectiveProj(c), effectiveProj(best)];
        if (ce > be || (ce === be && c.proj > best.proj)) best = c;
      }
      assignment[slot].push(best); pool = pool.filter((p) => p !== best); remaining[slot] -= 1;
    }
  }
  return assignment;
}

export function diffLineup(players, assignment) {
  const rec = {}; for (const [slot, ps] of Object.entries(assignment)) for (const p of ps) rec[p.name] = slot;
  const cur = {}; for (const p of players) if (isStarting(p)) cur[p.name] = p.slot;
  const moves = [];
  const start = players.filter((p) => p.name in rec && !(p.name in cur)).sort((a, b) => effectiveProj(b) - effectiveProj(a));
  const sit = players.filter((p) => p.name in cur && !(p.name in rec)).sort((a, b) => b.proj - a.proj);
  const shift = players.filter((p) => p.name in rec && p.name in cur && rec[p.name] !== cur[p.name]);
  for (const p of start) moves.push(`START ${p.name} (${p.position}, ${effectiveProj(p).toFixed(1)} proj) at ${rec[p.name]}`);
  for (const p of sit) moves.push(`SIT   ${p.name} (${p.position}, ${p.proj.toFixed(1)} proj)${whyBenched(p)}`);
  for (const p of shift) moves.push(`MOVE  ${p.name} from ${cur[p.name]} to ${rec[p.name]}`);
  return moves;
}

function whyBenched(p) {
  if (p.bye) return " - on bye";
  if (NO_PLAY.has(p.status)) return ` - ${p.status.replace(/_/g, " ").toLowerCase()}`;
  if (p.status === "DOUBTFUL") return " - doubtful";
  return "";
}

export function warningsFor(players, assignment, slotCounts) {
  const out = [];
  for (const [slot, n] of Object.entries(slotCounts)) {
    const filled = (assignment[slot] || []).length;
    if (filled < n) out.push(`No eligible player for ${slot} (${filled}/${n} filled). Look at waivers.`);
  }
  for (const [slot, ps] of Object.entries(assignment)) for (const p of ps) {
    if (p.bye) out.push(`${p.name} is starting at ${slot} but is on BYE.`);
    else if (NO_PLAY.has(p.status)) out.push(`${p.name} is starting at ${slot} but is ${p.status.replace(/_/g, " ").toLowerCase()}.`);
    else if (SHAKY.has(p.status)) out.push(`${p.name} (${slot}) is ${p.status.toLowerCase()}. Check status before kickoff.`);
  }
  return out;
}

/** Sample standard deviation of a player's weekly points; null with fewer than three games. */
export function volatility(p) {
  const h = (p.history || []).filter((x) => typeof x === "number");
  if (h.length < 3) return null;
  const m = h.reduce((a, b) => a + b, 0) / h.length;
  return Math.round(Math.sqrt(h.reduce((a, b) => a + (b - m) ** 2, 0) / (h.length - 1)) * 10) / 10;
}
/** The lineup that maximises upside: projection plus a share of each player's volatility. Used when you are the underdog. */
export function optimizeCeiling(players, slotCounts, k = 0.6) {
  const boosted = players.map((p) => { const sd = volatility(p); return sd == null || !canPlay(p) ? p : { ...p, proj: Math.round((p.proj + k * sd) * 10) / 10 }; });
  const a = optimize(boosted, slotCounts);
  // Map back to the original player objects so callers compare by identity/name.
  const byName = Object.fromEntries(players.map((p) => [p.name, p]));
  return Object.fromEntries(Object.entries(a).map(([s, ps]) => [s, ps.map((p) => byName[p.name])]));
}

export function projectedTotal(assignment) {
  let t = 0; for (const ps of Object.values(assignment)) for (const p of ps) t += effectiveProj(p);
  return Math.round(t * 10) / 10;
}
