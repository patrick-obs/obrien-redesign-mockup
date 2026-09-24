// O'Brien 3D product models, built in code from typical dimensions (units: inches, y up, front = +z).
// Each model: MODELS[id] = { name, dims, build(ctx) -> { group, actions?, finishes?, setFinish? } }
// ctx: { THREE, tween(obj, key, to, ms), wake() }. Parts with userData.onClick react to clicks.
// Representative only: real configurations vary by manufacturer, size and accessories.

export const MODELS = {};
const def = (id, name, dims, build) => { MODELS[id] = { name, dims, build }; };

/* ---------------- shared kit ---------------- */
function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

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
  const finisher = (...mats) => (f) => { mats.forEach(mat => mat.color.setHex(f.color)); };
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
  return { M, bx, cyl, bar, group, grid, meshMat, many, FIN, finisher, std, postMat, tray, dim, inch };
}

const KRAFT = ['#b58a55', '#c49a64', '#a97d49', '#d1ab77', '#e4e1d6', '#ffffff'];
const BOOKS = ['#7c2d2d', '#2d4a7c', '#2f6b4f', '#a3782b', '#5a3d6e', '#1f1f1f', '#b5563a', '#35667a', '#8d8d86', '#c7b58f'];

/* four-post / closed steel shelving unit, min corner at origin, open face toward +z */
function shelving(k, parent, o) {
  const { M, bx, bar, group, many } = k;
  const { bays = 3, w = 36, d = 18, h = 84, shelves = 6, closed = false, paint = M.paint, contents = null, seed = 7, labels = false } = o;
  const post = o.postPaint || paint;
  const g = group(parent, o.x || 0, o.y || 0, o.z || 0), W = bays * w, r = rng(seed);
  for (let i = 0; i <= bays; i++) {
    const x = i * w, inner = i > 0 && i < bays;
    for (const zf of [0, d - 0.12]) {
      bx(g, inner ? 2.5 : 1.25, h, 0.12, paint, i === 0 ? 0 : i === bays ? W - 1.25 : x - 1.25, 0, zf);
      bx(g, 0.12, h, 1.25, post, i === bays ? W - 0.12 : x, 0, zf === 0 ? 0 : d - 1.25);
    }
    if (closed) bx(g, 0.05, h, d, paint, i === bays ? W - 0.05 : x, 0, 0);
  }
  if (closed) bx(g, W, h, 0.05, paint, 0, 0, 0);
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
      const top = si === ys.length - 1, gap = top ? 0 : ys[si + 1] - y - 2;
      if (!contents || top || gap < 6) continue;
      if (contents === 'boxes') {
        let x = x0 + 0.6; const bw = 12.25, bh = Math.min(10.25, gap - 0.5), bd = Math.min(15.25, d - 1.5);
        while (x + bw < x0 + w - 0.8) { if (r() > 0.18) items.push({ x, y: y + 0.06, z: d - bd - 0.5, w: bw, h: bh, d: bd, color: KRAFT[Math.floor(r() * 4)] }); x += bw + 0.3; }
      } else if (contents === 'bins') {
        let x = x0 + 0.5; const bw = 6.5, bh = Math.min(5, gap - 0.8), bd = d - 1.2;
        while (x + bw < x0 + w - 0.6) { items.push({ x, y: y + 0.06, z: 0.5, w: bw, h: bh, d: bd, color: '#2f6fb3' }); x += bw + 0.35; }
      } else if (contents === 'binders') {
        let x = x0 + 0.8;
        while (x < x0 + w - 3) { const t = 1.6 + r() * 1.4; if (r() > 0.12) items.push({ x, y: y + 0.06, z: d - 11.5, w: t - 0.15, h: Math.min(11.5, gap - 0.5), d: 10.5, color: BOOKS[Math.floor(r() * BOOKS.length)] }); x += t; }
      }
    }
  }
  if (contents) many(g, items, contents === 'bins' ? k.std(0xffffff, 0.35, 0) : M.kraft);
  g.userData.W = W; g.userData.D = d; g.userData.H = h; g.userData.ys = ys; g.userData.w = w; g.userData.bays = bays;
  return g;
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
def('four-post', '4-Post Steel Shelving', 'Three 36" W x 18" D x 84" H sections', ({ THREE, wake, bake }) => {
  const k = kit(THREE), root = new THREE.Group();
  const paint = k.std(0xbfc4c7, 0.5, 0.3), post = k.postMat(paint);
  let closed = true, shelves = 7, contents = true, dims = false, unit = null;
  const make = () => { if (unit) root.remove(unit); unit = shelving(k, root, { bays: 3, closed, shelves, paint, postPaint: post, labels: true, contents: contents ? 'boxes' : null }); if (dims) shelvingDims(k, unit); unit.traverse(o => { if (o.isMesh && !o.userData.noShadow) { o.castShadow = o.receiveShadow = true; } }); unit.userData.dyn = true; bake?.(unit); wake(); };
  make();
  return {
    group: root, finishes: k.FIN.shelving, setFinish: k.finisher(paint, post),
    actions: [
      { label: 'Open style', run: () => { closed = !closed; make(); return closed ? 'Open style' : 'Closed style'; } },
      { label: 'Shelves: 7', run: () => { shelves = shelves >= 8 ? 5 : shelves + 1; make(); return `Shelves: ${shelves}`; } },
      { label: 'Show dimensions', run: () => { dims = !dims; make(); return dims ? 'Hide dimensions' : 'Show dimensions'; } },
      { label: 'Hide boxes', run: () => { contents = !contents; make(); return contents ? 'Hide boxes' : 'Show boxes'; } },
    ],
  };
});

/* ---------------- 2. bin shelving ---------------- */
def('bin-shelving', 'Bin & Parts Shelving', 'Closed 36" W x 18" D x 84" H units with bins', ({ THREE }) => {
  const k = kit(THREE), root = new THREE.Group(), paint = k.std(0xbfc4c7, 0.5, 0.3);
  shelving(k, root, { bays: 3, closed: true, shelves: 8, paint, contents: 'bins' });
  return { group: root, finishes: k.FIN.shelving, setFinish: k.finisher(paint) };
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
    const SLOTS = 4, mw = 24, md = 48, mp = mw + 1, gaps = { f: 0 };
    const wheelM = k.std(0x8f969a, 0.4, 0.3);
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
        X1 = mw + 1; const X2 = X1 + SLOTS * mp;
        for (const ex of [0, X2]) { const u = unitAt(unit, ex, 0, 0, false, seed++, mw, md, tall); first = first || u; }
        for (let q = 0; q < SLOTS; q++) {
          if (q === gaps.f) continue;
          const u = unitAt(unit, X1 + q * mp, 0, 0, true, seed++, mw, md); u.userData.slot = q; u.userData.row = 'f';
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
  let hi = 2, si = 0, showBooks = true, dims = false, unit, books;
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
    bx(unit, 1, h + 1, D + 1.5, wood, -1, 0, -0.75); bx(unit, 1, h + 1, D + 1.5, wood, W, 0, -0.75);
    if (counter) bx(unit, W + 3, 1.25, D + 3, wood, -1.5, h, -1.5);
    else bx(unit, W + 2, 1, D + 1.5, wood, -1, h, -0.75);
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
      { label: 'Hide books', run: () => { showBooks = !showBooks; if (books) books.visible = showBooks; wake(); return showBooks ? 'Hide books' : 'Show books'; } },
    ],
  };
});

/* ---------------- 5. high-density mobile ---------------- */
// one model, six things it can carry; product and industry pages start it on the right one
const HD_KINDS = {
  shelving: { label: 'Storage: shelving', L: 108, d: 15, h: 84, N: 5, aisle: 36, cH: 5, panels: true },
  open: { label: 'Storage: open shelving', L: 144, d: 24, h: 96, N: 4, aisle: 42, cH: 6 },
  flat: { label: 'Storage: flat files', L: 100, d: 38, h: 50, N: 3, aisle: 40, cH: 6, panels: true },
  tire: { label: 'Storage: tire racks', L: 144, d: 28, h: 94, N: 3, aisle: 40, cH: 6 },
  grow: { label: 'Storage: grow racks', L: 144, d: 26, h: 96, N: 3, aisle: 36, cH: 6 },
  pallet: { label: 'Storage: pallet rack', L: 198, d: 42, h: 144, N: 3, aisle: 120, cH: 8, electricOnly: true },
};
const HD_ORDER = ['shelving', 'open', 'flat', 'tire', 'grow', 'pallet'];
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
function hdMobile(id, name, dims, start) {
  def(id, name, dims, ({ THREE, tween, wake, bake, refit }) => {
    const k = kit(THREE), { M, bx, cyl, group, many } = k, root = new THREE.Group();
    const paint = k.std(0xbfc4c7, 0.5, 0.3), panel = k.std(0x2c2f31, 0.45, 0.25), ff = k.std(0xeeefed, 0.45, 0.3);
    const up = k.std(0x1f4e8c, 0.45, 0.35), beam = k.std(0xe3671c, 0.45, 0.35);
    const oUp = k.std(0x2c3e3f, 0.5, 0.4), oUpP = k.postMat(oUp), oBeam = k.std(0xf2b705, 0.45, 0.3), deckM = k.std(0xa7adb1, 0.55, 0.4);
    const gWhite = k.std(0xf1f2f0, 0.4, 0.25), wire = k.meshMat(144, 26, 1.5, '#e9ecee', 0.6), trayM = k.std(0x1c1d1f, 0.7, 0.05), leaf = k.std(0xffffff, 0.7, 0), led = k.std(0xffffff, 0.3, 0, { emissive: 0xfff8e8, emissiveIntensity: 1.1 });
    const tBlue = k.std(0x1f5fb0, 0.45, 0.35), tBlueP = k.postMat(tBlue);
    const black = k.std(0x1c1e20, 0.45, 0.15), red = k.std(0xc4241c, 0.4, 0.1), go = k.std(0x39d353, 0.3, 0, { emissive: 0x1f8a33, emissiveIntensity: 0.9 }), stop = k.std(0xc92a2a, 0.35, 0.1, { emissive: 0x5a1414, emissiveIntensity: 0.5 });
    let kind = start, electric = false, open = 2, unit, ranges = [], C;

    const flatFace = (p, y0, z0, dir) => {
      for (let u = 0; u < 2; u++) {
        const x = u * 50; bx(p, 50, C.h, C.d, ff, x, y0, z0);
        const fz = dir > 0 ? z0 + C.d : z0 - 0.8;
        for (let i = 0; i < 15; i++) { const y = y0 + 0.4 + i * (C.h / 15); bx(p, 48.6, C.h / 15 - 0.35, 0.8, ff, x + 0.7, y, fz); bx(p, 20, 0.45, 0.8, M.chrome, x + 15, y + C.h / 15 - 1.4, dir > 0 ? fz + 0.8 : fz - 0.8); }
      }
    };
    const palletFace = (p, y0, z0, loads, r) => {
      const bw = 96, D = C.d;
      for (let i = 0; i <= 2; i++) { const x = i * (bw + 3); for (const z of [z0, z0 + D - 3]) bx(p, 3, C.h, 3, up, x, y0, z); for (let y = 6; y < C.h; y += 36) bx(p, 1.4, 1.4, D - 6, up, x + 0.8, y0 + y, z0 + 3); }
      for (let b = 0; b < 2; b++) {
        const x0 = b * (bw + 3) + 3;
        for (const lv of [0, 50, 100]) {
          if (lv) { bx(p, bw, 4.5, 1.8, beam, x0, y0 + lv, z0); bx(p, bw, 4.5, 1.8, beam, x0, y0 + lv, z0 + D - 1.8); }
          for (let q = 0; q < 2; q++) {
            const px = x0 + 3 + q * 46, py = y0 + lv + (lv ? 4.5 : 0);
            loads.push({ x: px, y: py, z: z0 + 1, w: 40, h: 5, d: D - 2, color: '#b08658' });
            const s = 1 + Math.floor(r() * 2);
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
      C = HD_KINDS[kind]; unit = group(root); unit.userData.dyn = true;
      if (C.electricOnly) electric = true;
      const { L, d, h, N, aisle, cH } = C, deck = 1.5, r = rng(9);
      const depths = [d + 1, ...Array(N).fill(2 * d + (kind === 'pallet' ? 3 : 1)), d + 1];
      const base = []; let acc = 0; for (const dd of depths) { base.push(acc); acc += dd + 0.5; }
      const total = acc + aisle;
      bx(unit, L + 14, deck, total + 8, k.std(0x8f969a, 0.8, 0.1), -4, 0, -4);
      for (const rx of [8, L / 2 - 10, L / 2 + 10, L - 8]) bx(unit, 1.2, 0.35, total + 8, M.steel, rx - 0.6, deck, -4);
      open = Math.min(open, N);
      const handleM = kind === 'grow' ? red : black;
      ranges = depths.map((dd, j) => {
        const g = group(unit, 0, deck + 0.35, 0), fixed = j === 0 || j === depths.length - 1, last = j === depths.length - 1;
        bx(g, L, cH, dd, M.dark, 0, 0, 0);
        const faces = fixed ? [[j === 0 ? 0.5 : 0.5, j === 0 ? 1 : -1]] : [[0.5, -1], [d + 1, 1]];
        if (kind === 'shelving') {
          if (!fixed || j === 0) shelving(k, g, { bays: 3, w: 36, d, h, closed: true, shelves: 7, paint, contents: 'boxes', seed: 3 + j, y: cH, z: fixed ? 0.5 : d + 1 });
          if (!fixed || last) { const back = shelving(k, g, { bays: 3, w: 36, d, h, closed: true, shelves: 7, paint, contents: 'boxes', seed: 30 + j, y: cH }); back.rotation.y = Math.PI; back.position.set(L, cH, fixed ? d + 0.5 : d); }
        } else if (kind === 'flat') {
          for (const [z, dir] of faces) flatFace(g, cH, z, dir);
        } else if (kind === 'pallet') {
          const loads = []; palletFace(g, cH, 0.5, loads, r); if (!fixed) palletFace(g, cH, d + 2.5, loads, r); many(g, loads, M.kraft);
        } else {
          const list = []; for (const [z, dir] of faces) frameFace(g, cH, z, dir, list, r);
          if (kind === 'open') many(g, list, M.kraft); else if (kind === 'tire') tireMesh(THREE, g, list); else plants(g, list);
        }
        if (C.panels) {
          bx(g, 1.6, h + cH + 1, dd - 0.3, panel, L, 0, 0.15); bx(g, 1.6, h + cH + 1, dd - 0.3, panel, -1.6, 0, 0.15);
          bx(g, 0.4, h - 10, 0.8, M.chrome, L + 1.6, 8, 0.4); bx(g, 0.4, h - 10, 0.8, M.chrome, L + 1.6, 8, dd - 1.2);
        } else if (kind === 'pallet') bx(g, 2, cH + 10, dd, panel, L + 2, 0, 0);
        else bx(g, 1.6, 34, dd - 0.3, kind === 'grow' ? gWhite : panel, L, 0, 0.15);
        if (!fixed) {
          const hy = kind === 'shelving' ? 50 : kind === 'flat' ? 34 : 26, ex = kind === 'pallet' ? L + 4 : L + 1.6;
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
          hub.visible = !electric; pad.visible = electric;
          hub.userData.dyn = pad.userData.dyn = true;
          g.userData.onClick = () => { open = open === j - 1 ? j : j - 1; move(); };
          g.userData.wheel = hub; g.userData.pad = pad;
        }
        g.userData.fixed = fixed;
        g.position.z = base[j] + (j > open ? aisle : 0);
        g.userData.base = base[j];
        return g;
      });
      unit.traverse(o => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; } });
      bake?.(unit); wake();
    };
    const move = () => ranges.forEach((g, j) => {
      if (g.userData.fixed) return;
      const to = g.userData.base + (j > open ? C.aisle : 0), dz = to - g.position.z; if (Math.abs(dz) < 0.1) return;
      // electric carriages ramp up and down smoothly; mechanical ones follow the handle
      const ms = electric ? 900 + Math.abs(dz) * (kind === 'pallet' ? 14 : 22) : 700 + Math.abs(dz) * 14;
      tween(g.position, 'z', to, ms);
      if (!electric) tween(g.userData.wheel.rotation, 'x', g.userData.wheel.rotation.x + dz * 0.16, ms);
    });
    make();
    return {
      group: root, view: [1.45, 0.62, 0.62],
      finishes: [{ name: 'Black', swatch: '#2c2f31', color: 0x2c2f31 }, { name: 'O\'Brien teal', swatch: '#0f7377', color: 0x0f7377 }, { name: 'Maple laminate', swatch: '#c79a66', color: 0xc79a66 }, { name: 'Light gray', swatch: '#c3c7ca', color: 0xbfc4c7 }, { name: 'Navy', swatch: '#2a3d5c', color: 0x2a3d5c }],
      setFinish: k.finisher(panel),
      actions: [
        { label: 'Open next aisle', run: () => { open = (open + 1) % (C.N + 1); move(); } },
        { label: 'Close all aisles', run: () => { open = C.N; move(); } },
        { label: 'Electric drive', when: () => !C.electricOnly, run: () => { if (C.electricOnly) return 'Electric only'; electric = !electric; ranges.forEach(g => { if (g.userData.fixed) return; g.userData.wheel.visible = !electric; g.userData.pad.visible = electric; }); return electric ? 'Mechanical assist' : 'Electric drive'; } },
        { label: HD_KINDS[start].label, run: () => { const was = HD_KINDS[kind].electricOnly; kind = HD_ORDER[(HD_ORDER.indexOf(kind) + 1) % HD_ORDER.length]; if (HD_KINDS[kind].electricOnly) electric = true; else if (was) electric = false; open = 1; make(); refit?.(); return HD_KINDS[kind].label; } },
      ],
    };
  });
}
hdMobile('hd-mobile', 'High-Density Mobile Storage', 'Mobile carriages on floor rails: shelving, open shelving, flat files, tire racks, grow racks or pallet rack', 'shelving');
hdMobile('hd-mobile-open', 'Mobile Open Shelving', 'Open-frame shelving with pick bins on mobile carriages', 'open');
hdMobile('hd-mobile-tire', 'Mobile Tire Storage', 'Tire racks on mobile carriages', 'tire');
hdMobile('hd-mobile-grow', 'Mobile Grow Racks', 'Lit grow racks on mobile carriages, one aisle for the whole room', 'grow');
hdMobile('hd-mobile-flat', 'Mobile Flat File Storage', 'Flat file cabinets on mobile carriages', 'flat');

/* ---------------- 6. lockers ---------------- */
def('lockers', 'Steel Lockers', '72" H lockers: one to four tiers, single or double door, base or legs, locks, plates, interiors', ({ THREE, tween, wake, bake }) => {
  const k = kit(THREE), { M, bx, cyl, group } = k, root = new THREE.Group();
  const paint = k.std(0xb5babd, 0.45, 0.35), brass = k.std(0xc9a227, 0.3, 0.8), plateM = k.std(0xd7dbde, 0.3, 0.85);
  const lit = k.std(0x39d353, 0.3, 0, { emissive: 0x1f8a33, emissiveIntensity: 0.8 });
  const LOCKS = ['handle', 'padlock', 'combo', 'keypad'], LOCKNAME = { handle: 'Lock: lift handle', padlock: 'Lock: padlock hasp', combo: 'Lock: built-in combination', keypad: 'Lock: digital keypad' };
  let tiers = 2, sloped = true, legs = false, double = false, lock = 'handle', numbers = false, interior = true, bank, doors = [];
  const numTex = {};
  const plate = (n) => {
    if (!numTex[n]) { const c = document.createElement('canvas'); c.width = 128; c.height = 64; const g = c.getContext('2d'); g.fillStyle = '#d7dbde'; g.fillRect(0, 0, 128, 64); g.fillStyle = '#1b1d1f'; g.font = 'bold 44px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(n), 64, 35); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; numTex[n] = new THREE.MeshStandardMaterial({ map: t, roughness: 0.35, metalness: 0.6 }); }
    return new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.3), numTex[n]);
  };
  const hardware = (door, dw, dh, right) => {
    const hx = right ? 1.6 : dw - 2.6, hy = dh / 2 - Math.min(6, dh / 3) / 2;
    if (lock === 'keypad') { bx(door, 1.8, 2.8, 0.5, M.black, right ? 1 : dw - 2.8, dh / 2 - 1, 0.35); bx(door, 1, 0.3, 0.1, lit, right ? 1.4 : dw - 2.4, dh / 2 + 1.4, 0.86); return; }
    if (lock === 'combo') { cyl(door, 1, 0.5, M.chrome, right ? 2.2 : dw - 2.2, dh / 2 + 1, 0.6, 24, 'z'); cyl(door, 0.8, 0.3, M.black, right ? 2.2 : dw - 2.2, dh / 2 + 1, 0.95, 24, 'z'); bx(door, 0.6, 3, 0.8, M.chrome, right ? 1.9 : dw - 2.5, dh / 2 - 3.2, 0.3); return; }
    bx(door, 1, Math.min(6, dh / 3), 0.9, M.chrome, hx, hy, 0.3);
    if (lock === 'padlock') { bx(door, 1.4, 1.7, 0.7, brass, hx - 0.2, hy + 0.4, 1.2); const s = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.13, 8, 16, Math.PI), M.chrome); s.position.set(hx + 0.5, hy + 2.1, 1.55); door.add(s); }
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
      const y0 = baseH + t * dh, x0 = i * w;
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
        const vents = tr >= 3 ? [dh - 3] : [dh - 5, 3 + 5 * 0.9];
        for (const vy of vents) for (let v = 0; v < (tr >= 3 ? 4 : 6); v++) bx(door, dw - 4.5, 0.3, 0.25, paint, 2.2, vy - v * 0.9, 0.3);
        if (!double || right) hardware(door, dw, dh, right);
        if (!right) {
          if (numbers) { const p = plate(num); p.position.set(dw / 2, tr >= 3 ? 2.2 : dh - 6.8, 0.37); door.add(p); }
          else bx(door, 2.2, 1, 0.1, M.label, dw / 2 - 1.1, tr >= 3 ? 1.5 : dh - 7.5, 0.36);
        }
        pivot.userData.onClick = () => { pivot.userData.open = !pivot.userData.open; tween(pivot.rotation, 'y', pivot.userData.open ? (right ? 1.9 : -1.9) : 0, 650, 'out'); };
        pivot.userData.right = right;
        doors.push(pivot);
      }
      num++;
    }
    const bench = group(bank, 4, 0, 30);
    bx(bench, 40, 1.5, 9.5, k.std(0xc79a66, 0.65, 0), 0, 16, 0);
    for (const x of [3, 34]) bx(bench, 3, 16, 3, M.dark, x, 0, 3.2);
    bank.traverse(o => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; } }); bank.userData.dyn = true; bake?.(bank); wake();
  };
  make();
  return {
    group: root, finishes: k.FIN.lockers, setFinish: k.finisher(paint),
    actions: [
      { label: 'Open all doors', run: () => { const o = !doors.every(p => p.userData.open); doors.forEach((p, i) => { p.userData.open = o; setTimeout(() => tween(p.rotation, 'y', o ? (p.userData.right ? 1.9 : -1.9) : 0, 650, 'out'), i * 40); }); return o ? 'Close all doors' : 'Open all doors'; } },
      { label: 'Tiers: 2', run: () => { tiers = tiers % 4 + 1; if (double && tiers > 2) tiers = 1; make(); return `Tiers: ${double ? Math.min(tiers, 2) : tiers}`; } },
      { label: 'Double door', run: () => { double = !double; make(); return double ? 'Single door' : 'Double door'; } },
      { label: LOCKNAME.handle, run: () => { lock = LOCKS[(LOCKS.indexOf(lock) + 1) % LOCKS.length]; make(); return LOCKNAME[lock]; } },
      { label: 'Number plates', run: () => { numbers = !numbers; make(); return numbers ? 'Plain labels' : 'Number plates'; } },
      { label: 'Empty inside', run: () => { interior = !interior; make(); return interior ? 'Empty inside' : 'Hooks and shelf'; } },
      { label: 'On legs', run: () => { legs = !legs; make(); return legs ? 'Closed base' : 'On legs'; } },
      { label: 'Flat top', run: () => { sloped = !sloped; make(); return sloped ? 'Flat top' : 'Sloped top'; } },
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
def('flat-files', 'Flat File Cabinets', 'Two stacked 5-drawer units, 50" W x 38" D', ({ THREE, tween }) => {
  const k = kit(THREE), { M, bx, group } = k, root = new THREE.Group();
  const slide = k.std(0xc9ced2, 0.25, 0.9);
  const paint = k.std(0xeeefed, 0.45, 0.3), inner = k.std(0xd7dada, 0.5, 0.3), paper = [M.white, k.std(0xf1ede2, 0.85, 0), k.std(0xe6ecef, 0.85, 0)];
  const W = 50, D = 38, uh = 16.5, base = 4, r = rng(3);
  bx(root, W - 2, base, D - 3, M.dark, 1, 0, 1);
  const drawers = [];
  for (let u = 0; u < 2; u++) {
    const y0 = base + u * (uh + 0.3);
    bx(root, W, 0.6, D, paint, 0, y0 + uh - 0.6, 0); bx(root, W, 0.4, D, paint, 0, y0, 0);
    bx(root, 0.6, uh, D, paint, 0, y0, 0); bx(root, 0.6, uh, D, paint, W - 0.6, y0, 0); bx(root, W, uh, 0.4, paint, 0, y0, 0);
    for (let i = 0; i < 5; i++) {
      // open-top drawer: front, floor, sides, back and a rear hood, with loose sheets inside
      const dy = y0 + 0.5 + i * 3.1, dr = group(root, 0, 0, 0), mid = group(root, 0, 0, 0), iw = W - 3, id = D - 2.8, ih = 2.2;
      // full-extension slides: cabinet member fixed, middle member travels half, drawer member rides the box
      for (const [x0, x1, x2] of [[0.6, 0.92, 1.2], [W - 0.9, W - 1.17, W - 1.5]]) {
        bx(root, 0.3, 1, D - 2, slide, x0, dy + 0.75, 0.5);
        bx(mid, 0.25, 0.8, D - 5, slide, x1, dy + 0.85, 1.5);
        bx(dr, 0.3, 0.9, id - 1.5, slide, x2, dy + 0.8, 2);
      }
      bx(dr, W - 1.6, 2.9, 0.8, paint, 0.8, dy, D - 0.8);
      bx(dr, iw, 0.12, id, inner, 1.5, dy + 0.1, 1);
      bx(dr, 0.15, ih, id, inner, 1.5, dy + 0.1, 1); bx(dr, 0.15, ih, id, inner, 1.5 + iw - 0.15, dy + 0.1, 1);
      bx(dr, iw, ih, 0.15, inner, 1.5, dy + 0.1, 1);
      bx(dr, iw, 0.1, 5, inner, 1.5, dy + ih, 1);
      const sheets = 3 + Math.floor(r() * 6);
      for (let s = 0; s < sheets; s++) bx(dr, 36 - r() * 6, 0.05, 24 - r() * 4, paper[s % 3], 5 + r() * 2, dy + 0.25 + s * 0.09, 7 + r() * 2);
      bx(dr, 22, 0.5, 0.9, M.chrome, W / 2 - 11, dy + 1.9, D);
      bx(dr, 3, 1.3, 0.1, M.label, W / 2 - 1.5, dy + 0.4, D + 0.02);
      dr.userData.onClick = () => { dr.userData.open = !dr.userData.open; const o = dr.userData.open; tween(dr.position, 'z', o ? 28 : 0, 700, 'out'); tween(mid.position, 'z', o ? 14 : 0, 700, 'out'); };
      drawers.push(dr);
    }
  }
  return {
    group: root, view: [0.7, 0.9, 1.2], finishes: k.FIN.cabinets, setFinish: k.finisher(paint),
    actions: [{ label: 'Open a drawer', run: () => { const dr = drawers[7]; dr.userData.onClick(); return dr.userData.open ? 'Close the drawer' : 'Open a drawer'; } }],
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
  for (const y of [y0 + 42, y0 + 54, y0 + 66]) {
    bx(root, W - 2, 0.6, D - 4, paint, 1, y, 1.5); bx(root, W - 2, 1.4, 0.4, paint, 1, y - 0.8, D - 2.9);
    let x = 3;
    while (x < W - 9) {
      if (r() < 0.45) { const rr = 1.8 + r() * 2.4, ph = 4 + r() * 5; cyl(root, rr, ph, things[Math.floor(r() * 5)], x + rr, y + 0.6 + ph / 2, 8 + r() * 12, 20); x += rr * 2 + 2.5; }
      else { const bw = 6 + r() * 7; bx(root, bw, 3 + r() * 5, 8 + r() * 8, r() > 0.5 ? boxMat : things[Math.floor(r() * 5)], x, y + 0.6, 5); x += bw + 2; }
    }
  }
  const drawers = [];
  for (let i = 0; i < 6; i++) {
    const y = y0 + 1.6 + i * 6.3, dr = group(root);
    k.tray(dr, W - 5, 3.6, D - 5, tray, 2.5, y + 0.3, 1.5, 0.2);
    bx(dr, W - 4, 5.9, 0.6, paint, 2, y, D - 3.4);
    bx(dr, 3.6, 2, 0.15, plate, W / 2 - 1.8, y + 3.2, D - 2.8); bx(dr, 3, 1.4, 0.05, M.label, W / 2 - 1.5, y + 3.5, D - 2.62);
    bx(dr, 8, 0.7, 0.6, plate, W / 2 - 4, y + 1.2, D - 2.8);
    for (let q = 0; q < 4; q++) bx(dr, 8, 1.4, 7, M.white, 5 + q * 10, y + 0.55, 4 + (q % 2) * 10);
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
  const white = k.std(0xf3f4f2, 0.45, 0.25), rail = k.std(0xdfe2e0, 0.4, 0.6), mesh = k.meshMat(96, 96, 2, '#fbfbf9', 0.2);
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
        const fw = Math.min(14 + r() * 22, Ls - 4 - z), fh = 16 + r() * 30, y = 14 + r() * (H - fh - 24);
        if (fw < 10) break;
        bx(s, 1.6, fh, fw, r() > 0.5 ? gilt : M.woodDark, face > 0 ? 0.3 : -1.9, y, z);
        bx(s, 0.2, fh - 3, fw - 3, art[Math.floor(r() * art.length)], face > 0 ? 1.9 : -2.1, y + 1.5, z + 1.5);
        z += fw + 4 + r() * 6;
      }
    }
    s.userData.onClick = () => { s.userData.out = !s.userData.out; tween(s.position, 'z', home + (s.userData.out ? -bank * (A - 8) : 0), 1300); };
    screens.push(s);
  });
  return { group: root, view: [1.25, 0.8, 0.75], actions: [{ label: 'Pull out a screen', run: () => { screens[2].userData.onClick(); return screens[2].userData.out ? 'Slide it back' : 'Pull out a screen'; } }] };
});

/* ---------------- 11. pallet rack ---------------- */
def('pallet-rack', 'Selective Pallet Rack', 'Two 96" bays, 42" deep frames, 16 ft uprights', ({ THREE, wake }) => {
  const k = kit(THREE), { M, bx, bar, group, many } = k, root = new THREE.Group();
  const up = k.std(0x1f4e8c, 0.45, 0.35), beam = k.std(0xe3671c, 0.45, 0.35), bays = 2, bw = 96, D = 42, H = 192, r = rng(4);
  const levels = [0, 60, 120];
  for (let i = 0; i <= bays; i++) {
    const x = i * (bw + 3);
    for (const z of [0, D - 3]) bx(root, 3, H, 3, up, x, 0, z);
    const f = group(root, x + 1.5, 0, 0);
    for (let y = 6, n = 0; y < H - 30; y += 36, n++) { const z1 = n % 2 ? 3 : D - 3, z2 = n % 2 ? D - 3 : 3; const b = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.4, Math.hypot(D - 6, 36)), up); b.position.set(0, y + 18, (z1 + z2) / 2); b.rotation.x = Math.atan2(z2 - z1, 36) * (n % 2 ? 1 : -1); f.add(b); }
    for (let y = 6; y < H; y += 36) bx(f, 1.4, 1.4, D - 6, up, -0.7, y, 3);
    bx(root, 7, 0.5, 7, M.steel, x - 2, 0, -2); bx(root, 7, 0.5, 7, M.steel, x - 2, 0, D - 5);
  }
  const loads = [];
  for (let b = 0; b < bays; b++) {
    const x0 = b * (bw + 3) + 3;
    for (const y of levels) {
      if (y > 0) { bx(root, bw, 4.5, 1.8, beam, x0, y, 0); bx(root, bw, 4.5, 1.8, beam, x0, y, D - 1.8); const deck = new THREE.Mesh(new THREE.PlaneGeometry(bw, D - 2), k.meshMat(bw, D, 2.5, '#b9c0c4')); deck.rotation.x = -Math.PI / 2; deck.position.set(x0 + bw / 2, y + 4.6, D / 2); root.add(deck); }
      for (let p = 0; p < 2; p++) {
        const px = x0 + 3 + p * 46, py = y + (y ? 4.6 : 0);
        for (let s = 0; s < 3; s++) loads.push({ x: px, y: py, z: 1 + s * 18.5, w: 40, h: 5, d: 3.5, color: '#b08658' });
        loads.push({ x: px, y: py + 5, z: 1, w: 40, h: 0.8, d: 40, color: '#c49a6a' });
        const stack = 1 + Math.floor(r() * 2);
        for (let c = 0; c < stack; c++) for (let q = 0; q < 2; q++) if (r() > 0.1) loads.push({ x: px + 1 + q * 19.5, y: py + 5.8 + c * 20, z: 2, w: 18.5, h: 19, d: 36, color: KRAFT[Math.floor(r() * 4)] });
      }
    }
  }
  const lm = many(root, loads, M.kraft);
  const guard = group(root); guard.userData.dyn = true;
  const yel = k.std(0xf2c230, 0.5, 0.2), blk = k.std(0x1a1a1a, 0.6, 0.1), endX = bays * (bw + 3) + 3;
  for (let i = 0; i <= bays; i++) { const x = i * (bw + 3); bx(guard, 5, 18, 4.6, yel, x - 1, 0, D - 3.6); for (const y of [4, 11]) bx(guard, 5.2, 2.4, 4.8, blk, x - 1.1, y, D - 3.7); }
  for (const x of [-9, endX + 5]) { for (const z of [-3, D - 1]) bx(guard, 4, 16, 4, yel, x, 0, z); bx(guard, 3, 6, D + 6, yel, x + 0.5, 8, -3); bx(guard, 3.1, 1.4, D + 6.1, blk, x + 0.45, 10, -3.05); }
  return { group: root, actions: [{ label: 'Hide post protectors', run: () => { guard.visible = !guard.visible; wake(); return guard.visible ? 'Hide post protectors' : 'Show post protectors'; } }, { label: 'Hide loads', run: () => { lm.visible = !lm.visible; wake(); return lm.visible ? 'Hide loads' : 'Show loads'; } }] };
});

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
  for (const x of [0, 40]) { const s = bar(st, 0, 0, 0, 0, 0, 1, steel); s.scale.set(Math.hypot(steps * run, H), 10, 1.5); s.position.set(x + 0.75, H / 2, (steps * run) / 2); s.rotation.set(0, Math.PI / 2, Math.atan2(H, steps * run)); }
  for (let i = 0; i < steps; i++) bx(st, 40, 1.2, run + 1, k.std(0x5d6468, 0.8, 0.3), 0, H - (i + 1) * rise, i * run);
  for (const x of [-1, 41]) { const hr = bar(st, 0, 0, 0, 0, 0, 1.6, rail); hr.scale.set(Math.hypot(steps * run, H), 1.6, 1.6); hr.position.set(x, H / 2 + 36, (steps * run) / 2); hr.rotation.set(0, Math.PI / 2, Math.atan2(H, steps * run)); }
  const under = group(root, 20, 0, 20); under.userData.dyn = true;
  shelving(k, under, { bays: 4, closed: false, shelves: 5, h: 84, contents: 'boxes', seed: 21 });
  shelving(k, under, { bays: 4, closed: false, shelves: 5, h: 84, contents: 'boxes', seed: 22, z: 70 });
  return { group: root, actions: [{ label: 'Hide shelving below', run: () => { under.visible = !under.visible; wake(); return under.visible ? 'Hide shelving below' : 'Show shelving below'; } }] };
});

/* ---------------- 13. vertical lift module ---------------- */
def('vlm', 'Vertical Lift Module (VLM)', 'About 10 ft W x 9 ft D x 15 ft H, one bay or two stacked bays', ({ THREE, tween, wake, bake, panel }) => {
  const k = kit(THREE), { M, bx, cyl, group, many } = k, root = new THREE.Group();
  const shell = k.std(0xf2f3f1, 0.4, 0.2), trim = k.std(0xd9dcda, 0.45, 0.3), itemMat = k.std(0xffffff, 0.45, 0.05);
  const lightM = k.std(0xfff6d5, 0.3, 0, { emissive: 0xfff2c4, emissiveIntensity: 0.9 });
  const curtainM = k.std(0xc92a2a, 0.3, 0, { emissive: 0xc92a2a, emissiveIntensity: 0.9 }), ledM = k.std(0x39d353, 0.3, 0, { emissive: 0x39d353, emissiveIntensity: 1.2 }), band = k.std(0x4a5055, 0.5, 0.3);
  const tabletM = k.std(0x2a6f97, 0.2, 0.1, { emissive: 0x1b4f70, emissiveIntensity: 0.8 });
  const W = 118, D = 108, H = 180, TW = W - 18, TD = 30, bayH = 22, trayX = 9, r = rng(8);
  const zRear = 4, zLift = zRear + TD + 4, zFront = zLift + TD + 4, zBay = D - TD - 1;
  const bins = ['#2f6fb3', '#c92a2a', '#e0a526', '#7a8288', '#2f9e44'];
  const fill = (list, x0, y, z, span) => { let x = x0 + 2; while (x < x0 + span - 6) { const bw = 6 + Math.floor(r() * 3) * 4; if (r() > 0.25) list.push({ x, y, z: z + 2, w: bw - 0.5, h: 2 + r() * 3.5, d: TD - 4, color: bins[Math.floor(r() * 5)] }); x += bw; } };
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
  let nBays = 1, unit, lift, trays = [], bays = [], pulleys = [], chain = Promise.resolve(), ui = null;
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
    bay.seg.position.x = 12 + Math.random() * (W - 32); bay.seg.visible = true; wake();
    show(tag(t), `Ready at bay ${bays.indexOf(bay) + 1}: pick 3`);
  };
  const store = async (t) => {
    const bay = t.userData.at; if (!bay) return;
    bay.seg.visible = false; show(tag(t), 'Returning to storage');
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
    const bayYs = nBays === 1 ? [34] : [30, 66], topOpen = bayYs[bayYs.length - 1] + bayH;
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
      y0 = y + bayH + 3;
    }
    bx(unit, W, H - y0, 1, shell, 0, y0, D - 1);
    bx(unit, W, 12, 1.2, band, 0, H - 14, D - 0.6); bx(unit, W, 3, 1.2, band, 0, 3, D - 0.6);
    // monitor centered over the top bay
    bx(unit, 28, 15, 1.2, M.black, W / 2 - 14, topOpen + 8, D);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(26, 13), screenM); scr.position.set(W / 2, topOpen + 15.5, D + 1.25); unit.add(scr);
    // operator console on an arm off the right side of the bay
    const arm = group(unit, W - 3, bayYs[0] + 14, D - 2);
    bx(arm, 12, 1.6, 1.6, M.dark, 0, 0, 0); bx(arm, 1.6, 1.6, 8, M.dark, 10.4, 0, 0);
    const tab = group(arm, 11.2, 1.6, 8); tab.rotation.x = -0.45; tab.userData.onClick = () => openConsole();
    bx(tab, 14, 10, 1.2, M.black, -7, 0, -0.6); bx(tab, 12.4, 8.4, 0.2, tabletM, -6.2, 0.8, 0.62);
    // tray columns: rear runs full height, front starts above the top bay; the lift rides between them
    const levels = []; for (let y = 10; y < H - 14; y += 8.5) levels.push(y);
    const mk = (y, z) => {
      const t = group(unit, 0, y, z);
      bx(t, TW, 0.8, TD, M.steel, trayX, 0, 0); bx(t, TW, 2.4, 0.6, M.steel, trayX, 0, TD - 0.6); bx(t, TW, 2.4, 0.6, M.steel, trayX, 0, 0); bx(t, 0.6, 2.4, TD, M.steel, trayX, 0, 0); bx(t, 0.6, 2.4, TD, M.steel, trayX + TW - 0.6, 0, 0);
      const it = []; fill(it, trayX, 0.8, 0, TW); many(t, it, itemMat);
      t.userData.home = { y, z }; t.userData.n = trays.length + 1; t.userData.at = null; t.userData.busy = false;
      t.userData.onClick = () => request(t);
      trays.push(t);
    };
    for (const y of levels) { mk(y, zRear); if (y > topOpen + 12) mk(y, zFront); }
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
  // operator console: a generic picking screen that drives the model
  const ITEMS = [
    { pn: 'BRG-6204', d: 'Ball bearing, 20 mm bore', tray: 3, loc: 'A2', qty: 4, oh: 38 },
    { pn: 'FLT-1180', d: 'Hydraulic return filter', tray: 7, loc: 'C1', qty: 1, oh: 6 },
    { pn: 'ORG-0212', d: 'O-ring kit, nitrile', tray: 12, loc: 'B4', qty: 2, oh: 15 },
    { pn: 'FUS-30A', d: 'Cartridge fuse, 30 A', tray: 5, loc: 'D3', qty: 6, oh: 120 },
    { pn: 'BLT-A42', d: 'V-belt, A42', tray: 18, loc: 'A1', qty: 1, oh: 9 },
    { pn: 'SNS-PX12', d: 'Proximity sensor, 12 mm', tray: 9, loc: 'B2', qty: 2, oh: 11 },
    { pn: 'GSK-DN50', d: 'Flange gasket, DN50', tray: 21, loc: 'C3', qty: 3, oh: 44 },
    { pn: 'SCR-M6-20', d: 'Cap screws, M6 x 20, box of 100', tray: 14, loc: 'A4', qty: 1, oh: 7 },
  ];
  const order = [0, 2, 4].map(i => ({ ...ITEMS[i], done: false }));
  let view = 'pick', line = 0, q = '';
  const pad = n => String(n).padStart(2, '0'), esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const trayN = n => trays.find(t => t.userData.n === n);
  const state = t => (t.userData.busy ? 'moving' : t.userData.at ? 'bay' : 'stored');
  const html = () => {
    const nav = [['pick', 'Picking'], ['inv', 'Inventory'], ['trays', 'Trays']].map(([v, l]) => '<button type="button" data-act="tab" data-v="' + v + '" class="' + (view === v ? 'on' : '') + '">' + l + '</button>').join('');
    const top = '<div class="c-top"><b>Operator console</b><span>' + bays.map((b, i) => 'Bay ' + (i + 1) + ': ' + (b.tray ? 'tray ' + pad(b.tray.userData.n) : 'empty')).join(' &middot; ') + '</span></div><div class="c-nav">' + nav + '</div>';
    if (view === 'inv') {
      const rows = ITEMS.filter(it => !q || (it.pn + ' ' + it.d).toLowerCase().includes(q.toLowerCase())).map(it => '<tr><td><b>' + it.pn + '</b><br>' + it.d + '</td><td>Tray ' + pad(it.tray) + '<br>' + it.loc + '</td><td>' + it.oh + ' on hand</td><td><button type="button" data-act="call" data-v="' + it.tray + '">Call</button></td></tr>').join('');
      return top + '<input name="q" autocomplete="off" placeholder="Search part number or description" value="' + esc(q) + '"><table>' + (rows || '<tr><td>No matches</td></tr>') + '</table>';
    }
    if (view === 'trays') return top + '<div class="c-grid">' + trays.map(t => '<button type="button" data-act="' + (t.userData.at ? 'ret' : 'call') + '" data-v="' + t.userData.n + '" class="c-t c-' + state(t) + '">' + pad(t.userData.n) + '</button>').join('') + '</div><p class="c-note">Tap a stored tray to call it. Tap a tray at the bay to send it back.</p>';
    const done = order.every(o => o.done), cur = order[line], at = trayN(cur.tray)?.userData.at;
    const card = done
      ? '<div class="c-big">Order complete</div><div class="c-row"><button type="button" data-act="retall">Return trays</button><button type="button" data-act="reset" class="ghost">Run the order again</button></div>'
      : '<div class="c-big">' + cur.pn + '</div><div>' + cur.d + '</div><div class="c-loc">Tray ' + pad(cur.tray) + ' &middot; compartment ' + cur.loc + '</div><div class="c-qty">Pick <b>' + cur.qty + '</b></div><div class="c-row"><button type="button" data-act="call" data-v="' + cur.tray + '"' + (at ? ' disabled' : '') + '>' + (at ? 'Tray ' + pad(cur.tray) + ' is at the bay' : 'Call tray ' + pad(cur.tray)) + '</button><button type="button" data-act="pick"' + (at ? '' : ' disabled') + '>Confirm pick</button></div>';
    return top + '<div class="c-card"><div class="c-sub">Order 24-1187 &middot; line ' + (done ? order.length : line + 1) + ' of ' + order.length + '</div>' + card + '</div><ol class="c-lines">' + order.map((o, i) => '<li class="' + (o.done ? 'done' : !done && i === line ? 'cur' : '') + '">' + o.pn + ' &middot; tray ' + pad(o.tray) + ' &middot; qty ' + o.qty + '</li>').join('') + '</ol>';
  };
  const openConsole = () => panel?.((el) => {
    const draw = () => { el.innerHTML = html(); };
    ui = draw; draw();
    el.addEventListener('click', e => {
      const b = e.target.closest('[data-act]'); if (!b || b.disabled) return;
      const a = b.dataset.act, v = +b.dataset.v, t = trayN(v);
      if (a === 'tab') view = b.dataset.v;
      if (a === 'call' && t && !t.userData.at) request(t);
      if (a === 'ret' && t && t.userData.at) request(t);
      if (a === 'pick') { order[line].done = true; if (line < order.length - 1) line++; }
      if (a === 'retall') bays.forEach(bb => bb.tray && request(bb.tray));
      if (a === 'reset') { order.forEach(o => { o.done = false; }); line = 0; }
      draw();
    });
    el.addEventListener('input', e => { if (e.target.name !== 'q') return; q = e.target.value; const pos = e.target.selectionStart; draw(); const i = el.querySelector('input[name=q]'); i.focus(); i.setSelectionRange(pos, pos); });
    return () => { ui = null; };
  });
  make();
  const idle = () => !trays.some(t => t.userData.busy);
  return {
    group: root, view: [1.25, 0.5, 0.95],
    actions: [
      { label: 'Open the operator console', run: () => { openConsole(); } },
      { label: 'Call a tray', run: () => { const free = trays.filter(t => !t.userData.at && !t.userData.busy); if (free.length) request(free[Math.floor(Math.random() * free.length)]); } },
      { label: 'Return all trays', run: () => { bays.forEach(b => b.tray && request(b.tray)); } },
      { label: 'Two bays', run: () => { if (idle()) { nBays = 3 - nBays; make(); } return nBays === 2 ? 'Single bay' : 'Two bays'; } },
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
        if (i % 3 === 0) { const hm = new THREE.Mesh(new THREE.SphereGeometry(5, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.62), team); hm.position.set(6, 53, z + 0.25); unit.add(hm); }
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
  const paint = k.std(0x2c2f31, 0.45, 0.35), team = k.std(0x8c1d2c, 0.4, 0.1), jersey = k.std(0xf2f2ee, 0.85, 0), pads = k.std(0x2f3336, 0.7, 0.05), mesh = k.meshMat(24, 50, 0.6, '#b9bec1', 0.6);
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
    cyl(root, 0.5, iw, M.chrome, x0 + iw / 2, 54, d / 2, 16, 'x');
    bx(root, 16, 22, 0.8, jersey, x0 + (iw - 16) / 2, 31, d / 2 + 2);
    bx(root, 6, 3, 0.9, team, x0 + (iw - 6) / 2, 44, d / 2 + 2.4);
    bx(root, 2, 2, 6, M.chrome, x0 + iw / 2 - 1, 48, 0.6);
    bx(root, 16, 6, 9, pads, x0 + (iw - 16) / 2, 42, 2);
    // helmet shelf with a helmet
    bx(root, iw, 0.4, d - 2, paint, x0, 58, 0.6);
    const helm = new THREE.Mesh(new THREE.SphereGeometry(5, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.62), team); helm.position.set(x0 + iw / 2, 58.4 + 1.6, 12); root.add(helm);
    bx(root, 6, 0.6, 0.6, M.white, x0 + iw / 2 - 3, 60, 17.2); bx(root, 0.6, 3, 0.6, M.white, x0 + iw / 2 - 0.3, 58.6, 17.2);
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
    const h = home(i), e = group(root, h.x, h.y, h.z); bx(e, pw - 1.4, 0.1, 9.5, env[i % 3], 0, 0, 0); e.rotation.y = (r() - 0.5) * 0.2;
    letters.push(e); slots.push({ x: Math.floor(r() * cols) * pw + 0.7, y: y0 + Math.floor(r() * rows) * ph + 0.9, z: 2.5 });
  }
  let sorted = false, busy = false;
  const sort = async () => {
    if (busy) return; busy = true; sorted = !sorted;
    for (let i = 0; i < letters.length; i++) {
      const e = letters[i], to = sorted ? slots[i] : home(i);
      tween(e.rotation, 'y', sorted ? 0 : (i % 3 - 1) * 0.07, 420);
      await Promise.all([tween(e.position, 'x', to.x, 420), tween(e.position, 'y', to.y, 420), tween(e.position, 'z', to.z, 420, 'out')]);
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
def('wall-art', 'Wall-Mounted Art Screens', 'White mesh panels on the wall: fixed on standoffs, or hinged to swing out like pages', ({ THREE, tween, wake }) => {
  const k = kit(THREE), { M, bx, cyl, group } = k, root = new THREE.Group();
  const white = k.std(0xf3f4f2, 0.45, 0.25), wall = k.std(0xe9e6df, 0.9, 0), gilt = k.std(0xa6832f, 0.35, 0.7), mesh = k.meshMat(48, 96, 2, '#fbfbf9', 0.2);
  const art = ['#8c3b2f', '#2f4f6f', '#c9a227', '#3d6b4f', '#b56f4a', '#5e4a7a', '#244a5a'].map(c => k.std(c, 0.8, 0));
  const PW = 48, PH = 96, r = rng(23);
  bx(root, 190, 120, 6, wall, -10, 0, -6);
  // frames stay inside the panel: width and height are clipped to the panel edges
  const hang = (g, face) => {
    let x = 3;
    while (x < PW - 14) {
      const fw = Math.min(12 + r() * 20, PW - 3 - x), fh = 14 + r() * 26, y = 10 + r() * (PH - fh - 20);
      if (fw < 10) break;
      bx(g, fw, fh, 1.6, r() > 0.5 ? gilt : M.woodDark, x, y, face > 0 ? 0.4 : -2);
      bx(g, fw - 3, fh - 3, 0.2, art[Math.floor(r() * art.length)], x + 1.5, y + 1.5, face > 0 ? 2 : -2.2);
      x += fw + 3 + r() * 4;
    }
  };
  const panel = (parent, both) => {
    const g = group(parent);
    bx(g, PW, 1.5, 1.5, white, 0, 0, -0.75); bx(g, PW, 1.5, 1.5, white, 0, PH - 1.5, -0.75); bx(g, 1.5, PH, 1.5, white, 0, 0, -0.75); bx(g, 1.5, PH, 1.5, white, PW - 1.5, 0, -0.75);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(PW - 3, PH - 3), mesh); m.position.set(PW / 2, PH / 2, 0); g.add(m);
    hang(g, 1); if (both) hang(g, -1);
    return g;
  };
  const fixed = group(root); fixed.userData.dyn = true;
  for (let i = 0; i < 3; i++) {
    const p = panel(fixed, false); p.position.set(4 + i * (PW + 6), 10, 4);
    for (const y of [4, PH - 8]) for (const x of [4, PW - 6]) { bx(p, 2, 2, 4, white, x, y, -4.2); }
  }
  const hinged = group(root); hinged.userData.dyn = true; hinged.visible = false;
  const post = 8, leaves = [];
  bx(hinged, 3, PH + 8, 3, white, post - 1.5, 6, 1);
  for (let i = 0; i < 5; i++) {
    const pv = group(hinged, post, 10, 3.5 + (4 - i) * 3.4);
    const p = panel(pv, true); p.position.x = 1.5;
    cyl(pv, 1, 3, M.chrome, 0, 4, 0, 16); cyl(pv, 1, 3, M.chrome, 0, PH - 4, 0, 16);
    pv.userData.onClick = () => openAt(i);
    leaves.push(pv);
  }
  // opening one leaf swings the ones in front of it further out, like turning pages
  let at = -1;
  const openAt = (i) => { at = at === i ? -1 : i; leaves.forEach((pv, j) => tween(pv.rotation, 'y', at < 0 || j > at ? 0 : j === at ? -0.95 : -1.45 - (at - j) * 0.12, 900)); };
  return {
    group: root, view: [0.55, 0.35, 1.4],
    actions: [
      { label: 'Hinged style', run: () => { fixed.visible = !fixed.visible; hinged.visible = !fixed.visible; at = -1; leaves.forEach(pv => { pv.rotation.y = 0; }); wake(); return fixed.visible ? 'Hinged style' : 'Fixed style'; } },
      { label: 'Swing out a panel', run: () => { if (fixed.visible) { fixed.visible = false; hinged.visible = true; } openAt(at >= 4 || at < 0 ? 1 : at + 1); } },
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
        const room = xb - xa - 8, len = room * (0.55 + r() * 0.4), x0 = xa + 4 + r() * (room - len), rad = 2.6 + r() * 2.8, wrapped = r() > 0.4;
        cyl(g, rad, len, wrapped ? wraps[Math.floor(r() * 3)] : bare[Math.floor(r() * bare.length)], x0 + len / 2, 0, 0, 28, 'x');
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
    group: root, view: [0.8, 0.55, 1.3],
    actions: [
      { label: 'Bullet feet', run: () => { wheels = !wheels; make(); return wheels ? 'Bullet feet' : 'Add casters'; } },
      { label: 'Add backsplash', run: () => { splash = !splash; make(); return splash ? 'Remove backsplash' : 'Add backsplash'; } },
      { label: 'Crossbars only', run: () => { shelf = !shelf; make(); return shelf ? 'Crossbars only' : 'Add undershelf'; } },
    ],
  };
});

/* ---------------- 27. install sequence ---------------- */
def('install', 'Mobile Storage Install, Step by Step', 'From bare slab to working system: layout, rails, shims, grout, deck, fasteners, carriages, shelving', ({ THREE, tween, wait, wake }) => {
  const k = kit(THREE), { M, bx, cyl, group } = k, root = new THREE.Group();
  const paint = k.std(0xbfc4c7, 0.5, 0.3), panel = k.std(0x2c2f31, 0.45, 0.25), black = k.std(0x1c1e20, 0.45, 0.15);
  const chalk = k.std(0x2f6fdf, 0.6, 0, { emissive: 0x1b3f8a, emissiveIntensity: 0.4 }), shimM = k.std(0x9aa1a6, 0.4, 0.7), grout = k.std(0x8d9091, 0.95, 0);
  const masonite = k.std(0x6b4a2f, 0.75, 0), ply = k.std(0xd9b27c, 0.8, 0), railM = k.std(0x7d858a, 0.35, 0.8), hole = k.std(0x2b2d2f, 0.9, 0), toolM = k.std(0x1f6fb3, 0.5, 0.2), alu = k.std(0xc9ced2, 0.3, 0.85);
  const L = 108, d = 15, h = 84, N = 4, aisle = 36, cH = 5, RH = 1.25;
  const depths = [d + 1, ...Array(N).fill(2 * d + 1), d + 1];
  const base = []; let acc = 0; for (const dd of depths) { base.push(acc); acc += dd + 0.5; }
  const total = acc + aisle, z0 = -6, z1 = total + 6, x0 = -8, x1 = L + 10;
  const rails = [8, L / 2 - 10, L / 2 + 10, L - 8];
  bx(root, L + 60, 4, total + 60, k.std(0xb9bcbc, 0.9, 0), -30, -4, -30);
  // step placard
  const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 256; const cx = cv.getContext('2d');
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(110, 27.5), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
  sign.position.set(L / 2, h + 44, -34); sign.rotation.y = 0.9; root.add(sign);
  const say = (a, b) => {
    cx.fillStyle = '#023c3f'; cx.fillRect(0, 0, 1024, 256); cx.fillStyle = '#e8a33d'; cx.fillRect(0, 0, 14, 256);
    cx.fillStyle = '#9fd3d5'; cx.font = 'bold 42px system-ui, sans-serif'; cx.fillText(a, 48, 90);
    let fz = 60; do { cx.font = 'bold ' + fz + 'px system-ui, sans-serif'; fz -= 2; } while (cx.measureText(b).width > 940 && fz > 28);
    cx.fillStyle = '#ffffff'; cx.fillText(b, 48, 184);
    tex.needsUpdate = true; wake();
  };
  const stage = () => { const g = group(root); g.userData.dyn = true; g.visible = false; return g; };
  // 1 layout lines, 2 rails, 3 shims, 4 grout
  const lines = stage(); for (const rx of rails) bx(lines, 0.3, 0.05, z1 - z0, chalk, rx - 0.15, 0.01, z0);
  for (const z of [z0, z1]) bx(lines, x1 - x0, 0.05, 0.3, chalk, x0, 0.01, z);
  const railG = rails.map(rx => { const g = stage(); bx(g, 2, 1, z1 - z0 - 4, railM, rx - 1, 0.25, z0 + 2); bx(g, 0.8, 0.3, z1 - z0 - 4, alu, rx - 0.4, 1.25, z0 + 2); return g; });
  const shims = stage(); for (const rx of rails) for (let z = z0 + 4; z < z1 - 3; z += 24) bx(shims, 2.4, 0.25, 3, shimM, rx - 1.2, 0, z);
  const groutG = stage(); for (const rx of rails) for (const sx of [-1.6, 1]) bx(groutG, 0.6, 0.35, z1 - z0 - 4, grout, rx + sx, 0, z0 + 2);
  // 5 masonite, 6 saw cut, 7 plywood between the rails
  const bays = []; { let a = x0; for (const rx of rails) { bays.push([a, rx - 1.6]); a = rx + 1.6; } bays.push([a, x1]); }
  const sheets = (m, t, y) => { const out = []; for (const [a, b] of bays) for (let z = z0; z < z1; z += 48) { const g = stage(); bx(g, b - a, t, Math.min(48, z1 - z) - 0.1, m, a, y, z); out.push(g); } return out; };
  const mason = sheets(masonite, 0.25, 0), plyG = sheets(ply, 1, 0.25);
  const saw = stage(); { const s = group(saw, 0, 0, 0); bx(s, 8, 3, 6, toolM, -4, 1.25, -3); cyl(s, 3.2, 0.2, alu, 0, 2.2, 0, 24, 'x'); bx(s, 2, 4, 2, black, -1, 4.2, -1); saw.userData.tool = s; }
  const stack = stage(); bx(stack, 48, 4, 96, ply, x1 + 20, 0, 20);
  // 8 hammer drill, 9 Tapcons: one pattern of points across the deck, revealed row by row
  const pts = []; for (let z = z0 + 6; z < z1 - 4; z += 16) for (const [a, b] of bays) for (let x = a + 5; x < b - 3; x += 16) pts.push([x, z]);
  const mk = (geo, m, y) => { const im = new THREE.InstancedMesh(geo, m, pts.length), o = new THREE.Object3D(); pts.forEach(([x, z], i) => { o.position.set(x, y, z); o.updateMatrix(); im.setMatrixAt(i, o.matrix); }); im.instanceMatrix.needsUpdate = true; im.count = 0; root.add(im); return im; };
  const holes = mk(new THREE.CylinderGeometry(0.35, 0.35, 0.05, 10), hole, RH + 0.02), screws = mk(new THREE.CylinderGeometry(0.55, 0.55, 0.15, 6), alu, RH + 0.08);
  const drill = stage(); { bx(drill, 3, 8, 3, toolM, -1.5, RH + 6, -1.5); bx(drill, 6, 3, 3, toolM, -1.5, RH + 11, -1.5); cyl(drill, 0.3, 6, alu, 0, RH + 3, 0, 8); }
  // 10 aluminum ramp edges on the open sides
  const ramps = stage(); { const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(5, 0); s.lineTo(0, RH); s.closePath(); for (const [xx, rot] of [[x1, 0], [x0, Math.PI]]) { const m = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: z1 - z0, bevelEnabled: false }), alu); m.rotation.y = rot; m.position.set(xx, 0, rot ? z1 : z0); ramps.add(m); } }
  // 11 to 14: carriages, shelving, end panels, load, first aisle
  const parts = { carriage: [], splice: [], frame: [], panels: [], loaded: [], chain: [], covers: [], keys: [], handles: [] };
  const chainM = k.std(0x55595d, 0.5, 0.8), keyM = k.std(0xc9a227, 0.35, 0.7), TAKE0 = 48.6, TAKE1 = 50;
  const ranges = depths.map((dd, j) => {
    const g = group(root, 0, RH, base[j]), fixed = j === 0 || j === depths.length - 1, last = j === depths.length - 1;
    g.userData.dyn = true; g.userData.z0 = base[j] + (last ? aisle : 0);
    // long carriages ship in two sections, drive shaft already in each; they splice together on the rails
    const half = L / 2 - 1.5, c = group(g), c2 = group(g);
    bx(c, half, cH, dd, M.dark, 0, 0, 0); bx(c2, half, cH, dd, M.dark, L - half, 0, 0);
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
    const p = group(g);
    bx(p, 1.6, h + cH + 1, dd - 0.3, panel, L + 1.6, 0, 0.15); bx(p, 1.6, h + cH + 1, dd - 0.3, panel, -1.6, 0, 0.15);
    parts.panels.push(p);
    if (!fixed) {
      // chain box: drive sprocket on the shaft, take-up sprocket with the handle shaft, chain between; it starts slack
      const cb = group(g);
      bx(cb, 0.3, 52, 5.8, black, L, 0.2, dd / 2 - 2.9);
      cyl(cb, 2.2, 0.9, alu, L + 0.75, 2.5, dd / 2, 20, 'x');
      const take = group(cb, 0, TAKE0, 0); take.userData.dyn = true;
      cyl(take, 2.2, 0.9, alu, L + 0.75, 0, dd / 2, 20, 'x'); cyl(take, 0.7, 5, alu, L + 2.5, 0, dd / 2, 12, 'x');
      for (const dz of [-2.8, 2.5]) bx(take, 1, 3, 0.3, M.steel, L + 0.3, -1.5, dd / 2 + dz);
      const strands = [-2.2, 2.2].map(dz => { const st = bx(cb, 0.5, 1, 0.35, chainM, L + 0.5, 0, dd / 2 + dz - 0.175); st.userData.dyn = true; st.userData.z = st.position.z; return st; });
      cb.userData.take = take; cb.userData.strands = strands; parts.chain.push(cb);
      const cov = group(g); bx(cov, 0.3, 52, 5.8, black, L + 1.25, 0.2, dd / 2 - 2.9); for (const zz of [dd / 2 - 2.9, dd / 2 + 2.6]) bx(cov, 1.25, 52, 0.3, black, L, 0.2, zz); parts.covers.push(cov);
      const key = group(g); bx(key, 1.4, 0.35, 0.35, keyM, L + 3.4, TAKE1 + 0.62, dd / 2 - 0.175); parts.keys.push(key);
      const hub = group(g, L + 3.4, TAKE1, dd / 2); cyl(hub, 2.6, 2, black, 1, 0, 0, 28, 'x'); cyl(hub, 1.6, 0.4, alu, 2.1, 0, 0, 24, 'x');
      for (let q = 0; q < 3; q++) { const arm = new THREE.Group(); arm.rotation.x = (q * Math.PI * 2) / 3; hub.add(arm); const a = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 1.1, 8.4, 16), black); a.position.set(1.2, 4.6, 0); arm.add(a); const ball = new THREE.Mesh(new THREE.SphereGeometry(1.4, 20, 14), black); ball.position.set(1.2, 9.4, 0); arm.add(ball); }
      parts.handles.push(hub);
    }
    for (const o of g.children) o.userData.dyn = true;
    return g;
  });
  const staged = [lines, ...railG, shims, groutG, ...mason, ...plyG, saw, stack, drill, ramps, ...parts.carriage, ...parts.splice, ...parts.frame, ...parts.loaded, ...parts.chain, ...parts.covers, ...parts.panels, ...parts.keys, ...parts.handles];
  // chain state: slack (take-up low, return strand sagging in) or tight
  const chainAt = (cb, top, sag) => { cb.userData.take.position.y = top; cb.userData.strands.forEach((st, i) => { st.scale.y = top - 2.5; st.position.y = (top + 2.5) / 2; st.position.z = st.userData.z + (i ? -sag : 0); }); };
  staged.forEach(o => { o.userData.home = o.position.clone(); });
  const drop = async (list, from, ms, gap) => { for (const o of list) { o.visible = true; o.position.y = o.userData.home.y + from; tween(o.position, 'y', o.userData.home.y, ms, 'out'); await wait(gap); } await wait(ms); };
  const STEPS = [
    ['Lay out', 'Snap chalk lines for every rail', async () => { lines.visible = true; lines.scale.z = 0.01; await tween(lines.scale, 'z', 1, 900, 'out'); }],
    ['Rails', 'Set the rails on the slab', async () => { await drop(railG, 14, 700, 160); }],
    ['Level', 'Shim each rail dead level', async () => { shims.visible = true; railG.forEach(g => { g.position.y = -0.25; }); await wait(250); for (const g of railG) { tween(g.position, 'y', 0, 600, 'out'); await wait(120); } await wait(600); }],
    ['Grout', 'Grout under the rails', async () => { groutG.visible = true; groutG.scale.z = 0.01; await tween(groutG.scale, 'z', 1, 1100); }],
    ['Underlayment', 'Lay masonite between the rails', async () => { await drop(mason, 6, 450, 45); }],
    ['Cut to fit', 'Cut plywood to size between the track', async () => { stack.visible = true; saw.visible = true; saw.position.set(x1 + 44, 4, 20); await tween(saw.position, 'z', 116, 1200, 'lin'); saw.visible = false; }],
    ['Deck', 'Set the plywood flush with the rails', async () => { stack.visible = false; await drop(plyG, 8, 450, 45); }],
    ['Drill', 'Hammer drill through the plywood into the slab', async () => { drill.visible = true; const rows = [...new Set(pts.map(p => p[1]))]; let n = 0; for (const z of rows) { const idx = pts.findIndex(p => p[1] === z); drill.position.set(pts[idx][0], 0, z); n = pts.filter(p => p[1] <= z).length; holes.count = n; wake(); await wait(110); } drill.visible = false; }],
    ['Fasten', 'Drive Tapcon screws into the concrete', async () => { for (let n = 0; n <= pts.length; n += 6) { screws.count = Math.min(n, pts.length); wake(); await wait(40); } screws.count = pts.length; wake(); }],
    ['Edges', 'Aluminum ramp edges on the open sides', async () => { ramps.visible = true; ramps.position.y = 6; await tween(ramps.position, 'y', 0, 700, 'out'); }],
    ['Carriages', 'Set the carriages on the rails', async () => { await drop(parts.carriage, 30, 800, 140); }],
    ['Splice', 'Bolt the carriage sections and couple the drive shafts', async () => { await drop(parts.splice, 10, 500, 120); }],
    ['Shelving', 'Build the shelving on the carriages', async () => { for (const s of parts.frame) { s.visible = true; s.scale.y = 0.01; tween(s.scale, 'y', 1, 900, 'out'); await wait(150); } await wait(800); }],
    ['Chain drive', 'Mount the chain boxes at the aisle end', async () => { await drop(parts.chain, 24, 650, 150); }],
    ['Tension', 'Tension each chain, then close the chain box', async () => {
      for (const cb of parts.chain) { const [a, b] = cb.userData.strands, ms = 800; tween(cb.userData.take.position, 'y', TAKE1, ms, 'out'); for (const st of [a, b]) { tween(st.scale, 'y', TAKE1 - 2.5, ms, 'out'); tween(st.position, 'y', (TAKE1 + 2.5) / 2, ms, 'out'); } tween(b.position, 'z', b.userData.z, ms, 'out'); await wait(160); }
      await wait(800); await drop(parts.covers, 0.01, 1, 60);
    }],
    ['End panels', 'Hang the end panels', async () => { for (const p of parts.panels) { p.visible = true; p.position.x = 30; tween(p.position, 'x', 0, 700, 'out'); await wait(120); } await wait(600); }],
    ['Keyways', 'Set the keys in the handle shafts', async () => { for (const kk of parts.keys) { kk.visible = true; kk.position.x = kk.userData.home.x + 8; tween(kk.position, 'x', kk.userData.home.x, 450, 'out'); await wait(120); } await wait(450); }],
    ['Handles', 'Fit the three-arm handles', async () => { for (const hb of parts.handles) { hb.visible = true; hb.position.x = hb.userData.home.x + 14; hb.rotation.x = -2.2; tween(hb.position, 'x', hb.userData.home.x, 650, 'out'); tween(hb.rotation, 'x', 0, 650, 'out'); await wait(150); } await wait(650); }],
    ['Turnover', 'Loaded, tested, first aisle opened', async () => { parts.loaded.forEach((s, i) => { s.visible = true; parts.frame[i].visible = false; }); wake(); await wait(400); for (let j = 2; j < depths.length - 1; j++) tween(ranges[j].position, 'z', base[j] + aisle, 1500); await wait(1500); }],
  ];
  let at = 0, busy = false;
  const reset = () => { at = 0; staged.forEach(o => { o.visible = false; o.position.copy(o.userData.home); o.scale.set(1, 1, 1); o.rotation.x = 0; }); ranges.forEach(g => { g.position.z = g.userData.z0; }); holes.count = 0; screws.count = 0; parts.chain.forEach(cb => chainAt(cb, TAKE0, 0.9)); say('Install sequence', 'Press Next step to start'); };
  const next = async () => { if (busy || at >= STEPS.length) return; busy = true; const [a, b, fn] = STEPS[at]; at++; say('Step ' + at + ' of ' + STEPS.length + ' · ' + a, b); await fn(); busy = false; };
  reset();
  return {
    group: root, view: [1.45, 0.62, 0.62],
    actions: [
      { label: 'Next step', run: () => { next(); return at >= STEPS.length ? 'Done' : 'Next step'; } },
      { label: 'Play the whole install', run: async () => { if (busy) return; if (at >= STEPS.length) reset(); while (at < STEPS.length) { await next(); await wait(500); } } },
      { label: 'Start over', run: () => { if (!busy) reset(); } },
    ],
  };
});

const SHORT = { 'four-post': '4-post', 'bin-shelving': 'Bin shelving', 'wire-shelving': 'Wire', library: 'Library', 'hd-mobile': 'Mobile', lockers: 'Lockers', 'evidence-lockers': 'Evidence', 'flat-files': 'Flat files', rotary: 'Rotary', 'museum-cabinet': 'Museum cabinet', 'art-screens': 'Art screens', 'pallet-rack': 'Pallet rack', mezzanine: 'Mezzanine', vlm: 'VLM', casework: 'Casework', 'wire-cage': 'Wire cage', athletic: 'Athletic', 'mail-sorter': 'Mail sorter', weapons: 'Weapons', 'tire-rack': 'Tire rack', 'wire-track': 'Wire on track', 'ss-table': 'Stainless tables', install: 'Install steps', 'hd-mobile-open': 'Mobile shelving', 'hd-mobile-tire': 'Mobile tires', 'hd-mobile-grow': 'Mobile grow racks', 'hd-mobile-flat': 'Mobile flat files', workstation: 'Workstation', fireproof: 'Fireproof', 'wall-art': 'Wall art screens', 'textile-rack': 'Textile racks' };
for (const [id, s] of Object.entries(SHORT)) if (MODELS[id]) MODELS[id].short = s;
