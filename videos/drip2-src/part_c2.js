// ===== Day 12: bullet time in the rain =====
const T12 = tS(12); const F0 = T12 + 1.2, F1 = T12 + 4.4, SIZZ = T12 + 3.6;
const rainM4 = new THREE.Matrix4(), rainQ = new THREE.Quaternion();
function rainAt(O) { const p = PZ; p.rain.visible = true; const tf = O >= F0 && O < F1 ? F0 : O; const frozen = O >= F0 && O < F1;
  p.RD.forEach((d, i) => { let y = ((d.y - d.s * tf) % 8 + 8) % 8, x = d.x, z = d.z; const r = Math.hypot(x, z);
    if (y < 2.8 && r < 1.25) { const push = (1.25 - r) * (frozen ? 1 : 0.6); x += x / (r + 1e-3) * push; z += z / (r + 1e-3) * push; }
    rainM4.compose(V([x, y, z]), rainQ, V([1, frozen ? 0.7 : 1.6, 1])); p.rain.setMatrixAt(i, rainM4); }); p.rain.instanceMatrix.needsUpdate = true;
  const k = seg(O, SIZZ, SIZZ + 1.0); p.steam.forEach((s, i) => { s.visible = k > 0 && k < 1; s.position.set(0.32 + Math.sin(i * 2.1) * 0.12 * k, 2.25 + k * (0.4 + i * 0.08), 0.1 + Math.cos(i * 1.7) * 0.1 * k); s.scale.setScalar(0.12 + 0.3 * k); s.material.opacity = 0.7 * (1 - k); }); }
function rainHero(O) { const h = plazaBase(O, { dusk: 1, lvl: 4 }); PZ.hb.visible = true; PZ.hb.position.set(0, 0.012, 0); return h; }
const RPOSE = (Of) => ({ ...idle(Of), headX: -0.3, arms: [[0, 0, 0.12, 0.15], [-0.85, 0, -0.55, 0.35]] });
shot(T12, F0, 'plaza', { ease: 'lin', p0: [1.4, 1.85, 3.9], p1: [1.3, 1.85, 3.6], l0: [0, 1.95, 0], fov: 44 }, (lt, O) => { const h = rainHero(O); rainAt(O); hp(h, O, [0, 0, 0], 0.35, RPOSE(O), 'confused'); }, { grade: 'rain' });
shot(F0, F1, 'plaza', { ease: 'lin', pf: (O) => { const a = 0.35 + Math.PI * 2 * eIO(seg(O, F0, F1)); return V([Math.sin(a) * 3.7, 1.75 + 0.25 * Math.sin(seg(O, F0, F1) * Math.PI), Math.cos(a) * 3.7]); }, lf: () => V([0, 1.8, 0]), fov: 46 }, (lt, O) => { const h = rainHero(O); rainAt(O); hp(h, O, [0, 0, 0], 0.35, RPOSE(F0), 'calm'); h.pupils.forEach(p => p.position.x += 0.04 * Math.sin(O * 3)); }, { grade: 'freeze', live: 0 });
shot(F1, tE(12), 'plaza', { ease: 'lin', p0: [0.95, 2.0, 3.3], p1: [0.9, 2.0, 3.0], l0: [0, 2.0, 0], fov: 44 }, (lt, O) => { const h = rainHero(O); rainAt(O); const g = eOut(seg(O, F1 + 0.3, F1 + 0.8));
  hp(h, O, [0, 0, 0], 0.3, { ...idle(O), headX: -0.04, arms: [[lerp(0, -0.5, g), 0, lerp(0.12, 0.3, g), lerp(0.15, 1.35, g)], [lerp(-0.85, -0.5, g), 0, lerp(-0.55, -0.3, g), lerp(0.35, 1.35, g)]] }, 'smirk'); }, { grade: 'rain', dof: 0.3 });
// ===== Day 15: the courtroom sketch =====
const CT = S.court, T15 = tS(15); const GAVEL = T15 + 7.6; const JPOS = [0, 0.9, -3.6], DPOS = [2.6, 0.375, 1.8], DRY = -2.69;
function courtBase(O) { const c = CT; resetRig(c.hero); c.hero.kit.set(4, O); resetRig(c.judge);
  const lean = eIO(seg(O, T15 + 5.0, T15 + 5.6)) * (1 - eIO(seg(O, GAVEL - 0.6, GAVEL - 0.3))); const up = seg(O, GAVEL - 0.45, GAVEL - 0.05), dn = seg(O, GAVEL - 0.05, GAVEL);
  const ga = -0.6 - 1.6 * eOut(up) + 1.6 * eIn(dn);
  hp(c.judge, O, JPOS, 0, { ...SIT, spineX: 0.05 + 0.42 * lean, headX: 0.1 - 0.25 * lean, arms: [[-0.55, 0, 0.2, 0.9], [ga, 0, -0.25, 0.7]] }, lean > 0.3 ? 'confused' : 'grit', 'judge');
  const hand = wp(c.judge.arms[1].el).add(V([0, -0.42, 0])); c.gavel.position.copy(hand); c.gavel.rotation.set(-ga - 1.2, 0, 0.3);
  c.pub.forEach((P, i) => { pose(P, { ...SIT, ...idle(O, i), bob: -0.38 }); P.root.rotation.y = Math.PI + 0.15 * (i - 2.5); P.face(i % 2 ? 'shock' : 'calm', O, false); });
  return c.hero; }
const proud = (O) => ({ ...idle(O), headX: -0.15, spineX: -0.06, arms: [[-0.95, 0, -0.38, 1.5], [0, 0, -0.15, 0.15]] });
shot(T15, T15 + 2.3, 'court', { ease: 'lin', p0: [1.7, 1.9, 1.4], p1: [1.55, 1.95, 1.0], l0: [0, 2.95, -3.5], fov: 42 }, (lt, O) => { const h = courtBase(O); hp(h, O, DPOS, DRY, { ...idle(O) }, 'worried'); }, { grade: 'court', sketch: true });
shot(T15 + 2.3, T15 + 5.3, 'court', { ease: 'lin', p0: [0.7, 2.75, -1.2], p1: [0.85, 2.75, -0.8], l0: [DPOS[0], 2.65, DPOS[2]], fov: 40 }, (lt, O) => { const h = courtBase(O); hp(h, O, DPOS, DRY, proud(O), O > T15 + 3.2 ? 'smirk' : 'calm'); }, { grade: 'court', sketch: true });
shot(T15 + 5.3, tE(15), 'court', { ease: 'io', p0: [0.55, 2.6, 0.9], p1: [0.4, 2.85, -0.4], l0: [0, 2.85, -3.0], fov: 42 }, (lt, O) => { const h = courtBase(O); hp(h, O, DPOS, DRY, proud(O), 'smirk'); }, { grade: 'court', sketch: true, shakeAt: [[GAVEL, 0.01]] });
// ===== Day 18: CCTV in the alley =====
const AL = S.alley, T18 = tS(18); const JUMP = T18 + 3.0;
const MG = [{ from: [-1.65, -1.2], to: [-0.85, -0.55] }, { from: [1.7, -3.0], to: [0.9, -2.0] }];
function alleyBase(O) { const a = AL; resetRig(a.hero); a.hero.kit.set(4, O); a.muggers.forEach(P => { resetRig(P); P.wallet.visible = false; }); return a.hero; }
const CCTV = { ease: 'lin', p0: [1.85, 4.7, 4.9], l0: [-0.1, 0.8, -2.4], fov: 74 };
shot(T18, JUMP, 'alley', CCTV, (lt, O) => { const h = alleyBase(O); const hz = lerp(-6.5, -1.3, eOut(seg(O, T18, T18 + 1.8)));
  hp(h, O, [0, 0, hz], 0, O < T18 + 1.8 ? walk(O, 7.5, 1) : { ...idle(O) }, O > T18 + 2.0 ? 'worried' : 'calm'); AL.hb.position.set(0, 0.012, hz);
  AL.muggers.forEach((P, i) => { const k = eOut(seg(O, T18 + 1.3, T18 + 2.0)); const m = MG[i]; const x = lerp(m.from[0], m.to[0], k), z = lerp(m.from[1], m.to[1], k);
    hp(P, O, [x, 0, z], Math.atan2(0 - x, hz - z), k < 1 ? walk(O, 7, 0.8) : { ...idle(O, i), headX: 0.4 * Math.sin(seg(O, T18 + 2.0, JUMP) * Math.PI * 1.5) }, 'calm', 'mugger'); P.blob.position.set(x, 0.012, z); }); }, { grade: 'cctv', cctv: true, fps: 12, live: 0 });
shot(JUMP, tE(18), 'alley', CCTV, (lt, O) => { const h = alleyBase(O); const fan = Math.sin(O * 5);
  hp(h, O, [0, 0, -1.3], 0, { ...idle(O), arms: [[-0.7, 0, 0.45, 0.9 + 0.1 * fan], [-0.7, 0, -0.45, 0.9 - 0.1 * fan]] }, 'smirk'); AL.hb.position.set(0, 0.012, -1.3);
  [0, 1].forEach(i => { const w = wp(h.arms[i].el).add(V([0, -0.45, 0.06])); const wl = AL.muggers[i].wallet; wl.visible = true; wl.position.copy(w); wl.rotation.set(0.3, 0, 0.2 * fan); });
  AL.muggers.forEach((P, i) => { const z = lerp(-2.2 - i * 0.6, -8.5, seg(O, JUMP, JUMP + 4.0)), x = (i ? 0.7 : -0.7); const c = Math.sin(O * 16 + i) * 0.5 + 0.5;
    hp(P, O, [x, 0, z], Math.PI, { ...walk(O, 6.5, 0.7), arms: [[-1.1, 0, -0.25 + 0.18 * c, 0.7], [-1.1, 0, 0.25 - 0.18 * c, 0.7]] }, 'smile', 'mugger'); P.blob.position.set(x, 0.012, z); }); }, { grade: 'cctv', cctv: true, fps: 12, live: 0 });
// ===== Day 22: the gallery =====
const GL = S.gallery, T22 = tS(22); const PP = [[-1.15, 1.1], [1.15, 1.1], [1.15, -1.1], [-1.15, -1.1]];
function galleryBase(O) { const g = GL; resetRig(g.hero); g.hero.kit.set(5, O, { glow: 0.6 }); hp(g.hero, O, [0, 0, 0], 0, { ...KNEEL, spineX: 0.3, headX: 0.25, arms: [[-0.6, 0.15, -0.05, 0.35], [-0.6, -0.15, 0.05, 0.35]] }, 'calm');
  g.posts.forEach((p, i) => { const t = T22 + 0.9 + i * 0.5; p.visible = O > t; p.position.set(PP[i][0], 0.35 * (1 - eOut(seg(O, t, t + 0.25))), PP[i][1]); });
  g.ropes.forEach((r, i) => { const a = PP[i], b = PP[(i + 1) % 4]; r.visible = O > T22 + 3.0; r.position.set((a[0] + b[0]) / 2, 0.88, (a[1] + b[1]) / 2); r.scale.set(1, Math.hypot(b[0] - a[0], b[1] - a[1]), 1); r.rotation.set(0, Math.atan2(b[0] - a[0], b[1] - a[1]), Math.PI / 2); r.rotation.order = 'YXZ'; r.rotation.set(Math.PI / 2, Math.atan2(b[0] - a[0], b[1] - a[1]), 0); });
  g.plaque.visible = O > T22 + 3.2; g.plaque.position.set(0, 0, 1.65);
  const ai = clamp(Math.floor((O - T22 - 0.6) / 0.5), 0, 3); const ap = O < T22 + 3.4 ? [PP[ai][0] * 1.45, PP[ai][1] * 1.45] : [2.6, 1.6]; const aw = O > T22 + 0.4 && O < T22 + 3.4;
  hp(g.attendant, O, [ap[0], 0, ap[1]], Math.atan2(-ap[0], -ap[1]), aw ? { ...idle(O), spineX: 0.3, arms: [[-0.7, 0, 0.2, 0.4], [-0.7, 0, -0.2, 0.4]] } : { ...idle(O), ...CROSS }, 'calm', 'npc');
  g.visitors.forEach((P, i) => { const a = Math.PI + (i - 4.5) * 0.32, r = 3.0 + (i % 2) * 0.9; const tx = Math.sin(a) * r, tz = Math.cos(a) * r - 0.4; const t0 = T22 + 1.2 + i * 0.25; const k = eOut(seg(O, t0, t0 + 1.6));
    const sx = tx * 3.2, sz = tz - 3; const x = lerp(sx, tx, k), z = lerp(sz, tz, k); hp(P, O, [x, 0, z], k < 1 ? Math.atan2(tx - sx, tz - sz) : Math.atan2(-tx, -tz), k < 1 ? walk(O, 7, 0.8) : { ...idle(O, i), headX: 0.15 }, i % 3 ? 'shock' : 'smile', 'npc'); P.blob.position.set(x, 0.012, z); });
  const cx = -2.1, cz = -1.0; const dab = O > T22 + 4.0; hp(g.critic, O, [cx, 0, cz], Math.atan2(-cx, -cz), { ...idle(O), headZ: 0.12, arms: [[0, 0, 0.12, 0.15], dab ? [-1.2, 0, -0.95, 1.6] : [0, 0, -0.12, 0.15]] }, dab ? 'worried' : 'shock', 'npc');
  g.hanky.visible = dab; if (dab) { g.hanky.position.copy(wp(g.critic.arms[1].el).add(V([0, -0.42, 0]))); g.hanky.rotation.y = Math.sin(O * 6) * 0.3; }
  return g.hero; }
shot(T22, T22 + 3.8, 'gallery', { ease: 'lin', p0: [0.3, 9.0, 13.0], p1: [0.3, 8.4, 12.0], l0: [0, 0.4, -1.8], fov: 44 }, (lt, O) => { galleryBase(O); }, { grade: 'gallery' });
shot(T22 + 3.8, tE(22), 'gallery', { ease: 'io', p0: [0.35, 1.45, 3.5], p1: [0.25, 1.5, 2.45], l0: [0, 1.55, 0], fov: 42 }, (lt, O) => { const h = galleryBase(O); h.headX = 0; h.neck.rotation.y = 0.35 * Math.sin(O * 1.6); h.neck.rotation.x = 0.05; }, { grade: 'gallery', dof: 0.4 });
// ===== Day 27: the corner shop =====
const CS = S.corner, T27 = tS(27); const PUT = T27 + 1.4; const HC = [0.55, 0, 0.55];
function cornerBase(O) { const c = CS; resetRig(c.hero); c.hero.kit.set(5, O, { glow: 0.7 }); const walkIn = seg(O, T27, T27 + 0.9); const hp0 = [HC[0], 0, lerp(2.4, HC[2], eOut(walkIn))]; const put = Math.sin(seg(O, PUT - 0.35, PUT + 0.35) * Math.PI);
  const faceK = eIO(seg(O, T27 + 3.4, T27 + 3.9)); hp(c.hero, O, hp0, lerp(Math.PI + 0.25, Math.PI / 2 + 0.3, faceK), walkIn < 1 ? walk(O, 7.5, 0.9) : { ...idle(O), arms: [[-0.4, 0, 0.35, 1.0], [-0.3 - 0.9 * put, 0, -0.18, 0.2 + 0.3 * put]], headX: 0.12 * put }, O > T27 + 4.6 ? 'smirk' : O > T27 + 2.6 ? 'shock' : 'calm'); c.hb.position.set(hp0[0], 0.012, hp0[2]);
  c.crisps.position.copy(wp(c.hero.arms[0].el).add(V([0, -0.42, 0.08]))); c.button.visible = O > PUT; c.bSp.visible = O > PUT; c.bSp.position.set(0.35, 1.25, -0.22); c.bSp.scale.setScalar(0.35 + 0.35 * Math.pow(Math.max(0, Math.sin(O * 4)), 4));
  const path = [[2.65, -3.3], [2.65, -1.5], [2.45, 0.6], [1.75, 1.1]]; const k = seg(O, T27 + 2.4, T27 + 4.1); const seg3 = Math.min(2, Math.floor(k * 3)), f = k * 3 - seg3; const a = path[seg3], b = path[seg3 + 1];
  const bx = lerp(a[0], b[0], f), bz = lerp(a[1], b[1], f); const dir = Math.atan2(b[0] - a[0], b[1] - a[1]); const moving = k > 0 && k < 1;
  const kp = O < T27 + 2.4 ? [-0.3, 0, -1.65] : [bx - Math.sin(dir) * 1.25, 0, bz - Math.cos(dir) * 1.25]; const kry = O < T27 + 2.4 ? 0.2 : k >= 1 ? Math.atan2(HC[0] - kp[0], HC[2] - kp[2]) : dir;
  const give = seg(O, T27 + 4.3, T27 + 4.7);
  hp(c.keeper, O, kp, kry, moving ? { ...walk(O, 7, 0.7), arms: [[-0.75, 0, 0.12, 0.3], [-0.75, 0, -0.12, 0.3]] } : O < T27 + 2.4 ? { ...idle(O), headX: 0.1 } : { ...idle(O), arms: [[0, 0, 0.12, 0.15], [-1.0 * Math.sin(give * Math.PI), 0, -0.2, 0.4]] }, O < T27 + 1.6 ? 'calm' : 'shock', 'npc');
  c.barrow.visible = O > T27 + 2.4; c.barrow.position.set(bx, 0, bz); c.barrow.rotation.y = dir; c.barrow.children[1].rotation.x = O * 6 * moving;
  c.watch.visible = give > 0; c.watch.position.copy(give < 1 ? wp(c.keeper.arms[1].el).add(V([0, -0.42, 0])).lerp(V([bx, 1.12, bz]), eIO(give)) : V([bx, 1.12, bz])); c.watch.rotation.x = Math.PI / 2;
  return c.hero; }
shot(T27, T27 + 2.3, 'corner', { ease: 'lin', p0: [1.05, 1.45, -2.7], p1: [1.0, 1.45, -2.5], l0: [0.5, 1.85, 0.6], fov: 44 }, (lt, O) => { cornerBase(O); }, { grade: 'corner', dof: 0.25 });
shot(T27 + 2.3, tE(27), 'corner', { ease: 'lin', p0: [3.5, 2.4, 3.8], p1: [3.3, 2.35, 3.5], l0: [1.0, 1.3, -0.2], fov: 50 }, (lt, O) => { cornerBase(O); }, { grade: 'corner' });
// ===== Day 30: all of London copies the £40 jacket (time-lapse) =====
const T30 = tS(30);
function lapseBase(O) { const a = (O - T30) * 0.9; const h = plazaBase(O, { cs: true, lvl: 5, sun: [Math.cos(a) * 22, 16 + 4 * Math.sin(a), Math.sin(a) * 22], kit: { glow: 1.2 } }); hp(h, O, [0, 0, 0], 0.2, { ...idle(O), arms: [[-0.2, 0, 0.62, 1.85], [-0.2, 0, -0.62, 1.85]] }, 'smirk'); PZ.hb.visible = true; PZ.hb.position.set(0, 0.012, 0);
  PZ.crowd.forEach((P, i) => { let x, z, ry, p; if (i < 9) { x = -6.4 + i * 0.85; z = -11.6 + (i % 2) * 0.12; ry = Math.PI / 2; p = idle(O, i); }
    else { const r = 2.3 + (i % 5) * 1.3, sp = (i % 2 ? 1 : -1) * (0.35 + (i % 3) * 0.12), ph = i * 1.9; const ang = ph + (O - T30) * sp * 3; x = Math.sin(ang) * r; z = Math.cos(ang) * r - 1.5; ry = ang + (sp > 0 ? Math.PI / 2 : -Math.PI / 2); p = walk(O * 2.2 + i, 7.5, 1.1); }
    hp(P, O, [x, 0, z], ry, p, 'calm', 'npc'); P.blob.visible = true; P.blob.position.set(x, 0.012, z); }); }
shot(T30, T30 + 3.2, 'plaza', { ease: 'io', p0: [1.5, 9.5, 12.5], p1: [1.2, 8.2, 10.8], l0: [-1.2, 0.8, -4.5], fov: 50 }, (lt, O) => { lapseBase(O); }, { grade: 'lapse', mblur: 3 });
shot(T30 + 3.2, tE(30), 'plaza', { ease: 'lin', p0: [-0.6, 2.7, -5.2], p1: [-0.9, 2.7, -5.8], l0: [-3.4, 3.0, -11.6], fov: 50 }, (lt, O) => { lapseBase(O); }, { grade: 'lapse', mblur: 2 });
// ===== END: back at the club; the £40 jacket is the dress code =====
const TE = tS('END'); const STOPE = TE + 1.0;
const heroE = (O) => [lerp(2.6, HX, eOut(seg(O, TE, STOPE - 0.1))), 0, lerp(2.4, HZ, eOut(seg(O, TE, STOPE - 0.1)))];
function endBase(O) { const h = clubBase(O, { lvl: 5, brown: true, lookAt: heroE(O).filter((_, i) => i !== 1), kit: { glow: 1.6 } }); return h; }
shot(TE, TE + 1.5, 'club', { ease: 'lin', p0: [1.2, 3.3, 7.6], p1: [1.0, 3.2, 7.0], l0: [-1.4, 1.5, -1.2], fov: 50 }, (lt, O) => { endBase(O); const p = heroE(O); const k = eOut(seg(O, STOPE - 0.25, STOPE));
  heroAt(CL, O, p, O < STOPE - 0.1 ? Math.atan2(HX - 2.6, HZ - 2.4) : Math.PI / 2, O < STOPE - 0.1 ? walk(O, 7.5, 1) : { ...idle(O), spineX: -0.1 * k }, 'smirk'); bouncerAt(O, { ...idle(O, 2), ...STOPARM(k) }, 'calm'); }, { grade: 'club' });
shot(TE + 1.5, TE + 2.85, 'club', { ease: 'lin', p0: [-2.8, 2.5, 2.6], p1: [-2.65, 2.5, 2.35], l0: [BX, 2.5, HZ], fov: 44 }, (lt, O) => { endBase(O); heroAt(CL, O, [HX - 0.06, 0, HZ], Math.PI / 2, { ...idle(O) }, 'smirk');
  bouncerAt(O, { ...idle(O, 2), headX: 0.08, arms: [[-0.55, 0, -0.22, 1.55], [-0.6, 0, 0.22, 1.5]] }, 'calm'); }, { grade: 'club', dof: 0.3 });
shot(TE + 2.85, TE + 4.1, 'club', { ease: 'lin', pf: () => wp(CL.bouncer.tag.children[1]).add(V([-0.9, 0.25, 0.9])), lf: () => wp(CL.bouncer.tag.children[1]).add(V([0, 0.25, 0])), fov: 40 }, (lt, O) => { endBase(O); heroAt(CL, O, [HX - 0.06, 0, HZ], Math.PI / 2, { ...idle(O) }, 'smirk'); const tap = Math.max(0, Math.sin((O - TE - 3.0) * 9));
  bouncerAt(O, { ...idle(O, 2), headX: 0.08, arms: [[-0.95, 0, -0.62, 1.2 + 0.12 * tap], [-0.95, 0.3, -0.25, 1.3]] }, 'calm'); CL.bouncer.tag.rotation.set(0, -0.6, 0.1 * tap); CL.bouncer.tag.children[1].rotation.z = Math.PI; }, { grade: 'club', live: 0.4 });
shot(TE + 4.1, DUR + 0.1, 'club', { ease: 'lin', p0: [0.75, 2.1, 0.95], p1: [0.68, 2.12, 0.75], l0: [HX, 2.1, HZ], fov: 44 }, (lt, O) => { endBase(O); const dn = Math.sin(seg(O, TE + 4.15, TE + 4.35) * Math.PI);
  heroAt(CL, O, [HX - 0.06, 0, HZ], Math.PI / 2 - 0.9, { ...idle(O), headX: 0.4 * dn }, O > TE + 4.4 ? 'shock' : 'worried'); bouncerAt(O, { ...idle(O, 2) }, 'calm'); CL.bouncer.tag.visible = false; }, { grade: 'club', dof: 0.3, dark: (O) => O > TE + 5.55 ? 1 : 0 });
