{ // ---- London: rooftops at dusk / in the storm. His window (0, 6.6, 1.05) on the block at the origin; the chippy to the right; the power station far back left.
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x2a2340); sc.fog = new THREE.Fog(0x2a2340, 30, 95);
  const key = lightRig(sc, { env: 0.35, sky: 0xffb48a, ground: 0x2a2236, hemi: 0.9, keyC: 0xffa070, key: 1.3, keyPos: [18, 14, 12], R: 40, rim: 0.8, rimC: 0x7a8cff, rimPos: [-20, 12, -30] });
  const dome = skyDome('#1c1838', '#7a4a7a', '#ff9a6a', 160); sc.add(dome);
  sc.add(rbox(200, 0.2, 200, mat(0x2a2a30, { roughness: 0.8 }), 0, -0.1, -30));
  const r = rnd(42); const blds = [];
  const winLit = (seed) => { const t = windowsTex(seed, 0.75); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
  const WT = [winLit(1), winLit(2), winLit(3)];
  const PATH = [[0, 0], [-4, -6], [-8, -11], [-12, -17], [-16, -22], [-19, -27]];   // rooftops the domino chain runs over (x, z), all 8 high
  const addB = (x, z, w, d, h, c) => { const m = new THREE.MeshStandardMaterial({ color: c, roughness: 0.85, emissive: 0xffd9a0, emissiveMap: WT[blds.length % 3], emissiveIntensity: 1.0 }); WT.forEach(t => t.repeat.set(Math.max(1, Math.round(w / 2)), Math.max(1, Math.round(h / 3))));
    const b = new THREE.Mesh(rgeo(w, h, d), m); b.position.set(x, h / 2, z); b.castShadow = b.receiveShadow = true; sc.add(b); sc.add(rbox(w + 0.2, 0.3, d + 0.2, mat(0x3a3a44), x, h + 0.15, z)); blds.push({ b, m, x, z, h }); return b; };
  PATH.forEach(([x, z], i) => { if (i) addB(x, z, 4.2, 4.2, 8, [0x8a5a4a, 0x6a6a7a, 0x9a7a5a][i % 3]); });
  for (let i = 0; i < 70; i++) { const x = -40 + r() * 80, z = -70 + r() * 70; if (Math.abs(x) < 4 && Math.abs(z) < 4) continue; if (PATH.some(([px, pz]) => Math.hypot(px - x, pz - z) < 4.5)) continue; if (x < -14 && z < -28) continue; if (Math.hypot(x - 14, z + 8) < 6) continue;
    addB(x, z, 3 + r() * 4, 3 + r() * 4, 5 + r() * 12, [0x8a5a4a, 0x6a6a7a, 0x9a7a5a, 0x5a6a7a, 0x7a4a3a][i % 5]); }
  // his block (front face toward +z) with the window
  const home = addB(0, 0, 5, 2.0, 8, 0xa0715a); const win = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.4), new THREE.MeshBasicMaterial({ color: 0xffd9a0, toneMapped: false })); win.position.set(0, 6.6, 1.02); sc.add(win); sc.add(rbox(1.9, 0.12, 0.3, mat(0xffffff), 0, 5.85, 1.1));
  // chippy (right): shop front with a sign
  const chippy = grp(14, 0, -8, sc); chippy.add(rbox(6, 5, 4, mat(0x2f5b8a), 0, 2.5, 0)); const sign = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 1.1), new THREE.MeshBasicMaterial({ map: canvasTex(512, 128, (g, w, h) => { g.fillStyle = '#ffd21f'; g.fillRect(0, 0, w, h); g.fillStyle = '#d7262e'; g.font = '800 92px Montserrat'; g.textAlign = 'center'; g.fillText('CHIPS', w / 2, 98); }), toneMapped: false })); sign.position.set(0, 4.2, 2.02); chippy.add(sign);
  // power station (far back left) + giant lever on its roof platform + engineer
  const ps = grp(-24, 0, -33, sc); ps.add(rbox(12, 9, 8, mat(0x5a5e66, { roughness: 0.7 }), 0, 4.5, 0)); [-3, 3].forEach(x => ps.add(cyl(1.1, 1.4, 16, mat(0x7a7e86), x, 8, -2, 20))); ps.add(rbox(12.4, 0.4, 8.4, mat(0x3a3a44), 0, 9.2, 0));
  const lever = makeLever(2.2); lever.position.set(2.5, 9.4, 2.6); ps.add(lever); const eng = makeEngineer(); eng.root.position.set(-0.5, 9.4, 2.4); ps.add(eng.root);
  const psLight = new THREE.PointLight(0xbfe3ff, 0, 30, 1.2); psLight.position.set(0, 14, 4); ps.add(psLight);
  // the string web: from his window to rooftops + the chippy (lines), a zipline basket of chips, the domino chain along PATH
  const strings = []; const W0 = V([0.4, 6.7, 1.1]); const webEnds = [[-4, 8.3, -6], [5, 11, -14], [-10, 13, -20], [14, 5.2, -6.2], [8, 9, -4], [-12, 8.3, -17], [20, 12, -24]];
  webEnds.forEach(e => { const l = lineMesh(20, 0xf2f2f2); l.setPts(sag(W0, V(e), 0.6)); sc.add(l); strings.push(l); });
  const zipChips = grp(); zipChips.add(rbox(0.5, 0.35, 0.4, mat(0xd7262e))); zipChips.add(rbox(0.46, 0.18, 0.36, mat(0xf2c14e), 0, 0.25, 0)); zipChips.add(cyl(0.02, 0.02, 0.6, mat(0xdddddd), 0, 0.5, 0, 6)); sc.add(zipChips);
  const roofPts = [V([0, 8.3, 0]), ...PATH.slice(1).map(([x, z]) => V([x, 8.3, z])), V([-21.5, 9.6, -30.4])]; const roofCurve = new THREE.CatmullRomCurve3(roofPts);
  const rdom = [...Array(60)].map((_, i) => { const u = i / 59; const p = roofCurve.getPointAt(u), tg = roofCurve.getTangentAt(u); const d = grp(p.x, p.y, p.z, sc); d.rotation.y = Math.atan2(tg.x, tg.z); d.add(rbox(0.5, 0.9, 0.14, mat(i % 2 ? 0xf5f5f0 : 0x1d1d22, { roughness: 0.3 }), 0, 0.45, 0)); return d; });
  const neighbour = npc(2, { hairStyle: 'long' }); neighbour.legs.forEach(L => L.thigh.visible = false); sc.add(neighbour.root); const nwin = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), new THREE.MeshBasicMaterial({ color: 0xffd9a0, toneMapped: false })); nwin.position.set(-1.6, 3.9, 1.02); sc.add(nwin); sc.add(rbox(1.8, 0.12, 0.3, mat(0xffffff), -1.6, 3.1, 1.1));   // the neighbour's window, one floor below his
  // rain (instanced streaks) for the storm
  const rainM = new THREE.InstancedMesh(new THREE.BoxGeometry(0.02, 0.9, 0.02), new THREE.MeshBasicMaterial({ color: 0xaab8d8, transparent: true, opacity: 0.5 }), 900); rainM.frustumCulled = false; sc.add(rainM); const rainD = [...Array(900)].map(() => [r() * 60 - 30, r() * 30, r() * 60 - 50, 0.6 + r() * 0.4]);
  const mt = new THREE.Matrix4(); const rain = (O, on) => { rainM.visible = on; if (!on) return; rainD.forEach((d, i) => { const y = 30 - ((d[1] + O * 26 * d[3]) % 30); mt.makeTranslation(d[0] + y * 0.08, y, d[2]); rainM.setMatrixAt(i, mt); }); rainM.instanceMatrix.needsUpdate = true; };
  S.city = { sc, key, dome, blds, win, home, strings, zipChips, rdom, roofCurve, lever, eng, ps, psLight, neighbour, nwin, rain, chippy, W0 };
  // power: 1 = everything lit; lightsWave(O, t0) relights from the power station outwards
  S.city.power = (k, O, t0) => { blds.forEach(B => { const d = Math.hypot(B.x + 24, B.z + 33); const on = t0 == null ? k : clamp((O - t0 - d * 0.035) / 0.15); B.m.emissiveIntensity = on; }); win.material.color.setHex(0xffd9a0).multiplyScalar(t0 == null ? Math.max(0.12, k) : 1); nwin.material.color.setHex(0xffd9a0).multiplyScalar(t0 == null ? Math.max(0.12, k) : clamp((O - t0 - 0.8) / 0.15)); };
}
