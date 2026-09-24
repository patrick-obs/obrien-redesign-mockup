// O'Brien 3D product models, built in code from typical dimensions (units: inches, y up, front = +z).
// Each model: MODELS[id] = { name, dims, build(ctx) -> { group, actions?, finishes?, setFinish? } }
// ctx: { THREE, tween(obj, key, to, ms), wake() }. Parts with userData.onClick react to clicks.
// Representative only: real configurations vary by manufacturer, size and accessories.

export const MODELS = {};
const def = (id, name, dims, build) => { MODELS[id] = { name, dims, build }; };

/* ---------------- shared kit ---------------- */
function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// football helmet: shell with a raised back, ear hole, a gray face mask and a center stripe; faces +z
function footballHelmet(THREE, shellM, x, y, z, rotY = 0, s = 1) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = rotY; g.scale.setScalar(s);
  const shell = new THREE.Mesh(new THREE.SphereGeometry(5, 22, 16, 0, Math.PI * 2, 0, Math.PI * 0.6), shellM); shell.scale.set(0.92, 1, 1.12); shell.position.y = 1.2; g.add(shell);
  const cheek = new THREE.Mesh(new THREE.SphereGeometry(4.2, 16, 10, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.25), shellM); cheek.scale.set(1, 0.9, 1.1); cheek.position.y = 1.4; g.add(cheek);
  const mask = FB_MASK || (FB_MASK = new THREE.MeshStandardMaterial({ color: 0x9aa1a6, roughness: 0.35, metalness: 0.6 })), white = FB_WHITE || (FB_WHITE = new THREE.MeshStandardMaterial({ color: 0xf4f4f0, roughness: 0.5 })), dark = FB_DARK || (FB_DARK = new THREE.MeshStandardMaterial({ color: 0x151617, roughness: 0.8 }));
  for (const [yy, rr] of [[-0.6, 4.6], [1.2, 4.9], [-2.4, 4.1]]) { const bar = new THREE.Mesh(new THREE.TorusGeometry(rr, 0.28, 6, 18, Math.PI * 0.9), mask); bar.rotation.set(Math.PI / 2, 0, Math.PI * 0.05); bar.position.set(0, yy, 1.4); g.add(bar); }
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 4.4, 6), mask); post.position.set(0, -0.6, 6.1); g.add(post);
  const stripe = new THREE.Mesh(new THREE.SphereGeometry(5.05, 8, 12, -0.12, 0.24, 0.05, Math.PI * 0.52), white); stripe.scale.set(0.92, 1, 1.12); stripe.position.y = 1.2; stripe.rotation.y = Math.PI / 2; g.add(stripe);
  for (const sx of [-1, 1]) { const ear = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.3, 12), dark); ear.rotation.z = Math.PI / 2; ear.position.set(sx * 4.6, 0.6, 0.6); g.add(ear); }
  return g;
}
let FB_MASK = null, FB_WHITE = null, FB_DARK = null;

// athletic gear, shared by the team lockers and mobile athletic storage
const GEAR = {};
function gearKit(THREE) {
  if (GEAR.pad) return GEAR;
  const std = (c, r = 0.6, m = 0.05) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m });
  const tex = (draw, w = 128, h = 64) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d')); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  Object.assign(GEAR, {
    pad: std(0x1d1f22, 0.55), padTrim: std(0xe8e8e4, 0.6), hanger: std(0x9aa1a6, 0.3, 0.8), lace: std(0xf4f4f0, 0.7),
    football: new THREE.MeshStandardMaterial({ roughness: 0.75, map: tex(g => { g.fillStyle = '#6b3a1f'; g.fillRect(0, 0, 128, 64); g.strokeStyle = '#4a2612'; g.lineWidth = 2; for (let x = 0; x < 128; x += 7) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 3, 64); g.stroke(); } g.fillStyle = '#f4f4f0'; g.fillRect(12, 0, 4, 64); g.fillRect(76, 0, 4, 64); }) }),
    bag: [0x1c1d1f, 0x2a4d7a, 0x8c1d2c, 0xe7e4dc, 0x2f5a3e].map(c => std(c, 0.45, 0.1)), trim: [std(0x111213, 0.5), std(0xf2f2ee, 0.5), std(0x9aa1a6, 0.4, 0.5)],
    shaft: std(0xc9ced2, 0.25, 0.9), iron: std(0xb9bfc3, 0.2, 0.95), covers: [0xc4382c, 0x2d4a7c, 0xe8b923, 0xf2f2ee, 0x2f8a4f].map(c => std(c, 0.95)),
    mats: {}, numMat: (n) => GEAR.mats[n] || (GEAR.mats[n] = new THREE.MeshBasicMaterial({ map: GEAR.numTex(n, '#ffffff'), transparent: true, depthWrite: false })),
    nums: {}, numTex: (n, color) => GEAR.nums[n + color] || (GEAR.nums[n + color] = tex(g => { g.clearRect(0, 0, 128, 128); g.fillStyle = color; g.font = 'bold 84px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(n), 64, 70); }, 128, 128)),
  });
  return GEAR;
}
// a jersey on a hanger: body, sleeves, collar and a printed number; hangs from (x, y, z) in the yz plane (rotY turns it)
function jersey(THREE, parent, x, y, z, m, num, rotY = 0) {
  const G = gearKit(THREE), g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = rotY; parent.add(g);
  const box = (w, h, d, mm, px, py, pz, rx = 0) => { const me = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mm); me.position.set(px, py, pz); me.rotation.x = rx; g.add(me); return me; };
  const hook = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.12, 6, 14, Math.PI * 1.3), G.hanger); hook.rotation.y = Math.PI / 2; hook.position.y = 0.4; g.add(hook);
  box(0.3, 0.3, 15, G.hanger, 0, -1.4, 0); box(0.3, 1.6, 0.3, G.hanger, 0, -0.6, 0);
  box(1.2, 24, 15, m, 0, -13.6, 0); for (const s of [1, -1]) box(1.2, 8, 5, m, 0, -4.6, s * 8.4, s * 0.7);
  box(1.3, 1.4, 5, G.padTrim, 0, -1.9, 0);
  for (const s of [1, -1]) { const d = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), G.numMat(num)); d.rotation.y = s * Math.PI / 2; d.position.set(s * 0.62, -12, 0); g.add(d); }
  return g;
}
// football shoulder pads: two domed caps over the shoulders, chest and back plates, white trim, hung by the neck opening
function shoulderPads(THREE, parent, x, y, z, rotY = 0) {
  const G = gearKit(THREE), g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = rotY; parent.add(g);
  for (const s of [1, -1]) {
    const cap = new THREE.Mesh(new THREE.SphereGeometry(4.2, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), G.pad); cap.scale.set(1.05, 0.65, 1.15); cap.position.set(0, -3, s * 5.2); g.add(cap);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(4.3, 0.25, 6, 20), G.padTrim); rim.rotation.x = Math.PI / 2; rim.scale.set(1.05, 1.15, 1); rim.position.set(0, -3, s * 5.2); g.add(rim);
  }
  for (const s of [1, -1]) { const pl = new THREE.Mesh(new THREE.BoxGeometry(0.9, 9, 12), G.pad); pl.position.set(s * 3.6, -8, 0); pl.rotation.z = s * 0.18; g.add(pl); }
  const neck = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.7, 8, 18), G.pad); neck.rotation.x = Math.PI / 2; neck.position.y = -2.2; g.add(neck);
  return g;
}
// a football with laces, long axis along x
function football(THREE, parent, x, y, z, rot = 0) {
  const G = gearKit(THREE), b = new THREE.Mesh(new THREE.SphereGeometry(3.4, 20, 14), G.football); b.scale.set(1.6, 1, 1); b.position.set(x, y, z); b.rotation.y = rot; parent.add(b);
  const l = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.2, 0.5), G.lace); l.position.set(0, 3.35, 0); b.add(l);
  return b;
}
// a golf bag: base, body, side pocket, padded cuff, carry strap, and clubs out the top (headcovers on the woods)
function golfBag(THREE, parent, x, y, z, i, h = 34, lean = 0) {
  const G = gearKit(THREE), g = new THREE.Group(); g.position.set(x, y, z); g.rotation.x = lean; parent.add(g);
  const m = G.bag[i % G.bag.length], trim = G.trim[(i + 1) % 3];
  const cyl = (r1, r2, hh, mm, py, seg = 20) => { const me = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, hh, seg), mm); me.position.y = py; g.add(me); return me; };
  cyl(4.3, 4.3, 2.2, G.trim[0], 1.1); cyl(4.2, 4.4, h - 5.5, m, 2.2 + (h - 5.5) / 2); cyl(4.6, 4.3, 3.3, trim, h - 1.65);
  const pocket = new THREE.Mesh(new THREE.BoxGeometry(5.5, h * 0.42, 2.2), trim); pocket.position.set(0, h * 0.38, 4.2); g.add(pocket);
  const zip = new THREE.Mesh(new THREE.BoxGeometry(0.25, h * 0.4, 0.2), G.hanger); zip.position.set(2.2, h * 0.38, 5.35); g.add(zip);
  const strap = new THREE.Mesh(new THREE.TorusGeometry(6, 0.45, 6, 20, Math.PI), G.trim[0]); strap.rotation.set(0, Math.PI / 2, Math.PI / 2); strap.position.set(0, h * 0.55, -4.4); strap.scale.set(1.4, 1, 1); g.add(strap);
  const top = h;
  for (let c = 0; c < 3; c++) { // woods with knit headcovers
    const cx = -2 + c * 2, cz = -1.6, sh = 9 + c;
    const s = cyl(0.22, 0.22, sh, G.shaft, top + sh / 2, 6); s.position.set(cx, top + sh / 2 - 1, cz);
    // knit sock cover: a neck down the shaft and the rounded head tipped toward the front
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.95, 3, 10), G.covers[(i + c) % 5]); neck.position.set(cx, top + sh - 2.4, cz); g.add(neck);
    const cov = new THREE.Mesh(new THREE.SphereGeometry(1.5, 14, 10), G.covers[(i + c) % 5]); cov.scale.set(1.1, 0.9, 1.45); cov.position.set(cx, top + sh, cz + 0.8); cov.rotation.x = 0.35; g.add(cov);
    const pom = new THREE.Mesh(new THREE.SphereGeometry(0.45, 8, 6), G.covers[(i + c + 2) % 5]); pom.position.set(cx, top + sh + 1.3, cz + 0.5); g.add(pom);
  }
  for (let c = 0; c < 6; c++) { // irons and a putter, blades out the front
    const cx = -2.6 + (c % 3) * 2.6, cz = 0.8 + Math.floor(c / 3) * 1.6, sh = 5.5 + (c % 3) * 0.8;
    const s = cyl(0.18, 0.18, sh, G.shaft, 0, 6); s.position.set(cx, top + sh / 2 - 1, cz);
    // iron heads are thin blades set at an angle to the shaft; the putter is a small flat mallet
    const head = new THREE.Mesh(new THREE.BoxGeometry(c === 5 ? 3 : 2.3, c === 5 ? 0.8 : 1.3, c === 5 ? 1.2 : 0.3), G.iron); head.position.set(cx + 0.9, top + sh - 0.3, cz); head.rotation.set(0.2, 0, c === 5 ? 0.05 : -0.45); g.add(head);
  }
  return g;
}


// small artworks as textures: paintings, architectural drawings, maps, prints
const ART = [];
function artMat(THREE, i) {
  if (!ART.length) for (let n = 0; n < 8; n++) {
    const c = document.createElement('canvas'); c.width = 128; c.height = 96; const g = c.getContext('2d'), q = rng(50 + n);
    if (n % 4 === 0) { const sky = g.createLinearGradient(0, 0, 0, 96); sky.addColorStop(0, ['#8fb8d8', '#e7b07a'][n % 2]); sky.addColorStop(1, '#f3eadb'); g.fillStyle = sky; g.fillRect(0, 0, 128, 96); g.fillStyle = '#4f6b3a'; g.beginPath(); g.moveTo(0, 70); for (let x = 0; x <= 128; x += 16) g.lineTo(x, 55 + q() * 22); g.lineTo(128, 96); g.lineTo(0, 96); g.fill(); }
    else if (n % 4 === 1) { g.fillStyle = '#1f4f8f'; g.fillRect(0, 0, 128, 96); g.strokeStyle = '#dfe9f5'; g.lineWidth = 1; for (let k2 = 0; k2 < 9; k2++) { const x = 10 + q() * 90, y = 10 + q() * 60; g.strokeRect(x, y, 10 + q() * 30, 8 + q() * 24); } g.beginPath(); g.moveTo(6, 88); g.lineTo(122, 88); g.stroke(); }
    else if (n % 4 === 2) { g.fillStyle = '#efe3c6'; g.fillRect(0, 0, 128, 96); g.strokeStyle = '#8a6a3a'; for (let k2 = 0; k2 < 7; k2++) { g.beginPath(); g.moveTo(0, q() * 96); g.bezierCurveTo(40, q() * 96, 80, q() * 96, 128, q() * 96); g.stroke(); } g.fillStyle = '#7ea3b8'; g.beginPath(); g.ellipse(80, 40, 22, 14, 0.4, 0, 7); g.fill(); }
    else { g.fillStyle = '#f6f2e8'; g.fillRect(0, 0, 128, 96); for (let k2 = 0; k2 < 6; k2++) { g.fillStyle = ['#b5563a', '#2d4a7c', '#c9a227', '#2f6b4f'][k2 % 4]; g.fillRect(8 + q() * 80, 8 + q() * 56, 10 + q() * 36, 8 + q() * 30); } }
    g.strokeStyle = 'rgba(0,0,0,.25)'; g.strokeRect(0.5, 0.5, 127, 95);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; ART.push(new THREE.MeshStandardMaterial({ map: t, roughness: 0.85 }));
  }
  return ART[i % ART.length];
}

// real public-domain paintings packed in one atlas: [u, v, w, h, aspect]; each call hands out the next one,
// so a wall of screens shows different works before anything repeats
const PAINT_R = [[0.0, 0.85243, 0.14286, 0.12847, 1.294], [0.15402, 0.83333, 0.12054, 0.16667, 0.844], [0.28571, 0.86111, 0.14286, 0.11198, 1.486], [0.42857, 0.86111, 0.14286, 0.11111, 1.5], [0.57143, 0.85243, 0.14286, 0.12934, 1.289], [0.71429, 0.86111, 0.14286, 0.11111, 1.5], [0.85714, 0.83333, 0.14211, 0.16667, 0.997], [0.0, 0.69618, 0.14286, 0.10764, 1.549], [0.14286, 0.68229, 0.14286, 0.13628, 1.227], [0.3006, 0.66667, 0.11235, 0.16667, 0.786], [0.43601, 0.66667, 0.12723, 0.16667, 0.892], [0.57143, 0.68837, 0.14286, 0.12413, 1.347], [0.71429, 0.69271, 0.14286, 0.11545, 1.447], [0.87277, 0.66667, 0.11161, 0.16667, 0.78], [0.0, 0.5217, 0.14286, 0.12326, 1.352], [0.14286, 0.5217, 0.14286, 0.12413, 1.341], [0.28571, 0.51736, 0.14286, 0.13194, 1.26], [0.43601, 0.5, 0.12798, 0.16667, 0.897], [0.57143, 0.50955, 0.14286, 0.14844, 1.122], [0.74851, 0.5, 0.07366, 0.16667, 0.515], [0.85714, 0.53385, 0.14286, 0.09983, 1.667], [0.0, 0.35764, 0.14286, 0.11892, 1.404], [0.1622, 0.33333, 0.10417, 0.16667, 0.732], [0.30878, 0.33333, 0.09598, 0.16667, 0.671], [0.45238, 0.33333, 0.09449, 0.16667, 0.66], [0.57143, 0.34809, 0.14286, 0.13802, 1.209], [0.73884, 0.33333, 0.09375, 0.16667, 0.655], [0.85714, 0.35243, 0.14286, 0.12847, 1.294], [0.01339, 0.16667, 0.11533, 0.16667, 0.805], [0.14286, 0.20052, 0.14286, 0.09983, 1.675], [0.28571, 0.19358, 0.14286, 0.11285, 1.473], [0.42857, 0.19358, 0.14286, 0.11372, 1.467], [0.58482, 0.16667, 0.11533, 0.16667, 0.805], [0.71429, 0.19531, 0.14286, 0.11024, 1.507], [0.87277, 0.16667, 0.11161, 0.16667, 0.782], [0.0, 0.02083, 0.14286, 0.12587, 1.32]];
let PAINT_TEX = null, paintSeq = 0; const PAINT_M = [], PAINT_CLONES = [];
const paintReset = (n = 0) => { paintSeq = n; };
function painting(THREE) {
  const i = paintSeq++ % PAINT_R.length, [u, v, w, h, a] = PAINT_R[i];
  if (!PAINT_M[i]) {
    if (PAINT_TEX === null) {
      try {
        PAINT_TEX = new THREE.TextureLoader().load(new URL('./paintings.jpg', import.meta.url).href, () => { PAINT_CLONES.forEach(t => { t.image = PAINT_TEX.image; t.needsUpdate = true; }); if (typeof window !== 'undefined') window.dispatchEvent(new Event('v3d-tex')); });
        PAINT_TEX.colorSpace = THREE.SRGBColorSpace;
      } catch { PAINT_TEX = false; }
    }
    if (!PAINT_TEX) PAINT_M[i] = artMat(THREE, i);
    else { const t = PAINT_TEX.clone(); t.offset.set(u, v); t.repeat.set(w, h); t.anisotropy = 4; PAINT_CLONES.push(t); PAINT_M[i] = new THREE.MeshStandardMaterial({ map: t, roughness: 0.75 }); }
  }
  return { m: PAINT_M[i], a };
}

// rolled textiles: quilts, rugs, flags, kilims and runners as canvas patterns, shared by every textile rack
const TEX = [];
function textileMats(THREE) {
  if (TEX.length) return TEX;
  const draws = [
    g => { const cs = ['#b5563a', '#e8d6a8', '#2d4a7c', '#6b8f71', '#c9a227', '#8c3b2f', '#f2efe6', '#5e4a7a']; for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { g.fillStyle = cs[(x * 3 + y * 5) % cs.length]; g.fillRect(x * 16, y * 16, 16, 16); } g.strokeStyle = 'rgba(255,255,255,.55)'; g.setLineDash([2, 2]); for (let i = 0; i <= 128; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 128); g.moveTo(0, i); g.lineTo(128, i); g.stroke(); } }, // quilt
    g => { g.fillStyle = '#8e2323'; g.fillRect(0, 0, 128, 128); g.fillStyle = '#1f2f55'; g.fillRect(0, 0, 128, 14); g.fillRect(0, 114, 128, 14); g.fillStyle = '#d9b36c'; for (const y of [18, 108]) g.fillRect(0, y, 128, 3); for (const [cx, cy] of [[32, 64], [96, 64]]) { g.save(); g.translate(cx, cy); g.rotate(Math.PI / 4); g.fillStyle = '#1f2f55'; g.fillRect(-22, -22, 44, 44); g.fillStyle = '#d9b36c'; g.fillRect(-12, -12, 24, 24); g.fillStyle = '#8e2323'; g.fillRect(-5, -5, 10, 10); g.restore(); } }, // oriental rug
    g => { for (let i = 0; i < 13; i++) { g.fillStyle = i % 2 ? '#f4f1ea' : '#b3202a'; g.fillRect(0, (i * 128) / 13, 128, 128 / 13 + 1); } g.fillStyle = '#23336b'; g.fillRect(0, 0, 58, 69); g.fillStyle = '#f4f1ea'; for (let y = 0; y < 5; y++) for (let x = 0; x < 6; x++) { g.beginPath(); g.arc(6 + x * 9.5 + (y % 2) * 4, 7 + y * 13, 2, 0, 7); g.fill(); } }, // flag
    g => { g.fillStyle = '#e9dcc0'; g.fillRect(0, 0, 128, 128); const cs = ['#a3462c', '#2f4f6f', '#c9a227', '#3d3a36']; for (let b = 0; b < 4; b++) { g.fillStyle = cs[b]; g.beginPath(); for (let x = 0; x <= 128; x += 16) g.lineTo(x, b * 32 + (x % 32 ? 8 : 22)); for (let x = 128; x >= 0; x -= 16) g.lineTo(x, b * 32 + (x % 32 ? 14 : 28)); g.fill(); } }, // kilim
    g => { const cs = ['#2f5a3e', '#e8e0cc', '#a6832f', '#e8e0cc', '#6b1f2a']; let y = 0; for (let i = 0; y < 128; i++) { const h = [14, 4, 8, 4, 22][i % 5]; g.fillStyle = cs[i % 5]; g.fillRect(0, y, 128, h); y += h; } }, // striped runner
    g => { g.fillStyle = '#e6dcc6'; g.fillRect(0, 0, 128, 128); g.fillStyle = '#6a7f9a'; for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { const cx = x * 32 + (y % 2) * 16 + 8, cy = y * 32 + 16; g.beginPath(); g.ellipse(cx, cy, 7, 11, 0.5, 0, 7); g.fill(); g.beginPath(); g.ellipse(cx + 8, cy - 4, 4, 7, -0.6, 0, 7); g.fill(); } }, // toile
  ];
  for (const d of draws) { const c = document.createElement('canvas'); c.width = c.height = 128; d(c.getContext('2d')); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 3); t.anisotropy = 8; TEX.push(new THREE.MeshStandardMaterial({ map: t, roughness: 0.9 })); }
  return TEX;
}

// a framed painting sized to its real proportions, no wider than maxW: { m, fw, fh } (frame adds 1.5" a side)
function framed(THREE, r, maxW, minH = 13, spanH = 28) {
  const pt = painting(THREE); let ih = minH + r() * spanH, iw = ih * pt.a;
  if (iw > maxW - 3) { iw = maxW - 3; ih = iw / pt.a; }
  return { m: pt.m, fw: iw + 3, fh: ih + 3 };
}

// museum objects on a pallet-sized footprint (x, y at the deck, z front edge, w wide, d deep);
// they come from a long catalog in turn, so neighbors differ and repeats are far apart
const OBJ = { seq: 0 };
const OBJ_ORDER = [0, 5, 2, 4, 3, 8, 1, 9, 7, 12, 10, 6, 11, 13, 4, 14];
const objReset = () => { OBJ.seq = 0; };
function museumObjects(THREE, parent, x, y, z, w, d, r, maxH = 44) {
  if (!OBJ.bronze) Object.assign(OBJ, {
    bronze: new THREE.MeshStandardMaterial({ color: 0x8a5a2b, roughness: 0.35, metalness: 0.8 }), marble: new THREE.MeshStandardMaterial({ color: 0xeeeae2, roughness: 0.4 }),
    stone: new THREE.MeshStandardMaterial({ color: 0x9a948a, roughness: 0.85 }), plinth: new THREE.MeshStandardMaterial({ color: 0xf6f6f3, roughness: 0.6 }),
    crate: new THREE.MeshStandardMaterial({ color: 0xc8a06a, roughness: 0.85 }), slat: new THREE.MeshStandardMaterial({ color: 0xa47c48, roughness: 0.85 }), glaze: new THREE.MeshStandardMaterial({ color: 0x2f5a7a, roughness: 0.3, metalness: 0.1 }),
    verd: new THREE.MeshStandardMaterial({ color: 0x4f7d6a, roughness: 0.5, metalness: 0.55 }), terra: new THREE.MeshStandardMaterial({ color: 0xb5653a, roughness: 0.8 }), granite: new THREE.MeshStandardMaterial({ color: 0x2b2c2e, roughness: 0.3, metalness: 0.1 }),
    wood: new THREE.MeshStandardMaterial({ color: 0x6b4428, roughness: 0.6 }),
  });
  const add = (geo, m, px, py, pz, s = [1, 1, 1], rot = 0) => { const me = new THREE.Mesh(geo, m); me.position.set(px, py, pz); me.scale.set(...s); me.rotation.y = rot; me.castShadow = me.receiveShadow = true; parent.add(me); return me; };
  const n = OBJ.seq++, kind = OBJ_ORDER[n % OBJ_ORDER.length], MATS = [OBJ.bronze, OBJ.marble, OBJ.stone, OBJ.verd, OBJ.granite, OBJ.terra], m = MATS[(n * 5 + 1) % MATS.length];
  const cx = x + w / 2, cz = z + d / 2;
  if (kind === 4 || kind === 12) { // crated work, low and wide or tall
    const cw = w * (kind === 4 ? 0.85 : 0.6), ch = Math.min(maxH, kind === 4 ? 18 + r() * 12 : 34 + r() * 10), cd = d * (kind === 4 ? 0.8 : 0.6);
    add(new THREE.BoxGeometry(cw, ch, cd), OBJ.crate, cx, y + ch / 2, cz);
    for (const yy of [2, ch - 2]) add(new THREE.BoxGeometry(cw + 0.4, 2.4, cd + 0.4), OBJ.slat, cx, y + yy, cz);
    add(new THREE.BoxGeometry(2.4, ch, cd + 0.5), OBJ.slat, cx, y + ch / 2, cz);
    return;
  }
  const ph = 5 + (n % 3) * 3; add(new THREE.BoxGeometry(Math.min(w, d) * 0.55, ph, Math.min(w, d) * 0.55), OBJ.plinth, cx, y + ph / 2, cz);
  const top = y + ph, room = Math.max(10, maxH - ph), lathe = (pts, mm, s2) => add(new THREE.LatheGeometry(pts.map(([a, b]) => new THREE.Vector2(a, b)), 28), mm, cx, top, cz, [s2, s2, s2]);
  if (kind === 0) { // bust
    const s2 = Math.min(1, room / 22);
    add(new THREE.CylinderGeometry(3.2 * s2, 3.6 * s2, 3 * s2, 16), m, cx, top + 1.5 * s2, cz);
    add(new THREE.BoxGeometry(12 * s2, 6 * s2, 6 * s2), m, cx, top + 6 * s2, cz, [1, 1, 1], r() - 0.5);
    add(new THREE.CylinderGeometry(1.6 * s2, 1.9 * s2, 3 * s2, 12), m, cx, top + 10 * s2, cz);
    add(new THREE.SphereGeometry(4 * s2, 18, 14), m, cx, top + 15 * s2, cz, [0.85, 1.1, 0.95]);
  } else if (kind === 1) lathe([[0, 0], [3.5, 0], [5.5, 4], [6.2, 9], [4.2, 15], [2.6, 18], [3.4, 20]], OBJ.glaze, Math.min(1.1, room / 20));
  else if (kind === 5) lathe([[0, 0], [2.4, 0], [3, 2], [6, 10], [5.5, 17], [2.2, 21], [1.8, 26], [2.6, 28]], OBJ.terra, Math.min(1, room / 28)); // amphora
  else if (kind === 6) { const s2 = Math.min(1, room / 14); add(new THREE.CylinderGeometry(1.5, 2.5, 6 * s2, 16), OBJ.wood, cx, top + 3 * s2, cz); add(new THREE.LatheGeometry([[0, 0], [3, 0.5], [7, 3], [8.5, 6], [8.2, 6.4]].map(([a, b]) => new THREE.Vector2(a, b)), 32), OBJ.glaze, cx, top + 6 * s2, cz, [s2, s2, s2]); } // bowl on a stand
  else if (kind === 2 || kind === 10) { const s2 = Math.min(1, room / 26); add(kind === 2 ? new THREE.TorusKnotGeometry(5 * s2, 1.6 * s2, 80, 10) : new THREE.TorusKnotGeometry(4.6 * s2, 1.2 * s2, 100, 10, 3, 5), kind === 2 ? OBJ.bronze : OBJ.verd, cx, top + 9 * s2, cz, [1, 1, 1], n); }
  else if (kind === 7) { let yy = top; for (let q = 0; q < 4; q++) { const sz = 9 - q * 1.6, hh = 4 + (q % 2) * 2; add(new THREE.BoxGeometry(sz, hh, sz * 0.8), [OBJ.stone, OBJ.granite, OBJ.marble][q % 3], cx + (q % 2 ? 0.8 : -0.8), yy + hh / 2, cz, [1, 1, 1], q * 0.5); yy += hh; if (yy - top > room - 5) break; } } // stacked stones
  else if (kind === 8) { const rr = Math.min(7, room / 2.4); add(new THREE.CylinderGeometry(2, 3, 2, 16), OBJ.granite, cx, top + 1, cz); add(new THREE.SphereGeometry(rr, 28, 20), OBJ.bronze, cx, top + 2 + rr, cz); } // sphere
  else if (kind === 9) { const hh = Math.min(room, 30); add(new THREE.CylinderGeometry(2.2, 3.4, hh, 4), OBJ.granite, cx, top + hh / 2, cz, [1, 1, 0.5], Math.PI / 4); } // stele
  else if (kind === 11) { const s2 = Math.min(1, room / 12); add(new THREE.CapsuleGeometry(3 * s2, 12 * s2, 6, 12), OBJ.marble, cx, top + 3 * s2, cz, [1, 1, 0.8]).rotation.z = Math.PI / 2; add(new THREE.SphereGeometry(2.6 * s2, 14, 10), OBJ.marble, cx - 8 * s2, top + 5 * s2, cz); } // reclining figure
  else if (kind === 13) { const s2 = Math.min(1, room / 30); add(new THREE.ConeGeometry(4.5 * s2, 26 * s2, 5), OBJ.bronze, cx, top + 13 * s2, cz, [1, 1, 0.6], 0.4); add(new THREE.TorusGeometry(3 * s2, 0.8 * s2, 10, 24), OBJ.bronze, cx, top + 22 * s2, cz); } // abstract spire
  else if (kind === 14) { const hh = Math.min(room, 22); add(new THREE.CylinderGeometry(3, 3.4, hh, 20), m, cx, top + hh / 2, cz); add(new THREE.BoxGeometry(9, 1.6, 9), m, cx, top + hh + 0.8, cz); } // column fragment
  else { // standing figure
    const hh = Math.min(room, 20 + r() * 12);
    add(new THREE.CylinderGeometry(2.2, 3.2, hh * 0.62, 12), m, cx, top + hh * 0.31, cz);
    add(new THREE.CylinderGeometry(3.4, 2.4, hh * 0.25, 12), m, cx, top + hh * 0.74, cz);
    add(new THREE.SphereGeometry(2.4, 14, 10), m, cx, top + hh * 0.92, cz);
  }
}

// small collection pieces for cabinet shelves and specimen trays: pots, bowls, figurines, shells, minerals, coins, points
const SMALL = {};
function smallThings(THREE, parent, x0, y, z0, w, d, r, maxH = 9, trays = false) {
  if (!SMALL.clay) Object.assign(SMALL, {
    clay: new THREE.MeshStandardMaterial({ color: 0xb5653a, roughness: 0.85 }), glaze: new THREE.MeshStandardMaterial({ color: 0x2f5a7a, roughness: 0.3 }), celadon: new THREE.MeshStandardMaterial({ color: 0x9fbfa6, roughness: 0.35 }),
    shell: new THREE.MeshStandardMaterial({ color: 0xeadcc4, roughness: 0.6 }), mineral: new THREE.MeshStandardMaterial({ color: 0x7b5ea7, roughness: 0.25, metalness: 0.2, flatShading: true }), quartz: new THREE.MeshStandardMaterial({ color: 0xe8ecef, roughness: 0.15, metalness: 0.1, flatShading: true }),
    coin: new THREE.MeshStandardMaterial({ color: 0xb08d3c, roughness: 0.35, metalness: 0.9 }), flint: new THREE.MeshStandardMaterial({ color: 0x4a4540, roughness: 0.5, flatShading: true }), bone: new THREE.MeshStandardMaterial({ color: 0xe8dfc8, roughness: 0.7 }),
    tray: new THREE.MeshStandardMaterial({ color: 0xf7f5ef, roughness: 0.9 }), foam: new THREE.MeshStandardMaterial({ color: 0xf2f2ee, roughness: 1 }),
  });
  const add = (geo, m, px, py, pz, s = 1, rx = 0, ry = 0) => { const me = new THREE.Mesh(geo, m); me.position.set(px, py, pz); me.scale.setScalar(s); me.rotation.set(rx, ry, 0); parent.add(me); return me; };
  let x = x0 + 1;
  while (x < x0 + w - 4) {
    const kind = Math.floor(r() * (trays ? 5 : 4)), cz = z0 + d * (0.3 + r() * 0.4);
    if (trays) {
      // open specimen tray with a few pieces laid on foam
      const tw = Math.min(8 + Math.floor(r() * 2) * 4, x0 + w - x - 0.5), td = Math.min(d - 1, 7 + r() * 4); if (tw < 4) break;
      add(new THREE.BoxGeometry(tw, 1.1, td), SMALL.tray, x + tw / 2, y + 0.55, z0 + 0.5 + td / 2); add(new THREE.BoxGeometry(tw - 0.4, 0.2, td - 0.4), SMALL.foam, x + tw / 2, y + 1.05, z0 + 0.5 + td / 2);
      for (let q = 0, n = 2 + Math.floor(r() * 3); q < n; q++) {
        const px = x + 1.2 + (q + 0.5) * ((tw - 2.4) / n), pz = z0 + 0.5 + td * (0.35 + r() * 0.3), yy = y + 1.25;
        if (kind === 0) add(new THREE.SphereGeometry(1, 12, 8), SMALL.shell, px, yy + 0.4, pz, 0.9 + r() * 0.5).scale.y = 0.45;
        else if (kind === 1) add(new THREE.DodecahedronGeometry(0.9, 0), r() > 0.5 ? SMALL.mineral : SMALL.quartz, px, yy + 0.6, pz, 0.8 + r() * 0.6, r(), r());
        else if (kind === 2) add(new THREE.CylinderGeometry(0.6, 0.6, 0.12, 18), SMALL.coin, px, yy + 0.06, pz);
        else if (kind === 3) add(new THREE.ConeGeometry(0.7, 2.2, 4), SMALL.flint, px, yy + 0.3, pz, 1, Math.PI / 2, r());
        else add(new THREE.CylinderGeometry(0.25, 0.35, 3, 8), SMALL.bone, px, yy + 0.3, pz, 1, Math.PI / 2, r() * 3);
      }
      x += tw + 0.6; continue;
    }
    if (kind === 0) { const s = Math.min(1, maxH / 8); add(new THREE.LatheGeometry([[0, 0], [1.8, 0], [2.8, 2.5], [2.6, 5], [1.4, 7], [1.7, 8]].map(([a, b]) => new THREE.Vector2(a, b)), 20), [SMALL.clay, SMALL.glaze, SMALL.celadon][Math.floor(r() * 3)], x + 3, y, cz, s); x += 7; }
    else if (kind === 1) { add(new THREE.LatheGeometry([[0, 0], [1.5, 0], [3.6, 1.6], [4.2, 2.6]].map(([a, b]) => new THREE.Vector2(a, b)), 24), r() > 0.5 ? SMALL.celadon : SMALL.clay, x + 4.4, y, cz); x += 9.5; }
    else if (kind === 2) { const h = Math.min(maxH, 5 + r() * 3); add(new THREE.CylinderGeometry(0.9, 1.4, h * 0.6, 10), SMALL.clay, x + 1.6, y + h * 0.3, cz); add(new THREE.SphereGeometry(0.9, 10, 8), SMALL.clay, x + 1.6, y + h * 0.72, cz); x += 4.5; }
    else { add(new THREE.BoxGeometry(6, 3.5, 5), SMALL.tray, x + 3, y + 1.75, cz); add(new THREE.DodecahedronGeometry(1.1, 0), SMALL.mineral, x + 3, y + 4.4, cz, 1, r(), r()); x += 8; }
  }
}

function kit(THREE) {
  const std = (color, roughness = 0.55, metalness = 0.25, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
  const M = {
    paint: std(0xbfc4c7, 0.5, 0.3),
    dark: std(0x2b2f32, 0.6, 0.3),
    chrome: std(0xe3e7ea, 0.16, 1),
    steel: std(0x9aa1a6, 0.35, 0.8),
    wood: std(0xc79a66, 0.72, 0),
    woodDark: std(0x8a5f3a, 0.7, 0),
    kraft: std(0xffffff, 0.85, 0),
    white: std(0xf3f4f2, 0.5, 0.1),
    black: std(0x151719, 0.35, 0.1),
    rubber: std(0x1d1f21, 0.9, 0),
    teal: std(0x0f7377, 0.45, 0.3),
    glass: new THREE.MeshPhysicalMaterial({ color: 0xdfeff0, roughness: 0.05, metalness: 0, transparent: true, opacity: 0.22, depthWrite: false }),
    label: std(0xf7f3e8, 0.8, 0),
    green: std(0x2f9e44, 0.4, 0.1, { emissive: 0x145a22, emissiveIntensity: 0.4 }),
    red: std(0xc92a2a, 0.4, 0.1, { emissive: 0x5a1414, emissiveIntensity: 0.4 }),
  };
  const geo = new THREE.BoxGeometry(1, 1, 1);
  // box by its minimum corner (x, y, z) and size (w, h, d)
  const bx = (parent, w, h, d, m, x = 0, y = 0, z = 0) => {
    const me = new THREE.Mesh(geo, m); me.scale.set(w, h, d); me.position.set(x + w / 2, y + h / 2, z + d / 2);
    parent && parent.add(me); return me;
  };
  const cyl = (parent, r, h, m, x, y, z, seg = 20, axis = 'y') => {
    const me = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), m);
    if (axis === 'x') me.rotation.z = Math.PI / 2; if (axis === 'z') me.rotation.x = Math.PI / 2;
    me.position.set(x, y, z); parent && parent.add(me); return me;
  };
  // thin bar between two points in the xy plane at depth z
  const bar = (parent, x1, y1, x2, y2, z, t, m, depth = t) => {
    const len = Math.hypot(x2 - x1, y2 - y1), me = new THREE.Mesh(geo, m);
    me.scale.set(len, t, depth); me.position.set((x1 + x2) / 2, (y1 + y2) / 2, z); me.rotation.z = Math.atan2(y2 - y1, x2 - x1);
    parent && parent.add(me); return me;
  };
  const group = (parent, x = 0, y = 0, z = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); parent && parent.add(g); return g; };
  // wire mesh / grid texture (art screens, wire decks, cages)
  const grid = (cell = 16, line = 2, color = '#d7dcdf') => {
    const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
    g.strokeStyle = color; g.lineWidth = line; g.beginPath();
    for (let i = 0; i <= 64; i += cell) { g.moveTo(i, 0); g.lineTo(i, 64); g.moveTo(0, i); g.lineTo(64, i); }
    g.stroke(); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
  };
  const meshMat = (w, h, cellIn = 2, color = '#cfd5d8', metal = 0.7) => {
    const t = grid(16, 3, color); t.repeat.set(w / (cellIn * 4), h / (cellIn * 4));
    return new THREE.MeshStandardMaterial({ map: t, alphaTest: 0.4, transparent: false, side: THREE.DoubleSide, metalness: metal, roughness: 0.35 });
  };
  // many same-shaped boxes with per-box color (contents: file boxes, books, bins, cartons)
  const many = (parent, list, m) => {
    if (!list.length) return null;
    const im = new THREE.InstancedMesh(geo, m, list.length), o = new THREE.Object3D(), c = new THREE.Color();
    list.forEach((b, i) => { o.position.set(b.x + b.w / 2, b.y + b.h / 2, b.z + b.d / 2); o.scale.set(b.w, b.h, b.d); o.rotation.set(0, 0, b.tilt || 0); o.updateMatrix(); im.setMatrixAt(i, o.matrix); im.setColorAt(i, c.set(b.color)); });
    im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true;
    parent.add(im); return im;
  };
  const FIN = {
    shelving: [{ name: 'Light gray', swatch: '#c3c7ca', color: 0xbfc4c7 }, { name: 'Putty', swatch: '#d9cfbd', color: 0xd6ccb9 }, { name: 'Black', swatch: '#2c2f31', color: 0x2c2f31 }, { name: 'White', swatch: '#f1f2f0', color: 0xeeefed }],
    lockers: [{ name: 'Dove gray', swatch: '#b9bec1', color: 0xb5babd }, { name: 'Parchment', swatch: '#e2d6bd', color: 0xdfd3ba }, { name: 'Harbor blue', swatch: '#3e5f7d', color: 0x3e5f7d }, { name: 'Black', swatch: '#27292b', color: 0x27292b }, { name: 'O\'Brien teal', swatch: '#0f7377', color: 0x0f7377 }],
    endPanels: [{ name: 'O\'Brien teal', swatch: '#0f7377', color: 0x0f7377 }, { name: 'Maple laminate', swatch: '#c79a66', color: 0xc79a66 }, { name: 'Light gray', swatch: '#c3c7ca', color: 0xbfc4c7 }, { name: 'Black', swatch: '#2c2f31', color: 0x2c2f31 }, { name: 'Navy', swatch: '#2a3d5c', color: 0x2a3d5c }],
    cabinets: [{ name: 'White', swatch: '#f1f2f0', color: 0xeeefed }, { name: 'Light gray', swatch: '#c3c7ca', color: 0xbfc4c7 }, { name: 'Putty', swatch: '#d9cfbd', color: 0xd6ccb9 }, { name: 'Black', swatch: '#2c2f31', color: 0x2c2f31 }],
  };
  const finisher = (...mats) => (f) => { mats.forEach(mat => { mat.color.setHex(f.color); if (f.metal != null) mat.metalness = f.metal; if (f.rough != null) mat.roughness = f.rough; }); };
  // upright with a column of slots every 2", tinted by the shelf paint
  const postMat = (paint) => {
    const c = document.createElement('canvas'); c.width = 16; c.height = 64; const g = c.getContext('2d');
    g.fillStyle = '#fff'; g.fillRect(0, 0, 16, 64); g.fillStyle = '#3a3d40';
    for (const y of [10, 42]) { g.fillRect(6, y, 4, 12); }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1, 21); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    return new THREE.MeshStandardMaterial({ color: paint.color.clone(), map: t, roughness: paint.roughness, metalness: paint.metalness });
  };
  // open-top drawer box: floor, two sides, back and front wall
  const tray = (parent, w, h, d, m, x, y, z, t = 0.15) => { bx(parent, w, t, d, m, x, y, z); bx(parent, t, h, d, m, x, y, z); bx(parent, t, h, d, m, x + w - t, y, z); bx(parent, w, h, t, m, x, y, z); bx(parent, w, h, t, m, x, y, z + d - t); };
  // dimension line with end ticks and a label (fractions to 1/16"), drawn over the model
  const dimMat = new THREE.MeshBasicMaterial({ color: 0x0f7377, toneMapped: false, depthTest: false });
  const inch = v => { const q = Math.round(v * 16), whole = Math.floor(q / 16); let f = q % 16, b = 16; if (!f) return whole + '"'; while (f % 2 === 0) { f /= 2; b /= 2; } return (whole ? whole + ' ' : '') + f + '/' + b + '"'; };
  const tag = (text, s) => {
    const c = document.createElement('canvas'); c.width = 320; c.height = 112; const g = c.getContext('2d');
    g.fillStyle = '#ffffff'; g.strokeStyle = '#0f7377'; g.lineWidth = 6; g.beginPath(); if (g.roundRect) g.roundRect(4, 4, 312, 104, 24); else g.rect(4, 4, 312, 104); g.fill(); g.stroke();
    g.fillStyle = '#023c3f'; g.font = 'bold 56px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 160, 60);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, toneMapped: false })); sp.scale.set(10 * s, 3.5 * s, 1); sp.renderOrder = 20; return sp;
  };
  const dim = (parent, a, b, text, s = 1, off = [0, 0, 0]) => {
    const g = group(parent), A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), mid = A.clone().add(B).multiplyScalar(0.5);
    const line = new THREE.Mesh(geo, dimMat); line.scale.set(0.24 * s, A.distanceTo(B), 0.24 * s); line.position.copy(mid);
    line.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize()); line.renderOrder = 19; line.userData.noShadow = true; g.add(line);
    for (const P of [A, B]) { const t = new THREE.Mesh(geo, dimMat); t.scale.setScalar(1.1 * s); t.position.copy(P); t.renderOrder = 19; t.userData.noShadow = true; g.add(t); }
    const sp = tag(text, s); sp.position.copy(mid).add(new THREE.Vector3(...off)); g.add(sp);
    return g;
  };
  // slot strip on one face of an upright, facing into the bay (+1 = toward +x, -1 = toward -x)
  const slots = (parent, m, x, y, z, depth, h, facing) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(depth, h), m); p.rotation.y = facing > 0 ? Math.PI / 2 : -Math.PI / 2; p.position.set(x + facing * 0.01, y + h / 2, z + depth / 2); parent?.add(p); return p; };
  // many boxes where any one can come out: a click swaps that box for a detailed copy from spawn(b) and runs
  // show(g, b) to pull it; a second click runs hide(g, b) and puts the plain box back. open parts register in reg.
  const pullMany = (parent, list, m, { spawn, show, hide, reg, one = false, also = [], gate = null, ms = 1400 }) => {
    const im = many(parent, list, m); if (!im) return null;
    const keep = new THREE.Matrix4(), zero = new THREE.Matrix4().makeScale(0, 0, 0), open = new Map();
    im.userData.onClick = (hit) => {
      // when the gate is shut (e.g. overview of a mobile system) the click belongs to whatever holds the boxes
      if (gate && !gate()) { let o = im.parent; while (o && !o.userData.onClick) o = o.parent; return o?.userData.onClick(hit); }
      const i = hit?.instanceId ?? Math.floor(list.length / 2); if (i == null || !list[i]) return;
      if (open.has(i)) return open.get(i)();
      if (one) [...open.values()].forEach(f => f());
      const b = list[i], g = spawn(b, i); g.userData.dyn = true; parent.add(g);
      const saved = [im, ...also].map(q => { if (!q) return null; q.getMatrixAt(i, keep); const m2 = keep.clone(); q.setMatrixAt(i, zero); q.instanceMatrix.needsUpdate = true; return m2; });
      let busy = false;
      const close = () => { if (busy) return 0; busy = true; open.delete(i); reg?.delete(close); (async () => { await hide(g, b); parent.remove(g); [im, ...also].forEach((q, n) => { if (q && saved[n]) { q.setMatrixAt(i, saved[n]); q.instanceMatrix.needsUpdate = true; } }); })(); return ms; };
      g.userData.onClick = () => close(); open.set(i, close); reg?.add(close);
      show(g, b);
    };
    im.userData.pullAny = () => im.userData.onClick({ instanceId: Math.floor(Math.random() * list.length) });
    return im;
  };
  return { THREE, M, bx, cyl, bar, group, grid, meshMat, many, pullMany, FIN, finisher, std, postMat, tray, dim, inch, slots };
}

const KRAFT = ['#c49a64', '#ece9df', '#b58a55', '#f2efe6', '#e4e1d6', '#ffffff'];
const SOLANDER = ['#3b3f44', '#2d3136', '#4a4f55', '#565b61', '#6b4f3a', '#43464a'];
const BOOKS = ['#7c2d2d', '#2d4a7c', '#2f6b4f', '#a3782b', '#5a3d6e', '#1f1f1f', '#b5563a', '#35667a', '#8d8d86', '#c7b58f'];

/* four-post / closed steel shelving unit, min corner at origin, open face toward +z */
function shelving(k, parent, o) {
  const { M, bx, bar, group, many } = k;
  const { bays = 3, w = 36, d = 18, h = 84, shelves = 6, closed = false, paint = M.paint, contents = null, seed = 7, labels = false, dividers = false, pass = false, pull = null } = o;
  const post = o.postPaint || paint;
  const g = group(parent, o.x || 0, o.y || 0, o.z || 0), W = bays * w, r = rng(seed);
  for (let i = 0; i <= bays; i++) {
    const x = i * w, inner = i > 0 && i < bays;
    for (const zf of [0, d - 0.12]) {
      bx(g, inner ? 2.5 : 1.25, h, 0.12, paint, i === 0 ? 0 : i === bays ? W - 1.25 : x - 1.25, 0, zf);
      const sx = i === bays ? W - 0.12 : x, sz = zf === 0 ? 0 : d - 1.25;
      bx(g, 0.12, h, 1.25, paint, sx, 0, sz);
      if (post !== paint) { if (i < bays) k.slots(g, post, sx + 0.12, 0, sz, 1.25, h, 1); if (i > 0) k.slots(g, post, sx, 0, sz, 1.25, h, -1); }
    }
    if (closed) bx(g, 0.05, h, d, paint, i === bays ? W - 0.05 : x, 0, 0);
  }
  if (closed && !pass) bx(g, W, h, 0.05, paint, 0, 0, 0);
  const ys = []; for (let s = 0; s < shelves; s++) ys.push(3 + (s * (h - 4.5)) / (shelves - 1));
  const items = [];
  for (let b = 0; b < bays; b++) {
    const x0 = b * w + 0.1;
    for (const [si, y] of ys.entries()) {
      bx(g, w - 0.2, 0.06, d - 0.2, paint, x0, y, 0.1);
      bx(g, w - 0.2, 1.4, 0.06, paint, x0, y - 1.34, d - 0.16);
      if (labels) bx(g, 4, 0.9, 0.05, M.label, x0 + w / 2 - 2, y - 1.1, d - 0.1);
      bx(g, w - 0.2, 1.4, 0.06, paint, x0, y - 1.34, 0.1);
      if (!closed && si === 0) { bar(g, b * w + 1, 4, (b + 1) * w - 1, h - 4, 0.3, 0.35, paint); bar(g, b * w + 1, h - 4, (b + 1) * w - 1, 4, 0.5, 0.35, paint); }
      const top = si === ys.length - 1, clear = top ? 0 : ys[si + 1] - y - 1.45, gap = clear - 0.55;
      if (dividers && !top && clear > 3) for (let dx = 12; dx < w - 6; dx += 12) bx(g, 0.08, Math.min(clear - 0.3, 9), d - 1.5, paint, x0 + dx, y + 0.06, 0.7);
      const add = (it) => items.push(it);
      if (contents === 'solander' && !top && clear >= 3.3) {
        const sw = d >= 24 ? 16 : 12, sd = d >= 24 ? 20 : 15, n = Math.floor((w - 1) / (sw + 0.6));
        let x = x0 + (w - n * (sw + 0.6)) / 2;
        for (let q = 0; q < n; q++) { if (r() > 0.1) add({ x, y: y + 0.06, z: d - sd - 0.8, w: sw, h: 3, d: sd, color: SOLANDER[Math.floor(r() * SOLANDER.length)] }); x += sw + 0.6; }
        continue;
      }
      if (!contents || top || gap < 6) continue;
      if (contents === 'boxes') {
        let x = x0 + 0.6; const bw = 12.25, bh = Math.min(10.25, gap - 0.5), bd = Math.min(15.25, d - 1.5);
        while (x + bw < x0 + w - 0.8) { if (r() > 0.18) add({ x, y: y + 0.06, z: d - bd - 0.5, w: bw, h: bh, d: bd, color: KRAFT[Math.floor(r() * 4)] }); if ((pass || d >= 30) && r() > 0.25) items.push({ x, y: y + 0.06, z: 0.5, w: bw, h: bh, d: bd, color: KRAFT[Math.floor(r() * 4)] }); x += bw + 0.3; }
      } else if (contents === 'bins') {
        let x = x0 + 0.5; const bw = 6.5, bh = Math.min(5, gap - 0.8), bd = d - 1.2;
        while (x + bw < x0 + w - 0.6) { add({ x, y: y + 0.06, z: 0.5, w: bw, h: bh, d: bd, color: '#2f6fb3' }); x += bw + 0.35; }
      } else if (contents === 'binders') {
        let x = x0 + 0.8;
        while (x < x0 + w - 3) { const t = 1.6 + r() * 1.4; if (r() > 0.12) items.push({ x, y: y + 0.06, z: d - 11.5, w: t - 0.15, h: Math.min(11.5, gap - 0.5), d: 10.5, color: BOOKS[Math.floor(r() * BOOKS.length)] }); x += t; }
      }
    }
  }
  // record storage boxes: a lid with a lip, a handhold cut into the front end, a label below it
  // record storage boxes: a lid with a lip, a handhold cut into the front end, a label below it (lists line up with the boxes)
  const extras = [];
  if (contents === 'boxes') {
    const lids = [], holes = [], tags = [];
    items.forEach(b => { const ok = b.h >= 6, out = b.z + b.d / 2 < d / 2 - 0.5 ? -1 : 1, fz = out > 0 ? b.z + b.d + 0.16 : b.z - 0.21;
      lids.push({ x: b.x - 0.16, y: b.y + b.h - 1.5, z: b.z - 0.16, w: ok ? b.w + 0.32 : 0, h: 1.6, d: b.d + 0.32, color: b.color });
      holes.push({ x: b.x + b.w / 2 - 2.1, y: b.y + b.h - 4.2, z: fz, w: ok ? 4.2 : 0, h: 1.3, d: 0.05, color: '#2b2118' });
      tags.push({ x: b.x + b.w / 2 - 2.8, y: b.y + b.h * 0.3, z: fz, w: ok ? 5.6 : 0, h: 2.6, d: 0.05, color: '#fbf9f2' }); });
    extras.push(many(g, lids, M.kraft), many(g, holes, k.std(0xffffff, 0.9, 0)), many(g, tags, k.std(0xffffff, 0.8, 0)));
  }
  const cm = contents === 'bins' ? k.std(0xffffff, 0.35, 0) : contents === 'solander' ? k.std(0xffffff, 0.85, 0) : M.kraft;
  if (pull && (contents === 'boxes' || contents === 'solander')) g.userData.pullIm = pullBoxes(k, g, items, cm, extras, d, contents, pull);
  // a click on a lid, handhold or label is a click on its box
  if (g.userData.pullIm) extras.forEach(im => { if (im) im.userData.onClick = hit => g.userData.pullIm.userData.onClick(hit); });
  else if (contents) many(g, items, cm);
  g.userData.W = W; g.userData.D = d; g.userData.H = h; g.userData.ys = ys; g.userData.w = w; g.userData.bays = bays;
  return g;
}

// any record box or solander box comes off the shelf: it slides clear of the shelf, then the lid comes off
// (record box) or swings open (solander) to show what is inside; pull = { tween, reg }
const FOLDERS = ['#e8d6a8', '#f0e2b8', '#dcc893', '#e9ddc0'];
function pullBoxes(k, g, items, cm, extras, d, contents, { tween, reg, gate }) {
  const { THREE, bx, group } = k, zero = new THREE.Matrix4().makeScale(0, 0, 0), keep = new THREE.Matrix4();
  const saved = [];
  return k.pullMany(g, items, cm, {
    reg, one: true, gate,
    spawn: (b, i) => {
      saved[i] = extras.map(im => { if (!im) return null; im.getMatrixAt(i, keep); const m = keep.clone(); im.setMatrixAt(i, zero); im.instanceMatrix.needsUpdate = true; return m; });
      const p = group(null), out = b.z + b.d / 2 < d / 2 - 0.5 ? -1 : 1, bm = k.std(new THREE.Color(b.color).getHex(), 0.85, 0);
      p.userData.i = i; p.userData.out = out;
      if (contents === 'boxes') {
        // open box with hanging file folders, lid on top
        k.tray(p, b.w, b.h - 1.2, b.d, bm, b.x, b.y, b.z, 0.2);
        for (let q = 0; q < Math.floor((b.d - 1.2) / 0.9); q++) bx(p, b.w - 0.8, b.h - 2.2 - (q % 3) * 0.5, 0.12, k.std(new THREE.Color(FOLDERS[q % 4]).getHex(), 0.9, 0), b.x + 0.4, b.y + 0.3, b.z + 0.6 + q * 0.9);
        const fz = out > 0 ? b.z + b.d + 0.02 : b.z - 0.07;
        bx(p, 4.2, 1.3, 0.05, k.std(0x2b2118, 0.9, 0), b.x + b.w / 2 - 2.1, b.y + b.h - 4.2, fz); bx(p, 5.6, 2.6, 0.05, k.std(0xfbf9f2, 0.8, 0), b.x + b.w / 2 - 2.8, b.y + b.h * 0.3, fz);
        const lid = group(p, 0, 0, 0); lid.userData.dyn = true; bx(lid, b.w + 0.32, 0.2, b.d + 0.32, bm, b.x - 0.16, b.y + b.h - 0.2, b.z - 0.16);
        for (const [zz, dd] of [[b.z - 0.16, 0.16], [b.z + b.d, 0.16]]) bx(lid, b.w + 0.32, 1.6, dd, bm, b.x - 0.16, b.y + b.h - 1.6, zz);
        for (const xx of [b.x - 0.16, b.x + b.w]) bx(lid, 0.16, 1.6, b.d + 0.32, bm, xx, b.y + b.h - 1.6, b.z - 0.16);
        p.userData.lid = lid;
      } else {
        // clamshell: tray and a lid hinged at the back, a print on a mat inside
        k.tray(p, b.w, b.h - 0.6, b.d, bm, b.x, b.y, b.z, 0.15);
        const pt = painting(THREE), mw = b.w - 1, md = b.d - 1, iw = Math.min(mw - 2, (md - 2) * pt.a), id2 = iw / pt.a;
        bx(p, mw, 0.15, md, k.std(0xf7f5ee, 0.9, 0), b.x + 0.5, b.y + 0.3, b.z + 0.5);
        const pr = bx(p, iw, 0.02, id2, pt.m, b.x + b.w / 2 - iw / 2, b.y + 0.46, b.z + b.d / 2 - id2 / 2);
        const hz = out > 0 ? b.z : b.z + b.d, lid = group(p, 0, b.y + b.h, hz); lid.userData.dyn = true;
        bx(lid, b.w + 0.2, 0.2, b.d + 0.2, bm, b.x - 0.1, -0.2, out > 0 ? -0.1 : -b.d - 0.1); bx(lid, b.w + 0.2, 1, 0.15, bm, b.x - 0.1, -1, out > 0 ? b.d : -b.d - 0.1);
        p.userData.lid = lid; p.userData.hinge = true; void pr;
      }
      p.traverse(o => { if (o.isMesh) o.castShadow = o.receiveShadow = true; });
      return p;
    },
    show: async (p, b) => {
      const out = p.userData.out, shift = out > 0 ? d - b.z + 1.5 : -(b.z + b.d) - 1.5;
      await tween(p.position, 'z', shift, 800, 'out');
      if (p.userData.hinge) await tween(p.userData.lid.rotation, 'x', -out * 1.9, 700, 'out');
      else { await tween(p.userData.lid.position, 'y', 4, 450, 'out'); await tween(p.userData.lid.position, 'z', out * (b.d * 0.45), 450); }
    },
    hide: async (p, b) => {
      const i = p.userData.i;
      if (p.userData.hinge) await tween(p.userData.lid.rotation, 'x', 0, 500);
      else { await tween(p.userData.lid.position, 'z', 0, 350); await tween(p.userData.lid.position, 'y', 0, 350); }
      await tween(p.position, 'z', 0, 650, 'out');
      extras.forEach((im, n) => { if (im && saved[i]?.[n]) { im.setMatrixAt(i, saved[i][n]); im.instanceMatrix.needsUpdate = true; } });
    },
  });
}

// shelf spacing chain, overall height, section and run width, depth
function shelvingDims(k, g) {
  const { W, D, H, ys, w, bays } = g.userData, dg = k.group(g); dg.userData.dyn = true;
  for (let i = 0; i < ys.length - 1; i++) k.dim(dg, [-4, ys[i], D], [-4, ys[i + 1], D], k.inch(ys[i + 1] - ys[i]), 1, [-7, 0, 0]);
  k.dim(dg, [W + 4, 0, D], [W + 4, H, D], k.inch(H), 1, [7, 0, 0]);
  k.dim(dg, [0, H + 5, D], [w, H + 5, D], k.inch(w), 1, [0, 3, 0]);
  if (bays > 1) k.dim(dg, [0, H + 13, D], [W, H + 13, D], k.inch(W), 1, [0, 3, 0]);
  k.dim(dg, [W + 2, H + 5, 0], [W + 2, H + 5, D], k.inch(D), 1, [4, 2, 0]);
}

/* ---------------- 1. four-post shelving ---------------- */
// 4-post shelving at standard sizes; what it holds sets the shelf spacing unless you pick a shelf count
function fourPost(id, name, dims0, preset) {
  def(id, name, dims0, ({ THREE, tween, wake, bake, refit, lite }) => {
    const k = kit(THREE), { bx, group } = k, root = new THREE.Group();
    const paint = k.std(0xbfc4c7, 0.5, 0.3), post = k.postMat(paint);
    const SIZES = [[36, 18, '36" W x 18" D'], [36, 12, '36" W x 12" D'], [42, 24, '42" W x 24" D'], [48, 24, '48" W x 24" D']];
    const HEIGHTS = [72, 84, 96], BAYS = [1, 3, 5, 8], SHELVES = [0, 5, 6, 7, 8, 10, 12, 16];
    const CONTENTS = [['boxes', 'Record storage boxes'], ['solander', 'Solander boxes'], ['bins', 'Bins'], [null, 'Nothing']];
    const LAYOUTS = ['Single run', 'Pass-through', 'Two runs, one aisle'];
    const st = { size: 0, hgt: 1, cont: 0, lay: 0, bays: 1, closed: true, shelves: 0, dividers: false, dims: false, ...preset };
    const autoShelves = (h, c) => (c === 'solander' ? Math.floor((h - 4.5) / 4.75) + 1 : c === 'bins' ? Math.floor((h - 4.5) / 9) + 1 : Math.floor((h - 4.5) / 12.5) + 1);
    let unit, pullG = null; const openBoxes = new Set();
    const make = () => {
      if (unit) root.remove(unit); openBoxes.clear();
      const [w, d] = SIZES[st.size], h = HEIGHTS[st.hgt], contents = CONTENTS[st.cont][0], bays = BAYS[st.bays], shelves = SHELVES[st.shelves] || Math.max(4, autoShelves(h, contents));
      unit = group(root); unit.userData.dyn = true;
      const opts = { bays, w, d, h, closed: st.closed, shelves, paint, postPaint: post, labels: true, contents, dividers: st.dividers, pass: st.lay === 1, pull: { tween, reg: openBoxes } };
      const a = shelving(k, unit, opts);
      if (st.lay === 2) { const b2 = shelving(k, unit, { ...opts, seed: 17, pull: null }); b2.rotation.y = Math.PI; b2.position.set(a.userData.W, 0, 2 * d + 36); }
      if (st.dims) shelvingDims(k, a);
      pullG = a.userData.pullIm || null;
      unit.traverse(o => { if (o.isMesh && !o.userData.noShadow) { o.castShadow = o.receiveShadow = true; } });
      bake?.(unit); wake();
    };
    const pull = () => { if (!pullG) return; if (openBoxes.size) [...openBoxes].forEach(f => f()); else pullG.userData.pullAny(); };
    const re = () => { make(); refit?.(); };
    make();
    return {
      group: root, finishes: k.FIN.shelving, setFinish: k.finisher(paint, post),
      actions: [
        { label: 'Pull a box', when: () => !!pullG, run: () => { pull(); } },
        { label: 'Holds', when: () => !lite || id === 'four-post', options: CONTENTS.map(c => c[1]), get: () => st.cont, set: n => { st.cont = n; st.shelves = 0; re(); } },
        { label: 'Size', options: SIZES.map(z => z[2]), get: () => st.size, set: n => { st.size = n; re(); } },
        { label: 'Height', options: HEIGHTS.map(v => v + '"'), get: () => st.hgt, set: n => { st.hgt = n; re(); } },
        { label: 'Sections', options: BAYS.map(String), get: () => st.bays, set: n => { st.bays = n; re(); } },
        { label: 'Layout', options: LAYOUTS, get: () => st.lay, set: n => { st.lay = n; re(); } },
        { label: 'Shelves', options: ['Fit to contents', ...SHELVES.slice(1).map(String)], get: () => st.shelves, set: n => { st.shelves = n; re(); } },
        { label: 'Style', options: ['Closed', 'Open'], get: () => (st.closed ? 0 : 1), set: n => { st.closed = n === 0; re(); } },
        { label: 'Dividers', toggle: true, get: () => st.dividers, set: v => { st.dividers = v; re(); } },
        { label: 'Dimensions', toggle: true, get: () => st.dims, set: v => { st.dims = v; re(); } },
      ],
    };
  });
}
fourPost('four-post', '4-Post Steel Shelving', 'Standard sizes and heights; single run, pass-through or two runs; holds record boxes, solander boxes or bins', { bays: 1 });
fourPost('four-post-solander', 'Solander Box Shelving', 'Museum 4-post shelving at close spacing, a shelf for every solander box', { size: 2, cont: 1, bays: 1 });

/* ---------------- 2. bin & parts storage ---------------- */
// one geometry from several parts (position, normal, uv), so hundreds of bins draw as one instanced mesh
function mergeParts(THREE, parts) {
  const geos = parts.map(g => (g.index ? g.toNonIndexed() : g)), out = new THREE.BufferGeometry();
  for (const name of ['position', 'normal', 'uv']) {
    const size = geos[0].attributes[name].itemSize, total = geos.reduce((n, g) => n + g.attributes[name].array.length, 0), arr = new Float32Array(total);
    let o = 0; for (const g of geos) { arr.set(g.attributes[name].array, o); o += g.attributes[name].array.length; }
    out.setAttribute(name, new THREE.BufferAttribute(arr, size));
  }
  return out;
}
// hopper-front bin in a unit box (-0.5..0.5, front at +z): floor, back, low front lip, sloped sides
let BIN_GEO = null, PILE_GEO = null;
function binGeo(THREE) {
  if (BIN_GEO) return BIN_GEO;
  const sh = new THREE.Shape(); sh.moveTo(-0.5, -0.5); sh.lineTo(0.5, -0.5); sh.lineTo(0.5, 0.05); sh.lineTo(0.1, 0.5); sh.lineTo(-0.5, 0.5); sh.closePath();
  const side = x => { const g = new THREE.ExtrudeGeometry(sh, { depth: 0.05, bevelEnabled: false }); g.rotateY(-Math.PI / 2); g.translate(x, 0, 0); return g; };
  const box = (w, h, d, x, y, z) => new THREE.BoxGeometry(w, h, d).translate(x, y, z);
  BIN_GEO = mergeParts(THREE, [side(-0.45), side(0.5), box(1, 0.05, 1, 0, -0.475, 0), box(1, 1, 0.05, 0, 0, -0.475), box(1, 0.55, 0.05, 0, -0.225, 0.475), box(0.9, 0.07, 0.06, 0, 0.02, 0.49)]);
  // a heap of parts in the front of the bin
  PILE_GEO = mergeParts(THREE, [box(0.86, 0.18, 0.8, 0, -0.38, 0.02), box(0.6, 0.12, 0.5, -0.08, -0.25, 0.08), box(0.3, 0.1, 0.3, 0.2, -0.24, -0.1)]);
  return BIN_GEO;
}
// loose hardware for a pulled bin or an open drawer compartment: bolts, hex nuts, washers
const HW = {};
function hardware(THREE, parent, x, y, z, w, d, r, n = 8) {
  if (!HW.steel) Object.assign(HW, { steel: new THREE.MeshStandardMaterial({ color: 0xaab1b6, roughness: 0.3, metalness: 0.9 }), brass: new THREE.MeshStandardMaterial({ color: 0xb8913a, roughness: 0.35, metalness: 0.9 }), black: new THREE.MeshStandardMaterial({ color: 0x2a2c2e, roughness: 0.4, metalness: 0.6 }), nut: new THREE.CylinderGeometry(0.35, 0.35, 0.3, 6), bolt: new THREE.CylinderGeometry(0.14, 0.14, 1.6, 8), washer: new THREE.TorusGeometry(0.3, 0.1, 6, 14) });
  const m = [HW.steel, HW.brass, HW.black][Math.floor(r() * 3)];
  for (let q = 0; q < n; q++) {
    const kind = q % 3, me = new THREE.Mesh(kind === 0 ? HW.nut : kind === 1 ? HW.bolt : HW.washer, m);
    me.position.set(x + 0.5 + r() * (w - 1), y + 0.2 + r() * 0.3, z + 0.5 + r() * (d - 1)); me.rotation.set(kind === 1 ? Math.PI / 2 : kind === 2 ? Math.PI / 2 : 0, r() * 3, kind === 1 ? r() : 0);
    parent.add(me);
  }
}
def('bin-shelving', 'Bin & Parts Storage', 'Shelf bins on closed or open shelving, hanging bins on louvered panels, or modular drawer cabinets: pull any bin or drawer', ({ THREE, tween, wake, bake, refit }) => {
  const k = kit(THREE), { M, bx, group, many } = k, root = new THREE.Group();
  const paint = k.std(0xbfc4c7, 0.5, 0.3), binM = k.std(0xffffff, 0.45, 0.05), pileM = k.std(0xffffff, 0.35, 0.8), labM = k.std(0xf7f5ee, 0.8, 0), louverM = k.std(0x8f969a, 0.45, 0.5);
  const STYLES = ['Shelf bins, closed shelving', 'Shelf bins, open shelving', 'Hanging bins on louvered panels', 'Modular drawer cabinets'];
  const COLORS = [['Blue', '#2f6fb3'], ['Red', '#c4382c'], ['Yellow', '#e8b923'], ['Green', '#2f8a4f'], ['Gray', '#8f969a'], ['Black', '#2a2c2e']];
  const SECS = [1, 3, 5], openSet = new Set(), PILES = ['#aab1b6', '#b8913a', '#3a3c3e', '#c9ced2'];
  let style = 0, ci = 0, si = 1, unit, pulls = [];
  const geo = binGeo(THREE);
  // instanced bins; clicking one pulls a real copy out with its parts showing
  const binField = (p, list, out, lift = 0) => {
    const im = new THREE.InstancedMesh(geo, binM, list.length), pile = new THREE.InstancedMesh(PILE_GEO, pileM, list.length), o = new THREE.Object3D(), c = new THREE.Color();
    list.forEach((b, i) => { o.position.set(b.x + b.w / 2, b.y + b.h / 2, b.z + b.d / 2); o.scale.set(b.w, b.h, b.d); o.updateMatrix(); im.setMatrixAt(i, o.matrix); pile.setMatrixAt(i, o.matrix); im.setColorAt(i, c.set(b.color)); pile.setColorAt(i, c.set(PILES[i % 4])); });
    const labs = many(p, list.map(b => ({ x: b.x + b.w * 0.2, y: b.y + b.h * 0.18, z: b.z + b.d + 0.04, w: b.w * 0.6, h: Math.min(1.2, b.h * 0.22), d: 0.04, color: '#f7f5ee' })), labM);
    p.add(im, pile);
    const r = rng(5), zero = new THREE.Matrix4().makeScale(0, 0, 0), keep = new THREE.Matrix4(), open = new Map();
    im.userData.onClick = (hit) => {
      const i = hit?.instanceId; if (i == null) return;
      if (open.has(i)) return open.get(i)();
      [...open.values()].forEach(f => f());
      const b = list[i], saved = [im, pile, labs].map(q => { q.getMatrixAt(i, keep); const m2 = keep.clone(); q.setMatrixAt(i, zero); q.instanceMatrix.needsUpdate = true; return m2; });
      const g = group(p); g.userData.dyn = true;
      const one = new THREE.Mesh(geo, k.std(new THREE.Color(b.color).getHex(), 0.45, 0.05)); one.position.set(b.x + b.w / 2, b.y + b.h / 2, b.z + b.d / 2); one.scale.set(b.w, b.h, b.d); g.add(one);
      bx(g, b.w * 0.6, Math.min(1.2, b.h * 0.22), 0.04, labM, b.x + b.w * 0.2, b.y + b.h * 0.18, b.z + b.d + 0.04);
      hardware(THREE, g, b.x + 0.3, b.y + 0.1, b.z + b.d * 0.35, b.w - 0.6, b.d * 0.6, r, Math.max(6, Math.round(b.w * 1.4)));
      g.traverse(q => { if (q.isMesh) q.castShadow = q.receiveShadow = true; });
      let busy = false;
      const close = async () => { if (busy) return 0; busy = true; open.delete(i); openSet.delete(close); await tween(g.position, 'z', 0, 500, 'out'); if (lift) await tween(g.position, 'y', 0, 250); p.remove(g); [im, pile, labs].forEach((q, n) => { q.setMatrixAt(i, saved[n]); q.instanceMatrix.needsUpdate = true; }); wake(); return 0; };
      g.userData.onClick = () => close(); open.set(i, close); openSet.add(close);
      (async () => { if (lift) await tween(g.position, 'y', lift, 250, 'out'); await tween(g.position, 'z', out(b), 650, 'out'); })();
      wake();
    };
    pulls.push(() => im.userData.onClick({ instanceId: Math.floor(list.length * 0.45) }));
    return im;
  };
  const color = () => COLORS[ci][1];
  // shelf bins: each shelf gets one bin size, 18" deep bins on 18" shelves
  const shelfBins = (closed) => {
    const bays = SECS[si], sg = shelving(k, unit, { bays, w: 36, d: 18, h: 84, closed, shelves: 8, paint, postPaint: k.postMat(paint), labels: false });
    const list = [], widths = [4.125, 6.625, 8.375, 11.125];
    sg.userData.ys.forEach((y, s) => {
      if (s === sg.userData.ys.length - 1) return;
      const bh = s < 2 ? 7 : 4, bw = widths[(s + 1) % 4];
      for (let b = 0; b < bays; b++) { let x = b * 36 + 1.2; while (x + bw < (b + 1) * 36 - 1) { list.push({ x, y: y + 0.1, z: 0.3, w: bw - 0.15, h: bh, d: 17.4, color: color() }); x += bw; } }
    });
    binField(sg, list, b => b.d * 0.62);
  };
  // louvered panels with hang-and-stack bins; a bin lifts off its louver and comes forward
  const louvers = () => {
    const n = SECS[si], PW = 36, PH = 61, list = [];
    for (let q = 0; q < n; q++) {
      const x0 = q * (PW + 1), pg = group(unit, x0, 0, 0);
      for (const x of [0, PW - 1.5]) { bx(pg, 1.5, PH + 12, 1.5, louverM, x, 0, 0); bx(pg, 1.5, 1, 20, louverM, x, 0, -8); }
      bx(pg, PW, PH, 0.3, louverM, 0, 12, 0.6);
      for (let y = 14; y < 12 + PH - 2; y += 2) bx(pg, PW - 3, 0.35, 0.9, louverM, 1.5, 12 + (y - 12), 0.9);
      const rows = [[12, 5.5, 5, 11], [24, 5.5, 5, 11], [36, 7.4, 7, 14.75], [50, 11, 8, 18], [62, 11, 8, 18]];
      for (const [y, w, h, d] of rows) { if (y + h > 12 + PH) continue; let x = 1.8; while (x + w < PW - 1.5) { list.push({ x: x0 + x, y: y + 0.5, z: 1.8, w: w - 0.2, h, d, color: color() }); x += w; } }
    }
    binField(unit, list, b => 6, 1.2);
  };
  // modular drawer cabinets: drawers of mixed heights, one opens at a time, divided compartments of parts inside
  const drawers = () => {
    const n = SECS[si], W = 30, D = 28.5, H = 59, base = 4, frontM = k.std(new THREE.Color(color()).getHex(), 0.4, 0.25), pullM = k.std(0xc9ced2, 0.25, 0.9), inner = k.std(0xd7dada, 0.5, 0.3), divM = k.std(0xb9bfc3, 0.4, 0.5);
    const HTS = [3, 3, 3, 3, 4, 4, 5, 5, 6, 8, 9], r = rng(8);
    for (let c = 0; c < n; c++) {
      const x0 = c * (W + 0.5), cg = group(unit, x0, 0, 0);
      bx(cg, W - 2, base, D - 3, M.dark, 1, 0, 1);
      bx(cg, W, H - base, 1, paint, 0, base, 0); bx(cg, 1, H - base, D, paint, 0, base, 0); bx(cg, 1, H - base, D, paint, W - 1, base, 0); bx(cg, W, 1.2, D, paint, 0, H - 1.2, 0);
      const fronts = [], ys = []; let y = base + 0.4;
      for (const h of [...HTS].reverse()) { fronts.push({ x: 1.1, y, z: D - 0.8, w: W - 2.2, h: h - 0.2, d: 0.8, color: '#ffffff' }); ys.push(h); y += h; }
      const pullsL = fronts.map(f => ({ x: f.x + 1, y: f.y + f.h - 1.2, z: D, w: f.w - 2, h: 0.9, d: 0.5, color: '#ffffff' }));
      const pim = many(cg, pullsL, pullM);
      const im = k.pullMany(cg, fronts, frontM, {
        reg: openSet, one: true, also: [pim],
        spawn: (f, i) => {
          const g = group(null); bx(g, f.w, f.h, 0.8, frontM, f.x, f.y, f.z); bx(g, f.w - 2, 0.9, 0.5, pullM, f.x + 1, f.y + f.h - 1.2, D);
          const tw = f.w - 1, td = D - 3, th = f.h - 0.8; k.tray(g, tw, th, td, inner, f.x + 0.5, f.y + 0.2, 1.8, 0.15);
          const cols = th > 5 ? 3 : 5, rowsN = th > 5 ? 2 : 4;
          for (let q = 1; q < cols; q++) bx(g, 0.08, th - 0.3, td - 0.4, divM, f.x + 0.5 + (tw * q) / cols, f.y + 0.3, 2);
          for (let q = 1; q < rowsN; q++) bx(g, tw - 0.4, th - 0.3, 0.08, divM, f.x + 0.7, f.y + 0.3, 1.8 + (td * q) / rowsN);
          for (let a = 0; a < cols; a++) for (let b2 = 0; b2 < rowsN; b2++) hardware(THREE, g, f.x + 0.5 + (tw * a) / cols, f.y + 0.2, 1.8 + (td * b2) / rowsN, tw / cols, td / rowsN, r, 4);
          g.traverse(q => { if (q.isMesh) q.castShadow = q.receiveShadow = true; });
          return g;
        },
        show: g => tween(g.position, 'z', D * 0.85, 750, 'out'),
        hide: g => tween(g.position, 'z', 0, 600, 'out'),
      });
      pulls.push(() => im.userData.onClick({ instanceId: 3 + (c % 4) }));
    }
  };
  const make = () => {
    if (unit) root.remove(unit);
    unit = group(root); unit.userData.dyn = true; pulls = []; openSet.clear();
    if (style < 2) shelfBins(style === 0); else if (style === 2) louvers(); else drawers();
    unit.traverse(o => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; } });
    bake?.(unit); wake();
  };
  const re = () => { make(); refit?.(); };
  make();
  return {
    group: root, view: [0.85, 0.45, 1.3], prompt: 'Tap any bin or drawer to pull it out',
    finishes: k.FIN.shelving, setFinish: k.finisher(paint),
    actions: [
      { label: 'Pull a bin', run: () => { if (openSet.size) { [...openSet].forEach(f => f()); return; } pulls[0]?.(); } },
      { label: 'Style', options: STYLES, get: () => style, set: n => { style = n; re(); } },
      { label: 'Sections', options: SECS.map(String), get: () => si, set: n => { si = n; re(); } },
      { label: 'Bin color', options: COLORS.map(c => c[0]), get: () => ci, set: n => { ci = n; re(); } },
    ],
  };
});

/* ---------------- 3. wire shelving ---------------- */
// chrome wire: one builder for a pair, a wall run, L and U room layouts, and a top-track front row
function wireModel(id, name, dims0, start, layouts) {
  def(id, name, dims0, ({ THREE, tween, wake, bake, refit }) => {
    const k = kit(THREE), { M, bx, cyl, group, many } = k, root = new THREE.Group();
    const w = 48, d = 18, h = 74, lift = 5.5, pitch = w + 1, navy = k.std(0x243447, 0.5, 0.2);
    const LAYOUTS = { pair: 'Layout: pair', wall: 'Layout: wall run', L: 'Layout: L-shaped room', U: 'Layout: walk-in (U)', track: 'Layout: top-track mobile' };
    const ORDER = layouts;
    const cols = ['#c49a64', '#ece8de', '#e9eef2', '#2f6fb3', '#b58a55', '#f3f1ea'];
    let layout = start, casters = false, dims = false, unit, movers = [], X1 = 0;
    const SLOTS = 4, mw = 24, md = 48, mp = mw + 5.4, gaps = { f: 0 };
    const wheelM = k.std(0x8f969a, 0.4, 0.3), bumpM = k.std(0x111213, 0.9, 0);
    const unitAt = (p, x, z, rot, wheels, seed, uw = w, ud = d, tall = 0) => {
      const g = group(p, x, 0, z); g.rotation.y = rot;
      const r = rng(seed), wires = [], items = [], lf = wheels ? lift : 1.2, ph = h + tall;
      for (const [px, pz] of [[0, 0], [uw, 0], [0, ud], [uw, ud]]) {
        cyl(g, 0.5, ph, M.chrome, px, lf + ph / 2, pz, 14);
        // swivel casters: the wheel rolls along the run, so it faces front
        if (wheels) {
          const wg = group(g, px, 2.4, pz); wg.userData.dyn = true;
          cyl(wg, 2.3, 1.5, wheelM, 0, 0, 0, 18, 'z'); cyl(wg, 1, 1.6, M.chrome, 0, 0, 0, 12, 'z'); bx(wg, 3.8, 0.5, 1.62, M.dark, -1.9, -0.25, -0.81);
          (g.userData.wheels = g.userData.wheels || []).push(wg);
          bx(g, 1.8, 1.6, 2, M.chrome, px - 0.9, 3.9, pz - 1); cyl(g, 1.6, 0.5, navy, px, 5.6, pz, 18);
        }
        else cyl(g, 0.9, lf, M.chrome, px, lf / 2, pz, 12);
      }
      if (tall) { for (const zz of [0, ud]) cyl(g, 0.4, uw, M.chrome, uw / 2, lf + ph - 1, zz, 8, 'x'); for (const xx of [0, uw]) cyl(g, 0.4, ud, M.chrome, xx, lf + ph - 1, ud / 2, 8, 'z'); }
      const ys = []; for (let q = 0; q < 5; q++) ys.push(lf + 2 + q * ((h - 4) / 4));
      ys.forEach((y, q) => {
        for (const zz of [0, ud]) cyl(g, 0.28, uw, M.chrome, uw / 2, y, zz, 8, 'x');
        for (const xx of [0, uw]) cyl(g, 0.28, ud, M.chrome, xx, y, ud / 2, 8, 'z');
        for (let xx = 1; xx < uw; xx += 1.4) wires.push({ x: xx - 0.09, y: y - 0.09, z: 0, w: 0.18, h: 0.18, d: ud, color: '#e3e7ea' });
        // support wires across the shelf, under the deck wires, for strength
        for (let c = 1, n = Math.max(2, Math.round(ud / 16)); c <= n; c++) cyl(g, 0.22, uw, M.chrome, uw / 2, y - 0.32, (ud * c) / (n + 1), 8, 'x');
        if (q === 4) return;
        if (ud > uw) { let zz = 1.5; while (zz < ud - 8) { const bd = 7 + Math.floor(r() * 3) * 3; if (r() > 0.25) items.push({ x: 1.5, y: y + 0.2, z: zz, w: uw - 3, h: 6 + r() * 7, d: bd - 0.6, color: cols[Math.floor(r() * cols.length)] }); zz += bd; } return; }
        let xx = 1;
        while (xx < uw - 8) { const bw = 7 + Math.floor(r() * 3) * 3; if (r() > 0.25) items.push({ x: xx, y: y + 0.2, z: 1.5, w: bw - 0.6, h: 6 + r() * 7, d: ud - 3, color: cols[Math.floor(r() * cols.length)] }); xx += bw; }
      });
      many(g, wires, M.chrome); many(g, items, k.std(0xffffff, 0.7, 0));
      g.userData.ys = ys; g.userData.lf = lf; g.userData.uw = uw; g.userData.ud = ud; g.userData.ph = ph;
      return g;
    };
    const make = () => {
      if (unit) root.remove(unit);
      unit = group(root); unit.userData.dyn = true; movers = [];
      let first = null, seed = 1;
      if (layout === 'pair' || layout === 'wall') {
        const n = layout === 'pair' ? 2 : 4;
        for (let i = 0; i < n; i++) { const u = unitAt(unit, i * pitch, 0, 0, casters, seed++); first = first || u; }
      } else if (layout === 'L' || layout === 'U') {
        const back = 3;
        for (let i = 0; i < back; i++) { const u = unitAt(unit, d + 1 + i * pitch, 0, 0, casters, seed++); first = first || u; }
        const sideN = 2, X = d + 1 + back * pitch + 1;
        for (let i = 0; i < sideN; i++) unitAt(unit, 0, d + 1 + (i + 1) * pitch, Math.PI / 2, casters, seed++);
        if (layout === 'U') for (let i = 0; i < sideN; i++) unitAt(unit, X + d, d + 1 + i * pitch, -Math.PI / 2, casters, seed++);
      } else {
        // units turned short end out roll sideways under two track runs, one over their front ends and one over the back;
        // the tracks span between tall fixed end units
        const tall = 14, ty = lift + h + 3, trackM = k.std(0xc9ced2, 0.3, 0.8), runs = [0, md];
        X1 = mw + 5.4; const X2 = X1 + SLOTS * mp - 5.4 + 5.4;
        for (const ex of [0, X2]) { const u = unitAt(unit, ex, 0, 0, false, seed++, mw, md, tall); first = first || u; for (const zz of [0, md]) for (const yy of [4, h - 1]) bx(u, 2.6, 1.3, 1.3, bumpM, ex ? -2.6 : mw, yy, zz - 0.65); }
        for (let q = 0; q < SLOTS; q++) {
          if (q === gaps.f) continue;
          const u = unitAt(unit, X1 + q * mp, 0, 0, true, seed++, mw, md); u.userData.slot = q; u.userData.row = 'f';
          for (const zz of [0, md]) for (const yy of [lift + 3, lift + h - 3]) { bx(u, 2.6, 1.3, 1.3, bumpM, -2.6, yy, zz - 0.65); bx(u, 2.6, 1.3, 1.3, bumpM, mw, yy, zz - 0.65); }
          // a guide roller on top of every post, riding in the track above it
          for (const zz of runs) for (const xx of [0, mw]) { cyl(u, 0.5, ty - 0.8 - (lift + h), M.chrome, xx, (lift + h + ty - 0.8) / 2, zz, 10); cyl(u, 1.6, 1, navy, xx, ty - 0.5, zz, 20); }
          u.userData.onClick = () => slide(u);
          movers.push(u);
        }
        // tracks run along the post lines and clamp to the tall end-unit posts
        for (const zz of runs) { bx(unit, X2 - mw, 3, 2.6, trackM, mw, ty, zz - 1.3); for (const x of [mw, X2]) bx(unit, 2.6, 4, 3, M.chrome, x - 1.3, ty - 0.5, zz - 1.5); }
      }
      if (dims && first) {
        const dg = group(unit), { ys, lf, uw, ud, ph } = first.userData; dg.userData.dyn = true; const x0 = first.position.x, z0 = first.position.z;
        for (let i2 = 0; i2 < ys.length - 1; i2++) k.dim(dg, [x0 - 4, ys[i2], z0 + ud], [x0 - 4, ys[i2 + 1], z0 + ud], k.inch(ys[i2 + 1] - ys[i2]), 1, [-7, 0, 0]);
        k.dim(dg, [x0, lf + ph + 4, z0 + ud], [x0 + uw, lf + ph + 4, z0 + ud], k.inch(uw), 1, [0, 3, 0]);
        k.dim(dg, [x0 + uw + 3, 0, z0 + ud], [x0 + uw + 3, lf + ph, z0 + ud], k.inch(lf + ph), 1, [7, 0, 0]);
        k.dim(dg, [x0 + uw + 2, lf + ph + 4, z0], [x0 + uw + 2, lf + ph + 4, z0 + ud], k.inch(ud), 1, [4, 2, 0]);
      }
      unit.traverse(q => { if (q.isMesh && !q.userData.noShadow) { q.castShadow = q.receiveShadow = true; } });
      bake?.(unit); wake();
    };
    const slide = (u) => {
      const r = u.userData.row, to = gaps[r]; if (Math.abs(u.userData.slot - to) !== 1) return;
      gaps[r] = u.userData.slot; u.userData.slot = to;
      const x = X1 + to * mp, dx = x - u.position.x;
      tween(u.position, 'x', x, 900);
      // casters roll: turn by distance over radius
      (u.userData.wheels || []).forEach(wg => tween(wg.rotation, 'z', wg.rotation.z - dx / 2.3, 900));
    };
    const slideRow = (r) => { const u = movers.find(m => m.userData.row === r && Math.abs(m.userData.slot - gaps[r]) === 1); if (u) slide(u); };
    make();
    return {
      group: root, view: layout === 'track' ? [0.45, 0.35, 1.3] : [0.9, 0.55, 1.25],
      finishes: [{ name: 'Chrome', swatch: '#e3e7ea', color: 0xe3e7ea, metal: 1, rough: 0.16 }, { name: 'Black epoxy', swatch: '#2b2d2f', color: 0x2b2d2f, metal: 0.2, rough: 0.5 }, { name: 'Gray epoxy', swatch: '#9aa1a6', color: 0x9aa1a6, metal: 0.2, rough: 0.5 }, { name: 'Stainless', swatch: '#cfd4d8', color: 0xcfd4d8, metal: 0.9, rough: 0.3 }], setFinish: k.finisher(M.chrome),
      actions: [
        { label: LAYOUTS[start], when: () => ORDER.length > 1, run: () => { layout = ORDER[(ORDER.indexOf(layout) + 1) % ORDER.length]; make(); refit?.(); return LAYOUTS[layout]; } },
        { label: 'Slide the units', when: () => layout === 'track', run: () => { const u = movers.find(m => Math.abs(m.userData.slot - gaps.f) === 1); if (u) slide(u); } },
        { label: 'Add casters', when: () => layout !== 'track', run: () => { casters = !casters; make(); return casters ? 'Remove casters' : 'Add casters'; } },
        { label: 'Show dimensions', run: () => { dims = !dims; make(); return dims ? 'Hide dimensions' : 'Show dimensions'; } },
      ],
    };
  });
}
wireModel('wire-shelving', 'Chrome Wire Shelving', 'Chrome wire units, from a pair to a walk-in room layout', 'pair', ['pair', 'wall', 'L', 'U']);

/* ---------------- 4. library cantilever shelving ---------------- */
def('library', 'Library Cantilever Shelving', 'Double-faced cantilever shelving, counter height to 90", three to eight sections', ({ THREE, wake, bake, refit }) => {
  const k = kit(THREE), { M, bx, group, many } = k, root = new THREE.Group();
  const paint = k.std(0xbfc4c7, 0.5, 0.3), post = k.postMat(paint), wood = k.std(0xc79a66, 0.7, 0);
  const HEIGHTS = [{ h: 42, n: 3, label: 'Height: 42" counter' }, { h: 66, n: 5, label: 'Height: 66"' }, { h: 84, n: 7, label: 'Height: 84"' }, { h: 90, n: 7, label: 'Height: 90"' }];
  const SECTIONS = [3, 5, 8];
  const w = 36, side = 10, core = 3, D = side * 2 + core;
  let hi = 2, si = 0, showBooks = true, dims = false, unit, books, ends = 0;
  // cantilever bracket: tall at the column, tapering to the shelf front; doubles as the bookend
  const brShape = new THREE.Shape(); brShape.moveTo(0, 0); brShape.lineTo(side - 1, 0); brShape.lineTo(side - 1, 1.2); brShape.lineTo(0, 7); brShape.closePath();
  const brGeo = new THREE.ExtrudeGeometry(brShape, { depth: 0.25, bevelEnabled: false });
  const make = () => {
    if (unit) root.remove(unit);
    const { h, n } = HEIGHTS[hi], bays = SECTIONS[si], W = bays * w, r = rng(11), counter = h <= 42;
    unit = group(root); unit.userData.dyn = true;
    for (let i = 0; i <= bays; i++) {
      const x = i === 0 ? 0 : i === bays ? W - 2 : i * w - 1;
      bx(unit, 2, h, core, post, x, 0, side);
      bx(unit, 2, 3, D - 1, paint, x, 0, 0.5);
    }
    bx(unit, W - 2, h - 3, 0.3, paint, 1, 3, side + core / 2 - 0.15);
    const ys = []; for (let s = 0; s < n; s++) ys.push(3 + s * ((h - 14) / (n - 1)));
    const items = [], brackets = [];
    for (let b = 0; b < bays; b++) {
      const x0 = b * w + (b === 0 ? 2 : 1), bw = w - (b === 0 || b === bays - 1 ? 3 : 2);
      for (const face of [0, 1]) {
        const zIn = face ? side + core : side, dir = face ? 1 : -1;
        bx(unit, bw, 3, 0.4, paint, x0, 0, face ? D - 0.4 : 0);
        ys.forEach((y, s) => {
          bx(unit, bw, 0.9, side - 0.2, paint, x0, y, face ? zIn : 0.2);
          bx(unit, bw, 1.6, 0.2, paint, x0, y - 0.7, face ? D - 0.2 : 0);
          if (s > 0) for (const bxx of [x0 + 0.1, x0 + bw - 0.35]) brackets.push({ x: bxx + (face ? 0.25 : 0), y: y + 0.9, z: zIn, rot: face ? -Math.PI / 2 : Math.PI / 2 });
                    let x = x0 + 0.6;
          while (x < x0 + bw - 2.5) { const t = 0.8 + r() * 1.3, bh = 7.5 + r() * 2.3; if (r() > 0.06) items.push({ x, y: y + 0.9, z: face ? D - 1 - (6 + r() * 2) : 1, w: t - 0.05, h: bh, d: 6 + r() * 2, color: BOOKS[Math.floor(r() * BOOKS.length)] }); x += t; }
        });
      }
    }
    const im = new THREE.InstancedMesh(brGeo, paint, brackets.length), o = new THREE.Object3D();
    brackets.forEach((q, i) => { o.position.set(q.x, q.y, q.z); o.rotation.set(0, q.rot, 0); o.updateMatrix(); im.setMatrixAt(i, o.matrix); });
    im.instanceMatrix.needsUpdate = true; unit.add(im);
    books = many(unit, items, k.std(0xffffff, 0.7, 0)); if (books) books.visible = showBooks;
    // end panels in wood or steel, or none: exposed uprights and a steel top
    const endM = ends === 1 ? paint : wood;
    if (ends < 2) { bx(unit, 1, h + 1, D + 1.5, endM, -1, 0, -0.75); bx(unit, 1, h + 1, D + 1.5, endM, W, 0, -0.75); }
    if (counter) bx(unit, W + (ends < 2 ? 3 : 1), 1.25, D + 3, ends === 2 ? paint : wood, ends < 2 ? -1.5 : -0.5, h, -1.5);
    else if (ends < 2) bx(unit, W + 2, 1, D + 1.5, endM, -1, h, -0.75);
    else bx(unit, W, 0.9, D, paint, 0, h, 0);
    if (dims) {
      const dg = group(unit); dg.userData.dyn = true; const s = W > 200 ? 1.6 : 1;
      for (let i = 0; i < ys.length - 1; i++) k.dim(dg, [-5, ys[i], D], [-5, ys[i + 1], D], k.inch(ys[i + 1] - ys[i]), s, [-7 * s, 0, 0]);
      k.dim(dg, [W + 5, 0, D], [W + 5, h + (counter ? 1.25 : 1), D], k.inch(h + (counter ? 1.25 : 1)), s, [7 * s, 0, 0]);
      k.dim(dg, [0, h + 6, D], [w, h + 6, D], k.inch(w), s, [0, 3 * s, 0]);
      if (bays > 1) k.dim(dg, [0, h + 14, D], [W, h + 14, D], k.inch(W + 2), s, [0, 3 * s, 0]);
      k.dim(dg, [W + 3, h + 6, 0], [W + 3, h + 6, D], k.inch(D), s, [4 * s, 2 * s, 0]);
    }
    unit.traverse(q => { if (q.isMesh && !q.userData.noShadow) { q.castShadow = q.receiveShadow = true; } });
    bake?.(unit); wake();
  };
  make();
  return {
    group: root, view: [0.9, 0.5, 1.3],
    finishes: [{ name: 'Maple ends', swatch: '#c79a66', color: 0xc79a66 }, { name: 'Walnut ends', swatch: '#6b4428', color: 0x6b4428 }, { name: 'Light gray ends', swatch: '#c3c7ca', color: 0xbfc4c7 }],
    setFinish: k.finisher(wood),
    actions: [
      { label: HEIGHTS[2].label, run: () => { hi = (hi + 1) % HEIGHTS.length; make(); refit?.(); return HEIGHTS[hi].label; } },
      { label: 'Sections: 3', run: () => { si = (si + 1) % SECTIONS.length; make(); refit?.(); return `Sections: ${SECTIONS[si]}`; } },
      { label: 'Show dimensions', run: () => { dims = !dims; make(); return dims ? 'Hide dimensions' : 'Show dimensions'; } },
      { label: 'End panels', options: ['Wood', 'Steel', 'Exposed, no end panels'], get: () => ends, set: n => { ends = n; make(); refit?.(); } },
      { label: 'Hide books', run: () => { showBooks = !showBooks; if (books) books.visible = showBooks; wake(); return showBooks ? 'Hide books' : 'Show books'; } },
    ],
  };
});

/* ---------------- 5. high-density mobile ---------------- */
// one model, six things it can carry; product and industry pages start it on the right one
const HD_KINDS = {
  shelving: { label: 'Storage: shelving', L: 108, d: 15, h: 84, N: 5, aisle: 48, cH: 5, panels: true },
  open: { label: 'Storage: open shelving', L: 144, d: 24, h: 96, N: 4, aisle: 48, cH: 6 },
  flat: { label: 'Storage: flat files', L: 100, d: 38, h: 50, N: 3, aisle: 60, cH: 6, panels: true, noElectric: true },
  athletic: { label: 'Storage: athletic gear', L: 108, d: 22, h: 84, N: 3, aisle: 48, cH: 6, panels: true, gear: 0 },
  golf: { label: 'Storage: golf bags', L: 108, d: 22, h: 84, N: 3, aisle: 48, cH: 6, panels: true, gear: 1 },
  instruments: { label: 'Storage: musical instruments', L: 108, d: 22, h: 84, N: 3, aisle: 48, cH: 6, panels: true, gear: 2 },
  bins: { label: 'Storage: painting bins', L: 144, d: 44, h: 96, N: 3, aisle: 60, cH: 6, panels: true },
  wardrobe: { label: 'Storage: wardrobe cabinets', L: 108, d: 24, h: 78, N: 3, aisle: 60, cH: 6, panels: true },
  museum: { label: 'Storage: museum cabinets', L: 147, d: 31, h: 76, N: 3, aisle: 60, cH: 6, panels: true },
  tire: { label: 'Storage: tire racks', L: 144, d: 28, h: 94, N: 3, aisle: 48, cH: 6 },
  grow: { label: 'Storage: grow racks', L: 144, d: 26, h: 96, N: 3, aisle: 48, cH: 6 },
  library: { label: 'Storage: library shelving', L: 108, d: 11.5, h: 84, N: 4, aisle: 48, cH: 5, panels: true },
  textile: { label: 'Storage: rolled textiles', L: 144, d: 30, h: 96, N: 3, aisle: 48, cH: 6, noElectric: true },
  art: { label: 'Storage: art screens', L: 120, d: 5, h: 96, N: 6, aisle: 48, cH: 4, dm: 12, df: 12, noElectric: true },
  weapons: { label: 'Storage: weapons racks', L: 108, d: 22, h: 84, N: 3, aisle: 48, cH: 6, panels: true },
  artrack: { label: 'Storage: museum object rack', noElectric: true, L: 201, d: 42, h: 144, N: 3, aisle: 72, cH: 8 },
  pallet: { label: 'Storage: pallet rack', L: 201, d: 42, h: 144, N: 3, aisle: 120, cH: 8, electricOnly: true },
};
const UNIT_COLORS = [['Standard', 0], ['Light gray', 0xbfc4c7], ['Putty', 0xd6ccb9], ['White', 0xeeefed], ['Black', 0x2c2f31], ['Blue', 0x2a4d7a]];
const AISLE_STD = [['36 in (ADA minimum)', 36], ['42 in', 42], ['48 in', 48], ['60 in (carts, pallet jack)', 60], ['72 in', 72]], AISLE_FORK = [['8 ft (reach truck)', 96], ['10 ft', 120], ['12 ft (forklift)', 144]];
const HD_ORDER = ['shelving', 'open', 'library', 'flat', 'museum', 'wardrobe', 'bins', 'art', 'artrack', 'textile', 'athletic', 'golf', 'instruments', 'weapons', 'tire', 'grow', 'pallet'];
// tires: a lathed cross-section (sidewalls, flat tread, bead) with a block tread texture; labels on the tread
let TIRE = null;
function tireParts(THREE) {
  if (TIRE) return TIRE;
  const pts = [[8.6, -3.3], [10.5, -4], [12.6, -3.9], [13.4, -3.2], [13.6, -2], [13.6, 2], [13.4, 3.2], [12.6, 3.9], [10.5, 4], [8.6, 3.3]].map(([a, b]) => new THREE.Vector2(a, b));
  const geo = new THREE.LatheGeometry(pts, 44);
  const c = document.createElement('canvas'); c.width = 1024; c.height = 128; const g = c.getContext('2d');
  g.fillStyle = '#222325'; g.fillRect(0, 0, 1024, 128);
  g.fillStyle = '#131415';
  for (let i = 0; i < 128; i++) { const x = i * 8; g.fillRect(x, 50 + (i % 2) * 6, 3, 22); g.fillRect(x + 4, 44, 1.5, 40); }
  g.fillRect(0, 62, 1024, 3);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  TIRE = { geo, mat: new THREE.MeshStandardMaterial({ map: t, roughness: 0.88, metalness: 0.04 }), label: new THREE.MeshStandardMaterial({ color: 0xf4f4f0, roughness: 0.7 }) };
  return TIRE;
}
function tireMesh(THREE, parent, list) {
  if (!list.length) return;
  const { geo, mat, label } = tireParts(THREE), im = new THREE.InstancedMesh(geo, mat, list.length), o = new THREE.Object3D();
  list.forEach((t, i) => { o.position.set(t.x, t.y, t.z); o.rotation.set(t.spin || 0, 0, Math.PI / 2); o.scale.set(1, 1, 1); o.updateMatrix(); im.setMatrixAt(i, o.matrix); });
  im.instanceMatrix.needsUpdate = true; parent.add(im);
  const tagged = list.filter(t => t.label); if (!tagged.length) return;
  const lm = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), label, tagged.length);
  tagged.forEach((t, i) => { o.position.set(t.x, t.y, t.z + 13.62); o.rotation.set(0, 0, 0); o.scale.set(3.4, 5.6, 0.08); o.updateMatrix(); lm.setMatrixAt(i, o.matrix); });
  lm.instanceMatrix.needsUpdate = true; parent.add(lm);
}
function hdMobile(id, name, dims, start, opts = {}) {
  def(id, name, dims, ({ THREE, tween, wake, bake, refit, overview, isWalking, playerPos, lite, toast }) => {
    const k = kit(THREE), { M, bx, cyl, group, many } = k, root = new THREE.Group();
    const paint = k.std(0xbfc4c7, 0.5, 0.3), panel = k.std(0x2c2f31, 0.45, 0.25), ff = k.std(0xeeefed, 0.45, 0.3);
    const up = k.std(0x1f4e8c, 0.45, 0.35), beam = k.std(0xe3671c, 0.45, 0.35);
    const oUp = k.std(0x2c3e3f, 0.5, 0.4), oUpP = k.postMat(oUp), oBeam = k.std(0xf2b705, 0.45, 0.3), deckM = k.std(0xa7adb1, 0.55, 0.4);
    const gWhite = k.std(0xf1f2f0, 0.4, 0.25), wire = k.meshMat(144, 26, 1.5, '#e9ecee', 0.6), trayM = k.std(0x1c1d1f, 0.7, 0.05), leaf = k.std(0xffffff, 0.7, 0), led = k.std(0xffffff, 0.3, 0, { emissive: 0xfff8e8, emissiveIntensity: 1.1 });
    const tBlue = k.std(0x1f5fb0, 0.45, 0.35), tBlueP = k.postMat(tBlue), bumperM = k.std(0x111213, 0.9, 0);
    const black = k.std(0x1c1e20, 0.45, 0.15), red = k.std(0xc4241c, 0.4, 0.1), go = k.std(0x39d353, 0.3, 0, { emissive: 0x1f8a33, emissiveIntensity: 0.9 }), stop = k.std(0xc92a2a, 0.35, 0.1, { emissive: 0x5a1414, emissiveIntensity: 0.5 });
    let kind = start, electric = !!opts.electric, open = 2, unit, ranges = [], C, panelsOn = null, closedShelf = true, binDoors = true, binDoorsList = [], safety = 3, safeties = [], sweeps = [], loadColor = {}, openParts = new Set(), aisleW = null, twoLevel = !!opts.twoLevel, open2 = 1, ranges2 = [], arms = [];
    const armM = k.std(0x3a3f44, 0.5, 0.5), mzDeck = k.std(0x5d6468, 0.75, 0.4), railY = k.std(0xe0a526, 0.45, 0.35), steelM = k.std(0x4b5a63, 0.5, 0.5);
    const lPost = k.postMat(paint), tFrame = k.std(0x3a3f44, 0.45, 0.35), tTube = k.std(0xf6f7f5, 0.35, 0.1), aWhite = k.std(0xf3f4f2, 0.45, 0.25), gilt = k.std(0xa6832f, 0.35, 0.7);
    const tWraps = [k.std(0xe3e7ea, 0.3, 0.35), k.std(0xeceeee, 0.55, 0.1)], tBare = [k.std(0x9b2226, 0.85, 0), k.std(0x7a5230, 0.9, 0), k.std(0x3d5a7a, 0.85, 0), k.std(0x5e4a7a, 0.85, 0)];
    const artM = ['#8c3b2f', '#2f4f6f', '#c9a227', '#3d6b4f', '#b56f4a', '#5e4a7a', '#244a5a'].map(c => k.std(c, 0.8, 0)), screenMesh = k.meshMat(120, 96, 2, '#c3c9cd', 0.85);
    const gusGeo = (() => { const g = new THREE.Shape(); g.moveTo(0, 0); g.lineTo(5, 0); g.lineTo(0, 12); g.closePath(); return new THREE.ExtrudeGeometry(g, { depth: 0.4, bevelEnabled: false }); })();
    // single-faced cantilever library shelving: back core, slotted columns, shelves with end brackets, books
    const libFace = (p, y0, z0, dir, books, r) => {
      const D = C.d, H = C.h, core = dir > 0 ? z0 : z0 + D - 1.5, sh0 = dir > 0 ? z0 + 1.5 : z0 + 0.2, shD = D - 1.7;
      bx(p, C.L, H, 1.5, paint, 0, y0, core);
      for (let i = 0; i <= 3; i++) bx(p, 2, H, 1.7, lPost, Math.max(0, Math.min(i * 36 - 1, C.L - 2)), y0, core - 0.1);
      const ys = [3, 14.7, 26.3, 38, 49.7, 61.3, 73];
      for (let b = 0; b < 3; b++) {
        const x0 = b * 36 + 1.5, bw = 33;
        bx(p, bw, 3, 0.4, paint, x0, y0, dir > 0 ? z0 + D - 0.4 : z0);
        ys.forEach((y, q) => {
          bx(p, bw, 0.9, shD, paint, x0, y0 + y, sh0); bx(p, bw, 1.6, 0.2, paint, x0, y0 + y - 0.7, dir > 0 ? z0 + D - 0.2 : z0);
          if (q > 0) for (const bxx of [x0 + 0.1, x0 + bw - 0.35]) bx(p, 0.25, 6, shD - 1, paint, bxx, y0 + y + 0.9, sh0 + (dir > 0 ? 0 : 1));
          let x = x0 + 0.6;
          while (x < x0 + bw - 2.5) { const t = 0.8 + r() * 1.3; if (r() > 0.06) books.push({ x, y: y0 + y + 0.9, z: dir > 0 ? z0 + D - 8 : z0 + 1, w: t - 0.05, h: 7.5 + r() * 2.3, d: 7, color: BOOKS[Math.floor(r() * BOOKS.length)] }); x += t; }
        });
      }
    };
    // one side of a textile rack: columns on the spine, arms out, tubes in saddles, rolls of mixed lengths
    const TSP = [[[0, 3]], [[0, 1], [1, 3]], [[0, 2], [2, 3]], [[0, 1], [1, 2], [2, 3]], [[1, 3]], [[0, 2]]];
    const texFace = (p, y0, z0, dir, r) => {
      const D = C.d, spine = dir > 0 ? z0 : z0 + D, cols = [0, 48, 96, 144], levels = [8, 25, 42, 59, 76];
      for (const x of cols) {
        const xx = Math.max(0, Math.min(x - 1.75, C.L - 3.5));
        bx(p, 3.5, C.h, 2, tFrame, xx, y0, dir > 0 ? spine : spine - 2);
        for (const y of levels) { bx(p, 2, 2.2, D - 3, tFrame, xx + 0.75, y0 + y, dir > 0 ? spine + 2 : spine - D + 1); bx(p, 2, 3.4, 1, tFrame, xx + 0.75, y0 + y, dir > 0 ? spine + D - 2 : spine - D + 1); }
      }
      for (const y of levels) for (const zc of [10, 21]) {
        const z = spine + dir * zc;
        for (const [a, b] of TSP[Math.floor(r() * TSP.length)]) {
          const xa = cols[a], xb = cols[b];
          for (const xs of [xa, xb]) bx(p, 2, 5.2, 3, tFrame, Math.max(0, Math.min(xs - 1, C.L - 2)), y0 + y + 2.2, z - 1.5);
          // tubes stop inside the end frames, never through the end panel
          const ta = Math.max(0.6, xa - 2), tb = Math.min(C.L - 0.6, xb + 2); cyl(p, 1.5, tb - ta, tTube, (ta + tb) / 2, y0 + y + 7.8, z, 14, 'x');
          if (r() > 0.15) { const room = xb - xa - 8, len = room * (0.55 + r() * 0.4), x0 = xa + 4 + r() * (room - len), rad = 2.6 + r() * 2.8, wrapped = r() > 0.55, pat = r() > 0.3 ? textileMats(THREE)[Math.floor(r() * 6)] : tBare[Math.floor(r() * tBare.length)]; cyl(p, rad, len, wrapped ? tWraps[Math.floor(r() * 2)] : pat, x0 + len / 2, y0 + y + 7.8, z, 22, 'x'); if (!wrapped && pat.map && r() > 0.6) bx(p, len - 2, 5.5, 0.12, pat, x0 + 1, y0 + y + 7.8 - 5.5, dir > 0 ? z + rad : z - rad - 0.12); }
        }
      }
    };
    // one art screen standing on a skinny carriage: posts with gussets, rails, mesh, art hung on both faces
    const artFace = (p, y0, dd, r) => {
      const H = C.h, Lx = C.L, zc = dd / 2;
      for (const x of [0, Lx / 2 - 1, Lx - 2]) {
        bx(p, 2, H, 2, aWhite, x, y0, zc - 1);
        for (const sd of [1, -1]) { const gm = new THREE.Mesh(gusGeo, aWhite); gm.rotation.y = sd > 0 ? -Math.PI / 2 : Math.PI / 2; gm.position.set(x + (sd > 0 ? 1.2 : 0.8), y0, zc + sd); p.add(gm); }
      }
      bx(p, Lx, 2, 1.5, aWhite, 0, y0 + H - 2, zc - 0.75); bx(p, Lx, 2, 1.5, aWhite, 0, y0, zc - 0.75);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(Lx - 4, H - 4), screenMesh); m.position.set(Lx / 2, y0 + H / 2, zc); p.add(m);
      for (const sd of [1, -1]) {
        let x = 4;
        while (x < Lx - 14) {
          if (Lx - 4 - x < 12) break;
          const { m: pm, fw, fh } = framed(THREE, r, Math.min(38, Lx - 4 - x)), y = 12 + r() * Math.max(0, H - fh - 22);
          bx(p, fw, fh, 1.6, r() > 0.5 ? gilt : M.woodDark, x, y0 + y, sd > 0 ? zc + 1.1 : zc - 2.7);
          bx(p, fw - 3, fh - 3, 0.2, pm, x + 1.5, y0 + y + 1.5, sd > 0 ? zc + 2.7 : zc - 2.9);
          x += fw + 3 + r() * 5;
        }
      }
    };

    // flat file faces are one clickable piece; the drawer you click is built on the spot and slides out
    const ffIn = k.std(0xd7dada, 0.5, 0.3), ffGap = k.std(0x2a2d30, 0.9, 0), ffPaper = k.std(0xf6f4ee, 0.85, 0);
    const flatFace = (p, y0, z0, dir) => {
      const fg = group(p), dh = C.h / 15, fz = dir > 0 ? z0 + C.d : z0 - 0.8, open = {};
      for (let u = 0; u < 2; u++) {
        const x = u * 50; bx(fg, 50, C.h, C.d, ff, x, y0, z0);
        for (let i = 0; i < 15; i++) { const y = y0 + 0.4 + i * dh; bx(fg, 48.6, dh - 0.35, 0.8, ff, x + 0.7, y, fz); bx(fg, 20, 0.45, 0.8, M.chrome, x + 15, y + dh - 1.4, dir > 0 ? fz + 0.8 : fz - 0.8); }
      }
      fg.userData.onClick = (hit) => {
        if (!hit) return;
        const q = fg.worldToLocal(hit.point.clone()), u = Math.max(0, Math.min(1, Math.floor(q.x / 50))), i = Math.max(0, Math.min(14, Math.floor((q.y - y0 - 0.4) / dh))), key = u + ':' + i;
        const out = C.d * 0.72 * dir, x = u * 50, y = y0 + 0.4 + i * dh;
        if (open[key]) { open[key].userData.close(); return; }
        const dr = group(p); dr.userData.dyn = true;
        const bz = dir > 0 ? z0 + 1 : z0 + 1.2;
        bx(dr, 48.6, dh - 0.35, 0.8, ff, x + 0.7, y, fz); bx(dr, 20, 0.45, 0.8, M.chrome, x + 15, y + dh - 1.4, dir > 0 ? fz + 0.8 : fz - 0.8);
        k.tray(dr, 47, dh - 0.8, C.d - 2.4, ffIn, x + 1.5, y + 0.1, bz, 0.12);
        for (let s2 = 0; s2 < 3; s2++) bx(dr, 34 - s2 * 3, 0.05, 22 - s2 * 2, artMat(THREE, u * 15 + i + s2 * 3), x + 6 + s2 * 2, y + 0.25 + s2 * 0.08, bz + 5 + s2 * 2);
        const gap = bx(fg, 48.6, dh - 0.35, 1, ffGap, x + 0.7, y, dir > 0 ? fz + 0.82 : fz - 1.02); fg.remove(gap); dr.userData.gap = gap;
        fg.add(gap); open[key] = dr; tween(dr.position, 'z', out, 700, 'out'); wake();
        dr.userData.close = () => { if (open[key] !== dr) return; delete open[key]; openParts.delete(dr.userData.close); tween(dr.position, 'z', 0, 650, 'out').then(() => { fg.remove(gap); p.remove(dr); wake(); }); };
        openParts.add(dr.userData.close);
      };
    };
    const mWhite = k.std(0xf1f2f0, 0.38, 0.2), mPlate = k.std(0xd7dbde, 0.25, 0.85), mObj = [0xb56f4a, 0x6b8f71, 0xc9a227, 0x3d5a7a].map(c => k.std(c, 0.6, 0.05));
    // museum cabinet pair: white case, glass double doors with latch plates, drawers low and shelves high behind the glass
    // one cabinet case with a pair of swinging doors; each pair opens together when you click it
    const doorPair = (p, x, cw, y0, H, fz, dir, glass, frameM, first) => {
      const doors = [];
      for (const side of [0, 1]) {
        const pv = group(p, side ? x + cw : x, y0, fz), dw = cw / 2 - 0.1, sx = side ? -dw : 0; pv.userData.dyn = true;
        const fo = dir > 0 ? 1 : -1, fz0 = dir > 0 ? 1.2 : -0.3; // outer face offset
        if (glass) {
          // wide white stiles and rails around full-height glass, a gasket line, and a latch plate with a label card and twist handle
          const st = 4.2; bx(pv, dw, st, 1.2, frameM, sx, H - st, dir > 0 ? 0 : -0.3); bx(pv, dw, st, 1.2, frameM, sx, 0, dir > 0 ? 0 : -0.3); bx(pv, st, H, 1.2, frameM, sx, 0, dir > 0 ? 0 : -0.3); bx(pv, st, H, 1.2, frameM, sx + dw - st, 0, dir > 0 ? 0 : -0.3);
          bx(pv, dw - 2 * st, H - 2 * st, 0.25, M.glass, sx + st, st, 0.45);
          const px = side ? -dw + 0.6 : dw - 3.6, fz = dir > 0 ? 1.2 : -0.55;
          bx(pv, 3, 11, 0.25, mPlate, px, H / 2 - 6, fz); bx(pv, 2.4, 3.2, 0.1, M.label, px + 0.3, H / 2 + 1.2, fz + fo * 0.25);
          cyl(pv, 1.25, 0.35, mPlate, px + 1.5, H / 2 - 2.8, fz + fo * 0.3, 28, 'z'); cyl(pv, 1, 0.25, M.dark, px + 1.5, H / 2 - 2.8, fz + fo * 0.55, 24, 'z'); bx(pv, 0.55, 2.1, 0.5, M.chrome, px + 1.225, H / 2 - 3.85, fz + fo * 0.6);
        } else { bx(pv, dw, H - 0.4, 0.8, frameM, sx, 0.2, 0); for (let v = 0; v < 5; v++) bx(pv, dw - 6, 0.3, 0.1, M.dark, sx + 3, H - 5 - v * 0.9, dir > 0 ? 0.82 : -0.02); bx(pv, 1, 7, 0.8, M.chrome, side ? -dw + 1.2 : dw - 2.2, H / 2 - 3.5, dir > 0 ? 0.9 : -0.8); }
        void fz0;
        doors.push(pv);
      }
      const api = { busy: false, isOpen: () => !!doors[0].userData.open };
      // close anything inside first, then swing the doors shut
      const shut = () => { if (!api.isOpen() || api.busy) return 0; api.busy = true; const w = first?.() ? 650 : 0; setTimeout(() => { doors.forEach(d => { d.userData.open = false; tween(d.rotation, 'y', 0, 650, 'out'); }); setTimeout(() => { api.busy = false; }, 660); }, w); openParts.delete(shut); return w + 650; };
      const openUp = () => { if (api.isOpen() || api.busy) return; api.busy = true; doors.forEach((d, n) => { d.userData.open = true; tween(d.rotation, 'y', (n ? 1 : -1) * dir * 1.9, 800, 'out'); }); setTimeout(() => { api.busy = false; }, 800); openParts.add(shut); };
      api.open = openUp; api.shut = shut;
      doors.forEach(d => { d.userData.onClick = () => (api.isOpen() ? shut() : openUp()); });
      return api;
    };
    const museumFace = (p, y0, z0, dir) => {
      const D = C.d, H = C.h, fz = dir > 0 ? z0 + D : z0 - 0.9, back = dir > 0 ? z0 : z0 + D - 1;
      for (let u = 0; u < 3; u++) {
        const x = u * 49;
        bx(p, 48, 1, D, mWhite, x, y0, z0); bx(p, 48, 1, D, mWhite, x, y0 + H - 1, z0); bx(p, 1, H, D, mWhite, x, y0, z0); bx(p, 1, H, D, mWhite, x + 47, y0, z0); bx(p, 48, H, 1, mWhite, x, y0, back);
        const dz = dir > 0 ? z0 + D - 3 : z0 + 2.5, bank = group(p), pulled = {}; let dp = null;
        const hw = (p2, yy) => { const fz = dir > 0 ? dz + 0.5 : dz - 0.15, pz = dir > 0 ? dz + 0.5 : dz - 0.6; bx(p2, 3.6, 2, 0.15, mPlate, x + 22.2, yy + 3, fz); bx(p2, 3, 1.4, 0.05, M.label, x + 22.5, yy + 3.3, dir > 0 ? fz + 0.15 : fz - 0.05); bx(p2, 8, 0.7, 0.6, mPlate, x + 20, yy + 1.1, pz); };
        for (let i = 0; i < 5; i++) { bx(bank, 44, 5.4, 0.5, mWhite, x + 2, y0 + 2 + i * 6.2, dz); hw(bank, y0 + 2 + i * 6.2); }
        bank.userData.onClick = (hit) => {
          if (!hit || !dp || dp.busy) return; const q = bank.worldToLocal(hit.point.clone()), i = Math.max(0, Math.min(4, Math.floor((q.y - y0 - 2) / 6.2)));
          // the glass doors come first: a click behind closed doors opens them
          if (!dp.isOpen()) { dp.open(); return; }
          if (pulled[i]) { pulled[i].userData.close(); return; }
          const dr = group(p); dr.userData.dyn = true; const yy = y0 + 2 + i * 6.2;
          bx(dr, 44, 5.4, 0.5, mWhite, x + 2, yy, dz); hw(dr, yy); k.tray(dr, 43, 3.6, D - 7, ffIn, x + 2.5, yy + 0.4, dir > 0 ? dz - (D - 7) : dz + 0.5, 0.15);
          smallThings(THREE, dr, x + 3, yy + 0.55, dir > 0 ? dz - (D - 7) + 1 : dz + 1.5, 40, D - 9, rng(60 + i + u * 7), 3, true);
          const gap = bx(bank, 43.6, 5, 0.05, ffGap, x + 2.2, yy + 0.2, dir > 0 ? dz + 0.52 : dz - 0.07);
          pulled[i] = dr; dr.userData.onClick = () => dr.userData.close(); tween(dr.position, 'z', dir * 20, 700, 'out');
          dr.userData.close = () => { if (pulled[i] !== dr) return; delete pulled[i]; openParts.delete(dr.userData.close); tween(dr.position, 'z', 0, 600, 'out').then(() => { bank.remove(gap); p.remove(dr); wake(); }); };
          wake();
        };
        bx(p, 46, 0.8, D - 2, mWhite, x + 1, y0 + 33.2, z0 + 1); smallThings(THREE, p, x + 2, y0 + 34, z0 + 4, 44, D - 8, rng(70 + u), 7);
        for (const sy of [44, 57]) { bx(p, 46, 0.6, D - 4, mWhite, x + 1, y0 + sy, z0 + 2); smallThings(THREE, p, x + 2, y0 + sy + 0.6, z0 + 4, 44, D - 8, rng(80 + u * 3 + sy), 11); }
        dp = doorPair(p, x, 48, y0, H, fz, dir, true, mWhite, () => { const n = Object.keys(pulled).length; Object.values(pulled).forEach(d => d.userData.close()); return n; });
      }
    };
    // gear storage: open steel sections fitted with the accessories that hold each kind of equipment
    const GEAR = ['Athletic gear', 'Golf bags', 'Musical instruments'];
    const team = k.std(0x8c1d2c, 0.4, 0.1), ballM = k.std(0xd1621f, 0.7, 0), padM = k.std(0x2f3336, 0.7, 0.05), jerseyM = k.std(0xf2f2ee, 0.85, 0), rackM = k.std(0x9aa1a6, 0.35, 0.8);
    const bagMs = [0x1c1d1f, 0x2a4d7a, 0x8c1d2c, 0xe7e4dc, 0x2f5a3e].map(c => k.std(c, 0.6, 0.1)), clubM = k.std(0xc9ced2, 0.25, 0.9), caseMs = [0x1c1d1f, 0x3a2a1e, 0x2b2d2f, 0x4a3b2c].map(c => k.std(c, 0.55, 0.1)), velvet = k.std(0x6b1f2a, 0.9, 0);
    const gearFace = (p, y0, z0, dir, r) => {
      const D = C.d, H = C.h, bw = 36, front = dir > 0 ? z0 + D : z0, inZ = (depth) => (dir > 0 ? z0 + D - depth - 0.5 : z0 + 0.5);
      // frame: uprights with slots facing in, a back panel and a top
      for (let i = 0; i <= 3; i++) { const x = Math.min(i * bw, C.L - 1.25); for (const zz of [z0, z0 + D - 1.25]) { bx(p, 1.25, H, 1.25, paint, x, y0, zz); if (i < 3) k.slots(p, lPost, x + 1.25, y0, zz, 1.25, H, 1); if (i > 0) k.slots(p, lPost, x, y0, zz, 1.25, H, -1); } }
      bx(p, C.L, H, 0.1, paint, 0, y0, dir > 0 ? z0 : z0 + D - 0.1); bx(p, C.L, 0.6, D, paint, 0, y0 + H - 0.6, z0);
      for (let b = 0; b < 3; b++) {
        const x0 = b * bw + 1.25, w = bw - 1.25;
        if (C.gear === 0) {
          // football room: helmet shelf up top, jerseys and shoulder pads on hangers, cleats on the low shelf, footballs in a cradle rack
          bx(p, w, 0.6, D - 1, paint, x0, y0 + 60, z0 + 0.5);
          for (let q = 0; q < 3; q++) p.add(footballHelmet(THREE, team, x0 + 6 + q * 11.5, y0 + 63.6, z0 + D / 2, dir > 0 ? 0 : Math.PI));
          cyl(p, 0.5, w, M.chrome, x0 + w / 2, y0 + 56, z0 + D / 2, 12, 'x');
          jersey(THREE, p, x0 + 6, y0 + 56, z0 + D / 2, team, 10 + b * 3 + (dir > 0 ? 1 : 2)); jersey(THREE, p, x0 + 13, y0 + 56, z0 + D / 2, jerseyM, 20 + b * 7);
          shoulderPads(THREE, p, x0 + 26, y0 + 55.2, z0 + D / 2);
          bx(p, w, 0.6, D - 1, paint, x0, y0 + 14, z0 + 0.5);
          for (let q = 0; q < 3; q++) for (const s2 of [0, 1]) { bx(p, 3.6, 3.4, 11, M.black, x0 + 2 + q * 11 + s2 * 4.2, y0 + 14.6, z0 + D / 2 - 5.5); bx(p, 3.6, 0.6, 10.6, M.chrome, x0 + 2 + q * 11 + s2 * 4.2, y0 + 14.6, z0 + D / 2 - 5.3); }
          for (const zz of [z0 + 3, z0 + D - 3]) cyl(p, 0.4, w, rackM, x0 + w / 2, y0 + 3, zz, 8, 'x');
          for (let q = 0; q < 4; q++) for (const zz of [0.32, 0.68]) football(THREE, p, x0 + 5 + q * 8.5, y0 + 4.2, z0 + D * zz, 0.1 * q);
        } else if (C.gear === 1) {
          // golf bag bays: a divider every 12" to shoulder height, a strap bar across the front, one full-size bag per bay,
          // and shelves above for shoes and ball boxes
          for (let q = 1; q < 3; q++) bx(p, 0.12, 48, D - 2, paint, x0 + q * 12, y0, z0 + 1);
          for (let q = 0; q < 3; q++) bx(p, 4, 1.2, 0.1, M.label, x0 + q * 12 + 4, y0 + 44, dir > 0 ? front + 0.02 : front - 0.12);
          cyl(p, 0.35, w, M.black, x0 + w / 2, y0 + 26, dir > 0 ? front - 1 : front + 1, 8, 'x');
          for (let q = 0; q < 3; q++) golfBag(THREE, p, x0 + 6 + q * 12, y0 + 0.4, z0 + D / 2, b * 3 + q + (dir > 0 ? 0 : 7), 34, dir * -0.1);
          for (const sy of [58, 71]) bx(p, w, 0.6, D - 1, paint, x0, y0 + sy, z0 + 0.5);
          for (let q = 0; q < 3; q++) { bx(p, 10, 4.5, 7, [M.black, M.white, M.dark][q % 3], x0 + 1 + q * 11.5, y0 + 58.6, inZ(7)); bx(p, 5, 3.5, 5, M.white, x0 + 2 + q * 11.5, y0 + 71.6, inZ(5)); }
        } else {
          // instrument cubbies: shelves at three levels, cases sized to each instrument
          for (const sy of [0, 28, 56]) bx(p, w, 0.6, D - 1, paint, x0, y0 + sy, z0 + 0.5);
          const CASES = [[40, 16, 6], [26, 10, 5], [32, 8, 8], [22, 9, 9], [14, 5, 16]];
          for (const sy of [0.6, 28.6, 56.6]) {
            let x = x0 + 1;
            while (x < x0 + w - 6) {
              const [cl, cw, ch] = CASES[Math.floor(r() * CASES.length)];
              const upright = cl > 30 && r() > 0.5, sw = upright ? ch : Math.min(cw, 12), sh = Math.min(upright ? Math.min(cl, 26) : ch, 26);
              if (x + sw > x0 + w - 0.5) break;
              const m = caseMs[Math.floor(r() * caseMs.length)];
              bx(p, sw, sh, Math.min(D - 2, upright ? cw : cl * 0.5), m, x, y0 + sy, inZ(Math.min(D - 2, upright ? cw : cl * 0.5)));
              bx(p, sw * 0.4, 0.8, 0.4, rackM, x + sw * 0.3, y0 + sy + sh * 0.6, dir > 0 ? front - 0.6 : front + 0.4);
              x += sw + 1.2;
            }
          }
        }
      }
    };
    const binSlat = (() => { const c = document.createElement('canvas'); c.width = 16; c.height = 32; const g = c.getContext('2d'); g.fillStyle = '#f4f5f3'; g.fillRect(0, 0, 16, 32); g.fillStyle = '#d6d9d8'; g.fillRect(0, 26, 16, 3); g.fillStyle = '#ffffff'; g.fillRect(0, 2, 16, 4); return c; })();
    const hoodM = k.std(0xf1f2f0, 0.35, 0.3), guideM = k.std(0xdfe2e4, 0.35, 0.5), frameMs = [0xa6832f, 0x6b4428, 0x2b2d2f, 0xc9b79a].map(c => k.std(c, 0.55, 0.2));
    const binsFace = (p, y0, z0, dir, r) => {
      const D = C.d, H = C.h, sec = 48, fz = dir > 0 ? z0 + D : z0;
      bx(p, C.L, 0.6, D, paint, 0, y0 + 2, z0); bx(p, C.L, 0.6, D, paint, 0, y0 + H - 0.6, z0); bx(p, C.L, H, 0.1, paint, 0, y0, dir > 0 ? z0 : z0 + D - 0.1);
      for (let s2 = 0; s2 < C.L / sec; s2++) {
        const x0 = s2 * sec;
        for (const xx of [x0, x0 + sec - 1.25]) for (const zz of [z0, z0 + D - 1.25]) { bx(p, 1.25, H, 1.25, paint, xx, y0, zz); k.slots(p, lPost, xx === x0 ? xx + 1.25 : xx, y0, zz, 1.25, H, xx === x0 ? 1 : -1); }
        for (let dx = 12; dx < sec - 1; dx += 12) bx(p, 0.12, H - 3.2, D - 3, paint, x0 + dx, y0 + 2.6, z0 + 1.5);
        for (let slot = 0; slot < 4; slot++) { let x = x0 + slot * 12 + 1.4; const n = 1 + Math.floor(r() * 3); for (let q = 0; q < n && x < x0 + slot * 12 + 10.5; q++) { const t2 = 1.8 + r() * 1.4, ph = 20 + r() * 50, pd = 16 + r() * (D - 22); bx(p, t2, ph, pd, frameMs[Math.floor(r() * 4)], x, y0 + 2.6, dir > 0 ? z0 + D - 3 - pd : z0 + 3); x += t2 + 0.6; } }
        if (!binDoors) continue;
        for (const gx of [x0 + 0.1, x0 + sec - 1.6]) bx(p, 1.5, H - 1, 1.6, guideM, gx, y0, dir > 0 ? fz - 1.7 : fz + 0.1);
        const tex = new THREE.CanvasTexture(binSlat); tex.colorSpace = THREE.SRGBColorSpace; tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(1, (H - 1) / 3);
        const geo = new THREE.PlaneGeometry(sec - 3, H - 1); geo.translate(0, -(H - 1) / 2, 0);
        const cur = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.4, metalness: 0.3, side: THREE.DoubleSide })); cur.position.set(x0 + sec / 2, y0 + H - 0.5, dir > 0 ? fz - 0.9 : fz + 0.9); cur.userData.dyn = true; p.add(cur);
        bx(p, sec + 0.4, 10, 11, hoodM, x0 - 0.2, y0 + H, dir > 0 ? fz - 11 : fz);
        const d = { cur, tex, open: false, h0: H - 1, click: null, g: p, dir };
        d.click = () => { d.open = !d.open; tween(cur.scale, 'y', d.open ? 0.04 : 1, 1400); if (d.open) openParts.add(d.shut); else openParts.delete(d.shut); };
        d.shut = () => { if (d.open) { d.open = false; tween(cur.scale, 'y', 1, 1000); } openParts.delete(d.shut); };
        cur.userData.onClick = d.click;
        binDoorsList.push(d);
      }
    };
    // wardrobe cabinets: steel cases, solid double doors, hat shelf and hanging rod inside
    const wardM = k.std(0xb5babd, 0.45, 0.35);
    const wardrobeFace = (p, y0, z0, dir) => {
      const D = C.d, H = C.h, fz = dir > 0 ? z0 + D : z0 - 0.8, back = dir > 0 ? z0 : z0 + D - 0.6;
      for (let u = 0; u < 3; u++) {
        const x = u * 36;
        bx(p, 36, 0.8, D, wardM, x, y0, z0); bx(p, 36, 0.8, D, wardM, x, y0 + H - 0.8, z0); bx(p, 0.6, H, D, wardM, x, y0, z0); bx(p, 0.6, H, D, wardM, x + 35.4, y0, z0); bx(p, 36, H, 0.6, wardM, x, y0, back);
        bx(p, 34.8, 0.4, D - 2, wardM, x + 0.6, y0 + H - 12, z0 + 1);
        cyl(p, 0.5, 34.8, M.chrome, x + 18, y0 + H - 16, z0 + D / 2, 12, 'x');
        doorPair(p, x + 0.2, 35.6, y0 + 0.4, H - 0.8, fz, dir, false, wardM);
      }
    };
    // weapons racks: rifle bays with a butt tray, barrel rest and hinged locking bar; a pistol and ammo bay between them
    const wFoam = k.std(0x242628, 0.95, 0), wGun = k.std(0x17181a, 0.4, 0.5), wFurn = k.std(0x5a4a38, 0.6, 0.1), wCan = k.std(0x4d5a3a, 0.6, 0.3);
    const weaponsFace = (p, y0, z0, dir, r) => {
      const D = C.d, H = C.h, bw = 36, front = dir > 0 ? z0 + D : z0, zin = (dd, off = 0.6) => (dir > 0 ? z0 + D - dd - off : z0 + off);
      for (let i = 0; i <= 3; i++) { const x = Math.min(i * bw, C.L - 1.25); for (const zz of [z0, z0 + D - 1.25]) { bx(p, 1.25, H, 1.25, paint, x, y0, zz); if (i < 3) k.slots(p, lPost, x + 1.25, y0, zz, 1.25, H, 1); if (i > 0) k.slots(p, lPost, x, y0, zz, 1.25, H, -1); } }
      bx(p, C.L, H, 0.1, paint, 0, y0, dir > 0 ? z0 : z0 + D - 0.1); bx(p, C.L, 0.6, D, paint, 0, y0 + H - 0.6, z0);
      for (let b = 0; b < 3; b++) {
        const x0 = b * bw + 1.25, w = bw - 1.25;
        if (b !== 1) {
          bx(p, w, 0.6, D - 1, paint, x0, y0 + 0.4, z0 + 0.5); bx(p, w - 1, 3, 13, wFoam, x0 + 0.5, y0 + 1, zin(13, 3));
          bx(p, w - 1, 1.5, 4, wFoam, x0 + 0.5, y0 + 42, zin(4, 8));
          for (let q = 0; q < 10; q++) {
            const g2 = group(p, x0 + 2.4 + q * 3.2, y0 + 4, dir > 0 ? z0 + D - 10 : z0 + 10); g2.rotation.y = dir > 0 ? 0 : Math.PI; g2.rotation.x = -0.08 * dir;
            bx(g2, 1.5, 13, 5.5, q % 4 === 1 ? wFurn : wGun, -0.75, 0, -2.75); bx(g2, 1.3, 12, 3, wGun, -0.65, 13, -1.5); bx(g2, 1, 6, 2.2, wGun, -0.5, 9, 1.4); bx(g2, 1.6, 10, 2.4, wGun, -0.8, 25, -1.2); cyl(g2, 0.35, 8, wGun, 0, 39, -0.4, 8);
          }
          bx(p, w - 2, 1.6, 1, M.steel, x0 + 1, y0 + 30, dir > 0 ? front - 1.6 : front + 0.6);
          for (const sy of [50, 64]) { bx(p, w, 0.6, D - 1, paint, x0, y0 + sy, z0 + 0.5); for (let q = 0; q < 3; q++) bx(p, 10, 7, 6, wCan, x0 + 1 + q * 11.4, y0 + sy + 0.6, zin(6, 2)); }
        } else {
          for (const sy of [0.4, 16, 32, 48, 64]) bx(p, w, 0.6, D - 1, paint, x0, y0 + sy, z0 + 0.5);
          for (const sy of [16.6, 32.6, 48.6]) { bx(p, w - 2, 2.6, 6, wFoam, x0 + 1, y0 + sy, zin(6, 3)); for (let q = 0; q < 7; q++) { const x = x0 + 2 + q * 4.6; bx(p, 1.1, 6.2, 1.5, wGun, x, y0 + sy + 0.3, zin(1.5, 6)); bx(p, 1.1, 1.8, 5, wGun, x, y0 + sy + 5.3, zin(5, 4)); } }
          for (let q = 0; q < 3; q++) bx(p, 10, 7, 12, wCan, x0 + 1 + q * 11.4, y0 + 1, zin(12, 2));
          for (let q = 0; q < 2; q++) bx(p, 16, 5, 14, M.dark, x0 + 1 + q * 17, y0 + 64.6, zin(14, 2));
        }
      }
    };
    const artRack = kind === 'artrack', wUp = k.std(0xf1f2f0, 0.45, 0.3), perfM = (() => { const c = document.createElement('canvas'); c.width = c.height = 32; const g = c.getContext('2d'); g.fillStyle = '#d3d7da'; g.fillRect(0, 0, 32, 32); g.fillStyle = '#6f777c'; for (const [x, y] of [[8, 8], [24, 8], [16, 20], [0, 20], [32, 20], [8, 32], [24, 32], [8, 0], [24, 0]]) { g.beginPath(); g.arc(x, y, 3, 0, Math.PI * 2); g.fill(); } const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(16, 20); return new THREE.MeshStandardMaterial({ map: t, roughness: 0.35, metalness: 0.8 }); })();
    const palletFace = (p, y0, z0, loads, r) => {
      const bw = 96, D = C.d, upM = kind === 'artrack' ? wUp : up, bmM = kind === 'artrack' ? wUp : beam;
      for (let i = 0; i <= 2; i++) { const x = i * (bw + 3); for (const z of [z0, z0 + D - 3]) bx(p, 3, C.h, 3, upM, x, y0, z); for (let y = 6; y < C.h; y += 36) bx(p, 1.4, 1.4, D - 6, upM, x + 0.8, y0 + y, z0 + 3); }
      if (kind === 'artrack') {
        for (let b = 0; b < 2; b++) { const x0 = b * (bw + 3) + 3; for (const lv of [0, 50, 100]) {
          if (lv) { bx(p, bw, 4.5, 1.8, bmM, x0, y0 + lv, z0); bx(p, bw, 4.5, 1.8, bmM, x0, y0 + lv, z0 + D - 1.8); for (let q = 0; q < 3; q++) bx(p, bw / 3 - 0.4, 0.25, D - 2, perfM, x0 + q * (bw / 3) + 0.2, y0 + lv + 4.5, z0 + 1); }
          for (let q = 0; q < 3; q++) museumObjects(THREE, p, x0 + 2 + q * 31, y0 + lv + (lv ? 4.75 : 0), z0 + 2, 30, D - 4, r, lv >= 100 ? 36 : 42);
        } }
        return;
      }
      for (let b = 0; b < 2; b++) {
        const x0 = b * (bw + 3) + 3;
        for (const lv of [0, 50, 100]) {
          if (lv) { bx(p, bw, 4.5, 1.8, beam, x0, y0 + lv, z0); bx(p, bw, 4.5, 1.8, beam, x0, y0 + lv, z0 + D - 1.8); }
          for (let q = 0; q < 2; q++) {
            const px = x0 + 3 + q * 46, py = y0 + lv + (lv ? 4.5 : 0);
            loads.push({ x: px, y: py, z: z0 + 1, w: 40, h: 5, d: D - 2, color: '#b08658' });
            const s = lv >= 100 ? 1 : 1 + Math.floor(r() * 2); // top level: one layer, clear of the cable arms
            for (let c = 0; c < s; c++) for (let m = 0; m < 2; m++) if (r() > 0.12) loads.push({ x: px + 1 + m * 19.5, y: py + 5 + c * 19.5, z: z0 + 2, w: 18.5, h: 19, d: D - 4, color: KRAFT[Math.floor(r() * 4)] });
          }
        }
      }
    };
    // open-frame bays on 48" centers: open shelving (pick bins), tire racks, grow racks
    const frameFace = (p, y0, z0, dir, list, r) => {
      const D = C.d, bays = C.L / 48, upM = kind === 'grow' ? gWhite : kind === 'tire' ? tBlueP : oUpP, bmM = kind === 'grow' ? gWhite : kind === 'tire' ? tBlue : oBeam;
      for (let i = 0; i <= bays; i++) {
        const x = Math.min(i * 48, C.L - 2);
        for (const z of [z0, z0 + D - 2]) bx(p, 2, C.h, 2, upM, x, y0, z);
        for (let y = 10; y < C.h - 6; y += 30) bx(p, 1.2, 1.2, D - 4, upM, x + 0.4, y0 + y, z0 + 2);
      }
      if (kind === 'open') {
        for (const lv of [3, 22, 41, 60, 79]) for (let b = 0; b < bays; b++) {
          const x0 = b * 48 + 2, w = 46;
          bx(p, w, 2.4, 1.4, bmM, x0, y0 + lv, z0 + (dir > 0 ? D - 1.4 : 0)); bx(p, w, 2.4, 1.4, bmM, x0, y0 + lv, z0 + (dir > 0 ? 0 : D - 1.4));
          bx(p, w, 0.6, D - 2.8, deckM, x0, y0 + lv + 1.8, z0 + 1.4);
          if (lv > 70) continue;
          let x = x0 + 0.5;
          for (let bw = 5.5 + Math.floor(r() * 2) * 5; x + bw < x0 + w - 0.5; bw = 5.5 + Math.floor(r() * 2) * 5) { list.push({ x, y: y0 + lv + 2.4, z: z0 + 2, w: bw - 0.4, h: 6 + r() * 4, d: D - 4, color: r() > 0.3 ? '#c49a64' : '#ece8de' }); x += bw; }
        }
      } else if (kind === 'tire') {
        for (const lv of [4, 34, 64]) for (let b = 0; b < bays; b++) {
          const x0 = b * 48 + 2;
          for (const bz of [z0 + D / 2 - 11.5, z0 + D / 2 + 10]) bx(p, 46, 3, 1.5, bmM, x0, y0 + lv, bz);
          for (let x = x0 + 4.4; x < x0 + 43; x += 8.2) if (r() > 0.1) list.push({ x, y: y0 + lv + 12.1, z: z0 + D / 2, label: r() > 0.45, spin: r() * 6 });
        }
      } else {
        for (const lv of [6, 38, 70]) for (let b = 0; b < bays; b++) {
          const x0 = b * 48 + 2, w = 46;
          bx(p, w, 2, 1.4, bmM, x0, y0 + lv, z0); bx(p, w, 2, 1.4, bmM, x0, y0 + lv, z0 + D - 1.4);
          const dk = new THREE.Mesh(new THREE.PlaneGeometry(w, D - 2.8), wire); dk.rotation.x = -Math.PI / 2; dk.position.set(x0 + w / 2, y0 + lv + 2, z0 + D / 2); p.add(dk);
          bx(p, w - 2, 3, D - 5, trayM, x0 + 1, y0 + lv + 2.1, z0 + 2.5);
          for (let x = x0 + 4; x < x0 + w - 3; x += 7.5) for (const z of [z0 + 7, z0 + D - 7]) list.push({ x, y: y0 + lv + 5.1, z, s: 0.8 + r() * 0.5, g: r() });
          if (lv > 6) for (let z = z0 + 4; z < z0 + D - 3; z += 5.5) bx(p, w - 2, 0.5, 1.2, led, x0 + 1, y0 + lv - 0.8, z);
        }
        for (let z = z0 + 4; z < z0 + D - 3; z += 5.5) bx(p, C.L - 4, 0.5, 1.2, led, 2, y0 + C.h - 1, z);
      }
    };
    const plants = (p, list) => {
      if (!list.length) return;
      const geo = new THREE.DodecahedronGeometry(3.6, 0), im = new THREE.InstancedMesh(geo, leaf, list.length), o = new THREE.Object3D(), col = new THREE.Color();
      list.forEach((t, i) => { o.position.set(t.x, t.y + 3.2 * t.s, t.z); o.scale.set(t.s, t.s * 1.25, t.s); o.rotation.set(0, t.g * 6, 0); o.updateMatrix(); im.setMatrixAt(i, o.matrix); im.setColorAt(i, col.setHSL(0.26 + t.g * 0.06, 0.62, 0.2 + t.g * 0.1)); });
      im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true; p.add(im);
    };
    const make = () => {
      if (unit) root.remove(unit);
      C = HD_KINDS[kind]; unit = group(root); unit.userData.dyn = true; if (C.noElectric) electric = false; objReset(); paintReset();
      if (C.electricOnly) electric = true;
      const { L, d, h, N, cH } = C, aisle = aisleW ?? C.aisle, deck = 1.5, r = rng(9);
      const depths = [C.df || d + 1, ...Array(N).fill(C.dm || 2 * d + (kind === 'pallet' ? 3 : 1)), C.df || d + 1];
      const base = []; let acc = 0; for (const dd of depths) { base.push(acc); acc += dd + 0.8; }
      const total = acc + aisle;
      bx(unit, L + 14, deck, total + 8, k.std(0x8f969a, 0.8, 0.1), -4, 0, -4);
      for (const rx of [8, L / 2 - 10, L / 2 + 10, L - 8]) bx(unit, 1.2, 0.35, total + 8, M.steel, rx - 0.6, deck, -4);
      open = Math.min(open, N);
      const handleM = kind === 'grow' ? red : black;
      if (kind === 'pallet') twoLevel = false;
      const MZ = h + cH + deck + 16; binDoorsList = [];
      const buildRanges = (yb, up) => depths.map((dd, j) => {
        const g = group(unit, 0, yb + deck + 0.35, 0), fixed = j === 0 || j === depths.length - 1, last = j === depths.length - 1;
        g.userData.dd = dd;
        bx(g, L, cH, dd, M.dark, 0, 0, 0);
        // rubber bumpers on both faces so carriages close up without touching
        for (const bxp of [6, L - 6]) for (const bz of [-0.4, dd]) cyl(g, 0.9, 0.4, bumperM, bxp, cH * 0.55, bz + 0.2, 12, 'z');
        const faces = fixed ? [[j === 0 ? 0.5 : 0.5, j === 0 ? 1 : -1]] : [[0.5, -1], [d + 1, 1]];
        if (kind === 'shelving') {
          if (!fixed || j === 0) shelving(k, g, { bays: 3, w: 36, d, h, closed: closedShelf, shelves: 7, paint, contents: 'boxes', seed: 3 + j, y: cH, z: fixed ? 0.5 : d + 1, pull: boxPull });
          if (!fixed || last) { const back = shelving(k, g, { bays: 3, w: 36, d, h, closed: closedShelf, shelves: 7, paint, contents: 'boxes', seed: 30 + j, y: cH, pull: boxPull }); back.rotation.y = Math.PI; back.position.set(L, cH, fixed ? d + 0.5 : d); }
        } else if (kind === 'flat') {
          for (const [z, dir] of faces) flatFace(g, cH, z, dir);
        } else if (kind === 'museum') {
          for (const [z, dir] of faces) museumFace(g, cH, z, dir);
        } else if (C.gear != null) {
          for (const [z, dir] of faces) gearFace(g, cH, z, dir, r);
        } else if (kind === 'bins') {
          for (const [z, dir] of faces) binsFace(g, cH, z, dir, r);
        } else if (kind === 'wardrobe') {
          for (const [z, dir] of faces) wardrobeFace(g, cH, z, dir);
        } else if (kind === 'weapons') {
          for (const [z, dir] of faces) weaponsFace(g, cH, z, dir, r);
        } else if (kind === 'library') {
          const books = []; for (const [z, dir] of faces) libFace(g, cH, z, dir, books, r); many(g, books, k.std(0xffffff, 0.7, 0));
        } else if (kind === 'textile') {
          for (const [z, dir] of faces) texFace(g, cH, z, dir, r);
        } else if (kind === 'art') {
          artFace(g, cH, dd, r);
          if ((panelsOn ?? false)) { bx(g, 1.6, h + cH, dd - 0.3, panel, L + 1.3, 0, 0.15); bx(g, 1.6, h + cH, dd - 0.3, panel, -1.6, 0, 0.15); }
          if (!fixed) bx(g, 1.2, 41, 4, black, L, 0.5, dd / 2 - 2);
        } else if (kind === 'pallet' || kind === 'artrack') {
          const loads = []; palletFace(g, cH, 0.5, loads, r); if (!fixed) palletFace(g, cH, d + 2.5, loads, r); many(g, loads, M.kraft);
        } else {
          const list = []; for (const [z, dir] of faces) frameFace(g, cH, z, dir, list, r);
          if (kind === 'open') many(g, list, M.kraft); else if (kind === 'tire') tireMesh(THREE, g, list); else plants(g, list);
        }
        if ((panelsOn ?? !!C.panels) && kind !== 'art') {
          bx(g, 1.6, h + cH + 1, dd - 0.3, panel, L, 0, 0.15); bx(g, 1.6, h + cH + 1, dd - 0.3, panel, -1.6, 0, 0.15);
          bx(g, 0.4, h - 10, 0.8, M.chrome, L + 1.6, 8, 0.4); bx(g, 0.4, h - 10, 0.8, M.chrome, L + 1.6, 8, dd - 1.2);
        } else if (kind === 'pallet') bx(g, 2, cH + 10, dd, panel, L + 2, 0, 0);
        else if (kind !== 'art') bx(g, 1.6, 34, dd - 0.3, kind === 'grow' ? gWhite : panel, L, 0, 0.15);
        if (!fixed) {
          const hy = { shelving: 50, library: 50, flat: 34, museum: 34, wardrobe: 40, art: 40, textile: 30, weapons: 40 }[kind] || 26, ex = kind === 'pallet' ? L + 4 : kind === 'art' ? L + ((panelsOn ?? false) ? 3 : 1.4) : L + 1.6;
          const hub = group(g, ex + 0.2, hy, dd / 2);
          cyl(hub, 2.6, 2, handleM, 1, 0, 0, 28, 'x'); cyl(hub, 1.6, 0.4, M.chrome, 2.1, 0, 0, 24, 'x');
          for (let s = 0; s < 3; s++) {
            const arm = new THREE.Group(); arm.rotation.x = (s * Math.PI * 2) / 3; hub.add(arm);
            const a = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 1.1, 8.4, 16), handleM); a.position.set(1.2, 4.6, 0); arm.add(a);
            const ball = new THREE.Mesh(new THREE.SphereGeometry(1.4, 20, 14), black); ball.position.set(1.2, 9.4, 0); arm.add(ball);
          }
          const pad = group(g, ex, hy - 10, dd / 2 - 4);
          bx(pad, 0.9, 16, 8, black, 0, 0, 0);
          cyl(pad, 1.2, 0.6, go, 1.1, 12, 2.2, 20, 'x'); cyl(pad, 1.2, 0.6, go, 1.1, 12, 5.8, 20, 'x');
          cyl(pad, 1.4, 0.8, stop, 1.2, 6.5, 4, 20, 'x'); bx(pad, 0.2, 0.8, 6, go, 0.9, 2, 1);
          // skinny art carriages sit close together, so their handles are smaller
          if (kind === 'art') { hub.scale.setScalar(0.55); pad.scale.setScalar(0.6); }
          hub.visible = !electric; pad.visible = electric;
          hub.userData.dyn = pad.userData.dyn = true;
          // standing in an aisle, the carriages stay put: nobody closes an aisle on themselves
          g.userData.onClick = () => { if (inside()) { toast?.(electric ? 'Safety engaged: someone is in the system, so the carriages will not move. Step out to the walkway first.' : 'The aisles stay locked while you are in the system. Step out to the walkway to move them.'); return; } open = open === j - 1 ? j : j - 1; move(); };
          g.userData.wheel = hub; g.userData.pad = pad;
        }
        g.userData.fixed = fixed;
        g.position.z = base[j] + (j > open ? aisle : 0);
        g.userData.base = base[j];
        return g;
      });
      ranges = buildRanges(0, false);
      // painting bins: the bay facing the open aisle starts with its door rolled up, so the art shows
      const peek = binDoorsList.find(d => (d.g === ranges[open] && d.dir > 0) || (d.g === ranges[open + 1] && d.dir < 0));
      if (peek) { peek.open = true; peek.cur.scale.y = 0.04; openParts.add(peek.shut); }
      ranges2 = [];
      if (twoLevel) {
        // structural mezzanine around the lower system; a second system rides rails on the deck
        const x0 = -10, x1 = L + 46, z0 = -10, z1 = total + 10;
        for (const cx of [x0, L / 2, x1 - 5]) for (const cz of [z0, z1 - 5]) { bx(unit, 5, MZ - 1.5, 5, steelM, cx, 0, cz); bx(unit, 11, 0.6, 11, M.steel, cx - 3, 0, cz - 3); }
        for (const cz of [z0, z1 - 5]) bx(unit, x1 - x0, 9, 5, steelM, x0, MZ - 10.5, cz);
        for (const cx of [x0, x1 - 5]) bx(unit, 5, 9, z1 - z0, steelM, cx, MZ - 10.5, z0);
        bx(unit, x1 - x0, 1.5, z1 - z0, mzDeck, x0, MZ - 1.5, z0);
        for (const rx of [8, L / 2 - 10, L / 2 + 10, L - 8]) bx(unit, 1.2, 0.35, total + 8, M.steel, rx - 0.6, MZ, -4);
        const post = (x, z) => bx(unit, 2, 42, 2, railY, x - 1, MZ, z - 1);
        for (let x = x0 + 1; x <= x1 - 1; x += 48) { post(x, z0 + 1); post(x, z1 - 1); }
        for (let z = z0 + 1; z <= z1 - 60; z += 48) { post(x0 + 1, z); post(x1 - 1, z); }
        for (const [zz, a, b] of [[z0 + 1, x0, x1], [z1 - 1, x0, x1]]) { bx(unit, b - a, 2, 2, railY, a, MZ + 40, zz - 1); bx(unit, b - a, 1.5, 1.5, railY, a, MZ + 21, zz - 0.75); bx(unit, b - a, 4, 0.3, railY, a, MZ, zz - 0.15); }
        for (const xx of [x0 + 1, x1 - 1]) { bx(unit, 2, 2, z1 - z0 - 58, railY, xx - 1, MZ + 40, z0); bx(unit, 1.5, 1.5, z1 - z0 - 58, railY, xx - 0.75, MZ + 21, z0); bx(unit, 0.3, 4, z1 - z0 - 58, railY, xx - 0.15, MZ, z0); }
        // stair down from the walkway on the handle side
        const steps = Math.ceil(MZ / 7.5), rise = MZ / steps, run = 11, sx = x1, sz = z1 - 50;
        for (let i = 0; i < steps; i++) bx(unit, run + 1, 1.2, 40, mzDeck, sx + i * run, MZ - (i + 1) * rise, sz);
        for (const zz of [sz - 0.8, sz + 40.8]) { k.bar(unit, sx, MZ - 4, sx + steps * run, -4, zz, 9, steelM, 1.5); k.bar(unit, sx, MZ + 36, sx + steps * run, 36, zz, 1.6, railY, 1.6); for (let i = 1; i < steps; i += 3) bx(unit, 1.6, 37, 1.6, railY, sx + i * run + run / 2 - 0.8, MZ - (i + 1) * rise, zz - 0.8); }
        ranges2 = buildRanges(MZ - deck, true);
      }
      // telescopic cable arms over the end panels: power and data follow every carriage
      arms = [];
      for (const [list, yb] of twoLevel ? [[ranges2, MZ - deck]] : [[ranges, 0]]) for (let j = 0; j + 1 < list.length; j++) {
        const a = list[j], b = list[j + 1], top = yb + deck + 0.35 + cH + h + 1.8, ag = group(unit, 0, 0, 0); ag.userData.dyn = true;
        const maxSep = (a.userData.dd + b.userData.dd) / 2 + 0.8 + aisle, len = (maxSep / 2) * 1.08;
        const lA = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.1, 1), armM), lB = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.1, 1), armM), knee = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1.8, 14), armM);
        lA.scale.z = lB.scale.z = len;
        const pa = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.6, 2.2), armM), pb = pa.clone();
        [lA, lB, knee, pa, pb].forEach(m => { m.userData.dyn = true; ag.add(m); });
        ag.visible = electric;
        arms.push({ a, b, top, len, lA, lB, knee, pa, pb, g: ag, x: L + 0.8 });
      }
      // aisle safety, electric only: a sweep along each carriage base, photo-eye beams across the aisle entrance,
      // and a light carpet that lights the open aisle floor from a scanner on the end panel
      safeties = []; sweeps = [];
      const sweepM = k.std(0x1b1c1e, 0.7, 0.1), edgeM = k.std(0xf2c230, 0.5, 0.2), beamM = new THREE.MeshBasicMaterial({ color: 0xff3b30, transparent: true, opacity: 0.55, depthWrite: false, toneMapped: false }), carpetM = new THREE.MeshBasicMaterial({ color: 0x39d0a0, transparent: true, opacity: 0.22, depthWrite: false, toneMapped: false });
      for (const [list, yb] of [[ranges, 0], ...(twoLevel ? [[ranges2, MZ - deck]] : [])]) {
        list.forEach((g, j) => { if (g.userData.fixed && j === 0) return; const sw = group(g); sw.userData.dyn = true; for (const z of j === 0 ? [g.userData.dd] : [-0.6, g.userData.dd]) { bx(sw, L - 2, 1.6, 0.6, sweepM, 1, 0.3, z); bx(sw, L - 2, 0.3, 0.62, edgeM, 1, 1.6, z); } sweeps.push(sw); });
        for (let j = 0; j + 1 < list.length; j++) {
          const a = list[j], b = list[j + 1], y0 = yb + deck + 0.35, sg = group(unit); sg.userData.dyn = true;
          const beams = [6, 30].map(yy => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 1), beamM); m.position.set(L + 2.2, y0 + yy, 0); m.userData.noShadow = m.userData.dyn = true; sg.add(m); return m; });
          const carpet = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), carpetM); carpet.rotation.x = -Math.PI / 2; carpet.userData.noShadow = carpet.userData.dyn = true; sg.add(carpet);
          const eye = bx(null, 1.6, 2, 2.4, M.black, 0, 0, 0); eye.userData.dyn = true; b.add(eye); eye.position.set(L + 2.2, cH + h + 2, 1.2);
          safeties.push({ a, b, y0, beams, carpet, eye, g: sg });
        }
      }
      tick(); paintLoad();
      unit.traverse(o => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; } });
      bake?.(unit); wake();
    };
    // standing within the system footprint (in an aisle, between carriages) locks it; the walkway around it does not
    const inside = () => { const p = playerPos?.(); if (!p || !C) return false; const last = ranges[ranges.length - 1]; return p.x > -6 && p.x < C.L + 6 && p.z > -4 && p.z < (last ? last.position.z + last.userData.dd + 4 : 0); };
    const boxPull = { tween, reg: openParts, gate: () => !!isWalking?.() };
    const moveList = (list, op) => list.forEach((g, j) => {
      if (g.userData.fixed) return;
      const to = g.userData.base + (j > op ? (aisleW ?? C.aisle) : 0), dz = to - g.position.z; if (Math.abs(dz) < 0.1) return;
      // electric carriages ramp up and down smoothly; mechanical ones follow the handle
      const ms = electric ? 900 + Math.abs(dz) * (kind === 'pallet' ? 14 : 22) : 700 + Math.abs(dz) * 14;
      tween(g.position, 'z', to, ms);
      if (!electric) tween(g.userData.wheel.rotation, 'x', g.userData.wheel.rotation.x + dz * 0.16, ms);
    });
    const nearest = (list) => { const w = aisleW ?? C.aisle; let bi = 0; list.forEach((a, i) => { if (Math.abs(a[1] - w) < Math.abs(list[bi][1] - w)) bi = i; }); return bi; };
    const UNIT_MATS = () => ({ shelving: [paint], library: [paint, lPost], flat: [ff], museum: [mWhite], wardrobe: [wardM], textile: [tFrame], art: [aWhite], weapons: [paint], artrack: [wUp], open: [oUp, oUpP], tire: [tBlue, tBlueP], grow: [gWhite], pallet: [up] }[kind] || []);
    const paintLoad = () => { const n = loadColor[kind] || 0; UNIT_MATS().forEach(m => { if (m.userData.c0 == null) m.userData.c0 = m.color.getHex(); m.color.setHex(n ? UNIT_COLORS[n][1] : m.userData.c0); }); wake(); };
    // anything left open (drawers, doors) closes before the carriages move
    const move = () => {
      open2 = open;
      const go = () => { moveList(ranges, open); moveList(ranges2, open2); };
      if (!openParts.size) return go();
      let w = 750; [...openParts].forEach(f => { const t = f(); if (typeof t === 'number') w = Math.max(w, t + 100); }); openParts.clear(); setTimeout(go, w);
    };
    // each frame, fold or stretch the cable arms to the gap between their two carriages
    const tick = () => {
      const on = electric;
      sweeps.forEach(sw => { sw.visible = on && (safety === 1 || safety === 3); });
      for (const q of safeties) {
        const z0 = q.a.position.z + q.a.userData.dd + 0.3, z1 = q.b.position.z - 0.3, gap = z1 - z0, openA = gap > 8;
        q.g.visible = on; q.eye.visible = on && (safety === 2 || safety === 3);
        q.beams.forEach(m => { m.visible = on && (safety === 2 || safety === 3) && gap > 1; m.scale.z = Math.max(0.1, gap); m.position.z = (z0 + z1) / 2; });
        q.carpet.visible = on && safety === 3 && openA; q.carpet.scale.set(C.L - 4, Math.max(0.1, gap - 2), 1); q.carpet.position.set(C.L / 2, q.y0 + 0.08, (z0 + z1) / 2);
      }
      binDoorsList.forEach(d => { d.tex.repeat.y = Math.max(0.2, (d.h0 * d.cur.scale.y) / 3); });
      for (const q of arms) {
        if (!q.g.visible) continue;
        const zA = q.a.position.z + q.a.userData.dd / 2, zB = q.b.position.z + q.b.userData.dd / 2, half = (zB - zA) / 2, dx = Math.sqrt(Math.max(q.len * q.len - half * half, 0.25)), zm = (zA + zB) / 2;
        // the elbow swings inward over the shelving as carriages close, and straightens as the aisle opens
        q.lA.position.set(q.x - dx / 2, q.top, zA + half / 2); q.lA.rotation.set(0, Math.atan2(-dx, half), 0);
        q.lB.position.set(q.x - dx / 2, q.top, zm + half / 2); q.lB.rotation.set(0, Math.atan2(dx, half), 0);
        q.knee.position.set(q.x - dx, q.top, zm); q.pa.position.set(q.x, q.top, zA); q.pb.position.set(q.x, q.top, zB);
      }
    };
    make();
    return {
      group: root, view: [1.45, 0.62, 0.62], tick,
      prompt: 'Tap a carriage or its handle to open that aisle, or tap the walker to step in',
      // stand at the mouth of the open aisle; walking stays inside the aisle and the cross aisle at the handle end
      walk: () => {
        const a = ranges[open], b = ranges[open + 1]; if (!a || !b) return null;
        const z0 = a.userData.base + a.userData.dd + 0.8, z1 = b.userData.base + (aisleW ?? C.aisle), zc = (z0 + z1) / 2, eye = 1.85 + 64;
        const spots = []; for (let x = 20; x < C.L + 30; x += 32) spots.push([x, zc]);
        return { eye: [C.L + 34, eye, zc], look: [C.L * 0.3, eye - 8, zc], floor: 1.9, spots };
      },
      presets: lite ? [] : [
        ['Records room', { kind: 'shelving', electric: false, twoLevel: false }],
        ['Museum collections', { kind: 'museum', electric: false, twoLevel: false }],
        ['Art storage', { kind: 'bins', electric: false, twoLevel: false }],
        ['Athletics', { kind: 'athletic', electric: false, twoLevel: false }],
        ['Museum objects', { kind: 'artrack', electric: false, twoLevel: false }],
        ['Weapons', { kind: 'weapons', electric: false, twoLevel: false }],
        ['Warehouse, electric', { kind: 'pallet', electric: true, twoLevel: false }],
        ['Two stories on a mezzanine', { kind: 'shelving', electric: true, twoLevel: true }],
      ].map(([label, p]) => ({ label, run: () => { kind = p.kind; electric = !!(p.electric || HD_KINDS[kind].electricOnly); twoLevel = p.twoLevel && kind !== 'pallet'; panelsOn = null; aisleW = null; openParts.clear(); open = 1; make(); refit?.(); } })),
      finishes: [{ name: 'Black', swatch: '#2c2f31', color: 0x2c2f31 }, { name: 'O\'Brien teal', swatch: '#0f7377', color: 0x0f7377 }, { name: 'Maple laminate', swatch: '#c79a66', color: 0xc79a66 }, { name: 'Light gray', swatch: '#c3c7ca', color: 0xbfc4c7 }, { name: 'Navy', swatch: '#2a3d5c', color: 0x2a3d5c }],
      setFinish: k.finisher(panel),
      actions: [
        { label: 'Storage', when: () => !lite, options: HD_ORDER.map(q => HD_KINDS[q].label.replace('Storage: ', '').replace(/^./, c => c.toUpperCase())), get: () => HD_ORDER.indexOf(kind), set: n => { const was = HD_KINDS[kind].electricOnly; kind = HD_ORDER[n]; panelsOn = null; aisleW = null; openParts.clear(); if (HD_KINDS[kind].electricOnly) electric = true; else if (was) electric = false; open = 1; make(); refit?.(); } },
        { label: 'Aisle', when: () => kind !== 'pallet', options: AISLE_STD.map(a => a[0]), get: () => nearest(AISLE_STD), set: n => { aisleW = AISLE_STD[n][1]; make(); refit?.(); } },
        { label: 'Forklift aisle', when: () => kind === 'pallet', options: AISLE_FORK.map(a => a[0]), get: () => nearest(AISLE_FORK), set: n => { aisleW = AISLE_FORK[n][1]; make(); refit?.(); } },
        { label: 'Two levels on a mezzanine', toggle: true, when: () => !lite && kind !== 'pallet', get: () => twoLevel, set: v => { twoLevel = v; open2 = open; make(); refit?.(); } },
        { label: 'Close all aisles', run: () => { if (isWalking?.()) overview?.(); open = C.N; move(); } },
        { label: 'Aisle safety', when: () => electric, options: ['None shown', 'Safety sweeps', 'Photo-eye light curtain', 'Sweeps, photo eyes and light carpet'], get: () => safety, set: n => { safety = n; tick(); wake(); } },
        { label: 'Electric', toggle: true, when: () => !C.electricOnly && !C.noElectric, get: () => electric, set: v => { electric = v; [...ranges, ...ranges2].forEach(g => { if (g.userData.fixed) return; g.userData.wheel.visible = !electric; g.userData.pad.visible = electric; }); arms.forEach(q => { q.g.visible = electric; }); tick(); wake(); } },
        { label: 'End panels', toggle: true, when: () => !lite && kind !== 'pallet', get: () => panelsOn ?? (kind !== 'art' && !!C.panels), set: v => { panelsOn = v; make(); } },
        { label: 'Roll-up doors', toggle: true, when: () => kind === 'bins', get: () => binDoors, set: v => { binDoors = v; make(); } },
        { label: 'Open the roll-up doors', when: () => kind === 'bins' && binDoors, run: () => { const o = !binDoorsList.every(d => d.open); binDoorsList.forEach(d => { if (d.open !== o) d.click(); }); return o ? 'Close the roll-up doors' : 'Open the roll-up doors'; } },
        { label: 'Closed shelving', toggle: true, when: () => !lite && kind === 'shelving', get: () => closedShelf, set: v => { closedShelf = v; make(); } },
        { label: 'Unit color', when: () => !lite, options: UNIT_COLORS.map(c => c[0]), get: () => loadColor[kind] || 0, set: n => { loadColor[kind] = n; paintLoad(); } },
      ],
    };
  });
}
hdMobile('hd-mobile', 'High-Density Mobile Storage', 'Mobile carriages on floor rails: shelving, open shelving, flat files, tire racks, grow racks or pallet rack', 'shelving');
hdMobile('hd-mobile-open', 'Mobile Open Shelving', 'Open-frame shelving with pick bins on mobile carriages', 'open');
hdMobile('hd-mobile-tire', 'Mobile Tire Storage', 'Tire racks on mobile carriages', 'tire');
hdMobile('hd-mobile-grow', 'Mobile Grow Racks', 'Lit grow racks on mobile carriages, one aisle for the whole room', 'grow');
hdMobile('hd-mobile-flat', 'Mobile Flat File Storage', 'Flat file cabinets on mobile carriages', 'flat');
hdMobile('hd-mobile-museum', 'Mobile Museum Cabinets', 'Museum storage cabinets on mobile carriages', 'museum');
hdMobile('hd-mobile-library', 'Mobile Library Shelving', 'Double-faced cantilever library shelving on mobile carriages', 'library');
hdMobile('hd-mobile-textile', 'Mobile Rolled Textile Storage', 'Double-sided textile racks on mobile carriages', 'textile');
hdMobile('hd-mobile-art', 'Mobile Art Screens', 'Art screens on skinny mobile carriages: gussets at every upright, chain box and crank', 'art');
hdMobile('hd-mobile-gear', 'Mobile Athletic Storage', 'Mobile shelving with helmet shelves, pad and jersey hangers, ball racks', 'athletic');
hdMobile('hd-mobile-golf', 'Mobile Golf Bag Storage', 'Golf bag bays with dividers and strap bars on mobile carriages', 'golf');
hdMobile('hd-mobile-instruments', 'Mobile Instrument Storage', 'Instrument cubbies sized to each case, on mobile carriages', 'instruments');
hdMobile('hd-mobile-bins', 'Mobile Painting Bins', 'Painting bins on mobile carriages, with or without roll-up doors', 'bins');
hdMobile('hd-mobile-wardrobe', 'Mobile Wardrobe Cabinets', 'Steel wardrobe cabinets on mobile carriages, doors that open', 'wardrobe');
hdMobile('hd-mobile-artrack', 'Museum Object Rack, Mobile', 'White rack with 3-piece perforated aluminum decks for sculpture and crated works, on mobile carriages', 'artrack');
hdMobile('hd-mobile-weapons', 'Mobile Weapons Storage', 'Rifle racks with locking bars, pistol racks and ammo shelves on mobile carriages', 'weapons');
hdMobile('hd-mobile-pallet', 'Mobile Pallet Rack', 'Pallet rack on electric carriages: one forklift aisle for the whole run', 'pallet', { electric: true });
hdMobile('hd-mobile-mezz', 'Two-Level Mobile Storage', 'Electric mobile shelving under and on top of a structural mezzanine, with aisles on both levels', 'shelving', { twoLevel: true, electric: true });

/* ---------------- 6. lockers ---------------- */
def('lockers', 'Steel Lockers', '72" H lockers: one to four tiers, single or double door, base or legs, locks, plates, interiors', ({ THREE, tween, wake, bake }) => {
  const k = kit(THREE), { M, bx, cyl, group } = k, root = new THREE.Group();
  const paint = k.std(0xb5babd, 0.45, 0.35), brass = k.std(0xc9a227, 0.3, 0.8), plateM = k.std(0xd7dbde, 0.3, 0.85);
  const lit = k.std(0x39d353, 0.3, 0, { emissive: 0x1f8a33, emissiveIntensity: 0.8 });
  const LOCKS = ['handle', 'padlock', 'combo', 'keypad'], LOCKNAME = { handle: 'Lock: lift handle', padlock: 'Lock: padlock hasp', combo: 'Lock: built-in combination', keypad: 'Lock: digital keypad' };
  let tiers = 2, sloped = true, legs = false, double = false, lock = 'handle', numbers = false, interior = true, benchOn = true, bank, doors = [];
  const numTex = {};
  const plate = (n) => {
    if (!numTex[n]) { const c = document.createElement('canvas'); c.width = 128; c.height = 64; const g = c.getContext('2d'); g.fillStyle = '#d7dbde'; g.fillRect(0, 0, 128, 64); g.fillStyle = '#1b1d1f'; g.font = 'bold 44px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(n), 64, 35); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; numTex[n] = new THREE.MeshStandardMaterial({ map: t, roughness: 0.35, metalness: 0.6 }); }
    return new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.3), numTex[n]);
  };
  const hardware = (door, dw, dh, right) => {
    const ex = right ? 1.1 : dw - 2.1, mid = dh / 2;
    if (lock === 'keypad') { bx(door, 1.8, 2.8, 0.45, M.black, ex - 0.4, mid - 1.4, 0.35); bx(door, 1.1, 0.35, 0.05, lit, ex - 0.05, mid + 0.8, 0.8); bx(door, 0.6, 2.2, 0.7, M.chrome, ex + 0.2, mid - 4.4, 0.35); return; }
    if (lock === 'combo') { cyl(door, 1.05, 0.45, M.chrome, ex + 0.5, mid + 0.8, 0.57, 24, 'z'); cyl(door, 0.8, 0.3, M.black, ex + 0.5, mid + 0.8, 0.9, 24, 'z'); bx(door, 0.6, 2.4, 0.7, M.chrome, ex + 0.2, mid - 2.6, 0.35); return; }
    const hh = Math.min(6, dh / 3);
    bx(door, 1, hh, 0.9, M.chrome, ex, mid - hh / 2, 0.35);
    if (lock === 'padlock') { bx(door, 1.3, 1.6, 0.6, brass, ex - 0.15, mid - hh / 2 - 2.6, 0.8); const sh = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.12, 8, 16, Math.PI), M.chrome); sh.position.set(ex + 0.5, mid - hh / 2 - 1, 1.1); door.add(sh); }
  };
  const make = () => {
    if (bank) root.remove(bank);
    bank = group(root); doors = [];
    const n = double ? 2 : 4, w = double ? 24 : 12, d = 18, h = 72, baseH = 6, tr = double ? Math.min(tiers, 2) : tiers, dh = h / tr;
    if (legs) { for (let i = 0; i <= n; i++) for (const z of [1, d - 2.2]) bx(bank, 1.2, baseH, 1.2, M.dark, Math.min(i * w, n * w - 1.2), 0, z); bx(bank, n * w, 0.4, d, paint, 0, baseH - 0.4, 0); }
    else bx(bank, n * w, baseH, d - 1, M.dark, 0, 0, 0.5);
    bx(bank, n * w, 0.5, d, paint, 0, baseH + h, 0);
    if (sloped) {
      const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(d, 0); s.lineTo(0, 7.5); s.closePath();
      const wedge = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: n * w, bevelEnabled: false }), paint);
      wedge.rotation.y = -Math.PI / 2; wedge.position.set(n * w, baseH + h + 0.5, 0); bank.add(wedge);
    }
    for (let i = 0; i <= n; i++) bx(bank, 0.3, h, d, paint, i * w - (i === n ? 0.3 : 0), baseH, 0);
    bx(bank, n * w, h, 0.3, paint, 0, baseH, 0);
    let num = 101;
    for (let i = 0; i < n; i++) for (let t = 0; t < tr; t++) {
      const y0 = baseH + t * dh, x0 = i * w; num = 101 + i * tr + (tr - 1 - t);
      if (t > 0) bx(bank, w, 0.3, d, paint, x0, y0, 0);
      // interior: hat shelf, coat hooks, and a rod in full-height doubles
      if (interior && dh >= 30) {
        bx(bank, w - 0.6, 0.2, d - 1.5, paint, x0 + 0.3, y0 + dh - 10, 0.5);
        for (const hx of [x0 + 2, x0 + w - 2.4]) { bx(bank, 0.4, 0.4, 2.4, M.chrome, hx, y0 + dh - 13, 0.3); bx(bank, 0.4, 1, 0.4, M.chrome, hx, y0 + dh - 13, 2.4); }
        bx(bank, 0.4, 0.4, 3, M.chrome, x0 + w / 2 - 0.2, y0 + dh - 11.4, 0.3);
        if (double) cyl(bank, 0.45, w - 1, M.chrome, x0 + w / 2, y0 + dh - 14, d / 2, 12, 'x');
      } else if (interior && dh >= 18) bx(bank, 0.4, 0.4, 2.4, M.chrome, x0 + w / 2 - 0.2, y0 + dh - 5, 0.3);
      const leaves = double ? [[x0 + 0.3, false], [x0 + w - 0.3, true]] : [[x0 + 0.3, false]];
      for (const [px, right] of leaves) {
        const dw = double ? w / 2 - 0.45 : w - 0.6;
        const pivot = group(bank, px, y0 + 0.25, d), door = group(pivot, right ? -dw : 0, 0, 0);
        bx(door, dw, dh - 0.5, 0.35, paint, 0, 0, 0);
        const nv = tr >= 3 ? 4 : 6, top = dh - 3, vw = dw - 5, vx = right ? 3 : 2;
        for (let v = 0; v < nv; v++) bx(door, vw, 0.3, 0.25, paint, vx, top - v * 0.9, 0.3);
        if (tr <= 2) for (let v = 0; v < nv; v++) bx(door, vw, 0.3, 0.25, paint, vx, 3 + v * 0.9, 0.3);
        if (!double || right) hardware(door, dw, dh, right);
        const py = top - nv * 0.9 - 1.6, pcx = Math.min(dw / 2, dw - 4.6);
        if (!double || !right) {
          if (numbers) { const p = plate(num); p.position.set(pcx, py, 0.37); door.add(p); }
          else bx(door, 2.2, 1, 0.1, M.label, pcx - 1.1, py - 0.5, 0.36);
        }
        pivot.userData.onClick = () => { pivot.userData.open = !pivot.userData.open; tween(pivot.rotation, 'y', pivot.userData.open ? (right ? 1.9 : -1.9) : 0, 650, 'out'); };
        pivot.userData.right = right;
        doors.push(pivot);
      }
    }
    const bench = group(bank, 4, 0, 30); bench.visible = benchOn; bench.userData.dyn = true;
    bx(bench, 40, 1.5, 9.5, k.std(0xc79a66, 0.65, 0), 0, 16, 0);
    for (const x of [3, 34]) bx(bench, 3, 16, 3, M.dark, x, 0, 3.2);
    bank.traverse(o => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; } }); bank.userData.dyn = true; bake?.(bank); wake();
  };
  make();
  return {
    group: root, finishes: k.FIN.lockers, setFinish: k.finisher(paint),
    actions: [
      { label: 'Open all doors', run: () => { const o = !doors.every(p => p.userData.open); doors.forEach((p, i) => { p.userData.open = o; setTimeout(() => tween(p.rotation, 'y', o ? (p.userData.right ? 1.9 : -1.9) : 0, 650, 'out'), i * 40); }); return o ? 'Close all doors' : 'Open all doors'; } },
      { label: 'Tiers', options: ['1', '2', '3', '4'], get: () => (double ? Math.min(tiers, 2) : tiers) - 1, set: n => { tiers = n + 1; make(); } },
      { label: 'Lock', options: ['Lift handle', 'Padlock', 'Combination', 'Keypad'], get: () => LOCKS.indexOf(lock), set: n => { lock = LOCKS[n]; make(); } },
      { label: 'Top', options: ['Sloped', 'Flat'], get: () => (sloped ? 0 : 1), set: n => { sloped = n === 0; make(); } },
      { label: 'Base', options: ['Closed base', 'Legs'], get: () => (legs ? 1 : 0), set: n => { legs = n === 1; make(); } },
      { label: 'Number plates', toggle: true, get: () => numbers, set: v => { numbers = v; make(); } },
      { label: 'Hooks and shelf', toggle: true, get: () => interior, set: v => { interior = v; make(); } },
      { label: 'Bench', toggle: true, get: () => benchOn, set: v => { benchOn = v; make(); } },
    ],
  };
});

/* ---------------- 6b. evidence lockers (pass-through) ---------------- */
def('evidence-lockers', 'Pass-Through Evidence Lockers', 'Set into a wall: officers deposit on one side, the evidence room retrieves on the other', ({ THREE, tween }) => {
  const k = kit(THREE), { M, bx, group } = k, root = new THREE.Group();
  const paint = k.std(0x9aa3a8, 0.45, 0.35), wall = k.std(0xe7e4dc, 0.9, 0);
  const lit = k.std(0x39d353, 0.3, 0, { emissive: 0x1f8a33, emissiveIntensity: 0.8 });
  const screen = k.std(0x2a6f97, 0.2, 0.1, { emissive: 0x1b4f70, emissiveIntensity: 0.7 });
  const cw = 15, D = 24, base = 4, H = 72;
  // compartment heights per column, bottom to top: small, medium, long items, refrigerated
  const cols = [[18, 18, 18, 18], [12, 12, 12, 12, 12, 12], [36, 36], [24, 24, 24], [H], [12, 12, 12, 12, 12, 12]];
  const W = cols.length * cw, top = base + H + 0.6, wz = 9, wd = 6;
  // wall with the locker bank passing through it
  bx(root, 20, top + 16, wd, wall, -20, 0, wz); bx(root, 20, top + 16, wd, wall, W, 0, wz); bx(root, W, 16, wd, wall, 0, top, wz);
  bx(root, W, base, D, M.dark, 0, 0, 0);
  bx(root, W, 0.6, D, paint, 0, base + H, 0);
  const fronts = [], backs = [];
  const swing = (pv, o, front) => { pv.userData.open = o; tween(pv.rotation, 'y', o ? (front ? -1.8 : 1.8) : 0, 600); };
  cols.forEach((col, c) => {
    const x0 = c * cw; let y = base;
    bx(root, 0.4, H, D, paint, x0, base, 0);
    col.forEach(ch => {
      bx(root, cw, 0.3, D, paint, x0, y, 0);
      for (const front of [true, false]) {
        const pv = group(root, x0 + 0.3, y + 0.2, front ? D : 0), zo = front ? 0 : -0.3, zf = front ? 0.3 : -0.7;
        bx(pv, cw - 0.6, ch - 0.4, 0.3, paint, 0, 0, zo);
        bx(pv, 2.2, 3, 0.4, M.black, cw - 4.2, ch / 2 - 1.5, zf);
        bx(pv, 1.6, 0.6, 0.1, lit, cw - 3.9, ch / 2 + 1.1, front ? 0.72 : -0.82);
        if (col.length === 1 && front) bx(pv, 4, 2, 0.2, screen, 1.5, ch - 5, 0.35);
        pv.userData.onClick = () => swing(pv, !pv.userData.open, front);
        (front ? fronts : backs).push(pv);
      }
      y += ch;
    });
  });
  bx(root, 0.4, H, D, paint, W - 0.4, base, 0);
  const toggle = (list, front) => { const o = !list.every(p => p.userData.open); list.forEach(p => swing(p, o, front)); return o; };
  return {
    group: root, view: [0.75, 0.42, 1.3],
    finishes: [{ name: 'Gray', swatch: '#9aa3a8', color: 0x9aa3a8 }, { name: 'Putty', swatch: '#d9cfbd', color: 0xd6ccb9 }, { name: 'Black', swatch: '#2c2f31', color: 0x2c2f31 }], setFinish: k.finisher(paint),
    actions: [
      { label: 'Open officer side', run: () => (toggle(fronts, true) ? 'Close officer side' : 'Open officer side') },
      { label: 'Open evidence-room side', run: () => (toggle(backs, false) ? 'Close evidence-room side' : 'Open evidence-room side') },
    ],
  };
});

/* ---------------- 7. flat files ---------------- */
def('flat-files', 'Flat File Cabinets', 'Flat files from 50" x 38" to 72" x 54", 2" or 3" drawers, stacked one to three high', ({ THREE, tween, wake, bake, refit }) => {
  const k = kit(THREE), { M, bx, group } = k, root = new THREE.Group();
  const slide = k.std(0xc9ced2, 0.25, 0.9);
  const paint = k.std(0xeeefed, 0.45, 0.3), inner = k.std(0xd7dada, 0.5, 0.3), paper = [M.white, k.std(0xf1ede2, 0.85, 0), k.std(0xe6ecef, 0.85, 0)];
  const SIZES = [[50, 38, 'Standard 50" x 38"'], [60, 43, 'Large 60" x 43"'], [72, 54, 'Oversize 72" x 54"']];
  const DEPTHS = [[2.2, 5, '2" drawers, 5 high'], [3.2, 4, '3" drawers, 4 high'], [1.4, 7, '1 1/2" drawers, 7 high']];
  let si = 0, di = 0, stack = 2, unit, drawers = [];
  const make = () => {
    if (unit) root.remove(unit);
    unit = group(root); unit.userData.dyn = true; drawers = [];
    const [W, D] = SIZES[si], [ih, n] = DEPTHS[di], pitch = ih + 0.9, uh = n * pitch + 1.1, base = 4, r = rng(3);
    bx(unit, W - 2, base, D - 3, M.dark, 1, 0, 1);
    for (let u = 0; u < stack; u++) {
      const y0 = base + u * (uh + 0.3);
      bx(unit, W, 0.6, D, paint, 0, y0 + uh - 0.6, 0); bx(unit, W, 0.4, D, paint, 0, y0, 0);
      bx(unit, 0.6, uh, D, paint, 0, y0, 0); bx(unit, 0.6, uh, D, paint, W - 0.6, y0, 0); bx(unit, W, uh, 0.4, paint, 0, y0, 0);
      for (let i = 0; i < n; i++) {
        // open-top drawer: front, floor, sides, back and a rear hood, with loose sheets inside
        const dy = y0 + 0.5 + i * pitch, dr = group(unit, 0, 0, 0), mid = group(unit, 0, 0, 0), iw = W - 3, id = D - 2.8;
        mid.userData.dyn = true;
        // full-extension slides: cabinet member fixed, middle member travels half, drawer member rides the box
        for (const [x0, x1, x2] of [[0.6, 0.92, 1.2], [W - 0.9, W - 1.17, W - 1.5]]) {
          bx(unit, 0.3, Math.min(1, ih * 0.45), D - 2, slide, x0, dy + 0.6, 0.5);
          bx(mid, 0.25, Math.min(0.8, ih * 0.36), D - 5, slide, x1, dy + 0.7, 1.5);
          bx(dr, 0.3, Math.min(0.9, ih * 0.4), id - 1.5, slide, x2, dy + 0.65, 2);
        }
        bx(dr, W - 1.6, pitch - 0.2, 0.8, paint, 0.8, dy, D - 0.8);
        bx(dr, iw, 0.12, id, inner, 1.5, dy + 0.1, 1);
        bx(dr, 0.15, ih, id, inner, 1.5, dy + 0.1, 1); bx(dr, 0.15, ih, id, inner, 1.5 + iw - 0.15, dy + 0.1, 1);
        bx(dr, iw, ih, 0.15, inner, 1.5, dy + 0.1, 1);
        bx(dr, iw, 0.1, 5, inner, 1.5, dy + ih, 1);
        const sheets = 2 + Math.floor(r() * 5), sw = W * 0.72, sd = D * 0.62;
        for (let s = 0; s < sheets; s++) bx(dr, sw - r() * 6, 0.05, sd - r() * 4, s === sheets - 1 ? artMat(THREE, u * 9 + i) : paper[s % 3], 5 + r() * 2, dy + 0.25 + s * 0.09, 7 + r() * 2);
        bx(dr, 22, 0.5, 0.9, M.chrome, W / 2 - 11, dy + pitch - 1.2, D);
        bx(dr, 3, Math.min(1.3, pitch - 1.8), 0.1, M.label, W / 2 - 1.5, dy + 0.4, D + 0.02);
        const out = D * 0.74;
        dr.userData.onClick = () => { dr.userData.open = !dr.userData.open; const o = dr.userData.open; tween(dr.position, 'z', o ? out : 0, 700, 'out'); tween(mid.position, 'z', o ? out / 2 : 0, 700, 'out'); };
        drawers.push(dr);
      }
    }
    unit.traverse(q => { if (q.isMesh) { q.castShadow = q.receiveShadow = true; } });
    bake?.(unit); wake();
  };
  make();
  return {
    group: root, view: [0.7, 0.9, 1.2], finishes: k.FIN.cabinets, setFinish: k.finisher(paint),
    actions: [
      { label: 'Open a drawer', run: () => { const dr = drawers[Math.min(drawers.length - 1, Math.floor(drawers.length * 0.7))]; dr.userData.onClick(); return dr.userData.open ? 'Close the drawer' : 'Open a drawer'; } },
      { label: 'Size', options: SIZES.map(s => s[2]), get: () => si, set: n => { si = n; make(); refit?.(); } },
      { label: 'Drawers', options: DEPTHS.map(s => s[2]), get: () => di, set: n => { di = n; make(); refit?.(); } },
      { label: 'Stacked', options: ['1 unit', '2 units', '3 units'], get: () => stack - 1, set: n => { stack = n + 1; make(); refit?.(); } },
    ],
  };
});

/* ---------------- 8. rotary cabinet ---------------- */
def('rotary', 'Rotary File Cabinet', '46" W x 41" D x 84" H: the shelving unit turns inside a tight case, foot pedal release', ({ THREE, tween }) => {
  const k = kit(THREE), { M, bx, cyl, group, many } = k, root = new THREE.Group();
  const paint = k.std(0xc9cdcf, 0.45, 0.35), cast = k.std(0x2a2d30, 0.55, 0.5), r = rng(5);
  // square rotor with clipped corners: its faces sit flush with the case front, its corners just clear the walls
  const s = 34, h = s / 2, c = 2.5, H = 84, base = 3, RH = H - base - 5.2, wall = 1;
  const inner = Math.hypot(h, h - c) + 0.3, W = 2 * (inner + wall), zF = h + 1.2, zB = -(inner + wall), Dp = zF - zB;
  bx(root, W, base, Dp, M.dark, -W / 2, 0, zB);
  bx(root, W, 1.2, Dp, paint, -W / 2, H - 1.2, zB);
  bx(root, wall, H - base, Dp, paint, -W / 2, base, zB); bx(root, wall, H - base, Dp, paint, W / 2 - wall, base, zB);
  bx(root, W, H - base, wall, paint, -W / 2, base, zB);
  // front pilasters cover the clipped corners, so the opening matches the rotor face
  const open = h - c;
  bx(root, W / 2 - h, H - base, 1, paint, -W / 2, base, h + 0.2); bx(root, W / 2 - h, H - base, 1, paint, h, base, h + 0.2);
  bx(root, W, H - base - RH - 0.6, 1, paint, -W / 2, base + 0.6 + RH, h + 0.2);
  cyl(root, h - 0.6, 0.6, M.steel, 0, base + 0.3, 0, 48);
  // foot pedal, bottom right: press it and the unit is free to turn
  const pedal = group(root, h + 2.4, 0.6, h + 1.2);
  bx(pedal, 4, 1.1, 6.5, cast, -2, 0, 0); for (let q = 0; q < 4; q++) bx(pedal, 3.6, 0.25, 0.5, M.steel, -1.8, 1.1, 1.2 + q * 1.3);
  bx(root, 5, 2.2, 1.2, cast, h - 0.1, 0.4, h + 0.9);
  const rot = group(root, 0, base + 0.6, 0);
  bx(rot, s - 1.6, RH, 0.8, paint, -h + 0.8, 0, -0.4);
  for (const sx of [-1, 1]) {
    bx(rot, 0.8, RH, s - 2 * c, paint, sx > 0 ? h - 0.8 : -h, 0, -open);
    for (const sz of [-1, 1]) { const p = bx(rot, Math.hypot(c, c), RH, 0.8, paint); p.position.set(sx * (h - c / 2 - 0.25), RH / 2, sz * (h - c / 2 - 0.25)); p.rotation.y = sx * sz > 0 ? Math.PI / 4 : -Math.PI / 4; }
  }
  for (const y of [0, RH - 0.8]) { bx(rot, s, 0.8, s - 2 * c, paint, -h, y, -open); bx(rot, s - 2 * c, 0.8, s, paint, -open, y, -h); }
  // keyed lock on one side panel: it faces front when the unit is turned closed
  cyl(rot, 0.7, 0.5, M.chrome, h + 0.1, RH * 0.55, -open + 3, 20, 'x');
  const items = [];
  for (const sz of [1, -1]) for (let i = 0; i < 6; i++) {
    const y = 1 + i * 12.9;
    bx(rot, s - 1.6, 0.3, open - 0.4, paint, -h + 0.8, y, sz > 0 ? 0.4 : -open);
    bx(rot, 2 * open - 0.4, 0.3, c - 0.3, paint, -open + 0.2, y, sz > 0 ? open : -h + 0.3);
    bx(rot, 2 * open - 0.4, 1.2, 0.3, paint, -open + 0.2, y - 0.9, sz > 0 ? h - 0.6 : -h + 0.3);
    if (i === 5) continue;
    let x = -open + 0.8;
    while (x < open - 3) {
      const t = sz > 0 ? 1.8 + r() * 1.2 : 0.35 + r() * 0.5;
      if (r() > 0.1) items.push({ x, y: y + 0.3, z: sz > 0 ? h - 12.5 : -h + 1.2, w: t - 0.1, h: sz > 0 ? 11 : 9.5, d: 11, color: sz > 0 ? BOOKS[Math.floor(r() * BOOKS.length)] : KRAFT[Math.floor(r() * 4)] });
      x += t;
    }
  }
  many(rot, items, k.std(0xffffff, 0.7, 0));
  // quarter turns: 0 = files face out, -90 = closed and flush, -180 = the other face
  let step = 0, busy = false;
  const turn = async (n) => {
    if (busy) return; busy = true; step += n;
    await tween(pedal.rotation, 'x', 0.2, 180, 'out');
    await tween(rot.rotation, 'y', -step * Math.PI / 2, 700 + 450 * Math.abs(n));
    await tween(pedal.rotation, 'x', 0, 220, 'out');
    busy = false;
  };
  rot.userData.onClick = pedal.userData.onClick = () => turn(1);
  const label = () => (((step % 4) + 4) % 2 ? 'Open it' : 'Close and lock');
  return {
    group: root, view: [0.85, 0.45, 1.3], finishes: k.FIN.cabinets, setFinish: k.finisher(paint),
    actions: [
      { label: 'Close and lock', run: () => { turn(1); return (((step % 4) + 4) % 2) ? 'Open it' : 'Close and lock'; } },
      { label: 'Show the other side', run: () => { turn(2); } },
    ],
  };
});

/* ---------------- 9. museum cabinet ---------------- */
def('museum-cabinet', 'Museum Storage Cabinet', '48" W x 30" D x 88" H, full-height glass doors, twist latches, shelves over drawers', ({ THREE, tween, wake }) => {
  const k = kit(THREE), { M, bx, cyl, group } = k, root = new THREE.Group();
  const paint = k.std(0xf1f2f0, 0.38, 0.2), tray = k.std(0xe6e8e6, 0.5, 0.2), plate = k.std(0xd7dbde, 0.25, 0.85), r = rng(12);
  const W = 48, D = 30, H = 84, base = 4, t = 1;
  const things = [0xb56f4a, 0x6b8f71, 0xc9a227, 0x3d5a7a, 0x8a5f3a].map(c => k.std(c, 0.6, 0.05)), boxMat = k.std(0xe8e2d2, 0.9, 0);
  // recessed white plinth, then the case
  bx(root, W - 3, base, D - 4, paint, 1.5, 0, 1.5);
  const y0 = base;
  bx(root, W, t, D, paint, 0, y0 + H - t, 0); bx(root, t, H, D, paint, 0, y0, 0); bx(root, t, H, D, paint, W - t, y0, 0); bx(root, W, H, t, paint, 0, y0, 0); bx(root, W, t, D, paint, 0, y0, 0);
  for (const y of [y0 + 0.4, y0 + H - 1.4]) bx(root, W - 2, 0.7, 0.7, M.rubber, 1, y, D - 1.6);
  // upper shelves with objects, lower bank of drawers with label holders
  smallThings(THREE, root, 2, y0 + 40.4, 4, W - 4, D - 8, r, 10);
  for (const y of [y0 + 53, y0 + 67]) {
    bx(root, W - 2, 0.6, D - 4, paint, 1, y, 1.5); bx(root, W - 2, 1.4, 0.4, paint, 1, y - 0.8, D - 2.9);
    smallThings(THREE, root, 2, y + 0.6, 4, W - 4, D - 8, r, 10);
  }
  bx(root, W - 2, 0.8, D - 3, paint, 1, y0 + 39.6, 1.5);
  const drawers = [];
  for (let i = 0; i < 6; i++) {
    const y = y0 + 1.6 + i * 6.3, dr = group(root);
    k.tray(dr, W - 5, 3.6, D - 5, tray, 2.5, y + 0.3, 1.5, 0.2);
    bx(dr, W - 4, 5.9, 0.6, paint, 2, y, D - 3.4);
    bx(dr, 3.6, 2, 0.15, plate, W / 2 - 1.8, y + 3.2, D - 2.8); bx(dr, 3, 1.4, 0.05, M.label, W / 2 - 1.5, y + 3.5, D - 2.62);
    bx(dr, 8, 0.7, 0.6, plate, W / 2 - 4, y + 1.2, D - 2.8);
    // specimen trays: shells, minerals, coins, points, bone
    smallThings(THREE, dr, 3, y + 0.5, 3, W - 7, D - 9, rng(40 + i), 3, true);
    dr.userData.onClick = () => { dr.userData.open = !dr.userData.open; tween(dr.position, 'z', dr.userData.open ? 20 : 0, 700, 'out'); };
    drawers.push(dr);
  }
  // full-height glass doors in wide white frames; a latch plate with a twist handle on each center stile
  let glass = true, open = false, moving = false, doors = [], levers = [];
  const hinge = group(root); hinge.userData.dyn = true;
  const toggle = async () => {
    if (moving) return; moving = true; open = !open;
    if (open) { await Promise.all(levers.map(l => tween(l.rotation, 'z', -Math.PI / 2, 320, 'out'))); await Promise.all(doors.map((d, n) => tween(d.rotation, 'y', n === 0 ? -1.95 : 1.95, 850))); }
    else { await Promise.all(doors.map(d => tween(d.rotation, 'y', 0, 800))); await Promise.all(levers.map(l => tween(l.rotation, 'z', 0, 320, 'out'))); }
    moving = false;
  };
  const makeDoors = () => {
    hinge.clear(); doors = []; levers = [];
    for (const side of [0, 1]) {
      const pv = group(hinge, side ? W - 0.4 : 0.4, y0 + 0.4, D), dw = W / 2 - 0.5, sx = side ? -dw : 0, dh = H - 0.8, st = 4.2;
      if (glass) {
        bx(pv, dw, st, 1.2, paint, sx, 0, -1.2); bx(pv, dw, st, 1.2, paint, sx, dh - st, -1.2);
        bx(pv, st, dh, 1.2, paint, sx, 0, -1.2); bx(pv, st, dh, 1.2, paint, sx + dw - st, 0, -1.2);
        bx(pv, dw - 2 * st, dh - 2 * st, 0.25, M.glass, sx + st, st, -0.7);
      } else bx(pv, dw, dh, 1.2, paint, sx, 0, -1.2);
      // latch plate on the meeting stile: label card up top, round twist handle below
      const px = side ? -dw + 0.6 : dw - 3.6;
      bx(pv, 3, 11, 0.25, plate, px, dh / 2 - 6, 0);
      bx(pv, 2.4, 3.2, 0.1, M.label, px + 0.3, dh / 2 + 1.2, 0.25);
      cyl(pv, 1.25, 0.35, plate, px + 1.5, dh / 2 - 2.8, 0.3, 28, 'z');
      const lv = group(pv, px + 1.5, dh / 2 - 2.8, 0.55);
      cyl(lv, 1, 0.25, M.dark, 0, 0, 0, 24, 'z'); bx(lv, 0.55, 2.1, 0.5, M.chrome, -0.275, -1.05, 0);
      lv.rotation.z = open ? -Math.PI / 2 : 0; lv.userData.dyn = true; levers.push(lv);
      if (open) pv.rotation.y = side ? 1.95 : -1.95;
      pv.userData.onClick = toggle;
      doors.push(pv);
    }
    hinge.traverse(o => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; } }); wake();
  };
  makeDoors();
  return {
    group: root, view: [0.75, 0.42, 1.35],
    finishes: [{ name: 'White', swatch: '#f1f2f0', color: 0xf1f2f0 }, { name: 'Light gray', swatch: '#d9dcd8', color: 0xd9dcd8 }, { name: 'Putty', swatch: '#d9cfbd', color: 0xd6ccb9 }], setFinish: k.finisher(paint),
    actions: [
      { label: 'Open doors', run: () => { toggle(); return open ? 'Close doors' : 'Open doors'; } },
      { label: 'Pull a drawer', run: async () => { if (!open) await toggle(); drawers[2].userData.onClick(); } },
      { label: 'Solid doors', run: () => { if (moving) return glass ? 'Solid doors' : 'Glass doors'; glass = !glass; makeDoors(); return glass ? 'Solid doors' : 'Glass doors'; } },
    ],
  };
});

/* ---------------- 10. art screens ---------------- */
def('art-screens', 'Sliding Art Screens', 'Two facing banks of 8 ft x 8 ft mesh screens, pulled into a center aisle', ({ THREE, tween }) => {
  const k = kit(THREE), { M, bx, cyl, group } = k, root = new THREE.Group();
  const white = k.std(0xf3f4f2, 0.45, 0.25), rail = k.std(0xdfe2e0, 0.4, 0.6), mesh = k.meshMat(96, 96, 2, '#c3c9cd', 0.85);
  const Ls = 96, H = 96, A = 104, n = 6, gap = 18, r = rng(9);
  // the two banks sit on staggered tracks so screens from either side can share the aisle
  const X = n * gap + 14, Z0 = -A / 2 - Ls, Z1 = A / 2 + Ls, top = H + 11;
  for (const z of [Z0, -A / 2, A / 2, Z1]) for (const x of [0, X]) bx(root, 2.5, top + 3, 2.5, white, x - 1.25, 0, z - 1.25);
  for (const z of [Z0, -A / 2, A / 2, Z1]) bx(root, X, 3, 2.5, white, 0, top, z - 1.25);
  for (const x of [0, X]) bx(root, 2.5, 3, Z1 - Z0, white, x - 1.25, top, Z0);
  const xs = bank => Array.from({ length: n }, (_, i) => 6 + i * gap + (bank > 0 ? gap / 2 : 0));
  for (const bank of [-1, 1]) for (const x of xs(bank)) bx(root, 2, 2, Z1 - Z0, rail, x - 1, top - 0.5, Z0);
  const art = ['#8c3b2f', '#2f4f6f', '#c9a227', '#3d6b4f', '#b56f4a', '#5e4a7a', '#d8cfc0', '#244a5a'].map(c => k.std(c, 0.8, 0));
  const gilt = k.std(0xa6832f, 0.35, 0.7);
  const screens = [];
  for (const bank of [-1, 1]) xs(bank).forEach(x0 => {
    const home = bank < 0 ? Z0 : A / 2, s = group(root, x0, 4, home);
    bx(s, 1.5, 1.5, Ls, white, -0.75, 0, 0); bx(s, 1.5, 1.5, Ls, white, -0.75, H - 1.5, 0);
    bx(s, 1.5, H, 1.5, white, -0.75, 0, 0); bx(s, 1.5, H, 1.5, white, -0.75, 0, Ls - 1.5); bx(s, 1.5, H, 1.2, white, -0.75, 0, Ls / 2 - 0.6);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(Ls - 3, H - 3), mesh); m.rotation.y = Math.PI / 2; m.position.set(0, H / 2, Ls / 2); s.add(m);
    bx(s, 3, top - H - 4.5, 4, white, -1.5, H, 8); bx(s, 3, top - H - 4.5, 4, white, -1.5, H, Ls - 12);
    for (const wz of [4, Ls - 4]) { bx(s, 2.6, 2.2, 2.4, white, -1.3, -1.4, wz - 1.2); cyl(s, 1.5, 1.4, M.dark, 0, -2.5, wz, 18, 'x'); }
    for (const face of [1, -1]) {
      let z = 5;
      while (z < Ls - 16) {
        if (Ls - 4 - z < 12) break;
        const { m: pm, fw, fh } = framed(THREE, r, Math.min(38, Ls - 4 - z)), y = 14 + r() * Math.max(0, H - fh - 24);
        bx(s, 1.6, fh, fw, r() > 0.5 ? gilt : M.woodDark, face > 0 ? 0.3 : -1.9, y, z);
        bx(s, 0.2, fh - 3, fw - 3, pm, face > 0 ? 1.9 : -2.1, y + 1.5, z + 1.5);
        z += fw + 4 + r() * 6;
      }
    }
    s.userData.onClick = () => { s.userData.out = !s.userData.out; tween(s.position, 'z', home + (s.userData.out ? -bank * (A - 8) : 0), 1300); };
    screens.push(s);
  });
  return { group: root, finishes: [{ name: 'White', swatch: '#f3f4f2', color: 0xf3f4f2 }, { name: 'Light gray', swatch: '#c3c7ca', color: 0xbfc4c7 }, { name: 'Black', swatch: '#2c2f31', color: 0x2c2f31 }], setFinish: k.finisher(white), view: [1.25, 0.8, 0.75], actions: [{ label: 'Pull out a screen', run: () => { screens[2].userData.onClick(); return screens[2].userData.out ? 'Slide it back' : 'Pull out a screen'; } }] };
});

/* ---------------- 11. pallet rack ---------------- */
function palletModel(id, name, dims0, start) {
def(id, name, dims0, ({ THREE, wake, bake, refit, lite }) => {
  const k = kit(THREE), { M, bx, group, many } = k, root = new THREE.Group();
  const up = k.std(0x1f4e8c, 0.45, 0.35), upP = k.postMat(up), beam = k.std(0xe3671c, 0.45, 0.35), galv = k.std(0xb9c0c4, 0.4, 0.7);
  const alu = k.std(0xd3d7da, 0.35, 0.85);
  const perfTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 32; const g = c.getContext('2d'); g.fillStyle = '#d3d7da'; g.fillRect(0, 0, 32, 32); g.fillStyle = '#6f777c'; for (const [x, y] of [[8, 8], [24, 8], [16, 20], [0, 20], [32, 20], [8, 32], [24, 32], [8, 0], [24, 0]]) { g.beginPath(); g.arc(x, y, 3, 0, Math.PI * 2); g.fill(); } const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; return t; })();
  const bays = 2, bw = 96, D = 42, H = 192, levels = [0, 60, 120];
  const LAYOUTS = ['Single run', 'Back to back', 'Two runs, one aisle'], DECKS = ['Wire decks', 'Solid aluminum decks', 'Perforated aluminum, 3 pieces', 'Pallet supports', 'Open beams'];
  let layout = 0, deckKind = 0, stopsOn = true, guardsOn = true, loadsOn = true, objects = false, unit;
  const st = start.state || {}; layout = st.layout ?? layout; deckKind = st.deckKind ?? deckKind; stopsOn = st.stopsOn ?? stopsOn; guardsOn = st.guardsOn ?? guardsOn; objects = !!st.objects;
  if (start.white) { up.color.setHex(0xf1f2f0); upP.color.setHex(0xf1f2f0); beam.color.setHex(0xf1f2f0); }
  const row = (z0, front, seed) => {
    const r = rng(seed), g = group(unit, 0, 0, z0), loads = [];
    for (let i = 0; i <= bays; i++) {
      const x = i * (bw + 3);
      for (const z of [0, D - 3]) bx(g, 3, H, 3, upP, x, 0, z);
      const f = group(g, x + 1.5, 0, 0);
      for (let y = 6, n = 0; y < H - 30; y += 36, n++) { const z1 = n % 2 ? 3 : D - 3, z2 = n % 2 ? D - 3 : 3; const b = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.4, Math.hypot(D - 6, 36)), up); b.position.set(0, y + 18, (z1 + z2) / 2); b.rotation.x = Math.atan2(z2 - z1, 36) * (n % 2 ? 1 : -1); f.add(b); }
      for (let y = 6; y < H; y += 36) bx(f, 1.4, 1.4, D - 6, up, -0.7, y, 3);
      bx(g, 7, 0.5, 7, M.steel, x - 2, 0, -2); bx(g, 7, 0.5, 7, M.steel, x - 2, 0, D - 5);
    }
    const back = front > 0 ? D - 1.8 : 0;
    for (let b = 0; b < bays; b++) {
      const x0 = b * (bw + 3) + 3;
      for (const y of levels) {
        if (y > 0) {
          bx(g, bw, 4.5, 1.8, beam, x0, y, 0); bx(g, bw, 4.5, 1.8, beam, x0, y, D - 1.8);
          if (deckKind === 0) { const dk = new THREE.Mesh(new THREE.PlaneGeometry(bw, D - 2), k.meshMat(bw, D, 2.5, '#b9c0c4')); dk.rotation.x = -Math.PI / 2; dk.position.set(x0 + bw / 2, y + 4.6, D / 2); g.add(dk); }
          else if (deckKind === 1) bx(g, bw, 0.25, D - 2, alu, x0, y + 4.5, 1);
          else if (deckKind === 2) for (let q = 0; q < 3; q++) { const pw = bw / 3 - 0.4, t = perfTex.clone(); t.needsUpdate = true; t.repeat.set(pw / 2, (D - 2) / 2); bx(g, pw, 0.25, D - 2, new THREE.MeshStandardMaterial({ map: t, roughness: 0.35, metalness: 0.8 }), x0 + q * (bw / 3) + 0.2, y + 4.5, 1); }
          else if (deckKind === 3) for (const px of [x0 + 8, x0 + 38, x0 + 54, x0 + 84]) bx(g, 3, 1.4, D - 2, galv, px, y + 3.2, 1);
          if (stopsOn) { bx(g, bw, 4, 1.2, beam, x0, y + 4.5, back); }
        } else if (stopsOn) bx(g, bw, 3, 2, beam, x0, 8, front > 0 ? D - 2.5 : 0.5);
        if (objects) { for (let p = 0; p < 3; p++) museumObjects(THREE, g, x0 + 2 + p * 31, y + (y ? 4.75 : 0), 2, 30, D - 4, r, 54); continue; }
        for (let p = 0; p < 2; p++) {
          const px = x0 + 3 + p * 46, py = y + (y ? 4.75 : 0);
          for (let q = 0; q < 3; q++) loads.push({ x: px, y: py, z: 1 + q * 18.5, w: 40, h: 5, d: 3.5, color: '#b08658' });
          loads.push({ x: px, y: py + 5, z: 1, w: 40, h: 0.8, d: 40, color: '#c49a6a' });
          const stack = y >= 120 ? 1 : 1 + Math.floor(r() * 2);
          for (let c = 0; c < stack; c++) for (let q = 0; q < 2; q++) if (r() > 0.1) loads.push({ x: px + 1 + q * 19.5, y: py + 5.8 + c * 20, z: 2, w: 18.5, h: 19, d: 36, color: KRAFT[Math.floor(r() * 4)] });
        }
      }
    }
    if (loadsOn && !objects) many(g, loads, M.kraft);
    if (guardsOn) {
      const yel = k.std(0xf2c230, 0.5, 0.2), blk = k.std(0x1a1a1a, 0.6, 0.1), fz = front > 0 ? D - 3.6 : -1;
      for (let i = 0; i <= bays; i++) { const x = i * (bw + 3); bx(g, 5, 18, 4.6, yel, x - 1, 0, fz); for (const y of [4, 11]) bx(g, 5.2, 2.4, 4.8, blk, x - 1.1, y, fz - 0.1); }
    }
    return g;
  };
  const make = () => {
    if (unit) root.remove(unit); objReset();
    unit = group(root); unit.userData.dyn = true;
    row(0, 1, 4);
    if (layout === 1) {
      // back to back: a second row behind, tied with row spacers
      const g2 = row(0, 1, 9); g2.rotation.y = Math.PI; g2.position.set(bays * (bw + 3) + 3, 0, -6);
      for (let i = 0; i <= bays; i++) for (const y of [48, 108, 168]) bx(unit, 1.6, 1.6, 6, up, i * (bw + 3) + 0.7, y, -6);
    } else if (layout === 2) {
      // second run across a forklift aisle, facing it
      const g2 = row(0, 1, 9); g2.rotation.y = Math.PI; g2.position.set(bays * (bw + 3) + 3, 0, 2 * D + 132);
    }
    if (guardsOn) {
      // end-of-aisle guards
      const yel = k.std(0xf2c230, 0.5, 0.2), endX = bays * (bw + 3) + 3, zA = layout === 1 ? -D - 9 : -3, zB = D - 1;
      for (const x of [-9, endX + 5]) { for (const z of [zA, zB]) bx(unit, 4, 16, 4, yel, x, 0, z); bx(unit, 3, 6, zB - zA + 4, yel, x + 0.5, 8, zA); }
    }
    unit.traverse(o => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; } });
    bake?.(unit); wake();
  };
  make();
  const re = () => { make(); refit?.(); };
  // warehouse racks default to blue frames and orange beams, museum racks to all white
  const FIN = [{ name: 'Blue and orange', swatch: 'linear-gradient(90deg,#1f4e8c 50%,#e3671c 50%)', up: 0x1f4e8c, beam: 0xe3671c }, { name: 'White and gray', swatch: 'linear-gradient(90deg,#f1f2f0 50%,#8f969a 50%)', up: 0xf1f2f0, beam: 0x8f969a }, { name: 'Green and orange', swatch: 'linear-gradient(90deg,#2f6b4f 50%,#e3671c 50%)', up: 0x2f6b4f, beam: 0xe3671c }, { name: 'Gray and yellow', swatch: 'linear-gradient(90deg,#6b7378 50%,#f2b705 50%)', up: 0x6b7378, beam: 0xf2b705 }, { name: 'All black', swatch: '#26292b', up: 0x26292b, beam: 0x26292b }, { name: 'All white', swatch: '#f1f2f0', up: 0xf1f2f0, beam: 0xf1f2f0 }];
  const paintRack = (f) => { up.color.setHex(f.up); upP.color.setHex(f.up); beam.color.setHex(f.beam); };
  return {
    group: root,
    finishes: start.white ? [FIN[5], ...FIN.slice(0, 5)] : FIN,
    setFinish: f => { up.color.setHex(f.up); upP.color.setHex(f.up); beam.color.setHex(f.beam); },
    presets: [
      { label: 'Warehouse', run: () => { layout = 2; deckKind = 0; stopsOn = true; guardsOn = true; loadsOn = true; objects = false; paintRack(FIN[0]); re(); } },
      { label: 'Museum, white with perforated decks', run: () => { layout = 1; deckKind = 2; stopsOn = false; guardsOn = false; loadsOn = true; objects = true; up.color.setHex(0xf1f2f0); upP.color.setHex(0xf1f2f0); beam.color.setHex(0xf1f2f0); re(); } },
    ],
    actions: [
      { label: 'Layout', options: LAYOUTS, get: () => layout, set: n => { layout = n; re(); } },
      { label: 'Decking', options: DECKS, get: () => deckKind, set: n => { deckKind = n; re(); } },
      { label: 'Pallet stops', toggle: true, get: () => stopsOn, set: v => { stopsOn = v; re(); } },
      { label: 'Post protectors', toggle: true, get: () => guardsOn, set: v => { guardsOn = v; re(); } },
      { label: 'Holds', when: () => !lite, options: ['Pallet loads', 'Museum objects'], get: () => (objects ? 1 : 0), set: n => { objects = n === 1; re(); } },
      { label: 'Loads', toggle: true, get: () => loadsOn, set: v => { loadsOn = v; re(); } },
    ],
  };
});
}
palletModel('pallet-rack', 'Selective Pallet Rack', '96" bays, 42" frames, 16 ft uprights: single run, back to back or two runs with an aisle; wire, aluminum or perforated decks', {});
palletModel('pallet-museum', 'Museum Object Rack, Stationary', 'White pallet rack, back to back, with 3-piece perforated aluminum decks holding sculpture and crated works', { white: true, state: { layout: 1, deckKind: 2, stopsOn: false, guardsOn: false, objects: true } });

/* ---------------- 12. mezzanine ---------------- */
def('mezzanine', 'Structural Steel Mezzanine', '20 ft x 16 ft platform, 9 ft clear, stair and handrail', ({ THREE, tween, wake }) => {
  const k = kit(THREE), { M, bx, bar, group } = k, root = new THREE.Group();
  const steel = k.std(0x4b5a63, 0.5, 0.5), rail = k.std(0xe0a526, 0.45, 0.35), W = 240, D = 192, H = 108;
  for (const x of [0, W / 2 - 2, W - 4]) for (const z of [0, D - 4]) { bx(root, 4, H, 4, steel, x, 0, z); bx(root, 10, 0.6, 10, M.steel, x - 3, 0, z - 3); }
  for (const z of [0, D - 5]) bx(root, W, 10, 5, steel, 0, H - 10, z);
  for (const x of [0, W / 2 - 2.5, W - 5]) bx(root, 5, 10, D, steel, x, H - 10, 0);
  bx(root, W, 1.5, D, k.std(0x5d6468, 0.8, 0.3), 0, H, 0);
  const railSide = (x1, z1, x2, z2, skip) => {
    const len = Math.hypot(x2 - x1, z2 - z1), g = group(root, x1, H + 1.5, z1); g.rotation.y = -Math.atan2(z2 - z1, x2 - x1);
    for (let p = 0; p <= len; p += 48) if (!skip || p < skip[0] || p > skip[1]) bx(g, 2, 42, 2, rail, Math.min(p, len - 2), 0, -1);
    const seg = (a, b) => { bx(g, b - a, 2, 2, rail, a, 40, -1); bx(g, b - a, 1.5, 1.5, rail, a, 21, -0.75); bx(g, b - a, 4, 0.3, rail, a, 0, -0.15); };
    if (skip) { seg(0, skip[0]); seg(skip[1], len); } else seg(0, len);
  };
  railSide(0, D, W, D, [W - 60, W - 18]); railSide(0, 0, W, 0); railSide(0, 0, 0, D); railSide(W, 0, W, D);
  const st = group(root, W - 58, 0, D);
  const steps = 13, rise = H / steps, run = 11;
  // stringers and rails run from the deck edge down to the floor along the stair
  const slope = (x, y0, w, t, m) => { const Ls = steps * run, len = Math.hypot(Ls, H), b = new THREE.Mesh(new THREE.BoxGeometry(w, t, len), m); b.position.set(x, y0 + H / 2, Ls / 2); b.rotation.x = Math.atan2(H, Ls); st.add(b); return b; };
  for (const x of [-0.75, 40.75]) slope(x, -5, 1.5, 10, steel);
  for (let i = 0; i < steps; i++) bx(st, 40, 1.2, run + 1, k.std(0x5d6468, 0.8, 0.3), 0, H - (i + 1) * rise, i * run);
  for (const x of [-1, 41]) { slope(x, 36, 1.6, 1.6, rail); slope(x, 18, 1.2, 1.2, rail); for (let i = 1; i < steps; i += 3) bx(st, 1.6, 37, 1.6, rail, x - 0.8, H - (i + 1) * rise, i * run + run / 2 - 0.8); }
  const under = group(root, 20, 0, 20); under.userData.dyn = true;
  shelving(k, under, { bays: 4, closed: false, shelves: 5, h: 84, contents: 'boxes', seed: 21 });
  shelving(k, under, { bays: 4, closed: false, shelves: 5, h: 84, contents: 'boxes', seed: 22, z: 70 });
  return { group: root, finishes: [{ name: 'Gray, yellow rail', swatch: 'linear-gradient(90deg,#4b5a63 50%,#e0a526 50%)', steel: 0x4b5a63, rail: 0xe0a526 }, { name: 'Blue, yellow rail', swatch: 'linear-gradient(90deg,#2a4d7a 50%,#e0a526 50%)', steel: 0x2a4d7a, rail: 0xe0a526 }, { name: 'Black, yellow rail', swatch: 'linear-gradient(90deg,#26292b 50%,#f2c230 50%)', steel: 0x26292b, rail: 0xf2c230 }, { name: 'All gray', swatch: '#6b7378', steel: 0x6b7378, rail: 0x6b7378 }], setFinish: f => { steel.color.setHex(f.steel); rail.color.setHex(f.rail); }, actions: [{ label: 'Hide shelving below', run: () => { under.visible = !under.visible; wake(); return under.visible ? 'Hide shelving below' : 'Show shelving below'; } }] };
});

/* ---------------- 13. vertical lift module ---------------- */
def('vlm', 'Vertical Lift Module (VLM)', 'About 10 ft W x 9 ft D, 15 ft H with one bay or 20 ft H serving two floors', ({ THREE, tween, wake, bake, panel, refit }) => {
  const k = kit(THREE), { M, bx, cyl, group, many } = k, root = new THREE.Group();
  const shell = k.std(0xf2f3f1, 0.4, 0.2), trim = k.std(0xd9dcda, 0.45, 0.3), itemMat = k.std(0xffffff, 0.45, 0.05);
  const lightM = k.std(0xfff6d5, 0.3, 0, { emissive: 0xfff2c4, emissiveIntensity: 0.9 });
  const laserM = new THREE.MeshBasicMaterial({ color: 0xff2a2a, transparent: true, opacity: 0.85, toneMapped: false }), curtainBeam = new THREE.MeshBasicMaterial({ color: 0xff3b3b, transparent: true, opacity: 0.28, depthWrite: false, toneMapped: false });
  const curtainM = k.std(0xc92a2a, 0.3, 0, { emissive: 0xc92a2a, emissiveIntensity: 0.9 }), ledM = k.std(0x39d353, 0.3, 0, { emissive: 0x39d353, emissiveIntensity: 1.2 }), band = k.std(0x4a5055, 0.5, 0.3);
  const tabletM = k.std(0x2a6f97, 0.2, 0.1, { emissive: 0x1b4f70, emissiveIntensity: 0.8 });
  const W = 118, D = 108, TW = W - 18, TD = 30, bayH = 22, trayX = 9, r = rng(8);
  const zRear = 4, zLift = zRear + TD + 4, zFront = zLift + TD + 4, zBay = D - TD - 1;
  const bins = ['#2f6fb3', '#c92a2a', '#e0a526', '#7a8288', '#2f9e44'];
  const fill = (list, x0, y, z, span) => { let x = x0 + 2; for (;;) { const bw = 6 + Math.floor(r() * 3) * 4; if (x + bw > x0 + span - 2) break; if (r() > 0.25) list.push({ x, y, z: z + 2, w: bw - 0.5, h: 2 + r() * 3.5, d: TD - 4, color: bins[Math.floor(r() * 5)] }); x += bw; } };
  // the monitor over the bay shows what the machine is doing
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 256; const cx = cv.getContext('2d');
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const screenM = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });
  const show = (big, line) => {
    cx.fillStyle = '#0c1a22'; cx.fillRect(0, 0, 512, 256); cx.fillStyle = '#0f7377'; cx.fillRect(0, 0, 512, 54);
    cx.fillStyle = '#fff'; cx.font = 'bold 28px system-ui, sans-serif'; cx.fillText('TRAY STATUS', 22, 37);
    cx.font = 'bold 92px system-ui, sans-serif'; cx.fillText(big, 22, 158);
    cx.fillStyle = '#9fd3d5'; cx.font = '28px system-ui, sans-serif'; cx.fillText(line, 22, 222);
    tex.needsUpdate = true; wake(); ui?.();
  };
  let H = 180, FY = 0, upper = 0, nBays = 1, unit, lift, trays = [], bays = [], pulleys = [], chain = Promise.resolve(), ui = null;
  const spin = (dy, ms) => pulleys.forEach(p => tween(p.rotation, 'x', p.rotation.x - dy / 3.2, ms));
  const liftTo = (y) => { const dy = y - 2 - lift.position.y, ms = 450 + Math.abs(dy) * 9; spin(dy, ms); return tween(lift.position, 'y', y - 2, ms); };
  const carry = (t, y) => { const ms = 450 + Math.abs(t.position.y - y) * 9; spin(y - 2 - lift.position.y, ms); return Promise.all([tween(lift.position, 'y', y - 2, ms), tween(t.position, 'y', y, ms)]); };
  const tag = t => `TRAY ${String(t.userData.n).padStart(2, '0')}`;
  const deliver = async (t) => {
    if (t.userData.at) return;
    let bay = bays.find(b => !b.tray);
    if (!bay) { bay = bays[0]; await store(bay.tray); }
    bay.tray = t; t.userData.at = bay;
    show(tag(t), `On its way to bay ${bays.indexOf(bay) + 1}`);
    await liftTo(t.userData.home.y);
    await tween(t.position, 'z', zLift, 650);
    await carry(t, bay.y);
    await tween(t.position, 'z', zBay, 750, 'out');
    const items = t.userData.items || [], it = items[Math.floor(Math.random() * items.length)];
    if (it) {
      const px = it.x + it.w / 2, pz = zBay + it.z + it.d / 2, py = bay.y + it.y + it.h, lz = bay.laser;
      lz.beam.scale.y = lz.top - py; lz.beam.position.set(px, (lz.top + py) / 2, pz); lz.dot.position.set(px, py + 0.03, pz); lz.g.visible = true;
      bay.seg.position.x = px; bay.seg.visible = true;
    }
    wake();
    show(tag(t), `Ready at bay ${bays.indexOf(bay) + 1}`); ui?.();
  };
  const store = async (t) => {
    const bay = t.userData.at; if (!bay) return; ui?.();
    bay.seg.visible = false; bay.laser.g.visible = false; show(tag(t), 'Returning to storage');
    await liftTo(bay.y);
    await tween(t.position, 'z', zLift, 650);
    await carry(t, t.userData.home.y);
    await tween(t.position, 'z', t.userData.home.z, 650);
    bay.tray = null; t.userData.at = null;
    const next = bays.find(b => b.tray); show(next ? tag(next.tray) : 'READY', next ? `Ready at bay ${bays.indexOf(next) + 1}` : 'Tap any tray to call it');
  };
  // one lift, so requests queue up and run in order
  const request = (t) => {
    if (t.userData.busy) return; t.userData.busy = true;
    chain = chain.then(() => (t.userData.at ? store(t) : deliver(t))).catch(() => {}).then(() => { t.userData.busy = false; ui?.(); });
    ui?.();
  };
  const make = () => {
    if (unit) root.remove(unit);
    unit = group(root); unit.userData.dyn = true; trays = []; chain = Promise.resolve();
    // a second bay serves the floor above: taller machine, a floor slab around it, its own work zone and terminal
    H = nBays === 1 ? 180 : 240; FY = nBays === 1 ? 0 : 120;
    const bayYs = nBays === 1 ? [34] : [34, FY + 34], topOpen = bayYs[bayYs.length - 1] + bayH;
    bays = bayYs.map(y => ({ y, tray: null }));
    // white cabinet, glass on the right side so the lift is visible
    bx(unit, W, 3, D, trim, 0, 0, 0);
    bx(unit, W, H - 3, 1, shell, 0, 3, 0); bx(unit, W, 2, D, shell, 0, H - 2, 0); bx(unit, 1, H - 3, D, shell, 0, 3, 0);
    bx(unit, 1, H - 3, D, M.glass, W - 1, 3, 0);
    for (const z of [0, zLift - 2, zFront - 2, D - 3]) bx(unit, 1.4, H - 3, 3, trim, W - 1.2, 3, z);
    for (const y of [3, H - 5]) bx(unit, 1.4, 3, D, trim, W - 1.2, y, 0);
    // front: a wide lit bay at each opening
    let y0 = 3;
    for (const y of bayYs) {
      bx(unit, W, y - 1.2 - y0, 1, shell, 0, y0, D - 1);
      bx(unit, W - 12, 0.8, 16, trim, 6, y - 1.2, D - 16);
      bx(unit, 6, bayH + 1.2, 16, shell, 0, y - 1.2, D - 16); bx(unit, 6, bayH + 1.2, 16, shell, W - 6, y - 1.2, D - 16);
      bx(unit, W, 3, 16, shell, 0, y + bayH, D - 16);
      bx(unit, W - 12, 0.6, 1, lightM, 6, y + bayH - 0.8, D - 14);
      // safety light curtain at the bay sides, LED bar that points at the pick location
      for (const x of [6.2, W - 7.8]) { bx(unit, 1.6, bayH, 1.4, M.dark, x, y - 0.4, D - 2.4); for (let q = 2; q < bayH; q += 3) bx(unit, 0.3, 0.4, 0.2, curtainM, x + (x < W / 2 ? 1.6 : -0.3), y + q, D - 1.8); }
      bx(unit, W - 16, 1.4, 0.6, M.black, 8, y + bayH + 0.8, D);
      const seg = bx(unit, 9, 1, 0.3, ledM, 8, y + bayH + 1, D + 0.55); seg.visible = false; seg.userData.dyn = true;
      bays[bayYs.indexOf(y)].seg = seg;
      // pick laser from the header down to the item, and the light curtain beams across the opening
      const laser = group(unit); laser.userData.dyn = true; laser.visible = false;
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1, 8), laserM); laser.add(beam);
      const dot = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.05, 20), laserM); laser.add(dot); beam.userData.dyn = dot.userData.dyn = true; beam.userData.noShadow = dot.userData.noShadow = true;
      bays[bayYs.indexOf(y)].laser = { g: laser, beam, dot, top: y + bayH - 0.4 };
      for (let q = 2; q < bayH; q += 3) bx(unit, W - 15.6, 0.12, 0.12, curtainBeam, 7.8, y + q + 0.14, D - 1.75);
      y0 = y + bayH + 3;
    }
    bx(unit, W, H - y0, 1, shell, 0, y0, D - 1);
    // taped work zone on the floor in front of the machine
    { const c = document.createElement('canvas'); c.width = 64; c.height = 16; const g2 = c.getContext('2d'); g2.fillStyle = '#f2c230'; g2.fillRect(0, 0, 64, 16); g2.fillStyle = '#1b1b1b'; for (let q = -16; q < 64; q += 16) { g2.beginPath(); g2.moveTo(q, 16); g2.lineTo(q + 8, 16); g2.lineTo(q + 16, 0); g2.lineTo(q + 8, 0); g2.closePath(); g2.fill(); }
      const tx = (len) => { const t2 = new THREE.CanvasTexture(c); t2.colorSpace = THREE.SRGBColorSpace; t2.wrapS = THREE.RepeatWrapping; t2.repeat.set(len / 12, 1); return new THREE.MeshStandardMaterial({ map: t2, roughness: 0.6 }); };
      const zx0 = -4, zx1 = W + 24, zz0 = D + 3, zz1 = D + 54, tw = 3;
      for (const fy of nBays === 1 ? [0] : [0, FY]) {
        const strip = (len, x, z, rot) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(len, tw), tx(len)); m.rotation.set(-Math.PI / 2, 0, rot); m.position.set(x, fy + 0.03, z); m.userData.noShadow = true; unit.add(m); };
        strip(zx1 - zx0, (zx0 + zx1) / 2, zz0 + tw / 2, 0); strip(zx1 - zx0, (zx0 + zx1) / 2, zz1 - tw / 2, 0);
        strip(zz1 - zz0, zx0 + tw / 2, (zz0 + zz1) / 2, Math.PI / 2); strip(zz1 - zz0, zx1 - tw / 2, (zz0 + zz1) / 2, Math.PI / 2);
      }
      if (nBays === 2) {
        // upper floor slab with an opening the machine passes through, and a guard rail at the slab edge
        const slab = upper ? k.std(0x5d6468, 0.75, 0.4) : k.std(0xb9bcbc, 0.9, 0), rail = k.std(0xe0a526, 0.45, 0.35), ex = 40, fz = 76, th = upper ? 2 : 6;
        bx(unit, W + 2 * ex, th, fz, slab, -ex, FY - th, D); bx(unit, ex, th, D + 20, slab, -ex, FY - th, -20); bx(unit, ex, th, D + 20, slab, W, FY - th, -20); bx(unit, W, th, 20, slab, 0, FY - th, -20);
        if (upper) {
          // steel mezzanine: columns, a beam under every deck edge, a stair down on the left
          const steel = k.std(0x4b5a63, 0.5, 0.5);
          for (const cx of [-ex, -2, W - 3, W + ex - 5]) for (const cz of [-20, D + fz - 5]) { bx(unit, 5, FY - th, 5, steel, cx, 0, cz); bx(unit, 11, 0.6, 11, M.steel, cx - 3, 0, cz - 3); }
          for (const cz of [-20, D + fz - 5]) bx(unit, W + 2 * ex, 8, 5, steel, -ex, FY - th - 8, cz);
          for (const cx of [-ex, W + ex - 5]) bx(unit, 5, 8, D + fz + 20, steel, cx, FY - th - 8, -20);
          const steps = Math.ceil(FY / 7.5), rise = FY / steps, run = 11, sz = D + 20;
          for (let q = 0; q < steps; q++) bx(unit, run + 1, 1.2, 36, slab, -ex - (q + 1) * run, FY - (q + 1) * rise, sz);
          for (const zz of [sz - 0.8, sz + 36.8]) { k.bar(unit, -ex, FY - 4, -ex - steps * run, -4, zz, 9, steel, 1.5); k.bar(unit, -ex, FY + 36, -ex - steps * run, 36, zz, 1.6, rail, 1.6); }
        }
        for (let x = -ex + 1; x <= W + ex - 1; x += 32) bx(unit, 1.6, 42, 1.6, rail, x - 0.8, FY, D + fz - 1.6);
        bx(unit, W + 2 * ex, 1.6, 1.6, rail, -ex, FY + 40.4, D + fz - 1.6); bx(unit, W + 2 * ex, 1.2, 1.2, rail, -ex, FY + 21, D + fz - 1.4);
      } }
    bx(unit, W, 12, 1.2, band, 0, H - 14, D - 0.6); bx(unit, W, 3, 1.2, band, 0, 3, D - 0.6);
    // monitor centered over the top bay
    for (const by of bayYs) { bx(unit, 28, 15, 1.2, M.black, W / 2 - 14, by + bayH + 8, D); const scr = new THREE.Mesh(new THREE.PlaneGeometry(26, 13), screenM); scr.position.set(W / 2, by + bayH + 15.5, D + 1.25); unit.add(scr); }
    // operator console on an arm off the right side of the bay
    for (const by of bayYs) {
      const arm = group(unit, W - 3, by + 14, D - 2);
      bx(arm, 12, 1.6, 1.6, M.dark, 0, 0, 0); bx(arm, 1.6, 1.6, 8, M.dark, 10.4, 0, 0);
      const tab = group(arm, 11.2, 1.6, 8); tab.rotation.x = -0.45; tab.userData.onClick = () => openConsole(); tab.userData.dyn = true;
      bx(tab, 14, 10, 1.2, M.black, -7, 0, -0.6); bx(tab, 12.4, 8.4, 0.2, tabletM, -6.2, 0.8, 0.62);
    }
    // tray columns: rear runs full height, front starts above the top bay; the lift rides between them
    const levels = []; for (let y = 10; y < H - 14; y += 8.5) levels.push(y);
    const mk = (y, z) => {
      const t = group(unit, 0, y, z);
      bx(t, TW, 0.8, TD, M.steel, trayX, 0, 0); bx(t, TW, 2.4, 0.6, M.steel, trayX, 0, TD - 0.6); bx(t, TW, 2.4, 0.6, M.steel, trayX, 0, 0); bx(t, 0.6, 2.4, TD, M.steel, trayX, 0, 0); bx(t, 0.6, 2.4, TD, M.steel, trayX + TW - 0.6, 0, 0);
      const it = []; fill(it, trayX, 0.8, 0, TW); many(t, it, itemMat); t.userData.items = it;
      t.userData.home = { y, z }; t.userData.n = trays.length + 1; t.userData.at = null; t.userData.busy = false;
      t.userData.onClick = () => request(t);
      trays.push(t);
    };
    for (const y of levels) { mk(y, zRear); if (!bayYs.some(by => y > by - 12 && y < by + bayH + 12)) mk(y, zFront); }
    for (const z of [zRear, zRear + TD, zFront, zFront + TD]) for (const x of [trayX - 2, trayX + TW]) bx(unit, 2, H - 8, 1.5, trim, x, 3, z - 0.75);
    // lift drive: a toothed belt each side over top and bottom pulleys, a cross shaft and gear motor up top
    pulleys = [];
    const zc = zLift + TD / 2, pr = 3.2, beltM = k.std(0x151617, 0.8, 0);
    for (const x of [3.5, W - 3.5]) {
      for (const py of [8, H - 12]) {
        const pg = group(unit, x, py, zc); pg.userData.dyn = true;
        cyl(pg, pr, 1.6, M.steel, 0, 0, 0, 24, 'x'); cyl(pg, 1, 1.9, M.dark, 0, 0, 0, 12, 'x');
        for (let q = 0; q < 3; q++) { const sp = bx(null, 1.7, 0.5, pr * 2 - 0.8, M.dark); sp.position.set(0, 0, 0); sp.rotation.x = (q * Math.PI) / 3; pg.add(sp); }
        pulleys.push(pg);
      }
      for (const dz of [-pr, pr]) bx(unit, 1.4, H - 20, 0.35, beltM, x - 0.7, 8, zc + dz - 0.175);
      bx(unit, 1, H - 8, 2.2, M.steel, x < W / 2 ? 0.8 : W - 1.8, 3, zc - 8);
    }
    cyl(unit, 0.8, W - 7, M.steel, W / 2, H - 12, zc, 12, 'x');
    bx(unit, 8, 7, 9, k.std(0x2f5f8a, 0.5, 0.4), W - 16, H - 15.5, zc - 4.5); cyl(unit, 2.6, 6, k.std(0x2f5f8a, 0.5, 0.4), W - 12, H - 5, zc, 18);
    lift = group(unit, 0, bayYs[0] - 2, zLift); lift.userData.dyn = true;
    bx(lift, W - 11, 1.6, TD + 2, M.dark, 5.5, -0.2, -1);
    for (const x of [5.5, W - 8.5]) bx(lift, 3, 6, TD + 2, M.dark, x, -0.2, -1);
    for (const x of [2.4, W - 6.4]) bx(lift, 4, 3, 2.4, M.dark, x, -0.6, TD / 2 + 3.2 - 1.2);
    unit.traverse(o => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; } });
    bake?.(unit);
    show('READY', 'Tap any tray to call it');
  };
  // operator console: a small docked panel with three screens (home, picking, trays), big buttons, plain words
  const PARTS = [
    ['BRG-6204', 'Ball bearing, 20 mm bore'], ['FLT-1180', 'Hydraulic return filter'], ['ORG-0212', 'O-ring kit, nitrile'], ['FUS-30A', 'Cartridge fuse, 30 A'],
    ['BLT-A42', 'V-belt, A42'], ['SNS-PX12', 'Proximity sensor, 12 mm'], ['GSK-DN50', 'Flange gasket, DN50'], ['SCR-M6-20', 'Cap screws M6 x 20, box of 100'],
    ['CLP-9150', 'Bumper clip'], ['VLV-0340', 'Ball valve, 3/4 in'], ['RLY-24V', 'Relay, 24 VDC'], ['FIT-1212', 'Push fitting, 12 mm'],
  ];
  const MAPC = { '#2f6fb3': '#c9d23a', '#c92a2a': '#e0262b', '#e0a526': '#f2e529', '#7a8288': '#8e8e8e', '#2f9e44': '#9ccc3c' };
  const cr = rng(77);
  let view = 'home', list = null, line = 0;
  const pad = n => String(n).padStart(2, '0'), trayN = n => trays.find(t => t.userData.n === n);
  const newList = () => { const pick = [...trays].sort(() => cr() - 0.5).slice(0, 3).sort((a, b) => a.userData.n - b.userData.n); return pick.map((t, i) => { const items = t.userData.items || [], p = PARTS[(t.userData.n + i) % PARTS.length]; return { tray: t.userData.n, k: Math.floor(cr() * items.length), pn: p[0], d: p[1], qty: 1 + Math.floor(cr() * 6), done: false }; }); };
  const aim = (t, k) => { const bay = t.userData.at, it = (t.userData.items || [])[k]; if (!bay || !it || t.userData.busy) return; const px = it.x + it.w / 2, pz = zBay + it.z + it.d / 2, py = bay.y + it.y + it.h, lz = bay.laser; lz.beam.scale.y = lz.top - py; lz.beam.position.set(px, (lz.top + py) / 2, pz); lz.dot.position.set(px, py + 0.03, pz); lz.g.visible = true; bay.seg.position.x = px; bay.seg.visible = true; wake(); };
  const trayMap = (t, k) => '<div class="cp-map">' + (t.userData.items || []).map((it, i) => '<i style="left:' + (((it.x - trayX) / TW) * 100).toFixed(1) + '%;top:' + ((1 - (it.z + it.d) / TD) * 100).toFixed(1) + '%;width:' + ((it.w / TW) * 100).toFixed(1) + '%;height:' + ((it.d / TD) * 100).toFixed(1) + '%;background:' + (i === k ? '#1f3fb0' : MAPC[it.color] || '#d9d9d9') + '"' + (i === k ? ' class="on"' : '') + '></i>').join('') + '</div>';
  const status = () => { const at = bays.map((b, i) => (bays.length > 1 ? 'Bay ' + (i + 1) + ': ' : 'Bay: ') + (b.tray ? 'tray ' + pad(b.tray.userData.n) : 'empty')).join(' &middot; '); return (trays.some(t => t.userData.busy) ? '<b class="mv">Moving</b> ' : '<b>Ready</b> ') + at; };
  const screen = () => {
    const top = '<div class="cp-hd"><span>' + (view === 'pick' ? 'Picking' : view === 'trays' ? 'Call a tray' : 'Operator console') + '</span>' + (view !== 'home' ? '<button data-act="home">Back</button>' : '') + '</div><div class="cp-st">' + status() + '</div>';
    if (view === 'home') return top + '<div class="cp-body"><button class="cp-big or" data-act="start">Start a pick list</button><button class="cp-big" data-act="trays">Call a tray</button><button class="cp-link" data-act="retall">Return all trays</button></div>';
    if (view === 'trays') return top + '<div class="cp-body"><div class="cp-grid">' + trays.map(t => '<button data-act="callt" data-v="' + t.userData.n + '" class="' + (t.userData.busy ? 'mv' : t.userData.at ? 'at' : '') + '">' + pad(t.userData.n) + '</button>').join('') + '</div><p class="cp-tip">Tap a tray to bring it to the bay. Tap a green one to send it back.</p></div>';
    const ln = list[line], t = trayN(ln.tray), here = t && t.userData.at && !t.userData.busy, left = list.filter(x => !x.done).length;
    if (!left) return top + '<div class="cp-body"><p class="cp-done">List complete</p><button class="cp-big or" data-act="finish">Return trays and finish</button></div>';
    if (here) aim(t, ln.k);
    return top + '<div class="cp-body"><div class="cp-line">Line ' + (list.indexOf(ln) + 1) + ' of ' + list.length + ' &middot; tray ' + pad(ln.tray) + '</div>'
      + '<div class="cp-item"><b>' + ln.pn + '</b><span>' + ln.d + '</span></div>'
      + '<div class="cp-qty">Pick <b>' + ln.qty + '</b></div>'
      + (here ? trayMap(t, ln.k) + '<p class="cp-tip">Follow the laser to the lit compartment.</p><button class="cp-big or" data-act="ok">Confirm pick</button>' : '<div class="cp-wait">Tray ' + pad(ln.tray) + ' is on its way to the bay...</div>')
      + '<button class="cp-link" data-act="skip">Skip this line</button></div>';
  };
  const next = () => { const L = list, cur = L[line]; cur.done = true; const nx = L.findIndex(x => !x.done); if (nx < 0) return; const t0 = trayN(cur.tray), t1 = trayN(L[nx].tray); line = nx; if (t1 !== t0 && t0?.userData.at) request(t0); if (t1 && !t1.userData.at) request(t1); };
  const openConsole = () => panel?.((el) => {
    el.classList.add('cp');
    const draw = () => { el.innerHTML = screen(); };
    ui = draw; draw();
    el.addEventListener('click', e => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      const a = b.dataset.act;
      if (a === 'home') view = 'home';
      else if (a === 'trays') view = 'trays';
      else if (a === 'start') { list = newList(); line = 0; view = 'pick'; const t = trayN(list[0].tray); if (t && !t.userData.at) request(t); }
      else if (a === 'ok') next();
      else if (a === 'skip') { const nx = list.findIndex((x, i) => !x.done && i > line); if (nx >= 0) { const t0 = trayN(list[line].tray), t1 = trayN(list[nx].tray); line = nx; if (t1 !== t0 && t0?.userData.at) request(t0); if (t1 && !t1.userData.at) request(t1); } }
      else if (a === 'finish' || a === 'retall') { bays.forEach(bb => bb.tray && request(bb.tray)); if (a === 'finish') view = 'home'; }
      else if (a === 'callt') { const t = trayN(+b.dataset.v); if (t) request(t); }
      draw();
    });
    return () => { ui = null; };
  });
  make();
  const idle = () => !trays.some(t => t.userData.busy);
  return {
    group: root, prompt: 'Tap any tray to call it, or the terminal to run a pick list',
    walk: () => ({ eye: [W / 2 - 6, 64, D + 44], look: [W / 2, 42, D - 6], x: [-30, W + 30], z: [D + 16, D + 90], floor: 0 }), finishes: [{ name: 'White', swatch: '#f2f3f1', color: 0xf2f3f1 }, { name: 'Light gray', swatch: '#c9cdcf', color: 0xc9cdcf }, { name: 'Dark gray', swatch: '#4a5055', color: 0x4a5055 }], setFinish: k.finisher(shell), view: [1.25, 0.5, 0.95],
    actions: [
      { label: 'Open the operator console', run: () => { openConsole(); } },
      { label: 'Call a tray', run: () => { const free = trays.filter(t => !t.userData.at && !t.userData.busy); if (free.length) request(free[Math.floor(Math.random() * free.length)]); } },
      { label: 'Return all trays', run: () => { bays.forEach(b => b.tray && request(b.tray)); } },
      { label: 'Second bay on the floor above', toggle: true, get: () => nBays === 2, set: v => { if (idle()) { nBays = v ? 2 : 1; make(); refit?.(); } } },
      { label: 'Upper level', when: () => nBays === 2, options: ['Floor slab', 'Steel mezzanine'], get: () => upper, set: n => { if (idle()) { upper = n; make(); refit?.(); } } },
    ],
  };
});

/* ---------------- 14. lab casework ---------------- */
def('casework', 'Modular Lab Casework', '10 ft bench, 30" deep, epoxy top, reagent shelf', ({ THREE, tween }) => {
  const k = kit(THREE), { M, bx, cyl, group } = k, root = new THREE.Group();
  const face = k.std(0xeeefed, 0.5, 0.1), W = 120, D = 30, H = 36, toe = 4;
  bx(root, W, toe, D - 3, M.dark, 0, 0, 0);
  bx(root, W, H - toe - 1.25, D - 1, k.std(0xd8dad8, 0.6, 0.1), 0, toe, 0);
  bx(root, W + 1, 1.25, D + 1, k.std(0x1b1d1f, 0.25, 0.1), -0.5, H - 1.25, -0.5);
  const movers = [];
  for (let c = 0; c < 4; c++) {
    const x0 = c * 30 + 0.3, cw = 29.4;
    if (c % 2 === 0) {
      for (let i = 0; i < 4; i++) { const dr = group(root); const y = toe + 0.3 + i * 7.6; bx(dr, cw, 7.2, 0.8, face, x0, y, D - 1); k.tray(dr, cw - 2, 6, D - 7, k.std(0xd0d3d3, 0.5, 0.2), x0 + 1, y + 0.4, 5, 0.25); bx(dr, 5, 0.6, 0.9, M.chrome, x0 + cw / 2 - 2.5, y + 5.2, D - 0.2); dr.userData.onClick = () => { dr.userData.open = !dr.userData.open; tween(dr.position, 'z', dr.userData.open ? 16 : 0, 600, 'out'); }; movers.push(dr); }
    } else {
      const dr = group(root); const y = toe + 0.3 + 3 * 7.6; bx(dr, cw, 7.2, 0.8, face, x0, y, D - 1); k.tray(dr, cw - 2, 5.6, D - 7, k.std(0xd0d3d3, 0.5, 0.2), x0 + 1, y + 0.4, 5, 0.25); bx(dr, 5, 0.6, 0.9, M.chrome, x0 + cw / 2 - 2.5, y + 5.2, D - 0.2); dr.userData.onClick = () => { dr.userData.open = !dr.userData.open; tween(dr.position, 'z', dr.userData.open ? 16 : 0, 600, 'out'); }; movers.push(dr);
      for (const s of [0, 1]) { const pv = group(root, s ? x0 + cw : x0, toe + 0.3, D); bx(pv, cw / 2 - 0.2, 22.3, 0.8, face, s ? -(cw / 2 - 0.2) : 0, 0, -1); bx(pv, 0.6, 5, 0.9, M.chrome, s ? -3 : cw / 2 - 3, 14, -0.2); pv.userData.onClick = () => { pv.userData.open = !pv.userData.open; tween(pv.rotation, 'y', pv.userData.open ? (s ? 1.7 : -1.7) : 0, 600); }; movers.push(pv); }
    }
  }
  for (const x of [2, W / 2 - 1, W - 4]) bx(root, 2, 30, 2, M.steel, x, H, 4);
  for (const y of [H + 14, H + 28]) { bx(root, W - 2, 0.6, 10, M.steel, 1, y, 1); }
  const bottles = []; const r = rng(2); for (let x = 6; x < W - 8; x += 4 + r() * 3) { if (r() > 0.3) bottles.push({ x, y: H + 14.6, z: 3, w: 2.6, h: 5 + r() * 4, d: 2.6, color: ['#8a5a2b', '#d9e8ef', '#5a7a2b', '#e9e2cf'][Math.floor(r() * 4)] }); }
  k.many(root, bottles, k.std(0xffffff, 0.2, 0.05));
  const fau = group(root, W - 20, H, 6); cyl(fau, 0.7, 14, M.chrome, 0, 7, 0); const arm = cyl(fau, 0.6, 9, M.chrome, 0, 14, 4.2, 12, 'z');
  return {
    group: root, finishes: [{ name: 'White laminate', swatch: '#f1f2f0', color: 0xeeefed }, { name: 'Maple laminate', swatch: '#c79a66', color: 0xc79a66 }, { name: 'Light gray', swatch: '#c3c7ca', color: 0xbfc4c7 }, { name: 'O\'Brien teal', swatch: '#0f7377', color: 0x0f7377 }],
    setFinish: k.finisher(face),
    actions: [{ label: 'Open drawers & doors', run: () => { const o = !movers[0].userData.open; movers.forEach(m => { if (!!m.userData.open !== o) m.userData.onClick(); }); return o ? 'Close them' : 'Open drawers & doors'; } }],
  };
});

/* ---------------- 15. wire partition cage ---------------- */
def('wire-cage', 'Wire Partition Enclosure', 'Welded wire cages from 10 x 8 ft up: hinged door, service window with shelf, gear hooks', ({ THREE, tween, wake, bake, refit }) => {
  const k = kit(THREE), { M, bx, group } = k, root = new THREE.Group();
  const frame = k.std(0x6b7378, 0.45, 0.6), H = 96, team = k.std(0x8c1d2c, 0.4, 0.1), bag = k.std(0x2a2d31, 0.8, 0.05), jersey = k.std(0xf2f2ee, 0.85, 0);
  const SIZES = [{ W: 120, D: 96, label: 'Size: 10 x 8 ft' }, { W: 240, D: 120, label: 'Size: 20 x 10 ft' }];
  let si = 0, win = false, hooks = false, unit, door, sash;
  const panel = (parent, w, x, z, rotY, y0 = 0, ph = H) => {
    const g = group(parent, x, y0, z); g.rotation.y = rotY;
    bx(g, w, 1.2, 1.2, frame, 0, 0, -0.6); bx(g, w, 1.2, 1.2, frame, 0, ph - 1.2, -0.6);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w - 1, ph - 2.4), k.meshMat(w, ph, 2)); m.position.set(w / 2, ph / 2, 0); g.add(m);
    return g;
  };
  // walls are made of panels no wider than 60"
  const run = (parent, len, x, z, rotY) => { const n = Math.ceil(len / 60), pw = len / n; for (let i = 0; i < n; i++) { const dx = Math.cos(rotY) * pw * i, dz = -Math.sin(rotY) * pw * i; panel(parent, pw, x + dx, z + dz, rotY); if (i) bx(parent, 2, H, 2, frame, x + dx - 1, 0, z + dz - 1); } };
  const make = () => {
    if (unit) root.remove(unit);
    const { W, D } = SIZES[si];
    unit = group(root); unit.userData.dyn = true;
    for (const [x, z] of [[0, 0], [W, 0], [0, D], [W, D]]) bx(unit, 2, H, 2, frame, x - 1, 0, z - 1);
    run(unit, W, 0, 0, 0); run(unit, D, 0, 0, -Math.PI / 2); run(unit, D, W, 0, -Math.PI / 2);
    // front: wall, optional service window with a shelf, then the door
    const dx = W - 44, wx = dx - 60;
    bx(unit, 2, H, 2, frame, dx - 3, 0, D - 1);
    if (win) {
      run(unit, wx, 0, D, 0); bx(unit, 2, H, 2, frame, wx - 1, 0, D - 1); bx(unit, 2, H, 2, frame, wx + 55, 0, D - 1);
      panel(unit, 54, wx + 1, D, 0, 0, 36); panel(unit, 54, wx + 1, D, 0, 72, H - 72);
      bx(unit, 54, 1.2, 14, k.std(0x9aa1a6, 0.35, 0.8), wx + 1, 35, D - 2);
      for (const bxx of [wx + 6, wx + 48]) k.bar(unit, bxx, 26, bxx, 35, D + 6, 0.8, frame, 1);
      sash = panel(unit, 52, wx + 2, D + 1.4, 0, 36, 36); sash.userData.onClick = () => { sash.userData.up = !sash.userData.up; tween(sash.position, 'y', sash.userData.up ? 64 : 36, 800, 'out'); }; sash.userData.dyn = true;
      if (dx - 3 - (wx + 56) > 2) run(unit, dx - 3 - (wx + 56), wx + 56, D, 0);
    } else { sash = null; run(unit, dx - 2, 0, D, 0); }
    door = group(unit, dx, 0, D);
    bx(door, 42, 1.2, 1.2, frame, 0, 0, -0.6); bx(door, 42, 1.2, 1.2, frame, 0, H - 1.2, -0.6); bx(door, 1.2, H, 1.2, frame, 40.8, 0, -0.6);
    const dm = new THREE.Mesh(new THREE.PlaneGeometry(40, H - 2.4), k.meshMat(42, H, 2)); dm.position.set(21, H / 2, 0); door.add(dm);
    bx(door, 3, 5, 1.8, M.chrome, 37, 42, 0);
    door.userData.onClick = () => { door.userData.open = !door.userData.open; tween(door.rotation, 'y', door.userData.open ? 1.6 : 0, 700, 'out'); };
    shelving(k, unit, { bays: 2, closed: false, shelves: 5, h: 84, d: 24, contents: 'boxes', seed: 14, x: 10, z: 4 });
    if (W > 150) shelving(k, unit, { bays: 3, closed: false, shelves: 5, h: 84, d: 24, contents: 'boxes', seed: 15, x: 96, z: 4 });
    if (hooks) {
      // gear hooks along the left wall: helmets, bags and jerseys
      for (let z = 34, i = 0; z < D - 10; z += 12, i++) {
        bx(unit, 3, 0.5, 0.5, M.chrome, 0.8, 62, z); bx(unit, 0.5, 1.4, 0.5, M.chrome, 3.3, 61, z);
        if (i % 3 === 0) unit.add(footballHelmet(THREE, team, 6, 54, z + 0.25, Math.PI / 2));
        else if (i % 3 === 1) bx(unit, 7, 16, 9, bag, 2.5, 42, z - 4.25);
        else bx(unit, 1, 24, 16, jersey, 3, 36, z - 7.75);
      }
      for (let x = W - (W > 150 ? 20 : 30); x > (W > 150 ? 210 : 86); x -= 12) { bx(unit, 0.5, 0.5, 3, M.chrome, x, 62, 0.8); bx(unit, 0.5, 1.4, 0.5, M.chrome, x, 61, 3.3); bx(unit, 7, 16, 9, bag, x - 3.25, 42, 2.5); }
    }
    unit.traverse(q => { if (q.isMesh) { q.castShadow = q.receiveShadow = true; } });
    bake?.(unit); wake();
  };
  make();
  return {
    group: root, finishes: [{ name: 'Gray', swatch: '#6b7378', color: 0x6b7378 }, { name: 'Black', swatch: '#26292b', color: 0x26292b }, { name: 'Safety yellow', swatch: '#e0a526', color: 0xe0a526 }], setFinish: k.finisher(frame),
    actions: [
      { label: 'Open the door', run: () => { door.userData.onClick(); return door.userData.open ? 'Close the door' : 'Open the door'; } },
      { label: SIZES[0].label, run: () => { si = (si + 1) % SIZES.length; make(); refit?.(); return SIZES[si].label; } },
      { label: 'Add service window', run: () => { win = !win; make(); return win ? 'Remove service window' : 'Add service window'; } },
      { label: 'Add gear hooks', run: () => { hooks = !hooks; make(); return hooks ? 'Remove gear hooks' : 'Add gear hooks'; } },
    ],
  };
});

/* ---------------- 17. weapons storage ---------------- */
def('weapons', 'Weapons Storage Cabinet', '48" W x 20" D x 78" H: rifle rack with locking bar, pistol racks, ammo drawers', ({ THREE, tween }) => {
  const k = kit(THREE), { M, bx, cyl, group } = k, root = new THREE.Group();
  const paint = k.std(0x3b4046, 0.5, 0.35), foam = k.std(0x242628, 0.95, 0), gun = k.std(0x17181a, 0.4, 0.5), furn = k.std(0x5a4a38, 0.6, 0.1);
  const can = k.std(0x4d5a3a, 0.6, 0.3), inner = k.std(0x6b7176, 0.5, 0.3);
  const W = 48, D = 20, H = 78, base = 3, split = 26;
  bx(root, W, base, D - 1, M.dark, 0, 0, 0.5);
  bx(root, W, 1, D, paint, 0, H - 1, 0); bx(root, 1, H - base, D, paint, 0, base, 0); bx(root, 1, H - base, D, paint, W - 1, base, 0);
  bx(root, W, H - base, 0.8, paint, 0, base, 0); bx(root, W, 0.8, D, paint, 0, base, 0); bx(root, 0.8, H - base - 1, D - 1, paint, split, base, 0);
  // rifle side: butt tray, barrel rest, eight rifles, hinged locking bar
  bx(root, split - 2, 3, 12, foam, 1.5, base + 0.8, 3);
  bx(root, split - 2, 1.5, 4, foam, 1.5, base + 44, 1.5);
  for (let i = 0; i < 8; i++) {
    const g = group(root, 3.6 + i * 2.85, base + 3.8, 9); g.rotation.x = -0.08;
    bx(g, 1.5, 13, 5.5, i % 3 === 1 ? furn : gun, -0.75, 0, -2.75);
    bx(g, 1.3, 12, 3, gun, -0.65, 13, -1.5);
    bx(g, 1, 6, 2.2, gun, -0.5, 9, 1.4);
    bx(g, 1.6, 10, 2.4, gun, -0.8, 25, -1.2);
    cyl(g, 0.35, 9, gun, 0, 39.5, -0.4, 10);
  }
  const bar = group(root, 1.8, base + 30, 16.5);
  bx(bar, split - 3, 1.6, 1, M.steel, 0, -0.8, 0); cyl(bar, 0.9, 1.4, M.steel, 0, 0, 0.5, 16, 'z');
  bx(bar, 1.6, 2.6, 1.6, M.chrome, split - 4.4, -1.3, 0.8);
  bar.userData.onClick = () => { bar.userData.up = !bar.userData.up; tween(bar.rotation, 'z', bar.userData.up ? 1.35 : 0, 700, 'out'); };
  // pistol side: foam racks on three shelves, ammo drawers below
  for (const y of [base + 34, base + 47, base + 60]) {
    bx(root, W - split - 2, 0.3, D - 2, paint, split + 0.8, y, 1);
    bx(root, W - split - 4, 2.6, 6, foam, split + 2, y + 0.3, 3);
    for (let p = 0; p < 5; p++) {
      const x = split + 3.4 + p * 3.8;
      bx(root, 1.1, 6.2, 1.5, gun, x, y + 0.6, 5);
      bx(root, 1.1, 1.8, 5, gun, x, y + 5.6, 5);
      bx(root, 1.1, 4, 1.4, gun, x, y + 1.8, 8.6);
    }
  }
  const drawers = [];
  for (let i = 0; i < 3; i++) {
    const y = base + 1.2 + i * 9.6, dr = group(root);
    k.tray(dr, W - split - 3.2, 7, D - 4, inner, split + 1.4, y, 1.6, 0.2);
    for (let c = 0; c < 3; c++) bx(dr, 5.8, 6, 10, can, split + 2.2 + c * 6.4, y + 0.2, 4);
    bx(dr, W - split - 2.4, 8.8, 0.8, paint, split + 1, y, D - 2.6);
    bx(dr, 6, 0.7, 0.9, M.chrome, split + (W - split) / 2 - 3, y + 6.8, D - 1.8);
    dr.userData.onClick = () => { dr.userData.open = !dr.userData.open; tween(dr.position, 'z', dr.userData.open ? 13 : 0, 650, 'out'); };
    drawers.push(dr);
  }
  // doors: heavy steel, keypad and three-point handle on the right
  const doors = [];
  for (const side of [0, 1]) {
    const pv = group(root, side ? W - 0.5 : 0.5, base + 0.4, D), dw = W / 2 - 0.6, sx = side ? -dw : 0;
    bx(pv, dw, H - base - 1.6, 1.2, paint, sx, 0, 0);
    for (let v = 0; v < 8; v++) bx(pv, dw - 8, 0.35, 0.2, M.dark, sx + 4, H - base - 8 - v * 1.1, 1.2);
    if (side) { bx(pv, 3.2, 4.2, 0.6, M.black, -dw + 2, 44, 1.2); bx(pv, 2.2, 0.6, 0.2, k.std(0x39d353, 0.3, 0, { emissive: 0x1f8a33, emissiveIntensity: 0.8 }), -dw + 2.5, 47.4, 1.8); bx(pv, 1.2, 8, 1.6, M.chrome, -dw + 3, 32, 1.2); }
    pv.userData.onClick = () => { const o = !pv.userData.open; doors.forEach((d, n) => { d.userData.open = o; tween(d.rotation, 'y', o ? (n ? 1.9 : -1.9) : 0, 800, 'out'); }); };
    doors.push(pv);
  }
  const openDoors = () => { if (!doors[0].userData.open) doors[0].userData.onClick(); };
  return {
    group: root, view: [0.8, 0.5, 1.3],
    finishes: [{ name: 'Gunmetal', swatch: '#3b4046', color: 0x3b4046 }, { name: 'Light gray', swatch: '#c3c7ca', color: 0xbfc4c7 }, { name: 'Tan', swatch: '#b9a57e', color: 0xb9a57e }, { name: 'OD green', swatch: '#4d5a3a', color: 0x4d5a3a }], setFinish: k.finisher(paint),
    actions: [
      { label: 'Open doors', run: () => { doors[0].userData.onClick(); return doors[0].userData.open ? 'Close doors' : 'Open doors'; } },
      { label: 'Release the locking bar', run: () => { openDoors(); bar.userData.onClick(); return bar.userData.up ? 'Lock the rifle bar' : 'Release the locking bar'; } },
      { label: 'Pull an ammo drawer', run: () => { openDoors(); drawers[1].userData.onClick(); } },
    ],
  };
});

/* ---------------- 18. athletic team lockers ---------------- */
def('athletic', 'Athletic Team Lockers', 'Four 24" W x 24" D x 72" H lockers: foot locker seat, helmet shelf, pad hooks, security box', ({ THREE, tween }) => {
  const k = kit(THREE), { M, bx, cyl, group } = k, root = new THREE.Group();
  const paint = k.std(0x2c2f31, 0.45, 0.35), team = k.std(0x8c1d2c, 0.4, 0.1), jersey_ = k.std(0xf2f2ee, 0.85, 0), mesh = k.meshMat(24, 50, 0.6, '#b9bec1', 0.6);
  const n = 4, w = 24, d = 24, h = 72;
  const lids = [], boxes = [], doorG = group(root); doorG.userData.dyn = true; doorG.visible = false;
  bx(root, n * w, h, 0.6, paint, 0, 0, 0); bx(root, n * w, 0.8, d, paint, 0, h - 0.8, 0);
  for (let i = 0; i <= n; i++) bx(root, 0.6, h, d, paint, Math.min(i * w, n * w - 0.6), 0, 0);
  for (let i = 0; i < n; i++) {
    const x0 = i * w + 0.6, iw = w - 1.2;
    // foot locker seat with a lift-up lid
    bx(root, iw, 0.4, d - 1, paint, x0, 1, 0.6);
    for (const cx of [x0 + 5, x0 + 12]) bx(root, 4, 3.5, 10, M.black, cx, 1.4, 8);
    bx(root, iw, 1, d - 0.4, paint, x0, 16, 0.4); bx(root, iw, 0.6, 1, M.black, x0, 17, d - 3);
    const lid = group(root, x0 + 0.1, 0.6, d); bx(lid, iw - 0.2, 15, 0.6, paint, 0, 0, -0.6); bx(lid, 6, 0.8, 0.9, M.chrome, iw / 2 - 3, 12.4, -0.3);
    for (let v = 0; v < 4; v++) bx(lid, iw - 6, 0.3, 0.2, M.dark, 3, 3 + v * 1.2, 0);
    lid.userData.onClick = () => { lid.userData.open = !lid.userData.open; tween(lid.rotation, 'x', lid.userData.open ? 1.45 : 0, 700, 'out'); };
    lids.push(lid);
    // hanging: garment rod, jersey, shoulder pad hook
    cyl(root, 0.5, iw, M.chrome, x0 + iw / 2, 49.5, d / 2, 16, 'x');
    // game jersey on a hanger facing out, shoulder pads hung on the back hook
    bx(root, 2, 2, 6, M.chrome, x0 + iw / 2 - 1, 44, 0.6);
    shoulderPads(THREE, root, x0 + iw / 2, 47, 6.5, Math.PI / 2);
    jersey(THREE, root, x0 + iw / 2, 49.5, d / 2 + 1.5, i % 2 ? team : jersey_, [7, 12, 23, 44][i], Math.PI / 2);
    // helmet shelf with a helmet, clear of the security box shelf at 64"
    bx(root, iw, 0.4, d - 2, paint, x0, 52, 0.6);
    root.add(footballHelmet(THREE, team, x0 + iw / 2, 52.4 + 3.2, 11));
    // lockable security box at the top
    bx(root, iw, 0.4, d - 1, paint, x0, 64, 0.6);
    const sb = group(root, x0 + 0.2, 64.4, d); bx(sb, iw - 0.4, 6.8, 0.5, paint, 0, 0, -0.5); cyl(sb, 0.6, 0.4, M.chrome, iw - 3, 3.4, 0.1, 16, 'z');
    sb.userData.onClick = () => { sb.userData.open = !sb.userData.open; tween(sb.rotation, 'x', sb.userData.open ? 1.5 : 0, 600, 'out'); };
    boxes.push(sb);
    // optional ventilated doors
    const dv = group(doorG, x0 + 0.1, 17.6, d); const m = new THREE.Mesh(new THREE.PlaneGeometry(iw - 2.4, 43), mesh); m.position.set((iw - 0.2) / 2, 23, 0.1); dv.add(m);
    bx(dv, iw - 0.2, 1.2, 0.6, paint, 0, 0, -0.3); bx(dv, iw - 0.2, 1.2, 0.6, paint, 0, 45, -0.3); bx(dv, 1.2, 46, 0.6, paint, 0, 0, -0.3); bx(dv, 1.2, 46, 0.6, paint, iw - 1.4, 0, -0.3);
    bx(dv, 0.8, 5, 0.9, M.chrome, iw - 3, 20, 0.2);
    dv.userData.onClick = () => { dv.userData.open = !dv.userData.open; tween(dv.rotation, 'y', dv.userData.open ? -1.9 : 0, 650, 'out'); };
  }
  return {
    group: root, view: [0.7, 0.45, 1.35],
    finishes: [{ name: 'Black', swatch: '#2c2f31', color: 0x2c2f31 }, { name: 'Navy', swatch: '#2a3d5c', color: 0x2a3d5c }, { name: 'Maroon', swatch: '#6b1f2a', color: 0x6b1f2a }, { name: 'Forest', swatch: '#2f5a3e', color: 0x2f5a3e }, { name: 'Light gray', swatch: '#c3c7ca', color: 0xbfc4c7 }], setFinish: k.finisher(paint),
    actions: [
      { label: 'Open foot lockers', run: () => { const o = !lids[0].userData.open; lids.forEach(l => { if (!!l.userData.open !== o) l.userData.onClick(); }); return o ? 'Close foot lockers' : 'Open foot lockers'; } },
      { label: 'Open security boxes', run: () => { const o = !boxes[0].userData.open; boxes.forEach(l => { if (!!l.userData.open !== o) l.userData.onClick(); }); return o ? 'Close security boxes' : 'Open security boxes'; } },
      { label: 'Add doors', run: () => { doorG.visible = !doorG.visible; return doorG.visible ? 'Open front' : 'Add doors'; } },
    ],
  };
});

/* ---------------- 19. mail sorter ---------------- */
def('mail-sorter', 'Wall-Mounted Mail Sorter', '60" W, 60 pockets 12" deep, hung on the wall over a sorting ledge', ({ THREE, tween }) => {
  const k = kit(THREE), { M, bx, group } = k, root = new THREE.Group();
  const lam = k.std(0xc79a66, 0.65, 0), steel = k.std(0x9aa1a6, 0.4, 0.6), wall = k.std(0xe9e6df, 0.9, 0), env = [M.white, k.std(0xe9d9b8, 0.85, 0), k.std(0xdfe8ef, 0.85, 0)];
  const W = 60, cols = 10, rows = 6, pw = 6, ph = 4.5, SD = 12.5, LY = 38, LD = 11, r = rng(6);
  bx(root, W + 40, 96, 4, wall, -20, 0, -4);
  // ledge on steel brackets
  bx(root, W, 1, LD, lam, 0, LY, 0);
  for (const x of [4, W - 5.5]) { bx(root, 1.5, 7, 1, steel, x, LY - 7, 0); bx(root, 1.5, 1, LD - 1.5, steel, x, LY - 1, 0.5); k.bar(root, x + 0.75, LY - 6.5, x + 0.75, LY - 1, 0, 0.8, steel); }
  // sorter on a wall cleat, bottom 8" above the ledge
  const y0 = LY + 9, SH = rows * ph + 0.8;
  bx(root, W - 4, 2, 0.8, steel, 2, y0 + SH - 5, -0.8);
  bx(root, W, SH, 0.5, lam, 0, y0, 0); bx(root, W, 0.8, SD, lam, 0, y0 + SH - 0.8, 0);
  for (let c = 0; c <= cols; c++) bx(root, c === 0 || c === cols ? 0.8 : 0.3, SH, SD, lam, c === cols ? W - 0.8 : c * pw - (c ? 0.15 : 0), y0, 0);
  for (let rr = 0; rr < rows; rr++) { bx(root, W, 0.3, SD, lam, 0, y0 + rr * ph, 0); for (let c = 0; c < cols; c++) bx(root, 2.4, 0.5, 0.06, M.label, c * pw + pw / 2 - 1.2, y0 + rr * ph - 0.5, SD); }
  const stack = [];
  for (let c = 0; c < cols; c++) for (let rr = 0; rr < rows; rr++) if (r() > 0.55) { const n = 1 + Math.floor(r() * 3); for (let e = 0; e < n; e++) stack.push({ x: c * pw + 0.7, y: y0 + rr * ph + 0.35 + e * 0.12, z: 2 + r() * 2, w: pw - 1.4, h: 0.1, d: 9 + r() * 2, color: ['#ffffff', '#e9d9b8', '#dfe8ef'][Math.floor(r() * 3)] }); }
  k.many(root, stack, k.std(0xffffff, 0.8, 0));
  // today's mail waits on the ledge and gets sorted into pockets
  const home = i => ({ x: 22 + (i % 2) * 2, y: LY + 1.1 + i * 0.14, z: 0.6 + (i % 3) * 0.3 });
  const letters = [], slots = [];
  for (let i = 0; i < 8; i++) {
    const h = home(i), e = group(root, h.x, h.y, h.z); bx(e, pw - 1.4, 0.1, 9.5, env[i % 3], 0, 0, 0); e.rotation.y = (r() - 0.5) * 0.2; e.userData.dyn = true;
    letters.push(e); slots.push({ x: Math.floor(r() * cols) * pw + 0.7, y: y0 + Math.floor(r() * rows) * ph + 0.9, z: 2.5 });
  }
  let sorted = false, busy = false;
  const sort = async () => {
    if (busy) return; busy = true; sorted = !sorted;
    for (let i = 0; i < letters.length; i++) {
      const e = letters[i], to = sorted ? slots[i] : home(i);
      // lift the letter clear of the pockets, carry it across in front, then slide it in (or back to the ledge)
      tween(e.rotation, 'y', sorted ? 0 : (i % 3 - 1) * 0.07, 420);
      await tween(e.position, 'z', SD + 1.5, 260, 'out');
      await Promise.all([tween(e.position, 'x', to.x, 380), tween(e.position, 'y', to.y, 380)]);
      await tween(e.position, 'z', to.z, 300, 'out');
    }
    busy = false;
  };
  return {
    group: root, view: [0.55, 0.3, 1.35],
    finishes: [{ name: 'Maple laminate', swatch: '#c79a66', color: 0xc79a66 }, { name: 'Light gray', swatch: '#c3c7ca', color: 0xbfc4c7 }, { name: 'White', swatch: '#f1f2f0', color: 0xeeefed }, { name: 'Black', swatch: '#2c2f31', color: 0x2c2f31 }], setFinish: k.finisher(lam),
    actions: [{ label: 'Sort the mail', run: () => { sort(); return sorted ? 'Pull the mail' : 'Sort the mail'; } }],
  };
});

/* ---------------- 20. industrial workstation ---------------- */
def('workstation', 'Industrial Workstation', '72" W x 30" D bench, adjustable height, pegboard, bin rail, shelf and task light', ({ THREE, tween, wake }) => {
  const k = kit(THREE), { M, bx, cyl, group } = k, root = new THREE.Group();
  const frame = k.std(0x9ea6ab, 0.45, 0.5), top = k.std(0xcf9f68, 0.6, 0), peg = k.std(0x6d767c, 0.6, 0.3, { map: k.grid(16, 5, '#3c4247') }), bin = k.std(0x2f6fb3, 0.4, 0.05);
  peg.map.repeat.set(18, 8);
  const light = k.std(0xfff8e1, 0.3, 0, { emissive: 0xfff2c4, emissiveIntensity: 1 });
  const W = 72, D = 30, r = rng(11);
  // fixed base: legs with leveling feet and a lower shelf
  for (const x of [1, W - 3]) for (const z of [1, D - 3]) { bx(root, 2, 20, 2, frame, x, 1, z); cyl(root, 1.4, 1, M.dark, x + 1, 0.5, z + 1, 16); }
  bx(root, W - 4, 0.8, D - 4, frame, 2, 7, 2);
  // the work surface and upright ride together
  const up = group(root); up.userData.dyn = true;
  for (const x of [1.3, W - 2.7]) for (const z of [1.3, D - 2.7]) bx(up, 1.4, 23, 1.4, frame, x, 9, z);
  bx(up, W, 1.75, D, top, 0, 32, 0); bx(up, W - 2, 2, 2, frame, 1, 30, D - 3); bx(up, W - 2, 2, 2, frame, 1, 30, 1);
  for (const x of [1, W - 3]) bx(up, 2, 50, 2, frame, x, 33.75, 0.5);
  bx(up, W - 6, 26, 0.5, peg, 3, 38, 1);
  bx(up, W - 6, 1.2, 1.2, frame, 3, 58, 1.2);
  for (let i = 0; i < 9; i++) bx(up, 5.4, 4.5, 7, bin, 5 + i * 7, 59.2, 1.6);
  for (let i = 0; i < 5; i++) { const x = 8 + i * 8 + r() * 2; bx(up, 0.6, 7 + r() * 4, 0.4, M.chrome, x, 42, 1.8); bx(up, 1.6, 1.6, 0.4, M.chrome, x - 0.5, 48 + r(), 1.8); }
  bx(up, W - 4, 0.8, 12, frame, 2, 72, 1); bx(up, W - 10, 0.8, 1.6, light, 5, 71.2, 8);
  const dr = group(up); k.tray(dr, 20, 4, 22, frame, W - 26, 26.6, 4, 0.2); bx(dr, 21, 5, 0.6, frame, W - 26.5, 26, 26.2); bx(dr, 7, 0.6, 0.9, M.chrome, W - 19.5, 28, 26.8);
  dr.userData.onClick = () => { dr.userData.open = !dr.userData.open; tween(dr.position, 'z', dr.userData.open ? 16 : 0, 600, 'out'); };
  let high = false, lit = true;
  return {
    group: root, view: [0.7, 0.45, 1.3],
    finishes: [{ name: 'Light gray', swatch: '#c3c7ca', color: 0x9ea6ab }, { name: 'Black', swatch: '#2c2f31', color: 0x2c2f31 }, { name: 'O\'Brien teal', swatch: '#0f7377', color: 0x0f7377 }], setFinish: k.finisher(frame),
    actions: [
      { label: 'Raise the work surface', run: () => { high = !high; tween(up.position, 'y', high ? 6 : 0, 1400); return high ? 'Lower the work surface' : 'Raise the work surface'; } },
      { label: 'Open the drawer', run: () => { dr.userData.onClick(); return dr.userData.open ? 'Close the drawer' : 'Open the drawer'; } },
      { label: 'Light off', run: () => { lit = !lit; light.emissiveIntensity = lit ? 1 : 0; wake(); return lit ? 'Light off' : 'Light on'; } },
    ],
  };
});

/* ---------------- 21. fireproof file cabinets ---------------- */
def('fireproof', 'Fireproof File Cabinets', 'A 4-drawer vertical (21" W x 31" D) and a 3-drawer lateral (38" W), fire and impact rated', ({ THREE, tween }) => {
  const k = kit(THREE), { M, bx, cyl, group, many } = k, root = new THREE.Group();
  const paint = k.std(0xd6ccb9, 0.45, 0.3), inner = k.std(0x8c9296, 0.5, 0.3), r = rng(17);
  const drawers = [];
  const unit = (x0, W, D, H, n, lateral) => {
    const t = 2.2, dh = (H - 3.4 - t - 0.3) / n;
    bx(root, W, 3, D - 1, M.dark, x0, 0, 0.5);
    bx(root, W, t, D, paint, x0, H - t, 0); bx(root, t, H - 3, D, paint, x0, 3, 0); bx(root, t, H - 3, D, paint, x0 + W - t, 3, 0); bx(root, W, H - 3, t, paint, x0, 3, 0);
    for (let i = 0; i < n; i++) {
      const y = 3 + 0.4 + i * dh, dr = group(root);
      bx(root, W - 2 * t, 0.6, D - t, paint, x0 + t, y - 0.4, t);
      k.tray(dr, W - 2 * t - 1, dh - 4, D - 6, inner, x0 + t + 0.5, y + 0.6, t + 1, 0.2);
      const f = [];
      if (lateral) { for (let x = x0 + t + 2; x < x0 + W - t - 2; x += 0.6 + r() * 0.5) f.push({ x, y: y + 1, z: t + 2, w: 0.08, h: dh - 6, d: D - 9, color: r() > 0.85 ? '#2f9e44' : KRAFT[Math.floor(r() * 4)] }); }
      else { for (let z = t + 2; z < D - 4; z += 0.6 + r() * 0.5) f.push({ x: x0 + t + 1.5, y: y + 1, z, w: W - 2 * t - 3, h: dh - 6, d: 0.08, color: r() > 0.85 ? '#2f9e44' : KRAFT[Math.floor(r() * 4)] }); }
      many(dr, f, M.kraft);
      bx(dr, W - 2 * t + 0.4, dh - 0.3, 2, paint, x0 + t - 0.2, y, D - 1.6);
      bx(dr, Math.min(12, W - 10), 1, 1.2, M.chrome, x0 + W / 2 - Math.min(12, W - 10) / 2, y + dh - 4, D + 0.4);
      bx(dr, 3, 1.6, 0.1, M.label, x0 + W / 2 - 1.5, y + 2, D + 0.42);
      dr.userData.onClick = () => { dr.userData.open = !dr.userData.open; tween(dr.position, 'z', dr.userData.open ? (lateral ? 15 : 24) : 0, 800, 'out'); };
      drawers.push(dr);
    }
    cyl(root, 0.8, 0.6, M.chrome, x0 + W / 2, H - 1.4, D + 0.2, 20, 'z');
    bx(root, 4, 1.4, 0.1, k.std(0xc9a227, 0.3, 0.6), x0 + W - 6, H - 2.2, D + 0.05);
  };
  unit(0, 21, 31, 53, 4, false);
  unit(25, 38, 21.5, 40, 3, true);
  return {
    group: root, view: [0.8, 0.55, 1.3],
    finishes: [{ name: 'Putty', swatch: '#d9cfbd', color: 0xd6ccb9 }, { name: 'Black', swatch: '#2c2f31', color: 0x2c2f31 }, { name: 'Light gray', swatch: '#c3c7ca', color: 0xbfc4c7 }, { name: 'White', swatch: '#f1f2f0', color: 0xeeefed }], setFinish: k.finisher(paint),
    actions: [
      { label: 'Open a drawer', run: () => { drawers[1].userData.onClick(); drawers[5].userData.onClick(); return drawers[1].userData.open ? 'Close the drawers' : 'Open a drawer'; } },
    ],
  };
});

/* ---------------- 22. wall-mounted art screens ---------------- */
def('wall-art', 'Stationary Art Screens', 'White mesh panels fixed to the wall on standoffs, or freestanding double-sided screens on feet; picture ledges and wall-mounted sculpture', ({ THREE, tween, wake, refit, bake }) => {
  const k = kit(THREE), { M, bx, cyl, group } = k, root = new THREE.Group();
  const white = k.std(0xf3f4f2, 0.45, 0.25), wall = k.std(0x56606a, 0.85, 0), gilt = k.std(0xa6832f, 0.35, 0.7), mesh = k.meshMat(48, 96, 2, '#c3c9cd', 0.85), ledgeM = k.std(0xf6f6f3, 0.5, 0.15);
  const PW = 48, PH = 96;
  let mount = 0, ledges = false, reliefs = true, unit, wallG;
  // frames stay inside the panel: width and height are clipped to the panel edges; with ledges, art hangs above them
  const hang = (g, face, r) => {
    let x = 3;
    while (x < PW - 14) {
      if (PW - 3 - x < 12) break;
      const { m: pm, fw, fh } = framed(THREE, r, Math.min(32, PW - 3 - x), 12, 24), y = (ledges ? 30 : 10) + r() * Math.max(0, PH - fh - (ledges ? 40 : 20));
      bx(g, fw, fh, 1.6, r() > 0.5 ? gilt : M.woodDark, x, y, face > 0 ? 0.4 : -2);
      bx(g, fw - 3, fh - 3, 0.2, pm, x + 1.5, y + 1.5, face > 0 ? 2 : -2.2);
      x += fw + 3 + r() * 4;
    }
  };
  // a picture ledge hooked on the mesh: small works lean on it, a light sculpture stands at the end
  const ledge = (g, face, r) => {
    const z = face > 0 ? 0.4 : -6.4, lz = face > 0 ? 0.4 : -0.4;
    bx(g, PW - 6, 1, 6, ledgeM, 3, 14, z); bx(g, PW - 6, 2, 0.6, ledgeM, 3, 15, face > 0 ? 5.8 : -6.4);
    for (const x of [5, PW - 7]) bx(g, 2, 6, 1, ledgeM, x, 9, face > 0 ? lz : lz - 1);
    let x = 5;
    for (let q = 0; q < 2; q++) { const { m: pm, fw, fh } = framed(THREE, r, 14, 8, 6); const lean = new THREE.Group(); lean.position.set(x, 15, face > 0 ? 1.6 : -1.6); lean.rotation.x = face > 0 ? -0.12 : 0.12; bx(lean, fw, fh, 1, M.woodDark, 0, 0, -0.5); bx(lean, fw - 3, fh - 3, 0.15, pm, 1.5, 1.5, face > 0 ? 0.5 : -0.65); g.add(lean); x += fw + 2; }
    museumObjects(THREE, g, PW - 17, 15, face > 0 ? 0.8 : -6, 12, 5, r, 13);
  };
  // lighter relief work and masks hung straight on the mesh with S-hooks and a padded bracket
  // this panel carries sculpture instead of paintings: a bronze relief plaque, a carved mask and a small head on padded brackets
  const bronzeM = k.std(0x7a5230, 0.4, 0.75), carved = k.std(0x6b4428, 0.55, 0.1), padM = k.std(0x2b2d2f, 0.9, 0);
  const relief = (g) => {
    bx(g, 20, 26, 1.4, bronzeM, PW / 2 - 10, 58, 0.4);
    for (const [cx, cy, rr] of [[PW / 2 - 3, 74, 4], [PW / 2 + 4, 66, 3], [PW / 2 - 5, 64, 2.4]]) { const b = new THREE.Mesh(new THREE.SphereGeometry(rr, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), bronzeM); b.rotation.x = Math.PI / 2; b.scale.z = 0.35; b.position.set(cx, cy, 1.8); g.add(b); }
    const mask = new THREE.Mesh(new THREE.SphereGeometry(5, 18, 14, 0, Math.PI * 2, 0, Math.PI / 2), carved); mask.scale.set(0.8, 1.25, 0.55); mask.rotation.x = Math.PI / 2; mask.position.set(PW / 2 - 9, 40, 1); g.add(mask);
    for (const x of [PW / 2 - 12, PW / 2 - 7]) bx(g, 1.4, 0.8, 2.6, padM, x, 32.5, 0.3);
    // a small head on a wall bracket shelf, strapped back to the mesh
    bx(g, 11, 0.8, 8, M.black, PW / 2 + 3, 30, 0.3); bx(g, 0.8, 5, 6, M.black, PW / 2 + 8, 25, 0.3);
    museumObjects(THREE, g, PW / 2 + 3, 30.8, 1, 11, 6, rng(3), 16);
  };
  const panel = (parent, both, r, noArt = false) => {
    const g = group(parent);
    bx(g, PW, 1.5, 1.5, white, 0, 0, -0.75); bx(g, PW, 1.5, 1.5, white, 0, PH - 1.5, -0.75); bx(g, 1.5, PH, 1.5, white, 0, 0, -0.75); bx(g, 1.5, PH, 1.5, white, PW - 1.5, 0, -0.75);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(PW - 3, PH - 3), mesh); m.position.set(PW / 2, PH / 2, 0); g.add(m);
    if (!noArt) for (const face of both ? [1, -1] : [1]) { hang(g, face, r); if (ledges) ledge(g, face, r); }
    return g;
  };
  const make = () => {
    if (unit) root.remove(unit); paintReset(4); objReset();
    unit = group(root); unit.userData.dyn = true; const r = rng(23);
    if (mount === 0) {
      bx(unit, 3 * PW + 28, 120, 6, wall, -10, 0, -6);
      for (let i = 0; i < 3; i++) {
        const sculpt = reliefs && i === 1 && !ledges, p = panel(unit, false, r, sculpt); p.position.set(4 + i * PW, 10, 4);
        for (const y of [4, PH - 8]) for (const x of [4, PW - 6]) bx(p, 2, 2, 4, white, x, y, -4.2);
        if (sculpt) relief(p);
      }
    } else {
      for (let i = 0; i < 3; i++) {
        const p = panel(unit, true, r); p.position.set(4 + i * PW, 6, 40);
        for (const x of [6, PW - 6]) { bx(p, 2, 6, 2, white, x - 1, -6, -1); bx(p, 3, 1.4, 26, white, x - 1.5, -6, -13); }
      }
    }
    unit.traverse(o => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; } });
    bake?.(unit); wake();
  };
  make();
  return {
    group: root, view: [0.55, 0.35, 1.4],
    finishes: [{ name: 'White', swatch: '#f3f4f2', color: 0xf3f4f2 }, { name: 'Light gray', swatch: '#c3c7ca', color: 0xbfc4c7 }, { name: 'Black', swatch: '#2c2f31', color: 0x2c2f31 }], setFinish: k.finisher(white),
    actions: [
      { label: 'Mounting', options: ['Wall mounted', 'Freestanding'], get: () => mount, set: n => { mount = n; make(); refit?.(); } },
      { label: 'Picture ledges', toggle: true, get: () => ledges, set: v => { ledges = v; make(); } },
      { label: 'Wall-mounted sculpture', toggle: true, when: () => mount === 0 && !ledges, get: () => reliefs, set: v => { reliefs = v; make(); } },
    ],
  };
});

/* ---------------- 23. textile rack ---------------- */
def('textile-rack', 'Rolled Textile Storage', '12 ft double-sided cantilever rack: rolls of different lengths on tubes resting on the arms', ({ THREE, tween }) => {
  const k = kit(THREE), { M, bx, cyl, group } = k, root = new THREE.Group();
  const frame = k.std(0x3a3f44, 0.45, 0.35), tube = k.std(0xf6f7f5, 0.35, 0.1), r = rng(31);
  const wraps = [k.std(0xe3e7ea, 0.3, 0.35), k.std(0xeceeee, 0.55, 0.1), k.std(0xd9dde0, 0.3, 0.4)];
  const bare = [k.std(0x9b2226, 0.85, 0), k.std(0x7a5230, 0.9, 0), k.std(0x8c6b3f, 0.9, 0), k.std(0x3d5a7a, 0.85, 0), k.std(0x5e4a7a, 0.85, 0)];
  const L = 144, H = 104, arm = 30, cols = [0, 48, 96, 144], levels = [10, 27, 44, 61, 78, 95], slots = [10, 22];
  const SPANS = [[[0, 3]], [[0, 1], [1, 3]], [[0, 2], [2, 3]], [[0, 1], [1, 2], [2, 3]], [[0, 3]], [[1, 3]], [[0, 2]]];
  for (const x of cols) {
    bx(root, 3.5, H, 5, frame, x - 1.75, 0, -2.5);
    bx(root, 3.5, 3.5, 2 * arm + 4, frame, x - 1.75, 0, -arm - 2);
    for (const y of levels) for (const s of [1, -1]) {
      const a = group(root, x, y, 0);
      bx(a, 2, 2.2, arm, frame, -1, 0, s > 0 ? 2.5 : -arm - 2.5);
      bx(a, 2, 2, 8, frame, -1, -2, s > 0 ? 2.5 : -10.5);
      bx(a, 2, 3.4, 1, frame, -1, 0, s > 0 ? arm + 1.5 : -arm - 2.5);
    }
  }
  for (const s of [1, -1]) bx(root, L + 6, 4, 2, frame, -3, 0, s > 0 ? arm + 2 : -arm - 4);
  bx(root, L, 3, 3, frame, 0, H - 3, -1.5);
  // each tube spans one, two or three sections and rests in saddles at the columns it ends on
  const rolls = [];
  for (const y of levels) for (const s of [1, -1]) for (const z of slots) {
    const spans = SPANS[Math.floor(r() * SPANS.length)];
    for (const [a, b] of spans) {
      const xa = cols[a], xb = cols[b], g = group(root, 0, y + 7.8, s * z);
      for (const xs of [xa, xb]) bx(root, 2, 5.2, 3, frame, xs - 1, y + 2.2, s * z - 1.5);
      cyl(g, 1.5, xb - xa + 8, tube, (xa + xb) / 2, 0, 0, 18, 'x');
      if (r() > 0.1) {
        const room = xb - xa - 8, len = room * (0.55 + r() * 0.4), x0 = xa + 4 + r() * (room - len), rad = 2.6 + r() * 2.8, wrapped = r() > 0.55, pat = r() > 0.3 ? textileMats(THREE)[Math.floor(r() * 6)] : bare[Math.floor(r() * bare.length)];
        cyl(g, rad, len, wrapped ? wraps[Math.floor(r() * 3)] : pat, x0 + len / 2, 0, 0, 28, 'x');
        // an unrolled lip hangs off some rolls so the weave, print or pattern shows flat
        if (!wrapped && pat.map && r() > 0.55) bx(g, len - 2, 6, 0.12, pat, x0 + 1, -6, s > 0 ? rad : -rad - 0.12);
        for (const e of [x0, x0 + len]) cyl(g, rad * 0.92, 0.2, wrapped ? wraps[1] : k.std(0xefe9dc, 0.9, 0), e + (e === x0 ? -0.1 : 0.1), 0, 0, 28, 'x');
        bx(g, 1.6, 2.2, 0.1, M.label, x0 + 3, -1.1, s > 0 ? rad + 0.05 : -rad - 0.15);
      }
      if (z === slots[1]) {
        g.userData.onClick = () => { const o = !g.userData.out; g.userData.out = o; tween(g.position, 'y', y + 7.8 + (o ? 4 : 0), 380, 'out').then(() => tween(g.position, 'z', s * (z + (o ? 26 : 0)), 900)); };
        rolls.push(g);
      }
    }
  }
  return {
    group: root, view: [1.15, 0.5, 1.0],
    finishes: [{ name: 'Dark gray', swatch: '#3a3f44', color: 0x3a3f44 }, { name: 'White', swatch: '#f1f2f0', color: 0xf1f2f0 }, { name: 'Light gray', swatch: '#c3c7ca', color: 0xbfc4c7 }, { name: 'Putty', swatch: '#d9cfbd', color: 0xd6ccb9 }, { name: 'Black', swatch: '#2c2f31', color: 0x2c2f31 }], setFinish: k.finisher(frame),
    actions: [{ label: 'Lift out a roll', run: () => { const g = rolls[Math.min(5, rolls.length - 1)]; g.userData.onClick(); return g.userData.out ? 'Put it back' : 'Lift out a roll'; } }],
  };
});

/* ---------------- 24. tire rack ---------------- */
def('tire-rack', 'Tire Storage Rack', 'Two 48" bays, three levels: tires cradled between front and back beams, tread out', ({ THREE, wake }) => {
  const k = kit(THREE), { M, bx, cyl, group } = k, root = new THREE.Group();
  const blue = k.std(0x1f5fb0, 0.45, 0.35), up = k.postMat(blue), rimM = k.std(0xc9ced2, 0.25, 0.9), r = rng(40);
  const bays = 2, D = 24, H = 94, W = bays * 48, levels = [3, 33, 63], tires = [];
  for (let i = 0; i <= bays; i++) {
    const x = Math.min(i * 48, W - 2);
    for (const z of [0, D - 2]) { bx(root, 2, H, 2, up, x, 0, z); bx(root, 5, 0.4, 5, M.steel, x - 1.5, 0, z - 1.5); }
    for (let y = 12; y < H - 6; y += 30) bx(root, 1.2, 1.2, D - 4, blue, x + 0.4, y, 2);
  }
  for (const lv of levels) for (let b = 0; b < bays; b++) {
    const x0 = b * 48 + 2;
    for (const bz of [0.5, D - 2]) bx(root, 46, 3, 1.5, blue, x0, lv, bz);
    for (let x = x0 + 4.4; x < x0 + 43; x += 8.2) if (r() > 0.08) tires.push({ x, y: lv + 3 + 9, z: D / 2, label: r() > 0.4, spin: r() * 6 });
  }
  tireMesh(THREE, root, tires);
  const rims = group(root); rims.userData.dyn = true; rims.visible = false;
  const im = new THREE.InstancedMesh(new THREE.CylinderGeometry(8.7, 8.7, 6, 28), rimM, tires.length), o = new THREE.Object3D();
  tires.forEach((t, i) => { o.position.set(t.x, t.y, t.z); o.rotation.set(0, 0, Math.PI / 2); o.updateMatrix(); im.setMatrixAt(i, o.matrix); });
  im.instanceMatrix.needsUpdate = true; rims.add(im);
  return {
    group: root, view: [0.6, 0.35, 1.3],
    finishes: [{ name: 'Blue', swatch: '#1f5fb0', color: 0x1f5fb0 }, { name: 'Safety orange', swatch: '#e3671c', color: 0xe3671c }, { name: 'Gray', swatch: '#8f969a', color: 0x8f969a }, { name: 'Black', swatch: '#2c2f31', color: 0x2c2f31 }], setFinish: k.finisher(blue, up),
    actions: [{ label: 'Wheel and tire sets', run: () => { rims.visible = !rims.visible; wake(); return rims.visible ? 'Tires only' : 'Wheel and tire sets'; } }],
  };
});

/* ---------------- 25. mobile wire shelving on a top track ---------------- */
wireModel('wire-track', 'Mobile Wire Shelving on Overhead Track', 'Units on casters slide side to side under two overhead track runs, between tall fixed end units', 'track', ['track']);

/* ---------------- 26. stainless steel work table ---------------- */
def('ss-table', 'Stainless Steel Work Table', '60" W x 30" D x 34" H: stainless top, undershelf, casters or bullet feet', ({ THREE, wake, bake }) => {
  const k = kit(THREE), { M, bx, cyl, group } = k, root = new THREE.Group();
  const ss = k.std(0xdfe3e6, 0.22, 0.95), ssD = k.std(0xc9ced2, 0.3, 0.9), W = 60, D = 30, H = 34;
  let wheels = true, splash = false, shelf = true, unit;
  const make = () => {
    if (unit) root.remove(unit);
    unit = group(root);
    const foot = wheels ? 5.2 : 1.4;
    bx(unit, W, 1.3, D, ss, 0, H - 1.3, 0);
    bx(unit, W, 1.6, 0.2, ss, 0, H - 1.6, D - 0.1); bx(unit, 0.2, 1.6, D, ss, 0, H - 1.6, 0); bx(unit, 0.2, 1.6, D, ss, W - 0.2, H - 1.6, 0);
    bx(unit, W - 6, 1.6, 1.4, ssD, 3, H - 3, 3); bx(unit, W - 6, 1.6, 1.4, ssD, 3, H - 3, D - 4.4);
    if (splash) { bx(unit, W, 5, 0.8, ss, 0, H, 0); bx(unit, W, 0.6, 1.6, ss, 0, H + 5, 0); }
    for (const x of [3, W - 3]) for (const z of [3, D - 3]) {
      cyl(unit, 0.8, H - 1.3 - foot, ss, x, foot + (H - 1.3 - foot) / 2, z, 16);
      cyl(unit, 1.05, 1.2, ssD, x, 10.6, z, 16);
      if (wheels) { bx(unit, 2.4, 1, 2.4, ssD, x - 1.2, 4.4, z - 1.2); bx(unit, 1.8, 2.8, 0.3, ssD, x - 0.9, 1.6, z - 1.2); bx(unit, 1.8, 2.8, 0.3, ssD, x - 0.9, 1.6, z + 0.9); cyl(unit, 2.5, 1.6, M.rubber, x, 2.5, z, 18, 'z'); cyl(unit, 1, 1.7, ssD, x, 2.5, z, 12, 'z'); }
      else { const f = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.1, foot, 16), ssD); f.position.set(x, foot / 2, z); unit.add(f); }
    }
    if (shelf) { bx(unit, W - 4, 0.9, D - 4, ss, 2, 10, 2); bx(unit, W - 4, 1.4, 0.15, ss, 2, 9.6, D - 2.15); bx(unit, W - 4, 1.4, 0.15, ss, 2, 9.6, 2); }
    else { for (const x of [3, W - 3]) cyl(unit, 0.55, D - 6, ss, x, 10.6, D / 2, 12, 'z'); cyl(unit, 0.55, W - 6, ss, W / 2, 10.6, 3, 12, 'x'); }
    unit.traverse(o => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; } }); unit.userData.dyn = true; bake?.(unit); wake();
  };
  make();
  return {
    group: root, finishes: [{ name: 'Stainless', swatch: '#dfe3e6', color: 0xdfe3e6, metal: 0.95, rough: 0.22 }, { name: 'Black epoxy', swatch: '#2a2c2e', color: 0x2a2c2e, metal: 0.2, rough: 0.5 }, { name: 'White powder coat', swatch: '#eef0ee', color: 0xeef0ee, metal: 0.1, rough: 0.45 }], setFinish: k.finisher(ss, ssD), view: [0.8, 0.55, 1.3],
    actions: [
      { label: 'Bullet feet', run: () => { wheels = !wheels; make(); return wheels ? 'Bullet feet' : 'Add casters'; } },
      { label: 'Add backsplash', run: () => { splash = !splash; make(); return splash ? 'Remove backsplash' : 'Add backsplash'; } },
      { label: 'Crossbars only', run: () => { shelf = !shelf; make(); return shelf ? 'Crossbars only' : 'Add undershelf'; } },
    ],
  };
});

/* ---------------- 27. install sequence ---------------- */
def('install', 'Mobile Storage Install, Step by Step', 'Rails in the floor or on a raised deck, then carriages, shelving, drive and handles: pick the floor method and play it', ({ THREE, tween, wait, wake, refresh }) => {
  const k = kit(THREE), { M, bx, cyl, group } = k, root = new THREE.Group();
  const paint = k.std(0xbfc4c7, 0.5, 0.3), panel = k.std(0x2c2f31, 0.45, 0.25), black = k.std(0x1c1e20, 0.45, 0.15);
  const concrete = k.std(0xb9bcbc, 0.9, 0), plug = k.std(0xaeb2b2, 0.92, 0), slc = k.std(0x9fa4a5, 0.8, 0), kerf = k.std(0x55595b, 0.9, 0);
  const chalk = k.std(0x2f6fdf, 0.6, 0, { emissive: 0x1b3f8a, emissiveIntensity: 0.4 }), shimM = k.std(0x9aa1a6, 0.4, 0.7), grout = k.std(0x8d9091, 0.95, 0);
  const masonite = k.std(0x6b4a2f, 0.75, 0), ply = k.std(0xd9b27c, 0.8, 0), railM = k.std(0x7d858a, 0.35, 0.8), hole = k.std(0x2b2d2f, 0.9, 0), toolM = k.std(0x1f6fb3, 0.5, 0.2), alu = k.std(0xc9ced2, 0.3, 0.85), keyM = k.std(0xc9a227, 0.35, 0.7);
  // chain links and floor tile textures
  const tex = (w, hgt, draw, rx, ry) => { const c = document.createElement('canvas'); c.width = w; c.height = hgt; draw(c.getContext('2d')); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 8; return t; };
  const chainM = new THREE.MeshStandardMaterial({ map: tex(32, 64, g => { g.fillStyle = '#3a3d40'; g.fillRect(0, 0, 32, 64); g.strokeStyle = '#a9b0b5'; g.lineWidth = 5; for (const y of [2, 34]) { g.beginPath(); g.ellipse(16, y + 14, 9, 14, 0, 0, Math.PI * 2); g.stroke(); } }, 1, 40), roughness: 0.4, metalness: 0.8 });
  const vctM = new THREE.MeshStandardMaterial({ map: tex(128, 128, g => { g.fillStyle = '#d9d4c7'; g.fillRect(0, 0, 128, 128); g.fillStyle = '#c9c2b2'; g.fillRect(0, 0, 64, 64); g.fillRect(64, 64, 64, 64); g.strokeStyle = '#b8b1a2'; g.lineWidth = 1; g.strokeRect(0, 0, 64, 64); g.strokeRect(64, 64, 64, 64); }, 1, 1), roughness: 0.55, metalness: 0 });
  const L = 108, d = 15, h = 84, N = 4, aisle = 36, cH = 5, TW = 8;
  const depths = [d + 1, ...Array(N).fill(2 * d + 1), d + 1];
  const base = []; let acc = 0; for (const dd of depths) { base.push(acc); acc += dd + 0.8; }
  const total = acc + aisle, z0 = -6, z1 = total + 6, x0 = -8, x1 = L + 10;
  const rails = [8, L / 2 - 10, L / 2 + 10, L - 8];
  const METHODS = ['Raised subfloor', 'In-floor, new slab', 'In-floor, cut into slab'], FIN_R = ['Exposed plywood', 'Painted plywood', 'VCT tile'], FIN_F = ['Exposed concrete', 'VCT tile'];
  let method = 0, finish = 0;
  // slab: lower 2" is solid everywhere. Over the storage area the top 2" is either there (raised floor, or cut into later)
  // or left out: a new slab is poured with a 2" depression, the rails go in, and self-leveling concrete brings it to grade
  const RX0 = -22, RX1 = L + 24, RZ0 = -16, RZ1 = total + 16;
  bx(root, L + 60, 2, total + 60, concrete, -30, -4, -30);
  bx(root, RX0 + 30, 2, total + 60, concrete, -30, -2, -30); bx(root, L + 30 - RX1, 2, total + 60, concrete, RX1, -2, -30);
  bx(root, RX1 - RX0, 2, RZ0 + 30, concrete, RX0, -2, -30); bx(root, RX1 - RX0, 2, total + 30 - RZ1, concrete, RX0, -2, RZ1);
  const stage = () => { const g = group(root); g.userData.dyn = true; g.visible = false; return g; };
  const topIn = group(root); topIn.userData.dyn = true;
  { let a = RX0; for (const rx of rails) { bx(topIn, rx - TW / 2 - a, 2, RZ1 - RZ0, concrete, a, -2, RZ0); bx(topIn, TW, 2, z0 - RZ0, concrete, rx - TW / 2, -2, RZ0); bx(topIn, TW, 2, RZ1 - z1, concrete, rx - TW / 2, -2, z1); a = rx + TW / 2; } bx(topIn, RX1 - a, 2, RZ1 - RZ0, concrete, a, -2, RZ0); }
  const plugs = rails.map(rx => { const g = stage(); bx(g, TW, 2, z1 - z0, plug, rx - TW / 2, -2, z0); return g; });
  const pour = group(root, 0, -2, 0); pour.userData.dyn = true; pour.visible = false; bx(pour, RX1 - RX0, 1.98, RZ1 - RZ0, slc, RX0, 0, RZ0);
  // step placard
  const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 256; const cx = cv.getContext('2d');
  const signTex = new THREE.CanvasTexture(cv); signTex.colorSpace = THREE.SRGBColorSpace; signTex.anisotropy = 8;
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(110, 27.5), new THREE.MeshBasicMaterial({ map: signTex, toneMapped: false }));
  sign.position.set(L / 2, h + 44, -34); sign.rotation.y = 0.9; root.add(sign);
  const say = (a, b) => {
    cx.fillStyle = '#023c3f'; cx.fillRect(0, 0, 1024, 256); cx.fillStyle = '#e8a33d'; cx.fillRect(0, 0, 14, 256);
    cx.fillStyle = '#9fd3d5'; cx.font = 'bold 42px system-ui, sans-serif'; cx.fillText(a, 48, 90);
    let fz = 60; do { cx.font = 'bold ' + fz + 'px system-ui, sans-serif'; fz -= 2; } while (cx.measureText(b).width > 940 && fz > 28);
    cx.fillStyle = '#ffffff'; cx.fillText(b, 48, 184); signTex.needsUpdate = true; wake();
  };
  // shared floor pieces
  const lines = stage(); for (const rx of rails) bx(lines, 0.3, 0.05, z1 - z0, chalk, rx - 0.15, 0.01, z0);
  for (const z of [z0, z1]) bx(lines, x1 - x0, 0.05, 0.3, chalk, x0, 0.01, z);
  const saw = stage(); { bx(saw, 8, 3, 6, toolM, -4, 0.2, -3); cyl(saw, 3.2, 0.2, alu, 0, 1, 0, 24, 'x'); bx(saw, 2, 4, 2, black, -1, 3.2, -1); }
  // raised subfloor pieces
  const railsR = rails.map(rx => { const g = stage(); bx(g, 2, 1, z1 - z0 - 4, railM, rx - 1, 0.25, z0 + 2); bx(g, 0.8, 0.3, z1 - z0 - 4, alu, rx - 0.4, 1.25, z0 + 2); return g; });
  const shimsR = stage(); for (const rx of rails) for (let z = z0 + 4; z < z1 - 3; z += 24) bx(shimsR, 2.4, 0.25, 3, shimM, rx - 1.2, 0, z);
  const groutR = stage(); for (const rx of rails) for (const sx of [-1.6, 1]) bx(groutR, 0.6, 0.35, z1 - z0 - 4, grout, rx + sx, 0, z0 + 2);
  const bays = []; { let a = x0; for (const rx of rails) { bays.push([a, rx - 1.6]); a = rx + 1.6; } bays.push([a, x1]); }
  // one mesh per layer per bay keeps draw calls down
  const plyPaint = k.std(0x5f6a70, 0.7, 0.05);
  const layer = (m, t, y) => bays.map(([a, b]) => { const g = stage(); for (let z = z0; z < z1; z += 48) bx(g, b - a, t, Math.min(48, z1 - z) - 0.1, m, a, y, z); return g; });
  const mason = layer(masonite, 0.25, 0), plyG = layer(ply, 1, 0.25), vctR = layer(vctM, 0.125, 1.25);
  vctR.forEach(g => g.children.forEach(t => { t.material = vctM.clone(); t.material.map = vctM.map.clone(); t.material.map.repeat.set(t.scale.x / 24, t.scale.z / 24); t.material.map.needsUpdate = true; }));
  const stack = stage(); bx(stack, 48, 4, 96, ply, x1 + 20, 0, 20);
  const pts = []; for (let z = z0 + 6; z < z1 - 4; z += 16) for (const [a, b] of bays) for (let x = a + 5; x < b - 3; x += 16) pts.push([x, z]);
  const inst = (geo, m, y) => { const im = new THREE.InstancedMesh(geo, m, pts.length), o = new THREE.Object3D(); pts.forEach(([x, z], i) => { o.position.set(x, y, z); o.updateMatrix(); im.setMatrixAt(i, o.matrix); }); im.instanceMatrix.needsUpdate = true; im.count = 0; root.add(im); return im; };
  const holes = inst(new THREE.CylinderGeometry(0.35, 0.35, 0.05, 10), hole, 1.27), screws = inst(new THREE.CylinderGeometry(0.55, 0.55, 0.15, 6), alu, 1.33);
  const drill = stage(); { bx(drill, 3, 8, 3, toolM, -1.5, 7.25, -1.5); bx(drill, 6, 3, 3, toolM, -1.5, 12.25, -1.5); cyl(drill, 0.3, 6, alu, 0, 4.25, 0, 8); }
  const ramps = stage(); { const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(5, 0); s.lineTo(0, 1.25); s.closePath(); for (const [xx, rot] of [[x1, 0], [x0, Math.PI]]) { const m = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: z1 - z0, bevelEnabled: false }), alu); m.rotation.y = rot; m.position.set(xx, 0, rot ? z1 : z0); ramps.add(m); } }
  // in-floor pieces: kerf cuts, rails in the trough, shim stacks, self-leveling fill, finish tile
  const kerfs = stage(); for (const rx of rails) for (const sx of [-TW / 2, TW / 2]) bx(kerfs, 0.25, 0.04, z1 - z0, kerf, rx + sx - 0.125, 0, z0);
  const railsF = rails.map(rx => { const g = stage(); bx(g, 2, 1, z1 - z0 - 4, railM, rx - 1, -1, z0 + 2); bx(g, 0.8, 0.02, z1 - z0 - 4, alu, rx - 0.4, 0, z0 + 2); return g; });
  const shimsF = stage(); for (const rx of rails) for (let z = z0 + 4; z < z1 - 3; z += 24) bx(shimsF, 3, 1, 3, shimM, rx - 1.5, -2, z);
  const fill = rails.map(rx => { const g = group(root, 0, -2, 0); g.userData.dyn = true; g.visible = false; bx(g, TW / 2 - 1, 2, z1 - z0, slc, rx - TW / 2, 0, z0); bx(g, TW / 2 - 1, 2, z1 - z0, slc, rx + 1, 0, z0); return g; });
  const vctF = (() => { const out = []; let a = x0 - 14; for (const rx of [...rails, x1 + 14]) { const b = rx === x1 + 14 ? rx : rx - 1; const g = stage(); const t = bx(g, b - a, 0.125, z1 - z0 + 20, vctM.clone(), a, 0, z0 - 10); t.material.map = vctM.map.clone(); t.material.map.repeat.set((b - a) / 24, (z1 - z0 + 20) / 24); t.material.map.needsUpdate = true; out.push(g); a = rx + 1; } return out; })();
  // system: carriages with drive shafts already in them, splice, shelving, chain drive, panels, keys, handles
  const TAKE0 = 48.6, TAKE1 = 50;
  const parts = { carriage: [], splice: [], frame: [], loaded: [], chain: [], covers: [], panels: [], keys: [], handles: [] };
  const ranges = depths.map((dd, j) => {
    const g = group(root, 0, 0, base[j]), fixed = j === 0 || j === depths.length - 1, last = j === depths.length - 1;
    g.userData.dyn = true; g.userData.z0 = base[j] + (last ? aisle : 0); g.userData.fixed = fixed; g.userData.base = base[j];
    const half = L / 2 - 1.5, c = group(g), c2 = group(g);
    bx(c, half, cH, dd, M.dark, 0, 0, 0); bx(c2, half, cH, dd, M.dark, L - half, 0, 0);
    for (const bz of [-0.4, dd]) { cyl(c, 0.9, 0.4, black, 6, cH * 0.55, bz + 0.2, 12, 'z'); cyl(c2, 0.9, 0.4, black, L - 6, cH * 0.55, bz + 0.2, 12, 'z'); }
    for (const rx of rails) cyl(rx < L / 2 ? c : c2, 2, 1.4, black, rx, 1.6, dd / 2, 16, 'x');
    if (!fixed) { cyl(c, 0.9, L / 2 + 0.4, alu, (L / 2 - 0.9) / 2, 2.5, dd / 2, 14, 'x'); cyl(c2, 0.9, L / 2 + 1.3, alu, (L / 2 + 0.1 + L + 1.4) / 2, 2.5, dd / 2, 14, 'x'); }
    parts.carriage.push(c, c2);
    const sp = group(g);
    for (const zz of [-0.4, dd]) { bx(sp, 8, cH - 1, 0.4, alu, L / 2 - 4, 0.5, zz); for (const xx of [L / 2 - 2.6, L / 2 + 2.6]) for (const yy of [1.6, cH - 1.6]) cyl(sp, 0.45, 0.4, M.chrome, xx, yy, zz < 0 ? -0.6 : dd + 0.6, 8, 'z'); }
    if (!fixed) cyl(sp, 1.5, 3.4, keyM, L / 2, 2.5, dd / 2, 16, 'x');
    parts.splice.push(sp);
    const shelves = (contents) => {
      const s = group(g, 0, cH, 0);
      if (!fixed || j === 0) shelving(k, s, { bays: 3, w: 36, d, h, closed: true, shelves: 7, paint, contents, seed: 3 + j, z: fixed ? 0.5 : d + 1 });
      if (!fixed || last) { const b = shelving(k, s, { bays: 3, w: 36, d, h, closed: true, shelves: 7, paint, contents, seed: 30 + j }); b.rotation.y = Math.PI; b.position.set(L, 0, fixed ? d + 0.5 : d); }
      return s;
    };
    parts.frame.push(shelves(null)); parts.loaded.push(shelves('boxes'));
    // end panels: the handle end has a grommeted hole for the handle shaft
    const p = group(g), PH = h + cH + 1, px = L + 1.6, hz = dd / 2, r0 = 1.6;
    bx(p, 1.6, PH, dd - 0.3, panel, -1.6, 0, 0.15);
    if (fixed) bx(p, 1.6, PH, dd - 0.3, panel, px, 0, 0.15);
    else {
      bx(p, 1.6, TAKE1 - r0, dd - 0.3, panel, px, 0, 0.15); bx(p, 1.6, PH - TAKE1 - r0, dd - 0.3, panel, px, TAKE1 + r0, 0.15);
      bx(p, 1.6, 2 * r0, hz - r0 - 0.15, panel, px, TAKE1 - r0, 0.15); bx(p, 1.6, 2 * r0, dd - 0.15 - hz - r0, panel, px, TAKE1 - r0, hz + r0);
      const gr = new THREE.Mesh(new THREE.TorusGeometry(r0, 0.25, 8, 24), black); gr.rotation.y = Math.PI / 2; gr.position.set(px + 1.65, TAKE1, hz); p.add(gr);
    }
    parts.panels.push(p);
    if (!fixed) {
      // chain box: drive sprocket on the shaft, take-up sprocket with the handle shaft, chain around both
      const cb = group(g);
      bx(cb, 0.3, 52, 5.8, black, L, 0.2, hz - 2.9);
      cyl(cb, 2.2, 0.9, alu, L + 0.75, 2.5, hz, 20, 'x');
      const arcB = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.22, 6, 20, Math.PI), chainM); arcB.rotation.set(0, Math.PI / 2, Math.PI); arcB.position.set(L + 0.75, 2.5, hz); cb.add(arcB);
      const take = group(cb, 0, TAKE0, 0); take.userData.dyn = true;
      cyl(take, 2.2, 0.9, alu, L + 0.75, 0, hz, 20, 'x'); cyl(take, 0.7, 5, alu, L + 2.5, 0, hz, 12, 'x');
      const arcT = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.22, 6, 20, Math.PI), chainM); arcT.rotation.set(0, Math.PI / 2, 0); arcT.position.set(L + 0.75, 0, hz); take.add(arcT);
      for (const dz of [-2.8, 2.5]) bx(take, 1, 3, 0.3, M.steel, L + 0.3, -1.5, hz + dz);
      const strands = [-2.2, 2.2].map(dz => { const st = bx(cb, 0.45, 1, 0.45, chainM, L + 0.53, 0, hz + dz - 0.225); st.userData.dyn = true; st.userData.z = st.position.z; return st; });
      cb.userData.take = take; cb.userData.strands = strands; parts.chain.push(cb);
      const cov = group(g); bx(cov, 0.3, 52, 5.8, black, L + 1.25, 0.2, hz - 2.9); for (const zz of [hz - 2.9, hz + 2.6]) bx(cov, 1.25, 52, 0.3, black, L, 0.2, zz); parts.covers.push(cov);
      const key = group(g); bx(key, 1.4, 0.35, 0.35, keyM, L + 3.4, TAKE1 + 0.62, hz - 0.175); parts.keys.push(key);
      const hub = group(g, L + 3.4, TAKE1, hz); cyl(hub, 2.6, 2, black, 1, 0, 0, 28, 'x'); cyl(hub, 1.6, 0.4, alu, 2.1, 0, 0, 24, 'x');
      for (let q = 0; q < 3; q++) { const arm = new THREE.Group(); arm.rotation.x = (q * Math.PI * 2) / 3; hub.add(arm); const a = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 1.1, 8.4, 16), black); a.position.set(1.2, 4.6, 0); arm.add(a); const ball = new THREE.Mesh(new THREE.SphereGeometry(1.4, 20, 14), black); ball.position.set(1.2, 9.4, 0); arm.add(ball); }
      parts.handles.push(hub); g.userData.hub = hub;
    }
    for (const o of g.children) o.userData.dyn = true;
    return g;
  });
  const staged = [lines, saw, pour, ...plugs, kerfs, ...railsR, shimsR, groutR, ...mason, ...plyG, ...vctR, stack, drill, ramps, ...railsF, shimsF, ...fill, ...vctF, ...Object.values(parts).flat()];
  staged.forEach(o => { o.userData.home = o.position.clone(); });
  const chainAt = (cb, top, sag) => { cb.userData.take.position.y = top; cb.userData.strands.forEach((st, i) => { st.scale.y = top - 2.5; st.position.y = (top + 2.5) / 2; st.position.z = st.userData.z + (i ? -sag : 0); }); };
  const show = (list) => list.forEach(o => { o.visible = true; });
  const drop = async (list, from, ms, gap) => { for (const o of list) { o.visible = true; o.position.y = o.userData.home.y + from; tween(o.position, 'y', o.userData.home.y, ms, 'out'); await wait(gap); } await wait(ms); };
  const sawRun = async (y) => { saw.visible = true; for (const rx of rails) for (const sx of [-TW / 2, TW / 2]) { saw.position.set(rx + sx, y, z0); await tween(saw.position, 'z', z1, 520, 'lin'); } saw.visible = false; };
  // the floor steps for each method, then the steps every system shares
  const RAISED = [
    ['Lay out', 'Snap chalk lines for every rail', async () => { lines.visible = true; lines.scale.z = 0.01; await tween(lines.scale, 'z', 1, 900, 'out'); }],
    ['Rails', 'Set the rails on the slab', async () => { await drop(railsR, 14, 700, 160); }],
    ['Level', 'Shim each rail dead level', async () => { shimsR.visible = true; railsR.forEach(g => { g.position.y = -0.25; }); await wait(250); for (const g of railsR) { tween(g.position, 'y', 0, 600, 'out'); await wait(120); } await wait(600); }],
    ['Grout', 'Grout under the rails', async () => { groutR.visible = true; groutR.scale.z = 0.01; await tween(groutR.scale, 'z', 1, 1100); }],
    ['Underlayment', 'Lay masonite between the rails', async () => { await drop(mason, 6, 500, 90); }],
    ['Cut to fit', 'Cut plywood to size between the track', async () => { stack.visible = true; saw.visible = true; saw.position.set(x1 + 44, 4, 20); await tween(saw.position, 'z', 116, 1200, 'lin'); saw.visible = false; }],
    ['Deck', 'Set the plywood flush with the rails', async () => { stack.visible = false; await drop(plyG, 8, 500, 90); }],
    ['Drill', 'Hammer drill through the plywood into the slab', async () => { drill.visible = true; const rows = [...new Set(pts.map(p => p[1]))]; for (const z of rows) { const idx = pts.findIndex(p => p[1] === z); drill.position.set(pts[idx][0], 0, z); holes.count = pts.filter(p => p[1] <= z).length; wake(); await wait(110); } drill.visible = false; }],
    ['Fasten', 'Drive Tapcon screws into the concrete', async () => { for (let n = 0; n <= pts.length; n += 8) { screws.count = Math.min(n, pts.length); wake(); await wait(40); } screws.count = pts.length; wake(); }],
    ['Edges', 'Aluminum ramp edges on the open sides', async () => { ramps.visible = true; ramps.position.y = 6; await tween(ramps.position, 'y', 0, 700, 'out'); }],
  ];
  const INFLOOR = [
    ['Rails', 'Set the rails in the troughs', async () => { await drop(railsF, 14, 700, 160); }],
    ['Level', 'Shim the rails level and flush with the floor', async () => { shimsF.visible = true; railsF.forEach(g => { g.position.y = -0.6; }); await wait(250); for (const g of railsF) { tween(g.position, 'y', 0, 600, 'out'); await wait(120); } await wait(600); }],
    ['Pour', 'Pour self-leveling fill around the rails', async () => { for (const g of fill) { g.visible = true; g.scale.y = 0.01; tween(g.scale, 'y', 1, 1100, 'out'); await wait(200); } await wait(1100); shimsF.visible = false; }],
  ];
  // new slab: no troughs, a 2" depression over the whole storage area, then one pour to grade after the rails are set
  const FORMED = [
    ['Depression', 'New slab poured 2" low across the storage area', async () => { lines.visible = true; lines.position.y = -2; lines.scale.z = 0.01; await tween(lines.scale, 'z', 1, 900, 'out'); }],
    ['Rails', 'Set the rails in the depression', async () => { await drop(railsF, 14, 700, 160); }],
    ['Level', 'Shim the rails level at finished floor height', async () => { shimsF.visible = true; railsF.forEach(g => { g.position.y = -0.6; }); await wait(250); for (const g of railsF) { tween(g.position, 'y', 0, 600, 'out'); await wait(120); } await wait(600); }],
    ['Pour', 'Pour self-leveling concrete over the whole floor, up to grade', async () => { lines.visible = false; pour.visible = true; pour.scale.y = 0.01; await tween(pour.scale, 'y', 1, 1800, 'out'); shimsF.visible = false; }],
  ];
  const CUT = [
    ['Lay out', 'Snap chalk lines for every trough', async () => { lines.visible = true; lines.scale.z = 0.01; await tween(lines.scale, 'z', 1, 900, 'out'); }],
    ['Saw cut', 'Saw cut both edges of each trough', async () => { await sawRun(0.2); kerfs.visible = true; wake(); }],
    ['Chip out', 'Chip out the troughs and clean them', async () => { for (const g of plugs) { tween(g.position, 'y', 8, 600, 'out'); await wait(160); } await wait(650); plugs.forEach(g => { g.visible = false; }); kerfs.visible = false; }],
    ...INFLOOR,
  ];
  const TILE_R = ['Floor finish', 'VCT tile over the deck', async () => { await drop(vctR, 3, 450, 80); }];
  const PAINT_R = ['Floor finish', 'Paint the plywood deck', async () => { for (const g of plyG) { g.children.forEach(t => { t.material = plyPaint; }); wake(); await wait(140); } }];
  const TILE_F = ['Floor finish', 'VCT tile up to the rails', async () => { await drop(vctF, 3, 450, 100); }];
  const COMMON = [
    ['Carriages', 'Set the carriages, drive shafts already in', async () => { await drop(parts.carriage, 30, 800, 110); }],
    ['Splice', 'Bolt the carriage sections and couple the drive shafts', async () => { await drop(parts.splice, 10, 500, 120); }],
    ['Shelving', 'Build the shelving on the carriages', async () => { for (const s of parts.frame) { s.visible = true; s.scale.y = 0.01; tween(s.scale, 'y', 1, 900, 'out'); await wait(150); } await wait(800); }],
    ['Chain drive', 'Mount the chain boxes and run the chains', async () => { await drop(parts.chain, 24, 650, 150); }],
    ['Tension', 'Tension each chain, then close the chain box', async () => {
      for (const cb of parts.chain) { const [a, b] = cb.userData.strands, ms = 800; tween(cb.userData.take.position, 'y', TAKE1, ms, 'out'); for (const st of [a, b]) { tween(st.scale, 'y', TAKE1 - 2.5, ms, 'out'); tween(st.position, 'y', (TAKE1 + 2.5) / 2, ms, 'out'); } tween(b.position, 'z', b.userData.z, ms, 'out'); await wait(160); }
      await wait(800); show(parts.covers); wake();
    }],
    ['End panels', 'Hang the end panels', async () => { for (const p of parts.panels) { p.visible = true; p.position.x = 30; tween(p.position, 'x', 0, 700, 'out'); await wait(120); } await wait(600); }],
    ['Keyways', 'Set the keys in the handle shafts', async () => { for (const kk of parts.keys) { kk.visible = true; kk.position.x = kk.userData.home.x + 8; tween(kk.position, 'x', kk.userData.home.x, 450, 'out'); await wait(120); } await wait(450); }],
    ['Handles', 'Fit the three-arm handles', async () => { for (const hb of parts.handles) { hb.visible = true; hb.position.x = hb.userData.home.x + 14; hb.rotation.x = -2.2; tween(hb.position, 'x', hb.userData.home.x, 650, 'out'); tween(hb.rotation, 'x', 0, 650, 'out'); await wait(150); } await wait(650); }],
    ['Turnover', 'Loaded and tested: tap a carriage to open its aisle', async () => { parts.loaded.forEach((s, i) => { s.visible = true; parts.frame[i].visible = false; }); wake(); await wait(300); open = 1; move(); await wait(1500); done = true; }],
  ];
  let STEPS = [], at = 0, busy = false, done = false, open = N;
  const move = () => ranges.forEach((g, j) => {
    if (g.userData.fixed) return;
    const to = g.userData.base + (j > open ? aisle : 0), dz = to - g.position.z; if (Math.abs(dz) < 0.1) return;
    const ms = 700 + Math.abs(dz) * 14; tween(g.position, 'z', to, ms); if (g.userData.hub) tween(g.userData.hub.rotation, 'x', g.userData.hub.rotation.x + dz * 0.16, ms);
  });
  ranges.forEach((g, j) => { if (!g.userData.fixed) g.userData.onClick = () => { if (!done) return; open = open === j - 1 ? j : j - 1; move(); }; });
  const reset = () => {
    at = 0; done = false; open = N;
    staged.forEach(o => { o.visible = false; o.position.copy(o.userData.home); o.scale.set(1, 1, 1); o.rotation.x = 0; });
    const inFloor = method > 0, top = inFloor ? 0.05 : 1.25;
    plugs.forEach(g => { g.visible = method !== 1; }); topIn.visible = method !== 1;
    ranges.forEach(g => { g.position.set(0, top, g.userData.z0); });
    holes.count = 0; screws.count = 0; parts.chain.forEach(cb => chainAt(cb, TAKE0, 0.9));
    plyG.forEach(g => g.children.forEach(t => { t.material = ply; }));
    const fin = method === 0 ? [[], [PAINT_R], [TILE_R]][finish] || [] : finish ? [TILE_F] : [];
    STEPS = [...(method === 0 ? RAISED : method === 1 ? FORMED : CUT), ...fin, ...COMMON];
    say('Install sequence: ' + METHODS[method].toLowerCase(), 'Press Next step or Play the whole install'); refresh?.();
  };
  const next = async () => { if (busy || at >= STEPS.length) return; busy = true; const [a, b, fn] = STEPS[at]; at++; say('Step ' + at + ' of ' + STEPS.length + ' · ' + a, b); await fn(); busy = false; refresh?.(); };
  reset();
  return {
    group: root, finishes: [{ name: 'Black', swatch: '#2c2f31', color: 0x2c2f31 }, { name: 'O\'Brien teal', swatch: '#0f7377', color: 0x0f7377 }, { name: 'Light gray', swatch: '#c3c7ca', color: 0xbfc4c7 }, { name: 'Navy', swatch: '#2a3d5c', color: 0x2a3d5c }], setFinish: k.finisher(panel), view: [1.45, 0.62, 0.62],
    actions: [
      { label: 'Floor', options: METHODS, get: () => method, set: n => { if (!busy) { method = n; finish = 0; reset(); } } },
      { label: 'Deck finish', when: () => method === 0, options: FIN_R, get: () => finish, set: n => { if (!busy) { finish = n; reset(); } } },
      { label: 'Floor finish', when: () => method > 0, options: FIN_F, get: () => Math.min(finish, 1), set: n => { if (!busy) { finish = n; reset(); } } },
      { label: 'Next step', when: () => at < STEPS.length, run: () => { next(); } },
      { label: 'Play the whole install', when: () => at < STEPS.length, run: async () => { if (busy) return; while (at < STEPS.length) { await next(); await wait(400); } } },
      { label: 'Open next aisle', when: () => done, run: () => { open = (open + 1) % (N + 1); move(); } },
      { label: 'Start over', run: () => { if (!busy) reset(); } },
    ],
  };
});

/* ---------------- 28. painting storage bins ---------------- */
def('painting-bins', 'Painting Storage Bins', 'Steel shelving with dividers on 12" centers for framed art, split in two if needed, roll-up doors to keep the dust out', ({ THREE, tween, wake, bake, refit }) => {
  const k = kit(THREE), { M, bx, group, many } = k, root = new THREE.Group();
  const paint = k.std(0xbfc4c7, 0.5, 0.3), post = k.postMat(paint), slatM = [], hoodM = k.std(0xf1f2f0, 0.35, 0.3), guideM = k.std(0xdfe2e4, 0.35, 0.5);
  const W = 48, D = 48, H = 96, r = rng(33);
  let sections = 2, split = false, doorsOn = true, unit, doors = [], pullAny = null; const reg = new Set(), secOf = new Map();
  const slatTex = () => { const c = document.createElement('canvas'); c.width = 16; c.height = 32; const g = c.getContext('2d'); g.fillStyle = '#f4f5f3'; g.fillRect(0, 0, 16, 32); g.fillStyle = '#d6d9d8'; g.fillRect(0, 26, 16, 3); g.fillStyle = '#ffffff'; g.fillRect(0, 2, 16, 4); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; return t; };
  const make = () => {
    if (unit) root.remove(unit);
    unit = group(root); unit.userData.dyn = true; doors = []; slatM.length = 0;
    const frames = [];
    for (let s = 0; s < sections; s++) {
      const x0 = s * (W + 1);
      for (const xx of [x0, x0 + W - 1.25]) for (const zz of [0, D - 1.25]) { bx(unit, 1.25, H, 1.25, paint, xx, 0, zz); k.slots(unit, post, xx === x0 ? xx + 1.25 : xx, 0, zz, 1.25, H, xx === x0 ? 1 : -1); }
      for (const y of split ? [2, H / 2, H - 0.6] : [2, H - 0.6]) { bx(unit, W, 0.6, D, paint, x0, y, 0); bx(unit, W, 1.4, 0.1, paint, x0, y - 0.8, D - 0.1); }
      bx(unit, W, H, 0.1, paint, x0, 0, 0); if (s === 0) bx(unit, 0.1, H, D, paint, x0, 0, 0); bx(unit, 0.1, H, D, paint, x0 + W - 0.1, 0, 0);
      const comps = split ? [[2.6, H / 2], [H / 2 + 0.6, H - 0.6]] : [[2.6, H - 0.6]];
      for (const [ya, yb] of comps) {
        for (let dx = 12; dx < W - 1; dx += 12) bx(unit, 0.12, yb - ya, D - 3, paint, x0 + dx, ya, 1.5);
        // framed works on edge in each 12" slot
        for (let slot = 0; slot < 4; slot++) {
          let x = x0 + slot * 12 + 1.2; const n = 1 + Math.floor(r() * 3);
          for (let q = 0; q < n && x < x0 + slot * 12 + 10.5; q++) {
            // each frame is cut to its painting's proportions, with a 1 1/2" moulding all around
            const t = 1.8 + r() * 1.4, pt = painting(THREE); let iw = Math.min(D - 9, 17 + r() * 24), ih = iw / pt.a; if (ih > yb - ya - 5) { ih = yb - ya - 5; iw = ih * pt.a; }
            const pd = iw + 3, ph = ih + 3; frames.push({ x, y: ya, z: D - 3 - pd, w: t, h: ph, d: pd, sec: s, pm: pt.m, color: ['#a6832f', '#6b4428', '#2b2d2f', '#c9b79a'][Math.floor(r() * 4)] }); x += t + 0.6; }
        }
      }
      // roll-up door: side guides, slats, bottom bar, and the coil hood sitting on the top shelf
      const dg = group(unit); dg.visible = doorsOn; dg.userData.dyn = true;
      for (const gx of [x0 + 0.1, x0 + W - 1.6]) bx(dg, 1.5, H - 1, 1.6, guideM, gx, 0, D + 0.1);
      const tex = slatTex(), m = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.4, metalness: 0.3 }); slatM.push(m);
      const geo = new THREE.PlaneGeometry(W - 3, H - 1); geo.translate(0, -(H - 1) / 2, 0);
      const curtain = new THREE.Mesh(geo, m); curtain.position.set(x0 + W / 2, H - 0.5, D + 0.9); curtain.userData.dyn = true; dg.add(curtain);
      const btm = new THREE.Mesh(new THREE.BoxGeometry(W - 3, 1.4, 0.8), guideM); btm.position.set(x0 + W / 2, 0.7, D + 0.9); btm.userData.dyn = true; dg.add(btm);
      tex.repeat.set(1, (H - 1) / 3);
      bx(dg, W + 0.4, 10, 11, hoodM, x0 - 0.2, H, D - 8);
      const s2 = new THREE.Shape(); s2.moveTo(0, 0); s2.lineTo(11, 0); s2.lineTo(11, 3); s2.lineTo(0, 0); const cap = new THREE.Mesh(new THREE.ExtrudeGeometry(s2, { depth: W + 0.4, bevelEnabled: false }), hoodM); cap.rotation.y = -Math.PI / 2; cap.position.set(x0 + W + 0.2, H + 10, D - 8); dg.add(cap);
      const d = { curtain, btm, tex, open: false, h0: H - 1 };
      // anything pulled out of this bay goes back before the door rolls down
      const click = () => { const back = !d.open ? 0 : [...reg].filter(c => secOf.get(c) === s).map(c => c()).length; setTimeout(() => { d.open = !d.open; tween(curtain.scale, 'y', d.open ? 0.04 : 1, 1400); tween(btm.position, 'y', d.open ? H - 1 : 0.7, 1400); }, back ? 900 : 0); };
      curtain.userData.onClick = btm.userData.onClick = click;
      doors.push(d);
    }
    // any framed work slides out of its slot, face showing; behind a closed door the click opens the door first
    reg.clear(); secOf.clear();
    const im = k.pullMany(unit, frames, k.std(0xffffff, 0.6, 0.1), {
      reg, ms: 900,
      spawn: (b) => {
        const g = group(null), iw = b.d - 3, ih = b.h - 3;
        bx(g, b.w, b.h, b.d, k.std(new THREE.Color(b.color).getHex(), 0.5, 0.25), b.x, b.y, b.z);
        bx(g, 0.05, ih, iw, b.pm, b.x + b.w, b.y + 1.5, b.z + 1.5); bx(g, 0.05, b.h - 1, b.d - 1, k.std(0xb89a6a, 0.9, 0), b.x - 0.05, b.y + 0.5, b.z + 0.5);
        g.traverse(o => { if (o.isMesh) o.castShadow = o.receiveShadow = true; });
        return g;
      },
      show: (g, b) => tween(g.position, 'z', b.d + 5, 900, 'out'),
      hide: (g) => tween(g.position, 'z', 0, 700, 'out'),
    });
    if (im) {
      const pull = im.userData.onClick;
      im.userData.onClick = (hit) => {
        const b = frames[hit?.instanceId]; if (!b) return; const d = doors[b.sec];
        if (doorsOn && d && !d.open) { d.curtain.userData.onClick(); return; }
        const before = new Set(reg); pull(hit); for (const c of reg) if (!before.has(c)) secOf.set(c, b.sec);
      };
      pullAny = () => { const open = frames.map((b, i) => [b, i]).filter(([b]) => !doorsOn || doors[b.sec]?.open); const pick = open[Math.floor(open.length / 2)]; if (pick) im.userData.onClick({ instanceId: pick[1] }); };
    }
    unit.traverse(o => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; } });
    if (doorsOn && doors[0]) { doors[0].open = true; doors[0].curtain.scale.y = 0.04; doors[0].btm.position.y = H - 1; }
    bake?.(unit); tick(); wake();
  };
  // keep the slat spacing true while a door rolls up
  const tick = () => doors.forEach(d => { d.tex.repeat.y = Math.max(0.2, (d.h0 * d.curtain.scale.y) / 3); });
  make();
  return {
    group: root, view: [0.7, 0.35, 1.3], tick,
    finishes: [{ name: 'Light gray', swatch: '#c3c7ca', color: 0xbfc4c7 }, { name: 'Putty', swatch: '#d9cfbd', color: 0xd6ccb9 }, { name: 'White', swatch: '#f1f2f0', color: 0xeeefed }, { name: 'Black', swatch: '#2c2f31', color: 0x2c2f31 }], setFinish: k.finisher(paint, post),
    actions: [
      { label: 'Open doors', when: () => doorsOn, run: () => { const o = !doors.every(d => d.open); doors.forEach(d => { if (d.open !== o) d.curtain.userData.onClick(); }); return o ? 'Close doors' : 'Open doors'; } },
      { label: 'Pull a painting', run: () => { if (reg.size) { [...reg].forEach(c => c()); return; } pullAny?.(); } },
      { label: 'Sections', options: ['1', '2', '3', '4'], get: () => sections - 1, set: n => { sections = n + 1; make(); refit?.(); } },
      { label: 'Split into two compartments', toggle: true, get: () => split, set: v => { split = v; make(); } },
      { label: 'Roll-up doors', toggle: true, get: () => doorsOn, set: v => { doorsOn = v; make(); } },
    ],
  };
});

/* ---------------- 31. stationary wardrobe cabinets ---------------- */
def('wardrobe', 'Steel Wardrobe Cabinets', '36" W x 24" D x 78" H cabinets: hanging rod and hat shelf, adjustable shelves, locking double doors, on a base or legs', ({ THREE, tween, wake, bake, refit }) => {
  const k = kit(THREE), { M, bx, cyl, group } = k, root = new THREE.Group();
  const paint = k.std(0xb5babd, 0.45, 0.35), cloth = [0x2a3d5c, 0x1c1d1f, 0x6b1f2a, 0xd9d4c7, 0x3d5a3a, 0x8a8f94, 0xefece4].map(c => k.std(c, 0.9, 0)), fold = [0xe8e4da, 0x9aa8b8, 0x6b4f3a, 0xf2f2ee].map(c => k.std(c, 0.9, 0));
  const W = 36, D = 24, H = 78, COUNTS = [2, 3, 4], INTERIORS = ['Full-height hanging', 'Hanging over shelves', 'Shelves only'];
  let ci = 1, inner = 1, legs = false, unit, doors = [];
  const make = () => {
    if (unit) root.remove(unit);
    unit = group(root); unit.userData.dyn = true; doors = []; const r = rng(14), base = legs ? 6 : 4;
    for (let u = 0; u < COUNTS[ci]; u++) {
      const x = u * (W + 0.25), y0 = base, h = H - base;
      if (legs) for (const [lx, lz] of [[2, 2], [W - 3, 2], [2, D - 3], [W - 3, D - 3]]) bx(unit, 1, base, 1, M.dark, x + lx, 0, lz); else bx(unit, W - 1, base, D - 2, M.dark, x + 0.5, 0, 1);
      bx(unit, W, 0.8, D, paint, x, y0, 0); bx(unit, W, 0.8, D, paint, x, y0 + h - 0.8, 0); bx(unit, 0.6, h, D, paint, x, y0, 0); bx(unit, 0.6, h, D, paint, x + W - 0.6, y0, 0); bx(unit, W, h, 0.6, paint, x, y0, 0);
      // hat shelf and rod up top; below, garments or shelves of folded linen
      const hat = y0 + h - 12; bx(unit, W - 1.2, 0.5, D - 2, paint, x + 0.6, hat, 1);
      for (let q = 0; q < 3; q++) bx(unit, 9, 5, 12, fold[(u + q) % 4], x + 2 + q * 11, hat + 0.5, 4);
      const rodY = hat - 3, bottom = inner === 0 ? y0 + 2 : inner === 1 ? y0 + 30 : null;
      if (bottom != null) {
        cyl(unit, 0.5, W - 1.2, M.chrome, x + W / 2, rodY, D / 2, 12, 'x');
        let gx = x + 2.5;
        while (gx < x + W - 3) { const t = 1.2 + r() * 1.2, len = Math.min(rodY - bottom - 2, 26 + r() * 20); bx(unit, 0.3, 2, 17, M.chrome, gx + t / 2 - 0.15, rodY - 2, D / 2 - 8.5); bx(unit, t, len, 18 + r() * 2, cloth[Math.floor(r() * cloth.length)], gx, rodY - 2 - len, D / 2 - 9.5); gx += t + 0.6; }
      }
      const shelfTop = inner === 0 ? y0 : inner === 1 ? y0 + 26 : rodY;
      for (let sy = y0 + 13; sy < shelfTop - 4; sy += 13) { bx(unit, W - 1.2, 0.5, D - 2, paint, x + 0.6, sy, 1); for (let q = 0; q < 3; q++) bx(unit, 9.5, 3 + r() * 5, 13, fold[Math.floor(r() * 4)], x + 2 + q * 11, sy + 0.5, 5); }
      // double doors with a recessed handle and a hasp for a padlock
      const pair = [];
      for (const side of [0, 1]) {
        const pv = group(unit, side ? x + W - 0.2 : x + 0.2, y0 + 0.4, D), dw = W / 2 - 0.3, sx = side ? -dw : 0; pv.userData.dyn = true;
        bx(pv, dw, h - 0.8, 0.8, paint, sx, 0, 0);
        for (let v = 0; v < 5; v++) bx(pv, dw - 6, 0.3, 0.1, M.dark, sx + 3, h - 6 - v * 0.9, 0.8);
        for (let v = 0; v < 5; v++) bx(pv, dw - 6, 0.3, 0.1, M.dark, sx + 3, 6 + v * 0.9, 0.8);
        if (side) { bx(pv, 1, 8, 0.9, M.chrome, -dw + 1.4, h / 2 - 4, 0.6); bx(pv, 1.4, 2.2, 0.6, M.chrome, -dw + 1.2, h / 2 + 5, 0.8); }
        pair.push(pv);
      }
      const toggle = () => { const o = !pair[0].userData.open; pair.forEach((d, n) => { d.userData.open = o; tween(d.rotation, 'y', o ? (n ? 1.9 : -1.9) : 0, 800, 'out'); }); };
      pair.forEach(d => { d.userData.onClick = toggle; }); doors.push({ pair, toggle });
    }
    unit.traverse(o => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; } });
    bake?.(unit);
    if (doors[1]) doors[1].toggle(); else if (doors[0]) doors[0].toggle();
    wake();
  };
  make();
  const re = () => { make(); refit?.(); };
  return {
    group: root, view: [0.8, 0.45, 1.3], prompt: 'Tap a cabinet door to open it',
    finishes: k.FIN.lockers, setFinish: k.finisher(paint),
    actions: [
      { label: 'Open all doors', run: () => { const o = !doors.every(d => d.pair[0].userData.open); doors.forEach(d => { if (!!d.pair[0].userData.open !== o) d.toggle(); }); return o ? 'Close all doors' : 'Open all doors'; } },
      { label: 'Cabinets', options: COUNTS.map(String), get: () => ci, set: n => { ci = n; re(); } },
      { label: 'Interior', options: INTERIORS, get: () => inner, set: n => { inner = n; re(); } },
      { label: 'Base', options: ['Closed base', 'Legs'], get: () => (legs ? 1 : 0), set: n => { legs = n === 1; re(); } },
    ],
  };
});

/* ---------------- 32. wall e-track ---------------- */
// horizontal e-track rails on the wall; ratchet straps from the track hold crates, pallets, sculpture or framed art in place
def('wall-etrack', 'Wall E-Track Restraints', '16 ft wall with rows of E-track: straps from the track hold crated works, pallets, sculpture on plinths or large framed art', ({ THREE, tween, wake, bake, refit }) => {
  const k = kit(THREE), { M, bx, group } = k, root = new THREE.Group();
  const wall = k.std(0xe9e6df, 0.9, 0), strapM = k.std(0xe8b923, 0.8, 0), buckle = k.std(0x9aa1a6, 0.3, 0.9), pad = k.std(0x2b2d2f, 0.9, 0), foam = k.std(0xf2f2ee, 0.95, 0);
  const trackTex = (() => { const c = document.createElement('canvas'); c.width = 64; c.height = 16; const g = c.getContext('2d'); g.fillStyle = '#c9ced2'; g.fillRect(0, 0, 64, 16); g.fillStyle = '#3a3d40'; for (let x = 4; x < 64; x += 16) { g.fillRect(x, 4, 8, 3); g.fillRect(x, 9, 8, 3); g.fillRect(x + 3, 4, 2, 8); } g.fillStyle = '#e3e7ea'; g.fillRect(0, 0, 64, 1.5); g.fillRect(0, 14.5, 64, 1.5); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; t.repeat.set(192 / 8, 1); t.anisotropy = 8; return new THREE.MeshStandardMaterial({ map: t, roughness: 0.35, metalness: 0.85 }); })();
  const L = 192, ROWS = [18, 42, 66], KINDS = ['Crated works and pallets', 'Sculpture on plinths', 'Large framed art'];
  let kind = 0, strapsOn = true, unit, straps;
  // a strap from the track, around the front of a load of width w and depth d at height y, with a ratchet in front
  const strap = (x, w, d, y) => { bx(straps, 0.12, 1.8, d + 1, strapM, x - 0.3, y, 0.6); bx(straps, 0.12, 1.8, d + 1, strapM, x + w + 0.2, y, 0.6); bx(straps, w + 0.6, 1.8, 0.12, strapM, x - 0.3, y, d + 1.5); bx(straps, 3, 2.4, 1.2, buckle, x + w / 2 - 1.5, y - 0.3, d + 1.6); for (const xx of [x - 1.2, x + w + 0.2]) bx(straps, 1, 2.6, 1.2, buckle, xx, y - 0.4, 0.6); };
  const make = () => {
    if (unit) root.remove(unit); objReset(); paintReset(12);
    unit = group(root); unit.userData.dyn = true; straps = group(unit); straps.userData.dyn = true; straps.visible = strapsOn;
    bx(unit, L + 24, 110, 6, wall, -12, 0, -6);
    for (const y of ROWS) bx(unit, L, 5, 0.4, trackTex, 0, y - 2.5, 0);
    const r = rng(31);
    if (kind === 0) {
      // crates of different sizes, a boxed pallet, all strapped at the nearest track row
      const loads = [[0, 30, 44, 34, 0], [36, 48, 40, 40, 1], [90, 24, 58, 20, 0], [120, 40, 30, 36, 0], [168, 22, 70, 16, 0]];
      for (const [x, w, h, d, pal] of loads) {
        if (pal) { bx(unit, w, 5, d, k.std(0xb08658, 0.85, 0), x, 0, 1); for (let q = 0; q < 2; q++) for (let c = 0; c < 2; c++) bx(unit, w / 2 - 0.5, 17, d - 2, k.std(0xc49a64, 0.85, 0), x + q * (w / 2) + 0.25, 5 + c * 17.2, 2); }
        else { bx(unit, w, h, d, k.std(0xc8a06a, 0.85, 0), x, 0, 1); for (const yy of [1, h - 3]) bx(unit, w + 0.4, 2.4, d + 0.4, k.std(0xa47c48, 0.85, 0), x - 0.2, yy, 0.8); bx(unit, 2.4, h, d + 0.5, k.std(0xa47c48, 0.85, 0), x + w / 2 - 1.2, 0, 0.75); }
        for (const y of ROWS) if (y < (pal ? 39 : h) - 2) strap(x, w, d, y - 0.9);
      }
    } else if (kind === 1) {
      // sculpture on plinths along the wall, a padded strap at the object and one at the plinth
      for (let i = 0; i < 6; i++) { const x = 4 + i * 31; museumObjects(THREE, unit, x, 0, 4, 26, 22, r, 60); bx(unit, 26 * 0.55 + 1, 1, 22 * 0.55 + 1, pad, x + 13 - (26 * 0.55 + 1) / 2, 7, 15 - (22 * 0.55 + 1) / 2); strap(x + 13 - 8, 16, 16, ROWS[0] - 0.9); }
    } else {
      // large framed works standing on foam blocks, leaning on padded bumpers, strapped at two rows
      let x = 2;
      while (x < L - 30) { const { m, fw, fh } = framed(THREE, r, 60, 40, 30); if (x + fw > L) break; bx(unit, fw, 3, 6, foam, x, 0, 1.5); const f = group(unit, x, 3, 2.6); f.rotation.x = -0.04; bx(f, fw, fh, 2.4, r() > 0.5 ? k.std(0xa6832f, 0.35, 0.7) : M.woodDark, 0, 0, 0); bx(f, fw - 3, fh - 3, 0.2, m, 1.5, 1.5, 2.4); for (const y of ROWS) if (y < fh - 4) strap(x, fw, 4.6, y - 0.9); x += fw + 5; }
    }
    unit.traverse(o => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; } });
    bake?.(unit); wake();
  };
  make();
  return {
    group: root, view: [0.35, 0.3, 1.4],
    finishes: [{ name: 'Galvanized', swatch: '#c9ced2', color: 0xc9ced2 }, { name: 'Black', swatch: '#2b2d2f', color: 0x2b2d2f }], setFinish: k.finisher(trackTex),
    actions: [
      { label: 'Securing', options: KINDS, get: () => kind, set: n => { kind = n; make(); refit?.(); } },
      { label: 'Straps', toggle: true, get: () => strapsOn, set: v => { strapsOn = v; straps.visible = v; wake(); } },
    ],
  };
});

/* ---------------- 29. bike storage ---------------- */
// a simple bike: wheels, frame tubes, bars and seat
function bikeMesh(THREE, k, color) {
  const { M, cyl, group } = k, g = group(null), tire = k.std(0x1b1c1e, 0.85, 0), frame = k.std(color, 0.4, 0.4), R = 13.5;
  for (const x of [-20, 20]) { const t = new THREE.Mesh(new THREE.TorusGeometry(R, 1.1, 8, 28), tire); t.position.set(x, R + 1, 0); g.add(t); cyl(g, 0.6, 3, M.chrome, x, R + 1, 0, 8, 'z'); }
  const tube = (x1, y1, x2, y2, r = 0.7) => { const len = Math.hypot(x2 - x1, y2 - y1), m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 8), frame); m.position.set((x1 + x2) / 2, (y1 + y2) / 2, 0); m.rotation.z = Math.atan2(y2 - y1, x2 - x1) - Math.PI / 2; g.add(m); };
  const hb = [-2, R + 1], sp = [-6, R + 17], hd = [14, R + 16];
  tube(-20, R + 1, hb[0], hb[1]); tube(-20, R + 1, sp[0], sp[1]); tube(hb[0], hb[1], sp[0], sp[1]); tube(sp[0], sp[1], hd[0], hd[1]); tube(hb[0], hb[1], hd[0], hd[1] - 2); tube(hd[0], hd[1], 20, R + 1);
  tube(hd[0], hd[1], hd[0] + 1, hd[1] + 5, 0.6); cyl(g, 0.6, 18, M.dark, hd[0] + 1, hd[1] + 5.5, 0, 8, 'z');
  tube(sp[0], sp[1], sp[0] - 1, sp[1] + 4, 0.5); const seat = new THREE.Mesh(new THREE.BoxGeometry(9, 1.5, 4), M.dark); seat.position.set(sp[0] - 1.5, sp[1] + 5, 0); g.add(seat);
  return g;
}
def('bike-storage', 'Bike Room Storage', 'Apartment and campus bike rooms: two-tier racks with lift-assist trays, vertical wall hooks, or floor racks, in a wire partition room', ({ THREE, tween, wake, bake, refit }) => {
  const k = kit(THREE), { M, bx, cyl, group } = k, root = new THREE.Group();
  const steel = k.std(0x3a3f44, 0.45, 0.45), cage = k.std(0x6b7378, 0.45, 0.6), r = rng(19);
  const colors = [0x2a4d7a, 0x8c1d2c, 0x2f5a3e, 0x1c1d1f, 0xd1621f, 0xc9ced2, 0x5e4a7a];
  let style = 0, walls = true, unit, trays = [];
  const make = () => {
    if (unit) root.remove(unit);
    unit = group(root); unit.userData.dyn = true; trays = [];
    const n = 6, pitch = 16, L = n * pitch + 10, D = 76, H = 96;
    if (style === 0) {
      // two-tier rack: lower bikes in floor channels, upper bikes on trays that pull out and tilt down
      for (const x of [0, L - 3]) { bx(unit, 3, 84, 3, steel, x, 0, 8); bx(unit, 3, 84, 3, steel, x, 0, 58); bx(unit, 3, 3, 56, steel, x, 81, 8); k.bar(unit, x + 1.5, 0, x + 1.5, 80, 34, 2.5, steel, 2.5); }
      bx(unit, L, 3, 3, steel, 0, 81, 8); bx(unit, L, 3, 3, steel, 0, 81, 58);
      for (let i = 0; i < n; i++) {
        const x = 6 + i * pitch;
        if (i % 2 === 0) { bx(unit, 4, 1.2, 68, M.steel, x - 2, 0, 4); const b = bikeMesh(THREE, k, colors[Math.floor(r() * colors.length)]); b.rotation.y = Math.PI / 2; b.position.set(x, 1.2, 38); unit.add(b); }
        else {
          // upper tray: pull it forward and it lowers to the floor for loading
          const t = group(unit, x, 72, 10); t.userData.dyn = true;
          bx(t, 4, 1.2, 64, M.steel, -2, 0, 0); bx(t, 5, 3, 1.2, M.steel, -2.5, 0, 62);
          const b = bikeMesh(THREE, k, colors[Math.floor(r() * colors.length)]); b.rotation.y = Math.PI / 2; b.position.set(0, 1.2, 32); t.add(b);
          t.userData.onClick = () => { t.userData.down = !t.userData.down; const d = t.userData.down; tween(t.position, 'z', d ? 44 : 10, 900); tween(t.rotation, 'x', d ? 0.95 : 0, 900); tween(t.position, 'y', d ? 44 : 72, 900); };
          trays.push(t);
        }
      }
    } else if (style === 1) {
      // vertical wall hooks, staggered up and down so handlebars clear
      bx(unit, L, 90, 1, k.std(0xe7e4dc, 0.9, 0), 0, 0, 0);
      bx(unit, L, 4, 2, steel, 0, 70, 1); bx(unit, L, 4, 2, steel, 0, 12, 1);
      for (let i = 0; i < n; i++) {
        const x = 8 + i * pitch, up = i % 2 ? 8 : 0;
        bx(unit, 1.2, 1.2, 7, M.chrome, x - 0.6, 78 + up, 1); bx(unit, 5, 1.2, 1, M.black, x - 2.5, 18 + up, 2.5);
        const b = bikeMesh(THREE, k, colors[Math.floor(r() * colors.length)]); b.rotation.set(0, Math.PI / 2, Math.PI / 2); b.position.set(x, 64 + up, 18); unit.add(b);
      }
    } else {
      // floor racks: wheel slots at alternating heights
      for (let i = 0; i < n; i++) {
        const x = 6 + i * pitch, hi = i % 2;
        bx(unit, 4, hi ? 14 : 8, 10, steel, x - 2, 0, hi ? 50 : 6); bx(unit, 1, 1, 60, steel, x - 0.5, 0.5, 6);
        const b = bikeMesh(THREE, k, colors[Math.floor(r() * colors.length)]); b.rotation.y = Math.PI / 2; b.position.set(x, 0, hi ? 42 : 34); unit.add(b);
      }
    }
    if (walls) {
      // wire partition bike room around the racks, with a door
      const X0 = -18, X1 = L + 18, Z1 = 118, WH = 120;
      const pnl = (w, x, z, rot) => { const g = group(unit, x, 0, z); g.rotation.y = rot; bx(g, w, 1.2, 1.2, cage, 0, 0, -0.6); bx(g, w, 1.2, 1.2, cage, 0, WH - 1.2, -0.6); const m = new THREE.Mesh(new THREE.PlaneGeometry(w - 1, WH - 2.4), k.meshMat(w, WH, 2)); m.position.set(w / 2, WH / 2, 0); g.add(m); };
      for (const [x, z] of [[X0, -4], [X1, -4], [X0, Z1], [X1, Z1]]) bx(unit, 2, WH, 2, cage, x - 1, 0, z - 1);
      pnl(X1 - X0, X0, -4, 0); pnl(Z1 + 4, X0, -4, -Math.PI / 2); pnl(Z1 + 4, X1, -4, -Math.PI / 2); pnl(X1 - X0 - 44, X0, Z1, 0); bx(unit, 2, WH, 2, cage, X1 - 44, 0, Z1 - 1);
      const door = group(unit, X1 - 42, 0, Z1);
      const dm = group(door); bx(dm, 40, 1.2, 1.2, cage, 0, 0, -0.6); bx(dm, 40, 1.2, 1.2, cage, 0, WH - 1.2, -0.6); bx(dm, 1.2, WH, 1.2, cage, 38.8, 0, -0.6); const m = new THREE.Mesh(new THREE.PlaneGeometry(38, WH - 2.4), k.meshMat(40, WH, 2)); m.position.set(20, WH / 2, 0); dm.add(m); bx(dm, 3, 5, 1.8, M.chrome, 35, 42, 0);
      door.userData.onClick = () => { door.userData.open = !door.userData.open; tween(door.rotation, 'y', door.userData.open ? -1.6 : 0, 700, 'out'); };
    }
    unit.traverse(o => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; } });
    bake?.(unit); wake();
  };
  make();
  return {
    group: root, view: [0.7, 0.55, 1.3], prompt: 'Tap an upper tray to lower it, or the door to open the room',
    finishes: [{ name: 'Dark gray', swatch: '#3a3f44', color: 0x3a3f44 }, { name: 'Black', swatch: '#1c1d1f', color: 0x1c1d1f }, { name: 'Silver', swatch: '#c3c7ca', color: 0xbfc4c7 }, { name: 'Blue', swatch: '#2a4d7a', color: 0x2a4d7a }], setFinish: k.finisher(steel),
    actions: [
      { label: 'Lower an upper tray', when: () => style === 0, run: () => { const t = trays[1] || trays[0]; t?.userData.onClick(); return t?.userData.down ? 'Raise the tray' : 'Lower an upper tray'; } },
      { label: 'Rack', options: ['Two-tier racks', 'Vertical wall hooks', 'Floor racks'], get: () => style, set: n => { style = n; make(); refit?.(); } },
      { label: 'Wire partition room', toggle: true, get: () => walls, set: v => { walls = v; make(); refit?.(); } },
    ],
  };
});

const SHORT = { 'four-post': '4-post', 'bin-shelving': 'Bin shelving', 'wire-shelving': 'Wire', library: 'Library', 'hd-mobile': 'Mobile', lockers: 'Lockers', 'evidence-lockers': 'Evidence', 'flat-files': 'Flat files', rotary: 'Rotary', 'museum-cabinet': 'Museum cabinet', 'art-screens': 'Art screens', 'pallet-rack': 'Pallet rack', mezzanine: 'Mezzanine', vlm: 'VLM', casework: 'Casework', 'wire-cage': 'Wire cage', athletic: 'Athletic', 'mail-sorter': 'Mail sorter', weapons: 'Weapons', 'tire-rack': 'Tire rack', 'wire-track': 'Wire on track', 'ss-table': 'Stainless tables', install: 'Install steps', 'hd-mobile-open': 'Mobile shelving', 'hd-mobile-tire': 'Mobile tires', 'hd-mobile-grow': 'Mobile grow racks', 'hd-mobile-flat': 'Mobile flat files', 'hd-mobile-museum': 'Mobile cabinets', 'hd-mobile-library': 'Mobile library', 'hd-mobile-textile': 'Mobile textiles', 'hd-mobile-art': 'Mobile art screens', 'hd-mobile-mezz': 'Two-level mobile', 'pallet-museum': 'Object rack, stationary', 'hd-mobile-artrack': 'Object rack, mobile', 'hd-mobile-wardrobe': 'Mobile wardrobes', 'hd-mobile-gear': 'Mobile athletic', 'hd-mobile-golf': 'Mobile golf', 'hd-mobile-instruments': 'Mobile instruments', 'hd-mobile-bins': 'Mobile painting bins', 'bike-storage': 'Bike rooms', 'painting-bins': 'Painting bins', 'four-post-solander': 'Solander boxes', workstation: 'Workstation', fireproof: 'Fireproof', 'wall-art': 'Stationary screens', 'textile-rack': 'Textile racks', 'hd-mobile-weapons': 'Mobile weapons', 'hd-mobile-pallet': 'Mobile pallet rack', wardrobe: 'Wardrobes', 'wall-etrack': 'Wall E-track' };
for (const [id, s] of Object.entries(SHORT)) if (MODELS[id]) MODELS[id].short = s;
