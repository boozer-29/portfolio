
// ===== the flat (title, Day 1, Day 3, Day 15, Day 20, phone inserts, END) =====
const F = S.flat;
function flatBase(O, o = {}) { resetRig(F.hero); F.hero.root.visible = false; F.phone.visible = true; resetRig(F.neigh); F.neigh.root.visible = false; F.shades.visible = !!o.shades; F.chair.rotation.y = o.chairFlip ? Math.PI : 0; F.ring.visible = false;
  F.leds.forEach((l, i) => l.material.emissiveIntensity = 2.5 + 2.5 * (Math.sin(O * (7 + i * 3) + i) > 0.3 ? 1 : 0));
  F.bulb.light.intensity = o.flicker && O > 88.0 && O < 88.5 && Math.sin(O * 90) > 0 ? 0.6 : 7;
  drawPhone(F.phone.tex, o.phone || 'onebar', O); drawPhone(F.dPhone.tex, o.dphone || 'call', O); F.dPhone.rotation.z = o.buzz ? Math.sin(O * 70) * 0.06 : 0;
  if (o.tv) { drawTV(F.tvT, O); F.tvL.intensity = 4; } else { F.tvT.g.fillStyle = '#000'; F.tvT.g.fillRect(0, 0, 1000, 560); F.tvT.needsUpdate = true; F.tvL.intensity = 0; }
  const nOn = o.ntv ?? 0; if (nOn) drawTV(F.ntvT, O); else { F.ntvT.g.fillStyle = '#000'; F.ntvT.g.fillRect(0, 0, 1000, 560); F.ntvT.needsUpdate = true; } F.ntvL.intensity = nOn * 3.5;
  return F.hero; }
const ROUTER = V([-0.6, 1.75, -2.85]);
function onToilet(O, wave = 1) { hp(F.hero, O, [3.25, 0, -1.95], 0, { ...idle(O), ...TSIT, headX: -0.35, headY: -0.25, arms: [[0.1, 0, 0.25, 0.9], [-2.85 + 0.15 * Math.sin(O * 2.6) * wave, 0.2 * Math.sin(O * 1.9) * wave, -0.75, 0.2]] }, 'worried'); }
const phoneCam = () => ({ pf: () => wp(F.hero.head).add(V([0.12, 0.42, 0.08])), lf: () => wp(F.phone), fov: 30 });
const deskCam = (z0 = 1.6, z1 = 1.35, t0 = 0, t1 = 1) => ({ pf: (O) => F.dPhone.localToWorld(V([0.1 - 0.12 * seg(O, t0, t1), -0.35, lerp(z0, z1, seg(O, t0, t1))])), lf: () => wp(F.dPhone), fov: 34 });
// TITLE: macro on the router LEDs, rack focus to him on the bed
shot(0, 3.0, 'flat', { p0: [-0.2, 1.95, -1.9], p1: [0.7, 2.25, 1.9], l0: [-0.6, 1.72, -2.88], l1: [-1.8, 1.75, -1.25], fov: 36, ease: 'io' }, (lt, O) => {
  const h = flatBase(O); hp(h, O, [-1.8, 0, -1.25], 0.75, { ...idle(O), ...SIT, headX: 0.35, arms: [[-0.7, 0, 0.3, 1.5], [-1.0, 0, -0.25, 1.45]] }, 'calm'); }, { grade: 'night', dof: (O) => O < 1.4 ? 0.6 : 0.35 });
// DAY 1: one bar in the bathroom
shot(tS(1), tS(1) + 2.6, 'flat', { ease: 'lin', p0: [4.35, 1.75, 1.6], p1: [4.2, 1.65, 1.0], l0: [3.2, 1.25, -1.95], fov: 44 }, (lt, O) => { flatBase(O); onToilet(O); }, { grade: 'bath' });
shot(tS(1) + 2.6, tE(1), 'flat', deskCam(1.5, 1.2, tS(1) + 2.6, tE(1)), (lt, O) => { flatBase(O, { dphone: 'onebar' }); onToilet(O, 0.3); }, { grade: 'bath', dof: 0.6 });
// DAY 3: the ring goes through the wall; the neighbour's TV wakes; his own TV says Peppa Pig
const neighOn = (O) => { hp(F.neigh, O, [8.0, 0, -1.0], Math.PI / 2, { ...idle(O, 2), ...SIT, headY: 0.1 }, O > tS(3) + 0.9 ? 'smile' : 'calm', 'neigh'); };
shot(tS(3), tS(3) + 2.9, 'flat', { ease: 'io', p0: [-0.8, 2.1, 6.4], p1: [8.2, 2.1, 6.4], l0: [-0.8, 1.5, -1.2], l1: [8.4, 1.4, -1.2], fov: 46 }, (lt, O) => {
  const r = ringAt(F.ring, O, tS(3) + 0.15, ROUTER, 10.5, 1.8); const h = flatBase(O, { ntv: r > 8.8 || O > tS(3) + 1.6 ? 1 : 0 }); hp(h, O, [-1.95, 0, -0.95], -Math.PI / 2, { ...idle(O), ...SIT }, 'calm'); ringAt(F.ring, O, tS(3) + 0.15, ROUTER, 10.5, 1.8); neighOn(O); }, { grade: 'night' });
shot(tS(3) + 2.9, tS(3) + 3.55, 'flat', { ease: 'lin', p0: [-1.15, 1.95, -0.45], p1: [-1.3, 1.92, -0.55], l0: [-3.8, 1.75, 0.2], fov: 38 }, (lt, O) => {
  const h = flatBase(O, { tv: true }); hp(h, O, [-1.95, 0, -0.95], -Math.PI / 2 + 0.15, { ...idle(O), ...SIT }, 'confused'); }, { grade: 'night', dof: 0.3 });
shot(tS(3) + 3.55, tE(3), 'flat', { ease: 'lin', p0: [-3.7, 2.25, -0.25], p1: [-3.65, 2.25, -0.45], l0: [-1.95, 2.1, -0.95], fov: 62 }, (lt, O) => {
  const h = flatBase(O, { tv: true }); hp(h, O, [-1.95, 0, -0.95], -Math.PI / 2 + 0.15, { ...idle(O), ...SIT, headX: -0.05, arms: [[-0.6, 0, 0.4, 1.2], [-0.4, 0, -0.3, 0.8]] }, 'shock'); }, { grade: 'night', dof: 0.35 });

// ===== the street at night (Day 5, Day 12) =====
const ST_ = S.street, HWIN = V([-0.8, 7.6, -6.35]);
function streetBase(O, r = -1) { const s = ST_; resetRig(s.hero); s.hero.root.visible = false; s.plane.visible = false; s.ring.visible = false;
  s.blocks.forEach(b => { const d = b.pos.distanceTo(HWIN); b.wm.emissiveIntensity = r >= 0 && d < r ? 1.6 : (r < 0 && O > tS(5) + 1.5 ? 1.6 : 0.15); });
  s.people.forEach((P, i) => { resetRig(P); const x = -9 + i * 2.1, z = i % 2 ? -4.3 : 12.3; const on = r >= 0 ? Math.abs(x) < r : O > tS(5) + 1.5; P.root.position.set(x, 0, z); P.root.rotation.y = i % 2 ? 0.2 : Math.PI - 0.2;
    pose(P, { ...idle(O, i), headX: on ? 0.25 : 0, arms: [[0, 0, 0.13, 0.2], on ? [-1.3 + 0.05 * Math.sin(O * 2 + i), 0, -0.2, 1.3] : [0.05, 0, -0.13, 0.2]] }); P.face(on ? 'smile' : 'calm', O); P.phone.visible = on; });
  const bx = O < tS(5) + 1.4 ? lerp(-20, -2, seg(O, tS(5), tS(5) + 1.4)) : -2; s.bike.position.set(bx, 0, 6.5); s.bike.rotation.y = 0; s.bike.rider.face('smile', O);
  pose(s.bike.rider, { headY: 0.2, headX: O > tS(5) + 1.4 ? 0.3 : 0, arms: [[-1.2, 0, 0.2, 0.3], O > tS(5) + 1.4 ? [-1.4, 0, -0.2, 1.3] : [-1.2, 0, -0.2, 0.3]], legs: [[1.2, 1.2], [1.2, 1.2]] }); return s.hero; }
shot(tS(5), tS(5) + 3.0, 'street', { p0: [1.6, 7.0, -3.4], p1: [9, 23, 20], l0: [-0.4, 7.2, -6.5], l1: [-2, 3, 0], fov: 50, ease: 'io' }, (lt, O) => {
  const r = ringAt(ST_.ring, O, tS(5) + 0.1, HWIN, 70, 2.4, 0.5); streetBase(O, r); ringAt(ST_.ring, O, tS(5) + 0.1, HWIN, 70, 2.4, 0.5); }, { grade: 'night', bloom: 0.2 });
shot(tS(5) + 3.0, tE(5), 'street', { ease: 'lin', p0: [6.5, 1.5, 7.2], p1: [4.6, 1.65, 6.4], l0: [-1, 1.7, -3.6], fov: 44 }, (lt, O) => { streetBase(O); }, { grade: 'night', dof: 0.25, bloom: 0.2 });
// Day 12: the jet circles above his balcony; cabin; his face
const BAL = V([0, 6.07, -5.7]);
function planeOn(O) { const p = ST_.plane; p.visible = true; const k = seg(O, tS(12) - 0.5, tE(12) + 0.5); p.position.set(lerp(-18, 18, k), 36 + 4 * k, 26); p.rotation.set(0, 0.16, 0.22 * Math.sin(k * Math.PI)); }
function balconyHero(O, expr) { hp(ST_.hero, O, BAL.toArray(), 0, { ...idle(O), headX: -0.55, headY: 0.25 * Math.sin(O * 0.6), arms: [[0.1, 0, 0.2, 0.3], [0.1, 0, -0.2, 0.3]] }, expr); }
shot(tS(12), tS(12) + 3.2, 'street', { ease: 'lin', p0: [1.3, 7.3, -5.6], p1: [1.45, 7.25, -5.3], l0: [0, 34, 26], fov: 62 }, (lt, O) => { streetBase(O); planeOn(O); balconyHero(O, 'shock'); }, { grade: 'night', bloom: 0.22 });
function cabinBase(O) { const c = S.cabin; const g = c.scrT.g; g.fillStyle = '#0a1020'; g.fillRect(0, 0, 160, 110); spinner(g, 80, 50, 22, O); g.fillStyle = '#fff'; g.font = '600 13px InterW, Arial'; g.textAlign = 'center'; g.fillText('Connecting to HIS WI-FI…', 80, 98); c.scrT.needsUpdate = true;
  c.pax.forEach((P, i) => { pose(P, { ...idle(O, i), ...SIT, headX: 0.15 }); P.face(i % 3 ? 'confused' : 'worried', O); }); }
shot(tS(12) + 3.2, tS(12) + 4.4, 'cabin', { ease: 'lin', p0: [0.0, 1.35, -9.4], p1: [0.0, 1.3, -8.8], l0: [0, 1.0, 0], fov: 56 }, (lt, O) => { cabinBase(O); }, { grade: 'cabin', dof: 0.2 });
shot(tS(12) + 4.4, tE(12), 'street', { ease: 'lin', p0: [0.9, 7.7, -1.5], p1: [0.75, 7.8, -2.1], l0: [0, 8.05, -5.7], fov: 46 }, (lt, O) => { streetBase(O); planeOn(O); balconyHero(O, 'shock'); }, { grade: 'night', dof: 0.35, bloom: 0.22 });

// ===== the classroom (Day 7) =====
function classBase(O) { const c = S.cls, hide = O > tS(7) + 4.25; c.kids.forEach((k, i) => { resetRig(k); k.root.position.set(-2.6 + (i % 3) * 2.6, 0, -1.4 + Math.floor(i / 3) * 2.0 + 0.55); k.root.rotation.y = Math.PI;
    pose(k, { ...idle(O, i), ...SIT, headX: hide ? -0.05 : 0.45, arms: hide ? [[-0.9, 0, 0.2, 1.4], [-0.9, 0, -0.2, 1.4]] : [[-0.9, 0, 0.25, 1.2], [-0.5, 0, -0.2, 0.9]] }); k.face(hide ? 'calm' : 'smile', O); k.phone.visible = !hide; drawPhone(k.phone.tex, 'voicemail', O + i);
    c.glows[i].position.copy(wp(k.head)).add(V([0, -0.3, -0.3])); c.glows[i].intensity = hide ? 0 : 1.6; });
  const turn = eIO(seg(O, tS(7) + 3.9, tS(7) + 4.25)); hp(c.teacher, O, [-2.4, 0, -4.4], lerp(Math.PI, 0.25, turn), { ...idle(O, 7), arms: [[0.05, 0, 0.14, 0.2], turn < 0.5 ? [-2.2 + 0.1 * Math.sin(O * 8), 0, -0.2, 0.6] : [0.05, 0, -0.14, 0.2]] }, turn > 0.5 ? 'confused' : 'calm', 'teacher'); }
shot(tS(7), tS(7) + 3.3, 'cls', { ease: 'lin', p0: [0.5, 2.7, -4.7], p1: [0.3, 2.5, -4.1], l0: [0, 0.9, 1.4], fov: 50 }, (lt, O) => { classBase(O); }, { grade: 'class', dof: 0.2 });
shot(tS(7) + 3.3, tE(7), 'cls', { ease: 'lin', p0: [4.8, 3.6, 5.2], p1: [4.2, 3.5, 4.6], l0: [-1, 1.0, -2.5], fov: 52 }, (lt, O) => { classBase(O); }, { grade: 'class' });

// ===== Day 15: the router throne (pause beat, one held push-in) =====
shot(tS(15), tE(15), 'flat', { ease: 'lin', p0: [0.95, 2.0, 2.2], p1: [0.85, 2.05, 0.95], l0: [0.8, 2.05, -1.45], fov: 40, live: 0.6 }, (lt, O) => {
  const h = flatBase(O, { shades: true, chairFlip: true }); F.phone.visible = false; hp(h, O, [0.8, 0, -1.45], 0, { ...idle(O), ...SIT, spineX: -0.18, headX: -0.08, headZ: 0.06, arms: [[-0.3, 0, 0.5, 0.9], [-0.3, 0, -0.5, 0.9]] }, 'smirk'); }, { grade: 'night', dof: 0.45 });
