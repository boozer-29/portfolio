
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


const GOLD = new THREE.MeshStandardMaterial({ color: 0xffc94a, metalness: 1, roughness: 0.16, envMapIntensity: 1.8, emissive: 0x4a2c00, emissiveIntensity: 0.3 });
const DIAM = new THREE.MeshStandardMaterial({ color: 0xe8fbff, metalness: 0.2, roughness: 0.02, envMapIntensity: 3, emissive: 0x9fe8ff, emissiveIntensity: 0.6, flatShading: true });
const starTex = canvasTex(128, 128, (g) => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.15, 'rgba(255,240,200,0.8)'); gr.addColorStop(1, 'rgba(255,220,150,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  g.fillStyle = 'rgba(255,255,255,0.9)'; g.beginPath(); g.moveTo(64, 0); g.lineTo(69, 59); g.lineTo(128, 64); g.lineTo(69, 69); g.lineTo(64, 128); g.lineTo(59, 69); g.lineTo(0, 64); g.lineTo(59, 59); g.closePath(); g.fill(); });
const sparkle = (s = 0.4, col = 0xfff2c8) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: starTex, color: col, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); sp.scale.setScalar(s); sp.renderOrder = 6; return sp; };
const blobTex = canvasTex(128, 128, (g) => { const gr = g.createRadialGradient(64, 64, 4, 64, 64, 64); gr.addColorStop(0, 'rgba(0,0,0,0.55)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); });
function blob(sc, s = 1.3) { const m = new THREE.Mesh(new THREE.PlaneGeometry(s, s), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.y = 0.012; sc.add(m); return m; }
function hideFace(P) { P.head.children.slice(1).forEach(c => c.visible = false); P.face = () => {}; }
const KNEEL = { bob: -0.42, spineX: 0.12, legs: [[1.5, 1.6], [0.05, 1.5]] };
