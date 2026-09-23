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

function viewer(el) {
  const ids = (el.dataset.models || el.dataset.model || '').split(',').map(s => s.trim()).filter(id => MODELS[id]);
  if (!ids.length) return;
  el.classList.add('v3d-on');
  el.innerHTML = `
    ${ids.length > 1 ? `<div class="v3d-tabs" role="tablist">${ids.map((id, i) => `<button role="tab" data-id="${id}" aria-selected="${i === 0}">${MODELS[id].name}</button>`).join('')}</div>` : ''}
    <div class="v3d-stage">
      <canvas aria-label="Interactive 3D model. Drag to rotate, scroll or pinch to zoom."></canvas>
      <div class="v3d-load">Loading 3D model...</div>
      <div class="v3d-hint">Drag to rotate &middot; Scroll or pinch to zoom &middot; Click parts to try them</div>
      <div class="v3d-cap"><b></b><span></span></div>
    </div>
    <div class="v3d-bar">
      <div class="v3d-acts"></div>
      <div class="v3d-fin"></div>
      <div class="v3d-view"><button type="button" data-v="spin" aria-pressed="false">Auto-rotate</button><button type="button" data-v="reset">Reset view</button></div>
    </div>
    <p class="v3d-note">Representative model. Sizes, finishes and accessories vary by manufacturer and configuration.</p>`;

  const canvas = el.querySelector('canvas'), stage = el.querySelector('.v3d-stage');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

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
  const tween = (obj, key, to, ms = 700) => {
    if (reduce) { obj[key] = to; wake(); return; }
    const from = obj[key]; if (from === to) return;
    for (let i = tweens.length - 1; i >= 0; i--) if (tweens[i].obj === obj && tweens[i].key === key) tweens.splice(i, 1);
    tweens.push({ obj, key, from, to, ms, t0: performance.now() }); wake();
  };

  let current = null, frame = 0, dirty = true, home = null;
  const wake = () => { dirty = true; if (!frame) frame = requestAnimationFrame(loop); };
  controls.addEventListener('change', wake);

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
    if (current) { scene.remove(current.group); current.group.traverse(o => { o.geometry?.dispose?.(); }); }
    const def = MODELS[id];
    current = def.build({ THREE, tween, wake, bake: g => bake(THREE, g) });
    current.group.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    bake(THREE, current.group);
    scene.add(current.group);
    fit(current.group, current.view);
    el.querySelector('.v3d-cap b').textContent = def.name;
    el.querySelector('.v3d-cap span').textContent = def.dims || '';
    const acts = el.querySelector('.v3d-acts');
    acts.replaceChildren(...(current.actions || []).map(a => {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = a.label;
      b.addEventListener('click', () => { const r = a.run(); if (typeof r === 'string') b.textContent = r; wake(); });
      return b;
    }));
    const fin = el.querySelector('.v3d-fin');
    fin.replaceChildren(...(current.finishes || []).map((f, i) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'v3d-sw'; b.title = f.name; b.setAttribute('aria-label', `Finish: ${f.name}`);
      b.style.background = f.swatch; if (!i) b.setAttribute('aria-pressed', 'true');
      b.addEventListener('click', () => { fin.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); current.setFinish(f); wake(); });
      return b;
    }));
    el.querySelector('.v3d-load').hidden = true;
    wake();
  }

  function loop(now) {
    frame = 0;
    let active = false;
    for (let i = tweens.length - 1; i >= 0; i--) {
      const tw = tweens[i], k = Math.min(1, (now - tw.t0) / tw.ms);
      tw.obj[tw.key] = tw.from + (tw.to - tw.from) * ease(k);
      if (k >= 1) tweens.splice(i, 1); else active = true;
    }
    const moving = controls.update();
    if (dirty || active || moving || controls.autoRotate) { renderer.render(scene, camera); dirty = false; }
    if (active || moving || controls.autoRotate) frame = requestAnimationFrame(loop);
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
      if (o) { o.userData.onClick(); wake(); break; }
    }
  });
  canvas.addEventListener('pointermove', e => {
    if (e.buttons || !current) return;
    const r = canvas.getBoundingClientRect();
    ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ptr, camera);
    const hit = ray.intersectObject(current.group, true).find(h => { let o = h.object; while (o && !o.userData.onClick) o = o.parent; return !!o; });
    canvas.style.cursor = hit ? 'pointer' : 'grab';
  });

  el.querySelector('[data-v=reset]').addEventListener('click', () => { if (home) { camera.position.copy(home.pos); controls.target.copy(home.target); controls.update(); wake(); } });
  const spin = el.querySelector('[data-v=spin]');
  spin.addEventListener('click', () => { controls.autoRotate = !controls.autoRotate; spin.setAttribute('aria-pressed', String(controls.autoRotate)); wake(); });
  el.querySelectorAll('.v3d-tabs button').forEach(b => b.addEventListener('click', () => {
    el.querySelectorAll('.v3d-tabs button').forEach(x => x.setAttribute('aria-selected', String(x === b)));
    load(b.dataset.id);
    b.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }));
  const want = new URLSearchParams(location.search).get('model');
  const first = want && ids.includes(want) ? want : ids[0];
  if (first !== ids[0]) el.querySelectorAll('.v3d-tabs button').forEach(x => x.setAttribute('aria-selected', String(x.dataset.id === first)));
  resize(); load(first);
  el.querySelector('.v3d-tabs [aria-selected=true]')?.scrollIntoView({ block: 'nearest', inline: 'center' });
}

// start each viewer only when it scrolls near the screen
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { io.unobserve(e.target); try { viewer(e.target); } catch (err) { e.target.innerHTML = '<p class="v3d-note">3D preview is not available in this browser.</p>'; console.error(err); } } }), { rootMargin: '300px' });
document.querySelectorAll('.v3d').forEach(el => io.observe(el));
