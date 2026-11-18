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
  { day: 2, t: 7.0, v: 2, cmp: 'JEANS: CRITICAL' },
  { day: 3, t: 10.2, v: 4, cmp: 'WIDER THAN A DOORWAY' },
  { day: 4, t: 17.6, v: 8, cmp: 'SEATS: 3 BENCHES' },
  { day: 5, t: 23.8, v: 16, cmp: 'VISIBLE FROM 3 STREETS AWAY' },
  { day: 6, t: 30.8, v: 32, cmp: 'BLOCKING 4 LANES OF TRAFFIC' },
  { day: 7, t: 36.4, v: 64, cmp: 'HAS ITS OWN GRAVITY' },
  { day: 8, t: 40.8, v: 128, cmp: 'PLANETS IN ORBIT: 7' },
  { day: 9, t: 45.8, v: 256, cmp: 'VISIBLE FROM ANOTHER GALAXY' },
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
    const lobes = [ball(0.2, DENIM, -0.17, 0, -0.16), ball(0.2, DENIM, 0.17, 0, -0.16)]; lobes.forEach(l => { l.scale.set(1, 0.95, 0.9); g.add(l); });
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
  lightRig(sc, { sky: 0xfff3e6, ground: 0x9a7a62, hemi: 0.45, keyC: 0xffe6c2, key: 2.0, keyPos: [-7, 8, 6], target: [1, 0, 2], rim: 0.4, rimC: 0xa8d8ff, rimPos: [6, 3, 7], env: 0.38 });
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
  lightRig(sc, { sky: 0xdff4ff, ground: 0x6fb04a, hemi: 0.85, keyC: 0xfff2dc, key: 2.9, keyPos: [9, 14, 8], target: [2, 0, 0], rim: 0.6, rimC: 0xbfe8ff, rimPos: [-6, 4, -6], env: 0.6, R: 12 });
  const grass = mat(0x7bdc58, { roughness: 0.35 });
  sc.add(rbox(120, 0.2, 120, grass, 0, -0.1, -20));
  [[-26, -38, 16, 0x6fd14d], [8, -50, 22, 0x8fe36a], [36, -40, 18, 0x5cc542], [-6, -70, 30, 0x9be877]].forEach(([x, z, r, c]) => { const h = ball(r, mat(c, { roughness: 0.3 }), x, -r * 0.62, z, undefined, 48); h.castShadow = false; sc.add(h); });
  sc.add(rbox(60, 0.03, 2.2, mat(0xf3ead6, { roughness: 0.6 }), 0, 0.01, 1.0));
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
  lightRig(sc, { sky: 0xe6f6ff, ground: 0x8a8578, hemi: 0.8, keyC: 0xfff0d8, key: 2.8, keyPos: [10, 16, 10], target: [0, 0, 0], rim: 0.6, rimC: 0xbfe8ff, rimPos: [-8, 5, -8], env: 0.7, R: 14 });
  sc.add(rbox(120, 0.2, 9, mat(0x59606e, { roughness: 0.35 }), 0, -0.1, 3.5)); sc.add(rbox(120, 0.22, 7, mat(0xebe5d6, { roughness: 0.55 }), 0, -0.09, -4.5));
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
  lightRig(sc, { sky: 0xe6f6ff, ground: 0x8a8578, hemi: 0.85, keyC: 0xfff0d8, key: 2.6, keyPos: [12, 22, 8], target: [0, 0, 0], env: 0.7, R: 30 });
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
  const bgT = canvasTex(512, 1024, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h * 0.4, 20, w / 2, h * 0.45, h * 0.7); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.35, '#b9f3ff'); gr.addColorStop(1, '#1fa3d9'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 6; i++) { g.strokeStyle = `rgba(255,255,255,${0.25 + i * 0.05})`; g.lineWidth = 6; g.beginPath(); g.moveTo(-50, h * (0.6 + i * 0.05)); g.bezierCurveTo(w * 0.3, h * (0.5 + i * 0.06), w * 0.7, h * (0.75 + i * 0.03), w + 50, h * (0.55 + i * 0.05)); g.stroke(); } });
  sc.background = bgT;
  lightRig(sc, { sky: 0xffffff, ground: 0x9fe6ff, hemi: 1.0, keyC: 0xffffff, key: 2.6, keyPos: [4, 8, 6], env: 0.9, R: 6, rim: 1.4, rimC: 0x7fe0ff, rimPos: [-5, 3, -4] });
  const floor = rbox(30, 0.2, 30, mat(0xf2fbff, { roughness: 0.08, metalness: 0.25 }), 0, -0.1, 0); sc.add(floor);
  const hero = makeRig({ yams: true }); sc.add(hero.root);
  const bub = bubbles(sc, 26, [-4, 4, 0.2, 4.5, -3, 2], 0.1, 0.45, 13);
  S.aero = { sc, hero, floor, bub, black: new THREE.MeshBasicMaterial({ color: 0x062a3a }) };
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
  const key = new THREE.DirectionalLight(0xfff2dd, 2.6); key.position.set(10, 6, 8); sc.add(key);
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
  const moon = planet(1.6, 2, (x, y, z, R) => R() < 0.2 ? 0x9a9aa2 : (R() < 0.5 ? 0xc9c9cf : 0xb7b7bf), 9); sc.add(moon); faceOn(moon, 1.6);
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
  const astro = makeRig({ hood: 0xf2f2f2, hoodD: 0xdddddd, pants: 0xeeeeee, skin: 0xe2a77f, hair: 0x3a2a1a, noHood: true, helmet: true, pack: true, shoe: 0xdddddd }); sc.add(astro.root);
  const bub = bubbles(sc, 30, [-14, 14, -6, 12, -14, 4], 0.3, 1.1, 17);
  const hearts = [...Array(16)].map((_, i) => { const h = ball(0.25, mat(0xff7aa0, { emissive: 0xff4f7b, emissiveIntensity: 0.5, roughness: 0.2 }), 0, 0, 0, undefined, 16); h.visible = false; sc.add(h); return h; });
  S.space = { sc, earth, moon, planets, sunMesh, sunFace, nebs, hero, astro, bub, hearts };
}

// ---------------------------------------------------------------- SHOTS
const cam = new THREE.PerspectiveCamera(40, W / H, 0.05, 1000);
const shots = []; const shot = (t0, t1, scene, camA, setup, fx = {}) => shots.push({ t0, t1, scene, cam: camA, setup, ...fx });
const shake = (O, t0, amt, dur = 0.45) => { const k = clamp(1 - (O - t0) / dur); return O < t0 || k <= 0 ? 0 : amt * k * k; };
function popYams(P, O, t0, from, to, dur = 0.75) { P.setYams(lerp(from, to, elastic(seg(O, t0, t0 + dur)))); }
function resetRig(P) { P.root.position.set(0, 0, 0); P.root.rotation.set(0, 0, 0); P.root.scale.setScalar(1); P.root.visible = true; if (P.flaps) { P.flaps.forEach(f => f.visible = false); P.boxers.visible = false; } P.glasses.visible = false; }
function aim(from, to) { return Math.atan2(to[0] - from[0], to[1] - from[1]); }

// ===== ROOM =====
function roomBase(O) { const R = S.room; resetRig(R.hero); R.stranger.root.visible = false; R.deb.forEach(d => d.m.visible = false);
  [R.frameL, R.frameR, R.frameT].forEach(f => f.rotation.set(0, 0, 0)); R.frameL.position.set(DX - DWID / 2 + 0.06, 1.3, 0); R.frameR.position.set(DX + DWID / 2 - 0.06, 1.3, 0); R.frameT.position.set(DX, 2.6, 0); R.bub.update(O, 1); }
shot(0, 1.6, 'room', { p0: [0.9, 1.75, 7.6], p1: [0.9, 1.65, 6.6], l0: [0.7, 1.3, 2.4], fov: 40 }, (lt, O) => {
  const R = S.room; roomBase(O); const h = R.hero; h.root.position.set(0.9, 0, 2.6); h.setYams(1);
  const st = Math.sin(seg(lt, 0, 0.9) * Math.PI); pose(h, { ...idle(O), spineX: -0.15 * st, headX: -0.3 * st, arms: [[-2.6 * st, 0, 0.13 - 0.7 * st, 0.1 * st], [-2.6 * st, 0, -0.13 + 0.7 * st, 0.1 * st]] }); h.face(st > 0.3 ? 'yawn' : 'calm', O);
}, { grade: 'room', flare: [0.12, 0.3] });
shot(1.6, 3.0, 'room', { p0: [4.9, 2.1, 0.7], p1: [4.7, 2.05, 0.75], l0: [0.9, 1.3, 2.4], fov: 52 }, (lt, O) => {
  const R = S.room; roomBase(O); const h = R.hero; const k = eIO(clamp(lt / 0.75)); h.root.position.set(lerp(0.9, 0.95, k), 0, lerp(2.9, 1.95, k)); h.root.rotation.y = Math.PI; h.setYams(1);
  pose(h, lt < 0.75 ? walk(O, 7.5, 0.8) : idle(O)); h.face('calm', O);
}, { grade: 'room' });
shot(3.0, 5.0, 'room', { p0: [0.95, 2.05, 0.4], p1: [0.95, 2.03, 0.5], l0: [0.95, 1.85, 1.95], fov: 56, shift: 0.1 }, (lt, O, T) => {   // DAY 1 — mirror POV
  const R = S.room; roomBase(O); const h = R.hero; h.root.position.set(0.95, 0, 1.95); h.root.rotation.y = Math.PI; h.setYams(1);
  const up = eOut(seg(lt, 0.15, 0.4)); pose(h, { ...idle(O), arms: [[-0.2, 0, 0.13, 0.15], [-1.5 * up, 0, -0.35 * up, 1.6 * up]], headZ: 0.08 * up }); h.face('smile', O, talking('hero', O));
}, { grade: 'room', dof: 0.35 });
shot(5.0, 6.6, 'room', { p0: [1.3, 1.9, 4.9], p1: [1.2, 1.9, 4.5], l0: [0.95, 1.75, 1.95], fov: 36 }, (lt, O) => {
  const R = S.room; roomBase(O); const h = R.hero; h.root.position.set(0.95, 0, 1.95); h.root.rotation.y = lerp(Math.PI * 0.5, 0, eOut(seg(lt, 0, 0.3))); h.setYams(1);
  pose(h, { ...idle(O), arms: [[0, 0, 0.13, 0.15], [0, 0, -0.5, 0.2]] }); h.face(lt > 0.5 ? 'smirk' : 'calm', O);
}, { grade: 'room', dof: 0.45 });
shot(6.6, 8.6, 'room', { p0: [-2.4, 1.6, 6.4], p1: [-2.0, 1.55, 5.7], l0: [0.95, 1.05, 1.5], fov: 40 }, (lt, O) => {   // DAY 2 — the doubling
  const R = S.room; roomBase(O); const h = R.hero; h.root.position.set(0.95, 0, 1.5); h.root.rotation.y = 1.15;
  popYams(h, O, 7.0, 1, 1.7);
  const ant = seg(O, 6.75, 7.0), pop = seg(O, 7.0, 7.35), settle = seg(O, 7.35, 8.4);
  pose(h, { bob: -0.07 * ant + 0.12 * Math.sin(pop * Math.PI), spineX: 0.14 * ant - 0.28 * Math.sin(pop * Math.PI) + 0.05 * settle,
    arms: [[-0.25 * ant - 2.4 * pop * (1 - settle * 0.6), 0, 0.2 + 1.2 * pop, 0.3 + 0.8 * pop], [-0.25 * ant - 2.2 * pop * (1 - settle * 0.6), 0, -0.2 - 1.2 * pop, 0.3 + 0.8 * pop]],
    legs: [[0.18 * ant, 0.34 * ant], [0.18 * ant, 0.34 * ant]], headX: -0.25 * pop, headY: -0.7 * settle });
  h.face(O < 7.0 ? 'calm' : 'shock', O);
  if (O > 7.06) { h.flaps.forEach((f, i) => { f.visible = true; f.rotation.set(-0.9 * eOut(seg(O, 7.06, 7.3)), (i ? 0.6 : -0.6) * eOut(seg(O, 7.06, 7.3)), 0); }); h.boxers.visible = true; }
  burst(R.deb.slice(0, 14), O, 7.06, V([0.55, 0.95, 1.0]), 1.6);
}, { grade: 'room', shakeAt: [[7.02, 0.06]] });
shot(8.6, 10.2, 'room', { p0: [1.7, 1.85, 4.8], p1: [1.6, 1.85, 4.4], l0: [0.98, 1.6, 1.5], fov: 38 }, (lt, O) => {
  const R = S.room; roomBase(O); const h = R.hero; h.root.position.set(0.95, 0, 1.5); h.root.rotation.y = 0.35; h.setYams(1.7); h.flaps.forEach(f => { f.visible = true; f.rotation.set(-0.9, 0, 0); }); h.boxers.visible = true;
  const look = Math.sin(seg(lt, 0, 0.45) * Math.PI); pose(h, { ...idle(O), headY: 0.9 * look * 0 - 0.9 * look, headX: 0.25 * look, arms: [[-0.6, 0, 0.6, 1.2], [-0.6, 0, -0.6, 1.2]] }); h.face('shock', O, talking('hero', O));
}, { grade: 'room', dof: 0.45 });
shot(10.2, 11.8, 'room', { p0: [DX + 2.9, 1.8, 6.0], p1: [DX + 2.2, 1.65, 4.6], l0: [DX - 0.3, 1.05, 0.6], fov: 44 }, (lt, O) => {   // DAY 3 — walk to the doorway
  const R = S.room; roomBase(O); const h = R.hero; popYams(h, O, 10.25, 1.7, 2.35); h.flaps.forEach(f => { f.visible = true; f.rotation.set(-0.9, 0, 0); }); h.boxers.visible = true;
  const a = [1.1, 2.3], b = [DX, -0.02]; const k = eIO(clamp(lt / 0.98)); h.root.position.set(lerp(a[0], b[0], k), 0, lerp(a[1], b[1], k)); h.root.rotation.y = aim(a, b) ;
  pose(h, walk(O, 8, 1)); h.face(lt < 0.25 ? 'shock' : 'calm', O);
}, { grade: 'room2' });
function stuck(O, t0) { const st = O - t0, jam = eOut(seg(st, 0, 0.15)), wig = Math.sin(st * 22) * (0.5 + 0.5 * seg(st, 0.3, 1.2));
  return { st, wig, pose: { spineX: 0.4 * jam, hipZ: wig * 0.06, hipY: wig * 0.08, bob: -0.03, arms: [[-1.3, 0, 0.9 + wig * 0.2, 0.6], [-1.3, 0, -0.9 - wig * 0.2, 0.6]], legs: [[0.35 + wig * 0.15, 0.4], [0.35 - wig * 0.15, 0.4]] } }; }
function heroStuck(O) { const R = S.room, h = R.hero; h.root.position.set(DX, 0, -0.02); h.root.rotation.y = Math.PI; h.setYams(2.35); h.flaps.forEach(f => { f.visible = true; f.rotation.set(-0.9, 0, 0); }); h.boxers.visible = true;
  const s = stuck(O, 11.8); pose(h, s.pose); R.frameL.rotation.z = 0.05 * Math.sin(s.st * 22) * seg(s.st, 0.2, 1.0); R.frameR.rotation.z = -0.05 * Math.sin(s.st * 22 + 1) * seg(s.st, 0.2, 1.0); return s; }
function strangerAt(O, from, to, t0, t1) { const R = S.room, p = R.stranger; resetRig(p); p.root.visible = true; const k = eIO(seg(O, t0, t1)); p.root.position.set(lerp(from[0], to[0], k), 0, lerp(from[1], to[1], k)); p.root.rotation.y = aim(from, to); return k; }
shot(11.8, 13.4, 'room', { p0: [DX + 2.6, 1.75, 5.2], p1: [DX + 2.2, 1.6, 4.4], l0: [DX - 0.6, 1.1, 1.0], fov: 46 }, (lt, O) => {   // stuck + stranger enters
  const R = S.room; roomBase(O); heroStuck(O); R.hero.face('grit', O);
  const k = strangerAt(O, [-1.2, 3.6], [1.25, 1.75], 11.85, 12.9); const s = R.stranger;
  pose(s, k < 1 ? walk(O, 7.5, 0.9) : { ...idle(O), spineX: -0.15, arms: [[-1.2, 0, -0.1, 0.4], [0, 0, -0.5, 1.6]] }); if (k >= 1) s.root.rotation.y = aim([1.25, 1.75], [DX, 0.5]); s.face('laugh', O, talking('stranger', O));
}, { grade: 'room2', shakeAt: [[11.8, 0.035]] });
shot(13.4, 14.6, 'room', { p0: [3.65, 1.85, 0.75], p1: [3.5, 1.85, 0.85], l0: [1.25, 1.7, 1.75], fov: 42 }, (lt, O) => {   // stranger close-up laughing
  const R = S.room; roomBase(O); heroStuck(O); const s = R.stranger; strangerAt(O, [1.25, 1.75], [1.25, 1.75], 0, 1); s.root.rotation.y = aim([1.25, 1.75], [DX, 0.3]) - 0.35;
  pose(s, { ...idle(O), spineX: -0.2 + 0.08 * Math.sin(O * 14), arms: [[-1.4, 0, -0.2, 0.3], [0, 0, -0.4, 1.8]], headX: -0.1 }); s.face('laugh', O, talking('stranger', O));
}, { grade: 'room2', dof: 0.5 });
shot(14.6, 16.4, 'room', { p0: [5.0, 2.3, 5.2], p1: [4.85, 2.2, 4.8], l0: [DX - 0.3, 1.05, 0.9], fov: 46 }, (lt, O) => {   // stranger pushes
  const R = S.room; roomBase(O); const s0 = heroStuck(O); R.hero.face('grit', O, talking('hero', O));
  const s = R.stranger; strangerAt(O, [DX - 0.05, 2.1], [DX - 0.05, 1.75], 14.6, 14.8); s.root.rotation.y = Math.PI;
  const push = Math.sin(O * 9) * 0.06; pose(s, { spineX: 0.45 + push, arms: [[-1.5, 0, 0.15, 0.15 + push], [-1.5, 0, -0.15, 0.15 + push]], legs: [[0.6, 0.5], [-0.25, 0.1]], bob: -0.06 }); s.face('grit', O);
}, { grade: 'room2' });
shot(16.4, 17.6, 'room', { p0: [DX + 0.5, 1.6, 3.8], p1: [DX + 0.45, 1.5, 3.4], l0: [DX, 1.05, -0.8], fov: 46 }, (lt, O) => {   // pop through, crash
  const R = S.room; roomBase(O); const h = R.hero; const pop = eOut(seg(O, 16.4, 16.75)); h.setYams(2.35); h.flaps.forEach(f => { f.visible = true; f.rotation.set(-0.9, 0, 0); }); h.boxers.visible = true;
  h.root.rotation.y = Math.PI; h.root.position.set(DX, 0, lerp(-0.02, -0.9, pop));
  R.frameL.position.x = DX - DWID / 2 + 0.06 - 0.5 * pop; R.frameL.rotation.z = 0.7 * pop; R.frameR.position.x = DX + DWID / 2 - 0.06 + 0.5 * pop; R.frameR.rotation.z = -0.7 * pop; R.frameT.position.y = 2.6 + 0.3 * pop; R.frameT.rotation.x = 0.4 * pop;
  burst(R.deb.slice(14), O, 16.4, V([DX, 1.0, -0.2]), 2.2);
  const fall = seg(O, 16.65, 17.05); h.root.rotation.x = -0.75 * eOut(fall); h.root.position.y = 0.15 * Math.sin(fall * Math.PI) - 0.25 * eOut(fall);
  pose(h, { arms: [[-2.6 + 1.3 * fall, 0, 0.6 - 0.3 * fall, 0.2], [-2.6 + 1.3 * fall, 0, -0.6 + 0.3 * fall, 0.2]], legs: [[0.9 * fall, 1.4 * fall], [0.9 * fall, 1.4 * fall]] }); h.face('shock', O);
  const s = R.stranger; strangerAt(O, [DX - 0.05, 1.75], [DX - 0.05, 0.6], 16.4, 16.8); s.root.rotation.y = Math.PI; const sf = seg(O, 16.6, 17.0); s.root.rotation.x = -0.9 * eOut(sf); s.root.position.y = -0.2 * eOut(sf);
  pose(s, { arms: [[-2.4, 0, 0.5, 0.2], [-2.4, 0, -0.5, 0.2]], legs: [[0.5 * sf, 0.9 * sf], [0.2, 0.3]] }); s.face('shock', O);
}, { grade: 'room2', shakeAt: [[16.4, 0.07], [16.95, 0.05]] });

// ===== PARK =====
function parkBase(O) { const P = S.park; resetRig(P.hero); P.bub.update(O, 1); P.pigeons.forEach(p => p.visible = false); P.bigP.visible = false; P.deb.forEach(d => d.m.visible = false);
  P.planks.forEach((p, i) => { p.position.set(0, 0.55, -0.2 + i * 0.2); p.rotation.set(0, 0, 0); }); P.back.forEach((b, i) => { b.position.set(0, 0.95 + i * 0.23, -0.36); b.rotation.set(0, 0, 0); }); P.legsB.forEach(l => l.rotation.set(0, 0, 0)); }
shot(17.6, 19.4, 'park', { p0: [0.2, 2.0, 6.2], p1: [0.4, 4.4, 13.5], l0: [0.2, 1.3, 0.6], fov: 42, ease: 'io' }, (lt, O) => {   // DAY 4 — tier pull-back
  const P = S.park; parkBase(O); const h = P.hero; popYams(h, O, 17.65, 2.35, 3.2); const k = clamp(lt / 1.0); h.root.position.set(lerp(-1.6, 1.4, eIO(k)), 0, 1.0); h.root.rotation.y = Math.PI / 2;
  pose(h, k < 1 ? walk(O, 7, 0.9) : idle(O)); h.face('calm', O);
}, { grade: 'park', flash: 17.6, flare: [0.82, 0.12] });
const benchHit = 19.9;
shot(19.4, 21.0, 'park', { p0: [3.4, 1.55, 6.2], p1: [3.2, 1.5, 5.6], l0: [2.2, 1.1, 0.3], fov: 42 }, (lt, O) => {   // bench snaps, pigeons move in
  const P = S.park; parkBase(O); const h = P.hero; h.setYams(3.2); h.root.position.set(2.2, 0, 0.55); h.root.rotation.y = 0;
  const sit = eOut(seg(O, 19.45, 19.85)), drop = eOut(seg(O, benchHit, benchHit + 0.18));
  pose(h, { bob: -0.38 * sit - 0.32 * drop, legs: [[1.45 * sit, -1.5 * sit], [1.45 * sit, -1.5 * sit]], spineX: -0.05, arms: [[-0.3 - 1.4 * drop, 0, 0.5 + 0.8 * drop, 0.3], [-0.3 - 1.4 * drop, 0, -0.5 - 0.8 * drop, 0.3]], headX: -0.2 * drop });
  h.face(O < benchHit ? 'calm' : 'shock', O);
  if (O > benchHit) { const k = eOut(seg(O, benchHit, benchHit + 0.4)); P.planks.forEach((p, i) => { p.position.set((i - 1) * 0.9 * k, 0.55 - 0.45 * k, -0.2 + i * 0.2 + (i - 1) * 0.3 * k); p.rotation.set(0.4 * k, 0, (i - 1) * 0.8 * k); });
    P.back.forEach((b, i) => { b.rotation.x = -0.9 * k; b.position.y = (0.95 + i * 0.23) - 0.5 * k; }); P.legsB.forEach((l, i) => l.rotation.z = (i % 2 ? 1 : -1) * 0.7 * k); burst(P.deb, O, benchHit, V([2.2, 0.5, 0.2]), 1.8); }
  // pigeons fly in and land on top
  const top = new THREE.Vector3(); h.root.updateMatrixWorld(true); h.glute.getWorldPosition(top); const rad = 0.2 * 3.2;
  P.pigeons.forEach((p, i) => { const t0 = 20.15 + i * 0.07; if (O < t0) return; p.visible = true; const k = eOut(seg(O, t0, t0 + 0.5)); const tx = top.x - 0.5 + (i % 5) * 0.25, tz = top.z - 0.35 + Math.floor(i / 5) * 0.3, ty = top.y + rad * 0.85;
    p.position.set(lerp(tx + 5, tx, k), lerp(ty + 2.5, ty, k), lerp(tz - 2, tz, k)); p.rotation.y = -Math.PI / 2 * (1 - k) + 0.2; p.userData.wings.forEach((w, j) => w.rotation.z = (j ? 1 : -1) * (1 - k) * (0.6 + 0.6 * Math.sin(O * 40))); });
}, { grade: 'park', shakeAt: [[benchHit, 0.05]] });
shot(21.0, 23.8, 'park', { p0: [3.4, 2.5, 3.4], p1: [3.25, 2.45, 3.0], l0: [2.15, 1.8, 0.05], fov: 38 }, (lt, O) => {   // big pigeon close-up on top
  const P = S.park; parkBase(O); const h = P.hero; h.setYams(3.2); h.root.position.set(2.2, 0, 0.55);
  pose(h, { bob: -0.7, legs: [[1.45, -1.5], [1.45, -1.5]], headX: -0.55, arms: [[-0.4, 0, 0.6, 0.3], [-0.4, 0, -0.6, 0.3]] }); h.face('worried', O);
  P.planks.forEach((p, i) => { p.position.set((i - 1) * 0.9, 0.1, -0.2 + i * 0.2 + (i - 1) * 0.3); p.rotation.set(0.4, 0, (i - 1) * 0.8); }); P.back.forEach((b, i) => { b.rotation.x = -0.9; b.position.y = 0.45 + i * 0.23; });
  const top = new THREE.Vector3(); h.root.updateMatrixWorld(true); h.glute.getWorldPosition(top); const rad = 0.2 * 3.2;
  const bp = P.bigP; bp.visible = true; bp.position.set(top.x - 0.05, top.y + rad * 0.82, top.z + 0.05); bp.rotation.y = 0.5; const talk = talking('pigeon', O); bp.userData.head.rotation.x = talk ? -0.2 + 0.12 * Math.sin(O * 20) : -0.1 + 0.08 * Math.sin(O * 3);
  P.pigeons.forEach((p, i) => { if (i > 5) return; p.visible = true; p.position.set(top.x - 0.6 + i * 0.25, top.y + rad * 0.8, top.z - 0.4); p.rotation.y = 0.3 * i; p.userData.head.position.z = 0.17 + Math.max(0, Math.sin(O * 7 + i)) * 0.06; });
}, { grade: 'park', dof: 0.55 });

// ===== MARKET =====
const turnT = 24.15;
function marketBase(O) { const M = S.market; resetRig(M.hero); M.bub.update(O, 1); M.deb.forEach(d => d.m.visible = false);
  M.stalls.forEach((s, i) => { s.position.y = 0; s.rotation.set(0, 0, 0); }); M.scooter.rotation.set(0, 0, 0); M.scooter.position.set(4.2, 0, 1.6); M.bus.rotation.set(0, 0, 0); M.bus.position.set(-9, 0, 4.6); }
function marketChaos(O, M) {     // the turn: yams sweep the street, everything gets knocked over in a chain
  M.stalls.forEach((s, i) => { const hitT = turnT + 0.1 + Math.abs(s.position.x) * 0.06; const k = eOut(seg(O, hitT, hitT + 0.5)); const dir = Math.sign(s.position.x);
    s.rotation.z = -dir * 1.35 * k; s.rotation.x = 0.25 * k; s.position.y = 0.25 * Math.sin(k * Math.PI); });
  const ks = eOut(seg(O, turnT + 0.2, turnT + 0.8)); M.scooter.rotation.z = 2.6 * ks; M.scooter.position.set(4.2 + 2 * ks, 1.2 * Math.sin(ks * Math.PI), 1.6 + ks);
  const kb = eOut(seg(O, turnT + 0.45, turnT + 1.1)); M.bus.rotation.x = 0.45 * kb; M.bus.position.z = 4.6 + 0.6 * kb;
  burst(M.deb, O, turnT + 0.15, V([0, 1.2, -2.6]), 3.6, 3.2);
  M.crowd.forEach((p, i) => { resetRig(p); const a = (i / M.crowd.length) * Math.PI * 2; const r0 = 6 + (i % 3) * 1.6; const run = seg(O, turnT + 0.3 + i * 0.03, turnT + 2.6);
    p.root.position.set(Math.cos(a) * (r0 + 6 * run), 0, -1.6 - Math.abs(Math.sin(a)) * (r0 * 0.45 + 4 * run)); p.root.rotation.y = Math.atan2(Math.cos(a), Math.sin(a)) * (run > 0 ? 1 : 0) + (run > 0 ? 0 : Math.atan2(-Math.cos(a), -Math.sin(a)));
    pose(p, run > 0 ? walk(O + i, 11, 1.2, { arms: [[-2.6, 0, 0.4, 0.3], [-2.6, 0, -0.4, 0.3]] }) : idle(O, i)); p.face(run > 0 ? 'shock' : 'calm', O); });
}
shot(23.8, 25.6, 'market', { p0: [0, 2.7, 10.5], p1: [0, 3.0, 12.0], l0: [0, 1.6, -0.6], fov: 44 }, (lt, O) => {   // DAY 5 — the turn
  const M = S.market; marketBase(O); const h = M.hero; popYams(h, O, 23.85, 3.2, 5.0); h.root.position.set(0, 0, 0.6);
  h.root.rotation.y = lerp(0, 1.65, eIO(seg(O, turnT, turnT + 0.45))); pose(h, { ...idle(O), arms: [[0, 0, 0.13, 0.2], [0, 0, -0.13, 0.2]] }); h.face(O < turnT + 0.5 ? 'calm' : 'shock', O);
  marketChaos(O, M);
}, { grade: 'market', shakeAt: [[turnT + 0.25, 0.05], [turnT + 0.6, 0.04]], flare: [0.85, 0.1] });
shot(25.6, 27.2, 'market', { p0: [0, 10.5, 7.5], p1: [0, 14, 9.5], l0: [0, 0, -1.6], fov: 46, ease: 'out' }, (lt, O) => {   // bird's-eye
  const M = S.market; marketBase(O); const h = M.hero; h.setYams(5.0); h.root.position.set(0, 0, 0.6); h.root.rotation.y = 1.65; pose(h, idle(O)); h.face('worried', O); marketChaos(O, M);
}, { grade: 'market' });

// ===== MONTAGE (glossy aero) =====
const mCuts = [
  { pose: { arms: [[0, 0, 0.55, 0.5], [0, 0, -0.55, 0.5]] }, expr: 'smirk', cam: { p0: [0.4, 1.7, 6.6], l0: [0, 1.35, 0], fov: 38 }, sil: true, rot: 0.35 },
  { pose: { arms: [[-1.5, 0, -0.1, 0], [0, 0, -0.5, 0.3]] }, expr: 'smile', cam: { p0: [0.25, 2.0, 3.8], l0: [0, 1.95, 0], fov: 36 }, sil: false, rot: 0.1, glasses: true },
  { pose: { arms: [[-1.4, 0, 0.6, 1.6], [-1.4, 0, -0.6, 1.6]], headZ: 0.12 }, expr: 'smirk', cam: { p0: [-1.0, 0.6, 5.2], l0: [0, 1.5, 0], fov: 42 }, sil: true, rot: -0.3 },
  { pose: { arms: [[0, 0, 0.5, 0.4], [-0.3, 0, -1.9, 0.2]] }, expr: 'smile', cam: { p0: [0, 1.6, 7.4], l0: [0, 1.25, 0], fov: 36 }, sil: false, mag: true, rot: 0.2, glasses: true },
  { pose: { arms: [[-1.5, 0, 0, 0], [0, 0, -0.5, 0.3]] }, expr: 'smirk', cam: { p0: [1.0, 1.5, 5.4], l0: [0, 1.4, 0], fov: 40 }, sil: true, rot: -0.15 },
];
mCuts.forEach((m, i) => { const t0 = MONTAGE[0] + i * 0.72, t1 = i === mCuts.length - 1 ? MONTAGE[1] : t0 + 0.72;
  shot(t0, t1, 'aero', { ...m.cam, z0: 1, z1: 1.12, roll0: i % 2 ? 2 : -2, roll1: i % 2 ? -2 : 2, ease: 'lin' }, (lt, O) => { const A = S.aero; resetRig(A.hero); A.hero.setYams(5.0 * 0.35 + 0.65); A.hero.root.rotation.y = m.rot + (lt - 0.5) * 0.4;
    pose(A.hero, { ...idle(O), ...m.pose }); A.hero.face(m.expr, O); A.hero.glasses.visible = !!m.glasses; A.sc.overrideMaterial = m.sil ? A.black : null; A.floor.visible = !m.sil; A.bub.update(O, 1); },
  { grade: 'aero', flash: i % 2 === 0 ? t0 : undefined, hideStat: true, mag: m.mag, live: 1.5, bloom: 0.35 }); });

// ===== NEWS + TRAFFIC =====
shot(30.8, 33.6, 'news', { p0: [0, 2.3, 7.6], p1: [0, 2.25, 7.0], l0: [0, 2.2, -0.4], fov: 40 }, (lt, O) => {   // DAY 6
  const N = S.news; resetRig(N.anchor); N.anchor.root.position.set(0, 0.1, -0.6); const t = talking('anchor', O);
  pose(N.anchor, { ...idle(O), arms: [[-0.9, 0, 0.3, 1.1], [-0.9 + (t ? 0.15 * Math.sin(O * 6) : 0), 0, -0.3, 1.1]] }); N.anchor.face(O < 32.4 ? 'shock' : 'calm', O, t);
}, { grade: 'news', news: true, flash: 30.8 });
shot(33.6, 36.4, 'traffic', { p0: [0, 18, 16], p1: [0, 14.2, 11.6], l0: [0, 1, -1], fov: 46, ease: 'lin', z1: 1.12 }, (lt, O) => {
  const T = S.traffic; resetRig(T.hero); T.hero.setYams(12); T.hero.root.position.set(0, 0, 0); T.hero.root.rotation.y = 0.1; pose(T.hero, { ...idle(O), arms: [[0, 0, 0.6, 0.3], [0, 0, -0.6, 0.3]] }); T.hero.face('worried', O);
  T.cars.forEach((c, i) => { c.position.y = 0.02 * Math.sin(O * 20 + i); });
}, { grade: 'market' });

// ===== SPACE =====
function spaceBase(O, o = {}) { const P = S.space; const cos = o.cosmic ?? 0;
  P.sc.background.setRGB(lerp(0.02, 0.1, cos), lerp(0.027, 0.06, cos), lerp(0.05, 0.36, cos)); P.nebs.forEach(n => n.material.opacity = 0.38 * cos);
  resetRig(P.hero); P.hero.root.visible = o.hero !== false; P.hero.root.position.set(0, Math.sin(O * 1.3) * 0.08, 0); P.hero.root.rotation.set(0.05, o.heroRot ?? 0.25, Math.sin(O) * 0.04);
  P.earth.visible = o.earth ?? true; P.earth.rotation.y = O * 0.04; P.moon.visible = !!o.moon; P.astro.root.visible = !!o.astro; P.planets.forEach(p => p.visible = !!o.planets);
  P.sunMesh.visible = !!o.sun; P.sunMesh.scale.setScalar(1); P.sunFace.userData.smile.forEach(m => m.visible = true); P.sunFace.userData.o.visible = false; P.hearts.forEach(h => h.visible = false); P.bub.update(O, o.bubbles ?? 1); }
function floatPose(O, extra = {}) { return { bob: 0, legs: [[0.25 + 0.1 * Math.sin(O * 1.7), 0.35], [-0.1 + 0.1 * Math.sin(O * 1.5), 0.2]], arms: [[0, 0, 0.9 + 0.1 * Math.sin(O * 2), 0.3], [0, 0, -0.9 - 0.1 * Math.sin(O * 2.1), 0.3]], headY: Math.sin(O * 0.8) * 0.1, ...extra }; }
const moonOrbit = (O, R = 5.2) => { const a = O * 1.4; return V([Math.cos(a) * R, 1.2 + Math.sin(a * 0.7) * 0.8, -1.2 + Math.sin(a) * R]); };
shot(36.4, 38.6, 'space', { p0: [8, 3.0, 12], p1: [2.6, 2.2, 12.4], l0: [0, 0.8, -1.2], fov: 44, ease: 'lin', z1: 1.14 }, (lt, O) => {   // DAY 7 — the Moon orbits the yams
  const P = S.space; spaceBase(O, { moon: true }); popYams(P.hero, O, 36.45, 5, 13, 0.9); pose(P.hero, floatPose(O)); P.hero.face('shock', O);
  P.moon.position.copy(moonOrbit(O)); P.moon.lookAt(cam.position);
}, { grade: 'space', flash: 36.4, bloom: 0.3 });
shot(38.6, 40.8, 'space', { p0: [-2.45, 2.25, 3.9], p1: [-2.7, 2.2, 3.5], l0: [-2.8, 2.05, -0.4], fov: 34 }, (lt, O) => {   // astronaut
  const P = S.space; spaceBase(O, { moon: true, astro: true }); P.hero.setYams(13); P.hero.root.position.set(3, 0, -8); pose(P.hero, floatPose(O));
  P.moon.position.copy(moonOrbit(O).add(V([3, 0, -8]))); const A = P.astro; resetRig(A); A.root.position.set(-2.8, 0.1 * Math.sin(O * 1.9), -0.4); A.root.rotation.set(0, 0.2, Math.sin(O * 1.3) * 0.07);
  pose(A, { arms: [[-0.4 + Math.sin(O * 9) * 0.3, 0, -2.2 + Math.sin(O * 7) * 0.25, 0.4], [-0.4 + Math.sin(O * 8 + 1) * 0.3, 0, 2.2 + Math.sin(O * 6) * 0.25, 0.4]], legs: [[0.3, 0.4], [-0.1, 0.2]] }); A.face('shock', O, talking('astro', O));
}, { grade: 'space', dof: 0.55 });
const orbitPlanets = (O, R0 = 9, back = false) => S.space.planets.forEach((p, i) => { const a = O * (0.6 + i * 0.08) + i * 0.9, R = R0 + i * 1.6, zz = Math.sin(a) * R * 0.7; p.position.set(Math.cos(a) * R, Math.sin(a * 1.3) * 1.5 + 0.8, (back ? -Math.abs(zz) - 5 : zz - 2)); p.rotation.y = O * 0.5 + i; });
shot(40.8, 43.0, 'space', { p0: [0, 5, 34], p1: [0, 3.5, 27], l0: [0, 0.6, -1], fov: 46, ease: 'out' }, (lt, O) => {   // DAY 8 — planets pulled into orbit
  const P = S.space; spaceBase(O, { planets: true, earth: false, cosmic: lt }); popYams(P.hero, O, 40.85, 13, 26, 0.9); pose(P.hero, floatPose(O)); P.hero.face('shock', O);
  const pull = eOut(seg(O, 40.8, 42.4)); S.space.planets.forEach((p, i) => { const a = O * (0.6 + i * 0.08) + i * 0.9, R = lerp(30 + i * 4, 9 + i * 1.6, pull); p.position.set(Math.cos(a) * R, Math.sin(a * 1.3) * 1.5 + 0.8, Math.sin(a) * R * 0.7 - 2); });
}, { grade: 'cosmic', flash: 40.8, bloom: 0.4 });
shot(43.0, 45.0, 'space', { p0: [0.9, -0.5, 6.8], p1: [0.8, -0.4, 6.1], l0: [0, 1.75, 0], fov: 46 }, (lt, O) => {
  const P = S.space; spaceBase(O, { planets: true, earth: false, cosmic: 1, heroRot: 0 }); P.hero.setYams(26); pose(P.hero, floatPose(O, { arms: [[-0.5, 0, 1.0, 0.9], [-0.5, 0, -1.0, 0.9]], headX: -0.1 })); P.hero.face('worried', O, talking('hero', O)); orbitPlanets(O, 9, true);
}, { grade: 'cosmic', bloom: 0.45 });
shot(45.0, 45.8, 'space', { p0: [0, 3, 40], p1: [0, 2.6, 36], l0: [0, 0.5, -2], fov: 46, ease: 'lin' }, (lt, O) => {   // silence drop
  const P = S.space; spaceBase(O, { planets: true, earth: false, cosmic: 1 }); P.hero.setYams(26); pose(P.hero, floatPose(O)); P.hero.face('worried', O); orbitPlanets(O);
}, { grade: 'cosmic', bloom: 0.45 });
// ===== DAY 9: the universe becomes a desktop wallpaper, then a monitor in a dark room =====
shot(45.8, 48.6, 'space', { p0: [0, 2.6, 36], l0: [0, 0.5, -2], fov: 46, z0: 1.6, z1: 1.0, roll0: 10, roll1: 0, ease: 'out' }, (lt, O) => {
  const P = S.space; spaceBase(O, { planets: true, earth: false, cosmic: 1 }); P.hero.setYams(26); pose(P.hero, floatPose(O)); P.hero.face('shock', O); orbitPlanets(O);
}, { grade: 'cosmic', bloom: 0.45, flash: 45.8, desktop: true });
function heroInScreen(O, expr) { const P = S.space; spaceBase(O, { planets: true, earth: false, cosmic: 1, heroRot: 0, bubbles: 0.6 }); P.hero.setYams(26); P.hero.root.rotation.set(0, 0, 0);
  pose(P.hero, { ...idle(O), arms: [[-1.3, 0, 0.4, 1.4], [0, 0, -0.2, 0.2]] }); P.hero.face(expr, O, talking('hero', O)); orbitPlanets(O, 12, true); }
shot(48.6, 51.4, 'space', { p0: [0.1, 2.05, 4.6], p1: [0.05, 2.0, 4.2], l0: [0, 1.85, 0], fov: 40 }, (lt, O) => { heroInScreen(O, 'confused'); }, { grade: 'cosmic', bloom: 0.3, monitor: [0.74, 0.8] });
shot(51.4, 54.6, 'space', { p0: [0.45, 2.15, 6.0], p1: [0.45, 2.1, 5.6], l0: [0.45, 2.15, 0], fov: 40 }, (lt, O) => {
  heroInScreen(O, 'shock'); const P = S.space; P.sunMesh.visible = true; P.sunMesh.scale.setScalar(0.085); const k = eOut(seg(O, 51.4, 52.2)); P.sunMesh.position.set(lerp(4, 1.05, k), 2.95, 0.3); P.sunMesh.lookAt(0.45, 2.15, 5.6); P.sunMesh.rotateZ(0.12 * Math.sin(O * 2));
  const st = talking('sun', O); P.sunFace.userData.smile.forEach(m => m.visible = !st || Math.sin(O * 24) < -0.2); P.sunFace.userData.o.visible = st && Math.sin(O * 24) >= -0.2;
  P.hearts.forEach((h, i) => { h.visible = O > 51.8; const ph = ((O - 51.8) * 0.5 + i * 0.07) % 1; h.position.set(1.1 + Math.sin(i * 2.1) * 0.6, 1.4 + ph * 2.4, -0.3 + Math.cos(i) * 0.3); h.scale.setScalar(0.3); });
}, { grade: 'cosmic', bloom: 0.45, monitor: [0.8, 0.84] });
shot(54.6, DUR, 'space', { p0: [0.45, 2.15, 5.6], p1: [0.4, 2.1, 4.9], l0: [0.4, 2.15, 0], fov: 40 }, (lt, O) => {
  heroInScreen(O, 'shock'); const P = S.space; P.sunMesh.visible = true; P.sunMesh.scale.setScalar(0.085); P.sunMesh.position.set(1.05, 2.95, 0.3); P.sunMesh.lookAt(0.45, 2.15, 5.6); P.sunMesh.rotateZ(0.12 * Math.sin(O * 2));
  P.hearts.forEach((h, i) => { h.visible = true; const ph = ((O - 51.8) * 0.5 + i * 0.07) % 1; h.position.set(1.1 + Math.sin(i * 2.1) * 0.6, 1.4 + ph * 2.4, -0.3 + Math.cos(i) * 0.3); h.scale.setScalar(0.3); });
}, { grade: 'cosmic', bloom: 0.45, monitor: [0.86, 1.25], shakeAt: [[54.7, 0.05]] });

// ---------------------------------------------------------------- talking state (mouths move only while that voice is audible)
function talking(speaker, O) { return DIALOGUE.some(c => c.speaker === speaker && c.kind !== 'shout' && spanHit(c, O)); }

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
  const nm = { hero: null, stranger: 'STRANGER', pigeon: 'PIGEON', anchor: 'NEWS ANCHOR', astro: 'ASTRONAUT', sun: 'THE SUN ☀️' }[c.speaker];
  strokeText(g, shown, W / 2, H * 0.62, 12); if (nm) { g.font = '700 30px InterW, "Noto Color Emoji"'; g.globalAlpha = 0.85; strokeText(g, nm, W / 2, H * 0.62 - fs - 8, 6); }
  g.restore();
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
  room: { f: 'saturate(1.12) contrast(1.05) brightness(1.03)', tint: 'rgba(255,190,120,0.12)', mode: 'soft-light', vig: 0.3 },
  room2: { f: 'saturate(1.15) contrast(1.05)', tint: 'rgba(80,210,230,0.12)', mode: 'soft-light', vig: 0.32 },
  park: { f: 'saturate(1.22) contrast(1.06) brightness(1.03)', tint: 'rgba(120,220,255,0.10)', mode: 'soft-light', vig: 0.22 },
  market: { f: 'saturate(1.2) contrast(1.06)', tint: 'rgba(120,230,255,0.10)', mode: 'soft-light', vig: 0.25 },
  aero: { f: 'saturate(1.25) contrast(1.08) brightness(1.04)', tint: null, vig: 0.15 },
  news: { f: 'saturate(1.12) contrast(1.05)', tint: null, vig: 0.3 },
  space: { f: 'saturate(1.1) contrast(1.06)', tint: null, vig: 0.42 },
  cosmic: { f: 'saturate(1.25) contrast(1.06)', tint: 'rgba(58,43,217,0.22)', mode: 'screen', vig: 0.38 },
};
function setCam(sh, T, O) {
  const c = sh.cam; const lt = clamp((T - sh.t0) / (sh.t1 - sh.t0)); const e = EASE[c.ease || 'out'](lt);
  const p = V(c.p0); if (c.p1) p.lerp(V(c.p1), e); const l = V(c.l0); if (c.l1) l.lerp(V(c.l1), e);
  cam.setViewOffset(W, H, 0, -H * (c.shift ?? 0.07), W, H); cam.position.copy(p); cam.up.set(0, 1, 0); cam.lookAt(l);
  const z = lerp(c.z0 ?? 1, c.z1 ?? 1.06, e); const roll = lerp(c.roll0 ?? 0, c.roll1 ?? 0, e);
  cam.fov = 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(c.fov) / 2) / z) * 180 / Math.PI; cam.rotateZ(THREE.MathUtils.degToRad(roll));
  const live = sh.live ?? 1;   // gentle camera life on the real clock
  cam.rotateY((Math.sin(O * 0.9) * 0.018 + Math.sin(O * 2.3) * 0.003) * live); cam.rotateX((Math.sin(O * 0.7 + 1.3) * 0.012 + Math.sin(O * 3.1) * 0.0025) * live); cam.rotateZ(Math.sin(O * 0.55) * 0.01 * live);
  let sk = 0; for (const [t0, amt] of sh.shakeAt || []) sk += shake(O, t0, amt); cam.rotateZ(Math.sin(O * 61) * sk); cam.rotateX(Math.sin(O * 47) * sk * 0.6); cam.rotateY(Math.cos(O * 53) * sk * 0.6);
  cam.fov /= 1 + 0.03 * live * (0.5 + 0.5 * Math.sin(O * 1.1)); cam.updateProjectionMatrix();
  return lt;
}
export function renderFrame(O) {
  const sh = shots.find(s => O >= s.t0 && O < s.t1) || shots[shots.length - 1];
  S.aero.sc.overrideMaterial = null;
  const lt = clamp((O - sh.t0) / (sh.t1 - sh.t0));
  sh.setup(lt, O, O);
  setCam(sh, O, O);
  if (S.room.hero.strings) [S.room.hero, S.park.hero, S.market.hero, S.space.hero, S.aero.hero, S.traffic.hero].forEach(P => P.strings.forEach((s, i) => s.rotation.set(0.2 * Math.sin(O * 9 + i), 0, 0.12 * Math.sin(O * 7 + i))));
  renderer.render(S[sh.scene].sc, cam);
  const gr = GRADES[sh.grade] || GRADES.room;
  sctx.globalCompositeOperation = 'source-over'; sctx.filter = 'none';
  if (sh.dof) {
    smctx.filter = 'blur(2.5px)'; smctx.drawImage(glc, 0, 0, 270, 480); smctx.filter = 'none'; sctx.drawImage(smallC, 0, 0, W, H);
    shctx.globalCompositeOperation = 'source-over'; shctx.clearRect(0, 0, W, H); shctx.drawImage(glc, 0, 0, W, H); shctx.globalCompositeOperation = 'destination-in';
    const rg = shctx.createRadialGradient(W / 2, H * 0.47, W * 0.2 * (1 - sh.dof * 0.3), W / 2, H * 0.47, W * 0.85 * (1 - sh.dof * 0.3)); rg.addColorStop(0, 'rgba(0,0,0,1)'); rg.addColorStop(1, 'rgba(0,0,0,0)'); shctx.fillStyle = rg; shctx.fillRect(0, 0, W, H);
    sctx.drawImage(sharpC, 0, 0, W, H);
  } else sctx.drawImage(glc, 0, 0, W, H);
  const bloom = sh.bloom ?? 0.1;    // a touch of glow everywhere (Frutiger sheen)
  smctx.filter = 'blur(6px) brightness(1.25)'; smctx.drawImage(sceneC, 0, 0, 270, 480); smctx.filter = 'none';
  sctx.globalCompositeOperation = 'lighter'; sctx.globalAlpha = bloom; sctx.drawImage(smallC, 0, 0, W, H); sctx.globalAlpha = 1; sctx.globalCompositeOperation = 'source-over';
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.filter = gr.f; ctx.drawImage(sceneC, 0, 0, W, H); ctx.filter = 'none';
  if (gr.tint) { ctx.globalCompositeOperation = gr.mode; ctx.fillStyle = gr.tint; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over'; }
  const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, `rgba(0,0,0,${gr.vig})`); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  if (sh.flare) drawFlare(sh.flare[0], sh.flare[1], 0.9);
  if (sh.desktop) drawDesktop(O);
  if (sh.monitor) drawMonitor(lerp(sh.monitor[0], sh.monitor[1], eIO(lt)), O);
  if (!sh.hideStat && O >= STEPS[0].t && !sh.monitor) { const sg = ctx.createLinearGradient(0, 180, 0, 640); sg.addColorStop(0, 'rgba(0,0,0,0.26)'); sg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = sg; ctx.fillRect(0, 180, W * 0.75, 460); }
  if (sh.mag) drawMag(); if (sh.news) drawNews(O);
  drawTitle(O); drawStat(O, sh); drawCaptions(O);
  for (const s of shots) if (s.flash !== undefined) { const d = Math.round((O - s.flash) * 30); if (d >= 0 && d < 3) { ctx.fillStyle = `rgba(255,255,255,${[0.95, 0.6, 0.25][d]})`; ctx.fillRect(0, 0, W, H); } }
  { const d = Math.round((O - 47.62) * 30); if (d >= 0 && d < 2) { ctx.fillStyle = `rgba(255,255,255,${[0.5, 0.2][d]})`; ctx.fillRect(0, 0, W, H); } }
  return out.toDataURL('image/jpeg', RS > 1 ? 0.95 : 0.94);
}
export const TIMELINE = { STEPS, MONTAGE, DUR, cuts: shots.map(s => s.t0), flashes: shots.filter(s => s.flash !== undefined).map(s => s.flash) };
window.captionText = (O) => { const c = cueAt(O); if (!c) return ''; return c.kind === 'shout' ? c.words.map(w => w.w).join(' ') : captionChunk(c, O); };
window.hookText = () => '';
window.renderFrame = renderFrame; window.TIMELINE = TIMELINE;
fetch('dialogue.json').then(r => r.json()).then(d => { DIALOGUE = d; }).catch(() => { DIALOGUE = []; })
  .then(() => Promise.all(['800 78px Montserrat', '500 104px Playfair', 'italic 500 236px Playfair', '500 128px Lora', '600 30px InterW', '700 30px InterW', '40px "Noto Color Emoji"'].map(f => document.fonts.load(f)))).then(() => { window.READY = true; });
