// Trade proposals. Pure. Mirrors advisor/trades.py.
import { NO_PLAY, makePlayer, optimize, projectedTotal } from "./optimizer.js";

export const MIN_MY_GAIN = 1.0, MAX_THEIR_LOSS = 0.5, MAX_VALUE_ASK = 1.15, PER_TEAM = 2, PER_LEAGUE = 8;

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

export function proposeTrades(mine, others, slotCounts, opts = {}) {
  const minMyGain = opts.minMyGain ?? MIN_MY_GAIN, maxTheirLoss = opts.maxTheirLoss ?? MAX_THEIR_LOSS, maxAsk = opts.maxValueAsk ?? MAX_VALUE_ASK;
  const baseMine = lineupValue(mine, slotCounts);
  const ideas = [];
  const r1 = (x) => Math.round(x * 10) / 10;
  for (const [teamName, theirs] of Object.entries(others)) {
    const baseTheirs = lineupValue(theirs, slotCounts);
    const teamIdeas = [];
    for (const a of mine) {
      if (NO_PLAY.has(a.status)) continue;
      for (const b of theirs) {
        if (NO_PLAY.has(b.status)) continue;
        if (b.proj > a.proj * maxAsk) continue;
        const newMine = mine.filter((p) => p !== a).concat([b]);
        const newTheirs = theirs.filter((p) => p !== b).concat([a]);
        const myGain = r1(lineupValue(newMine, slotCounts) - baseMine);
        const theirGain = r1(lineupValue(newTheirs, slotCounts) - baseTheirs);
        if (myGain >= minMyGain && theirGain >= -maxTheirLoss) {
          teamIdeas.push({ with: teamName, give: a.name, give_pos: a.position, give_value: a.proj,
            get: b.name, get_pos: b.position, get_value: b.proj, my_gain: myGain, their_gain: theirGain,
            pitch: pitch(a, b, myGain, theirGain) });
        }
      }
    }
    teamIdeas.sort((x, y) => (y.my_gain - x.my_gain) || (y.their_gain - x.their_gain));
    ideas.push(...teamIdeas.slice(0, PER_TEAM));
  }
  ideas.sort((x, y) => (y.my_gain - x.my_gain) || (y.their_gain - x.their_gain));
  return ideas.slice(0, PER_LEAGUE);
}

function pitch(a, b, myGain, theirGain) {
  let why;
  if (theirGain > 0) why = `it also lifts their starting lineup by ${theirGain.toFixed(1)} a week, so it is an easy sell`;
  else if (theirGain === 0) why = "their starting lineup stays the same, so it costs them nothing on paper";
  else why = `it costs their lineup only ${Math.abs(theirGain).toFixed(1)} a week`;
  return `Offer ${a.name} (${a.position}) for ${b.name} (${b.position}). Your best lineup gains about ${myGain.toFixed(1)} points a week; ${why}.`;
}
