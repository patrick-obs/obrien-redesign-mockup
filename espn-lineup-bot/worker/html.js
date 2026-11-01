// Server-rendered pages. The CSS constant is also the <style> block in templates/base.html (keep them identical).
export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const pts = (v) => (v === null || v === undefined || isNaN(Number(v)) || Number(v) < 0) ? "n/a" : Number(v).toFixed(1);
const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;

const CSS = `:root{--bg:#f6f1f4;--card:#fff;--ink:#1d1d1f;--head:#1d1d1f;--muted:#6f676c;--faint:#9b9399;--line:rgba(60,20,40,.11);--soft:#f6f0f3;--fill:rgba(120,90,105,.1);--accent:#d6336c;--accent2:#bf2a5e;--tint:rgba(214,51,108,.12);--good:#248a3d;--bad:#d70015;--warn:#b25000;--goodbg:#e6f5ea;--badbg:#fde9ea;--warnbg:#fff0e3;--shadow:0 1px 2px rgba(30,10,20,.04),0 10px 28px -14px rgba(60,20,40,.16);--ring:rgba(214,51,108,.35);--seg:rgba(120,90,105,.12)}
@media (prefers-color-scheme:dark){:root{--bg:#141013;--card:#211a1e;--ink:#f5f5f7;--head:#fff;--muted:#a7a0a5;--faint:#7d7579;--line:rgba(255,255,255,.1);--soft:#2a2227;--fill:rgba(255,255,255,.08);--accent:#ff5c8a;--accent2:#ff7aa0;--tint:rgba(255,92,138,.18);--good:#30d158;--bad:#ff453a;--warn:#ff9f0a;--goodbg:rgba(48,209,88,.16);--badbg:rgba(255,69,58,.16);--warnbg:rgba(255,159,10,.16);--shadow:none;--ring:rgba(255,92,138,.45);--seg:rgba(255,255,255,.1)}}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{margin:0;min-height:100vh;background:var(--bg);color:var(--ink);font:16px/1.47 -apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",Roboto,Helvetica,Arial,sans-serif;font-variant-numeric:tabular-nums;-webkit-font-smoothing:antialiased;display:flex;flex-direction:column}
a{color:var(--accent);text-decoration:none}a:hover{text-decoration:underline;text-underline-offset:3px}
h1,h2,h3{color:var(--head);letter-spacing:-.02em;font-weight:700;margin:0}
h1{font-size:34px;line-height:1.12;margin:6px 0 20px}h1 .muted{font-weight:500;letter-spacing:-.01em;color:var(--muted)}
h2{font-size:22px;line-height:1.2;margin:28px 0 12px}h2.top{margin-top:0}h2 .muted{font-weight:500;font-size:17px;letter-spacing:0}
h3{font-size:17px;margin:16px 0 8px}
header{position:sticky;top:0;z-index:5;background:color-mix(in srgb,var(--card) 78%,transparent);backdrop-filter:saturate(180%) blur(20px);-webkit-backdrop-filter:saturate(180%) blur(20px);border-bottom:1px solid var(--line);padding:8px 20px;display:flex;gap:6px;align-items:center;flex-wrap:wrap;min-height:52px}
header .brand{display:inline-flex;align-items:center;gap:10px;font-weight:600;font-size:17px;letter-spacing:-.01em;margin-right:auto;color:var(--head)}header .brand:hover{text-decoration:none}
header .logo{width:auto;height:36px;flex:none;margin:-6px 0}
header nav{display:flex;align-items:center;gap:2px;flex-wrap:wrap}
header nav a{color:var(--accent);padding:7px 10px;border-radius:9px;font-size:15px;font-weight:500}header nav a:hover{background:var(--tint);text-decoration:none}
header form{margin:0 0 0 6px}header .btn{padding:6px 12px;font-size:14px}
main{width:100%;max-width:1080px;margin:0 auto;padding:24px 20px 40px;flex:1}
.card{background:var(--card);border-radius:18px;padding:20px;margin-bottom:18px;box-shadow:var(--shadow);scroll-margin-top:118px}
@media (prefers-color-scheme:dark){.card{border:1px solid var(--line)}}
.card>h2.top a{color:var(--head)}
.lede{color:var(--muted);font-size:17px;margin:-8px 0 18px;max-width:70ch}
.group{border-radius:14px;background:var(--soft);overflow:hidden;margin:8px 0}
.row{display:flex;align-items:center;gap:12px;padding:10px 14px;min-height:50px}
.row+.row{border-top:1px solid var(--line)}
.row .main{flex:1;min-width:0}.row .main .t{font-weight:600;line-height:1.25}.row .main .s{font-size:13px;color:var(--muted);line-height:1.3;margin-top:1px}
.row .trail{text-align:right;flex:none;display:flex;align-items:center;gap:8px}.row .trail .v{font-weight:600}.row .trail .m{color:var(--muted);font-size:14px}
.row.link{color:inherit}.row.link:hover{text-decoration:none;background:var(--fill)}
.chev{width:8px;height:14px;flex:none;color:var(--faint)}
.av{position:relative;width:40px;height:40px;border-radius:50%;background:var(--fill);flex:none;overflow:hidden;display:inline-flex;align-items:center;justify-content:center;vertical-align:middle}
.av i{font-style:normal;font-size:13px;font-weight:700;color:var(--muted);letter-spacing:.02em}
.av img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 15%}
.av.logo img{object-fit:contain;padding:6px}.av.sm{width:32px;height:32px}.av.sm i{font-size:11px}.av.lg{width:56px;height:56px}
.badge{position:relative;width:36px;height:36px;border-radius:10px;background:var(--tint);color:var(--accent);flex:none;overflow:hidden;display:inline-flex;align-items:center;justify-content:center;vertical-align:middle}
.badge i{font-style:normal;font-size:12px;font-weight:700}.badge img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.badge.sm{width:28px;height:28px;border-radius:8px}.badge.sm i{font-size:10px}.badge.lg{width:56px;height:56px;border-radius:14px}.badge.lg i{font-size:18px}
.tm{display:inline-flex;align-items:center;gap:6px;vertical-align:middle}.tm .nfl{width:20px;height:20px;object-fit:contain;flex:none}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:var(--accent);color:#fff;border:0;border-radius:12px;padding:10px 18px;font:600 15px/1.2 -apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",Roboto,Helvetica,Arial,sans-serif;cursor:pointer;transition:background .15s,transform .1s,opacity .15s;white-space:nowrap}
.btn:hover{background:var(--accent2);text-decoration:none}.btn:active{transform:scale(.985)}
.btn.big{padding:15px 24px;font-size:17px;width:100%;border-radius:14px}
.btn.ghost{background:var(--tint);color:var(--accent)}.btn.ghost:hover{background:color-mix(in srgb,var(--accent) 22%,transparent)}
.btn.small{padding:6px 12px;font-size:13px;border-radius:9px}.btn.danger{background:var(--bad)}
.btn:focus-visible,a:focus-visible{outline:3px solid var(--ring);outline-offset:2px}
input:focus-visible,textarea:focus-visible,select:focus-visible{outline:none;box-shadow:0 0 0 3px var(--ring)}
.muted{color:var(--muted)}.good{color:var(--good)}.bad{color:var(--bad)}.warn{color:var(--warn)}
.tag{display:inline-flex;align-items:center;gap:5px;border-radius:999px;padding:3px 9px;font-size:12px;font-weight:600;line-height:1.4;background:var(--fill);color:var(--muted);white-space:nowrap;vertical-align:middle}
.tag.warn{background:var(--warnbg);color:var(--warn)}.tag.bad{background:var(--badbg);color:var(--bad)}.tag.good{background:var(--goodbg);color:var(--good)}.tag.tint{background:var(--tint);color:var(--accent)}
.tags{display:flex;flex-wrap:wrap;gap:6px;margin:14px 0 12px}
.tablewrap{overflow-x:auto;margin:0 -8px;padding:0 8px}
table{border-collapse:collapse;width:100%;font-size:15px}
th,td{text-align:left;padding:9px 10px;border-bottom:1px solid var(--line);white-space:nowrap;vertical-align:middle}
th{color:var(--muted);font-weight:500;font-size:13px}
tr:last-child td{border-bottom:0}
td.num,th.num{text-align:right}td.num{font-weight:500}td.proj{font-weight:700;color:var(--head);font-size:16px}
td.slot{font-size:12px;font-weight:700;color:var(--muted);width:1%}td.slot span{display:inline-block;padding:3px 7px;border-radius:7px;background:var(--fill)}
td.player{font-weight:600}td.who{padding-top:6px;padding-bottom:6px}
.who .cell{display:flex;align-items:center;gap:10px}.who .cell .t{font-weight:600;line-height:1.2}.who .cell .s{font-size:12.5px;color:var(--muted);line-height:1.2;margin-top:2px}
.rank{display:inline-block;font-size:11px;font-weight:700;color:var(--muted);background:var(--fill);border-radius:6px;padding:1px 5px;margin-left:4px;vertical-align:middle}
.rank.ez{color:var(--good);background:var(--goodbg)}.rank.hard{color:var(--bad);background:var(--badbg)}
tr.me td{font-weight:700;color:var(--head);background:var(--tint)}
ul.plain{list-style:none;padding:0;margin:0}ul.plain li{padding:10px 0;border-bottom:1px solid var(--line)}ul.plain li:last-child{border:0}
.grid{display:grid;gap:18px;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));align-items:start}
.kv{display:flex;justify-content:space-between;align-items:baseline;gap:12px;padding:9px 0;border-bottom:1px solid var(--line)}.kv:last-of-type{border-bottom:0}.kv>span:first-child{color:var(--muted)}
.flash{display:flex;gap:10px;align-items:flex-start;background:var(--warnbg);color:var(--warn);border-radius:14px;padding:12px 14px;margin-bottom:14px;font-weight:500}
.flash svg{width:18px;height:18px;flex:none;margin-top:2px}
input[type=text],input[type=password],textarea,select{width:100%;padding:12px 14px;border:0;border-radius:12px;background:var(--soft);color:var(--ink);font-size:17px;font-family:inherit}
label{display:block;font-weight:600;margin:14px 0 6px;font-size:15px}
.move{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:12px;margin:6px 0;background:var(--soft);font-size:15px}
.move svg{width:22px;height:22px;flex:none}.move.start svg{color:var(--good)}.move.sit svg{color:var(--bad)}.move svg.neutral{color:var(--muted)}
.note{display:flex;gap:9px;align-items:flex-start;color:var(--warn);padding:6px 0;font-size:14.5px}
.note svg{width:18px;height:18px;flex:none;margin-top:2px}
.seg{display:flex;gap:2px;padding:3px;background:var(--seg);border-radius:11px;margin:0 0 20px;overflow-x:auto;position:sticky;top:58px;z-index:4;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}
.seg a{flex:1 0 auto;text-align:center;padding:7px 12px;border-radius:9px;font-size:14px;font-weight:600;color:var(--ink);white-space:nowrap}
.seg a:hover{text-decoration:none}.seg a.on{background:var(--card);box-shadow:0 1px 4px rgba(0,0,0,.12)}
.tabs{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 18px}.tabs a{padding:7px 14px;border-radius:999px;background:var(--fill);color:var(--ink);font-size:14px;font-weight:500}
.right{float:right}.small{font-size:13px}
.hero{display:flex;flex-wrap:wrap;align-items:center;gap:14px 28px;padding:24px}
.hero p{font-size:28px;line-height:1.15;margin:0;flex:1 1 320px;font-weight:700;letter-spacing:-.02em;color:var(--head)}.hero p strong{color:var(--accent)}
.hero .btn.big{flex:0 1 300px;width:auto}.hero p.stamp{flex-basis:100%;margin:0;font-size:14px;font-weight:400;letter-spacing:0;color:var(--muted)}
.lg-head{display:flex;align-items:center;gap:12px;margin-bottom:12px}.lg-head .main{flex:1;min-width:0}.lg-head .t{font-size:20px;font-weight:700;letter-spacing:-.02em;line-height:1.2}.lg-head .t a{color:var(--head)}.lg-head .s{color:var(--muted);font-size:14px}
.lg-head .rec{font-size:26px;font-weight:800;letter-spacing:-.03em;color:var(--head)}
.take{font-size:18px;font-weight:600;letter-spacing:-.015em;line-height:1.25;margin:12px 0 0}.take a{color:var(--head)}
.matchup{display:grid;grid-template-columns:1fr auto 1fr;gap:12px;align-items:start;padding:6px 0 12px}
.matchup .side{display:flex;flex-direction:column;align-items:flex-start;gap:4px;min-width:0}.matchup .side.them{align-items:flex-end;text-align:right}
.matchup .nm{font-weight:700;font-size:17px;letter-spacing:-.01em;line-height:1.2}.matchup .rec{color:var(--muted);font-size:14px}
.matchup .big{font-size:40px;font-weight:800;letter-spacing:-.04em;line-height:1;margin-top:6px;color:var(--head)}.matchup .big.dim{color:var(--muted)}
.matchup .sub{font-size:13px;color:var(--muted)}
.matchup .vs{align-self:center;font-size:13px;font-weight:700;color:var(--faint);padding:0 6px}
.bar{height:6px;border-radius:3px;background:var(--fill);overflow:hidden;margin:0 0 16px}.bar i{display:block;height:100%;background:var(--accent);border-radius:3px}
.analyst .headline{font-size:26px;font-weight:700;letter-spacing:-.025em;line-height:1.15;color:var(--head);margin:0 0 12px}
.analyst p{margin:0 0 10px;max-width:72ch;font-size:17px}.analyst p:last-of-type{margin-bottom:0}.analyst .by{margin-top:12px;font-size:13px}
.trades{display:grid;gap:14px}
.trade{border-radius:16px;padding:14px 16px;background:var(--soft)}
.trade .head{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;margin-bottom:10px}.trade .head .nm{font-weight:700;font-size:16px}
.trade .gain{margin-left:auto;display:flex;gap:6px;flex-wrap:wrap}
.swap{display:grid;grid-template-columns:1fr auto 1fr;gap:10px 14px;align-items:stretch}
.swap .side{background:var(--card);border-radius:12px;padding:8px 12px}
.swap .side .lbl{font-size:12px;font-weight:600;color:var(--muted);margin:2px 0 6px}
.swap .p{display:flex;align-items:center;gap:10px;padding:6px 0}.swap .p+.p{border-top:1px solid var(--line)}.swap .p .t{font-weight:600;line-height:1.2}.swap .p .s{font-size:12.5px;color:var(--muted)}
.swap .arrow{align-self:center;color:var(--accent)}.swap .arrow svg{width:26px;height:26px}
.trade .pitch{margin:12px 0 0;font-size:15px;max-width:80ch}.trade .act{margin:12px 0 0}
.confirm .swap{margin:14px 0}
.login{max-width:420px;margin:48px auto;text-align:center;padding:32px 28px}
.login .logo{width:auto;height:150px;margin:0 auto 14px;display:block;filter:drop-shadow(0 10px 16px rgba(214,51,108,.22))}
.login h1{margin:0 0 4px;font-size:28px}.login .lede{margin:0 0 22px}.login label{text-align:left}.login .btn{margin-top:8px}
.stamp{color:var(--muted);font-size:14px}
footer{color:var(--faint);font-size:13px;text-align:center;padding:24px 20px 36px;max-width:60ch;margin:0 auto}
@media (max-width:640px){main{padding:16px 14px 28px}.card{padding:16px;border-radius:16px}h1{font-size:30px}h2{font-size:20px}.hero{padding:20px}.hero p{font-size:24px}.hero .btn.big{flex-basis:100%}header{padding:8px 12px}header .logo{height:32px}header nav a{padding:6px 8px;font-size:14px}.login .logo{height:120px}.swap{grid-template-columns:1fr}.swap .arrow{text-align:center}.swap .arrow svg{transform:rotate(90deg)}.matchup .big{font-size:32px}.seg{top:54px;margin:0 -14px 18px;padding:3px 14px;border-radius:0}}
@media (prefers-reduced-motion:reduce){*{transition:none!important}html{scroll-behavior:auto}}`;

// ------------------------------------------------------------------ small pieces

// The mascot (public/logo.png, served as a static asset) in the header and on the login card.
export const LOGO = `<img class="logo" src="/logo.png" alt="" width="355" height="640">`;
const HEAD = `<link rel="icon" href="/favicon.png" type="image/png"><link rel="apple-touch-icon" href="/apple-touch-icon.png">`;

// SF Symbols-style glyphs, inline so pages stay a single request.
const I = {
  up: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="12" r="11"/><path d="M12 6.5l5 5.2h-3.2V17h-3.6v-5.3H7z" fill="#fff"/></svg>`,
  down: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="12" r="11"/><path d="M12 17.5l-5-5.2h3.2V7h3.6v5.3H17z" fill="#fff"/></svg>`,
  move: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="12" r="11"/><path d="M7 10h7.2V7.5L18 11l-3.8 3.5V12H7zM6 13l3.8-3.5V12H17v2H9.8v2.5z" fill="#fff"/></svg>`,
  warn: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5L23 21H1z"/><path d="M11 9h2v6h-2zm0 7h2v2h-2z" fill="#fff"/></svg>`,
  swap: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h14M14 4l4 4-4 4M20 16H6M10 12l-4 4 4 4"/></svg>`,
  chev: `<svg class="chev" viewBox="0 0 8 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1.5 1.5L6.5 7l-5 5.5"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="12" r="11"/><path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
};

const initials = (name) => String(name || "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
const nflLogo = (abbr) => abbr ? `https://a.espncdn.com/i/teamlogos/nfl/500/${encodeURIComponent(String(abbr).toLowerCase())}.png` : "";
const headshotUrl = (p) => (p.pos === "D/ST" || p.position === "D/ST") ? nflLogo(p.team || p.proTeam) : (p.player_id != null && p.player_id > 0 ? `https://a.espncdn.com/i/headshots/nfl/players/full/${p.player_id}.png` : "");
// Images come from ESPN's public CDN; if one is missing the initials underneath show instead.
const IMG_FALLBACK = `onerror="this.remove()"`;
export const avatar = (p, size = "") => {
  const url = headshotUrl(p), logo = (p.pos || p.position) === "D/ST";
  return `<span class="av${logo ? " logo" : ""}${size ? ` ${size}` : ""}"><i>${esc(initials(p.name))}</i>${url ? `<img src="${esc(url)}" alt="" loading="lazy" ${IMG_FALLBACK}>` : ""}</span>`;
};
export const badge = (name, logo, size = "") => `<span class="badge${size ? ` ${size}` : ""}"><i>${esc(initials(name))}</i>${logo ? `<img src="${esc(logo)}" alt="" loading="lazy" ${IMG_FALLBACK}>` : ""}</span>`;
const nfl = (abbr) => abbr && abbr !== "bye" && abbr !== "None" ? `<span class="tm"><img class="nfl" src="${esc(nflLogo(abbr))}" alt="" loading="lazy" ${IMG_FALLBACK}>${esc(abbr)}</span>` : `<span class="muted">${esc(abbr || "")}</span>`;
const rankChip = (n) => n ? `<span class="rank${n >= 24 ? " ez" : n <= 8 ? " hard" : ""}" title="Opponent's rank against the position; 32 is the softest">#${n}</span>` : "";

// A recommended move is a START or a SIT; colour its glyph accordingly.
export const move = (m) => {
  const kind = /^START\b/.test(m) ? "start" : /^SIT\b/.test(m) ? "sit" : "";
  return `<div class="move ${kind}">${kind === "start" ? I.up : kind === "sit" ? I.down : I.move.replace("<svg", '<svg class="neutral"')}<span>${esc(m)}</span></div>`;
};
export const note = (w) => `<div class="note">${I.warn}<span>${esc(w)}</span></div>`;
const flashBox = (m) => `<div class="flash">${I.warn}<span>${esc(m)}</span></div>`;

// Segmented control that follows the section in view.
const SEG_JS = `<script>(function(){var s=document.querySelector('.seg');if(!s||!('IntersectionObserver'in window))return;var links=[].slice.call(s.querySelectorAll('a'));var map={};links.forEach(function(a){map[a.getAttribute('href').slice(1)]=a});var cur=null;var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){var a=map[e.target.id];if(a&&a!==cur){if(cur)cur.classList.remove('on');a.classList.add('on');cur=a}}})},{rootMargin:'-30% 0px -60% 0px'});Object.keys(map).forEach(function(id){var el=document.getElementById(id);if(el)io.observe(el)})})();</script>`;

export function layout(title, body, { authed = false, flash = [], script = "" } = {}) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>${HEAD}<style>${CSS}</style></head><body>
<header><a class="brand" href="/">${LOGO}Fantasy Advisor</a>
${authed ? `<nav><a href="/">Leagues</a><a href="/lineups">Set lineups</a><a href="/settings">Settings</a></nav><form method="post" action="/logout"><button class="btn ghost" type="submit">Log out</button></form>` : ""}
</header><main>${flash.map(flashBox).join("")}${body}</main>
<footer>Projections are ESPN's. Nothing here guarantees a win; it just stops points being left on the bench.</footer>${script}</body></html>`;
}

// ------------------------------------------------------------------ simple pages

export const loginPage = (configured, flash = []) => layout("Log in", `
<div class="card login">${LOGO}<h1>Fantasy Advisor</h1>
<p class="lede">Every league, the best lineup, one button.</p>
${configured ? "" : `<p class="bad">APP_PASSWORD is not set on the server, so nobody can log in yet.</p>`}
<form method="post"><label for="password">Passphrase</label>
<input type="password" id="password" name="password" autofocus autocomplete="current-password">
<p><button class="btn big" type="submit">Enter</button></p></form></div>`, { flash });

export const errorPage = (message, authed) => layout("Problem", `<h1>Something went wrong</h1><div class="card"><p>${esc(message)}</p>
<p class="muted">If this mentions a 401 or cookies, the ESPN login expired. Update the cookies under Settings.</p>
<p><a class="btn ghost" href="/">Back</a></p></div>`, { authed });

export const settingsPage = (s, csrf, flash = []) => layout("Settings", `
<h1>ESPN connection</h1><div class="card" style="max-width:640px">
<p class="muted">These two cookies let the app read your leagues and set your lineups. Get them from fantasy.espn.com while logged in: press F12, open Application, then Cookies, then https://fantasy.espn.com. They expire now and then; paste fresh ones when the app says it cannot load a league.</p>
<form method="post"><input type="hidden" name="csrf" value="${esc(csrf)}">
<label for="swid">SWID (keep the curly braces)</label><input type="text" id="swid" name="swid" value="${esc(s.swid)}" autocomplete="off">
<label for="espn_s2">espn_s2</label><textarea id="espn_s2" name="espn_s2" rows="4" autocomplete="off">${esc(s.espn_s2)}</textarea>
<p class="muted">Season: ${esc(s.season)}</p><p><button class="btn" type="submit">Save and test</button></p></form></div>
${s.claude ? `<h2>Analyst</h2><div class="card" style="max-width:640px"><div class="group">
<div class="row"><div class="main"><div class="t">Claude rewrite</div><div class="s">${s.claude.hasKey ? (s.claude.enabled ? "On. Claude rewrites each league's take when the report is rebuilt." : "Off (ANALYST_ENABLED is 0). The rules-based take is shown.") : "No ANTHROPIC_API_KEY secret on the Worker, so the rules-based take is shown."}</div></div><div class="trail"><span class="tag ${s.claude.enabled ? "good" : ""}">${s.claude.enabled ? "on" : "off"}</span></div></div>
<div class="row"><div class="main"><div class="t">Calls today</div><div class="s">Resets at midnight UTC. Each league rebuild is one short call; pages are cached for ${Math.round((s.cacheSeconds || 600) / 60)} minutes.</div></div><div class="trail"><span class="v">${s.claude.today}</span><span class="m">/ ${s.claude.cap}</span></div></div>
</div><p class="stamp">Change the cap with the ANALYST_DAILY_CAP variable on the Worker; set ANALYST_ENABLED to 0 to switch Claude off without removing the key.</p></div>` : ""}`, { authed: true, flash });

// ------------------------------------------------------------------ shared blocks

const playerCell = (p, sub) => `<div class="cell">${avatar(p, "sm")}<div><div class="t">${esc(p.name)}</div><div class="s">${esc(sub ?? `${p.pos}${p.team ? ` · ${p.team}` : ""}`)}</div></div></div>`;

function lineupTable(r, lineup) {
  const rows = [];
  for (const slot of r.slot_order) {
    for (const p of lineup[slot] || []) {
      const bad = p.bye || ["OUT", "INJURY_RESERVE", "SUSPENSION"].includes(p.status);
      rows.push(`<tr><td class="slot"><span>${esc(slot)}</span></td><td class="player who">${playerCell(p)}</td><td>${nfl(p.opp)}${rankChip(p.opp_rank)}</td>
<td class="num proj">${pts(p.proj)}</td><td class="num">${p.recent_avg != null ? pts(p.recent_avg) : ""}</td>
<td>${p.notes ? `<span class="tag ${bad ? "bad" : "warn"}">${esc(p.notes)}</span>` : ""}</td></tr>`);
    }
    for (let i = (lineup[slot] || []).length; i < (r.slot_counts[slot] || 0); i++) {
      rows.push(`<tr><td class="slot"><span>${esc(slot)}</span></td><td class="player bad">EMPTY</td><td></td><td class="num proj">0.0</td><td></td><td><span class="tag bad">nobody eligible</span></td></tr>`);
    }
  }
  return `<div class="tablewrap"><table><tr><th>Slot</th><th>Player</th><th>Opponent</th><th class="num">Proj</th><th class="num">Last 3</th><th>Status</th></tr>${rows.join("")}</table></div>`;
}

const teamRow = (name, logo, sub, trail, href) => `<${href ? `a href="${href}" class="row link"` : 'div class="row"'}>${badge(name, logo)}<div class="main"><div class="t">${esc(name)}</div>${sub ? `<div class="s">${sub}</div>` : ""}</div><div class="trail">${trail || ""}${href ? I.chev : ""}</div></${href ? "a" : "div"}>`;

// ------------------------------------------------------------------ dashboard

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
    if (!b.started) return `<div class="card"><div class="lg-head">${badge(b.name, "")}<div class="main"><div class="t"><a href="/league/${b.league_id}">${esc(b.name)}</a></div><div class="s">Not started this season (no draft or rosters yet).</div></div></div></div>`;
    const r = b.report, d = r.recommended_lineup_proj - r.current_lineup_proj;
    return `<div class="card">
<div class="lg-head">${badge(r.team, r.logo)}<div class="main"><div class="t"><a href="/league/${b.league_id}">${esc(b.name)}</a></div><div class="s">${esc(r.team)}</div></div><div class="rec">${esc(r.record)}</div></div>
<div class="group">
<div class="row">${badge(r.opponent, r.opponent_logo, "sm")}<div class="main"><div class="t">Week ${r.week} vs ${esc(r.opponent)}</div><div class="s">${esc(r.opponent_record)}</div></div><div class="trail"><span class="v">${pts(r.espn_projection.me)}</span><span class="m">vs ${pts(r.espn_projection.opponent)}</span></div></div>
<div class="row"><div class="main"><div class="t">Lineup as set / best</div><div class="s">ESPN projection of your starters</div></div><div class="trail"><span class="m">${pts(r.current_lineup_proj)} /</span><span class="v">${pts(r.recommended_lineup_proj)}</span>${d > 0 ? `<span class="tag good">+${pts(d)}</span>` : ""}</div></div>
</div>
${b.analyst ? `<p class="take"><a href="/league/${b.league_id}#analyst">${esc(b.analyst.headline)}</a></p>` : ""}
<div class="tags">${r.lineup_items.length ? `<span class="tag warn">${plural(r.lineup_items.length, "change")}</span>` : `<span class="tag good">lineup set</span>`}
${b.problem_count ? `<span class="tag bad">${plural(b.problem_count, "problem")}</span>` : ""}
${b.trades && b.trades.length ? `<span class="tag tint">${plural(b.trades.length, "trade idea")}</span>` : ""}</div>
${r.moves.map(move).join("")}
${r.warnings.map(note).join("")}</div>`;
  });
  return layout("Your leagues", `<h1>Your leagues <span class="muted">${esc(season)}</span></h1>${errors.map(flashBox).join("")}${top}<div class="grid">${cards.join("")}</div>`, { authed: true });
}

// ------------------------------------------------------------------ league page

export function leaguePage(b) {
  const r = b.report;
  const waivers = Object.keys(r.waivers).length
    ? `<div class="tablewrap"><table><tr><th>Slot</th><th>Player</th><th>Opponent</th><th class="num">Proj</th><th>Why</th><th class="num">Owned</th><th></th></tr>
${Object.entries(r.waivers).map(([pos, picks]) => picks.map((d) => d.error
        ? `<tr><td class="slot"><span>${esc(pos)}</span></td><td colspan="6" class="muted">could not load: ${esc(d.error)}</td></tr>`
        : `<tr><td class="slot"><span>${esc(pos)}</span></td><td class="player who">${playerCell({ ...d, pos: d.pos || pos }, `${d.pos || pos}${d.team ? ` · ${d.team}` : ""}${d.on_waivers ? " · on waivers" : ""}`)}</td><td>${nfl(d.opp)}</td><td class="num proj">${pts(d.proj)}</td>
<td>${d.fills_empty_slot ? `<span class="tag bad">fills your EMPTY slot</span>` : `<span class="tag good">+${pts(d.edge)} over your worst starter</span>`}</td>
<td class="num">${d.owned != null ? Math.round(d.owned) + "%" : ""}</td>
<td>${d.player_id != null ? `<a class="btn small" href="/add?league=${r.league_id}&amp;player=${d.player_id}">${d.on_waivers ? "Claim" : "Add"}</a>` : ""}</td></tr>`).join("")).join("")}</table></div>`
    : `<p class="good">No free agent out-projects your starters this week.</p>`;
  const trades = b.trades && b.trades.length
    ? `<div class="trades">${b.trades.map((t) => tradeCard(r, t, true)).join("")}</div>`
    : `<p class="muted">Nothing that clearly helps you without hurting the other side. Check back as injuries change things.</p>`;
  const analyst = b.analyst ? `<div class="card analyst" id="analyst"><h2 class="top">Analyst's take</h2><p class="headline">${esc(b.analyst.headline)}</p>
${b.analyst.paragraphs.map((p) => `<p>${esc(p)}</p>`).join("")}
<p class="stamp by">${b.analyst.source === "claude" ? "Written by Claude from this week's numbers." : "Built from this week's numbers."}</p></div>` : "";
  const total = Math.max(0.1, r.recommended_lineup_proj + Math.max(0, r.opponent_best_proj));
  const share = Math.round((r.recommended_lineup_proj / total) * 100);
  const matchup = `<div class="matchup">
<div class="side">${badge(r.team, r.logo, "lg")}<div class="nm">${esc(r.team)}</div><div class="rec">${esc(r.record)}</div><div class="big">${pts(r.recommended_lineup_proj)}</div><div class="sub">best lineup · ${pts(r.current_lineup_proj)} as set · ESPN says ${pts(r.espn_projection.me)}</div></div>
<div class="vs">VS</div>
<div class="side them">${badge(r.opponent, r.opponent_logo, "lg")}<div class="nm">${esc(r.opponent)}</div><div class="rec">${esc(r.opponent_record)}</div><div class="big dim">${pts(r.opponent_best_proj)}</div><div class="sub">best possible · ESPN says ${pts(r.espn_projection.opponent)}</div></div>
</div><div class="bar"><i style="width:${share}%"></i></div>`;
  const matchRow = (s) => `${badge(s.team, s.logo, "sm")}<span><strong>${esc(s.team)}</strong> <span class="muted">${esc(s.record)} · ${pts(s.espn_proj)} / ${pts(s.best_lineup_proj)}</span></span>`;
  const body = `<h1>${esc(r.league)} <span class="muted">week ${r.week}</span></h1>
<div class="seg"><a href="#analyst">Analyst</a><a href="#lineup">Lineup</a><a href="#opponent">Opponent</a><a href="#waivers">Waivers</a><a href="#trades">Trades</a><a href="#league">League</a><a href="#schedule">Schedule</a><a href="#standings">Standings</a></div>
${analyst}
<div class="card" id="lineup">${matchup}
${r.lineup_items.length ? `<p><a class="btn" href="/lineups?league=${r.league_id}">Set this lineup (${plural(r.lineup_items.length, "change")})</a></p>` : `<p><span class="tag good">${I.check.replace("<svg", '<svg style="width:14px;height:14px"')} lineup already set</span></p>`}
<h2>Recommended lineup</h2>${lineupTable(r, r.recommended)}
<h2>Changes to make</h2>${r.moves.length ? r.moves.map(move).join("") : `<p class="good">None. Your lineup already matches the projections.</p>`}
${r.warnings.length ? `<h2>Watch out</h2>${r.warnings.map(note).join("")}` : ""}
<h2>Bench</h2><div class="group">${r.bench.map((p) => `<div class="row">${avatar(p)}<div class="main"><div class="t">${esc(p.name)}</div><div class="s">${esc(p.pos)} · ${esc(p.team)}${p.opp && p.opp !== "bye" ? ` · vs ${esc(p.opp)}` : ""}</div></div><div class="trail"><span class="v">${pts(p.proj)}</span>${p.notes ? `<span class="tag warn">${esc(p.notes)}</span>` : ""}</div></div>`).join("")}</div></div>
<div class="card" id="opponent"><div class="lg-head">${badge(r.opponent, r.opponent_logo)}<div class="main"><div class="t">${esc(r.opponent)}</div><div class="s">${esc(r.opponent_record)} · best possible ${pts(r.opponent_best_proj)}</div></div></div>
${lineupTable(r, r.opponent_lineup)}${r.opponent_issues.length ? note(`Their problems as set: ${r.opponent_issues.join("; ")}`) : ""}</div>
<div class="card" id="waivers"><h2 class="top">Waiver watch</h2><p class="lede">Free agents projected above your weakest starter at that position this week. Add is immediate; Claim goes through your league's waiver process.</p>${waivers}</div>
<div class="card" id="trades"><h2 class="top">Trade ideas</h2><p class="lede">One-for-one and two-player packages, ranked by what your best lineup gains per week for the rest of the season and filtered to offers the other side could reasonably accept. Proposing sends the offer through ESPN; the other manager still has to accept.</p>${trades}</div>
<div class="card" id="league"><h2 class="top">All matchups, week ${r.week}</h2><p class="lede">ESPN projection / best possible from each roster.</p>
<div class="group">${r.matchups.map((s) => `<div class="row" style="flex-wrap:wrap">${s.length === 2 ? `<span class="tm" style="flex:1 1 260px">${matchRow(s[0])}</span><span class="muted" style="font-weight:700;font-size:12px">VS</span><span class="tm" style="flex:1 1 260px">${matchRow(s[1])}</span>${[s[0].team_id, s[1].team_id].includes(r.team_id) ? `<span class="tag tint">you</span>` : ""}` : s.length ? `${badge(s[0].team, s[0].logo, "sm")}<span>${esc(s[0].team)} has a bye</span>` : ""}
${s.filter((x) => x.problems.length).map((x) => `<div class="note small" style="flex-basis:100%">${I.warn}<span>${esc(x.team)}: ${esc(x.problems.join("; "))}</span></div>`).join("")}</div>`).join("")}</div>
<h2>League injury report</h2><div class="group">${r.injury_report.map((t) => teamRow(t.team, t.logo, t.injuries.length ? esc(t.injuries.join("; ")) : `<span class="good">healthy</span>`, t.team_id === r.team_id ? `<span class="tag tint">you</span>` : "")).join("")}</div></div>
<div class="card" id="schedule">${r.results.length ? `<h2 class="top">Season so far</h2><div class="group">${r.results.map((e) => `<div class="row">${badge(e.opponent, e.opponent_logo, "sm")}<div class="main"><div class="t">Week ${e.week} · ${esc(e.opponent)}</div><div class="s">${esc(e.record)}</div></div><div class="trail"><span class="tag ${e.result === "W" ? "good" : e.result === "L" ? "bad" : ""}">${esc(e.result)}</span><span class="v">${e.score != null && e.opp_score != null ? `${pts(e.score)} – ${pts(e.opp_score)}` : ""}</span></div></div>`).join("")}</div>` : ""}
${r.schedule.length ? `<h2>Remaining schedule</h2><div class="group">${r.schedule.map((e) => `<div class="row">${badge(e.opponent, e.opponent_logo, "sm")}<div class="main"><div class="t">Week ${e.week} · ${esc(e.opponent)}</div><div class="s">${esc(e.record)} · ${pts(e.avg_pf)} a week${e.injuries.length ? ` · ${esc(e.injuries.join("; "))}` : ""}</div></div></div>`).join("")}</div>` : ""}</div>
<div class="card" id="standings"><h2 class="top">Standings</h2><div class="tablewrap"><table><tr><th>#</th><th>Team</th><th>Record</th><th class="num">PF</th><th class="num">Avg</th><th class="num">PA</th></tr>
${r.standings.map((t) => `<tr${t.team_id === r.team_id ? ' class="me"' : ""}><td>${t.rank}</td><td class="who"><div class="cell">${badge(t.team, t.logo, "sm")}<div><div class="t">${esc(t.team)}</div></div></div></td><td>${esc(t.record)}</td><td class="num">${pts(t.pf)}</td><td class="num">${pts(t.avg_pf)}</td><td class="num">${pts(t.pa)}</td></tr>`).join("")}</table></div></div>
<p class="stamp">Data as of ${esc(r.generated_at)} UTC. <a href="/league/${r.league_id}?refresh=1">Refresh from ESPN</a></p>`;
  return layout(r.league, body, { authed: true, script: SEG_JS });
}

// ------------------------------------------------------------------ trades

function tradeCard(r, t, withButton) {
  const side = (label, ps) => `<div class="side"><div class="lbl">${label}</div>${ps.map((p) => `<div class="p">${avatar(p, "sm")}<div><div class="t">${esc(p.name)}</div><div class="s">${esc(p.pos)}${p.team ? ` · ${esc(p.team)}` : ""} · ${pts(p.value)}/wk</div></div></div>`).join("")}</div>`;
  return `<div class="trade"><div class="head">${badge(t.with, t.with_logo, "sm")}<span class="nm">${esc(t.with)}</span><span class="tag">${esc(t.kind)}</span>
<span class="gain"><span class="tag good">you +${pts(t.my_gain)}/wk</span><span class="tag ${t.their_gain >= 0 ? "good" : "warn"}">them ${t.their_gain >= 0 ? "+" : "-"}${Math.abs(t.their_gain).toFixed(1)}/wk</span></span></div>
<div class="swap">${side("You send", t.give)}<div class="arrow">${I.swap}</div>${side("You get", t.get)}</div>
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

// ------------------------------------------------------------------ add / claim

export function addPage(b, pick, csrf, { drop = null, bid = 0, waiver = false, flash = null, result = null } = {}) {
  const r = b.report;
  const who = `<strong>${esc(pick.name)}</strong> <span class="muted">${esc(pick.pos)} ${esc(pick.team)}, ${pts(pick.proj)} proj this week</span>`;
  const pickRow = `<div class="group"><div class="row">${avatar(pick)}<div class="main"><div class="t">${esc(pick.name)}</div><div class="s">${esc(pick.pos)} · ${esc(pick.team)}${pick.opp ? ` · vs ${esc(pick.opp)}` : ""}${pick.owned != null ? ` · owned in ${Math.round(pick.owned)}% of leagues` : ""}</div></div><div class="trail"><span class="v">${pts(pick.proj)}</span><span class="m">proj</span></div></div>
${drop ? `<div class="row">${avatar(drop)}<div class="main"><div class="t">Drop ${esc(drop.name)}</div><div class="s">${esc(drop.pos)} · ${esc(drop.team)} · ${esc(drop.reason)}</div></div><div class="trail"><span class="m">${pts(drop.value)}/wk</span></div></div>` : ""}</div>`;
  if (result) {
    return layout(result.ok ? "Done" : "Problem", `<h1>${result.ok ? (waiver ? "Claim submitted" : "Added") : "ESPN did not make the move"}</h1>
<div class="card"><p class="${result.ok ? "good" : "bad"}">${esc(result.message)}</p>
<p>${waiver ? "Claim" : "Add"}: ${who}${drop ? `<br>Drop: <strong>${esc(drop.name)}</strong> <span class="muted">${esc(drop.pos)} ${esc(drop.team)}</span>` : ""}${waiver && r.budget_left != null ? `<br>Bid: $${bid}` : ""}</p>
${pickRow}
${result.ok ? `<p class="muted">${waiver ? "Once ESPN processes the claim, come back and set the lineup." : "He is on your bench. Set the lineup to start him where he belongs."}</p>`
  : `<p class="muted">Nothing changed on your roster. If this keeps happening, make the move on ESPN by hand; if it mentions a 401 or cookies, update the ESPN cookies under Settings.</p>`}</div>
<p><a class="btn" href="/league/${r.league_id}?refresh=1">Back to ${esc(r.league)}</a></p>`, { authed: true });
  }
  const cands = r.drop_candidates || [];
  const needDrop = r.open_spots <= 0;
  const options = (needDrop ? "" : `<option value=""${!drop ? " selected" : ""}>Nobody; you have ${plural(r.open_spots, "open roster spot")}</option>`)
    + cands.map((c) => `<option value="${c.player_id}"${drop && drop.player_id === c.player_id ? " selected" : ""}>${esc(c.name)} (${esc(c.pos)} ${esc(c.team)}, ${pts(c.value)}/wk${c.starter ? ", recommended starter" : ""}${c.notes ? `, ${esc(c.notes)}` : ""})</option>`).join("");
  return layout(waiver ? "Claim player" : "Add player", `<h1>${waiver ? "Claim" : "Add"} ${esc(pick.name)} <span class="muted">${esc(r.league)}</span></h1>
${flash ? flashBox(flash) : ""}
<div class="card confirm"><p>${who}. ${pick.fills_empty_slot ? `He fills a slot you cannot fill from your roster.` : `He out-projects your weakest ${esc(pick.pos)} starter by ${pts(pick.edge)} this week.`}
${waiver ? ` He is on waivers, so this is a claim: ESPN processes it on the league's waiver schedule and he joins your team only if the claim wins.` : ` He is a free agent, so the add is immediate.`}</p>
${pickRow}
<form method="post" action="/add"><input type="hidden" name="csrf" value="${esc(csrf)}"><input type="hidden" name="league" value="${r.league_id}"><input type="hidden" name="player" value="${pick.player_id}">
<label for="drop">Drop${needDrop ? " (your roster is full)" : ""}</label><select id="drop" name="drop" onchange="this.form.requestSubmit?this.form.submit():0">${options}</select>
${waiver && r.budget_left != null ? `<label for="bid">Bid (you have $${r.budget_left} left)</label><input type="text" id="bid" name="bid" value="${bid}" inputmode="numeric" pattern="[0-9]*">` : ""}
<p><button class="btn big" type="submit">${waiver ? "Submit claim" : "Add"}${drop ? ` and drop ${esc(drop.name)}` : ""}</button></p></form>
<p class="stamp">Press once. Dropping a player sends him to waivers on ESPN; there is no undo from here.</p></div>
<p><a class="btn ghost" href="/league/${r.league_id}#waivers">Back</a></p>`, { authed: true });
}

// ------------------------------------------------------------------ lineups

export function lineupsPage({ bundles, results, only, csrf }) {
  if (!results) {
    const any = bundles.reduce((n, b) => n + b.report.lineup_items.length, 0);
    const body = `<h1>Set ${only ? "this lineup" : "all lineups"}</h1>
<p class="lede">This is exactly what will be sent to ESPN. Only slot changes: nobody is added or dropped, locked players are left alone, and IR is never touched.</p>
${bundles.map((b) => `<div class="card"><div class="lg-head">${badge(b.report.team, b.report.logo)}<div class="main"><div class="t">${esc(b.name)}</div><div class="s">week ${b.week}</div></div></div>
${b.report.lineup_items.length ? `<div class="group">${b.report.lineup_items.map((it) => `<div class="row">${avatar({ name: it.name, player_id: it.playerId, pos: "", team: "" }, "sm")}<div class="main"><div class="t">${esc(it.name)}</div></div><div class="trail"><span class="m">${esc(it.from)}</span>${I.chev}<span class="v">${esc(it.to)}</span></div></div>`).join("")}</div>
<p class="stamp">Projected: ${pts(b.report.current_lineup_proj)} &rarr; <strong>${pts(b.report.recommended_lineup_proj)}</strong></p>` : `<p class="good">Already set. No changes.</p>`}</div>`).join("")}
${any ? `<form method="post" action="/lineups"><input type="hidden" name="csrf" value="${esc(csrf)}">${only ? `<input type="hidden" name="league" value="${esc(only)}">` : ""}
<button class="btn big" type="submit">Confirm and send to ESPN</button></form>
<p class="stamp">Press once. ESPN has no undo for this; if you change your mind, change the lineup back on ESPN or re-run after projections move.</p>` : `<p><a class="btn ghost" href="/">Back</a></p>`}`;
    return layout("Set lineups", body, { authed: true });
  }
  const body = `<h1>Done</h1>${results.map((x) => `<div class="card"><h2 class="top">${esc(x.name)}</h2><p class="${x.result.ok ? "good" : "bad"}">${esc(x.result.message)}</p>
${x.items.length && !x.result.ok ? `<p class="muted">Tried: ${esc(x.items.map((it) => `${it.name} ${it.from}→${it.to}`).join(", "))}</p><p class="muted">Make these on ESPN by hand, then come back. If this keeps failing with 401, update the cookies under Settings.</p>` : ""}</div>`).join("")}
<p><a class="btn" href="/?refresh=1">Back to your leagues</a></p>`;
  return layout("Done", body, { authed: true });
}
