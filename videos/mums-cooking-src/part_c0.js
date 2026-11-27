const cam = new THREE.PerspectiveCamera(40, W / H, 0.05, 1000);
const shots = []; const shot = (t0, t1, scene, camA, setup, fx = {}) => shots.push({ t0, t1, scene, cam: camA, setup, ...fx });
const shake = (O, t0, amt, dur = 0.45) => { const k = clamp(1 - (O - t0) / dur); return O < t0 || k <= 0 ? 0 : amt * k * k; };
function resetRig(P) { P.root.position.set(0, 0, 0); P.root.rotation.set(0, 0, 0); P.root.scale.setScalar(1); P.root.visible = true; if (P.flaps) { P.flaps.forEach(f => f.visible = false); P.boxers.visible = false; } if (P.caps) P.caps.forEach(c => c.visible = false); P.glasses.visible = false; }
function talking(speaker, O) { return DIALOGUE.some(c => c.speaker === speaker && c.kind !== 'shout' && spanHit(c, O)); }
function shouting(speaker, O) { return DIALOGUE.some(c => c.speaker === speaker && c.kind === 'shout' && spanHit(c, O)); }
const wp = (o) => { const v = new THREE.Vector3(); o.updateWorldMatrix(true, false); return o.getWorldPosition(v); };

const POT = V([3.2, 0, -1.9]);
const potScaleAt = (O) => { const v = [1, 1.04, 1.08, 1.12, 1.16, 1.2, 1.24, 1.28, 1.34]; let s = v[0]; STEPS.forEach((st, i) => { if (i > 0) s += (v[i] - v[i - 1]) * elastic(seg(O, st.t, st.t + 0.75)); }); return s; };
const dayAt = (O) => { const s = stepAt(O); return s ? s.day : 0; };
{ // extras: cloud over the compound (Day 5+)
  const Y = S.yard; const g = grp(4, 0, -16, Y.sc); const cm = new THREE.MeshStandardMaterial({ color: 0xff9a3c, roughness: 0.9, emissive: 0xff7a1a, emissiveIntensity: 0.1, transparent: true, opacity: 0.9 }), cm2 = new THREE.MeshStandardMaterial({ color: 0xffd08a, roughness: 0.9, emissive: 0xffa040, emissiveIntensity: 0.08, transparent: true, opacity: 0.9 });
  const cr = rnd(3); for (let i = 0; i < 16; i++) { const a = cr() * 6.28, r = cr() * 7; const b = ball(2.2 + cr() * 2.6, i % 3 ? cm : cm2, Math.cos(a) * r, 14 + cr() * 6, Math.sin(a) * r * 0.7, undefined, 16); b.castShadow = false; g.add(b); } g.visible = false; Y.cloudTop = g;
}
function setCosmos(Y, O, k) {
  Y.dayDome.visible = k < 0.999; Y.cosDome.material.opacity = k; Y.stars.material.opacity = k; Y.cosGlow.intensity = 36 * k;
  const hemi = Y.sc.children.find(c => c.isHemisphereLight), key = Y.sc.children.find(c => c.isDirectionalLight);
  if (hemi) { hemi.color.setHex(0xfff0dc).lerp(new THREE.Color(0xb7a6ff), k); hemi.groundColor.setHex(0xa87850).lerp(new THREE.Color(0x4b3a8a), k); hemi.intensity = lerp(0.5, 0.62, k); }
  if (key) { key.color.setHex(0xffd9a8).lerp(new THREE.Color(0xd8ccff), k); key.intensity = lerp(1.7, 1.5, k); }
  Y.galaxies.forEach((m, i) => { m.material.opacity = k * 0.6; m.visible = k > 0.01; const u = ((O * 0.07 + i / 4) % 1); const a = i * 1.7 + u * 3.2 + O * 0.15; const r = lerp(12, 3.2, Math.pow(u, 1.2)); m.position.set(POT.x + Math.cos(a) * r, lerp(13, 6.5, u) + i * 0.6, POT.z + Math.sin(a) * r * 0.8); m.scale.setScalar(lerp(10, 3.6, u) * (0.9 + 0.1 * Math.sin(O + i)) * k); m.lookAt(cam.position); m.rotateZ(O * 0.6 + i); });
  const mt = new THREE.Matrix4(), q = new THREE.Quaternion(), vs = new THREE.Vector3(), vp = new THREE.Vector3();
  Y.vd.forEach((d, i) => { const u = (O * 0.17 + i / Y.vd.length) % 1; const f = Math.pow(1 - u, 1.4); const r = 0.35 + f * (9 + d.r * 7), a = d.a + u * 8 + O * 1.1, y = POT.y + 2.0 + Math.pow(1 - u, 1.1) * (11 + d.y * 6) * (0.4 + 0.6 * k);
    vp.set(POT.x + Math.cos(a) * r, y, POT.z + Math.sin(a) * r * 0.85); const s = d.s * 0.4 * (0.4 + 1.2 * Math.sin(Math.min(1, u * 5) * Math.PI / 2)) * k * (1 - 0.8 * Math.pow(u, 8)); vs.set(s, s, s); mt.compose(vp, q, vs); Y.vort.setMatrixAt(i, mt); }); Y.vort.instanceMatrix.needsUpdate = true; Y.vort.visible = k > 0.01;
}
function yardBase(O, o = {}) {
  const Y = S.yard; [Y.hero, Y.mum, Y.neigh, Y.king, Y.bearer, ...Y.drummers, ...Y.guards, ...Y.crowd, ...Y.astro].forEach(P => { resetRig(P); P.root.visible = false; if (P.helmet) P.helmet.visible = true; P.glasses.visible = false; });
  Y.umb.visible = false; Y.cap.visible = false; Y.chute.visible = false; Y.rainG.visible = false; Y.ricePile.visible = false; Y.moon.visible = false; Y.pot2.visible = false; Y.deb.forEach(d => d.m.visible = false); Y.crowd.forEach(P => P.umb.visible = false); Y.bearer.umb.visible = false;
  const ps = potScaleAt(O); Y.pot.scale.setScalar(ps); Y.pot.position.copy(POT);
  const lidK = o.lid ?? 1; if (lidK >= 1) { Y.lid.position.set(-1.35, 0.62, 0.3); Y.lid.rotation.set(0, 0, 1.2); } else if (lidK <= 0) { Y.lid.position.set(0, 1.58, 0); Y.lid.rotation.set(0, 0, 0); } else { const k = eOut(lidK); Y.lid.position.set(-1.35 * k, 1.58 + 0.8 * Math.sin(k * Math.PI) - 0.96 * k, 0.3 * k); Y.lid.rotation.set(0, 0, 1.2 * k); }
  if (o.rattle) { Y.lid.position.y += 0.04 * Math.abs(Math.sin(O * 40)); Y.lid.rotation.z += 0.05 * Math.sin(O * 33); }
  const day = dayAt(O); const sk = o.steam ?? (lidK <= 0 ? 0.25 : 0.6 + 0.2 * day); Y.steam.update(O, V([POT.x - 0.05, 1.66 * ps, POT.z]), sk, 3.2 + 0.4 * day, 0.35 + 0.05 * day, 0.28 + 0.03 * day);
  Y.clothes.forEach((c, i) => { c.rotation.z = Math.sin(O * 1.3 + i) * 0.07; });
  Y.cloudTop.visible = day >= 5 && !o.noCloud; if (Y.cloudTop.visible) { const k = eOut(seg(O, 19.2, 20.4)); Y.cloudTop.scale.setScalar(0.2 + 0.8 * k * (1 + 0.04 * Math.sin(O))); }
  Y.gate.rotation.y = 1.1; setCosmos(Y, O, o.cos ?? 0);
}
function mumPose(O, o = {}) { const Y = S.yard, M = Y.mum; M.root.visible = true; M.root.position.set(...(o.pos || [1.55, 0, -2.0])); M.root.rotation.y = o.ry ?? 0.5; const st = Math.sin(O * 3.4), ct = Math.cos(O * 3.4); const tk = talking('mum', O);
  pose(M, { ...idle(O, 1.3), spineX: 0.06 + 0.03 * st, headY: o.headY ?? -0.2, headX: o.headX ?? 0.1, headZ: 0.03 * Math.sin(O * 0.7), bob: -0.01, arms: o.arms || [[-0.15, 0, 0.18, 0.45], [-0.5 + 0.12 * ct, 0, 1.1 + 0.1 * st, 0.6 - 0.1 * ct]] }); M.face(o.expr || 'calm', O, tk); }
function heroPose(O, x, z, ry, p, expr, extra = {}) { const Y = S.yard, h = Y.hero; h.root.visible = true; h.root.position.set(x, extra.y || 0, z); h.root.rotation.y = ry; pose(h, p); h.face(expr, O, talking('hero', O)); }
