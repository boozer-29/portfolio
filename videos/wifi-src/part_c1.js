
// ===== Revision 2 shots. The flat (title, Day 1, Day 3, Day 15, Day 20, Day 72, END) =====
const F = S.flat;
function flatBase(O, o = {}) { resetRig(F.hero); F.hero.root.visible = false; F.phone.visible = true; resetRig(F.neigh); F.neigh.root.visible = false; F.shades.visible = !!o.shades; F.chair.rotation.y = o.chairFlip ? Math.PI : 0; F.ring.visible = false; F.envs.forEach(e => e.visible = false); F.cushion.visible = false; F.plug.visible = false;
  const off = o.routerOff ? 1 : 0; F.leds.forEach((l, i) => { l.material.emissiveIntensity = off ? 0 : 2.5 + 2.5 * (Math.sin(O * (7 + i * 3) + i) > 0.3 ? 1 : 0); l.material.color.setHex(off ? 0x0c140e : 0x2bd96b); }); F.rLight.intensity = off ? 0 : 1.2;
  F.bulb.light.intensity = o.flicker && Math.sin(O * 37) > 0.6 && Math.sin(O * 3.1) > 0.4 ? 1.5 : 7;
  drawPhone(F.phone.tex, o.phone || 'onebar', O); drawPhone(F.dPhone.tex, o.dphone || 'call', O); F.dPhone.rotation.z = o.buzz ? Math.sin(O * 70) * 0.06 : 0;
  if (o.tv) { drawTV(F.tvT, O); F.tvL.intensity = 4; } else { F.tvT.g.fillStyle = '#000'; F.tvT.g.fillRect(0, 0, 1000, 560); F.tvT.needsUpdate = true; F.tvL.intensity = 0; }
  const nOn = o.ntv ?? 0; if (nOn) drawTV(F.ntvT, O); else { F.ntvT.g.fillStyle = '#000'; F.ntvT.g.fillRect(0, 0, 1000, 560); F.ntvT.needsUpdate = true; } F.ntvL.intensity = nOn * 3.5;
  return F.hero; }
const ROUTER = V([-0.6, 1.75, -2.85]);
const phoneUp = (O, w = 1, reach = 0) => [-2.3 - 0.35 * reach + 0.12 * Math.sin(O * 2.6) * w, 0.15 * Math.sin(O * 1.9) * w, -1.05 + 0.25 * reach, 0.25 - 0.2 * reach];
function onToilet(O, w = 1, stand = 0) { const st = eIO(stand); hp(F.hero, O, [3.25, lerp(0, 0.56, st), lerp(-1.95, -1.85, st)], -0.25, { ...idle(O), bob: lerp(TSIT.bob, 0, st), legs: TSIT.legs.map(l => [l[0] * (1 - st), l[1] * (1 - st)]), spineX: -0.12 * st, headX: lerp(-0.35, -0.6, st), headY: 0.25,
  arms: [[0.1 - 0.5 * st, 0, 0.35 + 0.4 * st, 0.6], phoneUp(O, w, st)] }, st > 0.5 ? 'grit' : 'worried'); }
const deskCam = (z0 = 1.6, z1 = 1.35, t0 = 0, t1 = 1) => ({ pf: (O) => F.dPhone.localToWorld(V([0.1 - 0.12 * seg(O, t0, t1), -0.35, lerp(z0, z1, seg(O, t0, t1))])), lf: () => wp(F.dPhone), fov: 34 });
shot(0, 3.0, 'flat', { p0: [-0.2, 1.95, -1.9], p1: [0.7, 2.25, 1.9], l0: [-0.6, 1.72, -2.88], l1: [-1.8, 1.75, -1.25], fov: 36, ease: 'io' }, (lt, O) => {
  const h = flatBase(O); hp(h, O, [-1.8, 0, -1.25], 0.75, { ...idle(O), ...SIT, headX: 0.35, arms: [[-0.7, 0, 0.3, 1.5], [-1.0, 0, -0.25, 1.45]] }, 'calm'); }, { grade: 'night', dof: (O) => O < 1.4 ? 0.6 : 0.35 });
const T1 = tS(1);
shot(T1, T1 + 2.8, 'flat', { ease: 'lin', p0: [4.35, 1.5, 1.4], p1: [4.2, 1.45, 0.95], l0: [3.2, 1.35, -1.95], fov: 46 }, (lt, O) => { flatBase(O); onToilet(O, 1, seg(O, T1 + 2.0, T1 + 2.8)); }, { grade: 'bath' });
shot(T1 + 2.8, T1 + 6.6, 'flat', { ease: 'lin', p0: [4.3, 0.9, 0.7], p1: [4.15, 0.95, 0.35], l0: [3.25, 2.35, -1.85], fov: 54 }, (lt, O) => { flatBase(O); onToilet(O, 0.6, 1); }, { grade: 'bath' });
shot(T1 + 6.6, tE(1), 'flat', deskCam(1.5, 1.2, T1 + 6.6, tE(1)), (lt, O) => { flatBase(O, { dphone: O > T1 + 7.4 ? 'nobar' : 'onebar' }); onToilet(O, 0.3, 1); }, { grade: 'bath', dof: 0.6 });
const T3 = tS(3);
function neighOn(O) { const awake = O > T3 + 1.6; const hug = eOut(seg(O, T3 + 2.0, T3 + 2.5)); const gig = O > tE(3) - 1.2 ? Math.abs(Math.sin(O * 14)) * 0.05 : 0;
  hp(F.neigh, O, [8.0, 0, -1.0], Math.PI / 2, { ...idle(O, 2), ...SIT, bob: SIT.bob + gig, spineX: awake ? -0.05 : 0.25, headX: awake ? -0.05 : 0.45, headZ: awake ? 0 : 0.25, arms: [[-1.1 * hug, 0, 0.6 - 0.4 * hug, 1.7 * hug], [-1.1 * hug, 0, -0.6 + 0.4 * hug, 1.7 * hug]] }, awake ? (gig ? 'laugh' : 'smile') : 'calm', 'neigh');
  if (!awake) F.neigh.lids.forEach(l => { l.scale.y = 1; l.position.y = 0.37; }); F.cushion.visible = true; F.cushion.position.copy(wp(F.neigh.spine)).add(V([0.38 * hug + 0.05, 0.25, 0.0])); F.cushion.rotation.set(0, Math.PI / 2, 0.1 * Math.sin(O * 3)); }
shot(T3, T3 + 3.0, 'flat', { ease: 'io', p0: [-0.8, 2.1, 6.4], p1: [8.2, 2.1, 6.4], l0: [-0.8, 1.5, -1.2], l1: [8.4, 1.4, -1.2], fov: 46 }, (lt, O) => {
  const r = ringAt(F.ring, O, T3 + 0.15, ROUTER, 10.5, 1.8); const h = flatBase(O, { ntv: r > 8.8 || O > T3 + 1.6 ? 1 : 0 }); hp(h, O, [-1.95, 0, -0.95], -Math.PI / 2, { ...idle(O), ...SIT }, 'calm'); ringAt(F.ring, O, T3 + 0.15, ROUTER, 10.5, 1.8); neighOn(O); }, { grade: 'night' });
shot(T3 + 3.0, T3 + 4.2, 'flat', { ease: 'lin', p0: [-1.15, 1.95, -0.45], p1: [-1.3, 1.92, -0.55], l0: [-3.8, 1.75, 0.2], fov: 38 }, (lt, O) => { const h = flatBase(O, { tv: true }); hp(h, O, [-1.95, 0, -0.95], -Math.PI / 2 + 0.15, { ...idle(O), ...SIT }, 'confused'); }, { grade: 'night', dof: 0.3 });
shot(T3 + 4.2, T3 + 8.0, 'flat', { ease: 'lin', p0: [-3.7, 2.25, -0.25], p1: [-3.65, 2.25, -0.5], l0: [-1.95, 2.1, -0.95], fov: 62 }, (lt, O) => { const h = flatBase(O, { tv: true, ntv: 1 }); const yell = O > T3 + 5.6;
  hp(h, O, [-1.95, 0, -0.95], -Math.PI / 2 + 0.15, { ...idle(O), ...SIT, headY: yell ? -0.55 : 0, spineY: yell ? -0.2 : 0, arms: yell ? [[-0.5, 0, 0.3, 1.0], [-1.5 + 0.15 * Math.sin(O * 8), 0, -0.6, 0.5]] : [[-0.6, 0, 0.4, 1.2], [-0.4, 0, -0.3, 0.8]] }, yell ? 'grit' : 'shock'); }, { grade: 'night', dof: 0.35 });
shot(T3 + 8.0, tE(3), 'flat', { ease: 'lin', p0: [9.6, 1.7, 1.6], p1: [9.4, 1.75, 1.2], l0: [8.0, 1.6, -1.0], fov: 44 }, (lt, O) => { flatBase(O, { ntv: 1 }); neighOn(O); }, { grade: 'night', dof: 0.3 });
const ST_ = S.street, HWIN = V([-0.8, 7.6, -6.35]), BAL = V([0, 6.07, -5.2]);
function streetBase(O, r = -1, o = {}) { const s = ST_; resetRig(s.hero); s.hero.root.visible = false; s.plane.visible = false; s.ring.visible = false; s.cars.visible = s.carLights.visible = false; s.trash.forEach(d => d.m.visible = false);
  const lit = (d) => r >= 0 ? d < r : O > tS(5) + 1.5; s.blocks.forEach(b => { b.wm.emissiveIntensity = lit(b.pos.distanceTo(HWIN)) ? 1.6 : 0.15; });
  s.people.forEach((P, i) => { resetRig(P); const x = -9 + i * 2.1, z = i % 2 ? -4.3 : 12.3; const on = r >= 0 ? Math.abs(x) < r : O > tS(5) + 1.5; const wave = o.wave ? eOut(seg(O, o.wave + i * 0.05, o.wave + 0.4 + i * 0.05)) : 0; P.root.position.set(x, 0, z);
    P.root.rotation.y = lerp(i % 2 ? 0.2 : Math.PI - 0.2, Math.atan2(-x, -10 - z), wave);
    pose(P, { ...idle(O, i), headX: on ? 0.25 - 0.6 * wave : 0, arms: [[0, 0, 0.13, 0.2], on ? [lerp(-1.3, -2.8, wave) + 0.25 * Math.sin(O * 9 + i) * wave, 0, lerp(-0.2, -0.5, wave), lerp(1.3, 0.3, wave)] : [0.05, 0, -0.13, 0.2]] }); P.face(on ? 'smile' : 'calm', O); P.phone.visible = on; });
  return s.hero; }
function bikeOn(O) { const s = ST_, t0 = tS(5) + 2.4, hit = tS(5) + 3.3; const k = seg(O, t0, hit); s.bike.position.set(lerp(-8, 2.0, k), 0, 9.3); s.bike.rotation.set(0, 0, O > hit ? -0.25 * Math.min(1, (O - hit) * 4) : 0);
  const R = s.bike.rider; R.root.visible = true; const fly = O > hit ? eOut(seg(O, hit, hit + 0.5)) : 0; R.root.position.set(0.6 * fly, 0.25 + 0.4 * Math.sin(fly * Math.PI), 0); R.root.rotation.set(0, Math.PI / 2, -1.2 * fly);
  pose(R, { headX: O < hit ? 0.5 : 0, arms: [[-1.2, 0, 0.2, 0.3], O < hit ? [-1.4, 0, -0.2, 1.3] : [-2.6, 0, -0.6, 0.3]], legs: [[1.2, 1.2], [1.2, 1.2]] }); R.face(O < hit ? 'smile' : 'shock', O); burst(s.trash, O, hit, V([2.5, 0.9, 9.3]), 2.2, 2.4); s.bin.rotation.z = O > hit ? -Math.min(1.4, (O - hit) * 5) : 0; }
const T5 = tS(5);
shot(T5, T5 + 3.0, 'street', { p0: [1.6, 7.0, -3.4], p1: [9, 23, 20], l0: [-0.4, 7.2, -6.5], l1: [-2, 3, 0], fov: 50, ease: 'io' }, (lt, O) => { const r = ringAt(ST_.ring, O, T5 + 0.1, HWIN, 70, 2.4, 0.5); streetBase(O, r); ringAt(ST_.ring, O, T5 + 0.1, HWIN, 70, 2.4, 0.5); bikeOn(O); }, { grade: 'night', bloom: 0.2 });
shot(T5 + 3.0, T5 + 4.6, 'street', { ease: 'lin', p0: [5.6, 0.7, 12.4], p1: [5.2, 0.8, 12.0], l0: [1.6, 0.8, 9.3], fov: 46 }, (lt, O) => { streetBase(O); bikeOn(O); }, { grade: 'night', shakeAt: [[T5 + 3.3, 0.03]], bloom: 0.2 });
shot(T5 + 4.6, T5 + 8.9, 'street', { ease: 'lin', p0: [1.2, 4.2, 2.6], p1: [1.0, 4.6, 1.6], l0: [0, 7.6, -5.2], fov: 46 }, (lt, O) => { streetBase(O); bikeOn(O);
  hp(ST_.hero, O, BAL.toArray(), 0, { ...idle(O), spineX: 0.3, headX: 0.35, arms: [[-1.2, 0, 0.5, 0.4], [-2.0 + 0.3 * Math.sin(O * 7), 0, -0.9, 0.3]] }, 'grit'); }, { grade: 'night', dof: 0.25, bloom: 0.2 });
shot(T5 + 8.9, tE(5), 'street', { ease: 'lin', p0: [3.5, 1.4, 16.5], p1: [3.0, 1.6, 15.5], l0: [-1, 3.0, -2], fov: 50 }, (lt, O) => { streetBase(O, -1, { wave: T5 + 8.9 }); }, { grade: 'night', bloom: 0.2 });
const T12 = tS(12);
function planeOn(O, t0, t1) { const p = ST_.plane; p.visible = true; const k = seg(O, t0, t1); p.position.set(lerp(-18, 18, k), 36 + 4 * k, 26); p.rotation.set(0, 0.16, 0.22 * Math.sin(k * Math.PI)); }
function balconyHero(O, expr, o = {}) { hp(ST_.hero, O, BAL.toArray(), o.ry ?? 0, { ...idle(O), headX: o.headX ?? -0.55, headY: 0.25 * Math.sin(O * 0.6), arms: o.arms || [[0.1, 0, 0.2, 0.3], [0.1, 0, -0.2, 0.3]] }, expr); }
shot(T12, T12 + 2.8, 'street', { ease: 'lin', p0: [1.3, 7.3, -5.0], p1: [1.45, 7.25, -4.7], l0: [0, 34, 26], fov: 62 }, (lt, O) => { streetBase(O); planeOn(O, T12 - 0.4, T12 + 3.2); balconyHero(O, 'shock'); }, { grade: 'night', bloom: 0.22 });
shot(T12 + 2.8, T12 + 5.6, 'street', { ease: 'lin', p0: [0.9, 7.6, -1.0], p1: [0.75, 7.75, -1.6], l0: [0, 8.05, -5.2], fov: 46 }, (lt, O) => { streetBase(O); balconyHero(O, 'shock'); }, { grade: 'night', dof: 0.3, bloom: 0.22, shakeAt: [[T12 + 3.0, 0.02]] });
function cabinBase(O) { const c = S.cabin; const g = c.scrT.g; g.fillStyle = '#0a1020'; g.fillRect(0, 0, 160, 110); spinner(g, 80, 50, 22, O); g.fillStyle = '#fff'; g.font = '600 13px InterW, Arial'; g.textAlign = 'center'; g.fillText('Connecting to HIS WI-FI…', 80, 98); c.scrT.needsUpdate = true;
  c.pax.forEach((P, i) => { pose(P, { ...idle(O, i), ...SIT, headX: 0.15 }); P.face(i % 3 ? 'confused' : 'worried', O); }); }
shot(T12 + 5.6, T12 + 6.8, 'cabin', { ease: 'lin', p0: [0.0, 1.95, -11.6], p1: [0.0, 1.9, -10.8], l0: [0, 1.0, 0], fov: 50 }, (lt, O) => { cabinBase(O); }, { grade: 'cabin', dof: 0.2 });
shot(T12 + 6.8, tE(12), 'street', { ease: 'lin', p0: [1.6, 6.8, -0.2], p1: [1.3, 7.0, -1.0], l0: [0, 7.9, -5.2], fov: 50 }, (lt, O) => { streetBase(O); planeOn(O, T12 + 6.0, T12 + 10.4);
  balconyHero(O, 'smirk', { headX: -0.25, arms: [[-0.2, 0, 0.6, 1.4], [-2.6, 0, -0.8 + 0.25 * Math.sin(O * 8), 0.3]] }); }, { grade: 'night', dof: 0.2, bloom: 0.22 });
const T7 = tS(7);
function classBase(O) { const c = S.cls, hide = O > T7 + 4.35; c.kids.forEach((k, i) => { resetRig(k); const x = -2.6 + (i % 3) * 2.6, z = -1.4 + Math.floor(i / 3) * 2.0 + 0.62; k.root.position.set(x, 0, z); k.root.rotation.y = Math.PI;
    pose(k, { ...idle(O, i), bob: -0.26, legs: [[1.5, 1.45], [1.5, 1.45]], headX: hide ? -0.05 : 0.5, spineX: hide ? 0 : 0.15, arms: hide ? [[-1.0, 0, 0.25, 1.4], [-1.0, 0, -0.25, 1.4]] : [[-0.9, 0, 0.25, 1.4], [-0.5, 0, -0.2, 0.9]] }); k.face(hide ? 'calm' : 'smile', O);
    k.phone.visible = !hide && !(i === 1 && O > T7 + 4.2); drawPhone(k.phone.tex, 'voicemail', O + i); c.glows[i].position.copy(wp(k.head)).add(V([0, 0.25, -0.45])); c.glows[i].intensity = hide ? 0 : 2.2; });
  const turn = eIO(seg(O, T7 + 3.9, T7 + 4.3)); hp(c.teacher, O, [-1.3, 0, -4.2], lerp(Math.PI, 1.0, turn), { ...idle(O, 7), arms: [[0.05, 0, 0.14, 0.2], turn < 0.5 ? [-2.2 + 0.1 * Math.sin(O * 8), 0, -0.2, 0.6] : [-0.3, 0, -0.5, 1.6]] }, turn > 0.5 ? 'confused' : 'calm', 'teacher');
  const sl = seg(O, T7 + 4.3, T7 + 5.3); c.slider.visible = O > T7 + 4.3; if (c.slider.visible) { c.slider.position.copy(V([0, 0.03, -0.9]).lerp(V([-1.15, 0.03, -3.75]), eOut(sl))); c.slider.rotation.set(-Math.PI / 2, 0, sl * 9); } }
shot(T7, T7 + 3.7, 'cls', { ease: 'lin', p0: [0.5, 2.7, -4.7], p1: [0.3, 2.5, -4.1], l0: [0, 0.9, 1.4], fov: 50 }, (lt, O) => { classBase(O); }, { grade: 'class', dof: 0.2 });
shot(T7 + 3.7, tE(7), 'cls', { ease: 'lin', p0: [4.6, 1.6, -1.6], p1: [4.3, 1.65, -2.0], l0: [-0.6, 0.95, -2.6], fov: 54 }, (lt, O) => { classBase(O); }, { grade: 'class' });
const T15 = tS(15);
shot(T15, tE(15), 'flat', { ease: 'lin', p0: [1.2, 1.75, 2.7], p1: [1.0, 1.8, 1.5], l0: [0.8, 1.3, -1.3], fov: 48, live: 0.6 }, (lt, O) => {
  const h = flatBase(O, { shades: true, chairFlip: true }); F.phone.visible = false; hp(h, O, [0.8, 0, -1.45], 0, { ...idle(O), ...SIT, spineX: -0.18, headX: -0.08, headZ: 0.06, arms: [[-0.3, 0, 0.5, 0.9], [-0.3, 0, -0.5, 0.9]] }, 'smirk');
  F.envs.forEach((e, i) => { const t0 = T15 + 0.3 + i * 0.07, k = eOut(seg(O, t0, t0 + 0.6)); e.visible = O > t0; if (!e.visible) return; const u = e.userData; const tgt = V([0.8 + Math.cos(u.a) * u.r, u.y, -1.25 + Math.sin(u.a) * u.r * 0.7]);
    e.position.copy(V([-3.6, 0.02, 1.2 + (i % 5) * 0.2]).lerp(tgt, k)); e.rotation.set(0, u.rot + (1 - k) * 4, 0); }); }, { grade: 'night', dof: 0.4 });
