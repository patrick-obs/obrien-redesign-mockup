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
const A = require('./apple'); // Oct 2026 reskin: Apple-style design system, nav, motion and page transitions
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

/* ---------------- shared CSS: the Apple-style design system lives in apple.js ---------------- */
const CSS = A.CSS;

/* ---------------- site data ---------------- */
const SOLUTIONS = [
  { slug:'high-density-mobile-storage', name:'High-Density Mobile Storage', short:'Compact aisles, double your capacity in the same footprint', img:IMGS.hdLibrary, banner:IMGS.banMobile },
  { slug:'lifts-carousels', name:'Lifts & Carousels (VLM)', short:'Automated vertical storage and retrieval, goods to person', img:IMGS.liftsCard, banner:IMGS.banLifts },
  { slug:'lockers', name:'Lockers', short:'Smart, evidence, athletic and personal storage lockers', img:IMGS.lockersCard, banner:IMGS.banLockers },
  { slug:'static-shelving', name:'Static Shelving', short:'4-post, pallet rack, cantilever and industrial shelving', img:IMGS.shelvCard, banner:IMGS.banShelving },
  { slug:'cabinets', name:'Cabinets', short:'Lateral, rotary and museum-grade cabinet storage', img:IMGS.cabMuseum, banner:IMGS.banCabinets },
  { slug:'modular-casework', name:'Modular Casework', short:'Reconfigurable laminate and steel casework and lab furniture', img:IMGS.cwLam, banner:IMGS.banCasework },
];

/* specific product pages, grouped under the six families above */
const PRODUCTS = [
  { slug:'four-post-shelving', name:'4-Post Shelving', short:'The workhorse: open steel shelving that adjusts, grows, and can go mobile later', img:IMGS.p4post, banner:IMGS.banShelving, group:'Shelving' },
  { slug:'wire-shelving', name:'Wire Shelving', short:'Open-wire shelving and carts for healthcare, food service, and cleanrooms', img:IMGS.wireRack, banner:IMGS.banShelving, group:'Shelving' },
  { slug:'cantilever-shelving', name:'Cantilever & Library Shelving', short:'Post-free faces for books, media, and long or awkward loads', img:IMGS.lancaster3, banner:IMGS.banShelving, group:'Shelving' },
  { slug:'bin-storage', name:'Bin & Parts Storage', short:'Totes, bins, and small-parts organization that keeps picking fast', img:IMGS.evidence, banner:IMGS.banShelving, group:'Shelving' },
  { slug:'pallet-rack', name:'Pallet Rack', short:'Selective, cantilever, and specialty racking, even rack on mobile carriages', img:IMGS.mhwCard, banner:IMGS.banWarehouse, group:'Industrial & Warehouse' },
  { slug:'mezzanines', name:'Mezzanines & Platforms', short:'Structural steel work platforms that add a floor without building one', img:IMGS.shelvCard, banner:IMGS.banWarehouse, group:'Industrial & Warehouse' },
  { slug:'wire-partitions', name:'Wire Partitions & Cages', short:'Tool cribs, DEA cages, and secure enclosures inside your existing walls', img:IMGS.wcCage, banner:IMGS.banWarehouse, group:'Industrial & Warehouse' },
  { slug:'evidence-lockers', name:'Evidence Lockers', short:'Pass-through chain-of-custody deposit lockers and refrigerated evidence', img:IMGS.lockerEvidence, banner:IMGS.banLockers, group:'Lockers & Security' },
  { slug:'weapons-storage', name:'Weapons & Gun Storage', short:'Armory racks and cabinets for law enforcement and military', img:IMGS.weapons1, banner:IMGS.banLockers, group:'Lockers & Security' },
  { slug:'athletic-storage', name:'Athletic Equipment Storage', short:'Team gear rooms on mobile carriages: helmets, pads, and sticks in half the space', img:IMGS.montelWisconsin, banner:IMGS.montelFAU, group:'Lockers & Security' },
  { slug:'rotary-cabinets', name:'Rotary Cabinets', short:'Two cabinets in one footprint: spin the core, lock it flush at night', img:IMGS.cabRotary, banner:IMGS.banCabinets, group:'Cabinets & Filing' },
  { slug:'fireproof-cabinets', name:'Fireproof & Safety Cabinets', short:'Fire-rated record protection and code-compliant safety storage', img:IMGS.lateralTh, banner:IMGS.banCabinets, group:'Cabinets & Filing' },
  { slug:'wardrobe-cabinets', name:'Wardrobe & Uniform Cabinets', short:'Garment, uniform, and gear cabinets for staff and crew spaces', img:IMGS.tennscoWardrobe, banner:IMGS.banCabinets, group:'Cabinets & Filing' },
  { slug:'museum-cabinets', name:'Museum Cabinets', short:'Sealed, conservation-grade cabinets for collections and specimens', img:IMGS.museumCabs, banner:IMGS.banMuseum, group:'Museum & Archival' },
  { slug:'art-screens', name:'Art Screens & Racks', short:'Mobile, pull-out, and wall-mounted screens for framed works', img:IMGS.hdmsArtScreen, banner:IMGS.banMuseum, group:'Museum & Archival' },
  { slug:'mail-sorters', name:'Mail Sorters & Mailroom', short:'Sort modules and mail center casework matched to your daily volume', img:IMGS.hamMailroom, banner:IMGS.banCasework, group:'Casework & Mailroom' },
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
  { slug:'general-contractors', name:'GCs, Architects & Owners', short:'Division 10 storage scope, submittals through punch list', img:IMGS.installer, banner:IMGS.gcProject },
];

/* ---------------- partials ---------------- */
const regionName = (r) => (r.short === 'Rest of Pennsylvania' ? 'Pennsylvania' : r.short === 'Philadelphia area' ? 'Philadelphia' : r.name);
const regionLinks = W.REGIONS.map(r => [regionName(r), W.file(r.slug)]);
const pick = (group) => PRODUCTS.filter(p => p.group === group).map(p => [p.name, `${p.slug}.html`]);
const NAV = {
  items: [['Solutions', 'solutions.html', 'sol'], ['Industries', 'industries.html', 'ind'], ['Services', 'services.html', 'svc'], ['Specify', 'design-specify.html'],
    ['3D Showroom', 'showroom.html'], ['Where We Work', 'where-we-work.html', 'where'], ['About', 'about.html', 'about'], ['Blog', 'blog.html'], ['Contact', 'contact.html']],
  flies: {
    sol: [['Explore Solutions', [...SOLUTIONS.map(s => [s.name, `${s.slug}.html`]), ['All solutions', 'solutions.html']], true],
      ['Shelving & Industrial', [...pick('Shelving'), ...pick('Industrial & Warehouse')]],
      ['Security, Cabinets & Collections', [...pick('Lockers & Security'), ...pick('Cabinets & Filing'), ...pick('Museum & Archival'), ...pick('Casework & Mailroom')]],
      ['See It First', [['3D Showroom', 'showroom.html'], ['Storage questions', 'storage-questions.html'], ['Brochures', 'resources.html']]]],
    ind: [['Explore Industries', INDUSTRIES.slice(0, 6).map(i => [i.name, `${i.slug}.html`]), true],
      ['More Industries', [...INDUSTRIES.slice(6).map(i => [i.name, `${i.slug}.html`]), ['All industries', 'industries.html']]],
      ['Plan a Project', [['Design & Specify', 'design-specify.html'], ['Where We Work', 'where-we-work.html'], ['Free space assessment', 'contact.html?topic=assessment']]]],
    svc: [['Explore Services', [['Services', 'services.html'], ['Request service', 'service.html'], ['Free space assessment', 'contact.html?topic=assessment'], ['Request a quote', 'contact.html?topic=quote']], true],
      ['For Architects & Contractors', [['Design & Specify', 'design-specify.html'], ['GCs, Architects & Owners', 'general-contractors.html'], ['CAD and Revit', 'contact.html?topic=cad']]],
      ['Get Help', [['610.825.3405', 'tel:6108253405'], ['sales@obriensys.com', 'mailto:sales@obriensys.com'], ['Storage questions', 'storage-questions.html']]]],
    where: [['Where We Work', regionLinks.slice(0, 5), true],
      ['More Regions', [...regionLinks.slice(5), ['All regions', 'where-we-work.html']]],
      ['Headquarters', [['739 E. Elm Street, Conshohocken, PA', 'https://www.google.com/maps?q=739+E+Elm+Street+Conshohocken+PA+19428'], ['610.825.3405', 'tel:6108253405']]]],
    about: [[`About O'Brien`, [['About us', 'about.html'], ['Where We Work', 'where-we-work.html'], ['Blog', 'blog.html'], ['Contact', 'contact.html']], true],
      ['Resources', [['Brochures & downloads', 'resources.html'], ['Storage questions', 'storage-questions.html'], ['3D Showroom', 'showroom.html']]],
      ['Reach Us', [['610.825.3405', 'tel:6108253405'], ['sales@obriensys.com', 'mailto:sales@obriensys.com'], ['Facebook', 'https://www.facebook.com/OBrienSystems/']]]],
  },
  quick: [['Get a quote', 'contact.html?topic=quote'], ['Book a free space assessment', 'contact.html?topic=assessment'], ['Request service', 'service.html'], ['3D Showroom', 'showroom.html'], ['Where We Work', 'where-we-work.html'], ['Storage questions', 'storage-questions.html']],
  ribbon: `Free on-site space assessment. <a class="lnk" href="contact.html?topic=assessment">Schedule yours</a>`,
};
const HEADER = A.header(NAV);

const CTA = `
<div class="cta" id="contact">
  <div class="wrap">
    <span class="eyebrow">Free space assessment</span>
    <h2>See how much space you're sitting on.</h2>
    <p>We'll measure, plan and show you the options. No obligation, no generic quotes.</p>
    <div class="ctas"><a class="btn btn-solid btn-lg" href="contact.html?topic=assessment">Schedule a free assessment</a><a class="lnk" href="tel:6108253405">Call 610.825.3405</a></div>
    <p class="addr">739 E. Elm Street, Conshohocken, PA 19428</p>
    <p class="cert"><svg class="keystone-sm" viewBox="0 0 100 100" aria-hidden="true"><path d="M35 4 H65 V19 H96 L83 96 H60 V80 H40 V96 H17 L4 19 H35 Z" fill="#e8a33d"/></svg>${SB_CERT}</p>
  </div>
</div>`;

const FOOTER = A.footer({
  notes: [`Design concept. Internal mockup, not the live O'Brien Systems website.`,
    `We supply complete equipment loading data and work with your structural engineer of record, who makes every floor and structural determination.`],
  cols: [
    [['Solutions', [...SOLUTIONS.map(s => [s.name, `${s.slug}.html`]), ['All solutions', 'solutions.html']]]],
    [['Industries', INDUSTRIES.map(i => [i.name, `${i.slug}.html`])]],
    [['Where We Work', [...regionLinks, ['All regions', 'where-we-work.html']]]],
    [['Services', [['Services', 'services.html'], ['Request service', 'service.html'], ['Design & Specify', 'design-specify.html'], ['3D Showroom', 'showroom.html']]],
      ['Resources', [['Brochures & downloads', 'resources.html'], ['Storage questions', 'storage-questions.html'], ['Blog', 'blog.html']]]],
    [[`O'Brien Systems`, [['About us', 'about.html'], ['Contact', 'contact.html'], ['Facebook', 'https://www.facebook.com/OBrienSystems/']]],
      ['Talk to Us', [['610.825.3405', 'tel:6108253405'], ['sales@obriensys.com', 'mailto:sales@obriensys.com'], ['Free space assessment', 'contact.html?topic=assessment']]]],
  ],
  more: `More ways to reach us: call <a href="tel:6108253405">610.825.3405</a>, email <a href="mailto:sales@obriensys.com">sales@obriensys.com</a>, or visit us at 739 E. Elm Street, Conshohocken, PA 19428.`,
  legal: `<span>Copyright &copy; 2026 O'Brien Systems. All rights reserved.</span><span><a href="#">Privacy Policy</a><a href="#">Accessibility</a><a href="sitemap.xml">Site Map</a><a href="storage-questions.html">Storage Questions</a></span>`,
});

// every inner page gets a sticky local nav (its title and one action); the home page keeps the global nav sticky instead
const shell = (title, heroImgUrl, body, opt = {}) => {
  const home = !!opt.home;
  const ln = home ? '' : (opt.ln || A.localNav(opt.lnTitle || title.split(' | ')[0], [], ['Free assessment', 'contact.html?topic=assessment']));
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<title>${title}</title>
<script>document.documentElement.classList.add('js')</script>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400..700&amp;display=swap">
<link rel="stylesheet" href="assets/style.css?v=${VER}">
<script src="assets/site.js?v=${VER}" defer></script>
<script src="assets/chat-config.js?v=${VER}"></script>
<script type="module" src="${CHAT_API}/_chat/embed.js"></script>
<style>:root{--hero-img:url('${heroImgUrl}')}</style>
</head>
<body class="${home ? 'home' : 'inner'}">
${HEADER}
<main id="main">
${ln}
${body}
</main>
${CTA}
${FOOTER}
</body>
</html>
`;
};

// the first sentence or two of a page becomes the big statement; the rest reads as body copy
function statement(paras) {
  const ps = [...(paras || [])];
  if (!ps.length) return ['', []];
  const first = ps.shift();
  if (/</.test(first)) return [first, ps];
  const sentences = first.split(/(?<=[.!?])\s+(?=[A-Z0-9"'])/);
  const out = [];
  const words = (t) => t.split(/\s+/).length;
  while (sentences.length && (!out.length || (words(out.join(' ')) < 24 && words(out.join(' ')) + words(sentences[0]) <= 40))) out.push(sentences.shift());
  const rest = sentences.join(' ').trim();
  return [out.join(' '), rest ? [rest, ...ps] : ps];
}

/* subpage skeleton: hero, overview statement, highlights, details, 3D, questions */
function subpage(p) {
  const feats = (p.features||[]).map(f=>`<div><b>${f[0]}</b><span>${f[1]}</span></div>`).join('\n      ');
  const gal = (p.gallery||[]).map(g=>`\n      <div class="g" style="background-image:url('${g}')"></div>`).join('');
  const chips = (p.related||[]).map(r=>`<a href="${r.slug}.html">${r.name}</a>`).join('\n      ');
  const faqs = (p.faqs||[]).map(f=>`<details><summary>${f[0]}</summary><p>${f[1]}</p></details>`).join('\n      ');
  const [big, rest] = statement(p.paras);
  const v3d = p.slug ? X.viewer3d(p.slug, p.name) : '';
  const extra = (p.extra || '') + (p.slug ? X.specPanel(p.slug, p.name, BROCHURES) : '');
  const quote = p.hub === 'industries' ? ['Free assessment', 'contact.html?topic=assessment'] : ['Get a quote', `contact.html?topic=quote&amp;product=${p.slug}`];
  const links = [['overview', 'Overview'], ['highlights', 'Highlights'], extra.trim() ? ['details', 'Details'] : null, v3d ? ['explore-3d', '3D'] : null, faqs ? ['faq', 'Questions'] : null].filter(Boolean);
  const name = p.name.replace(/\s*\(VLM\)/, '');
  return shell(`${p.name} | O'Brien Systems`, p.sideImg || p.img, `
<section class="page-hero" id="top">
  <div class="wrap crumbs"><a href="index.html">Home</a> / <a href="${p.hub}.html">${p.hubName}</a> / ${p.name}</div>
  <div class="ph-text">
    <span class="eyebrow">${p.eyebrow.split(" / ").pop()}</span>
    <h1>${p.h1}</h1>
    <p>${p.lead}</p>
    <div class="ph-ctas"><a class="btn btn-solid" href="${quote[1]}">${quote[0]}</a>${v3d ? '<a class="lnk" href="#explore-3d">Explore in 3D</a>' : '<a class="lnk" href="#overview">Learn more</a>'}</div>
  </div>
  <div class="ph-media" data-scroll="zoom"><div class="ph-img" role="img" aria-label="${name}"></div></div>
</section>
<section class="block" id="overview">
  <div class="wrap narrow"><p class="hl-text" data-scroll="hl">${big}</p></div>
  <div class="wrap ov-grid">
    ${rest.length ? `<div class="body">\n      ${rest.map(t=>`<p>${t}</p>`).join('\n      ')}\n    </div>` : ''}
    <div class="side-img"><img src="${p.sideImg||p.img}" alt="${name}" loading="lazy"></div>
  </div>
</section>
<section class="block alt" id="highlights">
  <div class="wrap">
    <h2 class="sh sh-center">${name} at a glance.</h2>
    ${feats ? `<div class="feat">\n      ${feats}\n    </div>` : ''}
    <div class="gallery">${gal}\n    </div>
  </div>
</section>
${extra.trim() ? `<section class="block" id="details"><div class="wrap">
    ${extra}
</div></section>` : ''}
${v3d}
${faqs || chips ? `<section class="block${v3d ? ' alt' : ''}" id="faq"><div class="wrap">
    ${faqs ? `<div class="faq">\n      <h2>Questions, answered.</h2>\n      ${faqs}\n    </div>` : ''}
    ${chips ? `<div class="related">\n      <h2>${p.chipsTitle}</h2>\n      <div class="chips">\n      ${chips}\n      </div>\n    </div>` : ''}
</div></section>` : ''}`, { ln: A.localNav(name, links, quote) });
}

/* ---------------- page content ---------------- */
const relInd = (...slugs) => INDUSTRIES.filter(i=>slugs.includes(i.slug));
const relSol = (...slugs) => SOLUTIONS.filter(s=>slugs.includes(s.slug));
const relAny = (...slugs) => [...SOLUTIONS, ...PRODUCTS, ...INDUSTRIES].filter(x=>slugs.includes(x.slug));

const SOLUTION_PAGES = {
  'high-density-mobile-storage': {
    eyebrow:'Solutions', h1:'High-Density Mobile Storage',
    lead:'Shelving on rails compacts together and opens an aisle only where you need one. The same floor holds up to twice the storage, or the same storage in half the space.',
    sideImg: IMGS.hdArchive,
    paras:[
      `Fixed shelving wastes floor. Every row needs its own aisle, so in most storage rooms more than half the square footage is air. High-density mobile systems mount your shelving on carriages and rails, letting rows compact together and share a single moving aisle.`,
      `We plan, supply, and install mechanical-assist, powered electrical, and manual systems from several leading manufacturers. Drive choice depends on load, duty cycle, and who uses the space. Powered systems add safety sweeps and access control where the application calls for it.`,
      `Almost any 4-post shelving can ride on carriages, which means you can often reuse shelving you already own. We review rail layout and levelness during a free site assessment, provide complete equipment loading data for your structural engineer, and our own factory-trained crews handle the installation.`,
    ],
    features:[
      ['Mechanical-assist', 'Ergonomic handle drive for daily-access rooms of any size'],
      ['Powered electrical', 'Push-button aisles with safety sweeps for large or secure rooms'],
      ['Manual and low-profile', 'Simple, economical systems for smaller rooms and closets'],
      ['Reuse your shelving', 'Existing 4-post shelving can often be mounted on new carriages'],
    ],
    gallery:[IMGS.hdNemoursAisle, IMGS.hdNemoursWide, IMGS.hdGearRoom],
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
      `As an authorized dealer we handle the full project: throughput analysis, tray layout, controls and software integration, delivery, and commissioning. The lines we install cover standard lifts, slim units for tight footprints, and pallet handling.`,
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
      `We carry several locker lines, so the recommendation fits the use case rather than a single catalog. Layout, power and network rough-in coordination, and installation are all handled by our crews.`,
    ],
    features:[
      ['Smart lockers', 'Electronic assignment, audit trails, and parcel workflows'],
      ['Evidence lockers', 'Pass-through chain-of-custody deposit and retrieval'],
      ['Athletic lockers', 'Ventilated gear storage that survives the team room'],
      ['Personal and gear', 'Staff rooms, ready rooms, and industrial changing areas'],
    ],
    gallery:[IMGS.lockerEvidence, IMGS.agile2, IMGS.parcelLockers],
    chipsTitle:'Dig deeper into locker systems',
    related: relAny('evidence-lockers','weapons-storage','athletic-storage','wardrobe-cabinets','athletics','government-public-safety','education'),
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
    chipsTitle:'Dig deeper into shelving and racking',
    related: relAny('four-post-shelving','wire-shelving','cantilever-shelving','bin-storage','pallet-rack','mezzanines','wire-partitions'),
  },
  'cabinets': {
    eyebrow:'Solutions', h1:'Cabinets',
    lead:'Lateral and rotary file cabinets through museum-grade conservation cabinets. Secure, organized storage for the things that matter most.',
    sideImg: IMGS.museumCabs,
    paras:[
      `Cabinet storage covers a wide spectrum. On one end, lateral and rotary file cabinets organize active records in offices and file rooms. On the other, museum-grade cabinets protect textiles, specimens, and works on paper with sealed gaskets and conservation-safe finishes.`,
      `Flat file cabinets store maps, drawings, and oversized documents. Drawer and door cabinets organize parts and supplies in industrial settings. Visual storage cabinets put collections behind glass without giving up protection.`,
      `Cabinets also combine naturally with our other systems: cabinets ride on high-density carriages, sit under mezzanines, and mix with shelving in the same room plan.`,
    ],
    features:[
      ['Museum-grade', 'Sealed, conservation-safe cabinets for collections'],
      ['Lateral and rotary files', 'Active records storage for office environments'],
      ['Flat files', 'Maps, drawings, and oversized document storage'],
      ['Industrial cabinets', 'Drawer and door cabinets for parts and supplies'],
    ],
    gallery:[IMGS.flatFiles, IMGS.corpCabs, IMGS.cabMedia],
    chipsTitle:'Dig deeper into cabinet storage',
    related: relAny('rotary-cabinets','fireproof-cabinets','wardrobe-cabinets','museum-cabinets','art-screens','corporate-legal','museums'),
  },
  'modular-casework': {
    eyebrow:'Solutions', h1:'Modular Casework',
    lead:'Laminate and steel casework and lab furniture that installs fast, moves with your departments, and gets reconfigured instead of demolished.',
    sideImg: IMGS.cw3,
    paras:[
      `Traditional millwork is built in place and dies in place. Modular casework is factory-built, installs in days instead of weeks, and unbolts to move or reconfigure when the room's mission changes.`,
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
    chipsTitle:'Casework-driven applications',
    related: relAny('mail-sorters','pharmaceutical-healthcare','education','corporate-legal','government-public-safety'),
  },
};

const PRODUCT_PAGES = {
  'four-post-shelving': {
    eyebrow:'Solutions / Shelving', h1:'4-Post Shelving',
    lead:'The most versatile shelving made: four posts, adjustable steel shelves, and a catalog of dividers, drawers, doors, and bins that adapts it to almost anything you store.',
    sideImg: IMGS.boxedge,
    paras:[
      `4-post shelving is the backbone of most storage rooms we build. Shelves adjust on 1-inch centers, accessories turn open shelving into bin fronts, file storage, garment rods, or secured cabinets, and the same uprights carry everything from archive boxes to parts totes.`,
      `We carry several 4-post lines, in widths, depths, and gauges matched to the load instead of a one-size catalog. Open, closed, and slotted styles cover office, industrial, and records applications.`,
      `The quiet advantage: quality 4-post shelving can be mounted on mobile carriages later. Buy shelving that fits today, and when the room fills up, compact it instead of replacing it.`,
    ],
    features:[
      ['Adjustable everything', 'Shelves on 1-inch centers, plus dividers, bins, drawers, and doors'],
      ['Matched to the load', 'Widths, depths, and steel gauges specified per shelf load'],
      ['Mobile-ready', 'Can be mounted on carriages later for double the capacity'],
      ['Multiple lines carried', 'The right manufacturer specified per project'],
    ],
    gallery:[IMGS.p4post, IMGS.boxedge2, IMGS.openShelv],
    chipsTitle:'Related storage systems',
    related: relAny('high-density-mobile-storage','static-shelving','bin-storage','wire-shelving'),
  },
  'wire-shelving': {
    eyebrow:'Solutions / Shelving', h1:'Wire Shelving',
    lead:'Open-wire shelving lets air circulate, light pass through, and dust fall instead of collect. It is the standard for healthcare, food service, and cleanroom storage for a reason.',
    sideImg: IMGS.wireBlack,
    paras:[
      `Wire shelving earns its place anywhere hygiene, visibility, or airflow matter: pharmacies, sterile processing, kitchens, labs, and IT rooms. Open construction meets sanitation codes that solid shelving cannot, and contents stay visible from every angle.`,
      `As an authorized wire shelving dealer we spec the full range: chrome, epoxy-coated for wet or corrosive environments, antimicrobial finishes for clinical spaces, and polymer shelving that goes through the cart wash. Casters turn any unit into a transport cart.`,
      `Wire also rides on track: high-density wire shelving puts sterile supply or pharmacy storage on mobile carriages, keeping the airflow benefits while cutting the footprint.`,
    ],
    features:[
      ['Code-friendly', 'Open wire meets health-department and sterile-storage requirements'],
      ['Finish per environment', 'Chrome, epoxy, antimicrobial, and washable polymer'],
      ['Mobile options', 'Casters for carts, or carriages for high-density wire'],
      ['Quick-adjust', 'Shelves reposition without tools as needs change'],
    ],
    chipsTitle:'Where wire shelving works hardest',
    related: relAny('pharmaceutical-healthcare','material-handling-warehouse','bin-storage','four-post-shelving'),
  },
  'cantilever-shelving': {
    eyebrow:'Solutions / Shelving', h1:'Cantilever & Library Shelving',
    lead:'Shelves that hang from a central column instead of sitting between posts, leaving the whole face open. The standard for libraries, and the answer for long or awkward loads.',
    sideImg: IMGS.libShelves,
    paras:[
      `Library cantilever shelving presents books with nothing in the way: no front posts, easy re-shelving, and end panels and canopy tops that make storage furniture-grade. We install cantilever lines from our manufacturer partners in public, academic, and special libraries across the region.`,
      `The same principle scales up. Industrial cantilever rack stores pipe, lumber, trim, and anything else too long for pallet rack, on arms that adjust to the load.`,
      `Both versions can compact: cantilever shelving rides on mobile carriages, which is how a library adds a children's wing without adding a single square foot of stacks.`,
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
    lead:'Small parts lose more labor than big ones. Bin shelving, totes, and modular drawers keep thousands of SKUs findable in seconds instead of minutes.',
    sideImg: IMGS.quikLok,
    paras:[
      `Bin storage is organization at the SKU level: shelving with bin fronts, hanging totes, modular drawer cabinets with dividers, and carton-flow lanes for fast movers. The right mix depends on part size, pick frequency, and who is doing the picking.`,
      `We plan bin systems for parts rooms, evidence storage, pharmacies, and maintenance cribs, using bin shelving, modular drawer inserts, and industry-standard totes that match your existing containers.`,
      `Density multiplies when bins go vertical or mobile: drawer cabinets hold three times what open shelves do in the same footprint, and bin shelving on carriages or in a vertical lift module cuts the walk time on top of the space.`,
    ],
    features:[
      ['SKU-level organization', 'Bins, dividers, and labels sized to the part, not the shelf'],
      ['Modular drawers', 'Up to 3x the density of open shelving for small parts'],
      ['Standard totes', 'Systems planned around the containers you already use'],
      ['Compounds with mobile', 'Bin shelving rides on carriages or inside VLMs'],
    ],
    gallery:[IMGS.evidence, IMGS.storBox, IMGS.gpsCard],
    chipsTitle:'Related systems',
    related: relAny('lifts-carousels','four-post-shelving','automotive','material-handling-warehouse'),
  },
  'pallet-rack': {
    eyebrow:'Solutions / Industrial', h1:'Pallet Rack',
    lead:'Selective rack, cantilever rack, and specialty configurations, planned around your forklifts, your loads, and your building, and installed by our own crews.',
    sideImg: IMGS.palletNGA,
    paras:[
      `Pallet rack looks like a commodity until it is specified wrong. Beam capacity, upright gauge, row spacing, forklift aisle requirements, and anchoring all have to line up with how your operation actually runs, which is why we start every rack project with a walkthrough instead of a price list.`,
      `As an authorized rack dealer we quote selective rack, drive-in, push-back, and cantilever configurations, plus guarding and column protection. For unusual loads we have put pallet rack on mobile carriages, compacting bulk storage the same way file rooms compact.`,
      `Rack is regulated infrastructure: we prepare layout drawings, provide load and anchoring data for your permit set, and support your engineer of record on any structural questions. Capacity plaques and correct anchoring come standard with our installs.`,
    ],
    features:[
      ['Authorized rack dealer', 'Selective, drive-in, push-back, and cantilever rack'],
      ['Spec-first process', 'Beam, upright, and aisle sizing from a real walkthrough'],
      ['Permit-ready docs', 'Layout drawings and loading data for your permit set and engineer'],
      ['Rack on mobile', 'Bulk storage compacts on heavy-duty carriages'],
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
    lead:'A structural steel mezzanine adds a working floor inside the building you already own. It is the cheapest square footage you will ever buy.',
    sideImg: IMGS.mezzanine,
    paras:[
      `When the floor is full and the ceiling is not, a mezzanine turns cubic feet into square feet: storage above, operations below, no addition, no new roof. Work platforms, catwalks, and shelving-supported mezzanines all follow the same logic.`,
      `We represent a mezzanine manufacturer whose structural steel platforms arrive with stamped engineering from the manufacturer's licensed engineers. Our role is everything around that: measuring the space, planning what lives above and below, coordinating egress, rails, gates, and lighting, and installing the system.`,
      `Foundation and floor-slab evaluation belongs to your structural engineer of record. We supply complete point-load data from the manufacturer and work alongside your engineer so the decision is made with real numbers.`,
    ],
    features:[
      ['Manufacturer-engineered steel', 'Platforms delivered with stamped drawings'],
      ['Full coordination', 'Egress, gates, rails, decking, and lighting planned together'],
      ['Point-load data provided', 'Real numbers for your structural engineer of record'],
      ['Storage above and below', 'Often paired with shelving, rack, or lockers on both levels'],
    ],
    gallery:[IMGS.shelvCard, IMGS.mezz2, IMGS.midproject2],
    faqs:[
      ['Will my slab support a mezzanine?', 'That determination belongs to your structural engineer of record. We provide complete point-load and layout data from the manufacturer and assist with the evaluation, which is usually resolved early in design.'],
      ['Do mezzanines need a permit?', 'Almost always, yes. Manufacturer-stamped engineering plus our layout drawings typically cover what the permit set needs. We have been through the process with townships across the region.'],
    ],
    chipsTitle:'Related systems',
    related: relAny('material-handling-warehouse','pallet-rack','general-contractors','wire-partitions'),
  },
  'wire-partitions': {
    eyebrow:'Solutions / Industrial', h1:'Wire Partitions & Security Cages',
    lead:'Woven and welded wire enclosures put a locked, inspectable room anywhere inside your building: tool cribs, DEA cages, server enclosures, and evidence areas.',
    paras:[
      `A wire partition is security you can see through: sight lines for supervisors, airflow for sprinklers and HVAC, and a lockable perimeter that goes up in days on your existing slab. That combination is why cages remain the standard for tool cribs, controlled-substance storage, data floors, and landlord storage areas.`,
      `Regulated applications drive most of what we build. DEA-compliant cages for pharmaceutical distributors, evidence enclosures for public safety, and access-controlled server cages each carry their own mesh, ceiling, and locking requirements, and we spec to the regulation rather than the catalog page.`,
      `Panels are modular: partitions relocate, expand, and reconfigure as the operation changes, which no block wall will ever do.`,
    ],
    features:[
      ['Regulation-driven specs', 'DEA cages, evidence enclosures, and secure IT floors'],
      ['See-through security', 'Sight lines, sprinklers, and airflow stay intact'],
      ['Fast, clean install', 'Days on an existing slab, no trades, no dust walls'],
      ['Modular for life', 'Relocate and reconfigure panels as needs change'],
    ],
    extra:`<p class="note" style="margin-top:18px">Representative product photo courtesy of WireCrafters. Ask us for install references specific to your application.</p>`,
    chipsTitle:'Related systems',
    related: relAny('pallet-rack','mezzanines','government-public-safety','material-handling-warehouse'),
  },
  'evidence-lockers': {
    eyebrow:'Solutions / Public Safety', h1:'Evidence Lockers',
    lead:'Chain of custody starts at the deposit door. Pass-through evidence lockers make the transfer from officer to custodian physically incorruptible.',
    sideImg: IMGS.evidRoom,
    paras:[
      `A pass-through evidence locker has two faces: officers deposit through the front and the door locks behind the item; only the evidence custodian opens the rear. No shared keys, no gaps in the record, and with electronic control, a timestamped audit trail of every touch.`,
      `We plan evidence intake as a system: locker sizes mixed for phones, firearms, and bulk items, refrigerated compartments for biological evidence, and the high-density shelving and bin storage behind the wall where evidence lives long-term.`,
      `Departments across the region run intake rooms we designed. The same chain-of-custody logic serves crime labs, internal affairs, and any operation where possession has to be provable.`,
    ],
    features:[
      ['Pass-through design', 'Deposit locks behind the officer, opens only for the custodian'],
      ['Audit trails', 'Electronic locks log every deposit and retrieval'],
      ['Refrigerated options', 'Compliant cold storage for biological evidence'],
      ['Whole-room planning', 'Intake lockers plus the long-term storage behind them'],
    ],
    gallery:[IMGS.gun2, IMGS.gpsCard, IMGS.evidRoom],
    chipsTitle:'Related systems',
    related: relAny('government-public-safety','weapons-storage','lockers','bin-storage'),
  },
  'weapons-storage': {
    eyebrow:'Solutions / Public Safety', h1:'Weapons & Gun Storage',
    lead:'Armory storage for law enforcement and military: racks and cabinets that secure long guns and duty weapons while keeping issue and return fast and accountable.',
    sideImg: IMGS.gun3,
    paras:[
      `An armory has two jobs that pull against each other: keep weapons locked down, and get them issued fast at shift change. Purpose-built weapon racks solve both, with configurable cradles for long guns, drawers for sidearms and optics, and locking that ranges from key control to electronic audit.`,
      `We design armories for police departments, sheriff's offices, correctional facilities, and military units, drawing on several manufacturer lines. Racks mount in cabinets, on walls, or on mobile carriages when the weapons inventory outgrows the room.`,
      `Every layout is planned around your issue process and your accreditation requirements, and installed by our own background-checked crews, who are accustomed to working inside secure facilities.`,
    ],
    features:[
      ['Configurable cradles', 'Long guns, sidearms, optics, and less-lethal in one system'],
      ['Issue-speed layouts', 'Shift change moves fast without losing accountability'],
      ['Lock options', 'Key control through fully audited electronic access'],
      ['Secure-facility crews', 'Background-checked installers, comfortable in controlled areas'],
    ],
    gallery:[IMGS.weapons2, IMGS.gun1, IMGS.weapons1],
    chipsTitle:'Related systems',
    related: relAny('government-public-safety','military','evidence-lockers','lockers'),
  },
  'athletic-storage': {
    eyebrow:'Solutions / Athletics', h1:'Athletic Equipment Storage',
    lead:'Helmets, pads, sticks, and travel gear for a full roster, stored on mobile carriages in half the room, and looking like a program that recruits.',
    sideImg: IMGS.montelKnights,
    paras:[
      `Equipment rooms fail the same way everywhere: gear piled by season, no airflow, and a manager who is the only person who can find anything. Purpose-built athletic storage fixes all three, with ventilated compartments per player, custom cradles for helmets and sticks, and mobile carriages that compact the whole room.`,
      `As an authorized dealer we bring the same systems used by professional and college programs, including branded end panels that turn the equipment room into a recruiting stop.`,
      `For schools, the play is usually simpler: team room lockers, ventilated gear storage, and a compacted equipment room that gives the athletic department a floor back.`,
    ],
    features:[
      ['Per-player organization', 'Ventilated compartments sized to the sport'],
      ['Custom cradles', 'Helmets, sticks, bats, and pads each get a home'],
      ['Mobile compaction', 'The whole gear room on carriages, half the footprint'],
      ['Recruiting-grade finish', 'Branded end panels and team colors available'],
    ],
    gallery:[IMGS.montelSharks, IMGS.montelFAU, IMGS.montelWisconsin],
    chipsTitle:'Related systems',
    related: relAny('athletics','education','lockers','high-density-mobile-storage'),
  },
  'rotary-cabinets': {
    eyebrow:'Solutions / Cabinets', h1:'Rotary Cabinets',
    lead:'A rotary cabinet is two cabinets in one footprint: shelving on both sides of a core that spins, and locks flush into its shell at night.',
    sideImg: IMGS.rotary2,
    paras:[
      `The rotary cabinet is the most underrated piece of office storage made. A rotating core doubles the capacity of the floor space, both faces adjust independently for files, binders, or media, and a quarter turn closes the whole thing into a locked, flush steel shell.`,
      `That closing move is why records managers love them: end-tab filing, HR records, and medical charts stay open-shelf convenient all day and become a locked cabinet after hours, with no doors swinging into the aisle.`,
      `We configure rotaries as standalone units, in banks, and as add-on tiers that stack as records grow. Letter, legal, and media layouts mix freely within one cabinet.`,
    ],
    features:[
      ['Double-sided core', 'Twice the filing capacity in the same floor space'],
      ['Locks flush', 'A quarter turn secures everything behind steel'],
      ['Mixed media', 'Files, binders, media, and drawers in one unit'],
      ['Stackable tiers', 'Add capacity vertically as records grow'],
    ],
    chipsTitle:'Related systems',
    related: relAny('cabinets','corporate-legal','fireproof-cabinets','high-density-mobile-storage'),
  },
  'fireproof-cabinets': {
    eyebrow:'Solutions / Cabinets', h1:'Fireproof & Safety Cabinets',
    lead:'Some contents cannot be replaced and some cannot be allowed to burn. Fire-rated record cabinets and code-compliant safety cabinets cover both.',
    paras:[
      `Fire-rated cabinets protect what insurance cannot restore: original contracts, medical records, deeds, wills, and media. UL-rated construction holds interior temperature below the point where paper chars or media fails for the rated duration, and models range from vertical files to large lateral and media safes.`,
      `Safety cabinets solve the opposite problem: contents that are themselves the hazard. Flammable liquid cabinets, corrosives cabinets, and aerosol storage in code-mandated colors and construction keep shops, labs, and maintenance areas compliant with fire code and insurer requirements.`,
      `We help you size both correctly: what genuinely needs fire protection versus what needs ordinary secure storage, because a fire-rated cabinet costs several times a standard one and should hold only what earns the premium.`,
    ],
    features:[
      ['UL fire ratings', 'Rated protection for paper and media originals'],
      ['Code-compliant safety', 'Flammable, corrosive, and aerosol storage cabinets'],
      ['Right-sized advice', 'Fire-rate only what actually justifies the cost'],
      ['Formats for every record', 'Vertical, lateral, media, and data safes'],
    ],
    chipsTitle:'Related systems',
    related: relAny('cabinets','rotary-cabinets','corporate-legal','government-public-safety'),
  },
  'wardrobe-cabinets': {
    eyebrow:'Solutions / Cabinets', h1:'Wardrobe & Uniform Cabinets',
    lead:'Coats, uniforms, PPE, and personal gear need hanging space and a door that locks. Wardrobe cabinets do the job lockers are too small for.',
    paras:[
      `A wardrobe cabinet is the step between a locker and a closet: full-height hanging on one side, shelves on the other, and steel construction that survives a crew room. Standard uses run from staff coat storage in offices to uniform and turnout gear storage in stations and plants.`,
      `We spec wardrobe and storage cabinets in widths from single-user to shared bank configurations, with options for ventilation, sloped tops, bench bases, and electronic locks.`,
      `Combination units earn their keep in tight staff rooms: hanging bar, personal shelf, and lockable compartment in one cabinet footprint per person.`,
    ],
    features:[
      ['Full-height hanging', 'Coats, uniforms, and gear bags actually fit'],
      ['Combination layouts', 'Hanging, shelf, and locked storage per person'],
      ['Crew-proof steel', 'Welded construction, ventilation, sloped tops'],
      ['Lock options', 'Keyed, padlock hasp, or electronic'],
    ],
    chipsTitle:'Related systems',
    related: relAny('lockers','cabinets','corporate-legal','military'),
  },
  'museum-cabinets': {
    eyebrow:'Solutions / Museum', h1:'Museum Cabinets',
    lead:'Conservation-grade cabinets seal collections away from dust, pests, light, and swings in humidity, while keeping every specimen a drawer-pull away from research.',
    sideImg: IMGS.museumDrawers,
    paras:[
      `Museum cabinets are built to a different standard than office steel: powder coatings that off-gas nothing onto the collection, gasketed doors that hold a microclimate, and interiors configured with trays, drawers, and hanging systems per object type.`,
      `Drawing on several museum-grade cabinet lines, we outfit natural history, fine art, textile, and archival collections. Configurations cover entomology drawers, herbarium cases, textile rolling, framed storage, and oversized flat files.`,
      `Cabinets compound with compaction: conservation cabinets on mobile carriages are how collections double without new construction, a combination we have installed for museums and university collections across the region.`,
    ],
    features:[
      ['Conservation-grade', 'Inert finishes and gasketed microclimate seals'],
      ['Per-collection interiors', 'Trays, drawers, racks, and rolls per object type'],
      ['Museum-grade lines', 'Conservation cabinets from multiple manufacturers'],
      ['Compaction-ready', 'Cabinets ride carriages for double density'],
    ],
    gallery:[IMGS.cabMuseum, IMGS.musSlots, IMGS.musVisual2],
    chipsTitle:'Related systems',
    related: relAny('museums','art-screens','cabinets','high-density-mobile-storage'),
  },
  'art-screens': {
    eyebrow:'Solutions / Museum', h1:'Art Screens & Racks',
    lead:'Framed works hang on wire screens that pull out, roll, or mount to the wall, so the whole collection stays visible, ventilated, and one glide away.',
    sideImg: IMGS.artScreen,
    paras:[
      `Art screens store paintings the way conservators want them stored: hanging, spaced, and untouched. Each screen presents both faces of the collection to a curator in seconds, without lifting a single frame off a stack.`,
      `We install all three formats. Pull-out screens glide on overhead or floor tracks for the highest density; mobile screen carriages compact an entire vault; and stationary wall-mounted screens turn unused wall into storage in studies and prep rooms.`,
      `The lines we install cover everything from a ten-screen study room to a full museum vault, and screens integrate directly with high-density mobile systems we install.`,
    ],
    features:[
      ['Pull-out, mobile, or wall-mounted', 'All three formats, matched to the vault'],
      ['Both faces accessible', 'A collection review without touching a frame'],
      ['Conservation hardware', 'Coated mesh and hangers that protect frames'],
      ['Vault-scale density', 'Hundreds of works per running foot of track'],
    ],
    gallery:[IMGS.artScreens2, IMGS.artHD, IMGS.hdmsArtScreen],
    chipsTitle:'Related systems',
    related: relAny('museums','museum-cabinets','high-density-mobile-storage','corporate-legal'),
  },
  'mail-sorters': {
    eyebrow:'Solutions / Casework', h1:'Mail Sorters & Mailroom',
    lead:'Sort modules, consoles, and mail center casework sized to your actual daily volume, from a corporate mail stop to a university package operation.',
    sideImg: IMGS.hamMailGlass,
    paras:[
      `Mailrooms are workflow rooms: mail comes in, gets sorted, and leaves, and the casework either speeds that up or gets in the way. Purpose-built sort modules put adjustable pockets at working height over counters deep enough to stage a full delivery run.`,
      `We design mail centers with sort modules, consoles, and adjustable shelving, configured to your route structure and volume. Pockets re-label and re-size as departments change, which spreadsheets of cubbyholes never do.`,
      `The package boom changed the room: where parcel volume outruns the sorter wall, we pair mail casework with smart parcel lockers, so recipients collect on their own schedule and the mailroom stops playing warehouse.`,
    ],
    features:[
      ['Adjustable pockets', 'Sort positions re-size and re-label as routes change'],
      ['Working-height design', 'Counters and modules laid out for the sort flow'],
      ['One casework line', 'Sort modules, consoles, and shelving that match'],
      ['Parcel integration', 'Smart lockers absorb the package overflow'],
    ],
    chipsTitle:'Related systems',
    related: relAny('modular-casework','lockers','corporate-legal','education'),
  },
};

const INDUSTRY_PAGES = {
  'museums': {
    h1:'Museum Storage',
    lead:'Collections storage that protects, organizes, and makes room for growth: art racks, conservation cabinets, and high-density systems for objects of every size.',
    sideImg: IMGS.artScreen,
    paras:[
      `Most museums display a fraction of what they hold. The rest lives in storage, and that storage determines how well the collection survives. We design collection storage around the objects themselves: paintings on pull-out art racks, textiles rolled on racks, specimens and works on paper in sealed conservation cabinets, and framed and boxed objects on high-density mobile shelving.`,
      `Our manufacturer partners are the names collection managers already know, covering museum-grade cabinets, mobile systems, art racks, and art screens and display systems.`,
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
      `Libraries are under pressure to be community spaces, but the collection still needs a home. High-density mobile shelving compresses stacks into a fraction of the floor, and cantilever library shelving keeps open stacks browsable and adaptable.`,
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
      `The locker lines we carry cover open-front team lockers, ventilated gear lockers, and secure personal storage. Wire and industrial shelving organizes balls, pads, and training equipment in cages and closets.`,
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
      `The manufacturers we represent build military-specification lockers and shelving for exactly these environments, from TA-50 gear storage to armory racking.`,
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
      `Wire shelving is the healthcare standard for cleanable, configurable supply storage. Modular casework adapts clinical support spaces without construction. VLMs secure and track high-value pharmacy and supply inventory.`,
      `Our teams have worked in operating healthcare environments including children's health systems, coordinating around infection control requirements and live clinical schedules.`,
    ],
    features:[
      ['Sterile core and supply', 'Cleanable wire and cabinet systems'],
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
      `Multi-site rollouts are a specialty. We have outfitted store networks with standardized shelving and locker packages, coordinated store by store around trading hours.`,
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
      `Organizations interested in reducing cost and increasing productivity rely on high-capacity storage solutions and material handling equipment. We supply and install pallet rack and cantilever, structural mezzanines and platforms, and industrial shelving from the manufacturers we represent.`,
      `Mezzanines create a second floor inside the building you already own, often the cheapest square footage an operation can buy. VLMs and automation compress parts storage and speed picking where labor is the constraint.`,
      `Every project gets proper engineering support: manufacturer-rated rack capacities, complete equipment load data for the structural engineer of record, and permits handled properly rather than hopefully.`,
    ],
    features:[
      ['Pallet rack and cantilever', 'Racking engineered to your loads'],
      ['Mezzanines', 'Structural platforms that add a floor'],
      ['Industrial shelving', 'Systems rated for daily abuse'],
      ['Automation', 'VLMs where picking speed pays'],
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
      `Vertical farming applies the same math as high-density storage: eliminate aisles, multiply capacity. Mobile grow systems mount multi-tier grow racks on carriages, so a grow room needs one working aisle instead of one per row.`,
      `The same principles cover trays, decking, drying racks, and the carts that move product through the operation. Integration with lighting, ventilation, and irrigation gets planned with your cultivation team, not around them.`,
      `We handle layout, delivery, and installation, provide loading data for your structural engineer, and service and reconfigure systems as operations scale.`,
    ],
    features:[
      ['Mobile grow systems', 'Carriage-mounted multi-tier growing'],
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
    </div>
    <span class="eyebrow" style="margin-top:52px;display:inline-block">Code &amp; Site Coordination</span>
    <h2 style="font-size:1.5rem">The things that get storage packages red-lined</h2>
    <p class="lead">Storage equipment lives inside someone else's code envelope. These are the coordination items we design around from the first layout, so they never surface at inspection.</p>
    <div class="feat">
      <div><b>ADA clearances</b><span>Accessible aisle widths, reach ranges, and clear-floor space at lockers, shelving, and service points, worked into the layout, not patched after review</span></div>
      <div><b>Fire sprinklers</b><span>Top-shelf and canopy heights planned to sprinkler-deflector clearance requirements, with layouts the fire protection engineer can sign off on</span></div>
      <div><b>Egress &amp; fire exits</b><span>Aisle widths, travel distances, and exit paths preserved, including when mobile carriages are parked; powered systems programmed to hold open safe aisles</span></div>
      <div><b>Electrical &amp; data rough-in</b><span>Powered mobile systems, VLMs, and smart lockers need power and network in the right place. We hand the electrician exact locations at rough-in, not at delivery</span></div>
      <div><b>Floor loads</b><span>Complete equipment loading data for the structural engineer of record, early enough to matter. The determination is always the engineer's; the data package is always ours</span></div>
      <div><b>Aisles sized to the equipment</b><span>Forklift turning aisles, cart and pallet-jack clearances, or person-only access, sized to how the room will actually run, use case by use case</span></div>
    </div>`,
    gallery:[IMGS.mezzanine, IMGS.maximize, IMGS.svc3],
    chipsTitle:'Scopes we take',
    related: relSol('high-density-mobile-storage','lockers','modular-casework','static-shelving'),
  },
};

/* ---------------- hub + static pages ---------------- */
const cardGrid = (items) => `<div class="cards">` + items.map(x=>`
  <a class="card" href="${x.slug}.html"><div class="ph" style="background-image:url('${x.img}')"></div>
    <div class="bd"><h3>${x.name}</h3><p>${x.short}.</p><span class="go">Learn more</span></div></a>`).join('') + `</div>`;

const solutionsHub = shell(`Storage Solutions | O'Brien Systems`, IMGS.compact, `
<div class="page-hero">
  <div class="wrap crumbs"><a href="index.html">Home</a> / Solutions</div>
  <div class="wrap">
    <span class="eyebrow">Solutions</span>
    <h1>What do you need to store?</h1>
    <p>Twenty-plus storage systems across fourteen manufacturer lines, and one local team that plans, installs, and services all of it. Start with a family, or jump straight to the system you already know you need.</p>
    <div class="ctas"><a class="btn btn-solid" href="contact.html?topic=assessment">Book a free assessment</a><a class="lnk" href="showroom.html">Explore in 3D</a></div>
  </div>
</div>
<section class="block alt">
${SOL_GROUPS.map(g=>`
  <div class="wrap hub-sec">
    <h2>${g.name}</h2>
    ${cardGrid(g.items)}
  </div>`).join('')}
</section>`);

const industriesHub = shell(`Industries We Serve | O'Brien Systems`, IMGS.banHome2, `
<div class="page-hero">
  <div class="wrap crumbs"><a href="index.html">Home</a> / Industries</div>
  <div class="wrap">
    <span class="eyebrow">Industries</span>
    <h1>Storage, planned around your work</h1>
    <p>Every industry stores something different. These are the ones we know inside out, from evidence rooms to grow rooms.</p>
    <div class="ctas"><a class="btn btn-solid" href="contact.html?topic=assessment">Book a free assessment</a><a class="lnk" href="where-we-work.html">Where we work</a></div>
  </div>
</div>
<section class="block alt"><div class="wrap">
${cardGrid(INDUSTRIES)}
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
    <div class="step"><span class="n">01 &middot; ASSESS</span><h3>Free Space Assessment</h3><p>We walk your space, measure what you store, and find the capacity you didn't know you had. No cost, no obligation.</p></div>
    <div class="step"><span class="n">02 &middot; DESIGN</span><h3>Layout &amp; Specification</h3><p>Drawings, equipment load data, and an itemized quote, matched to the right manufacturer line for the job.</p></div>
    <div class="step"><span class="n">03 &middot; INSTALL</span><h3>Factory-Trained Installation</h3><p>Our own crews deliver, anchor, and level, coordinated around your operating hours and site rules.</p></div>
    <div class="step"><span class="n">04 &middot; SUPPORT</span><h3>Service &amp; Relocation</h3><p>Maintenance, reconfiguration, teardown and moves, even for systems we didn't originally supply.</p></div>
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
    <div><b>Philadelphia HQ</b><span>Based in Conshohocken, PA. When our customers grow beyond the region, we go with them.</span></div>
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
<div class="post-cover"><div role="img" aria-label="${p.title.replace(/"/g, '&quot;')}"></div></div>
<article class="post-content">
${p.content}
</article>
<div class="post-nav">
  ${prev?`<a class="btn btn-ghost" href="post-${prev.slug}.html">Older: ${prev.title.slice(0,36)}${prev.title.length>36?'...':''}</a>`:'<span></span>'}
  ${next?`<a class="btn btn-ghost" href="post-${next.slug}.html">Newer: ${next.title.slice(0,36)}${next.title.length>36?'...':''}</a>`:'<span></span>'}
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
<section class="block alt"><div class="wrap">
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
<section class="block alt"><div class="wrap">
  <div class="dl-grid">
    ${BROCHURES.map(b=>`<a class="dlc" href="${b[1]}" target="_blank" rel="noopener"><div class="cover" style="background-image:url('${COVERS[b[2]]}')"></div><div class="bd"><b>${b[0]}</b><span class="tag">PDF</span></div></a>`).join('\n    ')}
  </div>
  <div class="chips" style="margin-top:36px"><a href="storage-questions.html">Storage questions answered</a><a href="design-specify.html">Design &amp; Specify: CSI sections, CAD and Revit</a><a href="service.html">Request service</a></div>
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

const MFR = '/assets/media/mfr';
const tile = (t) => `
<section class="tile${t.cls ? ' ' + t.cls : ''}"${t.id ? ` id="${t.id}"` : ''}>
  <div class="tile-text">
    <span class="eyebrow">${t.eyebrow}</span>
    <h2>${t.h2}</h2>
    <p class="sub">${t.sub}</p>
    <div class="ctas">${t.ctas.map(([label, href], i) => `<a class="btn ${i ? 'btn-ghost' : 'btn-solid'}" href="${href}">${label}</a>`).join('')}</div>
  </div>${t.img ? `
  <div class="tile-media" data-scroll="parallax" data-vt-img style="background-image:url('${t.img}')"></div>` : ''}${t.after || ''}
</section>`;
const railCard = (href, img, small, title, text) => `<a class="rail-card" href="${href}"><div class="ri" data-vt-img style="background-image:url('${img}')"></div><div class="rt">${small ? `<small>${small}</small>` : ''}<b>${title}</b><span>${text}</span></div></a>`;

const homeBody = `
<section class="hero ah" id="top">
  <div class="ah-in">
    <span class="eyebrow">O'Brien Systems</span>
    <h1>Storage solved.<br><em>Space reclaimed.</em></h1>
    <p>Custom storage, planned, supplied and installed by one family-owned team since 1979.</p>
    <div class="ctas"><a class="btn btn-solid btn-lg" href="contact.html?topic=assessment">Book a free assessment</a><a class="lnk" href="solutions.html">Explore solutions</a></div>
  </div>
  <div class="ah-media" data-scroll="zoom"><img class="ah-img" src="${IMGS.hdLibrary}" alt="High-density mobile shelving in a university library" fetchpriority="high" loading="eager" decoding="async"></div>
</section>

<section class="block statement"><div class="wrap narrow">
  <p class="hl-text" data-scroll="hl">Most storage rooms are half aisle. We measure what you keep, choose the system that fits it, and install it with our own crews, so the room you already have holds far more.</p>
</div></section>

<div class="tiles">
${tile({ cls: 'dark', id: 'hd', eyebrow: 'High-Density Mobile Storage', h2: 'Twice the storage.<br>Same floor.', sub: 'Put shelving on carriages and the wasted aisles disappear.',
  ctas: [['Learn more', 'high-density-mobile-storage.html'], ['See it in 3D', 'showroom.html?model=hd-mobile']],
  after: `
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
  </div>` })}
${tile({ eyebrow: 'Lifts &amp; Carousels', h2: 'Goods to person.', sub: 'Automated vertical storage that brings every tray to waist height.',
  ctas: [['Learn more', 'lifts-carousels.html'], ['See it in 3D', 'showroom.html?model=vlm']], img: `${MFR}/lifts-carousels--1.jpg` })}
</div>
<div class="tile-grid" style="margin-top:12px">
${tile({ cls: 'white', eyebrow: 'Lockers', h2: 'Every kind of locker.', sub: 'Smart, evidence, athletic and personal storage.', ctas: [['Learn more', 'lockers.html'], ['Get a quote', 'contact.html?topic=quote&amp;product=lockers']], img: `${MFR}/lockers--1.jpg` })}
${tile({ cls: 'dark', eyebrow: 'Museums', h2: 'Made for collections.', sub: 'Cabinets, art screens and racks that protect what matters.', ctas: [['Learn more', 'museums.html'], ['See it in 3D', 'showroom.html?model=museum-cabinet']], img: `${MFR}/museums--1.jpg` })}
${tile({ eyebrow: 'Static Shelving', h2: 'The workhorse.', sub: 'Four-post, wire, cantilever and pallet rack.', ctas: [['Learn more', 'static-shelving.html'], ['Get a quote', 'contact.html?topic=quote&amp;product=static-shelving']], img: `${MFR}/static-shelving--1.jpg` })}
${tile({ cls: 'white', eyebrow: 'Modular Casework', h2: 'Built to change.', sub: 'Casework and lab furniture you can reconfigure.', ctas: [['Learn more', 'modular-casework.html'], ['Get a quote', 'contact.html?topic=quote&amp;product=modular-casework']], img: `${MFR}/modular-casework--1.jpg` })}
${tile({ cls: 'dark', eyebrow: 'Evidence Lockers', h2: 'Chain of custody, built in.', sub: 'Pass-through lockers for property and evidence rooms.', ctas: [['Learn more', 'evidence-lockers.html'], ['See it in 3D', 'showroom.html?model=evidence-lockers']], img: `${MFR}/evidence-lockers--1.jpg` })}
${tile({ eyebrow: 'Cabinets', h2: 'Files, fully handled.', sub: 'Rotary, lateral, fireproof and museum-grade cabinets.', ctas: [['Learn more', 'cabinets.html'], ['Get a quote', 'contact.html?topic=quote&amp;product=cabinets']], img: `${MFR}/cabinets--1.jpg` })}
</div>

<section class="block" id="industries">
  <div class="wrap sh-center center">
    <span class="eyebrow">Industries</span>
    <h2 class="sh" style="margin:0 auto">Built around your work.</h2>
    <p class="lead">Thirteen industries, each with its own storage problems. Pick yours.</p>
  </div>
  <div class="rail">
    ${INDUSTRIES.map(i => railCard(`${i.slug}.html`, i.img, 'Industries', i.name, `${i.short}.`)).join('\n    ')}
  </div>
</section>

<section class="block dark" id="numbers">
  <div class="wrap center">
    <h2 class="sh" style="margin:0 auto">One team, start to finish.</h2>
    <p class="lead" style="margin-left:auto;margin-right:auto">The people who measure your room are the people who plan it, install it and answer the phone afterward.</p>
    <div class="nums">
      <div><b>1979</b><span>Family-owned since</span></div>
      <div><b data-count="14">14</b><span>Manufacturer lines</span></div>
      <div><b data-count="13">13</b><span>Industries we plan for</span></div>
      <div><b>Free</b><span>On-site space assessments</span></div>
    </div>
  </div>
</section>
${X.home3d()}
<section class="block alt" id="how">
  <div class="wrap">
    <div class="sh-center center">
      <span class="eyebrow">Working with us</span>
      <h2 class="sh" style="margin:0 auto">From walkthrough to working storage.</h2>
    </div>
    <div class="story" data-scroll="story">
      <div class="story-media">
        <div class="sm on" style="background-image:url('${IMGS.maximize}')"></div>
        <div class="sm" style="background-image:url('${IMGS.gcProject}')"></div>
        <div class="sm" style="background-image:url('${IMGS.installer}')"></div>
        <div class="sm" style="background-image:url('${IMGS.svcMain}')"></div>
      </div>
      <div class="story-steps">
        <div class="st on"><div class="st-img" style="background-image:url('${IMGS.maximize}')"></div><span class="n">01 Assess</span><h3>A free space assessment.</h3><p>We walk your space, measure what you store, and find the capacity you didn't know you had.</p></div>
        <div class="st"><div class="st-img" style="background-image:url('${IMGS.gcProject}')"></div><span class="n">02 Design</span><h3>Layout and specification.</h3><p>Drawings, equipment load data and an itemized quote, matched to the right manufacturer line.</p></div>
        <div class="st"><div class="st-img" style="background-image:url('${IMGS.installer}')"></div><span class="n">03 Install</span><h3>Factory-trained installation.</h3><p>Our own crews deliver, anchor and level, coordinated around your operating hours.</p></div>
        <div class="st"><div class="st-img" style="background-image:url('${IMGS.svcMain}')"></div><span class="n">04 Support</span><h3>Service and relocation.</h3><p>Maintenance, reconfiguration, teardown and moves, even for systems we didn't originally supply.</p></div>
      </div>
    </div>
  </div>
</section>

<section class="block" id="blog">
  <div class="wrap sh-center center">
    <span class="eyebrow">From the blog</span>
    <h2 class="sh" style="margin:0 auto">Storage, thought through.</h2>
    <p class="lead"><a class="lnk" href="blog.html">All posts</a></p>
  </div>
  <div class="rail posts">
    ${BLOG.slice(0, 8).map(p => railCard(`post-${p.slug}.html`, p.img || IMGS.banResources, fmtDate(p.date), p.title, '')).join('\n    ')}
  </div>
</section>`;


/* ---------------- write files ---------------- */
fs.mkdirSync(path.join(OUT,'assets'), {recursive:true});
fs.writeFileSync(path.join(OUT,'assets','style.css'), CSS + X.CSS + X.CSS3D + G.CSS + W.CSS + A.CSS_AFTER);

const pages = {
  'index.html': shell(`O'Brien Systems | Custom Storage Solutions | Design Concept`, IMGS.heroHome, homeBody, { home: true }),
  'showroom.html': X.showroomPage(shell, IMGS.banMobile),
  'design-specify.html': X.designSpecifyPage(shell, IMGS.gcProject),
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
  pages[`${i.slug}.html`] = subpage({ ...d, extra:(d.extra||'') + G.extra(i.slug, i.name, 'industry'), faqs:[...(d.faqs||[]), ...G.faqs(i.slug)], slug:i.slug, eyebrow:'Industries', name:i.name, img:i.img, banner:i.banner, hub:'industries', hubName:'Industries' });
}
BLOG.forEach((p, idx) => { pages[`post-${p.slug}.html`] = postPage(p, idx); });
pages['storage-questions.html'] = G.answersPage(shell, IMGS.heroHome);
Object.assign(pages, W.pages(shell, IMGS.heroHome));
pages['about.html'] = pages['about.html'].replace('<div class="cta" id="contact">', G.aboutMap().replace('</figure>', '</figure>\n  <p class="gx-more"><a href="where-we-work.html">See every region we work in</a></p>') + '<div class="cta" id="contact">');

{ const kindOf = (f) => /^post-/.test(f) ? 'Blog' : /^storage-systems-|where-we-work/.test(f) ? 'Where we work'
    : INDUSTRIES.some(i => `${i.slug}.html` === f) ? 'Industry' : [...SOLUTIONS, ...PRODUCTS].some(x => `${x.slug}.html` === f) ? 'Solution' : 'Page';
  const index = Object.entries(pages).filter(([f]) => f !== '404.html').map(([f, html]) => {
    const t = ((html.match(/<title>([^<]*)<\/title>/) || [])[1] || f).split(' | ')[0].replace(/&amp;/g, '&').replace(/&#39;/g, "'");
    const kw = ((html.match(/<h1>([\s\S]*?)<\/h1>/) || [])[1] || '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&');
    return [f === 'index.html' ? 'Home' : t, f, kindOf(f), kw];
  });
  fs.writeFileSync(path.join(OUT, 'assets', 'site.js'), A.siteJs(index)); }
let n = 0;
for (const [file, html] of Object.entries(pages)) {
  // copy rules are enforced here: the build fails rather than publish a violation
  const bad = [/\u2014/, /&mdash;/, /nationwide/i].find(re => re.test(html.replace(/<script[\s\S]*?<\/script>/g, '')));
  if (bad) throw new Error(`${file}: copy rule violation (${bad})`);
  fs.writeFileSync(path.join(OUT, file), X.lazyMedia(X.enrich(file, X.with3d(X.photos(file, html), VER))));
  n++;
}
// customer presentations: unlisted, never in the sitemap
{ const names = Object.fromEntries([...SOLUTIONS, ...PRODUCTS, ...INDUSTRIES].map(p => [p.slug, p.name]));
  for (const [file, html] of Object.entries(X.presentPages(VER, IMGS.logo, names))) fs.writeFileSync(path.join(OUT, file), html); }
// pages retired from the site: clear any stale copies so nothing links or serves them
for (const f of ['projects.html', 'partners.html']) fs.rmSync(path.join(OUT, f), { force: true });
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), X.sitemap(Object.keys(pages)));
fs.writeFileSync(path.join(OUT, 'robots.txt'), X.ROBOTS);
{ // chat-config.js: obriensys.com path <-> redesign page, so answers link here and prompts fit each page
  const files = fs.readdirSync(OUT).filter(f => f.endsWith('.html'));
  const ALIAS = { 'museum-storage': 'museums.html', 'contact-us': 'contact.html', 'about-us': 'about.html', '': 'index.html' };
  const toLocal = {}; // obriensys slug -> redesign file
  for (const f of files) { const slug = f.replace(/\.html$/, '').replace(/^post-/, ''); if (slug !== 'index') toLocal[slug] = f; }
  Object.assign(toLocal, ALIAS);
  const PRODUCT = ["four-post-shelving","wire-shelving","cantilever-shelving","bin-storage","pallet-rack","mezzanines","wire-partitions","evidence-lockers","weapons-storage","athletic-storage","rotary-cabinets","fireproof-cabinets","wardrobe-cabinets","museum-cabinets","art-screens","mail-sorters","high-density-mobile-storage","lifts-carousels","lockers","static-shelving","cabinets","modular-casework","solutions"];
  const INDUSTRY = ["museums","libraries","education","athletics","government-public-safety","military","pharmaceutical-healthcare","corporate-legal","retail","automotive","material-handling-warehouse","vertical-farming","general-contractors","industries"];
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
