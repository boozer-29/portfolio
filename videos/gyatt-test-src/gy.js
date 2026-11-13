// Animation test v2: upgraded rig (elbows/knees/spine), squash & stretch, blinks, expressions, camera shake.
import * as THREE from 'three';
const W = 540, H = 960, DUR = 6.6;
const glc = document.getElementById('c'); glc.width = W; glc.height = H;
const R = new THREE.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true });
R.setPixelRatio(1); R.setSize(W, H, false); R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap;
R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.1; R.outputColorSpace = THREE.SRGBColorSpace;

const M = {}; const mat = (c, o = {}) => M[c + JSON.stringify(o)] ||= new THREE.MeshStandardMaterial({ color: c, roughness: 0.8, flatShading: true, ...o });
function box(w, h, d, c, x = 0, y = 0, z = 0, o) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c, o)); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; return m; }
const grp = (x = 0, y = 0, z = 0, parent) => { const g = new THREE.Group(); g.position.set(x, y, z); if (parent) parent.add(g); return g; };
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t;
const eOut = t => 1 - Math.pow(1 - t, 3), eIO = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const elastic = t => t <= 0 ? 0 : t >= 1 ? 1 : Math.pow(2, -9 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI) / 3) + 1;
const seg = (t, a, b) => clamp((t - a) / (b - a));

// ---------------- hero rig v2
const C = { hood: 0xD7262E, hoodD: 0x9e1a21, jeans: 0x4a5d8a, jeansD: 0x3a4a70, skin: 0xE7B289, hair: 0x2a1d17, shoe: 0x23232a };
function makeHero() {
  const root = grp(); const hips = grp(0, 0.92, 0, root);
  hips.add(box(0.74, 0.3, 0.44, C.jeans, 0, 0, 0));
  hips.add(box(0.76, 0.06, 0.46, 0x2b2b30, 0, 0.13, 0));            // belt
  const glute = grp(0, -0.03, -0.12, hips);                          // grows backwards from the hips
  const gL = box(0.36, 0.34, 0.3, C.jeans, -0.18, 0, -0.14); const gR = box(0.36, 0.34, 0.3, C.jeans, 0.18, 0, -0.14);
  glute.add(gL, gR); const seam = box(0.03, 0.3, 0.31, C.jeansD, 0, 0, -0.14); glute.add(seam);
  const pocketL = box(0.14, 0.1, 0.02, C.jeansD, -0.18, 0.06, -0.3), pocketR = box(0.14, 0.1, 0.02, C.jeansD, 0.18, 0.06, -0.3); glute.add(pocketL, pocketR);
  const flaps = [box(0.16, 0.18, 0.04, C.jeans, -0.05, -0.05, -0.31), box(0.16, 0.18, 0.04, C.jeans, 0.05, -0.05, -0.31)];
  flaps.forEach(f => { f.visible = false; glute.add(f); });
  const boxers = box(0.1, 0.2, 0.02, 0xff5c8a, 0, -0.04, -0.295); boxers.visible = false; glute.add(boxers);   // cartoon polka boxers peek
  const legs = [];
  for (const sx of [-1, 1]) {
    const thigh = grp(sx * 0.18, -0.1, 0, hips); thigh.add(box(0.29, 0.42, 0.31, C.jeans, 0, -0.21, 0));
    const knee = grp(0, -0.42, 0, thigh); knee.add(box(0.27, 0.38, 0.29, C.jeans, 0, -0.19, 0)); knee.add(box(0.29, 0.12, 0.42, C.shoe, 0, -0.42, 0.05));
    legs.push({ thigh, knee });
  }
  const spine = grp(0, 0.14, 0, hips);
  spine.add(box(0.78, 0.74, 0.46, C.hood, 0, 0.37, 0)); spine.add(box(0.5, 0.18, 0.05, C.hoodD, 0, 0.18, 0.24));
  spine.add(box(0.68, 0.26, 0.16, C.hoodD, 0, 0.74, -0.2));
  const strings = [grp(-0.09, 0.66, 0.24, spine), grp(0.09, 0.66, 0.24, spine)]; strings.forEach(s => s.add(box(0.04, 0.2, 0.03, 0xf2f2f2, 0, -0.1, 0)));
  const arms = [];
  for (const sx of [-1, 1]) {
    const sh = grp(sx * 0.5, 0.64, 0, spine); sh.add(box(0.23, 0.38, 0.27, C.hood, 0, -0.19, 0));
    const el = grp(0, -0.38, 0, sh); el.add(box(0.22, 0.32, 0.26, C.hood, 0, -0.16, 0)); el.add(box(0.2, 0.17, 0.22, C.skin, 0, -0.4, 0));
    arms.push({ sh, el });
  }
  const neck = grp(0, 0.76, 0, spine); const head = grp(0, 0.04, 0, neck);
  head.add(box(0.66, 0.64, 0.6, C.skin, 0, 0.32, 0));
  head.add(box(0.7, 0.17, 0.64, C.hair, 0, 0.68, -0.01)); head.add(box(0.7, 0.13, 0.12, C.hair, 0, 0.58, 0.27));
  head.add(box(0.08, 0.32, 0.52, C.hair, -0.33, 0.5, -0.05)); head.add(box(0.08, 0.32, 0.52, C.hair, 0.33, 0.5, -0.05)); head.add(box(0.7, 0.44, 0.1, C.hair, 0, 0.44, -0.29));
  const eyes = [], pupils = [], lids = [], brows = [];
  for (const sx of [-1, 1]) {
    const e = box(0.15, 0.15, 0.03, 0xffffff, sx * 0.15, 0.36, 0.305); e.castShadow = false; head.add(e); eyes.push(e);
    const p = box(0.08, 0.1, 0.02, 0x15110f, sx * 0.15, 0.35, 0.325); p.castShadow = false; head.add(p); pupils.push(p);
    const l = box(0.17, 0.16, 0.035, C.skin, sx * 0.15, 0.44, 0.31); l.castShadow = false; l.scale.y = 0.01; head.add(l); lids.push(l);
    const b = grp(sx * 0.15, 0.49, 0.315, head); b.add(box(0.19, 0.045, 0.03, C.hair)); brows.push(b);
  }
  const mouth = grp(0, 0.15, 0.305, head);
  const mLine = box(0.18, 0.04, 0.02, 0x4a1f1a), mO = box(0.14, 0.15, 0.02, 0x3a1512), mGrin = box(0.26, 0.09, 0.02, 0x3a1512), teeth = box(0.24, 0.05, 0.022, 0xffffff, 0, 0.01, 0.002);
  const cL = box(0.06, 0.04, 0.02, 0x4a1f1a, -0.11, 0, 0), cR = box(0.06, 0.04, 0.02, 0x4a1f1a, 0.11, 0, 0);
  [mLine, mO, mGrin, teeth, cL, cR].forEach(m => { m.castShadow = false; mouth.add(m); });
  const P = { root, hips, glute, gL, gR, flaps, boxers, legs, spine, strings, arms, neck, head, eyes, pupils, lids, brows, mouth, mLine, mO, mGrin, teeth, cL, cR };
  P.face = (expr, t) => {
    [mLine, mO, mGrin, teeth, cL, cR].forEach(m => m.visible = false); brows.forEach(b => { b.rotation.z = 0; b.position.y = 0.49; });
    pupils.forEach((p, i) => { p.scale.set(1, 1, 1); p.position.set((i ? 1 : -1) * 0.15, 0.35, 0.325); });
    if (expr === 'calm') { mLine.visible = cL.visible = cR.visible = true; cL.position.y = cR.position.y = 0.02; cL.rotation.z = -0.3; cR.rotation.z = 0.3; }
    if (expr === 'shock') { mO.visible = true; brows.forEach(b => b.position.y = 0.55); pupils.forEach(p => p.scale.set(0.6, 0.6, 1)); }
    if (expr === 'grit') { mGrin.visible = teeth.visible = true; brows[0].rotation.z = -0.35; brows[1].rotation.z = 0.35; brows.forEach(b => b.position.y = 0.46); }
    if (expr === 'worried') { mLine.visible = true; cL.visible = cR.visible = true; cL.position.y = cR.position.y = -0.02; cL.rotation.z = 0.3; cR.rotation.z = -0.3; brows[0].rotation.z = 0.35; brows[1].rotation.z = -0.35; }
    // eye darts and blinks (secondary acting)
    const dart = Math.sin(t * 2.3) > 0.7 ? 0.035 : Math.sin(t * 1.7) < -0.8 ? -0.03 : 0;
    pupils.forEach(p => p.position.x += dart);
    const bl = [0.35, 2.05, 3.4, 5.9].some(b => t > b && t < b + 0.12) ? 1 : 0;
    lids.forEach(l => { l.scale.y = bl ? 1 : 0.01; l.position.y = bl ? 0.37 : 0.44; });
  };
  return P;
}
// pose helper: angles in radians
function pose(P, p) {
  P.spine.rotation.set(p.spineX || 0, p.spineY || 0, p.spineZ || 0); P.neck.rotation.set(p.headX || 0, p.headY || 0, p.headZ || 0);
  P.hips.position.y = 0.92 + (p.bob || 0); P.hips.rotation.set(p.hipX || 0, p.hipY || 0, p.hipZ || 0);
  const a = p.arms || [[0, 0, 0.12, 0.1], [0, 0, -0.12, 0.1]];
  P.arms.forEach((A, i) => { A.sh.rotation.set(a[i][0], a[i][1], a[i][2]); A.el.rotation.set(-(a[i][3] || 0), 0, 0); });
  const l = p.legs || [[0, 0], [0, 0]];
  P.legs.forEach((L, i) => { L.thigh.rotation.set(-l[i][0], 0, 0); L.knee.rotation.set(l[i][1], 0, 0); });
}
function walk(t, speed = 7, amp = 1) {
  const s = Math.sin(t * speed), c = Math.cos(t * speed);
  return { bob: Math.abs(c) * 0.04 * amp, spineX: 0.05, spineY: s * 0.08 * amp,
    legs: [[s * 0.55 * amp, Math.max(0, -s) * 0.9 * amp + 0.05], [-s * 0.55 * amp, Math.max(0, s) * 0.9 * amp + 0.05]],
    arms: [[-s * 0.5 * amp, 0, 0.12, 0.35 + Math.max(0, s) * 0.4], [s * 0.5 * amp, 0, -0.12, 0.35 + Math.max(0, -s) * 0.4]] };
}

// ---------------- set: bedroom + doorway
const sc = new THREE.Scene(); sc.background = new THREE.Color(0xf1d9b8); sc.fog = new THREE.Fog(0xf1d9b8, 14, 30);
sc.add(new THREE.HemisphereLight(0xfff3e0, 0x6b4a3a, 1.05));
const sun = new THREE.DirectionalLight(0xffe2b0, 2.4); sun.position.set(-5, 8, 6); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8 }); sun.shadow.radius = 5; sun.shadow.bias = -0.0004; sc.add(sun);
const fill = new THREE.DirectionalLight(0x9fb8ff, 0.6); fill.position.set(6, 3, -4); sc.add(fill);
sc.add(box(30, 0.2, 30, 0xc79a6b, 0, -0.1, 0));                          // wood floor
for (let i = -14; i < 14; i += 1.2) sc.add(box(0.03, 0.01, 30, 0xa97f55, i, 0.005, 0));
const wallZ = -2.2;                                                       // back wall
sc.add(box(30, 6, 0.2, 0xe9d7bd, 0, 3, wallZ - 2));
// partition wall with doorway (door gap 1.25 wide at x = 2.6)
const DX = 2.6, DWID = 1.25, wall = grp(0, 0, 0, sc);
wall.add(box(6, 4.2, 0.3, 0xdcc6a6, DX - DWID / 2 - 3, 2.1, 0)); wall.add(box(6, 4.2, 0.3, 0xdcc6a6, DX + DWID / 2 + 3, 2.1, 0)); wall.add(box(DWID, 1.6, 0.3, 0xdcc6a6, DX, 3.4, 0));
const frameL = box(0.12, 2.6, 0.36, 0x8a5a3a, DX - DWID / 2 + 0.06, 1.3, 0), frameR = box(0.12, 2.6, 0.36, 0x8a5a3a, DX + DWID / 2 - 0.06, 1.3, 0), frameT = box(DWID, 0.12, 0.36, 0x8a5a3a, DX, 2.6, 0);
sc.add(frameL, frameR, frameT);
sc.add(box(1.6, 0.9, 0.7, 0x6b4a33, -1.6, 0.45, -2.6)); sc.add(box(0.5, 0.6, 0.05, 0xd7262e, -0.4, 2.4, -4.08)); sc.add(box(0.9, 1.2, 0.05, 0x4f6fb8, 4.6, 2.2, -4.08));
// debris pool
const debris = []; for (let i = 0; i < 26; i++) { const d = box(0.07 + (i % 3) * 0.03, 0.07, 0.07, i % 4 ? C.jeans : 0x8a5a3a); d.visible = false; sc.add(d); debris.push({ m: d, v: new THREE.Vector3(), r: new THREE.Vector3(Math.random(), Math.random(), Math.random()) }); }
const hero = makeHero(); sc.add(hero.root);

// ---------------- timeline
const cam = new THREE.PerspectiveCamera(40, W / H, 0.05, 100);
function shake(t, t0, amt) { const k = clamp(1 - (t - t0) / 0.45); if (t < t0 || k <= 0) return 0; return amt * k * k; }
function debrisBurst(t, t0, origin, n0, n1, spread) {
  for (let i = n0; i < n1; i++) { const D = debris[i]; const dt = t - t0; if (dt < 0 || dt > 1.4) { D.m.visible = false; continue; }
    const a = i * 2.39, sp = spread * (0.6 + (i % 5) * 0.12);
    D.m.visible = true; D.m.position.set(origin.x + Math.cos(a) * sp * dt, Math.max(0.04, origin.y + (2.2 + (i % 3)) * dt - 4.9 * dt * dt), origin.z + Math.sin(a) * sp * dt * 0.6 - 0.4 * dt);
    D.m.rotation.set(D.r.x * dt * 12, D.r.y * dt * 12, D.r.z * dt * 12); }
}
window.renderFrame = (t) => {
  debris.forEach(d => d.m.visible = false);
  hero.root.position.set(0, 0, 0); hero.root.rotation.set(0, 0, 0); hero.flaps.forEach(f => f.visible = false); hero.boxers.visible = false;
  frameL.rotation.set(0, 0, 0); frameR.rotation.set(0, 0, 0); frameT.rotation.set(0, 0, 0); frameL.position.x = DX - DWID / 2 + 0.06; frameR.position.x = DX + DWID / 2 - 0.06; frameT.position.y = 2.6;
  // glute size: 1 -> 2 at the "doubling" beat (elastic overshoot = squash & stretch), then grows a bit more while stuck
  const g = 1 + elastic(seg(t, 0.85, 1.6)) + 0.15 * seg(t, 3.4, 4.8);
  hero.glute.scale.set(g, lerp(1, g, 0.85) * (1 + 0.08 * Math.sin(seg(t, 0.85, 1.4) * Math.PI * 3) * (1 - seg(t, 0.85, 1.6))), g);
  let sh = 0, roll = 0;
  if (t < 2.25) {           // SHOT 1 - the doubling: anticipation, pop, rip
    hero.root.position.set(0, 0, 0.4); hero.root.rotation.y = 1.05;
    const ant = seg(t, 0.45, 0.85), pop = seg(t, 0.85, 1.25), settle = seg(t, 1.25, 2.2);
    pose(hero, { bob: -0.06 * ant + 0.1 * Math.sin(pop * Math.PI), spineX: 0.12 * ant - 0.25 * Math.sin(pop * Math.PI) + 0.05 * settle,
      arms: [[-0.2 * ant - 2.4 * pop * (1 - settle * 0.6), 0, 0.2 + 1.2 * pop, 0.3 + 0.8 * pop], [-0.2 * ant - 2.2 * pop * (1 - settle * 0.6), 0, -0.2 - 1.2 * pop, 0.3 + 0.8 * pop]],
      legs: [[0.15 * ant, 0.3 * ant], [0.15 * ant, 0.3 * ant]], headX: -0.25 * pop, headY: -0.6 * settle });
    hero.face(t < 0.85 ? 'calm' : 'shock', t);
    if (t > 0.92) { hero.flaps.forEach((f, i) => { f.visible = true; f.rotation.set(-0.9 * eOut(seg(t, 0.92, 1.2)), (i ? 0.6 : -0.6) * eOut(seg(t, 0.92, 1.2)), 0); }); hero.boxers.visible = true; }
    debrisBurst(t, 0.92, new THREE.Vector3(-0.5, 0.95, 0.2), 0, 12, 1.6);
    sh = shake(t, 0.9, 0.06);
    const k = eOut(seg(t, 0, 2.25));
    cam.position.set(lerp(-2.6, -2.3, k), 1.55, lerp(5.8, 5.2, k)); cam.lookAt(0.0, 1.05, 0.3); cam.fov = 40;
  } else if (t < 5.0) {     // SHOT 2 - walks to the doorway and gets stuck
    const lt = t - 2.25; const walkEnd = 1.3; const x = lerp(-0.6, DX - 0.05, eIO(clamp(lt / walkEnd)));
    hero.root.rotation.y = Math.PI / 2;  // walking +x, doorway is in the partition wall plane z=0 -> walk into it from z+? (walk along x into the wall gap)
    hero.root.rotation.y = 0; hero.root.position.set(DX, 0, lerp(1.7, -0.05, eIO(clamp(lt / walkEnd))));
    hero.root.rotation.y = Math.PI;      // facing -z, back (glute) toward camera
    if (lt < walkEnd) { pose(hero, walk(lt, 8, 1)); hero.face('calm', t); }
    else {                                 // stuck: hips jam, upper body keeps going, struggle wiggle
      const st = lt - walkEnd; const jam = eOut(seg(st, 0, 0.15));
      hero.root.position.z = -0.05 + 0.12 * jam * Math.sin(seg(st, 0, 0.25) * Math.PI);
      const wig = Math.sin(st * 22) * (0.5 + 0.5 * seg(st, 0.3, 1.2));
      pose(hero, { spineX: 0.35 * jam, hipZ: wig * 0.06, hipY: wig * 0.08, bob: -0.03,
        arms: [[-1.3, 0, 0.9 + wig * 0.2, 0.6], [-1.3, 0, -0.9 - wig * 0.2, 0.6]], legs: [[0.35 + wig * 0.15, 0.4], [0.35 - wig * 0.15, 0.4]] });
      hero.face('grit', t);
      frameL.rotation.z = 0.06 * Math.sin(st * 22) * seg(st, 0.2, 1.0); frameR.rotation.z = -0.06 * Math.sin(st * 22 + 1) * seg(st, 0.2, 1.0);
      sh = shake(t, 2.25 + walkEnd, 0.04) + 0.008 * seg(st, 0.3, 1.3);
    }
    const k = eOut(clamp((t - 2.25) / 2.75));
    cam.position.set(lerp(DX + 2.8, DX + 2.1, k), lerp(1.8, 1.55, k), lerp(6.0, 4.4, k)); cam.lookAt(DX - 0.05, 1.05, 0.3); cam.fov = 44;
  } else {                  // SHOT 3 - pops through, frame flies, face-plant, reaction
    const lt = t - 5.0; const pop = eOut(seg(lt, 0, 0.35));
    hero.root.rotation.y = Math.PI; hero.root.position.set(DX, 0, lerp(-0.05, -0.8, pop));
    frameL.position.x = DX - DWID / 2 + 0.06 - 0.5 * pop; frameL.rotation.z = 0.7 * pop; frameR.position.x = DX + DWID / 2 - 0.06 + 0.5 * pop; frameR.rotation.z = -0.7 * pop; frameT.position.y = 2.6 + 0.3 * pop; frameT.rotation.x = 0.4 * pop;
    debrisBurst(t, 5.0, new THREE.Vector3(DX, 1.0, -0.2), 12, 26, 2.2);
    const fall = seg(lt, 0.25, 0.7);
    hero.root.rotation.x = -0.75 * eOut(fall); hero.root.position.y = 0.15 * Math.sin(fall * Math.PI) - 0.25 * eOut(fall);
    pose(hero, { arms: [[-2.6 + 1.3 * fall, 0, 0.6 - 0.3 * fall, 0.2], [-2.6 + 1.3 * fall, 0, -0.6 + 0.3 * fall, 0.2]], legs: [[0.9 * fall, 1.4 * fall], [0.9 * fall, 1.4 * fall]], headX: -1.05 * eOut(seg(lt, 0.7, 1.1)) });
    hero.face(lt < 0.7 ? 'shock' : 'worried', t);
    sh = shake(t, 5.0, 0.07) + shake(t, 5.6, 0.05);
    if (lt < 0.75) { cam.position.set(DX + 0.4, 1.5, 3.4); cam.lookAt(DX, 1.1, -0.6); cam.fov = 44; }
    else {                                 // reaction close-up from the floor
      const k = eOut(seg(lt, 0.75, 1.6));
      cam.position.set(DX + 0.3, lerp(1.0, 0.95, k), lerp(-4.0, -3.8, k)); cam.lookAt(DX, 1.15, -2.0); cam.fov = 42;
    }
  }
  // camera shake on impacts
  cam.updateProjectionMatrix(); cam.rotateZ(Math.sin(t * 61) * sh + roll); cam.rotateX(Math.sin(t * 47) * sh * 0.6); cam.rotateY(Math.cos(t * 53) * sh * 0.6);
  // hoodie strings: secondary motion
  hero.strings.forEach((s, i) => s.rotation.set(0.25 * Math.sin(t * 9 + i) * (0.3 + sh * 8), 0, 0.15 * Math.sin(t * 7 + i)));
  R.render(sc, cam);
  return glc.toDataURL('image/jpeg', 0.92);
};
window.READY = true;
