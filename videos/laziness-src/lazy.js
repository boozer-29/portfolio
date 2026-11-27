// "What if your laziness doubled every day?" — Polygram series, episode renderer (three.js, rig v2, IBL lighting)
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Reflector } from 'three/addons/objects/Reflector.js';

const W = 1080, H = 1920; export const DUR = 106.0;
let DIALOGUE = [];
function spanHit(c, O) { for (const [a, b] of c.spans) if (O >= a - 0.02 && O < b + 0.03) return true; return false; }

// ---------------------------------------------------------------- story steps (one doubling each)
const STEPS = [{"day": 1, "t": 4.2, "t1": 11.0, "v": "4,000", "cmp": "GOAL: 10,000", "status": "", "setup": "Doctors recommend 10,000 steps a day.", "son": 4.55, "punch": "He's saving them for later.", "pon": 6.93}, {"day": 2, "t": 11.0, "t1": 19.2, "v": "2,000", "cmp": "TIME TO STAND!", "status": "", "setup": "The remote is two metres away.", "son": 11.35, "punch": "So he goes fishing.", "pon": 13.45}, {"day": 4, "t": 19.2, "t1": 25.2, "v": "500", "cmp": "MOVE GOAL: FAILED", "status": "", "setup": "The light switch is four metres away.", "son": 19.55, "punch": "Engineers would call this overkill.", "pon": 21.93}, {"day": 6, "t": 25.2, "t1": 36.1, "v": "125", "cmp": "ARE YOU OK?", "status": "", "setup": "It's his turn to wash up.", "son": 25.55, "punch": "He'd rather invent something.", "pon": 27.45}, {"day": 9, "t": 36.1, "t1": 43.1, "v": "15.6", "cmp": "CHECKING PULSE…", "status": "", "setup": "Dentists say brush for two minutes.", "son": 36.45, "punch": "He outsources it.", "pon": 38.75}, {"day": 13, "t": 43.1, "t1": 55.7, "v": "0.98", "cmp": "LESS THAN 1 STEP", "status": "", "setup": "He now takes less than one step a day.", "son": 43.45, "punch": "Today's is still loading.", "pon": 45.87}, {"day": 16, "t": 55.7, "t1": 65.5, "v": "0.12", "cmp": "PLEASE MOVE", "status": "", "setup": "The pizza is at the door.", "son": 56.05, "punch": "The door is eleven metres away.", "pon": 57.95}, {"day": 20, "t": 65.5, "t1": 74.7, "v": "0.0076", "cmp": "WATCH GIVING UP", "status": "", "setup": "Putting on socks takes about nine seconds.", "son": 65.85, "punch": "He builds a factory to save them.", "pon": 68.43}, {"day": 25, "t": 74.7, "t1": 83.1, "v": "0.00024", "cmp": "WATCH ASLEEP", "status": "", "setup": "The chippy is 300 metres away.", "son": 75.05, "punch": "So he strings the whole city together.", "pon": 77.15}, {"day": 30, "t": 83.1, "t1": 95.5, "v": "0.0000075", "cmp": "LOW BATTERY", "status": "", "setup": "A storm cuts the power across London.", "son": 83.45, "punch": "Every machine stops. Except his.", "pon": 85.83}, {"day": "END", "t": 95.5, "t1": 105.7, "v": "0", "cmp": "SAVED LONDON ✓", "status": "", "setup": "Day 31. London is saved.", "son": 95.85, "punch": "The washing-up is not.", "pon": 97.71}];  // generated from timeline.json (step 2)
const TITLE = { t0: 0.15, t1: 4.0 };
const TL = Object.fromEntries(STEPS.map(s => [s.day, s]));   // TL[12].t etc.

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
  if (o.afro) {
    const anchor = grp(0, 0.61, 0, head), inner = grp(0, 0, 0, anchor); P.afro = anchor; P.afroIn = inner;
    const am = mat(o.afroC || 0x4a3022, { roughness: 0.88, envMapIntensity: 0.7 }), am2 = mat(o.afroC2 || 0x5c3d2b, { roughness: 0.85, envMapIntensity: 0.7 });
    const core = ball(1, am, 0, 0.8, -0.2, undefined, 28); core.scale.set(1, 0.8, 1); inner.add(core); P.afroCore = core;
    const ar = rnd(31); for (let i = 0; i < 46; i++) { const u = ar() * 2 - 1, a = ar() * 6.283; const yd = -0.12 + 1.12 * Math.pow((u + 1) / 2, 0.8); const r = Math.sqrt(Math.max(0, 1 - yd * yd));
      const b = ball(0.2 + ar() * 0.12, i % 3 ? am : am2, Math.cos(a) * r * 0.97, 0.8 + yd * 0.8 * 0.97, -0.2 + Math.sin(a) * r * 0.97, undefined, 14); inner.add(b); }
    P.setAfro = (R, O = 0, sq = 0) => { anchor.scale.setScalar(R); const j = 0.012 * Math.sin(O * 4.3); inner.scale.set(1 + j + 0.08 * sq, 1 - j - 0.14 * sq, 1 + j + 0.08 * sq); };
  }
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
    case 'sleep': P.mLine.visible = true; corners(0.0, 0.1); break;
    case 'confused': P.mLine.visible = true; corners(0, 0.15); P.brows[0].rotation.z = 0.3; P.brows[1].position.y = 0.55; P.pupils.forEach(p => p.position.x += 0.03); break;
  }
  if (talk) {                                   // mouth only moves while this character is audible
    const open = Math.sin(O * 24) > -0.2; [P.mLine, P.mGrin, P.teeth, P.cL, P.cR].forEach(m => { if (open) m.visible = false; });
    P.mO.visible = open; P.mO.scale.set(expr === 'shock' || expr === 'grit' ? 1.15 : 0.9, (expr === 'shock' ? 0.9 : 0.55) + 0.3 * Math.abs(Math.sin(O * 13)), 1);
  }
  const dart = Math.sin(O * 2.3) > 0.75 ? 0.035 : Math.sin(O * 1.7) < -0.85 ? -0.03 : 0; P.pupils.forEach(p => p.position.x += dart);
  const blink = expr === 'yawn' || expr === 'sniff' || expr === 'sleep' || ((O * 0.41 + 0.13) % 1) < 0.045;          // natural blink every ~2.4 s
  P.lids.forEach(l => { l.scale.y = blink ? 1 : 0.01; l.position.y = blink ? 0.37 : 0.44; });
}
function pose(P, p = {}) {
  P.spine.rotation.set(p.spineX || 0, p.spineY || 0, p.spineZ || 0); P.neck.rotation.set(p.headX || 0, p.headY || 0, p.headZ || 0);
  P.hips.position.y = 0.92 + (p.bob || 0); P.hips.rotation.set(p.hipX || 0, p.hipY || 0, p.hipZ || 0);
  const a = p.arms || [[0, 0, 0.12, 0.12], [0, 0, -0.12, 0.12]];
  P.arms.forEach((A, i) => { A.sh.rotation.set(a[i][0], a[i][1], -a[i][2]); A.el.rotation.set(-(a[i][3] || 0), 0, 0); });
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
  const R = o.R || 10; Object.assign(key.shadow.camera, { left: -R, right: R, top: R, bottom: -R, near: 0.5, far: 120 }); key.shadow.camera.updateProjectionMatrix(); key.shadow.bias = -0.0003; key.shadow.normalBias = 0.02; key.shadow.radius = 5;   // bounds only apply after updateProjectionMatrix()
  sc.add(key, key.target); if (o.target) key.target.position.set(...o.target);
  if (o.rim) { const rim = new THREE.DirectionalLight(o.rimC, o.rim); rim.position.set(...o.rimPos); sc.add(rim); }
  return key;
}

// ---------------------------------------------------------------- helpers
const T = (p, c) => (p.add(c), c);
const glowTex = (c0, c1) => canvasTex(256, 256, (g) => { const gr = g.createRadialGradient(128, 128, 6, 128, 128, 128); gr.addColorStop(0, c0); gr.addColorStop(0.35, c1); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); });
function cyl(rt, rb, h, c, x = 0, y = 0, z = 0, seg = 28, o) { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), c && c.isMaterial ? c : mat(c, o)); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; return m; }
function cone(r, h, c, x = 0, y = 0, z = 0, seg = 24, o) { const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), c && c.isMaterial ? c : mat(c, o)); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; return m; }
const PAL = [[0xe8a317, 0x2d3a63, 0x8d5a3b, 0x15100d], [0x2bb673, 0x4b3a2a, 0x6e4528, 0x15100d], [0x9b59d6, 0x2b2b2b, 0x7a4a2e, 0x1a1210], [0xe8343c, 0x3b4a6b, 0x8d5a3b, 0x15100d], [0x1f8fe0, 0x5b4636, 0x6b4128, 0x111111], [0xff8c5a, 0x2f3a52, 0x7a4a2e, 0x1a1210], [0xf4f4f4, 0x30343c, 0x8d5a3b, 0x15100d], [0x20a0a0, 0x444444, 0x6e4528, 0x1a1210]];
function npc(i, o = {}) { const c = PAL[i % PAL.length]; return makeRig({ hood: c[0], hoodD: c[0], pants: c[1], skin: c[2], hair: c[3], noHood: true, hairStyle: i % 3 === 1 ? 'long' : 'short', ...o }); }
const addM = (sc, m) => { sc.add(m); return m; };
// glowing practical light: emissive bulb + point light + optional haze cone + bokeh sprite
function practical(sc, x, y, z, col, o = {}) { const g = grp(x, y, z, sc); g.add(ball(o.r || 0.08, mat(col, { emissive: col, emissiveIntensity: o.ei ?? 3 }), 0, 0, 0, undefined, 12)).children;
  const pl = new THREE.PointLight(col, o.i ?? 6, o.d ?? 6, 1.6); g.add(pl); g.light = pl;
  if (o.haze) { const hz = new THREE.Mesh(new THREE.ConeGeometry(o.haze, o.hh || 2.6, 32, 1, true), new THREE.MeshBasicMaterial({ map: hazeTex, color: col, transparent: true, opacity: o.ho ?? 0.22, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false })); hz.position.y = -(o.hh || 2.6) / 2; hz.renderOrder = 4; g.add(hz); g.haze = hz; }
  if (o.bokeh) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: bokehTex, color: col, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); sp.scale.setScalar(o.bokeh); g.add(sp); }
  return g; }
const hazeTex = canvasTex(64, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.25)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
const bokehTex = canvasTex(128, 128, (g) => { const gr = g.createRadialGradient(64, 64, 20, 64, 64, 62); gr.addColorStop(0, 'rgba(255,255,255,0.55)'); gr.addColorStop(0.85, 'rgba(255,255,255,0.75)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.beginPath(); g.arc(64, 64, 62, 0, 7); g.fill(); });
// the signature effect: a Wi-Fi ring = fresnel glow dome + ground ring
const RINGC = 0x44e6ff;
function ringMat() { return new THREE.ShaderMaterial({ uniforms: { c: { value: new THREE.Color(RINGC) }, a: { value: 1 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
  fragmentShader: 'uniform vec3 c; uniform float a; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1.0 - abs(dot(vN, vV)), 2.6); gl_FragColor = vec4(c * (0.25 + 2.2 * f), (0.04 + 0.85 * f) * a); }' }); }
const ringGroundTex = canvasTex(512, 512, (g) => { const gr = g.createRadialGradient(256, 256, 200, 256, 256, 256); gr.addColorStop(0, 'rgba(120,240,255,0)'); gr.addColorStop(0.8, 'rgba(120,240,255,0.5)'); gr.addColorStop(0.93, 'rgba(220,255,255,1)'); gr.addColorStop(1, 'rgba(120,240,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 512, 512); });
function makeRing(sc, ground = true) { const g = grp(0, 0, 0, sc); const dome = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24), ringMat()); dome.renderOrder = 5; g.add(dome);
  const gr = ground ? new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ map: ringGroundTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })) : null; if (gr) { gr.rotation.x = -Math.PI / 2; gr.position.y = 0.02; gr.renderOrder = 5; g.add(gr); }
  g.visible = false; g.dome = dome; g.gr = gr; return g; }
function ringAt(rg, O, t0, center, r1, dur = 1.6, r0 = 0.2) { const k = seg(O, t0, t0 + dur); rg.visible = O > t0 && k < 1; if (!rg.visible) return 0; const r = lerp(r0, r1, eOut(k));
  rg.position.copy(center); rg.dome.scale.setScalar(r); rg.dome.material.uniforms.a.value = Math.sin(Math.min(1, k * 4) * Math.PI / 2) * (1 - Math.pow(k, 3)); if (rg.gr) { rg.gr.scale.setScalar(r); rg.gr.material.opacity = 1 - Math.pow(k, 2); } return r; }
// screens drawn on canvases, redrawn per shot
function screenTex(w, h) { const c = mk(w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.c = c; t.g = c.getContext('2d'); return t; }
function screenMesh(w, h, tex, o = {}) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); m.position.set(o.x || 0, o.y || 0, o.z || 0); return m; }
function spinner(g, cx, cy, r, O, col = '#fff') { g.save(); g.translate(cx, cy); g.rotate(O * 6); for (let i = 0; i < 10; i++) { g.globalAlpha = 0.15 + 0.85 * i / 9; g.fillStyle = col; g.beginPath(); g.arc(Math.cos(i / 10 * 6.283) * r, Math.sin(i / 10 * 6.283) * r, r * 0.17, 0, 7); g.fill(); } g.restore(); g.globalAlpha = 1; }
function bars(g, x, y, n, s = 1, col = '#fff') { for (let i = 0; i < 4; i++) { g.globalAlpha = i < n ? 1 : 0.25; g.fillStyle = col; g.fillRect(x + i * 14 * s, y - (8 + i * 8) * s, 9 * s, (8 + i * 8) * s); } g.globalAlpha = 1; }
function drawPhone(t, kind, O) { const g = t.g, w = t.c.width, h = t.c.height; g.fillStyle = '#0d1220'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.font = '600 22px InterW, Arial'; g.textAlign = 'left'; g.fillText('9:41', 22, 34);
  if (kind === 'nobar') { bars(g, w - 92, 36, 0, 1.1); g.textAlign = 'center'; g.font = '800 34px InterW, Arial'; g.fillText('No connection', w / 2, h * 0.47); g.font = '500 22px InterW, Arial'; g.globalAlpha = 0.7; g.fillText('Move closer to your router', w / 2, h * 0.47 + 44); g.globalAlpha = 1; }
  else if (kind === 'onebar') { bars(g, w - 92, 36, 1, 1.1); spinner(g, w / 2, h * 0.45, 46, O); g.font = '600 26px InterW, Arial'; g.textAlign = 'center'; g.globalAlpha = 0.8; g.fillText('Loading…', w / 2, h * 0.45 + 110); g.globalAlpha = 1; }
  else if (kind === 'call') { bars(g, w - 92, 36, 4, 1.1); g.textAlign = 'center'; g.font = '500 26px InterW, Arial'; g.globalAlpha = 0.7; g.fillText('incoming call', w / 2, h * 0.22); g.globalAlpha = 1; g.font = '800 40px InterW, Arial'; g.fillText('INTERNET', w / 2, h * 0.3); g.fillText('PROVIDER', w / 2, h * 0.3 + 48);
    [[w * 0.28, '#e8343c'], [w * 0.72, '#2bd96b']].forEach(([x, c]) => { g.fillStyle = c; g.beginPath(); g.arc(x, h * 0.8, 46, 0, 7); g.fill(); }); }
  else if (kind === 'voicemail') { bars(g, w - 92, 36, 4, 1.1); g.textAlign = 'center'; g.font = '800 34px InterW, Arial'; g.fillText('Voicemail', w / 2, h * 0.2); g.font = '500 24px InterW, Arial'; g.globalAlpha = 0.7; g.fillText('Internet Provider', w / 2, h * 0.2 + 40); g.globalAlpha = 1;
    for (let i = 0; i < 26; i++) { const a = 0.3 + 0.7 * Math.abs(Math.sin(i * 1.7 + O * 9)); g.fillStyle = '#44e6ff'; g.fillRect(w * 0.12 + i * (w * 0.76 / 26), h * 0.5 - 60 * a, 8, 120 * a); } }
  else if (kind === 'chat') { bars(g, w - 92, 36, 4, 1.1); g.textAlign = 'center'; g.font = '800 30px InterW, Arial'; g.fillText('ANDROMEDA', w / 2, 92); g.fillStyle = '#1f8fe0'; rr(g, w - 170, h * 0.55, 140, 64, 30); g.fill(); g.fillStyle = '#fff'; g.font = '600 34px InterW, Arial'; g.fillText('hi', w - 100, h * 0.55 + 44);
    g.font = '500 20px InterW, Arial'; g.globalAlpha = 0.7; g.textAlign = 'right'; g.fillText('Read', w - 34, h * 0.55 + 96); g.globalAlpha = 1; }
  t.needsUpdate = true; }
function drawTV(t, O, alien = false) { const g = t.g, w = t.c.width, h = t.c.height; const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#141414'); bg.addColorStop(1, '#050505'); g.fillStyle = bg; g.fillRect(0, 0, w, h);
  g.fillStyle = '#fff'; g.font = '700 30px InterW, Arial'; g.textAlign = 'left'; g.fillText('Continue watching', 40, 70);
  const cards = [['#ff9ad5', 'PEPPA PIG', 'Season 4 · Episode 12'], ['#3a7ae0', '', ''], ['#e8a317', '', '']]; cards.forEach(([c, t1, t2], i) => { const x = 40 + i * 310; g.fillStyle = c; rr(g, x, 100, 290, 165, 10); g.fill();
    if (t1) { g.fillStyle = '#fff'; g.font = '800 34px InterW, Arial'; g.fillText(t1, x + 18, 160); g.font = '500 20px InterW, Arial'; g.fillText(t2, x + 18, 192); g.fillStyle = '#E21E39'; g.fillRect(x, 258, 290 * 0.7, 7); } });
  if (alien) { g.globalAlpha = 0.6; g.font = '500 20px InterW, Arial'; g.fillText('Watching from 4.2 light-years away', 40, h - 30); g.globalAlpha = 1; } t.needsUpdate = true; }
const windowsTex = (seed, lit = 0.6) => canvasTex(128, 256, (g, w, h) => { g.fillStyle = '#1a1d28'; g.fillRect(0, 0, w, h); const r2 = rnd(seed); for (let y = 8; y < h - 8; y += 22) for (let x = 8; x < w - 8; x += 20) { const on = r2() < lit; g.fillStyle = on ? ['#ffd28a', '#ffe9b8', '#9fd8ff', '#ffb46a'][Math.floor(r2() * 4)] : '#2a2f3d'; g.fillRect(x, y, 12, 14); } });
function phoneMesh() { const g = grp(); g.add(rbox(0.36, 0.72, 0.04, mat(0x15171c, { roughness: 0.3, metalness: 0.5 }))); const t = screenTex(270, 540); const s = screenMesh(0.33, 0.66, t, { z: 0.022 }); g.add(s); g.tex = t; g.scr = s; return g; }


// ---------------------------------------------------------------- the drip kit: accessories that escalate with the level (0 scruffy .. 5 cosmic)
const GOLD = new THREE.MeshStandardMaterial({ color: 0xffc94a, metalness: 1, roughness: 0.16, envMapIntensity: 1.8, emissive: 0x4a2c00, emissiveIntensity: 0.3 });
const DIAM = new THREE.MeshStandardMaterial({ color: 0xe8fbff, metalness: 0.2, roughness: 0.02, envMapIntensity: 3, emissive: 0x9fe8ff, emissiveIntensity: 0.6, flatShading: true });
const starTex = canvasTex(128, 128, (g) => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.15, 'rgba(255,240,200,0.8)'); gr.addColorStop(1, 'rgba(255,220,150,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  g.fillStyle = 'rgba(255,255,255,0.9)'; g.beginPath(); g.moveTo(64, 0); g.lineTo(69, 59); g.lineTo(128, 64); g.lineTo(69, 69); g.lineTo(64, 128); g.lineTo(59, 69); g.lineTo(0, 64); g.lineTo(59, 59); g.closePath(); g.fill(); });
const sparkle = (s = 0.4, col = 0xfff2c8) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: starTex, color: col, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); sp.scale.setScalar(s); sp.renderOrder = 6; return sp; };
function makeChain(r = 0.21, drop = 0.28, n = 15, link = 0.032) {
  const g = grp(); const lg = new THREE.TorusGeometry(link, link * 0.36, 6, 12);
  for (let i = 0; i <= n; i++) { const a = -Math.PI / 2 + Math.PI * i / n; const m = new THREE.Mesh(lg, GOLD); m.position.set(r * Math.sin(a), -drop * Math.cos(a), 0); m.rotation.set(i % 2 ? Math.PI / 2 : 0, 0, a); m.castShadow = true; g.add(m); }
  const pend = new THREE.Mesh(new THREE.OctahedronGeometry(link * 2.4, 0), DIAM); pend.position.set(0, -drop - link * 2.6, 0.01); pend.scale.set(0.8, 1.2, 0.5); g.add(pend); g.pend = pend; return g; }
function makeChainFixed() { return makeChain(); }
// ---------------------------------------------------------------- props + characters (Drip v2)
const blobTex = canvasTex(128, 128, (g) => { const gr = g.createRadialGradient(64, 64, 4, 64, 64, 64); gr.addColorStop(0, 'rgba(0,0,0,0.55)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); });
function blob(sc, s = 1.3) { const m = new THREE.Mesh(new THREE.PlaneGeometry(s, s), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.y = 0.012; sc.add(m); return m; }
const TAGM = new THREE.MeshStandardMaterial({ roughness: 0.9, map: canvasTex(128, 180, (g, w, h) => { g.fillStyle = '#f3ead6'; g.fillRect(0, 0, w, h); g.fillStyle = '#5a5040'; g.beginPath(); g.arc(64, 22, 8, 0, 7); g.fill(); g.fillStyle = '#c0392b'; g.fillRect(14, 44, 100, 6); g.fillStyle = '#1d1a26'; g.textAlign = 'center'; g.font = 'italic 500 64px Lora'; g.fillText('£40', 64, 120); g.font = '700 18px InterW'; g.fillText('CHARITY', 64, 156); }) });
function tagMesh() { const g = grp(); g.add(cyl(0.004, 0.004, 0.12, mat(0xf4f4f4), 0, -0.06, 0, 4)); const c = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.17, 0.008), [mat(0xf3ead6), mat(0xf3ead6), mat(0xf3ead6), mat(0xf3ead6), TAGM, TAGM]); c.position.y = -0.2; g.add(c); return g; }
function hideFace(P) { P.head.children.slice(1).forEach(c => c.visible = false); P.face = () => {}; }
const KNEEL = { bob: -0.42, spineX: 0.12, legs: [[1.5, 1.6], [0.05, 1.5]] };
const BROWN = 0x8a6a48;
function jacketBits(P, tag = true) {   // the £40 charity-shop look: elbow patches + price tag (for NPCs and the bouncer)
  const b = grp(0, 0, 0, P.spine); b.add(rbox(0.2, 0.16, 0.02, mat(0x5a4632, { roughness: 1 }), -0.22, 0.52, 0.245)); b.add(rbox(0.14, 0.12, 0.02, mat(0x4a5a3a, { roughness: 1 }), 0.25, 0.25, 0.245));
  b.add(rbox(0.12, 0.4, 0.025, mat(0x6e5236, { roughness: 0.9 }), -0.12, 0.56, 0.24)); b.add(rbox(0.12, 0.4, 0.025, mat(0x6e5236, { roughness: 0.9 }), 0.12, 0.56, 0.24));
  if (tag) { const t = tagMesh(); t.position.set(0.13, -0.3, 0.02); P.arms[1].el.add(t); P.tag = t; } return b; }
// ---- the hero's wardrobe: a complete new outfit every doubling (jacket, trousers, shoes, hat, extras), keyed by the current day
const cosmosTex = canvasTex(256, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#1a0b3a'); gr.addColorStop(0.5, '#3a1470'); gr.addColorStop(1, '#0b1a4a'); g.fillStyle = gr; g.fillRect(0, 0, w, h); const r2 = rnd(4); for (let i = 0; i < 140; i++) { g.fillStyle = `rgba(255,255,255,${0.4 + r2() * 0.6})`; g.beginPath(); g.arc(r2() * w, r2() * h, r2() * 1.8 + 0.4, 0, 7); g.fill(); } for (let i = 0; i < 5; i++) { const x = r2() * w, y = r2() * h, rg = g.createRadialGradient(x, y, 0, x, y, 40); rg.addColorStop(0, 'rgba(255,120,220,0.35)'); rg.addColorStop(1, 'rgba(255,120,220,0)'); g.fillStyle = rg; g.fillRect(0, 0, w, h); } });
const WM = {   // wardrobe materials (unique keys, so nothing else in a scene shares them)
  cord: mat(0x8a6a4a, { roughness: 0.92 }), jeans: mat(0x4a5d8d, { roughness: 0.75 }), scruff: mat(0x3a2e27, { roughness: 0.8 }),
  track: new THREE.MeshPhysicalMaterial({ color: 0x2a5bd7, roughness: 0.45, sheen: 0.8, sheenColor: new THREE.Color(0x9fc0ff) }), white: mat(0xfafafb, { roughness: 0.3 }),
  camel: mat(0xc49a5b, { roughness: 0.8 }), cream: mat(0xe6dcc5, { roughness: 0.8 }), loafer: mat(0x5a3a23, { roughness: 0.2, metalness: 0.1 }),
  leather: mat(0x16161b, { roughness: 0.2, metalness: 0.15, envMapIntensity: 1.4 }), blackj: mat(0x1b1b20, { roughness: 0.7 }),
  puffer: mat(0xd42a36, { roughness: 0.22, envMapIntensity: 1.3 }), cargo: mat(0x5a5a39, { roughness: 0.85 }),
  velvet: new THREE.MeshPhysicalMaterial({ color: 0x5a1030, roughness: 0.6, sheen: 1, sheenColor: new THREE.Color(0xff6aa0) }), blacks: mat(0x0d0d0e, { roughness: 0.15, metalness: 0.2 }),
  fur: mat(0xf2ede5, { roughness: 1 }), tux: mat(0x111119, { roughness: 0.35 }), silver: mat(0xd0d4dd, { roughness: 0.18, metalness: 1, envMapIntensity: 1.6 }),
  cape: new THREE.MeshPhysicalMaterial({ color: 0x8a0f1a, roughness: 0.55, sheen: 1, sheenColor: new THREE.Color(0xff8090) }),
  cosmos: new THREE.MeshStandardMaterial({ map: cosmosTex, emissiveMap: cosmosTex, emissive: 0xffffff, emissiveIntensity: 0.7, roughness: 0.4, metalness: 0.3 }),
  gold: GOLD, diam: DIAM };
const OUTFITS = {   // jacket, trousers, shoes, hat, extras: the drip, day by day
  1: { j: 'cord', p: 'jeans', s: 'scruff', lap: 'cord', shirt: 0xefe7d4, patches: 1, tag: 1 },
  3: { j: 'track', p: 'track', s: 'white', lap: 'track', shirt: 0xffffff, stripes: 1, hat: 'cap' },
  5: { j: 'camel', p: 'cream', s: 'loafer', lap: 'camel', shirt: 0x222222, coat: 1, hat: 'bucket' },
  8: { j: 'leather', p: 'blackj', s: 'white', lap: 'leather', shirt: 0xffffff, chain: 1 },
  10: { j: 'puffer', p: 'cargo', s: 'white', lap: 'puffer', shirt: 0x111111, chain: 1, hat: 'beanie' },
  12: { j: 'velvet', p: 'velvet', s: 'blacks', lap: 'gold', btn: 'gold', shirt: 0x111111, chain: 1, watch: 1 },
  15: { j: 'fur', p: 'cream', s: 'white', lap: 'fur', shirt: 0x111111, collar: 1, coat: 1, chain: 1, watch: 1, spark: 0.5 },
  18: { j: 'tux', p: 'tux', s: 'blacks', lap: 'diam', btn: 'diam', shirt: 0xffffff, hat: 'top', chain: 1, watch: 1, spark: 0.6 },
  22: { j: 'gold', p: 'gold', s: 'gold', lap: 'tux', btn: 'diam', shirt: 0x111111, chain: 1, watch: 1, spark: 1, glow: 0.6 },
  27: { j: 'diam', p: 'silver', s: 'diam', lap: 'gold', btn: 'gold', shirt: 0x111111, cape: 'cape', hat: 'crown', chain: 1, watch: 1, spark: 1, glow: 0.8 },
  30: { j: 'cosmos', p: 'cosmos', s: 'cosmos', lap: 'gold', btn: 'diam', shirt: 0x111111, cape: 'cosmos', chain: 1, watch: 1, spark: 1, glow: 1.4 },
};
OUTFITS.END = OUTFITS[30];
function makeHero() {
  const P = makeRig({ hood: 0x8a6a49, hoodD: 0x6e5236, pants: 0x4a5d8c, noHood: true }); const K = {}; P.kit = K;
  const fab = mat(0x8a6a49, { roughness: 0.75 }), pm = mat(0x4a5d8c, { roughness: 0.7 }); K.jm = []; K.pm = [];
  P.root.traverse(m => { if (m.material === fab) K.jm.push(m); if (m.material === pm) K.pm.push(m); });
  K.lapels = [-1, 1].map(sx => { const l = rbox(0.13, 0.42, 0.025, WM.cord, sx * 0.13, 0.55, 0.24); l.rotation.z = sx * 0.22; P.spine.add(l); return l; });
  K.shirt = rbox(0.13, 0.38, 0.02, new THREE.MeshStandardMaterial({ color: 0xefe7d4, roughness: 0.8 }), 0, 0.57, 0.233); P.spine.add(K.shirt);
  K.btnM = mat(0x4a3220, { roughness: 0.5 }); K.btns = [0.4, 0.27, 0.14].map(y => { const b = cyl(0.028, 0.028, 0.02, K.btnM, 0.07, y, 0.243, 12); b.rotation.x = Math.PI / 2; P.spine.add(b); return b; });
  K.patches = [rbox(0.2, 0.16, 0.02, mat(0x5a4632, { roughness: 1 }), -0.22, 0.25, 0.245), rbox(0.14, 0.12, 0.02, mat(0x4a5a3a, { roughness: 1 }), 0.25, 0.5, 0.245)]; K.patches.forEach(p => P.spine.add(p));
  K.tag = tagMesh(); K.tag.position.set(0.13, -0.3, 0.02); P.arms[1].el.add(K.tag);
  K.stripes = [...P.arms.map((A, i) => { const sx = i ? 1 : -1; return [rbox(0.03, 0.36, 0.05, WM.white, sx * 0.115, -0.19, 0), rbox(0.03, 0.3, 0.05, WM.white, sx * 0.11, -0.16, 0)].map((b, k) => { (k ? A.el : A.sh).add(b); return b; }); }), ...P.legs.map((L, i) => { const sx = i ? 1 : -1; return [rbox(0.03, 0.42, 0.05, WM.white, sx * 0.145, -0.21, 0), rbox(0.03, 0.38, 0.05, WM.white, sx * 0.135, -0.19, 0)].map((b, k) => { (k ? L.knee : L.thigh).add(b); return b; }); })].flat();
  K.coat = rbox(0.82, 0.62, 0.5, WM.camel, 0, -0.36, 0); P.hips.add(K.coat);
  K.collar = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.11, 10, 24), WM.fur); K.collar.rotation.x = Math.PI / 2; K.collar.position.set(0, 0.76, 0); K.collar.scale.set(1.15, 0.8, 1); P.spine.add(K.collar);
  K.cape = rbox(0.86, 1.5, 0.05, WM.cape, 0, 0.0, -0.27); P.spine.add(K.cape);
  K.shoes = P.legs.map((L, i) => { const g = grp(0, -0.42, 0.05, L.knee); g.main = rbox(0.33, 0.15, 0.47, WM.white); g.add(g.main); g.add(rbox(0.34, 0.05, 0.48, mat(0xe9e9e9, { roughness: 0.5 }), 0, -0.06, 0)); g.add(rbox(0.02, 0.05, 0.24, mat(0xd4a640, { roughness: 0.3, metalness: 0.8 }), (i ? 1 : -1) * 0.17, 0.01, 0.02));
    g.laces = [-1, 1].map(s => { const l = cyl(0.009, 0.009, 0.3, mat(0xffffff), s * 0.05, -0.05, 0.2, 5); l.rotation.z = s * 0.15; g.add(l); return l; });
    g.bow = grp(0, 0.09, 0.08, g); [-1, 1].forEach(s => { const lp = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.008, 5, 12), mat(0xffffff)); lp.position.x = s * 0.05; lp.rotation.y = Math.PI / 2 + s * 0.4; g.bow.add(lp); }); return g; });
  const H = (y) => grp(0, y, -0.01, P.head); K.hats = {
    cap: (() => { const g = H(0.8); g.add(cyl(0.37, 0.37, 0.16, mat(0xf4f4f6, { roughness: 0.6 }), 0, 0, 0, 24)); g.add(rbox(0.42, 0.04, 0.3, mat(0xf4f4f6, { roughness: 0.6 }), 0, -0.06, -0.42)); return g; })(),
    bucket: (() => { const g = H(0.84); g.add(cyl(0.36, 0.4, 0.24, mat(0xe7d9b9, { roughness: 0.85 }), 0, 0, 0, 24)); g.add(cyl(0.53, 0.55, 0.035, mat(0xe0d0ad, { roughness: 0.85 }), 0, -0.11, 0, 28)); return g; })(),
    beanie: (() => { const g = H(0.84); g.add(rbox(0.74, 0.3, 0.68, mat(0x1a1a1f, { roughness: 0.95 }))); g.add(rbox(0.76, 0.1, 0.7, mat(0x2a2a30, { roughness: 0.95 }), 0, -0.12, 0)); return g; })(),
    top: (() => { const g = H(0.97); g.add(cyl(0.3, 0.3, 0.5, WM.tux, 0, 0, 0, 24)); g.add(cyl(0.5, 0.5, 0.04, WM.tux, 0, -0.24, 0, 28)); g.add(cyl(0.305, 0.305, 0.08, mat(0xf2f2f2), 0, -0.17, 0, 24)); return g; })(),
    crown: (() => { const g = H(0.86); g.add(cyl(0.36, 0.36, 0.16, GOLD, 0, 0, 0, 24)); for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; g.add(cone(0.07, 0.2, GOLD, Math.sin(a) * 0.33, 0.17, Math.cos(a) * 0.33, 8)); const d = new THREE.Mesh(new THREE.OctahedronGeometry(0.045, 0), DIAM); d.position.set(Math.sin(a) * 0.37, 0.0, Math.cos(a) * 0.37); g.add(d); } return g; })() };
  K.chain = makeChain(); K.chain.position.set(0, 0.7, 0.27); P.spine.add(K.chain);
  K.watch = grp(0, -0.3, 0, P.arms[0].el); { const w = new THREE.Mesh(new THREE.TorusGeometry(0.125, 0.03, 8, 24), GOLD); w.rotation.x = Math.PI / 2; K.watch.add(w); const f = cyl(0.06, 0.06, 0.03, DIAM, 0.12, 0, 0, 12); f.rotation.z = Math.PI / 2; K.watch.add(f); }
  K.sparks = [[0, 0.32, 0.33, P.spine], [0.18, 0.55, 0.3, P.spine], [-0.2, 0.5, 0.3, P.spine], [0.3, 0.9, 0.2, P.head], [-0.33, 0.78, 0.25, P.head]].map(([x, y, z, par], i) => { const s = sparkle(0.35); s.position.set(x, y, z); par.add(s); s.ph = i * 1.7; return s; });
  K.glow = new THREE.PointLight(0xffc96a, 0, 3, 1.6); K.glow.position.set(0, 0.45, 0.8); P.spine.add(K.glow);
  K.set = (lvl, O, o = {}) => { const st = stepAt(O); const f = OUTFITS[st ? st.day : 1];
    K.jm.forEach(m => m.material = WM[f.j]); K.pm.forEach(m => m.material = WM[f.p]); K.lapels.forEach(l => l.material = WM[f.lap]); K.btns.forEach(b => b.material = f.btn ? WM[f.btn] : K.btnM); K.shirt.material.color.setHex(f.shirt);
    K.patches.forEach(p => p.visible = !!f.patches); K.tag.visible = !!f.tag || !!o.tag; K.tag.rotation.z = 0.25 * Math.sin(O * 3.1); K.tag.rotation.x = 0.15 * Math.sin(O * 2.3);
    K.stripes.forEach(b => b.visible = !!f.stripes); K.coat.visible = !!f.coat; K.coat.material = WM[f.j]; K.collar.visible = !!f.collar; K.cape.visible = !!f.cape; if (f.cape) K.cape.material = WM[f.cape];
    for (const [k, h] of Object.entries(K.hats)) h.visible = f.hat === k;
    K.shoes.forEach(s => { s.main.material = WM[f.s]; s.laces.forEach(l => l.visible = !!o.untied); s.bow.visible = !o.untied && f.s === 'white'; });
    K.chain.visible = !!f.chain; K.watch.visible = !!f.watch;
    const sp = (f.spark || 0) * (o.spark ?? 1); K.sparks.forEach(s => { const tw = Math.pow(Math.max(0, Math.sin(O * 2.6 + s.ph)), 6); s.visible = sp > 0; s.material.opacity = sp * (0.25 + 0.75 * tw); s.scale.setScalar(0.18 + 0.5 * tw); });
    K.glow.intensity = 2.2 * (f.glow || 0) * (o.glow ?? 1); };
  return P;
}
function makeBouncer() { const P = makeRig({ hood: 0x111115, hoodD: 0x111115, pants: 0x18181c, skin: 0x5a3826, hair: 0x111111, hairStyle: 'none', noHood: true, shoe: 0x0a0a0a });
  P.head.add(rbox(0.5, 0.16, 0.08, mat(0x15100d), 0, 0.12, 0.29)); P.head.add(cyl(0.035, 0.035, 0.12, mat(0x222222), 0.35, 0.33, 0.02, 8));
  P.spine.add(rbox(0.12, 0.4, 0.02, mat(0xf4f4f4), 0, 0.58, 0.236)); P.spine.add(rbox(0.07, 0.34, 0.03, mat(0x111111), 0, 0.55, 0.25));
  P.fab = mat(0x111115, { roughness: 0.75 }); P.brown = jacketBits(P); P.root.scale.setScalar(1.28);
  P.setBrown = (on) => { P.fab.color.setHex(on ? BROWN : 0x111115); P.brown.visible = on; P.tag.visible = on; }; P.setBrown(false); return P; }
function makeMannequin(hex) { const P = makeRig({ hood: hex, hoodD: hex, pants: 0xdcdce0, skin: 0xededf0, hairStyle: 'none', noHood: true, shoe: 0xdcdce0 }); hideFace(P); P.fab = mat(hex, { roughness: 0.75 });
  P.root.add(cyl(0.3, 0.34, 0.06, mat(0x2a2a2a, { roughness: 0.3, metalness: 0.6 }), 0, 0.03, 0, 20)); return P; }
function makeJudge() { const P = makeRig({ hood: 0x101012, hoodD: 0x101012, pants: 0x101012, skin: 0xe2b896, hair: 0xe8e4dc, hairStyle: 'none', noHood: true });
  const wm = mat(0xf2efe8, { roughness: 0.95 }); P.head.add(rbox(0.74, 0.24, 0.7, wm, 0, 0.7, -0.02));
  for (const sx of [-1, 1]) for (let k = 0; k < 4; k++) { const c = cyl(0.07, 0.07, 0.2, wm, sx * 0.4, 0.62 - k * 0.15, -0.08, 12); c.rotation.x = Math.PI / 2; P.head.add(c); }
  P.spine.add(rbox(0.07, 0.16, 0.02, mat(0xffffff), -0.04, 0.62, 0.24)); P.spine.add(rbox(0.07, 0.16, 0.02, mat(0xffffff), 0.04, 0.62, 0.24));
  P.head.add(rbox(0.12, 0.05, 0.02, mat(0x8a8a8a), -0.15, 0.27, 0.32)); P.head.add(rbox(0.12, 0.05, 0.02, mat(0x8a8a8a), 0.15, 0.27, 0.32));   // half-moon specs sit low, eyes stay clear
  return P; }
function makeGuard() { const P = makeRig({ hood: 0x15151a, hoodD: 0x15151a, pants: 0x15151a, skin: 0x6b4128, hair: 0x111111, noHood: true, tie: 0x15151a, shoe: 0x0b0b0b });
  P.arms.forEach(A => A.el.children[1].material = mat(0xffffff, { roughness: 0.7 })); const coil = cyl(0.012, 0.012, 0.3, mat(0xdddddd, { roughness: 0.3 }), 0.34, 0.2, -0.02, 6); P.head.add(coil); return P; }
function makeMugger(i) { const P = makeRig({ hood: [0x2a2a30, 0x3a3f4a][i], hoodD: [0x1f1f24, 0x2c313a][i], pants: 0x222226, skin: [0x8d5a3b, 0xd9a882][i], hair: 0x111111 });
  P.head.add(rbox(0.68, 0.22, 0.1, mat(0x111111, { roughness: 0.9 }), 0, 0.14, 0.28)); P.wallet = rbox(0.16, 0.11, 0.03, mat(0x5a3a22), 0, 0, 0); return P; }
function makePeacock() {
  const g = grp(); const blue = new THREE.MeshPhysicalMaterial({ color: 0x1a4fc4, roughness: 0.3, metalness: 0.3, sheen: 1, sheenColor: new THREE.Color(0x3ff0c0), envMapIntensity: 1.4 });
  const body = ball(0.3, blue, 0, 0.62, 0); body.scale.set(0.8, 0.9, 1.25); g.add(body);
  const neck = grp(0, 0.75, 0.2, g); const nk = cyl(0.07, 0.11, 0.5, blue, 0, 0.22, 0, 14); neck.add(nk); neck.rotation.x = 0.25;
  const head = grp(0, 0.5, 0.02, neck); head.add(ball(0.1, blue)); head.add(cone(0.035, 0.12, mat(0x3a3020), 0, -0.01, 0.13, 8)).children; head.children[1].rotation.x = Math.PI / 2;
  for (const sx of [-1, 1]) { head.add(rbox(0.035, 0.05, 0.02, mat(0xffffff), sx * 0.075, 0.025, 0.05)); head.add(rbox(0.02, 0.03, 0.02, mat(0x111111), sx * 0.08, 0.025, 0.062)); }
  for (let k = -2; k <= 2; k++) { const st = cyl(0.006, 0.006, 0.14, mat(0x2a4a90), k * 0.025, 0.15, -0.01, 4); st.rotation.z = k * 0.15; head.add(st); head.add(ball(0.02, blue, k * 0.045, 0.22, -0.01, undefined, 8)); }
  [-0.1, 0.1].forEach(x => { g.add(cyl(0.02, 0.02, 0.45, mat(0x9a8a7a), x, 0.22, 0, 6)); });
  const fT = canvasTex(64, 256, (c, w, h) => { const gr = c.createLinearGradient(0, h, 0, 0); gr.addColorStop(0, '#2a4a20'); gr.addColorStop(0.7, '#4a8a3a'); gr.addColorStop(1, '#6ab04a'); c.fillStyle = gr; c.beginPath(); c.ellipse(32, 128, 28, 126, 0, 0, 7); c.fill();
    c.fillStyle = '#c8a040'; c.beginPath(); c.ellipse(32, 44, 22, 28, 0, 0, 7); c.fill(); c.fillStyle = '#18a088'; c.beginPath(); c.ellipse(32, 46, 15, 20, 0, 0, 7); c.fill(); c.fillStyle = '#1a2a8a'; c.beginPath(); c.ellipse(32, 48, 8, 11, 0, 0, 7); c.fill(); });
  const fm = new THREE.MeshStandardMaterial({ map: fT, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.4, metalness: 0.2, envMapIntensity: 1.2 });
  const tail = grp(0, 0.6, -0.3, g); const fe = [...Array(19)].map((_, i) => { const p = grp(0, 0, 0, tail); const m = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 1.7), fm); m.position.y = 0.85; m.castShadow = true; p.add(m); p.u = i / 18 - 0.5; p.d = (i % 2) * 0.01; return p; });
  g.userData = { neck, head, tail, fe }; g.setTail = (k) => { fe.forEach(p => { p.rotation.set(0, 0, -p.u * 2.9 * k); p.position.z = -p.d; }); tail.rotation.x = lerp(-2.0, -0.32, k); tail.scale.setScalar(lerp(0.75, 1, k)); }; g.setTail(0);
  return g; }
const CROSS = { arms: [[-0.55, 0, -0.22, 1.55], [-0.6, 0, 0.22, 1.5]] };
// ---------------------------------------------------------------- SCENES (Laziness: all new sets and characters)
const S = {};
// ---- characters (all new to the series)
function lie(P, pos, ry, tilt) { P.root.rotation.order = 'YXZ'; P.root.position.set(...pos); P.root.rotation.set(tilt, ry, 0); }   // tilt -π/2 = on his back, +π/2 = face-down; ry turns the body (ry = π/2 puts his head toward -x)
function makeLazyHero() { const P = makeRig(); const w = rbox(0.24, 0.1, 0.27, mat(0x111216, { roughness: 0.3, metalness: 0.4 }), 0, -0.3, 0); P.arms[0].el.add(w);   // smartwatch on the left wrist
  P.watchFace = rbox(0.16, 0.02, 0.18, mat(0x1d2a36, { emissive: 0x3fd0ff, emissiveIntensity: 0.6 }), 0, -0.3, 0); P.watchFace.position.set(0.12, -0.3, 0); P.watchFace.rotation.z = Math.PI / 2; P.arms[0].el.add(P.watchFace); return P; }
function makeDev() { const P = makeRig({ hood: 0x26262c, hoodD: 0x26262c, pants: 0x3b3b44, skin: 0x8a5a3c, hair: 0x15100d, noHood: true, shoe: 0xf2f2f2 });
  P.spine.add(rbox(0.82, 0.1, 0.49, mat(0xffffff), 0, 0.08, 0)); P.arms.forEach(A => { A.sh.scale.set(1.22, 1, 1.22); A.sh.children[0].material = mat(0x8a5a3c, { roughness: 0.5 }); A.el.children[0].material = mat(0x8a5a3c, { roughness: 0.5 }); });   // vest: bare, bigger arms
  P.band = rbox(0.7, 0.08, 0.64, mat(0xff3b6b), 0, 0.6, 0); P.head.add(P.band); P.shake = grp(); P.shake.add(cyl(0.09, 0.08, 0.3, mat(0x7ad3ff, { roughness: 0.25 }), 0, 0.15, 0, 16)); P.shake.add(cyl(0.095, 0.095, 0.06, mat(0x222222), 0, 0.32, 0, 16)); return P; }
function makePriya() { const P = makeRig({ hood: 0x5fa891, hoodD: 0x4a8b77, pants: 0x2d3048, skin: 0xb88660, hair: 0x1a1210, hairStyle: 'long', noHood: true, shoe: 0x6b4630 });
  P.spine.add(rbox(0.3, 0.6, 0.02, mat(0xf3efe6), 0, 0.42, 0.24)); P.marker = cyl(0.025, 0.025, 0.2, mat(0x1f4fd6), 0, -0.45, 0.08, 10); P.marker.rotation.x = 1.2; P.arms[1].el.add(P.marker); P.marker.visible = false; return P; }
function makeHost() { const P = makeRig({ hood: 0x2f56c8, hoodD: 0x2f56c8, pants: 0x2f56c8, skin: 0xf0c09a, hair: 0x6b4a2b, noHood: true, tie: 0xffd23f, shoe: 0x111111 }); P.head.add(rbox(0.74, 0.3, 0.68, mat(0x6b4a2b), 0, 0.78, 0)); return P; }
function makeDriver() { const P = npc(5, { hood: 0xd8262e, hoodD: 0xd8262e }); P.head.add(rbox(0.7, 0.14, 0.66, mat(0xd8262e), 0, 0.72, 0)); P.head.add(rbox(0.5, 0.05, 0.3, mat(0xd8262e), 0, 0.66, 0.42)); return P; }
function makeEngineer() { const P = npc(1, { hood: 0xff8a1f, hoodD: 0xff8a1f }); P.head.add(rbox(0.74, 0.22, 0.7, mat(0xffd21f, { roughness: 0.35 }), 0, 0.74, 0)); P.radio = rbox(0.12, 0.3, 0.08, mat(0x222222), 0, -0.44, 0.1); P.arms[1].el.add(P.radio); return P; }
// ---- textures
const woodTex = (base, seed) => { const t = canvasTex(256, 256, (g, w, h) => { g.fillStyle = base; g.fillRect(0, 0, w, h); const r2 = rnd(seed); for (let i = 0; i < 9; i++) { g.fillStyle = `rgba(0,0,0,${0.05 + r2() * 0.08})`; g.fillRect(0, i * 28 + 4, w, 2); } for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(60,30,10,${r2() * 0.08})`; g.fillRect(r2() * w, r2() * h, 30 + r2() * 60, 1.5); } }); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 4); return t; };
const rotaTex = screenTex(512, 640);
function drawRota(state = {}) { const g = rotaTex.g, w = 512, h = 640; g.fillStyle = '#fbfbf8'; g.fillRect(0, 0, w, h); g.strokeStyle = '#c9ced6'; g.lineWidth = 3; g.strokeRect(6, 6, w - 12, h - 12);
  g.fillStyle = '#1f4fd6'; g.font = '700 54px InterW'; g.textAlign = 'center'; g.fillText('CHORE ROTA', w / 2, 70);
  const cols = ['PRIYA', 'DEV', 'HIM']; g.font = '700 34px InterW'; cols.forEach((c, i) => { g.fillStyle = i === 2 ? '#d7262e' : '#333'; g.fillText(c, 110 + i * 150, 140); });
  g.strokeStyle = '#999'; g.lineWidth = 2; for (let r = 0; r < 5; r++) { g.beginPath(); g.moveTo(30, 170 + r * 80); g.lineTo(w - 30, 170 + r * 80); g.stroke(); }
  g.font = '700 44px InterW'; for (let r = 0; r < 4; r++) { g.fillStyle = '#20a35a'; g.fillText('✓', 110, 225 + r * 80); g.fillText('✓', 260, 225 + r * 80); }
  if (state.saved) { g.save(); g.translate(410, 330); g.rotate(-0.25); g.fillStyle = '#d7262e'; g.font = '700 40px InterW'; g.fillText('SAVED', 0, -20); g.fillText('LONDON', 0, 26); g.font = '700 70px InterW'; g.fillText('✓', 0, 100); g.restore(); }
  if (state.splat) { g.fillStyle = 'rgba(200,170,255,0.9)'; const r2 = rnd(4); g.beginPath(); g.arc(300, 380, 120, 0, 7); g.fill(); for (let i = 0; i < 14; i++) { const a = r2() * 6.28, d = 110 + r2() * 90; g.beginPath(); g.arc(300 + Math.cos(a) * d, 380 + Math.sin(a) * d, 14 + r2() * 26, 0, 7); g.fill(); } g.fillRect(260, 380, 30, 230); g.fillRect(330, 380, 22, 170); }
  rotaTex.needsUpdate = true; }
const stripeTex = canvasTex(64, 256, (g, w, h) => { g.fillStyle = '#2a2d33'; g.fillRect(0, 0, w, h); g.fillStyle = '#3a3e46'; for (let y = 0; y < h; y += 32) g.fillRect(0, y, w, 12); }); stripeTex.wrapS = stripeTex.wrapT = THREE.RepeatWrapping;
// ---- props
function makeSofa() { const g = grp(); const f = mat(0x6d5aa8, { roughness: 0.9 }), f2 = mat(0x5a4a8e, { roughness: 0.9 });
  g.add(rbox(3.6, 0.42, 1.2, f2, 0, 0.3, 0)); g.add(rbox(1.62, 0.2, 1.06, f, -0.84, 0.6, 0.05)); g.add(rbox(1.62, 0.2, 1.06, f, 0.84, 0.6, 0.05)); g.add(rbox(3.6, 1.0, 0.32, f2, 0, 0.9, -0.48));
  g.add(rbox(0.3, 0.75, 1.2, f2, -1.8, 0.55, 0)); g.add(rbox(0.3, 0.75, 1.2, f2, 1.8, 0.55, 0)); [-1.6, 1.6].forEach(x => [-0.45, 0.45].forEach(z => g.add(cyl(0.05, 0.04, 0.12, mat(0x3a2a1a), x, 0.06, z, 8)))); return g; }
function makeDominoes(path, n) { const pts = new THREE.CatmullRomCurve3(path.map(V)); return [...Array(n)].map((_, i) => { const u = i / (n - 1); const p = pts.getPointAt(u), tg = pts.getTangentAt(u); const d = grp(p.x, 0, p.z); d.rotation.y = Math.atan2(tg.x, tg.z); d.add(rbox(0.22, 0.42, 0.07, mat(i % 2 ? 0xf5f5f0 : 0x1d1d22, { roughness: 0.3 }), 0, 0.21, 0)); return d; }); }
function fallDominoes(ds, O, t0, t1) { ds.forEach((d, i) => { const tf = lerp(t0, t1, i / ds.length); d.rotation.x = 1.25 * eIn(seg(O, tf, tf + 0.12)); }); }
function makeLever(s = 1) { const g = grp(); g.add(rbox(0.6 * s, 0.3 * s, 0.6 * s, mat(0x3a3f48, { metalness: 0.5, roughness: 0.4 }), 0, 0.15 * s, 0)); const arm = grp(0, 0.3 * s, 0, g); arm.add(cyl(0.05 * s, 0.05 * s, 1.3 * s, mat(0xb8bcc4, { metalness: 0.8, roughness: 0.25 }), 0, 0.65 * s, 0, 12)); arm.add(ball(0.14 * s, mat(0xd7262e, { roughness: 0.3 }), 0, 1.32 * s, 0)); g.arm = arm; return g; }
function makeDrone() { const g = grp(); const b = mat(0x22252b, { roughness: 0.35, metalness: 0.3 }); g.add(rbox(0.5, 0.14, 0.5, b)); g.rotors = [];
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z]) => { T(g, rbox(0.36, 0.05, 0.06, b, x * 0.22, 0.02, z * 0.22)).rotation.y = Math.atan2(z, x); const r = grp(x * 0.36, 0.1, z * 0.36, g); r.add(rbox(0.42, 0.012, 0.06, mat(0xcfd6e0, { transparent: true, opacity: 0.55 }))); g.rotors.push(r); g.add(cyl(0.03, 0.03, 0.1, b, x * 0.36, 0.05, z * 0.36, 8)); });
  g.add(ball(0.04, mat(0x55ff88, { emissive: 0x55ff88, emissiveIntensity: 3 }), 0, 0.0, 0.26, undefined, 8)); const br = grp(0, -0.1, 0.1, g); br.add(cyl(0.02, 0.02, 0.5, mat(0x3fa0ff), 0, -0.25, 0, 8)); br.add(rbox(0.06, 0.08, 0.12, mat(0xffffff), 0, -0.52, 0.04)); g.brush = br; return g; }
function makeConveyor(len) { const g = grp(); const t = stripeTex.clone(); t.needsUpdate = true; t.repeat.set(1, len / 1.2); const top = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.06, len), new THREE.MeshStandardMaterial({ map: t, roughness: 0.6 })); top.position.y = 0.62; top.receiveShadow = true; g.add(top);
  g.add(rbox(1.42, 0.5, len, mat(0x4a5060, { metalness: 0.4, roughness: 0.5 }), 0, 0.34, 0)); for (let z = -len / 2 + 0.4; z < len / 2; z += 1.2) g.add(rbox(0.12, 0.2, 0.12, mat(0xffc21f), 0.72, 0.4, z)); g.tex = t; return g; }
function makeClaw() { const g = grp(); const m = mat(0xffb21f, { roughness: 0.35, metalness: 0.3 }); g.add(rbox(0.5, 0.3, 0.5, mat(0x3a3f48, { metalness: 0.5 }), 0, 0.15, 0)); const a1 = grp(0, 0.3, 0, g); a1.add(rbox(0.22, 1.4, 0.22, m, 0, 0.7, 0)); const a2 = grp(0, 1.4, 0, a1); a2.add(rbox(0.18, 1.1, 0.18, m, 0, 0.55, 0)); const hd = grp(0, 1.1, 0, a2); hd.add(rbox(0.3, 0.12, 0.2, mat(0x3a3f48)));
  hd.add(rbox(0.05, 0.25, 0.12, mat(0x3a3f48), -0.12, -0.15, 0)); hd.add(rbox(0.05, 0.25, 0.12, mat(0x3a3f48), 0.12, -0.15, 0)); g.a1 = a1; g.a2 = a2; g.hd = hd; return g; }
function makeMedal() { const g = grp(); T(g, cyl(0.22, 0.22, 0.04, GOLD, 0, 0, 0, 32)).rotation.x = Math.PI / 2; g.add(rbox(0.12, 0.5, 0.02, mat(0x1f4fd6), 0, 0.36, 0)); return g; }
function lineMesh(n, col = 0xf2f2f2) { const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3)); const l = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: col })); l.frustumCulled = false; l.setPts = (pts) => { const a = geo.attributes.position.array; pts.forEach((p, i) => { a[i * 3] = p.x; a[i * 3 + 1] = p.y; a[i * 3 + 2] = p.z; }); for (let i = pts.length; i < n; i++) { a[i * 3] = pts[pts.length - 1].x; a[i * 3 + 1] = pts[pts.length - 1].y; a[i * 3 + 2] = pts[pts.length - 1].z; } geo.attributes.position.needsUpdate = true; }; return l; }
const sag = (a, b, s, n = 20) => [...Array(n)].map((_, i) => { const u = i / (n - 1); return a.clone().lerp(b, u).add(V([0, -s * 4 * u * (1 - u), 0])); });
{ // ---- the flat: living room (sofa, coffee table, rota fridge, kitchenette, light switch, window), hallway to the front door (x 6..15)
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x1b1712);
  const key = lightRig(sc, { env: 0.35, sky: 0xfff0dc, ground: 0x4a3a2c, hemi: 0.45, keyC: 0xffe2b8, key: 1.15, keyPos: [-4, 9, 7], R: 11, target: [0, 0, -2] });
  const fl = new THREE.MeshStandardMaterial({ map: woodTex('#8a6a4a', 3), roughness: 0.55, envMapIntensity: 0.6 }); sc.add(rbox(32, 0.2, 14, fl, 4, -0.1, -0.5));
  const wallM = mat(0xcbb79a, { roughness: 0.92 }), wallM2 = mat(0xb9a688, { roughness: 0.92 });
  sc.add(rbox(12.4, 6, 0.3, wallM, 0, 3, -5.15)); sc.add(rbox(0.3, 6, 10.4, wallM2, -6.15, 3, 0));
  sc.add(rbox(0.3, 6, 4.0, wallM2, 6.15, 3, -3.2)); sc.add(rbox(0.3, 6, 4.4, wallM2, 6.15, 3, 2.5));   // right wall with the hallway opening (z -1.2..0.3)
  sc.add(rbox(9.4, 6, 0.3, wallM, 10.6, 3, -1.35)); sc.add(rbox(9.4, 6, 0.3, wallM, 10.6, 3, 0.45)); sc.add(rbox(9.4, 0.3, 2.1, wallM, 10.6, 4.4, -0.45));   // hallway (ceiling low so the long lens reads as a corridor)
  const door = grp(15.2, 0, -0.45, sc); door.add(rbox(0.16, 3.4, 1.6, mat(0x2f5b8a, { roughness: 0.5 }), 0, 1.7, 0)); door.add(ball(0.07, GOLD, -0.12, 1.6, 0.55)); sc.add(rbox(0.3, 0.6, 1.9, wallM, 15.3, 3.7, -0.45));
  const outside = new THREE.PointLight(0xfff2d0, 0, 8, 1.4); outside.position.set(16.5, 2.5, -0.45); sc.add(outside);
  // window (back wall), with blinds and a daylight panel behind
  sc.add(rbox(3.0, 0.18, 0.4, mat(0xffffff), -2.4, 1.85, -4.9)); const sky = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 2.2), new THREE.MeshBasicMaterial({ color: 0xbfe3ff, toneMapped: false })); sky.position.set(-2.4, 3.1, -5.0); sc.add(sky);
  [-3.85, -0.95].forEach(x => sc.add(rbox(0.12, 2.4, 0.3, mat(0xffffff), x, 3.1, -4.95))); sc.add(rbox(3.0, 0.12, 0.3, mat(0xffffff), -2.4, 4.3, -4.95));
  const blinds = grp(-2.4, 4.2, -4.85, sc); for (let i = 0; i < 9; i++) blinds.add(rbox(2.8, 0.05, 0.12, mat(0xf7f4ec), 0, -i * 0.13, 0)); const winL = new THREE.PointLight(0xdcefff, 8, 9, 1.4); winL.position.set(-2.4, 3.2, -3.9); sc.add(winL);
  // ceiling lamp + floor lamp
  const lamp = practical(sc, 0.6, 5.3, -1.5, 0xffd9a0, { i: 12, d: 12, r: 0.2 }); const flamp = practical(sc, 2.7, 2.6, -3.9, 0xffc27a, { i: 0, d: 6, r: 0.16, ei: 0 }); sc.add(cyl(0.03, 0.03, 2.6, mat(0x222222), 2.7, 1.3, -3.9, 8)); sc.add(cone(0.36, 0.4, mat(0xf2e6cc, { roughness: 0.8 }), 2.7, 2.72, -3.9));
  const sofa = makeSofa(); sofa.position.set(0, 0, -3.6); sc.add(sofa);
  const table = grp(0, 0, -0.75, sc); table.add(rbox(1.9, 0.08, 1.0, mat(0x5b3d26, { roughness: 0.4 }), 0, 0.62, 0)); [[-0.85, -0.4], [0.85, -0.4], [-0.85, 0.4], [0.85, 0.4]].forEach(([x, z]) => table.add(rbox(0.08, 0.6, 0.08, mat(0x3a2716), x, 0.3, z)));
  sc.add(rbox(4.2, 0.03, 3.2, mat(0x9b3b3b, { roughness: 1 }), 0, 0.016, -2.0));   // rug
  const pizza = grp(); pizza.add(rbox(0.9, 0.08, 0.9, mat(0xd9b77e, { roughness: 0.9 }))); pizza.add(rbox(0.5, 0.01, 0.3, mat(0xd7262e), 0, 0.045, 0)); sc.add(pizza);
  const side = grp(3.2, 0, -0.6, sc); side.add(rbox(1.2, 0.9, 0.8, mat(0x3f4a5a, { roughness: 0.5 }), 0, 0.45, 0));   // TV unit with the remote
  const remote = grp(); remote.add(rbox(0.12, 0.05, 0.36, mat(0x18181c, { roughness: 0.4 }))); remote.add(rbox(0.04, 0.02, 0.04, mat(0xff2a2a, { emissive: 0xff2a2a }), 0, 0.03, 0.12)); sc.add(remote);
  // kitchenette (left wall) + fridge with the rota (near the front)
  sc.add(rbox(1.0, 1.2, 4.2, mat(0xf3f1ec, { roughness: 0.5 }), -5.6, 0.6, -2.6)); sc.add(rbox(1.1, 0.1, 4.3, mat(0x2b2b30, { roughness: 0.3 }), -5.6, 1.25, -2.6)); sc.add(rbox(0.7, 0.12, 0.9, mat(0xc8ccd2, { metalness: 0.8, roughness: 0.25 }), -5.5, 1.26, -2.8));
  sc.add(cyl(0.03, 0.03, 0.5, mat(0xc8ccd2, { metalness: 0.9 }), -5.85, 1.55, -2.8, 8)); const plates = [...Array(6)].map((_, i) => { const p = cyl(0.26, 0.26, 0.04, mat(0xf7f7f2, { roughness: 0.2 }), -5.4, 1.32 + i * 0.045, -1.6, 24); sc.add(p); return p; });
  const fridge = grp(-5.4, 0, 1.6, sc); fridge.add(rbox(1.2, 3.4, 1.1, mat(0xdfe3e8, { roughness: 0.3, metalness: 0.2 }), 0, 1.7, 0)); const rota = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 1.2), new THREE.MeshStandardMaterial({ map: rotaTex, roughness: 0.6 })); rota.position.set(0.61, 2.2, 0); rota.rotation.y = Math.PI / 2; fridge.add(rota); drawRota();
  // light switch on the back wall, right of the sofa
  const sw = grp(4.2, 2.3, -4.98, sc); sw.add(rbox(0.3, 0.42, 0.04, mat(0xffffff))); const toggle = rbox(0.08, 0.14, 0.06, mat(0xeeeeee), 0, 0.05, 0.03); sw.add(toggle);
  // Day 2: fishing rod + line + Dev's shake + splat flag
  const rod = grp(); rod.add(cyl(0.025, 0.012, 2.6, mat(0x2b2b2b, { roughness: 0.3 }), 0, 1.3, 0, 8)); rod.add(cyl(0.07, 0.07, 0.08, mat(0xc8ccd2, { metalness: 0.8 }), 0.06, 0.35, 0, 12)); sc.add(rod); const fline = lineMesh(24); sc.add(fline); const hook = ball(0.04, mat(0xc8ccd2, { metalness: 0.9 })); sc.add(hook);
  // Day 4: domino chain -> toy car down a ramp -> mousetrap -> string -> switch
  const dom = makeDominoes([[-0.45, 0, -2.45], [1.0, 0, -2.6], [2.4, 0, -2.9], [3.1, 0, -3.4], [3.4, 0, -4.1]], 22); dom.forEach(d => sc.add(d));
  const ramp = rbox(1.0, 0.06, 0.5, mat(0xffd21f), 3.85, 0.25, -4.4); ramp.rotation.z = 0.45; sc.add(ramp); const car = grp(); car.add(rbox(0.3, 0.14, 0.18, mat(0x1f8fe0, { roughness: 0.3 }), 0, 0.1, 0)); [-0.1, 0.1].forEach(x => [-0.09, 0.09].forEach(z => T(car, cyl(0.04, 0.04, 0.03, mat(0x111111), x, 0.04, z, 10)).rotation.x = Math.PI / 2)); sc.add(car);
  const trap = grp(4.55, 0, -4.4, sc); trap.add(rbox(0.32, 0.03, 0.18, mat(0xc49a6c))); const bar = grp(-0.12, 0.02, 0, trap); bar.add(rbox(0.02, 0.02, 0.17, mat(0xc8ccd2, { metalness: 0.9 }), 0.12, 0, 0)); trap.bar = bar;
  const sline = lineMesh(24, 0xffffff); sc.add(sline);
  // Day 6: SINK-O-MATIC (leaf blower + hose + spinning drum), flying plates
  const sink = grp(-4.6, 0, -2.6, sc); const drum = grp(0, 1.9, 0, sink); T(drum, cyl(0.6, 0.6, 0.5, mat(0xdfe3e8, { metalness: 0.6, roughness: 0.25 }), 0, 0, 0, 24)).rotation.z = Math.PI / 2; T(drum, cyl(0.45, 0.45, 0.52, mat(0x5a8fb8, { transparent: true, opacity: 0.6 }), 0, 0, 0, 24)).rotation.z = Math.PI / 2; sink.drum = drum;
  sink.add(rbox(0.9, 0.35, 0.35, mat(0xff7a1f, { roughness: 0.4 }), 0.6, 1.5, 0.9)); T(sink, cyl(0.08, 0.08, 1.2, mat(0x333333), 1.2, 1.5, 0.9, 10)).rotation.z = Math.PI / 2; sink.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V([-0.4, 1.3, -1.4]), V([0.2, 2.6, -0.6]), V([0, 2.1, -0.2])]), 20, 0.05, 8), mat(0x2bb673))); T(sink, new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.05, 8, 32), mat(0xffd21f))).position.set(0.27, 1.9, 0);
  sink.add(rbox(0.8, 0.16, 0.08, mat(0xd7262e, { emissive: 0xd7262e, emissiveIntensity: 0.5 }), 0, 2.75, 0.3)); sink.visible = false;
  const flying = [...Array(5)].map(() => { const p = cyl(0.26, 0.26, 0.04, mat(0xf7f7f2, { roughness: 0.2 }), 0, 0, 0, 24); p.visible = false; sc.add(p); return p; }); const shards = debrisPool(sc, 14, [0xf7f7f2, 0xe8e8e2]);
  // Day 9: drone
  const drone = makeDrone(); sc.add(drone);
  // Day 16: telescopic arm (segments that slide out of each other) + pizza box + coin + chute
  const arm = [...Array(14)].map((_, i) => { const s = rbox(1.15, 0.16 - i * 0.004, 0.16 - i * 0.004, mat(i % 2 ? 0xc8ccd2 : 0x9aa2ae, { metalness: 0.7, roughness: 0.3 })); sc.add(s); return s; }); const grab = grp(); grab.add(rbox(0.2, 0.3, 0.3, mat(0xffb21f))); sc.add(grab);
  const pbox = grp(); pbox.add(rbox(0.8, 0.1, 0.8, mat(0xe9e2d0, { roughness: 0.9 }))); pbox.add(rbox(0.5, 0.01, 0.3, mat(0xd7262e), 0, 0.055, 0)); sc.add(pbox); const coin = cyl(0.07, 0.07, 0.015, GOLD, 0, 0, 0, 20); sc.add(coin);
  // Day 20: the factory conversion (conveyors, claws, sparks)
  const fac = grp(0, 0, 0, sc); const conv = [makeConveyor(9), makeConveyor(8)]; conv[0].position.set(-1.2, 0, -0.6); conv[1].position.set(2.4, 0, -0.6); conv.forEach(c => fac.add(c));
  const claws = [[-2.6, -2.2], [0.2, -2.6], [3.9, -1.6], [-2.6, 1.4], [0.6, 1.6]].map(([x, z]) => { const c = makeClaw(); c.position.set(x, 0, z); fac.add(c); return c; });
  const sparks = [...Array(10)].map((_, i) => { const s = sparkle(0.35, 0xffc070); fac.add(s); return s; }); fac.visible = false;
  // Day 25 + END: open window string, zipline, chips; medal
  const zip = lineMesh(2, 0xffffff); sc.add(zip); const chips = grp(); chips.add(rbox(0.4, 0.3, 0.3, mat(0xd7262e))); chips.add(rbox(0.36, 0.14, 0.26, mat(0xf2c14e, { roughness: 0.8 }), 0, 0.2, 0)); sc.add(chips); const medal = makeMedal(); sc.add(medal);
  const hero = makeLazyHero(); sc.add(hero.root); const dev = makeDev(); sc.add(dev.root); sc.add(dev.shake); const priya = makePriya(); sc.add(priya.root); const host = makeHost(); sc.add(host.root); const driver = makeDriver(); sc.add(driver.root);
  const hb = blob(sc), db = blob(sc), pb = blob(sc);
  S.flat = { table, side, sc, key, hemi: sc.children.find(o => o.isHemisphereLight), hero, dev, priya, host, driver, hb, db, pb, lamp, flamp, winL, sky, blinds, outside, door, pizza, remote, rod, fline, hook, dom, car, trap, sline, toggle, sink, flying, shards, plates, drone, arm, grab, pbox, coin, fac, conv, claws, sparks, zip, chips, medal, rota, sofa };
}
{ // ---- London: rooftops at dusk / in the storm. His window (0, 6.6, 1.05) on the block at the origin; the chippy to the right; the power station far back left.
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x2a2340); sc.fog = new THREE.Fog(0x2a2340, 30, 95);
  const key = lightRig(sc, { env: 0.35, sky: 0xffb48a, ground: 0x2a2236, hemi: 0.9, keyC: 0xffa070, key: 1.3, keyPos: [18, 14, 12], R: 40, rim: 0.8, rimC: 0x7a8cff, rimPos: [-20, 12, -30] });
  const dome = skyDome('#1c1838', '#7a4a7a', '#ff9a6a', 160); sc.add(dome);
  sc.add(rbox(200, 0.2, 200, mat(0x2a2a30, { roughness: 0.8 }), 0, -0.1, -30));
  const r = rnd(42); const blds = [];
  const winLit = (seed) => { const t = windowsTex(seed, 0.75); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
  const WT = [winLit(1), winLit(2), winLit(3)];
  const PATH = [[0, 0], [-4, -6], [-8, -11], [-12, -17], [-16, -22], [-19, -27]];   // rooftops the domino chain runs over (x, z), all 8 high
  const addB = (x, z, w, d, h, c) => { const m = new THREE.MeshStandardMaterial({ color: c, roughness: 0.85, emissive: 0xffd9a0, emissiveMap: WT[blds.length % 3], emissiveIntensity: 1.0 }); WT.forEach(t => t.repeat.set(Math.max(1, Math.round(w / 2)), Math.max(1, Math.round(h / 3))));
    const b = new THREE.Mesh(rgeo(w, h, d), m); b.position.set(x, h / 2, z); b.castShadow = b.receiveShadow = true; sc.add(b); sc.add(rbox(w + 0.2, 0.3, d + 0.2, mat(0x3a3a44), x, h + 0.15, z)); blds.push({ b, m, x, z, h }); return b; };
  PATH.forEach(([x, z], i) => { if (i) addB(x, z, 4.2, 4.2, 8, [0x8a5a4a, 0x6a6a7a, 0x9a7a5a][i % 3]); });
  for (let i = 0; i < 70; i++) { const x = -40 + r() * 80, z = -70 + r() * 70; if (Math.abs(x) < 4 && Math.abs(z) < 4) continue; if (PATH.some(([px, pz]) => Math.hypot(px - x, pz - z) < 4.5)) continue; if (x < -14 && z < -28) continue; if (Math.hypot(x - 14, z + 8) < 6) continue;
    addB(x, z, 3 + r() * 4, 3 + r() * 4, 5 + r() * 12, [0x8a5a4a, 0x6a6a7a, 0x9a7a5a, 0x5a6a7a, 0x7a4a3a][i % 5]); }
  // his block (front face toward +z) with the window
  const home = addB(0, 0, 5, 2.0, 8, 0xa0715a); const win = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.4), new THREE.MeshBasicMaterial({ color: 0xffd9a0, toneMapped: false })); win.position.set(0, 6.6, 1.02); sc.add(win); sc.add(rbox(1.9, 0.12, 0.3, mat(0xffffff), 0, 5.85, 1.1));
  // chippy (right): shop front with a sign
  const chippy = grp(14, 0, -8, sc); chippy.add(rbox(6, 5, 4, mat(0x2f5b8a), 0, 2.5, 0)); const sign = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 1.1), new THREE.MeshBasicMaterial({ map: canvasTex(512, 128, (g, w, h) => { g.fillStyle = '#ffd21f'; g.fillRect(0, 0, w, h); g.fillStyle = '#d7262e'; g.font = '800 92px Montserrat'; g.textAlign = 'center'; g.fillText('CHIPS', w / 2, 98); }), toneMapped: false })); sign.position.set(0, 4.2, 2.02); chippy.add(sign);
  // power station (far back left) + giant lever on its roof platform + engineer
  const ps = grp(-24, 0, -33, sc); ps.add(rbox(12, 9, 8, mat(0x5a5e66, { roughness: 0.7 }), 0, 4.5, 0)); [-3, 3].forEach(x => ps.add(cyl(1.1, 1.4, 16, mat(0x7a7e86), x, 8, -2, 20))); ps.add(rbox(12.4, 0.4, 8.4, mat(0x3a3a44), 0, 9.2, 0));
  const lever = makeLever(2.2); lever.position.set(2.5, 9.4, 2.6); ps.add(lever); const eng = makeEngineer(); eng.root.position.set(-0.5, 9.4, 2.4); ps.add(eng.root);
  const psLight = new THREE.PointLight(0xbfe3ff, 0, 30, 1.2); psLight.position.set(0, 14, 4); ps.add(psLight);
  // the string web: from his window to rooftops + the chippy (lines), a zipline basket of chips, the domino chain along PATH
  const strings = []; const W0 = V([0.4, 6.7, 1.1]); const webEnds = [[-4, 8.3, -6], [5, 11, -14], [-10, 13, -20], [14, 5.2, -6.2], [8, 9, -4], [-12, 8.3, -17], [20, 12, -24]];
  webEnds.forEach(e => { const l = lineMesh(20, 0xf2f2f2); l.setPts(sag(W0, V(e), 0.6)); sc.add(l); strings.push(l); });
  const zipChips = grp(); zipChips.add(rbox(0.5, 0.35, 0.4, mat(0xd7262e))); zipChips.add(rbox(0.46, 0.18, 0.36, mat(0xf2c14e), 0, 0.25, 0)); zipChips.add(cyl(0.02, 0.02, 0.6, mat(0xdddddd), 0, 0.5, 0, 6)); sc.add(zipChips);
  const roofPts = [V([0, 8.3, 0]), ...PATH.slice(1).map(([x, z]) => V([x, 8.3, z])), V([-21.5, 9.6, -30.4])]; const roofCurve = new THREE.CatmullRomCurve3(roofPts);
  const rdom = [...Array(60)].map((_, i) => { const u = i / 59; const p = roofCurve.getPointAt(u), tg = roofCurve.getTangentAt(u); const d = grp(p.x, p.y, p.z, sc); d.rotation.y = Math.atan2(tg.x, tg.z); d.add(rbox(0.5, 0.9, 0.14, mat(i % 2 ? 0xf5f5f0 : 0x1d1d22, { roughness: 0.3 }), 0, 0.45, 0)); return d; });
  const neighbour = npc(2, { hairStyle: 'long' }); neighbour.legs.forEach(L => L.thigh.visible = false); sc.add(neighbour.root); const nwin = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), new THREE.MeshBasicMaterial({ color: 0xffd9a0, toneMapped: false })); nwin.position.set(-1.6, 3.9, 1.02); sc.add(nwin); sc.add(rbox(1.8, 0.12, 0.3, mat(0xffffff), -1.6, 3.1, 1.1));   // the neighbour's window, one floor below his
  // rain (instanced streaks) for the storm
  const rainM = new THREE.InstancedMesh(new THREE.BoxGeometry(0.02, 0.9, 0.02), new THREE.MeshBasicMaterial({ color: 0xaab8d8, transparent: true, opacity: 0.5 }), 900); rainM.frustumCulled = false; sc.add(rainM); const rainD = [...Array(900)].map(() => [r() * 60 - 30, r() * 30, r() * 60 - 50, 0.6 + r() * 0.4]);
  const mt = new THREE.Matrix4(); const rain = (O, on) => { rainM.visible = on; if (!on) return; rainD.forEach((d, i) => { const y = 30 - ((d[1] + O * 26 * d[3]) % 30); mt.makeTranslation(d[0] + y * 0.08, y, d[2]); rainM.setMatrixAt(i, mt); }); rainM.instanceMatrix.needsUpdate = true; };
  S.city = { sc, key, dome, blds, win, home, strings, zipChips, rdom, roofCurve, lever, eng, ps, psLight, neighbour, nwin, rain, chippy, W0 };
  // power: 1 = everything lit; lightsWave(O, t0) relights from the power station outwards
  S.city.power = (k, O, t0) => { blds.forEach(B => { const d = Math.hypot(B.x + 24, B.z + 33); const on = t0 == null ? k : clamp((O - t0 - d * 0.035) / 0.15); B.m.emissiveIntensity = on; }); win.material.color.setHex(0xffd9a0).multiplyScalar(t0 == null ? Math.max(0.12, k) : 1); nwin.material.color.setHex(0xffd9a0).multiplyScalar(t0 == null ? Math.max(0.12, k) : clamp((O - t0 - 0.8) / 0.15)); };
}

// ---------------------------------------------------------------- shot system + helpers
const cam = new THREE.PerspectiveCamera(40, W / H, 0.05, 4000);
const shots = []; const shot = (t0, t1, scene, camA, setup, fx = {}) => shots.push({ t0, t1, scene, cam: camA, setup, ...fx });
const shake = (O, t0, amt, dur = 0.45) => { const k = clamp(1 - (O - t0) / dur); return O < t0 || k <= 0 ? 0 : amt * k * k; };
function resetRig(P) { P.root.position.set(0, 0, 0); P.root.rotation.set(0, 0, 0); P.root.scale.setScalar(1); P.root.visible = true; P.glasses.visible = false; }
function talking(speaker, O) { return DIALOGUE.some(c => c.speaker === speaker && c.kind !== 'shout' && spanHit(c, O)); }
const wp = (o) => { const v = new THREE.Vector3(); o.updateWorldMatrix(true, false); return o.getWorldPosition(v); };
function hp(P, O, pos, ry, p, expr, who = 'hero') { P.root.visible = true; P.root.position.set(...pos); P.root.rotation.set(0, ry, 0); pose(P, p); P.face(expr, O, talking(who, O)); }
const SIT = { bob: 0.07, legs: [[1.5, 1.45], [1.5, 1.45]] };
const TSIT = { bob: -0.32, legs: [[1.5, 1.45], [1.5, 1.45]] };
const tS = (d) => TL[d].t, tE = (d) => TL[d].t1;
// ===== The flat: title .. Day 13 =====
const F = S.flat; const SEAT = 0.7, SZ = -3.55;   // sofa cushion top and depth line
const Q = (x, y, z, o = 'YXZ') => new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z, o));
const ON_BACK = Q(-Math.PI / 2, Math.PI / 2, 0), FACE_DOWN = Q(Math.PI / 2, -Math.PI / 2, 0);   // both: head toward -x
function orient(obj, from, to) { const d = to.clone().sub(from); obj.position.copy(from); obj.quaternion.setFromUnitVectors(V([0, 1, 0]), d.normalize()); }
function flatBase(O, o = {}) { const f = F;
  [f.hero, f.dev, f.priya, f.host, f.driver].forEach(P => { resetRig(P); P.root.visible = false; }); [f.hb, f.db, f.pb].forEach(b => b.visible = false); f.priya.marker.visible = false; f.dev.shake.visible = false;
  [f.pizza, f.remote, f.rod, f.fline, f.hook, f.car, f.sline, f.drone, f.grab, f.pbox, f.coin, f.zip, f.chips, f.medal].forEach(m => m.visible = false); f.arm.forEach(s => s.visible = false); f.flying.forEach(p => p.visible = false); f.shards.forEach(D => D.m.visible = false);
  f.dom.forEach(d => { d.visible = !!o.dom; d.rotation.x = 0; }); f.trap.visible = !!o.dom; f.trap.bar.rotation.z = 0; f.toggle.position.y = 0.05; f.sink.visible = !!o.sink; f.fac.visible = !!o.fac; f.plates.forEach(p => p.visible = !o.sink);
  f.door.visible = true; f.outside.intensity = 0; f.blinds.visible = !o.open; const lit = o.lit ?? 1; f.lamp.light.intensity = 12 * lit; f.lamp.children[0].material.emissiveIntensity = 3 * lit; f.key.intensity = 1.15 * (0.05 + 0.95 * lit); f.hemi.intensity = 0.45 * (0.12 + 0.88 * lit); f.sc.environmentIntensity = 0.35 * (0.1 + 0.9 * lit); f.winL.intensity = o.night ? 2 : 8 * (0.3 + 0.7 * lit);
  f.sky.material.color.setHex(o.night ? 0x1a2240 : 0xbfe3ff); f.flamp.light.intensity = o.lamp ? 34 : 0; f.flamp.children[0].material.emissiveIntensity = o.lamp ? 3 : 0; drawRotaOnce(o.rota || {}); return f.hero; }
let _rota = ''; function drawRotaOnce(st) { const k = JSON.stringify(st); if (k !== _rota) { drawRota(st); _rota = k; } }
function put(P, b, O, pos, ry, p, expr, who) { hp(P, O, pos, ry, p, expr, who); if (b) { b.visible = true; b.position.set(pos[0], 0.012, pos[2]); } }
function lieAt(O, x, q, p = {}, expr = 'calm', y = SEAT + 0.26, z = SZ) { const h = F.hero; hp(h, O, [x, y, z], 0, { ...p }, expr); h.root.quaternion.copy(q); return h; }
const LAZY = (O) => ({ headX: -0.15 + Math.sin(O * 0.8) * 0.03, arms: [[0.1, 0, 0.25, 0.3], [-2.6, 0, -0.5, 1.9]] });
const DANGLE = (k = 1) => [0, -0.9 * k, 1.5 * k + 0.25 * (1 - k), 0.3];   // front arm hangs off the sofa edge toward the floor   // on his back, one hand behind his head
// ---- TITLE: rota in the foreground (Priya pins it), push across the mess to the sofa; Dev lunges past
shot(0, TL[1].t, 'flat', { ease: 'io', p0: [-2.9, 2.5, 3.4], p1: [-1.2, 2.3, 2.4], l0: [-4.8, 2.2, 1.6], l1: [-0.2, 1.0, -3.5], fov: 48 }, (lt, O) => { flatBase(O); const h = lieAt(O, 1.15, FACE_DOWN, { arms: [[0.1, 0, 0.2, 0.1], [0.1, 0, -0.2, 0.1]], headX: 0.25 }, 'calm', SEAT + 0.25);
  F.pizza.visible = true; F.pizza.position.set(0.15, SEAT + 0.56, SZ); F.pizza.rotation.set(0, 0.3, 0.04);
  put(F.priya, F.pb, O, [-4.05, 0, 1.45], -Math.PI / 2, { ...idle(O, 1), arms: [[-1.45, 0, 0.1, 0.2], [-1.5, 0, -0.1, 0.25]] }, 'calm', 'priya');
  const dx = lerp(2.6, -2.6, O / 4.2); put(F.dev, F.db, O, [dx, 0, -0.3], -Math.PI / 2, { ...walk(O, 9, 1.2), spineX: 0.1 }, 'smile', 'dev'); }, { grade: 'flat', dof: 0.25 });
// ---- DAY 1: "Bro. Gym?" / "Mmm… nah." / rolls off the sofa / "Floor's comfy, innit."
const T1 = tS(1), ROLL = T1 + 3.85;
const bounce = (O) => ({ ...idle(O, 2), bob: Math.abs(Math.sin(O * 7)) * 0.07, arms: [[-0.3, 0, 0.5, 1.6], [-0.3, 0, -0.5, 1.6]] });
shot(T1, T1 + 1.5, 'flat', { ease: 'lin', p0: [0.3, 2.3, 3.4], p1: [0.25, 2.25, 3.0], l0: [0.35, 1.3, -2.3], fov: 46 }, (lt, O) => { flatBase(O); lieAt(O, 1.15, ON_BACK, LAZY(O), 'calm');
  put(F.dev, F.db, O, [1.5, 0, -1.6], -2.27, { ...bounce(O), headX: 0.1 }, 'smile', 'dev'); }, { grade: 'flat', dof: 0.15 });
shot(T1 + 1.5, ROLL, 'flat', { ease: 'lin', p0: [-0.65, 3.2, -1.85], p1: [-0.7, 3.1, -2.0], l0: [-0.95, 1.2, -3.5], fov: 40 }, (lt, O) => { flatBase(O); lieAt(O, 1.15, ON_BACK, { ...LAZY(O), headY: 0.35 }, 'calm');
  put(F.dev, F.db, O, [1.5, 0, -1.6], -2.27, bounce(O), 'smile', 'dev'); }, { grade: 'flat', dof: 0.15 });
shot(ROLL, T1 + 4.8, 'flat', { ease: 'lin', p0: [4.0, 1.1, -2.0], p1: [3.8, 1.05, -2.1], l0: [-0.2, 0.55, -2.9], fov: 46 }, (lt, O) => { flatBase(O); const k = eIn(seg(O, ROLL + 0.05, ROLL + 0.55)), r = eIO(seg(O, ROLL + 0.05, ROLL + 0.55));
  const q = ON_BACK.clone().slerp(FACE_DOWN, r); const h = lieAt(O, 1.15, q, { arms: [[-0.3 * (1 - r), 0, 0.4, 0.2], [-0.3, 0, -0.4, 0.2]] }, 'shock', lerp(SEAT + 0.26, 0.25, k), lerp(SZ, -2.55, r));
  put(F.dev, F.db, O, [1.5, 0, -1.6], -2.27, { ...idle(O, 2), headX: 0.3 }, 'shock', 'dev'); }, { grade: 'flat', shakeAt: [[ROLL + 0.55, 0.02]] });
shot(T1 + 4.8, tE(1), 'flat', { ease: 'lin', p0: [-1.45, 0.75, -0.15], p1: [-1.4, 0.72, -0.3], l0: [-0.9, 0.35, -2.55], fov: 40, shift: 0.0 }, (lt, O) => { flatBase(O); lieAt(O, 1.15, FACE_DOWN, { arms: [[0.0, 0, 0.4, 0.2], [0.0, 0, -0.4, 0.2]], headY: 0.5 }, 'calm', 0.25, -2.55);
  put(F.dev, F.db, O, [1.5, 0, -1.6], -2.27, { ...idle(O, 2), headX: 0.35, arms: [[0, 0, 0.13, 0.15], [-0.5, 0, -0.6, 2.2]] }, 'confused', 'dev'); }, { grade: 'flat', dof: 0.15 });
// ---- DAY 2: fishing for the remote; the hook catches Dev's shake -> splat on Priya's rota; second cast lands the remote
const T2 = tS(2), CAST1 = T2 + 2.3, HOOKED = T2 + 2.75, SPLAT = T2 + 3.35, CAST2 = T2 + 5.0, REEL = T2 + 5.5;
const RTARGET = V([3.2, 0.95, -0.6]), SHAKE0 = () => wp(F.dev.arms[1].el).add(V([0, -0.45, 0.05])), ROTA = V([-4.77, 2.2, 1.6]);
function rodScene(O, o = {}) { const h = lieAt(O, 1.15, ON_BACK, { headX: -0.25, headY: 0.4, arms: [[-1.3 + 0.25 * Math.sin(O * 3) * (o.reel || 0), -0.3, 0.5, 0.6], [-2.6, 0, -0.5, 1.9]] }, o.expr || 'calm');
  const hand = wp(h.arms[0].el).add(V([0, -0.1, 0])); const dir = (o.aim || RTARGET).clone().sub(hand).normalize(); dir.y += 0.9; dir.normalize(); const tip = hand.clone().addScaledVector(dir, 2.6);
  F.rod.visible = true; orient(F.rod, hand, tip); F.fline.visible = F.hook.visible = true; const end = o.hook || tip.clone().add(V([0, -0.3, 0])); F.hook.position.copy(end); F.fline.setPts(sag(tip, end, o.sag ?? 0.25, 24)); return h; }
shot(T2, CAST1, 'flat', { ease: 'lin', p0: [-0.65, 3.2, -1.85], p1: [-0.7, 3.1, -2.0], l0: [-0.95, 1.2, -3.5], fov: 40 }, (lt, O) => { flatBase(O); lieAt(O, 1.15, ON_BACK, { ...LAZY(O), headY: 0.4 }, 'calm');
  put(F.dev, F.db, O, [2.0, 0, -0.5], -2.4, { ...idle(O, 2), arms: [[0, 0, 0.13, 0.15], [-0.9, 0, -0.2, 1.6]] }, 'calm', 'dev'); F.dev.shake.visible = true; F.dev.shake.position.copy(SHAKE0()); }, { grade: 'flat', dof: 0.15 });
shot(CAST1, SPLAT, 'flat', { ease: 'lin', p0: [-1.9, 2.6, -3.2], p1: [-1.7, 2.6, -2.8], lf: (O) => V([2.0, 1.4, -0.5]).lerp(V([-4.6, 2.1, 1.5]), eIO(seg(O, HOOKED + 0.05, SPLAT))), fov: 50 }, (lt, O) => { flatBase(O);
  put(F.dev, F.db, O, [2.0, 0, -0.5], -2.4, { ...idle(O, 2), arms: [[0, 0, 0.13, 0.15], [O < HOOKED ? -0.9 : -0.3, 0, -0.2, O < HOOKED ? 1.6 : 0.4]] }, O < HOOKED ? 'calm' : 'shock', 'dev');
  const s0 = SHAKE0(); const fly = seg(O, HOOKED, SPLAT); const cast = eOut(seg(O, CAST1, HOOKED));
  const sh = O < HOOKED ? s0 : s0.clone().lerp(ROTA, fly).add(V([0, 2.2 * Math.sin(Math.PI * fly), 0]));
  F.dev.shake.visible = O < SPLAT; F.dev.shake.position.copy(sh); F.dev.shake.rotation.set(fly * 9, 0, fly * 5);
  rodScene(O, { hook: O < HOOKED ? null : sh.clone().add(V([0, 0.3, 0])), sag: O < HOOKED ? 0.25 * (1 - cast) + 0.05 : 0.05, aim: O < HOOKED ? s0.clone().lerp(V([1.4, 3, -1]), 1 - cast) : sh }); if (O < HOOKED) { const tip = F.hook.position; F.hook.position.lerp(s0, cast); F.fline.setPts(sag(wp(F.rod).add(V([0, 0, 0])), F.hook.position, 0.3 * (1 - cast) + 0.05, 24)); } }, { grade: 'flat', mblur: (O) => O > HOOKED ? 3 : 1 });
shot(SPLAT, CAST2, 'flat', { ease: 'lin', p0: [-2.6, 2.0, 3.0], p1: [-2.75, 2.0, 2.7], l0: [-4.6, 2.0, 1.5], fov: 42 }, (lt, O) => { flatBase(O, { rota: { splat: true } });
  put(F.priya, F.pb, O, [-3.8, 0, 0.5], 0.45, { ...idle(O, 1), spineX: -0.12, arms: [[-0.5, 0, 0.9, 1.9], [-0.5, 0, -0.9, 1.9]], headX: -0.1 }, 'shock', 'priya');
  burst(F.shards.slice(0, 8), O, SPLAT, ROTA.clone().add(V([0.3, 0, 0])), 1.2, 1.5); }, { grade: 'flat', dof: 0.15, shakeAt: [[SPLAT, 0.02]] });
shot(CAST2, T2 + 6.4, 'flat', { ease: 'lin', p0: [-0.4, 2.3, -2.4], p1: [-0.2, 2.25, -2.2], l0: [2.8, 1.0, -0.8], fov: 46 }, (lt, O) => { flatBase(O); const r = eIO(seg(O, REEL, T2 + 6.3)); const rem = RTARGET.clone().lerp(V([0.2, 1.6, -3.0]), r).add(V([0, Math.sin(r * Math.PI) * 0.6, 0]));
  F.remote.visible = true; F.remote.position.copy(r > 0 ? rem : RTARGET); F.remote.rotation.set(r * 3, 0.4, 0); rodScene(O, { hook: O < REEL ? RTARGET.clone().lerp(V([1.4, 3, -1]), 1 - eOut(seg(O, CAST2, REEL))) : rem.clone().add(V([0, 0.06, 0])), sag: 0.08, reel: 1 }); }, { grade: 'flat', dof: 0.25 });
shot(T2 + 6.4, tE(2), 'flat', { ease: 'lin', p0: [-0.65, 3.2, -1.85], p1: [-0.7, 3.1, -2.0], l0: [-0.95, 1.2, -3.5], fov: 40 }, (lt, O) => { flatBase(O); const h = lieAt(O, 1.15, ON_BACK, { headX: -0.25, headY: 0.45, arms: [[-1.4, -0.2, 0.3, 1.2], [-2.6, 0, -0.5, 1.9]] }, 'smirk');
  F.remote.visible = true; F.remote.position.copy(wp(h.arms[0].el).add(V([0, 0.05, 0.12]))); F.remote.rotation.set(0.2, 0.3, 1.2); }, { grade: 'flat', dof: 0.15 });
// ---- DAY 4: blueprint, then the chain: dominoes -> toy car -> mousetrap -> string -> switch. DING. Dark. "Night."
const T4 = tS(4), FLICK = T4 + 1.75, DOMS = [T4 + 1.9, T4 + 3.4], CAR = [T4 + 3.4, T4 + 3.9], SNAP = T4 + 4.05, DING4 = T4 + 4.45;
function chain4(O) { fallDominoes(F.dom, O, DOMS[0], DOMS[1]); const c = eIn(seg(O, CAR[0], CAR[1])); F.car.visible = true; F.car.position.set(lerp(3.45, 4.3, c), lerp(0.48, 0.05, c), -4.4); F.car.rotation.z = c < 1 ? 0.45 : 0;
  F.trap.bar.rotation.z = O > SNAP ? -Math.PI * eOut(seg(O, SNAP, SNAP + 0.08)) : 0; const tug = eOut(seg(O, SNAP, DING4)); F.sline.visible = true;
  const a = V([4.45, 0.05, -4.4]).add(V([0, 0.3 * tug, 0])), b = V([4.2, 2.25, -4.92]); F.sline.setPts(sag(a, b, 0.15 * (1 - tug), 20)); F.toggle.position.y = O > DING4 ? -0.05 : 0.05; }
shot(T4, FLICK - 0.3, 'flat', { ease: 'lin', p0: [0, 2, 4], l0: [0, 1, 0], fov: 40 }, (lt, O) => { flatBase(O, { dom: true }); lieAt(O, 1.15, ON_BACK, LAZY(O), 'calm'); }, { grade: 'flat', bp: 'light' });
shot(FLICK - 0.3, DOMS[0] + 0.6, 'flat', { ease: 'lin', p0: [-1.2, 1.3, -0.7], p1: [-1.1, 1.25, -0.85], l0: [-0.35, 0.45, -2.65], fov: 46, shift: 0.0 }, (lt, O) => { flatBase(O, { dom: true }); const k = Math.sin(Math.PI * seg(O, FLICK - 0.25, FLICK + 0.1));
  lieAt(O, 1.15, ON_BACK, { headX: -0.2, headY: 0.4, arms: [DANGLE(1).map((v, j) => j === 1 ? v - 0.25 * k : v), [-2.6, 0, -0.5, 1.9]] }, 'calm'); chain4(O); }, { grade: 'flat', dof: 0.15 });
shot(DOMS[0] + 0.6, CAR[1], 'flat', { ease: 'lin', p0: [1.4, 1.2, -1.2], p1: [4.4, 1.1, -2.3], l0: [0.6, 0.2, -2.65], l1: [3.5, 0.3, -4.1], fov: 46, shift: 0.02 }, (lt, O) => { flatBase(O, { dom: true }); lieAt(O, 1.15, ON_BACK, LAZY(O), 'calm'); chain4(O); }, { grade: 'flat', dof: 0.15, mblur: 2 });
shot(CAR[1], DING4 + 0.25, 'flat', { ease: 'lin', p0: [4.0, 2.25, -3.9], p1: [4.05, 2.27, -4.05], l0: [4.2, 2.25, -4.95], fov: 40 }, (lt, O) => { flatBase(O, { dom: true, lit: O > DING4 ? 0.05 : 1 }); lieAt(O, 1.15, ON_BACK, LAZY(O), 'calm'); chain4(O); }, { grade: 'flat', shakeAt: [[DING4, 0.008]] });
shot(DING4 + 0.25, tE(4), 'flat', { ease: 'lin', p0: [1.2, 2.6, 2.2], p1: [1.0, 2.5, 1.9], l0: [0.0, 1.0, -3.4], fov: 44 }, (lt, O) => { flatBase(O, { dom: true, lit: 0.05, night: true }); lieAt(O, 1.15, ON_BACK, { ...LAZY(O), headY: 0.2 }, 'smirk'); chain4(O); }, { grade: 'dark' });
// ---- DAY 6: INFOMERCIAL. The host presents the SINK-O-MATIC; plates fly out like frisbees; Dev catches four, the fifth smashes; yawned BOMBOCLAT
const T6 = tS(6), BLOW = T6 + 5.3, SMASH = T6 + 6.4;
const PL0 = V([-4.6, 1.9, -2.3]); const plateAt = (i, O) => { const t0 = BLOW + 0.1 + i * 0.22, k = seg(O, t0, t0 + 0.55); const end = i < 4 ? V([0.1, 1.45 + (i % 2) * 0.25, 0.95]) : V([-0.9, 0.03, 1.6]); return { k, t0, p: PL0.clone().lerp(end, k).add(V([0, Math.sin(Math.PI * k) * (i < 4 ? 0.9 : 0.6), 0])) }; };
shot(T6, BLOW, 'flat', { ease: 'lin', p0: [-2.6, 2.3, 4.4], p1: [-2.65, 2.3, 4.2], l0: [-3.9, 1.6, -1.8], fov: 46, live: 0.2 }, (lt, O) => { flatBase(O, { sink: true }); lieAt(O, 1.15, ON_BACK, LAZY(O), 'calm');
  F.sink.drum.rotation.x = 0; put(F.host, null, O, [-3.2, 0, -1.2], 0.35, { ...idle(O, 3), arms: [[-0.3, 0, 0.3, 0.4], [-1.4 + 0.2 * Math.sin(O * 4), 0.4, -0.9, 0.3]], headY: 0.15 }, 'smile', 'host'); }, { grade: 'tv', tv: true });
shot(BLOW, SMASH + 0.5, 'flat', { ease: 'lin', p0: [4.8, 3.0, 3.6], p1: [4.6, 2.95, 3.4], l0: [-2.6, 1.5, -1.4], fov: 48, live: 0.2 }, (lt, O) => { flatBase(O, { sink: true }); lieAt(O, 1.15, ON_BACK, LAZY(O), 'calm'); F.sink.drum.rotation.x = -(O - BLOW) * 14;
  put(F.host, null, O, [-3.2, 0, -1.2], 0.6, { ...idle(O, 3), spineX: -0.15, arms: [[-2.4, 0, 0.6, 0.3], [-2.4, 0, -0.6, 0.3]] }, 'shock', 'host');
  let caught = 0; F.flying.forEach((p, i) => { const { k, p: pos } = plateAt(i, O); p.visible = k > 0 && (i < 4 ? k < 1 : k < 1); p.position.copy(pos); p.rotation.set(0.3, (O - BLOW) * 20, 0.2); if (i < 4 && k >= 1) caught++; });
  put(F.dev, F.db, O, [0.4, 0, 1.25], -2.18, { ...idle(O, 2), spineX: 0.15, arms: [[-1.4, 0, 0.3, 0.4], [-1.4, 0, -0.3, 0.4]] }, caught > 2 ? 'grit' : 'shock', 'dev');
  burst(F.shards, O, SMASH, V([-0.9, 0.1, 1.6]), 2.0, 1.8); }, { grade: 'tv', tv: true, shakeAt: [[SMASH, 0.015]], mblur: 2 });
shot(SMASH + 0.5, tE(6), 'flat', { ease: 'lin', p0: [-0.65, 3.2, -1.85], p1: [-0.7, 3.1, -2.0], l0: [-0.95, 1.2, -3.5], fov: 40, live: 0.3 }, (lt, O) => { flatBase(O, { sink: true }); lieAt(O, 1.15, ON_BACK, { ...LAZY(O), headY: 0.45 }, O > T6 + 7.9 && O < T6 + 9.3 ? 'yawn' : 'shock'); }, { grade: 'tv', tv: true });
// ---- DAY 9: blueprint, the BRUSH-DRONE brushes his teeth, then Dev's eyebrows
const T9 = tS(9), DR = T9 + 1.4, DOFF = T9 + 4.3;
function droneAt(O) { const d = F.drone; d.visible = true; d.rotors.forEach((r, i) => r.rotation.y = O * 60 + i); const hd = V([-1.0, 1.75, SZ + 0.12]), dv = V([1.9, 2.55, 0.1]);
  let p = O < DOFF ? V([1.5, 3.6, -1.5]).lerp(hd, eOut(seg(O, DR, DR + 1.0))) : hd.clone().lerp(dv, eIO(seg(O, DOFF, DOFF + 0.9))); p.add(V([Math.sin(O * 31) * 0.03, Math.sin(O * 23) * 0.03, 0])); d.position.copy(p); d.rotation.set(0.1 * Math.sin(O * 5), O < DOFF ? 0.3 : -0.9, 0.08 * Math.sin(O * 7)); d.brush.rotation.x = 0.5 + 0.35 * Math.sin(O * 26); }
shot(T9, DR, 'flat', { ease: 'lin', p0: [0, 2, 4], l0: [0, 1, 0], fov: 40 }, (lt, O) => { flatBase(O); lieAt(O, 1.15, ON_BACK, LAZY(O), 'calm'); }, { grade: 'flat', bp: 'drone' });
shot(DR, DOFF + 0.1, 'flat', { ease: 'lin', p0: [-0.9, 4.9, SZ + 1.1], p1: [-0.9, 4.6, SZ + 1.0], l0: [-0.9, 1.0, SZ + 0.1], fov: 46, shift: 0 }, (lt, O) => { flatBase(O); lieAt(O, 1.15, ON_BACK, { ...LAZY(O), headX: -0.05 }, O > T9 + 2.0 ? 'yawn' : 'calm'); droneAt(O); }, { grade: 'flat' });
shot(DOFF + 0.1, tE(9), 'flat', { ease: 'lin', p0: [4.4, 2.7, 3.2], p1: [4.2, 2.65, 3.0], l0: [1.3, 2.1, -0.6], fov: 40 }, (lt, O) => { flatBase(O); lieAt(O, 1.15, ON_BACK, LAZY(O), 'calm'); droneAt(O);
  put(F.dev, F.db, O, [1.55, 0, -0.35], 0.68, { ...idle(O, 2), spineX: -0.15, headX: -0.25, arms: [[-0.2, 0, 0.6, 1.2], [-0.2, 0, -0.6, 1.2]] }, O > T9 + 4.8 ? 'grit' : 'shock', 'dev'); }, { grade: 'flat', dof: 0.15 });
// ---- DAY 13: the pause beat. Lamp light, silence, he stands, one foot hovers. "Walking is just falling… but slowly." "Mmm… nah." "bom… bo…" (asleep standing)
const T13 = tS(13), LIFT = T13 + 1.9, DOWN = T13 + 7.85, SLEEP = T13 + 11.2;
const HZ13 = [1.2, 0, -2.45];
function stand13(O) { const lift = eIO(seg(O, LIFT, LIFT + 1.0)) * (1 - eIO(seg(O, DOWN - 0.2, DOWN + 0.3))); const zz = eIO(seg(O, SLEEP - 0.6, SLEEP + 0.4));
  return { ...idle(O), spineX: 0.03 + 0.08 * zz, spineZ: 0.05 * Math.sin(O * 1.3) * zz, headX: 0.15 * lift + 0.3 * zz, legs: [[0.35 * lift, 0.5 * lift], [0, 0]], arms: [[0.05, 0, 0.18 + 0.15 * lift, 0.15], [0.05, 0, -0.18 - 0.15 * lift, 0.15]] }; }
const face13 = (O) => O > SLEEP - 0.3 ? 'yawn' : O > DOWN ? 'calm' : 'worried';
shot(T13, T13 + 4.3, 'flat', { ease: 'lin', p0: [1.95, 2.55, 0.7], p1: [1.9, 2.5, 0.45], l0: [1.25, 2.15, -2.45], fov: 40, live: 0.4 }, (lt, O) => { flatBase(O, { lit: 0.32, lamp: true, night: true }); put(F.hero, F.hb, O, HZ13, 0.25, stand13(O), face13(O));
  put(F.dev, F.db, O, [2.35, 0, -1.8], -2.0, { ...idle(O, 2), spineX: 0.2, arms: [[-0.9, 0, 0.3, 1.3], [-0.9, 0, -0.3, 1.3]] }, 'worried', 'dev'); }, { grade: 'lamp', dof: 0.15 });
shot(T13 + 4.3, DOWN + 0.4, 'flat', { ease: 'io', p0: [1.95, 2.4, 0.5], p1: [1.85, 1.1, 0.2], l0: [1.25, 2.1, -2.45], l1: [1.3, 0.45, -2.2], fov: 42, live: 0.4 }, (lt, O) => { flatBase(O, { lit: 0.32, lamp: true, night: true }); put(F.hero, F.hb, O, HZ13, 0.25, stand13(O), face13(O));
  put(F.dev, F.db, O, [2.35, 0, -1.8], -2.0, { ...idle(O, 2), spineX: 0.2, arms: [[-0.9, 0, 0.3, 1.3], [-0.9, 0, -0.3, 1.3]] }, 'shock', 'dev'); }, { grade: 'lamp', dof: 0.15 });
shot(DOWN + 0.4, T13 + 10.1, 'flat', { ease: 'lin', p0: [1.75, 2.5, 0.3], p1: [1.72, 2.48, 0.1], l0: [1.25, 2.2, -2.45], fov: 36, live: 0.4 }, (lt, O) => { flatBase(O, { lit: 0.32, lamp: true, night: true }); put(F.hero, F.hb, O, HZ13, 0.25, stand13(O), face13(O)); }, { grade: 'lamp', dof: 0.15 });
shot(T13 + 10.1, tE(13), 'flat', { ease: 'lin', p0: [1.9, 2.3, 2.4], p1: [1.88, 2.25, 2.1], l0: [1.85, 1.55, -2.5], fov: 44, live: 0.4 }, (lt, O) => { flatBase(O, { lit: 0.32, lamp: true, night: true }); put(F.hero, F.hb, O, HZ13, 0.25, stand13(O), face13(O));
  put(F.dev, F.db, O, [2.55, 0, -2.6], -1.3, { ...idle(O, 2), headX: 0.1, arms: [[0, 0, 0.13, 0.15], [-0.4, 0, -0.5, 2.2]] }, 'confused', 'dev'); }, { grade: 'lamp', dof: 0.15 });
// ===== Day 16 .. END =====
function polyAt(pts, d) { let acc = 0; for (let i = 0; i < pts.length - 1; i++) { const L = pts[i].distanceTo(pts[i + 1]); if (d <= acc + L || i === pts.length - 2) { const u = clamp((d - acc) / L); return { p: pts[i].clone().lerp(pts[i + 1], u), t: pts[i + 1].clone().sub(pts[i]).normalize() }; } acc += L; } }
const polyLen = (pts) => pts.slice(1).reduce((s, p, i) => s + p.distanceTo(pts[i]), 0);
function armAlong(pts, e, carry) {   // telescopic arm: every segment stretches over [0, e] of the path; returns the tip
  const n = F.arm.length; F.arm.forEach((s, i) => { const d = (i + 0.5) / n * e; const { p, t } = polyAt(pts, d); s.visible = e > 0.05; s.position.copy(p); s.quaternion.setFromUnitVectors(V([1, 0, 0]), t); s.scale.set(Math.max(0.05, (e / n) / 1.15) * 1.08, 1, 1); });
  const tip = polyAt(pts, e); F.grab.visible = e > 0.05; F.grab.position.copy(tip.p); F.grab.quaternion.setFromUnitVectors(V([1, 0, 0]), tip.t); if (carry) { carry.visible = true; carry.position.copy(tip.p).add(V([0, -0.2, 0])); } return tip.p; }
// ---- DAY 16: golf commentary. The arm snakes down the hallway, takes the pizza, flicks a coin; "Keep the change. It's on its way." (a second coin rolls down the arm)
const T16 = tS(16), GO = T16 + 0.6, REACH = T16 + 4.6, FLIP = T16 + 5.2, BACK = [T16 + 5.9, T16 + 8.2];
const ARMP = [V([-0.75, 1.35, -2.75]), V([1.5, 1.65, -1.5]), V([5.0, 1.7, -0.45]), V([14.75, 1.7, -0.45])]; const ARML = polyLen(ARMP);
const armE = (O) => ARML * (O < BACK[0] ? eIO(seg(O, GO, REACH)) : 1 - 0.82 * eIO(seg(O, BACK[0], BACK[1])));
function scene16(O, o = {}) { flatBase(O); const door = O > REACH - 0.6; F.door.visible = !door; F.outside.intensity = door ? 30 : 0;
  lieAt(O, 1.15, ON_BACK, { headX: -0.2, headY: 0.3, arms: [[-1.2, -0.3, 0.6, 0.3], [-2.6, 0, -0.5, 1.9]] }, o.expr || 'calm');
  const e = armE(O); const has = O > REACH + 0.15; const tip = armAlong(ARMP, e, has ? F.pbox : null);
  put(F.driver, null, O, [16.2, 0, -0.45], -Math.PI / 2, { ...idle(O, 4), arms: has ? [[-0.2, 0, 0.13, 0.4], [O > FLIP + 0.35 ? -1.3 : -0.2, 0, -0.13, O > FLIP + 0.35 ? 1.2 : 0.4]] : [[-1.1, 0, 0.12, 0.9], [-1.1, 0, -0.12, 0.9]] }, O > FLIP + 0.4 ? 'confused' : 'calm', 'driver');
  if (!has) { F.pbox.visible = door; F.pbox.position.copy(wp(F.driver.arms[0].el).lerp(wp(F.driver.arms[1].el), 0.5).add(V([-0.35, -0.3, 0]))); }
  const c1 = seg(O, FLIP, FLIP + 0.4); F.coin.visible = O > FLIP; if (O > FLIP) F.coin.position.copy(O < FLIP + 0.4 ? V([14.9, 1.7, -0.45]).lerp(wp(F.driver.arms[1].el).add(V([0, -0.4, 0])), c1).add(V([0, Math.sin(Math.PI * c1) * 0.5, 0])) : wp(F.driver.arms[1].el).add(V([0, -0.42, 0.06]))); F.coin.rotation.set(O * 20, 0, 0);
  if (o.coin2 != null) { const k = seg(O, o.coin2, o.coin2 + 6); const { p } = polyAt(ARMP, k * e); F.flying[0].visible = true; F.flying[0].material = GOLD; F.flying[0].scale.set(0.3, 1, 0.3); F.flying[0].position.copy(p).add(V([0, 0.12, 0])); F.flying[0].rotation.set(0, 0, O * 9); } }
shot(T16, REACH - 0.3, 'flat', { ease: 'lin', p0: [14.5, 1.85, -0.5], p1: [14.4, 1.83, -0.5], l0: [4.0, 1.6, -0.55], fov: 24, live: 0.3 }, (lt, O) => scene16(O), { grade: 'golf', golf: true });
shot(REACH - 0.3, T16 + 7.3, 'flat', { ease: 'lin', p0: [12.4, 2.3, 0.15], p1: [12.6, 2.25, 0.1], l0: [16.0, 1.6, -0.5], fov: 46, live: 0.3 }, (lt, O) => scene16(O), { grade: 'golf', golf: true });
shot(T16 + 7.3, tE(16), 'flat', { ease: 'lin', p0: [0.6, 3.1, -0.6], p1: [0.5, 3.05, -0.8], l0: [-0.6, 1.3, -3.2], fov: 46, live: 0.3 }, (lt, O) => { scene16(O, { coin2: T16 + 7.5, expr: O > T16 + 9.0 ? 'smirk' : 'calm' }); F.pbox.visible = true; F.pbox.position.set(-0.35, SEAT + 0.6, SZ); F.pbox.rotation.set(0, 0.2, 0); F.grab.visible = true; }, { grade: 'golf', golf: true });
// ---- DAY 20: the flat is a factory. Wide crane; Priya rides a conveyor with her rota; he glides past, eyes shut: "Mmm… nah."
const T20 = tS(20);
function factory(O, o = {}) { flatBase(O, { fac: true }); F.table.visible = F.side.visible = F.sofa.visible = false;
  const [c0, c1] = F.conv; c0.rotation.y = Math.PI / 2; c0.position.set(-1.0, 0, -1.9); c1.rotation.y = 0; c1.position.set(3.9, 0, -0.6); c0.tex.offset.y = O * 0.9; c1.tex.offset.y = -O * 0.9;
  [[-3.4, -3.3, 0], [-0.9, -3.3, 0], [1.6, -3.3, 0], [-2.2, -0.5, Math.PI], [0.4, -0.5, Math.PI]].forEach(([x, z, ry], i) => { const c = F.claws[i]; c.position.set(x, 0, z); c.rotation.y = ry; const ph = O * 3.1 + i * 1.7; c.a1.rotation.x = 0.55 + 0.25 * Math.sin(ph); c.a2.rotation.x = 1.0 + 0.4 * Math.sin(ph + 1.1); c.hd.rotation.x = 0.3 * Math.sin(ph * 2); });
  F.sparks.forEach((s, i) => { const c = F.claws[i % 5]; const on = Math.sin(O * 13 + i * 2.3) > 0.4; s.visible = on; s.position.copy(wp(c.hd)).add(V([Math.sin(i * 7) * 0.2, -0.2, Math.cos(i * 5) * 0.2])); s.scale.setScalar(0.25 + 0.2 * Math.sin(O * 40 + i)); });
  const hx = o.hx ?? lerp(-4.2, 2.6, seg(O, T20, tE(20))); lieAt(O, hx + 1.1, ON_BACK, { headX: -0.1, arms: [[0.15, 0, 0.2, 0.2], [0.15, 0, -0.2, 0.2]] }, 'sleep', 0.91, -1.9);
  const pz = lerp(-3.6, 2.6, seg(O, T20 + 1.0, tE(20))); put(F.priya, F.pb, O, [3.9, 0.66, pz], 0, { ...idle(O, 1), arms: [[-1.2, 0, 0.2, 0.9], [-1.0, 0, -0.3, 1.2]] }, 'grit', 'priya');
  F.priya.marker.visible = false; const r = F.rota; return { pz }; }
shot(T20, T20 + 2.7, 'flat', { ease: 'io', p0: [6.4, 2.6, 6.2], p1: [5.2, 7.2, 5.0], l0: [-0.5, 0.8, -1.6], l1: [-0.4, 0.5, -1.8], fov: 50 }, (lt, O) => factory(O), { grade: 'factory' });
shot(T20 + 2.7, T20 + 6.7, 'flat', { ease: 'lin', p0: [4.6, 2.6, 5.4], p1: [4.5, 2.6, 5.2], l0: [3.9, 2.0, 0.2], fov: 42 }, (lt, O) => factory(O), { grade: 'factory', dof: 0.15 });
const HX20 = (O) => lerp(-2.6, 0.4, seg(O, T20 + 6.7, tE(20)));
shot(T20 + 6.7, tE(20), 'flat', { ease: 'lin', pf: (O) => V([HX20(O) + 0.2, 2.7, 0.9]), lf: (O) => V([HX20(O) - 0.9, 1.05, -1.9]), fov: 42 }, (lt, O) => factory(O, { hx: HX20(O) }), { grade: 'factory' });
// ---- DAY 25: blueprint "LONDON MK1"; chips arrive by zipline through the open window; the drone pulls back over the string-laced city; the neighbour shouts
const T25 = tS(25), ZIP = [T25 + 1.6, T25 + 2.6], WIN = V([-2.4, 3.0, -4.95]);
shot(T25, T25 + 1.4, 'flat', { ease: 'lin', p0: [0, 2, 4], l0: [0, 1, 0], fov: 40 }, (lt, O) => { flatBase(O); }, { grade: 'flat', bp: 'london' });
shot(T25 + 1.4, T25 + 5.7, 'flat', { ease: 'lin', p0: [0.7, 2.7, -0.5], p1: [0.6, 2.65, -0.7], l0: [-1.5, 1.9, -3.9], fov: 46 }, (lt, O) => { flatBase(O, { open: true }); F.sky.material.color.setHex(0xffb488);
  const h = lieAt(O, 1.15, ON_BACK, { headX: -0.2, headY: 0.35, arms: [[-1.5, -0.2, 0.3, 0.4], [-2.6, 0, -0.5, 1.9]] }, O > T25 + 2.4 ? 'smirk' : 'calm'); const hand = wp(h.arms[0].el).add(V([0, -0.35, 0]));
  F.zip.visible = true; F.zip.setPts([WIN, hand]); const k = eIO(seg(O, ZIP[0], ZIP[1])); F.chips.visible = true; F.chips.position.copy(WIN.clone().lerp(hand, k).add(V([0, 0.25, 0]))); }, { grade: 'flat', dof: 0.15 });
function cityBase(O, o = {}) { const c = S.city; c.rain(O, !!o.rain); c.power(o.power ?? 1, O, o.wave); c.neighbour.root.visible = !!o.nb; c.eng.root.visible = !!o.eng; c.rdom.forEach(d => d.rotation.x = 0); c.lever.arm.rotation.x = 0.7; c.psLight.intensity = 0;
  c.sc.background.setHex(o.storm ? 0x0a0c16 : 0x2a2340); c.sc.fog.color.copy(c.sc.background); c.dome.visible = !o.storm; c.key.intensity = o.storm ? 0.25 : 1.3; c.zipChips.visible = false; return c; }
shot(T25 + 5.7, tE(25), 'city', { ease: 'io', p0: [0.6, 5.2, 7.0], p1: [7.0, 15.0, 24.0], l0: [-0.7, 5.0, 1.0], l1: [-4.0, 5.0, -14.0], fov: 46 }, (lt, O) => { const c = cityBase(O, { nb: true });
  hp(c.neighbour, O, [-1.6, 2.55, 1.2], 0, { ...idle(O), spineX: -0.1, arms: [[-2.3, 0, 0.3, 0.4], [-0.3, 0, -0.2, 0.3]] }, 'smile', 'neighbour');
  const k = seg(O, T25 + 5.8, tE(25)); c.zipChips.visible = true; c.zipChips.position.copy(V([14, 5.2, -6.2]).lerp(c.W0, k).add(V([0, -0.5 - 0.6 * Math.sin(Math.PI * k), 0]))); }, { grade: 'city' });
// ---- DAY 30: the storm. Blackout street by street; the engineer on the radio; one tug of the string; the domino chain over London; the lever; the lights come back
const T30 = tS(30), BLACK = T30 + 0.25, TUG = T30 + 6.5, CH = [T30 + 7.1, T30 + 9.5], LEVER = T30 + 9.65, WAVE = T30 + 10.25;
function chainCity(O) { const c = S.city; c.rdom.forEach((d, i) => { const tf = lerp(CH[0], CH[1], i / c.rdom.length); d.rotation.x = 1.25 * eIn(seg(O, tf, tf + 0.14)); }); c.lever.arm.rotation.x = 0.7 - 1.5 * eOut(seg(O, LEVER, LEVER + 0.18)); }
shot(T30, T30 + 2.3, 'city', { ease: 'lin', p0: [9.0, 17.0, 26.0], p1: [8.4, 16.4, 24.6], l0: [-6.0, 3.0, -14.0], fov: 46 }, (lt, O) => { cityBase(O, { storm: true, rain: true, power: 1 - seg(O, BLACK, BLACK + 1.2) }); S.city.power(0, O, null); const off = seg(O, BLACK, BLACK + 1.4);
  S.city.blds.forEach(B => { const d = Math.hypot(B.x - 6, B.z + 10); B.m.emissiveIntensity = clamp(1 - (off * 40 - d) / 4); }); }, { grade: 'storm', flash: BLACK, fa: [0.9, 0.5, 0.2] });
shot(T30 + 2.3, TUG - 0.2, 'city', { ease: 'lin', p0: [-16.2, 12.6, -23.4], p1: [-16.6, 12.5, -24.0], l0: [-22.8, 11.2, -30.6], fov: 44 }, (lt, O) => { const c = cityBase(O, { storm: true, rain: true, power: 0, eng: true });
  hp(c.eng, O, [-0.5, 9.4, 2.4], 0.5, { ...idle(O, 5), spineX: 0.1, arms: [[-0.2, 0, 0.3, 0.3], [-2.0, 0, -0.4, 2.1]], headX: 0.1 }, 'worried', 'engineer'); }, { grade: 'storm', flash: T30 + 3.4, fa: [0.6, 0.3, 0.1] });
shot(TUG - 0.2, CH[0], 'flat', { ease: 'lin', p0: [0.3, 2.4, -0.9], p1: [0.25, 2.35, -1.05], l0: [-0.8, 1.3, -3.1], fov: 40 }, (lt, O) => { flatBase(O, { lit: 0.18, night: true, open: true }); const t = eOut(seg(O, TUG, TUG + 0.2));
  const h = lieAt(O, 1.15, ON_BACK, { headX: -0.2, headY: 0.4, arms: [[-1.3 + 0.6 * t, -0.2, 0.4, 0.5 + 0.6 * t], [-2.6, 0, -0.5, 1.9]] }, 'calm'); const hand = wp(h.arms[0].el).add(V([0, -0.35, 0])); F.zip.visible = true; F.zip.setPts([WIN, hand]); }, { grade: 'dark', flash: TUG - 0.05, fa: [0.5, 0.25, 0.1] });
const camChain = (O, k0 = 0) => { const u = clamp(seg(O, CH[0], CH[1]) + 0.04); const c = S.city.roofCurve; return { p: c.getPointAt(Math.min(u, 1)).add(V([3.2, 2.6, 3.4])), l: c.getPointAt(Math.min(1, u + 0.03)).add(V([0, 0.4, 0])) }; };
shot(CH[0], LEVER - 0.15, 'city', { ease: 'lin', pf: (O) => camChain(O).p, lf: (O) => camChain(O).l, fov: 50 }, (lt, O) => { cityBase(O, { storm: true, rain: true, power: 0 }); chainCity(O); }, { grade: 'storm', mblur: 2 });
shot(LEVER - 0.15, WAVE, 'city', { ease: 'lin', p0: [-18.6, 10.2, -25.6], p1: [-18.8, 10.0, -26.0], l0: [-21.4, 11.8, -30.4], fov: 46 }, (lt, O) => { const c = cityBase(O, { storm: true, rain: true, power: 0, eng: true }); chainCity(O); c.psLight.intensity = O > LEVER + 0.2 ? 60 : 0;
  hp(c.eng, O, [-0.5, 9.4, 2.4], 0.5, { ...idle(O, 5), arms: [[-0.2, 0, 0.3, 0.3], [-2.0, 0, -0.4, 2.1]] }, O > LEVER ? 'shock' : 'worried', 'engineer'); }, { grade: 'storm', shakeAt: [[LEVER + 0.05, 0.02]] });
shot(WAVE, tE(30), 'city', { ease: 'io', p0: [10.0, 21.0, 26.0], p1: [8.0, 18.0, 22.0], l0: [-8.0, 3.0, -16.0], l1: [-3.0, 5.0, -4.0], fov: 48 }, (lt, O) => { const c = cityBase(O, { storm: true, rain: O < WAVE + 1.0, wave: WAVE }); chainCity(O); c.psLight.intensity = 60; }, { grade: 'city' });
// ---- END: Priya writes "SAVED LONDON ✓"; Dev bursts in; "Mmm… nah."; the arm brings the medal to his chest; "…claat."
const TE = tS('END'), WRITE = TE + 0.4, BURST = TE + 1.1, MEDAL = [TE + 5.4, TE + 7.3], WAKE = TE + 7.85;
const MEDP = [V([14.75, 1.7, -0.45]), V([5.0, 1.7, -0.45]), V([0.6, 1.9, -2.2]), V([-0.45, 1.55, -3.4])]; const MEDL = polyLen(MEDP);
function endBase(O) { flatBase(O, { rota: { saved: O > WRITE + 0.6 } }); return F.hero; }
shot(TE, BURST, 'flat', { ease: 'lin', p0: [-2.8, 2.5, 3.2], p1: [-2.9, 2.45, 3.0], l0: [-4.8, 2.2, 1.6], fov: 46 }, (lt, O) => { endBase(O);
  put(F.priya, F.pb, O, [-3.95, 0, 1.0], -1.25, { ...idle(O, 1), arms: [[-0.3, 0, 0.13, 0.3], [-1.45 + 0.08 * Math.sin(O * 18), 0.1, -0.1, 0.3]] }, 'smile', 'priya'); F.priya.marker.visible = true; }, { grade: 'flat', dof: 0.15 });
shot(BURST, TE + 4.95, 'flat', { ease: 'lin', p0: [-1.5, 2.5, -2.7], p1: [-1.4, 2.48, -2.5], l0: [2.8, 1.45, -1.3], fov: 48 }, (lt, O) => { endBase(O); const w = eOut(seg(O, BURST, BURST + 0.8));
  put(F.dev, F.db, O, [lerp(8.0, 2.1, w), 0, lerp(-0.45, -1.7, w)], -Math.PI / 2 - 0.55 * w, w < 1 ? walk(O, 11, 1.2) : { ...idle(O, 2), arms: [[-2.4, 0, 0.5, 0.3], [-2.4, 0, -0.5, 0.3]] }, 'laugh', 'dev');
  lieAt(O, 1.15, ON_BACK, LAZY(O), 'sleep'); }, { grade: 'flat', dof: 0.15 });
shot(TE + 4.95, WAKE - 0.5, 'flat', { ease: 'lin', p0: [0.9, 3.5, -0.4], p1: [0.8, 3.4, -0.6], l0: [-0.6, 1.3, -3.4], fov: 48 }, (lt, O) => { endBase(O); lieAt(O, 1.15, ON_BACK, LAZY(O), 'sleep');
  const e = MEDL * (O < MEDAL[1] ? eIO(seg(O, MEDAL[0], MEDAL[1])) : 1); const tip = armAlong(MEDP, e, null); F.medal.visible = true;
  if (O < MEDAL[1] + 0.1) { F.medal.position.copy(tip).add(V([0, -0.35, 0])); F.medal.rotation.set(0, 0, 0); } else { F.medal.position.set(-0.45, SEAT + 0.55, SZ); F.medal.rotation.set(-Math.PI / 2, 0, 0.3); } }, { grade: 'flat' });
shot(WAKE - 0.5, DUR + 0.1, 'flat', { ease: 'lin', p0: [-0.65, 3.05, -1.9], p1: [-0.7, 2.95, -2.05], l0: [-0.85, 1.2, -3.5], fov: 42 }, (lt, O) => { endBase(O); const awake = O > WAKE - 0.05 && O < WAKE + 1.0;
  lieAt(O, 1.15, ON_BACK, LAZY(O), awake ? 'calm' : 'sleep'); F.medal.visible = true; F.medal.position.set(-0.45, SEAT + 0.55, SZ); F.medal.rotation.set(-Math.PI / 2, 0, 0.3); }, { grade: 'flat', dark: (O) => clamp((O - (DUR - 0.9)) / 0.5) });
const SAFE_L = 90, SAFE_R = 140, CAP_W = W - SAFE_L - SAFE_R, CAP_X = SAFE_L + CAP_W / 2;   // safe area: full-screen players crop the edges, Instagram's buttons cover the right side
function stepAt(T) { let s = null; for (const st of STEPS) if (T >= st.t) s = st; return s; }
function spaced(g, text, x, y, sp) { let cx = x; for (const ch of text) { g.fillText(ch, cx, y); cx += g.measureText(ch).width + sp; } return cx - x; }
const measC = mk(10, 10).getContext('2d');
function drawWatch(T, sh) {   // the smartwatch: steps today halve every day (laziness ×2); it buzzes on every new day and nags
  const s = stepAt(T); if (!s || sh.hideStat) return; const idx = STEPS.indexOf(s); const g = ctx; const dt = T - s.t; const prev = idx > 0 ? STEPS[idx - 1] : null;
  const bz = dt < 0.5 ? Math.sin(dt * 90) * 7 * (1 - dt / 0.5) : 0; const x = SAFE_L, y = 250, w = 400, h = 236;
  g.save(); g.translate(bz, 0); g.shadowColor = 'rgba(0,0,0,0.5)'; g.shadowBlur = 24; g.shadowOffsetY = 8;
  g.fillStyle = '#2a2d33'; rr(g, x + 70, y - 34, w - 140, 50, 12); g.fill(); rr(g, x + 70, y + h - 16, w - 140, 50, 12); g.fill();
  g.fillStyle = '#0d0f13'; rr(g, x, y, w, h, 46); g.fill(); g.shadowBlur = 0; g.shadowOffsetY = 0; g.strokeStyle = '#3a3f48'; g.lineWidth = 4; rr(g, x + 2, y + 2, w - 4, h - 4, 44); g.stroke();
  g.fillStyle = '#4a4f58'; rr(g, x + w - 2, y + 70, 12, 50, 5); g.fill();
  g.textAlign = 'left'; g.fillStyle = '#7fe3ff'; g.font = '700 21px InterW'; spaced(g, 'STEPS TODAY', x + 34, y + 50, 3);
  const steps = (v) => parseFloat(String(v).replace(/,/g, '')); const ringK = clamp(steps(s.v) / 10000);
  g.lineWidth = 12; g.strokeStyle = '#26303a'; g.beginPath(); g.arc(x + w - 70, y + 64, 30, 0, 7); g.stroke(); g.strokeStyle = '#3fe08a'; g.lineCap = 'round'; g.beginPath(); g.arc(x + w - 70, y + 64, 30, -Math.PI / 2, -Math.PI / 2 + Math.max(0.03, ringK) * Math.PI * 2); g.stroke(); g.lineCap = 'butt';
  const slide = prev ? eOut(clamp((dt - 0.15) / 0.35)) : 1; g.save(); g.beginPath(); g.rect(x + 20, y + 62, w - 120, 96); g.clip(); g.fillStyle = '#fff';
  const fit = (v) => { let f = 76; g.font = `700 ${f}px InterW`; while (g.measureText(v).width > w - 130 && f > 34) { f -= 2; g.font = `700 ${f}px InterW`; } };
  if (prev && slide < 1) { g.globalAlpha = 1 - slide; fit(prev.v); g.fillText(prev.v, x + 34, y + 138 - slide * 70); }
  g.globalAlpha = slide; fit(s.v); g.fillText(s.v, x + 34, y + 138 + (1 - slide) * 70); g.restore();
  g.fillStyle = '#8a929e'; g.font = '700 22px InterW'; spaced(g, 'DAY ' + (s.day === 'END' ? 31 : s.day), x + 34, y + 196, 3);
  g.fillStyle = '#d7262e'; rr(g, x + 150, y + 170, 214, 38, 19); g.fill(); g.fillStyle = '#fff'; g.font = '700 19px InterW'; spaced(g, 'LAZINESS ×2 DAILY', x + 165, y + 196, 1.5);
  const blink = s.day === 'END' ? 1 : 0.55 + 0.45 * (Math.floor(T * 2.5) % 2); g.globalAlpha = blink * clamp(dt / 0.4); g.fillStyle = s.day === 'END' ? '#3fe08a' : '#ffd21f'; g.font = '700 26px InterW'; g.shadowColor = 'rgba(0,0,0,0.8)'; g.shadowBlur = 10;
  spaced(g, (s.day === 'END' ? '' : '⚠ ') + s.cmp, x + 8, y + h + 78, 2); g.restore(); }
function drawTitle(O) {
  if (O < TITLE.t0 || O >= TITLE.t1) return;
  const a = eOut(clamp((O - TITLE.t0) / 0.45)) * clamp((TITLE.t1 - O) / 0.3), rise = (1 - eOut(clamp((O - TITLE.t0) / 0.7))) * 40;
  const g = ctx; g.save(); g.globalAlpha = a; g.textAlign = 'center';
  const wash = g.createLinearGradient(0, 120, 0, 900); wash.addColorStop(0, 'rgba(40,16,6,0.55)'); wash.addColorStop(1, 'rgba(40,16,6,0)'); g.fillStyle = wash; g.fillRect(0, 0, W, 900);
  g.translate(0, rise); g.shadowColor = 'rgba(0,0,0,0.45)'; g.shadowBlur = 30; g.shadowOffsetY = 4; g.fillStyle = '#fff';
  g.font = '500 96px Playfair'; g.fillText('What if your', W / 2, 380);
  g.font = 'italic 500 206px Playfair'; g.fillStyle = '#ffe2a0'; g.fillText('laziness', W / 2, 600);
  g.fillStyle = '#fff'; g.font = '500 96px Playfair'; g.fillText('doubled every day?', W / 2, 735);
  g.shadowBlur = 0; g.shadowOffsetY = 0; g.globalAlpha = a * 0.85; g.fillStyle = '#E21E39'; g.fillRect(W / 2 - 70, 780, 140, 6); g.restore();
}
function cueAt(O) { let best = null; for (const c of DIALOGUE) if (spanHit(c, O) && O >= c.words[0].t - 0.03) if (!best || c.spans[0][0] > best.spans[0][0]) best = c; return best; }
function strokeText(g, text, x, y, sw) { g.lineJoin = 'round'; g.miterLimit = 2; g.lineWidth = sw; g.strokeStyle = '#000'; g.strokeText(text, x, y); g.fillText(text, x, y); }
function captionChunk(c, O) { const chunks = []; let cur = []; c.words.forEach((w, i) => { cur.push(w); if (cur.length >= 3 || /[.!?…,]$/.test(w.w) || i === c.words.length - 1) { chunks.push(cur); cur = []; } });
  let chunk = chunks[0]; for (const ch of chunks) if (O >= ch[0].t - 0.03) chunk = ch; return chunk.filter(w => O >= w.t - 0.03).map(w => w.w.toUpperCase()).join(' '); }
function drawCaptions(O) {
  const c = cueAt(O); if (!c) return; const g = ctx; g.save(); g.textAlign = 'center'; g.fillStyle = '#fff';
  if (false) { g.font = 'italic 800 64px Montserrat'; c.words.forEach((w, i) => { const k = O - w.t; if (k < -0.03) return; g.globalAlpha = i ? clamp(1 - k / 0.9) * (i === 1 ? 0.6 : 0.35) : 1; strokeText(g, w.w, CAP_X + (i ? (i === 1 ? -120 : 140) : 0), H * 0.72 + i * 70, 10); }); g.restore(); return; }
  if (c.kind === 'shout') { const k = O - c.words[0].t; const s = k < 0.12 ? 0.6 + 4 * k : 1 + 0.04 * Math.sin(O * 50); const txt = c.words.filter(w => O >= w.t - 0.03).map(w => w.w).join(' ');
    g.translate(CAP_X + Math.sin(O * 73) * 6, H * 0.7 + Math.cos(O * 61) * 5); g.scale(s, s); g.rotate(Math.sin(O * 9) * 0.03);
    let fs = 118; g.font = `800 ${fs}px Montserrat`; while (g.measureText(txt).width > CAP_W - 30 && fs > 36) { fs -= 4; g.font = `800 ${fs}px Montserrat`; }
    g.shadowColor = 'rgba(0,0,0,0.45)'; g.shadowBlur = 20; strokeText(g, txt, 0, 0, 16); g.restore(); return; }
  const shown = captionChunk(c, O); if (!shown) { g.restore(); return; }
  let fs = 78; g.font = `800 ${fs}px Montserrat`; while (g.measureText(shown).width > CAP_W && fs > 40) { fs -= 3; g.font = `800 ${fs}px Montserrat`; }
  const nm = { hero: null, dev: 'DEV', priya: 'PRIYA', host: 'TV HOST', golf: 'COMMENTATOR', engineer: 'ENGINEER (RADIO)', driver: 'DELIVERY DRIVER', neighbour: 'NEIGHBOUR', london: 'SOMEONE IN THE DARK' }[c.speaker];
  strokeText(g, shown, CAP_X, H * 0.72, 12); if (nm) { g.font = '700 30px InterW'; g.globalAlpha = 0.85; strokeText(g, nm, CAP_X, H * 0.72 - fs - 8, 6); }
  g.restore();
}
function wrapLines(g, text, maxW) { const out = []; let cur = ''; for (const w of text.split(' ')) { const t = cur ? cur + ' ' + w : w; if (g.measureText(t).width > maxW && cur) { out.push(cur); cur = w; } else cur = t; } if (cur) out.push(cur); return out; }
function drawDiary(O, sh) { const s = stepAt(O); if (!s || sh.hideDiary) return; const g = ctx, x = SAFE_L; let y = 640; g.save(); g.textAlign = 'left'; g.font = 'italic 400 46px Lora';
  g.shadowColor = 'rgba(0,0,0,0.7)'; g.shadowBlur = 16; g.shadowOffsetY = 2; g.fillStyle = '#fff';
  for (const [txt, on] of [[s.setup, s.son], [s.punch, s.pon]]) { if (!txt || on == null || O < on - 0.02) continue; g.globalAlpha = eOut(clamp((O - on) / 0.22)); for (const ln of wrapLines(g, txt, W - SAFE_L - SAFE_R)) { g.fillText(ln, x, y); y += 56; } y += 10; }
  g.restore(); }
const GRAIN = [0, 1, 2, 3].map(i => { const c = mk(270, 480), g = c.getContext('2d'), d = g.createImageData(270, 480), r2 = rnd(i + 3); for (let k = 0; k < d.data.length; k += 4) { const v = 128 + (r2() - 0.5) * 120; d.data[k] = d.data[k + 1] = d.data[k + 2] = v; d.data[k + 3] = 255; } g.putImageData(d, 0, 0); return c; });
function drawGrain(O) { ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = 0.07; ctx.drawImage(GRAIN[Math.floor(O * 30) % 4], 0, 0, W, H); ctx.restore(); }
function drawFlare(fx, fy, a = 1) {   // Frutiger lens flare
  const g = ctx; const sx = fx * W, sy = fy * H; g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = a;
  const s = g.createRadialGradient(sx, sy, 0, sx, sy, 260); s.addColorStop(0, 'rgba(255,255,240,0.9)'); s.addColorStop(0.2, 'rgba(255,250,210,0.35)'); s.addColorStop(1, 'rgba(255,240,200,0)'); g.fillStyle = s; g.fillRect(sx - 260, sy - 260, 520, 520);
  const cx = W / 2, cy = H / 2; [[0.35, 40, 'rgba(140,240,255,0.18)'], [0.7, 70, 'rgba(160,255,190,0.12)'], [1.25, 26, 'rgba(255,255,255,0.2)'], [1.6, 110, 'rgba(120,200,255,0.1)']].forEach(([k, r, c]) => {
    const x = sx + (cx - sx) * k * 2, y = sy + (cy - sy) * k * 2; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, c); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); });
  g.restore();
}
function drawInfomercial(T) {   // 90s infomercial: VHS lines, chroma fringe, CALL NOW banner, price starburst
  const g = ctx; g.save(); g.globalCompositeOperation = 'screen'; g.globalAlpha = 0.18; g.drawImage(sceneC, 5, 0, W, H); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 0.12; g.fillStyle = '#000'; for (let y = (Math.floor(T * 30) % 2) * 2; y < H; y += 4) g.fillRect(0, y, W, 2);
  g.globalAlpha = 1; const by = 1470; g.fillStyle = '#d7262e'; g.fillRect(0, by, W, 74); g.fillStyle = '#ffd21f'; g.fillRect(0, by + 74, W, 8); g.font = '800 46px Montserrat'; g.textAlign = 'center'; g.fillStyle = (Math.floor(T * 3) % 2) ? '#fff' : '#ffd21f'; g.fillText('CALL NOW!  0800 NAH NAH', W / 2 - 25, by + 54);
  g.translate(W - SAFE_R - 120, 940); g.rotate(-0.2 + 0.03 * Math.sin(T * 6)); const sc2 = 1 + 0.05 * Math.sin(T * 9); g.scale(sc2, sc2); g.fillStyle = '#ffd21f'; g.beginPath(); for (let i = 0; i < 28; i++) { const a = i / 28 * Math.PI * 2, r = i % 2 ? 98 : 128; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fill();
  g.fillStyle = '#d7262e'; g.font = '800 30px Montserrat'; g.fillText('ONLY', 0, -22); g.font = '800 52px Montserrat'; g.fillText('£19.99', 0, 30); g.restore(); }
function drawGolf(T) {   // TV golf lower third
  const g = ctx; g.save(); const y = 1450; g.globalAlpha = 0.95; g.fillStyle = '#0e3b22'; g.fillRect(SAFE_L, y, 640, 64); g.fillStyle = '#f5f1e6'; g.fillRect(SAFE_L, y + 64, 640, 52); g.fillStyle = '#ffd21f'; g.fillRect(SAFE_L, y, 10, 116);
  g.textAlign = 'left'; g.fillStyle = '#ffd21f'; g.font = '800 34px Montserrat'; g.fillText('THE SOFA OPEN', SAFE_L + 30, y + 45); g.fillStyle = '#fff'; g.font = '700 26px InterW'; g.fillText('HOLE 16', SAFE_L + 420, y + 43);
  g.fillStyle = '#0e3b22'; g.font = '700 26px InterW'; g.fillText('PAR 3  ·  11 m TO THE DOOR  ·  0 STEPS', SAFE_L + 30, y + 100); g.restore(); }
const BP = {   // blueprint drawings: parts laid out left->right, top->bottom, joined by dashed arrows
  light: { title: 'LIGHT-OFF DEVICE MK1', parts: ['DOMINOES ×16', 'TOY CAR', 'RAMP', 'MOUSETRAP', 'STRING', 'LIGHT SWITCH'] },
  drone: { title: 'BRUSH-DRONE', parts: ['DRONE', 'TOOTHBRUSH', 'MOUTH (OPEN)', 'TIMER: 2 MIN', 'NO HANDS'] },
  london: { title: 'LONDON MK1', parts: ['HIS WINDOW', 'STRING ×4 KM', 'PULLEYS', 'ROOFTOPS', 'ZIPLINE', 'CHIPPY'] },
};
function drawBlueprint(sh, T) {
  const d = BP[sh.bp], k = clamp((T - sh.t0) / 0.5), rev = clamp((T - sh.t0 - 0.25) / 0.9), g = ctx; const uh = H * eOut(k);
  g.save(); g.beginPath(); g.rect(0, 0, W, uh); g.clip(); g.fillStyle = '#17478f'; g.fillRect(0, 0, W, H); g.strokeStyle = 'rgba(255,255,255,0.08)'; g.lineWidth = 2; const gx = (T * 9) % 54, gy = (T * 14) % 54; for (let x = -54 + gx; x < W; x += 54) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); } for (let y = -54 + gy; y < H; y += 54) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }   // the grid drifts so no two frames match
  g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = 4; g.strokeRect(SAFE_L - 30, 760, W - SAFE_L - SAFE_R + 60, 740);
  g.fillStyle = '#fff'; g.textAlign = 'center'; g.font = '800 64px Montserrat'; g.fillText(d.title, CAP_X, 860); g.font = '700 24px InterW'; g.globalAlpha = 0.8; g.fillText('DRAWN BY: HIM  ·  FROM: THE SOFA  ·  SCALE: OVERKILL', CAP_X, 905); g.globalAlpha = 1;
  const n = d.parts.length; const pos = d.parts.map((p, i) => [SAFE_L + 120 + (i % 3) * ((CAP_W - 160) / 2), 1040 + Math.floor(i / 3) * 280]); const shown = rev * n;
  g.setLineDash([14, 10]); g.lineWidth = 4; for (let i = 0; i < n - 1; i++) { const f = clamp(shown - i - 0.6); if (f <= 0) continue; const [x0, y0] = pos[i], [x1, y1] = pos[i + 1]; g.beginPath(); g.moveTo(x0, y0); g.lineTo(lerp(x0, x1, f), lerp(y0, y1, f)); g.stroke(); }
  g.setLineDash([]); d.parts.forEach((p, i) => { const f = clamp(shown - i); if (f <= 0) return; const [x, y] = pos[i]; g.globalAlpha = f; g.strokeStyle = '#fff'; g.lineWidth = 4; g.beginPath(); g.arc(x, y, 62, 0, Math.PI * 2 * f); g.stroke(); g.font = '800 30px InterW'; g.fillStyle = '#fff'; g.fillText(String(i + 1), x, y + 11); g.font = '700 24px InterW'; g.fillText(p, x, y + 104); });
  { const u = (T - sh.t0) * 0.9 % n, i0 = Math.floor(u), f = u - i0, [x0, y0] = pos[i0], [x1, y1] = pos[Math.min(n - 1, i0 + 1)]; g.globalAlpha = 1; g.fillStyle = '#ffd21f'; g.beginPath(); g.arc(lerp(x0, x1, f) + 50, lerp(y0, y1, f) - 50, 10, 0, 7); g.fill(); }   // the pen keeps moving over the drawing
  g.globalAlpha = 1; g.restore(); if (k < 1) { g.save(); const gr = g.createLinearGradient(0, uh - 40, 0, uh + 30); gr.addColorStop(0, 'rgba(10,40,90,0)'); gr.addColorStop(0.5, '#cfe0ff'); gr.addColorStop(1, 'rgba(10,40,90,0)'); g.fillStyle = gr; g.fillRect(0, uh - 40, W, 70); g.restore(); } }
// ---------------------------------------------------------------- grading / compositing
const GRADES = {
  flat: { f: 'saturate(1.12) contrast(1.06) brightness(1.03)', tint: 'rgba(255,190,120,0.10)', mode: 'soft-light', vig: 0.35 },
  dark: { f: 'saturate(0.9) contrast(1.15) brightness(1.0)', tint: 'rgba(60,80,160,0.22)', mode: 'soft-light', vig: 0.6 },
  lamp: { f: 'saturate(1.05) contrast(1.18) brightness(1.0)', tint: 'rgba(255,150,60,0.16)', mode: 'soft-light', vig: 0.62 },
  tv: { f: 'saturate(1.45) contrast(1.12) brightness(1.08)', tint: 'rgba(255,80,200,0.08)', mode: 'soft-light', vig: 0.2 },
  golf: { f: 'saturate(1.18) contrast(1.04) brightness(1.04)', tint: 'rgba(120,255,140,0.07)', mode: 'soft-light', vig: 0.3 },
  factory: { f: 'saturate(1.1) contrast(1.12) brightness(1.02)', tint: 'rgba(80,200,255,0.10)', mode: 'soft-light', vig: 0.45 },
  city: { f: 'saturate(1.15) contrast(1.06) brightness(1.04)', tint: 'rgba(255,140,120,0.08)', mode: 'soft-light', vig: 0.35 },
  storm: { f: 'saturate(0.8) contrast(1.15) brightness(1.0)', tint: 'rgba(60,90,170,0.25)', mode: 'soft-light', vig: 0.55 },
};
function setCam(sh, T, O) {
  const c = window.CAMOVR ? { ...sh.cam, ...window.CAMOVR, p1: null, l1: null, pf: null, lf: null } : sh.cam; const lt = clamp((T - sh.t0) / (sh.t1 - sh.t0)); const e = EASE[c.ease || 'out'](lt);
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
const HEROES = [S.flat.hero];
export function renderFrame(Oreal) {
  let O = Oreal; const sh = shots.find(s => O >= s.t0 && O < s.t1) || shots[shots.length - 1]; if (sh.fps) O = Math.max(sh.t0, Math.floor(O * sh.fps) / sh.fps);
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
  const gr = GRADES[sh.grade] || GRADES.flat;
  sctx.globalCompositeOperation = 'source-over'; sctx.filter = 'none';
  const dofv = typeof sh.dof === 'function' ? sh.dof(O) : sh.dof;
  if (dofv) {
    smctx.filter = 'blur(2.5px)'; smctx.drawImage(SRC, 0, 0, 270, 480); smctx.filter = 'none'; sctx.drawImage(smallC, 0, 0, W, H);
    shctx.globalCompositeOperation = 'source-over'; shctx.clearRect(0, 0, W, H); shctx.drawImage(SRC, 0, 0, W, H); shctx.globalCompositeOperation = 'destination-in';
    const rg = shctx.createRadialGradient(W / 2, H * 0.47, W * 0.2 * (1 - dofv * 0.3), W / 2, H * 0.47, W * 0.85 * (1 - dofv * 0.3)); rg.addColorStop(0, 'rgba(0,0,0,1)'); rg.addColorStop(1, 'rgba(0,0,0,0)'); shctx.fillStyle = rg; shctx.fillRect(0, 0, W, H);
    sctx.drawImage(sharpC, 0, 0, W, H);
  } else sctx.drawImage(SRC, 0, 0, W, H);
  const bloom = sh.bloom ?? 0.1;    // a touch of glow everywhere (Frutiger sheen)
  smctx.filter = 'blur(6px) brightness(1.25)'; smctx.drawImage(sceneC, 0, 0, 270, 480); smctx.filter = 'none';
  sctx.globalCompositeOperation = 'lighter'; sctx.globalAlpha = bloom; sctx.drawImage(smallC, 0, 0, W, H); sctx.globalAlpha = 1; sctx.globalCompositeOperation = 'source-over';
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.filter = gr.f; ctx.drawImage(sceneC, 0, 0, W, H); ctx.filter = 'none';
  if (gr.tint) { ctx.globalCompositeOperation = gr.mode; ctx.fillStyle = gr.tint; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over'; }
  const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, `rgba(0,0,0,${gr.vig})`); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  if (sh.tv) drawInfomercial(Oreal); if (sh.golf) drawGolf(Oreal); if (sh.bp) drawBlueprint(sh, Oreal); if (sh.letterbox) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, 300); ctx.fillRect(0, H - 300, W, 300); }
  if (sh.flare) drawFlare(sh.flare[0], sh.flare[1], 0.9);
  if (sh.dark) { const d = sh.dark(O); if (d > 0) { ctx.fillStyle = `rgba(4,6,18,${d})`; ctx.fillRect(0, 0, W, H); } }
    if (!sh.hideStat && !sh.bp && O >= STEPS[0].t) { ctx.save(); ctx.translate(W * 0.2, 400); ctx.scale(1, 0.62); const sg = ctx.createRadialGradient(0, 0, 0, 0, 0, W * 0.62); sg.addColorStop(0, 'rgba(0,0,0,0.34)'); sg.addColorStop(0.55, 'rgba(0,0,0,0.16)'); sg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = sg; ctx.fillRect(-W, -W, W * 3, W * 2); ctx.restore(); }
  drawGrain(Oreal); drawTitle(O); drawWatch(Oreal, sh); drawDiary(Oreal, sh); drawCaptions(Oreal);
  for (const s of shots) if (s.flash !== undefined) { const d = Math.round((Oreal - s.flash) * 30); if (d >= 0 && d < 3) { ctx.fillStyle = `rgba(255,255,255,${(s.fa || [0.95, 0.6, 0.25])[d]})`; ctx.fillRect(0, 0, W, H); } }
  if (sh.dark && sh.dark(Oreal) >= 1) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 0.16; ctx.drawImage(GRAIN[Math.floor(Oreal * 30) % 4], 0, 0, W, H); ctx.globalAlpha = 1; }   // clean black ending, with faint noise so no two frames are identical
  return out.toDataURL('image/jpeg', RS > 1 ? 0.95 : 0.94);
}
export const TIMELINE = { STEPS, DUR, cuts: shots.map(s => s.t0), flashes: shots.filter(s => s.flash !== undefined).map(s => s.flash) };
window.captionText = (O) => { const c = cueAt(O); if (!c) return ''; return c.kind === 'shout' ? c.words.map(w => w.w).join(' ') : captionChunk(c, O); };
window.hookText = () => '';
window.S = S; window.cam = cam; window.shots = shots; window.renderFrame = renderFrame; window.TIMELINE = TIMELINE;
fetch('dialogue.json').then(r => r.json()).then(d => { DIALOGUE = d; }).catch(() => { DIALOGUE = []; })
  .then(() => Promise.all(['800 78px Montserrat', '500 96px Playfair', 'italic 500 236px Playfair', '500 128px Lora', '600 30px InterW', '700 30px InterW', 'italic 400 46px Lora', 'italic 500 190px Playfair'].map(f => document.fonts.load(f)))).then(() => { window.READY = true; });