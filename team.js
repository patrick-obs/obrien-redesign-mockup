// General Contractors and Architects & Designers: their own section, outside Industries (Jess's copy changes, Oct 2026).
// The old combined page (general-contractors.html) is now the GC page, and design-specify.html is merged into
// architects-designers.html. Copy is Jess Viola's, from OBS_Website_Copy_Changes_final.xlsx (#280-295, #304-308).
// Rules held: no manufacturer count, no "authorized dealer", floor determinations stay with the engineer of record.
module.exports = function team({ shell, IMGS, SR, SRDATA, X }) {
  const li = (a) => a.map(t => `<li>${t}</li>`).join('');
  const crumbs = (name) => `<div class="wrap crumbs"><a href="index.html">Home</a> / For GCs &amp; Architects / ${name}</div>`;
  const hero = ({ name, eyebrow, sr, h1, lead }) => `
<div class="page-hero">
  ${crumbs(name)}
  <div class="wrap">
    <span class="eyebrow">${eyebrow}</span>
    <h1>${h1}</h1>
    ${SR(sr, true)}
    <p>${lead}</p>
  </div>
</div>`;
  const formNote = `<p class="note" style="margin-top:14px;margin-bottom:0">Design mockup: this form isn't wired up yet. The production version connects to the same Forminator backend as the current site.</p>`;

  /* ---------------- General Contractors ---------------- */
  const steps = [
    ['01', 'Pre-bid &amp; specification', ['Spec review and takeoffs', 'Itemized quotes matched to the specification', 'Spec-or-equal options from several manufacturers']],
    ['02', 'Review &amp; value engineering', ['Scope and contract review', 'Equal products that protect the budget and the design intent', 'Coordination with the architect and owner']],
    ['03', 'Submittals &amp; permitting', ['Shop drawings, CAD layouts, product data, finish selections, and lead-time schedules', 'Equipment loading data for the structural engineer of record', 'Layout drawings to support your permit application', 'Background checks and other clearances as each job requires']],
    ['04', 'Installation &amp; closeout', ['Deliveries sequenced to the construction schedule', 'Installation by our own factory-trained crews', 'AIA G702/G703 progress billing and retainage', 'Punch list, warranty, and ongoing service']],
  ];
  const gc = shell(`General Contractors | O'Brien Systems`, IMGS.gcProject, `${hero({
    name: 'General Contractors', eyebrow: 'For general contractors', sr: SRDATA['general-contractors'], h1: 'General Contractors',
    lead: 'A storage subcontractor that provides complete submittals, works to your schedule, and handles Division 10 storage scope from start to finish.',
  })}
<section class="block">
  <div class="wrap twocol">
    <div class="body">
      <p>General contractors bring us in when a project includes storage scope: evidence rooms in a public safety building, library stacks, lab casework, lockers, or high-density mobile storage in a records center. We take the package from specification through punch list, so your team can focus on the rest of the build.</p>
    </div>
    <div class="side-img"><img src="${IMGS.gcNewSpace}" alt="General contractors: storage scope from specification through punch list" loading="lazy"></div>
  </div>
  <div class="wrap">
    <span class="eyebrow" style="margin-top:52px;display:inline-block">How we work</span>
    <h2 style="font-size:1.5rem">Our process</h2>
    <div class="steps">
      ${steps.map(([n, t, items]) => `<div class="step"><span class="n">${n}</span><h3>${t}</h3><ul>${li(items)}</ul></div>`).join('\n      ')}
    </div>
    <span class="eyebrow" style="margin-top:52px;display:inline-block">Code &amp; Site Coordination</span>
    <h2 style="font-size:1.5rem">The things that get storage packages red-lined</h2>
    <p class="lead">Storage equipment lives inside someone else's code envelope. These are the coordination items we design around from the first layout, so they're addressed long before inspection.</p>
    <div class="feat">
      <div><b>ADA clearances</b><span>Accessible aisle widths, reach ranges, and clear-floor space at lockers, shelving, and service points, worked into the layout, not patched after review</span></div>
      <div><b>Fire sprinklers</b><span>Top-shelf and canopy heights planned to sprinkler-deflector clearance requirements, with layouts ready for the fire protection engineer's review</span></div>
      <div><b>Egress &amp; fire exits</b><span>Aisle widths, travel distances, and exit paths preserved, including when mobile carriages are parked; powered systems that can be programmed to hold aisles open</span></div>
      <div><b>Electrical &amp; data rough-in</b><span>Powered mobile systems, VLMs, and smart lockers need power and network in the right place. We hand the electrician exact locations at rough-in, not at delivery</span></div>
      <div><b>Floor loads</b><span>Complete equipment loading data for the structural engineer of record, early enough to matter. The determination is always the engineer's; the data package is always ours</span></div>
      <div><b>Aisles sized to the equipment</b><span>Forklift turning aisles, cart and pallet-jack clearances, or person-only access, sized to how the room will actually run, use case by use case</span></div>
    </div>
    <span class="eyebrow" style="margin-top:52px;display:inline-block">Public work</span>
    <h2 style="font-size:1.5rem">Small business participation</h2>
    <p class="lead">O'Brien Systems is a Commonwealth of Pennsylvania Small Business (SB) certified vendor, which can help prime contractors meet small business participation goals on public work. For federal projects, many of the manufacturers we work with hold GSA contracts.</p>
    <div class="gallery">
      <div class="g" style="background-image:url('${IMGS.mezzanine}')"></div>
      <div class="g" style="background-image:url('${IMGS.maximize}')"></div>
      <div class="g" style="background-image:url('${IMGS.svc3}')"></div>
    </div>
    <div class="twocol" style="margin-top:52px">
      <div class="form">
        <h2>Have a project with storage scope?</h2>
        <p class="note">Send us the drawings or spec section, and we'll help you price it.</p>
        <div class="row">
          <div><label for="g-name">Name</label><input id="g-name" type="text"></div>
          <div><label for="g-company">Company</label><input id="g-company" type="text"></div>
        </div>
        <div class="row">
          <div><label for="g-email">Email</label><input id="g-email" type="email"></div>
          <div><label for="g-phone">Phone</label><input id="g-phone" type="tel"></div>
        </div>
        <div class="row">
          <div><label for="g-loc">Project location</label><input id="g-loc" type="text"></div>
          <div><label for="g-bid">Bid date</label><input id="g-bid" type="date"></div>
        </div>
        <label for="g-msg">Message</label>
        <textarea id="g-msg" rows="4"></textarea>
        <label for="g-file">Drawings or spec section</label>
        <input id="g-file" type="file" multiple>
        <button class="btn btn-solid" type="button" onclick="this.textContent='Sent (mockup only)'">Send Project Details</button>
        ${formNote}
      </div>
      <div class="side-img" style="align-self:stretch;display:flex;flex-direction:column;justify-content:center;gap:12px;background:var(--mist);border:1px solid var(--line);border-radius:var(--radius);padding:30px">
        <h2 style="font-size:1.35rem">Explore our solutions</h2>
        <p style="color:#39494c">From high-density mobile storage to lockers, shelving, and casework, see the full range of storage systems we design and install.</p>
        <p><a class="btn btn-solid" href="solutions.html">Explore Solutions &rarr;</a></p>
      </div>
    </div>
  </div>
</section>${X.viewer3d('general-contractors', 'General Contractors')}`);

  /* ---------------- Architects & Designers ---------------- */
  const help = [
    ['Space planning &amp; programming', "Site visits, an inventory of what's being stored, and capacity planning for future growth"],
    ['Layouts on your plans', "Send a CAD or PDF plan, and we'll return a storage layout with capacities"],
    ['Spec language', 'Performance specs written around the requirement, not one brand, so bids stay competitive, plus honest guidance when an equal is proposed'],
    ['Load data', 'Complete equipment loading data for your structural engineer of record, who makes the floor determination'],
    ['Submittals', 'Shop drawings, product data, and samples, then installation coordinated with the GC'],
    ['Code coordination', 'ADA clearances, sprinkler clearances, egress, and electrical and data rough-in, worked into the layout from the start'],
  ];
  const ad = shell(`Architects & Designers | O'Brien Systems`, IMGS.gcProject, `${hero({
    name: 'Architects &amp; Designers', eyebrow: 'For architects &amp; designers', sr: SRDATA['architects-designers'], h1: 'Architects &amp; Designers',
    lead: 'Storage planning and specification support for architects and designers, from early programming through construction documents.',
  })}
<section class="block">
  <div class="wrap twocol">
    <div class="body">
      <p>Storage often takes up more of a building program than expected, and the details matter: floor loads, aisle widths, sprinkler clearances, and how the space will be used day to day. We help design teams plan storage early, so it fits the program, the budget, and the building. We work with architects and designers throughout the Philadelphia region and beyond.</p>
    </div>
    <div class="side-img"><img src="${IMGS.gcNewSpace}" alt="Storage planned early in the design process" loading="lazy"></div>
  </div>
  <div class="wrap">
    <h2 class="sec-h">How we help</h2>
    <div class="feat">
      ${help.map(([t, d]) => `<div><b>${t}</b><span>${d}</span></div>`).join('\n      ')}
    </div>
    ${X.csiTable()}
    <h2 class="sec-h">Manufacturer specs, CAD and Revit</h2>
    <p class="lead">Every manufacturer we work with publishes its own specifications, data sheets, and CAD or Revit content. Tell us what you're drawing, and we'll send the current files for the products on your project, so your documents match what gets installed.</p>
    <p style="margin-top:18px"><a class="btn btn-solid" href="resources.html">Browse resources</a> <a class="btn btn-ghost" href="contact.html?topic=cad">Request CAD / Revit</a></p>
    <h2 class="sec-h">AIA-certified lunch and learns</h2>
    <p class="lead">We offer AIA-certified lunch and learns for architecture and design firms, covering storage planning and specification. Contact us to schedule one for your team.</p>
    <p style="margin-top:18px"><a class="btn btn-solid" href="contact.html?topic=lunch">Request a lunch and learn</a></p>
    <h2 class="sec-h">Built for the owner, too</h2>
    <p class="lead">Owners want storage that fits the program's real volumes, budget options from several manufacturers, and a local service partner who still answers the phone years after turnover. We design with all three in mind.</p>
    <div class="spec" style="margin-top:44px">
      <div class="spec-l"><span class="eyebrow">Working on a project?</span><h2>Send us the plan</h2><p style="margin:0">We'll return a layout, capacities, and a budget number for the storage scope.</p></div>
      <div class="spec-r">
        <a class="btn btn-solid" href="contact.html?topic=cad">Request a layout or CAD</a>
        <a class="btn btn-ghost" href="contact.html?topic=lunch">Book an AIA-certified lunch and learn</a>
        <a class="btn btn-ghost" href="general-contractors.html">For general contractors &rarr;</a>
      </div>
    </div>
    <div class="form" style="margin-top:44px;max-width:760px">
      <h2>Working on a project with storage?</h2>
      <div class="row">
        <div><label for="a-name">Name</label><input id="a-name" type="text"></div>
        <div><label for="a-firm">Firm</label><input id="a-firm" type="text"></div>
      </div>
      <div class="row">
        <div><label for="a-email">Email</label><input id="a-email" type="email"></div>
        <div><label for="a-phone">Phone</label><input id="a-phone" type="tel"></div>
      </div>
      <label for="a-loc">Project location</label>
      <input id="a-loc" type="text">
      <label for="a-msg">Message</label>
      <textarea id="a-msg" rows="4"></textarea>
      <label class="chk" style="display:flex;gap:8px;align-items:center;font-weight:600;margin-top:14px"><input id="a-lunch" type="checkbox" style="width:auto"> I'm interested in a lunch and learn.</label>
      <button class="btn btn-solid" type="button" onclick="this.textContent='Sent (mockup only)'">Send Project Details</button>
      ${formNote}
    </div>
  </div>
</section>${X.viewer3d('design-specify', 'the install')}`);

  return { 'general-contractors.html': gc, 'architects-designers.html': ad };
};
