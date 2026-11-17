
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


// ---------------------------------------------------------------- the drip kit: accessories that escalate with the level (0 scruffy .. 5 cosmic)
const GOLD = new THREE.MeshStandardMaterial({ color: 0xffc94a, metalness: 1, roughness: 0.16, envMapIntensity: 1.8, emissive: 0x4a2c00, emissiveIntensity: 0.3 });
const DIAM = new THREE.MeshStandardMaterial({ color: 0xe8fbff, metalness: 0.2, roughness: 0.02, envMapIntensity: 3, emissive: 0x9fe8ff, emissiveIntensity: 0.6, flatShading: true });
const starTex = canvasTex(128, 128, (g) => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.15, 'rgba(255,240,200,0.8)'); gr.addColorStop(1, 'rgba(255,220,150,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  g.fillStyle = 'rgba(255,255,255,0.9)'; g.beginPath(); g.moveTo(64, 0); g.lineTo(69, 59); g.lineTo(128, 64); g.lineTo(69, 69); g.lineTo(64, 128); g.lineTo(59, 69); g.lineTo(0, 64); g.lineTo(59, 59); g.closePath(); g.fill(); });
const sparkle = (s = 0.4, col = 0xfff2c8) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: starTex, color: col, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); sp.scale.setScalar(s); sp.renderOrder = 6; return sp; };
function makeChain(r = 0.21, drop = 0.28, n = 15, link = 0.032) {
  const g = grp(); const lg = new THREE.TorusGeometry(link, link * 0.36, 6, 12);
  for (let i = 0; i <= n; i++) { const a = -Math.PI / 2 + Math.PI * i / n; const m = new THREE.Mesh(lg, GOLD); m.position.set(r * Math.sin(a), -drop * Math.cos(a), 0); m.rotation.set(i % 2 ? Math.PI / 2 : 0, 0, a); m.castShadow = true; g.add(m); }
  const pend = new THREE.Mesh(new THREE.OctahedronGeometry(link * 2.4, 0), DIAM); pend.position.set(0, -drop - link * 2.6, 0.01); pend.scale.set(0.8, 1.2, 0.5); g.add(pend); g.pend = pend; return g; }
function makeChainFixed() { return makeChain(); }
// ---------------------------------------------------------------- props + characters (Drip v2)
const blobTex = canvasTex(128, 128, (g) => { const gr = g.createRadialGradient(64, 64, 4, 64, 64, 64); gr.addColorStop(0, 'rgba(0,0,0,0.55)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); });
function blob(sc, s = 1.3) { const m = new THREE.Mesh(new THREE.PlaneGeometry(s, s), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.y = 0.012; sc.add(m); return m; }
const TAGM = new THREE.MeshStandardMaterial({ roughness: 0.9, map: canvasTex(128, 180, (g, w, h) => { g.fillStyle = '#f3ead6'; g.fillRect(0, 0, w, h); g.fillStyle = '#5a5040'; g.beginPath(); g.arc(64, 22, 8, 0, 7); g.fill(); g.fillStyle = '#c0392b'; g.fillRect(14, 44, 100, 6); g.fillStyle = '#1d1a26'; g.textAlign = 'center'; g.font = 'italic 500 64px Lora'; g.fillText('£40', 64, 120); g.font = '700 18px InterW'; g.fillText('CHARITY', 64, 156); }) });
function tagMesh() { const g = grp(); g.add(cyl(0.004, 0.004, 0.12, mat(0xf4f4f4), 0, -0.06, 0, 4)); const c = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.17, 0.008), [mat(0xf3ead6), mat(0xf3ead6), mat(0xf3ead6), mat(0xf3ead6), TAGM, TAGM]); c.position.y = -0.2; g.add(c); return g; }
function hideFace(P) { P.head.children.slice(1).forEach(c => c.visible = false); P.face = () => {}; }
const KNEEL = { bob: -0.42, spineX: 0.12, legs: [[1.5, 1.6], [0.05, 1.5]] };
const BROWN = 0x8a6a48;
function jacketBits(P, tag = true) {   // the £40 charity-shop look: elbow patches + price tag (for NPCs and the bouncer)
  const b = grp(0, 0, 0, P.spine); b.add(rbox(0.2, 0.16, 0.02, mat(0x5a4632, { roughness: 1 }), -0.22, 0.52, 0.245)); b.add(rbox(0.14, 0.12, 0.02, mat(0x4a5a3a, { roughness: 1 }), 0.25, 0.25, 0.245));
  b.add(rbox(0.12, 0.4, 0.025, mat(0x6e5236, { roughness: 0.9 }), -0.12, 0.56, 0.24)); b.add(rbox(0.12, 0.4, 0.025, mat(0x6e5236, { roughness: 0.9 }), 0.12, 0.56, 0.24));
  if (tag) { const t = tagMesh(); t.position.set(0.13, -0.3, 0.02); P.arms[1].el.add(t); P.tag = t; } return b; }
function makeHero() {
  const P = makeRig({ hood: 0x8a6a49, hoodD: 0x6e5236, noHood: true }); const K = {}; P.kit = K;
  K.fab = mat(0x8a6a49, { roughness: 0.75 }); K.lapM = mat(0x6e5236, { roughness: 0.9 });
  K.lapels = [-1, 1].map(sx => { const l = rbox(0.13, 0.42, 0.025, K.lapM, sx * 0.13, 0.55, 0.24); l.rotation.z = sx * 0.22; P.spine.add(l); return l; });
  K.shirt = rbox(0.13, 0.38, 0.02, mat(0xefe7d4, { roughness: 0.8 }), 0, 0.57, 0.233); P.spine.add(K.shirt);
  K.btnM = mat(0x4a3220, { roughness: 0.5 }); K.btns = [0.4, 0.27, 0.14].map(y => { const b = cyl(0.028, 0.028, 0.02, K.btnM, 0.07, y, 0.243, 12); b.rotation.x = Math.PI / 2; P.spine.add(b); return b; });
  K.patches = [rbox(0.2, 0.16, 0.02, mat(0x5a4632, { roughness: 1 }), -0.22, 0.25, 0.245), rbox(0.14, 0.12, 0.02, mat(0x4a5a3a, { roughness: 1 }), 0.25, 0.5, 0.245)]; K.patches.forEach(p => P.spine.add(p));
  K.tag = tagMesh(); K.tag.position.set(0.13, -0.3, 0.02); P.arms[1].el.add(K.tag);
  K.shoes = P.legs.map((L, i) => { const g = grp(0, -0.42, 0.05, L.knee); g.add(rbox(0.33, 0.15, 0.47, mat(0xfafafa, { roughness: 0.3 }))); g.add(rbox(0.34, 0.05, 0.48, mat(0xe9e9e9, { roughness: 0.5 }), 0, -0.06, 0)); g.add(rbox(0.02, 0.05, 0.24, mat(0xd4a640, { roughness: 0.3, metalness: 0.8 }), (i ? 1 : -1) * 0.17, 0.01, 0.02));
    g.laces = [-1, 1].map(s => { const l = cyl(0.009, 0.009, 0.3, mat(0xffffff), s * 0.05, -0.05, 0.2, 5); l.rotation.z = s * 0.15; g.add(l); return l; });
    g.bow = grp(0, 0.09, 0.08, g); [-1, 1].forEach(s => { const lp = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.008, 5, 12), mat(0xffffff)); lp.position.x = s * 0.05; lp.rotation.y = Math.PI / 2 + s * 0.4; g.bow.add(lp); }); return g; });
  K.chain = makeChain(); K.chain.position.set(0, 0.7, 0.27); P.spine.add(K.chain);
  K.watch = grp(0, -0.3, 0, P.arms[0].el); { const w = new THREE.Mesh(new THREE.TorusGeometry(0.125, 0.03, 8, 24), GOLD); w.rotation.x = Math.PI / 2; K.watch.add(w); const f = cyl(0.06, 0.06, 0.03, DIAM, 0.12, 0, 0, 12); f.rotation.z = Math.PI / 2; K.watch.add(f); }
  K.sparks = [[0, 0.32, 0.33, P.spine], [0.18, 0.55, 0.3, P.spine], [-0.2, 0.5, 0.3, P.spine], [0.3, 0.9, 0.2, P.head], [-0.33, 0.78, 0.25, P.head]].map(([x, y, z, par], i) => { const s = sparkle(0.35); s.position.set(x, y, z); par.add(s); s.ph = i * 1.7; return s; });
  K.glow = new THREE.PointLight(0xffc96a, 0, 3, 1.6); K.glow.position.set(0, 0.45, 0.8); P.spine.add(K.glow);
  K.set = (lvl, O, o = {}) => { const rich = lvl >= 2;
    K.fab.color.setHex(rich ? 0x1d1530 : 0x8a6a49); K.fab.roughness = rich ? 0.55 : 0.85; K.lapels.forEach(l => l.material = rich ? GOLD : K.lapM); K.btns.forEach(b => b.material = rich ? GOLD : K.btnM); K.shirt.material.color.setHex(rich ? 0x111111 : 0xefe7d4);
    K.patches.forEach(p => p.visible = !rich); K.tag.visible = lvl === 0 || !!o.tag; K.tag.rotation.z = 0.25 * Math.sin(O * 3.1); K.tag.rotation.x = 0.15 * Math.sin(O * 2.3);
    K.shoes.forEach(s => { s.visible = lvl >= 1; s.laces.forEach(l => l.visible = !!o.untied); s.bow.visible = !o.untied && lvl >= 1; });
    K.chain.visible = lvl >= 3; K.watch.visible = lvl >= 4;
    const sp = lvl >= 4 ? (lvl >= 5 ? 1 : 0.6) * (o.spark ?? 1) : 0; K.sparks.forEach(s => { const tw = Math.pow(Math.max(0, Math.sin(O * 2.6 + s.ph)), 6); s.visible = sp > 0; s.material.opacity = sp * (0.25 + 0.75 * tw); s.scale.setScalar(0.18 + 0.5 * tw); });
    K.chain.scale.setScalar(lvl >= 4 ? 1.12 : 1); K.glow.intensity = (lvl >= 5 ? 2.2 : lvl >= 4 ? 0.9 : 0) * (o.glow ?? 1); };
  return P;
}
function makeBouncer() { const P = makeRig({ hood: 0x111115, hoodD: 0x111115, pants: 0x18181c, skin: 0x5a3826, hair: 0x111111, hairStyle: 'none', noHood: true, shoe: 0x0a0a0a });
  P.head.add(rbox(0.5, 0.16, 0.08, mat(0x15100d), 0, 0.12, 0.29)); P.head.add(cyl(0.035, 0.035, 0.12, mat(0x222222), 0.35, 0.33, 0.02, 8));
  P.spine.add(rbox(0.12, 0.4, 0.02, mat(0xf4f4f4), 0, 0.58, 0.236)); P.spine.add(rbox(0.07, 0.34, 0.03, mat(0x111111), 0, 0.55, 0.25));
  P.fab = mat(0x111115, { roughness: 0.75 }); P.brown = jacketBits(P); P.root.scale.setScalar(1.28);
  P.setBrown = (on) => { P.fab.color.setHex(on ? BROWN : 0x111115); P.brown.visible = on; P.tag.visible = on; }; P.setBrown(false); return P; }
function makeMannequin(hex) { const P = makeRig({ hood: hex, hoodD: hex, pants: 0xdcdce0, skin: 0xededf0, hairStyle: 'none', noHood: true, shoe: 0xdcdce0 }); hideFace(P); P.fab = mat(hex, { roughness: 0.75 });
  P.root.add(cyl(0.3, 0.34, 0.06, mat(0x2a2a2a, { roughness: 0.3, metalness: 0.6 }), 0, 0.03, 0, 20)); return P; }
function makeJudge() { const P = makeRig({ hood: 0x101012, hoodD: 0x101012, pants: 0x101012, skin: 0xe2b896, hair: 0xe8e4dc, hairStyle: 'none', noHood: true });
  const wm = mat(0xf2efe8, { roughness: 0.95 }); P.head.add(rbox(0.74, 0.24, 0.7, wm, 0, 0.7, -0.02));
  for (const sx of [-1, 1]) for (let k = 0; k < 4; k++) { const c = cyl(0.07, 0.07, 0.2, wm, sx * 0.4, 0.62 - k * 0.15, -0.08, 12); c.rotation.x = Math.PI / 2; P.head.add(c); }
  P.spine.add(rbox(0.07, 0.16, 0.02, mat(0xffffff), -0.04, 0.62, 0.24)); P.spine.add(rbox(0.07, 0.16, 0.02, mat(0xffffff), 0.04, 0.62, 0.24));
  P.head.add(rbox(0.12, 0.05, 0.02, mat(0x8a8a8a), -0.15, 0.27, 0.32)); P.head.add(rbox(0.12, 0.05, 0.02, mat(0x8a8a8a), 0.15, 0.27, 0.32));   // half-moon specs sit low, eyes stay clear
  return P; }
function makeGuard() { const P = makeRig({ hood: 0x15151a, hoodD: 0x15151a, pants: 0x15151a, skin: 0x6b4128, hair: 0x111111, noHood: true, tie: 0x15151a, shoe: 0x0b0b0b });
  P.arms.forEach(A => A.el.children[1].material = mat(0xffffff, { roughness: 0.7 })); const coil = cyl(0.012, 0.012, 0.3, mat(0xdddddd, { roughness: 0.3 }), 0.34, 0.2, -0.02, 6); P.head.add(coil); return P; }
function makeMugger(i) { const P = makeRig({ hood: [0x2a2a30, 0x3a3f4a][i], hoodD: [0x1f1f24, 0x2c313a][i], pants: 0x222226, skin: [0x8d5a3b, 0xd9a882][i], hair: 0x111111 });
  P.head.add(rbox(0.68, 0.22, 0.1, mat(0x111111, { roughness: 0.9 }), 0, 0.14, 0.28)); P.wallet = rbox(0.16, 0.11, 0.03, mat(0x5a3a22), 0, 0, 0); return P; }
function makePeacock() {
  const g = grp(); const blue = new THREE.MeshPhysicalMaterial({ color: 0x1a4fc4, roughness: 0.3, metalness: 0.3, sheen: 1, sheenColor: new THREE.Color(0x3ff0c0), envMapIntensity: 1.4 });
  const body = ball(0.3, blue, 0, 0.62, 0); body.scale.set(0.8, 0.9, 1.25); g.add(body);
  const neck = grp(0, 0.75, 0.2, g); const nk = cyl(0.07, 0.11, 0.5, blue, 0, 0.22, 0, 14); neck.add(nk); neck.rotation.x = 0.25;
  const head = grp(0, 0.5, 0.02, neck); head.add(ball(0.1, blue)); head.add(cone(0.035, 0.12, mat(0x3a3020), 0, -0.01, 0.13, 8)).children; head.children[1].rotation.x = Math.PI / 2;
  for (const sx of [-1, 1]) { head.add(rbox(0.035, 0.05, 0.02, mat(0xffffff), sx * 0.075, 0.025, 0.05)); head.add(rbox(0.02, 0.03, 0.02, mat(0x111111), sx * 0.08, 0.025, 0.062)); }
  for (let k = -2; k <= 2; k++) { const st = cyl(0.006, 0.006, 0.14, mat(0x2a4a90), k * 0.025, 0.15, -0.01, 4); st.rotation.z = k * 0.15; head.add(st); head.add(ball(0.02, blue, k * 0.045, 0.22, -0.01, undefined, 8)); }
  [-0.1, 0.1].forEach(x => { g.add(cyl(0.02, 0.02, 0.45, mat(0x9a8a7a), x, 0.22, 0, 6)); });
  const fT = canvasTex(64, 256, (c, w, h) => { const gr = c.createLinearGradient(0, h, 0, 0); gr.addColorStop(0, '#2a4a20'); gr.addColorStop(0.7, '#4a8a3a'); gr.addColorStop(1, '#6ab04a'); c.fillStyle = gr; c.beginPath(); c.ellipse(32, 128, 28, 126, 0, 0, 7); c.fill();
    c.fillStyle = '#c8a040'; c.beginPath(); c.ellipse(32, 44, 22, 28, 0, 0, 7); c.fill(); c.fillStyle = '#18a088'; c.beginPath(); c.ellipse(32, 46, 15, 20, 0, 0, 7); c.fill(); c.fillStyle = '#1a2a8a'; c.beginPath(); c.ellipse(32, 48, 8, 11, 0, 0, 7); c.fill(); });
  const fm = new THREE.MeshStandardMaterial({ map: fT, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.4, metalness: 0.2, envMapIntensity: 1.2 });
  const tail = grp(0, 0.6, -0.3, g); const fe = [...Array(19)].map((_, i) => { const p = grp(0, 0, 0, tail); const m = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 1.7), fm); m.position.y = 0.85; m.castShadow = true; p.add(m); p.u = i / 18 - 0.5; p.d = (i % 2) * 0.01; return p; });
  g.userData = { neck, head, tail, fe }; g.setTail = (k) => { fe.forEach(p => { p.rotation.set(0, 0, -p.u * 2.9 * k); p.position.z = -p.d; }); tail.rotation.x = lerp(-2.0, -0.32, k); tail.scale.setScalar(lerp(0.75, 1, k)); }; g.setTail(0);
  return g; }
const CROSS = { arms: [[-0.55, 0, -0.22, 1.55], [-0.6, 0, 0.22, 1.5]] };
