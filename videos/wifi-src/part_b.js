
// ---------------------------------------------------------------- helpers
const T = (p, c) => (p.add(c), c);
const glowTex = (c0, c1) => canvasTex(256, 256, (g) => { const gr = g.createRadialGradient(128, 128, 6, 128, 128, 128); gr.addColorStop(0, c0); gr.addColorStop(0.35, c1); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); });
function cyl(rt, rb, h, c, x = 0, y = 0, z = 0, seg = 28, o) { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), c && c.isMaterial ? c : mat(c, o)); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; return m; }
function cone(r, h, c, x = 0, y = 0, z = 0, seg = 24, o) { const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), c && c.isMaterial ? c : mat(c, o)); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; return m; }
const PAL = [[0xe8a317, 0x2d3a63, 0x8d5a3b, 0x15100d], [0x2bb673, 0x4b3a2a, 0x6e4528, 0x15100d], [0x9b59d6, 0x2b2b2b, 0x7a4a2e, 0x1a1210], [0xe8343c, 0x3b4a6b, 0x8d5a3b, 0x15100d], [0x1f8fe0, 0x5b4636, 0x6b4128, 0x111111], [0xff8c5a, 0x2f3a52, 0x7a4a2e, 0x1a1210], [0xf4f4f4, 0x30343c, 0x8d5a3b, 0x15100d], [0x20a0a0, 0x444444, 0x6e4528, 0x1a1210]];
function npc(i, o = {}) { const c = PAL[i % PAL.length]; return makeRig({ hood: c[0], hoodD: c[0], pants: c[1], skin: c[2], hair: c[3], noHood: true, hairStyle: i % 3 === 1 ? 'long' : 'short', ...o }); }
const addM = (sc, m) => { sc.add(m); return m; };
// glowing practical light: emissive bulb + point light + optional haze cone + bokeh sprite
function practical(sc, x, y, z, col, o = {}) { const g = grp(x, y, z, sc); g.add(ball(o.r || 0.08, mat(col, { emissive: col, emissiveIntensity: o.ei ?? 3 }), 0, 0, 0, undefined, 12)).children;
  const pl = new THREE.PointLight(col, o.i ?? 6, o.d ?? 6, 1.6); g.add(pl); g.light = pl;
  if (o.haze) { const hz = new THREE.Mesh(new THREE.ConeGeometry(o.haze, o.hh || 2.6, 32, 1, true), new THREE.MeshBasicMaterial({ map: hazeTex, color: col, transparent: true, opacity: o.ho ?? 0.22, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false })); hz.position.y = -(o.hh || 2.6) / 2; hz.renderOrder = 4; g.add(hz); g.haze = hz; }
  if (o.bokeh) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: bokehTex, color: col, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); sp.scale.setScalar(o.bokeh); g.add(sp); }
  return g; }
const hazeTex = canvasTex(64, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.25)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
const bokehTex = canvasTex(128, 128, (g) => { const gr = g.createRadialGradient(64, 64, 20, 64, 64, 62); gr.addColorStop(0, 'rgba(255,255,255,0.55)'); gr.addColorStop(0.85, 'rgba(255,255,255,0.75)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.beginPath(); g.arc(64, 64, 62, 0, 7); g.fill(); });
// the signature effect: a Wi-Fi ring = fresnel glow dome + ground ring
const RINGC = 0x44e6ff;
function ringMat() { return new THREE.ShaderMaterial({ uniforms: { c: { value: new THREE.Color(RINGC) }, a: { value: 1 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
  fragmentShader: 'uniform vec3 c; uniform float a; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1.0 - abs(dot(vN, vV)), 2.6); gl_FragColor = vec4(c * (0.25 + 2.2 * f), (0.04 + 0.85 * f) * a); }' }); }
const ringGroundTex = canvasTex(512, 512, (g) => { const gr = g.createRadialGradient(256, 256, 200, 256, 256, 256); gr.addColorStop(0, 'rgba(120,240,255,0)'); gr.addColorStop(0.8, 'rgba(120,240,255,0.5)'); gr.addColorStop(0.93, 'rgba(220,255,255,1)'); gr.addColorStop(1, 'rgba(120,240,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 512, 512); });
function makeRing(sc, ground = true) { const g = grp(0, 0, 0, sc); const dome = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24), ringMat()); dome.renderOrder = 5; g.add(dome);
  const gr = ground ? new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ map: ringGroundTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })) : null; if (gr) { gr.rotation.x = -Math.PI / 2; gr.position.y = 0.02; gr.renderOrder = 5; g.add(gr); }
  g.visible = false; g.dome = dome; g.gr = gr; return g; }
function ringAt(rg, O, t0, center, r1, dur = 1.6, r0 = 0.2) { const k = seg(O, t0, t0 + dur); rg.visible = O > t0 && k < 1; if (!rg.visible) return 0; const r = lerp(r0, r1, eOut(k));
  rg.position.copy(center); rg.dome.scale.setScalar(r); rg.dome.material.uniforms.a.value = Math.sin(Math.min(1, k * 4) * Math.PI / 2) * (1 - Math.pow(k, 3)); if (rg.gr) { rg.gr.scale.setScalar(r); rg.gr.material.opacity = 1 - Math.pow(k, 2); } return r; }
// screens drawn on canvases, redrawn per shot
function screenTex(w, h) { const c = mk(w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.c = c; t.g = c.getContext('2d'); return t; }
function screenMesh(w, h, tex, o = {}) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); m.position.set(o.x || 0, o.y || 0, o.z || 0); return m; }
function spinner(g, cx, cy, r, O, col = '#fff') { g.save(); g.translate(cx, cy); g.rotate(O * 6); for (let i = 0; i < 10; i++) { g.globalAlpha = 0.15 + 0.85 * i / 9; g.fillStyle = col; g.beginPath(); g.arc(Math.cos(i / 10 * 6.283) * r, Math.sin(i / 10 * 6.283) * r, r * 0.17, 0, 7); g.fill(); } g.restore(); g.globalAlpha = 1; }
function bars(g, x, y, n, s = 1, col = '#fff') { for (let i = 0; i < 4; i++) { g.globalAlpha = i < n ? 1 : 0.25; g.fillStyle = col; g.fillRect(x + i * 14 * s, y - (8 + i * 8) * s, 9 * s, (8 + i * 8) * s); } g.globalAlpha = 1; }
function drawPhone(t, kind, O) { const g = t.g, w = t.c.width, h = t.c.height; g.fillStyle = '#0d1220'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.font = '600 22px InterW, Arial'; g.textAlign = 'left'; g.fillText('9:41', 22, 34);
  if (kind === 'nobar') { bars(g, w - 92, 36, 0, 1.1); g.textAlign = 'center'; g.font = '800 34px InterW, Arial'; g.fillText('No connection', w / 2, h * 0.47); g.font = '500 22px InterW, Arial'; g.globalAlpha = 0.7; g.fillText('Move closer to your router', w / 2, h * 0.47 + 44); g.globalAlpha = 1; }
  else if (kind === 'onebar') { bars(g, w - 92, 36, 1, 1.1); spinner(g, w / 2, h * 0.45, 46, O); g.font = '600 26px InterW, Arial'; g.textAlign = 'center'; g.globalAlpha = 0.8; g.fillText('Loading…', w / 2, h * 0.45 + 110); g.globalAlpha = 1; }
  else if (kind === 'call') { bars(g, w - 92, 36, 4, 1.1); g.textAlign = 'center'; g.font = '500 26px InterW, Arial'; g.globalAlpha = 0.7; g.fillText('incoming call', w / 2, h * 0.22); g.globalAlpha = 1; g.font = '800 40px InterW, Arial'; g.fillText('INTERNET', w / 2, h * 0.3); g.fillText('PROVIDER', w / 2, h * 0.3 + 48);
    [[w * 0.28, '#e8343c'], [w * 0.72, '#2bd96b']].forEach(([x, c]) => { g.fillStyle = c; g.beginPath(); g.arc(x, h * 0.8, 46, 0, 7); g.fill(); }); }
  else if (kind === 'voicemail') { bars(g, w - 92, 36, 4, 1.1); g.textAlign = 'center'; g.font = '800 34px InterW, Arial'; g.fillText('Voicemail', w / 2, h * 0.2); g.font = '500 24px InterW, Arial'; g.globalAlpha = 0.7; g.fillText('Internet Provider', w / 2, h * 0.2 + 40); g.globalAlpha = 1;
    for (let i = 0; i < 26; i++) { const a = 0.3 + 0.7 * Math.abs(Math.sin(i * 1.7 + O * 9)); g.fillStyle = '#44e6ff'; g.fillRect(w * 0.12 + i * (w * 0.76 / 26), h * 0.5 - 60 * a, 8, 120 * a); } }
  else if (kind === 'chat') { bars(g, w - 92, 36, 4, 1.1); g.textAlign = 'center'; g.font = '800 30px InterW, Arial'; g.fillText('ANDROMEDA', w / 2, 92); g.fillStyle = '#1f8fe0'; rr(g, w - 170, h * 0.55, 140, 64, 30); g.fill(); g.fillStyle = '#fff'; g.font = '600 34px InterW, Arial'; g.fillText('hi', w - 100, h * 0.55 + 44);
    g.font = '500 20px InterW, Arial'; g.globalAlpha = 0.7; g.textAlign = 'right'; g.fillText('Read', w - 34, h * 0.55 + 96); g.globalAlpha = 1; }
  t.needsUpdate = true; }
function drawTV(t, O, alien = false) { const g = t.g, w = t.c.width, h = t.c.height; const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#141414'); bg.addColorStop(1, '#050505'); g.fillStyle = bg; g.fillRect(0, 0, w, h);
  g.fillStyle = '#fff'; g.font = '700 30px InterW, Arial'; g.textAlign = 'left'; g.fillText('Continue watching', 40, 70);
  const cards = [['#ff9ad5', 'PEPPA PIG', 'Season 4 · Episode 12'], ['#3a7ae0', '', ''], ['#e8a317', '', '']]; cards.forEach(([c, t1, t2], i) => { const x = 40 + i * 310; g.fillStyle = c; rr(g, x, 100, 290, 165, 10); g.fill();
    if (t1) { g.fillStyle = '#fff'; g.font = '800 34px InterW, Arial'; g.fillText(t1, x + 18, 160); g.font = '500 20px InterW, Arial'; g.fillText(t2, x + 18, 192); g.fillStyle = '#E21E39'; g.fillRect(x, 258, 290 * 0.7, 7); } });
  if (alien) { g.globalAlpha = 0.6; g.font = '500 20px InterW, Arial'; g.fillText('Watching from 4.2 light-years away', 40, h - 30); g.globalAlpha = 1; } t.needsUpdate = true; }
const windowsTex = (seed, lit = 0.6) => canvasTex(128, 256, (g, w, h) => { g.fillStyle = '#1a1d28'; g.fillRect(0, 0, w, h); const r2 = rnd(seed); for (let y = 8; y < h - 8; y += 22) for (let x = 8; x < w - 8; x += 20) { const on = r2() < lit; g.fillStyle = on ? ['#ffd28a', '#ffe9b8', '#9fd8ff', '#ffb46a'][Math.floor(r2() * 4)] : '#2a2f3d'; g.fillRect(x, y, 12, 14); } });
function phoneMesh() { const g = grp(); g.add(rbox(0.36, 0.72, 0.04, mat(0x15171c, { roughness: 0.3, metalness: 0.5 }))); const t = screenTex(270, 540); const s = screenMesh(0.33, 0.66, t, { z: 0.022 }); g.add(s); g.tex = t; g.scr = s; return g; }

// ---------------------------------------------------------------- SCENES
const S = {};
{ // ---- the flat at night: bedroom + bathroom, and the neighbour's flat next door (dollhouse cutaway, front wall missing)
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x06080f); sc.environment = ENV; sc.environmentIntensity = 0.18;
  sc.add(new THREE.HemisphereLight(0x5a6fb0, 0x1a1420, 0.35));
  const moon = new THREE.DirectionalLight(0x7f9cff, 0.7); moon.position.set(-6, 9, -10); moon.castShadow = true; moon.shadow.mapSize.set(1024, 1024); Object.assign(moon.shadow.camera, { left: -12, right: 12, top: 10, bottom: -6, near: 1, far: 40 }); moon.shadow.camera.updateProjectionMatrix(); sc.add(moon);
  const floorT = canvasTex(256, 256, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#7a5638' : '#6e4c31'; g.fillRect(0, i * 32, w, 32); g.fillStyle = 'rgba(0,0,0,0.15)'; g.fillRect(0, i * 32, w, 2); } }); floorT.wrapS = floorT.wrapT = THREE.RepeatWrapping; floorT.repeat.set(4, 3);
  const fl = new THREE.Mesh(rgeo(17, 0.25, 7), new THREE.MeshStandardMaterial({ map: floorT, roughness: 0.55 })); fl.position.set(3.2, -0.125, 0); fl.receiveShadow = true; sc.add(fl);
  const tileT = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#dfe7ea'; g.fillRect(0, 0, w, h); g.fillStyle = '#b8c4c9'; for (let i = 0; i <= 8; i++) { g.fillRect(i * 32, 0, 2, h); g.fillRect(0, i * 32, w, 2); } }); tileT.wrapS = tileT.wrapT = THREE.RepeatWrapping; tileT.repeat.set(3, 4);
  const wallBed = mat(0x3b4f6e, { roughness: 0.9 }), wallN = mat(0x8a6a4a, { roughness: 0.9 }), tiles = new THREE.MeshStandardMaterial({ map: tileT, roughness: 0.35 });
  sc.add(rbox(6.2, 3.3, 0.25, wallBed, -1.0, 1.65, -3.1)); const tb = new THREE.Mesh(rgeo(2.6, 3.3, 0.25), tiles); tb.position.set(3.3, 1.65, -3.1); tb.receiveShadow = true; sc.add(tb); sc.add(rbox(6.4, 3.3, 0.25, wallN, 8.1, 1.65, -3.1));
  sc.add(rbox(0.25, 3.3, 6.2, wallBed, -4.1, 1.65, 0)); const wb = new THREE.Mesh(rgeo(0.2, 3.3, 3.8), tiles); wb.position.set(2.0, 1.65, -1.2); sc.add(wb); sc.add(rbox(0.2, 0.9, 2.4, wallBed, 2.0, 2.85, 1.9));
  sc.add(rbox(0.35, 3.3, 6.2, mat(0x2a2f3a, { roughness: 0.9 }), 4.75, 1.65, 0)); sc.add(rbox(0.25, 3.3, 6.2, wallN, 11.4, 1.65, 0)); sc.add(rbox(17, 0.3, 6.6, mat(0x1c2029, { roughness: 0.9 }), 3.2, 3.45, 0));
  const win = grp(-2.6, 1.9, -2.95, sc); win.add(rbox(1.6, 1.5, 0.1, mat(0x20242e), 0, 0, 0)); const city = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.3), new THREE.MeshBasicMaterial({ map: windowsTex(4, 0.5), toneMapped: false })); city.position.z = 0.04; win.add(city); win.add(rbox(0.06, 1.3, 0.08, mat(0x20242e), 0, 0, 0.08));
  const bed = grp(-2.7, 0, -1.6, sc); bed.add(rbox(2.0, 0.45, 2.8, mat(0x4a3424, { roughness: 0.7 }), 0, 0.22, 0)); bed.add(rbox(1.9, 0.3, 2.7, mat(0xe9edf2, { roughness: 0.95 }), 0, 0.58, 0)); bed.add(rbox(1.92, 0.18, 1.6, mat(0x2f4a8a, { roughness: 0.95 }), 0, 0.78, 0.55)); bed.add(rbox(0.8, 0.22, 0.5, mat(0xffffff, { roughness: 0.95 }), -0.4, 0.82, -1.05));
  const shelf = grp(-0.6, 1.55, -2.9, sc); shelf.add(rbox(1.2, 0.06, 0.32, mat(0x6e4a2e))); const router = grp(0, 0.1, 0.02, shelf); router.add(rbox(0.5, 0.1, 0.26, mat(0x1d1f26, { roughness: 0.3 })));
  [-0.18, 0.18].forEach(x => { const an = rbox(0.03, 0.4, 0.03, mat(0x1d1f26), x, 0.24, -0.08); an.rotation.z = x > 0 ? -0.2 : 0.2; router.add(an); });
  const leds = [-0.15, -0.08, -0.01, 0.06].map(x => { const l = rbox(0.03, 0.02, 0.01, mat(0x2bd96b, { emissive: 0x2bd96b, emissiveIntensity: 4 }), x, 0.0, 0.135); router.add(l); return l; });
  const rLight = new THREE.PointLight(0x2bd96b, 1.2, 2.5, 1.6); rLight.position.set(0, 0.1, 0.3); router.add(rLight);
  const desk = grp(0.8, 0, -2.4, sc); desk.add(rbox(1.8, 0.08, 0.8, mat(0x2a2a30, { roughness: 0.5 }), 0, 0.82, 0)); [[-0.8, -0.3], [0.8, -0.3], [-0.8, 0.3], [0.8, 0.3]].forEach(([x, z]) => desk.add(rbox(0.06, 0.82, 0.06, mat(0x18181c), x, 0.41, z)));
  const mon = screenMesh(1.0, 0.56, canvasTex(320, 180, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#3a2bd9'); gr.addColorStop(1, '#d93aa8'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }), { y: 1.25, z: -0.15 }); desk.add(mon); desk.add(rbox(1.06, 0.62, 0.04, mat(0x111111), 0, 1.25, -0.18));
  const monL = new THREE.PointLight(0x8a5cff, 3.5, 4.5, 1.6); monL.position.set(0, 1.25, 0.3); desk.add(monL);
  const chair = grp(0.8, 0, -1.4, sc); chair.add(rbox(0.7, 0.12, 0.7, mat(0x111111, { roughness: 0.5 }), 0, 0.55, 0)); chair.add(rbox(0.7, 1.1, 0.12, mat(0x111111), 0, 1.15, 0.36)); chair.add(rbox(0.5, 0.5, 0.13, mat(0xe8343c, { roughness: 0.5 }), 0, 1.25, 0.37)); chair.add(cyl(0.05, 0.05, 0.45, mat(0x333333), 0, 0.28, 0, 8)); chair.add(cyl(0.35, 0.35, 0.05, mat(0x333333), 0, 0.04, 0, 12));
  const tvT = screenTex(1000, 560); const tv = screenMesh(1.5, 0.84, tvT, { x: -2.3, y: 1.75, z: 0.0 }); tv.rotation.y = Math.PI / 2; const tvG = grp(-3.9, 0, 0.2, sc); tvG.add(rbox(0.06, 0.9, 1.56, mat(0x111111), 0.03, 1.75, 0)); tv.position.set(0.08, 1.75, 0); tvG.add(tv); const tvL = new THREE.PointLight(0xffb6e1, 0, 4, 1.6); tvL.position.set(0.8, 1.7, 0); tvG.add(tvL);
  const lamp = practical(sc, -1.55, 0.95, -2.6, 0xffb46a, { i: 4, d: 5, r: 0.1, bokeh: 0.5 }); sc.add(cyl(0.18, 0.12, 0.25, mat(0xf2e3c8, { emissive: 0xffb46a, emissiveIntensity: 0.6 }), -1.55, 1.05, -2.6, 16)); sc.add(rbox(0.5, 0.6, 0.45, mat(0x4a3424), -1.55, 0.3, -2.6));
  const toilet = grp(3.25, 0, -2.3, sc); const por = mat(0xf6f6f6, { roughness: 0.15 }); toilet.add(cyl(0.22, 0.18, 0.4, por, 0, 0.2, 0.1, 20)); toilet.add(cyl(0.3, 0.26, 0.12, por, 0, 0.44, 0.15, 24)); toilet.add(rbox(0.56, 0.6, 0.22, por, 0, 0.75, -0.18)); toilet.add(rbox(0.6, 0.05, 0.62, mat(0xe8e8e8), 0, 0.52, 0.12));
  sc.add(rbox(0.7, 0.08, 0.45, por, 4.05, 0.85, -1.1)); sc.add(rbox(0.5, 0.65, 0.04, mat(0xdfe8f0, { roughness: 0.03, metalness: 1, envMapIntensity: 1.3 }), 4.6, 1.6, -1.1)).children;
  const bulb = practical(sc, 3.2, 3.05, -1.3, 0xffe2a8, { i: 7, d: 6, r: 0.09, haze: 1.1, hh: 2.7, ho: 0.05 }); sc.add(cyl(0.01, 0.01, 0.25, mat(0x222222), 3.2, 3.2, -1.3, 4));
  const nsofa = grp(8.0, 0, -1.0, sc); nsofa.rotation.y = Math.PI / 2; nsofa.add(rbox(2.4, 0.45, 0.9, mat(0x6a3a7a, { roughness: 0.8 }), 0, 0.3, 0)); nsofa.add(rbox(2.4, 0.7, 0.25, mat(0x6a3a7a, { roughness: 0.8 }), 0, 0.75, -0.35)); [-1.1, 1.1].forEach(x => nsofa.add(rbox(0.25, 0.65, 0.9, mat(0x5a2f68), x, 0.45, 0)));
  const ntvT = screenTex(1000, 560); const ntv = screenMesh(1.4, 0.78, ntvT, { x: 11.2, y: 1.6, z: -1.0 }); ntv.rotation.y = -Math.PI / 2; sc.add(ntv); sc.add(rbox(0.05, 0.84, 1.46, mat(0x111111), 11.24, 1.6, -1.0));
  const ntvL = new THREE.PointLight(0x9fd0ff, 0, 4, 1.6); ntvL.position.set(10.4, 1.6, -1.0); sc.add(ntvL); practical(sc, 10.4, 1.1, -2.6, 0xffb46a, { i: 2.5, d: 4, r: 0.1, bokeh: 0.45 });
  const neigh = npc(3, { hood: 0x2bb673, hoodD: 0x2bb673, skin: 0x6b4128 }); sc.add(neigh.root);
  const hero = makeRig({}); sc.add(hero.root); const phone = phoneMesh(); hero.arms[1].el.add(phone); phone.position.set(0, -0.5, 0.12); phone.rotation.set(-1.25, 0, 0); phone.scale.setScalar(0.55);
  const dPhone = phoneMesh(); dPhone.rotation.x = -Math.PI / 2; dPhone.position.set(1.15, 0.885, -2.15); sc.add(dPhone);
  const shades = grp(0, 0.38, 0.33, hero.head); shades.add(rbox(0.25, 0.13, 0.03, mat(0x0b0b10, { roughness: 0.1, metalness: 0.6 }), -0.15, 0, 0)); shades.add(rbox(0.25, 0.13, 0.03, mat(0x0b0b10, { roughness: 0.1, metalness: 0.6 }), 0.15, 0, 0)); shades.add(rbox(0.66, 0.04, 0.03, mat(0x0b0b10), 0, 0.05, 0)); shades.visible = false;
  const ring = makeRing(sc);
  S.flat = { sc, hero, neigh, phone, dPhone, router, leds, rLight, tvT, tvL, ntvT, ntvL, bulb, ring, shades, chair, monL };
}
{ // ---- classroom (Day 7): dim afternoon, blinds, every student's face lit by a phone under the desk
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x10131c); sc.environment = ENV; sc.environmentIntensity = 0.25;
  sc.add(new THREE.HemisphereLight(0xbfd0ff, 0x30281e, 0.4));
  const sun = new THREE.DirectionalLight(0xffc98a, 1.6); sun.position.set(8, 6, 2); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10, near: 1, far: 40 }); sun.shadow.camera.updateProjectionMatrix(); sc.add(sun);
  sc.add(rbox(16, 0.2, 14, mat(0x8a7a62, { roughness: 0.7 }), 0, -0.1, 0)); sc.add(rbox(16, 4, 0.25, mat(0xd9cfb8, { roughness: 0.9 }), 0, 2, -5.2)); sc.add(rbox(0.25, 4, 14, mat(0xd9cfb8, { roughness: 0.9 }), -6, 2, 0));
  const board = screenMesh(5, 1.8, canvasTex(1000, 360, (g, w, h) => { g.fillStyle = '#20402e'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(255,255,255,0.85)'; g.fillStyle = 'rgba(255,255,255,0.85)'; g.font = '600 64px Arial'; g.fillText('PHYSICS TEST', 60, 110); g.font = '400 44px Arial'; g.fillText('F = ma        E = mc²', 60, 200); g.fillText('no phones!!', 60, 290); }), { x: 0, y: 2.1, z: -5.05 }); sc.add(board);
  for (let i = 0; i < 6; i++) { const bl = rbox(0.12, 3.2, 1.5, mat(0xe8e1d0, { roughness: 0.8 }), 6.2, 1.9, -4 + i * 1.6); sc.add(bl); }
  const shafts = [0, 1, 2].map(i => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 5), new THREE.MeshBasicMaterial({ map: hazeTex, color: 0xffc98a, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false })); m.position.set(3.6, 2.0, -3 + i * 2.4); m.rotation.set(0, Math.PI / 2, -0.9); sc.add(m); return m; });
  const desks = [], kids = [], glows = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) { const x = -2.6 + c * 2.6, z = -1.4 + r * 2.0; const d = grp(x, 0, z, sc); d.add(rbox(1.2, 0.06, 0.7, mat(0xb98a5a, { roughness: 0.5 }), 0, 0.78, 0)); [[-0.5, -0.3], [0.5, -0.3], [-0.5, 0.3], [0.5, 0.3]].forEach(([a, b]) => d.add(rbox(0.05, 0.78, 0.05, mat(0x555555), a, 0.39, b))); desks.push(d);
    const k = npc(r * 3 + c, { noHood: true }); k.root.position.set(x, 0, z + 0.55); k.root.rotation.y = Math.PI; sc.add(k.root); kids.push(k);
    const p = phoneMesh(); p.scale.setScalar(0.5); p.rotation.x = -1.1; k.arms[0].el.add(p); p.position.set(0.05, -0.5, 0.12); drawPhone(p.tex, 'onebar', 0); k.phone = p;
    const gl = new THREE.PointLight(0x7fc8ff, 0, 1.4, 1.6); sc.add(gl); glows.push(gl); }
  const teacher = makeRig({ hood: 0x6e6e78, hoodD: 0x55555e, pants: 0x2d2d35, skin: 0x8d5a3b, hair: 0x9a9a9a, noHood: true, tie: 0x3a7ae0 }); sc.add(teacher.root);
  S.cls = { sc, kids, glows, teacher };
}
