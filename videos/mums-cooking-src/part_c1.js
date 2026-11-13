
// ===== TITLE + DAY 1 =====
shot(0, 1.6, 'yard', { p0: [5.9, 1.6, 4.0], p1: [4.7, 2.3, 1.3], l0: [3.1, 2.2, -1.9], l1: [3.1, 2.7, -1.9], fov: 38, ease: 'io' }, (lt, O) => {
  yardBase(O, { lid: 1 }); mumPose(O, { pos: [1.6, 0, -2.3], ry: 0.7 }); }, { grade: 'dawn', flare: [0.12, 0.28], dof: 0.3 });
shot(1.6, 3.0, 'yard', { p0: [-1.8, 1.7, 6.2], p1: [0.2, 1.9, 4.6], l0: [0.8, 1.5, -1.5], fov: 44 }, (lt, O) => {
  yardBase(O, { lid: 1 }); mumPose(O, { pos: [1.6, 0, -2.3], ry: 0.7 });
  const k = eIO(seg(O, 1.6, 2.5)); const dx = lerp(-1.4, 0.6, k); const wk = k < 1;
  heroPose(O, dx, lerp(-3.6, -0.6, k), lerp(0.1, 0.35, k), wk ? walk(O, 7.5, 0.75) : { ...idle(O), spineX: -0.1, headX: -0.3, arms: [[-2.3, 0, 0.1, 0.3], [-2.3, 0, -0.1, 0.3]] }, k < 1 ? 'calm' : 'sniff'); }, { grade: 'warm' });
shot(3.0, 5.4, 'yard', { p0: [1.2, 2.2, 7.6], p1: [1.6, 2.1, 6.4], l0: [0.9, 1.7, -1.2], l1: [1.1, 1.7, -1.2], fov: 42, flash: 3.0 }, (lt, O) => {
  yardBase(O, { lid: 1 }); mumPose(O, { pos: [2.0, 0, -2.2], ry: 0.5 });
  const fl = eOut(seg(O, 3.0, 3.5)); const bob = 0.18 * fl + 0.05 * Math.sin(O * 2.4) * fl;
  heroPose(O, 0.1, -0.6, 0.45, { bob, spineX: -0.08 * fl, headX: -0.3 * fl + 0.05 * Math.sin(O * 2), headZ: 0.1 * fl, legs: [[-0.15 * fl, 0.3 * fl], [0.15 * fl, 0.4 * fl]], arms: [[-1.7 * fl, 0, 0.3, 1.1 * fl], [-1.3 * fl, 0, -0.35, 1.3 * fl]] }, 'smile'); }, { grade: 'warm', dof: 0.25 });
shot(5.4, 7.0, 'yard', { p0: [4.4, 1.6, 3.3], p1: [3.7, 2.2, 1.9], l0: [3.2, 1.8, -1.9], l1: [3.2, 2.0, -1.9], fov: 40, ease: 'io' }, (lt, O) => {
  yardBase(O, { lid: 0, rattle: O > 6.3, steam: 1.1 }); mumPose(O, { pos: [1.7, 0, -2.4], ry: 0.7, arms: [[-0.15, 0, 0.18, 0.45], [-0.3 - 0.4 * seg(O, 6.3, 6.7), 0, 0.9, 0.5]] }); heroPose(O, 0.4, -0.5, 0.5, { ...idle(O), headX: -0.2, headY: -0.3 }, 'sniff'); }, { grade: 'warm', dof: 0.35, shakeAt: [[6.35, 0.012], [6.6, 0.012], [6.85, 0.016]] });
// ===== DAY 2 =====
shot(7.0, 7.9, 'yard', { p0: [1.4, 1.9, 4.4], p1: [1.1, 2.0, 2.6], l0: [0.5, 2.0, -0.4], l1: [0.5, 2.0, -0.4], fov: 40, z0: 1.0, z1: 1.5, roll0: -3, roll1: 4, ease: 'lin' }, (lt, O) => {
  yardBase(O, { lid: 1 }); mumPose(O, { pos: [2.4, 0, -2.2], ry: 0.4 }); const ant = seg(O, 6.8, 7.0), pop = seg(O, 7.0, 7.4);
  heroPose(O, 0.5, -0.4, 0.2, { bob: -0.1 * ant + 0.1 * Math.sin(pop * Math.PI), spineX: 0.12 * ant - 0.22 * Math.sin(pop * Math.PI), headX: -0.25 * pop, arms: [[-0.2 - 1.2 * pop, 0, 0.3 + 0.7 * pop, 0.6], [-0.2 - 1.2 * pop, 0, -0.3 - 0.7 * pop, 0.6]] }, 'shock'); }, { grade: 'warm', flash: 7.0, shakeAt: [[7.02, 0.07]] });
shot(7.9, 8.55, 'yard', { p0: [3.2, 1.7, 3.8], p1: [3.7, 1.9, 3.5], l0: [7.6, 2.3, 1.0], fov: 44, ease: 'lin' }, (lt, O) => {
  yardBase(O, { lid: 1 }); mumPose(O, { pos: [2.4, 0, -2.2], ry: 0.4 }); heroPose(O, 1.0, 0.2, 0.9, { ...idle(O), headY: 0.5, arms: [[0, 0, 0.14, 0.2], [-0.4, 0, -0.14, 0.5]] }, 'shock');
  const Y = S.yard, n = Y.neigh; n.root.visible = true; const up = elastic(seg(O, 7.95, 8.5)); n.root.position.set(8.5, lerp(-1.2, 0.72, up), 1.0); n.root.rotation.y = -Math.PI / 2 - 0.15; pose(n, { ...idle(O, 2), arms: [[-2.5 * up, 0, 0.1, 0.1], [-0.8, 0, -0.3, 0.9]] }); n.face('smile', O, talking('neighbour', O)); }, { grade: 'warm' });
shot(8.55, 10.0, 'yard', { p0: [5.6, 2.9, 3.0], p1: [5.9, 3.0, 2.5], l0: [8.4, 2.95, 1.0], l1: [8.4, 2.95, 1.0], fov: 34 }, (lt, O) => {
  yardBase(O, { lid: 1 }); mumPose(O, { pos: [2.4, 0, -2.2], ry: 0.4 }); const Y = S.yard, n = Y.neigh; n.root.visible = true; n.root.position.set(8.5, 0.72, 1.0); n.root.rotation.y = -Math.PI / 2 - 0.15; const tk = talking('neighbour', O);
  pose(n, { ...idle(O, 2), headY: 0.2 + 0.05 * Math.sin(O * 3), headZ: 0.1, arms: [[-2.55 + 0.08 * Math.sin(O * 5), 0, 0.1, 0.1], [-0.8, 0, -0.3, 0.9]] }); n.face(tk ? 'smile' : 'smirk', O, tk); }, { grade: 'warm', dof: 0.35 });
shot(10.0, 10.6, 'yard', { p0: [0.2, 1.9, 3.6], p1: [0.5, 1.95, 3.0], l0: [0.6, 1.9, -0.5], fov: 36 }, (lt, O) => {
  yardBase(O, { lid: 1 }); mumPose(O, { pos: [2.4, 0, -2.2], ry: 0.4 }); heroPose(O, 0.6, -0.5, 0.25, { ...idle(O), headY: -0.5, spineY: -0.15, arms: [[0, 0, 0.14, 0.25], [-0.3, 0, -0.14, 0.4]] }, 'confused'); }, { grade: 'warm', dof: 0.4 });
