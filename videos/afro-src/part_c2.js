
// ===== DAY 4 (barbershop): hedge trimmer jams; the barber hands over the keys and leaves =====
const BAR = S.barber;
function barberBase(O) {
  const b = BAR; resetRig(b.hero); b.hero.comb.visible = false; b.chair.position.set(0, 0, 0); b.cape.position.set(0, 1.32, 0.12); b.cape.scale.set(1, 1, 0.85);
  resetRig(b.barber); b.hat.visible = false; b.beam.intensity = 0; b.pole.material.map.offset.y = (O * 0.6) % 1; b.spark.forEach(d => d.m.visible = false);
  b.crack.material.opacity = O > 17.63 ? 1 : 0;   // the pop cracks the mirror, blasts the cape, topples the bottles
  if (O > 17.63) fling(b.cape, V([0, 1.32, 0.12]), O, 17.63, [-2.4, 3.0, -1.6], [3, 1, 4], 0.4);
  b.bottles.forEach((m, i) => fling(m, m.userData.home, O, 17.68 + i * 0.05, [(i % 2 ? 0.5 : -0.5), 1.2, 1.1 + 0.2 * i], [7, 0, 5 + i], 0.15));
  b.smoke.forEach((m, i) => { const t0 = 19.65 + i * 0.12, k = seg(O, t0, t0 + 1.4); m.visible = O > t0 && k < 1; if (!m.visible) return; const tp = wp(b.trimmer); m.position.copy(V([tp.x - 0.4 * k, tp.y + 0.3 + k * 1.6, tp.z - 1.0 * k])); m.scale.setScalar(0.12 + 0.35 * k); m.material.opacity = 0.55 * (1 - k); });
  b.clip.visible = false; b.clipFly.visible = false; b.combOut.visible = false; b.trimmer.visible = O > 18.3 && O < 20.75; b.apron.visible = O < 20.95; b.apronFly.visible = false; b.keys.visible = O > 21.65;
  return b.hero;
}
const d4 = (O) => grow(O, ST[3], 1.0, 1.4);
function trimmerBarber(O) { const b = BAR.barber, run = O > 18.6 && O < 19.6 ? 1 : 0, push = eIO(seg(O, 18.9, 19.5)); hp(b, O, [1.45, 0, 0.95], -0.95, { ...idle(O, 2), spineX: 0.1 * push, headY: 0.15, headX: -0.25,
  arms: [[-1.4 - 0.5 * push, 0, 0.3, 0.6], [-1.6 - 0.7 * push + 0.05 * Math.sin(O * 70) * run, 0, -0.15, 0.4 + 0.05 * Math.sin(O * 61) * run]] }, O < 19.6 ? 'grit' : 'shock', 'barber'); }
function leavingBarber(O) { const b = BAR.barber, off = eIO(seg(O, 20.6, 21.0)), go = seg(O, 21.0, 21.6), walkK = seg(O, 21.85, 24.2);
  if (O < 21.85) { const p = V([1.45, 0, 0.95]).lerp(V([0.8, 0, 0.85]), eIO(go)); const give = eIO(seg(O, 21.3, 21.65)) * (1 - seg(O, 21.65, 21.85));
    hp(b, O, p.toArray(), -1.3, { ...idle(O, 2), headX: -0.1, arms: O < 21.0 ? [[-2.8 * Math.sin(off * Math.PI), 0, 0.3, 0.9], [-2.8 * Math.sin(off * Math.PI), 0, -0.3, 0.9]] : [[0, 0, 0.13, 0.2], [-1.2 * give, 0, -0.1, 0.4]] }, 'calm', 'barber'); }
  else { const p = V([0.8, 0, 0.85]).lerp(V([5.8, 0, 1.4]), walkK); hp(b, O, p.toArray(), Math.PI / 2 - 0.25, { ...walk(O, 6.5, 0.8), headY: -0.55 }, 'calm', 'barber'); }
  if (O > 20.95) fling(BAR.apronFly, V([1.45, 1.55, 1.05]), O, 20.95, [0.3, 0.6, 0.4], [2, 0.5, 1], 0.05); }
shot(17.6, 18.9, 'barber', { p0: [0.7, 0.95, 4.3], p1: [0.5, 0.85, 3.7], l0: [0, 2.7, 0], fov: 46, z0: 1, z1: 1.15 }, (lt, O) => {
  const h = barberBase(O); afro(h, O, d4(O)); hp(h, O, [0, 0, 0.05], 0, popPose(O, ST[3], { ...SIT }), 'shock'); hp(BAR.barber, O, [1.6, 0, 1.2], -1.2, { ...idle(O, 2), arms: [[-0.3, 0, 0.4, 0.6], [-0.4, 0, -0.5, 0.6]] }, 'shock', 'barber'); }, { grade: 'shop', flash: 17.6, shakeAt: [[17.62, 0.06]] });
shot(18.9, 20.6, 'barber', { ease: 'lin', p0: [-1.9, 2.3, 4.7], p1: [-1.4, 2.4, 4.0], l0: [0.7, 2.4, 0.5], fov: 44 }, (lt, O) => {
  const h = barberBase(O); afro(h, O, d4(O)); hp(h, O, [0, 0, 0.05], 0.35, { ...SIT, ...idle(O), bob: 0.07, headY: 0.4 }, O < 19.6 ? 'worried' : 'shock'); trimmerBarber(O);
  burst(BAR.spark, O, 19.6, wp(BAR.trimmer), 1.4, 1.6); }, { grade: 'shop', dof: 0.2, shakeAt: [[19.6, 0.025]] });
shot(20.6, 24.4, 'barber', { ease: 'lin', p0: [0.7, 1.95, 6.3], p1: [0.9, 2.05, 5.2], l0: [0.6, 1.9, 0.2], fov: 46 }, (lt, O) => {
  const h = barberBase(O); afro(h, O, grow(O, ST[4], 1.4, 1.4)); const hand = O > 21.3 ? [-1.0, 0, -0.1, 0.6] : [-0.2, 0, -0.2, 0.4];
  hp(h, O, [0, 0, 0.05], 0.2, popPose(O, ST[4], { ...SIT, ...idle(O), bob: 0.07, headY: O > 21.9 ? 0.5 : 0.3, headX: 0.15, arms: [[-0.2, 0, 0.2, 0.4], hand] }), O < 21.7 ? 'confused' : 'worried'); leavingBarber(O); }, { grade: 'shop' });

// ===== DAY 5 (street): the leaf blower blows HIM away =====
const d5 = (O) => grow(O, ST[4], 1.4, 2.0);
const flyK = (O) => eOut(seg(O, 25.8, 27.6));
function blownHero(O) { const h = STR.hero, k = flyK(O); const x = lerp(0, -16, k), y = Math.sin(k * Math.PI) * 3.2; h.root.position.set(x, y, 0.5 + 0.5 * k); h.root.rotation.set(0, 0.3, 6.283 * 2.2 * k + (O > 27.6 ? 0 : 0)); }
function windOn(O) { STR.wind.forEach((m, i) => { const t0 = 25.6 + (i % 13) * 0.05, k = ((O - t0) * 1.6) % 1; m.visible = O > t0 && O < 26.4; if (!m.visible) return; const tip = STR.blower.localToWorld(V([0, 0, 1.3])); m.position.copy(tip).add(V([Math.sin(i * 2.1) * 0.3, k * 2.2, Math.cos(i * 1.7) * 0.3])); m.rotation.set(0, 0, Math.PI / 2); }); }
function kidIce(O) { const k = STR.kid; resetRig(k); k.root.scale.setScalar(0.62); const hit = O > 26.55; hp(k, O, [-8, 0, 2.4], hit ? 0.9 : 0.4, { ...idle(O, 3), arms: [[0, 0, 0.13, 0.2], [-0.9, 0, -0.2, 1.2]], headY: hit ? -0.6 : 0 }, hit ? 'shock' : 'smile', 'kid');
  STR.scoop.visible = !hit; if (hit) fling(STR.scoopFly, wp(STR.scoop), O, 26.55, [-3.5, 2.0, 0.6], [6, 2, 3]); }
shot(24.4, 25.4, 'street', { p0: [4.8, 1.4, 8.5], p1: [4.3, 1.5, 7.8], l0: [-1.2, 2.6, 0.5], fov: 48 }, (lt, O) => {
  const h = streetBase(O); afro(h, O, d5(O)); hp(h, O, [0, 0, 0.5], 0.3, popPose(O, ST[4]), 'shock'); kidIce(O); }, { grade: 'street', flash: 24.4, shakeAt: [[24.42, 0.06]] });
shot(25.4, 26.0, 'street', { ease: 'lin', p0: [1.6, 2.1, 4.8], p1: [1.3, 2.3, 4.1], l0: [0, 3.0, 0.5], fov: 48 }, (lt, O) => {
  const h = streetBase(O); afro(h, O, d5(O)); STR.blower.visible = true; hp(h, O, [0, 0, 0.5], 0.9, { ...idle(O), spineX: -0.1, headX: -0.2, arms: [[-1.2, 0, 0.3, 0.9], [-1.0, 0, -1.6, 0.15]] }, O < 25.6 ? 'smirk' : 'grit'); windOn(O); }, { grade: 'street' });
shot(26.0, 27.8, 'street', { pf: () => STR.hero.root.position.clone().add(V([4.0, 0.6, 7.0])), lf: () => STR.hero.root.position.clone().add(V([0, 1.6, 0])), fov: 48, live: 0.4 }, (lt, O) => {
  const h = streetBase(O); afro(h, O, d5(O)); STR.blower.visible = true; hp(h, O, [0, 0, 0.5], 0.3, { ...idle(O), arms: [[-2.4, 0, 0.9, 0.3], [-2.4, 0, -0.9, 0.3]], legs: [[0.6 * Math.sin(O * 12), 0.5], [-0.6 * Math.sin(O * 12), 0.5]] }, 'shock'); blownHero(O); kidIce(O); }, { grade: 'street', mblur: 3 });
shot(27.8, 29.8, 'street', { ease: 'lin', pf: (O) => wp(STR.hero.head).add(V([1.0 + 0.2 * seg(O, 27.8, 29.8), 2.1 - 0.4 * seg(O, 27.8, 29.8), 2.6])), lf: () => wp(STR.hero.head).add(V([0, 0.2, 0])), fov: 44 }, (lt, O) => {
  const h = streetBase(O); afro(h, O, grow(O, ST[5], 2.0, 2.0)); const thumb = elastic(seg(O, 28.2, 28.6));
  hp(h, O, [-16, 0, 1.0], 0.2, { ...idle(O), arms: [[0.4, 0, 0.6, 0.3], [-2.2 * thumb, 0, -0.3, 0.9 * thumb]], legs: [[0.4, 0.2], [0.1, 0.6]] }, 'smile'); h.root.rotation.set(-1.15, 0.2, 0.15);
  const c = afroC(h), low = c.y - h.afro.scale.x * 0.85; if (low < 0) h.root.position.y -= low;   // he lands on the afro like a beanbag
  kidIce(O); }, { grade: 'street', dof: 0.25 });

// ===== DAY 6 (city + news): the mower crew mows HELP into it =====
const MK = S.market;
function marketBase(O) { const m = MK; resetRig(m.hero); m.hero.comb.visible = false; m.hero.root.scale.setScalar(4);
  m.traders.forEach((P, i) => { resetRig(P); const r = Math.floor(i / 5), c = i % 5; P.root.position.set(3 + c * 3.0, 0, 0.6 + r * 6.8); P.root.rotation.y = -0.6 + 0.3 * Math.sin(i); pose(P, { ...idle(O, i), headX: -0.4, arms: [[0, 0, 0.13, 0.2], [-1.6 + 0.3 * Math.sin(O * 10 + i), 0, -0.3, 1.2]] }); P.face(O > 32 ? 'laugh' : 'shock', O); });
  m.ladders.forEach(l => l.visible = false); m.climbers.forEach(P => P.root.visible = false); m.mowers.forEach(g => g.visible = false); m.letters.forEach(l => l.visible = false);
  return m.hero; }
function crewOn(O) { const m = MK, ac = afroC(m.hero), R = m.hero.afro.scale.x * 4, top = ac.clone().add(V([0, R * 0.8, 0]));
  m.ladders.forEach((l, i) => { const a = -0.3 + i * 0.75, dir = V([Math.cos(a + 0.6), 0, Math.sin(a + 0.6)]); const base = V([-7, 0, -7]).add(dir.clone().multiplyScalar(R * 0.95 + 2.5)); const tip = ac.clone().add(dir.clone().multiplyScalar(R * 0.8)).add(V([0, R * 0.45, 0]));
    l.visible = O > 30.6; l.position.copy(base); l.quaternion.setFromUnitVectors(V([0, 1, 0]), tip.clone().sub(base).normalize()); l.scale.set(1, base.distanceTo(tip) / 14, 1);
    const P = m.climbers[i], k = eIO(seg(O, 30.8 + i * 0.15, 31.9 + i * 0.15)); P.root.visible = O > 30.6 && k < 1; if (P.root.visible) { resetRig(P); P.root.position.copy(base.clone().lerp(tip, k)).add(dir.clone().multiplyScalar(0.35)); P.root.rotation.y = Math.atan2(-dir.x, -dir.z); pose(P, { arms: [[-2.4 + 0.4 * Math.sin(O * 12 + i), 0, 0.2, 0.3], [-2.4 - 0.4 * Math.sin(O * 12 + i), 0, -0.2, 0.3]], legs: [[0.5 * Math.sin(O * 12 + i), 0.6], [-0.5 * Math.sin(O * 12 + i), 0.6]] }); P.face('grit', O); } });
  m.mowers.forEach((g, i) => { g.visible = O > 31.6; if (!g.visible) return; const a = O * 1.4 + i * 2.1, r = R * (0.25 + 0.15 * i); g.position.copy(top).add(V([Math.cos(a) * r, -0.3, Math.sin(a) * r])); g.rotation.set(0, -a, 0); g.scale.setScalar(1.4); pose(g.rider, { ...idle(O, i), arms: [[-1.2, 0, 0.2, 0.9], [-1.2, 0, -0.2, 0.9]], legs: [[1.4, 1.4], [1.4, 1.4]] }); g.rider.face('smile', O); });
  m.letters.forEach((l, i) => l.visible = O > 32.1 + i * 0.3); }
const d6 = (O) => grow(O, ST[5], 2.0, 2.8);
shot(29.8, 30.8, 'market', { p0: [6, 3.6, 10], p1: [5.4, 3.7, 9], l0: [-7, 9.5, -7], fov: 48 }, (lt, O) => {
  const h = marketBase(O); afro(h, O, d6(O)); hp(h, O, [-7, 0, -7], 0.6, popPose(O, ST[5]), 'shock'); crewOn(O); }, { grade: 'sky', flash: 29.8, shakeAt: [[29.82, 0.05]] });
shot(30.8, 32.0, 'market', { ease: 'lin', p0: [3, 3, 9], p1: [2, 5, 7], l0: [-6, 11, -6], fov: 50 }, (lt, O) => {
  const h = marketBase(O); afro(h, O, d6(O)); hp(h, O, [-7, 0, -7], 0.6, { ...idle(O), headX: -0.35, headY: 0.3 }, 'worried'); crewOn(O); }, { grade: 'sky' });
shot(32.0, 34.0, 'market', { pf: (O) => { const k = eIO(seg(O, 32, 34)); return afroC(MK.hero).add(V([lerp(9, 1.0, k), lerp(4, 50, k), lerp(14, 1.5, k)])); }, lf: () => afroC(MK.hero).add(V([0, 12, 0])), fov: 46 }, (lt, O) => {
  const h = marketBase(O); afro(h, O, d6(O)); hp(h, O, [-7, 0, -7], 0.6, { ...idle(O), headX: -0.3 }, 'worried'); crewOn(O); }, { grade: 'sky' });
shot(34.0, 37.0, 'studio', { ease: 'lin', p0: [0.9, 1.9, 5.4], p1: [0.25, 2.05, 4.0], l0: [0, 2.05, 0], fov: 36 }, (lt, O) => {
  const a = S.studio.anchor; resetRig(a); hp(a, O, [0, 0, 0.1], 0, { ...idle(O, 1), headY: 0.05 * Math.sin(O * 0.8), arms: [[-0.6, 0, 0.25, 1.4], [-0.6, 0, -0.25, 1.4]] }, 'calm', 'anchor'); }, { grade: 'news', lower: true, dof: 0.2 });
shot(37.0, 38.6, 'market', { ease: 'lin', p0: [2.4, 3.0, 8.5], p1: [1.4, 3.4, 6.5], l0: [-7, 8.6, -7], fov: 40 }, (lt, O) => {
  const h = marketBase(O); afro(h, O, grow(O, ST[6], 2.8, 2.8)); hp(h, O, [-7, 0, -7], 0.62, popPose(O, ST[6], { ...idle(O), headX: 0.2, headY: 0.1 }), 'worried'); crewOn(O); }, { grade: 'sky', lower: true });
