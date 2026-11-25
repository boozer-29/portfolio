// ===== shared: the coin-flip insert that opens every day (same framing every time: the signature) =====
const DAYS = [1, 2, 3, 5, 7, 9, 13, 20, 23, 26, 'END'];
const INS = 0.75, LAND = 0.33;
function coinInsert(t0, t1, mode, camO = {}) {
  shot(t0, t1, 'hand', { ease: camO.ease || 'lin', p0: [0.15, 4.7, 1.9], p1: camO.p1 || [0.12, 4.4, 1.7], l0: camO.l || [0, 0.0, -0.25], fov: 40, shift: 0.0 }, (lt, O) => {
    const H = S.hand, c = H.coin, dt = O - t0; const land = V([0.05, 0.005, 0.12]);
    const fin = mode === 'tails' ? Math.PI : mode === 'edge' ? Math.PI / 2 : 0;
    if (dt < LAND) { const u = dt / LAND; c.position.set(lerp(-0.6, land.x, u), land.y + 3.2 * (1 - u * u), lerp(0.9, land.z, u)); c.rotation.set(fin + (1 - u) * 26, 0.3 * (1 - u), 0); }
    else { const b = dt - LAND; const hop = mode === 'edge' ? 0 : Math.max(0, Math.sin(Math.min(1, b / 0.14) * Math.PI)) * 0.07 * Math.exp(-b * 6);
      c.position.set(land.x, land.y + hop + (mode === 'edge' ? 0.27 : 0), land.z); const wob = mode === 'edge' ? 0.32 * Math.exp(-b * 2.2) * Math.sin(b * 16) : 0; c.rotation.set(fin, 0.3, wob); }
    H.hand.rotation.set(0, 0, 0.03 * Math.sin(O * 1.3)); H.hand.position.y = -0.2 + (dt > LAND && dt < LAND + 0.1 ? -0.03 : 0);
    const sp = mode === 'heads' ? clamp(1 - (dt - LAND) / 0.4) * (dt >= LAND ? 1 : 0) : 0; H.spark.visible = sp > 0; H.spark.position.set(land.x + 0.12, 0.12, land.z - 0.05); H.spark.scale.setScalar(0.4 + 2.2 * sp * (1 - sp) * 2); H.spark.material.opacity = sp;
  }, { grade: 'coin', live: 0.3, hideDiary: true, mblur: (O) => (O - t0 < LAND ? 3 : 1) });
}
// ===== TITLE + DAY 1: the bakery =====
const B = S.bakery; const QM = V([0.9, 0, 1.2]), QH = V([-0.7, 0, 2.95]);   // Marcus at the counter, the hero behind him in the queue
function bakeryBase(O, o = {}) { const b = B; [b.hero, b.marcus, b.baker].forEach(P => { resetRig(P); P.root.visible = false; }); b.extras.forEach((P, i) => { resetRig(P); hp(P, O, i ? [6.0, 0, 3.0] : [5.0, 0, 4.4], i ? -2.4 : 0.8, { ...idle(O, i * 2), arms: [[-0.5, 0, 0.13, 1.4], [0, 0, -0.13, 0.15]] }, 'smile', 'x'); });
  b.roll.visible = true; b.roll.position.set(0.9, 1.25, 0.25); b.roll.rotation.set(0, 0, 0); b.price.visible = !!o.price; b.toast.visible = false; b.plate.visible = false; b.splat.visible = false; b.coins.forEach(c => c.visible = false); b.spin.visible = false; b.wallet.visible = false; b.moths.forEach(m => m.visible = false);
  b.marcus.sponge.visible = b.marcus.ticket.visible = false; b.marcus.state(O, o.wet || 0, o.soot || 0);
  [b.win, b.win2].forEach(w => { w.rain.offset.y = O * 0.6; w.rain.offset.x = Math.sin(O * 0.3) * 0.02; });
  hp(b.baker, O, [O < 2.3 ? -0.8 : 0.6, 0, -1.05], 0, { ...idle(O, 1), arms: [[-0.4, 0, 0.15, 1.3], [-0.4, 0, -0.15, 1.3]] }, 'calm', 'baker'); }
// title A: low over the counter; the roll sharp in front; Marcus's hand takes it; the hero's sad face behind
const GRAB = 1.05, BITE = 1.55, TURN = [2.0, 3.1];
function marcusTitle(O) { const m = B.marcus; const reach = eIO(seg(O, 0.35, GRAB)), lift = eIO(seg(O, GRAB, BITE)), low = eIO(seg(O, BITE + 0.35, BITE + 0.8)), turn = eIO(seg(O, TURN[0], TURN[1]));
  const armR = O < GRAB ? [lerp(-0.1, -1.35, reach), 0, -0.1, lerp(0.15, 0.25, reach)] : [lerp(lerp(-1.35, -1.25, lift), -0.35, low), 0, lerp(-0.1, -0.35, lift * (1 - low)), lerp(lerp(0.25, 2.0, lift), 1.3, low)];
  hp(m, O, [QM.x, 0, QM.z], lerp(Math.PI, -0.25, turn), { ...idle(O, 3), spineX: 0.22 * reach * (1 - lift), arms: [[0, 0, 0.13, 0.15], armR] }, O > TURN[1] ? 'smirk' : O > BITE ? 'sniff' : 'calm', 'marcus');
  if (O >= GRAB) { const h = m.arms[1].el; B.roll.position.copy(h.localToWorld(V([0, -0.46, 0.06]))); B.roll.rotation.set(0, lerp(Math.PI, -0.25, turn) + Math.PI / 2, 0.2); } }
function heroQueue(O, expr = 'worried') { hp(B.hero, O, [QH.x, 0, QH.z], Math.PI + 0.25, { ...idle(O, 0), headX: 0.12, arms: [[0.05, 0, 0.13, 0.25], [0.05, 0, -0.13, 0.25]] }, expr, 'vo'); }
shot(0, 2.3, 'bakery', { ease: 'lin', p0: [0.5, 1.42, -1.15], p1: [0.45, 1.44, -0.95], l0: [0.7, 1.5, 2.6], fov: 46, shift: 0.02 }, (lt, O) => { bakeryBase(O); marcusTitle(O); heroQueue(O); }, { grade: 'bakery', dof: 0.12 });
shot(2.3, TL[1].t, 'bakery', { ease: 'lin', p0: [-0.35, 2.15, 5.3], p1: [-0.2, 2.1, 4.9], l0: [0.85, 1.95, 1.2], fov: 36 }, (lt, O) => { bakeryBase(O); marcusTitle(O); heroQueue(O, O > 3.9 ? 'worried' : 'calm'); }, { grade: 'bakery', dof: 0.12 });
// DAY 1: tails. At the window table: the toast slides off, flips, lands butter-down on his white trainer
const T1 = tS(1), TSLIDE = T1 + 2.0, TLAND = T1 + 2.75;
const HS = V([-4.6, 0, 4.7]);   // he stands by the rainy window eating toast off a plate, facing +x
function heroToast(O, expr = 'worried') { const h = B.hero; const look = O > TSLIDE && O < TLAND + 0.6;
  hp(h, O, [HS.x, 0, HS.z], Math.PI / 2, { ...idle(O, 1), headX: look ? 0.5 : 0.1, headY: look ? 0.25 : 0, arms: [[-0.95, 0.15, 0.12, 1.35], [0.05, 0, -0.13, 0.2]] }, expr); return h; }
const plateAt = () => B.hero.arms[0].el.localToWorld(V([0, -0.45, 0.05])).add(V([0, 0.06, 0]));
const shoeAt = () => B.hero.legs[0].knee.localToWorld(V([0, -0.36, 0.14]));
function toastAt(O) { const t = B.toast, p = B.plate; t.visible = p.visible = true; const pl = plateAt(); p.position.copy(pl); p.rotation.set(0, 0, 0.05);
  const on = pl.clone().add(V([0, 0.045, 0])), edge = pl.clone().add(V([0, 0.03, 0.3]));
  if (O < TSLIDE) { t.position.copy(on); t.rotation.set(0, 0.2, 0); return; }
  const s = eIn(seg(O, TSLIDE, TSLIDE + 0.3)); if (O < TSLIDE + 0.3) { t.position.copy(on.clone().lerp(edge, s)); t.rotation.set(0.2 * s, 0.2, 0); return; }
  const u = seg(O, TSLIDE + 0.3, TLAND), shoe = shoeAt().add(V([0, 0.06, 0])); t.position.copy(edge.clone().lerp(shoe, eIn(u))).add(V([0, 0.15 * Math.sin(u * Math.PI), 0.12 * Math.sin(u * Math.PI)])); t.rotation.set(0.2 + Math.PI * u, 0.2, 0.4 * u);
  if (O >= TLAND) { t.position.copy(shoe); t.rotation.set(Math.PI, 0.2, 0.3); B.splat.visible = true; B.splat.position.copy(shoe.clone().add(V([0, -0.035, 0]))); } }
coinInsert(T1, T1 + INS, 'tails');
shot(T1 + INS, TSLIDE + 0.15, 'bakery', { ease: 'lin', p0: [-1.3, 2.0, 6.3], p1: [-1.5, 1.98, 6.1], l0: [-4.6, 1.5, 4.7], fov: 42 }, (lt, O) => { bakeryBase(O); heroToast(O); toastAt(O); }, { grade: 'bakery', dof: 0.12 });
shot(TSLIDE + 0.15, TLAND + 0.25, 'bakery', { ease: 'lin', p0: [-4.4, 1.35, 7.8], p1: [-4.4, 1.3, 7.6], l0: [-4.6, 1.25, 4.7], fov: 66 }, (lt, O) => { bakeryBase(O); heroToast(O, O > TLAND ? 'shock' : 'worried'); toastAt(O); }, { grade: 'bakery', mblur: (O) => (O > TSLIDE + 0.25 && O < TLAND ? 3 : 1), shakeAt: [[TLAND, 0.01]] });
shot(TLAND + 0.25, T1 + 3.75, 'bakery', { ease: 'lin', p0: [-3.85, 0.55, 5.85], p1: [-3.95, 0.5, 5.7], l0: [-4.55, 0.12, 4.85], fov: 40 }, (lt, O) => { bakeryBase(O); heroToast(O, 'shock'); toastAt(O); }, { grade: 'bakery' });
shot(T1 + 3.75, TL[2].t, 'bakery', { ease: 'lin', p0: [-1.75, 2.0, 4.4], p1: [-1.95, 1.98, 4.45], l0: [-4.6, 1.88, 4.7], fov: 40 }, (lt, O) => { bakeryBase(O); heroToast(O, 'worried'); toastAt(O); }, { grade: 'bakery', dof: 0.2 });
// ===== DAY 2: the windy bridge. A fiver tumbles down the bridge past everyone and slaps onto his face =====
const Bw = S.bridge; const T2 = tS(2), SLAP = T2 + 3.05, PEEL = T2 + 3.55;
const HZ = (O) => lerp(-3.2, 0, eOut(seg(O, T2 + 0.75, T2 + 2.9)));
function bridgeBase(O) { const b = Bw; resetRig(b.hero); b.walkers.forEach((P, i) => { resetRig(P); const z = -7 - i * 5.5 - ((O * 1.7 + i * 3) % 4); const x = (i % 2 ? 1.6 : -1.8); hp(P, O, [x, 0, z], Math.PI * (i % 2 ? 0.9 : 1.1), { ...walk(O + i, 11, 1.1), spineX: 0.25, arms: [[-2.2, 0, 0.3, 0.3], [-2.0, 0, -0.3, 0.3]] }, 'shock', 'x'); });
  b.hats.forEach((h, i) => { const u = ((O * 0.5 + i * 0.33) % 1); h.position.set((i - 1) * 1.6 + Math.sin(O * 3 + i) * 0.5, 1.2 + Math.sin(u * Math.PI) * 2.2, -9 - i * 5.5 - u * 9); h.rotation.set(O * 5 + i, O * 3, O * 4); });
  for (let i = 0; i < 60; i++) { const u = ((O * 0.35 + i * 0.137) % 1); b.leaves.set(i, V([((i * 37) % 9) - 4.5 + Math.sin(O * 2 + i) * 0.4, 0.3 + ((i * 13) % 7) * 0.45 + Math.sin(O * 3 + i) * 0.3, -40 + u * 46])); } b.leaves.done(); }
function noteAt(O) { const n = Bw.note, h = Bw.hero; const face = h.head.localToWorld(V([0, 0.33, 0.36]));
  if (O < SLAP) { const u = clamp((O - (T2 + 0.6)) / (SLAP - T2 - 0.6)); const start = V([-2.4, 5.5, -38]); n.position.copy(start.lerp(face, eIn(u) * 0.35 + u * 0.65)).add(V([Math.sin(O * 7) * 0.6 * (1 - u), Math.sin(O * 5) * 0.8 * (1 - u), 0])); n.rotation.set(O * 9 * (1 - u), O * 6 * (1 - u), O * 4 * (1 - u)); return; }
  if (O < PEEL) { n.position.copy(face); n.quaternion.copy(h.head.getWorldQuaternion(new THREE.Quaternion())); return; }
  const k = eIO(seg(O, PEEL, PEEL + 0.4)); const hold = h.arms[0].el.localToWorld(V([0, -0.45, 0.1])).lerp(h.arms[1].el.localToWorld(V([0, -0.45, 0.1])), 0.5).add(V([0, -0.2, 0.12]));
  n.position.copy(face.clone().lerp(hold, k)); n.quaternion.copy(h.spine.getWorldQuaternion(new THREE.Quaternion())); n.rotateX(-0.25 * k); }
function heroBridge(O, o = {}) { const h = Bw.hero; const z = HZ(O); const walking = O < T2 + 2.9; const k = eIO(seg(O, PEEL, PEEL + 0.4));
  const arms = O < SLAP ? [[0.1, 0, 0.35, 1.5], [0.1, 0, -0.35, 1.5]] : O < PEEL ? [[-0.4, 0, 0.6, 1.2], [-0.4, 0, -0.6, 1.2]] : [[lerp(-2.3, -0.85, k), 0, 0.22, lerp(2.0, 1.15, k)], [lerp(-2.3, -0.85, k), 0, -0.22, lerp(2.0, 1.15, k)]];
  hp(h, O, [0.3, 0, z], 0, walking ? { ...walk(O, 8.5, 0.9), arms: [[0.1, 0, 0.35, 1.5], [0.1, 0, -0.35, 1.5]] } : { ...idle(O, 0), spineX: O < PEEL ? -0.12 : 0.02, headX: O > PEEL ? 0.12 : -0.1, arms }, o.expr || (O < SLAP ? 'worried' : 'shock')); }
coinInsert(T2, T2 + INS, 'heads');
shot(T2 + INS, SLAP, 'bridge', { ease: 'lin', p0: [0.95, 1.95, 11.5], p1: [0.9, 1.95, 10.6], l0: [0.15, 2.0, -12], fov: 19 }, (lt, O) => { bridgeBase(O); heroBridge(O); noteAt(O); }, { grade: 'bridge', mblur: 2 });
shot(SLAP, T2 + 3.95, 'bridge', { ease: 'out', p0: [0.75, 2.2, 3.4], p1: [0.6, 2.15, 2.9], l0: [0.3, 2.05, 0], fov: 38 }, (lt, O) => { bridgeBase(O); heroBridge(O); noteAt(O); }, { grade: 'bridge', shakeAt: [[SLAP, 0.03]] });
shot(T2 + 3.95, TL[3].t, 'bridge', { ease: 'lin', p0: [0.7, 2.15, 3.7], p1: [0.6, 2.1, 3.25], l0: [0.3, 1.9, 0], fov: 40 }, (lt, O) => { bridgeBase(O); heroBridge(O, { expr: O > T2 + 5.0 ? 'smile' : 'shock' }); noteAt(O); }, { grade: 'bridge', dof: 0.15 });
// ===== DAY 3: rush hour. Every pedestrian light turns green as he walks up; the cars stack up honking =====
const J = S.junction; const T3 = tS(3);
const JZ = (O) => lerp(2.5, -9.0, seg(O, T3 + 0.75, T3 + 7.0));
function junctionBase(O) { const j = J; resetRig(j.hero); resetRig(j.driver);
  j.signals.forEach((pair, k) => { const on = O > T3 + 1.0 + k * 0.38; pair.forEach(s => s.setGreen(on)); });
  j.cars.forEach((c, i) => { c.position.y = 0.012 * Math.sin(O * 9 + i); });
  j.peds.forEach((P, i) => { resetRig(P); const x = i === 0 ? -3.4 : 3.5 + i * 0.4, z = -12 - i * 7 + ((O * 1.4 + i * 2) % 3); hp(P, O, [x, 0.18, z], i === 0 ? 0.1 : Math.PI, walk(O + i, 8.5, 0.9), 'calm', 'x'); });
  const dk = eOut(seg(O, T3 + 2.9, T3 + 3.3)); hp(j.driver, O, [5.6, 0.62 + 0.35 * dk, -5.85], -Math.PI / 2 - 0.25, { ...idle(O, 2), spineX: -0.05, arms: [[-2.5 + 0.25 * Math.sin(O * 14), 0, 0.5, 1.6], [-0.4, 0, -0.5, 0.6]] }, 'grit', 'driver'); }
function heroStroll(O) { hp(J.hero, O, [0.15, 0.16, JZ(O)], Math.PI, { ...walk(O, 6.5, 0.7), arms: [[0.15, 0, 0.42, 1.65], [0.15, 0, -0.42, 1.65]], headY: 0.15 * Math.sin(O * 0.8) }, 'smirk'); }
coinInsert(T3, T3 + INS, 'heads');
shot(T3 + INS, T3 + 3.0, 'junction', { ease: 'lin', p0: [3.2, 8.8, 11.5], p1: [2.8, 8.2, 9.0], l0: [0, 0, -20], fov: 46 }, (lt, O) => { junctionBase(O); heroStroll(O); }, { grade: 'street' });
shot(T3 + 3.0, T3 + 4.6, 'junction', { ease: 'lin', p0: [1.2, 1.75, -1.2], p1: [1.5, 1.8, -1.6], l0: [5.4, 2.4, -5.85], fov: 42 }, (lt, O) => { junctionBase(O); heroStroll(O); }, { grade: 'street', dof: 0.12 });
shot(T3 + 4.6, TL[5].t, 'junction', { ease: 'lin', pf: (O) => V([-0.5, 1.8, JZ(O) - 4.4]), lf: (O) => V([0.15, 1.8, JZ(O)]), fov: 44 }, (lt, O) => { junctionBase(O); heroStroll(O); }, { grade: 'street', dof: 0.12 });
// ===== DAY 5: the claw machine. One coin; the claw lifts the whole pile; the teddies bury him; the kid is outraged =====
const A = S.arcade; const T5 = tS(5), DOWN = [T5 + 0.95, T5 + 1.85], GRIP = T5 + 2.1, UP = [T5 + 2.6, T5 + 3.3], POP = T5 + 3.35;
const HA = V([0.3, 0, 1.95]);
const mound = (() => { const r = rnd(5); return A.bears.map((b, i) => { const layer = Math.floor(i / 12), a = i * 2.39 + layer, rad = 0.75 - layer * 0.12 + r() * 0.2; return V([HA.x + Math.cos(a) * rad, 0.25 + layer * 0.36 + r() * 0.1, HA.z + Math.sin(a) * rad * 0.9]); }); })();
function arcadeBase(O, o = {}) { const a = A; resetRig(a.hero); resetRig(a.kid); resetRig(a.mum); const cm = a.cm; const sh = O > UP[0] && O < POP + 0.4 ? 0.03 * Math.sin(O * 70) : 0; cm.position.set(sh, 0, 0); cm.rotation.z = sh * 0.5;
  const cy = O < DOWN[0] ? 2.45 : O < DOWN[1] ? lerp(2.45, 1.45, eIO(seg(O, DOWN[0], DOWN[1]))) : O < UP[0] ? 1.45 : lerp(1.45, 2.3, eIO(seg(O, UP[0], UP[1]))); cm.claw.position.y = cy;
  const close = eOut(seg(O, DOWN[1], GRIP)); cm.claw.prongs.forEach(p => p.rotation.z = lerp(0.45, -0.1, close));
  cm.door.rotation.y = -1.7 * elastic(seg(O, POP, POP + 0.6));
  const rr2 = rnd(77); a.bears.forEach((b, i) => { const p0 = a.pile[i]; const clump = V([(rr2() - 0.5) * 0.55, -0.25 - (i % 8) * 0.07, (rr2() - 0.5) * 0.55]);
    const tStart = POP + 0.05 + i * 0.045, fly = seg(O, tStart, tStart + 0.65);
    if (O < UP[0]) { b.position.copy(p0); b.rotation.set(0, i, 0); }
    else if (O < tStart) { const k = eIO(seg(O, UP[0], UP[0] + 0.3)); b.position.copy(p0.clone().lerp(V([0, cy, 0]).add(clump), k)); b.rotation.set(0.3 * k, i, 0.2 * k); }
    else { const from = V([0, cy, 0]).add(clump), to = mound[i]; b.position.copy(from.clone().lerp(to, eOut(fly))).add(V([0, 1.2 * Math.sin(fly * Math.PI), 0])); b.rotation.set(fly * 6 + i, i + fly * 3, fly * 4); if (fly >= 1) b.rotation.set(0.2 * Math.sin(i), i, 0.2 * Math.cos(i)); } });
  const buried = seg(O, POP + 0.3, POP + 2.4);
  hp(a.hero, O, [HA.x, 0, HA.z], lerp(Math.PI, Math.PI * 2 - 0.6, eIO(seg(O, POP + 0.05, POP + 0.5))), O < POP ? { ...idle(O, 0), headX: -0.15, arms: [[-0.5, 0, 0.2, 1.2], [-0.5, 0, -0.2, 1.2]] } : { ...idle(O, 0), spineX: -0.1 - 0.1 * Math.sin(O * 9), headX: -0.15, arms: [[-2.4 + 0.3 * buried, 0, 0.6, 0.5], [-2.4 + 0.3 * buried, 0, -0.6, 0.5]] }, O < POP ? 'calm' : 'laugh');
  const kidPoint = O > T5 + 7.8; hp(a.kid, O, [1.95, 0, 2.75], -Math.PI / 2 - 0.5, { ...idle(O, 4), arms: [[0, 0, 0.13, 0.15], kidPoint ? [-1.5, 0.2, -0.2, 0.1] : [0, 0, -0.13, 0.15]], bob: kidPoint ? Math.abs(Math.sin(O * 8)) * 0.05 : 0 }, kidPoint ? 'grit' : (O > POP ? 'shock' : 'calm'), 'kid');
  hp(a.mum, O, [3.4, 0, 3.6], -2.4, idle(O, 5), O > POP ? 'shock' : 'calm', 'x'); }
coinInsert(T5, T5 + INS, 'heads');
shot(T5 + INS, T5 + 2.45, 'arcade', { ease: 'lin', p0: [0.5, 1.78, 0.55], p1: [0.45, 1.72, 0.48], l0: [0, 2.7, 0], fov: 64, shift: 0 }, (lt, O) => { arcadeBase(O); }, { grade: 'arcade' });
shot(T5 + 2.45, POP + 0.2, 'arcade', { ease: 'lin', p0: [3.4, 2.1, 2.6], p1: [3.1, 2.05, 2.3], l0: [0, 1.75, 0.2], fov: 44 }, (lt, O) => { arcadeBase(O); }, { grade: 'arcade', shakeAt: [[UP[0], 0.01], [POP, 0.025]] });
shot(POP + 0.2, T5 + 7.85, 'arcade', { ease: 'lin', p0: [-2.9, 2.3, 6.2], p1: [-2.4, 2.15, 5.4], l0: [0.4, 1.35, 1.6], fov: 48 }, (lt, O) => { arcadeBase(O); }, { grade: 'arcade', mblur: (O) => (O < POP + 2.2 ? 2 : 1) });
shot(T5 + 7.85, TL[7].t, 'arcade', { ease: 'lin', p0: [-1.5, 2.15, 5.7], p1: [-1.35, 2.1, 5.3], l0: [0.9, 1.95, 2.2], fov: 46 }, (lt, O) => { arcadeBase(O); }, { grade: 'arcade', dof: 0.12 });
