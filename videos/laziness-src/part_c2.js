// ===== Day 16 .. END =====
function polyAt(pts, d) { let acc = 0; for (let i = 0; i < pts.length - 1; i++) { const L = pts[i].distanceTo(pts[i + 1]); if (d <= acc + L || i === pts.length - 2) { const u = clamp((d - acc) / L); return { p: pts[i].clone().lerp(pts[i + 1], u), t: pts[i + 1].clone().sub(pts[i]).normalize() }; } acc += L; } }
const polyLen = (pts) => pts.slice(1).reduce((s, p, i) => s + p.distanceTo(pts[i]), 0);
function armAlong(pts, e, carry) {   // telescopic arm: every segment stretches over [0, e] of the path; returns the tip
  const n = F.arm.length; F.arm.forEach((s, i) => { const d = (i + 0.5) / n * e; const { p, t } = polyAt(pts, d); s.visible = e > 0.05; s.position.copy(p); s.quaternion.setFromUnitVectors(V([1, 0, 0]), t); s.scale.set(Math.max(0.05, (e / n) / 1.15) * 1.08, 1, 1); });
  const tip = polyAt(pts, e); F.grab.visible = e > 0.05; F.grab.position.copy(tip.p); F.grab.quaternion.setFromUnitVectors(V([1, 0, 0]), tip.t); if (carry) { carry.visible = true; carry.position.copy(tip.p).add(V([0, -0.2, 0])); } return tip.p; }
// ---- DAY 16: golf commentary. The arm snakes down the hallway, takes the pizza, flicks a coin; "Keep the change. It's on its way." (a second coin rolls down the arm)
const T16 = tS(16), GO = T16 + 0.6, REACH = T16 + 4.6, FLIP = T16 + 5.2, BACK = [T16 + 5.9, T16 + 8.2];
const ARMP = [V([-0.75, 1.35, -2.75]), V([1.5, 1.65, -1.5]), V([5.0, 1.7, -0.45]), V([14.75, 1.7, -0.45])]; const ARML = polyLen(ARMP);
const armE = (O) => ARML * (O < BACK[0] ? eIO(seg(O, GO, REACH)) : 1 - 0.82 * eIO(seg(O, BACK[0], BACK[1])));
function scene16(O, o = {}) { flatBase(O); const door = O > REACH - 0.6; F.door.visible = !door; F.outside.intensity = door ? 30 : 0;
  lieAt(O, 1.15, ON_BACK, { headX: -0.2, headY: 0.3, arms: [[-1.2, -0.3, 0.6, 0.3], [-2.6, 0, -0.5, 1.9]] }, o.expr || 'calm');
  const e = armE(O); const has = O > REACH + 0.15; const tip = armAlong(ARMP, e, has ? F.pbox : null);
  put(F.driver, null, O, [16.2, 0, -0.45], -Math.PI / 2, { ...idle(O, 4), arms: has ? [[-0.2, 0, 0.13, 0.4], [O > FLIP + 0.35 ? -1.3 : -0.2, 0, -0.13, O > FLIP + 0.35 ? 1.2 : 0.4]] : [[-1.1, 0, 0.12, 0.9], [-1.1, 0, -0.12, 0.9]] }, O > FLIP + 0.4 ? 'confused' : 'calm', 'driver');
  if (!has) { F.pbox.visible = door; F.pbox.position.copy(wp(F.driver.arms[0].el).lerp(wp(F.driver.arms[1].el), 0.5).add(V([-0.35, -0.3, 0]))); }
  const c1 = seg(O, FLIP, FLIP + 0.4); F.coin.visible = O > FLIP; if (O > FLIP) F.coin.position.copy(O < FLIP + 0.4 ? V([14.9, 1.7, -0.45]).lerp(wp(F.driver.arms[1].el).add(V([0, -0.4, 0])), c1).add(V([0, Math.sin(Math.PI * c1) * 0.5, 0])) : wp(F.driver.arms[1].el).add(V([0, -0.42, 0.06]))); F.coin.rotation.set(O * 20, 0, 0);
  if (o.coin2 != null) { const k = seg(O, o.coin2, o.coin2 + 6); const { p } = polyAt(ARMP, k * e); F.flying[0].visible = true; F.flying[0].material = GOLD; F.flying[0].scale.set(0.3, 1, 0.3); F.flying[0].position.copy(p).add(V([0, 0.12, 0])); F.flying[0].rotation.set(0, 0, O * 9); } }
shot(T16, REACH - 0.3, 'flat', { ease: 'lin', p0: [14.5, 1.85, -0.5], p1: [14.4, 1.83, -0.5], l0: [4.0, 1.6, -0.55], fov: 24, live: 0.3 }, (lt, O) => scene16(O), { grade: 'golf', golf: true });
shot(REACH - 0.3, T16 + 7.3, 'flat', { ease: 'lin', p0: [12.4, 2.3, 0.15], p1: [12.6, 2.25, 0.1], l0: [16.0, 1.6, -0.5], fov: 46, live: 0.3 }, (lt, O) => scene16(O), { grade: 'golf', golf: true });
shot(T16 + 7.3, tE(16), 'flat', { ease: 'lin', p0: [0.6, 3.1, -0.6], p1: [0.5, 3.05, -0.8], l0: [-0.6, 1.3, -3.2], fov: 46, live: 0.3 }, (lt, O) => { scene16(O, { coin2: T16 + 7.5, expr: O > T16 + 9.0 ? 'smirk' : 'calm' }); F.pbox.visible = true; F.pbox.position.set(-0.35, SEAT + 0.6, SZ); F.pbox.rotation.set(0, 0.2, 0); F.grab.visible = true; }, { grade: 'golf', golf: true });
// ---- DAY 20: the flat is a factory. Wide crane; Priya rides a conveyor with her rota; he glides past, eyes shut: "Mmm… nah."
const T20 = tS(20);
function factory(O, o = {}) { flatBase(O, { fac: true }); F.table.visible = F.side.visible = F.sofa.visible = false;
  const [c0, c1] = F.conv; c0.rotation.y = Math.PI / 2; c0.position.set(-1.0, 0, -1.9); c1.rotation.y = 0; c1.position.set(3.9, 0, -0.6); c0.tex.offset.y = O * 0.9; c1.tex.offset.y = -O * 0.9;
  [[-3.4, -3.3, 0], [-0.9, -3.3, 0], [1.6, -3.3, 0], [-2.2, -0.5, Math.PI], [0.4, -0.5, Math.PI]].forEach(([x, z, ry], i) => { const c = F.claws[i]; c.position.set(x, 0, z); c.rotation.y = ry; const ph = O * 3.1 + i * 1.7; c.a1.rotation.x = 0.55 + 0.25 * Math.sin(ph); c.a2.rotation.x = 1.0 + 0.4 * Math.sin(ph + 1.1); c.hd.rotation.x = 0.3 * Math.sin(ph * 2); });
  F.sparks.forEach((s, i) => { const c = F.claws[i % 5]; const on = Math.sin(O * 13 + i * 2.3) > 0.4; s.visible = on; s.position.copy(wp(c.hd)).add(V([Math.sin(i * 7) * 0.2, -0.2, Math.cos(i * 5) * 0.2])); s.scale.setScalar(0.25 + 0.2 * Math.sin(O * 40 + i)); });
  const hx = o.hx ?? lerp(-4.2, 2.6, seg(O, T20, tE(20))); lieAt(O, hx + 1.1, ON_BACK, { headX: -0.1, arms: [[0.15, 0, 0.2, 0.2], [0.15, 0, -0.2, 0.2]] }, 'sleep', 0.91, -1.9);
  const pz = lerp(-3.6, 2.6, seg(O, T20 + 1.0, tE(20))); put(F.priya, F.pb, O, [3.9, 0.66, pz], 0, { ...idle(O, 1), arms: [[-1.2, 0, 0.2, 0.9], [-1.0, 0, -0.3, 1.2]] }, 'grit', 'priya');
  F.priya.marker.visible = false; const r = F.rota; return { pz }; }
shot(T20, T20 + 2.7, 'flat', { ease: 'io', p0: [6.4, 2.6, 6.2], p1: [5.2, 7.2, 5.0], l0: [-0.5, 0.8, -1.6], l1: [-0.4, 0.5, -1.8], fov: 50 }, (lt, O) => factory(O), { grade: 'factory' });
shot(T20 + 2.7, T20 + 6.7, 'flat', { ease: 'lin', p0: [4.6, 2.6, 5.4], p1: [4.5, 2.6, 5.2], l0: [3.9, 2.0, 0.2], fov: 42 }, (lt, O) => factory(O), { grade: 'factory', dof: 0.15 });
const HX20 = (O) => lerp(-2.6, 0.4, seg(O, T20 + 6.7, tE(20)));
shot(T20 + 6.7, tE(20), 'flat', { ease: 'lin', pf: (O) => V([HX20(O) + 0.2, 2.7, 0.9]), lf: (O) => V([HX20(O) - 0.9, 1.05, -1.9]), fov: 42 }, (lt, O) => factory(O, { hx: HX20(O) }), { grade: 'factory' });
// ---- DAY 25: blueprint "LONDON MK1"; chips arrive by zipline through the open window; the drone pulls back over the string-laced city; the neighbour shouts
const T25 = tS(25), ZIP = [T25 + 1.6, T25 + 2.6], WIN = V([-2.4, 3.0, -4.95]);
shot(T25, T25 + 1.4, 'flat', { ease: 'lin', p0: [0, 2, 4], l0: [0, 1, 0], fov: 40 }, (lt, O) => { flatBase(O); }, { grade: 'flat', bp: 'london' });
shot(T25 + 1.4, T25 + 5.7, 'flat', { ease: 'lin', p0: [0.7, 2.7, -0.5], p1: [0.6, 2.65, -0.7], l0: [-1.5, 1.9, -3.9], fov: 46 }, (lt, O) => { flatBase(O, { open: true }); F.sky.material.color.setHex(0xffb488);
  const h = lieAt(O, 1.15, ON_BACK, { headX: -0.2, headY: 0.35, arms: [[-1.5, -0.2, 0.3, 0.4], [-2.6, 0, -0.5, 1.9]] }, O > T25 + 2.4 ? 'smirk' : 'calm'); const hand = wp(h.arms[0].el).add(V([0, -0.35, 0]));
  F.zip.visible = true; F.zip.setPts([WIN, hand]); const k = eIO(seg(O, ZIP[0], ZIP[1])); F.chips.visible = true; F.chips.position.copy(WIN.clone().lerp(hand, k).add(V([0, 0.25, 0]))); }, { grade: 'flat', dof: 0.15 });
function cityBase(O, o = {}) { const c = S.city; c.rain(O, !!o.rain); c.power(o.power ?? 1, O, o.wave); c.neighbour.root.visible = !!o.nb; c.eng.root.visible = !!o.eng; c.rdom.forEach(d => d.rotation.x = 0); c.lever.arm.rotation.x = 0.7; c.psLight.intensity = 0;
  c.sc.background.setHex(o.storm ? 0x0a0c16 : 0x2a2340); c.sc.fog.color.copy(c.sc.background); c.dome.visible = !o.storm; c.key.intensity = o.storm ? 0.25 : 1.3; c.zipChips.visible = false; return c; }
shot(T25 + 5.7, tE(25), 'city', { ease: 'io', p0: [0.6, 5.2, 7.0], p1: [7.0, 15.0, 24.0], l0: [-0.7, 5.0, 1.0], l1: [-4.0, 5.0, -14.0], fov: 46 }, (lt, O) => { const c = cityBase(O, { nb: true });
  hp(c.neighbour, O, [-1.6, 2.55, 1.2], 0, { ...idle(O), spineX: -0.1, arms: [[-2.3, 0, 0.3, 0.4], [-0.3, 0, -0.2, 0.3]] }, 'smile', 'neighbour');
  const k = seg(O, T25 + 5.8, tE(25)); c.zipChips.visible = true; c.zipChips.position.copy(V([14, 5.2, -6.2]).lerp(c.W0, k).add(V([0, -0.5 - 0.6 * Math.sin(Math.PI * k), 0]))); }, { grade: 'city' });
// ---- DAY 30: the storm. Blackout street by street; the engineer on the radio; one tug of the string; the domino chain over London; the lever; the lights come back
const T30 = tS(30), BLACK = T30 + 0.25, TUG = T30 + 6.5, CH = [T30 + 7.1, T30 + 9.5], LEVER = T30 + 9.65, WAVE = T30 + 10.25;
function chainCity(O) { const c = S.city; c.rdom.forEach((d, i) => { const tf = lerp(CH[0], CH[1], i / c.rdom.length); d.rotation.x = 1.25 * eIn(seg(O, tf, tf + 0.14)); }); c.lever.arm.rotation.x = 0.7 - 1.5 * eOut(seg(O, LEVER, LEVER + 0.18)); }
shot(T30, T30 + 2.3, 'city', { ease: 'lin', p0: [9.0, 17.0, 26.0], p1: [8.4, 16.4, 24.6], l0: [-6.0, 3.0, -14.0], fov: 46 }, (lt, O) => { cityBase(O, { storm: true, rain: true, power: 1 - seg(O, BLACK, BLACK + 1.2) }); S.city.power(0, O, null); const off = seg(O, BLACK, BLACK + 1.4);
  S.city.blds.forEach(B => { const d = Math.hypot(B.x - 6, B.z + 10); B.m.emissiveIntensity = clamp(1 - (off * 40 - d) / 4); }); }, { grade: 'storm', flash: BLACK, fa: [0.9, 0.5, 0.2] });
shot(T30 + 2.3, TUG - 0.2, 'city', { ease: 'lin', p0: [-16.2, 12.6, -23.4], p1: [-16.6, 12.5, -24.0], l0: [-22.8, 11.2, -30.6], fov: 44 }, (lt, O) => { const c = cityBase(O, { storm: true, rain: true, power: 0, eng: true });
  hp(c.eng, O, [-0.5, 9.4, 2.4], 0.5, { ...idle(O, 5), spineX: 0.1, arms: [[-0.2, 0, 0.3, 0.3], [-2.0, 0, -0.4, 2.1]], headX: 0.1 }, 'worried', 'engineer'); }, { grade: 'storm', flash: T30 + 3.4, fa: [0.6, 0.3, 0.1] });
shot(TUG - 0.2, CH[0], 'flat', { ease: 'lin', p0: [0.3, 2.4, -0.9], p1: [0.25, 2.35, -1.05], l0: [-0.8, 1.3, -3.1], fov: 40 }, (lt, O) => { flatBase(O, { lit: 0.18, night: true, open: true }); const t = eOut(seg(O, TUG, TUG + 0.2));
  const h = lieAt(O, 1.15, ON_BACK, { headX: -0.2, headY: 0.4, arms: [[-1.3 + 0.6 * t, -0.2, 0.4, 0.5 + 0.6 * t], [-2.6, 0, -0.5, 1.9]] }, 'calm'); const hand = wp(h.arms[0].el).add(V([0, -0.35, 0])); F.zip.visible = true; F.zip.setPts([WIN, hand]); }, { grade: 'dark', flash: TUG - 0.05, fa: [0.5, 0.25, 0.1] });
const camChain = (O, k0 = 0) => { const u = clamp(seg(O, CH[0], CH[1]) + 0.04); const c = S.city.roofCurve; return { p: c.getPointAt(Math.min(u, 1)).add(V([3.2, 2.6, 3.4])), l: c.getPointAt(Math.min(1, u + 0.03)).add(V([0, 0.4, 0])) }; };
shot(CH[0], LEVER - 0.15, 'city', { ease: 'lin', pf: (O) => camChain(O).p, lf: (O) => camChain(O).l, fov: 50 }, (lt, O) => { cityBase(O, { storm: true, rain: true, power: 0 }); chainCity(O); }, { grade: 'storm', mblur: 2 });
shot(LEVER - 0.15, WAVE, 'city', { ease: 'lin', p0: [-18.6, 10.2, -25.6], p1: [-18.8, 10.0, -26.0], l0: [-21.4, 11.8, -30.4], fov: 46 }, (lt, O) => { const c = cityBase(O, { storm: true, rain: true, power: 0, eng: true }); chainCity(O); c.psLight.intensity = O > LEVER + 0.2 ? 60 : 0;
  hp(c.eng, O, [-0.5, 9.4, 2.4], 0.5, { ...idle(O, 5), arms: [[-0.2, 0, 0.3, 0.3], [-2.0, 0, -0.4, 2.1]] }, O > LEVER ? 'shock' : 'worried', 'engineer'); }, { grade: 'storm', shakeAt: [[LEVER + 0.05, 0.02]] });
shot(WAVE, tE(30), 'city', { ease: 'io', p0: [10.0, 21.0, 26.0], p1: [8.0, 18.0, 22.0], l0: [-8.0, 3.0, -16.0], l1: [-3.0, 5.0, -4.0], fov: 48 }, (lt, O) => { const c = cityBase(O, { storm: true, rain: O < WAVE + 1.0, wave: WAVE }); chainCity(O); c.psLight.intensity = 60; }, { grade: 'city' });
// ---- END: Priya writes "SAVED LONDON ✓"; Dev bursts in; "Mmm… nah."; the arm brings the medal to his chest; "…claat."
const TE = tS('END'), WRITE = TE + 0.4, BURST = TE + 1.1, MEDAL = [TE + 5.4, TE + 7.3], WAKE = TE + 7.85;
const MEDP = [V([14.75, 1.7, -0.45]), V([5.0, 1.7, -0.45]), V([0.6, 1.9, -2.2]), V([-0.45, 1.55, -3.4])]; const MEDL = polyLen(MEDP);
function endBase(O) { flatBase(O, { rota: { saved: O > WRITE + 0.6 } }); return F.hero; }
shot(TE, BURST, 'flat', { ease: 'lin', p0: [-2.8, 2.5, 3.2], p1: [-2.9, 2.45, 3.0], l0: [-4.8, 2.2, 1.6], fov: 46 }, (lt, O) => { endBase(O);
  put(F.priya, F.pb, O, [-3.95, 0, 1.0], -1.25, { ...idle(O, 1), arms: [[-0.3, 0, 0.13, 0.3], [-1.45 + 0.08 * Math.sin(O * 18), 0.1, -0.1, 0.3]] }, 'smile', 'priya'); F.priya.marker.visible = true; }, { grade: 'flat', dof: 0.15 });
shot(BURST, TE + 4.95, 'flat', { ease: 'lin', p0: [-1.5, 2.5, -2.7], p1: [-1.4, 2.48, -2.5], l0: [2.8, 1.45, -1.3], fov: 48 }, (lt, O) => { endBase(O); const w = eOut(seg(O, BURST, BURST + 0.8));
  put(F.dev, F.db, O, [lerp(8.0, 2.1, w), 0, lerp(-0.45, -1.7, w)], -Math.PI / 2 - 0.55 * w, w < 1 ? walk(O, 11, 1.2) : { ...idle(O, 2), arms: [[-2.4, 0, 0.5, 0.3], [-2.4, 0, -0.5, 0.3]] }, 'laugh', 'dev');
  lieAt(O, 1.15, ON_BACK, LAZY(O), 'sleep'); }, { grade: 'flat', dof: 0.15 });
shot(TE + 4.95, WAKE - 0.5, 'flat', { ease: 'lin', p0: [0.9, 3.5, -0.4], p1: [0.8, 3.4, -0.6], l0: [-0.6, 1.3, -3.4], fov: 48 }, (lt, O) => { endBase(O); lieAt(O, 1.15, ON_BACK, LAZY(O), 'sleep');
  const e = MEDL * (O < MEDAL[1] ? eIO(seg(O, MEDAL[0], MEDAL[1])) : 1); const tip = armAlong(MEDP, e, null); F.medal.visible = true;
  if (O < MEDAL[1] + 0.1) { F.medal.position.copy(tip).add(V([0, -0.35, 0])); F.medal.rotation.set(0, 0, 0); } else { F.medal.position.set(-0.45, SEAT + 0.55, SZ); F.medal.rotation.set(-Math.PI / 2, 0, 0.3); } }, { grade: 'flat' });
shot(WAKE - 0.5, DUR + 0.1, 'flat', { ease: 'lin', p0: [-0.65, 3.05, -1.9], p1: [-0.7, 2.95, -2.05], l0: [-0.85, 1.2, -3.5], fov: 42 }, (lt, O) => { endBase(O); const awake = O > WAKE - 0.05 && O < WAKE + 1.0;
  lieAt(O, 1.15, ON_BACK, LAZY(O), awake ? 'calm' : 'sleep'); F.medal.visible = true; F.medal.position.set(-0.45, SEAT + 0.55, SZ); F.medal.rotation.set(-Math.PI / 2, 0, 0.3); }, { grade: 'flat', dark: (O) => clamp((O - (DUR - 0.9)) / 0.5) });
