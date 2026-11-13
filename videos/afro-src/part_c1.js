
// ===== v2 script. TITLE + DAY 1 + DAY 2 (bedroom) =====
const RM = S.room;
function roomBase(O) { const R = RM; resetRig(R.hero); R.hero.comb.visible = O < 6.2; R.brush.visible = O >= 6.9 && O < 7.75;
  R.flyers.forEach((m, i) => fling(m, R.flyHome[i], O, 6.22 + i * 0.03, [[1.2, 2.6, 0.9], [1.6, 3.0, 0.5], [0.9, 2.2, 1.3]][i], [[6, 2, 4], [5, 3, 7], [3, 4, 2]][i]));   // Day 2 shockwave
  R.combFly.visible = false; R.sockM.visible = false; R.remoteM.visible = false; R.burp.forEach(d => d.m.visible = false);
  const hk = eOut(seg(O, 0.55, 1.35)); R.heart.scale.set(Math.max(0.001, hk), Math.max(0.001, hk), 1); R.heart.visible = hk > 0.01; return R.hero; }
const d2 = (O) => grow(O, ST[1], 0.5, 0.75);
const burpSq = (O) => { const k = seg(O, 9.1, 9.6); return k > 0 && k < 1 ? -1.1 * Math.sin(k * Math.PI) * (1 - k) : 0; };   // the afro burps
function wink(P, O, t0, t1) { if (O < t0 || O > t1) return; P.lids[1].scale.y = 1; P.lids[1].position.y = 0.37; }
// title: he circles SATURDAY on the calendar
shot(0, 1.6, 'room', { p0: [3.0, 2.4, 5.0], p1: [2.3, 2.45, 3.6], l0: [0.6, 2.4, -2.4], fov: 40, ease: 'io' }, (lt, O) => {
  const h = roomBase(O); afro(h, O, { R: 0.5, sq: 0 }); const dr = Math.sin(O * 7) * 0.12 * seg(O, 0.5, 0.7) * (1 - seg(O, 1.3, 1.45));
  hp(h, O, [0.05, 0, -2.2], Math.PI - 0.75, { ...idle(O), headY: 0.95, arms: [[-1.75 + dr, 0, 0.55 + dr, 0.35], [0.05, 0, -0.14, 0.2]] }, 'smirk'); }, { grade: 'dawn', dof: 0.2 });
shot(1.6, 3.0, 'room', { p0: [-0.9, 2.0, 4.2], p1: [-0.7, 2.05, 3.5], l0: [0, 2.35, 0.6], fov: 40 }, (lt, O) => {
  const h = roomBase(O); afro(h, O, { R: 0.5, sq: 0 }); hp(h, O, [0, 0, 0.6], -0.2, { ...idle(O), headZ: 0.06 * Math.sin(O * 6), arms: [[0.05, 0, 0.14, 0.2], combArm(O, 6)] }, 'smirk'); }, { grade: 'warm', dof: 0.3 });
// Day 1: "Date. On Saturday... Easy." + wink
shot(3.0, 4.6, 'room', { p0: [0.4, 2.0, 4.7], p1: [0.25, 2.1, 4.0], l0: [0, 2.3, 0.6], fov: 40, flash: 3.0 }, (lt, O) => {
  const h = roomBase(O); afro(h, O, { R: 0.5, sq: 0 }); hp(h, O, [0, 0, 0.6], -0.1, { ...idle(O), spineX: -0.05, headZ: 0.06, arms: [[0.05, 0, 0.14, 0.2], [-0.55 + 0.1 * Math.sin(O * 4), 0, -0.95, 0.5]] }, 'smirk'); }, { grade: 'warm', dof: 0.25 });
shot(4.6, 6.2, 'room', { p0: [0.6, 2.25, 3.7], p1: [0.5, 2.28, 3.2], l0: [0, 2.4, 0.6], fov: 38 }, (lt, O) => {
  const h = roomBase(O); afro(h, O, d2(O)); hp(h, O, [0, 0, 0.6], -0.15, popPose(O, ST[1], { ...idle(O), headZ: 0.08, headY: 0.15 }), 'smirk'); wink(h, O, 5.35, 5.75); }, { grade: 'warm', dof: 0.35 });
// Day 2: pop, the hairbrush gets eaten, the hand comes back, the afro burps
shot(6.2, 6.8, 'room', { p0: [0.5, 2.3, 3.8], p1: [0.35, 2.35, 3.1], l0: [0, 2.45, 0.6], fov: 40, z0: 1.0, z1: 1.25, roll0: -3, roll1: 4, ease: 'lin' }, (lt, O) => {
  const h = roomBase(O); afro(h, O, d2(O)); hp(h, O, [0, 0, 0.6], -0.1, popPose(O, ST[1]), 'shock'); }, { grade: 'warm', flash: 6.2, shakeAt: [[6.22, 0.07]] });
function brushArm(O) { const up = eIO(seg(O, 6.9, 7.3)), in_ = seg(O, 7.6, 8.6), out = elastic(seg(O, 8.6, 9.1)), w = Math.sin(O * 13) * 0.12 * in_ * (O < 8.6 ? 1 : 0);
  if (O < 7.6) return [lerp(0.05, -3.0, up), 0, lerp(-0.14, -0.3, up), lerp(0.2, 1.3, up)];
  if (O < 8.6) return [-3.1 + w, 0, -0.1 + w, 0.1]; return [lerp(-3.1, 0.05, out), 0, lerp(-0.1, -0.25, out), 0.2]; }
function brushPose(O, base = {}) { const pull = O >= 7.6 && O < 8.6 ? 1 : 0; return { ...idle(O), ...base, bob: (base.bob || 0) + 0.12 * pull + 0.03 * Math.sin(O * 13) * pull, spineZ: 0.1 * Math.sin(O * 9) * pull, spineX: O > 8.6 && O < 9.1 ? -0.2 * (1 - seg(O, 8.6, 9.1)) : 0,
  headX: (base.headX || 0) + (O > 9.2 ? -0.32 : -0.15), arms: [[0.05, 0, 0.3 + 0.3 * pull, 0.2], brushArm(O)], legs: pull ? [[0, 0.15], [0, 0.15]] : [[0, 0], [0, 0]] }; }
const burpFx = (h, O) => { if (O > 9.15) burst(RM.burp, O, 9.2, afroC(h).add(V([0, 0.5, 0.4])), 1.4, 1.6); };
shot(6.8, 8.0, 'room', { ease: 'lin', p0: [0.2, 2.45, 6.8], p1: [0.8, 2.75, 5.3], l0: [-0.2, 1.9, -0.6], fov: 50 }, (lt, O) => {
  const h = roomBase(O); afro(h, O, d2(O)); hp(h, O, [0, 0, 0.6], 0.05, brushPose(O), O < 7.6 ? 'smirk' : 'grit'); }, { grade: 'warm' });
shot(8.0, 9.6, 'room', { ease: 'lin', p0: [0.9, 2.4, 4.4], p1: [0.6, 2.5, 3.7], l0: [0, 2.7, 0.6], fov: 42 }, (lt, O) => {
  const h = roomBase(O); const g = d2(O); h.setAfro(g.R, O, burpSq(O)); hp(h, O, [0, 0, 0.6], 0.1, brushPose(O), O < 8.6 ? 'grit' : O < 9.15 ? 'shock' : 'confused'); burpFx(h, O); }, { grade: 'warm', dof: 0.25 });
shot(9.6, 12.0, 'room', { ease: 'lin', p0: [0.4, 1.95, 5.0], p1: [0.3, 2.0, 4.2], l0: [0, 2.0, 0.6], fov: 42 }, (lt, O) => {
  const h = roomBase(O); afro(h, O, grow(O, ST[2], 0.75, 0.75)); hp(h, O, [0, 0, 0.6], 0.05, popPose(O, ST[2], { ...idle(O), headX: -0.3, headZ: -0.06, arms: [[0.05, 0, 0.14, 0.2], [-0.4, 0, -0.5, 1.2]] }), 'confused'); burpFx(h, O); }, { grade: 'warm', dof: 0.3 });

// ===== DAY 3 (front yard): the rake pulls out a bird's nest =====
const STR = S.street, NEST_PT = afroPt(STR.hero, 0.55, 0.75, 0.55, 0.9);
function streetBase(O) {
  const s = STR; resetRig(s.hero); [s.hero.comb, s.rake, s.blower, s.line, s.ballF, s.slipper, s.twig, s.string, s.nest, s.scoopFly].forEach(m => m.visible = false); s.kid.root.visible = false;
  s.birds.forEach(b => b.visible = false); s.kites.forEach(k => k.visible = false); s.wind.forEach(m => m.visible = false);
  s.people.forEach((P, i) => { resetRig(P); const x = ((O * 0.9 * (i % 2 ? 1 : -1) + i * 9) % 40 + 40) % 40 - 20; P.root.position.set(x, 0, -4.6 - (i % 2) * 1.2); P.root.rotation.y = i % 2 ? Math.PI / 2 : -Math.PI / 2; pose(P, walk(O + i, 7, 0.8)); P.face('calm', O); });
  return s.hero;
}
const d3 = (O) => grow(O, ST[2], 0.75, 1.0);
function rakeArm(O) { const up = eIO(seg(O, 12.9, 13.5)), pull = eIO(seg(O, 13.7, 14.5)), w = Math.sin(O * 14) * 0.1 * seg(O, 13.5, 13.7) * (1 - pull);
  return [lerp(lerp(-0.4, -2.7, up), -1.35, pull) + w, 0, lerp(-0.2, -0.85, pull), lerp(0.3, 0.25, up)]; }
function nestOn(O) { const s = STR; if (O < 13.7) return; s.nest.visible = true; const head = s.rake.localToWorld(V([0, -1.85, 0.12])); const k = seg(O, 13.7, 14.5);
  s.nest.position.copy(wp(NEST_PT).lerp(head.add(V([0, 0.2, 0])), eIO(k))); s.nest.rotation.set(0.15 * Math.sin(O * 3), 0.6, 0); s.nest.scale.setScalar(1.2);
  const b = s.birds[0]; b.visible = O > 14.75; if (b.visible) { const up = elastic(seg(O, 14.75, 15.1)); b.position.copy(s.nest.position).add(V([0, -0.15 + 0.35 * up, 0.05])); b.rotation.set(0, 0.35, 0); b.scale.setScalar(1.5); birdAnim(b, O, 0, talking('bird', O), false);
    b.userData.wings.forEach((wg, i) => wg.rotation.z = (i ? 1 : -1) * (0.9 + 0.1 * Math.sin(O * 5))); } }
shot(12.0, 13.2, 'street', { p0: [0, 2.4, 5.4], p1: [0.6, 2.9, 8.6], l0: [0, 2.6, 0], l1: [0, 3.0, 0], fov: 42 }, (lt, O) => {
  const h = streetBase(O); afro(h, O, d3(O)); STR.rake.visible = O > 12.5; hp(h, O, [0, 0, 0.5], 0, O < 12.5 ? popPose(O, ST[2]) : { ...idle(O), arms: [[0.05, 0, 0.14, 0.2], rakeArm(O)] }, O < 12.6 ? 'shock' : 'grit'); }, { grade: 'street', flash: 12.0, shakeAt: [[12.02, 0.06]] });
shot(13.2, 14.8, 'street', { p0: [4.8, 2.4, 4.8], p1: [4.3, 2.5, 4.3], l0: [0.6, 2.6, 0.6], fov: 46, ease: 'lin' }, (lt, O) => {
  const h = streetBase(O); afro(h, O, d3(O)); STR.rake.visible = true; hp(h, O, [0, 0, 0.5], 0.45, { ...idle(O), spineX: -0.1 * seg(O, 13.7, 14.4), arms: [[-0.5, 0, 0.2, 0.9], rakeArm(O)] }, O < 14.4 ? 'grit' : 'shock'); nestOn(O); }, { grade: 'street', dof: 0.2 });
shot(14.8, 17.6, 'street', { pf: () => STR.nest.position.clone().add(V([1.9, 0.4, 3.0])), lf: () => STR.nest.position.clone().lerp(wp(STR.hero.head), 0.45).add(V([0, 0.3, 0])), fov: 40, ease: 'lin', z0: 1, z1: 1.08 }, (lt, O) => {
  const h = streetBase(O); afro(h, O, grow(O, ST[3], 1.0, 1.0)); STR.rake.visible = true; hp(h, O, [0, 0, 0.5], 0.45, { ...idle(O), headY: 0.35, arms: [[-0.5, 0, 0.2, 0.9], rakeArm(O)] }, 'shock'); nestOn(O); }, { grade: 'street', dof: 0.25 });
