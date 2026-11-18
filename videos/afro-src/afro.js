// "What if your afro doubled every day?" — Polygram series, episode renderer (three.js, rig v2, IBL lighting)
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const W = 1080, H = 1920; export const DUR = 58.0;
let DIALOGUE = [];
function spanHit(c, O) { for (const [a, b] of c.spans) if (O >= a - 0.02 && O < b + 0.03) return true; return false; }

// ---------------------------------------------------------------- story steps (one doubling each)
const STEPS = [
  { day: 1, t: 3.0, v: '15 cm', cmp: 'FRESHLY PICKED' },
  { day: 2, t: 6.2, v: '30 cm', cmp: 'ATE A HAIRBRUSH' },
  { day: 3, t: 12.0, v: '60 cm', cmp: 'HOME TO 3 BIRD FAMILIES' },
  { day: 4, t: 17.6, v: '1.2 m', cmp: 'BROKE A HEDGE TRIMMER' },
  { day: 5, t: 24.4, v: '2.4 m', cmp: 'WIND RESISTANT' },
  { day: 6, t: 29.8, v: '4.8 m', cmp: 'READABLE FROM A HELICOPTER' },
  { day: 7, t: 38.6, v: '9.6 m', cmp: 'HAS ITS OWN MOON' },
  { day: 8, t: 44.2, v: '19.2 m', cmp: 'WEARING SATURN' },
  { day: 9, t: 49.6, v: '38.4 m', cmp: 'VISIBLE FROM OTHER GALAXIES' },
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
  const R = o.R || 10; Object.assign(key.shadow.camera, { left: -R, right: R, top: R, bottom: -R, near: 0.5, far: 120 }); key.shadow.camera.updateProjectionMatrix(); key.shadow.bias = -0.0003; key.shadow.normalBias = 0.02; key.shadow.radius = 5;   // bounds only apply after updateProjectionMatrix()
  sc.add(key, key.target); if (o.target) key.target.position.set(...o.target);
  if (o.rim) { const rim = new THREE.DirectionalLight(o.rimC, o.rim); rim.position.set(...o.rimPos); sc.add(rim); }
  return key;
}

// ---------------------------------------------------------------- extra helpers (this episode)
const T = (p, c) => (p.add(c), c);
const glowTex = (c0, c1) => canvasTex(256, 256, (g) => { const gr = g.createRadialGradient(128, 128, 6, 128, 128, 128); gr.addColorStop(0, c0); gr.addColorStop(0.35, c1); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); });
function cyl(rt, rb, h, c, x = 0, y = 0, z = 0, seg = 28, o) { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), c && c.isMaterial ? c : mat(c, o)); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; return m; }
function cone(r, h, c, x = 0, y = 0, z = 0, seg = 24, o) { const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), c && c.isMaterial ? c : mat(c, o)); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; return m; }
const zincTex = canvasTex(256, 64, (g, w, h) => { for (let i = 0; i < 16; i++) { const gr = g.createLinearGradient(i * 16, 0, i * 16 + 16, 0); gr.addColorStop(0, '#9da3ab'); gr.addColorStop(0.5, '#e8ecf0'); gr.addColorStop(1, '#8d939b'); g.fillStyle = gr; g.fillRect(i * 16, 0, 16, h); } });
zincTex.wrapS = zincTex.wrapT = THREE.RepeatWrapping;
function house(sc, x, z, w, h, d, wall, roof, ry = 0) { const g = grp(x, 0, z, sc); g.rotation.y = ry; g.add(rbox(w, h, d, wall, 0, h / 2, 0)); g.add(rbox(w + 0.9, 0.18, d + 1.0, roof, 0, h + 0.15, 0)); g.add(rbox(w + 0.6, 0.12, d + 0.7, mat(0xaab0b8, { roughness: 0.4, metalness: 0.4 }), 0, h + 0.3, 0));
  const wm = mat(0x7fb7d9, { roughness: 0.1, metalness: 0.4 }); for (let i = 0; i < Math.floor(w / 2.2); i++) g.add(rbox(0.9, 0.9, 0.06, wm, -w / 2 + 1.2 + i * 2.2, h * 0.58, d / 2 + 0.02)); g.add(rbox(0.9, 1.7, 0.08, mat(0x4a2f22), w / 2 - 1.0, 0.85, d / 2 + 0.03)); return g; }
function palm(sc, x, z, s = 1, lean = 0.15) { const g = grp(x, 0, z, sc); const trunk = mat(0x8a6a48, { roughness: 0.8 }); for (let i = 0; i < 7; i++) { const t = i / 6; g.add(cyl(0.2 - 0.06 * t, 0.22 - 0.06 * t, 1.0, trunk, Math.sin(t * 1.4) * lean * 4, 0.5 + i * 0.95, 0, 10)); }
  const top = grp(Math.sin(1.4) * lean * 4, 6.9, 0, g); const leaf = mat(0x3fa24a, { roughness: 0.5, side: THREE.DoubleSide }); for (let i = 0; i < 9; i++) { const f = grp(0, 0, 0, top); f.rotation.y = i / 9 * Math.PI * 2; f.rotation.z = -0.55; f.add(rbox(2.3, 0.05, 0.5, leaf, 1.15, 0, 0)); } g.scale.setScalar(s); return g; }
const PAL = [[0xe8a317, 0x2d3a63, 0x8d5a3b, 0x15100d], [0x2bb673, 0x4b3a2a, 0x6e4528, 0x15100d], [0x9b59d6, 0x2b2b2b, 0x7a4a2e, 0x1a1210], [0xe8343c, 0x3b4a6b, 0x8d5a3b, 0x15100d], [0x1f8fe0, 0x5b4636, 0x6b4128, 0x111111], [0xff8c5a, 0x2f3a52, 0x7a4a2e, 0x1a1210], [0xf4f4f4, 0x30343c, 0x8d5a3b, 0x15100d], [0x20a0a0, 0x444444, 0x6e4528, 0x1a1210]];
function npc(i, o = {}) { const c = PAL[i % PAL.length]; return makeRig({ hood: c[0], hoodD: c[0], pants: c[1], skin: c[2], hair: c[3], noHood: true, hairStyle: i % 3 === 1 ? 'long' : 'short', ...o }); }
const newHero = (sc) => { const P = makeRig({ afro: true }); sc.add(P.root); P.comb = addComb(P); return P; };
function combMesh() { const g = grp(); const cm = mat(0xffd23f, { roughness: 0.35 }); g.add(rbox(0.07, 0.28, 0.07, cm, 0, -0.02, 0)); g.add(rbox(0.26, 0.06, 0.07, cm, 0, -0.18, 0)); for (let i = 0; i < 6; i++) g.add(rbox(0.025, 0.24, 0.025, cm, -0.11 + i * 0.044, -0.32, 0)); return g; }
function addComb(P) {   // afro pick in the right hand
  const g = combMesh(); g.position.set(0, -0.48, 0.04); P.arms[1].el.add(g); g.rotation.x = -1.4; g.visible = false; return g; }
function loose(sc, m) { m.visible = false; sc.add(m); return m; }
function sock() { const g = grp(); g.add(rbox(0.16, 0.12, 0.42, mat(0xf4f4f4, { roughness: 0.9 }), 0, 0, 0)); g.add(rbox(0.17, 0.13, 0.08, mat(0xe8343c, { roughness: 0.9 }), 0, 0, -0.17)); g.add(rbox(0.16, 0.22, 0.14, mat(0xf4f4f4, { roughness: 0.9 }), 0, 0.1, 0.16)); return g; }
function remote() { const g = grp(); g.add(rbox(0.17, 0.06, 0.52, mat(0x2a2a30, { roughness: 0.4 }))); [[0, 0.17, 0xe8343c], [-0.04, 0.05, 0xffffff], [0.04, 0.05, 0xffffff], [0, -0.05, 0xffffff]].forEach(([x, z, c]) => g.add(rbox(0.05, 0.03, 0.05, mat(c), x, 0.04, z))); return g; }
function makeBird(col = 0xffb84d) {
  const g = grp(); const bm = mat(col, { roughness: 0.5 }); const body = ball(0.22, bm, 0, 0.22, 0, undefined, 18); body.scale.set(1, 0.95, 1.05); g.add(body);
  const head = grp(0, 0.42, 0.06, g); head.add(ball(0.15, bm, 0, 0, 0, undefined, 16)); head.add(cone(0.05, 0.12, mat(0xff7a1a), 0, -0.01, 0.17, 10)).children; head.children[1].rotation.x = Math.PI / 2;
  const beakLo = cone(0.04, 0.09, mat(0xe05a10), 0, -0.04, 0.15, 10); beakLo.rotation.x = Math.PI / 2; head.add(beakLo);
  for (const sx of [-1, 1]) { head.add(ball(0.045, mat(0xffffff, { roughness: 0.2 }), sx * 0.07, 0.04, 0.12, undefined, 10)); head.add(ball(0.025, mat(0x111111), sx * 0.075, 0.04, 0.155, undefined, 8)); }
  const wings = [-1, 1].map(sx => { const w = grp(sx * 0.2, 0.28, 0, g); w.add(rbox(0.05, 0.16, 0.26, mat(col === 0xffb84d ? 0xe89a2a : 0x3a7ac0, { roughness: 0.5 }), sx * 0.02, -0.04, -0.02)); return w; });
  g.add(rbox(0.04, 0.1, 0.04, mat(0xff7a1a), -0.06, 0.02, 0.02)); g.add(rbox(0.04, 0.1, 0.04, mat(0xff7a1a), 0.06, 0.02, 0.02));
  g.userData = { head, wings, beakLo }; return g;
}
function birdAnim(b, O, ph = 0, talk = false, fly = 0) { const u = b.userData; u.head.rotation.y = Math.sin(O * 1.7 + ph) * 0.4; u.head.rotation.x = Math.sin(O * 2.3 + ph) * 0.1; const f = fly ? Math.sin(O * 38 + ph) * 1.1 : Math.sin(O * 3 + ph) * 0.06; u.wings[0].rotation.z = -0.1 - f; u.wings[1].rotation.z = 0.1 + f;
  u.beakLo.rotation.x = Math.PI / 2 + (talk && Math.sin(O * 24) > -0.2 ? 0.45 + 0.2 * Math.abs(Math.sin(O * 13)) : 0); }
function kite(col, col2) { const g = grp(); const sh = new THREE.Shape(); sh.moveTo(0, 0.7); sh.lineTo(0.45, 0); sh.lineTo(0, -0.95); sh.lineTo(-0.45, 0); sh.closePath();
  const m = new THREE.Mesh(new THREE.ShapeGeometry(sh), new THREE.MeshStandardMaterial({ color: col, roughness: 0.6, side: THREE.DoubleSide })); m.castShadow = true; g.add(m);
  const m2 = new THREE.Mesh(new THREE.ShapeGeometry(sh), new THREE.MeshStandardMaterial({ color: col2, roughness: 0.6, side: THREE.DoubleSide })); m2.scale.set(0.5, 0.5, 1); m2.position.z = 0.01; g.add(m2);
  g.tail = [...Array(5)].map((_, i) => { const b = rbox(0.14, 0.08, 0.02, [col2, col][i % 2], 0, -1.1 - i * 0.28, 0); g.add(b); return b; }); return g; }
function stars(n, r, size, seed, yMin = -1) { const sr = rnd(seed), sp = []; for (let i = 0; i < n; i++) { const v = V([sr() * 2 - 1, yMin + sr() * (1 - yMin), sr() * 2 - 1]).normalize().multiplyScalar(r); sp.push(v.x, v.y, v.z); }
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3)); return new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: size * RS, sizeAttenuation: false, toneMapped: false, transparent: true, opacity: 1 })); }
const galT = (c0, c1, seed = 5) => canvasTex(512, 512, (g) => { g.translate(256, 256); const r2 = rnd(seed); for (let k = 0; k < 2600; k++) { const arm = k % 3, t = Math.pow(r2(), 0.6); const a = t * 9 + arm * 2.094 + (r2() - 0.5) * 0.5, r = t * 230; g.fillStyle = r2() < 0.5 ? c0 : c1; g.globalAlpha = 0.25 + r2() * 0.5; g.beginPath(); g.arc(Math.cos(a) * r, Math.sin(a) * r * 0.55, 1.2 + r2() * 3, 0, 7); g.fill(); } g.globalAlpha = 1; const cg = g.createRadialGradient(0, 0, 0, 0, 0, 70); cg.addColorStop(0, 'rgba(255,255,230,1)'); cg.addColorStop(1, 'rgba(255,200,120,0)'); g.fillStyle = cg; g.fillRect(-256, -256, 512, 512); });
function moonMesh(r = 1) { const g = new THREE.IcosahedronGeometry(1, 2).toNonIndexed(); const pos = g.attributes.position, cols = [], r2 = rnd(9); for (let i = 0; i < pos.count; i += 3) { const c = new THREE.Color(r2() < 0.2 ? 0x9a9aa2 : (r2() < 0.5 ? 0xc9c9cf : 0xb7b7bf)); for (let k = 0; k < 3; k++) cols.push(c.r, c.g, c.b); } g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.85 })); m.scale.setScalar(r); m.castShadow = true; return m; }

// ---------------------------------------------------------------- SCENES
const S = {};
{ // ---- bedroom (title, Day 1, Day 2)
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x2a2230);
  lightRig(sc, { sky: 0xfff0dc, ground: 0x8a6a50, hemi: 0.55, keyC: 0xffe0b0, key: 1.6, keyPos: [6, 6, 4], target: [0, 1, 0], rim: 0.6, rimC: 0xffb070, rimPos: [-5, 4, -4], env: 0.5, R: 8 });
  sc.add(rbox(14, 0.2, 12, mat(0xb98a5a, { roughness: 0.6 }), 0, -0.1, 0)); sc.add(rbox(4.4, 0.03, 3.0, mat(0x3a7ac0, { roughness: 0.95 }), 0.3, 0.02, 0.6));
  sc.add(rbox(14, 6, 0.3, mat(0x9fd3c7, { roughness: 0.9 }), 0, 3, -3.2)); sc.add(rbox(0.3, 6, 12, mat(0x8cc4b8, { roughness: 0.9 }), -5.2, 3, 0)); sc.add(rbox(14, 0.3, 0.34, mat(0xf4f4f4, { roughness: 0.6 }), 0, 0.15, -3.0));
  const win = grp(3.2, 2.6, -3.04, sc); win.add(rbox(2.4, 2.0, 0.08, mat(0xffffff, { roughness: 0.4 }), 0, 0, 0)); win.add(rbox(2.1, 1.7, 0.06, mat(0xfff2c8, { emissive: 0xffd88a, emissiveIntensity: 1.1 }), 0, 0, 0.03)); win.add(rbox(0.08, 1.7, 0.08, mat(0xffffff), 0, 0, 0.06)); win.add(rbox(2.1, 0.08, 0.08, mat(0xffffff), 0, 0, 0.06));
  const sun = new THREE.SpotLight(0xffd9a0, 40, 18, 0.5, 0.6, 1.4); sun.position.set(3.4, 3.4, -2.6); sun.target.position.set(0.5, 0, 1.5); sc.add(sun, sun.target);
  const bed = grp(-3.0, 0, -1.2, sc); bed.add(rbox(2.4, 0.5, 3.4, mat(0x6e4a2e, { roughness: 0.6 }), 0, 0.25, 0)); bed.add(rbox(2.3, 0.35, 3.2, mat(0xf4f4f4, { roughness: 0.9 }), 0, 0.65, 0.05)); bed.add(rbox(2.3, 0.2, 2.0, mat(0xe8343c, { roughness: 0.9 }), 0, 0.86, 0.65));  bed.add(rbox(2.4, 1.3, 0.2, mat(0x6e4a2e, { roughness: 0.6 }), 0, 0.85, -1.75));
  const dres = grp(1.6, 0, -2.7, sc); dres.add(rbox(1.6, 1.0, 0.7, mat(0xe8e1d0, { roughness: 0.6 }), 0, 0.5, 0)); [0.3, 0.7].forEach(y => dres.add(rbox(1.4, 0.04, 0.02, mat(0xb0a690), 0, y, 0.36))); 
  const plant = grp(4.6, 0, -2.4, sc); plant.add(cyl(0.3, 0.24, 0.5, mat(0xd96b3a, { roughness: 0.7 }), 0, 0.25, 0, 16)); [[0, 1.0, 0, 0.45], [0.3, 0.8, 0.1, 0.32], [-0.3, 0.85, 0, 0.34]].forEach(([a, b, c, r]) => plant.add(ball(r, mat(0x3f9a3f, { roughness: 0.55 }), a, b, c, undefined, 14)));
  const poster = rbox(1.4, 1.9, 0.04, mat(0xffd23f, { roughness: 0.6 }), -1.0, 3.2, -3.04); sc.add(poster); sc.add(ball(0.45, mat(0xe8343c, { roughness: 0.5 }), -1.0, 3.35, -3.0, undefined, 16)); sc.add(rbox(1.0, 0.15, 0.04, mat(0x1f8fe0), -1.0, 2.6, -3.0));
  const mirror = grp(-5.0, 0, 1.4, sc); mirror.rotation.y = Math.PI / 2; mirror.add(rbox(1.3, 2.6, 0.12, mat(0x6e4a2e, { roughness: 0.5 }), 0, 1.5, 0)); mirror.add(rbox(1.1, 2.4, 0.04, mat(0xdfe8f0, { roughness: 0.02, metalness: 1, envMapIntensity: 1.6 }), 0, 1.5, 0.06));
  const hero = newHero(sc);
  const flyers = [cyl(0.12, 0.12, 0.3, mat(0xff8a1f, { roughness: 0.4 }), 0, 0, 0, 14), cyl(0.08, 0.08, 0.4, mat(0x2bb673, { roughness: 0.4 }), 0, 0, 0, 14), rbox(0.4, 0.08, 0.5, mat(0x1f8fe0, { roughness: 0.6 }))].map(m => { sc.add(m); return m; });
  const side = grp(1.15, 0, 0.0, sc); side.add(rbox(0.7, 0.06, 0.6, mat(0xa9763f, { roughness: 0.5 }), 0, 0.85, 0)); [[-0.3, -0.25], [0.3, -0.25], [-0.3, 0.25], [0.3, 0.25]].forEach(([x, z]) => side.add(rbox(0.06, 0.82, 0.06, mat(0x7a4a2e), x, 0.41, z)));
  const flyHome = [V([1.0, 1.03, -0.05]), V([1.3, 1.08, 0.1]), V([1.15, 1.0, -0.15])];   // bottle, bottle, book on the side table next to him
  const combFly = loose(sc, combMesh()), sockM = loose(sc, sock()), remoteM = loose(sc, remote());
  S.room = { sc, hero, flyers, flyHome, combFly, sockM, remoteM };
}
{ // ---- street (Days 3 and 5): houses, poles + wires, birds, kites, a kid
  const sc = new THREE.Scene(); sc.add(skyDome('#4f86c8', '#9fd0f0', '#ffe9c0'));
  lightRig(sc, { sky: 0xe6f3ff, ground: 0x9a7e5a, hemi: 0.55, keyC: 0xfff0d8, key: 1.8, keyPos: [-8, 12, 10], target: [0, 0, 0], rim: 0.5, rimC: 0xbfe0ff, rimPos: [8, 5, -8], env: 0.45, R: 16 });
  sc.add(rbox(120, 0.2, 9, mat(0x59606e, { roughness: 0.7 }), 0, -0.1, 3.8)); sc.add(rbox(120, 0.22, 7, mat(0xcaa87a, { roughness: 0.9 }), 0, -0.09, -3.4)); for (let x = -40; x < 40; x += 3.2) sc.add(rbox(1.5, 0.02, 0.16, mat(0xffffff, { roughness: 0.4 }), x, 0.01, 3.8));
  const cols = [0xf4a259, 0x7ec8e3, 0xe9c46a, 0xf08a8a, 0xa8d5a2, 0xf2cf6b];
  for (let i = 0; i < 6; i++) house(sc, -12 + i * 4.8, -9.4, 4.2, 3.4, 4.0, mat(cols[i], { roughness: 0.85 }), mat(0x8b5a3c, { roughness: 0.6 }));
  const poles = [-14, -4, 6, 16]; poles.forEach(x => { sc.add(rbox(0.22, 7.0, 0.22, mat(0x7a5a3a, { roughness: 0.8 }), x, 3.5, -2.8)); sc.add(rbox(2.2, 0.14, 0.14, mat(0x7a5a3a), x, 6.5, -2.8)); });
  for (const dz of [-0.9, 0, 0.9]) for (let k = 0; k < 3; k++) { const a = poles[k], b = poles[k + 1], pts = []; for (let i = 0; i <= 16; i++) { const u = i / 16; pts.push(V([lerp(a, b, u), 6.62 - 0.55 * Math.sin(u * Math.PI), -2.8 + dz * 0.4])); } sc.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x1a1a1a }))); }
  palm(sc, -17, -5, 1.2, 0.1); palm(sc, 22, -5, 1.2, -0.1); palm(sc, 9, -6.5, 1.0, 0.12);
  const people = [...Array(4)].map((_, i) => { const P = npc(i + 2); sc.add(P.root); return P; });
  const hero = newHero(sc);
  const birds = [0xffb84d, 0x5aa0e6, 0xffb84d, 0x5aa0e6, 0xffb84d, 0x5aa0e6].map(c => { const b = makeBird(c); sc.add(b); return b; });
  const line = grp(0, 0, 0, sc); line.add(rbox(0.9, 0.04, 0.04, mat(0x7a5a3a), 0, 0, 0)); [0xe8343c, 0xffffff, 0x2bb673].forEach((c, i) => line.add(rbox(0.16, 0.2, 0.02, mat(c, { roughness: 0.8 }), -0.28 + i * 0.28, -0.13, 0)));
  const kites = [[0xe8343c, 0xffd23f], [0x1f8fe0, 0xffffff], [0x2bb673, 0xffd23f], [0xff8a1f, 0x9b59d6], [0xffd23f, 0xe8343c], [0x9b59d6, 0x7affd9]].map(([a, b]) => { const k = kite(a, b); sc.add(k); return k; });
  const ballF = ball(0.32, mat(0xffffff, { roughness: 0.4 }), 0, 0, 0, undefined, 18); sc.add(ballF); [0, 1.3, 2.6, 3.9, 5.2].forEach((a) => { const p = rbox(0.14, 0.14, 0.04, mat(0x111111), Math.cos(a) * 0.29, Math.sin(a) * 0.29, 0.12); ballF.add(p); });
  const slipper = grp(0, 0, 0, sc); slipper.add(rbox(0.36, 0.06, 0.9, mat(0x1f8fe0, { roughness: 0.5 }))); slipper.add(rbox(0.38, 0.05, 0.12, mat(0xffffff), 0, 0.06, 0.15));
  const kid = makeRig({ hood: 0xffd23f, hoodD: 0xe0b020, pants: 0x2d3a63, skin: 0x7a4a2e, hair: 0x15100d, noHood: true }); kid.root.scale.setScalar(0.62); sc.add(kid.root);
  const kidKite = grp(0, -0.5, 0.05, kid.arms[0].el); kidKite.add(cyl(0.01, 0.01, 2.4, mat(0xf4f4f4), 0, 1.0, 0, 4));
  const twig = loose(sc, rbox(0.05, 0.05, 0.55, mat(0x7a5a3a, { roughness: 0.8 })));
  const strG = new THREE.BufferGeometry().setFromPoints([V([0, 0, 0]), V([0, 1, 0])]); const string = new THREE.Line(strG, new THREE.LineBasicMaterial({ color: 0xffffff })); string.frustumCulled = false; sc.add(string);
  S.street = { sc, hero, people, birds, line, kites, ballF, slipper, kid, twig, string };
}
{ // ---- barbershop (Day 4 + ending)
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x1e2430);
  lightRig(sc, { sky: 0xf2f6ff, ground: 0x6a6070, hemi: 0.6, keyC: 0xfff4e0, key: 1.5, keyPos: [3, 7, 6], target: [0, 1, 0], rim: 0.7, rimC: 0x9fd0ff, rimPos: [-6, 5, -5], env: 0.55, R: 9 });
  const tile = canvasTex(256, 256, (g, w, h) => { for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { g.fillStyle = (x + y) % 2 ? '#f2f2f2' : '#2a2a30'; g.fillRect(x * 32, y * 32, 32, 32); } }); tile.wrapS = tile.wrapT = THREE.RepeatWrapping; tile.repeat.set(4, 4);
  const fl = new THREE.Mesh(rgeo(16, 0.2, 14), new THREE.MeshStandardMaterial({ map: tile, roughness: 0.35 })); fl.position.y = -0.1; fl.receiveShadow = true; sc.add(fl);
  sc.add(rbox(16, 7, 0.3, mat(0xf0e6d2, { roughness: 0.85 }), 0, 3.5, -3.4)); sc.add(rbox(0.3, 7, 14, mat(0xe2d5bd, { roughness: 0.85 }), -6.2, 3.5, 0)); sc.add(rbox(16, 1.1, 0.34, mat(0x2bb673, { roughness: 0.6 }), 0, 0.55, -3.2));
  sc.add(rbox(6.4, 2.6, 0.08, mat(0xdfe8f0, { roughness: 0.03, metalness: 1, envMapIntensity: 1.6 }), 0.2, 2.6, -3.2)); sc.add(rbox(6.7, 0.14, 0.14, mat(0x6e4a2e), 0.2, 3.95, -3.18)); sc.add(rbox(6.7, 0.14, 0.14, mat(0x6e4a2e), 0.2, 1.25, -3.18));
  sc.add(rbox(6.6, 0.12, 0.6, mat(0xf4f4f4, { roughness: 0.3 }), 0.2, 1.15, -2.9)); const bottles = [[-2.2, 0x1f8fe0], [-1.8, 0xe8343c], [-1.4, 0xffd23f], [2.0, 0x2bb673], [2.4, 0x9b59d6]].map(([x, c]) => { const m = cyl(0.09, 0.09, 0.36, mat(c, { roughness: 0.2 }), x, 1.39, -2.9, 12); sc.add(m); m.userData.home = m.position.clone(); return m; });
  const stripe = canvasTex(64, 256, (g, w, h) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); for (let i = -4; i < 12; i++) { g.fillStyle = i % 2 ? '#e8343c' : '#1f6fd0'; g.beginPath(); g.moveTo(0, i * 32); g.lineTo(w, i * 32 + 48); g.lineTo(w, i * 32 + 64); g.lineTo(0, i * 32 + 16); g.fill(); } }); stripe.wrapT = THREE.RepeatWrapping;
  const pole = cyl(0.22, 0.22, 1.6, new THREE.MeshStandardMaterial({ map: stripe, roughness: 0.2 }), 4.4, 2.4, -3.05, 20); sc.add(pole); sc.add(ball(0.26, mat(0xdfe4ea, { metalness: 0.8, roughness: 0.2 }), 4.4, 3.3, -3.05, undefined, 14)); sc.add(ball(0.26, mat(0xdfe4ea, { metalness: 0.8, roughness: 0.2 }), 4.4, 1.5, -3.05, undefined, 14));
  const chair = grp(0, 0, 0, sc); const red = mat(0xc8202a, { roughness: 0.35 }), chrome = mat(0xdfe4ea, { metalness: 0.9, roughness: 0.2 }); chair.add(cyl(0.6, 0.7, 0.12, chrome, 0, 0.06, 0, 24)); chair.add(cyl(0.12, 0.12, 0.5, chrome, 0, 0.35, 0, 12)); chair.add(rbox(1.1, 0.25, 1.0, red, 0, 0.7, 0)); chair.add(rbox(1.1, 1.3, 0.22, red, 0, 1.35, -0.45)); [-0.6, 0.6].forEach(x => chair.add(rbox(0.16, 0.14, 0.9, chrome, x, 1.0, 0.0))); chair.add(rbox(0.7, 0.08, 0.3, chrome, 0, 0.3, 0.6));
  const cape = new THREE.Mesh(new THREE.ConeGeometry(0.85, 1.3, 24, 1, true), new THREE.MeshStandardMaterial({ color: 0x2a2f3a, roughness: 0.6, side: THREE.DoubleSide })); cape.castShadow = true; sc.add(cape);
  const hero = newHero(sc);
  const barber = makeRig({ hood: 0xf4f4f4, hoodD: 0xdfe3ea, pants: 0x2a2f3a, skin: 0x6b4128, hair: 0x15100d, noHood: true, hairStyle: 'short' }); sc.add(barber.root); const apron = T(barber.spine, rbox(0.82, 0.5, 0.05, mat(0x1f8fe0, { roughness: 0.6 }), 0, 0.25, 0.24));
  const clip = grp(0, -0.5, 0.05, barber.arms[1].el); clip.add(rbox(0.14, 0.34, 0.12, mat(0x2a2a30, { roughness: 0.3 }), 0, -0.06, 0)); clip.add(rbox(0.16, 0.06, 0.12, mat(0xc9ced6, { metalness: 0.8, roughness: 0.2 }), 0, -0.25, 0)); clip.rotation.x = -1.2;
  const hat = grp(0, 0.66, 0, barber.head); hat.add(new THREE.Mesh(new THREE.SphereGeometry(0.44, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat(0xffd23f, { roughness: 0.35 }))); hat.add(cyl(0.52, 0.52, 0.05, mat(0xffd23f, { roughness: 0.35 }), 0, 0.0, 0.05, 24));
  const torch = cyl(0.09, 0.09, 0.14, mat(0x2a2a30), 0, 0.2, 0.42, 12); torch.rotation.x = Math.PI / 2; hat.add(torch); const lens = cyl(0.075, 0.075, 0.02, mat(0xfff6c8, { emissive: 0xfff2b0, emissiveIntensity: 3 }), 0, 0.2, 0.5, 12); lens.rotation.x = Math.PI / 2; hat.add(lens);
  const beam = new THREE.SpotLight(0xfff2c8, 0, 8, 0.35, 0.5, 1.2); beam.position.set(0, 0.2, 0.5); hat.add(beam); const bt = grp(0, -1.0, 4, hat); beam.target = bt; hat.visible = false;
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex('rgba(255,250,220,1)', 'rgba(255,230,160,0.4)'), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); glow.scale.setScalar(0.6); glow.position.set(0, 0.2, 0.55); hat.add(glow);
  const spark = debrisPool(sc, 10, [0xffe08a, 0xffffff]);
  const crack = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 2.6), new THREE.MeshBasicMaterial({ map: canvasTex(640, 260, (g, w, h) => { g.strokeStyle = 'rgba(255,255,255,0.95)'; g.lineWidth = 2.2; const r2 = rnd(12); const cx = w * 0.5, cy = h * 0.35;
    for (let k = 0; k < 14; k++) { let x = cx, y = cy, a = k / 14 * 6.283 + r2() * 0.3; g.beginPath(); g.moveTo(x, y); for (let s = 0; s < 6; s++) { a += (r2() - 0.5) * 0.6; x += Math.cos(a) * (20 + r2() * 40); y += Math.sin(a) * (20 + r2() * 40); g.lineTo(x, y); } g.stroke(); }
    for (let r = 30; r < 160; r += 45) { g.beginPath(); for (let k = 0; k <= 14; k++) { const a = k / 14 * 6.283, rr2 = r * (0.8 + r2() * 0.4); g.lineTo(cx + Math.cos(a) * rr2, cy + Math.sin(a) * rr2 * 0.8); } g.stroke(); } }), transparent: true, opacity: 0, depthWrite: false, toneMapped: false }));
  crack.position.set(0.2, 2.6, -3.15); sc.add(crack);
  const smoke = [...Array(10)].map(() => { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), new THREE.MeshStandardMaterial({ color: 0x55555c, transparent: true, opacity: 0, roughness: 1, depthWrite: false })); m.castShadow = false; sc.add(m); return m; });
  const clipFly = loose(sc, (() => { const g = grp(); g.add(rbox(0.14, 0.34, 0.12, mat(0x2a2a30, { roughness: 0.3 }), 0, -0.06, 0)); g.add(rbox(0.16, 0.06, 0.12, mat(0xc9ced6, { metalness: 0.8, roughness: 0.2 }), 0, -0.25, 0)); return g; })());
  const combOut = loose(sc, combMesh());
  S.barber = { apron, sc, hero, chair, cape, barber, clip, hat, beam, pole, spark, crack, bottles, smoke, clipFly, combOut };
}
{ // ---- market from above (Day 6): stalls, traders, the giant afro's shadow
  const sc = new THREE.Scene(); sc.add(skyDome('#3f7fd0', '#a8d8f5', '#fff0cc', 180));
  const key = lightRig(sc, { sky: 0xe6f3ff, ground: 0xb0905a, hemi: 0.24, keyC: 0xfff2dc, key: 3.0, keyPos: [-40, 63, -29], target: [2, 0, 4], env: 0.18, R: 30, rim: 0.4, rimC: 0xffc080, rimPos: [20, 8, 20] }); key.shadow.mapSize.set(2048, 2048);
  sc.add(rbox(300, 0.3, 300, mat(0xcaa87a, { roughness: 0.95 }), 0, -0.15, 0)); sc.add(rbox(8, 0.04, 80, mat(0x59606e, { roughness: 0.7 }), -10, 0.02, 0));
  const canC = [0xe8343c, 0x1f8fe0, 0xffd23f, 0x2bb673, 0xff8a1f, 0x9b59d6, 0xf4f4f4]; const goods = [0xe8343c, 0xff8a1f, 0x2bb673, 0xffd23f, 0x8a5a2c];
  const stalls = []; for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) { const x = 1 + c * 3.2 + (r % 2) * 0.6, z = -2 + r * 3.4; const g = grp(x, 0, z, sc); g.userData = { home: V([x, 0, z]), r, c }; stalls.push(g); g.add(rbox(2.2, 0.9, 1.2, mat(0x8a5a2c, { roughness: 0.7 }), 0, 0.45, 0)); [-1, 1].forEach(sx => [-1, 1].forEach(sz => g.add(rbox(0.08, 2.2, 0.08, mat(0x6e4a2e), sx * 1.0, 1.1, sz * 0.55))));
    const roof = rbox(2.6, 0.08, 1.7, mat(canC[(r * 6 + c) % 7], { roughness: 0.6 }), 0, 2.25, 0); roof.rotation.x = 0.12; g.add(roof); for (let k = 0; k < 6; k++) g.add(ball(0.13, mat(goods[(k + c) % 5], { roughness: 0.4 }), -0.7 + k * 0.28, 0.98, (k % 2) * 0.2 - 0.1, undefined, 10)); }
  const bl = new THREE.InstancedMesh(rgeo(1, 1, 1), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 }), 260); bl.frustumCulled = false; const br = rnd(8), m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion();
  for (let i = 0; i < 260; i++) { let x = -90 + br() * 180, z = -90 + br() * 180; if (Math.abs(x - 4) < 16 && Math.abs(z - 4) < 14) x += x > 4 ? 16 : -16; if (x > -20 && z > -10) z -= 90; const h = 2 + br() * br() * 10, w = 2.4 + br() * 3; m4.compose(V([x, h / 2, z]), q4, V([w, h, w])); bl.setMatrixAt(i, m4); bl.setColorAt(i, new THREE.Color([0xe8d2a0, 0xd9c7a0, 0xf4a259, 0x7ec8e3, 0xe9c46a, 0xf08a8a, 0xffffff][Math.floor(br() * 7)])); } bl.castShadow = bl.receiveShadow = true; sc.add(bl);
  const traders = [...Array(10)].map((_, i) => { const P = npc(i); sc.add(P.root); const fan = grp(0, -0.5, 0.06, P.arms[1].el); fan.add(rbox(0.3, 0.36, 0.02, mat([0xffd23f, 0xe8343c, 0x2bb673][i % 3], { roughness: 0.6 }), 0, -0.2, 0)); P.fan = fan; return P; });
  const shade = new THREE.Mesh(new THREE.CircleGeometry(1, 48), new THREE.MeshBasicMaterial({ map: canvasTex(256, 256, (g) => { const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, 'rgba(10,14,40,1)'); gr.addColorStop(0.72, 'rgba(10,14,40,0.95)'); gr.addColorStop(1, 'rgba(10,14,40,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); }), transparent: true, opacity: 0.5, depthWrite: false, toneMapped: false }));
  shade.rotation.x = -Math.PI / 2; shade.position.y = 0.03; shade.renderOrder = 1; shade.visible = false; sc.add(shade);
  const hero = newHero(sc);
  S.market = { sc, hero, traders, key, shade, stalls };
}
{ // ---- news studio (Day 6)
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x0b1a3a);
  lightRig(sc, { sky: 0xdfe8ff, ground: 0x30406a, hemi: 0.6, keyC: 0xffffff, key: 1.4, keyPos: [2, 5, 7], target: [0, 1.6, 0], rim: 1.0, rimC: 0x6fb0ff, rimPos: [-5, 4, -4], env: 0.6, R: 8 });
  const scr = canvasTex(1024, 576, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#5fb0ff'); gr.addColorStop(1, '#ffe6b0'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = '#caa87a'; g.fillRect(0, h * 0.72, w, h);
    g.fillStyle = 'rgba(0,0,0,0.25)'; g.beginPath(); g.ellipse(w * 0.62, h * 0.82, w * 0.36, h * 0.09, 0, 0, 7); g.fill();
    g.fillStyle = '#e7b289'; g.fillRect(w * 0.27 - 22, h * 0.5, 44, 50); g.fillStyle = '#d7262e'; g.fillRect(w * 0.27 - 34, h * 0.58, 68, 90); g.fillStyle = '#2a1d17'; g.beginPath(); g.ellipse(w * 0.27, h * 0.3, 190, 150, 0, 0, 7); g.fill();
    for (let i = 0; i < 12; i++) { g.fillStyle = ['#e8343c', '#1f8fe0', '#ffd23f', '#2bb673'][i % 4]; g.fillRect(w * 0.48 + i * 38, h * 0.7, 30, 22); } });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 3.6), new THREE.MeshBasicMaterial({ map: scr, toneMapped: false })); screen.position.set(0, 2.9, -2.6); sc.add(screen); sc.add(rbox(6.7, 3.9, 0.1, mat(0x111827, { roughness: 0.3 }), 0, 2.9, -2.68));
  sc.add(rbox(16, 0.2, 10, mat(0x14244a, { roughness: 0.3, metalness: 0.2 }), 0, -0.1, 0));
  for (let i = 0; i < 7; i++) sc.add(rbox(0.12, 6, 0.12, mat(0x3a7ae0, { emissive: 0x3a7ae0, emissiveIntensity: 1.2 }), -7 + i * 2.33 + (i > 2 ? 2.3 : 0) * 0, 3, -3.4));
  const desk = grp(0, 0, 0.8, sc); desk.add(rbox(3.8, 1.0, 1.2, mat(0x1d2f5a, { roughness: 0.3, metalness: 0.3 }), 0, 0.5, 0)); desk.add(rbox(3.9, 0.08, 1.3, mat(0xdfe4ea, { roughness: 0.15, metalness: 0.6 }), 0, 1.02, 0)); desk.add(rbox(3.8, 0.12, 0.02, mat(0xe21e39, { emissive: 0xe21e39, emissiveIntensity: 0.8 }), 0, 0.6, 0.61));
  const anchor = makeRig({ hood: 0x23304f, hoodD: 0x1a2440, pants: 0x23304f, skin: 0x8d5a3b, hair: 0x15100d, noHood: true, tie: 0xe21e39 }); sc.add(anchor.root);
  desk.add(rbox(0.6, 0.02, 0.4, mat(0xffffff), 0.4, 1.07, 0.1));
  S.studio = { sc, anchor };
}
{ // ---- space (Days 7-9): little Earth, the hero on top, the Moon, Saturn, the galaxy afro
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x05061a);
  const domeT = (a, b, c) => canvasTex(8, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, a); gr.addColorStop(0.5, b); gr.addColorStop(1, c); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const night = new THREE.Mesh(new THREE.SphereGeometry(300, 32, 16), new THREE.MeshBasicMaterial({ map: domeT('#03041a', '#0b1440', '#1a2a6a'), side: THREE.BackSide, toneMapped: false, fog: false })); sc.add(night);
  const violet = new THREE.Mesh(new THREE.SphereGeometry(296, 32, 16), new THREE.MeshBasicMaterial({ map: domeT('#0a0620', '#2b1a6e', '#3A2BD9'), side: THREE.BackSide, toneMapped: false, fog: false, transparent: true, opacity: 0 })); sc.add(violet);
  const st = stars(1400, 280, 2.2, 77); sc.add(st);
  const hemi = new THREE.HemisphereLight(0xb7c6ff, 0x2a2a5a, 0.55); sc.add(hemi); sc.environment = ENV; sc.environmentIntensity = 0.45;
  const sunL = new THREE.DirectionalLight(0xfff0dc, 2.0); sunL.position.set(30, 20, 25); sunL.castShadow = true; sunL.shadow.mapSize.set(2048, 2048); Object.assign(sunL.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 160 }); sunL.shadow.camera.updateProjectionMatrix(); sunL.shadow.bias = -0.0004; sunL.shadow.normalBias = 0.03; sc.add(sunL);
  const rim = new THREE.DirectionalLight(0x9a7aff, 1.0); rim.position.set(-20, 8, -20); sc.add(rim);
  const eG = new THREE.IcosahedronGeometry(1, 4).toNonIndexed(); { const pos = eG.attributes.position, cols = [], v = new THREE.Vector3(); for (let i = 0; i < pos.count; i += 3) { v.set(pos.getX(i), pos.getY(i), pos.getZ(i)); const n = Math.sin(v.x * 3.1) + Math.sin(v.y * 2.7 + 1) + Math.sin(v.z * 3.7 + 2); const c = new THREE.Color(v.y > 0.86 || v.y < -0.86 ? 0xf4f8ff : n > 0.9 ? 0x3fae5a : n > 0.6 ? 0xd9c27a : 0x2a7fd8); for (let k = 0; k < 3; k++) cols.push(c.r, c.g, c.b); } eG.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); }
  const earth = new THREE.Mesh(eG, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.6 })); earth.scale.setScalar(6); earth.position.set(0, -6, 0); earth.receiveShadow = true; sc.add(earth);
  const atm = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex('rgba(120,190,255,0.0)', 'rgba(120,190,255,0.35)'), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); atm.scale.setScalar(17); atm.position.set(0, -6, 0); sc.add(atm);
  const hero = newHero(sc);
  const moon = moonMesh(1.3); sc.add(moon); const moonFace = grp(0, 0, 0, moon); for (const sx of [-1, 1]) { moonFace.add(rbox(0.16, 0.2, 0.04, mat(0x222222), sx * 0.28, 0.15, 0.97)); } moonFace.add(rbox(0.3, 0.2, 0.04, mat(0x3a1512), 0, -0.25, 0.96)); moonFace.scale.setScalar(1 / 1.0);
  const sat = grp(0, 0, 0, sc); const satT = canvasTex(64, 256, (g, w, h) => { const c = ['#f2d49b', '#e8b86a', '#f6e3b8', '#d9a35a', '#f2d49b', '#e9c78a', '#d6a25e', '#f6e3b8']; for (let i = 0; i < 8; i++) { g.fillStyle = c[i]; g.fillRect(0, i * 32, w, 32); } });
  const satB = new THREE.Mesh(new THREE.SphereGeometry(3.4, 40, 28), new THREE.MeshStandardMaterial({ map: satT, roughness: 0.6 })); satB.castShadow = true; sat.add(satB);
  const satFace = grp(0, 0, 0, sat); for (const sx of [-1, 1]) { satFace.add(rbox(0.6, 0.6, 0.1, mat(0xffffff, { roughness: 0.2 }), sx * 1.0, 0.6, 3.25)); const p = rbox(0.3, 0.38, 0.1, mat(0x15110f), sx * 1.0, 0.55, 3.33); satFace.add(p); const lid = rbox(0.66, 0.3, 0.12, mat(0xe8b86a), sx * 1.0, 0.82, 3.3); satFace.add(lid); }
  const satMouth = rbox(0.9, 0.18, 0.1, mat(0x5a2a12), 0, -0.6, 3.28); satFace.add(satMouth); const satO = rbox(0.6, 0.5, 0.1, mat(0x3a1512), 0, -0.6, 3.29); satO.visible = false; satFace.add(satO); [-1, 1].forEach(sx => satFace.add(ball(0.35, mat(0xff9a8a, { roughness: 0.6 }), sx * 1.7, -0.2, 2.9, undefined, 12)));
  const ringT = canvasTex(512, 8, (g, w, h) => { for (let x = 0; x < w; x++) { const u = x / w; const a = 0.35 + 0.55 * Math.abs(Math.sin(u * 40)) * (u > 0.08 ? 1 : 0); g.fillStyle = `rgba(${230 - 40 * Math.sin(u * 9)},${200 - 30 * Math.sin(u * 7)},${150},${a})`; g.fillRect(x, 0, 1, h); } });
  const ringG = new THREE.RingGeometry(1, 1.9, 96, 1); { const uv = ringG.attributes.uv, p = ringG.attributes.position; for (let i = 0; i < uv.count; i++) { const r = Math.hypot(p.getX(i), p.getY(i)); uv.setXY(i, (r - 1) / 0.9, 0.5); } }
  const rings = new THREE.Mesh(ringG, new THREE.MeshStandardMaterial({ map: ringT, transparent: true, side: THREE.DoubleSide, roughness: 0.5, depthWrite: false })); rings.renderOrder = 2; sc.add(rings);
  const galSkin = new THREE.Mesh(new THREE.SphereGeometry(1.06, 40, 28), new THREE.MeshBasicMaterial({ map: canvasTex(1024, 512, (g, w, h) => { g.fillStyle = '#0a0626'; g.fillRect(0, 0, w, h); const r2 = rnd(4); for (let i = 0; i < 1600; i++) { g.fillStyle = ['#ffffff', '#9ab4ff', '#ff9ad5', '#7affd9', '#ffd9a0'][Math.floor(r2() * 5)]; g.globalAlpha = 0.4 + r2() * 0.6; g.beginPath(); g.arc(r2() * w, r2() * h, 0.6 + r2() * 1.8, 0, 7); g.fill(); } g.globalAlpha = 1;
    for (let k = 0; k < 6; k++) { const cx = r2() * w, cy = 80 + r2() * (h - 160); const gr = g.createRadialGradient(cx, cy, 0, cx, cy, 90); gr.addColorStop(0, 'rgba(160,120,255,0.55)'); gr.addColorStop(1, 'rgba(60,40,200,0)'); g.fillStyle = gr; g.fillRect(cx - 90, cy - 90, 180, 180); } }), transparent: true, opacity: 0, toneMapped: false, depthWrite: false }));
  galSkin.position.set(0, 0.8, -0.2); galSkin.scale.set(1, 0.8, 1); hero.afroIn.add(galSkin);
  const galaxies = [['#9ab4ff', '#ffffff', 5], ['#ff9ad5', '#ffd9ff', 6], ['#7affd9', '#ffffff', 7], ['#ffc36a', '#fff0c0', 8], ['#c39aff', '#ffffff', 9]].map(([a, b, s]) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: galT(a, b, s), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, side: THREE.DoubleSide })); sc.add(m); return m; });
  const planets = [[0xe8603c, 1.0], [0x5ac8ff, 0.8], [0x7affd9, 0.6]].map(([c, r]) => { const m = ball(r, mat(c, { roughness: 0.5 }), 0, 0, 0, undefined, 24); sc.add(m); return m; });
  const satl = grp(0, 0, 0, sc); satl.add(rbox(0.9, 0.9, 1.2, mat(0xd4a017, { roughness: 0.3, metalness: 0.6 }))); [-1, 1].forEach(sx => { satl.add(rbox(1.8, 0.05, 0.8, mat(0x1f4fa0, { roughness: 0.2, metalness: 0.5 }), sx * 1.4, 0, 0)); satl.add(rbox(0.5, 0.06, 0.06, mat(0xc9ced6), sx * 0.6, 0, 0)); }); const dish = cone(0.4, 0.25, mat(0xf4f4f4), 0, 0.6, 0, 16); satl.add(dish); satl.visible = false;
  const rocks = [...Array(28)].map((_, i) => { const m = moonMesh(0.18 + (i % 4) * 0.08); m.material = new THREE.MeshStandardMaterial({ color: [0x8a7a6a, 0x6e6058, 0xa0907a][i % 3], flatShading: true, roughness: 0.9 }); m.visible = false; sc.add(m); return m; });
  const shoot = [0, 1, 2].map(() => { const m = new THREE.Mesh(new THREE.BoxGeometry(6, 0.08, 0.08), new THREE.MeshBasicMaterial({ color: 0xfff6d0, transparent: true, opacity: 0, toneMapped: false })); sc.add(m); return m; });
  const spDeb = debrisPool(sc, 14, [0xffe08a, 0xffffff, 0xd4a017]);
  S.space = { satl, rocks, shoot, spDeb, sc, hero, earth, atm, moon, sat, satB, satFace, satMouth, satO, rings, galSkin, galaxies, planets, night, violet, st, hemi, sunL };
}

// ---------------------------------------------------------------- v2 props: the date, the tools that double, the crew, the capsule
function hold(P, g, ai = 1, rx = -1.4) { g.position.set(0, -0.48, 0.04); g.rotation.x = rx; P.arms[ai].el.add(g); g.visible = false; return g; }
function brushMesh() { const g = grp(); g.add(rbox(0.08, 0.36, 0.06, mat(0x9b59d6, { roughness: 0.4 }), 0, 0, 0)); const hd = rbox(0.24, 0.12, 0.34, mat(0x9b59d6, { roughness: 0.4 }), 0, -0.24, 0.08); g.add(hd);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) g.add(rbox(0.02, 0.08, 0.02, mat(0x222222), -0.08 + i * 0.055, -0.3, -0.02 + j * 0.09)); return g; }
function rakeMesh() { const g = grp(); g.add(rbox(0.06, 2.2, 0.06, mat(0xb07a42, { roughness: 0.6 }), 0, -0.6, 0)); g.add(rbox(0.7, 0.08, 0.08, mat(0x8a8f98, { metalness: 0.7, roughness: 0.3 }), 0, -1.7, 0));
  for (let i = 0; i < 8; i++) g.add(rbox(0.03, 0.22, 0.03, mat(0x8a8f98, { metalness: 0.7, roughness: 0.3 }), -0.31 + i * 0.089, -1.82, 0.04)); return g; }
function trimmerMesh() { const g = grp(); g.add(rbox(0.22, 0.24, 0.42, mat(0xffd23f, { roughness: 0.4 }), 0, 0, 0)); g.add(rbox(0.06, 0.06, 1.1, mat(0xc9ced6, { metalness: 0.8, roughness: 0.25 }), 0, 0, 0.75));
  for (let i = 0; i < 9; i++) g.add(rbox(0.16, 0.02, 0.04, mat(0xc9ced6, { metalness: 0.8, roughness: 0.25 }), 0, 0, 0.32 + i * 0.11)); return g; }
function blowerMesh() { const g = grp(); g.add(rbox(0.3, 0.32, 0.46, mat(0xff8a1f, { roughness: 0.4 }), 0, 0, 0)); const tb = cyl(0.08, 0.1, 1.1, mat(0x2a2a30, { roughness: 0.5 }), 0, 0, 0.7, 12); tb.rotation.x = Math.PI / 2; g.add(tb); return g; }
function keysMesh() { const g = grp(); g.add(new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.012, 6, 16), mat(0xd4a017, { metalness: 0.8, roughness: 0.3 }))); [0, 1].forEach(i => { const k = rbox(0.03, 0.16, 0.01, mat(0xd4a017, { metalness: 0.8, roughness: 0.3 }), -0.03 + i * 0.06, -0.12, 0); k.rotation.z = (i - 0.5) * 0.4; g.add(k); }); return g; }
function nestMesh() { const g = grp(); const tw = mat(0x8a6238, { roughness: 0.9 }); const ring = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.14, 8, 18), tw); ring.rotation.x = Math.PI / 2; ring.castShadow = true; g.add(ring); g.add(cyl(0.4, 0.3, 0.1, tw, 0, -0.08, 0, 16));
  [[-0.12, 0.05], [0.08, -0.1], [0.12, 0.12]].forEach(([x, z]) => { const e = ball(0.08, mat(0xdfeeff, { roughness: 0.4 }), x, 0.02, z, undefined, 12); e.scale.y = 1.3; g.add(e); });
  const sofa = grp(-0.18, 0.02, -0.18, g); sofa.add(rbox(0.26, 0.07, 0.12, mat(0xe8343c))); sofa.add(rbox(0.26, 0.12, 0.04, mat(0xe8343c), 0, 0.07, -0.05));
  const tv = grp(0.2, 0.08, -0.2, g); tv.add(rbox(0.2, 0.14, 0.05, mat(0x1a1a1a))); tv.add(rbox(0.16, 0.1, 0.01, mat(0x5ac8ff, { emissive: 0x5ac8ff, emissiveIntensity: 0.8 }), 0, 0, 0.03)); return g; }
function ladderMesh(h) { const g = grp(); [-0.35, 0.35].forEach(x => g.add(rbox(0.08, h, 0.08, mat(0xc9ced6, { metalness: 0.6, roughness: 0.4 }), x, h / 2, 0))); for (let y = 0.4; y < h; y += 0.5) g.add(rbox(0.7, 0.05, 0.05, mat(0xc9ced6, { metalness: 0.6, roughness: 0.4 }), 0, y, 0)); return g; }
function mowerMesh() { const g = grp(); g.add(rbox(0.9, 0.35, 1.2, mat(0x2bb673, { roughness: 0.4 }), 0, 0.3, 0)); g.add(rbox(0.5, 0.35, 0.4, mat(0x1f1f24), 0, 0.6, -0.25)); [[-0.45, -0.45], [0.45, -0.45], [-0.45, 0.45], [0.45, 0.45]].forEach(([x, z]) => { const w = cyl(0.16, 0.16, 0.1, mat(0x111111), x, 0.16, z, 12); w.rotation.z = Math.PI / 2; g.add(w); }); return g; }
const letterTex = (ch) => canvasTex(256, 256, (g) => { g.fillStyle = '#d9a46a'; g.font = '900 230px Montserrat, Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ch, 128, 140); });
{ // bedroom: the calendar with SATURDAY, the heart, the hairbrush
  const R = S.room, sc = R.sc;
  const cal = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.7), new THREE.MeshStandardMaterial({ roughness: 0.8, map: canvasTex(300, 340, (g, w, h) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); g.fillStyle = '#E21E39'; g.fillRect(0, 0, w, 64); g.fillStyle = '#fff'; g.font = '700 40px InterW, Arial'; g.textAlign = 'center'; g.fillText('THIS WEEK', w / 2, 46);
    const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SATURDAY', 'SUN']; days.forEach((d, i) => { g.fillStyle = i === 5 ? '#111' : '#777'; g.font = (i === 5 ? '800 30px' : '600 22px') + ' InterW, Arial'; g.textAlign = 'left'; g.fillText(d, 24, 104 + i * 36); g.fillStyle = '#ddd'; g.fillRect(16, 112 + i * 36, w - 32, 2); }); }) }));
  cal.position.set(0.95, 2.55, -3.03); sc.add(cal);
  const heart = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.55), new THREE.MeshBasicMaterial({ transparent: true, toneMapped: false, depthWrite: false, map: canvasTex(280, 110, (g, w, h) => { g.strokeStyle = '#E21E39'; g.lineWidth = 7; g.beginPath(); g.ellipse(w / 2, h / 2, w / 2 - 8, h / 2 - 8, -0.05, 0, 7); g.stroke(); g.fillStyle = '#E21E39'; g.font = '800 30px InterW, Arial'; g.fillText('DATE ♥', w - 120, h - 16); }) }));
  heart.position.set(0.98, 2.27, -3.0); sc.add(heart);
  R.heart = heart; R.brush = hold(R.hero, brushMesh(), 1, -1.6); R.burp = debrisPool(sc, 8, [0x9b59d6, 0x222222]);
}
{ // street: rake + nest, leaf blower, wind, the ice-cream kid
  const s = S.street, sc = s.sc;
  s.rake = hold(s.hero, rakeMesh(), 1, -0.3); s.nest = nestMesh(); s.nest.visible = false; sc.add(s.nest); s.blower = hold(s.hero, blowerMesh(), 1, -1.3);
  s.wind = [...Array(26)].map(() => { const m = rbox(0.4, 0.03, 0.03, mat(0xffffff, { transparent: true, opacity: 0.6 })); m.castShadow = false; m.visible = false; sc.add(m); return m; });
  const cone2 = grp(0, -0.5, 0.08, s.kid.arms[1].el); cone2.add(cone(0.09, 0.3, mat(0xd9a05a), 0, -0.05, 0, 12)); cone2.rotation.x = Math.PI; const scoop = ball(0.12, mat(0xff9ad5, { roughness: 0.5 }), 0, -0.2, 0, undefined, 12); cone2.add(scoop); s.scoop = scoop; s.scoopFly = loose(sc, ball(0.12 * 0.62, mat(0xff9ad5, { roughness: 0.5 }), 0, 0, 0, undefined, 12));
}
{ // barbershop: hedge trimmer, apron, keys
  const b = S.barber; b.trimmer = hold(b.barber, trimmerMesh(), 1, -1.5); 
  b.keys = hold(b.hero, keysMesh(), 1, 0); b.apronFly = loose(b.sc, rbox(0.82, 0.5, 0.05, mat(0x1f8fe0, { roughness: 0.6 })));
}
{ // city: ladders, mower crew, HELP mown into the afro
  const m = S.market, sc = m.sc; m.stalls.forEach(g => g.visible = true);
  m.ladders = [0, 1, 2].map(() => { const l = ladderMesh(14); l.visible = false; sc.add(l); return l; });
  m.climbers = [0, 1, 2].map(i => { const P = npc(i + 3, { hood: 0xff8a1f, hoodD: 0xff8a1f }); T(P.head, rbox(0.72, 0.16, 0.66, mat(0xffd23f), 0, 0.72, 0)); sc.add(P.root); return P; });
  m.mowers = [0, 1, 2].map(i => { const g = mowerMesh(); const P = npc(i + 5, { hood: 0xff8a1f, hoodD: 0xff8a1f }); P.root.scale.setScalar(0.8); P.root.position.set(0, 0.25, 0.1); g.add(P.root); g.rider = P; g.visible = false; sc.add(g); return g; });
  // HELP letters draw on top (depthTest off): the afro's bumps poke above the mown layer
  m.letters = 'HELP'.split('').map((ch, i) => { const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.4), new THREE.MeshBasicMaterial({ map: letterTex(ch), transparent: true, depthWrite: false, depthTest: false })); pl.rotation.x = -Math.PI / 2; pl.position.set(-0.57 + i * 0.38, 1.95, -0.2); pl.renderOrder = 3; m.hero.afroIn.add(pl); pl.visible = false; return pl; });
  const scr = S.studio.sc.children.find(c => c.isMesh && c.material.isMeshBasicMaterial && c.geometry.type === 'PlaneGeometry' && c.geometry.parameters.width === 6.4);
  scr.material.map = canvasTex(1024, 576, (g, w, h) => { g.fillStyle = '#7fb26a'; g.fillRect(0, 0, w, h); g.fillStyle = '#4a3022'; g.beginPath(); g.arc(w / 2, h / 2, 250, 0, 7); g.fill(); g.fillStyle = '#d9a46a'; g.font = '900 170px Montserrat, Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('HELP', w / 2, h / 2 + 10);
    g.fillStyle = '#E21E39'; g.fillRect(24, 24, 230, 52); g.fillStyle = '#fff'; g.font = '800 34px InterW, Arial'; g.textAlign = 'left'; g.fillText('AERIAL', 44, 62); });
}
{ // space: rocket + giant comb, planet beads, the Earth-top date table, the date on her own planet
  const s = S.space, sc = s.sc;
  const rocket = grp(0, 0, 0, sc); rocket.add(cyl(0.5, 0.5, 2.4, mat(0xf4f4f4, { roughness: 0.3 }), 0, 1.2, 0, 20)); rocket.add(cone(0.5, 0.9, mat(0xe8343c, { roughness: 0.3 }), 0, 2.85, 0, 20)); [0, 2.1, 4.2].forEach(a => { const f = rbox(0.08, 0.7, 0.6, mat(0xe8343c), Math.cos(a) * 0.5, 0.35, Math.sin(a) * 0.5); f.rotation.y = -a; rocket.add(f); });
  const flame = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex('rgba(255,240,180,1)', 'rgba(255,120,30,0.7)'), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); flame.scale.set(1.2, 2.4, 1); flame.position.y = -0.8; rocket.add(flame); rocket.visible = false;
  const comb = combMesh(); comb.scale.setScalar(9); rocket.add(comb); comb.position.set(0, 4.8, 0); comb.rotation.set(0, 0, Math.PI); s.rocket = rocket; s.bigComb = comb;
  s.beads = [0xe8603c, 0x5ac8ff, 0x7affd9, 0xffd23f, 0xc39aff].map((c, i) => { const m = ball(0.9, mat(c, { roughness: 0.4 }), 0, 0, 0, undefined, 20); m.visible = false; sc.add(m); return m; });
  const table = grp(0, -0.04, 0, sc); table.add(cyl(0.5, 0.5, 0.05, mat(0xf4f4f4, { roughness: 0.3 }), 0, 1.2, 0, 24)); table.add(cyl(0.06, 0.06, 1.2, mat(0xc9ced6, { metalness: 0.7 }), 0, 0.6, 0, 10)); table.add(cyl(0.05, 0.05, 0.28, mat(0xfff2d0), 0.1, 1.37, 0.05, 10));
  const fl = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex('rgba(255,250,210,1)', 'rgba(255,170,60,0.6)'), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); fl.scale.set(0.25, 0.4, 1); fl.position.set(0.1, 1.6, 0.05); table.add(fl);
  table.add(cyl(0.012, 0.012, 0.4, mat(0x2bb673), -0.15, 1.4, -0.05, 6)); table.add(ball(0.06, mat(0xe8343c, { roughness: 0.5 }), -0.15, 1.62, -0.05, undefined, 10));
  s.chairs = [-1, 1].map(sx => { const c = grp(sx * 0.95, -0.04, 0, sc); c.add(rbox(0.6, 0.07, 0.6, mat(0xe8343c, { roughness: 0.4 }), 0, 0.8, 0)); c.add(rbox(0.07, 0.75, 0.6, mat(0xe8343c, { roughness: 0.4 }), sx * 0.28, 1.15, 0)); [[-0.25, -0.25], [0.25, -0.25], [-0.25, 0.25], [0.25, 0.25]].forEach(([x, z]) => c.add(rbox(0.05, 0.8, 0.05, mat(0xc9ced6), x, 0.4, z))); c.visible = false; return c; });
  table.visible = false; s.table = table;
  const dp = grp(0, 0, 0, sc); const pg = new THREE.IcosahedronGeometry(1, 3).toNonIndexed(); { const pos = pg.attributes.position, cols = [], r2 = rnd(19); for (let i = 0; i < pos.count; i += 3) { const c = new THREE.Color([0xff9ad5, 0xc39aff, 0xffb6e1][Math.floor(r2() * 3)]); for (let k = 0; k < 3; k++) cols.push(c.r, c.g, c.b); } pg.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); }
  const planet = new THREE.Mesh(pg, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.6 })); planet.scale.setScalar(6); planet.position.y = -6; planet.receiveShadow = true; dp.add(planet);
  const date = makeRig({ hood: 0xff5c8a, hoodD: 0xd6457f, pants: 0x2d3a63, skin: 0x8d5a3b, hair: 0x2a1d17, noHood: true, hairStyle: 'none', afro: true, afroC: 0x3a2418, afroC2: 0x4a2c1e }); dp.add(date.root);
  [-1, 1].forEach(sx => date.head.add(ball(0.06, mat(0xffd23f, { metalness: 0.7, roughness: 0.3 }), sx * 0.35, 0.2, 0.02, undefined, 10))); date.head.add(rbox(0.2, 0.05, 0.02, mat(0xd6457f), 0, 0.15, 0.31));
  const dSkin = new THREE.Mesh(new THREE.SphereGeometry(1.06, 40, 28), new THREE.MeshBasicMaterial({ map: s.galSkin.material.map, color: 0xffb0e0, transparent: true, opacity: 0.85, toneMapped: false, depthWrite: false })); dSkin.position.set(0, 0.8, -0.2); dSkin.scale.set(1, 0.8, 1); date.afroIn.add(dSkin);
  dp.visible = false; s.datePlanet = dp; s.date = date;
}
{ // ---- capsule interior (Day 7): astronaut at the round window, the Moon stuck in the comb outside
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x10141f);
  lightRig(sc, { sky: 0xdfe8ff, ground: 0x30384a, hemi: 0.6, keyC: 0xfff4e0, key: 1.3, keyPos: [2, 4, 5], target: [0, 1.6, 0], rim: 0.9, rimC: 0x9fd0ff, rimPos: [-3, 3, -4], env: 0.5, R: 6 });
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.2, 6, 24, 1, true), new THREE.MeshStandardMaterial({ color: 0xc9ced6, roughness: 0.6, side: THREE.BackSide })); wall.position.y = 2; wall.receiveShadow = true; sc.add(wall);
  sc.add(rbox(7, 0.2, 7, mat(0x4a505c, { roughness: 0.7 }), 0, -0.1, 0)); for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283; const p = rbox(0.5, 0.3, 0.1, mat([0x2bd96b, 0xffb020, 0x5ac8ff][i % 3], { emissive: [0x2bd96b, 0xffb020, 0x5ac8ff][i % 3], emissiveIntensity: 0.9 }), Math.sin(a) * 3.1, 1.2 + (i % 2) * 1.6, Math.cos(a) * 3.1); p.lookAt(0, p.position.y, 0); sc.add(p); }
  const view = canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#05061a'; g.fillRect(0, 0, w, h); const r2 = rnd(3); for (let i = 0; i < 260; i++) { g.fillStyle = '#fff'; g.globalAlpha = 0.4 + r2() * 0.6; g.fillRect(r2() * w, r2() * h, 2, 2); } g.globalAlpha = 1;
    g.fillStyle = '#4a3022'; g.beginPath(); g.arc(80, 520, 300, 0, 7); g.fill(); g.fillStyle = '#ffd23f'; g.save(); g.translate(300, 230); g.rotate(-0.5); g.fillRect(-150, -18, 300, 36); for (let i = 0; i < 9; i++) g.fillRect(-140 + i * 34, 18, 12, 90); g.restore();
    const mg = g.createRadialGradient(330, 250, 10, 330, 270, 95); mg.addColorStop(0, '#f4f4f8'); mg.addColorStop(1, '#a9a9b4'); g.fillStyle = mg; g.beginPath(); g.arc(330, 270, 90, 0, 7); g.fill(); g.fillStyle = '#8a8a96'; [[300, 250, 16], [360, 300, 12], [340, 230, 9]].forEach(([x, y, r]) => { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }); });
  const win = new THREE.Mesh(new THREE.CircleGeometry(1.1, 40), new THREE.MeshBasicMaterial({ map: view, toneMapped: false })); win.position.set(0.9, 2.3, -3.05); sc.add(win);
  const rimW = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.12, 10, 40), mat(0x8a8f98, { metalness: 0.7, roughness: 0.3 })); rimW.position.copy(win.position); sc.add(rimW);
  const astro = makeRig({ hood: 0xe9ecf1, hoodD: 0xc9ced8, pants: 0xdfe3ea, skin: 0x8d5a3b, hair: 0x15100d, noHood: true, helmet: true, pack: true, shoe: 0xdddddd }); sc.add(astro.root); astro.spine.add(rbox(0.18, 0.12, 0.03, mat(0x1f8fe0), 0.22, 0.62, 0.245));
  S.capsule = { sc, astro, win };
}

// ---------------------------------------------------------------- shot system + shared animation helpers
const cam = new THREE.PerspectiveCamera(40, W / H, 0.05, 1000);
const shots = []; const shot = (t0, t1, scene, camA, setup, fx = {}) => shots.push({ t0, t1, scene, cam: camA, setup, ...fx });
const shake = (O, t0, amt, dur = 0.45) => { const k = clamp(1 - (O - t0) / dur); return O < t0 || k <= 0 ? 0 : amt * k * k; };
function resetRig(P) { P.root.position.set(0, 0, 0); P.root.rotation.set(0, 0, 0); P.root.scale.setScalar(1); P.root.visible = true; P.glasses.visible = false; }
function talking(speaker, O) { return DIALOGUE.some(c => c.speaker === speaker && c.kind !== 'shout' && spanHit(c, O)); }
const wp = (o) => { const v = new THREE.Vector3(); o.updateWorldMatrix(true, false); return o.getWorldPosition(v); };
const ST = STEPS.map(s => s.t);
// afro radius between two days: squash anticipation (0.25 s) then elastic pop
function grow(O, t, r0, r1) { const ant = seg(O, t - 0.25, t), pop = elastic(seg(O, t, t + 0.8)); return { R: O < t ? r0 : lerp(r0, r1, pop), sq: O < t ? eIn(ant) : Math.max(0, 1 - seg(O, t, t + 0.12)) }; }
function afro(P, O, g) { P.setAfro(g.R, O, g.sq); }
// hero body anticipation + pop on every doubling
function popPose(O, t, base = {}) { const ant = seg(O, t - 0.25, t), pop = seg(O, t, t + 0.45), s = Math.sin(pop * Math.PI);
  return { ...base, bob: (base.bob || 0) - 0.12 * ant * (1 - pop) + 0.08 * s, spineX: (base.spineX || 0) + 0.18 * ant * (1 - pop) - 0.2 * s, headX: (base.headX || 0) - 0.25 * s,
    arms: O < t ? [[-0.3 * ant, 0, 0.2, 0.9 * ant], [-0.3 * ant, 0, -0.2, 0.9 * ant]] : [[-0.2 - 0.5 * s, 0, 0.5 + 1.3 * s, 0.4], [-0.2 - 0.5 * s, 0, -0.5 - 1.3 * s, 0.4]],   // arms fling out sideways, never across the face
    legs: [[0.25 * ant * (1 - pop), 0.5 * ant * (1 - pop)], [0.25 * ant * (1 - pop), 0.5 * ant * (1 - pop)]] }; }
function hp(P, O, pos, ry, p, expr, who = 'hero') { P.root.visible = true; P.root.position.set(...pos); P.root.rotation.set(0, ry, 0); pose(P, p); P.face(expr, O, talking(who, O)); }
const SIT = { bob: 0.07, legs: [[1.5, 1.45], [1.5, 1.45]] };
function afroPt(P, x, y, z, d = 1.0) { const v = V([x, y, z]).normalize(); const o = new THREE.Object3D(); o.position.set(v.x * d, 0.8 + v.y * 0.8 * d, -0.2 + v.z * d); P.afroIn.add(o); return o; }
// combing arm (right) — stroke through the afro
const combArm = (O, sp = 5) => [-3.0 + 0.1 * Math.sin(O * sp), 0, -0.3, 1.3 + 0.3 * Math.sin(O * sp)];   // hand over the top of the head, never across the face
// ballistic throw that lands and rests on the floor
function fling(m, home, O, t0, v, spin = [0, 0, 0], floor = 0.06) { m.visible = true; if (O < t0) { m.position.copy(home); m.rotation.set(0, 0, 0); return; }
  const tl = (v[1] + Math.sqrt(v[1] * v[1] + 19.6 * Math.max(0, home.y - floor))) / 9.8, t = Math.min(O - t0, tl);
  m.position.set(home.x + v[0] * t, home.y + v[1] * t - 4.9 * t * t, home.z + v[2] * t); m.rotation.set(spin[0] * t, spin[1] * t, spin[2] * t); }
function arcTo(m, a, b, k, h = 1, spin = 0) { m.visible = true; m.position.copy(a.clone().lerp(b, k)); m.position.y += Math.sin(k * Math.PI) * h; m.rotation.set(spin * k, spin * 0.7 * k, 0); }
const afroC = (P) => wp(P.afroIn.children[0]);

// ===== v2 script. TITLE + DAY 1 + DAY 2 (bedroom) =====
const RM = S.room;
function roomBase(O) { const R = RM; resetRig(R.hero); R.hero.comb.visible = O < 6.2; R.brush.visible = O >= 6.9 && O < 7.75;
  R.flyers.forEach((m, i) => fling(m, R.flyHome[i], O, 6.22 + i * 0.03, [[1.2, 2.6, 0.9], [1.6, 3.0, 0.5], [0.9, 2.2, 1.3]][i], [[6, 2, 4], [5, 3, 7], [3, 4, 2]][i]));   // Day 2 shockwave
  R.combFly.visible = false; R.sockM.visible = false; R.remoteM.visible = false; R.burp.forEach(d => d.m.visible = false);
  const hk = eOut(seg(O, 0.55, 1.35)); R.heart.scale.set(Math.max(0.001, hk), Math.max(0.001, hk), 1); R.heart.visible = hk > 0.01; return R.hero; }
const d2 = (O) => grow(O, ST[1], 0.5, 0.75);
const burpSq = (O) => { const k = seg(O, 9.1, 9.6); return k > 0 && k < 1 ? -1.1 * Math.sin(k * Math.PI) * (1 - k) : 0; };   // the afro burps
function wink(P, O, t0, t1) { if (O < t0 || O > t1) return; P.lids[1].scale.y = 1; P.lids[1].position.y = 0.37; }
// title: he circles SATURDAY on the calendar
shot(0, 1.6, 'room', { p0: [3.0, 2.4, 5.0], p1: [2.3, 2.45, 3.6], l0: [0.6, 2.4, -2.4], fov: 40, ease: 'io' }, (lt, O) => {
  const h = roomBase(O); afro(h, O, { R: 0.5, sq: 0 }); const dr = Math.sin(O * 7) * 0.12 * seg(O, 0.5, 0.7) * (1 - seg(O, 1.3, 1.45));
  hp(h, O, [0.05, 0, -2.2], Math.PI - 0.75, { ...idle(O), headY: 0.95, arms: [[-1.75 + dr, 0, 0.55 + dr, 0.35], [0.05, 0, -0.14, 0.2]] }, 'smirk'); }, { grade: 'dawn', dof: 0.2 });
shot(1.6, 3.0, 'room', { p0: [-0.9, 2.0, 4.2], p1: [-0.7, 2.05, 3.5], l0: [0, 2.35, 0.6], fov: 40 }, (lt, O) => {
  const h = roomBase(O); afro(h, O, { R: 0.5, sq: 0 }); hp(h, O, [0, 0, 0.6], -0.2, { ...idle(O), headZ: 0.06 * Math.sin(O * 6), arms: [[0.05, 0, 0.14, 0.2], combArm(O, 6)] }, 'smirk'); }, { grade: 'warm', dof: 0.3 });
// Day 1: "Date. On Saturday... Easy." + wink
shot(3.0, 4.6, 'room', { p0: [0.4, 2.0, 4.7], p1: [0.25, 2.1, 4.0], l0: [0, 2.3, 0.6], fov: 40, flash: 3.0 }, (lt, O) => {
  const h = roomBase(O); afro(h, O, { R: 0.5, sq: 0 }); hp(h, O, [0, 0, 0.6], -0.1, { ...idle(O), spineX: -0.05, headZ: 0.06, arms: [[0.05, 0, 0.14, 0.2], [-0.55 + 0.1 * Math.sin(O * 4), 0, -0.95, 0.5]] }, 'smirk'); }, { grade: 'warm', dof: 0.25 });
shot(4.6, 6.2, 'room', { p0: [0.6, 2.25, 3.7], p1: [0.5, 2.28, 3.2], l0: [0, 2.4, 0.6], fov: 38 }, (lt, O) => {
  const h = roomBase(O); afro(h, O, d2(O)); hp(h, O, [0, 0, 0.6], -0.15, popPose(O, ST[1], { ...idle(O), headZ: 0.08, headY: 0.15 }), 'smirk'); wink(h, O, 5.35, 5.75); }, { grade: 'warm', dof: 0.35 });
// Day 2: pop, the hairbrush gets eaten, the hand comes back, the afro burps
shot(6.2, 6.8, 'room', { p0: [0.5, 2.3, 3.8], p1: [0.35, 2.35, 3.1], l0: [0, 2.45, 0.6], fov: 40, z0: 1.0, z1: 1.25, roll0: -3, roll1: 4, ease: 'lin' }, (lt, O) => {
  const h = roomBase(O); afro(h, O, d2(O)); hp(h, O, [0, 0, 0.6], -0.1, popPose(O, ST[1]), 'shock'); }, { grade: 'warm', flash: 6.2, shakeAt: [[6.22, 0.07]] });
function brushArm(O) { const up = eIO(seg(O, 6.9, 7.3)), in_ = seg(O, 7.6, 8.6), out = elastic(seg(O, 8.6, 9.1)), w = Math.sin(O * 13) * 0.12 * in_ * (O < 8.6 ? 1 : 0);
  if (O < 7.6) return [lerp(0.05, -3.0, up), 0, lerp(-0.14, -0.3, up), lerp(0.2, 1.3, up)];
  if (O < 8.6) return [-3.1 + w, 0, -0.1 + w, 0.1]; return [lerp(-3.1, 0.05, out), 0, lerp(-0.1, -0.25, out), 0.2]; }
function brushPose(O, base = {}) { const pull = O >= 7.6 && O < 8.6 ? 1 : 0; return { ...idle(O), ...base, bob: (base.bob || 0) + 0.12 * pull + 0.03 * Math.sin(O * 13) * pull, spineZ: 0.1 * Math.sin(O * 9) * pull, spineX: O > 8.6 && O < 9.1 ? -0.2 * (1 - seg(O, 8.6, 9.1)) : 0,
  headX: (base.headX || 0) + (O > 9.2 ? -0.32 : -0.15), arms: [[0.05, 0, 0.3 + 0.3 * pull, 0.2], brushArm(O)], legs: pull ? [[0, 0.15], [0, 0.15]] : [[0, 0], [0, 0]] }; }
const burpFx = (h, O) => { if (O > 9.15) burst(RM.burp, O, 9.2, afroC(h).add(V([0, 0.5, 0.4])), 1.4, 1.6); };
shot(6.8, 8.0, 'room', { ease: 'lin', p0: [0.2, 2.45, 6.8], p1: [0.8, 2.75, 5.3], l0: [-0.2, 1.9, -0.6], fov: 50 }, (lt, O) => {
  const h = roomBase(O); afro(h, O, d2(O)); hp(h, O, [0, 0, 0.6], 0.05, brushPose(O), O < 7.6 ? 'smirk' : 'grit'); }, { grade: 'warm' });
shot(8.0, 9.6, 'room', { ease: 'lin', p0: [0.9, 2.4, 4.4], p1: [0.6, 2.5, 3.7], l0: [0, 2.7, 0.6], fov: 42 }, (lt, O) => {
  const h = roomBase(O); const g = d2(O); h.setAfro(g.R, O, burpSq(O)); hp(h, O, [0, 0, 0.6], 0.1, brushPose(O), O < 8.6 ? 'grit' : O < 9.15 ? 'shock' : 'confused'); burpFx(h, O); }, { grade: 'warm', dof: 0.25 });
shot(9.6, 12.0, 'room', { ease: 'lin', p0: [0.4, 1.95, 5.0], p1: [0.3, 2.0, 4.2], l0: [0, 2.0, 0.6], fov: 42 }, (lt, O) => {
  const h = roomBase(O); afro(h, O, grow(O, ST[2], 0.75, 0.75)); hp(h, O, [0, 0, 0.6], 0.05, popPose(O, ST[2], { ...idle(O), headX: -0.3, headZ: -0.06, arms: [[0.05, 0, 0.14, 0.2], [-0.4, 0, -0.5, 1.2]] }), 'confused'); burpFx(h, O); }, { grade: 'warm', dof: 0.3 });

// ===== DAY 3 (front yard): the rake pulls out a bird's nest =====
const STR = S.street, NEST_PT = afroPt(STR.hero, 0.55, 0.75, 0.55, 0.9);
function streetBase(O) {
  const s = STR; resetRig(s.hero); [s.hero.comb, s.rake, s.blower, s.line, s.ballF, s.slipper, s.twig, s.string, s.nest, s.scoopFly].forEach(m => m.visible = false); s.kid.root.visible = false;
  s.birds.forEach(b => b.visible = false); s.kites.forEach(k => k.visible = false); s.wind.forEach(m => m.visible = false);
  s.people.forEach((P, i) => { resetRig(P); const x = ((O * 0.9 * (i % 2 ? 1 : -1) + i * 9) % 40 + 40) % 40 - 20; P.root.position.set(x, 0, -4.6 - (i % 2) * 1.2); P.root.rotation.y = i % 2 ? Math.PI / 2 : -Math.PI / 2; pose(P, walk(O + i, 7, 0.8)); P.face('calm', O); });
  return s.hero;
}
const d3 = (O) => grow(O, ST[2], 0.75, 1.0);
function rakeArm(O) { const up = eIO(seg(O, 12.9, 13.5)), pull = eIO(seg(O, 13.7, 14.5)), w = Math.sin(O * 14) * 0.1 * seg(O, 13.5, 13.7) * (1 - pull);
  return [lerp(lerp(-0.4, -2.7, up), -1.35, pull) + w, 0, lerp(-0.2, -0.85, pull), lerp(0.3, 0.25, up)]; }
function nestOn(O) { const s = STR; if (O < 13.7) return; s.nest.visible = true; const head = s.rake.localToWorld(V([0, -1.85, 0.12])); const k = seg(O, 13.7, 14.5);
  s.nest.position.copy(wp(NEST_PT).lerp(head.add(V([0, 0.2, 0])), eIO(k))); s.nest.rotation.set(0.15 * Math.sin(O * 3), 0.6, 0); s.nest.scale.setScalar(1.2);
  const b = s.birds[0]; b.visible = O > 14.75; if (b.visible) { const up = elastic(seg(O, 14.75, 15.1)); b.position.copy(s.nest.position).add(V([0, -0.15 + 0.35 * up, 0.05])); b.rotation.set(0, 0.35, 0); b.scale.setScalar(1.5); birdAnim(b, O, 0, talking('bird', O), false);
    b.userData.wings.forEach((wg, i) => wg.rotation.z = (i ? 1 : -1) * (0.9 + 0.1 * Math.sin(O * 5))); } }
shot(12.0, 13.2, 'street', { p0: [0, 2.4, 5.4], p1: [0.6, 2.9, 8.6], l0: [0, 2.6, 0], l1: [0, 3.0, 0], fov: 42 }, (lt, O) => {
  const h = streetBase(O); afro(h, O, d3(O)); STR.rake.visible = O > 12.5; hp(h, O, [0, 0, 0.5], 0, O < 12.5 ? popPose(O, ST[2]) : { ...idle(O), arms: [[0.05, 0, 0.14, 0.2], rakeArm(O)] }, O < 12.6 ? 'shock' : 'grit'); }, { grade: 'street', flash: 12.0, shakeAt: [[12.02, 0.06]] });
shot(13.2, 14.8, 'street', { p0: [4.8, 2.4, 4.8], p1: [4.3, 2.5, 4.3], l0: [0.6, 2.6, 0.6], fov: 46, ease: 'lin' }, (lt, O) => {
  const h = streetBase(O); afro(h, O, d3(O)); STR.rake.visible = true; hp(h, O, [0, 0, 0.5], 0.45, { ...idle(O), spineX: -0.1 * seg(O, 13.7, 14.4), arms: [[-0.5, 0, 0.2, 0.9], rakeArm(O)] }, O < 14.4 ? 'grit' : 'shock'); nestOn(O); }, { grade: 'street', dof: 0.2 });
shot(14.8, 17.6, 'street', { pf: () => STR.nest.position.clone().add(V([1.9, 0.4, 3.0])), lf: () => STR.nest.position.clone().lerp(wp(STR.hero.head), 0.45).add(V([0, 0.3, 0])), fov: 40, ease: 'lin', z0: 1, z1: 1.08 }, (lt, O) => {
  const h = streetBase(O); afro(h, O, grow(O, ST[3], 1.0, 1.0)); STR.rake.visible = true; hp(h, O, [0, 0, 0.5], 0.45, { ...idle(O), headY: 0.35, arms: [[-0.5, 0, 0.2, 0.9], rakeArm(O)] }, 'shock'); nestOn(O); }, { grade: 'street', dof: 0.25 });

// ===== DAY 4 (barbershop): hedge trimmer jams; the barber hands over the keys and leaves =====
const BAR = S.barber;
function barberBase(O) {
  const b = BAR; resetRig(b.hero); b.hero.comb.visible = false; b.chair.position.set(0, 0, 0); b.cape.position.set(0, 1.32, 0.12); b.cape.scale.set(1, 1, 0.85);
  resetRig(b.barber); b.hat.visible = false; b.beam.intensity = 0; b.pole.material.map.offset.y = (O * 0.6) % 1; b.spark.forEach(d => d.m.visible = false);
  b.crack.material.opacity = O > 17.63 ? 1 : 0;   // the pop cracks the mirror, blasts the cape, topples the bottles
  if (O > 17.63) fling(b.cape, V([0, 1.32, 0.12]), O, 17.63, [-2.4, 3.0, -1.6], [3, 1, 4], 0.4);
  b.bottles.forEach((m, i) => fling(m, m.userData.home, O, 17.68 + i * 0.05, [(i % 2 ? 0.5 : -0.5), 1.2, 1.1 + 0.2 * i], [7, 0, 5 + i], 0.15));
  b.smoke.forEach((m, i) => { const t0 = 19.65 + i * 0.12, k = seg(O, t0, t0 + 1.4); m.visible = O > t0 && k < 1; if (!m.visible) return; const tp = wp(b.trimmer); m.position.copy(V([tp.x - 0.4 * k, tp.y + 0.3 + k * 1.6, tp.z - 1.0 * k])); m.scale.setScalar(0.12 + 0.35 * k); m.material.opacity = 0.55 * (1 - k); });
  b.clip.visible = false; b.clipFly.visible = false; b.combOut.visible = false; b.trimmer.visible = O > 18.3 && O < 20.75; b.apron.visible = O < 20.95; b.apronFly.visible = false; b.keys.visible = O > 21.65;
  return b.hero;
}
const d4 = (O) => grow(O, ST[3], 1.0, 1.4);
function trimmerBarber(O) { const b = BAR.barber, run = O > 18.6 && O < 19.6 ? 1 : 0, push = eIO(seg(O, 18.9, 19.5)); hp(b, O, [1.45, 0, 0.95], -0.95, { ...idle(O, 2), spineX: 0.1 * push, headY: 0.15, headX: -0.25,
  arms: [[-1.4 - 0.5 * push, 0, 0.3, 0.6], [-1.6 - 0.7 * push + 0.05 * Math.sin(O * 70) * run, 0, -0.15, 0.4 + 0.05 * Math.sin(O * 61) * run]] }, O < 19.6 ? 'grit' : 'shock', 'barber'); }
function leavingBarber(O) { const b = BAR.barber, off = eIO(seg(O, 20.6, 21.0)), go = seg(O, 21.0, 21.6), walkK = seg(O, 21.85, 24.2);
  if (O < 21.85) { const p = V([1.45, 0, 0.95]).lerp(V([0.8, 0, 0.85]), eIO(go)); const give = eIO(seg(O, 21.3, 21.65)) * (1 - seg(O, 21.65, 21.85));
    hp(b, O, p.toArray(), -1.3, { ...idle(O, 2), headX: -0.1, arms: O < 21.0 ? [[-2.8 * Math.sin(off * Math.PI), 0, 0.3, 0.9], [-2.8 * Math.sin(off * Math.PI), 0, -0.3, 0.9]] : [[0, 0, 0.13, 0.2], [-1.2 * give, 0, -0.1, 0.4]] }, 'calm', 'barber'); }
  else { const p = V([0.8, 0, 0.85]).lerp(V([5.8, 0, 1.4]), walkK); hp(b, O, p.toArray(), Math.PI / 2 - 0.25, { ...walk(O, 6.5, 0.8), headY: -0.55 }, 'calm', 'barber'); }
  if (O > 20.95) fling(BAR.apronFly, V([1.45, 1.55, 1.05]), O, 20.95, [0.3, 0.6, 0.4], [2, 0.5, 1], 0.05); }
shot(17.6, 18.9, 'barber', { p0: [0.7, 0.95, 4.3], p1: [0.5, 0.85, 3.7], l0: [0, 2.7, 0], fov: 46, z0: 1, z1: 1.15 }, (lt, O) => {
  const h = barberBase(O); afro(h, O, d4(O)); hp(h, O, [0, 0, 0.05], 0, popPose(O, ST[3], { ...SIT }), 'shock'); hp(BAR.barber, O, [1.6, 0, 1.2], -1.2, { ...idle(O, 2), arms: [[-0.3, 0, 0.4, 0.6], [-0.4, 0, -0.5, 0.6]] }, 'shock', 'barber'); }, { grade: 'shop', flash: 17.6, shakeAt: [[17.62, 0.06]] });
shot(18.9, 20.6, 'barber', { ease: 'lin', p0: [-1.9, 2.3, 4.7], p1: [-1.4, 2.4, 4.0], l0: [0.7, 2.4, 0.5], fov: 44 }, (lt, O) => {
  const h = barberBase(O); afro(h, O, d4(O)); hp(h, O, [0, 0, 0.05], 0.35, { ...SIT, ...idle(O), bob: 0.07, headY: 0.4 }, O < 19.6 ? 'worried' : 'shock'); trimmerBarber(O);
  burst(BAR.spark, O, 19.6, wp(BAR.trimmer), 1.4, 1.6); }, { grade: 'shop', dof: 0.2, shakeAt: [[19.6, 0.025]] });
shot(20.6, 24.4, 'barber', { ease: 'lin', p0: [0.7, 1.95, 6.3], p1: [0.9, 2.05, 5.2], l0: [0.6, 1.9, 0.2], fov: 46 }, (lt, O) => {
  const h = barberBase(O); afro(h, O, grow(O, ST[4], 1.4, 1.4)); const hand = O > 21.3 ? [-1.0, 0, -0.1, 0.6] : [-0.2, 0, -0.2, 0.4];
  hp(h, O, [0, 0, 0.05], 0.2, popPose(O, ST[4], { ...SIT, ...idle(O), bob: 0.07, headY: O > 21.9 ? 0.5 : 0.3, headX: 0.15, arms: [[-0.2, 0, 0.2, 0.4], hand] }), O < 21.7 ? 'confused' : 'worried'); leavingBarber(O); }, { grade: 'shop' });

// ===== DAY 5 (street): the leaf blower blows HIM away =====
const d5 = (O) => grow(O, ST[4], 1.4, 2.0);
const flyK = (O) => eOut(seg(O, 25.8, 27.6));
function blownHero(O) { const h = STR.hero, k = flyK(O); const x = lerp(0, -16, k), y = Math.sin(k * Math.PI) * 3.2; h.root.position.set(x, y, 0.5 + 0.5 * k); h.root.rotation.set(0, 0.3, 6.283 * 2.2 * k + (O > 27.6 ? 0 : 0)); }
function windOn(O) { STR.wind.forEach((m, i) => { const t0 = 25.6 + (i % 13) * 0.05, k = ((O - t0) * 1.6) % 1; m.visible = O > t0 && O < 26.4; if (!m.visible) return; const tip = STR.blower.localToWorld(V([0, 0, 1.3])); m.position.copy(tip).add(V([Math.sin(i * 2.1) * 0.3, k * 2.2, Math.cos(i * 1.7) * 0.3])); m.rotation.set(0, 0, Math.PI / 2); }); }
function kidIce(O) { const k = STR.kid; resetRig(k); k.root.scale.setScalar(0.62); const hit = O > 26.55; hp(k, O, [-8, 0, 2.4], hit ? 0.9 : 0.4, { ...idle(O, 3), arms: [[0, 0, 0.13, 0.2], [-0.9, 0, -0.2, 1.2]], headY: hit ? -0.6 : 0 }, hit ? 'shock' : 'smile', 'kid');
  STR.scoop.visible = !hit; if (hit) fling(STR.scoopFly, wp(STR.scoop), O, 26.55, [-3.5, 2.0, 0.6], [6, 2, 3]); }
shot(24.4, 25.4, 'street', { p0: [4.8, 1.4, 8.5], p1: [4.3, 1.5, 7.8], l0: [-1.2, 2.6, 0.5], fov: 48 }, (lt, O) => {
  const h = streetBase(O); afro(h, O, d5(O)); hp(h, O, [0, 0, 0.5], 0.3, popPose(O, ST[4]), 'shock'); kidIce(O); }, { grade: 'street', flash: 24.4, shakeAt: [[24.42, 0.06]] });
shot(25.4, 26.0, 'street', { ease: 'lin', p0: [1.6, 2.1, 4.8], p1: [1.3, 2.3, 4.1], l0: [0, 3.0, 0.5], fov: 48 }, (lt, O) => {
  const h = streetBase(O); afro(h, O, d5(O)); STR.blower.visible = true; hp(h, O, [0, 0, 0.5], 0.9, { ...idle(O), spineX: -0.1, headX: -0.2, arms: [[-1.2, 0, 0.3, 0.9], [-1.0, 0, -1.6, 0.15]] }, O < 25.6 ? 'smirk' : 'grit'); windOn(O); }, { grade: 'street' });
shot(26.0, 27.8, 'street', { pf: () => STR.hero.root.position.clone().add(V([4.0, 0.6, 7.0])), lf: () => STR.hero.root.position.clone().add(V([0, 1.6, 0])), fov: 48, live: 0.4 }, (lt, O) => {
  const h = streetBase(O); afro(h, O, d5(O)); STR.blower.visible = true; hp(h, O, [0, 0, 0.5], 0.3, { ...idle(O), arms: [[-2.4, 0, 0.9, 0.3], [-2.4, 0, -0.9, 0.3]], legs: [[0.6 * Math.sin(O * 12), 0.5], [-0.6 * Math.sin(O * 12), 0.5]] }, 'shock'); blownHero(O); kidIce(O); }, { grade: 'street', mblur: 3 });
shot(27.8, 29.8, 'street', { ease: 'lin', pf: (O) => wp(STR.hero.head).add(V([1.0 + 0.2 * seg(O, 27.8, 29.8), 2.1 - 0.4 * seg(O, 27.8, 29.8), 2.6])), lf: () => wp(STR.hero.head).add(V([0, 0.2, 0])), fov: 44 }, (lt, O) => {
  const h = streetBase(O); afro(h, O, grow(O, ST[5], 2.0, 2.0)); const thumb = elastic(seg(O, 28.2, 28.6));
  hp(h, O, [-16, 0, 1.0], 0.2, { ...idle(O), arms: [[0.4, 0, 0.6, 0.3], [-2.2 * thumb, 0, -0.3, 0.9 * thumb]], legs: [[0.4, 0.2], [0.1, 0.6]] }, 'smile'); h.root.rotation.set(-1.15, 0.2, 0.15);
  const c = afroC(h), low = c.y - h.afro.scale.x * 0.85; if (low < 0) h.root.position.y -= low;   // he lands on the afro like a beanbag
  kidIce(O); }, { grade: 'street', dof: 0.25 });

// ===== DAY 6 (city + news): the mower crew mows HELP into it =====
const MK = S.market;
function marketBase(O) { const m = MK; resetRig(m.hero); m.hero.comb.visible = false; m.hero.root.scale.setScalar(4);
  m.traders.forEach((P, i) => { resetRig(P); const r = Math.floor(i / 5), c = i % 5; P.root.position.set(3 + c * 3.0, 0, 0.6 + r * 6.8); P.root.rotation.y = -0.6 + 0.3 * Math.sin(i); pose(P, { ...idle(O, i), headX: -0.4, arms: [[0, 0, 0.13, 0.2], [-1.6 + 0.3 * Math.sin(O * 10 + i), 0, -0.3, 1.2]] }); P.face(O > 32 ? 'laugh' : 'shock', O); });
  m.ladders.forEach(l => l.visible = false); m.climbers.forEach(P => P.root.visible = false); m.mowers.forEach(g => g.visible = false); m.letters.forEach(l => l.visible = false);
  return m.hero; }
function crewOn(O) { const m = MK, ac = afroC(m.hero), R = m.hero.afro.scale.x * 4, top = ac.clone().add(V([0, R * 0.8, 0]));
  m.ladders.forEach((l, i) => { const a = -0.3 + i * 0.75, dir = V([Math.cos(a + 0.6), 0, Math.sin(a + 0.6)]); const base = V([-7, 0, -7]).add(dir.clone().multiplyScalar(R * 0.95 + 2.5)); const tip = ac.clone().add(dir.clone().multiplyScalar(R * 0.8)).add(V([0, R * 0.45, 0]));
    l.visible = O > 30.6; l.position.copy(base); l.quaternion.setFromUnitVectors(V([0, 1, 0]), tip.clone().sub(base).normalize()); l.scale.set(1, base.distanceTo(tip) / 14, 1);
    const P = m.climbers[i], k = eIO(seg(O, 30.8 + i * 0.15, 31.9 + i * 0.15)); P.root.visible = O > 30.6 && k < 1; if (P.root.visible) { resetRig(P); P.root.position.copy(base.clone().lerp(tip, k)).add(dir.clone().multiplyScalar(0.35)); P.root.rotation.y = Math.atan2(-dir.x, -dir.z); pose(P, { arms: [[-2.4 + 0.4 * Math.sin(O * 12 + i), 0, 0.2, 0.3], [-2.4 - 0.4 * Math.sin(O * 12 + i), 0, -0.2, 0.3]], legs: [[0.5 * Math.sin(O * 12 + i), 0.6], [-0.5 * Math.sin(O * 12 + i), 0.6]] }); P.face('grit', O); } });
  m.mowers.forEach((g, i) => { g.visible = O > 31.6; if (!g.visible) return; const a = O * 1.4 + i * 2.1, r = R * (0.25 + 0.15 * i); g.position.copy(top).add(V([Math.cos(a) * r, -0.3, Math.sin(a) * r])); g.rotation.set(0, -a, 0); g.scale.setScalar(1.4); pose(g.rider, { ...idle(O, i), arms: [[-1.2, 0, 0.2, 0.9], [-1.2, 0, -0.2, 0.9]], legs: [[1.4, 1.4], [1.4, 1.4]] }); g.rider.face('smile', O); });
  m.letters.forEach((l, i) => l.visible = O > 32.1 + i * 0.3); }
const d6 = (O) => grow(O, ST[5], 2.0, 2.8);
shot(29.8, 30.8, 'market', { p0: [6, 3.6, 10], p1: [5.4, 3.7, 9], l0: [-7, 9.5, -7], fov: 48 }, (lt, O) => {
  const h = marketBase(O); afro(h, O, d6(O)); hp(h, O, [-7, 0, -7], 0.6, popPose(O, ST[5]), 'shock'); crewOn(O); }, { grade: 'sky', flash: 29.8, shakeAt: [[29.82, 0.05]] });
shot(30.8, 32.0, 'market', { ease: 'lin', p0: [3, 3, 9], p1: [2, 5, 7], l0: [-6, 11, -6], fov: 50 }, (lt, O) => {
  const h = marketBase(O); afro(h, O, d6(O)); hp(h, O, [-7, 0, -7], 0.6, { ...idle(O), headX: -0.35, headY: 0.3 }, 'worried'); crewOn(O); }, { grade: 'sky' });
shot(32.0, 34.0, 'market', { pf: (O) => { const k = eIO(seg(O, 32, 34)); return afroC(MK.hero).add(V([lerp(9, 1.0, k), lerp(4, 50, k), lerp(14, 1.5, k)])); }, lf: () => afroC(MK.hero).add(V([0, 12, 0])), fov: 46 }, (lt, O) => {
  const h = marketBase(O); afro(h, O, d6(O)); hp(h, O, [-7, 0, -7], 0.6, { ...idle(O), headX: -0.3 }, 'worried'); crewOn(O); }, { grade: 'sky' });
shot(34.0, 37.0, 'studio', { ease: 'lin', p0: [0.9, 1.9, 5.4], p1: [0.25, 2.05, 4.0], l0: [0, 2.05, 0], fov: 36 }, (lt, O) => {
  const a = S.studio.anchor; resetRig(a); hp(a, O, [0, 0, 0.1], 0, { ...idle(O, 1), headY: 0.05 * Math.sin(O * 0.8), arms: [[-0.6, 0, 0.25, 1.4], [-0.6, 0, -0.25, 1.4]] }, 'calm', 'anchor'); }, { grade: 'news', lower: true, dof: 0.2 });
shot(37.0, 38.6, 'market', { ease: 'lin', p0: [2.4, 3.0, 8.5], p1: [1.4, 3.4, 6.5], l0: [-7, 8.6, -7], fov: 40 }, (lt, O) => {
  const h = marketBase(O); afro(h, O, grow(O, ST[6], 2.8, 2.8)); hp(h, O, [-7, 0, -7], 0.62, popPose(O, ST[6], { ...idle(O), headX: 0.2, headY: 0.1 }), 'worried'); crewOn(O); }, { grade: 'sky', lower: true });

// ===== DAYS 7-9 (space) =====
const SP = S.space, COMB_PT = afroPt(SP.hero, -0.8, 0.4, 0.45, 1.0);
const BEAD_PTS = [[0.85, 0.3, 0.45], [-0.6, 0.55, 0.6], [0.2, 0.75, 0.65], [0.9, 0.55, -0.2], [-0.9, 0.35, 0.2]].map(p => afroPt(SP.hero, ...p, 1.03));
const SAT_POS = V([15, 10, -9]), LAUNCH = V([-3.6, -1.2, 3.4]), DATE_POS = V([34, 0, -4]);   // as far from the camera as he is, so her afro reads twice the size
const seated = (O) => O >= 48.8;
function spaceBase(O, o = {}) {
  const s = SP; resetRig(s.hero); s.hero.comb.visible = false; s.earth.rotation.y = O * 0.05;
  const vk = o.violet ?? 0; s.violet.material.opacity = vk; s.hemi.color.setHex(0xb7c6ff).lerp(new THREE.Color(0xc9b6ff), vk);
  [s.satl, ...s.rocks, ...s.shoot].forEach(m => m.visible = false); s.spDeb.forEach(d => d.m.visible = false);
  // Day 7: rocket carries a giant comb up, it jams, then yanks back out with the Moon stuck in its teeth
  s.rocket.visible = O > 38.85 && O < 44.2; const cp = wp(COMB_PT); const dir = cp.clone().sub(LAUNCH).normalize();
  if (s.rocket.visible) { const up = eIn(seg(O, 38.9, 40.3)), back = eIO(seg(O, 40.9, 41.9)); const jam = V([0, 0, 0]).copy(cp).sub(dir.clone().multiplyScalar(5.2));
    const p = LAUNCH.clone().lerp(jam, up).lerp(jam.clone().sub(dir.clone().multiplyScalar(9)).add(V([0, 3, 0])), back); s.rocket.position.copy(p); s.rocket.quaternion.setFromUnitVectors(V([0, 1, 0]), dir);
    if (O > 40.3 && O < 40.9) s.rocket.position.add(V([Math.sin(O * 70) * 0.05, Math.cos(O * 53) * 0.05, 0])); }
  s.moon.visible = O > 40.9 && O < 44.2; if (s.moon.visible) { s.moon.position.copy(s.bigComb.localToWorld(V([0, -0.36, 0]))); s.moon.rotation.set(0.2, O * 0.4, 0.3); s.moon.scale.setScalar(1.3); }
  // Saturn + rings (Day 8): rings fly over like a frisbee and land as a headband
  s.sat.visible = O > 44.15; s.sat.position.copy(SAT_POS); s.sat.position.y += 0.3 * Math.sin(O * 1.2); s.sat.lookAt(V([4, 8, 9])); s.sat.rotateZ(0.12); s.satO.visible = O > 45.0 && O < 46.6; s.satMouth.visible = !s.satO.visible;
  const ac = afroC(s.hero), Rr = s.hero.afro.scale.x; const rk = eIO(seg(O, 45.0, 46.0)), settle = elastic(seg(O, 45.95, 46.6)); s.rings.visible = O > 44.15;
  const rp = s.sat.position.clone().lerp(ac.clone().add(V([0, Rr * 0.35, 0])), rk); rp.y += Math.sin(rk * Math.PI) * 4; s.rings.position.copy(rp);
  s.rings.scale.setScalar(lerp(4.6, Rr * 1.05, rk) * (O > 45.95 ? 0.92 + 0.08 * settle : 1)); s.rings.rotation.set(-Math.PI / 2 + lerp(0.45, 0.25, rk) + 0.03 * Math.sin(O * 2), 0, lerp(0.3, -0.1, rk) + 6.283 * 3 * rk);
  s.beads.forEach((m, i) => { const t0 = 45.6 + i * 0.16, k = eIn(seg(O, t0, t0 + 0.35)); m.visible = O > t0 - 0.01; if (!m.visible) return; const tg = wp(BEAD_PTS[i]); m.position.copy(V([tg.x * 3, tg.y + 12, tg.z * 3 - 6]).lerp(tg, k)); m.scale.setScalar(Rr * 0.17 * (k >= 1 ? 1 + 0.25 * Math.exp(-(O - t0 - 0.35) * 12) : 1)); });
  // galaxy afro (Day 9)
  const gk = o.gal ?? 0; s.galSkin.material.opacity = gk; s.galaxies.forEach((m, i) => { m.visible = gk > 0.01; m.material.opacity = 0.75 * gk; const u = (O * 0.06 + i / 5) % 1, a = i * 1.26 + O * 0.35; const r = Rr * lerp(1.7, 0.9, u);
    m.position.copy(ac).add(V([Math.cos(a) * r, Math.sin(a * 0.7) * r * 0.5, Math.sin(a) * r])); m.scale.setScalar(Rr * 0.9 * (0.8 + 0.2 * Math.sin(O + i))); m.lookAt(cam.position); m.rotateZ(O * 0.5 + i); });
  s.planets.forEach(p => p.visible = false);
  // the date table + the date arriving on her own planet
  s.table.visible = seated(O); s.chairs.forEach(c => c.visible = seated(O)); s.table.position.set(0, -0.04, 0);
  s.datePlanet.visible = O > 51.0; if (s.datePlanet.visible) { const k = eOut(seg(O, 51.2, 52.6)); s.datePlanet.position.copy(DATE_POS).add(V([0, 80 * (1 - k), 0]));
    const d = s.date; resetRig(d); d.root.rotation.y = Math.atan2(-DATE_POS.x, -DATE_POS.z) + 0.35; d.setAfro(15, O, 0); pose(d, { ...idle(O, 2), headY: 0.1, arms: [[0, 0, 0.3, 0.3], [-0.5 - 0.3 * Math.sin(O * 3) * (talking('date', O) ? 1 : 0), 0, -0.4, 0.9]] }); d.face(O > 53.0 ? 'smile' : 'calm', O, talking('date', O)); }
  return s.hero;
}
function seatHero(h, O, extra = {}) { hp(h, O, [-0.95, 0, 0], Math.PI / 2 - 0.35, { ...idle(O), ...extra, legs: SIT.legs, bob: 0.07 + 0.3 * (extra.bob || 0) }, extra.expr || 'worried'); }   // always seated legs
const d7 = (O) => grow(O, ST[6], 3.0, 4.0), d8 = (O) => grow(O, ST[7], 4.0, 5.5), d9 = (O) => grow(O, ST[8], 5.5, 7.5);
shot(38.6, 40.0, 'space', { pf: (O) => { const a = lerp(0.75, 0.35, seg(O, 38.6, 40.0)); return V([Math.sin(a) * 24, 7, Math.cos(a) * 24]); }, l0: [-1, 3.6, 0], fov: 48 }, (lt, O) => {
  const h = spaceBase(O); afro(h, O, d7(O)); hp(h, O, [0, 0, 0], 0.3, O < 39.2 ? popPose(O, ST[6]) : { ...idle(O), headY: -0.6, headX: -0.15 }, O < 39.2 ? 'shock' : 'worried'); }, { grade: 'space', flash: 38.6, shakeAt: [[38.62, 0.05]], bloom: 0.16 });
shot(40.0, 41.4, 'space', { ease: 'lin', pf: (O) => wp(COMB_PT).add(V([-5.5 + 0.8 * seg(O, 40, 41.4), 2.2, 9.5])), lf: () => wp(COMB_PT).add(V([-2.2, 0, 0])), fov: 46 }, (lt, O) => {
  const h = spaceBase(O); afro(h, O, d7(O)); hp(h, O, [0, 0, 0], 0.3, { ...idle(O), headY: -0.7, headX: -0.2, spineZ: O > 40.9 && O < 41.2 ? 0.15 : 0 }, O < 40.9 ? 'worried' : 'shock'); }, { grade: 'space', shakeAt: [[40.3, 0.03], [40.9, 0.04]], bloom: 0.16 });
shot(41.4, 44.2, 'capsule', { ease: 'lin', p0: [0.5, 1.95, 3.7], p1: [0.3, 2.05, 2.9], l0: [0.2, 2.2, -1.6], fov: 40 }, (lt, O) => {
  const a = S.capsule.astro; resetRig(a); a.helmet.visible = true; hp(a, O, [-0.45, 0, -1.7], 0.15, { ...idle(O, 4), headY: 0.45 + 0.05 * Math.sin(O * 0.7), arms: [[-0.3, 0, 0.3, 0.8], [-1.4, 0, -0.2, 1.6]] }, 'calm', 'astronaut'); }, { grade: 'news', dof: 0.2 });
shot(44.2, 45.4, 'space', { p0: [3.2, 1.0, 14.5], p1: [3.8, 1.6, 17.5], l0: [3, 5.6, -2], fov: 50 }, (lt, O) => {
  const h = spaceBase(O, { violet: eOut(seg(O, 44.2, 44.8)) }); afro(h, O, d8(O)); hp(h, O, [0, 0, 0], 0.2, popPose(O, ST[7]), 'shock'); }, { grade: 'cosmic', flash: 44.2, shakeAt: [[44.22, 0.05]], bloom: 0.18 });
shot(45.4, 46.6, 'space', { ease: 'lin', pf: (O) => { const a = lerp(0.25, 0.6, seg(O, 45.4, 46.6)); return V([Math.sin(a) * 19, 5, Math.cos(a) * 19]); }, l0: [0, 6.5, 0], fov: 50 }, (lt, O) => {
  const h = spaceBase(O, { violet: 1 }); afro(h, O, d8(O)); hp(h, O, [0, 0, 0], 0.4, { ...idle(O), headX: -0.3, headY: 0.4 }, 'confused'); }, { grade: 'cosmic', bloom: 0.18 });
shot(46.6, 48.8, 'space', { ease: 'lin', p0: [1.8, 1.3, 8.6], p1: [0.6, 1.75, 6.3], l0: [0, 3.2, 0], fov: 46 }, (lt, O) => {
  const h = spaceBase(O, { violet: 1 }); afro(h, O, d8(O)); const pz = eOut(seg(O, 46.55, 46.9));
  hp(h, O, [0, 0, 0], 0.1, { ...idle(O), hipZ: 0.08 * pz, spineZ: -0.06 * pz, headX: -0.12 * pz, headZ: 0.1 * pz, arms: [[lerp(0.05, -0.2, pz), 0, lerp(0.14, 0.95, pz), lerp(0.2, 1.7, pz)], [lerp(0.05, -0.2, pz), 0, lerp(-0.14, -0.95, pz), lerp(0.2, 1.7, pz)]] }, pz > 0.5 ? 'smirk' : 'calm'); }, { grade: 'cosmic', bloom: 0.18 });
// silence: candle-lit table for two on top of the Earth; he checks his watch
shot(48.8, 49.6, 'space', { p0: [2.2, 1.45, 1.7], p1: [1.6, 1.55, 1.25], l0: [-0.95, 2.1, 0], fov: 40, live: 0.6, ease: 'lin' }, (lt, O) => {
  const h = spaceBase(O, { violet: 1 }); afro(h, O, grow(O, ST[8], 5.5, 5.5)); seatHero(h, O, { headX: 0.5, arms: [[-0.6, 0.6, 0.35, 1.3], [-0.4, 0, -0.2, 0.9]] }); }, { grade: 'cosmic', dof: 0.35, bloom: 0.18 });
// Day 9: the afro becomes a galaxy, then something bigger eclipses everything
shot(49.6, 51.2, 'space', { p0: [1.4, 2.2, 3.6], p1: [3, 9, 34], l0: [-0.9, 3, 0], l1: [0, 8, 0], fov: 46, ease: 'out' }, (lt, O) => {
  const h = spaceBase(O, { violet: 1, gal: eOut(seg(O, 49.7, 50.4)) }); afro(h, O, d9(O)); seatHero(h, O, { ...popPose(O, ST[8], SIT), expr: 'shock' }); }, { grade: 'cosmic', flash: 49.6, shakeAt: [[49.62, 0.06]], bloom: 0.24 });
shot(51.2, 52.8, 'space', { ease: 'lin', p0: [4, 2.4, 22], p1: [5, 2.8, 24], l0: [22, 16, -4], fov: 54, dark: (O) => 0.5 * eIO(seg(O, 51.3, 52.3)) * (1 - seg(O, 52.4, 52.8)) }, (lt, O) => {
  const h = spaceBase(O, { violet: 1, gal: 1 }); afro(h, O, d9(O)); seatHero(h, O, { headY: -0.3, headX: -0.3, expr: 'confused' }); }, { grade: 'cosmic', bloom: 0.24 });
shot(52.8, 55.0, 'space', { ease: 'lin', pf: (O) => { const d = SP.date.root, f = V([Math.sin(d.rotation.y), 0, Math.cos(d.rotation.y)]); const k = seg(O, 52.8, 55); return wp(d).add(f.multiplyScalar(5.4 - 1.6 * k)).add(V([0.4 + 1.0 * k, 2.1 + 0.4 * k, 0])); }, lf: () => wp(SP.date.head).add(V([0, 0.3, 0])), fov: 40 }, (lt, O) => {
  const h = spaceBase(O, { violet: 1, gal: 1 }); afro(h, O, d9(O)); seatHero(h, O, { expr: 'shock' }); }, { grade: 'cosmic', dof: 0.3, bloom: 0.2 });
shot(55.0, 56.4, 'space', { ease: 'lin', p0: [1.3, 2.1, 0.75], p1: [1.0, 2.15, 0.6], l0: [-0.95, 2.25, 0], fov: 40 }, (lt, O) => {
  const h = spaceBase(O, { violet: 1, gal: 1 }); afro(h, O, d9(O)); const k = seg(O, 55.35, 55.55); seatHero(h, O, { headX: -0.1 * k, arms: [[-0.4 - 0.6 * k, 0, 0.5 * k + 0.13, 0.6], [-0.4 - 0.6 * k, 0, -0.5 * k - 0.13, 0.6]], expr: 'shock' }); }, { grade: 'cosmic', dof: 0.35, bloom: 0.2 });
shot(56.4, 58.0, 'space', { ease: 'out', p0: [12, 6, 34], p1: [17, 9, 100], l0: [14, 7, -2], l1: [20, 12, -2], fov: 50 }, (lt, O) => {
  const h = spaceBase(O, { violet: 1, gal: 1 }); afro(h, O, d9(O)); seatHero(h, O, { expr: 'shock' }); }, { grade: 'cosmic', bloom: 0.22 });
function stepAt(T) { let s = null; for (const st of STEPS) if (T >= st.t) s = st; return s; }
function spaced(g, text, x, y, sp) { let cx = x; for (const ch of text) { g.fillText(ch, cx, y); cx += g.measureText(ch).width + sp; } return cx - x; }
const measC = mk(10, 10).getContext('2d');
function drawStat(T, sh) {
  const s = stepAt(T); if (!s || sh.hideStat) return; const g = ctx, x = 30; g.save();
  g.shadowColor = 'rgba(0,0,0,0.55)'; g.shadowBlur = 14; g.shadowOffsetY = 2; g.fillStyle = '#fff'; g.textAlign = 'left';
  g.font = '600 30px InterW'; spaced(g, 'AFRO WIDTH', x, 288, 4.5);
  const dt = (T - s.t) * 30; const sc = dt < 5 ? (dt < 2.5 ? 1 + 0.06 * dt / 2.5 : 1.06 - 0.06 * (dt - 2.5) / 2.5) : 1;
  g.save(); g.translate(x, 412); g.scale(sc, sc); g.font = '500 128px Lora'; g.fillText(s.v, 0, 0); g.restore();
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
  g.font = '500 96px Playfair'; g.fillText('What if your', W / 2, 380);
  g.font = 'italic 500 236px Playfair'; g.fillStyle = '#fff1d6'; g.fillText('afro', W / 2, 600);
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
  const nm = { hero: null, bird: 'BIRD', barber: 'BARBER', kid: 'KID', anchor: 'NEWS ANCHOR', saturn: 'SATURN', astronaut: 'ASTRONAUT', date: 'DATE' }[c.speaker];
  strokeText(g, shown, W / 2, H * 0.72, 12); if (nm) { g.font = '700 30px InterW'; g.globalAlpha = 0.85; strokeText(g, nm, W / 2, H * 0.72 - fs - 8, 6); }
  g.restore();
}
function drawLower(O) {   // in-world news lower third (prop text)
  const g = ctx, y = 1560, a = eOut(clamp((O - 34.05) / 0.35)); g.save(); g.globalAlpha = a; g.translate((1 - a) * -200, 0);
  g.fillStyle = '#E21E39'; g.fillRect(40, y, 250, 70); g.fillStyle = '#fff'; g.font = '700 38px InterW'; g.textAlign = 'left'; spaced(g, 'BREAKING', 62, y + 49, 3);
  g.fillStyle = 'rgba(255,255,255,0.95)'; g.fillRect(290, y, 750, 70); g.fillStyle = '#0b1a3a'; g.font = '700 36px InterW'; spaced(g, 'CITY MOWS LOCAL MAN\u2019S HAIR', 316, y + 48, 2.5);
  g.fillStyle = '#0b1a3a'; g.fillRect(40, y + 70, 1000, 40); g.fillStyle = '#fff'; g.font = '600 24px InterW'; spaced(g, 'EXPERTS CONFIRM: IT SAYS HELP', 62, y + 98, 2); g.restore(); }
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
  space: { f: 'saturate(1.12) contrast(1.06) brightness(0.95)', tint: 'rgba(70,110,230,0.12)', mode: 'screen', vig: 0.4 },
  cosmic: { f: 'saturate(1.14) contrast(1.06) brightness(0.92)', tint: 'rgba(110,70,230,0.14)', mode: 'screen', vig: 0.4 },
  shop: { f: 'saturate(1.1) contrast(1.06) brightness(0.97)', tint: 'rgba(255,220,170,0.08)', mode: 'soft-light', vig: 0.3 },
  news: { f: 'saturate(1.12) contrast(1.08) brightness(0.98)', tint: 'rgba(90,150,255,0.12)', mode: 'soft-light', vig: 0.32 },
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
const HEROES = [S.room.hero, S.street.hero, S.barber.hero, S.market.hero, S.space.hero];
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
  if (sh.lower) drawLower(O); drawTitle(O); drawStat(O, sh); drawCaptions(O);
  for (const s of shots) if (s.flash !== undefined) { const d = Math.round((O - s.flash) * 30); if (d >= 0 && d < 3) { ctx.fillStyle = `rgba(255,255,255,${(s.fa || [0.95, 0.6, 0.25])[d]})`; ctx.fillRect(0, 0, W, H); } }
  return out.toDataURL('image/jpeg', RS > 1 ? 0.95 : 0.94);
}
export const TIMELINE = { STEPS, DUR, cuts: shots.map(s => s.t0), flashes: shots.filter(s => s.flash !== undefined).map(s => s.flash) };
window.captionText = (O) => { const c = cueAt(O); if (!c) return ''; return c.kind === 'shout' ? c.words.map(w => w.w).join(' ') : captionChunk(c, O); };
window.hookText = () => '';
window.S = S; window.cam = cam; window.shots = shots; window.renderFrame = renderFrame; window.TIMELINE = TIMELINE;
fetch('dialogue.json').then(r => r.json()).then(d => { DIALOGUE = d; }).catch(() => { DIALOGUE = []; })
  .then(() => Promise.all(['800 78px Montserrat', '500 96px Playfair', 'italic 500 236px Playfair', '500 128px Lora', '600 30px InterW', '700 30px InterW'].map(f => document.fonts.load(f)))).then(() => { window.READY = true; });