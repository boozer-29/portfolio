// ===== Day 8: the chain gets its own seat on the bus =====
const BS = S.bus, T8 = tS(8);
function busBase(O) { const sway = Math.sin(O * 1.7) * 0.012 + Math.sin(O * 4.1) * 0.004; BS.wins.forEach((w, i) => { w.material.map.offset.x = (i ? 1 : -1) * O * 0.18; }); BS.sc.rotation.z = sway; BS.seats.forEach(g => g.visible = g.position.z < 1.2);
  resetRig(BS.hero); hp(BS.hero, O, [0.95, 0.12, 0.72], 0, { ...idle(O), ...SIT, bob: SIT.bob + 0.1, headY: O > T8 + 3.4 ? -0.35 : 0.15, arms: [[-0.5, 0, 0.15, 1.0], [-0.55 - (O > T8 + 4.3 ? 0.25 * Math.max(0, Math.sin(O * 7)) : 0), 0, 0.2, 1.1]] }, 'smirk'); BS.hero.kit.set(3, O);
  BS.pile.position.set(-0.95, 0.74, 0.62); BS.pile.rotation.set(-Math.PI / 2 + 0.1, 0, 0.3); BS.pile2.position.set(-0.9, 0.86, 0.66); BS.pile2.rotation.set(-Math.PI / 2 - 0.15, 0, 2.2);
  resetRig(BS.granny); hp(BS.granny, O, [0.05, 0, 1.85], Math.PI - 0.25, { ...idle(O, 2), spineZ: sway * 3, arms: [[0.05, 0, 0.1, 0.4], [-2.4, 0, -0.35, 0.3]], headX: -0.05, headY: -0.15 }, 'calm', 'granny'); BS.granny.brows[0].rotation.z = -0.38; BS.granny.brows[1].rotation.z = 0.38; BS.granny.brows.forEach(b => b.position.y = 0.46);
  BS.pax.forEach((P, i) => { resetRig(P); hp(P, O, [i ? -0.95 : 0.95, 0.12, -1.6 - i * 1.15], 0, { ...idle(O, i + 3), ...SIT, bob: SIT.bob + 0.1 }, 'calm', 'x'); }); }
shot(T8, T8 + 3.2, 'bus', { ease: 'lin', p0: [0.05, 2.5, 5.2], p1: [0.05, 2.45, 4.7], l0: [0.0, 1.4, 0.55], fov: 56 }, (lt, O) => { busBase(O); BS.granny.root.visible = false; }, { grade: 'bus' });
shot(T8 + 3.2, tE(8), 'bus', { ease: 'lin', p0: [0.2, 2.15, -2.6], p1: [0.15, 2.15, -2.1], l0: [0.0, 1.75, 1.85], fov: 48 }, (lt, O) => { busBase(O); }, { grade: 'bus', dof: 0.35 });

// ===== Day 12: London Fashion Week — the models walk off the runway to look at him =====
const RW = S.runway, T12 = tS(12), STOP = T12 + 2.6, OFF = T12 + 3.2, HSEAT = [2.45, 0.05, -2.0];
function runwayBase(O) { resetRig(RW.hero); hp(RW.hero, O, HSEAT, -Math.PI / 2, { ...idle(O), ...SIT, bob: SIT.bob - 0.38 }, O > T12 + 3.0 ? 'shock' : 'smirk'); RW.hero.kit.set(4, O);
  RW.models.forEach((M, i) => { resetRig(M); const z0 = -17 + i * 2.6; const zw = Math.min(lerp(z0, z0 + 1.7 * (STOP - T12), seg(O, T12, STOP)), -3.2 - (2 - i) * 1.6); const off = eIO(seg(O, OFF + i * 0.15, OFF + 1.6 + i * 0.15));
    const tgt = [[1.35, -0.1], [1.45, -3.6], [2.0, -4.6]][i]; const x = lerp(0, tgt[0], off), z = lerp(zw, tgt[1], off), y = 0.6 * (1 - Math.max(0, (off - 0.6) / 0.4));
    const turn = eIO(seg(O, STOP + i * 0.1, OFF + i * 0.1)); const ry = lerp(0, Math.atan2(HSEAT[0] - x, HSEAT[2] - z), Math.max(turn * 0.6, off));
    M.root.scale.setScalar(1.08); hp(M, O, [x, y, z], ry, (O < STOP || (off > 0 && off < 1)) ? walk(O + i, 6.2, 0.9, { spineX: -0.02, arms: undefined }) : { ...idle(O, i), headY: turn * 0.6 * (1 - off) }, off >= 1 ? 'smile' : 'calm', 'x'); });
  RW.togs.forEach((P, i) => { resetRig(P); const sw = eIO(seg(O, OFF - 0.2 + i * 0.08, OFF + 0.4 + i * 0.08)); hp(P, O, [[-2.0, -1.4, 1.4, 2.0, -2.6][i], 0, 1.4 + (i % 2) * 0.6], Math.PI + sw * (i < 2 ? -0.9 : -0.7), { ...idle(O, i), arms: [[-1.4, 0, 0.3, 1.6], [-1.5, 0, -0.3, 1.7]] }, 'calm', 'x'); });
  let fl = 0; RW.flashes.forEach((s, i) => { const per = 0.55 + s.d[3] * 0.6, ph = (O + s.d[3] * 3) % per; const on = ph < 0.07; s.visible = on; if (on) { fl = Math.max(fl, 1 - ph / 0.07); const aim = O > OFF ? V([HSEAT[0] - 1.0 + s.d[0] * 0.15, HSEAT[1] + 1.6 + s.d[1] * 0.4, HSEAT[2] + 1.2 + s.d[2] * 0.3]) : V([s.d[0], s.d[1], 1.8 + s.d[2]]); s.position.copy(aim); s.scale.setScalar(0.6 + 0.8 * (1 - ph / 0.07)); } });
  RW.flashL.position.set(HSEAT[0] - 1.6, 2.4, HSEAT[2] + 0.8); RW.flashL.intensity = O > OFF ? 12 * fl : 0; }
shot(T12, T12 + 2.6, 'runway', { ease: 'lin', p0: [0, 2.0, 4.2], p1: [0, 2.05, 3.2], l0: [0, 2.0, -10], fov: 38 }, (lt, O) => runwayBase(O), { grade: 'runway', bloom: 0.2 });
shot(T12 + 2.6, T12 + 4.4, 'runway', { ease: 'io', p0: [-0.6, 3.0, 4.6], p1: [-0.4, 2.9, 4.0], l0: [0, 1.7, -6], l1: [1.9, 1.5, -2.6], fov: 44 }, (lt, O) => runwayBase(O), { grade: 'runway', bloom: 0.2 });
shot(T12 + 4.4, tE(12), 'runway', { ease: 'lin', p0: [-0.7, 2.0, -0.6], p1: [-0.4, 2.0, -0.9], l0: [2.45, 1.5, -2.0], fov: 48 }, (lt, O) => runwayBase(O), { grade: 'runway', bloom: 0.25, dof: 0.35 });

// ===== Day 18: the Met Office drip warning; the umbrella ring =====
const ST = S.studio;
function drawMap(O) { const t = ST.mapT, g = t.g, w = t.c.width, h = t.c.height; const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#0c2a5a'); bg.addColorStop(1, '#081a3a'); g.fillStyle = bg; g.fillRect(0, 0, w, h);
  g.fillStyle = '#3f8a4a'; g.beginPath(); [[520, 40], [560, 90], [540, 150], [600, 210], [620, 300], [700, 380], [720, 450], [680, 500], [600, 520], [520, 540], [460, 520], [500, 470], [470, 420], [500, 360], [470, 300], [430, 250], [460, 190], [440, 130], [480, 80]].forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fill();
  g.beginPath(); [[330, 260], [400, 240], [420, 300], [380, 360], [320, 340]].forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fill();
  const pulse = 1 + 0.06 * Math.sin(O * 5); g.save(); g.translate(650, 470); g.scale(pulse, pulse); g.fillStyle = '#ffd23f'; g.shadowColor = '#ffd23f'; g.shadowBlur = 30; g.beginPath(); g.moveTo(0, -120); g.bezierCurveTo(60, -40, 70, 10, 0, 50); g.bezierCurveTo(-70, 10, -60, -40, 0, -120); g.fill(); g.restore();
  g.fillStyle = '#E21E39'; g.fillRect(40, h - 120, 460, 80); g.fillStyle = '#fff'; g.font = '800 46px InterW, Arial'; g.fillText('DRIP WARNING', 62, h - 62); t.needsUpdate = true; }
const T18b = T18 + 4.5;
shot(T18, T18b, 'studio', { ease: 'lin', p0: [0.7, 2.05, 5.4], p1: [0.45, 2.1, 4.5], l0: [0, 2.0, -0.4], fov: 40 }, (lt, O) => { drawMap(O); resetRig(ST.anchor); hp(ST.anchor, O, [0, 0, -0.15], 0, { ...idle(O), ...SIT, bob: SIT.bob + 0.12, arms: [[-0.7, 0, 0.25, 1.0], [-0.7, 0, -0.25, 1.0 + (talking('anchor', O) ? 0.15 * Math.sin(O * 4) : 0)]] }, 'calm', 'anchor'); }, { grade: 'studio', dof: 0.3, lower: true });
shot(T18b, tE(18), 'street', { ease: 'io', p0: [-2, 11, 8.0], p1: [-2, 5.6, 6.6], l0: [-2, 0.8, 0.4], l1: [-2, 1.6, 0.6], fov: 44 }, (lt, O) => { const h = streetBase(O, { lvl: 5, sun: 0.7, sunC: 0xc8d2e0, hemi: 0.5, env: 0.35, focus: CTR, kit: { glow: 1.8 } });
  hp(h, O, CTR, 0, { ...idle(O), ...CROSS, headX: -0.42 }, 'smirk'); umbRing(O); rainAt(O); }, { grade: 'rain' });

// ===== Day 22: visible from space; the astronaut puts on sunglasses =====
const SPC = S.space, T22 = tS(22), GL = V([-0.42, 0.6, 0.68]).normalize();
function spaceBase(O) { const s = SPC; s.earth.rotation.y = 0.4 + O * 0.004; s.clouds.rotation.y = 0.4 + O * 0.006; s.ring.visible = false; s.moon.visible = false; s.earth.material.emissiveIntensity = 1.4;
  s.sats.forEach((g, i) => { const a = i * 0.63 + O * 0.01, b = (i % 3 - 1) * 0.5; g.position.set(Math.cos(a) * 125 * Math.cos(b), Math.sin(b) * 125, Math.sin(a) * 125 * Math.cos(b)); g.rotation.set(O * 0.2 + i, i, 0); });
  const tw = 0.75 + 0.25 * Math.sin(O * 9) + 0.15 * Math.sin(O * 23); s.glint.position.copy(GL).multiplyScalar(30.6); s.glint.scale.setScalar(9 * tw); s.glintL.position.copy(s.glint.position); s.glintL.scale.setScalar(5 * tw);
  const ia = (O - T22) * 0.06; s.iss.position.copy(GL.clone().applyAxisAngle(V([0, 1, 0]), 0.35 - ia).multiplyScalar(33.5)); s.iss.lookAt(0, 0, 0); }
shot(T22, T22 + 2.8, 'space', { ease: 'lin', p0: GL.clone().multiplyScalar(78).add(V([10, -14, 8])).toArray(), p1: GL.clone().multiplyScalar(72).add(V([9, -13, 7])).toArray(), l0: GL.clone().multiplyScalar(30).add(V([0, 2, 0])).toArray(), fov: 44 }, (lt, O) => spaceBase(O), { grade: 'space', bloom: 0.35 });
const AST = S.issIn.astro;
shot(T22 + 2.8, tE(22), 'issIn', { ease: 'lin', p0: [0.25, 2.05, 1.6], p1: [0.15, 2.05, 1.0], l0: [0.1, 2.05, -2.6], fov: 44 }, (lt, O) => { resetRig(AST); const fl = Math.sin(O * 1.3) * 0.08; const put = eIO(seg(O, T22 + 3.8, T22 + 4.4));
  hp(AST, O, [-0.3, -0.15 + fl, -2.2], 0.45, { ...idle(O), legs: [[0.3, 0.5], [0.1, 0.3]], headX: -0.1, arms: [[-0.6 - 1.6 * put * (1 - seg(O, T22 + 4.4, T22 + 4.7)), 0, 0.5, 1.2 + 0.6 * put], [-0.5, 0, -0.4, 0.6]] }, put > 0.5 ? 'smirk' : 'worried', 'x');
  if (O < T22 + 4.2) AST.lids.forEach(l => { l.scale.y = 0.6; l.position.y = 0.4; }); AST.glasses.visible = O > T22 + 4.3; S.issIn.winGlint.scale.setScalar(0.9 + 0.4 * Math.sin(O * 13)); }, { grade: 'iss', dof: 0.3 });

// ===== Day 27: the Tower of London wants his hoodie =====
const VT = S.vault, T27 = tS(27), SCREAM = 72.6;
function vaultBase(O) { const lift = seg(O, T27 + 0.6, T27 + 2.9); const cA = wp(VT.cushion); const boxP = V([-0.75, 0, -0.35]); VT.box.position.copy(boxP);
  const p = cA.clone().add(V([0, 0.1, 0])).lerp(boxP.clone().add(V([0, 0.32, 0])), eIO(lift)); p.y += Math.sin(Math.PI * eIO(lift)) * 0.7; VT.crown.position.copy(p); VT.crown.rotation.set(0.1 * Math.sin(O * 2) * lift, 0, 0);
  resetRig(VT.guard); const reach = Math.sin(Math.PI * Math.min(1, lift * 1.1)); hp(VT.guard, O, [-1.15, 0, -2.75], 0.35, { ...idle(O), spineX: 0.35 * reach, headX: 0.25, arms: [[-1.0 - 0.3 * reach, 0, 0.35, 0.6], [-1.0 - 0.3 * reach, 0, -0.35, 0.6]] }, 'worried', 'x');
  VT.form.rig.kit.set(5, O, { noHat: true, noChain: true }); VT.form.rotation.y = 0.15 * Math.sin(O * 0.5);
  resetRig(VT.tee); VT.tee.root.visible = false; VT.twinkles.forEach((s, i) => { s.position.set(1.6 + 0.6 * Math.sin(i * 2.3), 1.6 + 0.9 * ((i * 0.37 + O * 0.1) % 1), -1.5 + 0.6 * Math.cos(i * 1.7)); s.material.opacity = Math.pow(Math.max(0, Math.sin(O * 3 + i)), 4); s.scale.setScalar(0.3 + 0.3 * s.material.opacity); }); }
shot(T27, T27 + 3.4, 'vault', { ease: 'lin', p0: [0.6, 2.2, 3.6], p1: [0.35, 2.05, 2.9], l0: [-1.05, 1.45, -1.3], fov: 44 }, (lt, O) => vaultBase(O), { grade: 'vault', bloom: 0.25 });
function teeAt(O, scream) { const t = VT.tee; resetRig(t); hp(t, O, [2.95, 0, -0.55], -0.55, { ...idle(O), arms: scream ? [[-0.3, 0, 0.9, 0.5], [-0.3, 0, -0.9, 0.5]] : [[0, 0, 0.12, 0.2], [-0.5, 0, -0.3, 0.6]], headY: scream ? 0 : -0.5, spineX: scream ? -0.08 : 0 }, scream ? 'shock' : 'smile'); t.kit.set(3, O); }
shot(T27 + 3.4, SCREAM, 'vault', { ease: 'lin', p0: [1.6, 2.1, 4.6], p1: [1.75, 2.05, 4.0], l0: [2.15, 1.65, -1.0], fov: 46 }, (lt, O) => { vaultBase(O); teeAt(O, false); }, { grade: 'vault', bloom: 0.3 });
shot(SCREAM, tE(27), 'vault', { ease: 'in', p0: [1.75, 2.05, 2.4], p1: [2.35, 2.15, 1.25], l0: [2.85, 2.15, -0.5], fov: 44, z0: 1, z1: 1.6, roll0: 0, roll1: -6 }, (lt, O) => { vaultBase(O); teeAt(O, true); }, { grade: 'vault', bloom: 0.3, dof: 0.5, shakeAt: [[SCREAM + 0.2, 0.02], [SCREAM + 1.2, 0.03]] });

// ===== Day 36: Saturn offers its rings =====
const SA = S.saturn, T36 = tS(36), HSP = V([1.5, -1.0, -2.0]), RING0 = T36 + 1.6, RING1 = T36 + 4.6, NOPE = T36 + 11.0;
function saturnBase(O, o = {}) { const s = SA; s.sat.rotation.y = Math.sin(O * 0.2) * 0.03; s.body.rotation.y = O * 0.02;
  const k = eIO(seg(O, RING0, RING1)), back = eIn(seg(O, NOPE, NOPE + 2.2)); const local = HSP.clone().sub(s.sat.position).add(V([0, 0.9, 0]));
  s.rings.position.copy(V([0, 0, 0]).lerp(local, k).add(V([0, -9 * back, -4 * back]))); s.rings.scale.setScalar(lerp(1, 0.09, k)); s.rings.rotation.set(lerp(0.32, 0.12, k), 0, lerp(-0.18, 0.05, k)); s.rings.children[0].rotation.z = O * 0.15 * k;
  s.ringSparks.forEach((sp, i) => { sp.material.opacity = Math.pow(Math.max(0, Math.sin(O * 2.5 + i * 1.9)), 5); });
  const sad = o.sad ?? 0; const tk = talking('saturn', O);
  s.mO.scale.set(2.4 - 0.6 * sad, tk ? 0.5 + 0.9 * Math.abs(Math.sin(O * 11)) : 0.32, 0.35); s.mouth.position.y = -3.0 - 0.3 * sad; s.mouth.rotation.z = 0; s.tongue.visible = tk;
  s.brows.forEach((b, i) => { b.rotation.z = (i ? -1 : 1) * (0.12 + 0.3 * sad); b.position.y = 5.3 - 0.2 * sad; });
  const look = o.look || [0, -0.25]; const blink = ((O * 0.33 + 0.4) % 1) < 0.04; s.eyes.forEach(e => { e.p.position.set(look[0], look[1] - 0.2, 1.05); e.lid.scale.y = blink ? 1.0 : 0.05 + 0.25 * sad; e.lid.position.y = blink ? 0 : 1.6 - 0.6 * sad; });
  resetRig(s.hero); s.hero.kit.set(5, O, { ring: true }); s.heroKey.position.copy(HSP).add(V([1.5, 3, 4])); }
function heroFloat(O, o = {}) { const s = SA; const fl = Math.sin(O * 0.9) * 0.12; hp(s.hero, O, [HSP.x, HSP.y + fl, HSP.z], o.ry ?? Math.PI + 0.25, { ...idle(O), legs: [[0.35, 0.6], [0.1, 0.35]], spineX: -0.05, headX: o.headX ?? -0.25, arms: o.arms || [[-0.3, 0, 0.55, 0.5], [-0.3, 0, -0.55, 0.5]] }, o.expr || 'calm'); }
shot(T36, T36 + 3.3, 'saturn', { ease: 'lin', p0: [4.5, -3.2, 9.5], p1: [4.2, -3.0, 8.5], l0: [0.4, 6, -30], fov: 50 }, (lt, O) => { saturnBase(O, { look: [0.3, -0.5] }); heroFloat(O); }, { grade: 'saturn', bloom: 0.3 });
shot(T36 + 3.3, T36 + 7.3, 'saturn', { ease: 'lin', p0: [3.4, 0.9, 2.6], p1: [3.1, 0.8, 1.9], l0: [0, 7.8, -28], fov: 40 }, (lt, O) => { saturnBase(O, { look: [0.25, -0.6] }); heroFloat(O); }, { grade: 'saturn', bloom: 0.3 });
shot(T36 + 7.3, NOPE + 0.0, 'saturn', { ease: 'lin', p0: [0.6, 1.25, -5.2], p1: [0.75, 1.2, -4.8], l0: [1.5, 1.15, -2.0], fov: 42 }, (lt, O) => { saturnBase(O); const up = eOut(seg(O, T36 + 10.1, T36 + 10.5));
  heroFloat(O, { headX: -0.05, expr: 'smirk', arms: [[-0.3, 0, 0.55, 0.5], [-0.3 - 1.15 * up, 0, -0.55 - 0.65 * up, 0.5 + 0.9 * up]] }); }, { grade: 'saturn', bloom: 0.35, dof: 0.35 });
shot(NOPE, tE(36), 'saturn', { ease: 'lin', p0: [3.4, 0.9, 2.6], p1: [3.2, 0.7, 2.3], l0: [0, 7.8, -28], fov: 40 }, (lt, O) => { saturnBase(O, { sad: eOut(seg(O, NOPE, NOPE + 0.3)), look: [-0.7, -0.3] }); heroFloat(O); }, { grade: 'saturn', bloom: 0.3 });
