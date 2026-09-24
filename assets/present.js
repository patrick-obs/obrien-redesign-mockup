// Customer presentations: one page that shows a chosen set of 3D models for one customer.
// present.html?c=<config> renders it; present-builder.html makes the config, a link, or a single self-contained HTML file.
// config: { n: customer, t: headline, p: message, m: [model ids], full: all options on, by: name, em: email, ph: phone }

const enc = (o) => btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(o)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const dec = (s) => JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))));
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// the page body both the hosted page and the downloaded file use
export function presentBody(cfg, logo) {
  const by = cfg.by ? `<b>${esc(cfg.by)}</b>` : '<b>O\'Brien Systems</b>';
  const em = cfg.em || 'sales@obriensys.com', ph = cfg.ph || '610.825.3405';
  return `
<header class="pz-top"><div class="wrap"><img src="${logo}" alt="O'Brien Systems"><span class="pz-for">Prepared for <b>${esc(cfg.n || 'you')}</b></span><a class="btn btn-solid" href="mailto:${esc(em)}?subject=${encodeURIComponent('Storage for ' + (cfg.n || 'our space'))}">Talk to us</a></div></header>
<section class="pz-hero"><div class="wrap"><span class="eyebrow">Interactive preview</span><h1>${esc(cfg.t || 'Storage built around how you work')}</h1>${cfg.p ? `<p>${esc(cfg.p).replace(/\n/g, '<br>')}</p>` : ''}
<p class="pz-how">Drag to turn a model. Tap a door, drawer or carriage to see it move, or step inside to walk the aisle.</p></div></section>
<section class="v3d-sec pz-3d"><div class="wrap"><div class="v3d${cfg.m.length > 1 ? ' v3d-big' : ''}"${cfg.m.length > 1 ? ' data-layout="side"' : ''} data-models="${esc(cfg.m.join(','))}"${cfg.full ? '' : ' data-lite="1"'}></div></div></section>
<footer class="pz-foot"><div class="wrap"><p>Prepared by ${by} &middot; <a href="mailto:${esc(em)}">${esc(em)}</a> &middot; <a href="tel:${esc(ph.replace(/\D/g, ''))}">${esc(ph)}</a></p><p class="pz-small">O'Brien Systems, Philadelphia region. Representative models: sizes, finishes and accessories vary by configuration. We lay out the real thing in your space at a free assessment.</p></div></footer>`;
}

export const PRESENT_CSS = `.pz-top{background:#fff;border-bottom:1px solid var(--line,#e3e9e9);position:sticky;top:0;z-index:20}.pz-top .wrap{display:flex;align-items:center;gap:18px;padding-top:12px;padding-bottom:12px}.pz-top img{height:44px;width:auto}.pz-for{flex:1;color:#5b6b6c;font-size:.95rem}.pz-for b{color:#0b1b1c}
.pz-hero{padding:44px 0 8px}.pz-hero h1{font-size:clamp(1.8rem,3.4vw,2.6rem);margin:.3em 0 .4em;max-width:820px}.pz-hero p{max-width:760px;color:#34474a;font-size:1.05rem;line-height:1.55}.pz-hero .pz-how{color:#5b6b6c;font-size:.95rem}
.pz-3d{padding-top:24px}.pz-foot{padding:28px 0 40px;color:#34474a}.pz-foot a{color:var(--teal,#0f7377)}.pz-small{font-size:.85rem;color:#6b7b7c}
@media (max-width:640px){.pz-for{font-size:.82rem}.pz-top img{height:34px}.pz-top .btn{padding:8px 12px;font-size:.85rem}}`;

// a single HTML file that runs anywhere: every module inlined through an import map, paintings and logo as data URLs
export async function standalone(cfg, root = './') {
  const text = p => fetch(root + p).then(r => { if (!r.ok) throw new Error(p + ' ' + r.status); return r.text(); });
  const dataUrl = async (p, type) => { const b = new Uint8Array(await (await fetch(root + p)).arrayBuffer()); let s = ''; for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode(...b.subarray(i, i + 0x8000)); return `data:${type};base64,${btoa(s)}`; };
  const [three, orbit, room, bgu, models, viewer, css, paint, logo] = await Promise.all([
    text('assets/vendor/three.module.min.js'), text('assets/vendor/OrbitControls.js'), text('assets/vendor/RoomEnvironment.js'), text('assets/vendor/BufferGeometryUtils.js'),
    text('assets/3d/models.js'), text('assets/3d/viewer.js'), text('assets/style.css'), dataUrl('assets/3d/paintings.jpg', 'image/jpeg'), dataUrl(cfg.logoPath, 'image/png'),
  ]);
  const b64 = s => { const b = new TextEncoder().encode(s); let o = ''; for (let i = 0; i < b.length; i += 0x8000) o += String.fromCharCode(...b.subarray(i, i + 0x8000)); return btoa(o); };
  const mod = s => 'data:text/javascript;base64,' + b64(s);
  const sib = s => s.replace(/from\s*(['"])\.\/three\.module\.min\.js\1/g, "from 'three'");
  const v = viewer.replace("'../vendor/three.module.min.js'", "'three'").replace("'../vendor/OrbitControls.js'", "'three/orbit'").replace("'../vendor/RoomEnvironment.js'", "'three/room'").replace("'../vendor/BufferGeometryUtils.js'", "'three/bgu'")
    .replace("await import('./models.js' + new URL(import.meta.url).search)", "await import('v3d/models')");
  const mdl = models.replace("new URL('./paintings.jpg', import.meta.url).href", JSON.stringify(paint));
  const map = { imports: { three: mod(three), 'three/orbit': mod(sib(orbit)), 'three/room': mod(sib(room)), 'three/bgu': mod(sib(bgu)), 'v3d/models': mod(mdl) } };
  const title = `${cfg.n ? cfg.n + ': ' : ''}storage solutions from O'Brien Systems`;
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="robots" content="noindex, nofollow">
<title>${esc(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><style>${css.replace(/<\/style/gi, '<\\/style')}\n${PRESENT_CSS}</style>
<script type="importmap">${JSON.stringify(map)}</script>
</head><body>
${presentBody(cfg, logo)}
<script type="module">${v.replace(/<\/script/gi, '<\\/script')}</script>
</body></html>`;
}

// hosted page: read the config from the link, then start the viewer
export async function mountPresent(logo) {
  const q = new URLSearchParams(location.search).get('c');
  let cfg = null; try { cfg = q && dec(q); } catch { cfg = null; }
  const box = document.getElementById('pz');
  if (!cfg || !cfg.m?.length) { box.innerHTML = '<section class="pz-hero"><div class="wrap"><h1>This preview link is incomplete</h1><p>Ask your O\'Brien Systems contact for a fresh link, or call 610.825.3405.</p></div></section>'; return; }
  document.title = `${cfg.n ? cfg.n + ': ' : ''}storage solutions from O'Brien Systems`;
  box.innerHTML = presentBody(cfg, logo);
  await import('./3d/viewer.js' + new URL(import.meta.url).search);
}

export { enc, dec };
