/* Where we work: a hub plus one page per region (10/6/2026, Pat: "add the state pages to next").
 * Content from regions.json, written from the project records: facility types and towns, never customer names.
 * Maps are state level and zoomed to the region; no city dots or counts.
 */
const fs = require('fs');
const path = require('path');
const G = require('./growth');

const REGIONS = JSON.parse(fs.readFileSync(path.join(__dirname, 'regions.json'), 'utf8'));
const ST_NAME = { PA: 'Pennsylvania', NJ: 'New Jersey', DE: 'Delaware', MD: 'Maryland', DC: 'District of Columbia', VA: 'Virginia',
  NY: 'New York', CT: 'Connecticut', MA: 'Massachusetts', RI: 'Rhode Island', VT: 'Vermont', NH: 'New Hampshire', ME: 'Maine' };
const FORM_STATE = { PA: 'Pennsylvania', NJ: 'New Jersey', DE: 'Delaware', MD: 'Maryland', DC: 'Washington, DC', NY: 'New York' };
const file = (slug) => `storage-systems-${slug}.html`;
const shortName = (r) => (r.short === 'Rest of Pennsylvania' ? 'Pennsylvania' : r.short);

function statesData() {
  try { return JSON.parse(fs.readFileSync('C:/tools/obriensys-web/site/src/data/install-states.json', 'utf8')); } catch { return null; }
}

// a state map zoomed to the region's states (bounding box of their outlines), the rest dimmed
function regionMap(states, label) {
  const m = statesData();
  if (!m) return '';
  const names = new Set(states.map((s) => ST_NAME[s]));
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const s of m.states.filter((s) => names.has(s.name))) {
    const nums = s.d.match(/-?\d+(\.\d+)?/g).map(Number);
    for (let i = 0; i + 1 < nums.length; i += 2) {
      x0 = Math.min(x0, nums[i]); x1 = Math.max(x1, nums[i]); y0 = Math.min(y0, nums[i + 1]); y1 = Math.max(y1, nums[i + 1]);
    }
  }
  // a tiny area (DC is a sliver at this scale) still shows its neighbors
  const MIN = 240;
  if (x1 - x0 < MIN) { const c = (x0 + x1) / 2; x0 = c - MIN / 2; x1 = c + MIN / 2; }
  if (y1 - y0 < MIN * 0.6) { const c = (y0 + y1) / 2; y0 = c - MIN * 0.3; y1 = c + MIN * 0.3; }
  const pad = Math.max(x1 - x0, y1 - y0) * 0.35 + 20;
  let vx = x0 - pad, vy = y0 - pad, vw = x1 - x0 + pad * 2, vh = y1 - y0 + pad * 2;
  if (vw / vh < 1.3) { const w = vh * 1.3; vx -= (w - vw) / 2; vw = w; } else if (vw / vh > 1.8) { const h = vw / 1.8; vy -= (h - vh) / 2; vh = h; }
  const k = vw / 420; // HQ marker and label stay readable at any zoom (the map shows about 420px wide)
  const f = (n) => n.toFixed(2);
  return `<figure class="gx-rmap"><svg viewBox="${f(vx)} ${f(vy)} ${f(vw)} ${f(vh)}" role="img" aria-label="Map highlighting ${label}">
    <g>${m.states.map((s) => `<path class="${names.has(s.name) ? 'hl' : s.level ? 'l1' : 'l0'}" d="${s.d}" style="stroke-width:${f(1.2 * k)}"><title>${s.name}</title></path>`).join('')}</g>
    ${states.includes('DC') ? `<g class="gx-dc"><circle cx="827.4" cy="267.3" r="${f(6 * k)}"/><text x="${f(827.4 + 9 * k)}" y="${f(267.3 + 4 * k)}" style="font-size:${f(12 * k)}px;stroke-width:${f(3 * k)}px">Washington, DC</text></g>` : ''}
    <g class="gx-hq"><circle cx="${m.hq[0]}" cy="${m.hq[1]}" r="${f(4.5 * k)}" style="stroke-width:${f(2 * k)}"/><text x="${f(m.hq[0] - 7 * k)}" y="${f(m.hq[1] - 7 * k)}" style="font-size:${f(12 * k)}px;stroke-width:${f(3 * k)}px">Conshohocken HQ</text></g>
  </svg></figure>`;
}

const PRODUCT_LINKS = [['high-density-mobile-storage', 'High-density mobile storage'], ['static-shelving', 'Static shelving'], ['lockers', 'Lockers'],
  ['cabinets', 'Cabinets'], ['museum-cabinets', 'Museum cabinets'], ['modular-casework', 'Modular casework'], ['lifts-carousels', 'Lifts and carousels'], ['services', 'Moves and service']];

function regionPage(shell, img, r) {
  const stateList = r.match.states.map((s) => ST_NAME[s]).join(', ');
  const others = REGIONS.filter((o) => o.slug !== r.slug).map((o) => `<a href="${file(o.slug)}">${o.name}</a>`).join('');
  const faq = [
    [`Do you install storage systems in ${r.slug === 'pennsylvania' ? 'Central, Eastern and Western Pennsylvania' : r.short}?`, `Yes. ${r.lede} We handle the walk-through, layout, installation and service from our Conshohocken office.`],
    ['Can you work with our architect and general contractor?', 'Yes. On renovations and new buildings we coordinate with the architect and general contractor, and we provide product and load data to your engineer of record.'],
  ];
  const pick = FORM_STATE[r.match.states[0]] || 'Somewhere else';
  const form = G.quickQuote(`region-${r.slug}`, `storage in ${shortName(r)}`).replace(`<option>${pick}</option>`, `<option selected>${pick}</option>`);
  return shell(r.title, img, `
<div class="page-hero">
  <div class="wrap crumbs"><a href="index.html">Home</a> / <a href="where-we-work.html">Where we work</a> / ${r.name}</div>
  <div class="wrap">
    <span class="eyebrow">Where we work</span>
    <h1>${r.h1}</h1>
    <p>${r.lede}</p>
  </div>
</div>
<section class="block"><div class="wrap twocol">
  <div class="body">
    ${r.intro.map((t) => `<p>${t}</p>`).join('\n    ')}
    <h2 style="font-size:1.35rem;margin:26px 0 10px">What we install</h2>
    <div class="chips" style="margin-top:0">${PRODUCT_LINKS.map(([s, t]) => `<a href="${s}.html">${t}</a>`).join('')}</div>
  </div>
  <div>${regionMap(r.match.states, stateList)}</div>
</div>
<div class="wrap">
  <div class="gx-cards gx-region">
    <div class="gx-card"><b>Areas we serve</b><ul>${r.areas.map((a) => `<li>${a}</li>`).join('')}</ul></div>
    <div class="gx-card"><b>Who we work with</b><ul>${r.clients.map((c) => `<li>${c}</li>`).join('')}</ul></div>
  </div>
  ${form}
  <div class="faq">
    <h2>Frequently asked questions</h2>
    ${faq.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('\n    ')}
  </div>
  <h2 style="margin-top:52px;font-size:1.25rem">Other places we work</h2>
  <div class="chips">${others}<a href="where-we-work.html">All regions</a></div>
</div></section>`);
}

function hubPage(shell, img) {
  const m = statesData();
  const other = m ? m.states.filter((s) => s.level === 1).length : 17;
  const map = G.aboutMap().replace('<span class="eyebrow">Where we work</span>', '').replace('<h2>Up and down the East Coast</h2>', '<h2>Where we have installed</h2>').replace(/<p>Based in Conshohocken[^<]*<\/p>/, '<p>Darker states are where most of our work is. Pick a region below for the towns we serve and the kinds of organizations we work with.</p>');
  return shell(`Where We Work: East Coast Storage Installations | O'Brien Systems`, img, `
<div class="page-hero">
  <div class="wrap crumbs"><a href="index.html">Home</a> / Where we work</div>
  <div class="wrap">
    <span class="eyebrow">Where we work</span>
    <h1>Storage systems installed up and down the East Coast</h1>
    <p>Based in Conshohocken, Pennsylvania since 1979. Most of our work is between Washington and New York, and we have followed clients to projects in ${other} more states.</p>
  </div>
</div>
${map}
<section class="block" style="padding-top:0"><div class="wrap">
  <h2>Regions</h2>
  <div class="gx-cards" style="margin-top:18px">
    ${REGIONS.map((r) => `<a class="gx-card" href="${file(r.slug)}"><b>${r.name}</b><span>${r.lede}</span></a>`).join('\n    ')}
  </div>
</div></section>`);
}

function pages(shell, img) {
  const out = { 'where-we-work.html': hubPage(shell, img) };
  for (const r of REGIONS) out[file(r.slug)] = regionPage(shell, img, r);
  return out;
}

const footerLinks = () => REGIONS.map((r) => `<a href="${file(r.slug)}">${r.short === 'Rest of Pennsylvania' ? 'Pennsylvania' : r.name}</a>`).join('');

const CSS = `
.gx-rmap{margin:0;background:var(--mist);border-radius:var(--radius);padding:14px}
.gx-rmap svg{width:100%;height:auto;display:block}
.gx-rmap path{stroke:#fff}
.gx-rmap path.l0{fill:#e3e9e9}.gx-rmap path.l1{fill:#c9dede}.gx-rmap path.hl{fill:var(--teal)}
.gx-rmap .gx-hq circle{fill:#fff;stroke:#c4572a}
.gx-rmap .gx-dc circle{fill:var(--teal);stroke:#fff;stroke-width:1}
.gx-rmap .gx-dc text{font-family:var(--font);font-weight:700;fill:var(--teal-ink);paint-order:stroke;stroke:var(--mist)}
.gx-rmap .gx-hq text{font-family:var(--font);font-weight:700;fill:#c4572a;text-anchor:end;paint-order:stroke;stroke:var(--mist)}
.gx-region{grid-template-columns:1fr 1fr;margin-top:36px}
.gx-region ul{margin:8px 0 0;padding-left:18px;color:#39494c;font-size:.95rem}
.gx-region li{margin-bottom:4px}
@media(max-width:560px){.gx-region{grid-template-columns:1fr}}
/* header: room for Where We Work; the phone number stays in the announcement bar and the mobile menu */
header .logo{flex-shrink:0}
.head-cta .head-phone{display:none}
`;

module.exports = { REGIONS, file, pages, footerLinks, CSS };
