// "What if your Wi-Fi range doubled every day?" — Polygram series, episode renderer (three.js, rig v2, IBL lighting)
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const W = 1080, H = 1920; export const DUR = 111.34;
let DIALOGUE = [];
function spanHit(c, O) { for (const [a, b] of c.spans) if (O >= a - 0.02 && O < b + 0.03) return true; return false; }

// ---------------------------------------------------------------- story steps (one doubling each)
const STEPS = [{"day": 1, "t": 3.0, "t1": 11.0, "v": "10 m", "cmp": "A NORMAL ROUTER", "status": "HOME", "setup": "Day 1. 10 metres. A normal router.", "son": 3.35, "punch": "One bar in the bathroom.", "pon": 5.61}, {"day": 3, "t": 11.0, "t1": 20.0, "v": "40 m", "cmp": "THROUGH THE WALL", "status": "HOME", "setup": "Day 3. 40 metres. The neighbour's TV connects.", "son": 11.35, "punch": "He's been using your Netflix.", "pon": 14.09}, {"day": 5, "t": 20.0, "t1": 29.8, "v": "160 m", "cmp": "THE WHOLE STREET", "status": "STREET", "setup": "Day 5. The whole street connects.", "son": 20.35, "punch": "Nobody here has paid for internet since Tuesday.", "pon": 22.57}, {"day": 7, "t": 29.8, "t1": 36.2, "v": "640 m", "cmp": "REACHES THE SCHOOL", "status": "NEIGHBOURHOOD", "setup": "Day 7. The school next door connects.", "son": 30.15, "punch": "Exam results: up 0%. TikTok: up 4,000%.", "pon": 32.53}, {"day": 12, "t": 36.2, "t1": 46.0, "v": "20.5 km", "cmp": "HIGHER THAN PLANES", "status": "CITY", "setup": "Day 12. Planes cruise at 11 km.", "son": 36.55, "punch": "Flight 302 is now buffering over your house.", "pon": 38.69}, {"day": 15, "t": 46.0, "t1": 53.8, "v": "164 km", "cmp": "THREE CITIES", "status": "CITY", "setup": "Day 15. Three cities run on your Wi-Fi.", "son": 46.35, "punch": "You've stopped paying rent. They pay you now.", "pon": 48.81}, {"day": 20, "t": 53.8, "t1": 66.4, "v": "5,243 km", "cmp": "COAST TO COAST", "status": "COUNTRY", "setup": "Day 20. Coast to coast.", "son": 54.15, "punch": "Your internet provider calls.", "pon": 55.97}, {"day": 23, "t": 66.4, "t1": 72.4, "v": "41,943 km", "cmp": "PAST THE SATELLITES", "status": "PLANET", "setup": "Day 23. Past the GPS satellites.", "son": 66.75, "punch": "Every map app now says 'Turn left at his house.'", "pon": 68.93}, {"day": 27, "t": 72.4, "t1": 76.04, "v": "671,089 km", "cmp": "THE MOON HAS FULL BARS", "status": "PLANET", "setup": "Day 27. The Moon now has full bars.", "son": 72.75, "punch": "", "pon": null}, {"day": 36, "t": 76.04, "t1": 81.44, "v": "344 million km", "cmp": "MARS", "status": "SOLAR SYSTEM", "setup": "Day 36. Mars connects.", "son": 76.39, "punch": "Ping: 25 minutes. The rover still blames lag.", "pon": 78.17}, {"day": 53, "t": 81.44, "t1": 87.64, "v": "4.76 light-years", "cmp": "THE NEAREST STAR", "status": "GALACTIC", "setup": "Day 53. The nearest star system has full bars.", "son": 81.79, "punch": "Someone there is watching your Netflix too.", "pon": 84.53}, {"day": 72, "t": 87.64, "t1": 95.84, "v": "2.5 million light-years", "cmp": "ANDROMEDA", "status": "GALACTIC", "setup": "Day 72. Andromeda connects.", "son": 87.99, "punch": "Your 'hi' takes 2.5 million years.", "pon": 89.97}, {"day": 87, "t": 95.84, "t1": 99.84, "v": "82 billion light-years", "cmp": "EVERYTHING", "status": "EVERYWHERE", "setup": "Day 87. The whole observable universe is on your Wi-Fi.", "son": 96.19, "punch": "", "pon": null}, {"day": "END", "t": 99.84, "t1": 111.04, "v": "", "cmp": "", "status": "", "setup": "And still…", "son": 100.19, "punch": "One bar in the bathroom.", "pon": 101.49}];  // generated from timeline.json (step 2)
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

// ---------------------------------------------------------------- SCENES
const S = {};
{ // ---- the flat at night: bedroom + bathroom, and the neighbour's flat next door (dollhouse cutaway, front wall missing)
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x06080f); sc.environment = ENV; sc.environmentIntensity = 0.18;
  sc.add(new THREE.HemisphereLight(0x5a6fb0, 0x1a1420, 0.35));
  const moon = new THREE.DirectionalLight(0x7f9cff, 0.7); moon.position.set(-6, 9, -10); moon.castShadow = true; moon.shadow.mapSize.set(1024, 1024); Object.assign(moon.shadow.camera, { left: -12, right: 12, top: 10, bottom: -6, near: 1, far: 40 }); moon.shadow.camera.updateProjectionMatrix(); sc.add(moon);
  const floorT = canvasTex(256, 256, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#7a5638' : '#6e4c31'; g.fillRect(0, i * 32, w, 32); g.fillStyle = 'rgba(0,0,0,0.15)'; g.fillRect(0, i * 32, w, 2); } }); floorT.wrapS = floorT.wrapT = THREE.RepeatWrapping; floorT.repeat.set(4, 3);
  const fl = new THREE.Mesh(rgeo(17, 0.25, 7), new THREE.MeshStandardMaterial({ map: floorT, roughness: 0.55 })); fl.position.set(3.2, -0.125, 0); fl.receiveShadow = true; sc.add(fl);
  const tileT = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#dfe7ea'; g.fillRect(0, 0, w, h); g.fillStyle = '#b8c4c9'; for (let i = 0; i <= 8; i++) { g.fillRect(i * 32, 0, 2, h); g.fillRect(0, i * 32, w, 2); } }); tileT.wrapS = tileT.wrapT = THREE.RepeatWrapping; tileT.repeat.set(3, 4);
  const wallBed = mat(0x3b4f6e, { roughness: 0.9 }), wallN = mat(0x8a6a4a, { roughness: 0.9 }), tiles = new THREE.MeshStandardMaterial({ map: tileT, roughness: 0.35 });
  sc.add(rbox(6.2, 3.3, 0.25, wallBed, -1.0, 1.65, -3.1)); const tb = new THREE.Mesh(rgeo(2.6, 3.3, 0.25), tiles); tb.position.set(3.3, 1.65, -3.1); tb.receiveShadow = true; sc.add(tb); sc.add(rbox(6.4, 3.3, 0.25, wallN, 8.1, 1.65, -3.1));
  sc.add(rbox(0.25, 3.3, 6.2, wallBed, -4.1, 1.65, 0)); const wb = new THREE.Mesh(rgeo(0.2, 3.3, 3.8), tiles); wb.position.set(2.0, 1.65, -1.2); sc.add(wb); sc.add(rbox(0.2, 0.9, 2.4, wallBed, 2.0, 2.85, 1.9));
  sc.add(rbox(0.35, 3.3, 6.2, mat(0x2a2f3a, { roughness: 0.9 }), 4.75, 1.65, 0)); sc.add(rbox(0.25, 3.3, 6.2, wallN, 11.4, 1.65, 0)); sc.add(rbox(17, 0.3, 6.6, mat(0x1c2029, { roughness: 0.9 }), 3.2, 3.45, 0));
  const win = grp(-2.6, 1.9, -2.95, sc); win.add(rbox(1.6, 1.5, 0.1, mat(0x20242e), 0, 0, 0)); const city = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.3), new THREE.MeshBasicMaterial({ map: windowsTex(4, 0.5), toneMapped: false })); city.position.z = 0.04; win.add(city); win.add(rbox(0.06, 1.3, 0.08, mat(0x20242e), 0, 0, 0.08));
  const bed = grp(-2.7, 0, -1.6, sc); bed.add(rbox(2.0, 0.45, 2.8, mat(0x4a3424, { roughness: 0.7 }), 0, 0.22, 0)); bed.add(rbox(1.9, 0.3, 2.7, mat(0xe9edf2, { roughness: 0.95 }), 0, 0.58, 0)); bed.add(rbox(1.92, 0.18, 1.6, mat(0x2f4a8a, { roughness: 0.95 }), 0, 0.78, 0.55)); bed.add(rbox(0.8, 0.22, 0.5, mat(0xffffff, { roughness: 0.95 }), -0.4, 0.82, -1.05));
  const shelf = grp(-0.6, 1.55, -2.9, sc); shelf.add(rbox(1.2, 0.06, 0.32, mat(0x6e4a2e))); const router = grp(0, 0.1, 0.02, shelf); router.add(rbox(0.5, 0.1, 0.26, mat(0x1d1f26, { roughness: 0.3 })));
  [-0.18, 0.18].forEach(x => { const an = rbox(0.03, 0.4, 0.03, mat(0x1d1f26), x, 0.24, -0.08); an.rotation.z = x > 0 ? -0.2 : 0.2; router.add(an); });
  const leds = [-0.15, -0.08, -0.01, 0.06].map(x => { const l = rbox(0.03, 0.02, 0.01, mat(0x2bd96b, { emissive: 0x2bd96b, emissiveIntensity: 4 }), x, 0.0, 0.135); router.add(l); return l; });
  const rLight = new THREE.PointLight(0x2bd96b, 1.2, 2.5, 1.6); rLight.position.set(0, 0.1, 0.3); router.add(rLight);
  const desk = grp(0.8, 0, -2.4, sc); desk.add(rbox(1.8, 0.08, 0.8, mat(0x2a2a30, { roughness: 0.5 }), 0, 0.82, 0)); [[-0.8, -0.3], [0.8, -0.3], [-0.8, 0.3], [0.8, 0.3]].forEach(([x, z]) => desk.add(rbox(0.06, 0.82, 0.06, mat(0x18181c), x, 0.41, z)));
  const mon = screenMesh(1.0, 0.56, canvasTex(320, 180, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#3a2bd9'); gr.addColorStop(1, '#d93aa8'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }), { y: 1.25, z: -0.15 }); desk.add(mon); desk.add(rbox(1.06, 0.62, 0.04, mat(0x111111), 0, 1.25, -0.18));
  const monL = new THREE.PointLight(0x8a5cff, 3.5, 4.5, 1.6); monL.position.set(0, 1.25, 0.3); desk.add(monL);
  const chair = grp(0.8, 0, -1.4, sc); chair.add(rbox(0.7, 0.12, 0.7, mat(0x111111, { roughness: 0.5 }), 0, 0.55, 0)); chair.add(rbox(0.7, 1.1, 0.12, mat(0x111111), 0, 1.15, 0.36)); chair.add(rbox(0.5, 0.5, 0.13, mat(0xe8343c, { roughness: 0.5 }), 0, 1.25, 0.37)); chair.add(cyl(0.05, 0.05, 0.45, mat(0x333333), 0, 0.28, 0, 8)); chair.add(cyl(0.35, 0.35, 0.05, mat(0x333333), 0, 0.04, 0, 12));
  const tvT = screenTex(1000, 560); const tv = screenMesh(1.5, 0.84, tvT, { x: -2.3, y: 1.75, z: 0.0 }); tv.rotation.y = Math.PI / 2; const tvG = grp(-3.9, 0, 0.2, sc); tvG.add(rbox(0.06, 0.9, 1.56, mat(0x111111), 0.03, 1.75, 0)); tv.position.set(0.08, 1.75, 0); tvG.add(tv); const tvL = new THREE.PointLight(0xffb6e1, 0, 4, 1.6); tvL.position.set(0.8, 1.7, 0); tvG.add(tvL);
  const lamp = practical(sc, -1.55, 0.95, -2.6, 0xffb46a, { i: 4, d: 5, r: 0.1, bokeh: 0.5 }); sc.add(cyl(0.18, 0.12, 0.25, mat(0xf2e3c8, { emissive: 0xffb46a, emissiveIntensity: 0.6 }), -1.55, 1.05, -2.6, 16)); sc.add(rbox(0.5, 0.6, 0.45, mat(0x4a3424), -1.55, 0.3, -2.6));
  const toilet = grp(3.25, 0, -2.3, sc); const por = mat(0xf6f6f6, { roughness: 0.15 }); toilet.add(cyl(0.22, 0.18, 0.4, por, 0, 0.2, 0.1, 20)); toilet.add(cyl(0.3, 0.26, 0.12, por, 0, 0.44, 0.15, 24)); toilet.add(rbox(0.56, 0.6, 0.22, por, 0, 0.75, -0.18)); toilet.add(rbox(0.6, 0.05, 0.62, mat(0xe8e8e8), 0, 0.52, 0.12));
  sc.add(rbox(0.7, 0.08, 0.45, por, 4.05, 0.85, -1.1)); sc.add(rbox(0.5, 0.65, 0.04, mat(0xdfe8f0, { roughness: 0.03, metalness: 1, envMapIntensity: 1.3 }), 4.6, 1.6, -1.1)).children;
  const bulb = practical(sc, 3.2, 3.05, -1.3, 0xffe2a8, { i: 7, d: 6, r: 0.09, haze: 1.1, hh: 2.7, ho: 0.05 }); sc.add(cyl(0.01, 0.01, 0.25, mat(0x222222), 3.2, 3.2, -1.3, 4));
  const nsofa = grp(8.0, 0, -1.0, sc); nsofa.rotation.y = Math.PI / 2; nsofa.add(rbox(2.4, 0.45, 0.9, mat(0x6a3a7a, { roughness: 0.8 }), 0, 0.3, 0)); nsofa.add(rbox(2.4, 0.7, 0.25, mat(0x6a3a7a, { roughness: 0.8 }), 0, 0.75, -0.35)); [-1.1, 1.1].forEach(x => nsofa.add(rbox(0.25, 0.65, 0.9, mat(0x5a2f68), x, 0.45, 0)));
  const ntvT = screenTex(1000, 560); const ntv = screenMesh(1.4, 0.78, ntvT, { x: 11.2, y: 1.6, z: -1.0 }); ntv.rotation.y = -Math.PI / 2; sc.add(ntv); sc.add(rbox(0.05, 0.84, 1.46, mat(0x111111), 11.24, 1.6, -1.0));
  const ntvL = new THREE.PointLight(0x9fd0ff, 0, 4, 1.6); ntvL.position.set(10.4, 1.6, -1.0); sc.add(ntvL); practical(sc, 10.4, 1.1, -2.6, 0xffb46a, { i: 2.5, d: 4, r: 0.1, bokeh: 0.45 });
  const neigh = npc(3, { hood: 0x2bb673, hoodD: 0x2bb673, skin: 0x6b4128 }); sc.add(neigh.root);
  const hero = makeRig({}); sc.add(hero.root); const phone = phoneMesh(); hero.arms[1].el.add(phone); phone.position.set(0, -0.5, 0.12); phone.rotation.set(-1.25, 0, 0); phone.scale.setScalar(0.55);
  const dPhone = phoneMesh(); dPhone.rotation.x = -Math.PI / 2; dPhone.position.set(1.15, 0.885, -2.15); sc.add(dPhone);
  const shades = grp(0, 0.38, 0.33, hero.head); shades.add(rbox(0.25, 0.13, 0.03, mat(0x0b0b10, { roughness: 0.1, metalness: 0.6 }), -0.15, 0, 0)); shades.add(rbox(0.25, 0.13, 0.03, mat(0x0b0b10, { roughness: 0.1, metalness: 0.6 }), 0.15, 0, 0)); shades.add(rbox(0.66, 0.04, 0.03, mat(0x0b0b10), 0, 0.05, 0)); shades.visible = false;
  const ring = makeRing(sc);
  S.flat = { sc, hero, neigh, phone, dPhone, router, leds, rLight, tvT, tvL, ntvT, ntvL, bulb, ring, shades, chair, monL };
}
{ // ---- classroom (Day 7): dim afternoon, blinds, every student's face lit by a phone under the desk
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x10131c); sc.environment = ENV; sc.environmentIntensity = 0.25;
  sc.add(new THREE.HemisphereLight(0xbfd0ff, 0x30281e, 0.4));
  const sun = new THREE.DirectionalLight(0xffc98a, 1.6); sun.position.set(8, 6, 2); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10, near: 1, far: 40 }); sun.shadow.camera.updateProjectionMatrix(); sc.add(sun);
  sc.add(rbox(16, 0.2, 14, mat(0x8a7a62, { roughness: 0.7 }), 0, -0.1, 0)); sc.add(rbox(16, 4, 0.25, mat(0xd9cfb8, { roughness: 0.9 }), 0, 2, -5.2)); sc.add(rbox(0.25, 4, 14, mat(0xd9cfb8, { roughness: 0.9 }), -6, 2, 0));
  const board = screenMesh(5, 1.8, canvasTex(1000, 360, (g, w, h) => { g.fillStyle = '#20402e'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(255,255,255,0.85)'; g.fillStyle = 'rgba(255,255,255,0.85)'; g.font = '600 64px Arial'; g.fillText('PHYSICS TEST', 60, 110); g.font = '400 44px Arial'; g.fillText('F = ma        E = mc²', 60, 200); g.fillText('no phones!!', 60, 290); }), { x: 0, y: 2.1, z: -5.05 }); sc.add(board);
  for (let i = 0; i < 6; i++) { const bl = rbox(0.12, 3.2, 1.5, mat(0xe8e1d0, { roughness: 0.8 }), 6.2, 1.9, -4 + i * 1.6); sc.add(bl); }
  const shafts = [0, 1, 2].map(i => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 5), new THREE.MeshBasicMaterial({ map: hazeTex, color: 0xffc98a, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false })); m.position.set(3.6, 2.0, -3 + i * 2.4); m.rotation.set(0, Math.PI / 2, -0.9); sc.add(m); return m; });
  const desks = [], kids = [], glows = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) { const x = -2.6 + c * 2.6, z = -1.4 + r * 2.0; const d = grp(x, 0, z, sc); d.add(rbox(1.2, 0.06, 0.7, mat(0xb98a5a, { roughness: 0.5 }), 0, 0.78, 0)); [[-0.5, -0.3], [0.5, -0.3], [-0.5, 0.3], [0.5, 0.3]].forEach(([a, b]) => d.add(rbox(0.05, 0.78, 0.05, mat(0x555555), a, 0.39, b))); desks.push(d);
    const k = npc(r * 3 + c, { noHood: true }); k.root.position.set(x, 0, z + 0.55); k.root.rotation.y = Math.PI; sc.add(k.root); kids.push(k);
    const p = phoneMesh(); p.scale.setScalar(0.5); p.rotation.x = -1.1; k.arms[0].el.add(p); p.position.set(0.05, -0.5, 0.12); drawPhone(p.tex, 'onebar', 0); k.phone = p;
    const gl = new THREE.PointLight(0x7fc8ff, 0, 1.4, 1.6); sc.add(gl); glows.push(gl); }
  const teacher = makeRig({ hood: 0x6e6e78, hoodD: 0x55555e, pants: 0x2d2d35, skin: 0x8d5a3b, hair: 0x9a9a9a, noHood: true, tie: 0x3a7ae0 }); sc.add(teacher.root);
  S.cls = { sc, kids, glows, teacher };
}

{ // ---- the street at night (Days 5 + 12): apartment blocks with lit windows, streetlights, balconies, the hero's balcony, a jet overhead
  const sc = new THREE.Scene(); sc.environment = ENV; sc.environmentIntensity = 0.15;
  const domeT = canvasTex(8, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#04060f'); gr.addColorStop(0.55, '#121a3a'); gr.addColorStop(1, '#3a2f4a'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  sc.add(new THREE.Mesh(new THREE.SphereGeometry(400, 32, 16), new THREE.MeshBasicMaterial({ map: domeT, side: THREE.BackSide, toneMapped: false, fog: false })));
  const st = new THREE.Points(new THREE.BufferGeometry().setFromPoints([...Array(700)].map((_, i) => { const r2 = rnd(i + 3); return V([r2() * 2 - 1, 0.15 + r2() * 0.85, r2() * 2 - 1]).normalize().multiplyScalar(380); })), new THREE.PointsMaterial({ color: 0xffffff, size: 1.6 * RS, sizeAttenuation: false, toneMapped: false })); sc.add(st);
  const moonS = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex('rgba(255,250,235,1)', 'rgba(200,215,255,0.35)'), transparent: true, depthWrite: false, toneMapped: false })); moonS.scale.setScalar(40); moonS.position.set(-120, 150, -260); sc.add(moonS);
  sc.add(new THREE.HemisphereLight(0x4a5c9a, 0x15121a, 0.4)); const mL = new THREE.DirectionalLight(0x8fa8ff, 0.6); mL.position.set(-40, 60, -60); sc.add(mL);
  sc.add(rbox(300, 0.2, 14, mat(0x23252c, { roughness: 0.4, metalness: 0.2 }), 0, -0.1, 4)); sc.add(rbox(300, 0.25, 4, mat(0x3a3d46, { roughness: 0.8 }), 0, 0.0, -4.5)); sc.add(rbox(300, 0.25, 4, mat(0x3a3d46, { roughness: 0.8 }), 0, 0.0, 12.5));
  for (let x = -60; x < 60; x += 4) sc.add(rbox(2, 0.02, 0.18, mat(0xd9d9d9), x, 0.02, 4));
  const blocks = []; const bcol = [0x6e5a4a, 0x4a5a6e, 0x7a6a58, 0x5a4a5a, 0x4e5e52];
  [[-1, -10, 0], [1, 16, 1]].forEach(([side, z0, k]) => { for (let i = 0; i < 12; i++) { const x = -44 + i * 8 + (k ? 4 : 0), h = 9 + ((i * 7 + k * 3) % 5) * 3, z = z0 + side * 1.5; const g = grp(x, 0, z, sc); const body = rbox(7, h, 6, mat(bcol[(i + k) % 5], { roughness: 0.9 }), 0, h / 2, 0); g.add(body);
    const wt = windowsTex(i * 13 + k, 0.0); const wtOn = windowsTex(i * 13 + k, 0.75); const wm = new THREE.MeshStandardMaterial({ map: wt, emissiveMap: wtOn, emissive: 0xffffff, emissiveIntensity: 0.15, roughness: 0.6 }); const face = new THREE.Mesh(new THREE.PlaneGeometry(6.4, h - 1), wm); face.position.set(0, h / 2, side < 0 ? 3.02 : -3.02); if (side > 0) face.rotation.y = Math.PI; g.add(face);
    blocks.push({ g, wm, pos: V([x, 0, z]) }); } });
  const lights = []; for (let x = -40; x < 44; x += 10) { const p = grp(x, 0, -2.3, sc); p.add(cyl(0.08, 0.1, 5.5, mat(0x30333a), 0, 2.75, 0, 8)); p.add(rbox(1.2, 0.1, 0.12, mat(0x30333a), 0.5, 5.5, 0)); lights.push(practical(sc, x + 1.0, 5.35, -2.3, 0xffb46a, { i: 10, d: 12, r: 0.14, haze: 2.4, hh: 5.3, ho: 0.12 })); }
  const home = grp(0, 0, -10, sc); home.add(rbox(10, 14, 7, mat(0x5e4e44, { roughness: 0.9 }), 0, 7, 0)); const hW = new THREE.Mesh(new THREE.PlaneGeometry(9.4, 13), new THREE.MeshStandardMaterial({ map: windowsTex(77, 0.15), emissiveMap: windowsTex(77, 0.55), emissive: 0xffffff, emissiveIntensity: 0.6 })); hW.position.set(0, 7, 3.52); home.add(hW);
  const balc = grp(0, 6.0, 3.6, home); balc.add(rbox(3.2, 0.15, 1.6, mat(0x8a8f98, { roughness: 0.5 }), 0, 0, 0.8)); balc.add(rbox(3.2, 0.9, 0.06, mat(0x8a8f98, { roughness: 0.4, metalness: 0.5, transparent: true, opacity: 0.6 }), 0, 0.5, 1.6));
  const hWin = practical(sc, -0.8, 7.6, -6.35, 0x8a5cff, { i: 6, d: 6, r: 0.2, bokeh: 1.2 });
  const hero = makeRig({}); sc.add(hero.root);
  const people = [...Array(10)].map((_, i) => { const P = npc(i + 1); P.root.scale.setScalar(1); sc.add(P.root); const p = phoneMesh(); p.scale.setScalar(0.5); p.rotation.x = -1.3; P.arms[1].el.add(p); p.position.set(0, -0.5, 0.12); drawPhone(p.tex, 'voicemail', i); P.phone = p; return P; });
  const bike = grp(0, 0, 0, sc); [-0.55, 0.55].forEach(x => { const w = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.05, 8, 24), mat(0x111111)); w.position.set(x, 0.35, 0); bike.add(w); }); bike.add(rbox(1.1, 0.05, 0.05, mat(0xe8343c), 0, 0.6, 0)); const rider = npc(5); rider.root.scale.setScalar(0.65); rider.root.position.set(0, 0.25, 0); rider.root.rotation.y = Math.PI / 2; bike.add(rider.root); bike.rider = rider;
  const plane = grp(0, 0, 0, sc); { const wm = mat(0xdfe4ea, { roughness: 0.35, metalness: 0.3 }); const fu = cyl(1.3, 1.3, 13, wm, 0, 0, 0, 24); fu.rotation.z = Math.PI / 2; plane.add(fu); plane.add(ball(1.3, wm, 6.5, 0, 0, undefined, 20)); const tl = cone(1.3, 3.5, wm, -8.2, 0.3, 0, 20); tl.rotation.z = Math.PI / 2; plane.add(tl);
    plane.add(rbox(3, 0.2, 15, wm, 0, -0.4, 0)); plane.add(rbox(1.5, 0.15, 5, wm, -7.6, 0.3, 0)); const fin = rbox(2.4, 2.8, 0.16, wm, -7.4, 2.0, 0); fin.rotation.z = 0.4; plane.add(fin);
    for (let i = 0; i < 14; i++) [1, -1].forEach(s => plane.add(rbox(0.3, 0.32, 0.05, mat(0x9fd8ff, { emissive: 0x7fc8ff, emissiveIntensity: 2.5 }), 4.6 - i * 0.7, 0.4, s * 1.29)));
    plane.add(practical(sc, 0, 0, 0, 0xff3030, { i: 0, r: 0.15, ei: 6 })); const nav = practical(sc, 0, 0, 0, 0xff2a2a, { i: 0, r: 0.16, ei: 8, bokeh: 1.2 }); sc.remove(nav); nav.position.set(0, -0.4, 7.5); plane.add(nav); const nav2 = practical(sc, 0, 0, 0, 0x2aff6a, { i: 0, r: 0.16, ei: 8, bokeh: 1.2 }); sc.remove(nav2); nav2.position.set(0, -0.4, -7.5); plane.add(nav2); }
  plane.visible = false;
  const clouds = [...Array(10)].map((_, i) => { const r2 = rnd(i * 5 + 1); const g = grp(-120 + r2() * 240, 70 + r2() * 30, -80 - r2() * 120, sc); const m = new THREE.MeshStandardMaterial({ color: 0x8a96c0, roughness: 1, transparent: true, opacity: 0.55, emissive: 0x1a2040, emissiveIntensity: 0.4 });
    for (let k = 0; k < 5; k++) { const b = ball(6 + r2() * 6, m, k * 7 - 14, r2() * 3, r2() * 4, undefined, 14); b.castShadow = false; g.add(b); } g.scale.y = 0.45; return g; });
  const ring = makeRing(sc);
  S.street = { sc, hero, people, bike, plane, blocks, ring, home, lights, hWin };
}
{ // ---- plane cabin (Day 12): rows of passengers, seat-back screens all showing the same loading wheel
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x0a0c14); sc.environment = ENV; sc.environmentIntensity = 0.2; sc.add(new THREE.HemisphereLight(0x9fb4ff, 0x2a2420, 0.35));
  const shell = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 30, 24, 1, true), new THREE.MeshStandardMaterial({ color: 0xd9dbe2, roughness: 0.6, side: THREE.BackSide })); shell.rotation.x = Math.PI / 2; shell.position.y = 1.2; sc.add(shell); sc.add(rbox(4, 0.1, 30, mat(0x3a4a6a, { roughness: 0.9 }), 0, -0.3, 0));
  const strip = practical(sc, 0, 2.9, 0, 0x9fc8ff, { i: 2, d: 14, r: 0.05 });
  const scrT = screenTex(160, 110); { const g = scrT.g; g.fillStyle = '#0a1020'; g.fillRect(0, 0, 160, 110); } const pax = [], screens = [];
  for (let r = 0; r < 6; r++) [-1.1, -0.45, 0.45, 1.1].forEach((x, k) => { const z = -r * 1.6; const seat = grp(x, 0, z, sc); seat.add(rbox(0.55, 0.12, 0.55, mat(0x2a3a6a), 0, 0.45, 0)); seat.add(rbox(0.55, 1.0, 0.12, mat(0x2a3a6a), 0, 0.95, -0.3));
    const s = screenMesh(0.32, 0.22, scrT, { x: 0, y: 1.05, z: -0.37 }); s.rotation.y = Math.PI; seat.add(s); screens.push(s);
    if (r > 0 && (r + k) % 3 !== 2) { const P = npc(r * 4 + k); P.root.position.set(x, 0, z + 0.05); P.root.scale.setScalar(0.9); sc.add(P.root); pax.push(P); } });
  S.cabin = { sc, pax, scrT };
}
{ // ---- car interior at night (Day 23): rain on the windscreen, city bokeh outside, the sat-nav
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x05070d); sc.environment = ENV; sc.environmentIntensity = 0.15; sc.add(new THREE.HemisphereLight(0x3a4a7a, 0x100c10, 0.3));
  const dash = rbox(3.2, 0.5, 1.0, mat(0x15161a, { roughness: 0.6 }), 0, 0.9, -0.6); sc.add(dash); const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.05, 10, 30), mat(0x111111, { roughness: 0.5 })); wheel.position.set(-0.6, 1.15, -0.1); wheel.rotation.x = -0.4; sc.add(wheel);
  const navT = screenTex(480, 300); { const g = navT.g; g.fillStyle = '#16304a'; g.fillRect(0, 0, 480, 300); g.strokeStyle = '#7fb2d9'; g.lineWidth = 12; g.beginPath(); g.moveTo(240, 200); g.lineTo(240, 70); g.lineTo(60, 70); g.stroke(); g.fillStyle = '#44e6ff'; g.beginPath(); g.moveTo(240, 150); g.lineTo(225, 180); g.lineTo(255, 180); g.fill();
    g.fillStyle = 'rgba(0,0,0,0.75)'; g.fillRect(0, 200, 480, 100); g.fillStyle = '#fff'; g.font = '800 36px Arial'; g.textAlign = 'center'; g.fillText('Turn left', 240, 240); g.font = '700 30px Arial'; g.fillText('at his house', 240, 280); navT.needsUpdate = true; }
  const nav = screenMesh(0.6, 0.375, navT, { x: 0.35, y: 1.35, z: -0.12 }); nav.rotation.x = -0.25; sc.add(nav); sc.add(rbox(0.66, 0.42, 0.04, mat(0x0a0a0a), 0.35, 1.35, -0.15)).children; const navL = new THREE.PointLight(0x7fc8ff, 2.5, 2.5, 1.6); navL.position.set(0.35, 1.4, 0.3); sc.add(navL);
  const rainT = canvasTex(256, 256, (g) => { const r2 = rnd(8); for (let i = 0; i < 70; i++) { const x = r2() * 256, y = r2() * 256, r = 2 + r2() * 5; const gr = g.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,0.6)'); gr.addColorStop(1, 'rgba(255,255,255,0.05)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); } });
  const ws = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 1.4), new THREE.MeshBasicMaterial({ map: rainT, transparent: true, opacity: 0.55, depthWrite: false })); ws.position.set(0, 1.9, -1.2); ws.rotation.x = -0.5; sc.add(ws);
  const bok = [...Array(26)].map((_, i) => { const r2 = rnd(i + 40); const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: bokehTex, color: [0xffb46a, 0xff4040, 0x9fd8ff, 0xffe2a8][i % 4], transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); s.position.set(-8 + r2() * 16, 0.5 + r2() * 4, -8 - r2() * 20); s.scale.setScalar(0.8 + r2() * 1.6); sc.add(s); return s; });
  const driver = npc(4); driver.root.position.set(-0.6, 0.0, 0.6); driver.root.rotation.y = Math.PI; sc.add(driver.root);
  S.car = { sc, bok, driver, navT };
}
{ // ---- space (Days 17, 23, 27): Earth at night, the ISS, GPS satellites, the Moon with a Wi-Fi icon
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x020309);
  const stars = new THREE.Points(new THREE.BufferGeometry().setFromPoints([...Array(2500)].map((_, i) => { const r2 = rnd(i * 7 + 11); return V([r2() * 2 - 1, r2() * 2 - 1, r2() * 2 - 1]).normalize().multiplyScalar(900); })), new THREE.PointsMaterial({ color: 0xffffff, size: 1.6 * RS, sizeAttenuation: false, toneMapped: false })); sc.add(stars);
  const sun = new THREE.DirectionalLight(0xfff2dc, 2.4); sun.position.set(200, 60, 120); sc.add(sun); sc.add(new THREE.HemisphereLight(0x223355, 0x000000, 0.2));
  const eT = canvasTex(2048, 1024, (g, w, h) => { g.fillStyle = '#0b2a5a'; g.fillRect(0, 0, w, h); const r2 = rnd(5);
    for (let k = 0; k < 9; k++) { const cx = r2() * w, cy = h * (0.2 + r2() * 0.6), rx = 120 + r2() * 260, ry = 80 + r2() * 160; g.fillStyle = '#2f6a3a'; g.beginPath(); g.ellipse(cx, cy, rx, ry, r2() * 3, 0, 7); g.fill(); for (let i = 0; i < 40; i++) { g.fillStyle = r2() < 0.5 ? '#3f7a44' : '#7a6a42'; g.beginPath(); g.ellipse(cx + (r2() - 0.5) * rx * 1.6, cy + (r2() - 0.5) * ry * 1.6, 20 + r2() * 60, 14 + r2() * 40, r2() * 3, 0, 7); g.fill(); } }
    g.fillStyle = '#e8f0ff'; g.fillRect(0, 0, w, 50); g.fillRect(0, h - 60, w, 60); });
  const lT = canvasTex(2048, 1024, (g, w, h) => { g.fillStyle = '#000'; g.fillRect(0, 0, w, h); const r2 = rnd(5); for (let k = 0; k < 9; k++) { const cx = r2() * w, cy = h * (0.2 + r2() * 0.6), rx = 120 + r2() * 260, ry = 80 + r2() * 160; for (let i = 0; i < 400; i++) { const a = r2() * 6.283, rr2 = Math.sqrt(r2()); g.fillStyle = r2() < 0.8 ? '#ffc070' : '#fff2c8'; g.fillRect(cx + Math.cos(a) * rx * rr2, cy + Math.sin(a) * ry * rr2, 2 + r2() * 2, 2 + r2() * 2); } } });
  const earth = new THREE.Mesh(new THREE.SphereGeometry(30, 96, 64), new THREE.MeshStandardMaterial({ map: eT, emissiveMap: lT, emissive: 0xffffff, emissiveIntensity: 1.4, roughness: 0.8 })); sc.add(earth);
  const clouds = new THREE.Mesh(new THREE.SphereGeometry(30.4, 64, 48), new THREE.MeshStandardMaterial({ map: canvasTex(1024, 512, (g, w, h) => { const r2 = rnd(9); for (let i = 0; i < 500; i++) { g.fillStyle = `rgba(255,255,255,${0.15 + r2() * 0.35})`; g.beginPath(); g.ellipse(r2() * w, r2() * h, 10 + r2() * 50, 4 + r2() * 14, 0, 0, 7); g.fill(); } }), transparent: true, depthWrite: false, roughness: 1 })); sc.add(clouds);
  const atm = new THREE.Mesh(new THREE.SphereGeometry(31.5, 64, 48), ringMat()); atm.material.uniforms.c.value.setHex(0x4a8aff); atm.material.uniforms.a.value = 0.8; sc.add(atm);
  const iss = grp(0, 0, 0, sc); { const tm = mat(0xc9ced6, { roughness: 0.4, metalness: 0.6 }); iss.add(rbox(8, 0.25, 0.25, tm)); [-3.4, -2.2, 2.2, 3.4].forEach(x => [-1, 1].forEach(s => iss.add(rbox(0.9, 0.03, 2.6, mat(0x1f3f8a, { roughness: 0.25, metalness: 0.5, emissive: 0x0a1a40, emissiveIntensity: 0.4 }), x, 0, s * 1.5))));
    const mod = cyl(0.45, 0.45, 2.6, mat(0xf2f2f2, { roughness: 0.4 }), 0, 0, 0.8, 16); mod.rotation.x = Math.PI / 2; iss.add(mod); const mod2 = cyl(0.45, 0.45, 1.8, mat(0xf2f2f2, { roughness: 0.4 }), 0, 0, -0.6, 16); mod2.rotation.x = Math.PI / 2; iss.add(mod2); }
  const sats = [...Array(10)].map((_, i) => { const g = grp(0, 0, 0, sc); g.add(rbox(0.5, 0.5, 0.7, mat(0xd4a017, { metalness: 0.7, roughness: 0.3 }))); [-1, 1].forEach(s => g.add(rbox(1.4, 0.03, 0.5, mat(0x1f3f8a, { metalness: 0.5, roughness: 0.25, emissive: 0x0a1a40, emissiveIntensity: 0.4 }), s * 1.0, 0, 0))); const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex('rgba(255,255,255,1)', 'rgba(160,220,255,0.4)'), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); gl.scale.setScalar(2.5); g.add(gl); g.gl = gl; return g; });
  const moonT = canvasTex(1024, 512, (g, w, h) => { g.fillStyle = '#a9a9ae'; g.fillRect(0, 0, w, h); const r2 = rnd(3); for (let i = 0; i < 14; i++) { const x = r2() * w, y = h * (0.2 + r2() * 0.6), rx = 60 + r2() * 160; const gr = g.createRadialGradient(x, y, 0, x, y, rx); gr.addColorStop(0, 'rgba(70,72,82,0.55)'); gr.addColorStop(1, 'rgba(70,72,82,0)'); g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, rx, rx * 0.6, r2() * 3, 0, 7); g.fill(); }
    for (let i = 0; i < 260; i++) { const x = r2() * w, y = r2() * h, r = 2 + r2() * r2() * 26; const gr = g.createRadialGradient(x - r * 0.25, y - r * 0.25, r * 0.2, x, y, r); gr.addColorStop(0, 'rgba(60,60,70,0.45)'); gr.addColorStop(0.75, 'rgba(110,110,118,0.25)'); gr.addColorStop(0.92, 'rgba(225,225,230,0.35)'); gr.addColorStop(1, 'rgba(225,225,230,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); } });
  const moon = new THREE.Mesh(new THREE.SphereGeometry(8, 64, 48), new THREE.MeshStandardMaterial({ map: moonT, roughness: 0.95 })); moon.position.set(0, 0, -400); sc.add(moon);
  const wifiT = canvasTex(256, 256, (g) => { g.strokeStyle = '#ffffff'; g.lineCap = 'round'; g.lineWidth = 22; [100, 68, 36].forEach(r => { g.beginPath(); g.arc(128, 190, r, -Math.PI * 0.75, -Math.PI * 0.25); g.stroke(); }); g.fillStyle = '#fff'; g.beginPath(); g.arc(128, 190, 14, 0, 7); g.fill(); });
  const wifiIcon = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.MeshBasicMaterial({ map: wifiT, color: 0x6ef0ff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); moon.add(wifiIcon); wifiIcon.position.z = 8.2;
  const ring = makeRing(sc, false);
  S.space = { sc, earth, clouds, iss, sats, moon, wifiIcon, ring, sun };
}
{ // ---- inside the ISS (Day 17): a floating astronaut, a sticky note PASSWORD?, Earth through the window
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x0a0d14); sc.environment = ENV; sc.environmentIntensity = 0.4; sc.add(new THREE.HemisphereLight(0xdfe8ff, 0x30384a, 0.6));
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 12, 8, 1, true), new THREE.MeshStandardMaterial({ color: 0xe2e6ec, roughness: 0.7, side: THREE.BackSide })); wall.rotation.x = Math.PI / 2; wall.position.y = 1.6; sc.add(wall);
  for (let i = 0; i < 18; i++) { const r2 = rnd(i + 2); const a = r2() * 6.283; const b = rbox(0.3 + r2() * 0.5, 0.2 + r2() * 0.3, 0.08, mat([0x9aa3b0, 0x6e7684, 0xd4a017, 0x1f8fe0][i % 4], { roughness: 0.5 }), Math.cos(a) * 2.0, 1.6 + Math.sin(a) * 2.0, -5 + r2() * 8); b.lookAt(0, 1.6, b.position.z); sc.add(b); }
  const strip = practical(sc, 0, 3.6, -1, 0xdfe8ff, { i: 4, d: 10, r: 0.05 });
  const win = new THREE.Mesh(new THREE.CircleGeometry(0.7, 32), new THREE.MeshBasicMaterial({ map: canvasTex(256, 256, (g) => { g.fillStyle = '#020309'; g.fillRect(0, 0, 256, 256); const gr = g.createRadialGradient(128, 420, 150, 128, 420, 330); gr.addColorStop(0, '#1a4a8a'); gr.addColorStop(0.92, '#3a7ae0'); gr.addColorStop(1, 'rgba(120,180,255,0)'); g.fillStyle = gr; g.beginPath(); g.arc(128, 420, 330, 0, 7); g.fill(); }), toneMapped: false })); win.position.set(1.0, 2.2, -3.5); sc.add(win);
  const note = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.5), new THREE.MeshStandardMaterial({ map: canvasTex(220, 200, (g) => { g.fillStyle = '#ffe75a'; g.fillRect(0, 0, 220, 200); g.fillStyle = '#222'; g.font = '700 38px Arial'; g.textAlign = 'center'; g.fillText('PASSWORD?', 110, 112); }), roughness: 0.8 })); note.position.set(-1.15, 2.25, -3.45); sc.add(note);
  const astro = makeRig({ hood: 0xe9ecf1, hoodD: 0xc9ced8, pants: 0xdfe3ea, skin: 0xe2a77f, hair: 0x3a2a1a, noHood: true, pack: true, shoe: 0xdddddd }); sc.add(astro.root); astro.spine.add(rbox(0.18, 0.12, 0.03, mat(0x1f8fe0), 0.22, 0.62, 0.245));
  S.issIn = { sc, astro, note };
}
{ // ---- Mars (Day 36): red dust, low sun, the rover with a loading wheel on its mast
  const sc = new THREE.Scene(); sc.environment = ENV; sc.environmentIntensity = 0.25; sc.fog = new THREE.Fog(0xc98a5a, 30, 160);
  const skyT = canvasTex(8, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#4a2a2a'); gr.addColorStop(0.55, '#c98a5a'); gr.addColorStop(1, '#e8b48a'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }); sc.add(new THREE.Mesh(new THREE.SphereGeometry(300, 32, 16), new THREE.MeshBasicMaterial({ map: skyT, side: THREE.BackSide, toneMapped: false, fog: false })));
  const sunL = new THREE.DirectionalLight(0xffe2c0, 2.2); sunL.position.set(-30, 12, -40); sunL.castShadow = true; sunL.shadow.mapSize.set(2048, 2048); Object.assign(sunL.shadow.camera, { left: -15, right: 15, top: 15, bottom: -15, near: 1, far: 120 }); sunL.shadow.camera.updateProjectionMatrix(); sc.add(sunL); sc.add(new THREE.HemisphereLight(0xffc89a, 0x5a2a1a, 0.5));
  const sunS = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex('rgba(255,245,220,1)', 'rgba(255,200,140,0.4)'), transparent: true, depthWrite: false, toneMapped: false, fog: false })); sunS.scale.setScalar(30); sunS.position.set(-150, 50, -200); sc.add(sunS);
  const gG = new THREE.PlaneGeometry(300, 300, 120, 120); gG.rotateX(-Math.PI / 2); { const p = gG.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, Math.sin(x * 0.08) * 0.8 + Math.sin(z * 0.11 + x * 0.03) * 1.1 + Math.sin(x * 0.4 + z * 0.3) * 0.15); } gG.computeVertexNormals(); }
  const ground = new THREE.Mesh(gG, new THREE.MeshStandardMaterial({ color: 0xb4643a, roughness: 0.95, flatShading: true })); ground.receiveShadow = true; ground.position.y = -1; sc.add(ground);
  for (let i = 0; i < 60; i++) { const r2 = rnd(i + 100); const rk = new THREE.Mesh(new THREE.DodecahedronGeometry(0.2 + r2() * 0.7, 0), mat(0x7a3a22, { roughness: 0.9, flatShading: true })); rk.position.set(-25 + r2() * 50, -0.6, -30 + r2() * 40); rk.rotation.set(r2() * 3, r2() * 3, 0); rk.castShadow = rk.receiveShadow = true; sc.add(rk); }
  const rover = grp(0, -0.2, 0, sc); { const bm = mat(0xdfe2e8, { roughness: 0.4, metalness: 0.4 }); rover.add(rbox(1.8, 0.5, 1.2, bm, 0, 0.7, 0)); rover.add(rbox(1.6, 0.06, 1.4, mat(0x1f3f8a, { roughness: 0.3, metalness: 0.4 }), 0, 0.98, 0));
    [-0.75, 0, 0.75].forEach(x => [-0.75, 0.75].forEach(z => { const w = cyl(0.25, 0.25, 0.2, mat(0x333333, { roughness: 0.8 }), x, 0.25, z, 14); w.rotation.x = Math.PI / 2; rover.add(w); }));
    rover.add(cyl(0.04, 0.04, 1.0, bm, 0.6, 1.5, 0.35, 8)); const head = grp(0.6, 2.05, 0.35, rover); head.add(rbox(0.45, 0.22, 0.25, bm)); const rsT = screenTex(160, 120); { rsT.g.fillStyle = '#0a1020'; rsT.g.fillRect(0, 0, 160, 120); } const rs = screenMesh(0.3, 0.22, rsT, { x: 0, y: 0, z: 0.13 }); head.add(rs); rover.head = head; rover.scrT = rsT; }
  const dust = [...Array(90)].map((_, i) => { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex('rgba(230,160,110,0.5)', 'rgba(200,120,80,0.2)'), transparent: true, depthWrite: false })); sc.add(m); return m; });
  S.mars = { sc, rover, dust };
}
{ // ---- deep space (Days 43, 72, 87): Voyager, Andromeda, the cosmic web
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x010207);
  sc.add(new THREE.Points(new THREE.BufferGeometry().setFromPoints([...Array(3000)].map((_, i) => { const r2 = rnd(i * 3 + 7); return V([r2() * 2 - 1, r2() * 2 - 1, r2() * 2 - 1]).normalize().multiplyScalar(800); })), new THREE.PointsMaterial({ color: 0xffffff, size: 1.5 * RS, sizeAttenuation: false, toneMapped: false })));
  const sunL = new THREE.DirectionalLight(0xfff2dc, 2.2); sunL.position.set(30, 25, 50); sc.add(sunL); sc.add(new THREE.HemisphereLight(0x5a6a9a, 0x101018, 0.5)); const rimL = new THREE.DirectionalLight(0x9fc8ff, 1.2); rimL.position.set(-50, 10, -60); sc.add(rimL);
  const sunDot = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex('rgba(255,250,230,1)', 'rgba(255,220,160,0.3)'), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); sunDot.scale.setScalar(6); sunDot.position.set(-60, 12, -70); sc.add(sunDot);
  const voy = grp(0, 0, 0, sc); { const gm = mat(0xc9ced6, { roughness: 0.4, metalness: 0.6 }); const dish = new THREE.Mesh(new THREE.SphereGeometry(1.8, 32, 12, 0, Math.PI * 2, 0, 0.6), mat(0xf2f2f2, { roughness: 0.3, side: THREE.DoubleSide })); dish.rotation.x = Math.PI / 2; dish.position.z = 0.6; voy.add(dish);
    voy.add(cyl(0.5, 0.5, 0.4, mat(0xd4a017, { metalness: 0.7, roughness: 0.3 }), 0, 0, 0, 10)); const boom = rbox(6, 0.05, 0.05, gm, 3.2, 0, -0.2); voy.add(boom); const rtg = rbox(2.4, 0.05, 0.05, gm, -1.6, -0.6, -0.4); rtg.rotation.z = 0.4; voy.add(rtg); voy.add(cyl(0.15, 0.15, 0.8, mat(0x555a60), -2.6, -1.1, -0.4, 10)); }
  const galT = (c0, c1, seed = 5) => canvasTex(1024, 1024, (g) => { g.translate(512, 512); const r2 = rnd(seed); for (let k = 0; k < 9000; k++) { const arm = k % 2, t = Math.pow(r2(), 0.55); const a = t * 10 + arm * Math.PI + (r2() - 0.5) * 0.45, r = t * 470; g.fillStyle = r2() < 0.5 ? c0 : c1; g.globalAlpha = 0.18 + r2() * 0.5; g.beginPath(); g.arc(Math.cos(a) * r, Math.sin(a) * r, 0.8 + r2() * 2.6, 0, 7); g.fill(); } g.globalAlpha = 1; const cg = g.createRadialGradient(0, 0, 0, 0, 0, 150); cg.addColorStop(0, 'rgba(255,248,225,1)'); cg.addColorStop(1, 'rgba(255,200,140,0)'); g.fillStyle = cg; g.fillRect(-512, -512, 1024, 1024); });
  const andro = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshBasicMaterial({ map: galT('#a8c0ff', '#ffe2c0', 6), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide })); andro.position.set(0, 0, -300); andro.rotation.set(-1.0, 0.2, 0.5); sc.add(andro);
  const web = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 6, 4), new THREE.MeshBasicMaterial({ color: 0x8ae8ff, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }), 2600); web.frustumCulled = false; sc.add(web);
  { const r2 = rnd(31), nodes = [...Array(40)].map(() => V([r2() * 2 - 1, r2() * 2 - 1, r2() * 2 - 1]).multiplyScalar(900)), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(); let n = 0;
    for (let i = 0; i < 2600; i++) { const a = nodes[Math.floor(r2() * 40)], b = nodes[Math.floor(r2() * 40)], t = r2(); const p = a.clone().lerp(b, t).add(V([r2() - 0.5, r2() - 0.5, r2() - 0.5]).multiplyScalar(40)); const s = 1.5 + r2() * 4; m4.compose(p.add(V([0, 0, -1600])), q, V([s, s, s])); web.setMatrixAt(n++, m4); } }
  web.visible = false; const ring = makeRing(sc, false);
  S.deep = { sc, voy, andro, web, ring, sunDot };
}
{ // ---- alien living room (Day 53): two suns through the window, a blob on the sofa, the same TV row
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x0c0816); sc.environment = ENV; sc.environmentIntensity = 0.25; sc.add(new THREE.HemisphereLight(0xffb0e0, 0x201030, 0.4));
  sc.add(rbox(12, 0.2, 10, mat(0x3a2a4a, { roughness: 0.8 }), 0, -0.1, 0)); sc.add(rbox(12, 4, 0.25, mat(0x4a3a6a, { roughness: 0.9 }), 0, 2, -3.2)); sc.add(rbox(0.25, 4, 10, mat(0x4a3a6a, { roughness: 0.9 }), -4.5, 2, 0));
  const skyT = canvasTex(512, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#2a0a3a'); gr.addColorStop(0.6, '#d9447a'); gr.addColorStop(1, '#ffb46a'); g.fillStyle = gr; g.fillRect(0, 0, w, h); [[150, 300, 60, '#fff2c8'], [330, 360, 38, '#ffd0a0']].forEach(([x, y, r, c]) => { const sg = g.createRadialGradient(x, y, 0, x, y, r * 2.4); sg.addColorStop(0, c); sg.addColorStop(0.35, c); sg.addColorStop(1, 'rgba(255,180,120,0)'); g.fillStyle = sg; g.fillRect(0, 0, w, h); });
    g.fillStyle = '#1a0a22'; g.beginPath(); g.moveTo(0, h); for (let x = 0; x <= w; x += 32) g.lineTo(x, h - 60 - 40 * Math.abs(Math.sin(x * 0.03))); g.lineTo(w, h); g.fill(); });
  const win = screenMesh(3.2, 2.2, skyT, { x: 1.2, y: 2.1, z: -3.05 }); sc.add(win); sc.add(rbox(3.4, 0.12, 0.2, mat(0x2a1a3a), 1.2, 1.0, -3.0)); const winL = new THREE.PointLight(0xffb46a, 6, 10, 1.6); winL.position.set(1.2, 2.2, -2.2); sc.add(winL);
  const sofa = grp(-1.4, 0, 0.6, sc); sofa.rotation.y = 0.5; sofa.add(rbox(2.4, 0.45, 1.0, mat(0x1a8a7a, { roughness: 0.8 }), 0, 0.3, 0)); sofa.add(rbox(2.4, 0.7, 0.25, mat(0x1a8a7a, { roughness: 0.8 }), 0, 0.75, -0.4));
  const blob = grp(-1.4, 0.55, 0.65, sc); blob.rotation.y = 0.5; const bm = new THREE.MeshPhysicalMaterial({ color: 0x7affb0, roughness: 0.25, clearcoat: 0.8, transmission: 0.2, thickness: 0.5 }); const body = ball(0.65, bm, 0, 0.45, 0, undefined, 32); body.scale.set(1, 1.15, 0.9); blob.add(body);
  [-0.22, 0.22].forEach(x => { blob.add(ball(0.13, mat(0xffffff, { roughness: 0.2 }), x, 0.75, 0.52, undefined, 16)); blob.add(ball(0.065, mat(0x111111), x, 0.76, 0.63, undefined, 12)); }); const ant = cyl(0.02, 0.02, 0.4, bm, 0, 1.3, 0, 6); blob.add(ant); blob.add(ball(0.07, mat(0xffd23f, { emissive: 0xffd23f, emissiveIntensity: 2 }), 0, 1.52, 0, undefined, 10));
  const tvT = screenTex(1000, 560); const tv = screenMesh(1.6, 0.9, tvT, { x: 1.9, y: 1.5, z: 2.4 }); tv.rotation.y = Math.PI + 0.5; sc.add(tv); const tvL = new THREE.PointLight(0xffb6e1, 3, 5, 1.6); tvL.position.set(1.4, 1.5, 1.8); sc.add(tvL);
  S.alien = { sc, blob, tvT, tv };
}

// ---------------------------------------------------------------- Revision 2 props: the action beats
{ // flat: rent envelopes, the neighbour's cushion, the router plug cable
  const F_ = S.flat, sc = F_.sc;
  const envT = canvasTex(128, 80, (g) => { g.fillStyle = '#f4efe2'; g.fillRect(0, 0, 128, 80); g.strokeStyle = '#c9c0aa'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 0); g.lineTo(64, 44); g.lineTo(128, 0); g.stroke(); g.fillStyle = '#E21E39'; g.fillRect(96, 10, 22, 26); g.fillStyle = '#222'; g.font = '700 16px Arial'; g.fillText('RENT', 10, 70); });
  const envM = new THREE.MeshStandardMaterial({ map: envT, roughness: 0.8 });
  F_.envs = [...Array(60)].map((_, i) => { const m = new THREE.Mesh(rgeo(0.32, 0.015, 0.2), envM); m.castShadow = m.receiveShadow = true; m.visible = false; sc.add(m); const r2 = rnd(i + 900); m.userData = { a: r2() * 6.283, r: 0.35 + r2() * 0.65, y: 0.02 + Math.floor(i / 6) * 0.03, rot: r2() * 3 }; return m; });
  F_.cushion = rbox(0.5, 0.5, 0.18, mat(0xffd23f, { roughness: 0.9 })); sc.add(F_.cushion);
  F_.plug = grp(0, 0, 0, sc); F_.plug.add(rbox(0.08, 0.05, 0.12, mat(0xf4f4f4, { roughness: 0.4 }))); const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.4, 6), mat(0x111111)); cable.position.y = -0.7; F_.plug.add(cable);
}
{ // classroom: chairs, the teacher's long hair, a phone that slides to her feet
  const C = S.cls;
  C.chairs = C.kids.map((k, i) => { const x = -2.6 + (i % 3) * 2.6, z = -1.4 + Math.floor(i / 3) * 2.0 + 0.62; const g = grp(x, 0, z, C.sc); g.add(rbox(0.55, 0.06, 0.5, mat(0x3a7ae0, { roughness: 0.5 }), 0, 0.5, 0)); g.add(rbox(0.55, 0.55, 0.06, mat(0x3a7ae0, { roughness: 0.5 }), 0, 0.8, 0.25)); [[-0.22, -0.2], [0.22, -0.2], [-0.22, 0.2], [0.22, 0.2]].forEach(([a, b]) => g.add(rbox(0.04, 0.5, 0.04, mat(0x888888), a, 0.25, b))); return g; });
  const hair = mat(0x3a2a1a, { roughness: 0.6 }); C.teacher.head.add(rbox(0.72, 0.7, 0.2, hair, 0, 0.32, -0.3)); C.teacher.head.add(rbox(0.72, 0.16, 0.66, hair, 0, 0.68, -0.02));
  C.slider = phoneMesh(); C.slider.scale.setScalar(0.5); C.slider.rotation.x = -Math.PI / 2; C.slider.visible = false; C.sc.add(C.slider); drawPhone(C.slider.tex, 'onebar', 0);
  C.board = C.sc.children.find(c => c.isMesh && c.material.isMeshBasicMaterial && c.geometry.type === 'PlaneGeometry' && c.geometry.parameters.width === 5); C.board.position.set(-1.2, 1.75, -5.05);
}
{ // street: a bin for the bike crash, headlights converging on his building (Day 23)
  const s = S.street, sc = s.sc;
  s.bin = grp(2.5, 0, 9.3, sc); s.bin.add(cyl(0.35, 0.3, 0.9, mat(0x2b8a4a, { roughness: 0.6 }), 0, 0.45, 0, 14)); s.bin.add(cyl(0.38, 0.38, 0.06, mat(0x1f6a38), 0, 0.92, 0, 14));
  s.trash = debrisPool(sc, 14, [0xd9d0be, 0x8a6a48, 0xe8343c]);
  const carG = rgeo(1.8, 0.7, 0.9); const cars = new THREE.InstancedMesh(carG, new THREE.MeshStandardMaterial({ color: 0x9aa3b0, roughness: 0.4, metalness: 0.5 }), 320); cars.frustumCulled = false; sc.add(cars);
  const lightsG = new THREE.InstancedMesh(new THREE.SphereGeometry(0.16, 6, 4), new THREE.MeshBasicMaterial({ color: 0xfff2c8, toneMapped: false }), 640); lightsG.frustumCulled = false; sc.add(lightsG);
  const r2 = rnd(77); s.carD = [...Array(320)].map((_, i) => ({ lane: i % 4, x0: -280 + r2() * 560, side: r2() < 0.5 ? -1 : 1, sp: 9 + r2() * 6, col: new THREE.Color([0xe8343c, 0x1f8fe0, 0xf4f4f4, 0x2a2a30, 0xffd23f, 0x9aa3b0][Math.floor(r2() * 6)]) }));
  s.carD.forEach((d, i) => cars.setColorAt(i, d.col)); s.cars = cars; s.carLights = lightsG; cars.visible = lightsG.visible = false;
}
{ // Mars: a robot arm on the rover that slams the deck
  const r = S.mars.rover; const arm = grp(-0.9, 0.95, 0.35, r); const m = mat(0xc9ced6, { roughness: 0.4, metalness: 0.5 }); arm.add(rbox(0.9, 0.08, 0.08, m, -0.45, 0, 0)); const fore = grp(-0.9, 0, 0, arm); fore.add(rbox(0.7, 0.07, 0.07, m, -0.35, 0, 0)); fore.add(rbox(0.16, 0.16, 0.16, mat(0x555a60), -0.75, 0, 0)); r.arm = arm; r.fore = fore;
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

// ===== Revision 2 shots. The flat (title, Day 1, Day 3, Day 15, Day 20, Day 72, END) =====
const F = S.flat;
function flatBase(O, o = {}) { resetRig(F.hero); F.hero.root.visible = false; F.phone.visible = true; resetRig(F.neigh); F.neigh.root.visible = false; F.shades.visible = !!o.shades; F.chair.rotation.y = o.chairFlip ? Math.PI : 0; F.ring.visible = false; F.envs.forEach(e => e.visible = false); F.cushion.visible = false; F.plug.visible = false;
  const off = o.routerOff ? 1 : 0; F.leds.forEach((l, i) => { l.material.emissiveIntensity = off ? 0 : 2.5 + 2.5 * (Math.sin(O * (7 + i * 3) + i) > 0.3 ? 1 : 0); l.material.color.setHex(off ? 0x0c140e : 0x2bd96b); }); F.rLight.intensity = off ? 0 : 1.2;
  F.bulb.light.intensity = o.flicker && Math.sin(O * 37) > 0.6 && Math.sin(O * 3.1) > 0.4 ? 1.5 : 7;
  drawPhone(F.phone.tex, o.phone || 'onebar', O); drawPhone(F.dPhone.tex, o.dphone || 'call', O); F.dPhone.rotation.z = o.buzz ? Math.sin(O * 70) * 0.06 : 0;
  if (o.tv) { drawTV(F.tvT, O); F.tvL.intensity = 4; } else { F.tvT.g.fillStyle = '#000'; F.tvT.g.fillRect(0, 0, 1000, 560); F.tvT.needsUpdate = true; F.tvL.intensity = 0; }
  const nOn = o.ntv ?? 0; if (nOn) drawTV(F.ntvT, O); else { F.ntvT.g.fillStyle = '#000'; F.ntvT.g.fillRect(0, 0, 1000, 560); F.ntvT.needsUpdate = true; } F.ntvL.intensity = nOn * 3.5;
  return F.hero; }
const ROUTER = V([-0.6, 1.75, -2.85]);
const phoneUp = (O, w = 1, reach = 0) => [-2.3 - 0.35 * reach + 0.12 * Math.sin(O * 2.6) * w, 0.15 * Math.sin(O * 1.9) * w, -1.05 + 0.25 * reach, 0.25 - 0.2 * reach];
function onToilet(O, w = 1, stand = 0) { const st = eIO(stand); hp(F.hero, O, [3.25, lerp(0, 0.56, st), lerp(-1.95, -1.85, st)], -0.25, { ...idle(O), bob: lerp(TSIT.bob, 0, st), legs: TSIT.legs.map(l => [l[0] * (1 - st), l[1] * (1 - st)]), spineX: -0.12 * st, headX: lerp(-0.35, -0.6, st), headY: 0.25,
  arms: [[0.1 - 0.5 * st, 0, 0.35 + 0.4 * st, 0.6], phoneUp(O, w, st)] }, st > 0.5 ? 'grit' : 'worried'); }
const deskCam = (z0 = 1.6, z1 = 1.35, t0 = 0, t1 = 1) => ({ pf: (O) => F.dPhone.localToWorld(V([0.1 - 0.12 * seg(O, t0, t1), -0.35, lerp(z0, z1, seg(O, t0, t1))])), lf: () => wp(F.dPhone), fov: 34 });
shot(0, 3.0, 'flat', { p0: [-0.2, 1.95, -1.9], p1: [0.7, 2.25, 1.9], l0: [-0.6, 1.72, -2.88], l1: [-1.8, 1.75, -1.25], fov: 36, ease: 'io' }, (lt, O) => {
  const h = flatBase(O); hp(h, O, [-1.8, 0, -1.25], 0.75, { ...idle(O), ...SIT, headX: 0.35, arms: [[-0.7, 0, 0.3, 1.5], [-1.0, 0, -0.25, 1.45]] }, 'calm'); }, { grade: 'night', dof: (O) => O < 1.4 ? 0.6 : 0.35 });
const T1 = tS(1);
shot(T1, T1 + 2.8, 'flat', { ease: 'lin', p0: [4.35, 1.5, 1.4], p1: [4.2, 1.45, 0.95], l0: [3.2, 1.35, -1.95], fov: 46 }, (lt, O) => { flatBase(O); onToilet(O, 1, seg(O, T1 + 2.0, T1 + 2.8)); }, { grade: 'bath' });
shot(T1 + 2.8, T1 + 6.6, 'flat', { ease: 'lin', p0: [4.3, 0.9, 0.7], p1: [4.15, 0.95, 0.35], l0: [3.25, 2.35, -1.85], fov: 54 }, (lt, O) => { flatBase(O); onToilet(O, 0.6, 1); }, { grade: 'bath' });
shot(T1 + 6.6, tE(1), 'flat', deskCam(1.5, 1.2, T1 + 6.6, tE(1)), (lt, O) => { flatBase(O, { dphone: O > T1 + 7.4 ? 'nobar' : 'onebar' }); onToilet(O, 0.3, 1); }, { grade: 'bath', dof: 0.6 });
const T3 = tS(3);
function neighOn(O) { const awake = O > T3 + 1.6; const hug = eOut(seg(O, T3 + 2.0, T3 + 2.5)); const gig = O > tE(3) - 1.2 ? Math.abs(Math.sin(O * 14)) * 0.05 : 0;
  hp(F.neigh, O, [8.0, 0, -1.0], Math.PI / 2, { ...idle(O, 2), ...SIT, bob: SIT.bob + gig, spineX: awake ? -0.05 : 0.25, headX: awake ? -0.05 : 0.45, headZ: awake ? 0 : 0.25, arms: [[-1.1 * hug, 0, 0.6 - 0.4 * hug, 1.7 * hug], [-1.1 * hug, 0, -0.6 + 0.4 * hug, 1.7 * hug]] }, awake ? (gig ? 'laugh' : 'smile') : 'calm', 'neigh');
  if (!awake) F.neigh.lids.forEach(l => { l.scale.y = 1; l.position.y = 0.37; }); F.cushion.visible = true; F.cushion.position.copy(wp(F.neigh.spine)).add(V([0.38 * hug + 0.05, 0.25, 0.0])); F.cushion.rotation.set(0, Math.PI / 2, 0.1 * Math.sin(O * 3)); }
shot(T3, T3 + 3.0, 'flat', { ease: 'io', p0: [-0.8, 2.1, 6.4], p1: [8.2, 2.1, 6.4], l0: [-0.8, 1.5, -1.2], l1: [8.4, 1.4, -1.2], fov: 46 }, (lt, O) => {
  const r = ringAt(F.ring, O, T3 + 0.15, ROUTER, 10.5, 1.8); const h = flatBase(O, { ntv: r > 8.8 || O > T3 + 1.6 ? 1 : 0 }); hp(h, O, [-1.95, 0, -0.95], -Math.PI / 2, { ...idle(O), ...SIT }, 'calm'); ringAt(F.ring, O, T3 + 0.15, ROUTER, 10.5, 1.8); neighOn(O); }, { grade: 'night' });
shot(T3 + 3.0, T3 + 4.2, 'flat', { ease: 'lin', p0: [-1.15, 1.95, -0.45], p1: [-1.3, 1.92, -0.55], l0: [-3.8, 1.75, 0.2], fov: 38 }, (lt, O) => { const h = flatBase(O, { tv: true }); hp(h, O, [-1.95, 0, -0.95], -Math.PI / 2 + 0.15, { ...idle(O), ...SIT }, 'confused'); }, { grade: 'night', dof: 0.3 });
shot(T3 + 4.2, T3 + 8.0, 'flat', { ease: 'lin', p0: [-3.7, 2.25, -0.25], p1: [-3.65, 2.25, -0.5], l0: [-1.95, 2.1, -0.95], fov: 62 }, (lt, O) => { const h = flatBase(O, { tv: true, ntv: 1 }); const yell = O > T3 + 5.6;
  hp(h, O, [-1.95, 0, -0.95], -Math.PI / 2 + 0.15, { ...idle(O), ...SIT, headY: yell ? -0.55 : 0, spineY: yell ? -0.2 : 0, arms: yell ? [[-0.5, 0, 0.3, 1.0], [-1.5 + 0.15 * Math.sin(O * 8), 0, -0.6, 0.5]] : [[-0.6, 0, 0.4, 1.2], [-0.4, 0, -0.3, 0.8]] }, yell ? 'grit' : 'shock'); }, { grade: 'night', dof: 0.35 });
shot(T3 + 8.0, tE(3), 'flat', { ease: 'lin', p0: [9.6, 1.7, 1.6], p1: [9.4, 1.75, 1.2], l0: [8.0, 1.6, -1.0], fov: 44 }, (lt, O) => { flatBase(O, { ntv: 1 }); neighOn(O); }, { grade: 'night', dof: 0.3 });
const ST_ = S.street, HWIN = V([-0.8, 7.6, -6.35]), BAL = V([0, 6.07, -5.2]);
function streetBase(O, r = -1, o = {}) { const s = ST_; resetRig(s.hero); s.hero.root.visible = false; s.plane.visible = false; s.ring.visible = false; s.cars.visible = s.carLights.visible = false; s.trash.forEach(d => d.m.visible = false);
  const lit = (d) => r >= 0 ? d < r : O > tS(5) + 1.5; s.blocks.forEach(b => { b.wm.emissiveIntensity = lit(b.pos.distanceTo(HWIN)) ? 1.6 : 0.15; });
  s.people.forEach((P, i) => { resetRig(P); const x = -9 + i * 2.1, z = i % 2 ? -4.3 : 12.3; const on = r >= 0 ? Math.abs(x) < r : O > tS(5) + 1.5; const wave = o.wave ? eOut(seg(O, o.wave + i * 0.05, o.wave + 0.4 + i * 0.05)) : 0; P.root.position.set(x, 0, z);
    P.root.rotation.y = lerp(i % 2 ? 0.2 : Math.PI - 0.2, Math.atan2(-x, -10 - z), wave);
    pose(P, { ...idle(O, i), headX: on ? 0.25 - 0.6 * wave : 0, arms: [[0, 0, 0.13, 0.2], on ? [lerp(-1.3, -2.8, wave) + 0.25 * Math.sin(O * 9 + i) * wave, 0, lerp(-0.2, -0.5, wave), lerp(1.3, 0.3, wave)] : [0.05, 0, -0.13, 0.2]] }); P.face(on ? 'smile' : 'calm', O); P.phone.visible = on; });
  return s.hero; }
function bikeOn(O) { const s = ST_, t0 = tS(5) + 2.4, hit = tS(5) + 3.3; const k = seg(O, t0, hit); s.bike.position.set(lerp(-8, 2.0, k), 0, 9.3); s.bike.rotation.set(0, 0, O > hit ? -0.25 * Math.min(1, (O - hit) * 4) : 0);
  const R = s.bike.rider; R.root.visible = true; const fly = O > hit ? eOut(seg(O, hit, hit + 0.5)) : 0; R.root.position.set(0.6 * fly, 0.25 + 0.4 * Math.sin(fly * Math.PI), 0); R.root.rotation.set(0, Math.PI / 2, -1.2 * fly);
  pose(R, { headX: O < hit ? 0.5 : 0, arms: [[-1.2, 0, 0.2, 0.3], O < hit ? [-1.4, 0, -0.2, 1.3] : [-2.6, 0, -0.6, 0.3]], legs: [[1.2, 1.2], [1.2, 1.2]] }); R.face(O < hit ? 'smile' : 'shock', O); burst(s.trash, O, hit, V([2.5, 0.9, 9.3]), 2.2, 2.4); s.bin.rotation.z = O > hit ? -Math.min(1.4, (O - hit) * 5) : 0; }
const T5 = tS(5);
shot(T5, T5 + 3.0, 'street', { p0: [1.6, 7.0, -3.4], p1: [9, 23, 20], l0: [-0.4, 7.2, -6.5], l1: [-2, 3, 0], fov: 50, ease: 'io' }, (lt, O) => { const r = ringAt(ST_.ring, O, T5 + 0.1, HWIN, 70, 2.4, 0.5); streetBase(O, r); ringAt(ST_.ring, O, T5 + 0.1, HWIN, 70, 2.4, 0.5); bikeOn(O); }, { grade: 'night', bloom: 0.2 });
shot(T5 + 3.0, T5 + 4.6, 'street', { ease: 'lin', p0: [5.6, 0.7, 12.4], p1: [5.2, 0.8, 12.0], l0: [1.6, 0.8, 9.3], fov: 46 }, (lt, O) => { streetBase(O); bikeOn(O); }, { grade: 'night', shakeAt: [[T5 + 3.3, 0.03]], bloom: 0.2 });
shot(T5 + 4.6, T5 + 8.9, 'street', { ease: 'lin', p0: [1.2, 4.2, 2.6], p1: [1.0, 4.6, 1.6], l0: [0, 7.6, -5.2], fov: 46 }, (lt, O) => { streetBase(O); bikeOn(O);
  hp(ST_.hero, O, BAL.toArray(), 0, { ...idle(O), spineX: 0.3, headX: 0.35, arms: [[-1.2, 0, 0.5, 0.4], [-2.0 + 0.3 * Math.sin(O * 7), 0, -0.9, 0.3]] }, 'grit'); }, { grade: 'night', dof: 0.25, bloom: 0.2 });
shot(T5 + 8.9, tE(5), 'street', { ease: 'lin', p0: [3.5, 1.4, 16.5], p1: [3.0, 1.6, 15.5], l0: [-1, 3.0, -2], fov: 50 }, (lt, O) => { streetBase(O, -1, { wave: T5 + 8.9 }); }, { grade: 'night', bloom: 0.2 });
const T12 = tS(12);
function planeOn(O, t0, t1) { const p = ST_.plane; p.visible = true; const k = seg(O, t0, t1); p.position.set(lerp(-18, 18, k), 36 + 4 * k, 26); p.rotation.set(0, 0.16, 0.22 * Math.sin(k * Math.PI)); }
function balconyHero(O, expr, o = {}) { hp(ST_.hero, O, BAL.toArray(), o.ry ?? 0, { ...idle(O), headX: o.headX ?? -0.55, headY: 0.25 * Math.sin(O * 0.6), arms: o.arms || [[0.1, 0, 0.2, 0.3], [0.1, 0, -0.2, 0.3]] }, expr); }
shot(T12, T12 + 2.8, 'street', { ease: 'lin', p0: [1.3, 7.3, -5.0], p1: [1.45, 7.25, -4.7], l0: [0, 34, 26], fov: 62 }, (lt, O) => { streetBase(O); planeOn(O, T12 - 0.4, T12 + 3.2); balconyHero(O, 'shock'); }, { grade: 'night', bloom: 0.22 });
shot(T12 + 2.8, T12 + 5.6, 'street', { ease: 'lin', p0: [0.9, 7.6, -1.0], p1: [0.75, 7.75, -1.6], l0: [0, 8.05, -5.2], fov: 46 }, (lt, O) => { streetBase(O); balconyHero(O, 'shock'); }, { grade: 'night', dof: 0.3, bloom: 0.22, shakeAt: [[T12 + 3.0, 0.02]] });
function cabinBase(O) { const c = S.cabin; const g = c.scrT.g; g.fillStyle = '#0a1020'; g.fillRect(0, 0, 160, 110); spinner(g, 80, 50, 22, O); g.fillStyle = '#fff'; g.font = '600 13px InterW, Arial'; g.textAlign = 'center'; g.fillText('Connecting to HIS WI-FI…', 80, 98); c.scrT.needsUpdate = true;
  c.pax.forEach((P, i) => { pose(P, { ...idle(O, i), ...SIT, headX: 0.15 }); P.face(i % 3 ? 'confused' : 'worried', O); }); }
shot(T12 + 5.6, T12 + 6.8, 'cabin', { ease: 'lin', p0: [0.0, 1.95, -11.6], p1: [0.0, 1.9, -10.8], l0: [0, 1.0, 0], fov: 50 }, (lt, O) => { cabinBase(O); }, { grade: 'cabin', dof: 0.2 });
shot(T12 + 6.8, tE(12), 'street', { ease: 'lin', p0: [1.6, 6.8, -0.2], p1: [1.3, 7.0, -1.0], l0: [0, 7.9, -5.2], fov: 50 }, (lt, O) => { streetBase(O); planeOn(O, T12 + 6.0, T12 + 10.4);
  balconyHero(O, 'smirk', { headX: -0.25, arms: [[-0.2, 0, 0.6, 1.4], [-2.6, 0, -0.8 + 0.25 * Math.sin(O * 8), 0.3]] }); }, { grade: 'night', dof: 0.2, bloom: 0.22 });
const T7 = tS(7);
function classBase(O) { const c = S.cls, hide = O > T7 + 4.35; c.kids.forEach((k, i) => { resetRig(k); const x = -2.6 + (i % 3) * 2.6, z = -1.4 + Math.floor(i / 3) * 2.0 + 0.62; k.root.position.set(x, 0, z); k.root.rotation.y = Math.PI;
    pose(k, { ...idle(O, i), bob: -0.26, legs: [[1.5, 1.45], [1.5, 1.45]], headX: hide ? -0.05 : 0.5, spineX: hide ? 0 : 0.15, arms: hide ? [[-1.0, 0, 0.25, 1.4], [-1.0, 0, -0.25, 1.4]] : [[-0.9, 0, 0.25, 1.4], [-0.5, 0, -0.2, 0.9]] }); k.face(hide ? 'calm' : 'smile', O);
    k.phone.visible = !hide && !(i === 1 && O > T7 + 4.2); drawPhone(k.phone.tex, 'voicemail', O + i); c.glows[i].position.copy(wp(k.head)).add(V([0, 0.25, -0.45])); c.glows[i].intensity = hide ? 0 : 2.2; });
  const turn = eIO(seg(O, T7 + 3.9, T7 + 4.3)); hp(c.teacher, O, [-1.3, 0, -4.2], lerp(Math.PI, 1.0, turn), { ...idle(O, 7), arms: [[0.05, 0, 0.14, 0.2], turn < 0.5 ? [-2.2 + 0.1 * Math.sin(O * 8), 0, -0.2, 0.6] : [-0.3, 0, -0.5, 1.6]] }, turn > 0.5 ? 'confused' : 'calm', 'teacher');
  const sl = seg(O, T7 + 4.3, T7 + 5.3); c.slider.visible = O > T7 + 4.3; if (c.slider.visible) { c.slider.position.copy(V([0, 0.03, -0.9]).lerp(V([-1.15, 0.03, -3.75]), eOut(sl))); c.slider.rotation.set(-Math.PI / 2, 0, sl * 9); } }
shot(T7, T7 + 3.7, 'cls', { ease: 'lin', p0: [0.5, 2.7, -4.7], p1: [0.3, 2.5, -4.1], l0: [0, 0.9, 1.4], fov: 50 }, (lt, O) => { classBase(O); }, { grade: 'class', dof: 0.2 });
shot(T7 + 3.7, tE(7), 'cls', { ease: 'lin', p0: [4.6, 1.6, -1.6], p1: [4.3, 1.65, -2.0], l0: [-0.6, 0.95, -2.6], fov: 54 }, (lt, O) => { classBase(O); }, { grade: 'class' });
const T15 = tS(15);
shot(T15, tE(15), 'flat', { ease: 'lin', p0: [1.2, 1.75, 2.7], p1: [1.0, 1.8, 1.5], l0: [0.8, 1.3, -1.3], fov: 48, live: 0.6 }, (lt, O) => {
  const h = flatBase(O, { shades: true, chairFlip: true }); F.phone.visible = false; hp(h, O, [0.8, 0, -1.45], 0, { ...idle(O), ...SIT, spineX: -0.18, headX: -0.08, headZ: 0.06, arms: [[-0.3, 0, 0.5, 0.9], [-0.3, 0, -0.5, 0.9]] }, 'smirk');
  F.envs.forEach((e, i) => { const t0 = T15 + 0.3 + i * 0.07, k = eOut(seg(O, t0, t0 + 0.6)); e.visible = O > t0; if (!e.visible) return; const u = e.userData; const tgt = V([0.8 + Math.cos(u.a) * u.r, u.y, -1.25 + Math.sin(u.a) * u.r * 0.7]);
    e.position.copy(V([-3.6, 0.02, 1.2 + (i % 5) * 0.2]).lerp(tgt, k)); e.rotation.set(0, u.rot + (1 - k) * 4, 0); }); }, { grade: 'night', dof: 0.4 });

// ===== Day 20: the provider calls; voicemail; "Tell them to turn it off and on again." — he pulls the plug, the continent blacks out =====
const SPC = S.space, ISSDIR = V([-0.55, 0.62, -0.56]).normalize();
function spaceBase(O, o = {}) { const s = SPC; s.earth.rotation.y = 0.4 + O * 0.004; s.clouds.rotation.y = 0.4 + O * 0.006; s.ring.visible = false; s.iss.position.copy(ISSDIR.clone().multiplyScalar(32.2)); s.iss.lookAt(0, 0, 0);
  s.earth.material.emissiveIntensity = o.lights ?? 1.4; s.sats.forEach((g, i) => { const a = i * 0.63 + O * 0.01, b = (i % 3 - 1) * 0.5; g.position.set(Math.cos(a) * 125 * Math.cos(b), Math.sin(b) * 125, Math.sin(a) * 125 * Math.cos(b)); g.rotation.set(O * 0.2 + i, i, 0); g.gl.scale.setScalar(2.5); }); }
const T20 = tS(20), UNPLUG = T20 + 10.6, REPLUG = T20 + 11.75;
shot(T20, T20 + 2.6, 'flat', deskCam(1.6, 1.3, T20, T20 + 2.6), (lt, O) => { const h = flatBase(O, { dphone: O < T20 + 2.3 ? 'call' : 'voicemail', buzz: O < T20 + 2.3 }); hp(h, O, [0.8, 0, -1.4], Math.PI, { ...idle(O), ...SIT }, 'calm'); }, { grade: 'night', dof: 0.7 });
shot(T20 + 2.6, UNPLUG - 0.5, 'flat', { ease: 'lin', p0: [1.8, 1.8, 1.4], p1: [1.6, 1.9, 0.6], l0: [0.8, 1.85, -1.4], fov: 54 }, (lt, O) => {
  const h = flatBase(O, { dphone: 'voicemail' }); F.phone.visible = false; const sp = O > T20 + 8.0; hp(h, O, [0.8, 0, -1.4], 0.44, { ...idle(O), ...SIT, headX: sp ? -0.05 : 0.12, headY: sp ? 0.1 : 0.25, arms: sp ? [[-0.9, 0, 0.3, 1.5], [-1.2 + 0.1 * Math.sin(O * 5), 0, -0.5, 1.0]] : [[-0.9, 0, 0.3, 1.5], [-0.6, 0, -0.4, 1.2]] }, sp ? 'smirk' : 'calm'); }, { grade: 'night', dof: 0.3 });
shot(UNPLUG - 0.5, UNPLUG + 0.35, 'flat', { ease: 'lin', p0: [-1.5, 2.35, -0.4], p1: [-1.25, 2.25, -1.05], l0: [-0.4, 1.7, -2.6], fov: 48 }, (lt, O) => { const h = flatBase(O, { routerOff: O > UNPLUG }); F.phone.visible = false;
  hp(h, O, [0.25, 0, -2.15], -1.25, { ...idle(O), headY: -0.3, arms: [[0.05, 0, 0.14, 0.2], [lerp(-0.6, -1.6, eIO(seg(O, UNPLUG - 0.5, UNPLUG - 0.1))) + 0.4 * seg(O, UNPLUG - 0.1, UNPLUG + 0.1), 0.5, -0.3, 0.4]] }, 'smirk'); F.plug.visible = true; const yank = eOut(seg(O, UNPLUG - 0.05, UNPLUG + 0.2)); F.plug.position.copy(ROUTER).add(V([0.32 + 0.35 * yank, -0.02 - 0.1 * yank, 0.15 + 0.25 * yank])); F.plug.rotation.set(0.5 * Math.sin(O * 14) * yank, 0, 1.4 * yank + 0.35 * Math.sin(O * 11) * yank); }, { grade: 'night', dof: 0.15, shakeAt: [[UNPLUG, 0.035]] });
shot(UNPLUG + 0.35, tE(20), 'space', { ease: 'lin', p0: [-30, 40, 90], p1: [-28, 38, 84], l0: [-4, 8, 0], fov: 46 }, (lt, O) => { const k = O < REPLUG ? 0 : eOut(seg(O, REPLUG, REPLUG + 0.5)); spaceBase(O, { lights: O < UNPLUG + 0.45 ? 1.4 : 1.4 * k + 0.05 }); }, { grade: 'space', bloom: 0.25 });
const T23 = tS(23);
shot(T23, T23 + 3.0, 'car', { ease: 'lin', p0: [0.42, 1.62, 0.75], p1: [0.38, 1.56, 0.5], l0: [0.35, 1.36, -0.12], fov: 44 }, (lt, O) => { const c = S.car; c.bok.forEach((b, i) => { b.position.z = -8 - ((O * (2 + i % 3) + i * 3) % 22); });
  pose(c.driver, { ...idle(O, 4), ...SIT, arms: [[-1.2, 0, 0.3, 0.6], [-1.2, 0, -0.3, 0.6]] }); c.driver.face('confused', O); }, { grade: 'car', dof: 0.15 });
function trafficOn(O) { const s = ST_, m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), m5 = new THREE.Matrix4(); s.cars.visible = s.carLights.visible = true; const k = seg(O, T23 + 3.0, tE(23));
  s.carD.forEach((d, i) => { const lane = 2 + d.lane * 1.6, dir = d.x0 < 0 ? 1 : -1, jam = dir > 0 ? -4 - (i % 40) * 2.3 : 4 + (i % 40) * 2.3; const x = lerp(d.x0, jam, Math.min(1, k * 1.4 + (1 - Math.abs(d.x0) / 280) * 0.3));
    m4.compose(V([x, 0.4, lane]), q.setFromEuler(new THREE.Euler(0, dir > 0 ? 0 : Math.PI, 0)), V([1, 1, 1])); s.cars.setMatrixAt(i, m4);
    [-0.3, 0.3].forEach((dz, j) => { m5.compose(V([x + dir * 0.92, 0.45, lane + dz]), q.identity(), V([1, 1, 1])); s.carLights.setMatrixAt(i * 2 + j, m5); }); });
  s.cars.instanceMatrix.needsUpdate = true; s.carLights.instanceMatrix.needsUpdate = true; }
shot(T23 + 3.0, tE(23), 'street', { ease: 'lin', p0: [45, 22, 8], p1: [38, 20, 7], l0: [-5, 0, 4], fov: 50 }, (lt, O) => { streetBase(O); trafficOn(O); }, { grade: 'night', bloom: 0.3 });
shot(tS(27), tE(27), 'space', { ease: 'lin', p0: [3, 2, -364], p1: [1.5, 1, -374], l0: [0, 0, -392], fov: 42 }, (lt, O) => { spaceBase(O); const k = seg(O, tS(27) + 0.5, tS(27) + 1.6); SPC.wifiIcon.material.opacity = 0.25 + 0.75 * eOut(k) * (0.85 + 0.15 * Math.sin(O * 6)); SPC.moon.rotation.set(0, 0, 0.05 * Math.sin(O * 0.5)); }, { grade: 'space', bloom: 0.3 });
const T36 = tS(36);
shot(T36, tE(36), 'mars', { ease: 'lin', pf: (O) => S.mars.rover.position.clone().add(V([3.2 - 0.6 * seg(O, T36, tE(36)), 0.15, 3.4])), lf: () => S.mars.rover.position.clone().add(V([-0.3, 1.3, 0.2])), fov: 44 }, (lt, O) => { const m = S.mars, k = seg(O, T36, T36 + 2.5);
  m.rover.position.set(lerp(-2.5, 0.2, eOut(k)), -0.2 + 0.03 * Math.sin(O * 9) * (k < 1 ? 1 : 0), 0); m.rover.head.rotation.y = 0.5 + 0.2 * Math.sin(O * 0.8);
  const slam = (t) => { const a = seg(O, t - 0.25, t), b = seg(O, t, t + 0.25); return a < 1 ? -0.9 * eIO(a) : -0.9 * (1 - eOut(b)); }; m.rover.arm.rotation.z = -0.3 + (O > T36 + 3.3 ? slam(T36 + 3.6) + slam(T36 + 3.95) : 0); m.rover.fore.rotation.z = -0.6;
  const g = m.rover.scrT.g; g.fillStyle = '#0a1020'; g.fillRect(0, 0, 160, 120); spinner(g, 80, 50, 26, O); g.fillStyle = '#fff'; g.font = '700 16px InterW, Arial'; g.textAlign = 'center'; g.fillText('PING 25 MIN', 80, 108); m.rover.scrT.needsUpdate = true;
  m.dust.forEach((d, i) => { const a = O * 2.4 + i * 0.7, h = (i / 90) * 9, r = 0.6 + h * 0.35; d.position.set(-11 + Math.cos(a) * r, -0.8 + h, -16 + Math.sin(a) * r); d.scale.setScalar(1.2 + h * 0.3); }); }, { grade: 'mars', dof: 0.25, shakeAt: [[T36 + 3.6, 0.02], [T36 + 3.95, 0.02]] });
const T53 = tS(53); const blobGig = (O) => { const g = O > T53 + 3.2 ? Math.abs(Math.sin(O * 13)) * 0.08 : 0.03 * Math.sin(O * 3); S.alien.blob.scale.set(1 + g, 1 - g, 1); S.alien.blob.position.y = 0.55 + g * 0.6; };
shot(T53, T53 + 2.6, 'alien', { ease: 'lin', p0: [2.6, 2.0, 5.2], p1: [2.2, 2.05, 4.4], l0: [-0.6, 1.4, -0.2], fov: 48 }, (lt, O) => { drawTV(S.alien.tvT, O, true); blobGig(O); }, { grade: 'alien', bloom: 0.2 });
shot(T53 + 2.6, tE(53), 'alien', { ease: 'lin', p0: [-2.5, 1.6, -0.75], p1: [-2.25, 1.62, -0.4], l0: [1.9, 1.5, 2.4], fov: 40 }, (lt, O) => { drawTV(S.alien.tvT, O, true); blobGig(O); }, { grade: 'alien', dof: 0.3, bloom: 0.2 });
const T72 = tS(72);
shot(T72, T72 + 3.0, 'deep', { ease: 'lin', p0: [0, -8, -215], p1: [0, 3, -238], l0: [0, 0, -300], fov: 50 }, (lt, O) => { const d = S.deep; d.web.visible = false; d.andro.visible = true; d.andro.rotation.z = 0.5 + O * 0.02; }, { grade: 'deep', bloom: 0.3 });
shot(T72 + 3.0, T72 + 4.4, 'flat', deskCam(1.45, 1.15, T72 + 3.0, T72 + 4.4), (lt, O) => { const h = flatBase(O, { dphone: 'chat' }); hp(h, O, [0.8, 0, -1.4], Math.PI, { ...idle(O), ...SIT }, 'calm'); }, { grade: 'night', dof: 0.7 });
shot(T72 + 4.4, tE(72), 'flat', { ease: 'lin', p0: [0.4, 1.9, 1.3], p1: [0.2, 1.85, 0.8], l0: [-1.8, 1.4, -1.25], fov: 50 }, (lt, O) => { const h = flatBase(O, { phone: 'chat' }); const flop = eIO(seg(O, T72 + 7.6, T72 + 8.1));
  hp(h, O, [-1.8, 0, -1.25], 0.75, { ...idle(O), ...SIT, spineX: -1.3 * flop, headX: 0.3 * (1 - flop), arms: [[-0.7, 0, 0.3 + 0.8 * flop, 1.5 * (1 - flop)], [-1.0 - 1.4 * flop, 0, -0.25 - 0.8 * flop, 1.45 * (1 - flop)]] }, 'worried'); }, { grade: 'night', dof: 0.3 });
shot(tS(87), tE(87), 'deep', { ease: 'out', p0: [0, 0, -1450], p1: [120, 380, 1500], l0: [0, 0, -1600], fov: 50 }, (lt, O) => { const d = S.deep; d.web.visible = true; d.andro.visible = false; ringAt(d.ring, O, tS(87) + 0.1, V([0, 0, -1600]), 2600, 2.6, 30); }, { grade: 'deep', bloom: 0.35 });
const TE = tS('END');
shot(TE, TE + 6.0, 'flat', { ease: 'lin', p0: [4.35, 1.5, 1.4], p1: [4.2, 1.45, 0.95], l0: [3.2, 1.35, -1.95], fov: 46 }, (lt, O) => { flatBase(O, { flicker: O > TE + 1.4 && O < TE + 2.0 }); onToilet(O, 0.8, 0); }, { grade: 'bath' });
shot(TE + 6.0, DUR, 'flat', { ease: 'lin', p0: [3.85, 1.75, 0.15], p1: [3.75, 1.78, -0.25], l0: [3.25, 1.85, -1.95], fov: 44 }, (lt, O) => { flatBase(O); onToilet(O, 0.2, 0); }, { grade: 'bath', dof: 0.3 });
function stepAt(T) { let s = null; for (const st of STEPS) if (T >= st.t) s = st; return s; }
function spaced(g, text, x, y, sp) { let cx = x; for (const ch of text) { g.fillText(ch, cx, y); cx += g.measureText(ch).width + sp; } return cx - x; }
const measC = mk(10, 10).getContext('2d');
function drawStat(T, sh) {
  const s = stepAt(T); if (!s || sh.hideStat || s.day === 'END') return; const g = ctx, x = 30; g.save();
  g.shadowColor = 'rgba(0,0,0,0.55)'; g.shadowBlur = 14; g.shadowOffsetY = 2; g.fillStyle = '#fff'; g.textAlign = 'left';
  g.font = '600 30px InterW'; spaced(g, 'WI-FI RANGE', x, 288, 4.5);
  const dt = (T - s.t) * 30; const sc = dt < 5 ? (dt < 2.5 ? 1 + 0.06 * dt / 2.5 : 1.06 - 0.06 * (dt - 2.5) / 2.5) : 1;
  g.save(); g.translate(x, 412); g.scale(sc, sc); let nf = 128; g.font = `500 ${nf}px Lora`; while (g.measureText(s.v).width > W * 0.9 && nf > 60) { nf -= 4; g.font = `500 ${nf}px Lora`; } g.fillText(s.v, 0, 0); g.restore();
  g.font = '600 27px InterW'; spaced(g, s.cmp, x, 462, 3.6);
  g.font = '600 25px InterW'; g.globalAlpha = 0.9; spaced(g, 'DAY ' + s.day, x, 502, 3.2); g.globalAlpha = 1;
  g.shadowBlur = 0; g.shadowOffsetY = 0; g.font = '700 25px InterW'; measC.font = '700 25px InterW'; const tw = spaced(measC, '×2 EVERY DAY', 0, 0, 2.5);
  rr(g, x, 520, tw + 26, 42, 3); g.fillStyle = '#E21E39'; g.fill(); g.fillStyle = '#fff'; spaced(g, '×2 EVERY DAY', x + 13, 550, 2.5);
  if (s.status) { const sw = spaced(measC, s.status, 0, 0, 2.5), sx = x + tw + 40; rr(g, sx, 520, sw + 26, 42, 3); g.fillStyle = 'rgba(255,255,255,0.92)'; g.fill(); g.fillStyle = '#0b1020'; spaced(g, s.status, sx + 13, 550, 2.5); } g.restore();
}
function drawTitle(O) {
  if (O < TITLE.t0 || O >= TITLE.t1) return;
  const a = eOut(clamp((O - TITLE.t0) / 0.45)) * clamp((TITLE.t1 - O) / 0.3), rise = (1 - eOut(clamp((O - TITLE.t0) / 0.7))) * 40;
  const g = ctx; g.save(); g.globalAlpha = a; g.textAlign = 'center';
  const wash = g.createLinearGradient(0, 120, 0, 900); wash.addColorStop(0, 'rgba(40,16,6,0.55)'); wash.addColorStop(1, 'rgba(40,16,6,0)'); g.fillStyle = wash; g.fillRect(0, 0, W, 900);
  g.translate(0, rise); g.shadowColor = 'rgba(0,0,0,0.45)'; g.shadowBlur = 30; g.shadowOffsetY = 4; g.fillStyle = '#fff';
  g.font = '500 96px Playfair'; g.fillText('What if your', W / 2, 380);
  g.font = 'italic 500 190px Playfair'; g.fillStyle = '#d9fbff'; g.fillText('Wi-Fi range', W / 2, 590);
  g.fillStyle = '#fff'; g.font = '500 96px Playfair'; g.fillText('doubled every day?', W / 2, 735);
  g.shadowBlur = 0; g.shadowOffsetY = 0; g.globalAlpha = a * 0.85; g.fillStyle = '#E21E39'; g.fillRect(W / 2 - 70, 780, 140, 6); g.restore();
}
function cueAt(O) { let best = null; for (const c of DIALOGUE) if (spanHit(c, O) && O >= c.words[0].t - 0.03) if (!best || c.spans[0][0] > best.spans[0][0]) best = c; return best; }
function strokeText(g, text, x, y, sw) { g.lineJoin = 'round'; g.miterLimit = 2; g.lineWidth = sw; g.strokeStyle = '#000'; g.strokeText(text, x, y); g.fillText(text, x, y); }
function captionChunk(c, O) { const chunks = []; let cur = []; c.words.forEach((w, i) => { cur.push(w); if (cur.length >= 3 || /[.!?…,]$/.test(w.w) || i === c.words.length - 1) { chunks.push(cur); cur = []; } });
  let chunk = chunks[0]; for (const ch of chunks) if (O >= ch[0].t - 0.03) chunk = ch; return chunk.filter(w => O >= w.t - 0.03).map(w => w.w.toUpperCase()).join(' '); }
function drawCaptions(O) {
  const c = cueAt(O); if (!c) return; const g = ctx; g.save(); g.textAlign = 'center'; g.fillStyle = '#fff';
  if (c.kind === 'shout') { const k = O - c.words[0].t; const s = k < 0.12 ? 0.6 + 4 * k : 1 + 0.04 * Math.sin(O * 50); const txt = c.words.filter(w => O >= w.t - 0.03).map(w => w.w).join(' ');
    g.translate(W / 2 + Math.sin(O * 73) * 6, H * 0.7 + Math.cos(O * 61) * 5); g.scale(s, s); g.rotate(Math.sin(O * 9) * 0.03);
    let fs = 118; g.font = `800 ${fs}px Montserrat`; while (g.measureText(txt).width > W * 0.84 && fs > 60) { fs -= 4; g.font = `800 ${fs}px Montserrat`; }
    g.shadowColor = 'rgba(0,0,0,0.45)'; g.shadowBlur = 20; strokeText(g, txt, 0, 0, 16); g.restore(); return; }
  const shown = captionChunk(c, O); if (!shown) { g.restore(); return; }
  let fs = 78; g.font = `800 ${fs}px Montserrat`; while (g.measureText(shown).width > W * 0.82 && fs > 44) { fs -= 3; g.font = `800 ${fs}px Montserrat`; }
  const nm = { hero: null, isp: 'VOICEMAIL' }[c.speaker];
  strokeText(g, shown, W / 2, H * 0.72, 12); if (nm) { g.font = '700 30px InterW'; g.globalAlpha = 0.85; strokeText(g, nm, W / 2, H * 0.72 - fs - 8, 6); }
  g.restore();
}
function drawLower(O) {   // in-world news lower third (prop text)
  const g = ctx, y = 1560, a = eOut(clamp((O - 34.05) / 0.35)); g.save(); g.globalAlpha = a; g.translate((1 - a) * -200, 0);
  g.fillStyle = '#E21E39'; g.fillRect(40, y, 250, 70); g.fillStyle = '#fff'; g.font = '700 38px InterW'; g.textAlign = 'left'; spaced(g, 'BREAKING', 62, y + 49, 3);
  g.fillStyle = 'rgba(255,255,255,0.95)'; g.fillRect(290, y, 750, 70); g.fillStyle = '#0b1a3a'; g.font = '700 36px InterW'; spaced(g, 'CITY MOWS LOCAL MAN\u2019S HAIR', 316, y + 48, 2.5);
  g.fillStyle = '#0b1a3a'; g.fillRect(40, y + 70, 1000, 40); g.fillStyle = '#fff'; g.font = '600 24px InterW'; spaced(g, 'EXPERTS CONFIRM: IT SAYS HELP', 62, y + 98, 2); g.restore(); }
function wrapLines(g, text, maxW) { const out = []; let cur = ''; for (const w of text.split(' ')) { const t = cur ? cur + ' ' + w : w; if (g.measureText(t).width > maxW && cur) { out.push(cur); cur = w; } else cur = t; } if (cur) out.push(cur); return out; }
function drawDiary(O, sh) { const s = stepAt(O); if (!s || sh.hideDiary) return; const g = ctx, x = 30; let y = s.day === 'END' ? 330 : 640; g.save(); g.textAlign = 'left'; g.font = 'italic 400 46px Lora';
  g.shadowColor = 'rgba(0,0,0,0.7)'; g.shadowBlur = 16; g.shadowOffsetY = 2; g.fillStyle = '#fff';
  for (const [txt, on] of [[s.setup, s.son], [s.punch, s.pon]]) { if (!txt || on == null || O < on - 0.02) continue; g.globalAlpha = eOut(clamp((O - on) / 0.22)); for (const ln of wrapLines(g, txt, W * 0.86)) { g.fillText(ln, x, y); y += 56; } y += 10; }
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
// ---------------------------------------------------------------- grading / compositing
const GRADES = {
  night: { f: 'saturate(1.12) contrast(1.12) brightness(1.02)', tint: 'rgba(70,90,200,0.14)', mode: 'soft-light', vig: 0.42 },
  bath: { f: 'saturate(0.95) contrast(1.1) brightness(1.0)', tint: 'rgba(255,200,120,0.10)', mode: 'soft-light', vig: 0.45 },
  cabin: { f: 'saturate(1.05) contrast(1.1) brightness(0.98)', tint: 'rgba(90,140,255,0.12)', mode: 'soft-light', vig: 0.42 },
  class: { f: 'saturate(1.1) contrast(1.1) brightness(0.98)', tint: 'rgba(255,170,90,0.10)', mode: 'soft-light', vig: 0.38 },
  space: { f: 'saturate(1.15) contrast(1.1) brightness(1.0)', tint: 'rgba(40,80,200,0.10)', mode: 'screen', vig: 0.45 },
  iss: { f: 'saturate(1.0) contrast(1.08) brightness(1.0)', tint: 'rgba(160,190,255,0.08)', mode: 'soft-light', vig: 0.38 },
  car: { f: 'saturate(1.15) contrast(1.15) brightness(1.02)', tint: 'rgba(60,90,200,0.14)', mode: 'soft-light', vig: 0.48 },
  mars: { f: 'saturate(1.2) contrast(1.1) brightness(1.0)', tint: 'rgba(255,140,80,0.12)', mode: 'soft-light', vig: 0.4 },
  deep: { f: 'saturate(1.2) contrast(1.1) brightness(1.0)', tint: 'rgba(60,120,255,0.10)', mode: 'screen', vig: 0.48 },
  alien: { f: 'saturate(1.2) contrast(1.1) brightness(1.0)', tint: 'rgba(255,120,200,0.10)', mode: 'soft-light', vig: 0.42 },
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
const HEROES = [S.flat.hero, S.street.hero];
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
  const gr = GRADES[sh.grade] || GRADES.night;
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
  if (sh.flare) drawFlare(sh.flare[0], sh.flare[1], 0.9);
  if (sh.dark) { const d = sh.dark(O); if (d > 0) { ctx.fillStyle = `rgba(4,6,18,${d})`; ctx.fillRect(0, 0, W, H); } }
    if (!sh.hideStat && O >= STEPS[0].t) { ctx.save(); ctx.translate(W * 0.2, 400); ctx.scale(1, 0.62); const sg = ctx.createRadialGradient(0, 0, 0, 0, 0, W * 0.62); sg.addColorStop(0, 'rgba(0,0,0,0.34)'); sg.addColorStop(0.55, 'rgba(0,0,0,0.16)'); sg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = sg; ctx.fillRect(-W, -W, W * 3, W * 2); ctx.restore(); }
  drawGrain(O); drawTitle(O); drawStat(O, sh); drawDiary(O, sh); drawCaptions(O);
  for (const s of shots) if (s.flash !== undefined) { const d = Math.round((O - s.flash) * 30); if (d >= 0 && d < 3) { ctx.fillStyle = `rgba(255,255,255,${(s.fa || [0.95, 0.6, 0.25])[d]})`; ctx.fillRect(0, 0, W, H); } }
  return out.toDataURL('image/jpeg', RS > 1 ? 0.95 : 0.94);
}
export const TIMELINE = { STEPS, DUR, cuts: shots.map(s => s.t0), flashes: shots.filter(s => s.flash !== undefined).map(s => s.flash) };
window.captionText = (O) => { const c = cueAt(O); if (!c) return ''; return c.kind === 'shout' ? c.words.map(w => w.w).join(' ') : captionChunk(c, O); };
window.hookText = () => '';
window.S = S; window.cam = cam; window.shots = shots; window.renderFrame = renderFrame; window.TIMELINE = TIMELINE;
fetch('dialogue.json').then(r => r.json()).then(d => { DIALOGUE = d; }).catch(() => { DIALOGUE = []; })
  .then(() => Promise.all(['800 78px Montserrat', '500 96px Playfair', 'italic 500 236px Playfair', '500 128px Lora', '600 30px InterW', '700 30px InterW', 'italic 400 46px Lora', 'italic 500 190px Playfair'].map(f => document.fonts.load(f)))).then(() => { window.READY = true; });