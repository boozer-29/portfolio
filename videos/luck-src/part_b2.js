// ---------------------------------------------------------------- SCENES (Luck: all new sets and characters)
const S = {};
const Q = (x, y, z, o = 'YXZ') => new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z, o));
const sag = (a, b, s, n = 20) => [...Array(n)].map((_, i) => { const u = i / (n - 1); return a.clone().lerp(b, u).add(V([0, -s * 4 * u * (1 - u), 0])); });
const ctex = (w, h, draw) => canvasTex(w, h, draw);

// ---------------------------------------------------------------- characters (all new to the series)
// the hero wears white trainers this episode (the Day 1 butter lands on one)
function makeLuckHero() { return makeRig({ shoe: 0xf1f1ee }); }
// Marcus: smug neighbour. White polo (unique hex: it gets wet / sooty), chinos, slick quiff, gold watch
const MARCUS_SHIRT = 0xf6f6f1, MARCUS_HAIR = 0x2b1a10;
function makeMarcus() {
  const P = makeRig({ hood: MARCUS_SHIRT, hoodD: MARCUS_SHIRT, pants: 0xc9b48a, skin: 0xd9a67e, hair: MARCUS_HAIR, hairStyle: 'none', noHood: true, shoe: 0x6b3a1e });
  const hm = mat(MARCUS_HAIR, { roughness: 0.12, envMapIntensity: 1.6 });
  P.head.add(rbox(0.7, 0.14, 0.64, hm, 0, 0.67, -0.02)); P.head.add(rbox(0.08, 0.28, 0.5, hm, -0.33, 0.52, -0.06)); P.head.add(rbox(0.08, 0.28, 0.5, hm, 0.33, 0.52, -0.06)); P.head.add(rbox(0.7, 0.42, 0.1, hm, 0, 0.45, -0.29));
  P.quiff = T(P.head, rbox(0.62, 0.2, 0.34, hm, 0, 0.8, 0.14)); P.quiff.rotation.x = -0.35;
  const cm = mat(0xffffff, { roughness: 0.7 }); for (const sx of [-1, 1]) { const c = T(P.spine, rbox(0.2, 0.07, 0.16, cm, sx * 0.13, 0.75, 0.15)); c.rotation.z = sx * 0.35; }
  P.spine.add(rbox(0.06, 0.2, 0.02, mat(0xe0e0dc), 0, 0.62, 0.238));
  const w = new THREE.Mesh(new THREE.TorusGeometry(0.125, 0.03, 8, 24), GOLD); w.rotation.x = Math.PI / 2; w.position.y = -0.3; P.arms[0].el.add(w);
  P.fab = mat(MARCUS_SHIRT, { roughness: 0.75 }); P.hm = hm;
  P.sponge = rbox(0.24, 0.13, 0.16, mat(0xffd23a, { roughness: 1 }), 0, -0.52, 0.05); P.arms[1].el.add(P.sponge); P.sponge.visible = false;
  P.ticket = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.14), mat(0xfaf7ee, { side: THREE.DoubleSide })); P.ticket.position.set(0, -0.52, 0.12); P.arms[1].el.add(P.ticket); P.ticket.visible = false;
  P.drips = [...Array(10)].map((_, i) => { const d = ball(0.025, mat(0x9fd0ff, { roughness: 0.05, transparent: true, opacity: 0.8 }), 0, 0, 0, undefined, 8); d.visible = false; P.root.add(d); d.ph = i * 0.37; return d; });
  // wet: 0..1 (shirt goes grey-blue, hair flattens, drips fall); soot: 0..1 (singed: grey shirt, hair blown up)
  P.state = (O, wet = 0, soot = 0) => {
    P.fab.color.setHex(MARCUS_SHIRT).lerp(new THREE.Color(0x9aaabb), wet * 0.6).lerp(new THREE.Color(0x5a554e), soot * 0.75);
    P.quiff.rotation.x = -0.35 + 0.55 * wet - 0.9 * soot; P.quiff.position.y = 0.8 - 0.08 * wet + 0.12 * soot;
    P.drips.forEach((d, i) => { d.visible = wet > 0.3; const u = ((O * 0.9 + d.ph) % 1); d.position.set(-0.4 + (i % 5) * 0.2, 2.2 - u * 2.1, 0.32 - (i > 4 ? 0.5 : 0)); });
  };
  return P;
}
function makeBaker() {
  const P = makeRig({ hood: 0xe58fa8, hoodD: 0xe58fa8, pants: 0x34344a, skin: 0xe8b996, hair: 0xd9d4cc, hairStyle: 'long', noHood: true, shoe: 0x333333 });
  P.spine.add(rbox(0.62, 0.66, 0.03, mat(0xfafafa, { roughness: 0.9 }), 0, 0.3, 0.245)); P.head.add(rbox(0.5, 0.1, 0.5, mat(0xffffff, { roughness: 0.9 }), 0, 0.8, -0.05));
  return P;
}
function makeKid() { const P = npc(4, { hood: 0x2bb673, hoodD: 0x2bb673 }); P.head.add(cyl(0.37, 0.37, 0.16, mat(0x1f6fd0, { roughness: 0.6 }), 0, 0.8, -0.01, 24)); T(P.head, rbox(0.42, 0.04, 0.3, mat(0x1f6fd0, { roughness: 0.6 }), 0, 0.74, 0.42)); P.root.scale.setScalar(0.62); return P; }
function makeSuit(hex, o = {}) {
  const P = makeRig({ hood: hex, hoodD: hex, pants: hex, skin: o.skin ?? 0xc8946c, hair: o.hair ?? 0x1a1410, hairStyle: o.bald ? 'none' : 'short', noHood: true, shoe: 0x0c0c0e, tie: o.tie ?? 0x8a1020 });
  if (o.vest) { P.spine.add(rbox(0.62, 0.5, 0.03, mat(0x111114), 0, 0.3, 0.24)); }
  if (o.bald) { P.sweat = [0, 1, 2].map(i => { const d = ball(0.03, mat(0xbfe6ff, { roughness: 0.02, transparent: true, opacity: 0.85 }), -0.18 + i * 0.18, 0.55, 0.32, undefined, 8); P.head.add(d); return d; }); }
  return P;
}
function hatOn(P, kind, col) {
  if (kind === 'flat') { T(P.head, rbox(0.74, 0.12, 0.7, mat(col, { roughness: 0.9 }), 0, 0.78, 0.02)); T(P.head, rbox(0.6, 0.05, 0.22, mat(col, { roughness: 0.9 }), 0, 0.72, 0.38)).rotation.x = 0.15; }
  else if (kind === 'trilby') { P.head.add(cyl(0.5, 0.5, 0.04, mat(col), 0, 0.72, 0, 24)); P.head.add(cyl(0.3, 0.34, 0.26, mat(col), 0, 0.86, 0, 20)); P.head.add(cyl(0.345, 0.345, 0.06, mat(0x222222), 0, 0.77, 0, 20)); }
  else if (kind === 'fascinator') { P.head.add(ball(0.12, mat(col), 0.2, 0.8, 0.05, undefined, 12)); P.head.add(cyl(0.004, 0.004, 0.4, mat(col), 0.28, 0.95, 0, 4)); }
}

// ---------------------------------------------------------------- props
// the coin: heads = a crowned head in profile, tails = a big "1"
const coinFace = (heads) => ctex(256, 256, (g, w, h) => {
  const gr = g.createRadialGradient(100, 90, 10, 128, 128, 128); gr.addColorStop(0, '#fff3b0'); gr.addColorStop(0.6, '#e6b341'); gr.addColorStop(1, '#a8761c'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#8a5d12'; g.lineWidth = 10; g.beginPath(); g.arc(128, 128, 112, 0, 7); g.stroke(); g.lineWidth = 3; g.beginPath(); g.arc(128, 128, 96, 0, 7); g.stroke();
  g.fillStyle = '#9c6a18';
  if (heads) { g.beginPath(); g.ellipse(132, 140, 46, 56, 0, 0, 7); g.fill(); g.fillRect(110, 170, 50, 50); g.beginPath(); g.moveTo(92, 92); g.lineTo(100, 60); g.lineTo(115, 82); g.lineTo(130, 52); g.lineTo(145, 82); g.lineTo(160, 60); g.lineTo(170, 92); g.closePath(); g.fill(); g.fillStyle = '#f7d873'; g.beginPath(); g.arc(150, 128, 7, 0, 7); g.fill(); }
  else { g.font = '800 150px InterW, Arial'; g.textAlign = 'center'; g.fillText('1', 128, 180); }
});
function makeCoin(r = 0.11) {
  const side = mat(0xc99a2e, { metalness: 1, roughness: 0.25, envMapIntensity: 1.6 });
  const fH = new THREE.MeshStandardMaterial({ map: coinFace(true), metalness: 0.9, roughness: 0.28, envMapIntensity: 1.5 }), fT = new THREE.MeshStandardMaterial({ map: coinFace(false), metalness: 0.9, roughness: 0.28, envMapIntensity: 1.5 });
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, r * 0.16, 40), [side, fH, fT]); m.castShadow = true; return m;
}
// a big hand (back of the hand, palm down) with a red hoodie cuff: the coin-flip insert
function makeHandInsert() {
  const g = grp(); const sk = mat(0xd49a6a, { roughness: 0.55, envMapIntensity: 0.5 }), hood = mat(0xD7262E, { roughness: 0.75 });
  g.add(rbox(1.2, 0.36, 1.25, sk, 0, 0, 0)); [-0.42, -0.14, 0.14, 0.42].forEach((x, i) => g.add(rbox(0.24, 0.26, 0.62 - Math.abs(i - 1.5) * 0.08, sk, x, -0.02, 0.86 - Math.abs(i - 1.5) * 0.04)));
  T(g, rbox(0.3, 0.26, 0.55, sk, -0.72, -0.02, 0.2)).rotation.y = 0.5; g.add(rbox(1.5, 0.62, 1.1, hood, 0, 0.05, -1.05)); g.add(rbox(1.56, 0.66, 0.14, mat(0x9e1a21, { roughness: 0.75 }), 0, 0.05, -0.52));
  return g;
}
const sausageMat = mat(0xd38a34, { roughness: 0.55, envMapIntensity: 0.9 });
function makeSausageRoll(s = 1) { const g = grp(); const b = T(g, cyl(0.12, 0.12, 0.42, sausageMat, 0, 0, 0, 16)); b.rotation.z = Math.PI / 2; b.scale.set(1, 1, 0.8);
  [-1, 1].forEach(sx => { const e = ball(0.12, sausageMat, sx * 0.21, 0, 0, undefined, 14); e.scale.set(0.5, 1, 0.8); g.add(e); });
  for (let k = 0; k < 5; k++) { const f = T(g, rbox(0.03, 0.02, 0.2, mat(0xa8641e), -0.16 + k * 0.08, 0.1, 0)); f.rotation.x = 0.2; }
  g.scale.setScalar(s); return g; }
const priceTex = (txt, sub) => ctex(256, 160, (g, w, h) => { g.fillStyle = '#fbf6e9'; g.fillRect(0, 0, w, h); g.strokeStyle = '#c0392b'; g.lineWidth = 8; g.strokeRect(6, 6, w - 12, h - 12); g.fillStyle = '#1d1a26'; g.textAlign = 'center'; g.font = '800 30px InterW, Arial'; g.fillText(sub, w / 2, 48); g.fillStyle = '#c0392b'; g.font = '800 78px InterW, Arial'; g.fillText(txt, w / 2, 128); });
function makePriceCard(txt, sub) { const g = grp(); const m = new THREE.MeshStandardMaterial({ map: priceTex(txt, sub), roughness: 0.8 }); g.add(new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.26), m)); T(g, new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.26), m)).rotation.y = Math.PI;   // a tent card: readable from both sides of the counter
 g.add(rbox(0.03, 0.2, 0.03, mat(0x333333), 0, -0.2, -0.01)); return g; }
function makeToast() { const g = grp(); g.add(rbox(0.34, 0.05, 0.32, mat(0xe0a95a, { roughness: 0.8 }))); g.add(rbox(0.36, 0.045, 0.34, mat(0x9a5b22, { roughness: 0.8 }), 0, -0.005, 0)); g.butter = rbox(0.14, 0.02, 0.12, mat(0xffe27a, { roughness: 0.3 }), 0.02, 0.035, 0.01); g.add(g.butter); return g; }
const noteTex = ctex(256, 144, (g, w, h) => { g.fillStyle = '#6fc7b6'; g.fillRect(0, 0, w, h); g.fillStyle = '#4aa292'; g.fillRect(0, 0, w, 22); g.fillRect(0, h - 22, w, 22); g.fillStyle = '#e9f7f1'; g.beginPath(); g.ellipse(190, 72, 40, 48, 0, 0, 7); g.fill();
  g.fillStyle = '#1f5f55'; g.font = '800 64px InterW, Arial'; g.textAlign = 'left'; g.fillText('£5', 18, 96); g.font = '700 18px InterW, Arial'; g.fillText('FIVE POUNDS', 20, 124); g.font = '800 40px InterW, Arial'; g.textAlign = 'center'; g.fillText('5', 190, 86); });
function makeNote() { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.28, 6, 1), new THREE.MeshStandardMaterial({ map: noteTex, roughness: 0.7, side: THREE.DoubleSide })); m.castShadow = true; return m; }
// pedestrian signal: red man / green man (two textures, swapped per light)
const manTex = (green) => ctex(128, 128, (g, w, h) => { g.fillStyle = '#0b0b0b'; g.fillRect(0, 0, w, h); g.fillStyle = green ? '#3dff7a' : '#ff3b2f'; g.beginPath(); g.arc(64, 26, 12, 0, 7); g.fill();
  if (green) { g.fillRect(54, 40, 20, 40); g.save(); g.translate(56, 80); g.rotate(0.45); g.fillRect(0, 0, 9, 38); g.restore(); g.save(); g.translate(68, 80); g.rotate(-0.45); g.fillRect(0, 0, 9, 38); g.restore(); g.save(); g.translate(54, 44); g.rotate(0.6); g.fillRect(0, 0, 8, 30); g.restore(); }
  else { g.fillRect(52, 40, 24, 44); g.fillRect(52, 84, 9, 34); g.fillRect(67, 84, 9, 34); g.fillRect(44, 42, 8, 34); g.fillRect(76, 42, 8, 34); } });
const MAN_R = new THREE.MeshBasicMaterial({ map: manTex(false), toneMapped: false }), MAN_G = new THREE.MeshBasicMaterial({ map: manTex(true), toneMapped: false });
function makeSignal() { const g = grp(); g.add(cyl(0.06, 0.06, 2.8, mat(0x2a2d33, { metalness: 0.5, roughness: 0.4 }), 0, 1.4, 0, 10)); g.add(rbox(0.42, 0.46, 0.3, mat(0x1d1f24), 0, 2.6, 0.12));
  g.face = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.34), MAN_R); g.face.position.set(0, 2.6, 0.28); g.add(g.face); g.glow = new THREE.PointLight(0x3dff7a, 0, 2.5, 2); g.glow.position.set(0, 2.6, 0.6); g.add(g.glow);
  g.setGreen = (on) => { g.face.material = on ? MAN_G : MAN_R; g.glow.color.setHex(on ? 0x3dff7a : 0xff3b2f); g.glow.intensity = on ? 2.2 : 0.8; }; return g; }
function makeCar(col, o = {}) { const g = grp(); const b = mat(col, { roughness: 0.25, metalness: 0.35, envMapIntensity: 1.2 });
  g.add(rbox(1.9, 0.6, 4.0, b, 0, 0.6, 0)); if (!o.open) g.add(rbox(1.66, 0.55, 2.0, mat(0x9fb8d0, { roughness: 0.05, metalness: 0.5, envMapIntensity: 1.5 }), 0, 1.15, -0.2));
  if (o.open) { const ws = rbox(1.7, 0.42, 0.05, mat(0xbfe0ff, { roughness: 0.02, transparent: true, opacity: 0.35 }), 0, 1.12, 0.6); ws.rotation.x = -0.45; g.add(ws); g.add(rbox(0.7, 0.4, 0.6, mat(0x3a2418, { roughness: 0.6 }), -0.42, 1.0, -0.3)); g.add(rbox(0.7, 0.4, 0.6, mat(0x3a2418, { roughness: 0.6 }), 0.42, 1.0, -0.3)); }
  [[-0.92, 1.3], [0.92, 1.3], [-0.92, -1.3], [0.92, -1.3]].forEach(([x, z]) => { const w = cyl(0.36, 0.36, 0.28, mat(0x18181b, { roughness: 0.7 }), x, 0.36, z, 18); w.rotation.z = Math.PI / 2; g.add(w); const hc = cyl(0.2, 0.2, 0.3, mat(0xcfd3da, { metalness: 1, roughness: 0.2 }), x, 0.36, z, 14); hc.rotation.z = Math.PI / 2; g.add(hc); });
  [-0.6, 0.6].forEach(x => { g.add(rbox(0.36, 0.16, 0.06, mat(0xfff6d0, { emissive: 0xfff2c0, emissiveIntensity: o.lights ?? 1.5 }), x, 0.72, 2.0)); g.add(rbox(0.36, 0.14, 0.06, mat(0xff2a2a, { emissive: 0xff2020, emissiveIntensity: o.lights ?? 1.2 }), x, 0.74, -2.0)); });
  return g; }
function makeBus() { const g = grp(); const b = mat(0x2f5fb0, { roughness: 0.4, metalness: 0.2 }); g.add(rbox(2.5, 2.8, 10, b, 0, 1.75, 0)); g.add(rbox(2.54, 0.9, 9.4, mat(0x1a2433, { roughness: 0.05, metalness: 0.6, envMapIntensity: 1.6 }), 0, 2.3, 0));
  g.add(rbox(2.3, 0.7, 0.06, mat(0x111111), 0, 2.9, 5.02)); [-3.5, 3.5].forEach(z => [-1.2, 1.2].forEach(x => { const w = cyl(0.5, 0.5, 0.35, mat(0x18181b), x, 0.5, z, 18); w.rotation.z = Math.PI / 2; g.add(w); }));
  [-0.85, 0.85].forEach(x => g.add(rbox(0.4, 0.2, 0.06, mat(0xfff6d0, { emissive: 0xfff2c0, emissiveIntensity: 1.5 }), x, 0.85, 5.02))); return g; }
// teddies for the claw machine
const BEARC = [0xc98a4a, 0xf2a0c8, 0x7ac8ff, 0xfff07a, 0xa6e08a, 0xd8b6ff, 0xff8a5a];
function makeBear(i, s = 1) { const g = grp(); const m = mat(BEARC[i % BEARC.length], { roughness: 0.95 });
  g.add(rbox(0.34, 0.36, 0.26, m, 0, 0.18, 0)); g.add(ball(0.17, m, 0, 0.48, 0, undefined, 12)); [-1, 1].forEach(sx => { g.add(ball(0.06, m, sx * 0.12, 0.62, 0, undefined, 8)); g.add(ball(0.07, m, sx * 0.2, 0.2, 0.05, undefined, 8)); });
  g.add(ball(0.025, mat(0x111111), -0.06, 0.52, 0.15, undefined, 6)); g.add(ball(0.025, mat(0x111111), 0.06, 0.52, 0.15, undefined, 6)); g.add(ball(0.04, mat(0xfff3e0), 0, 0.45, 0.16, undefined, 8));
  g.scale.setScalar(s); return g; }
// horses: body along +z, gallop(phase) swings the legs; a jockey in silks rides on top
function makeHorse(col, o = {}) { const g = grp(); const m = mat(col, { roughness: 0.55 }), dk = mat(o.mane ?? 0x1a1310, { roughness: 0.8 });
  const body = grp(0, 1.45, 0, g); body.add(rbox(0.62, 0.68, 1.7, m, 0, 0, 0));
  const neck = grp(0, 0.2, 0.75, body); T(neck, rbox(0.4, 0.9, 0.42, m, 0, 0.35, 0.12)).rotation.x = 0.55; const head = grp(0, 0.78, 0.45, neck); T(head, rbox(0.32, 0.32, 0.72, m, 0, 0, 0.22)).rotation.x = 0.35; head.add(rbox(0.08, 0.16, 0.06, m, -0.1, 0.22, -0.05)); head.add(rbox(0.08, 0.16, 0.06, m, 0.1, 0.22, -0.05));
  [-1, 1].forEach(sx => head.add(rbox(0.04, 0.07, 0.07, mat(0x111111), sx * 0.165, 0.06, 0.18)));
  const mane = T(neck, rbox(0.12, o.shaggy ? 1.1 : 0.8, o.shaggy ? 0.3 : 0.12, dk, 0, 0.4, -0.12)); mane.rotation.x = 0.55;
  const tail = grp(0, 0.2, -0.85, body); T(tail, rbox(0.12, o.shaggy ? 0.9 : 0.7, 0.14, dk, 0, -0.32, -0.1)).rotation.x = -0.4;
  g.legs = [[-0.2, 0.62], [0.2, 0.62], [-0.2, -0.62], [0.2, -0.62]].map(([x, z]) => { const th = grp(x, -0.25, z, body); th.add(rbox(0.18, 0.62, 0.22, m, 0, -0.3, 0)); const kn = grp(0, -0.6, 0, th); kn.add(rbox(0.13, 0.55, 0.15, m, 0, -0.27, 0)); kn.add(rbox(0.16, 0.1, 0.18, mat(0x222222), 0, -0.56, 0.02)); return { th, kn }; });
  if (o.jockey !== false) { const j = grp(0, 0.38, 0.15, body); const silk = mat(o.silk ?? 0xffd21f, { roughness: 0.5 }); j.add(rbox(0.36, 0.5, 0.3, silk, 0, 0.3, 0)); j.add(rbox(0.3, 0.3, 0.28, mat(0xd9a67e), 0, 0.72, 0.02)); j.add(ball(0.19, silk, 0, 0.86, 0, undefined, 14)); [-1, 1].forEach(sx => j.add(rbox(0.12, 0.4, 0.14, mat(0xf4f4f4), sx * 0.2, 0, 0.05))); g.jockey = j; T(j, rbox(0.03, 0.03, 0.5, mat(0x333333), 0.25, 0.4, 0.3)).rotation.x = 0.5; }
  if (o.number) { const t = ctex(64, 64, (gg) => { gg.fillStyle = '#fff'; gg.fillRect(0, 0, 64, 64); gg.fillStyle = '#111'; gg.font = '800 44px InterW, Arial'; gg.textAlign = 'center'; gg.fillText(String(o.number), 32, 48); }); [-1, 1].forEach(sx => { const c = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.34), new THREE.MeshStandardMaterial({ map: t })); c.position.set(sx * 0.32, 0.1, -0.2); c.rotation.y = sx * Math.PI / 2; body.add(c); }); }
  g.body = body; g.neck = neck; g.head = head; g.tail = tail;
  g.gallop = (ph, amp = 1) => { const s = Math.sin(ph), c = Math.cos(ph); g.legs.forEach((L, i) => { const p = ph + (i < 2 ? 0 : Math.PI * 0.8) + (i % 2) * 0.35; L.th.rotation.x = Math.sin(p) * 0.75 * amp; L.kn.rotation.x = Math.max(0, -Math.cos(p)) * 1.1 * amp; });
    body.position.y = 1.45 + Math.abs(c) * 0.12 * amp; body.rotation.x = s * 0.06 * amp; neck.rotation.x = -c * 0.12 * amp; tail.rotation.x = -0.3 + s * 0.2 * amp; };
  g.stand = (O) => { g.legs.forEach(L => { L.th.rotation.x = 0; L.kn.rotation.x = 0; }); body.position.y = 1.45 + Math.sin(O * 2) * 0.01; neck.rotation.x = 0; };
  if (o.scale) g.scale.setScalar(o.scale); return g; }
// playing cards (royal flush in spades), face-up/face-down via rotation
const cardTex = (rank) => ctex(160, 224, (g, w, h) => { g.fillStyle = '#fbfbf8'; rr(g, 2, 2, w - 4, h - 4, 14); g.fill(); g.strokeStyle = '#ccc'; g.lineWidth = 3; rr(g, 4, 4, w - 8, h - 8, 12); g.stroke();
  g.fillStyle = '#121218'; g.font = '800 46px InterW, Arial'; g.textAlign = 'left'; g.fillText(rank, 14, 52); g.font = '700 40px Arial'; g.fillText('♠', 16, 94); g.textAlign = 'center'; g.font = '700 110px Arial'; g.fillText('♠', w / 2, h * 0.7); });
const cardBack = ctex(160, 224, (g, w, h) => { g.fillStyle = '#8a1020'; rr(g, 2, 2, w - 4, h - 4, 14); g.fill(); g.strokeStyle = '#f4d27a'; g.lineWidth = 4; rr(g, 12, 12, w - 24, h - 24, 8); g.stroke(); g.globalAlpha = 0.35; for (let i = -h; i < w + h; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + h, h); g.stroke(); } });
const RANKS = ['10', 'J', 'Q', 'K', 'A'];
function makeCard(rank) { const g = grp(); const f = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.45), new THREE.MeshStandardMaterial({ map: cardTex(rank), roughness: 0.6 })); f.rotation.x = -Math.PI / 2; g.add(f);
  const b = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.45), new THREE.MeshStandardMaterial({ map: cardBack, roughness: 0.6 })); b.rotation.x = Math.PI / 2; b.position.y = -0.002; g.add(b); return g; }
const CHIPC = [0xd7262e, 0x1f4fd6, 0x111111, 0x2bb673, 0xf2f2f2];
function makeChipStack(n, col) { const g = grp(); const m = mat(col, { roughness: 0.4 }), e = mat(0xffffff, { roughness: 0.4 }); for (let i = 0; i < n; i++) { g.add(cyl(0.11, 0.11, 0.035, i % 2 ? m : m, 0, 0.02 + i * 0.037, 0, 16)); if (i % 3 === 0) g.add(cyl(0.112, 0.112, 0.012, e, 0, 0.02 + i * 0.037, 0, 16)); } return g; }
// the lottery ticket (Day 26 insert): six numbers marked with crosses as the pen moves
const LOTTO = [3, 11, 19, 27, 38, 52];
const ticketTex = screenTex(512, 320);
function drawTicket(k) { const g = ticketTex.g, w = 512, h = 320; g.fillStyle = '#fff6e0'; g.fillRect(0, 0, w, h); g.fillStyle = '#e8343c'; g.fillRect(0, 0, w, 54); g.fillStyle = '#fff'; g.font = '800 36px InterW, Arial'; g.textAlign = 'left'; g.fillText('LOTTO', 18, 40); g.font = '700 20px InterW, Arial'; g.textAlign = 'right'; g.fillText('PICK 6', w - 18, 36);
  g.textAlign = 'center'; for (let n = 1; n <= 59; n++) { const c = (n - 1) % 10, r = Math.floor((n - 1) / 10); const x = 34 + c * 49, y = 92 + r * 40; g.strokeStyle = '#e8343c'; g.lineWidth = 2; g.strokeRect(x - 18, y - 16, 36, 30); g.fillStyle = '#c83030'; g.font = '700 17px InterW, Arial'; g.fillText(String(n), x, y + 6);
    const idx = LOTTO.indexOf(n); if (idx >= 0 && k * 6 > idx) { g.strokeStyle = '#1a1a40'; g.lineWidth = 5; g.beginPath(); g.moveTo(x - 15, y - 13); g.lineTo(x + 15, y + 11); g.moveTo(x + 15, y - 13); g.lineTo(x - 15, y + 11); g.stroke(); } }
  ticketTex.needsUpdate = true; }
function makeTicket() { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.0), new THREE.MeshStandardMaterial({ map: ticketTex, roughness: 0.85 })); m.rotation.x = -Math.PI / 2; m.receiveShadow = true; return m; }
function makePen() { const g = grp(); T(g, cyl(0.035, 0.035, 0.9, mat(0x1a2a8a, { roughness: 0.3 }), 0, 0.45, 0, 12)); T(g, cone(0.035, 0.08, mat(0xdddddd, { metalness: 1, roughness: 0.2 }), 0, -0.04, 0, 12)).rotation.x = Math.PI; return g; }
// the phone insert (Day 26): a separate prop phone on the bar (9.9)
const phoneTex = screenTex(320, 640);
function drawWinPhone(k, O) { const g = phoneTex.g, w = 320, h = 640; g.fillStyle = '#0d1220'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.font = '600 22px InterW, Arial'; g.textAlign = 'left'; g.fillText('9:41', 22, 34);
  g.textAlign = 'center'; g.fillStyle = '#e8343c'; rr(g, 30, 70, w - 60, 70, 16); g.fill(); g.fillStyle = '#fff'; g.font = '800 34px InterW, Arial'; g.fillText('LOTTO', w / 2, 118);
  g.fillStyle = '#ffd23a'; g.font = '800 40px InterW, Arial'; g.fillText('JACKPOT!', w / 2, 210); g.fillStyle = '#fff'; g.font = '700 26px InterW, Arial'; g.fillText('YOU WON:', w / 2, 290);
  const v = (0.64 * clamp(k)).toFixed(2); g.font = '800 92px InterW, Arial'; g.fillStyle = '#3dff7a'; g.fillText('£' + v, w / 2, 400); g.globalAlpha = 0.7; g.fillStyle = '#fff'; g.font = '600 20px InterW, Arial'; g.fillText('shared by 31,000,000 winners', w / 2, 450); g.globalAlpha = 1;
  g.fillStyle = '#1f8fe0'; rr(g, 60, 520, w - 120, 64, 32); g.fill(); g.fillStyle = '#fff'; g.font = '700 24px InterW, Arial'; g.fillText('CLAIM PRIZE', w / 2, 560); phoneTex.needsUpdate = true; }
function makeWinPhone() { const g = grp(); g.add(rbox(0.5, 1.0, 0.05, mat(0x15171c, { roughness: 0.3, metalness: 0.5 }))); g.add(screenMesh(0.46, 0.92, phoneTex, { z: 0.028 })); return g; }
// instanced crowd: simple standing people (bodies + heads), per-instance colours; update bobs/turns them
function crowdInst(sc, pts, o = {}) {
  const n = pts.length; const body = new THREE.InstancedMesh(rgeo(0.62, 1.15, 0.4), new THREE.MeshStandardMaterial({ roughness: 0.75 }), n), head = new THREE.InstancedMesh(rgeo(0.46, 0.46, 0.42), new THREE.MeshStandardMaterial({ roughness: 0.55 }), n), legs = new THREE.InstancedMesh(rgeo(0.56, 0.75, 0.34), new THREE.MeshStandardMaterial({ roughness: 0.75 }), n);
  const r = rnd(o.seed || 5), skins = [0xe7b289, 0xd9a67e, 0x8a5a3c, 0xc8946c, 0x6b4128, 0xf0c09a], tops = [0xd7262e, 0x1f4fd6, 0x2bb673, 0xe8a317, 0x9b59d6, 0x333333, 0xf2f2f2, 0x20a0a0, 0xff8c5a, 0x8a6a49], bots = [0x2d3a63, 0x2b2b2b, 0x4b3a2a, 0x3b4a6b, 0x5a5a39];
  const D = pts.map((p, i) => ({ p, s: (o.s || 1) * (0.9 + r() * 0.2), ph: r() * 10, ry: p[3] ?? (o.ry || 0) }));
  D.forEach((d, i) => { body.setColorAt(i, new THREE.Color(tops[Math.floor(r() * tops.length)])); head.setColorAt(i, new THREE.Color(skins[Math.floor(r() * skins.length)])); legs.setColorAt(i, new THREE.Color(bots[Math.floor(r() * bots.length)])); });
  [body, head, legs].forEach(m => { m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; sc.add(m); });
  const mt = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  const upd = (O, f = {}) => { D.forEach((d, i) => { const vis = f.count == null || i < f.count; const s = vis ? d.s : 0.0001; const bob = Math.abs(Math.sin(O * (f.jump ? 9 : 2) + d.ph)) * (f.jump ? 0.35 : 0.03) * s; const ry = d.ry + Math.sin(O * 0.7 + d.ph) * 0.15;
      e.set(0, ry, f.cheer ? Math.sin(O * 7 + d.ph) * 0.08 : 0); q.setFromEuler(e); const x = d.p[0], y = d.p[1] + bob, z = d.p[2];
      mt.compose(V([x, y + 0.38 * s, z]), q, V([s, s, s])); legs.setMatrixAt(i, mt); mt.compose(V([x, y + 1.3 * s, z]), q, V([s, s, s])); body.setMatrixAt(i, mt); mt.compose(V([x, y + 2.15 * s, z]), q, V([s, s, s])); head.setMatrixAt(i, mt); });
    [body, head, legs].forEach(m => { m.instanceMatrix.needsUpdate = true; }); };
  upd(0); return { upd, D };
}
// water spray (Day 7) + generic particle bursts: instanced droplets along paths
function dropsInst(sc, n, col = 0xbfe6ff, r = 0.06) { const m = new THREE.InstancedMesh(new THREE.SphereGeometry(r, 8, 6), new THREE.MeshStandardMaterial({ color: col, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.75, envMapIntensity: 2 }), n); m.frustumCulled = false; m.castShadow = false; sc.add(m);
  const mt = new THREE.Matrix4(), q = new THREE.Quaternion(); return { m, set(i, p, s = 1) { mt.compose(p, q, V([s, s, s])); m.setMatrixAt(i, mt); }, done() { m.instanceMatrix.needsUpdate = true; } }; }
const fireTex = glowTex('rgba(255,250,220,1)', 'rgba(255,140,40,0.75)');
const smokeTex = canvasTex(128, 128, (g) => { const gr = g.createRadialGradient(64, 64, 4, 64, 64, 64); gr.addColorStop(0, 'rgba(90,86,80,0.8)'); gr.addColorStop(1, 'rgba(90,86,80,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); });
function sprite(tex, s, o = {}) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, blending: o.add ? THREE.AdditiveBlending : THREE.NormalBlending, toneMapped: false, opacity: o.op ?? 1 })); sp.scale.setScalar(s); return sp; }
