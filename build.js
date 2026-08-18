// O'Brien Systems redesign mockup - static site generator
// Run: node build.js   (writes *.html + assets/style.css into this folder)
const fs = require('fs');
const path = require('path');
const OUT = __dirname;

const MEDIA = 'https://obriensys.patrick-obrien.com/wp-content/uploads/2026/06';
const MEDIA8 = 'https://obriensys.patrick-obrien.com/wp-content/uploads/2026/08';
const img = (f) => `${MEDIA}/${f}`;

const IMGS = {
  logo: img('b699d-obrien-logo-web.png'),
  heroHome: img('ffb20-homepage-background-1.jpg'),
  compact: img('30583-compact-storage.jpg'),
  mobileSol: img('7009b-mobile-storage-solutions.jpg'),
  hdmsRetail: img('30c49-hdms-retail.jpg'),
  modula1: img('Modula-scaled-1.jpg'),
  modula2: img('Modula-scaled-2.jpg'),
  lockers1: img('4ff3b-agile-lockers-workplace-lockers-1.jpg'),
  lockers2: img('994db-agile-lockers-workplace-lockers.jpg'),
  parcelLockers: img('ca6a3-office-parcel-delivery-lockers-800x534-1.jpg.webp'),
  shelving1: img('74e6c-boxedge_open-shelving-1.jpg'),
  shelving2: img('02bb9-boxedge_open-shelving-e1780410336984.jpg'),
  museumCabs: img('47022-museum_visualcabinets.jpg'),
  artScreen: img('f0445-museum-art-screen.jpg'),
  museumShelv: img('93bb9-museum-shelving.jpg'),
  nemoursCabs: img('4decc-obs__unknown__cabinets__nemours_68__20220805__b4cb4f44-scaled-1.jpg'),
  nemours4: img('a2e77-nemours4.jpg'),
  nemours5: img('ee464-nemours5.jpg'),
  lib1: img('08c93-img_3554-free-lib-scaled-1.jpg'),
  lib2: img('af73f-img_3553-free-lib-scaled-1.jpg'),
  education: img('46a58-education-storage-solutions.jpg'),
  gps: img('60760-gps.jpg'),
  evidence: img('242a4-img_4538-scaled-1.jpg'),
  pharma: img('Pharmaceutical-and-Healthcare-Solutions.jpg'),
  corporate: img('1b16f-corporate-solutions-1.jpg'),
  warehouse: img('e5232-warehouse-solutions.jpg'),
  mhw: img('d34ea-mhw_lc1.jpg'),
  vf: img('2cc54-vertical-farming-storage.jpg'),
  auto: img('9c210-obrien-automotive-banner.jpg'),
  retailMobile: `${MEDIA8}/montel_retail-mobile-e1785338947568.png`,
  resourcesBg: img('4abeb-resources-background.jpg'),
};

/* ---------------- shared CSS ---------------- */
const CSS = `
:root{
  --teal:#007377; --teal-dark:#00565a; --teal-ink:#023c3f; --teal-soft:#7fd6d9;
  --ink:#1c2528; --muted:#5b6b6e; --line:#e3e9e9;
  --paper:#ffffff; --mist:#f4f7f7;
  --radius:14px; --shadow:0 10px 30px rgba(2,60,63,.10);
  --font:"Segoe UI",system-ui,-apple-system,Arial,sans-serif;
}
*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}
body{font-family:var(--font);color:var(--ink);background:var(--paper);line-height:1.6}
img{max-width:100%;display:block}
a{color:var(--teal);text-decoration:none}
h1,h2,h3,h4{line-height:1.15;font-weight:700}
.wrap{max-width:1200px;margin:0 auto;padding:0 24px}
.eyebrow{display:inline-block;font-size:.78rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--teal);margin-bottom:.6rem}
.btn{display:inline-block;padding:.85rem 1.7rem;border-radius:999px;font-weight:700;font-size:.95rem;transition:transform .15s ease, box-shadow .15s ease;cursor:pointer;border:0}
.btn:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,.18)}
.btn-solid{background:var(--teal);color:#fff}
.btn-white{background:#fff;color:var(--teal-ink)}
.btn-ghost{background:transparent;color:#fff;border:2px solid rgba(255,255,255,.85)}
.btn-ghost:hover{background:rgba(255,255,255,.12)}
.ribbon{background:#1c2528;color:#9fb3b5;text-align:center;font-size:.75rem;letter-spacing:.08em;padding:4px 10px;text-transform:uppercase}
.announce{background:var(--teal-ink);color:#cfe9ea;text-align:center;padding:8px 16px;font-size:.85rem}
.announce a{color:var(--teal-soft);font-weight:700}
header{position:sticky;top:0;z-index:50;background:#fff;border-bottom:1px solid var(--line);box-shadow:0 2px 12px rgba(2,60,63,.06)}
.nav{display:flex;align-items:center;gap:22px;height:76px}
.logo img{height:52px;width:auto}
nav.menu{display:flex;gap:0;margin-left:auto}
nav.menu>div{position:relative}
nav.menu a.top{display:block;padding:26px 13px;font-weight:600;font-size:.92rem;color:var(--ink)}
nav.menu>div:hover a.top{color:var(--teal)}
.mega{position:absolute;top:100%;left:50%;transform:translateX(-50%) translateY(8px);background:#fff;border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow);padding:22px;display:none;gap:10px 14px}
.mega::before{content:"";position:absolute;left:-20px;right:-20px;top:-20px;height:24px}
nav.menu>div:hover .mega,nav.menu>div:focus-within .mega{display:grid}
.mega.sol{grid-template-columns:repeat(3,220px)}
.mega.ind{grid-template-columns:repeat(3,215px)}
.mega a{display:block;padding:10px 12px;border-radius:10px}
.mega a:hover{background:var(--mist)}
.mega .t{font-weight:700;font-size:.9rem;color:var(--ink)}
.mega a:hover .t{color:var(--teal)}
.mega .d{font-size:.78rem;color:var(--muted);margin-top:2px;line-height:1.4}
.mega .all{grid-column:1/-1;text-align:center;border-top:1px solid var(--line);margin-top:6px;padding-top:12px;font-weight:700;color:var(--teal);font-size:.85rem}
.head-cta{display:flex;align-items:center;gap:16px}
.head-phone{font-weight:800;color:var(--teal-ink);font-size:.95rem;white-space:nowrap}
.head-cta .btn{padding:.65rem 1.3rem;font-size:.85rem;white-space:nowrap}

/* home hero */
.hero{position:relative;color:#fff;overflow:hidden}
.hero::before{content:"";position:absolute;inset:0;background:var(--hero-img) center/cover no-repeat}
.hero::after{content:"";position:absolute;inset:0;background:linear-gradient(100deg,rgba(2,60,63,.88) 0%,rgba(2,60,63,.55) 55%,rgba(2,60,63,.25) 100%)}
.hero .wrap{position:relative;z-index:2;padding-top:110px;padding-bottom:130px}
.hero h1{font-size:clamp(2.2rem,5vw,3.7rem);max-width:14ch}
.hero h1 em{font-style:normal;color:var(--teal-soft)}
.hero p{max-width:52ch;margin:1.2rem 0 2rem;font-size:1.08rem;color:#e2f0f0}
.hero .ctas{display:flex;gap:14px;flex-wrap:wrap}

/* subpage hero */
.page-hero{position:relative;color:#fff;overflow:hidden;background:var(--teal-ink)}
.page-hero::before{content:"";position:absolute;inset:0;background:var(--hero-img) center/cover no-repeat;opacity:.28}
.page-hero .wrap{position:relative;z-index:2;padding-top:72px;padding-bottom:72px}
.page-hero .eyebrow{color:var(--teal-soft)}
.page-hero h1{font-size:clamp(1.9rem,4vw,3rem);max-width:20ch}
.page-hero p{max-width:60ch;margin-top:1rem;font-size:1.05rem;color:#dcecec}
.crumbs{position:relative;z-index:2;font-size:.8rem;color:#9fc9ca;padding-top:22px}
.crumbs a{color:#cfe9ea}

.apps{position:relative;z-index:3;margin-top:-64px}
.apps .grid{display:grid;grid-template-columns:repeat(7,1fr);background:#fff;border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow);overflow:hidden}
.apps a{padding:22px 8px;text-align:center;border-left:1px solid var(--line);font-size:.78rem;font-weight:700;color:var(--ink);letter-spacing:.02em}
.apps a:first-child{border-left:0}
.apps a:hover{background:var(--mist);color:var(--teal)}
.apps .ic{font-size:1.5rem;display:block;margin-bottom:8px}

.stats{padding:64px 0 8px}
.stats .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;text-align:center}
.stats b{display:block;font-size:2.1rem;color:var(--teal)}
.stats span{font-size:.85rem;color:var(--muted)}

section.block{padding:72px 0}
.block h2{font-size:clamp(1.6rem,3vw,2.3rem);max-width:26ch}
.block h2 em{font-style:normal;color:var(--teal)}
.lead{color:var(--muted);max-width:62ch;margin-top:.8rem}
.sec-head{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;flex-wrap:wrap;margin-bottom:36px}

.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.card{border:1px solid var(--line);border-radius:var(--radius);overflow:hidden;background:#fff;transition:transform .15s ease, box-shadow .15s ease;display:flex;flex-direction:column}
.card:hover{transform:translateY(-4px);box-shadow:var(--shadow)}
.card .ph{height:190px;background-size:cover;background-position:center}
.card .bd{padding:18px 20px 22px;display:flex;flex-direction:column;flex:1}
.card h3{font-size:1.05rem;color:var(--ink)}
.card p{font-size:.87rem;color:var(--muted);margin:.4rem 0 .9rem;flex:1}
.card .go{font-weight:700;font-size:.85rem;color:var(--teal)}

.compare{background:var(--teal-ink);color:#fff}
.compare .eyebrow{color:var(--teal-soft)}
.compare h2 em{color:var(--teal-soft)}
.compare .lead{color:#bcd8d9}
.compare .duo{display:grid;grid-template-columns:1fr 1fr;gap:28px;margin-top:40px}
.compare .panel{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);border-radius:var(--radius);padding:26px}
.compare .panel h3{font-size:1rem;margin-bottom:14px;color:#fff}
.compare .panel p{font-size:.85rem;color:#bcd8d9;margin-top:12px}
.compare svg{width:100%;height:auto;display:block}
.badge{display:inline-block;background:var(--teal-soft);color:var(--teal-ink);font-size:.72rem;font-weight:800;padding:3px 10px;border-radius:999px;letter-spacing:.06em;text-transform:uppercase;margin-left:8px}

.projects-bg{background:var(--mist)}
.proj-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.proj{position:relative;border-radius:var(--radius);overflow:hidden;height:340px;display:flex;align-items:flex-end;color:#fff;background-size:cover;background-position:center}
.proj::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0) 40%,rgba(2,40,42,.88) 100%)}
.proj .cap{position:relative;z-index:2;padding:20px}
.proj .cap .k{font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;color:#9fd9db;font-weight:700}
.proj .cap .t{font-weight:700;font-size:1.02rem;margin-top:4px;line-height:1.3}

.partners-row{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:16px;margin-top:34px}
.pt{border:1px solid var(--line);border-radius:var(--radius);padding:22px 16px;text-align:center;background:#fff}
.pt b{display:block;font-size:1.05rem;letter-spacing:.04em;color:var(--teal-ink)}
.pt span{font-size:.75rem;color:var(--muted);display:block;margin-top:6px;line-height:1.45}

.steps{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-top:38px}
.step{border-top:4px solid var(--teal);background:var(--mist);border-radius:0 0 var(--radius) var(--radius);padding:22px}
.step .n{font-size:.8rem;font-weight:800;color:var(--teal);letter-spacing:.1em}
.step h3{font-size:1.02rem;margin:.4rem 0 .5rem}
.step p{font-size:.85rem;color:var(--muted)}

/* subpage content */
.twocol{display:grid;grid-template-columns:1.2fr .8fr;gap:44px;align-items:start}
.twocol .body p{margin-bottom:1rem;color:#39494c}
.side-img{border-radius:var(--radius);overflow:hidden;box-shadow:var(--shadow)}
.side-img img{width:100%;height:100%;object-fit:cover}
.feat{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin-top:34px}
.feat div{background:var(--mist);border-left:4px solid var(--teal);border-radius:0 10px 10px 0;padding:16px 18px}
.feat b{display:block;font-size:.95rem;color:var(--teal-ink)}
.feat span{font-size:.85rem;color:var(--muted)}
.chips{display:flex;flex-wrap:wrap;gap:10px;margin-top:26px}
.chips a{border:1px solid var(--line);border-radius:999px;padding:.5rem 1.1rem;font-size:.85rem;font-weight:600;color:var(--teal-ink);background:#fff}
.chips a:hover{border-color:var(--teal);color:var(--teal)}
.gallery{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:38px}
.gallery .g{height:230px;border-radius:var(--radius);background-size:cover;background-position:center;box-shadow:var(--shadow)}

.cta{position:relative;color:#fff;overflow:hidden}
.cta::before{content:"";position:absolute;inset:0;background:url('${IMGS.mobileSol}') center/cover}
.cta::after{content:"";position:absolute;inset:0;background:rgba(2,60,63,.9)}
.cta .wrap{position:relative;z-index:2;padding:84px 24px;text-align:center}
.cta h2{font-size:clamp(1.7rem,3.4vw,2.5rem)}
.cta p{color:#cfe9ea;margin:1rem auto 2rem;max-width:56ch}
.cta .phone-big{font-size:1.5rem;font-weight:800;color:var(--teal-soft);display:block;margin-top:1.6rem}

footer{background:#02292b;color:#9fbcbd;font-size:.87rem}
footer .cols{display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr;gap:36px;padding:56px 0 40px}
footer h4{color:#fff;font-size:.95rem;margin-bottom:14px}
footer a{display:block;color:#9fbcbd;padding:3px 0}
footer a:hover{color:var(--teal-soft)}
footer .legal{border-top:1px solid rgba(255,255,255,.12);padding:18px 0;display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px}
footer .legal a{display:inline;padding:0 10px}
.float-cta{position:fixed;right:22px;bottom:22px;z-index:60;background:var(--teal);color:#fff;border-radius:999px;padding:.9rem 1.5rem;font-weight:700;box-shadow:0 10px 26px rgba(2,60,63,.4);font-size:.9rem}
.float-cta:hover{background:var(--teal-dark)}

@media (max-width:960px){
  nav.menu{display:none}
  .apps .grid{grid-template-columns:repeat(4,1fr)}
  .apps a:nth-child(4n+1){border-left:0}
  .stats .grid,.compare .duo,.proj-grid,.cards,.steps,.feat,.twocol,.gallery{grid-template-columns:1fr 1fr}
  .twocol{grid-template-columns:1fr}
  .partners-row{grid-template-columns:repeat(2,1fr)}
  footer .cols{grid-template-columns:1fr 1fr}
}
@media (max-width:600px){
  .apps .grid{grid-template-columns:repeat(2,1fr)}
  .stats .grid,.compare .duo,.proj-grid,.cards,.steps,.feat,.gallery{grid-template-columns:1fr}
  .head-phone{display:none}
}
`;

/* ---------------- site data ---------------- */
const SOLUTIONS = [
  { slug:'high-density-mobile-storage', name:'High-Density Mobile Storage', short:'Compact aisles, double your capacity in the same footprint', img:IMGS.compact },
  { slug:'lifts-carousels', name:'Lifts & Carousels (VLM)', short:'Automated vertical storage and retrieval, goods to person', img:IMGS.modula1 },
  { slug:'lockers', name:'Lockers', short:'Smart, evidence, athletic and personal storage lockers', img:IMGS.lockers1 },
  { slug:'static-shelving', name:'Static Shelving', short:'4-post, pallet rack, cantilever and industrial shelving', img:IMGS.shelving1 },
  { slug:'cabinets', name:'Cabinets', short:'Lateral, rotary and museum-grade cabinet storage', img:IMGS.museumCabs },
  { slug:'modular-casework', name:'Modular Casework', short:'Reconfigurable laminate and steel casework and lab furniture', img:IMGS.nemoursCabs },
];

const INDUSTRIES = [
  { slug:'museums', name:'Museums', short:'Collections, art racks and conservation', img:IMGS.artScreen },
  { slug:'libraries', name:'Libraries', short:'Collection shelving and study space recovery', img:IMGS.lib1 },
  { slug:'education', name:'Education', short:'Classrooms, athletics and supply storage', img:IMGS.education },
  { slug:'athletics', name:'Athletics', short:'Team rooms, equipment and gear storage', img:IMGS.lockers2 },
  { slug:'government-public-safety', name:'Government & Public Safety', short:'Evidence, records and gear storage', img:IMGS.gps },
  { slug:'military', name:'Military', short:'Readiness gear and base operations storage', img:IMGS.evidence },
  { slug:'pharmaceutical-healthcare', name:'Healthcare & Pharmaceutical', short:'Supply, sterile core and lab storage', img:IMGS.pharma },
  { slug:'corporate-legal', name:'Corporate & Legal', short:'Records, files and workplace storage', img:IMGS.corporate },
  { slug:'retail', name:'Retail', short:'Back-of-house and stockroom storage', img:IMGS.retailMobile },
  { slug:'automotive', name:'Automotive', short:'Parts, tires and dealership storage', img:IMGS.auto },
  { slug:'material-handling-warehouse', name:'Material Handling & Warehouse', short:'Racking, AS/RS and mezzanines', img:IMGS.warehouse },
  { slug:'vertical-farming', name:'Vertical Farming', short:'Mobile grow systems and grow racks', img:IMGS.vf },
  { slug:'general-contractors', name:'General Contractors', short:'Storage packages for GCs and architects', img:IMGS.mhw },
];

const PARTNERS = [
  ['MONTEL','High-density mobile shelving and racking, SafeAisle, vertical farming'],
  ['MODULA','Vertical lift modules and automated storage/retrieval'],
  ['BRUYNZEEL','Mobile shelving and museum/archive storage, Compactus'],
  ['DELTA DESIGNS','Museum-grade steel cabinets and art racks'],
  ['AURORA STORAGE','Steel shelving and high-density mobile, est. 1880'],
  ['BORROUGHS','Shelving, lockers, workspace and industrial storage'],
  ['DATUM','Mobile shelving, lockers, filing systems and art racks'],
  ['METRO','Wire and solid shelving, carts for healthcare and foodservice'],
  ['STEELE SOLUTIONS','Structural steel mezzanines and equipment platforms'],
  ['STEEL KING','Pallet rack, cantilever rack and material handling'],
  ['TENNSCO','Steel shelving, cabinets, lockers and workbenches'],
  ['ESTEY','Library and mobile cantilever shelving, by Tennsco'],
  ['HAMILTON CASEWORK','Laboratory and technical casework, museum cabinets'],
  ['STABAARTE','Art storage screens, racks and museum display systems'],
];

/* ---------------- partials ---------------- */
const navMegaSol = SOLUTIONS.map(s =>
  `<a href="${s.slug}.html"><span class="t">${s.name}</span><span class="d">${s.short}</span></a>`).join('\n          ')
  + `\n          <a class="all" href="solutions.html">All solutions &rarr;</a>`;

const navMegaInd = INDUSTRIES.map(i =>
  `<a href="${i.slug}.html"><span class="t">${i.name}</span><span class="d">${i.short}</span></a>`).join('\n          ')
  + `\n          <a class="all" href="industries.html">All industries &rarr;</a>`;

const HEADER = `
<div class="ribbon">Design concept. Internal mockup, not the live O'Brien Systems website</div>
<div class="announce">Free on-site space assessment for PA, NJ &amp; DE facilities. <a href="contact.html">Schedule yours</a> or call <a href="tel:6108253405">610.825.3405</a></div>
<header>
  <div class="wrap nav">
    <a class="logo" href="index.html"><img src="${IMGS.logo}" alt="O'Brien Systems, Storage Redefined"></a>
    <nav class="menu">
      <div>
        <a class="top" href="solutions.html">Solutions &#9662;</a>
        <div class="mega sol">
          ${navMegaSol}
        </div>
      </div>
      <div>
        <a class="top" href="industries.html">Industries &#9662;</a>
        <div class="mega ind">
          ${navMegaInd}
        </div>
      </div>
      <div><a class="top" href="projects.html">Projects</a></div>
      <div><a class="top" href="services.html">Services</a></div>
      <div><a class="top" href="partners.html">Partners</a></div>
      <div><a class="top" href="about.html">About</a></div>
    </nav>
    <div class="head-cta">
      <span class="head-phone">610.825.3405</span>
      <a class="btn btn-solid" href="contact.html">Free Assessment</a>
    </div>
  </div>
</header>`;

const CTA = `
<div class="cta" id="contact">
  <div class="wrap">
    <span class="eyebrow" style="color:var(--teal-soft)">Get In Touch</span>
    <h2>See how much space you're sitting on</h2>
    <p>Schedule a free on-site assessment. We'll measure, plan, and show you the options. No obligation, no generic quotes.</p>
    <a class="btn btn-white" href="contact.html">Schedule My Free Assessment</a>
    <span class="phone-big">610.825.3405</span>
    <p style="margin-top:.4rem">739 E. Elm Street, Conshohocken, PA 19428</p>
  </div>
</div>`;

const FOOTER = `
<footer>
  <div class="wrap">
    <div class="cols">
      <div>
        <h4>O'Brien Systems</h4>
        <p>Custom storage solutions for the greater Philadelphia region, planned, installed, and serviced by one local team since 1979.</p>
        <p style="margin-top:12px"><a href="tel:6108253405">610.825.3405</a><a href="https://www.facebook.com/OBrienSystems/">Facebook</a></p>
      </div>
      <div>
        <h4>Solutions</h4>
        ${SOLUTIONS.map(s=>`<a href="${s.slug}.html">${s.name}</a>`).join('')}
      </div>
      <div>
        <h4>Industries</h4>
        ${INDUSTRIES.map(i=>`<a href="${i.slug}.html">${i.name}</a>`).join('')}
      </div>
      <div>
        <h4>Company</h4>
        <a href="about.html">About Us</a><a href="projects.html">Projects</a><a href="services.html">Services</a><a href="partners.html">Manufacturer Partners</a><a href="contact.html">Contact</a>
      </div>
    </div>
    <div class="legal">
      <span>&copy; 2026 O'Brien Systems.</span>
      <span><a href="#">Privacy Policy</a> | <a href="#">Accessibility Statement</a> | <a href="#">Sitemap</a></span>
    </div>
  </div>
</footer>
<a class="float-cta" href="contact.html">&#128172; Free Assessment</a>`;

const shell = (title, heroImgUrl, body) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<title>${title}</title>
<link rel="stylesheet" href="assets/style.css">
<style>:root{--hero-img:url('${heroImgUrl}')}</style>
</head>
<body>
${HEADER}
${body}
${CTA}
${FOOTER}
</body>
</html>
`;

/* subpage skeleton */
function subpage(p) {
  const feats = (p.features||[]).map(f=>`<div><b>${f[0]}</b><span>${f[1]}</span></div>`).join('\n      ');
  const gal = (p.gallery||[]).map(g=>`<div class="g" style="background-image:url('${g}')"></div>`).join('\n      ');
  const chips = (p.related||[]).map(r=>`<a href="${r.slug}.html">${r.name}</a>`).join('\n      ');
  return shell(`${p.name} | O'Brien Systems`, p.img, `
<div class="page-hero">
  <div class="wrap crumbs"><a href="index.html">Home</a> / <a href="${p.hub}.html">${p.hubName}</a> / ${p.name}</div>
  <div class="wrap">
    <span class="eyebrow">${p.eyebrow}</span>
    <h1>${p.h1}</h1>
    <p>${p.lead}</p>
  </div>
</div>
<section class="block">
  <div class="wrap twocol">
    <div class="body">
      ${p.paras.map(t=>`<p>${t}</p>`).join('\n      ')}
    </div>
    <div class="side-img"><img src="${p.sideImg||p.img}" alt="${p.name}" loading="lazy"></div>
  </div>
  <div class="wrap">
    <div class="feat">
      ${feats}
    </div>
    ${gal?`<div class="gallery">\n      ${gal}\n    </div>`:''}
    ${chips?`<h2 style="margin-top:52px;font-size:1.25rem">${p.chipsTitle}</h2>\n    <div class="chips">\n      ${chips}\n    </div>`:''}
  </div>
</section>`);
}

/* ---------------- page content ---------------- */
const relInd = (...slugs) => INDUSTRIES.filter(i=>slugs.includes(i.slug));
const relSol = (...slugs) => SOLUTIONS.filter(s=>slugs.includes(s.slug));

const SOLUTION_PAGES = {
  'high-density-mobile-storage': {
    eyebrow:'Solutions', h1:'High-Density Mobile Storage',
    lead:'Shelving on rails compacts together and opens an aisle only where you need one. The same floor holds up to twice the storage, or the same storage in half the space.',
    paras:[
      `Fixed shelving wastes floor. Every row needs its own aisle, so in most storage rooms more than half the square footage is air. High-density mobile systems mount your shelving on carriages and rails, letting rows compact together and share a single moving aisle.`,
      `We plan, supply, and install mechanical-assist, powered electrical, and manual systems from Montel, Aurora, Bruynzeel, and Datum. Drive choice depends on load, duty cycle, and who uses the space. Powered systems add safety sweeps and access control where the application calls for it.`,
      `Almost any 4-post shelving can ride on carriages, which means you can often reuse shelving you already own. We confirm floor loading, rail layout, and levelness during a free site assessment, and our own factory-trained crews handle the installation.`,
    ],
    features:[
      ['Mechanical-assist', 'Ergonomic handle drive for daily-access rooms of any size'],
      ['Powered electrical', 'Push-button aisles with safety sweeps for large or secure rooms'],
      ['Manual and low-profile', 'Simple, economical systems for smaller rooms and closets'],
      ['Reuse your shelving', 'Existing 4-post shelving can often be mounted on new carriages'],
    ],
    gallery:[IMGS.compact, IMGS.hdmsRetail, IMGS.mobileSol],
    chipsTitle:'Industries that rely on high-density mobile',
    related: relInd('museums','libraries','government-public-safety','corporate-legal','pharmaceutical-healthcare','retail'),
  },
  'lifts-carousels': {
    eyebrow:'Solutions', h1:'Vertical Lift Modules & Carousels',
    lead:'Automated storage and retrieval that brings the part to the picker. Recover floor space, speed up picking, and control access to every tray.',
    paras:[
      `A vertical lift module stores trays in a sealed tower and delivers them to an ergonomic access opening on demand. Instead of walking aisles and climbing ladders, your team keys a part number and the system brings the tray to them.`,
      `As an authorized Modula dealer we handle the full project: throughput analysis, tray layout, controls and software integration, delivery, and commissioning. Modula's line covers standard lifts, slim units for tight footprints, and pallet handling.`,
      `VLMs shine where parts inventories outgrow their rooms: maintenance cribs, electronics, pharmacy and lab storage, and any operation where picking time and floor space both cost real money.`,
    ],
    features:[
      ['Goods to person', 'Trays delivered to an ergonomic opening, no ladders or aisle walking'],
      ['Small footprint', 'A tower uses the ceiling height your shelving ignores'],
      ['Inventory control', 'Software tracks every tray, item, and operator'],
      ['Full-service install', 'Site prep, power, commissioning, and operator training'],
    ],
    gallery:[IMGS.modula1, IMGS.modula2, IMGS.warehouse],
    chipsTitle:'Where VLMs pay off fastest',
    related: relInd('material-handling-warehouse','automotive','pharmaceutical-healthcare','retail'),
  },
  'lockers': {
    eyebrow:'Solutions', h1:'Lockers',
    lead:'Smart lockers for hybrid workplaces, evidence lockers with chain-of-custody, athletic gear storage, and personal lockers built for daily abuse.',
    paras:[
      `Lockers are no longer just a bank of steel doors. Smart locker systems assign, release, and audit compartments electronically, which is how modern workplaces handle day-use storage, parcel delivery, and shared equipment.`,
      `Evidence lockers enforce chain-of-custody with pass-through designs: an officer deposits on one side, only the evidence custodian opens the other. Athletic lockers ventilate gear and survive team rooms. Personal and gear lockers cover everything from staff rooms to ready rooms.`,
      `We carry locker lines from Borroughs, Datum, Tennsco, and Montel, so the recommendation fits the use case rather than a single catalog. Layout, power and network rough-in coordination, and installation are all handled by our crews.`,
    ],
    features:[
      ['Smart lockers', 'Electronic assignment, audit trails, and parcel workflows'],
      ['Evidence lockers', 'Pass-through chain-of-custody deposit and retrieval'],
      ['Athletic lockers', 'Ventilated gear storage that survives the team room'],
      ['Personal and gear', 'Staff rooms, ready rooms, and industrial changing areas'],
    ],
    gallery:[IMGS.lockers1, IMGS.lockers2, IMGS.parcelLockers],
    chipsTitle:'Locker-heavy industries',
    related: relInd('athletics','government-public-safety','military','education','corporate-legal'),
  },
  'static-shelving': {
    eyebrow:'Solutions', h1:'Static Shelving',
    lead:'4-post and case-style shelving, pallet rack, cantilever, and industrial metal shelving. The simplest, most economical way to organize a storage area.',
    paras:[
      `Static shelving is fixed-position shelving used to organize everything from files and archives to palletized and oversized loads. It stands on the floor without rails or carriages, which makes it the fastest storage win in most facilities.`,
      `4-post and case-style shelving is completely customizable with dividers, drawers, and doors for files, records, and general storage. Pallet rack handles exceptionally large and heavy loads. Cantilever suits libraries, education, and corporate settings. Industrial metal shelving holds up to 600 pounds per shelf for parts and supplies.`,
      `Most projects combine more than one type, and many 4-post systems can move onto mobile carriages later when space runs out. We plan for that upgrade path from the start.`,
    ],
    features:[
      ['4-post and case-style', 'Customizable with dividers, drawers, and doors'],
      ['Pallet rack', 'Engineered for large and heavy palletized loads'],
      ['Cantilever', 'Library, education, and corporate collections'],
      ['Industrial shelving', 'Solid metal shelves rated up to 600 lbs each'],
    ],
    gallery:[IMGS.shelving1, IMGS.shelving2, IMGS.museumShelv],
    chipsTitle:'Common static shelving applications',
    related: relInd('education','libraries','retail','automotive','material-handling-warehouse'),
  },
  'cabinets': {
    eyebrow:'Solutions', h1:'Cabinets',
    lead:'Lateral and rotary file cabinets through museum-grade conservation cabinets. Secure, organized storage for the things that matter most.',
    paras:[
      `Cabinet storage covers a wide spectrum. On one end, lateral and rotary file cabinets organize active records in offices and file rooms. On the other, museum-grade cabinets from Delta Designs protect textiles, specimens, and works on paper with sealed gaskets and conservation-safe finishes.`,
      `Flat file cabinets store maps, drawings, and oversized documents. Drawer and door cabinets from Montel and Tennsco organize parts and supplies in industrial settings. Visual storage cabinets put collections behind glass without giving up protection.`,
      `Cabinets also combine naturally with our other systems: cabinets ride on high-density carriages, sit under mezzanines, and mix with shelving in the same room plan.`,
    ],
    features:[
      ['Museum-grade', 'Sealed, conservation-safe cabinets from Delta Designs'],
      ['Lateral and rotary files', 'Active records storage for office environments'],
      ['Flat files', 'Maps, drawings, and oversized document storage'],
      ['Industrial cabinets', 'Drawer and door cabinets for parts and supplies'],
    ],
    gallery:[IMGS.museumCabs, IMGS.nemoursCabs, IMGS.artScreen],
    chipsTitle:'Where cabinet storage leads',
    related: relInd('museums','pharmaceutical-healthcare','corporate-legal','government-public-safety'),
  },
  'modular-casework': {
    eyebrow:'Solutions', h1:'Modular Casework',
    lead:'Laminate and steel casework and lab furniture that installs fast, moves with your departments, and gets reconfigured instead of demolished.',
    paras:[
      `Traditional millwork is built in place and dies in place. Modular casework from Hamilton Casework Solutions is factory-built, installs in days instead of weeks, and unbolts to move or reconfigure when the room's mission changes.`,
      `Laminate casework fits offices, classrooms, mailrooms, and breakrooms. Steel casework stands up to labs, clinics, and industrial spaces. Lab furniture adds chemical-resistant surfaces and service chases where the work demands them.`,
      `Because it's furniture rather than construction, modular casework can often be depreciated faster than millwork, and it doesn't require tearing up the room to change later. We handle design, specification, delivery, and installation.`,
    ],
    features:[
      ['Laminate casework', 'Offices, classrooms, mailrooms, and workrooms'],
      ['Steel casework', 'Labs, clinics, and hard-use environments'],
      ['Lab furniture', 'Chemical-resistant tops and service-ready benches'],
      ['Reconfigurable', 'Unbolts and moves instead of getting demolished'],
    ],
    gallery:[IMGS.nemoursCabs, IMGS.nemours4, IMGS.nemours5],
    chipsTitle:'Casework-driven industries',
    related: relInd('pharmaceutical-healthcare','education','corporate-legal','government-public-safety'),
  },
};

const INDUSTRY_PAGES = {
  'museums': {
    h1:'Museum Storage',
    lead:'Collections storage that protects, organizes, and makes room for growth: art racks, conservation cabinets, and high-density systems for objects of every size.',
    paras:[
      `Most museums display a fraction of what they hold. The rest lives in storage, and that storage determines how well the collection survives. We design collection storage around the objects themselves: paintings on pull-out art racks, textiles rolled on racks, specimens and works on paper in sealed conservation cabinets, and framed and boxed objects on high-density mobile shelving.`,
      `Our manufacturer lines are the ones collection managers already know: Bruynzeel and Delta Designs for museum-grade cabinets and mobile systems, Montel for art racks and mobile shelving, Stabaarte for art screens and display systems.`,
      `Every project starts with a collection walkthrough. We measure what you hold, plan for acquisition growth, and stage installations around exhibition calendars so the collection never sits exposed.`,
    ],
    features:[
      ['Art racks and screens', 'Pull-out, wall-mounted, and mobile painting storage'],
      ['Conservation cabinets', 'Sealed, gasketed, conservation-safe finishes'],
      ['High-density mobile', 'Compact storage for boxed and framed collections'],
      ['Exhibition-aware installs', 'Staged around your calendar, not ours'],
    ],
    gallery:[IMGS.artScreen, IMGS.museumCabs, IMGS.museumShelv],
    chipsTitle:'Solutions museums use most',
    related: relSol('high-density-mobile-storage','cabinets','static-shelving'),
  },
  'libraries': {
    h1:'Library Storage',
    lead:'Cantilever and high-density shelving that keeps collections accessible while giving the floor back to readers, study space, and programming.',
    paras:[
      `Libraries are under pressure to be community spaces, but the collection still needs a home. High-density mobile shelving compresses stacks into a fraction of the floor, and cantilever library shelving from Estey keeps open stacks browsable and adaptable.`,
      `We have compacted entire collections onto a single floor, freeing levels for seating, makerspaces, and programming without deaccessioning. Mobile systems work in public stacks, closed stacks, and archives alike.`,
      `Load matters in library projects. Book stacks are heavy, and mobile systems concentrate that weight. We verify floor capacity and coordinate with your facilities team before anything is ordered.`,
    ],
    features:[
      ['Cantilever shelving', 'Classic browsable stacks, easy to re-shelve and reconfigure'],
      ['High-density mobile', 'The whole collection in a fraction of the floor'],
      ['Archives and special collections', 'Closed-stack and conservation-grade options'],
      ['Floor-load verification', 'Structural coordination before ordering'],
    ],
    gallery:[IMGS.lib1, IMGS.lib2, IMGS.compact],
    chipsTitle:'Solutions libraries use most',
    related: relSol('static-shelving','high-density-mobile-storage','cabinets'),
  },
  'education': {
    h1:'Education Storage',
    lead:'From textbook rooms and science prep to athletics and facilities, schools run on storage that has to survive students and budgets alike.',
    paras:[
      `Schools store everything: curriculum materials, lab supplies, uniforms, instruments, records, and the equipment that keeps buildings running. We plan storage building by building, room by room, with systems that survive daily student use.`,
      `4-post shelving organizes textbook and supply rooms. Modular casework outfits classrooms and prep rooms. Athletic lockers and gear storage handle team rooms. High-density mobile shelving gives registrars and district offices records capacity without new construction.`,
      `Summer is install season. We stage deliveries and crews around the academic calendar so rooms are ready before students return.`,
    ],
    features:[
      ['Textbook and supply rooms', 'Adjustable 4-post shelving that reconfigures each year'],
      ['Classroom casework', 'Modular units that move when programs change'],
      ['Athletics storage', 'Ventilated lockers and equipment storage'],
      ['Records compaction', 'High-density systems for registrar and district offices'],
    ],
    gallery:[IMGS.education, IMGS.lockers2, IMGS.shelving1],
    chipsTitle:'Solutions schools use most',
    related: relSol('static-shelving','lockers','modular-casework','high-density-mobile-storage'),
  },
  'athletics': {
    h1:'Athletics Storage',
    lead:'Team rooms, equipment cages, and gear storage built for the pace and abuse of athletic programs at every level.',
    paras:[
      `Athletic storage takes a beating: wet gear, heavy pads, constant turnover, and zero patience for jammed doors. We outfit team rooms with ventilated athletic lockers, equipment rooms with heavy-duty shelving, and uniform storage with systems that keep inventory countable.`,
      `Locker lines from Borroughs, Montel, and Tennsco cover open-front team lockers, ventilated gear lockers, and secure personal storage. Wire and industrial shelving organizes balls, pads, and training equipment in cages and closets.`,
      `For programs with more gear than room, mobile shelving compacts equipment storage the same way it compacts archives, often doubling what an equipment room can hold.`,
    ],
    features:[
      ['Team-room lockers', 'Open-front and ventilated designs for daily gear'],
      ['Equipment cages', 'Heavy-duty shelving that survives the season'],
      ['Uniform storage', 'Organized, countable, and ready for game day'],
      ['Compact gear rooms', 'Mobile systems that double equipment capacity'],
    ],
    gallery:[IMGS.lockers2, IMGS.lockers1, IMGS.shelving2],
    chipsTitle:'Solutions athletic programs use most',
    related: relSol('lockers','static-shelving','high-density-mobile-storage'),
  },
  'government-public-safety': {
    h1:'Government & Public Safety Storage',
    lead:'Evidence rooms, records centers, and gear storage where accountability is the whole point.',
    paras:[
      `In public safety storage, organization is chain of custody. Evidence rooms need pass-through lockers, secure shelving, and layouts that make every item findable and auditable. We plan evidence storage around your intake volume, retention schedules, and accreditation requirements.`,
      `Beyond evidence, agencies store records, gear, weapons, and fleet equipment. High-density mobile shelving compresses records rooms. Gear lockers keep officer equipment staged and accounted for. Weapons storage secures armories with the documentation trail agencies require.`,
      `We hold public procurement experience across Pennsylvania municipalities and agencies, and our crews are accustomed to working in secure facilities.`,
    ],
    features:[
      ['Evidence storage', 'Pass-through lockers and secure, auditable shelving'],
      ['Records compaction', 'High-density systems sized to retention schedules'],
      ['Gear and armory', 'Officer equipment staged, secured, and documented'],
      ['Secure-site installs', 'Crews experienced in controlled facilities'],
    ],
    gallery:[IMGS.evidence, IMGS.gps, IMGS.compact],
    chipsTitle:'Solutions agencies use most',
    related: relSol('lockers','high-density-mobile-storage','static-shelving','cabinets'),
  },
  'military': {
    h1:'Military Storage',
    lead:'Readiness depends on gear you can find, count, and issue fast. We build storage for armories, supply rooms, and base operations.',
    paras:[
      `Military and defense storage is inventory discipline made physical. Gear issue moves faster when every item has an assigned, labeled home. We outfit supply rooms and ready rooms with gear lockers, high-density shelving, and weapons storage designed around issue and turn-in workflows.`,
      `Manufacturer lines like Montel and Borroughs build military-specification lockers and shelving for exactly these environments, from TA-50 gear storage to armory racking.`,
      `Our crews handle access-controlled sites and coordinate installations around operational schedules. Projects run through applicable procurement vehicles where required.`,
    ],
    features:[
      ['Gear lockers', 'Assigned, labeled storage for issued equipment'],
      ['Armory storage', 'Weapons racking with documentation-friendly layouts'],
      ['Supply room compaction', 'High-density systems for issue and turn-in'],
      ['Controlled-site installs', 'Crews accustomed to access requirements'],
    ],
    gallery:[IMGS.evidence, IMGS.lockers1, IMGS.warehouse],
    chipsTitle:'Solutions defense facilities use most',
    related: relSol('lockers','high-density-mobile-storage','static-shelving'),
  },
  'pharmaceutical-healthcare': {
    h1:'Healthcare & Pharmaceutical Storage',
    lead:'Supply chains inside the building: sterile core, pharmacy, lab, and materials storage that keeps clinical space clinical.',
    paras:[
      `Every square foot given to storage in a hospital is a square foot not treating patients. We compress supply storage with high-density systems, organize sterile core and pharmacy with wire and cabinet systems designed for sanitation, and outfit labs with steel casework built for the work.`,
      `Metro wire shelving is the healthcare standard for cleanable, configurable supply storage. Modular casework adapts clinical support spaces without construction. VLMs secure and track high-value pharmacy and supply inventory.`,
      `Our teams have worked in operating healthcare environments including children's health systems, coordinating around infection control requirements and live clinical schedules.`,
    ],
    features:[
      ['Sterile core and supply', 'Cleanable wire and cabinet systems from Metro'],
      ['Pharmacy storage', 'Secure, trackable, compact inventory systems'],
      ['Lab casework', 'Steel casework and chemical-resistant surfaces'],
      ['Live-facility installs', 'Infection-control aware crews and scheduling'],
    ],
    gallery:[IMGS.pharma, IMGS.nemours4, IMGS.nemours5],
    chipsTitle:'Solutions healthcare facilities use most',
    related: relSol('modular-casework','high-density-mobile-storage','cabinets','lifts-carousels'),
  },
  'corporate-legal': {
    h1:'Corporate & Legal Storage',
    lead:'Records rooms, file systems, and workplace storage that keep information findable and offices working.',
    paras:[
      `A well-organized storage system allows for faster allocation and retrieval of important files and materials. Legal and corporate offices still run on paper where it counts: case files, contracts, HR records, and archives with real retention requirements.`,
      `High-density mobile shelving turns a records room into half a records room. Lateral and rotary cabinets organize active files where people work. Smart lockers handle day-use storage, parcel delivery, and shared equipment in hybrid workplaces.`,
      `When offices move or consolidate, our relocation crews move the records too, maintaining file order from old space to new.`,
    ],
    features:[
      ['Records compaction', 'High-density mobile systems for archives'],
      ['Active file systems', 'Lateral and rotary cabinets at the point of work'],
      ['Workplace lockers', 'Smart day-use and parcel storage for hybrid offices'],
      ['Office relocations', 'File-order-preserving moves and reinstalls'],
    ],
    gallery:[IMGS.corporate, IMGS.lockers1, IMGS.compact],
    chipsTitle:'Solutions offices use most',
    related: relSol('high-density-mobile-storage','cabinets','lockers','modular-casework'),
  },
  'retail': {
    h1:'Retail Storage',
    lead:'Back-of-house storage that shrinks the stockroom instead of the stock, keeping more floor selling and more inventory in reach.',
    paras:[
      `Stockroom optimization is key to maintaining an efficient flow of goods and keeping selling floor selling. Mobile shelving compacts back-of-house storage so the same room holds more SKUs, or the stockroom shrinks and the sales floor grows.`,
      `We plan retail storage around replenishment workflow: what turns fast stays at reach height in open shelving, what turns slow compacts into mobile systems, and seasonal inventory gets a home that isn't the receiving corridor.`,
      `Multi-site rollouts are a specialty. We have outfitted store networks with standardized shelving and locker packages, coordinated store by store around trading hours.`,
    ],
    features:[
      ['Stockroom compaction', 'Mobile systems that grow capacity, not footprint'],
      ['Workflow-first layout', 'Fast movers in reach, slow movers compacted'],
      ['BOPIS and parcel', 'Smart lockers for pickup and staff storage'],
      ['Multi-site rollouts', 'Standardized packages installed store by store'],
    ],
    gallery:[IMGS.retailMobile, IMGS.hdmsRetail, IMGS.shelving1],
    chipsTitle:'Solutions retailers use most',
    related: relSol('high-density-mobile-storage','static-shelving','lockers'),
  },
  'automotive': {
    h1:'Automotive Storage',
    lead:'Parts departments, tire storage, and service operations organized so the part is where the system says it is.',
    paras:[
      `Automotive parts storage is a fight between SKU count and square footage. High-density shelving, specialized tire racking, and vertical lift modules each attack it differently, and most dealerships end up with a mix.`,
      `VLMs shine in parts departments: small parts secured and tracked in a footprint a fraction of the shelving they replace, delivered to the counter at the push of a button. Tire racks organize the bulky inventory that eats conventional shelving.`,
      `We plan around your DMS bin locations so the physical layout matches the system of record, which is where retrieval time actually gets won.`,
    ],
    features:[
      ['Parts shelving', 'High-density and drawer systems for small parts'],
      ['Tire storage', 'Purpose-built racking for the bulkiest SKU'],
      ['VLMs at the counter', 'Secured, tracked parts delivered to the picker'],
      ['Bin-location planning', 'Layouts that match your DMS'],
    ],
    gallery:[IMGS.auto, IMGS.modula2, IMGS.shelving2],
    chipsTitle:'Solutions parts operations use most',
    related: relSol('lifts-carousels','static-shelving','high-density-mobile-storage','cabinets'),
  },
  'material-handling-warehouse': {
    h1:'Material Handling & Warehouse',
    lead:'Racking, mezzanines, and automation for operations that measure storage in throughput, not just square feet.',
    paras:[
      `Organizations interested in reducing cost and increasing productivity rely on high-capacity storage solutions and material handling equipment. We supply and install pallet rack and cantilever from Steel King, structural mezzanines and platforms from Steele Solutions, and industrial shelving from Borroughs.`,
      `Mezzanines create a second floor inside the building you already own, often the cheapest square footage an operation can buy. VLMs and automation compress parts storage and speed picking where labor is the constraint.`,
      `Every project gets load engineering: rack capacities, seismic and floor calculations, and permits handled properly rather than hopefully.`,
    ],
    features:[
      ['Pallet rack and cantilever', 'Steel King racking engineered to your loads'],
      ['Mezzanines', 'Steele Solutions platforms that add a floor'],
      ['Industrial shelving', 'Borroughs systems rated for daily abuse'],
      ['Automation', 'Modula VLMs where picking speed pays'],
    ],
    gallery:[IMGS.warehouse, IMGS.mhw, IMGS.modula1],
    chipsTitle:'Solutions warehouses use most',
    related: relSol('static-shelving','lifts-carousels','high-density-mobile-storage'),
  },
  'vertical-farming': {
    h1:'Vertical Farming Storage',
    lead:'Growing vertically can save space and raise crop yield per square foot. Mobile grow systems make the room itself part of the yield.',
    paras:[
      `Vertical farming applies the same math as high-density storage: eliminate aisles, multiply capacity. Montel's mobile grow systems mount multi-tier grow racks on carriages, so a grow room needs one working aisle instead of one per row.`,
      `The same principles cover trays, decking, drying racks, and the carts that move product through the operation. Integration with lighting, ventilation, and irrigation gets planned with your cultivation team, not around them.`,
      `We handle layout, floor loading, delivery, and installation, and we service and reconfigure systems as operations scale.`,
    ],
    features:[
      ['Mobile grow systems', 'Montel carriage-mounted multi-tier growing'],
      ['Grow racks and trays', 'Static racks, wire decking, and drying storage'],
      ['Utility coordination', 'Layouts planned around lighting and irrigation'],
      ['Scale-up service', 'Reconfiguration as the operation grows'],
    ],
    gallery:[IMGS.vf, IMGS.compact, IMGS.shelving1],
    chipsTitle:'Related solutions',
    related: relSol('high-density-mobile-storage','static-shelving'),
  },
  'general-contractors': {
    h1:'For General Contractors',
    lead:'A storage subcontractor that shows up with stamped drawings, hits the schedule, and handles Division 10 scope end to end.',
    paras:[
      `GCs and architects bring us in when a project includes storage scope: evidence rooms in a public safety building, library stacks, lab casework, lockers, or high-density systems in a records center. We take the package from specification through punch list.`,
      `That includes submittals, load calculations and structural coordination for rail-mounted systems, delivery sequenced to the construction schedule, and factory-trained installation crews who work clean on active sites.`,
      `Because we carry 14 manufacturer lines, we can meet a spec as written or propose equals that protect the budget without weakening the design intent.`,
    ],
    features:[
      ['Submittals and drawings', 'Complete packages, coordinated with your schedule'],
      ['Structural coordination', 'Rail loads, floor capacity, and embed planning'],
      ['Spec-or-equal flexibility', '14 lines to meet spec or protect budget'],
      ['Clean site discipline', 'Crews that work active construction properly'],
    ],
    gallery:[IMGS.mhw, IMGS.compact, IMGS.nemoursCabs],
    chipsTitle:'Scopes we take',
    related: relSol('high-density-mobile-storage','lockers','modular-casework','static-shelving'),
  },
};

/* ---------------- hub + static pages ---------------- */
const cardGrid = (items) => `<div class="cards">` + items.map(x=>`
  <a class="card" href="${x.slug}.html"><div class="ph" style="background-image:url('${x.img}')"></div>
    <div class="bd"><h3>${x.name}</h3><p>${x.short}.</p><span class="go">Explore &rarr;</span></div></a>`).join('') + `</div>`;

const solutionsHub = shell(`Storage Solutions | O'Brien Systems`, IMGS.compact, `
<div class="page-hero">
  <div class="wrap crumbs"><a href="index.html">Home</a> / Solutions</div>
  <div class="wrap">
    <span class="eyebrow">Solutions</span>
    <h1>What do you need to store?</h1>
    <p>Six families of storage systems, fourteen manufacturer lines, one local team that plans, installs, and services all of it.</p>
  </div>
</div>
<section class="block"><div class="wrap">
${cardGrid(SOLUTIONS)}
</div></section>`);

const industriesHub = shell(`Industries We Serve | O'Brien Systems`, IMGS.heroHome, `
<div class="page-hero">
  <div class="wrap crumbs"><a href="index.html">Home</a> / Industries</div>
  <div class="wrap">
    <span class="eyebrow">Industries</span>
    <h1>Storage, planned around your work</h1>
    <p>Every industry stores something different. These are the ones we know inside out, from evidence rooms to grow rooms.</p>
  </div>
</div>
<section class="block"><div class="wrap">
${cardGrid(INDUSTRIES)}
</div></section>`);

const projectsPage = shell(`Projects | O'Brien Systems`, IMGS.lib1, `
<div class="page-hero">
  <div class="wrap crumbs"><a href="index.html">Home</a> / Projects</div>
  <div class="wrap">
    <span class="eyebrow">Projects</span>
    <h1>Proof, installed</h1>
    <p>A sampling of the spaces our crews have planned and built across the Delaware Valley since 1979.</p>
  </div>
</div>
<section class="block"><div class="wrap">
  <div class="proj-grid">
    <div class="proj" style="background-image:url('${IMGS.artScreen}')"><div class="cap"><span class="k">Museum</span><div class="t">Art screens and conservation storage for a regional collection</div></div></div>
    <div class="proj" style="background-image:url('${IMGS.lib1}')"><div class="cap"><span class="k">Library</span><div class="t">High-density shelving that kept the whole collection on one floor</div></div></div>
    <div class="proj" style="background-image:url('${IMGS.nemours4}')"><div class="cap"><span class="k">Healthcare</span><div class="t">Modular casework and supply storage for a children's health system</div></div></div>
    <div class="proj" style="background-image:url('${IMGS.evidence}')"><div class="cap"><span class="k">Public Safety</span><div class="t">Evidence storage planned around chain of custody</div></div></div>
    <div class="proj" style="background-image:url('${IMGS.mhw}')"><div class="cap"><span class="k">Warehouse</span><div class="t">Material handling and storage for high-throughput operations</div></div></div>
    <div class="proj" style="background-image:url('${IMGS.retailMobile}')"><div class="cap"><span class="k">Retail</span><div class="t">Back-of-house mobile storage that shrank the stockroom, not the stock</div></div></div>
    <div class="proj" style="background-image:url('${IMGS.museumCabs}')"><div class="cap"><span class="k">Museum</span><div class="t">Visual storage cabinets that put a collection on display, protected</div></div></div>
    <div class="proj" style="background-image:url('${IMGS.lockers1}')"><div class="cap"><span class="k">Workplace</span><div class="t">Smart lockers for a hybrid office's day-use storage</div></div></div>
    <div class="proj" style="background-image:url('${IMGS.modula2}')"><div class="cap"><span class="k">Industrial</span><div class="t">Vertical lift modules that put a parts room in a tower</div></div></div>
  </div>
</div></section>`);

const servicesPage = shell(`Services | O'Brien Systems`, IMGS.mobileSol, `
<div class="page-hero">
  <div class="wrap crumbs"><a href="index.html">Home</a> / Services</div>
  <div class="wrap">
    <span class="eyebrow">Services</span>
    <h1>From walkthrough to working storage</h1>
    <p>Buying storage isn't buying steel. It's buying a plan, an installation, and someone who answers the phone afterward.</p>
  </div>
</div>
<section class="block"><div class="wrap">
  <div class="steps">
    <div class="step"><span class="n">01 &mdash; ASSESS</span><h3>Free Space Assessment</h3><p>We walk your space, measure what you store, and find the capacity you didn't know you had. No cost, no obligation.</p></div>
    <div class="step"><span class="n">02 &mdash; DESIGN</span><h3>Layout &amp; Specification</h3><p>Drawings, load calculations, and an itemized quote, matched to the right manufacturer line for the job.</p></div>
    <div class="step"><span class="n">03 &mdash; INSTALL</span><h3>Factory-Trained Installation</h3><p>Our own crews deliver, anchor, and level, coordinated around your operating hours and site rules.</p></div>
    <div class="step"><span class="n">04 &mdash; SUPPORT</span><h3>Service &amp; Relocation</h3><p>Maintenance, reconfiguration, teardown and moves, even for systems we didn't originally supply.</p></div>
  </div>
  <div class="feat" style="margin-top:44px">
    <div><b>Relocation and reinstallation</b><span>4-post and case-style systems disassemble and move with your department, file order intact.</span></div>
    <div><b>Service on any brand</b><span>We maintain and repair storage systems we didn't sell, including legacy installed bases.</span></div>
    <div><b>Structural coordination</b><span>Rail-mounted systems get floor-load verification and permits handled properly.</span></div>
    <div><b>Phased projects</b><span>Modular systems mean you can start with the highest-need areas and add sections later.</span></div>
  </div>
</div></section>`);

const partnersPage = shell(`Manufacturer Partners | O'Brien Systems`, IMGS.warehouse, `
<div class="page-hero">
  <div class="wrap crumbs"><a href="index.html">Home</a> / Partners</div>
  <div class="wrap">
    <span class="eyebrow">Authorized Dealer</span>
    <h1>The best manufacturers, one local partner</h1>
    <p>We carry 14 manufacturer lines. One accountable local team designs, installs, and services them all, and matches the right brand to your project instead of forcing one catalog.</p>
  </div>
</div>
<section class="block"><div class="wrap">
  <div class="partners-row">
    ${PARTNERS.map(p=>`<div class="pt"><b>${p[0]}</b><span>${p[1]}</span></div>`).join('\n    ')}
  </div>
  <p class="lead" style="margin-top:40px">Why buy through a dealer instead of direct? Because manufacturers build products and we build projects. One assessment covers every option. One crew installs the mix your space actually needs. One phone number answers for all of it, for the life of the system.</p>
</div></section>`);

const aboutPage = shell(`About Us | O'Brien Systems`, IMGS.heroHome, `
<div class="page-hero">
  <div class="wrap crumbs"><a href="index.html">Home</a> / About</div>
  <div class="wrap">
    <span class="eyebrow">About O'Brien Systems</span>
    <h1>Storage redefined, since 1979</h1>
    <p>A family-owned storage systems dealer serving the greater Philadelphia region from Conshohocken, Pennsylvania.</p>
  </div>
</div>
<section class="block"><div class="wrap twocol">
  <div class="body">
    <p>Since 1979, O'Brien Systems has been providing custom storage solutions to a wide variety of clients in multiple industry settings. We pride ourselves on customer service and believe wholeheartedly that in the highly technical world of high-density storage and retrieval systems, what separates a good company from a great one is the service provided before, during and after the sale.</p>
    <p>We provide the highest quality of products and services while offering a high level of technical expertise and experience to bring your project from blueprint to reality, on time and on budget. We hear your requirements, value your input and implement our expertise, all to solve your storage needs.</p>
    <p>Our team plans, supplies, installs, and services every system we sell, across 14 manufacturer lines. That range means our recommendation fits your project rather than a single catalog, and our factory-trained crews mean the install meets the drawing.</p>
  </div>
  <div class="side-img"><img src="${IMGS.compact}" alt="High-density mobile storage installation" loading="lazy"></div>
</div>
<div class="wrap">
  <div class="feat">
    <div><b>Family-owned since 1979</b><span>Four decades of storage projects across the Delaware Valley.</span></div>
    <div><b>PA, NJ &amp; DE</b><span>Based at 739 E. Elm Street, Conshohocken, PA 19428.</span></div>
    <div><b>14 manufacturer lines</b><span>Authorized dealer for the industry's leading brands.</span></div>
    <div><b>Our own crews</b><span>Factory-trained installation, service, and relocation teams.</span></div>
  </div>
</div></section>`);

const contactPage = shell(`Contact Us | O'Brien Systems`, IMGS.mobileSol, `
<div class="page-hero">
  <div class="wrap crumbs"><a href="index.html">Home</a> / Contact</div>
  <div class="wrap">
    <span class="eyebrow">Contact Us</span>
    <h1>Let's look at your space</h1>
    <p>Call, write, or schedule a free on-site assessment. We'll measure, plan, and show you the options.</p>
  </div>
</div>
<section class="block"><div class="wrap twocol">
  <div class="body">
    <h2 style="font-size:1.3rem;margin-bottom:14px">O'Brien Systems</h2>
    <p><b>Phone:</b> <a href="tel:6108253405">610.825.3405</a><br>
    <b>Address:</b> 739 E. Elm Street, Conshohocken, PA 19428<br>
    <b>Service area:</b> Greater Philadelphia, including southeastern Pennsylvania, South Jersey, and Delaware</p>
    <p style="margin-top:18px"><a class="btn btn-solid" href="tel:6108253405">Call 610.825.3405</a></p>
    <p style="margin-top:26px;color:var(--muted);font-size:.9rem">This is a design mockup. The contact form from the production site (name, email, phone, message) would live here, wired to the same Forminator backend.</p>
  </div>
  <div class="side-img"><iframe title="Map to O'Brien Systems" src="https://www.google.com/maps?q=739+E+Elm+Street+Conshohocken+PA+19428&output=embed" style="border:0;width:100%;height:420px" loading="lazy"></iframe></div>
</div></section>`);

/* ---------------- home page ---------------- */
const homeBody = `
<div class="hero">
  <div class="wrap">
    <h1><em>Storage solved.</em> Space reclaimed.</h1>
    <p>For 45+ years, O'Brien Systems has planned, supplied, and installed custom storage for the Philadelphia region as the authorized dealer for the industry's leading manufacturers.</p>
    <div class="ctas">
      <a class="btn btn-white" href="contact.html">Schedule a Free Space Assessment</a>
      <a class="btn btn-ghost" href="solutions.html">Explore Solutions</a>
    </div>
  </div>
</div>

<div class="apps wrap">
  <div class="grid">
    <a href="museums.html"><span class="ic">&#127963;&#65039;</span>Museums</a>
    <a href="libraries.html"><span class="ic">&#128218;</span>Libraries</a>
    <a href="education.html"><span class="ic">&#127891;</span>Education</a>
    <a href="government-public-safety.html"><span class="ic">&#128737;&#65039;</span>Public Safety</a>
    <a href="pharmaceutical-healthcare.html"><span class="ic">&#9877;&#65039;</span>Healthcare</a>
    <a href="material-handling-warehouse.html"><span class="ic">&#127981;</span>Warehouse</a>
    <a href="industries.html"><span class="ic">&#8594;</span>All 13 Industries</a>
  </div>
</div>

<div class="stats wrap">
  <div class="grid">
    <div><b>1979</b><span>family-owned since</span></div>
    <div><b>PA &middot; NJ &middot; DE</b><span>greater Philadelphia region</span></div>
    <div><b>14</b><span>manufacturer lines carried</span></div>
    <div><b>Free</b><span>on-site space assessments</span></div>
  </div>
</div>

<section class="block" id="solutions">
  <div class="wrap">
    <div class="sec-head">
      <div>
        <span class="eyebrow">Solutions</span>
        <h2>What do you need to <em>store</em>?</h2>
        <p class="lead">Every system is planned around what you actually keep, from evidence and archives to pallets and paintings, and installed by our own factory-trained crews.</p>
      </div>
      <a class="btn btn-solid" href="contact.html">Talk to a Planner</a>
    </div>
    ${cardGrid(SOLUTIONS)}
  </div>
</section>

<section class="block compare">
  <div class="wrap">
    <span class="eyebrow">The Case for Compact Storage</span>
    <h2>We make <em>every inch</em> count</h2>
    <p class="lead">Fixed aisles waste up to half your floor. Putting the same shelving on mobile carriages removes the empty aisles. Same footprint, twice the storage, or the same storage in half the space.</p>
    <div class="duo">
      <div class="panel">
        <h3>Conventional fixed shelving</h3>
        <svg viewBox="0 0 400 150" role="img" aria-label="Fixed shelving layout with wasted aisle space">
          <rect x="0" y="0" width="400" height="150" fill="rgba(255,255,255,.04)"/>
          <g fill="#7fd6d9"><rect x="10" y="10" width="40" height="130" rx="3"/><rect x="105" y="10" width="40" height="130" rx="3"/><rect x="200" y="10" width="40" height="130" rx="3"/><rect x="295" y="10" width="40" height="130" rx="3"/></g>
          <g fill="rgba(255,255,255,.13)"><rect x="52" y="10" width="51" height="130"/><rect x="147" y="10" width="51" height="130"/><rect x="242" y="10" width="51" height="130"/><rect x="337" y="10" width="53" height="130"/></g>
          <text x="200" y="82" text-anchor="middle" fill="#e2f0f0" font-size="13" font-weight="700" font-family="sans-serif">4 shelving rows &middot; 4 aisles</text>
        </svg>
        <p>Every row needs its own access aisle, so more than half the floor is air.</p>
      </div>
      <div class="panel">
        <h3>O'Brien high-density mobile <span class="badge">2&times; capacity</span></h3>
        <svg viewBox="0 0 400 150" role="img" aria-label="Mobile shelving layout with one shared aisle">
          <rect x="0" y="0" width="400" height="150" fill="rgba(255,255,255,.04)"/>
          <g fill="#7fd6d9"><rect x="10" y="10" width="40" height="130" rx="3"/><rect x="54" y="10" width="40" height="130" rx="3"/><rect x="98" y="10" width="40" height="130" rx="3"/><rect x="142" y="10" width="40" height="130" rx="3"/><rect x="186" y="10" width="40" height="130" rx="3"/><rect x="230" y="10" width="40" height="130" rx="3"/><rect x="274" y="10" width="40" height="130" rx="3"/></g>
          <rect x="318" y="10" width="51" height="130" fill="rgba(255,255,255,.13)"/>
          <g fill="#7fd6d9"><rect x="373" y="10" width="17" height="130" rx="3"/></g>
          <text x="343" y="82" text-anchor="middle" fill="#e2f0f0" font-size="12" font-weight="700" font-family="sans-serif">1 aisle</text>
          <text x="160" y="82" text-anchor="middle" fill="#023c3f" font-size="13" font-weight="700" font-family="sans-serif">8 shelving rows</text>
        </svg>
        <p>Carriages glide on rails to open one aisle where you need it. The rest of the floor works for you.</p>
      </div>
    </div>
  </div>
</section>

<section class="block projects-bg" id="projects">
  <div class="wrap">
    <div class="sec-head">
      <div>
        <span class="eyebrow">Projects</span>
        <h2>Proof, <em>installed</em></h2>
        <p class="lead">A few of the spaces our crews have planned and built across the Delaware Valley.</p>
      </div>
      <a class="btn btn-solid" href="projects.html">See All Projects</a>
    </div>
    <div class="proj-grid">
      <div class="proj" style="background-image:url('${IMGS.artScreen}')"><div class="cap"><span class="k">Museum</span><div class="t">Art screens and conservation storage for a regional collection</div></div></div>
      <div class="proj" style="background-image:url('${IMGS.lib1}')"><div class="cap"><span class="k">Library</span><div class="t">High-density shelving that kept the whole collection on one floor</div></div></div>
      <div class="proj" style="background-image:url('${IMGS.nemours4}')"><div class="cap"><span class="k">Healthcare</span><div class="t">Modular casework and supply storage for a children's health system</div></div></div>
    </div>
  </div>
</section>

<section class="block" id="partners">
  <div class="wrap">
    <span class="eyebrow">Authorized Dealer</span>
    <h2>The best manufacturers, <em>one local partner</em></h2>
    <p class="lead">We carry 14 manufacturer lines, from high-density mobile and museum-grade storage to vertical lift modules and mezzanines. One accountable local team designs, installs, and services them all.</p>
    <div class="partners-row">
      ${PARTNERS.slice(0,7).map(p=>`<div class="pt"><b>${p[0]}</b><span>${p[1]}</span></div>`).join('\n      ')}
      <a class="pt" href="partners.html" style="display:flex;flex-direction:column;justify-content:center"><b style="color:var(--teal)">All 14 lines &rarr;</b><span>See the full line card</span></a>
    </div>
  </div>
</section>

<section class="block" id="services" style="padding-top:0">
  <div class="wrap">
    <span class="eyebrow">Working With Us</span>
    <h2>From walkthrough to <em>working storage</em></h2>
    <p class="lead">Buying storage isn't buying steel. It's buying a plan. Here's how we run every project, whether it's one evidence room or a whole facility.</p>
    <div class="steps">
      <div class="step"><span class="n">01 &mdash; ASSESS</span><h3>Free Space Assessment</h3><p>We walk your space, measure what you store, and find the capacity you didn't know you had.</p></div>
      <div class="step"><span class="n">02 &mdash; DESIGN</span><h3>Layout &amp; Specification</h3><p>Drawings, load calculations, and an itemized quote, matched to the right manufacturer line.</p></div>
      <div class="step"><span class="n">03 &mdash; INSTALL</span><h3>Factory-Trained Installation</h3><p>Our own crews deliver, anchor, and level, coordinated around your operating hours.</p></div>
      <div class="step"><span class="n">04 &mdash; SUPPORT</span><h3>Service &amp; Relocation</h3><p>Maintenance, reconfiguration, teardown and moves, even for systems we didn't originally supply.</p></div>
    </div>
  </div>
</section>`;

/* ---------------- write files ---------------- */
fs.mkdirSync(path.join(OUT,'assets'), {recursive:true});
fs.writeFileSync(path.join(OUT,'assets','style.css'), CSS);

const pages = {
  'index.html': shell(`O'Brien Systems | Custom Storage Solutions | Design Concept`, IMGS.heroHome, homeBody),
  'solutions.html': solutionsHub,
  'industries.html': industriesHub,
  'projects.html': projectsPage,
  'services.html': servicesPage,
  'partners.html': partnersPage,
  'about.html': aboutPage,
  'contact.html': contactPage,
};

for (const s of SOLUTIONS) {
  const d = SOLUTION_PAGES[s.slug];
  pages[`${s.slug}.html`] = subpage({ ...d, name:s.name, img:s.img, hub:'solutions', hubName:'Solutions' });
}
for (const i of INDUSTRIES) {
  const d = INDUSTRY_PAGES[i.slug];
  pages[`${i.slug}.html`] = subpage({ ...d, eyebrow:'Industries', name:i.name, img:i.img, hub:'industries', hubName:'Industries' });
}

let n = 0;
for (const [file, html] of Object.entries(pages)) {
  fs.writeFileSync(path.join(OUT, file), html);
  n++;
}
console.log(`wrote ${n} pages + assets/style.css`);
