// ===== DAY 7: Marcus's driveway. A bus hits the puddle; the wave bends around the hero and lands on Marcus =====
const Dv = S.drive; const T7 = tS(7), SPLASH = T7 + 1.55, HIT = T7 + 2.55;
const HD = V([-0.6, 0.18, 2.0]), MD = V([2.2, 0, -1.3]);
function driveBase(O, o = {}) { const d = Dv; resetRig(d.hero); resetRig(d.marcus); d.marcus.sponge.visible = d.marcus.ticket.visible = false;
  d.bus.visible = false; d.sheet.visible = false; d.spray.m.visible = false; d.met.visible = false; d.smoke.forEach(s => s.visible = false); d.flash.intensity = 0; d.debris.forEach(D => D.m.visible = false);
  d.car.scale.set(1, 1, 1); d.car.position.set(4, 0, -2.6); d.car.rotation.set(0, 0, 0); d.crowd.upd(O, { count: o.crowd ? 160 : 0 }); }
const dropRand = (() => { const r = rnd(17); return [...Array(420)].map(() => [r(), r(), r(), r()]); })();
function sprayAt(O) { const d = Dv; if (O < SPLASH - 0.05 || O > HIT + 0.9) return; d.spray.m.visible = true; const pud = V([-0.6, 0.1, 4.0]); const dir = MD.clone().sub(pud).setY(0).normalize(), perp = V([-dir.z, 0, dir.x]);
  for (let i = 0; i < 420; i++) { const [a, b, c, e] = dropRand[i]; const t0 = SPLASH + a * 0.25, u = (O - t0) / 1.0; let p, s = 1;
    if (u < 0) { d.spray.set(i, V([0, -10, 0]), 0.001); continue; }
    const side = i % 2 ? 1 : -1; const P0 = pud.clone().add(V([(b - 0.5) * 2.2, 0, (c - 0.5) * 0.9])); const P1 = HD.clone().add(V([0, 2.9 + e * 1.3, 0])).addScaledVector(perp, side * (0.85 + b * 0.7)); const P2 = V([MD.x + (b - 0.5) * 0.6, 1.5 + c * 0.8, MD.z + (e - 0.5) * 0.6]);
    if (u <= 1) { const k = u; p = P0.clone().multiplyScalar((1 - k) * (1 - k)).add(P1.clone().multiplyScalar(2 * k * (1 - k))).add(P2.clone().multiplyScalar(k * k)); s = 0.6 + 0.8 * Math.sin(k * Math.PI) + c * 0.4; }
    else { const f = u - 1; p = P2.clone().add(V([(b - 0.5) * 1.6 * f, -6 * f * f - 1.5 * f, (c - 0.5) * 1.6 * f])); s = Math.max(0.001, 1 - f * 2.2); if (p.y < 0.05) s = 0.001; }
    d.spray.set(i, p, s); } d.spray.done(); }
function busAt(O) { const k = seg(O, SPLASH - 1.0, SPLASH + 1.1); if (k <= 0 || k >= 1) return; Dv.bus.visible = true; Dv.bus.position.set(lerp(-16, 16, k), 0, 4.9); }
function marcusWash(O, o = {}) { const m = Dv.marcus; const wet = seg(O, HIT, HIT + 0.3); const hit = O > HIT; const turn = eIO(seg(O, T7 + 3.0, T7 + 3.5));
  m.sponge.visible = true; const circ = hit ? 0 : 1; const pose = hit ? { ...idle(O, 2), spineX: -0.15, arms: [[-0.5, 0, 0.9, 1.0], [-0.5, 0, -0.9, 1.0]], headX: 0.1 } : { ...idle(O, 2), spineX: 0.25, arms: [[0, 0, 0.13, 0.15], [-1.25 + 0.2 * Math.sin(O * 6) * circ, 0.3 * Math.cos(O * 6) * circ, -0.15, 0.5]] };
  const back = hit ? eOut(seg(O, HIT, HIT + 0.35)) * 0.35 : 0; hp(m, O, [MD.x - back, 0, MD.z + back * 0.4], lerp(Math.PI / 2, -0.7, turn), pose, hit ? (O > T7 + 3.6 ? 'worried' : 'shock') : 'smirk', 'marcus'); m.state(O, wet); }
function heroPass(O) { const h = Dv.hero; const x = O < T7 + 1.35 ? lerp(-3.6, HD.x, seg(O, T7 + 0.75, T7 + 1.35)) : O < T7 + 4.4 ? HD.x : lerp(HD.x, 3.4, seg(O, T7 + 4.4, T7 + 6.4)); const walking = O < T7 + 1.35 || O > T7 + 4.4;
  const look = O > SPLASH && O < HIT + 0.4; hp(h, O, [x, 0.18, HD.z], O < T7 + 3.0 || walking ? Math.PI / 2 : Math.PI / 2 - 0.9, walking ? { ...walk(O, 8, 0.9), arms: [[0.15, 0, 0.42, 1.65], [0.15, 0, -0.42, 1.65]] } : { ...idle(O, 0), headX: look ? -0.5 : 0, arms: [[0.15, 0, 0.42, 1.65], [0.15, 0, -0.42, 1.65]] }, look ? 'shock' : 'smirk'); }
coinInsert(T7, T7 + INS, 'heads');
shot(T7 + INS, T7 + 1.45, 'drive', { ease: 'lin', p0: [-2.4, 4.6, 10.8], p1: [-2.0, 4.4, 10.2], l0: [0.6, 1.3, 0.3], fov: 40 }, (lt, O) => { driveBase(O); heroPass(O); marcusWash(O); busAt(O); }, { grade: 'sunny' });
shot(T7 + 1.45, T7 + 3.05, 'drive', { ease: 'lin', p0: [-1.2, 7.6, 13.8], p1: [-1.0, 7.3, 13.2], l0: [0.9, 1.6, 0.4], fov: 40 }, (lt, O) => { driveBase(O); heroPass(O); marcusWash(O); busAt(O); sprayAt(O); }, { grade: 'sunny', mblur: 2, shakeAt: [[HIT, 0.015]] });
shot(T7 + 3.05, TL[9].t, 'drive', { ease: 'lin', p0: [-0.1, 1.95, 1.3], p1: [0.15, 1.95, 1.0], l0: [2.0, 2.0, -1.2], fov: 42 }, (lt, O) => { driveBase(O); heroPass(O); marcusWash(O); sprayAt(O); }, { grade: 'sunny', dof: 0.15 });
// ===== DAY 9: the racecourse (TV racing style). The favourite stops for a sandwich; the field piles up; NO CHANCE wins =====
const R = S.races; const T9 = tS(9), RACE0 = T9 + 3.85, STOPT = T9 + 5.05, STOPX = 46, PILE = T9 + 5.55;
const FAV = (O) => lerp(80, STOPX, eOut(seg(O, RACE0, STOPT)));
const LANE = [3.4, 1.6, -0.2, -2.0, 0.8];
function horseX(i, O) { if (i === 0) return FAV(O); const free = 80 + 2.5 + i * 2.6 - 24 * (O - RACE0); return Math.max(free, STOPX + 1.5 + i * 0.6); }
function racesBase(O, o = {}) { const r = R; [r.hero, r.marcus, r.fan, ...r.copiers].forEach(resetRig); r.marcus.ticket.visible = O < T9 + 7.8; r.halves.forEach(h => h.visible = false); r.dust.forEach(s => s.visible = false); r.crowd.upd(O, { cheer: O > T9 + 7.6, jump: O > T9 + 7.6 });
  r.horses.forEach((h, i) => { h.visible = !o.noHorses; const x = horseX(i, O); h.position.set(x, 0, LANE[i]); h.rotation.set(0, -Math.PI / 2, 0);
    if (i === 0) { if (O < STOPT) h.gallop(O * 15, 1); else { h.stand(O); h.neck.rotation.x = 0.55 + 0.08 * Math.sin(O * 10); h.position.z = LANE[0] + 0.6 * eOut(seg(O, STOPT, STOPT + 0.4)); } }
    else { const crash = seg(O, PILE + (i - 1) * 0.12, PILE + (i - 1) * 0.12 + 0.7); if (crash > 0) { h.gallop(O * 15, 1 - crash); h.rotation.set(0, -Math.PI / 2, (i % 2 ? 1 : -1) * 1.5 * eOut(crash)); h.position.y = Math.sin(crash * Math.PI) * 1.2; h.position.x -= 2.5 * crash; } else h.gallop(O * 15 + i, 1); } });
  r.pony.visible = !o.noHorses; r.pony.position.set(o.ponyX ?? 200, 0, 2.8); r.pony.gallop(O * 11, 0.8);
  hp(r.fan, O, [STOPX - 1.2, 0, 6.0], Math.PI, { ...idle(O, 3), arms: [[0, 0, 0.13, 0.15], [-1.4, 0, -0.1, 0.2]] }, O > STOPT ? 'shock' : 'smile', 'x'); r.sandwich.position.copy(r.fan.arms[1].el.localToWorld(V([0, -0.5, 0.1]))); r.sandwich.visible = O < STOPT + 0.9;
  for (let k = 0; k < 20; k++) { const s = r.dust[k], f = seg(O, PILE + k * 0.03, PILE + 1.4 + k * 0.03); if (f <= 0 || f >= 1) continue; s.visible = true; s.position.set(STOPX + 2 + Math.sin(k * 2.3) * 2.5 * f, 0.4 + f * 1.6, LANE[1] + Math.cos(k * 1.7) * 2.2); s.scale.setScalar(1 + f * 3); s.material.opacity = 0.7 * (1 - f); } }
function spectators(O) { const r = R; const win = O > T9 + 7.6; const jump = (ph) => win ? Math.abs(Math.sin(O * 8 + ph)) * 0.18 : 0;
  const slipArm = (ph, up) => up ? [-2.6 + 0.2 * Math.sin(O * 10 + ph), 0, -0.3, 0.3] : [-0.9, 0, -0.15, 0.9];
  hp(r.hero, O, [0, jump(0), 6.3], Math.PI, { ...idle(O, 0), arms: [win ? [-2.6, 0, 0.3, 0.3] : [0, 0, 0.13, 0.15], slipArm(0, win)] }, win ? 'laugh' : 'calm');
  const copy = O > T9 + 2.9; [[-0.9, 7.5], [0.55, 8.0], [-2.0, 8.0]].forEach(([x, z], i) => { const P = r.copiers[i]; hp(P, O, [x, jump(i + 1), z], Math.PI + (i === 2 ? -0.25 : 0.25) * (O < T9 + 3.8 ? 1 : 0), { ...idle(O, i + 2), arms: [[0, 0, 0.13, 0.15], slipArm(i, copy && (win || O < T9 + 3.9))] }, win ? 'laugh' : i === 0 && O > T9 + 1.1 ? 'smile' : 'calm', i === 0 ? 'racegoer' : 'x'); });
  const tear = O > T9 + 7.8; hp(r.marcus, O, [1.45, 0, 6.35], Math.PI - 0.2, { ...idle(O, 5), arms: [tear ? [-1.0, 0, 0.5, 1.3] : [0, 0, 0.13, 0.15], tear ? [-1.0, 0, -0.5, 1.3] : [-2.5 + 0.3 * Math.sin(O * 6), 0, -0.4, 0.3]] }, tear ? 'grit' : 'smirk', 'marcus');
  if (tear) { const k = seg(O, T9 + 7.8, T9 + 8.8); R.halves.forEach((h, i) => { h.visible = true; const hand = r.marcus.arms[i].el.localToWorld(V([0, -0.5, 0.1])); h.position.copy(hand).add(V([(i ? 1 : -1) * 0.5 * k, -1.2 * k * k, 0.4 * k])); h.rotation.set(k * 6, k * 4 * (i ? 1 : -1), 0); }); } }
coinInsert(T9, T9 + INS, 'heads');
shot(T9 + INS, RACE0, 'races', { ease: 'lin', p0: [0.45, 2.15, 1.3], p1: [0.35, 2.15, 1.7], l0: [0.1, 1.95, 7.0], fov: 52 }, (lt, O) => { racesBase(O, { noHorses: true }); spectators(O); }, { grade: 'races', dof: 0.12 });
shot(RACE0, T9 + 5.25, 'races', { ease: 'lin', pf: (O) => V([FAV(O) + 5, 2.4, -13]), lf: (O) => V([FAV(O) + 1, 1.6, 2.2]), fov: 26 }, (lt, O) => { racesBase(O, { ponyX: 120 - 18 * (O - RACE0) }); spectators(O); }, { grade: 'races', race: 1, mblur: 2 });
shot(T9 + 5.25, T9 + 6.65, 'races', { ease: 'lin', p0: [STOPX - 8, 2.0, -2.5], p1: [STOPX - 7.5, 2.1, -2.2], l0: [STOPX + 2, 1.6, 2.6], fov: 44 }, (lt, O) => { racesBase(O, { ponyX: lerp(STOPX + 16, STOPX - 4, seg(O, T9 + 5.7, T9 + 6.65)) }); spectators(O); }, { grade: 'races', race: 1, shakeAt: [[PILE + 0.2, 0.02]] });
shot(T9 + 6.65, T9 + 7.6, 'races', { ease: 'lin', p0: [-9.5, 1.0, 1.2], p1: [-9.3, 1.0, 1.4], l0: [-5.3, 1.0, 2.8], fov: 38 }, (lt, O) => { racesBase(O, { noHorses: false, ponyX: lerp(0.0, -7.9, seg(O, T9 + 6.65, T9 + 7.6)) }); R.horses.forEach(h => h.visible = false); spectators(O); }, { grade: 'races', race: 2 });
shot(T9 + 7.6, TL[13].t, 'races', { ease: 'lin', p0: [0.7, 2.15, 0.9], p1: [0.5, 2.1, 1.3], l0: [0.0, 1.9, 7.0], fov: 54 }, (lt, O) => { racesBase(O, { noHorses: true }); spectators(O); }, { grade: 'races' });
// ===== DAY 13: the pause. The coin lands on its edge and stays there. The launderette at night =====
const L = S.laundrette; const T13 = tS(13), EDGE_END = T13 + 2.7;
coinInsert(T13, EDGE_END, 'edge', { p1: [1.1, 0.95, 2.2], l: [0.05, 0.25, 0.1], ease: 'lin' });
function laundretteBase(O) { const l = L; resetRig(l.hero); l.drums.forEach((d, i) => { d.material.map.rotation = O * (2 + i * 0.3); }); l.tubes[1].intensity = 5 * (Math.sin(O * 31) > 0.97 ? 0.6 : 1);
  const h = l.hero; hp(h, O, [0, 0, 0.62], 0, { ...idle(O, 0), ...TSIT, spineX: 0.08, headX: 0.32, arms: [[-0.95, 0.75, -0.1, 1.05], [0.05, 0, -0.18, 0.3]] }, 'shock'); h.root.position.y = 0;
  const hand = h.arms[0].el.localToWorld(V([0, -0.44, 0])); l.coin.position.copy(hand).add(V([0, 0.17, 0])); l.coin.rotation.set(Math.PI / 2, 0.3, 0.02 * Math.sin(O * 2)); }
shot(EDGE_END, TL[20].t, 'laundrette', { ease: 'lin', p0: [0.25, 1.75, 5.6], p1: [0.12, 1.8, 3.7], l0: [0, 1.55, 0.6], fov: 40 }, (lt, O) => { laundretteBase(O); }, { grade: 'night', dof: (O) => 0.1 + 0.15 * seg(O, EDGE_END, EDGE_END + 3) });
// ===== DAY 20: the casino. Royal flush after royal flush; the crowd copies; the pit boss begs him to leave =====
const C = S.casino; const T20 = tS(20), HAND0 = T20 + 0.85, HANDL = 0.55, BOSS = [T20 + 4.0, T20 + 4.9];
function casinoBase(O) { const c = C; [c.hero, c.dealer, c.boss, ...c.near].forEach(resetRig); const hands = clamp(Math.floor((O - HAND0) / HANDL) + 1, 0, 5);
  c.cards.forEach((cd, i) => { const k = Math.min(4, Math.max(0, Math.floor((O - HAND0) / HANDL))), t0 = HAND0 + k * HANDL + i * 0.03; const inn = eOut(seg(O, t0, t0 + 0.18)), flip = eIO(seg(O, t0 + 0.2, t0 + 0.34)), out = k < 4 ? eIn(seg(O, t0 + 0.44, t0 + 0.54)) : 0;
    cd.visible = O > HAND0; const tx = -0.7 + i * 0.35; cd.position.set(lerp(0, tx, inn) + out * 1.2, 0.885 + 0.08 * Math.sin(flip * Math.PI), lerp(-0.9, 0.6, inn) - out * 0.8); cd.rotation.set(0, 0.05 * (i - 2), Math.PI * (1 - flip)); });
  const grow = clamp((O - HAND0) / (HANDL * 5)); c.stacks.forEach((s, i) => { const side = i % 2 ? 1 : -1, row = Math.floor(i / 2); s.position.set(side * (0.75 + (row % 3) * 0.28), 0.87, 0.3 + Math.floor(row / 3) * 0.3); s.scale.set(1, 0.15 + 1.15 * grow * (0.7 + 0.3 * Math.sin(i)), 1);
    if (O > BOSS[1]) { const p = eIO(seg(O, BOSS[1], BOSS[1] + 1.2)); s.position.z += 0.5 * p; s.position.x *= 1 - 0.3 * p; } });
  c.crowd.upd(O, { cheer: O > HAND0 + 0.6, jump: O > T20 + 3.5 && O < BOSS[0] });
  hp(c.hero, O, [0, 0, 1.6], Math.PI, { ...idle(O, 0), ...TSIT, spineX: 0.12, headY: O > BOSS[0] + 0.3 ? -0.55 : 0, arms: [[-1.0, 0, 0.25, 0.9], [-1.0, 0, -0.25, 0.9]] }, O > BOSS[0] + 0.3 ? 'worried' : 'calm');
  hp(c.dealer, O, [0, 0, -1.55], 0, { ...idle(O, 1), arms: [[-0.9, 0, 0.2, 0.9 + 0.3 * Math.sin(O * 9)], [-0.9, 0, -0.2, 1.0]] }, O > HAND0 + 1.5 ? 'shock' : 'calm', 'x');
  c.near.forEach((P, i) => hp(P, O, [i ? 2.3 : -1.4, 0, i ? 2.4 : 3.0], Math.PI + (i ? 0.3 : -0.3), { ...idle(O, i + 3), arms: [[0, 0, 0.13, 0.15], [-2.4 + 0.3 * Math.sin(O * 9 + i), 0, -0.4, 0.4]] }, O > HAND0 + 0.6 ? 'laugh' : 'calm', 'x'));
  const bw = eOut(seg(O, BOSS[0], BOSS[1])); const push = O > BOSS[1]; hp(c.boss, O, [lerp(-4.2, -1.45, bw), 0, lerp(1.6, 0.85, bw)], lerp(Math.PI / 2, 0.85, bw), bw < 1 ? walk(O, 8, 0.9) : { ...idle(O, 4), spineX: 0.3, arms: [[-1.0, 0, 0.3, 0.6], [-1.0, 0, -0.3, 0.6]] }, 'worried', 'pit boss');
  c.boss.sweat.forEach((s, i) => { s.position.y = 0.6 - ((O * 0.5 + i * 0.33) % 1) * 0.35; s.visible = bw > 0.5; }); }
coinInsert(T20, T20 + INS, 'heads');
shot(T20 + INS, T20 + 3.6, 'casino', { ease: 'lin', p0: [0.1, 3.55, 1.05], p1: [0.05, 3.3, 0.95], l0: [0, 0.86, 0.5], fov: 40, shift: 0 }, (lt, O) => { casinoBase(O); }, { grade: 'casino' });
shot(T20 + 3.6, T20 + 4.35, 'casino', { ease: 'lin', p0: [1.5, 4.6, -3.2], p1: [1.35, 4.5, -2.85], l0: [0, 1.3, 2.4], fov: 46 }, (lt, O) => { casinoBase(O); }, { grade: 'casino', dof: 0.12 });
shot(T20 + 4.35, TL[23].t, 'casino', { ease: 'lin', p0: [1.7, 2.25, 4.0], p1: [1.5, 2.2, 3.7], l0: [-1.35, 1.95, 0.85], fov: 40 }, (lt, O) => { casinoBase(O); }, { grade: 'casino', dof: 0.12 });
