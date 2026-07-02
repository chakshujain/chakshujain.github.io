/* ============================================================
   CHAKSHU JAIN — 3D scene
   A calm, premium particle-wave field: a dark ocean of light
   with an emerald glow. Shader-driven (zero per-frame CPU),
   scroll-eased camera, mouse ripple.
   ============================================================ */
import * as THREE from 'three';

const canvas = document.getElementById('webgl');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = window.matchMedia('(max-width: 768px)').matches;

/* ---------- renderer / scene / camera ---------- */
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: false,
  alpha: true,
  powerPreference: 'high-performance',
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 80);
camera.position.set(0, 2.6, 10);

/* ---------- the wave field ---------- */
const COLS = isMobile ? 130 : 240;
const ROWS = isMobile ? 70 : 130;
const W = 60, D = 34;

const count = COLS * ROWS;
const positions = new Float32Array(count * 3);
const rand = new Float32Array(count);
let i = 0;
for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    positions[i * 3]     = (c / (COLS - 1) - 0.5) * W;
    positions[i * 3 + 1] = 0;
    positions[i * 3 + 2] = (r / (ROWS - 1) - 0.5) * D - 6;
    rand[i] = Math.random();
    i++;
  }
}
const geo = new THREE.BufferGeometry();
geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geo.setAttribute('aRand', new THREE.BufferAttribute(rand, 1));

const uniforms = {
  uTime:   { value: 0 },
  uAmp:    { value: 1.0 },
  uDim:    { value: 1.0 },
  uMouse:  { value: new THREE.Vector2(0, 0) },
  uColorA: { value: new THREE.Color(0x00ffa3) },  // crest — emerald
  uColorB: { value: new THREE.Color(0x1c2740) },  // trough — deep slate
  uPx:     { value: renderer.getPixelRatio() },
};

const mat = new THREE.ShaderMaterial({
  uniforms,
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  vertexShader: /* glsl */`
    uniform float uTime;
    uniform float uAmp;
    uniform vec2 uMouse;
    uniform float uPx;
    attribute float aRand;
    varying float vGlow;
    varying float vFade;

    void main() {
      vec3 p = position;

      float wave =
          sin(p.x * 0.28 + uTime * 0.7) * cos(p.z * 0.24 + uTime * 0.45) * 0.6
        + sin(p.x * 0.09 - uTime * 0.3) * 1.1
        + sin(p.z * 0.16 + uTime * 0.4) * 0.5
        + sin((p.x + p.z) * 0.055 + uTime * 0.2) * 0.7;

      // gentle ripple that follows the cursor
      vec2 mp = vec2(uMouse.x * 18.0, -6.0 + uMouse.y * 8.0);
      float md = distance(p.xz, mp);
      wave += exp(-md * 0.25) * 0.9;

      p.y += wave * uAmp;

      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_Position = projectionMatrix * mv;
      gl_PointSize = min((0.9 + aRand * 1.3) * uPx * (30.0 / -mv.z), 4.5 * uPx);

      vGlow = smoothstep(-1.4, 2.2, wave);
      vFade = 1.0 - smoothstep(8.0, 34.0, -mv.z);
    }
  `,
  fragmentShader: /* glsl */`
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    uniform float uDim;
    varying float vGlow;
    varying float vFade;

    void main() {
      float d = length(gl_PointCoord - 0.5);
      float alpha = smoothstep(0.5, 0.08, d);
      vec3 col = mix(uColorB, uColorA, vGlow * vGlow);
      gl_FragColor = vec4(col, alpha * vFade * 0.85 * uDim);
    }
  `,
});

scene.add(new THREE.Points(geo, mat));

/* ---------- sparse floating dust above the field ---------- */
const DUST = isMobile ? 90 : 220;
const dustPos = new Float32Array(DUST * 3);
for (let j = 0; j < DUST; j++) {
  dustPos[j * 3]     = (Math.random() - 0.5) * 50;
  dustPos[j * 3 + 1] = 1 + Math.random() * 10;
  dustPos[j * 3 + 2] = -20 + Math.random() * 22;
}
const dustGeo = new THREE.BufferGeometry();
dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));

function makeSprite() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.4, 'rgba(255,255,255,0.5)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}
const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
  color: 0x66ffc9,
  size: 0.07,
  map: makeSprite(),
  transparent: true,
  opacity: 0.45,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
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
  uniforms.uPx.value = renderer.getPixelRatio();
});

/* ---------- render loop ---------- */
const clock = new THREE.Clock();
let raf = null;

function tick() {
  const dt = Math.min(clock.getDelta(), 0.05);

  if (!reduceMotion) uniforms.uTime.value += dt;

  // mouse (lerped)
  mouse.x += (mouse.tx - mouse.x) * 0.05;
  mouse.y += (mouse.ty - mouse.y) * 0.05;
  uniforms.uMouse.value.set(mouse.x, mouse.y);

  // scroll: recede and drift up; dim through the content-heavy middle
  // of the page, then swell back for the contact finale
  camera.position.x = mouse.x * 0.7;
  camera.position.y = 2.6 + scrollP * 1.6 + mouse.y * -0.3;
  camera.position.z = 10 + scrollP * 2.0;
  camera.lookAt(0, 0.2 - scrollP * 0.8, -6);
  const ss = (a, b, x) => {
    const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
    return t * t * (3 - 2 * t);
  };
  uniforms.uDim.value = 1.0 - 0.55 * ss(0.06, 0.28, scrollP) + 0.5 * ss(0.78, 0.97, scrollP);

  dust.rotation.y += dt * 0.01;

  renderer.render(scene, camera);
  raf = requestAnimationFrame(tick);
}

// pause rendering when tab hidden; dt clamp absorbs the gap on resume
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
