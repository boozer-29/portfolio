// ===== The club (title, Day 1) =====
const CL = S.club; const HX = -0.45, HZ = -1.45, BX = 0.55;
// o.q0: the first person in the queue is the one talking/laughing
function clubBase(O, o = {}) { const c = CL; resetRig(c.hero); c.hero.root.visible = false; c.hb.visible = false; c.hero.kit.set(o.lvl ?? 0, O, o.kit || {}); resetRig(c.bouncer); c.bouncer.root.scale.setScalar(1.28); c.bouncer.setBrown(!!o.brown); c.bouncer.tag.children[1].rotation.z = 0;
  [...c.queue, ...c.bq].forEach(P => { resetRig(P); P.root.visible = false; P.blob.visible = false; });
  const Q = o.brown ? c.bq : c.queue; Q.forEach((P, i) => { const x = -1.6 - i * 0.92, z = -1.45 + ((i * 37) % 5 - 2) * 0.05; const look = o.lookAt ? Math.atan2(o.lookAt[0] - x, o.lookAt[1] - z) : Math.PI / 2 + ((i * 13) % 3 - 1) * 0.2;
    hp(P, O, [x, 0, z], look, { ...idle(O, i * 1.3), headX: i % 3 === 0 && !o.lookAt ? 0.35 : 0 }, i === 0 && o.q0 ? 'laugh' : o.lookAt ? (i % 2 ? 'shock' : 'confused') : (i % 3 === 0 ? 'calm' : 'smile'), i === 0 ? 'queue' : 'npc'); P.blob.visible = true; P.blob.position.set(x, 0.012, z); });
  c.inner.intensity = 9 + Math.sin(O * 7.3) * 2 + Math.sin(O * 13) * 1.2; return c.hero; }
function heroAt(c, O, pos, ry, p, expr) { hp(c.hero, O, pos, ry, p, expr); c.hb.visible = true; c.hb.position.set(pos[0], 0.012, pos[2]); }
const STOPARM = (k) => ({ arms: [[0, 0, 0.12, 0.12], [lerp(0, -0.85, k), lerp(0, 0.35, k), lerp(-0.12, -0.05, k), lerp(0.12, 0.35, k)]] });
function bouncerAt(O, p, expr, ry = -Math.PI / 2) { hp(CL.bouncer, O, [BX, 0, HZ], ry, p, expr, 'bouncer'); }
const SLAP = 1.7;
shot(0, 3.0, 'club', { ease: 'io', p0: [0.6, 1.0, 5.6], p1: [0.5, 1.05, 5.0], l0: [-0.1, 1.75, -1.45], fov: 46 }, (lt, O) => { clubBase(O, { lvl: 0 }); const k = eOut(seg(O, SLAP - 0.25, SLAP)); const wk = O < 1.45;
  const wk0 = eIO(seg(O, 0, 1.45)); heroAt(CL, O, wk ? [lerp(1.6, HX, wk0), 0, lerp(1.9, HZ, wk0)] : [HX - 0.06 * k, 0, HZ], wk ? Math.atan2(HX - 1.6, HZ - 1.9) + (O > 1.2 ? (Math.PI / 2 - Math.atan2(HX - 1.6, HZ - 1.9)) * seg(O, 1.2, 1.45) : 0) : Math.PI / 2, wk ? walk(O, 10, 1) : { ...idle(O), spineX: -0.1 * k }, O > SLAP ? 'shock' : 'smile');
  bouncerAt(O, { ...idle(O, 2), ...STOPARM(k), headX: 0.12 }, 'calm'); }, { grade: 'club', shakeAt: [[SLAP, 0.012]] });
const T1 = tS(1);
shot(T1, T1 + 2.6, 'club', { ease: 'lin', p0: [3.3, 3.4, 2.3], p1: [3.15, 3.35, 2.05], l0: [HX, 2.05, HZ], fov: 40 }, (lt, O) => { clubBase(O, { lvl: 0 });
  heroAt(CL, O, [HX - 0.06, 0, HZ], Math.PI / 2, { ...idle(O), spineX: -0.06, headX: -0.1 }, 'confused'); bouncerAt(O, { ...idle(O, 2), ...STOPARM(1 - eIO(seg(O, T1 + 0.6, T1 + 1.1))), headX: 0.15 }, 'calm'); }, { grade: 'club', dof: 0.3 });
shot(T1 + 2.6, T1 + 5.4, 'club', { ease: 'lin', p0: [-2.7, 1.9, 1.3], p1: [-2.5, 1.95, 1.1], l0: [BX - 0.1, 3.05, HZ], fov: 46 }, (lt, O) => { clubBase(O, { lvl: 0 });
  heroAt(CL, O, [HX - 0.06, 0, HZ], Math.PI / 2, { ...idle(O) }, 'confused'); const down = Math.sin(seg(O, T1 + 2.7, T1 + 4.2) * Math.PI); const tilt = eIO(seg(O, T1 + 4.4, T1 + 4.9));
  bouncerAt(O, { ...idle(O, 2), headX: 0.45 * down - 0.05, headZ: 0.2 * tilt, arms: [[-0.55, 0, -0.22, 1.55], [-0.6, 0, 0.22, 1.5]] }, tilt > 0.5 ? 'confused' : 'calm'); }, { grade: 'club', dof: 0.35 });
shot(T1 + 5.4, T1 + 7.15, 'club', { ease: 'lin', p0: [-0.2, 1.95, 2.7], p1: [-0.2, 1.95, 2.4], l0: [HX, 1.95, HZ], fov: 44 }, (lt, O) => { clubBase(O, { lvl: 0 }); const fl = eOut(seg(O, T1 + 6.2, T1 + 6.6));
  heroAt(CL, O, [HX - 0.06, 0, HZ], 0.5, { ...idle(O), arms: [[lerp(-0.45, -0.25, fl), 0, lerp(0.3, 1.05, fl), lerp(1.25, 0.3, fl)], [lerp(-0.45, -0.25, fl), 0, lerp(-0.3, -1.05, fl), lerp(1.25, 0.3, fl)]], spineX: -0.05, headZ: 0.08 * fl }, 'grit');
  bouncerAt(O, { ...idle(O, 2), arms: [[-0.55, 0, -0.22, 1.55], [-0.6, 0, 0.22, 1.5]], headX: 0.1 }, 'calm'); }, { grade: 'club', dof: 0.3 });
shot(T1 + 7.15, tE(1), 'club', { ease: 'lin', p0: [-0.05, 2.15, 0.85], p1: [-0.15, 2.15, 0.6], l0: [-1.6, 2.2, HZ], fov: 44 }, (lt, O) => { clubBase(O, { lvl: 0, q0: true });
  heroAt(CL, O, [HX - 0.06, 0, HZ], 0.5, { ...idle(O), arms: [[-0.2, 0, 0.15, 0.3], [-0.2, 0, -0.15, 0.3]] }, 'worried'); bouncerAt(O, { ...idle(O, 2), ...CROSS }, 'calm');
  const q = CL.queue[0]; pose(q, { ...idle(O), spineX: 0.12 + 0.05 * Math.sin(O * 18), arms: [[-0.6, 0, -0.35, 1.4], [-0.9, 0.3, -0.6, 0.3]] }); q.root.rotation.y = 0.6; }, { grade: 'club', dof: 0.3 });
// ===== The wall (Day 3): his shadow struts =====
const WL = S.wall, T3 = tS(3); const STOP3 = T3 + 3.4;
const hx3 = (O) => lerp(-3.6, 0.0, seg(O, T3, STOP3));
function wallBase(O) { const w = WL; resetRig(w.hero); w.hero.kit.set(1, O); resetRig(w.shadow); return w.hero; }
const SOFF = (O) => lerp(1.45, 1.95, eIO(seg(O, T3 + 2.7, T3 + 3.15)));
function shadowAt(O) { const P = WL.shadow, k = O - T3; let x = hx3(O) + SOFF(O), ry = Math.PI / 2, p;
  if (k < 0.9) p = walk(O, 7.5, 1);
  else if (O < T3 + 2.7) { const s = Math.sin(O * 8); p = { ...walk(O, 8, 1.1), hipZ: s * 0.18, spineZ: -s * 0.12, headZ: s * 0.08, arms: [[-s * 0.6, 0, 0.12, 0.4], [-0.2, 0, -0.65, 1.9]] }; }
  else if (O < T3 + 3.15) { ry = Math.PI / 2 + eIO(seg(O, T3 + 2.7, T3 + 3.15)) * Math.PI * 2; p = { ...idle(O), arms: [[-0.2, 0, 1.0, 0.3], [-0.2, 0, -1.0, 0.3]] }; x = hx3(T3 + 2.7) + SOFF(O); }
  else { x = hx3(T3 + 2.7) + SOFF(O); const v = Math.floor((O - T3 - 3.15) / 0.9) % 3; ry = [-0.5, 0.9, Math.PI / 2 + 0.3][v];
    p = [{ hipZ: 0.25, spineZ: -0.15, headZ: 0.25, arms: [[-2.6, 0, 0.6, 0.3], [-0.2, 0, -0.65, 1.9]] }, { hipZ: -0.2, spineX: -0.15, headX: -0.2, arms: [[-0.2, 0, 0.65, 1.9], [-0.2, 0, -0.65, 1.9]] }, { hipZ: 0.2, spineZ: 0.1, arms: [[-1.4, 0, 0.2, 2.0], [-0.3, 0, -1.2, 0.2]], legs: [[0.3, 0.4, 0.2], [0, 0]] }][v]; }
  pose(P, p); P.root.position.set(x / 1.12, 0, 0); P.root.rotation.set(0, ry, 0); }
shot(T3, T3 + 3.6, 'wall', { ease: 'lin', pf: (O) => V([hx3(O) + 0.75, 1.8, 7.0]), lf: (O) => V([hx3(O) + 0.8, 1.75, -0.6]), fov: 44 }, (lt, O) => { const h = wallBase(O); const moving = O < STOP3;
  hp(h, O, [hx3(O), 0, 0.3], Math.PI / 2, moving ? walk(O, 7.5, 1) : { ...idle(O) }, 'calm'); WL.hb.position.set(hx3(O), 0.012, 0.3); shadowAt(O); }, { grade: 'wall' });
shot(T3 + 3.6, tE(3), 'wall', { ease: 'lin', p0: [0.75, 1.8, 6.0], p1: [0.8, 1.8, 5.5], l0: [0.85, 1.85, -0.5], fov: 50 }, (lt, O) => { const h = wallBase(O); const turn = eOut(seg(O, T3 + 3.6, T3 + 4.0));
  hp(h, O, [0, 0, 0.3], Math.PI / 2 - 1.0 * turn, { ...idle(O), headY: 0.55 * turn, headX: -0.05, arms: [[0, 0, 0.12, 0.12], [-0.9 * turn, 0, -0.5 * turn, 0.6]] }, O > T3 + 4.1 ? 'confused' : 'shock'); WL.hb.position.set(0, 0.012, 0.3); shadowAt(O); }, { grade: 'wall' });
// ===== The zoo (Day 5): nature documentary =====
const ZO = S.zoo, T5 = tS(5); const PK = [0.7, 0, -0.4], ZH = [-1.6, 0, -4.6];
const FOLD = T5 + 4.6, OFF = T5 + 5.3;
function zooBase(O) { ZO.kid.root.visible = false; resetRig(ZO.hero); ZO.hero.kit.set(2, O); const pc = ZO.peacock; const open = eOut(seg(O, T5 + 0.9, T5 + 1.9)) * (1 - eIO(seg(O, FOLD, FOLD + 0.6)));
  pc.setTail(open); pc.userData.fe.forEach((p, i) => p.rotation.z += 0.02 * Math.sin(O * 31 + i) * open); const look = seg(O, T5 + 3.6, T5 + 4.1); const leave = seg(O, OFF, OFF + 1.4);
  pc.rotation.y = lerp(0.15, -2.4, eIO(look)) * (1 - leave) + lerp(-2.4, 1.6, eIO(seg(O, OFF - 0.2, OFF + 0.3))) * leave; pc.position.set(lerp(PK[0], 2.9, eIO(leave)), Math.abs(Math.sin(O * 9)) * 0.03 * (leave > 0 && leave < 1), lerp(PK[2], -1.3, eIO(leave))); pc.scale.setScalar(lerp(1, 0.55, eIO(seg(O, OFF + 0.8, OFF + 1.4))));
  pc.userData.neck.rotation.set(0.25 + 0.15 * Math.sin(O * 2), 0, 0); pc.userData.head.rotation.set(-0.15, Math.sin(O * 1.3) * 0.3, 0);
  ZO.rustle.rotation.z = O > OFF + 0.9 && O < OFF + 2.2 ? Math.sin(O * 40) * 0.03 : 0;
  hp(ZO.hero, O, ZH, 0, { ...idle(O), hipZ: 0.12, spineZ: -0.06, headX: -0.08, arms: [[-0.2, 0, 0.62, 1.85], [-0.15, 0, -0.35, 0.3]] }, 'smirk'); ZO.hb.position.set(ZH[0], 0.012, ZH[2]); return ZO.hero; }
shot(T5, T5 + 3.8, 'zoo', { ease: 'lin', p0: [0.25, 1.15, 9.6], p1: [0.3, 1.15, 9.2], l0: [0.7, 1.3, -0.4], fov: 26 }, (lt, O) => { zooBase(O); }, { grade: 'doc', dof: 0.55, letterbox: true, live: 0.6 });
shot(T5 + 3.8, T5 + 6.2, 'zoo', { ease: 'lin', p0: [3.0, 1.2, 4.6], p1: [2.8, 1.25, 4.3], l0: [-0.3, 1.6, -2.4], fov: 30 }, (lt, O) => { zooBase(O); }, { grade: 'doc', letterbox: true, live: 0.6 });
shot(T5 + 6.2, T5 + 7.9, 'zoo', { ease: 'lin', p0: [-0.9, 2.0, 4.4], p1: [-0.95, 2.0, 4.0], l0: [ZH[0], 2.0, ZH[2]], fov: 25 }, (lt, O) => { zooBase(O); const w = Math.sin(seg(O, T5 + 6.8, T5 + 7.8) * Math.PI);
  hp(ZO.hero, O, ZH, 0, { ...idle(O), headY: 0.45, headX: 0.08, arms: [[-0.15, 0, 0.3, 0.3], [-0.3 - 0.4 * w, 0, -0.45 - 0.25 * w, 0.9]] }, 'worried'); }, { grade: 'doc', dof: 0.45, letterbox: true, live: 0.6 });
shot(T5 + 7.9, tE(5), 'zoo', { ease: 'lin', p0: [0.9, 1.6, 4.2], p1: [0.8, 1.6, 3.9], l0: [-0.8, 1.45, -4.4], fov: 30 }, (lt, O) => { zooBase(O); const K = ZO.kid; resetRig(K); K.root.scale.setScalar(0.62);
  hp(K, O, [-0.25, 0, -4.2], 0.5, { ...idle(O, 4), bob: Math.abs(Math.sin(O * 9)) * 0.03, arms: [[0, 0, 0.12, 0.15], [-1.5, 0.2, -0.3, 0.1]] }, 'shock', 'kid');
  hp(ZO.hero, O, ZH, 0.35, { ...idle(O), headY: -0.3, arms: [[-0.15, 0, 0.3, 0.3], [-0.15, 0, -0.3, 0.3]] }, 'worried'); }, { grade: 'doc', dof: 0.35, letterbox: true, live: 0.6 });
// ===== The shop window (Day 8): the mannequins notice =====
const WN = S.window, T8 = tS(8); const TURN8 = T8 + 2.1, DROP8 = T8 + 3.5;
function winBase(O, heroPos) { resetRig(WN.hero); WN.hero.kit.set(3, O); WN.hb.position.set(heroPos[0], 0.012, heroPos[2]);
  const k = eOut(seg(O, TURN8, TURN8 + 0.35)); WN.mans.forEach((P, i) => { const mx = P.root.position.x; pose(P, { arms: [[0.05, 0, 0.18, 0.15], [0.05, 0, -0.18, 0.15]] }); P.neck.rotation.y = k * clamp(Math.atan2(heroPos[0] - mx, heroPos[2] - 0.1), -1.3, 1.3); });
  const m2 = WN.mans[2], d = seg(O, DROP8, DROP8 + 0.45); m2.fab.color.setHex(d > 0.05 ? 0xededf0 : 0xd9a520); WN.jacket.visible = d > 0.05; WN.jacket.position.set(1.3, lerp(1.75, 0.37, eIn(d)), lerp(0.1, -0.35, d)); WN.jacket.rotation.set(lerp(0, -0.3, d), 0.3 * d, lerp(0, 0.1, d)); }
const hx8 = (O) => [lerp(-3.4, 1.3, seg(O, T8, T8 + 3.0)), 0, 3.2];
shot(T8, T8 + 2.9, 'window', { ease: 'lin', p0: [-0.3, 2.1, 8.6], p1: [-0.2, 2.1, 8.2], l0: [0.2, 1.7, 0.8], fov: 50 }, (lt, O) => { const p = hx8(O); winBase(O, p); hp(WN.hero, O, p, Math.PI / 2, walk(O, 7.5, 1), 'smirk'); }, { grade: 'shop' });
const HB8 = (O) => [2.6, 0, lerp(3.4, 4.3, eIO(seg(O, T8 + 3.6, T8 + 5.5)))];
shot(T8 + 2.9, tE(8), 'window', { ease: 'lin', p0: [1.9, 1.75, -1.5], p1: [1.9, 1.8, -1.2], l0: [2.6, 2.05, 3.8], fov: 50 }, (lt, O) => { const p = HB8(O); winBase(O, p); const back = seg(O, T8 + 3.6, T8 + 5.5);
  hp(WN.hero, O, p, Math.PI - 0.15, back > 0 && back < 1 ? { ...walk(O, 6, 0.4), spineX: -0.12 } : { ...idle(O), spineX: -0.1, arms: [[-0.4, 0, 0.35, 0.8], [-0.4, 0, -0.35, 0.8]] }, 'worried'); }, { grade: 'shop', dof: 0.25 });
// ===== The plaza (Day 10): a man in white gloves ties his laces =====
const PZ = S.plaza, T10 = tS(10); const TIED = T10 + 3.2, RISE = T10 + 3.4;
function plazaBase(O, o = {}) { const p = PZ; resetRig(p.hero); p.hero.root.visible = false; p.hb.visible = false; resetRig(p.guard); p.guard.root.visible = false; p.gb.visible = false; p.rain.visible = false; p.steam.forEach(s => s.visible = false); p.cs.visible = !!o.cs;
  p.crowd.forEach(P => { resetRig(P); P.root.visible = false; P.blob.visible = false; }); const dusk = o.dusk ?? 0;
  p.key.intensity = lerp(2.2, 0.35, dusk); p.key.color.setHex(dusk ? 0x9fb0d8 : 0xfff0d8); p.hemi.intensity = lerp(0.75, 0.45, dusk); p.sc.environmentIntensity = lerp(0.5, 0.25, dusk); p.sky.material.color.setHex(dusk ? 0x4a5a80 : 0xffffff);
  p.lamps.forEach(l => { l.light.intensity = dusk * 12; l.children[0].material = mat(0xffc27a, { emissive: 0xffc27a, emissiveIntensity: dusk ? 3 : 0.2 }); }); p.paveM.roughness = lerp(0.6, 0.12, dusk); p.paveM.metalness = lerp(0.05, 0.25, dusk);
  if (o.sun) { p.key.position.copy(V(o.sun)); } else p.key.position.set(12, 18, 14); p.hero.kit.set(o.lvl ?? 3, O, o.kit || {}); return p.hero; }
const GPOS = [-0.2, 0, 1.12];
function guardAt(O) { const G = PZ.guard; const up = eIO(seg(O, RISE, RISE + 0.7)); const tie = O < TIED ? Math.sin(O * 14) : 0;
  const kneel = { ...KNEEL, spineX: 0.55, headX: 0.35, arms: [[-0.75 + 0.08 * tie, 0.2, -0.1, 0.5], [-0.75 - 0.08 * tie, -0.2, 0.1, 0.5]] };
  const stand = { ...idle(O, 3), arms: [[0, 0, 0.12, 0.15], [-0.25, 0, -2.3, 2.3]], headZ: 0.1 };
  const p = up > 0 ? { bob: lerp(-0.42, 0, up), spineX: lerp(0.55, 0.02, up), headX: lerp(0.35, 0, up), legs: [[lerp(1.5, 0, up), lerp(1.6, 0, up)], [lerp(0.05, 0, up), lerp(1.5, 0, up)]], arms: up > 0.6 ? stand.arms : kneel.arms } : kneel;
  const gp = [lerp(GPOS[0], -1.25, up), 0, lerp(GPOS[2], 0.9, up)]; hp(G, O, gp, lerp(Math.PI, 0.6, up), p, 'calm', 'guard'); G.glasses.visible = true; PZ.gb.visible = true; PZ.gb.position.set(gp[0], 0.012, gp[2]); }
shot(T10, T10 + 3.3, 'plaza', { ease: 'lin', p0: [4.0, 1.5, 1.7], p1: [3.7, 1.45, 1.6], l0: [-0.2, 0.85, 0.6], fov: 40 }, (lt, O) => { const h = plazaBase(O, { kit: { untied: O < TIED } }); hp(h, O, [0, 0, 0], 0, { ...idle(O), headX: 0.3 }, 'smirk'); PZ.hb.visible = true; PZ.hb.position.set(0, 0.012, 0); guardAt(O); }, { grade: 'plaza' });
shot(T10 + 3.3, tE(10), 'plaza', { ease: 'io', p0: [1.7, 0.8, 2.6], p1: [1.8, 2.0, 3.8], l0: [-0.3, 0.35, 0.3], l1: [-0.05, 1.9, 0], fov: 44 }, (lt, O) => { const h = plazaBase(O, { kit: { untied: O < TIED } }); const look = seg(O, T10 + 5.6, T10 + 6.0);
  hp(h, O, [0, 0, 0], 0.15, { ...idle(O), headX: lerp(0.32, 0, look), arms: [[0, 0, 0.12, 0.15], [-0.85, 0, -0.32, 1.25]] }, look > 0.5 ? 'smirk' : 'calm'); PZ.hb.visible = true; PZ.hb.position.set(0, 0.012, 0); guardAt(O); }, { grade: 'plaza' });
