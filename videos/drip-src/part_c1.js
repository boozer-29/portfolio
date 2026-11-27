// ===== Home (title, Day 1, END) =====
const HM = S.home;
function homeBase(O, o = {}) { resetRig(HM.hero); HM.hero.root.visible = false; resetRig(HM.mum); HM.mum.root.visible = false; HM.thread.visible = false; HM.hinge.rotation.y = -1.45 * (o.door ?? 1);
  HM.hero.kit.set(o.lvl ?? 0, O, o.kit || {}); HM.dust.rotation.y = O * 0.02; HM.dust.position.y = Math.sin(O * 0.3) * 0.05; HM.sun.intensity = 3.2 * (0.25 + 0.75 * (o.door ?? 1)); HM.shaft.material.opacity = 0.16 * (o.door ?? 1); return HM.hero; }
const MUMP = [-0.55, 0, -1.2];
function mumStern(O, o = {}) { const M = HM.mum; hp(M, O, MUMP, Math.PI + (o.turn || 0), { ...idle(O, 1), ...CROSS, headX: -0.08, headY: o.headY || 0, spineX: -0.04 }, 'calm', 'mum'); M.brows[0].rotation.z = -0.32; M.brows[1].rotation.z = 0.32; M.brows.forEach(b => b.position.y = 0.47); }
const T1 = tS(1);
shot(0, 3.0, 'home', { ease: 'io', p0: [-1.3, 2.3, -4.6], p1: [-1.25, 2.25, -4.15], l0: [1.43, 1.85, -2.5], l1: [1.43, 1.9, -2.45], fov: 46 }, (lt, O) => { const h = homeBase(O, { lvl: 0 }); const tug = Math.sin(O * 3) * 0.5 + 0.5;
  hp(h, O, [0.62, 0, -2.45], Math.PI / 2, { ...idle(O), arms: [[-0.35 - 0.2 * tug, 0, 0.32, 1.1 + 0.2 * tug], [-0.35 - 0.2 * (1 - tug), 0, -0.32, 1.1 + 0.2 * (1 - tug)]], headX: 0.05, spineZ: Math.sin(O * 1.4) * 0.05 }, 'smirk'); }, { grade: 'home', dof: 0.35 });
const doorWalk = (O, t0, t1) => { const k = seg(O, t0, t1); return [lerp(0.3, 0.2, k), 0, lerp(-2.4, -5.0, k)]; };
shot(T1, T1 + 2.3, 'home', { ease: 'lin', p0: [0.35, 0.36, 0.9], p1: [0.35, 0.4, 0.45], l0: [0.15, 1.1, -5.2], fov: 50 }, (lt, O) => { const h = homeBase(O, { lvl: 0, door: eIO(seg(O, T1 + 1.5, T1 + 2.3)) }); const w = O < T1 + 1.5;
  hp(h, O, doorWalk(O, T1, T1 + 1.5), Math.PI, w ? walk(O, 7.5, 0.9) : { ...idle(O), arms: [[0, 0, 0.12, 0.15], [-0.9 - 0.3 * seg(O, T1 + 1.5, T1 + 1.9), 0, -0.25, 0.4]] }, 'calm'); mumStern(O); }, { grade: 'home' });
shot(T1 + 2.3, T1 + 5.1, 'home', { ease: 'lin', p0: [1.2, 2.3, -6.3], p1: [1.15, 2.25, -5.8], l0: [-0.55, 2.0, -1.2], fov: 38 }, (lt, O) => { const h = homeBase(O, { lvl: 0 }); hp(h, O, [0.15, 0, -5.0], 0.15, { ...idle(O) }, 'calm'); mumStern(O); }, { grade: 'home', dof: 0.4 });
const SPIN = T1 + 5.15, LEAVE = T1 + 7.0;
function heroDoor(O, o = {}) { const h = HM.hero; const sp = eIO(seg(O, SPIN, SPIN + 0.45)); const out = seg(O, LEAVE, LEAVE + 0.7); const ta = eOut(seg(O, SPIN + 0.4, SPIN + 0.7));
  const pos = [0.15, 0, lerp(-5.0, -6.6, out)]; const ry = out > 0 ? Math.PI : sp * Math.PI * 2;
  hp(h, O, pos, ry, out > 0 ? walk(O, 7.5, 1) : { ...idle(O), arms: [[-0.35 * ta, 0, 0.12 + 0.95 * ta, 0.15 + 0.25 * ta], [-0.35 * ta, 0, -0.12 - 0.95 * ta, 0.15 + 0.25 * ta]], spineX: -0.06 * ta }, ta > 0.5 ? 'smile' : 'calm');
  if (out > 0) { HM.thread.visible = true; const a = wp(HM.handle), b = wp(h.arms[1].el).add(V([0, -0.38, 0])); HM.thread.position.copy(a).add(b).multiplyScalar(0.5); HM.thread.scale.set(1, a.distanceTo(b), 1); HM.thread.quaternion.setFromUnitVectors(V([0, 1, 0]), b.clone().sub(a).normalize()); } }
shot(T1 + 5.1, tE(1), 'home', { ease: 'lin', p0: [0.45, 2.0, -0.9], p1: [0.4, 1.95, -1.5], l0: [0.15, 1.65, -5.0], fov: 52 }, (lt, O) => { homeBase(O, { lvl: 0 }); heroDoor(O); }, { grade: 'home', dof: 0.3 });
const TE = tS('END');
shot(TE, TE + 0.9, 'home', { ease: 'lin', p0: [0.35, 0.36, 0.9], p1: [0.35, 0.38, 0.65], l0: [0.15, 1.1, -5.2], fov: 50 }, (lt, O) => { const h = homeBase(O, { lvl: 5, kit: { glow: 1.6 } }); hp(h, O, [0.15, 0, lerp(-6.2, -5.1, eOut(lt))], 0, walk(O, 7.5, 0.7), 'smile'); mumStern(O); }, { grade: 'home' });
shot(TE + 0.9, TE + 4.0, 'home', { ease: 'lin', p0: [1.2, 2.3, -6.3], p1: [1.15, 2.25, -5.8], l0: [-0.55, 2.0, -1.2], fov: 38 }, (lt, O) => { const h = homeBase(O, { lvl: 5, kit: { glow: 1.6 } }); hp(h, O, [0.15, 0, -5.0], 0.15, { ...idle(O) }, 'smile'); mumStern(O); }, { grade: 'home', dof: 0.4 });
shot(TE + 4.0, DUR + 0.1, 'home', { ease: 'lin', p0: [0.45, 2.1, -1.4], p1: [0.4, 2.05, -2.1], l0: [0.15, 1.85, -5.0], fov: 46 }, (lt, O) => { const h = homeBase(O, { lvl: 5, kit: { glow: 1.6 } }); const sag = eIO(seg(O, TE + 4.1, TE + 4.9));
  hp(h, O, [0.15, 0, -5.0], 0, { ...idle(O), bob: -0.04 * sag, spineX: 0.18 * sag, headX: 0.22 * sag, arms: [[0.05, 0, 0.1, 0.1], [0.05, 0, -0.1, 0.1]] }, sag > 0.5 ? 'worried' : 'smile'); }, { grade: 'home', dof: 0.3 });

// ===== The street (Days 3, 5, 10, 15, 18) =====
const SS = S.street;
function streetBase(O, o = {}) { const s = SS; resetRig(s.hero); s.hero.root.visible = false; s.hero.kit.set(o.lvl ?? 1, O, o.kit || {}); s.bus.visible = false; s.drops.forEach(d => d.m.visible = false); s.melt.forEach(m => m.visible = false); s.smoke.forEach(m => m.visible = false); s.beam.visible = false; s.hit.visible = false;
  s.pigeons.forEach(p => p.visible = false); s.umbs.forEach(P => { resetRig(P); P.root.visible = false; }); s.rain.visible = false; s.mirrorG.rotation.set(0, 0, 0); s.mirrorG.scale.set(1, 1, 1); s.bumper.rotation.set(0, 0, 0); s.lid.rotation.set(0, 0, 0);
  const t = V(o.focus || [0, 0, -3]); s.key.target.position.copy(t); s.key.position.copy(t).add(V(o.sunDir || [14, 24, 30])); s.key.intensity = o.sun ?? 1.8; s.key.color.setHex(o.sunC ?? 0xfff0d8); s.hemi.intensity = o.hemi ?? 0.75; s.sc.environmentIntensity = o.env ?? 0.5; return s.hero; }
// --- Day 3: white trainers, hopping kerb -> bin -> bench while the bus sprays the pavement
const T3 = tS(3);
const HOPS = [[T3, -6.6, 0.12, -3.95, 0], [T3 + 2.65, -1.15, 0.12, -3.9, 0], [T3 + 3.05, 0.35, 1.29, -3.75, 1], [T3 + 3.65, 2.9, 0.79, -4.15, 1]];
function hopAt(O) { let i = 0; while (i < HOPS.length - 1 && O >= HOPS[i + 1][0]) i++; const a = HOPS[i], b = HOPS[Math.min(i + 1, HOPS.length - 1)]; if (a === b || O < a[0]) return { p: [a[1], a[2], a[3]], air: 0, k: 1, walk: 0 };
  const k = seg(O, a[0], b[0]); const hop = b[4]; const y = lerp(a[2], b[2], k) + (hop ? 0.75 * Math.sin(Math.PI * k) : 0); return { p: [lerp(a[1], b[1], k), y, lerp(a[3], b[3], k)], air: hop ? Math.sin(Math.PI * k) : 0, k, walk: hop ? 0 : 1 }; }
const BUSX = (O) => -16 + (O - (T3 + 2.4)) * 13;
function day3(O) { const h = streetBase(O, { lvl: 1, focus: [0, 0, -3.5] }); const H_ = hopAt(O); const onBench = O >= HOPS[3][0];
  const p = H_.walk ? walk(O, 8, 0.85) : onBench ? { ...idle(O), bob: -0.06, legs: [[0.25, 0.5], [0.25, 0.5]], arms: [[-0.25, 0, 1.15, 0.2], [-0.25, 0, -1.15, 0.2]], spineX: 0.08, headY: Math.sin(O * 3) * 0.15 } : { bob: -0.1 * H_.air, legs: [[0.9 * H_.air, 1.4 * H_.air], [0.7 * H_.air, 1.5 * H_.air]], arms: [[-0.5, 0, 0.9 * H_.air + 0.2, 0.4], [-0.5, 0, -0.9 * H_.air - 0.2, 0.4]], spineX: 0.15 };
  hp(h, O, H_.p, onBench ? Math.PI / 2 + 0.55 * eOut(seg(O, HOPS[3][0] + 0.2, HOPS[3][0] + 0.6)) : Math.PI / 2, p, onBench && O > T3 + 3.55 ? 'grit' : 'smirk');
  if (O > HOPS[2][0] - 0.1 && O < HOPS[2][0] + 0.6) SS.lid.rotation.z = Math.sin((O - HOPS[2][0]) * 30) * 0.08 * (1 - seg(O, HOPS[2][0], HOPS[2][0] + 0.6));
  const bx = BUSX(O); SS.bus.visible = bx > -40 && bx < 40; SS.bus.position.x = bx;
  const t0 = T3 + 2.4 + (1.6 + 16) / 13; SS.drops.forEach(d => { const dt = O - t0 - d.d; if (dt < 0 || dt > 1.3) return; d.m.visible = true; d.m.position.set(1.6 + d.a * 1.6 * dt + 2.0 * dt, Math.max(0.05, 0.1 + d.u * dt - 4.9 * dt * dt), -2.35 - d.v * dt * 0.55); }); }
shot(T3, T3 + 2.3, 'street', { pf: (O) => V([hopAt(O).p[0] + 0.55, 0.3, -1.8]), lf: (O) => V([hopAt(O).p[0] + 0.2, 0.3, -3.95]), fov: 32 }, (lt, O) => day3(O), { grade: 'street' });
shot(T3 + 2.3, tE(3), 'street', { ease: 'lin', p0: [8.6, 1.9, -5.35], p1: [7.9, 2.0, -5.3], l0: [-1.0, 2.3, -3.7], l1: [2.6, 2.6, -3.9], fov: 52 }, (lt, O) => day3(O), { grade: 'street' });
// --- Day 5: the pigeons copy his fit
const T5 = tS(5), PG = [[8.4, -4.3], [7.6, -4.9], [7.9, -3.8], [9.0, -4.8], [9.1, -3.9], [7.2, -4.25], [8.5, -5.3], [8.0, -4.6]];
function pigeons(O, turnT, o = {}) { SS.pigeons.forEach((p, i) => { p.visible = true; const [x, z] = PG[i]; const t = eIO(seg(O, turnT + i * 0.06, turnT + 0.35 + i * 0.06)); const strut = O > turnT + 0.6 ? Math.sin(O * 6 + i) * 0.04 : 0; p.position.set(x + strut, 0.12, z); p.rotation.y = lerp(-Math.PI / 2, Math.PI / 2, t) + 0.15 * Math.sin(i);
  const hd = p.userData.head; const peck = t < 0.01 ? Math.max(0, Math.sin(O * 5 + i * 1.3)) * 0.6 : 0; hd.rotation.x = peck + (O > turnT + 0.6 ? 0.12 * Math.sin(O * 8 + i) : 0); hd.position.z = 0.17 + 0.03 * Math.sin(O * 8 + i);
  if (i === 0 && o.talk) { const tk = talking('pigeon', O); hd.children[2].scale.y = tk ? 1 + 1.4 * Math.abs(Math.sin(O * 20)) : 1; hd.rotation.x = tk ? -0.15 + 0.12 * Math.sin(O * 9) : hd.rotation.x; } }); }
const HP5 = (O) => [lerp(4.2, 6.2, eOut(seg(O, T5, T5 + 2.6))), 0.12, -4.5];
shot(T5, T5 + 3.0, 'street', { ease: 'lin', p0: [12.4, 0.75, -4.0], p1: [11.8, 0.8, -4.05], l0: [6.6, 1.6, -4.45], l1: [6.6, 1.75, -4.45], fov: 44 }, (lt, O) => { const h = streetBase(O, { lvl: 2, focus: [7, 0, -4] }); hp(h, O, HP5(O), Math.PI / 2, O < T5 + 2.6 ? walk(O, 7.5, 0.8) : { ...idle(O), headX: 0.3 }, 'calm'); pigeons(O, T5 + 1.6); }, { grade: 'street' });
shot(T5 + 3.0, T5 + 5.4, 'street', { ease: 'lin', p0: [9.75, 0.5, -4.05], p1: [9.55, 0.5, -4.1], l0: [8.4, 0.55, -4.3], fov: 40 }, (lt, O) => { const h = streetBase(O, { lvl: 2, focus: [7, 0, -4] }); hp(h, O, HP5(O), Math.PI / 2, { ...idle(O), headX: 0.3 }, 'calm'); pigeons(O, T5 + 1.6, { talk: true }); }, { grade: 'street' });
shot(T5 + 5.4, tE(5), 'street', { ease: 'lin', p0: [9.3, 1.2, -4.1], p1: [9.1, 1.25, -4.15], l0: [6.2, 2.0, -4.5], fov: 44 }, (lt, O) => { const h = streetBase(O, { lvl: 2, focus: [7, 0, -4] }); hp(h, O, HP5(O), Math.PI / 2, { ...idle(O), headX: 0.2, headZ: 0.12 }, 'confused'); pigeons(O, T5 + 1.6); }, { grade: 'street', dof: 0.4 });
// --- Day 10: the chain's glare melts a car's wing mirror
const T10 = tS(10), BEAM0 = T10 + 0.9, MELT0 = T10 + 2.0;
function day10(O, o = {}) { const h = streetBase(O, { lvl: 3, sun: 2.6, sunC: 0xffe6b8, env: 0.6, focus: [-12, 0, -3.5], sunDir: [-10, 26, -14], kit: { glasses: o.glasses } }); const k = eOut(seg(O, T10, T10 + 3.0));
  const pos = o.pos || [lerp(-19.5, -16.2, k), 0.12, -4.6]; hp(h, O, pos, o.ry ?? Math.PI / 2, o.pose ? o.pose(O) : (k < 0.98 ? walk(O, 7.2, 0.8) : { ...idle(O) }), o.expr || 'smirk'); h.glasses.visible = !!o.glasses;
  const melt = eIn(seg(O, MELT0, MELT0 + 3.5)); SS.mirrorM.material.emissiveIntensity = 1.6 * seg(O, MELT0 - 0.6, MELT0 + 1.0); SS.mirrorG.rotation.set(0, 0, -0.9 * melt); SS.mirrorG.scale.set(1, 1 + 1.2 * melt, 1 - 0.3 * melt); SS.bumper.rotation.z = 0.35 * eIn(seg(O, MELT0 + 1.0, MELT0 + 4.0)); SS.bumper.position.y = 0.45 - 0.15 * eIn(seg(O, MELT0 + 1.0, MELT0 + 4.0));
  const mp = wp(SS.mirrorG); SS.melt.forEach((m, i) => { const t0 = MELT0 + 0.6 + i * 0.25, dt = (O - t0) % 1.1; if (O < t0) return; m.visible = true; m.position.set(mp.x + 0.05 * Math.sin(i * 7), mp.y - 0.15 - 2.2 * dt * dt, mp.z - 0.17 + 0.05 * Math.cos(i * 3)); });
  SS.smoke.forEach((s, i) => { const t0 = MELT0 + 0.3 + i * 0.22, dt = (O - t0) % 2.2; if (O < t0) return; s.visible = true; s.position.set(mp.x + 0.2 * Math.sin(i * 2.1) + 0.2 * dt, mp.y + 0.1 + 0.8 * dt, mp.z - 0.1 + 0.15 * Math.cos(i)); s.scale.setScalar(0.3 + 0.7 * dt); s.material.opacity = 0.5 * (1 - dt / 2.2); });
  if (O > BEAM0 && !o.noBeam) { const a = wp(h.kit.chain.pend), b = mp.clone().add(V([0, 0, -0.17])); SS.beam.visible = true; SS.beam.position.copy(a).add(b).multiplyScalar(0.5); SS.beam.scale.set(1, a.distanceTo(b), 1); SS.beam.quaternion.setFromUnitVectors(V([0, 1, 0]), a.clone().sub(b).normalize()); SS.beam.material.opacity = 0.45 + 0.15 * Math.sin(O * 31);
    SS.hit.visible = true; SS.hit.position.copy(a); SS.hit.scale.setScalar(1.3 + 0.3 * Math.sin(O * 17)); } }
shot(T10, T10 + 3.4, 'street', { ease: 'lin', p0: [-7.0, 0.85, -4.05], p1: [-8.0, 0.9, -4.0], l0: [-15.5, 1.6, -3.7], fov: 42 }, (lt, O) => day10(O), { grade: 'sun', bloom: 0.2 });
shot(T10 + 3.4, T10 + 6.2, 'street', { ease: 'lin', p0: [-9.65, 1.3, -4.6], p1: [-10.0, 1.22, -4.4], l0: [-10.95, 1.05, -3.35], fov: 42 }, (lt, O) => day10(O), { grade: 'sun', bloom: 0.25 });
shot(T10 + 6.2, tE(10), 'street', { ease: 'lin', p0: [-12.4, 1.95, -6.0], p1: [-12.7, 2.0, -5.8], l0: [-15.8, 1.9, -4.6], fov: 44 }, (lt, O) => day10(O, { glasses: true, noBeam: true, pos: [-16.2, 0.12, -4.6], ry: Math.PI / 2 - 0.35, expr: 'worried',
  pose: (O) => ({ ...idle(O), arms: [[-2.3, 0, 0.75, 0.2 + 0.1 * Math.sin(O * 6)], [-0.55, 0, -0.75, 0.5 + 0.2 * Math.sin(O * 7)]], headX: -0.08 }) }), { grade: 'sun', dof: 0.35 });
// --- Day 15 (pause beat): through the shop window, he meets his reflection, and faints
const T15 = tS(15), FAINT = T15 + 6.6;
shot(T15, tE(15), 'street', { ease: 'lin', p0: [15.6, 2.1, -9.2], p1: [15.6, 2.15, -8.6], l0: [15.6, 2.3, -4.6], fov: 46 }, (lt, O) => { const h = streetBase(O, { lvl: 5, focus: [15.6, 0, -5], sunDir: [10, 24, 20], kit: { sparkS: 1.4 } });
  const wk = seg(O, T15, T15 + 1.6), tn = eIO(seg(O, T15 + 1.5, T15 + 2.1)), lean = eIO(seg(O, T15 + 2.4, T15 + 3.6)), f = eIn(seg(O, FAINT, FAINT + 0.45));
  hp(h, O, [lerp(12.4, 15.6, eOut(wk)), 0.12, -4.95], lerp(Math.PI / 2, Math.PI, tn), wk < 1 ? walk(O, 7.2, 0.8) : { ...idle(O), spineX: 0.12 * lean, headX: 0.05 * lean, arms: [[-0.2 * lean, 0, 0.2, 0.3], [-0.2 * lean, 0, -0.2, 0.3]] }, lean > 0.5 ? (O > T15 + 3.9 ? 'shock' : 'smile') : 'calm'); h.root.rotation.x = -1.5 * f; }, { grade: 'street', dof: 0.45 });
// --- Day 18: the umbrella ring around him in the closed street, rain
const T18 = tS(18), CTR = [-2, 0, 0.6];
function umbRing(O) { SS.umbs.forEach((P, i) => { const a = i / SS.umbs.length * 6.283 + 0.2; const pos = [CTR[0] + Math.cos(a) * 2.8, 0, CTR[2] + Math.sin(a) * 2.8]; hp(P, O, pos, Math.atan2(CTR[0] - pos[0], CTR[2] - pos[2]), { ...idle(O, i), arms: [[0, 0, 0.12, 0.15], [-0.6, 0, -0.15, 1.1]], headX: -0.05 }, i % 2 ? 'calm' : 'smile', 'x'); const hnd = wp(P.arms[1].el).add(V([0, -0.3, 0])); P.umb.position.copy(hnd).add(V([0, -0.4, 0])).lerp(V([CTR[0], hnd.y - 0.4, CTR[2]]), 0.12); P.umb.rotation.set(0.12 * Math.sin(i), 0, 0.12 * Math.cos(i)); }); }
function rainAt(O) { SS.rain.visible = true; const m4 = new THREE.Matrix4(); SS.rainD.forEach((d, i) => { const y = ((d[1] - O * d[3]) % 12 + 12) % 12; m4.makeTranslation(CTR[0] + d[0], y, CTR[2] + d[2]); SS.rain.setMatrixAt(i, m4); }); SS.rain.instanceMatrix.needsUpdate = true; }
