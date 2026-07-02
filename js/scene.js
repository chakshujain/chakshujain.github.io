/* ============================================================
   CHAKSHU JAIN — 3D scene
   "Money rails": particle streams flowing along curved rails,
   a wireframe core, and ambient dust. Scroll-driven camera.
   ============================================================ */
import * as THREE from 'three';

const canvas = document.getElementById('webgl');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = window.matchMedia('(max-width: 768px)').matches;

/* ---------- renderer / scene / camera ---------- */
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  powerPreference: 'high-performance',
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050508, 0.028);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0.6, 15);

const world = new THREE.Group();
scene.add(world);

/* ---------- soft round sprite for particles ---------- */
function makeSprite() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.35, 'rgba(255,255,255,0.6)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
const sprite = makeSprite();

const ACCENT = new THREE.Color(0x00ffa3);
const CYAN = new THREE.Color(0x22d3ee);
const GOLD = new THREE.Color(0xf5c451);

/* ---------- rails: curves through space ---------- */
function railCurve(seed, radius, yAmp, zAmp) {
  const pts = [];
  const N = 8;
  for (let i = 0; i <= N; i++) {
    const a = (i / N) * Math.PI * 2 + seed;
    pts.push(new THREE.Vector3(
      Math.cos(a) * (radius + Math.sin(a * 2 + seed) * 2.2),
      Math.sin(a * 2 + seed * 3) * yAmp,
      Math.sin(a) * (radius * 0.7) + Math.cos(a * 3 + seed) * zAmp
    ));
  }
  return new THREE.CatmullRomCurve3(pts, true, 'centripetal', 0.6);
}

const RAILS = [
  { curve: railCurve(0.0, 7.5, 1.6, 1.4), color: ACCENT, speed: 0.020 },
  { curve: railCurve(2.1, 8.8, 2.4, 1.8), color: CYAN,   speed: 0.014 },
  { curve: railCurve(4.2, 6.4, 2.0, 2.4), color: ACCENT, speed: 0.026 },
  { curve: railCurve(5.6, 9.6, 3.0, 1.2), color: GOLD,   speed: 0.010 },
];

const SAMPLES = 720;
const PER_RAIL = isMobile ? 320 : 900;

const rails = RAILS.map((cfg) => {
  const samples = cfg.curve.getSpacedPoints(SAMPLES);

  // faint guide line
  const lineGeo = new THREE.BufferGeometry().setFromPoints(samples);
  const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({
    color: cfg.color, transparent: true, opacity: 0.10,
  }));
  world.add(line);

  // flowing particles
  const positions = new Float32Array(PER_RAIL * 3);
  const offsets = new Float32Array(PER_RAIL);
  const sizes = new Float32Array(PER_RAIL);
  for (let i = 0; i < PER_RAIL; i++) {
    offsets[i] = Math.random();
    sizes[i] = 0.5 + Math.random() * 1.6;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const mat = new THREE.PointsMaterial({
    color: cfg.color,
    size: 0.16,
    map: sprite,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });
  const points = new THREE.Points(geo, mat);
  world.add(points);

  return { ...cfg, samples, points, offsets, sizes, positions };
});

function updateRails(dt) {
  for (const rail of rails) {
    const { samples, offsets, sizes, positions } = rail;
    for (let i = 0; i < PER_RAIL; i++) {
      offsets[i] = (offsets[i] + rail.speed * dt * (0.5 + sizes[i] * 0.4)) % 1;
      const f = offsets[i] * SAMPLES;
      const i0 = Math.floor(f);
      const i1 = (i0 + 1) % (SAMPLES + 1);
      const t = f - i0;
      const a = samples[i0], b = samples[i1];
      positions[i * 3]     = a.x + (b.x - a.x) * t;
      positions[i * 3 + 1] = a.y + (b.y - a.y) * t;
      positions[i * 3 + 2] = a.z + (b.z - a.z) * t;
    }
    rail.points.geometry.attributes.position.needsUpdate = true;
  }
}
updateRails(0.016);

/* ---------- core: wireframe icosahedron ---------- */
const core = new THREE.Group();
const icoGeo = new THREE.IcosahedronGeometry(2.4, 1);
core.add(new THREE.Mesh(icoGeo, new THREE.MeshBasicMaterial({
  color: ACCENT, wireframe: true, transparent: true, opacity: 0.22,
})));
core.add(new THREE.Mesh(new THREE.IcosahedronGeometry(1.35, 0), new THREE.MeshBasicMaterial({
  color: CYAN, wireframe: true, transparent: true, opacity: 0.35,
})));
// glowing vertices
const icoPts = new THREE.Points(icoGeo, new THREE.PointsMaterial({
  color: ACCENT, size: 0.14, map: sprite, transparent: true,
  depthWrite: false, blending: THREE.AdditiveBlending,
}));
core.add(icoPts);
core.position.set(isMobile ? 0 : 4.2, 0.4, 2);
world.add(core);

/* ---------- ambient dust ---------- */
const DUST = isMobile ? 300 : 800;
const dustPos = new Float32Array(DUST * 3);
for (let i = 0; i < DUST; i++) {
  dustPos[i * 3]     = (Math.random() - 0.5) * 46;
  dustPos[i * 3 + 1] = (Math.random() - 0.5) * 26;
  dustPos[i * 3 + 2] = (Math.random() - 0.5) * 30;
}
const dustGeo = new THREE.BufferGeometry();
dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
  color: 0x8b93a3, size: 0.05, map: sprite, transparent: true, opacity: 0.5,
  depthWrite: false, blending: THREE.AdditiveBlending,
}));
scene.add(dust);

/* ---------- interaction state ---------- */
const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
window.addEventListener('pointermove', (e) => {
  mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.ty = (e.clientY / window.innerHeight) * 2 - 1;
}, { passive: true });

let scrollP = 0;
function readScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  scrollP = max > 0 ? window.scrollY / max : 0;
}
window.addEventListener('scroll', readScroll, { passive: true });
readScroll();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* ---------- render loop ---------- */
const clock = new THREE.Clock();
let raf = null;

function tick() {
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;

  if (!reduceMotion) {
    updateRails(dt);
    core.rotation.y += dt * 0.25;
    core.rotation.x = Math.sin(t * 0.3) * 0.25;
    core.position.y = 0.4 + Math.sin(t * 0.8) * 0.25;
    dust.rotation.y += dt * 0.008;
  }

  // scroll choreography: orbit the world, pull the camera through it
  world.rotation.y = scrollP * Math.PI * 1.6;
  world.rotation.x = Math.sin(scrollP * Math.PI) * 0.14;
  camera.position.z = 15 - scrollP * 5.5;
  camera.position.y = 0.6 + scrollP * 2.4;

  // mouse parallax (lerped); roll is applied after lookAt or it gets overwritten
  mouse.x += (mouse.tx - mouse.x) * 0.04;
  mouse.y += (mouse.ty - mouse.y) * 0.04;
  camera.position.x = mouse.x * 0.9;
  camera.lookAt(0, 0.4 + scrollP * 1.2 - mouse.y * 0.4, 0);
  camera.rotation.z += mouse.x * 0.015;

  renderer.render(scene, camera);
  raf = requestAnimationFrame(tick);
}

// pause rendering when tab hidden; dt clamp in tick() absorbs the gap on resume
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (raf) cancelAnimationFrame(raf);
    raf = null;
  } else if (!raf) {
    clock.getDelta();
    tick();
  }
});

tick();
document.documentElement.dataset.webgl = 'ready';
window.dispatchEvent(new CustomEvent('scene:ready'));
