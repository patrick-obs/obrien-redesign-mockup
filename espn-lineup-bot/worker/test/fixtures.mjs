// Fake league data shared by tests. Mirrors tests/test_report.py.
export const ELIG = {
  QB: ["QB", "OP", "BE"], RB: ["RB", "RB/WR", "RB/WR/TE", "OP", "BE"], WR: ["WR", "RB/WR", "WR/TE", "RB/WR/TE", "OP", "BE"],
  TE: ["TE", "WR/TE", "RB/WR/TE", "OP", "BE"], K: ["K", "BE"], "D/ST": ["D/ST", "BE"],
};
export const SLOTS = { QB: 1, RB: 2, WR: 2, TE: 1, "RB/WR/TE": 1, "D/ST": 1, K: 1, BE: 7, IR: 2 };
export const NOW = Date.UTC(2026, 10, 1, 17, 0, 0);
const ids = {};
export function bp(name, pos, slot, proj, { status = "ACTIVE", bye = false, hours = 24, recentAvg = null, owned = 50, seasonProjAvg, seasonAvg } = {}) {
  return { playerId: (ids[name] ||= 1000 + Object.keys(ids).length), name, position: pos, eligible: ELIG[pos], slot, proj, status, bye,
    locked: NOW >= NOW + hours * 3600e3, proTeam: "KC", opponent: bye ? "None" : "BUF", oppRank: 12, gameDate: NOW + hours * 3600e3,
    recentAvg, percentOwned: owned, seasonProjAvg: seasonProjAvg ?? proj, seasonAvg: seasonAvg ?? proj };
}
export const MINE = () => [
  bp("QB A", "QB", "QB", 18.0, { recentAvg: 20.0 }), bp("RB A", "RB", "RB", 14.0), bp("RB B", "RB", "RB", 9.0, { status: "OUT" }),
  bp("RB C", "RB", "BE", 11.0), bp("WR A", "WR", "WR", 13.0, { status: "QUESTIONABLE" }), bp("WR B", "WR", "WR", 10.0),
  bp("WR C", "WR", "RB/WR/TE", 7.0), bp("TE A", "TE", "TE", 8.0, { bye: true }), bp("TE B", "TE", "BE", 6.0),
  bp("K A", "K", "K", 8.0, { hours: -2 }), bp("D A", "D/ST", "BE", 0.0, { bye: true }), bp("WR D", "WR", "IR", 0.0, { status: "INJURY_RESERVE" }),
];
export const THEIRS = () => [
  bp("QB Z", "QB", "QB", 19.0), bp("RB Z", "RB", "RB", 12.0), bp("RB Y", "RB", "RB", 10.0), bp("WR Z", "WR", "WR", 11.0, { status: "DOUBTFUL" }),
  bp("WR Y", "WR", "WR", 9.0), bp("TE Z", "TE", "TE", 7.0), bp("WR X", "WR", "RB/WR/TE", 6.0), bp("K Z", "K", "K", 7.0), bp("D Z", "D/ST", "D/ST", 6.0),
  bp("D W", "D/ST", "BE", 5.0), // a spare defense on their bench: the obvious trade target for my empty D/ST slot
];
export const OTHERS = () => [bp("QB O", "QB", "QB", 15.0), bp("RB O", "RB", "RB", 10.0, { status: "OUT" })];

function team(id, name, owners, w, l) {
  return { id, name, abbrev: name.slice(0, 3), wins: w, losses: l, ties: 0, pointsFor: 900.5, pointsAgainst: 850.25, standing: id, finalStanding: 0,
    owners, ownerNames: [], schedule: [], scores: [], outcomes: [], logo: id === 7 ? "https://example.test/rival.png" : "" };
}
export function fakeLeague(id = 1, started = true) {
  const me = team(3, "Patrick's Team", ["{ABC-123}"], 5, 3), opp = team(7, "Rival", ["{XYZ}"], 4, 4), t3 = team(9, "Third", [], 2, 6), t4 = team(10, "Fourth", [], 6, 2);
  me.standing = 2; opp.standing = 3; t3.standing = 4; t4.standing = 1;
  me.schedule = [7, 9, 10, 7, 9, 10, 7, 9, 10, 7, 9, 10, 7, 9]; me.scores = Array(8).fill(100); me.outcomes = ["W", "L", "W", "W", "L", "W", "L", "W", "U", "U", "U", "U", "U", "U"];
  opp.scores = Array(8).fill(90);
  const teams = [me, opp, t3, t4];
  return { id, season: 2026, name: started ? "Test League" : "Dead League", currentWeek: 9, currentMatchupPeriod: started ? 9 : 1, finalScoringPeriod: 17,
    regSeasonCount: 14, playoffTeamCount: 2, rosterSize: 11, acquisition: { type: "WAIVERS_CONTINUOUS", usesBudget: true, budget: 100 },
    matchupPeriods: {}, slotCounts: SLOTS, teams, byId: Object.fromEntries(teams.map((t) => [t.id, t])), started, drafted: started };
}
export function fakeBoxes(league) {
  const [me, opp, t3, t4] = league.teams;
  return [
    { home: { teamId: 7, team: opp, score: 0, projected: 110, lineup: THEIRS() }, away: { teamId: 3, team: me, score: 0, projected: 95, lineup: MINE() } },
    { home: { teamId: 9, team: t3, score: 0, projected: 60, lineup: OTHERS() }, away: { teamId: 10, team: t4, score: 0, projected: -1, lineup: [bp("QB F", "QB", "QB", 1.0)] } },
  ];
}
export const FA = { TE: [bp("TE FA", "TE", "FA", 9.5, { owned: 22 })], RB: [bp("RB FA", "RB", "FA", 5.0)], "D/ST": [{ ...bp("D FA", "D/ST", "FA", 6.5, { owned: 10 }), acquisition: "WAIVERS" }] };

/** A fake of the espn module for App tests. */
export function fakeEspn({ posts = [] } = {}) {
  return {
    currentSeason: () => 2026,
    discoverLeagues: async () => [{ league_id: 1, league_name: "Test League", team_id: 3, team_name: "Patrick's Team", season: 2026 },
      { league_id: 2, league_name: "Dead League", team_id: 1, team_name: "X", season: 2026 }],
    loadLeague: async (f, c, season, id) => fakeLeague(id, id === 1),
    findTeam: (league, swid) => league.teams.find((t) => t.owners.some((o) => o.toLowerCase() === swid.toLowerCase())),
    proSchedule: async () => ({}), proScheduleForWeek: () => ({}), positionalRatings: async () => ({}),
    boxScores: async (f, c, league) => fakeBoxes(league),
    freeAgents: async (f, c, league, week, pos) => FA[pos] || [],
    rosters: async (f, c, league) => Object.fromEntries(league.teams.map((t) => [t.id, (t.id === 3 ? MINE() : t.id === 7 ? THEIRS() : OTHERS())])),
    gamesPlayed: (t) => t.wins + t.losses + t.ties,
    PRO_TEAM: { 12: "KC", 2: "BUF" },
    applyLineup: async (f, c, season, leagueId, teamId, week, items) => { posts.push({ kind: "lineup", leagueId, teamId, week, items, cookies: c }); return { ok: true, status: 200, message: "Lineup set." }; },
    proposeTrade: async (f, c, season, leagueId, teamId, week, theirTeamId, giveIds, getIds) => { posts.push({ kind: "trade", leagueId, teamId, week, theirTeamId, giveIds, getIds }); return { ok: true, status: 200, message: "Trade proposed." }; },
    addPlayer: async (f, c, season, leagueId, teamId, week, opts) => { posts.push({ kind: "add", leagueId, teamId, week, ...opts }); return { ok: true, status: 200, message: opts.waiver ? "Waiver claim submitted." : "Player added." }; },
  };
}
export class FakeStorage {
  constructor() { this.m = new Map(); }
  async get(k) { return this.m.get(k); }
  async put(k, v) { this.m.set(k, v); }
  async delete(k) { this.m.delete(k); }
  async list({ prefix } = {}) { return new Map([...this.m].filter(([k]) => !prefix || k.startsWith(prefix))); }
}
