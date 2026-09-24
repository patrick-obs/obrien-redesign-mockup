// O'Brien 3D product viewer: drag to rotate 360, pinch/scroll to zoom, click parts to interact.
// Usage: <div class="v3d" data-model="four-post"></div>
//        <div class="v3d" data-models="four-post,hd-mobile,lockers"></div>   (tabs, one renderer)
// Models are built in code (models.js) from typical dimensions: representative, not a spec.
import * as THREE from '../vendor/three.module.min.js';
import { OrbitControls } from '../vendor/OrbitControls.js';
import { RoomEnvironment } from '../vendor/RoomEnvironment.js';
import { mergeGeometries } from '../vendor/BufferGeometryUtils.js';
// models.js carries the same version as this file, so a new build never mixes with a cached copy
const { MODELS } = await import('./models.js' + new URL(import.meta.url).search);

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// Merge every part that never moves into one mesh per material (hundreds of draw calls -> a handful).
// Parts that move or toggle (userData.onClick / userData.dyn) keep their own merged meshes.
function bake(THREE, root) {
  const rigid = o => o === root || o.userData.onClick || o.userData.dyn;
  const nodes = []; root.traverse(o => { if (rigid(o)) nodes.push(o); });
  root.updateWorldMatrix(true, true);
  for (const node of nodes) {
    const inv = new THREE.Matrix4().copy(node.matrixWorld).invert(), byMat = new Map(), gone = [];
    (function walk(o) {
      for (const c of o.children) {
        if (rigid(c)) continue;
        if (c.isMesh && !c.isInstancedMesh && c.geometry.index) {
          const g = c.geometry.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, c.matrixWorld));
          if (!byMat.has(c.material)) byMat.set(c.material, []);
          byMat.get(c.material).push(g); gone.push(c);
        }
        walk(c);
      }
    })(node);
    for (const m of gone) m.parent.remove(m);
    for (const [mat, gs] of byMat) {
      const merged = mergeGeometries(gs); gs.forEach(g => g.dispose()); if (!merged) continue;
      const mesh = new THREE.Mesh(merged, mat); mesh.castShadow = mesh.receiveShadow = true; node.add(mesh);
    }
  }
}

const GROUPS = [
  { name: 'Mobile & automated', ids: ['hd-mobile', 'wire-track', 'vlm', 'rotary'] },
  { name: 'Shelving & racks', ids: ['four-post', 'bin-shelving', 'wire-shelving', 'library', 'tire-rack'] },
  { name: 'Lockers & security', ids: ['lockers', 'athletic', 'evidence-lockers', 'weapons'] },
  { name: 'Cabinets', ids: ['flat-files', 'fireproof', 'museum-cabinet'] },
  { name: 'Museum & art', ids: ['art-screens', 'wall-art', 'textile-rack'] },
  { name: 'Workspace', ids: ['casework', 'workstation', 'ss-table', 'mail-sorter'] },
  { name: 'Industrial', ids: ['pallet-rack', 'mezzanine', 'wire-cage'] },
  { name: 'For architects & GCs', ids: ['install'] },
];

function viewer(el) {
  const ids = (el.dataset.models || el.dataset.model || '').split(',').map(s => s.trim()).filter(id => MODELS[id]);
  if (!ids.length) return;
  el.classList.add('v3d-on');
  const side = el.dataset.layout === 'side' && ids.length > 1;
  const groups = GROUPS.map(g => ({ ...g, ids: g.ids.filter(id => ids.includes(id)) })).filter(g => g.ids.length);
  const ICON = {
    spin: '<svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v5h-5"/></svg>',
    reset: '<svg viewBox="0 0 24 24"><path d="M3 12h4M17 12h4M12 3v4M12 17v4"/><circle cx="12" cy="12" r="3"/></svg>',
    full: '<svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
  };
  el.innerHTML = `
  <div class="v3d-wrap${side ? ' has-side' : ''}">
    ${side ? `<nav class="v3d-side" aria-label="Choose a product">${groups.map(g => `<div class="v3d-g"><span>${g.name}</span>${g.ids.map(id => `<button type="button" data-id="${id}">${MODELS[id].name}</button>`).join('')}</div>`).join('')}</nav>
      <label class="v3d-pick"><span>Product</span><select>${groups.map(g => `<optgroup label="${g.name}">${g.ids.map(id => `<option value="${id}">${MODELS[id].name}</option>`).join('')}</optgroup>`).join('')}</select></label>`
      : ids.length > 1 ? `<div class="v3d-seg" role="tablist">${ids.map(id => `<button type="button" role="tab" data-id="${id}">${MODELS[id].short || MODELS[id].name}</button>`).join('')}</div>` : ''}
    <div class="v3d-main">
      <div class="v3d-top">
        <div class="v3d-title"><b></b><span></span></div>
        <div class="v3d-icons">
          <button type="button" data-v="spin" aria-pressed="false" title="Auto-rotate" aria-label="Auto-rotate">${ICON.spin}</button>
          <button type="button" data-v="reset" title="Reset view" aria-label="Reset view">${ICON.reset}</button>
          <button type="button" data-v="full" title="Full screen" aria-label="Full screen">${ICON.full}</button>
        </div>
      </div>
      <div class="v3d-stage">
        <canvas aria-label="Interactive 3D model. Drag to rotate, scroll or pinch to zoom."></canvas>
        <div class="v3d-load">Loading 3D model...</div>
        <div class="v3d-hint">Drag to turn &middot; Pinch or scroll to zoom &middot; Tap parts to move them</div>
      </div>
      <div class="v3d-bar">
        <div class="v3d-acts"></div>
        <div class="v3d-fin"></div>
      </div>
      <p class="v3d-note">Representative model. Sizes, finishes and accessories vary by manufacturer and configuration.</p>
    </div>
  </div>`;

  const canvas = el.querySelector('canvas'), stage = el.querySelector('.v3d-stage');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  // shadows only re-render when the model changes, not when the camera turns
  renderer.shadowMap.autoUpdate = false;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  const sun = new THREE.DirectionalLight(0xffffff, 1.6);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.6;
  scene.add(sun, sun.target, new THREE.HemisphereLight(0xffffff, 0xdfe7e7, 0.35));
  const ground = new THREE.Mesh(new THREE.CircleGeometry(1, 64), new THREE.ShadowMaterial({ opacity: 0.16 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);

  const camera = new THREE.PerspectiveCamera(32, 1, 1, 20000);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true; controls.dampingFactor = 0.08; controls.maxPolarAngle = Math.PI * 0.495; controls.enablePan = false;
  controls.autoRotateSpeed = 1.2;

  // tiny tween system shared with the models
  const tweens = [];
  const EASE = { io: ease, out: t => 1 - Math.pow(1 - t, 3), lin: t => t };
  const tween = (obj, key, to, ms = 700, how = 'io') => new Promise(done => {
    if (reduce) { obj[key] = to; wake(); return done(); }
    const from = obj[key]; if (Math.abs(from - to) < 1e-6) return done();
    for (let i = tweens.length - 1; i >= 0; i--) if (tweens[i].obj === obj && tweens[i].key === key) { tweens[i].done(); tweens.splice(i, 1); }
    tweens.push({ obj, key, from, to, ms, t0: null, fn: EASE[how] || ease, done }); wake();
  });
  // wait on the render clock, so chained steps stay in step with the animation
  const wait = ms => tween({ t: 0 }, 't', 1, ms, 'lin');

  let current = null, frame = 0, dirty = true, home = null, clickables = [], slow = 0, pr = Math.min(devicePixelRatio, 2), last = 0;
  let sceneDirty = true, lowRes = false;
  const wake = () => { dirty = true; if (!frame) frame = requestAnimationFrame(loop); };
  const modelWake = () => { sceneDirty = true; wake(); };
  // while anything moves, render a little softer; one crisp frame when it settles
  const setRes = (low) => { if (low === lowRes) return; lowRes = low; renderer.setPixelRatio(low ? Math.min(pr, 1.25) : pr); renderer.setSize(stage.clientWidth, stage.clientHeight, false); };
  controls.addEventListener('change', wake);

  let ovClean = null;
  const closePanel = () => { stage.querySelector('.v3d-ov')?.remove(); ovClean?.(); ovClean = null; };
  const panel = (build) => {
    closePanel();
    const ov = document.createElement('div'); ov.className = 'v3d-ov'; ov.setAttribute('role', 'dialog');
    ov.innerHTML = '<button type="button" class="v3d-ov-x" aria-label="Close">&times;</button><div class="v3d-ov-b"></div>';
    stage.appendChild(ov); ov.querySelector('.v3d-ov-x').addEventListener('click', closePanel);
    ovClean = build(ov.querySelector('.v3d-ov-b'), closePanel) || null;
  };
  const showActs = () => el.querySelectorAll('.v3d-acts > *').forEach(b => { b.hidden = !!(b._act?.when && !b._act.when()); });
  const syncActs = () => el.querySelectorAll('.v3d-acts > *').forEach(b => b._sync?.());
  const scan = () => { clickables = []; current?.group.traverse(o => { if (o.userData.onClick) clickables.push(o); }); };
  function fit(group, view) {
    const box = new THREE.Box3().setFromObject(group), size = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
    const r = size.length() / 2;
    const dist = r / Math.sin((camera.fov * Math.PI) / 360) * 1.02;
    const dir = new THREE.Vector3(...(view || [0.9, 0.55, 1.25])).normalize();
    home = { pos: c.clone().add(dir.multiplyScalar(dist)), target: c.clone() };
    camera.near = r / 50; camera.far = r * 40; camera.updateProjectionMatrix();
    camera.position.copy(home.pos); controls.target.copy(home.target);
    controls.minDistance = r * 0.6; controls.maxDistance = r * 4;
    ground.scale.setScalar(r * 3); ground.position.set(c.x, box.min.y + 0.05, c.z);
    sun.position.set(c.x + r * 1.2, c.y + r * 2.4, c.z + r * 1.6); sun.target.position.copy(c);
    const s = sun.shadow.camera; s.left = s.bottom = -r * 1.6; s.right = s.top = r * 1.6; s.near = r * 0.2; s.far = r * 6; s.updateProjectionMatrix();
    controls.update();
  }

  function load(id) {
    closePanel();
    if (current) { scene.remove(current.group); current.group.traverse(o => { o.geometry?.dispose?.(); }); }
    const def = MODELS[id];
    current = def.build({ THREE, tween, wait, wake: modelWake, bake: g => bake(THREE, g), panel, refit: () => { if (current) { fit(current.group, current.view); wake(); } } });
    scan();
    current.group.traverse(o => { if (o.isMesh && !o.userData.noShadow) { o.castShadow = true; o.receiveShadow = true; } });
    bake(THREE, current.group);
    scene.add(current.group);
    fit(current.group, current.view);
    el.querySelector('.v3d-title b').textContent = def.name;
    el.querySelector('.v3d-title span').textContent = def.dims || '';
    el.querySelectorAll('[data-id]').forEach(x => x.setAttribute('aria-selected', String(x.dataset.id === id)));
    const sel = el.querySelector('.v3d-pick select'); if (sel) sel.value = id;
    const acts = el.querySelector('.v3d-acts');
    const after = () => { scan(); syncActs(); showActs(); modelWake(); };
    acts.replaceChildren(...(current.actions || []).map(a => {
      let node;
      if (a.options) {
        node = document.createElement('label'); node.className = 'v3d-opt';
        const sel = document.createElement('select'); sel.setAttribute('aria-label', a.label);
        a.options.forEach((o, i) => sel.add(new Option(o, i)));
        sel.addEventListener('change', () => { a.set(+sel.value); after(); });
        node.append(Object.assign(document.createElement('span'), { textContent: a.label }), sel);
        node._sync = () => { sel.value = String(a.get()); };
      } else if (a.toggle) {
        node = document.createElement('label'); node.className = 'v3d-chk';
        const cb = document.createElement('input'); cb.type = 'checkbox';
        cb.addEventListener('change', () => { a.set(cb.checked); after(); });
        node.append(cb, document.createTextNode(a.label));
        node._sync = () => { cb.checked = !!a.get(); };
      } else {
        node = document.createElement('button'); node.type = 'button'; node.textContent = a.label;
        node.addEventListener('click', () => { const r = a.run(); if (typeof r === 'string') node.textContent = r; after(); });
      }
      node._act = a;
      return node;
    }));
    syncActs();
    showActs();
    const fin = el.querySelector('.v3d-fin');
    const swatches = (current.finishes || []).map((f, i) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'v3d-sw'; b.title = f.name; b.setAttribute('aria-label', `Finish: ${f.name}`);
      b.style.background = f.swatch; if (!i) b.setAttribute('aria-pressed', 'true');
      b.addEventListener('click', () => { fin.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); current.setFinish(f); fin.querySelector('em').textContent = f.name; wake(); });
      return b;
    });
    fin.replaceChildren(...(swatches.length ? [Object.assign(document.createElement('span'), { textContent: 'Finish' }), ...swatches, Object.assign(document.createElement('em'), { textContent: current.finishes[0].name })] : []));
    el.querySelector('.v3d-load').hidden = true;
    modelWake();
  }

  function loop(now) {
    frame = 0;
    let active = false;
    for (let i = tweens.length - 1; i >= 0; i--) {
      const tw = tweens[i]; if (tw.t0 === null) tw.t0 = now;
      const k = Math.min(1, (now - tw.t0) / tw.ms);
      tw.obj[tw.key] = tw.from + (tw.to - tw.from) * tw.fn(k);
      if (k >= 1) { tweens.splice(i, 1); tw.done(); } else active = true;
    }
    // slow machine: step the render resolution down instead of dropping frames
    if (last && now - last > 26) { if (++slow > 24 && pr > 1) { pr = Math.max(1, pr - 0.25); renderer.setPixelRatio(pr); resize(); slow = 0; } } else slow = Math.max(0, slow - 1);
    last = active || controls.autoRotate || lowRes ? now : 0;
    const moving = controls.update(), busy = active || moving || controls.autoRotate;
    if (busy) setRes(true);
    if (active || sceneDirty) { renderer.shadowMap.needsUpdate = true; sceneDirty = false; }
    if (dirty || busy) { renderer.render(scene, camera); dirty = false; }
    if (busy) frame = requestAnimationFrame(loop);
    else if (lowRes) { setRes(false); renderer.shadowMap.needsUpdate = true; renderer.render(scene, camera); }
  }

  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); wake();
  }
  new ResizeObserver(resize).observe(stage);

  // click a part to interact (drawers, doors, carriages...)
  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
  let down = null;
  canvas.addEventListener('pointerdown', e => { down = [e.clientX, e.clientY]; });
  canvas.addEventListener('pointerup', e => {
    if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 6 || !current) return;
    const r = canvas.getBoundingClientRect();
    ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ptr, camera);
    for (const hit of ray.intersectObject(current.group, true)) {
      let o = hit.object; while (o && !o.userData.onClick) o = o.parent;
      if (o) { o.userData.onClick(); modelWake(); break; }
    }
  });
  let hoverQ = null;
  canvas.addEventListener('pointermove', e => {
    if (e.buttons || !current || !clickables.length) return;
    if (!hoverQ) requestAnimationFrame(() => {
      const r = canvas.getBoundingClientRect(), p = hoverQ; hoverQ = null;
      ptr.set(((p[0] - r.left) / r.width) * 2 - 1, -((p[1] - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ptr, camera);
      canvas.style.cursor = ray.intersectObjects(clickables, true).length ? 'pointer' : 'grab';
    });
    hoverQ = [e.clientX, e.clientY];
  });

  el.querySelector('[data-v=reset]').addEventListener('click', () => { if (home) { camera.position.copy(home.pos); controls.target.copy(home.target); controls.update(); wake(); } });
  const spin = el.querySelector('[data-v=spin]');
  spin.addEventListener('click', () => { controls.autoRotate = !controls.autoRotate; spin.setAttribute('aria-pressed', String(controls.autoRotate)); wake(); });
  el.querySelector('[data-v=full]').addEventListener('click', () => {
    const box = el.querySelector('.v3d-main');
    if (document.fullscreenElement) document.exitFullscreen(); else (box.requestFullscreen || box.webkitRequestFullscreen)?.call(box);
  });
  canvas.addEventListener('pointerdown', () => el.querySelector('.v3d-hint')?.classList.add('gone'), { once: true });
  el.querySelectorAll('[data-id]').forEach(b => b.addEventListener('click', () => load(b.dataset.id)));
  el.querySelector('.v3d-pick select')?.addEventListener('change', e => load(e.target.value));
  const want = new URLSearchParams(location.search).get('model');
  const first = want && ids.includes(want) ? want : ids[0];
  resize(); load(first);
}

// start each viewer only when it scrolls near the screen
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { io.unobserve(e.target); try { viewer(e.target); } catch (err) { e.target.innerHTML = '<p class="v3d-note">3D preview is not available in this browser.</p>'; console.error(err); } } }), { rootMargin: '300px' });
document.querySelectorAll('.v3d').forEach(el => io.observe(el));
