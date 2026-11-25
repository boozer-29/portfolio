// "What if your luck doubled every day?" — Polygram series, episode renderer (three.js, rig v2, IBL lighting)
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Reflector } from 'three/addons/objects/Reflector.js';

const W = 1080, H = 1920; export const DUR = 102.3;
let DIALOGUE = [];
function spanHit(c, O) { for (const [a, b] of c.spans) if (O >= a - 0.02 && O < b + 0.03) return true; return false; }

// ---------------------------------------------------------------- story steps (one doubling each)
const STEPS = [{"day": 1, "t": 5.2, "t1": 11.0, "v": "1 IN 2", "cmp": "≈ A COIN FLIP", "setup": "Day 1. He loses a coin flip.", "son": 5.55, "punch": "Against himself.", "pon": 7.57}, {"day": 2, "t": 11.0, "t1": 17.6, "v": "1 IN 4", "cmp": "≈ 2 HEADS IN A ROW", "setup": "Day 2. The wind picks a side.", "son": 11.35, "punch": "His.", "pon": 13.41}, {"day": 3, "t": 17.6, "t1": 24.6, "v": "1 IN 8", "cmp": "≈ 3 HEADS IN A ROW", "setup": "Day 3. Rush hour.", "son": 17.95, "punch": "Every light turns green for him. Only him.", "pon": 19.53}, {"day": 5, "t": 24.6, "t1": 35.5, "v": "1 IN 32", "cmp": "≈ A CLAW MACHINE WIN", "setup": "Claw machines usually grip properly about once every 30 goes.", "son": 24.95, "punch": "First go.", "pon": 28.29}, {"day": 7, "t": 35.5, "t1": 41.9, "v": "1 IN 128", "cmp": "≈ 7 HEADS IN A ROW", "setup": "Day 7. Bad luck still exists.", "son": 35.85, "punch": "It just goes next door.", "pon": 37.91}, {"day": 9, "t": 41.9, "t1": 50.7, "v": "1 IN 512", "cmp": "≈ A 500-TO-1 OUTSIDER", "setup": "Day 9. He bets £2 on the worst horse in the race.", "son": 42.25, "punch": "500 to 1.", "pon": 45.11}, {"day": 13, "t": 50.7, "t1": 58.1, "v": "1 IN 8,192", "cmp": "≈ A COIN ON ITS EDGE", "setup": "A coin lands on its edge about once in 6,000 flips.", "son": 51.05, "punch": "His did.", "pon": 53.99}, {"day": 20, "t": 58.1, "t1": 66.7, "v": "1 IN 1 MILLION", "cmp": "≈ A ROYAL FLUSH", "setup": "A royal flush: 1 in 649,740 hands.", "son": 58.45, "punch": "He gets five in a row.", "pon": 60.71}, {"day": 23, "t": 66.7, "t1": 75.3, "v": "1 IN 8.4 MILLION", "cmp": "≈ 23 HEADS IN A ROW", "setup": "Only one person has ever been confirmed hit by a meteorite.", "son": 67.05, "punch": "Today, it's a car.", "pon": 70.31}, {"day": 26, "t": 75.3, "t1": 93.4, "v": "1 IN 67 MILLION", "cmp": "≈ THE LOTTO JACKPOT", "setup": "Lotto jackpot: 1 in 45 million.", "son": 75.65, "punch": "By now, the whole country copies his numbers.", "pon": 77.79}, {"day": "END", "t": 93.4, "t1": 102.0, "v": "1 IN 134 MILLION", "cmp": "≈ ONE SAUSAGE ROLL", "setup": "Day 27. One sausage roll left. It costs 64p.", "son": 93.75, "punch": "He has exactly 64p.", "pon": 96.41}];  // generated from timeline.json (step 2)
const TITLE = { t0: 0.15, t1: 3.1 };
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


const GOLD = new THREE.MeshStandardMaterial({ color: 0xffc94a, metalness: 1, roughness: 0.16, envMapIntensity: 1.8, emissive: 0x4a2c00, emissiveIntensity: 0.3 });
const DIAM = new THREE.MeshStandardMaterial({ color: 0xe8fbff, metalness: 0.2, roughness: 0.02, envMapIntensity: 3, emissive: 0x9fe8ff, emissiveIntensity: 0.6, flatShading: true });
const starTex = canvasTex(128, 128, (g) => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.15, 'rgba(255,240,200,0.8)'); gr.addColorStop(1, 'rgba(255,220,150,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  g.fillStyle = 'rgba(255,255,255,0.9)'; g.beginPath(); g.moveTo(64, 0); g.lineTo(69, 59); g.lineTo(128, 64); g.lineTo(69, 69); g.lineTo(64, 128); g.lineTo(59, 69); g.lineTo(0, 64); g.lineTo(59, 59); g.closePath(); g.fill(); });
const sparkle = (s = 0.4, col = 0xfff2c8) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: starTex, color: col, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); sp.scale.setScalar(s); sp.renderOrder = 6; return sp; };
const blobTex = canvasTex(128, 128, (g) => { const gr = g.createRadialGradient(64, 64, 4, 64, 64, 64); gr.addColorStop(0, 'rgba(0,0,0,0.55)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); });
function blob(sc, s = 1.3) { const m = new THREE.Mesh(new THREE.PlaneGeometry(s, s), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.y = 0.012; sc.add(m); return m; }
function hideFace(P) { P.head.children.slice(1).forEach(c => c.visible = false); P.face = () => {}; }
const KNEEL = { bob: -0.42, spineX: 0.12, legs: [[1.5, 1.6], [0.05, 1.5]] };
// ---------------------------------------------------------------- SCENES (Luck: all new sets and characters)
const S = {};
const Q = (x, y, z, o = 'YXZ') => new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z, o));
const sag = (a, b, s, n = 20) => [...Array(n)].map((_, i) => { const u = i / (n - 1); return a.clone().lerp(b, u).add(V([0, -s * 4 * u * (1 - u), 0])); });
const ctex = (w, h, draw) => canvasTex(w, h, draw);

// ---------------------------------------------------------------- characters (all new to the series)
// the hero wears white trainers this episode (the Day 1 butter lands on one)
function makeLuckHero() { return makeRig({ shoe: 0xf1f1ee }); }
// Marcus: smug neighbour. White polo (unique hex: it gets wet / sooty), chinos, slick quiff, gold watch
const MARCUS_SHIRT = 0xf6f6f1, MARCUS_HAIR = 0x2b1a10;
function makeMarcus() {
  const P = makeRig({ hood: MARCUS_SHIRT, hoodD: MARCUS_SHIRT, pants: 0xc9b48a, skin: 0xd9a67e, hair: MARCUS_HAIR, hairStyle: 'none', noHood: true, shoe: 0x6b3a1e });
  const hm = mat(MARCUS_HAIR, { roughness: 0.12, envMapIntensity: 1.6 });
  P.head.add(rbox(0.7, 0.14, 0.64, hm, 0, 0.67, -0.02)); P.head.add(rbox(0.08, 0.28, 0.5, hm, -0.33, 0.52, -0.06)); P.head.add(rbox(0.08, 0.28, 0.5, hm, 0.33, 0.52, -0.06)); P.head.add(rbox(0.7, 0.42, 0.1, hm, 0, 0.45, -0.29));
  P.quiff = T(P.head, rbox(0.62, 0.2, 0.34, hm, 0, 0.8, 0.14)); P.quiff.rotation.x = -0.35;
  const cm = mat(0xffffff, { roughness: 0.7 }); for (const sx of [-1, 1]) { const c = T(P.spine, rbox(0.2, 0.07, 0.16, cm, sx * 0.13, 0.75, 0.15)); c.rotation.z = sx * 0.35; }
  P.spine.add(rbox(0.06, 0.2, 0.02, mat(0xe0e0dc), 0, 0.62, 0.238));
  const w = new THREE.Mesh(new THREE.TorusGeometry(0.125, 0.03, 8, 24), GOLD); w.rotation.x = Math.PI / 2; w.position.y = -0.3; P.arms[0].el.add(w);
  P.fab = mat(MARCUS_SHIRT, { roughness: 0.75 }); P.hm = hm;
  P.sponge = rbox(0.24, 0.13, 0.16, mat(0xffd23a, { roughness: 1 }), 0, -0.52, 0.05); P.arms[1].el.add(P.sponge); P.sponge.visible = false;
  P.ticket = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.14), mat(0xfaf7ee, { side: THREE.DoubleSide })); P.ticket.position.set(0, -0.52, 0.12); P.arms[1].el.add(P.ticket); P.ticket.visible = false;
  P.drips = [...Array(10)].map((_, i) => { const d = ball(0.025, mat(0x9fd0ff, { roughness: 0.05, transparent: true, opacity: 0.8 }), 0, 0, 0, undefined, 8); d.visible = false; P.root.add(d); d.ph = i * 0.37; return d; });
  // wet: 0..1 (shirt goes grey-blue, hair flattens, drips fall); soot: 0..1 (singed: grey shirt, hair blown up)
  P.state = (O, wet = 0, soot = 0) => {
    P.fab.color.setHex(MARCUS_SHIRT).lerp(new THREE.Color(0x9aaabb), wet * 0.6).lerp(new THREE.Color(0x5a554e), soot * 0.75);
    P.quiff.rotation.x = -0.35 + 0.55 * wet - 0.9 * soot; P.quiff.position.y = 0.8 - 0.08 * wet + 0.12 * soot;
    P.drips.forEach((d, i) => { d.visible = wet > 0.3; const u = ((O * 0.9 + d.ph) % 1); d.position.set(-0.4 + (i % 5) * 0.2, 2.2 - u * 2.1, 0.32 - (i > 4 ? 0.5 : 0)); });
  };
  return P;
}
function makeBaker() {
  const P = makeRig({ hood: 0xe58fa8, hoodD: 0xe58fa8, pants: 0x34344a, skin: 0xe8b996, hair: 0xd9d4cc, hairStyle: 'long', noHood: true, shoe: 0x333333 });
  P.spine.add(rbox(0.62, 0.66, 0.03, mat(0xfafafa, { roughness: 0.9 }), 0, 0.3, 0.245)); P.head.add(rbox(0.5, 0.1, 0.5, mat(0xffffff, { roughness: 0.9 }), 0, 0.8, -0.05));
  return P;
}
function makeKid() { const P = npc(4, { hood: 0x2bb673, hoodD: 0x2bb673 }); P.head.add(cyl(0.37, 0.37, 0.16, mat(0x1f6fd0, { roughness: 0.6 }), 0, 0.8, -0.01, 24)); T(P.head, rbox(0.42, 0.04, 0.3, mat(0x1f6fd0, { roughness: 0.6 }), 0, 0.74, 0.42)); P.root.scale.setScalar(0.62); return P; }
function makeSuit(hex, o = {}) {
  const P = makeRig({ hood: hex, hoodD: hex, pants: hex, skin: o.skin ?? 0xc8946c, hair: o.hair ?? 0x1a1410, hairStyle: o.bald ? 'none' : 'short', noHood: true, shoe: 0x0c0c0e, tie: o.tie ?? 0x8a1020 });
  if (o.vest) { P.spine.add(rbox(0.62, 0.5, 0.03, mat(0x111114), 0, 0.3, 0.24)); }
  if (o.bald) { P.sweat = [0, 1, 2].map(i => { const d = ball(0.03, mat(0xbfe6ff, { roughness: 0.02, transparent: true, opacity: 0.85 }), -0.18 + i * 0.18, 0.55, 0.32, undefined, 8); P.head.add(d); return d; }); }
  return P;
}
function hatOn(P, kind, col) {
  if (kind === 'flat') { T(P.head, rbox(0.74, 0.12, 0.7, mat(col, { roughness: 0.9 }), 0, 0.78, 0.02)); T(P.head, rbox(0.6, 0.05, 0.22, mat(col, { roughness: 0.9 }), 0, 0.72, 0.38)).rotation.x = 0.15; }
  else if (kind === 'trilby') { P.head.add(cyl(0.5, 0.5, 0.04, mat(col), 0, 0.72, 0, 24)); P.head.add(cyl(0.3, 0.34, 0.26, mat(col), 0, 0.86, 0, 20)); P.head.add(cyl(0.345, 0.345, 0.06, mat(0x222222), 0, 0.77, 0, 20)); }
  else if (kind === 'fascinator') { P.head.add(ball(0.12, mat(col), 0.2, 0.8, 0.05, undefined, 12)); P.head.add(cyl(0.004, 0.004, 0.4, mat(col), 0.28, 0.95, 0, 4)); }
}

// ---------------------------------------------------------------- props
// the coin: heads = a crowned head in profile, tails = a big "1"
const coinFace = (heads) => ctex(256, 256, (g, w, h) => {
  const gr = g.createRadialGradient(100, 90, 10, 128, 128, 128); gr.addColorStop(0, '#fff3b0'); gr.addColorStop(0.6, '#e6b341'); gr.addColorStop(1, '#a8761c'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#8a5d12'; g.lineWidth = 10; g.beginPath(); g.arc(128, 128, 112, 0, 7); g.stroke(); g.lineWidth = 3; g.beginPath(); g.arc(128, 128, 96, 0, 7); g.stroke();
  g.fillStyle = '#9c6a18';
  if (heads) { g.beginPath(); g.ellipse(132, 140, 46, 56, 0, 0, 7); g.fill(); g.fillRect(110, 170, 50, 50); g.beginPath(); g.moveTo(92, 92); g.lineTo(100, 60); g.lineTo(115, 82); g.lineTo(130, 52); g.lineTo(145, 82); g.lineTo(160, 60); g.lineTo(170, 92); g.closePath(); g.fill(); g.fillStyle = '#f7d873'; g.beginPath(); g.arc(150, 128, 7, 0, 7); g.fill(); }
  else { g.font = '800 150px InterW, Arial'; g.textAlign = 'center'; g.fillText('1', 128, 180); }
});
function makeCoin(r = 0.11) {
  const side = mat(0xc99a2e, { metalness: 1, roughness: 0.25, envMapIntensity: 1.6 });
  const fH = new THREE.MeshStandardMaterial({ map: coinFace(true), metalness: 0.9, roughness: 0.28, envMapIntensity: 1.5 }), fT = new THREE.MeshStandardMaterial({ map: coinFace(false), metalness: 0.9, roughness: 0.28, envMapIntensity: 1.5 });
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, r * 0.16, 40), [side, fH, fT]); m.castShadow = true; return m;
}
// a big hand (back of the hand, palm down) with a red hoodie cuff: the coin-flip insert
function makeHandInsert() {
  const g = grp(); const sk = mat(0xd49a6a, { roughness: 0.55, envMapIntensity: 0.5 }), hood = mat(0xD7262E, { roughness: 0.75 });
  g.add(rbox(1.2, 0.36, 1.25, sk, 0, 0, 0)); [-0.42, -0.14, 0.14, 0.42].forEach((x, i) => g.add(rbox(0.24, 0.26, 0.62 - Math.abs(i - 1.5) * 0.08, sk, x, -0.02, 0.86 - Math.abs(i - 1.5) * 0.04)));
  T(g, rbox(0.3, 0.26, 0.55, sk, -0.72, -0.02, 0.2)).rotation.y = 0.5; g.add(rbox(1.5, 0.62, 1.1, hood, 0, 0.05, -1.05)); g.add(rbox(1.56, 0.66, 0.14, mat(0x9e1a21, { roughness: 0.75 }), 0, 0.05, -0.52));
  return g;
}
const sausageMat = mat(0xd38a34, { roughness: 0.55, envMapIntensity: 0.9 });
function makeSausageRoll(s = 1) { const g = grp(); const b = T(g, cyl(0.12, 0.12, 0.42, sausageMat, 0, 0, 0, 16)); b.rotation.z = Math.PI / 2; b.scale.set(1, 1, 0.8);
  [-1, 1].forEach(sx => { const e = ball(0.12, sausageMat, sx * 0.21, 0, 0, undefined, 14); e.scale.set(0.5, 1, 0.8); g.add(e); });
  for (let k = 0; k < 5; k++) { const f = T(g, rbox(0.03, 0.02, 0.2, mat(0xa8641e), -0.16 + k * 0.08, 0.1, 0)); f.rotation.x = 0.2; }
  g.scale.setScalar(s); return g; }
const priceTex = (txt, sub) => ctex(256, 160, (g, w, h) => { g.fillStyle = '#fbf6e9'; g.fillRect(0, 0, w, h); g.strokeStyle = '#c0392b'; g.lineWidth = 8; g.strokeRect(6, 6, w - 12, h - 12); g.fillStyle = '#1d1a26'; g.textAlign = 'center'; g.font = '800 30px InterW, Arial'; g.fillText(sub, w / 2, 48); g.fillStyle = '#c0392b'; g.font = '800 78px InterW, Arial'; g.fillText(txt, w / 2, 128); });
function makePriceCard(txt, sub) { const g = grp(); const m = new THREE.MeshStandardMaterial({ map: priceTex(txt, sub), roughness: 0.8 }); g.add(new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.26), m)); T(g, new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.26), m)).rotation.y = Math.PI;   // a tent card: readable from both sides of the counter
 g.add(rbox(0.03, 0.2, 0.03, mat(0x333333), 0, -0.2, -0.01)); return g; }
function makeToast() { const g = grp(); g.add(rbox(0.34, 0.05, 0.32, mat(0xe0a95a, { roughness: 0.8 }))); g.add(rbox(0.36, 0.045, 0.34, mat(0x9a5b22, { roughness: 0.8 }), 0, -0.005, 0)); g.butter = rbox(0.14, 0.02, 0.12, mat(0xffe27a, { roughness: 0.3 }), 0.02, 0.035, 0.01); g.add(g.butter); return g; }
const noteTex = ctex(256, 144, (g, w, h) => { g.fillStyle = '#6fc7b6'; g.fillRect(0, 0, w, h); g.fillStyle = '#4aa292'; g.fillRect(0, 0, w, 22); g.fillRect(0, h - 22, w, 22); g.fillStyle = '#e9f7f1'; g.beginPath(); g.ellipse(190, 72, 40, 48, 0, 0, 7); g.fill();
  g.fillStyle = '#1f5f55'; g.font = '800 64px InterW, Arial'; g.textAlign = 'left'; g.fillText('£5', 18, 96); g.font = '700 18px InterW, Arial'; g.fillText('FIVE POUNDS', 20, 124); g.font = '800 40px InterW, Arial'; g.textAlign = 'center'; g.fillText('5', 190, 86); });
function makeNote() { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.28, 6, 1), new THREE.MeshStandardMaterial({ map: noteTex, roughness: 0.7, side: THREE.DoubleSide })); m.castShadow = true; return m; }
// pedestrian signal: red man / green man (two textures, swapped per light)
const manTex = (green) => ctex(128, 128, (g, w, h) => { g.fillStyle = '#0b0b0b'; g.fillRect(0, 0, w, h); g.fillStyle = green ? '#3dff7a' : '#ff3b2f'; g.beginPath(); g.arc(64, 26, 12, 0, 7); g.fill();
  if (green) { g.fillRect(54, 40, 20, 40); g.save(); g.translate(56, 80); g.rotate(0.45); g.fillRect(0, 0, 9, 38); g.restore(); g.save(); g.translate(68, 80); g.rotate(-0.45); g.fillRect(0, 0, 9, 38); g.restore(); g.save(); g.translate(54, 44); g.rotate(0.6); g.fillRect(0, 0, 8, 30); g.restore(); }
  else { g.fillRect(52, 40, 24, 44); g.fillRect(52, 84, 9, 34); g.fillRect(67, 84, 9, 34); g.fillRect(44, 42, 8, 34); g.fillRect(76, 42, 8, 34); } });
const MAN_R = new THREE.MeshBasicMaterial({ map: manTex(false), toneMapped: false }), MAN_G = new THREE.MeshBasicMaterial({ map: manTex(true), toneMapped: false });
function makeSignal() { const g = grp(); g.add(cyl(0.06, 0.06, 2.8, mat(0x2a2d33, { metalness: 0.5, roughness: 0.4 }), 0, 1.4, 0, 10)); g.add(rbox(0.42, 0.46, 0.3, mat(0x1d1f24), 0, 2.6, 0.12));
  g.face = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.34), MAN_R); g.face.position.set(0, 2.6, 0.28); g.add(g.face); g.glow = new THREE.PointLight(0x3dff7a, 0, 2.5, 2); g.glow.position.set(0, 2.6, 0.6); g.add(g.glow);
  g.setGreen = (on) => { g.face.material = on ? MAN_G : MAN_R; g.glow.color.setHex(on ? 0x3dff7a : 0xff3b2f); g.glow.intensity = on ? 2.2 : 0.8; }; return g; }
function makeCar(col, o = {}) { const g = grp(); const b = mat(col, { roughness: 0.25, metalness: 0.35, envMapIntensity: 1.2 });
  g.add(rbox(1.9, 0.6, 4.0, b, 0, 0.6, 0)); if (!o.open) g.add(rbox(1.66, 0.55, 2.0, mat(0x9fb8d0, { roughness: 0.05, metalness: 0.5, envMapIntensity: 1.5 }), 0, 1.15, -0.2));
  if (o.open) { const ws = rbox(1.7, 0.42, 0.05, mat(0xbfe0ff, { roughness: 0.02, transparent: true, opacity: 0.35 }), 0, 1.12, 0.6); ws.rotation.x = -0.45; g.add(ws); g.add(rbox(0.7, 0.4, 0.6, mat(0x3a2418, { roughness: 0.6 }), -0.42, 1.0, -0.3)); g.add(rbox(0.7, 0.4, 0.6, mat(0x3a2418, { roughness: 0.6 }), 0.42, 1.0, -0.3)); }
  [[-0.92, 1.3], [0.92, 1.3], [-0.92, -1.3], [0.92, -1.3]].forEach(([x, z]) => { const w = cyl(0.36, 0.36, 0.28, mat(0x18181b, { roughness: 0.7 }), x, 0.36, z, 18); w.rotation.z = Math.PI / 2; g.add(w); const hc = cyl(0.2, 0.2, 0.3, mat(0xcfd3da, { metalness: 1, roughness: 0.2 }), x, 0.36, z, 14); hc.rotation.z = Math.PI / 2; g.add(hc); });
  [-0.6, 0.6].forEach(x => { g.add(rbox(0.36, 0.16, 0.06, mat(0xfff6d0, { emissive: 0xfff2c0, emissiveIntensity: o.lights ?? 1.5 }), x, 0.72, 2.0)); g.add(rbox(0.36, 0.14, 0.06, mat(0xff2a2a, { emissive: 0xff2020, emissiveIntensity: o.lights ?? 1.2 }), x, 0.74, -2.0)); });
  return g; }
function makeBus() { const g = grp(); const b = mat(0x2f5fb0, { roughness: 0.4, metalness: 0.2 }); g.add(rbox(2.5, 2.8, 10, b, 0, 1.75, 0)); g.add(rbox(2.54, 0.9, 9.4, mat(0x1a2433, { roughness: 0.05, metalness: 0.6, envMapIntensity: 1.6 }), 0, 2.3, 0));
  g.add(rbox(2.3, 0.7, 0.06, mat(0x111111), 0, 2.9, 5.02)); [-3.5, 3.5].forEach(z => [-1.2, 1.2].forEach(x => { const w = cyl(0.5, 0.5, 0.35, mat(0x18181b), x, 0.5, z, 18); w.rotation.z = Math.PI / 2; g.add(w); }));
  [-0.85, 0.85].forEach(x => g.add(rbox(0.4, 0.2, 0.06, mat(0xfff6d0, { emissive: 0xfff2c0, emissiveIntensity: 1.5 }), x, 0.85, 5.02))); return g; }
// teddies for the claw machine
const BEARC = [0xc98a4a, 0xf2a0c8, 0x7ac8ff, 0xfff07a, 0xa6e08a, 0xd8b6ff, 0xff8a5a];
function makeBear(i, s = 1) { const g = grp(); const m = mat(BEARC[i % BEARC.length], { roughness: 0.95 });
  g.add(rbox(0.34, 0.36, 0.26, m, 0, 0.18, 0)); g.add(ball(0.17, m, 0, 0.48, 0, undefined, 12)); [-1, 1].forEach(sx => { g.add(ball(0.06, m, sx * 0.12, 0.62, 0, undefined, 8)); g.add(ball(0.07, m, sx * 0.2, 0.2, 0.05, undefined, 8)); });
  g.add(ball(0.025, mat(0x111111), -0.06, 0.52, 0.15, undefined, 6)); g.add(ball(0.025, mat(0x111111), 0.06, 0.52, 0.15, undefined, 6)); g.add(ball(0.04, mat(0xfff3e0), 0, 0.45, 0.16, undefined, 8));
  g.scale.setScalar(s); return g; }
// horses: body along +z, gallop(phase) swings the legs; a jockey in silks rides on top
function makeHorse(col, o = {}) { const g = grp(); const m = mat(col, { roughness: 0.55 }), dk = mat(o.mane ?? 0x1a1310, { roughness: 0.8 });
  const body = grp(0, 1.45, 0, g); body.add(rbox(0.62, 0.68, 1.7, m, 0, 0, 0));
  const neck = grp(0, 0.2, 0.75, body); T(neck, rbox(0.4, 0.9, 0.42, m, 0, 0.35, 0.12)).rotation.x = 0.55; const head = grp(0, 0.78, 0.45, neck); T(head, rbox(0.32, 0.32, 0.72, m, 0, 0, 0.22)).rotation.x = 0.35; head.add(rbox(0.08, 0.16, 0.06, m, -0.1, 0.22, -0.05)); head.add(rbox(0.08, 0.16, 0.06, m, 0.1, 0.22, -0.05));
  [-1, 1].forEach(sx => head.add(rbox(0.04, 0.07, 0.07, mat(0x111111), sx * 0.165, 0.06, 0.18)));
  const mane = T(neck, rbox(0.12, o.shaggy ? 1.1 : 0.8, o.shaggy ? 0.3 : 0.12, dk, 0, 0.4, -0.12)); mane.rotation.x = 0.55;
  const tail = grp(0, 0.2, -0.85, body); T(tail, rbox(0.12, o.shaggy ? 0.9 : 0.7, 0.14, dk, 0, -0.32, -0.1)).rotation.x = -0.4;
  g.legs = [[-0.2, 0.62], [0.2, 0.62], [-0.2, -0.62], [0.2, -0.62]].map(([x, z]) => { const th = grp(x, -0.25, z, body); th.add(rbox(0.18, 0.62, 0.22, m, 0, -0.3, 0)); const kn = grp(0, -0.6, 0, th); kn.add(rbox(0.13, 0.55, 0.15, m, 0, -0.27, 0)); kn.add(rbox(0.16, 0.1, 0.18, mat(0x222222), 0, -0.56, 0.02)); return { th, kn }; });
  if (o.jockey !== false) { const j = grp(0, 0.38, 0.15, body); const silk = mat(o.silk ?? 0xffd21f, { roughness: 0.5 }); j.add(rbox(0.36, 0.5, 0.3, silk, 0, 0.3, 0)); j.add(rbox(0.3, 0.3, 0.28, mat(0xd9a67e), 0, 0.72, 0.02)); j.add(ball(0.19, silk, 0, 0.86, 0, undefined, 14)); [-1, 1].forEach(sx => j.add(rbox(0.12, 0.4, 0.14, mat(0xf4f4f4), sx * 0.2, 0, 0.05))); g.jockey = j; T(j, rbox(0.03, 0.03, 0.5, mat(0x333333), 0.25, 0.4, 0.3)).rotation.x = 0.5; }
  if (o.number) { const t = ctex(64, 64, (gg) => { gg.fillStyle = '#fff'; gg.fillRect(0, 0, 64, 64); gg.fillStyle = '#111'; gg.font = '800 44px InterW, Arial'; gg.textAlign = 'center'; gg.fillText(String(o.number), 32, 48); }); [-1, 1].forEach(sx => { const c = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.34), new THREE.MeshStandardMaterial({ map: t })); c.position.set(sx * 0.32, 0.1, -0.2); c.rotation.y = sx * Math.PI / 2; body.add(c); }); }
  g.body = body; g.neck = neck; g.head = head; g.tail = tail;
  g.gallop = (ph, amp = 1) => { const s = Math.sin(ph), c = Math.cos(ph); g.legs.forEach((L, i) => { const p = ph + (i < 2 ? 0 : Math.PI * 0.8) + (i % 2) * 0.35; L.th.rotation.x = Math.sin(p) * 0.75 * amp; L.kn.rotation.x = Math.max(0, -Math.cos(p)) * 1.1 * amp; });
    body.position.y = 1.45 + Math.abs(c) * 0.12 * amp; body.rotation.x = s * 0.06 * amp; neck.rotation.x = -c * 0.12 * amp; tail.rotation.x = -0.3 + s * 0.2 * amp; };
  g.stand = (O) => { g.legs.forEach(L => { L.th.rotation.x = 0; L.kn.rotation.x = 0; }); body.position.y = 1.45 + Math.sin(O * 2) * 0.01; neck.rotation.x = 0; };
  if (o.scale) g.scale.setScalar(o.scale); return g; }
// playing cards (royal flush in spades), face-up/face-down via rotation
const cardTex = (rank) => ctex(160, 224, (g, w, h) => { g.fillStyle = '#fbfbf8'; rr(g, 2, 2, w - 4, h - 4, 14); g.fill(); g.strokeStyle = '#ccc'; g.lineWidth = 3; rr(g, 4, 4, w - 8, h - 8, 12); g.stroke();
  g.fillStyle = '#121218'; g.font = '800 46px InterW, Arial'; g.textAlign = 'left'; g.fillText(rank, 14, 52); g.font = '700 40px Arial'; g.fillText('♠', 16, 94); g.textAlign = 'center'; g.font = '700 110px Arial'; g.fillText('♠', w / 2, h * 0.7); });
const cardBack = ctex(160, 224, (g, w, h) => { g.fillStyle = '#8a1020'; rr(g, 2, 2, w - 4, h - 4, 14); g.fill(); g.strokeStyle = '#f4d27a'; g.lineWidth = 4; rr(g, 12, 12, w - 24, h - 24, 8); g.stroke(); g.globalAlpha = 0.35; for (let i = -h; i < w + h; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + h, h); g.stroke(); } });
const RANKS = ['10', 'J', 'Q', 'K', 'A'];
function makeCard(rank) { const g = grp(); const f = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.45), new THREE.MeshStandardMaterial({ map: cardTex(rank), roughness: 0.6 })); f.rotation.x = -Math.PI / 2; g.add(f);
  const b = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.45), new THREE.MeshStandardMaterial({ map: cardBack, roughness: 0.6 })); b.rotation.x = Math.PI / 2; b.position.y = -0.002; g.add(b); return g; }
const CHIPC = [0xd7262e, 0x1f4fd6, 0x111111, 0x2bb673, 0xf2f2f2];
function makeChipStack(n, col) { const g = grp(); const m = mat(col, { roughness: 0.4 }), e = mat(0xffffff, { roughness: 0.4 }); for (let i = 0; i < n; i++) { g.add(cyl(0.11, 0.11, 0.035, i % 2 ? m : m, 0, 0.02 + i * 0.037, 0, 16)); if (i % 3 === 0) g.add(cyl(0.112, 0.112, 0.012, e, 0, 0.02 + i * 0.037, 0, 16)); } return g; }
// the lottery ticket (Day 26 insert): six numbers marked with crosses as the pen moves
const LOTTO = [3, 11, 19, 27, 38, 52];
const ticketTex = screenTex(512, 320);
function drawTicket(k) { const g = ticketTex.g, w = 512, h = 320; g.fillStyle = '#fff6e0'; g.fillRect(0, 0, w, h); g.fillStyle = '#e8343c'; g.fillRect(0, 0, w, 54); g.fillStyle = '#fff'; g.font = '800 36px InterW, Arial'; g.textAlign = 'left'; g.fillText('LOTTO', 18, 40); g.font = '700 20px InterW, Arial'; g.textAlign = 'right'; g.fillText('PICK 6', w - 18, 36);
  g.textAlign = 'center'; for (let n = 1; n <= 59; n++) { const c = (n - 1) % 10, r = Math.floor((n - 1) / 10); const x = 34 + c * 49, y = 92 + r * 40; g.strokeStyle = '#e8343c'; g.lineWidth = 2; g.strokeRect(x - 18, y - 16, 36, 30); g.fillStyle = '#c83030'; g.font = '700 17px InterW, Arial'; g.fillText(String(n), x, y + 6);
    const idx = LOTTO.indexOf(n); if (idx >= 0 && k * 6 > idx) { g.strokeStyle = '#1a1a40'; g.lineWidth = 5; g.beginPath(); g.moveTo(x - 15, y - 13); g.lineTo(x + 15, y + 11); g.moveTo(x + 15, y - 13); g.lineTo(x - 15, y + 11); g.stroke(); } }
  ticketTex.needsUpdate = true; }
function makeTicket() { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.0), new THREE.MeshStandardMaterial({ map: ticketTex, roughness: 0.85 })); m.rotation.x = -Math.PI / 2; m.receiveShadow = true; return m; }
function makePen() { const g = grp(); T(g, cyl(0.035, 0.035, 0.9, mat(0x1a2a8a, { roughness: 0.3 }), 0, 0.45, 0, 12)); T(g, cone(0.035, 0.08, mat(0xdddddd, { metalness: 1, roughness: 0.2 }), 0, -0.04, 0, 12)).rotation.x = Math.PI; return g; }
// the phone insert (Day 26): a separate prop phone on the bar (9.9)
const phoneTex = screenTex(320, 640);
function drawWinPhone(k, O) { const g = phoneTex.g, w = 320, h = 640; g.fillStyle = '#0d1220'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.font = '600 22px InterW, Arial'; g.textAlign = 'left'; g.fillText('9:41', 22, 34);
  g.textAlign = 'center'; g.fillStyle = '#e8343c'; rr(g, 30, 70, w - 60, 70, 16); g.fill(); g.fillStyle = '#fff'; g.font = '800 34px InterW, Arial'; g.fillText('LOTTO', w / 2, 118);
  g.fillStyle = '#ffd23a'; g.font = '800 40px InterW, Arial'; g.fillText('JACKPOT!', w / 2, 210); g.fillStyle = '#fff'; g.font = '700 26px InterW, Arial'; g.fillText('YOU WON:', w / 2, 290);
  const v = (0.64 * clamp(k)).toFixed(2); g.font = '800 92px InterW, Arial'; g.fillStyle = '#3dff7a'; g.fillText('£' + v, w / 2, 400); g.globalAlpha = 0.7; g.fillStyle = '#fff'; g.font = '600 20px InterW, Arial'; g.fillText('shared by 31,000,000 winners', w / 2, 450); g.globalAlpha = 1;
  g.fillStyle = '#1f8fe0'; rr(g, 60, 520, w - 120, 64, 32); g.fill(); g.fillStyle = '#fff'; g.font = '700 24px InterW, Arial'; g.fillText('CLAIM PRIZE', w / 2, 560); phoneTex.needsUpdate = true; }
function makeWinPhone() { const g = grp(); g.add(rbox(0.5, 1.0, 0.05, mat(0x15171c, { roughness: 0.3, metalness: 0.5 }))); g.add(screenMesh(0.46, 0.92, phoneTex, { z: 0.028 })); return g; }
// instanced crowd: simple standing people (bodies + heads), per-instance colours; update bobs/turns them
function crowdInst(sc, pts, o = {}) {
  const n = pts.length; const body = new THREE.InstancedMesh(rgeo(0.62, 1.15, 0.4), new THREE.MeshStandardMaterial({ roughness: 0.75 }), n), head = new THREE.InstancedMesh(rgeo(0.46, 0.46, 0.42), new THREE.MeshStandardMaterial({ roughness: 0.55 }), n), legs = new THREE.InstancedMesh(rgeo(0.56, 0.75, 0.34), new THREE.MeshStandardMaterial({ roughness: 0.75 }), n);
  const r = rnd(o.seed || 5), skins = [0xe7b289, 0xd9a67e, 0x8a5a3c, 0xc8946c, 0x6b4128, 0xf0c09a], tops = [0xd7262e, 0x1f4fd6, 0x2bb673, 0xe8a317, 0x9b59d6, 0x333333, 0xf2f2f2, 0x20a0a0, 0xff8c5a, 0x8a6a49], bots = [0x2d3a63, 0x2b2b2b, 0x4b3a2a, 0x3b4a6b, 0x5a5a39];
  const D = pts.map((p, i) => ({ p, s: (o.s || 1) * (0.9 + r() * 0.2), ph: r() * 10, ry: p[3] ?? (o.ry || 0) }));
  D.forEach((d, i) => { body.setColorAt(i, new THREE.Color(tops[Math.floor(r() * tops.length)])); head.setColorAt(i, new THREE.Color(skins[Math.floor(r() * skins.length)])); legs.setColorAt(i, new THREE.Color(bots[Math.floor(r() * bots.length)])); });
  [body, head, legs].forEach(m => { m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; sc.add(m); });
  const mt = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  const upd = (O, f = {}) => { D.forEach((d, i) => { const vis = f.count == null || i < f.count; const s = vis ? d.s : 0.0001; const bob = Math.abs(Math.sin(O * (f.jump ? 9 : 2) + d.ph)) * (f.jump ? 0.35 : 0.03) * s; const ry = d.ry + Math.sin(O * 0.7 + d.ph) * 0.15;
      e.set(0, ry, f.cheer ? Math.sin(O * 7 + d.ph) * 0.08 : 0); q.setFromEuler(e); const x = d.p[0], y = d.p[1] + bob, z = d.p[2];
      mt.compose(V([x, y + 0.38 * s, z]), q, V([s, s, s])); legs.setMatrixAt(i, mt); mt.compose(V([x, y + 1.3 * s, z]), q, V([s, s, s])); body.setMatrixAt(i, mt); mt.compose(V([x, y + 2.15 * s, z]), q, V([s, s, s])); head.setMatrixAt(i, mt); });
    [body, head, legs].forEach(m => { m.instanceMatrix.needsUpdate = true; }); };
  upd(0); return { upd, D };
}
// water spray (Day 7) + generic particle bursts: instanced droplets along paths
function dropsInst(sc, n, col = 0xbfe6ff, r = 0.06) { const m = new THREE.InstancedMesh(new THREE.SphereGeometry(r, 8, 6), new THREE.MeshStandardMaterial({ color: col, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.75, envMapIntensity: 2 }), n); m.frustumCulled = false; m.castShadow = false; sc.add(m);
  const mt = new THREE.Matrix4(), q = new THREE.Quaternion(); return { m, set(i, p, s = 1) { mt.compose(p, q, V([s, s, s])); m.setMatrixAt(i, mt); }, done() { m.instanceMatrix.needsUpdate = true; } }; }
const fireTex = glowTex('rgba(255,250,220,1)', 'rgba(255,140,40,0.75)');
const smokeTex = canvasTex(128, 128, (g) => { const gr = g.createRadialGradient(64, 64, 4, 64, 64, 64); gr.addColorStop(0, 'rgba(90,86,80,0.8)'); gr.addColorStop(1, 'rgba(90,86,80,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); });
function sprite(tex, s, o = {}) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, blending: o.add ? THREE.AdditiveBlending : THREE.NormalBlending, toneMapped: false, opacity: o.op ?? 1 })); sp.scale.setScalar(s); return sp; }
// ---------------------------------------------------------------- sets
const tileTex = (a, b, n = 8) => { const t = ctex(256, 256, (g, w, h) => { const s = w / n; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { g.fillStyle = (i + j) % 2 ? a : b; g.fillRect(i * s, j * s, s, s); } }); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
const woodT = (base, seed) => { const t = ctex(256, 256, (g, w, h) => { g.fillStyle = base; g.fillRect(0, 0, w, h); const r2 = rnd(seed); for (let i = 0; i < 9; i++) { g.fillStyle = `rgba(0,0,0,${0.05 + r2() * 0.08})`; g.fillRect(0, i * 28 + 4, w, 3); } for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(255,255,255,${r2() * 0.05})`; g.fillRect(r2() * w, r2() * h, 30 + r2() * 60, 2); } }); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
const rainTex = (() => { const t = ctex(256, 512, (g, w, h) => { g.fillStyle = 'rgba(0,0,0,0)'; g.clearRect(0, 0, w, h); const r2 = rnd(77); for (let i = 0; i < 70; i++) { const x = r2() * w, y = r2() * h, l = 10 + r2() * 40; g.strokeStyle = `rgba(220,235,255,${0.25 + r2() * 0.4})`; g.lineWidth = 1 + r2() * 1.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 2, y + l); g.stroke(); } for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(230,240,255,${0.3 + r2() * 0.4})`; g.beginPath(); g.arc(r2() * w, r2() * h, 1.5 + r2() * 3, 0, 7); g.fill(); } }); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; })();
function rainyWindow(w, h) { const g = grp(); const out = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: ctex(64, 256, (gg, ww, hh) => { const gr = gg.createLinearGradient(0, 0, 0, hh); gr.addColorStop(0, '#9fb2c8'); gr.addColorStop(0.6, '#6d7f96'); gr.addColorStop(1, '#3a4656'); gg.fillStyle = gr; gg.fillRect(0, 0, ww, hh); }), toneMapped: false })); g.add(out);
  const r = rainTex.clone(); r.needsUpdate = true; r.repeat.set(w / 2, h / 2); const rain = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: r, transparent: true, depthWrite: false, toneMapped: false })); rain.position.z = 0.02; g.add(rain); g.rain = r; return g; }
const GLASS = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.02, metalness: 0, transmission: 0, transparent: true, opacity: 0.16, envMapIntensity: 2.2, depthWrite: false });
function signTex(txt, bg, fg, w = 512, h = 128, font = '800 70px InterW, Arial') { return ctex(w, h, (g) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = fg; g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, w / 2, h / 2 + 4); }); }
function signMesh(w, h, tex, glow = false) { return new THREE.Mesh(new THREE.PlaneGeometry(w, h), glow ? new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }) : new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 })); }
function npcs(sc, list) { return list.map(([i, o]) => { const P = npc(i, o || {}); sc.add(P.root); return P; }); }

{ // ---- BAKERY (title, Day 1, END). Counter along x at z 0; customers on +z; window wall at x -7.4 with rain; table by the window for Day 1
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x2a2018);
  const key = lightRig(sc, { env: 0.45, sky: 0xfff0dc, ground: 0x5a4030, hemi: 0.5, keyC: 0xffe0b0, key: 1.0, keyPos: [4, 9, 8], R: 10, target: [-1, 0, 1], rim: 0.5, rimC: 0x9fc4ff, rimPos: [-12, 5, 2] });
  const fl = new THREE.MeshStandardMaterial({ map: tileTex('#e9e2d4', '#2f2a26', 2), roughness: 0.35, envMapIntensity: 0.7 }); fl.map.repeat.set(9, 7); sc.add(rbox(18, 0.2, 14, fl, 0, -0.1, 1.5));
  const wallM = mat(0xe6c9a3, { roughness: 0.9 }), tileW = new THREE.MeshStandardMaterial({ map: tileTex('#f2efe8', '#e2ddd2', 6), roughness: 0.4 }); tileW.map.repeat.set(4, 2);
  sc.add(rbox(18, 5, 0.3, wallM, 0, 2.5, -3.1)); sc.add(rbox(16, 1.6, 0.05, tileW, 0, 1.9, -2.94));
  sc.add(rbox(0.3, 5, 4.2, wallM, -7.55, 2.5, -1.2)); sc.add(rbox(0.3, 0.9, 5.0, wallM, -7.55, 0.45, 3.4)); sc.add(rbox(0.3, 1.4, 5.0, wallM, -7.55, 4.3, 3.4)); sc.add(rbox(0.3, 5, 2.2, wallM, -7.55, 2.5, 7.0));
  sc.add(rbox(0.3, 5, 14, wallM, 7.55, 2.5, 1.5)); sc.add(rbox(18, 5, 0.3, wallM, 0, 2.5, 8.2));
  const win = rainyWindow(5.0, 2.7); win.position.set(-7.38, 2.25, 3.4); win.rotation.y = Math.PI / 2; sc.add(win); [0.9, 3.6].forEach(y => sc.add(rbox(0.2, 0.12, 5.1, mat(0xffffff), -7.38, y, 3.4))); sc.add(rbox(0.2, 2.7, 0.1, mat(0xffffff), -7.38, 2.25, 3.4));
  const winL = new THREE.PointLight(0xbfd4ff, 6, 9, 1.4); winL.position.set(-6.2, 2.4, 3.4); sc.add(winL);
  const win2 = rainyWindow(4.0, 2.8); win2.position.set(-2.2, 2.0, 8.03); win2.rotation.y = Math.PI; sc.add(win2);
  const door = grp(2.6, 0, 8.04, sc); door.add(rbox(1.4, 3.0, 0.1, mat(0x2f5b8a, { roughness: 0.5 }), 0, 1.5, 0)); door.add(ball(0.06, GOLD, 0.5, 1.4, -0.08));
  // back shelves of bread + the menu board
  for (const y of [2.6, 3.4]) { sc.add(rbox(7, 0.08, 0.5, mat(0x8a5a32, { roughness: 0.7 }), 0.6, y, -2.75)); for (let k = 0; k < 9; k++) { const b = ball(0.22, mat([0xc98a4a, 0xd9a35a, 0xb0743a][k % 3], { roughness: 0.75 }), -2.6 + k * 0.78, y + 0.18, -2.75, undefined, 14); b.scale.set(1.4, 0.8, 0.9); sc.add(b); } }
  const menu = signMesh(3.2, 1.0, ctex(640, 200, (g, w, h) => { g.fillStyle = '#1d2420'; g.fillRect(0, 0, w, h); g.fillStyle = '#f4efe2'; g.font = '700 46px InterW, Arial'; g.textAlign = 'center'; g.fillText('FRESH BAKED DAILY', w / 2, 80); g.font = '600 32px InterW, Arial'; g.globalAlpha = 0.8; g.fillText('pasties · rolls · buns · tea', w / 2, 140); }));
  menu.position.set(-3.6, 3.8, -2.93); sc.add(menu);
  // counter + glass display + till
  const wood = new THREE.MeshStandardMaterial({ map: woodT('#7a4a2a', 5), roughness: 0.6 });
  sc.add(rbox(6.4, 1.05, 1.0, wood, 0.4, 0.525, 0)); sc.add(rbox(6.6, 0.08, 1.12, mat(0xeee9e0, { roughness: 0.25 }), 0.4, 1.09, 0));
  const glass = new THREE.Mesh(rgeo(2.6, 0.62, 0.95), GLASS); glass.position.set(-1.45, 1.44, 0); sc.add(glass); sc.add(rbox(2.62, 0.05, 0.97, mat(0xd9d4cc, { metalness: 0.6, roughness: 0.3 }), -1.45, 1.76, 0));
  for (let k = 0; k < 6; k++) { const p = ball(0.13, mat([0xd9953f, 0xe0b25a, 0xc06a30][k % 3], { roughness: 0.6 }), -2.5 + k * 0.4, 1.24, (k % 2) * 0.2 - 0.1, undefined, 12); p.scale.set(1.3, 0.7, 1); sc.add(p); }
  const till = grp(2.7, 1.13, -0.1, sc); till.add(rbox(0.6, 0.3, 0.5, mat(0x2a2a30))); T(till, rbox(0.5, 0.32, 0.05, mat(0x1a1d24, { emissive: 0x3fd0a0, emissiveIntensity: 0.4 }), 0, 0.33, 0)).rotation.x = -0.3;
  const doily = cyl(0.3, 0.3, 0.01, mat(0xffffff, { roughness: 0.9 }), 0.9, 1.135, 0.25, 24); sc.add(doily);
  const roll = makeSausageRoll(1.1); roll.position.set(0.9, 1.25, 0.25); sc.add(roll);
  const price = makePriceCard('64p', 'SAUSAGE ROLL'); price.position.set(0.25, 1.38, 0.47); price.rotation.x = -0.2; sc.add(price);
  // pendant lamps
  const lamps = [-3.4, 0.6, 4.0].map(x => { const l = practical(sc, x, 3.75, 0.6, 0xffcf8a, { i: 9, d: 9, r: 0.14, bokeh: 0.9 }); sc.add(cyl(0.01, 0.01, 1.2, mat(0x222222), x, 4.4, 0.6, 6)); sc.add(cone(0.32, 0.3, mat(0x2a3a2a, { roughness: 0.5 }), x, 3.92, 0.6, 18)); return l; });
  // Day 1 table + chair by the window, plate + toast
  const tbl = grp(-5.6, 0, 2.6, sc); tbl.add(cyl(0.06, 0.06, 0.78, mat(0x222222), 0, 0.39, 0, 10)); tbl.add(cyl(0.3, 0.3, 0.04, mat(0x222222), 0, 0.02, 0, 16)); tbl.add(rbox(1.0, 0.05, 0.9, wood, 0, 0.8, 0));
  const chair = grp(-5.6, 0, 3.95, sc); chair.add(rbox(0.6, 0.06, 0.6, wood, 0, 0.5, 0)); chair.add(rbox(0.6, 0.75, 0.06, wood, 0, 0.9, 0.3)); [[-0.25, -0.25], [0.25, -0.25], [-0.25, 0.25], [0.25, 0.25]].forEach(([x, z]) => chair.add(cyl(0.025, 0.025, 0.5, mat(0x222222), x, 0.25, z, 6)));
  tbl.add(cyl(0.2, 0.17, 0.03, mat(0xffffff, { roughness: 0.2 }), 0, 0.84, 0.25, 24)); tbl.add(cyl(0.07, 0.06, 0.16, mat(0xffffff, { roughness: 0.2 }), 0.3, 0.9, 0.05, 16));
  const toast = makeToast(); sc.add(toast); const plate = cyl(0.26, 0.22, 0.035, mat(0xffffff, { roughness: 0.2 }), 0, 0, 0, 24); sc.add(plate); const splat = rbox(0.18, 0.012, 0.16, mat(0xffe27a, { roughness: 0.3 })); splat.castShadow = false; sc.add(splat);
  // other customers at the back table (background life)
  const extras = npcs(sc, [[6], [2, { hairStyle: 'long' }]]); extras[0].root.position.set(5.2, 0, 4.2); extras[1].root.position.set(6.0, 0, 3.2);
  const hero = makeLuckHero(), marcus = makeMarcus(), baker = makeBaker(); [hero, marcus, baker].forEach(P => sc.add(P.root));
  const coins = [0, 1, 2].map(() => { const c = makeCoin(0.07); c.visible = false; sc.add(c); return c; }); const spin = makeCoin(0.11); spin.visible = false; sc.add(spin);
  const wallet = grp(); wallet.add(rbox(0.3, 0.2, 0.05, mat(0x3a2418, { roughness: 0.6 }))); wallet.add(rbox(0.26, 0.05, 0.2, mat(0xd9cfc0, { roughness: 0.9 }), 0, -0.12, 0.05)); sc.add(wallet);
  const moths = [0, 1].map(() => { const g = grp(); [-1, 1].forEach(s => { const w = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.08), mat(0xd8cfb8, { side: THREE.DoubleSide, roughness: 1 })); w.position.x = s * 0.06; g.add(w); g['w' + s] = w; }); sc.add(g); return g; });
  S.bakery = { sc, key, win, win2, roll, price, toast, splat, plate, hero, marcus, baker, extras, coins, spin, wallet, moths, lamps, doily };
}
{ // ---- the hand insert (coin flip): a big hand on a dark warm surface, top-down
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x120c08);
  lightRig(sc, { env: 0.3, sky: 0xffe8c8, ground: 0x3a2a1c, hemi: 0.35, keyC: 0xfff0d8, key: 0.85, keyPos: [3, 8, 4], R: 4, rim: 0.5, rimC: 0xffb070, rimPos: [-4, 3, -4] });
  sc.add(rbox(14, 0.2, 14, new THREE.MeshStandardMaterial({ map: woodT('#5a3a22', 9), roughness: 0.5 }), 0, -0.5, 0));
  const hand = makeHandInsert(); hand.position.set(0, -0.2, 0); sc.add(hand); const coin = makeCoin(0.28); sc.add(coin);
  [[-3, 0.5, -2, 0xffb35a], [2.6, 0.3, -2.6, 0xff8a3a], [3.2, 0.2, 1.8, 0xffd28a], [-2.4, 0.1, 2.2, 0xff9a4a]].forEach(([x, y, z, c]) => practical(sc, x, y, z, c, { i: 2, d: 4, r: 0.12, bokeh: 1.4 }));
  const spark = sparkle(1.4); spark.visible = false; sc.add(spark);
  S.hand = { sc, hand, coin, spark };
}
{ // ---- WINDY BRIDGE (Day 2): deck along z, the hero at z 0 facing +z (camera end), the note blows in from far down the bridge
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x9aa8b8); sc.fog = new THREE.Fog(0x9aa8b8, 30, 140);
  const key = lightRig(sc, { env: 0.6, sky: 0xdfe8f2, ground: 0x4a5058, hemi: 0.75, keyC: 0xfff4e4, key: 1.2, keyPos: [10, 18, 12], R: 16, target: [0, 0, -8], rim: 0.6, rimC: 0xcfe0ff, rimPos: [-8, 6, -20] });
  sc.add(skyDome('#7d8fa6', '#b9c6d4', '#d8dfe6', 170));
  sc.add(rbox(8, 0.5, 160, mat(0x8a8c90, { roughness: 0.85 }), 0, -0.25, -60)); sc.add(rbox(5.2, 0.04, 160, mat(0x5e6066, { roughness: 0.7 }), 0, 0.02, -60));
  sc.add(rbox(400, 0.2, 400, mat(0x5d7488, { roughness: 0.1, metalness: 0.3, envMapIntensity: 1.2 }), 0, -9, -60));
  for (const sx of [-1, 1]) { sc.add(cyl(0.05, 0.05, 160, mat(0x3a4a5a, { metalness: 0.6, roughness: 0.4 }), sx * 3.8, 1.15, -60, 8)).children; const rl = sc.children[sc.children.length - 1]; rl.rotation.x = Math.PI / 2;
    for (let z = 8; z > -140; z -= 2.5) sc.add(rbox(0.1, 1.15, 0.1, mat(0x3a4a5a, { metalness: 0.6, roughness: 0.4 }), sx * 3.8, 0.58, z));
    for (let z = 4; z > -140; z -= 14) { const p = grp(sx * 3.6, 0, z, sc); p.add(cyl(0.07, 0.09, 4.6, mat(0x2a333d, { metalness: 0.5 }), 0, 2.3, 0, 10)); p.add(rbox(0.5, 0.25, 0.3, mat(0x2a333d), -sx * 0.25, 4.6, 0)); } }
  const r = rnd(12); for (let i = 0; i < 40; i++) { const x = (r() < 0.5 ? -1 : 1) * (25 + r() * 70), z = -60 - r() * 110, h = 8 + r() * 40; sc.add(rbox(6 + r() * 8, h, 6 + r() * 8, mat([0x7a8494, 0x8d96a3, 0x6a7280][i % 3], { roughness: 0.9 }), x, h / 2 - 9, z)); }
  const hero = makeLuckHero(); sc.add(hero.root); const note = makeNote(); sc.add(note);
  const walkers = npcs(sc, [[0], [3, { hairStyle: 'long' }], [5], [7]]);
  const hats = [0x2a2a30, 0xd7262e, 0x6b4a2b].map(c => { const g = grp(); g.add(cyl(0.34, 0.34, 0.03, mat(c), 0, 0, 0, 20)); g.add(cyl(0.22, 0.24, 0.2, mat(c), 0, 0.1, 0, 18)); sc.add(g); return g; });
  const leaves = dropsInst(sc, 60, 0xc9a25a, 0.05);
  S.bridge = { sc, key, hero, note, walkers, hats, leaves };
}
{ // ---- RUSH-HOUR JUNCTION (Day 3): a footpath along z at x 0 crosses four roads (along x) at z = -4, -16, -28, -40; a signal faces +z before each road
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0xb8c4d0); sc.fog = new THREE.Fog(0xb8c4d0, 40, 150);
  const key = lightRig(sc, { env: 0.55, sky: 0xe6eef8, ground: 0x505860, hemi: 0.7, keyC: 0xfff0d8, key: 1.3, keyPos: [14, 22, 10], R: 34, target: [0, 0, -20], rim: 0.6, rimC: 0xffd8b0, rimPos: [-14, 8, -40] });
  sc.add(skyDome('#86a4c8', '#c2d2e2', '#e8e6e0', 180));
  sc.add(rbox(160, 0.2, 160, mat(0x3a3d42, { roughness: 0.85 }), 0, -0.1, -30));
  const ROADS = [-4, -16, -28, -40]; const pave = mat(0xa9a59c, { roughness: 0.9 });
  for (let z = 8; z > -60; z -= 12) sc.add(rbox(3.4, 0.16, 6, pave, 0, 0.08, z - 6.0 + 2));
  ROADS.forEach(rz => { for (let k = -4; k <= 4; k++) sc.add(rbox(0.45, 0.02, 6.2, mat(0xf2f2ee, { roughness: 0.6 }), k * 0.55, 0.011, rz)); for (const sx of [-1, 1]) for (let x = 3; x < 60; x += 4) sc.add(rbox(2, 0.02, 0.15, mat(0xe8e2c8), sx * x, 0.011, rz)); });
  const blocks = []; const r = rnd(8); for (let i = 0; i < ROADS.length + 1; i++) { const z0 = (i === 0 ? 10 : ROADS[i - 1] - 3.5), z1 = (i === ROADS.length ? -70 : ROADS[i] + 3.5);
    for (const sx of [-1, 1]) for (let x = 6; x < 50; x += 9 + r() * 4) { const h = 6 + r() * 18, d = Math.abs(z1 - z0) - 1; const b = rbox(7, h, d, mat([0x9a8a7a, 0x7f8a96, 0xb09a80, 0x8e7a6a][Math.floor(r() * 4)], { roughness: 0.9 }), sx * (x + 3.5), h / 2, (z0 + z1) / 2); sc.add(b); blocks.push(b); }
    for (const sx of [-1, 1]) sc.add(rbox(3.6, 0.18, Math.abs(z1 - z0), pave, sx * 3.6, 0.09, (z0 + z1) / 2)); }
  const signals = ROADS.map(rz => [-1, 1].map(sx => { const s = makeSignal(); s.position.set(sx * 1.9, 0, rz + 4.0); sc.add(s); return s; }));
  const CARC = [0xd7262e, 0x2f5fb0, 0xe8e8ea, 0x1a1a1f, 0x2bb673, 0xe8a317, 0x8a8f98];
  const cars = []; ROADS.forEach((rz, ri) => [-1, 1].forEach(sx => { const n = ri < 2 ? 4 : 3; for (let k = 0; k < n; k++) { const c = makeCar(CARC[(ri * 5 + k * 3 + (sx > 0 ? 1 : 0)) % CARC.length], { open: ri === 0 && sx === 1 && k === 0 }); c.position.set(sx * (5.2 + k * 5.0), 0, rz + (sx > 0 ? -1.6 : 1.6)); c.rotation.y = sx > 0 ? -Math.PI / 2 : Math.PI / 2; sc.add(c); cars.push(c); } }));
  const driver = npc(0, { hood: 0x3a6ad0, hoodD: 0x3a6ad0 }); driver.head.add(rbox(0.72, 0.14, 0.68, mat(0x111111), 0, 0.72, 0)); sc.add(driver.root);
  const hero = makeLuckHero(); sc.add(hero.root);
  const peds = npcs(sc, [[2], [4], [6, { hairStyle: 'long' }]]);
  S.junction = { sc, key, signals, cars, driver, hero, peds, ROADS };
}
{ // ---- SEASIDE ARCADE (Day 5): the claw machine at the origin (glass box y 0.9..2.6), the hero at z 1.9 facing -z, the kid to his right
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x0c0614);
  const key = lightRig(sc, { env: 0.3, sky: 0xc8a0ff, ground: 0x200a30, hemi: 0.35, keyC: 0xffe0f0, key: 0.55, keyPos: [3, 8, 6], R: 8, rim: 0.9, rimC: 0x40e0ff, rimPos: [-6, 5, -6] });
  const carpet = new THREE.MeshStandardMaterial({ map: ctex(256, 256, (g, w, h) => { g.fillStyle = '#1a0b2e'; g.fillRect(0, 0, w, h); const r2 = rnd(3); for (let i = 0; i < 60; i++) { g.strokeStyle = ['#ff3aa8', '#3ae0ff', '#ffd23a', '#7aff5a'][i % 4]; g.lineWidth = 3; g.beginPath(); const x = r2() * w, y = r2() * h; g.arc(x, y, 6 + r2() * 10, 0, 3 + r2() * 3); g.stroke(); } }), roughness: 0.95 }); carpet.map.wrapS = carpet.map.wrapT = THREE.RepeatWrapping; carpet.map.repeat.set(6, 6);
  sc.add(rbox(20, 0.2, 20, carpet, 0, -0.1, 0)); sc.add(rbox(20, 6, 0.3, mat(0x1d0d30, { roughness: 0.9 }), 0, 3, -5)); sc.add(rbox(0.3, 6, 20, mat(0x1d0d30), -7, 3, 0)); sc.add(rbox(0.3, 6, 20, mat(0x1d0d30), 7, 3, 0));
  const neon = (x, y, z, w, h, c, ry = 0) => { const m = rbox(w, h, 0.06, mat(c, { emissive: c, emissiveIntensity: 3 }), x, y, z); m.rotation.y = ry; m.castShadow = false; sc.add(m); };
  neon(0, 5.0, -4.8, 12, 0.08, 0xff3aa8); neon(0, 4.7, -4.8, 12, 0.08, 0x3ae0ff); neon(-6.8, 4.8, 0, 12, 0.08, 0xff3aa8, Math.PI / 2); neon(6.8, 4.8, 0, 12, 0.08, 0x3ae0ff, Math.PI / 2);
  const cabTex = (c1, c2, s) => ctex(128, 128, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, c1); gr.addColorStop(1, c2); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.font = '800 26px InterW, Arial'; g.textAlign = 'center'; g.fillText(s, 64, 70); });
  [[-4.6, -3.6, 'BONUS!', '#ff3aa8', '#7a1aff'], [-2.2, -4.0, '2P', '#3ae0ff', '#1a4aff'], [2.4, -4.0, 'WIN!', '#ffd23a', '#ff6a1a'], [4.8, -3.6, 'JACKPOT', '#7aff5a', '#1aa05a'], [-5.6, 1.8, 'RACE', '#ff6a5a', '#a01a3a'], [5.6, 1.6, 'COINS', '#ffd23a', '#a07a1a']].forEach(([x, z, s, a, b]) => {
    const g = grp(x, 0, z, sc); g.add(rbox(1.3, 2.2, 1.0, mat(0x1a1a24, { roughness: 0.5 }), 0, 1.1, 0)); const scr = signMesh(1.0, 0.8, cabTex(a, b, s), true); scr.position.set(0, 1.6, 0.51); g.add(scr); g.lookAt(0, 0, 1.5); practical(sc, x, 2.7, z + 0.6, new THREE.Color(a).getHex(), { i: 3, d: 4, r: 0.05, bokeh: 1.1 }); });
  // the claw machine
  const cm = grp(0, 0, 0, sc); const body = mat(0xff3aa8, { roughness: 0.35, metalness: 0.2 }), trim = mat(0xffd23a, { roughness: 0.3, metalness: 0.6 });
  cm.add(rbox(1.8, 0.9, 1.8, body, 0, 0.45, 0)); cm.add(rbox(1.8, 0.45, 1.8, body, 0, 2.85, 0)); [[-0.87, -0.87], [0.87, -0.87], [-0.87, 0.87], [0.87, 0.87]].forEach(([x, z]) => cm.add(rbox(0.07, 1.75, 0.07, trim, x, 1.75, z)));
  const glassB = new THREE.Mesh(rgeo(1.7, 1.7, 1.7), GLASS); glassB.position.set(0, 1.75, 0); cm.add(glassB); cm.glassB = glassB;
  const door = grp(-0.85, 0.9, 0.86, cm); const gl = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.7), GLASS); gl.position.set(0.85, 0.85, 0); door.add(gl); cm.door = door;
  const marquee = signMesh(1.6, 0.36, signTex('CLAW', '#2a0a3a', '#ffd23a', 512, 128, '800 90px Montserrat, Arial'), true); marquee.position.set(0, 2.88, 0.91); cm.add(marquee);
  cm.add(rbox(0.5, 0.35, 0.1, mat(0x111111), 0.45, 0.55, 0.91)); cm.add(rbox(0.12, 0.2, 0.05, mat(0xffd23a, { emissive: 0xffd23a, emissiveIntensity: 1.5 }), -0.4, 0.7, 0.92));
  practical(sc, 0, 2.5, 0, 0xffe8ff, { i: 3, d: 3, r: 0.04, ei: 1 });
  const claw = grp(0, 2.45, 0, cm); claw.add(cyl(0.02, 0.02, 1.2, mat(0xcfd3da, { metalness: 1, roughness: 0.2 }), 0, 0.6, 0, 6)); claw.add(cyl(0.12, 0.14, 0.16, mat(0xcfd3da, { metalness: 1, roughness: 0.2 }), 0, 0, 0, 14));
  claw.prongs = [0, 1, 2].map(i => { const p = grp(0, -0.05, 0, claw); p.rotation.y = i * 2.094; const a = grp(0.1, 0, 0, p); a.add(rbox(0.04, 0.32, 0.05, mat(0xcfd3da, { metalness: 1, roughness: 0.2 }), 0.04, -0.16, 0)); return a; }); cm.claw = claw;
  const bears = [...Array(46)].map((_, i) => { const b = makeBear(i, 0.55 + (i % 4) * 0.05); sc.add(b); return b; });
  const r = rnd(21); const pile = bears.map((b, i) => V([(r() - 0.5) * 1.3, 0.92 + Math.floor(i / 16) * 0.22 + r() * 0.08, (r() - 0.5) * 1.3]));
  const hero = makeLuckHero(), kid = makeKid(); sc.add(hero.root); sc.add(kid.root);
  const mum = npc(1, { hairStyle: 'long', hood: 0xff8c5a, hoodD: 0xff8c5a }); sc.add(mum.root);
  S.arcade = { sc, key, cm, bears, pile, hero, kid, mum };
}
{ // ---- MARCUS'S DRIVEWAY (Days 7 + 23): pavement along x at z 1..3, road z 3.3..9.5, house behind; the red convertible on the drive at (4, 0, -2.6)
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0xa8c6e6);
  const key = lightRig(sc, { env: 0.6, sky: 0xe4f0ff, ground: 0x4a6a3a, hemi: 0.7, keyC: 0xfff0d6, key: 1.5, keyPos: [-12, 18, 14], R: 22, target: [1, 0, 0], rim: 0.5, rimC: 0xffe0c0, rimPos: [10, 8, -14] });
  const dome = skyDome('#5d8ed0', '#a9c8ea', '#e8eef2', 170); sc.add(dome);
  sc.add(rbox(120, 0.2, 80, mat(0x5f9a42, { roughness: 0.95 }), 0, -0.1, -20)); sc.add(rbox(120, 0.05, 6.2, mat(0x34373c, { roughness: 0.8 }), 0, 0.02, 6.4));
  for (let x = -60; x < 60; x += 4) sc.add(rbox(2, 0.02, 0.14, mat(0xf2f2ee), x, 0.05, 6.4));
  sc.add(rbox(120, 0.18, 2.2, mat(0xb4afa6, { roughness: 0.9 }), 0, 0.09, 2.1)); sc.add(rbox(120, 0.22, 0.2, mat(0x8f8b84), 0, 0.11, 3.25));
  sc.add(rbox(4.2, 0.08, 7.5, mat(0x9a958c, { roughness: 0.85 }), 4, 0.04, -2.75));
  const hedge = mat(0x2f6a2a, { roughness: 1 }); sc.add(rbox(20, 0.9, 0.7, hedge, -8.1, 0.45, 0.6)); sc.add(rbox(20, 0.9, 0.7, hedge, 16.1, 0.45, 0.6));
  const house = (x, z, col, roof) => { const g = grp(x, 0, z, sc); g.add(rbox(8, 4.6, 6, mat(col, { roughness: 0.9 }), 0, 2.3, 0)); const rf = cone(6.2, 2.6, mat(roof, { roughness: 0.8 }), 0, 5.9, 0, 4); rf.rotation.y = Math.PI / 4; rf.scale.set(1, 1, 0.8); g.add(rf);
    [[-2.2, 1.4], [2.2, 1.4], [-2.2, 3.4], [2.2, 3.4]].forEach(([wx, wy]) => { g.add(rbox(1.3, 1.1, 0.1, mat(0xbfe0ff, { roughness: 0.05, metalness: 0.4, envMapIntensity: 1.5 }), wx, wy, 3.02)); g.add(rbox(1.45, 0.1, 0.16, mat(0xffffff), wx, wy - 0.6, 3.03)); });
    g.add(rbox(1.1, 2.2, 0.1, mat(0x1f3a6a), 0, 1.1, 3.03)); return g; };
  house(3, -10, 0xe8dcc4, 0x7a3a2a); house(-11, -10, 0xc4d2e0, 0x3a3a44); house(16, -10, 0xe0c0a8, 0x5a3a2a);
  const bins = grp(-1.8, 0, -1.2, sc); bins.add(rbox(0.7, 1.1, 0.7, mat(0x2a2d33), 0, 0.55, 0)); bins.add(rbox(0.7, 1.1, 0.7, mat(0x2b6a3a), 0.85, 0.55, 0));
  const car = makeCar(0xc8102e, { open: true, lights: 0.2 }); car.position.set(4, 0, -2.6); sc.add(car);
  const bucket = grp(2.7, 0, -0.9, sc); bucket.add(cyl(0.2, 0.16, 0.35, mat(0x2f6ad0, { roughness: 0.4 }), 0, 0.18, 0, 16)); bucket.add(cyl(0.18, 0.18, 0.02, mat(0xffffff, { roughness: 0.1 }), 0, 0.34, 0, 16));
  const puddle = new THREE.Mesh(new THREE.CircleGeometry(1, 32), new THREE.MeshStandardMaterial({ color: 0x6a8aa8, roughness: 0.02, metalness: 0.8, envMapIntensity: 2 })); puddle.rotation.x = -Math.PI / 2; puddle.scale.set(1.8, 0.8, 1); puddle.position.set(-0.6, 0.05, 4.0); sc.add(puddle);
  const bus = makeBus(); bus.rotation.y = Math.PI / 2; sc.add(bus);
  const spray = dropsInst(sc, 420, 0xbfe6ff, 0.075); const sheet = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xa8dcff, roughness: 0.05, transparent: true, opacity: 0.35, envMapIntensity: 2, side: THREE.DoubleSide, depthWrite: false })); sheet.visible = false; sc.add(sheet);
  const hero = makeLuckHero(), marcus = makeMarcus(); sc.add(hero.root); sc.add(marcus.root);
  const cr = rnd(31); const pts = []; for (let i = 0; i < 160; i++) { const x = -5.0 - cr() * 13, z = 1.5 + cr() * 4.2; pts.push([x, 0, z, Math.PI / 2 + (cr() - 0.5) * 0.6]); } const crowd = crowdInst(sc, pts, { seed: 9 });
  // the meteor (Day 23): glowing rock + fire trail + smoke; the crater + flattened car
  const met = grp(0, 0, 0, sc); const rock = new THREE.Mesh(new THREE.IcosahedronGeometry(0.7, 0), new THREE.MeshStandardMaterial({ color: 0x3a2a22, roughness: 0.9, flatShading: true, emissive: 0xff5a1a, emissiveIntensity: 0.6 })); met.add(rock);
  const trail = [...Array(14)].map((_, i) => { const s = sprite(fireTex, 4.2 - i * 0.2, { add: true, op: 1 - i / 14 }); met.add(s); return s; }); met.trail = trail; met.light = new THREE.PointLight(0xff8a3a, 0, 40, 1.4); met.add(met.light); met.visible = false;
  const smoke = [...Array(16)].map(() => { const s = sprite(smokeTex, 2.5); s.visible = false; sc.add(s); return s; });
  const flash = new THREE.PointLight(0xffc07a, 0, 30, 1.2); flash.position.set(4, 3, -2); sc.add(flash);
  const debris = debrisPool(sc, 28, [0xc8102e, 0x3a2a22, 0x222222, 0xbfe0ff]);
  S.drive = { sc, key, car, bucket, puddle, bus, spray, sheet, hero, marcus, crowd, met, smoke, flash, debris, dome };
}
{ // ---- RACECOURSE (Day 9): the straight runs along x (horses run toward -x), the spectator rail at z 5.2, the finish post at x -0.5
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0xa8cce8); sc.fog = new THREE.Fog(0xb8d4ea, 60, 220);
  const key = lightRig(sc, { env: 0.6, sky: 0xe8f4ff, ground: 0x4a7a3a, hemi: 0.75, keyC: 0xfff0d0, key: 1.5, keyPos: [-10, 22, 18], R: 40, target: [10, 0, 0], rim: 0.6, rimC: 0xffe0b0, rimPos: [20, 8, -20] });
  sc.add(skyDome('#5a92d6', '#a8cce8', '#eaf2f6', 220));
  sc.add(rbox(400, 0.2, 200, mat(0x4f8f38, { roughness: 0.95 }), 0, -0.1, 0)); const turf = new THREE.MeshStandardMaterial({ map: ctex(256, 64, (g, w, h) => { for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? '#5aa042' : '#62aa48'; g.fillRect(i * 16, 0, 16, h); } }), roughness: 0.95 }); turf.map.wrapS = THREE.RepeatWrapping; turf.map.repeat.set(30, 1);
  sc.add(rbox(300, 0.04, 10.2, turf, 20, 0.02, 0));
  const railM = mat(0xf6f6f6, { roughness: 0.4 }); for (const z of [-5.2, 5.2]) { const rl = cyl(0.06, 0.06, 300, railM, 20, 1.15, z, 8); rl.rotation.z = Math.PI / 2; sc.add(rl); const posts = new THREE.InstancedMesh(new THREE.BoxGeometry(0.1, 1.15, 0.1), railM, 150); const mt = new THREE.Matrix4(); for (let i = 0; i < 150; i++) { mt.makeTranslation(-130 + i * 2, 0.58, z); posts.setMatrixAt(i, mt); } posts.castShadow = true; sc.add(posts); }
  const post = grp(-6.0, 0, 5.0, sc); post.add(cyl(0.08, 0.08, 3, mat(0xffffff), 0, 1.5, 0, 10)); T(post, cyl(0.45, 0.45, 0.05, mat(0xd7262e), 0, 3.0, 0, 24)).rotation.x = Math.PI / 2;
  // grandstand + crowd behind the spectators
  for (let k = 0; k < 6; k++) sc.add(rbox(60, 0.8, 1.6, mat(0xcfcfd4, { roughness: 0.8 }), 0, 0.4 + k * 0.8, 13 + k * 1.6)); sc.add(rbox(62, 1.0, 12, mat(0x2f5f8f), 0, 9.5, 17)); for (let x = -28; x <= 28; x += 8) sc.add(cyl(0.15, 0.15, 9, mat(0xdddddd), x, 4.5, 21.6, 8));
  const pts = []; const r = rnd(6); for (let k = 0; k < 6; k++) for (let x = -28; x < 28; x += 0.9 + r() * 0.4) pts.push([x, 0.8 + k * 0.8, 13 + k * 1.6, Math.PI]); for (let x = -26; x < 26; x += 1.1 + r()) { if (Math.abs(x - 0) < 4.5) continue; pts.push([x, 0, 7.4 + r() * 2.5, Math.PI]); }
  const crowd = crowdInst(sc, pts, { seed: 4 });
  const board = grp(-4.6, 0, 8.6, sc); board.add(rbox(0.1, 3, 0.1, mat(0x333333), -0.9, 1.5, 0)); board.add(rbox(0.1, 3, 0.1, mat(0x333333), 0.9, 1.5, 0));
  const bm = signMesh(2.2, 1.5, ctex(440, 300, (g, w, h) => { g.fillStyle = '#16251c'; g.fillRect(0, 0, w, h); g.strokeStyle = '#c9b46a'; g.lineWidth = 8; g.strokeRect(6, 6, w - 12, h - 12); g.fillStyle = '#f4efe2'; g.font = '800 34px InterW, Arial'; g.textAlign = 'center'; g.fillText('2:15 RACE ODDS', w / 2, 52);
    g.textAlign = 'left'; g.font = '700 30px InterW, Arial'; [['1 THUNDERBOLT', '1-2 FAV'], ['2 SILVER DART', '4-1'], ['3 MIDNIGHT', '6-1'], ['4 GOLD RUSH', '8-1']].forEach(([n, o], i) => { g.fillText(n, 26, 104 + i * 40); g.textAlign = 'right'; g.fillText(o, w - 26, 104 + i * 40); g.textAlign = 'left'; });
    g.fillStyle = '#ffd23a'; g.font = '800 32px InterW, Arial'; g.fillText('9 NO CHANCE', 26, 276); g.textAlign = 'right'; g.fillText('500-1', w - 26, 276); })); bm.position.set(0, 2.6, -0.06); bm.rotation.y = Math.PI; board.add(bm); board.add(rbox(2.3, 1.6, 0.08, mat(0x2a2a2a), 0, 2.6, 0));
  const horses = [[0xf2efe8, 0xd7262e, 1], [0x6b3a1e, 0x1f4fd6, 2], [0x1a1410, 0x2bb673, 3], [0x8a5a32, 0xe8a317, 4], [0x5a3a22, 0x9b59d6, 5]].map(([c, s, n]) => { const h = makeHorse(c, { silk: s, number: n }); h.rotation.y = -Math.PI / 2; sc.add(h); return h; });
  const pony = makeHorse(0xb08a5a, { shaggy: true, mane: 0x3a2a1a, silk: 0xff8ad0, number: 9, scale: 0.68 }); pony.rotation.y = -Math.PI / 2; sc.add(pony);
  const fan = npc(5, {}); sc.add(fan.root); const sandwich = grp(); sandwich.add(rbox(0.36, 0.08, 0.24, mat(0xf0d9a8))); sandwich.add(rbox(0.38, 0.03, 0.26, mat(0x7ac84a), 0, -0.05, 0)); sandwich.add(rbox(0.36, 0.08, 0.24, mat(0xf0d9a8), 0, -0.1, 0)); sc.add(sandwich);
  const hero = makeLuckHero(), marcus = makeMarcus(); sc.add(hero.root); sc.add(marcus.root);
  const copiers = npcs(sc, [[1, { hairStyle: 'long' }], [3], [7]]); hatOn(copiers[0], 'fascinator', 0xff3aa8); hatOn(copiers[1], 'trilby', 0x3a3a44); hatOn(copiers[2], 'flat', 0x6b5a3a);
  copiers.forEach(P => { P.slip = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.13), mat(0xfaf7ee, { side: THREE.DoubleSide })); P.slip.position.set(0, -0.52, 0.12); P.arms[1].el.add(P.slip); });
  const dust = [...Array(20)].map(() => { const s = sprite(smokeTex, 1.6, { op: 0.6 }); s.material.color.setHex(0xc8b090); s.visible = false; sc.add(s); return s; });
  const halves = [0, 1].map(() => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.14), mat(0xfaf7ee, { side: THREE.DoubleSide })); m.visible = false; sc.add(m); return m; });
  S.races = { sc, key, horses, pony, fan, sandwich, hero, marcus, copiers, crowd, dust, halves, post };
}
{ // ---- LAUNDERETTE at night (Day 13): machines along the back wall z -1.6, the bench at z 0.4, the hero sits facing +z
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x081018);
  const key = lightRig(sc, { env: 0.3, sky: 0xd8f0ff, ground: 0x203040, hemi: 0.3, keyC: 0xe8f6ff, key: 0.6, keyPos: [2, 8, 6], R: 8, rim: 0.7, rimC: 0x6ab8ff, rimPos: [-5, 4, -6] });
  sc.add(rbox(16, 0.2, 12, new THREE.MeshStandardMaterial({ map: tileTex('#d8dcd8', '#a8b0aa', 8), roughness: 0.35 }), 0, -0.1, 0)); sc.add(rbox(16, 5, 0.3, mat(0x7aa8a0, { roughness: 0.9 }), 0, 2.5, -2.4));
  const drumTex = ctex(128, 128, (g, w, h) => { g.fillStyle = '#5a7a90'; g.fillRect(0, 0, w, h); const r2 = rnd(2); for (let i = 0; i < 14; i++) { g.fillStyle = ['#d7262e', '#f2f2f2', '#2f5fb0', '#e8a317', '#7a5aa0'][i % 5]; g.beginPath(); g.ellipse(r2() * w, r2() * h, 14 + r2() * 20, 8 + r2() * 10, r2() * 3, 0, 7); g.fill(); } });
  const drums = []; for (let k = 0; k < 7; k++) { const x = -4.5 + k * 1.5; const g = grp(x, 0, -1.6, sc); g.add(rbox(1.3, 1.4, 1.2, mat(0xf2f2f0, { roughness: 0.3 }), 0, 0.7, 0)); const ring = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.06, 10, 28), mat(0xb8bcc4, { metalness: 0.8, roughness: 0.25 })); ring.position.set(0, 0.68, 0.61); g.add(ring);
    const d = new THREE.Mesh(new THREE.CircleGeometry(0.4, 28), new THREE.MeshStandardMaterial({ map: drumTex.clone(), emissive: 0x9fd0ff, emissiveIntensity: 0.25, roughness: 0.1 })); d.material.map.needsUpdate = true; d.material.map.center.set(0.5, 0.5); d.position.set(0, 0.68, 0.6); g.add(d); drums.push(d);
    g.add(rbox(1.0, 0.18, 0.05, mat(0x2a2d33), 0, 1.25, 0.61)); g.add(rbox(0.1, 0.06, 0.02, mat(0x3dff7a, { emissive: 0x3dff7a, emissiveIntensity: 2 }), 0.35, 1.26, 0.64)); }
  for (let k = 0; k < 7; k++) sc.add(rbox(1.3, 1.2, 1.2, mat(0xe8e8e6, { roughness: 0.3 }), -4.5 + k * 1.5, 2.1, -1.6));
  const tubes = [-3, 0, 3].map(x => { const t = rbox(2.2, 0.08, 0.16, mat(0xffffff, { emissive: 0xe8fff8, emissiveIntensity: 2.5 }), x, 4.4, 0.4); t.castShadow = false; sc.add(t); const l = new THREE.PointLight(0xe0fff4, 5, 7, 1.5); l.position.set(x, 4.0, 0.6); sc.add(l); return l; });
  const bench = grp(0, 0, 0.6, sc); bench.add(rbox(3.2, 0.1, 0.6, new THREE.MeshStandardMaterial({ map: woodT('#8a5a32', 4), roughness: 0.6 }), 0, 0.5, 0)); [-1.4, 1.4].forEach(x => bench.add(rbox(0.08, 0.5, 0.5, mat(0x2a2d33), x, 0.25, 0)));
  const winFront = new THREE.Mesh(new THREE.PlaneGeometry(10, 3.5), new THREE.MeshBasicMaterial({ color: 0x0a1428, toneMapped: false })); winFront.position.set(0, 2.2, 5.5); winFront.rotation.y = Math.PI; sc.add(winFront);
  const hero = makeLuckHero(); sc.add(hero.root); const coin = makeCoin(0.07); sc.add(coin);
  S.laundrette = { sc, key, drums, hero, coin, tubes };
}
{ // ---- CASINO (Day 20): the table at the origin (felt top y 0.86), the hero sits at z 1.45 facing -z, the dealer at z -1.5 facing +z
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x120808);
  const key = lightRig(sc, { env: 0.35, sky: 0xffe0b0, ground: 0x301010, hemi: 0.35, keyC: 0xffe4c0, key: 0.9, keyPos: [0, 9, 4], R: 9, rim: 0.7, rimC: 0xffb060, rimPos: [-6, 5, -8] });
  const carpet = new THREE.MeshStandardMaterial({ map: ctex(256, 256, (g, w, h) => { g.fillStyle = '#5a0e18'; g.fillRect(0, 0, w, h); g.strokeStyle = '#c9a040'; g.lineWidth = 4; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.beginPath(); g.arc(32 + i * 64, 32 + j * 64, 20, 0, 7); g.stroke(); g.beginPath(); g.moveTo(32 + i * 64, 6 + j * 64); g.lineTo(32 + i * 64, 58 + j * 64); g.stroke(); } }), roughness: 0.95 }); carpet.map.wrapS = carpet.map.wrapT = THREE.RepeatWrapping; carpet.map.repeat.set(8, 8);
  sc.add(rbox(30, 0.2, 30, carpet, 0, -0.1, 0)); sc.add(rbox(30, 7, 0.3, mat(0x2a0a10, { roughness: 0.8 }), 0, 3.5, -7));
  const felt = mat(0x0f6a3a, { roughness: 0.9 }); const top = cyl(1, 1, 0.1, felt, 0, 0.82, 0, 40); top.scale.set(2.2, 1, 1.25); sc.add(top); const rail = new THREE.Mesh(new THREE.TorusGeometry(1, 0.08, 10, 48), mat(0x3a1a0e, { roughness: 0.4 })); rail.rotation.x = Math.PI / 2; rail.scale.set(2.2, 1.25, 1); rail.position.y = 0.88; sc.add(rail);
  sc.add(cyl(0.5, 0.7, 0.8, mat(0x2a120a), 0, 0.4, 0, 20));
  const chairM = mat(0x8a1020, { roughness: 0.6 }); const chair = grp(0, 0, 1.75, sc); chair.add(rbox(0.7, 0.12, 0.6, chairM, 0, 0.5, 0)); chair.add(rbox(0.7, 0.9, 0.12, chairM, 0, 1.0, 0.3)); chair.add(cyl(0.05, 0.05, 0.5, mat(0xc9a040, { metalness: 0.9, roughness: 0.3 }), 0, 0.25, 0, 8));
  const chand = [[-3, -2], [3, -2], [0, 2.5]].map(([x, z]) => { const g = grp(x, 4.6, z, sc); for (let k = 0; k < 8; k++) { const a = k / 8 * 6.283; g.add(ball(0.08, mat(0xfff2d0, { emissive: 0xffe0a0, emissiveIntensity: 3 }), Math.cos(a) * 0.5, 0, Math.sin(a) * 0.5, undefined, 8)); } const l = new THREE.PointLight(0xffd9a0, 10, 10, 1.4); g.add(l); const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: bokehTex, color: 0xffd9a0, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); sp.scale.setScalar(2.2); g.add(sp); return g; });
  const slotTex = (s) => ctex(128, 160, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#ff3a6a'); gr.addColorStop(1, '#6a1aff'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.fillRect(14, 50, 100, 50); g.fillStyle = '#d7262e'; g.font = '800 40px InterW, Arial'; g.textAlign = 'center'; g.fillText(s, 64, 90); });
  for (let k = 0; k < 9; k++) { const x = -8 + k * 2; const g = grp(x, 0, -6, sc); g.add(rbox(1.2, 2.2, 0.9, mat(0x1a1a24), 0, 1.1, 0)); const s = signMesh(0.9, 1.1, slotTex(['777', 'BAR', '$$$'][k % 3]), true); s.position.set(0, 1.5, 0.46); g.add(s); }
  const cards = [...Array(5)].map((_, i) => { const c = makeCard(RANKS[i]); sc.add(c); return c; });
  const stacks = [...Array(14)].map((_, i) => { const s = makeChipStack(40, CHIPC[i % 5]); sc.add(s); return s; });
  const hero = makeLuckHero(), dealer = makeSuit(0xf4f4f4, { vest: true, tie: 0x111111, skin: 0x8a5a3c }), boss = makeSuit(0x1d1d24, { bald: true, tie: 0xc9a040, skin: 0xe8b896 }); [hero, dealer, boss].forEach(P => sc.add(P.root));
  const r = rnd(14); const pts = []; for (let i = 0; i < 26; i++) { const a = -0.9 + r() * 1.8; pts.push([Math.sin(a) * (3.0 + r() * 1.6), 0, 3.4 + Math.cos(a) * (1.0 + r() * 1.6), Math.PI + a * 0.4]); } const crowd = crowdInst(sc, pts, { seed: 12 });
  const near = npcs(sc, [[2, { hairStyle: 'long' }], [6]]);
  S.casino = { sc, key, cards, stacks, hero, dealer, boss, crowd, near, chand };
}
{ // ---- PUB (Day 26): the bar along x at z -2.2, the TV above the back bar at (1.6, 3.3, -3.25) facing +z, the hero kneels at (0, 0, 1.3)
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x140c08);
  const key = lightRig(sc, { env: 0.35, sky: 0xffe0b8, ground: 0x3a2412, hemi: 0.4, keyC: 0xffdcb0, key: 0.8, keyPos: [3, 9, 6], R: 10, rim: 0.6, rimC: 0xffa860, rimPos: [-5, 5, -6] });
  sc.add(rbox(20, 0.2, 16, new THREE.MeshStandardMaterial({ map: woodT('#4a2a16', 6), roughness: 0.5 }), 0, -0.1, 2)); sc.add(rbox(20, 6, 0.3, mat(0x3a2418, { roughness: 0.8 }), 0, 3, -3.5));
  sc.add(rbox(0.3, 6, 16, mat(0x6a2a20), -7.5, 3, 2)); sc.add(rbox(0.3, 6, 16, mat(0x6a2a20), 7.5, 3, 2));
  const wood = new THREE.MeshStandardMaterial({ map: woodT('#6a3a1a', 2), roughness: 0.45 }); sc.add(rbox(9, 1.1, 0.9, wood, 0, 0.55, -2.2)); sc.add(rbox(9.2, 0.08, 1.0, mat(0x3a1e0c, { roughness: 0.25 }), 0, 1.14, -2.2));
  for (let k = 0; k < 5; k++) { const x = -2 + k * 0.5; sc.add(cyl(0.04, 0.04, 0.5, mat(0xcfd3da, { metalness: 1, roughness: 0.2 }), x, 1.42, -2.3, 8)); sc.add(rbox(0.12, 0.2, 0.06, mat([0xd7262e, 0xe8a317, 0x2bb673][k % 3]), x, 1.6, -2.27)); }
  for (const y of [1.9, 2.4]) { sc.add(rbox(8, 0.06, 0.4, mat(0x2a1a0e), 0, y, -3.2)); for (let k = 0; k < 18; k++) { const c = [0x3a8a3a, 0x8a4a1a, 0xc9a040, 0x2a5a8a][k % 4]; sc.add(cyl(0.06, 0.07, 0.36, mat(c, { roughness: 0.1, emissive: c, emissiveIntensity: 0.35 }), -3.8 + k * 0.44, y + 0.2, -3.2, 10)); } }
  const tvTex = screenTex(640, 400); const tv = grp(1.6, 3.4, -3.25, sc); tv.add(rbox(2.5, 1.6, 0.15, mat(0x111111))); const tvs = screenMesh(2.36, 1.48, tvTex, { z: 0.08 }); tv.add(tvs); const tvL = new THREE.PointLight(0x9fc0ff, 6, 6, 1.5); tvL.position.set(1.6, 3.2, -2.2); sc.add(tvL);
  [[-4, 3.6, 1], [0.5, 3.8, 2.5], [4, 3.6, 0.5]].forEach(([x, y, z]) => practical(sc, x, y, z, 0xffb86a, { i: 7, d: 8, r: 0.12, bokeh: 1.2 }));
  [[-4.5, 3.5], [4.6, 3.8]].forEach(([x, z]) => { const t = grp(x, 0, z, sc); t.add(cyl(0.7, 0.7, 0.06, wood, 0, 0.78, 0, 24)); t.add(cyl(0.06, 0.06, 0.76, mat(0x222222), 0, 0.38, 0, 8)); });
  const r = rnd(41); const pts = []; for (let i = 0; i < 46; i++) { const x = -6.5 + r() * 13, z = 0.2 + r() * 6.5; if (Math.abs(x) < 1.6 && z < 3.4) continue; pts.push([x, 0, z, Math.PI + (r() - 0.5) * 0.5]); } const crowd = crowdInst(sc, pts, { seed: 21 });
  const near = npcs(sc, [[3], [5, { hairStyle: 'long' }], [0], [4]]);
  const hero = makeLuckHero(); sc.add(hero.root); const phone = makeWinPhone(); sc.add(phone);
  const conf = dropsInst(sc, 260, 0xffffff, 0.05); const confC = [0xffd23a, 0xff3aa8, 0x3ae0ff, 0x7aff5a, 0xffffff]; for (let i = 0; i < 260; i++) conf.m.setColorAt(i, new THREE.Color(confC[i % 5]));
  const ticket = makeTicket(); ticket.scale.setScalar(0.25); sc.add(ticket);
  S.pub = { sc, key, tv, tvTex, crowd, near, hero, phone, conf, ticket };
}
{ // ---- the ticket insert + the nationwide queue (Day 26 montage)
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x0e0a08);
  lightRig(sc, { env: 0.45, sky: 0xffe8c8, ground: 0x3a2a1c, hemi: 0.45, keyC: 0xfff0d8, key: 1.3, keyPos: [2, 8, 4], R: 5 });
  sc.add(rbox(14, 0.2, 14, new THREE.MeshStandardMaterial({ map: woodT('#6a4a2a', 11), roughness: 0.6 }), 0, -0.1, 0)); const t = makeTicket(); t.position.y = 0.01; sc.add(t); const pen = makePen(); sc.add(pen);
  [[-2.5, 0.4, -1.6, 0xffb35a], [2.4, 0.3, -2.0, 0xff8a3a], [2.6, 0.2, 1.6, 0xffd28a]].forEach(([x, y, z, c]) => practical(sc, x, y, z, c, { i: 2, d: 4, r: 0.1, bokeh: 1.2 }));
  S.ticket = { sc, pen };
}
{ // ---- the plaza: a queue snaking across the city square to a LOTTO kiosk, seen from above
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x8a9aa8);
  const key = lightRig(sc, { env: 0.55, sky: 0xe8f0f8, ground: 0x505860, hemi: 0.7, keyC: 0xfff0d8, key: 1.4, keyPos: [10, 30, 12], R: 40 });
  sc.add(rbox(200, 0.2, 200, new THREE.MeshStandardMaterial({ map: tileTex('#c8c0b0', '#b8b0a0', 8), roughness: 0.9 }), 0, -0.1, 0)); sc.children[sc.children.length - 1].material.map.repeat.set(20, 20);
  const kiosk = grp(0, 0, -14, sc); kiosk.add(rbox(5, 3.2, 3, mat(0xe8343c, { roughness: 0.5 }), 0, 1.6, 0)); const ks = signMesh(4.4, 1.1, signTex('LOTTO', '#e8343c', '#ffffff', 512, 128, '800 96px Montserrat, Arial'), true); ks.rotation.x = -Math.PI / 2; ks.position.set(0, 3.25, 0); kiosk.add(ks);
  const pts = []; for (let i = 0; i < 360; i++) { const u = i / 360; const row = Math.floor(u * 9), f = (u * 9) % 1; const x = (row % 2 ? 1 : -1) * (14 - f * 28) * -1, z = -10 + row * 3.0; pts.push([x, 0, z, row % 2 ? Math.PI / 2 : -Math.PI / 2]); }
  const crowd = crowdInst(sc, pts, { seed: 33, s: 0.9 }); const r = rnd(9); for (let i = 0; i < 40; i++) { const x = -30 + r() * 60, z = -30 + r() * 60; if (Math.abs(x) < 18 && z > -16 && z < 18) continue; sc.add(rbox(6, 6 + r() * 10, 6, mat(0x8a8078, { roughness: 0.9 }), x, 3, z)); }
  const slips = dropsInst(sc, 120, 0xfff6e0, 0.12);
  S.plaza = { sc, crowd, slips };
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
// ===== shared: the coin-flip insert that opens every day (same framing every time: the signature) =====
const DAYS = [1, 2, 3, 5, 7, 9, 13, 20, 23, 26, 'END'];
const INS = 0.75, LAND = 0.33;
function coinInsert(t0, t1, mode, camO = {}) {
  shot(t0, t1, 'hand', { ease: camO.ease || 'lin', p0: [0.15, 4.7, 1.9], p1: camO.p1 || [0.12, 4.4, 1.7], l0: camO.l || [0, 0.0, -0.25], fov: 40, shift: 0.0 }, (lt, O) => {
    const H = S.hand, c = H.coin, dt = O - t0; const land = V([0.05, 0.005, 0.12]);
    const fin = mode === 'tails' ? Math.PI : mode === 'edge' ? Math.PI / 2 : 0;
    if (dt < LAND) { const u = dt / LAND; c.position.set(lerp(-0.6, land.x, u), land.y + 3.2 * (1 - u * u), lerp(0.9, land.z, u)); c.rotation.set(fin + (1 - u) * 26, 0.3 * (1 - u), 0); }
    else { const b = dt - LAND; const hop = mode === 'edge' ? 0 : Math.max(0, Math.sin(Math.min(1, b / 0.14) * Math.PI)) * 0.07 * Math.exp(-b * 6);
      c.position.set(land.x, land.y + hop + (mode === 'edge' ? 0.27 : 0), land.z); const wob = mode === 'edge' ? 0.32 * Math.exp(-b * 2.2) * Math.sin(b * 16) : 0; c.rotation.set(fin, 0.3, wob); }
    H.hand.rotation.set(0, 0, 0.03 * Math.sin(O * 1.3)); H.hand.position.y = -0.2 + (dt > LAND && dt < LAND + 0.1 ? -0.03 : 0);
    const sp = mode === 'heads' ? clamp(1 - (dt - LAND) / 0.4) * (dt >= LAND ? 1 : 0) : 0; H.spark.visible = sp > 0; H.spark.position.set(land.x + 0.12, 0.12, land.z - 0.05); H.spark.scale.setScalar(0.4 + 2.2 * sp * (1 - sp) * 2); H.spark.material.opacity = sp;
  }, { grade: 'coin', live: 0.3, hideDiary: true, mblur: (O) => (O - t0 < LAND ? 3 : 1) });
}
// ===== TITLE + DAY 1: the bakery =====
const B = S.bakery; const QM = V([0.9, 0, 1.2]), QH = V([-0.7, 0, 2.95]);   // Marcus at the counter, the hero behind him in the queue
function bakeryBase(O, o = {}) { const b = B; [b.hero, b.marcus, b.baker].forEach(P => { resetRig(P); P.root.visible = false; }); b.extras.forEach((P, i) => { resetRig(P); hp(P, O, i ? [6.0, 0, 3.0] : [5.0, 0, 4.4], i ? -2.4 : 0.8, { ...idle(O, i * 2), arms: [[-0.5, 0, 0.13, 1.4], [0, 0, -0.13, 0.15]] }, 'smile', 'x'); });
  b.roll.visible = true; b.roll.position.set(0.9, 1.25, 0.25); b.roll.rotation.set(0, 0, 0); b.price.visible = !!o.price; b.toast.visible = false; b.plate.visible = false; b.splat.visible = false; b.coins.forEach(c => c.visible = false); b.spin.visible = false; b.wallet.visible = false; b.moths.forEach(m => m.visible = false);
  b.marcus.sponge.visible = b.marcus.ticket.visible = false; b.marcus.state(O, o.wet || 0, o.soot || 0);
  [b.win, b.win2].forEach(w => { w.rain.offset.y = O * 0.6; w.rain.offset.x = Math.sin(O * 0.3) * 0.02; });
  hp(b.baker, O, [O < 2.3 ? -0.8 : 0.6, 0, -1.05], 0, { ...idle(O, 1), arms: [[-0.4, 0, 0.15, 1.3], [-0.4, 0, -0.15, 1.3]] }, 'calm', 'baker'); }
// title A: low over the counter; the roll sharp in front; Marcus's hand takes it; the hero's sad face behind
const GRAB = 1.05, BITE = 1.55, TURN = [2.0, 3.1];
function marcusTitle(O) { const m = B.marcus; const reach = eIO(seg(O, 0.35, GRAB)), lift = eIO(seg(O, GRAB, BITE)), low = eIO(seg(O, BITE + 0.35, BITE + 0.8)), turn = eIO(seg(O, TURN[0], TURN[1]));
  const armR = O < GRAB ? [lerp(-0.1, -1.35, reach), 0, -0.1, lerp(0.15, 0.25, reach)] : [lerp(lerp(-1.35, -1.25, lift), -0.35, low), 0, lerp(-0.1, -0.35, lift * (1 - low)), lerp(lerp(0.25, 2.0, lift), 1.3, low)];
  hp(m, O, [QM.x, 0, QM.z], lerp(Math.PI, -0.25, turn), { ...idle(O, 3), spineX: 0.22 * reach * (1 - lift), arms: [[0, 0, 0.13, 0.15], armR] }, O > TURN[1] ? 'smirk' : O > BITE ? 'sniff' : 'calm', 'marcus');
  if (O >= GRAB) { const h = m.arms[1].el; B.roll.position.copy(h.localToWorld(V([0, -0.46, 0.06]))); B.roll.rotation.set(0, lerp(Math.PI, -0.25, turn) + Math.PI / 2, 0.2); } }
function heroQueue(O, expr = 'worried') { hp(B.hero, O, [QH.x, 0, QH.z], Math.PI + 0.25, { ...idle(O, 0), headX: 0.12, arms: [[0.05, 0, 0.13, 0.25], [0.05, 0, -0.13, 0.25]] }, expr, 'vo'); }
shot(0, 2.3, 'bakery', { ease: 'lin', p0: [0.5, 1.42, -1.15], p1: [0.45, 1.44, -0.95], l0: [0.7, 1.5, 2.6], fov: 46, shift: 0.02 }, (lt, O) => { bakeryBase(O); marcusTitle(O); heroQueue(O); }, { grade: 'bakery', dof: 0.12 });
shot(2.3, TL[1].t, 'bakery', { ease: 'lin', p0: [-0.35, 2.15, 5.3], p1: [-0.2, 2.1, 4.9], l0: [0.85, 1.95, 1.2], fov: 36 }, (lt, O) => { bakeryBase(O); marcusTitle(O); heroQueue(O, O > 3.9 ? 'worried' : 'calm'); }, { grade: 'bakery', dof: 0.12 });
// DAY 1: tails. At the window table: the toast slides off, flips, lands butter-down on his white trainer
const T1 = tS(1), TSLIDE = T1 + 2.0, TLAND = T1 + 2.75;
const HS = V([-4.6, 0, 4.7]);   // he stands by the rainy window eating toast off a plate, facing +x
function heroToast(O, expr = 'worried') { const h = B.hero; const look = O > TSLIDE && O < TLAND + 0.6;
  hp(h, O, [HS.x, 0, HS.z], Math.PI / 2, { ...idle(O, 1), headX: look ? 0.5 : 0.1, headY: look ? 0.25 : 0, arms: [[-0.95, 0.15, 0.12, 1.35], [0.05, 0, -0.13, 0.2]] }, expr); return h; }
const plateAt = () => B.hero.arms[0].el.localToWorld(V([0, -0.45, 0.05])).add(V([0, 0.06, 0]));
const shoeAt = () => B.hero.legs[0].knee.localToWorld(V([0, -0.36, 0.14]));
function toastAt(O) { const t = B.toast, p = B.plate; t.visible = p.visible = true; const pl = plateAt(); p.position.copy(pl); p.rotation.set(0, 0, 0.05);
  const on = pl.clone().add(V([0, 0.045, 0])), edge = pl.clone().add(V([0, 0.03, 0.3]));
  if (O < TSLIDE) { t.position.copy(on); t.rotation.set(0, 0.2, 0); return; }
  const s = eIn(seg(O, TSLIDE, TSLIDE + 0.3)); if (O < TSLIDE + 0.3) { t.position.copy(on.clone().lerp(edge, s)); t.rotation.set(0.2 * s, 0.2, 0); return; }
  const u = seg(O, TSLIDE + 0.3, TLAND), shoe = shoeAt().add(V([0, 0.06, 0])); t.position.copy(edge.clone().lerp(shoe, eIn(u))).add(V([0, 0.15 * Math.sin(u * Math.PI), 0.12 * Math.sin(u * Math.PI)])); t.rotation.set(0.2 + Math.PI * u, 0.2, 0.4 * u);
  if (O >= TLAND) { t.position.copy(shoe); t.rotation.set(Math.PI, 0.2, 0.3); B.splat.visible = true; B.splat.position.copy(shoe.clone().add(V([0, -0.035, 0]))); } }
coinInsert(T1, T1 + INS, 'tails');
shot(T1 + INS, TSLIDE + 0.15, 'bakery', { ease: 'lin', p0: [-1.3, 2.0, 6.3], p1: [-1.5, 1.98, 6.1], l0: [-4.6, 1.5, 4.7], fov: 42 }, (lt, O) => { bakeryBase(O); heroToast(O); toastAt(O); }, { grade: 'bakery', dof: 0.12 });
shot(TSLIDE + 0.15, TLAND + 0.25, 'bakery', { ease: 'lin', p0: [-4.4, 1.35, 7.8], p1: [-4.4, 1.3, 7.6], l0: [-4.6, 1.25, 4.7], fov: 66 }, (lt, O) => { bakeryBase(O); heroToast(O, O > TLAND ? 'shock' : 'worried'); toastAt(O); }, { grade: 'bakery', mblur: (O) => (O > TSLIDE + 0.25 && O < TLAND ? 3 : 1), shakeAt: [[TLAND, 0.01]] });
shot(TLAND + 0.25, T1 + 3.75, 'bakery', { ease: 'lin', p0: [-3.85, 0.55, 5.85], p1: [-3.95, 0.5, 5.7], l0: [-4.55, 0.12, 4.85], fov: 40 }, (lt, O) => { bakeryBase(O); heroToast(O, 'shock'); toastAt(O); }, { grade: 'bakery' });
shot(T1 + 3.75, TL[2].t, 'bakery', { ease: 'lin', p0: [-1.75, 2.0, 4.4], p1: [-1.95, 1.98, 4.45], l0: [-4.6, 1.88, 4.7], fov: 40 }, (lt, O) => { bakeryBase(O); heroToast(O, 'worried'); toastAt(O); }, { grade: 'bakery', dof: 0.2 });
// ===== DAY 2: the windy bridge. A fiver tumbles down the bridge past everyone and slaps onto his face =====
const Bw = S.bridge; const T2 = tS(2), SLAP = T2 + 3.05, PEEL = T2 + 3.55;
const HZ = (O) => lerp(-3.2, 0, eOut(seg(O, T2 + 0.75, T2 + 2.9)));
function bridgeBase(O) { const b = Bw; resetRig(b.hero); b.walkers.forEach((P, i) => { resetRig(P); const z = -7 - i * 5.5 - ((O * 1.7 + i * 3) % 4); const x = (i % 2 ? 1.6 : -1.8); hp(P, O, [x, 0, z], Math.PI * (i % 2 ? 0.9 : 1.1), { ...walk(O + i, 11, 1.1), spineX: 0.25, arms: [[-2.2, 0, 0.3, 0.3], [-2.0, 0, -0.3, 0.3]] }, 'shock', 'x'); });
  b.hats.forEach((h, i) => { const u = ((O * 0.5 + i * 0.33) % 1); h.position.set((i - 1) * 1.6 + Math.sin(O * 3 + i) * 0.5, 1.2 + Math.sin(u * Math.PI) * 2.2, -9 - i * 5.5 - u * 9); h.rotation.set(O * 5 + i, O * 3, O * 4); });
  for (let i = 0; i < 60; i++) { const u = ((O * 0.35 + i * 0.137) % 1); b.leaves.set(i, V([((i * 37) % 9) - 4.5 + Math.sin(O * 2 + i) * 0.4, 0.3 + ((i * 13) % 7) * 0.45 + Math.sin(O * 3 + i) * 0.3, -40 + u * 46])); } b.leaves.done(); }
function noteAt(O) { const n = Bw.note, h = Bw.hero; const face = h.head.localToWorld(V([0, 0.33, 0.36]));
  if (O < SLAP) { const u = clamp((O - (T2 + 0.6)) / (SLAP - T2 - 0.6)); const start = V([-2.4, 5.5, -38]); n.position.copy(start.lerp(face, eIn(u) * 0.35 + u * 0.65)).add(V([Math.sin(O * 7) * 0.6 * (1 - u), Math.sin(O * 5) * 0.8 * (1 - u), 0])); n.rotation.set(O * 9 * (1 - u), O * 6 * (1 - u), O * 4 * (1 - u)); return; }
  if (O < PEEL) { n.position.copy(face); n.quaternion.copy(h.head.getWorldQuaternion(new THREE.Quaternion())); return; }
  const k = eIO(seg(O, PEEL, PEEL + 0.4)); const hold = h.arms[0].el.localToWorld(V([0, -0.45, 0.1])).lerp(h.arms[1].el.localToWorld(V([0, -0.45, 0.1])), 0.5).add(V([0, -0.2, 0.12]));
  n.position.copy(face.clone().lerp(hold, k)); n.quaternion.copy(h.spine.getWorldQuaternion(new THREE.Quaternion())); n.rotateX(-0.25 * k); }
function heroBridge(O, o = {}) { const h = Bw.hero; const z = HZ(O); const walking = O < T2 + 2.9; const k = eIO(seg(O, PEEL, PEEL + 0.4));
  const arms = O < SLAP ? [[0.1, 0, 0.35, 1.5], [0.1, 0, -0.35, 1.5]] : O < PEEL ? [[-0.4, 0, 0.6, 1.2], [-0.4, 0, -0.6, 1.2]] : [[lerp(-2.3, -0.85, k), 0, 0.22, lerp(2.0, 1.15, k)], [lerp(-2.3, -0.85, k), 0, -0.22, lerp(2.0, 1.15, k)]];
  hp(h, O, [0.3, 0, z], 0, walking ? { ...walk(O, 8.5, 0.9), arms: [[0.1, 0, 0.35, 1.5], [0.1, 0, -0.35, 1.5]] } : { ...idle(O, 0), spineX: O < PEEL ? -0.12 : 0.02, headX: O > PEEL ? 0.12 : -0.1, arms }, o.expr || (O < SLAP ? 'worried' : 'shock')); }
coinInsert(T2, T2 + INS, 'heads');
shot(T2 + INS, SLAP, 'bridge', { ease: 'lin', p0: [0.95, 1.95, 11.5], p1: [0.9, 1.95, 10.6], l0: [0.15, 2.0, -12], fov: 19 }, (lt, O) => { bridgeBase(O); heroBridge(O); noteAt(O); }, { grade: 'bridge', mblur: 2 });
shot(SLAP, T2 + 3.95, 'bridge', { ease: 'out', p0: [0.75, 2.2, 3.4], p1: [0.6, 2.15, 2.9], l0: [0.3, 2.05, 0], fov: 38 }, (lt, O) => { bridgeBase(O); heroBridge(O); noteAt(O); }, { grade: 'bridge', shakeAt: [[SLAP, 0.03]] });
shot(T2 + 3.95, TL[3].t, 'bridge', { ease: 'lin', p0: [0.7, 2.15, 3.7], p1: [0.6, 2.1, 3.25], l0: [0.3, 1.9, 0], fov: 40 }, (lt, O) => { bridgeBase(O); heroBridge(O, { expr: O > T2 + 5.0 ? 'smile' : 'shock' }); noteAt(O); }, { grade: 'bridge', dof: 0.15 });
// ===== DAY 3: rush hour. Every pedestrian light turns green as he walks up; the cars stack up honking =====
const J = S.junction; const T3 = tS(3);
const JZ = (O) => lerp(2.5, -9.0, seg(O, T3 + 0.75, T3 + 7.0));
function junctionBase(O) { const j = J; resetRig(j.hero); resetRig(j.driver);
  j.signals.forEach((pair, k) => { const on = O > T3 + 1.0 + k * 0.38; pair.forEach(s => s.setGreen(on)); });
  j.cars.forEach((c, i) => { c.position.y = 0.012 * Math.sin(O * 9 + i); });
  j.peds.forEach((P, i) => { resetRig(P); const x = i === 0 ? -3.4 : 3.5 + i * 0.4, z = -12 - i * 7 + ((O * 1.4 + i * 2) % 3); hp(P, O, [x, 0.18, z], i === 0 ? 0.1 : Math.PI, walk(O + i, 8.5, 0.9), 'calm', 'x'); });
  const dk = eOut(seg(O, T3 + 2.9, T3 + 3.3)); hp(j.driver, O, [5.6, 0.62 + 0.35 * dk, -5.85], -Math.PI / 2 - 0.25, { ...idle(O, 2), spineX: -0.05, arms: [[-2.5 + 0.25 * Math.sin(O * 14), 0, 0.5, 1.6], [-0.4, 0, -0.5, 0.6]] }, 'grit', 'driver'); }
function heroStroll(O) { hp(J.hero, O, [0.15, 0.16, JZ(O)], Math.PI, { ...walk(O, 6.5, 0.7), arms: [[0.15, 0, 0.42, 1.65], [0.15, 0, -0.42, 1.65]], headY: 0.15 * Math.sin(O * 0.8) }, 'smirk'); }
coinInsert(T3, T3 + INS, 'heads');
shot(T3 + INS, T3 + 3.0, 'junction', { ease: 'lin', p0: [3.2, 8.8, 11.5], p1: [2.8, 8.2, 9.0], l0: [0, 0, -20], fov: 46 }, (lt, O) => { junctionBase(O); heroStroll(O); }, { grade: 'street' });
shot(T3 + 3.0, T3 + 4.6, 'junction', { ease: 'lin', p0: [1.2, 1.75, -1.2], p1: [1.5, 1.8, -1.6], l0: [5.4, 2.4, -5.85], fov: 42 }, (lt, O) => { junctionBase(O); heroStroll(O); }, { grade: 'street', dof: 0.12 });
shot(T3 + 4.6, TL[5].t, 'junction', { ease: 'lin', pf: (O) => V([-0.5, 1.8, JZ(O) - 4.4]), lf: (O) => V([0.15, 1.8, JZ(O)]), fov: 44 }, (lt, O) => { junctionBase(O); heroStroll(O); }, { grade: 'street', dof: 0.12 });
// ===== DAY 5: the claw machine. One coin; the claw lifts the whole pile; the teddies bury him; the kid is outraged =====
const A = S.arcade; const T5 = tS(5), DOWN = [T5 + 0.95, T5 + 1.85], GRIP = T5 + 2.1, UP = [T5 + 2.6, T5 + 3.3], POP = T5 + 3.35;
const HA = V([0.3, 0, 1.95]);
const mound = (() => { const r = rnd(5); return A.bears.map((b, i) => { const layer = Math.floor(i / 12), a = i * 2.39 + layer, rad = 0.75 - layer * 0.12 + r() * 0.2; return V([HA.x + Math.cos(a) * rad, 0.25 + layer * 0.36 + r() * 0.1, HA.z + Math.sin(a) * rad * 0.9]); }); })();
function arcadeBase(O, o = {}) { const a = A; resetRig(a.hero); resetRig(a.kid); resetRig(a.mum); const cm = a.cm; const sh = O > UP[0] && O < POP + 0.4 ? 0.03 * Math.sin(O * 70) : 0; cm.position.set(sh, 0, 0); cm.rotation.z = sh * 0.5;
  const cy = O < DOWN[0] ? 2.45 : O < DOWN[1] ? lerp(2.45, 1.45, eIO(seg(O, DOWN[0], DOWN[1]))) : O < UP[0] ? 1.45 : lerp(1.45, 2.3, eIO(seg(O, UP[0], UP[1]))); cm.claw.position.y = cy;
  const close = eOut(seg(O, DOWN[1], GRIP)); cm.claw.prongs.forEach(p => p.rotation.z = lerp(0.45, -0.1, close));
  cm.door.rotation.y = -1.7 * elastic(seg(O, POP, POP + 0.6));
  const rr2 = rnd(77); a.bears.forEach((b, i) => { const p0 = a.pile[i]; const clump = V([(rr2() - 0.5) * 0.55, -0.25 - (i % 8) * 0.07, (rr2() - 0.5) * 0.55]);
    const tStart = POP + 0.05 + i * 0.045, fly = seg(O, tStart, tStart + 0.65);
    if (O < UP[0]) { b.position.copy(p0); b.rotation.set(0, i, 0); }
    else if (O < tStart) { const k = eIO(seg(O, UP[0], UP[0] + 0.3)); b.position.copy(p0.clone().lerp(V([0, cy, 0]).add(clump), k)); b.rotation.set(0.3 * k, i, 0.2 * k); }
    else { const from = V([0, cy, 0]).add(clump), to = mound[i]; b.position.copy(from.clone().lerp(to, eOut(fly))).add(V([0, 1.2 * Math.sin(fly * Math.PI), 0])); b.rotation.set(fly * 6 + i, i + fly * 3, fly * 4); if (fly >= 1) b.rotation.set(0.2 * Math.sin(i), i, 0.2 * Math.cos(i)); } });
  const buried = seg(O, POP + 0.3, POP + 2.4);
  hp(a.hero, O, [HA.x, 0, HA.z], lerp(Math.PI, Math.PI * 2 - 0.6, eIO(seg(O, POP + 0.05, POP + 0.5))), O < POP ? { ...idle(O, 0), headX: -0.15, arms: [[-0.5, 0, 0.2, 1.2], [-0.5, 0, -0.2, 1.2]] } : { ...idle(O, 0), spineX: -0.1 - 0.1 * Math.sin(O * 9), headX: -0.15, arms: [[-2.4 + 0.3 * buried, 0, 0.6, 0.5], [-2.4 + 0.3 * buried, 0, -0.6, 0.5]] }, O < POP ? 'calm' : 'laugh');
  const kidPoint = O > T5 + 7.8; hp(a.kid, O, [1.95, 0, 2.75], -Math.PI / 2 - 0.5, { ...idle(O, 4), arms: [[0, 0, 0.13, 0.15], kidPoint ? [-1.5, 0.2, -0.2, 0.1] : [0, 0, -0.13, 0.15]], bob: kidPoint ? Math.abs(Math.sin(O * 8)) * 0.05 : 0 }, kidPoint ? 'grit' : (O > POP ? 'shock' : 'calm'), 'kid');
  hp(a.mum, O, [3.4, 0, 3.6], -2.4, idle(O, 5), O > POP ? 'shock' : 'calm', 'x'); }
coinInsert(T5, T5 + INS, 'heads');
shot(T5 + INS, T5 + 2.45, 'arcade', { ease: 'lin', p0: [0.5, 1.78, 0.55], p1: [0.45, 1.72, 0.48], l0: [0, 2.7, 0], fov: 64, shift: 0 }, (lt, O) => { arcadeBase(O); }, { grade: 'arcade' });
shot(T5 + 2.45, POP + 0.2, 'arcade', { ease: 'lin', p0: [3.4, 2.1, 2.6], p1: [3.1, 2.05, 2.3], l0: [0, 1.75, 0.2], fov: 44 }, (lt, O) => { arcadeBase(O); }, { grade: 'arcade', shakeAt: [[UP[0], 0.01], [POP, 0.025]] });
shot(POP + 0.2, T5 + 7.85, 'arcade', { ease: 'lin', p0: [-2.9, 2.3, 6.2], p1: [-2.4, 2.15, 5.4], l0: [0.4, 1.35, 1.6], fov: 48 }, (lt, O) => { arcadeBase(O); }, { grade: 'arcade', mblur: (O) => (O < POP + 2.2 ? 2 : 1) });
shot(T5 + 7.85, TL[7].t, 'arcade', { ease: 'lin', p0: [-1.5, 2.15, 5.7], p1: [-1.35, 2.1, 5.3], l0: [0.9, 1.95, 2.2], fov: 46 }, (lt, O) => { arcadeBase(O); }, { grade: 'arcade', dof: 0.12 });
// ===== DAY 7: Marcus's driveway. A bus hits the puddle; the wave bends around the hero and lands on Marcus =====
const Dv = S.drive; const T7 = tS(7), SPLASH = T7 + 1.55, HIT = T7 + 2.55;
const HD = V([-0.6, 0.18, 2.0]), MD = V([2.2, 0, -1.3]);
function driveBase(O, o = {}) { const d = Dv; resetRig(d.hero); resetRig(d.marcus); d.marcus.sponge.visible = d.marcus.ticket.visible = false;
  d.bus.visible = false; d.sheet.visible = false; d.spray.m.visible = false; d.met.visible = false; d.smoke.forEach(s => s.visible = false); d.flash.intensity = 0; d.debris.forEach(D => D.m.visible = false);
  d.car.scale.set(1, 1, 1); d.car.position.set(4, 0, -2.6); d.car.rotation.set(0, 0, 0); d.crowd.upd(O, { count: o.crowd ? 160 : 0 }); }
const dropRand = (() => { const r = rnd(17); return [...Array(420)].map(() => [r(), r(), r(), r()]); })();
function sprayAt(O) { const d = Dv; if (O < SPLASH - 0.05 || O > HIT + 0.9) return; d.spray.m.visible = true; const pud = V([-0.6, 0.1, 4.0]); const dir = MD.clone().sub(pud).setY(0).normalize(), perp = V([-dir.z, 0, dir.x]);
  for (let i = 0; i < 420; i++) { const [a, b, c, e] = dropRand[i]; const t0 = SPLASH + a * 0.25, u = (O - t0) / 1.0; let p, s = 1;
    if (u < 0) { d.spray.set(i, V([0, -10, 0]), 0.001); continue; }
    const side = i % 2 ? 1 : -1; const P0 = pud.clone().add(V([(b - 0.5) * 2.2, 0, (c - 0.5) * 0.9])); const P1 = HD.clone().add(V([0, 2.9 + e * 1.3, 0])).addScaledVector(perp, side * (0.85 + b * 0.7)); const P2 = V([MD.x + (b - 0.5) * 0.6, 1.5 + c * 0.8, MD.z + (e - 0.5) * 0.6]);
    if (u <= 1) { const k = u; p = P0.clone().multiplyScalar((1 - k) * (1 - k)).add(P1.clone().multiplyScalar(2 * k * (1 - k))).add(P2.clone().multiplyScalar(k * k)); s = 0.6 + 0.8 * Math.sin(k * Math.PI) + c * 0.4; }
    else { const f = u - 1; p = P2.clone().add(V([(b - 0.5) * 1.6 * f, -6 * f * f - 1.5 * f, (c - 0.5) * 1.6 * f])); s = Math.max(0.001, 1 - f * 2.2); if (p.y < 0.05) s = 0.001; }
    d.spray.set(i, p, s); } d.spray.done(); }
function busAt(O) { const k = seg(O, SPLASH - 1.0, SPLASH + 1.1); if (k <= 0 || k >= 1) return; Dv.bus.visible = true; Dv.bus.position.set(lerp(-16, 16, k), 0, 4.9); }
function marcusWash(O, o = {}) { const m = Dv.marcus; const wet = seg(O, HIT, HIT + 0.3); const hit = O > HIT; const turn = eIO(seg(O, T7 + 3.0, T7 + 3.5));
  m.sponge.visible = true; const circ = hit ? 0 : 1; const pose = hit ? { ...idle(O, 2), spineX: -0.15, arms: [[-0.5, 0, 0.9, 1.0], [-0.5, 0, -0.9, 1.0]], headX: 0.1 } : { ...idle(O, 2), spineX: 0.25, arms: [[0, 0, 0.13, 0.15], [-1.25 + 0.2 * Math.sin(O * 6) * circ, 0.3 * Math.cos(O * 6) * circ, -0.15, 0.5]] };
  const back = hit ? eOut(seg(O, HIT, HIT + 0.35)) * 0.35 : 0; hp(m, O, [MD.x - back, 0, MD.z + back * 0.4], lerp(Math.PI / 2, -0.7, turn), pose, hit ? (O > T7 + 3.6 ? 'worried' : 'shock') : 'smirk', 'marcus'); m.state(O, wet); }
function heroPass(O) { const h = Dv.hero; const x = O < T7 + 1.35 ? lerp(-3.6, HD.x, seg(O, T7 + 0.75, T7 + 1.35)) : O < T7 + 4.4 ? HD.x : lerp(HD.x, 3.4, seg(O, T7 + 4.4, T7 + 6.4)); const walking = O < T7 + 1.35 || O > T7 + 4.4;
  const look = O > SPLASH && O < HIT + 0.4; hp(h, O, [x, 0.18, HD.z], O < T7 + 3.0 || walking ? Math.PI / 2 : Math.PI / 2 - 0.9, walking ? { ...walk(O, 8, 0.9), arms: [[0.15, 0, 0.42, 1.65], [0.15, 0, -0.42, 1.65]] } : { ...idle(O, 0), headX: look ? -0.5 : 0, arms: [[0.15, 0, 0.42, 1.65], [0.15, 0, -0.42, 1.65]] }, look ? 'shock' : 'smirk'); }
coinInsert(T7, T7 + INS, 'heads');
shot(T7 + INS, T7 + 1.45, 'drive', { ease: 'lin', p0: [-2.4, 4.6, 10.8], p1: [-2.0, 4.4, 10.2], l0: [0.6, 1.3, 0.3], fov: 40 }, (lt, O) => { driveBase(O); heroPass(O); marcusWash(O); busAt(O); }, { grade: 'sunny' });
shot(T7 + 1.45, T7 + 3.05, 'drive', { ease: 'lin', p0: [-1.2, 7.6, 13.8], p1: [-1.0, 7.3, 13.2], l0: [0.9, 1.6, 0.4], fov: 40 }, (lt, O) => { driveBase(O); heroPass(O); marcusWash(O); busAt(O); sprayAt(O); }, { grade: 'sunny', mblur: 2, shakeAt: [[HIT, 0.015]] });
shot(T7 + 3.05, TL[9].t, 'drive', { ease: 'lin', p0: [-0.1, 1.95, 1.3], p1: [0.15, 1.95, 1.0], l0: [2.0, 2.0, -1.2], fov: 42 }, (lt, O) => { driveBase(O); heroPass(O); marcusWash(O); sprayAt(O); }, { grade: 'sunny', dof: 0.15 });
// ===== DAY 9: the racecourse (TV racing style). The favourite stops for a sandwich; the field piles up; NO CHANCE wins =====
const R = S.races; const T9 = tS(9), RACE0 = T9 + 3.85, STOPT = T9 + 5.05, STOPX = 46, PILE = T9 + 5.55;
const FAV = (O) => lerp(80, STOPX, eOut(seg(O, RACE0, STOPT)));
const LANE = [3.4, 1.6, -0.2, -2.0, 0.8];
function horseX(i, O) { if (i === 0) return FAV(O); const free = 80 + 2.5 + i * 2.6 - 24 * (O - RACE0); return Math.max(free, STOPX + 1.5 + i * 0.6); }
function racesBase(O, o = {}) { const r = R; [r.hero, r.marcus, r.fan, ...r.copiers].forEach(resetRig); r.marcus.ticket.visible = O < T9 + 7.8; r.halves.forEach(h => h.visible = false); r.dust.forEach(s => s.visible = false); r.crowd.upd(O, { cheer: O > T9 + 7.6, jump: O > T9 + 7.6 });
  r.horses.forEach((h, i) => { h.visible = !o.noHorses; const x = horseX(i, O); h.position.set(x, 0, LANE[i]); h.rotation.set(0, -Math.PI / 2, 0);
    if (i === 0) { if (O < STOPT) h.gallop(O * 15, 1); else { h.stand(O); h.neck.rotation.x = 0.55 + 0.08 * Math.sin(O * 10); h.position.z = LANE[0] + 0.6 * eOut(seg(O, STOPT, STOPT + 0.4)); } }
    else { const crash = seg(O, PILE + (i - 1) * 0.12, PILE + (i - 1) * 0.12 + 0.7); if (crash > 0) { h.gallop(O * 15, 1 - crash); h.rotation.set(0, -Math.PI / 2, (i % 2 ? 1 : -1) * 1.5 * eOut(crash)); h.position.y = Math.sin(crash * Math.PI) * 1.2; h.position.x -= 2.5 * crash; } else h.gallop(O * 15 + i, 1); } });
  r.pony.visible = !o.noHorses; r.pony.position.set(o.ponyX ?? 200, 0, 2.8); r.pony.gallop(O * 11, 0.8);
  hp(r.fan, O, [STOPX - 1.2, 0, 6.0], Math.PI, { ...idle(O, 3), arms: [[0, 0, 0.13, 0.15], [-1.4, 0, -0.1, 0.2]] }, O > STOPT ? 'shock' : 'smile', 'x'); r.sandwich.position.copy(r.fan.arms[1].el.localToWorld(V([0, -0.5, 0.1]))); r.sandwich.visible = O < STOPT + 0.9;
  for (let k = 0; k < 20; k++) { const s = r.dust[k], f = seg(O, PILE + k * 0.03, PILE + 1.4 + k * 0.03); if (f <= 0 || f >= 1) continue; s.visible = true; s.position.set(STOPX + 2 + Math.sin(k * 2.3) * 2.5 * f, 0.4 + f * 1.6, LANE[1] + Math.cos(k * 1.7) * 2.2); s.scale.setScalar(1 + f * 3); s.material.opacity = 0.7 * (1 - f); } }
function spectators(O) { const r = R; const win = O > T9 + 7.6; const jump = (ph) => win ? Math.abs(Math.sin(O * 8 + ph)) * 0.18 : 0;
  const slipArm = (ph, up) => up ? [-2.6 + 0.2 * Math.sin(O * 10 + ph), 0, -0.3, 0.3] : [-0.9, 0, -0.15, 0.9];
  hp(r.hero, O, [0, jump(0), 6.3], Math.PI, { ...idle(O, 0), arms: [win ? [-2.6, 0, 0.3, 0.3] : [0, 0, 0.13, 0.15], slipArm(0, win)] }, win ? 'laugh' : 'calm');
  const copy = O > T9 + 2.9; [[-0.9, 7.5], [0.55, 8.0], [-2.0, 8.0]].forEach(([x, z], i) => { const P = r.copiers[i]; hp(P, O, [x, jump(i + 1), z], Math.PI + (i === 2 ? -0.25 : 0.25) * (O < T9 + 3.8 ? 1 : 0), { ...idle(O, i + 2), arms: [[0, 0, 0.13, 0.15], slipArm(i, copy && (win || O < T9 + 3.9))] }, win ? 'laugh' : i === 0 && O > T9 + 1.1 ? 'smile' : 'calm', i === 0 ? 'racegoer' : 'x'); });
  const tear = O > T9 + 7.8; hp(r.marcus, O, [1.45, 0, 6.35], Math.PI - 0.2, { ...idle(O, 5), arms: [tear ? [-1.0, 0, 0.5, 1.3] : [0, 0, 0.13, 0.15], tear ? [-1.0, 0, -0.5, 1.3] : [-2.5 + 0.3 * Math.sin(O * 6), 0, -0.4, 0.3]] }, tear ? 'grit' : 'smirk', 'marcus');
  if (tear) { const k = seg(O, T9 + 7.8, T9 + 8.8); R.halves.forEach((h, i) => { h.visible = true; const hand = r.marcus.arms[i].el.localToWorld(V([0, -0.5, 0.1])); h.position.copy(hand).add(V([(i ? 1 : -1) * 0.5 * k, -1.2 * k * k, 0.4 * k])); h.rotation.set(k * 6, k * 4 * (i ? 1 : -1), 0); }); } }
coinInsert(T9, T9 + INS, 'heads');
shot(T9 + INS, RACE0, 'races', { ease: 'lin', p0: [0.45, 2.15, 1.3], p1: [0.35, 2.15, 1.7], l0: [0.1, 1.95, 7.0], fov: 52 }, (lt, O) => { racesBase(O, { noHorses: true }); spectators(O); }, { grade: 'races', dof: 0.12 });
shot(RACE0, T9 + 5.25, 'races', { ease: 'lin', pf: (O) => V([FAV(O) + 5, 2.4, -13]), lf: (O) => V([FAV(O) + 1, 1.6, 2.2]), fov: 26 }, (lt, O) => { racesBase(O, { ponyX: 120 - 18 * (O - RACE0) }); spectators(O); }, { grade: 'races', race: 1, mblur: 2 });
shot(T9 + 5.25, T9 + 6.65, 'races', { ease: 'lin', p0: [STOPX - 8, 2.0, -2.5], p1: [STOPX - 7.5, 2.1, -2.2], l0: [STOPX + 2, 1.6, 2.6], fov: 44 }, (lt, O) => { racesBase(O, { ponyX: lerp(STOPX + 16, STOPX - 4, seg(O, T9 + 5.7, T9 + 6.65)) }); spectators(O); }, { grade: 'races', race: 1, shakeAt: [[PILE + 0.2, 0.02]] });
shot(T9 + 6.65, T9 + 7.6, 'races', { ease: 'lin', p0: [-9.5, 1.0, 1.2], p1: [-9.3, 1.0, 1.4], l0: [-5.3, 1.0, 2.8], fov: 38 }, (lt, O) => { racesBase(O, { noHorses: false, ponyX: lerp(0.0, -7.9, seg(O, T9 + 6.65, T9 + 7.6)) }); R.horses.forEach(h => h.visible = false); spectators(O); }, { grade: 'races', race: 2 });
shot(T9 + 7.6, TL[13].t, 'races', { ease: 'lin', p0: [0.7, 2.15, 0.9], p1: [0.5, 2.1, 1.3], l0: [0.0, 1.9, 7.0], fov: 54 }, (lt, O) => { racesBase(O, { noHorses: true }); spectators(O); }, { grade: 'races' });
// ===== DAY 13: the pause. The coin lands on its edge and stays there. The launderette at night =====
const L = S.laundrette; const T13 = tS(13), EDGE_END = T13 + 2.7;
coinInsert(T13, EDGE_END, 'edge', { p1: [1.1, 0.95, 2.2], l: [0.05, 0.25, 0.1], ease: 'lin' });
function laundretteBase(O) { const l = L; resetRig(l.hero); l.drums.forEach((d, i) => { d.material.map.rotation = O * (2 + i * 0.3); }); l.tubes[1].intensity = 5 * (Math.sin(O * 31) > 0.97 ? 0.6 : 1);
  const h = l.hero; hp(h, O, [0, 0, 0.62], 0, { ...idle(O, 0), ...TSIT, spineX: 0.08, headX: 0.32, arms: [[-0.95, 0.75, -0.1, 1.05], [0.05, 0, -0.18, 0.3]] }, 'shock'); h.root.position.y = 0;
  const hand = h.arms[0].el.localToWorld(V([0, -0.44, 0])); l.coin.position.copy(hand).add(V([0, 0.17, 0])); l.coin.rotation.set(Math.PI / 2, 0.3, 0.02 * Math.sin(O * 2)); }
shot(EDGE_END, TL[20].t, 'laundrette', { ease: 'lin', p0: [0.25, 1.75, 5.6], p1: [0.12, 1.8, 3.7], l0: [0, 1.55, 0.6], fov: 40 }, (lt, O) => { laundretteBase(O); }, { grade: 'night', dof: (O) => 0.1 + 0.15 * seg(O, EDGE_END, EDGE_END + 3) });
// ===== DAY 20: the casino. Royal flush after royal flush; the crowd copies; the pit boss begs him to leave =====
const C = S.casino; const T20 = tS(20), HAND0 = T20 + 0.85, HANDL = 0.55, BOSS = [T20 + 4.0, T20 + 4.9];
function casinoBase(O) { const c = C; [c.hero, c.dealer, c.boss, ...c.near].forEach(resetRig); const hands = clamp(Math.floor((O - HAND0) / HANDL) + 1, 0, 5);
  c.cards.forEach((cd, i) => { const k = Math.min(4, Math.max(0, Math.floor((O - HAND0) / HANDL))), t0 = HAND0 + k * HANDL + i * 0.03; const inn = eOut(seg(O, t0, t0 + 0.18)), flip = eIO(seg(O, t0 + 0.2, t0 + 0.34)), out = k < 4 ? eIn(seg(O, t0 + 0.44, t0 + 0.54)) : 0;
    cd.visible = O > HAND0; const tx = -0.7 + i * 0.35; cd.position.set(lerp(0, tx, inn) + out * 1.2, 0.885 + 0.08 * Math.sin(flip * Math.PI), lerp(-0.9, 0.6, inn) - out * 0.8); cd.rotation.set(0, 0.05 * (i - 2), Math.PI * (1 - flip)); });
  const grow = clamp((O - HAND0) / (HANDL * 5)); c.stacks.forEach((s, i) => { const side = i % 2 ? 1 : -1, row = Math.floor(i / 2); s.position.set(side * (0.75 + (row % 3) * 0.28), 0.87, 0.3 + Math.floor(row / 3) * 0.3); s.scale.set(1, 0.15 + 1.15 * grow * (0.7 + 0.3 * Math.sin(i)), 1);
    if (O > BOSS[1]) { const p = eIO(seg(O, BOSS[1], BOSS[1] + 1.2)); s.position.z += 0.5 * p; s.position.x *= 1 - 0.3 * p; } });
  c.crowd.upd(O, { cheer: O > HAND0 + 0.6, jump: O > T20 + 3.5 && O < BOSS[0] });
  hp(c.hero, O, [0, 0, 1.6], Math.PI, { ...idle(O, 0), ...TSIT, spineX: 0.12, headY: O > BOSS[0] + 0.3 ? -0.55 : 0, arms: [[-1.0, 0, 0.25, 0.9], [-1.0, 0, -0.25, 0.9]] }, O > BOSS[0] + 0.3 ? 'worried' : 'calm');
  hp(c.dealer, O, [0, 0, -1.55], 0, { ...idle(O, 1), arms: [[-0.9, 0, 0.2, 0.9 + 0.3 * Math.sin(O * 9)], [-0.9, 0, -0.2, 1.0]] }, O > HAND0 + 1.5 ? 'shock' : 'calm', 'x');
  c.near.forEach((P, i) => hp(P, O, [i ? 2.3 : -1.4, 0, i ? 2.4 : 3.0], Math.PI + (i ? 0.3 : -0.3), { ...idle(O, i + 3), arms: [[0, 0, 0.13, 0.15], [-2.4 + 0.3 * Math.sin(O * 9 + i), 0, -0.4, 0.4]] }, O > HAND0 + 0.6 ? 'laugh' : 'calm', 'x'));
  const bw = eOut(seg(O, BOSS[0], BOSS[1])); const push = O > BOSS[1]; hp(c.boss, O, [lerp(-4.2, -1.45, bw), 0, lerp(1.6, 0.85, bw)], lerp(Math.PI / 2, 0.85, bw), bw < 1 ? walk(O, 8, 0.9) : { ...idle(O, 4), spineX: 0.3, arms: [[-1.0, 0, 0.3, 0.6], [-1.0, 0, -0.3, 0.6]] }, 'worried', 'pit boss');
  c.boss.sweat.forEach((s, i) => { s.position.y = 0.6 - ((O * 0.5 + i * 0.33) % 1) * 0.35; s.visible = bw > 0.5; }); }
coinInsert(T20, T20 + INS, 'heads');
shot(T20 + INS, T20 + 3.6, 'casino', { ease: 'lin', p0: [0.1, 3.55, 1.05], p1: [0.05, 3.3, 0.95], l0: [0, 0.86, 0.5], fov: 40, shift: 0 }, (lt, O) => { casinoBase(O); }, { grade: 'casino' });
shot(T20 + 3.6, T20 + 4.35, 'casino', { ease: 'lin', p0: [1.5, 4.6, -3.2], p1: [1.35, 4.5, -2.85], l0: [0, 1.3, 2.4], fov: 46 }, (lt, O) => { casinoBase(O); }, { grade: 'casino', dof: 0.12 });
shot(T20 + 4.35, TL[23].t, 'casino', { ease: 'lin', p0: [1.7, 2.25, 4.0], p1: [1.5, 2.2, 3.7], l0: [-1.35, 1.95, 0.85], fov: 40 }, (lt, O) => { casinoBase(O); }, { grade: 'casino', dof: 0.12 });
// ===== DAY 23: the meteorite. It misses him by a metre and flattens Marcus's car =====
const T23 = tS(23), IMPACT = T23 + 2.2, MSKY = V([-26, 46, -34]), MCAR = V([4, 0.9, -2.6]);
const HP23 = (O) => V([lerp(-3.0, 0.55, eOut(seg(O, T23 + 0.75, T23 + 2.0))), 0.18, 1.75]);
function meteorScene(O) { const d = Dv; driveBase(O, { crowd: true }); d.crowd.upd(O, { count: 160, cheer: O > IMPACT + 0.4 });
  const fall = seg(O, T23 + 1.15, IMPACT); if (fall > 0 && O < IMPACT) { d.met.visible = true; const p = MSKY.clone().lerp(MCAR, eIn(fall) * 0.4 + fall * 0.6); d.met.position.copy(p); d.met.lookAt(MCAR); const back = MSKY.clone().sub(MCAR).normalize(); d.met.trail.forEach((s, i) => { s.position.copy(back.clone().multiplyScalar(-0.0)); s.position.set(0, 0, -0.9 * i); }); d.met.light.intensity = 30 * fall; }
  if (O >= IMPACT) { const k = eOut(seg(O, IMPACT, IMPACT + 0.12)); d.car.scale.set(1 + 0.18 * k, 1 - 0.7 * k, 1 + 0.1 * k); d.met.visible = true; d.met.position.set(4, 0.75 - 0.2 * k, -2.6); d.met.trail.forEach(s => s.position.set(0, 0, 9999)); d.met.light.intensity = 6 + 4 * Math.sin(O * 9);
    d.flash.intensity = 80 * Math.max(0, 1 - (O - IMPACT) / 0.35); burst(d.debris, O, IMPACT, MCAR, 4.5, 4.0);
    d.smoke.forEach((s, i) => { const f = seg(O, IMPACT + i * 0.05, IMPACT + 3.5 + i * 0.05); s.visible = f > 0 && f < 1; s.position.set(4 + Math.sin(i * 2.1) * (0.6 + 1.6 * f), 0.8 + f * 3.2 + (i % 4) * 0.3, -2.6 + Math.cos(i * 1.3) * (0.6 + 1.2 * f)); s.scale.setScalar(1.2 + 2.8 * f); s.material.opacity = 0.75 * (1 - f); }); }
  const m = d.marcus; const hit = O > IMPACT; m.sponge.visible = true; const turn = eIO(seg(O, IMPACT + 0.9, IMPACT + 1.6));
  hp(m, O, [1.95, 0.04, 0.25], hit ? lerp(Math.PI / 2, -0.35, turn) : Math.PI / 2, hit ? { ...idle(O, 2), spineX: 0.1, headX: 0.18, arms: [[0.05, 0, 0.13, 0.15], [-0.45, 0, -0.2, 0.8]] } : { ...idle(O, 2), spineX: 0.25, arms: [[0, 0, 0.13, 0.15], [-1.25 + 0.2 * Math.sin(O * 6), 0.3 * Math.cos(O * 6), -0.15, 0.5]] }, hit ? (O > IMPACT + 1.0 ? 'worried' : 'shock') : 'smile', 'marcus'); m.state(O, 0, hit ? 0.5 : 0);
  const pat = O > T23 + 5.4; const hpos = O < T23 + 5.0 ? HP23(O) : HP23(O).lerp(V([0.82, 0.12, 0.55]), eIO(seg(O, T23 + 5.0, T23 + 5.5)));
  hp(d.hero, O, [hpos.x, hpos.y, hpos.z], O < T23 + 2.0 ? Math.PI / 2 : lerp(0.9, 0.25, eIO(seg(O, T23 + 5.0, T23 + 5.5))), O < T23 + 2.0 ? { ...walk(O, 8, 0.9), arms: [[0.15, 0, 0.42, 1.65], [0.15, 0, -0.42, 1.65]] } : { ...idle(O, 0), arms: [[0.15, 0, 0.42, 1.65], pat ? [-0.25, 0, -0.75, 0.5 + 0.1 * Math.sin(O * 10)] : [0.15, 0, -0.42, 1.65]] }, O > IMPACT && O < IMPACT + 0.8 ? 'calm' : 'calm'); }
coinInsert(T23, T23 + INS, 'heads');
shot(T23 + INS, T23 + 1.5, 'drive', { ease: 'lin', pf: (O) => HP23(O).add(V([4.2, 1.6, 4.6])), lf: (O) => HP23(O).add(V([-1.6, 1.5, 0.3])), fov: 46 }, (lt, O) => { meteorScene(O); }, { grade: 'sunny' });
shot(T23 + 1.5, IMPACT - 0.05, 'drive', { ease: 'lin', p0: [8.2, 1.4, 7.2], p1: [7.8, 1.45, 6.8], l0: [3.2, 3.0, -2.4], fov: 52 }, (lt, O) => { meteorScene(O); }, { grade: 'sunny', mblur: (O) => (O > T23 + 1.15 ? 3 : 1) });
shot(IMPACT - 0.05, T23 + 3.4, 'drive', { ease: 'out', p0: [7.6, 1.5, 6.6], p1: [6.7, 1.5, 5.4], l0: [3.4, 1.3, -2.4], fov: 46, z0: 1, z1: 1.2, roll0: 0, roll1: -4 }, (lt, O) => { meteorScene(O); }, { grade: 'sunny', shakeAt: [[IMPACT, 0.05]] });
shot(T23 + 3.4, T23 + 5.1, 'drive', { ease: 'lin', p0: [1.5, 2.0, 3.2], p1: [1.45, 2.0, 2.9], l0: [1.95, 2.0, 0.25], fov: 40 }, (lt, O) => { meteorScene(O); }, { grade: 'sunny', dof: 0.15 });
shot(T23 + 5.1, TL[26].t, 'drive', { ease: 'lin', p0: [0.7, 2.35, 6.4], p1: [0.8, 2.3, 5.9], l0: [1.4, 1.7, 0.3], fov: 42 }, (lt, O) => { meteorScene(O); }, { grade: 'sunny', dof: 0.1 });
// ===== DAY 26: the lottery. Same numbers as the whole country; every ball matches; 31 million winners; 64p =====
const PB = S.pub; const T26 = tS(26), BALL0 = T26 + 5.6, BALLD = 0.42, CHOIR = T26 + 5.6;
const TKT = (n) => { const i = LOTTO.indexOf(n), c = (n - 1) % 10, r = Math.floor((n - 1) / 10); return V([((34 + c * 49) / 512 - 0.5) * 1.6, 0.06, ((92 + r * 40) / 320 - 0.5) * 1.0]); };
coinInsert(T26, T26 + INS, 'heads');
shot(T26 + INS, T26 + 2.0, 'ticket', { ease: 'lin', p0: [0.1, 1.45, 0.75], p1: [0.05, 1.3, 0.6], l0: [0, 0, 0.05], fov: 44, shift: 0 }, (lt, O) => { const k = seg(O, T26 + 0.85, T26 + 1.95); drawTicket(k); const i = Math.min(5, Math.floor(k * 6)), f = (k * 6) % 1; const a = TKT(LOTTO[i]), b = TKT(LOTTO[Math.min(5, i + 1)]);
  S.ticket.pen.position.copy(a.clone().lerp(b, eIO(clamp(f * 1.6 - 0.6))).add(V([0.04 * Math.sin(O * 40), 0.05 * Math.abs(Math.sin(f * Math.PI)), 0]))); S.ticket.pen.rotation.set(0.5, 0, -0.4); }, { grade: 'coin', live: 0.4 });
shot(T26 + 2.0, T26 + 3.6, 'plaza', { ease: 'lin', p0: [2, 44, 18], p1: [1.5, 38, 13], l0: [0, 0, -2], fov: 48 }, (lt, O) => { S.plaza.crowd.upd(O, {}); const sl = S.plaza.slips; for (let i = 0; i < 120; i++) { const u = ((O * 0.6 + i * 0.0083) % 1); sl.set(i, V([Math.sin(i * 7.1) * (2 + 10 * u), 3 + 9 * Math.sin(u * Math.PI), -14 + Math.cos(i * 3.3) * (2 + 8 * u)]), 1.2); } sl.done(); }, { grade: 'street' });
function pubBase(O, o = {}) { const p = PB; [p.hero, ...p.near].forEach(resetRig); p.phone.visible = false; p.ticket.visible = false; p.conf.m.visible = false;
  const balls = clamp(Math.floor((O - BALL0) / BALLD) + 1, 0, 6); const win = balls >= 6; drawDraw(p.tvTex, O, o.host); p.crowd.upd(O, { cheer: balls > 0, jump: win && O < T26 + 10.8 });
  const kneel = O > CHOIR - 0.1 && O < T26 + 18.2; const armsUp = O > CHOIR && O < T26 + 10.8; const phoneLook = O > T26 + 14.0;
  hp(p.hero, O, [0, 0, 1.3], Math.PI + (O > T26 + 15.4 ? -0.1 : 0), { ...idle(O, 0), ...(kneel ? KNEEL : {}), headX: armsUp ? -0.35 : phoneLook ? 0.25 : 0, arms: armsUp ? [[-2.7, 0, 0.55, 0.25], [-2.7, 0, -0.55, 0.25]] : phoneLook ? [[-0.9, 0.4, 0.1, 1.5], [0.05, 0, -0.15, 0.2]] : [[-0.6, 0, 0.12, 1.2], [-0.6, 0, -0.12, 1.2]] }, armsUp ? 'laugh' : phoneLook ? 'calm' : 'worried');
  p.near.forEach((P, i) => { const x = [-1.6, 1.7, -2.6, 2.6][i], z = [2.3, 2.5, 1.0, 1.2][i]; hp(P, O, [x, 0, z], Math.PI + (x > 0 ? 0.25 : -0.25) * (phoneLook ? 0 : 1), { ...idle(O, i + 1), arms: phoneLook ? [[-1.1, 0.4, 0.1, 1.6], [0.05, 0, -0.13, 0.15]] : balls > 0 ? [[-2.6 + 0.2 * Math.sin(O * 9 + i), 0, 0.4, 0.3], [-0.6, 0, -0.13, 1.0]] : [[-0.7, 0, 0.13, 1.0], [0, 0, -0.13, 0.15]] }, win && !phoneLook ? 'laugh' : phoneLook ? 'worried' : 'shock', 'x'); });
  if (O > CHOIR && O < T26 + 12) { p.conf.m.visible = true; for (let i = 0; i < 260; i++) { const u = ((O - CHOIR) * 0.35 + (i * 0.618) % 1) % 1; p.conf.set(i, V([Math.sin(i * 12.9) * 4, 4.2 - u * 4.2, 2.5 + Math.abs(Math.cos(i * 7.7)) * 3]), 0.8 + 0.4 * Math.sin(O * 9 + i)); } p.conf.done(); } }
// the TV picture: a 1990s lottery draw (purple studio, a drum of balls, the drawn balls lined up), or the result card
const BALLC = ['#e8343c', '#ffd23a', '#2bb673', '#1f8fe0', '#ff8a3a', '#9b59d6'];
function drawDraw(t, O, host) { const g = t.g, w = t.c.width, h = t.c.height; const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#2a0a5a'); bg.addColorStop(1, '#0a0a2a'); g.fillStyle = bg; g.fillRect(0, 0, w, h);
  const r2 = rnd(3); for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(255,255,255,${0.3 + 0.5 * Math.abs(Math.sin(O * 3 + i))})`; g.beginPath(); g.arc(r2() * w, r2() * h * 0.5, 2, 0, 7); g.fill(); }
  g.textAlign = 'center';
  if (host) { g.fillStyle = '#ffd23a'; g.font = '800 54px Montserrat, Arial'; g.fillText('JACKPOT SHARED BY', w / 2, 110); g.fillStyle = '#fff'; g.font = '800 92px Montserrat, Arial'; g.fillText('31,000,000', w / 2, 220); g.fillStyle = '#ffd23a'; g.font = '800 54px Montserrat, Arial'; g.fillText('WINNERS', w / 2, 290);
    g.fillStyle = '#3dff7a'; g.font = '800 46px Montserrat, Arial'; g.fillText('EACH WINS: £0.64', w / 2, 360); }
  else { const cx = w * 0.3, cy = h * 0.42, R = h * 0.28; g.strokeStyle = 'rgba(200,220,255,0.8)'; g.lineWidth = 6; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.stroke(); g.fillStyle = 'rgba(160,200,255,0.12)'; g.fill();
    for (let i = 0; i < 22; i++) { const a = O * (3 + (i % 5)) + i * 1.7, rr2 = R * 0.75 * Math.abs(Math.sin(O * 2 + i)); g.fillStyle = BALLC[i % 6]; g.beginPath(); g.arc(cx + Math.cos(a) * rr2, cy + Math.sin(a) * rr2, 16, 0, 7); g.fill(); }
    g.fillStyle = '#fff'; g.font = '800 40px Montserrat, Arial'; g.fillText('LOTTO DRAW', w * 0.72, 90);
    const n = clamp(Math.floor((O - BALL0) / BALLD) + 1, 0, 6); for (let i = 0; i < 6; i++) { const x = 70 + i * 100, y = h - 70; g.globalAlpha = i < n ? 1 : 0.25; g.fillStyle = i < n ? BALLC[i] : '#666'; g.beginPath(); g.arc(x, y, 40, 0, 7); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y, 24, 0, 7); g.fill(); g.fillStyle = '#111'; g.font = '800 30px InterW, Arial'; if (i < n) g.fillText(String(LOTTO[i]), x, y + 11); g.globalAlpha = 1; } }
  g.globalAlpha = 0.15; g.fillStyle = '#000'; for (let y = (Math.floor(O * 30) % 2) * 2; y < h; y += 4) g.fillRect(0, y, w, 2); g.globalAlpha = 1; t.needsUpdate = true; }
shot(T26 + 3.6, T26 + 5.5, 'pub', { ease: 'lin', p0: [-1.0, 2.7, -2.85], p1: [-0.8, 2.6, -2.6], l0: [0.1, 1.6, 2.6], fov: 54 }, (lt, O) => { pubBase(O); }, { grade: 'pub' });
shot(T26 + 5.5, T26 + 7.65, 'pub', { ease: 'lin', p0: [1.6, 3.4, 3.5], p1: [1.6, 3.4, 3.1], l0: [1.6, 3.4, -3.25], fov: 40, shift: 0 }, (lt, O) => { pubBase(O); }, { grade: 'vhs', vhs: 1 });
shot(T26 + 7.65, T26 + 10.85, 'pub', { ease: 'lin', p0: [0.5, 1.8, -1.6], p1: [0.35, 1.75, -1.25], l0: [0, 1.7, 1.3], fov: 46 }, (lt, O) => { pubBase(O); }, { grade: 'pub', dof: 0.1 });
shot(T26 + 10.85, T26 + 14.3, 'pub', { ease: 'lin', p0: [0.7, 2.35, 3.9], p1: [0.9, 2.4, 3.3], l0: [1.6, 3.15, -3.25], fov: 40 }, (lt, O) => { pubBase(O, { host: true }); }, { grade: 'pub' });
shot(T26 + 14.3, T26 + 15.55, 'pub', { ease: 'lin', p0: [-2.45, 2.95, -1.7], p1: [-2.45, 2.8, -1.75], l0: [-2.5, 1.19, -2.05], fov: 40, shift: 0 }, (lt, O) => { pubBase(O, { host: true }); const ph = PB.phone; ph.visible = true; ph.position.set(-2.5, 1.2, -2.05); ph.rotation.set(-Math.PI / 2, 0, 0.1); drawWinPhone(seg(O, T26 + 14.35, T26 + 15.1), O); }, { grade: 'pub', live: 0.4 });
shot(T26 + 15.55, TL.END.t, 'pub', { ease: 'lin', p0: [0.35, 1.72, -1.5], p1: [0.28, 1.7, -1.2], l0: [0, 1.62, 1.3], fov: 40 }, (lt, O) => { pubBase(O, { host: true }); }, { grade: 'pub', dof: 0.15 });
// ===== END: the bakery again, from behind the counter. One roll left, 64p. Marcus is broke. "Unlucky, mate." =====
const TE = tS('END'), SLIDE = TE + 2.25, HANDOVER = TE + 3.6, LINE = TE + 4.75, SPIN = TE + 6.0, LAST = TE + 8.2;
function endScene(O) { bakeryBase(O, { price: true, wet: 0.7, soot: 0.6 }); const b = B; const step = eIO(seg(O, TE + 1.0, TE + 1.8));
  const mx = lerp(0.9, -0.35, step), mz = lerp(1.2, 2.1, step); const wal = O < TE + 1.0;
  hp(b.marcus, O, [mx, 0, mz], O < TE + 1.0 ? Math.PI : lerp(Math.PI, 1.1, eIO(seg(O, TE + 1.6, TE + 2.2))), { ...idle(O, 3), headX: 0.15, arms: [[wal ? -0.9 : 0.05, 0, 0.2, wal ? 1.2 : 0.15], [wal ? -0.9 : 0.05, 0, -0.2, wal ? 1.2 : 0.15]] }, 'worried', 'marcus');
  if (wal) { b.wallet.visible = true; b.wallet.position.copy(b.marcus.arms[0].el.localToWorld(V([0.15, -0.5, 0.12]))); b.wallet.rotation.set(0.4, Math.PI, 0); b.moths.forEach((m, i) => { m.visible = true; const f = seg(O, TE + 0.2 + i * 0.25, TE + 1.6 + i * 0.25); m.position.copy(b.wallet.position).add(V([Math.sin(O * 5 + i) * 0.3 * f, 0.1 + f * 1.4, -0.2 * f])); m.w1.rotation.y = Math.sin(O * 40) * 0.8; m['w-1'].rotation.y = -Math.sin(O * 40) * 0.8; }); }
  const hx = lerp(0.15, 0.9, step), hz = lerp(2.75, 1.25, step); const turn = eIO(seg(O, LINE - 0.4, LINE));
  const has = O > HANDOVER; const bite = eIO(seg(O, HANDOVER + 0.2, HANDOVER + 0.5)) * (1 - eIO(seg(O, HANDOVER + 0.75, LINE - 0.1)));
  hp(b.hero, O, [hx, 0, hz], lerp(Math.PI, Math.PI + 2.15, turn), { ...idle(O, 0), arms: [[0.05, 0, 0.13, 0.2], has ? [lerp(-0.6, -1.1, bite), 0, -0.15, lerp(1.2, 2.1, bite)] : O > SLIDE - 0.5 && O < SLIDE + 0.5 ? [-1.2, 0, -0.1, 0.3] : [0.05, 0, -0.13, 0.2]] }, O > LINE ? 'smirk' : bite > 0.5 ? 'sniff' : 'calm');
  hp(b.baker, O, [0.6, 0, -1.05], 0, { ...idle(O, 1), arms: [[-0.4, 0, 0.15, 1.3], O > HANDOVER - 0.5 && O < HANDOVER + 0.1 ? [-1.25, 0, -0.1, 0.3] : [-0.4, 0, -0.15, 1.3]] }, 'smile', 'baker');
  if (has) { b.roll.position.copy(b.hero.arms[1].el.localToWorld(V([0, -0.46, 0.06]))); b.roll.rotation.set(0, b.hero.root.rotation.y + Math.PI / 2, 0.2); } else if (O > HANDOVER - 0.5) { b.roll.position.copy(b.baker.arms[1].el.localToWorld(V([0, -0.46, 0.06]))); }
  b.coins.forEach((c, i) => { c.visible = O > SLIDE - 0.4; const k = eOut(seg(O, SLIDE, SLIDE + 0.5)); c.position.set(0.95 + i * 0.1 - 0.15 * k, 1.17, lerp(0.45, -0.05, k) + i * 0.04); c.rotation.set(0, i, 0); }); }
shot(TE, TE + 2.2, 'bakery', { ease: 'lin', p0: [-1.6, 1.85, -1.9], p1: [-1.45, 1.82, -1.7], l0: [0.6, 1.6, 1.8], fov: 46, shift: 0.02 }, (lt, O) => { endScene(O); }, { grade: 'bakery', dof: 0.12 });
shot(TE + 2.2, LINE - 0.45, 'bakery', { ease: 'lin', p0: [3.0, 2.1, 2.7], p1: [2.8, 2.05, 2.4], l0: [0.5, 1.9, -1.0], fov: 42 }, (lt, O) => { endScene(O); }, { grade: 'bakery', dof: 0.1 });
shot(LINE - 0.45, SPIN, 'bakery', { ease: 'lin', p0: [0.5, 2.0, 6.0], p1: [0.45, 2.0, 5.6], l0: [0.25, 1.9, 1.6], fov: 40 }, (lt, O) => { endScene(O); }, { grade: 'bakery', dof: 0.12 });
shot(SPIN, DUR + 0.5, 'bakery', { ease: 'lin', p0: [1.25, 1.33, 1.25], p1: [1.15, 1.3, 1.05], l0: [0.85, 1.17, 0.35], fov: 36, shift: 0 }, (lt, O) => { endScene(O); const c = B.spin; c.visible = true; c.rotation.order = 'YXZ'; const w = 0.12 + 0.1 * Math.max(0, 1 - (O - SPIN) / 2.5); c.position.set(0.85, 1.135 + 0.11 * Math.cos(w), 0.35); c.rotation.set(Math.PI / 2 - w, O * 26, 0); }, { grade: 'bakery', hideDiary: true, dark: (O) => (O >= LAST + 0.05 ? 1 : 0) });
const SAFE_L = 90, SAFE_R = 140, CAP_W = W - SAFE_L - SAFE_R, CAP_X = SAFE_L + CAP_W / 2;   // safe area: full-screen players crop the edges, Instagram's buttons cover the right side
function stepAt(T) { let s = null; for (const st of STEPS) if (T >= st.t) s = st; return s; }
function spaced(g, text, x, y, sp) { let cx = x; for (const ch of text) { g.fillText(ch, cx, y); cx += g.measureText(ch).width + sp; } return cx - x; }
const measC = mk(10, 10).getContext('2d');
// the slot-machine widget (top-left): LUCK, three reels that spin and land on every new day, the odds he beats today, DAY n
const SYMS = { 1: ['lemon', 'lemon', 'skull'], 2: ['cherry', 'cherry', 'lemon'], 3: ['cherry', 'cherry', 'cherry'], 5: ['bell', 'bell', 'cherry'], 7: ['bell', 'bell', 'bell'], 9: ['clover', 'clover', 'bell'], 13: ['clover', 'clover', 'clover'], 20: ['seven', 'seven', 'clover'], 23: ['seven', 'seven', 'seven'], 26: ['seven', 'seven', 'seven'], END: ['seven', 'seven', 'seven'] };
const SYMLIST = ['lemon', 'cherry', 'bell', 'clover', 'seven', 'skull'];
function drawSym(g, k, cx, cy, s) { g.save(); g.translate(cx, cy); g.scale(s, s); g.lineWidth = 3;
  if (k === 'lemon') { g.fillStyle = '#ffe23a'; g.beginPath(); g.ellipse(0, 0, 30, 22, 0.3, 0, 7); g.fill(); g.fillStyle = '#e8c21a'; g.beginPath(); g.arc(26, -12, 6, 0, 7); g.fill(); }
  else if (k === 'cherry') { g.strokeStyle = '#2bb673'; g.lineWidth = 4; g.beginPath(); g.moveTo(-12, 4); g.quadraticCurveTo(-4, -26, 8, -28); g.moveTo(14, 8); g.quadraticCurveTo(10, -18, 8, -28); g.stroke(); g.fillStyle = '#e8243c'; g.beginPath(); g.arc(-12, 12, 14, 0, 7); g.fill(); g.beginPath(); g.arc(14, 14, 14, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,0.6)'; g.beginPath(); g.arc(-16, 7, 4, 0, 7); g.fill(); }
  else if (k === 'bell') { g.fillStyle = '#ffc21a'; g.beginPath(); g.moveTo(-26, 18); g.quadraticCurveTo(-22, -30, 0, -30); g.quadraticCurveTo(22, -30, 26, 18); g.closePath(); g.fill(); g.fillStyle = '#c88a10'; g.fillRect(-28, 16, 56, 7); g.beginPath(); g.arc(0, 28, 7, 0, 7); g.fill(); }
  else if (k === 'clover') { g.fillStyle = '#2bd96b'; [[0, -13], [13, 0], [0, 13], [-13, 0]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 13, 0, 7); g.fill(); }); g.strokeStyle = '#1a8a42'; g.lineWidth = 5; g.beginPath(); g.moveTo(0, 0); g.lineTo(10, 30); g.stroke(); }
  else if (k === 'seven') { g.fillStyle = '#e8243c'; g.font = '800 64px Montserrat'; g.textAlign = 'center'; g.strokeStyle = '#fff1a0'; g.lineWidth = 6; g.strokeText('7', 0, 22); g.fillText('7', 0, 22); }
  else if (k === 'skull') { g.fillStyle = '#e8e8e8'; g.beginPath(); g.arc(0, -4, 24, 0, 7); g.fill(); g.fillRect(-14, 12, 28, 14); g.fillStyle = '#1a1a1a'; g.beginPath(); g.arc(-9, -4, 7, 0, 7); g.fill(); g.beginPath(); g.arc(9, -4, 7, 0, 7); g.fill(); g.fillRect(-2, 6, 4, 6); }
  g.restore(); }
function drawSlot(T, sh) { const s = stepAt(T); if (!s || sh.hideStat) return; const g = ctx, dt = T - s.t; const x = SAFE_L, y = 250, w = 450, h = 286;
  g.save(); g.shadowColor = 'rgba(0,0,0,0.55)'; g.shadowBlur = 26; g.shadowOffsetY = 8; const bg = g.createLinearGradient(0, y, 0, y + h); bg.addColorStop(0, '#2a1240'); bg.addColorStop(1, '#14081f'); g.fillStyle = bg; rr(g, x, y, w, h, 28); g.fill(); g.shadowBlur = 0; g.shadowOffsetY = 0;
  const rim = g.createLinearGradient(x, y, x + w, y + h); rim.addColorStop(0, '#ffe08a'); rim.addColorStop(0.5, '#c9902a'); rim.addColorStop(1, '#ffe08a'); g.strokeStyle = rim; g.lineWidth = 5; rr(g, x + 3, y + 3, w - 6, h - 6, 26); g.stroke();
  for (let i = 0; i < 9; i++) { const on = (Math.floor(T * 6) + i) % 2; g.fillStyle = on ? '#ffd23a' : '#7a5a1a'; g.beginPath(); g.arc(x + 30 + i * 49, y + 14, 4, 0, 7); g.fill(); }
  g.textAlign = 'left'; g.fillStyle = '#ffd23a'; g.font = '700 24px InterW'; spaced(g, 'LUCK', x + 26, y + 50, 6); g.fillStyle = '#d7262e'; rr(g, x + w - 168, y + 26, 144, 34, 17); g.fill(); g.fillStyle = '#fff'; g.font = '700 18px InterW'; spaced(g, '×2 DAILY', x + w - 150, y + 49, 2);
  const sy = SYMS[s.day] || SYMS.END; const rx = x + 22, ry = y + 66, rw = 96, rh = 92;
  for (let i = 0; i < 3; i++) { const bx = rx + i * (rw + 8); g.fillStyle = '#fbf6ea'; rr(g, bx, ry, rw, rh, 10); g.fill(); g.save(); rr(g, bx, ry, rw, rh, 10); g.clip();
    const stop = 0.3 + i * 0.16; if (dt < stop) { const off = ((T * 9 + i * 0.37) % 1) * rh; for (let k = -1; k < 2; k++) { g.globalAlpha = 0.55; drawSym(g, SYMLIST[(Math.floor(T * 9) + k + i * 2 + 6) % 6], bx + rw / 2, ry + rh / 2 + k * rh + off, 0.9); } g.globalAlpha = 1; }
    else { const b = clamp((dt - stop) / 0.18); drawSym(g, sy[i], bx + rw / 2, ry + rh / 2 + (1 - elastic(b)) * -18, 1.0 + (s.day === 'END' || s.day === 26 ? 0.06 * Math.sin(T * 8 + i) : 0)); }
    g.restore(); g.strokeStyle = '#c9902a'; g.lineWidth = 3; rr(g, bx, ry, rw, rh, 10); g.stroke(); }
  g.fillStyle = '#b9a8d8'; g.font = '700 18px InterW'; g.textAlign = 'center'; const dx = x + w - 52; g.fillText('DAY', dx, ry + 30); g.fillStyle = '#fff'; g.font = '800 44px Montserrat'; g.fillText(String(s.day === 'END' ? 27 : s.day), dx, ry + 78);
  g.textAlign = 'left'; const prev = STEPS[STEPS.indexOf(s) - 1]; const slide = prev ? eOut(clamp((dt - 0.15) / 0.35)) : 1; g.save(); g.beginPath(); g.rect(x + 16, ry + rh + 8, w - 32, 66); g.clip();
  const fit = (v) => { let f = 54; g.font = `800 ${f}px Montserrat`; while (g.measureText(v).width > w - 48 && f > 26) { f -= 2; g.font = `800 ${f}px Montserrat`; } };
  g.fillStyle = '#fff'; if (prev && slide < 1) { g.globalAlpha = 1 - slide; fit(prev.v); g.fillText(prev.v, x + 24, ry + rh + 58 - slide * 60); } g.globalAlpha = slide; fit(s.v); g.fillText(s.v, x + 24, ry + rh + 58 + (1 - slide) * 60); g.restore();
  g.fillStyle = '#ffd23a'; g.font = '700 21px InterW'; spaced(g, s.cmp, x + 24, y + h - 20, 1.5); g.restore(); }
function drawTitle(O) {
  if (O < TITLE.t0 || O >= TITLE.t1) return;
  const a = eOut(clamp((O - TITLE.t0) / 0.45)) * clamp((TITLE.t1 - O) / 0.3), rise = (1 - eOut(clamp((O - TITLE.t0) / 0.7))) * 40;
  const g = ctx; g.save(); g.globalAlpha = a; g.textAlign = 'center';
  const wash = g.createLinearGradient(0, 120, 0, 900); wash.addColorStop(0, 'rgba(40,16,6,0.55)'); wash.addColorStop(1, 'rgba(40,16,6,0)'); g.fillStyle = wash; g.fillRect(0, 0, W, 900);
  g.translate(0, rise); g.shadowColor = 'rgba(0,0,0,0.45)'; g.shadowBlur = 30; g.shadowOffsetY = 4; g.fillStyle = '#fff';
  g.font = '500 96px Playfair'; g.fillText('What if your', W / 2, 380);
  g.font = 'italic 500 236px Playfair'; g.fillStyle = '#ffe2a0'; g.fillText('luck', W / 2, 610);
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
  const nm = { hero: null, marcus: 'MARCUS', baker: 'BAKER', kid: 'KID', driver: 'DRIVER', racegoer: 'RACEGOER', commentator: 'COMMENTATOR (TV)', 'pit boss': 'PIT BOSS', 'tv host': 'LOTTERY HOST (TV)' }[c.speaker];
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
function drawRacing(sh, T) {   // TV racing graphics: LIVE bug, race name, the running order (it flips when the field piles up)
  const g = ctx; g.save(); g.textAlign = 'left'; g.fillStyle = '#d7262e'; rr(g, W - SAFE_R - 150, 262, 150, 50, 8); g.fill(); g.fillStyle = '#fff'; g.font = '800 30px Montserrat'; g.fillText('● LIVE', W - SAFE_R - 136, 298);
  const y = 1420; g.fillStyle = 'rgba(10,40,24,0.92)'; g.fillRect(SAFE_L, y, W - SAFE_L - SAFE_R, 62); g.fillStyle = '#f5f1e6'; g.fillRect(SAFE_L, y + 62, W - SAFE_L - SAFE_R, 56); g.fillStyle = '#ffd23a'; g.fillRect(SAFE_L, y, 10, 118);
  g.fillStyle = '#ffd23a'; g.font = '800 32px Montserrat'; g.fillText('DOWNS PARK  ·  2:15', SAFE_L + 28, y + 43);
  const piled = T > PILE + 0.2; g.fillStyle = '#0e3b22'; g.font = '700 27px InterW';
  const txt = sh.race === 2 ? 'WINNER: 9 NO CHANCE  ·  500-1' : piled ? '1 NO CHANCE  ·  2 … nobody else' : '1 THUNDERBOLT  2 SILVER DART  …  9 NO CHANCE'; g.fillText(txt, SAFE_L + 28, y + 101); g.restore(); }
function drawVHS(T) {   // 1990s broadcast tape: scanlines, colour fringe, a tracking band rolling down, PLAY
  const g = ctx; g.save(); g.globalCompositeOperation = 'screen'; g.globalAlpha = 0.22; g.drawImage(sceneC, 6, 0, W, H); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 0.16; g.fillStyle = '#000'; for (let y = (Math.floor(T * 30) % 2) * 2; y < H; y += 4) g.fillRect(0, y, W, 2);
  const by = ((T * 0.45) % 1) * (H + 200) - 100; g.globalAlpha = 0.22; g.drawImage(GRAIN[Math.floor(T * 30) % 4], 0, by, W, 70); g.globalAlpha = 1;
  g.fillStyle = '#fff'; g.font = '800 42px Montserrat'; g.textAlign = 'right'; g.shadowColor = '#000'; g.shadowBlur = 6; g.fillText('PLAY ▶', W - SAFE_R - 10, 300); g.textAlign = 'left'; g.font = '700 34px Montserrat'; g.fillText('SAT 8:00 PM', SAFE_L, 1470); g.restore(); }
// ---------------------------------------------------------------- grading / compositing
const GRADES = {
  bakery: { f: 'saturate(1.1) contrast(1.08) brightness(1.03)', tint: 'rgba(255,170,90,0.12)', mode: 'soft-light', vig: 0.42 },
  coin: { f: 'saturate(1.15) contrast(1.12) brightness(1.05)', tint: 'rgba(255,170,70,0.14)', mode: 'soft-light', vig: 0.55 },
  bridge: { f: 'saturate(0.95) contrast(1.06) brightness(1.04)', tint: 'rgba(120,150,200,0.12)', mode: 'soft-light', vig: 0.32 },
  street: { f: 'saturate(1.1) contrast(1.06) brightness(1.04)', tint: 'rgba(255,200,150,0.08)', mode: 'soft-light', vig: 0.3 },
  arcade: { f: 'saturate(1.3) contrast(1.12) brightness(1.06)', tint: 'rgba(200,60,255,0.12)', mode: 'soft-light', vig: 0.5 },
  sunny: { f: 'saturate(1.18) contrast(1.05) brightness(1.05)', tint: 'rgba(255,220,150,0.1)', mode: 'soft-light', vig: 0.28 },
  races: { f: 'saturate(1.22) contrast(1.06) brightness(1.05)', tint: 'rgba(160,255,140,0.06)', mode: 'soft-light', vig: 0.25 },
  night: { f: 'saturate(0.9) contrast(1.12) brightness(1.02)', tint: 'rgba(80,170,200,0.18)', mode: 'soft-light', vig: 0.6 },
  casino: { f: 'saturate(1.15) contrast(1.12) brightness(1.04)', tint: 'rgba(255,150,60,0.14)', mode: 'soft-light', vig: 0.55 },
  pub: { f: 'saturate(1.1) contrast(1.1) brightness(1.05)', tint: 'rgba(255,160,80,0.13)', mode: 'soft-light', vig: 0.5 },
  vhs: { f: 'saturate(1.4) contrast(1.15) brightness(1.08)', tint: 'rgba(255,60,200,0.08)', mode: 'soft-light', vig: 0.6 },
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
const HEROES = [S.bakery.hero, S.bridge.hero, S.junction.hero, S.arcade.hero, S.drive.hero, S.races.hero, S.laundrette.hero, S.casino.hero, S.pub.hero];
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
  const gr = GRADES[sh.grade] || GRADES.bakery;
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
  if (sh.race) drawRacing(sh, Oreal); if (sh.vhs) drawVHS(Oreal); if (sh.letterbox) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, 300); ctx.fillRect(0, H - 300, W, 300); }
  if (sh.flare) drawFlare(sh.flare[0], sh.flare[1], 0.9);
  if (sh.dark) { const d = sh.dark(O); if (d > 0) { ctx.fillStyle = `rgba(4,6,18,${d})`; ctx.fillRect(0, 0, W, H); } }
    if (!sh.hideStat && O >= STEPS[0].t) { ctx.save(); ctx.translate(W * 0.2, 400); ctx.scale(1, 0.62); const sg = ctx.createRadialGradient(0, 0, 0, 0, 0, W * 0.62); sg.addColorStop(0, 'rgba(0,0,0,0.34)'); sg.addColorStop(0.55, 'rgba(0,0,0,0.16)'); sg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = sg; ctx.fillRect(-W, -W, W * 3, W * 2); ctx.restore(); }
  drawGrain(Oreal); drawTitle(O); drawSlot(Oreal, sh); drawDiary(Oreal, sh); drawCaptions(Oreal);
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