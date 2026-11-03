// ESPN fantasy API client for Workers: plain fetch, plain objects. Mirrors advisor/espn.py
// and the parts of the espn_api Python library the app relied on.

export const READ = "https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/";
export const WRITE = "https://lm-api-writes.fantasy.espn.com/apis/v3/games/ffl/seasons/";
export const FAN_API = "https://fan.api.espn.com/apis/v2/fans/";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) fantasy-advisor";

export const SLOT_LABEL = { 0: "QB", 1: "TQB", 2: "RB", 3: "RB/WR", 4: "WR", 5: "WR/TE", 6: "TE", 7: "OP", 8: "DT", 9: "DE",
  10: "LB", 11: "DL", 12: "CB", 13: "S", 14: "DB", 15: "DP", 16: "D/ST", 17: "K", 18: "P", 19: "HC", 20: "BE", 21: "IR",
  22: "", 23: "RB/WR/TE", 24: "ER", 25: "Rookie" };
export const SLOT_IDS = Object.fromEntries(Object.entries(SLOT_LABEL).filter(([, v]) => v).map(([k, v]) => [v, Number(k)]));
export const PRO_TEAM = { 0: "None", 1: "ATL", 2: "BUF", 3: "CHI", 4: "CIN", 5: "CLE", 6: "DAL", 7: "DEN", 8: "DET", 9: "GB", 10: "TEN",
  11: "IND", 12: "KC", 13: "LV", 14: "LAR", 15: "MIA", 16: "MIN", 17: "NE", 18: "NO", 19: "NYG", 20: "NYJ", 21: "PHI", 22: "ARI",
  23: "PIT", 24: "LAC", 25: "SF", 26: "SEA", 27: "TB", 28: "WSH", 29: "CAR", 30: "JAX", 33: "BAL", 34: "HOU" };
const DEFAULT_POS = { 1: "QB", 2: "RB", 3: "WR", 4: "TE", 5: "K", 16: "D/ST", 7: "P", 9: "DT", 10: "DE", 11: "LB", 12: "CB", 13: "S" };
export const FLEX_SLOTS = new Set(["RB/WR/TE", "RB/WR", "WR/TE", "OP", "TQB"]);

export class EspnError extends Error {}

export function currentSeason(now = new Date()) {
  return now.getMonth() + 1 >= 8 ? now.getFullYear() : now.getFullYear() - 1;
}

export function normStatus(s) {
  s = (s || "ACTIVE").toUpperCase();
  return s === "NORMAL" || s === "" ? "ACTIVE" : s;
}

function cookieHeader(c) { return `espn_s2=${c.espn_s2}; SWID=${c.swid}`; }

async function getJson(fetchFn, url, cookies, extraHeaders = {}) {
  const r = await fetchFn(url, { headers: { Cookie: cookieHeader(cookies), "User-Agent": UA, Accept: "application/json", ...extraHeaders } });
  if (r.status === 401) throw new EspnError("ESPN refused the request (401). The ESPN cookies are wrong or expired; update them under Settings.");
  if (r.status === 404) throw new EspnError("ESPN says that league does not exist (404).");
  if (r.status !== 200) throw new EspnError(`ESPN returned HTTP ${r.status}.`);
  const data = await r.json();
  return Array.isArray(data) ? data[0] : data;
}

const leagueUrl = (season, id) => `${READ}${season}/segments/0/leagues/${id}`;

// ------------------------------------------------------------------ discovery

export async function discoverLeagues(fetchFn, cookies, season) {
  if (!cookies.swid) throw new EspnError("SWID is required to discover leagues.");
  const sid = "%7B" + cookies.swid.replace(/[{}]/g, "") + "%7D";
  const r = await fetchFn(`${FAN_API}${sid}?displayEvents=false&source=espncom-fantasy-main`,
    { headers: { Cookie: cookieHeader(cookies), "User-Agent": UA } });
  if (r.status !== 200) throw new EspnError(`ESPN fan API returned ${r.status}. Check SWID and ESPN_S2.`);
  const d = await r.json();
  const out = [];
  for (const pref of d.preferences || []) {
    const entry = pref.metaData?.entry;
    if (!entry || String(entry.gameId) !== "1" || Number(entry.seasonId) !== season) continue;
    for (const g of entry.groups || []) {
      out.push({ league_id: Number(g.groupId), league_name: g.groupName || "", team_id: Number(entry.entryId),
        team_name: entry.entryMetadata?.teamName || "", season });
    }
  }
  return out;
}

// ------------------------------------------------------------------ league core

export async function loadLeague(fetchFn, cookies, season, id) {
  const d = await getJson(fetchFn, `${leagueUrl(season, id)}?view=mTeam&view=mSettings&view=mStandings&view=mMatchupScore`, cookies);
  return parseLeague(d, season, id);
}

export function parseLeague(d, season, id) {
  const st = d.status || {};
  const scoring = d.scoringPeriodId || 0;
  const currentWeek = Math.min(scoring, st.finalScoringPeriod || scoring);
  const s = d.settings || {};
  const slotCounts = {};
  for (const [k, v] of Object.entries(s.rosterSettings?.lineupSlotCounts || {})) if (v) slotCounts[SLOT_LABEL[k]] = v;
  const matchupPeriods = s.scheduleSettings?.matchupPeriods || {};
  const acq = s.acquisitionSettings || {};
  // Everything except IR counts toward the roster limit.
  const rosterSize = Object.entries(s.rosterSettings?.lineupSlotCounts || {}).reduce((n, [k, v]) => n + (Number(k) === 21 ? 0 : v), 0);
  const members = Object.fromEntries((d.members || []).map((m) => [m.id, m]));
  const teams = (d.teams || []).map((t) => ({
    id: t.id, abbrev: t.abbrev, name: t.name || `${t.location || ""} ${t.nickname || ""}`.trim() || `Team ${t.id}`,
    wins: t.record?.overall?.wins || 0, losses: t.record?.overall?.losses || 0, ties: t.record?.overall?.ties || 0,
    pointsFor: t.record?.overall?.pointsFor || 0, pointsAgainst: Math.round((t.record?.overall?.pointsAgainst || 0) * 100) / 100,
    standing: t.playoffSeed || 0, finalStanding: t.rankFinal || t.rankCalculatedFinal || 0,
    owners: (t.owners || []).map((o) => (typeof o === "string" ? o : o?.id)).filter(Boolean),
    ownerNames: (t.owners || []).map((o) => members[typeof o === "string" ? o : o?.id]?.displayName).filter(Boolean),
    budgetSpent: t.transactionCounter?.acquisitionBudgetSpent || 0,
    logo: typeof t.logo === "string" && /^https?:\/\//.test(t.logo) ? t.logo : "",
    schedule: [], scores: [], outcomes: [],
  })).sort((a, b) => a.id - b.id);
  const byId = Object.fromEntries(teams.map((t) => [t.id, t]));
  // schedule by matchup period, in order
  const sched = (d.schedule || []).slice().sort((a, b) => (a.matchupPeriodId - b.matchupPeriodId) || (a.id - b.id));
  for (const m of sched) {
    const home = m.home || {}, away = m.away || {};
    for (const t of teams) {
      if (t.id !== home.teamId && t.id !== away.teamId) continue;
      const isAway = t.id === away.teamId;
      const mine = isAway ? away : home;
      let oppId = isAway ? home.teamId : away.teamId;
      if (oppId === undefined) oppId = t.id;
      const w = m.winner;
      const outcome = w === "UNDECIDED" ? "U" : w === "TIE" ? "T" : ((isAway && w === "AWAY") || (!isAway && w === "HOME")) ? "W" : "L";
      t.schedule.push(oppId); t.scores.push(mine.totalPoints ?? 0); t.outcomes.push(outcome);
    }
  }
  const drafted = !!(d.draftDetail?.drafted);
  const started = drafted && currentWeek > 0 && teams.length > 0;
  return {
    id, season, name: s.name || `League ${id}`, currentWeek, currentMatchupPeriod: st.currentMatchupPeriod || 0,
    finalScoringPeriod: st.finalScoringPeriod || 17, regSeasonCount: s.scheduleSettings?.matchupPeriodCount || 14,
    playoffTeamCount: s.scheduleSettings?.playoffTeamCount || 0, rosterSize,
    tradeDeadline: Number(s.tradeSettings?.deadlineDate) || null, // ms epoch; offers after this are refused by ESPN
    acquisition: { type: acq.acquisitionType || "", usesBudget: !!acq.isUsingAcquisitionBudget, budget: acq.acquisitionBudget || 0 },
    matchupPeriods, slotCounts, teams, byId, started, drafted,
  };
}

export const record = (t) => `${t.wins}-${t.losses}` + (t.ties ? `-${t.ties}` : "");
export const gamesPlayed = (t) => t.wins + t.losses + t.ties;
export const avgPf = (t) => { const g = gamesPlayed(t); return g ? Math.round((t.pointsFor / g) * 10) / 10 : 0; };

export function standings(league) {
  return league.teams.slice().sort((a, b) => (a.finalStanding || a.standing) - (b.finalStanding || b.standing));
}

export function findTeam(league, swid, teamId) {
  if (teamId) {
    const t = league.byId[teamId];
    if (t) return t;
    throw new EspnError(`Team ${teamId} not found. Teams: ` + league.teams.map((x) => `${x.id}=${x.name}`).join(", "));
  }
  const want = (swid || "").replace(/[{}]/g, "").toLowerCase();
  for (const t of league.teams) for (const o of t.owners) if (o.replace(/[{}]/g, "").toLowerCase() === want) return t;
  throw new EspnError("Could not match your SWID to a team. Teams: " + league.teams.map((x) => `${x.id}=${x.name}`).join(", "));
}

// ------------------------------------------------------------------ week data

export async function proSchedule(fetchFn, cookies, season) {
  const d = await getJson(fetchFn, `${READ}${season}?view=proTeamSchedules_wl`, cookies);
  const out = {};
  for (const t of d.settings?.proTeams || []) if (t.id !== 0) out[t.id] = t.proGamesByScoringPeriod || {};
  return out;
}

export function proScheduleForWeek(all, week) {
  const out = {};
  for (const [id, games] of Object.entries(all)) {
    const g = games[String(week)];
    if (g && g.length) {
      const game = g[0];
      const tid = Number(id);
      out[tid] = { opp: tid === game.awayProTeamId ? game.homeProTeamId : game.awayProTeamId, date: game.date };
    }
  }
  return out;
}

export async function positionalRatings(fetchFn, cookies, season, id, week) {
  const d = await getJson(fetchFn, `${leagueUrl(season, id)}?view=mPositionalRatings&scoringPeriodId=${week}`, cookies);
  const out = {};
  for (const [pos, r] of Object.entries(d.positionAgainstOpponent?.positionalRatings || {})) {
    out[pos] = {};
    for (const [team, x] of Object.entries(r.ratingsByOpponent || {})) out[pos][team] = x.rank;
  }
  return out;
}

export function playerPosition(p) {
  const pos = DEFAULT_POS[p.defaultPositionId];
  if (pos) return pos;
  for (const s of p.eligibleSlots || []) { const l = SLOT_LABEL[s]; if (l && s !== 25 && !l.includes("/")) return l; }
  return SLOT_LABEL[(p.eligibleSlots || [])[0]] || "";
}

/** One rostered or free-agent player for a given week. `data` is a roster entry or a kona player wrap. */
export function parseBoxPlayer(data, season, week, proSched, ratings, now) {
  const p = data.playerPoolEntry?.player || data.player || {};
  const slot = "lineupSlotId" in data ? SLOT_LABEL[data.lineupSlotId] : "FA";
  const stats = {};
  let weekTeam = 0;
  for (const s of p.stats || []) {
    if (s.seasonId !== season || s.statSplitTypeId === 2) continue;
    const sp = s.scoringPeriodId, src = s.statSourceId;
    const bucket = (stats[sp] ||= {});
    const pts = Math.round((s.appliedTotal || 0) * 100) / 100, avg = Math.round((s.appliedAverage || 0) * 100) / 100;
    if (src === 0) { bucket.points = pts; bucket.avg_points = avg; } else { bucket.projected_points = pts; bucket.projected_avg_points = avg; }
    if (sp === week && src === 0 && s.proTeamId) weekTeam = s.proTeamId;
  }
  const proTeamId = weekTeam || p.proTeamId || 0;
  const game = proSched[proTeamId];
  const position = playerPosition(p);
  let opponent = "", oppRank = 0, gameDate = null, onBye = false;
  if (game) {
    opponent = PRO_TEAM[game.opp] || "";
    gameDate = game.date;
    const r = ratings[String(p.defaultPositionId)];
    if (r) oppRank = r[String(game.opp)] || 0;
  } else onBye = true;
  const locked = gameDate !== null && now >= gameDate;
  return {
    name: p.fullName, playerId: p.id, position, eligible: (p.eligibleSlots || []).map((s) => SLOT_LABEL[s]).filter(Boolean),
    slot, proj: Number(stats[week]?.projected_points || 0), points: Number(stats[week]?.points || 0),
    status: normStatus(p.injuryStatus || data.injuryStatus), bye: onBye, locked,
    proTeam: PRO_TEAM[proTeamId] || "", opponent, oppRank, gameDate, recentAvg: recentAverage(stats, week),
    percentOwned: p.ownership?.percentOwned ?? null,
    seasonProjAvg: Number(stats[0]?.projected_avg_points || 0), seasonAvg: Number(stats[0]?.avg_points || 0),
    // Points in each completed week this season (for volatility: ceiling and floor).
    history: Object.entries(stats).filter(([wk, s]) => Number(wk) > 0 && Number(wk) < week && "points" in s).map(([, s]) => s.points),
    proTeamId,
    // "FREEAGENT", "WAIVERS" or "ONTEAM"; decides whether an add is instant or a waiver claim.
    acquisition: data.status || ("lineupSlotId" in data ? "ONTEAM" : "FREEAGENT"),
  };
}

function recentAverage(stats, week, n = 3) {
  const pts = [];
  for (let wk = week - 1; wk > Math.max(0, week - 1 - n); wk--) if (stats[wk] && "points" in stats[wk]) pts.push(stats[wk].points);
  return pts.length ? Math.round((pts.reduce((a, b) => a + b, 0) / pts.length) * 10) / 10 : null;
}

export async function boxScores(fetchFn, cookies, league, week, proSchedWeek, ratings, now) {
  let matchupPeriod = league.currentMatchupPeriod;
  for (const [mp, weeks] of Object.entries(league.matchupPeriods)) if (weeks.includes(week)) { matchupPeriod = Number(mp); break; }
  const d = await getJson(fetchFn, `${leagueUrl(league.season, league.id)}?view=mMatchupScore&view=mScoreboard&scoringPeriodId=${week}`, cookies,
    { "x-fantasy-filter": JSON.stringify({ schedule: { filterMatchupPeriodIds: { value: [matchupPeriod] } } }) });
  const side = (x) => {
    if (!x) return null;
    const lineup = (x.rosterForCurrentScoringPeriod?.entries || []).map((e) => parseBoxPlayer(e, league.season, week, proSchedWeek, ratings, now));
    const projected = "totalPointsLive" in x ? Math.round((x.totalProjectedPointsLive ?? -1) * 100) / 100 : -1;
    return { teamId: x.teamId, team: league.byId[x.teamId] || null, score: x.totalPointsLive ?? x.totalPoints ?? 0, projected, lineup };
  };
  return (d.schedule || []).map((m) => ({ home: side(m.home), away: side(m.away) }));
}

export async function freeAgents(fetchFn, cookies, league, week, position, proSchedWeek, ratings, now, size = 25) {
  const filter = { players: { filterStatus: { value: ["FREEAGENT", "WAIVERS"] }, filterSlotIds: { value: [SLOT_IDS[position]] }, limit: size,
    sortPercOwned: { sortPriority: 1, sortAsc: false }, sortDraftRanks: { sortPriority: 100, sortAsc: true, value: "STANDARD" } } };
  const d = await getJson(fetchFn, `${leagueUrl(league.season, league.id)}?view=kona_player_info&scoringPeriodId=${week}`, cookies,
    { "x-fantasy-filter": JSON.stringify(filter) });
  return (d.players || []).map((w) => parseBoxPlayer(w, league.season, week, proSchedWeek, ratings, now));
}

/**
 * Week-by-week actual points for a set of players (the box-score view only carries the current week). Returns
 * { playerId: { week: points } } for completed weeks before `week`. Uses the same player view the ESPN site uses for
 * player cards, asking for every scoring period's stats.
 */
export async function playerWeeklyStats(fetchFn, cookies, league, ids, week) {
  if (!ids.length) return {};
  const filter = { players: { filterIds: { value: ids }, filterStatsForTopScoringPeriodIds: { value: 17, additionalValue: [`00${league.season}`, `10${league.season}`] } } };
  const d = await getJson(fetchFn, `${leagueUrl(league.season, league.id)}?view=kona_player_info&scoringPeriodId=${week}`, cookies, { "x-fantasy-filter": JSON.stringify(filter) });
  const out = {};
  for (const w of d.players || []) {
    const p = w.player || {}; if (p.id == null) continue;
    const pts = {};
    for (const s of p.stats || []) {
      if (s.seasonId !== league.season || s.statSourceId !== 0 || s.statSplitTypeId === 2) continue;
      const sp = s.scoringPeriodId; if (!(sp > 0 && sp < week)) continue;
      pts[sp] = Math.round((s.appliedTotal || 0) * 100) / 100;
    }
    out[p.id] = pts;
  }
  return out;
}

/** My roster as box players for a week with no matchup (uses the roster view with the week's stats). */
export async function rosterLineup(fetchFn, cookies, league, teamId, week, proSchedWeek, ratings, now) {
  const d = await getJson(fetchFn, `${leagueUrl(league.season, league.id)}?view=mRoster&scoringPeriodId=${week}`, cookies);
  const t = (d.teams || []).find((x) => x.id === teamId);
  return (t?.roster?.entries || []).map((e) => parseBoxPlayer(e, league.season, week, proSchedWeek, ratings, now));
}

/** Compact season-value rosters for every team (the 4 MB view; parsed and dropped immediately). */
export async function rosters(fetchFn, cookies, league) {
  const d = await getJson(fetchFn, `${leagueUrl(league.season, league.id)}?view=mRoster`, cookies);
  const out = {};
  for (const t of d.teams || []) {
    out[t.id] = (t.roster?.entries || []).map((e) => {
      const p = e.playerPoolEntry?.player || {};
      let projAvg = 0, avg = 0;
      for (const s of p.stats || []) {
        if (s.seasonId !== league.season || s.scoringPeriodId !== 0 || s.statSplitTypeId === 2) continue;
        if (s.statSourceId === 0) avg = s.appliedAverage || 0; else projAvg = s.appliedAverage || 0;
      }
      return { playerId: p.id, name: p.fullName, position: playerPosition(p), eligible: (p.eligibleSlots || []).map((s) => SLOT_LABEL[s]).filter(Boolean),
        status: normStatus(p.injuryStatus || e.injuryStatus), proTeam: PRO_TEAM[p.proTeamId] || "", seasonProjAvg: projAvg, seasonAvg: avg,
        percentOwned: p.ownership?.percentOwned ?? null };
    });
  }
  return out;
}

/** Every trade proposal that involves `teamId`, with its status (PENDING, ACCEPTED, REJECTED, CANCELED, EXPIRED, EXECUTED...). */
export async function tradeTransactions(fetchFn, cookies, league, teamId) {
  const d = await getJson(fetchFn, `${leagueUrl(league.season, league.id)}?view=mTransactions2`, cookies);
  const out = [];
  const rows = d.transactions || [];
  // ESPN never changes a proposal's own row: a withdrawal is a second TRADE_PROPOSAL row with executionType CANCEL, a
  // decline is a TRADE_DECLINE row, an acceptance a TRADE_ACCEPT row (and a PROCESS one when the players move), each
  // naming the proposal through relatedTransactionId. Fold those into one status per proposal.
  const verdict = {};
  const raise = (id, st) => { if ((STATUS_RANK[st] ?? 0) > (STATUS_RANK[verdict[id]] ?? 0)) verdict[id] = st; };
  for (const t of rows) {
    const rel = t.relatedTransactionId; if (!rel) continue;
    if (t.type === "TRADE_PROPOSAL" && t.executionType === "CANCEL") raise(rel, "CANCELED");
    else if (t.type === "TRADE_DECLINE") raise(rel, "REJECTED");
    else if (t.type === "TRADE_ACCEPT") raise(rel, t.executionType === "PROCESS" || t.status === "EXECUTED" ? "EXECUTED" : "ACCEPTED");
    else if (t.type === "TRADE_VETO" && t.status === "EXECUTED") raise(rel, "VETOED");
  }
  const now = Date.now();
  for (const t of rows) {
    if (t.type !== "TRADE_PROPOSAL" || t.executionType === "CANCEL") continue;
    const items = (t.items || []).filter((i) => i.type === "TRADE");
    if (!items.some((i) => i.fromTeamId === teamId || i.toTeamId === teamId)) continue;
    const otherId = items.map((i) => (i.fromTeamId === teamId ? i.toTeamId : i.fromTeamId)).find((x) => x !== teamId);
    out.push({ id: t.id, proposed_by: t.teamId, mine: t.teamId === teamId, with_team_id: otherId, with: league.byId[otherId]?.name || `Team ${otherId}`, with_logo: league.byId[otherId]?.logo || "",
      give: items.filter((i) => i.fromTeamId === teamId).map((i) => i.playerId), get: items.filter((i) => i.toTeamId === teamId).map((i) => i.playerId),
      proposed_at: t.proposedDate || null, expires_at: t.expirationDate || null, status: foldStatus(t, verdict[t.id], now) });
  }
  return out;
}
const STATUS_RANK = { PENDING: 0, ACCEPTED: 1, REJECTED: 2, CANCELED: 2, EXPIRED: 2, VETOED: 3, EXECUTED: 4 };
function foldStatus(t, related, now) {
  const own = t.status || "PENDING";
  let st = (STATUS_RANK[related] ?? -1) > (STATUS_RANK[own] ?? 0) ? related : own;
  if (st === "PENDING" && t.expirationDate && Number(t.expirationDate) < now) st = "EXPIRED";
  return st;
}
/** Just the pending ones. */
export async function pendingTrades(fetchFn, cookies, league, teamId) {
  return (await tradeTransactions(fetchFn, cookies, league, teamId)).filter((t) => t.status === "PENDING");
}

/**
 * Trade actions, in the shapes ESPN's own web client sends (read from its bundle and confirmed by a live capture of a
 * withdrawal; see RESEARCH.md "Writes"). Every one is a POST to the transactions collection that names the offer through
 * relatedTransactionId; scoringPeriodId must be ESPN's current period or it answers 409.
 */
export function buildCancelTransaction(teamId, swid, week, txId) {
  return { isLeagueManager: false, teamId, type: "TRADE_PROPOSAL", memberId: swid, scoringPeriodId: week, executionType: "CANCEL", relatedTransactionId: txId };
}
export function buildRespondTransaction(teamId, swid, week, txId, accept, dropIds = []) {
  const tx = { isLeagueManager: false, teamId, type: accept ? "TRADE_ACCEPT" : "TRADE_DECLINE", memberId: swid, scoringPeriodId: week, executionType: "EXECUTE", relatedTransactionId: txId };
  if (accept && dropIds.length) tx.items = dropIds.map((playerId) => ({ playerId, type: "DROP", fromTeamId: teamId }));
  return tx;
}
export async function respondTrade(fetchFn, cookies, season, leagueId, teamId, txId, accept, week) {
  if (!week) return { ok: false, status: 0, message: "Cannot answer the offer without the league's current week." };
  return postTransaction(fetchFn, cookies, season, leagueId, buildRespondTransaction(teamId, cookies.swid, week, txId, accept),
    accept ? "Offer accepted. ESPN runs its review period before the players move." : "Offer declined.");
}
export async function cancelTrade(fetchFn, cookies, season, leagueId, teamId, txId, week) {
  if (!week) return { ok: false, status: 0, message: "Cannot withdraw the offer without the league's current week." };
  return postTransaction(fetchFn, cookies, season, leagueId, buildCancelTransaction(teamId, cookies.swid, week, txId), "Offer withdrawn.");
}

// ------------------------------------------------------------------ writes

export function buildLineupTransaction(teamId, swid, week, items, future = false) {
  return { isLeagueManager: false, teamId, type: future ? "FUTURE_ROSTER" : "ROSTER", memberId: swid, scoringPeriodId: week, executionType: "EXECUTE",
    items: items.map((it) => ({ playerId: it.playerId, type: "LINEUP", fromLineupSlotId: it.fromLineupSlotId, toLineupSlotId: it.toLineupSlotId })) };
}

/** A trade offer: my players go to them, theirs come to me. ESPN notifies the other manager, who accepts or rejects on ESPN. */
export function buildTradeTransaction(myTeamId, swid, week, theirTeamId, giveIds, getIds) {
  return { isLeagueManager: false, teamId: myTeamId, type: "TRADE_PROPOSAL", memberId: swid, scoringPeriodId: week, executionType: "EXECUTE",
    items: [...giveIds.map((id) => ({ playerId: id, type: "TRADE", fromTeamId: myTeamId, toTeamId: theirTeamId })),
      ...getIds.map((id) => ({ playerId: id, type: "TRADE", fromTeamId: theirTeamId, toTeamId: myTeamId }))] };
}

/** Add a free agent (instant) or claim a player on waivers (processed by ESPN later), optionally dropping someone. */
export function buildAddTransaction(teamId, swid, week, { addId, dropId = null, waiver = false, bid = 0 }) {
  const items = [{ playerId: addId, type: "ADD", toTeamId: teamId, toLineupSlotId: 20 }];
  if (dropId != null) items.push({ playerId: dropId, type: "DROP", fromTeamId: teamId });
  const tx = { isLeagueManager: false, teamId, type: waiver ? "WAIVER" : "FREEAGENT", memberId: swid, scoringPeriodId: week, executionType: "EXECUTE", items };
  if (waiver) tx.bidAmount = Number(bid) || 0;
  return tx;
}

async function postTransaction(fetchFn, cookies, season, leagueId, body, okMessage) {
  const r = await fetchFn(`${WRITE}${season}/segments/0/leagues/${leagueId}/transactions/`, {
    method: "POST", headers: { Cookie: cookieHeader(cookies), "User-Agent": UA, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const ok = r.status >= 200 && r.status < 300;
  let resp; const text = await r.text();
  try { resp = JSON.parse(text); } catch { resp = text.slice(0, 500); }
  return { ok, status: r.status, message: ok ? okMessage : errorMessage(resp, r.status), response: resp };
}

/** `currentWeek` is ESPN's current scoring period; a lineup for a later week goes as FUTURE_ROSTER, as ESPN's client sends it. */
export async function applyLineup(fetchFn, cookies, season, leagueId, teamId, week, items, currentWeek = null) {
  if (!items.length) return { ok: true, status: 0, message: "No changes needed." };
  const future = !!currentWeek && week > currentWeek;
  return postTransaction(fetchFn, cookies, season, leagueId, buildLineupTransaction(teamId, cookies.swid, week, items, future), future ? `Lineup set for week ${week}.` : "Lineup set.");
}

export async function proposeTrade(fetchFn, cookies, season, leagueId, myTeamId, week, theirTeamId, giveIds, getIds) {
  return postTransaction(fetchFn, cookies, season, leagueId, buildTradeTransaction(myTeamId, cookies.swid, week, theirTeamId, giveIds, getIds),
    "Trade proposed. The other manager has been notified on ESPN and can accept or decline there.");
}

export async function addPlayer(fetchFn, cookies, season, leagueId, teamId, week, opts) {
  const claimMsg = "Waiver claim submitted. ESPN processes claims on the league's waiver schedule; check ESPN for the result.";
  const msg = opts.waiver ? claimMsg : "Player added to your roster.";
  const r = await postTransaction(fetchFn, cookies, season, leagueId, buildAddTransaction(teamId, cookies.swid, week, opts), msg);
  // Early in the week ESPN holds recently dropped players (and, in many leagues, the whole pool) on waivers: an add
  // comes back "is not a free agent". Then the right move is the same add as a claim.
  if (!r.ok && !opts.waiver && /not a free agent/i.test(r.message || "")) {
    const c = await postTransaction(fetchFn, cookies, season, leagueId, buildAddTransaction(teamId, cookies.swid, week, { ...opts, waiver: true }), claimMsg + " (He was on waivers, so this went in as a claim.)");
    return c.ok ? { ...c, claimed: true } : { ...c, message: `${r.message}; as a claim: ${c.message}` };
  }
  return r;
}

function errorMessage(body, status) {
  if (body && typeof body === "object") {
    const msgs = body.messages || (body.details || []).map((x) => x.message).filter(Boolean);
    if (msgs && msgs.length) return `ESPN rejected the change (${status}): ${msgs.join("; ")}`;
  }
  return `ESPN rejected the change (${status}).`;
}
