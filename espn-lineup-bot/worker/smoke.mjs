// Runs the real ESPN client end to end from Node and prints each league's recommendation.
// Usage: ESPN_S2=... SWID=... node worker/smoke.mjs      (through a proxy: NODE_USE_ENV_PROXY=1)
import * as espn from "./espn.js";
import { App } from "./app.js";
import { FakeStorage } from "./test/fixtures.mjs";

const env = { APP_PASSWORD: "x", SECRET_KEY: "x", ESPN_S2: process.env.ESPN_S2, SWID: process.env.SWID, SEASON: process.env.SEASON };
const app = new App({ env, storage: new FakeStorage(), fetchFn: (u, i) => fetch(u, i), espn });
const t0 = Date.now();
const leagues = await app.leagues();
console.log("leagues:", leagues.map((l) => `${l.league_name} (${l.league_id}, team ${l.team_id})`).join(" | "));
for (const lg of leagues) {
  const t1 = Date.now();
  const b = await app.bundle(lg.league_id, true);
  if (!b.started) { console.log(`\n${b.name}: not started`); continue; }
  const r = b.report;
  console.log(`\n${r.league} week ${r.week}: ${r.team} (${r.record}) vs ${r.opponent} (${r.opponent_record})  ESPN ${r.espn_projection.me} vs ${r.espn_projection.opponent}`);
  console.log(`  as set ${r.current_lineup_proj} -> recommended ${r.recommended_lineup_proj}; opponent best ${r.opponent_best_proj}`);
  for (const s of r.slot_order) for (const p of r.recommended[s]) console.log(`  ${s.padEnd(9)} ${p.name.padEnd(22)} ${p.pos.padEnd(5)} ${p.team.padEnd(4)} ${p.opp.padEnd(4)} ${String(p.proj).padStart(5)}  ${p.notes}`);
  for (const m of r.moves) console.log("  " + m);
  for (const w of r.warnings) console.log("  ! " + w);
  console.log("  lineup items:", r.lineup_items.map((i) => `${i.name} ${i.from}>${i.to}`).join(", ") || "none");
  for (const [pos, picks] of Object.entries(r.waivers)) for (const d of picks) console.log(`  waiver ${pos}: ${d.name} ${d.proj} (${d.fills_empty_slot ? "fills EMPTY" : "+" + d.edge}) ${d.owned}%`);
  for (const t of b.trades.slice(0, 4)) console.log(`  trade: ${t.with}: give ${t.give} (${t.give_value}) for ${t.get} (${t.get_value}) you +${t.my_gain} them ${t.their_gain}`);
  console.log(`  matchups ${r.matchups.length}, injury rows ${r.injury_report.length}, results ${r.results.length}, schedule ${r.schedule.length}, standings ${r.standings.length}  (${((Date.now() - t1) / 1000).toFixed(1)}s)`);
}
console.log(`\ntotal ${((Date.now() - t0) / 1000).toFixed(1)}s`);
