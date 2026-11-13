
// ---------------------------------------------------------------- v2 props: the date, the tools that double, the crew, the capsule
function hold(P, g, ai = 1, rx = -1.4) { g.position.set(0, -0.48, 0.04); g.rotation.x = rx; P.arms[ai].el.add(g); g.visible = false; return g; }
function brushMesh() { const g = grp(); g.add(rbox(0.08, 0.36, 0.06, mat(0x9b59d6, { roughness: 0.4 }), 0, 0, 0)); const hd = rbox(0.24, 0.12, 0.34, mat(0x9b59d6, { roughness: 0.4 }), 0, -0.24, 0.08); g.add(hd);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) g.add(rbox(0.02, 0.08, 0.02, mat(0x222222), -0.08 + i * 0.055, -0.3, -0.02 + j * 0.09)); return g; }
function rakeMesh() { const g = grp(); g.add(rbox(0.06, 2.2, 0.06, mat(0xb07a42, { roughness: 0.6 }), 0, -0.6, 0)); g.add(rbox(0.7, 0.08, 0.08, mat(0x8a8f98, { metalness: 0.7, roughness: 0.3 }), 0, -1.7, 0));
  for (let i = 0; i < 8; i++) g.add(rbox(0.03, 0.22, 0.03, mat(0x8a8f98, { metalness: 0.7, roughness: 0.3 }), -0.31 + i * 0.089, -1.82, 0.04)); return g; }
function trimmerMesh() { const g = grp(); g.add(rbox(0.22, 0.24, 0.42, mat(0xffd23f, { roughness: 0.4 }), 0, 0, 0)); g.add(rbox(0.06, 0.06, 1.1, mat(0xc9ced6, { metalness: 0.8, roughness: 0.25 }), 0, 0, 0.75));
  for (let i = 0; i < 9; i++) g.add(rbox(0.16, 0.02, 0.04, mat(0xc9ced6, { metalness: 0.8, roughness: 0.25 }), 0, 0, 0.32 + i * 0.11)); return g; }
function blowerMesh() { const g = grp(); g.add(rbox(0.3, 0.32, 0.46, mat(0xff8a1f, { roughness: 0.4 }), 0, 0, 0)); const tb = cyl(0.08, 0.1, 1.1, mat(0x2a2a30, { roughness: 0.5 }), 0, 0, 0.7, 12); tb.rotation.x = Math.PI / 2; g.add(tb); return g; }
function keysMesh() { const g = grp(); g.add(new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.012, 6, 16), mat(0xd4a017, { metalness: 0.8, roughness: 0.3 }))); [0, 1].forEach(i => { const k = rbox(0.03, 0.16, 0.01, mat(0xd4a017, { metalness: 0.8, roughness: 0.3 }), -0.03 + i * 0.06, -0.12, 0); k.rotation.z = (i - 0.5) * 0.4; g.add(k); }); return g; }
function nestMesh() { const g = grp(); const tw = mat(0x8a6238, { roughness: 0.9 }); const ring = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.14, 8, 18), tw); ring.rotation.x = Math.PI / 2; ring.castShadow = true; g.add(ring); g.add(cyl(0.4, 0.3, 0.1, tw, 0, -0.08, 0, 16));
  [[-0.12, 0.05], [0.08, -0.1], [0.12, 0.12]].forEach(([x, z]) => { const e = ball(0.08, mat(0xdfeeff, { roughness: 0.4 }), x, 0.02, z, undefined, 12); e.scale.y = 1.3; g.add(e); });
  const sofa = grp(-0.18, 0.02, -0.18, g); sofa.add(rbox(0.26, 0.07, 0.12, mat(0xe8343c))); sofa.add(rbox(0.26, 0.12, 0.04, mat(0xe8343c), 0, 0.07, -0.05));
  const tv = grp(0.2, 0.08, -0.2, g); tv.add(rbox(0.2, 0.14, 0.05, mat(0x1a1a1a))); tv.add(rbox(0.16, 0.1, 0.01, mat(0x5ac8ff, { emissive: 0x5ac8ff, emissiveIntensity: 0.8 }), 0, 0, 0.03)); return g; }
function ladderMesh(h) { const g = grp(); [-0.35, 0.35].forEach(x => g.add(rbox(0.08, h, 0.08, mat(0xc9ced6, { metalness: 0.6, roughness: 0.4 }), x, h / 2, 0))); for (let y = 0.4; y < h; y += 0.5) g.add(rbox(0.7, 0.05, 0.05, mat(0xc9ced6, { metalness: 0.6, roughness: 0.4 }), 0, y, 0)); return g; }
function mowerMesh() { const g = grp(); g.add(rbox(0.9, 0.35, 1.2, mat(0x2bb673, { roughness: 0.4 }), 0, 0.3, 0)); g.add(rbox(0.5, 0.35, 0.4, mat(0x1f1f24), 0, 0.6, -0.25)); [[-0.45, -0.45], [0.45, -0.45], [-0.45, 0.45], [0.45, 0.45]].forEach(([x, z]) => { const w = cyl(0.16, 0.16, 0.1, mat(0x111111), x, 0.16, z, 12); w.rotation.z = Math.PI / 2; g.add(w); }); return g; }
const letterTex = (ch) => canvasTex(256, 256, (g) => { g.fillStyle = '#d9a46a'; g.font = '900 230px Montserrat, Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ch, 128, 140); });
{ // bedroom: the calendar with SATURDAY, the heart, the hairbrush
  const R = S.room, sc = R.sc;
  const cal = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.7), new THREE.MeshStandardMaterial({ roughness: 0.8, map: canvasTex(300, 340, (g, w, h) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); g.fillStyle = '#E21E39'; g.fillRect(0, 0, w, 64); g.fillStyle = '#fff'; g.font = '700 40px InterW, Arial'; g.textAlign = 'center'; g.fillText('THIS WEEK', w / 2, 46);
    const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SATURDAY', 'SUN']; days.forEach((d, i) => { g.fillStyle = i === 5 ? '#111' : '#777'; g.font = (i === 5 ? '800 30px' : '600 22px') + ' InterW, Arial'; g.textAlign = 'left'; g.fillText(d, 24, 104 + i * 36); g.fillStyle = '#ddd'; g.fillRect(16, 112 + i * 36, w - 32, 2); }); }) }));
  cal.position.set(0.95, 2.55, -3.03); sc.add(cal);
  const heart = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.55), new THREE.MeshBasicMaterial({ transparent: true, toneMapped: false, depthWrite: false, map: canvasTex(280, 110, (g, w, h) => { g.strokeStyle = '#E21E39'; g.lineWidth = 7; g.beginPath(); g.ellipse(w / 2, h / 2, w / 2 - 8, h / 2 - 8, -0.05, 0, 7); g.stroke(); g.fillStyle = '#E21E39'; g.font = '800 30px InterW, Arial'; g.fillText('DATE ♥', w - 120, h - 16); }) }));
  heart.position.set(0.98, 2.27, -3.0); sc.add(heart);
  R.heart = heart; R.brush = hold(R.hero, brushMesh(), 1, -1.6); R.burp = debrisPool(sc, 8, [0x9b59d6, 0x222222]);
}
{ // street: rake + nest, leaf blower, wind, the ice-cream kid
  const s = S.street, sc = s.sc;
  s.rake = hold(s.hero, rakeMesh(), 1, -0.3); s.nest = nestMesh(); s.nest.visible = false; sc.add(s.nest); s.blower = hold(s.hero, blowerMesh(), 1, -1.3);
  s.wind = [...Array(26)].map(() => { const m = rbox(0.4, 0.03, 0.03, mat(0xffffff, { transparent: true, opacity: 0.6 })); m.castShadow = false; m.visible = false; sc.add(m); return m; });
  const cone2 = grp(0, -0.5, 0.08, s.kid.arms[1].el); cone2.add(cone(0.09, 0.3, mat(0xd9a05a), 0, -0.05, 0, 12)); cone2.rotation.x = Math.PI; const scoop = ball(0.12, mat(0xff9ad5, { roughness: 0.5 }), 0, -0.2, 0, undefined, 12); cone2.add(scoop); s.scoop = scoop; s.scoopFly = loose(sc, ball(0.12 * 0.62, mat(0xff9ad5, { roughness: 0.5 }), 0, 0, 0, undefined, 12));
}
{ // barbershop: hedge trimmer, apron, keys
  const b = S.barber; b.trimmer = hold(b.barber, trimmerMesh(), 1, -1.5); 
  b.keys = hold(b.hero, keysMesh(), 1, 0); b.apronFly = loose(b.sc, rbox(0.82, 0.5, 0.05, mat(0x1f8fe0, { roughness: 0.6 })));
}
{ // city: ladders, mower crew, HELP mown into the afro
  const m = S.market, sc = m.sc; m.stalls.forEach(g => g.visible = true);
  m.ladders = [0, 1, 2].map(() => { const l = ladderMesh(14); l.visible = false; sc.add(l); return l; });
  m.climbers = [0, 1, 2].map(i => { const P = npc(i + 3, { hood: 0xff8a1f, hoodD: 0xff8a1f }); T(P.head, rbox(0.72, 0.16, 0.66, mat(0xffd23f), 0, 0.72, 0)); sc.add(P.root); return P; });
  m.mowers = [0, 1, 2].map(i => { const g = mowerMesh(); const P = npc(i + 5, { hood: 0xff8a1f, hoodD: 0xff8a1f }); P.root.scale.setScalar(0.8); P.root.position.set(0, 0.25, 0.1); g.add(P.root); g.rider = P; g.visible = false; sc.add(g); return g; });
  // HELP letters draw on top (depthTest off): the afro's bumps poke above the mown layer
  m.letters = 'HELP'.split('').map((ch, i) => { const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.4), new THREE.MeshBasicMaterial({ map: letterTex(ch), transparent: true, depthWrite: false, depthTest: false })); pl.rotation.x = -Math.PI / 2; pl.position.set(-0.57 + i * 0.38, 1.95, -0.2); pl.renderOrder = 3; m.hero.afroIn.add(pl); pl.visible = false; return pl; });
  const scr = S.studio.sc.children.find(c => c.isMesh && c.material.isMeshBasicMaterial && c.geometry.type === 'PlaneGeometry' && c.geometry.parameters.width === 6.4);
  scr.material.map = canvasTex(1024, 576, (g, w, h) => { g.fillStyle = '#7fb26a'; g.fillRect(0, 0, w, h); g.fillStyle = '#4a3022'; g.beginPath(); g.arc(w / 2, h / 2, 250, 0, 7); g.fill(); g.fillStyle = '#d9a46a'; g.font = '900 170px Montserrat, Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('HELP', w / 2, h / 2 + 10);
    g.fillStyle = '#E21E39'; g.fillRect(24, 24, 230, 52); g.fillStyle = '#fff'; g.font = '800 34px InterW, Arial'; g.textAlign = 'left'; g.fillText('AERIAL', 44, 62); });
}
{ // space: rocket + giant comb, planet beads, the Earth-top date table, the date on her own planet
  const s = S.space, sc = s.sc;
  const rocket = grp(0, 0, 0, sc); rocket.add(cyl(0.5, 0.5, 2.4, mat(0xf4f4f4, { roughness: 0.3 }), 0, 1.2, 0, 20)); rocket.add(cone(0.5, 0.9, mat(0xe8343c, { roughness: 0.3 }), 0, 2.85, 0, 20)); [0, 2.1, 4.2].forEach(a => { const f = rbox(0.08, 0.7, 0.6, mat(0xe8343c), Math.cos(a) * 0.5, 0.35, Math.sin(a) * 0.5); f.rotation.y = -a; rocket.add(f); });
  const flame = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex('rgba(255,240,180,1)', 'rgba(255,120,30,0.7)'), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); flame.scale.set(1.2, 2.4, 1); flame.position.y = -0.8; rocket.add(flame); rocket.visible = false;
  const comb = combMesh(); comb.scale.setScalar(9); rocket.add(comb); comb.position.set(0, 4.8, 0); comb.rotation.set(0, 0, Math.PI); s.rocket = rocket; s.bigComb = comb;
  s.beads = [0xe8603c, 0x5ac8ff, 0x7affd9, 0xffd23f, 0xc39aff].map((c, i) => { const m = ball(0.9, mat(c, { roughness: 0.4 }), 0, 0, 0, undefined, 20); m.visible = false; sc.add(m); return m; });
  const table = grp(0, -0.04, 0, sc); table.add(cyl(0.5, 0.5, 0.05, mat(0xf4f4f4, { roughness: 0.3 }), 0, 1.2, 0, 24)); table.add(cyl(0.06, 0.06, 1.2, mat(0xc9ced6, { metalness: 0.7 }), 0, 0.6, 0, 10)); table.add(cyl(0.05, 0.05, 0.28, mat(0xfff2d0), 0.1, 1.37, 0.05, 10));
  const fl = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex('rgba(255,250,210,1)', 'rgba(255,170,60,0.6)'), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); fl.scale.set(0.25, 0.4, 1); fl.position.set(0.1, 1.6, 0.05); table.add(fl);
  table.add(cyl(0.012, 0.012, 0.4, mat(0x2bb673), -0.15, 1.4, -0.05, 6)); table.add(ball(0.06, mat(0xe8343c, { roughness: 0.5 }), -0.15, 1.62, -0.05, undefined, 10));
  s.chairs = [-1, 1].map(sx => { const c = grp(sx * 0.95, -0.04, 0, sc); c.add(rbox(0.6, 0.07, 0.6, mat(0xe8343c, { roughness: 0.4 }), 0, 0.8, 0)); c.add(rbox(0.07, 0.75, 0.6, mat(0xe8343c, { roughness: 0.4 }), sx * 0.28, 1.15, 0)); [[-0.25, -0.25], [0.25, -0.25], [-0.25, 0.25], [0.25, 0.25]].forEach(([x, z]) => c.add(rbox(0.05, 0.8, 0.05, mat(0xc9ced6), x, 0.4, z))); c.visible = false; return c; });
  table.visible = false; s.table = table;
  const dp = grp(0, 0, 0, sc); const pg = new THREE.IcosahedronGeometry(1, 3).toNonIndexed(); { const pos = pg.attributes.position, cols = [], r2 = rnd(19); for (let i = 0; i < pos.count; i += 3) { const c = new THREE.Color([0xff9ad5, 0xc39aff, 0xffb6e1][Math.floor(r2() * 3)]); for (let k = 0; k < 3; k++) cols.push(c.r, c.g, c.b); } pg.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); }
  const planet = new THREE.Mesh(pg, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.6 })); planet.scale.setScalar(6); planet.position.y = -6; planet.receiveShadow = true; dp.add(planet);
  const date = makeRig({ hood: 0xff5c8a, hoodD: 0xd6457f, pants: 0x2d3a63, skin: 0x8d5a3b, hair: 0x2a1d17, noHood: true, hairStyle: 'none', afro: true, afroC: 0x3a2418, afroC2: 0x4a2c1e }); dp.add(date.root);
  [-1, 1].forEach(sx => date.head.add(ball(0.06, mat(0xffd23f, { metalness: 0.7, roughness: 0.3 }), sx * 0.35, 0.2, 0.02, undefined, 10))); date.head.add(rbox(0.2, 0.05, 0.02, mat(0xd6457f), 0, 0.15, 0.31));
  const dSkin = new THREE.Mesh(new THREE.SphereGeometry(1.06, 40, 28), new THREE.MeshBasicMaterial({ map: s.galSkin.material.map, color: 0xffb0e0, transparent: true, opacity: 0.85, toneMapped: false, depthWrite: false })); dSkin.position.set(0, 0.8, -0.2); dSkin.scale.set(1, 0.8, 1); date.afroIn.add(dSkin);
  dp.visible = false; s.datePlanet = dp; s.date = date;
}
{ // ---- capsule interior (Day 7): astronaut at the round window, the Moon stuck in the comb outside
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x10141f);
  lightRig(sc, { sky: 0xdfe8ff, ground: 0x30384a, hemi: 0.6, keyC: 0xfff4e0, key: 1.3, keyPos: [2, 4, 5], target: [0, 1.6, 0], rim: 0.9, rimC: 0x9fd0ff, rimPos: [-3, 3, -4], env: 0.5, R: 6 });
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.2, 6, 24, 1, true), new THREE.MeshStandardMaterial({ color: 0xc9ced6, roughness: 0.6, side: THREE.BackSide })); wall.position.y = 2; wall.receiveShadow = true; sc.add(wall);
  sc.add(rbox(7, 0.2, 7, mat(0x4a505c, { roughness: 0.7 }), 0, -0.1, 0)); for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283; const p = rbox(0.5, 0.3, 0.1, mat([0x2bd96b, 0xffb020, 0x5ac8ff][i % 3], { emissive: [0x2bd96b, 0xffb020, 0x5ac8ff][i % 3], emissiveIntensity: 0.9 }), Math.sin(a) * 3.1, 1.2 + (i % 2) * 1.6, Math.cos(a) * 3.1); p.lookAt(0, p.position.y, 0); sc.add(p); }
  const view = canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#05061a'; g.fillRect(0, 0, w, h); const r2 = rnd(3); for (let i = 0; i < 260; i++) { g.fillStyle = '#fff'; g.globalAlpha = 0.4 + r2() * 0.6; g.fillRect(r2() * w, r2() * h, 2, 2); } g.globalAlpha = 1;
    g.fillStyle = '#4a3022'; g.beginPath(); g.arc(80, 520, 300, 0, 7); g.fill(); g.fillStyle = '#ffd23f'; g.save(); g.translate(300, 230); g.rotate(-0.5); g.fillRect(-150, -18, 300, 36); for (let i = 0; i < 9; i++) g.fillRect(-140 + i * 34, 18, 12, 90); g.restore();
    const mg = g.createRadialGradient(330, 250, 10, 330, 270, 95); mg.addColorStop(0, '#f4f4f8'); mg.addColorStop(1, '#a9a9b4'); g.fillStyle = mg; g.beginPath(); g.arc(330, 270, 90, 0, 7); g.fill(); g.fillStyle = '#8a8a96'; [[300, 250, 16], [360, 300, 12], [340, 230, 9]].forEach(([x, y, r]) => { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }); });
  const win = new THREE.Mesh(new THREE.CircleGeometry(1.1, 40), new THREE.MeshBasicMaterial({ map: view, toneMapped: false })); win.position.set(0.9, 2.3, -3.05); sc.add(win);
  const rimW = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.12, 10, 40), mat(0x8a8f98, { metalness: 0.7, roughness: 0.3 })); rimW.position.copy(win.position); sc.add(rimW);
  const astro = makeRig({ hood: 0xe9ecf1, hoodD: 0xc9ced8, pants: 0xdfe3ea, skin: 0x8d5a3b, hair: 0x15100d, noHood: true, helmet: true, pack: true, shoe: 0xdddddd }); sc.add(astro.root); astro.spine.add(rbox(0.18, 0.12, 0.03, mat(0x1f8fe0), 0.22, 0.62, 0.245));
  S.capsule = { sc, astro, win };
}
