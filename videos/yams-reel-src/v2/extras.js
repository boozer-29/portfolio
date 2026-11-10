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
  M.ecl = grp(0, 34, 70, M.sc); const cor = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex('rgba(255,250,225,1)', 'rgba(255,205,120,0.55)'), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); cor.scale.setScalar(46); M.ecl.add(cor);
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
  lightRig(sc, { sky: 0xe8f2ff, ground: 0xa8bcd8, hemi: 0.5, keyC: 0xfff4e6, key: 1.9, keyPos: [8, 14, 10], target: [0, 2, -2], rim: 0.5, rimC: 0xbfe0ff, rimPos: [-6, 5, -8], env: 0.4, R: 16 });
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
  P.alien = makeRig({ hood: 0x2a2f3a, hoodD: 0x1c2029, pants: 0x2a2f3a, skin: 0x7ed957, hairStyle: 'none', noHood: true, hair: 0x4c9a2f }); P.alien.root.scale.setScalar(0.62); P.alien.root.position.set(0, -0.62, 0); ufo.add(P.alien.root);
  P.alien.head.add(rbox(0.04, 0.26, 0.04, mat(0x4c9a2f), 0, 0.76, 0)); P.alien.head.add(ball(0.07, mat(0xffe24d, { emissive: 0xffd21f, emissiveIntensity: 1.5 }), 0, 0.92, 0, undefined, 12)); P.alien.root.add(rbox(0.5, 0.08, 0.3, mat(0xffd23f), 0, 1.72, 0.2));
  const pad = grp(0, -0.5, 0.08, P.alien.arms[0].el); pad.add(rbox(0.26, 0.34, 0.04, mat(0xffe27a))); pad.rotation.x = -1.1;
  const tT = canvasTex(512, 660, (g, w, h) => { g.fillStyle = '#ffd83a'; g.fillRect(0, 0, w, h); g.fillStyle = '#1b1b1f'; g.fillRect(0, 0, w, 120); g.fillStyle = '#ffd83a'; g.font = 'bold 54px sans-serif'; g.textAlign = 'center'; g.fillText('PARKING', w / 2, 58); g.fillText('VIOLATION', w / 2, 108);
    g.fillStyle = '#1b1b1f'; g.textAlign = 'left'; g.font = 'bold 34px sans-serif'; [['VEHICLE:', '2 YAMS'], ['ZONE:', 'MILKY WAY B'], ['OFFENCE:', 'DOUBLE PARKED'], ['FINE:', '500 STARS']].forEach(([a, b], i) => { g.fillText(a, 34, 200 + i * 86); g.font = 'bold 44px sans-serif'; g.fillText(b, 34, 244 + i * 86); g.font = 'bold 34px sans-serif'; });
    for (let i = 0; i < 40; i++) { g.fillRect(34 + i * 11, 570, (i * 7) % 3 ? 4 : 8, 60); } });
  P.ticket = new THREE.Mesh(new THREE.PlaneGeometry(5.1, 6.6), new THREE.MeshStandardMaterial({ map: tT, roughness: 0.6, side: THREE.DoubleSide })); P.ticket.visible = false; P.sc.add(P.ticket);
  P.girl = makeRig(STR); P.girl.root.scale.setScalar(0.85); P.sc.add(P.girl.root);
}
