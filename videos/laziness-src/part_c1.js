// ===== The flat: title .. Day 13 =====
const F = S.flat; const SEAT = 0.7, SZ = -3.55;   // sofa cushion top and depth line
const Q = (x, y, z, o = 'YXZ') => new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z, o));
const ON_BACK = Q(-Math.PI / 2, Math.PI / 2, 0), FACE_DOWN = Q(Math.PI / 2, -Math.PI / 2, 0);   // both: head toward -x
function orient(obj, from, to) { const d = to.clone().sub(from); obj.position.copy(from); obj.quaternion.setFromUnitVectors(V([0, 1, 0]), d.normalize()); }
function flatBase(O, o = {}) { const f = F;
  [f.hero, f.dev, f.priya, f.host, f.driver].forEach(P => { resetRig(P); P.root.visible = false; }); [f.hb, f.db, f.pb].forEach(b => b.visible = false); f.priya.marker.visible = false; f.dev.shake.visible = false;
  [f.pizza, f.remote, f.rod, f.fline, f.hook, f.car, f.sline, f.drone, f.grab, f.pbox, f.coin, f.zip, f.chips, f.medal].forEach(m => m.visible = false); f.arm.forEach(s => s.visible = false); f.flying.forEach(p => p.visible = false); f.shards.forEach(D => D.m.visible = false);
  f.dom.forEach(d => { d.visible = !!o.dom; d.rotation.x = 0; }); f.trap.visible = !!o.dom; f.trap.bar.rotation.z = 0; f.toggle.position.y = 0.05; f.sink.visible = !!o.sink; f.fac.visible = !!o.fac; f.plates.forEach(p => p.visible = !o.sink);
  f.door.visible = true; f.outside.intensity = 0; f.blinds.visible = !o.open; const lit = o.lit ?? 1; f.lamp.light.intensity = 12 * lit; f.lamp.children[0].material.emissiveIntensity = 3 * lit; f.key.intensity = 1.15 * (0.05 + 0.95 * lit); f.hemi.intensity = 0.45 * (0.12 + 0.88 * lit); f.sc.environmentIntensity = 0.35 * (0.1 + 0.9 * lit); f.winL.intensity = o.night ? 2 : 8 * (0.3 + 0.7 * lit);
  f.sky.material.color.setHex(o.night ? 0x1a2240 : 0xbfe3ff); f.flamp.light.intensity = o.lamp ? 34 : 0; f.flamp.children[0].material.emissiveIntensity = o.lamp ? 3 : 0; drawRotaOnce(o.rota || {}); return f.hero; }
let _rota = ''; function drawRotaOnce(st) { const k = JSON.stringify(st); if (k !== _rota) { drawRota(st); _rota = k; } }
function put(P, b, O, pos, ry, p, expr, who) { hp(P, O, pos, ry, p, expr, who); if (b) { b.visible = true; b.position.set(pos[0], 0.012, pos[2]); } }
function lieAt(O, x, q, p = {}, expr = 'calm', y = SEAT + 0.26, z = SZ) { const h = F.hero; hp(h, O, [x, y, z], 0, { ...p }, expr); h.root.quaternion.copy(q); return h; }
const LAZY = (O) => ({ headX: -0.15 + Math.sin(O * 0.8) * 0.03, arms: [[0.1, 0, 0.25, 0.3], [-2.6, 0, -0.5, 1.9]] });
const DANGLE = (k = 1) => [0, -0.9 * k, 1.5 * k + 0.25 * (1 - k), 0.3];   // front arm hangs off the sofa edge toward the floor   // on his back, one hand behind his head
// ---- TITLE: rota in the foreground (Priya pins it), push across the mess to the sofa; Dev lunges past
shot(0, TL[1].t, 'flat', { ease: 'io', p0: [-2.9, 2.5, 3.4], p1: [-1.2, 2.3, 2.4], l0: [-4.8, 2.2, 1.6], l1: [-0.2, 1.0, -3.5], fov: 48 }, (lt, O) => { flatBase(O); const h = lieAt(O, 1.15, FACE_DOWN, { arms: [[0.1, 0, 0.2, 0.1], [0.1, 0, -0.2, 0.1]], headX: 0.25 }, 'calm', SEAT + 0.25);
  F.pizza.visible = true; F.pizza.position.set(0.15, SEAT + 0.56, SZ); F.pizza.rotation.set(0, 0.3, 0.04);
  put(F.priya, F.pb, O, [-4.05, 0, 1.45], -Math.PI / 2, { ...idle(O, 1), arms: [[-1.45, 0, 0.1, 0.2], [-1.5, 0, -0.1, 0.25]] }, 'calm', 'priya');
  const dx = lerp(2.6, -2.6, O / 4.2); put(F.dev, F.db, O, [dx, 0, -0.3], -Math.PI / 2, { ...walk(O, 9, 1.2), spineX: 0.1 }, 'smile', 'dev'); }, { grade: 'flat', dof: 0.25 });
// ---- DAY 1: "Bro. Gym?" / "Mmm… nah." / rolls off the sofa / "Floor's comfy, innit."
const T1 = tS(1), ROLL = T1 + 3.85;
const bounce = (O) => ({ ...idle(O, 2), bob: Math.abs(Math.sin(O * 7)) * 0.07, arms: [[-0.3, 0, 0.5, 1.6], [-0.3, 0, -0.5, 1.6]] });
shot(T1, T1 + 1.5, 'flat', { ease: 'lin', p0: [0.3, 2.3, 3.4], p1: [0.25, 2.25, 3.0], l0: [0.35, 1.3, -2.3], fov: 46 }, (lt, O) => { flatBase(O); lieAt(O, 1.15, ON_BACK, LAZY(O), 'calm');
  put(F.dev, F.db, O, [1.5, 0, -1.6], -2.27, { ...bounce(O), headX: 0.1 }, 'smile', 'dev'); }, { grade: 'flat', dof: 0.15 });
shot(T1 + 1.5, ROLL, 'flat', { ease: 'lin', p0: [-0.65, 3.2, -1.85], p1: [-0.7, 3.1, -2.0], l0: [-0.95, 1.2, -3.5], fov: 40 }, (lt, O) => { flatBase(O); lieAt(O, 1.15, ON_BACK, { ...LAZY(O), headY: 0.35 }, 'calm');
  put(F.dev, F.db, O, [1.5, 0, -1.6], -2.27, bounce(O), 'smile', 'dev'); }, { grade: 'flat', dof: 0.15 });
shot(ROLL, T1 + 4.8, 'flat', { ease: 'lin', p0: [4.0, 1.1, -2.0], p1: [3.8, 1.05, -2.1], l0: [-0.2, 0.55, -2.9], fov: 46 }, (lt, O) => { flatBase(O); const k = eIn(seg(O, ROLL + 0.05, ROLL + 0.55)), r = eIO(seg(O, ROLL + 0.05, ROLL + 0.55));
  const q = ON_BACK.clone().slerp(FACE_DOWN, r); const h = lieAt(O, 1.15, q, { arms: [[-0.3 * (1 - r), 0, 0.4, 0.2], [-0.3, 0, -0.4, 0.2]] }, 'shock', lerp(SEAT + 0.26, 0.25, k), lerp(SZ, -2.55, r));
  put(F.dev, F.db, O, [1.5, 0, -1.6], -2.27, { ...idle(O, 2), headX: 0.3 }, 'shock', 'dev'); }, { grade: 'flat', shakeAt: [[ROLL + 0.55, 0.02]] });
shot(T1 + 4.8, tE(1), 'flat', { ease: 'lin', p0: [-1.45, 0.75, -0.15], p1: [-1.4, 0.72, -0.3], l0: [-0.9, 0.35, -2.55], fov: 40, shift: 0.0 }, (lt, O) => { flatBase(O); lieAt(O, 1.15, FACE_DOWN, { arms: [[0.0, 0, 0.4, 0.2], [0.0, 0, -0.4, 0.2]], headY: 0.5 }, 'calm', 0.25, -2.55);
  put(F.dev, F.db, O, [1.5, 0, -1.6], -2.27, { ...idle(O, 2), headX: 0.35, arms: [[0, 0, 0.13, 0.15], [-0.5, 0, -0.6, 2.2]] }, 'confused', 'dev'); }, { grade: 'flat', dof: 0.15 });
// ---- DAY 2: fishing for the remote; the hook catches Dev's shake -> splat on Priya's rota; second cast lands the remote
const T2 = tS(2), CAST1 = T2 + 2.3, HOOKED = T2 + 2.75, SPLAT = T2 + 3.35, CAST2 = T2 + 5.0, REEL = T2 + 5.5;
const RTARGET = V([3.2, 0.95, -0.6]), SHAKE0 = () => wp(F.dev.arms[1].el).add(V([0, -0.45, 0.05])), ROTA = V([-4.77, 2.2, 1.6]);
function rodScene(O, o = {}) { const h = lieAt(O, 1.15, ON_BACK, { headX: -0.25, headY: 0.4, arms: [[-1.3 + 0.25 * Math.sin(O * 3) * (o.reel || 0), -0.3, 0.5, 0.6], [-2.6, 0, -0.5, 1.9]] }, o.expr || 'calm');
  const hand = wp(h.arms[0].el).add(V([0, -0.1, 0])); const dir = (o.aim || RTARGET).clone().sub(hand).normalize(); dir.y += 0.9; dir.normalize(); const tip = hand.clone().addScaledVector(dir, 2.6);
  F.rod.visible = true; orient(F.rod, hand, tip); F.fline.visible = F.hook.visible = true; const end = o.hook || tip.clone().add(V([0, -0.3, 0])); F.hook.position.copy(end); F.fline.setPts(sag(tip, end, o.sag ?? 0.25, 24)); return h; }
shot(T2, CAST1, 'flat', { ease: 'lin', p0: [-0.65, 3.2, -1.85], p1: [-0.7, 3.1, -2.0], l0: [-0.95, 1.2, -3.5], fov: 40 }, (lt, O) => { flatBase(O); lieAt(O, 1.15, ON_BACK, { ...LAZY(O), headY: 0.4 }, 'calm');
  put(F.dev, F.db, O, [2.0, 0, -0.5], -2.4, { ...idle(O, 2), arms: [[0, 0, 0.13, 0.15], [-0.9, 0, -0.2, 1.6]] }, 'calm', 'dev'); F.dev.shake.visible = true; F.dev.shake.position.copy(SHAKE0()); }, { grade: 'flat', dof: 0.15 });
shot(CAST1, SPLAT, 'flat', { ease: 'lin', p0: [-1.9, 2.6, -3.2], p1: [-1.7, 2.6, -2.8], lf: (O) => V([2.0, 1.4, -0.5]).lerp(V([-4.6, 2.1, 1.5]), eIO(seg(O, HOOKED + 0.05, SPLAT))), fov: 50 }, (lt, O) => { flatBase(O);
  put(F.dev, F.db, O, [2.0, 0, -0.5], -2.4, { ...idle(O, 2), arms: [[0, 0, 0.13, 0.15], [O < HOOKED ? -0.9 : -0.3, 0, -0.2, O < HOOKED ? 1.6 : 0.4]] }, O < HOOKED ? 'calm' : 'shock', 'dev');
  const s0 = SHAKE0(); const fly = seg(O, HOOKED, SPLAT); const cast = eOut(seg(O, CAST1, HOOKED));
  const sh = O < HOOKED ? s0 : s0.clone().lerp(ROTA, fly).add(V([0, 2.2 * Math.sin(Math.PI * fly), 0]));
  F.dev.shake.visible = O < SPLAT; F.dev.shake.position.copy(sh); F.dev.shake.rotation.set(fly * 9, 0, fly * 5);
  rodScene(O, { hook: O < HOOKED ? null : sh.clone().add(V([0, 0.3, 0])), sag: O < HOOKED ? 0.25 * (1 - cast) + 0.05 : 0.05, aim: O < HOOKED ? s0.clone().lerp(V([1.4, 3, -1]), 1 - cast) : sh }); if (O < HOOKED) { const tip = F.hook.position; F.hook.position.lerp(s0, cast); F.fline.setPts(sag(wp(F.rod).add(V([0, 0, 0])), F.hook.position, 0.3 * (1 - cast) + 0.05, 24)); } }, { grade: 'flat', mblur: (O) => O > HOOKED ? 3 : 1 });
shot(SPLAT, CAST2, 'flat', { ease: 'lin', p0: [-2.6, 2.0, 3.0], p1: [-2.75, 2.0, 2.7], l0: [-4.6, 2.0, 1.5], fov: 42 }, (lt, O) => { flatBase(O, { rota: { splat: true } });
  put(F.priya, F.pb, O, [-3.8, 0, 0.5], 0.45, { ...idle(O, 1), spineX: -0.12, arms: [[-0.5, 0, 0.9, 1.9], [-0.5, 0, -0.9, 1.9]], headX: -0.1 }, 'shock', 'priya');
  burst(F.shards.slice(0, 8), O, SPLAT, ROTA.clone().add(V([0.3, 0, 0])), 1.2, 1.5); }, { grade: 'flat', dof: 0.15, shakeAt: [[SPLAT, 0.02]] });
shot(CAST2, T2 + 6.4, 'flat', { ease: 'lin', p0: [-0.4, 2.3, -2.4], p1: [-0.2, 2.25, -2.2], l0: [2.8, 1.0, -0.8], fov: 46 }, (lt, O) => { flatBase(O); const r = eIO(seg(O, REEL, T2 + 6.3)); const rem = RTARGET.clone().lerp(V([0.2, 1.6, -3.0]), r).add(V([0, Math.sin(r * Math.PI) * 0.6, 0]));
  F.remote.visible = true; F.remote.position.copy(r > 0 ? rem : RTARGET); F.remote.rotation.set(r * 3, 0.4, 0); rodScene(O, { hook: O < REEL ? RTARGET.clone().lerp(V([1.4, 3, -1]), 1 - eOut(seg(O, CAST2, REEL))) : rem.clone().add(V([0, 0.06, 0])), sag: 0.08, reel: 1 }); }, { grade: 'flat', dof: 0.25 });
shot(T2 + 6.4, tE(2), 'flat', { ease: 'lin', p0: [-0.65, 3.2, -1.85], p1: [-0.7, 3.1, -2.0], l0: [-0.95, 1.2, -3.5], fov: 40 }, (lt, O) => { flatBase(O); const h = lieAt(O, 1.15, ON_BACK, { headX: -0.25, headY: 0.45, arms: [[-1.4, -0.2, 0.3, 1.2], [-2.6, 0, -0.5, 1.9]] }, 'smirk');
  F.remote.visible = true; F.remote.position.copy(wp(h.arms[0].el).add(V([0, 0.05, 0.12]))); F.remote.rotation.set(0.2, 0.3, 1.2); }, { grade: 'flat', dof: 0.15 });
// ---- DAY 4: blueprint, then the chain: dominoes -> toy car -> mousetrap -> string -> switch. DING. Dark. "Night."
const T4 = tS(4), FLICK = T4 + 1.75, DOMS = [T4 + 1.9, T4 + 3.4], CAR = [T4 + 3.4, T4 + 3.9], SNAP = T4 + 4.05, DING4 = T4 + 4.45;
function chain4(O) { fallDominoes(F.dom, O, DOMS[0], DOMS[1]); const c = eIn(seg(O, CAR[0], CAR[1])); F.car.visible = true; F.car.position.set(lerp(3.45, 4.3, c), lerp(0.48, 0.05, c), -4.4); F.car.rotation.z = c < 1 ? 0.45 : 0;
  F.trap.bar.rotation.z = O > SNAP ? -Math.PI * eOut(seg(O, SNAP, SNAP + 0.08)) : 0; const tug = eOut(seg(O, SNAP, DING4)); F.sline.visible = true;
  const a = V([4.45, 0.05, -4.4]).add(V([0, 0.3 * tug, 0])), b = V([4.2, 2.25, -4.92]); F.sline.setPts(sag(a, b, 0.15 * (1 - tug), 20)); F.toggle.position.y = O > DING4 ? -0.05 : 0.05; }
shot(T4, FLICK - 0.3, 'flat', { ease: 'lin', p0: [0, 2, 4], l0: [0, 1, 0], fov: 40 }, (lt, O) => { flatBase(O, { dom: true }); lieAt(O, 1.15, ON_BACK, LAZY(O), 'calm'); }, { grade: 'flat', bp: 'light' });
shot(FLICK - 0.3, DOMS[0] + 0.6, 'flat', { ease: 'lin', p0: [-1.2, 1.3, -0.7], p1: [-1.1, 1.25, -0.85], l0: [-0.35, 0.45, -2.65], fov: 46, shift: 0.0 }, (lt, O) => { flatBase(O, { dom: true }); const k = Math.sin(Math.PI * seg(O, FLICK - 0.25, FLICK + 0.1));
  lieAt(O, 1.15, ON_BACK, { headX: -0.2, headY: 0.4, arms: [DANGLE(1).map((v, j) => j === 1 ? v - 0.25 * k : v), [-2.6, 0, -0.5, 1.9]] }, 'calm'); chain4(O); }, { grade: 'flat', dof: 0.15 });
shot(DOMS[0] + 0.6, CAR[1], 'flat', { ease: 'lin', p0: [1.4, 1.2, -1.2], p1: [4.4, 1.1, -2.3], l0: [0.6, 0.2, -2.65], l1: [3.5, 0.3, -4.1], fov: 46, shift: 0.02 }, (lt, O) => { flatBase(O, { dom: true }); lieAt(O, 1.15, ON_BACK, LAZY(O), 'calm'); chain4(O); }, { grade: 'flat', dof: 0.15, mblur: 2 });
shot(CAR[1], DING4 + 0.25, 'flat', { ease: 'lin', p0: [4.0, 2.25, -3.9], p1: [4.05, 2.27, -4.05], l0: [4.2, 2.25, -4.95], fov: 40 }, (lt, O) => { flatBase(O, { dom: true, lit: O > DING4 ? 0.05 : 1 }); lieAt(O, 1.15, ON_BACK, LAZY(O), 'calm'); chain4(O); }, { grade: 'flat', shakeAt: [[DING4, 0.008]] });
shot(DING4 + 0.25, tE(4), 'flat', { ease: 'lin', p0: [1.2, 2.6, 2.2], p1: [1.0, 2.5, 1.9], l0: [0.0, 1.0, -3.4], fov: 44 }, (lt, O) => { flatBase(O, { dom: true, lit: 0.05, night: true }); lieAt(O, 1.15, ON_BACK, { ...LAZY(O), headY: 0.2 }, 'smirk'); chain4(O); }, { grade: 'dark' });
// ---- DAY 6: INFOMERCIAL. The host presents the SINK-O-MATIC; plates fly out like frisbees; Dev catches four, the fifth smashes; yawned BOMBOCLAT
const T6 = tS(6), BLOW = T6 + 5.3, SMASH = T6 + 6.4;
const PL0 = V([-4.6, 1.9, -2.3]); const plateAt = (i, O) => { const t0 = BLOW + 0.1 + i * 0.22, k = seg(O, t0, t0 + 0.55); const end = i < 4 ? V([0.1, 1.45 + (i % 2) * 0.25, 0.95]) : V([-0.9, 0.03, 1.6]); return { k, t0, p: PL0.clone().lerp(end, k).add(V([0, Math.sin(Math.PI * k) * (i < 4 ? 0.9 : 0.6), 0])) }; };
shot(T6, BLOW, 'flat', { ease: 'lin', p0: [-2.6, 2.3, 4.4], p1: [-2.65, 2.3, 4.2], l0: [-3.9, 1.6, -1.8], fov: 46, live: 0.2 }, (lt, O) => { flatBase(O, { sink: true }); lieAt(O, 1.15, ON_BACK, LAZY(O), 'calm');
  F.sink.drum.rotation.x = 0; put(F.host, null, O, [-3.2, 0, -1.2], 0.35, { ...idle(O, 3), arms: [[-0.3, 0, 0.3, 0.4], [-1.4 + 0.2 * Math.sin(O * 4), 0.4, -0.9, 0.3]], headY: 0.15 }, 'smile', 'host'); }, { grade: 'tv', tv: true });
shot(BLOW, SMASH + 0.5, 'flat', { ease: 'lin', p0: [4.8, 3.0, 3.6], p1: [4.6, 2.95, 3.4], l0: [-2.6, 1.5, -1.4], fov: 48, live: 0.2 }, (lt, O) => { flatBase(O, { sink: true }); lieAt(O, 1.15, ON_BACK, LAZY(O), 'calm'); F.sink.drum.rotation.x = -(O - BLOW) * 14;
  put(F.host, null, O, [-3.2, 0, -1.2], 0.6, { ...idle(O, 3), spineX: -0.15, arms: [[-2.4, 0, 0.6, 0.3], [-2.4, 0, -0.6, 0.3]] }, 'shock', 'host');
  let caught = 0; F.flying.forEach((p, i) => { const { k, p: pos } = plateAt(i, O); p.visible = k > 0 && (i < 4 ? k < 1 : k < 1); p.position.copy(pos); p.rotation.set(0.3, (O - BLOW) * 20, 0.2); if (i < 4 && k >= 1) caught++; });
  put(F.dev, F.db, O, [0.4, 0, 1.25], -2.18, { ...idle(O, 2), spineX: 0.15, arms: [[-1.4, 0, 0.3, 0.4], [-1.4, 0, -0.3, 0.4]] }, caught > 2 ? 'grit' : 'shock', 'dev');
  burst(F.shards, O, SMASH, V([-0.9, 0.1, 1.6]), 2.0, 1.8); }, { grade: 'tv', tv: true, shakeAt: [[SMASH, 0.015]], mblur: 2 });
shot(SMASH + 0.5, tE(6), 'flat', { ease: 'lin', p0: [-0.65, 3.2, -1.85], p1: [-0.7, 3.1, -2.0], l0: [-0.95, 1.2, -3.5], fov: 40, live: 0.3 }, (lt, O) => { flatBase(O, { sink: true }); lieAt(O, 1.15, ON_BACK, { ...LAZY(O), headY: 0.45 }, O > T6 + 7.9 && O < T6 + 9.3 ? 'yawn' : 'shock'); }, { grade: 'tv', tv: true });
// ---- DAY 9: blueprint, the BRUSH-DRONE brushes his teeth, then Dev's eyebrows
const T9 = tS(9), DR = T9 + 1.4, DOFF = T9 + 4.3;
function droneAt(O) { const d = F.drone; d.visible = true; d.rotors.forEach((r, i) => r.rotation.y = O * 60 + i); const hd = V([-1.0, 1.75, SZ + 0.12]), dv = V([1.9, 2.55, 0.1]);
  let p = O < DOFF ? V([1.5, 3.6, -1.5]).lerp(hd, eOut(seg(O, DR, DR + 1.0))) : hd.clone().lerp(dv, eIO(seg(O, DOFF, DOFF + 0.9))); p.add(V([Math.sin(O * 31) * 0.03, Math.sin(O * 23) * 0.03, 0])); d.position.copy(p); d.rotation.set(0.1 * Math.sin(O * 5), O < DOFF ? 0.3 : -0.9, 0.08 * Math.sin(O * 7)); d.brush.rotation.x = 0.5 + 0.35 * Math.sin(O * 26); }
shot(T9, DR, 'flat', { ease: 'lin', p0: [0, 2, 4], l0: [0, 1, 0], fov: 40 }, (lt, O) => { flatBase(O); lieAt(O, 1.15, ON_BACK, LAZY(O), 'calm'); }, { grade: 'flat', bp: 'drone' });
shot(DR, DOFF + 0.1, 'flat', { ease: 'lin', p0: [-0.9, 4.9, SZ + 1.1], p1: [-0.9, 4.6, SZ + 1.0], l0: [-0.9, 1.0, SZ + 0.1], fov: 46, shift: 0 }, (lt, O) => { flatBase(O); lieAt(O, 1.15, ON_BACK, { ...LAZY(O), headX: -0.05 }, O > T9 + 2.0 ? 'yawn' : 'calm'); droneAt(O); }, { grade: 'flat' });
shot(DOFF + 0.1, tE(9), 'flat', { ease: 'lin', p0: [4.4, 2.7, 3.2], p1: [4.2, 2.65, 3.0], l0: [1.3, 2.1, -0.6], fov: 40 }, (lt, O) => { flatBase(O); lieAt(O, 1.15, ON_BACK, LAZY(O), 'calm'); droneAt(O);
  put(F.dev, F.db, O, [1.55, 0, -0.35], 0.68, { ...idle(O, 2), spineX: -0.15, headX: -0.25, arms: [[-0.2, 0, 0.6, 1.2], [-0.2, 0, -0.6, 1.2]] }, O > T9 + 4.8 ? 'grit' : 'shock', 'dev'); }, { grade: 'flat', dof: 0.15 });
// ---- DAY 13: the pause beat. Lamp light, silence, he stands, one foot hovers. "Walking is just falling… but slowly." "Mmm… nah." "bom… bo…" (asleep standing)
const T13 = tS(13), LIFT = T13 + 1.9, DOWN = T13 + 7.85, SLEEP = T13 + 11.2;
const HZ13 = [1.2, 0, -2.45];
function stand13(O) { const lift = eIO(seg(O, LIFT, LIFT + 1.0)) * (1 - eIO(seg(O, DOWN - 0.2, DOWN + 0.3))); const zz = eIO(seg(O, SLEEP - 0.6, SLEEP + 0.4));
  return { ...idle(O), spineX: 0.03 + 0.08 * zz, spineZ: 0.05 * Math.sin(O * 1.3) * zz, headX: 0.15 * lift + 0.3 * zz, legs: [[0.35 * lift, 0.5 * lift], [0, 0]], arms: [[0.05, 0, 0.18 + 0.15 * lift, 0.15], [0.05, 0, -0.18 - 0.15 * lift, 0.15]] }; }
const face13 = (O) => O > SLEEP - 0.3 ? 'yawn' : O > DOWN ? 'calm' : 'worried';
shot(T13, T13 + 4.3, 'flat', { ease: 'lin', p0: [1.95, 2.55, 0.7], p1: [1.9, 2.5, 0.45], l0: [1.25, 2.15, -2.45], fov: 40, live: 0.4 }, (lt, O) => { flatBase(O, { lit: 0.32, lamp: true, night: true }); put(F.hero, F.hb, O, HZ13, 0.25, stand13(O), face13(O));
  put(F.dev, F.db, O, [2.35, 0, -1.8], -2.0, { ...idle(O, 2), spineX: 0.2, arms: [[-0.9, 0, 0.3, 1.3], [-0.9, 0, -0.3, 1.3]] }, 'worried', 'dev'); }, { grade: 'lamp', dof: 0.15 });
shot(T13 + 4.3, DOWN + 0.4, 'flat', { ease: 'io', p0: [1.95, 2.4, 0.5], p1: [1.85, 1.1, 0.2], l0: [1.25, 2.1, -2.45], l1: [1.3, 0.45, -2.2], fov: 42, live: 0.4 }, (lt, O) => { flatBase(O, { lit: 0.32, lamp: true, night: true }); put(F.hero, F.hb, O, HZ13, 0.25, stand13(O), face13(O));
  put(F.dev, F.db, O, [2.35, 0, -1.8], -2.0, { ...idle(O, 2), spineX: 0.2, arms: [[-0.9, 0, 0.3, 1.3], [-0.9, 0, -0.3, 1.3]] }, 'shock', 'dev'); }, { grade: 'lamp', dof: 0.15 });
shot(DOWN + 0.4, T13 + 10.1, 'flat', { ease: 'lin', p0: [1.75, 2.5, 0.3], p1: [1.72, 2.48, 0.1], l0: [1.25, 2.2, -2.45], fov: 36, live: 0.4 }, (lt, O) => { flatBase(O, { lit: 0.32, lamp: true, night: true }); put(F.hero, F.hb, O, HZ13, 0.25, stand13(O), face13(O)); }, { grade: 'lamp', dof: 0.15 });
shot(T13 + 10.1, tE(13), 'flat', { ease: 'lin', p0: [1.9, 2.3, 2.4], p1: [1.88, 2.25, 2.1], l0: [1.85, 1.55, -2.5], fov: 44, live: 0.4 }, (lt, O) => { flatBase(O, { lit: 0.32, lamp: true, night: true }); put(F.hero, F.hb, O, HZ13, 0.25, stand13(O), face13(O));
  put(F.dev, F.db, O, [2.55, 0, -2.6], -1.3, { ...idle(O, 2), headX: 0.1, arms: [[0, 0, 0.13, 0.15], [-0.4, 0, -0.5, 2.2]] }, 'confused', 'dev'); }, { grade: 'lamp', dof: 0.15 });
