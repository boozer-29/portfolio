// "What if your mum's cooking doubled every day?" — Polygram series, episode renderer (three.js, rig v2, IBL lighting)
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const W = 1080, H = 1920; export const DUR = 55.2;
let DIALOGUE = [];
function spanHit(c, O) { for (const [a, b] of c.spans) if (O >= a - 0.02 && O < b + 0.03) return true; return false; }

// ---------------------------------------------------------------- story steps (one doubling each)
const STEPS = [
  { day: 1, t: 3.0, v: 1, cmp: 'SMELLS NICE' },
  { day: 2, t: 7.0, v: 2, cmp: 'NEIGHBOUR CLIMBED THE FENCE' },
  { day: 3, t: 10.6, v: 4, cmp: 'GENERATORS SWITCHED OFF' },
  { day: 4, t: 14.8, v: 8, cmp: 'FISH JUMPING OUT OF THE LAGOON' },
  { day: 5, t: 19.2, v: 16, cmp: 'VISIBLE FROM A PLANE' },
  { day: 6, t: 24.4, v: 32, cmp: 'KINGS ARE VISITING' },
  { day: 7, t: 29.4, v: 64, cmp: 'IT IS RAINING RICE' },
  { day: 8, t: 34.2, v: 128, cmp: 'ASTRONAUTS CAME DOWN' },
  { day: 9, t: 40.35, v: 256, cmp: 'THE UNIVERSE IS HUNGRY' },
];
const TITLE = { t0: 0.15, t1: 2.95 };

// ---------------------------------------------------------------- renderer (RS = 2 renders true 4K)
const RS = Number(new URLSearchParams(location.search).get('s')) || 1;
function hiDPI(c) {
  if (RS === 1) return c; const P = CanvasRenderingContext2D.prototype;
  for (const p of ['shadowBlur', 'shadowOffsetX', 'shadowOffsetY']) { const d = Object.getOwnPropertyDescriptor(P, p); Object.defineProperty(c, p, { get() { return d.get.call(this) / RS; }, set(v) { d.set.call(this, v * RS); } }); }
  const f = Object.getOwnPropertyDescriptor(P, 'filter'); Object.defineProperty(c, 'filter', { get() { return f.get.call(this); }, set(v) { f.set.call(this, String(v).replace(/blur\(([\d.]+)px\)/g, (m, n) => `blur(${n * RS}px)`)); } });
  c.setTransform(RS, 0, 0, RS, 0, 0); return c;
}
const glc = document.createElement('canvas'); glc.width = W * RS; glc.height = H * RS;
const renderer = new THREE.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W * RS, H * RS, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.92;
renderer.outputColorSpace = THREE.SRGBColorSpace;
const pmrem = new THREE.PMREMGenerator(renderer);
const ENV = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;     // soft studio IBL: glossy reflections + bounce light

const out = document.getElementById('out'); out.width = W * RS; out.height = H * RS; const ctx = hiDPI(out.getContext('2d'));
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const sceneC = mk(W * RS, H * RS), sctx = hiDPI(sceneC.getContext('2d'));
const sharpC = mk(W * RS, H * RS), shctx = hiDPI(sharpC.getContext('2d'));
const smallC = mk(270 * RS, 480 * RS), smctx = hiDPI(smallC.getContext('2d'));
const tmpC = mk(W * RS, H * RS), tctx = hiDPI(tmpC.getContext('2d'));
const accC = mk(W * RS, H * RS), actx = hiDPI(accC.getContext('2d'));

// ---------------------------------------------------------------- helpers
const lerp = (a, b, t) => a + (b - a) * t, clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const eOut = t => 1 - Math.pow(1 - t, 3), eIn = t => t * t * t, eIO = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const elastic = t => t <= 0 ? 0 : t >= 1 ? 1 : Math.pow(2, -9 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI) / 3) + 1;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const EASE = { out: eOut, in: eIn, io: eIO, lin: t => t };
const V = (a) => new THREE.Vector3(...a);
function rnd(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
const MATS = {}, GEOS = {};
function mat(hex, o = {}) { const k = hex + JSON.stringify(o); return MATS[k] ||= new THREE.MeshStandardMaterial({ color: hex, roughness: 0.6, metalness: 0, envMapIntensity: 0.8, ...o }); }
function rgeo(w, h, d) { const k = `${w}|${h}|${d}`; return GEOS[k] ||= new RoundedBoxGeometry(w, h, d, 2, Math.min(w, h, d) * 0.18); }
function rbox(w, h, d, c, x = 0, y = 0, z = 0, o) { const m = new THREE.Mesh(rgeo(w, h, d), c && c.isMaterial ? c : mat(c, o)); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; return m; }
function ball(r, c, x = 0, y = 0, z = 0, o, seg = 32) { const m = new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.round(seg * 0.66)), c && c.isMaterial ? c : mat(c, o)); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; return m; }
const grp = (x = 0, y = 0, z = 0, parent) => { const g = new THREE.Group(); g.position.set(x, y, z); if (parent) parent.add(g); return g; };
function canvasTex(w, h, draw) { const c = mk(w, h); draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
function skyDome(top, mid, bot, r = 150) {
  const t = canvasTex(8, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, top); gr.addColorStop(0.5, mid); gr.addColorStop(1, bot); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  return new THREE.Mesh(new THREE.SphereGeometry(r, 32, 16), new THREE.MeshBasicMaterial({ map: t, side: THREE.BackSide, toneMapped: false, fog: false }));
}
function cloud(x, y, z, s = 1) { const g = grp(x, y, z); const m = mat(0xffffff, { roughness: 0.95, envMapIntensity: 0.4 }); [[0, 0, 0, 1.6], [1.6, -0.3, 0.2, 1.2], [-1.5, -0.4, 0, 1.1], [0.6, 0.6, -0.3, 1.0]].forEach(([a, b, c, r]) => { const s2 = ball(r, m, a, b, c, undefined, 18); s2.castShadow = false; g.add(s2); }); g.scale.setScalar(s); return g; }
function bubbles(sc, n, box3, rmin, rmax, seed) {   // glossy Frutiger bubbles (instanced)
  const geo = new THREE.SphereGeometry(1, 28, 18);
  const m = new THREE.MeshStandardMaterial({ color: 0xd8fbff, roughness: 0.04, metalness: 0.1, transparent: true, opacity: 0.32, envMapIntensity: 2.2, depthWrite: false });
  const im = new THREE.InstancedMesh(geo, m, n); im.castShadow = false; sc.add(im);
  const r = rnd(seed); const data = [...Array(n)].map(() => ({ x: lerp(box3[0], box3[1], r()), y: lerp(box3[2], box3[3], r()), z: lerp(box3[4], box3[5], r()), s: lerp(rmin, rmax, r()), p: r() * 10, sp: 0.15 + r() * 0.3 }));
  const mtx = new THREE.Matrix4(), q = new THREE.Quaternion();
  return { im, update(O, k = 1) {
    data.forEach((d, i) => { const y = box3[2] + ((d.y - box3[2] + O * d.sp) % (box3[3] - box3[2])); const s = d.s * k * (1 + 0.04 * Math.sin(O * 3 + d.p));
      mtx.compose(V([d.x + Math.sin(O * 0.8 + d.p) * 0.3, y, d.z + Math.cos(O * 0.6 + d.p) * 0.3]), q, V([s, s, s])); im.setMatrixAt(i, mtx); });
    im.instanceMatrix.needsUpdate = true; im.visible = k > 0.001;
  } };
}

// ---------------------------------------------------------------- characters (rig v2: spine, elbows, knees, face controls)
const HERO = { hood: 0xD7262E, hoodD: 0x9e1a21, pants: 0x4a5d8a, pantsD: 0x34446a, skin: 0xE7B289, hair: 0x2a1d17, shoe: 0x23232a };
const DENIM = new THREE.MeshPhysicalMaterial({ color: 0x4f6393, roughness: 0.62, sheen: 0.6, sheenColor: new THREE.Color(0x9fb4ff), clearcoat: 0.15, envMapIntensity: 0.9 });
function makeRig(o = {}) {
  const C = { ...HERO, ...o };
  const fab = mat(C.hood, { roughness: 0.75 }), fabD = mat(C.hoodD, { roughness: 0.75 }), pants = mat(C.pants, { roughness: 0.7 }), skin = mat(C.skin, { roughness: 0.5 }), hair = mat(C.hair, { roughness: 0.55 });
  const root = grp(); const hips = grp(0, 0.92, 0, root);
  hips.add(rbox(0.74, 0.32, 0.44, pants, 0, 0, 0)); hips.add(rbox(0.76, 0.07, 0.46, mat(0x2b2b30, { roughness: 0.4 }), 0, 0.14, 0));
  const P = { root, hips, C };
  if (o.yams) {
    const g = grp(0, -0.03, -0.12, hips); P.glute = g;
    const lobes = [ball(0.2, DENIM, -0.17, 0, -0.16), ball(0.2, DENIM, 0.17, 0, -0.16)]; lobes.forEach(l => { l.scale.set(1, 0.95, 0.9); g.add(l); }); P.lobes = lobes;
    P.caps = lobes.map(l => { const c = new THREE.Mesh(new THREE.SphereGeometry(0.204, 40, 14, 0, Math.PI * 2, 0, 0.82), mat(0xcdd8e8, { roughness: 0.92 })); c.position.copy(l.position); c.scale.copy(l.scale); c.visible = false; c.castShadow = false; g.add(c); return c; });
    g.add(rbox(0.026, 0.34, 0.05, mat(0x2f3d62), 0, 0, -0.33));
    for (const sx of [-1, 1]) { const pk = rbox(0.13, 0.1, 0.02, mat(0x3a4a74), sx * 0.17, 0.07, -0.33); g.add(pk); }
    P.flaps = [rbox(0.15, 0.17, 0.04, DENIM, -0.05, -0.04, -0.34), rbox(0.15, 0.17, 0.04, DENIM, 0.05, -0.04, -0.34)]; P.flaps.forEach(f => { f.visible = false; g.add(f); });
    P.boxers = rbox(0.1, 0.2, 0.02, mat(0xff5c8a), 0, -0.04, -0.33); P.boxers.visible = false; g.add(P.boxers);
  }
  P.legs = [-1, 1].map(sx => { const thigh = grp(sx * 0.18, -0.1, 0, hips); thigh.add(rbox(0.29, 0.44, 0.31, pants, 0, -0.21, 0));
    const knee = grp(0, -0.42, 0, thigh); knee.add(rbox(0.27, 0.4, 0.29, pants, 0, -0.19, 0)); knee.add(rbox(0.3, 0.13, 0.44, mat(C.shoe, { roughness: 0.4 }), 0, -0.42, 0.05)); return { thigh, knee }; });
  const spine = grp(0, 0.14, 0, hips); P.spine = spine;
  spine.add(rbox(0.8, 0.76, 0.47, fab, 0, 0.37, 0));
  if (!o.noHood) { spine.add(rbox(0.5, 0.18, 0.05, fabD, 0, 0.18, 0.24)); spine.add(rbox(0.68, 0.27, 0.17, fabD, 0, 0.75, -0.2)); }
  P.strings = o.noHood ? [] : [grp(-0.09, 0.66, 0.245, spine), grp(0.09, 0.66, 0.245, spine)]; P.strings.forEach(s => s.add(rbox(0.04, 0.2, 0.03, mat(0xf4f4f4), 0, -0.1, 0)));
  if (o.tie) { spine.add(rbox(0.26, 0.5, 0.04, mat(0xf4f4f4), 0, 0.6, 0.235)); spine.add(rbox(0.09, 0.44, 0.05, mat(o.tie), 0, 0.55, 0.25)); }
  if (o.pack) spine.add(rbox(0.62, 0.7, 0.3, mat(0xdadde3), 0, 0.42, -0.36));
  P.arms = [-1, 1].map(sx => { const sh = grp(sx * 0.51, 0.65, 0, spine); sh.add(rbox(0.23, 0.38, 0.27, fab, 0, -0.19, 0));
    const el = grp(0, -0.38, 0, sh); el.add(rbox(0.22, 0.33, 0.26, fab, 0, -0.16, 0)); el.add(rbox(0.2, 0.18, 0.22, skin, 0, -0.4, 0)); return { sh, el }; });
  const neck = grp(0, 0.77, 0, spine), head = grp(0, 0.04, 0, neck); P.neck = neck; P.head = head;
  head.add(rbox(0.66, 0.64, 0.6, skin, 0, 0.32, 0));
  if (o.hairStyle === 'long') { head.add(rbox(0.72, 0.2, 0.66, hair, 0, 0.68, -0.01)); head.add(rbox(0.72, 0.62, 0.14, hair, 0, 0.36, -0.3)); head.add(rbox(0.1, 0.56, 0.5, hair, -0.35, 0.36, -0.05)); head.add(rbox(0.1, 0.56, 0.5, hair, 0.35, 0.36, -0.05)); head.add(rbox(0.7, 0.12, 0.12, hair, 0, 0.6, 0.27)); }
  else if (o.hairStyle !== 'none') { head.add(rbox(0.7, 0.18, 0.64, hair, 0, 0.68, -0.01)); head.add(rbox(0.7, 0.13, 0.12, hair, 0, 0.58, 0.27)); head.add(rbox(0.08, 0.32, 0.52, hair, -0.33, 0.5, -0.05)); head.add(rbox(0.08, 0.32, 0.52, hair, 0.33, 0.5, -0.05)); head.add(rbox(0.7, 0.44, 0.1, hair, 0, 0.44, -0.29)); }
  P.eyes = []; P.pupils = []; P.lids = []; P.brows = [];
  for (const sx of [-1, 1]) {
    const e = rbox(0.15, 0.15, 0.03, mat(0xffffff, { roughness: 0.15 }), sx * 0.15, 0.36, 0.305); e.castShadow = false; head.add(e); P.eyes.push(e);
    const p = rbox(0.08, 0.1, 0.02, mat(0x15110f, { roughness: 0.1 }), sx * 0.15, 0.35, 0.325); p.castShadow = false; head.add(p); P.pupils.push(p);
    const hl = rbox(0.025, 0.025, 0.01, mat(0xffffff, { emissive: 0xffffff, emissiveIntensity: 0.6 }), sx * 0.15 + 0.02, 0.38, 0.336); hl.castShadow = false; head.add(hl);
    const l = rbox(0.17, 0.16, 0.035, skin, sx * 0.15, 0.44, 0.31); l.castShadow = false; l.scale.y = 0.01; head.add(l); P.lids.push(l);
    const b = grp(sx * 0.15, 0.49, 0.315, head); b.add(rbox(0.19, 0.045, 0.03, hair)); P.brows.push(b);
  }
  const mouth = grp(0, 0.15, 0.305, head); const mc = mat(0x4a1f1a), mi = mat(0x3a1512);
  P.mLine = rbox(0.18, 0.04, 0.02, mc); P.mO = rbox(0.14, 0.15, 0.02, mi); P.mGrin = rbox(0.26, 0.09, 0.02, mi); P.teeth = rbox(0.24, 0.05, 0.022, mat(0xffffff), 0, 0.01, 0.002);
  P.cL = rbox(0.06, 0.04, 0.02, mc, -0.11, 0, 0); P.cR = rbox(0.06, 0.04, 0.02, mc, 0.11, 0, 0);
  [P.mLine, P.mO, P.mGrin, P.teeth, P.cL, P.cR].forEach(m => { m.castShadow = false; mouth.add(m); });
  P.glasses = grp(0, 0, 0, head); P.glasses.visible = false;
  const gm = mat(0x0b0b10, { roughness: 0.08, metalness: 0.5 }); P.glasses.add(rbox(0.25, 0.15, 0.03, gm, -0.15, 0.35, 0.335)); P.glasses.add(rbox(0.25, 0.15, 0.03, gm, 0.15, 0.35, 0.335)); P.glasses.add(rbox(0.7, 0.04, 0.03, gm, 0, 0.41, 0.335));
  if (o.helmet) { const hm = P.helmet = new THREE.Mesh(new THREE.SphereGeometry(0.6, 32, 24), new THREE.MeshStandardMaterial({ color: 0xcfeaff, transparent: true, opacity: 0.22, roughness: 0.02, metalness: 0.3, envMapIntensity: 2.5, depthWrite: false })); hm.position.y = 0.32; head.add(hm); head.add(rbox(0.06, 0.06, 0.34, mat(0x222222), 0.28, 0.12, 0.2)); }
  P.setYams = (s) => { if (!P.glute) return; P.glute.scale.setScalar(s); P.glute.position.y = Math.max(-0.03, 0.19 * s - 0.9); };
  P.face = (expr, O, talk = false) => face(P, expr, O, talk);
  return P;
}
function face(P, expr, O, talk) {
  [P.mLine, P.mO, P.mGrin, P.teeth, P.cL, P.cR].forEach(m => m.visible = false);
  P.brows.forEach(b => { b.rotation.z = 0; b.position.y = 0.49; });
  P.pupils.forEach((p, i) => { p.scale.set(1, 1, 1); p.position.set((i ? 1 : -1) * 0.15, 0.35, 0.325); });
  const corners = (y, r) => { P.cL.visible = P.cR.visible = true; P.cL.position.y = P.cR.position.y = y; P.cL.rotation.z = -r; P.cR.rotation.z = r; };
  switch (expr) {
    case 'calm': P.mLine.visible = true; corners(0.02, 0.3); break;
    case 'smile': P.mGrin.visible = P.teeth.visible = true; P.mGrin.scale.set(0.8, 0.7, 1); P.teeth.scale.set(0.8, 1, 1); break;
    case 'smirk': P.mLine.visible = true; corners(0.0, 0); P.cR.position.y = 0.04; P.cR.rotation.z = 0.5; P.brows[0].rotation.z = -0.2; P.brows[1].position.y = 0.52; break;
    case 'shock': P.mO.visible = true; P.mO.scale.set(1, 1, 1); P.brows.forEach(b => b.position.y = 0.55); P.pupils.forEach(p => p.scale.set(0.6, 0.6, 1)); break;
    case 'grit': P.mGrin.visible = P.teeth.visible = true; P.mGrin.scale.set(1, 1, 1); P.teeth.scale.set(1, 1, 1); P.brows[0].rotation.z = -0.35; P.brows[1].rotation.z = 0.35; P.brows.forEach(b => b.position.y = 0.46); break;
    case 'worried': P.mLine.visible = true; corners(-0.02, -0.3); P.brows[0].rotation.z = 0.35; P.brows[1].rotation.z = -0.35; break;
    case 'laugh': P.mGrin.visible = P.teeth.visible = true; P.mGrin.scale.set(1.1, 1.4, 1); P.brows.forEach(b => b.position.y = 0.53); break;
    case 'sniff': P.mGrin.visible = P.teeth.visible = true; P.mGrin.scale.set(0.7, 0.55, 1); P.teeth.scale.set(0.7, 0.8, 1); P.brows.forEach(b => b.position.y = 0.53); break;
    case 'yawn': P.mO.visible = true; P.mO.scale.set(1.1, 1.5, 1); break;
    case 'confused': P.mLine.visible = true; corners(0, 0.15); P.brows[0].rotation.z = 0.3; P.brows[1].position.y = 0.55; P.pupils.forEach(p => p.position.x += 0.03); break;
  }
  if (talk) {                                   // mouth only moves while this character is audible
    const open = Math.sin(O * 24) > -0.2; [P.mLine, P.mGrin, P.teeth, P.cL, P.cR].forEach(m => { if (open) m.visible = false; });
    P.mO.visible = open; P.mO.scale.set(expr === 'shock' || expr === 'grit' ? 1.15 : 0.9, (expr === 'shock' ? 0.9 : 0.55) + 0.3 * Math.abs(Math.sin(O * 13)), 1);
  }
  const dart = Math.sin(O * 2.3) > 0.75 ? 0.035 : Math.sin(O * 1.7) < -0.85 ? -0.03 : 0; P.pupils.forEach(p => p.position.x += dart);
  const blink = expr === 'yawn' || expr === 'sniff' || ((O * 0.41 + 0.13) % 1) < 0.045;          // natural blink every ~2.4 s
  P.lids.forEach(l => { l.scale.y = blink ? 1 : 0.01; l.position.y = blink ? 0.37 : 0.44; });
}
function pose(P, p = {}) {
  P.spine.rotation.set(p.spineX || 0, p.spineY || 0, p.spineZ || 0); P.neck.rotation.set(p.headX || 0, p.headY || 0, p.headZ || 0);
  P.hips.position.y = 0.92 + (p.bob || 0); P.hips.rotation.set(p.hipX || 0, p.hipY || 0, p.hipZ || 0);
  const a = p.arms || [[0, 0, 0.12, 0.12], [0, 0, -0.12, 0.12]];
  P.arms.forEach((A, i) => { A.sh.rotation.set(a[i][0], a[i][1], a[i][2]); A.el.rotation.set(-(a[i][3] || 0), 0, 0); });
  const l = p.legs || [[0, 0], [0, 0]];
  P.legs.forEach((L, i) => { L.thigh.rotation.set(-l[i][0], 0, l[i][2] || 0); L.knee.rotation.set(l[i][1], 0, 0); });
}
function walk(t, speed = 7.5, amp = 1, extra = {}) {
  const s = Math.sin(t * speed), c = Math.cos(t * speed);
  return { bob: Math.abs(c) * 0.045 * amp, spineX: 0.06, spineY: s * 0.08 * amp, headY: -s * 0.05,
    legs: [[s * 0.55 * amp, Math.max(0, -s) * 0.95 * amp + 0.06], [-s * 0.55 * amp, Math.max(0, s) * 0.95 * amp + 0.06]],
    arms: [[-s * 0.5 * amp, 0, 0.12, 0.35 + Math.max(0, s) * 0.4], [s * 0.5 * amp, 0, -0.12, 0.35 + Math.max(0, -s) * 0.4]], ...extra };
}
function idle(O, ph = 0) { return { bob: Math.sin(O * 2.2 + ph) * 0.012, spineX: 0.02 + Math.sin(O * 1.1 + ph) * 0.015, spineZ: Math.sin(O * 0.9 + ph) * 0.02, headY: Math.sin(O * 0.7 + ph) * 0.1, headZ: Math.sin(O * 0.5 + ph) * 0.04,
  arms: [[Math.sin(O * 1.3 + ph) * 0.04, 0, 0.13, 0.15], [Math.sin(O * 1.2 + ph + 1) * 0.04, 0, -0.13, 0.15]] }; }
function makePigeon(big = false) {
  const g = grp(); const grey = mat(0x9aa1ab, { roughness: 0.55 }), dark = mat(0x5c6272, { roughness: 0.5 });
  g.add(rbox(0.26, 0.22, 0.38, grey, 0, 0.23, 0));
  const head = grp(0, 0.38, 0.17, g); head.add(rbox(0.17, 0.17, 0.17, dark)); head.add(rbox(0.18, 0.08, 0.11, mat(0x3f9a86, { roughness: 0.2, metalness: 0.3 }), 0, -0.1, -0.02));
  head.add(rbox(0.06, 0.045, 0.09, mat(0xe0a13b), 0, -0.01, 0.11));
  for (const sx of [-1, 1]) { if (big) { head.add(rbox(0.06, 0.07, 0.01, mat(0xffffff), sx * 0.05, 0.035, 0.088)); head.add(rbox(0.03, 0.04, 0.01, mat(0x111111), sx * 0.05, 0.03, 0.094)); } else head.add(rbox(0.03, 0.03, 0.02, mat(0xff8a1f), sx * 0.085, 0.02, 0.04)); }
  const wings = [-1, 1].map(sx => { const w = grp(sx * 0.13, 0.28, 0, g); w.add(rbox(0.04, 0.15, 0.28, mat(0x7d838c), 0, -0.04, -0.02)); return w; });
  g.add(rbox(0.17, 0.05, 0.17, dark, 0, 0.19, -0.25));
  g.add(rbox(0.03, 0.12, 0.03, mat(0xd77a86), -0.05, 0.06, 0.02)); g.add(rbox(0.03, 0.12, 0.03, mat(0xd77a86), 0.05, 0.06, 0.02));
  g.userData = { head, wings }; g.scale.setScalar(1.25); return g;
}
function debrisPool(sc, n, cols) { const r = rnd(9); return [...Array(n)].map((_, i) => { const m = rbox(0.07 + (i % 3) * 0.03, 0.07, 0.07, cols[i % cols.length]); m.visible = false; sc.add(m); return { m, r: V([r(), r(), r()]) }; }); }
function burst(pool, O, t0, o, spread, up = 2.4) {
  pool.forEach((D, i) => { const dt = O - t0; if (dt < 0 || dt > 1.6) { D.m.visible = false; return; } const a = i * 2.39, sp = spread * (0.6 + (i % 5) * 0.12);
    D.m.visible = true; D.m.position.set(o.x + Math.cos(a) * sp * dt, Math.max(0.04, o.y + (up + (i % 3)) * dt - 4.9 * dt * dt), o.z + Math.sin(a) * sp * dt * 0.6);
    D.m.rotation.set(D.r.x * dt * 12, D.r.y * dt * 12, D.r.z * dt * 12); });
}
function lightRig(sc, o) {
  sc.environment = ENV; sc.environmentIntensity = o.env ?? 0.55;
  sc.add(new THREE.HemisphereLight(o.sky, o.ground, o.hemi));
  const key = new THREE.DirectionalLight(o.keyC, o.key); key.position.set(...o.keyPos); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  const R = o.R || 10; Object.assign(key.shadow.camera, { left: -R, right: R, top: R, bottom: -R, near: 0.5, far: 120 }); key.shadow.bias = -0.0003; key.shadow.normalBias = 0.02; key.shadow.radius = 5;
  sc.add(key, key.target); if (o.target) key.target.position.set(...o.target);
  if (o.rim) { const rim = new THREE.DirectionalLight(o.rimC, o.rim); rim.position.set(...o.rimPos); sc.add(rim); }
  return key;
}

// ---------------------------------------------------------------- extra helpers (this episode)
const JOLLOF = 0xe2531c;
const T = (p, c) => (p.add(c), c);
const glowTex = (c0, c1) => canvasTex(256, 256, (g) => { const gr = g.createRadialGradient(128, 128, 6, 128, 128, 128); gr.addColorStop(0, c0); gr.addColorStop(0.35, c1); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); });
function cyl(rt, rb, h, c, x = 0, y = 0, z = 0, seg = 28, o) { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), c && c.isMaterial ? c : mat(c, o)); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; return m; }
function cone(r, h, c, x = 0, y = 0, z = 0, seg = 24, o) { const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), c && c.isMaterial ? c : mat(c, o)); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; return m; }
const ankara = (a, b, c) => canvasTex(256, 256, (g, w, h) => { g.fillStyle = a; g.fillRect(0, 0, w, h); for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { const cx = 32 + x * 64 + (y % 2) * 32, cy = 32 + y * 64; g.fillStyle = b; g.beginPath(); g.arc(cx, cy, 22, 0, 7); g.fill(); g.fillStyle = c; g.beginPath(); g.arc(cx, cy, 12, 0, 7); g.fill(); g.fillStyle = a; g.beginPath(); g.arc(cx, cy, 5, 0, 7); g.fill(); } });
const zincTex = canvasTex(256, 64, (g, w, h) => { for (let i = 0; i < 16; i++) { const gr = g.createLinearGradient(i * 16, 0, i * 16 + 16, 0); gr.addColorStop(0, '#9da3ab'); gr.addColorStop(0.5, '#e8ecf0'); gr.addColorStop(1, '#8d939b'); g.fillStyle = gr; g.fillRect(i * 16, 0, 16, h); } });
zincTex.wrapS = zincTex.wrapT = THREE.RepeatWrapping;
function zinc(w, d, x, y, z, rx = 0) { const t = zincTex.clone(); t.needsUpdate = true; t.repeat.set(w / 3, 1); const m = new THREE.Mesh(rgeo(w, 0.1, d), new THREE.MeshStandardMaterial({ map: t, roughness: 0.4, metalness: 0.5, envMapIntensity: 1.0 })); m.position.set(x, y, z); m.rotation.x = rx; m.castShadow = m.receiveShadow = true; return m; }
function house(sc, x, z, w, h, d, wall, roof, ry = 0) { const g = grp(x, 0, z, sc); g.rotation.y = ry; g.add(rbox(w, h, d, wall, 0, h / 2, 0)); const rf = zinc(w + 0.8, d + 0.9, 0, h + 0.35, 0, 0); rf.rotation.z = 0.0; g.add(rbox(w + 0.9, 0.18, d + 1.0, roof, 0, h + 0.15, 0)); g.add(rbox(w + 0.6, 0.12, d + 0.7, mat(0xaab0b8, { roughness: 0.4, metalness: 0.4 }), 0, h + 0.3, 0));
  const wm = mat(0x7fb7d9, { roughness: 0.1, metalness: 0.4 }); for (let i = 0; i < Math.floor(w / 2.2); i++) { g.add(rbox(0.9, 0.9, 0.06, wm, -w / 2 + 1.2 + i * 2.2, h * 0.58, d / 2 + 0.02)); } g.add(rbox(0.9, 1.7, 0.08, mat(0x4a2f22), w / 2 - 1.0, 0.85, d / 2 + 0.03)); return g; }
function palm(sc, x, z, s = 1, lean = 0.15) { const g = grp(x, 0, z, sc); const trunk = mat(0x8a6a48, { roughness: 0.8 }); for (let i = 0; i < 7; i++) { const t = i / 6; g.add(cyl(0.2 - 0.06 * t, 0.22 - 0.06 * t, 1.0, trunk, Math.sin(t * 1.4) * lean * 4, 0.5 + i * 0.95, 0, 10)); }
  const top = grp(Math.sin(1.4) * lean * 4, 6.9, 0, g); const leaf = mat(0x3fa24a, { roughness: 0.5, side: THREE.DoubleSide }); for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; const f = grp(0, 0, 0, top); f.rotation.y = a; f.rotation.z = -0.55; const lf = rbox(2.3, 0.05, 0.5, leaf, 1.15, 0, 0); f.add(lf); } top.add(ball(0.28, mat(0x7a5a2a), 0, -0.2, 0, undefined, 10)); g.scale.setScalar(s); return g; }
function bigTree(sc, x, z, s = 1) { const g = grp(x, 0, z, sc); g.add(cyl(0.35, 0.45, 2.4, mat(0x6e4a2e), 0, 1.2, 0, 10)); const lm = mat(0x3f9a3f, { roughness: 0.55 }); [[0, 3.6, 0, 2.0], [1.4, 3.2, 0.3, 1.5], [-1.5, 3.3, -0.2, 1.6], [0.2, 4.7, 0.2, 1.4]].forEach(([a, b, c, r]) => g.add(ball(r, lm, a, b, c, undefined, 18))); g.scale.setScalar(s); return g; }
function makeSteam(sc, n, col) { const puffs = [...Array(n)].map(() => { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), new THREE.MeshStandardMaterial({ color: col, transparent: true, opacity: 0.5, roughness: 1, depthWrite: false, emissive: col, emissiveIntensity: 0.05 })); m.castShadow = false; m.visible = false; sc.add(m); return m; });
  return { puffs, update(O, org, k = 1, rise = 3.6, spread = 0.5, sc0 = 0.35, speed = 0.45) { puffs.forEach((m, i) => { const ph = (O * speed + i / n) % 1; m.visible = k > 0.01; const w = Math.sin(i * 12.9 + O * 1.4) * spread * ph * 1.6; m.position.set(org.x + w, org.y + ph * rise, org.z + Math.cos(i * 7.1 + O * 1.1) * spread * ph); const s = sc0 * (0.5 + ph * 2.0) * k; m.scale.setScalar(Math.max(0.001, s)); m.material.opacity = 0.62 * Math.sin(Math.min(1, ph * 6) * Math.PI / 2) * (1 - ph) * Math.min(1, k); }); } }; }
const PAL = [[0xe8a317, 0x2d3a63, 0x8d5a3b, 0x15100d], [0x2bb673, 0x4b3a2a, 0x6e4528, 0x15100d], [0x9b59d6, 0x2b2b2b, 0x7a4a2e, 0x1a1210], [0xe8343c, 0x3b4a6b, 0x8d5a3b, 0x15100d], [0x1f8fe0, 0x5b4636, 0x6b4128, 0x111111], [0xff8c5a, 0x2f3a52, 0x7a4a2e, 0x1a1210], [0xf4f4f4, 0x30343c, 0x8d5a3b, 0x15100d], [0x20a0a0, 0x444444, 0x6e4528, 0x1a1210]];
function npc(i, o = {}) { const c = PAL[i % PAL.length]; return makeRig({ hood: c[0], hoodD: c[0], pants: c[1], skin: c[2], hair: c[3], noHood: true, hairStyle: i % 3 === 1 ? 'long' : 'short', ...o }); }
const SKIN = 0x7a4a2e;
function addWrapper(P, tex, col) { const m = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 }); const sk = cyl(0.46, 0.62, 0.95, m, 0, -0.42, 0, 28); sk.scale.z = 0.85; P.hips.add(sk); P.hips.add(rbox(1.02, 0.13, 0.68, mat(col, { roughness: 0.6 }), 0, 0.02, 0)); }
function addGele(P, col, col2) { const m = mat(col, { roughness: 0.35, metalness: 0.15 }), m2 = mat(col2, { roughness: 0.35 }); const g = grp(0, 0.7, -0.04, P.head); g.add(rbox(0.8, 0.26, 0.78, m, 0, 0.0, 0)); g.add(rbox(0.7, 0.28, 0.62, m2, 0, 0.24, 0.02)); const w1 = rbox(0.5, 0.3, 0.36, m, -0.18, 0.46, 0.0); w1.rotation.z = 0.35; g.add(w1); const w2 = rbox(0.5, 0.3, 0.36, m2, 0.2, 0.44, 0.04); w2.rotation.z = -0.4; g.add(w2); g.add(rbox(0.3, 0.3, 0.3, m, 0.0, 0.64, 0.0)); return g; }
function addSpoon(P, ai = 1) { const s = grp(0, -0.46, 0.02, P.arms[ai].el); s.add(rbox(0.05, 0.9, 0.05, mat(0xb07a42, { roughness: 0.6 }), 0, -0.2, 0)); s.add(rbox(0.2, 0.26, 0.05, mat(0xb07a42, { roughness: 0.6 }), 0, -0.68, 0)); s.rotation.x = -1.5; return s; }
function plate(r = 0.34, col = 0xffffff) { const g = grp(); g.add(cyl(r, r * 0.72, 0.06, mat(col, { roughness: 0.25 }), 0, 0, 0, 28)); g.add(cyl(r * 0.62, r * 0.62, 0.02, mat(0xe9eef3, { roughness: 0.3 }), 0, 0.03, 0, 24)); return g; }

// ---------------------------------------------------------------- SCENES
const S = {};
{ // ---- the compound (kitchen, fence, gate, sky) — used for most days
  const sc = new THREE.Scene(); const dayDome = skyDome('#5d8fd0', '#f6b974', '#ffe6b0'); sc.add(dayDome);
  lightRig(sc, { sky: 0xfff0dc, ground: 0xa87850, hemi: 0.5, keyC: 0xffd9a8, key: 1.7, keyPos: [-9, 8, 9], target: [1.5, 0, -1], rim: 0.5, rimC: 0xffb070, rimPos: [8, 4, -6], env: 0.4, R: 13 });
  sc.add(rbox(90, 0.2, 60, mat(0xc88b57, { roughness: 0.95 }), 0, -0.1, 4)); sc.add(rbox(16.5, 0.07, 10, mat(0xbdb7ab, { roughness: 0.85 }), -0.5, 0.035, 0.6));
  const sunG = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex('rgba(255,244,200,1)', 'rgba(255,170,80,0.6)'), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); sunG.scale.setScalar(36); sunG.position.set(-46, 14, -62); sc.add(sunG);
  // house + kitchen door + windows
  sc.add(rbox(17, 4.4, 0.5, mat(0xf2cf6b, { roughness: 0.85 }), -0.5, 2.2, -4.25)); sc.add(rbox(17.1, 0.8, 0.52, mat(0x2e8b57, { roughness: 0.7 }), -0.5, 0.4, -4.25)); sc.add(rbox(17.2, 0.3, 0.7, mat(0xe8e1d0, { roughness: 0.7 }), -0.5, 4.5, -4.2));
  sc.add(rbox(1.5, 2.8, 0.2, mat(0x2a1810, { roughness: 0.9 }), -1.4, 1.4, -3.98)); sc.add(rbox(1.2, 2.5, 0.05, mat(0xffd9a0, { emissive: 0xffb866, emissiveIntensity: 0.55, roughness: 0.8 }), -1.4, 1.35, -3.9));
  [-1.4 - 0.82, -1.4 + 0.82].forEach(x => sc.add(rbox(0.14, 2.9, 0.3, mat(0x7a4a2e, { roughness: 0.5 }), x, 1.45, -3.95))); sc.add(rbox(1.78, 0.14, 0.3, mat(0x7a4a2e, { roughness: 0.5 }), -1.4, 2.85, -3.95));
  const doorLeaf = grp(-2.2, 0, -3.85, sc); doorLeaf.add(rbox(0.1, 2.7, 0.8, mat(0x4a7a5a, { roughness: 0.5 }), 0, 1.35, 0.4)); doorLeaf.rotation.y = -0.4;
  [-6.2, 4.2, 7.2].forEach(x => { sc.add(rbox(1.7, 1.4, 0.15, mat(0xffffff, { roughness: 0.4 }), x, 2.4, -3.95)); sc.add(rbox(1.45, 1.15, 0.06, mat(0x8cc3e0, { roughness: 0.1, metalness: 0.4 }), x, 2.4, -3.86)); [-0.36, 0, 0.36].forEach(k => sc.add(rbox(0.05, 1.15, 0.06, mat(0x2b2f36), x + k, 2.4, -3.8))); sc.add(rbox(1.45, 0.05, 0.06, mat(0x2b2f36), x, 2.4, -3.8)); });
  // zinc roof over the kitchen corner + posts
  const canopy = zinc(7.4, 3.6, 1.8, 3.9, -2.45, 0.07); sc.add(canopy); sc.add(rbox(7.5, 0.2, 0.2, mat(0x7a4a2e), 1.8, 3.78, -0.62)); [4.8].forEach(x => sc.add(rbox(0.2, 3.85, 0.2, mat(0x7a4a2e, { roughness: 0.7 }), x, 1.92, -0.7)));
  // walls: fence (right), gate wall (left)
  const wallM = mat(0xf4ede0, { roughness: 0.9 }), cap = mat(0x2e8b57, { roughness: 0.7 });
  sc.add(rbox(0.32, 2.2, 14, wallM, 7.3, 1.1, 3.0)); sc.add(rbox(0.5, 0.16, 14, cap, 7.3, 2.25, 3.0)); [-3.6, 0.2, 4.2, 8.2].forEach(z => sc.add(rbox(0.5, 2.5, 0.5, wallM, 7.3, 1.25, z)));
  for (let z = -3; z < 9.8; z += 1.1) sc.add(rbox(0.02, 2.18, 0.02, mat(0xd9d0be), 7.12, 1.1, z));
  sc.add(rbox(0.32, 2.2, 3.4, wallM, -9.2, 1.1, -1.9)); sc.add(rbox(0.5, 0.16, 3.4, cap, -9.2, 2.25, -1.9)); sc.add(rbox(0.32, 2.2, 7.0, wallM, -9.2, 1.1, 6.6)); sc.add(rbox(0.5, 0.16, 7.0, cap, -9.2, 2.25, 6.6));
  [-0.2, 3.1].forEach(z => sc.add(rbox(0.5, 2.6, 0.5, wallM, -9.2, 1.3, z)));
  const gate = grp(-9.2, 0, 0.0, sc); gate.add(rbox(0.08, 2.0, 1.5, mat(0x2f6fd0, { roughness: 0.4, metalness: 0.2 }), 0, 1.0, 0.75)); gate.rotation.y = 1.1;
  // the compound front wall is not built (camera side)
  // background neighbourhood
  [[16, -8, 5.5, 3.2, 4.2, 0xf4a259], [24, -2, 5, 3.6, 4, 0x7ec8e3], [-18, -9, 6, 3.4, 4.5, 0xe9c46a], [-26, -4, 5, 3.8, 4, 0xf08a8a], [30, 8, 5, 3.4, 4, 0xa8d5a2], [-30, 9, 6, 3, 4, 0xf2cf6b], [10, -16, 7, 4.6, 5, 0xd9c7a0], [-10, -17, 7, 4.2, 5, 0xe8b4a0]].forEach(([x, z, w, h, d, c], i) => house(sc, x, z, w, h, d, mat(c, { roughness: 0.85 }), mat(0x8b5a3c, { roughness: 0.6 }), 0.06 * (i % 3 - 1)));
  palm(sc, -11.5, -2.5, 1.2, 0.12); palm(sc, 12, 3.5, 1.1, -0.1); palm(sc, -7.8, -7, 1.0, 0.1); palm(sc, 17, -2, 1.3, 0.14); bigTree(sc, 11, -6, 1.2); bigTree(sc, -14, 3, 1.3);
  // props
  const table = grp(0.4, 0, -2.9, sc); table.add(rbox(2.0, 0.1, 0.9, mat(0xa9763f, { roughness: 0.5 }), 0, 0.82, 0)); [[-0.9, -0.38], [0.9, -0.38], [-0.9, 0.38], [0.9, 0.38]].forEach(([x, z]) => table.add(rbox(0.1, 0.8, 0.1, mat(0x7a4a2e), x, 0.4, z)));
  const bowl = mat(0xf4f4f4, { roughness: 0.3 }); [-0.55, 0.05].forEach((x, i) => { table.add(cyl(0.3, 0.2, 0.2, bowl, x, 0.98, 0, 22)); for (let k = 0; k < 6; k++) table.add(ball(0.09, mat(i ? 0xe8343c : 0xff8a1f, { roughness: 0.25 }), x + Math.cos(k * 1.05) * 0.12, 1.12, Math.sin(k * 1.05) * 0.12, undefined, 12)); });
  table.add(rbox(0.5, 0.2, 0.4, mat(0x2d3036, { roughness: 0.4 }), 0.7, 0.97, 0)); table.add(cyl(0.12, 0.12, 0.2, mat(0xffd23f), 0.7, 1.18, 0, 14));
  [[-4.6, 1.0, 0.3], [-3.6, 0.6, -0.4]].forEach(([x, z, r]) => { const ch = grp(x, 0, z, sc); ch.rotation.y = r; ch.add(rbox(0.7, 0.07, 0.7, mat(0x1f6fd0, { roughness: 0.35 }), 0, 0.82, 0)); ch.add(rbox(0.7, 0.8, 0.07, mat(0x1f6fd0, { roughness: 0.35 }), 0, 1.2, -0.33)); [[-0.3, -0.3], [0.3, -0.3], [-0.3, 0.3], [0.3, 0.3]].forEach(([a, b]) => ch.add(rbox(0.06, 0.8, 0.06, mat(0xe8e8e8), a, 0.4, b))); });
  [[-6.5, -2.9, 0xffd23f], [-6.0, -3.0, 0xe8343c]].forEach(([x, z, c]) => sc.add(cyl(0.34, 0.28, 0.6, mat(c, { roughness: 0.4 }), x, 0.3, z, 16)));
  const wood = grp(5.6, 0, -2.6, sc); for (let i = 0; i < 6; i++) T(wood, cyl(0.1, 0.1, 1.2, mat(0x7a4a2e), (i % 3) * 0.22, 0.12 + Math.floor(i / 3) * 0.2, 0, 8)).rotation.z = Math.PI / 2;
  const poleX = [-8.2, -2.6]; poleX.forEach(x => sc.add(rbox(0.12, 3.2, 0.12, mat(0x7a4a2e), x, 1.6, -3.0))); sc.add(rbox(5.6, 0.03, 0.03, mat(0xe8e8e8), -5.4, 3.05, -3.0));
  const clothes = [0xe8343c, 0x2bb673, 0xffd23f, 0x1f8fe0].map((c, i) => { const p = rbox(0.7, 0.9, 0.04, mat(c, { roughness: 0.8 }), 0, -0.45, 0); const g = grp(-7.6 + i * 1.3, 3.04, -3.0, sc); g.add(p); return g; });
  // the pot
  const pot = grp(3.2, 0, -1.9, sc); const potIn = grp(0, 0, 0, pot);
  [0, 2.1, 4.2].forEach(a => potIn.add(rbox(0.32, 0.5, 0.4, mat(0x6e6a64, { roughness: 0.9 }), Math.cos(a) * 0.62, 0.25, Math.sin(a) * 0.62)));
  T(potIn, ball(0.5, mat(0xff6a1a, { emissive: 0xff5a0a, emissiveIntensity: 2.2, roughness: 0.5 }), 0, 0.28, 0, undefined, 16)).scale.set(1, 0.4, 1);
  const alu = mat(0xc9ced6, { roughness: 0.28, metalness: 0.9, envMapIntensity: 1.5 });
  potIn.add(cyl(0.72, 0.64, 1.0, alu, 0, 1.0, 0, 36)); potIn.add(cyl(0.77, 0.77, 0.08, alu, 0, 1.52, 0, 36)); potIn.add(cyl(0.7, 0.7, 0.04, mat(0x1a1411, { roughness: 0.6 }), 0, 0.5, 0, 24));
  [-1, 1].forEach(sx => potIn.add(rbox(0.28, 0.12, 0.14, alu, sx * 0.84, 1.28, 0)));
  const rice = cyl(0.66, 0.66, 0.06, mat(JOLLOF, { roughness: 0.55, emissive: 0xa02800, emissiveIntensity: 0.25 }), 0, 1.38, 0, 28); potIn.add(rice); const lid = grp(0, 1.58, 0, potIn); lid.add(cyl(0.76, 0.78, 0.1, alu, 0, 0, 0, 36)); lid.add(ball(0.12, mat(0x2d3036, { roughness: 0.4 }), 0, 0.12, 0, undefined, 12));
  const steam = makeSteam(sc, 22, 0xfff3e2);
  // cosmos (Day 9)
  const cosDome = (() => { const t = canvasTex(8, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0a0620'); gr.addColorStop(0.5, '#2b1a6e'); gr.addColorStop(1, '#6a3fb0'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
    const m = new THREE.Mesh(new THREE.SphereGeometry(148, 32, 16), new THREE.MeshBasicMaterial({ map: t, side: THREE.BackSide, toneMapped: false, fog: false, transparent: true, opacity: 0 })); m.renderOrder = -1; return m; })(); sc.add(cosDome);
  const sr = rnd(77), sp = []; for (let i = 0; i < 900; i++) { const v = V([sr() * 2 - 1, sr() * 1.0 + 0.02, sr() * 2 - 1]).normalize().multiplyScalar(140); sp.push(v.x, v.y, v.z); }
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3)); const stars = new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 2.2 * RS, sizeAttenuation: false, toneMapped: false, transparent: true, opacity: 0 })); sc.add(stars);
  const galT = (c0, c1) => canvasTex(512, 512, (g, w, h) => { g.translate(256, 256); const rr2 = rnd(5); for (let k = 0; k < 2600; k++) { const arm = k % 3, t = Math.pow(rr2(), 0.6); const a = t * 9 + arm * 2.094 + (rr2() - 0.5) * 0.5, r = t * 230; g.fillStyle = rr2() < 0.5 ? c0 : c1; g.globalAlpha = 0.25 + rr2() * 0.5; g.beginPath(); g.arc(Math.cos(a) * r, Math.sin(a) * r * 0.55, 1.2 + rr2() * 3, 0, 7); g.fill(); } g.globalAlpha = 1; const cg = g.createRadialGradient(0, 0, 0, 0, 0, 70); cg.addColorStop(0, 'rgba(255,255,230,1)'); cg.addColorStop(1, 'rgba(255,200,120,0)'); g.fillStyle = cg; g.fillRect(-256, -256, 512, 512); });
  const galaxies = [['#9ab4ff', '#ffffff'], ['#ff9ad5', '#ffd9ff'], ['#7affd9', '#ffffff'], ['#ffc36a', '#fff0c0']].map(([a, b]) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: galT(a, b), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, side: THREE.DoubleSide })); sc.add(m); return m; });
  const vort = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }), 420); vort.castShadow = false; vort.frustumCulled = false; sc.add(vort); const vr = rnd(21); const vd = [...Array(420)].map(() => ({ a: vr() * 6.283, r: vr(), y: vr(), s: 0.05 + vr() * 0.16, c: [0xffd9a0, 0x9ab4ff, 0xff9ad5, 0x7affd9, 0xffffff][Math.floor(vr() * 5)] })); vd.forEach((d, i) => vort.setColorAt(i, new THREE.Color(d.c)));
  const moonG = new THREE.IcosahedronGeometry(1, 2).toNonIndexed(); { const pos = moonG.attributes.position, cols = [], r2 = rnd(9); for (let i = 0; i < pos.count; i += 3) { const c = new THREE.Color(r2() < 0.2 ? 0x9a9aa2 : (r2() < 0.5 ? 0xc9c9cf : 0xb7b7bf)); for (let k = 0; k < 3; k++) cols.push(c.r, c.g, c.b); } moonG.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); }
  const moon = new THREE.Mesh(moonG, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.85 })); moon.castShadow = true; moon.visible = false; sc.add(moon);
  const cosGlow = new THREE.PointLight(0x9a7aff, 0, 30, 1.2); cosGlow.position.set(3.2, 5, -1.9); sc.add(cosGlow);
  // capsule + parachute (Day 8)
  const capsule = grp(0, 0, 0, sc); capsule.add(cyl(0.55, 1.15, 1.5, mat(0xf2f2f2, { roughness: 0.3, metalness: 0.3 }), 0, 1.1, 0, 28)); capsule.add(cyl(1.15, 1.2, 0.3, mat(0x2b2f36, { roughness: 0.5 }), 0, 0.15, 0, 28)); capsule.add(cone(0.55, 0.5, mat(0xe8343c, { roughness: 0.3 }), 0, 2.1, 0, 28)); capsule.add(rbox(0.5, 0.5, 0.06, mat(0x7fc8ff, { roughness: 0.05, metalness: 0.5 }), 0, 1.2, 0.85)); capsule.add(rbox(0.7, 0.7, 0.05, mat(0xcfd3da, { roughness: 0.3, metalness: 0.7 }), 0, 0.9, 0.9)); capsule.visible = false;
  const hatch = grp(-0.4, 0.85, 0.86, capsule); hatch.add(rbox(0.8, 1.0, 0.07, mat(0xf2f2f2, { roughness: 0.3, metalness: 0.3 }), 0.4, 0, 0)); hatch.rotation.y = 0;
  const chute = grp(0, 0, 0, sc); { const stripes = [0xff8a1f, 0xffffff]; for (let i = 0; i < 10; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(4.2, 4, 12, i / 10 * Math.PI * 2, Math.PI * 2 / 10, 0, 1.15), new THREE.MeshStandardMaterial({ color: stripes[i % 2], roughness: 0.7, side: THREE.DoubleSide })); m.position.y = 6.0; m.castShadow = true; chute.add(m); }
    for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; const ln = new THREE.Line(new THREE.BufferGeometry().setFromPoints([V([Math.cos(a) * 3.8, 6.0 + 1.6, Math.sin(a) * 3.8]), V([Math.cos(a) * 0.4, 2.2, Math.sin(a) * 0.4])]), new THREE.LineBasicMaterial({ color: 0xf0f0f0 })); chute.add(ln); } } chute.visible = false;
  const rainG = new THREE.InstancedMesh(rgeo(0.1, 0.05, 0.05), new THREE.MeshStandardMaterial({ color: 0xfff6e0, roughness: 0.6 }), 520); rainG.castShadow = false; rainG.frustumCulled = false; sc.add(rainG); rainG.visible = false;
  const rr3 = rnd(13); const rainD = [...Array(520)].map(() => ({ x: rr3() * 22 - 11, y: rr3() * 14, z: rr3() * 14 - 5, sp: 3.2 + rr3() * 2.2, p: rr3() * 9, rot: rr3() * 6 }));
  const ricePile = cyl(5.0, 6.2, 1.0, mat(0xfff6e0, { roughness: 0.7 }), 0, -0.5, 1.5, 36); ricePile.scale.set(1.4, 1, 1); ricePile.visible = false; ricePile.castShadow = false; sc.add(ricePile);
  // people
  const hero = makeRig({}); sc.add(hero.root);
  const mum = makeRig({ hood: 0xf2a900, hoodD: 0xc98400, pants: 0x6a3a1f, skin: SKIN, hairStyle: 'none', noHood: true }); addWrapper(mum, ankara('#16899a', '#f2a900', '#ffffff'), 0x0f6b78); addGele(mum, 0xe8343c, 0xffc83d); sc.add(mum.root); const mumSpoon = addSpoon(mum, 1);
  const neigh = makeRig({ hood: 0xff6fa5, hoodD: 0xd6457f, pants: 0x6a3a1f, skin: 0x8d5a3b, hairStyle: 'none', noHood: true }); sc.add(neigh.root); { const capM = new THREE.MeshStandardMaterial({ color: 0xffb3d0, roughness: 0.25, transparent: true, opacity: 0.95 }); const sc2 = new THREE.Mesh(new THREE.SphereGeometry(0.47, 22, 12, 0, Math.PI * 2, 0, Math.PI / 2), capM); sc2.position.set(0, 0.6, -0.02); sc2.scale.set(1.0, 0.85, 1.0); sc2.castShadow = true; neigh.head.add(sc2); neigh.head.add(cyl(0.45, 0.45, 0.07, mat(0xff6fa5, { roughness: 0.4 }), 0, 0.62, -0.02, 22)); } const nPlate = plate(0.4); nPlate.rotation.x = -1.3; neigh.arms[0].el.add(nPlate); nPlate.position.set(0, -0.5, 0.15);
  const king = makeRig({ hood: 0x6a2bb0, hoodD: 0x4a1d80, pants: 0xf4e9c8, skin: 0x6b4128, hairStyle: 'none', noHood: true, shoe: 0xd4a017 }); sc.add(king.root); { const g = grp(0, 0.88, 0, king.hips); king.spine.add(rbox(1.14, 0.9, 0.62, mat(0x6a2bb0, { roughness: 0.5 }), 0, 0.34, 0)); king.spine.add(rbox(0.3, 0.9, 0.64, mat(0xffd23f, { roughness: 0.3, metalness: 0.5 }), 0, 0.34, 0)); king.spine.add(rbox(0.8, 0.14, 0.52, mat(0xffd23f, { roughness: 0.3, metalness: 0.6 }), 0, 0.84, 0.08));
    const fila = mat(0xe8343c, { roughness: 0.5 }); king.head.add(rbox(0.74, 0.34, 0.7, fila, 0, 0.8, 0)); const flap = rbox(0.5, 0.4, 0.2, fila, 0.3, 0.7, 0); flap.rotation.z = -0.5; king.head.add(flap); king.head.add(rbox(0.76, 0.08, 0.72, mat(0xffd23f, { metalness: 0.6, roughness: 0.3 }), 0, 0.66, 0)); }
  const drummers = [0, 1].map(i => { const P = makeRig({ hood: [0x2bb673, 0xff8a1f][i], hoodD: 0x1f7a50, pants: 0xf4e9c8, skin: [0x7a4a2e, 0x6b4128][i], hairStyle: 'none', noHood: true }); T(P.head, rbox(0.7, 0.2, 0.64, mat([0xffd23f, 0xe8343c][i]), 0, 0.72, 0)); const d = grp(-0.48, 0.2, 0.34, P.spine); const dm = mat(0x8a5a2c, { roughness: 0.5 }); T(d, cyl(0.2, 0.07, 0.3, dm, 0.17, 0, 0, 14)).rotation.z = Math.PI / 2; T(d, cyl(0.07, 0.2, 0.3, dm, -0.13, 0, 0, 14)).rotation.z = Math.PI / 2; T(d, cyl(0.21, 0.21, 0.03, mat(0xf0e0b0), 0.33, 0, 0, 14)).rotation.z = Math.PI / 2; T(d, cyl(0.21, 0.21, 0.03, mat(0xf0e0b0), -0.29, 0, 0, 14)).rotation.z = Math.PI / 2; d.rotation.y = -0.4; P.stick = grp(0, -0.46, 0.04, P.arms[1].el); T(P.stick, rbox(0.04, 0.5, 0.04, mat(0xb07a42), 0, -0.15, 0)); sc.add(P.root); return P; });
  const bearer = makeRig({ hood: 0x1f8fe0, hoodD: 0x1763a8, pants: 0xf4e9c8, skin: 0x7a4a2e, hairStyle: 'none', noHood: true }); sc.add(bearer.root);
  const umb = grp(0, 0, 0, sc); umb.add(cyl(0.04, 0.04, 2.6, mat(0xb07a42), 0, 1.5, 0, 8)); umb.add(cone(1.5, 0.6, mat(0xe8343c, { roughness: 0.5, side: THREE.DoubleSide }), 0, 3.0, 0, 24)); umb.add(cyl(1.52, 1.52, 0.08, mat(0xffd23f, { metalness: 0.5, roughness: 0.3 }), 0, 2.72, 0, 24)); umb.add(ball(0.1, mat(0xffd23f, { metalness: 0.6, roughness: 0.3 }), 0, 3.32, 0, undefined, 10)); umb.visible = false; bearer.umb = umb;
  const guards = [0, 1].map(i => { const P = npc(i + 4, { shoe: 0x2a2a30 }); T(P.head, rbox(0.72, 0.14, 0.66, mat(0xffd23f, { metalness: 0.4, roughness: 0.4 }), 0, 0.72, 0)); sc.add(P.root); return P; });
  const crowd = [...Array(8)].map((_, i) => { const P = npc(i); sc.add(P.root); const u = grp(0, -0.5, 0.05, P.arms[1].el); const inner = grp(0, 0.8, 0, u); inner.add(new THREE.Mesh(new THREE.SphereGeometry(0.8, 18, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), new THREE.MeshStandardMaterial({ color: [0xe8343c, 0x1f8fe0, 0xffd23f, 0x2bb673][i % 4], roughness: 0.6, side: THREE.DoubleSide }))); const rf = cyl(0.64, 0.64, 0.05, mat(0xfff6e0, { roughness: 0.7 }), 0, -0.3, 0, 18); inner.add(rf); u.add(cyl(0.025, 0.025, 0.7, mat(0x2a2a30), 0, -0.3, 0, 6)); u.rotation.x = Math.PI; P.umb = u; u.visible = false; return P; });
  const astro = [0, 1].map(i => { const P = makeRig({ hood: 0xe9ecf1, hoodD: 0xc9ced8, pants: 0xdfe3ea, skin: [0xe2a77f, 0x7a4a2e][i], hair: 0x3a2a1a, noHood: true, helmet: true, pack: true, shoe: 0xdddddd }); sc.add(P.root); const patch = rbox(0.18, 0.12, 0.03, mat(i ? 0x1f8fe0 : 0xe8343c), 0.22, 0.62, 0.245); P.spine.add(patch); return P; });
  const kneelFx = ball(0.2, mat(0xd9a56a, { roughness: 1 }), 0, 0, 0, undefined, 8); kneelFx.visible = false; sc.add(kneelFx);
  const deb = debrisPool(sc, 24, [0xd9a56a, 0xc88b57, 0xe8e1d0]);
  const pot2 = grp(0, 0, 0, sc); { const inner = mat(0xdfe4ea, { roughness: 0.35, metalness: 0.85, envMapIntensity: 1.4, side: THREE.DoubleSide });
    const wall = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.52, 0.8, 32, 1, true), new THREE.MeshStandardMaterial({ color: 0xc9ced6, roughness: 0.28, metalness: 0.9, envMapIntensity: 1.5, side: THREE.DoubleSide })); wall.position.y = 0.4; wall.castShadow = true; pot2.add(wall);
    pot2.add(cyl(0.52, 0.52, 0.04, inner, 0, 0.04, 0, 28)); const rim = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.04, 8, 32), mat(0xc9ced6, { roughness: 0.28, metalness: 0.9 })); rim.rotation.x = Math.PI / 2; rim.position.y = 0.8; pot2.add(rim);
    [-1, 1].forEach(sx => pot2.add(rbox(0.2, 0.1, 0.14, mat(0xc9ced6, { roughness: 0.28, metalness: 0.9 }), sx * 0.66, 0.66, 0)));
    for (let i = 0; i < 7; i++) { const g = ball(0.045, mat(JOLLOF, { roughness: 0.5 }), Math.cos(i * 2.4) * (0.1 + 0.3 * ((i * 37) % 10) / 10), 0.075, Math.sin(i * 2.4) * (0.1 + 0.3 * ((i * 53) % 10) / 10), undefined, 8); g.scale.set(1.3, 0.6, 1); pot2.add(g); }
    const grain = ball(0.05, mat(JOLLOF, { roughness: 0.5 }), 0, 0.5, 0, undefined, 8); grain.scale.set(1.3, 0.6, 1); grain.visible = false; pot2.grain = grain; pot2.add(grain);
    const sp = grp(0, 0.1, 0, pot2); sp.add(rbox(0.05, 0.5, 0.05, mat(0xb07a42, { roughness: 0.6 }), 0, 0.25, 0)); sp.add(rbox(0.2, 0.05, 0.26, mat(0xb07a42, { roughness: 0.6 }), 0, 0.0, 0)); sp.visible = false; pot2.spoon = sp; } pot2.visible = false;
  S.yard = { umb, sc, hero, mum, mumSpoon, neigh, nPlate, king, drummers, bearer, guards, crowd, astro, pot, potIn, lid, rice, steam, clothes, dayDome, cosDome, stars, galaxies, vort, vd, moon, cosGlow, cap: capsule, hatch, chute, rainG, rainD, ricePile, kneelFx, deb, pot2, gate, doorLeaf, canopy };
}
{ // ---- street (Day 3): generators
  const sc = new THREE.Scene(); sc.add(skyDome('#4f86c8', '#9fd0f0', '#ffe9c0'));
  lightRig(sc, { sky: 0xe6f3ff, ground: 0x9a7e5a, hemi: 0.55, keyC: 0xfff0d8, key: 1.9, keyPos: [-8, 12, 10], target: [0, 0, 0], rim: 0.5, rimC: 0xbfe0ff, rimPos: [8, 5, -8], env: 0.45, R: 16 });
  sc.add(rbox(120, 0.2, 9, mat(0x59606e, { roughness: 0.7 }), 0, -0.1, 3.8)); sc.add(rbox(120, 0.22, 7, mat(0xcaa87a, { roughness: 0.9 }), 0, -0.09, -3.4)); for (let x = -40; x < 40; x += 3.2) sc.add(rbox(1.5, 0.02, 0.16, mat(0xffffff, { roughness: 0.4 }), x, 0.01, 3.8));
  const cols = [0xf4a259, 0x7ec8e3, 0xe9c46a, 0xf08a8a, 0xa8d5a2, 0xf2cf6b, 0xd9c7a0, 0xe8b4a0];
  const gens = [], lamps = [];
  for (let i = 0; i < 6; i++) { const x = -12 + i * 4.8; const h = house(sc, x, -9.4, 4.2, 3.4, 4.0, mat(cols[i], { roughness: 0.85 }), mat(0x8b5a3c, { roughness: 0.6 })); h.rotation.y = 0;
    const g = grp(x + 1.3, 0, -6.2, sc); g.add(rbox(1.1, 0.8, 0.75, mat(0xd8321f, { roughness: 0.4 }), 0, 0.5, 0)); g.add(rbox(1.14, 0.06, 0.8, mat(0x2a2a30), 0, 0.93, 0)); g.add(rbox(0.5, 0.45, 0.4, mat(0xf2c14e, { roughness: 0.4 }), -0.2, 0.74, 0)); T(g, cyl(0.07, 0.07, 0.8, mat(0x3a3a40), 0.45, 1.2, -0.2, 8)); g.add(rbox(0.1, 0.1, 0.1, mat(0x2bd96b, { emissive: 0x2bd96b, emissiveIntensity: 1.6 }), 0.42, 0.62, 0.4)); g.add(rbox(0.28, 0.1, 0.1, mat(0xfff3b0), 0.1, 0.12, 0.45)); gens.push(g);
    const lamp = rbox(0.5, 0.5, 0.06, mat(0xfff0b0, { emissive: 0xffe08a, emissiveIntensity: 1.6 }), x - 0.9, 2.3, -7.36); sc.add(lamp); lamps.push(lamp); const pl = new THREE.PointLight(0xffe08a, 0, 7, 1.6); pl.position.set(x - 0.9, 2.3, -6.8); sc.add(pl); lamp.userData.pl = pl; }
  [-14, -4, 6, 16].forEach(x => { sc.add(rbox(0.22, 7.0, 0.22, mat(0x7a5a3a, { roughness: 0.8 }), x, 3.5, -2.8)); sc.add(rbox(2.2, 0.14, 0.14, mat(0x7a5a3a), x, 6.5, -2.8)); });
  palm(sc, -17, -5, 1.2, 0.1); palm(sc, 22, -5, 1.2, -0.1);
  const smoke = [...Array(36)].map(() => { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), new THREE.MeshStandardMaterial({ color: 0x4a4a50, transparent: true, opacity: 0.4, roughness: 1, depthWrite: false })); m.castShadow = false; m.visible = false; sc.add(m); return m; });
  const people = [...Array(7)].map((_, i) => { const P = npc(i + 2); sc.add(P.root); return P; });
  const bus = grp(0, 0, 0, sc);
  const hero = makeRig({}); sc.add(hero.root);
  S.street = { sc, gens, lamps, smoke, people, hero };
}
{ // ---- lagoon (Day 4): water, canoe, fisherman, fish, the house on the shore
  const sc = new THREE.Scene(); sc.add(skyDome('#4f9be0', '#aee0f5', '#fff0cc'));
  lightRig(sc, { sky: 0xe6f6ff, ground: 0x4a88a8, hemi: 0.55, keyC: 0xfff0d8, key: 1.9, keyPos: [-6, 12, 12], target: [0, 0, 0], rim: 0.6, rimC: 0xbfe8ff, rimPos: [8, 4, -8], env: 0.55, R: 14 });
  const wGeo = new THREE.PlaneGeometry(160, 100, 80, 50); wGeo.rotateX(-Math.PI / 2); const wm = new THREE.Mesh(wGeo, new THREE.MeshStandardMaterial({ color: 0x2c93b8, roughness: 0.12, metalness: 0.25, envMapIntensity: 1.5, flatShading: true })); wm.receiveShadow = true; wm.position.set(0, -0.05, -20); sc.add(wm);
  const wp0 = wGeo.attributes.position.array.slice();
  sc.add(rbox(40, 0.4, 24, mat(0xd9b27a, { roughness: 0.95 }), 24, -0.15, 2)); sc.add(rbox(40, 0.5, 4, mat(0xc88b57, { roughness: 0.9 }), 22, 0.1, -9));
  const hs = house(sc, 14, -1.4, 6.2, 3.6, 5.0, mat(0xf2cf6b, { roughness: 0.85 }), mat(0x8b5a3c, { roughness: 0.6 }), -0.2); const shorePot = grp(9.4, 0, 3.6, sc); shorePot.add(cyl(0.7, 0.62, 1.1, mat(0xc9ced6, { roughness: 0.28, metalness: 0.9, envMapIntensity: 1.5 }), 0, 0.85, 0, 24)); shorePot.add(cyl(0.74, 0.74, 0.1, mat(0xc9ced6, { roughness: 0.28, metalness: 0.9 }), 0, 1.45, 0, 24)); shorePot.scale.setScalar(1.3);
  const lSteam = makeSteam(sc, 16, 0xfff3e2);
  [-22, 30, 8, 44].forEach((x, i) => sc.add(rbox(7 + i % 2 * 3, 14 + i * 5, 6, mat([0xbcd4e6, 0xaec6dc, 0xc9dcea, 0xb2cadf][i], { roughness: 0.2, metalness: 0.3 }), x - 8, 7 + i * 2.5, -52 - i * 6)));
  // stilt houses
  const stilts = (x, z) => { const g = grp(x, 0, z, sc); [[-1, -0.7], [1, -0.7], [-1, 0.7], [1, 0.7]].forEach(([a, b]) => g.add(cyl(0.07, 0.07, 1.6, mat(0x6e4a2e), a, 0.3, b, 6))); g.add(rbox(2.6, 1.1, 2.0, mat([0xe9c46a, 0x8fd1e0, 0xe8a0a0][Math.abs(Math.round(x)) % 3], { roughness: 0.85 }), 0, 1.45, 0)); g.add(zinc(3.0, 2.4, 0, 2.15, 0, 0.0)); return g; };
  [[-14, -14], [-9, -17], [-18, -10], [-4, -19], [-22, -16]].forEach(([x, z]) => stilts(x, z));
  const canoe = grp(-2.4, 0.0, 1.6, sc); { const bm = mat(0x8a5a2c, { roughness: 0.6 }); canoe.add(rbox(3.6, 0.3, 1.0, bm, 0, 0.12, 0)); canoe.add(rbox(3.4, 0.35, 0.12, bm, 0, 0.35, 0.46)); canoe.add(rbox(3.4, 0.35, 0.12, bm, 0, 0.35, -0.46)); const bow = rbox(0.9, 0.3, 0.9, bm, 1.9, 0.3, 0); bow.rotation.z = 0.5; canoe.add(bow); const st = rbox(0.9, 0.3, 0.9, bm, -1.9, 0.3, 0); st.rotation.z = -0.5; canoe.add(st); T(canoe, rbox(0.08, 2.2, 0.08, mat(0xb07a42), 0.2, 1.1, -0.2)).rotation.z = 0.25; }
  const fman = makeRig({ hood: 0xe0b040, hoodD: 0xb98a2a, pants: 0x3b5fa0, skin: 0x6b4128, hairStyle: 'none', noHood: true, shoe: 0x6b4128 }); { const hat = cone(0.78, 0.38, mat(0xd9b66a, { roughness: 0.7 }), 0, 0.88, 0, 24); hat.castShadow = true; fman.head.add(hat); fman.head.add(cyl(0.8, 0.8, 0.05, mat(0xc9a55a, { roughness: 0.7 }), 0, 0.7, 0, 24)); } sc.add(fman.root); const fPlate = plate(0.42); fman.arms[1].el.add(fPlate); fPlate.position.set(0, -0.55, 0.15); fPlate.rotation.x = -1.3;
  const fish = [...Array(14)].map((_, i) => { const g = grp(0, 0, 0, sc); const col = [0xffa63d, 0x8fd3ff, 0xffd23f][i % 3]; const bm = mat(col, { roughness: 0.2, metalness: 0.5, envMapIntensity: 1.4 }); const bd = ball(0.34, bm, 0, 0, 0, undefined, 16); bd.scale.set(1.8, 0.85, 0.65); g.add(bd); const tail = rbox(0.3, 0.8, 0.08, bm, -0.7, 0, 0); tail.rotation.z = 0.2; g.add(tail); g.scale.setScalar(1.35); g.add(ball(0.06, mat(0x111111), 0.45, 0.08, 0.17, undefined, 8)); g.add(rbox(0.3, 0.2, 0.06, bm, 0.0, 0.26, 0)); g.visible = false; return g; });
  const splash = [...Array(24)].map(() => { const m = ball(0.07, new THREE.MeshStandardMaterial({ color: 0xe8fbff, transparent: true, opacity: 0.8, roughness: 0.1 }), 0, 0, 0, undefined, 8); m.castShadow = false; m.visible = false; sc.add(m); return m; });
  const hero = makeRig({}); sc.add(hero.root);
  S.lagoon = { hero, sc, wGeo, wp0, canoe, fman, fPlate, fish, splash, lSteam, shorePot, hs };
}
{ // ---- aerial (Day 5): Lagos from the sky, the orange jollof cloud, the plane
  const sc = new THREE.Scene(); sc.add(skyDome('#2b6fc4', '#8cc8f0', '#ffe3b8', 190));
  lightRig(sc, { sky: 0xe6f3ff, ground: 0xc9a46a, hemi: 0.6, keyC: 0xfff2dc, key: 1.9, keyPos: [-20, 40, 20], target: [0, 0, 0], env: 0.55, R: 60, rim: 0.6, rimC: 0xffc080, rimPos: [30, 6, -30] });
  sc.add(rbox(600, 0.3, 600, mat(0x2c93b8, { roughness: 0.12, metalness: 0.2, envMapIntensity: 1.5 }), 0, -0.2, 0)); sc.add(rbox(260, 0.5, 120, mat(0xc9a46a, { roughness: 0.95 }), -40, 0.0, -50)); sc.add(rbox(120, 0.5, 30, mat(0xc9a46a, { roughness: 0.95 }), 70, 0.0, -40));
  const bl = new THREE.InstancedMesh(rgeo(1, 1, 1), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 }), 900); bl.frustumCulled = false; const br = rnd(8); const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion();
  for (let i = 0; i < 900; i++) { const x = -150 + br() * 300 - (br() < 0.5 ? 0 : 0), z = -108 + br() * 100; const h = 1 + br() * br() * 9; const w = 1.6 + br() * 3; m4.compose(V([x, h / 2, z]), q4, V([w, h, w])); bl.setMatrixAt(i, m4); bl.setColorAt(i, new THREE.Color([0xe8d2a0, 0xd9c7a0, 0xf4a259, 0x7ec8e3, 0xe9c46a, 0xf08a8a, 0xffffff][Math.floor(br() * 7)])); } sc.add(bl);
  sc.add(rbox(4, 0.5, 90, mat(0x6a6f78, { roughness: 0.6 }), 20, 1.2, -10).translateX(0)); // bridge over the lagoon
  const cloud = grp(-10, 0, -40, sc); const cm = new THREE.MeshStandardMaterial({ color: 0xff9a3c, roughness: 0.9, emissive: 0xff7a1a, emissiveIntensity: 0.1, transparent: true, opacity: 0.92 }); const cm2 = new THREE.MeshStandardMaterial({ color: 0xffd08a, roughness: 0.9, emissive: 0xffa040, emissiveIntensity: 0.08, transparent: true, opacity: 0.9 });
  const cr = rnd(3); for (let i = 0; i < 38; i++) { const a = cr() * 6.28, r = Math.sqrt(cr()) * 26, y = 10 + cr() * 34; const s = 6 + cr() * 9 * (1 - y / 70); const b = ball(s, i % 3 ? cm : cm2, Math.cos(a) * r * (0.5 + y / 70), y, Math.sin(a) * r * (0.5 + y / 70), undefined, 20); b.castShadow = false; cloud.add(b); }
  cloud.add(cyl(5, 8, 24, cm, 0, 12, 0, 20)).castShadow = false;
  const hazeC = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex('rgba(255,170,80,0.45)', 'rgba(255,140,40,0.15)'), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); hazeC.scale.setScalar(150); hazeC.position.set(0, 30, 6); cloud.add(hazeC);
  const plane = grp(0, 0, 0, sc); { const wm = mat(0xf7f9fc, { roughness: 0.25, metalness: 0.2 }), gm = mat(0x1f8f4a, { roughness: 0.3 }); const fu = cyl(1.3, 1.3, 11, wm, 0, 0, 0, 24); fu.rotation.z = Math.PI / 2; plane.add(fu); const nose = ball(1.3, wm, 5.5, 0, 0, undefined, 24); plane.add(nose); const tailc = cone(1.3, 3.2, wm, -6.9, 0.3, 0, 24); tailc.rotation.z = Math.PI / 2; plane.add(tailc);
    plane.add(rbox(10.5, 0.14, 0.6, gm, 0.2, 0.2, 0)); const wing = rbox(2.8, 0.18, 12, wm, -0.2, -0.45, 0); plane.add(wing); const wing2 = rbox(1.4, 0.12, 4.6, wm, -6.3, 0.2, 0); plane.add(wing2); const fin = rbox(2.2, 2.4, 0.16, gm, -6.0, 1.9, 0); fin.rotation.z = 0.35; plane.add(fin); [-3.4, 3.4].forEach(z => { const en = cyl(0.42, 0.42, 1.4, mat(0xc9ced6, { metalness: 0.7, roughness: 0.3 }), 0.8, -0.95, z, 16); en.rotation.z = Math.PI / 2; plane.add(en); });
    for (let i = 0; i < 10; i++) plane.add(rbox(0.28, 0.3, 0.05, mat(0x2b3a52), 3.8 - i * 0.62, 0.55, 1.29)), plane.add(rbox(0.28, 0.3, 0.05, mat(0x2b3a52), 3.8 - i * 0.62, 0.55, -1.29)); plane.add(rbox(1.0, 0.45, 0.06, mat(0x2b3a52), 5.0, 0.55, 1.2)); plane.add(rbox(1.0, 0.45, 0.06, mat(0x2b3a52), 5.0, 0.55, -1.2)); }
  const contrail = [...Array(14)].map(() => { const m = ball(1, new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.5, roughness: 1, depthWrite: false }), 0, 0, 0, undefined, 10); m.castShadow = false; sc.add(m); return m; });
  const clouds = []; [[-60, 55, -70, 4], [70, 60, -30, 5], [-80, 40, 20, 4], [30, 70, -90, 6], [95, 35, 10, 4]].forEach(a => { const c = cloud0(...a); sc.add(c); clouds.push(c); });
  S.aerial = { sc, cloud, plane, contrail, hazeC };
}
function cloud0(x, y, z, s = 1) { return cloud(x, y, z, s); }
{ // ---- cockpit (Day 5)
  const sc = new THREE.Scene(); sc.add(skyDome('#2b6fc4', '#8cc8f0', '#ffe3b8', 150));
  lightRig(sc, { sky: 0xe6f3ff, ground: 0x8a8070, hemi: 0.6, keyC: 0xfff2dc, key: 1.5, keyPos: [-3, 4, 6], target: [0, 1.2, 0], env: 0.5, R: 8, rim: 0.9, rimC: 0xffc080, rimPos: [4, 2, -6] });
  const dark = mat(0x23262e, { roughness: 0.6 }), grey = mat(0x4a505c, { roughness: 0.5 });
  sc.add(rbox(7, 0.3, 4, mat(0x30343c, { roughness: 0.8 }), 0, -0.15, 1.0)); sc.add(rbox(7, 0.6, 0.6, dark, 0, 2.7, -1.0));
  [-3.4, 3.4].forEach(x => sc.add(rbox(0.4, 3.0, 0.6, dark, x, 1.4, -1.0))); [-1.2, 1.2].forEach(x => { const f = rbox(0.12, 2.3, 0.14, dark, x, 1.6, -1.0); f.rotation.z = x * 0.04; sc.add(f); });
  sc.add(rbox(6.6, 0.9, 1.4, grey, 0, 0.45, -0.5)); for (let i = 0; i < 14; i++) sc.add(rbox(0.2, 0.12, 0.06, mat([0x2bd96b, 0xffb020, 0x5ac8ff][i % 3], { emissive: [0x2bd96b, 0xffb020, 0x5ac8ff][i % 3], emissiveIntensity: 1.2 }), -2.4 + i * 0.37, 0.95, -0.12));
  [-1.7, 1.7].forEach(x => { sc.add(rbox(1.3, 0.2, 1.3, mat(0x1a2236, { roughness: 0.6 }), x, 0.55, 1.5)); sc.add(rbox(1.3, 1.5, 0.22, mat(0x1a2236, { roughness: 0.6 }), x, 1.3, 2.2)); });
  const pilot = makeRig({ hood: 0xf4f6fa, hoodD: 0xdfe3ea, pants: 0x1a2236, skin: 0x7a4a2e, hair: 0x15100d, noHood: true, shoe: 0x15100d }); sc.add(pilot.root); { pilot.head.add(rbox(0.74, 0.18, 0.68, mat(0x1a2236, { roughness: 0.5 }), 0, 0.74, 0.0)); pilot.head.add(rbox(0.5, 0.05, 0.3, mat(0x1a2236), 0, 0.68, 0.42)); pilot.head.add(rbox(0.14, 0.14, 0.04, mat(0xffd23f, { metalness: 0.6, roughness: 0.3 }), 0, 0.78, 0.35)); pilot.head.add(rbox(0.74, 0.07, 0.07, mat(0x222222), 0, 0.5, 0)); [-1, 1].forEach(sx => pilot.head.add(rbox(0.12, 0.26, 0.18, mat(0x222222), sx * 0.36, 0.3, 0.02))); const mic = rbox(0.05, 0.05, 0.3, mat(0x222222), -0.32, 0.12, 0.26); mic.rotation.y = 0.3; pilot.head.add(mic); pilot.head.add(ball(0.06, mat(0x222222), -0.22, 0.12, 0.4, undefined, 8));
    [[0.2, -0.05, 0.06], [-0.2, -0.05, 0.06]].forEach(([x, y, z], k) => pilot.spine.add(rbox(0.1, 0.18, 0.05, mat(0xffd23f, { metalness: 0.5 }), k ? -0.28 : 0.28, 0.72, 0.24))); pilot.spine.add(rbox(0.16, 0.5, 0.05, mat(0x1a2236), 0, 0.4, 0.245)); }
  const copilot = makeRig({ hood: 0xf4f6fa, hoodD: 0xdfe3ea, pants: 0x1a2236, skin: 0x8d5a3b, hair: 0x15100d, noHood: true, shoe: 0x15100d }); copilot.head.add(rbox(0.74, 0.18, 0.68, mat(0x1a2236, { roughness: 0.5 }), 0, 0.74, 0.0)); sc.add(copilot.root);
  const wallM2 = mat(0x4a505c, { roughness: 0.6 }); sc.add(rbox(7, 3.8, 0.2, wallM2, 0, 1.9, 3.7)); sc.add(rbox(0.2, 1.3, 7, wallM2, -3.5, 0.65, 1.5)); sc.add(rbox(0.2, 1.1, 7, wallM2, -3.5, 3.25, 1.5)); sc.add(rbox(0.2, 3.8, 1.2, wallM2, -3.5, 1.9, 4.2)); sc.add(rbox(0.2, 1.7, 0.2, wallM2, -3.5, 2.0, 0.0)); sc.add(rbox(0.3, 0.2, 3.0, mat(0x2a2f38), -3.3, 0.5, 1.5));
  const cloudC = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex('rgba(255,170,80,0.95)', 'rgba(255,130,40,0.5)'), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); sc.add(cloudC);
  const cb = [...Array(9)].map((_, i) => { const m = ball(7 + (i % 3) * 3, i % 2 ? new THREE.MeshStandardMaterial({ color: 0xff9a3c, roughness: 0.9, emissive: 0xff7a1a, emissiveIntensity: 0.4 }) : new THREE.MeshStandardMaterial({ color: 0xffd08a, roughness: 0.9, emissive: 0xffa040, emissiveIntensity: 0.35 }), 0, 0, 0, undefined, 18); m.castShadow = false; sc.add(m); return m; });
  S.cockpit = { sc, pilot, copilot, cloudC, cb };
}
const cam = new THREE.PerspectiveCamera(40, W / H, 0.05, 1000);
const shots = []; const shot = (t0, t1, scene, camA, setup, fx = {}) => shots.push({ t0, t1, scene, cam: camA, setup, ...fx });
const shake = (O, t0, amt, dur = 0.45) => { const k = clamp(1 - (O - t0) / dur); return O < t0 || k <= 0 ? 0 : amt * k * k; };
function resetRig(P) { P.root.position.set(0, 0, 0); P.root.rotation.set(0, 0, 0); P.root.scale.setScalar(1); P.root.visible = true; if (P.flaps) { P.flaps.forEach(f => f.visible = false); P.boxers.visible = false; } if (P.caps) P.caps.forEach(c => c.visible = false); P.glasses.visible = false; }
function talking(speaker, O) { return DIALOGUE.some(c => c.speaker === speaker && c.kind !== 'shout' && spanHit(c, O)); }
function shouting(speaker, O) { return DIALOGUE.some(c => c.speaker === speaker && c.kind === 'shout' && spanHit(c, O)); }
const wp = (o) => { const v = new THREE.Vector3(); o.updateWorldMatrix(true, false); return o.getWorldPosition(v); };

const POT = V([3.2, 0, -1.9]);
const potScaleAt = (O) => { const v = [1, 1.04, 1.08, 1.12, 1.16, 1.2, 1.24, 1.28, 1.34]; let s = v[0]; STEPS.forEach((st, i) => { if (i > 0) s += (v[i] - v[i - 1]) * elastic(seg(O, st.t, st.t + 0.75)); }); return s; };
const dayAt = (O) => { const s = stepAt(O); return s ? s.day : 0; };
{ // extras: cloud over the compound (Day 5+)
  const Y = S.yard; const g = grp(4, 0, -16, Y.sc); const cm = new THREE.MeshStandardMaterial({ color: 0xff9a3c, roughness: 0.9, emissive: 0xff7a1a, emissiveIntensity: 0.1, transparent: true, opacity: 0.9 }), cm2 = new THREE.MeshStandardMaterial({ color: 0xffd08a, roughness: 0.9, emissive: 0xffa040, emissiveIntensity: 0.08, transparent: true, opacity: 0.9 });
  const cr = rnd(3); for (let i = 0; i < 16; i++) { const a = cr() * 6.28, r = cr() * 7; const b = ball(2.2 + cr() * 2.6, i % 3 ? cm : cm2, Math.cos(a) * r, 14 + cr() * 6, Math.sin(a) * r * 0.7, undefined, 16); b.castShadow = false; g.add(b); } g.visible = false; Y.cloudTop = g;
}
function setCosmos(Y, O, k) {
  Y.dayDome.visible = k < 0.999; Y.cosDome.material.opacity = k; Y.stars.material.opacity = k; Y.cosGlow.intensity = 36 * k;
  const hemi = Y.sc.children.find(c => c.isHemisphereLight), key = Y.sc.children.find(c => c.isDirectionalLight);
  if (hemi) { hemi.color.setHex(0xfff0dc).lerp(new THREE.Color(0xb7a6ff), k); hemi.groundColor.setHex(0xa87850).lerp(new THREE.Color(0x4b3a8a), k); hemi.intensity = lerp(0.5, 0.62, k); }
  if (key) { key.color.setHex(0xffd9a8).lerp(new THREE.Color(0xd8ccff), k); key.intensity = lerp(1.7, 1.5, k); }
  Y.galaxies.forEach((m, i) => { m.material.opacity = k * 0.6; m.visible = k > 0.01; const u = ((O * 0.07 + i / 4) % 1); const a = i * 1.7 + u * 3.2 + O * 0.15; const r = lerp(12, 3.2, Math.pow(u, 1.2)); m.position.set(POT.x + Math.cos(a) * r, lerp(13, 6.5, u) + i * 0.6, POT.z + Math.sin(a) * r * 0.8); m.scale.setScalar(lerp(10, 3.6, u) * (0.9 + 0.1 * Math.sin(O + i)) * k); m.lookAt(cam.position); m.rotateZ(O * 0.6 + i); });
  const mt = new THREE.Matrix4(), q = new THREE.Quaternion(), vs = new THREE.Vector3(), vp = new THREE.Vector3();
  Y.vd.forEach((d, i) => { const u = (O * 0.17 + i / Y.vd.length) % 1; const f = Math.pow(1 - u, 1.4); const r = 0.35 + f * (9 + d.r * 7), a = d.a + u * 8 + O * 1.1, y = POT.y + 2.0 + Math.pow(1 - u, 1.1) * (11 + d.y * 6) * (0.4 + 0.6 * k);
    vp.set(POT.x + Math.cos(a) * r, y, POT.z + Math.sin(a) * r * 0.85); const s = d.s * 0.4 * (0.4 + 1.2 * Math.sin(Math.min(1, u * 5) * Math.PI / 2)) * k * (1 - 0.8 * Math.pow(u, 8)); vs.set(s, s, s); mt.compose(vp, q, vs); Y.vort.setMatrixAt(i, mt); }); Y.vort.instanceMatrix.needsUpdate = true; Y.vort.visible = k > 0.01;
}
function yardBase(O, o = {}) {
  const Y = S.yard; [Y.hero, Y.mum, Y.neigh, Y.king, Y.bearer, ...Y.drummers, ...Y.guards, ...Y.crowd, ...Y.astro].forEach(P => { resetRig(P); P.root.visible = false; if (P.helmet) P.helmet.visible = true; P.glasses.visible = false; });
  Y.umb.visible = false; Y.cap.visible = false; Y.chute.visible = false; Y.rainG.visible = false; Y.ricePile.visible = false; Y.moon.visible = false; Y.pot2.visible = false; Y.deb.forEach(d => d.m.visible = false); Y.crowd.forEach(P => P.umb.visible = false); Y.bearer.umb.visible = false;
  const ps = potScaleAt(O); Y.pot.scale.setScalar(ps); Y.pot.position.copy(POT);
  const lidK = o.lid ?? 1; if (lidK >= 1) { Y.lid.position.set(-1.35, 0.62, 0.3); Y.lid.rotation.set(0, 0, 1.2); } else if (lidK <= 0) { Y.lid.position.set(0, 1.58, 0); Y.lid.rotation.set(0, 0, 0); } else { const k = eOut(lidK); Y.lid.position.set(-1.35 * k, 1.58 + 0.8 * Math.sin(k * Math.PI) - 0.96 * k, 0.3 * k); Y.lid.rotation.set(0, 0, 1.2 * k); }
  if (o.rattle) { Y.lid.position.y += 0.04 * Math.abs(Math.sin(O * 40)); Y.lid.rotation.z += 0.05 * Math.sin(O * 33); }
  const day = dayAt(O); const sk = o.steam ?? (lidK <= 0 ? 0.25 : 0.6 + 0.2 * day); Y.steam.update(O, V([POT.x - 0.05, 1.66 * ps, POT.z]), sk, 3.2 + 0.4 * day, 0.35 + 0.05 * day, 0.28 + 0.03 * day);
  Y.clothes.forEach((c, i) => { c.rotation.z = Math.sin(O * 1.3 + i) * 0.07; });
  Y.cloudTop.visible = day >= 5 && !o.noCloud; if (Y.cloudTop.visible) { const k = eOut(seg(O, 19.2, 20.4)); Y.cloudTop.scale.setScalar(0.2 + 0.8 * k * (1 + 0.04 * Math.sin(O))); }
  Y.gate.rotation.y = 1.1; setCosmos(Y, O, o.cos ?? 0);
}
function mumPose(O, o = {}) { const Y = S.yard, M = Y.mum; M.root.visible = true; M.root.position.set(...(o.pos || [1.55, 0, -2.0])); M.root.rotation.y = o.ry ?? 0.5; const st = Math.sin(O * 3.4), ct = Math.cos(O * 3.4); const tk = talking('mum', O);
  pose(M, { ...idle(O, 1.3), spineX: 0.06 + 0.03 * st, headY: o.headY ?? -0.2, headX: o.headX ?? 0.1, headZ: 0.03 * Math.sin(O * 0.7), bob: -0.01, arms: o.arms || [[-0.15, 0, 0.18, 0.45], [-0.5 + 0.12 * ct, 0, 1.1 + 0.1 * st, 0.6 - 0.1 * ct]] }); M.face(o.expr || 'calm', O, tk); }
function heroPose(O, x, z, ry, p, expr, extra = {}) { const Y = S.yard, h = Y.hero; h.root.visible = true; h.root.position.set(x, extra.y || 0, z); h.root.rotation.y = ry; pose(h, p); h.face(expr, O, talking('hero', O)); }

// ===== TITLE + DAY 1 =====
shot(0, 1.6, 'yard', { p0: [5.9, 1.6, 4.0], p1: [4.7, 2.3, 1.3], l0: [3.1, 2.2, -1.9], l1: [3.1, 2.7, -1.9], fov: 38, ease: 'io' }, (lt, O) => {
  yardBase(O, { lid: 1 }); mumPose(O, { pos: [1.6, 0, -2.3], ry: 0.7 }); }, { grade: 'dawn', flare: [0.12, 0.28], dof: 0.3 });
shot(1.6, 3.0, 'yard', { p0: [-1.8, 1.7, 6.2], p1: [0.2, 1.9, 4.6], l0: [0.8, 1.5, -1.5], fov: 44 }, (lt, O) => {
  yardBase(O, { lid: 1 }); mumPose(O, { pos: [1.6, 0, -2.3], ry: 0.7 });
  const k = eIO(seg(O, 1.6, 2.5)); const dx = lerp(-1.4, 0.6, k); const wk = k < 1;
  heroPose(O, dx, lerp(-3.6, -0.6, k), lerp(0.1, 0.35, k), wk ? walk(O, 7.5, 0.75) : { ...idle(O), spineX: -0.1, headX: -0.3, arms: [[-2.3, 0, 0.1, 0.3], [-2.3, 0, -0.1, 0.3]] }, k < 1 ? 'calm' : 'sniff'); }, { grade: 'warm' });
shot(3.0, 5.4, 'yard', { p0: [1.2, 2.2, 7.6], p1: [1.6, 2.1, 6.4], l0: [0.9, 1.7, -1.2], l1: [1.1, 1.7, -1.2], fov: 42, flash: 3.0 }, (lt, O) => {
  yardBase(O, { lid: 1 }); mumPose(O, { pos: [2.0, 0, -2.2], ry: 0.5 });
  const fl = eOut(seg(O, 3.0, 3.5)); const bob = 0.18 * fl + 0.05 * Math.sin(O * 2.4) * fl;
  heroPose(O, 0.1, -0.6, 0.45, { bob, spineX: -0.08 * fl, headX: -0.3 * fl + 0.05 * Math.sin(O * 2), headZ: 0.1 * fl, legs: [[-0.15 * fl, 0.3 * fl], [0.15 * fl, 0.4 * fl]], arms: [[-1.7 * fl, 0, 0.3, 1.1 * fl], [-1.3 * fl, 0, -0.35, 1.3 * fl]] }, 'smile'); }, { grade: 'warm', dof: 0.25 });
shot(5.4, 7.0, 'yard', { p0: [4.4, 1.6, 3.3], p1: [3.7, 2.2, 1.9], l0: [3.2, 1.8, -1.9], l1: [3.2, 2.0, -1.9], fov: 40, ease: 'io' }, (lt, O) => {
  yardBase(O, { lid: 0, rattle: O > 6.3, steam: 1.1 }); mumPose(O, { pos: [1.7, 0, -2.4], ry: 0.7, arms: [[-0.15, 0, 0.18, 0.45], [-0.3 - 0.4 * seg(O, 6.3, 6.7), 0, 0.9, 0.5]] }); heroPose(O, 0.4, -0.5, 0.5, { ...idle(O), headX: -0.2, headY: -0.3 }, 'sniff'); }, { grade: 'warm', dof: 0.35, shakeAt: [[6.35, 0.012], [6.6, 0.012], [6.85, 0.016]] });
// ===== DAY 2 =====
shot(7.0, 7.9, 'yard', { p0: [1.4, 1.9, 4.4], p1: [1.1, 2.0, 2.6], l0: [0.5, 2.0, -0.4], l1: [0.5, 2.0, -0.4], fov: 40, z0: 1.0, z1: 1.5, roll0: -3, roll1: 4, ease: 'lin' }, (lt, O) => {
  yardBase(O, { lid: 1 }); mumPose(O, { pos: [2.4, 0, -2.2], ry: 0.4 }); const ant = seg(O, 6.8, 7.0), pop = seg(O, 7.0, 7.4);
  heroPose(O, 0.5, -0.4, 0.2, { bob: -0.1 * ant + 0.1 * Math.sin(pop * Math.PI), spineX: 0.12 * ant - 0.22 * Math.sin(pop * Math.PI), headX: -0.25 * pop, arms: [[-0.2 - 1.2 * pop, 0, 0.3 + 0.7 * pop, 0.6], [-0.2 - 1.2 * pop, 0, -0.3 - 0.7 * pop, 0.6]] }, 'shock'); }, { grade: 'warm', flash: 7.0, shakeAt: [[7.02, 0.07]] });
shot(7.9, 8.55, 'yard', { p0: [3.2, 1.7, 3.8], p1: [3.7, 1.9, 3.5], l0: [7.6, 2.3, 1.0], fov: 44, ease: 'lin' }, (lt, O) => {
  yardBase(O, { lid: 1 }); mumPose(O, { pos: [2.4, 0, -2.2], ry: 0.4 }); heroPose(O, 1.0, 0.2, 0.9, { ...idle(O), headY: 0.5, arms: [[0, 0, 0.14, 0.2], [-0.4, 0, -0.14, 0.5]] }, 'shock');
  const Y = S.yard, n = Y.neigh; n.root.visible = true; const up = elastic(seg(O, 7.95, 8.5)); n.root.position.set(8.5, lerp(-1.2, 0.72, up), 1.0); n.root.rotation.y = -Math.PI / 2 - 0.15; pose(n, { ...idle(O, 2), arms: [[-2.5 * up, 0, 0.1, 0.1], [-0.8, 0, -0.3, 0.9]] }); n.face('smile', O, talking('neighbour', O)); }, { grade: 'warm' });
shot(8.55, 10.0, 'yard', { p0: [5.6, 2.9, 3.0], p1: [5.9, 3.0, 2.5], l0: [8.4, 2.95, 1.0], l1: [8.4, 2.95, 1.0], fov: 34 }, (lt, O) => {
  yardBase(O, { lid: 1 }); mumPose(O, { pos: [2.4, 0, -2.2], ry: 0.4 }); const Y = S.yard, n = Y.neigh; n.root.visible = true; n.root.position.set(8.5, 0.72, 1.0); n.root.rotation.y = -Math.PI / 2 - 0.15; const tk = talking('neighbour', O);
  pose(n, { ...idle(O, 2), headY: 0.2 + 0.05 * Math.sin(O * 3), headZ: 0.1, arms: [[-2.55 + 0.08 * Math.sin(O * 5), 0, 0.1, 0.1], [-0.8, 0, -0.3, 0.9]] }); n.face(tk ? 'smile' : 'smirk', O, tk); }, { grade: 'warm', dof: 0.35 });
shot(10.0, 10.6, 'yard', { p0: [0.2, 1.9, 3.6], p1: [0.5, 1.95, 3.0], l0: [0.6, 1.9, -0.5], fov: 36 }, (lt, O) => {
  yardBase(O, { lid: 1 }); mumPose(O, { pos: [2.4, 0, -2.2], ry: 0.4 }); heroPose(O, 0.6, -0.5, 0.25, { ...idle(O), headY: -0.5, spineY: -0.15, arms: [[0, 0, 0.14, 0.25], [-0.3, 0, -0.14, 0.4]] }, 'confused'); }, { grade: 'warm', dof: 0.4 });

// ===== DAY 3: generators off =====
const GOFF = [11.7, 11.95, 12.2, 12.45, 12.7, 12.95];
function streetBase(O) { const R = S.street; resetRig(R.hero); R.hero.root.visible = false;
  R.gens.forEach((g, i) => { const on = O < GOFF[i]; g.position.y = on ? Math.abs(Math.sin(O * 55 + i)) * 0.012 : 0; g.rotation.z = on ? Math.sin(O * 63 + i * 2) * 0.006 : 0; const x = -12 + i * 4.8;
    const lamp = R.lamps[i]; lamp.material.emissiveIntensity = on ? 1.6 : 0.04; lamp.userData.pl.intensity = on ? 5 : 0;
    for (let j = 0; j < 6; j++) { const m = R.smoke[i * 6 + j]; const ph = (O * 0.9 + j / 6 + i * 0.13) % 1; const alive = O < GOFF[i] + 0.4 + ph * 0.0; m.visible = alive; m.position.set(x + 1.75 + ph * 0.7, 1.7 + ph * 2.4, -6.4); m.scale.setScalar(0.12 + ph * 0.5); m.material.opacity = 0.5 * (1 - ph) * (O < GOFF[i] ? 1 : clamp(1 - (O - GOFF[i]) / 0.4)); } });
  R.people.forEach((p, i) => { const gi = i % 6; const x = -12 + gi * 4.8; resetRig(p); p.root.visible = i < 6; p.root.position.set(x + 0.4 + (i === 6 ? 0 : 0), 0, -5.1); p.root.rotation.y = 0.3 - 0.1 * (i % 3); const off = GOFF[gi]; const flick = seg(O, off - 0.45, off - 0.05) * (1 - seg(O, off + 0.0, off + 0.25)); const sn = eOut(seg(O, off + 0.2, off + 0.7));
    pose(p, { ...idle(O, i), bob: 0.1 * sn * Math.abs(Math.sin(O * 2 + i)) * 0 + 0.12 * sn, spineX: 0.25 * flick - 0.08 * sn, headX: 0.2 * flick - 0.45 * sn, arms: [[-0.2 - 1.3 * flick, 0, 0.3 + 0.6 * sn, 0.4 + 0.9 * flick], [-0.2, 0, -0.3 - 0.8 * sn, 0.4 + 1.0 * sn]] }); p.face(sn > 0.4 ? 'sniff' : 'confused', O); }); }
shot(10.6, 11.5, 'street', { p0: [1.4, 2.2, 8.4], p1: [0.8, 2.2, 6.6], l0: [0.3, 2.0, 0.0], l1: [0.3, 2.0, 0.0], fov: 44, z0: 1.0, z1: 1.35, roll0: 3, roll1: -3, ease: 'lin' }, (lt, O) => {
  streetBase(O); const h = S.street.hero; h.root.visible = true; h.root.position.set(0.3, 0, 0.6); h.root.rotation.y = 0.15; const ant = seg(O, 10.45, 10.62), pop = seg(O, 10.62, 11.0);
  pose(h, { bob: -0.1 * ant + 0.1 * Math.sin(pop * Math.PI), spineX: 0.12 * ant - 0.2 * Math.sin(pop * Math.PI), headX: -0.3 * pop, arms: [[-0.4 - 1.4 * pop, 0, 0.3 + 0.7 * pop, 0.5], [-0.4 - 1.4 * pop, 0, -0.3 - 0.7 * pop, 0.5]] }); h.face('shock', O); }, { grade: 'street', flash: 10.6, shakeAt: [[10.62, 0.07]] });
shot(11.5, 12.7, 'street', { p0: [-9.0, 1.6, -1.8], p1: [3.0, 1.7, -1.8], l0: [-5.0, 1.5, -5.4], l1: [7.0, 1.5, -5.4], fov: 54, ease: 'lin', live: 0.6 }, (lt, O) => { streetBase(O); }, { grade: 'street' });
shot(12.7, 13.8, 'street', { p0: [-1.6, 1.6, 4.4], p1: [0.8, 1.8, 2.6], l0: [0.2, 2.2, -5.0], l1: [0.6, 2.3, -5.0], fov: 44, ease: 'io' }, (lt, O) => { streetBase(O); const h = S.street.hero; h.root.visible = true; h.root.position.set(0.6, 0, -2.4); h.root.rotation.y = 0.1; const sn = eOut(seg(O, 12.8, 13.3));
  pose(h, { ...idle(O), bob: 0.14 * sn, headX: -0.4 * sn, spineX: -0.08 * sn, arms: [[-1.6 * sn, 0, 0.3, 1.1 * sn], [-1.3 * sn, 0, -0.35, 1.3 * sn]] }); h.face(sn > 0.3 ? 'sniff' : 'confused', O); }, { grade: 'quiet', dof: 0.3 });
shot(13.8, 14.8, 'yard', { p0: [5.4, 2.0, 3.2], p1: [4.4, 2.3, 1.6], l0: [2.7, 2.0, -2.0], l1: [2.8, 2.2, -2.0], fov: 40, ease: 'io' }, (lt, O) => {
  yardBase(O, { lid: 0, rattle: true, steam: 1.0 }); mumPose(O, { pos: [1.7, 0, -2.4], ry: 0.7, arms: [[-0.15, 0, 0.18, 0.45], [-0.3, 0, 0.95, 0.5]] }); }, { grade: 'quiet', dof: 0.35, shakeAt: [[14.0, 0.01], [14.3, 0.012], [14.6, 0.014]] });

// ===== DAY 4: lagoon =====
function lagoonBase(O) { const L = S.lagoon; const p = L.wGeo.attributes.position.array; for (let i = 0; i < p.length; i += 3) { const x = L.wp0[i], z = L.wp0[i + 2]; p[i + 1] = 0.12 * Math.sin(x * 0.45 + O * 1.5) + 0.1 * Math.cos(z * 0.6 + O * 1.1) + 0.05 * Math.sin((x + z) * 1.2 + O * 2.4); } L.wGeo.attributes.position.needsUpdate = true; L.wGeo.computeVertexNormals();
  L.canoe.position.y = 0.05 + 0.05 * Math.sin(O * 1.7); L.canoe.rotation.z = 0.03 * Math.sin(O * 1.3); L.canoe.rotation.x = 0.02 * Math.sin(O * 1.1);
  const fm = L.fman; resetRig(fm); fm.root.position.set(-2.2, 0.28 + 0.05 * Math.sin(O * 1.7), 1.6); fm.root.rotation.y = 0.3;
  L.lSteam.update(O, V([14.5, 4.5, -1.4]), 1.2, 4, 0.5, 0.5); const day = dayAt(O); L.shorePot.scale.setScalar(1.3);
  resetRig(L.hero); L.hero.root.visible = false;
  L.fish.forEach((f, i) => { const per = 2.6, a0 = (O + i * 0.37) % per; const u = a0 / per, act = u < 0.42 && O >= 14.9; f.visible = act; if (!act) return; const a = u / 0.42; const sx = -8 + (i % 7) * 1.7, sz = -6 + (i * 1.9 % 6), ex = 7.2 + (i % 5) * 0.8, ez = -1 + (i % 4) * 0.8; const h = 3.6 + (i % 3) * 0.8; const x = lerp(sx, ex, a), z = lerp(sz, ez, a), y = 4 * h * a * (1 - a) + 0.05; const vx = ex - sx, vy = 4 * h * (1 - 2 * a); f.position.set(x, y, z); f.rotation.set(0, 0, Math.atan2(vy, vx * 0.8)); f.rotation.x = Math.sin(O * 20 + i) * 0.2; });
  L.splash.forEach((m, i) => { const f = L.fish[i % 14]; const per = 2.6; const u = ((O + (i % 14) * 0.37) % per) / per; const dt = u / 0.42 * 0.5; if (u < 0.12 && O >= 14.9) { m.visible = true; const a = i * 2.4; const t = u * per; m.position.set(-8 + ((i % 14) % 7) * 1.7 + Math.cos(a) * t * 1.2, 0.1 + 2.2 * t - 4.9 * t * t, -6 + ((i % 14) * 1.9 % 6) + Math.sin(a) * t * 0.8); m.scale.setScalar(1 - u * 3); } else m.visible = false; }); }
shot(14.8, 16.0, 'lagoon', { p0: [-3.5, 2.6, 11.5], p1: [-1.5, 2.4, 10.0], l0: [3.2, 2.2, 1.0], l1: [4.2, 2.4, 0.8], fov: 54, ease: 'io' }, (lt, O) => { lagoonBase(O); const h = S.lagoon.hero; h.root.visible = true; h.root.position.set(6.2, 0.05, 4.4); h.root.rotation.y = -0.6; const pop = seg(O, 14.82, 15.25), ant = seg(O, 14.65, 14.82);
  pose(h, { bob: -0.1 * ant + 0.1 * Math.sin(pop * Math.PI), spineX: 0.12 * ant - 0.2 * Math.sin(pop * Math.PI), headX: -0.3 * pop, arms: [[-0.4 - 1.3 * pop, 0, 0.3 + 0.7 * pop, 0.5], [-0.4 - 1.3 * pop, 0, -0.3 - 0.7 * pop, 0.5]] }); h.face('shock', O); }, { grade: 'lagoon', flash: 14.8, shakeAt: [[14.82, 0.07]] });
shot(16.0, 18.5, 'lagoon', { p0: [0.6, 2.4, 7.4], p1: [-0.4, 2.3, 6.4], l0: [-2.0, 2.2, 1.6], l1: [-2.0, 2.2, 1.6], fov: 36, ease: 'io' }, (lt, O) => { lagoonBase(O); const fm = S.lagoon.fman; const tk = talking('fisherman', O); const up = eOut(seg(O, 16.1, 16.5));
  pose(fm, { ...idle(O, 3), headY: -0.5 + 0.06 * Math.sin(O * 3), headX: 0.05, spineX: 0.02, bob: -0.1, legs: [[0.15, 0.25], [0.1, 0.2]], arms: [[-0.25, 0, 0.2, 0.35], [-1.5 * up - 0.3, 0, -0.35 - 0.1 * up, 1.2 * up + 0.3]] }); fm.face(tk ? 'grit' : 'calm', O, tk); fm.brows[0].rotation.z = 0.15; fm.brows[1].rotation.z = -0.15; }, { grade: 'lagoon', dof: 0.35 });
shot(18.5, 19.2, 'lagoon', { p0: [3.4, 1.0, 8.2], p1: [4.4, 1.2, 7.0], l0: [8.0, 1.8, 3.2], l1: [8.0, 1.9, 3.2], fov: 44, ease: 'lin' }, (lt, O) => { lagoonBase(O); const h = S.lagoon.hero; h.root.visible = true; h.root.position.set(7.8, 0.05, 3.4); h.root.rotation.y = -0.9 + 0.1 * Math.sin(O * 3); pose(h, { ...idle(O), headY: -0.3, headX: -0.2, arms: [[-1.2, 0, 0.5, 0.9], [-1.2, 0, -0.5, 0.9]] }); h.face('shock', O); }, { grade: 'lagoon' });

// ===== DAY 5: visible from a plane =====
shot(19.2, 20.0, 'yard', { p0: [1.6, 1.5, 6.4], p1: [1.9, 1.7, 5.4], l0: [2.4, 4.0, -3.0], l1: [2.6, 4.6, -3.0], fov: 52, ease: 'out' }, (lt, O) => {
  yardBase(O, { lid: 0 }); mumPose(O, { pos: [1.7, 0, -2.4], ry: 0.7 }); const ant = seg(O, 19.05, 19.22), pop = seg(O, 19.22, 19.6);
  heroPose(O, 2.4, 1.2, 0.1, { bob: -0.1 * ant + 0.08 * Math.sin(pop * Math.PI), spineX: 0.12 * ant - 0.28 * pop, headX: -0.55 * pop, arms: [[-0.4 - 1.0 * pop, 0, 0.3 + 0.6 * pop, 0.5], [-0.4 - 1.0 * pop, 0, -0.3 - 0.6 * pop, 0.5]] }, 'shock'); }, { grade: 'sky', flash: 19.2, shakeAt: [[19.22, 0.07]] });
const planeAt = (O) => { const k = seg(O, 20.0, 20.9); return { p: V([lerp(46, 20, eIO(k)), lerp(40, 34, k), lerp(14, -8, eIO(k))]), roll: lerp(0, 0.7, eOut(seg(O, 20.0, 20.5))), yaw: lerp(Math.PI * 0.92, Math.PI * 0.72, eIO(k)) }; };
shot(20.0, 20.9, 'aerial', { p0: [52, 38, 62], p1: [38, 36, 48], l0: [24, 33, -2], l1: [10, 32, -16], fov: 50, ease: 'lin', live: 0.5 }, (lt, O) => {
  const A = S.aerial; A.cloud.scale.setScalar(1 + 0.04 * Math.sin(O * 1.3)); const pl = planeAt(O); A.plane.position.copy(pl.p); A.plane.rotation.set(pl.roll, pl.yaw, 0, 'YXZ'); A.contrail.forEach((c, i) => { const u = i / 14; c.position.set(pl.p.x + Math.cos(pl.yaw - Math.PI / 2) * 0, pl.p.y, pl.p.z); const back = V([Math.cos(pl.yaw) * 0 - Math.sin(pl.yaw) * 0, 0, 0]); c.position.copy(pl.p).add(V([Math.cos(pl.yaw) * -1, 0, Math.sin(pl.yaw) * 1]).multiplyScalar((i + 1) * 1.6)).add(V([0, 0.2, 0])); c.scale.setScalar(0.5 + i * 0.12); c.material.opacity = 0.55 * (1 - u); }); }, { grade: 'sky', bloom: 0.14 });
const cockpitCam = (O) => ({});
function cockpitBase(O, who) { const C = S.cockpit; resetRig(C.pilot); resetRig(C.copilot); C.pilot.root.position.set(-1.7, 0.55, 1.4); C.pilot.root.rotation.y = Math.PI - 0.45; C.copilot.root.position.set(1.7, 0.55, 1.4); C.copilot.root.rotation.y = Math.PI + 0.3;
  const sit = { bob: -0.42, legs: [[1.4, -1.5], [1.4, -1.5]] }; const tk = talking('pilot', O);
  pose(C.pilot, { ...idle(O, 0.4), ...sit, spineX: 0.05, headY: 0.15 * Math.sin(O * 0.8), headZ: 0.03, arms: [[-1.1, 0, 0.15, 0.7], [-1.0, 0, -0.15, 0.7 + 0.05 * Math.sin(O * 2)]] }); C.pilot.face(tk ? 'calm' : 'calm', O, tk);
  const sn = eOut(seg(O, 21.6, 22.2)); pose(C.copilot, { ...idle(O, 1.1), ...sit, headX: -0.3 * sn, headY: -0.25 * sn, spineX: -0.05 * sn, arms: [[-1.1, 0, 0.15, 0.7], [-0.9 - 0.7 * sn, 0, -0.15, 0.7 + 0.5 * sn]] }); C.copilot.face(sn > 0.3 ? 'sniff' : 'calm', O);
  const k = eIn(seg(O, 20.9, 24.4)); C.cloudC.position.set(-48 + 14 * k, 5, 18); C.cloudC.scale.setScalar(70 + 60 * k); C.cb.forEach((m, i) => { m.position.set(-52 + 8 * k + Math.cos(i * 2.1) * 12, 3 + Math.sin(i * 1.3) * 7, 14 + Math.sin(i * 1.7) * 9); m.scale.setScalar(0.8 + 0.5 * k); }); }
shot(20.9, 22.9, 'cockpit', { p0: [0.9, 2.45, -0.8], p1: [0.5, 2.4, -0.4], l0: [-1.8, 2.0, 1.4], l1: [-1.8, 2.0, 1.4], fov: 38, ease: 'io' }, (lt, O) => { cockpitBase(O); }, { grade: 'cockpit', dof: 0.3 });
shot(22.9, 24.4, 'cockpit', { p0: [-0.9, 2.5, -0.9], p1: [-0.5, 2.45, -0.5], l0: [1.7, 2.0, 1.4], l1: [1.7, 2.0, 1.4], fov: 40, ease: 'io' }, (lt, O) => { cockpitBase(O); }, { grade: 'cockpit', dof: 0.3 });

// ===== DAY 6: kings are visiting =====
const KX = 0.2, KZ = -1.3;
const procX = (O) => lerp(-7.2, KX, eIO(seg(O, 24.9, 26.45)));
function procBase(O) { const Y = S.yard; const x = procX(O); const walking = O < 26.45; const wk = (ph) => walking ? walk(O + ph, 11.5, 0.95) : idle(O, ph);
  const place = (P, dx, z, p, expr) => { P.root.visible = true; P.root.position.set(x + dx, 0, z); P.root.rotation.y = Math.PI / 2; pose(P, p); P.face(expr, O); };
  const kneel = eOut(seg(O, 26.45, 26.9)); const k = Y.king; k.root.visible = true; k.root.position.set(x, 0, KZ); k.root.rotation.y = Math.PI / 2 + 0.25 * kneel;
  const kp = walking ? walk(O, 11.5, 0.9) : { bob: -0.4 * kneel, spineX: 0.55 * kneel, headX: 0.3 * kneel, legs: [[1.4 * kneel, -1.5 * kneel], [-0.1 * kneel, 1.6 * kneel]], arms: [[-0.5 * kneel, 0, 0.2, 0.4 * kneel], [-0.9 * kneel, 0, -0.3, 0.9 * kneel]] };
  pose(k, kp); k.face(kneel > 0.5 ? 'worried' : 'smirk', O);
  place(Y.bearer, -1.1, KZ - 0.1, walking ? walk(O + 0.4, 11.5, 0.9, { arms: [[-0.4, 0, 0.14, 0.4], [-2.2, 0, -0.3, 0.3]] }) : { ...idle(O, 1), arms: [[0, 0, 0.14, 0.2], [-2.2, 0, -0.3, 0.3]] }, 'smile'); Y.bearer.umb.visible = true; Y.bearer.umb.position.set(x - 1.15, 0.9, KZ - 0.1);
  const beat = (i) => { const b = Math.max(0, Math.sin(O * 15 + i * 1.7)); return { bob: 0.02 * b, arms: [[-0.2, 0, 0.14, 0.3], [-0.7 - 0.5 * b, 0, -0.35, 0.9 + 0.5 * b]], ...(walking ? { legs: walk(O + i, 11.5, 0.9).legs } : {}) }; };
  place(Y.drummers[0], -2.6, KZ + 0.5, { ...idle(O, 0.3), ...beat(0), spineX: 0.06 }, 'laugh'); place(Y.drummers[1], -3.7, KZ - 0.4, { ...idle(O, 0.9), ...beat(1) }, 'smile');
  place(Y.guards[0], 1.9, KZ + 0.7, wk(0.2), 'grit'); place(Y.guards[1], 2.9, KZ - 0.3, wk(0.8), 'grit');
  const dz = walking ? 1 : 0; Y.drummers.forEach(d => d.stick.visible = true); }
shot(24.4, 25.1, 'yard', { p0: [-2.0, 1.9, 6.4], p1: [-3.0, 1.9, 5.0], l0: [-4.8, 1.8, 0.8], l1: [-4.8, 1.8, 0.8], fov: 44, ease: 'lin' }, (lt, O) => {
  yardBase(O, { lid: 0 }); mumPose(O, { pos: [1.7, 0, -2.4], ry: 0.7 }); const ant = seg(O, 24.25, 24.42), pop = seg(O, 24.42, 24.8);
  heroPose(O, -4.8, 0.8, 0.25, { bob: -0.1 * ant + 0.08 * Math.sin(pop * Math.PI), spineX: 0.12 * ant - 0.2 * Math.sin(pop * Math.PI), headX: -0.3 * pop, headY: -0.4, arms: [[-0.4 - 1.3 * pop, 0, 0.3 + 0.7 * pop, 0.5], [-0.4 - 1.3 * pop, 0, -0.3 - 0.7 * pop, 0.5]] }, 'shock'); }, { grade: 'warm', flash: 24.4, shakeAt: [[24.42, 0.07]] });
shot(25.1, 26.45, 'yard', { pf: () => V([procX(CLK) - 0.6, 2.2, 8.6]), lf: () => V([procX(CLK) - 1.0, 1.5, -1.2]), fov: 54 }, (lt, O) => { CLK = O; yardBase(O, { lid: 0 }); mumPose(O, { pos: [1.7, 0, -2.4], ry: 0.7, headY: -0.2 }); procBase(O); }, { grade: 'warm', mblur: 3, shakeAt: [[25.1, 0.01]] });
shot(26.45, 27.3, 'yard', { p0: [3.4, 1.4, 4.4], p1: [2.4, 1.3, 3.2], l0: [0.9, 1.4, -1.6], l1: [1.0, 1.5, -1.8], fov: 46, ease: 'io' }, (lt, O) => { yardBase(O, { lid: 0 }); mumPose(O, { pos: [1.7, 0, -2.4], ry: 0.7 }); procBase(O); }, { grade: 'warm', dof: 0.25, shakeAt: [[26.5, 0.04]] });
shot(27.3, 29.4, 'yard', { p0: [3.8, 2.5, 2.2], p1: [3.4, 2.5, 1.4], l0: [1.9, 2.2, -2.4], l1: [1.8, 2.2, -2.4], fov: 36, ease: 'io' }, (lt, O) => { yardBase(O, { lid: 0 }); mumPose(O, { pos: [1.9, 0, -2.4], ry: 0.25, headY: 0.0, headX: 0.22, expr: 'calm', arms: [[-0.15, 0, 0.18, 0.45], [-0.5, 0, 1.0, 0.7]] }); procBase(O); }, { grade: 'warm', dof: 0.35 });
let CLK = 0;

// ===== DAY 7: raining rice =====
function riceBase(O) { const Y = S.yard; yardBase(O, { lid: 0 }); const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  Y.rainG.visible = true; Y.rainD.forEach((d, i) => { const y = 14 - ((14 - d.y + (O - 29.4) * d.sp * 3 + 100) % 14); e.set(d.rot + O * 3, d.rot * 2, d.p); q.setFromEuler(e); m.compose(V([d.x, y, d.z]), q, V([1, 1, 1])); Y.rainG.setMatrixAt(i, m); }); Y.rainG.instanceMatrix.needsUpdate = true;
  const h = 0.95 * eOut(seg(O, 29.6, 33.6)); Y.ricePile.visible = true; Y.ricePile.position.set(0, -0.5 + h, 1.0); mumPose(O, { pos: [1.7, h * 0.6, -2.4], ry: 0.7 });
  return h; }
function crowdRice(O, h, n = 6) { const Y = S.yard; const pos = [[-4.2, 0.4, 0.5], [-2.6, 1.8, 0.2], [3.9, 1.0, -0.2], [5.4, 2.2, 0.6], [-5.6, 2.6, 0.2], [2.2, 3.0, 0.5], [-1.0, 3.4, 0.5], [4.6, 3.6, 0.3]];
  for (let i = 0; i < n; i++) { const P = Y.crowd[i]; P.root.visible = true; P.umb.visible = true; P.root.position.set(pos[i][0] + 0.25 * Math.sin(O * 2 + i), h * 0.7, pos[i][1] + (i % 2 ? 1 : 0)); P.root.rotation.y = pos[i][0] < 0 ? 0.5 : -0.5; pose(P, { ...idle(O, i), bob: 0.04 * Math.abs(Math.sin(O * 6 + i)), headX: -0.4, arms: [[-0.4, 0, 0.2, 0.5], [-2.9 + 0.05 * Math.sin(O * 9 + i), 0, -0.2, 0.15]] }); P.face('laugh', O); } }
shot(29.4, 30.7, 'yard', { p0: [0.4, 3.0, 10.4], p1: [0.5, 3.4, 9.2], l0: [0.4, 2.4, 0.0], l1: [0.4, 2.6, 0.0], fov: 52, ease: 'out', live: 1.2 }, (lt, O) => { const h = riceBase(O); crowdRice(O, h, 6); const ant = seg(O, 29.25, 29.42), pop = seg(O, 29.42, 29.8);
  heroPose(O, 0.7, 1.9, 0.1, { bob: -0.1 * ant + 0.08 * Math.sin(pop * Math.PI), headX: -0.45 * pop, spineX: 0.12 * ant - 0.2 * pop, arms: [[-0.4 - 1.2 * pop, 0, 0.3 + 0.7 * pop, 0.5], [-0.4 - 1.2 * pop, 0, -0.3 - 0.7 * pop, 0.5]] }, 'shock', { y: h * 0.7 }); }, { grade: 'rice', flash: 29.4, shakeAt: [[29.42, 0.07]], bloom: 0.1 });
shot(30.7, 33.2, 'yard', { p0: [1.6, 3.0, 5.2], p1: [1.3, 3.0, 4.4], l0: [0.7, 2.85, 1.9], l1: [0.7, 2.85, 1.9], fov: 38, ease: 'io' }, (lt, O) => { const h = riceBase(O); crowdRice(O, h, 3); const tk = talking('hero', O);
  heroPose(O, 0.7, 1.9, 0.1, { ...idle(O), bob: 0.0, headX: -0.5 + 0.05 * Math.sin(O * 3) , headY: 0.1 * Math.sin(O * 1.2), arms: [[-1.6, 0, 0.9, 0.6], [-1.6, 0, -0.9, 0.6]] }, tk ? 'shock' : 'laugh', { y: h * 0.7 }); }, { grade: 'rice', dof: 0.3 });
shot(33.2, 34.2, 'yard', { p0: [0.2, 3.4, 11.0], p1: [-0.2, 3.9, 12.2], l0: [0.4, 1.9, 0.0], l1: [0.4, 1.9, 0.0], fov: 52, ease: 'lin' }, (lt, O) => { const h = riceBase(O); crowdRice(O, h, 6); heroPose(O, 0.7, 1.9, 0.1, { ...idle(O), headX: -0.3, arms: [[-1.4, 0, 0.7, 0.6], [-1.4, 0, -0.7, 0.6]] }, 'laugh', { y: h * 0.7 }); }, { grade: 'rice' });

// ===== DAY 8: astronauts =====
const CAPX = 2.4, CAPZ = -0.4;
function capBase(O) { const Y = S.yard; yardBase(O, { lid: 0, noCloud: true }); mumPose(O, { pos: [1.2, 0, -2.5], ry: 0.7 }); const land = 35.1; const k = eIn(seg(O, 34.2, land)); const y = lerp(15, 0, k) + (O > land ? 0.12 * Math.exp(-(O - land) * 8) * Math.sin((O - land) * 30) : 0);
  Y.cap.visible = true; Y.cap.position.set(CAPX + 0.8 * Math.sin(O * 1.1) * (1 - k), y, CAPZ); Y.cap.rotation.z = 0.12 * Math.sin(O * 1.7) * (1 - k);
  const open = eOut(seg(O, 35.25, 35.6)); Y.hatch.rotation.y = -1.6 * open;
  Y.chute.visible = O < 36.0; if (Y.chute.visible) { const col = eIO(seg(O, land, 35.7)); Y.chute.position.set(Y.cap.position.x + 3.2 * col, y * (1 - col) + 0.0 - 0.0, CAPZ - 1.6 * col); Y.chute.scale.set(1 + 0.4 * col, 1 - 0.8 * col, 1 + 0.4 * col); Y.chute.rotation.z = 0.1 * Math.sin(O * 1.7) * (1 - col); }
  if (O > land) burst(Y.deb, O, land, V([CAPX, 0.1, CAPZ + 1.2]), 2.6, 1.8);
  return y; }
function astroPose(O, i, o = {}) { const Y = S.yard, A = Y.astro[i]; const out = eOut(seg(O, 35.55 + i * 0.12, 36.0)); A.root.visible = O >= 35.5 + i * 0.1; A.root.position.set(lerp(CAPX - 0.1, o.x ?? (0.9 + i * 1.9), out), 0, lerp(CAPZ + 0.9, o.z ?? (0.9 - i * 0.3), out)); A.root.rotation.y = lerp(0, o.ry ?? (0.25 - 0.5 * i), out);
  const rm = seg(O, 35.75 + i * 0.1, 35.8 + i * 0.1); A.helmet.visible = rm < 1; A.helmet.scale.setScalar(1 + 0.25 * Math.sin(Math.min(1, rm * 1) * Math.PI) * 0 + 0.0); const tk = i === 0 && talking('astronaut', O);
  const sn = eOut(seg(O, 35.9 + i * 0.15, 36.4 + i * 0.15)); pose(A, { ...idle(O, i), bob: 0.05 * sn * Math.abs(Math.sin(O * 2)) , headX: -0.35 * sn, spineX: -0.06 * sn, arms: [[-0.4 - 1.0 * sn, 0, 0.3, 0.6 + 0.9 * sn], [-0.3 - 0.9 * sn, 0, -0.3, 0.6 + 0.9 * sn]], ...(O < 36.0 ? walk(O, 8, 0.6) : {}) }); A.face(tk ? 'calm' : (sn > 0.3 ? 'sniff' : 'shock'), O, tk); }
shot(34.2, 35.1, 'yard', { p0: [0.6, 1.2, 8.2], p1: [0.9, 1.4, 7.4], l0: [2.2, 11.0, -0.6], l1: [2.4, 2.4, -0.6], fov: 58, ease: 'in', live: 0.8 }, (lt, O) => { capBase(O); const ant = seg(O, 34.05, 34.22), pop = seg(O, 34.22, 34.6); heroPose(O, -0.1, 1.9, 0.2, { bob: -0.1 * ant + 0.08 * Math.sin(pop * Math.PI), headX: -0.5 * pop, spineX: 0.12 * ant - 0.25 * pop, arms: [[-0.4 - 1.1 * pop, 0, 0.3 + 0.7 * pop, 0.5], [-0.4 - 1.1 * pop, 0, -0.3 - 0.7 * pop, 0.5]] }, 'shock'); }, { grade: 'warm', flash: 34.2, shakeAt: [[34.22, 0.07], [35.1, 0.09]] });
shot(35.1, 36.0, 'yard', { p0: [-0.8, 1.9, 7.6], p1: [0.2, 1.9, 6.4], l0: [1.6, 1.7, -0.2], l1: [1.6, 1.7, -0.2], fov: 48, ease: 'lin' }, (lt, O) => { capBase(O); heroPose(O, -1.2, 1.4, 0.4, { ...idle(O), headY: 0.4, arms: [[0, 0, 0.14, 0.3], [-0.3, 0, -0.14, 0.4]] }, 'shock'); astroPose(O, 0); astroPose(O, 1); }, { grade: 'warm', shakeAt: [[35.1, 0.09]] });
shot(36.0, 39.5, 'yard', { p0: [0.2, 2.35, 4.6], p1: [0.5, 2.3, 3.7], l0: [0.9, 2.2, 0.9], l1: [1.0, 2.2, 0.9], fov: 34, ease: 'io' }, (lt, O) => { capBase(O); astroPose(O, 0, { x: 0.9, z: 0.9, ry: 0.2 }); astroPose(O, 1, { x: 2.6, z: 0.2, ry: -0.5 }); S.yard.hero.root.visible = false; }, { grade: 'warm', dof: 0.3 });

// ===== SILENCE + DAY 9 =====
const D9 = 40.35;
function cosK(O) { return eOut(seg(O, D9, D9 + 0.9)); }
function moonSet(O) { const Y = S.yard, m = Y.moon; const k = seg(O, D9 + 0.6, D9 + 2.6); if (O < D9 + 0.6) { m.visible = false; return; } m.visible = true; const e = eIO(k); m.position.set(lerp(-3, 0.4, e), lerp(14, 1.18, eIn(k)), lerp(-6, -2.9, e)); const flat = eIO(seg(O, D9 + 1.5, D9 + 2.5)); const bn = O > D9 + 2.6 ? 0.05 * Math.exp(-(O - D9 - 2.6) * 6) * Math.sin((O - D9 - 2.6) * 25) : 0; const r = lerp(1.6, 0.8, flat); m.scale.set(r, lerp(1.6, 0.13, flat) + bn, r); m.rotation.y = O * 0.4; }
function d9Base(O, o = {}) { const Y = S.yard; yardBase(O, { lid: o.lid ?? 1, cos: cosK(O), steam: o.steam ?? 0.5 }); moonSet(O); }
shot(39.5, 40.35, 'yard', { p0: [5.2, 2.5, 4.6], p1: [4.0, 2.6, 2.6], l0: [3.2, 2.0, -1.9], l1: [3.2, 2.2, -1.9], fov: 40, ease: 'io' }, (lt, O) => { const lk = seg(O, 39.8, 40.3); yardBase(O, { lid: lk > 0 ? 0.001 + lk : 0, steam: 0.3 + 1.3 * lk }); if (lk <= 0) S.yard.lid.position.set(0, 1.58 * 1.34 / 1.34, 0);
  mumPose(O, { pos: [1.9, 0, -2.3], ry: 0.65, arms: [[-0.15, 0, 0.18, 0.45], [-0.8 - 0.5 * lk, 0, 1.0, 0.7 - 0.3 * lk]], headY: -0.15, expr: lk > 0.2 ? 'smirk' : 'calm' }); }, { grade: 'quiet', dof: 0.3 });
shot(40.35, 41.5, 'yard', { p0: [1.3, 1.0, 4.6], p1: [1.8, 1.4, 3.6], l0: [2.4, 5.5, -2.0], l1: [2.8, 6.2, -2.0], fov: 54, ease: 'out', live: 1.2 }, (lt, O) => { d9Base(O); mumPose(O, { pos: [1.9, 0, -2.3], ry: 0.65, headX: -0.3, expr: 'shock' }); const ant = seg(O, 40.2, 40.37), pop = seg(O, 40.37, 40.8);
  heroPose(O, 0.5, 1.2, 0.2, { bob: -0.1 * ant + 0.1 * Math.sin(pop * Math.PI), headX: -0.5 * pop, spineX: 0.12 * ant - 0.25 * pop, arms: [[-0.4 - 1.2 * pop, 0, 0.3 + 0.7 * pop, 0.5], [-0.4 - 1.2 * pop, 0, -0.3 - 0.7 * pop, 0.5]] }, 'shock'); }, { grade: 'space', flash: 40.36, fa: [0.95, 0.45, 0.15], shakeAt: [[40.37, 0.08]], bloom: 0.2 });
shot(41.5, 43.0, 'yard', { p0: [-1.5, 3.2, 11.0], p1: [0.8, 4.0, 9.0], l0: [2.4, 4.2, -2.0], l1: [2.6, 4.6, -2.0], fov: 50, ease: 'io', live: 1.5 }, (lt, O) => { d9Base(O); mumPose(O, { pos: [1.9, 0, -2.3], ry: 0.65, headX: -0.15, expr: 'calm' }); heroPose(O, -0.3, 0.9, 0.35, { ...idle(O), headX: -0.45, arms: [[-1.5, 0, 0.6, 0.5], [-1.5, 0, -0.6, 0.5]] }, 'shock'); }, { grade: 'space', bloom: 0.2 });
shot(43.0, 44.8, 'yard', { p0: [0.2, 2.5, 2.4], p1: [0.5, 2.45, 1.7], l0: [1.9, 2.25, -2.3], l1: [1.9, 2.25, -2.3], fov: 36, ease: 'io' }, (lt, O) => { d9Base(O); mumPose(O, { pos: [1.9, 0, -2.3], ry: 0.2, headY: 0.0, headX: 0.12, expr: 'calm', arms: [[-0.15, 0, 0.18, 0.45], [-0.4, 0, 0.9, 0.9]] }); }, { grade: 'space', dof: 0.35, bloom: 0.18 });
// ===== the empty pot: Mum hands it over, he checks, nothing left =====
const handsMid = (P, both = true) => { P.root.updateMatrixWorld(true); const a = P.arms[0].el.localToWorld(V([0, -0.52, 0.04])), b = P.arms[1].el.localToWorld(V([0, -0.52, 0.04])); return both ? a.add(b).multiplyScalar(0.5) : b; };
const HX = -0.25, HZ = -0.4;
function lastBase(O, o = {}) { const Y = S.yard; d9Base(O, { lid: 1, steam: 0.3 }); Y.mumSpoon.visible = false; Y.pot2.visible = true; Y.pot2.scale.setScalar(1.0); Y.pot2.grain.visible = false; Y.pot2.spoon.visible = false; Y.pot2.rotation.set(0, 0, 0);
  const k = eIO(seg(O, 45.2, 46.3));
  const mumArms = o.mumArms || [[-1.15 - 0.1 * k, 0, -0.18, 1.1], [-1.15 - 0.1 * k, 0, 0.18, 1.1]];
  mumPose(O, { pos: [1.35, 0, -1.0], ry: -0.75, headY: 0.2, expr: o.mumExpr || 'calm', arms: mumArms });
  const hx = o.hx ?? HX, hz = o.hz ?? HZ; const hp = o.heroPose;
  heroPose(O, hx, hz, o.hry ?? 0.7, hp(k), o.expr || 'worried');
  return k; }
const HOLD = (k) => ({ ...{ bob: 0, spineX: 0.03 }, arms: [[-1.2, 0, -0.22, 1.15], [-1.2, 0, 0.22, 1.15]], headX: 0.1 });
function potTo(P, off = V([0, -0.62, 0])) { S.yard.pot2.position.copy(handsMid(P).add(off)); }
shot(44.8, 46.4, 'yard', { p0: [0.3, 2.0, 5.4], p1: [0.5, 1.95, 4.4], l0: [0.45, 1.5, -0.7], l1: [0.45, 1.5, -0.7], fov: 42, ease: 'io' }, (lt, O) => {
  const Y = S.yard; const k = lastBase(O, { hry: 0.75, hx: -0.5, hz: -0.5, heroPose: (k) => ({ ...idle(O), arms: [[-1.2 * k - 0.2, 0, -0.2 * k + 0.2, 1.0 * k + 0.3], [-1.2 * k - 0.2, 0, 0.2 * k - 0.2, 1.0 * k + 0.3]], headX: 0.05 * k }), expr: 'smile' });
  const pm = handsMid(Y.mum).add(V([0, -0.62, 0])), ph = handsMid(Y.hero).add(V([0, -0.62, 0])); Y.pot2.position.copy(pm.lerp(ph, seg(k, 0.55, 1.0))); }, { grade: 'space', dof: 0.25, bloom: 0.15 });
shot(46.4, 47.4, 'yard', { p0: [0.55, 2.55, 3.4], p1: [0.35, 2.5, 2.9], l0: [-0.2, 1.9, -0.4], l1: [-0.2, 1.85, -0.4], fov: 38, ease: 'io' }, (lt, O) => {
  const Y = S.yard; const dn = eOut(seg(O, 46.5, 47.1)); lastBase(O, { hx: -0.25, hz: -0.4, hry: 0.1, heroPose: (k) => ({ bob: 0, spineX: 0.06 * dn, headX: 0.55 * dn, headY: 0.0, arms: [[-1.2, 0, -0.22, 1.15], [-1.2, 0, 0.22, 1.15]] }), expr: dn > 0.5 ? 'worried' : 'calm' }); potTo(Y.hero); Y.pot2.rotation.x = 0.5 * dn; Y.pot2.position.y += 0.12 * dn; }, { grade: 'space', dof: 0.25, bloom: 0.15 });
shot(47.4, 48.15, 'yard', { p0: [-0.2, 3.1, 1.3], p1: [-0.2, 3.0, 0.9], l0: [-0.25, 1.4, -0.15], l1: [-0.25, 1.3, -0.15], fov: 52, ease: 'lin', live: 0.6 }, (lt, O) => {
  const Y = S.yard; lastBase(O, { hx: -0.25, hz: -0.4, hry: 0.1, heroPose: (k) => ({ bob: 0, spineX: 0.1, headX: 0.6, arms: [[-1.2, 0, -0.22, 1.15], [-1.2, 0, 0.22, 1.15]] }), expr: 'worried' }); potTo(Y.hero); Y.pot2.rotation.x = 0.25; Y.pot2.spoon.visible = true; Y.pot2.spoon.rotation.y = 6 * (O - 47.4); Y.pot2.spoon.position.set(0.12 * Math.sin((O - 47.4) * 9), 0.1, 0.12 * Math.cos((O - 47.4) * 9)); Y.pot2.spoon.rotation.z = 1.35; }, { grade: 'space', dof: 0.2, bloom: 0.12, shakeAt: [[47.6, 0.01], [47.8, 0.01], [48.0, 0.01]] });
shot(48.15, 50.4, 'yard', { p0: [0.1, 2.85, 3.5], p1: [0.1, 2.8, 2.9], l0: [-0.25, 1.85, -0.4], l1: [-0.25, 1.85, -0.4], fov: 38, ease: 'io' }, (lt, O) => {
  const Y = S.yard; lastBase(O, { hx: -0.25, hz: -0.4, hry: 0.1, heroPose: (k) => ({ bob: 0, spineX: 0.02, headX: -0.02 + 0.05 * Math.sin(O * 1.3), headY: 0.1 * Math.sin(O * 1.1), arms: [[-1.2, 0, -0.22, 1.15], [-1.2, 0, 0.22, 1.15]] }), expr: 'worried' }); potTo(Y.hero, V([0, -1.0, 0.05])); Y.pot2.rotation.x = 0.4; }, { grade: 'space', dof: 0.3, bloom: 0.15 });
shot(50.4, 52.0, 'yard', { p0: [0.9, 2.4, 3.8], p1: [0.4, 2.35, 2.5], l0: [-0.25, 2.0, -0.4], l1: [-0.25, 2.0, -0.4], fov: 38, z0: 1.0, z1: 1.35, roll0: -4, roll1: 5, ease: 'lin' }, (lt, O) => {
  const Y = S.yard; const ant = seg(O, 50.45, 50.7), pop = seg(O, 50.7, 51.1); lastBase(O, { hx: -0.25, hz: -0.4, hry: 0.1, heroPose: (k) => ({ bob: -0.1 * ant + 0.1 * Math.sin(pop * Math.PI), spineX: 0.1 * ant - 0.2 * pop, headX: -0.3 * pop, arms: [[-1.2 - 1.45 * pop, 0, -0.22 - 0.3 * pop, 1.15 - 0.9 * pop], [-1.2 + 0.9 * pop, 0, 0.22 + 1.15 * pop, 1.15 - 0.85 * pop]] }), expr: 'shock' });
  const hp = handsMid(Y.hero, false); Y.pot2.position.copy(hp).add(V([0.65 * pop, -0.1 - 0.5 * (1 - pop), 0])); Y.pot2.position.x += 0.0; Y.pot2.rotation.z = Math.PI * 0.9 * pop; Y.pot2.grain.visible = pop > 0.5; const gt = Math.max(0, O - 50.95); Y.pot2.grain.position.set(0, 0.5 - 4.9 * gt * gt, 0); }, { grade: 'space', flash: 50.72, shakeAt: [[50.72, 0.08]], bloom: 0.2 });
shot(52.0, DUR, 'yard', { p0: [0.9, 2.4, 6.0], p1: [0.6, 3.2, 9.6], l0: [0.55, 1.9, -0.8], l1: [0.6, 2.4, -1.2], fov: 46, ease: 'io', live: 1.2 }, (lt, O) => {
  const Y = S.yard; lastBase(O, { hx: -0.15, hz: -0.4, hry: 0.2, mumExpr: 'calm', mumArms: [[-0.2, 0, 0.3, 0.5], [-0.2 - 0.9 * Math.sin(seg(O, 52.6, 53.1) * Math.PI), 0, -0.5 - 0.5 * Math.sin(seg(O, 52.6, 53.1) * Math.PI), 0.5]],
    heroPose: (k) => ({ ...idle(O), headX: 0.15, arms: [[-0.55, 0, 0.3, 1.0], [0, 0, -0.14, 0.2]] }), expr: 'worried' }); Y.pot2.position.copy(handsMid(Y.hero, false)); const h0 = (() => { Y.hero.root.updateMatrixWorld(true); return Y.hero.arms[0].el.localToWorld(V([0, -0.52, 0.04])); })(); Y.pot2.position.copy(h0).add(V([-0.0, -0.64, 0.0])); Y.pot2.rotation.z = 0.0; }, { grade: 'space', bloom: 0.18 });
function stepAt(T) { let s = null; for (const st of STEPS) if (T >= st.t) s = st; return s; }
function spaced(g, text, x, y, sp) { let cx = x; for (const ch of text) { g.fillText(ch, cx, y); cx += g.measureText(ch).width + sp; } return cx - x; }
const measC = mk(10, 10).getContext('2d');
function drawStat(T, sh) {
  const s = stepAt(T); if (!s || sh.hideStat) return; const g = ctx, x = 30; g.save();
  g.shadowColor = 'rgba(0,0,0,0.55)'; g.shadowBlur = 14; g.shadowOffsetY = 2; g.fillStyle = '#fff'; g.textAlign = 'left';
  g.font = '600 30px InterW'; spaced(g, 'JOLLOF COOKED', x, 288, 4.5);
  const dt = (T - s.t) * 30; const sc = dt < 5 ? (dt < 2.5 ? 1 + 0.06 * dt / 2.5 : 1.06 - 0.06 * (dt - 2.5) / 2.5) : 1;
  g.save(); g.translate(x, 412); g.scale(sc, sc); g.font = '500 128px Lora'; g.fillText(s.v.toLocaleString('en-US') + ' kg', 0, 0); g.restore();
  g.font = '600 27px InterW'; spaced(g, s.cmp, x, 462, 3.6);
  g.font = '600 25px InterW'; g.globalAlpha = 0.9; spaced(g, 'DAY ' + s.day, x, 502, 3.2); g.globalAlpha = 1;
  g.shadowBlur = 0; g.shadowOffsetY = 0; g.font = '700 25px InterW'; measC.font = '700 25px InterW'; const tw = spaced(measC, '×2 EVERY DAY', 0, 0, 2.5);
  rr(g, x, 520, tw + 26, 42, 3); g.fillStyle = '#E21E39'; g.fill(); g.fillStyle = '#fff'; spaced(g, '×2 EVERY DAY', x + 13, 550, 2.5); g.restore();
}
function drawTitle(O) {
  if (O < TITLE.t0 || O >= TITLE.t1) return;
  const a = eOut(clamp((O - TITLE.t0) / 0.45)) * clamp((TITLE.t1 - O) / 0.3), rise = (1 - eOut(clamp((O - TITLE.t0) / 0.7))) * 40;
  const g = ctx; g.save(); g.globalAlpha = a; g.textAlign = 'center';
  const wash = g.createLinearGradient(0, 120, 0, 900); wash.addColorStop(0, 'rgba(40,16,6,0.55)'); wash.addColorStop(1, 'rgba(40,16,6,0)'); g.fillStyle = wash; g.fillRect(0, 0, W, 900);
  g.translate(0, rise); g.shadowColor = 'rgba(0,0,0,0.45)'; g.shadowBlur = 30; g.shadowOffsetY = 4; g.fillStyle = '#fff';
  g.font = '500 96px Playfair'; g.fillText('What if your mum\u2019s', W / 2, 380);
  g.font = 'italic 500 236px Playfair'; g.fillStyle = '#fff1d6'; g.fillText('cooking', W / 2, 600);
  g.fillStyle = '#fff'; g.font = '500 96px Playfair'; g.fillText('doubled every day?', W / 2, 735);
  g.shadowBlur = 0; g.shadowOffsetY = 0; g.globalAlpha = a * 0.85; g.fillStyle = '#E21E39'; g.fillRect(W / 2 - 70, 780, 140, 6); g.restore();
}
function cueAt(O) { let best = null; for (const c of DIALOGUE) if (spanHit(c, O) && O >= c.words[0].t - 0.03) if (!best || c.spans[0][0] > best.spans[0][0]) best = c; return best; }
function strokeText(g, text, x, y, sw) { g.lineJoin = 'round'; g.miterLimit = 2; g.lineWidth = sw; g.strokeStyle = '#000'; g.strokeText(text, x, y); g.fillText(text, x, y); }
function captionChunk(c, O) { const chunks = []; let cur = []; c.words.forEach((w, i) => { cur.push(w); if (cur.length >= 3 || /[.!?…,]$/.test(w.w) || i === c.words.length - 1) { chunks.push(cur); cur = []; } });
  let chunk = chunks[0]; for (const ch of chunks) if (O >= ch[0].t - 0.03) chunk = ch; return chunk.filter(w => O >= w.t - 0.03).map(w => w.w.toUpperCase()).join(' '); }
function drawCaptions(O) {
  const c = cueAt(O); if (!c) return; const g = ctx; g.save(); g.textAlign = 'center'; g.fillStyle = '#fff';
  if (c.kind === 'shout') { const k = O - c.words[0].t; const s = k < 0.12 ? 0.6 + 4 * k : 1 + 0.04 * Math.sin(O * 50); const txt = c.words.map(w => w.w).join(' ');
    g.translate(W / 2 + Math.sin(O * 73) * 6, H * 0.7 + Math.cos(O * 61) * 5); g.scale(s, s); g.rotate(Math.sin(O * 9) * 0.03);
    let fs = 118; g.font = `800 ${fs}px Montserrat`; while (g.measureText(txt).width > W * 0.84 && fs > 60) { fs -= 4; g.font = `800 ${fs}px Montserrat`; }
    g.shadowColor = 'rgba(0,0,0,0.45)'; g.shadowBlur = 20; strokeText(g, txt, 0, 0, 16); g.restore(); return; }
  const shown = captionChunk(c, O); if (!shown) { g.restore(); return; }
  let fs = 78; g.font = `800 ${fs}px Montserrat`; while (g.measureText(shown).width > W * 0.82 && fs > 44) { fs -= 3; g.font = `800 ${fs}px Montserrat`; }
  const nm = { hero: null, mum: 'MUM', neighbour: 'NEIGHBOUR', fisherman: 'FISHERMAN', pilot: 'PILOT (PA)', astronaut: 'ASTRONAUT' }[c.speaker];
  strokeText(g, shown, W / 2, H * 0.72, 12); if (nm) { g.font = '700 30px InterW'; g.globalAlpha = 0.85; strokeText(g, nm, W / 2, H * 0.72 - fs - 8, 6); }
  g.restore();
}
function drawFlare(fx, fy, a = 1) {   // Frutiger lens flare
  const g = ctx; const sx = fx * W, sy = fy * H; g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = a;
  const s = g.createRadialGradient(sx, sy, 0, sx, sy, 260); s.addColorStop(0, 'rgba(255,255,240,0.9)'); s.addColorStop(0.2, 'rgba(255,250,210,0.35)'); s.addColorStop(1, 'rgba(255,240,200,0)'); g.fillStyle = s; g.fillRect(sx - 260, sy - 260, 520, 520);
  const cx = W / 2, cy = H / 2; [[0.35, 40, 'rgba(140,240,255,0.18)'], [0.7, 70, 'rgba(160,255,190,0.12)'], [1.25, 26, 'rgba(255,255,255,0.2)'], [1.6, 110, 'rgba(120,200,255,0.1)']].forEach(([k, r, c]) => {
    const x = sx + (cx - sx) * k * 2, y = sy + (cy - sy) * k * 2; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, c); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); });
  g.restore();
}
// ---------------------------------------------------------------- grading / compositing
const GRADES = {
  warm: { f: 'saturate(1.14) contrast(1.06) brightness(0.98)', tint: 'rgba(255,170,90,0.12)', mode: 'soft-light', vig: 0.3 },
  dawn: { f: 'saturate(1.16) contrast(1.07) brightness(0.92)', tint: 'rgba(255,150,70,0.16)', mode: 'soft-light', vig: 0.34 },
  street: { f: 'saturate(1.14) contrast(1.07) brightness(0.96)', tint: 'rgba(255,200,130,0.10)', mode: 'soft-light', vig: 0.28 },
  quiet: { f: 'saturate(0.92) contrast(1.06) brightness(0.9)', tint: 'rgba(110,150,210,0.14)', mode: 'soft-light', vig: 0.34 },
  lagoon: { f: 'saturate(1.2) contrast(1.07) brightness(0.96)', tint: 'rgba(120,220,255,0.08)', mode: 'soft-light', vig: 0.26 },
  sky: { f: 'saturate(1.12) contrast(1.08) brightness(0.84)', tint: 'rgba(255,190,120,0.10)', mode: 'soft-light', vig: 0.26 },
  cockpit: { f: 'saturate(1.1) contrast(1.07) brightness(0.96)', tint: 'rgba(255,170,100,0.12)', mode: 'soft-light', vig: 0.34 },
  rice: { f: 'saturate(1.1) contrast(1.06) brightness(0.88)', tint: 'rgba(255,220,170,0.10)', mode: 'soft-light', vig: 0.3 },
  space: { f: 'saturate(1.12) contrast(1.06) brightness(0.9)', tint: 'rgba(110,70,230,0.14)', mode: 'screen', vig: 0.4 },
};
function setCam(sh, T, O) {
  const c = sh.cam; const lt = clamp((T - sh.t0) / (sh.t1 - sh.t0)); const e = EASE[c.ease || 'out'](lt);
  const p = c.pf ? c.pf(O).clone() : V(c.p0); if (c.p1) p.lerp(V(c.p1), e); const l = c.lf ? c.lf(O).clone() : V(c.l0); if (c.l1) l.lerp(V(c.l1), e);
  cam.setViewOffset(W, H, 0, -H * (c.shift ?? 0.07), W, H); cam.position.copy(p); cam.up.set(0, 1, 0); cam.lookAt(l);
  const z = lerp(c.z0 ?? 1, c.z1 ?? 1.06, e); const roll = lerp(c.roll0 ?? 0, c.roll1 ?? 0, e);
  cam.fov = 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(c.fov) / 2) / z) * 180 / Math.PI; cam.rotateZ(THREE.MathUtils.degToRad(roll));
  const live = sh.live ?? 1;   // gentle camera life on the real clock
  cam.rotateY((Math.sin(O * 0.9) * 0.018 + Math.sin(O * 2.3) * 0.003) * live); cam.rotateX((Math.sin(O * 0.7 + 1.3) * 0.012 + Math.sin(O * 3.1) * 0.0025) * live); cam.rotateZ(Math.sin(O * 0.55) * 0.01 * live);
  let sk = 0; for (const [t0, amt] of sh.shakeAt || []) sk += shake(O, t0, amt); cam.rotateZ(Math.sin(O * 61) * sk); cam.rotateX(Math.sin(O * 47) * sk * 0.6); cam.rotateY(Math.cos(O * 53) * sk * 0.6);
  cam.fov /= 1 + 0.03 * live * (0.5 + 0.5 * Math.sin(O * 1.1)); cam.updateProjectionMatrix();
  return lt;
}
const HEROES = [S.yard.hero, S.street.hero, S.lagoon.hero];
export function renderFrame(O) {
  const sh = shots.find(s => O >= s.t0 && O < s.t1) || shots[shots.length - 1];
  const lt = clamp((O - sh.t0) / (sh.t1 - sh.t0));
  const nb = typeof sh.mblur === 'function' ? sh.mblur(O) : (sh.mblur || 1);
  for (let k = nb - 1; k >= 0; k--) {       // motion blur: average sub-frames across the shutter on fast shots
    const Ok = Math.max(sh.t0, O - (k / nb) * 0.6 / 30); const ltk = clamp((Ok - sh.t0) / (sh.t1 - sh.t0));
    sh.setup(ltk, Ok, Ok); setCam(sh, Ok, Ok);
    HEROES.forEach(P => P.strings.forEach((s, i) => s.rotation.set(0.2 * Math.sin(Ok * 9 + i), 0, 0.12 * Math.sin(Ok * 7 + i))));
    { const sc = DIALOGUE.find(c => c.kind === 'shout' && c.speaker === 'hero' && spanHit(c, Ok)); if (sc) { const kk = clamp((Ok - sc.spans[0][0]) / 0.12) * clamp((sc.spans[0][1] + 0.03 - Ok) / 0.1); HEROES.forEach(P => { [P.mLine, P.mGrin, P.teeth, P.cL, P.cR].forEach(m => m.visible = false); P.mO.visible = true; P.mO.scale.set(1.25, 0.5 + 1.1 * kk + 0.12 * Math.sin(Ok * 30), 1); P.brows.forEach(b => { b.position.y = 0.49 + 0.07 * kk; }); P.neck.rotation.x -= 0.16 * kk; }); } }
    renderer.render(S[sh.scene].sc, cam);
    if (nb > 1) { actx.globalAlpha = 1 / (nb - k); actx.drawImage(glc, 0, 0, W, H); actx.globalAlpha = 1; }
  }
  const SRC = nb > 1 ? accC : glc;
  const gr = GRADES[sh.grade] || GRADES.room;
  sctx.globalCompositeOperation = 'source-over'; sctx.filter = 'none';
  if (sh.dof) {
    smctx.filter = 'blur(2.5px)'; smctx.drawImage(SRC, 0, 0, 270, 480); smctx.filter = 'none'; sctx.drawImage(smallC, 0, 0, W, H);
    shctx.globalCompositeOperation = 'source-over'; shctx.clearRect(0, 0, W, H); shctx.drawImage(SRC, 0, 0, W, H); shctx.globalCompositeOperation = 'destination-in';
    const rg = shctx.createRadialGradient(W / 2, H * 0.47, W * 0.2 * (1 - sh.dof * 0.3), W / 2, H * 0.47, W * 0.85 * (1 - sh.dof * 0.3)); rg.addColorStop(0, 'rgba(0,0,0,1)'); rg.addColorStop(1, 'rgba(0,0,0,0)'); shctx.fillStyle = rg; shctx.fillRect(0, 0, W, H);
    sctx.drawImage(sharpC, 0, 0, W, H);
  } else sctx.drawImage(SRC, 0, 0, W, H);
  const bloom = sh.bloom ?? 0.1;    // a touch of glow everywhere (Frutiger sheen)
  smctx.filter = 'blur(6px) brightness(1.25)'; smctx.drawImage(sceneC, 0, 0, 270, 480); smctx.filter = 'none';
  sctx.globalCompositeOperation = 'lighter'; sctx.globalAlpha = bloom; sctx.drawImage(smallC, 0, 0, W, H); sctx.globalAlpha = 1; sctx.globalCompositeOperation = 'source-over';
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.filter = gr.f; ctx.drawImage(sceneC, 0, 0, W, H); ctx.filter = 'none';
  if (gr.tint) { ctx.globalCompositeOperation = gr.mode; ctx.fillStyle = gr.tint; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over'; }
  const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, `rgba(0,0,0,${gr.vig})`); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  if (sh.flare) drawFlare(sh.flare[0], sh.flare[1], 0.9);
  if (sh.dark) { const d = sh.dark(O); if (d > 0) { ctx.fillStyle = `rgba(4,6,18,${d})`; ctx.fillRect(0, 0, W, H); } }
    if (!sh.hideStat && O >= STEPS[0].t) { ctx.save(); ctx.translate(W * 0.2, 400); ctx.scale(1, 0.62); const sg = ctx.createRadialGradient(0, 0, 0, 0, 0, W * 0.62); sg.addColorStop(0, 'rgba(0,0,0,0.34)'); sg.addColorStop(0.55, 'rgba(0,0,0,0.16)'); sg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = sg; ctx.fillRect(-W, -W, W * 3, W * 2); ctx.restore(); }
  drawTitle(O); drawStat(O, sh); drawCaptions(O);
  for (const s of shots) if (s.flash !== undefined) { const d = Math.round((O - s.flash) * 30); if (d >= 0 && d < 3) { ctx.fillStyle = `rgba(255,255,255,${(s.fa || [0.95, 0.6, 0.25])[d]})`; ctx.fillRect(0, 0, W, H); } }
  return out.toDataURL('image/jpeg', RS > 1 ? 0.95 : 0.94);
}
export const TIMELINE = { STEPS, DUR, cuts: shots.map(s => s.t0), flashes: shots.filter(s => s.flash !== undefined).map(s => s.flash) };
window.captionText = (O) => { const c = cueAt(O); if (!c) return ''; return c.kind === 'shout' ? c.words.map(w => w.w).join(' ') : captionChunk(c, O); };
window.hookText = () => '';
window.S = S; window.cam = cam; window.shots = shots; window.renderFrame = renderFrame; window.TIMELINE = TIMELINE;
fetch('dialogue.json').then(r => r.json()).then(d => { DIALOGUE = d; }).catch(() => { DIALOGUE = []; })
  .then(() => Promise.all(['800 78px Montserrat', '500 96px Playfair', 'italic 500 236px Playfair', '500 128px Lora', '600 30px InterW', '700 30px InterW'].map(f => document.fonts.load(f)))).then(() => { window.READY = true; });