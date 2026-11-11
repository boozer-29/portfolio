{ // ---- street (Day 3): generators
  const sc = new THREE.Scene(); sc.add(skyDome('#4f86c8', '#9fd0f0', '#ffe9c0'));
  lightRig(sc, { sky: 0xe6f3ff, ground: 0x9a7e5a, hemi: 0.55, keyC: 0xfff0d8, key: 1.9, keyPos: [-8, 12, 10], target: [0, 0, 0], rim: 0.5, rimC: 0xbfe0ff, rimPos: [8, 5, -8], env: 0.45, R: 16 });
  sc.add(rbox(120, 0.2, 9, mat(0x59606e, { roughness: 0.7 }), 0, -0.1, 3.8)); sc.add(rbox(120, 0.22, 7, mat(0xcaa87a, { roughness: 0.9 }), 0, -0.09, -3.4)); for (let x = -40; x < 40; x += 3.2) sc.add(rbox(1.5, 0.02, 0.16, mat(0xffffff, { roughness: 0.4 }), x, 0.01, 3.8));
  const cols = [0xf4a259, 0x7ec8e3, 0xe9c46a, 0xf08a8a, 0xa8d5a2, 0xf2cf6b, 0xd9c7a0, 0xe8b4a0];
  const gens = [], lamps = [];
  for (let i = 0; i < 6; i++) { const x = -12 + i * 4.8; const h = house(sc, x, -9.4, 4.2, 3.4, 4.0, mat(cols[i], { roughness: 0.85 }), mat(0x8b5a3c, { roughness: 0.6 })); h.rotation.y = 0;
    const g = grp(x + 1.3, 0, -6.2, sc); g.add(rbox(1.1, 0.8, 0.75, mat(0xd8321f, { roughness: 0.4 }), 0, 0.5, 0)); g.add(rbox(1.14, 0.06, 0.8, mat(0x2a2a30), 0, 0.93, 0)); g.add(rbox(0.5, 0.45, 0.4, mat(0xf2c14e, { roughness: 0.4 }), -0.2, 0.74, 0)); T(g, cyl(0.07, 0.07, 0.8, mat(0x3a3a40), 0.45, 1.2, -0.2, 8)); g.add(rbox(0.1, 0.1, 0.1, mat(0x2bd96b, { emissive: 0x2bd96b, emissiveIntensity: 1.6 }), 0.42, 0.62, 0.4)); g.add(rbox(0.28, 0.1, 0.1, mat(0xfff3b0), 0.1, 0.12, 0.45)); gens.push(g);
    const lamp = rbox(0.5, 0.5, 0.06, mat(0xfff0b0, { emissive: 0xffe08a, emissiveIntensity: 1.6 }), x - 0.9, 2.3, -7.36); sc.add(lamp); lamps.push(lamp); const pl = new THREE.PointLight(0xffe08a, 0, 7, 1.6); pl.position.set(x - 0.9, 2.3, -6.8); sc.add(pl); lamp.userData.pl = pl; }
  [-14, -4, 6, 16].forEach(x => { sc.add(rbox(0.22, 7.0, 0.22, mat(0x7a5a3a, { roughness: 0.8 }), x, 3.5, -2.8)); sc.add(rbox(2.2, 0.14, 0.14, mat(0x7a5a3a), x, 6.5, -2.8)); });
  palm(sc, -17, -5, 1.2, 0.1); palm(sc, 22, -5, 1.2, -0.1);
  const smoke = [...Array(36)].map(() => { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), new THREE.MeshStandardMaterial({ color: 0x4a4a50, transparent: true, opacity: 0.4, roughness: 1, depthWrite: false })); m.castShadow = false; m.visible = false; sc.add(m); return m; });
  const people = [...Array(7)].map((_, i) => { const P = npc(i + 2); sc.add(P.root); return P; });
  const bus = grp(0, 0, 0, sc);
  const hero = makeRig({}); sc.add(hero.root);
  S.street = { sc, gens, lamps, smoke, people, hero };
}
{ // ---- lagoon (Day 4): water, canoe, fisherman, fish, the house on the shore
  const sc = new THREE.Scene(); sc.add(skyDome('#4f9be0', '#aee0f5', '#fff0cc'));
  lightRig(sc, { sky: 0xe6f6ff, ground: 0x4a88a8, hemi: 0.55, keyC: 0xfff0d8, key: 1.9, keyPos: [-6, 12, 12], target: [0, 0, 0], rim: 0.6, rimC: 0xbfe8ff, rimPos: [8, 4, -8], env: 0.55, R: 14 });
  const wGeo = new THREE.PlaneGeometry(160, 100, 80, 50); wGeo.rotateX(-Math.PI / 2); const wm = new THREE.Mesh(wGeo, new THREE.MeshStandardMaterial({ color: 0x2c93b8, roughness: 0.12, metalness: 0.25, envMapIntensity: 1.5, flatShading: true })); wm.receiveShadow = true; wm.position.set(0, -0.05, -20); sc.add(wm);
  const wp0 = wGeo.attributes.position.array.slice();
  sc.add(rbox(40, 0.4, 24, mat(0xd9b27a, { roughness: 0.95 }), 24, -0.15, 2)); sc.add(rbox(40, 0.5, 4, mat(0xc88b57, { roughness: 0.9 }), 22, 0.1, -9));
  const hs = house(sc, 14, -1.4, 6.2, 3.6, 5.0, mat(0xf2cf6b, { roughness: 0.85 }), mat(0x8b5a3c, { roughness: 0.6 }), -0.2); const shorePot = grp(9.4, 0, 3.6, sc); shorePot.add(cyl(0.7, 0.62, 1.1, mat(0xc9ced6, { roughness: 0.28, metalness: 0.9, envMapIntensity: 1.5 }), 0, 0.85, 0, 24)); shorePot.add(cyl(0.74, 0.74, 0.1, mat(0xc9ced6, { roughness: 0.28, metalness: 0.9 }), 0, 1.45, 0, 24)); shorePot.scale.setScalar(1.3);
  const lSteam = makeSteam(sc, 16, 0xfff3e2);
  [-22, 30, 8, 44].forEach((x, i) => sc.add(rbox(7 + i % 2 * 3, 14 + i * 5, 6, mat([0xbcd4e6, 0xaec6dc, 0xc9dcea, 0xb2cadf][i], { roughness: 0.2, metalness: 0.3 }), x - 8, 7 + i * 2.5, -52 - i * 6)));
  // stilt houses
  const stilts = (x, z) => { const g = grp(x, 0, z, sc); [[-1, -0.7], [1, -0.7], [-1, 0.7], [1, 0.7]].forEach(([a, b]) => g.add(cyl(0.07, 0.07, 1.6, mat(0x6e4a2e), a, 0.3, b, 6))); g.add(rbox(2.6, 1.1, 2.0, mat([0xe9c46a, 0x8fd1e0, 0xe8a0a0][Math.abs(Math.round(x)) % 3], { roughness: 0.85 }), 0, 1.45, 0)); g.add(zinc(3.0, 2.4, 0, 2.15, 0, 0.0)); return g; };
  [[-14, -14], [-9, -17], [-18, -10], [-4, -19], [-22, -16]].forEach(([x, z]) => stilts(x, z));
  const canoe = grp(-2.4, 0.0, 1.6, sc); { const bm = mat(0x8a5a2c, { roughness: 0.6 }); canoe.add(rbox(3.6, 0.3, 1.0, bm, 0, 0.12, 0)); canoe.add(rbox(3.4, 0.35, 0.12, bm, 0, 0.35, 0.46)); canoe.add(rbox(3.4, 0.35, 0.12, bm, 0, 0.35, -0.46)); const bow = rbox(0.9, 0.3, 0.9, bm, 1.9, 0.3, 0); bow.rotation.z = 0.5; canoe.add(bow); const st = rbox(0.9, 0.3, 0.9, bm, -1.9, 0.3, 0); st.rotation.z = -0.5; canoe.add(st); T(canoe, rbox(0.08, 2.2, 0.08, mat(0xb07a42), 0.2, 1.1, -0.2)).rotation.z = 0.25; }
  const fman = makeRig({ hood: 0xe0b040, hoodD: 0xb98a2a, pants: 0x3b5fa0, skin: 0x6b4128, hairStyle: 'none', noHood: true, shoe: 0x6b4128 }); { const hat = cone(0.78, 0.38, mat(0xd9b66a, { roughness: 0.7 }), 0, 0.88, 0, 24); hat.castShadow = true; fman.head.add(hat); fman.head.add(cyl(0.8, 0.8, 0.05, mat(0xc9a55a, { roughness: 0.7 }), 0, 0.7, 0, 24)); } sc.add(fman.root); const fPlate = plate(0.42); fman.arms[1].el.add(fPlate); fPlate.position.set(0, -0.55, 0.15); fPlate.rotation.x = -1.3;
  const fish = [...Array(14)].map((_, i) => { const g = grp(0, 0, 0, sc); const col = [0xffa63d, 0x8fd3ff, 0xffd23f][i % 3]; const bm = mat(col, { roughness: 0.2, metalness: 0.5, envMapIntensity: 1.4 }); const bd = ball(0.34, bm, 0, 0, 0, undefined, 16); bd.scale.set(1.8, 0.85, 0.65); g.add(bd); const tail = rbox(0.3, 0.8, 0.08, bm, -0.7, 0, 0); tail.rotation.z = 0.2; g.add(tail); g.scale.setScalar(1.35); g.add(ball(0.06, mat(0x111111), 0.45, 0.08, 0.17, undefined, 8)); g.add(rbox(0.3, 0.2, 0.06, bm, 0.0, 0.26, 0)); g.visible = false; return g; });
  const splash = [...Array(24)].map(() => { const m = ball(0.07, new THREE.MeshStandardMaterial({ color: 0xe8fbff, transparent: true, opacity: 0.8, roughness: 0.1 }), 0, 0, 0, undefined, 8); m.castShadow = false; m.visible = false; sc.add(m); return m; });
  const hero = makeRig({}); sc.add(hero.root);
  S.lagoon = { hero, sc, wGeo, wp0, canoe, fman, fPlate, fish, splash, lSteam, shorePot, hs };
}
{ // ---- aerial (Day 5): Lagos from the sky, the orange jollof cloud, the plane
  const sc = new THREE.Scene(); sc.add(skyDome('#2b6fc4', '#8cc8f0', '#ffe3b8', 190));
  lightRig(sc, { sky: 0xe6f3ff, ground: 0xc9a46a, hemi: 0.6, keyC: 0xfff2dc, key: 1.9, keyPos: [-20, 40, 20], target: [0, 0, 0], env: 0.55, R: 60, rim: 0.6, rimC: 0xffc080, rimPos: [30, 6, -30] });
  sc.add(rbox(600, 0.3, 600, mat(0x2c93b8, { roughness: 0.12, metalness: 0.2, envMapIntensity: 1.5 }), 0, -0.2, 0)); sc.add(rbox(260, 0.5, 120, mat(0xc9a46a, { roughness: 0.95 }), -40, 0.0, -50)); sc.add(rbox(120, 0.5, 30, mat(0xc9a46a, { roughness: 0.95 }), 70, 0.0, -40));
  const bl = new THREE.InstancedMesh(rgeo(1, 1, 1), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 }), 900); bl.frustumCulled = false; const br = rnd(8); const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion();
  for (let i = 0; i < 900; i++) { const x = -150 + br() * 300 - (br() < 0.5 ? 0 : 0), z = -108 + br() * 100; const h = 1 + br() * br() * 9; const w = 1.6 + br() * 3; m4.compose(V([x, h / 2, z]), q4, V([w, h, w])); bl.setMatrixAt(i, m4); bl.setColorAt(i, new THREE.Color([0xe8d2a0, 0xd9c7a0, 0xf4a259, 0x7ec8e3, 0xe9c46a, 0xf08a8a, 0xffffff][Math.floor(br() * 7)])); } sc.add(bl);
  sc.add(rbox(4, 0.5, 90, mat(0x6a6f78, { roughness: 0.6 }), 20, 1.2, -10).translateX(0)); // bridge over the lagoon
  const cloud = grp(-10, 0, -40, sc); const cm = new THREE.MeshStandardMaterial({ color: 0xff9a3c, roughness: 0.9, emissive: 0xff7a1a, emissiveIntensity: 0.1, transparent: true, opacity: 0.92 }); const cm2 = new THREE.MeshStandardMaterial({ color: 0xffd08a, roughness: 0.9, emissive: 0xffa040, emissiveIntensity: 0.08, transparent: true, opacity: 0.9 });
  const cr = rnd(3); for (let i = 0; i < 38; i++) { const a = cr() * 6.28, r = Math.sqrt(cr()) * 26, y = 10 + cr() * 34; const s = 6 + cr() * 9 * (1 - y / 70); const b = ball(s, i % 3 ? cm : cm2, Math.cos(a) * r * (0.5 + y / 70), y, Math.sin(a) * r * (0.5 + y / 70), undefined, 20); b.castShadow = false; cloud.add(b); }
  cloud.add(cyl(5, 8, 24, cm, 0, 12, 0, 20)).castShadow = false;
  const hazeC = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex('rgba(255,170,80,0.45)', 'rgba(255,140,40,0.15)'), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); hazeC.scale.setScalar(150); hazeC.position.set(0, 30, 6); cloud.add(hazeC);
  const plane = grp(0, 0, 0, sc); { const wm = mat(0xf7f9fc, { roughness: 0.25, metalness: 0.2 }), gm = mat(0x1f8f4a, { roughness: 0.3 }); const fu = cyl(1.3, 1.3, 11, wm, 0, 0, 0, 24); fu.rotation.z = Math.PI / 2; plane.add(fu); const nose = ball(1.3, wm, 5.5, 0, 0, undefined, 24); plane.add(nose); const tailc = cone(1.3, 3.2, wm, -6.9, 0.3, 0, 24); tailc.rotation.z = Math.PI / 2; plane.add(tailc);
    plane.add(rbox(10.5, 0.14, 0.6, gm, 0.2, 0.2, 0)); const wing = rbox(2.8, 0.18, 12, wm, -0.2, -0.45, 0); plane.add(wing); const wing2 = rbox(1.4, 0.12, 4.6, wm, -6.3, 0.2, 0); plane.add(wing2); const fin = rbox(2.2, 2.4, 0.16, gm, -6.0, 1.9, 0); fin.rotation.z = 0.35; plane.add(fin); [-3.4, 3.4].forEach(z => { const en = cyl(0.42, 0.42, 1.4, mat(0xc9ced6, { metalness: 0.7, roughness: 0.3 }), 0.8, -0.95, z, 16); en.rotation.z = Math.PI / 2; plane.add(en); });
    for (let i = 0; i < 10; i++) plane.add(rbox(0.28, 0.3, 0.05, mat(0x2b3a52), 3.8 - i * 0.62, 0.55, 1.29)), plane.add(rbox(0.28, 0.3, 0.05, mat(0x2b3a52), 3.8 - i * 0.62, 0.55, -1.29)); plane.add(rbox(1.0, 0.45, 0.06, mat(0x2b3a52), 5.0, 0.55, 1.2)); plane.add(rbox(1.0, 0.45, 0.06, mat(0x2b3a52), 5.0, 0.55, -1.2)); }
  const contrail = [...Array(14)].map(() => { const m = ball(1, new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.5, roughness: 1, depthWrite: false }), 0, 0, 0, undefined, 10); m.castShadow = false; sc.add(m); return m; });
  const clouds = []; [[-60, 55, -70, 4], [70, 60, -30, 5], [-80, 40, 20, 4], [30, 70, -90, 6], [95, 35, 10, 4]].forEach(a => { const c = cloud0(...a); sc.add(c); clouds.push(c); });
  S.aerial = { sc, cloud, plane, contrail, hazeC };
}
function cloud0(x, y, z, s = 1) { return cloud(x, y, z, s); }
{ // ---- cockpit (Day 5)
  const sc = new THREE.Scene(); sc.add(skyDome('#2b6fc4', '#8cc8f0', '#ffe3b8', 150));
  lightRig(sc, { sky: 0xe6f3ff, ground: 0x8a8070, hemi: 0.6, keyC: 0xfff2dc, key: 1.5, keyPos: [-3, 4, 6], target: [0, 1.2, 0], env: 0.5, R: 8, rim: 0.9, rimC: 0xffc080, rimPos: [4, 2, -6] });
  const dark = mat(0x23262e, { roughness: 0.6 }), grey = mat(0x4a505c, { roughness: 0.5 });
  sc.add(rbox(7, 0.3, 4, mat(0x30343c, { roughness: 0.8 }), 0, -0.15, 1.0)); sc.add(rbox(7, 0.6, 0.6, dark, 0, 2.7, -1.0));
  [-3.4, 3.4].forEach(x => sc.add(rbox(0.4, 3.0, 0.6, dark, x, 1.4, -1.0))); [-1.2, 1.2].forEach(x => { const f = rbox(0.12, 2.3, 0.14, dark, x, 1.6, -1.0); f.rotation.z = x * 0.04; sc.add(f); });
  sc.add(rbox(6.6, 0.9, 1.4, grey, 0, 0.45, -0.5)); for (let i = 0; i < 14; i++) sc.add(rbox(0.2, 0.12, 0.06, mat([0x2bd96b, 0xffb020, 0x5ac8ff][i % 3], { emissive: [0x2bd96b, 0xffb020, 0x5ac8ff][i % 3], emissiveIntensity: 1.2 }), -2.4 + i * 0.37, 0.95, -0.12));
  [-1.7, 1.7].forEach(x => { sc.add(rbox(1.3, 0.2, 1.3, mat(0x1a2236, { roughness: 0.6 }), x, 0.55, 1.5)); sc.add(rbox(1.3, 1.5, 0.22, mat(0x1a2236, { roughness: 0.6 }), x, 1.3, 2.2)); });
  const pilot = makeRig({ hood: 0xf4f6fa, hoodD: 0xdfe3ea, pants: 0x1a2236, skin: 0x7a4a2e, hair: 0x15100d, noHood: true, shoe: 0x15100d }); sc.add(pilot.root); { pilot.head.add(rbox(0.74, 0.18, 0.68, mat(0x1a2236, { roughness: 0.5 }), 0, 0.74, 0.0)); pilot.head.add(rbox(0.5, 0.05, 0.3, mat(0x1a2236), 0, 0.68, 0.42)); pilot.head.add(rbox(0.14, 0.14, 0.04, mat(0xffd23f, { metalness: 0.6, roughness: 0.3 }), 0, 0.78, 0.35)); pilot.head.add(rbox(0.74, 0.07, 0.07, mat(0x222222), 0, 0.5, 0)); [-1, 1].forEach(sx => pilot.head.add(rbox(0.12, 0.26, 0.18, mat(0x222222), sx * 0.36, 0.3, 0.02))); const mic = rbox(0.05, 0.05, 0.3, mat(0x222222), -0.32, 0.12, 0.26); mic.rotation.y = 0.3; pilot.head.add(mic); pilot.head.add(ball(0.06, mat(0x222222), -0.22, 0.12, 0.4, undefined, 8));
    [[0.2, -0.05, 0.06], [-0.2, -0.05, 0.06]].forEach(([x, y, z], k) => pilot.spine.add(rbox(0.1, 0.18, 0.05, mat(0xffd23f, { metalness: 0.5 }), k ? -0.28 : 0.28, 0.72, 0.24))); pilot.spine.add(rbox(0.16, 0.5, 0.05, mat(0x1a2236), 0, 0.4, 0.245)); }
  const copilot = makeRig({ hood: 0xf4f6fa, hoodD: 0xdfe3ea, pants: 0x1a2236, skin: 0x8d5a3b, hair: 0x15100d, noHood: true, shoe: 0x15100d }); copilot.head.add(rbox(0.74, 0.18, 0.68, mat(0x1a2236, { roughness: 0.5 }), 0, 0.74, 0.0)); sc.add(copilot.root);
  const wallM2 = mat(0x4a505c, { roughness: 0.6 }); sc.add(rbox(7, 3.8, 0.2, wallM2, 0, 1.9, 3.7)); sc.add(rbox(0.2, 1.3, 7, wallM2, -3.5, 0.65, 1.5)); sc.add(rbox(0.2, 1.1, 7, wallM2, -3.5, 3.25, 1.5)); sc.add(rbox(0.2, 3.8, 1.2, wallM2, -3.5, 1.9, 4.2)); sc.add(rbox(0.2, 1.7, 0.2, wallM2, -3.5, 2.0, 0.0)); sc.add(rbox(0.3, 0.2, 3.0, mat(0x2a2f38), -3.3, 0.5, 1.5));
  const cloudC = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex('rgba(255,170,80,0.95)', 'rgba(255,130,40,0.5)'), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); sc.add(cloudC);
  const cb = [...Array(9)].map((_, i) => { const m = ball(7 + (i % 3) * 3, i % 2 ? new THREE.MeshStandardMaterial({ color: 0xff9a3c, roughness: 0.9, emissive: 0xff7a1a, emissiveIntensity: 0.4 }) : new THREE.MeshStandardMaterial({ color: 0xffd08a, roughness: 0.9, emissive: 0xffa040, emissiveIntensity: 0.35 }), 0, 0, 0, undefined, 18); m.castShadow = false; sc.add(m); return m; });
  S.cockpit = { sc, pilot, copilot, cloudC, cb };
}
