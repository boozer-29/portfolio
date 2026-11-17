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
