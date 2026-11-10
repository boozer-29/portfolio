// "What if your yams doubled every day?" — Polygram series, episode renderer (three.js, rig v2, IBL lighting, Frutiger Aero look)
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Reflector } from 'three/addons/objects/Reflector.js';

const W = 1080, H = 1920; export const DUR = 56.6;
let DIALOGUE = [];
function spanHit(c, O) { for (const [a, b] of c.spans) if (O >= a - 0.02 && O < b + 0.03) return true; return false; }

// ---------------------------------------------------------------- story steps (one doubling each)
const STEPS = [
  { day: 1, t: 3.0, v: 1, cmp: 'FITS IN NORMAL JEANS' },
  { day: 2, t: 7.0, v: 2, cmp: 'BUTTON: MISSING IN ACTION' },
  { day: 3, t: 10.2, v: 4, cmp: 'TAKES 2 BUS SEATS' },
  { day: 4, t: 17.6, v: 8, cmp: 'SEESAW CHAMPION' },
  { day: 5, t: 23.8, v: 16, cmp: 'LISTED ON THE MAP' },
  { day: 6, t: 30.8, v: 32, cmp: 'HAS A SKI RESORT' },
  { day: 7, t: 36.4, v: 64, cmp: 'CAUSES ECLIPSES' },
  { day: 8, t: 40.8, v: 128, cmp: 'ILLEGALLY PARKED IN SPACE' },
  { day: 9, t: 45.8, v: 256, cmp: 'NEEDS A BIGGER CHAIR' },
];
const MONTAGE = [27.2, 30.8];
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
  if (o.helmet) { const hm = new THREE.Mesh(new THREE.SphereGeometry(0.6, 32, 24), new THREE.MeshStandardMaterial({ color: 0xcfeaff, transparent: true, opacity: 0.22, roughness: 0.02, metalness: 0.3, envMapIntensity: 2.5, depthWrite: false })); hm.position.y = 0.32; head.add(hm); head.add(rbox(0.06, 0.06, 0.34, mat(0x222222), 0.28, 0.12, 0.2)); }
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
    case 'yawn': P.mO.visible = true; P.mO.scale.set(1.1, 1.5, 1); break;
    case 'confused': P.mLine.visible = true; corners(0, 0.15); P.brows[0].rotation.z = 0.3; P.brows[1].position.y = 0.55; P.pupils.forEach(p => p.position.x += 0.03); break;
  }
  if (talk) {                                   // mouth only moves while this character is audible
    const open = Math.sin(O * 24) > -0.2; [P.mLine, P.mGrin, P.teeth, P.cL, P.cR].forEach(m => { if (open) m.visible = false; });
    P.mO.visible = open; P.mO.scale.set(expr === 'shock' || expr === 'grit' ? 1.15 : 0.9, (expr === 'shock' ? 0.9 : 0.55) + 0.3 * Math.abs(Math.sin(O * 13)), 1);
  }
  const dart = Math.sin(O * 2.3) > 0.75 ? 0.035 : Math.sin(O * 1.7) < -0.85 ? -0.03 : 0; P.pupils.forEach(p => p.position.x += dart);
  const blink = expr === 'yawn' || ((O * 0.41 + 0.13) % 1) < 0.045;          // natural blink every ~2.4 s
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

// ---------------------------------------------------------------- SCENES
const S = {};
const DX = 2.6, DWID = 1.4;
{ // ---- bedroom (Frutiger morning) + doorway + hallway
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0xf4e6d0);
  lightRig(sc, { sky: 0xfff3e6, ground: 0x9a7a62, hemi: 0.36, keyC: 0xffe6c2, key: 1.55, keyPos: [-7, 8, 6], target: [1, 0, 2], rim: 0.4, rimC: 0xa8d8ff, rimPos: [6, 3, 7], env: 0.38 });
  sc.add(rbox(16, 0.2, 14, mat(0xdcae7e, { roughness: 0.45 }), 1, -0.1, 2));
  for (let x = -6; x < 9; x += 0.9) sc.add(rbox(0.025, 0.012, 14, mat(0xb98a5c), x, 0.006, 2));
  const wallM = mat(0xcdeceb, { roughness: 0.85 });
  sc.add(rbox(4.9, 4.2, 0.25, wallM, -0.55, 2.1, 0)); sc.add(rbox(2.2, 4.2, 0.25, wallM, DX + DWID / 2 + 1.1, 2.1, 0)); sc.add(rbox(DWID, 1.6, 0.25, wallM, DX, 3.4, 0));
  sc.add(rbox(0.25, 4.2, 9, mat(0xe3f4ef, { roughness: 0.85 }), -3.0, 2.1, 4.4));
  sc.add(rbox(0.25, 4.2, 9, mat(0xe3f4ef, { roughness: 0.85 }), 5.6, 2.1, 4.4));
  // window with a Frutiger sky
  const skyT = canvasTex(512, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#3e9bea'); gr.addColorStop(0.6, '#a6e2ff'); gr.addColorStop(1, '#e8fbff'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = '#7fdc5a'; g.beginPath(); g.ellipse(170, 560, 330, 170, 0, 0, 7); g.fill(); g.fillStyle = '#62c94a'; g.beginPath(); g.ellipse(430, 590, 300, 170, 0, 0, 7); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.95)'; [[120, 140, 60], [180, 130, 70], [250, 145, 55], [380, 90, 45], [430, 85, 50]].forEach(([x, y, r]) => { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }); });
  const win = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 1.8), new THREE.MeshBasicMaterial({ map: skyT, toneMapped: false })); win.position.set(-2.86, 2.3, 3.3); win.rotation.y = Math.PI / 2; sc.add(win);
  const fr = mat(0xffffff, { roughness: 0.3 }); sc.add(rbox(0.12, 2.0, 0.1, fr, -2.84, 2.3, 2.27)); sc.add(rbox(0.12, 2.0, 0.1, fr, -2.84, 2.3, 4.33)); sc.add(rbox(0.12, 0.1, 2.16, fr, -2.84, 3.25, 3.3)); sc.add(rbox(0.12, 0.1, 2.16, fr, -2.84, 1.35, 3.3)); sc.add(rbox(0.1, 1.9, 0.06, fr, -2.84, 2.3, 3.3));
  const winLight = new THREE.SpotLight(0xfff0d8, 18, 14, 0.7, 0.6, 1.2); winLight.position.set(-3.6, 3.2, 3.3); winLight.target.position.set(0.5, 0, 2.6); winLight.castShadow = true; winLight.shadow.mapSize.set(1024, 1024); sc.add(winLight, winLight.target);
  // bed, rug, plant, shelf, lamp, poster
  sc.add(rbox(2.3, 0.45, 3.0, mat(0x8a5a3c, { roughness: 0.5 }), -1.7, 0.25, 5.4)); sc.add(rbox(2.2, 0.28, 2.9, mat(0xf7f7f7, { roughness: 0.8 }), -1.7, 0.6, 5.4));
  sc.add(rbox(2.25, 0.14, 1.9, mat(0x6fc7d9, { roughness: 0.6 }), -1.7, 0.8, 5.95)); sc.add(rbox(1.0, 0.24, 0.6, mat(0xffffff, { roughness: 0.9 }), -1.7, 0.86, 4.25));
  const rug = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 0.03, 48), mat(0x8fd8e6, { roughness: 0.9 })); rug.position.set(0.9, 0.015, 2.4); rug.receiveShadow = true; sc.add(rug);
  sc.add(new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.22, 0.5, 24), mat(0xffffff, { roughness: 0.2 })).translateX(4.8).translateY(0.25).translateZ(1.0));
  const leaf = mat(0x47c24a, { roughness: 0.25 }); [[4.8, 0.85, 1.0, 0.32], [4.6, 1.15, 1.1, 0.24], [5.0, 1.1, 0.9, 0.26], [4.8, 1.4, 1.0, 0.2]].forEach(([x, y, z, r]) => sc.add(ball(r, leaf, x, y, z, undefined, 20)));
  sc.add(rbox(1.4, 0.08, 0.4, mat(0xffffff, { roughness: 0.3 }), -1.2, 2.6, 0.32)); sc.add(ball(0.13, mat(0x5ad1e6, { roughness: 0.05, metalness: 0.2 }), -1.6, 2.78, 0.32)); sc.add(rbox(0.22, 0.3, 0.2, mat(0x9be56b, { roughness: 0.2 }), -1.0, 2.79, 0.32));
  const posterT = canvasTex(256, 360, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#29a9e0'); gr.addColorStop(1, '#b4f0ff'); g.fillStyle = gr; g.fillRect(0, 0, w, h); for (let i = 0; i < 9; i++) { g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = 4; g.beginPath(); g.arc(40 + (i * 61) % 200, 60 + (i * 97) % 280, 14 + (i % 4) * 9, 0, 7); g.stroke(); } g.fillStyle = '#fff'; g.font = 'bold 30px sans-serif'; g.fillText('AERO', 70, 330); });
  const poster = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.26), new THREE.MeshStandardMaterial({ map: posterT, roughness: 0.25 })); poster.position.set(-0.4, 2.0, 0.14); sc.add(poster);
  // full-length mirror on the partition (real reflection)
  sc.add(rbox(0.96, 2.06, 0.08, mat(0xffffff, { roughness: 0.25 }), 0.95, 1.12, 0.17));
  const mirror = new Reflector(new THREE.PlaneGeometry(0.82, 1.92), { textureWidth: 768 * RS, textureHeight: 1792 * RS, color: 0xd4e8ec }); mirror.position.set(0.95, 1.12, 0.215); sc.add(mirror);
  // doorway frame + hallway
  const frameM = mat(0x9a6a45, { roughness: 0.45 });
  const frameL = rbox(0.12, 2.6, 0.36, frameM, DX - DWID / 2 + 0.06, 1.3, 0), frameR = rbox(0.12, 2.6, 0.36, frameM, DX + DWID / 2 - 0.06, 1.3, 0), frameT = rbox(DWID, 0.12, 0.36, frameM, DX, 2.6, 0); sc.add(frameL, frameR, frameT);
  sc.add(rbox(8, 4.2, 0.25, mat(0xf3dfbe, { roughness: 0.85 }), DX, 2.1, -3.4)); const hl = new THREE.PointLight(0xffd9a0, 8, 8, 1.5); hl.position.set(DX, 2.8, -1.8); sc.add(hl);
  sc.add(rbox(1.0, 0.7, 0.05, mat(0x55c3e3, { roughness: 0.3 }), DX + 1.4, 1.9, -3.25));
  const hero = makeRig({ yams: true }); sc.add(hero.root);
  const stranger = makeRig({ hood: 0x23b5a4, hoodD: 0x178b7e, pants: 0xf2cf5b, pantsD: 0xd8b43f, skin: 0x8d5a3b, hair: 0x1a1210, hairStyle: 'long', noHood: true, shoe: 0xf7f7f7 }); sc.add(stranger.root);
  const deb = debrisPool(sc, 28, [0x4f6393, 0x4f6393, 0x9a6a45, 0xcdeceb]);
  const bub = bubbles(sc, 14, [-2.5, 5, 0.4, 3.8, 0.8, 6], 0.08, 0.22, 3);
  S.room = { sc, hero, stranger, frameL, frameR, frameT, deb, bub, mirror };
}
{ // ---- park (Frutiger Aero hills, bench, pigeons)
  const sc = new THREE.Scene(); sc.add(skyDome('#1f86e0', '#8fd6ff', '#f2fdff'));
  lightRig(sc, { sky: 0xdff4ff, ground: 0x6fb04a, hemi: 0.55, keyC: 0xfff2dc, key: 2.1, keyPos: [9, 14, 8], target: [2, 0, 0], rim: 0.6, rimC: 0xbfe8ff, rimPos: [-6, 4, -6], env: 0.42, R: 12 });
  const grass = mat(0x7bdc58, { roughness: 0.35 });
  sc.add(rbox(120, 0.2, 120, grass, 0, -0.1, -20));
  [[-26, -38, 16, 0x6fd14d], [8, -50, 22, 0x8fe36a], [36, -40, 18, 0x5cc542], [-6, -70, 30, 0x9be877]].forEach(([x, z, r, c]) => { const h = ball(r, mat(c, { roughness: 0.3 }), x, -r * 0.62, z, undefined, 48); h.castShadow = false; sc.add(h); });
  sc.add(rbox(60, 0.03, 2.2, mat(0xb5a57e, { roughness: 0.9 }), 0, 0.01, 1.0));
  const wood = mat(0xb4794a, { roughness: 0.45 }), iron = mat(0x2d3036, { roughness: 0.35, metalness: 0.6 });
  const bench = grp(2.2, 0, -0.2, sc); const planks = [0, 1, 2].map(i => rbox(2.1, 0.08, 0.17, wood, 0, 0.55, -0.2 + i * 0.2)); planks.forEach(p => bench.add(p));
  const back = [rbox(2.1, 0.14, 0.06, wood, 0, 0.95, -0.36), rbox(2.1, 0.14, 0.06, wood, 0, 1.18, -0.36)]; back.forEach(b => bench.add(b));
  const legsB = [[-0.9, 0.27, -0.2], [0.9, 0.27, -0.2], [-0.9, 0.27, 0.2], [0.9, 0.27, 0.2]].map(([x, y, z]) => { const l = rbox(0.08, 0.54, 0.08, iron, x, y, z); bench.add(l); return l; });
  const canopy = mat(0x52c947, { roughness: 0.22 }), trunk = mat(0x7a5232, { roughness: 0.6 });
  [[-5, -3], [7, -4], [-9, -9], [11, -10], [3, -12], [-2, -16]].forEach(([x, z], i) => { sc.add(rbox(0.32, 2.2, 0.32, trunk, x, 1.1, z)); sc.add(ball(1.3 + (i % 3) * 0.3, canopy, x, 2.9, z, undefined, 32)); });
  [[-18, 22, -60, 2.4], [14, 26, -70, 2.8], [34, 18, -55, 2], [-40, 24, -80, 3]].forEach(a => sc.add(cloud(...a)));
  const pigeons = [...Array(9)].map(() => { const p = makePigeon(); sc.add(p); return p; });
  const bigP = makePigeon(true); bigP.scale.setScalar(2.6); sc.add(bigP);
  const hero = makeRig({ yams: true }); sc.add(hero.root);
  const deb = debrisPool(sc, 18, [0xb4794a, 0xb4794a, 0x2d3036]);
  const bub = bubbles(sc, 22, [-8, 12, 0.5, 9, -10, 4], 0.25, 0.8, 7);
  S.park = { sc, hero, bench, planks, back, legsB, pigeons, bigP, deb, bub };
}
{ // ---- market street (glossy glass towers, stalls, crowd)
  const sc = new THREE.Scene(); sc.add(skyDome('#1c7fdb', '#93d9ff', '#effcff'));
  lightRig(sc, { sky: 0xe6f6ff, ground: 0x8a8578, hemi: 0.55, keyC: 0xfff0d8, key: 2.1, keyPos: [10, 16, 10], target: [0, 0, 0], rim: 0.6, rimC: 0xbfe8ff, rimPos: [-8, 5, -8], env: 0.5, R: 14 });
  sc.add(rbox(120, 0.2, 9, mat(0x59606e, { roughness: 0.35 }), 0, -0.1, 3.5)); sc.add(rbox(120, 0.22, 7, mat(0x9f9c92, { roughness: 0.8 }), 0, -0.09, -4.5));
  for (let x = -40; x < 40; x += 3.2) sc.add(rbox(1.5, 0.02, 0.16, mat(0xffffff, { roughness: 0.4 }), x, 0.01, 3.5));
  const glassT = canvasTex(256, 512, (g, w, h) => { g.fillStyle = '#7fd6ea'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 42) { g.fillStyle = 'rgba(255,255,255,0.55)'; g.fillRect(0, y, w, 3); } for (let x = 0; x < w; x += 64) { g.fillStyle = 'rgba(20,90,120,0.35)'; g.fillRect(x, 0, 3, h); } const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, 'rgba(255,255,255,0.35)'); gr.addColorStop(0.5, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  glassT.wrapS = glassT.wrapT = THREE.RepeatWrapping;
  const r = rnd(4);
  for (let x = -34; x < 34;) { const w = 5 + r() * 3, h = 10 + r() * 14; const t = glassT.clone(); t.needsUpdate = true; t.repeat.set(w / 5, h / 10);
    const m = new THREE.Mesh(rgeo(w, h, 6), new THREE.MeshStandardMaterial({ map: t, color: [0xbff4ff, 0xc8ffe6, 0xd8ecff][Math.floor(r() * 3)], roughness: 0.06, metalness: 0.35, envMapIntensity: 1.4 }));
    m.position.set(x + w / 2, h / 2, -12); m.castShadow = m.receiveShadow = true; sc.add(m); x += w + 0.6; }
  const stalls = []; const fruitC = [0xff8a1f, 0xe8343c, 0xffd23f, 0x7ed957, 0xb04ad9];
  const awnT = (a, b) => canvasTex(256, 64, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? a : b; g.fillRect(i * 32, 0, 32, h); } });
  [-7.5, -5, -2.6, 2.6, 5, 7.5].forEach((x, i) => { const s = grp(x, 0, -3.2, sc); s.add(rbox(1.8, 0.9, 1.0, mat(0xc98b5a, { roughness: 0.5 }), 0, 0.45, 0));
    for (let k = 0; k < 9; k++) s.add(ball(0.12, mat(fruitC[(i + k) % 5], { roughness: 0.25 }), -0.6 + (k % 5) * 0.3, 0.98 + Math.floor(k / 5) * 0.12, -0.2 + (k % 2) * 0.3, undefined, 16));
    s.add(rbox(0.06, 2.1, 0.06, mat(0xffffff), -0.85, 1.05, -0.45)); s.add(rbox(0.06, 2.1, 0.06, mat(0xffffff), 0.85, 1.05, -0.45));
    const aw = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.06, 1.3), new THREE.MeshStandardMaterial({ map: awnT(i % 2 ? '#2bc3d9' : '#7ed957', '#ffffff'), roughness: 0.4 })); aw.position.set(0, 2.15, 0.1); aw.rotation.x = 0.18; aw.castShadow = true; s.add(aw);
    stalls.push(s); });
  const scooter = grp(4.2, 0, 1.6, sc); scooter.add(rbox(1.2, 0.35, 0.45, mat(0x2bc3d9, { roughness: 0.15, metalness: 0.2 }), 0, 0.55, 0)); scooter.add(rbox(0.1, 0.8, 0.1, mat(0x333333), 0.5, 0.9, 0)); [-0.45, 0.45].forEach(x => { const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.12, 20), mat(0x1c1c22)); wh.rotation.x = Math.PI / 2; wh.position.set(x, 0.22, 0); scooter.add(wh); });
  const bus = grp(-9, 0, 4.6, sc); bus.add(rbox(7, 2.4, 2.4, mat(0xf4f7f2, { roughness: 0.2, metalness: 0.1 }), 0, 1.5, 0)); bus.add(rbox(6.6, 0.8, 2.42, mat(0x2f8fbf, { roughness: 0.05, metalness: 0.4 }), 0, 1.9, 0)); bus.add(rbox(7.02, 0.25, 2.42, mat(0x7ed957), 0, 0.7, 0));
  const npcCols = [[0x3e7cc9, 0x2d2d3a, 0xe9b48c, 0x3a2617], [0xf2c14e, 0x31406b, 0x8d5a3b, 0x111111], [0x48a868, 0x5b4636, 0xf0c7a0, 0xb8742a], [0x8d5ac9, 0x2b2b2b, 0x6b4128, 0x111111], [0xff8c5a, 0x3b5fa0, 0xe7b289, 0x5a3a22], [0x20a0a0, 0x444444, 0xc68e64, 0x222222], [0xeeeeee, 0x334455, 0xf1c8a4, 0xd9b26a]];
  const crowd = [...Array(12)].map((_, i) => { const c = npcCols[i % npcCols.length]; const p = makeRig({ hood: c[0], hoodD: c[0], pants: c[1], skin: c[2], hair: c[3], noHood: true, hairStyle: i % 3 === 1 ? 'long' : 'short' }); sc.add(p.root); return p; });
  const hero = makeRig({ yams: true }); sc.add(hero.root);
  const deb = debrisPool(sc, 30, fruitC);
  const bub = bubbles(sc, 20, [-12, 12, 1, 10, -8, 6], 0.25, 0.7, 11);
  S.market = { sc, hero, stalls, scooter, bus, crowd, deb, bub };
}
{ // ---- traffic jam (aerial)
  const sc = new THREE.Scene(); sc.add(skyDome('#1c7fdb', '#93d9ff', '#effcff'));
  lightRig(sc, { sky: 0xe6f6ff, ground: 0x8a8578, hemi: 0.62, keyC: 0xfff0d8, key: 2.2, keyPos: [12, 22, 8], target: [0, 0, 0], env: 0.55, R: 30 });
  sc.add(rbox(16, 0.2, 200, mat(0x575d6b, { roughness: 0.4 }), 0, -0.1, 0)); sc.add(rbox(60, 0.18, 200, mat(0x88c96a, { roughness: 0.5 }), 38, -0.12, 0)); sc.add(rbox(60, 0.18, 200, mat(0x88c96a, { roughness: 0.5 }), -38, -0.12, 0));
  for (let z = -90; z < 90; z += 4) [-4, 0, 4].forEach(x => sc.add(rbox(0.16, 0.02, 2, mat(x === 0 ? 0xf2c14e : 0xffffff), x, 0.01, z)));
  const carC = [0xe8343c, 0xffd23f, 0x2bc3d9, 0xf4f7f2, 0x7ed957, 0xff8a1f, 0x5a6cff, 0x222831];
  const cars = []; const r = rnd(21);
  for (const lane of [-6, -2, 2, 6]) for (let k = 0; k < 9; k++) { const side = lane < 0 ? -1 : 1; const z = side * (13 + k * 5.6 + r() * 1.2); const c = grp(lane, 0, z, sc);
    c.add(rbox(1.9, 0.7, 4.0, mat(carC[(k + lane + 9) % 8], { roughness: 0.15, metalness: 0.35 }), 0, 0.55, 0)); c.add(rbox(1.6, 0.6, 2.0, mat(0x2a4e6e, { roughness: 0.05, metalness: 0.5 }), 0, 1.15, side * 0.2));
    const bl = mat(0xff2a2a, { emissive: 0xff2020, emissiveIntensity: 2.2 }); c.add(rbox(0.4, 0.15, 0.06, bl, -0.6, 0.65, -side * 2.0)); c.add(rbox(0.4, 0.15, 0.06, bl, 0.6, 0.65, -side * 2.0)); cars.push(c); }
  [[-26, 0, -30], [24, 0, 20], [-30, 0, 40], [28, 0, -50]].forEach(([x, y, z], i) => { sc.add(rbox(8, 18 + i * 4, 8, mat(0xbff4ff, { roughness: 0.06, metalness: 0.35 }), x, 9 + i * 2, z)); });
  const hero = makeRig({ yams: true }); sc.add(hero.root);
  S.traffic = { sc, hero, cars };
}
{ // ---- glossy aero studio (montage)
  const sc = new THREE.Scene();
  const bgT = canvasTex(512, 1024, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h * 0.4, 20, w / 2, h * 0.45, h * 0.7); gr.addColorStop(0, '#b4ecfb'); gr.addColorStop(0.4, '#7fd6ee'); gr.addColorStop(1, '#1487bd'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 6; i++) { g.strokeStyle = `rgba(255,255,255,${0.25 + i * 0.05})`; g.lineWidth = 6; g.beginPath(); g.moveTo(-50, h * (0.6 + i * 0.05)); g.bezierCurveTo(w * 0.3, h * (0.5 + i * 0.06), w * 0.7, h * (0.75 + i * 0.03), w + 50, h * (0.55 + i * 0.05)); g.stroke(); } });
  sc.background = bgT;
  lightRig(sc, { sky: 0xffffff, ground: 0x9fe6ff, hemi: 0.6, keyC: 0xffffff, key: 2.0, keyPos: [4, 8, 6], env: 0.6, R: 6, rim: 1.4, rimC: 0x7fe0ff, rimPos: [-5, 3, -4] });
  const floor = rbox(30, 0.2, 30, mat(0xa9dcee, { roughness: 0.1, metalness: 0.25 }), 0, -0.1, 0); sc.add(floor);
  const hero = makeRig({ yams: true }); sc.add(hero.root);
  const bub = bubbles(sc, 26, [-4, 4, 0.2, 4.5, -3, 2], 0.1, 0.45, 13);
  const silT = canvasTex(256, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#6fdcf0'); gr.addColorStop(0.55, '#35b4dc'); gr.addColorStop(1, '#0f6fa8'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  S.aero = { sc, hero, floor, bub, bgT, silT, silC: new THREE.Color(0x58bfe0), black: new THREE.MeshBasicMaterial({ color: 0x062a3a }) };
}
{ // ---- news studio
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x0b1c40);
  lightRig(sc, { sky: 0xcfe0ff, ground: 0x223355, hemi: 0.8, keyC: 0xffffff, key: 2.2, keyPos: [3, 6, 8], env: 0.7, R: 8, rim: 1.2, rimC: 0x5aa8ff, rimPos: [-4, 4, -4] });
  const scrT = canvasTex(1024, 640, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#0fa3e0'); gr.addColorStop(1, '#073b8a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const gl = g.createLinearGradient(0, 0, 0, h * 0.5); gl.addColorStop(0, 'rgba(255,255,255,0.45)'); gl.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gl; g.fillRect(0, 0, w, h * 0.5);
    for (let i = 0; i < 14; i++) { g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 3; g.beginPath(); g.arc(80 + (i * 137) % 900, 60 + (i * 89) % 520, 12 + (i % 4) * 10, 0, 7); g.stroke(); }
    g.font = '700 96px InterW, sans-serif'; g.fillStyle = '#fff'; g.textAlign = 'center'; g.fillText('YAMS ALERT', w / 2, 330); g.font = '140px "Noto Color Emoji"'; g.fillText('🍠', w / 2, 520); });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 4), new THREE.MeshBasicMaterial({ map: scrT, toneMapped: false })); screen.position.set(0, 3.25, -3); sc.add(screen);
  sc.add(rbox(6.8, 4.3, 0.2, mat(0x0a0f22, { roughness: 0.2, metalness: 0.5 }), 0, 3.25, -3.15));
  for (let i = -3; i <= 3; i++) sc.add(rbox(0.06, 8, 0.06, mat(0x2a6aff, { emissive: 0x3a7aff, emissiveIntensity: 1.2 }), i * 2.4, 4, -3.4));
  sc.add(rbox(16, 0.2, 12, mat(0x10224a, { roughness: 0.15, metalness: 0.3 }), 0, -0.1, 0));
  const anchor = makeRig({ hood: 0x1f2a44, hoodD: 0x1f2a44, pants: 0x1f2a44, skin: 0xd9a17a, hair: 0x6b4a2a, noHood: true, tie: 0xE21E39 }); anchor.root.position.set(0, 0.1, -0.6); sc.add(anchor.root);
  sc.add(rbox(4.3, 1.25, 1.3, mat(0x10224a, { roughness: 0.12, metalness: 0.5 }), 0, 0.62, 0.4)); sc.add(rbox(4.35, 0.12, 1.36, mat(0x23c1e8, { emissive: 0x23c1e8, emissiveIntensity: 0.8 }), 0, 1.0, 0.41)); sc.add(rbox(4.4, 0.08, 1.45, mat(0xe8f4ff, { roughness: 0.1 }), 0, 1.28, 0.36));
  S.news = { sc, anchor };
}
{ // ---- space (Earth, Moon with a face, glossy planets, astronaut, the Sun from episode 1)
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x05070d); sc.environment = ENV; sc.environmentIntensity = 0.35;
  sc.add(new THREE.HemisphereLight(0xbfd0ff, 0x101020, 0.5));
  const key = new THREE.DirectionalLight(0xfff2dd, 2.05); key.position.set(10, 6, 8); sc.add(key);
  const rim = new THREE.DirectionalLight(0x7a6bff, 1.6); rim.position.set(-8, 3, -6); sc.add(rim);
  const r = rnd(42); const sp = [];
  for (let i = 0; i < 2600; i++) { const v = V([r() * 2 - 1, r() * 2 - 1, r() * 2 - 1]).normalize().multiplyScalar(300 + r() * 100); sp.push(v.x, v.y, v.z); }
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
  sc.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 2.0 * RS, sizeAttenuation: false, toneMapped: false })));
  function planet(rad, det, colFn, seed) {
    const g = new THREE.IcosahedronGeometry(rad, det).toNonIndexed(); const pos = g.attributes.position; const cols = []; const rr2 = rnd(seed);
    for (let i = 0; i < pos.count; i += 3) { const cx = (pos.getX(i) + pos.getX(i + 1) + pos.getX(i + 2)) / 3, cy = (pos.getY(i) + pos.getY(i + 1) + pos.getY(i + 2)) / 3, cz = (pos.getZ(i) + pos.getZ(i + 1) + pos.getZ(i + 2)) / 3;
      const c = new THREE.Color(colFn(cx / rad, cy / rad, cz / rad, rr2)); for (let k = 0; k < 3; k++) cols.push(c.r, c.g, c.b); }
    g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    return new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.85 }));
  }
  const earth = planet(14, 4, (x, y, z, R) => { const n = Math.sin(x * 5.1 + Math.cos(z * 3.3)) + Math.cos(y * 4.2 - x * 2.0) + Math.sin(z * 6.0); return Math.abs(y) > 0.86 ? 0xf4f8ff : n > 0.9 ? (R() < 0.5 ? 0x4f9a4a : 0x6aae55) : (R() < 0.5 ? 0x2a6fd1 : 0x2f7ee0); }, 3);
  earth.position.set(0, -22, -8); sc.add(earth);
  earth.add(new THREE.Mesh(new THREE.SphereGeometry(14.7, 48, 32), new THREE.MeshBasicMaterial({ color: 0x6fb6ff, transparent: true, opacity: 0.2, side: THREE.BackSide, toneMapped: false })));
  function faceOn(parent, rad, o = {}) {
    const f = grp(0, 0, 0, parent); const z = rad * 1.03, eyeW = rad * 0.22;
    for (const sx of [-1, 1]) {
      f.add(rbox(eyeW, eyeW * 1.3, 0.1, 0x15110f, sx * rad * 0.3, rad * 0.12, z)); f.add(rbox(eyeW * 0.35, eyeW * 0.35, 0.1, mat(0xffffff, { emissive: 0xffffff, emissiveIntensity: 0.5 }), sx * rad * 0.3 + eyeW * 0.15, rad * 0.12 + eyeW * 0.3, z + 0.06));
      f.add(rbox(eyeW * 1.2, eyeW * 0.5, 0.1, mat(o.blush ?? 0xff6f8f, { emissive: o.blush ?? 0xff4f7b, emissiveIntensity: 0.6 }), sx * rad * 0.48, -rad * 0.08, z - 0.05));
      const l = rbox(eyeW * 0.5, eyeW * 0.14, 0.1, 0x15110f, sx * rad * 0.3 + sx * eyeW * 0.55, rad * 0.12 + eyeW * 0.65, z); l.rotation.z = sx * 0.6; f.add(l);
    }
    const sm = [rbox(rad * 0.22, rad * 0.07, 0.1, 0x6a2a20, 0, -rad * 0.2, z - 0.02), rbox(rad * 0.08, rad * 0.05, 0.1, 0x6a2a20, -rad * 0.12, -rad * 0.17, z - 0.03), rbox(rad * 0.08, rad * 0.05, 0.1, 0x6a2a20, rad * 0.12, -rad * 0.17, z - 0.03)]; sm.forEach(m => f.add(m));
    const mo = rbox(rad * 0.2, rad * 0.22, 0.1, 0x5a1a14, 0, -rad * 0.22, z); mo.visible = false; f.add(mo);
    f.userData = { smile: sm, o: mo }; return f;
  }
  const moon = planet(1.6, 2, (x, y, z, R) => R() < 0.2 ? 0x9a9aa2 : (R() < 0.5 ? 0xc9c9cf : 0xb7b7bf), 9); moon.material.color.setScalar(0.5); sc.add(moon); faceOn(moon, 1.6);
  const pc = [0xff6a3d, 0xffc35a, 0x45b8ff, 0x9b6bff, 0x4fe0a8, 0xff6fb5, 0xd9e7ff];
  const planets = pc.map((c, i) => { const p = ball(0.9 + (i % 3) * 0.45, new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.08, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.6 }), 0, 0, 0, undefined, 48); p.castShadow = false;
    if (i === 3) { const ring = new THREE.Mesh(new THREE.RingGeometry(1.9, 2.8, 64), new THREE.MeshStandardMaterial({ color: 0xe9e1ff, roughness: 0.2, metalness: 0.2, side: THREE.DoubleSide, transparent: true, opacity: 0.8 })); ring.rotation.x = 1.2; p.add(ring); }
    sc.add(p); return p; });
  const sunMesh = planet(5, 3, (x, y, z, R) => R() < 0.5 ? 0xffb21f : (R() < 0.6 ? 0xffc83d : 0xff8f1f), 77); sunMesh.material = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }); sc.add(sunMesh);
  const sunFace = faceOn(sunMesh, 5, { blush: 0xff3d6e });
  const glowT = canvasTex(256, 256, (g) => { const gr = g.createRadialGradient(128, 128, 10, 128, 128, 128); gr.addColorStop(0, 'rgba(255,205,100,1)'); gr.addColorStop(0.4, 'rgba(255,150,40,0.45)'); gr.addColorStop(1, 'rgba(255,120,20,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); });
  const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); sunGlow.scale.setScalar(24); sunMesh.add(sunGlow);
  const nebT = canvasTex(256, 256, (g) => { const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); });
  const nebs = []; const nr = rnd(5);
  for (let i = 0; i < 16; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: nebT, color: [0x3a2bd9, 0x7a3bd9, 0x2b9fd9, 0xd93ba8][i % 4], transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); s.position.copy(V([nr() * 2 - 1, nr() * 2 - 1, -1 - nr()]).normalize().multiplyScalar(150)); s.scale.setScalar(90 + nr() * 90); sc.add(s); nebs.push(s); }
  const hero = makeRig({ yams: true }); sc.add(hero.root);
  const astro = makeRig({ hood: 0xd6dae3, hoodD: 0xbfc4cf, pants: 0xcfd3dc, skin: 0xe2a77f, hair: 0x3a2a1a, noHood: true, helmet: true, pack: true, shoe: 0xdddddd }); sc.add(astro.root);
  const bub = bubbles(sc, 30, [-14, 14, -6, 12, -14, 4], 0.3, 1.1, 17);
  const hearts = [...Array(16)].map((_, i) => { const h = ball(0.25, mat(0xff7aa0, { emissive: 0xff4f7b, emissiveIntensity: 0.5, roughness: 0.2 }), 0, 0, 0, undefined, 16); h.visible = false; sc.add(h); return h; });
  S.space = { sc, earth, moon, planets, sunMesh, sunFace, nebs, hero, astro, bub, hearts };
}

// ---------------------------------------------------------------- SHOTS
const cam = new THREE.PerspectiveCamera(40, W / H, 0.05, 1000);
const shots = []; const shot = (t0, t1, scene, camA, setup, fx = {}) => shots.push({ t0, t1, scene, cam: camA, setup, ...fx });
const shake = (O, t0, amt, dur = 0.45) => { const k = clamp(1 - (O - t0) / dur); return O < t0 || k <= 0 ? 0 : amt * k * k; };
function popYams(P, O, t0, from, to, dur = 0.75) { P.setYams(lerp(from, to, elastic(seg(O, t0, t0 + dur)))); }
function resetRig(P) { P.root.position.set(0, 0, 0); P.root.rotation.set(0, 0, 0); P.root.scale.setScalar(1); P.root.visible = true; if (P.flaps) { P.flaps.forEach(f => f.visible = false); P.boxers.visible = false; } if (P.caps) P.caps.forEach(c => c.visible = false); P.glasses.visible = false; }
function talking(speaker, O) { return DIALOGUE.some(c => c.speaker === speaker && c.kind !== 'shout' && spanHit(c, O)); }
function shouting(speaker, O) { return DIALOGUE.some(c => c.speaker === speaker && c.kind === 'shout' && spanHit(c, O)); }
const wp = (o) => { const v = new THREE.Vector3(); o.updateWorldMatrix(true, false); return o.getWorldPosition(v); };
const SEATED = { bob: -0.38, legs: [[1.45, -1.5], [1.45, -1.5]] };
const STR = { hood: 0x23b5a4, hoodD: 0x178b7e, pants: 0xf2cf5b, pantsD: 0xd8b43f, skin: 0x8d5a3b, hair: 0x1a1210, hairStyle: 'long', noHood: true, shoe: 0xf7f7f7 };
const glowTex = (c0, c1) => canvasTex(256, 256, (g) => { const gr = g.createRadialGradient(128, 128, 6, 128, 128, 128); gr.addColorStop(0, c0); gr.addColorStop(0.35, c1); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); });

// ===== extra props for this episode =====
{ // room: the jeans button + a cracked mirror
  const R = S.room; R.btn = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.028, 20), mat(0xf2c14e, { metalness: 0.85, roughness: 0.22, envMapIntensity: 1.6 })); R.btn.castShadow = true; R.sc.add(R.btn);
  const crT = canvasTex(256, 512, (g, w, h) => { g.strokeStyle = 'rgba(255,255,255,0.95)'; g.lineCap = 'round'; const cx = w * 0.55, cy = h * 0.3;
    for (let i = 0; i < 9; i++) { const a = i * 0.7 + 0.2; let x = cx, y = cy; g.lineWidth = 3.2; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 5; k++) { const aa = a + (k % 2 ? 0.35 : -0.3); x += Math.cos(aa) * 36; y += Math.sin(aa) * 36; g.lineTo(x, y); } g.stroke(); }
    g.lineWidth = 1.6; [24, 52, 86].forEach(r => { g.beginPath(); for (let i = 0; i <= 9; i++) { const a = i * 0.7 + 0.2; const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }); });
  R.crack = new THREE.Mesh(new THREE.PlaneGeometry(0.82, 1.92), new THREE.MeshBasicMaterial({ map: crT, transparent: true, depthWrite: false })); R.crack.position.set(0.95, 1.12, 0.222); R.crack.visible = false; R.sc.add(R.crack);
}
{ // market street: the bus, the conductor, the eclipse
  const M = S.market; M.bus.visible = false; M.scooter.visible = false;
  const bus = grp(0, 0, 0.9, M.sc); const piv = grp(-2.0, 0.5, 0, bus); M.bus2 = bus; M.piv = piv;     // pivot = rear axle
  const body = mat(0xffc928, { roughness: 0.25, metalness: 0.1 }), glass = mat(0x1f5f86, { roughness: 0.05, metalness: 0.5 }), dark = mat(0x23262e, { roughness: 0.5 });
  piv.add(rbox(6.4, 2.2, 2.3, body, 2.0, 1.25, 0)); piv.add(rbox(6.42, 0.24, 2.32, dark, 2.0, 0.62, 0)); piv.add(rbox(6.0, 0.14, 2.1, mat(0xf0f0f0, { roughness: 0.3 }), 2.0, 2.4, 0)); piv.add(rbox(6.42, 0.14, 2.32, mat(0x1c9c5a, { roughness: 0.3 }), 2.0, 1.02, 0));
  for (let i = 0; i < 4; i++) piv.add(rbox(0.9, 0.72, 2.34, glass, -0.35 + i * 1.08, 1.64, 0));
  piv.add(rbox(0.1, 0.95, 2.0, glass, 5.17, 1.55, 0)); piv.add(rbox(0.95, 1.7, 0.06, dark, 4.3, 1.1, 1.17)); piv.add(rbox(0.75, 0.6, 0.07, glass, 4.3, 1.55, 1.18));
  M.wheels = [[0, 1.2], [0, -1.2], [4.0, 1.2], [4.0, -1.2]].map(([x, z]) => { const w = grp(x, 0, z, piv); const t = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.3, 24), mat(0x15161a, { roughness: 0.6 })); t.rotation.x = Math.PI / 2; t.castShadow = true; w.add(t); w.add(rbox(0.56, 0.12, 0.32, mat(0xcfd3da, { metalness: 0.6, roughness: 0.3 }))); w.add(rbox(0.12, 0.56, 0.32, mat(0xcfd3da, { metalness: 0.6, roughness: 0.3 }))); return w; });
  [-0.75, 0.75].forEach(z => piv.add(rbox(0.08, 0.22, 0.4, mat(0xfff3b0, { emissive: 0xffe9a0, emissiveIntensity: 1.2 }), 5.22, 0.75, z)));
  M.lobes = [-0.6, 0.6].map(z => { const l = ball(1, DENIM, -1.2, 1.3, z, undefined, 40); l.scale.setScalar(0.001); piv.add(l); return l; });
  M.cond = makeRig({ hood: 0x2f6fd0, hoodD: 0x2458a8, pants: 0x30343c, skin: 0x7a4a2e, hair: 0x15100d, noHood: true }); M.cond.head.add(rbox(0.74, 0.16, 0.7, mat(0xe8343c), 0, 0.74, 0)); M.cond.head.add(rbox(0.5, 0.05, 0.3, mat(0xe8343c), 0, 0.68, 0.42)); piv.add(M.cond.root);
  M.win = grp(0.75, -0.05, 0.8, piv);
  M.stop = grp(3.5, 0, 2.5, M.sc); M.stop.add(rbox(0.08, 2.6, 0.08, mat(0x8a8f98, { metalness: 0.6, roughness: 0.3 }), 0, 1.3, 0)); M.stop.add(rbox(0.7, 0.7, 0.06, mat(0x1f8fe0, { roughness: 0.2 }), 0, 2.45, 0)); M.stop.add(rbox(0.38, 0.22, 0.07, mat(0xf4f4f4), 0, 2.5, 0.01));
  M.kid = makeRig({ hood: 0xff8c5a, hoodD: 0xe0703f, pants: 0x3b5fa0, skin: 0x8d5a3b, hair: 0x15100d, noHood: true }); M.kid.root.scale.setScalar(0.62); M.sc.add(M.kid.root);
  M.ecl = grp(0, 34, 70, M.sc); const cor = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex('rgba(255,250,225,1)', 'rgba(255,205,120,0.55)'), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); cor.scale.setScalar(62); M.ecl.add(cor);
  [-4.6, 4.6].forEach(x => { const d = new THREE.Mesh(new THREE.CircleGeometry(6.2, 48), new THREE.MeshBasicMaterial({ color: 0x03040a, toneMapped: false })); d.position.set(x, 0, -0.5); d.rotation.y = Math.PI; M.ecl.add(d); }); M.ecl.visible = false;
}
{ // park: seesaw, the stranger, a twinkle, tourists, the phone
  const P = S.park; P.bench.visible = false;
  const see = grp(2.2, 0, 0.6, P.sc); P.see = see; see.add(rbox(0.5, 0.56, 0.6, mat(0xe8343c, { roughness: 0.3 }), 0, 0.28, 0));
  P.plank = grp(0, 0.6, 0, see); P.plank.add(rbox(4.6, 0.1, 0.5, mat(0xffd23f, { roughness: 0.35 }), 0, 0, 0)); [-1.55, 1.55].forEach(x => { P.plank.add(rbox(0.07, 0.36, 0.07, mat(0x2d3036, { metalness: 0.6, roughness: 0.35 }), x, 0.2, 0)); P.plank.add(rbox(0.07, 0.07, 0.5, mat(0x2d3036, { metalness: 0.6, roughness: 0.35 }), x, 0.38, 0)); });
  P.stranger = makeRig(STR); P.sc.add(P.stranger.root);
  const stT = canvasTex(256, 256, (g) => { g.translate(128, 128); const gr = g.createRadialGradient(0, 0, 2, 0, 0, 120); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,0.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(-128, -128, 256, 256); g.fillStyle = '#fff'; for (let i = 0; i < 4; i++) { g.rotate(Math.PI / 2); g.beginPath(); g.moveTo(0, -10); g.lineTo(120, 0); g.lineTo(0, 10); g.fill(); } });
  P.star = new THREE.Sprite(new THREE.SpriteMaterial({ map: stT, transparent: true, depthWrite: false, toneMapped: false })); P.star.visible = false; P.sc.add(P.star);
  const tc = [[0xff8c5a, 0x3b5fa0, 0xe7b289, 0x5a3a22, 'short'], [0x8d5ac9, 0x2b2b2b, 0x6b4128, 0x111111, 'long'], [0x48a868, 0x5b4636, 0xf0c7a0, 0xb8742a, 'short']];
  P.tour = tc.map(c => { const p = makeRig({ hood: c[0], hoodD: c[0], pants: c[1], skin: c[2], hair: c[3], noHood: true, hairStyle: c[4] }); P.sc.add(p.root); return p; });
  P.phone = grp(0, -0.52, 0.06, P.hero.arms[1].el); P.phone.add(rbox(0.2, 0.36, 0.035, mat(0x15171c, { roughness: 0.2 }))); P.phone.add(rbox(0.17, 0.31, 0.01, mat(0xbfe8ff, { emissive: 0x9fd8ff, emissiveIntensity: 0.9 }), 0, 0, 0.02)); P.phone.rotation.x = -1.2; P.phone.visible = false;
}
{ // ---- ski resort (Day 6)
  const sc = new THREE.Scene(); sc.add(skyDome('#4f9be0', '#b5dcf8', '#e3effb'));
  lightRig(sc, { sky: 0xe8f2ff, ground: 0xa8bcd8, hemi: 0.45, keyC: 0xfff4e6, key: 1.6, keyPos: [8, 14, 10], target: [0, 2, -2], rim: 0.5, rimC: 0xbfe0ff, rimPos: [-6, 5, -8], env: 0.4, R: 16 });
  sc.add(rbox(200, 0.2, 200, mat(0xb9c8dd, { roughness: 0.95 }), 0, -0.1, -30));
  [[-34, -60, 24], [30, -70, 30], [0, -95, 40], [-60, -90, 30], [62, -85, 28]].forEach(([x, z, r]) => { const h = ball(r, mat(0xc3d0e3, { roughness: 0.95 }), x, -r * 0.55, z, undefined, 40); h.castShadow = false; sc.add(h); });
  const pine = mat(0x2a7d52, { roughness: 0.6 }), snowM = mat(0xdde6f2, { roughness: 0.9 });
  [[-7, -4, 1.2], [8, -6, 1.4], [-11, -11, 1.1], [12, -13, 1.5], [-5, 5, 0.9], [7.5, 4, 1.0], [-14, -2, 1.3], [15, -3, 1.2]].forEach(([x, z, s]) => { const t = grp(x, 0, z, sc); t.add(rbox(0.3, 0.9, 0.3, mat(0x6a4a30), 0, 0.45, 0));
    [[1.3, 1.5, 1.4], [1.0, 1.3, 2.3], [0.7, 1.1, 3.1]].forEach(([r, h, y]) => { const c = new THREE.Mesh(new THREE.ConeGeometry(r, h, 10), pine); c.position.y = y; c.castShadow = true; t.add(c); });
    const top = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.6, 10), snowM); top.position.y = 3.5; t.add(top); t.scale.setScalar(s); });
  const hero = makeRig({ yams: true }); sc.add(hero.root);
  const sk = [0xe8343c, 0xffd23f, 0x2bc3d9, 0xff8a1f, 0xb04ad9, 0x7ed957, 0xf4f4f4, 0xe8343c];
  const skiers = sk.map((c, i) => { const g = grp(0, 0, 0, sc); g.add(rbox(0.3, 0.4, 0.22, mat(c, { roughness: 0.5 }), 0, 0.42, 0)); g.add(rbox(0.26, 0.24, 0.24, mat(i % 2 ? 0x8d5a3b : 0xe7b289), 0, 0.76, 0)); g.add(rbox(0.28, 0.1, 0.26, mat(sk[(i + 3) % 8]), 0, 0.9, 0));
    g.add(rbox(0.12, 0.22, 0.14, mat(0x2a2f3a), -0.08, 0.12, 0)); g.add(rbox(0.12, 0.22, 0.14, mat(0x2a2f3a), 0.08, 0.12, 0)); [-0.09, 0.09].forEach(x => g.add(rbox(0.08, 0.03, 0.85, mat(0x20242c, { roughness: 0.3 }), x, 0.015, 0.08)));
    [-0.2, 0.2].forEach(x => g.add(rbox(0.025, 0.5, 0.025, mat(0x9aa3b0), x, 0.35, 0.12))); g.scale.setScalar(0.42); return g; });
  const flake = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 }), 220); flake.castShadow = false; sc.add(flake);
  const fr = rnd(31); const fd = [...Array(220)].map(() => ({ x: fr() * 30 - 15, y: fr() * 16, z: fr() * 22 - 12, s: 0.025 + fr() * 0.035, sp: 0.9 + fr() * 0.9, p: fr() * 9 }));
  const fm = new THREE.Matrix4(), fq = new THREE.Quaternion();
  const snow = (O) => { fd.forEach((d, i) => { const y = 16 - ((16 - d.y + O * d.sp) % 16); fm.compose(V([d.x + Math.sin(O * 0.9 + d.p) * 0.4, y, d.z]), fq, V([d.s, d.s, d.s])); flake.setMatrixAt(i, fm); }); flake.instanceMatrix.needsUpdate = true; };
  const puffs = [0, 1, 2].map(() => { const p = ball(0.09, new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.5, roughness: 1, depthWrite: false }), 0, 0, 0, undefined, 12); p.castShadow = false; sc.add(p); return p; });
  const cabin = grp(0, 0, 0, sc); cabin.add(rbox(0.7, 0.45, 0.55, mat(0x8a5a3c, { roughness: 0.6 }), 0, 0.22, 0)); cabin.add(rbox(0.86, 0.14, 0.7, snowM, 0, 0.5, 0)); cabin.add(rbox(0.16, 0.2, 0.02, mat(0xffd98a, { emissive: 0xffc860, emissiveIntensity: 1.2 }), 0, 0.22, 0.285));
  const flags = [0, 1, 2, 3, 4, 5].map(i => { const f = grp(0, 0, 0, sc); f.add(rbox(0.03, 0.5, 0.03, mat(0x30343c), 0, 0.25, 0)); f.add(rbox(0.22, 0.14, 0.02, mat(i % 2 ? 0xe8343c : 0x1f8fe0), 0.12, 0.42, 0)); return f; });
  S.ski = { sc, hero, skiers, snow, puffs, cabin, flags };
}
{ // space: UFO + traffic warden, parking ticket, the stranger on the Moon
  const P = S.space; P.sunFace.visible = false; P.moon.children.forEach(c => c.visible = false);
  const ufo = grp(0, 0, 0, P.sc); P.ufo = ufo; const metal = mat(0xb9c2d0, { metalness: 0.85, roughness: 0.22, envMapIntensity: 1.6 });
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 2.6, 0.45, 40), metal); ufo.add(disc); const under = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 1.2, 0.35, 40), mat(0x6f7888, { metalness: 0.8, roughness: 0.3 })); under.position.y = -0.4; ufo.add(under);
  P.ufoL = [...Array(10)].map((_, i) => { const a = i / 10 * Math.PI * 2; const l = ball(0.16, mat(0x7dffb0, { emissive: 0x4dff9a, emissiveIntensity: 2.2 }), Math.cos(a) * 2.2, -0.28, Math.sin(a) * 2.2, undefined, 12); l.castShadow = false; ufo.add(l); return l; });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(1.35, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xcfeaff, transparent: true, opacity: 0.2, roughness: 0.02, metalness: 0.3, envMapIntensity: 2.5, depthWrite: false })); dome.position.y = 0.2; ufo.add(dome);
  P.alien = makeRig({ hood: 0x2a2f3a, hoodD: 0x1c2029, pants: 0x2a2f3a, skin: 0x7ed957, hairStyle: 'none', noHood: true, hair: 0x4c9a2f }); P.alien.root.scale.setScalar(0.62); P.alien.root.position.set(0, -0.3, 0); ufo.add(P.alien.root);
  P.alien.head.add(rbox(0.04, 0.26, 0.04, mat(0x4c9a2f), 0, 0.76, 0)); P.alien.head.add(ball(0.07, mat(0xffe24d, { emissive: 0xffd21f, emissiveIntensity: 1.5 }), 0, 0.92, 0, undefined, 12)); P.alien.root.add(rbox(0.5, 0.08, 0.3, mat(0xffd23f), 0, 1.72, 0.2));
  const pad = grp(0, -0.5, 0.08, P.alien.arms[0].el); pad.add(rbox(0.26, 0.34, 0.04, mat(0xffe27a))); pad.rotation.x = -1.1;
  const tT = canvasTex(512, 660, (g, w, h) => { g.fillStyle = '#ffd83a'; g.fillRect(0, 0, w, h); g.fillStyle = '#1b1b1f'; g.fillRect(0, 0, w, 120); g.fillStyle = '#ffd83a'; g.font = 'bold 54px sans-serif'; g.textAlign = 'center'; g.fillText('PARKING', w / 2, 58); g.fillText('VIOLATION', w / 2, 108);
    g.fillStyle = '#1b1b1f'; g.textAlign = 'left'; g.font = 'bold 34px sans-serif'; [['VEHICLE:', '2 YAMS'], ['ZONE:', 'MILKY WAY B'], ['OFFENCE:', 'DOUBLE PARKED'], ['FINE:', '500 STARS']].forEach(([a, b], i) => { g.fillText(a, 34, 200 + i * 86); g.font = 'bold 44px sans-serif'; g.fillText(b, 34, 244 + i * 86); g.font = 'bold 34px sans-serif'; });
    for (let i = 0; i < 40; i++) { g.fillRect(34 + i * 11, 570, (i * 7) % 3 ? 4 : 8, 60); } });
  P.ticket = new THREE.Mesh(new THREE.PlaneGeometry(5.1, 6.6), new THREE.MeshStandardMaterial({ map: tT, roughness: 0.6, side: THREE.DoubleSide })); P.ticket.visible = false; P.sc.add(P.ticket);
  P.girl = makeRig(STR); P.girl.root.scale.setScalar(0.85); P.sc.add(P.girl.root);
}

// ===== ROOM: title, Day 1, Day 2 (the button) =====
const BT = [[7.06, [1.3, 1.0, 1.7]], [7.12, [4.8, 0.75, 1.1]], [7.42, [-2.7, 2.3, 3.3]], [7.68, [-1.6, 2.78, 0.45]], [7.92, [5.4, 2.9, 4.0]], [8.14, [0.95, 1.5, 0.26]]];
function btnPos(O) { if (O < BT[0][0]) return null; for (let i = 0; i < BT.length - 1; i++) if (O < BT[i + 1][0]) { const k = (O - BT[i][0]) / (BT[i + 1][0] - BT[i][0]); const p = V(BT[i][1]).lerp(V(BT[i + 1][1]), k); p.y += Math.sin(k * Math.PI) * 0.3; return p; } return V(BT[BT.length - 1][1]); }
function roomBase(O) { const R = S.room; resetRig(R.hero); R.stranger.root.visible = false; R.deb.forEach(d => d.m.visible = false); R.bub.update(O, 1);
  const b = btnPos(O); R.btn.visible = !!b; if (b) { R.btn.position.copy(b); const fly = O < 8.14; R.btn.rotation.set(fly ? O * 40 : Math.PI / 2, fly ? O * 31 : 0, 0); R.btn.scale.setScalar(fly ? 2.4 : 1.3); }
  R.crack.visible = O >= 8.14; if (O >= 8.14) R.crack.material.opacity = clamp((O - 8.14) / 0.05);
  [[7.12, 0, 5], [7.42, 5, 10], [7.68, 10, 15], [7.92, 15, 20], [8.14, 20, 28]].forEach(([t, a, b2], i) => { if (O >= t && O < t + 0.7) burst(R.deb.slice(a, b2), O, t, V(BT[i + 1][1]), 1.1, 1.2); }); }
shot(0, 1.6, 'room', { p0: [0.9, 1.75, 7.6], p1: [0.9, 1.65, 6.6], l0: [0.7, 1.3, 2.4], fov: 40 }, (lt, O) => {
  const R = S.room; roomBase(O); const h = R.hero; h.root.position.set(0.9, 0, 2.6); h.setYams(1);
  const st = Math.sin(seg(lt, 0, 0.9) * Math.PI); pose(h, { ...idle(O), spineX: -0.15 * st, headX: -0.3 * st, arms: [[-2.6 * st, 0, 0.13 - 0.7 * st, 0.1 * st], [-2.6 * st, 0, -0.13 + 0.7 * st, 0.1 * st]] }); h.face(st > 0.3 ? 'yawn' : 'calm', O);
}, { grade: 'room', flare: [0.12, 0.3] });
shot(1.6, 3.0, 'room', { p0: [4.9, 2.1, 0.7], p1: [4.7, 2.05, 0.75], l0: [0.9, 1.3, 2.4], fov: 52 }, (lt, O) => {
  const R = S.room; roomBase(O); const h = R.hero; const k = eIO(clamp(lt / 0.75)); h.root.position.set(lerp(0.9, 0.95, k), 0, lerp(2.9, 1.95, k)); h.root.rotation.y = Math.PI; h.setYams(1);
  pose(h, lt < 0.75 ? walk(O, 7.5, 0.8) : idle(O)); h.face('calm', O);
}, { grade: 'room' });
shot(3.0, 5.0, 'room', { p0: [0.95, 2.05, 0.4], p1: [0.95, 2.03, 0.5], l0: [0.95, 1.85, 1.95], fov: 56, shift: 0.1 }, (lt, O) => {   // DAY 1 — mirror POV
  const R = S.room; roomBase(O); const h = R.hero; h.root.position.set(0.95, 0, 1.95); h.root.rotation.y = Math.PI; h.setYams(1);
  const up = eOut(seg(lt, 0.15, 0.4)); pose(h, { ...idle(O), arms: [[-0.2, 0, 0.13, 0.15], [-1.5 * up, 0, -0.35 * up, 1.6 * up]], headZ: 0.08 * up }); h.face('smile', O, talking('hero', O));
}, { grade: 'room', dof: 0.35 });
shot(5.0, 6.6, 'room', { p0: [1.3, 1.9, 4.9], p1: [1.2, 1.9, 4.5], l0: [0.95, 1.75, 1.95], fov: 36 }, (lt, O) => {
  const R = S.room; roomBase(O); const h = R.hero; h.root.position.set(0.95, 0, 1.95); h.root.rotation.y = lerp(0.75, 0, eOut(seg(lt, 0, 0.3))); h.setYams(1);
  const nod = Math.sin(seg(lt, 0.45, 0.95) * Math.PI * 2) * 0.12; pose(h, { ...idle(O), headX: nod, arms: [[0, 0, 0.13, 0.15], [0, 0, -0.5, 0.2]] }); h.face(lt > 0.4 ? 'smirk' : 'calm', O);
}, { grade: 'room', dof: 0.45 });
shot(6.6, 7.3, 'room', { p0: [-2.4, 1.6, 6.4], p1: [-2.2, 1.57, 6.0], l0: [0.95, 1.05, 1.5], fov: 40, ease: 'lin' }, (lt, O) => {   // DAY 2 — the doubling: the button gives up
  const R = S.room; roomBase(O); const h = R.hero; h.root.position.set(0.95, 0, 1.5); h.root.rotation.y = 1.15; popYams(h, O, 7.0, 1, 1.7);
  const ant = seg(O, 6.72, 7.0), pop = seg(O, 7.0, 7.3);
  pose(h, { bob: -0.08 * ant + 0.13 * Math.sin(pop * Math.PI), spineX: 0.15 * ant - 0.3 * Math.sin(pop * Math.PI), arms: [[-0.25 * ant - 2.3 * pop, 0, 0.2 + 1.2 * pop, 0.3 + 0.8 * pop], [-0.25 * ant - 2.1 * pop, 0, -0.2 - 1.2 * pop, 0.3 + 0.8 * pop]],
    legs: [[0.2 * ant, 0.36 * ant], [0.2 * ant, 0.36 * ant]], headX: -0.25 * pop }); h.face(O < 7.0 ? 'calm' : 'shock', O);
}, { grade: 'roomw', shakeAt: [[7.02, 0.06]] });
shot(7.3, 8.35, 'room', { p0: [-2.3, 2.7, 8.4], p1: [-2.1, 2.6, 7.9], lf: (O) => { const b = btnPos(O - 0.04) || V([1, 1.4, 1.5]); return b.multiplyScalar(0.3).add(V([1.5, 1.5, 1.4]).multiplyScalar(0.7)); }, fov: 62, ease: 'lin' }, (lt, O) => {   // the ricochet
  const R = S.room; roomBase(O); const h = R.hero; h.root.position.set(0.95, 0, 1.5); h.root.rotation.y = 0.4; h.setYams(1.7);
  const duck = eOut(seg(O, 7.3, 7.5)); const b = btnPos(O) || V([0, 0, 0]);
  pose(h, { bob: -0.3 * duck, spineX: 0.5 * duck, legs: [[0.5 * duck, 0.9 * duck], [0.5 * duck, 0.9 * duck]], arms: [[-2.7 * duck, 0, -0.5 * duck, 1.5 * duck], [-2.7 * duck, 0, 0.5 * duck, 1.5 * duck]], headX: 0.2 * duck, headY: clamp((b.x - 0.95) * 0.25, -0.8, 0.8) }); h.face('shock', O);
}, { grade: 'roomw', shakeAt: [[7.42, 0.02], [7.68, 0.02], [7.92, 0.02], [8.14, 0.045]], mblur: 5 });
shot(8.35, 10.2, 'room', { p0: [1.9, 1.8, 4.9], p1: [1.7, 1.8, 4.4], l0: [0.98, 1.55, 1.5], fov: 38 }, (lt, O) => {
  const R = S.room; roomBase(O); const h = R.hero; h.root.position.set(0.95, 0, 1.5); h.root.rotation.y = 0.3; h.setYams(1.7);
  const look = Math.sin(seg(lt, 0, 0.4) * Math.PI); const hitch = Math.max(0, Math.sin(O * 9)) * 0.05;
  pose(h, { ...idle(O), bob: hitch * 0.4, headX: 0.45 * look, headY: -0.2 * look, arms: [[-0.35, 0, 0.45, 1.25 + hitch], [-0.35, 0, -0.45, 1.25 + hitch]] }); h.face('shock', O, talking('hero', O));
}, { grade: 'room', dof: 0.45 });

// ===== DAY 3: the bus =====
const busDrop = 12.22;
function marketBase(O, o = {}) { const M = S.market; resetRig(M.hero); M.bub.update(O, 1); M.deb.forEach(d => d.m.visible = false); M.stalls.forEach(s => { s.position.y = 0; s.rotation.set(0, 0, 0); });
  M.crowd.forEach(p => { resetRig(p); p.root.visible = false; }); resetRig(M.kid); M.kid.root.scale.setScalar(0.62); M.kid.root.visible = false; M.ecl.visible = false; M.stop.visible = o.bus !== false; M.bus2.visible = o.bus !== false;
  const th = 0.3 * elastic(seg(O, busDrop, busDrop + 0.75)) + (O > busDrop ? Math.sin(O * 7) * 0.012 : 0); M.piv.rotation.z = th; const lk = 0.98 * elastic(seg(O, busDrop - 0.02, busDrop + 0.6)); M.lobes.forEach(l => l.scale.set(Math.max(0.001, lk), Math.max(0.001, lk * 0.95), Math.max(0.001, lk)));
  const arrive = eOut(seg(O, 10.35, 11.55)), leave = eIn(seg(O, 16.45, 17.9)); M.bus2.position.x = lerp(-17, 0, arrive) + 30 * leave;
  if (O < busDrop) M.piv.rotation.z = -0.045 * Math.sin(seg(O, 11.45, 11.95) * Math.PI);
  const spin = O < 11.55 ? -lerp(-17, 0, arrive) * 2 : (O > busDrop ? O * 9 : 0); M.wheels.forEach((w, i) => w.rotation.z = i < 2 && O > busDrop && O < 16.45 ? 0 : -spin - 60 * leave);
  const C = M.cond; resetRig(C); C.root.position.set(4.3, -0.1, 1.0); C.root.rotation.y = 0.15; C.root.visible = o.bus !== false; const ct = talking('conductor', O);
  pose(C, { ...idle(O, 2), spineZ: 0.12, headY: -0.5 + (ct ? 0.12 * Math.sin(O * 6) : 0), headX: 0.1, arms: [[-2.5, 0, -0.15, 0.5], [-0.9 + (ct ? 0.35 * Math.sin(O * 11) : 0), 0, 0.7, 1.0]] }); C.face(O > busDrop ? 'grit' : 'calm', O, ct);
}
function heroAtWindow(O) { const M = S.market, h = M.hero; const p = wp(M.win); h.root.position.copy(p); h.root.rotation.set(0, 0, M.piv.rotation.z); h.setYams(1); const tk = talking('hero', O);
  pose(h, { spineX: 0.8, headX: -0.75, headY: 0.25 + 0.1 * Math.sin(O * 2), arms: [[-1.2, 0, 0.5, 0.4], [-2.5, 0, 0.7 + 0.3 * Math.sin(O * 10), 0.5]] }); h.face(tk ? 'smile' : 'worried', O, tk); }
function crowdWatch(O, n, look) { const M = S.market; for (let i = 0; i < n; i++) { const p = M.crowd[i]; p.root.visible = true; p.root.position.set(-6.5 + i * 2.9 + (i % 2) * 0.5, 0, -1.6 - (i % 3) * 0.7); p.root.rotation.y = 0; pose(p, { ...idle(O, i), headY: clamp(Math.atan2(look - p.root.position.x, 4) * 0.9, -1.1, 1.1) }); p.face('shock', O); } }
shot(10.2, 11.8, 'market', { p0: [2.4, 1.8, 7.8], p1: [1.6, 2.8, 13.5], l0: [1.9, 1.5, 1.2], l1: [1.2, 1.6, 1.2], fov: 48, ease: 'io' }, (lt, O) => {
  const M = S.market; marketBase(O); const h = M.hero; popYams(h, O, 10.25, 1.7, 2.35); h.root.position.set(2.5, 0, 2.6);
  const lk = eIO(seg(O, 10.9, 11.3)); pose(h, { ...idle(O), headY: 1.0 * lk, arms: [[0, 0, 0.13, 0.2], [0, 0, -0.13, 0.2]] }); h.face(O < 10.9 ? 'shock' : 'calm', O);
}, { grade: 'market', flash: 10.2, flare: [0.85, 0.1] });
shot(11.8, 12.8, 'market', { p0: [-1.0, 1.9, 14.8], p1: [-1.3, 1.9, 13.8], l0: [-1.4, 1.9, 1.0], fov: 58 }, (lt, O) => {
  const M = S.market; marketBase(O); const h = M.hero; h.setYams(2.35); const k = eIO(seg(O, 11.8, 12.12)); h.root.position.set(lerp(2.5, 2.3, k), 0.25 * Math.sin(k * Math.PI), lerp(2.6, 1.7, k)); h.root.rotation.y = Math.PI * eOut(seg(O, 11.8, 11.95));
  h.root.scale.setScalar(lerp(1, 0.8, seg(O, 12.0, 12.12))); h.root.visible = O < 12.12; pose(h, walk(O, 14, 0.9)); h.face('calm', O);
  if (O > busDrop) burst(M.deb.slice(0, 10), O, busDrop, wp(M.wheels[0]).add(V([-1.0, -0.3, 0.6])), 2.2, 1.6);
}, { grade: 'market', shakeAt: [[busDrop, 0.07]], mblur: (O) => O > 12.16 && O < 12.7 ? 5 : 1 });
let CAMP = V([0, 2, 6]), CAML = V([0, 1.5, 0]);
shot(12.8, 15.15, 'market', { pf: () => CAMP, lf: () => CAML, fov: 34 }, (lt, O) => {    // the conductor
  const M = S.market; marketBase(O); M.hero.root.visible = false; const hd = wp(M.cond.head).add(V([0, 0.3, 0])); const e = eOut(lt);
  CAML = hd.clone().add(V([-0.1, -0.2, 0])); CAMP = hd.clone().add(V([lerp(1.7, 1.4, e), lerp(0.2, 0.1, e), lerp(5.6, 4.9, e)]));
}, { grade: 'market', dof: 0.5 });
shot(15.15, 16.45, 'market', { pf: () => CAMP, lf: () => CAML, fov: 36 }, (lt, O) => {    // "it is only me o"
  const M = S.market; marketBase(O); heroAtWindow(O); const hd = wp(M.hero.head).add(V([0, 0.3, 0])); const e = eOut(lt);
  CAML = hd.clone().add(V([0.1, -0.15, 0])); CAMP = hd.clone().add(V([lerp(-0.9, -0.6, e), lerp(0.5, 0.4, e), lerp(4.6, 3.9, e)]));
}, { grade: 'market', dof: 0.5 });
shot(16.45, 17.6, 'market', { p0: [1.5, 2.2, 12.5], p1: [2.6, 2.4, 13.5], l0: [2.5, 1.9, 1.0], l1: [6, 1.9, 1.0], fov: 46, ease: 'lin' }, (lt, O) => {
  const M = S.market; marketBase(O); heroAtWindow(O); crowdWatch(O, 5, M.bus2.position.x + 1);
  const k = Math.floor((O - 16.45) / 0.22); const t0 = 16.45 + k * 0.22; burst(M.deb.slice(0, 12), O, t0, wp(M.piv).add(V([-1.3, -0.35, 0])), 1.6, 1.0);
}, { grade: 'market' });

// ===== DAY 4: the seesaw =====
const sitT = 20.45;
function parkBase(O, o = {}) { const P = S.park; resetRig(P.hero); P.bub.update(O, 1); P.pigeons.forEach(p => p.visible = false); P.bigP.visible = false; P.deb.forEach(d => d.m.visible = false); P.phone.visible = false; P.star.visible = false;
  P.tour.forEach(t => { resetRig(t); t.root.visible = false; }); resetRig(P.stranger); P.stranger.root.visible = false;
  P.plank.rotation.z = o.plank ?? (O < sitT ? 0.2 : -0.2 - 0.03 * Math.sin((O - sitT) * 14) * Math.exp(-(O - sitT) * 5)); }
function endPos(P, side) { const a = P.plank.rotation.z; return V([2.2 + side * 1.95 * Math.cos(a), 0.6 + side * 1.95 * Math.sin(a) + 0.06, 0.6]); }
function strangerSit(O) { const P = S.park, s = P.stranger; s.root.visible = true; const e = endPos(P, -1); s.root.position.set(e.x, e.y - 0.56, e.z); s.root.rotation.y = Math.PI / 2; const tk = talking('stranger', O); const wv = seg(O, 18.3, 18.7) * (1 - seg(O, 19.9, 20.2));
  pose(s, { ...SEATED, spineX: 0.05, headY: -0.15, arms: [[-0.5, 0, 0.3, 0.9], [-2.7 * wv - 0.5 * (1 - wv), 0, 0.45 + 0.25 * wv * Math.sin(O * 12), 0.4 + 0.5 * (1 - wv)]] }); s.face(tk || wv > 0.5 ? 'smile' : 'calm', O, tk); }
shot(17.6, 19.4, 'park', { p0: [1.0, 1.4, 6.4], p1: [3.0, 3.0, 14.5], l0: [0.8, 1.15, 0.6], l1: [3.0, 1.3, 0.6], fov: 50, ease: 'io' }, (lt, O) => {   // DAY 4 — tier pull-back
  const P = S.park; parkBase(O); strangerSit(O); const h = P.hero; popYams(h, O, 17.65, 2.35, 3.2); const k = seg(O, 17.9, 19.4); h.root.position.set(lerp(7.4, 5.3, k), 0, 0.6); h.root.rotation.y = -Math.PI / 2;
  pose(h, O > 18.0 ? walk(O, 7, 0.9) : idle(O)); h.face(O < 18.6 ? 'shock' : 'smile', O);
}, { grade: 'park', flash: 17.6, flare: [0.82, 0.12] });
shot(19.4, 20.9, 'park', { p0: [2.7, 1.6, 13.2], p1: [2.5, 1.55, 12.4], l0: [2.5, 1.5, 0.6], fov: 50 }, (lt, O) => {   // sit down -> launch
  const P = S.park; parkBase(O); const h = P.hero, s = P.stranger; h.setYams(3.2); h.root.rotation.y = -Math.PI / 2;
  const walkK = seg(O, 19.4, 19.95), hop = seg(O, 20.08, sitT), e = endPos(P, 1); const seatY = e.y - 0.52;
  if (O < 20.08) { h.root.position.set(lerp(5.3, 4.35, eOut(walkK)), 0, 0.6); const ant = seg(O, 19.95, 20.08); pose(h, walkK < 1 ? walk(O, 7, 0.8) : { bob: -0.14 * ant, legs: [[0.3 * ant, 0.6 * ant], [0.3 * ant, 0.6 * ant]], arms: [[0.5 * ant, 0, 0.2, 0.2], [0.5 * ant, 0, -0.2, 0.2]] }); h.face('smile', O); }
  else if (O < sitT) { h.root.position.set(lerp(4.35, e.x + 0.1, hop), lerp(0, seatY, hop) + 0.75 * Math.sin(hop * Math.PI), 0.6); pose(h, { bob: -0.38 * hop, legs: [[1.45 * hop, -1.5 * hop], [1.45 * hop, -1.5 * hop]], arms: [[-1.6, 0, 0.5, 0.3], [-1.6, 0, -0.5, 0.3]] }); h.face('smile', O); }
  else { const b = Math.exp(-(O - sitT) * 6) * Math.sin((O - sitT) * 16) * 0.08; h.root.position.set(e.x + 0.1, seatY + b, 0.6); const up = eOut(seg(O, sitT + 0.1, sitT + 0.4)); pose(h, { ...SEATED, headX: -0.75 * up, spineX: -0.1 * up, arms: [[-0.4, 0, 0.6, 0.5], [-0.4, 0, -0.6, 0.5]] }); h.face('shock', O); }
  if (O < sitT) strangerSit(O); else { const dt = O - sitT; s.root.visible = true; const e0 = endPos({ plank: { rotation: { z: 0.2 } } }, -1); s.root.position.set(e0.x - 1.2 * dt, e0.y - 0.56 + 44 * dt - 6 * dt * dt, 0.6); s.root.rotation.set(0, Math.PI / 2, 0); s.root.rotateX(-dt * 9);
    pose(s, { legs: [[0.6 + Math.sin(O * 30) * 0.5, 0.7], [-0.3 + Math.cos(O * 30) * 0.5, 0.5]], arms: [[-2.6 + Math.sin(O * 34) * 0.5, 0, -0.6, 0.2], [-2.6 + Math.cos(O * 31) * 0.5, 0, 0.6, 0.2]] }); s.face('shock', O, true); burst(P.deb.slice(0, 8), O, sitT, V([0.3, 0.3, 0.6]), 1.2, 1.4); }
}, { grade: 'park', shakeAt: [[sitT, 0.07]], mblur: (O) => O > 20.36 && O < 20.9 ? 6 : 1 });
shot(20.9, 22.4, 'park', { p0: [2.8, 1.3, 5.6], p1: [2.2, 1.3, 5.0], l0: [1.9, 6.5, -3], l1: [0.9, 19, -6], fov: 50, z1: 1.3, roll0: -4, roll1: 5, ease: 'lin' }, (lt, O) => {   // into the sky
  const P = S.park; parkBase(O); P.hero.root.visible = false; const s = P.stranger; const k = seg(O, 20.9, 22.15); s.root.visible = k < 1; const kk = 1 - Math.pow(1 - k, 2);
  s.root.position.set(lerp(2.1, 0.9, k), lerp(4.6, 26, k), lerp(0.6, -9, k)); s.root.scale.setScalar(lerp(1.5, 0.25, k)); s.root.rotation.set(O * 7, 1.2, O * 3);
  pose(s, { legs: [[0.6 + Math.sin(O * 30) * 0.5, 0.7], [-0.3 + Math.cos(O * 30) * 0.5, 0.5]], arms: [[-2.6 + Math.sin(O * 34) * 0.5, 0, -0.6, 0.2], [-2.6 + Math.cos(O * 31) * 0.5, 0, 0.6, 0.2]] }); s.face('shock', O, true);
  const tw = seg(O, 22.15, 22.4); P.star.visible = O >= 22.15; P.star.position.set(0.9, 26, -9); P.star.scale.setScalar(0.4 + 3.2 * Math.sin(tw * Math.PI) + 0.3 * tw); P.star.material.rotation = O * 3;
}, { grade: 'park' });
shot(22.4, 23.8, 'park', { p0: [2.9, 1.75, 4.4], p1: [3.0, 1.72, 4.0], l0: [4.1, 1.45, 0.6], fov: 36 }, (lt, O) => {
  const P = S.park; parkBase(O); const h = P.hero; h.setYams(3.2); const e = endPos(P, 1); h.root.position.set(e.x + 0.1, e.y - 0.52, 0.6); h.root.rotation.y = -Math.PI / 2 + 1.25; const tk = talking('hero', O);
  pose(h, { ...SEATED, headX: -0.5 + 0.06 * Math.sin(O * 3), headY: -0.2, spineX: -0.08, arms: [[-0.4, 0, 0.5, 0.4], [-2.35, 0, -0.75, 2.0]] }); h.face('worried', O, tk);
  P.star.visible = O < 22.75; P.star.position.set(0.9, 26, -9); P.star.scale.setScalar(0.6 * (1 - seg(O, 22.4, 22.75)) + 0.01);
}, { grade: 'park', dof: 0.5 });

// ===== DAY 5: listed on the map =====
const HP = [4.3, 0, 1.6];
shot(23.8, 25.5, 'park', { p0: [4.3, 12, 8.4], p1: [4.3, 19, 10.4], l0: [4.3, 0, 3.8], fov: 44, ease: 'out' }, (lt, O) => {
  const P = S.park; parkBase(O, { plank: -0.2 }); const h = P.hero; popYams(h, O, 23.85, 3.2, 5.0); h.root.position.set(...HP); h.root.rotation.y = Math.PI; pose(h, { ...idle(O), headX: -0.5, arms: [[0, 0, -0.6, 0.3], [0, 0, 0.6, 0.3]] }); h.face('shock', O);
}, { grade: 'park', flash: 23.8, map: true, dark: () => 0.1 });
shot(25.5, 27.2, 'park', { p0: [4.9, 1.9, 5.6], p1: [4.75, 1.85, 5.1], l0: [4.3, 1.6, 1.6], fov: 36 }, (lt, O) => {
  const P = S.park; parkBase(O, { plank: -0.2 }); const h = P.hero; h.setYams(5.0); h.root.position.set(...HP); h.root.rotation.y = 0.2; P.phone.visible = true; const up = eOut(seg(O, 25.6, 25.8)); const tk = talking('hero', O);
  pose(h, { ...idle(O), headX: 0.42 * (1 - up) - 0.05 * up, headY: 0.25 * (1 - up), arms: [[-0.5, 0, 0.3, 1.3 + 0.1 * Math.sin(O * 14) * (1 - up)], [-0.75 - 0.25 * up, 0, -0.3 - 0.3 * up, 1.75]] }); h.face(up > 0.5 ? 'confused' : 'calm', O, tk);
}, { grade: 'park', dof: 0.5 });

// ===== MONTAGE: tourist photos =====
const tourPose = { peace: (O) => ({ ...idle(O), arms: [[-1.5, 0, 0.3, 0.25], [-2.4, 0, -0.5, 0.9]] }), lift: (O) => ({ ...idle(O), spineX: -0.1, arms: [[-2.95, 0, -0.5, 0.1], [-2.95, 0, 0.5, 0.1]] }), jump: (O) => ({ bob: 0.25 + 0.2 * Math.abs(Math.sin(O * 9)), legs: [[0.3, 0.9], [0.3, 0.9]], arms: [[-2.7, 0, -0.7, 0.1], [-2.7, 0, 0.7, 0.1]] }), snap: (O) => ({ ...idle(O), arms: [[-1.45, 0, 0.35, 1.5], [-1.45, 0, -0.35, 1.5]] }) };
const mCuts = [
  { cam: { p0: [5.3, 1.8, 7.4], l0: [4.6, 1.75, 1.6], fov: 40 }, cap: 'Twin Hills!!', rot: -0.045, t: [[0, 5.0, 4.6, 0.15, 'peace', 'laugh']] },
  { cam: { p0: [1.7, 1.3, 9.0], l0: [3.0, 2.0, 1.6], fov: 40 }, cap: 'so strong', rot: 0.04, t: [[1, 2.4, 5.0, 0.4, 'lift', 'laugh']] },
  { cam: { p0: [4.3, 1.6, 9.8], l0: [4.3, 1.9, 1.6], fov: 42 }, cap: 'best trip ever', rot: -0.03, t: [[0, 3.6, 4.6, 0, 'jump', 'laugh'], [2, 5.0, 4.6, 0, 'jump', 'laugh']] },
  { cam: { p0: [4.7, 1.9, 4.4], l0: [4.3, 1.68, 1.6], fov: 36 }, cap: 'the owner (shy)', rot: 0.05, hero: 'front', t: [[1, 5.5, 2.3, -0.5, 'snap', 'smile']] },
  { cam: { p0: [4.3, 2.6, 12.5], l0: [4.3, 2.0, 1.6], fov: 40 }, cap: 'wish you were here', rot: -0.02, post: true, t: [[0, 2.0, 5.0, 2.6, 'snap', 'smile'], [1, 3.4, 6.0, 3.0, 'peace', 'smile'], [2, 6.4, 5.4, 3.4, 'snap', 'smile']] },
];
mCuts.forEach((m, i) => { const t0 = MONTAGE[0] + i * 0.72, t1 = i === mCuts.length - 1 ? MONTAGE[1] : t0 + 0.72;
  shot(t0, t1, 'park', { ...m.cam, z0: 1, z1: 1.1, ease: 'lin' }, (lt, O) => { const P = S.park; parkBase(O, { plank: -0.2 }); const h = P.hero; h.setYams(5.0); h.root.position.set(...HP);
    if (m.hero === 'front') { h.root.rotation.y = 0.25; pose(h, { ...idle(O), headY: -0.3, arms: [[-0.6, 0, 0.7, 1.5], [-0.6, 0, -0.7, 1.5]] }); h.face('worried', O); } else { h.root.rotation.y = Math.PI * 0.92; pose(h, { ...idle(O), headY: 1.0 + 0.1 * Math.sin(O * 5) }); h.face('worried', O); }
    m.t.forEach(([j, x, z, ry, ps, fc]) => { const t = P.tour[j]; t.root.visible = true; t.root.position.set(x, 0, z); t.root.rotation.y = ry; pose(t, tourPose[ps](O + j)); t.face(fc, O); });
  }, { grade: 'park', flash: t0, hideStat: true, live: 1.4, pol: { cap: m.cap, rot: m.rot, post: m.post } }); });

// ===== DAY 6: ski resort =====
function lobeC(h, i) { return wp(h.lobes[i]); }
function skiBase(O, s) { const K = S.ski, h = K.hero; resetRig(h); h.setYams(s); h.caps.forEach(c => c.visible = true); K.snow(O); const R = 0.2 * s; h.root.updateMatrixWorld(true);
  K.skiers.forEach((g, j) => { const i = j % 2; const C = lobeC(h, i); const ph = (O * 0.42 + j * 0.137) % 1; const f = (p) => { const phi = 0.3 + p * 1.15, az = (i ? -0.25 : 0.25) + Math.sin(p * 9 + j * 2) * 0.42; return V([C.x + R * Math.sin(phi) * Math.sin(az), C.y + R * 0.95 * Math.cos(phi), C.z + R * 0.9 * Math.sin(phi) * Math.cos(az)]); };
    const p = f(ph), q = f(ph + 0.02); g.position.copy(p); g.lookAt(q); g.visible = s > 8 && ph < 0.97; g.userData.p = p; });
  K.cabin.position.copy(lobeC(h, 0)).add(V([0.2, R * 0.93, R * 0.2])); K.cabin.visible = s > 8; K.flags.forEach((f, k) => { const i = k % 2, C = lobeC(h, i), phi = 0.45 + Math.floor(k / 2) * 0.3, az = (i ? 0.55 : -0.55); f.position.set(C.x + R * Math.sin(phi) * Math.sin(az), C.y + R * 0.95 * Math.cos(phi), C.z + R * 0.9 * Math.sin(phi) * Math.cos(az)); f.visible = s > 8; f.rotation.z = 0.1 * Math.sin(O * 6 + k); });
  K.puffs.forEach(p => p.visible = false); }
const shiver = (O) => Math.sin(O * 41) * 0.012;
shot(30.8, 33.0, 'ski', { p0: [0, 2.0, 7.5], p1: [0, 3.6, 16], l0: [0, 2.6, -1.4], fov: 46, ease: 'io' }, (lt, O) => {
  const K = S.ski; skiBase(O, lerp(5, 13, elastic(seg(O, 30.85, 31.75)))); const h = K.hero; const cold = seg(O, 31.6, 32.2); h.root.position.x = shiver(O) * cold;
  pose(h, { ...idle(O), headY: 0.9 * eIO(seg(O, 31.9, 32.4)), arms: [[-0.9 * cold, 0, 0.13 + 0.8 * cold, 0.15 + 1.75 * cold], [-0.9 * cold, 0, -0.13 - 0.8 * cold, 0.15 + 1.75 * cold]] }); h.face(O < 31.6 ? 'shock' : 'worried', O);
}, { grade: 'ski', flash: 30.8 });
shot(33.0, 34.0, 'ski', { pf: () => CAMP, lf: () => CAML, fov: 44 }, (lt, O) => {
  const K = S.ski; skiBase(O, 13); const h = K.hero; pose(h, idle(O)); h.face('worried', O); const g = K.skiers[3]; const p = g.userData.p; CAML = p.clone().add(V([0, 0.25, 0])); CAMP = p.clone().add(V([1.6, 0.9, 3.4]));
}, { grade: 'ski2' });
shot(34.0, 36.4, 'ski', { p0: [0.7, 1.95, 3.9], p1: [0.5, 1.9, 3.3], l0: [0, 1.72, 0], fov: 36 }, (lt, O) => {
  const K = S.ski; skiBase(O, 13); const h = K.hero; const tk = talking('hero', O); h.root.position.x = shiver(O); h.root.rotation.y = 0.1;
  pose(h, { bob: Math.sin(O * 39) * 0.006, spineX: 0.1, spineZ: Math.sin(O * 37) * 0.012, headX: 0.05, headY: 0.35 * Math.sin(seg(O, 34.9, 36.2) * Math.PI), legs: [[0.05, 0.12], [0.05, 0.12]], arms: [[-0.9, 0, 0.93, 1.9], [-0.9, 0, -0.93, 1.9]] }); h.face('grit', O, tk); h.brows[0].rotation.z = 0.35; h.brows[1].rotation.z = -0.35; h.brows.forEach(b => b.position.y = 0.5);
  K.puffs.forEach((p, i) => { const ph = ((O - 34.0) * 0.9 + i * 0.33) % 1; p.visible = tk; p.position.set(0.12 + ph * 0.5, 1.95 + ph * 0.45, 0.45 + ph * 0.6); p.scale.setScalar(0.6 + ph * 2.2); p.material.opacity = 0.45 * (1 - ph); });
}, { grade: 'ski', dof: 0.5 });

// ===== SPACE =====
function spaceBase(O, o = {}) { const P = S.space; const cos = o.cosmic ?? 0;
  P.sc.background.setRGB(lerp(0.02, 0.1, cos), lerp(0.027, 0.06, cos), lerp(0.05, 0.36, cos)); P.nebs.forEach(n => n.material.opacity = 0.38 * cos);
  resetRig(P.hero); P.hero.root.position.set(0, Math.sin(O * 1.3) * 0.08, 0); P.hero.root.rotation.set(0.05, o.heroRot ?? 0.25, Math.sin(O) * 0.04);
  P.earth.visible = o.earth ?? true; P.earth.rotation.y = O * 0.04; P.earth.position.set(0, -22, -8); P.earth.scale.setScalar(1); P.moon.visible = !!o.moon; P.astro.root.visible = false; P.planets.forEach(p => p.visible = !!o.planets);
  P.sunMesh.visible = !!o.sun; P.sunMesh.scale.setScalar(1); P.hearts.forEach(h => h.visible = false); P.bub.update(O, o.bubbles ?? 1); P.ufo.visible = !!o.ufo; P.ticket.visible = false; resetRig(P.girl); P.girl.root.scale.setScalar(0.85); P.girl.root.visible = false;
  P.ufoL.forEach((l, i) => l.material.emissiveIntensity = 1.2 + 1.5 * (Math.sin(O * 9 + i * 0.63) > 0 ? 1 : 0)); }
function floatPose(O, extra = {}) { return { bob: 0, legs: [[0.25 + 0.1 * Math.sin(O * 1.7), 0.35], [-0.1 + 0.1 * Math.sin(O * 1.5), 0.2]], arms: [[0, 0, -0.9 - 0.1 * Math.sin(O * 2), 0.3], [0, 0, 0.9 + 0.1 * Math.sin(O * 2.1), 0.3]], headY: Math.sin(O * 0.8) * 0.1, ...extra }; }
const orbitPlanets = (O, R0 = 14) => S.space.planets.forEach((p, i) => { const a = O * (0.5 + i * 0.07) + i * 0.9, R = R0 + i * 2.2, zz = Math.sin(a) * R * 0.7; p.position.set(Math.cos(a) * R, Math.sin(a * 1.3) * 2.5 + 8, -Math.abs(zz) - 14); p.rotation.y = O * 0.5 + i; });
// DAY 7 — the eclipse
shot(36.4, 38.0, 'space', { p0: [0, 1, 10], p1: [0, 1.2, 8.5], l0: [0, 6.6, -90], fov: 30, z1: 1.4, roll0: -5, roll1: 5, ease: 'lin', live: 3 }, (lt, O) => {
  const P = S.space; spaceBase(O, { sun: true }); P.sunMesh.position.set(0, 7, -90); P.sunMesh.scale.setScalar(1.15); P.sunMesh.rotation.set(0, O * 0.2, 0);
  popYams(P.hero, O, 36.45, 13, 26, 0.9); P.hero.root.position.set(lerp(-17, -0.5, eOut(seg(O, 36.4, 37.6))) + 3.0 * seg(O, 37.1, 38.0), 0.55 + Math.sin(O * 1.3) * 0.1, -70); P.hero.root.rotation.set(0, Math.PI, 0); pose(P.hero, floatPose(O)); P.hero.face('shock', O);
}, { grade: 'space', flash: 36.4, bloom: 0.3, dark: (O) => 0.42 * eIO(seg(O, 37.0, 37.7)) });
function eclipseCrowd(O, back) { const M = S.market; const sl = [[-2.6, 2.4], [-1.5, 3.1], [1.6, 2.9], [2.7, 2.2], [-3.6, 3.4], [3.7, 3.3], [-0.9, 1.7], [1.0, 1.6]];
  sl.forEach(([x, z], i) => { const p = M.crowd[i]; p.root.visible = true; p.root.position.set(x, 0, z); p.root.rotation.y = 0.1 * Math.sin(i * 3); p.glasses.visible = true; pose(p, { ...idle(O, i), headX: -0.62, headY: 0, arms: i % 3 === 0 ? [[-2.5, 0, 0.3, 1.9], [0, 0, -0.13, 0.15]] : undefined }); p.face('shock', O); });
  const k = M.kid; k.root.visible = true; k.root.position.set(0.05, 0, 3.7); const tk = talking('kid', O); pose(k, { ...idle(O, 3), headX: -0.6, headY: 0.3 * Math.sin(O * 2.2) * (tk ? 1 : 0.3), arms: [[-2.75 + 0.06 * Math.sin(O * 12), 0, -0.7, 0.05], [0, 0, 0.15, 0.2]] }); k.face(tk ? 'laugh' : 'shock', O, tk); }
shot(38.0, 39.6, 'market', { p0: [1.0, 1.0, 7.4], p1: [0.8, 1.0, 6.7], l0: [0.05, 1.1, 3.7], fov: 40 }, (lt, O) => { marketBase(O, { bus: false }); S.market.hero.root.visible = false; eclipseCrowd(O); }, { grade: 'eclipse' });
shot(39.6, 40.8, 'market', { p0: [0.9, 1.3, -2.2], p1: [-0.3, 1.4, -1.2], l0: [0, 8, 20], l1: [0, 12, 20], fov: 50, z1: 1.2, roll0: 3, roll1: -3, ease: 'lin', live: 2.5 }, (lt, O) => { marketBase(O, { bus: false }); S.market.hero.root.visible = false; eclipseCrowd(O); S.market.ecl.visible = true; S.market.ecl.children[0].scale.setScalar(62 + 4 * Math.sin(O * 5)); }, { grade: 'eclipse' });
// DAY 8 — the parking ticket
const ufoPos = (O) => { const k = seg(O, 40.95, 41.75); const e = elastic(k); return V([lerp(26, 6.0, e), lerp(30, 14.5, e) + Math.sin(O * 2.6) * 0.25, lerp(16, 9, e)]); };
function ufoSet(O) { const P = S.space; P.ufo.position.copy(ufoPos(O)); P.ufo.rotation.set(0.08 * Math.sin(O * 2.1), O * 1.2, 0.1 * Math.sin(O * 1.7)); const A = P.alien; A.root.rotation.y = -O * 1.2 + 0.1; const tk = talking('alien', O);
  pose(A, { ...idle(O), headY: 0.1 * Math.sin(O * 1.5), arms: [[-1.2, 0, 0.35, 1.3], [-1.1 + 0.12 * Math.sin(O * 16), 0, -0.45, 1.5]] }); A.face('calm', O, tk); A.glasses.visible = true; }
function ticketSet(O, s) { const P = S.space; if (O < 43.5) return; P.ticket.visible = true; const C = lobeC(P.hero, 1), R = 0.2 * s; const n = V([0.25, 0.42, 0.87]).normalize(); const k = seg(O, 43.5, 43.58), e = elastic(seg(O, 43.58, 44.1));
  P.ticket.position.copy(C).add(n.clone().multiplyScalar(R * (1.01 + 1.6 * (1 - k)))); P.ticket.lookAt(P.ticket.position.clone().add(n)); P.ticket.rotateZ(-0.18); P.ticket.scale.setScalar(k < 1 ? 1.3 : 1.25 - 0.25 * e); }
shot(40.8, 42.0, 'space', { p0: [0, 6, 44], p1: [0, 6.5, 40], l0: [0, 7.5, -2], fov: 46, ease: 'out' }, (lt, O) => {
  const P = S.space; spaceBase(O, { planets: true, earth: false, cosmic: 1, ufo: true }); popYams(P.hero, O, 40.85, 26, 34, 0.9); pose(P.hero, floatPose(O, { headY: 0.5 * seg(O, 41.3, 41.7), headX: -0.3 * seg(O, 41.3, 41.7) })); P.hero.face('shock', O); orbitPlanets(O); ufoSet(O);
}, { grade: 'cosmic', flash: 40.8, bloom: 0.22, mblur: (O) => O > 40.95 && O < 41.5 ? 5 : 1 });
shot(42.0, 43.55, 'space', { pf: () => CAMP, lf: () => CAML, fov: 30 }, (lt, O) => {
  const P = S.space; spaceBase(O, { planets: true, earth: false, cosmic: 1, ufo: true }); P.hero.setYams(34); pose(P.hero, floatPose(O)); P.hero.face('worried', O); orbitPlanets(O); ufoSet(O); P.ufo.rotation.y = 0.15 * Math.sin(O * 0.9); P.alien.root.rotation.y = 0.1;
  const u = P.ufo.position; CAML = u.clone().add(V([0, 0.55, 0])); CAMP = u.clone().add(V([lerp(1.0, 0.7, lt), 1.35, lerp(6.0, 5.2, eOut(lt))]));
}, { grade: 'cosmic', bloom: 0.22 });
shot(43.55, 44.4, 'space', { p0: [9, 9, 30], p1: [8.6, 8.8, 27.5], l0: [5.5, 9.5, 0], fov: 44 }, (lt, O) => {
  const P = S.space; spaceBase(O, { planets: true, earth: false, cosmic: 1, ufo: true }); P.hero.setYams(34); pose(P.hero, floatPose(O, { headY: 0.9, headX: -0.4 })); P.hero.face('shock', O, talking('hero', O)); orbitPlanets(O); ufoSet(O); ticketSet(O, 34);
}, { grade: 'cosmic', bloom: 0.22, shakeAt: [[43.58, 0.06]] });
shot(44.4, 45.8, 'space', { p0: [1.3, 2.0, 4.6], p1: [1.0, 1.95, 4.0], l0: [0.1, 1.72, 0], fov: 38 }, (lt, O) => {
  const P = S.space; spaceBase(O, { planets: true, earth: false, cosmic: 1, ufo: true, heroRot: 0.35 }); P.hero.setYams(34); const tk = talking('hero', O);
  pose(P.hero, floatPose(O, { arms: [[-0.9, 0, -0.75 - 0.1 * Math.sin(O * 9), 1.25], [-0.9, 0, 0.75 + 0.1 * Math.sin(O * 9), 1.25]], headY: -0.15, headX: -0.05 })); P.hero.face(tk ? 'confused' : 'worried', O, tk); orbitPlanets(O); ufoSet(O); ticketSet(O, 34);
  const fl = eIn(seg(O, 45.0, 45.8)); P.ufo.position.add(V([30 * fl, 40 * fl, -20 * fl]));
}, { grade: 'cosmic', bloom: 0.22, dof: 0.4 });
// DAY 9 — a chair his size
const sitE = 49.3, YS = 48;
function day9(O, o = {}) { const P = S.space; spaceBase(O, { planets: false, earth: true, cosmic: 0.55, heroRot: 0, moon: true }); const h = P.hero; popYams(h, O, 45.85, 34, YS, 0.9);
  const drop = eIn(seg(O, 48.75, sitE)), set = elastic(seg(O, sitE, sitE + 0.9)); const y = -7.0 * drop - 4.6 * set; h.root.position.set(0, y + Math.sin(O * 1.3) * 0.06 * (1 - drop), 0); h.root.rotation.set(0, 0, 0);
  const sq = set; P.earth.position.set(0, -15.5, -8.6); const jel = O > sitE ? 0.035 * Math.sin((O - sitE) * 7) * Math.exp(-(O - sitE) * 0.35) : 0; P.earth.scale.set(0.6 * (1 + 0.28 * sq + jel), 0.6 * (1 - 0.47 * sq - jel), 0.6 * (1 + 0.28 * sq + jel));
  const a = O * 0.5 - 0.9; P.moon.position.set(Math.cos(a) * 15, -6 + Math.sin(a * 1.7) * 1.0, 14 + Math.sin(a) * 6); P.moon.rotation.y = O * 0.1;
  const g = P.girl; g.root.visible = true; g.root.position.copy(P.moon.position).add(V([0, 1.52, 0])); g.root.rotation.y = o.girlRot ?? Math.atan2(-g.root.position.x, -g.root.position.z);
  const sh = shouting('stranger', O); pose(g, { ...idle(O, 1), headY: o.girlHead ?? 0, headX: sh ? -0.15 : 0.05, arms: sh ? [[-0.4, 0, -1.2, 0.6], [-0.4, 0, 1.2, 0.6]] : [[-0.75, 0, 0.5, 1.75], [-0.75, 0, -0.5, 1.75]] }); g.face(sh ? 'shock' : 'confused', O, sh);
  if (sh) { g.mLine.visible = false; g.cL.visible = g.cR.visible = false; g.mO.visible = true; g.mO.scale.set(1.25, 1.5 + 0.15 * Math.sin(O * 30), 1); }
  const seated = seg(O, 48.6, sitE); const tk = talking('hero', O); const relax = eOut(seg(O, sitE + 0.3, sitE + 0.9));
  pose(h, { bob: 0, legs: [[lerp(0.25, 1.35, seated), lerp(0.35, -0.5, seated)], [lerp(-0.1, 1.35, seated), lerp(0.2, -0.5, seated)]], spineX: -0.22 * relax, headX: lerp(0.45 * seg(O, 46.6, 47.2) * (1 - seg(O, 47.6, 48.0)), -0.1, relax), headY: 0.1 * Math.sin(O * 0.8),
    arms: [[lerp(0, -2.75, relax), 0, lerp(0.9, -0.55, relax), lerp(0.3, 2.3, relax)], [lerp(0, -2.75, relax), 0, lerp(-0.9, 0.55, relax), lerp(0.3, 2.3, relax)]] });
  h.face(O < 47.6 ? 'shock' : O < sitE ? 'smirk' : 'smile', O, tk); return y; }
shot(45.8, 48.6, 'space', { p0: [8, 10, 102], p1: [-7, 3, 88], l0: [0, 0, -4], fov: 46, z0: 1.7, z1: 1.0, roll0: 9, roll1: -4, ease: 'lin', live: 3 }, (lt, O) => { day9(O); }, { grade: 'space2', bloom: 0.16, flash: 45.8 });
shot(48.6, 51.6, 'space', { p0: [-4, 2, 88], p1: [5, -4, 66], l0: [0, -5, -5], fov: 46, roll0: -3, roll1: 2, ease: 'lin', live: 3 }, (lt, O) => { day9(O); }, { grade: 'space2', bloom: 0.16, shakeAt: [[sitE, 0.09]] });
shot(51.6, 53.6, 'space', { pf: () => CAMP, lf: () => CAML, fov: 36 }, (lt, O) => { const y = day9(O); CAML = V([0, y + 1.78, 0]); CAMP = V([lerp(1.3, 1.0, lt), y + 2.0, lerp(4.8, 4.1, eOut(lt))]); }, { grade: 'space2', bloom: 0.14, dof: 0.45 });
shot(53.6, 54.6, 'space', { pf: () => CAMP, lf: () => CAML, fov: 40 }, (lt, O) => { day9(O, { girlHead: 0.0 }); const m = S.space.moon.position; CAML = m.clone().lerp(V([0, -9, -8]), 0.3).add(V([0, 1.5, 0])); CAMP = m.clone().add(V([lerp(5.5, 4.6, eOut(lt)), 4.2, 11])); }, { grade: 'space2', bloom: 0.14 });
shot(54.6, DUR, 'space', { pf: () => CAMP, lf: () => CAML, fov: 34 }, (lt, O) => { day9(O, { girlRot: 0.2 }); const hd = wp(S.space.girl.head).add(V([0, 0.3, 0])); CAML = hd.clone(); CAMP = hd.clone().add(V([lerp(0.9, 0.6, lt), 0.2, lerp(4.4, 3.2, eOut(lt))])); }, { grade: 'space2', bloom: 0.14, dof: 0.4, shakeAt: [[54.8, 0.04]] });

// ---------------------------------------------------------------- 2D overlays
function stepAt(T) { let s = null; for (const st of STEPS) if (T >= st.t) s = st; return s; }
function spaced(g, text, x, y, sp) { let cx = x; for (const ch of text) { g.fillText(ch, cx, y); cx += g.measureText(ch).width + sp; } return cx - x; }
const measC = mk(10, 10).getContext('2d');
function drawStat(T, sh) {
  const s = stepAt(T); if (!s || sh.hideStat) return; const g = ctx, x = 30; g.save();
  g.shadowColor = 'rgba(0,0,0,0.55)'; g.shadowBlur = 14; g.shadowOffsetY = 2; g.fillStyle = '#fff'; g.textAlign = 'left';
  g.font = '600 30px InterW'; spaced(g, 'YAMS LEVEL', x, 288, 4.5);
  const dt = (T - s.t) * 30; const sc = dt < 5 ? (dt < 2.5 ? 1 + 0.06 * dt / 2.5 : 1.06 - 0.06 * (dt - 2.5) / 2.5) : 1;
  g.save(); g.translate(x, 412); g.scale(sc, sc); g.font = '500 128px Lora'; g.fillText(s.v.toLocaleString('en-US'), 0, 0); g.restore();
  g.font = '600 27px InterW'; spaced(g, s.cmp, x, 462, 3.6);
  g.font = '600 25px InterW'; g.globalAlpha = 0.9; spaced(g, 'DAY ' + s.day, x, 502, 3.2); g.globalAlpha = 1;
  g.shadowBlur = 0; g.shadowOffsetY = 0; g.font = '700 25px InterW'; measC.font = '700 25px InterW'; const tw = spaced(measC, '×2 EVERY DAY', 0, 0, 2.5);
  rr(g, x, 520, tw + 26, 42, 3); g.fillStyle = '#E21E39'; g.fill(); g.fillStyle = '#fff'; spaced(g, '×2 EVERY DAY', x + 13, 550, 2.5); g.restore();
}
function drawTitle(O) {
  if (O < TITLE.t0 || O >= TITLE.t1) return;
  const a = eOut(clamp((O - TITLE.t0) / 0.45)) * clamp((TITLE.t1 - O) / 0.3), rise = (1 - eOut(clamp((O - TITLE.t0) / 0.7))) * 40;
  const g = ctx; g.save(); g.globalAlpha = a; g.textAlign = 'center';
  const wash = g.createLinearGradient(0, 120, 0, 900); wash.addColorStop(0, 'rgba(6,20,40,0.5)'); wash.addColorStop(1, 'rgba(6,20,40,0)'); g.fillStyle = wash; g.fillRect(0, 0, W, 900);
  g.translate(0, rise); g.shadowColor = 'rgba(0,0,0,0.45)'; g.shadowBlur = 30; g.shadowOffsetY = 4; g.fillStyle = '#fff';
  g.font = '500 104px Playfair'; g.fillText('What if your', W / 2, 380);
  g.font = 'italic 500 236px Playfair'; g.fillStyle = '#e9fbff'; g.fillText('yams', W / 2, 600);
  g.fillStyle = '#fff'; g.font = '500 104px Playfair'; g.fillText('doubled every day?', W / 2, 735);
  g.shadowBlur = 0; g.shadowOffsetY = 0; g.globalAlpha = a * 0.85; g.fillStyle = '#E21E39'; g.fillRect(W / 2 - 70, 780, 140, 6); g.restore();
}
function cueAt(O) { let best = null; for (const c of DIALOGUE) if (spanHit(c, O) && O >= c.words[0].t - 0.03) if (!best || c.spans[0][0] > best.spans[0][0]) best = c; return best; }
function strokeText(g, text, x, y, sw) { g.lineJoin = 'round'; g.miterLimit = 2; g.lineWidth = sw; g.strokeStyle = '#000'; g.strokeText(text, x, y); g.fillText(text, x, y); }
function captionChunk(c, O) { const chunks = []; let cur = []; c.words.forEach((w, i) => { cur.push(w); if (cur.length >= 3 || /[.!?…,]$/.test(w.w) || i === c.words.length - 1) { chunks.push(cur); cur = []; } });
  let chunk = chunks[0]; for (const ch of chunks) if (O >= ch[0].t - 0.03) chunk = ch; return chunk.filter(w => O >= w.t - 0.03).map(w => w.w.toUpperCase()).join(' '); }
function drawCaptions(O) {
  const c = cueAt(O); if (!c) return; const g = ctx; g.save(); g.textAlign = 'center'; g.fillStyle = '#fff';
  if (c.kind === 'shout') { const k = O - c.words[0].t; const s = k < 0.12 ? 0.6 + 4 * k : 1 + 0.04 * Math.sin(O * 50); const txt = c.words.map(w => w.w).join(' ');
    g.translate(W / 2 + Math.sin(O * 73) * 6, H * 0.6 + Math.cos(O * 61) * 5); g.scale(s, s); g.rotate(Math.sin(O * 9) * 0.03);
    let fs = 118; g.font = `800 ${fs}px Montserrat`; while (g.measureText(txt).width > W * 0.84 && fs > 60) { fs -= 4; g.font = `800 ${fs}px Montserrat`; }
    g.shadowColor = 'rgba(0,0,0,0.45)'; g.shadowBlur = 20; strokeText(g, txt, 0, 0, 16); g.restore(); return; }
  const shown = captionChunk(c, O); if (!shown) { g.restore(); return; }
  let fs = 78; g.font = `800 ${fs}px Montserrat`; while (g.measureText(shown).width > W * 0.82 && fs > 44) { fs -= 3; g.font = `800 ${fs}px Montserrat`; }
  const nm = { hero: null, stranger: 'STRANGER', conductor: 'CONDUCTOR', announcer: 'RESORT P.A.', kid: 'KID', alien: 'SPACE TRAFFIC WARDEN' }[c.speaker];
  strokeText(g, shown, W / 2, H * 0.62, 12); if (nm) { g.font = '700 30px InterW, "Noto Color Emoji"'; g.globalAlpha = 0.85; strokeText(g, nm, W / 2, H * 0.62 - fs - 8, 6); }
  g.restore();
}
function drawMap(O) {      // the yams get listed on a (generic) map app
  const a = eOut(seg(O, 24.2, 24.5)); if (a <= 0) return; const g = ctx; g.save(); g.globalAlpha = 0.14 * a; g.fillStyle = '#dfe9d8'; g.fillRect(0, 0, W, H); g.globalAlpha = a;
  g.shadowColor = 'rgba(0,0,0,0.28)'; g.shadowBlur = 22; g.shadowOffsetY = 5; rr(g, 40, 130, W - 80, 100, 50); g.fillStyle = '#fff'; g.fill(); g.shadowBlur = 0; g.shadowOffsetY = 0;
  g.strokeStyle = '#5f6368'; g.lineWidth = 6; g.beginPath(); g.arc(104, 178, 17, 0, 7); g.stroke(); g.beginPath(); g.moveTo(117, 191); g.lineTo(131, 205); g.stroke(); g.fillStyle = '#3c4043'; g.font = '600 42px InterW'; g.textAlign = 'left'; g.fillText('Twin Hills', 160, 195);
  const pk = seg(O, 24.5, 25.0); if (pk > 0) { const py = lerp(-260, H * 0.4, Math.min(1, pk * 2.4)) - Math.abs(Math.sin(Math.max(0, pk - 0.42) * 11)) * 60 * (1 - pk); const px = W / 2;
    g.save(); g.translate(px, py); g.fillStyle = 'rgba(0,0,0,0.22)'; g.beginPath(); g.ellipse(0, 8 + (H * 0.4 - py) * 0.25, 34, 10, 0, 0, 7); g.fill(); g.shadowColor = 'rgba(0,0,0,0.3)'; g.shadowBlur = 14; g.shadowOffsetY = 4;
    g.fillStyle = '#E8343C'; g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(-78, -92, -70, -176, 0, -176); g.bezierCurveTo(70, -176, 78, -92, 0, 0); g.fill(); g.shadowBlur = 0; g.shadowOffsetY = 0; g.fillStyle = '#fff'; g.beginPath(); g.arc(0, -112, 24, 0, 7); g.fill(); g.restore(); }
  const ck = eOut(seg(O, 24.9, 25.25)); if (ck > 0) { g.save(); g.translate(0, (1 - ck) * 760); g.shadowColor = 'rgba(0,0,0,0.3)'; g.shadowBlur = 40; g.shadowOffsetY = -6; rr(g, 30, 1225, W - 60, 760, 44); g.fillStyle = '#eef0f3'; g.fill(); g.shadowBlur = 0; g.shadowOffsetY = 0;
    g.fillStyle = '#dadce0'; rr(g, W / 2 - 50, 1244, 100, 10, 5); g.fill(); g.fillStyle = '#202124'; g.font = '700 68px InterW'; g.fillText('Twin Hills', 74, 1348);
    g.font = '600 38px InterW'; g.fillStyle = '#5f6368'; g.fillText('4.8', 74, 1412); g.fillStyle = '#fbbc04'; for (let i = 0; i < 5; i++) { const sx = 172 + i * 46, sy = 1398; g.beginPath(); for (let k = 0; k < 10; k++) { const r = k % 2 ? 9 : 21, an = -Math.PI / 2 + k * Math.PI / 5; g.lineTo(sx + Math.cos(an) * r, sy + Math.sin(an) * r); } g.fill(); }
    g.fillStyle = '#5f6368'; g.fillText('(2,304)', 410, 1412); g.fillText('Tourist attraction  ·  Open 24 hours', 74, 1472);
    rr(g, 74, 1508, 300, 84, 42); g.fillStyle = '#1a73e8'; g.fill(); g.fillStyle = '#fff'; g.font = '700 36px InterW'; g.fillText('Directions', 132, 1562); g.strokeStyle = '#dadce0'; g.lineWidth = 3; rr(g, 398, 1508, 190, 84, 42); g.stroke(); rr(g, 612, 1508, 200, 84, 42); g.stroke(); g.fillStyle = '#1a73e8'; g.fillText('Save', 450, 1562); g.fillText('Share', 662, 1562);
    g.fillStyle = '#e8eaed'; g.fillRect(74, 1626, W - 148, 3); g.fillStyle = '#8ab4f8'; g.beginPath(); g.arc(118, 1706, 40, 0, 7); g.fill(); g.fillStyle = '#fff'; g.font = '700 40px InterW'; g.fillText('T', 105, 1720);
    g.fillStyle = '#202124'; g.font = '600 38px InterW'; g.fillText('“Very round. Would climb again.”', 184, 1700); g.fillStyle = '#5f6368'; g.font = '600 30px InterW'; g.fillText('Tunde  ·  Local Guide  ·  2 days ago', 184, 1750); g.restore(); }
  g.restore();
}
function drawPolaroid(p, O, lt) {     // montage: the graded frame becomes a tourist snapshot
  tctx.setTransform(RS, 0, 0, RS, 0, 0); tctx.clearRect(0, 0, W, H); tctx.drawImage(out, 0, 0, W, H);
  const g = ctx; g.save(); const bg = g.createLinearGradient(0, 0, W, H); bg.addColorStop(0, '#39b6e0'); bg.addColorStop(1, '#0f6ea6'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
  g.globalAlpha = 0.16; g.fillStyle = '#fff'; for (let i = 0; i < 9; i++) { g.beginPath(); g.arc((i * 331 + O * 40) % (W + 200) - 100, (i * 587 - O * 55 + 4000) % (H + 200) - 100, 50 + (i % 4) * 34, 0, 7); g.fill(); } g.globalAlpha = 1;
  const s = 0.9 + 0.045 * eOut(Math.min(1, lt * 2.2)) + 0.045 * lt; g.translate(W / 2, H * 0.47); g.rotate(p.rot * (1 + 0.5 * (1 - eOut(Math.min(1, lt * 2.5))) - 0.6 * lt)); g.scale(s, s);
  const fw = 860, fh = 1240, iw = 780, ih = 960; g.shadowColor = 'rgba(0,20,40,0.45)'; g.shadowBlur = 60; g.shadowOffsetY = 24; g.fillStyle = '#ecebe4'; rr(g, -fw / 2, -fh / 2, fw, fh, 10); g.fill(); g.shadowBlur = 0; g.shadowOffsetY = 0;
  const srcH = W * ih / iw; g.drawImage(tmpC, 0, (H * 0.47 - srcH / 2) * RS, W * RS, srcH * RS, -iw / 2, -fh / 2 + 40, iw, ih);
  if (p.post) { g.fillStyle = '#fff'; g.textAlign = 'center'; g.shadowColor = 'rgba(0,0,0,0.5)'; g.shadowBlur = 16; g.font = '700 30px InterW'; spaced(g, 'GREETINGS FROM', -150, -fh / 2 + 150, 6); g.font = 'italic 500 150px Playfair'; g.fillText('Twin Hills', 0, -fh / 2 + 290); g.shadowBlur = 0; }
  g.fillStyle = '#16324a'; g.textAlign = 'center'; g.font = 'italic 500 72px Playfair'; g.fillText(p.cap, 0, fh / 2 - 92); g.restore();
}
function drawNews(O) {
  const g = ctx; const k = eOut(clamp((O - 30.95) / 0.25)); g.save(); g.translate(lerp(-900, 0, k), 0);
  rr(g, 40, 1250, 300, 64, 10); g.fillStyle = '#E21E39'; g.fill(); g.fillStyle = '#fff'; g.font = '700 34px InterW'; spaced(g, 'BREAKING', 64, 1294, 3);
  const gl = g.createLinearGradient(0, 1314, 0, 1442); gl.addColorStop(0, '#ffffff'); gl.addColorStop(1, '#d8f3ff'); rr(g, 40, 1314, 880, 128, 12); g.fillStyle = gl; g.fill();
  g.fillStyle = '#0b2a5a'; g.font = '700 40px InterW'; g.fillText('LOCAL MAN’S YAMS BLOCK', 64, 1366); g.fillText('4 LANES OF TRAFFIC', 64, 1418);
  rr(g, 40, 1448, 880, 50, 10); g.fillStyle = '#0b2a5a'; g.fill(); g.fillStyle = '#fff'; g.font = '600 26px InterW';
  const tick = 'BENCHES NATIONWIDE ON ALERT  •  PIGEONS REPORT NEW HOUSING  •  YAMS LEVEL 32 AND CLIMBING  •  ';
  g.save(); g.beginPath(); g.rect(40, 1448, 880, 50); g.clip(); g.fillText(tick + tick, 60 - ((O - 30.8) * 260) % 1500, 1482); g.restore(); g.restore();
  g.save(); g.fillStyle = '#E21E39'; g.beginPath(); g.arc(W - 120, 260, 12, 0, 7); g.globalAlpha = Math.sin(O * 8) > 0 ? 1 : 0.3; g.fill(); g.globalAlpha = 1; g.fillStyle = '#fff'; g.font = '700 30px InterW'; g.textAlign = 'right'; g.fillText('LIVE', W - 140, 271); g.restore();
}
function drawMag() {
  const g = ctx; g.save(); g.textAlign = 'center'; g.fillStyle = '#063c5a'; g.font = '500 210px Playfair'; g.fillText('AERO', W / 2, 360);
  g.font = '600 30px InterW'; spaced(g, 'WEEKLY  ·  THE DAY 5 ISSUE', 250, 410, 6);
  g.textAlign = 'left'; g.font = 'italic 500 60px Playfair'; g.fillText('Man of', 60, 1300); g.fillText('the Year', 60, 1366);
  g.font = '600 28px InterW'; g.fillText('HIS YAMS CLOSED A MARKET', 60, 1430); g.restore();
}
function drawFlare(fx, fy, a = 1) {   // Frutiger lens flare
  const g = ctx; const sx = fx * W, sy = fy * H; g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = a;
  const s = g.createRadialGradient(sx, sy, 0, sx, sy, 260); s.addColorStop(0, 'rgba(255,255,240,0.9)'); s.addColorStop(0.2, 'rgba(255,250,210,0.35)'); s.addColorStop(1, 'rgba(255,240,200,0)'); g.fillStyle = s; g.fillRect(sx - 260, sy - 260, 520, 520);
  const cx = W / 2, cy = H / 2; [[0.35, 40, 'rgba(140,240,255,0.18)'], [0.7, 70, 'rgba(160,255,190,0.12)'], [1.25, 26, 'rgba(255,255,255,0.2)'], [1.6, 110, 'rgba(120,200,255,0.1)']].forEach(([k, r, c]) => {
    const x = sx + (cx - sx) * k * 2, y = sy + (cy - sy) * k * 2; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, c); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); });
  g.restore();
}
function drawDesktop(O) {   // glossy desktop UI over the "wallpaper" (no real brand marks)
  const a = eOut(seg(O, 46.2, 46.6)); if (a <= 0) return; const g = ctx; g.save(); g.globalAlpha = a;
  const tb = g.createLinearGradient(0, H - 120, 0, H); tb.addColorStop(0, 'rgba(160,230,255,0.75)'); tb.addColorStop(0.5, 'rgba(40,150,210,0.85)'); tb.addColorStop(1, 'rgba(10,80,150,0.9)'); g.fillStyle = tb; g.fillRect(0, H - 120, W, 120);
  g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(0, H - 120, W, 3);
  const orb = g.createRadialGradient(90, H - 64, 4, 90, H - 60, 52); orb.addColorStop(0, '#d9ffcf'); orb.addColorStop(0.5, '#3fbf4a'); orb.addColorStop(1, '#1d7a2a'); g.fillStyle = orb; g.beginPath(); g.arc(90, H - 60, 46, 0, 7); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.6)'; g.beginPath(); g.ellipse(90, H - 82, 30, 14, 0, 0, 7); g.fill();
  g.fillStyle = '#fff'; g.font = '600 34px InterW'; g.textAlign = 'right'; g.fillText('9:41 AM', W - 40, H - 48);
  [['My Yams', 0], ['Recycle Bin', 1], ['Pigeons', 2]].forEach(([n, i]) => { const y = 640 + i * 190; const ig = g.createLinearGradient(60, y, 160, y + 100); ig.addColorStop(0, '#e9fbff'); ig.addColorStop(1, '#5ac8ef'); rr(g, 70, y, 100, 100, 18); g.fillStyle = ig; g.fill(); g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = 3; g.stroke();
    g.fillStyle = '#fff'; g.font = '600 26px InterW'; g.textAlign = 'center'; g.shadowColor = 'rgba(0,0,0,0.6)'; g.shadowBlur = 6; g.fillText(n, 120, y + 135); g.shadowBlur = 0; });
  // cursor, right-click menu, "Set as wallpaper"
  const cx = lerp(820, 560, eIO(seg(O, 46.5, 47.2))), cy = lerp(1500, 1050, eIO(seg(O, 46.5, 47.2)));
  if (O > 47.3 && O < 48.15) { const mx = 560, my = 1050; g.globalAlpha = a * eOut(seg(O, 47.3, 47.4)); rr(g, mx, my, 400, 236, 12); g.fillStyle = 'rgba(245,252,255,0.97)'; g.fill(); g.strokeStyle = 'rgba(60,140,200,0.6)'; g.lineWidth = 2; g.stroke();
    ['View', 'Refresh', 'Set as wallpaper'].forEach((t, i) => { const hy = my + 14 + i * 72; if (i === 2 && O > 47.55) { const hg = g.createLinearGradient(0, hy, 0, hy + 62); hg.addColorStop(0, '#bfeaff'); hg.addColorStop(1, '#5ab8ea'); rr(g, mx + 8, hy, 384, 62, 8); g.fillStyle = hg; g.fill(); }
      g.fillStyle = '#0b2a5a'; g.font = '600 34px InterW'; g.textAlign = 'left'; g.fillText(t, mx + 30, hy + 43); }); g.globalAlpha = a; }
  const ccx = O > 47.45 ? lerp(560, 640, eIO(seg(O, 47.45, 47.65))) : cx, ccy = O > 47.45 ? lerp(1050, 1214, eIO(seg(O, 47.45, 47.65))) : cy;
  if (O < 48.2) { g.fillStyle = '#fff'; g.strokeStyle = '#000'; g.lineWidth = 3; g.beginPath(); g.moveTo(ccx, ccy); g.lineTo(ccx, ccy + 64); g.lineTo(ccx + 17, ccy + 49); g.lineTo(ccx + 30, ccy + 76); g.lineTo(ccx + 40, ccy + 71); g.lineTo(ccx + 28, ccy + 45); g.lineTo(ccx + 50, ccy + 45); g.closePath(); g.fill(); g.stroke(); }
  if (O > 48.0) { const t = eOut(seg(O, 48.0, 48.25)) * (1 - seg(O, 48.45, 48.6)); rr(g, W - 520, H - 300, 480, 130, 16); g.globalAlpha = a * t; g.fillStyle = 'rgba(245,252,255,0.96)'; g.fill(); g.fillStyle = '#0b2a5a'; g.font = '700 34px InterW'; g.textAlign = 'left'; g.fillText('Wallpaper updated ✓', W - 490, H - 222); }
  g.restore();
}
function drawMonitor(k, O) {   // the graded frame shrinks into a monitor in a dark room
  tctx.setTransform(RS, 0, 0, RS, 0, 0); tctx.clearRect(0, 0, W, H); tctx.drawImage(out, 0, 0, W, H);
  const g = ctx; g.save(); const bg = g.createRadialGradient(W / 2, H * 0.48, 50, W / 2, H * 0.5, H * 0.8); bg.addColorStop(0, '#1b2440'); bg.addColorStop(1, '#04060c'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
  const sw = W * k, shh = H * k * 0.82, x = (W - sw) / 2, y = H * 0.44 - shh / 2;
  const glow = g.createRadialGradient(W / 2, y + shh / 2, 10, W / 2, y + shh / 2, sw); glow.addColorStop(0, 'rgba(110,90,255,0.35)'); glow.addColorStop(1, 'rgba(110,90,255,0)'); g.fillStyle = glow; g.fillRect(0, 0, W, H);
  rr(g, x - 26, y - 26, sw + 52, shh + 80, 26); g.fillStyle = '#0d0f14'; g.fill(); g.strokeStyle = '#2a2f3a'; g.lineWidth = 3; g.stroke();
  g.fillStyle = '#0d0f14'; g.fillRect(W / 2 - 60, y + shh + 54, 120, 150); rr(g, W / 2 - 220, y + shh + 196, 440, 34, 12); g.fill();
  g.fillStyle = '#2bd96b'; g.beginPath(); g.arc(W / 2, y + shh + 30, 5, 0, 7); g.fill();
  g.save(); rr(g, x, y, sw, shh, 6); g.clip(); g.drawImage(tmpC, 0, (H - H * 0.82) / 2 * RS, W * RS, H * 0.82 * RS, x, y, sw, shh); g.restore();
  const ref = g.createLinearGradient(x, y, x + sw, y + shh); ref.addColorStop(0, 'rgba(255,255,255,0.12)'); ref.addColorStop(0.35, 'rgba(255,255,255,0)'); g.fillStyle = ref; g.fillRect(x, y, sw, shh);
  const desk = g.createLinearGradient(0, H * 0.82, 0, H); desk.addColorStop(0, '#141826'); desk.addColorStop(1, '#07090f'); g.fillStyle = desk; g.fillRect(0, y + shh + 228, W, H);
  g.restore();
}

// ---------------------------------------------------------------- grading / compositing
const GRADES = {
  room: { f: 'saturate(1.12) contrast(1.06) brightness(0.97)', tint: 'rgba(255,190,120,0.12)', mode: 'soft-light', vig: 0.3 },
  roomw: { f: 'saturate(1.12) contrast(1.07) brightness(0.86)', tint: 'rgba(255,190,120,0.12)', mode: 'soft-light', vig: 0.34 },
  room2: { f: 'saturate(1.15) contrast(1.06) brightness(0.91)', tint: 'rgba(80,210,230,0.12)', mode: 'soft-light', vig: 0.32 },
  park: { f: 'saturate(1.22) contrast(1.08) brightness(0.92)', tint: 'rgba(120,220,255,0.10)', mode: 'soft-light', vig: 0.22 },
  market: { f: 'saturate(1.2) contrast(1.08) brightness(0.96)', tint: 'rgba(120,230,255,0.10)', mode: 'soft-light', vig: 0.25 },
  aero: { f: 'saturate(1.25) contrast(1.08) brightness(0.96)', tint: null, vig: 0.15 },
  news: { f: 'saturate(1.12) contrast(1.05)', tint: null, vig: 0.3 },
  space: { f: 'saturate(1.1) contrast(1.06)', tint: null, vig: 0.42 },
  space2: { f: 'saturate(1.18) contrast(1.07) brightness(0.98)', tint: 'rgba(58,43,217,0.08)', mode: 'screen', vig: 0.4 },
  ski2: { f: 'saturate(1.08) contrast(1.08) brightness(0.8)', tint: 'rgba(150,200,255,0.14)', mode: 'soft-light', vig: 0.3 },
  ski: { f: 'saturate(1.08) contrast(1.08) brightness(0.9)', tint: 'rgba(150,200,255,0.14)', mode: 'soft-light', vig: 0.26 },
  eclipse: { f: 'saturate(0.85) contrast(1.1) brightness(0.64)', tint: 'rgba(40,60,150,0.30)', mode: 'soft-light', vig: 0.5 },
  cosmic: { f: 'saturate(1.25) contrast(1.08) brightness(0.92)', tint: 'rgba(58,43,217,0.12)', mode: 'screen', vig: 0.38 },
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
const HEROES = [S.room.hero, S.park.hero, S.market.hero, S.space.hero, S.traffic.hero, S.ski.hero];
export function renderFrame(O) {
  const sh = shots.find(s => O >= s.t0 && O < s.t1) || shots[shots.length - 1];
  S.aero.sc.overrideMaterial = null;
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
  if (sh.map) drawMap(O);
  if (sh.pol) drawPolaroid(sh.pol, O, lt);
  if (!sh.hideStat && O >= STEPS[0].t) { ctx.save(); ctx.translate(W * 0.2, 400); ctx.scale(1, 0.62); const sg = ctx.createRadialGradient(0, 0, 0, 0, 0, W * 0.62); sg.addColorStop(0, 'rgba(0,0,0,0.34)'); sg.addColorStop(0.55, 'rgba(0,0,0,0.16)'); sg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = sg; ctx.fillRect(-W, -W, W * 3, W * 2); ctx.restore(); }
  if (sh.mag) drawMag(); if (sh.news) drawNews(O);
  drawTitle(O); drawStat(O, sh); drawCaptions(O);
  for (const s of shots) if (s.flash !== undefined) { const d = Math.round((O - s.flash) * 30); if (d >= 0 && d < 3) { ctx.fillStyle = `rgba(255,255,255,${[0.95, 0.6, 0.25][d]})`; ctx.fillRect(0, 0, W, H); } }
  return out.toDataURL('image/jpeg', RS > 1 ? 0.95 : 0.94);
}
export const TIMELINE = { STEPS, MONTAGE, DUR, cuts: shots.map(s => s.t0), flashes: shots.filter(s => s.flash !== undefined).map(s => s.flash) };
window.captionText = (O) => { const c = cueAt(O); if (!c) return ''; return c.kind === 'shout' ? c.words.map(w => w.w).join(' ') : captionChunk(c, O); };
window.hookText = () => '';
window.renderFrame = renderFrame; window.TIMELINE = TIMELINE;
fetch('dialogue.json').then(r => r.json()).then(d => { DIALOGUE = d; }).catch(() => { DIALOGUE = []; })
  .then(() => Promise.all(['800 78px Montserrat', '500 104px Playfair', 'italic 500 236px Playfair', '500 128px Lora', '600 30px InterW', '700 30px InterW', '40px "Noto Color Emoji"'].map(f => document.fonts.load(f)))).then(() => { window.READY = true; });
