const topOf = (m) => { m.updateWorldMatrix(true, false); const b = new THREE.Box3().setFromObject(m); return V([(b.min.x + b.max.x) / 2, b.max.y, (b.min.z + b.max.z) / 2]); };   // props rest ON a surface, never in it
// ===== shared: the coin-flip insert that opens every day (same framing every time: the signature) =====
const DAYS = [1, 2, 3, 5, 7, 9, 13, 20, 23, 26, 'END'];
const INS = 0.75, LAND = 0.33, BONK = [0.17, 0.3, 0.52];   // Day 1: on the hand, up into his forehead, back down tails
function coinInsert(t0, t1, mode, camO = {}) {   // the hero flicks the coin with his right thumb; it lands on the back of his outstretched left hand; his face reacts
  shot(t0, t1, 'hand', { ease: camO.ease || 'lin', p0: camO.p0 || [-1.25, 2.3, 3.35], p1: camO.p1 || [-1.12, 2.25, 3.0], l0: camO.l || [-0.3, 1.95, 0.45], fov: 40 }, (lt, O) => {
    const H = S.hand, h = H.hero, c = H.coin, dt = O - t0; resetRig(h); const flick = eOut(clamp(dt / 0.12)); const react = dt > LAND + 0.08;
    const bonked = mode === 'tails' && dt > BONK[1] - 0.02; const expr = mode === 'tails' ? (bonked ? (dt < BONK[2] + 0.05 ? 'shock' : 'worried') : 'calm') : !react ? 'calm' : mode === 'edge' ? 'shock' : 'smile';
    hp(h, O, [0, 0, 0], 0, { ...idle(O, 0), headX: 0.28 - (mode === 'tails' ? 0.3 * Math.exp(-Math.max(0, dt - BONK[1]) * 8) * (dt > BONK[1] ? 1 : 0) : 0), headY: 0.12, arms: [[-1.2, 0, 0.1, 0.35], [-0.95 - 0.45 * flick, 0.2, -0.1, 1.3 - 0.7 * flick]] }, expr, 'x');
    h.root.updateMatrixWorld(true);
    const top = topOf(h.arms[0].el.children[1]).add(V([0, 0.0115, 0]));   // the coin rests ON the back of the hand
    const start = h.arms[1].el.localToWorld(V([0, -0.5, 0.15])); const fin = mode === 'tails' ? Math.PI : mode === 'edge' ? Math.PI / 2 : 0;
    const brow = h.head.localToWorld(V([0, 0.5, 0.3 + 0.2]));   // just in front of his forehead (the coin's rim touches it)
    if (mode === 'tails' && dt < BONK[2]) { if (dt < BONK[0]) { const u = dt / BONK[0]; c.position.copy(start.clone().lerp(top, u)).add(V([0, 1.0 * 4 * u * (1 - u), 0])); }
      else if (dt < BONK[1]) { const u = (dt - BONK[0]) / (BONK[1] - BONK[0]); c.position.copy(top.clone().lerp(brow, eOut(u))); }
      else { const u = (dt - BONK[1]) / (BONK[2] - BONK[1]); c.position.copy(brow.clone().lerp(top, eIn(u))).add(V([0, 0.25 * Math.sin(u * Math.PI) + 0.1 * (1 - u), 0])); c.rotation.set(Math.PI + (1 - u) * (1 - u) * 12, 0.3, 0); }
      if (dt < BONK[1]) c.rotation.set(dt * 30, 0.3, 0); }
    else if (mode !== 'tails' && dt < LAND) { const u = dt / LAND; c.position.copy(start.clone().lerp(top, u)).add(V([0, 1.3 * 4 * u * (1 - u), 0])); c.rotation.set(fin + (1 - u) * 26, 0.3, 0); }
    else { const b = dt - LAND; const hop = mode === 'edge' ? 0 : Math.max(0, Math.sin(Math.min(1, b / 0.14) * Math.PI)) * 0.05 * Math.exp(-b * 6); const wob = mode === 'edge' ? 0.3 * Math.exp(-b * 2.2) * Math.sin(b * 16) : 0;
      c.position.copy(top).add(V([0, hop + (mode === 'edge' ? 0.13 * Math.cos(wob) - 0.0115 : 0), 0])); c.rotation.set(fin, 0.3, wob); }
    const sp = mode === 'heads' && dt >= LAND ? clamp(1 - (dt - LAND) / 0.4) : 0; H.spark.visible = sp > 0; H.spark.position.copy(top).add(V([0.08, 0.06, 0.05])); H.spark.scale.setScalar(0.15 + 0.9 * sp * (1 - sp) * 2); H.spark.material.opacity = sp;
  }, { grade: 'coin', live: 0.3, hideDiary: true, dof: 0.1, mblur: (O) => (O - t0 < LAND ? 3 : 1) });
}
// ===== TITLE + DAY 1: the bakery =====
const B = S.bakery; const QM = V([1.15, 0, 1.2]), QH = V([-0.35, 0, 1.3]);   // side by side at the counter, 1.2 apart; the last roll between them
function bakeryBase(O, o = {}) { const b = B; [b.hero, b.marcus, b.baker].forEach(P => { resetRig(P); P.root.visible = false; }); b.extras.forEach((P, i) => { resetRig(P); hp(P, O, i ? [6.0, 0, 3.0] : [5.0, 0, 4.4], i ? -2.4 : 0.8, { ...idle(O, i * 2), arms: [[-0.5, 0, 0.13, 1.4], [0, 0, -0.13, 0.15]] }, 'smile', 'x'); });
  b.roll.visible = true; b.roll.position.set(0.45, 1.25, 0.25); b.roll.rotation.set(0, 0, 0); b.price.visible = !!o.price; [b.toast, b.toast2, b.plate, b.splat, b.splat2, ...b.crumbs].forEach(m => m.visible = false); b.coins.forEach(c => c.visible = false); b.spin.visible = false; b.wallet.visible = false; b.moths.forEach(m => m.visible = false);
  b.marcus.sponge.visible = b.marcus.ticket.visible = false; b.marcus.state(O, o.wet || 0, o.soot || 0);
  [b.win, b.win2].forEach(w => { w.rain.offset.y = O * 0.6; w.rain.offset.x = Math.sin(O * 0.3) * 0.02; });
  hp(b.baker, O, [O < 5.2 ? -1.0 : 0.6, 0, -1.05], 0, { ...idle(O, 1), arms: [[-0.4, 0, 0.15, 1.3], [-0.4, 0, -0.15, 1.3]] }, 'calm', 'baker'); }
const GRAB = 1.0, TURN = [1.25, 1.75], BITE = 2.0;
function marcusTitle(O) { const m = B.marcus; const reach = eIO(seg(O, 0.3, GRAB)), lift = eIO(seg(O, GRAB, BITE)), low = eIO(seg(O, BITE + 0.35, BITE + 0.8)), turn = eIO(seg(O, TURN[0], TURN[1]));
  const armR = O < GRAB ? [lerp(-0.1, -1.3, reach), lerp(0, 0.35, reach), lerp(-0.1, 0.25, reach), lerp(0.15, 0.3, reach)] : [lerp(lerp(-1.3, -1.25, lift), -0.35, low), 0, lerp(0.25, -0.3, lift) * (1 - low), lerp(lerp(0.3, 2.05, lift), 1.3, low)];
  hp(m, O, [QM.x, 0, QM.z], lerp(Math.PI, Math.PI * 1.5, turn), { ...idle(O, 3), spineX: 0.25 * reach * (1 - lift), arms: [[0, 0, 0.13, 0.15], armR] }, O > BITE + 0.6 ? 'smirk' : O > BITE - 0.1 ? 'sniff' : 'calm', 'marcus');
  if (O >= GRAB) { const h = m.arms[1].el; B.roll.position.copy(h.localToWorld(V([0, -0.46, 0.06]))); B.roll.rotation.set(0, lerp(Math.PI, Math.PI * 1.5, turn) + Math.PI / 2, 0.2); }
  B.crumbs.forEach((c, i) => { const t0 = BITE + 0.02 + i * 0.03, f = seg(O, t0, t0 + 0.45); c.visible = O > t0; if (!c.visible) return; const mouth = m.head.localToWorld(V([0.05 * (i % 3 - 1), 0.15, 0.36])), land = B.hero.spine.localToWorld(V([-0.2 + 0.05 * i, 0.3 + 0.04 * (i % 4), 0.255]));
    c.position.copy(f < 1 ? mouth.lerp(land, f).add(V([0, 0.25 * Math.sin(f * Math.PI), 0])) : land); c.rotation.set(i, O * 9 * (1 - f), i); }); }
function heroQueue(O, expr = 'worried') { const reach = eIO(seg(O, 0.45, 1.15)), back = eIO(seg(O, 1.45, 1.9)), turn = eIO(seg(O, 1.55, 2.05));   // reaches a beat too late, closes on air, turns to see Marcus biting it
  hp(B.hero, O, [QH.x, 0, QH.z], lerp(Math.PI, Math.PI / 2, turn), { ...idle(O, 0), spineX: 0.2 * reach * (1 - back), headX: 0.12, arms: [[lerp(lerp(0.05, -1.25, reach), 0.05, back), lerp(0, 0.3, reach) * (1 - back), lerp(0.13, -0.2, reach * (1 - back)), lerp(0.25, O > 1.2 && O < 1.5 ? 0.7 : 0.3, reach) ], [0.05, 0, -0.13, 0.25]] }, O < 1.2 ? 'calm' : O < 2.1 ? 'shock' : expr, 'vo'); }
shot(0, 1.6, 'bakery', { ease: 'lin', p0: [0.6, 1.42, -1.2], p1: [0.55, 1.44, -1.0], l0: [0.55, 1.55, 2.6], fov: 50, shift: 0.02 }, (lt, O) => { bakeryBase(O); marcusTitle(O); heroQueue(O); }, { grade: 'bakery', dof: 0.12 });
shot(1.6, TL[1].t, 'bakery', { ease: 'lin', p0: [0.6, 2.1, 7.0], p1: [0.58, 2.08, 6.6], l0: [0.55, 1.85, 1.25], fov: 40 }, (lt, O) => { bakeryBase(O); marcusTitle(O); heroQueue(O, O > 3.9 ? 'worried' : 'calm'); }, { grade: 'bakery', dof: 0.12 });
// DAY 1: tails. At the window table: the toast slides off, flips, lands butter-down on his white trainer
const T1 = tS(1), TSLIDE = T1 + 2.0, TLAND = T1 + 2.75, STEP = [T1 + 2.95, T1 + 3.15], TSLIDE2 = T1 + 3.15, TLAND2 = T1 + 3.65;
const HS = V([-4.6, 0, 4.7]);   // he stands by the rainy window eating toast off a plate, facing +x
function heroToast(O, expr = 'worried') { const h = B.hero; const look = O > TSLIDE && O < TLAND2 + 0.6; const st = eIO(seg(O, STEP[0], STEP[1]));
  hp(h, O, [HS.x - 0.25 * st, 0, HS.z], Math.PI / 2, { ...idle(O, 1), headX: look ? 0.5 : 0.1, headY: look ? (O > TLAND + 0.3 ? -0.25 : 0.25) : 0, arms: [[-0.95, 0.15, 0.12, 1.35], [0.05, 0, -0.13, 0.2]], ...(st > 0 && st < 1 ? { legs: [[0.25 * Math.sin(st * Math.PI), 0.3 * Math.sin(st * Math.PI)], [0, 0]] } : {}) }, expr); return h; }
const plateAt = () => topOf(B.hero.arms[0].el.children[1]).add(V([0, 0.022, 0]));
const shoeAt = (L = 0) => { const k = B.hero.legs[L].knee; const p = k.localToWorld(V([0, -0.42, 0.32])); p.y = topOf(k.children[1]).y - 0.01; return p; };   // on the toe, clear of the shin
function slice(t, splat, O, slide, land, L, stackY) { const pl = plateAt(); t.visible = true;
  const on = pl.clone().add(V([0, 0.048 + stackY, 0])), edge = pl.clone().add(V([0.3, 0.048, 0]));
  if (O < slide) { t.position.copy(on); t.rotation.set(0, 0.2, 0); return; }
  const s2 = eIn(seg(O, slide, slide + 0.3)); if (O < slide + 0.3) { t.position.copy(on.clone().lerp(edge, s2)); t.rotation.set(0, 0.2, 0); return; }
  const shoe = shoeAt(L).add(V([0, 0.06, 0])); if (O >= land) { t.position.copy(shoe); t.rotation.set(Math.PI, 0.2, 0); splat.visible = true; splat.position.copy(shoe.clone().add(V([0, -0.035, 0]))); return; }
  // off the plate, out over the toe, then straight down onto it
  const u = seg(O, slide + 0.3, land), above = shoe.clone().add(V([0, 0.35, 0])); t.position.copy(u < 0.6 ? edge.clone().lerp(above, eOut(u / 0.6)) : above.lerp(shoe, eIn((u - 0.6) / 0.4))); t.rotation.set(Math.PI * u, 0.2, 0.4 * u); }
function toastAt(O) { B.plate.visible = true; B.plate.position.copy(plateAt()); B.plate.rotation.set(0, 0, 0);
  slice(B.toast, B.splat, O, TSLIDE, TLAND, 0, 0); slice(B.toast2, B.splat2, O, TSLIDE2, TLAND2, 1, O < TSLIDE + 0.36 ? 0.085 : 0); }
coinInsert(T1, T1 + INS, 'tails');
shot(T1 + INS, TSLIDE + 0.15, 'bakery', { ease: 'lin', p0: [-1.3, 2.0, 6.3], p1: [-1.5, 1.98, 6.1], l0: [-4.6, 1.5, 4.7], fov: 42 }, (lt, O) => { bakeryBase(O); heroToast(O); toastAt(O); }, { grade: 'bakery', dof: 0.12 });
shot(TSLIDE + 0.15, TLAND + 0.25, 'bakery', { ease: 'lin', p0: [-4.4, 1.35, 7.8], p1: [-4.4, 1.3, 7.6], l0: [-4.6, 1.25, 4.7], fov: 66 }, (lt, O) => { bakeryBase(O); heroToast(O, O > TLAND ? 'shock' : 'worried'); toastAt(O); }, { grade: 'bakery', mblur: (O) => (O > TSLIDE + 0.25 && O < TLAND ? 3 : 1), shakeAt: [[TLAND, 0.01]] });
shot(TLAND + 0.25, T1 + 3.95, 'bakery', { ease: 'lin', p0: [-3.2, 0.95, 4.72], p1: [-3.3, 0.9, 4.7], l0: [-4.55, 0.2, 4.7], fov: 50 }, (lt, O) => { bakeryBase(O); heroToast(O, 'shock'); toastAt(O); }, { grade: 'bakery' });
shot(T1 + 3.95, TL[2].t, 'bakery', { ease: 'lin', p0: [-1.75, 2.0, 4.4], p1: [-1.95, 1.98, 4.45], l0: [-4.6, 1.88, 4.7], fov: 40 }, (lt, O) => { bakeryBase(O); heroToast(O, 'worried'); toastAt(O); }, { grade: 'bakery', dof: 0.2 });
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
const HOOD = T2 + 1.35;
function heroBridge(O, o = {}) { const h = Bw.hero; const hk = seg(O, HOOD, HOOD + 0.45); Bw.hood.visible = O > HOOD; Bw.hood.rotation.x = -2.2 * (1 - eOut(hk)); const z = HZ(O); const walking = O < T2 + 2.9; const k = eIO(seg(O, PEEL, PEEL + 0.4));
  const arms = O < SLAP ? [[0.1, 0, 0.35, 1.5], [0.1, 0, -0.35, 1.5]] : O < PEEL ? [[-0.4, 0, 0.6, 1.2], [-0.4, 0, -0.6, 1.2]] : [[lerp(-2.3, -0.85, k), 0, 0.22, lerp(2.0, 1.15, k)], [lerp(-2.3, -0.85, k), 0, -0.22, lerp(2.0, 1.15, k)]];
  hp(h, O, [0.3, 0, z], 0, walking ? { ...walk(O, 8.5, 0.9), arms: [[0.1, 0, 0.35, 1.5], [0.1, 0, -0.35, 1.5]] } : { ...idle(O, 0), spineX: O < PEEL ? -0.12 : 0.02, headX: O > PEEL ? 0.12 : -0.1, arms }, o.expr || (O < SLAP ? (O > HOOD + 0.35 ? 'smirk' : 'worried') : 'shock')); }
coinInsert(T2, T2 + INS, 'heads');
shot(T2 + INS, SLAP, 'bridge', { ease: 'lin', p0: [0.95, 1.95, 11.5], p1: [0.9, 1.95, 10.6], l0: [0.15, 2.0, -12], fov: 19 }, (lt, O) => { bridgeBase(O); heroBridge(O); noteAt(O); }, { grade: 'bridge', mblur: 2 });
shot(SLAP, T2 + 3.95, 'bridge', { ease: 'out', p0: [0.75, 2.2, 3.4], p1: [0.6, 2.15, 2.9], l0: [0.3, 2.05, 0], fov: 38 }, (lt, O) => { bridgeBase(O); heroBridge(O); noteAt(O); }, { grade: 'bridge', shakeAt: [[SLAP, 0.03]] });
shot(T2 + 3.95, TL[3].t, 'bridge', { ease: 'lin', p0: [0.7, 2.15, 3.7], p1: [0.6, 2.1, 3.25], l0: [0.3, 1.9, 0], fov: 40 }, (lt, O) => { bridgeBase(O); heroBridge(O, { expr: O > T2 + 5.0 ? 'smile' : 'shock' }); noteAt(O); }, { grade: 'bridge', dof: 0.15 });
// ===== DAY 3: rush hour. Every pedestrian light turns green as he walks up; the cars stack up honking =====
const J = S.junction; const T3 = tS(3);
const JZ = (O) => lerp(2.5, -9.0, seg(O, T3 + 0.75, T3 + 7.0)); const DSLAM = T3 + 4.25, BTN = T3 + 6.05;   // the door locks him out; the button presses itself on the word 'button'
function junctionBase(O) { const j = J; resetRig(j.hero); resetRig(j.driver);
  j.signals.forEach((pair, k) => { const on = O > T3 + 1.0 + k * 0.38; pair.forEach(s => s.setGreen(on)); });
  j.cars.forEach((c, i) => { c.position.y = 0.012 * Math.sin(O * 9 + i); });
  j.peds.forEach((P, i) => { resetRig(P); const x = i === 0 ? -2.8 : 2.8, z = -12 - i * 7 + ((O * 1.4 + i * 2) % 3); hp(P, O, [x, 0.16, z], i === 0 ? 0 : Math.PI, walk(O + i, 8.5, 0.9), 'calm', 'x'); });
  const slam = O > DSLAM; hp(j.driver, O, [6.1, 0, -3.85], slam ? -Math.PI / 2 + 0.9 * eOut(seg(O, DSLAM + 0.1, DSLAM + 0.4)) : -Math.PI / 2 - 0.35, { ...idle(O, 2), spineX: -0.05, arms: slam ? [[-0.6, 0, 0.9, 1.4], [-0.6, 0, -0.9, 1.4]] : [[-2.5 + 0.25 * Math.sin(O * 14), 0, 0.5, 1.6], [-0.4, 0, -0.5, 0.6]] }, slam ? 'shock' : 'grit', 'driver');
  const dc = j.cars[4]; dc.door.rotation.y = O < DSLAM ? -0.8 : -0.8 * (1 - eIn(seg(O, DSLAM, DSLAM + 0.18))); const flash = O > DSLAM + 0.2 && Math.floor(O * 4) % 2 === 0;
  dc.traverse(m => { if (m.isMesh && m.material.emissive && m.material.emissiveIntensity > 0.5) m.material.emissiveIntensity = flash ? 3 : 1.5; });
  j.signals.forEach((pair, k) => pair.forEach(sg => sg.press(k === 1 ? eOut(seg(O, BTN, BTN + 0.12)) * (1 - eIn(seg(O, BTN + 0.4, BTN + 0.55))) : 0, k === 1 && O > BTN + 0.05 ? 1 : 0))); }
function heroStroll(O) { hp(J.hero, O, [0.15, 0.16, JZ(O)], Math.PI, { ...walk(O, 6.5, 0.7), arms: [[0.15, 0, 0.42, 1.65], [0.15, 0, -0.42, 1.65]], headY: 0.15 * Math.sin(O * 0.8) }, 'smirk'); }
coinInsert(T3, T3 + INS, 'heads');
shot(T3 + INS, T3 + 3.0, 'junction', { ease: 'lin', p0: [3.2, 8.8, 11.5], p1: [2.8, 8.2, 9.0], l0: [0, 0, -20], fov: 46 }, (lt, O) => { junctionBase(O); heroStroll(O); }, { grade: 'street' });
shot(T3 + 3.0, T3 + 4.6, 'junction', { ease: 'lin', p0: [2.1, 1.85, 0.4], p1: [2.35, 1.85, 0.1], l0: [5.6, 1.6, -4.1], fov: 44 }, (lt, O) => { junctionBase(O); heroStroll(O); }, { grade: 'street', dof: 0.12 });
shot(T3 + 4.6, BTN - 0.2, 'junction', { ease: 'lin', pf: (O) => V([-0.5, 1.8, JZ(O) - 4.4]), lf: (O) => V([0.15, 1.8, JZ(O)]), fov: 44 }, (lt, O) => { junctionBase(O); heroStroll(O); }, { grade: 'street', dof: 0.12 });
shot(BTN - 0.2, BTN + 0.55, 'junction', { ease: 'lin', p0: [-1.62, 1.3, -10.95], p1: [-1.66, 1.28, -11.15], l0: [-1.9, 1.32, -12.0], fov: 40 }, (lt, O) => { junctionBase(O); heroStroll(O); }, { grade: 'street', dof: 0.15 });
shot(BTN + 0.55, TL[5].t, 'junction', { ease: 'lin', pf: (O) => V([-0.5, 1.8, JZ(O) - 4.4]), lf: (O) => V([0.15, 1.8, JZ(O)]), fov: 44 }, (lt, O) => { junctionBase(O); heroStroll(O); }, { grade: 'street', dof: 0.12 });
// ===== DAY 5: the claw machine. One coin; the claw lifts the whole pile; the teddies bury him; the kid is outraged =====
const A = S.arcade; const T5 = tS(5), DOWN = [T5 + 0.95, T5 + 1.85], GRIP = T5 + 2.1, UP = [T5 + 2.6, T5 + 3.3], POP = T5 + 3.35;
const HA = V([0.3, 0, 2.45]);   // far enough from the door that the teddies can get out
// the avalanche: each teddy leaves the open door (straight out of its column), then a small physics simulation takes over:
// solid balls (r 0.23) with gravity, colliding with each other, the floor, the machine and the people (vertical cylinders). Computed once at load.
const XORD = (x) => [0, 3, 1, 4, 2][Math.round(x / 0.32) + 2];   // within a row, columns leave in the order 1,3,5,2,4
const NSTOCK = A.pile.length, NB = A.bears.length, CROWN = NB - 1, CROWN_T = [T5 + 5.6, T5 + 6.35], ARMS_DOWN = T5 + 5.3, SORRY = T5 + 4.7;   // the last teddy lands on his head like a crown
const EXIT = A.pile.map((p, i) => i).sort((a, b) => A.pile[b].y - A.pile[a].y || A.pile[b].z - A.pile[a].z || XORD(A.pile[a].x) - XORD(A.pile[b].x));
const LAUNCH = []; EXIT.forEach((bi, k) => { LAUNCH[bi] = POP + 0.12 + k * 0.06; });
const LIFT = 0.85, BR = 0.26, OUTT = 0.25, DOORZ = 0.9 + 0.26 + 0.01;
// the people as stacked cylinders (x, z, [[y0, y1, radius]]): legs, body, raised arms — teddies pile against them, never into them
const PEOPLE = [[HA.x, HA.z, [[0, 1.0, 0.42], [1.0, 1.6, 0.5], [1.6, 3.05, 0.68]]], [1.95, 3.25, [[0, 0.75, 0.44], [0.75, 1.35, 0.95], [1.35, 1.8, 0.44]]], [3.4, 4.1, [[0, 1.6, 0.5], [1.6, 3.15, 0.72]]]];   // the kid's pointing arm reaches ~0.9
const SIM = (() => { const dt = 1 / 240, T1 = POP + 7.6, rr = rnd(99); const P = [], Vv = [], act = [], tOn = [], frames = [];
  for (let i = 0; i < NB; i++) { if (i < NSTOCK) { const p0 = A.pile[i]; P.push(V([p0.x, p0.y + LIFT + 0.2, DOORZ])); tOn.push(LAUNCH[i] + OUTT); }
    else { P.push(V([(rr() - 0.5) * 1.2, 1.2 + rr() * 1.3, DOORZ])); tOn.push(POP + 0.12 + NSTOCK * 0.06 + 0.3 + (i - NSTOCK) * 0.028); }   // then the flood: out of the open door, ~35 a second
    const toMum = i >= NSTOCK && i % 2 === 0;   // half of the flood heads for the kid's mum
    Vv.push(toMum ? V([(3.4 - P[i].x) * 1.25 + (rr() - 0.5) * 0.6, 2.6 + rr() * 1.2, 3.6 + rr() * 0.8]) : V([(HA.x - P[i].x) * 0.7 + (rr() - 0.5) * 1.8, 2.2 + rr() * 2.2, 1.6 + rr() * 1.6])); act.push(false); }
  const free = (p) => P.every((q, j) => !act[j] || q.distanceTo(p) >= 2 * BR);
  let t = POP, nextF = POP;
  while (t < T1) { for (let i = 0; i < NB; i++) if (!act[i] && i !== CROWN && t >= tOn[i] && (i < NSTOCK || free(P[i]))) act[i] = true;   // a flood teddy only appears where there is room for it
    const prev = P.map(p => p.clone());
    for (let i = 0; i < NB; i++) if (act[i]) { Vv[i].y -= 9.8 * dt; P[i].addScaledVector(Vv[i], dt); }
    for (let it = 0; it < 5; it++) {
      for (let i = 0; i < NB; i++) { if (!act[i]) continue; const p = P[i]; if (p.y < BR) p.y = BR;
        for (const [cx, cz, segs] of PEOPLE) for (const [y0, y1, cr] of segs) { const dx = p.x - cx, dz = p.z - cz, d = Math.hypot(dx, dz), m = cr + BR; if (d < m && p.y > y0 - BR && p.y < y1 + BR) { if (p.y > y1 && y1 >= 1.5) p.y = y1 + BR; else { const k = (m - d) / (d || 1e-6); p.x += dx * k; p.z += dz * k; } } }
        const e = 0.9 + BR; if (Math.abs(p.x) < e && Math.abs(p.z) < e && p.y < 3.1 + BR) { const pen = [e - p.x, p.x + e, e - p.z, p.z + e, 3.1 + BR - p.y], m = pen.indexOf(Math.min(...pen)); if (m === 0) p.x = e; else if (m === 1) p.x = -e; else if (m === 2) p.z = e; else if (m === 3) p.z = -e; else p.y = 3.1 + BR; } }
      for (let i = 0; i < NB; i++) if (act[i]) for (let j = i + 1; j < NB; j++) if (act[j]) { const dx = P[j].x - P[i].x; if (dx > 2 * BR || dx < -2 * BR) continue; const d = P[i].distanceTo(P[j]); if (d < 2 * BR && d > 1e-6) { const n = P[j].clone().sub(P[i]).multiplyScalar((2 * BR - d) / d / 2); P[i].sub(n); P[j].add(n); } } }
    for (let i = 0; i < NB; i++) if (act[i]) { Vv[i] = P[i].clone().sub(prev[i]).divideScalar(dt); if (Vv[i].length() > 7) Vv[i].setLength(7);   // overlap pushes must not fling teddies into the sky
      if (P[i].y <= BR + 0.01) Vv[i].multiplyScalar(0.92); else Vv[i].multiplyScalar(0.998); }
    t += dt; while (nextF <= t) { frames.push({ p: P.map(p => p.clone()), a: act.slice() }); nextF += 1 / 30; } }
  return frames; })();
// resetRig() resets scale, so the kid is re-shrunk every frame
function arcadeBase(O, o = {}) { const a = A; resetRig(a.hero); resetRig(a.kid); a.kid.root.scale.setScalar(0.62); resetRig(a.mum); const cm = a.cm; const sh = O > UP[0] && O < POP + 0.4 ? 0.03 * Math.sin(O * 70) : 0; cm.position.set(sh, 0, 0); cm.rotation.z = 0;
  const cy = O < DOWN[0] ? 2.45 : O < DOWN[1] ? lerp(2.45, 1.45, eIO(seg(O, DOWN[0], DOWN[1]))) : O < UP[0] ? 1.45 : lerp(1.45, 2.3, eIO(seg(O, UP[0], UP[1]))); cm.claw.position.y = cy + 0.76;   // the claw stops on top of the stack (it never goes into it)
  const close = eOut(seg(O, DOWN[1] - 0.35, DOWN[1])); cm.claw.prongs.forEach(p => p.rotation.z = lerp(0.45, -0.1, close));
  cm.door.rotation.y = -1.7 * elastic(seg(O, POP, POP + 0.6)); cm.marquee.material.map = O > SORRY && (O > SORRY + 0.4 || Math.floor(O * 12) % 2) ? cm.sorry : cm.marquee.userData.claw || (cm.marquee.userData.claw = cm.marquee.material.map);
  const lift = cy - 1.45; const F = SIM[Math.min(SIM.length - 1, Math.max(0, Math.round((O - POP) * 30)))];
  a.bears.forEach((b, i) => { b.visible = true;
    if (i < NSTOCK) { const p0 = a.pile[i].clone().add(V([sh, O > UP[0] ? lift : 0, 0])); const t0 = LAUNCH[i];
      if (O < t0) { b.position.copy(p0); b.rotation.set(0, 0, 0); return; }
      if (O < POP || !F.a[i]) { b.position.copy(p0.clone().lerp(V([p0.x, p0.y, DOORZ]), eIn(clamp((O - t0) / OUTT)))); b.rotation.set(0, 0, 0); return; } }
    else if (i === CROWN) return;   // placed after the hero is posed (below)
    else if (O < POP || !F.a[i]) { b.visible = false; return; }
    const f = F.p[i]; b.position.set(f.x, f.y - 0.2, f.z); const air = clamp((f.y - BR) / 0.4); b.rotation.set(0, i * 0.9, 0.45 * air * Math.sin(O * 7 + i)); });
  const buried = seg(O, POP + 0.3, POP + 2.4);
  hp(a.hero, O, [HA.x, 0, HA.z], lerp(Math.PI, Math.PI * 2 - 0.6, eIO(seg(O, POP + 0.05, POP + 0.5))), O < POP ? { ...idle(O, 0), headX: -0.15, arms: [[-0.5, 0, 0.2, 1.2], [-0.5, 0, -0.2, 1.2]] } : { ...idle(O, 0), spineX: -0.02 - 0.02 * Math.sin(O * 9), headX: O > CROWN_T[1] ? 0.05 : -0.15, headY: 0, arms: O > ARMS_DOWN ? [[0.05, 0, 0.35, 0.3], [0.05, 0, -0.35, 0.3]] : [[-2.95 + 0.1 * Math.sin(O * 12), 0, 0.08, 0.15], [-2.95 + 0.1 * Math.cos(O * 12), 0, -0.08, 0.15]] }, O < POP ? 'calm' : 'laugh');
  const kidPoint = O > T5 + 7.8; hp(a.kid, O, [1.95, 0, 3.25], -Math.PI / 2 - 0.5, { ...idle(O, 4), arms: [[0, 0, 0.13, 0.15], kidPoint ? [-1.5, 0.2, -0.2, 0.1] : [0, 0, -0.13, 0.15]], bob: kidPoint ? Math.abs(Math.sin(O * 8)) * 0.05 : 0 }, kidPoint ? 'grit' : (O > POP ? 'shock' : 'calm'), 'kid');
  { const b = a.bears[CROWN]; b.visible = O > CROWN_T[0]; if (b.visible) { a.hero.root.updateMatrixWorld(true); const top = new THREE.Box3().setFromObject(a.hero.head).max.y + 0.004, hc = a.hero.head.localToWorld(V([0, 0.32, 0])), to = V([hc.x, top, hc.z]), from = V([0, 2.6, DOORZ]), u = seg(O, CROWN_T[0], CROWN_T[1]);
    b.position.copy(u < 1 ? from.lerp(to, eIO(u)).add(V([0, 1.4 * Math.sin(u * Math.PI), 0])) : to); b.rotation.set(0, a.hero.root.rotation.y + Math.PI * 2 * (1 - u), 0); } }
  hp(a.mum, O, [3.4, 0, 4.1], -2.4, { ...idle(O, 5), arms: O > POP + 3.4 ? [[-2.7, 0, 0.4, 0.3], [-2.7, 0, -0.4, 0.3]] : [[0, 0, 0.13, 0.15], [0, 0, -0.13, 0.15]] }, O > POP ? 'shock' : 'calm', 'x'); }
coinInsert(T5, T5 + INS, 'heads');
shot(T5 + INS, T5 + 2.45, 'arcade', { ease: 'lin', p0: [0.5, 1.78, 0.55], p1: [0.45, 1.72, 0.48], l0: [0, 2.7, 0], fov: 64, shift: 0 }, (lt, O) => { arcadeBase(O); }, { grade: 'arcade' });
shot(T5 + 2.45, POP + 0.2, 'arcade', { ease: 'lin', p0: [3.4, 2.1, 2.6], p1: [3.1, 2.05, 2.3], l0: [0, 1.75, 0.2], fov: 44 }, (lt, O) => { arcadeBase(O); }, { grade: 'arcade', shakeAt: [[UP[0], 0.01], [POP, 0.025]] });
shot(POP + 0.2, T5 + 7.85, 'arcade', { ease: 'lin', p0: [-2.9, 3.1, 7.4], p1: [-2.4, 3.0, 6.6], l0: [0.6, 2.45, 2.5], fov: 50 }, (lt, O) => { arcadeBase(O); }, { grade: 'arcade', mblur: (O) => (O < POP + 2.2 ? 2 : 1) });
shot(T5 + 7.85, TL[7].t, 'arcade', { ease: 'lin', p0: [-0.7, 3.2, 8.4], p1: [-0.6, 3.15, 8.0], l0: [1.0, 2.85, 2.9], fov: 46 }, (lt, O) => { arcadeBase(O); }, { grade: 'arcade', dof: 0.12 });
