{ // ---- Saturn (Day 36): the ringed giant with a face, the hero floating in front of it
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x020207); sc.environment = ENV; sc.environmentIntensity = 0.12;
  const stars = new THREE.Points(new THREE.BufferGeometry().setFromPoints([...Array(3000)].map((_, i) => { const r2 = rnd(i * 5 + 3); return V([r2() * 2 - 1, r2() * 2 - 1, r2() * 2 - 1]).normalize().multiplyScalar(900); })), new THREE.PointsMaterial({ color: 0xffffff, size: 1.6 * RS, sizeAttenuation: false, toneMapped: false })); sc.add(stars);
  const neb = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex('rgba(120,80,200,0.35)', 'rgba(60,40,140,0.12)'), transparent: true, depthWrite: false, toneMapped: false })); neb.scale.setScalar(700); neb.position.set(-200, 120, -600); sc.add(neb);
  const sun = new THREE.DirectionalLight(0xfff0d8, 3.0); sun.position.set(80, 30, 40); sc.add(sun); sc.add(new THREE.HemisphereLight(0x3a4a7a, 0x000000, 0.25));
  const fill = new THREE.DirectionalLight(0x8aa8ff, 0.7); fill.position.set(-20, 5, 30); sc.add(fill);
  const bandT = canvasTex(64, 1024, (g, w, h) => { const cols = ['#e8d3a8', '#d9b886', '#c99a66', '#efe0bf', '#b8875a', '#e2c79a', '#d4ad7a', '#f0e2c4', '#c4935e']; let y = 0; const r2 = rnd(17); while (y < h) { const bh = 20 + r2() * 70; g.fillStyle = cols[Math.floor(r2() * cols.length)]; g.fillRect(0, y, w, bh); y += bh; } g.fillStyle = 'rgba(255,255,255,0.08)'; for (let i = 0; i < 40; i++) g.fillRect(0, r2() * h, w, 2); });
  const R = 14; const sat = grp(0, 9, -42, sc); const body = new THREE.Mesh(new THREE.SphereGeometry(R, 96, 64), new THREE.MeshStandardMaterial({ map: bandT, roughness: 0.85 })); body.scale.y = 0.92; sat.add(body);
  const atm = new THREE.Mesh(new THREE.SphereGeometry(R * 1.04, 64, 48), ringMat()); atm.material.uniforms.c.value.setHex(0xffd9a0); atm.material.uniforms.a.value = 0.5; atm.scale.y = 0.92; sat.add(atm);
  const face = grp(0, -0.5, 0, sat); const white = mat(0xffffff, { roughness: 0.3 }), blk = mat(0x15110f, { roughness: 0.2 });
  const eyes = [-1, 1].map(s => { const e = grp(s * 3.6, 2.6, R - 1.3, face); const w = ball(2.1, white, 0, 0, 0, undefined, 24); w.scale.z = 0.55; e.add(w); const p = ball(1.0, blk, 0, -0.2, 1.05, undefined, 18); p.scale.z = 0.4; e.add(p); e.p = p; const lid = ball(2.15, mat(0xd9b886, { roughness: 0.8 }), 0, 0, 0, undefined, 24); lid.scale.set(1, 0.05, 0.56); e.add(lid); e.lid = lid; return e; });
  const brows = [-1, 1].map(s => { const b = rbox(3.4, 0.55, 0.6, mat(0x8a5a32), s * 3.6, 5.3, R - 0.9); face.add(b); return b; });
  const mouth = grp(0, -3.0, R - 0.55, face); const mO = ball(1, mat(0x4a1f1a, { roughness: 0.6 }), 0, 0, 0, undefined, 20); mO.scale.set(2.4, 0.5, 0.35); mouth.add(mO); const tongue = ball(0.8, mat(0xc0505a, { roughness: 0.6 }), 0, -0.25, 0.05, undefined, 14); tongue.scale.set(1.6, 0.35, 0.3); mouth.add(tongue);
  const ringT = canvasTex(1024, 1024, (g, w, h) => { const cx = w / 2; const r2 = rnd(23); for (let r = 512; r > 300; r -= 2) { const k = (r - 300) / 212; const a = (k > 0.42 && k < 0.47) ? 0.05 : 0.35 + 0.55 * r2(); const c = [220 - 40 * k, 196 - 50 * k, 160 - 50 * k].map(Math.round); g.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${a})`; g.lineWidth = 2.5; g.beginPath(); g.arc(cx, cx, r, 0, 7); g.stroke(); } });
  const rings = grp(0, 0, 0, sat); const ringM = new THREE.Mesh(new THREE.RingGeometry(R * 1.25, R * 2.25, 160, 1), new THREE.MeshStandardMaterial({ map: ringT, transparent: true, side: THREE.DoubleSide, roughness: 0.8, depthWrite: false, emissive: 0x6a5030, emissiveIntensity: 0.25 }));
  { const uv = ringM.geometry.attributes.uv, pos = ringM.geometry.attributes.position; for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), y = pos.getY(i); uv.setXY(i, 0.5 + x / (R * 4.5), 0.5 + y / (R * 4.5)); } }
  ringM.rotation.x = -Math.PI / 2; ringM.renderOrder = 3; rings.add(ringM); rings.rotation.set(0.32, 0, -0.18);
  const ringSparks = [...Array(10)].map((_, i) => { const s = sparkle(2.5, 0xfff0d0); const a = i / 10 * 6.283; s.position.set(Math.cos(a) * R * 1.9, 0, Math.sin(a) * R * 1.9); rings.add(s); return s; });
  const hero = makeRig({}); sc.add(hero.root); dripKit(hero); const heroKey = new THREE.PointLight(0xffe8c8, 6, 12, 1.4); sc.add(heroKey);
  S.saturn = { sc, sat, body, face, eyes, brows, mouth, mO, tongue, rings, ringSparks, hero, heroKey, R };
}
{ // ---- space extras: the glint on Britain, the astronaut's sunglasses
  const s = S.space; s.wifiIcon.visible = false; s.glint = sparkle(6, 0xfff2c8); s.sc.add(s.glint); s.glintL = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex('rgba(255,240,200,1)', 'rgba(255,200,120,0.3)'), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); s.glintL.scale.setScalar(3); s.sc.add(s.glintL);
  const win = S.issIn.sc.children.find(c => c.isMesh && c.geometry.type === 'CircleGeometry'); S.issIn.win = win; S.issIn.winGlint = sparkle(0.9, 0xfff2c8); win.add(S.issIn.winGlint); S.issIn.winGlint.position.set(-0.05, 0.35, 0.02);
  S.issIn.note.visible = false;
}
