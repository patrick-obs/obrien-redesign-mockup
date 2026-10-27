// O'Brien Systems redesign mockup - static site generator
// Run: node build.js   (writes *.html + assets/style.css into this folder)
// Blog data: blogdata.json (exported from the staging WP REST API)
const fs = require('fs');
const path = require('path');
const OUT = __dirname;
// every build gets a new asset version so browsers never mix new pages with an old cached stylesheet
const VER = Date.now().toString(36);
const X = require('./extras'); // Sept 2026 upgrades: specify panel, specify hub, service, SEO plumbing
const G = require('./growth'); // Oct 2026 search pass: deeper product pages, answers page, quote form, service-area map
const W = require('./where'); // region pages: storage-systems-<region>.html + where-we-work.html
const GD = require('./guides'); // industry guides: guides/<slug>/index.html + guides/index.html
// Website assistant (same one as obriensys.com). Switch to 'https://obriensys.com' once the chat is live there.
const CHAT_API = 'https://chatbot.obriensys-web.pages.dev';

const MEDIA = '/assets/media/2026/06';
const MEDIA8 = '/assets/media/2026/08';
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
  // Sept 2026 HD refresh: full-res, bright, no visible manufacturer marks
  hdLibrary: '/assets/media/mfr/high-density-mobile-storage--1.jpg',
  hdArchive: '/assets/media/mfr/corporate-legal--1.jpg',
  hdNemoursAisle: img('ee464-nemours5.jpg'),
  hdNemoursWide: '/assets/media/2023/04/nemours1.jpg',
  hdGearRoom: '/assets/media/ext/florida-atlantic-university-3.jpg',
  liftsCard: img('vlm-bay-crop.jpg'),
  lifts2: img('lifts-crop.jpg'),
  liftSide: img('83b11-lift-side-view.jpg'),
  modulaLift: img('vlm-bay-crop.jpg'),
  modula1: img('lifts-crop.jpg'),
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
  retailMobile: `${MEDIA8}/mobile-retail-mobile-e1785338947568.png`,
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
  hamiltonLocker: img('b9be5-smart-locker-brochure-e1777571764125.jpeg'),
  nemours1: img('bbb99-nemours1-e1681392439776.jpg'),
  svc1: img('91063-services-obrien.jpg'),
  svc2: img('41c78-relocation-consultation.jpg'),
  svc3: img('235ee-system.jpg'),
  svcMain: img('89080-services.jpg'),
  // round 4: visually-picked replacements
  musApp: '/assets/media/mfr/museums--2.jpg',
  storAisle: img('fe96a-storage.jpg'),
  banHome2: img('e381e-homepage-background-2.jpg'),
  hamilton: img('c4d30-casework-2048x1536.jpg'),
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
  // round 5: expanded solutions catalog (all visually verified via contact sheet)
  p4post: `${MEDIA8}/IMG_9310.jpeg`,
  wireBlack: `${MEDIA8}/IMG_1946-rotated-1.jpeg`,
  lancaster1: img('03dee-lancaster1.jpg'),
  lancaster2: img('c382a-lancaster2.jpg'),
  lancaster3: img('5b0fe-lancaster3.jpg'),
  quikLok: img('c59a6-quik-lok-shelving-product-guide-shelving.jpeg'),
  boxedge2: img('02bb9-boxedge_open-shelving-e1780410336984.jpg'),
  storBox: img('a0b3f-storage-box.jpg'),
  openShelv: img('baf21-bma_open-shelving-rotated-1.jpg'),
  palletNGA: img('73f98-nga_pallet-rack-rotated-1.jpg'),
  palletMobile: img('f9947-bma_pallet-rack-on-mobile-rotated-1.jpg'),
  mezz2: img('fdf08-mezzanine.jpg'),
  midproject2: img('87244-midproject2.jpg'),
  installer: img('748ef-midproject.jpg'),
  tennscoWardrobe: '/assets/media/ext/CVD1871.jpg',
  evidRoom: img('0900e-img_4533-scaled-e1774366531196.jpg'),
  rotary2: img('7f9df-rotary-file-cabinets-1.jpg'),
  musSlots: img('99962-12434.jpg'),
  lateralTh: img('d7e6f-lateral-cabinet-th.jpg'),
  electricHD: img('f3391-electrical-assist-high-density-mobile.jpg'),
  hdmsArtScreen: img('eb764-hdms-art-screen.jpg'),
  artHD: img('9c939-high-density-art-screens.jpg'),
  // manufacturer photos, credited on-page (mockup placeholders until we shoot our own)
  montelSharks: '/assets/media/ext/mobilex_san_jose_sharks_3.png',
  montelFAU: '/assets/media/ext/florida-atlantic-university-3.jpg',
  montelKnights: '/assets/media/ext/case-study-golden_knight_vignette.jpg',
  montelWisconsin: '/assets/media/ext/case-study-university-of-wisconsin.jpg',
  hamMailroom: '/assets/media/ext/mail-sorter-indexed-shelving-mailroom.jpg',
  hamMailGlass: '/assets/media/ext/mail-sorter-glass-door-executive-casework.jpg',
  wcCage: '/assets/media/ext/WireCrafters-DEA-Storage-Cage.jpg',
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

const PDF = '/assets/media/2026/06';
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
const KEYSTONE = (cls) => `<svg class="${cls}" viewBox="0 0 100 100" role="img" aria-label="Pennsylvania keystone"><path d="M35 4 H65 V19 H96 L83 96 H60 V80 H40 V96 H17 L4 19 H35 Z" fill="#023c3f" stroke="#e8a33d" stroke-width="4" stroke-linejoin="round"/><text x="50" y="60" text-anchor="middle" font-size="32" font-weight="800" fill="#e8a33d">SB</text></svg>`;

/* "Storage Redefined" dictionary entries (Jess's headers): bold word, italic part of speech, the old definition struck through,
   then a teal "Redefined:" label and the new one. Headlines, eyebrows, card tops and page headers only. */
const SRDATA = {
  home: { w:'stor&middot;age', pos:'n.', old:'A room where things go to be forgotten.', re:'A plan for everything you keep, so you can find it when you need it.' },
  sqft: { w:'square foot&middot;age', pos:'n.', old:'The space you have.', re:'The space you have, plus the space your aisles are hiding.' },
  'high-density-mobile-storage': { w:'aisle', pos:'n.', old:'Wasted floor space.', re:'A gap you only open when you need it.' },
  'lifts-carousels': { w:'re&middot;triev&middot;al', pos:'n.', old:'A ladder and a long walk.', re:'Push a button. Your item comes to you.' },
  'lockers': { w:'lock&middot;er', pos:'n.', old:'A metal box in the hallway.', re:'Secure storage for evidence, gear, and everything in between.' },
  'static-shelving': { w:'shelv&middot;ing', pos:'n.', old:'Whatever was here when you moved in.', re:'Sized for what you store, rated for what it weighs.' },
  'cabinets': { w:'cab&middot;i&middot;net', pos:'n.', old:'A place to put things away.', re:'Museum-grade protection for things that cannot be replaced.' },
  'modular-casework': { w:'case&middot;work', pos:'n.', old:'Built in, and stuck that way.', re:'Furniture that changes when your room does.' },
  'museums': { w:'col&middot;lec&middot;tion', pos:'n.', old:'Whatever fits in the back room.', re:'Irreplaceable objects, stored to conservation standards.' },
  'government-public-safety': { w:'chain of cus&middot;to&middot;dy', pos:'n.', old:'A paper log and a padlock.', re:'Every item tracked, secured, and accounted for, from intake to court.' },
  'athletics': { w:'equip&middot;ment room', pos:'n.', old:'Where gear piles up between seasons.', re:'Every piece of equipment stored, sorted, and ready for game day.' },
  'material-handling-warehouse': { w:'pick path', pos:'n.', old:'The long way around.', re:'The shortest walk between your team and the next order.' },
  'pharmaceutical-healthcare': { w:'sup&middot;ply room', pos:'n.', old:'Wherever there was an empty closet.', re:'Clean, organized supplies, ready the moment care teams need them.' },
  'automotive': { w:'parts room', pos:'n.', old:'Where the part should be. Somewhere.', re:'Every part exactly where your system says it is.' },
  'libraries': { w:'stacks', pos:'n.', old:'Rows of shelving that take up the whole floor.', re:'Your full collection, with room left for readers.' },
  'corporate-legal': { w:'file room', pos:'n.', old:'Boxes, binders, and a lot of guesswork.', re:'Every file in order and easy to find.' },
  'education': { w:'store&middot;room', pos:'n.', old:"Wherever last year's materials ended up.", re:'Every textbook, lab kit, and instrument with a place of its own.' },
  'military': { w:'ar&middot;mo&middot;ry', pos:'n.', old:'A locked room and a clipboard.', re:'Every weapon secured, tracked, and ready to issue.' },
  'retail': { w:'stock&middot;room', pos:'n.', old:'The room behind the door marked Employees Only.', re:'More inventory in less space, so the sales floor can grow.' },
  'vertical-farming': { w:'grow room', pos:'n.', old:'One aisle for every row.', re:'More growing space, with one shared aisle.' },
  'general-contractors': { w:'sub&middot;mit&middot;tal', pos:'n.', old:'A binder that shows up late.', re:'Drawings, product data, finishes, and lead times in one complete package.' },
  'architects-designers': { w:'spec&middot;i&middot;fi&middot;ca&middot;tion', pos:'n.', old:'A product number copied from the last project.', re:'Storage specified for how the space will actually be used.' },
};
const SR = (e, dark, extra) => e ? `<div class="sr${dark?' dark':''}${extra?' '+extra:''}"><span class="sr-w">${e.w}</span> <i class="sr-pos">(${e.pos})</i><span class="sr-old">${e.old}</span><span class="sr-new"><b class="sr-lab">Redefined:</b> ${e.re}</span></div>` : '';
// process steps and the contact call: the word is the title and the existing description reads as the definition
const SRT = (w, pos) => `${w} <i class="sr-pos">(${pos})</i>`;

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
.mega.sol{grid-template-columns:repeat(4,196px);gap:6px 22px;align-items:start}
.mega .mcol{display:flex;flex-direction:column;gap:1px}
.mega .gh{font-size:.68rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--teal);padding:10px 10px 5px;border-bottom:1px solid var(--line);margin-bottom:5px}
.mega .gh:not(:first-child){margin-top:14px}
.mega a.pl{padding:6px 10px;border-radius:8px;font-size:.85rem;font-weight:600;color:var(--ink);line-height:1.3}
.mega a.pl:hover{background:var(--mist);color:var(--teal)}
.mega.ind{grid-template-columns:repeat(3,248px);gap:6px 18px}
.mega.proj{grid-template-columns:repeat(2,248px);gap:6px 18px}
.mega a{display:block;padding:12px 14px;border-radius:10px}
.mega a:hover{background:var(--mist)}
.mega .t{font-weight:700;font-size:.9rem;color:var(--ink);line-height:1.35;display:block}
.mega a:hover .t{color:var(--teal)}
.mega .d{font-size:.78rem;color:var(--muted);margin-top:4px;line-height:1.5;display:block}
.mega .all{grid-column:1/-1;text-align:center;border-top:1px solid var(--line);margin-top:6px;padding-top:12px;font-weight:700;color:var(--teal);font-size:.85rem}
.head-cta{display:flex;align-items:center;gap:14px}
.head-phone{font-weight:800;color:var(--teal-ink);font-size:.92rem;white-space:nowrap}
.head-cta .btn{padding:.65rem 1.2rem;font-size:.84rem;white-space:nowrap}
.burger{display:none;flex-direction:column;justify-content:center;gap:5px;width:44px;height:44px;padding:10px;background:none;border:1px solid var(--line);border-radius:10px;cursor:pointer}
.burger span{display:block;height:2px;background:var(--teal-ink);border-radius:2px;transition:transform .2s ease,opacity .2s ease}
.burger[aria-expanded="true"] span:nth-child(1){transform:translateY(7px) rotate(45deg)}
.burger[aria-expanded="true"] span:nth-child(2){opacity:0}
.burger[aria-expanded="true"] span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}
.mnav{display:none;background:#fff;border-bottom:1px solid var(--line);box-shadow:0 14px 30px rgba(2,60,63,.12)}
.mnav.open{display:block}
.mnav .wrap{padding-top:10px;padding-bottom:22px}
.mnav a{display:block;padding:11px 4px;font-weight:600;color:var(--ink);border-bottom:1px solid var(--mist);font-size:.98rem}
.mnav a.sub{padding-left:22px;font-weight:500;font-size:.9rem;color:var(--muted)}
.mnav a:active,.mnav a:hover{color:var(--teal)}
.mnav .mnav-cta{margin-top:16px;display:flex;gap:12px;align-items:center}
nav.menu a.top.nav-3d{margin:20px 0 20px 8px;padding:6px 12px;border:2px solid var(--teal);border-radius:999px;color:var(--teal);font-weight:700;line-height:1.4;transition:background .15s,color .15s}
nav.menu>div:hover a.top.nav-3d,nav.menu a.top.nav-3d:focus-visible{background:var(--teal);color:#fff}
.nav-3d .new,.mnav-3d .new{display:inline-block;margin-left:6px;padding:1px 7px;border-radius:999px;background:var(--gold,#e8a33d);color:var(--teal-ink);font-size:.62rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;vertical-align:2px}
.mnav a.mnav-3d{display:flex;align-items:center;justify-content:center;margin:6px 0 10px;padding:12px;border:2px solid var(--teal);border-radius:12px;color:var(--teal);font-weight:700}

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
/* Storage Redefined entries */
.sr{max-width:60ch;margin:0 0 1.1rem;line-height:1.4}
.sr-w{font-weight:800;font-size:1.3rem;color:var(--teal-ink)}
.sr-pos{font-style:italic;font-weight:400;font-size:.92rem;color:var(--muted)}
.sr-old{display:block;margin-top:3px;font-size:.92rem;color:#8a9798;text-decoration:line-through}
.sr-new{display:block;font-size:.97rem;color:var(--ink)}
.sr-lab{color:var(--teal);font-weight:700}
.sr.dark .sr-w{color:#fff}.sr.dark .sr-pos{color:#d3e4e4}.sr.dark .sr-old{color:#aebfbf}.sr.dark .sr-new{color:#f1f7f7}.sr.dark .sr-lab{color:var(--teal-soft)}
.page-hero .sr{margin:1rem 0 0}.hero .sr{margin:1.1rem 0 0;max-width:52ch}.page-hero .sr+p{margin-top:.9rem}.hero .sr+p{margin-top:.9rem}
.sr.big{max-width:none;margin:0 0 .8rem}.sr.big .sr-w{font-size:clamp(1.7rem,3.2vw,2.4rem);line-height:1.1}.sr.big .sr-old{font-size:1rem}.sr.big .sr-new{font-size:1.05rem;max-width:60ch}
.card .sr{margin:.55rem 0 0;font-size:.9rem}.card .sr-w{font-size:1rem}.card .sr-old{font-size:.82rem}.card .sr-new{font-size:.84rem;color:var(--muted)}
.sr-t{font-size:inherit}.step h3 .sr-pos{font-weight:400}
.cta .sr-cta{display:block;margin:0 auto .5rem;color:#e2f0f0;font-size:1rem}.cta .sr-cta .sr-w{color:#fff;font-size:1.2rem}.cta .sr-cta .sr-pos{color:#cfe9ea}
.stats .grid.three{grid-template-columns:repeat(3,1fr)}
@media (max-width:900px){.stats .grid.three{grid-template-columns:1fr 1fr}}
@media (max-width:600px){.stats .grid.three{grid-template-columns:1fr}}
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
.stats b{display:block;font-size:2.1rem;color:var(--teal);font-variant-numeric:tabular-nums}
.stats b.loc{font-size:1.45rem;line-height:2.52rem;white-space:nowrap}
.stats span{font-size:.85rem;color:var(--muted)}
.certbar{margin:44px auto 0;max-width:1200px;padding:0 24px;display:flex;justify-content:center}
.sb-badge{position:relative;overflow:hidden;display:inline-flex;align-items:center;gap:18px;text-align:left;background:linear-gradient(135deg,#fefcf6 0%,#f7f0df 100%);border:1px solid #d9b25f;box-shadow:inset 0 0 0 3px #fff,0 6px 18px rgba(2,60,63,.10);border-radius:14px;padding:16px 30px 16px 22px}
.sb-badge .keystone{width:54px;height:54px;flex:none;filter:drop-shadow(0 2px 3px rgba(2,60,63,.25))}
.sb-text{display:flex;flex-direction:column;gap:2px}
.sb-eyebrow{font-size:.68rem;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#a97e2f}
.sb-text b{font-size:1.05rem;color:var(--teal-ink);line-height:1.25}
.sb-sub{font-size:.76rem;color:var(--muted)}
.sb-badge::after{content:"";position:absolute;top:0;bottom:0;left:-80%;width:50%;background:linear-gradient(105deg,transparent,rgba(255,255,255,.75),transparent);transform:skewX(-18deg)}
.sb-badge:hover::after{animation:sheen 1.1s ease}
@keyframes sheen{to{left:130%}}

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
/* before/after slider (shown only with JS; no-JS keeps the two panels) */
.ba{display:none;margin:44px auto 0;max-width:860px}
html.js .ba{display:block}
html.js .compare .duo{display:none}
.ba-frame{position:relative;border:1px solid rgba(255,255,255,.18);border-radius:var(--radius);overflow:hidden;background:rgba(255,255,255,.06);touch-action:none;box-shadow:0 18px 44px rgba(0,0,0,.28)}
.ba-frame svg{display:block;width:100%;height:auto}
.ba-top{position:absolute;inset:0;clip-path:inset(0 0 0 50%)}
.ba-handle{position:absolute;top:0;bottom:0;left:50%;width:0;z-index:3;pointer-events:none}
.ba-handle::before{content:"";position:absolute;top:0;bottom:0;left:-1.5px;width:3px;background:#fff;box-shadow:0 0 10px rgba(0,0,0,.45)}
.ba-handle span{position:absolute;top:50%;left:0;transform:translate(-50%,-50%);width:46px;height:46px;border-radius:50%;background:#fff;color:var(--teal-ink);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1.05rem;letter-spacing:-1px;box-shadow:0 6px 18px rgba(0,0,0,.4),0 0 0 4px rgba(255,255,255,.25);padding-bottom:2px}
.ba-frame:hover .ba-handle span{background:var(--teal-soft)}
.ba-range{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:ew-resize;z-index:4;margin:0}
.ba-lbl{position:absolute;top:12px;z-index:2;font-size:.72rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;background:rgba(2,41,43,.82);color:#fff;padding:6px 12px;border-radius:999px;pointer-events:none}
.ba-lbl.l{left:12px}
.ba-lbl.r{right:12px;background:var(--gold,#e8a33d);color:var(--teal-ink)}
.ba p{font-size:.88rem;color:#bcd8d9;margin-top:14px;text-align:center}
.ba p b{color:#fff}

/* industry showcase */
.showcase{display:grid;grid-template-columns:290px 1fr;gap:28px;margin-top:38px}
.sc-list{display:flex;flex-direction:column;align-self:start}
.sc-item{padding:9px 16px;border-left:3px solid var(--line);font-weight:600;font-size:.92rem;color:var(--ink);transition:border-color .12s ease,background .12s ease,color .12s ease}
.sc-item:hover,.sc-item.on{border-color:var(--teal);color:var(--teal);background:var(--mist)}
.sc-stage{position:relative;display:block;border-radius:var(--radius);overflow:hidden;min-height:520px;background:var(--teal-ink)}
.sc-img{position:absolute;inset:0;background-size:cover;background-position:center;transition:opacity .5s ease}
.sc-img.hide{opacity:0}
.sc-cap{position:absolute;left:0;right:0;bottom:0;z-index:2;padding:80px 28px 26px;background:linear-gradient(transparent,rgba(2,41,43,.88));color:#fff}
.sc-cap .k{font-size:.72rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--teal-soft)}
.sc-cap .t{font-size:1.25rem;font-weight:800;margin-top:6px;max-width:44ch}
.sc-cap .go{display:inline-block;margin-top:10px;font-weight:700;font-size:.88rem;color:#fff}
.badge{display:inline-block;background:var(--teal-soft);color:var(--teal-ink);font-size:.72rem;font-weight:800;padding:3px 10px;border-radius:999px;letter-spacing:.06em;text-transform:uppercase;margin-left:8px}

.projects-bg{background:var(--mist)}


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
.cta .cert .keystone-sm{width:13px;height:13px;vertical-align:-2px;margin-right:7px}

/* motion (guarded: no-JS and reduced-motion users see everything instantly) */
header.scrolled{box-shadow:0 6px 22px rgba(2,60,63,.14)}
@media (prefers-reduced-motion: no-preference){
  .hero::before{animation:heroZoom 16s ease-out both}
  @keyframes heroZoom{from{transform:scale(1.07)}to{transform:scale(1)}}
  html.js .rv{opacity:0;transform:translateY(16px);transition:opacity .55s ease,transform .55s ease}
  html.js .rv.in{opacity:1;transform:none}
}

footer{background:#02292b;color:#9fbcbd;font-size:.87rem}
footer .cols{display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr;gap:36px;padding:56px 0 40px}
footer h4{color:#fff;font-size:.95rem;margin-bottom:14px}
footer a{display:block;color:#9fbcbd;padding:3px 0}
footer a:hover{color:var(--teal-soft)}
footer .social{display:flex;gap:10px;margin-top:12px}
footer .social a{display:grid;place-items:center;width:38px;height:38px;padding:0;border-radius:50%;background:rgba(255,255,255,.1);color:#fff}
footer .social a:hover{background:var(--teal)}
footer .social svg{width:20px;height:20px;fill:currentColor}
footer .legal{border-top:1px solid rgba(255,255,255,.12);padding:18px 0;display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px}
footer .legal a{display:inline;padding:0 10px}
.float-cta{position:fixed;right:22px;bottom:22px;z-index:60;background:var(--teal);color:#fff;border-radius:999px;padding:.9rem 1.5rem;font-weight:700;box-shadow:0 10px 26px rgba(2,60,63,.4);font-size:.9rem}
.float-cta:hover{background:var(--teal-dark)}

@media (max-width:1060px){ .head-phone{display:none} }
@media (max-width:960px){
  nav.menu{display:none}
  .burger{display:flex}
  .head-cta .btn{display:none}
  .apps .grid{grid-template-columns:repeat(4,1fr)}
  .apps a:nth-child(4n+1){border-left:0}
  .stats .grid,.compare .duo,.cards,.steps,.feat,.gallery,.post-grid,.dl-grid,.contact-cards,.team{grid-template-columns:1fr 1fr}
  .twocol,.svc-cta,.form .row{grid-template-columns:1fr}
  footer .cols{grid-template-columns:1fr 1fr}
  .showcase{grid-template-columns:1fr}
  .sc-list{flex-direction:row;flex-wrap:wrap;gap:8px}
  .sc-item{border-left:0;border:1px solid var(--line);border-radius:999px;padding:7px 14px;font-size:.84rem}
  .sc-item:hover,.sc-item.on{border-color:var(--teal)}
  .sc-stage{min-height:340px}
}
@media (max-width:600px){
  .apps .grid{grid-template-columns:repeat(2,1fr)}
  .stats .grid,.compare .duo,.cards,.steps,.feat,.gallery,.post-grid,.dl-grid,.contact-cards,.team{grid-template-columns:1fr}
}
`;

/* ---------------- site data ---------------- */
const SOLUTIONS = [
  { slug:'high-density-mobile-storage', name:'High-Density Mobile Storage', short:'Shelving on carriages that share one moving aisle, for up to twice the storage in the same space', img:IMGS.hdLibrary, banner:IMGS.banMobile },
  { slug:'lifts-carousels', name:'Vertical Lift Modules & Carousels', short:'Automated storage that brings the right tray or bin to your team', img:IMGS.liftsCard, banner:IMGS.banLifts },
  { slug:'lockers', name:'Lockers', short:'Smart, evidence, athletic, and personal lockers', img:IMGS.lockersCard, banner:IMGS.banLockers },
  { slug:'static-shelving', name:'Static Shelving', short:'4-post and case-style shelving, pallet rack, cantilever, and industrial steel shelving', img:IMGS.shelvCard, banner:IMGS.banShelving },
  { slug:'cabinets', name:'Cabinets', short:'Lateral, rotary, and museum-grade cabinet storage', img:IMGS.cabMuseum, banner:IMGS.banCabinets },
  { slug:'modular-casework', name:'Modular Casework', short:'Reconfigurable laminate and steel casework and lab furniture', img:IMGS.cwLam, banner:IMGS.banCasework },
];

/* specific product pages, grouped under the six families above */
const PRODUCTS = [
  { slug:'four-post-shelving', name:'4-Post Shelving', short:'Versatile, adjustable steel shelving that can often be converted to high-density mobile storage later', img:IMGS.p4post, banner:IMGS.banShelving, group:'Shelving' },
  { slug:'wire-shelving', name:'Wire Shelving', short:'Open wire shelving and carts for healthcare, food service, labs, and more', img:IMGS.wireRack, banner:IMGS.banShelving, group:'Shelving' },
  { slug:'cantilever-shelving', name:'Library & Cantilever Shelving', short:'Cantilever library shelving for books and media, plus cantilever rack for long items like lumber and pipe', img:IMGS.lancaster3, banner:IMGS.banShelving, group:'Shelving' },
  { slug:'bin-storage', name:'Bin & Parts Storage', short:'Bin shelving, totes, and modular drawers that keep small parts organized and easy to find', img:IMGS.evidence, banner:IMGS.banShelving, group:'Shelving' },
  { slug:'pallet-rack', name:'Pallet Rack', short:'Selective, drive-in, push-back, cantilever, and specialty rack, designed around your forklifts, loads, and building', img:IMGS.mhwCard, banner:IMGS.banWarehouse, group:'Industrial & Warehouse' },
  { slug:'mezzanines', name:'Mezzanines & Platforms', short:'Structural steel platforms that add a second working level inside your existing building', img:IMGS.shelvCard, banner:IMGS.banWarehouse, group:'Industrial & Warehouse' },
  { slug:'wire-partitions', name:'Wire Partitions & Cages', short:'Tool cribs, controlled-substance cages, and secure see-through enclosures inside your building', img:IMGS.wcCage, banner:IMGS.banWarehouse, group:'Industrial & Warehouse' },
  { slug:'evidence-lockers', name:'Evidence Lockers', short:'Pass-through evidence lockers and refrigerated compartments that support chain of custody', img:IMGS.lockerEvidence, banner:IMGS.banLockers, group:'Lockers & Security' },
  { slug:'weapons-storage', name:'Weapons & Gun Storage', short:'Armory racks and cabinets for law enforcement and the military', img:IMGS.weapons1, banner:IMGS.banLockers, group:'Lockers & Security' },
  { slug:'athletic-storage', name:'Athletic Equipment Storage', short:'Team gear rooms on high-density mobile storage, with helmets, pads, and sticks in up to half the space', img:IMGS.montelWisconsin, banner:IMGS.montelFAU, group:'Lockers & Security' },
  { slug:'rotary-cabinets', name:'Rotary Cabinets', short:'Two cabinets in one footprint: turn the core to lock it flush after hours', img:IMGS.cabRotary, banner:IMGS.banCabinets, group:'Cabinets & Filing' },
  { slug:'fire-rated-cabinets', name:'Fire-Rated & Safety Cabinets', short:'Fire-rated record protection and safety cabinets for hazardous materials', img:IMGS.lateralTh, banner:IMGS.banCabinets, group:'Cabinets & Filing' },
  { slug:'wardrobe-cabinets', name:'Wardrobe & Uniform Cabinets', short:'Garment, uniform, and gear cabinets for staff and crew spaces', img:IMGS.tennscoWardrobe, banner:IMGS.banCabinets, group:'Cabinets & Filing' },
  { slug:'museum-cabinets', name:'Museum Cabinets', short:'Conservation-grade cabinets with gasketed doors for collections and specimens', img:IMGS.museumCabs, banner:IMGS.banMuseum, group:'Museum & Archival' },
  { slug:'art-screens', name:'Art Screens & Racks', short:'Pull-out, lateral, and wall-mounted art storage racks for framed works and hanging textiles', img:IMGS.hdmsArtScreen, banner:IMGS.banMuseum, group:'Museum & Archival' },
  { slug:'mail-sorters', name:'Mail Sorters & Mailroom', short:'Sort modules and mailroom casework matched to your daily volume', img:IMGS.hamMailroom, banner:IMGS.banCasework, group:'Casework & Mailroom' },
];

/* menu / hub grouping: category hubs first, then their product pages */
const SOL_GROUPS = [
  { name:'Mobile & Automated', items:[SOLUTIONS[0], SOLUTIONS[1]] },
  { name:'Shelving', items:[SOLUTIONS[3], ...PRODUCTS.filter(p=>p.group==='Shelving')] },
  { name:'Industrial & Warehouse', items:PRODUCTS.filter(p=>p.group==='Industrial & Warehouse') },
  { name:'Lockers & Security', items:[SOLUTIONS[2], ...PRODUCTS.filter(p=>p.group==='Lockers & Security')] },
  { name:'Cabinets & Filing', items:[SOLUTIONS[4], ...PRODUCTS.filter(p=>p.group==='Cabinets & Filing')] },
  { name:'Museum & Archival', items:PRODUCTS.filter(p=>p.group==='Museum & Archival') },
  { name:'Casework & Mailroom', items:[SOLUTIONS[5], ...PRODUCTS.filter(p=>p.group==='Casework & Mailroom')] },
];

const INDUSTRIES = [
  { slug:'museums', name:'Museums', short:'Collections storage, art racks, and conservation cabinets', img:IMGS.musApp, banner:IMGS.banMuseum },
  { slug:'libraries', name:'Libraries', short:'Library shelving and high-density mobile storage that free up space for readers', img:IMGS.libraryCard, banner:IMGS.libHD },
  { slug:'education', name:'Education', short:'Classroom, library, athletics, and supply storage', img:IMGS.eduCabs, banner:IMGS.banEducation },
  { slug:'athletics', name:'Athletics', short:'Team rooms, equipment rooms, and gear storage', img:IMGS.summitLockers, banner:IMGS.summitLockers },
  { slug:'government-public-safety', name:'Government & Public Safety', short:'Evidence, records, and gear storage', img:IMGS.gpsCard, banner:IMGS.gpsCard },
  { slug:'military', name:'Military', short:'Gear, armory, and base operations storage', img:IMGS.weapons1, banner:IMGS.weapons2 },
  { slug:'pharmaceutical-healthcare', name:'Healthcare & Pharmaceutical', short:'Supply, sterile core, pharmacy, and lab storage', img:IMGS.wireRack, banner:IMGS.banPharma },
  { slug:'corporate-legal', name:'Corporate & Legal', short:'Records, files, and workplace storage', img:IMGS.corpCard, banner:IMGS.banCorporate },
  { slug:'retail', name:'Retail', short:'Back-of-house and stockroom storage', img:IMGS.retailCard, banner:IMGS.banRetail },
  { slug:'automotive', name:'Automotive', short:'Parts, tire, and dealership storage', img:IMGS.autoCard, banner:IMGS.banAuto },
  { slug:'material-handling-warehouse', name:'Material Handling & Warehouse', short:'Pallet rack, mezzanines, and automated storage', img:IMGS.mhwCard, banner:IMGS.banWarehouse },
  { slug:'vertical-farming', name:'Vertical Farming', short:'Mobile grow systems and grow racks', img:IMGS.vfCard, banner:IMGS.banVF },
];

/* GCs and architects get their own section, outside Industries (Jess, #278-279) */
const TEAM = [
  { slug:'general-contractors', name:'General Contractors', short:'Division 10 storage scope, submittals through punch list', img:IMGS.installer, banner:IMGS.gcProject },
  { slug:'architects-designers', name:'Architects & Designers', short:'Storage planning, spec language, CAD and Revit support', img:IMGS.gcNewSpace, banner:IMGS.gcProject },
];

/* ---------------- partials ---------------- */
const megaGroup = (g) => `<span class="gh">${g.name}</span>\n            ` +
  g.items.map(s=>`<a class="pl" href="${s.slug}.html">${s.name}</a>`).join('\n            ');
const megaCol = (...groups) => `<div class="mcol">\n            ${groups.map(megaGroup).join('\n            ')}\n          </div>`;
const navMegaSol =
  megaCol(SOL_GROUPS[0], SOL_GROUPS[5]) + '\n          ' +
  megaCol(SOL_GROUPS[1]) + '\n          ' +
  megaCol(SOL_GROUPS[2], SOL_GROUPS[3]) + '\n          ' +
  megaCol(SOL_GROUPS[4], SOL_GROUPS[6]) +
  `\n          <a class="all" href="solutions.html">All solutions &rarr;</a>`
  + `\n          <a class="all" href="showroom.html">Explore in 3D &rarr;</a>`;

const navMegaInd = INDUSTRIES.map(i =>
  `<a href="${i.slug}.html"><span class="t">${i.name}</span><span class="d">${i.short}</span></a>`).join('\n          ')
  + `\n          <a class="all" href="industries.html">All industries &rarr;</a>`;

const HEADER = `
<div class="ribbon">Design concept. Internal mockup, not the live O'Brien Systems website</div>
<div class="announce">Free on-site space assessment. <a href="contact.html">Schedule yours</a> or call <a href="tel:6108253405">610.825.3405</a> <span class="sep">&middot;</span> <a href="service.html">Request service</a> <span class="sep">&middot;</span> <a href="showroom.html">3D showroom</a></div>
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
      <div><a class="top" href="services.html">Services</a></div>
      <div>
        <a class="top" href="general-contractors.html">GCs &amp; Architects &#9662;</a>
        <div class="mega proj">
          ${TEAM.map(i=>`<a href="${i.slug}.html"><span class="t">${i.name}</span><span class="d">${i.short}</span></a>`).join('\n          ')}
        </div>
      </div>
      <div><a class="top" href="resources.html">Resources</a></div>
      <div><a class="top" href="blog.html">Blog</a></div>
      <div><a class="top" href="about.html">About</a></div>
      <div><a class="top" href="where-we-work.html">Where We Work</a></div>
      <div><a class="top nav-3d" href="showroom.html">3D Showroom <span class="new">New</span></a></div>
    </nav>
    <div class="head-cta">
      <span class="head-phone">610.825.3405</span>
      <a class="btn btn-solid" href="contact.html">Free Assessment</a>
      <button class="burger" aria-label="Open menu" aria-expanded="false" aria-controls="mnav"><span></span><span></span><span></span></button>
    </div>
  </div>
  <nav class="mnav" id="mnav" aria-label="Mobile">
    <div class="wrap">
      <a class="mnav-3d" href="showroom.html">3D Showroom <span class="new">New</span></a>
      <a href="solutions.html">Solutions</a>
      ${SOLUTIONS.map(s=>`<a class="sub" href="${s.slug}.html">${s.name}</a>`).join('\n      ')}
      <a href="industries.html">Industries</a>
      <a href="services.html">Services</a>
      <a href="general-contractors.html">General Contractors</a>
      <a href="architects-designers.html">Architects &amp; Designers</a>
      <a href="service.html">Request Service</a>
      <a href="resources.html">Resources</a>
      <a href="blog.html">Blog</a>
      <a href="about.html">About</a>
      <a href="where-we-work.html">Where We Work</a>
      <div class="mnav-cta"><a class="btn btn-solid" href="contact.html">Free Assessment</a><a class="head-phone" href="tel:6108253405">610.825.3405</a></div>
    </div>
  </nav>
</header>`;

const CTA = `
<div class="cta" id="contact">
  <div class="wrap">
    <span class="sr-cta"><span class="sr-w">as&middot;sess&middot;ment</span> <i class="sr-pos">(n.)</i> Free, on site, no obligation.</span>
    <h2>See how much space you're sitting on</h2>
    <p>Schedule a free on-site assessment. We'll measure, plan, and show you the options. No obligation, no generic quotes.</p>
    <a class="btn btn-white" href="contact.html">Schedule My Free Assessment</a>
    <span class="phone-big">610.825.3405</span>
    <p style="margin-top:.4rem">739 E. Elm Street, Conshohocken, PA 19428</p>
    <p class="cert"><svg class="keystone-sm" viewBox="0 0 100 100" aria-hidden="true"><path d="M35 4 H65 V19 H96 L83 96 H60 V80 H40 V96 H17 L4 19 H35 Z" fill="#e8a33d"/></svg>${SB_CERT}</p>
  </div>
</div>`;

const FOOTER = `
<footer>
  <div class="wrap">
    <div class="cols">
      <div>
        <h4>O'Brien Systems</h4>
        <p>Custom storage solutions since 1979: headquartered in Conshohocken, PA, installing across Pennsylvania, New Jersey, Delaware, Maryland, Washington DC, New York, and New England, and traveling with our customers when their projects do.</p>
        <p style="margin-top:10px;font-size:.8rem">PA Small Business (SB) Certified</p>
        <h4 style="margin-top:18px">Where We Work</h4>
        ${W.footerLinks()}<a href="where-we-work.html">All regions &rarr;</a>
        <p style="margin-top:12px"><a href="tel:6108253405">610.825.3405</a><a href="mailto:sales@obriensys.com">sales@obriensys.com</a></p>
        <div class="social">
          <a href="https://www.facebook.com/OBrienSystems/" target="_blank" rel="noopener" aria-label="O'Brien Systems on Facebook"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z"/></svg></a>
          <a href="https://www.linkedin.com/company/o-brien-systems" target="_blank" rel="noopener" aria-label="O'Brien Systems on LinkedIn"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z"/></svg></a>
        </div>
      </div>
      <div>
        <h4>Solutions</h4>
        ${SOLUTIONS.map(s=>`<a href="${s.slug}.html">${s.name}</a>`).join('')}<a href="solutions.html">All solutions &rarr;</a>
      </div>
      <div>
        <h4>Industries</h4>
        ${INDUSTRIES.map(i=>`<a href="${i.slug}.html">${i.name}</a>`).join('')}
        <h4 style="margin-top:18px">For GCs &amp; Architects</h4>
        ${TEAM.map(i=>`<a href="${i.slug}.html">${i.name}</a>`).join('')}
      </div>
      <div>
        <h4>Company</h4>
        <a href="about.html">About Us</a><a href="where-we-work.html">Where We Work</a><a href="services.html">Services</a><a href="showroom.html">3D Showroom</a><a href="service.html">Request Service</a><a href="resources.html">Resources &amp; Brochures</a><a href="guides/">Industry Guides</a><a href="blog.html">Blog</a><a href="contact.html">Contact</a>
      </div>
    </div>
    <div class="legal">
      <span>&copy; 2026 O'Brien Systems.</span>
      <span><a href="#">Privacy Policy</a> | <a href="#">Accessibility Statement</a> | <a href="sitemap.xml">Sitemap</a> | <a href="storage-questions.html">Storage questions</a></span>
    </div>
  </div>
</footer>
`;

const shell = (title, heroImgUrl, body) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<title>${title}</title>
<link rel="stylesheet" href="assets/style.css?v=${VER}">
<script src="assets/site.js?v=${VER}" defer></script>
<script src="assets/chat-config.js?v=${VER}"></script>
<script type="module" src="${CHAT_API}/_chat/embed.js"></script>
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
    ${SR(SRDATA[p.slug], true)}
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
    ${p.slug ? X.specPanel(p.slug, p.name, BROCHURES) : ''}
    ${gal?`<div class="gallery">\n      ${gal}\n    </div>`:''}
    ${faqs?`<div class="faq">\n      <h2>Frequently asked questions</h2>\n      ${faqs}\n    </div>`:''}
    ${chips?`<h2 style="margin-top:52px;font-size:1.25rem">${p.chipsTitle}</h2>\n    <div class="chips">\n      ${chips}\n    </div>`:''}
  </div>
</section>${p.slug ? X.viewer3d(p.slug, p.name) : ''}`);
}

/* ---------------- page content ---------------- */
const relInd = (...slugs) => INDUSTRIES.filter(i=>slugs.includes(i.slug));
const relSol = (...slugs) => SOLUTIONS.filter(s=>slugs.includes(s.slug));
const relAny = (...slugs) => [...SOLUTIONS, ...PRODUCTS, ...INDUSTRIES, ...TEAM].filter(x=>slugs.includes(x.slug));

const SOLUTION_PAGES = {
  'high-density-mobile-storage': {
    eyebrow:'Solutions', h1:'High-Density Mobile Storage',
    lead:'High-density mobile storage puts your shelving on carriages that glide along floor rails. Rows close together and open an aisle only where you need it, so the same floor holds up to twice the storage, or the same storage fits in half the space.',
    sideImg: IMGS.hdArchive,
    paras:[
      `With fixed shelving, every row needs its own aisle. High-density mobile storage (also called compact shelving or mobile shelving) mounts your shelving on carriages that ride on floor rails, so rows close together and share a single moving aisle.`,
      `We design, supply, and install mechanical-assist, powered, and manual systems from several leading manufacturers. The right drive depends on load, how often the space is used, and who uses it. Where the application calls for them, powered systems add safety sweeps and access control.`,
      `Many 4-post shelving systems can be mounted on carriages, so you can often reuse the shelving you already own. During a free site assessment, we review rail layout and floor levelness. We also provide complete equipment loading data for your structural engineer, and our own factory-trained crews handle installation throughout the Philadelphia region and beyond.`,
    ],
    features:[
      ['Mechanical-assist', 'Ergonomic handle drive for daily-access rooms of any size'],
      ['Powered electrical', 'Push-button aisles with safety sweeps for large or secure rooms'],
      ['Manual and low-profile', 'Simple, economical systems for smaller rooms and closets'],
      ['Reuse your shelving', 'Existing 4-post shelving can often be mounted on new carriages'],
    ],
    gallery:[IMGS.hdNemoursAisle, IMGS.hdNemoursWide, IMGS.hdGearRoom],
    faqs:[
      ['Can my existing shelving be converted to mobile?', 'Often, yes. Many 4-post shelving systems can be mounted on new carriages, which lets you buy shelving now and convert it to high-density mobile storage when space runs out. Compatibility depends on the shelving line and condition, which we confirm during an assessment.'],
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
      `A vertical lift module (VLM) stores trays inside an enclosed tower and delivers them to an ergonomic access opening on demand. Instead of walking aisles and climbing ladders, your team enters a part number, and the system brings the right tray to them.`,
      `A horizontal carousel rotates bins around an oval track and brings the right bin to the operator at a comfortable working height. Horizontal carousels suit high-volume order picking and rooms with lower ceilings, while VLMs make the most of tall ceilings and mixed item sizes.`,
      `We handle the full project throughout the Philadelphia region and beyond: throughput analysis, tray layout, controls and software integration, delivery, installation, and commissioning. We offer standard lifts, slim units for tight footprints, and models that handle pallets.`,
      `VLMs and horizontal carousels are a strong fit wherever parts inventory has outgrown its space, including maintenance cribs, electronics, pharmacy, and lab storage, and any operation where picking time and floor space both matter.`,
    ],
    features:[
      ['Goods to person', 'Trays delivered to an ergonomic opening, no ladders or aisle walking'],
      ['Small footprint', 'A tower reaches heights standard shelving can\'t, turning unused ceiling space into storage'],
      ['Inventory control', 'Software tracks every tray, item, and operator'],
      ['Full-service install', 'Site prep, power, commissioning, and operator training'],
    ],
    gallery:[IMGS.lifts2, IMGS.liftSide, IMGS.modulaLift],
    chipsTitle:'Where VLMs and carousels deliver the most value',
    related: relInd('material-handling-warehouse','automotive','pharmaceutical-healthcare','retail'),
  },
  'lockers': {
    eyebrow:'Solutions', h1:'Lockers',
    lead:'Lockers for every use, from smart lockers for hybrid workplaces and pass-through evidence lockers to athletic lockers and personal lockers built to stand up to daily use.',
    sideImg: IMGS.agile1,
    paras:[
      `Today's lockers are more than a row of steel doors. Smart locker systems assign, unlock, and track compartments electronically, making it easy to manage day-use storage, package delivery, and shared equipment.`,
      `Pass-through evidence lockers support chain-of-custody procedures: an officer deposits evidence on one side, and only the evidence custodian can open the other. Ventilated athletic lockers let gear air out and stand up to the team room. Personal and gear lockers work everywhere from staff rooms to ready rooms.`,
      `Working with several manufacturers, we recommend the lockers that fit how you'll use them, not a single catalog. We handle the layout, coordinate power and network connections, and our own crews install lockers throughout the Philadelphia region and beyond.`,
    ],
    features:[
      ['Smart lockers', 'Electronic assignment, audit trails, and package delivery'],
      ['Evidence lockers', 'Pass-through design for chain-of-custody deposit and retrieval'],
      ['Athletic lockers', 'Ventilated gear storage built for the team room'],
      ['Personal and gear lockers', 'Staff rooms, ready rooms, and industrial locker rooms'],
    ],
    gallery:[IMGS.lockerEvidence, IMGS.agile2, IMGS.parcelLockers],
    chipsTitle:'Dig deeper into locker systems',
    related: relAny('evidence-lockers','weapons-storage','athletic-storage','wardrobe-cabinets','athletics','government-public-safety','education'),
  },
  'static-shelving': {
    eyebrow:'Solutions', h1:'Static Shelving',
    lead:'Static shelving keeps storage simple and affordable, with 4-post and case-style shelving, pallet rack, cantilever library shelving and rack, and industrial steel shelving to organize any space.',
    sideImg: IMGS.boxedge,
    paras:[
      `Static shelving stays in one place and organizes everything from files and archives to pallets and oversized items. It sits right on the floor with no rails or carriages, so it's one of the quickest and easiest storage upgrades for most facilities.`,
      `4-post and case-style shelving can be customized with dividers, drawers, and doors for files, records, and general storage. Pallet rack handles bulky, heavy loads. Cantilever library shelving is a popular choice for libraries, schools, and offices, while cantilever rack stores long items like lumber, pipe, and tubing. Industrial steel shelving is built for heavy-duty parts and supplies.`,
      `Most projects combine more than one type. Many 4-post systems can also be mounted on carriages later and converted to high-density mobile storage when you need more space, so we design with that upgrade in mind from the start.`,
    ],
    features:[
      ['4-post and case-style', 'Customizable with dividers, drawers, and doors'],
      ['Pallet rack', 'Engineered for large and heavy palletized loads'],
      ['Cantilever shelving & rack', 'Library shelving for books and collections, plus rack for long items like lumber and pipe'],
      ['Industrial shelving', 'A variety of heavy-duty shelves for bulky parts, equipment, and supplies'],
    ],
    gallery:[IMGS.palletRack, IMGS.palletRack2, IMGS.maximize],
    faqs:[
      ["What types of static shelving does O'Brien Systems offer?", 'We offer 4-post and case-style shelving for files, records, and general storage; pallet rack for exceptionally large and heavy palletized loads; cantilever shelving suited to education and corporate settings; and industrial metal shelving for parts and supplies. Most projects combine more than one type, and the right mix is determined during a free site assessment.'],
      ['How much weight can static shelving hold?', 'Capacity depends on the shelving type, shelf size, and configuration. Industrial metal shelving on this line holds up to 600 pounds per shelf, while pallet rack is engineered for much heavier palletized loads. We size shelf gauge, spans, and uprights to what you actually store and confirm loads during the site assessment.'],
      ['Can static shelving be reconfigured or moved later?', 'Yes. 4-post and case-style systems are designed to be disassembled and reassembled, so shelving can move with a department or be reconfigured as needs change. We perform teardown, relocation, and reinstallation as a service, including for shelving we did not originally supply.'],
      ['Can static shelving be converted to high-density mobile storage later?', 'Often, yes. Many 4-post shelving systems can be mounted on mobile carriages down the road, which lets you buy shelving now and convert it to high-density mobile storage when space runs out. Planning for that upgrade path at initial purchase keeps the option open.'],
      ['What determines the cost of a shelving project?', 'The main factors are shelving type and gauge, the number of sections, height and shelf count, accessories such as dividers and doors, and installation conditions. Because static shelving is modular, projects can be phased, starting with the highest-need areas and adding sections later.'],
    ],
    chipsTitle:'Dig deeper into shelving and racking',
    related: relAny('four-post-shelving','wire-shelving','cantilever-shelving','bin-storage','pallet-rack','mezzanines','wire-partitions'),
  },
  'cabinets': {
    eyebrow:'Solutions', h1:'Cabinets',
    lead:'From lateral and rotary file cabinets to museum-grade conservation cabinets, we offer secure, organized storage for the things that matter most.',
    sideImg: IMGS.museumCabs,
    paras:[
      `Cabinet storage covers a wide range of needs. Lateral and rotary file cabinets organize active records in offices and file rooms, while museum storage cabinets protect textiles, specimens, and works on paper with gasketed doors and collection-safe finishes.`,
      `Flat file cabinets store maps, drawings, and oversized documents. Drawer and door cabinets organize parts and supplies in industrial settings. Visual storage cabinets display collections behind glass while keeping them protected.`,
      `Cabinets also work well with our other systems. They can be mounted on carriages as part of high-density mobile storage, fit under mezzanines, or be combined with shelving in the same room. Working with several manufacturers, we design cabinet storage for every setting, and our own crews install it throughout the Philadelphia region and beyond.`,
    ],
    features:[
      ['Museum-grade', 'Collection-safe cabinets with gasketed doors'],
      ['Lateral and rotary files', 'Active records storage for offices'],
      ['Flat files', 'Storage for maps, drawings, and oversized documents'],
      ['Industrial cabinets', 'Drawer and door cabinets for parts and supplies'],
    ],
    gallery:[IMGS.flatFiles, IMGS.corpCabs, IMGS.cabMedia],
    chipsTitle:'Dig deeper into cabinet storage',
    related: relAny('rotary-cabinets','fire-rated-cabinets','wardrobe-cabinets','museum-cabinets','art-screens','corporate-legal','museums'),
  },
  'modular-casework': {
    eyebrow:'Solutions', h1:'Modular Casework',
    lead:'Laminate and steel casework and lab furniture that can be moved and reconfigured as your needs change, instead of torn out and rebuilt.',
    sideImg: IMGS.cw3,
    paras:[
      `Traditional millwork is built on site and stays where it's built. Modular casework is made in a factory, installs with less disruption, and can be unbolted to move or reconfigure when the way you use a room changes.`,
      `Laminate casework fits offices, classrooms, mailrooms, and breakrooms. Steel casework stands up to labs, clinics, and industrial spaces. Lab furniture adds chemical-resistant work surfaces and service chases for utilities where the work requires them.`,
      `Because it can be reconfigured, modular casework adapts as your space changes without tearing up the room. Working with several manufacturers, we handle design, specification, and delivery, and our own crews install modular casework throughout the Philadelphia region and beyond.`,
    ],
    features:[
      ['Laminate casework', 'Offices, classrooms, mailrooms, and workrooms'],
      ['Steel casework', 'Labs, clinics, and heavy-use environments'],
      ['Lab furniture', 'Chemical-resistant tops and benches ready for utilities'],
      ['Reconfigurable', 'Unbolts and moves instead of being torn out'],
    ],
    gallery:[IMGS.cw2, IMGS.cw1, IMGS.nemours5],
    chipsTitle:'Related systems',
    related: relAny('mail-sorters','pharmaceutical-healthcare','education','corporate-legal','government-public-safety'),
  },
};

const PRODUCT_PAGES = {
  'four-post-shelving': {
    eyebrow:'Solutions / Shelving', h1:'4-Post Shelving',
    lead:'The most versatile shelving made: four posts, adjustable steel shelves, and a catalog of dividers, drawers, doors, and bins that adapts to almost anything you store.',
    sideImg: IMGS.boxedge,
    paras:[
      `4-post shelving is the backbone of most storage rooms we design. Shelves adjust in small increments, and accessories let you add bin fronts, file storage, garment rods, or lockable doors. The same uprights can hold everything from archive boxes to parts totes.`,
      `Working with several manufacturers, we offer 4-post shelving in a range of widths, depths, and steel gauges, matched to what you're storing. Open, closed, and slotted styles cover office, industrial, and records storage.`,
      `The hidden advantage: many 4-post systems can be mounted on mobile carriages later. Buy the shelving that fits today, and when the room fills up, convert it to a mobile system instead of replacing it.`,
    ],
    features:[
      ['Adjustable everything', 'Shelves that adjust in small increments, plus dividers, bins, drawers, and doors'],
      ['Matched to the load', 'Widths, depths, and steel gauges chosen for what you\'re storing'],
      ['Mobile-ready', 'Many systems can be mounted on carriages later for up to twice the capacity'],
      ['Several manufacturers', 'The right shelving chosen for each project'],
    ],
    gallery:[IMGS.p4post, IMGS.boxedge2, IMGS.openShelv],
    chipsTitle:'Related systems',
    related: relAny('high-density-mobile-storage','static-shelving','bin-storage','wire-shelving'),
  },
  'wire-shelving': {
    eyebrow:'Solutions / Shelving', h1:'Wire Shelving',
    lead:'Open-wire shelving lets air circulate, light pass through, and dust fall instead of collect. It is the standard for healthcare, food service, and cleanroom storage for a reason.',
    sideImg: IMGS.wireBlack,
    paras:[
      `Wire shelving is a smart choice anywhere hygiene, visibility, or airflow matters, including pharmacies, sterile processing, kitchens, labs, and IT rooms. The open design helps facilities meet sanitation requirements and keeps contents visible from every angle.`,
      `We offer a full range of wire shelving: chrome, epoxy-coated for wet or corrosive environments, antimicrobial finishes for clinical spaces, and polymer shelving that can go through a cart washer. Add casters, and any unit becomes a transport cart.`,
      `Wire shelving can also become high-density mobile storage when it's mounted on carriages that glide along floor rails. It's a great way to store sterile supplies or pharmacy inventory in less floor space while keeping the airflow benefits.`,
    ],
    features:[
      ['Code-friendly', 'Open wire meets health-department and sterile-storage requirements'],
      ['Finish per environment', 'Chrome, epoxy, antimicrobial, and washable polymer'],
      ['Mobile options', 'Casters for carts, or carriages to make it higher-density'],
      ['Quick-adjust', 'Shelves reposition without tools as needs change'],
    ],
    chipsTitle:'Where wire shelving works hardest',
    related: relAny('pharmaceutical-healthcare','material-handling-warehouse','bin-storage','four-post-shelving'),
  },
  'cantilever-shelving': {
    eyebrow:'Solutions / Shelving', h1:'Library & Cantilever Shelving',
    lead:'Shelves that hang from a central column instead of sitting between posts, leaving the whole face open. The standard for libraries, and the answer for long or awkward loads.',
    sideImg: IMGS.libShelves,
    paras:[
      `Cantilever library shelving keeps books front and center, with no front posts in the way. Re-shelving is easy, and finished end panels and canopy tops give the stacks a furniture-quality look. Working with several manufacturers, we install library shelving in public, academic, and special libraries across the Philadelphia region.`,
      `The same idea works on a bigger scale. Cantilever rack stores pipe, lumber, trim, and anything else too long for pallet rack, on arms that adjust to fit the load.`,
      `Both cantilever library shelving and cantilever rack can also become high-density mobile storage when mounted on carriages that glide along floor rails. Libraries use it to free up floor space for a new children's area, study space, or programs without building an addition, and warehouses use it to fit more long-item storage into less space.`,
    ],
    features:[
      ['Open-face access', 'No front posts between the user and the collection'],
      ['Furniture-grade options', 'Wood end panels, canopy tops, integrated signage and lighting'],
      ['Industrial arms', 'Adjustable cantilever rack for pipe, lumber, and long stock'],
      ['Mobile-compatible', 'Compacts on carriages when the collection outgrows the room'],
    ],
    gallery:[IMGS.lancaster1, IMGS.lancaster2, IMGS.lancaster3],
    chipsTitle:'Seen most often in',
    related: relAny('libraries','education','high-density-mobile-storage','four-post-shelving'),
  },
  'bin-storage': {
    eyebrow:'Solutions / Shelving', h1:'Bin & Parts Storage',
    lead:'Small parts, found fast: bin shelving, totes, and modular drawers that keep thousands of SKUs organized and easy to grab.',
    sideImg: IMGS.quikLok,
    paras:[
      `Bin storage keeps every part in its place. Options include shelving with bin fronts, hanging totes, modular drawer cabinets with dividers, and carton flow racks for your most-picked items. The right mix depends on part size, how often items are picked, and who's doing the picking.`,
      `We design bin systems for parts rooms, evidence storage, pharmacies, and maintenance cribs, using bin shelving, modular drawer inserts, and industry-standard totes that work with the containers you already have.`,
      `You can fit even more by going vertical or mobile. Modular drawer cabinets hold far more than open shelving in the same footprint. Bin shelving can also become high-density mobile storage on carriages, or go into a vertical lift module (VLM), saving both floor space and walking time.`,
    ],
    features:[
      ['SKU-level organization', 'Bins, dividers, and labels sized to the part, not the shelf'],
      ['Modular drawers', 'Up to 3x the density of open shelving for small parts'],
      ['Standard totes', 'Systems planned around the containers you already use'],
      ['Goes mobile or vertical', 'Bin storage rides side to side on carriages or vertically inside VLMs'],
    ],
    gallery:[IMGS.evidence, IMGS.storBox, IMGS.gpsCard],
    chipsTitle:'Related systems',
    related: relAny('lifts-carousels','four-post-shelving','automotive','material-handling-warehouse'),
  },
  'pallet-rack': {
    eyebrow:'Solutions / Industrial', h1:'Pallet Rack',
    lead:'Pallet rack built for your operation: selective, cantilever, and specialty configurations designed around your forklifts, loads, and building.',
    sideImg: IMGS.palletNGA,
    paras:[
      `Pallet rack can look like a simple purchase until it's specified wrong. Beam capacity, upright gauge, row spacing, forklift aisle width, and anchoring all need to match how your operation actually runs. That's why we start every pallet rack project with a walkthrough instead of a price list.`,
      `Working with several manufacturers, we offer selective, drive-in, push-back, and cantilever rack, plus rack guarding and column protection. For unusual loads, we've also mounted pallet rack on carriages that glide along floor rails, turning bulk storage into high-density mobile storage.`,
      `Pallet rack is subject to building codes and safety standards, so we prepare layout drawings, provide load and anchoring data for your permit drawings, and support your engineer of record with any structural questions. Proper anchoring comes standard on every installation, handled by our own crews throughout the Philadelphia region and beyond.`,
    ],
    features:[
      ['Full range of rack', 'Selective, drive-in, push-back, and cantilever rack'],
      ['Walkthrough first', 'Beam, upright, and aisle sizing based on your space'],
      ['Permit support', 'Layout drawings and load data for permits and your engineer'],
      ['Mobile option', 'Pallet rack on heavy-duty carriages for more storage in less space'],
    ],
    gallery:[IMGS.palletMobile, IMGS.palletRack, IMGS.mhwCard],
    faqs:[
      ['Do you handle rack permits?', 'We prepare the layout drawings and loading data your permit set needs and work with your engineer of record. Permit requirements vary by township, and structural determinations always rest with the engineer of record.'],
      ['Can you move or reconfigure existing rack?', 'Yes. Teardown, relocation, and reconfiguration are routine for us, including rack we did not originally supply. We inspect uprights and beams for damage before anything goes back up.'],
    ],
    chipsTitle:'Related systems',
    related: relAny('material-handling-warehouse','mezzanines','wire-partitions','cantilever-shelving'),
  },
  'mezzanines': {
    eyebrow:'Solutions / Industrial', h1:'Mezzanines & Platforms',
    lead:'A structural steel mezzanine adds a second working level inside the building you already have, often for far less than the cost of an addition.',
    sideImg: IMGS.mezzanine,
    paras:[
      `When your floor is full but your ceiling isn't, a mezzanine turns unused overhead space into usable floor space: storage up top, operations below, with no addition and no new roof. Work platforms, catwalks, and shelving-supported mezzanines all work the same way.`,
      `Working with leading mezzanine manufacturers, we offer structural steel platforms that arrive with stamped engineering drawings from the manufacturer's licensed engineers. We handle everything around that: measuring your space, planning what goes above and below, coordinating stairs, exits, gates, railings, and lighting, and installing the system with our own crews throughout the Philadelphia region and beyond.`,
      `Your structural engineer of record evaluates the foundation and floor slab. We provide complete point-load data from the manufacturer and work alongside your engineer, so decisions are based on real numbers.`,
    ],
    features:[
      ['Manufacturer-engineered steel', 'Platforms delivered with stamped engineering drawings'],
      ['Full coordination', 'Stairs, exits, gates, railings, decking, and lighting planned together'],
      ['Point-load data', 'Real numbers for your structural engineer of record'],
      ['Storage above and below', 'Often paired with shelving, pallet rack, or lockers on both levels'],
    ],
    gallery:[IMGS.shelvCard, IMGS.mezz2, IMGS.midproject2],
    faqs:[
      ['Will my slab support a mezzanine?', 'Your structural engineer of record makes that call. We provide complete point-load and layout data from the manufacturer and help with the evaluation, which is usually settled early in design.'],
      ['Do mezzanines need a permit?', 'Almost always. The manufacturer\'s stamped engineering drawings and our layout drawings cover much of what a permit application requires, and we\'ve worked through the permit process with townships across the Philadelphia region.'],
    ],
    chipsTitle:'Related systems',
    related: relAny('material-handling-warehouse','pallet-rack','general-contractors','wire-partitions'),
  },
  'wire-partitions': {
    eyebrow:'Solutions / Industrial', h1:'Wire Partitions & Cages',
    lead:'Woven and welded wire partitions create a secure, see-through enclosure anywhere inside your building, from tool cribs and controlled-substance cages to server enclosures and evidence storage.',
    paras:[
      `Wire partitions give you security you can see through. Supervisors keep clear sight lines, air and light move freely, and sprinkler coverage reaches the space, all inside a lockable perimeter installed right on your existing floor. That's why wire cages are a common choice for tool cribs, controlled-substance storage, server rooms, and tenant storage areas.`,
      `Many of the wire partition projects we design are for regulated spaces. DEA-regulated storage for pharmaceutical distributors, evidence enclosures for public safety agencies, and access-controlled server cages each have their own mesh, ceiling, and locking requirements, and we design around those requirements rather than a standard catalog layout.`,
      `Wire partitions are also modular. Panels can be relocated, expanded, or reconfigured as your needs change, something a permanent wall can't do. Our own crews install wire partitions throughout the Philadelphia region and beyond.`,
    ],
    features:[
      ['Built for regulated spaces', 'DEA-regulated storage, evidence enclosures, and secure server rooms'],
      ['See-through security', 'Clear sight lines, airflow, and sprinkler coverage'],
      ['Fast, clean install', 'Goes up quickly on your existing floor with minimal disruption'],
      ['Modular for life', 'Relocate and reconfigure panels as your needs change'],
    ],
    chipsTitle:'Related systems',
    related: relAny('pallet-rack','mezzanines','government-public-safety','material-handling-warehouse'),
  },
  'evidence-lockers': {
    eyebrow:'Solutions / Public Safety', h1:'Evidence Lockers',
    lead:'Chain of custody starts at the deposit door. Pass-through evidence lockers create a secure, one-way transfer from officer to evidence custodian.',
    sideImg: IMGS.evidRoom,
    paras:[
      `A pass-through evidence locker has two sides. Officers deposit evidence through the front, and the door locks behind them. Only the evidence custodian can open the compartment from the rear. With electronic locks, every deposit and retrieval is logged with a timestamp, creating a complete audit trail.`,
      `We design evidence intake as a complete system: a mix of locker sizes for phones, firearms, and bulky items, refrigerated compartments for biological evidence, and the high-density mobile storage and bin storage where evidence is kept long-term.`,
      `Police departments across the Philadelphia region use evidence intake rooms we've designed, and our own crews handle installation. The same chain-of-custody approach works for crime labs, internal affairs, and any operation that needs to document who handled what, and when.`,
    ],
    features:[
      ['Pass-through design', 'Officers deposit from the front; only the custodian opens the rear'],
      ['Audit trails', 'Electronic locks log every deposit and retrieval'],
      ['Refrigerated options', 'Cold storage compartments for biological evidence'],
      ['Whole-room planning', 'Intake lockers plus the long-term storage behind them'],
    ],
    gallery:[IMGS.gun2, IMGS.gpsCard, IMGS.evidRoom],
    chipsTitle:'Related systems',
    related: relAny('government-public-safety','weapons-storage','lockers','bin-storage'),
  },
  'weapons-storage': {
    eyebrow:'Solutions / Public Safety', h1:'Weapons & Gun Storage',
    lead:'Secure weapons storage for law enforcement and military armories, with racks and cabinets that keep long guns and duty weapons locked down while making issue and return fast and accountable.',
    sideImg: IMGS.gun3,
    paras:[
      `Every armory has two competing jobs: keep weapons secure, and issue them quickly at shift change. Purpose-built weapon racks handle both, with adjustable cradles for long guns, drawers for sidearms and optics, and locking options that range from key control to electronic access with full audit trails.`,
      `Working with several manufacturers, we design armories for police departments, sheriff's offices, correctional facilities, and military units. Weapon racks can be mounted in cabinets, on walls, or as high-density mobile storage on carriages that glide along floor rails when your inventory outgrows the room.`,
      `Every layout is designed around your issue process and accreditation requirements. Our own crews complete background checks and any other clearances each job requires, and they're experienced working inside secure facilities throughout the Philadelphia region and beyond.`,
    ],
    features:[
      ['Configurable cradles', 'Long guns, sidearms, optics, and less-lethal equipment in one system'],
      ['Fast issue and return', 'Layouts that keep shift change quick without losing accountability'],
      ['Lock options', 'From key control to fully audited electronic access'],
      ['Secure-facility crews', 'Installers cleared for each job\'s background check and security requirements'],
    ],
    gallery:[IMGS.weapons2, IMGS.gun1, IMGS.weapons1],
    chipsTitle:'Related systems',
    related: relAny('government-public-safety','military','evidence-lockers','lockers'),
  },
  'athletic-storage': {
    eyebrow:'Solutions / Athletics', h1:'Athletic Equipment Storage',
    lead:'Store helmets, pads, sticks, and travel gear for your full roster in up to half the space with high-density mobile storage, in a room that shows recruits your program means business.',
    sideImg: IMGS.montelKnights,
    paras:[
      `Many equipment rooms run into the same problems: gear piled by season, poor airflow, and only one person who knows where everything is. Purpose-built athletic storage solves these with ventilated compartments for each player, custom cradles for helmets and sticks, and high-density mobile storage that fits the whole room onto carriages that glide along floor rails.`,
      `Working with several manufacturers, we offer the same types of systems used by professional and college programs, including branded end panels that turn your equipment room into a stop on the recruiting tour.`,
      `For schools, the solution is often simpler: team room lockers, ventilated gear storage, and high-density mobile storage that frees up floor space for the athletic department. Our own crews install athletic storage throughout the Philadelphia region and beyond.`,
    ],
    features:[
      ['Per-player organization', 'Ventilated compartments sized to the sport'],
      ['Custom cradles', 'A place for every helmet, stick, bat, and pad'],
      ['High-density mobile storage', 'The whole gear room on carriages, in up to half the footprint'],
      ['Recruiting-ready finishes', 'Branded end panels and team colors available'],
    ],
    gallery:[IMGS.montelSharks, IMGS.montelFAU, IMGS.montelWisconsin],
    chipsTitle:'Related systems',
    related: relAny('athletics','education','lockers','high-density-mobile-storage'),
  },
  'rotary-cabinets': {
    eyebrow:'Solutions / Cabinets', h1:'Rotary Cabinets',
    lead:'A rotary cabinet fits two cabinets into one footprint, with shelving on both sides of a rotating core that turns to lock flush inside its steel shell after hours.',
    sideImg: IMGS.rotary2,
    paras:[
      `Rotary cabinets are one of the most space-efficient options for office storage. The rotating core provides up to twice the storage in the same floor space, each side adjusts independently for files, binders, or media, and a quarter turn closes the unit into a locked steel cabinet.`,
      `That's why rotary cabinets are popular with records managers. End-tab files, HR records, and medical charts stay as easy to reach as open shelving during the day and are locked away after hours, with no doors swinging into the aisle.`,
      `We design rotary cabinets as standalone units, in banks, or with add-on tiers that stack as your records grow, and letter, legal, and media layouts can be mixed in a single cabinet. Our own crews install rotary cabinets throughout the Philadelphia region and beyond.`,
    ],
    features:[
      ['Double-sided core', 'Up to twice the filing capacity in the same floor space'],
      ['Locks flush', 'A quarter turn secures everything behind steel'],
      ['Mixed media', 'Files, binders, media, and drawers in one unit'],
      ['Stackable tiers', 'Add capacity vertically as records grow'],
    ],
    chipsTitle:'Related systems',
    related: relAny('cabinets','corporate-legal','fire-rated-cabinets','high-density-mobile-storage'),
  },
  'fire-rated-cabinets': {
    eyebrow:'Solutions / Cabinets', h1:'Fire-Rated & Safety Cabinets',
    lead:'Some records can\'t be replaced, and some materials can\'t be allowed to burn. Fire-rated record cabinets and safety cabinets for hazardous materials handle both.',
    paras:[
      `Fire-rated cabinets protect what insurance can't replace: original contracts, medical records, deeds, wills, and media. UL-rated cabinets are tested to keep interior temperatures low enough to protect paper or media for their rated duration, and options range from vertical files to large lateral files and media safes.`,
      `Safety cabinets solve the opposite problem: storing contents that are hazards themselves. Flammable liquid, corrosive, and aerosol storage cabinets, built in industry-standard colors and construction, help shops, labs, and maintenance areas meet fire code and insurance requirements.`,
      `We help customers throughout the Philadelphia region and beyond choose the right protection, separating what truly needs fire protection from what only needs secure storage. Fire-rated cabinets cost significantly more than standard cabinets, so they should be saved for the records that need them.`,
    ],
    features:[
      ['UL fire ratings', 'Rated protection for original paper records and media'],
      ['Hazardous materials storage', 'Flammable, corrosive, and aerosol safety cabinets'],
      ['Right-sized advice', 'Fire protection only where it\'s truly needed'],
      ['Formats for every record', 'Vertical, lateral, media, and data safes'],
    ],
    chipsTitle:'Related systems',
    related: relAny('cabinets','rotary-cabinets','corporate-legal','government-public-safety'),
  },
  'wardrobe-cabinets': {
    eyebrow:'Solutions / Cabinets', h1:'Wardrobe & Uniform Cabinets',
    lead:'Coats, uniforms, PPE, and personal gear need hanging space and a door that locks. Wardrobe cabinets handle what lockers are too small for.',
    paras:[
      `A wardrobe cabinet sits between a locker and a closet, with full-height hanging space on one side, shelves on the other, and durable steel construction built for daily use. Common uses range from staff coat storage in offices to uniform and turnout gear storage in fire stations and plants.`,
      `Working with several manufacturers, we offer wardrobe and storage cabinets in sizes from single-user units to shared banks, with options for ventilation, sloped tops, bench bases, and electronic locks.`,
      `Combination units are a smart fit for tight staff rooms, giving each person a hanging bar, a personal shelf, and a lockable compartment in one cabinet. Our own crews install wardrobe cabinets throughout the Philadelphia region and beyond.`,
    ],
    features:[
      ['Full-height hanging', 'Room for coats, uniforms, and gear bags'],
      ['Combination layouts', 'Hanging, shelf, and locked storage for each person'],
      ['Heavy-duty steel', 'Durable construction with ventilation and sloped-top options'],
      ['Lock options', 'Keyed, padlock hasp, or electronic'],
    ],
    chipsTitle:'Related systems',
    related: relAny('lockers','cabinets','corporate-legal','military'),
  },
  'museum-cabinets': {
    eyebrow:'Solutions / Museum', h1:'Museum Cabinets',
    lead:'Conservation-grade museum storage cabinets protect collections from dust, pests, light, and humidity swings, while keeping every object within easy reach for research.',
    sideImg: IMGS.museumDrawers,
    paras:[
      `Museum storage cabinets are built to a higher standard than typical steel cabinets: collection-safe powder-coat finishes that won't off-gas onto collections, gasketed doors that maintain a stable microclimate, and interiors outfitted with trays, drawers, and hanging systems tailored to each object type.`,
      `Working with several museum-grade cabinet manufacturers, we outfit natural history, fine art, textile, and archival collections. Configurations include entomology drawers, herbarium cases, rolled textile storage, framed art storage, and oversized flat files.`,
      `Pairing conservation cabinets with high-density mobile storage can double a collection's storage capacity without new construction. We've installed this combination for museums and university collections across the Philadelphia region.`,
    ],
    features:[
      ['Conservation-grade', 'Collection-safe finishes and gasketed doors that maintain a stable microclimate'],
      ['Custom interiors', 'Trays, drawers, racks, and textile rolls configured for each object type'],
      ['Museum-grade lines', 'Conservation cabinets from multiple manufacturers'],
      ['Mobile-ready', 'Cabinets mount on carriages that glide along floor rails, for up to twice the storage in the same space'],
    ],
    gallery:[IMGS.cabMuseum, IMGS.musSlots, IMGS.musVisual2],
    chipsTitle:'Related systems',
    related: relAny('museums','art-screens','cabinets','high-density-mobile-storage'),
  },
  'art-screens': {
    eyebrow:'Solutions / Museum', h1:'Art Screens & Racks',
    lead:'Art storage racks hang framed works on wire mesh screens that pull out, roll side to side on a track, or mount to the wall, keeping the whole collection visible, ventilated, and easy to reach.',
    sideImg: IMGS.artScreen,
    paras:[
      `Art screens store framed works and hanging textiles the way conservators prefer: hanging, spaced apart, and handled as little as possible. Both sides of each screen hold artwork, so a curator can review dozens of works in seconds without lifting a frame off a stack.`,
      `We design and install three types of art storage racks. Pull-out screens glide on overhead or floor tracks and make the most of a room's depth. Lateral racks roll side to side on a track, so an entire storage room can share a single access aisle. Wall-mounted screens turn unused wall space into storage in study and prep rooms.`,
      `We offer systems for everything from a ten-screen study room to a full museum vault, throughout the Philadelphia region and beyond. Art screens can also integrate with high-density mobile storage for even greater capacity.`,
    ],
    features:[
      ['Pull-out, lateral, or wall-mounted', 'All three types, matched to your space and collection'],
      ['Double-sided screens', 'Artwork hangs securely on both sides of each mesh screen, doubling capacity while keeping every piece protected'],
      ['Conservation hardware', 'Powder-coated mesh and hooks that protect framed pieces'],
      ['High-capacity storage', 'Each screen holds many framed works, from small pieces to large canvases'],
    ],
    gallery:[IMGS.artScreens2, IMGS.artHD, IMGS.hdmsArtScreen],
    chipsTitle:'Related systems',
    related: relAny('museums','museum-cabinets','high-density-mobile-storage','corporate-legal'),
  },
  'mail-sorters': {
    eyebrow:'Solutions / Casework', h1:'Mail Sorters & Mailroom',
    lead:'Sort modules, consoles, and mailroom casework sized to your daily volume, from a corporate mail stop to a university package center.',
    sideImg: IMGS.hamMailGlass,
    paras:[
      `A mailroom is all about workflow: mail comes in, gets sorted, and goes out, and the right casework keeps it moving. Purpose-built sort modules place adjustable pockets at a comfortable working height above counters deep enough to stage a full delivery run.`,
      `Working with several manufacturers, we design mail centers with sort modules, consoles, and adjustable shelving, configured around your delivery routes and volume. Pockets can be relabeled and resized as departments change, unlike fixed cubbies.`,
      `Package volume has changed the mailroom. When parcels outgrow the sorting area, we pair mail casework with smart parcel lockers, so recipients can pick up packages on their own schedule and staff can focus on mail. Our own crews install mailroom systems throughout the Philadelphia region and beyond.`,
    ],
    features:[
      ['Adjustable pockets', 'Sort positions resize and relabel as routes change'],
      ['Working-height design', 'Counters and modules laid out around your sorting workflow'],
      ['Matching components', 'Sort modules, consoles, and shelving designed to work together'],
      ['Parcel integration', 'Smart lockers handle package overflow'],
    ],
    chipsTitle:'Related systems',
    related: relAny('modular-casework','lockers','corporate-legal','education'),
  },
};

const INDUSTRY_PAGES = {
  'museums': {
    h1:'Museum Storage',
    lead:'Collections storage that protects, organizes, and makes room for growth, with art racks, conservation cabinets, and high-density mobile storage for objects of every size.',
    sideImg: IMGS.artScreen,
    paras:[
      `Most museums display only a fraction of their collections. The rest is in storage, and that storage plays a big role in how well the collection is preserved. We design collections storage around the objects themselves: framed works and hanging textiles on art racks and screens, rolled textiles on textile racks, specimens and works on paper in conservation cabinets with gasketed doors, and high-density mobile storage that can hold any part of a collection.`,
      `We work with the museum-grade manufacturers collection managers already know, covering conservation cabinets, high-density mobile storage, art racks and screens, and display systems.`,
      `Every project starts with a collection walkthrough. We measure what you have, plan for future acquisitions, and schedule installation around your exhibition calendar to minimize disruption to the collection. Our own crews install collections storage for museums throughout the Philadelphia region and beyond.`,
    ],
    features:[
      ['Art racks and screens', 'Pull-out, lateral, and wall-mounted storage for framed works and hanging textiles'],
      ['Conservation cabinets', 'Collection-safe finishes and gasketed doors'],
      ['High-density mobile storage', 'Up to twice the storage for any part of your collection'],
      ['Exhibition-aware installs', 'Scheduled around your exhibition calendar'],
    ],
    gallery:[IMGS.musCompact, IMGS.musVisual2, IMGS.textile],
    chipsTitle:'Solutions museums use most',
    related: relAny('high-density-mobile-storage','museum-cabinets','art-screens'),
  },
  'libraries': {
    h1:'Library Storage',
    lead:'Library shelving and high-density mobile storage that keep collections accessible while freeing up floor space for readers, study areas, and educational programs.',
    sideImg: IMGS.lib1,
    paras:[
      `Libraries are being asked to do more as community spaces, but the collection still needs a home. High-density mobile storage can fit up to twice the collection in the same footprint, and cantilever library shelving keeps open stacks easy to browse and adapt.`,
      `High-density mobile storage can consolidate a collection into less space, freeing up room for seating, makerspaces, and educational programs without deaccessioning materials. Mobile systems work in public stacks, closed stacks, and archives alike.`,
      `Weight matters in library projects. Book stacks are heavy, and mobile systems concentrate that load on the floor. We provide complete loading data and work with your facilities team and structural engineer before anything is ordered. Our own crews install library storage throughout the Philadelphia region and beyond.`,
    ],
    features:[
      ['Cantilever library shelving', 'Classic browsable stacks that are easy to re-shelve and reconfigure'],
      ['High-density mobile storage', 'Up to twice the collection in the same space'],
      ['Archives and special collections', 'Closed-stack and conservation-grade options'],
      ['Engineer coordination', 'Loading data provided to your structural engineer before ordering'],
    ],
    gallery:[IMGS.libShelves, IMGS.libHD, IMGS.libraryCard],
    chipsTitle:'Solutions libraries use most',
    related: relAny('high-density-mobile-storage','cantilever-shelving','cabinets'),
  },
  'education': {
    h1:'Education Storage',
    lead:'From textbook rooms, libraries, and science prep to athletics and facilities, schools need storage that stands up to daily use and fits the budget.',
    sideImg: IMGS.education,
    paras:[
      `Schools store a little of everything: curriculum materials, lab supplies, uniforms, instruments, records, and the equipment that keeps buildings running. We design storage building by building and room by room, with systems built to stand up to daily student use.`,
      `4-post shelving organizes textbook and supply rooms. Cantilever library shelving gives school libraries open, browsable stacks that are easy to reconfigure as collections and spaces change. Modular casework outfits classrooms and prep rooms. Athletic lockers and gear storage handle team rooms. High-density mobile storage gives registrars and district offices more room for records without new construction.`,
      `Summer is install season. We schedule deliveries and our own crews around the academic calendar so rooms are ready before students return. We work with schools, colleges, and universities throughout the Philadelphia region and beyond.`,
    ],
    features:[
      ['Textbook and supply rooms', 'Adjustable 4-post shelving that\'s easy to reconfigure each year'],
      ['Classroom casework', 'Modular units that move when programs change'],
      ['Athletics storage', 'Ventilated lockers and equipment storage'],
      ['Records storage', 'High-density mobile storage for registrar and district offices'],
      ['School libraries', 'Cantilever library shelving for open, flexible stacks'],
    ],
    gallery:[IMGS.education, IMGS.eduCard, IMGS.eduModular],
    chipsTitle:'Solutions schools use most',
    related: relAny('high-density-mobile-storage','lockers','static-shelving','modular-casework','cantilever-shelving'),
  },
  'athletics': {
    h1:'Athletics Storage',
    lead:'Team rooms, equipment rooms, and gear storage built to handle the daily demands of athletic programs at every level.',
    sideImg: IMGS.lockersCard,
    paras:[
      `Athletic storage works hard: wet gear, heavy pads, constant turnover, and doors that need to open every time. We outfit team rooms with ventilated athletic lockers, equipment rooms with heavy-duty shelving, and uniform rooms with storage that keeps inventory easy to track.`,
      `Working with several manufacturers, we offer open-front team lockers, ventilated gear lockers, and secure personal storage. Wire and industrial shelving keeps balls, pads, and training equipment organized in equipment cages and closets.`,
      `For programs with more gear than space, high-density mobile storage can provide up to twice the storage in the same equipment room. Our own crews install athletic storage for schools, colleges, and teams throughout the Philadelphia region and beyond.`,
    ],
    features:[
      ['Team-room lockers', 'Open-front and ventilated designs for daily gear'],
      ['Equipment cages', 'Heavy-duty shelving built for a full season of use'],
      ['Uniform storage', 'Organized, easy to count, and ready for game day'],
      ['High-density mobile storage', 'Up to twice the equipment storage in the same room'],
    ],
    gallery:[IMGS.hamiltonLocker, IMGS.eduLockers, IMGS.agile1],
    chipsTitle:'Solutions athletic programs use most',
    related: relAny('high-density-mobile-storage','athletic-storage','lockers'),
  },
  'government-public-safety': {
    h1:'Government & Public Safety Storage',
    lead:'Evidence rooms, records centers, and gear storage built for accountability.',
    sideImg: IMGS.evidence,
    paras:[
      `In public safety storage, organization is part of chain of custody. Evidence rooms need pass-through lockers, secure shelving, and layouts that make every item easy to find and audit. We design evidence storage around your intake volume, retention schedules, and accreditation requirements.`,
      `Beyond evidence, agencies store records, gear, weapons, and fleet equipment. High-density mobile storage makes the most of records rooms. Gear lockers keep officer equipment ready and accounted for. Weapons storage secures armories and helps agencies maintain the documentation they need. Many of the manufacturers we work with hold GSA contracts, so we can offer purchasing through their GSA schedules where it applies.`,
      `O'Brien Systems is a Commonwealth of Pennsylvania Small Business (SB) certified vendor. Our own crews complete background checks and any other clearances each job requires, and they're experienced working inside secure facilities throughout the Philadelphia region and beyond.`,
    ],
    features:[
      ['Evidence storage', 'Pass-through lockers and secure shelving that\'s easy to audit'],
      ['Records storage', 'High-density mobile storage sized to your retention schedules'],
      ['Gear and armory', 'Officer equipment ready, secured, and documented'],
      ['PA SB certified', 'Commonwealth of Pennsylvania Small Business certified vendor'],
    ],
    gallery:[IMGS.gun1, IMGS.lockerEvidence, IMGS.gpsCard],
    chipsTitle:'Solutions agencies use most',
    related: relAny('high-density-mobile-storage','evidence-lockers','weapons-storage','lockers'),
  },
  'military': {
    h1:'Military Storage',
    lead:'Readiness depends on gear you can find, count, and issue quickly. We design and install storage for armories, supply rooms, and base operations.',
    sideImg: IMGS.weapons2,
    paras:[
      `In military storage, organization is part of readiness. Gear issue moves faster when every item has an assigned, labeled place. We outfit supply rooms and ready rooms with gear lockers, high-density mobile storage, and weapons storage designed around your issue and turn-in process.`,
      `Working with several manufacturers, we offer lockers, shelving, and weapon racks built for military environments, from TA-50 gear storage to armory racks. Many of these manufacturers hold GSA contracts, so we can offer purchasing through their GSA schedules where it applies.`,
      `Our own crews complete background checks and any other clearances each job requires, and we coordinate installation around operational schedules. O'Brien Systems is a Commonwealth of Pennsylvania Small Business (SB) certified vendor, serving facilities throughout the Philadelphia region and beyond.`,
    ],
    features:[
      ['Gear lockers', 'Assigned, labeled storage for issued equipment'],
      ['Armory storage', 'Weapon racks with layouts that make documentation easier'],
      ['Supply room storage', 'High-density mobile storage for issue and turn-in'],
      ['Controlled-site installs', 'Crews cleared for each site\'s access requirements'],
    ],
    gallery:[IMGS.gun2, IMGS.gun3, IMGS.weapons1],
    chipsTitle:'Solutions defense facilities use most',
    related: relAny('high-density-mobile-storage','lockers','weapons-storage','wardrobe-cabinets'),
  },
  'pharmaceutical-healthcare': {
    h1:'Healthcare & Pharmaceutical Storage',
    lead:'Supply, sterile core, pharmacy, and lab storage that keeps everything organized and frees up more space for patient care.',
    sideImg: IMGS.clinic,
    paras:[
      `In a hospital, every square foot used for storage is space that can't be used for patient care. We make the most of supply storage with high-density mobile storage, organize sterile core and pharmacy areas with wire shelving and cabinets designed for easy cleaning, and outfit labs with steel casework built for the work.`,
      `Wire shelving is a common choice in healthcare for supply storage that's easy to clean and reconfigure. Modular casework adapts clinical support spaces without construction. Vertical lift modules (VLMs) help secure and track high-value pharmacy and supply inventory.`,
      `Our own crews have worked in active healthcare and pharmaceutical facilities, including many health systems, children's hospitals, and major pharmaceutical companies. We coordinate every installation around infection control requirements and clinical schedules throughout the Philadelphia region and beyond.`,
    ],
    features:[
      ['Sterile core and supply', 'Wire shelving and cabinets that are easy to clean'],
      ['Pharmacy storage', 'Secure, trackable, space-saving inventory systems'],
      ['Lab casework', 'Steel casework and chemical-resistant surfaces'],
      ['Live-facility installs', 'Crews and schedules planned around infection control'],
    ],
    gallery:[IMGS.pharmaBottles, IMGS.nemours5, IMGS.pharmaCard],
    chipsTitle:'Solutions healthcare facilities use most',
    related: relAny('high-density-mobile-storage','lifts-carousels','wire-shelving','modular-casework'),
  },
  'corporate-legal': {
    h1:'Corporate & Legal Storage',
    lead:'Records rooms, file systems, and workplace storage that keep information easy to find and offices running smoothly.',
    sideImg: IMGS.corpCard,
    paras:[
      `A well-organized storage system makes it faster to file and find important documents. Legal and corporate offices still rely on paper where it matters most: case files, contracts, HR records, and archives with strict retention requirements.`,
      `High-density mobile storage can fit a records room into up to half the space. Lateral and rotary cabinets keep active files organized right where people work. Smart lockers handle day-use storage, package delivery, and shared equipment in hybrid workplaces.`,
      `When offices move or consolidate, our own crews move the records too, keeping files in order from the old space to the new one. We work with corporate and legal offices throughout the Philadelphia region and beyond.`,
    ],
    features:[
      ['Records storage', 'High-density mobile storage for archives'],
      ['Active file systems', 'Lateral and rotary cabinets right where people work'],
      ['Workplace lockers', 'Smart day-use and package storage for hybrid offices'],
      ['Office relocations', 'Moves and reinstalls that keep your files in order'],
    ],
    gallery:[IMGS.corpHD, IMGS.corpArchival, IMGS.corpCabs],
    chipsTitle:'Solutions offices use most',
    related: relSol('high-density-mobile-storage','cabinets','lockers','modular-casework'),
  },
  'retail': {
    h1:'Retail Storage',
    lead:'Back-of-house storage that shrinks the stockroom instead of the stock, freeing up more floor space for selling and keeping more inventory within reach.',
    sideImg: IMGS.retailMobile,
    paras:[
      `An organized stockroom keeps goods moving and the sales floor stocked. High-density mobile storage lets the same stockroom hold more inventory, or lets the stockroom shrink so the sales floor can grow.`,
      `We design retail storage around how you restock: fast-moving items stay within easy reach on open shelving, slower-moving items go on high-density mobile storage, and seasonal inventory gets a home outside the receiving area.`,
      `Multi-site rollouts are a specialty. We've outfitted store networks with standardized shelving packages, coordinating each store around business hours, and we work with national retailers on locations across the country.`,
    ],
    features:[
      ['Stockroom storage', 'High-density mobile storage that adds capacity, not footprint'],
      ['Workflow-first layout', 'Fast movers within reach, slow movers on mobile storage'],
      ['Online order pickup', 'Smart lockers for customer pickup and staff storage'],
      ['Multi-site rollouts', 'Standardized shelving packages installed store by store'],
    ],
    gallery:[IMGS.retail1, IMGS.retail2, IMGS.retail3],
    chipsTitle:'Solutions retailers use most',
    related: relSol('high-density-mobile-storage','static-shelving','lockers'),
  },
  'automotive': {
    h1:'Automotive Storage',
    lead:'Parts departments, tire storage, and service areas organized so every part is right where your system says it is.',
    sideImg: IMGS.autoCard,
    paras:[
      `Automotive parts storage is a constant balance between growing inventory and limited floor space. High-density mobile storage, specialized tire racks, and vertical lift modules each solve that problem in a different way, and most dealerships use a combination.`,
      `Vertical lift modules (VLMs) are a strong fit for parts departments. They secure and track small parts in a much smaller footprint than the shelving they replace, and deliver them to the counter at the push of a button. Tire racks organize bulky tire inventory that takes up too much room on standard shelving.`,
      `We design your layout around the bin locations in your dealer management system (DMS), so the physical storage matches your inventory records and parts are faster to find. Our own crews install automotive storage throughout the Philadelphia region and beyond, and we work with national automotive retailers on locations across the country.`,
    ],
    features:[
      ['Parts shelving', 'High-density mobile storage and modular drawers for small parts'],
      ['Tire storage', 'Purpose-built racks for bulky tire inventory'],
      ['VLMs at the counter', 'Secure, tracked parts delivered right to your team'],
      ['Bin-location planning', 'Layouts that match your dealer management system'],
    ],
    gallery:[IMGS.auto1, IMGS.auto2, IMGS.auto3],
    chipsTitle:'Solutions parts operations use most',
    related: relAny('high-density-mobile-storage','lifts-carousels','static-shelving','bin-storage'),
  },
  'material-handling-warehouse': {
    h1:'Material Handling & Warehouse',
    lead:'Pallet rack, mezzanines, and automated storage for operations that measure storage by throughput, not just square footage.',
    sideImg: IMGS.mhwLC,
    paras:[
      `Operations focused on lowering costs and increasing productivity rely on high-capacity storage and material handling equipment. Working with several manufacturers, we supply and install pallet rack and cantilever rack, structural mezzanines and platforms, and industrial shelving.`,
      `Mezzanines add a second working level inside the building you already have, often for far less than the cost of an addition. Vertical lift modules (VLMs) and other automated systems save space in parts storage and speed up picking where labor is limited.`,
      `Every project gets full engineering support, including manufacturer-rated rack capacities, complete equipment load data for your structural engineer of record, and layout drawings to support your permit application. Our own crews install material handling systems throughout the Philadelphia region and beyond.`,
    ],
    features:[
      ['Pallet rack and cantilever rack', 'Rack designed around your loads'],
      ['Mezzanines', 'Structural platforms that add a second working level'],
      ['Industrial shelving', 'Heavy-duty shelving built for daily use'],
      ['Automation', 'VLMs that speed up picking and save floor space'],
    ],
    gallery:[IMGS.mhw1, IMGS.palletRack3, IMGS.warehouse],
    chipsTitle:'Solutions warehouses use most',
    related: relAny('pallet-rack','mezzanines','lifts-carousels','static-shelving'),
  },
  'vertical-farming': {
    h1:'Vertical Farming Storage',
    lead:'Growing vertically can save space and increase crop yield per square foot. Mobile grow systems take it further by putting more of the room to work.',
    sideImg: IMGS.vfCard,
    paras:[
      `Vertical farming works on the same idea as high-density mobile storage: fewer aisles, more capacity. Mobile grow systems mount multi-tier grow racks on carriages that glide along floor rails, so the rows share a single working aisle instead of needing one aisle per row.`,
      `The same approach works for trays, decking, drying racks, and the carts that move product through your operation. We design around your lighting, ventilation, and irrigation in coordination with your cultivation team.`,
      `We handle layout, delivery, and installation with our own crews, provide loading data for your structural engineer, and service and reconfigure systems as your operation grows, throughout the Philadelphia region and beyond.`,
    ],
    features:[
      ['Mobile grow systems', 'Multi-tier grow racks on carriages'],
      ['Grow racks and trays', 'Static racks, wire decking, and drying racks'],
      ['Utility coordination', 'Layouts designed around lighting and irrigation'],
      ['Scale-up service', 'Reconfiguration as your operation grows'],
    ],
    gallery:[IMGS.vf2, IMGS.vfTables, IMGS.vf3],
    chipsTitle:'Solutions vertical farms use most',
    related: relSol('high-density-mobile-storage','static-shelving'),
  },
};

/* industry pages link to their guide */
const GUIDE_FOR = { museums:'museum-collections', libraries:'libraries', education:'education', athletics:'athletics', 'government-public-safety':'government-public-safety', military:'military', 'pharmaceutical-healthcare':'healthcare-pharmaceutical', 'corporate-legal':'corporate-legal', automotive:'automotive' };
const guideCallout = (slug, name) => {
  const g = GUIDE_FOR[slug] && GD.GUIDES.find(x => x.slug === GUIDE_FOR[slug]);
  return g ? `
    <div class="spec" style="margin-top:44px">
      <div class="spec-l"><span class="eyebrow">Industry guide</span><h2>${g.title}</h2><p style="margin:0">${g.sr.redefined}</p></div>
      <div class="spec-r"><a class="btn btn-solid" href="guides/${g.slug}/">Read the guide &rarr;</a><a class="btn btn-ghost" href="guides/">All industry guides</a></div>
    </div>` : '';
};

/* ---------------- hub + static pages ---------------- */
const cardGrid = (items, sr) => `<div class="cards">` + items.map(x=>`
  <a class="card" href="${x.slug}.html"><div class="ph" style="background-image:url('${x.img}')"></div>
    <div class="bd"><h3>${x.name}</h3>${sr ? SR(SRDATA[x.slug]) : ''}<p>${x.short}.</p><span class="go">Explore &rarr;</span></div></a>`).join('') + `</div>`;

const solutionsHub = shell(`Storage Solutions | O'Brien Systems`, IMGS.compact, `
<div class="page-hero">
  <div class="wrap crumbs"><a href="index.html">Home</a> / Solutions</div>
  <div class="wrap">
    <span class="eyebrow">Solutions</span>
    <h1>What do you need to store?</h1>
    <p>More than 20 storage systems from several leading manufacturers, with one local team that designs, installs, and services all of it. Start with a family, or jump straight to the system you already know you need.</p>
  </div>
</div>
${SOL_GROUPS.map(g=>`
<section class="block" style="padding-bottom:0">
  <div class="wrap">
    <h2 style="font-size:1.45rem;margin-bottom:6px">${g.name}</h2>
    ${cardGrid(g.items)}
  </div>
</section>`).join('')}
<div style="height:72px"></div>`);

const industriesHub = shell(`Industries We Serve | O'Brien Systems`, IMGS.banHome2, `
<div class="page-hero">
  <div class="wrap crumbs"><a href="index.html">Home</a> / Industries</div>
  <div class="wrap">
    <span class="eyebrow">Industries</span>
    <h1>Storage, planned around your work</h1>
    <p>Every industry stores something different. Here are the industries we serve most, from evidence rooms to grow rooms.</p>
  </div>
</div>
<section class="block"><div class="wrap">
${cardGrid(INDUSTRIES)}
<div class="spec" style="margin-top:52px">
  <div class="spec-l"><span class="eyebrow">For project teams</span><h2>Working on a construction project?</h2><p style="margin:0">See how we support general contractors and architects, from specification through punch list.</p></div>
  <div class="spec-r"><a class="btn btn-solid" href="general-contractors.html">General Contractors &rarr;</a><a class="btn btn-ghost" href="architects-designers.html">Architects &amp; Designers &rarr;</a></div>
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
      <a class="btn btn-white" href="service.html">Request Service</a>
      <a class="btn btn-ghost" href="contact.html?topic=quote">Request a Quote or Proposal</a>
    </div>
  </div>
</div>
<section class="block"><div class="wrap">
  <span class="eyebrow">How Projects Run</span>
  <h2>Four steps, <em>one team</em></h2>
  <div class="steps">
    <div class="step"><span class="n">01 &middot; ASSESS</span><h3>${SRT('as&middot;sess','v.')}</h3><p>We walk your space, measure what you store, and find a solution to provide as much capacity as possible. No cost, no obligation.</p></div>
    <div class="step"><span class="n">02 &middot; DESIGN</span><h3>${SRT('de&middot;sign','v.')}</h3><p>Drawings, equipment load data, and an itemized quote, from the right manufacturer for the job.</p></div>
    <div class="step"><span class="n">03 &middot; INSTALL</span><h3>${SRT('in&middot;stall','v.')}</h3><p>Our own crews deliver and install all equipment, coordinated around your operating hours and site rules.</p></div>
    <div class="step"><span class="n">04 &middot; SUPPORT</span><h3>${SRT('sup&middot;port','v.')}</h3><p>Maintenance, reconfiguration, teardown and moves, even for systems we didn't originally supply.</p></div>
  </div>
</div></section>
<section class="block projects-bg" style="padding-top:56px;padding-bottom:56px"><div class="wrap">
  <span class="eyebrow">What We Do After the Sale</span>
  <h2>Service is the <em>product</em></h2>
  <p class="lead">Our own service crews support customers throughout the Philadelphia region and beyond, whether we installed the system or not.</p>
  <div class="feat" style="margin-top:34px">
    <div><b>Maintenance &amp; repair, most brands</b><span>We maintain and repair most storage systems, including ones we didn't install and many from manufacturers no longer in business.</span></div>
    <div><b>Relocation &amp; reinstallation</b><span>4-post and case-style systems disassemble and move with your department, file order intact. Offices, records rooms, whole facilities.</span></div>
    <div><b>Reconfiguration</b><span>Add sections, change shelf heights, or convert static shelving to high-density mobile storage as your needs grow.</span></div>
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
      <p>A system that needs maintenance, repair, relocation, or reconfiguration. Tell us the brand and the issue, and we'll let you know how we can help. We service most major brands, including many we didn't install.</p>
      <span class="go">Schedule service &rarr;</span>
    </a>
    <a href="contact.html?topic=quote" style="--panel-img:url('${IMGS.contracts}')">
      <h3>Request a quote or proposal</h3>
      <p>A project on paper: new construction, a renovation, or a room that stopped working. Send drawings if you have them, or just tell us what you store.</p>
      <span class="go">Request a quote &rarr;</span>
    </a>
  </div>
</div></section>`);

const aboutPage = shell(`About Us | O'Brien Systems`, IMGS.bg3, `
<div class="page-hero">
  <div class="wrap crumbs"><a href="index.html">Home</a> / About</div>
  <div class="wrap">
    <span class="eyebrow">About O'Brien Systems</span>
    <h1>Storage redefined, since 1979</h1>
    <p>A third-generation, family-owned storage company serving the greater Philadelphia region and beyond from Conshohocken, Pennsylvania.</p>
  </div>
</div>
<section class="block"><div class="wrap twocol">
  <div class="body">
    <span class="eyebrow">Our Story</span>
    <h2 style="margin-bottom:14px">A family-owned and -operated business</h2>
    <p>O'Brien Systems was founded in 1979 by Charles O'Brien, Charlie O or Chaz to those who knew and loved him. Shortly after starting the business, Charles was in a major car accident that left him hospitalized for three months and unable to return to his office in Suburban Station for over a year. Although the odds were stacked against him, he was determined to succeed, and the original work-from-home business was born: proposals typed on his trusted Royal typewriter, hand delivered by his son Kevin after classes at Villanova.</p>
    <p>Kevin joined the business full time in 1981 with a Villanova degree in finance. Charles' youngest son Mike followed in 1985, and years later oldest son Dennis left banking to join his brothers. A phenomenal group of decade-long employees, who have turned into family, play a major role in the success of the business, and most recently, Charlie's grandchildren Jess and Patrick joined the team.</p>
    <p>At its core, O'Brien Systems is a strong combination of family values, determination and a great deal of long, hard hours in the office and in the field. Through more than four decades, the objective has never changed: provide our clients with the highest quality of service and products to help their business succeed.</p>
  </div>
  <div class="side-img"><img src="${IMGS.hamiltonTall}" alt="O'Brien Systems storage installation" loading="lazy"></div>
</div>
<div class="wrap">
  <div class="feat">
    <div><b>Family-owned since 1979</b><span>More than four decades of storage projects, local and national.</span></div>
    <div><b>Philadelphia HQ</b><span>Based in Conshohocken, PA. When our customers grow beyond the region, we go with them.</span></div>
    <div><b>Several leading manufacturers</b><span>Neutral recommendations, matched to each project.</span></div>
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
    <div class="tm"><div class="avatar">JV</div><b>Jess Viola</b><span>Business Development &amp; Marketing Manager</span><p style="font-size:.8rem;color:var(--muted);margin-top:8px">Business development, marketing, and project management, from first assessment through installation and support, with a background in HR and healthcare marketing.</p></div>
    <div class="tm"><div class="avatar">PO</div><b>Patrick O'Brien</b><span>Sales &amp; Technology</span><p style="font-size:.8rem;color:var(--muted);margin-top:8px">The next generation: sales, systems, and the technology that keeps a company founded in 1979 moving fast.</p></div>
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
    <div class="ccard"><span class="ic">&#128737;</span><b>Public procurement</b><p>PA Small Business (SB) Certified. Many of the manufacturers we work with hold GSA contracts.</p><a class="big" href="government-public-safety.html">Government storage &rarr;</a></div>
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
        <option value="lunch">Request an AIA-certified lunch and learn</option>
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
  <h2 style="font-size:1.45rem;margin:52px 0 6px">Industry guides</h2>
  <p class="lead" style="margin-top:0">Storage options, 3D models, and applications for each industry, in one page.</p>
  <div class="chips">${GD.GUIDES.map(g=>`<a href="guides/${g.slug}/">${g.name}</a>`).join('')}<a href="guides/">All industry guides &rarr;</a></div>
  <div class="chips" style="margin-top:36px"><a href="storage-questions.html">Storage questions answered</a><a href="architects-designers.html">Architects &amp; Designers: CSI sections, CAD and Revit</a><a href="service.html">Request service</a></div>
  <p class="lead" style="margin-top:28px">Need drawings, specifications, or manufacturer literature for a specific product line? <a href="contact.html">Ask us</a> and we'll pull the current documents from the manufacturer.</p>
</div></section>`);

/* ---------------- home page ---------------- */
const SVG_FIXED = `<svg viewBox="0 0 400 150" role="img" aria-label="Fixed shelving layout with wasted aisle space">
          <rect x="0" y="0" width="400" height="150" fill="rgba(255,255,255,.04)"/>
          <g fill="#7fd6d9"><rect x="12" y="10" width="37" height="130" rx="3"/><rect x="106" y="10" width="37" height="130" rx="3"/><rect x="200" y="10" width="37" height="130" rx="3"/><rect x="294" y="10" width="37" height="130" rx="3"/></g>
          <g stroke="#023c3f" stroke-opacity=".35" stroke-width="1.5">${[12,106,200,294].map(x=>`<line x1="${x+18.5}" y1="16" x2="${x+18.5}" y2="134"/>`).join('')}</g>
          <g fill="rgba(255,255,255,.13)"><rect x="51" y="10" width="53" height="130"/><rect x="145" y="10" width="53" height="130"/><rect x="239" y="10" width="53" height="130"/><rect x="333" y="10" width="55" height="130"/></g>
          <text x="200" y="82" text-anchor="middle" fill="#e2f0f0" font-size="13" font-weight="700" font-family="sans-serif">4 shelving rows &middot; 4 aisles</text>
        </svg>`;
const SVG_MOBILE = `<svg viewBox="0 0 400 150" role="img" aria-label="Mobile shelving layout with one shared aisle">
          <rect x="0" y="0" width="400" height="150" fill="#023c3f"/>
          <rect x="0" y="0" width="400" height="150" fill="rgba(255,255,255,.04)"/>
          <g fill="#7fd6d9"><rect x="12" y="10" width="37" height="130" rx="3"/><rect x="52" y="10" width="37" height="130" rx="3"/><rect x="92" y="10" width="37" height="130" rx="3"/><rect x="132" y="10" width="37" height="130" rx="3"/><rect x="172" y="10" width="37" height="130" rx="3"/><rect x="212" y="10" width="37" height="130" rx="3"/><rect x="252" y="10" width="37" height="130" rx="3"/><rect x="351" y="10" width="37" height="130" rx="3"/></g>
          <g stroke="#023c3f" stroke-opacity=".35" stroke-width="1.5"><line x1="30.5" y1="16" x2="30.5" y2="134"/><line x1="70.5" y1="16" x2="70.5" y2="134"/><line x1="110.5" y1="16" x2="110.5" y2="134"/><line x1="150.5" y1="16" x2="150.5" y2="134"/><line x1="190.5" y1="16" x2="190.5" y2="134"/><line x1="230.5" y1="16" x2="230.5" y2="134"/><line x1="270.5" y1="16" x2="270.5" y2="134"/><line x1="369.5" y1="16" x2="369.5" y2="134"/></g>
          <rect x="292" y="10" width="56" height="130" fill="rgba(255,255,255,.13)"/>
          <text x="320" y="82" text-anchor="middle" fill="#e2f0f0" font-size="12" font-weight="700" font-family="sans-serif">1 aisle</text>
          <text x="150" y="82" text-anchor="middle" fill="#023c3f" font-size="13" font-weight="700" font-family="sans-serif">8 shelving rows</text>
        </svg>`;

/* slider variants: same art, no center captions (the corner pills carry the labels) */
const SVG_FIXED_BA = SVG_FIXED.replace(/<text[\s\S]*?<\/text>/g, '');
const SVG_MOBILE_BA = SVG_MOBILE.replace(/<text[\s\S]*?<\/text>/g, '');

const homeBody = `
<div class="hero">
  <div class="wrap">
    <h1>Storage, <em>redefined.</em></h1>
    ${SR(SRDATA.home, true)}
    <p>Since 1979, O'Brien Systems has designed, supplied, and installed custom storage solutions for customers across the Philadelphia region and wherever their projects take them.</p>
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
    <a href="industries.html"><span class="ic">&#8594;</span>All 12 Industries</a>
  </div>
</div>

<div class="stats wrap">
  <div class="grid three">
    <div><b>1979</b><span>family-owned since</span></div>
    <div><b class="loc">Conshohocken,&nbsp;PA</b><span>serving the region, traveling with our customers</span></div>
    <div><b>Free</b><span>on-site space assessments</span></div>
  </div>
</div>
<div class="certbar"><div class="sb-badge">
  ${KEYSTONE('keystone')}
  <div class="sb-text">
    <span class="sb-eyebrow">Commonwealth of Pennsylvania</span>
    <b>Small Business (SB) Certified</b>
    <span class="sb-sub">Certified vendor for public procurement</span>
  </div>
</div></div>

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
    ${cardGrid(SOLUTIONS, true)}
    <p style="text-align:center;margin-top:28px"><a class="btn btn-solid" href="solutions.html">Browse the full catalog: ${SOLUTIONS.length + PRODUCTS.length} storage systems &rarr;</a></p>
  </div>
</section>

<section class="block compare">
  <div class="wrap">
    <span class="eyebrow">The Case for High-Density Mobile Storage</span>
    ${SR(SRDATA.sqft, true, 'big')}
    <p class="lead">With fixed shelving, every row needs its own aisle. Mounting the same shelving on mobile carriages lets the rows share a single moving aisle, so the same footprint holds up to twice the storage, or the same storage fits in half the space.</p>
    <div class="duo">
      <div class="panel">
        <h3>Conventional fixed shelving</h3>
        ${SVG_FIXED}
        <p>Every row needs its own access aisle, so more than half the floor is air.</p>
      </div>
      <div class="panel">
        <h3>O'Brien high-density mobile <span class="badge">2&times; capacity</span></h3>
        ${SVG_MOBILE}
        <p>Carriages glide on rails to open one aisle where you need it. The rest of the floor works for you.</p>
      </div>
    </div>
    <div class="ba">
      <div class="ba-frame">
        ${SVG_FIXED_BA}
        <div class="ba-top">${SVG_MOBILE_BA}</div>
        <div class="ba-handle" style="left:50%"><span>&#8249;&nbsp;&#8250;</span></div>
        <span class="ba-lbl l">Fixed &middot; 4 rows</span>
        <span class="ba-lbl r">Mobile &middot; 8 rows</span>
        <input class="ba-range" type="range" min="0" max="100" value="50" aria-label="Compare fixed shelving with high-density mobile on the same floor">
      </div>
      <p><b>Drag the divider.</b> Same floor: four rows fixed, or eight rows on mobile carriages.</p>
    </div>
  </div>
</section>

<section class="block" id="industry-showcase">
  <div class="wrap">
    <div class="sec-head">
      <div>
        <span class="eyebrow">Industries</span>
        <h2>Built around <em>your work</em></h2>
        <p class="lead">Twelve industries. Twelve definitions of storage. Pick yours and see how we solve them.</p>
      </div>
      <a class="btn btn-solid" href="industries.html">All Industries</a>
    </div>
    <div class="showcase">
      <div class="sc-list">
        ${INDUSTRIES.map((i,idx)=>`<a class="sc-item${idx===0?' on':''}" href="${i.slug}.html" data-img="${i.img}" data-name="${i.name}" data-short="${i.short}">${i.name}</a>`).join('\n        ')}
      </div>
      <a class="sc-stage" href="${INDUSTRIES[0].slug}.html">
        <div class="sc-img a" style="background-image:url('${INDUSTRIES[0].img}')"></div>
        <div class="sc-img b hide"></div>
        <div class="sc-cap"><span class="k">${INDUSTRIES[0].name}</span><div class="t">${INDUSTRIES[0].short}.</div><span class="go">Explore &rarr;</span></div>
      </a>
    </div>
  </div>
</section>

<section class="block projects-bg" id="services" >
  <div class="wrap">
    <span class="eyebrow">Working With Us</span>
    <h2>From walkthrough to <em>working storage</em></h2>
    <p class="lead">Buying storage isn't buying steel. It's buying a plan. Here's how we run every project, whether it's one evidence room or a whole facility.</p>
    <div class="steps">
      <div class="step"><span class="n">01 &middot; FREE ASSESSMENT</span><h3>${SRT('as&middot;sess','v.')}</h3><p>We walk your space, measure what you store, and find a solution to provide as much capacity as possible.</p></div>
      <div class="step"><span class="n">02 &middot; DESIGN</span><h3>${SRT('de&middot;sign','v.')}</h3><p>Drawings, equipment load data, and an itemized quote, matched to the right manufacturer line.</p></div>
      <div class="step"><span class="n">03 &middot; INSTALL</span><h3>${SRT('in&middot;stall','v.')}</h3><p>Our own crews deliver and install all equipment, coordinated around your operating hours.</p></div>
      <div class="step"><span class="n">04 &middot; SUPPORT</span><h3>${SRT('sup&middot;port','v.')}</h3><p>Maintenance, reconfiguration, teardown and moves, even for systems we didn't originally supply.</p></div>
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
const SITE_JS = `document.documentElement.classList.add('js');
// card and banner photos arrive as they scroll near (data-bg), so a page shows up fast and scrolls light
(function(){
  var els = document.querySelectorAll('[data-bg]'); if (!els.length) return;
  var show = function(el){ el.style.backgroundImage = "url('" + el.getAttribute('data-bg') + "')"; el.removeAttribute('data-bg'); };
  if (!('IntersectionObserver' in window)) { els.forEach(show); return; }
  var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } }); }, { rootMargin: '500px' });
  els.forEach(function(el){ io.observe(el); });
})();
(function(){
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hdr = document.querySelector('header');
  addEventListener('scroll', function(){ if (hdr) hdr.classList.toggle('scrolled', scrollY > 8); }, {passive:true});
  if (reduce || !('IntersectionObserver' in window)) return;

  /* scroll-reveal: fade-up as tiles enter the viewport */
  var els = document.querySelectorAll('.card,.dlc,.steps>div,.stats .grid>div,.sb-badge,.gallery img,.ccard,.team>div');
  els.forEach(function(el,i){ el.classList.add('rv'); el.style.transitionDelay = Math.min((i%6)*60,300)+'ms'; });
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (!e.isIntersecting) return;
      var el = e.target;
      el.classList.add('in');
      io.unobserve(el);
      /* hand transforms back to the hover styles once the reveal finishes */
      setTimeout(function(){ el.classList.remove('rv','in'); el.style.transitionDelay=''; }, 1000);
    });
  }, {rootMargin:'0px 0px -8% 0px', threshold:.08});
  els.forEach(function(el){ io.observe(el); });

  /* count-up on numeric stats */
  document.querySelectorAll('.stats b').forEach(function(b){
    var txt = b.textContent.trim();
    if (!/^\\d{1,4}$/.test(txt)) return;
    var target = parseInt(txt,10), done = false;
    var cio = new IntersectionObserver(function(es){
      es.forEach(function(e){
        if (!e.isIntersecting || done) return;
        done = true; cio.disconnect();
        var t0 = performance.now(), dur = 1100;
        (function tick(now){
          var p = Math.min(((now||performance.now())-t0)/dur, 1);
          p = 1-Math.pow(1-p,3);
          b.textContent = Math.round(target*p);
          if (p<1) requestAnimationFrame(tick);
        })(t0);
      });
    }, {threshold:.6});
    cio.observe(b);
  });
})();

/* mobile menu */
(function(){
  var burger = document.querySelector('.burger'), panel = document.getElementById('mnav');
  if (!burger || !panel) return;
  burger.addEventListener('click', function(){
    var open = panel.classList.toggle('open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
})();

/* before/after compare slider */
(function(){
  var frame = document.querySelector('.ba-frame');
  if (!frame) return;
  var range = frame.querySelector('.ba-range'), top = frame.querySelector('.ba-top'), handle = frame.querySelector('.ba-handle');
  var set = function(v){
    top.style.clipPath = 'inset(0 0 0 ' + v + '%)';
    handle.style.left = v + '%';
  };
  range.addEventListener('input', function(){ set(range.value); });
  set(range.value);
  /* one-time damped wobble when the slider first scrolls into view: a drag hint */
  var userTouched = false;
  range.addEventListener('pointerdown', function(){ userTouched = true; }, {once:true});
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
    var hinted = false;
    var hio = new IntersectionObserver(function(es){
      es.forEach(function(e){
        if (!e.isIntersecting || hinted) return;
        hinted = true; hio.disconnect();
        var t0 = null, D = 1800;
        (function tick(now){
          if (userTouched) { set(range.value); return; }
          if (!t0) t0 = now || performance.now();
          var p = Math.min(((now || performance.now()) - t0) / D, 1);
          var v = 50 + Math.sin(p * Math.PI * 2) * 15 * (1 - p);
          range.value = v; set(v);
          if (p < 1) requestAnimationFrame(tick); else { range.value = 50; set(50); }
        })();
      });
    }, {threshold:.65});
    hio.observe(frame);
  }
})();

/* industry showcase */
(function(){
  var list = document.querySelector('.sc-list');
  if (!list) return;
  var items = [].slice.call(list.querySelectorAll('.sc-item'));
  var stage = document.querySelector('.sc-stage');
  var imgA = stage.querySelector('.sc-img.a'), imgB = stage.querySelector('.sc-img.b');
  var capK = stage.querySelector('.sc-cap .k'), capT = stage.querySelector('.sc-cap .t');
  var front = imgA, back = imgB, current = 0, interacted = false, timer = null;
  items.forEach(function(a){ new Image().src = a.dataset.img; });
  function show(idx){
    if (idx === current) return;
    current = idx;
    var a = items[idx];
    items.forEach(function(x,i){ x.classList.toggle('on', i===idx); });
    back.style.backgroundImage = "url('" + a.dataset.img + "')";
    back.classList.remove('hide');
    front.classList.add('hide');
    var t = front; front = back; back = t;
    capK.textContent = a.dataset.name;
    capT.textContent = a.dataset.short + '.';
    stage.href = a.href;
  }
  items.forEach(function(a, idx){
    a.addEventListener('mouseenter', function(){ interacted = true; stopAuto(); show(idx); });
    a.addEventListener('focus', function(){ interacted = true; stopAuto(); show(idx); });
    a.addEventListener('touchstart', function(){ interacted = true; stopAuto(); }, {passive:true});
  });
  function stopAuto(){ if (timer) { clearInterval(timer); timer = null; } }
  /* gentle auto-advance until the visitor takes over; skipped for reduced motion */
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){
        if (e.isIntersecting && !interacted && !timer) {
          timer = setInterval(function(){ show((current + 1) % items.length); }, 3500);
        } else if (!e.isIntersecting) { stopAuto(); }
      });
    }, {threshold:.4});
    io.observe(stage);
  }
})();
`;
fs.mkdirSync(path.join(OUT,'assets'), {recursive:true});
fs.writeFileSync(path.join(OUT,'assets','style.css'), CSS + X.CSS + X.CSS3D + G.CSS + W.CSS);
fs.writeFileSync(path.join(OUT,'assets','site.js'), SITE_JS);

const pages = {
  'index.html': shell(`O'Brien Systems | Custom Storage Solutions | Design Concept`, IMGS.heroHome, homeBody + X.home3d()),
  'showroom.html': X.showroomPage(shell, IMGS.banMobile),
  'service.html': X.servicePage(shell, IMGS.banServices),
  '404.html': X.notFound(shell, IMGS.heroHome),
  'solutions.html': solutionsHub,
  'industries.html': industriesHub,
  'services.html': servicesPage,
  'about.html': aboutPage,
  'contact.html': contactPage,
  'blog.html': blogPage,
  'resources.html': resourcesPage,
};

for (const s of SOLUTIONS) {
  const d = SOLUTION_PAGES[s.slug];
  pages[`${s.slug}.html`] = subpage({ ...d, extra:(d.extra||'') + G.extra(s.slug, s.name, 'solution'), faqs:[...(d.faqs||[]), ...G.faqs(s.slug)], slug:s.slug, name:s.name, img:s.img, banner:s.banner, hub:'solutions', hubName:'Solutions' });
}
for (const p of PRODUCTS) {
  const d = PRODUCT_PAGES[p.slug];
  pages[`${p.slug}.html`] = subpage({ ...d, extra:(d.extra||'') + G.extra(p.slug, p.name, 'product'), faqs:[...(d.faqs||[]), ...G.faqs(p.slug)], slug:p.slug, name:p.name, img:p.img, banner:p.banner, hub:'solutions', hubName:'Solutions' });
}
for (const i of INDUSTRIES) {
  const d = INDUSTRY_PAGES[i.slug];
  pages[`${i.slug}.html`] = subpage({ ...d, extra:(d.extra||'') + guideCallout(i.slug, i.name) + G.extra(i.slug, i.name, 'industry'), faqs:[...(d.faqs||[]), ...G.faqs(i.slug)], slug:i.slug, eyebrow:'Industries', name:i.name, img:i.img, banner:i.banner, hub:'industries', hubName:'Industries' });
}
BLOG.forEach((p, idx) => { pages[`post-${p.slug}.html`] = postPage(p, idx); });
pages['storage-questions.html'] = G.answersPage(shell, IMGS.heroHome);
Object.assign(pages, W.pages(shell, IMGS.heroHome));
Object.assign(pages, require('./team')({ shell, IMGS, SR, SRDATA, X }));
pages['about.html'] = pages['about.html'].replace('<div class="cta" id="contact">', G.aboutMap().replace('</figure>', '</figure>\n  <p class="gx-more"><a href="where-we-work.html">See every region we work in</a></p>') + '<div class="cta" id="contact">');

let n = 0;
for (const [file, html] of Object.entries(pages)) {
  // copy rules are enforced here: the build fails rather than publish a violation
  const bad = [/\u2014/, /&mdash;/, /nationwide/i].find(re => re.test(html.replace(/<script[\s\S]*?<\/script>/g, '')));
  if (bad) throw new Error(`${file}: copy rule violation (${bad})`);
  fs.writeFileSync(path.join(OUT, file), X.lazyMedia(X.enrich(file, X.with3d(X.photos(file, html), VER))));
  n++;
}
// industry guides: guides/<slug>/index.html plus the hub (guides.js)
fs.appendFileSync(path.join(OUT, 'assets', 'style.css'), GD.guideCss);
for (const p of GD.allPages(shell, { X, VER })) { fs.mkdirSync(path.join(OUT, path.dirname(p.path)), { recursive: true }); fs.writeFileSync(path.join(OUT, p.path), p.html); pages[p.path] = p.html; n++; }
// customer presentations: unlisted, never in the sitemap
{ const names = Object.fromEntries([...SOLUTIONS, ...PRODUCTS, ...INDUSTRIES].map(p => [p.slug, p.name]));
  for (const [file, html] of Object.entries(X.presentPages(VER, IMGS.logo, names))) fs.writeFileSync(path.join(OUT, file), html); }
// pages retired from the site: clear any stale copies so nothing links or serves them
for (const f of ['projects.html', 'partners.html']) fs.rmSync(path.join(OUT, f), { force: true });
// renamed or merged pages keep their old address working (Cloudflare also gets _redirects at deploy)
const MOVED = { 'design-specify.html': 'architects-designers.html', 'fireproof-cabinets.html': 'fire-rated-cabinets.html' };
for (const [from, to] of Object.entries(MOVED)) {
  fs.writeFileSync(path.join(OUT, from), `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="robots" content="noindex, nofollow"><title>Moved | O'Brien Systems</title>
<link rel="canonical" href="${to}"><meta http-equiv="refresh" content="0; url=${to}"></head>
<body><p>This page moved to <a href="${to}">${to}</a>.</p></body></html>
`);
}
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), X.sitemap(Object.keys(pages)));
fs.writeFileSync(path.join(OUT, 'robots.txt'), X.ROBOTS);
{ // chat-config.js: obriensys.com path <-> redesign page, so answers link here and prompts fit each page
  const files = fs.readdirSync(OUT).filter(f => f.endsWith('.html'));
  const ALIAS = { 'museum-storage': 'museums.html', 'contact-us': 'contact.html', 'about-us': 'about.html', '': 'index.html' };
  const toLocal = {}; // obriensys slug -> redesign file
  for (const f of files) { const slug = f.replace(/\.html$/, '').replace(/^post-/, ''); if (slug !== 'index') toLocal[slug] = f; }
  Object.assign(toLocal, ALIAS);
  const PRODUCT = ["four-post-shelving","wire-shelving","cantilever-shelving","bin-storage","pallet-rack","mezzanines","wire-partitions","evidence-lockers","weapons-storage","athletic-storage","rotary-cabinets","fire-rated-cabinets","wardrobe-cabinets","museum-cabinets","art-screens","mail-sorters","high-density-mobile-storage","lifts-carousels","lockers","static-shelving","cabinets","modular-casework","solutions"];
  const INDUSTRY = ["museums","libraries","education","athletics","government-public-safety","military","pharmaceutical-healthcare","corporate-legal","retail","automotive","material-handling-warehouse","vertical-farming","general-contractors","architects-designers","industries"];
  const cfg = `// generated by build.js: connects this site to the O'Brien website assistant
(function () {
  var toLocal = ${JSON.stringify(toLocal)};
  var fromLocal = {}; for (var k in toLocal) fromLocal[toLocal[k]] = k;
  var PRODUCT = ${JSON.stringify(PRODUCT)}, INDUSTRY = ${JSON.stringify(INDUSTRY)};
  function file() { var f = location.pathname.split('/').pop(); return f || 'index.html'; }
  window.__obsChat = {
    api: ${JSON.stringify(CHAT_API)},
    pagePath: function () { var f = file(); var slug = f === 'index.html' ? '' : (fromLocal[f] !== undefined ? fromLocal[f] : f.replace(/\\.html$/, '')); return slug ? '/' + slug + '/' : '/'; },
    pageKind: function () { var f = file(); if (/^post-/.test(f)) return 'blog'; if (f === 'blog.html') return 'blog-list'; if (f === 'contact.html') return 'contact'; var s = f.replace(/\\.html$/, ''); if (PRODUCT.indexOf(s) >= 0) return 'product'; if (INDUSTRY.indexOf(s) >= 0) return 'industry'; if (f === 'index.html') return 'home'; return undefined; },
    mapLink: function (p) { var slug = p.replace(/^\\/|\\/$/g, '').split('/').pop(); return toLocal[slug] || ('https://obriensys.com' + p); }
  };
})();
`;
  fs.writeFileSync(path.join(OUT, 'assets', 'chat-config.js'), cfg);
}
console.log(`wrote ${n} pages + assets/style.css (blog posts: ${BLOG.length})`);
