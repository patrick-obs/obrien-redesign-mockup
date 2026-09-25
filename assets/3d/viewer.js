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
// phones, tablets and modest laptops get a lighter renderer: cheaper shadows, no antialiasing, a lower resolution cap
const LOW = matchMedia('(pointer: coarse)').matches || (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4;
const PR_MAX = LOW ? 1.5 : 2;
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
  { name: 'Mobile & automated', ids: ['hd-mobile', 'wire-track', 'vlm', 'vertical-carousel', 'rotary'] },
  { name: 'Shelving & racks', ids: ['four-post', 'bin-shelving', 'wire-shelving', 'library', 'tire-rack'] },
  { name: 'Lockers & security', ids: ['lockers', 'smart-lockers', 'athletic', 'evidence-lockers', 'weapons'] },
  { name: 'Cabinets', ids: ['flat-files', 'fireproof', 'museum-cabinet', 'wardrobe'] },
  { name: 'Museum & art', ids: ['art-screens', 'wall-art', 'painting-bins', 'textile-rack', 'pallet-museum', 'wall-etrack'] },
  { name: 'Workspace', ids: ['casework', 'workstation', 'ss-table', 'mail-sorter'] },
  { name: 'Residential & campus', ids: ['bike-storage'] },
  { name: 'Industrial', ids: ['pallet-rack', 'mezzanine', 'wire-cage'] },
  { name: 'For architects & GCs', ids: ['install'] },
];

function viewer(el) {
  const ids = (el.dataset.models || el.dataset.model || '').split(',').map(s => s.trim()).filter(id => MODELS[id]);
  if (!ids.length) return;
  el.classList.add('v3d-on');
  const side = el.dataset.layout === 'side' && ids.length > 1;
  // models outside the showroom groups (mobile variants on a customer page) still get a place in the menu
  const listed = new Set(GROUPS.flatMap(g => g.ids)), extra = ids.filter(id => !listed.has(id));
  const groups = GROUPS.map(g => ({ ...g, ids: [...g.ids.filter(id => ids.includes(id)), ...(g.ids.includes('hd-mobile') ? extra.filter(id => id.startsWith('hd-mobile')) : [])] }))
    .concat([{ name: 'More systems', ids: extra.filter(id => !id.startsWith('hd-mobile')) }]).filter(g => g.ids.length);
  const ICON = {
    spin: '<svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v5h-5"/></svg>',
    reset: '<svg viewBox="0 0 24 24"><path d="M3 12h4M17 12h4M12 3v4M12 17v4"/><circle cx="12" cy="12" r="3"/></svg>',
    full: '<svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
  };
  el.innerHTML = `
  <div class="v3d-wrap${side ? ' has-side' : ''}">
    ${side ? `<nav class="v3d-side" aria-label="Choose a product"><input class="v3d-find" type="search" placeholder="Find a system" aria-label="Find a system">${groups.map(g => `<details class="v3d-g"><summary>${g.name}<em>${g.ids.length}</em></summary>${g.ids.map(id => `<button type="button" data-id="${id}">${MODELS[id].name}</button>`).join('')}</details>`).join('')}</nav>
      <label class="v3d-pick"><span>Product</span><select>${groups.map(g => `<optgroup label="${g.name}">${g.ids.map(id => `<option value="${id}">${MODELS[id].name}</option>`).join('')}</optgroup>`).join('')}</select></label>`
      : ids.length > 1 ? `<div class="v3d-seg" role="tablist">${ids.map(id => `<button type="button" role="tab" data-id="${id}">${MODELS[id].short || MODELS[id].name}</button>`).join('')}</div>` : ''}
    <div class="v3d-main">
      <div class="v3d-top">
        ${ids.length > 1 ? '<div class="v3d-steps"><button type="button" class="v3d-step" data-step="-1" aria-label="Previous system">&lsaquo;</button><button type="button" class="v3d-step" data-step="1" aria-label="Next system">&rsaquo;</button></div>' : ''}<div class="v3d-title"><b></b><span></span></div>
        <div class="v3d-icons">
          <button type="button" data-v="spin" aria-pressed="false" title="Auto-rotate" aria-label="Auto-rotate">${ICON.spin}</button>
          <button type="button" data-v="reset" title="Reset view" aria-label="Reset view">${ICON.reset}</button>
          <button type="button" data-v="full" title="Full screen" aria-label="Full screen">${ICON.full}</button>
        </div>
      </div>
      <div class="v3d-stage">
        <canvas aria-label="Interactive 3D model. Drag to rotate, scroll or pinch to zoom."></canvas>
        <div class="v3d-load">Loading 3D model...</div>
        <div class="v3d-hint">Drag to turn &middot; Click, then scroll to zoom &middot; Tap parts to move them</div>
        <div class="v3d-wheel" hidden>Click the model first to zoom with the scroll wheel</div>
        <div class="v3d-prompt" hidden></div>
        <button type="button" class="v3d-peg" hidden title="Step inside" aria-label="Step inside at eye level"><svg viewBox="0 0 24 24"><circle cx="12" cy="4.5" r="2.6"/><path d="M8.5 22l1.2-8.2-2.2 1.2V10.5c0-1.4 1.1-2.5 2.5-2.5h4c1.4 0 2.5 1.1 2.5 2.5V15l-2.2-1.2L15.5 22"/></svg><span>Step inside</span></button>
        <div class="v3d-walkbar" hidden><div class="v3d-stops" role="group" aria-label="Tour stops"></div><span>Drag to look</span><button type="button" class="v3d-wfs" aria-label="Full screen">Full screen</button><button type="button" class="v3d-exit">Step out <kbd>Esc</kbd></button></div>
        <div class="v3d-toast" hidden></div>
        <button type="button" class="v3d-optbtn" aria-expanded="false"><svg viewBox="0 0 24 24"><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/></svg><span>Options</span></button>
      </div>
      <div class="v3d-bar">
        <div class="v3d-row"><div class="v3d-acts"></div><div class="v3d-fin"></div><button type="button" class="v3d-cust" aria-expanded="false" hidden><svg viewBox="0 0 24 24"><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/></svg><span>Customize</span><em></em></button></div>
        <div class="v3d-panel" hidden><div class="v3d-presets" hidden></div><div class="v3d-set"></div></div>
      </div>
      <p class="v3d-note">Representative model. Sizes, finishes and accessories vary by manufacturer and configuration.</p>
    </div>
  </div>`;

  const canvas = el.querySelector('canvas'), stage = el.querySelector('.v3d-stage');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !LOW, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, PR_MAX));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = LOW ? THREE.PCFShadowMap : THREE.PCFSoftShadowMap;
  // shadows only re-render when the model changes, not when the camera turns
  renderer.shadowMap.autoUpdate = false;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  const sun = new THREE.DirectionalLight(0xffffff, 1.6);
  sun.castShadow = true; sun.shadow.mapSize.set(LOW ? 1024 : 2048, LOW ? 1024 : 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.6;
  const hemi = new THREE.HemisphereLight(0xffffff, 0xdfe7e7, 0.35), fill = new THREE.DirectionalLight(0xffffff, 0);
  scene.add(sun, sun.target, hemi, fill, fill.target);
  const ground = new THREE.Mesh(new THREE.CircleGeometry(1, 64), new THREE.ShadowMaterial({ opacity: 0.16 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  // a soft floor that fades out under the model, so it sits on something instead of floating (one draw call)
  const floorDisc = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 8, 64, 64, 64); gr.addColorStop(0, 'rgba(206,214,214,0.95)'); gr.addColorStop(0.55, 'rgba(214,221,221,0.55)'); gr.addColorStop(1, 'rgba(222,228,228,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; const m = new THREE.Mesh(new THREE.CircleGeometry(1, 48), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, toneMapped: false })); m.rotation.x = -Math.PI / 2; m.renderOrder = -1; scene.add(m); return m; })();

  const camera = new THREE.PerspectiveCamera(32, 1, 1, 20000);
  const controls = new OrbitControls(camera, canvas);
  controls.enableZoom = false;
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

  let current = null, frame = 0, dirty = true, home = null, clickables = [], slow = 0, pr = Math.min(devicePixelRatio, PR_MAX), last = 0;
  let lastDraw = 0, wasActive = false, sceneDirty = true, lowRes = false, heavy = false, measured = false, shadowTick = 0;
  const wake = () => { dirty = true; if (!frame) frame = requestAnimationFrame(loop); };
  const modelWake = () => { sceneDirty = true; wake(); };
  // while anything moves, render a little softer; one crisp frame when it settles
  const setRes = (low) => { if (low === lowRes) return; lowRes = low; renderer.setPixelRatio(low ? Math.min(pr, 1) : pr); renderer.setSize(stage.clientWidth, stage.clientHeight, false); };
  controls.addEventListener('change', wake);

  let ovClean = null;
  const closePanel = () => { stage.querySelector('.v3d-ov')?.remove(); ovClean?.(); ovClean = null; };
  const panel = (build) => {
    closePanel(); measured = false;
    const ov = document.createElement('div'); ov.className = 'v3d-ov'; ov.setAttribute('role', 'dialog');
    ov.innerHTML = '<button type="button" class="v3d-ov-x" aria-label="Close">&times;</button><div class="v3d-ov-b"></div>';
    stage.appendChild(ov); ov.querySelector('.v3d-ov-x').addEventListener('click', closePanel);
    ovClean = build(ov.querySelector('.v3d-ov-b'), closePanel) || null;
  };
  let panelOpen = false;
  const setPanel = (on) => { panelOpen = on; const p = el.querySelector('.v3d-panel'), c = el.querySelector('.v3d-cust'); p.hidden = !on; c.setAttribute('aria-expanded', String(on)); c.classList.toggle('on', on); };
  const showActs = () => {
    const nodes = [...el.querySelectorAll('.v3d-bar .v3d-ctl')];
    nodes.forEach(b => { b.hidden = !!(b._act?.when && !b._act.when()); });
    const n = nodes.filter(b => !b.hidden && b.closest('.v3d-set')).length, hasPre = !el.querySelector('.v3d-presets').hidden;
    const c = el.querySelector('.v3d-cust'); c.hidden = !n && !hasPre; c.querySelector('em').textContent = n ? String(n) : '';
    if (c.hidden) setPanel(false);
  };
  const syncActs = () => el.querySelectorAll('.v3d-bar .v3d-ctl').forEach(b => b._sync?.());
  const scan = () => { clickables = []; current?.group.traverse(o => { if (o.userData.onClick) clickables.push(o); }); };
  let walking = false, walkB = null, rings = null, walkFloor = null;
  const keys = new Set(), peg = el.querySelector('.v3d-peg'), walkbar = el.querySelector('.v3d-walkbar'), toastEl = el.querySelector('.v3d-toast');
  let toastT = 0;
  const toast = (msg) => { toastEl.textContent = msg; toastEl.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { toastEl.hidden = true; }, 3200); };
  // eye-level look: yaw and pitch you steer by dragging (or arrow keys); the orbit controls rest while you walk
  let yaw = 0, pitch = 0, flying = false, walkNear = 0;
  const lookDir = () => new THREE.Vector3(-Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch));
  const applyLook = () => { const t = camera.position.clone().add(lookDir().multiplyScalar(8)); controls.target.copy(t); camera.lookAt(t); };
  // glide the camera to a point and look at another
  // at eye level you stand in the carriages' shade: lift the fill, soften the shadows, and fit the shadow map around you
  let shadowAt = null;
  const walkLight = (on) => {
    hemi.intensity = on ? 0.8 : 0.35; fill.intensity = on ? 0.55 : 0; sun.shadow.intensity = on ? 0.55 : 1; renderer.toneMappingExposure = on ? 1.18 : 1.05;
    if (!on && home) { fit.sun?.(); shadowAt = null; }
    renderer.shadowMap.needsUpdate = true;
  };
  const shadowAround = (p, force) => {
    if (!force && shadowAt && Math.hypot(p.x - shadowAt.x, p.z - shadowAt.z) < 36) return;
    shadowAt = p.clone(); const R = 260, s2 = sun.shadow.camera;
    sun.target.position.set(p.x, walkB ? walkB.floor : p.y - 64, p.z); sun.position.copy(sun.target.position).add(new THREE.Vector3(R * 0.6, R * 1.4, R * 0.9));
    s2.left = s2.bottom = -R; s2.right = s2.top = R; s2.near = 10; s2.far = R * 4; s2.updateProjectionMatrix(); renderer.shadowMap.needsUpdate = true;
  };
  const fly = (pos, target, ms = 800) => {
    walking = true; walkLight(true); shadowAround(pos, true); flying = true; controls.enabled = false; controls.autoRotate = false; tween(camera, 'fov', 96, ms);
    // up close nothing should slice open: a 1" near plane at eye level (big models use a far one for the overview)
    if (!walkNear) walkNear = camera.near; camera.near = 1; camera.updateProjectionMatrix();
    const d = target.clone().sub(pos).normalize(); yaw = Math.atan2(-d.x, -d.z); pitch = Math.asin(Math.max(-1, Math.min(1, d.y)));
    const t8 = pos.clone().add(d.multiplyScalar(8));
    ['x', 'y', 'z'].forEach(a => { tween(camera.position, a, pos[a], ms, 'out'); tween(controls.target, a, t8[a], ms, 'out'); });
    setTimeout(() => { flying = false; }, ms + 30);
    el.querySelector('.v3d-main').classList.add('v3d-walk');
  };
  const overview = (ms = 700) => {
    if (!home) return; walking = false; flying = false; walkB = null; walkLight(false); floorDisc.visible = true; keys.clear(); if (rings) { scene.remove(rings); rings = null; } if (walkFloor) { scene.remove(walkFloor); walkFloor = null; }
    controls.enabled = true; if (walkNear) { camera.near = walkNear; walkNear = 0; camera.updateProjectionMatrix(); } controls.minDistance = home.r * 0.6; controls.maxDistance = home.r * 4; tween(camera, 'fov', 32, ms);
    walkbar.hidden = true; peg.hidden = !current;
    ['x', 'y', 'z'].forEach(a => { tween(camera.position, a, home.pos[a], ms, 'out'); tween(controls.target, a, home.target[a], ms, 'out'); });
    el.querySelector('.v3d-main').classList.remove('v3d-walk');
  };
  // step inside: a guided tour at eye level. The model names its own stops (walk().stops: an aisle's mouth, middle and far
  // end), every model gets stops all the way around it, and tapping one glides you there; drag to look, Esc to step out
  let tourStops = [], tourAt = 0;
  const tourBar = el.querySelector('.v3d-stops');
  const stopsNow = () => {
    const m = current.group.matrixWorld, V = a => new THREE.Vector3(...a).applyMatrix4(m), w = current.walk?.() || {};
    const box = new THREE.Box3().setFromObject(current.group), c = box.getCenter(new THREE.Vector3()), floor = w.floor != null ? V([0, w.floor, 0]).y : box.min.y;
    const eyeY = floor + 64, look = new THREE.Vector3(c.x, floor + 46, c.z), hx = (box.max.x - box.min.x) / 2 + 60, hz = (box.max.z - box.min.z) / 2 + 60;
    const own = (w.stops || (w.eye ? [{ label: 'Step in', eye: w.eye, look: w.look }] : [])).map(q => ({ label: q.label, eye: V(q.eye), look: V(q.look) }));
    const around = [['Front', 0, 1], ['Right side', 1, 0], ['Behind', 0, -1], ['Left side', -1, 0]].map(([label, sx, sz]) => ({ label, eye: new THREE.Vector3(c.x + sx * hx, eyeY, c.z + sz * hz), look }));
    return { stops: [...own, ...around], floor, box };
  };
  const goStop = (i) => {
    if (!current) return; const { stops } = stopsNow(); if (!stops.length) return;
    tourAt = (i + stops.length) % stops.length; const q = stops[tourAt];
    fly(q.eye, q.look, walking ? 900 : 800);
    tourBar.querySelectorAll('button').forEach((b2, n) => b2.setAttribute('aria-pressed', String(n === tourAt)));
  };
  const enterWalk = () => {
    if (!current) return;
    stopDemo(); closePanel();
    const { stops, floor, box } = stopsNow(); tourStops = stops;
    walkB = { floor };
    tourBar.replaceChildren(...stops.map((q, n) => { const b2 = document.createElement('button'); b2.type = 'button'; b2.textContent = q.label; b2.addEventListener('click', () => goStop(n)); return b2; }));
    // a real floor to stand on, with a faint grid
    const fw = box.max.x - box.min.x + 400, fd = box.max.z - box.min.z + 400;
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(fw, fd), new THREE.MeshLambertMaterial({ color: 0xd3d7d6 })); fl.rotation.x = -Math.PI / 2;
    const grid = new THREE.GridHelper(Math.max(fw, fd), Math.round(Math.max(fw, fd) / 24), 0xbfc5c4, 0xc7cccb); grid.position.y = 0.02;
    floorDisc.visible = false; walkFloor = new THREE.Group(); walkFloor.add(fl, grid); walkFloor.position.set((box.min.x + box.max.x) / 2, floor - 0.08, (box.min.z + box.max.z) / 2); scene.add(walkFloor);
    goStop(0);
    peg.hidden = true; walkbar.hidden = false; walkbar.classList.remove('quiet'); clearTimeout(walkbar._t); walkbar._t = setTimeout(() => walkbar.classList.add('quiet'), 4500);
    el.querySelector('.v3d-prompt')?.classList.add('gone'); el.focus({ preventScroll: true }); modelWake();
  };
  const toLocal = () => camera.position.clone().applyMatrix4(new THREE.Matrix4().copy(current.group.matrixWorld).invert());
  const walkKeys = () => false;
  el.v3dDebug = () => ({ camera, controls, group: current?.group, THREE, wake: modelWake });
  el.tabIndex = -1; el.v3dState = () => ({ cam: camera.position.toArray().map(Math.round), walking, stop: tourAt, active: document.activeElement?.className });
  addEventListener('keydown', e => {
    if (!walking || !(el.contains(document.activeElement) || el.matches(':hover') || document.fullscreenElement)) return;
    const k = e.key.toLowerCase();
    if (k === 'escape') { overview(); syncActs(); showActs(); e.preventDefault(); return; }
    if (k === 'arrowright' || k === 'arrowleft') { goStop(tourAt + (k === 'arrowright' ? 1 : -1)); e.preventDefault(); }
  });
  peg.addEventListener('click', enterWalk);
  el.querySelector('.v3d-cust').addEventListener('click', () => setPanel(!panelOpen));
  let lookDrag = null;
  canvas.addEventListener('pointerdown', e => { if (!walking || flying) return; lookDrag = [e.clientX, e.clientY]; canvas.setPointerCapture?.(e.pointerId); });
  canvas.addEventListener('pointermove', e => { if (!lookDrag) return; const k = 0.0042 * (camera.fov / 96); yaw += (e.clientX - lookDrag[0]) * k; pitch = Math.max(-1.1, Math.min(1.1, pitch + (e.clientY - lookDrag[1]) * k)); lookDrag = [e.clientX, e.clientY]; applyLook(); wake(); });
  addEventListener('pointerup', () => { lookDrag = null; });
  // full screen keeps the view clean: the settings open on demand over the model
  el.querySelector('.v3d-optbtn').addEventListener('click', e => { const m = el.querySelector('.v3d-main'), on = m.classList.toggle('v3d-opts'); if (on && !el.querySelector('.v3d-cust').hidden) setPanel(true); e.currentTarget.setAttribute('aria-expanded', String(on)); e.currentTarget.querySelector('span').textContent = on ? 'Hide options' : 'Options'; });
  el.querySelector('.v3d-wfs').addEventListener('click', () => { const box = el.querySelector('.v3d-main'); if (document.fullscreenElement) document.exitFullscreen(); else (box.requestFullscreen || box.webkitRequestFullscreen)?.call(box); el.focus({ preventScroll: true }); });
  el.querySelector('.v3d-exit').addEventListener('click', () => { overview(); syncActs(); showActs(); });

  // left alone, a model slowly turns and demonstrates itself (doors, drawers, carriages); any touch hands over control
  let demoOn = false, demoT = 0, demoVisible = true, touched = false;
  const demoHit = (o) => {
    if (o.isInstancedMesh) return { instanceId: Math.floor(Math.random() * o.count), point: new THREE.Vector3() };
    const b = new THREE.Box3().setFromObject(o), p = new THREE.Vector3(THREE.MathUtils.lerp(b.min.x, b.max.x, 0.3 + Math.random() * 0.4), THREE.MathUtils.lerp(b.min.y, b.max.y, 0.2 + Math.random() * 0.6), b.max.z);
    return { point: p, object: o };
  };
  const demoStep = () => {
    if (!demoOn) return;
    if (!demoVisible || document.hidden || walking) { demoT = setTimeout(demoStep, 1500); return; }
    const vis = clickables.filter(o => { let q = o; while (q) { if (!q.visible) return false; q = q.parent; } return true; });
    if (!vis.length) { demoT = setTimeout(demoStep, 3000); return; }
    const o = vis[Math.floor(Math.random() * vis.length)], h = demoHit(o);
    try { o.userData.onClick(h); modelWake(); } catch (err) { /* a demo click that does not apply is skipped */ }
    demoT = setTimeout(() => { if (!demoOn) return; try { o.userData.onClick(h); modelWake(); } catch (err) { /* skip */ } demoT = setTimeout(demoStep, 4000); }, 2800);
  };
  const startDemo = () => { if (reduce || touched || window.V3D_NODEMO) return; demoOn = true; controls.autoRotate = true; controls.autoRotateSpeed = 0.6; el.querySelector('[data-v=spin]')?.setAttribute('aria-pressed', 'true'); clearTimeout(demoT); if (!LOW) demoT = setTimeout(demoStep, 5000); wake(); };
  function stopDemoTimers() { clearTimeout(demoT); }
  function stopDemo() { if (touched) return; touched = true; demoOn = false; clearTimeout(demoT); controls.autoRotate = false; controls.autoRotateSpeed = 1.2; el.querySelector('[data-v=spin]')?.setAttribute('aria-pressed', 'false'); }
  ['pointerdown', 'wheel', 'keydown', 'touchstart'].forEach(t => el.addEventListener(t, stopDemo, { capture: true, passive: true }));
  new IntersectionObserver(es => es.forEach(e => { demoVisible = e.isIntersecting; if (demoVisible && demoOn) wake(); })).observe(el);
  addEventListener('v3d-tex', () => modelWake());

  function fit(group, view) {
    const box = new THREE.Box3().setFromObject(group), size = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
    const r = size.length() / 2;
    const dist = r / Math.sin((camera.fov * Math.PI) / 360) * 1.22;
    const dir = new THREE.Vector3(...(view || [0.9, 0.55, 1.25])).normalize();
    home = { pos: c.clone().add(dir.multiplyScalar(dist)), target: c.clone() };
    camera.fov = 32; camera.near = r / 50; camera.far = r * 40; camera.updateProjectionMatrix();
    camera.position.copy(home.pos); controls.target.copy(home.target);
    controls.minDistance = r * 0.6; controls.maxDistance = r * 4; home.r = r; walking = false; flying = false; controls.enabled = true;
    ground.scale.setScalar(r * 3); ground.position.set(c.x, box.min.y + 0.05, c.z);
    floorDisc.scale.setScalar(r * 1.35); floorDisc.position.set(c.x, box.min.y + 0.02, c.z); floorDisc.visible = true;
    sun.position.set(c.x + r * 1.2, c.y + r * 2.4, c.z + r * 1.6); sun.target.position.copy(c);
    fit.sun = () => { sun.position.set(c.x + r * 1.2, c.y + r * 2.4, c.z + r * 1.6); sun.target.position.copy(c); const s = sun.shadow.camera; s.left = s.bottom = -r * 1.6; s.right = s.top = r * 1.6; s.near = r * 0.2; s.far = r * 6; s.updateProjectionMatrix(); };
    fit.sun();
    controls.update();
  }

  // quick clicks through the menu collapse into one load; the model builds after the clicking stops,
  // its shaders compile in the background, and the model it replaces gives back its GPU memory
  let loadT = 0, loadTok = 0;
  const request = (id) => {
    if (!MODELS[id]) return; curId = id; clearTimeout(loadT);
    el.querySelector('.v3d-title b').textContent = MODELS[id].name; el.querySelector('.v3d-title span').textContent = MODELS[id].dims || '';
    el.querySelectorAll('[data-id]').forEach(x => x.setAttribute('aria-selected', String(x.dataset.id === id)));
    el.querySelector('.v3d-load').hidden = false;
    loadT = setTimeout(() => load(id), current ? 160 : 0);
  };
  // geometry and one-off textures go; materials stay, so their compiled shaders are reused by the next model (no recompile hitch)
  let finPick = 0, finKey = '';
  function renderFin() {
    const fin = el.querySelector('.v3d-fin'), list = current?.finishes || [], key = list.map(f => f.name).join('|');
    if (key === finKey) return; finKey = key; if (finPick >= list.length) finPick = 0;
    if (list.length < 2) { fin.replaceChildren(); return; }
    const name = Object.assign(document.createElement('em'), { textContent: list[finPick].name });
    const sw = list.map((f, i) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'v3d-sw'; b.title = f.name; b.setAttribute('aria-label', 'Finish: ' + f.name); b.style.background = f.swatch; b.setAttribute('aria-pressed', String(i === finPick));
      b.addEventListener('click', () => { finPick = i; fin.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); current.setFinish(f); name.textContent = f.name; wake(); }); return b; });
    fin.replaceChildren(Object.assign(document.createElement('span'), { textContent: 'Finish' }), ...sw, name);
  }
  const release = (g) => g.traverse(o => { o.geometry?.dispose?.(); for (const m of [].concat(o.material || [])) { if (!m) continue; for (const k of ['map', 'alphaMap', 'normalMap']) { const t = m[k]; if (t && !t.userData?.keep) t.dispose(); } } });
  async function load(id) {
    const tok = ++loadTok;
    closePanel(); stopDemoTimers();
    if (walking) overview(1);
    // a model whose shaders are still compiling is released only after the compile settles (never mid-compile)
    if (current) { scene.remove(current.group); if (current._compiling) current._stale = true; else release(current.group); current = null; clickables = []; }
    await new Promise(r => requestAnimationFrame(r)); if (tok !== loadTok) return;
    const def = MODELS[id];
    current = def.build({ THREE, tween, wait, wake: modelWake, bake: g => bake(THREE, g), panel, toast, lite: el.dataset.lite === '1', fly: (p, t) => { const m = current.group.matrixWorld; fly(new THREE.Vector3(...p).applyMatrix4(m), new THREE.Vector3(...t).applyMatrix4(m)); }, overview: () => overview(), isWalking: () => walking, playerPos: () => (walking ? toLocal() : null), refresh: () => { syncActs(); showActs(); }, refit: () => { if (current) { if (walking) overview(1); fit(current.group, current.view); wake(); } } });
    scan();
    current.group.traverse(o => { if (o.isMesh && !o.userData.noShadow) { o.castShadow = true; o.receiveShadow = true; } });
    bake(THREE, current.group);
    const sph = new THREE.Sphere();
    current.group.traverse(o => { if (!o.isMesh || o.userData.noShadow) return; if (o.isInstancedMesh) { o.castShadow = false; return; } if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere(); sph.copy(o.geometry.boundingSphere); o.castShadow = sph.radius * Math.max(o.scale.x, o.scale.y, o.scale.z) > 5; });
    const built = current; built._compiling = true;
    try { await renderer.compileAsync(built.group, camera, scene); } catch (err) { /* older browsers compile on first draw */ }
    built._compiling = false;
    if (built._stale || tok !== loadTok || current !== built) { release(built.group); return; }
    scene.add(current.group); measured = false;
    fit(current.group, current.view);
    curId = id; el.querySelectorAll('.v3d-side details').forEach(d => { if (d.querySelector('[data-id="' + id + '"]')) d.open = true; });
    { const nb = el.querySelector('.v3d-side [data-id="' + id + '"]'), nav = nb?.closest('.v3d-side'); if (nb && nav && nb.offsetTop - nav.scrollTop > nav.clientHeight - 40) nav.scrollTop = nb.offsetTop - nav.clientHeight / 2; }
    el.querySelector('.v3d-title b').textContent = def.name;
    el.querySelector('.v3d-title span').textContent = def.dims || '';
    el.querySelectorAll('[data-id]').forEach(x => x.setAttribute('aria-selected', String(x.dataset.id === id)));
    const sel = el.querySelector('.v3d-pick select'); if (sel) sel.value = id;
    const acts = el.querySelector('.v3d-acts'), setGrid = el.querySelector('.v3d-set');
    const after = () => { scan(); syncActs(); showActs(); renderFin(); modelWake(); };
    const btnRow = document.createElement('div'); btnRow.className = 'v3d-btns';
    acts.replaceChildren(btnRow); setGrid.replaceChildren();
    const exitWalk = () => { if (walking) overview(1); };
    (current.actions || []).forEach(a => {
      let node;
      if (a.options) {
        // a few short choices read best as buttons you tap; long lists stay a dropdown
        const short = a.options.length <= 4 && a.options.join('').length <= 46;
        node = document.createElement('div'); node.className = short ? 'v3d-choice' : 'v3d-opt';
        const lab = Object.assign(document.createElement('span'), { textContent: a.label });
        if (short) {
          const row = document.createElement('div'); row.className = 'v3d-pills'; row.setAttribute('role', 'radiogroup'); row.setAttribute('aria-label', a.label);
          const bs = a.options.map((o, i) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = o; b.setAttribute('role', 'radio'); b.addEventListener('click', () => { exitWalk(); a.set(i); after(); }); return b; });
          row.append(...bs); node.append(lab, row);
          node._sync = () => { const v = a.get(); bs.forEach((b, i) => b.setAttribute('aria-checked', String(i === v))); };
        } else {
          const sel = document.createElement('select'); sel.setAttribute('aria-label', a.label);
          a.options.forEach((o, i) => sel.add(new Option(o, i)));
          sel.addEventListener('change', () => { exitWalk(); a.set(+sel.value); after(); });
          node.append(lab, sel);
          node._sync = () => { sel.value = String(a.get()); };
        }
      } else if (a.toggle) {
        node = document.createElement('label'); node.className = 'v3d-switch';
        const cb = document.createElement('input'); cb.type = 'checkbox'; cb.setAttribute('role', 'switch');
        cb.addEventListener('change', () => { exitWalk(); a.set(cb.checked); after(); });
        node.append(cb, Object.assign(document.createElement('i'), {}), Object.assign(document.createElement('span'), { textContent: a.label }));
        node._sync = () => { cb.checked = !!a.get(); };
      } else {
        node = document.createElement('button'); node.type = 'button'; node.textContent = a.label;
        node.addEventListener('click', () => { const r = a.run(); if (typeof r === 'string') node.textContent = r; after(); });
      }
      node._act = a; node.classList.add('v3d-ctl');
      (a.options || a.toggle ? setGrid : btnRow).appendChild(node);
    });
    peg.hidden = false; walkbar.hidden = true; if (rings) { scene.remove(rings); rings = null; } if (walkFloor) { scene.remove(walkFloor); walkFloor = null; } walkB = null;
    const pr = el.querySelector('.v3d-presets'), pl = el.dataset.lite === '1' ? [] : current.presets || [];
    pr.hidden = !pl.length; pr.replaceChildren(...(pl.length ? [Object.assign(document.createElement('span'), { textContent: 'Start from' })] : []), ...pl.map(p => { const b = document.createElement('button'); b.type = 'button'; b.textContent = p.label; b.addEventListener('click', () => { exitWalk(); pr.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); p.run(); after(); }); return b; }));
    syncActs(); showActs(); setPanel(panelOpen && !el.querySelector('.v3d-cust').hidden);
    const pm = el.querySelector('.v3d-prompt'), ptxt = current.prompt || (clickables.length ? 'Tap parts of the model to open or move them' : '');
    pm.textContent = ptxt; pm.hidden = !ptxt; pm.classList.remove('gone');
    finPick = 0; finKey = ''; renderFin();
    el.querySelector('.v3d-load').hidden = true;
    modelWake(); startDemo();
  }

  function loop(now) {
    frame = 0;
    let active = false; const stepped = tweens.length > 0;
    for (let i = tweens.length - 1; i >= 0; i--) {
      const tw = tweens[i]; if (tw.t0 === null) tw.t0 = now;
      const k = Math.min(1, (now - tw.t0) / tw.ms);
      tw.obj[tw.key] = tw.from + (tw.to - tw.from) * tw.fn(k);
      if (k >= 1) { tweens.splice(i, 1); tw.done(); } else active = true;
    }
    // slow machine: step the render resolution down instead of dropping frames
    if (last && now - last > 26) { if (++slow > 24 && pr > 1) { pr = Math.max(1, pr - 0.25); renderer.setPixelRatio(pr); resize(); slow = 0; } } else slow = Math.max(0, slow - 1);
    last = active || controls.autoRotate || lowRes ? now : 0;
    if (stepped) { current?.tick?.(); camera.updateProjectionMatrix(); }
    let stepping = false; try { stepping = walkKeys(now); } catch (err) { console.error('walk', err.message, String(err.stack).slice(0, 300)); keys.clear(); }
    const moving = walking ? false : controls.update(); if (walking && !flying) applyLook(); else if (walking) camera.lookAt(controls.target);
    if (walking) { fill.position.copy(camera.position); fill.target.position.copy(controls.target); fill.target.updateMatrixWorld(); if (!flying) shadowAround(camera.position); }
    const busy = active || moving || controls.autoRotate || stepping;
    if (busy) setRes(true);
    // moving parts refresh shadows every few frames; a settled frame always gets a fresh shadow map
    if (sceneDirty || (active && !heavy && !LOW && ++shadowTick % 4 === 0) || (wasActive && !active)) { renderer.shadowMap.needsUpdate = true; sceneDirty = false; }
    wasActive = active;
    const idleSpin = demoOn && !active && !stepping && !dirty && now - lastDraw < 32;
    if ((dirty || busy) && !idleSpin) { lastDraw = now; renderer.render(scene, camera); dirty = false; if (!measured) { measured = true; heavy = renderer.info.render.calls > 90; } }
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
    // first solid surface wins, except that a part you can pick (a box, bin or drawer) just behind a thin edge takes the click
    const ok = hit => { const m = hit.object.material; if (!hit.object.visible) return false; let q = hit.object.parent; while (q) { if (!q.visible) return false; q = q.parent; } return !(m && (m.transparent && m.opacity < 0.6 || m.alphaTest > 0 && !hit.object.userData.onClick && !hit.object.parent?.userData.onClick)); };
    const hits = ray.intersectObject(current.group, true).filter(ok);
    if (hits.length) {
      const hit = hits.find(h => h.object.userData.onClick && h.distance < hits[0].distance + 3) || hits[0];
      let o = hit.object; while (o && !o.userData.onClick) o = o.parent;
      if (o) { o.userData.onClick(hit); modelWake(); el.querySelector('.v3d-prompt')?.classList.add('gone'); }
    }
  });
  // hover cursor: at most about 8 checks a second, always on the latest pointer position
  let hoverQ = null, hoverT = 0, hoverOn = false;
  const hoverCheck = () => {
    hoverOn = false; if (!hoverQ || !current) return; hoverT = performance.now();
    const r = canvas.getBoundingClientRect(), p = hoverQ; hoverQ = null;
    ptr.set(((p[0] - r.left) / r.width) * 2 - 1, -((p[1] - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ptr, camera);
    canvas.style.cursor = ray.intersectObjects(clickables, true).length ? 'pointer' : 'grab';
  };
  canvas.addEventListener('pointermove', e => {
    if (e.buttons || !current || !clickables.length) return;
    hoverQ = [e.clientX, e.clientY];
    if (!hoverOn) { hoverOn = true; setTimeout(() => requestAnimationFrame(hoverCheck), Math.max(0, 120 - (performance.now() - hoverT))); }
  });

  el.querySelector('[data-v=reset]').addEventListener('click', () => { if (walking) { overview(); syncActs(); showActs(); return; } if (home) { camera.position.copy(home.pos); controls.target.copy(home.target); controls.update(); wake(); } });
  const spin = el.querySelector('[data-v=spin]');
  spin.addEventListener('click', () => { controls.autoRotate = !controls.autoRotate; spin.setAttribute('aria-pressed', String(controls.autoRotate)); wake(); });
  el.querySelector('[data-v=full]').addEventListener('click', () => {
    const box = el.querySelector('.v3d-main');
    if (document.fullscreenElement) document.exitFullscreen(); else (box.requestFullscreen || box.webkitRequestFullscreen)?.call(box);
  });
  canvas.addEventListener('pointerdown', () => el.querySelector('.v3d-hint')?.classList.add('gone'), { once: true });
  el.querySelectorAll('[data-id]').forEach(b => b.addEventListener('click', () => request(b.dataset.id)));
  let curId = null, wheelTip = 0;
  canvas.addEventListener('pointerdown', () => { controls.enableZoom = true; el.querySelector('.v3d-wheel').hidden = true; });
  el.querySelector('.v3d-main').addEventListener('pointerleave', () => { controls.enableZoom = false; });
  canvas.addEventListener('wheel', () => { if (controls.enableZoom) return; const w = el.querySelector('.v3d-wheel'); w.hidden = false; clearTimeout(wheelTip); wheelTip = setTimeout(() => { w.hidden = true; }, 1600); }, { passive: true });
  el.querySelectorAll('.v3d-step').forEach(b => b.addEventListener('click', () => { const i = ids.indexOf(curId); request(ids[(i + +b.dataset.step + ids.length) % ids.length]); }));
  const find = el.querySelector('.v3d-find');
  find?.addEventListener('input', () => { const q = find.value.trim().toLowerCase(); el.querySelectorAll('.v3d-side details').forEach(d => { let n = 0; d.querySelectorAll('button').forEach(b => { const hit = !q || b.textContent.toLowerCase().includes(q); b.hidden = !hit; n += hit; }); d.hidden = !n; if (q && n) d.open = true; }); });
  el.querySelector('.v3d-pick select')?.addEventListener('change', e => request(e.target.value));
  const want = new URLSearchParams(location.search).get('model');
  const first = want && ids.includes(want) ? want : ids[0];
  resize(); curId = first; load(first);
}

// start each viewer only when it scrolls near the screen
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { io.unobserve(e.target); try { viewer(e.target); } catch (err) { e.target.innerHTML = '<p class="v3d-note">3D preview is not available in this browser.</p>'; console.error(err); } } }), { rootMargin: '300px' });
document.querySelectorAll('.v3d').forEach(el => io.observe(el));
