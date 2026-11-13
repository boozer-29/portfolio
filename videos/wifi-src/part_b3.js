
// ---------------------------------------------------------------- Revision 2 props: the action beats
{ // flat: rent envelopes, the neighbour's cushion, the router plug cable
  const F_ = S.flat, sc = F_.sc;
  const envT = canvasTex(128, 80, (g) => { g.fillStyle = '#f4efe2'; g.fillRect(0, 0, 128, 80); g.strokeStyle = '#c9c0aa'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 0); g.lineTo(64, 44); g.lineTo(128, 0); g.stroke(); g.fillStyle = '#E21E39'; g.fillRect(96, 10, 22, 26); g.fillStyle = '#222'; g.font = '700 16px Arial'; g.fillText('RENT', 10, 70); });
  const envM = new THREE.MeshStandardMaterial({ map: envT, roughness: 0.8 });
  F_.envs = [...Array(60)].map((_, i) => { const m = new THREE.Mesh(rgeo(0.32, 0.015, 0.2), envM); m.castShadow = m.receiveShadow = true; m.visible = false; sc.add(m); const r2 = rnd(i + 900); m.userData = { a: r2() * 6.283, r: 0.35 + r2() * 0.65, y: 0.02 + Math.floor(i / 6) * 0.03, rot: r2() * 3 }; return m; });
  F_.cushion = rbox(0.5, 0.5, 0.18, mat(0xffd23f, { roughness: 0.9 })); sc.add(F_.cushion);
  F_.plug = grp(0, 0, 0, sc); F_.plug.add(rbox(0.08, 0.05, 0.12, mat(0xf4f4f4, { roughness: 0.4 }))); const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.4, 6), mat(0x111111)); cable.position.y = -0.7; F_.plug.add(cable);
}
{ // classroom: chairs, the teacher's long hair, a phone that slides to her feet
  const C = S.cls;
  C.chairs = C.kids.map((k, i) => { const x = -2.6 + (i % 3) * 2.6, z = -1.4 + Math.floor(i / 3) * 2.0 + 0.62; const g = grp(x, 0, z, C.sc); g.add(rbox(0.55, 0.06, 0.5, mat(0x3a7ae0, { roughness: 0.5 }), 0, 0.5, 0)); g.add(rbox(0.55, 0.55, 0.06, mat(0x3a7ae0, { roughness: 0.5 }), 0, 0.8, 0.25)); [[-0.22, -0.2], [0.22, -0.2], [-0.22, 0.2], [0.22, 0.2]].forEach(([a, b]) => g.add(rbox(0.04, 0.5, 0.04, mat(0x888888), a, 0.25, b))); return g; });
  const hair = mat(0x3a2a1a, { roughness: 0.6 }); C.teacher.head.add(rbox(0.72, 0.7, 0.2, hair, 0, 0.32, -0.3)); C.teacher.head.add(rbox(0.72, 0.16, 0.66, hair, 0, 0.68, -0.02));
  C.slider = phoneMesh(); C.slider.scale.setScalar(0.5); C.slider.rotation.x = -Math.PI / 2; C.slider.visible = false; C.sc.add(C.slider); drawPhone(C.slider.tex, 'onebar', 0);
  C.board = C.sc.children.find(c => c.isMesh && c.material.isMeshBasicMaterial && c.geometry.type === 'PlaneGeometry' && c.geometry.parameters.width === 5); C.board.position.set(-1.2, 1.75, -5.05);
}
{ // street: a bin for the bike crash, headlights converging on his building (Day 23)
  const s = S.street, sc = s.sc;
  s.bin = grp(2.5, 0, 9.3, sc); s.bin.add(cyl(0.35, 0.3, 0.9, mat(0x2b8a4a, { roughness: 0.6 }), 0, 0.45, 0, 14)); s.bin.add(cyl(0.38, 0.38, 0.06, mat(0x1f6a38), 0, 0.92, 0, 14));
  s.trash = debrisPool(sc, 14, [0xd9d0be, 0x8a6a48, 0xe8343c]);
  const carG = rgeo(1.8, 0.7, 0.9); const cars = new THREE.InstancedMesh(carG, new THREE.MeshStandardMaterial({ color: 0x9aa3b0, roughness: 0.4, metalness: 0.5 }), 320); cars.frustumCulled = false; sc.add(cars);
  const lightsG = new THREE.InstancedMesh(new THREE.SphereGeometry(0.16, 6, 4), new THREE.MeshBasicMaterial({ color: 0xfff2c8, toneMapped: false }), 640); lightsG.frustumCulled = false; sc.add(lightsG);
  const r2 = rnd(77); s.carD = [...Array(320)].map((_, i) => ({ lane: i % 4, x0: -280 + r2() * 560, side: r2() < 0.5 ? -1 : 1, sp: 9 + r2() * 6, col: new THREE.Color([0xe8343c, 0x1f8fe0, 0xf4f4f4, 0x2a2a30, 0xffd23f, 0x9aa3b0][Math.floor(r2() * 6)]) }));
  s.carD.forEach((d, i) => cars.setColorAt(i, d.col)); s.cars = cars; s.carLights = lightsG; cars.visible = lightsG.visible = false;
}
{ // Mars: a robot arm on the rover that slams the deck
  const r = S.mars.rover; const arm = grp(-0.9, 0.95, 0.35, r); const m = mat(0xc9ced6, { roughness: 0.4, metalness: 0.5 }); arm.add(rbox(0.9, 0.08, 0.08, m, -0.45, 0, 0)); const fore = grp(-0.9, 0, 0, arm); fore.add(rbox(0.7, 0.07, 0.07, m, -0.35, 0, 0)); fore.add(rbox(0.16, 0.16, 0.16, mat(0x555a60), -0.75, 0, 0)); r.arm = arm; r.fore = fore;
}
