
// ---------------------------------------------------------------- extra helpers (this episode)
const T = (p, c) => (p.add(c), c);
const glowTex = (c0, c1) => canvasTex(256, 256, (g) => { const gr = g.createRadialGradient(128, 128, 6, 128, 128, 128); gr.addColorStop(0, c0); gr.addColorStop(0.35, c1); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); });
function cyl(rt, rb, h, c, x = 0, y = 0, z = 0, seg = 28, o) { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), c && c.isMaterial ? c : mat(c, o)); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; return m; }
function cone(r, h, c, x = 0, y = 0, z = 0, seg = 24, o) { const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), c && c.isMaterial ? c : mat(c, o)); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; return m; }
const zincTex = canvasTex(256, 64, (g, w, h) => { for (let i = 0; i < 16; i++) { const gr = g.createLinearGradient(i * 16, 0, i * 16 + 16, 0); gr.addColorStop(0, '#9da3ab'); gr.addColorStop(0.5, '#e8ecf0'); gr.addColorStop(1, '#8d939b'); g.fillStyle = gr; g.fillRect(i * 16, 0, 16, h); } });
zincTex.wrapS = zincTex.wrapT = THREE.RepeatWrapping;
function house(sc, x, z, w, h, d, wall, roof, ry = 0) { const g = grp(x, 0, z, sc); g.rotation.y = ry; g.add(rbox(w, h, d, wall, 0, h / 2, 0)); g.add(rbox(w + 0.9, 0.18, d + 1.0, roof, 0, h + 0.15, 0)); g.add(rbox(w + 0.6, 0.12, d + 0.7, mat(0xaab0b8, { roughness: 0.4, metalness: 0.4 }), 0, h + 0.3, 0));
  const wm = mat(0x7fb7d9, { roughness: 0.1, metalness: 0.4 }); for (let i = 0; i < Math.floor(w / 2.2); i++) g.add(rbox(0.9, 0.9, 0.06, wm, -w / 2 + 1.2 + i * 2.2, h * 0.58, d / 2 + 0.02)); g.add(rbox(0.9, 1.7, 0.08, mat(0x4a2f22), w / 2 - 1.0, 0.85, d / 2 + 0.03)); return g; }
function palm(sc, x, z, s = 1, lean = 0.15) { const g = grp(x, 0, z, sc); const trunk = mat(0x8a6a48, { roughness: 0.8 }); for (let i = 0; i < 7; i++) { const t = i / 6; g.add(cyl(0.2 - 0.06 * t, 0.22 - 0.06 * t, 1.0, trunk, Math.sin(t * 1.4) * lean * 4, 0.5 + i * 0.95, 0, 10)); }
  const top = grp(Math.sin(1.4) * lean * 4, 6.9, 0, g); const leaf = mat(0x3fa24a, { roughness: 0.5, side: THREE.DoubleSide }); for (let i = 0; i < 9; i++) { const f = grp(0, 0, 0, top); f.rotation.y = i / 9 * Math.PI * 2; f.rotation.z = -0.55; f.add(rbox(2.3, 0.05, 0.5, leaf, 1.15, 0, 0)); } g.scale.setScalar(s); return g; }
const PAL = [[0xe8a317, 0x2d3a63, 0x8d5a3b, 0x15100d], [0x2bb673, 0x4b3a2a, 0x6e4528, 0x15100d], [0x9b59d6, 0x2b2b2b, 0x7a4a2e, 0x1a1210], [0xe8343c, 0x3b4a6b, 0x8d5a3b, 0x15100d], [0x1f8fe0, 0x5b4636, 0x6b4128, 0x111111], [0xff8c5a, 0x2f3a52, 0x7a4a2e, 0x1a1210], [0xf4f4f4, 0x30343c, 0x8d5a3b, 0x15100d], [0x20a0a0, 0x444444, 0x6e4528, 0x1a1210]];
function npc(i, o = {}) { const c = PAL[i % PAL.length]; return makeRig({ hood: c[0], hoodD: c[0], pants: c[1], skin: c[2], hair: c[3], noHood: true, hairStyle: i % 3 === 1 ? 'long' : 'short', ...o }); }
const newHero = (sc) => { const P = makeRig({ afro: true }); sc.add(P.root); P.comb = addComb(P); return P; };
function combMesh() { const g = grp(); const cm = mat(0xffd23f, { roughness: 0.35 }); g.add(rbox(0.07, 0.28, 0.07, cm, 0, -0.02, 0)); g.add(rbox(0.26, 0.06, 0.07, cm, 0, -0.18, 0)); for (let i = 0; i < 6; i++) g.add(rbox(0.025, 0.24, 0.025, cm, -0.11 + i * 0.044, -0.32, 0)); return g; }
function addComb(P) {   // afro pick in the right hand
  const g = combMesh(); g.position.set(0, -0.48, 0.04); P.arms[1].el.add(g); g.rotation.x = -1.4; g.visible = false; return g; }
function loose(sc, m) { m.visible = false; sc.add(m); return m; }
function sock() { const g = grp(); g.add(rbox(0.16, 0.12, 0.42, mat(0xf4f4f4, { roughness: 0.9 }), 0, 0, 0)); g.add(rbox(0.17, 0.13, 0.08, mat(0xe8343c, { roughness: 0.9 }), 0, 0, -0.17)); g.add(rbox(0.16, 0.22, 0.14, mat(0xf4f4f4, { roughness: 0.9 }), 0, 0.1, 0.16)); return g; }
function remote() { const g = grp(); g.add(rbox(0.17, 0.06, 0.52, mat(0x2a2a30, { roughness: 0.4 }))); [[0, 0.17, 0xe8343c], [-0.04, 0.05, 0xffffff], [0.04, 0.05, 0xffffff], [0, -0.05, 0xffffff]].forEach(([x, z, c]) => g.add(rbox(0.05, 0.03, 0.05, mat(c), x, 0.04, z))); return g; }
function makeBird(col = 0xffb84d) {
  const g = grp(); const bm = mat(col, { roughness: 0.5 }); const body = ball(0.22, bm, 0, 0.22, 0, undefined, 18); body.scale.set(1, 0.95, 1.05); g.add(body);
  const head = grp(0, 0.42, 0.06, g); head.add(ball(0.15, bm, 0, 0, 0, undefined, 16)); head.add(cone(0.05, 0.12, mat(0xff7a1a), 0, -0.01, 0.17, 10)).children; head.children[1].rotation.x = Math.PI / 2;
  const beakLo = cone(0.04, 0.09, mat(0xe05a10), 0, -0.04, 0.15, 10); beakLo.rotation.x = Math.PI / 2; head.add(beakLo);
  for (const sx of [-1, 1]) { head.add(ball(0.045, mat(0xffffff, { roughness: 0.2 }), sx * 0.07, 0.04, 0.12, undefined, 10)); head.add(ball(0.025, mat(0x111111), sx * 0.075, 0.04, 0.155, undefined, 8)); }
  const wings = [-1, 1].map(sx => { const w = grp(sx * 0.2, 0.28, 0, g); w.add(rbox(0.05, 0.16, 0.26, mat(col === 0xffb84d ? 0xe89a2a : 0x3a7ac0, { roughness: 0.5 }), sx * 0.02, -0.04, -0.02)); return w; });
  g.add(rbox(0.04, 0.1, 0.04, mat(0xff7a1a), -0.06, 0.02, 0.02)); g.add(rbox(0.04, 0.1, 0.04, mat(0xff7a1a), 0.06, 0.02, 0.02));
  g.userData = { head, wings, beakLo }; return g;
}
function birdAnim(b, O, ph = 0, talk = false, fly = 0) { const u = b.userData; u.head.rotation.y = Math.sin(O * 1.7 + ph) * 0.4; u.head.rotation.x = Math.sin(O * 2.3 + ph) * 0.1; const f = fly ? Math.sin(O * 38 + ph) * 1.1 : Math.sin(O * 3 + ph) * 0.06; u.wings[0].rotation.z = -0.1 - f; u.wings[1].rotation.z = 0.1 + f;
  u.beakLo.rotation.x = Math.PI / 2 + (talk && Math.sin(O * 24) > -0.2 ? 0.45 + 0.2 * Math.abs(Math.sin(O * 13)) : 0); }
function kite(col, col2) { const g = grp(); const sh = new THREE.Shape(); sh.moveTo(0, 0.7); sh.lineTo(0.45, 0); sh.lineTo(0, -0.95); sh.lineTo(-0.45, 0); sh.closePath();
  const m = new THREE.Mesh(new THREE.ShapeGeometry(sh), new THREE.MeshStandardMaterial({ color: col, roughness: 0.6, side: THREE.DoubleSide })); m.castShadow = true; g.add(m);
  const m2 = new THREE.Mesh(new THREE.ShapeGeometry(sh), new THREE.MeshStandardMaterial({ color: col2, roughness: 0.6, side: THREE.DoubleSide })); m2.scale.set(0.5, 0.5, 1); m2.position.z = 0.01; g.add(m2);
  g.tail = [...Array(5)].map((_, i) => { const b = rbox(0.14, 0.08, 0.02, [col2, col][i % 2], 0, -1.1 - i * 0.28, 0); g.add(b); return b; }); return g; }
function stars(n, r, size, seed, yMin = -1) { const sr = rnd(seed), sp = []; for (let i = 0; i < n; i++) { const v = V([sr() * 2 - 1, yMin + sr() * (1 - yMin), sr() * 2 - 1]).normalize().multiplyScalar(r); sp.push(v.x, v.y, v.z); }
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3)); return new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: size * RS, sizeAttenuation: false, toneMapped: false, transparent: true, opacity: 1 })); }
const galT = (c0, c1, seed = 5) => canvasTex(512, 512, (g) => { g.translate(256, 256); const r2 = rnd(seed); for (let k = 0; k < 2600; k++) { const arm = k % 3, t = Math.pow(r2(), 0.6); const a = t * 9 + arm * 2.094 + (r2() - 0.5) * 0.5, r = t * 230; g.fillStyle = r2() < 0.5 ? c0 : c1; g.globalAlpha = 0.25 + r2() * 0.5; g.beginPath(); g.arc(Math.cos(a) * r, Math.sin(a) * r * 0.55, 1.2 + r2() * 3, 0, 7); g.fill(); } g.globalAlpha = 1; const cg = g.createRadialGradient(0, 0, 0, 0, 0, 70); cg.addColorStop(0, 'rgba(255,255,230,1)'); cg.addColorStop(1, 'rgba(255,200,120,0)'); g.fillStyle = cg; g.fillRect(-256, -256, 512, 512); });
function moonMesh(r = 1) { const g = new THREE.IcosahedronGeometry(1, 2).toNonIndexed(); const pos = g.attributes.position, cols = [], r2 = rnd(9); for (let i = 0; i < pos.count; i += 3) { const c = new THREE.Color(r2() < 0.2 ? 0x9a9aa2 : (r2() < 0.5 ? 0xc9c9cf : 0xb7b7bf)); for (let k = 0; k < 3; k++) cols.push(c.r, c.g, c.b); } g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.85 })); m.scale.setScalar(r); m.castShadow = true; return m; }

// ---------------------------------------------------------------- SCENES
const S = {};
{ // ---- bedroom (title, Day 1, Day 2)
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x2a2230);
  lightRig(sc, { sky: 0xfff0dc, ground: 0x8a6a50, hemi: 0.55, keyC: 0xffe0b0, key: 1.6, keyPos: [6, 6, 4], target: [0, 1, 0], rim: 0.6, rimC: 0xffb070, rimPos: [-5, 4, -4], env: 0.5, R: 8 });
  sc.add(rbox(14, 0.2, 12, mat(0xb98a5a, { roughness: 0.6 }), 0, -0.1, 0)); sc.add(rbox(4.4, 0.03, 3.0, mat(0x3a7ac0, { roughness: 0.95 }), 0.3, 0.02, 0.6));
  sc.add(rbox(14, 6, 0.3, mat(0x9fd3c7, { roughness: 0.9 }), 0, 3, -3.2)); sc.add(rbox(0.3, 6, 12, mat(0x8cc4b8, { roughness: 0.9 }), -5.2, 3, 0)); sc.add(rbox(14, 0.3, 0.34, mat(0xf4f4f4, { roughness: 0.6 }), 0, 0.15, -3.0));
  const win = grp(3.2, 2.6, -3.04, sc); win.add(rbox(2.4, 2.0, 0.08, mat(0xffffff, { roughness: 0.4 }), 0, 0, 0)); win.add(rbox(2.1, 1.7, 0.06, mat(0xfff2c8, { emissive: 0xffd88a, emissiveIntensity: 1.1 }), 0, 0, 0.03)); win.add(rbox(0.08, 1.7, 0.08, mat(0xffffff), 0, 0, 0.06)); win.add(rbox(2.1, 0.08, 0.08, mat(0xffffff), 0, 0, 0.06));
  const sun = new THREE.SpotLight(0xffd9a0, 40, 18, 0.5, 0.6, 1.4); sun.position.set(3.4, 3.4, -2.6); sun.target.position.set(0.5, 0, 1.5); sc.add(sun, sun.target);
  const bed = grp(-3.0, 0, -1.2, sc); bed.add(rbox(2.4, 0.5, 3.4, mat(0x6e4a2e, { roughness: 0.6 }), 0, 0.25, 0)); bed.add(rbox(2.3, 0.35, 3.2, mat(0xf4f4f4, { roughness: 0.9 }), 0, 0.65, 0.05)); bed.add(rbox(2.3, 0.2, 2.0, mat(0xe8343c, { roughness: 0.9 }), 0, 0.86, 0.65));  bed.add(rbox(2.4, 1.3, 0.2, mat(0x6e4a2e, { roughness: 0.6 }), 0, 0.85, -1.75));
  const dres = grp(1.6, 0, -2.7, sc); dres.add(rbox(1.6, 1.0, 0.7, mat(0xe8e1d0, { roughness: 0.6 }), 0, 0.5, 0)); [0.3, 0.7].forEach(y => dres.add(rbox(1.4, 0.04, 0.02, mat(0xb0a690), 0, y, 0.36))); 
  const plant = grp(4.6, 0, -2.4, sc); plant.add(cyl(0.3, 0.24, 0.5, mat(0xd96b3a, { roughness: 0.7 }), 0, 0.25, 0, 16)); [[0, 1.0, 0, 0.45], [0.3, 0.8, 0.1, 0.32], [-0.3, 0.85, 0, 0.34]].forEach(([a, b, c, r]) => plant.add(ball(r, mat(0x3f9a3f, { roughness: 0.55 }), a, b, c, undefined, 14)));
  const poster = rbox(1.4, 1.9, 0.04, mat(0xffd23f, { roughness: 0.6 }), -1.0, 3.2, -3.04); sc.add(poster); sc.add(ball(0.45, mat(0xe8343c, { roughness: 0.5 }), -1.0, 3.35, -3.0, undefined, 16)); sc.add(rbox(1.0, 0.15, 0.04, mat(0x1f8fe0), -1.0, 2.6, -3.0));
  const mirror = grp(-5.0, 0, 1.4, sc); mirror.rotation.y = Math.PI / 2; mirror.add(rbox(1.3, 2.6, 0.12, mat(0x6e4a2e, { roughness: 0.5 }), 0, 1.5, 0)); mirror.add(rbox(1.1, 2.4, 0.04, mat(0xdfe8f0, { roughness: 0.02, metalness: 1, envMapIntensity: 1.6 }), 0, 1.5, 0.06));
  const hero = newHero(sc);
  const flyers = [cyl(0.12, 0.12, 0.3, mat(0xff8a1f, { roughness: 0.4 }), 0, 0, 0, 14), cyl(0.08, 0.08, 0.4, mat(0x2bb673, { roughness: 0.4 }), 0, 0, 0, 14), rbox(0.4, 0.08, 0.5, mat(0x1f8fe0, { roughness: 0.6 }))].map(m => { sc.add(m); return m; });
  const side = grp(1.15, 0, 0.0, sc); side.add(rbox(0.7, 0.06, 0.6, mat(0xa9763f, { roughness: 0.5 }), 0, 0.85, 0)); [[-0.3, -0.25], [0.3, -0.25], [-0.3, 0.25], [0.3, 0.25]].forEach(([x, z]) => side.add(rbox(0.06, 0.82, 0.06, mat(0x7a4a2e), x, 0.41, z)));
  const flyHome = [V([1.0, 1.03, -0.05]), V([1.3, 1.08, 0.1]), V([1.15, 1.0, -0.15])];   // bottle, bottle, book on the side table next to him
  const combFly = loose(sc, combMesh()), sockM = loose(sc, sock()), remoteM = loose(sc, remote());
  S.room = { sc, hero, flyers, flyHome, combFly, sockM, remoteM };
}
{ // ---- street (Days 3 and 5): houses, poles + wires, birds, kites, a kid
  const sc = new THREE.Scene(); sc.add(skyDome('#4f86c8', '#9fd0f0', '#ffe9c0'));
  lightRig(sc, { sky: 0xe6f3ff, ground: 0x9a7e5a, hemi: 0.55, keyC: 0xfff0d8, key: 1.8, keyPos: [-8, 12, 10], target: [0, 0, 0], rim: 0.5, rimC: 0xbfe0ff, rimPos: [8, 5, -8], env: 0.45, R: 16 });
  sc.add(rbox(120, 0.2, 9, mat(0x59606e, { roughness: 0.7 }), 0, -0.1, 3.8)); sc.add(rbox(120, 0.22, 7, mat(0xcaa87a, { roughness: 0.9 }), 0, -0.09, -3.4)); for (let x = -40; x < 40; x += 3.2) sc.add(rbox(1.5, 0.02, 0.16, mat(0xffffff, { roughness: 0.4 }), x, 0.01, 3.8));
  const cols = [0xf4a259, 0x7ec8e3, 0xe9c46a, 0xf08a8a, 0xa8d5a2, 0xf2cf6b];
  for (let i = 0; i < 6; i++) house(sc, -12 + i * 4.8, -9.4, 4.2, 3.4, 4.0, mat(cols[i], { roughness: 0.85 }), mat(0x8b5a3c, { roughness: 0.6 }));
  const poles = [-14, -4, 6, 16]; poles.forEach(x => { sc.add(rbox(0.22, 7.0, 0.22, mat(0x7a5a3a, { roughness: 0.8 }), x, 3.5, -2.8)); sc.add(rbox(2.2, 0.14, 0.14, mat(0x7a5a3a), x, 6.5, -2.8)); });
  for (const dz of [-0.9, 0, 0.9]) for (let k = 0; k < 3; k++) { const a = poles[k], b = poles[k + 1], pts = []; for (let i = 0; i <= 16; i++) { const u = i / 16; pts.push(V([lerp(a, b, u), 6.62 - 0.55 * Math.sin(u * Math.PI), -2.8 + dz * 0.4])); } sc.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x1a1a1a }))); }
  palm(sc, -17, -5, 1.2, 0.1); palm(sc, 22, -5, 1.2, -0.1); palm(sc, 9, -6.5, 1.0, 0.12);
  const people = [...Array(4)].map((_, i) => { const P = npc(i + 2); sc.add(P.root); return P; });
  const hero = newHero(sc);
  const birds = [0xffb84d, 0x5aa0e6, 0xffb84d, 0x5aa0e6, 0xffb84d, 0x5aa0e6].map(c => { const b = makeBird(c); sc.add(b); return b; });
  const line = grp(0, 0, 0, sc); line.add(rbox(0.9, 0.04, 0.04, mat(0x7a5a3a), 0, 0, 0)); [0xe8343c, 0xffffff, 0x2bb673].forEach((c, i) => line.add(rbox(0.16, 0.2, 0.02, mat(c, { roughness: 0.8 }), -0.28 + i * 0.28, -0.13, 0)));
  const kites = [[0xe8343c, 0xffd23f], [0x1f8fe0, 0xffffff], [0x2bb673, 0xffd23f], [0xff8a1f, 0x9b59d6], [0xffd23f, 0xe8343c], [0x9b59d6, 0x7affd9]].map(([a, b]) => { const k = kite(a, b); sc.add(k); return k; });
  const ballF = ball(0.32, mat(0xffffff, { roughness: 0.4 }), 0, 0, 0, undefined, 18); sc.add(ballF); [0, 1.3, 2.6, 3.9, 5.2].forEach((a) => { const p = rbox(0.14, 0.14, 0.04, mat(0x111111), Math.cos(a) * 0.29, Math.sin(a) * 0.29, 0.12); ballF.add(p); });
  const slipper = grp(0, 0, 0, sc); slipper.add(rbox(0.36, 0.06, 0.9, mat(0x1f8fe0, { roughness: 0.5 }))); slipper.add(rbox(0.38, 0.05, 0.12, mat(0xffffff), 0, 0.06, 0.15));
  const kid = makeRig({ hood: 0xffd23f, hoodD: 0xe0b020, pants: 0x2d3a63, skin: 0x7a4a2e, hair: 0x15100d, noHood: true }); kid.root.scale.setScalar(0.62); sc.add(kid.root);
  const kidKite = grp(0, -0.5, 0.05, kid.arms[0].el); kidKite.add(cyl(0.01, 0.01, 2.4, mat(0xf4f4f4), 0, 1.0, 0, 4));
  const twig = loose(sc, rbox(0.05, 0.05, 0.55, mat(0x7a5a3a, { roughness: 0.8 })));
  const strG = new THREE.BufferGeometry().setFromPoints([V([0, 0, 0]), V([0, 1, 0])]); const string = new THREE.Line(strG, new THREE.LineBasicMaterial({ color: 0xffffff })); string.frustumCulled = false; sc.add(string);
  S.street = { sc, hero, people, birds, line, kites, ballF, slipper, kid, twig, string };
}
{ // ---- barbershop (Day 4 + ending)
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x1e2430);
  lightRig(sc, { sky: 0xf2f6ff, ground: 0x6a6070, hemi: 0.6, keyC: 0xfff4e0, key: 1.5, keyPos: [3, 7, 6], target: [0, 1, 0], rim: 0.7, rimC: 0x9fd0ff, rimPos: [-6, 5, -5], env: 0.55, R: 9 });
  const tile = canvasTex(256, 256, (g, w, h) => { for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { g.fillStyle = (x + y) % 2 ? '#f2f2f2' : '#2a2a30'; g.fillRect(x * 32, y * 32, 32, 32); } }); tile.wrapS = tile.wrapT = THREE.RepeatWrapping; tile.repeat.set(4, 4);
  const fl = new THREE.Mesh(rgeo(16, 0.2, 14), new THREE.MeshStandardMaterial({ map: tile, roughness: 0.35 })); fl.position.y = -0.1; fl.receiveShadow = true; sc.add(fl);
  sc.add(rbox(16, 7, 0.3, mat(0xf0e6d2, { roughness: 0.85 }), 0, 3.5, -3.4)); sc.add(rbox(0.3, 7, 14, mat(0xe2d5bd, { roughness: 0.85 }), -6.2, 3.5, 0)); sc.add(rbox(16, 1.1, 0.34, mat(0x2bb673, { roughness: 0.6 }), 0, 0.55, -3.2));
  sc.add(rbox(6.4, 2.6, 0.08, mat(0xdfe8f0, { roughness: 0.03, metalness: 1, envMapIntensity: 1.6 }), 0.2, 2.6, -3.2)); sc.add(rbox(6.7, 0.14, 0.14, mat(0x6e4a2e), 0.2, 3.95, -3.18)); sc.add(rbox(6.7, 0.14, 0.14, mat(0x6e4a2e), 0.2, 1.25, -3.18));
  sc.add(rbox(6.6, 0.12, 0.6, mat(0xf4f4f4, { roughness: 0.3 }), 0.2, 1.15, -2.9)); const bottles = [[-2.2, 0x1f8fe0], [-1.8, 0xe8343c], [-1.4, 0xffd23f], [2.0, 0x2bb673], [2.4, 0x9b59d6]].map(([x, c]) => { const m = cyl(0.09, 0.09, 0.36, mat(c, { roughness: 0.2 }), x, 1.39, -2.9, 12); sc.add(m); m.userData.home = m.position.clone(); return m; });
  const stripe = canvasTex(64, 256, (g, w, h) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); for (let i = -4; i < 12; i++) { g.fillStyle = i % 2 ? '#e8343c' : '#1f6fd0'; g.beginPath(); g.moveTo(0, i * 32); g.lineTo(w, i * 32 + 48); g.lineTo(w, i * 32 + 64); g.lineTo(0, i * 32 + 16); g.fill(); } }); stripe.wrapT = THREE.RepeatWrapping;
  const pole = cyl(0.22, 0.22, 1.6, new THREE.MeshStandardMaterial({ map: stripe, roughness: 0.2 }), 4.4, 2.4, -3.05, 20); sc.add(pole); sc.add(ball(0.26, mat(0xdfe4ea, { metalness: 0.8, roughness: 0.2 }), 4.4, 3.3, -3.05, undefined, 14)); sc.add(ball(0.26, mat(0xdfe4ea, { metalness: 0.8, roughness: 0.2 }), 4.4, 1.5, -3.05, undefined, 14));
  const chair = grp(0, 0, 0, sc); const red = mat(0xc8202a, { roughness: 0.35 }), chrome = mat(0xdfe4ea, { metalness: 0.9, roughness: 0.2 }); chair.add(cyl(0.6, 0.7, 0.12, chrome, 0, 0.06, 0, 24)); chair.add(cyl(0.12, 0.12, 0.5, chrome, 0, 0.35, 0, 12)); chair.add(rbox(1.1, 0.25, 1.0, red, 0, 0.7, 0)); chair.add(rbox(1.1, 1.3, 0.22, red, 0, 1.35, -0.45)); [-0.6, 0.6].forEach(x => chair.add(rbox(0.16, 0.14, 0.9, chrome, x, 1.0, 0.0))); chair.add(rbox(0.7, 0.08, 0.3, chrome, 0, 0.3, 0.6));
  const cape = new THREE.Mesh(new THREE.ConeGeometry(0.85, 1.3, 24, 1, true), new THREE.MeshStandardMaterial({ color: 0x2a2f3a, roughness: 0.6, side: THREE.DoubleSide })); cape.castShadow = true; sc.add(cape);
  const hero = newHero(sc);
  const barber = makeRig({ hood: 0xf4f4f4, hoodD: 0xdfe3ea, pants: 0x2a2f3a, skin: 0x6b4128, hair: 0x15100d, noHood: true, hairStyle: 'short' }); sc.add(barber.root); const apron = T(barber.spine, rbox(0.82, 0.5, 0.05, mat(0x1f8fe0, { roughness: 0.6 }), 0, 0.25, 0.24));
  const clip = grp(0, -0.5, 0.05, barber.arms[1].el); clip.add(rbox(0.14, 0.34, 0.12, mat(0x2a2a30, { roughness: 0.3 }), 0, -0.06, 0)); clip.add(rbox(0.16, 0.06, 0.12, mat(0xc9ced6, { metalness: 0.8, roughness: 0.2 }), 0, -0.25, 0)); clip.rotation.x = -1.2;
  const hat = grp(0, 0.66, 0, barber.head); hat.add(new THREE.Mesh(new THREE.SphereGeometry(0.44, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat(0xffd23f, { roughness: 0.35 }))); hat.add(cyl(0.52, 0.52, 0.05, mat(0xffd23f, { roughness: 0.35 }), 0, 0.0, 0.05, 24));
  const torch = cyl(0.09, 0.09, 0.14, mat(0x2a2a30), 0, 0.2, 0.42, 12); torch.rotation.x = Math.PI / 2; hat.add(torch); const lens = cyl(0.075, 0.075, 0.02, mat(0xfff6c8, { emissive: 0xfff2b0, emissiveIntensity: 3 }), 0, 0.2, 0.5, 12); lens.rotation.x = Math.PI / 2; hat.add(lens);
  const beam = new THREE.SpotLight(0xfff2c8, 0, 8, 0.35, 0.5, 1.2); beam.position.set(0, 0.2, 0.5); hat.add(beam); const bt = grp(0, -1.0, 4, hat); beam.target = bt; hat.visible = false;
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex('rgba(255,250,220,1)', 'rgba(255,230,160,0.4)'), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); glow.scale.setScalar(0.6); glow.position.set(0, 0.2, 0.55); hat.add(glow);
  const spark = debrisPool(sc, 10, [0xffe08a, 0xffffff]);
  const crack = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 2.6), new THREE.MeshBasicMaterial({ map: canvasTex(640, 260, (g, w, h) => { g.strokeStyle = 'rgba(255,255,255,0.95)'; g.lineWidth = 2.2; const r2 = rnd(12); const cx = w * 0.5, cy = h * 0.35;
    for (let k = 0; k < 14; k++) { let x = cx, y = cy, a = k / 14 * 6.283 + r2() * 0.3; g.beginPath(); g.moveTo(x, y); for (let s = 0; s < 6; s++) { a += (r2() - 0.5) * 0.6; x += Math.cos(a) * (20 + r2() * 40); y += Math.sin(a) * (20 + r2() * 40); g.lineTo(x, y); } g.stroke(); }
    for (let r = 30; r < 160; r += 45) { g.beginPath(); for (let k = 0; k <= 14; k++) { const a = k / 14 * 6.283, rr2 = r * (0.8 + r2() * 0.4); g.lineTo(cx + Math.cos(a) * rr2, cy + Math.sin(a) * rr2 * 0.8); } g.stroke(); } }), transparent: true, opacity: 0, depthWrite: false, toneMapped: false }));
  crack.position.set(0.2, 2.6, -3.15); sc.add(crack);
  const smoke = [...Array(10)].map(() => { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), new THREE.MeshStandardMaterial({ color: 0x55555c, transparent: true, opacity: 0, roughness: 1, depthWrite: false })); m.castShadow = false; sc.add(m); return m; });
  const clipFly = loose(sc, (() => { const g = grp(); g.add(rbox(0.14, 0.34, 0.12, mat(0x2a2a30, { roughness: 0.3 }), 0, -0.06, 0)); g.add(rbox(0.16, 0.06, 0.12, mat(0xc9ced6, { metalness: 0.8, roughness: 0.2 }), 0, -0.25, 0)); return g; })());
  const combOut = loose(sc, combMesh());
  S.barber = { apron, sc, hero, chair, cape, barber, clip, hat, beam, pole, spark, crack, bottles, smoke, clipFly, combOut };
}
{ // ---- market from above (Day 6): stalls, traders, the giant afro's shadow
  const sc = new THREE.Scene(); sc.add(skyDome('#3f7fd0', '#a8d8f5', '#fff0cc', 180));
  const key = lightRig(sc, { sky: 0xe6f3ff, ground: 0xb0905a, hemi: 0.24, keyC: 0xfff2dc, key: 3.0, keyPos: [-40, 63, -29], target: [2, 0, 4], env: 0.18, R: 30, rim: 0.4, rimC: 0xffc080, rimPos: [20, 8, 20] }); key.shadow.mapSize.set(2048, 2048);
  sc.add(rbox(300, 0.3, 300, mat(0xcaa87a, { roughness: 0.95 }), 0, -0.15, 0)); sc.add(rbox(8, 0.04, 80, mat(0x59606e, { roughness: 0.7 }), -10, 0.02, 0));
  const canC = [0xe8343c, 0x1f8fe0, 0xffd23f, 0x2bb673, 0xff8a1f, 0x9b59d6, 0xf4f4f4]; const goods = [0xe8343c, 0xff8a1f, 0x2bb673, 0xffd23f, 0x8a5a2c];
  const stalls = []; for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) { const x = 1 + c * 3.2 + (r % 2) * 0.6, z = -2 + r * 3.4; const g = grp(x, 0, z, sc); g.userData = { home: V([x, 0, z]), r, c }; stalls.push(g); g.add(rbox(2.2, 0.9, 1.2, mat(0x8a5a2c, { roughness: 0.7 }), 0, 0.45, 0)); [-1, 1].forEach(sx => [-1, 1].forEach(sz => g.add(rbox(0.08, 2.2, 0.08, mat(0x6e4a2e), sx * 1.0, 1.1, sz * 0.55))));
    const roof = rbox(2.6, 0.08, 1.7, mat(canC[(r * 6 + c) % 7], { roughness: 0.6 }), 0, 2.25, 0); roof.rotation.x = 0.12; g.add(roof); for (let k = 0; k < 6; k++) g.add(ball(0.13, mat(goods[(k + c) % 5], { roughness: 0.4 }), -0.7 + k * 0.28, 0.98, (k % 2) * 0.2 - 0.1, undefined, 10)); }
  const bl = new THREE.InstancedMesh(rgeo(1, 1, 1), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 }), 260); bl.frustumCulled = false; const br = rnd(8), m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion();
  for (let i = 0; i < 260; i++) { let x = -90 + br() * 180, z = -90 + br() * 180; if (Math.abs(x - 4) < 16 && Math.abs(z - 4) < 14) x += x > 4 ? 16 : -16; if (x > -20 && z > -10) z -= 90; const h = 2 + br() * br() * 10, w = 2.4 + br() * 3; m4.compose(V([x, h / 2, z]), q4, V([w, h, w])); bl.setMatrixAt(i, m4); bl.setColorAt(i, new THREE.Color([0xe8d2a0, 0xd9c7a0, 0xf4a259, 0x7ec8e3, 0xe9c46a, 0xf08a8a, 0xffffff][Math.floor(br() * 7)])); } bl.castShadow = bl.receiveShadow = true; sc.add(bl);
  const traders = [...Array(10)].map((_, i) => { const P = npc(i); sc.add(P.root); const fan = grp(0, -0.5, 0.06, P.arms[1].el); fan.add(rbox(0.3, 0.36, 0.02, mat([0xffd23f, 0xe8343c, 0x2bb673][i % 3], { roughness: 0.6 }), 0, -0.2, 0)); P.fan = fan; return P; });
  const shade = new THREE.Mesh(new THREE.CircleGeometry(1, 48), new THREE.MeshBasicMaterial({ map: canvasTex(256, 256, (g) => { const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, 'rgba(10,14,40,1)'); gr.addColorStop(0.72, 'rgba(10,14,40,0.95)'); gr.addColorStop(1, 'rgba(10,14,40,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); }), transparent: true, opacity: 0.5, depthWrite: false, toneMapped: false }));
  shade.rotation.x = -Math.PI / 2; shade.position.y = 0.03; shade.renderOrder = 1; shade.visible = false; sc.add(shade);
  const hero = newHero(sc);
  S.market = { sc, hero, traders, key, shade, stalls };
}
{ // ---- news studio (Day 6)
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x0b1a3a);
  lightRig(sc, { sky: 0xdfe8ff, ground: 0x30406a, hemi: 0.6, keyC: 0xffffff, key: 1.4, keyPos: [2, 5, 7], target: [0, 1.6, 0], rim: 1.0, rimC: 0x6fb0ff, rimPos: [-5, 4, -4], env: 0.6, R: 8 });
  const scr = canvasTex(1024, 576, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#5fb0ff'); gr.addColorStop(1, '#ffe6b0'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = '#caa87a'; g.fillRect(0, h * 0.72, w, h);
    g.fillStyle = 'rgba(0,0,0,0.25)'; g.beginPath(); g.ellipse(w * 0.62, h * 0.82, w * 0.36, h * 0.09, 0, 0, 7); g.fill();
    g.fillStyle = '#e7b289'; g.fillRect(w * 0.27 - 22, h * 0.5, 44, 50); g.fillStyle = '#d7262e'; g.fillRect(w * 0.27 - 34, h * 0.58, 68, 90); g.fillStyle = '#2a1d17'; g.beginPath(); g.ellipse(w * 0.27, h * 0.3, 190, 150, 0, 0, 7); g.fill();
    for (let i = 0; i < 12; i++) { g.fillStyle = ['#e8343c', '#1f8fe0', '#ffd23f', '#2bb673'][i % 4]; g.fillRect(w * 0.48 + i * 38, h * 0.7, 30, 22); } });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 3.6), new THREE.MeshBasicMaterial({ map: scr, toneMapped: false })); screen.position.set(0, 2.9, -2.6); sc.add(screen); sc.add(rbox(6.7, 3.9, 0.1, mat(0x111827, { roughness: 0.3 }), 0, 2.9, -2.68));
  sc.add(rbox(16, 0.2, 10, mat(0x14244a, { roughness: 0.3, metalness: 0.2 }), 0, -0.1, 0));
  for (let i = 0; i < 7; i++) sc.add(rbox(0.12, 6, 0.12, mat(0x3a7ae0, { emissive: 0x3a7ae0, emissiveIntensity: 1.2 }), -7 + i * 2.33 + (i > 2 ? 2.3 : 0) * 0, 3, -3.4));
  const desk = grp(0, 0, 0.8, sc); desk.add(rbox(3.8, 1.0, 1.2, mat(0x1d2f5a, { roughness: 0.3, metalness: 0.3 }), 0, 0.5, 0)); desk.add(rbox(3.9, 0.08, 1.3, mat(0xdfe4ea, { roughness: 0.15, metalness: 0.6 }), 0, 1.02, 0)); desk.add(rbox(3.8, 0.12, 0.02, mat(0xe21e39, { emissive: 0xe21e39, emissiveIntensity: 0.8 }), 0, 0.6, 0.61));
  const anchor = makeRig({ hood: 0x23304f, hoodD: 0x1a2440, pants: 0x23304f, skin: 0x8d5a3b, hair: 0x15100d, noHood: true, tie: 0xe21e39 }); sc.add(anchor.root);
  desk.add(rbox(0.6, 0.02, 0.4, mat(0xffffff), 0.4, 1.07, 0.1));
  S.studio = { sc, anchor };
}
{ // ---- space (Days 7-9): little Earth, the hero on top, the Moon, Saturn, the galaxy afro
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x05061a);
  const domeT = (a, b, c) => canvasTex(8, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, a); gr.addColorStop(0.5, b); gr.addColorStop(1, c); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const night = new THREE.Mesh(new THREE.SphereGeometry(300, 32, 16), new THREE.MeshBasicMaterial({ map: domeT('#03041a', '#0b1440', '#1a2a6a'), side: THREE.BackSide, toneMapped: false, fog: false })); sc.add(night);
  const violet = new THREE.Mesh(new THREE.SphereGeometry(296, 32, 16), new THREE.MeshBasicMaterial({ map: domeT('#0a0620', '#2b1a6e', '#3A2BD9'), side: THREE.BackSide, toneMapped: false, fog: false, transparent: true, opacity: 0 })); sc.add(violet);
  const st = stars(1400, 280, 2.2, 77); sc.add(st);
  const hemi = new THREE.HemisphereLight(0xb7c6ff, 0x2a2a5a, 0.55); sc.add(hemi); sc.environment = ENV; sc.environmentIntensity = 0.45;
  const sunL = new THREE.DirectionalLight(0xfff0dc, 2.0); sunL.position.set(30, 20, 25); sunL.castShadow = true; sunL.shadow.mapSize.set(2048, 2048); Object.assign(sunL.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 160 }); sunL.shadow.camera.updateProjectionMatrix(); sunL.shadow.bias = -0.0004; sunL.shadow.normalBias = 0.03; sc.add(sunL);
  const rim = new THREE.DirectionalLight(0x9a7aff, 1.0); rim.position.set(-20, 8, -20); sc.add(rim);
  const eG = new THREE.IcosahedronGeometry(1, 4).toNonIndexed(); { const pos = eG.attributes.position, cols = [], v = new THREE.Vector3(); for (let i = 0; i < pos.count; i += 3) { v.set(pos.getX(i), pos.getY(i), pos.getZ(i)); const n = Math.sin(v.x * 3.1) + Math.sin(v.y * 2.7 + 1) + Math.sin(v.z * 3.7 + 2); const c = new THREE.Color(v.y > 0.86 || v.y < -0.86 ? 0xf4f8ff : n > 0.9 ? 0x3fae5a : n > 0.6 ? 0xd9c27a : 0x2a7fd8); for (let k = 0; k < 3; k++) cols.push(c.r, c.g, c.b); } eG.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); }
  const earth = new THREE.Mesh(eG, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.6 })); earth.scale.setScalar(6); earth.position.set(0, -6, 0); earth.receiveShadow = true; sc.add(earth);
  const atm = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex('rgba(120,190,255,0.0)', 'rgba(120,190,255,0.35)'), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); atm.scale.setScalar(17); atm.position.set(0, -6, 0); sc.add(atm);
  const hero = newHero(sc);
  const moon = moonMesh(1.3); sc.add(moon); const moonFace = grp(0, 0, 0, moon); for (const sx of [-1, 1]) { moonFace.add(rbox(0.16, 0.2, 0.04, mat(0x222222), sx * 0.28, 0.15, 0.97)); } moonFace.add(rbox(0.3, 0.2, 0.04, mat(0x3a1512), 0, -0.25, 0.96)); moonFace.scale.setScalar(1 / 1.0);
  const sat = grp(0, 0, 0, sc); const satT = canvasTex(64, 256, (g, w, h) => { const c = ['#f2d49b', '#e8b86a', '#f6e3b8', '#d9a35a', '#f2d49b', '#e9c78a', '#d6a25e', '#f6e3b8']; for (let i = 0; i < 8; i++) { g.fillStyle = c[i]; g.fillRect(0, i * 32, w, 32); } });
  const satB = new THREE.Mesh(new THREE.SphereGeometry(3.4, 40, 28), new THREE.MeshStandardMaterial({ map: satT, roughness: 0.6 })); satB.castShadow = true; sat.add(satB);
  const satFace = grp(0, 0, 0, sat); for (const sx of [-1, 1]) { satFace.add(rbox(0.6, 0.6, 0.1, mat(0xffffff, { roughness: 0.2 }), sx * 1.0, 0.6, 3.25)); const p = rbox(0.3, 0.38, 0.1, mat(0x15110f), sx * 1.0, 0.55, 3.33); satFace.add(p); const lid = rbox(0.66, 0.3, 0.12, mat(0xe8b86a), sx * 1.0, 0.82, 3.3); satFace.add(lid); }
  const satMouth = rbox(0.9, 0.18, 0.1, mat(0x5a2a12), 0, -0.6, 3.28); satFace.add(satMouth); const satO = rbox(0.6, 0.5, 0.1, mat(0x3a1512), 0, -0.6, 3.29); satO.visible = false; satFace.add(satO); [-1, 1].forEach(sx => satFace.add(ball(0.35, mat(0xff9a8a, { roughness: 0.6 }), sx * 1.7, -0.2, 2.9, undefined, 12)));
  const ringT = canvasTex(512, 8, (g, w, h) => { for (let x = 0; x < w; x++) { const u = x / w; const a = 0.35 + 0.55 * Math.abs(Math.sin(u * 40)) * (u > 0.08 ? 1 : 0); g.fillStyle = `rgba(${230 - 40 * Math.sin(u * 9)},${200 - 30 * Math.sin(u * 7)},${150},${a})`; g.fillRect(x, 0, 1, h); } });
  const ringG = new THREE.RingGeometry(1, 1.9, 96, 1); { const uv = ringG.attributes.uv, p = ringG.attributes.position; for (let i = 0; i < uv.count; i++) { const r = Math.hypot(p.getX(i), p.getY(i)); uv.setXY(i, (r - 1) / 0.9, 0.5); } }
  const rings = new THREE.Mesh(ringG, new THREE.MeshStandardMaterial({ map: ringT, transparent: true, side: THREE.DoubleSide, roughness: 0.5, depthWrite: false })); rings.renderOrder = 2; sc.add(rings);
  const galSkin = new THREE.Mesh(new THREE.SphereGeometry(1.06, 40, 28), new THREE.MeshBasicMaterial({ map: canvasTex(1024, 512, (g, w, h) => { g.fillStyle = '#0a0626'; g.fillRect(0, 0, w, h); const r2 = rnd(4); for (let i = 0; i < 1600; i++) { g.fillStyle = ['#ffffff', '#9ab4ff', '#ff9ad5', '#7affd9', '#ffd9a0'][Math.floor(r2() * 5)]; g.globalAlpha = 0.4 + r2() * 0.6; g.beginPath(); g.arc(r2() * w, r2() * h, 0.6 + r2() * 1.8, 0, 7); g.fill(); } g.globalAlpha = 1;
    for (let k = 0; k < 6; k++) { const cx = r2() * w, cy = 80 + r2() * (h - 160); const gr = g.createRadialGradient(cx, cy, 0, cx, cy, 90); gr.addColorStop(0, 'rgba(160,120,255,0.55)'); gr.addColorStop(1, 'rgba(60,40,200,0)'); g.fillStyle = gr; g.fillRect(cx - 90, cy - 90, 180, 180); } }), transparent: true, opacity: 0, toneMapped: false, depthWrite: false }));
  galSkin.position.set(0, 0.8, -0.2); galSkin.scale.set(1, 0.8, 1); hero.afroIn.add(galSkin);
  const galaxies = [['#9ab4ff', '#ffffff', 5], ['#ff9ad5', '#ffd9ff', 6], ['#7affd9', '#ffffff', 7], ['#ffc36a', '#fff0c0', 8], ['#c39aff', '#ffffff', 9]].map(([a, b, s]) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: galT(a, b, s), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, side: THREE.DoubleSide })); sc.add(m); return m; });
  const planets = [[0xe8603c, 1.0], [0x5ac8ff, 0.8], [0x7affd9, 0.6]].map(([c, r]) => { const m = ball(r, mat(c, { roughness: 0.5 }), 0, 0, 0, undefined, 24); sc.add(m); return m; });
  const satl = grp(0, 0, 0, sc); satl.add(rbox(0.9, 0.9, 1.2, mat(0xd4a017, { roughness: 0.3, metalness: 0.6 }))); [-1, 1].forEach(sx => { satl.add(rbox(1.8, 0.05, 0.8, mat(0x1f4fa0, { roughness: 0.2, metalness: 0.5 }), sx * 1.4, 0, 0)); satl.add(rbox(0.5, 0.06, 0.06, mat(0xc9ced6), sx * 0.6, 0, 0)); }); const dish = cone(0.4, 0.25, mat(0xf4f4f4), 0, 0.6, 0, 16); satl.add(dish); satl.visible = false;
  const rocks = [...Array(28)].map((_, i) => { const m = moonMesh(0.18 + (i % 4) * 0.08); m.material = new THREE.MeshStandardMaterial({ color: [0x8a7a6a, 0x6e6058, 0xa0907a][i % 3], flatShading: true, roughness: 0.9 }); m.visible = false; sc.add(m); return m; });
  const shoot = [0, 1, 2].map(() => { const m = new THREE.Mesh(new THREE.BoxGeometry(6, 0.08, 0.08), new THREE.MeshBasicMaterial({ color: 0xfff6d0, transparent: true, opacity: 0, toneMapped: false })); sc.add(m); return m; });
  const spDeb = debrisPool(sc, 14, [0xffe08a, 0xffffff, 0xd4a017]);
  S.space = { satl, rocks, shoot, spDeb, sc, hero, earth, atm, moon, sat, satB, satFace, satMouth, satO, rings, galSkin, galaxies, planets, night, violet, st, hemi, sunL };
}
