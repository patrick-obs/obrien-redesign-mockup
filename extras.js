// Redesign upgrades (Sept 2026), used by build.js:
//  - search/share plumbing added to every page after it is generated (description, Open Graph,
//    JSON-LD LocalBusiness / FAQPage / BreadcrumbList), plus sitemap.xml, robots.txt and 404.html
//  - "Specify & quote" panel on product and solution pages
//  - Design & Specify hub for architects, Request Service page
//  - design polish CSS (page transitions, balanced headlines, focus states, hover depth)
// Copy rules: no em dashes, region-first geography, floor loading is the engineer of record's call.
const SITE = 'https://redesign.patrick-obrien.com';

/* ---------------- typical CSI sections ---------------- */
// MasterFormat numbers we are confident in; anything else is left off rather than guessed.
const CSI = {
  'high-density-mobile-storage': '10 56 26 Mobile Storage Shelving',
  'static-shelving': '10 56 13 Metal Storage Shelving',
  'four-post-shelving': '10 56 13 Metal Storage Shelving',
  'bin-storage': '10 56 13 Metal Storage Shelving',
  'lockers': '10 51 13 Metal Lockers',
  'evidence-lockers': '10 51 13 Metal Lockers',
  'athletic-storage': '10 56 26 Mobile Storage Shelving',
  'wire-partitions': '10 22 13 Wire Mesh Partitions',
  'mail-sorters': '10 55 00 Postal Specialties',
  'modular-casework': '12 35 53 Laboratory Casework',
  'art-screens': '10 56 26 Mobile Storage Shelving',
};
const BROCHURE_FOR = {
  'lockers': 'lockers', 'evidence-lockers': 'publicSafety', 'weapons-storage': 'publicSafety',
  'museum-cabinets': 'museum', 'art-screens': 'museum', 'pallet-rack': 'materialHandling', 'mezzanines': 'materialHandling',
  'wire-partitions': 'materialHandling', 'lifts-carousels': 'materialHandling', 'wire-shelving': 'healthcare',
};

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const attr = (s) => esc(s).replace(/'/g, '&#39;');

/* ---------------- Specify & quote panel ---------------- */
function specPanel(slug, name, brochures) {
  const csi = CSI[slug];
  const b = BROCHURE_FOR[slug] && brochures.find(x => x[2] === BROCHURE_FOR[slug]);
  if (!csi && !b) return '';
  return `
<section class="spec" aria-label="Specify and quote">
  <div class="spec-l">
    <span class="eyebrow">Specify &amp; quote</span>
    <h2>Ready to plan ${esc(name.toLowerCase())}?</h2>
    <dl>
      ${csi ? `<dt>Typical CSI section</dt><dd>${esc(csi)} <small>(confirm against your project manual)</small></dd>` : ''}
      <dt>What you get</dt><dd>Layout drawings, equipment load data for your structural engineer, and an itemized quote</dd>
      ${b ? `<dt>Brochure</dt><dd><a href="${b[1]}" target="_blank" rel="noopener">${esc(b[0])} (PDF)</a></dd>` : ''}
    </dl>
  </div>
  <div class="spec-r">
    <a class="btn btn-solid" href="contact.html?topic=quote&amp;product=${slug}">Request a quote</a>
    <a class="btn btn-ghost" href="contact.html?topic=cad&amp;product=${slug}">Request CAD / Revit</a>
    <button type="button" class="btn btn-ghost" data-chat-ask="${attr(`I'm planning ${name.toLowerCase()}. What should I know first?`)}">Ask our assistant</button>
  </div>
</section>`;
}

/* ---------------- Design & Specify hub ---------------- */
function designSpecifyPage(shell, heroImg) {
  const rows = Object.entries(CSI).reduce((m, [slug, sec]) => { (m[sec] = m[sec] || []).push(slug); return m; }, {});
  const names = { 'high-density-mobile-storage': 'High-density mobile storage', 'static-shelving': 'Static shelving', 'four-post-shelving': '4-post shelving', 'bin-storage': 'Bin & parts storage', 'lockers': 'Lockers', 'evidence-lockers': 'Evidence lockers', 'athletic-storage': 'Athletic storage', 'wire-partitions': 'Wire partitions', 'mail-sorters': 'Mail sorters', 'modular-casework': 'Modular & lab casework', 'art-screens': 'Art screens' };
  return shell(`Design & Specify | Architects and Designers | O'Brien Systems`, heroImg, `
<div class="page-hero">
  <div class="wrap crumbs"><a href="index.html">Home</a> / Design &amp; Specify</div>
  <div class="wrap">
    <span class="eyebrow">For architects, designers &amp; spec writers</span>
    <h1>Design &amp; specify storage with one call</h1>
    <p>One dealer covering fourteen manufacturer lines. We help write the storage scope, lay it out on your plans, and carry it through submittals and installation.</p>
  </div>
</div>
<section class="block">
  <div class="wrap">
    <div class="feat">
      <div><b>Layouts on your plans</b><span>Send a CAD or PDF plan and we return a storage layout with capacities.</span></div>
      <div><b>Spec language</b><span>Performance specs written around the requirement, not one brand, so bids stay competitive.</span></div>
      <div><b>Load data</b><span>Complete equipment loading data for your structural engineer of record, who makes the floor determination.</span></div>
      <div><b>Submittals</b><span>Shop drawings, product data and samples, then installation coordinated with the GC.</span></div>
    </div>
    <h2 class="sec-h">Where our scope usually lands (CSI MasterFormat)</h2>
    <table class="csi">
      <thead><tr><th>Section</th><th>Typical O'Brien scope</th></tr></thead>
      <tbody>${Object.entries(rows).map(([sec, slugs]) => `<tr><td>${esc(sec)}</td><td>${slugs.map(s => `<a href="${s}.html">${esc(names[s] || s)}</a>`).join(', ')}</td></tr>`).join('')}</tbody>
    </table>
    <p class="est-note">Section numbers follow MasterFormat conventions; confirm against the edition your project manual uses.</p>
    <h2 class="sec-h">Manufacturer specs, CAD and Revit</h2>
    <p class="lead">Every line we install publishes its own specifications, data sheets, and CAD or Revit content. Tell us what you're drawing and we'll send the current files for the products on your project, so your documents match what gets installed.</p>
    <div class="spec" style="margin-top:44px">
      <div class="spec-l"><span class="eyebrow">Working on a project?</span><h2>Send us the plan</h2><p style="margin:0">We'll return a layout, capacities and a budget number for the storage scope, usually within a few business days.</p></div>
      <div class="spec-r">
        <a class="btn btn-solid" href="contact.html?topic=cad">Request a layout or CAD</a>
        <a class="btn btn-ghost" href="contact.html?topic=talk">Book a lunch-and-learn</a>
        <a class="btn btn-ghost" href="general-contractors.html">For general contractors &rarr;</a>
      </div>
    </div>
  </div>
</section>${viewer3d('design-specify', 'the install')}`);
}

/* ---------------- Request service ---------------- */
function servicePage(shell, heroImg) {
  return shell(`Request Service | O'Brien Systems`, heroImg, `
<div class="page-hero">
  <div class="wrap crumbs"><a href="index.html">Home</a> / <a href="services.html">Services</a> / Request Service</div>
  <div class="wrap">
    <span class="eyebrow">Service &amp; repair</span>
    <h1>Request service</h1>
    <p>Mobile systems, lockers, cabinets and lifts, including brands we didn't originally supply. Tell us what's happening and we'll get the right technician scheduled.</p>
  </div>
</div>
<section class="block svc-wrap">
  <div class="wrap svc-grid">
    <form class="svc" action="#" onsubmit="event.preventDefault(); this.querySelector('.svc-ok').hidden=false; this.querySelector('.svc-ok').scrollIntoView({block:'nearest'});">
      <div class="svc-step"><span class="svc-n">1</span><div><h2>About you</h2><p>So the technician can reach the right person.</p></div></div>
      <div class="row2"><label>Your name<input required autocomplete="name"></label><label>Organization<input autocomplete="organization"></label></div>
      <div class="row2"><label>Email<input type="email" required autocomplete="email"></label><label>Phone<input type="tel" autocomplete="tel" placeholder="Best number for scheduling"></label></div>
      <label>Site address<input autocomplete="street-address" placeholder="Where is the equipment?"></label>

      <div class="svc-step"><span class="svc-n">2</span><div><h2>The equipment</h2><p>Your best guess is fine. We service many brands.</p></div></div>
      <div class="row2">
        <label>Equipment<select><option>Mobile shelving (high-density)</option><option>Vertical lift module / carousel</option><option>Lockers</option><option>Cabinets / rotary files</option><option>Shelving or rack</option><option>Other</option></select></label>
        <label>Brand, if known<input placeholder="Check the end panel or carriage label"></label>
      </div>
      <fieldset class="svc-chips"><legend>Drive type</legend>
        ${['Not sure', 'Manual (push)', 'Mechanical assist (handle)', 'Powered (electric)'].map((t, i) => `<label><input type="radio" name="drive" ${i ? '' : 'checked'}><span>${t}</span></label>`).join('')}
      </fieldset>

      <div class="svc-step"><span class="svc-n">3</span><div><h2>What's happening</h2><p>A sentence or two helps us bring the right parts.</p></div></div>
      <fieldset class="svc-chips"><legend>How urgent?</legend>
        <label><input type="radio" name="urg" checked><span>Routine</span></label><label><input type="radio" name="urg"><span>Soon: it's slowing us down</span></label><label class="svc-hot"><input type="radio" name="urg"><span>Urgent: not working or feels unsafe</span></label>
      </fieldset>
      <label>Describe the issue<textarea rows="5" placeholder="e.g. carriage drifts, handle is stiff, lock won't release, noise when moving"></textarea></label>
      <button class="btn btn-solid svc-send" type="submit">Send service request</button>
      <p class="svc-ok" hidden>Thanks. On the live site this goes straight to our service team. (Design concept: nothing was sent.)</p>
    </form>
    <aside class="svc-side">
      <div class="svc-alert">
        <h3>Unsafe right now?</h3>
        <p>If a mobile system won't lock, moves on its own, or anyone could be pinched, stop using the aisle and call us.</p>
        <a class="svc-call" href="tel:6108253405">610.825.3405</a>
      </div>
      <div class="svc-card">
        <h3>Service agreements</h3>
        <p>Scheduled preventive maintenance keeps carriages, drives and safety features working and extends system life.</p>
        <a href="services.html">See our services &rarr;</a>
      </div>
      <div class="svc-card">
        <h3>Any brand</h3>
        <p>We maintain, repair, relocate and expand systems from many manufacturers, not just the ones we sold.</p>
        <button type="button" class="btn btn-ghost" data-chat-ask="I need service on a storage system. What information will your technician need?">Ask our assistant</button>
      </div>
    </aside>
  </div>
</section>`);
}

/* ---------------- 404 ---------------- */
const notFound = (shell, heroImg) => shell(`Page not found | O'Brien Systems`, heroImg, `
<div class="page-hero">
  <div class="wrap">
    <span class="eyebrow">404</span>
    <h1>That page has moved or doesn't exist</h1>
    <p>Try one of these, or ask our assistant in the corner. It knows the whole site.</p>
  </div>
</div>
<section class="block"><div class="wrap"><div class="chips">
  <a href="solutions.html">All solutions</a><a href="industries.html">Industries</a><a href="showroom.html">3D Showroom</a><a href="blog.html">Blog</a><a href="contact.html">Contact</a>
</div></div></section>`);

/* ---------------- search/share plumbing, applied to each finished page ---------------- */
const ORG = {
  '@context': 'https://schema.org', '@type': 'LocalBusiness', '@id': 'https://obriensys.com/#org',
  name: "O'Brien Systems", url: 'https://obriensys.com/', telephone: '+1-610-825-3405', email: 'sales@obriensys.com', foundingDate: '1979',
  address: { '@type': 'PostalAddress', streetAddress: '739 E. Elm Street', addressLocality: 'Conshohocken', addressRegion: 'PA', postalCode: '19428', addressCountry: 'US' },
  areaServed: { '@type': 'Place', name: 'Greater Philadelphia region' },
  description: 'Storage solutions dealer and installer: high-density mobile shelving, lockers, cabinets, casework and automated storage.',
};
const strip = (s) => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'").replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim();
function enrich(file, html) {
  const title = strip((html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '');
  const lead = strip((html.match(/class="(?:page-hero|hero)"[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/) || [])[1] || '') || ORG.description;
  const desc = lead.length > 158 ? lead.slice(0, 155).replace(/\s+\S*$/, '') + '...' : lead;
  const img = (html.match(/--hero-img:url\('([^']+)'\)/) || [])[1];
  const url = `${SITE}/${file === 'index.html' ? '' : file}`;
  const ld = [ORG];
  const faqs = [...html.matchAll(/<details><summary>([\s\S]*?)<\/summary><p>([\s\S]*?)<\/p><\/details>/g)];
  if (faqs.length) ld.push({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(m => ({ '@type': 'Question', name: strip(m[1]), acceptedAnswer: { '@type': 'Answer', text: strip(m[2]) } })) });
  const crumbs = (html.match(/<div class="wrap crumbs">([\s\S]*?)<\/div>/) || [])[1];
  if (crumbs) {
    const parts = crumbs.split('/').map(s => s.trim()).filter(Boolean);
    ld.push({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: parts.map((p, i) => { const href = (p.match(/href="([^"]+)"/) || [])[1]; return { '@type': 'ListItem', position: i + 1, name: strip(p), ...(href ? { item: `${SITE}/${href === 'index.html' ? '' : href}` } : {}) }; }) });
  }
  const head = `<meta name="description" content="${attr(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website"><meta property="og:site_name" content="O'Brien Systems">
<meta property="og:title" content="${attr(title)}"><meta property="og:description" content="${attr(desc)}"><meta property="og:url" content="${url}">
${img ? `<meta property="og:image" content="${SITE}${img}"><meta name="twitter:card" content="summary_large_image">` : ''}
<meta name="theme-color" content="#007377">
<link rel="icon" href="/assets/media/2026/06/b699d-obrien-logo-web.png">
<script type="application/ld+json">${JSON.stringify(ld.length === 1 ? ld[0] : ld).replace(/</g, '\\u003c')}</script>`;
  return html.replace('</title>', `</title>\n${head}`);
}
const sitemap = (files) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${files.filter(f => f !== '404.html').map(f => `  <url><loc>${SITE}/${f === 'index.html' ? '' : f}</loc></url>`).join('\n')}
</urlset>
`;
// a design concept: keep it out of search until it becomes the real site
const ROBOTS = 'User-agent: *\nDisallow: /\n';

/* ---------------- design polish + new components ---------------- */
const CSS = `
/* page-to-page cross fade (browsers without support just navigate normally) */
@view-transition{navigation:auto}
::view-transition-old(root),::view-transition-new(root){animation-duration:.22s}
@media (prefers-reduced-motion:reduce){@view-transition{navigation:none}}
h1,h2,h3{text-wrap:balance} p{text-wrap:pretty}
:focus-visible{outline:3px solid var(--teal-soft);outline-offset:2px;border-radius:4px}
a,button{-webkit-tap-highlight-color:transparent}
.btn{transition:transform .15s ease,box-shadow .15s ease,background .15s ease}
.btn:hover{transform:translateY(-1px);box-shadow:0 8px 20px rgba(2,60,63,.18)}
.btn:active{transform:none;box-shadow:none}
.btn-ghost{background:transparent;border:2px solid var(--teal);color:var(--teal);cursor:pointer;font:inherit;font-weight:700}
.btn-ghost:hover{background:var(--teal);color:#fff}
/* on dark photo heroes the teal outline disappears: use a white outline over a tinted fill */
.hero .btn-ghost,.page-hero .btn-ghost{background:rgba(2,41,43,.55);border-color:#fff;color:#fff;-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px)}
.hero .btn-ghost:hover,.page-hero .btn-ghost:hover{background:#fff;color:var(--teal-ink)}
button.btn{font:inherit;font-weight:700;cursor:pointer}
::selection{background:var(--teal-soft);color:var(--teal-ink)}

/* specify & quote panel */
.spec{display:grid;grid-template-columns:1.6fr 1fr;gap:28px;align-items:center;margin:52px 0 8px;padding:30px 32px;border:1px solid var(--line);border-radius:var(--radius);background:linear-gradient(135deg,#f4f9f9,#fff);box-shadow:var(--shadow)}
.spec h2{font-size:1.45rem;margin:.2rem 0 .8rem}
.spec dl{display:grid;grid-template-columns:max-content 1fr;gap:6px 18px;font-size:.95rem}
.spec dt{color:var(--muted);font-weight:600}
.spec dd a{color:var(--teal);font-weight:600}
.spec small{color:var(--muted)}
.spec-r{display:flex;flex-direction:column;gap:10px}
.spec-r .btn{text-align:center;justify-content:center}
@media (max-width:820px){.spec{grid-template-columns:1fr;padding:24px}}

.est-note{font-size:.82rem;color:var(--muted)}

/* design & specify */
.sec-h{font-size:1.35rem;margin:44px 0 14px;max-width:none}
.csi{width:100%;border-collapse:collapse;font-size:.95rem}
.csi th,.csi td{text-align:left;padding:10px 12px;border-bottom:1px solid var(--line);vertical-align:top}
.csi th{color:var(--muted);font-weight:600;font-size:.85rem;text-transform:uppercase;letter-spacing:.04em}
.csi td:first-child{white-space:nowrap;font-weight:600;color:var(--teal-ink)}
.csi a{color:var(--teal)}

/* service */
.svc-wrap{background:var(--mist)}
.svc-grid{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(260px,1fr);gap:32px;align-items:start}
.svc{background:#fff;border:1px solid var(--line);border-radius:18px;padding:32px 34px;box-shadow:var(--shadow)}
.svc-step{display:flex;gap:14px;align-items:flex-start;margin:30px 0 16px;padding-top:26px;border-top:1px solid var(--line)}
.svc-step:first-child{margin-top:0;padding-top:0;border-top:0}
.svc-step h2{font-size:1.15rem;margin:0}
.svc-step p{font-size:.88rem;color:var(--muted);margin:2px 0 0}
.svc-n{flex:none;width:32px;height:32px;border-radius:50%;display:grid;place-items:center;background:var(--teal);color:#fff;font-weight:700}
.svc label{display:block;margin-bottom:14px;font-size:.88rem;font-weight:600;color:var(--teal-ink)}
.svc input:not([type=radio]),.svc select,.svc textarea{display:block;width:100%;margin-top:6px;padding:12px 14px;border:1px solid #cfdada;border-radius:10px;font:inherit;font-weight:400;font-size:1rem;color:var(--ink);background:#fff;transition:border-color .15s,box-shadow .15s}
.svc input:focus,.svc select:focus,.svc textarea:focus{outline:0;border-color:var(--teal);box-shadow:0 0 0 3px rgba(0,115,119,.15)}
.svc textarea{resize:vertical;min-height:120px}
.svc .row2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.svc-chips{border:0;margin:0 0 16px;display:flex;flex-wrap:wrap;gap:8px}
.svc-chips legend{font-size:.88rem;font-weight:600;color:var(--teal-ink);margin-bottom:8px;width:100%}
.svc-chips label{margin:0;font-weight:500}
.svc-chips input{position:absolute;opacity:0;pointer-events:none}
.svc-chips span{display:inline-block;padding:9px 14px;border:1px solid #cfdada;border-radius:999px;cursor:pointer;font-size:.9rem;color:var(--ink);transition:all .15s}
.svc-chips input:checked+span{background:var(--teal);border-color:var(--teal);color:#fff}
.svc-chips input:focus-visible+span{outline:3px solid var(--teal-soft);outline-offset:2px}
.svc-chips .svc-hot input:checked+span{background:#b3261e;border-color:#b3261e}
.svc-send{width:100%;justify-content:center;text-align:center;padding:15px;font-size:1rem;margin-top:6px}
.svc-ok{margin-top:12px;padding:12px 14px;border-radius:10px;background:#e8f4f4;color:var(--teal-ink);font-weight:600}
.svc-side{display:flex;flex-direction:column;gap:16px;position:sticky;top:96px}
.svc-alert{background:#fff4f2;border:1px solid #f4c7c0;border-left:5px solid #b3261e;border-radius:14px;padding:20px 22px}
.svc-alert h3{color:#8c1d16;margin:0 0 6px;font-size:1.1rem}
.svc-alert p{font-size:.92rem;margin:0 0 10px}
.svc-call{display:inline-block;font-size:1.35rem;font-weight:800;color:#8c1d16}
.svc-card{background:#fff;border:1px solid var(--line);border-radius:14px;padding:20px 22px}
.svc-card h3{font-size:1.05rem;margin:0 0 6px}
.svc-card p{font-size:.92rem;color:var(--muted);margin:0 0 10px}
.svc-card a{color:var(--teal);font-weight:600}
@media (max-width:900px){.svc-grid{grid-template-columns:1fr}.svc-side{position:static}}
@media (max-width:640px){.svc{padding:22px 18px}.svc .row2{grid-template-columns:1fr}}
`;

/* ---------------- accurate product photos (photo-swaps.json, from the Sept 2026 image audit) ---------------- */
// Each entry: {page, kind: hero|side|gallery|card, n (gallery position, 1-based), added, cur, file, credit, remove}
// Photos come only from O'Brien's manufacturer partners. Credits are not rendered on the page.
let SWAPS = [];
try { SWAPS = require('./photo-swaps.json'); } catch {}
function photos(file, html) {
  const page = file.replace(/\.html$/, '');
  const mine = SWAPS.filter(s => s.page === page);
  if (!mine.length) return html;
  const tile = (u) => `<div class="g" style="background-image:url('${u}')"></div>`;
  const added = [];
  for (const s of mine) {
    if (s.remove) {
      if (s.kind === 'side') html = html.replace(/<div class="side-img">[\s\S]*?<\/div>/, '');
      continue;
    }
    if (s.kind === 'hero') html = html.replace(/--hero-img:url\('[^']*'\)/, `--hero-img:url('${s.file}')`);
    else if (s.kind === 'side') html = html.replace(/(<div class="side-img"><img src=")[^"]*(")/, `$1${s.file}$2`);
    else if (s.kind === 'card' && s.cur) html = html.split(s.cur).join(s.file);
    else if (s.kind === 'gallery' && s.added) added.push(s.file);
    else if (s.kind === 'gallery' && s.n) {
      let i = 0;
      html = html.replace(/<div class="gallery">[\s\S]*?\n    <\/div>/, block => block.replace(/<div class="g" style="background-image:url\('[^']*'\)"><\/div>/g, t => (++i === s.n ? tile(s.file) : t)));
    }
  }
  if (added.length) {
    if (/<div class="gallery">/.test(html)) html = html.replace(/(<div class="gallery">[\s\S]*?)(\n    <\/div>)/, (m, a, b) => a + added.map(u => `\n      ${tile(u)}`).join('') + b);
    else html = html.replace(/(\n    )(<div class="faq">|<h2 style="margin-top:52px)/, `$1<div class="gallery">\n      ${added.map(tile).join('\n      ')}\n    </div>$1$2`);
  }
  return html;
}

/* ---------------- 3D product viewer ---------------- */
// which interactive models appear on which page (ids live in assets/3d/models.js)
const VIEW3D = {
  'four-post-shelving': 'four-post', 'bin-storage': 'bin-shelving', 'wire-shelving': 'wire-shelving,wire-track,bike-storage', 'cantilever-shelving': 'library,hd-mobile-library',
  'static-shelving': 'four-post,bin-shelving,wire-shelving,library,tire-rack', 'high-density-mobile-storage': 'hd-mobile,hd-mobile-mezz,wire-track', 'lockers': 'lockers,athletic,evidence-lockers,weapons', 'evidence-lockers': 'evidence-lockers',
  'cabinets': 'flat-files,fireproof,rotary,museum-cabinet', 'rotary-cabinets': 'rotary', 'museum-cabinets': 'museum-cabinet,hd-mobile-museum,four-post-solander,textile-rack,hd-mobile-textile', 'art-screens': 'art-screens,wall-art,hd-mobile-art,painting-bins,hd-mobile-bins,pallet-museum',
  'pallet-rack': 'pallet-rack', 'mezzanines': 'mezzanine,hd-mobile-mezz', 'lifts-carousels': 'vlm', 'modular-casework': 'casework,ss-table', 'wire-partitions': 'wire-cage,bike-storage',
  'weapons-storage': 'weapons,hd-mobile', 'athletic-storage': 'athletic,hd-mobile-gear,lockers', 'athletics': 'athletic,hd-mobile-gear,hd-mobile-golf,lockers', 'mail-sorters': 'mail-sorter', 'fireproof-cabinets': 'fireproof', 'wardrobe-cabinets': 'hd-mobile-wardrobe',
  'military': 'weapons,hd-mobile,pallet-rack', 'museums': 'four-post-solander,painting-bins,hd-mobile-bins,art-screens,wall-art,hd-mobile-art,pallet-museum,hd-mobile-artrack,museum-cabinet,hd-mobile-museum,textile-rack,hd-mobile-textile', 'libraries': 'library,hd-mobile-library', 'material-handling-warehouse': 'hd-mobile-open,hd-mobile-mezz,pallet-rack,mezzanine,vlm,workstation,wire-cage',
  'vertical-farming': 'hd-mobile-grow,ss-table,wire-track', 'pharmaceutical-healthcare': 'casework,ss-table,wire-track,hd-mobile', 'education': 'lockers,bike-storage,athletic,hd-mobile-gear,hd-mobile-instruments,library,hd-mobile,mail-sorter', 'government-public-safety': 'evidence-lockers,weapons,hd-mobile,wire-cage',
  'corporate-legal': 'hd-mobile,rotary,fireproof,hd-mobile-flat,mail-sorter', 'automotive': 'tire-rack,hd-mobile-tire,bin-shelving,workstation,pallet-rack,vlm', 'retail': 'hd-mobile,four-post,bin-shelving,wire-track',
  'general-contractors': 'install,hd-mobile,mezzanine', 'design-specify': 'install,hd-mobile',
};
const ALL3D = 'hd-mobile,wire-track,vlm,rotary,four-post,bin-shelving,wire-shelving,library,tire-rack,lockers,athletic,evidence-lockers,weapons,flat-files,fireproof,museum-cabinet,art-screens,wall-art,textile-rack,painting-bins,casework,workstation,ss-table,mail-sorter,pallet-rack,pallet-museum,mezzanine,wire-cage,install,bike-storage';
// industry pages show the systems ready-made: fewer knobs, no presets
const LITE = new Set(['museums', 'libraries', 'material-handling-warehouse', 'pharmaceutical-healthcare', 'education', 'government-public-safety', 'corporate-legal', 'automotive', 'retail', 'athletics', 'military', 'vertical-farming', 'general-contractors']);
const viewer3d = (slug, name) => VIEW3D[slug] ? `
<section class="v3d-sec">
  <div class="wrap">
    <div class="v3d-head"><div><span class="eyebrow">Explore in 3D</span><h2>${VIEW3D[slug].includes(',') ? 'Explore the systems in 3D' : `See ${name.replace(/\s*\(VLM\)/, '')} from every side`}</h2></div><a class="v3d-all" href="showroom.html">Open the 3D showroom &rarr;</a></div>
    <div class="v3d" data-models="${VIEW3D[slug]}"${LITE.has(slug) ? ' data-lite="1"' : ''}></div>
  </div>
</section>` : '';
const home3d = () => `
<section class="v3d-sec v3d-home">
  <div class="wrap">
    <div class="v3d-head"><div><span class="eyebrow">3D showroom</span><h2>Spin it, open it, see how it works</h2><p>Drag to look at every side. Tap a carriage to open an aisle, pull a drawer, swing a door.</p></div><a class="v3d-all" href="showroom.html">All 30 models &rarr;</a></div>
    <div class="v3d" data-models="hd-mobile,four-post,lockers,flat-files,vlm"></div>
  </div>
</section>`;
function showroomPage(shell, heroImg) {
  return shell(`3D Showroom | O'Brien Systems`, heroImg, `
<div class="page-hero">
  <div class="wrap crumbs"><a href="index.html">Home</a> / <a href="solutions.html">Solutions</a> / 3D Showroom</div>
  <div class="wrap">
    <span class="eyebrow">3D showroom</span>
    <h1>Walk around the products</h1>
    <p>Thirty of the systems we plan and install, as interactive models. Drag to see every side, zoom in on the details, and try how they move.</p>
  </div>
</div>
<section class="v3d-sec v3d-room"><div class="wrap">
  <div class="v3d v3d-big" data-layout="side" data-models="${ALL3D}"></div>
  <p class="v3d-foot">Seen something that fits? <a href="contact.html?topic=assessment">Book a free assessment</a> and we'll lay out the real thing in your space, or <button type="button" class="linkish" data-chat-ask="I was looking at your 3D showroom. Which system would fit my space best?">ask our assistant</button>.</p>
</div></section>`);
}
// load the viewer only on pages that have one
const with3d = (html, ver) => html.includes('class="v3d') ? html.replace('</body>', `<script type="module" src="assets/3d/viewer.js?v=${ver}"></script>\n</body>`) : html;
const CSS3D = `.v3d-ov{position:absolute;right:12px;top:12px;z-index:6;width:min(300px,calc(100% - 24px));max-height:calc(100% - 24px);overflow:auto;background:#fff;border-radius:14px;box-shadow:0 12px 32px rgba(0,0,0,.22);cursor:auto;touch-action:auto;font:14px/1.4 system-ui,Segoe UI,sans-serif;color:#111}
.v3d-ov-x{position:absolute;top:8px;right:8px;width:26px;height:26px;border-radius:50%;border:0;background:rgba(255,255,255,.18);color:#fff;font-size:17px;line-height:1;cursor:pointer;z-index:1}
.cp button{font:inherit;cursor:pointer}
.cp-hd{display:flex;align-items:center;gap:8px;padding:11px 44px 11px 14px;background:linear-gradient(#2d7fe0,#0d4fae);color:#fff;font-weight:700;border-radius:14px 14px 0 0}.cp-hd span{flex:1}
.cp-hd button{border:0;background:rgba(255,255,255,.18);color:#fff;border-radius:8px;padding:3px 10px;font-size:13px}
.cp-st{padding:7px 14px;background:#eef3fa;font-size:12.5px;color:#34465e}.cp-st b{color:#1b7a3a}.cp-st b.mv{color:#c46a00}
.cp-body{padding:12px 14px 14px;display:flex;flex-direction:column;gap:10px}
.cp-big{border:0;border-radius:10px;padding:13px;color:#fff;font-weight:700;font-size:15px;background:linear-gradient(#3a8df0,#0d56b8)}.cp .or{background:linear-gradient(#ffa63a,#e0700f)}
.cp-link{border:0;background:none;color:#0d4fae;font-size:13px;padding:2px;text-decoration:underline}
.cp-line{font-size:12.5px;color:#5b6b7f}.cp-item b{display:block;font-size:17px}.cp-item span{color:#34465e}
.cp-qty{font-size:15px}.cp-qty b{font-size:26px;color:#0d4fae;margin-left:4px}
.cp-map{position:relative;height:74px;background:#9fd07f;border:4px solid #86c46a;border-radius:6px}.cp-map i{position:absolute;box-shadow:inset 0 0 0 1px rgba(0,0,0,.3)}.cp-map i.on{outline:3px solid #fff;animation:cpPulse 1s ease-in-out infinite alternate}
@keyframes cpPulse{to{outline-color:#1f3fb0}}
.cp-wait{padding:18px 10px;text-align:center;background:#f4f7fb;border-radius:10px;color:#5b6b7f}
.cp-tip{margin:0;font-size:12.5px;color:#5b6b7f}.cp-done{margin:6px 0;font-weight:700;font-size:17px;text-align:center}
.cp-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:5px;max-height:190px;overflow:auto}.cp-grid button{border:0;border-radius:7px;padding:8px 0;background:#e6edf6;color:#0b1b33;font-weight:600;font-size:13px}.cp-grid .at{background:#2f9e44;color:#fff}.cp-grid .mv{background:#f0a13a;color:#111}

/* 3D viewer */
.v3d-sec{padding:60px 0;background:#f6f8f8}
.v3d-home{background:linear-gradient(180deg,#fff,#f1f5f5)}
.v3d-room{padding-top:36px}
.v3d-head{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;flex-wrap:wrap;margin-bottom:20px}
.v3d-head h2{font-size:1.65rem;margin:.25rem 0 .2rem}
.v3d-head p{color:var(--muted);max-width:620px}
.v3d-all{color:var(--teal);font-weight:700;white-space:nowrap}
.v3d{border-radius:20px;background:#fff;border:1px solid var(--line);box-shadow:0 18px 50px rgba(2,60,63,.10);overflow:hidden}
.v3d:not(.v3d-on){min-height:520px;background:#eef2f2}
.v3d-wrap{display:flex;flex-direction:column}
.v3d-wrap.has-side{display:grid;grid-template-columns:250px minmax(0,1fr)}
.v3d-side{border-right:1px solid var(--line);padding:16px 10px;background:#fbfcfc;overflow-y:auto;scrollbar-width:thin;contain:size}
.v3d-side{position:relative}
.v3d-find{width:100%;box-sizing:border-box;margin:0 0 12px;padding:9px 12px;border:1px solid var(--line);border-radius:10px;font:inherit;font-size:.9rem;background:#fff}
.v3d-g{margin-bottom:6px}
.v3d-g>summary{list-style:none;display:flex;justify-content:space-between;align-items:center;cursor:pointer;font-size:.72rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);padding:6px 10px;border-radius:8px}
.v3d-g>summary::-webkit-details-marker{display:none}.v3d-g>summary:hover{background:#eef4f4}
.v3d-g>summary em{font-style:normal;font-weight:600;letter-spacing:0;color:#9aa6a6}
.v3d-g[open]>summary{color:var(--teal-dark)}
.v3d-g button{display:block;width:100%;text-align:left;border:0;background:none;padding:6px 10px;border-radius:9px;font:inherit;font-size:.9rem;line-height:1.3;color:var(--ink);cursor:pointer;transition:background .15s,color .15s}
.v3d-g button:hover{background:#eef4f4}
.v3d-g button[aria-selected=true]{background:var(--teal);color:#fff;font-weight:600}
.v3d-pick{display:none}
.v3d-seg{display:flex;gap:4px;margin:14px 14px 0;padding:4px;background:#eef2f2;border-radius:12px;flex-wrap:wrap;max-width:calc(100% - 28px);width:fit-content}
.v3d-seg button{flex:none;border:0;background:none;padding:8px 14px;border-radius:9px;font:inherit;font-size:.88rem;font-weight:600;color:var(--teal-ink);cursor:pointer;white-space:nowrap}
.v3d-seg button[aria-selected=true]{background:#fff;color:var(--teal);box-shadow:0 2px 8px rgba(2,60,63,.12)}
.v3d-main{display:flex;flex-direction:column;min-width:0;background:#fff}
.v3d-main:fullscreen{height:100vh}
.v3d-main:fullscreen .v3d-stage{flex:1;height:auto}
.v3d-top{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:16px 18px 10px}
.v3d-title b{display:block;font-size:1.12rem;color:var(--teal-ink)}
.v3d-title span{font-size:.84rem;color:var(--muted)}
.v3d-icons{display:flex;gap:6px}
.v3d-icons button{width:38px;height:38px;border-radius:10px;border:1px solid var(--line);background:#fff;display:grid;place-items:center;cursor:pointer;transition:all .15s}
.v3d-icons button:hover{border-color:var(--teal)}
.v3d-icons button[aria-pressed=true]{background:var(--teal);border-color:var(--teal)}
.v3d-icons svg{width:18px;height:18px;fill:none;stroke:var(--teal-ink);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.v3d-icons button[aria-pressed=true] svg{stroke:#fff}
.v3d-stage{position:relative;height:clamp(380px,60vh,640px);margin:0 14px;border-radius:14px;background:linear-gradient(180deg,#f7f9f9 0%,#eef2f2 62%,#e3e9e9 100%);cursor:grab;touch-action:none;overflow:hidden}
.v3d-big .v3d-stage{height:clamp(420px,calc(100vh - 300px),720px)}
.v3d-stage:active{cursor:grabbing}
.v3d-stage canvas{width:100%;height:100%;display:block}
.v3d-load[hidden]{display:none}
.v3d-load{position:absolute;inset:0;display:grid;place-items:center;color:var(--muted);font-size:.95rem}
.v3d-hint{position:absolute;left:14px;bottom:12px;background:rgba(255,255,255,.9);color:var(--teal-ink);font-size:.78rem;padding:6px 12px;border-radius:999px;pointer-events:none;box-shadow:0 2px 10px rgba(0,0,0,.06);transition:opacity .5s}
.v3d-hint.gone{opacity:0}
.v3d-bar{display:flex;flex-wrap:wrap;gap:12px 20px;align-items:center;justify-content:space-between;padding:14px 18px 6px}
.v3d-acts{display:flex;flex-direction:column;gap:12px;flex:1 1 100%;order:2}
.v3d-presets{display:flex;flex-wrap:wrap;gap:6px;align-items:center;padding:12px 18px 0}.v3d-presets span{font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);margin-right:4px}
.v3d-presets button{border:1px solid var(--line);background:#fff;color:var(--ink);border-radius:999px;padding:6px 13px;font:inherit;font-size:.86rem;font-weight:600;cursor:pointer}.v3d-presets button:hover{border-color:#9cc3c3}.v3d-presets button[aria-pressed=true]{background:#e4f1f1;border-color:var(--teal);color:var(--teal-dark)}
.v3d-prompt{position:absolute;left:50%;top:14px;transform:translateX(-50%);background:var(--teal);color:#fff;padding:8px 16px 8px 34px;border-radius:999px;font-size:.88rem;font-weight:600;pointer-events:none;box-shadow:0 6px 18px rgba(2,60,63,.25);transition:opacity .5s;white-space:nowrap;max-width:calc(100% - 24px);overflow:hidden;text-overflow:ellipsis}
.v3d-prompt::before{content:'';position:absolute;left:13px;top:50%;width:10px;height:10px;margin-top:-5px;border-radius:50%;background:#fff;animation:v3dPing 1.4s ease-out infinite}
.v3d-prompt.gone{opacity:0}
@keyframes v3dPing{0%{box-shadow:0 0 0 0 rgba(255,255,255,.8)}100%{box-shadow:0 0 0 10px rgba(255,255,255,0)}}
.v3d-bar .v3d-fin{order:1}
.v3d-btns{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.v3d-set{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px 12px}.v3d-set:not(:has(> :not([hidden]))){display:none}
.v3d-set label[hidden]{display:none}
.v3d-opt{display:flex;flex-direction:column;gap:4px;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);cursor:pointer}
.v3d-opt select{width:100%;border:1px solid var(--line);border-radius:10px;padding:9px 30px 9px 11px;font:inherit;font-size:.9rem;font-weight:600;text-transform:none;letter-spacing:0;color:var(--ink);background-color:#fff;cursor:pointer;appearance:none;background-image:linear-gradient(45deg,transparent 50%,#0f7377 50%),linear-gradient(135deg,#0f7377 50%,transparent 50%);background-position:calc(100% - 15px) 55%,calc(100% - 10px) 55%;background-size:5px 5px;background-repeat:no-repeat}
.v3d-opt select:hover,.v3d-chk:hover{border-color:#9cc3c3}
.v3d-chk{display:flex;align-items:center;gap:9px;align-self:end;min-height:40px;box-sizing:border-box;padding:0 12px;border:1px solid var(--line);border-radius:10px;background:#fff;font-size:.9rem;font-weight:600;color:var(--ink);cursor:pointer}
.v3d-chk input{accent-color:#0f7377;width:16px;height:16px;margin:0}
.v3d-acts .v3d-more{background:none!important;color:var(--teal-dark)!important;border:1px dashed #b9cccc!important;box-shadow:none!important}
.v3d-steps{display:flex;gap:6px;flex:0 0 auto;margin-right:4px}.v3d-title{flex:1 1 auto;min-width:0}
.v3d-step{flex:0 0 auto;width:34px;height:34px;border-radius:50%;border:1px solid var(--line);background:#fff;font-size:1.3rem;line-height:1;color:var(--teal-dark);cursor:pointer}.v3d-step:hover{background:#eef4f4}
.v3d-wheel{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);background:rgba(2,60,63,.85);color:#fff;padding:10px 16px;border-radius:10px;font-size:.9rem;pointer-events:none}
.v3d-acts button{border:0;background:var(--teal);color:#fff;border-radius:999px;padding:9px 16px;font:inherit;font-size:.88rem;font-weight:700;cursor:pointer;transition:transform .15s,box-shadow .15s,background .15s}
.v3d-acts button[hidden],.v3d-acts label[hidden]{display:none}
.v3d-acts button:hover{background:var(--teal-dark);transform:translateY(-1px);box-shadow:0 6px 14px rgba(2,60,63,.18)}
.v3d-fin{display:flex;gap:8px;align-items:center;font-size:.84rem;color:var(--muted)}
.v3d-fin>span{font-weight:600;margin-right:2px}
.v3d-fin em{font-style:normal;min-width:90px}
.v3d-sw{width:26px;height:26px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 1px #c5cfcf;cursor:pointer;padding:0}
.v3d-sw[aria-pressed=true]{box-shadow:0 0 0 2px var(--teal)}
.v3d-note{font-size:.76rem;color:var(--muted);padding:4px 18px 16px}
.v3d-foot{margin-top:18px;color:var(--muted)}
.v3d-foot a,.linkish{color:var(--teal);font-weight:700}
.linkish{background:none;border:0;padding:0;font:inherit;cursor:pointer;text-decoration:underline}
@media (max-width:860px){
  .v3d-wrap.has-side{display:flex}
  .v3d-side{display:none}
  .v3d-pick{display:flex;align-items:center;gap:10px;padding:14px 18px 0;font-size:.85rem;color:var(--muted);font-weight:600}
  .v3d-pick select{flex:1;padding:10px 12px;border:1px solid var(--line);border-radius:10px;font:inherit;font-size:1rem;color:var(--ink);background:#fff}
}
@media (max-width:640px){.v3d-stage{height:58vh;margin:0 10px}.v3d-top{padding:14px 12px 8px}.v3d-bar{padding:12px}.v3d-fin em{display:none}}
`;

module.exports = { viewer3d, home3d, showroomPage, with3d, CSS3D, photos, specPanel, designSpecifyPage, servicePage, notFound, enrich, sitemap, ROBOTS, CSS };
