// ---------------------------------------------------------------- sets
const tileTex = (a, b, n = 8) => { const t = ctex(256, 256, (g, w, h) => { const s = w / n; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { g.fillStyle = (i + j) % 2 ? a : b; g.fillRect(i * s, j * s, s, s); } }); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
const woodT = (base, seed) => { const t = ctex(256, 256, (g, w, h) => { g.fillStyle = base; g.fillRect(0, 0, w, h); const r2 = rnd(seed); for (let i = 0; i < 9; i++) { g.fillStyle = `rgba(0,0,0,${0.05 + r2() * 0.08})`; g.fillRect(0, i * 28 + 4, w, 3); } for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(255,255,255,${r2() * 0.05})`; g.fillRect(r2() * w, r2() * h, 30 + r2() * 60, 2); } }); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
const rainTex = (() => { const t = ctex(256, 512, (g, w, h) => { g.fillStyle = 'rgba(0,0,0,0)'; g.clearRect(0, 0, w, h); const r2 = rnd(77); for (let i = 0; i < 70; i++) { const x = r2() * w, y = r2() * h, l = 10 + r2() * 40; g.strokeStyle = `rgba(220,235,255,${0.25 + r2() * 0.4})`; g.lineWidth = 1 + r2() * 1.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 2, y + l); g.stroke(); } for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(230,240,255,${0.3 + r2() * 0.4})`; g.beginPath(); g.arc(r2() * w, r2() * h, 1.5 + r2() * 3, 0, 7); g.fill(); } }); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; })();
function rainyWindow(w, h) { const g = grp(); const out = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: ctex(64, 256, (gg, ww, hh) => { const gr = gg.createLinearGradient(0, 0, 0, hh); gr.addColorStop(0, '#9fb2c8'); gr.addColorStop(0.6, '#6d7f96'); gr.addColorStop(1, '#3a4656'); gg.fillStyle = gr; gg.fillRect(0, 0, ww, hh); }), toneMapped: false })); g.add(out);
  const r = rainTex.clone(); r.needsUpdate = true; r.repeat.set(w / 2, h / 2); const rain = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: r, transparent: true, depthWrite: false, toneMapped: false })); rain.position.z = 0.02; g.add(rain); g.rain = r; return g; }
const GLASS = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.02, metalness: 0, transmission: 0, transparent: true, opacity: 0.16, envMapIntensity: 2.2, depthWrite: false });
function signTex(txt, bg, fg, w = 512, h = 128, font = '800 70px InterW, Arial') { return ctex(w, h, (g) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = fg; g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, w / 2, h / 2 + 4); }); }
function signMesh(w, h, tex, glow = false) { return new THREE.Mesh(new THREE.PlaneGeometry(w, h), glow ? new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }) : new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 })); }
function npcs(sc, list) { return list.map(([i, o]) => { const P = npc(i, o || {}); sc.add(P.root); return P; }); }

{ // ---- BAKERY (title, Day 1, END). Counter along x at z 0; customers on +z; window wall at x -7.4 with rain; table by the window for Day 1
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x2a2018);
  const key = lightRig(sc, { env: 0.45, sky: 0xfff0dc, ground: 0x5a4030, hemi: 0.5, keyC: 0xffe0b0, key: 1.0, keyPos: [4, 9, 8], R: 10, target: [-1, 0, 1], rim: 0.5, rimC: 0x9fc4ff, rimPos: [-12, 5, 2] });
  const fl = new THREE.MeshStandardMaterial({ map: tileTex('#e9e2d4', '#2f2a26', 2), roughness: 0.35, envMapIntensity: 0.7 }); fl.map.repeat.set(9, 7); sc.add(rbox(18, 0.2, 14, fl, 0, -0.1, 1.5));
  const wallM = mat(0xe6c9a3, { roughness: 0.9 }), tileW = new THREE.MeshStandardMaterial({ map: tileTex('#f2efe8', '#e2ddd2', 6), roughness: 0.4 }); tileW.map.repeat.set(4, 2);
  sc.add(rbox(18, 5, 0.3, wallM, 0, 2.5, -3.1)); sc.add(rbox(16, 1.6, 0.05, tileW, 0, 1.9, -2.94));
  sc.add(rbox(0.3, 5, 4.2, wallM, -7.55, 2.5, -1.2)); sc.add(rbox(0.3, 0.9, 5.0, wallM, -7.55, 0.45, 3.4)); sc.add(rbox(0.3, 1.4, 5.0, wallM, -7.55, 4.3, 3.4)); sc.add(rbox(0.3, 5, 2.2, wallM, -7.55, 2.5, 7.0));
  sc.add(rbox(0.3, 5, 14, wallM, 7.55, 2.5, 1.5)); sc.add(rbox(18, 5, 0.3, wallM, 0, 2.5, 8.2));
  const win = rainyWindow(5.0, 2.7); win.position.set(-7.38, 2.25, 3.4); win.rotation.y = Math.PI / 2; sc.add(win); [0.9, 3.6].forEach(y => sc.add(rbox(0.2, 0.12, 5.1, mat(0xffffff), -7.38, y, 3.4))); sc.add(rbox(0.2, 2.7, 0.1, mat(0xffffff), -7.38, 2.25, 3.4));
  const winL = new THREE.PointLight(0xbfd4ff, 6, 9, 1.4); winL.position.set(-6.2, 2.4, 3.4); sc.add(winL);
  const win2 = rainyWindow(4.0, 2.8); win2.position.set(-2.2, 2.0, 8.03); win2.rotation.y = Math.PI; sc.add(win2);
  const door = grp(2.6, 0, 8.04, sc); door.add(rbox(1.4, 3.0, 0.1, mat(0x2f5b8a, { roughness: 0.5 }), 0, 1.5, 0)); door.add(ball(0.06, GOLD, 0.5, 1.4, -0.08));
  // back shelves of bread + the menu board
  for (const y of [2.6, 3.4]) { sc.add(rbox(7, 0.08, 0.5, mat(0x8a5a32, { roughness: 0.7 }), 0.6, y, -2.75)); for (let k = 0; k < 9; k++) { const b = ball(0.22, mat([0xc98a4a, 0xd9a35a, 0xb0743a][k % 3], { roughness: 0.75 }), -2.6 + k * 0.78, y + 0.18, -2.75, undefined, 14); b.scale.set(1.4, 0.8, 0.9); sc.add(b); } }
  const menu = signMesh(3.2, 1.0, ctex(640, 200, (g, w, h) => { g.fillStyle = '#1d2420'; g.fillRect(0, 0, w, h); g.fillStyle = '#f4efe2'; g.font = '700 46px InterW, Arial'; g.textAlign = 'center'; g.fillText('FRESH BAKED DAILY', w / 2, 80); g.font = '600 32px InterW, Arial'; g.globalAlpha = 0.8; g.fillText('pasties · rolls · buns · tea', w / 2, 140); }));
  menu.position.set(-3.6, 3.8, -2.93); sc.add(menu);
  // counter + glass display + till
  const wood = new THREE.MeshStandardMaterial({ map: woodT('#7a4a2a', 5), roughness: 0.6 });
  sc.add(rbox(6.4, 1.05, 1.0, wood, 0.4, 0.525, 0)); sc.add(rbox(6.6, 0.08, 1.12, mat(0xeee9e0, { roughness: 0.25 }), 0.4, 1.09, 0));
  const glass = new THREE.Mesh(rgeo(2.6, 0.62, 0.95), GLASS); glass.position.set(-1.45, 1.44, 0); sc.add(glass); sc.add(rbox(2.62, 0.05, 0.97, mat(0xd9d4cc, { metalness: 0.6, roughness: 0.3 }), -1.45, 1.76, 0));
  for (let k = 0; k < 6; k++) { const p = ball(0.13, mat([0xd9953f, 0xe0b25a, 0xc06a30][k % 3], { roughness: 0.6 }), -2.5 + k * 0.4, 1.24, (k % 2) * 0.2 - 0.1, undefined, 12); p.scale.set(1.3, 0.7, 1); sc.add(p); }
  const till = grp(2.7, 1.13, -0.1, sc); till.add(rbox(0.6, 0.3, 0.5, mat(0x2a2a30))); T(till, rbox(0.5, 0.32, 0.05, mat(0x1a1d24, { emissive: 0x3fd0a0, emissiveIntensity: 0.4 }), 0, 0.33, 0)).rotation.x = -0.3;
  const doily = cyl(0.3, 0.3, 0.01, mat(0xffffff, { roughness: 0.9 }), 0.45, 1.135, 0.25, 24); sc.add(doily);
  const roll = makeSausageRoll(1.1); roll.position.set(0.55, 1.25, 0.25); sc.add(roll);
  const price = makePriceCard('64p', 'SAUSAGE ROLL'); price.position.set(0.25, 1.38, 0.47); price.rotation.x = -0.2; sc.add(price);
  // pendant lamps
  const lamps = [-3.4, 0.6, 4.0].map(x => { const l = practical(sc, x, 3.75, 0.6, 0xffcf8a, { i: 9, d: 9, r: 0.14, bokeh: 0.9 }); sc.add(cyl(0.01, 0.01, 1.2, mat(0x222222), x, 4.4, 0.6, 6)); sc.add(cone(0.32, 0.3, mat(0x2a3a2a, { roughness: 0.5 }), x, 3.92, 0.6, 18)); return l; });
  // Day 1 table + chair by the window, plate + toast
  const tbl = grp(-5.6, 0, 2.6, sc); tbl.add(cyl(0.06, 0.06, 0.78, mat(0x222222), 0, 0.39, 0, 10)); tbl.add(cyl(0.3, 0.3, 0.04, mat(0x222222), 0, 0.02, 0, 16)); tbl.add(rbox(1.0, 0.05, 0.9, wood, 0, 0.8, 0));
  const chair = grp(-5.6, 0, 3.95, sc); chair.add(rbox(0.6, 0.06, 0.6, wood, 0, 0.5, 0)); chair.add(rbox(0.6, 0.75, 0.06, wood, 0, 0.9, 0.3)); [[-0.25, -0.25], [0.25, -0.25], [-0.25, 0.25], [0.25, 0.25]].forEach(([x, z]) => chair.add(cyl(0.025, 0.025, 0.5, mat(0x222222), x, 0.25, z, 6)));
  tbl.add(cyl(0.2, 0.17, 0.03, mat(0xffffff, { roughness: 0.2 }), 0, 0.84, 0.25, 24)); tbl.add(cyl(0.07, 0.06, 0.16, mat(0xffffff, { roughness: 0.2 }), 0.3, 0.9, 0.05, 16));
  const toast = makeToast(); sc.add(toast); const toast2 = makeToast(); sc.add(toast2); const splat2 = rbox(0.18, 0.012, 0.16, mat(0xffe27a, { roughness: 0.3 })); splat2.castShadow = false; sc.add(splat2);
  const crumbs = [...Array(10)].map(() => { const c = rbox(0.035, 0.03, 0.035, mat(0xc98a3a, { roughness: 0.9 })); c.castShadow = false; c.visible = false; sc.add(c); return c; });
  const plate = cyl(0.26, 0.22, 0.035, mat(0xffffff, { roughness: 0.2 }), 0, 0, 0, 24); sc.add(plate); const splat = rbox(0.18, 0.012, 0.16, mat(0xffe27a, { roughness: 0.3 })); splat.castShadow = false; sc.add(splat);
  // other customers at the back table (background life)
  const extras = npcs(sc, [[6], [2, { hairStyle: 'long' }]]); extras[0].root.position.set(5.2, 0, 4.2); extras[1].root.position.set(6.0, 0, 3.2);
  const hero = makeLuckHero(), marcus = makeMarcus(), baker = makeBaker(); [hero, marcus, baker].forEach(P => sc.add(P.root));
  const coins = [0, 1, 2].map(() => { const c = makeCoin(0.07); c.visible = false; sc.add(c); return c; }); const spin = makeCoin(0.11); spin.visible = false; sc.add(spin);
  const wallet = grp(); wallet.add(rbox(0.3, 0.2, 0.05, mat(0x3a2418, { roughness: 0.6 }))); wallet.add(rbox(0.26, 0.05, 0.2, mat(0xd9cfc0, { roughness: 0.9 }), 0, -0.12, 0.05)); sc.add(wallet);
  const moths = [0, 1].map(() => { const g = grp(); [-1, 1].forEach(s => { const w = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.08), mat(0xd8cfb8, { side: THREE.DoubleSide, roughness: 1 })); w.position.x = s * 0.06; g.add(w); g['w' + s] = w; }); sc.add(g); return g; });
  S.bakery = { sc, key, win, win2, roll, price, toast, splat, plate, toast2, splat2, crumbs, hero, marcus, baker, extras, coins, spin, wallet, moths, lamps, doily };
}
{ // ---- the hand insert (coin flip): a big hand on a dark warm surface, top-down
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x120c08);
  lightRig(sc, { env: 0.3, sky: 0xffe8c8, ground: 0x3a2a1c, hemi: 0.35, keyC: 0xfff0d8, key: 0.85, keyPos: [3, 8, 4], R: 4, rim: 0.5, rimC: 0xffb070, rimPos: [-4, 3, -4] });
  sc.add(rbox(14, 0.2, 14, new THREE.MeshStandardMaterial({ map: woodT('#5a3a22', 9), roughness: 0.5 }), 0, -0.1, 0)); sc.add(rbox(14, 6, 0.3, mat(0x2a1a12, { roughness: 0.9 }), 0, 3, -3.2));
  const hand = makeHandInsert(); hand.visible = false; sc.add(hand); const coin = makeCoin(0.13); sc.add(coin); const hero = makeLuckHero(); sc.add(hero.root);
  [[-3, 0.5, -2, 0xffb35a], [2.6, 0.3, -2.6, 0xff8a3a], [3.2, 0.2, 1.8, 0xffd28a], [-2.4, 0.1, 2.2, 0xff9a4a]].forEach(([x, y, z, c]) => practical(sc, x, y, z, c, { i: 2, d: 4, r: 0.12, bokeh: 1.4 }));
  const spark = sparkle(1.4); spark.visible = false; sc.add(spark);
  S.hand = { sc, hand, coin, spark, hero, solids: { hero: hero.root, coin } };
}
{ // ---- WINDY BRIDGE (Day 2): deck along z, the hero at z 0 facing +z (camera end), the note blows in from far down the bridge
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x9aa8b8); sc.fog = new THREE.Fog(0x9aa8b8, 30, 140);
  const key = lightRig(sc, { env: 0.6, sky: 0xdfe8f2, ground: 0x4a5058, hemi: 0.75, keyC: 0xfff4e4, key: 1.2, keyPos: [10, 18, 12], R: 16, target: [0, 0, -8], rim: 0.6, rimC: 0xcfe0ff, rimPos: [-8, 6, -20] });
  sc.add(skyDome('#7d8fa6', '#b9c6d4', '#d8dfe6', 170));
  sc.add(rbox(8, 0.5, 160, mat(0x8a8c90, { roughness: 0.85 }), 0, -0.25, -60)); sc.add(rbox(5.2, 0.04, 160, mat(0x5e6066, { roughness: 0.7 }), 0, 0.02, -60));
  sc.add(rbox(400, 0.2, 400, mat(0x5d7488, { roughness: 0.1, metalness: 0.3, envMapIntensity: 1.2 }), 0, -9, -60));
  for (const sx of [-1, 1]) { sc.add(cyl(0.05, 0.05, 160, mat(0x3a4a5a, { metalness: 0.6, roughness: 0.4 }), sx * 3.8, 1.15, -60, 8)).children; const rl = sc.children[sc.children.length - 1]; rl.rotation.x = Math.PI / 2;
    for (let z = 8; z > -140; z -= 2.5) sc.add(rbox(0.1, 1.15, 0.1, mat(0x3a4a5a, { metalness: 0.6, roughness: 0.4 }), sx * 3.8, 0.58, z));
    for (let z = 4; z > -140; z -= 14) { const p = grp(sx * 3.6, 0, z, sc); p.add(cyl(0.07, 0.09, 4.6, mat(0x2a333d, { metalness: 0.5 }), 0, 2.3, 0, 10)); p.add(rbox(0.5, 0.25, 0.3, mat(0x2a333d), -sx * 0.25, 4.6, 0)); } }
  const r = rnd(12); for (let i = 0; i < 40; i++) { const x = (r() < 0.5 ? -1 : 1) * (25 + r() * 70), z = -60 - r() * 110, h = 8 + r() * 40; sc.add(rbox(6 + r() * 8, h, 6 + r() * 8, mat([0x7a8494, 0x8d96a3, 0x6a7280][i % 3], { roughness: 0.9 }), x, h / 2 - 9, z)); }
  const hero = makeLuckHero(); sc.add(hero.root); const note = makeNote(); sc.add(note);
  // the hood that flips up onto his head in the gust (pivot at the back of the neck; rotation.x 0 = up, clear of head and hair)
  const hm = mat(0xD7262E, { roughness: 0.75 }); const hood = grp(0, 0.75, -0.25, hero.spine); hood.add(rbox(0.86, 0.1, 0.74, hm, 0, 0.9, 0.22)); hood.add(rbox(0.86, 0.82, 0.1, hm, 0, 0.5, -0.16)); [-1, 1].forEach(sx => hood.add(rbox(0.08, 0.74, 0.7, hm, sx * 0.43, 0.52, 0.2))); hood.visible = false;
  const walkers = npcs(sc, [[0], [3, { hairStyle: 'long' }], [5], [7]]);
  const hats = [0x2a2a30, 0xd7262e, 0x6b4a2b].map(c => { const g = grp(); g.add(cyl(0.34, 0.34, 0.03, mat(c), 0, 0, 0, 20)); g.add(cyl(0.22, 0.24, 0.2, mat(c), 0, 0.1, 0, 18)); sc.add(g); return g; });
  const leaves = dropsInst(sc, 60, 0xc9a25a, 0.05);
  S.bridge = { sc, key, hero, note, walkers, hats, leaves, hood };
}
{ // ---- RUSH-HOUR JUNCTION (Day 3): a footpath along z at x 0 crosses four roads (along x) at z = -4, -16, -28, -40; a signal faces +z before each road
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0xb8c4d0); sc.fog = new THREE.Fog(0xb8c4d0, 40, 150);
  const key = lightRig(sc, { env: 0.55, sky: 0xe6eef8, ground: 0x505860, hemi: 0.7, keyC: 0xfff0d8, key: 1.3, keyPos: [14, 22, 10], R: 34, target: [0, 0, -20], rim: 0.6, rimC: 0xffd8b0, rimPos: [-14, 8, -40] });
  sc.add(skyDome('#86a4c8', '#c2d2e2', '#e8e6e0', 180));
  sc.add(rbox(160, 0.2, 160, mat(0x3a3d42, { roughness: 0.85 }), 0, -0.1, -30));
  const ROADS = [-4, -16, -28, -40]; const pave = mat(0xa9a59c, { roughness: 0.9 });
  for (let z = 8; z > -60; z -= 12) sc.add(rbox(3.4, 0.16, 6, pave, 0, 0.08, z - 6.0 + 2));
  ROADS.forEach(rz => { for (let k = -4; k <= 4; k++) sc.add(rbox(0.45, 0.02, 6.2, mat(0xf2f2ee, { roughness: 0.6 }), k * 0.55, 0.011, rz)); for (const sx of [-1, 1]) for (let x = 3; x < 60; x += 4) sc.add(rbox(2, 0.02, 0.15, mat(0xe8e2c8), sx * x, 0.011, rz)); });
  const blocks = []; const r = rnd(8); for (let i = 0; i < ROADS.length + 1; i++) { const z0 = (i === 0 ? 10 : ROADS[i - 1] - 3.5), z1 = (i === ROADS.length ? -70 : ROADS[i] + 3.5);
    for (const sx of [-1, 1]) for (let x = 6; x < 50; x += 9 + r() * 4) { const h = 6 + r() * 18, d = Math.abs(z1 - z0) - 1; const b = rbox(7, h, d, mat([0x9a8a7a, 0x7f8a96, 0xb09a80, 0x8e7a6a][Math.floor(r() * 4)], { roughness: 0.9 }), sx * (x + 3.5), h / 2, (z0 + z1) / 2); sc.add(b); blocks.push(b); }
    for (const sx of [-1, 1]) sc.add(rbox(3.6, 0.18, Math.abs(z1 - z0), pave, sx * 3.6, 0.09, (z0 + z1) / 2)); }
  const signals = ROADS.map(rz => [-1, 1].map(sx => { const s = makeSignal(); s.position.set(sx * 1.9, 0, rz + 4.0); sc.add(s); return s; }));
  const CARC = [0xd7262e, 0x2f5fb0, 0xe8e8ea, 0x1a1a1f, 0x2bb673, 0xe8a317, 0x8a8f98];
  const cars = []; ROADS.forEach((rz, ri) => [-1, 1].forEach(sx => { const n = ri < 2 ? 4 : 3; for (let k = 0; k < n; k++) { const c = makeCar(CARC[(ri * 5 + k * 3 + (sx > 0 ? 1 : 0)) % CARC.length], { open: ri === 0 && sx === 1 && k === 0 }); c.position.set(sx * (5.2 + k * 5.0), 0, rz + (sx > 0 ? -1.6 : 1.6)); c.rotation.y = sx > 0 ? -Math.PI / 2 : Math.PI / 2; sc.add(c); cars.push(c); } }));
  // the angry driver's car (cars[4]) gets a door on its +z side, hinged at the front; it swings shut and locks him out
  const dcar = cars[4]; const door = grp(0.97, 0, 0.9, dcar); const dm = mat(0xe8e8ea, { roughness: 0.25, metalness: 0.35 }); door.add(rbox(0.06, 0.55, 1.1, dm, 0, 0.68, -0.55)); door.add(rbox(0.04, 0.06, 0.18, mat(0x333333), 0.04, 0.82, -0.95)); dcar.door = door;
  const driver = npc(0, { hood: 0x3a6ad0, hoodD: 0x3a6ad0 }); driver.head.add(rbox(0.72, 0.14, 0.68, mat(0x111111), 0, 0.72, 0)); sc.add(driver.root);
  const hero = makeLuckHero(); sc.add(hero.root);
  const peds = npcs(sc, [[2], [4], [6, { hairStyle: 'long' }]]);
  S.junction = { sc, key, signals, cars, driver, hero, peds, ROADS };
}
{ // ---- SEASIDE ARCADE (Day 5): the claw machine at the origin (glass box y 0.9..2.6), the hero at z 1.9 facing -z, the kid to his right
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x0c0614);
  const key = lightRig(sc, { env: 0.3, sky: 0xc8a0ff, ground: 0x200a30, hemi: 0.35, keyC: 0xffe0f0, key: 0.55, keyPos: [3, 8, 6], R: 8, rim: 0.9, rimC: 0x40e0ff, rimPos: [-6, 5, -6] });
  const carpet = new THREE.MeshStandardMaterial({ map: ctex(256, 256, (g, w, h) => { g.fillStyle = '#1a0b2e'; g.fillRect(0, 0, w, h); const r2 = rnd(3); for (let i = 0; i < 60; i++) { g.strokeStyle = ['#ff3aa8', '#3ae0ff', '#ffd23a', '#7aff5a'][i % 4]; g.lineWidth = 3; g.beginPath(); const x = r2() * w, y = r2() * h; g.arc(x, y, 6 + r2() * 10, 0, 3 + r2() * 3); g.stroke(); } }), roughness: 0.95 }); carpet.map.wrapS = carpet.map.wrapT = THREE.RepeatWrapping; carpet.map.repeat.set(6, 6);
  sc.add(rbox(20, 0.2, 20, carpet, 0, -0.1, 0)); sc.add(rbox(20, 6, 0.3, mat(0x1d0d30, { roughness: 0.9 }), 0, 3, -5)); sc.add(rbox(0.3, 6, 20, mat(0x1d0d30), -7, 3, 0)); sc.add(rbox(0.3, 6, 20, mat(0x1d0d30), 7, 3, 0));
  const neon = (x, y, z, w, h, c, ry = 0) => { const m = rbox(w, h, 0.06, mat(c, { emissive: c, emissiveIntensity: 3 }), x, y, z); m.rotation.y = ry; m.castShadow = false; sc.add(m); };
  neon(0, 5.0, -4.8, 12, 0.08, 0xff3aa8); neon(0, 4.7, -4.8, 12, 0.08, 0x3ae0ff); neon(-6.8, 4.8, 0, 12, 0.08, 0xff3aa8, Math.PI / 2); neon(6.8, 4.8, 0, 12, 0.08, 0x3ae0ff, Math.PI / 2);
  const cabTex = (c1, c2, s) => ctex(128, 128, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, c1); gr.addColorStop(1, c2); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.font = '800 26px InterW, Arial'; g.textAlign = 'center'; g.fillText(s, 64, 70); });
  [[-4.6, -3.6, 'BONUS!', '#ff3aa8', '#7a1aff'], [-2.2, -4.0, '2P', '#3ae0ff', '#1a4aff'], [2.4, -4.0, 'WIN!', '#ffd23a', '#ff6a1a'], [4.8, -3.6, 'JACKPOT', '#7aff5a', '#1aa05a'], [-5.6, 1.8, 'RACE', '#ff6a5a', '#a01a3a'], [5.6, 1.6, 'COINS', '#ffd23a', '#a07a1a']].forEach(([x, z, s, a, b]) => {
    const g = grp(x, 0, z, sc); g.add(rbox(1.3, 2.2, 1.0, mat(0x1a1a24, { roughness: 0.5 }), 0, 1.1, 0)); const scr = signMesh(1.0, 0.8, cabTex(a, b, s), true); scr.position.set(0, 1.6, 0.51); g.add(scr); g.lookAt(0, 0, 1.5); practical(sc, x, 2.7, z + 0.6, new THREE.Color(a).getHex(), { i: 3, d: 4, r: 0.05, bokeh: 1.1 }); });
  // the claw machine
  const cm = grp(0, 0, 0, sc); const body = mat(0xff3aa8, { roughness: 0.35, metalness: 0.2 }), trim = mat(0xffd23a, { roughness: 0.3, metalness: 0.6 });
  cm.add(rbox(1.8, 0.9, 1.8, body, 0, 0.45, 0)); cm.add(rbox(1.8, 0.45, 1.8, body, 0, 2.85, 0)); [[-0.87, -0.87], [0.87, -0.87], [-0.87, 0.87], [0.87, 0.87]].forEach(([x, z]) => cm.add(rbox(0.07, 1.75, 0.07, trim, x, 1.75, z)));
  const glassB = new THREE.Mesh(rgeo(1.7, 1.7, 1.7), GLASS); glassB.position.set(0, 1.75, 0); cm.add(glassB); cm.glassB = glassB;
  const door = grp(-0.85, 0.9, 0.86, cm); const gl = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.7), GLASS); gl.position.set(0.85, 0.85, 0); door.add(gl); cm.door = door;
  const marquee = signMesh(1.6, 0.36, signTex('CLAW', '#2a0a3a', '#ffd23a', 512, 128, '800 90px Montserrat, Arial'), true); marquee.position.set(0, 2.88, 0.91); cm.add(marquee); cm.marquee = marquee; cm.sorry = signTex('SORRY', '#3a0a0a', '#ff4a5a', 512, 128, '800 90px Montserrat, Arial');
  cm.add(rbox(0.5, 0.35, 0.1, mat(0x111111), 0.45, 0.55, 0.91)); cm.add(rbox(0.12, 0.2, 0.05, mat(0xffd23a, { emissive: 0xffd23a, emissiveIntensity: 1.5 }), -0.4, 0.7, 0.92));
  practical(sc, 0, 2.5, 0, 0xffe8ff, { i: 3, d: 3, r: 0.04, ei: 1 });
  const claw = grp(0, 2.45, 0, cm); claw.add(cyl(0.02, 0.02, 1.2, mat(0xcfd3da, { metalness: 1, roughness: 0.2 }), 0, 0.6, 0, 6)); claw.add(cyl(0.12, 0.14, 0.16, mat(0xcfd3da, { metalness: 1, roughness: 0.2 }), 0, 0, 0, 14));
  claw.prongs = [0, 1, 2].map(i => { const p = grp(0, -0.05, 0, claw); p.rotation.y = i * 2.094; const a = grp(0.1, 0, 0, p); a.add(rbox(0.04, 0.32, 0.05, mat(0xcfd3da, { metalness: 1, roughness: 0.2 }), 0.04, -0.16, 0)); return a; }); cm.claw = claw;
  const bears = [...Array(156)].map((_, i) => { const b = makeBear(i, 0.58); sc.add(b); return b; });   // 46 in stock + 110 more than could ever fit (cartoon logic)
  // the stock: a 5x5x2 stack on the machine floor (spacing 0.28, no overlaps), the centre of the top layer left free for the claw
  const pile = []; for (let L = 0; L < 2 && pile.length < 46; L++) for (let gz = 4; gz >= 0; gz--) for (let gx = 0; gx < 5; gx++) { if (L === 1 && gx === 2 && gz === 2) continue; if (pile.length < 46) pile.push(V([(gx - 2) * 0.32, 0.92 + L * 0.42, (gz - 2) * 0.32])); }
  const hero = makeLuckHero(), kid = makeKid(); sc.add(hero.root); sc.add(kid.root);
  const mum = npc(1, { hairStyle: 'long', hood: 0xff8c5a, hoodD: 0xff8c5a }); sc.add(mum.root);
  S.arcade = { sc, key, cm, bears, pile, hero, kid, mum };
}
{ // ---- MARCUS'S DRIVEWAY (Days 7 + 23): pavement along x at z 1..3, road z 3.3..9.5, house behind; the red convertible on the drive at (4, 0, -2.6)
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0xa8c6e6);
  const key = lightRig(sc, { env: 0.6, sky: 0xe4f0ff, ground: 0x4a6a3a, hemi: 0.7, keyC: 0xfff0d6, key: 1.5, keyPos: [-12, 18, 14], R: 22, target: [1, 0, 0], rim: 0.5, rimC: 0xffe0c0, rimPos: [10, 8, -14] });
  const dome = skyDome('#5d8ed0', '#a9c8ea', '#e8eef2', 170); sc.add(dome);
  sc.add(rbox(120, 0.2, 80, mat(0x5f9a42, { roughness: 0.95 }), 0, -0.1, -20)); sc.add(rbox(120, 0.05, 6.2, mat(0x34373c, { roughness: 0.8 }), 0, 0.02, 6.4));
  for (let x = -60; x < 60; x += 4) sc.add(rbox(2, 0.02, 0.14, mat(0xf2f2ee), x, 0.05, 6.4));
  sc.add(rbox(120, 0.18, 2.2, mat(0xb4afa6, { roughness: 0.9 }), 0, 0.09, 2.1)); sc.add(rbox(120, 0.22, 0.2, mat(0x8f8b84), 0, 0.11, 3.25));
  sc.add(rbox(4.2, 0.08, 7.5, mat(0x9a958c, { roughness: 0.85 }), 4, 0.04, -2.75));
  const hedge = mat(0x2f6a2a, { roughness: 1 }); sc.add(rbox(20, 0.9, 0.7, hedge, -8.1, 0.45, 0.6)); sc.add(rbox(20, 0.9, 0.7, hedge, 16.1, 0.45, 0.6));
  const house = (x, z, col, roof) => { const g = grp(x, 0, z, sc); g.add(rbox(8, 4.6, 6, mat(col, { roughness: 0.9 }), 0, 2.3, 0)); const rf = cone(6.2, 2.6, mat(roof, { roughness: 0.8 }), 0, 5.9, 0, 4); rf.rotation.y = Math.PI / 4; rf.scale.set(1, 1, 0.8); g.add(rf);
    [[-2.2, 1.4], [2.2, 1.4], [-2.2, 3.4], [2.2, 3.4]].forEach(([wx, wy]) => { g.add(rbox(1.3, 1.1, 0.1, mat(0xbfe0ff, { roughness: 0.05, metalness: 0.4, envMapIntensity: 1.5 }), wx, wy, 3.02)); g.add(rbox(1.45, 0.1, 0.16, mat(0xffffff), wx, wy - 0.6, 3.03)); });
    g.add(rbox(1.1, 2.2, 0.1, mat(0x1f3a6a), 0, 1.1, 3.03)); return g; };
  house(3, -10, 0xe8dcc4, 0x7a3a2a); house(-11, -10, 0xc4d2e0, 0x3a3a44); house(16, -10, 0xe0c0a8, 0x5a3a2a);
  const bins = grp(-1.8, 0, -1.2, sc); bins.add(rbox(0.7, 1.1, 0.7, mat(0x2a2d33), 0, 0.55, 0)); bins.add(rbox(0.7, 1.1, 0.7, mat(0x2b6a3a), 0.85, 0.55, 0));
  const car = makeCar(0xc8102e, { open: true, lights: 0.2 }); car.position.set(4, 0, -2.6); sc.add(car);
  const bucket = grp(2.7, 0, -0.9, sc); bucket.add(cyl(0.2, 0.16, 0.35, mat(0x2f6ad0, { roughness: 0.4 }), 0, 0.18, 0, 16)); bucket.add(cyl(0.18, 0.18, 0.02, mat(0xffffff, { roughness: 0.1 }), 0, 0.34, 0, 16));
  const puddle = new THREE.Mesh(new THREE.CircleGeometry(1, 32), new THREE.MeshStandardMaterial({ color: 0x6a8aa8, roughness: 0.02, metalness: 0.8, envMapIntensity: 2 })); puddle.rotation.x = -Math.PI / 2; puddle.scale.set(1.8, 0.8, 1); puddle.position.set(-0.6, 0.05, 4.0); sc.add(puddle);
  const bus = makeBus(); bus.rotation.y = Math.PI / 2; sc.add(bus);
  const fish = grp(); const fm = mat(0x7fa8c8, { roughness: 0.25, metalness: 0.3, envMapIntensity: 1.4 }); const fb = ball(0.16, fm, 0, 0, 0, undefined, 16); fb.scale.set(1.9, 0.75, 0.55); fish.add(fb); T(fish, cone(0.12, 0.22, fm, -0.36, 0, 0, 4)).rotation.z = Math.PI / 2; fish.add(ball(0.035, mat(0xffffff), 0.2, 0.05, 0.075, undefined, 8)); fish.add(ball(0.02, mat(0x111111), 0.215, 0.05, 0.095, undefined, 8)); fish.visible = false; sc.add(fish);
  const spray = dropsInst(sc, 420, 0xbfe6ff, 0.075); const sheet = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xa8dcff, roughness: 0.05, transparent: true, opacity: 0.35, envMapIntensity: 2, side: THREE.DoubleSide, depthWrite: false })); sheet.visible = false; sc.add(sheet);
  const hero = makeLuckHero(), marcus = makeMarcus(); sc.add(hero.root); sc.add(marcus.root);
  const cr = rnd(31); const pts = []; for (let i = 0; i < 160; i++) { const x = -5.0 - cr() * 13, z = 1.5 + cr() * 4.2; pts.push([x, 0, z, Math.PI / 2 + (cr() - 0.5) * 0.6]); } const crowd = crowdInst(sc, pts, { seed: 9 });
  // the meteor (Day 23): glowing rock + fire trail + smoke; the crater + flattened car
  const met = grp(0, 0, 0, sc); const rock = new THREE.Mesh(new THREE.IcosahedronGeometry(0.7, 0), new THREE.MeshStandardMaterial({ color: 0x3a2a22, roughness: 0.9, flatShading: true, emissive: 0xff5a1a, emissiveIntensity: 0.6 })); met.add(rock);
  const trail = [...Array(14)].map((_, i) => { const s = sprite(fireTex, 4.2 - i * 0.2, { add: true, op: 1 - i / 14 }); met.add(s); return s; }); met.trail = trail; met.light = new THREE.PointLight(0xff8a3a, 0, 40, 1.4); met.add(met.light); met.visible = false;
  const smoke = [...Array(16)].map(() => { const s = sprite(smokeTex, 2.5); s.visible = false; sc.add(s); return s; });
  const flash = new THREE.PointLight(0xffc07a, 0, 30, 1.2); flash.position.set(4, 3, -2); sc.add(flash);
  const debris = debrisPool(sc, 28, [0xc8102e, 0x3a2a22, 0x222222, 0xbfe0ff]);
  S.drive = { sc, key, car, bucket, puddle, bus, spray, sheet, hero, marcus, crowd, met, smoke, flash, debris, dome, fish };
}
{ // ---- RACECOURSE (Day 9): the straight runs along x (horses run toward -x), the spectator rail at z 5.2, the finish post at x -0.5
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0xa8cce8); sc.fog = new THREE.Fog(0xb8d4ea, 60, 220);
  const key = lightRig(sc, { env: 0.6, sky: 0xe8f4ff, ground: 0x4a7a3a, hemi: 0.75, keyC: 0xfff0d0, key: 1.5, keyPos: [-10, 22, 18], R: 40, target: [10, 0, 0], rim: 0.6, rimC: 0xffe0b0, rimPos: [20, 8, -20] });
  sc.add(skyDome('#5a92d6', '#a8cce8', '#eaf2f6', 220));
  sc.add(rbox(400, 0.2, 200, mat(0x4f8f38, { roughness: 0.95 }), 0, -0.1, 0)); const turf = new THREE.MeshStandardMaterial({ map: ctex(256, 64, (g, w, h) => { for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? '#5aa042' : '#62aa48'; g.fillRect(i * 16, 0, 16, h); } }), roughness: 0.95 }); turf.map.wrapS = THREE.RepeatWrapping; turf.map.repeat.set(30, 1);
  sc.add(rbox(300, 0.04, 10.2, turf, 20, 0.02, 0));
  const railM = mat(0xf6f6f6, { roughness: 0.4 }); for (const z of [-5.2, 5.2]) { const rl = cyl(0.06, 0.06, 300, railM, 20, 1.15, z, 8); rl.rotation.z = Math.PI / 2; sc.add(rl); const posts = new THREE.InstancedMesh(new THREE.BoxGeometry(0.1, 1.15, 0.1), railM, 150); const mt = new THREE.Matrix4(); for (let i = 0; i < 150; i++) { mt.makeTranslation(-130 + i * 2, 0.58, z); posts.setMatrixAt(i, mt); } posts.castShadow = true; sc.add(posts); }
  const post = grp(-6.0, 0, 5.0, sc); post.add(cyl(0.08, 0.08, 3, mat(0xffffff), 0, 1.5, 0, 10)); T(post, cyl(0.45, 0.45, 0.05, mat(0xd7262e), 0, 3.0, 0, 24)).rotation.x = Math.PI / 2;
  // grandstand + crowd behind the spectators
  for (let k = 0; k < 6; k++) sc.add(rbox(60, 0.8, 1.6, mat(0xcfcfd4, { roughness: 0.8 }), 0, 0.4 + k * 0.8, 13 + k * 1.6)); sc.add(rbox(62, 1.0, 12, mat(0x2f5f8f), 0, 9.5, 17)); for (let x = -28; x <= 28; x += 8) sc.add(cyl(0.15, 0.15, 9, mat(0xdddddd), x, 4.5, 21.6, 8));
  const pts = []; const r = rnd(6); for (let k = 0; k < 6; k++) for (let x = -28; x < 28; x += 0.9 + r() * 0.4) pts.push([x, 0.8 + k * 0.8, 13 + k * 1.6, Math.PI]); for (let x = -26; x < 26; x += 1.1 + r()) { if (Math.abs(x - 0) < 4.5) continue; pts.push([x, 0, 7.4 + r() * 2.5, Math.PI]); }
  const crowd = crowdInst(sc, pts, { seed: 4 });
  const board = grp(-4.6, 0, 8.6, sc); board.add(rbox(0.1, 3, 0.1, mat(0x333333), -0.9, 1.5, 0)); board.add(rbox(0.1, 3, 0.1, mat(0x333333), 0.9, 1.5, 0));
  const bm = signMesh(2.2, 1.5, ctex(440, 300, (g, w, h) => { g.fillStyle = '#16251c'; g.fillRect(0, 0, w, h); g.strokeStyle = '#c9b46a'; g.lineWidth = 8; g.strokeRect(6, 6, w - 12, h - 12); g.fillStyle = '#f4efe2'; g.font = '800 34px InterW, Arial'; g.textAlign = 'center'; g.fillText('2:15 RACE ODDS', w / 2, 52);
    g.textAlign = 'left'; g.font = '700 30px InterW, Arial'; [['1 THUNDERBOLT', '1-2 FAV'], ['2 SILVER DART', '4-1'], ['3 MIDNIGHT', '6-1'], ['4 GOLD RUSH', '8-1']].forEach(([n, o], i) => { g.fillText(n, 26, 104 + i * 40); g.textAlign = 'right'; g.fillText(o, w - 26, 104 + i * 40); g.textAlign = 'left'; });
    g.fillStyle = '#ffd23a'; g.font = '800 32px InterW, Arial'; g.fillText('9 NO CHANCE', 26, 276); g.textAlign = 'right'; g.fillText('500-1', w - 26, 276); })); bm.position.set(0, 2.6, -0.06); bm.rotation.y = Math.PI; board.add(bm); board.add(rbox(2.3, 1.6, 0.08, mat(0x2a2a2a), 0, 2.6, 0));
  const horses = [[0xf2efe8, 0xd7262e, 1], [0x6b3a1e, 0x1f4fd6, 2], [0x1a1410, 0x2bb673, 3], [0x8a5a32, 0xe8a317, 4], [0x5a3a22, 0x9b59d6, 5]].map(([c, s, n]) => { const h = makeHorse(c, { silk: s, number: n }); h.rotation.y = -Math.PI / 2; sc.add(h); return h; });
  const pony = makeHorse(0xb08a5a, { shaggy: true, mane: 0x3a2a1a, silk: 0xff8ad0, number: 9, scale: 0.68 }); pony.rotation.y = -Math.PI / 2; sc.add(pony);
  const fan = npc(5, {}); sc.add(fan.root); const sandwich = grp(); sandwich.add(rbox(0.36, 0.08, 0.24, mat(0xf0d9a8))); sandwich.add(rbox(0.38, 0.03, 0.26, mat(0x7ac84a), 0, -0.05, 0)); sandwich.add(rbox(0.36, 0.08, 0.24, mat(0xf0d9a8), 0, -0.1, 0)); sc.add(sandwich);
  const hero = makeLuckHero(), marcus = makeMarcus(); sc.add(hero.root); sc.add(marcus.root);
  const copiers = npcs(sc, [[1, { hairStyle: 'long' }], [3], [7]]); hatOn(copiers[0], 'fascinator', 0xff3aa8); hatOn(copiers[1], 'trilby', 0x3a3a44); hatOn(copiers[2], 'flat', 0x6b5a3a);
  copiers.forEach(P => { P.slip = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.13), mat(0xfaf7ee, { side: THREE.DoubleSide })); P.slip.position.set(0, -0.52, 0.12); P.arms[1].el.add(P.slip); });
  const dust = [...Array(20)].map(() => { const s = sprite(smokeTex, 1.6, { op: 0.6 }); s.material.color.setHex(0xc8b090); s.visible = false; sc.add(s); return s; });
  const halves = [0, 1].map(() => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.14), mat(0xfaf7ee, { side: THREE.DoubleSide })); m.visible = false; sc.add(m); return m; });
  S.races = { sc, key, horses, pony, fan, sandwich, hero, marcus, copiers, crowd, dust, halves, post };
}
{ // ---- LAUNDERETTE at night (Day 13): machines along the back wall z -1.6, the bench at z 0.4, the hero sits facing +z
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x081018);
  const key = lightRig(sc, { env: 0.3, sky: 0xd8f0ff, ground: 0x203040, hemi: 0.3, keyC: 0xe8f6ff, key: 0.6, keyPos: [2, 8, 6], R: 8, rim: 0.7, rimC: 0x6ab8ff, rimPos: [-5, 4, -6] });
  sc.add(rbox(16, 0.2, 12, new THREE.MeshStandardMaterial({ map: tileTex('#d8dcd8', '#a8b0aa', 8), roughness: 0.35 }), 0, -0.1, 0)); sc.add(rbox(16, 5, 0.3, mat(0x7aa8a0, { roughness: 0.9 }), 0, 2.5, -2.4));
  const drumTex = ctex(128, 128, (g, w, h) => { g.fillStyle = '#5a7a90'; g.fillRect(0, 0, w, h); const r2 = rnd(2); for (let i = 0; i < 14; i++) { g.fillStyle = ['#d7262e', '#f2f2f2', '#2f5fb0', '#e8a317', '#7a5aa0'][i % 5]; g.beginPath(); g.ellipse(r2() * w, r2() * h, 14 + r2() * 20, 8 + r2() * 10, r2() * 3, 0, 7); g.fill(); } });
  const drums = []; for (let k = 0; k < 7; k++) { const x = -4.5 + k * 1.5; const g = grp(x, 0, -1.6, sc); g.add(rbox(1.3, 1.4, 1.2, mat(0xf2f2f0, { roughness: 0.3 }), 0, 0.7, 0)); const ring = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.06, 10, 28), mat(0xb8bcc4, { metalness: 0.8, roughness: 0.25 })); ring.position.set(0, 0.68, 0.61); g.add(ring);
    const d = new THREE.Mesh(new THREE.CircleGeometry(0.4, 28), new THREE.MeshStandardMaterial({ map: drumTex.clone(), emissive: 0x9fd0ff, emissiveIntensity: 0.25, roughness: 0.1 })); d.material.map.needsUpdate = true; d.material.map.center.set(0.5, 0.5); d.position.set(0, 0.68, 0.6); g.add(d); drums.push(d);
    g.add(rbox(1.0, 0.18, 0.05, mat(0x2a2d33), 0, 1.25, 0.61)); g.add(rbox(0.1, 0.06, 0.02, mat(0x3dff7a, { emissive: 0x3dff7a, emissiveIntensity: 2 }), 0.35, 1.26, 0.64)); }
  for (let k = 0; k < 7; k++) sc.add(rbox(1.3, 1.2, 1.2, mat(0xe8e8e6, { roughness: 0.3 }), -4.5 + k * 1.5, 2.1, -1.6));
  const tubes = [-3, 0, 3].map(x => { const t = rbox(2.2, 0.08, 0.16, mat(0xffffff, { emissive: 0xe8fff8, emissiveIntensity: 2.5 }), x, 4.4, 0.4); t.castShadow = false; sc.add(t); const l = new THREE.PointLight(0xe0fff4, 5, 7, 1.5); l.position.set(x, 4.0, 0.6); sc.add(l); return l; });
  const bench = grp(0, 0, 0.6, sc); bench.add(rbox(3.2, 0.1, 0.6, new THREE.MeshStandardMaterial({ map: woodT('#8a5a32', 4), roughness: 0.6 }), 0, 0.5, 0)); [-1.4, 1.4].forEach(x => bench.add(rbox(0.08, 0.5, 0.5, mat(0x2a2d33), x, 0.25, 0)));
  const winFront = new THREE.Mesh(new THREE.PlaneGeometry(10, 3.5), new THREE.MeshBasicMaterial({ color: 0x0a1428, toneMapped: false })); winFront.position.set(0, 2.2, 5.5); winFront.rotation.y = Math.PI; sc.add(winFront);
  const hero = makeLuckHero(); sc.add(hero.root); const coin = makeCoin(0.07); sc.add(coin);
  S.laundrette = { sc, key, drums, hero, coin, tubes };
}
{ // ---- CASINO (Day 20): the table at the origin (felt top y 0.86), the hero sits at z 1.45 facing -z, the dealer at z -1.5 facing +z
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x120808);
  const key = lightRig(sc, { env: 0.35, sky: 0xffe0b0, ground: 0x301010, hemi: 0.35, keyC: 0xffe4c0, key: 0.9, keyPos: [0, 9, 4], R: 9, rim: 0.7, rimC: 0xffb060, rimPos: [-6, 5, -8] });
  const carpet = new THREE.MeshStandardMaterial({ map: ctex(256, 256, (g, w, h) => { g.fillStyle = '#5a0e18'; g.fillRect(0, 0, w, h); g.strokeStyle = '#c9a040'; g.lineWidth = 4; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.beginPath(); g.arc(32 + i * 64, 32 + j * 64, 20, 0, 7); g.stroke(); g.beginPath(); g.moveTo(32 + i * 64, 6 + j * 64); g.lineTo(32 + i * 64, 58 + j * 64); g.stroke(); } }), roughness: 0.95 }); carpet.map.wrapS = carpet.map.wrapT = THREE.RepeatWrapping; carpet.map.repeat.set(8, 8);
  sc.add(rbox(30, 0.2, 30, carpet, 0, -0.1, 0)); sc.add(rbox(30, 7, 0.3, mat(0x2a0a10, { roughness: 0.8 }), 0, 3.5, -7));
  const felt = mat(0x0f6a3a, { roughness: 0.9 }); const top = cyl(1, 1, 0.1, felt, 0, 0.82, 0, 40); top.scale.set(2.2, 1, 1.25); sc.add(top); const rail = new THREE.Mesh(new THREE.TorusGeometry(1, 0.08, 10, 48), mat(0x3a1a0e, { roughness: 0.4 })); rail.rotation.x = Math.PI / 2; rail.scale.set(2.2, 1.25, 1); rail.position.y = 0.88; sc.add(rail);
  sc.add(cyl(0.5, 0.7, 0.8, mat(0x2a120a), 0, 0.4, 0, 20));
  const chairM = mat(0x8a1020, { roughness: 0.6 }); const chair = grp(0, 0, 1.75, sc); chair.add(rbox(0.7, 0.12, 0.6, chairM, 0, 0.5, 0)); chair.add(rbox(0.7, 0.9, 0.12, chairM, 0, 1.0, 0.3)); chair.add(cyl(0.05, 0.05, 0.5, mat(0xc9a040, { metalness: 0.9, roughness: 0.3 }), 0, 0.25, 0, 8));
  const chand = [[-3, -2], [3, -2], [0, 2.5]].map(([x, z]) => { const g = grp(x, 4.6, z, sc); for (let k = 0; k < 8; k++) { const a = k / 8 * 6.283; g.add(ball(0.08, mat(0xfff2d0, { emissive: 0xffe0a0, emissiveIntensity: 3 }), Math.cos(a) * 0.5, 0, Math.sin(a) * 0.5, undefined, 8)); } const l = new THREE.PointLight(0xffd9a0, 10, 10, 1.4); g.add(l); const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: bokehTex, color: 0xffd9a0, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); sp.scale.setScalar(2.2); g.add(sp); return g; });
  const slotTex = (s) => ctex(128, 160, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#ff3a6a'); gr.addColorStop(1, '#6a1aff'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.fillRect(14, 50, 100, 50); g.fillStyle = '#d7262e'; g.font = '800 40px InterW, Arial'; g.textAlign = 'center'; g.fillText(s, 64, 90); });
  const slots = []; const jackTex = ctex(128, 160, (g, w, h) => { g.fillStyle = '#ffd23a'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.fillRect(10, 50, 108, 56); g.fillStyle = '#e8243c'; g.font = '800 44px InterW, Arial'; g.textAlign = 'center'; g.fillText('777', 64, 92); g.fillStyle = '#7a1aff'; g.font = '800 20px InterW, Arial'; g.fillText('JACKPOT', 64, 140); });
  for (let k = 0; k < 9; k++) { const x = -8 + k * 2; const g = grp(x, 0, -6, sc); g.add(rbox(1.2, 2.2, 0.9, mat(0x1a1a24), 0, 1.1, 0)); g.add(rbox(0.8, 0.12, 0.3, mat(0xc9a040, { metalness: 0.9, roughness: 0.3 }), 0, 0.62, 0.55)); const s = signMesh(0.9, 1.1, slotTex(['777', 'BAR', '$$$'][k % 3]), true); s.position.set(0, 1.5, 0.46); g.add(s); s.base = s.material.map; slots.push(s); }
  // the payout: gold coins pouring out of every tray onto the carpet (instanced flat discs)
  const payout = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.06, 0.06, 0.012, 14), new THREE.MeshStandardMaterial({ color: 0xffc94a, metalness: 1, roughness: 0.2, envMapIntensity: 1.6 }), 9 * 30); payout.frustumCulled = false; sc.add(payout);
  const cards = [...Array(5)].map((_, i) => { const c = makeCard(RANKS[i]); sc.add(c); return c; });
  const stacks = [...Array(14)].map((_, i) => { const s = makeChipStack(40, CHIPC[i % 5]); sc.add(s); return s; });
  const hero = makeLuckHero(), dealer = makeSuit(0xf4f4f4, { vest: true, tie: 0x111111, skin: 0x8a5a3c }), boss = makeSuit(0x1d1d24, { bald: true, tie: 0xc9a040, skin: 0xe8b896 }); [hero, dealer, boss].forEach(P => sc.add(P.root));
  const r = rnd(14); const pts = []; for (let i = 0; i < 26; i++) { const a = -0.9 + r() * 1.8; pts.push([Math.sin(a) * (3.0 + r() * 1.6), 0, 3.4 + Math.cos(a) * (1.0 + r() * 1.6), Math.PI + a * 0.4]); } const crowd = crowdInst(sc, pts, { seed: 12 });
  const near = npcs(sc, [[2, { hairStyle: 'long' }], [6]]);
  S.casino = { sc, key, cards, stacks, hero, dealer, boss, crowd, near, chand, slots, jackTex, payout };
}
{ // ---- PUB (Day 26): the bar along x at z -2.2, the TV above the back bar at (1.6, 3.3, -3.25) facing +z, the hero kneels at (0, 0, 1.3)
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x140c08);
  const key = lightRig(sc, { env: 0.35, sky: 0xffe0b8, ground: 0x3a2412, hemi: 0.4, keyC: 0xffdcb0, key: 0.8, keyPos: [3, 9, 6], R: 10, rim: 0.6, rimC: 0xffa860, rimPos: [-5, 5, -6] });
  sc.add(rbox(20, 0.2, 16, new THREE.MeshStandardMaterial({ map: woodT('#4a2a16', 6), roughness: 0.5 }), 0, -0.1, 2)); sc.add(rbox(20, 6, 0.3, mat(0x3a2418, { roughness: 0.8 }), 0, 3, -3.5));
  sc.add(rbox(0.3, 6, 16, mat(0x6a2a20), -7.5, 3, 2)); sc.add(rbox(0.3, 6, 16, mat(0x6a2a20), 7.5, 3, 2));
  const wood = new THREE.MeshStandardMaterial({ map: woodT('#6a3a1a', 2), roughness: 0.45 }); sc.add(rbox(9, 1.1, 0.9, wood, 0, 0.55, -2.2)); sc.add(rbox(9.2, 0.08, 1.0, mat(0x3a1e0c, { roughness: 0.25 }), 0, 1.14, -2.2));
  for (let k = 0; k < 5; k++) { const x = -2 + k * 0.5; sc.add(cyl(0.04, 0.04, 0.5, mat(0xcfd3da, { metalness: 1, roughness: 0.2 }), x, 1.42, -2.3, 8)); sc.add(rbox(0.12, 0.2, 0.06, mat([0xd7262e, 0xe8a317, 0x2bb673][k % 3]), x, 1.6, -2.27)); }
  for (const y of [1.9, 2.4]) { sc.add(rbox(8, 0.06, 0.4, mat(0x2a1a0e), 0, y, -3.2)); for (let k = 0; k < 18; k++) { const c = [0x3a8a3a, 0x8a4a1a, 0xc9a040, 0x2a5a8a][k % 4]; sc.add(cyl(0.06, 0.07, 0.36, mat(c, { roughness: 0.1, emissive: c, emissiveIntensity: 0.35 }), -3.8 + k * 0.44, y + 0.2, -3.2, 10)); } }
  const tvTex = screenTex(640, 400); const tv = grp(1.6, 3.4, -3.25, sc); tv.add(rbox(2.5, 1.6, 0.15, mat(0x111111))); const tvs = screenMesh(2.36, 1.48, tvTex, { z: 0.08 }); tv.add(tvs); const tvL = new THREE.PointLight(0x9fc0ff, 6, 6, 1.5); tvL.position.set(1.6, 3.2, -2.2); sc.add(tvL);
  [[-4, 3.6, 1], [0.5, 3.8, 2.5], [4, 3.6, 0.5]].forEach(([x, y, z]) => practical(sc, x, y, z, 0xffb86a, { i: 7, d: 8, r: 0.12, bokeh: 1.2 }));
  [[-4.5, 3.5], [4.6, 3.8]].forEach(([x, z]) => { const t = grp(x, 0, z, sc); t.add(cyl(0.7, 0.7, 0.06, wood, 0, 0.78, 0, 24)); t.add(cyl(0.06, 0.06, 0.76, mat(0x222222), 0, 0.38, 0, 8)); });
  const r = rnd(41); const pts = []; for (let i = 0; i < 46; i++) { const x = -6.5 + r() * 13, z = 0.2 + r() * 6.5; if (Math.abs(x) < 1.6 && z < 3.4) continue; if ([[-1.6, 2.3], [1.7, 2.5], [-2.6, 1.0], [2.6, 1.2], [0, 1.3]].some(([a, b]) => Math.hypot(a - x, b - z) < 1.0)) continue; pts.push([x, 0, z, Math.PI + (r() - 0.5) * 0.5]); } const crowd = crowdInst(sc, pts, { seed: 21 });
  const near = npcs(sc, [[3], [5, { hairStyle: 'long' }], [0], [4]]);
  const hero = makeLuckHero(); sc.add(hero.root); const phone = makeWinPhone(); sc.add(phone);
  const conf = dropsInst(sc, 260, 0xffffff, 0.05); const confC = [0xffd23a, 0xff3aa8, 0x3ae0ff, 0x7aff5a, 0xffffff]; for (let i = 0; i < 260; i++) conf.m.setColorAt(i, new THREE.Color(confC[i % 5]));
  const ticket = makeTicket(); ticket.scale.setScalar(0.25); sc.add(ticket);
  const barman = makeBaker(); barman.root.scale.setScalar(1.0); sc.add(barman.root); const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.15, 0.36, 20, 1, true), new THREE.MeshPhysicalMaterial({ color: 0xe8f4ff, roughness: 0.05, transparent: true, opacity: 0.3, side: THREE.DoubleSide, depthWrite: false }));
  jar.position.set(-1.95, 1.18 + 0.18, -2.05); sc.add(jar); sc.add(cyl(0.15, 0.15, 0.02, mat(0xd8e8f0, { roughness: 0.1 }), -1.95, 1.19, -2.05, 20)); const jl = signMesh(0.26, 0.1, signTex('TIPS', '#fff6e0', '#c0392b', 256, 96, '800 64px InterW, Arial')); jl.position.set(-1.95, 1.36, -1.88); sc.add(jl);
  for (let k = 0; k < 6; k++) { const c = makeCoin(0.05); c.position.set(-1.95 + Math.sin(k * 2) * 0.06, 1.21 + k * 0.012, -2.05 + Math.cos(k * 2) * 0.06); sc.add(c); } const tip = makeCoin(0.05); sc.add(tip);
  S.pub = { sc, key, tv, tvTex, crowd, near, hero, phone, conf, ticket, barman, tip };
}
{ // ---- the ticket insert + the nationwide queue (Day 26 montage)
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x0e0a08);
  lightRig(sc, { env: 0.45, sky: 0xffe8c8, ground: 0x3a2a1c, hemi: 0.45, keyC: 0xfff0d8, key: 1.3, keyPos: [2, 8, 4], R: 5 });
  sc.add(rbox(14, 0.2, 14, new THREE.MeshStandardMaterial({ map: woodT('#6a4a2a', 11), roughness: 0.6 }), 0, -0.1, 0)); const t = makeTicket(); t.position.y = 0.01; sc.add(t); const pen = makePen(); sc.add(pen);
  [[-2.5, 0.4, -1.6, 0xffb35a], [2.4, 0.3, -2.0, 0xff8a3a], [2.6, 0.2, 1.6, 0xffd28a]].forEach(([x, y, z, c]) => practical(sc, x, y, z, c, { i: 2, d: 4, r: 0.1, bokeh: 1.2 }));
  S.ticket = { sc, pen };
}
{ // ---- the plaza: a queue snaking across the city square to a LOTTO kiosk, seen from above
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x8a9aa8);
  const key = lightRig(sc, { env: 0.55, sky: 0xe8f0f8, ground: 0x505860, hemi: 0.7, keyC: 0xfff0d8, key: 1.4, keyPos: [10, 30, 12], R: 40 });
  sc.add(rbox(200, 0.2, 200, new THREE.MeshStandardMaterial({ map: tileTex('#c8c0b0', '#b8b0a0', 8), roughness: 0.9 }), 0, -0.1, 0)); sc.children[sc.children.length - 1].material.map.repeat.set(20, 20);
  const kiosk = grp(0, 0, -14, sc); kiosk.add(rbox(5, 3.2, 3, mat(0xe8343c, { roughness: 0.5 }), 0, 1.6, 0)); const ks = signMesh(4.4, 1.1, signTex('LOTTO', '#e8343c', '#ffffff', 512, 128, '800 96px Montserrat, Arial'), true); ks.rotation.x = -Math.PI / 2; ks.position.set(0, 3.25, 0); kiosk.add(ks);
  const pts = []; for (let i = 0; i < 360; i++) { const u = i / 360; const row = Math.floor(u * 9), f = (u * 9) % 1; const x = (row % 2 ? 1 : -1) * (14 - f * 28) * -1, z = -10 + row * 3.0; pts.push([x, 0, z, row % 2 ? Math.PI / 2 : -Math.PI / 2]); }
  const crowd = crowdInst(sc, pts, { seed: 33, s: 0.9, min: 0.6 }); const r = rnd(9); for (let i = 0; i < 40; i++) { const x = -30 + r() * 60, z = -30 + r() * 60; if (Math.abs(x) < 18 && z > -16 && z < 18) continue; sc.add(rbox(6, 6 + r() * 10, 6, mat(0x8a8078, { roughness: 0.9 }), x, 3, z)); }
  const slips = dropsInst(sc, 120, 0xfff6e0, 0.12);
  S.plaza = { sc, crowd, slips };
}
