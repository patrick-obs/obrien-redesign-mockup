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
.card{background:var(--card);border-radius:20px;padding:22px;margin-bottom:20px;box-shadow:var(--shadow);scroll-margin-top:118px}
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
.grid{display:grid;gap:20px;grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr));align-items:start}
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
.pct{font-size:34px;font-weight:800;letter-spacing:-.04em;line-height:1;color:var(--head)}.pct.good{color:var(--good)}.pct.bad{color:var(--bad)}.pct.mode{font-size:22px;text-transform:capitalize}
.winline{display:flex;align-items:center;gap:14px;padding:6px 2px 10px;color:inherit}.winline:hover{text-decoration:none}.winline .main{flex:1}.winline .t{font-weight:600}.winline .s{font-size:13px;color:var(--muted)}
.meter{height:8px;border-radius:4px;background:var(--badbg);overflow:hidden;margin:0 0 12px}.meter i{display:block;height:100%;background:var(--good);border-radius:4px}
.todo{margin:12px 0 4px}.todo .lbl,.lbl{font-size:13px;font-weight:600;color:var(--muted);margin:0 0 6px 2px}
.row.primary .t{color:var(--accent)}
.auto{display:flex;align-items:center;gap:6px}.auto svg{width:14px;height:14px;color:var(--accent)}
.notes{margin-top:10px}details.moves{margin-top:10px}details.moves summary{cursor:pointer;font-size:14px;color:var(--muted);font-weight:500;padding:6px 0}
.lock{display:inline-flex;width:16px;height:16px;color:var(--faint);vertical-align:middle}.lock svg{width:16px;height:16px}
td.ours{color:var(--accent);font-weight:600}
.matchup .vs{display:flex;flex-direction:column;align-items:center;gap:2px}
.odds{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px;margin:4px 0 12px}.odds .o{background:var(--soft);border-radius:14px;padding:14px}.odds .o .s{font-size:13px;color:var(--ink);margin-top:6px;font-weight:600}.odds .o .s .muted{font-weight:400}
ol.plan{margin:0 0 8px;padding-left:22px}ol.plan li{margin:0 0 8px;font-size:16px}ol.plan li::marker{color:var(--accent);font-weight:700}
label.row{cursor:pointer;font-weight:400;margin:0}
.switch{appearance:none;-webkit-appearance:none;width:51px;height:31px;border-radius:16px;background:var(--fill);position:relative;outline:none;cursor:pointer;transition:background .2s;margin:0;flex:none}
.switch::after{content:"";position:absolute;top:2px;left:2px;width:27px;height:27px;border-radius:50%;background:#fff;box-shadow:0 2px 6px rgba(0,0,0,.25);transition:transform .2s}
.switch:checked{background:var(--good)}.switch:checked::after{transform:translateX(20px)}
.card.orphan{border:1px dashed var(--line);box-shadow:none;background:transparent}
.pick{display:flex;gap:12px;align-items:flex-start;cursor:pointer}.pick>input{margin-top:16px;width:22px;height:22px;accent-color:var(--accent);flex:none}.pick .trade{flex:1}
.pick-row{cursor:pointer}.pick-row>input{width:22px;height:22px;accent-color:var(--accent);flex:none;margin:0}
.group.ceiling{margin:0 0 14px;background:var(--tint)}.group.ceiling .row{align-items:flex-start}.group.ceiling .move{background:var(--card);margin:6px 0 0}
td .s{font-size:12px;color:var(--muted);line-height:1.2;margin-top:2px;white-space:nowrap}
.runnow{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:0 0 18px}.runnow .btn svg{width:16px;height:16px}
.respond{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:-6px 0 12px}
.luna{width:40px;height:40px;border-radius:50%;flex:none;object-fit:cover}.luna.md{width:44px;height:44px}.luna.lg{width:140px;height:140px}
.luna-hero{align-items:center;gap:22px}.luna-hero .bubble{flex:1 1 320px;position:relative;background:var(--soft);border-radius:18px;padding:18px 20px}
.luna-hero .bubble::before{content:"";position:absolute;left:-10px;top:52px;width:20px;height:20px;background:var(--soft);transform:rotate(45deg);border-radius:4px}
.luna-hero .bubble p{font-size:24px;line-height:1.2;margin:0 0 12px;font-weight:700;letter-spacing:-.02em;color:var(--head)}.luna-hero .bubble p strong{color:var(--accent)}
.luna-hero .bubble .btn.big{width:auto;display:inline-flex}.luna-hero .bubble p.stamp{font-size:14px;font-weight:400;letter-spacing:0;color:var(--muted);margin:10px 0 0}
.pose{height:150px;width:auto;flex:none;filter:drop-shadow(0 8px 14px rgba(214,51,108,.18))}.pose.sm{height:64px;margin:-8px 0}.pose.sm.wide{height:56px}.hero-pose{height:170px}
.narrow{max-width:720px;margin:0 auto}.notes.hurt{display:flex;gap:12px;align-items:flex-start}.notes.hurt>div{flex:1}.pose.xs{height:72px;margin-top:2px}
h1{margin-bottom:22px}.lede{margin-bottom:20px}
.lastweek{display:flex;align-items:center;gap:8px;margin:6px 0 2px;font-size:14px}
.runnow{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
@media (max-width:640px){.hero-pose{height:110px}.pose.sm{height:52px}}
@media (max-width:640px){.luna.lg{width:88px;height:88px}.luna-hero .bubble::before{display:none}}
@media (max-width:640px){main{padding:16px 14px 28px}.card{padding:16px;border-radius:16px}h1{font-size:30px}h2{font-size:20px}.hero{padding:20px}.hero p{font-size:24px}.hero .btn.big{flex-basis:100%}header{padding:8px 12px}header .logo{height:32px}header nav a{padding:6px 8px;font-size:14px}.login .logo{height:120px}.swap{grid-template-columns:1fr}.swap .arrow{text-align:center}.swap .arrow svg{transform:rotate(90deg)}.matchup .big{font-size:32px}.seg{top:54px;margin:0 -14px 18px;padding:3px 14px;border-radius:0}}
@media (prefers-reduced-motion:reduce){*{transition:none!important}html{scroll-behavior:auto}}`;

// ------------------------------------------------------------------ small pieces

// The mascot (public/logo.png, served as a static asset) in the header and on the login card.
export const LOGO = `<img class="logo" src="/logo.png" alt="" width="355" height="640">`;
export const LUNA = (cls = "luna") => `<img class="${cls}" src="/luna-face.png" alt="Luna" width="512" height="512">`;
/** Full-body Luna in a pose: celebrate, think, warn, sleep, football. */
export const POSE = (pose, cls = "pose") => `<img class="${cls}" src="/luna-${pose}.png" alt="Luna ${pose}" loading="lazy">`;
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
  lock: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 10V8a5 5 0 0110 0v2h1a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2v-8a2 2 0 012-2zm2 0h6V8a3 3 0 00-6 0z"/></svg>`,
  bolt: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13 2L4 14h6l-1 8 9-12h-6z"/></svg>`,
};
const pct = (p) => p == null ? "n/a" : `${Math.round(p * 100)}%`;
/** Status chips: amber only for real uncertainty; byes and locks are quiet. */
const statusTag = (p) => {
  if (!p.notes) return "";
  const bad = p.bye || ["OUT", "INJURY_RESERVE", "SUSPENSION"].includes(p.status);
  const bits = [];
  if (p.bye) bits.push(`<span class="tag">bye</span>`);
  if (p.status && p.status !== "ACTIVE") bits.push(`<span class="tag ${bad ? "bad" : "warn"}">${esc(p.status.replace(/_/g, " ").toLowerCase())}</span>`);
  if (p.locked) bits.push(`<span class="lock" title="Locked: his game has started">${I.lock}</span>`);
  return bits.join(" ");
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
${authed ? `<nav><a href="/">Leagues</a><a href="/moves">Recommendations</a><a href="/lineups">Set lineups</a><a href="/settings">Settings</a></nav><form method="post" action="/logout"><button class="btn ghost" type="submit">Log out</button></form>` : ""}
</header><main>${flash.map(flashBox).join("")}${body}</main>
<footer>Luna is a very good dog. Projections are ESPN's; nothing here guarantees a win, it just stops points being left on the bench.</footer>${script}</body></html>`;
}

// ------------------------------------------------------------------ simple pages

export const loginPage = (configured, flash = []) => layout("Log in", `
<div class="card login">${LOGO}<h1>Fantasy Advisor</h1>
<p class="lede">Luna runs the lineups. You take the wins.</p>
${configured ? "" : `<p class="bad">APP_PASSWORD is not set on the server, so nobody can log in yet.</p>`}
<form method="post"><label for="password">Passphrase</label>
<input type="password" id="password" name="password" autofocus autocomplete="current-password">
<p><button class="btn big" type="submit">Enter</button></p></form></div>`, { flash });

export const errorPage = (message, authed) => layout("Problem", `<h1>Hmm.</h1><div class="card"><div class="lg-head">${POSE("warn", "pose sm")}<div class="main"><div class="t">Luna hit a snag</div></div></div><p>${esc(message)}</p>
<p class="muted">If this mentions a 401 or cookies, the ESPN login expired. Update the cookies under Settings.</p>
<p><a class="btn ghost" href="/">Back</a></p></div>`, { authed });

export const settingsPage = (s, csrf, flash = []) => layout("Settings", `
<div class="narrow"><h1>ESPN connection</h1><div class="card">
<p class="muted">These two cookies let the app read your leagues and set your lineups. Get them from fantasy.espn.com while logged in: press F12, open Application, then Cookies, then https://fantasy.espn.com. SWID never changes. espn_s2 normally lasts about a year, but dies if you log out of ESPN on that device or change the password; the dashboard shows a banner the moment ESPN stops accepting it, and nothing is sent to ESPN until you paste a fresh one here.</p>
<form method="post"><input type="hidden" name="csrf" value="${esc(csrf)}">
<label for="swid">SWID (keep the curly braces)</label><input type="text" id="swid" name="swid" value="${esc(s.swid)}" autocomplete="off">
<label for="espn_s2">espn_s2</label><textarea id="espn_s2" name="espn_s2" rows="4" autocomplete="off">${esc(s.espn_s2)}</textarea>
<p class="muted">Season: ${esc(s.season)}</p><p><button class="btn" type="submit">Save and test</button></p></form></div>
<h2>Automation</h2><div class="card"><form method="post"><input type="hidden" name="csrf" value="${esc(csrf)}"><input type="hidden" name="prefs" value="1">
<div class="group">
<label class="row" for="automanage"><div class="main"><div class="t">Luna's autopilot</div><div class="s">The autopilot. On, it runs every four hours and before every slate: sets lineups to the latest recommendation (injury news included), fills real roster holes, sends the recommended offers, withdraws stale ones, watches for acceptances and declines, and moves on to the next-best offer after a no. Off, nothing is sent to ESPN without you pressing a button.</div></div><div class="trail"><input type="hidden" name="automanage" value="0"><input type="checkbox" class="switch" id="automanage" name="automanage" value="1"${s.automanage ? " checked" : ""}></div></label>
<label class="row" for="auto_lineup"><div class="main"><div class="t">Set lineups automatically</div><div class="s">Thursday, Saturday and Sunday at 8am ET, again Thursday at 6pm and Sunday at noon ET, the advisor sets each lineup to the recommendation. The first run of the week sets it; later runs only touch it if the lineup still matches what the advisor set. If you move anyone on ESPN, it leaves that week alone.</div></div><div class="trail"><input type="hidden" name="auto_lineup" value="0"><input type="checkbox" class="switch" id="auto_lineup" name="auto_lineup" value="1"${s.auto_lineup ? " checked" : ""}></div></label>
<label class="row" for="auto_fill_empty"><div class="main"><div class="t">Pickups automatically</div><div class="s">Makes the recommended pickups: a real roster hole, or a free agent or waiver player who beats your weakest starter by 2 or more. Drops are never a recommended starter; one-week bye cover is never bought. Claims use the suggested bid and only go through if you win them. At most two a run.</div></div><div class="trail"><input type="hidden" name="auto_fill_empty" value="0"><input type="checkbox" class="switch" id="auto_fill_empty" name="auto_fill_empty" value="1"${s.auto_fill_empty ? " checked" : ""}></div></label>
<label class="row" for="auto_trades"><div class="main"><div class="t">Trade automatically</div><div class="s">Sends only the recommended set: each offer safe whichever managers accept, worth at least 2 points a week to you, graded acceptable for them, your two best starters protected. At most three offers out per league; a declined package is not re-sent for a week and a manager who declines gets two days of quiet. Offers the engine now rates as likely declined are withdrawn. You can always withdraw on ESPN.</div></div><div class="trail"><input type="hidden" name="auto_trades" value="0"><input type="checkbox" class="switch" id="auto_trades" name="auto_trades" value="1"${s.auto_trades ? " checked" : ""}></div></label>
</div>
${s.auto_leagues && s.auto_leagues.length ? `<h3>Per league</h3><div class="group">${s.auto_leagues.map((lg) => `<label class="row" for="league_auto_${lg.id}"><div class="main"><div class="t">${esc(lg.name)}</div><div class="s">Autopilot for this league only. The master switch above still has to be on.</div></div><div class="trail"><input type="hidden" name="league_auto_${lg.id}" value="0"><input type="checkbox" class="switch" id="league_auto_${lg.id}" name="league_auto_${lg.id}" value="1"${lg.on ? " checked" : ""}></div></label>`).join("")}</div>` : ""}
<p><button class="btn" type="submit">Save preferences</button></p></form>
${s.hidden_leagues && s.hidden_leagues.length ? `<h3>Hidden leagues</h3><div class="group">${s.hidden_leagues.map((lg) => `<div class="row"><div class="main"><div class="t">${esc(lg.name)}</div></div><div class="trail"><form method="post" action="/hide"><input type="hidden" name="csrf" value="${esc(csrf)}"><input type="hidden" name="league" value="${lg.id}"><input type="hidden" name="action" value="show"><button class="btn ghost small" type="submit">Show again</button></form></div></div>`).join("")}</div>` : ""}</div>
<h2>Luna's memory</h2><div class="card"><p class="muted">Luna remembers every package she offered for a week and gives a manager who declined, or whose offer you cancelled on ESPN, two days of quiet. Clear that when you want the best offers on the board sent again now.</p>
<form method="post" action="/settings"><input type="hidden" name="csrf" value="${esc(csrf)}"><input type="hidden" name="forget_trades" value="1"><button class="btn ghost" type="submit">Forget recent offers</button></form></div>
${s.claude ? `<h2>Luna's writing</h2><div class="card"><div class="group">
<div class="row"><div class="main"><div class="t">Claude rewrite</div><div class="s">${s.claude.hasKey ? (s.claude.enabled ? "On. Claude rewrites each league's take when the report is rebuilt." : "Off (ANALYST_ENABLED is 0). The rules-based take is shown.") : "No ANTHROPIC_API_KEY secret on the Worker, so the rules-based take is shown."}</div></div><div class="trail"><span class="tag ${s.claude.enabled ? "good" : ""}">${s.claude.enabled ? "on" : "off"}</span></div></div>
<div class="row"><div class="main"><div class="t">Calls today</div><div class="s">Resets at midnight UTC. Each league rebuild is one short call; pages are cached for ${Math.round((s.cacheSeconds || 600) / 60)} minutes.</div></div><div class="trail"><span class="v">${s.claude.today}</span><span class="m">/ ${s.claude.cap}</span></div></div>
</div><p class="stamp">Change the cap with the ANALYST_DAILY_CAP variable on the Worker; set ANALYST_ENABLED to 0 to switch Claude off without removing the key.</p></div>` : ""}</div>`, { authed: true, flash });

// ------------------------------------------------------------------ shared blocks

const playerCell = (p, sub) => `<div class="cell">${avatar(p, "sm")}<div><div class="t">${esc(p.name)}</div><div class="s">${esc(sub ?? `${p.pos}${p.team ? ` · ${p.team}` : ""}`)}</div></div></div>`;

function lineupTable(r, lineup) {
  const rows = [];
  for (const slot of r.slot_order) {
    for (const p of lineup[slot] || []) {
      const bad = p.bye || ["OUT", "INJURY_RESERVE", "SUSPENSION"].includes(p.status);
      const game = p.implied != null ? `<div class="s">${p.line ? `${esc(p.line)} · ` : ""}implied ${pts(p.implied)}${p.weather && p.weather !== "indoor" ? ` · ${esc(p.weather)}` : p.weather === "indoor" ? " · dome" : ""}${p.wet || p.windy ? ` <span class="tag warn">weather</span>` : ""}</div>` : "";
      rows.push(`<tr><td class="slot"><span>${esc(slot)}</span></td><td class="player who">${playerCell(p)}</td><td><div>${nfl(p.opp)}${rankChip(p.opp_rank)}</div>${game}</td>
<td class="num proj">${pts(p.proj)}</td><td class="num ours">${p.our_proj != null ? pts(p.our_proj) : ""}</td><td class="num">${p.recent_avg != null ? pts(p.recent_avg) : ""}${p.sd != null ? `<div class="s">${pts(p.floor)}–${pts(p.ceiling)}</div>` : ""}</td>
<td>${statusTag(p)}</td></tr>`);
    }
    for (let i = (lineup[slot] || []).length; i < (r.slot_counts[slot] || 0); i++) {
      rows.push(`<tr><td class="slot"><span>${esc(slot)}</span></td><td class="player bad">EMPTY</td><td></td><td class="num proj">0.0</td><td></td><td></td><td><span class="tag bad">nobody eligible</span></td></tr>`);
    }
  }
  return `<div class="tablewrap"><table><tr><th>Slot</th><th>Player</th><th>Opponent</th><th class="num" title="ESPN's projection">ESPN</th><th class="num" title="Our projection: ESPN blended with his last three games and season average, adjusted for the opponent">Advisor</th><th class="num" title="Average of the last three games; the range underneath is projection minus/plus his weekly volatility">Last 3 · range</th><th>Status</th></tr>${rows.join("")}</table></div>`;
}

const teamRow = (name, logo, sub, trail, href) => `<${href ? `a href="${href}" class="row link"` : 'div class="row"'}>${badge(name, logo)}<div class="main"><div class="t">${esc(name)}</div>${sub ? `<div class="s">${sub}</div>` : ""}</div><div class="trail">${trail || ""}${href ? I.chev : ""}</div></${href ? "a" : "div"}>`;

// ------------------------------------------------------------------ dashboard

const fmtTime = (ts) => new Date(ts).toLocaleString("en-US", { weekday: "short", hour: "numeric", minute: "2-digit", timeZone: "America/New_York" });

/** The dashboard's "to do" list for one league: always at least one thing to open. */
function todo(b) {
  const r = b.report, items = [];
  if (r.lineup_items.length) items.push({ href: `/lineups?league=${b.league_id}`, text: `Set this lineup`, sub: `${plural(r.lineup_items.length, "change")}, +${pts(r.recommended_lineup_proj - r.current_lineup_proj)} points`, primary: true });
  else items.push({ href: `/league/${b.league_id}#lineup`, text: "Review lineup", sub: "Already optimal; see who starts and why" });
  const picks = Object.entries(r.waivers).flatMap(([pos, ps]) => ps.filter((p) => !p.error && p.player_id != null).map((p) => ({ ...p, pos: p.pos || pos }))).sort((a, b) => ((b.fills_empty_slot && !b.bye_cover) - (a.fills_empty_slot && !a.bye_cover)) || (b.edge - a.edge));
  if (picks[0]) items.push({ href: `/add?league=${b.league_id}&amp;player=${picks[0].player_id}`, text: `${picks[0].on_waivers ? "Claim" : "Add"} ${picks[0].name}`, sub: picks[0].fills_empty_slot ? (picks[0].bye_cover ? `your ${picks[0].pos} slot is empty this week only (${picks[0].returning} is on bye); optional` : `fills your empty ${picks[0].pos} slot`) : `+${pts(picks[0].edge)} over your weakest ${picks[0].pos}`, primary: picks[0].fills_empty_slot && !picks[0].bye_cover });
  if (b.trades && b.trades[0]) items.push({ href: `/trade?league=${b.league_id}&amp;id=${esc(b.trades[0].id)}`, text: `Propose ${b.trades[0].kind} trade to ${b.trades[0].with}`, sub: `+${pts(b.trades[0].my_gain)} a week, ${b.trades[0].their_gain >= 0 ? "they gain too" : "costs them little"}` });
  if (b.trades && b.trades.length > 1) items.push({ href: `/trades?league=${b.league_id}`, text: "Luna's moves", sub: "the offers and pickups to make, one button" });
  items.push({ href: `/league/${b.league_id}#plan`, text: "Luna's game plan", sub: b.season?.odds ? `${b.season.odds.playoff_odds}% playoff odds` : "season strategy" });
  return `<div class="todo"><div class="lbl">To do</div><div class="group">${items.map((it) => `<a class="row link${it.primary ? " primary" : ""}" href="${it.href}"><div class="main"><div class="t">${it.text}</div><div class="s">${it.sub}</div></div><div class="trail">${I.chev}</div></a>`).join("")}</div></div>`;
}

const fmtDay = (ts) => new Date(ts).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/New_York" });
/** "Sent to ESPN": the app's own record of every write, so "what did we send" has an answer. */
function activityList(items) {
  if (!items.length) return `<div class="card"><div class="lg-head">${POSE("pajamas", "pose sm wide")}<div class="main"><div class="t">Luna's log</div><div class="s">everything sent to ESPN, by Luna or by you</div></div></div><p class="muted">Nothing yet. When Luna sets a lineup, picks someone up or sends an offer, it shows up here with ESPN's answer.</p></div>`;
  const line = (e) => e.kind === "trade" ? `Trade offer to ${esc(e.with)}: ${esc(e.give)} for ${esc(e.get)} <span class="muted">(+${pts(e.my_gain)}/wk for you, ${e.their_gain >= 0 ? "+" : "-"}${Math.abs(e.their_gain).toFixed(1)} for them)</span>`
    : e.kind === "claim" ? `${e.ok ? "Waiver claim for" : "Tried a waiver claim for"} ${esc(e.add)}${e.drop ? `, dropping ${esc(e.drop)}` : ""}${e.bid ? ` (bid $${e.bid})` : ""}${e.ok ? "" : "; nothing changed"}`
    : e.kind === "add" ? (e.ok ? `Added ${esc(e.add)}${e.drop ? `, dropped ${esc(e.drop)}` : ""}` : `Tried to add ${esc(e.add)}${e.drop ? ` and drop ${esc(e.drop)}` : ""}; nothing changed`)
    : e.kind === "memory" ? esc(e.message)
    : e.kind === "withdraw" ? `Withdrew offer to ${esc(e.with)}: ${esc(e.give)} for ${esc(e.get)}`
    : e.kind === "settled" ? `${esc(e.message)} <span class="muted">(${esc(e.give)} for ${esc(e.get)})</span>`
    : e.kind === "auth" || e.kind === "incoming" ? esc(e.message)
    : `Lineup set: ${plural(e.changes, "change")}${e.items ? ` <span class="muted">(${esc(e.items.join(", "))})</span>` : ""}`;
  return `<div class="card" id="activity"><div class="lg-head">${LUNA("luna md")}<div class="main"><div class="t">Luna's log</div><div class="s">everything sent to ESPN, by Luna or by you</div></div></div><div class="group">${items.map((e) => `<div class="row"><div class="main"><div class="t">${line(e)}</div><div class="s">${esc(e.league)}${e.week ? ` · week ${e.week}` : ""} · ${esc(fmtDay(e.at))} ET · ${e.by === "auto" ? "Luna" : e.by === "espn" ? "from ESPN" : "by you"}${e.ok || e.kind === "settled" ? "" : ` · <span class="bad">ESPN refused: ${esc(e.message)}</span>`}</div></div><div class="trail"><span class="tag ${e.kind === "settled" ? (e.ok ? "good" : "") : e.ok ? "good" : "bad"}">${e.kind === "settled" ? esc(e.outcome) : e.ok ? (e.kind === "trade" ? "offered" : e.kind === "claim" ? "pending" : "done") : "failed"}</span></div></div>`).join("")}</div></div>`;
}

export function indexPage({ bundles, errors, totalMoves, season, now, csrf = "", hiddenCount = 0, activity = [], automanage = true }) {
  const live = bundles.filter((b) => b.started);
  const when = new Date(now).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/New_York" });
  let top = "";
  if (live.length) {
    const leading = live.some((b) => b.report?.live && (b.report.win_prob ?? 0) >= 0.6), trouble = live.some((b) => b.problem_count > 0) || errors.some((e) => /rejecting the cookies/.test(e));
    const lostWeek = live.length > 0 && live.every((b) => b.report?.last_week ? b.report.last_week.result === "L" : (b.report?.live && b.report.remaining_share <= 0.05 && (b.report.win_prob ?? 1) <= 0.05));
    const locked = live.some((b) => b.season?.plan?.mode === "lock");
    const pose = trouble ? "warn" : totalMoves ? "football" : lostWeek ? "sad" : leading ? "celebrate" : locked ? "trophy" : "think";
    top = `<div class="card hero luna-hero">${POSE(pose, "pose hero-pose")}<div class="bubble">${totalMoves
      ? `<p><strong>${totalMoves}</strong> lineup change${totalMoves !== 1 ? "s" : ""} to make across your leagues. Want me to set them?</p><a class="btn big" href="/lineups">Set all lineups</a>`
      : trouble ? `<p>Lineups are set, but something needs a look. The flags are on the cards below.</p><a class="btn ghost big" href="/lineups">Review lineups</a>`
      : lostWeek ? `<p>Tough week. Next week is already on my list: waivers clear Wednesday and I'll have the lineup ready.</p><a class="btn ghost big" href="/lineups">Review lineups</a>`
      : locked ? `<p>Playoff spot is close to locked. Now we play for seeding and the playoff weeks.</p><a class="btn ghost big" href="/lineups">Review anyway</a>`
      : leading ? `<p>Lineups are set and you're ahead. I'll keep watching the scores and the injury news.</p><a class="btn ghost big" href="/lineups">Review anyway</a>`
      : `<p>Every lineup is already the best one. I'll keep watching for injury news and trade replies.</p><a class="btn ghost big" href="/lineups">Review anyway</a>`}
<p class="stamp">Checked ${esc(when)} ET. <a href="/?refresh=1">Check ESPN again</a></p></div></div>`;
  }
  const cards = bundles.map((b) => {
    if (!b.started) {
      const why = b.orphaned ? `This league was never drafted for ${esc(season)}, so nobody renewed it on ESPN: it is orphaned this year. Ask whoever ran it to reactivate and draft it, or hide it here.`
        : `Not started this season (no draft or rosters yet).`;
      return `<div class="card orphan"><div class="lg-head">${badge(b.name, "")}<div class="main"><div class="t">${esc(b.name)}</div><div class="s">${b.orphaned ? "Not renewed" : "Not started"}${b.teams ? ` · ${plural(b.teams, "team")}` : ""}</div></div></div>
<p class="muted">${why}</p>
<form method="post" action="/hide"><input type="hidden" name="csrf" value="${esc(csrf)}"><input type="hidden" name="league" value="${b.league_id}"><input type="hidden" name="action" value="hide"><button class="btn ghost small" type="submit">Hide this league</button></form></div>`;
    }
    const r = b.report, d = r.recommended_lineup_proj - r.current_lineup_proj, wp = r.win_prob;
    const lastAuto = b.auto?.events?.slice().reverse().find((e) => e.kind === "lineup" && !e.skipped);
    const lastSkip = b.auto?.events?.slice().reverse().find((e) => e.kind === "lineup" && e.skipped);
    return `<div class="card">
<div class="lg-head">${badge(r.team, r.logo)}<div class="main"><div class="t"><a href="/league/${b.league_id}">${esc(b.name)}</a></div><div class="s">${esc(r.team)} · ${esc(r.record)}${b.season?.odds ? ` · ${b.season.odds.playoff_odds}% playoff odds` : ""}</div></div></div>
${r.last_week ? `<div class="lastweek"><span class="tag ${r.last_week.result === "W" ? "good" : r.last_week.result === "L" ? "bad" : ""}">${r.last_week.result === "W" ? "Won" : r.last_week.result === "L" ? "Lost" : "Tied"} week ${r.last_week.week}</span><span class="muted">${pts(r.last_week.me)} – ${pts(r.last_week.opponent)} vs ${esc(r.last_week.opponent_name)}</span></div>` : ""}
<a class="winline" href="/league/${b.league_id}#lineup"><div class="pct ${wp == null ? "" : wp >= 0.6 ? "good" : wp <= 0.4 ? "bad" : ""}">${pct(wp)}</div><div class="main"><div class="t">Win chance vs ${esc(r.opponent)} <span class="muted">week ${r.week}</span></div><div class="s">${r.live ? "Live: from the score so far and what is left to play" : r.last_week ? "Next up. From both lineups as they stand today" : "Before kickoff: from both lineups as set"}</div></div>${I.chev}</a>
<div class="meter"><i style="width:${wp == null ? 50 : Math.round(wp * 100)}%"></i></div>
<div class="group score">
<div class="row"><div class="main"><div class="t">Score now</div><div class="s">${r.live ? "games in progress" : "nothing played yet"}</div></div><div class="trail"><span class="v">${pts(r.score.me)}</span><span class="m">${esc(r.opponent)} ${pts(r.score.opponent)}</span></div></div>
<div class="row"><div class="main"><div class="t">Projected finish</div><div class="s">ESPN, lineups as set${r.advisor ? ` · Advisor says ${pts(r.advisor.me_as_set)} vs ${pts(r.advisor.opponent_as_set)}` : ""}</div></div><div class="trail"><span class="v">${pts(r.projected_finish.me)}</span><span class="m">vs ${pts(r.projected_finish.opponent)}</span></div></div>
<a class="row link" href="/league/${b.league_id}#lineup"><div class="main"><div class="t">Best possible lineup</div><div class="s">${d > 0 ? `${pts(d)} more than the lineup as set` : "your lineup is already the best one"}</div></div><div class="trail"><span class="v">${pts(r.recommended_lineup_proj)}</span>${d > 0 ? `<span class="tag good">+${pts(d)}</span>` : `<span class="tag good">set</span>`}${I.chev}</div></a>
</div>
${todo(b)}
${lastAuto ? `<p class="stamp auto">${I.bolt} Luna set this lineup ${esc(fmtTime(lastAuto.at))} ET (${plural(lastAuto.changes, "change")}).${lastSkip && lastSkip.at > lastAuto.at ? " She left your later changes alone." : ""}</p>` : lastSkip ? `<p class="stamp auto">${I.bolt} Luna left the lineup alone: you changed it on ESPN this week.</p>` : ""}
${b.analyst ? `<p class="take"><a href="/league/${b.league_id}#analyst">${esc(b.analyst.headline)}</a></p>` : ""}
<div class="tags">${r.lineup_items.length ? `<span class="tag warn">${plural(r.lineup_items.length, "change")}</span>` : `<span class="tag good">lineup set</span>`}${b.problem_count ? `<span class="tag bad">${plural(b.problem_count, "problem")}</span>` : ""}${b.trades && b.trades.length ? `<span class="tag tint">${plural(b.trades.length, "trade idea")}</span>` : ""}</div>
${r.warnings.length ? `<div class="notes${r.warnings.some((w) => / is out|injury reserve|doubtful|in IR/i.test(w)) ? " hurt" : ""}">${r.warnings.some((w) => / is out|injury reserve|doubtful|in IR/i.test(w)) ? POSE("cone", "pose xs") : ""}<div>${r.warnings.map(note).join("")}</div></div>` : ""}
${r.moves.length ? `<details class="moves"><summary>${plural(r.moves.length, "lineup change")} recommended</summary>${r.moves.map(move).join("")}</details>` : ""}</div>`;
  });
  const hiddenNote = hiddenCount ? `<p class="stamp">${plural(hiddenCount, "hidden league")}. <a href="/settings">Show again in Settings</a>.</p>` : "";
  const runNow = `<form method="post" action="/autopilot" class="runnow"><input type="hidden" name="csrf" value="${esc(csrf)}"><button class="btn${automanage ? "" : " ghost"}" type="submit">${I.bolt} Let Luna run now</button><span class="stamp">${automanage ? "Lineups, pickups and offers, right now instead of at the next scheduled pass." : "Luna's autopilot is off; turn it on in Settings first."}</span></form>`;
  return layout("Your leagues", `<h1>Your leagues <span class="muted">${esc(season)}</span></h1>${errors.map(flashBox).join("")}${top}<div class="grid">${cards.join("")}</div>${hiddenNote}${runNow}${activityList(activity)}`, { authed: true });
}

// ------------------------------------------------------------------ league page

export function leaguePage(b) {
  const r = b.report;
  const waivers = Object.keys(r.waivers).length
    ? `<div class="tablewrap"><table><tr><th>Slot</th><th>Player</th><th>Opponent</th><th class="num">Proj</th><th>Why</th><th class="num">Owned</th><th></th></tr>
${Object.entries(r.waivers).map(([pos, picks]) => picks.map((d) => d.error
        ? `<tr><td class="slot"><span>${esc(pos)}</span></td><td colspan="6" class="muted">could not load: ${esc(d.error)}</td></tr>`
        : `<tr><td class="slot"><span>${esc(pos)}</span></td><td class="player who">${playerCell({ ...d, pos: d.pos || pos }, `${d.pos || pos}${d.team ? ` · ${d.team}` : ""}${d.on_waivers ? " · on waivers" : ""}`)}</td><td>${nfl(d.opp)}</td><td class="num proj">${pts(d.proj)}</td>
<td>${d.fills_empty_slot ? (d.bye_cover ? `<span class="tag">covers ${esc(d.returning)}'s bye this week only</span>` : `<span class="tag bad">fills your EMPTY slot</span>`) : `<span class="tag good">+${pts(d.edge)} over your worst starter</span>`}</td>
<td class="num">${d.owned != null ? Math.round(d.owned) + "%" : ""}</td>
<td>${d.player_id != null ? `<a class="btn small" href="/add?league=${r.league_id}&amp;player=${d.player_id}">${d.on_waivers ? "Claim" : "Add"}</a>` : ""}</td></tr>`).join("")).join("")}</table></div>`
    : `<p class="good">No free agent out-projects your starters this week.</p>`;
  const trades = b.trades && b.trades.length
    ? `<div class="trades">${b.trades.map((t) => tradeCard(r, t, true)).join("")}</div>`
    : `<p class="muted">Nothing that clearly helps you without hurting the other side. Check back as injuries change things.</p>`;
  const outgoing = (b.pending || []).filter((t) => t.mine), incoming = (b.pending || []).filter((t) => !t.mine);
  const pending = (outgoing.length ? `<h3>Offers out on ESPN</h3><div class="trades">${outgoing.map((t) => pendingCard(r, t)).join("")}</div>` : "")
    + (incoming.length ? `<h3>Offers made to you</h3><div class="trades">${incoming.map((t) => `${pendingCard(r, t)}<form method="post" action="/respond" class="respond"><input type="hidden" name="csrf" value="${esc(b.csrf || "")}"><input type="hidden" name="league" value="${r.league_id}"><input type="hidden" name="tx" value="${esc(String(t.id))}"><button class="btn small" name="action" value="accept" type="submit">Accept</button> <button class="btn ghost small" name="action" value="decline" type="submit">Decline</button><span class="stamp">${t.my_gain == null ? "Not scored." : t.my_gain >= 2 ? "Clearly good for you; the autopilot would accept it." : t.my_gain < 0 ? "Costs you; the autopilot would decline it." : "Marginal; your call."}</span></form>`).join("")}</div>` : "")
    + (r.trades_closed ? `<p class="flash">${I.warn}<span>The trade deadline has passed in this league. No offers can be sent or accepted now; waivers and lineups still work.</span></p>` : r.trade_deadline ? `<p class="stamp">Trade deadline: ${esc(fmtExp(r.trade_deadline))} ET.</p>` : "");
  const analyst = b.analyst ? `<div class="card analyst" id="analyst"><div class="lg-head">${POSE("think", "pose sm")}<div class="main"><div class="t">Luna's take</div><div class="s">${b.analyst.source === "claude" ? "Luna, with a little help from Claude, from this week's numbers" : "Luna, from this week's numbers"}</div></div></div><p class="headline">${esc(b.analyst.headline)}</p>
${b.analyst.paragraphs.map((p) => `<p>${esc(p)}</p>`).join("")}</div>` : "";
  const wp = r.win_prob;
  const matchup = `<div class="matchup">
<div class="side">${badge(r.team, r.logo, "lg")}<div class="nm">${esc(r.team)}</div><div class="rec">${esc(r.record)}</div><div class="big">${pts(r.projected_finish.me)}</div><div class="sub">projected finish · ${pts(r.score.me)} so far</div><div class="sub">best lineup ${pts(r.recommended_lineup_proj)} · Advisor ${pts(r.advisor?.me)}</div></div>
<div class="vs"><div class="pct ${wp == null ? "" : wp >= 0.6 ? "good" : wp <= 0.4 ? "bad" : ""}">${pct(wp)}</div><div class="sub">win chance</div></div>
<div class="side them">${r.no_matchup ? `<div class="nm">No matchup this week</div><div class="sub">playoff bye, eliminated, or not scheduled</div>` : `${badge(r.opponent, r.opponent_logo, "lg")}<div class="nm">${esc(r.opponent)}</div><div class="rec">${esc(r.opponent_record)}</div><div class="big dim">${pts(r.projected_finish.opponent)}</div><div class="sub">projected finish · ${pts(r.score.opponent)} so far</div><div class="sub">best possible ${pts(r.opponent_best_proj)} · Advisor ${pts(r.advisor?.opponent)}</div>`}</div>
</div><div class="meter"><i style="width:${wp == null ? 50 : Math.round(wp * 100)}%"></i></div>
<p class="stamp">Win chance comes from the gap between the two projected finishes and how much of the week is still to play${r.live ? "; it tightens as games finish" : ""}. "Advisor" is our own projection: ESPN blended with each player's last three games and season average, adjusted for the matchup.</p>`;
  const sn = b.season || {};
  const strengthRows = Object.entries(sn.strength || {}).sort((a, b) => a[1].rank - b[1].rank).map(([pos, s]) => `<div class="row"><div class="main"><div class="t">${esc(pos)}</div><div class="s">${pts(s.mine)} a week · league average ${pts(s.league_avg)}</div></div><div class="trail"><span class="tag ${s.rank <= 2 ? "good" : s.rank > Math.ceil(s.teams / 2) ? "bad" : ""}">${s.rank} of ${s.teams}</span></div></div>`).join("");
  const outlookRows = (sn.outlook || []).map((g) => `<div class="row">${badge(g.opponent, g.logo, "sm")}<div class="main"><div class="t">Week ${g.week} · ${esc(g.opponent)}</div><div class="s">${pts(g.avg_pf)} a week</div></div><div class="trail"><span class="tag ${g.win_prob >= 60 ? "good" : g.win_prob < 45 ? "bad" : ""}">${g.win_prob}% win chance</span></div></div>`).join("");
  const plan = sn.plan ? `<div class="card" id="plan"><div class="lg-head">${POSE(sn.plan.mode === "lock" ? "trophy" : "football", "pose sm")}<div class="main"><div class="t">Luna's game plan</div><div class="s">how to win this league, or finish as high as it allows</div></div></div>
<div class="odds"><div class="o"><div class="pct ${sn.odds?.playoff_odds >= 60 ? "good" : sn.odds?.playoff_odds < 25 ? "bad" : ""}">${sn.odds ? `${sn.odds.playoff_odds}%` : "n/a"}</div><div class="s">Playoff odds<br><span class="muted">${sn.spots} of ${r.standings.length} make it</span></div></div><div class="o"><div class="pct">${sn.odds ? `${sn.odds.first_odds}%` : "n/a"}</div><div class="s">Finish first</div></div><div class="o"><div class="pct">${sn.odds ? pts(sn.odds.expected_wins) : "n/a"}</div><div class="s">Expected wins<br><span class="muted">${sn.odds ? plural(sn.odds.games_left, "game") + " left" : ""}</span></div></div><div class="o"><div class="pct mode">${esc(sn.plan.mode)}</div><div class="s">Mode</div></div></div>
<p class="stamp">Odds come from simulating the remaining schedule 1,500 times using each team's average score${sn.contending ? ". You are in contention, so playoff weeks count extra when valuing players and trades." : "."}</p>
<h3>The plan</h3><ol class="plan">${sn.plan.bullets.map((x) => `<li>${esc(x)}</li>`).join("")}</ol>
<p class="stamp by">${sn.plan.source === "claude" ? "Luna, with a little help from Claude." : "Luna, from this week's numbers."}</p>
${strengthRows ? `<h3>Your starters by position</h3><div class="group">${strengthRows}</div>` : ""}
${outlookRows ? `<h3>Remaining schedule</h3><div class="group">${outlookRows}</div>` : ""}
${sn.byes_ahead && sn.byes_ahead.length ? `<h3>Byes still to come</h3><div class="group">${sn.byes_ahead.map((x) => `<div class="row"><div class="main"><div class="t">${esc(x.name)}</div><div class="s">${esc(x.pos)}</div></div><div class="trail"><span class="tag">week ${x.week}</span></div></div>`).join("")}</div>` : ""}
</div>` : "";
  const matchRow = (s) => `${badge(s.team, s.logo, "sm")}<span><strong>${esc(s.team)}</strong> <span class="muted">${esc(s.record)} · ${pts(s.espn_proj)} / ${pts(s.best_lineup_proj)}</span></span>`;
  const body = `<h1>${esc(r.league)} <span class="muted">week ${r.week}</span></h1>${r.last_week ? `<p class="lede">Week ${r.last_week.week} is in the books: ${r.last_week.result === "W" ? "a win" : r.last_week.result === "L" ? "a loss" : "a tie"}, ${pts(r.last_week.me)} to ${pts(r.last_week.opponent)} against ${esc(r.last_week.opponent_name)}. Everything below is about week ${r.week}.</p>` : ""}
<div class="seg"><a href="#analyst">Luna</a><a href="#lineup">Lineup</a><a href="#plan">Plan</a><a href="#opponent">Opponent</a><a href="#waivers">Waivers</a><a href="#trades">Trades</a><a href="#league">League</a><a href="#schedule">Schedule</a><a href="#standings">Standings</a></div>
${analyst}
<div class="card" id="lineup">${matchup}
${r.lineup_items.length ? `<p><a class="btn" href="/lineups?league=${r.league_id}">Set this lineup (${plural(r.lineup_items.length, "change")})</a></p>` : `<p><span class="tag good">${I.check.replace("<svg", '<svg style="width:14px;height:14px"')} lineup already set</span></p>`}
${r.ceiling && r.ceiling.differs && r.win_prob != null && r.win_prob < 0.4 ? `<div class="group ceiling"><div class="row"><div class="main"><div class="t">Underdog this week: the ceiling lineup</div><div class="s">Starts the higher-variance players. Projects ${pts(r.ceiling.lineup_proj)} instead of ${pts(r.recommended_lineup_proj)}, but with more upside (${pts(r.ceiling.upside)} vs ${pts(r.ceiling.recommended_upside)} points of weekly swing). When you need to outscore a stronger team, variance is your friend.</div>${r.ceiling.moves.map(move).join("")}</div><div class="trail"><a class="btn ghost small" href="/lineups?league=${r.league_id}&amp;mode=ceiling">Set ceiling lineup</a></div></div></div>` : ""}
<h2>Recommended lineup</h2>${lineupTable(r, r.recommended)}
<h2>Changes to make</h2>${r.moves.length ? r.moves.map(move).join("") : `<p class="good">None. Your lineup already matches the projections.</p>`}
${r.warnings.length ? `<h2>Watch out</h2>${r.warnings.map(note).join("")}` : ""}
<h2>Bench</h2><div class="group">${r.bench.map((p) => `<div class="row">${avatar(p)}<div class="main"><div class="t">${esc(p.name)}</div><div class="s">${esc(p.pos)} · ${esc(p.team)}${p.opp && p.opp !== "bye" ? ` · vs ${esc(p.opp)}` : ""}</div></div><div class="trail"><span class="v">${pts(p.proj)}</span>${statusTag(p)}</div></div>`).join("")}</div></div>
${plan}
<div class="card" id="opponent"><div class="lg-head">${badge(r.opponent, r.opponent_logo)}<div class="main"><div class="t">${esc(r.opponent)}</div><div class="s">${esc(r.opponent_record)} · best possible ${pts(r.opponent_best_proj)}</div></div></div>
${lineupTable(r, r.opponent_lineup)}${r.opponent_issues.length ? note(`Their problems as set: ${r.opponent_issues.join("; ")}`) : ""}</div>
<div class="card" id="waivers"><h2 class="top">Waiver watch</h2><p class="lede">Free agents projected above your weakest starter at that position this week. Add is immediate; Claim goes through your league's waiver process. What owned means: the share of ESPN leagues that roster the player, so a low number next to a high projection is a bargain nobody has noticed yet.</p>${waivers}</div>
<div class="card" id="trades"><h2 class="top">Trade ideas</h2><p class="lede">Packages of one to three players a side, ranked by what your best lineup gains per week for the rest of the season and filtered to offers the other side could reasonably accept. Proposing sends the offer through ESPN; the other manager still has to accept.</p>
${pending}${b.trades && b.trades.length ? `<p><a class="btn" href="/trades?league=${r.league_id}">Recommended moves: one button</a></p>` : ""}${trades}</div>
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

/** One recommendation, one button. Everything the plan will do is listed; "Adjust" exposes the tick boxes. */
function blitzSimple(b, csrf, plan, flash, allMoves) {
  const r = b.report;
  const steps = [];
  plan.withdraw.forEach((t, i) => steps.push({ t: `Withdraw your offer to ${esc(t.with)}`, s: esc(plan.why[i] || `${t.give_names} for ${t.get_names}.`) }));
  const statusOf = (t, p) => ((b.rosters || {})[t.with_team_id] || []).find((x) => x.playerId === p.player_id)?.status || "ACTIVE";
  for (const t of plan.offers) {
    const shaky = t.get.filter((p) => statusOf(t, p) !== "ACTIVE").map((p) => `${p.name} is ${statusOf(t, p).replace(/_/g, " ").toLowerCase()}`);
    steps.push({ t: `Offer ${esc(t.give_names)} to ${esc(t.with)} for ${esc(t.get_names)}`, s: `+${pts(t.my_gain)} a week for you, ${t.their_gain >= 0 ? "+" : "-"}${Math.abs(t.their_gain).toFixed(1)} for them. ${esc(t.pitch)}${shaky.length ? ` <span class="warn">Check first: ${esc(shaky.join("; "))}.</span>` : ""}` });
  }
  for (const m of plan.moves) steps.push({ t: `${m.on_waivers ? "Claim" : "Add"} ${esc(m.name)}${m.drop ? `, drop ${esc(m.drop.name)}` : ""}`, s: m.fills_empty_slot ? `fills your empty ${esc(m.pos)} slot` : `+${pts(m.edge)} over your weakest ${esc(m.pos)}${m.drop ? ` · ${esc(m.drop.reason)}` : ""}` });
  const n = plan.offers.length;
  const best = plan.offers.reduce((m, t) => Math.max(m, t.my_gain), 0);
  const head = n ? `${plural(n, "offer")} to ${plural(new Set(plan.offers.map((t) => t.with)).size, "manager")}` : "No new offers";
  return layout("Luna's moves", `<h1>Luna's moves <span class="muted">${esc(r.league)}</span></h1>
${flash ? flashBox(flash) : ""}
<div class="card"><div class="lg-head">${POSE(n || plan.moves.length ? "football" : "pajamas", "pose sm wide")}<div class="main"><div class="t">${n || plan.moves.length ? "Here's what I'd do" : "Nothing to do right now"}</div></div></div>
<p class="headline" style="font-size:22px;font-weight:700;letter-spacing:-.02em;margin:0 0 6px">${head}${plan.moves.length ? ` and ${plural(plan.moves.length, "pickup")}` : ""}${plan.withdraw.length ? `, ${plural(plan.withdraw.length, "withdrawal")}` : ""}</p>
<p class="lede">${n ? `Each offer helps on its own, and the set has been checked for every combination of yes and no: whichever managers accept, your lineup comes out ahead${plan.if_all_accepted != null ? ` (up to +${pts(best)} a week if one lands, about +${pts(plan.if_all_accepted)} if they all do)` : ""}, every slot stays filled and the roster stays within its limit. No player is offered twice and no manager gets two offers.` : "Nothing on the board is both good for you and likely to be accepted right now. Check back after waivers clear or when injuries move values."}</p>
${steps.length ? `<div class="group">${steps.map((x, i) => `<div class="row"><div class="badge sm"><i>${i + 1}</i></div><div class="main"><div class="t">${x.t}</div><div class="s">${x.s}</div></div></div>`).join("")}</div>` : ""}
${steps.length ? `<form method="post" action="/trades"><input type="hidden" name="csrf" value="${esc(csrf)}"><input type="hidden" name="league" value="${r.league_id}">
<p style="margin-top:16px"><button class="btn big" type="submit">Let Luna do all of this on ESPN</button></p>
<p class="stamp">Press once. Offers go to each manager separately; ESPN tells them and they accept or decline there. Claims only go through if you win them.</p></form>` : ""}
</div>
<details class="card"><summary style="cursor:pointer;font-weight:600">Adjust</summary>
<form method="post" action="/trades" id="adj"><input type="hidden" name="csrf" value="${esc(csrf)}"><input type="hidden" name="league" value="${r.league_id}"><input type="hidden" name="adjusted" value="1">
${(b.pending || []).filter((t) => t.mine).length ? `<h3>Your offers out on ESPN</h3><div class="trades">${(b.pending || []).filter((t) => t.mine).map((t) => `<label class="pick"><input type="checkbox" name="withdraw" value="${esc(String(t.id))}"${plan.withdraw.includes(t) ? " checked" : ""}>${pendingCard(r, t)}</label>`).join("")}</div>` : ""}
${plan.offers.length ? `<h3>Offers</h3><div class="trades">${plan.offers.map((t) => `<label class="pick"><input type="checkbox" name="id" value="${esc(t.id)}" checked>${tradeCard(r, t, false)}</label>`).join("")}</div>` : ""}
${allMoves.length ? `<h3>Pickups</h3><div class="group">${allMoves.map((m) => `<label class="row pick-row"><input type="checkbox" name="move" value="${m.player_id}"${plan.moves.some((x) => x.player_id === m.player_id) ? " checked" : ""}>${avatar(m, "sm")}<div class="main"><div class="t">${m.on_waivers ? "Claim" : "Add"} ${esc(m.name)} <span class="muted">${esc(m.pos)} · ${esc(m.team)} · ${pts(m.proj)} proj</span></div><div class="s">${m.fills_empty_slot ? (m.bye_cover ? `covers ${esc(m.returning)}'s bye this week only` : `fills your empty ${esc(m.pos)} slot`) : `+${pts(m.edge)} over your weakest ${esc(m.pos)}`}${m.drop ? ` · drop ${esc(m.drop.name)}` : ""}</div></div></label>`).join("")}</div>` : ""}
<p style="margin-top:16px"><button class="btn ghost" type="submit">Send only the ticked items</button></p></form></details>
<p><a class="btn ghost" href="/league/${r.league_id}#trades">Back</a></p>`, { authed: true });
}

// The league page is cached HTML without a session, so withdraw forms carry no CSRF and route through the blitz page instead.
const csrfFor = () => null;
const fmtExp = (ts) => ts ? new Date(ts).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/New_York" }) : "";
function pendingCard(r, t, csrf) {
  const side = (label, ps) => `<div class="side"><div class="lbl">${label}</div>${ps.map((p) => `<div class="p">${avatar(p, "sm")}<div><div class="t">${esc(p.name)}</div><div class="s">${esc(p.pos || "")}${p.team ? ` · ${esc(p.team)}` : ""}${p.value != null ? ` · ${pts(p.value)}/wk` : ""}</div></div></div>`).join("")}</div>`;
  const give = t.give && typeof t.give[0] === "object" ? t.give : t.give_names.split(" + ").map((name) => ({ name }));
  const get = t.get && typeof t.get[0] === "object" ? t.get : t.get_names.split(" + ").map((name) => ({ name }));
  return `<div class="trade pending"><div class="head">${badge(t.with, t.with_logo, "sm")}<span class="nm">${esc(t.with)}</span><span class="tag tint">${t.mine ? "your offer" : "their offer"}</span><span class="tag">${esc(t.kind)}</span>
<span class="gain">${t.my_gain != null ? `<span class="tag ${t.my_gain > 0 ? "good" : "bad"}">you ${t.my_gain >= 0 ? "+" : "-"}${Math.abs(t.my_gain).toFixed(1)}/wk</span><span class="tag ${t.their_gain >= 0 ? "good" : "warn"}">them ${t.their_gain >= 0 ? "+" : "-"}${Math.abs(t.their_gain).toFixed(1)}/wk</span>${t.acceptable != null ? `<span class="tag ${t.acceptable ? "good" : "bad"}">${t.acceptable ? "likely accepted" : "likely declined"}</span>` : ""}` : `<span class="tag">not scored</span>`}</span></div>
<div class="swap">${side("You send", give)}<div class="arrow">${I.swap}</div>${side("You get", get)}</div>
<p class="stamp">${t.expires_at ? `Expires ${esc(fmtExp(t.expires_at))} ET.` : "Pending on ESPN."}${t.mine ? ` Withdraw it from the trade blitz page, or on ESPN.` : " Accept or decline it on ESPN."}</p></div>`;
}

export function blitzPage(b, picks, csrf, { flash = null, results = null, freed = null, moves = [], plan = null } = {}) {
  if (plan && !results) return blitzSimple(b, csrf, plan, flash, moves);
  const r = b.report;
  if (results) {
    const sent = results.filter((x) => x.result.ok).length;
    const offers = results.filter((x) => x.trade && !x.withdrawn), wd = results.filter((x) => x.withdrawn), mv = results.filter((x) => x.move);
    const bits = [];
    if (wd.length) bits.push(`${wd.filter((x) => x.result.ok).length} of ${wd.length} withdrawn`);
    if (offers.length) bits.push(`${offers.filter((x) => x.result.ok).length} of ${plural(offers.length, "offer")} sent`);
    if (mv.length) bits.push(`${mv.filter((x) => x.result.ok).length} of ${plural(mv.length, "waiver move")} done`);
    return layout("Blitz sent", `<h1>${bits.join(", ") || "Nothing sent"}</h1>
${results.map((x) => `<div class="card"><p class="${x.result.ok ? "good" : "bad"}">${x.withdrawn ? "Withdraw: " : x.move ? `${x.move.on_waivers ? "Claim" : "Add"} ${esc(x.move.name)}${x.move.drop ? `, drop ${esc(x.move.drop.name)}` : ""}: ` : ""}${esc(x.result.message)}</p>${x.withdrawn ? pendingCard(r, x.trade) : x.trade ? tradeCard(r, x.trade, false) : ""}</div>`).join("")}
<p class="muted">Each manager gets ESPN's usual notice and accepts or declines there. If two of them accept offers that share a player, ESPN voids the later one, so nothing can double-trade. Withdraw any offer on ESPN if you change your mind.</p>
<p><a class="btn" href="/league/${r.league_id}?refresh=1#trades">Back to ${esc(r.league)}</a></p>`, { authed: true });
  }
  const totalGain = picks.reduce((n, t) => n + t.my_gain, 0);
  const mine = (b.pending || []).filter((t) => t.mine);
  const freedGain = freed ? freed.reduce((n, t) => n + t.my_gain, 0) : 0;
  const pendingBlock = mine.length ? `<h2>Your offers already out</h2><p class="lede">Players in these offers are kept out of new ones. Tick an offer to withdraw it; the board below then assumes those players are free again${freed && freedGain > totalGain + 0.05 ? `, which would let you send a set worth about ${pts(freedGain)} a week instead of ${pts(totalGain)}` : ""}.</p>
<div class="trades">${mine.map((t) => `<label class="pick"><input type="checkbox" name="withdraw" value="${esc(String(t.id))}"${t.my_gain != null && freed && freedGain > totalGain + 0.05 && t.my_gain < freedGain - totalGain ? " checked" : ""}>${pendingCard(r, t)}</label>`).join("")}</div>` : "";
  return layout("Trade blitz", `<h1>Trade blitz <span class="muted">${esc(r.league)}</span></h1>
${flash ? flashBox(flash) : ""}
${mine.length ? `<form method="post" action="/trades" id="blitz"><input type="hidden" name="csrf" value="${esc(csrf)}"><input type="hidden" name="league" value="${r.league_id}">${pendingBlock}</form>` : ""}
<p class="lede">${picks.length ? `The best ${plural(picks.length, "offer")} that can all be out at once: no player offered twice, one offer per manager. Together they are worth about ${pts(totalGain)} points a week if everyone said yes. Untick any you do not want, then send the rest in one go.` : "No trade on the board clearly helps you without hurting the other side, so there is nothing to send right now."}</p>
${picks.length || (freed && freed.length) ? `<h2>New offers</h2><div class="trades">${(freed && freed.length > picks.length ? freed : picks).map((t) => `<label class="pick"><input type="checkbox" name="id" value="${esc(t.id)}" form="blitz"${picks.some((p) => p.id === t.id) ? " checked" : ""}>${tradeCard(r, t, false)}${picks.some((p) => p.id === t.id) ? "" : `<p class="stamp">Needs a player from one of your pending offers; tick that offer above to withdraw it first.</p>`}</label>`).join("")}</div>
<p style="margin-top:16px"><button class="btn big" type="submit" form="blitz">${mine.length ? "Withdraw the ticked offers and send the new ones" : "Send the ticked offers to ESPN"}</button></p>
<p class="stamp">Press once. Each offer goes to its manager separately; they accept or decline on ESPN.</p>` : ""}
${moves.length ? `<h2>Waiver moves</h2><p class="lede">The top pickup at each position where someone out-projects your weakest starter, with the drop chosen for you. Claims only go through if you win the claim, and the drop only happens then. Untick any you do not want.</p>
<div class="group">${moves.map((m) => `<label class="row pick-row"><input type="checkbox" name="move" value="${m.player_id}" form="blitz"${m.fills_empty_slot && !m.bye_cover ? " checked" : ""}>${avatar(m, "sm")}<div class="main"><div class="t">${m.on_waivers ? "Claim" : "Add"} ${esc(m.name)} <span class="muted">${esc(m.pos)} · ${esc(m.team)} · ${pts(m.proj)} proj</span></div><div class="s">${m.fills_empty_slot ? (m.bye_cover ? `covers ${esc(m.returning)}'s bye this week only; he is back next week` : `fills your empty ${esc(m.pos)} slot`) : `+${pts(m.edge)} over your weakest ${esc(m.pos)}`}${m.drop ? ` · drop ${esc(m.drop.name)} (${esc(m.drop.reason)})` : " · open roster spot, no drop"}</div></div></label>`).join("")}</div>
${!picks.length && !(freed && freed.length) ? `<p style="margin-top:16px"><button class="btn big" type="submit" form="blitz">Send the ticked moves to ESPN</button></p>` : ""}` : ""}
${!mine.length ? `<form method="post" action="/trades" id="blitz"><input type="hidden" name="csrf" value="${esc(csrf)}"><input type="hidden" name="league" value="${r.league_id}"></form>` : ""}
<p><a class="btn ghost" href="/league/${r.league_id}#trades">Back</a></p>`, { authed: true });
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

export function addPage(b, pick, csrf, { drop = null, bid = 0, waiver = false, flash = null, result = null, suggested = null } = {}) {
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
<div class="card confirm"><p>${who}. ${pick.fills_empty_slot ? (pick.bye_cover ? `Your ${esc(pick.pos)} slot is empty this week only because ${esc(pick.returning)} is on bye and back next week; this is a quality call, not a must.` : `He fills a slot you cannot fill from your roster.`) : `He out-projects your weakest ${esc(pick.pos)} starter by ${pts(pick.edge)} this week.`}
${waiver ? ` He is on waivers, so this is a claim: ESPN processes it on the league's waiver schedule and he joins your team only if the claim wins.` : ` He is a free agent, so the add is immediate.`}</p>
${pickRow}
<form method="post" action="/add"><input type="hidden" name="csrf" value="${esc(csrf)}"><input type="hidden" name="league" value="${r.league_id}"><input type="hidden" name="player" value="${pick.player_id}">
<label for="drop">Drop${needDrop ? " (your roster is full)" : ""}</label><select id="drop" name="drop" onchange="this.form.requestSubmit?this.form.submit():0">${options}</select>
${waiver && r.budget_left != null ? `<label for="bid">Bid (you have $${r.budget_left} left)</label><input type="text" id="bid" name="bid" value="${bid}" inputmode="numeric" pattern="[0-9]*">${suggested != null ? `<p class="stamp">Suggested: $${suggested}. ${["D/ST", "K"].includes(pick.pos) ? "Never spend budget on a streaming defense or kicker; $0 or wait for free agency." : "Priced by how much he adds and how much season is left; unspent budget scores nothing, so bids rise as the season runs down. Just above a round number beats the crowd."}</p>` : ""}` : ""}
<p><button class="btn big" type="submit">${waiver ? "Submit claim" : "Add"}${drop ? ` and drop ${esc(drop.name)}` : ""}</button></p></form>
<p class="stamp">Press once. Dropping a player sends him to waivers on ESPN; there is no undo from here.</p></div>
<p><a class="btn ghost" href="/league/${r.league_id}#waivers">Back</a></p>`, { authed: true });
}

// ------------------------------------------------------------------ lineups

/** What a set lineup looks like, so the page still says something when there is nothing to change. */
function lineupReview(r) {
  const wp = r.win_prob;
  return `${lineupTable(r, r.recommended)}
<p class="stamp">Projected ${pts(r.current_lineup_proj)} (Advisor ${pts(r.advisor.me_as_set)}) vs ${esc(r.opponent)} ${pts(r.opponent_current_proj)} · win chance <strong class="${wp == null ? "" : wp >= 0.6 ? "good" : wp <= 0.4 ? "bad" : ""}">${pct(wp)}</strong>${r.ceiling?.differs ? ` · underdog option: <a href="/lineups?league=${r.league_id}&amp;mode=ceiling">ceiling lineup</a>` : ""}</p>
${r.bench.length ? `<p class="muted">Bench: ${r.bench.map((p) => `${esc(p.name)} ${pts(p.proj)}`).join(" · ")}</p>` : ""}
${r.warnings && r.warnings.length ? `<p class="muted">${r.warnings.map(esc).join(" ")}</p>` : ""}`;
}

/** All leagues' recommendations on one page. */
export function movesPage(items, csrf) {
  const cards = items.map((it) => {
    if (it.error) return `<div class="card"><p class="bad">${esc(it.error)}</p></div>`;
    const { b, plan } = it, r = b.report;
    const steps = [];
    if (r.lineup_items.length) steps.push(`Set the lineup: ${plural(r.lineup_items.length, "change")}, +${pts(r.recommended_lineup_proj - r.current_lineup_proj)} points`);
    for (const t of plan.withdraw || []) steps.push(`Withdraw the offer to ${esc(t.with)}`);
    for (const t of plan.offers || []) steps.push(`Offer ${esc(t.give_names)} to ${esc(t.with)} for ${esc(t.get_names)} (+${pts(t.my_gain)}/wk)`);
    for (const m of plan.moves || []) steps.push(`${m.on_waivers ? "Claim" : "Add"} ${esc(m.name)}${m.drop ? `, drop ${esc(m.drop.name)}` : ""}`);
    const none = !steps.length, sendable = (plan.offers || []).length + (plan.moves || []).length + (plan.withdraw || []).length > 0;
    return `<div class="card"><div class="lg-head">${badge(r.team, r.logo)}<div class="main"><div class="t"><a href="/league/${r.league_id}">${esc(b.name)}</a></div><div class="s">week ${r.week} · ${esc(r.record)}${b.season?.odds ? ` · ${b.season.odds.playoff_odds}% playoff odds` : ""}${r.trades_closed ? " · trade deadline passed" : ""}</div></div>${POSE(none ? "pajamas" : "football", "pose sm")}</div>
${b.analyst?.headline ? `<p class="take">${esc(b.analyst.headline)}</p>` : ""}
${none ? `<p class="muted">Nothing to do here right now. Lineup set, no trade worth sending, nobody worth adding.</p>` : `<ol class="plan">${steps.map((x) => `<li>${x}</li>`).join("")}</ol>
<div class="runnow">${r.lineup_items.length ? `<a class="btn${sendable ? " ghost" : ""}" href="/lineups?league=${r.league_id}">Set lineup</a>` : ""}${sendable ? `<a class="btn" href="/trades?league=${r.league_id}">Let Luna do the rest</a>` : ""}</div>`}</div>`;
  });
  return layout("Recommendations", `<h1>Recommendations <span class="muted">all leagues</span></h1><p class="lede">What Luna would do in each league right now. Nothing here goes to ESPN until you press a button.</p>${cards.join("") || `<div class="card"><p class="muted">No active leagues.</p></div>`}`, { authed: true });
}

export function lineupsPage({ bundles, results, only, csrf, ceiling = false }) {
  if (!results) {
    const any = bundles.reduce((n, b) => n + b.report.lineup_items.length, 0);
    const body = `<h1>Set ${ceiling ? "the ceiling lineup" : only ? "this lineup" : "all lineups"}</h1>${ceiling ? `<p class="lede">High-upside version for an underdog week: a little less projection, more chance of a big score.</p>` : ""}
<p class="lede">This is exactly what will be sent to ESPN. Only slot changes: nobody is added or dropped, locked players are left alone, and IR is never touched.</p>
${bundles.map((b) => `<div class="card"><div class="lg-head">${badge(b.report.team, b.report.logo)}<div class="main"><div class="t">${esc(b.name)}</div><div class="s">week ${b.week}</div></div></div>
${b.report.lineup_items.length ? `<div class="group">${b.report.lineup_items.map((it) => `<div class="row">${avatar({ name: it.name, player_id: it.playerId, pos: "", team: "" }, "sm")}<div class="main"><div class="t">${esc(it.name)}</div></div><div class="trail"><span class="m">${esc(it.from)}</span>${I.chev}<span class="v">${esc(it.to)}</span></div></div>`).join("")}</div>
<p class="stamp">Projected: ${pts(b.report.current_lineup_proj)} &rarr; <strong>${pts(b.report.recommended_lineup_proj)}</strong></p>` : `<p class="good">Already set. No changes.</p>${lineupReview(b.report)}`}</div>`).join("")}
${any ? `<form method="post" action="/lineups"><input type="hidden" name="csrf" value="${esc(csrf)}">${only ? `<input type="hidden" name="league" value="${esc(only)}">` : ""}${ceiling ? `<input type="hidden" name="mode" value="ceiling">` : ""}
<button class="btn big" type="submit">Confirm and send to ESPN</button></form>
<p class="stamp">Press once. ESPN has no undo for this; if you change your mind, change the lineup back on ESPN or re-run after projections move.</p>` : `<p><a class="btn ghost" href="/">Back</a></p>`}`;
    return layout("Set lineups", body, { authed: true });
  }
  const body = `<h1>Done</h1>${results.map((x) => `<div class="card"><h2 class="top">${esc(x.name)}</h2><p class="${x.result.ok ? "good" : "bad"}">${esc(x.result.message)}</p>
${x.items.length && !x.result.ok ? `<p class="muted">Tried: ${esc(x.items.map((it) => `${it.name} ${it.from}→${it.to}`).join(", "))}</p><p class="muted">Make these on ESPN by hand, then come back. If this keeps failing with 401, update the cookies under Settings.</p>` : ""}</div>`).join("")}
<p><a class="btn" href="/?refresh=1">Back to your leagues</a></p>`;
  return layout("Done", body, { authed: true });
}
