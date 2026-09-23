// Redesign upgrades (Sept 2026), used by build.js:
//  - search/share plumbing added to every page after it is generated (description, Open Graph,
//    JSON-LD LocalBusiness / FAQPage / BreadcrumbList), plus sitemap.xml, robots.txt and 404.html
//  - "Specify & quote" panel on product and solution pages
//  - Space savings estimator (tools-space-estimator.html) and a teaser block
//  - Design & Specify hub for architects, Request Service page
//  - design polish CSS (page transitions, balanced headlines, focus states, hover depth)
// Copy rules: no em dashes, region-first geography, floor loading is the engineer of record's call.
const SITE = 'https://redesign.patrick-obrien.com';

/* ---------------- which lines we carry, and typical CSI sections ---------------- */
// Lines per product family come from the O'Brien line card (Notion). Pat to confirm before go-live.
const LINES = {
  'high-density-mobile-storage': ['Montel', 'Aurora Storage', 'Datum', 'Bruynzeel', 'Borroughs'],
  'lifts-carousels': ['Modula'],
  'lockers': ['Montel', 'Datum', 'Borroughs', 'Tennsco'],
  'static-shelving': ['Aurora Storage', 'Borroughs', 'Tennsco', 'Metro'],
  'cabinets': ['Tennsco', 'Borroughs', 'Aurora Storage', 'Datum'],
  'modular-casework': ['Hamilton Casework'],
  'four-post-shelving': ['Aurora Storage', 'Tennsco', 'Borroughs', 'Datum'],
  'wire-shelving': ['Metro'],
  'cantilever-shelving': ['Estey', 'Montel', 'Aurora Storage'],
  'bin-storage': ['Borroughs', 'Tennsco', 'Aurora Storage'],
  'pallet-rack': ['Steel King'],
  'mezzanines': ['Steele Solutions'],
  'evidence-lockers': ['Aurora Storage', 'Datum'],
  'athletic-storage': ['Montel'],
  'rotary-cabinets': ['Aurora Storage'],
  'wardrobe-cabinets': ['Tennsco'],
  'museum-cabinets': ['Delta Designs', 'Hamilton Casework'],
  'art-screens': ['Montel', 'Datum', 'Delta Designs', 'Stabaarte'],
  'mail-sorters': ['Hamilton Casework'],
};
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
// where each manufacturer publishes specs, CAD/Revit and data sheets (link out, never re-host)
const MFR_RESOURCES = [
  ['Montel', 'Resource Center: CSI specs, data sheets, Revit, LEED', 'https://www.montel.com/resource-center'],
  ['Hamilton Casework', 'Downloads: specs, drawings, brochures', 'https://hamiltoncs.com/downloads/'],
  ['Datum', 'BIM downloads and product specs', 'https://www.datumstorage.com/'],
  ['Borroughs', 'Product specifications and install instructions', 'https://www.borroughs.com/resources/product-specifications/'],
  ['Modula', 'Vertical lift module documentation', 'https://modula.us/'],
  ['Tennsco', 'Shelving, cabinet and locker specifications', 'https://www.tennsco.com/'],
  ['Steel King', 'Rack specifications and design support', 'https://www.steelking.com/'],
  ['Delta Designs', 'Museum cabinet specifications', 'https://www.deltadesignsltd.com/'],
];

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const attr = (s) => esc(s).replace(/'/g, '&#39;');

/* ---------------- Specify & quote panel ---------------- */
function specPanel(slug, name, brochures) {
  const lines = LINES[slug] || [];
  const csi = CSI[slug];
  const b = BROCHURE_FOR[slug] && brochures.find(x => x[2] === BROCHURE_FOR[slug]);
  if (!lines.length && !csi && !b) return '';
  return `
<section class="spec" aria-label="Specify and quote">
  <div class="spec-l">
    <span class="eyebrow">Specify &amp; quote</span>
    <h2>Ready to plan ${esc(name.toLowerCase())}?</h2>
    <dl>
      ${lines.length ? `<dt>Lines we carry</dt><dd>${lines.map(l => `<a href="partners.html">${esc(l)}</a>`).join(', ')}</dd>` : ''}
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

/* ---------------- Space savings estimator ---------------- */
const estimatorTeaser = () => `
<section class="est-teaser">
  <div class="wrap">
    <div>
      <span class="eyebrow">Free tool</span>
      <h2>How much more would your room hold?</h2>
      <p>Enter your room size and shelf depth. See fixed rows next to mobile rows, drawn to scale, in seconds. No email required.</p>
    </div>
    <a class="btn btn-white" href="tools-space-estimator.html">Try the space estimator &rarr;</a>
  </div>
</section>`;

const ESTIMATOR_JS = `(function(){
  var f = document.getElementById('est'); if (!f) return;
  var out = document.getElementById('est-out');
  function num(id){ var v = parseFloat(f.elements[id].value); return isFinite(v) && v > 0 ? v : 0; }
  function ftin(inches){ var ft = Math.floor(inches / 12), inch = inches - ft * 12; inch = Math.round(inch * 16) / 16; if (inch === 12) { ft++; inch = 0; } return ft + "' " + (inch ? inch + '"' : '0"'); }
  function draw(svg, faces, depth, aisle, width, mobile){
    var W = 400, H = 170, sx = W / width, g = '', x = 0, used = 0;
    var row = function(w, cls){ g += '<rect x="' + (x * sx).toFixed(2) + '" y="18" width="' + Math.max(w * sx - 1, 1).toFixed(2) + '" height="' + (H - 36) + '" class="' + cls + '"/>'; x += w; };
    var gap = function(w){ g += '<rect x="' + (x * sx).toFixed(2) + '" y="18" width="' + (w * sx).toFixed(2) + '" height="' + (H - 36) + '" class="est-aisle"/>'; x += w; };
    if (mobile) { var half = Math.floor(faces / 2); for (var i = 0; i < half; i++) row(depth, 'est-u'); gap(aisle); for (var j = half; j < faces; j++) row(depth, 'est-u'); }
    else { var k = (faces - 2) / 2; row(depth, 'est-u'); for (var r = 0; r < k; r++) { gap(aisle); row(depth * 2, 'est-u'); } gap(aisle); row(depth, 'est-u'); }
    svg.innerHTML = '<rect x="0" y="10" width="' + W + '" height="' + (H - 20) + '" class="est-room"/>' + g;
  }
  function calc(){
    var W = num('w') * 12 + num('wi'), L = num('l') * 12 + num('li'), d = num('d'), a = num('a'), c = num('c'), lv = num('lv') || 1;
    if (!W || !L || !d || !a) { out.hidden = true; return; }
    var usable = L - c; if (usable <= 0) { out.hidden = true; return; }
    var k = Math.floor((W - 2 * d - a) / (2 * d + a)); var fixedFaces = k >= 0 ? 2 + 2 * k : (W >= d + a ? 1 : 0);
    var mobileFaces = Math.max(0, Math.floor((W - a) / d));
    var lfFixed = fixedFaces * usable / 12 * lv, lfMobile = mobileFaces * usable / 12 * lv;
    var gain = fixedFaces ? Math.round((mobileFaces / fixedFaces - 1) * 100) : 0;
    out.hidden = false;
    out.querySelector('[data-o=ff]').textContent = fixedFaces;
    out.querySelector('[data-o=mf]').textContent = mobileFaces;
    out.querySelector('[data-o=lff]').textContent = lfFixed.toLocaleString('en-US', {maximumFractionDigits:1});
    out.querySelector('[data-o=lfm]').textContent = lfMobile.toLocaleString('en-US', {maximumFractionDigits:1});
    out.querySelector('[data-o=gain]').textContent = gain > 0 ? '+' + gain + '%' : gain + '%';
    out.querySelector('[data-o=room]').textContent = ftin(W) + ' x ' + ftin(L);
    draw(document.getElementById('est-svg-f'), fixedFaces, d, a, W, false);
    draw(document.getElementById('est-svg-m'), mobileFaces, d, a, W, true);
    var summary = 'My room is ' + ftin(W) + ' wide by ' + ftin(L) + ' long, with ' + d + '" deep shelving, ' + a + '" aisles and ' + lv + ' shelf levels. The estimator shows ' + fixedFaces + ' fixed shelving faces vs ' + mobileFaces + ' on mobile carriages. What would you recommend?';
    document.getElementById('est-ask').setAttribute('data-chat-ask', summary);
    document.getElementById('est-book').href = 'contact.html?topic=assessment&room=' + encodeURIComponent(ftin(W) + ' x ' + ftin(L)) + '&faces=' + fixedFaces + '-' + mobileFaces;
  }
  f.addEventListener('input', calc); calc();
})();`;

function estimatorPage(shell, heroImg) {
  const field = (id, label, value, unit, extra = '') => `<label>${label}<span class="est-in"><input name="${id}" type="number" inputmode="decimal" min="0" step="any" value="${value}" ${extra}><em>${unit}</em></span></label>`;
  return shell(`Space Savings Estimator | O'Brien Systems`, heroImg, `
<div class="page-hero">
  <div class="wrap crumbs"><a href="index.html">Home</a> / <a href="resources.html">Resources</a> / Space Savings Estimator</div>
  <div class="wrap">
    <span class="eyebrow">Free tool</span>
    <h1>Space savings estimator</h1>
    <p>See how many shelving faces fit your room as fixed rows, and how many fit on mobile carriages with one shared aisle. Change any number and the drawing updates.</p>
  </div>
</div>
<section class="block">
  <div class="wrap est">
    <form id="est" class="est-form" onsubmit="return false">
      <fieldset><legend>Room</legend>
        <div class="est-pair">${field('w', 'Width (across the rows)', 20, 'ft')}${field('wi', '&nbsp;', 0, 'in')}</div>
        <div class="est-pair">${field('l', 'Length (along the rows)', 30, 'ft')}${field('li', '&nbsp;', 0, 'in')}</div>
      </fieldset>
      <fieldset><legend>Shelving</legend>
        ${field('d', 'Shelf depth', 18, 'in')}
        ${field('lv', 'Shelf levels per unit', 7, 'levels')}
      </fieldset>
      <fieldset><legend>Clearances</legend>
        ${field('a', 'Aisle width', 36, 'in')}
        ${field('c', 'Cross aisle at one end', 36, 'in')}
      </fieldset>
      <p class="est-note">Aisle widths depend on your use and local code (36 in. is a common minimum for accessible routes). Your design team confirms them.</p>
    </form>
    <div id="est-out" class="est-out" hidden>
      <p class="est-room-l">Room <b data-o="room"></b></p>
      <div class="est-grid">
        <figure><figcaption>Fixed rows <b><span data-o="ff"></span> faces</b></figcaption><svg id="est-svg-f" viewBox="0 0 400 170" role="img" aria-label="Fixed shelving layout"></svg><p><span data-o="lff"></span> linear ft of shelf</p></figure>
        <figure><figcaption>Mobile carriages <b><span data-o="mf"></span> faces</b></figcaption><svg id="est-svg-m" viewBox="0 0 400 170" role="img" aria-label="Mobile shelving layout"></svg><p><span data-o="lfm"></span> linear ft of shelf</p></figure>
      </div>
      <p class="est-gain">Capacity change with mobile: <b data-o="gain"></b></p>
      <div class="est-act">
        <a id="est-book" class="btn btn-solid" href="contact.html?topic=assessment">Book a free assessment to confirm</a>
        <button id="est-ask" type="button" class="btn btn-ghost" data-chat-ask="">Ask our assistant about my room</button>
      </div>
      <p class="est-fine">Planning estimate only: real layouts account for columns, doors, sprinklers, lighting and end panels. Floor capacity is evaluated by your structural engineer of record; we supply complete equipment load data for that review.</p>
    </div>
  </div>
</section>
<script src="assets/estimator.js" defer></script>`);
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
    <div class="mfr-res">${MFR_RESOURCES.map(r => `<a href="${r[2]}" target="_blank" rel="noopener"><b>${esc(r[0])}</b><span>${esc(r[1])}</span><span class="ext">Open &nearr;</span></a>`).join('')}</div>
    <div class="spec" style="margin-top:44px">
      <div class="spec-l"><span class="eyebrow">Working on a project?</span><h2>Send us the plan</h2><p style="margin:0">We'll return a layout, capacities and a budget number for the storage scope, usually within a few business days.</p></div>
      <div class="spec-r">
        <a class="btn btn-solid" href="contact.html?topic=cad">Request a layout or CAD</a>
        <a class="btn btn-ghost" href="contact.html?topic=talk">Book a lunch-and-learn</a>
        <a class="btn btn-ghost" href="general-contractors.html">For general contractors &rarr;</a>
      </div>
    </div>
  </div>
</section>`);
}

/* ---------------- Request service ---------------- */
function servicePage(shell, heroImg, partners) {
  const brands = partners.map(p => p[0].replace(/\b\w+/g, w => w[0] + w.slice(1).toLowerCase()));
  return shell(`Request Service | O'Brien Systems`, heroImg, `
<div class="page-hero">
  <div class="wrap crumbs"><a href="index.html">Home</a> / <a href="services.html">Services</a> / Request Service</div>
  <div class="wrap">
    <span class="eyebrow">Service &amp; repair</span>
    <h1>Request service</h1>
    <p>Mobile systems, lockers, cabinets and lifts, including brands we didn't originally supply. Tell us what's happening and we'll get the right technician scheduled.</p>
  </div>
</div>
<section class="block">
  <div class="wrap twocol">
    <form class="cform svc" action="#" onsubmit="event.preventDefault(); this.querySelector('.svc-ok').hidden=false;">
      <div class="row2"><label>Your name<input required autocomplete="name"></label><label>Organization<input autocomplete="organization"></label></div>
      <div class="row2"><label>Email<input type="email" required autocomplete="email"></label><label>Phone<input type="tel" autocomplete="tel"></label></div>
      <label>Site address<input autocomplete="street-address" placeholder="Where is the equipment?"></label>
      <div class="row2">
        <label>Equipment<select><option>Mobile shelving (high-density)</option><option>Vertical lift module / carousel</option><option>Lockers</option><option>Cabinets / rotary files</option><option>Shelving or rack</option><option>Other</option></select></label>
        <label>Brand<select><option>Not sure</option>${brands.map(b => `<option>${esc(b)}</option>`).join('')}<option>Other brand</option></select></label>
      </div>
      <div class="row2">
        <label>Drive type<select><option>Not sure / not mobile</option><option>Manual (push)</option><option>Mechanical assist (handle)</option><option>Powered (electric)</option></select></label>
        <label>How urgent?<select><option>Routine</option><option>Soon: it's slowing us down</option><option>Urgent: it isn't working or feels unsafe</option></select></label>
      </div>
      <label>What's happening?<textarea rows="5" placeholder="e.g. carriage drifts, handle is stiff, lock won't release, noise when moving"></textarea></label>
      <button class="btn btn-solid" type="submit">Send service request</button>
      <p class="svc-ok" hidden>Thanks. In the live site this goes straight to our service team. Design concept: not sent.</p>
    </form>
    <aside class="svc-side">
      <h3>Unsafe right now?</h3>
      <p>If a mobile system won't lock, moves on its own, or anyone could be pinched, stop using the aisle and call us: <a href="tel:6108253405"><b>610.825.3405</b></a>.</p>
      <h3>Service agreements</h3>
      <p>Scheduled preventive maintenance keeps carriages, drives and safety features working and extends system life. <a href="services.html">See services &rarr;</a></p>
      <h3>Any brand</h3>
      <p>We maintain, repair, relocate and expand systems from many manufacturers, not just the ones we sold.</p>
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
  <a href="solutions.html">All solutions</a><a href="industries.html">Industries</a><a href="projects.html">Projects</a><a href="tools-space-estimator.html">Space estimator</a><a href="blog.html">Blog</a><a href="contact.html">Contact</a>
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

/* estimator */
.est-teaser{background:var(--teal-ink);color:#fff;padding:54px 0}
.est-teaser .wrap{display:flex;gap:28px;align-items:center;justify-content:space-between;flex-wrap:wrap}
.est-teaser h2{font-size:1.7rem;margin:.3rem 0 .4rem;color:#fff}
.est-teaser p{max-width:620px;opacity:.9}
.est-teaser .eyebrow{color:var(--teal-soft)}
.est{display:grid;grid-template-columns:minmax(260px,340px) 1fr;gap:36px;align-items:start}
.est-form fieldset{min-width:0;border:1px solid var(--line);border-radius:12px;padding:14px 16px 6px;margin-bottom:14px}
.est-form legend{font-weight:700;padding:0 6px;color:var(--teal-ink)}
.est-form label{display:block;font-size:.88rem;color:var(--muted);margin-bottom:10px}
.est-in{display:flex;align-items:center;border:1px solid #cfdada;border-radius:8px;margin-top:4px;background:#fff}
.est-in:focus-within{border-color:var(--teal);box-shadow:0 0 0 3px rgba(0,115,119,.15)}
.est-in input{flex:1;min-width:0;border:0;padding:9px 10px;font:inherit;font-size:1rem;background:transparent;outline:0}
.est-in em{font-style:normal;color:var(--muted);padding:0 10px;font-size:.85rem}
.est-pair{display:grid;grid-template-columns:1.4fr 1fr;gap:10px}
.est-note,.est-fine{font-size:.82rem;color:var(--muted)}
.est-out{border:1px solid var(--line);border-radius:var(--radius);padding:22px;box-shadow:var(--shadow)}
.est-room-l{color:var(--muted);margin-bottom:8px}
.est-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}
.est-grid figure{background:var(--mist);border-radius:12px;padding:12px}
.est-grid figcaption{display:flex;justify-content:space-between;font-weight:600;margin-bottom:6px}
.est-grid figcaption b{color:var(--teal)}
.est-grid svg{width:100%;height:auto;display:block}
.est-grid p{font-size:.9rem;color:var(--muted);margin-top:6px}
.est-room{fill:#fff;stroke:#b9c7c7}
.est-u{fill:var(--teal)}
.est-aisle{fill:#e8a33d;opacity:.22}
.est-gain{font-size:1.25rem;margin:16px 0}
.est-gain b{color:var(--teal);font-size:1.6rem}
.est-act{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px}
@media (max-width:860px){.est{grid-template-columns:1fr}.est-grid{grid-template-columns:1fr}}

/* design & specify */
.sec-h{font-size:1.35rem;margin:44px 0 14px;max-width:none}
.csi{width:100%;border-collapse:collapse;font-size:.95rem}
.csi th,.csi td{text-align:left;padding:10px 12px;border-bottom:1px solid var(--line);vertical-align:top}
.csi th{color:var(--muted);font-weight:600;font-size:.85rem;text-transform:uppercase;letter-spacing:.04em}
.csi td:first-child{white-space:nowrap;font-weight:600;color:var(--teal-ink)}
.csi a{color:var(--teal)}
.mfr-res{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px}
.mfr-res a{display:flex;flex-direction:column;gap:4px;padding:14px 16px;border:1px solid var(--line);border-radius:12px;transition:border-color .15s,transform .15s,box-shadow .15s}
.mfr-res a:hover{border-color:var(--teal);transform:translateY(-2px);box-shadow:var(--shadow)}
.mfr-res span{font-size:.88rem;color:var(--muted)} .mfr-res .ext{color:var(--teal);font-weight:600}

/* service */
.svc label{display:block;margin-bottom:12px;font-size:.9rem;color:var(--muted)}
.svc input,.svc select,.svc textarea{display:block;width:100%;margin-top:4px;padding:10px 12px;border:1px solid #cfdada;border-radius:8px;font:inherit;background:#fff}
.svc .row2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.svc-ok{margin-top:10px;color:var(--teal);font-weight:600}
.svc-side h3{font-size:1.05rem;margin:18px 0 6px} .svc-side h3:first-child{margin-top:0}
.svc-side a{color:var(--teal)}
@media (max-width:700px){.svc .row2{grid-template-columns:1fr}}
`;

module.exports = { specPanel, estimatorTeaser, estimatorPage, ESTIMATOR_JS, designSpecifyPage, servicePage, notFound, enrich, sitemap, ROBOTS, CSS, LINES };
