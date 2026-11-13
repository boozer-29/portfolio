
// ---------------------------------------------------------------- shot system + shared animation helpers
const cam = new THREE.PerspectiveCamera(40, W / H, 0.05, 1000);
const shots = []; const shot = (t0, t1, scene, camA, setup, fx = {}) => shots.push({ t0, t1, scene, cam: camA, setup, ...fx });
const shake = (O, t0, amt, dur = 0.45) => { const k = clamp(1 - (O - t0) / dur); return O < t0 || k <= 0 ? 0 : amt * k * k; };
function resetRig(P) { P.root.position.set(0, 0, 0); P.root.rotation.set(0, 0, 0); P.root.scale.setScalar(1); P.root.visible = true; P.glasses.visible = false; }
function talking(speaker, O) { return DIALOGUE.some(c => c.speaker === speaker && c.kind !== 'shout' && spanHit(c, O)); }
const wp = (o) => { const v = new THREE.Vector3(); o.updateWorldMatrix(true, false); return o.getWorldPosition(v); };
const ST = STEPS.map(s => s.t);
// afro radius between two days: squash anticipation (0.25 s) then elastic pop
function grow(O, t, r0, r1) { const ant = seg(O, t - 0.25, t), pop = elastic(seg(O, t, t + 0.8)); return { R: O < t ? r0 : lerp(r0, r1, pop), sq: O < t ? eIn(ant) : Math.max(0, 1 - seg(O, t, t + 0.12)) }; }
function afro(P, O, g) { P.setAfro(g.R, O, g.sq); }
// hero body anticipation + pop on every doubling
function popPose(O, t, base = {}) { const ant = seg(O, t - 0.25, t), pop = seg(O, t, t + 0.45), s = Math.sin(pop * Math.PI);
  return { ...base, bob: (base.bob || 0) - 0.12 * ant * (1 - pop) + 0.08 * s, spineX: (base.spineX || 0) + 0.18 * ant * (1 - pop) - 0.2 * s, headX: (base.headX || 0) - 0.25 * s,
    arms: O < t ? [[-0.3 * ant, 0, 0.2, 0.9 * ant], [-0.3 * ant, 0, -0.2, 0.9 * ant]] : [[-0.2 - 0.5 * s, 0, 0.5 + 1.3 * s, 0.4], [-0.2 - 0.5 * s, 0, -0.5 - 1.3 * s, 0.4]],   // arms fling out sideways, never across the face
    legs: [[0.25 * ant * (1 - pop), 0.5 * ant * (1 - pop)], [0.25 * ant * (1 - pop), 0.5 * ant * (1 - pop)]] }; }
function hp(P, O, pos, ry, p, expr, who = 'hero') { P.root.visible = true; P.root.position.set(...pos); P.root.rotation.set(0, ry, 0); pose(P, p); P.face(expr, O, talking(who, O)); }
const SIT = { bob: 0.07, legs: [[1.5, 1.45], [1.5, 1.45]] };
function afroPt(P, x, y, z, d = 1.0) { const v = V([x, y, z]).normalize(); const o = new THREE.Object3D(); o.position.set(v.x * d, 0.8 + v.y * 0.8 * d, -0.2 + v.z * d); P.afroIn.add(o); return o; }
// combing arm (right) — stroke through the afro
const combArm = (O, sp = 5) => [-3.0 + 0.1 * Math.sin(O * sp), 0, -0.3, 1.3 + 0.3 * Math.sin(O * sp)];   // hand over the top of the head, never across the face
// ballistic throw that lands and rests on the floor
function fling(m, home, O, t0, v, spin = [0, 0, 0], floor = 0.06) { m.visible = true; if (O < t0) { m.position.copy(home); m.rotation.set(0, 0, 0); return; }
  const tl = (v[1] + Math.sqrt(v[1] * v[1] + 19.6 * Math.max(0, home.y - floor))) / 9.8, t = Math.min(O - t0, tl);
  m.position.set(home.x + v[0] * t, home.y + v[1] * t - 4.9 * t * t, home.z + v[2] * t); m.rotation.set(spin[0] * t, spin[1] * t, spin[2] * t); }
function arcTo(m, a, b, k, h = 1, spin = 0) { m.visible = true; m.position.copy(a.clone().lerp(b, k)); m.position.y += Math.sin(k * Math.PI) * h; m.rotation.set(spin * k, spin * 0.7 * k, 0); }
const afroC = (P) => wp(P.afroIn.children[0]);
