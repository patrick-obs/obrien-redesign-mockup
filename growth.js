/* Search growth pass (10/6/2026): what the competitors who outrank us do, done our way.
 *  - deeper "pillar" product pages: every name people search for, the main choices in a table, how it goes in, more
 *    answers to the questions people actually ask Google (People Also Ask), a short quote form
 *  - museum storage organized by collection type
 *  - storage-questions.html: one page of plain answers (FAQPage markup comes from enrich())
 *  - service area: state map on About, states in the footer line
 * Copy rules hold: no manufacturer names, no em dashes, never "nationwide", floor loads go to the engineer of record.
 */
const fs = require('fs');

const esc = (s) => String(s).replace(/&(?!\w+;)/g, '&amp;');

const PILLAR = {
  'high-density-mobile-storage': {
    aka: 'Mobile shelving, compact shelving, compact storage, rolling shelving, movable shelves, moving-aisle shelving, rail shelving and high-density filing all mean the same thing: storage on carriages that roll on floor rails, so rows close up and open one aisle at a time.',
    sections: [
      { h2: 'Manual, mechanical-assist or powered', p: 'The drive is the biggest choice in a mobile system. We choose it from row length, how much each row carries, and how often people open aisles.',
        table: { head: ['Drive', 'How it moves', 'Best for', 'Good to know'], rows: [
          ['Manual', 'Push or pull the end of the row', 'Short rows, light loads, closets and small file rooms', 'Lowest cost, nothing to wire'],
          ['Mechanical-assist', 'Turn a handle; gearing does most of the work', 'Most offices, records rooms, museums and gear rooms', 'No electrical work; one person can move heavily loaded rows'],
          ['Powered', 'Push a button', 'Long or heavy rows, busy rooms, secure storage', 'Motion sensors, aisle locks and access control; needs power to each row'],
        ] } },
      { h2: 'What can ride on carriages', cards: [
        ['Four-post and case shelving', 'Files, records, boxes and supplies', 'four-post-shelving'],
        ['Library and cantilever shelving', 'Books, bound volumes and media', 'cantilever-shelving'],
        ['Cabinets, drawers and flat files', 'Museum objects, maps and drawings', 'museum-cabinets'],
        ['Art screens and textile racks', 'Framed art, costumes and rolled textiles', 'art-screens'],
        ['Pallet rack', 'Heavy and palletized loads', 'pallet-rack'],
        ['Gear and weapons storage', 'Team gear, uniforms and armory storage', 'athletic-storage'],
      ] },
      { h2: 'How a mobile system goes in', steps: [
        ['Walk-through', 'We measure the room, note doors, columns, sprinklers and lights, and list what you need to store.'],
        ['Layout and loads', 'We draw the rows and the aisle, and give your engineer of record the loading data so they can confirm the floor.'],
        ['Rails', 'Set on the existing floor with a ramped deck, or recessed into a new slab or pour so the floor stays flush.'],
        ['Carriages and shelving', 'Carriages go on the rails, then the shelving, end panels and accessories.'],
        ['Adjust, test and train', 'Every row is leveled and tested, and your staff learns the locks and safety features.'],
      ] },
    ],
    faqs: [
      ['What are movable shelves called?', 'Most people call them mobile shelving, compact shelving or high-density storage. Rolling shelves, moving-aisle shelving and rail shelving mean the same thing: rows of storage on carriages that roll on floor rails.'],
      ['Mobile or static shelving: how much more fits?', 'Static shelving needs an aisle in front of every row. A mobile system shares one moving aisle across a group of rows, so the same room often holds up to about twice as much. We measure your room and what you store before giving you a number.'],
      ['What does a mobile shelving system cost?', 'Price depends on the size of the room, how many rows there are and how long they run, the drive, what sits on the carriages, and the floor work. We price it after a walk-through so the number reflects your room, not a rule of thumb.'],
      ['Can mobile shelving go on an upper floor?', 'Often, yes. Mobile storage concentrates weight, so your engineer of record reviews the floor using the loading data we provide. The structural decision is theirs.'],
    ],
  },
  'static-shelving': {
    aka: 'Steel shelving, metal shelving, four-post shelving, industrial shelving and case-type shelving: adjustable steel shelving that stays in place, from a single supply closet to a full records room.',
    sections: [
      { h2: 'Open, closed or case-type', table: { head: ['Type', 'What it is', 'Best for'], rows: [
        ['Open four-post', 'A post at each corner, open on every side', 'Supplies, parts, boxes and stockrooms'],
        ['Closed', 'Back and side panels enclose each section', 'Files, records and anything that should not fall through'],
        ['Case-type and cantilever', 'Sections share panels and shelves hang from the uprights', 'Libraries, offices and finished spaces'],
      ] } },
      { h2: 'Built-in woodwork or modular steel?', p: 'Built-ins look good in a lobby, but storage rooms change. Steel shelving adjusts as your needs change, moves when you move, and can go onto mobile carriages later. For working storage, modular steel usually costs less over its life than custom carpentry.' },
    ],
    faqs: [
      ['Is it cheaper to build shelves or buy them?', 'For working storage, buying modular steel shelving is usually the better value. It goes in faster than custom carpentry, adjusts as your needs change, and can be moved or converted to mobile storage later. Built-in woodwork makes sense for finished spaces where looks come first.'],
      ['Can we start with static shelving and go mobile later?', 'Yes. We often lay out four-post shelving so it can move onto carriages when space runs out, which can spread the cost over two budget years.'],
    ],
  },
  'lifts-carousels': {
    aka: 'Vertical lift modules (VLMs), vertical storage lifts and automated storage towers bring trays to the person picking. A vertical carousel is a different machine: its shelves rotate around a loop until the one you need reaches the opening.',
    sections: [
      { h2: 'Shelving or a vertical lift?', table: { head: ['', 'Static shelving', 'Vertical lift module'], rows: [
        ['Floor space', 'An aisle for every row', 'One tower uses the ceiling height'],
        ['Picking', 'Walk, search and climb', 'The tray comes to a waist-high opening'],
        ['Inventory', 'Manual counts', 'Software logs every pick and every user'],
        ['Security', 'Open shelving or a locked room', 'Access by user, tray or item'],
        ['Cost', 'Lower up front', 'Higher up front, paid back in floor space and labor'],
      ] } },
    ],
    faqs: [
      ['When does a vertical lift module beat shelving?', 'When a parts or supply room is out of space, picking takes too long, or items need to be tracked. If none of those are true, shelving is usually the better buy, and we will tell you so.'],
      ['What is the difference between a VLM and a vertical carousel?', 'A VLM stores trays on both sides of a lift that pulls the tray you ask for and delivers it to the opening, and tray spacing adjusts to the height of what you store. A vertical carousel rotates all of its shelves around a loop until the one you need reaches the opening, with fixed shelf spacing.'],
    ],
  },
  'lockers': {
    aka: 'Smart lockers, electronic lockers, package lockers, day-use lockers, personal storage lockers, athletic lockers and evidence lockers.',
    faqs: [
      ['How do smart lockers work?', 'Each door has an electronic lock tied to software. A person opens an assigned door with a code, badge or phone, and the system logs every deposit and pickup. Doors can be assigned for a day, a shift or permanently.'],
      ['What does a smart locker system cost?', 'Cost depends on the number and size of doors, how people open them (code, badge or app), the software, and whether it ties into your badge system. We price it once we know how the lockers will be used.'],
    ],
  },
  'evidence-lockers': {
    aka: 'Evidence lockers, temporary evidence lockers, pass-through lockers, property lockers, refrigerated evidence lockers and drug drop boxes.',
    faqs: [
      ['What is an evidence locker?', 'A secure compartment where an officer deposits evidence so the chain of custody is never broken. Once a door closes, only the evidence custodian can open it again.'],
      ['Pass-through or non-pass-through?', 'Pass-through lockers sit in a wall between the officer side and the evidence room: the officer loads from the front and the custodian unloads from the secure back. Non-pass-through lockers load and unload from the same side and suit smaller departments or rooms without a shared wall.'],
      ['Where do police departments store evidence?', 'In a secure property and evidence room with controlled access, usually behind temporary lockers where officers drop items. Long-term storage is often high-density shelving, drug and weapons cages, and refrigerated lockers for biological evidence.'],
    ],
  },
  'modular-casework': {
    aka: 'Modular casework, manufactured casework, laboratory casework and modular cabinetry: factory-built cabinets, work surfaces and shelving for labs, classrooms, offices and mailrooms.',
    faqs: [
      ['What is the difference between casework and cabinetry?', 'Casework is the commercial term for cabinets and counters built in a factory and installed as a system, usually specified in Division 12 (for example 12 35 53 for laboratory casework). Cabinetry usually means residential or site-built woodwork. Modular casework can be moved and reconfigured when a room changes.'],
      ['Can modular casework be moved later?', 'Yes. Modular and mobile units can be rearranged or relocated when departments change, which is a main reason labs and schools choose it over built-ins.'],
    ],
  },
  'museums': {
    sections: [
      { h2: 'Storage by collection type', p: 'Collections staff think in object types, so we plan that way too. Most collections storage rooms combine several of these, often on mobile carriages.',
        cards: [
          ['Paintings and framed works', 'Pull-out art screens and wall-hung racks', 'art-screens'],
          ['Works on paper, maps and drawings', 'Flat files and box shelving for solander boxes', 'museum-cabinets'],
          ['Textiles and costumes', 'Rolled-textile racks, garment storage and wide drawers', 'museum-cabinets'],
          ['Natural history specimens', 'Sealed specimen cabinets with drawer inserts', 'museum-cabinets'],
          ['Archives and photographs', 'High-density shelving for archival boxes', 'high-density-mobile-storage'],
          ['Three-dimensional objects', 'Open shelving and padded cabinets, sized to the objects', 'cabinets'],
        ] },
    ],
    faqs: [
      ['What makes a museum cabinet conservation grade?', 'Gasketed doors that keep out dust and pests, finishes that do not off-gas, and drawers and shelves that hold objects steady. We review the specification with your collections staff and conservator before anything is ordered.'],
      ['Can collections storage be planned before the objects are inventoried?', 'Yes. We start from object types and rough counts, leave room to grow, and refine the layout as the inventory firms up.'],
    ],
  },
};

function table(t) {
  return `<div class="gx-table"><table><thead><tr>${t.head.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${t.rows.map((r) => `<tr>${r.map((c, i) => (i === 0 ? `<th>${c}</th>` : `<td>${c}</td>`)).join('')}</tr>`).join('')}</tbody></table></div>`;
}

function sectionHtml(s) {
  return `<div class="gx-sec"><h2>${s.h2}</h2>${s.p ? `<p>${s.p}</p>` : ''}${s.table ? table(s.table) : ''}${s.cards ? `<div class="gx-cards">${s.cards.map(([t, d, href]) => `<a class="gx-card" href="${href}.html"><b>${t}</b><span>${d}</span></a>`).join('')}</div>` : ''}${s.steps ? `<ol class="gx-steps">${s.steps.map(([t, d]) => `<li><b>${t}</b><span>${d}</span></li>`).join('')}</ol>` : ''}</div>`;
}

// short quote form on solution and product pages (the mockup posts to the contact page with the product filled in)
function quickQuote(slug, name) {
  const states = ['Pennsylvania', 'New Jersey', 'Delaware', 'Maryland', 'Washington, DC', 'New York', 'Somewhere else'];
  return `<form class="gx-quote" action="contact.html" method="get">
  <input type="hidden" name="topic" value="quote"><input type="hidden" name="product" value="${slug}">
  <div><h2>Get pricing for ${esc(name.replace(/ \(.*\)$/, ''))}</h2><p>Tell us a little about the space. We will follow up to set up a walk-through.</p></div>
  <div class="gx-fields">
    <label>Name<input name="name" autocomplete="name"></label>
    <label>Organization<input name="org" autocomplete="organization"></label>
    <label>Email<input name="email" type="email" autocomplete="email"></label>
    <label>Phone<input name="phone" type="tel" autocomplete="tel"></label>
    <label>Project location<select name="state">${states.map((s) => `<option>${s}</option>`).join('')}</select></label>
    <label class="gx-wide">What are you storing?<textarea name="msg" rows="3"></textarea></label>
    <button class="btn" type="submit">Request pricing</button>
  </div>
</form>`;
}

function extra(slug, name, kind) {
  const d = PILLAR[slug] || {};
  const parts = [];
  if (d.aka) parts.push(`<p class="gx-aka"><b>Also called:</b> ${d.aka}</p>`);
  for (const s of d.sections || []) parts.push(sectionHtml(s));
  if (kind !== 'industry') parts.push(quickQuote(slug, name));
  if (d.faqs) parts.push(`<p class="gx-more">More plain answers: <a href="storage-questions.html">Storage questions answered</a></p>`);
  return parts.join('\n');
}
const faqs = (slug) => (PILLAR[slug] && PILLAR[slug].faqs) || [];

// one page of answers, grouped, linking back to the product pages
const QA_GROUPS = [
  ['Mobile and high-density storage', 'high-density-mobile-storage'],
  ['Shelving', 'static-shelving'],
  ['Vertical lifts and carousels', 'lifts-carousels'],
  ['Lockers and smart lockers', 'lockers'],
  ['Evidence storage', 'evidence-lockers'],
  ['Casework', 'modular-casework'],
  ['Museum and collections storage', 'museums'],
];
function answersPage(shell, img) {
  const groups = QA_GROUPS.map(([h, slug]) => `<div class="faq gx-qa"><h2>${h}</h2>
      ${faqs(slug).map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('\n      ')}
      <p class="gx-more"><a href="${slug}.html">More about ${h.toLowerCase()}</a></p></div>`).join('\n');
  return shell(`Storage Questions Answered | O'Brien Systems`, img, `
<div class="page-hero">
  <div class="wrap crumbs"><a href="index.html">Home</a> / <a href="resources.html">Resources</a> / Storage questions</div>
  <div class="wrap">
    <span class="eyebrow">Resources</span>
    <h1>Storage questions, answered plainly</h1>
    <p>Short answers to the questions people ask most about mobile shelving, lockers, vertical lifts, casework and collections storage. If yours is not here, call 610.825.3405.</p>
  </div>
</div>
<section class="block"><div class="wrap">
${groups}
</div></section>`);
}

// state map for About (same data as obriensys.com: states shaded, no cities or counts)
function aboutMap() {
  let m;
  try { m = JSON.parse(fs.readFileSync('C:/tools/obriensys-web/site/src/data/install-states.json', 'utf8')); } catch { return ''; }
  const other = m.states.filter((s) => s.level === 1).length;
  return `<section class="block gx-map"><div class="wrap">
  <span class="eyebrow">Where we work</span>
  <h2>Up and down the East Coast</h2>
  <p>Based in Conshohocken, Pennsylvania since 1979. Most of our work is in Pennsylvania, New Jersey, Delaware, Maryland, Washington DC and New York, and we have followed clients to projects in ${other} more states.</p>
  <figure><svg viewBox="0 0 ${m.w} ${m.h}" role="img" aria-label="Map of the United States shading the states where O'Brien Systems has installed storage">
    <g>${m.states.map((s) => `<path class="l${s.level}" d="${s.d}"><title>${s.name}</title></path>`).join('')}</g>
    <path class="gx-border" d="${m.border}"/>
    <g class="gx-hq"><circle cx="${m.hq[0]}" cy="${m.hq[1]}" r="6"/><text x="${m.hq[0] - 12}" y="${m.hq[1] - 12}">Conshohocken HQ</text></g>
  </svg>
  <figcaption><span><i class="l2"></i>Where most of our work is</span><span><i class="l1"></i>Other states we have worked in</span></figcaption></figure>
</div></section>`;
}

const CSS = `
.gx-aka{margin-top:34px;padding:16px 20px;background:var(--mist);border-left:4px solid var(--teal);border-radius:8px;color:#39494c}
.gx-sec{margin-top:52px}
.gx-sec h2{font-size:1.5rem;margin-bottom:10px}
.gx-sec>p{color:#39494c;max-width:70ch;margin-bottom:16px}
.gx-table{overflow-x:auto;border:1px solid var(--line);border-radius:12px}
.gx-table table{width:100%;border-collapse:collapse;font-size:.95rem;min-width:560px}
.gx-table th,.gx-table td{padding:12px 16px;text-align:left;vertical-align:top;border-bottom:1px solid var(--line)}
.gx-table thead th{background:var(--teal-ink);color:#fff;font-weight:700}
.gx-table tbody th{color:var(--teal-ink);background:var(--mist);white-space:nowrap}
.gx-table tr:last-child>*{border-bottom:0}
.gx-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.gx-card{display:block;padding:16px 18px;border:1px solid var(--line);border-radius:12px;background:#fff;color:var(--ink)}
.gx-card b{display:block;color:var(--teal-ink);margin-bottom:4px}
.gx-card span{color:var(--muted);font-size:.93rem}
.gx-card:hover{border-color:var(--teal);box-shadow:var(--shadow)}
.gx-steps{list-style:none;counter-reset:s;display:grid;grid-template-columns:repeat(5,1fr);gap:12px}
.gx-steps li{counter-increment:s;padding:16px;border-top:3px solid var(--teal);background:var(--mist);border-radius:0 0 10px 10px}
.gx-steps li::before{content:counter(s);display:block;font-weight:800;color:var(--teal);margin-bottom:4px}
.gx-steps b{display:block;color:var(--teal-ink)}
.gx-steps span{font-size:.92rem;color:#39494c}
.gx-quote{margin-top:56px;display:grid;grid-template-columns:.8fr 1.2fr;gap:28px;padding:28px;background:var(--teal-ink);color:#fff;border-radius:var(--radius)}
.gx-quote h2{color:#fff;font-size:1.5rem;margin-bottom:8px}
.gx-quote p{opacity:.9}
.gx-fields{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.gx-fields label{display:flex;flex-direction:column;font-size:.85rem;font-weight:600;gap:4px}
.gx-fields input,.gx-fields select,.gx-fields textarea{font:inherit;padding:9px 11px;border-radius:8px;border:0}
.gx-fields .gx-wide{grid-column:1/-1}
.gx-fields .btn{grid-column:1/-1;justify-self:start;background:#e8a33d;color:var(--teal-ink);border:0;cursor:pointer}
.gx-more{margin-top:14px;font-weight:600}
.gx-qa{margin-top:36px}
.gx-map p{color:#39494c;max-width:72ch;margin:10px 0 22px}
.gx-map figure{background:var(--mist);border-radius:var(--radius);padding:18px}
.gx-map svg{width:100%;height:auto;display:block}
.gx-map path{stroke:#fff;stroke-width:.8}
.gx-map path.l0{fill:#e3e9e9}.gx-map path.l1{fill:#9fcfd0}.gx-map path.l2{fill:var(--teal)}
.gx-border{fill:none}
.gx-hq circle{fill:#fff;stroke:#c4572a;stroke-width:3}
.gx-hq text{font:700 15px var(--font);fill:#c4572a;text-anchor:end;paint-order:stroke;stroke:var(--mist);stroke-width:4px}
.gx-map figcaption{display:flex;flex-wrap:wrap;gap:8px 22px;justify-content:center;margin-top:12px;font-size:.9rem;color:#39494c}
.gx-map figcaption i{display:inline-block;width:14px;height:14px;border-radius:3px;vertical-align:-2px;margin-right:6px}
.gx-map figcaption i.l2{background:var(--teal)}.gx-map figcaption i.l1{background:#9fcfd0}
@media(max-width:900px){.gx-cards{grid-template-columns:1fr 1fr}.gx-steps{grid-template-columns:1fr 1fr}.gx-quote{grid-template-columns:1fr}}
@media(max-width:560px){.gx-cards,.gx-steps,.gx-fields{grid-template-columns:1fr}}
`;

module.exports = { PILLAR, extra, faqs, answersPage, aboutMap, quickQuote, CSS };
