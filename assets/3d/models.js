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
  return { M, bx, cyl, bar, group, grid, meshMat, many, FIN, finisher, std, postMat };
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
      bx(g, inner ? 2.5 : 1.25, h, 0.12, post, i === 0 ? 0 : i === bays ? W - 1.25 : x - 1.25, 0, zf);
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
  g.userData.W = W; g.userData.D = d; g.userData.H = h;
  return g;
}

/* ---------------- 1. four-post shelving ---------------- */
def('four-post', '4-Post Steel Shelving', 'Three 36" W x 18" D x 84" H sections', ({ THREE, wake, bake }) => {
  const k = kit(THREE), root = new THREE.Group();
  const paint = k.std(0xbfc4c7, 0.5, 0.3), post = k.postMat(paint);
  let closed = true, shelves = 7, contents = true, unit = null;
  const make = () => { if (unit) root.remove(unit); unit = shelving(k, root, { bays: 3, closed, shelves, paint, postPaint: post, labels: true, contents: contents ? 'boxes' : null }); unit.traverse(o => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; } }); unit.userData.dyn = true; bake?.(unit); wake(); };
  make();
  return {
    group: root, finishes: k.FIN.shelving, setFinish: k.finisher(paint, post),
    actions: [
      { label: 'Open style', run: () => { closed = !closed; make(); return closed ? 'Open style' : 'Closed style'; } },
      { label: 'Shelves: 7', run: () => { shelves = shelves >= 8 ? 5 : shelves + 1; make(); return `Shelves: ${shelves}`; } },
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
def('wire-shelving', 'Chrome Wire Shelving', 'Two 48" W x 24" D x 74" H units', ({ THREE, wake, bake }) => {
  const k = kit(THREE), { M, bx, cyl, group } = k, root = new THREE.Group();
  let casters = false, unit;
  const make = () => {
    if (unit) root.remove(unit);
    unit = group(root); const lift = casters ? 6 : 0, w = 48, d = 24, h = 74;
    const wires = [];
    for (let b = 0; b < 2; b++) {
      const x0 = b * (w + 1);
      for (const [px, pz] of [[0, 0], [w, 0], [0, d], [w, d]]) {
        cyl(unit, 0.5, h, M.chrome, x0 + px, lift + h / 2, pz, 16);
        if (casters) { cyl(unit, 2.4, 1.6, M.rubber, x0 + px, 2.5, pz, 18, 'z'); bx(unit, 1.8, 1.2, 1.8, M.chrome, x0 + px - 0.9, 4.2, pz - 0.9); }
      }
      for (let s = 0; s < 5; s++) {
        const y = lift + 4 + s * ((h - 6) / 4);
        for (const z of [0, d]) cyl(unit, 0.28, w, M.chrome, x0 + w / 2, y, z, 10, 'x');
        for (const x of [0, w]) cyl(unit, 0.28, d, M.chrome, x0 + x, y, d / 2, 10, 'z');
        for (let x = 1; x < w; x += 1.2) wires.push({ x: x0 + x - 0.09, y: y - 0.09, z: 0, w: 0.18, h: 0.18, d, color: '#e3e7ea' });
        for (const z of [d * 0.33, d * 0.66]) cyl(unit, 0.2, w, M.chrome, x0 + w / 2, y - 0.3, z, 8, 'x');
      }
    }
    k.many(unit, wires, M.chrome);
    unit.traverse(o => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; } }); unit.userData.dyn = true; bake?.(unit); wake();
  };
  make();
  return { group: root, actions: [{ label: 'Add casters', run: () => { casters = !casters; make(); return casters ? 'Remove casters' : 'Add casters'; } }] };
});

/* ---------------- 4. library cantilever shelving ---------------- */
def('library', 'Library Cantilever Shelving', 'Double-faced, three 36" bays, 84" H, maple end panels', ({ THREE, wake }) => {
  const k = kit(THREE), { M, bx, group, many } = k, root = new THREE.Group();
  const paint = k.std(0xbfc4c7, 0.5, 0.3), wood = k.std(0xc79a66, 0.7, 0);
  const bays = 3, w = 36, side = 10, core = 2, D = side * 2 + core, h = 84, W = bays * w, r = rng(11);
  const g = group(root, 1, 0, 0);
  let books = null, showBooks = true;
  for (let i = 0; i <= bays; i++) bx(g, 1.5, h, core, paint, i === 0 ? 0 : i === bays ? W - 1.5 : i * w - 0.75, 0, side);
  const items = [];
  for (let b = 0; b < bays; b++) {
    const x0 = b * w + (b === 0 ? 1.5 : 0.75), bw = w - (b === 0 || b === bays - 1 ? 2.25 : 1.5);
    for (const face of [0, 1]) {
      const z0 = face ? side + core : 0;
      bx(g, bw, 4, 0.5, paint, x0, 0, face ? D - 0.5 : 0);
      for (let s = 0; s < 7; s++) {
        const y = 4 + s * 11.3;
        bx(g, bw, 0.08, side - 0.4, paint, x0, y, z0 + (face ? 0 : 0.4));
        bx(g, bw, 1.1, 0.08, paint, x0, y - 1, face ? D - 0.1 : 0.02);
        for (const bxx of [x0 + 0.2, x0 + bw - 0.3]) bx(g, 0.1, 3, side - 1, paint, bxx, y, z0 + 0.5);
        if (s === 6) continue;
        let x = x0 + 0.3;
        while (x < x0 + bw - 2) { const t = 0.8 + r() * 1.3, bh = 7.5 + r() * 2.8; if (r() > 0.06) items.push({ x, y: y + 0.08, z: face ? D - 1 - (6 + r() * 2) : 1, w: t - 0.05, h: bh, d: 6 + r() * 2, color: BOOKS[Math.floor(r() * BOOKS.length)] }); x += t; }
      }
    }
  }
  books = many(g, items, k.std(0xffffff, 0.7, 0));
  bx(g, 1, h + 2, D + 1.5, wood, -1, 0, -0.75); bx(g, 1, h + 2, D + 1.5, wood, W, 0, -0.75);
  bx(g, W + 2, 1, D + 1.5, wood, -1, h + 1, -0.75);
  return {
    group: root, finishes: [{ name: 'Maple ends', swatch: '#c79a66', color: 0xc79a66 }, { name: 'Walnut ends', swatch: '#6b4428', color: 0x6b4428 }, { name: 'Light gray ends', swatch: '#c3c7ca', color: 0xbfc4c7 }],
    setFinish: k.finisher(wood),
    actions: [{ label: 'Hide books', run: () => { showBooks = !showBooks; books.visible = showBooks; wake(); return showBooks ? 'Hide books' : 'Show books'; } }],
  };
});

/* ---------------- 5. high-density mobile ---------------- */
def('hd-mobile', 'High-Density Mobile Shelving', 'Two fixed + five mobile ranges, 9 ft long, mechanical assist', ({ THREE, tween }) => {
  const k = kit(THREE), { M, bx, cyl, group } = k, root = new THREE.Group();
  const paint = k.std(0xbfc4c7, 0.5, 0.3), panel = k.std(0x0f7377, 0.45, 0.25);
  const bays = 3, w = 36, d = 15, h = 84, L = bays * w, aisle = 36, N = 5;
  const deck = 1.5;
  const depths = [d + 1, ...Array(N).fill(2 * d + 1), d + 1];
  const base = []; let acc = 0; for (const dd of depths) { base.push(acc); acc += dd + 0.5; }
  const total = acc + aisle;
  bx(root, L + 14, deck, total + 8, k.std(0x8f969a, 0.8, 0.1), -4, 0, -4);
  for (const rx of [8, L / 2 - 10, L / 2 + 10, L - 8]) bx(root, 1.2, 0.35, total + 8, M.steel, rx - 0.6, deck, -4);
  let open = 2;
  const ranges = depths.map((dd, j) => {
    const g = group(root, 0, deck + 0.35, 0), fixed = j === 0 || j === depths.length - 1;
    const r0 = group(g, 0, 0, 0);
    bx(r0, L, 5, dd, M.dark, 0, 0, 0);
    if (!fixed || j === 0) shelving(k, r0, { bays, w, d, h, closed: true, shelves: 7, paint, contents: 'boxes', seed: 3 + j, y: 5, z: fixed ? 0.5 : d + 1 });
    if (!fixed || j === depths.length - 1) { const back = shelving(k, r0, { bays, w, d, h, closed: true, shelves: 7, paint, contents: 'boxes', seed: 30 + j, y: 5 }); back.rotation.y = Math.PI; back.position.set(L, 5, fixed ? d + 0.5 : d); }
    bx(r0, 1.6, h + 6, dd - 0.3, panel, L, 0, 0.15);
    bx(r0, 1.6, h + 6, dd - 0.3, panel, -1.6, 0, 0.15);
    bx(r0, 0.4, h - 10, 0.8, M.chrome, L + 1.6, 8, 0.4); bx(r0, 0.4, h - 10, 0.8, M.chrome, L + 1.6, 8, dd - 1.2);
    if (!fixed) {
      // three-arm spinner handle with ball grips on a round hub
      const hub = group(r0, L + 1.8, 50, dd / 2), black = k.std(0x1c1e20, 0.45, 0.15);
      cyl(hub, 2.6, 2, black, 1, 0, 0, 28, 'x');
      cyl(hub, 1.6, 0.4, M.chrome, 2.1, 0, 0, 24, 'x');
      for (let s = 0; s < 3; s++) {
        const arm = new THREE.Group(); arm.rotation.x = (s * Math.PI * 2) / 3; hub.add(arm);
        const a = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 1.1, 8.4, 16), black); a.position.set(1.2, 4.6, 0); arm.add(a);
        const ball = new THREE.Mesh(new THREE.SphereGeometry(1.4, 20, 14), black); ball.position.set(1.2, 9.4, 0); arm.add(ball);
      }
      g.userData.onClick = () => { open = open === j - 1 ? j : j - 1; move(); };
      g.userData.wheel = hub; hub.userData.dyn = true;
    }
    g.userData.fixed = fixed;
    return g;
  });
  const zOf = (j) => base[j] + (j > open ? aisle : 0);
  const move = () => ranges.forEach((g, j) => {
    if (g.userData.fixed) return;
    const to = zOf(j); if (Math.abs(g.position.z - to) > 0.1) { tween(g.position, 'z', to, 1100); tween(g.userData.wheel.rotation, 'x', g.userData.wheel.rotation.x + (to > g.position.z ? -4 : 4), 1100); }
  });
  ranges.forEach((g, j) => { g.position.z = zOf(j); });
  return {
    group: root, view: [1.45, 0.62, 0.62], finishes: k.FIN.endPanels, setFinish: k.finisher(panel),
    actions: [
      { label: 'Open next aisle', run: () => { open = (open + 1) % (N + 1); move(); } },
      { label: 'Close up (show savings)', run: () => { open = N; move(); } },
    ],
  };
});

/* ---------------- 6. lockers ---------------- */
def('lockers', 'Steel Lockers', 'Four 12" W x 18" D x 72" H lockers on a base', ({ THREE, tween, wake, bake }) => {
  const k = kit(THREE), { M, bx, group } = k, root = new THREE.Group();
  const paint = k.std(0xb5babd, 0.45, 0.35);
  let tiers = 2, sloped = true, bank, doors = [];
  const make = () => {
    if (bank) root.remove(bank);
    bank = group(root); doors = [];
    const n = 4, w = 12, d = 18, h = 72, baseH = 6, dh = h / tiers;
    bx(bank, n * w, baseH, d - 1, M.dark, 0, 0, 0.5);
    bx(bank, n * w, 0.5, d, paint, 0, baseH + h, 0);
    if (sloped) {
      // sloped top: high at the wall, sheds toward the front so nothing gets stored up there
      const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(d, 0); s.lineTo(0, 7.5); s.closePath();
      const wedge = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: n * w, bevelEnabled: false }), paint);
      wedge.rotation.y = -Math.PI / 2; wedge.position.set(n * w, baseH + h + 0.5, 0); bank.add(wedge);
    }
    for (let i = 0; i <= n; i++) bx(bank, 0.3, h, d, paint, i * w - (i === n ? 0.3 : 0), baseH, 0);
    bx(bank, n * w, h, 0.3, paint, 0, baseH, 0);
    for (let i = 0; i < n; i++) for (let t = 0; t < tiers; t++) {
      const y0 = baseH + t * dh;
      if (t > 0) bx(bank, w, 0.3, d, paint, i * w, y0, 0);
      if (tiers === 1) { bx(bank, w - 0.6, 0.2, d - 1.5, paint, i * w + 0.3, y0 + h - 12, 0.5); bx(bank, 0.6, 0.6, 3, M.chrome, i * w + w / 2 - 0.3, y0 + h - 16, 1); }
      const pivot = group(bank, i * w + 0.3, y0 + 0.25, d);
      const door = group(pivot);
      bx(door, w - 0.6, dh - 0.5, 0.35, paint, 0, 0, 0);
      for (let v = 0; v < 6; v++) bx(door, w - 4.5, 0.3, 0.25, paint, 2.2, dh - 5 - v * 0.9, 0.3);
      for (let v = 0; v < 6; v++) bx(door, w - 4.5, 0.3, 0.25, paint, 2.2, 3 + v * 0.9, 0.3);
      bx(door, 1, Math.min(6, dh / 3), 0.9, M.chrome, w - 2.6, dh / 2 - 2.5, 0.3);
      bx(door, 2.2, 1, 0.1, M.label, (w - 0.6) / 2 - 1.1, dh - 7.5, 0.36);
      pivot.userData.onClick = () => { pivot.userData.open = !pivot.userData.open; tween(pivot.rotation, 'y', pivot.userData.open ? -1.9 : 0, 650); };
      doors.push(pivot);
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
      { label: 'Open all doors', run: () => { const o = !doors.every(p => p.userData.open); doors.forEach(p => { p.userData.open = o; tween(p.rotation, 'y', o ? -1.9 : 0, 650); }); return o ? 'Close all doors' : 'Open all doors'; } },
      { label: 'Double tier', run: () => { tiers = tiers === 1 ? 2 : tiers === 2 ? 3 : 1; make(); return ['', 'Single tier', 'Double tier', 'Triple tier'][tiers]; } },
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
      const dy = y0 + 0.5 + i * 3.1, dr = group(root, 0, 0, 0), iw = W - 3, id = D - 3.5, ih = 2.2;
      bx(dr, W - 1.6, 2.9, 0.8, paint, 0.8, dy, D - 0.8);
      bx(dr, iw, 0.12, id, inner, 1.5, dy + 0.1, 1);
      bx(dr, 0.15, ih, id, inner, 1.5, dy + 0.1, 1); bx(dr, 0.15, ih, id, inner, 1.5 + iw - 0.15, dy + 0.1, 1);
      bx(dr, iw, ih, 0.15, inner, 1.5, dy + 0.1, 1);
      bx(dr, iw, 0.1, 5, inner, 1.5, dy + ih, 1);
      const sheets = 3 + Math.floor(r() * 6);
      for (let s = 0; s < sheets; s++) bx(dr, 36 - r() * 6, 0.05, 24 - r() * 4, paper[s % 3], 5 + r() * 2, dy + 0.25 + s * 0.09, 7 + r() * 2);
      bx(dr, 22, 0.5, 0.9, M.chrome, W / 2 - 11, dy + 1.9, D);
      bx(dr, 3, 1.3, 0.1, M.label, W / 2 - 1.5, dy + 0.4, D + 0.02);
      dr.userData.onClick = () => { dr.userData.open = !dr.userData.open; tween(dr.position, 'z', dr.userData.open ? 28 : 0, 700); };
      drawers.push(dr);
    }
  }
  return {
    group: root, view: [0.7, 0.9, 1.2], finishes: k.FIN.cabinets, setFinish: k.finisher(paint),
    actions: [{ label: 'Open a drawer', run: () => { const dr = drawers[7]; dr.userData.onClick(); return dr.userData.open ? 'Close the drawer' : 'Open a drawer'; } }],
  };
});

/* ---------------- 8. rotary cabinet ---------------- */
def('rotary', 'Rotary File Cabinet', '48" W x 48" D x 80" H cabinet, the unit inside turns to lock flush', ({ THREE, tween }) => {
  const k = kit(THREE), { M, bx, group, many } = k, root = new THREE.Group();
  const paint = k.std(0xbfc4c7, 0.45, 0.35), S = 48, H = 80, RW = 34, RD = 26, RH = H - 12, r = rng(5);
  // the rotor's corners sweep a 21.4" radius; the shell leaves 23" to each wall so it never clips
  bx(root, S, 4, S, M.dark, 0, 0, 0); bx(root, S, 1.2, S, paint, 0, H - 1.2, 0);
  bx(root, 1, H - 4, S, paint, 0, 4, 0); bx(root, 1, H - 4, S, paint, S - 1, 4, 0); bx(root, S, H - 4, 1, paint, 0, 4, 0);
  const pil = (S - RW - 2) / 2;
  bx(root, pil, H - 4, 1, paint, 0, 4, S - 1); bx(root, pil, H - 4, 1, paint, S - pil, 4, S - 1); bx(root, S, H - 4 - RH - 1.6, 1, paint, 0, 4 + RH + 1.6, S - 1);
  bx(root, S - 2, 0.6, S - 2, k.std(0x8f969a, 0.6, 0.4), 1, 4, 1);
  const rot = group(root, S / 2, 4.6, S / 2);
  bx(rot, RW, RH, 0.8, paint, -RW / 2, 0, -0.4);
  bx(rot, 0.8, RH, RD, paint, -RW / 2, 0, -RD / 2); bx(rot, 0.8, RH, RD, paint, RW / 2 - 0.8, 0, -RD / 2);
  bx(rot, RW, 0.8, RD, paint, -RW / 2, RH - 0.8, -RD / 2);
  const items = [];
  for (const side of [1, -1]) for (let s = 0; s < 6; s++) {
    const y = 1 + s * 12.3;
    bx(rot, RW - 1.6, 0.1, RD / 2 - 1, paint, -RW / 2 + 0.8, y, side > 0 ? 0.4 : -RD / 2 + 0.6);
    if (s === 5) continue;
    let x = -RW / 2 + 1.3;
    while (x < RW / 2 - 3.5) {
      const t = side > 0 ? 1.8 + r() * 1.2 : 0.35 + r() * 0.5;
      if (r() > 0.1) items.push({ x, y: y + 0.1, z: side > 0 ? 1 : -RD / 2 + 1.2, w: t - 0.1, h: side > 0 ? 11 : 9.5, d: RD / 2 - 2.5, color: side > 0 ? BOOKS[Math.floor(r() * BOOKS.length)] : KRAFT[Math.floor(r() * 4)] });
      x += t;
    }
  }
  many(rot, items, k.std(0xffffff, 0.7, 0));
  rot.userData.onClick = () => tween(rot.rotation, 'y', rot.rotation.y + Math.PI, 1300);
  return { group: root, finishes: k.FIN.cabinets, setFinish: k.finisher(paint), actions: [{ label: 'Rotate', run: () => rot.userData.onClick() }] };
});

/* ---------------- 9. museum cabinet ---------------- */
def('museum-cabinet', 'Museum Storage Cabinet', '48" W x 30" D x 76" H, gasketed glass doors, shelves over drawers', ({ THREE, tween, wake }) => {
  const k = kit(THREE), { M, bx, cyl, group } = k, root = new THREE.Group();
  const paint = k.std(0xd9dcd8, 0.4, 0.3), tray = k.std(0xe3e5e2, 0.5, 0.2), W = 48, D = 30, H = 72, base = 4, r = rng(12);
  const pots = [0xb56f4a, 0x6b8f71, 0xe9e2cf, 0x3d5a7a].map(c => k.std(c, 0.6, 0.05)), boxMat = k.std(0xe8e2d2, 0.9, 0);
  bx(root, W, base, D - 1, k.std(0xeef0ee, 0.5, 0.2), 0, 0, 0.5);
  bx(root, W, 1, D, paint, 0, H + base - 1, 0); bx(root, 1, H, D, paint, 0, base, 0); bx(root, 1, H, D, paint, W - 1, base, 0); bx(root, W, H, 1, paint, 0, base, 0); bx(root, W, 1, D, paint, 0, base, 0);
  for (const y of [base + 0.4, H + base - 1.4]) bx(root, W - 2, 0.7, 0.7, M.rubber, 1, y, D - 0.7);
  for (const x of [1, W - 1.7]) bx(root, 0.7, H - 2, 0.7, M.rubber, x, base + 1, D - 0.7);
  // upper shelves holding objects and archival boxes
  for (const y of [base + 46, base + 59]) {
    bx(root, W - 2, 0.3, D - 3, paint, 1, y, 1);
    let x = 4;
    while (x < W - 10) {
      if (r() < 0.5) { const rr = 2 + r() * 2.5, ph = 4 + r() * 6; cyl(root, rr, ph, pots[Math.floor(r() * 4)], x + rr, y + 0.3 + ph / 2, 8 + r() * 12, 20); x += rr * 2 + 3; }
      else { const bw = 6 + r() * 6; bx(root, bw, 3 + r() * 4, 9 + r() * 6, boxMat, x, y + 0.3, 5); x += bw + 2; }
    }
  }
  const drawers = [];
  for (let i = 0; i < 7; i++) {
    const y = base + 2 + i * 5.9, dr = group(root);
    bx(dr, W - 4, 0.2, D - 4, tray, 2, y, 2);
    bx(dr, 0.2, 3, D - 4, tray, 2, y, 2); bx(dr, 0.2, 3, D - 4, tray, W - 2.2, y, 2); bx(dr, W - 4, 3, 0.2, tray, 2, y, 2);
    bx(dr, W - 4, 3.3, 0.5, paint, 2, y, D - 2.5);
    bx(dr, 8, 0.8, 0.8, M.chrome, W / 2 - 4, y + 1.2, D - 2);
    for (let t = 0; t < 4; t++) bx(dr, 8, 1.2, 6, M.white, 4 + t * 10.5, y + 0.2, 6 + (t % 2) * 9);
    dr.userData.onClick = () => { dr.userData.open = !dr.userData.open; tween(dr.position, 'z', dr.userData.open ? 22 : 0, 700); };
    drawers.push(dr);
  }
  let glass = true, doors = [];
  const hinge = group(root); hinge.userData.dyn = true;
  const makeDoors = () => {
    const was = doors[0]?.userData.open;
    hinge.clear(); doors = [];
    for (const side of [0, 1]) {
      const pv = group(hinge, side ? W - 0.5 : 0.5, base + 0.5, D), dw = W / 2 - 0.7, sx = side ? -dw : 0;
      if (glass) {
        bx(pv, dw, 3, 0.9, paint, sx, 0, 0); bx(pv, dw, 3, 0.9, paint, sx, H - 4, 0);
        bx(pv, 3, H - 1, 0.9, paint, sx, 0, 0); bx(pv, 3, H - 1, 0.9, paint, sx + dw - 3, 0, 0);
        bx(pv, dw - 6, H - 7, 0.25, M.glass, sx + 3, 3, 0.3);
      } else bx(pv, dw, H - 1, 0.9, paint, sx, 0, 0);
      // chrome latch plate with a lever
      bx(pv, 3, 8, 0.3, M.chrome, side ? -(dw - 0.6) : dw - 3.6, H / 2 - 4, 0.9); bx(pv, 1, 4, 1, M.chrome, side ? -(dw - 1.6) : dw - 2.6, H / 2 - 1.5, 1.1);
      pv.userData.onClick = () => { const o = !pv.userData.open; doors.forEach((d, n) => { d.userData.open = o; tween(d.rotation, 'y', o ? (n === 0 ? -1.95 : 1.95) : 0, 800); }); };
      if (was) { pv.userData.open = true; pv.rotation.y = side ? 1.95 : -1.95; }
      doors.push(pv);
    }
    hinge.traverse(o => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; } }); wake();
  };
  makeDoors();
  return {
    group: root, finishes: [{ name: 'Light gray', swatch: '#d9dcd8', color: 0xd9dcd8 }, { name: 'White', swatch: '#f1f2f0', color: 0xeeefed }, { name: 'Putty', swatch: '#d9cfbd', color: 0xd6ccb9 }], setFinish: k.finisher(paint),
    actions: [
      { label: 'Open doors', run: () => { doors[0].userData.onClick(); return doors[0].userData.open ? 'Close doors' : 'Open doors'; } },
      { label: 'Pull a drawer', run: () => { if (!doors[0].userData.open) doors[0].userData.onClick(); drawers[3].userData.onClick(); } },
      { label: 'Solid doors', run: () => { glass = !glass; makeDoors(); return glass ? 'Solid doors' : 'Glass doors'; } },
    ],
  };
});

/* ---------------- 10. art screens ---------------- */
def('art-screens', 'Sliding Art Screens', 'Two facing banks of 8 ft x 8 ft mesh screens, pulled into a center aisle', ({ THREE, tween }) => {
  const k = kit(THREE), { M, bx, group } = k, root = new THREE.Group();
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
    for (const face of [1, -1]) {
      let z = 5;
      while (z < Ls - 16) {
        const fw = 14 + r() * 22, fh = 16 + r() * 30, y = 14 + r() * (H - fh - 24);
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
  return { group: root, actions: [{ label: 'Hide loads', run: () => { lm.visible = !lm.visible; wake(); return lm.visible ? 'Hide loads' : 'Show loads'; } }] };
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
def('vlm', 'Vertical Lift Module (VLM)', 'About 10 ft W x 9 ft D x 15 ft H: two tray columns with the lift between them', ({ THREE, tween }) => {
  const k = kit(THREE), { M, bx, group, many } = k, root = new THREE.Group();
  const shell = k.std(0xf2f3f1, 0.4, 0.2), trim = k.std(0xd9dcda, 0.45, 0.3), r = rng(8);
  const W = 118, D = 108, H = 180, TW = W - 18, TD = 30, bayY = 34, bayH = 22;
  const zRear = 4, zLift = zRear + TD + 4, zFront = zLift + TD + 4, trayX = 9, zBay = D - TD - 1;
  const bins = ['#2f6fb3', '#c92a2a', '#e0a526', '#7a8288', '#2f9e44'];
  // white cabinet, glass on one side so the lift is visible, wide lit bay at working height
  bx(root, W, 3, D, trim, 0, 0, 0);
  bx(root, W, H - 3, 1, shell, 0, 3, 0); bx(root, W, 2, D, shell, 0, H - 2, 0); bx(root, 1, H - 3, D, shell, 0, 3, 0);
  bx(root, 1, H - 3, D, M.glass, W - 1, 3, 0);
  for (const z of [0, zLift - 2, zFront - 2, D - 3]) bx(root, 1.4, H - 3, 3, trim, W - 1.2, 3, z);
  for (const y of [3, H - 5]) bx(root, 1.4, 3, D, trim, W - 1.2, y, 0);
  bx(root, W, bayY - 3, 1, shell, 0, 3, D - 1);
  bx(root, W, H - bayY - bayH - 10, 1, shell, 0, bayY + bayH + 10, D - 1);
  bx(root, W, 10, 6, shell, 0, bayY + bayH, D - 6);
  bx(root, W - 12, 0.8, 16, trim, 6, bayY - 1.2, D - 16);
  bx(root, 6, bayH + 10, 16, shell, 0, bayY - 0.4, D - 16); bx(root, 6, bayH + 10, 16, shell, W - 6, bayY - 0.4, D - 16);
  bx(root, W - 12, 0.6, 1, k.std(0xfff6d5, 0.3, 0, { emissive: 0xfff2c4, emissiveIntensity: 0.9 }), 6, bayY + bayH - 0.8, D - 14);
  const con = group(root, 16, bayY + bayH + 12, D); bx(con, 16, 11, 2, M.dark, 0, 0, 0);
  bx(con, 13, 8, 0.2, k.std(0x2a6f97, 0.2, 0.1, { emissive: 0x1b4f70, emissiveIntensity: 0.7 }), 1.5, 1.5, 2);
  // tray columns: rear runs full height, front starts above the bay; the lift rides between them
  const items = [];
  const fill = (list, x0, y, z, span) => { let x = x0 + 2; while (x < x0 + span - 6) { const bw = 6 + Math.floor(r() * 3) * 4; if (r() > 0.25) list.push({ x, y, z: z + 2, w: bw - 0.5, h: 2 + r() * 3.5, d: TD - 4, color: bins[Math.floor(r() * 5)] }); x += bw; } };
  const levels = []; for (let y = 10; y < H - 14; y += 8.5) levels.push(y);
  const pickY = levels[9];
  for (const y of levels) {
    if (y !== pickY) { bx(root, TW, 0.8, TD, M.steel, trayX, y, zRear); fill(items, trayX, y + 0.8, zRear, TW); }
    if (y > bayY + bayH + 12) { bx(root, TW, 0.8, TD, M.steel, trayX, y, zFront); fill(items, trayX, y + 0.8, zFront, TW); }
  }
  many(root, items, k.std(0xffffff, 0.45, 0.05));
  for (const z of [zRear, zRear + TD, zFront, zFront + TD]) for (const x of [trayX - 2, trayX + TW]) bx(root, 2, H - 8, 1.5, trim, x, 3, z - 0.75);
  for (const x of [2, W - 5]) bx(root, 3, H - 6, 4, M.dark, x, 3, zLift + TD / 2 - 2);
  const lift = group(root, 0, pickY - 2, zLift); lift.userData.dyn = true;
  bx(lift, W - 11, 1.6, TD + 2, M.dark, 5.5, -0.2, -1);
  for (const x of [5.5, W - 8.5]) bx(lift, 3, 6, TD + 2, M.dark, x, -0.2, -1);
  const tray = group(root, 0, pickY, zRear);
  bx(tray, TW, 0.8, TD, M.steel, trayX, 0, 0);
  const tItems = []; fill(tItems, trayX, 0.8, 0, TW); many(tray, tItems, k.std(0xffffff, 0.45, 0.05));
  let out = false, busy = false;
  const run = (steps) => { busy = true; let t = 0; for (const [fn, ms] of steps) { setTimeout(fn, t); t += ms; } setTimeout(() => { busy = false; }, t); };
  const call = () => {
    if (busy) return out ? 'Return the tray' : 'Call a tray';
    out = !out;
    const y = out ? bayY : pickY;
    run([
      [() => tween(tray.position, 'z', zLift, 800), 850],
      [() => { tween(lift.position, 'y', y - 2, 1600); tween(tray.position, 'y', y, 1600); }, 1650],
      [() => tween(tray.position, 'z', out ? zBay : zRear, 900), 900],
    ]);
    return out ? 'Return the tray' : 'Call a tray';
  };
  tray.userData.onClick = call;
  return { group: root, view: [1.25, 0.5, 0.95], actions: [{ label: 'Call a tray', run: call }] };
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
      for (let i = 0; i < 4; i++) { const dr = group(root); const y = toe + 0.3 + i * 7.6; bx(dr, cw, 7.2, 0.8, face, x0, y, D - 1); bx(dr, cw - 2, 6, D - 6, k.std(0xd0d3d3, 0.5, 0.2), x0 + 1, y + 0.4, 5); bx(dr, 5, 0.6, 0.9, M.chrome, x0 + cw / 2 - 2.5, y + 5.2, D - 0.2); dr.userData.onClick = () => { dr.userData.open = !dr.userData.open; tween(dr.position, 'z', dr.userData.open ? 16 : 0, 600); }; movers.push(dr); }
    } else {
      const dr = group(root); const y = toe + 0.3 + 3 * 7.6; bx(dr, cw, 7.2, 0.8, face, x0, y, D - 1); bx(dr, 5, 0.6, 0.9, M.chrome, x0 + cw / 2 - 2.5, y + 5.2, D - 0.2); dr.userData.onClick = () => { dr.userData.open = !dr.userData.open; tween(dr.position, 'z', dr.userData.open ? 16 : 0, 600); }; movers.push(dr);
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
def('wire-cage', 'Wire Partition Enclosure', '10 ft x 8 ft x 8 ft cage with hinged door', ({ THREE, tween }) => {
  const k = kit(THREE), { M, bx, group } = k, root = new THREE.Group();
  const frame = k.std(0x6b7378, 0.45, 0.6), W = 120, D = 96, H = 96;
  const panel = (parent, w, x, z, rotY) => {
    const g = group(parent, x, 0, z); g.rotation.y = rotY;
    bx(g, w, 1.2, 1.2, frame, 0, 0, -0.6); bx(g, w, 1.2, 1.2, frame, 0, H - 1.2, -0.6);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w - 1, H - 2.4), k.meshMat(w, H, 2)); m.position.set(w / 2, H / 2, 0); g.add(m);
    return g;
  };
  for (const [x, z] of [[0, 0], [W, 0], [0, D], [W, D]]) bx(root, 2, H, 2, frame, x - 1, 0, z - 1);
  bx(root, 2, H, 2, frame, W - 45, 0, D - 1);
  panel(root, W, 0, 0, 0); panel(root, D, 0, 0, -Math.PI / 2); panel(root, D, W, 0, -Math.PI / 2);
  panel(root, W - 46, 0, D, 0);
  const door = group(root, W - 44, 0, D);
  bx(door, 42, 1.2, 1.2, frame, 0, 0, -0.6); bx(door, 42, 1.2, 1.2, frame, 0, H - 1.2, -0.6); bx(door, 1.2, H, 1.2, frame, 40.8, 0, -0.6);
  const dm = new THREE.Mesh(new THREE.PlaneGeometry(40, H - 2.4), k.meshMat(42, H, 2)); dm.position.set(21, H / 2, 0); door.add(dm);
  bx(door, 3, 5, 1.8, M.chrome, 37, 42, 0);
  door.userData.onClick = () => { door.userData.open = !door.userData.open; tween(door.rotation, 'y', door.userData.open ? 1.6 : 0, 700); };
  shelving(k, root, { bays: 2, closed: false, shelves: 5, h: 84, d: 24, contents: 'boxes', seed: 14, x: 10, z: 4 });
  return { group: root, finishes: [{ name: 'Gray', swatch: '#6b7378', color: 0x6b7378 }, { name: 'Black', swatch: '#26292b', color: 0x26292b }, { name: 'Safety yellow', swatch: '#e0a526', color: 0xe0a526 }], setFinish: k.finisher(frame), actions: [{ label: 'Open the door', run: () => { door.userData.onClick(); return door.userData.open ? 'Close the door' : 'Open the door'; } }] };
});

const SHORT = { 'four-post': '4-post', 'bin-shelving': 'Bin shelving', 'wire-shelving': 'Wire', library: 'Library', 'hd-mobile': 'Mobile', lockers: 'Lockers', 'evidence-lockers': 'Evidence', 'flat-files': 'Flat files', rotary: 'Rotary', 'museum-cabinet': 'Museum cabinet', 'art-screens': 'Art screens', 'pallet-rack': 'Pallet rack', mezzanine: 'Mezzanine', vlm: 'VLM', casework: 'Casework', 'wire-cage': 'Wire cage' };
for (const [id, s] of Object.entries(SHORT)) if (MODELS[id]) MODELS[id].short = s;
