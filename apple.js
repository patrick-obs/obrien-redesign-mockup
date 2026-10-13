// Oct 2026 reskin in the spirit of apple.com: one design system (type, neutrals, spacing), a global nav
// with flyouts and search, a sticky local nav on every inner page, tiles, scroll motion (reveals, hero
// zoom, word highlight, sticky story, galleries with paddles, smooth FAQ) and page-to-page transitions.
// Brand color stays O'Brien teal; everything else follows Apple's neutrals and type scale.
// build.js reads: CSS (base, replaces the old core sheet), CSS_AFTER (restyles extras/growth/where
// components, loads last), header(), footer(), cta(), localNav(), siteJs(searchIndex).

const MARK = '/assets/media/brand/obrien-mark.png';
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---------------- design system ---------------- */
const CSS = String.raw`
:root{
  --teal:#007377; --teal-dark:#00656a; --teal-ink:#1d1d1f; --teal-soft:#4cc9cd; --gold:#e8a33d;
  --ink:#1d1d1f; --ink-2:#424245; --muted:#6e6e73; --faint:#86868b; --line:#d2d2d7;
  --paper:#fff; --mist:#f5f5f7; --mist-2:#e8e8ed; --night:#000; --night-2:#161617; --night-3:#1d1d1f;
  --accent:#007377; --accent-hover:#00656a; --accent-dark:#4cc9cd;
  --radius:18px; --radius-lg:28px;
  --shadow:2px 4px 12px rgba(0,0,0,.08); --shadow-hover:2px 4px 16px rgba(0,0,0,.16);
  --font:-apple-system,BlinkMacSystemFont,"SF Pro Text","Inter","Helvetica Neue",Helvetica,Arial,sans-serif;
  --font-display:-apple-system,BlinkMacSystemFont,"SF Pro Display","Inter","Helvetica Neue",Helvetica,Arial,sans-serif;
  --ease:cubic-bezier(.28,.11,.32,1); --ease-io:cubic-bezier(.4,0,.6,1); --ease-out:cubic-bezier(0,0,.5,1);
  --gn-h:44px; --ln-h:52px; --w:1068px; --gut:22px;
  --muted-2:var(--muted); --mist-line:var(--line);
}
*{margin:0;padding:0;box-sizing:border-box}
html{-webkit-text-size-adjust:100%;scroll-padding-top:calc(var(--ln-h) + 8px)}
@media (prefers-reduced-motion:no-preference){html{scroll-behavior:smooth}}
body{font-family:var(--font);font-size:17px;line-height:1.47059;font-weight:400;letter-spacing:-.016em;color:var(--ink);background:var(--paper);
  -webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;font-synthesis:none;text-rendering:optimizeLegibility}
main{display:block;overflow-x:clip}
img{max-width:100%;display:block}
a{color:var(--accent);text-decoration:none}
a:hover{text-decoration:underline}
h1,h2,h3,h4{font-family:var(--font-display);font-weight:600;line-height:1.1;letter-spacing:-.015em;color:inherit;text-wrap:balance}
p{text-wrap:pretty}
button{font:inherit;color:inherit}
:focus-visible{outline:2px solid var(--accent);outline-offset:3px;border-radius:6px}
::selection{background:rgba(0,115,119,.18)}
a,button{-webkit-tap-highlight-color:transparent}
.wrap{max-width:var(--w);margin:0 auto;padding:0 var(--gut)}
.wrap.wide{max-width:1260px}
.wrap.narrow{max-width:760px}
.skip{position:absolute;left:-9999px;top:0;z-index:10001;background:#fff;padding:10px 16px;border-radius:0 0 12px 0}
.skip:focus{left:0}
.eyebrow{display:block;font-size:17px;line-height:1.24;font-weight:600;letter-spacing:-.01em;color:var(--teal);margin-bottom:10px;text-transform:none}

/* ---------- buttons and links ---------- */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:.3em;min-width:28px;padding:11px 21px;border-radius:980px;border:1px solid transparent;
  font-size:17px;line-height:1.17648;font-weight:400;letter-spacing:-.022em;text-align:center;white-space:nowrap;cursor:pointer;text-decoration:none!important;
  transition:background-color .25s var(--ease-out),color .25s var(--ease-out),border-color .25s var(--ease-out),transform .2s var(--ease-out)}
.btn:active{transform:scale(.97)}
.btn-solid,.btn-white{background:var(--accent);color:#fff}
.btn-solid:hover,.btn-white:hover{background:var(--accent-hover);color:#fff}
.btn-ghost{background:transparent;color:var(--accent);border-color:var(--accent)}
.btn-ghost:hover{background:var(--accent);color:#fff}
.btn-sm{font-size:14px;padding:7px 15px}
.btn-lg{font-size:17px;padding:14px 26px}
.dark .btn-solid,.dark .btn-white{background:#00858a}
.dark .btn-solid:hover,.dark .btn-white:hover{background:#009a9f}
.dark .btn-ghost{color:var(--accent-dark);border-color:var(--accent-dark)}
.dark .btn-ghost:hover{background:var(--accent-dark);color:#000}
.lnk{color:var(--accent);font-size:inherit;white-space:nowrap}
.lnk::after{content:"\00a0\203A";display:inline-block;transform:scale(1.25) translateY(-.02em);margin-left:.08em}
.dark .lnk,.dark a.lnk{color:var(--accent-dark)}
.ctas{display:flex;flex-wrap:wrap;gap:16px 18px;justify-content:center;align-items:center}
.linkish{background:none;border:0;padding:0;color:var(--accent);cursor:pointer;font:inherit}
.linkish:hover{text-decoration:underline}

/* ---------- global nav ---------- */
.gn{position:relative;z-index:9999;height:var(--gn-h);background:rgba(250,250,252,.8);-webkit-backdrop-filter:saturate(180%) blur(20px);backdrop-filter:saturate(180%) blur(20px);view-transition-name:gn}
body.home .gn{position:sticky;top:0}
.gn-in{position:relative;z-index:2;max-width:1024px;height:100%;margin:0 auto;padding:0 var(--gut);display:flex;align-items:center;justify-content:space-between}
.gn-logo{display:flex;align-items:center;height:100%;flex:none;opacity:.92;transition:opacity .3s}
.gn-logo:hover{opacity:1}
.gn-logo img{height:20px;width:auto;border-radius:2px}
.gn-list{display:flex;flex:1;justify-content:space-between;list-style:none;margin:0 26px;max-width:760px}
.gn-list a{display:flex;align-items:center;height:var(--gn-h);padding:0 8px;font-size:12px;line-height:1;letter-spacing:-.01em;color:rgba(0,0,0,.8);white-space:nowrap;text-decoration:none;transition:color .32s var(--ease-io)}
.gn-list a:hover,.gn-list li.open>a{color:#000}
.gn-tools{display:flex;align-items:center;flex:none;margin-right:-10px}
.gn-icon{display:grid;place-items:center;width:40px;height:var(--gn-h);background:none;border:0;cursor:pointer;color:rgba(0,0,0,.8);transition:color .32s}
.gn-icon:hover{color:#000}
.gn-icon svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round}
.gn-burger{display:none}
.gn-burger span{position:absolute;left:50%;width:17px;height:1.2px;margin-left:-8.5px;background:currentColor;border-radius:1px;transition:transform .32s var(--ease-io)}
.gn-burger{position:relative}
.gn-burger span:first-child{top:calc(50% - 4px)}
.gn-burger span:last-child{top:calc(50% + 3px)}
html.m-open .gn-burger span:first-child{transform:translateY(3.5px) rotate(45deg)}
html.m-open .gn-burger span:last-child{transform:translateY(-3.5px) rotate(-45deg)}
/* flyouts */
.gn-flybg{position:absolute;z-index:1;left:0;right:0;top:0;height:var(--gn-h);background:#fafafc;transition:height .32s var(--ease-io)}
.gn:not(.fly-open) .gn-flybg{background:transparent}
.gn-fly{position:absolute;z-index:2;left:0;right:0;top:var(--gn-h);visibility:hidden;pointer-events:none}
.gn-fly.on{visibility:visible;pointer-events:auto}
.gn-fly-in{max-width:1024px;margin:0 auto;padding:40px var(--gut) 84px;display:flex;gap:88px}
.gn-col{min-width:0}
.gn-col h3{font-size:12px;font-weight:400;line-height:1.33;color:var(--muted);letter-spacing:-.01em;margin:0 0 13px}
.gn-col ul{list-style:none}
.gn-col a{display:inline-block;padding:4px 0;font-size:12px;font-weight:600;line-height:1.33;color:#333336;text-decoration:none}
.gn-col.big a{font-size:24px;line-height:1.17;letter-spacing:.007em;padding:4px 0 6px}
.gn-col a:hover{color:#000;text-decoration:underline}
.gn-fly .gi{opacity:0;transform:translateY(-6px);transition:opacity .2s var(--ease-io),transform .2s var(--ease-io)}
.gn-fly.on .gi{opacity:1;transform:none;transition-duration:.32s;transition-delay:calc(60ms + var(--i,0) * 18ms)}
.gn-curtain{position:fixed;inset:0;z-index:9998;background:rgba(232,232,237,.4);-webkit-backdrop-filter:blur(20px);backdrop-filter:blur(20px);opacity:0;visibility:hidden;transition:opacity .32s var(--ease-io),visibility .32s}
html.fly-open .gn-curtain{opacity:1;visibility:visible}
/* search */
.gn-search-in{display:block;max-width:760px}
.gn-sform{position:relative;display:flex;align-items:center;margin-bottom:34px}
.gn-sform svg{position:absolute;left:0;width:24px;height:24px;fill:none;stroke:var(--muted);stroke-width:1.8;stroke-linecap:round}
.gn-sform input{width:100%;border:0;background:none;outline:0;padding:0 0 0 38px;font:600 24px/1.2 var(--font-display);letter-spacing:.007em;color:var(--ink)}
.gn-sform input::placeholder{color:var(--faint)}
.gn-sform input::-webkit-search-cancel-button{-webkit-appearance:none;appearance:none}
.gn-sres a{display:flex;align-items:baseline;gap:10px;padding:6px 0;font-size:14px;font-weight:600;color:#333336;text-decoration:none}
.gn-sres a:hover,.gn-sres a.sel{color:#000}
.gn-sres a span{font-size:12px;font-weight:400;color:var(--muted)}
.gn-sres a::before{content:"\2192";color:var(--muted);font-weight:400}
.gn-sres p{font-size:14px;color:var(--muted)}
/* ribbon */
.ribbon{background:var(--mist);text-align:center;padding:13px var(--gut);font-size:14px;line-height:1.43;color:var(--ink)}
.ribbon a{color:var(--accent)}
/* mobile menu */
.gn-m{display:none}
@media (max-width:833px){
  :root{--gn-h:48px;--gut:16px}
  .gn-list{display:none}
  .gn-in{padding:0 8px 0 16px}
  .gn-logo img{height:19px}
  .gn-burger{display:grid}
  .gn-icon{width:44px}
  .gn-fly:not([data-fly=search]){display:none}
  .gn-fly[data-fly=search]{position:fixed;top:var(--gn-h);bottom:0;background:#fafafc;overflow:auto}
  .gn-fly[data-fly=search] .gn-fly-in{padding:24px 48px}
  .gn-m{display:block;position:fixed;z-index:9997;left:0;right:0;top:var(--gn-h);bottom:0;background:#fafafc;overflow:hidden;visibility:hidden;opacity:0;transition:opacity .32s var(--ease-io),visibility .32s}
  html.m-open .gn-m{visibility:visible;opacity:1}
  html.m-open,html.m-open body{overflow:hidden}
  html.m-open .gn{background:#fafafc}
  .gn-mp{position:absolute;inset:0;overflow-y:auto;padding:18px 48px 48px;transition:transform .42s var(--ease-io),opacity .42s var(--ease-io)}
  .gn-mp.sub{transform:translateX(100%);opacity:0;visibility:hidden}
  .gn-m.sub-on .gn-mp.main{transform:translateX(-30%);opacity:0;visibility:hidden}
  .gn-m.sub-on .gn-mp.sub.on{transform:none;opacity:1;visibility:visible}
  .gn-mp ul{list-style:none}
  .gn-mp a,.gn-mp button.gn-mlink{display:flex;justify-content:space-between;align-items:center;width:100%;padding:7px 0;background:none;border:0;text-align:left;font:600 28px/1.14 var(--font-display);letter-spacing:.007em;color:#333336;text-decoration:none;cursor:pointer}
  .gn-mp button.gn-mlink::after{content:"\203A";font-weight:400;color:var(--muted);font-size:28px}
  .gn-mp .small a{font-size:17px;font-weight:600;padding:6px 0}
  .gn-mp h3{font-size:14px;font-weight:400;color:var(--muted);margin:22px 0 8px}
  .gn-mback{display:inline-flex;align-items:center;gap:6px;background:none;border:0;color:var(--muted);font-size:14px;margin:0 0 14px -4px;cursor:pointer;padding:6px 4px}
  .gn-mback::before{content:"\2039";font-size:24px;line-height:.6}
  .gn-mp .mi{opacity:0;transform:translateY(-8px);transition:opacity .3s var(--ease-io),transform .3s var(--ease-io)}
  html.m-open .gn-mp.main .mi,.gn-mp.sub.on .mi{opacity:1;transform:none;transition-delay:calc(80ms + var(--i,0) * 22ms)}
  .ribbon{font-size:12px;padding:11px var(--gut)}
}

/* ---------- local nav ---------- */
.ln{position:sticky;top:0;z-index:9990;height:var(--ln-h);view-transition-name:ln}
.ln::before{content:"";position:absolute;inset:0;background:rgba(255,255,255,.72);-webkit-backdrop-filter:saturate(180%) blur(20px);backdrop-filter:saturate(180%) blur(20px);border-bottom:1px solid transparent;transition:border-color .3s var(--ease-io),background-color .3s}
.ln.stuck::before{border-color:rgba(0,0,0,.16)}
.ln-in{position:relative;max-width:1024px;height:100%;margin:0 auto;padding:0 var(--gut);display:flex;align-items:center;justify-content:space-between;gap:20px}
.ln-title{min-width:0;font:600 21px/1.2 var(--font-display);letter-spacing:.011em;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-decoration:none!important}
.ln-menu{display:flex;align-items:center;gap:24px;flex:none}
.ln-links{display:flex;gap:24px}
.ln-links a{font-size:12px;letter-spacing:-.01em;color:var(--ink);text-decoration:none;opacity:.88;transition:color .2s,opacity .2s}
.ln-links a:hover{color:var(--accent);opacity:1}
.ln-links a.on{color:var(--faint);opacity:1}
.ln-cta{display:inline-block;padding:4px 11px;border-radius:980px;background:var(--accent);color:#fff!important;font-size:12px;line-height:1.33;text-decoration:none!important;transition:background .25s}
.ln-cta:hover{background:var(--accent-hover)}
@media (max-width:833px){
  :root{--ln-h:48px}
  .ln-title{font-size:19px}
  .ln-links{display:none}
}

/* ---------- page heroes ---------- */
.page-hero{position:relative;text-align:center;padding:84px 0 0;background:var(--paper);color:var(--ink);overflow:visible}
.page-hero::before,.page-hero::after{display:none!important}
.page-hero .crumbs,.post-hero .crumbs{display:none}
.page-hero .crumbs a{color:var(--muted)}
.page-hero .crumbs a:hover{color:var(--ink)}
.page-hero .wrap:not(.crumbs),.ph-text{max-width:900px;margin:0 auto;padding:0 var(--gut)}
.page-hero .eyebrow{font-size:21px;color:var(--teal);margin-bottom:6px}
.page-hero h1{font-size:clamp(40px,6.6vw,80px);line-height:1.05;letter-spacing:-.015em;margin:0 auto;max-width:15ch}
.page-hero p{font-size:clamp(19px,2.1vw,24px);line-height:1.33;letter-spacing:.009em;color:var(--muted);max-width:40ch;margin:20px auto 0}
.page-hero .ctas,.ph-ctas{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:16px 26px;margin-top:30px}
.page-hero.plain{padding-bottom:84px}
.page-hero:not(:has(.ph-media)){padding-bottom:84px}
.ph-media{max-width:1260px;margin:64px auto 0;padding:0 var(--gut)}
.ph-img{width:100%;aspect-ratio:16/9;max-height:min(80vh,740px);border-radius:var(--radius-lg);background:var(--hero-img) center/cover no-repeat var(--mist);
  transform-origin:50% 0;transform:scale(calc(.9 + .1 * var(--p,1)));will-change:transform;view-transition-name:hero-img}
html.js [data-scroll=zoom]{--p:0}
@media (prefers-reduced-motion:no-preference){
  .page-hero .crumbs,.page-hero .eyebrow,.page-hero h1,.page-hero p,.page-hero .ph-ctas,.page-hero .ctas,.ph-media,.ah-in>*{animation:rise 1s var(--ease) both}
  .page-hero .eyebrow{animation-delay:.05s}.page-hero h1{animation-delay:.1s}.page-hero p{animation-delay:.22s}
  .page-hero .ph-ctas,.page-hero .ctas{animation-delay:.32s}.ph-media{animation-delay:.42s}
}
@keyframes rise{from{opacity:0;transform:translateY(28px)}}

/* ---------- home hero ---------- */
.hero.ah{position:relative;text-align:center;padding:76px 0 0;background:var(--paper);color:var(--ink);overflow:visible}
.hero.ah::before,.hero.ah::after{display:none}
.ah-in{max-width:980px;margin:0 auto;padding:0 var(--gut)}
.ah .eyebrow{font-size:21px;margin-bottom:8px}
.ah h1{font-size:clamp(50px,8.4vw,104px);line-height:1.02;letter-spacing:-.02em;max-width:none}
.ah h1 em,.grad{font-style:normal;background:linear-gradient(100deg,#00585c 0%,#007377 35%,#1fa5a9 70%,#47c6c9 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
.ah p{font-size:clamp(21px,2.4vw,28px);line-height:1.18;letter-spacing:.007em;color:var(--muted);max-width:34ch;margin:22px auto 0}
.ah .ctas{margin-top:32px}
.ah-in>*:nth-child(2){animation-delay:.08s}.ah-in>*:nth-child(3){animation-delay:.2s}.ah-in>*:nth-child(4){animation-delay:.32s}
.ah-media{margin:72px auto 0;padding:0 12px}
.ah-img{width:100%;height:min(86vh,820px);object-fit:cover;border-radius:calc(var(--radius-lg) + 12px * (1 - var(--p,1)));
  transform-origin:50% 0;transform:scale(calc(.84 + .16 * var(--p,1)));will-change:transform;view-transition-name:hero-img}
@media (prefers-reduced-motion:no-preference){.ah-media{animation:rise 1.2s var(--ease) .45s both}}

/* ---------- sections ---------- */
section.block{padding:110px 0}
section.block.tight{padding:72px 0}
.block.alt,.alt{background:var(--mist)}
.dark{background:var(--night);color:#f5f5f7}
.block h2,.sh{font-size:clamp(34px,5vw,56px);line-height:1.07;letter-spacing:-.005em;max-width:20ch}
.block h2 em{font-style:normal;color:var(--teal)}
.dark h2 em{color:var(--accent-dark)}
.lead{font-size:21px;line-height:1.38;letter-spacing:.011em;color:var(--muted);max-width:40em;margin-top:18px}
.dark .lead{color:#a1a1a6}
.sec-head{display:flex;flex-direction:column;align-items:center;text-align:center;gap:26px;margin-bottom:64px}
.sec-head>div{display:flex;flex-direction:column;align-items:center}
.sec-head h2{margin:0 auto}
.sec-head .lead{margin-left:auto;margin-right:auto}
.center{text-align:center}
.center h2,.center .lead{margin-left:auto;margin-right:auto}
.sh-center{text-align:center;margin:0 auto 56px}
.sh-center .lead{margin-left:auto;margin-right:auto}

/* ---------- overview (inner pages) ---------- */
.hl-text{font:600 clamp(28px,3.6vw,44px)/1.16 var(--font-display);letter-spacing:-.006em;color:var(--ink)}
html.js .hl-text[data-scroll] .w{color:#c7c7cc;transition:color .35s var(--ease-io)}
html.js .hl-text[data-scroll] .w.on{color:var(--ink)}
.dark .hl-text{color:#f5f5f7}
html.js .dark .hl-text[data-scroll] .w{color:#3a3a3c}
html.js .dark .hl-text[data-scroll] .w.on{color:#f5f5f7}
.ov-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:64px;align-items:center;margin-top:88px}
.ov-grid:not(:has(.side-img)){grid-template-columns:minmax(0,760px);justify-content:center}
.body p,.twocol .body p{font-size:19px;line-height:1.5;color:var(--ink-2);margin-bottom:1.1em}
.body p:last-child{margin-bottom:0}
.side-img{border-radius:var(--radius-lg);overflow:hidden;background:var(--mist);box-shadow:none}
.side-img img{width:100%;height:100%;aspect-ratio:4/3;object-fit:cover}
.twocol{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);gap:64px;align-items:center}

/* ---------- highlights: bento ---------- */
.feat{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;margin-top:0}
.feat>div{position:relative;display:flex;flex-direction:column;justify-content:flex-end;gap:10px;min-height:250px;padding:36px 34px;border-radius:var(--radius-lg);background:var(--paper);border:0;overflow:hidden}
.alt .feat>div{background:var(--paper)}
.block:not(.alt) .feat>div{background:var(--mist)}
.feat>div:first-child:nth-last-child(2n+1){grid-column:1/-1;min-height:300px}
.feat>div:nth-child(3n+1){background:var(--night)!important;color:#f5f5f7}
.feat>div:nth-child(3n+1) b{color:#f5f5f7}
.feat>div:nth-child(3n+1) span{color:#a1a1a6}
.feat b{display:block;font:600 clamp(24px,2.6vw,32px)/1.12 var(--font-display);letter-spacing:.004em;color:var(--ink)}
.feat span{font-size:17px;line-height:1.47;color:var(--muted);max-width:44ch}
.feat>div::after{content:"";position:absolute;top:30px;left:34px;width:34px;height:4px;border-radius:2px;background:var(--teal)}
.feat>div:nth-child(3n+1)::after{background:var(--accent-dark)}

/* ---------- galleries and rails ---------- */
.gallery,.rail{display:grid;grid-auto-flow:column;gap:20px;overflow-x:auto;overscroll-behavior-x:contain;scroll-snap-type:x mandatory;scrollbar-width:none;
  margin:56px calc(50% - 50vw) 0;padding:6px max(var(--gut),calc((100vw - var(--w)) / 2 + var(--gut))) 10px;scroll-padding-inline:max(var(--gut),calc((100vw - var(--w)) / 2 + var(--gut)))}
.gallery::-webkit-scrollbar,.rail::-webkit-scrollbar{display:none}
.gallery{grid-auto-columns:min(82vw,860px)}
.gallery .g{aspect-ratio:16/10;height:auto;border-radius:var(--radius-lg);background-size:cover;background-position:center;background-color:var(--mist-2);scroll-snap-align:start;box-shadow:none}
.paddles{display:flex;justify-content:flex-end;gap:18px;max-width:var(--w);margin:22px auto 0;padding:0 var(--gut)}
.paddles button{width:36px;height:36px;border-radius:50%;border:0;background:rgba(210,210,215,.64);color:rgba(0,0,0,.56);display:grid;place-items:center;cursor:pointer;transition:background .2s,color .2s,opacity .2s}
.paddles button:hover{background:rgba(223,223,227,.7);color:rgba(0,0,0,.64)}
.paddles button:disabled{opacity:.42;cursor:default}
.paddles svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}
.dark .paddles button{background:rgba(66,66,69,.72);color:rgba(255,255,255,.8)}
.rail{grid-auto-columns:minmax(260px,372px);margin-top:0}
.rail-card{position:relative;display:block;height:480px;border-radius:var(--radius);overflow:hidden;background:var(--night);scroll-snap-align:start;box-shadow:var(--shadow);color:#fff;text-decoration:none!important;transition:transform .4s var(--ease-out),box-shadow .4s var(--ease-out)}
.rail-card:hover{transform:scale(1.012);box-shadow:var(--shadow-hover)}
.rail-card .ri{position:absolute;inset:0;background-size:cover;background-position:center;transition:transform .8s var(--ease)}
.rail-card:hover .ri{transform:scale(1.04)}
.rail-card .rt{position:absolute;left:0;right:0;bottom:0;padding:120px 26px 28px;background:linear-gradient(transparent,rgba(0,0,0,.78))}
.rail-card .rt small{display:block;font-size:12px;font-weight:600;letter-spacing:.02em;color:rgba(255,255,255,.72);margin-bottom:6px}
.rail-card .rt b{display:block;font:600 24px/1.17 var(--font-display);letter-spacing:.009em}
.rail-card .rt span{display:block;margin-top:6px;font-size:15px;line-height:1.4;color:rgba(255,255,255,.86)}
.rail.posts .rail-card{background:var(--paper);color:var(--ink);height:auto;min-height:440px;display:flex;flex-direction:column}
.rail.posts .ri{position:relative;height:220px;flex:none}
.rail.posts .rt{position:relative;padding:22px 24px 26px;background:none}
.rail.posts .rt small{color:var(--muted)}
.rail.posts .rt span{color:var(--muted)}

/* ---------- cards ---------- */
.cards,.post-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}
.card{display:flex;flex-direction:column;border:0;border-radius:var(--radius);overflow:hidden;background:var(--paper);box-shadow:var(--shadow);color:var(--ink);text-decoration:none!important;
  transition:transform .4s var(--ease-out),box-shadow .4s var(--ease-out)}
.card:hover{transform:scale(1.012);box-shadow:var(--shadow-hover)}
.card .ph{aspect-ratio:4/3;height:auto;background-size:cover;background-position:center;background-color:var(--mist-2)}
.card .bd{display:flex;flex-direction:column;flex:1;padding:24px 26px 28px}
.card h3{font-size:24px;line-height:1.17;letter-spacing:.009em;color:var(--ink)}
.card p{flex:1;font-size:17px;line-height:1.47;color:var(--muted);margin:8px 0 18px}
.card .go{font-size:17px;color:var(--accent)}
.card .go::after{content:"\00a0\203A";display:inline-block;transform:scale(1.25);margin-left:.08em}
.card .meta{font-size:12px;font-weight:600;letter-spacing:0;text-transform:none;color:var(--muted);margin-bottom:6px}
.hub-sec+.hub-sec{margin-top:96px}
.hub-sec h2{font-size:clamp(28px,3.6vw,40px);margin-bottom:28px}
.gallery:not(:has(.g)){display:none}
#highlights:not(:has(.feat)):not(:has(.g)){display:none}

/* ---------- tiles (home) ---------- */
.tiles{display:flex;flex-direction:column;gap:12px;padding:12px 0 0}
.tile{position:relative;display:flex;flex-direction:column;align-items:center;min-height:min(92vh,760px);padding:58px var(--gut) 0;overflow:hidden;text-align:center;background:var(--tile-bg,var(--mist));color:var(--ink)}
.tile.white{--tile-bg:var(--paper)}
.tile.dark{--tile-bg:var(--night);color:#f5f5f7}
.tile-text{position:relative;z-index:2;max-width:820px}
.tile .eyebrow{font-size:clamp(19px,2vw,24px);font-weight:600;color:var(--teal);margin-bottom:4px}
.tile.dark .eyebrow{color:var(--accent-dark)}
.tile h2{font-size:clamp(40px,5.6vw,64px);line-height:1.05;letter-spacing:-.01em;margin:0 auto}
.tile .sub{font-size:clamp(21px,2.4vw,28px);line-height:1.14;letter-spacing:.007em;margin:8px auto 0;max-width:30ch}
.tile.dark .sub{color:#f5f5f7}
.tile .ctas{margin-top:20px}
.tile-media{position:absolute;left:0;right:0;bottom:0;height:var(--media-h,70%);z-index:1;background-size:cover;background-position:center 60%;
  -webkit-mask-image:linear-gradient(to bottom,transparent 0,#000 42%);mask-image:linear-gradient(to bottom,transparent 0,#000 42%);
  transform:translateY(var(--py,0)) scale(1.06);transform-origin:50% 100%}
.tile-grid .tile{--media-h:62%}
.tile-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;padding:0 12px}
.tile-grid .tile{min-height:620px;padding-top:50px;border-radius:0}
.tile-grid .tile h2{font-size:clamp(32px,3.8vw,44px)}
.tile-grid .tile .sub{font-size:clamp(19px,1.9vw,21px);max-width:26ch}
.tile-grid .tile .ctas .btn{font-size:14px;padding:8px 16px}
.tile .ba{position:relative;z-index:2;width:min(980px,100%);margin:44px auto 56px}

/* ---------- numbers ---------- */
.nums{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:40px;text-align:center;margin-top:72px}
.nums b{display:block;font:600 clamp(52px,6.4vw,88px)/1 var(--font-display);letter-spacing:-.02em;background:linear-gradient(180deg,#5fdade 0%,#00a2a7 55%,#007377 100%);-webkit-background-clip:text;background-clip:text;color:transparent;font-variant-numeric:tabular-nums}
.nums span{display:block;margin-top:14px;font-size:17px;font-weight:600;color:#a1a1a6}

/* ---------- story (sticky scroll) ---------- */
.story{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:80px;align-items:start;margin-top:40px}
.story-media{position:sticky;top:calc(50vh - min(38vh,330px));height:min(76vh,660px);border-radius:var(--radius-lg);overflow:hidden;background:var(--mist-2)}
.story-media .sm{position:absolute;inset:0;background-size:cover;background-position:center;opacity:0;transform:scale(1.06);transition:opacity .7s var(--ease),transform 1.4s var(--ease)}
.story-media .sm.on{opacity:1;transform:none}
.story-steps .st{min-height:76vh;display:flex;flex-direction:column;justify-content:center;opacity:.22;transition:opacity .6s var(--ease)}
.story-steps .st.on{opacity:1}
.story-steps .st:first-child{min-height:60vh}
.st .n{font-size:17px;font-weight:600;color:var(--teal)}
.st h3{font-size:clamp(30px,3.6vw,44px);line-height:1.1;margin:8px 0 14px}
.st p{font-size:21px;line-height:1.38;color:var(--muted);max-width:30ch}
.st .st-img{display:none}
html:not(.js) .story-steps .st{opacity:1}

/* ---------- steps (services) ---------- */
.steps{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px;margin-top:48px}
.step{border:0;background:var(--mist);border-radius:var(--radius-lg);padding:30px 28px 34px}
.step .n{display:block;font-size:14px;font-weight:600;letter-spacing:.02em;color:var(--teal)}
.step h3{font-size:24px;line-height:1.17;margin:12px 0 10px}
.step p{font-size:17px;color:var(--muted)}

/* ---------- FAQ ---------- */
.faq{margin-top:0;max-width:980px}
.faq h2{font-size:clamp(32px,4.4vw,48px);line-height:1.08;margin-bottom:34px}
.faq details{border:0;border-top:1px solid var(--line);border-radius:0;background:none;margin:0;overflow:hidden}
.faq details:last-of-type{border-bottom:1px solid var(--line)}
.faq summary{position:relative;display:block;list-style:none;cursor:pointer;padding:26px 56px 26px 0;font:600 clamp(19px,2vw,24px)/1.2 var(--font-display);letter-spacing:.009em;color:var(--ink)}
.faq summary::-webkit-details-marker{display:none}
.faq summary::after{content:"";position:absolute;right:6px;top:50%;width:16px;height:16px;margin-top:-8px;color:var(--ink);
  background:linear-gradient(currentColor,currentColor) center/16px 1.6px no-repeat,linear-gradient(currentColor,currentColor) center/1.6px 16px no-repeat;transition:transform .4s var(--ease-io)}
.faq details[open] summary::after{transform:rotate(135deg)}
.faq summary:hover{color:var(--accent)}
.faq details p{padding:0 56px 30px 0;font-size:17px;line-height:1.53;color:var(--ink-2);max-width:70ch}
.related{margin-top:96px}
.related h2{font-size:clamp(24px,3vw,32px);margin-bottom:22px}
.chips{display:flex;flex-wrap:wrap;gap:12px;margin-top:22px}
.chips a{display:inline-block;padding:11px 20px;border:0;border-radius:980px;background:var(--mist);font-size:14px;line-height:1.3;font-weight:400;color:var(--ink);text-decoration:none;transition:background .25s,color .25s}
.chips a:hover{background:var(--mist-2);color:var(--accent)}
.alt .chips a{background:var(--paper)}

/* ---------- blog ---------- */
.post-hero{background:var(--paper);color:var(--ink);padding:64px 0 0}
.post-hero::before{display:none}
.post-hero .wrap{max-width:760px;padding:0 var(--gut)}
.post-hero .crumbs{font-size:12px;color:var(--muted);padding-bottom:26px}
.post-hero .crumbs a{color:var(--muted)}
.post-hero .meta{font-size:14px;font-weight:600;letter-spacing:0;text-transform:none;color:var(--muted);margin-bottom:12px}
.post-hero h1{font-size:clamp(34px,5vw,52px);line-height:1.08;max-width:none}
.post-cover{max-width:1068px;margin:48px auto 0;padding:0 var(--gut)}
.post-cover div{aspect-ratio:16/8;border-radius:var(--radius-lg);background:var(--hero-img) center/cover no-repeat var(--mist);view-transition-name:hero-img}
.post-content{max-width:760px;margin:0 auto;padding:56px var(--gut) 40px;font-size:19px;line-height:1.58}
.post-content p,.post-content ul,.post-content ol{color:var(--ink-2);margin-bottom:1.15em}
.post-content h2{font-size:clamp(26px,3vw,32px);line-height:1.15;margin:1.8em 0 .6em;color:var(--ink)}
.post-content h3{font-size:24px;margin:1.6em 0 .5em;color:var(--ink)}
.post-content ul,.post-content ol{margin-left:1.3em}
.post-content li{margin-bottom:.45em}
.post-content img{border-radius:var(--radius);margin:1.6em auto;box-shadow:none}
.post-content figcaption{font-size:14px;color:var(--muted);text-align:center}
.post-content blockquote{border-left:3px solid var(--teal);padding:.2em 0 .2em 1.1em;margin:1.4em 0;color:var(--muted);font-size:21px}
.post-content table{border-collapse:collapse;width:100%;margin:1.4em 0;font-size:16px}
.post-content th,.post-content td{border-bottom:1px solid var(--line);padding:10px 12px;text-align:left}
.post-nav{max-width:760px;margin:0 auto;padding:0 var(--gut) 100px;display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap}
.post-nav .btn{white-space:normal}

/* ---------- contact, about, resources ---------- */
.contact-cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px;margin-bottom:64px}
.ccard{border:0;border-radius:var(--radius-lg);padding:36px 30px;background:var(--mist);text-align:center}
.ccard .ic{display:none}
.ccard b{display:block;font:600 24px/1.17 var(--font-display);margin:0 0 8px;color:var(--ink)}
.ccard p{font-size:17px;color:var(--muted)}
.ccard a.big{display:block;margin-top:10px;font-size:19px;font-weight:600;color:var(--accent)}
.form{background:var(--mist);border:0;border-radius:var(--radius-lg);padding:40px}
.form h2{font-size:32px;margin-bottom:8px}
.form .note{font-size:14px;color:var(--muted);margin-bottom:22px}
.form .row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.form label,.gx-fields label,.svc label{font-size:14px;font-weight:600;color:var(--ink)}
.form label{display:block;margin:14px 0 6px}
input,select,textarea{font:inherit}
.form input,.form select,.form textarea,.gx-fields input,.gx-fields select,.gx-fields textarea,.svc input:not([type=radio]),.svc select,.svc textarea{
  width:100%;padding:14px 16px;border:1px solid #d2d2d7;border-radius:12px;background:#fff;color:var(--ink);font-size:17px;line-height:1.24;transition:border-color .2s,box-shadow .2s}
.form input:focus,.form select:focus,.form textarea:focus,.gx-fields input:focus,.gx-fields select:focus,.gx-fields textarea:focus,.svc input:focus,.svc select:focus,.svc textarea:focus{
  outline:0;border-color:var(--accent);box-shadow:0 0 0 4px rgba(0,115,119,.16)}
.form button{margin-top:22px}
.team{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px;margin-top:56px}
.tm{border:0;border-radius:var(--radius-lg);padding:32px 22px;background:var(--mist);text-align:center}
.tm .avatar{width:76px;height:76px;margin:0 auto 14px;border-radius:50%;background:linear-gradient(160deg,#5fdade,#007377);color:#fff;display:flex;align-items:center;justify-content:center;font:600 24px/1 var(--font-display)}
.tm b{display:block;font-size:19px;color:var(--ink)}
.tm span{font-size:14px;color:var(--muted)}
.tm p{font-size:14px!important;line-height:1.43;color:var(--muted)!important}
.dl-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px;margin-top:0}
.dlc{display:flex;flex-direction:column;border:0;border-radius:var(--radius);overflow:hidden;background:var(--paper);box-shadow:var(--shadow);text-decoration:none!important;transition:transform .4s var(--ease-out),box-shadow .4s var(--ease-out)}
.dlc:hover{transform:scale(1.012);box-shadow:var(--shadow-hover)}
.dlc .cover{height:240px;background-size:cover;background-position:top center;background-color:var(--mist)}
.dlc .bd{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:18px 20px}
.dlc b{font-size:17px;color:var(--ink)}
.dlc .tag{font-size:12px;font-weight:600;letter-spacing:0;color:var(--muted);background:var(--mist);padding:4px 10px;border-radius:980px}
.svc-cta{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:48px}
.svc-cta a{position:relative;display:block;overflow:hidden;padding:44px 36px;border-radius:var(--radius-lg);background:var(--night);color:#f5f5f7;text-decoration:none!important;transition:transform .4s var(--ease-out)}
.svc-cta a:hover{transform:scale(1.012);outline:0}
.svc-cta a::before{content:"";position:absolute;inset:0;background:var(--panel-img) center/cover;opacity:.32}
.svc-cta a>*{position:relative;z-index:1}
.svc-cta h3{font-size:32px;margin-bottom:10px}
.svc-cta p{font-size:17px;color:#d2d2d7;margin-bottom:16px}
.svc-cta .go{color:var(--accent-dark)}
.svc-cta .go::after{content:"\00a0\203A"}
.projects-bg{background:var(--mist)}
.badge{display:inline-block;margin-left:8px;padding:3px 10px;border-radius:980px;background:var(--accent-dark);color:#000;font-size:12px;font-weight:600;vertical-align:4px}

/* ---------- before / after ---------- */
.ba{display:none;margin:44px auto 0;max-width:980px}
html.js .ba{display:block}
.ba-frame{position:relative;border:0;border-radius:var(--radius-lg);overflow:hidden;background:#0b2a2c;touch-action:none;box-shadow:0 30px 80px rgba(0,0,0,.45)}
.ba-frame svg{display:block;width:100%;height:auto}
.ba-top{position:absolute;inset:0;clip-path:inset(0 0 0 50%)}
.ba-handle{position:absolute;top:0;bottom:0;left:50%;width:0;z-index:3;pointer-events:none}
.ba-handle::before{content:"";position:absolute;top:0;bottom:0;left:-1px;width:2px;background:#fff}
.ba-handle span{position:absolute;top:50%;left:0;transform:translate(-50%,-50%);width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.92);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);color:#1d1d1f;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:17px;letter-spacing:-1px;box-shadow:0 4px 16px rgba(0,0,0,.35);padding-bottom:2px}
.ba-range{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:ew-resize;z-index:4;margin:0}
.ba-lbl{position:absolute;top:14px;z-index:2;font-size:12px;font-weight:600;letter-spacing:0;text-transform:none;background:rgba(0,0,0,.55);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);color:#fff;padding:6px 12px;border-radius:980px;pointer-events:none}
.ba-lbl.l{left:14px}
.ba-lbl.r{right:14px;background:rgba(76,201,205,.9);color:#000}
.ba p{font-size:14px;color:#a1a1a6;margin-top:16px;text-align:center}
.ba p b{color:#f5f5f7;font-weight:600}

/* ---------- closing tile and footer ---------- */
.cta{position:relative;overflow:hidden;background:var(--paper);color:var(--ink);text-align:center;border-top:1px solid var(--mist-2)}
.cta::before,.cta::after{display:none!important}
.cta .wrap{position:relative;padding:120px var(--gut)}
.cta .eyebrow{color:var(--teal)!important}
.cta h2{font-size:clamp(38px,5.6vw,64px);line-height:1.05;max-width:16ch;margin:0 auto}
.cta p{font-size:21px;line-height:1.38;color:var(--muted);max-width:40ch;margin:18px auto 32px}
.cta .phone-big{display:block;margin-top:26px;font-size:21px;font-weight:600;color:var(--ink)}
.cta .addr{margin:.3em auto 0;font-size:14px}
.cta .cert{margin-top:26px;font-size:12px;color:var(--muted);max-width:none}
.cta .cert .keystone-sm{width:13px;height:13px;vertical-align:-2px;margin-right:7px}
.gf{background:var(--mist);color:var(--muted);font-size:12px;line-height:1.33;letter-spacing:-.01em}
.gf-in{max-width:1024px;margin:0 auto;padding:18px var(--gut) 22px}
.gf a{color:#424245}
.gf a:hover{color:var(--ink);text-decoration:underline}
.gf-notes{padding:4px 0 12px;border-bottom:1px solid var(--line)}
.gf-notes p{margin-bottom:.8em}
.gf-crumbs{display:flex;align-items:center;gap:8px;padding:14px 0;border-bottom:1px solid var(--line)}
.gf-crumbs img{height:13px;width:auto;border-radius:1px}
.gf-crumbs .sep{color:var(--faint)}
.gf-dir{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:0 24px;padding:22px 0 12px}
.gf-col h3{font:600 12px/1.33 var(--font);letter-spacing:-.01em;color:var(--ink);margin-bottom:.8em}
.gf-col h3 button{all:unset;cursor:default}
.gf-col ul{list-style:none}
.gf-col li{margin-bottom:.8em}
.gf-col h3+ul+h3{margin-top:1.8em}
.gf-more{padding:4px 0 12px;border-bottom:1px solid var(--line)}
.gf-legal{display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px 20px;padding-top:12px}
.gf-legal span:last-child a{padding:0 8px;border-right:1px solid var(--line)}
.gf-legal span:last-child a:last-child{border-right:0}
.gf-legal span:last-child a:first-child{padding-left:0}
@media (max-width:833px){
  .gf-dir{display:block;padding:8px 0}
  .gf-col{border-bottom:1px solid var(--line)}
  .gf-col h3{margin:0}
  .gf-col h3 button{all:unset;display:flex;justify-content:space-between;width:100%;padding:12px 0;cursor:pointer;color:var(--ink)}
  .gf-col h3 button::after{content:"+";color:var(--muted);font-weight:400;font-size:17px;line-height:12px;transition:transform .3s var(--ease-io)}
  .gf-col.open h3 button::after{transform:rotate(45deg)}
  .gf-col ul{display:none;padding:2px 0 14px 14px}
  .gf-col.open ul{display:block}
  .gf-col h3+ul+h3{margin-top:0;border-top:1px solid var(--line)}
}

/* ---------- motion ---------- */
@media (prefers-reduced-motion:no-preference){
  html.js .rv{opacity:0;transform:translateY(44px);transition:opacity 1s var(--ease) var(--rv-d,0ms),transform 1s var(--ease) var(--rv-d,0ms)}
  html.js .rv.in{opacity:1;transform:none}
  html.js .rv-fade{opacity:0;transition:opacity 1.2s var(--ease) var(--rv-d,0ms)}
  html.js .rv-fade.in{opacity:1}
}

/* ---------- responsive ---------- */
@media (max-width:1068px){
  .cards,.post-grid,.dl-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
  .team{grid-template-columns:repeat(3,minmax(0,1fr))}
  .gf-dir{grid-template-columns:repeat(3,minmax(0,1fr));row-gap:20px}
}
@media (max-width:833px){
  section.block{padding:80px 0}
  .ph-media{margin-top:44px}
  .ph-img{aspect-ratio:4/3;border-radius:var(--radius)}
  .ah-img{height:62vh;border-radius:var(--radius)}
  .ov-grid,.twocol{grid-template-columns:1fr;gap:40px;margin-top:56px}
  .feat{grid-template-columns:1fr}
  .feat>div{min-height:200px;padding:30px 26px}
  .feat>div::after{left:26px}
  .tile-grid{grid-template-columns:1fr;padding:0}
  .tile{min-height:640px;padding-top:44px}
  .tile-grid .tile{min-height:560px}
  .tile{--media-h:52%}
  .tile-grid .tile{--media-h:50%}
  .nums{grid-template-columns:repeat(2,minmax(0,1fr));gap:44px 20px}
  .story{grid-template-columns:1fr;gap:0}
  .story-media{display:none}
  .story-steps .st,.story-steps .st:first-child{min-height:0;opacity:1;padding:34px 0}
  .st .st-img{display:block;aspect-ratio:16/10;border-radius:var(--radius);background-size:cover;background-position:center;margin-bottom:22px}
  .steps{grid-template-columns:repeat(2,minmax(0,1fr))}
  .contact-cards,.svc-cta,.form .row{grid-template-columns:1fr}
  .team{grid-template-columns:repeat(2,minmax(0,1fr))}
  .gallery{grid-auto-columns:86vw;gap:14px}
  .rail{grid-auto-columns:78vw}
  .rail-card{height:420px}
  .faq summary{padding-right:40px}
  .faq details p{padding-right:0}
}
@media (max-width:600px){
  .cards,.post-grid,.dl-grid,.steps,.team{grid-template-columns:1fr}
  .tile .ctas .btn{font-size:15px;padding:9px 18px}
  .form{padding:26px 20px}
  .lead{font-size:19px}
}
`;

/* restyles for the components extras.js, growth.js and where.js bring (loads after their CSS) */
const CSS_AFTER = String.raw`
/* page transitions: the nav holds still, the page fades and rises, a clicked photo grows into the next hero */
@view-transition{navigation:auto}
::view-transition-old(root){animation:.3s var(--ease-io) both vt-out}
::view-transition-new(root){animation:.6s var(--ease) both vt-in}
::view-transition-group(hero-img){animation-duration:.62s;animation-timing-function:cubic-bezier(.4,0,.2,1)}
::view-transition-old(hero-img),::view-transition-new(hero-img){height:100%;object-fit:cover;animation-duration:.62s}
::view-transition-group(ln){animation-duration:.4s}
@keyframes vt-out{to{opacity:0;transform:scale(.985)}}
@keyframes vt-in{from{opacity:0;transform:translateY(22px)}}
@media (prefers-reduced-motion:reduce){@view-transition{navigation:none}}
.btn:hover{transform:none;box-shadow:none}
.btn:active{transform:scale(.97)}
.hero .btn-ghost,.page-hero .btn-ghost{background:transparent;border-color:var(--accent);color:var(--accent);-webkit-backdrop-filter:none;backdrop-filter:none}
.hero .btn-ghost:hover,.page-hero .btn-ghost:hover{background:var(--accent);color:#fff}
button.btn{font-weight:400}
:focus-visible{outline:2px solid var(--accent);outline-offset:3px}

/* specify and quote */
.spec{grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:40px;margin:96px 0 0;padding:48px 48px;border:0;border-radius:var(--radius-lg);background:var(--mist);box-shadow:none}
.alt .spec{background:var(--paper)}
.spec h2{font-size:clamp(28px,3.4vw,40px);line-height:1.1;margin:.1em 0 .7em}
.spec dl{font-size:17px;gap:10px 22px}
.spec dt{color:var(--muted);font-weight:400}
.spec dd a{color:var(--accent);font-weight:400}
.spec-r{gap:12px}
.spec-r .btn{width:100%}
.est-note{font-size:14px;color:var(--muted);margin-top:12px}
.sec-h{font-size:clamp(28px,3.6vw,40px);margin:88px 0 20px}
.csi,.gx-table table{width:100%;border-collapse:collapse;font-size:17px}
.csi th,.csi td,.gx-table th,.gx-table td{padding:16px 14px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}
.csi th{font-size:12px;font-weight:600;text-transform:none;letter-spacing:0;color:var(--muted)}
.csi td:first-child{color:var(--ink);font-weight:600}

/* growth: pillar sections, tables, cards, steps, quick quote, maps */
.gx-aka{margin-top:0;padding:18px 24px;border:0;border-radius:var(--radius);background:var(--mist);font-size:17px;color:var(--muted)}
.gx-aka b{color:var(--ink);font-weight:600}
.alt .gx-aka{background:var(--paper)}
.gx-sec{margin-top:96px}
.gx-sec h2{font-size:clamp(30px,4vw,48px);line-height:1.08;margin-bottom:16px;max-width:22ch}
.gx-sec>p{font-size:19px;line-height:1.47;color:var(--muted);max-width:60ch;margin-bottom:28px}
.gx-table{border:0;border-radius:0;overflow-x:auto}
.gx-table thead th{background:none;color:var(--muted);font-size:12px;font-weight:600;border-bottom:1px solid var(--ink)}
.gx-table tbody th{background:none;color:var(--ink);font-weight:600;white-space:normal}
.gx-table td{color:var(--ink-2)}
.gx-cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}
.gx-card{display:block;padding:30px 28px;border:0;border-radius:var(--radius-lg);background:var(--mist);color:var(--ink);text-decoration:none!important;transition:transform .4s var(--ease-out),background .3s}
a.gx-card:hover{transform:scale(1.015);box-shadow:none;background:var(--mist-2)}
.gx-card b{display:block;font:600 21px/1.2 var(--font-display);color:var(--ink);margin-bottom:8px}
.gx-card span{font-size:17px;line-height:1.47;color:var(--muted)}
.gx-steps{gap:16px}
.gx-steps li{border:0;border-radius:var(--radius-lg);background:var(--mist);padding:28px 24px}
.gx-steps li::before{font:600 40px/1 var(--font-display);background:linear-gradient(180deg,#5fdade,#007377);-webkit-background-clip:text;background-clip:text;color:transparent;margin-bottom:14px}
.gx-steps b{font-size:19px;color:var(--ink)}
.gx-steps span{font-size:15px;color:var(--muted)}
.gx-quote{margin-top:96px;grid-template-columns:minmax(0,.85fr) minmax(0,1.15fr);gap:44px;padding:56px 52px;border-radius:var(--radius-lg);background:var(--night);color:#f5f5f7}
.gx-quote h2{font-size:clamp(30px,3.6vw,44px);line-height:1.08;color:#f5f5f7}
.gx-quote p{font-size:19px;color:#a1a1a6;opacity:1;margin-top:12px}
.gx-fields{gap:14px}
.gx-fields label{color:#d2d2d7;gap:6px;font-weight:600;font-size:14px}
.gx-fields input,.gx-fields select,.gx-fields textarea{background:#1d1d1f;border-color:#424245;color:#f5f5f7}
.gx-fields input:focus,.gx-fields select:focus,.gx-fields textarea:focus{border-color:var(--accent-dark);box-shadow:0 0 0 4px rgba(76,201,205,.22)}
.gx-fields .btn{background:#00858a;color:#fff;font-weight:400;padding:12px 26px}
.gx-fields .btn:hover{background:#009a9f}
.gx-more{margin-top:22px;font-weight:400;font-size:17px}
.gx-more a::after{content:"\00a0\203A"}
.gx-map p{font-size:19px;color:var(--muted)}
.gx-map figure,.gx-rmap{background:var(--mist);border-radius:var(--radius-lg);padding:28px}
.alt .gx-map figure,.alt .gx-rmap{background:var(--paper)}
.gx-map path.l0,.gx-rmap path.l0{fill:#e3e3e8}
.gx-map path.l1{fill:#a6dadc}.gx-rmap path.l1{fill:#cfe6e7}
.gx-map figcaption{font-size:14px;color:var(--muted)}
.gx-hq text,.gx-rmap .gx-hq text,.gx-rmap .gx-dc text{font-family:var(--font)}
.gx-region .gx-card{background:var(--mist)}
.gx-region ul{color:var(--ink-2);font-size:17px;padding-left:20px}

/* service form */
.svc-wrap{background:var(--mist)}
.svc{border:0;border-radius:var(--radius-lg);padding:44px 44px;box-shadow:none}
.svc-step{border-top-color:var(--line)}
.svc-step h2{font-size:24px}
.svc-step p{font-size:15px}
.svc-n{background:var(--ink);font-weight:600}
.svc-chips span{border-color:#d2d2d7;padding:10px 16px;font-size:15px}
.svc-chips input:checked+span{background:var(--ink);border-color:var(--ink)}
.svc-chips .svc-hot input:checked+span{background:#bf1e1e;border-color:#bf1e1e}
.svc-ok{border-radius:12px;background:#e3f3f3;color:var(--ink)}
.svc-alert{border:0;border-radius:var(--radius-lg);background:#fff;padding:28px}
.svc-alert h3{color:#bf1e1e;font-size:21px}
.svc-call{color:#bf1e1e;font-weight:600}
.svc-card{border:0;border-radius:var(--radius-lg);padding:28px}
.svc-side{top:calc(var(--ln-h) + 24px)}

/* 3D viewer frame */
.v3d-sec{padding:110px 0;background:var(--mist)}
.v3d-home{background:var(--paper)}
.v3d-head{flex-direction:column;align-items:center;text-align:center;gap:14px;margin-bottom:44px}
.v3d-head h2{font-size:clamp(34px,5vw,56px);line-height:1.07;margin:.1em 0}
.v3d-head p{font-size:21px;line-height:1.38;color:var(--muted);max-width:40ch;margin:0 auto}
.v3d-all{font-weight:400;color:var(--accent)}
.v3d-all::after{content:"\00a0\203A"}
.v3d{border:0;border-radius:var(--radius-lg);box-shadow:none}
.v3d-home .v3d{background:var(--mist)}
.v3d-room{padding-top:40px}
.v3d-foot{text-align:center;font-size:17px}
.v3d-stage{border-radius:var(--radius)}

@media (max-width:833px){
  .spec,.gx-quote{grid-template-columns:1fr;padding:34px 24px}
  .gx-cards{grid-template-columns:1fr}
  .svc{padding:28px 20px}
}
`;

/* ---------------- markup ---------------- */
const ICON = {
  search: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="6.8" cy="6.8" r="5.3"/><path d="M10.7 10.7 15 15"/></svg>',
  prev: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5"/></svg>',
  next: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5"/></svg>',
};

// one flyout column: [heading, [[label, href], ...], big?]
const col = ([h, links, big], start) => `<div class="gn-col${big ? ' big' : ''}"><h3 class="gi" style="--i:${start}">${esc(h)}</h3><ul>${links.map(([t, href], i) => `<li class="gi" style="--i:${start + i + 1}"><a href="${href}">${t}</a></li>`).join('')}</ul></div>`;
const flyout = (key, cols) => {
  let n = 0;
  return `<div class="gn-fly" data-fly="${key}" id="fly-${key}"><div class="gn-fly-in">${cols.map((c) => { const html = col(c, n); n += c[1].length + 1; return html; }).join('')}</div></div>`;
};

// nav: { items: [[label, href, flyKey?]], flies: {key: [cols]}, quick: [[label, href]] }
function header(nav) {
  const items = nav.items.map(([t, href, fly]) => `<li${fly ? ` data-fly="${fly}"` : ''}><a href="${href}">${t}</a></li>`).join('');
  const flies = Object.entries(nav.flies).map(([k, cols]) => flyout(k, cols)).join('\n  ');
  const quick = nav.quick.map(([t, href]) => `<a href="${href}">${t}</a>`).join('');
  let i = 0;
  const mMain = nav.items.map(([t, href, fly]) => fly
    ? `<li class="mi" style="--i:${i++}"><button class="gn-mlink" type="button" data-sub="${fly}">${t}</button></li>`
    : `<li class="mi" style="--i:${i++}"><a href="${href}">${t}</a></li>`).join('');
  const mSubs = Object.entries(nav.flies).map(([k, cols]) => {
    let j = 0;
    return `<div class="gn-mp sub" data-sub="${k}"><button class="gn-mback mi" type="button" style="--i:${j++}">Back</button>${cols.map(([h, links, big]) => `<h3 class="mi" style="--i:${j++}">${esc(h)}</h3><ul class="${big ? '' : 'small'}">${links.map(([t, href]) => `<li class="mi" style="--i:${j++}"><a href="${href}">${t}</a></li>`).join('')}</ul>`).join('')}</div>`;
  }).join('');
  return `
<a class="skip" href="#main">Skip to content</a>
<div class="gn-curtain" aria-hidden="true"></div>
<nav class="gn" aria-label="Global">
  <div class="gn-flybg"></div>
  <div class="gn-in">
    <a class="gn-logo" href="index.html" aria-label="O'Brien Systems home"><img src="${MARK}" alt="O'Brien Systems" width="464" height="142"></a>
    <ul class="gn-list">${items}</ul>
    <div class="gn-tools">
      <button class="gn-icon gn-search" type="button" data-fly="search" aria-label="Search obriensys.com" aria-expanded="false">${ICON.search}</button>
      <button class="gn-icon gn-burger" type="button" aria-label="Menu" aria-expanded="false" aria-controls="gn-m"><span></span><span></span></button>
    </div>
  </div>
  ${flies}
  <div class="gn-fly" data-fly="search" id="fly-search"><div class="gn-fly-in"><div class="gn-search-in">
    <form class="gn-sform gi" role="search" action="#" style="--i:0">${ICON.search.replace('viewBox="0 0 16 16"', 'viewBox="0 0 16 16"')}<input type="search" placeholder="Search obriensys.com" aria-label="Search obriensys.com" autocomplete="off"></form>
    <div class="gn-col"><h3 class="gi" style="--i:1" data-sh>Quick links</h3><div class="gn-sres gi" style="--i:2" data-quick>${quick}</div></div>
  </div></div></div>
</nav>
<div class="gn-m" id="gn-m" aria-label="Menu">
  <div class="gn-mp main"><ul>${mMain}</ul></div>
  ${mSubs}
</div>
${nav.ribbon ? `<div class="ribbon"><p>${nav.ribbon}</p></div>` : ''}`;
}

function localNav(title, links, cta) {
  return `<nav class="ln" aria-label="${esc(title.replace(/<[^>]+>/g, ''))}"><div class="ln-in">
  <a class="ln-title" href="#top">${title}</a>
  <div class="ln-menu">${links.length ? `<div class="ln-links">${links.map(([id, t]) => `<a href="#${id}">${t}</a>`).join('')}</div>` : ''}<a class="ln-cta" href="${cta[1]}">${cta[0]}</a></div>
</div></nav>`;
}

// footer: { notes: [html], cols: [[heading, [[label, href]]], ...] (a heading can stack under another with the same column index) , legal }
function footer(f) {
  const cols = f.cols.map((c) => `<div class="gf-col">${c.map(([h, links]) => `<h3><button type="button">${esc(h)}</button></h3><ul>${links.map(([t, href]) => `<li><a href="${href}">${t}</a></li>`).join('')}</ul>`).join('')}</div>`).join('');
  return `
<footer class="gf">
  <div class="gf-in">
    <div class="gf-notes">${f.notes.map((n) => `<p>${n}</p>`).join('')}</div>
    <nav class="gf-crumbs" aria-label="Breadcrumb"><a href="index.html"><img src="${MARK}" alt="O'Brien Systems" width="464" height="142"></a><span class="sep">&rsaquo;</span><span data-crumb></span></nav>
    <div class="gf-dir">${cols}</div>
    <div class="gf-more">${f.more}</div>
    <div class="gf-legal">${f.legal}</div>
  </div>
</footer>`;
}

/* ---------------- the browser side, serialized into assets/site.js ---------------- */
function site(SEARCH) {
  var d = document, de = d.documentElement, w = window;
  de.classList.add('js');
  var reduce = w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var wide = w.matchMedia('(min-width: 834px)');
  var IO = 'IntersectionObserver' in w;
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };

  /* photos arrive as they come near the screen (data-bg) */
  (function () {
    var els = $$('[data-bg]'); if (!els.length) return;
    var show = function (el) { el.style.backgroundImage = "url('" + el.getAttribute('data-bg') + "')"; el.removeAttribute('data-bg'); };
    if (!IO) { els.forEach(show); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } }); }, { rootMargin: '600px 600px' });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* global nav: flyouts on hover, search, curtain */
  (function () {
    var gn = d.querySelector('.gn'); if (!gn) return;
    var bg = gn.querySelector('.gn-flybg'), flies = {}, cur = null, openT = 0, closeT = 0;
    $$('.gn-fly', gn).forEach(function (f) { flies[f.getAttribute('data-fly')] = f; });
    var input = gn.querySelector('.gn-sform input'), sbtn = gn.querySelector('.gn-search');
    function open(key) {
      clearTimeout(closeT); clearTimeout(openT);
      if (cur === key) return;
      var f = flies[key]; if (!f) return close();
      if (cur) flies[cur].classList.remove('on');
      f.classList.add('on'); cur = key;
      gn.classList.add('fly-open'); de.classList.add('fly-open');
      bg.style.height = (gn.querySelector('.gn-in').offsetHeight + f.offsetHeight) + 'px';
      $$('.gn-list li', gn).forEach(function (li) { li.classList.toggle('open', li.getAttribute('data-fly') === key); });
      if (sbtn) sbtn.setAttribute('aria-expanded', key === 'search' ? 'true' : 'false');
      if (key === 'search' && input) setTimeout(function () { input.focus(); }, 60);
    }
    function close() {
      clearTimeout(openT); clearTimeout(closeT);
      if (!cur) return;
      flies[cur].classList.remove('on'); cur = null;
      bg.style.height = ''; gn.classList.remove('fly-open'); de.classList.remove('fly-open');
      $$('.gn-list li.open', gn).forEach(function (li) { li.classList.remove('open'); });
      if (sbtn) sbtn.setAttribute('aria-expanded', 'false');
    }
    w.__gnClose = close;
    $$('.gn-list > li', gn).forEach(function (li) {
      var key = li.getAttribute('data-fly');
      li.addEventListener('mouseenter', function () {
        if (!wide.matches || cur === 'search') return;
        clearTimeout(openT); clearTimeout(closeT);
        if (key) openT = setTimeout(function () { open(key); }, cur ? 0 : 140);
        else if (cur) openT = setTimeout(close, 140);
      });
      li.addEventListener('mouseleave', function () { clearTimeout(openT); });
      var a = li.querySelector('a');
      if (key) a.addEventListener('keydown', function (e) { if (e.key === 'ArrowDown') { e.preventDefault(); open(key); var first = flies[key].querySelector('a'); if (first) first.focus(); } });
    });
    gn.addEventListener('mouseleave', function () { if (cur && cur !== 'search') closeT = setTimeout(close, 180); });
    gn.addEventListener('mouseenter', function () { clearTimeout(closeT); });
    if (sbtn) sbtn.addEventListener('click', function () { if (cur === 'search') close(); else { if (de.classList.contains('m-open')) toggleMenu(false); open('search'); } });
    var curtain = d.querySelector('.gn-curtain'); if (curtain) curtain.addEventListener('click', close);
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape') { if (cur) { var was = cur; close(); var t = was === 'search' ? sbtn : gn.querySelector('[data-fly="' + was + '"] > a'); if (t) t.focus(); } if (de.classList.contains('m-open')) toggleMenu(false); } });
    gn.addEventListener('focusout', function (e) { if (cur && cur !== 'search' && !gn.contains(e.relatedTarget)) close(); });
    wide.addEventListener && wide.addEventListener('change', function () { close(); toggleMenu(false); });

    /* search over every page title */
    var res = gn.querySelector('[data-quick]'), head = gn.querySelector('[data-sh]'), quick = res ? res.innerHTML : '';
    function render(q) {
      q = (q || '').trim().toLowerCase();
      if (!q) { res.innerHTML = quick; head.textContent = 'Quick links'; return; }
      var words = q.split(/\s+/), hits = [];
      for (var i = 0; i < SEARCH.length; i++) {
        var t = SEARCH[i][0].toLowerCase(), k = (SEARCH[i][3] || '').toLowerCase(), ok = true, score = 0;
        for (var j = 0; j < words.length; j++) { var p = t.indexOf(words[j]); if (p < 0 && k.indexOf(words[j]) < 0) { ok = false; break; } score += p === 0 ? 3 : p > 0 ? 2 : 1; }
        if (ok) hits.push([score + (SEARCH[i][2] === 'Blog' ? 0 : 1), SEARCH[i]]);
      }
      hits.sort(function (a, b) { return b[0] - a[0]; });
      head.textContent = hits.length ? 'Suggested pages' : 'No matches';
      res.innerHTML = hits.slice(0, 9).map(function (h, n) { return '<a href="' + h[1][1] + '"' + (n ? '' : ' class="sel"') + '>' + h[1][0].replace(/&/g, '&amp;').replace(/</g, '&lt;') + ' <span>' + h[1][2] + '</span></a>'; }).join('') || '<p>Try another word, or call 610.825.3405.</p>';
    }
    if (input) {
      input.addEventListener('input', function () { render(input.value); });
      input.form.addEventListener('submit', function (e) { e.preventDefault(); var a = res.querySelector('a'); if (a) location.href = a.getAttribute('href'); });
    }

    /* mobile menu */
    var burger = gn.querySelector('.gn-burger'), m = d.getElementById('gn-m');
    function toggleMenu(on) {
      if (!burger || !m) return;
      on = typeof on === 'boolean' ? on : !de.classList.contains('m-open');
      if (on) close();
      de.classList.toggle('m-open', on);
      burger.setAttribute('aria-expanded', on ? 'true' : 'false');
      burger.setAttribute('aria-label', on ? 'Close' : 'Menu');
      if (!on) { m.classList.remove('sub-on'); $$('.gn-mp.sub.on', m).forEach(function (p) { p.classList.remove('on'); }); }
    }
    if (burger) burger.addEventListener('click', function () { toggleMenu(); });
    if (m) {
      $$('[data-sub]', m.querySelector('.gn-mp.main')).forEach(function (b) {
        b.addEventListener('click', function () { var p = m.querySelector('.gn-mp.sub[data-sub="' + b.getAttribute('data-sub') + '"]'); if (!p) return; p.classList.add('on'); m.classList.add('sub-on'); });
      });
      $$('.gn-mback', m).forEach(function (b) { b.addEventListener('click', function () { m.classList.remove('sub-on'); var p = b.closest('.gn-mp'); setTimeout(function () { p.classList.remove('on'); }, 420); }); });
    }
  })();

  /* local nav: frosted once it sticks, and the section you are reading */
  (function () {
    var ln = d.querySelector('.ln'); if (!ln || !IO) return;
    var s = d.createElement('div'); s.setAttribute('aria-hidden', 'true'); s.style.cssText = 'height:1px;margin-bottom:-1px';
    ln.parentNode.insertBefore(s, ln);
    new IntersectionObserver(function (es) { var e = es[0]; ln.classList.toggle('stuck', !e.isIntersecting && e.boundingClientRect.top < 0); }).observe(s);
    var links = $$('.ln-links a[href^="#"]', ln);
    var map = links.map(function (a) { return d.getElementById(a.getAttribute('href').slice(1)); });
    if (!links.length) return;
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { var i = map.indexOf(e.target); links.forEach(function (a, n) { a.classList.toggle('on', n === i); }); } });
    }, { rootMargin: '-45% 0px -50% 0px' });
    map.forEach(function (sec) { if (sec) spy.observe(sec); });
  })();

  /* footer breadcrumb from the page's own trail, and accordions on phones */
  (function () {
    var c = d.querySelector('[data-crumb]'), trail = d.querySelector('.crumbs');
    if (c) {
      var t = trail ? trail.textContent.split('/').map(function (x) { return x.trim(); }).filter(Boolean) : [];
      c.textContent = t.length > 1 ? t.slice(1).join(' › ') : (d.querySelector('h1') ? d.querySelector('h1').textContent : 'Home');
    }
    $$('.gf-col h3 button').forEach(function (b) { b.addEventListener('click', function () { if (!wide.matches) b.closest('.gf-col').classList.toggle('open'); }); });
  })();

  /* reveals: things rise into place as they reach the screen */
  (function () {
    if (reduce || !IO) return;
    var sel = '[data-rv],section.block h2,.sec-head .lead,.sh-center .lead,.card,.feat>div,.gx-sec,.gx-card,.gx-steps li,.gx-quote,.spec,.faq details,.tm,.dlc,.ccard,.step,.tile-text>*,.tile .ba,.rail-card,.nums>div,.v3d-head,.v3d,.ov-grid>*,.hl-text,.related,.svc,.svc-side>*,.form,.cta .wrap>*,.gx-map figure,.st>*';
    var els = $$(sel).filter(function (el) { return !el.closest('.gn,.gn-m,.ln,.gf,.page-hero,.hero,.post-hero'); });
    var groups = new Map();
    els.forEach(function (el) {
      var p = el.parentNode, n = groups.get(p) || 0; groups.set(p, n + 1);
      el.classList.add(el.matches('.v3d') ? 'rv-fade' : 'rv');
      el.style.setProperty('--rv-d', Math.min(n, 6) * 90 + 'ms');
    });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target; el.classList.add('in'); io.unobserve(el);
        setTimeout(function () { el.classList.remove('rv', 'rv-fade', 'in'); el.style.removeProperty('--rv-d'); }, 1500);
      });
    }, { rootMargin: '0px 0px -9% 0px', threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* scroll-linked motion: hero zoom, word highlight, sticky story, parallax */
  (function () {
    var items = $$('[data-scroll]').map(function (el) { return { el: el, t: el.getAttribute('data-scroll'), p: -1, n: -1 }; });
    if (!items.length) return;
    items.forEach(function (it) {
      if (it.t === 'hl') {
        var walker = d.createTreeWalker(it.el, NodeFilter.SHOW_TEXT), nodes = [], node;
        while ((node = walker.nextNode())) nodes.push(node);
        nodes.forEach(function (tn) {
          var frag = d.createDocumentFragment();
          tn.nodeValue.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(d.createTextNode(part)); return; }
            var s = d.createElement('span'); s.className = 'w'; s.textContent = part; frag.appendChild(s);
          });
          tn.parentNode.replaceChild(frag, tn);
        });
        it.words = $$('.w', it.el);
      }
      if (it.t === 'story') { it.steps = $$('.st', it.el); it.media = $$('.sm', it.el); }
    });
    if (reduce || !IO) {
      items.forEach(function (it) {
        it.el.style.setProperty('--p', 1);
        if (it.words) it.words.forEach(function (x) { x.classList.add('on'); });
        if (it.steps) { it.steps.forEach(function (x) { x.classList.add('on'); }); if (it.media[0]) it.media[0].classList.add('on'); }
      });
      return;
    }
    var live = new Set(), queued = false;
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) live.add(e.target.__it); else live.delete(e.target.__it); }); kick(); }, { rootMargin: '25% 0px' });
    items.forEach(function (it) { it.el.__it = it; io.observe(it.el); });
    function kick() { if (!queued) { queued = true; requestAnimationFrame(frame); } }
    function frame() {
      queued = false;
      var vh = w.innerHeight;
      live.forEach(function (it) {
        var r = it.el.getBoundingClientRect(), p, n, i;
        if (it.t === 'zoom') {
          p = clamp((vh * 0.9 - r.top) / (vh * 0.62), 0, 1);
          if (Math.abs(p - it.p) > 0.001) { it.p = p; it.el.style.setProperty('--p', p.toFixed(4)); }
        } else if (it.t === 'hl') {
          p = clamp((vh * 0.88 - r.top) / (r.height + vh * 0.32), 0, 1);
          n = Math.round(p * it.words.length * 1.12);
          if (n !== it.n) { for (i = 0; i < it.words.length; i++) it.words[i].classList.toggle('on', i < n); it.n = n; }
        } else if (it.t === 'story') {
          var best = 0, bd = 1e9;
          it.steps.forEach(function (s, k) { var b = s.getBoundingClientRect(), dist = Math.abs(b.top + b.height / 2 - vh / 2); if (dist < bd) { bd = dist; best = k; } });
          if (best !== it.n) { it.n = best; it.steps.forEach(function (s, k) { s.classList.toggle('on', k === best); }); it.media.forEach(function (m, k) { m.classList.toggle('on', k === best); }); }
        } else if (it.t === 'parallax') {
          p = (r.top + r.height / 2 - vh / 2) / vh;
          it.el.style.setProperty('--py', (p * -36).toFixed(1) + 'px');
        }
      });
    }
    w.addEventListener('scroll', kick, { passive: true });
    w.addEventListener('resize', kick);
    kick();
  })();

  /* numbers count up once */
  (function () {
    var els = $$('[data-count]'); if (!els.length) return;
    if (reduce || !IO) return;
    els.forEach(function (el) { el.textContent = '0'; });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return; io.unobserve(e.target);
        var el = e.target, to = +el.getAttribute('data-count'), t0 = performance.now(), dur = 1500;
        (function tick(now) { var p = clamp((now - t0) / dur, 0, 1); p = 1 - Math.pow(1 - p, 4); el.textContent = Math.round(to * p); if (p < 1) requestAnimationFrame(tick); })(t0);
      });
    }, { threshold: 0.6 });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* galleries and rails: paddles */
  (function () {
    $$('.gallery,.rail').forEach(function (g) {
      if (g.children.length < 2) return;
      var bar = d.createElement('div'); bar.className = 'paddles';
      bar.innerHTML = '<button type="button" aria-label="Previous"><svg viewBox="0 0 16 16"><path d="M10 3 5 8l5 5"/></svg></button><button type="button" aria-label="Next"><svg viewBox="0 0 16 16"><path d="m6 3 5 5-5 5"/></svg></button>';
      g.parentNode.insertBefore(bar, g.nextSibling);
      var prev = bar.children[0], next = bar.children[1];
      var step = function () { var c = g.children[0]; return c ? c.getBoundingClientRect().width + parseFloat(getComputedStyle(g).columnGap || 20) : 400; };
      prev.addEventListener('click', function () { g.scrollBy({ left: -step(), behavior: reduce ? 'auto' : 'smooth' }); });
      next.addEventListener('click', function () { g.scrollBy({ left: step(), behavior: reduce ? 'auto' : 'smooth' }); });
      var upd = function () { prev.disabled = g.scrollLeft < 8; next.disabled = g.scrollLeft + g.clientWidth > g.scrollWidth - 8; };
      g.addEventListener('scroll', function () { requestAnimationFrame(upd); }, { passive: true });
      w.addEventListener('resize', upd); upd();
    });
  })();

  /* FAQ opens and closes smoothly */
  (function () {
    $$('.faq details').forEach(function (det) {
      var sum = det.querySelector('summary'); if (!sum || !det.animate) return;
      var anim = null;
      sum.addEventListener('click', function (e) {
        if (reduce) return;
        e.preventDefault();
        if (anim) anim.cancel();
        var from = det.offsetHeight, opening = !det.open, to;
        if (opening) { det.open = true; to = det.offsetHeight; }
        else { det.open = false; to = det.offsetHeight; det.open = true; }
        det.style.overflow = 'hidden';
        anim = det.animate({ height: [from + 'px', to + 'px'] }, { duration: opening ? 420 : 340, easing: 'cubic-bezier(.4,0,.6,1)' });
        var body = det.querySelector('p');
        if (body && opening) body.animate({ opacity: [0, 1], transform: ['translateY(-6px)', 'none'] }, { duration: 420, easing: 'cubic-bezier(.4,0,.6,1)' });
        anim.onfinish = function () { anim = null; det.style.overflow = ''; if (!opening) det.open = false; };
        anim.oncancel = function () { anim = null; det.style.overflow = ''; };
      });
    });
  })();

  /* before/after slider */
  (function () {
    var frame = d.querySelector('.ba-frame'); if (!frame) return;
    var range = frame.querySelector('.ba-range'), top = frame.querySelector('.ba-top'), handle = frame.querySelector('.ba-handle');
    var set = function (v) { top.style.clipPath = 'inset(0 0 0 ' + v + '%)'; handle.style.left = v + '%'; };
    range.addEventListener('input', function () { set(range.value); }); set(range.value);
    var touched = false; range.addEventListener('pointerdown', function () { touched = true; }, { once: true });
    if (reduce || !IO) return;
    var hio = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return; hio.disconnect();
      var t0 = null, D = 2000;
      (function tick(now) {
        if (touched) { set(range.value); return; }
        if (!t0) t0 = now; var p = Math.min((now - t0) / D, 1);
        var v = 50 + Math.sin(p * Math.PI * 2) * 16 * (1 - p); range.value = v; set(v);
        if (p < 1) requestAnimationFrame(tick); else { range.value = 50; set(50); }
      })(performance.now());
    }, { threshold: 0.65 });
    hio.observe(frame);
  })();

  /* page transitions: the photo you clicked grows into the next page's hero */
  (function () {
    var last = null;
    d.addEventListener('click', function (e) { last = e.target.closest && e.target.closest('a[href]'); }, true);
    var vis = function (el) { var r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < w.innerHeight && r.width > 0; };
    w.addEventListener('pageswap', function (e) {
      if (!e.viewTransition) return;
      var gn = d.querySelector('.gn'); if (gn && !vis(gn)) gn.style.viewTransitionName = 'none';
      $$('.ph-img,.ah-img,.post-cover div').forEach(function (h) { h.style.viewTransitionName = 'none'; });
      if (!last) return;
      var scope = last.closest('.card,.rail-card,.tile,.dlc,.gx-card');
      var img = scope && scope.querySelector('[data-vt-img],.ph,.ri,.tile-media');
      var to = e.activation && e.activation.entry && e.activation.entry.url;
      if (img && to && last.href === to && vis(img)) img.style.viewTransitionName = 'hero-img';
    });
    w.addEventListener('pageshow', function (e) {
      if (!e.persisted) return;
      $$('[style*="view-transition-name"]').forEach(function (el) { el.style.viewTransitionName = ''; });
      if (w.__gnClose) w.__gnClose();
      de.classList.remove('m-open');
    });
  })();
}

const siteJs = (search) => `/* O'Brien Systems: navigation, search and motion (generated by build.js from apple.js) */
(${site.toString()})(${JSON.stringify(search)});
`;

module.exports = { CSS, CSS_AFTER, header, footer, localNav, siteJs, ICON, MARK };
