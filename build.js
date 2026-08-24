// O'Brien Systems redesign mockup - static site generator
// Run: node build.js   (writes *.html + assets/style.css into this folder)
// Blog data: blogdata.json (exported from the staging WP REST API)
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
  // banners (production per-topic heroes)
  banMobile: img('07c35-mobile-storage-backgroun.jpg'),
  banLifts: img('8cc7d-lifts-and-carousels.jpg'),
  banLockers: img('75b97-lockers-background.jpg'),
  banShelving: img('68a93-shelving-background.jpg'),
  banCabinets: img('e7774-cabinets-background.jpg'),
  banCasework: img('86c7f-modular-casework-background.jpg'),
  banMuseum: img('a1a5e-museum-background.jpg'),
  banEducation: img('e3781-education-background.jpg'),
  banCorporate: img('2f71f-corporate-and-legal-background.jpg'),
  banRetail: img('9c891-retail-background.jpg'),
  banVF: img('f982d-vertical-farming-background-1.jpg'),
  banWarehouse: img('2b147-warehouse-background.jpg'),
  banAuto: img('9c210-obrien-automotive-banner.jpg'),
  banPharma: img('2174f-ph-background.jpg'),
  banServices: img('a0ff0-services-background.jpg'),
  banResources: img('4abeb-resources-background.jpg'),
  // solutions
  hdCard: img('050e0-high-density-mobile-storage.jpg'),
  hd1: img('e84d4-high-density-mobile-storage-1.jpg'),
  hd2: img('d94ec-high-density-mobile-storage-2.jpg'),
  hdNemours: img('9809b-obs__unknown__mobile_shelving__nemours_38__20220805__0c720768-scaled-e1776878234847.jpg'),
  liftsCard: img('53512-lifts-1.jpg'),
  lifts2: img('7ec0c-lifts.jpg'),
  liftSide: img('83b11-lift-side-view.jpg'),
  modulaLift: img('bfafa-modula-lift.jpg'),
  modula1: img('Modula-scaled-1.jpg'),
  lockersCard: img('86339-lockers1.jpg'),
  lockerEvidence: img('71cac-evidence-locker.jpg'),
  lockerSolutions: img('e2f7b-solutions-locker.jpg'),
  lockerCorp: img('568ff-corp-lockers.jpg'),
  agile1: img('4ff3b-agile-lockers-workplace-lockers-1.jpg'),
  agile2: img('994db-agile-lockers-workplace-lockers.jpg'),
  parcelLockers: img('ca6a3-office-parcel-delivery-lockers-800x534-1.jpg.webp'),
  shelvCard: img('e0082-static-shelving-1.jpg'),
  boxedge: img('74e6c-boxedge_open-shelving-1.jpg'),
  palletRack: img('0ddac-pallet-rack.jpg'),
  palletRack2: img('4ea3b-pallet-rack-shelving.jpg'),
  palletRack3: img('3b792-pallet-rack.jpg'),
  cabRotary: img('29f0a-rotary-file-cabinet.jpg'),
  flatFiles: img('0db1c-flat-files.jpg'),
  cabMuseum: img('554e7-museum-cabinets.jpg'),
  cabMedia: img('b8232-media-storage-cabinet.jpg'),
  cw1: img('2e457-modular-casework1.jpg'),
  cw2: img('3bca3-modular-casework-2.jpg'),
  cw3: img('aafaa-modular-casework-3.jpg'),
  cwLam: img('6340e-laminated-modular-casework.jpg'),
  // industries
  museumCard: img('b0217-museum-storage.jpg'),
  museumCabs: img('47022-museum_visualcabinets.jpg'),
  artScreen: img('f0445-museum-art-screen.jpg'),
  artScreens2: img('696eb-museum-art-screens.jpg'),
  museumTextile: img('e968d-museum-textile-storage.jpg'),
  museumDrawers: img('cdca0-museum-shelves-drawers.jpg'),
  libraryCard: img('49ddf-library.jpg'),
  libShelves: img('4ff84-library-shelves.jpg'),
  libHD: img('da6c4-high-density-shelves-library.jpg'),
  lib1: img('08c93-img_3554-free-lib-scaled-1.jpg'),
  eduCard: img('24a10-education-static-shelving.jpg'),
  eduCabs: img('08189-edu-cabinets.jpg'),
  eduModular: img('b44f0-edu-modular.jpg'),
  eduLockers: img('1cf43-edu-lockers.jpg'),
  education: img('46a58-education-storage-solutions.jpg'),
  gpsCard: img('37162-evidence.jpg'),
  gun1: img('1d70c-gun-storage-1.jpg'),
  gun2: img('2d2e6-gun-storage.jpg'),
  gun3: img('d4df9-gun-storage.jpg'),
  evidence: img('242a4-img_4538-scaled-1.jpg'),
  weapons1: img('f4a57-weapons-storage-1.jpg'),
  weapons2: img('ece23-weapons-storage.jpg'),
  pharmaCard: img('8f557-healthcare-hdms.jpg'),
  wireRack: img('9eafe-ph-wire-rack.jpg'),
  nemours4: img('a2e77-nemours4.jpg'),
  nemours5: img('ee464-nemours5.jpg'),
  nemoursCabs: img('4decc-obs__unknown__cabinets__nemours_68__20220805__b4cb4f44-scaled-1.jpg'),
  corpCard: img('80b31-corporate-storage-solutions.jpg'),
  corpHD: img('ae7b7-corporate-hdms1.jpg'),
  corpArchival: img('362de-corp-archival-storage.jpg'),
  corpCabs: img('e434c-cabinets-corporate.jpg'),
  retailCard: img('39530-retail-storage-hdms.jpg'),
  retail1: img('7d3f3-retail-storage.jpg'),
  retail2: img('b3839-retail-storage-1.jpg'),
  retail3: img('acc98-retail-storage-solution.jpg'),
  retailMobile: `${MEDIA8}/montel_retail-mobile-e1785338947568.png`,
  autoCard: img('8d242-tire-rack.jpg'),
  auto1: img('abcfa-automotive-shelving.jpg'),
  auto2: img('be29b-automotive-shelving-2.jpg'),
  auto3: img('15e76-automotive-shelving-3.jpg'),
  mhwCard: img('c85f8-pallet-rack-mhw.jpg'),
  mhw1: img('5bfc2-mhw.jpg'),
  mhwLC: img('d34ea-mhw_lc1.jpg'),
  warehouse: img('e5232-warehouse-solutions.jpg'),
  mezzanine: img('ee7ef-freestanding-mezzanine.jpg'),
  vfCard: img('71cfe-vertical-farming-1.jpg'),
  vf2: img('3e7f8-vertical-farming-2.jpg'),
  vf3: img('b1679-vertical-farming-3.jpg'),
  vfTables: img('aab5c-vf-tables.jpg'),
  gcNewSpace: img('5da53-obs__unknown__cabinets__empty_storage_area__newly_designed_storage_area__0730c344-e1775586454713.jpg'),
  gcProject: img('24215-47-e1780411998743.jpg'),
  maximize: img('f5230-maximize-storage-space-1.jpg'),
  // round 3 additions
  summitLockers: img('fe33b-summit-lockers-brochure.jpeg'),
  hamiltonLocker: img('b9be5-hamilton-locker-brochure-final-locker-e1777571764125.jpeg'),
  nemours1: img('bbb99-nemours1-e1681392439776.jpg'),
  svc1: img('91063-services-obrien.jpg'),
  svc2: img('41c78-relocation-consultation.jpg'),
  svc3: img('235ee-system.jpg'),
  svcMain: img('89080-services.jpg'),
  // round 4: visually-picked replacements
  musApp: img('3e210-museum-storage-application.jpg'),
  storAisle: img('fe96a-storage.jpg'),
  banHome2: img('e381e-homepage-background-2.jpg'),
  hamilton: img('c4d30-hamilton-2048x1536.jpg'),
  hamiltonTall: img('dcc9b-homepage_image3.jpg'),
  bg3: img('b9dcc-background-3.jpg'),
  bg4: img('e3df5-background-4.jpg'),
  orgBg: img('d2e83-organization-background.jpg'),
  contracts: img('d62db-contracts.jpg'),
  musVisual2: img('8efd2-museum-visual-cabinets.jpg'),
  musCompact: img('e3e9d-museum-compact-shelves.jpg'),
  textile: img('9dd25-textile-storage-1.jpg'),
  clinic: img('2e457-modular-casework1.jpg'),
  pharmaBottles: img('Pharmaceutical-and-Healthcare-Solutions.jpg'),
};

const COVERS = {
  museum: img('90855-museum.jpg'),
  healthcare: img('d193a-healthcare.jpg'),
  publicSafety: img('332fa-public-safety.jpg'),
  materialHandling: img('6bb35-material-handling.jpg'),
  services: img('Services-1.jpg'),
  government: img('f64ac-government.jpg'),
  education: img('75eec-education.jpg'),
  corporate: img('72039-redefining-space-and-asset-management.jpg'),
  lockers: img('10a31-obrien-system-lockers-brochure-cover.jpg'),
};

const PDF = 'https://obriensys.patrick-obrien.com/wp-content/uploads/2026/06';
const BROCHURES = [
  ['Museum Storage Brochure', 'assets/brochures/museum.pdf', 'museum'],
  ['Healthcare Brochure', 'assets/brochures/healthcare.pdf', 'healthcare'],
  ['Public Safety Brochure', 'assets/brochures/public-safety.pdf', 'publicSafety'],
  ['Government Brochure', 'assets/brochures/government.pdf', 'government'],
  ['Education Brochure', 'assets/brochures/education.pdf', 'education'],
  ['Corporate Brochure', 'assets/brochures/corporate.pdf', 'corporate'],
  ['Material Handling Brochure', 'assets/brochures/material-handling.pdf', 'materialHandling'],
  ['Lockers Brochure', 'assets/brochures/lockers.pdf', 'lockers'],
  ['Services Brochure', 'assets/brochures/services.pdf', 'services'],
];

const SB_CERT = `Commonwealth of Pennsylvania Small Business (SB) Certified`;

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
.nav{display:flex;align-items:center;gap:18px;height:76px}
.logo img{height:52px;width:auto}
nav.menu{display:flex;gap:0;margin-left:auto}
nav.menu>div{position:relative}
nav.menu a.top{display:block;padding:26px 10px;font-weight:600;font-size:.89rem;color:var(--ink);white-space:nowrap}
nav.menu>div:hover a.top{color:var(--teal)}
.mega{position:absolute;top:100%;left:50%;transform:translateX(-50%) translateY(8px);background:#fff;border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow);padding:22px;display:none;gap:10px 14px}
.mega::before{content:"";position:absolute;left:-20px;right:-20px;top:-20px;height:24px}
nav.menu>div:hover .mega,nav.menu>div:focus-within .mega{display:grid}
.mega.sol{grid-template-columns:repeat(3,258px);gap:6px 18px}
.mega.ind{grid-template-columns:repeat(3,248px);gap:6px 18px}
.mega a{display:block;padding:12px 14px;border-radius:10px}
.mega a:hover{background:var(--mist)}
.mega .t{font-weight:700;font-size:.9rem;color:var(--ink);line-height:1.35;display:block}
.mega a:hover .t{color:var(--teal)}
.mega .d{font-size:.78rem;color:var(--muted);margin-top:4px;line-height:1.5;display:block}
.mega .all{grid-column:1/-1;text-align:center;border-top:1px solid var(--line);margin-top:6px;padding-top:12px;font-weight:700;color:var(--teal);font-size:.85rem}
.head-cta{display:flex;align-items:center;gap:14px}
.head-phone{font-weight:800;color:var(--teal-ink);font-size:.92rem;white-space:nowrap}
.head-cta .btn{padding:.65rem 1.2rem;font-size:.84rem;white-space:nowrap}

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
.page-hero::before{content:"";position:absolute;inset:0;background:var(--hero-img) center/cover no-repeat;opacity:.30}
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

.stats{padding:64px 0 0}
.stats .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;text-align:center}
.stats b{display:block;font-size:2.1rem;color:var(--teal)}
.stats span{font-size:.85rem;color:var(--muted)}
.certbar{margin:44px auto 0;max-width:1200px;padding:0 24px}
.certbar div{background:var(--mist);border:1px solid var(--line);border-radius:999px;text-align:center;padding:12px 20px;font-size:.88rem;font-weight:600;color:var(--teal-ink)}
.certbar .shield{margin-right:8px}

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
.card .meta{font-size:.75rem;color:var(--muted);letter-spacing:.06em;text-transform:uppercase;margin-bottom:6px}

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
.proj{position:relative;border-radius:var(--radius);overflow:hidden;height:340px;display:flex;align-items:flex-end;color:#fff;background-size:cover;background-position:center;transition:transform .15s ease, box-shadow .15s ease}
a.proj:hover{transform:translateY(-4px);box-shadow:var(--shadow)}
a.proj .cap .t::after{content:" \\2192";color:#9fd9db}
.proj::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0) 40%,rgba(2,40,42,.88) 100%)}
.proj .cap{position:relative;z-index:2;padding:20px}
.proj .cap .k{font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;color:#9fd9db;font-weight:700}
.proj .cap .t{font-weight:700;font-size:1.02rem;margin-top:4px;line-height:1.3}

.partners-row{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:16px;margin-top:34px}
a.pt{border:1px solid var(--line);border-radius:var(--radius);padding:22px 16px;text-align:center;background:#fff;display:block;transition:border-color .15s ease, transform .15s ease}
a.pt:hover{border-color:var(--teal);transform:translateY(-3px)}
a.pt b{display:block;font-size:1.02rem;letter-spacing:.04em;color:var(--teal-ink)}
a.pt span{font-size:.75rem;color:var(--muted);display:block;margin-top:6px;line-height:1.45}
a.pt .ext{display:block;margin-top:10px;font-size:.75rem;font-weight:700;color:var(--teal)}

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

/* FAQ */
.faq{margin-top:52px}
.faq h2{font-size:1.35rem;margin-bottom:18px}
.faq details{border:1px solid var(--line);border-radius:10px;margin-bottom:10px;background:#fff}
.faq summary{cursor:pointer;font-weight:700;padding:14px 18px;color:var(--teal-ink);list-style:none;position:relative;padding-right:44px}
.faq summary::after{content:"+";position:absolute;right:18px;top:50%;transform:translateY(-50%);color:var(--teal);font-size:1.3rem;font-weight:700}
.faq details[open] summary::after{content:"\\2212"}
.faq details p{padding:0 18px 16px;color:#39494c;font-size:.92rem}

/* blog */
.post-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.post-hero{position:relative;color:#fff;overflow:hidden;background:var(--teal-ink)}
.post-hero::before{content:"";position:absolute;inset:0;background:var(--hero-img) center/cover no-repeat;opacity:.25}
.post-hero .wrap{position:relative;z-index:2;padding:64px 24px}
.post-hero h1{font-size:clamp(1.7rem,3.5vw,2.6rem);max-width:26ch}
.post-hero .meta{color:var(--teal-soft);font-weight:700;font-size:.85rem;letter-spacing:.08em;text-transform:uppercase;margin-bottom:12px}
.post-content{max-width:760px;margin:0 auto;padding:56px 24px}
.post-content p{margin-bottom:1.1rem;color:#39494c}
.post-content h2{font-size:1.45rem;margin:2rem 0 .8rem;color:var(--teal-ink)}
.post-content h3{font-size:1.15rem;margin:1.6rem 0 .6rem;color:var(--teal-ink)}
.post-content ul,.post-content ol{margin:0 0 1.1rem 1.4rem;color:#39494c}
.post-content li{margin-bottom:.4rem}
.post-content img{border-radius:var(--radius);margin:1.4rem auto;box-shadow:var(--shadow)}
.post-content figure{margin:1.4rem 0}
.post-content figcaption{font-size:.8rem;color:var(--muted);text-align:center}
.post-content blockquote{border-left:4px solid var(--teal);padding:.4rem 0 .4rem 1.2rem;margin:1.4rem 0;color:var(--muted)}
.post-content table{border-collapse:collapse;width:100%;margin:1.4rem 0;font-size:.9rem}
.post-content th,.post-content td{border:1px solid var(--line);padding:8px 12px;text-align:left}
.post-nav{max-width:760px;margin:0 auto;padding:0 24px 56px;display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap}

/* contact */
.contact-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-bottom:44px}
.ccard{border:1px solid var(--line);border-radius:var(--radius);padding:24px;background:#fff;text-align:center}
.ccard .ic{font-size:1.8rem}
.ccard b{display:block;margin:.5rem 0 .2rem;color:var(--teal-ink)}
.ccard p{font-size:.88rem;color:var(--muted)}
.ccard a.big{display:block;font-weight:800;font-size:1.05rem;color:var(--teal);margin-top:.4rem}
.form{background:var(--mist);border:1px solid var(--line);border-radius:var(--radius);padding:30px}
.form h2{font-size:1.25rem;margin-bottom:6px}
.form .note{font-size:.85rem;color:var(--muted);margin-bottom:20px}
.form .row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.form label{display:block;font-size:.8rem;font-weight:700;color:var(--teal-ink);margin:12px 0 4px}
.form input,.form select,.form textarea{width:100%;padding:.7rem .9rem;border:1px solid var(--line);border-radius:8px;font-family:var(--font);font-size:.92rem;background:#fff;color:var(--ink)}
.form input:focus,.form select:focus,.form textarea:focus{outline:2px solid var(--teal);border-color:var(--teal)}
.form button{margin-top:18px}

/* team */
.team{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin-top:38px}
.tm{border:1px solid var(--line);border-radius:var(--radius);padding:24px 18px;text-align:center;background:#fff}
.tm .avatar{width:72px;height:72px;border-radius:50%;background:var(--teal-ink);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1.4rem;margin:0 auto 12px}
.tm b{display:block;color:var(--teal-ink)}
.tm span{font-size:.82rem;color:var(--muted)}

/* brochure covers */
.dl-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;margin-top:34px}
.dlc{border:1px solid var(--line);border-radius:var(--radius);overflow:hidden;background:#fff;display:flex;flex-direction:column;transition:transform .15s ease, box-shadow .15s ease}
.dlc:hover{transform:translateY(-4px);box-shadow:var(--shadow)}
.dlc .cover{height:220px;background-size:cover;background-position:top center}
.dlc .bd{padding:16px 18px;display:flex;align-items:center;justify-content:space-between;gap:10px}
.dlc b{color:var(--teal-ink);font-size:.95rem}
.dlc .tag{font-size:.7rem;font-weight:800;background:var(--mist);color:var(--teal);padding:4px 10px;border-radius:999px;letter-spacing:.05em}

/* services */
.svc-cta{display:grid;grid-template-columns:1fr 1fr;gap:22px;margin-top:48px}
.svc-cta a{position:relative;border-radius:var(--radius);overflow:hidden;color:#fff;padding:38px 30px;display:block;background:var(--teal-ink)}
.svc-cta a::before{content:"";position:absolute;inset:0;background:var(--panel-img) center/cover;opacity:.22}
.svc-cta a>*{position:relative;z-index:2}
.svc-cta h3{font-size:1.3rem;margin-bottom:8px}
.svc-cta p{font-size:.9rem;color:#cfe9ea;margin-bottom:14px}
.svc-cta .go{font-weight:800;color:var(--teal-soft)}
.svc-cta a:hover{outline:3px solid var(--teal-soft)}

/* downloads */
.dl-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:34px}
.dl{display:flex;align-items:center;gap:14px;border:1px solid var(--line);border-radius:var(--radius);padding:18px;background:#fff;font-weight:700;color:var(--teal-ink);transition:border-color .15s ease}
.dl:hover{border-color:var(--teal)}
.dl .pdficon{flex:0 0 auto;width:40px;height:40px;border-radius:8px;background:var(--mist);display:flex;align-items:center;justify-content:center;color:var(--teal);font-size:.7rem;font-weight:800;letter-spacing:.05em}
.dl span{display:block;font-size:.75rem;color:var(--muted);font-weight:400}

.cta{position:relative;color:#fff;overflow:hidden}
.cta::before{content:"";position:absolute;inset:0;background:url('${IMGS.mobileSol}') center/cover}
.cta::after{content:"";position:absolute;inset:0;background:rgba(2,60,63,.9)}
.cta .wrap{position:relative;z-index:2;padding:84px 24px;text-align:center}
.cta h2{font-size:clamp(1.7rem,3.4vw,2.5rem)}
.cta p{color:#cfe9ea;margin:1rem auto 2rem;max-width:56ch}
.cta .phone-big{font-size:1.5rem;font-weight:800;color:var(--teal-soft);display:block;margin-top:1.6rem}
.cta .cert{margin-top:1.6rem;font-size:.8rem;color:#9fc9ca}

footer{background:#02292b;color:#9fbcbd;font-size:.87rem}
footer .cols{display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr;gap:36px;padding:56px 0 40px}
footer h4{color:#fff;font-size:.95rem;margin-bottom:14px}
footer a{display:block;color:#9fbcbd;padding:3px 0}
footer a:hover{color:var(--teal-soft)}
footer .legal{border-top:1px solid rgba(255,255,255,.12);padding:18px 0;display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px}
footer .legal a{display:inline;padding:0 10px}
.float-cta{position:fixed;right:22px;bottom:22px;z-index:60;background:var(--teal);color:#fff;border-radius:999px;padding:.9rem 1.5rem;font-weight:700;box-shadow:0 10px 26px rgba(2,60,63,.4);font-size:.9rem}
.float-cta:hover{background:var(--teal-dark)}

@media (max-width:1060px){ .head-phone{display:none} }
@media (max-width:960px){
  nav.menu{display:none}
  .apps .grid{grid-template-columns:repeat(4,1fr)}
  .apps a:nth-child(4n+1){border-left:0}
  .stats .grid,.compare .duo,.proj-grid,.cards,.steps,.feat,.gallery,.post-grid,.dl-grid,.contact-cards,.team{grid-template-columns:1fr 1fr}
  .twocol,.svc-cta,.form .row{grid-template-columns:1fr}
  .partners-row{grid-template-columns:repeat(2,1fr)}
  footer .cols{grid-template-columns:1fr 1fr}
}
@media (max-width:600px){
  .apps .grid{grid-template-columns:repeat(2,1fr)}
  .stats .grid,.compare .duo,.proj-grid,.cards,.steps,.feat,.gallery,.post-grid,.dl-grid,.contact-cards,.team{grid-template-columns:1fr}
}
`;

/* ---------------- site data ---------------- */
const SOLUTIONS = [
  { slug:'high-density-mobile-storage', name:'High-Density Mobile Storage', short:'Compact aisles, double your capacity in the same footprint', img:IMGS.hd1, banner:IMGS.banMobile },
  { slug:'lifts-carousels', name:'Lifts & Carousels (VLM)', short:'Automated vertical storage and retrieval, goods to person', img:IMGS.liftsCard, banner:IMGS.banLifts },
  { slug:'lockers', name:'Lockers', short:'Smart, evidence, athletic and personal storage lockers', img:IMGS.lockersCard, banner:IMGS.banLockers },
  { slug:'static-shelving', name:'Static Shelving', short:'4-post, pallet rack, cantilever and industrial shelving', img:IMGS.shelvCard, banner:IMGS.banShelving },
  { slug:'cabinets', name:'Cabinets', short:'Lateral, rotary and museum-grade cabinet storage', img:IMGS.cabMuseum, banner:IMGS.banCabinets },
  { slug:'modular-casework', name:'Modular Casework', short:'Reconfigurable laminate and steel casework and lab furniture', img:IMGS.cwLam, banner:IMGS.banCasework },
];

const INDUSTRIES = [
  { slug:'museums', name:'Museums', short:'Collections, art racks and conservation', img:IMGS.musApp, banner:IMGS.banMuseum },
  { slug:'libraries', name:'Libraries', short:'Collection shelving and study space recovery', img:IMGS.libraryCard, banner:IMGS.libHD },
  { slug:'education', name:'Education', short:'Classrooms, athletics and supply storage', img:IMGS.eduCabs, banner:IMGS.banEducation },
  { slug:'athletics', name:'Athletics', short:'Team rooms, equipment and gear storage', img:IMGS.summitLockers, banner:IMGS.summitLockers },
  { slug:'government-public-safety', name:'Government & Public Safety', short:'Evidence, records and gear storage', img:IMGS.gpsCard, banner:IMGS.gpsCard },
  { slug:'military', name:'Military', short:'Readiness gear and base operations storage', img:IMGS.weapons1, banner:IMGS.weapons2 },
  { slug:'pharmaceutical-healthcare', name:'Healthcare & Pharmaceutical', short:'Supply, sterile core and lab storage', img:IMGS.wireRack, banner:IMGS.banPharma },
  { slug:'corporate-legal', name:'Corporate & Legal', short:'Records, files and workplace storage', img:IMGS.corpCard, banner:IMGS.banCorporate },
  { slug:'retail', name:'Retail', short:'Back-of-house and stockroom storage', img:IMGS.retailCard, banner:IMGS.banRetail },
  { slug:'automotive', name:'Automotive', short:'Parts, tires and dealership storage', img:IMGS.autoCard, banner:IMGS.banAuto },
  { slug:'material-handling-warehouse', name:'Material Handling & Warehouse', short:'Racking, AS/RS and mezzanines', img:IMGS.mhwCard, banner:IMGS.banWarehouse },
  { slug:'vertical-farming', name:'Vertical Farming', short:'Mobile grow systems and grow racks', img:IMGS.vfCard, banner:IMGS.banVF },
  { slug:'general-contractors', name:'General Contractors', short:'Storage packages for GCs and architects', img:IMGS.gcNewSpace, banner:IMGS.gcProject },
];

const PARTNERS = [
  ['MONTEL','High-density mobile shelving and racking, SafeAisle, vertical farming','https://www.montel.com/'],
  ['MODULA','Vertical lift modules and automated storage/retrieval','https://modula.us/'],
  ['BRUYNZEEL','Mobile shelving and museum/archive storage, Compactus','https://delta.bruynzeel-storage.com/'],
  ['DELTA DESIGNS','Museum-grade steel cabinets and art racks','https://www.deltadesignsltd.com/'],
  ['AURORA STORAGE','Steel shelving and high-density mobile, est. 1880','https://aurorastorage.com/'],
  ['BORROUGHS','Shelving, lockers, workspace and industrial storage','https://www.borroughs.com/'],
  ['DATUM','Mobile shelving, lockers, filing systems and art racks','https://www.datumstorage.com/'],
  ['METRO','Wire and solid shelving, carts for healthcare and foodservice','https://www.metro.com/'],
  ['STEELE SOLUTIONS','Structural steel mezzanines and equipment platforms','https://steelesolutions.com/'],
  ['STEEL KING','Pallet rack, cantilever rack and material handling','https://www.steelking.com/'],
  ['TENNSCO','Steel shelving, cabinets, lockers and workbenches','https://www.tennsco.com/'],
  ['ESTEY','Library and mobile cantilever shelving, by Tennsco','https://www.esteyshelving.com/'],
  ['HAMILTON CASEWORK','Laboratory and technical casework, museum cabinets','https://hamiltoncs.com/'],
  ['STABAARTE','Art storage screens, racks and museum display systems','https://www.stabaarte.com/'],
];

const partnerTile = (p) => `<a class="pt" href="${p[2]}" target="_blank" rel="noopener"><b>${p[0]}</b><span>${p[1]}</span><span class="ext">Visit ${p[2].replace(/^https:\/\/(www\.)?/,'').replace(/\/$/,'')} &nearr;</span></a>`;

/* ---------------- partials ---------------- */
const navMegaSol = SOLUTIONS.map(s =>
  `<a href="${s.slug}.html"><span class="t">${s.name}</span><span class="d">${s.short}</span></a>`).join('\n          ')
  + `\n          <a class="all" href="solutions.html">All solutions &rarr;</a>`;

const navMegaInd = INDUSTRIES.map(i =>
  `<a href="${i.slug}.html"><span class="t">${i.name}</span><span class="d">${i.short}</span></a>`).join('\n          ')
  + `\n          <a class="all" href="industries.html">All industries &rarr;</a>`;

const HEADER = `
<div class="ribbon">Design concept. Internal mockup, not the live O'Brien Systems website</div>
<div class="announce">Free on-site space assessment. <a href="contact.html">Schedule yours</a> or call <a href="tel:6108253405">610.825.3405</a></div>
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
      <div><a class="top" href="resources.html">Resources</a></div>
      <div><a class="top" href="blog.html">Blog</a></div>
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
    <p class="cert">&#128737; ${SB_CERT}</p>
  </div>
</div>`;

const FOOTER = `
<footer>
  <div class="wrap">
    <div class="cols">
      <div>
        <h4>O'Brien Systems</h4>
        <p>Custom storage solutions since 1979: headquartered in Conshohocken, PA, serving the Philadelphia region and multi-site accounts nationwide.</p>
        <p style="margin-top:10px;font-size:.8rem">PA Small Business (SB) Certified</p>
        <p style="margin-top:12px"><a href="tel:6108253405">610.825.3405</a><a href="mailto:sales@obriensys.com">sales@obriensys.com</a><a href="https://www.facebook.com/OBrienSystems/">Facebook</a></p>
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
        <a href="about.html">About Us</a><a href="projects.html">Projects</a><a href="services.html">Services</a><a href="partners.html">Manufacturer Partners</a><a href="resources.html">Resources &amp; Brochures</a><a href="blog.html">Blog</a><a href="contact.html">Contact</a>
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
  const faqs = (p.faqs||[]).map(f=>`<details><summary>${f[0]}</summary><p>${f[1]}</p></details>`).join('\n      ');
  return shell(`${p.name} | O'Brien Systems`, p.banner || p.img, `
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
    ${p.extra||''}
    ${gal?`<div class="gallery">\n      ${gal}\n    </div>`:''}
    ${faqs?`<div class="faq">\n      <h2>Frequently asked questions</h2>\n      ${faqs}\n    </div>`:''}
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
    sideImg: IMGS.compact,
    paras:[
      `Fixed shelving wastes floor. Every row needs its own aisle, so in most storage rooms more than half the square footage is air. High-density mobile systems mount your shelving on carriages and rails, letting rows compact together and share a single moving aisle.`,
      `We plan, supply, and install mechanical-assist, powered electrical, and manual systems from Montel, Aurora, Bruynzeel, and Datum. Drive choice depends on load, duty cycle, and who uses the space. Powered systems add safety sweeps and access control where the application calls for it.`,
      `Almost any 4-post shelving can ride on carriages, which means you can often reuse shelving you already own. We review rail layout and levelness during a free site assessment, provide complete equipment loading data for your structural engineer, and our own factory-trained crews handle the installation.`,
    ],
    features:[
      ['Mechanical-assist', 'Ergonomic handle drive for daily-access rooms of any size'],
      ['Powered electrical', 'Push-button aisles with safety sweeps for large or secure rooms'],
      ['Manual and low-profile', 'Simple, economical systems for smaller rooms and closets'],
      ['Reuse your shelving', 'Existing 4-post shelving can often be mounted on new carriages'],
    ],
    gallery:[IMGS.hdCard, IMGS.hd2, IMGS.hdNemours],
    faqs:[
      ['Can my existing shelving be converted to mobile?', 'Often, yes. Many 4-post shelving systems can be mounted on new carriages, which lets you buy shelving now and compact it when space runs out. Compatibility depends on the shelving line and condition, which we confirm during an assessment.'],
      ['Will my floor support a mobile system?', 'Mobile systems concentrate weight, so floor capacity matters. We provide complete equipment loading data and assist your facilities team and structural engineer in evaluating it. The structural determination always rests with your engineer of record.'],
      ['Mechanical-assist or powered: which do I need?', 'Mechanical-assist handles most rooms with an ergonomic handle drive and no wiring. Powered systems make sense for very long or heavy carriages, high-frequency access, and rooms that need programmed safety and access control.'],
    ],
    chipsTitle:'Industries that rely on high-density mobile',
    related: relInd('museums','libraries','government-public-safety','corporate-legal','pharmaceutical-healthcare','retail'),
  },
  'lifts-carousels': {
    eyebrow:'Solutions', h1:'Vertical Lift Modules & Carousels',
    lead:'Automated storage and retrieval that brings the part to the picker. Recover floor space, speed up picking, and control access to every tray.',
    sideImg: IMGS.modula1,
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
    gallery:[IMGS.lifts2, IMGS.liftSide, IMGS.modulaLift],
    chipsTitle:'Where VLMs pay off fastest',
    related: relInd('material-handling-warehouse','automotive','pharmaceutical-healthcare','retail'),
  },
  'lockers': {
    eyebrow:'Solutions', h1:'Lockers',
    lead:'Smart lockers for hybrid workplaces, evidence lockers with chain-of-custody, athletic gear storage, and personal lockers built for daily abuse.',
    sideImg: IMGS.agile1,
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
    gallery:[IMGS.lockerEvidence, IMGS.agile2, IMGS.parcelLockers],
    chipsTitle:'Locker-heavy industries',
    related: relInd('athletics','government-public-safety','military','education','corporate-legal'),
  },
  'static-shelving': {
    eyebrow:'Solutions', h1:'Static Shelving',
    lead:'4-post and case-style shelving, pallet rack, cantilever, and industrial metal shelving. The simplest, most economical way to organize a storage area.',
    sideImg: IMGS.boxedge,
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
    gallery:[IMGS.palletRack, IMGS.palletRack2, IMGS.maximize],
    faqs:[
      ["What types of static shelving does O'Brien Systems offer?", 'We offer 4-post and case-style shelving for files, records, and general storage; pallet rack for exceptionally large and heavy palletized loads; cantilever shelving suited to education and corporate settings; and industrial metal shelving for parts and supplies. Most projects combine more than one type, and the right mix is determined during a free site assessment.'],
      ['How much weight can static shelving hold?', 'Capacity depends on the shelving type, shelf size, and configuration. Industrial metal shelving on this line holds up to 600 pounds per shelf, while pallet rack is engineered for much heavier palletized loads. We size shelf gauge, spans, and uprights to what you actually store and confirm loads during the site assessment.'],
      ['Can static shelving be reconfigured or moved later?', 'Yes. 4-post and case-style systems are designed to be disassembled and reassembled, so shelving can move with a department or be reconfigured as needs change. We perform teardown, relocation, and reinstallation as a service, including for shelving we did not originally supply.'],
      ['Can static shelving be converted to high-density mobile storage later?', 'Often, yes. Many 4-post shelving systems can be mounted on mobile carriages down the road, which lets you buy shelving now and compact it when space runs out. Planning for that upgrade path at initial purchase keeps the option open.'],
      ['What determines the cost of a shelving project?', 'The main factors are shelving type and gauge, the number of sections, height and shelf count, accessories such as dividers and doors, and installation conditions. Because static shelving is modular, projects can be phased, starting with the highest-need areas and adding sections later.'],
    ],
    chipsTitle:'Common static shelving applications',
    related: relInd('education','libraries','retail','automotive','material-handling-warehouse'),
  },
  'cabinets': {
    eyebrow:'Solutions', h1:'Cabinets',
    lead:'Lateral and rotary file cabinets through museum-grade conservation cabinets. Secure, organized storage for the things that matter most.',
    sideImg: IMGS.museumCabs,
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
    gallery:[IMGS.flatFiles, IMGS.corpCabs, IMGS.cabMedia],
    chipsTitle:'Where cabinet storage leads',
    related: relInd('museums','pharmaceutical-healthcare','corporate-legal','government-public-safety'),
  },
  'modular-casework': {
    eyebrow:'Solutions', h1:'Modular Casework',
    lead:'Laminate and steel casework and lab furniture that installs fast, moves with your departments, and gets reconfigured instead of demolished.',
    sideImg: IMGS.cw3,
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
    gallery:[IMGS.cw2, IMGS.cw1, IMGS.nemours5],
    chipsTitle:'Casework-driven industries',
    related: relInd('pharmaceutical-healthcare','education','corporate-legal','government-public-safety'),
  },
};

const INDUSTRY_PAGES = {
  'museums': {
    h1:'Museum Storage',
    lead:'Collections storage that protects, organizes, and makes room for growth: art racks, conservation cabinets, and high-density systems for objects of every size.',
    sideImg: IMGS.artScreen,
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
    gallery:[IMGS.musCompact, IMGS.musVisual2, IMGS.textile],
    chipsTitle:'Solutions museums use most',
    related: relSol('high-density-mobile-storage','cabinets','static-shelving'),
  },
  'libraries': {
    h1:'Library Storage',
    lead:'Cantilever and high-density shelving that keeps collections accessible while giving the floor back to readers, study space, and programming.',
    sideImg: IMGS.lib1,
    paras:[
      `Libraries are under pressure to be community spaces, but the collection still needs a home. High-density mobile shelving compresses stacks into a fraction of the floor, and cantilever library shelving from Estey keeps open stacks browsable and adaptable.`,
      `We have compacted entire collections onto a single floor, freeing levels for seating, makerspaces, and programming without deaccessioning. Mobile systems work in public stacks, closed stacks, and archives alike.`,
      `Load matters in library projects. Book stacks are heavy, and mobile systems concentrate that weight. We supply complete loading data and work with your facilities team and structural engineer before anything is ordered.`,
    ],
    features:[
      ['Cantilever shelving', 'Classic browsable stacks, easy to re-shelve and reconfigure'],
      ['High-density mobile', 'The whole collection in a fraction of the floor'],
      ['Archives and special collections', 'Closed-stack and conservation-grade options'],
      ['Engineer coordination', 'Loading data supplied to your structural engineer before ordering'],
    ],
    gallery:[IMGS.libShelves, IMGS.libHD, IMGS.libraryCard],
    chipsTitle:'Solutions libraries use most',
    related: relSol('static-shelving','high-density-mobile-storage','cabinets'),
  },
  'education': {
    h1:'Education Storage',
    lead:'From textbook rooms and science prep to athletics and facilities, schools run on storage that has to survive students and budgets alike.',
    sideImg: IMGS.education,
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
    gallery:[IMGS.education, IMGS.eduCard, IMGS.eduModular],
    chipsTitle:'Solutions schools use most',
    related: relSol('static-shelving','lockers','modular-casework','high-density-mobile-storage'),
  },
  'athletics': {
    h1:'Athletics Storage',
    lead:'Team rooms, equipment cages, and gear storage built for the pace and abuse of athletic programs at every level.',
    sideImg: IMGS.lockersCard,
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
    gallery:[IMGS.hamiltonLocker, IMGS.eduLockers, IMGS.agile1],
    chipsTitle:'Solutions athletic programs use most',
    related: relSol('lockers','static-shelving','high-density-mobile-storage'),
  },
  'government-public-safety': {
    h1:'Government & Public Safety Storage',
    lead:'Evidence rooms, records centers, and gear storage where accountability is the whole point.',
    sideImg: IMGS.evidence,
    paras:[
      `In public safety storage, organization is chain of custody. Evidence rooms need pass-through lockers, secure shelving, and layouts that make every item findable and auditable. We plan evidence storage around your intake volume, retention schedules, and accreditation requirements.`,
      `Beyond evidence, agencies store records, gear, weapons, and fleet equipment. High-density mobile shelving compresses records rooms. Gear lockers keep officer equipment staged and accounted for. Weapons storage secures armories with the documentation trail agencies require.`,
      `O'Brien Systems is a Commonwealth of Pennsylvania Small Business (SB) certified vendor, and our crews are accustomed to working in secure facilities.`,
    ],
    features:[
      ['Evidence storage', 'Pass-through lockers and secure, auditable shelving'],
      ['Records compaction', 'High-density systems sized to retention schedules'],
      ['Gear and armory', 'Officer equipment staged, secured, and documented'],
      ['PA SB certified', 'Commonwealth of Pennsylvania Small Business certified vendor'],
    ],
    gallery:[IMGS.gun1, IMGS.lockerEvidence, IMGS.gpsCard],
    chipsTitle:'Solutions agencies use most',
    related: relSol('lockers','high-density-mobile-storage','static-shelving','cabinets'),
  },
  'military': {
    h1:'Military Storage',
    lead:'Readiness depends on gear you can find, count, and issue fast. We build storage for armories, supply rooms, and base operations.',
    sideImg: IMGS.weapons2,
    paras:[
      `Military and defense storage is inventory discipline made physical. Gear issue moves faster when every item has an assigned, labeled home. We outfit supply rooms and ready rooms with gear lockers, high-density shelving, and weapons storage designed around issue and turn-in workflows.`,
      `Manufacturer lines like Montel and Borroughs build military-specification lockers and shelving for exactly these environments, from TA-50 gear storage to armory racking.`,
      `Our crews handle access-controlled sites and coordinate installations around operational schedules. Projects run through applicable procurement vehicles where required, and O'Brien Systems holds Commonwealth of Pennsylvania Small Business (SB) certification.`,
    ],
    features:[
      ['Gear lockers', 'Assigned, labeled storage for issued equipment'],
      ['Armory storage', 'Weapons racking with documentation-friendly layouts'],
      ['Supply room compaction', 'High-density systems for issue and turn-in'],
      ['Controlled-site installs', 'Crews accustomed to access requirements'],
    ],
    gallery:[IMGS.gun2, IMGS.gun3, IMGS.weapons1],
    chipsTitle:'Solutions defense facilities use most',
    related: relSol('lockers','high-density-mobile-storage','static-shelving'),
  },
  'pharmaceutical-healthcare': {
    h1:'Healthcare & Pharmaceutical Storage',
    lead:'Supply chains inside the building: sterile core, pharmacy, lab, and materials storage that keeps clinical space clinical.',
    sideImg: IMGS.clinic,
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
    gallery:[IMGS.pharmaBottles, IMGS.nemours5, IMGS.pharmaCard],
    chipsTitle:'Solutions healthcare facilities use most',
    related: relSol('modular-casework','high-density-mobile-storage','cabinets','lifts-carousels'),
  },
  'corporate-legal': {
    h1:'Corporate & Legal Storage',
    lead:'Records rooms, file systems, and workplace storage that keep information findable and offices working.',
    sideImg: IMGS.corpCard,
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
    gallery:[IMGS.corpHD, IMGS.corpArchival, IMGS.corpCabs],
    chipsTitle:'Solutions offices use most',
    related: relSol('high-density-mobile-storage','cabinets','lockers','modular-casework'),
  },
  'retail': {
    h1:'Retail Storage',
    lead:'Back-of-house storage that shrinks the stockroom instead of the stock, keeping more floor selling and more inventory in reach.',
    sideImg: IMGS.retailMobile,
    paras:[
      `Stockroom optimization is key to maintaining an efficient flow of goods and keeping selling floor selling. Mobile shelving compacts back-of-house storage so the same room holds more SKUs, or the stockroom shrinks and the sales floor grows.`,
      `We plan retail storage around replenishment workflow: what turns fast stays at reach height in open shelving, what turns slow compacts into mobile systems, and seasonal inventory gets a home that isn't the receiving corridor.`,
      `Multi-site rollouts are a specialty. We have outfitted national store networks with standardized shelving and locker packages, coordinated store by store around trading hours, across dozens of states.`,
    ],
    features:[
      ['Stockroom compaction', 'Mobile systems that grow capacity, not footprint'],
      ['Workflow-first layout', 'Fast movers in reach, slow movers compacted'],
      ['BOPIS and parcel', 'Smart lockers for pickup and staff storage'],
      ['Multi-site rollouts', 'Standardized packages installed store by store'],
    ],
    gallery:[IMGS.retail1, IMGS.retail2, IMGS.retail3],
    chipsTitle:'Solutions retailers use most',
    related: relSol('high-density-mobile-storage','static-shelving','lockers'),
  },
  'automotive': {
    h1:'Automotive Storage',
    lead:'Parts departments, tire storage, and service operations organized so the part is where the system says it is.',
    sideImg: IMGS.autoCard,
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
    gallery:[IMGS.auto1, IMGS.auto2, IMGS.auto3],
    chipsTitle:'Solutions parts operations use most',
    related: relSol('lifts-carousels','static-shelving','high-density-mobile-storage','cabinets'),
  },
  'material-handling-warehouse': {
    h1:'Material Handling & Warehouse',
    lead:'Racking, mezzanines, and automation for operations that measure storage in throughput, not just square feet.',
    sideImg: IMGS.mhwLC,
    paras:[
      `Organizations interested in reducing cost and increasing productivity rely on high-capacity storage solutions and material handling equipment. We supply and install pallet rack and cantilever from Steel King, structural mezzanines and platforms from Steele Solutions, and industrial shelving from Borroughs.`,
      `Mezzanines create a second floor inside the building you already own, often the cheapest square footage an operation can buy. VLMs and automation compress parts storage and speed picking where labor is the constraint.`,
      `Every project gets proper engineering support: manufacturer-rated rack capacities, complete equipment load data for the structural engineer of record, and permits handled properly rather than hopefully.`,
    ],
    features:[
      ['Pallet rack and cantilever', 'Steel King racking engineered to your loads'],
      ['Mezzanines', 'Steele Solutions platforms that add a floor'],
      ['Industrial shelving', 'Borroughs systems rated for daily abuse'],
      ['Automation', 'Modula VLMs where picking speed pays'],
    ],
    gallery:[IMGS.mhw1, IMGS.palletRack3, IMGS.warehouse],
    chipsTitle:'Solutions warehouses use most',
    related: relSol('static-shelving','lifts-carousels','high-density-mobile-storage'),
  },
  'vertical-farming': {
    h1:'Vertical Farming Storage',
    lead:'Growing vertically can save space and raise crop yield per square foot. Mobile grow systems make the room itself part of the yield.',
    sideImg: IMGS.vfCard,
    paras:[
      `Vertical farming applies the same math as high-density storage: eliminate aisles, multiply capacity. Montel's mobile grow systems mount multi-tier grow racks on carriages, so a grow room needs one working aisle instead of one per row.`,
      `The same principles cover trays, decking, drying racks, and the carts that move product through the operation. Integration with lighting, ventilation, and irrigation gets planned with your cultivation team, not around them.`,
      `We handle layout, delivery, and installation, provide loading data for your structural engineer, and service and reconfigure systems as operations scale.`,
    ],
    features:[
      ['Mobile grow systems', 'Montel carriage-mounted multi-tier growing'],
      ['Grow racks and trays', 'Static racks, wire decking, and drying storage'],
      ['Utility coordination', 'Layouts planned around lighting and irrigation'],
      ['Scale-up service', 'Reconfiguration as the operation grows'],
    ],
    gallery:[IMGS.vf2, IMGS.vfTables, IMGS.vf3],
    chipsTitle:'Related solutions',
    related: relSol('high-density-mobile-storage','static-shelving'),
  },
  'general-contractors': {
    h1:'For GCs, Architects & Owners',
    lead:'A storage subcontractor that shows up with complete submittals, hits the schedule, and handles Division 10 storage scope end to end.',
    sideImg: IMGS.gcNewSpace,
    paras:[
      `GCs, architects, and owners bring us in when a project includes storage scope: evidence rooms in a public safety building, library stacks, lab casework, lockers, or high-density systems in a records center. We take the package from specification through punch list.`,
      `The paperwork works the way construction expects it to. Submittal packages include shop drawings and CAD layouts, product data, finish selections, and lead-time schedules. Progress billing runs in AIA format (G702/G703) with standard retainage, and deliveries are sequenced to the construction schedule with factory-trained crews who work clean on active sites.`,
      `On floor loads: high-density and rail-mounted systems concentrate weight, so we provide complete equipment loading data and work alongside the project's structural engineer during design. Structural determinations always rest with the engineer of record; our job is to make that engineer's job easy.`,
      `Because we carry 14 manufacturer lines, we can meet a spec as written or propose equals that protect the budget without weakening the design intent. For public work, O'Brien Systems is a Commonwealth of Pennsylvania Small Business (SB) certified vendor, which can help prime contractors meet small business participation goals.`,
    ],
    features:[
      ['Submittals, shop drawings & CAD', 'Complete packages: drawings, product data, finishes, lead times'],
      ['AIA-format billing', 'G702/G703 progress billing and retainage, handled without drama'],
      ['Engineer-of-record support', 'Equipment loading data and design assistance for your structural engineer'],
      ['Spec-or-equal flexibility', '14 lines to meet spec as written or protect the budget'],
      ['Clean site discipline', 'Crews that work active construction sites properly'],
      ['PA SB certified', 'Counts toward small business participation goals'],
    ],
    extra:`
    <span class="eyebrow" style="margin-top:52px;display:inline-block">Who We Answer To</span>
    <h2 style="font-size:1.5rem">Everyone reads the same drawing differently</h2>
    <p class="lead">A storage package has three customers, and they want different things. We run projects so all three get theirs.</p>
    <div class="cards" style="margin-top:30px">
      <div class="card"><div class="bd">
        <div class="meta">The GC wants certainty</div>
        <h3>Schedule &amp; scope</h3>
        <p>Submittals on time, one sub covering the whole storage scope, deliveries that match the construction sequence, AIA pay apps that process cleanly, and a punch list with nothing on it.</p>
      </div></div>
      <div class="card"><div class="bd">
        <div class="meta">The architect wants intent protected</div>
        <h3>Design &amp; documentation</h3>
        <p>Basis-of-design support during spec writing, CAD details and finish selections that hold up, and honest guidance when an equal is proposed so the design intent survives value engineering.</p>
      </div></div>
      <div class="card"><div class="bd">
        <div class="meta">The owner wants it to work</div>
        <h3>Capacity &amp; life cycle</h3>
        <p>Storage that matches the program's real volumes, budget options across 14 manufacturer lines, and a local service partner who still answers the phone years after turnover.</p>
      </div></div>
    </div>`,
    gallery:[IMGS.mezzanine, IMGS.maximize, IMGS.svc3],
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

const industriesHub = shell(`Industries We Serve | O'Brien Systems`, IMGS.banHome2, `
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
    <p>A sampling of the spaces our crews have planned and built since 1979, from the Delaware Valley to job sites across the country.</p>
  </div>
</div>
<section class="block"><div class="wrap">
  <div class="proj-grid">
    <a class="proj" href="museums.html" style="background-image:url('${IMGS.artScreen}')"><div class="cap"><span class="k">Museum</span><div class="t">Art screens and conservation storage for a regional collection</div></div></a>
    <a class="proj" href="libraries.html" style="background-image:url('${IMGS.lib1}')"><div class="cap"><span class="k">Library</span><div class="t">High-density shelving that kept the whole collection on one floor</div></div></a>
    <a class="proj" href="pharmaceutical-healthcare.html" style="background-image:url('${IMGS.clinic}')"><div class="cap"><span class="k">Healthcare</span><div class="t">Modular casework and supply storage for a children's health system</div></div></a>
    <a class="proj" href="government-public-safety.html" style="background-image:url('${IMGS.evidence}')"><div class="cap"><span class="k">Public Safety</span><div class="t">Evidence storage planned around chain of custody</div></div></a>
    <a class="proj" href="material-handling-warehouse.html" style="background-image:url('${IMGS.mhwLC}')"><div class="cap"><span class="k">Warehouse</span><div class="t">Material handling and storage for high-throughput operations</div></div></a>
    <a class="proj" href="retail.html" style="background-image:url('${IMGS.retailMobile}')"><div class="cap"><span class="k">Retail</span><div class="t">Back-of-house mobile storage that shrank the stockroom, not the stock</div></div></a>
    <a class="proj" href="museums.html" style="background-image:url('${IMGS.museumCabs}')"><div class="cap"><span class="k">Museum</span><div class="t">Visual storage cabinets that put a collection on display, protected</div></div></a>
    <a class="proj" href="corporate-legal.html" style="background-image:url('${IMGS.agile1}')"><div class="cap"><span class="k">Workplace</span><div class="t">Smart lockers for a hybrid office's day-use storage</div></div></a>
    <a class="proj" href="general-contractors.html" style="background-image:url('${IMGS.gcNewSpace}')"><div class="cap"><span class="k">Renovation</span><div class="t">An empty storage area redesigned into working capacity</div></div></a>
  </div>
</div></section>`);

const servicesPage = shell(`Services | O'Brien Systems`, IMGS.banServices, `
<div class="page-hero">
  <div class="wrap crumbs"><a href="index.html">Home</a> / Services</div>
  <div class="wrap">
    <span class="eyebrow">Services</span>
    <h1>From walkthrough to working storage</h1>
    <p>Buying storage isn't buying steel. It's buying a plan, an installation, and someone who answers the phone afterward.</p>
    <div class="ctas" style="display:flex;gap:14px;flex-wrap:wrap;margin-top:26px">
      <a class="btn btn-white" href="contact.html?topic=service">Schedule Service</a>
      <a class="btn btn-ghost" href="contact.html?topic=quote">Request a Quote or Proposal</a>
    </div>
  </div>
</div>
<section class="block"><div class="wrap">
  <span class="eyebrow">How Projects Run</span>
  <h2>Four steps, <em>one team</em></h2>
  <div class="steps">
    <div class="step"><span class="n">01 &mdash; ASSESS</span><h3>Free Space Assessment</h3><p>We walk your space, measure what you store, and find the capacity you didn't know you had. No cost, no obligation.</p></div>
    <div class="step"><span class="n">02 &mdash; DESIGN</span><h3>Layout &amp; Specification</h3><p>Drawings, equipment load data, and an itemized quote, matched to the right manufacturer line for the job.</p></div>
    <div class="step"><span class="n">03 &mdash; INSTALL</span><h3>Factory-Trained Installation</h3><p>Our own crews deliver, anchor, and level, coordinated around your operating hours and site rules.</p></div>
    <div class="step"><span class="n">04 &mdash; SUPPORT</span><h3>Service &amp; Relocation</h3><p>Maintenance, reconfiguration, teardown and moves, even for systems we didn't originally supply.</p></div>
  </div>
</div></section>
<section class="block projects-bg" style="padding-top:56px;padding-bottom:56px"><div class="wrap">
  <span class="eyebrow">What We Do After the Sale</span>
  <h2>Service is the <em>product</em></h2>
  <div class="feat" style="margin-top:34px">
    <div><b>Maintenance &amp; repair, any brand</b><span>We maintain and repair storage systems we didn't sell, including legacy installed bases from manufacturers no longer in business.</span></div>
    <div><b>Relocation &amp; reinstallation</b><span>4-post and case-style systems disassemble and move with your department, file order intact. Offices, records rooms, whole facilities.</span></div>
    <div><b>Reconfiguration</b><span>Add sections, change shelf heights, convert static shelving to mobile carriages as your needs grow.</span></div>
    <div><b>Engineer collaboration</b><span>We supply equipment loading data and assist your structural engineer; structural determinations stay with the engineer of record.</span></div>
    <div><b>Preventive service visits</b><span>Carriage alignment, drive and safety-system checks that keep mobile systems gliding instead of grinding.</span></div>
    <div><b>Phased projects</b><span>Modular systems mean you can start with the highest-need areas and add sections later, on your budget cycle.</span></div>
  </div>
  <div class="gallery">
    <div class="g" style="background-image:url('${IMGS.svcMain}')"></div>
    <div class="g" style="background-image:url('${IMGS.svc3}')"></div>
    <div class="g" style="background-image:url('${IMGS.storAisle}')"></div>
  </div>
</div></section>
<section class="block" style="padding-top:56px"><div class="wrap">
  <span class="eyebrow">Ready When You Are</span>
  <h2>Two ways to <em>start</em></h2>
  <div class="svc-cta">
    <a href="contact.html?topic=service" style="--panel-img:url('${IMGS.svc2}')">
      <h3>Schedule service</h3>
      <p>A system that needs maintenance, repair, relocation, or reconfiguration. Tell us the brand and the symptom; we service every line we carry and most we don't.</p>
      <span class="go">Schedule service &rarr;</span>
    </a>
    <a href="contact.html?topic=quote" style="--panel-img:url('${IMGS.contracts}')">
      <h3>Request a quote or proposal</h3>
      <p>A project on paper: new construction, a renovation, or a room that stopped working. Send drawings if you have them, or just tell us what you store.</p>
      <span class="go">Request a quote &rarr;</span>
    </a>
  </div>
</div></section>`);

const partnersPage = shell(`Manufacturer Partners | O'Brien Systems`, IMGS.orgBg, `
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
    ${PARTNERS.map(partnerTile).join('\n    ')}
  </div>
  <p class="lead" style="margin-top:40px">Why buy through a dealer instead of direct? Because manufacturers build products and we build projects. One assessment covers every option. One crew installs the mix your space actually needs. One phone number answers for all of it, for the life of the system.</p>
</div></section>`);

const aboutPage = shell(`About Us | O'Brien Systems`, IMGS.bg3, `
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
    <span class="eyebrow">Our Story</span>
    <h2 style="margin-bottom:14px">A family owned and operated business</h2>
    <p>O'Brien Systems was founded in 1979 by Charles O'Brien, Charlie O or Chaz to those who knew and loved him. Shortly after starting the business, Charles was in a major car accident that left him hospitalized for three months and unable to return to his office in Suburban Station for over a year. Although the odds were stacked against him, he was determined to succeed, and the original work-from-home business was born: proposals typed on his trusted Royal typewriter, hand delivered by his son Kevin after classes at Villanova.</p>
    <p>Kevin joined the business full time in 1981 with a Villanova degree in finance. Charles' youngest son Mike followed in 1985, and years later oldest son Dennis left banking to join his brothers. A phenomenal group of decade-long employees, who have turned into family, play a major role in the success of the business, and most recently Charlie's granddaughter Jess joined the team.</p>
    <p>At its core, O'Brien Systems is a strong combination of family values, determination and a great deal of long, hard hours in the office and in the field. Through four decades the objective has never changed: provide our clients with the highest quality of service and products to help their business succeed.</p>
  </div>
  <div class="side-img"><img src="${IMGS.hamiltonTall}" alt="O'Brien Systems storage installation" loading="lazy"></div>
</div>
<div class="wrap">
  <div class="feat">
    <div><b>Family-owned since 1979</b><span>Four decades of storage projects, local and national.</span></div>
    <div><b>Philadelphia HQ, national reach</b><span>Based in Conshohocken, PA, with installations from the Delaware Valley to sites across the country.</span></div>
    <div><b>14 manufacturer lines</b><span>Authorized dealer for the industry's leading brands.</span></div>
    <div><b>PA Small Business Certified</b><span>Commonwealth of Pennsylvania SB certification, valid 06/10/2026 through 06/10/2028.</span></div>
  </div>
  <span class="eyebrow" style="margin-top:56px;display:inline-block">Meet Our Team</span>
  <h2>The people who <em>answer the phone</em></h2>
  <p class="lead">A small team means the person who plans your project is the person who stands behind it.</p>
  <div class="team">
    <div class="tm"><div class="avatar">KO</div><b>Kevin O'Brien</b><span>President</span><p style="font-size:.8rem;color:var(--muted);margin-top:8px">40+ years designing storage and casework solutions. Villanova finance grad; past president of the Automated Solutions Association.</p></div>
    <div class="tm"><div class="avatar">MO</div><b>Michael O'Brien</b><span>Vice President</span><p style="font-size:.8rem;color:var(--muted);margin-top:8px">30+ years and over 3,000 high-density storage systems across commercial, government, museum, pharmaceutical and education projects.</p></div>
    <div class="tm"><div class="avatar">DO</div><b>Dennis O'Brien</b><span>Vice President</span><p style="font-size:.8rem;color:var(--muted);margin-top:8px">40+ years in accounting and finance, from Fidelity Bank to O'Brien Systems. Villanova finance grad with a Drexel MBA.</p></div>
    <div class="tm"><div class="avatar">DM</div><b>Drew Murray</b><span>Regional Sales Manager</span><p style="font-size:.8rem;color:var(--muted);margin-top:8px">25+ years in the design, supply and installation of high-density storage and casework. Dickinson BA, Temple MBA.</p></div>
    <div class="tm"><div class="avatar">SS</div><b>Sharon Spitko</b><span>Office &amp; Operations Manager</span><p style="font-size:.8rem;color:var(--muted);margin-top:8px">20+ years running accounts, project management and the office itself. Notary public and NNA member.</p></div>
    <div class="tm"><div class="avatar">JC</div><b>Jim Curcio</b><span>Service Manager</span><p style="font-size:.8rem;color:var(--muted);margin-top:8px">20+ years in the service department, specializing in preventative maintenance and post-installation support.</p></div>
    <div class="tm"><div class="avatar">JV</div><b>Jess Viola</b><span>Marketing Specialist &amp; Project Manager</span><p style="font-size:.8rem;color:var(--muted);margin-top:8px">Website, social media and project management, with a background in HR and healthcare marketing.</p></div>
    <div class="tm"><div class="avatar">PO</div><b>Patrick O'Brien</b><span>Sales &amp; Technology</span><p style="font-size:.8rem;color:var(--muted);margin-top:8px">The next generation: sales, systems and the technology that keeps a 45-year-old company moving fast.</p></div>
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
<section class="block"><div class="wrap">
  <div class="contact-cards">
    <div class="ccard"><span class="ic">&#128222;</span><b>Call or email</b><p>Monday through Friday, straight to a person who knows storage.</p><a class="big" href="tel:6108253405">610.825.3405</a><a class="big" href="mailto:sales@obriensys.com" style="font-size:.92rem">sales@obriensys.com</a></div>
    <div class="ccard"><span class="ic">&#128205;</span><b>Visit us</b><p>739 E. Elm Street<br>Conshohocken, PA 19428</p><a class="big" href="https://www.google.com/maps?q=739+E+Elm+Street+Conshohocken+PA+19428" target="_blank" rel="noopener">Get directions</a></div>
    <div class="ccard"><span class="ic">&#128737;</span><b>Public procurement</b><p>PA Small Business (SB) Certified.</p><a class="big" href="government-public-safety.html">Government storage &rarr;</a></div>
  </div>
  <div class="twocol">
    <div class="form">
      <h2>Tell us what you're working on</h2>
      <p class="note">We reply within one business day. Prefer the phone? <a href="tel:6108253405">610.825.3405</a> works too.</p>
      <div class="row">
        <div><label for="f-name">Name</label><input id="f-name" type="text" placeholder="E.g. John Doe"></div>
        <div><label for="f-company">Organization</label><input id="f-company" type="text" placeholder="Company, agency, or school"></div>
      </div>
      <div class="row">
        <div><label for="f-email">Email</label><input id="f-email" type="email" placeholder="E.g. john@doe.com"></div>
        <div><label for="f-phone">Phone</label><input id="f-phone" type="tel" placeholder="E.g. +1 3004005000"></div>
      </div>
      <label for="f-topic">What do you need?</label>
      <select id="f-topic">
        <option value="assessment">Schedule a free space assessment</option>
        <option value="service">Schedule service on an existing system</option>
        <option value="quote">Request a quote or proposal</option>
        <option value="talk">Just want to talk it through</option>
      </select>
      <label for="f-msg">Message</label>
      <textarea id="f-msg" rows="5" placeholder="Enter your message..."></textarea>
      <button class="btn btn-solid" type="button" onclick="this.textContent='Sent (mockup only)'">Send Message</button>
      <p class="note" style="margin-top:14px;margin-bottom:0">Design mockup: this form isn't wired up yet. The production version connects to the same Forminator backend as the current site.</p>
    </div>
    <div class="side-img"><iframe title="Map to O'Brien Systems" src="https://www.google.com/maps?q=739+E+Elm+Street+Conshohocken+PA+19428&output=embed" style="border:0;width:100%;height:100%;min-height:480px" loading="lazy"></iframe></div>
  </div>
</div></section>
<script>
  (function(){
    var t = new URLSearchParams(location.search).get('topic');
    var sel = document.getElementById('f-topic');
    if (t && sel && [...sel.options].some(function(o){return o.value===t})) sel.value = t;
  })();
</script>`);

/* ---------------- blog + resources ---------------- */
let BLOG = [];
try { BLOG = JSON.parse(fs.readFileSync(path.join(OUT,'blogdata.json'),'utf8')); } catch(e) { console.warn('no blogdata.json, blog page will be empty'); }
const fmtDate = (d) => new Date(d+'T12:00:00').toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});
const postCard = (p) => `
  <a class="card" href="post-${p.slug}.html">
    ${p.img?`<div class="ph" style="background-image:url('${p.img}')"></div>`:''}
    <div class="bd"><div class="meta">${fmtDate(p.date)}</div><h3>${p.title}</h3><p>${p.excerpt.slice(0,150)}${p.excerpt.length>150?'...':''}</p><span class="go">Read the post &rarr;</span></div>
  </a>`;

const postPage = (p, idx) => {
  const prev = BLOG[idx+1]; const next = BLOG[idx-1];
  return shell(`${p.title} | O'Brien Systems Blog`, p.imgLarge || IMGS.banResources, `
<div class="post-hero">
  <div class="wrap crumbs"><a href="index.html">Home</a> / <a href="blog.html">Blog</a></div>
  <div class="wrap">
    <div class="meta">${fmtDate(p.date)}</div>
    <h1>${p.title}</h1>
  </div>
</div>
<article class="post-content">
${p.content}
</article>
<div class="post-nav">
  ${prev?`<a class="btn btn-solid" href="post-${prev.slug}.html">&larr; Older: ${prev.title.slice(0,36)}${prev.title.length>36?'...':''}</a>`:'<span></span>'}
  ${next?`<a class="btn btn-solid" href="post-${next.slug}.html">Newer: ${next.title.slice(0,36)}${next.title.length>36?'...':''} &rarr;</a>`:'<span></span>'}
</div>`);
};

const blogPage = shell(`Blog | O'Brien Systems`, IMGS.bg4, `
<div class="page-hero">
  <div class="wrap crumbs"><a href="index.html">Home</a> / Blog</div>
  <div class="wrap">
    <span class="eyebrow">Blog</span>
    <h1>Storage, thought through</h1>
    <p>Practical writing on storage planning, space recovery, and facility organization from the O'Brien Systems team.</p>
  </div>
</div>
<section class="block"><div class="wrap">
  <div class="post-grid">
    ${BLOG.map(postCard).join('\n    ')}
  </div>
</div></section>`);

const resourcesPage = shell(`Resources & Brochures | O'Brien Systems`, IMGS.hamilton, `
<div class="page-hero">
  <div class="wrap crumbs"><a href="index.html">Home</a> / Resources</div>
  <div class="wrap">
    <span class="eyebrow">Resources</span>
    <h1>Brochures &amp; downloads</h1>
    <p>Product and industry brochures, ready to share with your team, your architect, or your purchasing department.</p>
  </div>
</div>
<section class="block"><div class="wrap">
  <div class="dl-grid">
    ${BROCHURES.map(b=>`<a class="dlc" href="${b[1]}" target="_blank" rel="noopener"><div class="cover" style="background-image:url('${COVERS[b[2]]}')"></div><div class="bd"><b>${b[0]}</b><span class="tag">PDF</span></div></a>`).join('\n    ')}
  </div>
  <p class="lead" style="margin-top:40px">Need drawings, specifications, or manufacturer literature for a specific product line? <a href="contact.html">Ask us</a> and we'll pull the current documents from the manufacturer.</p>
</div></section>`);

/* ---------------- home page ---------------- */
const homeBody = `
<div class="hero">
  <div class="wrap">
    <h1><em>Storage solved.</em> Space reclaimed.</h1>
    <p>For 45+ years, O'Brien Systems has planned, supplied, and installed custom storage from our Philadelphia-area headquarters, for local facilities and national multi-site accounts alike.</p>
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
    <div><b>Coast to Coast</b><span>Philadelphia based, installing nationwide</span></div>
    <div><b>14</b><span>manufacturer lines carried</span></div>
    <div><b>Free</b><span>on-site space assessments</span></div>
  </div>
</div>
<div class="certbar"><div><span class="shield">&#128737;</span>${SB_CERT}</div></div>

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
        <p class="lead">A few of the spaces our crews have planned and built, at home in the Delaware Valley and nationwide.</p>
      </div>
      <a class="btn btn-solid" href="projects.html">See All Projects</a>
    </div>
    <div class="proj-grid">
      <a class="proj" href="museums.html" style="background-image:url('${IMGS.artScreen}')"><div class="cap"><span class="k">Museum</span><div class="t">Art screens and conservation storage for a regional collection</div></div></a>
      <a class="proj" href="libraries.html" style="background-image:url('${IMGS.lib1}')"><div class="cap"><span class="k">Library</span><div class="t">High-density shelving that kept the whole collection on one floor</div></div></a>
      <a class="proj" href="pharmaceutical-healthcare.html" style="background-image:url('${IMGS.clinic}')"><div class="cap"><span class="k">Healthcare</span><div class="t">Modular casework and supply storage for a children's health system</div></div></a>
    </div>
  </div>
</section>

<section class="block" id="partners">
  <div class="wrap">
    <span class="eyebrow">Authorized Dealer</span>
    <h2>The best manufacturers, <em>one local partner</em></h2>
    <p class="lead">We carry 14 manufacturer lines, from high-density mobile and museum-grade storage to vertical lift modules and mezzanines. One accountable local team designs, installs, and services them all.</p>
    <div class="partners-row">
      ${PARTNERS.slice(0,7).map(partnerTile).join('\n      ')}
      <a class="pt" href="partners.html" style="display:flex;flex-direction:column;justify-content:center"><b style="color:var(--teal)">All 14 lines &rarr;</b><span>See the full line card</span></a>
    </div>
  </div>
</section>

<section class="block projects-bg" id="services" >
  <div class="wrap">
    <span class="eyebrow">Working With Us</span>
    <h2>From walkthrough to <em>working storage</em></h2>
    <p class="lead">Buying storage isn't buying steel. It's buying a plan. Here's how we run every project, whether it's one evidence room or a whole facility.</p>
    <div class="steps">
      <div class="step"><span class="n">01 &mdash; ASSESS</span><h3>Free Space Assessment</h3><p>We walk your space, measure what you store, and find the capacity you didn't know you had.</p></div>
      <div class="step"><span class="n">02 &mdash; DESIGN</span><h3>Layout &amp; Specification</h3><p>Drawings, equipment load data, and an itemized quote, matched to the right manufacturer line.</p></div>
      <div class="step"><span class="n">03 &mdash; INSTALL</span><h3>Factory-Trained Installation</h3><p>Our own crews deliver, anchor, and level, coordinated around your operating hours.</p></div>
      <div class="step"><span class="n">04 &mdash; SUPPORT</span><h3>Service &amp; Relocation</h3><p>Maintenance, reconfiguration, teardown and moves, even for systems we didn't originally supply.</p></div>
    </div>
  </div>
</section>

<section class="block" id="blog" style="padding-top:0">
  <div class="wrap">
    <div class="sec-head">
      <div>
        <span class="eyebrow">From the Blog</span>
        <h2>Storage, <em>thought through</em></h2>
      </div>
      <a class="btn btn-solid" href="blog.html">All Posts</a>
    </div>
    <div class="post-grid">
      ${BLOG.slice(0,3).map(postCard).join('\n      ')}
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
  'blog.html': blogPage,
  'resources.html': resourcesPage,
};

for (const s of SOLUTIONS) {
  const d = SOLUTION_PAGES[s.slug];
  pages[`${s.slug}.html`] = subpage({ ...d, name:s.name, img:s.img, banner:s.banner, hub:'solutions', hubName:'Solutions' });
}
for (const i of INDUSTRIES) {
  const d = INDUSTRY_PAGES[i.slug];
  pages[`${i.slug}.html`] = subpage({ ...d, eyebrow:'Industries', name:i.name, img:i.img, banner:i.banner, hub:'industries', hubName:'Industries' });
}
BLOG.forEach((p, idx) => { pages[`post-${p.slug}.html`] = postPage(p, idx); });

let n = 0;
for (const [file, html] of Object.entries(pages)) {
  fs.writeFileSync(path.join(OUT, file), html);
  n++;
}
console.log(`wrote ${n} pages + assets/style.css (blog posts: ${BLOG.length})`);
