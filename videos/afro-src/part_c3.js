
// ===== DAYS 7-9 (space) =====
const SP = S.space, COMB_PT = afroPt(SP.hero, -0.8, 0.4, 0.45, 1.0);
const BEAD_PTS = [[0.85, 0.3, 0.45], [-0.6, 0.55, 0.6], [0.2, 0.75, 0.65], [0.9, 0.55, -0.2], [-0.9, 0.35, 0.2]].map(p => afroPt(SP.hero, ...p, 1.03));
const SAT_POS = V([15, 10, -9]), LAUNCH = V([-3.6, -1.2, 3.4]), DATE_POS = V([34, 0, -4]);   // as far from the camera as he is, so her afro reads twice the size
const seated = (O) => O >= 48.8;
function spaceBase(O, o = {}) {
  const s = SP; resetRig(s.hero); s.hero.comb.visible = false; s.earth.rotation.y = O * 0.05;
  const vk = o.violet ?? 0; s.violet.material.opacity = vk; s.hemi.color.setHex(0xb7c6ff).lerp(new THREE.Color(0xc9b6ff), vk);
  [s.satl, ...s.rocks, ...s.shoot].forEach(m => m.visible = false); s.spDeb.forEach(d => d.m.visible = false);
  // Day 7: rocket carries a giant comb up, it jams, then yanks back out with the Moon stuck in its teeth
  s.rocket.visible = O > 38.85 && O < 44.2; const cp = wp(COMB_PT); const dir = cp.clone().sub(LAUNCH).normalize();
  if (s.rocket.visible) { const up = eIn(seg(O, 38.9, 40.3)), back = eIO(seg(O, 40.9, 41.9)); const jam = V([0, 0, 0]).copy(cp).sub(dir.clone().multiplyScalar(5.2));
    const p = LAUNCH.clone().lerp(jam, up).lerp(jam.clone().sub(dir.clone().multiplyScalar(9)).add(V([0, 3, 0])), back); s.rocket.position.copy(p); s.rocket.quaternion.setFromUnitVectors(V([0, 1, 0]), dir);
    if (O > 40.3 && O < 40.9) s.rocket.position.add(V([Math.sin(O * 70) * 0.05, Math.cos(O * 53) * 0.05, 0])); }
  s.moon.visible = O > 40.9 && O < 44.2; if (s.moon.visible) { s.moon.position.copy(s.bigComb.localToWorld(V([0, -0.36, 0]))); s.moon.rotation.set(0.2, O * 0.4, 0.3); s.moon.scale.setScalar(1.3); }
  // Saturn + rings (Day 8): rings fly over like a frisbee and land as a headband
  s.sat.visible = O > 44.15; s.sat.position.copy(SAT_POS); s.sat.position.y += 0.3 * Math.sin(O * 1.2); s.sat.lookAt(V([4, 8, 9])); s.sat.rotateZ(0.12); s.satO.visible = O > 45.0 && O < 46.6; s.satMouth.visible = !s.satO.visible;
  const ac = afroC(s.hero), Rr = s.hero.afro.scale.x; const rk = eIO(seg(O, 45.0, 46.0)), settle = elastic(seg(O, 45.95, 46.6)); s.rings.visible = O > 44.15;
  const rp = s.sat.position.clone().lerp(ac.clone().add(V([0, Rr * 0.35, 0])), rk); rp.y += Math.sin(rk * Math.PI) * 4; s.rings.position.copy(rp);
  s.rings.scale.setScalar(lerp(4.6, Rr * 1.05, rk) * (O > 45.95 ? 0.92 + 0.08 * settle : 1)); s.rings.rotation.set(-Math.PI / 2 + lerp(0.45, 0.25, rk) + 0.03 * Math.sin(O * 2), 0, lerp(0.3, -0.1, rk) + 6.283 * 3 * rk);
  s.beads.forEach((m, i) => { const t0 = 45.6 + i * 0.16, k = eIn(seg(O, t0, t0 + 0.35)); m.visible = O > t0 - 0.01; if (!m.visible) return; const tg = wp(BEAD_PTS[i]); m.position.copy(V([tg.x * 3, tg.y + 12, tg.z * 3 - 6]).lerp(tg, k)); m.scale.setScalar(Rr * 0.17 * (k >= 1 ? 1 + 0.25 * Math.exp(-(O - t0 - 0.35) * 12) : 1)); });
  // galaxy afro (Day 9)
  const gk = o.gal ?? 0; s.galSkin.material.opacity = gk; s.galaxies.forEach((m, i) => { m.visible = gk > 0.01; m.material.opacity = 0.75 * gk; const u = (O * 0.06 + i / 5) % 1, a = i * 1.26 + O * 0.35; const r = Rr * lerp(1.7, 0.9, u);
    m.position.copy(ac).add(V([Math.cos(a) * r, Math.sin(a * 0.7) * r * 0.5, Math.sin(a) * r])); m.scale.setScalar(Rr * 0.9 * (0.8 + 0.2 * Math.sin(O + i))); m.lookAt(cam.position); m.rotateZ(O * 0.5 + i); });
  s.planets.forEach(p => p.visible = false);
  // the date table + the date arriving on her own planet
  s.table.visible = seated(O); s.chairs.forEach(c => c.visible = seated(O)); s.table.position.set(0, -0.04, 0);
  s.datePlanet.visible = O > 51.0; if (s.datePlanet.visible) { const k = eOut(seg(O, 51.2, 52.6)); s.datePlanet.position.copy(DATE_POS).add(V([0, 80 * (1 - k), 0]));
    const d = s.date; resetRig(d); d.root.rotation.y = Math.atan2(-DATE_POS.x, -DATE_POS.z) + 0.35; d.setAfro(15, O, 0); pose(d, { ...idle(O, 2), headY: 0.1, arms: [[0, 0, 0.3, 0.3], [-0.5 - 0.3 * Math.sin(O * 3) * (talking('date', O) ? 1 : 0), 0, -0.4, 0.9]] }); d.face(O > 53.0 ? 'smile' : 'calm', O, talking('date', O)); }
  return s.hero;
}
function seatHero(h, O, extra = {}) { hp(h, O, [-0.95, 0, 0], Math.PI / 2 - 0.35, { ...idle(O), ...extra, legs: SIT.legs, bob: 0.07 + 0.3 * (extra.bob || 0) }, extra.expr || 'worried'); }   // always seated legs
const d7 = (O) => grow(O, ST[6], 3.0, 4.0), d8 = (O) => grow(O, ST[7], 4.0, 5.5), d9 = (O) => grow(O, ST[8], 5.5, 7.5);
shot(38.6, 40.0, 'space', { pf: (O) => { const a = lerp(0.75, 0.35, seg(O, 38.6, 40.0)); return V([Math.sin(a) * 24, 7, Math.cos(a) * 24]); }, l0: [-1, 3.6, 0], fov: 48 }, (lt, O) => {
  const h = spaceBase(O); afro(h, O, d7(O)); hp(h, O, [0, 0, 0], 0.3, O < 39.2 ? popPose(O, ST[6]) : { ...idle(O), headY: -0.6, headX: -0.15 }, O < 39.2 ? 'shock' : 'worried'); }, { grade: 'space', flash: 38.6, shakeAt: [[38.62, 0.05]], bloom: 0.16 });
shot(40.0, 41.4, 'space', { ease: 'lin', pf: (O) => wp(COMB_PT).add(V([-5.5 + 0.8 * seg(O, 40, 41.4), 2.2, 9.5])), lf: () => wp(COMB_PT).add(V([-2.2, 0, 0])), fov: 46 }, (lt, O) => {
  const h = spaceBase(O); afro(h, O, d7(O)); hp(h, O, [0, 0, 0], 0.3, { ...idle(O), headY: -0.7, headX: -0.2, spineZ: O > 40.9 && O < 41.2 ? 0.15 : 0 }, O < 40.9 ? 'worried' : 'shock'); }, { grade: 'space', shakeAt: [[40.3, 0.03], [40.9, 0.04]], bloom: 0.16 });
shot(41.4, 44.2, 'capsule', { ease: 'lin', p0: [0.5, 1.95, 3.7], p1: [0.3, 2.05, 2.9], l0: [0.2, 2.2, -1.6], fov: 40 }, (lt, O) => {
  const a = S.capsule.astro; resetRig(a); a.helmet.visible = true; hp(a, O, [-0.45, 0, -1.7], 0.15, { ...idle(O, 4), headY: 0.45 + 0.05 * Math.sin(O * 0.7), arms: [[-0.3, 0, 0.3, 0.8], [-1.4, 0, -0.2, 1.6]] }, 'calm', 'astronaut'); }, { grade: 'news', dof: 0.2 });
shot(44.2, 45.4, 'space', { p0: [3.2, 1.0, 14.5], p1: [3.8, 1.6, 17.5], l0: [3, 5.6, -2], fov: 50 }, (lt, O) => {
  const h = spaceBase(O, { violet: eOut(seg(O, 44.2, 44.8)) }); afro(h, O, d8(O)); hp(h, O, [0, 0, 0], 0.2, popPose(O, ST[7]), 'shock'); }, { grade: 'cosmic', flash: 44.2, shakeAt: [[44.22, 0.05]], bloom: 0.18 });
shot(45.4, 46.6, 'space', { ease: 'lin', pf: (O) => { const a = lerp(0.25, 0.6, seg(O, 45.4, 46.6)); return V([Math.sin(a) * 19, 5, Math.cos(a) * 19]); }, l0: [0, 6.5, 0], fov: 50 }, (lt, O) => {
  const h = spaceBase(O, { violet: 1 }); afro(h, O, d8(O)); hp(h, O, [0, 0, 0], 0.4, { ...idle(O), headX: -0.3, headY: 0.4 }, 'confused'); }, { grade: 'cosmic', bloom: 0.18 });
shot(46.6, 48.8, 'space', { ease: 'lin', p0: [1.8, 1.3, 8.6], p1: [0.6, 1.75, 6.3], l0: [0, 3.2, 0], fov: 46 }, (lt, O) => {
  const h = spaceBase(O, { violet: 1 }); afro(h, O, d8(O)); const pz = eOut(seg(O, 46.55, 46.9));
  hp(h, O, [0, 0, 0], 0.1, { ...idle(O), hipZ: 0.08 * pz, spineZ: -0.06 * pz, headX: -0.12 * pz, headZ: 0.1 * pz, arms: [[lerp(0.05, -0.2, pz), 0, lerp(0.14, 0.95, pz), lerp(0.2, 1.7, pz)], [lerp(0.05, -0.2, pz), 0, lerp(-0.14, -0.95, pz), lerp(0.2, 1.7, pz)]] }, pz > 0.5 ? 'smirk' : 'calm'); }, { grade: 'cosmic', bloom: 0.18 });
// silence: candle-lit table for two on top of the Earth; he checks his watch
shot(48.8, 49.6, 'space', { p0: [2.2, 1.45, 1.7], p1: [1.6, 1.55, 1.25], l0: [-0.95, 2.1, 0], fov: 40, live: 0.6, ease: 'lin' }, (lt, O) => {
  const h = spaceBase(O, { violet: 1 }); afro(h, O, grow(O, ST[8], 5.5, 5.5)); seatHero(h, O, { headX: 0.5, arms: [[-0.6, 0.6, 0.35, 1.3], [-0.4, 0, -0.2, 0.9]] }); }, { grade: 'cosmic', dof: 0.35, bloom: 0.18 });
// Day 9: the afro becomes a galaxy, then something bigger eclipses everything
shot(49.6, 51.2, 'space', { p0: [1.4, 2.2, 3.6], p1: [3, 9, 34], l0: [-0.9, 3, 0], l1: [0, 8, 0], fov: 46, ease: 'out' }, (lt, O) => {
  const h = spaceBase(O, { violet: 1, gal: eOut(seg(O, 49.7, 50.4)) }); afro(h, O, d9(O)); seatHero(h, O, { ...popPose(O, ST[8], SIT), expr: 'shock' }); }, { grade: 'cosmic', flash: 49.6, shakeAt: [[49.62, 0.06]], bloom: 0.24 });
shot(51.2, 52.8, 'space', { ease: 'lin', p0: [4, 2.4, 22], p1: [5, 2.8, 24], l0: [22, 16, -4], fov: 54, dark: (O) => 0.5 * eIO(seg(O, 51.3, 52.3)) * (1 - seg(O, 52.4, 52.8)) }, (lt, O) => {
  const h = spaceBase(O, { violet: 1, gal: 1 }); afro(h, O, d9(O)); seatHero(h, O, { headY: -0.3, headX: -0.3, expr: 'confused' }); }, { grade: 'cosmic', bloom: 0.24 });
shot(52.8, 55.0, 'space', { ease: 'lin', pf: (O) => { const d = SP.date.root, f = V([Math.sin(d.rotation.y), 0, Math.cos(d.rotation.y)]); const k = seg(O, 52.8, 55); return wp(d).add(f.multiplyScalar(5.4 - 1.6 * k)).add(V([0.4 + 1.0 * k, 2.1 + 0.4 * k, 0])); }, lf: () => wp(SP.date.head).add(V([0, 0.3, 0])), fov: 40 }, (lt, O) => {
  const h = spaceBase(O, { violet: 1, gal: 1 }); afro(h, O, d9(O)); seatHero(h, O, { expr: 'shock' }); }, { grade: 'cosmic', dof: 0.3, bloom: 0.2 });
shot(55.0, 56.4, 'space', { ease: 'lin', p0: [1.3, 2.1, 0.75], p1: [1.0, 2.15, 0.6], l0: [-0.95, 2.25, 0], fov: 40 }, (lt, O) => {
  const h = spaceBase(O, { violet: 1, gal: 1 }); afro(h, O, d9(O)); const k = seg(O, 55.35, 55.55); seatHero(h, O, { headX: -0.1 * k, arms: [[-0.4 - 0.6 * k, 0, 0.5 * k + 0.13, 0.6], [-0.4 - 0.6 * k, 0, -0.5 * k - 0.13, 0.6]], expr: 'shock' }); }, { grade: 'cosmic', dof: 0.35, bloom: 0.2 });
shot(56.4, 58.0, 'space', { ease: 'out', p0: [12, 6, 34], p1: [17, 9, 100], l0: [14, 7, -2], l1: [20, 12, -2], fov: 50 }, (lt, O) => {
  const h = spaceBase(O, { violet: 1, gal: 1 }); afro(h, O, d9(O)); seatHero(h, O, { expr: 'shock' }); }, { grade: 'cosmic', bloom: 0.22 });
