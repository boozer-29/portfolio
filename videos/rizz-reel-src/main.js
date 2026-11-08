// Polygram Videos — "What if your rizz doubled every day?"
// One step list drives counter, cuts, camera, text and SFX (see timeline.json export).
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const W = 1080, H = 1920;
export const DUR = 53.0;
// time-warp: output time -> visual time (gives the shouts and dialogue room to breathe)
const WARP = [[0, 0], [32.4, 32.4], [36.0, 34.2], [39.3, 37.5], [42.0, 38.8], [49.5, 46.3], [52.6, 49.2], [55.6, 51.5], [57.6, 53.0]];
export const DUR_OUT = 57.6;
function warp(o) { for (let i = 1; i < WARP.length; i++) { const [o0, v0] = WARP[i - 1], [o1, v1] = WARP[i]; if (o <= o1) return v0 + (o - o0) * (v1 - v0) / (o1 - o0); } return DUR; }
let DIALOGUE = [];

// ---------------------------------------------------------------- step list
export const STEPS = [
  { day: 1, t: 3.6,  v: 1,   cmp: 'LEFT ON READ',            line: 'Day 1: Rizz 1. Left on read. It’s over.' },
  { day: 2, t: 9.0,  v: 2,   cmp: 'ONE (1) “LOL” RECEIVED',   line: 'Day 2: Rizz 2. Wait. Something changed.' },
  { day: 3, t: 13.4, v: 4,   cmp: 'STRANGERS WAVE BACK',      line: 'Day 3: Rizz 4. Strangers started waving.', tier: true },
  { day: 4, t: 17.8, v: 8,   cmp: 'FOLLOWERS: 81 PIGEONS',    line: 'Day 4: Rizz 8. The pigeons started following him.' },
  { day: 5, t: 22.4, v: 16,  cmp: 'TOP 20% OF THE CITY',      line: 'Day 5: Rizz 16. The whole city noticed.' },
  { day: 6, t: 30.2, v: 32,  cmp: 'MAKES THE EVENING NEWS',   line: 'Day 6: Rizz 32. It made the news.', tier: true },
  { day: 7, t: 34.2, v: 64,  cmp: 'STRONGER THAN MOON GRAVITY', line: 'Day 7: Rizz 64. The Moon moved closer.', tier: true },
  { day: 8, t: 38.8, v: 128, cmp: 'ENOUGH TO ALIGN PLANETS',  line: 'Day 8: Rizz 128. The planets aligned.', tier: true },
  { day: 9, t: 44.8, v: 256, cmp: 'THE SUN IS TYPING…',       line: 'Day 9.', tier: true },
];
const FINAL_LINE = { t: 46.3, line: 'Day 9: The Sun asked for his number.' };
const MONTAGE = [26.6, 30.2];
const SILENCE = [44.0, 44.8];

// ---------------------------------------------------------------- renderer
const glc = document.createElement('canvas'); glc.width = W; glc.height = H;
const renderer = new THREE.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const out = document.getElementById('out'); const ctx = out.getContext('2d');
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const sceneC = mk(W, H), sctx = sceneC.getContext('2d');
const sharpC = mk(W, H), shctx = sharpC.getContext('2d');
const smallC = mk(270, 480), smctx = smallC.getContext('2d');

// ---------------------------------------------------------------- helpers
const MATS = {};
function mat(hex, o = {}) {
  const k = hex + JSON.stringify(o);
  if (!MATS[k]) MATS[k] = new THREE.MeshStandardMaterial({ color: hex, roughness: 0.82, metalness: 0, flatShading: true, ...o });
  return MATS[k];
}
function box(w, h, d, color, x = 0, y = 0, z = 0, o) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), color && color.isMaterial ? color : mat(color, o));
  m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; return m;
}
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const eOut = t => 1 - Math.pow(1 - t, 3);
const eIn = t => t * t * t;
const eIO = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const EASE = { out: eOut, in: eIn, io: eIO, lin: t => t };
function rnd(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

const HEART = ['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'];
function heartGeo(px) {
  const gs = [];
  HEART.forEach((row, r) => [...row].forEach((ch, c) => {
    if (ch === 'X') { const g = new THREE.BoxGeometry(px, px, px); g.translate((c - 3) * px, (2.5 - r) * px, 0); gs.push(g); }
  }));
  return mergeGeometries(gs);
}
const HEART_GEO = heartGeo(0.08);
function makeHeart(color = 0xff4f7b, s = 1) {
  const m = new THREE.Mesh(HEART_GEO, mat(color, { emissive: color, emissiveIntensity: 0.35 }));
  m.scale.setScalar(s); m.castShadow = true; return m;
}

// ---------------------------------------------------------------- characters
function makePerson(o = {}) {
  const c = { shirt: 0xD7262E, shirtDark: 0x9e1a21, pants: 0x6d7078, skin: 0xE7B289, hair: 0x2a1d17, shoes: 0x23232a, hoodie: true, ...o };
  const g = new THREE.Group();
  const legs = [];
  for (const sx of [-1, 1]) {
    const L = new THREE.Group(); L.position.set(sx * 0.17, 0.86, 0);
    L.add(box(0.28, 0.78, 0.3, c.pants, 0, -0.4, 0)); L.add(box(0.3, 0.13, 0.42, c.shoes, 0, -0.8, 0.05));
    g.add(L); legs.push(L);
  }
  const torso = new THREE.Group(); torso.position.y = 0.86; g.add(torso);
  torso.add(box(0.76, 0.84, 0.44, c.shirt, 0, 0.42, 0));
  if (c.hoodie) {
    torso.add(box(0.48, 0.2, 0.05, c.shirtDark, 0, 0.18, 0.23));
    torso.add(box(0.04, 0.2, 0.03, 0xf2f2f2, -0.09, 0.66, 0.235));
    torso.add(box(0.04, 0.2, 0.03, 0xf2f2f2, 0.09, 0.66, 0.235));
    torso.add(box(0.66, 0.26, 0.16, c.shirtDark, 0, 0.84, -0.2));
  }
  if (c.tie) { torso.add(box(0.26, 0.5, 0.05, 0xf4f4f4, 0, 0.6, 0.225)); torso.add(box(0.08, 0.42, 0.06, c.tie, 0, 0.55, 0.24)); }
  const arms = [];
  for (const sx of [-1, 1]) {
    const A = new THREE.Group(); A.position.set(sx * 0.49, 0.76, 0);
    A.add(box(0.22, 0.66, 0.26, c.shirt, 0, -0.3, 0)); A.add(box(0.2, 0.18, 0.22, c.skin, 0, -0.72, 0));
    torso.add(A); arms.push(A);
  }
  const head = new THREE.Group(); head.position.y = 0.86; torso.add(head);
  head.add(box(0.66, 0.64, 0.6, c.skin, 0, 0.32, 0));
  if (c.hair !== null) {
    head.add(box(0.7, 0.17, 0.64, c.hair, 0, 0.68, -0.01));
    head.add(box(0.7, 0.13, 0.12, c.hair, 0, 0.58, 0.27));
    head.add(box(0.08, 0.32, 0.52, c.hair, -0.33, 0.5, -0.05));
    head.add(box(0.08, 0.32, 0.52, c.hair, 0.33, 0.5, -0.05));
    head.add(box(0.7, 0.44, 0.1, c.hair, 0, 0.44, -0.29));
    if (c.cap) head.add(box(0.74, 0.18, 0.7, c.cap, 0, 0.78, 0)), head.add(box(0.6, 0.05, 0.3, c.cap, 0, 0.7, 0.42));
  }
  const eyes = [], pupils = [], brows = [], blush = [];
  for (const sx of [-1, 1]) {
    const e = box(0.15, 0.15, 0.03, 0xffffff, sx * 0.15, 0.35, 0.305); e.castShadow = false; head.add(e); eyes.push(e);
    const p = box(0.08, 0.1, 0.02, 0x15110f, sx * 0.15, 0.34, 0.325); p.castShadow = false; head.add(p); pupils.push(p);
    const b = new THREE.Group(); b.position.set(sx * 0.15, 0.48, 0.31); b.add(box(0.19, 0.045, 0.03, c.hair ?? 0x333333)); head.add(b); brows.push(b);
    const bl = box(0.12, 0.06, 0.02, 0xff7d93, sx * 0.23, 0.22, 0.305, { emissive: 0xff3366, emissiveIntensity: 0.25 }); bl.visible = false; head.add(bl); blush.push(bl);
  }
  const mouth = new THREE.Group(); mouth.position.set(0, 0.15, 0.305); head.add(mouth);
  const mC = box(0.12, 0.045, 0.02, 0x4a1f1a); const mL = box(0.06, 0.045, 0.02, 0x4a1f1a, -0.085, 0, 0); const mR = box(0.06, 0.045, 0.02, 0x4a1f1a, 0.085, 0, 0);
  const mO = box(0.13, 0.13, 0.02, 0x3a1512); mO.visible = false;
  [mC, mL, mR, mO].forEach(m => { m.castShadow = false; mouth.add(m); });
  const glasses = new THREE.Group(); glasses.visible = false; head.add(glasses);
  glasses.add(box(0.24, 0.15, 0.03, 0x0c0c10, -0.15, 0.35, 0.33, { roughness: 0.2, metalness: 0.4 }));
  glasses.add(box(0.24, 0.15, 0.03, 0x0c0c10, 0.15, 0.35, 0.33, { roughness: 0.2, metalness: 0.4 }));
  glasses.add(box(0.7, 0.04, 0.03, 0x0c0c10, 0, 0.41, 0.33));
  const phone = new THREE.Group(); phone.visible = false; arms[0].add(phone);
  phone.add(box(0.14, 0.26, 0.03, 0x111114, 0, -0.8, 0.14));
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.23), new THREE.MeshBasicMaterial({ color: 0xbcd6ff, toneMapped: false }));
  scr.position.set(0, -0.8, 0.156); phone.add(scr);

  const P = { g, legs, torso, arms, head, eyes, pupils, brows, blush, mouth, mC, mL, mR, mO, glasses, phone, c };
  P.expr = (e) => setExpr(P, e); P.pose = (p, t = 0) => setPose(P, p, t);
  P.expr('neutral'); P.pose('idle');
  return P;
}
function setExpr(P, e) {
  const { brows, mL, mR, mC, mO, eyes, pupils } = P;
  mO.visible = false; mC.visible = mL.visible = mR.visible = true;
  eyes.forEach(x => x.scale.set(1, 1, 1)); pupils.forEach(x => { x.scale.set(1, 1, 1); x.position.x = Math.sign(x.position.x) * 0.15; x.position.y = 0.34; });
  brows.forEach(b => { b.rotation.z = 0; b.position.y = 0.48; });
  mL.position.y = mR.position.y = 0; mL.rotation.z = mR.rotation.z = 0;
  const corner = (l, r) => { mL.position.y = l; mR.position.y = r; mL.rotation.z = -l * 6; mR.rotation.z = r * 6; };
  switch (e) {
    case 'sad': brows[0].rotation.z = 0.38; brows[1].rotation.z = -0.38; corner(-0.035, -0.035); pupils.forEach(p => p.position.y = 0.315); break;
    case 'smile': corner(0.035, 0.035); break;
    case 'smirk': brows[0].rotation.z = -0.22; brows[1].rotation.z = 0.08; brows[1].position.y = 0.5; corner(0.0, 0.05); break;
    case 'smug': brows[0].rotation.z = -0.26; brows[1].rotation.z = 0.26; corner(0.02, 0.045); eyes.forEach(x => x.scale.y = 0.6); pupils.forEach(x => x.scale.y = 0.6); break;
    case 'wink': corner(0.02, 0.05); eyes[1].scale.y = 0.18; pupils[1].scale.y = 0.05; brows[1].position.y = 0.45; break;
    case 'surprised': brows.forEach(b => b.position.y = 0.53); mC.visible = mL.visible = mR.visible = false; mO.visible = true; mO.scale.set(0.7, 0.6, 1); break;
    case 'shock': brows[0].rotation.z = 0.25; brows[1].rotation.z = -0.25; brows.forEach(b => b.position.y = 0.54); mC.visible = mL.visible = mR.visible = false; mO.visible = true; mO.scale.set(1, 1.2, 1); pupils.forEach(p => p.scale.set(0.6, 0.6, 1)); break;
    case 'shy': corner(0.03, 0.03); pupils.forEach(p => { p.position.x += 0.04; p.position.y = 0.32; }); break;
  }
}
function setPose(P, p, t = 0) {
  const [aL, aR] = P.arms, [lL, lR] = P.legs;
  [aL, aR, lL, lR, P.torso, P.head].forEach(o => o.rotation.set(0, 0, 0));
  P.torso.position.y = 0.86;
  aL.rotation.z = -0.08; aR.rotation.z = 0.08; P.phone.visible = false;
  switch (p) {
    case 'phone': aL.rotation.set(-1.15, 0, 0.45); P.phone.visible = true; P.head.rotation.x = 0.35; break;
    case 'hunch': aL.rotation.set(-1.0, 0, 0.5); P.phone.visible = true; P.torso.rotation.x = 0.32; P.head.rotation.x = 0.4; break;
    case 'wave': aR.rotation.set(0, 0, 2.7 + Math.sin(t * 12) * 0.25); break;
    case 'wave2': aR.rotation.set(0, 0, 2.7 + Math.sin(t * 12) * 0.25); aL.rotation.set(0, 0, -2.7 - Math.sin(t * 12 + 1) * 0.25); break;
    case 'walk': { const s = Math.sin(t * 7); lL.rotation.x = s * 0.5; lR.rotation.x = -s * 0.5; aL.rotation.x = -s * 0.45; aR.rotation.x = s * 0.45; P.torso.position.y = 0.86 + Math.abs(Math.cos(t * 7)) * 0.04; break; }
    case 'guns': aL.rotation.set(-1.45, 0, 0.18); aR.rotation.set(-1.45, 0, -0.18); break;
    case 'hips': aL.rotation.set(0, 0, -0.55); aR.rotation.set(0, 0, 0.55); break;
    case 'float': aL.rotation.set(0, 0, -0.9 - Math.sin(t * 2) * 0.1); aR.rotation.set(0, 0, 0.9 + Math.sin(t * 2) * 0.1); lL.rotation.x = 0.25; lR.rotation.x = -0.15; break;
    case 'cross': aL.rotation.set(-1.25, 0, 1.15); aR.rotation.set(-1.15, 0, -1.15); break;
    case 'point': aR.rotation.set(-1.5, 0, 0); aL.rotation.set(0, 0, -0.55); break;
    case 'hairflip': aR.rotation.set(0, 0, 2.6); P.head.rotation.set(-0.25, 0, 0.18); aL.rotation.set(0, 0, -0.55); break;
    case 'lean': P.torso.rotation.z = 0.12; aL.rotation.set(0, 0, -0.55); aR.rotation.set(-0.3, 0, 0.3); lR.rotation.z = 0.25; break;
    case 'sitfloor': lL.rotation.x = lR.rotation.x = -1.5; P.g.position.y = -0.7; aL.rotation.set(-1.0, 0, 0.5); P.phone.visible = true; P.torso.rotation.x = 0.2; P.head.rotation.x = 0.45; break;
    case 'lie': aL.rotation.set(0, 0, -2.9); aR.rotation.set(0, 0, 2.9); break;
  }
}
function makePigeon() {
  const g = new THREE.Group();
  g.add(box(0.24, 0.2, 0.36, 0x8e959f, 0, 0.22, 0));
  const head = new THREE.Group(); head.position.set(0, 0.36, 0.16); g.add(head);
  head.add(box(0.15, 0.15, 0.15, 0x5c6272));
  head.add(box(0.16, 0.07, 0.1, 0x4f8c7c, 0, -0.09, -0.02));
  head.add(box(0.05, 0.04, 0.08, 0xe0a13b, 0, -0.01, 0.1));
  head.add(box(0.03, 0.03, 0.02, 0xff8a1f, -0.077, 0.02, 0.04)); head.add(box(0.03, 0.03, 0.02, 0xff8a1f, 0.077, 0.02, 0.04));
  g.add(box(0.04, 0.14, 0.26, 0x737a85, -0.13, 0.24, -0.02)); g.add(box(0.04, 0.14, 0.26, 0x737a85, 0.13, 0.24, -0.02));
  g.add(box(0.16, 0.04, 0.16, 0x5c6272, 0, 0.18, -0.24));
  g.add(box(0.03, 0.12, 0.03, 0xd77a86, -0.05, 0.06, 0.02)); g.add(box(0.03, 0.12, 0.03, 0xd77a86, 0.05, 0.06, 0.02));
  g.userData.head = head; g.scale.setScalar(1.25); return g;
}

// ---------------------------------------------------------------- textures
function canvasTex(w, h, draw) { const c = mk(w, h); draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }
function windowsTex(seed, lit = false) {
  return canvasTex(256, 512, (g, w, h) => {
    const r = rnd(seed); g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h);
    for (let y = 20; y < h - 30; y += 64) for (let x = 18; x < w - 30; x += 58) {
      g.fillStyle = '#e9e9e9'; g.fillRect(x - 4, y - 4, 42, 50);
      const on = r() < (lit ? 0.6 : 0.15);
      g.fillStyle = on ? '#ffe2a6' : (r() < 0.5 ? '#3f5f86' : '#51749c'); g.fillRect(x, y, 34, 42);
      g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(x + 3, y + 3, 8, 36);
    }
  });
}

// ---------------------------------------------------------------- phone UI
const phoneUI = mk(600, 1200), pg = phoneUI.getContext('2d');
function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
function drawPhone(state) {
  const g = pg, w = 600, h = 1200;
  g.fillStyle = '#0b0b0f'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#fff'; g.font = '600 30px InterW'; g.textAlign = 'left'; g.fillText(state.clock, 46, 62);
  g.textAlign = 'right'; g.fillText('●●●  ▮', 556, 62);
  // header
  g.fillStyle = '#16161c'; g.fillRect(0, 90, w, 140);
  g.fillStyle = '#4c8dff'; g.font = '600 44px InterW'; g.textAlign = 'left'; g.fillText('‹', 26, 176);
  g.save(); g.beginPath(); g.arc(110, 160, 40, 0, 7); g.fillStyle = state.avatar; g.fill(); g.restore();
  g.font = '40px "Noto Color Emoji"'; g.textAlign = 'center'; g.fillText(state.avatarEmoji, 110, 175);
  g.textAlign = 'left'; g.fillStyle = '#fff'; g.font = '700 36px InterW'; g.fillText(state.name, 166, 156);
  g.fillStyle = '#8a8a96'; g.font = '600 24px InterW'; g.fillText(state.sub, 166, 192);
  g.font = '600 38px InterW, "Noto Color Emoji"';
  let tot = state.typing > 0 ? 92 : 0;
  for (const m of state.msgs) { if (m.a <= 0) continue; tot += 58 * m.text.split('\n').length + 44 + 18 + (m.receipt && m.receipt.a > 0 ? 44 : 0); }
  let y = h - 150 - tot;
  for (const m of state.msgs) {
    if (m.a <= 0) { continue; }
    g.save(); g.globalAlpha = m.a;
    g.font = '600 50px InterW, "Noto Color Emoji"';
    const lines = m.text.split('\n'); const tw = Math.max(...lines.map(l => g.measureText(l).width));
    const bw = tw + 64, bh = 58 * lines.length + 44;
    const x = m.me ? w - 40 - bw : 40;
    const s = m.s ?? 1; g.translate(x + (m.me ? bw : 0), y + bh / 2); g.scale(s, s); g.translate(-(x + (m.me ? bw : 0)), -(y + bh / 2));
    rr(g, x, y, bw, bh, 36); g.fillStyle = m.me ? '#2f7bff' : '#2c2c34'; g.fill();
    g.fillStyle = '#fff'; lines.forEach((l, i) => g.fillText(l, x + 32, y + 70 + i * 58));
    g.restore();
    y += bh + 18;
    if (m.receipt && m.receipt.a > 0) {
      g.save(); g.globalAlpha = m.receipt.a; g.fillStyle = '#a0a0ac'; g.font = '600 32px InterW'; g.textAlign = m.me ? 'right' : 'left';
      g.fillText(m.receipt.text, m.me ? w - 46 : 46, y + 22); g.restore(); y += 44;
    }
  }
  if (state.typing > 0) {
    g.save(); g.globalAlpha = state.typing; rr(g, 40, y, 130, 74, 36); g.fillStyle = '#2c2c34'; g.fill();
    for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(78 + i * 28, y + 37, 9, 0, 7); g.fillStyle = `rgba(255,255,255,${0.4 + 0.6 * Math.abs(Math.sin(state.tt * 6 + i))})`; g.fill(); }
    g.restore();
  }
  // input bar
  rr(g, 30, h - 120, w - 60, 76, 38); g.strokeStyle = '#3a3a44'; g.lineWidth = 3; g.stroke();
  g.fillStyle = '#6b6b78'; g.font = '600 28px InterW'; g.fillText('Message…', 64, h - 72);
  phoneTex.needsUpdate = true;
}
const phoneTex = new THREE.CanvasTexture(phoneUI); phoneTex.colorSpace = THREE.SRGBColorSpace; phoneTex.anisotropy = 8;
function makePhoneProp(sleeve = 0xD7262E, skin = 0xE7B289) {
  const g = new THREE.Group();
  g.add(box(1.08, 2.12, 0.1, 0x101014, 0, 0, 0, { roughness: 0.3, metalness: 0.3 }));
  const s = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 2.0), new THREE.MeshBasicMaterial({ map: phoneTex, toneMapped: false }));
  s.position.z = 0.056; g.add(s);
  g.add(box(1.0, 0.95, 0.3, skin, 0.12, -0.75, -0.22));
  g.add(box(0.26, 0.62, 0.26, skin, -0.58, -0.55, 0.06));
  for (let i = 0; i < 3; i++) g.add(box(0.24, 0.2, 0.26, skin, 0.62, -0.1 - i * 0.26, 0.02));
  g.add(box(1.1, 0.9, 0.5, sleeve, 0.15, -1.55, -0.25));
  return g;
}
function chatState(T) {
  const st = { clock: '9:41', name: 'jess 💗', sub: 'Active 2h ago', avatar: '#f0a6c0', avatarEmoji: '🙂', msgs: [], typing: 0, tt: T };
  if (T < 20) {
    st.msgs.push({ me: true, text: 'hey', a: 1, receipt: { text: T < 9 ? 'Read 9:41 PM' : 'Read 9:41 PM', a: clamp((T - 4.3) / 0.25) } });
    if (T >= 9.0) {
      const k = clamp((T - 9.55) / 0.18);
      st.msgs.push({ me: false, text: 'lol', a: k, s: k < 1 ? 0.6 + 0.5 * k : 1 + 0.06 * Math.max(0, 1 - (T - 9.73) * 6) });
      st.typing = T > 9.0 && T < 9.55 ? 1 : 0; st.sub = 'Active now';
    }
  } else {
    st.name = 'The Sun'; st.avatar = '#ffb320'; st.avatarEmoji = '☀️'; st.sub = 'Active now · 150M km away'; st.clock = '9:41';
    st.typing = T > 46.3 && T < 46.75 ? 1 : 0;
    const k = clamp((T - 46.75) / 0.18);
    st.msgs.push({ me: false, text: 'hey… 🥺\ncan i get ur number?', a: k, s: k < 1 ? 0.6 + 0.5 * k : 1, receipt: { text: 'Seen ✓', a: clamp((T - 49.1) / 0.2) } });
  }
  return st;
}

// ---------------------------------------------------------------- SCENES
const S = {};
function lightRig(scene, o) {
  const hemi = new THREE.HemisphereLight(o.sky, o.ground, o.hemi); scene.add(hemi);
  const sun = new THREE.DirectionalLight(o.sunC, o.sun); sun.position.set(...o.sunPos); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); const sc = sun.shadow.camera; const R = o.R || 12;
  sc.left = -R; sc.right = R; sc.top = R; sc.bottom = -R; sc.near = 0.5; sc.far = 80; sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02; sun.shadow.radius = 4;
  scene.add(sun); scene.add(sun.target); return { hemi, sun };
}

// ---- bedroom
{
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x10121c);
  const L = lightRig(sc, { sky: 0x8090ff, ground: 0x221630, hemi: 0.5, sunC: 0x9fb6ff, sun: 1.3, sunPos: [-6, 7, 6], R: 8 });
  sc.add(box(12, 0.2, 12, 0x3a3150, 0, -0.1, 0));
  sc.add(box(12, 7, 0.2, 0x2c3355, 0, 3.5, -3.6));
  sc.add(box(0.2, 7, 12, 0x262c4a, -4.6, 3.5, 0));
  sc.add(box(4, 0.04, 3, 0x5b4a7a, 0.6, 0.02, 1.4)); // rug
  sc.add(box(2.6, 0.5, 3.3, 0x6b4a33, 0.6, 0.25, -1.9));
  sc.add(box(2.5, 0.26, 3.2, 0xe2e5ee, 0.6, 0.62, -1.9));
  sc.add(box(2.56, 0.12, 2.1, 0x4f6fb8, 0.6, 0.8, -1.35));
  sc.add(box(1.1, 0.24, 0.62, 0xffffff, 0.6, 0.86, -3.05));
  sc.add(box(2.6, 1.4, 0.16, 0x5a3e2b, 0.6, 1.1, -3.45));
  // window
  sc.add(box(2.4, 2.0, 0.12, 0xdcdcdc, -2.2, 3.2, -3.46));
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 1.7), new THREE.MeshBasicMaterial({ color: 0x1b2a5a, toneMapped: false })); sky.position.set(-2.2, 3.2, -3.38); sc.add(sky);
  sc.add(box(0.08, 1.7, 0.06, 0xdcdcdc, -2.2, 3.2, -3.34)); sc.add(box(2.1, 0.08, 0.06, 0xdcdcdc, -2.2, 3.2, -3.34));
  const moon = new THREE.Mesh(new THREE.CircleGeometry(0.18, 8), new THREE.MeshBasicMaterial({ color: 0xf6f0d8, toneMapped: false })); moon.position.set(-1.7, 3.6, -3.37); sc.add(moon);
  // shelf, posters, desk
  sc.add(box(1.2, 1.6, 0.06, 0xd7262e, 2.9, 3.4, -3.48)); sc.add(box(1.0, 1.4, 0.07, 0x1d1d26, 2.9, 3.4, -3.46));
  sc.add(box(0.9, 1.2, 0.06, 0xf2b34a, -4.48, 3.3, -1.0));
  sc.add(box(2.2, 0.12, 0.6, 0x7a5a40, -3.2, 1.5, 1.5)); sc.add(box(0.12, 1.5, 0.5, 0x7a5a40, -4.2, 0.75, 1.5)); sc.add(box(0.12, 1.5, 0.5, 0x7a5a40, -2.2, 0.75, 1.5));
  sc.add(box(0.3, 0.6, 0.3, 0x333344, -3.4, 1.86, 1.5)); sc.add(box(0.5, 0.3, 0.5, 0xf6e7b0, -3.4, 2.25, 1.5, { emissive: 0xffd27a, emissiveIntensity: 0.4 }));
  const hero = makePerson(); sc.add(hero.g);
  const glow = new THREE.PointLight(0x9cc4ff, 3, 3.5, 1.6); sc.add(glow);
  const sunM = new THREE.DirectionalLight(0xffd29a, 0); sunM.position.set(-5, 6, -8); sunM.castShadow = false; sc.add(sunM);
  const big = makePhoneProp(); big.position.set(3.4, 1.7, 2.2); big.rotation.set(0.05, -0.12, 0.04); sc.add(big);
  S.bedroom = { sc, L, hero, glow, sky, moon, sunM, big, set(morning) {
    sc.background.setHex(morning ? 0xf3dcb8 : 0x10121c);
    L.hemi.color.setHex(morning ? 0xfff0dd : 0x8090ff); L.hemi.intensity = morning ? 1.15 : 0.5;
    L.sun.color.setHex(morning ? 0xffe2b0 : 0x9fb6ff); L.sun.intensity = morning ? 2.4 : 1.3;
    sky.material.color.setHex(morning ? 0xbfe6ff : 0x1b2a5a); moon.visible = !morning; sunM.intensity = morning ? 1.2 : 0;
  } };
}

// ---- street
{
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0xa9dcff); sc.fog = new THREE.Fog(0xbfe5ff, 30, 80);
  const L = lightRig(sc, { sky: 0xd7ecff, ground: 0x8a7f6a, hemi: 1.0, sunC: 0xfff1d6, sun: 2.6, sunPos: [8, 14, 10], R: 16 });
  sc.add(box(200, 0.2, 7, 0x4b4f58, 0, -0.1, 0));
  for (let x = -60; x < 60; x += 3) sc.add(box(1.4, 0.02, 0.18, 0xf2f2f2, x, 0.01, 0));
  sc.add(box(200, 0.3, 3, 0xcfc8bb, 0, 0.0, 4.6)); sc.add(box(200, 0.3, 3, 0xcfc8bb, 0, 0.0, -4.6));
  sc.add(box(200, 0.2, 40, 0x7aa35a, 0, -0.15, 26)); sc.add(box(200, 0.2, 40, 0x7aa35a, 0, -0.15, -26));
  const r = rnd(7); const cols = [0xe8c9a0, 0xc9705a, 0x8fb3c9, 0xead9b0, 0x9aa06b, 0xd99a7b, 0xb7a6d6];
  for (const side of [1, -1]) {
    for (let x = -46; x < 46;) {
      const w = 4 + r() * 3, h = 6 + r() * 9; const col = cols[Math.floor(r() * cols.length)];
      const t = windowsTex(Math.floor(r() * 1000)); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(w / 4, h / 8);
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 4), new THREE.MeshStandardMaterial({ color: col, map: t, roughness: 0.9, flatShading: true }));
      m.position.set(x + w / 2, h / 2, side > 0 ? 24 : -8.2); m.castShadow = m.receiveShadow = true; sc.add(m);
      sc.add(box(w + 0.2, 0.3, 4.2, 0xf1ece2, x + w / 2, h + 0.15, side > 0 ? 24 : -8.2));
      x += w + 0.25;
    }
    for (let x = -40; x < 40; x += 7) {
      const tz = side > 0 ? 7.0 : -5.6; sc.add(box(0.3, 1.6, 0.3, 0x6b4a33, x + 2, 0.8, tz));
      sc.add(box(1.4, 1.2, 1.4, 0x4f9a4a, x + 2, 2.1, tz)); sc.add(box(1.0, 0.8, 1.0, 0x5fb35a, x + 2, 2.9, tz));
      sc.add(box(0.14, 3.4, 0.14, 0x30343c, x + 5.5, 1.7, side * 3.4)); sc.add(box(0.7, 0.14, 0.14, 0x30343c, x + 5.2, 3.4, side * 3.4));
    }
  }
  // café awning (series nod)
  for (let i = 0; i < 10; i++) sc.add(box(0.5, 0.12, 1.6, i % 2 ? 0xefe6cf : 0x1f7a55, 4 + i * 0.5, 3.0, -5.6));
  sc.add(box(1.4, 0.1, 1.4, 0xffffff, 6.2, 1.0, -4.7)); sc.add(box(0.12, 1.0, 0.12, 0x333333, 6.2, 0.5, -4.7));
  // hero
  const hero = makePerson(); sc.add(hero.g);
  // strangers
  const npcCols = [[0x3e7cc9, 0x2d2d3a, 0xe9b48c, 0x3a2617], [0xf2c14e, 0x31406b, 0x8d5a3b, 0x111111], [0x48a868, 0x5b4636, 0xf0c7a0, 0xb8742a], [0x8d5ac9, 0x2b2b2b, 0x6b4128, 0x111111],
    [0xff8c5a, 0x3b5fa0, 0xe7b289, 0x5a3a22], [0x20a0a0, 0x444444, 0xc68e64, 0x222222], [0xeeeeee, 0x334455, 0xf1c8a4, 0xd9b26a], [0xe85d9b, 0x2a2a3a, 0x9a6a48, 0x1b1b1b]];
  const npcs = [];
  for (let i = 0; i < 36; i++) {
    const c = npcCols[i % npcCols.length];
    const p = makePerson({ shirt: c[0], pants: c[1], skin: c[2], hair: c[3], hoodie: false, cap: i % 5 === 2 ? 0x2f5fbf : undefined });
    const h = makeHeart(0xff4f7b, 1.4); h.position.y = 2.7; p.g.add(h); p.heart = h; p.blush.forEach(b => b.visible = true);
    sc.add(p.g); npcs.push(p);
  }
  const pigeons = []; for (let i = 0; i < 81; i++) { const p = makePigeon(); sc.add(p); pigeons.push(p); }
  const bigPigeon = makePigeon(); bigPigeon.scale.setScalar(4.5); sc.add(bigPigeon);
  for (const sx of [-1, 1]) { bigPigeon.userData.head.add(box(0.05, 0.05, 0.01, 0xffffff, sx * 0.04, 0.03, 0.078)); bigPigeon.userData.head.add(box(0.025, 0.03, 0.01, 0x111111, sx * 0.04, 0.025, 0.084)); }
  const pigHeart = makeHeart(0xff3d6e, 3.2); sc.add(pigHeart);
  const hearts = []; for (let i = 0; i < 40; i++) { const h = makeHeart(i % 3 ? 0xff4f7b : 0xff9ab5, 1.6); sc.add(h); hearts.push(h); }
  S.street = { sc, L, hero, npcs, pigeons, bigPigeon, pigHeart, hearts };
}

// ---- white studio (montage)
{
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0xffffff);
  const L = lightRig(sc, { sky: 0xffffff, ground: 0xbbbbbb, hemi: 1.1, sunC: 0xffffff, sun: 2.8, sunPos: [4, 8, 6], R: 6 });
  const floor = box(30, 0.2, 30, 0xf4f4f4, 0, -0.1, 0); sc.add(floor);
  const hero = makePerson(); sc.add(hero.g);
  S.studio = { sc, L, hero, floor, black: new THREE.MeshBasicMaterial({ color: 0x050505 }) };
}

// ---- news
{
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x0d1a3a);
  const L = lightRig(sc, { sky: 0xcfe0ff, ground: 0x223355, hemi: 1.0, sunC: 0xffffff, sun: 2.2, sunPos: [3, 6, 8], R: 8 });
  const scrTex = canvasTex(1024, 640, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#c4122f'); gr.addColorStop(1, '#3a0b5e'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,0.08)'; for (let i = 0; i < 12; i++) g.fillRect(0, i * 56, w, 4);
    g.font = '700 88px InterW'; g.fillStyle = '#fff'; g.textAlign = 'center'; g.fillText('RIZZ ALERT', w / 2, 380);
    g.font = '120px "Noto Color Emoji"'; g.fillText('💘', w / 2, 540);
  });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 4), new THREE.MeshBasicMaterial({ map: scrTex, toneMapped: false })); screen.position.set(0, 3.2, -3); sc.add(screen);
  sc.add(box(7, 4.4, 0.2, 0x0a0f22, 0, 3.2, -3.15));
  for (let i = -3; i <= 3; i++) sc.add(box(0.06, 8, 0.06, 0x2a4a8a, i * 2.4, 4, -3.3, { emissive: 0x3366ff, emissiveIntensity: 0.6 }));
  sc.add(box(16, 0.2, 12, 0x14213f, 0, -0.1, 0));
  const anchor = makePerson({ shirt: 0x1f2a44, shirtDark: 0x1f2a44, pants: 0x1f2a44, skin: 0xd9a17a, hair: 0x6b4a2a, hoodie: false, tie: 0xc4122f });
  anchor.g.position.set(0, 0.1, -0.6); sc.add(anchor.g);
  sc.add(box(4.2, 1.25, 1.3, 0x1b2a4a, 0, 0.62, 0.4)); sc.add(box(4.25, 0.14, 1.35, 0xc4122f, 0, 1.0, 0.41)); sc.add(box(4.3, 0.08, 1.45, 0xdde4f0, 0, 1.28, 0.36));
  sc.add(box(0.5, 0.06, 0.7, 0xffffff, 0.8, 1.35, 0.4));
  S.news = { sc, L, anchor };
}

// ---- space
{
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x05070d);
  const amb = new THREE.HemisphereLight(0xbfd0ff, 0x101020, 0.55); sc.add(amb);
  const key = new THREE.DirectionalLight(0xfff2dd, 2.6); key.position.set(10, 6, 8); sc.add(key);
  const rim = new THREE.DirectionalLight(0x7a6bff, 1.2); rim.position.set(-8, 3, -6); sc.add(rim);
  const r = rnd(42); const sp = [];
  for (let i = 0; i < 2500; i++) { const v = new THREE.Vector3(r() * 2 - 1, r() * 2 - 1, r() * 2 - 1).normalize().multiplyScalar(300 + r() * 100); sp.push(v.x, v.y, v.z); }
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
  const stars = new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 2.2, sizeAttenuation: false, toneMapped: false })); sc.add(stars);
  function planet(rad, det, colFn, seed) {
    const g = new THREE.IcosahedronGeometry(rad, det).toNonIndexed(); const pos = g.attributes.position; const cols = []; const rr2 = rnd(seed);
    for (let i = 0; i < pos.count; i += 3) {
      const cx = (pos.getX(i) + pos.getX(i + 1) + pos.getX(i + 2)) / 3, cy = (pos.getY(i) + pos.getY(i + 1) + pos.getY(i + 2)) / 3, cz = (pos.getZ(i) + pos.getZ(i + 1) + pos.getZ(i + 2)) / 3;
      const c = new THREE.Color(colFn(cx / rad, cy / rad, cz / rad, rr2)); for (let k = 0; k < 3; k++) cols.push(c.r, c.g, c.b);
    }
    g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    return new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.9 }));
  }
  const earth = planet(14, 4, (x, y, z, R) => { const n = Math.sin(x * 5.1 + Math.cos(z * 3.3)) + Math.cos(y * 4.2 - x * 2.0) + Math.sin(z * 6.0); return Math.abs(y) > 0.86 ? 0xf4f8ff : n > 0.9 ? (R() < 0.5 ? 0x4f9a4a : 0x6aae55) : (R() < 0.5 ? 0x2a6fd1 : 0x2f7ee0); }, 3);
  earth.position.set(0, -19, -6); sc.add(earth);
  const atmo = new THREE.Mesh(new THREE.SphereGeometry(14.6, 48, 32), new THREE.MeshBasicMaterial({ color: 0x6fb6ff, transparent: true, opacity: 0.18, side: THREE.BackSide, toneMapped: false })); earth.add(atmo);
  function face(parent, rad, o = {}) {
    const f = new THREE.Group(); parent.add(f); const z = rad * 0.96;
    const eyeW = rad * 0.22;
    for (const sx of [-1, 1]) {
      const e = box(eyeW, eyeW * 1.3, 0.1, 0x15110f, sx * rad * 0.3, rad * 0.12, z); e.castShadow = false; f.add(e);
      const hl = box(eyeW * 0.35, eyeW * 0.35, 0.1, 0xffffff, sx * rad * 0.3 + eyeW * 0.15, rad * 0.12 + eyeW * 0.3, z + 0.06); f.add(hl);
      const b = box(eyeW * 1.2, eyeW * 0.5, 0.1, o.blush ?? 0xff6f8f, sx * rad * 0.48, -rad * 0.08, z - 0.05, { emissive: o.blush ?? 0xff4f7b, emissiveIntensity: 0.6 }); f.add(b);
      if (o.lashes) { const l = box(eyeW * 0.5, eyeW * 0.14, 0.1, 0x15110f, sx * rad * 0.3 + sx * eyeW * 0.55, rad * 0.12 + eyeW * 0.65, z); l.rotation.z = sx * 0.6; f.add(l); }
    }
    const m1 = box(rad * 0.22, rad * 0.07, 0.1, 0x6a2a20, 0, -rad * 0.2, z - 0.02); f.add(m1);
    const m2 = box(rad * 0.08, rad * 0.05, 0.1, 0x6a2a20, -rad * 0.12, -rad * 0.17, z - 0.03); f.add(m2);
    const m3 = box(rad * 0.08, rad * 0.05, 0.1, 0x6a2a20, rad * 0.12, -rad * 0.17, z - 0.03); f.add(m3);
    const mo = box(rad * 0.2, rad * 0.24, 0.1, 0x5a1a14, 0, -rad * 0.22, z); mo.visible = false; f.add(mo);
    f.userData = { smile: [m1, m2, m3], o: mo }; return f;
  }
  const moon = planet(3, 2, (x, y, z, R) => R() < 0.2 ? 0x9a9aa2 : (R() < 0.5 ? 0xc9c9cf : 0xb7b7bf), 9); sc.add(moon);
  face(moon, 3, { lashes: true });
  const planets = [];
  const defs = [[1.4, 0xd65a35, 0xb8452a], [2.6, 0xd9a86a, 0xb57a46], [1.0, 0xe8d18f, 0xcfae62], [2.2, 0xe7cf98, 0xc9a86b, true], [1.7, 0x4f7be0, 0x3a5fc0], [1.5, 0x7fd6e0, 0x5bb8c6], [0.8, 0xb0b0b0, 0x8a8a8a]];
  defs.forEach((d, i) => {
    const p = planet(d[0], 2, (x, y, z, R) => (Math.floor((y + 1) * 5) % 2 ? d[1] : d[2]), 100 + i);
    if (d[3]) { const ring = new THREE.Mesh(new THREE.RingGeometry(d[0] * 1.35, d[0] * 2.1, 24, 1), new THREE.MeshStandardMaterial({ color: 0xe9d7a8, side: THREE.DoubleSide, flatShading: true })); ring.rotation.x = 1.2; p.add(ring); }
    sc.add(p); planets.push(p);
  });
  const sunMesh = planet(9, 3, (x, y, z, R) => R() < 0.5 ? 0xffb21f : (R() < 0.6 ? 0xffc83d : 0xff8f1f), 77);
  sunMesh.material = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }); sc.add(sunMesh);
  const sunFace = face(sunMesh, 9, { lashes: true, blush: 0xff3d6e });
  const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: canvasTex(256, 256, (g) => { const gr = g.createRadialGradient(128, 128, 10, 128, 128, 128); gr.addColorStop(0, 'rgba(255,200,90,1)'); gr.addColorStop(0.4, 'rgba(255,150,40,0.45)'); gr.addColorStop(1, 'rgba(255,120,20,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); }), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  sunGlow.scale.setScalar(44); sunMesh.add(sunGlow);
  const nebTex = canvasTex(256, 256, (g) => { const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); });
  const nebs = []; const nr = rnd(5);
  for (let i = 0; i < 14; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: nebTex, color: [0x3a2bd9, 0x7a3bd9, 0x2b6fd9, 0xd93ba8][i % 4], transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); const v = new THREE.Vector3(nr() * 2 - 1, nr() * 2 - 1, -1 - nr()).normalize().multiplyScalar(150); s.position.copy(v); s.scale.setScalar(90 + nr() * 90); sc.add(s); nebs.push(s); }
  const hero = makePerson(); hero.glasses.visible = true; sc.add(hero.g);
  const astro = makePerson({ shirt: 0xf2f2f2, shirtDark: 0xdddddd, pants: 0xeeeeee, skin: 0xe2a77f, hair: 0x3a2a1a, hoodie: false });
  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.62, 16, 12), new THREE.MeshStandardMaterial({ color: 0xbfe0ff, transparent: true, opacity: 0.25, roughness: 0.05, metalness: 0.2 })); helmet.position.y = 0.32; astro.head.add(helmet);
  astro.head.add(box(0.06, 0.06, 0.34, 0x222222, 0.28, 0.12, 0.2)); astro.head.add(box(0.1, 0.06, 0.06, 0x222222, 0.2, 0.12, 0.38));
  astro.torso.add(box(0.6, 0.7, 0.3, 0xdddddd, 0, 0.45, -0.36)); astro.torso.add(box(0.2, 0.12, 0.05, 0x2f5fbf, -0.18, 0.62, 0.235));
  sc.add(astro.g);
  const big = makePhoneProp(); sc.add(big);
  const hearts = []; for (let i = 0; i < 24; i++) { const h = makeHeart(0xff7aa0, 2.4); sc.add(h); hearts.push(h); }
  S.space = { sc, amb, key, rim, stars, earth, moon, planets, sunMesh, sunFace, sunGlow, nebs, hero, astro, big, hearts };
}

// ---------------------------------------------------------------- SHOTS
const cam = new THREE.PerspectiveCamera(40, W / H, 0.05, 1000);
const V = (a) => new THREE.Vector3(...a);
const shots = [];
const shot = (t0, t1, scene, cam, setup, fx = {}) => shots.push({ t0, t1, scene, cam, setup, ...fx });

// HOOK — bedroom, night, hunched on floor
shot(0, 1.8, 'bedroom', { p0: [0.6, 1.6, 5.2], p1: [0.6, 1.5, 4.6], l0: [0.6, 0.9, 0.2], fov: 42, z0: 1, z1: 1.08, ease: 'out' }, (lt) => {
  const B = S.bedroom; B.set(false); B.hero.g.position.set(0.6, 0, 0.5); B.hero.g.rotation.set(0, 0, 0); B.hero.pose('sitfloor'); B.hero.expr('sad'); B.hero.glasses.visible = false;
}, { grade: 'night' });
shot(1.8, 3.6, 'bedroom', { p0: [1.1, 1.0, 4.4], l0: [0.6, 1.2, 0.6], fov: 40, z0: 1, z1: 1.1, ease: 'out' }, (lt) => {
  const B = S.bedroom; B.set(false); B.hero.g.position.set(0.6, 0, 0.5); B.hero.pose('sitfloor'); B.hero.expr('sad');
}, { grade: 'night', dof: 0.5 });
// DAY 1 — phone: left on read (locked off)
shot(3.6, 6.0, 'bedroom', { p0: [3.45, 1.45, 5.6], l0: [3.4, 1.45, 2.2], fov: 45, z0: 1, z1: 1, ease: 'lin', shift: 0.1 }, (lt, T) => {
  S.bedroom.set(false); drawPhone(chatState(T));
}, { grade: 'night', dof: 0.6, phone: true });
shot(6.0, 9.0, 'bedroom', { p0: [0.9, 5.6, 0.45], l0: [0.9, 0, 0.45], up: [0, 0, -1], fov: 44, z0: 1, z1: 1, ease: 'lin', shift: 0.14 }, (lt) => {
  const B = S.bedroom; B.set(false); B.hero.g.position.set(0.9, 0.26, 1.6); B.hero.g.rotation.set(-Math.PI / 2, Math.PI, 0.25); B.glow.position.set(0.9, 2.2, 0.6); B.glow.intensity = 6; B.glow.distance = 5; B.hero.pose('lie'); B.hero.expr('sad');
}, { grade: 'night', comments: true });
// DAY 2 — "lol"
shot(9.0, 10.8, 'bedroom', { p0: [3.45, 1.45, 5.6], l0: [3.4, 1.45, 2.2], fov: 45, z0: 1, z1: 1.1, ease: 'out', shift: 0.1 }, (lt, T) => {
  S.bedroom.set(false); drawPhone(chatState(T));
}, { grade: 'night', dof: 0.6 });
shot(10.8, 12.4, 'bedroom', { p0: [0.5, 1.15, 4.4], l0: [0.6, 1.25, 0.6], fov: 40, z0: 1, z1: 1.12, ease: 'out' }, (lt) => {
  const B = S.bedroom; B.set(false); B.hero.g.position.set(0.6, 0, 0.5); B.hero.g.rotation.set(0, 0, 0); B.hero.pose('sitfloor'); B.hero.head.rotation.x = 0.1; B.hero.expr(lt < 0.5 ? 'neutral' : 'surprised');
}, { grade: 'warmnight', dof: 0.6 });
shot(12.4, 13.4, 'bedroom', { p0: [1.4, 1.6, 5.6], l0: [0.6, 1.6, 0.6], fov: 40, z0: 1, z1: 1.04, ease: 'lin' }, (lt) => {
  const B = S.bedroom; B.set(true); B.hero.g.position.set(0.6, 0, 0.8); B.hero.g.rotation.set(0, 0.25, 0); B.hero.pose('hips'); B.hero.expr('smirk');
}, { grade: 'warm' });
// DAY 3 — street, strangers wave (tier: pull-back)
const heroWalkX = (T) => -6 + (T - 13.4) * 1.3;
function streetBase(T, o = {}) {
  const St = S.street; const hx = o.hx ?? heroWalkX(T);
  St.hero.g.position.set(hx, 0.15, 4.4); St.hero.g.rotation.set(0, o.heroRot ?? Math.PI / 2, 0); St.hero.pose(o.pose ?? 'walk', T); St.hero.expr(o.expr ?? 'smirk'); St.hero.glasses.visible = !!o.glasses;
  St.npcs.forEach((p, i) => { p.g.visible = false; p.heart.visible = false; });
  St.pigeons.forEach(p => p.visible = false); St.bigPigeon.visible = false; St.pigHeart.visible = false; St.hearts.forEach(h => h.visible = false);
  return hx;
}
shot(13.4, 15.0, 'street', { p0: [-0.5, 1.7, 5.0], p1: [1.5, 3.6, 11.5], l0: [-4.6, 1.6, 4.2], fov: 40, z0: 1.0, z1: 0.86, roll0: 0, roll1: -3, ease: 'io' }, (lt, T) => {
  const hx = streetBase(T, { expr: 'smirk' });
  S.street.npcs.slice(0, 5).forEach((p, i) => { p.g.visible = true; p.g.position.set(hx + 1.5 + i * 1.6, 0.15, -4.4); p.g.rotation.y = -0.35; p.pose(lt > 0.3 + i * 0.08 ? 'wave' : 'idle', T + i); p.expr('smile'); });
}, { grade: 'day', flash: 13.4 });
shot(15.0, 16.6, 'street', { p0: [-4.6, 2.35, 6.1], l0: [-0.6, 1.4, -4.4], fov: 40, z0: 1, z1: 1.1, ease: 'out' }, (lt, T) => {
  const hx = streetBase(T, { expr: 'smirk' });
  S.street.npcs.slice(0, 6).forEach((p, i) => { p.g.visible = true; p.g.position.set(hx + 1.6 + i * 1.5, 0.15, -4.4); p.g.rotation.y = -0.45; p.pose(i % 2 ? 'wave2' : 'wave', T + i * 0.7); p.expr('smile'); p.heart.visible = i < 3 && lt > 0.4; p.heart.position.y = 2.7 + Math.sin(T * 5 + i) * 0.08; });
}, { grade: 'day' });
shot(16.6, 17.8, 'street', { follow: (T) => V([heroWalkX(T), 0, 0]), p0: [3.6, 1.95, 5.6], l0: [0, 1.95, 4.4], fov: 40, z0: 1, z1: 1.1, ease: 'out' }, (lt, T) => {
  const hx = streetBase(T, { expr: lt < 0.4 ? 'smirk' : 'wink' });
}, { grade: 'day', dof: 0.6 });
// DAY 4 — pigeons follow
function pigeonTrail(hx, T, n, dirX = 1, z = 4.4) {
  S.street.pigeons.forEach((p, i) => {
    if (i >= n) { p.visible = false; return; }
    p.visible = true; const row = i; const zig = Math.sin(i * 1.7) * (0.25 + Math.min(i, 30) * 0.04);
    p.position.set(hx - dirX * (1.1 + row * 0.42), 0.15, z + zig); p.rotation.y = dirX > 0 ? Math.PI / 2 : -Math.PI / 2;
    p.userData.head.position.z = 0.16 + Math.max(0, Math.sin(T * 9 + i)) * 0.07; p.position.y = 0.15 + Math.abs(Math.sin(T * 9 + i * 0.5)) * 0.04;
  });
}
shot(17.8, 19.6, 'street', { p0: [4.6, 0.35, 6.0], l0: [-1.0, 1.1, 4.4], fov: 50, z0: 1, z1: 1.1, roll0: 2, roll1: 0, ease: 'out' }, (lt, T) => {
  const hx = streetBase(T, { hx: -1.5 + (T - 17.8) * 1.2, expr: 'smug' }); pigeonTrail(hx, T, 14);
}, { grade: 'day' });
shot(19.6, 21.0, 'street', { p0: [-1.5, 22, 4.6], p1: [-1.5, 19, 4.6], l0: [-1.5, 0, 4.59], fov: 44, z0: 1, z1: 1.08, ease: 'out', up: [1, 0, 0] }, (lt, T) => {
  const hx = streetBase(T, { hx: 2 + (T - 19.6) * 1.2, expr: 'smug' }); pigeonTrail(hx, T, 81);
}, { grade: 'day' });
shot(21.0, 22.4, 'street', { p0: [1.8, 1.8, 14.0], l0: [0.2, 2.4, 4.6], fov: 34, z0: 1, z1: 1.12, ease: 'out' }, (lt, T) => {
  streetBase(T, { hx: 9, expr: 'smug' }); const St = S.street;
  St.bigPigeon.visible = true; St.bigPigeon.position.set(0.2, 0.15, 4.6); St.bigPigeon.rotation.y = 0.35; St.bigPigeon.userData.head.rotation.x = -0.25;
  St.pigHeart.visible = lt > 0.3; St.pigHeart.position.set(0.15, 3.5 + Math.sin(T * 6) * 0.06, 4.7); St.pigHeart.scale.setScalar(3.2 * (1 + 0.15 * Math.max(0, Math.sin(T * 10))));
}, { grade: 'day', dof: 0.25 });
// DAY 5 — city notices (crowd ring + hearts), tier pull-back
function crowd(T, hx, n, rad, glasses) {
  const St = S.street;
  St.npcs.forEach((p, i) => {
    if (i >= n) return; p.g.visible = true; const a = i / n * Math.PI * 2 + 0.3; const rr2 = rad + (i % 3) * 0.9;
    p.g.position.set(hx + Math.cos(a) * rr2, 0.15, 0.8 + Math.sin(a) * rr2 * 0.75); p.g.rotation.y = Math.atan2(hx - p.g.position.x, 0.8 - p.g.position.z);
    p.pose(i % 3 === 0 ? 'wave' : i % 3 === 1 ? 'wave2' : 'idle', T + i); p.expr('smile'); p.heart.visible = true; p.heart.position.y = 2.7 + Math.sin(T * 5 + i) * 0.1;
  });
  St.hearts.forEach((h, i) => { h.visible = true; const ph = ((T * 0.35 + i * 0.137) % 1); h.position.set(hx + Math.sin(i * 2.3) * 6, 1 + ph * 12, 0.8 + Math.cos(i * 1.7) * 4); h.rotation.y = T * 2 + i; });
}
shot(22.4, 24.2, 'street', { p0: [2, 4.2, 9.5], p1: [2, 15, 15], l0: [2, 1.2, 0.8], fov: 42, z0: 1.0, z1: 0.86, roll0: 0, roll1: 4, ease: 'io' }, (lt, T) => {
  streetBase(T, { hx: 2, heroRot: 0.15, pose: 'guns', expr: 'smug', glasses: true }); S.street.hero.g.position.z = 0.8; crowd(T, 2, 30, 4.2);
}, { grade: 'golden' });
shot(24.2, 26.6, 'street', { p0: [2.6, 0.45, 3.7], l0: [2, 2.0, 0.8], fov: 46, z0: 1, z1: 1.15, roll0: 0, roll1: -2, ease: 'out' }, (lt, T) => {
  streetBase(T, { hx: 2, heroRot: 0.1, pose: lt < 0.5 ? 'cross' : 'guns', expr: 'smug', glasses: true }); S.street.hero.g.position.z = 0.8; crowd(T, 2, 30, 4.2);
}, { grade: 'golden' });
// MONTAGE — B&W strobe, 0.7 s cuts
const mPoses = [
  { pose: 'hairflip', expr: 'smug', cam: { p0: [0, 1.4, 6.2], l0: [0, 1.25, 0], fov: 40 }, sil: true },
  { pose: 'guns', expr: 'wink', cam: { p0: [0.3, 2.1, 3.8], l0: [0, 1.95, 0], fov: 40 }, sil: false },
  { pose: 'cross', expr: 'smug', cam: { p0: [-1.2, 0.4, 4.4], l0: [0, 1.4, 0], fov: 44 }, sil: true },
  { pose: 'lean', expr: 'smirk', cam: { p0: [0, 1.6, 6.8], l0: [0, 1.25, 0], fov: 38 }, sil: false, mag: true },
  { pose: 'point', expr: 'wink', cam: { p0: [1.2, 1.5, 5.4], l0: [0, 1.3, 0], fov: 40 }, sil: true },
];
mPoses.forEach((m, i) => {
  const t0 = MONTAGE[0] + i * 0.72, t1 = i === mPoses.length - 1 ? MONTAGE[1] : t0 + 0.72;
  shot(t0, t1, 'studio', { ...m.cam, z0: 1, z1: 1.06, ease: 'out' }, (lt) => {
    const St = S.studio; St.hero.g.position.set(0, 0, 0); St.hero.g.rotation.set(0, i % 2 ? -0.3 : 0.3, 0); St.hero.pose(m.pose, lt); St.hero.expr(m.expr); St.hero.glasses.visible = i % 2 === 0;
    St.sc.overrideMaterial = m.sil ? St.black : null; St.floor.visible = !m.sil;
  }, { grade: 'mono', flash: i % 2 === 0 ? t0 : undefined, hideStat: true, mag: m.mag });
});
// DAY 6 — news
shot(30.2, 32.4, 'news', { p0: [0, 2.3, 7.6], l0: [0, 2.2, -0.4], fov: 40, z0: 1, z1: 1.04, ease: 'lin' }, (lt, T) => {
  const N = S.news; N.anchor.pose(lt > 0.5 ? 'point' : 'idle'); N.anchor.arms[1].rotation.set(lt > 0.5 ? -1.0 : 0, 0, lt > 0.5 ? 1.2 : 0.08); N.anchor.expr('shock');
}, { grade: 'news', news: true, flash: 30.2 });
shot(32.4, 34.2, 'street', { p0: [2.2, 1.95, 3.6], l0: [2, 1.9, 0.8], fov: 44, z0: 1, z1: 1.12, ease: 'out' }, (lt, T) => {
  streetBase(T, { hx: 2, heroRot: 0, pose: 'idle', expr: lt < 0.45 ? 'smug' : 'wink', glasses: lt < 0.45 }); S.street.hero.g.position.z = 0.8; crowd(T, 2, 30, 4.2);
}, { grade: 'golden', dof: 0.6 });
// DAY 7 — space, Moon moves closer
function spaceBase(T, o = {}) {
  const Sp = S.space; const cos = o.cosmic ?? 0;
  Sp.sc.background.setRGB(lerp(0.02, 0.09, cos), lerp(0.027, 0.06, cos), lerp(0.05, 0.32, cos));
  Sp.nebs.forEach(n => n.material.opacity = 0.35 * cos);
  Sp.hero.g.visible = o.hero !== false; Sp.hero.g.position.set(0, Math.sin(T * 1.3) * 0.08, 0); Sp.hero.g.rotation.set(0.05, o.heroRot ?? 0.2, Math.sin(T) * 0.04); Sp.hero.pose(o.pose ?? 'float', T); Sp.hero.expr(o.expr ?? 'smug'); Sp.hero.glasses.visible = o.glasses ?? true;
  Sp.earth.visible = o.earth ?? true; Sp.earth.rotation.y = T * 0.05;
  Sp.moon.visible = !!o.moon; Sp.astro.g.visible = !!o.astro; Sp.big.visible = !!o.phone;
  Sp.planets.forEach(p => p.visible = !!o.planets); Sp.sunMesh.visible = !!o.sun; Sp.sunFace.userData.smile.forEach(m => m.visible = true); Sp.sunFace.userData.o.visible = false; Sp.hearts.forEach(h => h.visible = false);
}
shot(34.2, 36.0, 'space', { p0: [0.3, 1.6, 7.5], p1: [0.2, 1.5, 5.6], l0: [0, 1.2, 0], fov: 40, z0: 1, z1: 1.3, roll0: 0, roll1: 3.6, ease: 'out' }, (lt, T) => {
  spaceBase(T, { moon: true }); const Sp = S.space; Sp.moon.position.set(6, 6.5, -26); Sp.moon.rotation.set(0, -0.2, 0);
}, { grade: 'space', flash: 34.2, bloom: 0.25 });
shot(36.0, 37.5, 'space', { p0: [0, 1.2, 6], l0: [3.5, 3.6, -14], fov: 36, z0: 1, z1: 1.15, ease: 'out' }, (lt, T) => {
  spaceBase(T, { moon: true, hero: false }); const Sp = S.space; const k = eOut(lt);
  Sp.moon.position.set(lerp(6, 3.2, k), lerp(6.5, 3.4, k), lerp(-26, -12, k)); Sp.moon.rotation.set(0, lerp(-0.2, -0.25, k), Math.sin(T * 3) * 0.05);
}, { grade: 'space', bloom: 0.25 });
shot(37.5, 38.8, 'space', { p0: [-2.5, 2.2, 3.4], l0: [-2.8, 2.2, -0.4], fov: 32, z0: 1, z1: 1.1, ease: 'out' }, (lt, T) => {
  spaceBase(T, { moon: true, astro: true, hero: false }); const Sp = S.space; Sp.moon.position.set(3.2, 3.4, -12);
  Sp.astro.g.position.set(-2.8, 0, -0.4 + Math.sin(T) * 0.05); Sp.astro.g.rotation.set(0, 0.15, 0.06); Sp.astro.pose('idle'); Sp.astro.arms[0].rotation.set(-2.6, 0, 0.3); Sp.astro.expr('shock');
}, { grade: 'space', dof: 0.5 });
// DAY 8 — planets align (cosmic blue)
const alignLine = (i, n) => { const k = i / (n - 1) - 0.5; return [k * 30, 6 + k * 46, -30 - Math.abs(k) * 4]; };
const scatter = (i) => { const r = rnd(300 + i); return [(r() - 0.5) * 60, (r() - 0.3) * 50, -25 - r() * 30]; };
function placePlanets(k, T) {
  S.space.planets.forEach((p, i) => { const a = scatter(i), b = alignLine(i, 7); p.position.set(lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)); p.rotation.y = T * 0.3 + i; });
}
shot(38.8, 40.8, 'space', { p0: [0.6, 1.3, 7.5], p1: [0.6, 1.0, 13], l0: [0, 4, -10], fov: 50, z0: 1, z1: 0.86, roll0: -2, roll1: 0, ease: 'io' }, (lt, T) => {
  spaceBase(T, { planets: true, earth: false, cosmic: lt, pose: 'float', expr: 'smug' }); placePlanets(eIO(clamp(lt * 1.15)), T);
}, { grade: 'cosmic', flash: 38.8, bloom: 0.4 });
shot(40.8, 42.5, 'space', { p0: [0.6, -1.8, 6.8], l0: [0, 2.4, -2], fov: 48, z0: 1, z1: 1.05, ease: 'lin' }, (lt, T) => {
  spaceBase(T, { planets: true, earth: false, cosmic: 1, pose: 'cross', expr: 'smug', heroRot: 0 }); placePlanets(1, T);
}, { grade: 'cosmic', bloom: 0.5 });
shot(42.5, 44.0, 'space', { p0: [0.5, 1.2, 9], p1: [1, 2, 24], l0: [0, 6, -14], fov: 48, z0: 1, z1: 0.6, roll0: 0, roll1: 4, ease: 'io' }, (lt, T) => {
  spaceBase(T, { planets: true, earth: false, cosmic: 1, sun: true }); placePlanets(1, T); const Sp = S.space; Sp.sunMesh.position.set(lerp(70, 52, lt), lerp(70, 58, lt), -90); Sp.sunMesh.rotation.set(0, -0.5, 0); Sp.sunFace.visible = false;
}, { grade: 'cosmic', bloom: 0.55 });
// SILENCE DROP — the Sun, still
shot(44.0, 44.8, 'space', { p0: [0, 0, 40], l0: [0, 0, -60], fov: 40, z0: 1, z1: 1, ease: 'lin' }, (lt, T) => {
  spaceBase(T, { earth: false, hero: false, cosmic: 0.6, sun: true }); const Sp = S.space; Sp.sunMesh.position.set(0, 0, -60); Sp.sunMesh.rotation.set(0, 0, 0); Sp.sunFace.visible = true;
}, { grade: 'gold', bloom: 0.5 });
// DAY 9 — crash zoom on the Sun (blushing), phone, callback
shot(44.8, 46.3, 'space', { p0: [0, 0, 40], l0: [0, 0, -60], fov: 40, z0: 1, z1: 1.93, roll0: 0, roll1: 16, ease: 'in' }, (lt, T) => {
  spaceBase(T, { earth: false, hero: false, cosmic: 0.6, sun: true }); const Sp = S.space; Sp.sunMesh.position.set(0, 0, -60); Sp.sunMesh.rotation.set(0, Math.sin(T * 2) * 0.05, 0); Sp.sunFace.visible = true;
  Sp.hearts.forEach((h, i) => { h.visible = true; const ph = (T * 0.5 + i * 0.09) % 1; h.position.set(Math.sin(i * 2.1) * 16, -10 + ph * 26, -48 + Math.cos(i) * 3); h.rotation.y = T * 2 + i; });
}, { grade: 'gold', flash: 44.8, bloom: 0.55 });
shot(46.3, 49.2, 'space', { p0: [0.05, -0.25, 3.4], l0: [0, -0.25, 0], fov: 45, shift: 0.1, z0: 1, z1: 1.08, ease: 'out' }, (lt, T) => {
  spaceBase(T, { earth: false, hero: false, cosmic: 0.6, sun: true, phone: true }); const Sp = S.space; Sp.sunMesh.position.set(-14, 22, -70); Sp.sunFace.visible = true;
  Sp.big.position.set(0, 0, 0); Sp.big.rotation.set(0.04, -0.1, 0.03); drawPhone(chatState(T));
}, { grade: 'gold', dof: 0.6, bloom: 0.35 });
shot(49.2, 51.5, 'space', { p0: [0.2, 1.95, 4.6], l0: [0, 1.85, 0], fov: 40, z0: 1, z1: 1.1, ease: 'out' }, (lt, T) => {
  spaceBase(T, { earth: false, cosmic: 0.6, sun: true, pose: 'idle', expr: lt < 0.4 ? 'smug' : 'wink', heroRot: 0, glasses: lt < 0.4 }); const Sp = S.space; Sp.sunMesh.position.set(-10, 6, -50); Sp.sunFace.visible = true;
  Sp.hero.g.position.y = 0;
}, { grade: 'gold', dof: 0.55, bloom: 0.4 });

shot(51.5, DUR, 'space', { p0: [0, 0, 30], l0: [0, 0, -60], fov: 40, z0: 1.2, z1: 1.7, roll0: 0, roll1: -8, ease: 'out' }, (lt, T) => {
  spaceBase(T, { earth: false, hero: false, cosmic: 0.6, sun: true }); const Sp = S.space; Sp.sunMesh.position.set(Math.sin(T * 40) * 0.4 * (1 - lt), 0, -60); Sp.sunMesh.rotation.set(0, 0, 0); Sp.sunFace.visible = true;
  Sp.sunFace.userData.smile.forEach(m => m.visible = false); Sp.sunFace.userData.o.visible = true;
  Sp.hearts.forEach((h, i) => { h.visible = true; const ph = (lt * 0.8 + i * 0.09) % 1; h.position.set(Math.sin(i * 2.1) * 16, 12 - ph * 26, -48 + Math.cos(i) * 3); h.rotation.set(0, 0, Math.PI + Math.sin(T * 3 + i) * 0.4); });
}, { grade: 'gold', flash: 51.5, bloom: 0.5 });

// ---------------------------------------------------------------- overlay text
function stepAt(T) { let s = null; for (const st of STEPS) if (T >= st.t) s = st; return s; }
function fmtNum(v) { return v.toLocaleString('en-US'); }
function spaced(g, text, x, y, sp) { let cx = x; for (const ch of text) { g.fillText(ch, cx, y); cx += g.measureText(ch).width + sp; } return cx - x; }
function drawStat(T, sh) {
  const s = stepAt(T); if (!s || sh.hideStat) return;
  const g = ctx; const x = 30; g.save();
  g.shadowColor = 'rgba(0,0,0,0.55)'; g.shadowBlur = 14; g.shadowOffsetY = 2; g.fillStyle = '#fff'; g.textAlign = 'left';
  g.font = '600 30px InterW'; spaced(g, 'RIZZ LEVEL', x, 288, 4.5);
  const dt = (T - s.t) * 30; const sc = dt < 5 ? (dt < 2.5 ? 1 + 0.06 * dt / 2.5 : 1.06 - 0.06 * (dt - 2.5) / 2.5) : 1;
  g.save(); g.translate(x, 412); g.scale(sc, sc); g.font = '500 128px Lora'; g.fillText(fmtNum(s.v), 0, 0); g.restore();
  g.font = '600 27px InterW'; spaced(g, s.cmp, x, 462, 3.6);
  g.font = '600 25px InterW'; g.globalAlpha = 0.9; spaced(g, 'DAY ' + s.day, x, 502, 3.2); g.globalAlpha = 1;
  g.shadowBlur = 0; g.shadowOffsetY = 0; g.font = '700 25px InterW'; const tw = spaced(mkMeasure(), '×2 EVERY DAY', 0, 0, 2.5);
  rr(g, x, 520, tw + 26, 42, 3); g.fillStyle = '#E21E39'; g.fill(); g.fillStyle = '#fff'; spaced(g, '×2 EVERY DAY', x + 13, 550, 2.5);
  g.restore();
}
const measC = mk(10, 10).getContext('2d'); function mkMeasure() { measC.font = '700 25px InterW'; return measC; }
function wrap(g, text, maxW) { const words = text.split(' '); const lines = []; let cur = ''; for (const w of words) { const t = cur ? cur + ' ' + w : w; if (g.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; } lines.push(cur); return lines; }
function drawItalic(T) {
  const items = STEPS.map((s, i) => ({ t0: s.t, t1: (i < STEPS.length - 1 ? STEPS[i + 1].t : FINAL_LINE.t), text: s.line }));
  items.push({ t0: FINAL_LINE.t, t1: DUR + 1, text: FINAL_LINE.line });
  const it = items.find(i => T >= i.t0 && T < i.t1); if (!it) return;
  if (T >= MONTAGE[0] && T < MONTAGE[1]) return;
  const f = 8 / 30; const a = Math.min(clamp((T - it.t0) / f), clamp((it.t1 - T) / f));
  const g = ctx; g.save(); g.globalAlpha = a; g.font = 'italic 400 54px Lora'; g.fillStyle = '#fff'; g.textAlign = 'left';
  g.shadowColor = 'rgba(0,0,0,0.6)'; g.shadowBlur = 16; g.shadowOffsetY = 2;
  wrap(g, it.text, 800).forEach((l, i) => g.fillText(l, 56, 700 + i * 70)); g.restore();
}
function drawHook(T) {
  if (T >= STEPS[0].t) return;
  const k = eOut(clamp(T / 0.5)); const y = lerp(H * 0.45, H * 0.25, k);
  const a = clamp(T / 0.12) * clamp((STEPS[0].t - T) / 0.1);
  const g = ctx; g.save(); g.globalAlpha = a; g.font = '400 78px Lora'; g.textAlign = 'center'; g.fillStyle = '#fff';
  g.shadowColor = 'rgba(0,0,0,0.55)'; g.shadowBlur = 22; g.shadowOffsetY = 3;
  g.fillText('What if your rizz', W / 2, y); g.fillText('doubled every day?', W / 2, y + 96); g.restore();
}
function drawComments(T) {
  if (T < 6.6 || T >= 9.0) return;
  const cs = [{ t: 6.6, u: 'jess.k', c: 'bro got left on read 💀' }, { t: 7.4, u: 'user8812', c: 'rate his texting… be honest' }, { t: 8.0, u: 'nate_irl', c: 'It’s over.' }];
  const g = ctx; let y = 1080;
  for (const c of cs) {
    if (T < c.t) continue; const a = clamp((T - c.t) / 0.2) * clamp((9.0 - T) / 0.15);
    g.save(); g.globalAlpha = a * 0.95; rr(g, 56, y, 760, 118, 26); g.fillStyle = 'rgba(18,18,24,0.82)'; g.fill();
    g.beginPath(); g.arc(112, y + 59, 30, 0, 7); g.fillStyle = ['#f0a6c0', '#8fb3c9', '#9aa06b'][cs.indexOf(c)]; g.fill();
    g.fillStyle = '#9a9aa8'; g.font = '600 26px InterW'; g.textAlign = 'left'; g.fillText(c.u, 162, y + 46);
    g.fillStyle = '#fff'; g.font = '600 34px InterW, "Noto Color Emoji"'; g.fillText(c.c, 162, y + 90); g.restore();
    y += 136;
  }
}
function drawNews(T) {
  const g = ctx; const k = eOut(clamp((T - 30.35) / 0.25));
  g.save(); g.translate(lerp(-900, 0, k), 0);
  g.fillStyle = '#c4122f'; g.fillRect(40, 1250, 300, 64); g.fillStyle = '#fff'; g.font = '700 34px InterW'; spaced(g, 'BREAKING', 62, 1294, 3);
  g.fillStyle = 'rgba(255,255,255,0.96)'; g.fillRect(40, 1314, 860, 128);
  g.fillStyle = '#0d1a3a'; g.font = '700 40px InterW'; g.fillText('LOCAL MAN’S RIZZ CAUSES', 64, 1366); g.fillText('CITYWIDE BLUSHING', 64, 1418);
  g.fillStyle = '#0d1a3a'; g.fillRect(40, 1442, 860, 50); g.fillStyle = '#fff'; g.font = '600 26px InterW';
  const tick = 'PIGEONS UNIONISE  •  EXPERTS: “WE HAVE NEVER SEEN RIZZ LIKE THIS”  •  RIZZ LEVEL 32 AND CLIMBING  •  ';
  g.save(); g.beginPath(); g.rect(40, 1442, 860, 50); g.clip(); g.fillText(tick + tick, 60 - ((T - 30.2) * 260) % 1400, 1476); g.restore();
  g.restore();
  g.save(); g.fillStyle = '#c4122f'; g.beginPath(); g.arc(W - 120, 260, 12, 0, 7); g.globalAlpha = Math.sin(T * 8) > 0 ? 1 : 0.3; g.fill(); g.globalAlpha = 1; g.fillStyle = '#fff'; g.font = '700 30px InterW'; g.textAlign = 'right'; g.fillText('LIVE', W - 140, 271); g.restore();
}
function drawMag(T) {
  const g = ctx; g.save(); g.fillStyle = '#111'; g.textAlign = 'center';
  g.font = '500 250px Lora'; g.fillText('RIZZUE', W / 2, 400);
  g.font = '600 30px InterW'; spaced(g, 'THE DAY 5 ISSUE', 360, 450, 6);
  g.textAlign = 'left'; g.font = 'italic 400 56px Lora'; g.fillText('Man of', 60, 1300); g.fillText('the Year', 60, 1365);
  g.font = '600 28px InterW'; g.fillText('FROM “LEFT ON READ”', 60, 1430); g.fillText('TO FRONT PAGE', 60, 1470);
  g.restore();
}
function cueAt(O) {
  for (let i = 0; i < DIALOGUE.length; i++) {
    const c = DIALOGUE[i]; const nxt = DIALOGUE[i + 1]; const t0 = c.words[0].t; const t1 = Math.min(c.end + 0.3, nxt ? nxt.words[0].t - 0.02 : 1e9);
    if (O >= t0 - 0.03 && O < t1) return c;
  }
  return null;
}
function strokeText(g, text, x, y, sw) { g.lineJoin = 'round'; g.miterLimit = 2; g.lineWidth = sw; g.strokeStyle = '#000'; g.strokeText(text, x, y); g.fillText(text, x, y); }
function drawCaptions(O) {
  const c = cueAt(O); if (!c) return; const g = ctx; g.save(); g.textAlign = 'center'; g.fillStyle = '#fff';
  if (c.kind === 'shout') {
    const k = O - c.words[0].t; const s = k < 0.12 ? 0.6 + 4 * k : 1 + 0.04 * Math.sin(O * 50);
    const txt = c.words.map(w => w.w).join(' ');
    g.translate(W / 2 + Math.sin(O * 73) * 6, H * 0.6 + Math.cos(O * 61) * 5); g.scale(s, s); g.rotate(Math.sin(O * 9) * 0.03);
    let fs = 118; g.font = `800 ${fs}px Montserrat`; while (g.measureText(txt).width > W * 0.84 && fs > 60) { fs -= 4; g.font = `800 ${fs}px Montserrat`; }
    g.shadowColor = 'rgba(0,0,0,0.45)'; g.shadowBlur = 20; strokeText(g, txt, 0, 0, 16); g.restore(); return;
  }
  // word-by-word build-up in chunks of <=3 words, a chunk clears after punctuation
  const chunks = []; let cur = [];
  c.words.forEach((w, i) => { cur.push(w); if (cur.length >= 3 || /[.!?…,]$/.test(w.w) || i === c.words.length - 1) { chunks.push(cur); cur = []; } });
  let chunk = chunks[0]; for (const ch of chunks) if (O >= ch[0].t - 0.03) chunk = ch;
  const shown = chunk.filter(w => O >= w.t - 0.03).map(w => w.w.toUpperCase()).join(' ');
  if (!shown) { g.restore(); return; }
  let fs = 78; g.font = `800 ${fs}px Montserrat`; while (g.measureText(shown).width > W * 0.82 && fs > 44) { fs -= 3; g.font = `800 ${fs}px Montserrat`; }
  const nm = { hero: null, stranger: 'STRANGER', pigeon: 'PIGEON', anchor: 'NEWS ANCHOR', astro: 'ASTRONAUT', sun: 'THE SUN ☀️' }[c.speaker];
  strokeText(g, shown, W / 2, H * 0.62, 12);
  if (nm) { g.font = '700 30px InterW, "Noto Color Emoji"'; g.globalAlpha = 0.85; strokeText(g, nm, W / 2, H * 0.62 - fs - 8, 6); }
  g.restore();
}
function flapMouths(O, sh) {
  const c = cueAt(O); if (!c || O > c.end) return;
  const map = { hero: S[sh.scene] && S[sh.scene].hero, anchor: sh.scene === 'news' ? S.news.anchor : null, astro: sh.scene === 'space' ? S.space.astro : null };
  const P = map[c.speaker]; if (!P || !P.g.visible) return;
  if (c.kind === 'shout') { P.expr('shock'); P.mO.scale.set(1.25, 1.5 + 0.2 * Math.sin(O * 30), 1); return; }
  const open = Math.sin(O * 24) > -0.2;
  P.mO.visible = open; P.mC.visible = P.mL.visible = P.mR.visible = !open; P.mO.scale.set(0.9, 0.55 + 0.3 * Math.abs(Math.sin(O * 13)), 1);
}
function drawWatermark() {
  const g = ctx; g.save(); g.globalAlpha = 0.55; g.fillStyle = '#fff'; g.font = '700 26px InterW'; g.shadowColor = 'rgba(0,0,0,0.5)'; g.shadowBlur = 8;
  const t = 'POLYGRAM VIDEOS'; const w = spaced(mkMeasure2(), t, 0, 0, 5); spaced(g, t, (W - w) / 2, 140, 5); g.restore();
}
function mkMeasure2() { measC.font = '700 26px InterW'; return measC; }

// ---------------------------------------------------------------- grading / compositing
const GRADES = {
  night: { f: 'brightness(1.08) saturate(0.8) contrast(1.04)', tint: 'rgba(40,60,140,0.2)', mode: 'soft-light', vig: 0.45 },
  warmnight: { f: 'brightness(1.0) saturate(0.9)', tint: 'rgba(255,170,90,0.14)', mode: 'soft-light', vig: 0.45 },
  warm: { f: 'saturate(1.12) contrast(1.04)', tint: 'rgba(255,180,100,0.16)', mode: 'soft-light', vig: 0.35 },
  day: { f: 'saturate(1.12) contrast(1.04)', tint: null, vig: 0.28 },
  golden: { f: 'saturate(1.18) contrast(1.06)', tint: 'rgba(255,160,60,0.22)', mode: 'soft-light', vig: 0.35 },
  mono: { f: 'grayscale(1) contrast(1.4)', tint: null, vig: 0.15 },
  news: { f: 'saturate(1.1)', tint: null, vig: 0.3 },
  space: { f: 'saturate(1.1) contrast(1.05)', tint: null, vig: 0.45 },
  cosmic: { f: 'saturate(1.2) contrast(1.05)', tint: 'rgba(58,43,217,0.25)', mode: 'screen', vig: 0.4 },
  gold: { f: 'saturate(1.2) contrast(1.05)', tint: 'rgba(242,179,74,0.18)', mode: 'soft-light', vig: 0.4 },
};

function setCam(sh, T) {
  const c = sh.cam; const lt = clamp((T - sh.t0) / (sh.t1 - sh.t0)); const e = EASE[c.ease || 'out'](lt);
  const p = V(c.p0); if (c.p1) p.lerp(V(c.p1), e);
  const l = V(c.l0); if (c.l1) l.lerp(V(c.l1), e);
  if (c.follow) { const f = c.follow(T); p.add(f); l.add(f); }
  const shift = c.shift ?? 0.07; cam.setViewOffset(W, H, 0, -H * shift, W, H);
  cam.position.copy(p); cam.up.set(...(c.up || [0, 1, 0])); cam.lookAt(l);
  const z = lerp(c.z0 ?? 1, c.z1 ?? 1, e); const roll = lerp(c.roll0 ?? 0, c.roll1 ?? 0, e);
  cam.fov = 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(c.fov) / 2) / z) * 180 / Math.PI; cam.updateProjectionMatrix();
  cam.rotateZ(THREE.MathUtils.degToRad(roll));
  return lt;
}

export function renderFrame(O) {
  const T = warp(O);
  const sh = shots.find(s => T >= s.t0 && T < s.t1) || shots[shots.length - 1];
  const lt = setCam(sh, T);
  S.studio.sc.overrideMaterial = null; S.bedroom.glow.intensity = 0;
  sh.setup(lt, T); flapMouths(O, sh);
  const scn = S[sh.scene].sc;
  if (sh.scene === 'bedroom') { const B = S.bedroom; const hp = new THREE.Vector3(); B.hero.phone.children[1].getWorldPosition(hp); B.glow.position.copy(hp).add(new THREE.Vector3(0, 0.1, 0.25)); if (B.hero.phone.visible) { B.glow.intensity = 3; B.glow.distance = 3.5; } }
  renderer.render(scn, cam);

  // scene layer: DOF + bloom
  const gr = GRADES[sh.grade] || GRADES.day;
  sctx.globalCompositeOperation = 'source-over'; sctx.filter = 'none';
  if (sh.dof) {
    smctx.filter = 'blur(2.5px)'; smctx.drawImage(glc, 0, 0, 270, 480); smctx.filter = 'none';
    sctx.drawImage(smallC, 0, 0, W, H);
    shctx.globalCompositeOperation = 'source-over'; shctx.clearRect(0, 0, W, H); shctx.drawImage(glc, 0, 0);
    shctx.globalCompositeOperation = 'destination-in';
    const rg = shctx.createRadialGradient(W / 2, H * 0.47, W * 0.2 * (1 - sh.dof * 0.3), W / 2, H * 0.47, W * 0.85 * (1 - sh.dof * 0.3));
    rg.addColorStop(0, 'rgba(0,0,0,1)'); rg.addColorStop(1, 'rgba(0,0,0,0)'); shctx.fillStyle = rg; shctx.fillRect(0, 0, W, H);
    sctx.drawImage(sharpC, 0, 0);
  } else sctx.drawImage(glc, 0, 0);
  if (sh.bloom) {
    smctx.filter = 'blur(6px) brightness(1.3)'; smctx.drawImage(sceneC, 0, 0, 270, 480); smctx.filter = 'none';
    sctx.globalCompositeOperation = 'lighter'; sctx.globalAlpha = sh.bloom; sctx.drawImage(smallC, 0, 0, W, H); sctx.globalAlpha = 1; sctx.globalCompositeOperation = 'source-over';
  }
  // grade
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  ctx.filter = gr.f; ctx.drawImage(sceneC, 0, 0); ctx.filter = 'none';
  if (gr.tint) { ctx.globalCompositeOperation = gr.mode; ctx.fillStyle = gr.tint; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over'; }
  const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, `rgba(0,0,0,${gr.vig})`); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  // top scrim for stat legibility
  if (!sh.hideStat && T >= STEPS[0].t) { const sg = ctx.createLinearGradient(0, 180, 0, 640); sg.addColorStop(0, 'rgba(0,0,0,0.28)'); sg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = sg; ctx.fillRect(0, 180, W * 0.75, 460); }

  // overlays
  if (sh.mag) drawMag(T);
  if (sh.news) drawNews(T);
  if (sh.comments) drawComments(T);
  drawHook(T); drawStat(T, sh); drawItalic(T); drawCaptions(O); drawWatermark();
  // flash frames (white, 3 frames)
  for (const s of shots) if (s.flash !== undefined) { const d = (T - s.flash) * 30; if (d >= 0 && d < 3) { ctx.fillStyle = `rgba(255,255,255,${[0.95, 0.6, 0.25][Math.floor(d)]})`; ctx.fillRect(0, 0, W, H); } }
  return out.toDataURL('image/jpeg', 0.94);
}

export const TIMELINE = { STEPS, MONTAGE, SILENCE, FINAL_LINE, DUR, DUR_OUT, WARP, flashes: shots.filter(s => s.flash !== undefined).map(s => s.flash), cuts: shots.map(s => s.t0) };
window.renderFrame = renderFrame; window.S = S; window.THREE = THREE; window.TIMELINE = TIMELINE;
fetch('dialogue.json').then(r => r.json()).then(d => { DIALOGUE = d; }).then(() => document.fonts.load('800 78px Montserrat')).then(() => document.fonts.load('500 128px Lora')).then(() => Promise.all(['400 78px Lora', 'italic 400 54px Lora', '600 30px InterW', '700 30px InterW', '40px "Noto Color Emoji"'].map(f => document.fonts.load(f)))).then(() => { window.READY = true; });
