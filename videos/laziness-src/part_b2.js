// ---------------------------------------------------------------- SCENES (Laziness: all new sets and characters)
const S = {};
// ---- characters (all new to the series)
function lie(P, pos, ry, tilt) { P.root.rotation.order = 'YXZ'; P.root.position.set(...pos); P.root.rotation.set(tilt, ry, 0); }   // tilt -π/2 = on his back, +π/2 = face-down; ry turns the body (ry = π/2 puts his head toward -x)
function makeLazyHero() { const P = makeRig(); const w = rbox(0.24, 0.1, 0.27, mat(0x111216, { roughness: 0.3, metalness: 0.4 }), 0, -0.3, 0); P.arms[0].el.add(w);   // smartwatch on the left wrist
  P.watchFace = rbox(0.16, 0.02, 0.18, mat(0x1d2a36, { emissive: 0x3fd0ff, emissiveIntensity: 0.6 }), 0, -0.3, 0); P.watchFace.position.set(0.12, -0.3, 0); P.watchFace.rotation.z = Math.PI / 2; P.arms[0].el.add(P.watchFace); return P; }
function makeDev() { const P = makeRig({ hood: 0x26262c, hoodD: 0x26262c, pants: 0x3b3b44, skin: 0x8a5a3c, hair: 0x15100d, noHood: true, shoe: 0xf2f2f2 });
  P.spine.add(rbox(0.82, 0.1, 0.49, mat(0xffffff), 0, 0.08, 0)); P.arms.forEach(A => { A.sh.scale.set(1.22, 1, 1.22); A.sh.children[0].material = mat(0x8a5a3c, { roughness: 0.5 }); A.el.children[0].material = mat(0x8a5a3c, { roughness: 0.5 }); });   // vest: bare, bigger arms
  P.band = rbox(0.7, 0.08, 0.64, mat(0xff3b6b), 0, 0.6, 0); P.head.add(P.band); P.shake = grp(); P.shake.add(cyl(0.09, 0.08, 0.3, mat(0x7ad3ff, { roughness: 0.25 }), 0, 0.15, 0, 16)); P.shake.add(cyl(0.095, 0.095, 0.06, mat(0x222222), 0, 0.32, 0, 16)); return P; }
function makePriya() { const P = makeRig({ hood: 0x5fa891, hoodD: 0x4a8b77, pants: 0x2d3048, skin: 0xb88660, hair: 0x1a1210, hairStyle: 'long', noHood: true, shoe: 0x6b4630 });
  P.spine.add(rbox(0.3, 0.6, 0.02, mat(0xf3efe6), 0, 0.42, 0.24)); P.marker = cyl(0.025, 0.025, 0.2, mat(0x1f4fd6), 0, -0.45, 0.08, 10); P.marker.rotation.x = 1.2; P.arms[1].el.add(P.marker); P.marker.visible = false; return P; }
function makeHost() { const P = makeRig({ hood: 0x2f56c8, hoodD: 0x2f56c8, pants: 0x2f56c8, skin: 0xf0c09a, hair: 0x6b4a2b, noHood: true, tie: 0xffd23f, shoe: 0x111111 }); P.head.add(rbox(0.74, 0.3, 0.68, mat(0x6b4a2b), 0, 0.78, 0)); return P; }
function makeDriver() { const P = npc(5, { hood: 0xd8262e, hoodD: 0xd8262e }); P.head.add(rbox(0.7, 0.14, 0.66, mat(0xd8262e), 0, 0.72, 0)); P.head.add(rbox(0.5, 0.05, 0.3, mat(0xd8262e), 0, 0.66, 0.42)); return P; }
function makeEngineer() { const P = npc(1, { hood: 0xff8a1f, hoodD: 0xff8a1f }); P.head.add(rbox(0.74, 0.22, 0.7, mat(0xffd21f, { roughness: 0.35 }), 0, 0.74, 0)); P.radio = rbox(0.12, 0.3, 0.08, mat(0x222222), 0, -0.44, 0.1); P.arms[1].el.add(P.radio); return P; }
// ---- textures
const woodTex = (base, seed) => { const t = canvasTex(256, 256, (g, w, h) => { g.fillStyle = base; g.fillRect(0, 0, w, h); const r2 = rnd(seed); for (let i = 0; i < 9; i++) { g.fillStyle = `rgba(0,0,0,${0.05 + r2() * 0.08})`; g.fillRect(0, i * 28 + 4, w, 2); } for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(60,30,10,${r2() * 0.08})`; g.fillRect(r2() * w, r2() * h, 30 + r2() * 60, 1.5); } }); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 4); return t; };
const rotaTex = screenTex(512, 640);
function drawRota(state = {}) { const g = rotaTex.g, w = 512, h = 640; g.fillStyle = '#fbfbf8'; g.fillRect(0, 0, w, h); g.strokeStyle = '#c9ced6'; g.lineWidth = 3; g.strokeRect(6, 6, w - 12, h - 12);
  g.fillStyle = '#1f4fd6'; g.font = '700 54px InterW'; g.textAlign = 'center'; g.fillText('CHORE ROTA', w / 2, 70);
  const cols = ['PRIYA', 'DEV', 'HIM']; g.font = '700 34px InterW'; cols.forEach((c, i) => { g.fillStyle = i === 2 ? '#d7262e' : '#333'; g.fillText(c, 110 + i * 150, 140); });
  g.strokeStyle = '#999'; g.lineWidth = 2; for (let r = 0; r < 5; r++) { g.beginPath(); g.moveTo(30, 170 + r * 80); g.lineTo(w - 30, 170 + r * 80); g.stroke(); }
  g.font = '700 44px InterW'; for (let r = 0; r < 4; r++) { g.fillStyle = '#20a35a'; g.fillText('✓', 110, 225 + r * 80); g.fillText('✓', 260, 225 + r * 80); }
  if (state.saved) { g.save(); g.translate(410, 330); g.rotate(-0.25); g.fillStyle = '#d7262e'; g.font = '700 40px InterW'; g.fillText('SAVED', 0, -20); g.fillText('LONDON', 0, 26); g.font = '700 70px InterW'; g.fillText('✓', 0, 100); g.restore(); }
  if (state.splat) { g.fillStyle = 'rgba(200,170,255,0.9)'; const r2 = rnd(4); g.beginPath(); g.arc(300, 380, 120, 0, 7); g.fill(); for (let i = 0; i < 14; i++) { const a = r2() * 6.28, d = 110 + r2() * 90; g.beginPath(); g.arc(300 + Math.cos(a) * d, 380 + Math.sin(a) * d, 14 + r2() * 26, 0, 7); g.fill(); } g.fillRect(260, 380, 30, 230); g.fillRect(330, 380, 22, 170); }
  rotaTex.needsUpdate = true; }
const stripeTex = canvasTex(64, 256, (g, w, h) => { g.fillStyle = '#2a2d33'; g.fillRect(0, 0, w, h); g.fillStyle = '#3a3e46'; for (let y = 0; y < h; y += 32) g.fillRect(0, y, w, 12); }); stripeTex.wrapS = stripeTex.wrapT = THREE.RepeatWrapping;
// ---- props
function makeSofa() { const g = grp(); const f = mat(0x6d5aa8, { roughness: 0.9 }), f2 = mat(0x5a4a8e, { roughness: 0.9 });
  g.add(rbox(3.6, 0.42, 1.2, f2, 0, 0.3, 0)); g.add(rbox(1.62, 0.2, 1.06, f, -0.84, 0.6, 0.05)); g.add(rbox(1.62, 0.2, 1.06, f, 0.84, 0.6, 0.05)); g.add(rbox(3.6, 1.0, 0.32, f2, 0, 0.9, -0.48));
  g.add(rbox(0.3, 0.75, 1.2, f2, -1.8, 0.55, 0)); g.add(rbox(0.3, 0.75, 1.2, f2, 1.8, 0.55, 0)); [-1.6, 1.6].forEach(x => [-0.45, 0.45].forEach(z => g.add(cyl(0.05, 0.04, 0.12, mat(0x3a2a1a), x, 0.06, z, 8)))); return g; }
function makeDominoes(path, n) { const pts = new THREE.CatmullRomCurve3(path.map(V)); return [...Array(n)].map((_, i) => { const u = i / (n - 1); const p = pts.getPointAt(u), tg = pts.getTangentAt(u); const d = grp(p.x, 0, p.z); d.rotation.y = Math.atan2(tg.x, tg.z); d.add(rbox(0.22, 0.42, 0.07, mat(i % 2 ? 0xf5f5f0 : 0x1d1d22, { roughness: 0.3 }), 0, 0.21, 0)); return d; }); }
function fallDominoes(ds, O, t0, t1) { ds.forEach((d, i) => { const tf = lerp(t0, t1, i / ds.length); d.rotation.x = 1.25 * eIn(seg(O, tf, tf + 0.12)); }); }
function makeLever(s = 1) { const g = grp(); g.add(rbox(0.6 * s, 0.3 * s, 0.6 * s, mat(0x3a3f48, { metalness: 0.5, roughness: 0.4 }), 0, 0.15 * s, 0)); const arm = grp(0, 0.3 * s, 0, g); arm.add(cyl(0.05 * s, 0.05 * s, 1.3 * s, mat(0xb8bcc4, { metalness: 0.8, roughness: 0.25 }), 0, 0.65 * s, 0, 12)); arm.add(ball(0.14 * s, mat(0xd7262e, { roughness: 0.3 }), 0, 1.32 * s, 0)); g.arm = arm; return g; }
function makeDrone() { const g = grp(); const b = mat(0x22252b, { roughness: 0.35, metalness: 0.3 }); g.add(rbox(0.5, 0.14, 0.5, b)); g.rotors = [];
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z]) => { T(g, rbox(0.36, 0.05, 0.06, b, x * 0.22, 0.02, z * 0.22)).rotation.y = Math.atan2(z, x); const r = grp(x * 0.36, 0.1, z * 0.36, g); r.add(rbox(0.42, 0.012, 0.06, mat(0xcfd6e0, { transparent: true, opacity: 0.55 }))); g.rotors.push(r); g.add(cyl(0.03, 0.03, 0.1, b, x * 0.36, 0.05, z * 0.36, 8)); });
  g.add(ball(0.04, mat(0x55ff88, { emissive: 0x55ff88, emissiveIntensity: 3 }), 0, 0.0, 0.26, undefined, 8)); const br = grp(0, -0.1, 0.1, g); br.add(cyl(0.02, 0.02, 0.5, mat(0x3fa0ff), 0, -0.25, 0, 8)); br.add(rbox(0.06, 0.08, 0.12, mat(0xffffff), 0, -0.52, 0.04)); g.brush = br; return g; }
function makeConveyor(len) { const g = grp(); const t = stripeTex.clone(); t.needsUpdate = true; t.repeat.set(1, len / 1.2); const top = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.06, len), new THREE.MeshStandardMaterial({ map: t, roughness: 0.6 })); top.position.y = 0.62; top.receiveShadow = true; g.add(top);
  g.add(rbox(1.42, 0.5, len, mat(0x4a5060, { metalness: 0.4, roughness: 0.5 }), 0, 0.34, 0)); for (let z = -len / 2 + 0.4; z < len / 2; z += 1.2) g.add(rbox(0.12, 0.2, 0.12, mat(0xffc21f), 0.72, 0.4, z)); g.tex = t; return g; }
function makeClaw() { const g = grp(); const m = mat(0xffb21f, { roughness: 0.35, metalness: 0.3 }); g.add(rbox(0.5, 0.3, 0.5, mat(0x3a3f48, { metalness: 0.5 }), 0, 0.15, 0)); const a1 = grp(0, 0.3, 0, g); a1.add(rbox(0.22, 1.4, 0.22, m, 0, 0.7, 0)); const a2 = grp(0, 1.4, 0, a1); a2.add(rbox(0.18, 1.1, 0.18, m, 0, 0.55, 0)); const hd = grp(0, 1.1, 0, a2); hd.add(rbox(0.3, 0.12, 0.2, mat(0x3a3f48)));
  hd.add(rbox(0.05, 0.25, 0.12, mat(0x3a3f48), -0.12, -0.15, 0)); hd.add(rbox(0.05, 0.25, 0.12, mat(0x3a3f48), 0.12, -0.15, 0)); g.a1 = a1; g.a2 = a2; g.hd = hd; return g; }
function makeMedal() { const g = grp(); T(g, cyl(0.22, 0.22, 0.04, GOLD, 0, 0, 0, 32)).rotation.x = Math.PI / 2; g.add(rbox(0.12, 0.5, 0.02, mat(0x1f4fd6), 0, 0.36, 0)); return g; }
function lineMesh(n, col = 0xf2f2f2) { const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3)); const l = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: col })); l.frustumCulled = false; l.setPts = (pts) => { const a = geo.attributes.position.array; pts.forEach((p, i) => { a[i * 3] = p.x; a[i * 3 + 1] = p.y; a[i * 3 + 2] = p.z; }); for (let i = pts.length; i < n; i++) { a[i * 3] = pts[pts.length - 1].x; a[i * 3 + 1] = pts[pts.length - 1].y; a[i * 3 + 2] = pts[pts.length - 1].z; } geo.attributes.position.needsUpdate = true; }; return l; }
const sag = (a, b, s, n = 20) => [...Array(n)].map((_, i) => { const u = i / (n - 1); return a.clone().lerp(b, u).add(V([0, -s * 4 * u * (1 - u), 0])); });
{ // ---- the flat: living room (sofa, coffee table, rota fridge, kitchenette, light switch, window), hallway to the front door (x 6..15)
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x1b1712);
  const key = lightRig(sc, { env: 0.35, sky: 0xfff0dc, ground: 0x4a3a2c, hemi: 0.45, keyC: 0xffe2b8, key: 1.15, keyPos: [-4, 9, 7], R: 11, target: [0, 0, -2] });
  const fl = new THREE.MeshStandardMaterial({ map: woodTex('#8a6a4a', 3), roughness: 0.55, envMapIntensity: 0.6 }); sc.add(rbox(32, 0.2, 14, fl, 4, -0.1, -0.5));
  const wallM = mat(0xcbb79a, { roughness: 0.92 }), wallM2 = mat(0xb9a688, { roughness: 0.92 });
  sc.add(rbox(12.4, 6, 0.3, wallM, 0, 3, -5.15)); sc.add(rbox(0.3, 6, 10.4, wallM2, -6.15, 3, 0));
  sc.add(rbox(0.3, 6, 4.0, wallM2, 6.15, 3, -3.2)); sc.add(rbox(0.3, 6, 4.4, wallM2, 6.15, 3, 2.5));   // right wall with the hallway opening (z -1.2..0.3)
  sc.add(rbox(9.4, 6, 0.3, wallM, 10.6, 3, -1.35)); sc.add(rbox(9.4, 6, 0.3, wallM, 10.6, 3, 0.45)); sc.add(rbox(9.4, 0.3, 2.1, wallM, 10.6, 4.4, -0.45));   // hallway (ceiling low so the long lens reads as a corridor)
  const door = grp(15.2, 0, -0.45, sc); door.add(rbox(0.16, 3.4, 1.6, mat(0x2f5b8a, { roughness: 0.5 }), 0, 1.7, 0)); door.add(ball(0.07, GOLD, -0.12, 1.6, 0.55)); sc.add(rbox(0.3, 0.6, 1.9, wallM, 15.3, 3.7, -0.45));
  const outside = new THREE.PointLight(0xfff2d0, 0, 8, 1.4); outside.position.set(16.5, 2.5, -0.45); sc.add(outside);
  // window (back wall), with blinds and a daylight panel behind
  sc.add(rbox(3.0, 0.18, 0.4, mat(0xffffff), -2.4, 1.85, -4.9)); const sky = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 2.2), new THREE.MeshBasicMaterial({ color: 0xbfe3ff, toneMapped: false })); sky.position.set(-2.4, 3.1, -5.0); sc.add(sky);
  [-3.85, -0.95].forEach(x => sc.add(rbox(0.12, 2.4, 0.3, mat(0xffffff), x, 3.1, -4.95))); sc.add(rbox(3.0, 0.12, 0.3, mat(0xffffff), -2.4, 4.3, -4.95));
  const blinds = grp(-2.4, 4.2, -4.85, sc); for (let i = 0; i < 9; i++) blinds.add(rbox(2.8, 0.05, 0.12, mat(0xf7f4ec), 0, -i * 0.13, 0)); const winL = new THREE.PointLight(0xdcefff, 8, 9, 1.4); winL.position.set(-2.4, 3.2, -3.9); sc.add(winL);
  // ceiling lamp + floor lamp
  const lamp = practical(sc, 0.6, 5.3, -1.5, 0xffd9a0, { i: 12, d: 12, r: 0.2 }); const flamp = practical(sc, 2.7, 2.6, -3.9, 0xffc27a, { i: 0, d: 6, r: 0.16, ei: 0 }); sc.add(cyl(0.03, 0.03, 2.6, mat(0x222222), 2.7, 1.3, -3.9, 8)); sc.add(cone(0.36, 0.4, mat(0xf2e6cc, { roughness: 0.8 }), 2.7, 2.72, -3.9));
  const sofa = makeSofa(); sofa.position.set(0, 0, -3.6); sc.add(sofa);
  const table = grp(0, 0, -0.75, sc); table.add(rbox(1.9, 0.08, 1.0, mat(0x5b3d26, { roughness: 0.4 }), 0, 0.62, 0)); [[-0.85, -0.4], [0.85, -0.4], [-0.85, 0.4], [0.85, 0.4]].forEach(([x, z]) => table.add(rbox(0.08, 0.6, 0.08, mat(0x3a2716), x, 0.3, z)));
  sc.add(rbox(4.2, 0.03, 3.2, mat(0x9b3b3b, { roughness: 1 }), 0, 0.016, -2.0));   // rug
  const pizza = grp(); pizza.add(rbox(0.9, 0.08, 0.9, mat(0xd9b77e, { roughness: 0.9 }))); pizza.add(rbox(0.5, 0.01, 0.3, mat(0xd7262e), 0, 0.045, 0)); sc.add(pizza);
  const side = grp(3.2, 0, -0.6, sc); side.add(rbox(1.2, 0.9, 0.8, mat(0x3f4a5a, { roughness: 0.5 }), 0, 0.45, 0));   // TV unit with the remote
  const remote = grp(); remote.add(rbox(0.12, 0.05, 0.36, mat(0x18181c, { roughness: 0.4 }))); remote.add(rbox(0.04, 0.02, 0.04, mat(0xff2a2a, { emissive: 0xff2a2a }), 0, 0.03, 0.12)); sc.add(remote);
  // kitchenette (left wall) + fridge with the rota (near the front)
  sc.add(rbox(1.0, 1.2, 4.2, mat(0xf3f1ec, { roughness: 0.5 }), -5.6, 0.6, -2.6)); sc.add(rbox(1.1, 0.1, 4.3, mat(0x2b2b30, { roughness: 0.3 }), -5.6, 1.25, -2.6)); sc.add(rbox(0.7, 0.12, 0.9, mat(0xc8ccd2, { metalness: 0.8, roughness: 0.25 }), -5.5, 1.26, -2.8));
  sc.add(cyl(0.03, 0.03, 0.5, mat(0xc8ccd2, { metalness: 0.9 }), -5.85, 1.55, -2.8, 8)); const plates = [...Array(6)].map((_, i) => { const p = cyl(0.26, 0.26, 0.04, mat(0xf7f7f2, { roughness: 0.2 }), -5.4, 1.32 + i * 0.045, -1.6, 24); sc.add(p); return p; });
  const fridge = grp(-5.4, 0, 1.6, sc); fridge.add(rbox(1.2, 3.4, 1.1, mat(0xdfe3e8, { roughness: 0.3, metalness: 0.2 }), 0, 1.7, 0)); const rota = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 1.2), new THREE.MeshStandardMaterial({ map: rotaTex, roughness: 0.6 })); rota.position.set(0.61, 2.2, 0); rota.rotation.y = Math.PI / 2; fridge.add(rota); drawRota();
  // light switch on the back wall, right of the sofa
  const sw = grp(4.2, 2.3, -4.98, sc); sw.add(rbox(0.3, 0.42, 0.04, mat(0xffffff))); const toggle = rbox(0.08, 0.14, 0.06, mat(0xeeeeee), 0, 0.05, 0.03); sw.add(toggle);
  // Day 2: fishing rod + line + Dev's shake + splat flag
  const rod = grp(); rod.add(cyl(0.025, 0.012, 2.6, mat(0x2b2b2b, { roughness: 0.3 }), 0, 1.3, 0, 8)); rod.add(cyl(0.07, 0.07, 0.08, mat(0xc8ccd2, { metalness: 0.8 }), 0.06, 0.35, 0, 12)); sc.add(rod); const fline = lineMesh(24); sc.add(fline); const hook = ball(0.04, mat(0xc8ccd2, { metalness: 0.9 })); sc.add(hook);
  // Day 4: domino chain -> toy car down a ramp -> mousetrap -> string -> switch
  const dom = makeDominoes([[-0.45, 0, -2.45], [1.0, 0, -2.6], [2.4, 0, -2.9], [3.1, 0, -3.4], [3.4, 0, -4.1]], 22); dom.forEach(d => sc.add(d));
  const ramp = rbox(1.0, 0.06, 0.5, mat(0xffd21f), 3.85, 0.25, -4.4); ramp.rotation.z = 0.45; sc.add(ramp); const car = grp(); car.add(rbox(0.3, 0.14, 0.18, mat(0x1f8fe0, { roughness: 0.3 }), 0, 0.1, 0)); [-0.1, 0.1].forEach(x => [-0.09, 0.09].forEach(z => T(car, cyl(0.04, 0.04, 0.03, mat(0x111111), x, 0.04, z, 10)).rotation.x = Math.PI / 2)); sc.add(car);
  const trap = grp(4.55, 0, -4.4, sc); trap.add(rbox(0.32, 0.03, 0.18, mat(0xc49a6c))); const bar = grp(-0.12, 0.02, 0, trap); bar.add(rbox(0.02, 0.02, 0.17, mat(0xc8ccd2, { metalness: 0.9 }), 0.12, 0, 0)); trap.bar = bar;
  const sline = lineMesh(24, 0xffffff); sc.add(sline);
  // Day 6: SINK-O-MATIC (leaf blower + hose + spinning drum), flying plates
  const sink = grp(-4.6, 0, -2.6, sc); const drum = grp(0, 1.9, 0, sink); T(drum, cyl(0.6, 0.6, 0.5, mat(0xdfe3e8, { metalness: 0.6, roughness: 0.25 }), 0, 0, 0, 24)).rotation.z = Math.PI / 2; T(drum, cyl(0.45, 0.45, 0.52, mat(0x5a8fb8, { transparent: true, opacity: 0.6 }), 0, 0, 0, 24)).rotation.z = Math.PI / 2; sink.drum = drum;
  sink.add(rbox(0.9, 0.35, 0.35, mat(0xff7a1f, { roughness: 0.4 }), 0.6, 1.5, 0.9)); T(sink, cyl(0.08, 0.08, 1.2, mat(0x333333), 1.2, 1.5, 0.9, 10)).rotation.z = Math.PI / 2; sink.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V([-0.4, 1.3, -1.4]), V([0.2, 2.6, -0.6]), V([0, 2.1, -0.2])]), 20, 0.05, 8), mat(0x2bb673))); T(sink, new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.05, 8, 32), mat(0xffd21f))).position.set(0.27, 1.9, 0);
  sink.add(rbox(0.8, 0.16, 0.08, mat(0xd7262e, { emissive: 0xd7262e, emissiveIntensity: 0.5 }), 0, 2.75, 0.3)); sink.visible = false;
  const flying = [...Array(5)].map(() => { const p = cyl(0.26, 0.26, 0.04, mat(0xf7f7f2, { roughness: 0.2 }), 0, 0, 0, 24); p.visible = false; sc.add(p); return p; }); const shards = debrisPool(sc, 14, [0xf7f7f2, 0xe8e8e2]);
  // Day 9: drone
  const drone = makeDrone(); sc.add(drone);
  // Day 16: telescopic arm (segments that slide out of each other) + pizza box + coin + chute
  const arm = [...Array(14)].map((_, i) => { const s = rbox(1.15, 0.16 - i * 0.004, 0.16 - i * 0.004, mat(i % 2 ? 0xc8ccd2 : 0x9aa2ae, { metalness: 0.7, roughness: 0.3 })); sc.add(s); return s; }); const grab = grp(); grab.add(rbox(0.2, 0.3, 0.3, mat(0xffb21f))); sc.add(grab);
  const pbox = grp(); pbox.add(rbox(0.8, 0.1, 0.8, mat(0xe9e2d0, { roughness: 0.9 }))); pbox.add(rbox(0.5, 0.01, 0.3, mat(0xd7262e), 0, 0.055, 0)); sc.add(pbox); const coin = cyl(0.07, 0.07, 0.015, GOLD, 0, 0, 0, 20); sc.add(coin);
  // Day 20: the factory conversion (conveyors, claws, sparks)
  const fac = grp(0, 0, 0, sc); const conv = [makeConveyor(9), makeConveyor(8)]; conv[0].position.set(-1.2, 0, -0.6); conv[1].position.set(2.4, 0, -0.6); conv.forEach(c => fac.add(c));
  const claws = [[-2.6, -2.2], [0.2, -2.6], [3.9, -1.6], [-2.6, 1.4], [0.6, 1.6]].map(([x, z]) => { const c = makeClaw(); c.position.set(x, 0, z); fac.add(c); return c; });
  const sparks = [...Array(10)].map((_, i) => { const s = sparkle(0.35, 0xffc070); fac.add(s); return s; }); fac.visible = false;
  // Day 25 + END: open window string, zipline, chips; medal
  const zip = lineMesh(2, 0xffffff); sc.add(zip); const chips = grp(); chips.add(rbox(0.4, 0.3, 0.3, mat(0xd7262e))); chips.add(rbox(0.36, 0.14, 0.26, mat(0xf2c14e, { roughness: 0.8 }), 0, 0.2, 0)); sc.add(chips); const medal = makeMedal(); sc.add(medal);
  const hero = makeLazyHero(); sc.add(hero.root); const dev = makeDev(); sc.add(dev.root); sc.add(dev.shake); const priya = makePriya(); sc.add(priya.root); const host = makeHost(); sc.add(host.root); const driver = makeDriver(); sc.add(driver.root);
  const hb = blob(sc), db = blob(sc), pb = blob(sc);
  S.flat = { table, side, sc, key, hemi: sc.children.find(o => o.isHemisphereLight), hero, dev, priya, host, driver, hb, db, pb, lamp, flamp, winL, sky, blinds, outside, door, pizza, remote, rod, fline, hook, dom, car, trap, sline, toggle, sink, flying, shards, plates, drone, arm, grab, pbox, coin, fac, conv, claws, sparks, zip, chips, medal, rota, sofa };
}
