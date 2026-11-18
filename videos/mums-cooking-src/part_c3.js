
// ===== DAY 5: visible from a plane =====
shot(19.2, 20.0, 'yard', { p0: [1.6, 1.5, 6.4], p1: [1.9, 1.7, 5.4], l0: [2.4, 4.0, -3.0], l1: [2.6, 4.6, -3.0], fov: 52, ease: 'out' }, (lt, O) => {
  yardBase(O, { lid: 0 }); mumPose(O, { pos: [1.7, 0, -2.4], ry: 0.7 }); const ant = seg(O, 19.05, 19.22), pop = seg(O, 19.22, 19.6);
  heroPose(O, 2.4, 1.2, 0.1, { bob: -0.1 * ant + 0.08 * Math.sin(pop * Math.PI), spineX: 0.12 * ant - 0.28 * pop, headX: -0.55 * pop, arms: [[-0.4 - 1.0 * pop, 0, 0.3 + 0.6 * pop, 0.5], [-0.4 - 1.0 * pop, 0, -0.3 - 0.6 * pop, 0.5]] }, 'shock'); }, { grade: 'sky', flash: 19.2, shakeAt: [[19.22, 0.07]] });
const planeAt = (O) => { const k = seg(O, 20.0, 20.9); return { p: V([lerp(46, 20, eIO(k)), lerp(40, 34, k), lerp(14, -8, eIO(k))]), roll: lerp(0, 0.7, eOut(seg(O, 20.0, 20.5))), yaw: lerp(Math.PI * 0.92, Math.PI * 0.72, eIO(k)) }; };
shot(20.0, 20.9, 'aerial', { p0: [52, 38, 62], p1: [38, 36, 48], l0: [24, 33, -2], l1: [10, 32, -16], fov: 50, ease: 'lin', live: 0.5 }, (lt, O) => {
  const A = S.aerial; A.cloud.scale.setScalar(1 + 0.04 * Math.sin(O * 1.3)); const pl = planeAt(O); A.plane.position.copy(pl.p); A.plane.rotation.set(pl.roll, pl.yaw, 0, 'YXZ'); A.contrail.forEach((c, i) => { const u = i / 14; c.position.set(pl.p.x + Math.cos(pl.yaw - Math.PI / 2) * 0, pl.p.y, pl.p.z); const back = V([Math.cos(pl.yaw) * 0 - Math.sin(pl.yaw) * 0, 0, 0]); c.position.copy(pl.p).add(V([Math.cos(pl.yaw) * -1, 0, Math.sin(pl.yaw) * 1]).multiplyScalar((i + 1) * 1.6)).add(V([0, 0.2, 0])); c.scale.setScalar(0.5 + i * 0.12); c.material.opacity = 0.55 * (1 - u); }); }, { grade: 'sky', bloom: 0.14 });
const cockpitCam = (O) => ({});
function cockpitBase(O, who) { const C = S.cockpit; resetRig(C.pilot); resetRig(C.copilot); C.pilot.root.position.set(-1.7, 0.55, 1.4); C.pilot.root.rotation.y = Math.PI - 0.45; C.copilot.root.position.set(1.7, 0.55, 1.4); C.copilot.root.rotation.y = Math.PI + 0.3;
  const sit = { bob: -0.42, legs: [[1.4, -1.5], [1.4, -1.5]] }; const tk = talking('pilot', O);
  pose(C.pilot, { ...idle(O, 0.4), ...sit, spineX: 0.05, headY: 0.15 * Math.sin(O * 0.8), headZ: 0.03, arms: [[-1.1, 0, 0.15, 0.7], [-1.0, 0, -0.15, 0.7 + 0.05 * Math.sin(O * 2)]] }); C.pilot.face(tk ? 'calm' : 'calm', O, tk);
  const sn = eOut(seg(O, 21.6, 22.2)); pose(C.copilot, { ...idle(O, 1.1), ...sit, headX: -0.3 * sn, headY: -0.25 * sn, spineX: -0.05 * sn, arms: [[-1.1, 0, 0.15, 0.7], [-0.9 - 0.7 * sn, 0, -0.15, 0.7 + 0.5 * sn]] }); C.copilot.face(sn > 0.3 ? 'sniff' : 'calm', O);
  const k = eIn(seg(O, 20.9, 24.4)); C.cloudC.position.set(-48 + 14 * k, 5, 18); C.cloudC.scale.setScalar(70 + 60 * k); C.cb.forEach((m, i) => { m.position.set(-52 + 8 * k + Math.cos(i * 2.1) * 12, 3 + Math.sin(i * 1.3) * 7, 14 + Math.sin(i * 1.7) * 9); m.scale.setScalar(0.8 + 0.5 * k); }); }
shot(20.9, 22.9, 'cockpit', { p0: [0.9, 2.45, -0.8], p1: [0.5, 2.4, -0.4], l0: [-1.8, 2.0, 1.4], l1: [-1.8, 2.0, 1.4], fov: 38, ease: 'io' }, (lt, O) => { cockpitBase(O); }, { grade: 'cockpit', dof: 0.3 });
shot(22.9, 24.4, 'cockpit', { p0: [-0.9, 2.5, -0.9], p1: [-0.5, 2.45, -0.5], l0: [1.7, 2.0, 1.4], l1: [1.7, 2.0, 1.4], fov: 40, ease: 'io' }, (lt, O) => { cockpitBase(O); }, { grade: 'cockpit', dof: 0.3 });

// ===== DAY 6: kings are visiting =====
const KX = 0.2, KZ = -1.3;
const procX = (O) => lerp(-7.2, KX, eIO(seg(O, 24.9, 26.45)));
function procBase(O) { const Y = S.yard; const x = procX(O); const walking = O < 26.45; const wk = (ph) => walking ? walk(O + ph, 11.5, 0.95) : idle(O, ph);
  const place = (P, dx, z, p, expr) => { P.root.visible = true; P.root.position.set(x + dx, 0, z); P.root.rotation.y = Math.PI / 2; pose(P, p); P.face(expr, O); };
  const kneel = eOut(seg(O, 26.45, 26.9)); const k = Y.king; k.root.visible = true; k.root.position.set(x, 0, KZ); k.root.rotation.y = Math.PI / 2 + 0.25 * kneel;
  const kp = walking ? walk(O, 11.5, 0.9) : { bob: -0.4 * kneel, spineX: 0.55 * kneel, headX: 0.3 * kneel, legs: [[1.4 * kneel, -1.5 * kneel], [-0.1 * kneel, 1.6 * kneel]], arms: [[-0.5 * kneel, 0, 0.2, 0.4 * kneel], [-0.9 * kneel, 0, -0.3, 0.9 * kneel]] };
  pose(k, kp); k.face(kneel > 0.5 ? 'worried' : 'smirk', O);
  place(Y.bearer, -1.1, KZ - 0.1, walking ? walk(O + 0.4, 11.5, 0.9, { arms: [[-0.4, 0, 0.14, 0.4], [-2.2, 0, -0.3, 0.3]] }) : { ...idle(O, 1), arms: [[0, 0, 0.14, 0.2], [-2.2, 0, -0.3, 0.3]] }, 'smile'); Y.bearer.umb.visible = true; Y.bearer.umb.position.set(x - 1.15, 0.9, KZ - 0.1);
  const beat = (i) => { const b = Math.max(0, Math.sin(O * 15 + i * 1.7)); return { bob: 0.02 * b, arms: [[-0.2, 0, 0.14, 0.3], [-0.7 - 0.5 * b, 0, -0.35, 0.9 + 0.5 * b]], ...(walking ? { legs: walk(O + i, 11.5, 0.9).legs } : {}) }; };
  place(Y.drummers[0], -2.6, KZ + 0.5, { ...idle(O, 0.3), ...beat(0), spineX: 0.06 }, 'laugh'); place(Y.drummers[1], -3.7, KZ - 0.4, { ...idle(O, 0.9), ...beat(1) }, 'smile');
  place(Y.guards[0], 1.9, KZ + 0.7, wk(0.2), 'grit'); place(Y.guards[1], 2.9, KZ - 0.3, wk(0.8), 'grit');
  const dz = walking ? 1 : 0; Y.drummers.forEach(d => d.stick.visible = true); }
shot(24.4, 25.1, 'yard', { p0: [-2.0, 1.9, 6.4], p1: [-3.0, 1.9, 5.0], l0: [-4.8, 1.8, 0.8], l1: [-4.8, 1.8, 0.8], fov: 44, ease: 'lin' }, (lt, O) => {
  yardBase(O, { lid: 0 }); mumPose(O, { pos: [1.7, 0, -2.4], ry: 0.7 }); const ant = seg(O, 24.25, 24.42), pop = seg(O, 24.42, 24.8);
  heroPose(O, -4.8, 0.8, 0.25, { bob: -0.1 * ant + 0.08 * Math.sin(pop * Math.PI), spineX: 0.12 * ant - 0.2 * Math.sin(pop * Math.PI), headX: -0.3 * pop, headY: -0.4, arms: [[-0.4 - 1.3 * pop, 0, 0.3 + 0.7 * pop, 0.5], [-0.4 - 1.3 * pop, 0, -0.3 - 0.7 * pop, 0.5]] }, 'shock'); }, { grade: 'warm', flash: 24.4, shakeAt: [[24.42, 0.07]] });
shot(25.1, 26.45, 'yard', { pf: () => V([procX(CLK) - 0.6, 2.2, 8.6]), lf: () => V([procX(CLK) - 1.0, 1.5, -1.2]), fov: 54 }, (lt, O) => { CLK = O; yardBase(O, { lid: 0 }); mumPose(O, { pos: [1.7, 0, -2.4], ry: 0.7, headY: -0.2 }); procBase(O); }, { grade: 'warm', mblur: 3, shakeAt: [[25.1, 0.01]] });
shot(26.45, 27.3, 'yard', { p0: [3.4, 1.4, 4.4], p1: [2.4, 1.3, 3.2], l0: [0.9, 1.4, -1.6], l1: [1.0, 1.5, -1.8], fov: 46, ease: 'io' }, (lt, O) => { yardBase(O, { lid: 0 }); mumPose(O, { pos: [1.7, 0, -2.4], ry: 0.7 }); procBase(O); }, { grade: 'warm', dof: 0.25, shakeAt: [[26.5, 0.04]] });
shot(27.3, 29.4, 'yard', { p0: [3.8, 2.5, 2.2], p1: [3.4, 2.5, 1.4], l0: [1.9, 2.2, -2.4], l1: [1.8, 2.2, -2.4], fov: 36, ease: 'io' }, (lt, O) => { yardBase(O, { lid: 0 }); mumPose(O, { pos: [1.9, 0, -2.4], ry: 0.25, headY: 0.0, headX: 0.22, expr: 'calm', arms: [[-0.15, 0, 0.18, 0.45], [-0.5, 0, 1.0, 0.7]] }); procBase(O); }, { grade: 'warm', dof: 0.35 });
let CLK = 0;
