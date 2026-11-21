// "What if your drip doubled every day?" v2 — Polygram series, episode renderer (three.js, rig v2, IBL lighting)
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Reflector } from 'three/addons/objects/Reflector.js';

const W = 1080, H = 1920; export const DUR = 87.3;
let DIALOGUE = [];
function spanHit(c, O) { for (const [a, b] of c.spans) if (O >= a - 0.02 && O < b + 0.03) return true; return false; }

// ---------------------------------------------------------------- story steps (one doubling each)
const STEPS = [{"day": 1, "t": 3.0, "t1": 10.8, "v": "£40", "cmp": "A CHARITY-SHOP JACKET", "status": "", "setup": "Day 1. A £40 jacket from a charity shop.", "son": 3.35, "punch": "The bouncer has questions.", "pon": 5.85}, {"day": 3, "t": 10.8, "t1": 17.8, "v": "£160", "cmp": "NEW WHITE TRAINERS", "status": "", "setup": "Day 3. New white trainers.", "son": 11.15, "punch": "His shadow starts walking like a model.", "pon": 13.09}, {"day": 5, "t": 17.8, "t1": 26.4, "v": "£640", "cmp": "≈ A DESIGNER JACKET", "status": "", "setup": "Day 5. A trip to the zoo.", "son": 18.15, "punch": "The peacock retires.", "pon": 20.05}, {"day": 8, "t": 26.4, "t1": 32.4, "v": "£5,120", "cmp": "≈ A GOLD CHAIN", "status": "", "setup": "Day 8. He walks past a clothes shop.", "son": 26.75, "punch": "The mannequins notice.", "pon": 29.09}, {"day": 10, "t": 32.4, "t1": 38.8, "v": "£20,480", "cmp": "≈ A NEW CAR", "status": "", "setup": "In 2019, a pair of trainers sold for $437,500.", "son": 32.75, "punch": "Now a man in white gloves ties his laces.", "pon": 35.49}, {"day": 12, "t": 38.8, "t1": 45.8, "v": "£81,920", "cmp": "≈ TWO YEARS' WAGES", "status": "", "setup": "Day 12. It starts to rain.", "son": 39.15, "punch": "The rain goes round him.", "pon": 41.09}, {"day": 15, "t": 45.8, "t1": 54.0, "v": "£655,360", "cmp": "≈ TWO HOUSES", "status": "", "setup": "Day 15. He's arrested for stopping traffic.", "son": 46.15, "punch": "The judge has one question.", "pon": 48.77}, {"day": 18, "t": 54.0, "t1": 61.0, "v": "£5.2 million", "cmp": "≈ A PRIVATE JET", "status": "", "setup": "Day 18. Two men try to rob him.", "son": 54.35, "punch": "They tip him instead.", "pon": 56.49}, {"day": 22, "t": 61.0, "t1": 68.4, "v": "£84 million", "cmp": "≈ A SUPERYACHT", "status": "", "setup": "Day 22. He stops to tie his shoe in a gallery.", "son": 61.35, "punch": "They won't let him leave.", "pon": 64.09}, {"day": 27, "t": 68.4, "t1": 74.4, "v": "£2.7 billion", "cmp": "≈ A FOOTBALL CLUB", "status": "", "setup": "Day 27. He pays for crisps with one button.", "son": 68.75, "punch": "His change comes in a wheelbarrow.", "pon": 71.37}, {"day": 30, "t": 74.4, "t1": 80.6, "v": "£21.5 billion", "cmp": "≈ A SMALL COUNTRY", "status": "", "setup": "Day 30. All of London copies his look.", "son": 74.75, "punch": "Only the £40 jacket. It's all they can afford.", "pon": 77.17}, {"day": "END", "t": 80.6, "t1": 87.0, "v": "£42.9 billion", "cmp": "STILL NOT ON THE LIST", "status": "", "setup": "Day 31. Back at the club.", "son": 80.95, "punch": "", "pon": null}];  // generated from timeline.json (step 2)
const TITLE = { t0: 0.15, t1: 2.95 };
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
// ---------------------------------------------------------------- SCENES (Drip v2: all new sets)
const S = {};
const brickTex = (base, mortar, rx, ry) => { const t = canvasTex(512, 512, (g, w, h) => { g.fillStyle = mortar; g.fillRect(0, 0, w, h); const r2 = rnd(7);
  for (let y = 0, row = 0; y < h; y += 32, row++) for (let x = (row % 2) * -32; x < w; x += 64) { const v = (r2() - 0.5) * 30; const c = new THREE.Color(base); g.fillStyle = `rgb(${c.r * 255 + v | 0},${c.g * 255 + v * 0.7 | 0},${c.b * 255 + v * 0.6 | 0})`; g.fillRect(x + 2, y + 2, 60, 28); } }); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); return t; };
const neonTex = (txt, col) => canvasTex(1024, 320, (g, w, h) => { g.textAlign = 'center'; g.font = 'italic 500 210px Playfair'; g.shadowColor = col; for (const [b, a] of [[60, 0.9], [25, 1], [6, 1]]) { g.shadowBlur = b; g.globalAlpha = a; g.fillStyle = b > 20 ? col : '#fff6fb'; g.fillText(txt, w / 2, 230); } });
function crowdSet(sc, n, brown, place) { return [...Array(n)].map((_, i) => { const P = npc(i + (brown ? 3 : 0), brown ? { hood: BROWN, hoodD: BROWN } : {}); if (brown) jacketBits(P); sc.add(P.root); P.root.visible = false; P.i = i; P.blob = blob(sc, 1.2); return P; }); }
{ // ---- the club: night, wet street, neon, velvet rope, queue, bouncer (title, Day 1, END)
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x06060c); sc.fog = new THREE.Fog(0x06060c, 16, 46);
  lightRig(sc, { env: 0.16, sky: 0x40407a, ground: 0x0c0c14, hemi: 0.4, keyC: 0x9fb2ff, key: 0.7, keyPos: [-6, 10, 9], R: 9, rim: 1.4, rimC: 0xff4fa8, rimPos: [4, 5, -6] });
  const wet = mat(0x14141b, { roughness: 0.16, metalness: 0.25, envMapIntensity: 1.4 }); sc.add(rbox(60, 0.2, 40, wet, 0, -0.1, 8));
  sc.add(rbox(60, 0.14, 0.3, mat(0x55555c, { roughness: 0.6 }), 0, 0.02, 1.6));
  const bt = brickTex(0x5a2a26, '#2a2220', 8, 3); sc.add(rbox(40, 10, 0.5, new THREE.MeshStandardMaterial({ map: bt, roughness: 0.85 }), 0, 5, -3.3));
  const door = rbox(1.7, 3.0, 0.2, mat(0x24060f, { emissive: 0x6a0a30, emissiveIntensity: 0.9 }), 0.25, 1.5, -3.0); sc.add(door);
  [[-0.7, 1.55], [1.2, 1.55]].forEach(([x, y]) => sc.add(rbox(0.2, 3.1, 0.35, mat(0x111111, { roughness: 0.3, metalness: 0.5 }), x, y, -2.95))); sc.add(rbox(2.1, 0.22, 0.35, mat(0x111111, { roughness: 0.3, metalness: 0.5 }), 0.25, 3.1, -2.95));
  const fill = new THREE.PointLight(0xd8c8ff, 7, 10, 1.4); fill.position.set(-0.8, 3.4, 1.8); sc.add(fill);
  const inner = new THREE.PointLight(0xff3a8a, 9, 6, 1.6); inner.position.set(0.25, 1.8, -2.3); sc.add(inner);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 1.06), new THREE.MeshBasicMaterial({ map: neonTex('Velvet', '#ff3d9a'), transparent: true, toneMapped: false, depthWrite: false })); sign.position.set(0.25, 5.3, -3.0); sc.add(sign);
  const nl = new THREE.PointLight(0xff3d9a, 14, 9, 1.4); nl.position.set(0.25, 5.0, -2.2); sc.add(nl);
  const posts = [[-0.35, -0.55], [1.75, -0.55]].map(([x, z]) => { const g = grp(x, 0, z, sc); g.add(cyl(0.05, 0.05, 1.0, GOLD, 0, 0.5, 0, 12)); g.add(cyl(0.16, 0.18, 0.06, GOLD, 0, 0.03, 0, 18)); g.add(ball(0.07, GOLD, 0, 1.02, 0, undefined, 12)); return g; });
  const ropeCurve = new THREE.CatmullRomCurve3([V([-0.35, 0.95, -0.55]), V([0.7, 0.62, -0.55]), V([1.75, 0.95, -0.55])]);
  sc.add(new THREE.Mesh(new THREE.TubeGeometry(ropeCurve, 24, 0.035, 8), mat(0x9a0f2a, { roughness: 0.5 })));
  [[-7, 3.2, 7], [5, 3.2, 8], [14, 3.2, 7], [-15, 3.2, 8]].forEach(([x, y, z]) => { practical(sc, x, y, z, 0xffa860, { i: 10, d: 12, r: 0.14, bokeh: 1.4 }); sc.add(cyl(0.06, 0.08, y, mat(0x222228), x, y / 2, z + 0.2, 8)); });
  for (let i = 0; i < 14; i++) { const r2 = rnd(i + 90); const s = sparkle(1.2 + r2() * 1.5, [0xff7ab8, 0xffb070, 0x7ab8ff][i % 3]); s.position.set(-20 + r2() * 40, 1 + r2() * 4, 14 + r2() * 12); s.material.opacity = 0.35; sc.add(s); }
  const hero = makeHero(); sc.add(hero.root); const hb = blob(sc);
  const bouncer = makeBouncer(); sc.add(bouncer.root); blob(sc, 1.6).position.set(0.55, 0.012, -1.45);
  const queue = crowdSet(sc, 7, false), bq = crowdSet(sc, 11, true);
  S.club = { sc, hero, hb, bouncer, queue, bq, inner, nl };
}
{ // ---- the wall: a pale rendered wall under a streetlamp at night; his shadow has a mind of its own (Day 3)
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x090b14);
  lightRig(sc, { env: 0.12, sky: 0x3a4a80, ground: 0x0c0c14, hemi: 0.35, keyC: 0xffc98a, key: 0.25, keyPos: [-8, 9, 10], R: 10 });
  sc.add(rbox(60, 0.2, 30, mat(0x2a2a30, { roughness: 0.55 }), 0, -0.1, 6)); for (let i = -12; i < 12; i++) sc.add(rbox(1.96, 0.02, 2.9, mat(0x34343b, { roughness: 0.6 }), i * 2, 0.005, 0.4));
  const wt = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#d8ccb4'; g.fillRect(0, 0, w, h); const r2 = rnd(3); for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(${r2() < 0.5 ? '120,100,80' : '255,250,235'},${0.05 + r2() * 0.06})`; g.fillRect(r2() * w, r2() * h, 2 + r2() * 5, 2 + r2() * 5); } }); wt.wrapS = wt.wrapT = THREE.RepeatWrapping; wt.repeat.set(10, 2);
  sc.add(rbox(40, 7, 0.3, new THREE.MeshStandardMaterial({ map: wt, roughness: 0.95 }), 0, 3.5, -1.25)); sc.add(rbox(40, 0.5, 0.36, mat(0x8a8070, { roughness: 0.9 }), 0, 0.25, -1.22));
  const lamp = new THREE.SpotLight(0xffc27a, 160, 30, 0.75, 0.6, 1.5); lamp.position.set(-5.5, 5.2, 5); lamp.target.position.set(1, 1.5, -1.2); sc.add(lamp, lamp.target);
  practical(sc, -5.5, 5.3, 5, 0xffc27a, { i: 2, d: 6, r: 0.2, bokeh: 1.2 }); sc.add(cyl(0.07, 0.09, 5.3, mat(0x1d1d22), -5.6, 2.65, 5.1, 8));
  const hero = makeHero(); sc.add(hero.root); const hb = blob(sc);
  const shM = new THREE.MeshBasicMaterial({ color: 0x14100c, transparent: true, opacity: 0.78, depthWrite: false });
  const shadow = makeRig({ noHood: true }); shadow.root.traverse(m => { if (m.isMesh) { m.material = shM; m.castShadow = m.receiveShadow = false; } });
  const flat = grp(0, 0, -1.08, sc); flat.scale.set(1.12, 1.12, 0.02); flat.add(shadow.root);
  S.wall = { sc, hero, hb, shadow, flat, lamp };
}
{ // ---- the zoo: a sunny peacock enclosure, shot like a nature documentary (Day 5)
  const sc = new THREE.Scene(); sc.add(skyDome('#7fb2e6', '#cfe4f2', '#f2ead2', 120));
  lightRig(sc, { env: 0.45, sky: 0xcfe4ff, ground: 0x5a6a2a, hemi: 0.7, keyC: 0xffe0b0, key: 2.6, keyPos: [-10, 14, 8], R: 9, rim: 0.8, rimC: 0xfff0c0, rimPos: [6, 6, -8] });
  const gt = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#5f8a34'; g.fillRect(0, 0, w, h); const r2 = rnd(5); for (let i = 0; i < 2500; i++) { g.fillStyle = ['#6f9a3c', '#4f7a2c', '#7fa848', '#58803a'][i % 4]; g.fillRect(r2() * w, r2() * h, 2, 5); } }); gt.wrapS = gt.wrapT = THREE.RepeatWrapping; gt.repeat.set(14, 14);
  sc.add(new THREE.Mesh(new THREE.CircleGeometry(60, 32).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: gt, roughness: 0.95 })));
  const bush = (x, z, s) => { const g = grp(x, 0, z, sc); const r2 = rnd(Math.round(x * 13 + z * 7 + 99)); for (let i = 0; i < 7; i++) { const b = ball(0.5 + r2() * 0.4, mat([0x2f5a24, 0x3a6a2a, 0x24481c][i % 3], { roughness: 0.9 }), (r2() - 0.5) * 1.3, 0.45 + r2() * 0.5, (r2() - 0.5) * 0.9, undefined, 12); g.add(b); } g.scale.setScalar(s); return g; };
  const bushes = [bush(2.9, -1.4, 1.1), bush(-4.5, -6, 1.4), bush(4.5, -7, 1.6), bush(-1.0, -9, 1.8), bush(6, -2.5, 1.2)];
  const fol = [bush(-1.6, 6.5, 0.7), bush(1.9, 6.2, 0.6)];   // out-of-focus foreground leaves for the telephoto shot
  for (let x = -9; x <= 9; x += 1.5) { sc.add(rbox(0.12, 1.1, 0.12, mat(0x7a5a3a, { roughness: 0.9 }), x, 0.55, -3.0)); }
  [0.45, 0.9].forEach(y => sc.add(rbox(19, 0.08, 0.06, mat(0x8a6a48, { roughness: 0.9 }), 0, y, -3.0)));
  [[-6, -10], [7, -12], [-9, -4]].forEach(([x, z]) => { sc.add(cyl(0.25, 0.35, 4, mat(0x5a4030), x, 2, z, 10)); const c = ball(2.2, mat(0x2f5a24, { roughness: 0.9 }), x, 5, z, undefined, 14); c.castShadow = false; sc.add(c); });
  sc.add(rbox(3.2, 0.06, 1.8, mat(0xc9b48a, { roughness: 0.95 }), 0.6, 0.03, -0.4));
  const peacock = makePeacock(); peacock.position.set(0.7, 0, -0.4); sc.add(peacock); blob(sc, 1.5).position.set(0.7, 0.012, -0.4);
  const hero = makeHero(); sc.add(hero.root); const hb = blob(sc);
  S.zoo = { sc, hero, hb, peacock, bushes, rustle: bushes[0] };
}
{ // ---- the shop window: three mannequins inside, the street outside at night (Day 8)
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x070910);
  lightRig(sc, { env: 0.3, sky: 0x4a5a90, ground: 0x14141a, hemi: 0.35, keyC: 0xffe6c8, key: 0.5, keyPos: [2, 10, -6], R: 8 });
  const fT = canvasTex(256, 256, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#c9b08a' : '#bda17a'; g.fillRect(0, i * 32, w, 32); g.fillStyle = 'rgba(0,0,0,0.15)'; g.fillRect(0, i * 32, w, 2); } }); fT.wrapS = fT.wrapT = THREE.RepeatWrapping; fT.repeat.set(3, 3);
  sc.add(rbox(10, 0.2, 6, new THREE.MeshStandardMaterial({ map: fT, roughness: 0.35, envMapIntensity: 0.9 }), 0, -0.1, -2.0));
  sc.add(rbox(5.2, 0.3, 1.6, mat(0xf2f0ec, { roughness: 0.4 }), 0, 0.15, 0.1));
  sc.add(rbox(10, 6, 0.2, mat(0xe9e2d6, { roughness: 0.8 }), 0, 3, -5.1)); sc.add(rbox(0.2, 6, 6, mat(0xe9e2d6, { roughness: 0.8 }), -4.2, 3, -2)); sc.add(rbox(0.2, 6, 6, mat(0xe9e2d6, { roughness: 0.8 }), 4.2, 3, -2)); sc.add(rbox(10, 0.2, 6, mat(0xf4efe6), 0, 4.2, -2));
  [-1.4, 0, 1.4].forEach(x => { const sp = new THREE.SpotLight(0xfff0d8, 40, 8, 0.45, 0.5, 1.4); sp.position.set(x, 4.0, -0.6); sp.target.position.set(x, 1.2, 0.1); sc.add(sp, sp.target); sc.add(cyl(0.1, 0.12, 0.2, mat(0x222222, { emissive: 0xfff0d8, emissiveIntensity: 0.5 }), x, 4.0, -0.6, 10)); });
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(8.4, 4.0), new THREE.MeshStandardMaterial({ color: 0xbfd8ff, transparent: true, opacity: 0.1, roughness: 0.03, metalness: 0.4, envMapIntensity: 2.4, depthWrite: false })); glass.position.set(0, 2.1, 1.2); sc.add(glass);
  const fm = mat(0x1a1410, { roughness: 0.4 }); sc.add(rbox(8.6, 0.25, 0.3, fm, 0, 0.1, 1.2)); sc.add(rbox(8.6, 0.3, 0.3, fm, 0, 4.1, 1.2)); [-4.25, 4.25].forEach(x => sc.add(rbox(0.3, 4.2, 0.3, fm, x, 2.1, 1.2)));
  sc.add(rbox(20, 0.16, 6, mat(0x3a3a42, { roughness: 0.55 }), 0, -0.08, 4.3)); sc.add(rbox(20, 0.2, 14, mat(0x16161c, { roughness: 0.2, metalness: 0.2 }), 0, -0.2, 14));
  const facade = new THREE.Mesh(new THREE.PlaneGeometry(26, 10), new THREE.MeshBasicMaterial({ map: windowsTex(12, 0.45), color: 0x8090a8 })); facade.position.set(0, 5, 20); facade.rotation.y = Math.PI; sc.add(facade);
  practical(sc, 4.5, 4.6, 6.5, 0xffb36a, { i: 18, d: 12, r: 0.16, bokeh: 1.0 }); sc.add(cyl(0.07, 0.09, 4.6, mat(0x1d1d22), 4.5, 2.3, 6.6, 8));
  const outer = new THREE.Group(); sc.add(outer); outer.visible = false; outer.add(rbox(9, 1.0, 0.4, mat(0x1a1410, { roughness: 0.4 }), 0, 4.8, 1.3));
  const signT = canvasTex(1024, 128, (g, w, h) => { g.fillStyle = '#1a1410'; g.fillRect(0, 0, w, h); g.fillStyle = '#d9b46a'; g.textAlign = 'center'; g.font = '500 84px Playfair'; g.fillText('ATELIER', w / 2, 96); });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(8.6, 0.95), new THREE.MeshBasicMaterial({ map: signT })); sign.position.set(0, 4.8, 1.51); outer.add(sign);
  const mans = [[-1.7, 0xc8402a], [-0.2, 0x2f6f8a], [1.25, 0xd9a520]].map(([x, c]) => { const P = makeMannequin(c); P.root.position.set(x, 0.3, 0.1); sc.add(P.root); return P; });
  const jacket = rbox(0.86, 0.16, 0.55, mat(0xd9a521, { roughness: 0.75 })); jacket.visible = false; sc.add(jacket);
  const hero = makeHero(); sc.add(hero.root); const hb = blob(sc);
  S.window = { sc, hero, hb, mans, jacket };
}
{ // ---- the plaza: a paved London square (Day 10 morning, Day 12 rain at dusk, Day 30 time-lapse)
  const sc = new THREE.Scene(); const sky = skyDome('#6f9fd8', '#d6e6f2', '#efe6d8', 140); sc.add(sky);
  const key = lightRig(sc, { env: 0.5, sky: 0xd8e8ff, ground: 0x6a645a, hemi: 0.75, keyC: 0xfff0d8, key: 2.2, keyPos: [12, 18, 14], R: 14, rim: 0.6, rimC: 0xffffff, rimPos: [-8, 6, -10] });
  const hemi = sc.children.find(c => c.isHemisphereLight);
  const pt = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#8f8a82'; g.fillRect(0, 0, w, h); const r2 = rnd(11); for (let y = 0; y < h; y += 32) for (let x = 0; x < w; x += 32) { const v = (r2() - 0.5) * 26; g.fillStyle = `rgb(${150 + v | 0},${144 + v | 0},${134 + v | 0})`; g.fillRect(x + 1, y + 1, 30, 30); } }); pt.wrapS = pt.wrapT = THREE.RepeatWrapping; pt.repeat.set(16, 16);
  const paveM = new THREE.MeshStandardMaterial({ map: pt, roughness: 0.6, metalness: 0.05, envMapIntensity: 0.8 }); sc.add(rbox(60, 0.2, 60, paveM, 0, -0.1, 0));
  const bld = (x, z, w, h, d, ry, c) => { const b = rbox(w, h, d, new THREE.MeshStandardMaterial({ map: windowsTex(Math.round(x * 3 + z * 5 + 50), 0.0), color: c, roughness: 0.8 }), x, h / 2, z); b.rotation.y = ry; sc.add(b); return b; };
  [[-9, -14, 8, 9, 4, 0, 0xd8c8b0], [0, -15, 9, 11, 4, 0, 0xc8b8a8], [9, -14, 8, 8, 4, 0, 0xe0d0b8], [-15, -5, 4, 9, 12, 0, 0xc0b0a0], [15, -5, 4, 10, 12, 0, 0xd0c0a8], [-15, 8, 4, 8, 12, 0, 0xc8b8a8], [15, 9, 4, 9, 12, 0, 0xd8c8b0]].forEach(a => bld(...a));
  const cs = grp(-4.5, 0, -12.9, sc); cs.add(rbox(6, 3.6, 0.4, mat(0x2f5a3a, { roughness: 0.6 }), 0, 1.8, 0)); cs.add(rbox(4.6, 2.2, 0.1, mat(0x9fc0d0, { roughness: 0.05, metalness: 0.3, envMapIntensity: 2, emissive: 0x3a4a3a, emissiveIntensity: 0.5 }), 0, 1.5, 0.22));
  const csT = canvasTex(1024, 160, (g, w, h) => { g.fillStyle = '#2f5a3a'; g.fillRect(0, 0, w, h); g.fillStyle = '#f4ead6'; g.textAlign = 'center'; g.font = '700 96px InterW'; g.fillText('CHARITY SHOP', w / 2, 116); });
  const csSign = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 0.88), new THREE.MeshBasicMaterial({ map: csT })); csSign.position.set(0, 3.3, 0.22); cs.add(csSign); cs.visible = false;
  const lamps = [[-5, -3], [5, -3], [-5, 6], [5, 6]].map(([x, z]) => { sc.add(cyl(0.07, 0.1, 4.4, mat(0x1d1d22, { roughness: 0.4 }), x, 2.2, z, 8)); return practical(sc, x, 4.5, z, 0xffc27a, { i: 0, d: 10, r: 0.18, bokeh: 0.9 }); });
  [[-3.2, -1.5, 0.3], [3.4, -2.0, -0.2]].forEach(([x, z, ry]) => { const b = grp(x, 0, z, sc); b.rotation.y = ry; b.add(rbox(2, 0.1, 0.5, mat(0x6a4a2e, { roughness: 0.7 }), 0, 0.5, 0)); b.add(rbox(2, 0.5, 0.08, mat(0x6a4a2e, { roughness: 0.7 }), 0, 0.85, -0.22)); [-0.85, 0.85].forEach(dx => b.add(rbox(0.08, 0.5, 0.45, mat(0x222222), dx, 0.25, 0))); });
  [[-7, -7], [7, -8]].forEach(([x, z]) => { sc.add(cyl(0.2, 0.28, 3, mat(0x5a4030), x, 1.5, z, 10)); sc.add(ball(1.6, mat(0x3a6a2a, { roughness: 0.9 }), x, 3.8, z, undefined, 14)); });
  const N = 1600, rainG = new THREE.BoxGeometry(0.012, 0.42, 0.012), rainM = new THREE.MeshBasicMaterial({ color: 0xcfe0ff, transparent: true, opacity: 0.55, depthWrite: false, toneMapped: false });
  const rain = new THREE.InstancedMesh(rainG, rainM, N); rain.frustumCulled = false; sc.add(rain); rain.visible = false; const rr2 = rnd(77); const RD = [...Array(N)].map(() => ({ x: (rr2() - 0.5) * 12, z: (rr2() - 0.5) * 12, y: rr2() * 8, s: 7 + rr2() * 3 }));
  const steam = [...Array(8)].map((_, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex('rgba(255,255,255,0.8)', 'rgba(220,230,255,0.3)'), transparent: true, depthWrite: false })); s.visible = false; sc.add(s); return s; });
  const hero = makeHero(); sc.add(hero.root); const hb = blob(sc);
  const guard = makeGuard(); sc.add(guard.root); const gb = blob(sc);
  const crowd = crowdSet(sc, 26, true);
  S.plaza = { sc, sky, key, hemi, lamps, cs, rain, RD, steam, hero, hb, guard, gb, crowd, paveM };
}
{ // ---- the courtroom (Day 15; rendered as a courtroom sketch)
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x2a1d14);
  lightRig(sc, { env: 0.4, sky: 0xfff0dc, ground: 0x3a2a1c, hemi: 0.7, keyC: 0xfff0dc, key: 1.6, keyPos: [4, 10, 8], R: 9 });
  const wood = mat(0x6a4426, { roughness: 0.45 }), woodD = mat(0x4a2e18, { roughness: 0.5 });
  sc.add(rbox(20, 0.2, 20, mat(0x3a2818, { roughness: 0.4 }), 0, -0.1, 0));
  const pT = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#6a4426'; g.fillRect(0, 0, w, h); g.strokeStyle = '#3a2414'; g.lineWidth = 6; for (let x = 0; x < w; x += 64) for (let y = 0; y < h; y += 128) g.strokeRect(x + 6, y + 6, 52, 116); }); pT.wrapS = pT.wrapT = THREE.RepeatWrapping; pT.repeat.set(6, 2);
  sc.add(rbox(20, 8, 0.3, new THREE.MeshStandardMaterial({ map: pT, roughness: 0.5 }), 0, 4, -5.5)); sc.add(rbox(0.3, 8, 20, new THREE.MeshStandardMaterial({ map: pT, roughness: 0.5 }), -7, 4, 0)); sc.add(rbox(0.3, 8, 20, new THREE.MeshStandardMaterial({ map: pT, roughness: 0.5 }), 7, 4, 0));
  sc.add(rbox(6, 0.9, 3, woodD, 0, 0.45, -3.8)); sc.add(rbox(4.6, 1.25, 0.35, wood, 0, 1.52, -2.55)); sc.add(rbox(4.9, 0.1, 0.8, woodD, 0, 2.18, -2.75));
  sc.add(rbox(1.2, 2.6, 0.3, mat(0x7a1a1a, { roughness: 0.7 }), 0, 2.2, -4.9)); const crest = cyl(0.55, 0.55, 0.06, GOLD, 0, 4.1, -5.3, 32); crest.rotation.x = Math.PI / 2; sc.add(crest);
  const judge = makeJudge(); sc.add(judge.root);
  const gavel = grp(0, 0, 0, sc); gavel.add(cyl(0.02, 0.02, 0.32, mat(0x4a2e18), 0, 0, 0, 8)); const gh = cyl(0.06, 0.06, 0.2, mat(0x4a2e18), 0, 0.16, 0, 12); gh.rotation.z = Math.PI / 2; gavel.add(gh); sc.add(cyl(0.12, 0.12, 0.04, woodD, 0.9, 2.25, -2.6, 16));
  const dock = grp(2.6, 0, 1.8, sc); dock.rotation.y = -0.5; dock.add(rbox(2.2, 0.15, 2.0, woodD, 0, 0.3, 0)); dock.add(rbox(2.2, 1.0, 0.12, wood, 0, 0.75, 0.95)); dock.add(rbox(2.2, 1.0, 0.12, wood, 0, 0.75, -0.95)); dock.add(rbox(0.12, 1.0, 2.0, wood, -1.05, 0.75, 0)); dock.add(rbox(0.12, 1.0, 2.0, wood, 1.05, 0.75, 0));
  for (let k = -3; k <= 3; k++) dock.add(cyl(0.025, 0.025, 0.9, GOLD, k * 0.3, 1.7, -0.95, 6)); dock.add(rbox(2.2, 0.06, 0.08, GOLD, 0, 2.15, -0.95));
  const pub = [...Array(6)].map((_, i) => { const P = npc(i + 1); P.root.position.set(-3.6 + (i % 3) * 1.1, 0, 3.4 + Math.floor(i / 3) * 1.4); sc.add(P.root); return P; }); [3.4, 4.8].forEach(z => sc.add(rbox(4.2, 0.12, 0.6, wood, -2.5, 0.5, z)));
  practical(sc, -3, 6.5, 0, 0xfff0d8, { i: 6, d: 14, r: 0.2 }); practical(sc, 3, 6.5, 0, 0xfff0d8, { i: 6, d: 14, r: 0.2 });
  const hero = makeHero(); sc.add(hero.root);
  S.court = { sc, judge, gavel, dock, pub, hero };
}
{ // ---- the alley at night, seen by a CCTV camera (Day 18)
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x05060a); sc.fog = new THREE.Fog(0x05060a, 10, 26);
  lightRig(sc, { env: 0.3, sky: 0x8090b0, ground: 0x1c1c22, hemi: 1.1, keyC: 0xd0d8ff, key: 1.3, keyPos: [-3, 10, 6], R: 10 });
  sc.add(rbox(10, 0.2, 40, mat(0x18181e, { roughness: 0.2, metalness: 0.2, envMapIntensity: 1.2 }), 0, -0.1, -6));
  const bt = brickTex(0x4a3a34, '#1e1a18', 6, 3); [-2.4, 2.4].forEach(x => sc.add(rbox(0.4, 9, 40, new THREE.MeshStandardMaterial({ map: bt, roughness: 0.9 }), x, 4.5, -6)));
  const binC = [[-1.7, -0.8, 0x2a5a3a], [-1.7, 0.1, 0x2a3a5a], [1.75, -2.3, 0x3a3a3a]]; binC.forEach(([x, z, c]) => { sc.add(rbox(0.7, 1.1, 0.75, mat(c, { roughness: 0.6 }), x, 0.55, z)); sc.add(rbox(0.76, 0.08, 0.8, mat(c, { roughness: 0.6 }), x, 1.13, z)); });
  sc.add(rbox(1.0, 1.3, 2.2, mat(0x3a5a4a, { roughness: 0.7, metalness: 0.4 }), 1.65, 0.65, -6));
  sc.add(rbox(0.1, 2.4, 1.1, mat(0x3a1a14, { roughness: 0.7 }), 2.18, 1.2, 1.4)); [[-2.15, 3.5, -1, 0xffd6a0], [2.15, 3.2, -8, 0xffd6a0]].forEach(([x, y, z, c]) => practical(sc, x, y, z, c, { i: 30, d: 10, r: 0.12 }));
  [-2.15, 2.15].forEach(x => sc.add(cyl(0.05, 0.05, 9, mat(0x2a2a2a, { roughness: 0.4, metalness: 0.6 }), x, 4.5, -3.5, 8)));
  const hero = makeHero(); sc.add(hero.root); const hb = blob(sc);
  const muggers = [0, 1].map(i => { const P = makeMugger(i); sc.add(P.root); P.blob = blob(sc, 1.2); sc.add(P.wallet); return P; });
  S.alley = { sc, hero, hb, muggers };
}
{ // ---- the gallery: a huge white hall (Day 22)
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0xf2f0ea);
  lightRig(sc, { env: 0.8, sky: 0xffffff, ground: 0xd8d4cc, hemi: 1.0, keyC: 0xfffaf0, key: 1.6, keyPos: [3, 20, 6], R: 14 });
  sc.add(rbox(30, 0.2, 30, mat(0xdcd8d0, { roughness: 0.25, envMapIntensity: 1.0 }), 0, -0.1, -2));
  const wm = mat(0xf6f4ef, { roughness: 0.9 }); sc.add(rbox(30, 10, 0.3, wm, 0, 5, -12)); sc.add(rbox(0.3, 10, 30, wm, -9, 5, -2)); sc.add(rbox(0.3, 10, 30, wm, 9, 5, -2));
  const art = (seed, w, h) => canvasTex(256, 256 * h / w, (g, W2, H2) => { const r2 = rnd(seed); g.fillStyle = ['#f2e6d0', '#1a1a2a', '#e8d0c0'][seed % 3]; g.fillRect(0, 0, W2, H2); for (let i = 0; i < 7; i++) { g.fillStyle = ['#d9342b', '#1f5fbf', '#f2c230', '#111', '#2a8a5a'][Math.floor(r2() * 5)]; if (r2() < 0.5) g.fillRect(r2() * W2, r2() * H2, 20 + r2() * 120, 20 + r2() * 120); else { g.beginPath(); g.arc(r2() * W2, r2() * H2, 10 + r2() * 60, 0, 7); g.fill(); } } });
  [[-5.5, 3.2, -11.8, 0, 3, 2.2, 1], [0, 3.4, -11.8, 0, 3.6, 2.6, 2], [5.5, 3.1, -11.8, 0, 2.4, 3, 3], [-8.8, 3.2, -5, Math.PI / 2, 3, 2.2, 4], [8.8, 3.2, -5, -Math.PI / 2, 3, 2.2, 5], [-8.8, 3.2, 2, Math.PI / 2, 2.4, 1.8, 6], [8.8, 3.2, 2, -Math.PI / 2, 2.4, 1.8, 7]].forEach(([x, y, z, ry, w, h, s]) => {
    const g = grp(x, y, z, sc); g.rotation.y = ry; g.add(rbox(w + 0.2, h + 0.2, 0.08, mat(0x1a1410, { roughness: 0.4 }))); const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: art(s, w, h), roughness: 0.8 })); p.position.z = 0.05; g.add(p); });
  [[-4, -5], [4, -5]].forEach(([x, z]) => sc.add(rbox(2.4, 0.45, 0.7, mat(0x2a2a2a, { roughness: 0.4 }), x, 0.225, z)));
  for (let i = 0; i < 4; i++) { const sl = rbox(5, 0.05, 1.2, mat(0xffffff, { emissive: 0xffffff, emissiveIntensity: 1.2 }), 0, 9.9, -10 + i * 4); sl.castShadow = false; sc.add(sl); }
  const posts = [...Array(4)].map((_, i) => { const g = grp(0, 0, 0, sc); g.add(cyl(0.045, 0.045, 0.95, GOLD, 0, 0.48, 0, 10)); g.add(cyl(0.15, 0.17, 0.05, GOLD, 0, 0.025, 0, 16)); g.add(ball(0.065, GOLD, 0, 0.97, 0, undefined, 10)); g.visible = false; return g; });
  const ropes = [...Array(4)].map(() => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1, 8), mat(0x9a0f2a, { roughness: 0.5 })); m.visible = false; sc.add(m); return m; });
  const plT = canvasTex(512, 256, (g, w, h) => { g.fillStyle = '#fbfaf6'; g.fillRect(0, 0, w, h); g.fillStyle = '#111'; g.font = 'italic 500 58px Playfair'; g.fillText('Untitled (Drip)', 30, 90); g.font = '600 34px InterW'; g.fillText('Man, trainers, 2026', 30, 150); g.fillText('Not for sale', 30, 200); });
  const plaque = grp(0, 0, 0, sc); plaque.add(cyl(0.025, 0.025, 1.0, mat(0x222222), 0, 0.5, 0, 6)); const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.25), new THREE.MeshBasicMaterial({ map: plT })); pl.position.set(0, 1.05, 0.03); pl.rotation.x = -0.5; plaque.add(pl); plaque.visible = false;
  const visitors = [...Array(10)].map((_, i) => { const P = npc(i + 2); sc.add(P.root); P.blob = blob(sc, 1.1); return P; });
  const attendant = npc(6, { hood: 0x15151a, hoodD: 0x15151a, pants: 0x15151a }); sc.add(attendant.root);
  const critic = npc(3, { hood: 0x2a2a30, hoodD: 0x2a2a30 }); critic.head.add(cyl(0.38, 0.4, 0.1, mat(0x8a1a2a, { roughness: 0.9 }), 0.05, 0.72, 0, 20)); critic.spine.add(rbox(0.5, 0.14, 0.5, mat(0xd9a520, { roughness: 0.9 }), 0, 0.74, 0)); sc.add(critic.root);
  const hanky = rbox(0.14, 0.14, 0.02, mat(0xffffff)); sc.add(hanky);
  const hero = makeHero(); sc.add(hero.root); const hb = blob(sc);
  S.gallery = { sc, posts, ropes, plaque, visitors, attendant, critic, hanky, hero, hb };
}
{ // ---- the corner shop (Day 27)
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x1a1a1a);
  lightRig(sc, { env: 0.5, sky: 0xeaf4ff, ground: 0x5a5a50, hemi: 0.75, keyC: 0xf0f8ff, key: 1.2, keyPos: [1, 9, 5], R: 8 });
  const lT = canvasTex(128, 128, (g, w, h) => { for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = (x + y) % 2 ? '#d8d2c2' : '#b8b0a0'; g.fillRect(x * 32, y * 32, 32, 32); } }); lT.wrapS = lT.wrapT = THREE.RepeatWrapping; lT.repeat.set(10, 10);
  sc.add(rbox(16, 0.2, 16, new THREE.MeshStandardMaterial({ map: lT, roughness: 0.4 }), 0, -0.1, 0));
  const wm = mat(0xe8e4d4, { roughness: 0.9 }); sc.add(rbox(16, 6, 0.3, wm, 0, 3, -4.2)); sc.add(rbox(0.3, 6, 16, wm, -5, 3, 0)); sc.add(rbox(0.3, 6, 16, wm, 5, 3, 0)); sc.add(rbox(16, 0.2, 16, mat(0xf4f4f0), 0, 4.2, 0));
  sc.add(rbox(1.4, 2.6, 0.32, mat(0x0c0c0c), 2.6, 1.3, -4.05));
  const pr = rnd(21), cols = [0xd9342b, 0x1f5fbf, 0xf2c230, 0x2a8a5a, 0xe87a2a, 0x8a2ab0, 0xffffff]; for (let s = 0; s < 4; s++) { sc.add(rbox(4.2, 0.06, 0.6, mat(0xb0b0b0, { roughness: 0.4, metalness: 0.5 }), -1.8, 0.6 + s * 0.75, -3.75));
    for (let k = 0; k < 13; k++) { const h = 0.3 + pr() * 0.3; sc.add(rbox(0.26, h, 0.3, mat(cols[Math.floor(pr() * cols.length)], { roughness: 0.5 }), -3.7 + k * 0.31, 0.63 + s * 0.75 + h / 2, -3.7)); } }
  const counter = rbox(3.6, 1.1, 1.0, mat(0x8a6a48, { roughness: 0.5 }), 0, 0.55, -0.6); sc.add(counter); sc.add(rbox(3.7, 0.06, 1.1, mat(0xdedad0, { roughness: 0.3 }), 0, 1.13, -0.6));
  sc.add(rbox(0.6, 0.35, 0.5, mat(0x2a2a2e, { roughness: 0.4 }), -1.1, 1.33, -0.8)); sc.add(rbox(0.45, 0.3, 0.05, mat(0x1a3a2a, { emissive: 0x3aff8a, emissiveIntensity: 0.4 }), -1.1, 1.6, -0.6));
  const rack = grp(-2.6, 0, 0.8, sc); rack.add(rbox(0.8, 1.6, 0.4, mat(0xb0b0b0, { roughness: 0.4, metalness: 0.5 }), 0, 0.8, 0)); for (let k = 0; k < 9; k++) rack.add(rbox(0.22, 0.3, 0.06, mat(cols[k % 6], { roughness: 0.4 }), -0.26 + (k % 3) * 0.26, 0.5 + Math.floor(k / 3) * 0.42, 0.22));
  const crisps = rbox(0.24, 0.32, 0.06, mat(0xd9342b, { roughness: 0.35 })); sc.add(crisps);
  [-1.5, 1.5].forEach(x => { const f = rbox(1.2, 0.05, 0.3, mat(0xffffff, { emissive: 0xffffff, emissiveIntensity: 1.5 }), x, 4.08, 0); f.castShadow = false; sc.add(f); });
  const button = cyl(0.07, 0.07, 0.025, GOLD, 0.35, 1.175, -0.25, 24); sc.add(button); const bSp = sparkle(0.5); sc.add(bSp);
  const keeper = npc(4, { hood: 0x3a6a9a, hoodD: 0x3a6a9a }); keeper.spine.add(rbox(0.62, 0.7, 0.03, mat(0xe8e0c8, { roughness: 0.9 }), 0, 0.25, 0.25)); keeper.head.add(rbox(0.3, 0.06, 0.03, mat(0x15100d), 0, 0.22, 0.31)); sc.add(keeper.root);
  const barrow = grp(0, 0, 0, sc); barrow.add(rbox(1.1, 0.4, 0.8, mat(0x2a7a4a, { roughness: 0.4, metalness: 0.4 }), 0, 0.62, 0)); const wheel = cyl(0.22, 0.22, 0.1, mat(0x1a1a1a), 0, 0.22, 0.55, 18); wheel.rotation.z = Math.PI / 2; barrow.add(wheel);
  [-0.3, 0.3].forEach(x => { const hnd = rbox(0.06, 0.06, 1.1, mat(0x5a4030), x, 0.6, -0.75); hnd.rotation.x = -0.15; barrow.add(hnd); barrow.add(rbox(0.05, 0.4, 0.05, mat(0x333333), x, 0.25, -0.3)); });
  const cr = rnd(8); for (let k = 0; k < 34; k++) { const b = rbox(0.3, 0.07, 0.15, mat(k % 4 ? 0x7ab87a : 0x9ad09a, { roughness: 0.8 }), (cr() - 0.5) * 0.85, 0.85 + Math.floor(k / 10) * 0.08 + cr() * 0.05, (cr() - 0.5) * 0.6); b.rotation.y = cr() * 3; barrow.add(b); }
  const watch = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.025, 8, 20), GOLD); sc.add(watch);
  const hero = makeHero(); sc.add(hero.root); const hb = blob(sc);
  S.corner = { sc, keeper, barrow, watch, button, bSp, crisps, hero, hb };
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
// ===== The club (title, Day 1) =====
const CL = S.club; const HX = -0.45, HZ = -1.45, BX = 0.55;
function clubBase(O, o = {}) { const c = CL; resetRig(c.hero); c.hero.root.visible = false; c.hb.visible = false; c.hero.kit.set(o.lvl ?? 0, O, o.kit || {}); resetRig(c.bouncer); c.bouncer.root.scale.setScalar(1.28); c.bouncer.setBrown(!!o.brown); c.bouncer.tag.children[1].rotation.z = 0;
  [...c.queue, ...c.bq].forEach(P => { resetRig(P); P.root.visible = false; P.blob.visible = false; });
  const Q = o.brown ? c.bq : c.queue; Q.forEach((P, i) => { const x = -1.6 - i * 0.92, z = -1.45 + ((i * 37) % 5 - 2) * 0.05; const look = o.lookAt ? Math.atan2(o.lookAt[0] - x, o.lookAt[1] - z) : Math.PI / 2 + ((i * 13) % 3 - 1) * 0.2;
    hp(P, O, [x, 0, z], look, { ...idle(O, i * 1.3), headX: i % 3 === 0 && !o.lookAt ? 0.35 : 0 }, o.lookAt ? (i % 2 ? 'shock' : 'confused') : (i % 3 === 0 ? 'calm' : 'smile'), 'npc'); P.blob.visible = true; P.blob.position.set(x, 0.012, z); });
  c.inner.intensity = 9 + Math.sin(O * 7.3) * 2 + Math.sin(O * 13) * 1.2; return c.hero; }
function heroAt(c, O, pos, ry, p, expr) { hp(c.hero, O, pos, ry, p, expr); c.hb.visible = true; c.hb.position.set(pos[0], 0.012, pos[2]); }
const STOPARM = (k) => ({ arms: [[0, 0, 0.12, 0.12], [lerp(0, -0.85, k), lerp(0, 0.35, k), lerp(-0.12, -0.05, k), lerp(0.12, 0.35, k)]] });
function bouncerAt(O, p, expr, ry = -Math.PI / 2) { hp(CL.bouncer, O, [BX, 0, HZ], ry, p, expr, 'bouncer'); }
const SLAP = 1.7;
shot(0, 3.0, 'club', { ease: 'io', p0: [0.6, 1.0, 5.6], p1: [0.5, 1.05, 5.0], l0: [-0.1, 1.75, -1.45], fov: 46 }, (lt, O) => { clubBase(O, { lvl: 0 }); const k = eOut(seg(O, SLAP - 0.25, SLAP)); const wk = O < 1.45;
  heroAt(CL, O, [lerp(-1.3, HX, eOut(seg(O, 0, 1.45))) - 0.06 * k, 0, HZ], Math.PI / 2, wk ? walk(O, 7.5, 0.8) : { ...idle(O), spineX: -0.1 * k }, O > SLAP ? 'shock' : 'smile');
  bouncerAt(O, { ...idle(O, 2), ...STOPARM(k), headX: 0.12 }, 'calm'); }, { grade: 'club', shakeAt: [[SLAP, 0.012]] });
const T1 = tS(1);
shot(T1, T1 + 2.6, 'club', { ease: 'lin', p0: [3.3, 3.4, 2.3], p1: [3.15, 3.35, 2.05], l0: [HX, 2.05, HZ], fov: 40 }, (lt, O) => { clubBase(O, { lvl: 0 });
  heroAt(CL, O, [HX - 0.06, 0, HZ], Math.PI / 2, { ...idle(O), spineX: -0.06, headX: -0.1 }, 'confused'); bouncerAt(O, { ...idle(O, 2), ...STOPARM(1 - eIO(seg(O, T1 + 0.6, T1 + 1.1))), headX: 0.15 }, 'calm'); }, { grade: 'club', dof: 0.3 });
shot(T1 + 2.6, T1 + 5.4, 'club', { ease: 'lin', p0: [-2.7, 1.9, 1.3], p1: [-2.5, 1.95, 1.1], l0: [BX - 0.1, 3.05, HZ], fov: 46 }, (lt, O) => { clubBase(O, { lvl: 0 });
  heroAt(CL, O, [HX - 0.06, 0, HZ], Math.PI / 2, { ...idle(O) }, 'confused'); const down = Math.sin(seg(O, T1 + 2.7, T1 + 4.2) * Math.PI); const tilt = eIO(seg(O, T1 + 4.4, T1 + 4.9));
  bouncerAt(O, { ...idle(O, 2), headX: 0.45 * down - 0.05, headZ: 0.2 * tilt, arms: [[-0.55, 0, -0.22, 1.55], [-0.6, 0, 0.22, 1.5]] }, tilt > 0.5 ? 'confused' : 'calm'); }, { grade: 'club', dof: 0.35 });
shot(T1 + 5.4, tE(1), 'club', { ease: 'lin', p0: [-0.2, 1.95, 2.7], p1: [-0.2, 1.95, 2.4], l0: [HX, 1.95, HZ], fov: 44 }, (lt, O) => { clubBase(O, { lvl: 0 }); const fl = eOut(seg(O, T1 + 6.2, T1 + 6.6));
  heroAt(CL, O, [HX - 0.06, 0, HZ], 0.5, { ...idle(O), arms: [[lerp(-0.45, -0.25, fl), 0, lerp(0.3, 1.05, fl), lerp(1.25, 0.3, fl)], [lerp(-0.45, -0.25, fl), 0, lerp(-0.3, -1.05, fl), lerp(1.25, 0.3, fl)]], spineX: -0.05, headZ: 0.08 * fl }, 'grit');
  bouncerAt(O, { ...idle(O, 2), arms: [[-0.55, 0, -0.22, 1.55], [-0.6, 0, 0.22, 1.5]], headX: 0.1 }, 'calm'); }, { grade: 'club', dof: 0.3 });
// ===== The wall (Day 3): his shadow struts =====
const WL = S.wall, T3 = tS(3); const STOP3 = T3 + 3.4;
const hx3 = (O) => lerp(-3.6, 0.0, seg(O, T3, STOP3));
function wallBase(O) { const w = WL; resetRig(w.hero); w.hero.kit.set(1, O); resetRig(w.shadow); return w.hero; }
const SOFF = (O) => lerp(1.45, 1.95, eIO(seg(O, T3 + 2.7, T3 + 3.15)));
function shadowAt(O) { const P = WL.shadow, k = O - T3; let x = hx3(O) + SOFF(O), ry = Math.PI / 2, p;
  if (k < 0.9) p = walk(O, 7.5, 1);
  else if (O < T3 + 2.7) { const s = Math.sin(O * 8); p = { ...walk(O, 8, 1.1), hipZ: s * 0.18, spineZ: -s * 0.12, headZ: s * 0.08, arms: [[-s * 0.6, 0, 0.12, 0.4], [-0.2, 0, -0.65, 1.9]] }; }
  else if (O < T3 + 3.15) { ry = Math.PI / 2 + eIO(seg(O, T3 + 2.7, T3 + 3.15)) * Math.PI * 2; p = { ...idle(O), arms: [[-0.2, 0, 1.0, 0.3], [-0.2, 0, -1.0, 0.3]] }; x = hx3(T3 + 2.7) + SOFF(O); }
  else { x = hx3(T3 + 2.7) + SOFF(O); const v = Math.floor((O - T3 - 3.15) / 0.9) % 3; ry = [-0.5, 0.9, Math.PI / 2 + 0.3][v];
    p = [{ hipZ: 0.25, spineZ: -0.15, headZ: 0.25, arms: [[-2.6, 0, 0.6, 0.3], [-0.2, 0, -0.65, 1.9]] }, { hipZ: -0.2, spineX: -0.15, headX: -0.2, arms: [[-0.2, 0, 0.65, 1.9], [-0.2, 0, -0.65, 1.9]] }, { hipZ: 0.2, spineZ: 0.1, arms: [[-1.4, 0, 0.2, 2.0], [-0.3, 0, -1.2, 0.2]], legs: [[0.3, 0.4, 0.2], [0, 0]] }][v]; }
  pose(P, p); P.root.position.set(x / 1.12, 0, 0); P.root.rotation.set(0, ry, 0); }
shot(T3, T3 + 3.6, 'wall', { ease: 'lin', pf: (O) => V([hx3(O) + 0.75, 1.8, 7.0]), lf: (O) => V([hx3(O) + 0.8, 1.75, -0.6]), fov: 44 }, (lt, O) => { const h = wallBase(O); const moving = O < STOP3;
  hp(h, O, [hx3(O), 0, 0.3], Math.PI / 2, moving ? walk(O, 7.5, 1) : { ...idle(O) }, 'calm'); WL.hb.position.set(hx3(O), 0.012, 0.3); shadowAt(O); }, { grade: 'wall' });
shot(T3 + 3.6, tE(3), 'wall', { ease: 'lin', p0: [0.75, 1.8, 6.0], p1: [0.8, 1.8, 5.5], l0: [0.85, 1.85, -0.5], fov: 50 }, (lt, O) => { const h = wallBase(O); const turn = eOut(seg(O, T3 + 3.6, T3 + 4.0));
  hp(h, O, [0, 0, 0.3], Math.PI / 2 - 1.0 * turn, { ...idle(O), headY: 0.55 * turn, headX: -0.05, arms: [[0, 0, 0.12, 0.12], [-0.9 * turn, 0, -0.5 * turn, 0.6]] }, O > T3 + 4.1 ? 'confused' : 'shock'); WL.hb.position.set(0, 0.012, 0.3); shadowAt(O); }, { grade: 'wall' });
// ===== The zoo (Day 5): nature documentary =====
const ZO = S.zoo, T5 = tS(5); const PK = [0.7, 0, -0.4], ZH = [-1.6, 0, -4.6];
const FOLD = T5 + 4.6, OFF = T5 + 5.3;
function zooBase(O) { resetRig(ZO.hero); ZO.hero.kit.set(2, O); const pc = ZO.peacock; const open = eOut(seg(O, T5 + 0.9, T5 + 1.9)) * (1 - eIO(seg(O, FOLD, FOLD + 0.6)));
  pc.setTail(open); pc.userData.fe.forEach((p, i) => p.rotation.z += 0.02 * Math.sin(O * 31 + i) * open); const look = seg(O, T5 + 3.6, T5 + 4.1); const leave = seg(O, OFF, OFF + 1.4);
  pc.rotation.y = lerp(0.15, -2.4, eIO(look)) * (1 - leave) + lerp(-2.4, 1.6, eIO(seg(O, OFF - 0.2, OFF + 0.3))) * leave; pc.position.set(lerp(PK[0], 2.9, eIO(leave)), Math.abs(Math.sin(O * 9)) * 0.03 * (leave > 0 && leave < 1), lerp(PK[2], -1.3, eIO(leave))); pc.scale.setScalar(lerp(1, 0.55, eIO(seg(O, OFF + 0.8, OFF + 1.4))));
  pc.userData.neck.rotation.set(0.25 + 0.15 * Math.sin(O * 2), 0, 0); pc.userData.head.rotation.set(-0.15, Math.sin(O * 1.3) * 0.3, 0);
  ZO.rustle.rotation.z = O > OFF + 0.9 && O < OFF + 2.2 ? Math.sin(O * 40) * 0.03 : 0;
  hp(ZO.hero, O, ZH, 0, { ...idle(O), hipZ: 0.12, spineZ: -0.06, headX: -0.08, arms: [[-0.2, 0, 0.62, 1.85], [-0.15, 0, -0.35, 0.3]] }, 'smirk'); ZO.hb.position.set(ZH[0], 0.012, ZH[2]); return ZO.hero; }
shot(T5, T5 + 3.8, 'zoo', { ease: 'lin', p0: [0.25, 1.15, 9.6], p1: [0.3, 1.15, 9.2], l0: [0.7, 1.3, -0.4], fov: 26 }, (lt, O) => { zooBase(O); }, { grade: 'doc', dof: 0.55, letterbox: true, live: 0.6 });
shot(T5 + 3.8, T5 + 6.2, 'zoo', { ease: 'lin', p0: [3.0, 1.2, 4.6], p1: [2.8, 1.25, 4.3], l0: [-0.3, 1.6, -2.4], fov: 30 }, (lt, O) => { zooBase(O); }, { grade: 'doc', letterbox: true, live: 0.6 });
shot(T5 + 6.2, tE(5), 'zoo', { ease: 'lin', p0: [-0.9, 2.0, 4.4], p1: [-0.95, 2.0, 4.0], l0: [ZH[0], 2.0, ZH[2]], fov: 25 }, (lt, O) => { zooBase(O); const w = Math.sin(seg(O, T5 + 6.8, T5 + 7.8) * Math.PI);
  hp(ZO.hero, O, ZH, 0, { ...idle(O), headY: 0.45, headX: 0.08, arms: [[-0.15, 0, 0.3, 0.3], [-0.3 - 0.4 * w, 0, -0.45 - 0.25 * w, 0.9]] }, 'worried'); }, { grade: 'doc', dof: 0.45, letterbox: true, live: 0.6 });
// ===== The shop window (Day 8): the mannequins notice =====
const WN = S.window, T8 = tS(8); const TURN8 = T8 + 2.1, DROP8 = T8 + 3.5;
function winBase(O, heroPos) { resetRig(WN.hero); WN.hero.kit.set(3, O); WN.hb.position.set(heroPos[0], 0.012, heroPos[2]);
  const k = eOut(seg(O, TURN8, TURN8 + 0.35)); WN.mans.forEach((P, i) => { const mx = P.root.position.x; pose(P, { arms: [[0.05, 0, 0.18, 0.15], [0.05, 0, -0.18, 0.15]] }); P.neck.rotation.y = k * clamp(Math.atan2(heroPos[0] - mx, heroPos[2] - 0.1), -1.3, 1.3); });
  const m2 = WN.mans[2], d = seg(O, DROP8, DROP8 + 0.45); m2.fab.color.setHex(d > 0.05 ? 0xededf0 : 0xd9a520); WN.jacket.visible = d > 0.05; WN.jacket.position.set(1.3, lerp(1.75, 0.37, eIn(d)), lerp(0.1, -0.35, d)); WN.jacket.rotation.set(lerp(0, -0.3, d), 0.3 * d, lerp(0, 0.1, d)); }
const hx8 = (O) => [lerp(-3.4, 1.3, seg(O, T8, T8 + 3.0)), 0, 3.2];
shot(T8, T8 + 2.9, 'window', { ease: 'lin', p0: [-0.3, 2.1, 8.6], p1: [-0.2, 2.1, 8.2], l0: [0.2, 1.7, 0.8], fov: 50 }, (lt, O) => { const p = hx8(O); winBase(O, p); hp(WN.hero, O, p, Math.PI / 2, walk(O, 7.5, 1), 'smirk'); }, { grade: 'shop' });
const HB8 = (O) => [2.6, 0, lerp(3.4, 4.3, eIO(seg(O, T8 + 3.6, T8 + 5.5)))];
shot(T8 + 2.9, tE(8), 'window', { ease: 'lin', p0: [1.9, 1.75, -1.5], p1: [1.9, 1.8, -1.2], l0: [2.6, 2.05, 3.8], fov: 50 }, (lt, O) => { const p = HB8(O); winBase(O, p); const back = seg(O, T8 + 3.6, T8 + 5.5);
  hp(WN.hero, O, p, Math.PI - 0.15, back > 0 && back < 1 ? { ...walk(O, 6, 0.4), spineX: -0.12 } : { ...idle(O), spineX: -0.1, arms: [[-0.4, 0, 0.35, 0.8], [-0.4, 0, -0.35, 0.8]] }, 'worried'); }, { grade: 'shop', dof: 0.25 });
// ===== The plaza (Day 10): a man in white gloves ties his laces =====
const PZ = S.plaza, T10 = tS(10); const TIED = T10 + 4.95, RISE = T10 + 5.2;
function plazaBase(O, o = {}) { const p = PZ; resetRig(p.hero); p.hero.root.visible = false; p.hb.visible = false; resetRig(p.guard); p.guard.root.visible = false; p.gb.visible = false; p.rain.visible = false; p.steam.forEach(s => s.visible = false); p.cs.visible = !!o.cs;
  p.crowd.forEach(P => { resetRig(P); P.root.visible = false; P.blob.visible = false; }); const dusk = o.dusk ?? 0;
  p.key.intensity = lerp(2.2, 0.35, dusk); p.key.color.setHex(dusk ? 0x9fb0d8 : 0xfff0d8); p.hemi.intensity = lerp(0.75, 0.45, dusk); p.sc.environmentIntensity = lerp(0.5, 0.25, dusk); p.sky.material.color.setHex(dusk ? 0x4a5a80 : 0xffffff);
  p.lamps.forEach(l => { l.light.intensity = dusk * 12; l.children[0].material = mat(0xffc27a, { emissive: 0xffc27a, emissiveIntensity: dusk ? 3 : 0.2 }); }); p.paveM.roughness = lerp(0.6, 0.12, dusk); p.paveM.metalness = lerp(0.05, 0.25, dusk);
  if (o.sun) { p.key.position.copy(V(o.sun)); } else p.key.position.set(12, 18, 14); p.hero.kit.set(o.lvl ?? 3, O, o.kit || {}); return p.hero; }
const GPOS = [-1.0, 0, 0.32];
function guardAt(O) { const G = PZ.guard; const up = eIO(seg(O, RISE, RISE + 0.7)); const tie = O < TIED ? Math.sin(O * 14) : 0;
  const kneel = { ...KNEEL, spineX: 0.55, headX: 0.35, arms: [[-0.75 + 0.08 * tie, 0.2, -0.1, 0.5], [-0.75 - 0.08 * tie, -0.2, 0.1, 0.5]] };
  const stand = { ...idle(O, 3), arms: [[0, 0, 0.12, 0.15], [-0.25, 0, -2.3, 2.3]], headZ: 0.1 };
  const p = up > 0 ? { bob: lerp(-0.42, 0, up), spineX: lerp(0.55, 0.02, up), headX: lerp(0.35, 0, up), legs: [[lerp(1.5, 0, up), lerp(1.6, 0, up)], [lerp(0.05, 0, up), lerp(1.5, 0, up)]], arms: up > 0.6 ? stand.arms : kneel.arms } : kneel;
  hp(G, O, GPOS, lerp(Math.PI / 2, 0.5, up), p, 'calm', 'guard'); G.glasses.visible = true; PZ.gb.visible = true; PZ.gb.position.set(GPOS[0], 0.012, GPOS[2]); }
shot(T10, T10 + 3.2, 'plaza', { ease: 'lin', p0: [2.3, 0.95, 2.7], p1: [2.1, 0.9, 2.45], l0: [-0.5, 0.65, 0.2], fov: 44 }, (lt, O) => { const h = plazaBase(O, { kit: { untied: O < TIED } }); hp(h, O, [0, 0, 0], 0, { ...idle(O), headX: 0.3 }, 'smirk'); PZ.hb.visible = true; PZ.hb.position.set(0, 0.012, 0); guardAt(O); }, { grade: 'plaza' });
shot(T10 + 3.2, tE(10), 'plaza', { ease: 'io', p0: [1.5, 0.7, 2.0], p1: [1.6, 2.0, 3.5], l0: [-0.3, 0.35, 0.3], l1: [-0.05, 1.9, 0], fov: 44 }, (lt, O) => { const h = plazaBase(O, { kit: { untied: O < TIED } }); const look = seg(O, T10 + 5.6, T10 + 6.0);
  hp(h, O, [0, 0, 0], 0.15, { ...idle(O), headX: lerp(0.32, 0, look), arms: [[0, 0, 0.12, 0.15], [-0.85, 0, -0.32, 1.25]] }, look > 0.5 ? 'smirk' : 'calm'); PZ.hb.visible = true; PZ.hb.position.set(0, 0.012, 0); guardAt(O); }, { grade: 'plaza' });
// ===== Day 12: bullet time in the rain =====
const T12 = tS(12); const F0 = T12 + 1.2, F1 = T12 + 4.4, SIZZ = T12 + 3.6;
const rainM4 = new THREE.Matrix4(), rainQ = new THREE.Quaternion();
function rainAt(O) { const p = PZ; p.rain.visible = true; const tf = O >= F0 && O < F1 ? F0 : O; const frozen = O >= F0 && O < F1;
  p.RD.forEach((d, i) => { let y = ((d.y - d.s * tf) % 8 + 8) % 8, x = d.x, z = d.z; const r = Math.hypot(x, z);
    if (y < 2.8 && r < 1.25) { const push = (1.25 - r) * (frozen ? 1 : 0.6); x += x / (r + 1e-3) * push; z += z / (r + 1e-3) * push; }
    rainM4.compose(V([x, y, z]), rainQ, V([1, frozen ? 0.7 : 1.6, 1])); p.rain.setMatrixAt(i, rainM4); }); p.rain.instanceMatrix.needsUpdate = true;
  const k = seg(O, SIZZ, SIZZ + 1.0); p.steam.forEach((s, i) => { s.visible = k > 0 && k < 1; s.position.set(0.32 + Math.sin(i * 2.1) * 0.12 * k, 2.25 + k * (0.4 + i * 0.08), 0.1 + Math.cos(i * 1.7) * 0.1 * k); s.scale.setScalar(0.12 + 0.3 * k); s.material.opacity = 0.7 * (1 - k); }); }
function rainHero(O) { const h = plazaBase(O, { dusk: 1, lvl: 4 }); PZ.hb.visible = true; PZ.hb.position.set(0, 0.012, 0); return h; }
const RPOSE = (Of) => ({ ...idle(Of), headX: -0.3, arms: [[0, 0, 0.12, 0.15], [-0.85, 0, -0.55, 0.35]] });
shot(T12, F0, 'plaza', { ease: 'lin', p0: [1.4, 1.85, 3.9], p1: [1.3, 1.85, 3.6], l0: [0, 1.95, 0], fov: 44 }, (lt, O) => { const h = rainHero(O); rainAt(O); hp(h, O, [0, 0, 0], 0.35, RPOSE(O), 'confused'); }, { grade: 'rain' });
shot(F0, F1, 'plaza', { ease: 'lin', pf: (O) => { const a = 0.35 + Math.PI * 2 * eIO(seg(O, F0, F1)); return V([Math.sin(a) * 3.7, 1.75 + 0.25 * Math.sin(seg(O, F0, F1) * Math.PI), Math.cos(a) * 3.7]); }, lf: () => V([0, 1.8, 0]), fov: 46 }, (lt, O) => { const h = rainHero(O); rainAt(O); hp(h, O, [0, 0, 0], 0.35, RPOSE(F0), 'calm'); h.pupils.forEach(p => p.position.x += 0.04 * Math.sin(O * 3)); }, { grade: 'freeze', live: 0 });
shot(F1, tE(12), 'plaza', { ease: 'lin', p0: [0.95, 2.0, 3.3], p1: [0.9, 2.0, 3.0], l0: [0, 2.0, 0], fov: 44 }, (lt, O) => { const h = rainHero(O); rainAt(O); const g = eOut(seg(O, F1 + 0.3, F1 + 0.8));
  hp(h, O, [0, 0, 0], 0.3, { ...idle(O), headX: -0.04, arms: [[lerp(0, -0.5, g), 0, lerp(0.12, 0.3, g), lerp(0.15, 1.35, g)], [lerp(-0.85, -0.5, g), 0, lerp(-0.55, -0.3, g), lerp(0.35, 1.35, g)]] }, 'smirk'); }, { grade: 'rain', dof: 0.3 });
// ===== Day 15: the courtroom sketch =====
const CT = S.court, T15 = tS(15); const GAVEL = T15 + 7.6; const JPOS = [0, 0.9, -3.6], DPOS = [2.6, 0.375, 1.8], DRY = -2.69;
function courtBase(O) { const c = CT; resetRig(c.hero); c.hero.kit.set(4, O); resetRig(c.judge);
  const lean = eIO(seg(O, T15 + 5.0, T15 + 5.6)) * (1 - eIO(seg(O, GAVEL - 0.6, GAVEL - 0.3))); const up = seg(O, GAVEL - 0.45, GAVEL - 0.05), dn = seg(O, GAVEL - 0.05, GAVEL);
  const ga = -0.6 - 1.6 * eOut(up) + 1.6 * eIn(dn);
  hp(c.judge, O, JPOS, 0, { ...SIT, spineX: 0.05 + 0.42 * lean, headX: 0.1 - 0.25 * lean, arms: [[-0.55, 0, 0.2, 0.9], [ga, 0, -0.25, 0.7]] }, lean > 0.3 ? 'confused' : 'grit', 'judge');
  const hand = wp(c.judge.arms[1].el).add(V([0, -0.42, 0])); c.gavel.position.copy(hand); c.gavel.rotation.set(-ga - 1.2, 0, 0.3);
  c.pub.forEach((P, i) => { pose(P, { ...SIT, ...idle(O, i), bob: -0.38 }); P.root.rotation.y = Math.PI + 0.15 * (i - 2.5); P.face(i % 2 ? 'shock' : 'calm', O, false); });
  return c.hero; }
const proud = (O) => ({ ...idle(O), headX: -0.15, spineX: -0.06, arms: [[-0.95, 0, -0.38, 1.5], [0, 0, -0.15, 0.15]] });
shot(T15, T15 + 2.3, 'court', { ease: 'lin', p0: [1.7, 1.9, 1.4], p1: [1.55, 1.95, 1.0], l0: [0, 2.95, -3.5], fov: 42 }, (lt, O) => { const h = courtBase(O); hp(h, O, DPOS, DRY, { ...idle(O) }, 'worried'); }, { grade: 'court', sketch: true });
shot(T15 + 2.3, T15 + 5.3, 'court', { ease: 'lin', p0: [0.7, 2.75, -1.2], p1: [0.85, 2.75, -0.8], l0: [DPOS[0], 2.65, DPOS[2]], fov: 40 }, (lt, O) => { const h = courtBase(O); hp(h, O, DPOS, DRY, proud(O), O > T15 + 3.2 ? 'smirk' : 'calm'); }, { grade: 'court', sketch: true });
shot(T15 + 5.3, tE(15), 'court', { ease: 'io', p0: [0.55, 2.6, 0.9], p1: [0.4, 2.85, -0.4], l0: [0, 2.85, -3.0], fov: 42 }, (lt, O) => { const h = courtBase(O); hp(h, O, DPOS, DRY, proud(O), 'smirk'); }, { grade: 'court', sketch: true, shakeAt: [[GAVEL, 0.01]] });
// ===== Day 18: CCTV in the alley =====
const AL = S.alley, T18 = tS(18); const JUMP = T18 + 3.0;
const MG = [{ from: [-1.65, -1.2], to: [-0.85, -0.55] }, { from: [1.7, -3.0], to: [0.9, -2.0] }];
function alleyBase(O) { const a = AL; resetRig(a.hero); a.hero.kit.set(4, O); a.muggers.forEach(P => { resetRig(P); P.wallet.visible = false; }); return a.hero; }
const CCTV = { ease: 'lin', p0: [1.85, 4.7, 4.9], l0: [-0.1, 0.8, -2.4], fov: 74 };
shot(T18, JUMP, 'alley', CCTV, (lt, O) => { const h = alleyBase(O); const hz = lerp(-6.5, -1.3, eOut(seg(O, T18, T18 + 1.8)));
  hp(h, O, [0, 0, hz], 0, O < T18 + 1.8 ? walk(O, 7.5, 1) : { ...idle(O) }, O > T18 + 2.0 ? 'worried' : 'calm'); AL.hb.position.set(0, 0.012, hz);
  AL.muggers.forEach((P, i) => { const k = eOut(seg(O, T18 + 1.3, T18 + 2.0)); const m = MG[i]; const x = lerp(m.from[0], m.to[0], k), z = lerp(m.from[1], m.to[1], k);
    hp(P, O, [x, 0, z], Math.atan2(0 - x, hz - z), k < 1 ? walk(O, 7, 0.8) : { ...idle(O, i), headX: 0.4 * Math.sin(seg(O, T18 + 2.0, JUMP) * Math.PI * 1.5) }, 'calm', 'mugger'); P.blob.position.set(x, 0.012, z); }); }, { grade: 'cctv', cctv: true, fps: 12, live: 0 });
shot(JUMP, tE(18), 'alley', CCTV, (lt, O) => { const h = alleyBase(O); const fan = Math.sin(O * 5);
  hp(h, O, [0, 0, -1.3], 0, { ...idle(O), arms: [[-0.7, 0, 0.45, 0.9 + 0.1 * fan], [-0.7, 0, -0.45, 0.9 - 0.1 * fan]] }, 'smirk'); AL.hb.position.set(0, 0.012, -1.3);
  [0, 1].forEach(i => { const w = wp(h.arms[i].el).add(V([0, -0.45, 0.06])); const wl = AL.muggers[i].wallet; wl.visible = true; wl.position.copy(w); wl.rotation.set(0.3, 0, 0.2 * fan); });
  AL.muggers.forEach((P, i) => { const z = lerp(-2.2 - i * 0.6, -8.5, seg(O, JUMP, JUMP + 4.0)), x = (i ? 0.7 : -0.7); const c = Math.sin(O * 16 + i) * 0.5 + 0.5;
    hp(P, O, [x, 0, z], Math.PI, { ...walk(O, 6.5, 0.7), arms: [[-1.1, 0, -0.25 + 0.18 * c, 0.7], [-1.1, 0, 0.25 - 0.18 * c, 0.7]] }, 'smile', 'mugger'); P.blob.position.set(x, 0.012, z); }); }, { grade: 'cctv', cctv: true, fps: 12, live: 0 });
// ===== Day 22: the gallery =====
const GL = S.gallery, T22 = tS(22); const PP = [[-1.15, 1.1], [1.15, 1.1], [1.15, -1.1], [-1.15, -1.1]];
function galleryBase(O) { const g = GL; resetRig(g.hero); g.hero.kit.set(5, O, { glow: 0.6 }); hp(g.hero, O, [0, 0, 0], 0, { ...KNEEL, spineX: 0.3, headX: 0.25, arms: [[-0.6, 0.15, -0.05, 0.35], [-0.6, -0.15, 0.05, 0.35]] }, 'calm');
  g.posts.forEach((p, i) => { const t = T22 + 0.9 + i * 0.5; p.visible = O > t; p.position.set(PP[i][0], 0.35 * (1 - eOut(seg(O, t, t + 0.25))), PP[i][1]); });
  g.ropes.forEach((r, i) => { const a = PP[i], b = PP[(i + 1) % 4]; r.visible = O > T22 + 3.0; r.position.set((a[0] + b[0]) / 2, 0.88, (a[1] + b[1]) / 2); r.scale.set(1, Math.hypot(b[0] - a[0], b[1] - a[1]), 1); r.rotation.set(0, Math.atan2(b[0] - a[0], b[1] - a[1]), Math.PI / 2); r.rotation.order = 'YXZ'; r.rotation.set(Math.PI / 2, Math.atan2(b[0] - a[0], b[1] - a[1]), 0); });
  g.plaque.visible = O > T22 + 3.2; g.plaque.position.set(0, 0, 1.65);
  const ai = clamp(Math.floor((O - T22 - 0.6) / 0.5), 0, 3); const ap = O < T22 + 3.4 ? [PP[ai][0] * 1.45, PP[ai][1] * 1.45] : [2.6, 1.6]; const aw = O > T22 + 0.4 && O < T22 + 3.4;
  hp(g.attendant, O, [ap[0], 0, ap[1]], Math.atan2(-ap[0], -ap[1]), aw ? { ...idle(O), spineX: 0.3, arms: [[-0.7, 0, 0.2, 0.4], [-0.7, 0, -0.2, 0.4]] } : { ...idle(O), ...CROSS }, 'calm', 'npc');
  g.visitors.forEach((P, i) => { const a = Math.PI + (i - 4.5) * 0.32, r = 3.0 + (i % 2) * 0.9; const tx = Math.sin(a) * r, tz = Math.cos(a) * r - 0.4; const t0 = T22 + 1.2 + i * 0.25; const k = eOut(seg(O, t0, t0 + 1.6));
    const sx = tx * 3.2, sz = tz - 3; const x = lerp(sx, tx, k), z = lerp(sz, tz, k); hp(P, O, [x, 0, z], k < 1 ? Math.atan2(tx - sx, tz - sz) : Math.atan2(-tx, -tz), k < 1 ? walk(O, 7, 0.8) : { ...idle(O, i), headX: 0.15 }, i % 3 ? 'shock' : 'smile', 'npc'); P.blob.position.set(x, 0.012, z); });
  const cx = -2.1, cz = -1.0; const dab = O > T22 + 4.0; hp(g.critic, O, [cx, 0, cz], Math.atan2(-cx, -cz), { ...idle(O), headZ: 0.12, arms: [[0, 0, 0.12, 0.15], dab ? [-1.2, 0, -0.95, 1.6] : [0, 0, -0.12, 0.15]] }, dab ? 'worried' : 'shock', 'npc');
  g.hanky.visible = dab; if (dab) { g.hanky.position.copy(wp(g.critic.arms[1].el).add(V([0, -0.42, 0]))); g.hanky.rotation.y = Math.sin(O * 6) * 0.3; }
  return g.hero; }
shot(T22, T22 + 3.8, 'gallery', { ease: 'lin', p0: [0.3, 9.0, 13.0], p1: [0.3, 8.4, 12.0], l0: [0, 0.4, -1.8], fov: 44 }, (lt, O) => { galleryBase(O); }, { grade: 'gallery' });
shot(T22 + 3.8, tE(22), 'gallery', { ease: 'io', p0: [0.35, 1.45, 3.5], p1: [0.25, 1.5, 2.45], l0: [0, 1.55, 0], fov: 42 }, (lt, O) => { const h = galleryBase(O); h.headX = 0; h.neck.rotation.y = 0.35 * Math.sin(O * 1.6); h.neck.rotation.x = 0.05; }, { grade: 'gallery', dof: 0.4 });
// ===== Day 27: the corner shop =====
const CS = S.corner, T27 = tS(27); const PUT = T27 + 1.4; const HC = [0.55, 0, 0.55];
function cornerBase(O) { const c = CS; resetRig(c.hero); c.hero.kit.set(5, O, { glow: 0.7 }); const walkIn = seg(O, T27, T27 + 0.9); const hp0 = [HC[0], 0, lerp(2.4, HC[2], eOut(walkIn))]; const put = Math.sin(seg(O, PUT - 0.35, PUT + 0.35) * Math.PI);
  const faceK = eIO(seg(O, T27 + 3.4, T27 + 3.9)); hp(c.hero, O, hp0, lerp(Math.PI + 0.25, Math.PI / 2 + 0.3, faceK), walkIn < 1 ? walk(O, 7.5, 0.9) : { ...idle(O), arms: [[-0.4, 0, 0.35, 1.0], [-0.3 - 0.9 * put, 0, -0.18, 0.2 + 0.3 * put]], headX: 0.12 * put }, O > T27 + 4.6 ? 'smirk' : O > T27 + 2.6 ? 'shock' : 'calm'); c.hb.position.set(hp0[0], 0.012, hp0[2]);
  c.crisps.position.copy(wp(c.hero.arms[0].el).add(V([0, -0.42, 0.08]))); c.button.visible = O > PUT; c.bSp.visible = O > PUT; c.bSp.position.set(0.35, 1.25, -0.22); c.bSp.scale.setScalar(0.35 + 0.35 * Math.pow(Math.max(0, Math.sin(O * 4)), 4));
  const path = [[2.65, -3.3], [2.65, -1.5], [2.45, 0.6], [1.75, 1.1]]; const k = seg(O, T27 + 2.4, T27 + 4.1); const seg3 = Math.min(2, Math.floor(k * 3)), f = k * 3 - seg3; const a = path[seg3], b = path[seg3 + 1];
  const bx = lerp(a[0], b[0], f), bz = lerp(a[1], b[1], f); const dir = Math.atan2(b[0] - a[0], b[1] - a[1]); const moving = k > 0 && k < 1;
  const kp = O < T27 + 2.4 ? [-0.3, 0, -1.65] : [bx - Math.sin(dir) * 1.25, 0, bz - Math.cos(dir) * 1.25]; const kry = O < T27 + 2.4 ? 0.2 : k >= 1 ? Math.atan2(HC[0] - kp[0], HC[2] - kp[2]) : dir;
  const give = seg(O, T27 + 4.3, T27 + 4.7);
  hp(c.keeper, O, kp, kry, moving ? { ...walk(O, 7, 0.7), arms: [[-0.75, 0, 0.12, 0.3], [-0.75, 0, -0.12, 0.3]] } : O < T27 + 2.4 ? { ...idle(O), headX: 0.1 } : { ...idle(O), arms: [[0, 0, 0.12, 0.15], [-1.0 * Math.sin(give * Math.PI), 0, -0.2, 0.4]] }, O < T27 + 1.6 ? 'calm' : 'shock', 'npc');
  c.barrow.visible = O > T27 + 2.4; c.barrow.position.set(bx, 0, bz); c.barrow.rotation.y = dir; c.barrow.children[1].rotation.x = O * 6 * moving;
  c.watch.visible = give > 0; c.watch.position.copy(give < 1 ? wp(c.keeper.arms[1].el).add(V([0, -0.42, 0])).lerp(V([bx, 1.12, bz]), eIO(give)) : V([bx, 1.12, bz])); c.watch.rotation.x = Math.PI / 2;
  return c.hero; }
shot(T27, T27 + 2.3, 'corner', { ease: 'lin', p0: [1.05, 1.45, -2.7], p1: [1.0, 1.45, -2.5], l0: [0.5, 1.85, 0.6], fov: 44 }, (lt, O) => { cornerBase(O); }, { grade: 'corner', dof: 0.25 });
shot(T27 + 2.3, tE(27), 'corner', { ease: 'lin', p0: [3.5, 2.4, 3.8], p1: [3.3, 2.35, 3.5], l0: [1.0, 1.3, -0.2], fov: 50 }, (lt, O) => { cornerBase(O); }, { grade: 'corner' });
// ===== Day 30: all of London copies the £40 jacket (time-lapse) =====
const T30 = tS(30);
function lapseBase(O) { const a = (O - T30) * 0.9; const h = plazaBase(O, { cs: true, lvl: 5, sun: [Math.cos(a) * 22, 16 + 4 * Math.sin(a), Math.sin(a) * 22], kit: { glow: 1.2 } }); hp(h, O, [0, 0, 0], 0.2, { ...idle(O), arms: [[-0.2, 0, 0.62, 1.85], [-0.2, 0, -0.62, 1.85]] }, 'smirk'); PZ.hb.visible = true; PZ.hb.position.set(0, 0.012, 0);
  PZ.crowd.forEach((P, i) => { let x, z, ry, p; if (i < 9) { x = -6.4 + i * 0.85; z = -11.6 + (i % 2) * 0.12; ry = Math.PI / 2; p = idle(O, i); }
    else { const r = 2.3 + (i % 5) * 1.3, sp = (i % 2 ? 1 : -1) * (0.35 + (i % 3) * 0.12), ph = i * 1.9; const ang = ph + (O - T30) * sp * 3; x = Math.sin(ang) * r; z = Math.cos(ang) * r - 1.5; ry = ang + (sp > 0 ? Math.PI / 2 : -Math.PI / 2); p = walk(O * 2.2 + i, 7.5, 1.1); }
    hp(P, O, [x, 0, z], ry, p, 'calm', 'npc'); P.blob.visible = true; P.blob.position.set(x, 0.012, z); }); }
shot(T30, T30 + 3.2, 'plaza', { ease: 'io', p0: [1.5, 9.5, 12.5], p1: [1.2, 8.2, 10.8], l0: [-1.2, 0.8, -4.5], fov: 50 }, (lt, O) => { lapseBase(O); }, { grade: 'lapse', mblur: 3 });
shot(T30 + 3.2, tE(30), 'plaza', { ease: 'lin', p0: [-0.6, 2.7, -5.2], p1: [-0.9, 2.7, -5.8], l0: [-3.4, 3.0, -11.6], fov: 50 }, (lt, O) => { lapseBase(O); }, { grade: 'lapse', mblur: 2 });
// ===== END: back at the club; the £40 jacket is the dress code =====
const TE = tS('END'); const STOPE = TE + 1.0;
const heroE = (O) => [lerp(2.6, HX, eOut(seg(O, TE, STOPE - 0.1))), 0, lerp(2.4, HZ, eOut(seg(O, TE, STOPE - 0.1)))];
function endBase(O) { const h = clubBase(O, { lvl: 5, brown: true, lookAt: heroE(O).filter((_, i) => i !== 1), kit: { glow: 1.6 } }); return h; }
shot(TE, TE + 1.5, 'club', { ease: 'lin', p0: [1.2, 3.3, 7.6], p1: [1.0, 3.2, 7.0], l0: [-1.4, 1.5, -1.2], fov: 50 }, (lt, O) => { endBase(O); const p = heroE(O); const k = eOut(seg(O, STOPE - 0.25, STOPE));
  heroAt(CL, O, p, O < STOPE - 0.1 ? Math.atan2(HX - 2.6, HZ - 2.4) : Math.PI / 2, O < STOPE - 0.1 ? walk(O, 7.5, 1) : { ...idle(O), spineX: -0.1 * k }, 'smirk'); bouncerAt(O, { ...idle(O, 2), ...STOPARM(k) }, 'calm'); }, { grade: 'club' });
shot(TE + 1.5, TE + 2.85, 'club', { ease: 'lin', p0: [-2.8, 2.5, 2.6], p1: [-2.65, 2.5, 2.35], l0: [BX, 2.5, HZ], fov: 44 }, (lt, O) => { endBase(O); heroAt(CL, O, [HX - 0.06, 0, HZ], Math.PI / 2, { ...idle(O) }, 'smirk');
  bouncerAt(O, { ...idle(O, 2), headX: 0.08, arms: [[-0.55, 0, -0.22, 1.55], [-0.6, 0, 0.22, 1.5]] }, 'calm'); }, { grade: 'club', dof: 0.3 });
shot(TE + 2.85, TE + 4.1, 'club', { ease: 'lin', pf: () => wp(CL.bouncer.tag.children[1]).add(V([-0.9, 0.25, 0.9])), lf: () => wp(CL.bouncer.tag.children[1]).add(V([0, 0.25, 0])), fov: 40 }, (lt, O) => { endBase(O); heroAt(CL, O, [HX - 0.06, 0, HZ], Math.PI / 2, { ...idle(O) }, 'smirk'); const tap = Math.max(0, Math.sin((O - TE - 3.0) * 9));
  bouncerAt(O, { ...idle(O, 2), headX: 0.08, arms: [[-0.95, 0, -0.62, 1.2 + 0.12 * tap], [-0.95, 0.3, -0.25, 1.3]] }, 'calm'); CL.bouncer.tag.rotation.set(0, -0.6, 0.1 * tap); CL.bouncer.tag.children[1].rotation.z = Math.PI; }, { grade: 'club', live: 0.4 });
shot(TE + 4.1, DUR + 0.1, 'club', { ease: 'lin', p0: [0.75, 2.1, 0.95], p1: [0.68, 2.12, 0.75], l0: [HX, 2.1, HZ], fov: 44 }, (lt, O) => { endBase(O); const dn = Math.sin(seg(O, TE + 4.15, TE + 4.35) * Math.PI);
  heroAt(CL, O, [HX - 0.06, 0, HZ], Math.PI / 2 - 0.9, { ...idle(O), headX: 0.4 * dn }, O > TE + 4.4 ? 'shock' : 'worried'); bouncerAt(O, { ...idle(O, 2) }, 'calm'); CL.bouncer.tag.visible = false; }, { grade: 'club', dof: 0.3, dark: (O) => O > TE + 6.12 ? 1 : 0 });
const SAFE_L = 90, SAFE_R = 140, CAP_W = W - SAFE_L - SAFE_R, CAP_X = SAFE_L + CAP_W / 2;   // safe area: full-screen players crop the edges, Instagram's buttons cover the right side
function stepAt(T) { let s = null; for (const st of STEPS) if (T >= st.t) s = st; return s; }
function spaced(g, text, x, y, sp) { let cx = x; for (const ch of text) { g.fillText(ch, cx, y); cx += g.measureText(ch).width + sp; } return cx - x; }
const measC = mk(10, 10).getContext('2d');
function drawTag(T, sh) {   // the price tag: a paper tag on a string, each day's old price scribbled out and the new one written under it
  const s = stepAt(T); if (!s || sh.hideStat) return; const idx = STEPS.indexOf(s); const g = ctx; const dt = T - s.t;
  const ang = 0.05 * Math.sin(T * 2.1) + 0.3 * Math.exp(-dt * 3) * Math.sin(dt * 11); const hx = SAFE_L + 150, hy = 238, w = 330, prev = STEPS.slice(Math.max(0, idx - 2), idx).map(p => p.v);
  g.save(); g.strokeStyle = 'rgba(245,240,230,0.9)'; g.lineWidth = 3; g.beginPath(); g.moveTo(hx - 30, 150); g.lineTo(hx + Math.sin(ang) * 4, hy); g.stroke();
  g.translate(hx, hy); g.rotate(ang); g.shadowColor = 'rgba(0,0,0,0.45)'; g.shadowBlur = 18; g.shadowOffsetY = 6;
  const hgt = 120 + prev.length * 54 + 112; g.fillStyle = '#f3ead6'; g.beginPath(); g.moveTo(-w / 2 + 34, 0); g.lineTo(w / 2 - 34, 0); g.lineTo(w / 2, 34); g.lineTo(w / 2, hgt); g.lineTo(-w / 2, hgt); g.lineTo(-w / 2, 34); g.closePath(); g.fill();
  g.shadowBlur = 0; g.shadowOffsetY = 0; g.fillStyle = '#c9bfa8'; g.beginPath(); g.arc(0, 22, 9, 0, 7); g.fill(); g.fillStyle = '#5a5040'; g.beginPath(); g.arc(0, 22, 5, 0, 7); g.fill();
  g.textAlign = 'left'; g.fillStyle = '#6a5c48'; g.font = '700 24px InterW'; spaced(g, 'DAY ' + (s.day === 'END' ? 31 : s.day), -w / 2 + 22, 72, 3);
  g.fillStyle = '#c0392b'; g.font = '700 22px InterW'; spaced(g, '×2 DAILY', w / 2 - 132, 72, 2);
  let y = 128; g.textAlign = 'left';
  prev.forEach((v, k) => { g.font = 'italic 400 40px Lora'; g.fillStyle = 'rgba(70,60,48,0.55)'; g.fillText(v, -w / 2 + 22, y); const tw = g.measureText(v).width;
    const strike = k < prev.length - 1 ? 1 : clamp(dt / 0.3); g.strokeStyle = '#c0392b'; g.lineWidth = 4; g.beginPath(); g.moveTo(-w / 2 + 16, y - 12 + (k % 2) * 4); g.lineTo(-w / 2 + 16 + (tw + 14) * strike, y - 16); g.stroke(); y += 54; });
  const a = clamp((dt - 0.22) / 0.3); g.globalAlpha = idx === 0 ? 1 : a; let nf = 64; g.font = `italic 500 ${nf}px Lora`; while (g.measureText(s.v).width > w - 40 && nf > 30) { nf -= 2; g.font = `italic 500 ${nf}px Lora`; }
  g.fillStyle = '#1d1a26'; g.fillText(s.v, -w / 2 + 20, y + 12); g.font = '700 19px InterW'; g.fillStyle = '#6a5c48'; let cf = 19; while (g.measureText(s.cmp).width > w - 40 && cf > 13) { cf -= 1; g.font = `700 ${cf}px InterW`; } g.fillText(s.cmp, -w / 2 + 22, y + 58);
  g.restore(); }
function drawTitle(O) {
  if (O < TITLE.t0 || O >= TITLE.t1) return;
  const a = eOut(clamp((O - TITLE.t0) / 0.45)) * clamp((TITLE.t1 - O) / 0.3), rise = (1 - eOut(clamp((O - TITLE.t0) / 0.7))) * 40;
  const g = ctx; g.save(); g.globalAlpha = a; g.textAlign = 'center';
  const wash = g.createLinearGradient(0, 120, 0, 900); wash.addColorStop(0, 'rgba(40,16,6,0.55)'); wash.addColorStop(1, 'rgba(40,16,6,0)'); g.fillStyle = wash; g.fillRect(0, 0, W, 900);
  g.translate(0, rise); g.shadowColor = 'rgba(0,0,0,0.45)'; g.shadowBlur = 30; g.shadowOffsetY = 4; g.fillStyle = '#fff';
  g.font = '500 96px Playfair'; g.fillText('What if your', W / 2, 380);
  g.font = 'italic 500 236px Playfair'; g.fillStyle = '#ffe2a0'; g.fillText('drip', W / 2, 600);
  g.fillStyle = '#fff'; g.font = '500 96px Playfair'; g.fillText('doubled every day?', W / 2, 735);
  g.shadowBlur = 0; g.shadowOffsetY = 0; g.globalAlpha = a * 0.85; g.fillStyle = '#E21E39'; g.fillRect(W / 2 - 70, 780, 140, 6); g.restore();
}
function cueAt(O) { let best = null; for (const c of DIALOGUE) if (spanHit(c, O) && O >= c.words[0].t - 0.03) if (!best || c.spans[0][0] > best.spans[0][0]) best = c; return best; }
function strokeText(g, text, x, y, sw) { g.lineJoin = 'round'; g.miterLimit = 2; g.lineWidth = sw; g.strokeStyle = '#000'; g.strokeText(text, x, y); g.fillText(text, x, y); }
function captionChunk(c, O) { const chunks = []; let cur = []; c.words.forEach((w, i) => { cur.push(w); if (cur.length >= 3 || /[.!?…,]$/.test(w.w) || i === c.words.length - 1) { chunks.push(cur); cur = []; } });
  let chunk = chunks[0]; for (const ch of chunks) if (O >= ch[0].t - 0.03) chunk = ch; return chunk.filter(w => O >= w.t - 0.03).map(w => w.w.toUpperCase()).join(' '); }
function drawCaptions(O) {
  const c = cueAt(O); if (!c) return; const g = ctx; g.save(); g.textAlign = 'center'; g.fillStyle = '#fff';
  if (c.kind === 'shout' && c.file === 'sh_whisper') { g.font = 'italic 800 64px Montserrat'; c.words.forEach((w, i) => { const k = O - w.t; if (k < -0.03) return; g.globalAlpha = i ? clamp(1 - k / 0.9) * (i === 1 ? 0.6 : 0.35) : 1; strokeText(g, w.w, CAP_X + (i ? (i === 1 ? -120 : 140) : 0), H * 0.72 + i * 70, 10); }); g.restore(); return; }
  if (c.kind === 'shout') { const k = O - c.words[0].t; const s = k < 0.12 ? 0.6 + 4 * k : 1 + 0.04 * Math.sin(O * 50); const txt = c.words.filter(w => O >= w.t - 0.03).map(w => w.w).join(' ');
    g.translate(CAP_X + Math.sin(O * 73) * 6, H * 0.7 + Math.cos(O * 61) * 5); g.scale(s, s); g.rotate(Math.sin(O * 9) * 0.03);
    let fs = 118; g.font = `800 ${fs}px Montserrat`; while (g.measureText(txt).width > CAP_W - 30 && fs > 36) { fs -= 4; g.font = `800 ${fs}px Montserrat`; }
    g.shadowColor = 'rgba(0,0,0,0.45)'; g.shadowBlur = 20; strokeText(g, txt, 0, 0, 16); g.restore(); return; }
  const shown = captionChunk(c, O); if (!shown) { g.restore(); return; }
  let fs = 78; g.font = `800 ${fs}px Montserrat`; while (g.measureText(shown).width > CAP_W && fs > 40) { fs -= 3; g.font = `800 ${fs}px Montserrat`; }
  const nm = { hero: null, bouncer: 'BOUNCER', narrator: 'NARRATOR', judge: 'JUDGE', mugger: 'MUGGER' }[c.speaker];
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
const PAPER = (() => { const c = mk(270, 480), g = c.getContext('2d'); g.fillStyle = '#f4ecdc'; g.fillRect(0, 0, 270, 480); const r2 = rnd(19); for (let i = 0; i < 3000; i++) { g.fillStyle = `rgba(120,100,70,${r2() * 0.08})`; g.fillRect(r2() * 270, r2() * 480, 1 + r2() * 2, 1 + r2() * 2); } return c; })();
const HATCH = (() => { const c = mk(64, 64), g = c.getContext('2d'); g.strokeStyle = 'rgba(40,30,20,0.55)'; g.lineWidth = 1.2; for (let k = -64; k < 128; k += 7) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k + 64, 64); g.stroke(); } return c; })();
function drawSketch() {   // courtroom-sketch look: paper, pencil edges (image minus itself shifted), soft graphite shading, hatching, a pastel colour wash
  const edge = (c, dx, dy) => { c.globalCompositeOperation = 'source-over'; c.filter = 'none'; c.drawImage(sceneC, 0, 0, W, H); c.globalCompositeOperation = 'difference'; c.drawImage(sceneC, dx, dy, W, H); c.globalCompositeOperation = 'source-over'; };
  edge(tctx, 2, 0); edge(actx, 0, 2);
  const g = ctx; g.save(); g.globalCompositeOperation = 'source-over'; g.drawImage(PAPER, 0, 0, W, H);
  g.globalCompositeOperation = 'multiply'; g.globalAlpha = 0.8; g.filter = 'grayscale(1) brightness(1.45) contrast(0.85)'; g.drawImage(sceneC, 0, 0, W, H);
  g.globalAlpha = 0.4; g.filter = 'blur(3px) saturate(1.4) brightness(1.5)'; g.drawImage(sceneC, 0, 0, W, H);
  g.globalAlpha = 1; g.filter = 'grayscale(1) brightness(5) invert(1)'; g.drawImage(tmpC, 0, 0, W, H); g.drawImage(accC, 0, 0, W, H);
  g.filter = 'none'; g.globalAlpha = 0.22; g.fillStyle = g.createPattern(HATCH, 'repeat'); g.fillRect(0, 0, W, H);
  g.globalCompositeOperation = 'screen'; g.globalAlpha = 0.55; g.filter = 'grayscale(1) brightness(0.7) contrast(2.5)'; g.drawImage(sceneC, 0, 0, W, H); g.restore(); g.filter = 'none';
  actx.clearRect(0, 0, W, H); }
function drawCCTV(T) { const g = ctx; g.save(); g.globalCompositeOperation = 'overlay'; g.globalAlpha = 0.5; g.drawImage(GRAIN[(Math.floor(T * 30) * 7) % 4], 0, 0, W, H); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 0.18; g.fillStyle = '#000'; for (let y = (Math.floor(T * 30) % 2) * 2; y < H; y += 4) g.fillRect(0, y, W, 2); g.globalAlpha = 1;
  const vg = g.createRadialGradient(W / 2, H / 2, H * 0.22, W / 2, H / 2, H * 0.62); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.7)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
  g.font = '700 34px InterW'; g.fillStyle = 'rgba(220,255,220,0.92)'; g.textAlign = 'left'; const sec = Math.floor(41 * 60 + 7 + T - 54); const hh = '23', mm = String(Math.floor(sec / 60) % 60).padStart(2, '0'), ss = String(sec % 60).padStart(2, '0');
  g.fillText('CAM 04  ALLEY REAR', SAFE_L, 1150); g.fillText(`18/11/2026  ${hh}:${mm}:${ss}`, SAFE_L, 1196); if (Math.floor(T * 2) % 2) { g.fillStyle = '#ff3b3b'; g.beginPath(); g.arc(W - SAFE_R - 120, 1138, 13, 0, 7); g.fill(); g.fillStyle = 'rgba(220,255,220,0.92)'; g.fillText('REC', W - SAFE_R - 96, 1150); } g.restore(); }
// ---------------------------------------------------------------- grading / compositing
const GRADES = {
  club: { f: 'saturate(1.15) contrast(1.12) brightness(1.04)', tint: 'rgba(200,60,160,0.10)', mode: 'soft-light', vig: 0.5 },
  wall: { f: 'saturate(1.05) contrast(1.15) brightness(1.02)', tint: 'rgba(255,170,90,0.12)', mode: 'soft-light', vig: 0.55 },
  doc: { f: 'saturate(0.92) contrast(1.06) brightness(1.04) sepia(0.12)', tint: 'rgba(255,200,130,0.14)', mode: 'soft-light', vig: 0.4 },
  shop: { f: 'saturate(1.08) contrast(1.1) brightness(1.03)', tint: 'rgba(255,190,120,0.08)', mode: 'soft-light', vig: 0.45 },
  plaza: { f: 'saturate(1.1) contrast(1.06) brightness(1.03)', tint: 'rgba(255,200,140,0.08)', mode: 'soft-light', vig: 0.32 },
  rain: { f: 'saturate(0.9) contrast(1.12) brightness(1.0)', tint: 'rgba(70,100,170,0.18)', mode: 'soft-light', vig: 0.45 },
  freeze: { f: 'saturate(0.45) contrast(1.2) brightness(1.04)', tint: 'rgba(120,170,255,0.22)', mode: 'soft-light', vig: 0.5 },
  court: { f: 'grayscale(1) contrast(1.5) brightness(1.3)', tint: null, vig: 0.2 },
  cctv: { f: 'grayscale(1) contrast(1.3) brightness(1.6)', tint: 'rgba(60,255,110,0.55)', mode: 'multiply', vig: 0.65 },
  gallery: { f: 'saturate(1.05) contrast(1.05) brightness(1.02)', tint: null, vig: 0.22 },
  corner: { f: 'saturate(1.12) contrast(1.06) brightness(1.03)', tint: 'rgba(200,255,220,0.06)', mode: 'soft-light', vig: 0.35 },
  lapse: { f: 'saturate(1.15) contrast(1.08) brightness(1.03)', tint: 'rgba(255,190,120,0.1)', mode: 'soft-light', vig: 0.35 },
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
const HEROES = ['club', 'wall', 'zoo', 'window', 'plaza', 'court', 'alley', 'gallery', 'corner'].map(k => S[k].hero);
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
  const gr = GRADES[sh.grade] || GRADES.street;
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
  if (sh.sketch) drawSketch(); if (sh.cctv) drawCCTV(Oreal); if (sh.letterbox) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, 300); ctx.fillRect(0, H - 300, W, 300); }
  if (sh.flare) drawFlare(sh.flare[0], sh.flare[1], 0.9);
  if (sh.dark) { const d = sh.dark(O); if (d > 0) { ctx.fillStyle = `rgba(4,6,18,${d})`; ctx.fillRect(0, 0, W, H); } }
    if (!sh.hideStat && !sh.letterbox && O >= STEPS[0].t) { ctx.save(); ctx.translate(W * 0.2, 400); ctx.scale(1, 0.62); const sg = ctx.createRadialGradient(0, 0, 0, 0, 0, W * 0.62); sg.addColorStop(0, 'rgba(0,0,0,0.34)'); sg.addColorStop(0.55, 'rgba(0,0,0,0.16)'); sg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = sg; ctx.fillRect(-W, -W, W * 3, W * 2); ctx.restore(); }
  drawGrain(Oreal); drawTitle(O); drawTag(Oreal, sh); drawDiary(Oreal, sh); drawCaptions(Oreal);
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