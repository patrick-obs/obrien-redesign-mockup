// Server-rendered pages. Mirrors templates/*.html.
export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const pts = (v) => (v === null || v === undefined || isNaN(Number(v)) || Number(v) < 0) ? "n/a" : Number(v).toFixed(1);
const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;

const CSS = `:root{--bg:#fff0f6;--card:#fff;--ink:#2b1a24;--muted:#7a5a6b;--line:#f7d0e1;--accent:#d6336c;--good:#1a7f37;--bad:#c62828;--warn:#9a6700;--warnbg:#fff8e1;--badbg:#fdecea;--goodbg:#e9f6ec}
@media (prefers-color-scheme:dark){:root{--bg:#1a0f15;--card:#25161f;--ink:#f7e8ef;--muted:#c49cb1;--line:#3f2533;--accent:#e64980;--good:#3fb950;--bad:#ff6b6b;--warn:#e3b341;--warnbg:#2a2410;--badbg:#2d1a1a;--goodbg:#15271a}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.45 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
a{color:var(--accent);text-decoration:none}a:hover{text-decoration:underline}
header{background:var(--card);border-bottom:1px solid var(--line);padding:10px 16px;display:flex;gap:14px;align-items:center;flex-wrap:wrap}
header .brand{font-weight:700;font-size:18px;margin-right:auto}header form{margin:0}
main{max-width:1100px;margin:0 auto;padding:16px}
.card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px;margin-bottom:16px}
h1{font-size:22px;margin:0 0 12px}h2{font-size:17px;margin:20px 0 8px}h2.top{margin-top:0}
.btn{display:inline-block;background:var(--accent);color:#fff;border:0;border-radius:8px;padding:10px 16px;font-size:16px;font-weight:600;cursor:pointer}
.btn.big{padding:14px 22px;font-size:18px;width:100%;text-align:center}.btn.ghost{background:transparent;color:var(--accent);border:1px solid var(--accent)}
.muted{color:var(--muted)}.good{color:var(--good)}.bad{color:var(--bad)}.warn{color:var(--warn)}
.tag{display:inline-block;border-radius:999px;padding:1px 8px;font-size:12px;font-weight:600;background:var(--line)}
.tag.warn{background:var(--warnbg);color:var(--warn)}.tag.bad{background:var(--badbg);color:var(--bad)}.tag.good{background:var(--goodbg);color:var(--good)}
.tablewrap{overflow-x:auto}table{border-collapse:collapse;width:100%;font-size:14px}th,td{text-align:left;padding:6px 8px;border-bottom:1px solid var(--line);white-space:nowrap}th{color:var(--muted);font-weight:600;font-size:12px;text-transform:uppercase}
td.num,th.num{text-align:right}
ul.plain{list-style:none;padding:0;margin:0}ul.plain li{padding:6px 0;border-bottom:1px solid var(--line)}ul.plain li:last-child{border:0}
.grid{display:grid;gap:16px;grid-template-columns:repeat(auto-fill,minmax(300px,1fr))}
.kv{display:flex;justify-content:space-between;gap:12px;padding:4px 0}
.flash{background:var(--warnbg);color:var(--warn);border-radius:8px;padding:10px 12px;margin-bottom:12px}
input[type=text],input[type=password],textarea{width:100%;padding:10px;border:1px solid var(--line);border-radius:8px;background:var(--bg);color:var(--ink);font-size:16px}
label{display:block;font-weight:600;margin:12px 0 4px}
.move{padding:8px 10px;border-radius:8px;margin:4px 0;background:var(--bg)}
.tabs{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0 16px}.tabs a{padding:6px 12px;border:1px solid var(--line);border-radius:999px;background:var(--card)}
.right{float:right}.small{font-size:13px}
footer{color:var(--muted);font-size:13px;text-align:center;padding:20px}`;

export function layout(title, body, { authed = false, flash = [] } = {}) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title><style>${CSS}</style></head><body>
<header><a class="brand" href="/">Fantasy Advisor</a>
${authed ? `<a href="/lineups">Set lineups</a><a href="/settings">Settings</a><form method="post" action="/logout"><button class="btn ghost" type="submit">Log out</button></form>` : ""}
</header><main>${flash.map((m) => `<div class="flash">${esc(m)}</div>`).join("")}${body}</main>
<footer>Projections are ESPN's. Nothing here guarantees a win; it just stops points being left on the bench.</footer></body></html>`;
}

export const loginPage = (configured, flash = []) => layout("Log in", `
<div class="card" style="max-width:420px;margin:40px auto"><h1>Log in</h1>
${configured ? "" : `<p class="bad">APP_PASSWORD is not set on the server, so nobody can log in yet.</p>`}
<form method="post"><label for="password">Passphrase</label>
<input type="password" id="password" name="password" autofocus autocomplete="current-password">
<p><button class="btn big" type="submit">Enter</button></p></form></div>`, { flash });

export const errorPage = (message, authed) => layout("Problem", `<div class="card"><h1>Something went wrong</h1><p>${esc(message)}</p>
<p class="muted">If this mentions a 401 or cookies, the ESPN login expired. Update the cookies under Settings.</p>
<p><a class="btn ghost" href="/">Back</a></p></div>`, { authed });

export const settingsPage = (s, csrf, flash = []) => layout("Settings", `
<div class="card" style="max-width:640px"><h1>ESPN connection</h1>
<p class="muted">These two cookies let the app read your leagues and set your lineups. Get them from fantasy.espn.com while logged in: press F12, open Application, then Cookies, then https://fantasy.espn.com. They expire now and then; paste fresh ones when the app says it cannot load a league.</p>
<form method="post"><input type="hidden" name="csrf" value="${esc(csrf)}">
<label for="swid">SWID (keep the curly braces)</label><input type="text" id="swid" name="swid" value="${esc(s.swid)}" autocomplete="off">
<label for="espn_s2">espn_s2</label><textarea id="espn_s2" name="espn_s2" rows="4" autocomplete="off">${esc(s.espn_s2)}</textarea>
<p class="muted">Season: ${esc(s.season)}</p><p><button class="btn" type="submit">Save and test</button></p></form></div>`, { authed: true, flash });

function lineupTable(r, lineup) {
  const rows = [];
  for (const slot of r.slot_order) {
    for (const p of lineup[slot] || []) {
      const bad = p.bye || ["OUT", "INJURY_RESERVE", "SUSPENSION"].includes(p.status);
      rows.push(`<tr><td>${esc(slot)}</td><td>${esc(p.name)}</td><td>${esc(p.pos)}</td><td>${esc(p.team)}</td><td>${esc(p.opp)}</td>
<td class="num">${p.opp_rank ? "#" + p.opp_rank : ""}</td><td class="num">${pts(p.proj)}</td><td class="num">${p.recent_avg != null ? pts(p.recent_avg) : ""}</td>
<td>${p.notes ? `<span class="tag ${bad ? "bad" : "warn"}">${esc(p.notes)}</span>` : ""}</td></tr>`);
    }
    for (let i = (lineup[slot] || []).length; i < (r.slot_counts[slot] || 0); i++) {
      rows.push(`<tr><td>${esc(slot)}</td><td class="bad">EMPTY</td><td></td><td></td><td></td><td></td><td class="num">0.0</td><td></td><td><span class="tag bad">nobody eligible</span></td></tr>`);
    }
  }
  return `<div class="tablewrap"><table><tr><th>Slot</th><th>Player</th><th>Pos</th><th>Team</th><th>Opp</th><th class="num">OppRk</th><th class="num">Proj</th><th class="num">L3</th><th>Notes</th></tr>${rows.join("")}</table></div>`;
}

export function indexPage({ bundles, errors, totalMoves, season, now }) {
  const live = bundles.filter((b) => b.started);
  const when = new Date(now).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/New_York" });
  let top = "";
  if (live.length) {
    top = `<div class="card">${totalMoves
      ? `<p><strong>${totalMoves}</strong> lineup change${totalMoves !== 1 ? "s" : ""} recommended across your leagues.</p><a class="btn big" href="/lineups">Set all lineups</a>`
      : `<p class="good">All lineups already match the projections. Nothing to change right now.</p><a class="btn ghost" href="/lineups">Review anyway</a>`}
<p class="muted" style="margin-bottom:0">Data as of ${esc(when)} ET. <a href="/?refresh=1">Refresh from ESPN</a></p></div>`;
  }
  const cards = bundles.map((b) => {
    if (!b.started) return `<div class="card"><h2 class="top"><a href="/league/${b.league_id}">${esc(b.name)}</a></h2><p class="muted">Not started this season (no draft or rosters yet).</p></div>`;
    const r = b.report, d = r.recommended_lineup_proj - r.current_lineup_proj;
    return `<div class="card"><h2 class="top"><a href="/league/${b.league_id}">${esc(b.name)}</a></h2>
<div class="kv"><span>${esc(r.team)}</span><strong>${esc(r.record)}</strong></div>
<div class="kv"><span>Week ${r.week} vs ${esc(r.opponent)}</span><span class="muted">${esc(r.opponent_record)}</span></div>
<div class="kv"><span>ESPN projection</span><span>${pts(r.espn_projection.me)} <span class="muted">vs ${pts(r.espn_projection.opponent)}</span></span></div>
<div class="kv"><span>Lineup as set / best</span><span>${pts(r.current_lineup_proj)} / <strong>${pts(r.recommended_lineup_proj)}</strong> ${d > 0 ? `<span class="good">(+${pts(d)})</span>` : ""}</span></div>
<p>${r.lineup_items.length ? `<span class="tag warn">${plural(r.lineup_items.length, "change")}</span>` : `<span class="tag good">lineup set</span>`}
${b.problem_count ? ` <span class="tag bad">${plural(b.problem_count, "problem")}</span>` : ""}
${b.trades && b.trades.length ? ` <span class="tag">${plural(b.trades.length, "trade idea")}</span>` : ""}</p>
${r.moves.map((m) => `<div class="move">${esc(m)}</div>`).join("")}
${r.warnings.map((w) => `<div class="warn">! ${esc(w)}</div>`).join("")}</div>`;
  });
  return layout("Your leagues", `<h1>Your leagues, ${esc(season)}</h1>${errors.map((e) => `<div class="flash">${esc(e)}</div>`).join("")}${top}<div class="grid">${cards.join("")}</div>`, { authed: true });
}

export function leaguePage(b) {
  const r = b.report;
  const sides = (s) => `<strong>${esc(s.team)}</strong> (${esc(s.record)}) ${pts(s.espn_proj)}/${pts(s.best_lineup_proj)}`;
  const waivers = Object.keys(r.waivers).length
    ? `<div class="tablewrap"><table><tr><th>Pos</th><th>Player</th><th>Team</th><th>Opp</th><th class="num">Proj</th><th>Why</th><th class="num">Owned</th></tr>
${Object.entries(r.waivers).map(([pos, picks]) => picks.map((d) => d.error
        ? `<tr><td>${esc(pos)}</td><td colspan="6" class="muted">could not load: ${esc(d.error)}</td></tr>`
        : `<tr><td>${esc(pos)}</td><td>${esc(d.name)}</td><td>${esc(d.team)}</td><td>${esc(d.opp)}</td><td class="num">${pts(d.proj)}</td>
<td>${d.fills_empty_slot ? `<span class="tag bad">fills your EMPTY slot</span>` : `<span class="good">+${pts(d.edge)}</span>`}</td>
<td class="num">${d.owned != null ? Math.round(d.owned) + "%" : ""}</td></tr>`).join("")).join("")}</table></div>`
    : `<p class="good">No free agent out-projects your starters this week.</p>`;
  const trades = b.trades && b.trades.length
    ? `<ul class="plain">${b.trades.map((t) => `<li><strong>${esc(t.with)}</strong>: give ${esc(t.give)} <span class="muted">(${esc(t.give_pos)}, ${pts(t.give_value)})</span> for ${esc(t.get)} <span class="muted">(${esc(t.get_pos)}, ${pts(t.get_value)})</span>
<span class="right"><span class="good">you +${pts(t.my_gain)}</span> / <span class="${t.their_gain >= 0 ? "good" : "warn"}">them ${t.their_gain >= 0 ? "+" : "-"}${Math.abs(t.their_gain).toFixed(1)}</span></span>
<div class="muted small">${esc(t.pitch)}</div></li>`).join("")}</ul>`
    : `<p class="muted">Nothing that clearly helps you without hurting the other side. Check back as injuries change things.</p>`;
  const body = `<h1>${esc(r.league)} <span class="muted">week ${r.week}</span></h1>
<div class="tabs"><a href="#lineup">Lineup</a><a href="#opponent">Opponent</a><a href="#waivers">Waivers</a><a href="#trades">Trades</a><a href="#league">League</a><a href="#schedule">Schedule</a><a href="#standings">Standings</a></div>
<div class="card" id="lineup">
<div class="kv"><strong>${esc(r.team)} (${esc(r.record)})</strong><span>vs ${esc(r.opponent)} (${esc(r.opponent_record)})</span></div>
<div class="kv"><span>ESPN projects</span><span>you ${pts(r.espn_projection.me)}, them ${pts(r.espn_projection.opponent)}</span></div>
<div class="kv"><span>Your starters as set / recommended</span><span>${pts(r.current_lineup_proj)} / <strong>${pts(r.recommended_lineup_proj)}</strong></span></div>
${r.lineup_items.length ? `<p><a class="btn" href="/lineups?league=${r.league_id}">Set this lineup (${plural(r.lineup_items.length, "change")})</a></p>` : ""}
<h2>Recommended lineup</h2>${lineupTable(r, r.recommended)}
<h2>Changes to make</h2>${r.moves.length ? r.moves.map((m) => `<div class="move">${esc(m)}</div>`).join("") : `<p class="good">None. Your lineup already matches the projections.</p>`}
${r.warnings.length ? `<h2>Watch out</h2>${r.warnings.map((w) => `<div class="warn">! ${esc(w)}</div>`).join("")}` : ""}
<h2>Bench</h2><ul class="plain">${r.bench.map((p) => `<li>${esc(p.name)} <span class="muted">${esc(p.pos)} ${esc(p.team)}</span><span class="right">${pts(p.proj)} ${p.notes ? `<span class="tag warn">${esc(p.notes)}</span>` : ""}</span></li>`).join("")}</ul></div>
<div class="card" id="opponent"><h2 class="top">Opponent: ${esc(r.opponent)} <span class="muted">best possible ${pts(r.opponent_best_proj)}</span></h2>
${lineupTable(r, r.opponent_lineup)}${r.opponent_issues.length ? `<p class="warn">Their problems as set: ${esc(r.opponent_issues.join("; "))}</p>` : ""}</div>
<div class="card" id="waivers"><h2 class="top">Waiver watch</h2><p class="muted">Free agents projected above your weakest starter at that position this week. Adding and dropping is left to you.</p>${waivers}</div>
<div class="card" id="trades"><h2 class="top">Trade ideas</h2><p class="muted">One-for-one swaps ranked by what your best lineup gains per week for the rest of the season, filtered to offers the other side could reasonably accept. Values blend ESPN's season projection with results so far.</p>${trades}</div>
<div class="card" id="league"><h2 class="top">All matchups, week ${r.week}</h2><p class="muted">ESPN projection / best possible from each roster.</p>
<ul class="plain">${r.matchups.map((s) => `<li>${s.length === 2 ? `${sides(s[0])} vs ${sides(s[1])}${[s[0].team_id, s[1].team_id].includes(r.team_id) ? ` <span class="tag">you</span>` : ""}` : s.length ? `${esc(s[0].team)} has a bye` : ""}
${s.filter((x) => x.problems.length).map((x) => `<div class="warn small">${esc(x.team)}: ${esc(x.problems.join("; "))}</div>`).join("")}</li>`).join("")}</ul>
<h2>League injury report</h2><ul class="plain">${r.injury_report.map((t) => `<li><strong>${esc(t.team)}</strong>${t.team_id === r.team_id ? ` <span class="tag">you</span>` : ""}: ${t.injuries.length ? esc(t.injuries.join("; ")) : `<span class="good">healthy</span>`}</li>`).join("")}</ul></div>
<div class="card" id="schedule">${r.results.length ? `<h2 class="top">Season so far</h2><div class="tablewrap"><table><tr><th>Wk</th><th></th><th>Score</th><th>Opponent</th></tr>
${r.results.map((e) => `<tr><td>${e.week}</td><td class="${e.result === "W" ? "good" : "bad"}">${esc(e.result)}</td><td>${e.score != null && e.opp_score != null ? `${pts(e.score)} - ${pts(e.opp_score)}` : ""}</td><td>${esc(e.opponent)}</td></tr>`).join("")}</table></div>` : ""}
${r.schedule.length ? `<h2>Remaining schedule</h2><div class="tablewrap"><table><tr><th>Wk</th><th>Opponent</th><th>Record</th><th class="num">Avg PF</th><th>Injuries</th></tr>
${r.schedule.map((e) => `<tr><td>${e.week}</td><td>${esc(e.opponent)}</td><td>${esc(e.record)}</td><td class="num">${pts(e.avg_pf)}</td><td>${esc(e.injuries.join("; "))}</td></tr>`).join("")}</table></div>` : ""}</div>
<div class="card" id="standings"><h2 class="top">Standings</h2><div class="tablewrap"><table><tr><th>#</th><th>Team</th><th>Record</th><th class="num">PF</th><th class="num">Avg</th><th class="num">PA</th></tr>
${r.standings.map((t) => `<tr${t.team_id === r.team_id ? ' style="font-weight:700"' : ""}><td>${t.rank}</td><td>${esc(t.team)}</td><td>${esc(t.record)}</td><td class="num">${pts(t.pf)}</td><td class="num">${pts(t.avg_pf)}</td><td class="num">${pts(t.pa)}</td></tr>`).join("")}</table></div></div>
<p class="muted">Data as of ${esc(r.generated_at)} UTC. <a href="/league/${r.league_id}?refresh=1">Refresh from ESPN</a></p>`;
  return layout(r.league, body, { authed: true });
}

export function lineupsPage({ bundles, results, only, csrf }) {
  if (!results) {
    const any = bundles.reduce((n, b) => n + b.report.lineup_items.length, 0);
    const body = `<h1>Set ${only ? "this lineup" : "all lineups"}</h1>
<p class="muted">This is exactly what will be sent to ESPN. Only slot changes: nobody is added or dropped, locked players are left alone, and IR is never touched.</p>
${bundles.map((b) => `<div class="card"><h2 class="top">${esc(b.name)} <span class="muted">week ${b.week}</span></h2>
${b.report.lineup_items.length ? `<ul class="plain">${b.report.lineup_items.map((it) => `<li>${esc(it.name)}: <span class="muted">${esc(it.from)}</span> &rarr; <strong>${esc(it.to)}</strong></li>`).join("")}</ul>
<p class="muted">Projected: ${pts(b.report.current_lineup_proj)} &rarr; ${pts(b.report.recommended_lineup_proj)}</p>` : `<p class="good">Already set. No changes.</p>`}</div>`).join("")}
${any ? `<form method="post" action="/lineups"><input type="hidden" name="csrf" value="${esc(csrf)}">${only ? `<input type="hidden" name="league" value="${esc(only)}">` : ""}
<button class="btn big" type="submit">Confirm and send to ESPN</button></form>
<p class="muted">Press once. ESPN has no undo for this; if you change your mind, change the lineup back on ESPN or re-run after projections move.</p>` : `<p><a class="btn ghost" href="/">Back</a></p>`}`;
    return layout("Set lineups", body, { authed: true });
  }
  const body = `<h1>Done</h1>${results.map((x) => `<div class="card"><h2 class="top">${esc(x.name)}</h2><p class="${x.result.ok ? "good" : "bad"}">${esc(x.result.message)}</p>
${x.items.length && !x.result.ok ? `<p class="muted">Tried: ${esc(x.items.map((it) => `${it.name} ${it.from}→${it.to}`).join(", "))}</p><p class="muted">Make these on ESPN by hand, then come back. If this keeps failing with 401, update the cookies under Settings.</p>` : ""}</div>`).join("")}
<p><a class="btn" href="/?refresh=1">Back to your leagues</a></p>`;
  return layout("Done", body, { authed: true });
}
