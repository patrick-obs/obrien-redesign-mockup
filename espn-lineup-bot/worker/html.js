// Server-rendered pages. Mirrors templates/*.html.
export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const pts = (v) => (v === null || v === undefined || isNaN(Number(v)) || Number(v) < 0) ? "n/a" : Number(v).toFixed(1);
const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;

const CSS = `:root{--bg:#fff0f6;--card:#fff;--ink:#2b1a24;--head:#5e1a39;--muted:#7a5a6b;--line:#f7d0e1;--soft:#fff7fb;--accent:#d6336c;--accent2:#b02458;--good:#1a7f37;--bad:#c62828;--warn:#9a6700;--warnbg:#fff8e1;--badbg:#fdecea;--goodbg:#e9f6ec;--shadow:0 1px 2px rgba(94,26,57,.06),0 10px 30px -18px rgba(214,51,108,.35);--ring:rgba(214,51,108,.28)}
@media (prefers-color-scheme:dark){:root{--bg:#1a0f15;--card:#25161f;--ink:#f7e8ef;--head:#ffd6e6;--muted:#c49cb1;--line:#3f2533;--soft:#2d1b25;--accent:#e64980;--accent2:#ff6b9d;--good:#3fb950;--bad:#ff6b6b;--warn:#e3b341;--warnbg:#2a2410;--badbg:#2d1a1a;--goodbg:#15271a;--shadow:0 1px 2px rgba(0,0,0,.3),0 12px 32px -18px rgba(0,0,0,.6);--ring:rgba(230,73,128,.4)}}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;min-height:100vh;background:var(--bg);background-image:radial-gradient(900px 360px at 85% -80px,rgba(214,51,108,.10),transparent 70%);color:var(--ink);font:16px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;font-variant-numeric:tabular-nums;display:flex;flex-direction:column}
a{color:var(--accent);text-decoration:none}a:hover{text-decoration:underline;text-underline-offset:3px}
h1,h2,h3,.brand,.hero p,.num.big{font-family:Fraunces,"Iowan Old Style",Georgia,serif;font-variation-settings:"SOFT" 60;color:var(--head);letter-spacing:-.01em}
h1{font-size:30px;font-weight:600;line-height:1.15;margin:8px 0 18px}h1 .muted{font-weight:400;color:var(--muted)}
h2{font-size:21px;font-weight:600;line-height:1.2;margin:26px 0 10px}h2.top{margin-top:0}h2 .muted{font-weight:400;font-size:17px;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;letter-spacing:0}
h3{font-size:17px;margin:14px 0 6px}
header{position:sticky;top:0;z-index:5;background:color-mix(in srgb,var(--card) 88%,transparent);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border-bottom:1px solid var(--line);padding:10px 20px;display:flex;gap:6px;align-items:center;flex-wrap:wrap}
header .brand{display:inline-flex;align-items:center;gap:10px;font-weight:600;font-size:20px;margin-right:auto;color:var(--head)}header .brand:hover{text-decoration:none}
header .logo{width:auto;height:40px;flex:none;margin:-8px 0}
header nav{display:flex;align-items:center;gap:2px;flex-wrap:wrap}
header nav a{color:var(--ink);padding:7px 11px;border-radius:999px;font-size:15px}header nav a:hover{background:var(--soft);text-decoration:none}
header form{margin:0 0 0 6px}header .btn{padding:7px 13px;font-size:14px}
main{width:100%;max-width:1100px;margin:0 auto;padding:22px 20px 32px;flex:1}
.card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:20px;margin-bottom:18px;box-shadow:var(--shadow)}
.card>h2.top a{color:var(--head)}
.hero{display:flex;flex-wrap:wrap;align-items:center;gap:14px 28px;padding:24px}
.hero p{font-size:26px;line-height:1.2;margin:0;flex:1 1 320px}.hero p strong{color:var(--accent);font-weight:700}
.hero .btn.big{flex:0 1 300px;width:auto}
.hero .stamp{flex-basis:100%;margin:0;font-size:14px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:var(--accent);color:#fff;border:0;border-radius:10px;padding:10px 18px;font:600 15px/1.2 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;cursor:pointer;box-shadow:0 1px 0 rgba(0,0,0,.08),0 8px 18px -10px var(--accent);transition:background .15s,transform .15s,box-shadow .15s}
.btn:hover{background:var(--accent2);text-decoration:none}.btn:active{transform:translateY(1px)}
.btn.big{padding:15px 24px;font-size:17px;width:100%;border-radius:12px}
.btn.ghost{background:transparent;color:var(--accent);border:1px solid var(--accent);box-shadow:none}.btn.ghost:hover{background:var(--soft)}
.btn.danger{background:var(--bad)}
.btn:focus-visible,a:focus-visible{outline:3px solid var(--ring);outline-offset:2px}input:focus-visible,textarea:focus-visible{outline:none;box-shadow:0 0 0 3px var(--ring)}
.muted{color:var(--muted)}.good{color:var(--good)}.bad{color:var(--bad)}.warn{color:var(--warn)}
.tag{display:inline-flex;align-items:center;gap:5px;border-radius:999px;padding:2px 9px;font-size:12px;font-weight:600;line-height:1.5;background:var(--soft);color:var(--muted);border:1px solid var(--line);white-space:nowrap;vertical-align:middle}
.tag.warn{background:var(--warnbg);color:var(--warn);border-color:transparent}.tag.bad{background:var(--badbg);color:var(--bad);border-color:transparent}.tag.good{background:var(--goodbg);color:var(--good);border-color:transparent}
.take{font-family:Fraunces,"Iowan Old Style",Georgia,serif;font-variation-settings:"SOFT" 60;font-size:19px;line-height:1.25;margin:12px 0 0}.take a{color:var(--head)}
.tags{display:flex;flex-wrap:wrap;gap:6px;margin:14px 0 12px}
.tablewrap{overflow-x:auto;margin:0 -8px;padding:0 8px}
table{border-collapse:collapse;width:100%;font-size:14px}
th,td{text-align:left;padding:9px 10px;border-bottom:1px solid var(--line);white-space:nowrap;vertical-align:middle}
th{color:var(--muted);font-weight:500;font-size:13px}
tr:last-child td{border-bottom:0}tbody tr:hover td,table tr:hover td{background:var(--soft)}table tr:first-child:hover th{background:transparent}
td.num,th.num{text-align:right}td.num{font-weight:500}td.num.proj,td.proj{font-weight:700;color:var(--head)}
td.slot{font-size:12px;font-weight:700;color:var(--muted)}td.slot span{display:inline-block;padding:2px 7px;border-radius:6px;background:var(--soft);border:1px solid var(--line)}
td.player{font-weight:600}
tr.me td{font-weight:700;color:var(--head);background:var(--soft)}
ul.plain{list-style:none;padding:0;margin:0}ul.plain li{padding:10px 0;border-bottom:1px solid var(--line)}ul.plain li:last-child{border:0}
.grid{display:grid;gap:18px;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));align-items:start}
.kv{display:flex;justify-content:space-between;align-items:baseline;gap:12px;padding:6px 0;border-bottom:1px dashed var(--line)}.kv:last-of-type{border-bottom:0}.kv>span:first-child{color:var(--muted)}
.flash{display:flex;gap:10px;align-items:flex-start;background:var(--warnbg);color:var(--warn);border-radius:12px;padding:12px 14px;margin-bottom:14px;font-weight:500}
.flash::before{content:"";flex:none;width:8px;height:8px;border-radius:50%;background:currentColor;margin-top:7px}
input[type=text],input[type=password],textarea{width:100%;padding:11px 12px;border:1px solid var(--line);border-radius:10px;background:var(--soft);color:var(--ink);font-size:16px;transition:border-color .15s,box-shadow .15s}
input:focus,textarea:focus{border-color:var(--accent);background:var(--card)}
label{display:block;font-weight:600;margin:14px 0 6px}
.move{position:relative;padding:9px 12px 9px 16px;border-radius:10px;margin:6px 0;background:var(--soft);border:1px solid var(--line);font-size:15px}
.move::before{content:"";position:absolute;left:0;top:8px;bottom:8px;width:3px;border-radius:3px;background:var(--muted)}
.move.start::before{background:var(--good)}.move.sit::before{background:var(--bad)}
.move b{font-weight:700;letter-spacing:.02em;font-size:12px;margin-right:6px}.move.start b{color:var(--good)}.move.sit b{color:var(--bad)}
.note{display:flex;gap:9px;align-items:flex-start;color:var(--warn);padding:5px 0;font-size:14.5px}
.note::before{content:"";flex:none;width:7px;height:7px;border-radius:50%;background:currentColor;margin-top:8px}
.tabs{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 18px}.tabs a{padding:7px 14px;border:1px solid var(--line);border-radius:999px;background:var(--card);color:var(--ink);font-size:14px;font-weight:500}
.tabs a:hover{border-color:var(--accent);color:var(--accent);text-decoration:none}
.right{float:right}.small{font-size:13px}
.bench li{display:flex;justify-content:space-between;align-items:center;gap:10px}.bench .num{font-weight:600}
.login{max-width:420px;margin:48px auto;text-align:center;padding:32px 28px}
.login .logo{width:auto;height:150px;margin:0 auto 14px;display:block;filter:drop-shadow(0 10px 16px rgba(214,51,108,.22))}
.login h1{margin:0 0 4px}.login .lede{margin:0 0 22px;color:var(--muted)}
.login label{text-align:left}.login .btn{margin-top:8px}
.stamp{color:var(--muted);font-size:14px}
footer{color:var(--muted);font-size:13px;text-align:center;padding:24px 20px 32px;max-width:60ch;margin:0 auto}
@media (max-width:640px){header .logo{height:34px}.login .logo{height:120px}main{padding:16px 14px 28px}.card{padding:16px;border-radius:14px}h1{font-size:26px}.hero{padding:20px}.hero p{font-size:22px}.hero .btn.big{flex-basis:100%}header{padding:8px 12px}header nav a{padding:6px 8px;font-size:14px}}
.btn.small{padding:6px 12px;font-size:13px;border-radius:8px}
select{width:100%;padding:11px 12px;border:1px solid var(--line);border-radius:10px;background:var(--soft);color:var(--ink);font-size:16px}
select:focus{border-color:var(--accent);outline:none;box-shadow:0 0 0 3px var(--ring)}
.analyst .headline{font-family:Fraunces,"Iowan Old Style",Georgia,serif;font-variation-settings:"SOFT" 60;font-size:24px;line-height:1.2;color:var(--head);margin:0 0 10px;font-weight:600}
.analyst p{margin:0 0 10px;max-width:70ch}.analyst p:last-of-type{margin-bottom:0}.analyst .by{margin-top:12px}
.trades{display:grid;gap:14px}
.trade{border:1px solid var(--line);border-radius:14px;padding:14px 16px;background:var(--soft)}
.trade .head{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;margin-bottom:10px}.trade .head strong{font-size:16px}
.trade .gain{margin-left:auto;display:flex;gap:8px;flex-wrap:wrap}
.swap{display:grid;grid-template-columns:1fr auto 1fr;gap:10px 14px;align-items:center}
.swap .side{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:10px 12px}
.swap .side .lbl{font-size:12px;color:var(--muted);margin-bottom:4px}.swap .side div+div{margin-top:4px}
.swap .arrow{color:var(--accent);font-size:22px;line-height:1}
.trade .pitch{margin:12px 0 0;font-size:14.5px;max-width:80ch}.trade .act{margin:12px 0 0}
.confirm .swap{margin:14px 0}
@media (max-width:640px){.swap{grid-template-columns:1fr}.swap .arrow{transform:rotate(90deg);text-align:center}}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}`;

// The mascot (public/logo.png, served as a static asset) in the header and on the login card.
export const LOGO = `<img class="logo" src="/logo.png" alt="" width="355" height="640">`;
const HEAD = `<link rel="icon" href="/favicon.png" type="image/png"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT@9..144,400..700,60&display=swap">`;
// A recommended move is a START or a SIT; colour its edge accordingly.
export const move = (m) => `<div class="move ${/^START\b/.test(m) ? "start" : /^SIT\b/.test(m) ? "sit" : ""}">${esc(m)}</div>`;
export const note = (w) => `<div class="note">${esc(w)}</div>`;

export function layout(title, body, { authed = false, flash = [] } = {}) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>${HEAD}<style>${CSS}</style></head><body>
<header><a class="brand" href="/">${LOGO}Fantasy Advisor</a>
${authed ? `<nav><a href="/">Leagues</a><a href="/lineups">Set lineups</a><a href="/settings">Settings</a></nav><form method="post" action="/logout"><button class="btn ghost" type="submit">Log out</button></form>` : ""}
</header><main>${flash.map((m) => `<div class="flash">${esc(m)}</div>`).join("")}${body}</main>
<footer>Projections are ESPN's. Nothing here guarantees a win; it just stops points being left on the bench.</footer></body></html>`;
}

export const loginPage = (configured, flash = []) => layout("Log in", `
<div class="card login">${LOGO}<h1>Fantasy Advisor</h1>
<p class="lede">Every league, the best lineup, one button.</p>
${configured ? "" : `<p class="bad">APP_PASSWORD is not set on the server, so nobody can log in yet.</p>`}
<form method="post"><label for="password">Passphrase</label>
<input type="password" id="password" name="password" autofocus autocomplete="current-password">
<p><button class="btn big" type="submit">Enter</button></p></form></div>`, { flash });

export const errorPage = (message, authed) => layout("Problem", `<div class="card"><h1>Something went wrong</h1><p>${esc(message)}</p>
<p class="muted">If this mentions a 401 or cookies, the ESPN login expired. Update the cookies under Settings.</p>
<p><a class="btn ghost" href="/">Back</a></p></div>`, { authed });

export const settingsPage = (s, csrf, flash = []) => layout("Settings", `
<div class="card" style="max-width:640px"><h1 style="margin-top:0">ESPN connection</h1>
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
      rows.push(`<tr><td class="slot"><span>${esc(slot)}</span></td><td class="player">${esc(p.name)}</td><td>${esc(p.pos)}</td><td>${esc(p.team)}</td><td>${esc(p.opp)}</td>
<td class="num">${p.opp_rank ? "#" + p.opp_rank : ""}</td><td class="num proj">${pts(p.proj)}</td><td class="num">${p.recent_avg != null ? pts(p.recent_avg) : ""}</td>
<td>${p.notes ? `<span class="tag ${bad ? "bad" : "warn"}">${esc(p.notes)}</span>` : ""}</td></tr>`);
    }
    for (let i = (lineup[slot] || []).length; i < (r.slot_counts[slot] || 0); i++) {
      rows.push(`<tr><td class="slot"><span>${esc(slot)}</span></td><td class="player bad">EMPTY</td><td></td><td></td><td></td><td></td><td class="num proj">0.0</td><td></td><td><span class="tag bad">nobody eligible</span></td></tr>`);
    }
  }
  return `<div class="tablewrap"><table><tr><th>Slot</th><th>Player</th><th>Pos</th><th>Team</th><th>Opp</th><th class="num">Opp rank</th><th class="num">Proj</th><th class="num">Last 3</th><th>Notes</th></tr>${rows.join("")}</table></div>`;
}

export function indexPage({ bundles, errors, totalMoves, season, now }) {
  const live = bundles.filter((b) => b.started);
  const when = new Date(now).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/New_York" });
  let top = "";
  if (live.length) {
    top = `<div class="card hero">${totalMoves
      ? `<p><strong>${totalMoves}</strong> lineup change${totalMoves !== 1 ? "s" : ""} recommended across your leagues.</p><a class="btn big" href="/lineups">Set all lineups</a>`
      : `<p>Every lineup already matches the projections. Nothing to change right now.</p><a class="btn ghost big" href="/lineups">Review anyway</a>`}
<p class="stamp">Data as of ${esc(when)} ET. <a href="/?refresh=1">Refresh from ESPN</a></p></div>`;
  }
  const cards = bundles.map((b) => {
    if (!b.started) return `<div class="card"><h2 class="top"><a href="/league/${b.league_id}">${esc(b.name)}</a></h2><p class="muted">Not started this season (no draft or rosters yet).</p></div>`;
    const r = b.report, d = r.recommended_lineup_proj - r.current_lineup_proj;
    return `<div class="card"><h2 class="top"><a href="/league/${b.league_id}">${esc(b.name)}</a></h2>
<div class="kv"><span>${esc(r.team)}</span><strong>${esc(r.record)}</strong></div>
<div class="kv"><span>Week ${r.week} vs ${esc(r.opponent)}</span><span class="muted">${esc(r.opponent_record)}</span></div>
<div class="kv"><span>ESPN projection</span><span>${pts(r.espn_projection.me)} <span class="muted">vs ${pts(r.espn_projection.opponent)}</span></span></div>
<div class="kv"><span>Lineup as set / best</span><span>${pts(r.current_lineup_proj)} / <strong>${pts(r.recommended_lineup_proj)}</strong> ${d > 0 ? `<span class="good">(+${pts(d)})</span>` : ""}</span></div>
${b.analyst ? `<p class="take"><a href="/league/${b.league_id}#analyst">${esc(b.analyst.headline)}</a></p>` : ""}
<div class="tags">${r.lineup_items.length ? `<span class="tag warn">${plural(r.lineup_items.length, "change")}</span>` : `<span class="tag good">lineup set</span>`}
${b.problem_count ? `<span class="tag bad">${plural(b.problem_count, "problem")}</span>` : ""}
${b.trades && b.trades.length ? `<span class="tag">${plural(b.trades.length, "trade idea")}</span>` : ""}</div>
${r.moves.map(move).join("")}
${r.warnings.map(note).join("")}</div>`;
  });
  return layout("Your leagues", `<h1>Your leagues, ${esc(season)}</h1>${errors.map((e) => `<div class="flash">${esc(e)}</div>`).join("")}${top}<div class="grid">${cards.join("")}</div>`, { authed: true });
}

export function leaguePage(b) {
  const r = b.report;
  const sides = (s) => `<strong>${esc(s.team)}</strong> (${esc(s.record)}) ${pts(s.espn_proj)}/${pts(s.best_lineup_proj)}`;
  const waivers = Object.keys(r.waivers).length
    ? `<div class="tablewrap"><table><tr><th>Pos</th><th>Player</th><th>Team</th><th>Opp</th><th class="num">Proj</th><th>Why</th><th class="num">Owned</th><th></th></tr>
${Object.entries(r.waivers).map(([pos, picks]) => picks.map((d) => d.error
        ? `<tr><td class="slot"><span>${esc(pos)}</span></td><td colspan="7" class="muted">could not load: ${esc(d.error)}</td></tr>`
        : `<tr><td class="slot"><span>${esc(pos)}</span></td><td class="player">${esc(d.name)}${d.on_waivers ? ` <span class="tag">waivers</span>` : ""}</td><td>${esc(d.team)}</td><td>${esc(d.opp)}</td><td class="num proj">${pts(d.proj)}</td>
<td>${d.fills_empty_slot ? `<span class="tag bad">fills your EMPTY slot</span>` : `<span class="good">+${pts(d.edge)}</span>`}</td>
<td class="num">${d.owned != null ? Math.round(d.owned) + "%" : ""}</td>
<td>${d.player_id != null ? `<a class="btn small" href="/add?league=${r.league_id}&amp;player=${d.player_id}">${d.on_waivers ? "Claim" : "Add"}</a>` : ""}</td></tr>`).join("")).join("")}</table></div>`
    : `<p class="good">No free agent out-projects your starters this week.</p>`;
  const trades = b.trades && b.trades.length
    ? `<div class="trades">${b.trades.map((t) => tradeCard(r, t, true)).join("")}</div>`
    : `<p class="muted">Nothing that clearly helps you without hurting the other side. Check back as injuries change things.</p>`;
  const analyst = b.analyst ? `<div class="card analyst" id="analyst"><h2 class="top">Analyst's take</h2><p class="headline">${esc(b.analyst.headline)}</p>
${b.analyst.paragraphs.map((p) => `<p>${esc(p)}</p>`).join("")}
<p class="stamp by">${b.analyst.source === "claude" ? "Written by Claude from this week's numbers." : "Built from this week's numbers."}</p></div>` : "";
  const body = `<h1>${esc(r.league)} <span class="muted">week ${r.week}</span></h1>
<div class="tabs"><a href="#analyst">Analyst</a><a href="#lineup">Lineup</a><a href="#opponent">Opponent</a><a href="#waivers">Waivers</a><a href="#trades">Trades</a><a href="#league">League</a><a href="#schedule">Schedule</a><a href="#standings">Standings</a></div>
${analyst}
<div class="card" id="lineup">
<div class="kv"><strong>${esc(r.team)} (${esc(r.record)})</strong><span>vs ${esc(r.opponent)} (${esc(r.opponent_record)})</span></div>
<div class="kv"><span>ESPN projects</span><span>you ${pts(r.espn_projection.me)}, them ${pts(r.espn_projection.opponent)}</span></div>
<div class="kv"><span>Your starters as set / recommended</span><span>${pts(r.current_lineup_proj)} / <strong>${pts(r.recommended_lineup_proj)}</strong></span></div>
${r.lineup_items.length ? `<p><a class="btn" href="/lineups?league=${r.league_id}">Set this lineup (${plural(r.lineup_items.length, "change")})</a></p>` : ""}
<h2>Recommended lineup</h2>${lineupTable(r, r.recommended)}
<h2>Changes to make</h2>${r.moves.length ? r.moves.map(move).join("") : `<p class="good">None. Your lineup already matches the projections.</p>`}
${r.warnings.length ? `<h2>Watch out</h2>${r.warnings.map(note).join("")}` : ""}
<h2>Bench</h2><ul class="plain bench">${r.bench.map((p) => `<li><span><strong>${esc(p.name)}</strong> <span class="muted">${esc(p.pos)} ${esc(p.team)}</span></span><span><span class="num">${pts(p.proj)}</span> ${p.notes ? `<span class="tag warn">${esc(p.notes)}</span>` : ""}</span></li>`).join("")}</ul></div>
<div class="card" id="opponent"><h2 class="top">Opponent: ${esc(r.opponent)} <span class="muted">best possible ${pts(r.opponent_best_proj)}</span></h2>
${lineupTable(r, r.opponent_lineup)}${r.opponent_issues.length ? note(`Their problems as set: ${r.opponent_issues.join("; ")}`) : ""}</div>
<div class="card" id="waivers"><h2 class="top">Waiver watch</h2><p class="muted">Free agents projected above your weakest starter at that position this week. Adding and dropping is left to you.</p>${waivers}</div>
<div class="card" id="trades"><h2 class="top">Trade ideas</h2><p class="muted">One-for-one and two-player packages, ranked by what your best lineup gains per week for the rest of the season and filtered to offers the other side could reasonably accept. Values blend ESPN's season projection with results so far. Proposing sends the offer through ESPN; the other manager still has to accept.</p>${trades}</div>
<div class="card" id="league"><h2 class="top">All matchups, week ${r.week}</h2><p class="muted">ESPN projection / best possible from each roster.</p>
<ul class="plain">${r.matchups.map((s) => `<li>${s.length === 2 ? `${sides(s[0])} vs ${sides(s[1])}${[s[0].team_id, s[1].team_id].includes(r.team_id) ? ` <span class="tag">you</span>` : ""}` : s.length ? `${esc(s[0].team)} has a bye` : ""}
${s.filter((x) => x.problems.length).map((x) => `<div class="note small">${esc(x.team)}: ${esc(x.problems.join("; "))}</div>`).join("")}</li>`).join("")}</ul>
<h2>League injury report</h2><ul class="plain">${r.injury_report.map((t) => `<li><strong>${esc(t.team)}</strong>${t.team_id === r.team_id ? ` <span class="tag">you</span>` : ""}: ${t.injuries.length ? esc(t.injuries.join("; ")) : `<span class="good">healthy</span>`}</li>`).join("")}</ul></div>
<div class="card" id="schedule">${r.results.length ? `<h2 class="top">Season so far</h2><div class="tablewrap"><table><tr><th>Wk</th><th></th><th>Score</th><th>Opponent</th></tr>
${r.results.map((e) => `<tr><td>${e.week}</td><td class="${e.result === "W" ? "good" : "bad"}">${esc(e.result)}</td><td>${e.score != null && e.opp_score != null ? `${pts(e.score)} - ${pts(e.opp_score)}` : ""}</td><td>${esc(e.opponent)}</td></tr>`).join("")}</table></div>` : ""}
${r.schedule.length ? `<h2>Remaining schedule</h2><div class="tablewrap"><table><tr><th>Wk</th><th>Opponent</th><th>Record</th><th class="num">Avg PF</th><th>Injuries</th></tr>
${r.schedule.map((e) => `<tr><td>${e.week}</td><td>${esc(e.opponent)}</td><td>${esc(e.record)}</td><td class="num">${pts(e.avg_pf)}</td><td>${esc(e.injuries.join("; "))}</td></tr>`).join("")}</table></div>` : ""}</div>
<div class="card" id="standings"><h2 class="top">Standings</h2><div class="tablewrap"><table><tr><th>#</th><th>Team</th><th>Record</th><th class="num">PF</th><th class="num">Avg</th><th class="num">PA</th></tr>
${r.standings.map((t) => `<tr${t.team_id === r.team_id ? ' class="me"' : ""}><td>${t.rank}</td><td>${esc(t.team)}</td><td>${esc(t.record)}</td><td class="num">${pts(t.pf)}</td><td class="num">${pts(t.avg_pf)}</td><td class="num">${pts(t.pa)}</td></tr>`).join("")}</table></div></div>
<p class="stamp">Data as of ${esc(r.generated_at)} UTC. <a href="/league/${r.league_id}?refresh=1">Refresh from ESPN</a></p>`;
  return layout(r.league, body, { authed: true });
}

function tradeCard(r, t, withButton) {
  const side = (label, ps) => `<div class="side"><div class="lbl">${label}</div>${ps.map((p) => `<div><strong>${esc(p.name)}</strong> <span class="muted">${esc(p.pos)}${p.team ? ` ${esc(p.team)}` : ""}, ${pts(p.value)}/wk</span></div>`).join("")}</div>`;
  return `<div class="trade"><div class="head"><strong>${esc(t.with)}</strong><span class="tag">${esc(t.kind)}</span>
<span class="gain"><span class="tag good">you +${pts(t.my_gain)}/wk</span><span class="tag ${t.their_gain >= 0 ? "good" : "warn"}">them ${t.their_gain >= 0 ? "+" : "-"}${Math.abs(t.their_gain).toFixed(1)}/wk</span></span></div>
<div class="swap">${side("You send", t.give)}<div class="arrow">&#8644;</div>${side("You get", t.get)}</div>
<p class="pitch">${esc(t.pitch)}</p>
${withButton ? `<p class="act"><a class="btn" href="/trade?league=${r.league_id}&amp;id=${esc(t.id)}">Propose this trade on ESPN</a></p>` : ""}</div>`;
}

export function tradePage(b, t, csrf, result = null) {
  const r = b.report;
  if (result) {
    return layout("Trade proposed", `<h1>${result.ok ? "Trade proposed" : "ESPN did not take the trade"}</h1>
<div class="card"><p class="${result.ok ? "good" : "bad"}">${esc(result.message)}</p>
${result.ok ? `<p class="muted">You can see and withdraw the offer under your team's trades on ESPN. Nothing changes on your roster until ${esc(t.with)} accepts.</p>`
  : `<p class="muted">Nothing was sent. If this keeps happening, propose it on ESPN by hand; if it mentions a 401 or cookies, update the ESPN cookies under Settings.</p>`}
${tradeCard(r, t, false)}</div>
<p><a class="btn ghost" href="/league/${r.league_id}#trades">Back to ${esc(r.league)}</a></p>`, { authed: true });
  }
  return layout("Propose trade", `<h1>Propose a trade <span class="muted">${esc(r.league)}</span></h1>
<div class="card confirm"><p>This sends the offer below to <strong>${esc(t.with)}</strong> through ESPN. They get the usual ESPN notice and accept or decline there; your roster does not change until they accept.</p>
${tradeCard(r, t, false)}
<form method="post" action="/trade"><input type="hidden" name="csrf" value="${esc(csrf)}"><input type="hidden" name="league" value="${r.league_id}"><input type="hidden" name="id" value="${esc(t.id)}">
<button class="btn big" type="submit">Send this offer to ${esc(t.with)}</button></form>
<p class="stamp">Press once. If you change your mind afterwards, withdraw the offer on ESPN.</p></div>
<p><a class="btn ghost" href="/league/${r.league_id}#trades">Back</a></p>`, { authed: true });
}

export function addPage(b, pick, csrf, { drop = null, bid = 0, waiver = false, flash = null, result = null } = {}) {
  const r = b.report;
  const who = `<strong>${esc(pick.name)}</strong> <span class="muted">${esc(pick.pos)} ${esc(pick.team)}, ${pts(pick.proj)} proj this week</span>`;
  if (result) {
    return layout(result.ok ? "Done" : "Problem", `<h1>${result.ok ? (waiver ? "Claim submitted" : "Added") : "ESPN did not make the move"}</h1>
<div class="card"><p class="${result.ok ? "good" : "bad"}">${esc(result.message)}</p>
<p>${waiver ? "Claim" : "Add"}: ${who}${drop ? `<br>Drop: <strong>${esc(drop.name)}</strong> <span class="muted">${esc(drop.pos)} ${esc(drop.team)}</span>` : ""}${waiver && r.budget_left != null ? `<br>Bid: $${bid}` : ""}</p>
${result.ok ? `<p class="muted">${waiver ? "Once ESPN processes the claim, come back and set the lineup." : "He is on your bench. Set the lineup to start him where he belongs."}</p>`
  : `<p class="muted">Nothing changed on your roster. If this keeps happening, make the move on ESPN by hand; if it mentions a 401 or cookies, update the ESPN cookies under Settings.</p>`}</div>
<p><a class="btn" href="/league/${r.league_id}?refresh=1">Back to ${esc(r.league)}</a></p>`, { authed: true });
  }
  const cands = r.drop_candidates || [];
  const needDrop = r.open_spots <= 0;
  const options = (needDrop ? "" : `<option value=""${!drop ? " selected" : ""}>Nobody; you have ${plural(r.open_spots, "open roster spot")}</option>`)
    + cands.map((c) => `<option value="${c.player_id}"${drop && drop.player_id === c.player_id ? " selected" : ""}>${esc(c.name)} (${esc(c.pos)} ${esc(c.team)}, ${pts(c.value)}/wk${c.starter ? ", recommended starter" : ""}${c.notes ? `, ${esc(c.notes)}` : ""})</option>`).join("");
  const why = drop ? `<p class="muted">Why ${esc(drop.name)}: ${esc(drop.reason)}.</p>` : "";
  return layout(waiver ? "Claim player" : "Add player", `<h1>${waiver ? "Claim" : "Add"} ${esc(pick.name)} <span class="muted">${esc(r.league)}</span></h1>
${flash ? `<div class="flash">${esc(flash)}</div>` : ""}
<div class="card confirm"><p>${who}. ${pick.fills_empty_slot ? `He fills a slot you cannot fill from your roster.` : `He out-projects your weakest ${esc(pick.pos)} starter by ${pts(pick.edge)} this week.`}
${waiver ? ` He is on waivers, so this is a claim: ESPN processes it on the league's waiver schedule and he joins your team only if the claim wins.` : ` He is a free agent, so the add is immediate.`}</p>
<form method="post" action="/add"><input type="hidden" name="csrf" value="${esc(csrf)}"><input type="hidden" name="league" value="${r.league_id}"><input type="hidden" name="player" value="${pick.player_id}">
<label for="drop">Drop${needDrop ? " (your roster is full)" : ""}</label><select id="drop" name="drop">${options}</select>${why}
${waiver && r.budget_left != null ? `<label for="bid">Bid (you have $${r.budget_left} left)</label><input type="text" id="bid" name="bid" value="${bid}" inputmode="numeric" pattern="[0-9]*">` : ""}
<p><button class="btn big" type="submit">${waiver ? "Submit claim" : "Add"}${drop ? ` and drop ${esc(drop.name)}` : ""}</button></p></form>
<p class="stamp">Press once. Dropping a player sends him to waivers on ESPN; there is no undo from here.</p></div>
<p><a class="btn ghost" href="/league/${r.league_id}#waivers">Back</a></p>`, { authed: true });
}

export function lineupsPage({ bundles, results, only, csrf }) {
  if (!results) {
    const any = bundles.reduce((n, b) => n + b.report.lineup_items.length, 0);
    const body = `<h1>Set ${only ? "this lineup" : "all lineups"}</h1>
<p class="muted">This is exactly what will be sent to ESPN. Only slot changes: nobody is added or dropped, locked players are left alone, and IR is never touched.</p>
${bundles.map((b) => `<div class="card"><h2 class="top">${esc(b.name)} <span class="muted">week ${b.week}</span></h2>
${b.report.lineup_items.length ? `<ul class="plain">${b.report.lineup_items.map((it) => `<li><strong>${esc(it.name)}</strong>: <span class="muted">${esc(it.from)}</span> &rarr; <strong>${esc(it.to)}</strong></li>`).join("")}</ul>
<p class="stamp">Projected: ${pts(b.report.current_lineup_proj)} &rarr; <strong>${pts(b.report.recommended_lineup_proj)}</strong></p>` : `<p class="good">Already set. No changes.</p>`}</div>`).join("")}
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
