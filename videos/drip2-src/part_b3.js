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
  sc.add(rbox(0.1, 2.4, 1.1, mat(0x3a1a14, { roughness: 0.7 }), 2.18, 1.2, 1.4)); [[-2.15, 3.5, -1, 0xffd6a0], [2.15, 3.2, -8, 0xffd6a0]].forEach(([x, y, z, c]) => practical(sc, x, y, z, c, { i: 45, d: 12, r: 0.12 })); practical(sc, 0.3, 3.4, 0.6, 0xe8f0ff, { i: 22, d: 9, r: 0.05 });
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
