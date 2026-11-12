
// ===== Day 17: the ISS connects; inside, an astronaut asks for the password =====
const SPC = S.space, ISSDIR = V([-0.55, 0.62, -0.56]).normalize(), HOMEPT = ISSDIR.clone().multiplyScalar(30);
function spaceBase(O) { const s = SPC; s.earth.rotation.y = 0.4 + O * 0.004; s.clouds.rotation.y = 0.4 + O * 0.006; s.ring.visible = false; s.iss.position.copy(ISSDIR.clone().multiplyScalar(32.2)); s.iss.lookAt(0, 0, 0); s.iss.rotateZ(O * 0.05);
  s.sats.forEach((g, i) => { const a = i * 0.63 + O * 0.01, b = (i % 3 - 1) * 0.5; g.position.set(Math.cos(a) * 125 * Math.cos(b), Math.sin(b) * 125, Math.sin(a) * 125 * Math.cos(b)); g.rotation.set(O * 0.2 + i, i, 0); g.gl.scale.setScalar(2.5); }); }
const ISS_TG = V([1, 0, 0]).cross(ISSDIR).normalize();
shot(tS(17), tS(17) + 2.7, 'space', { ease: 'lin', pf: (O) => SPC.iss.position.clone().add(ISSDIR.clone().multiplyScalar(2.2)).add(ISS_TG.clone().multiplyScalar(9 - 1.5 * seg(O, tS(17), tS(17) + 2.7))), lf: () => SPC.iss.position.clone().add(ISS_TG.clone().multiplyScalar(-10)).add(ISSDIR.clone().multiplyScalar(-1.5)), fov: 50 }, (lt, O) => {
  spaceBase(O); ringAt(SPC.ring, O, tS(17) + 0.3, HOMEPT, 9, 1.8, 0.5); }, { grade: 'space', bloom: 0.22 });
shot(tS(17) + 2.7, tE(17), 'issIn', { ease: 'lin', p0: [0.7, 1.85, 1.7], p1: [0.45, 1.9, 1.0], l0: [-0.3, 1.95, -3.3], fov: 44 }, (lt, O) => { const a = S.issIn.astro; resetRig(a); const fl = Math.sin(O * 1.3) * 0.08;
  hp(a, O, [0.75, 0.35 + fl, -2.2], 0.15, { ...idle(O, 3), spineZ: 0.1, legs: [[0.3, 0.4], [-0.1, 0.3]], arms: [[-1.3, 0, 1.1, 0.1], [-0.4, 0, -0.5, 0.9]], headY: -0.4, headX: -0.05 }, 'confused', 'astro'); a.root.rotation.z = 0.12 * Math.sin(O * 0.9); }, { grade: 'iss', dof: 0.25 });

// ===== Day 20: the provider calls; he declines; the voicemail plays =====
const T20 = tS(20);
shot(T20, T20 + 2.5, 'flat', deskCam(1.6, 1.3, T20, T20 + 2.5), (lt, O) => { const h = flatBase(O, { dphone: O < T20 + 2.25 ? 'call' : 'voicemail', buzz: O < T20 + 2.25 }); hp(h, O, [0.8, 0, -1.4], Math.PI, { ...idle(O), ...SIT }, 'calm'); }, { grade: 'night', dof: 0.7 });
shot(T20 + 2.5, tE(20), 'flat', { ease: 'lin', p0: [1.8, 1.8, 1.4], p1: [1.7, 1.9, 0.9], l0: [0.8, 1.85, -1.4], fov: 54 }, (lt, O) => {
  const h = flatBase(O, { dphone: 'voicemail' }); F.phone.visible = false; hp(h, O, [0.8, 0, -1.4], 0.44, { ...idle(O), ...SIT, headX: 0.12, headY: 0.25, arms: [[-0.9, 0, 0.3, 1.5], [-0.6, 0, -0.4, 1.2]] }, 'smirk'); }, { grade: 'night', dof: 0.3 });

// ===== Day 23: past the GPS satellites; every sat-nav says "turn left at his house" =====
shot(tS(23), tS(23) + 3.1, 'car', { ease: 'lin', p0: [0.42, 1.62, 0.75], p1: [0.38, 1.56, 0.5], l0: [0.35, 1.36, -0.12], fov: 44 }, (lt, O) => { const c = S.car; c.bok.forEach((b, i) => { b.position.z = -8 - ((O * (2 + i % 3) + i * 3) % 22); });
  pose(c.driver, { ...idle(O, 4), ...SIT, arms: [[-1.2, 0, 0.3, 0.6], [-1.2, 0, -0.3, 0.6]] }); c.driver.face('confused', O); }, { grade: 'car', dof: 0.15 });
shot(tS(23) + 3.1, tE(23), 'space', { ease: 'lin', p0: [20, 45, 230], p1: [35, 55, 205], l0: [0, 0, 0], fov: 44 }, (lt, O) => { spaceBase(O); const r = ringAt(SPC.ring, O, tS(23) + 3.15, V([0, 0, 0]), 200, 2.0, 31);
  SPC.sats.forEach(g => { const hit = Math.abs(g.position.length() - r) < 12; g.gl.scale.setScalar(hit ? 9 : 2.5); }); }, { grade: 'space', bloom: 0.25 });

// ===== Day 27: the Moon has full bars (long shout, hard cut) =====
shot(tS(27), tE(27), 'space', { ease: 'lin', p0: [3, 2, -364], p1: [1.5, 1, -374], l0: [0, 0, -392], fov: 42 }, (lt, O) => { spaceBase(O); const k = seg(O, tS(27) + 0.5, tS(27) + 1.6); SPC.wifiIcon.material.opacity = 0.25 + 0.75 * eOut(k) * (0.85 + 0.15 * Math.sin(O * 6)); SPC.moon.rotation.set(0, 0, 0.05 * Math.sin(O * 0.5)); }, { grade: 'space', bloom: 0.3 });

// ===== Day 36: Mars — ping 25 minutes =====
shot(tS(36), tE(36), 'mars', { ease: 'lin', pf: (O) => S.mars.rover.position.clone().add(V([3.2 - 0.6 * seg(O, tS(36), tE(36)), 0.15, 3.4])), lf: () => S.mars.rover.position.clone().add(V([0.3, 1.5, 0.2])), fov: 42 }, (lt, O) => { const m = S.mars, k = seg(O, tS(36), tE(36));
  m.rover.position.set(lerp(-2.5, 1.0, k), -0.2 + 0.03 * Math.sin(O * 9), 0); m.rover.head.rotation.y = 0.5 + 0.2 * Math.sin(O * 0.8); const g = m.rover.scrT.g; g.fillStyle = '#0a1020'; g.fillRect(0, 0, 160, 120); spinner(g, 80, 50, 26, O); g.fillStyle = '#fff'; g.font = '700 16px InterW, Arial'; g.textAlign = 'center'; g.fillText('PING 25 MIN', 80, 108); m.rover.scrT.needsUpdate = true;
  m.dust.forEach((d, i) => { const a = O * 2.4 + i * 0.7, h = (i / 90) * 9, r = 0.6 + h * 0.35; d.position.set(-11 + Math.cos(a) * r, -0.8 + h, -16 + Math.sin(a) * r); d.scale.setScalar(1.2 + h * 0.3); }); }, { grade: 'mars', dof: 0.25 });

// ===== Day 43: overtaking Voyager 1 =====
shot(tS(43), tE(43), 'deep', { ease: 'lin', p0: [7, 2.5, 11], p1: [5, 3, 8], l0: [0, 0, 0], fov: 44 }, (lt, O) => { const d = S.deep; d.web.visible = false; d.andro.visible = false; d.voy.rotation.set(0.2, O * 0.05, 0.1); ringAt(d.ring, O, tS(43) + 0.6, d.sunDot.position, 140, 2.4, 70); }, { grade: 'deep', bloom: 0.25 });

// ===== Day 53: the nearest star system — an alien is watching your Netflix too =====
shot(tS(53), tS(53) + 2.6, 'alien', { ease: 'lin', p0: [2.6, 2.0, 5.2], p1: [2.2, 2.05, 4.4], l0: [-0.6, 1.4, -0.2], fov: 48 }, (lt, O) => { drawTV(S.alien.tvT, O, true); S.alien.blob.scale.set(1 + 0.03 * Math.sin(O * 3), 1 - 0.03 * Math.sin(O * 3), 1); }, { grade: 'alien', bloom: 0.2 });
shot(tS(53) + 2.6, tE(53), 'alien', { ease: 'lin', p0: [-2.5, 1.6, -0.75], p1: [-2.25, 1.62, -0.4], l0: [1.9, 1.5, 2.4], fov: 40 }, (lt, O) => { drawTV(S.alien.tvT, O, true); S.alien.blob.scale.set(1 + 0.03 * Math.sin(O * 3), 1 - 0.03 * Math.sin(O * 3), 1); }, { grade: 'alien', dof: 0.3, bloom: 0.2 });

// ===== Day 72: Andromeda — left on read =====
shot(tS(72), tS(72) + 3.1, 'deep', { ease: 'lin', p0: [0, -8, -215], p1: [0, 3, -238], l0: [0, 0, -300], fov: 50 }, (lt, O) => { const d = S.deep; d.web.visible = false; d.andro.visible = true; d.andro.rotation.z = 0.5 + O * 0.02; }, { grade: 'deep', bloom: 0.3 });
shot(tS(72) + 3.1, tE(72), 'flat', deskCam(1.45, 1.15, tS(72) + 3.1, tE(72)), (lt, O) => { const h = flatBase(O, { dphone: 'chat' }); hp(h, O, [0.8, 0, -1.4], Math.PI, { ...idle(O), ...SIT }, 'calm'); }, { grade: 'night', dof: 0.7 });

// ===== Day 87: everything — crash pull-back through the cosmic web =====
shot(tS(87), tE(87), 'deep', { ease: 'out', p0: [0, 0, -1450], p1: [120, 380, 1500], l0: [0, 0, -1600], fov: 50 }, (lt, O) => { const d = S.deep; d.web.visible = true; d.andro.visible = false; ringAt(d.ring, O, tS(87) + 0.1, V([0, 0, -1600]), 2600, 2.6, 30); }, { grade: 'deep', bloom: 0.35 });

// ===== END: still one bar in the bathroom (same framing as Day 1: the loop) =====
shot(tS('END'), DUR, 'flat', { ease: 'lin', p0: [4.35, 1.75, 1.6], p1: [4.2, 1.65, 1.0], l0: [3.2, 1.25, -1.95], fov: 44 }, (lt, O) => { flatBase(O, { flicker: true }); onToilet(O, O < tS('END') + 2.0 ? 1 : 0.2); }, { grade: 'bath' });
