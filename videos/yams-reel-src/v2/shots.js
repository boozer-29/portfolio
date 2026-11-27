
// ===== ROOM: title, Day 1, Day 2 (the button) =====
const BT = [[7.06, [1.3, 1.0, 1.7]], [7.12, [4.8, 0.75, 1.1]], [7.42, [-2.7, 2.3, 3.3]], [7.68, [-1.6, 2.78, 0.45]], [7.92, [5.4, 2.9, 4.0]], [8.14, [0.95, 1.5, 0.26]]];
function btnPos(O) { if (O < BT[0][0]) return null; for (let i = 0; i < BT.length - 1; i++) if (O < BT[i + 1][0]) { const k = (O - BT[i][0]) / (BT[i + 1][0] - BT[i][0]); const p = V(BT[i][1]).lerp(V(BT[i + 1][1]), k); p.y += Math.sin(k * Math.PI) * 0.3; return p; } return V(BT[BT.length - 1][1]); }
function roomBase(O) { const R = S.room; resetRig(R.hero); R.stranger.root.visible = false; R.deb.forEach(d => d.m.visible = false); R.bub.update(O, 1);
  const b = btnPos(O); R.btn.visible = !!b; if (b) { R.btn.position.copy(b); const fly = O < 8.14; R.btn.rotation.set(fly ? O * 40 : Math.PI / 2, fly ? O * 31 : 0, 0); }
  R.crack.visible = O >= 8.14; if (O >= 8.14) R.crack.material.opacity = clamp((O - 8.14) / 0.05);
  [[7.12, 0, 5], [7.42, 5, 10], [7.68, 10, 15], [7.92, 15, 20], [8.14, 20, 28]].forEach(([t, a, b2], i) => { if (O >= t && O < t + 0.7) burst(R.deb.slice(a, b2), O, t, V(BT[i + 1][1]), 1.1, 1.2); }); }
shot(0, 1.6, 'room', { p0: [0.9, 1.75, 7.6], p1: [0.9, 1.65, 6.6], l0: [0.7, 1.3, 2.4], fov: 40 }, (lt, O) => {
  const R = S.room; roomBase(O); const h = R.hero; h.root.position.set(0.9, 0, 2.6); h.setYams(1);
  const st = Math.sin(seg(lt, 0, 0.9) * Math.PI); pose(h, { ...idle(O), spineX: -0.15 * st, headX: -0.3 * st, arms: [[-2.6 * st, 0, 0.13 - 0.7 * st, 0.1 * st], [-2.6 * st, 0, -0.13 + 0.7 * st, 0.1 * st]] }); h.face(st > 0.3 ? 'yawn' : 'calm', O);
}, { grade: 'room', flare: [0.12, 0.3] });
shot(1.6, 3.0, 'room', { p0: [4.9, 2.1, 0.7], p1: [4.7, 2.05, 0.75], l0: [0.9, 1.3, 2.4], fov: 52 }, (lt, O) => {
  const R = S.room; roomBase(O); const h = R.hero; const k = eIO(clamp(lt / 0.75)); h.root.position.set(lerp(0.9, 0.95, k), 0, lerp(2.9, 1.95, k)); h.root.rotation.y = Math.PI; h.setYams(1);
  pose(h, lt < 0.75 ? walk(O, 7.5, 0.8) : idle(O)); h.face('calm', O);
}, { grade: 'room' });
shot(3.0, 5.0, 'room', { p0: [0.95, 2.05, 0.4], p1: [0.95, 2.03, 0.5], l0: [0.95, 1.85, 1.95], fov: 56, shift: 0.1 }, (lt, O) => {   // DAY 1 — mirror POV
  const R = S.room; roomBase(O); const h = R.hero; h.root.position.set(0.95, 0, 1.95); h.root.rotation.y = Math.PI; h.setYams(1);
  const up = eOut(seg(lt, 0.15, 0.4)); pose(h, { ...idle(O), arms: [[-0.2, 0, 0.13, 0.15], [-1.5 * up, 0, -0.35 * up, 1.6 * up]], headZ: 0.08 * up }); h.face('smile', O, talking('hero', O));
}, { grade: 'room', dof: 0.35 });
shot(5.0, 6.6, 'room', { p0: [1.3, 1.9, 4.9], p1: [1.2, 1.9, 4.5], l0: [0.95, 1.75, 1.95], fov: 36 }, (lt, O) => {
  const R = S.room; roomBase(O); const h = R.hero; h.root.position.set(0.95, 0, 1.95); h.root.rotation.y = lerp(0.75, 0, eOut(seg(lt, 0, 0.3))); h.setYams(1);
  const nod = Math.sin(seg(lt, 0.45, 0.95) * Math.PI * 2) * 0.12; pose(h, { ...idle(O), headX: nod, arms: [[0, 0, 0.13, 0.15], [0, 0, -0.5, 0.2]] }); h.face(lt > 0.4 ? 'smirk' : 'calm', O);
}, { grade: 'room', dof: 0.45 });
shot(6.6, 7.3, 'room', { p0: [-2.4, 1.6, 6.4], p1: [-2.2, 1.57, 6.0], l0: [0.95, 1.05, 1.5], fov: 40, ease: 'lin' }, (lt, O) => {   // DAY 2 — the doubling: the button gives up
  const R = S.room; roomBase(O); const h = R.hero; h.root.position.set(0.95, 0, 1.5); h.root.rotation.y = 1.15; popYams(h, O, 7.0, 1, 1.7);
  const ant = seg(O, 6.72, 7.0), pop = seg(O, 7.0, 7.3);
  pose(h, { bob: -0.08 * ant + 0.13 * Math.sin(pop * Math.PI), spineX: 0.15 * ant - 0.3 * Math.sin(pop * Math.PI), arms: [[-0.25 * ant - 2.3 * pop, 0, 0.2 + 1.2 * pop, 0.3 + 0.8 * pop], [-0.25 * ant - 2.1 * pop, 0, -0.2 - 1.2 * pop, 0.3 + 0.8 * pop]],
    legs: [[0.2 * ant, 0.36 * ant], [0.2 * ant, 0.36 * ant]], headX: -0.25 * pop }); h.face(O < 7.0 ? 'calm' : 'shock', O);
}, { grade: 'room', shakeAt: [[7.02, 0.06]], mblur: 3 });
shot(7.3, 8.35, 'room', { p0: [1.3, 1.9, 6.6], p1: [1.2, 1.85, 6.1], lf: (O) => { const b = btnPos(O - 0.04) || V([1, 1.4, 1.5]); return b.multiplyScalar(0.72).add(V([1.0, 1.5, 1.6]).multiplyScalar(0.28)); }, fov: 54, ease: 'lin' }, (lt, O) => {   // the ricochet
  const R = S.room; roomBase(O); const h = R.hero; h.root.position.set(0.95, 0, 1.5); h.root.rotation.y = 0.4; h.setYams(1.7);
  const duck = eOut(seg(O, 7.3, 7.5)); const b = btnPos(O) || V([0, 0, 0]);
  pose(h, { bob: -0.3 * duck, spineX: 0.5 * duck, legs: [[0.5 * duck, 0.9 * duck], [0.5 * duck, 0.9 * duck]], arms: [[-2.7 * duck, 0, -0.5 * duck, 1.5 * duck], [-2.7 * duck, 0, 0.5 * duck, 1.5 * duck]], headX: 0.2 * duck, headY: clamp((b.x - 0.95) * 0.25, -0.8, 0.8) }); h.face('shock', O);
}, { grade: 'room', shakeAt: [[7.42, 0.02], [7.68, 0.02], [7.92, 0.02], [8.14, 0.045]], mblur: 5 });
shot(8.35, 10.2, 'room', { p0: [1.9, 1.8, 4.9], p1: [1.7, 1.8, 4.4], l0: [0.98, 1.55, 1.5], fov: 38 }, (lt, O) => {
  const R = S.room; roomBase(O); const h = R.hero; h.root.position.set(0.95, 0, 1.5); h.root.rotation.y = 0.3; h.setYams(1.7);
  const look = Math.sin(seg(lt, 0, 0.4) * Math.PI); const hitch = Math.max(0, Math.sin(O * 9)) * 0.05;
  pose(h, { ...idle(O), bob: hitch * 0.4, headX: 0.45 * look, headY: -0.2 * look, arms: [[-0.35, 0, 0.45, 1.25 + hitch], [-0.35, 0, -0.45, 1.25 + hitch]] }); h.face('shock', O, talking('hero', O));
}, { grade: 'room', dof: 0.45 });

// ===== DAY 3: the bus =====
const busDrop = 12.22;
function marketBase(O, o = {}) { const M = S.market; resetRig(M.hero); M.bub.update(O, 1); M.deb.forEach(d => d.m.visible = false); M.stalls.forEach(s => { s.position.y = 0; s.rotation.set(0, 0, 0); });
  M.crowd.forEach(p => { resetRig(p); p.root.visible = false; }); resetRig(M.kid); M.kid.root.scale.setScalar(0.62); M.kid.root.visible = false; M.ecl.visible = false; M.stop.visible = o.bus !== false; M.bus2.visible = o.bus !== false;
  const th = 0.3 * elastic(seg(O, busDrop, busDrop + 0.75)) + (O > busDrop ? Math.sin(O * 7) * 0.012 : 0); M.piv.rotation.z = th; const lk = 0.98 * elastic(seg(O, busDrop - 0.02, busDrop + 0.6)); M.lobes.forEach(l => l.scale.set(Math.max(0.001, lk), Math.max(0.001, lk * 0.95), Math.max(0.001, lk)));
  const arrive = eOut(seg(O, 10.35, 11.55)), leave = eIn(seg(O, 16.45, 17.9)); M.bus2.position.x = lerp(-17, 0, arrive) + 30 * leave;
  if (O < busDrop) M.piv.rotation.z = -0.045 * Math.sin(seg(O, 11.45, 11.95) * Math.PI);
  const spin = O < 11.55 ? -lerp(-17, 0, arrive) * 2 : (O > busDrop ? O * 9 : 0); M.wheels.forEach((w, i) => w.rotation.z = i < 2 && O > busDrop && O < 16.45 ? 0 : -spin - 60 * leave);
  const C = M.cond; resetRig(C); C.root.position.set(4.3, -0.3, 1.5); C.root.rotation.y = 0.15; C.root.visible = o.bus !== false; const ct = talking('conductor', O);
  pose(C, { ...idle(O, 2), spineZ: 0.12, headY: -0.5 + (ct ? 0.12 * Math.sin(O * 6) : 0), headX: 0.1, arms: [[-2.9, 0, -0.35, 0.3], [-1.4 + (ct ? 0.35 * Math.sin(O * 11) : 0), 0, 0.9, 0.5]] }); C.face(O > busDrop ? 'grit' : 'calm', O, ct);
}
function heroAtWindow(O) { const M = S.market, h = M.hero; const p = wp(M.win); h.root.position.copy(p); h.root.rotation.set(0, 0, M.piv.rotation.z); h.setYams(1); const tk = talking('hero', O);
  pose(h, { spineX: 0.8, headX: -0.75, headY: 0.25 + 0.1 * Math.sin(O * 2), arms: [[-1.2, 0, 0.5, 0.4], [-2.5 + 0.3 * Math.sin(O * 10), 0, -0.9, 0.5]] }); h.face(tk ? 'smile' : 'worried', O, tk); }
function crowdWatch(O, n, look) { const M = S.market; for (let i = 0; i < n; i++) { const p = M.crowd[i]; p.root.visible = true; p.root.position.set(-6.5 + i * 2.9 + (i % 2) * 0.5, 0, -1.6 - (i % 3) * 0.7); p.root.rotation.y = 0; pose(p, { ...idle(O, i), headY: clamp(Math.atan2(look - p.root.position.x, 4) * 0.9, -1.1, 1.1) }); p.face('shock', O); } }
shot(10.2, 11.8, 'market', { p0: [1.6, 1.8, 7.4], p1: [1.2, 2.7, 12.5], l0: [1.2, 1.5, 1.2], fov: 44, ease: 'io' }, (lt, O) => {
  const M = S.market; marketBase(O); const h = M.hero; popYams(h, O, 10.25, 1.7, 2.35); h.root.position.set(2.5, 0, 2.6);
  const lk = eIO(seg(O, 10.9, 11.3)); pose(h, { ...idle(O), headY: 1.0 * lk, arms: [[0, 0, 0.13, 0.2], [0, 0, -0.13, 0.2]] }); h.face(O < 10.9 ? 'shock' : 'calm', O);
}, { grade: 'market', flash: 10.2, flare: [0.85, 0.1] });
shot(11.8, 12.8, 'market', { p0: [4.4, 1.7, 9.6], p1: [4.0, 1.75, 8.8], l0: [1.4, 1.5, 1.0], fov: 46 }, (lt, O) => {
  const M = S.market; marketBase(O); const h = M.hero; h.setYams(2.35); const k = eIO(seg(O, 11.8, 12.12)); h.root.position.set(lerp(2.5, 2.3, k), 0.25 * Math.sin(k * Math.PI), lerp(2.6, 1.7, k)); h.root.rotation.y = Math.PI * eOut(seg(O, 11.8, 11.95));
  h.root.scale.setScalar(lerp(1, 0.8, seg(O, 12.0, 12.12))); h.root.visible = O < 12.12; pose(h, walk(O, 14, 0.9)); h.face('calm', O);
  if (O > busDrop) burst(M.deb.slice(0, 10), O, busDrop, wp(M.wheels[0]).add(V([-1.0, -0.3, 0.6])), 2.2, 1.6);
}, { grade: 'market', shakeAt: [[busDrop, 0.07]], mblur: 3 });
let CAMP = V([0, 2, 6]), CAML = V([0, 1.5, 0]);
shot(12.8, 15.15, 'market', { pf: () => CAMP, lf: () => CAML, fov: 34 }, (lt, O, T, sh) => {    // the conductor
  const M = S.market; marketBase(O); M.hero.root.visible = false; const hd = wp(M.cond.head).add(V([0, 0.3, 0])); const e = eOut(sh ? lt : lt);
  CAML = hd.clone().add(V([-0.25, -0.1, 0])); CAMP = hd.clone().add(V([lerp(1.9, 1.5, e), lerp(0.25, 0.15, e), lerp(4.4, 3.7, e)]));
}, { grade: 'market', dof: 0.5 });
shot(15.15, 16.45, 'market', { pf: () => CAMP, lf: () => CAML, fov: 36 }, (lt, O) => {    // "it is only me o"
  const M = S.market; marketBase(O); heroAtWindow(O); const hd = wp(M.hero.head).add(V([0, 0.3, 0])); const e = eOut(lt);
  CAML = hd.clone().add(V([0.1, -0.15, 0])); CAMP = hd.clone().add(V([lerp(-0.9, -0.6, e), lerp(0.5, 0.4, e), lerp(4.6, 3.9, e)]));
}, { grade: 'market', dof: 0.5 });
shot(16.45, 17.6, 'market', { p0: [1.5, 2.2, 12.5], p1: [2.6, 2.4, 13.5], l0: [2.5, 1.9, 1.0], l1: [6, 1.9, 1.0], fov: 46, ease: 'lin' }, (lt, O) => {
  const M = S.market; marketBase(O); heroAtWindow(O); crowdWatch(O, 5, M.bus2.position.x + 1);
  const k = Math.floor((O - 16.45) / 0.22); const t0 = 16.45 + k * 0.22; burst(M.deb.slice(0, 12), O, t0, wp(M.piv).add(V([-1.3, -0.35, 0])), 1.6, 1.0);
}, { grade: 'market', mblur: 3 });

// ===== DAY 4: the seesaw =====
const sitT = 20.45;
function parkBase(O, o = {}) { const P = S.park; resetRig(P.hero); P.bub.update(O, 1); P.pigeons.forEach(p => p.visible = false); P.bigP.visible = false; P.deb.forEach(d => d.m.visible = false); P.phone.visible = false; P.star.visible = false;
  P.tour.forEach(t => { resetRig(t); t.root.visible = false; }); resetRig(P.stranger); P.stranger.root.visible = false;
  P.plank.rotation.z = o.plank ?? (O < sitT ? 0.2 : -0.2 + 0.4 * (1 - elastic(seg(O, sitT, sitT + 0.5))) * 0 - 0.03 * Math.sin((O - sitT) * 14) * Math.exp(-(O - sitT) * 5)); }
function endPos(P, side) { const a = P.plank.rotation.z; return V([2.2 + side * 1.95 * Math.cos(a), 0.6 + side * 1.95 * Math.sin(a) + 0.06, 0.6]); }
function strangerSit(O) { const P = S.park, s = P.stranger; s.root.visible = true; const e = endPos(P, -1); s.root.position.set(e.x, e.y - 0.56, e.z); s.root.rotation.y = Math.PI / 2; const tk = talking('stranger', O); const wv = seg(O, 18.3, 18.7) * (1 - seg(O, 19.9, 20.2));
  pose(s, { ...SEATED, spineX: 0.05, headY: -0.15, arms: [[-0.5, 0, 0.3, 0.9], [-2.7 * wv - 0.5 * (1 - wv), 0, -0.35 - 0.25 * wv * Math.sin(O * 12), 0.4 + 0.5 * (1 - wv)]] }); s.face(tk || wv > 0.5 ? 'smile' : 'calm', O, tk); }
shot(17.6, 19.4, 'park', { p0: [2.6, 1.8, 6.6], p1: [2.9, 3.3, 12.5], l0: [2.6, 1.2, 0.6], fov: 42, ease: 'io' }, (lt, O) => {   // DAY 4 — tier pull-back
  const P = S.park; parkBase(O); strangerSit(O); const h = P.hero; popYams(h, O, 17.65, 2.35, 3.2); const k = seg(O, 18.0, 19.4); h.root.position.set(lerp(7.4, 5.3, k), 0, 0.6); h.root.rotation.y = -Math.PI / 2;
  pose(h, O > 18.0 ? walk(O, 7, 0.9) : idle(O)); h.face(O < 18.6 ? 'shock' : 'smile', O);
}, { grade: 'park', flash: 17.6, flare: [0.82, 0.12] });
shot(19.4, 20.9, 'park', { p0: [2.7, 1.5, 7.6], p1: [2.5, 1.45, 7.0], l0: [2.4, 1.35, 0.6], fov: 44 }, (lt, O) => {   // sit down -> launch
  const P = S.park; parkBase(O); const h = P.hero, s = P.stranger; h.setYams(3.2); h.root.rotation.y = -Math.PI / 2;
  const walkK = seg(O, 19.4, 19.95), hop = seg(O, 20.08, sitT), e = endPos(P, 1); const seatY = e.y - 0.52;
  if (O < 20.08) { h.root.position.set(lerp(5.3, 4.35, eOut(walkK)), 0, 0.6); const ant = seg(O, 19.95, 20.08); pose(h, walkK < 1 ? walk(O, 7, 0.8) : { bob: -0.14 * ant, legs: [[0.3 * ant, 0.6 * ant], [0.3 * ant, 0.6 * ant]], arms: [[0.5 * ant, 0, 0.2, 0.2], [0.5 * ant, 0, -0.2, 0.2]] }); h.face('smile', O); }
  else if (O < sitT) { h.root.position.set(lerp(4.35, e.x + 0.1, hop), lerp(0, seatY, hop) + 0.75 * Math.sin(hop * Math.PI), 0.6); pose(h, { bob: -0.38 * hop, legs: [[1.45 * hop, -1.5 * hop], [1.45 * hop, -1.5 * hop]], arms: [[-1.6, 0, 0.5, 0.3], [-1.6, 0, -0.5, 0.3]] }); h.face('smile', O); }
  else { const b = Math.exp(-(O - sitT) * 6) * Math.sin((O - sitT) * 16) * 0.08; h.root.position.set(e.x + 0.1, seatY + b, 0.6); const up = eOut(seg(O, sitT + 0.1, sitT + 0.4)); pose(h, { ...SEATED, headX: -0.75 * up, spineX: -0.1 * up, arms: [[-0.4, 0, 0.6, 0.5], [-0.4, 0, -0.6, 0.5]] }); h.face('shock', O); }
  if (O < sitT) strangerSit(O); else { const dt = O - sitT; s.root.visible = true; const e0 = endPos({ plank: { rotation: { z: 0.2 } } }, -1); s.root.position.set(e0.x - 1.2 * dt, e0.y - 0.56 + 44 * dt - 6 * dt * dt, 0.6); s.root.rotation.set(0, Math.PI / 2, 0); s.root.rotateX(-dt * 9);
    pose(s, { legs: [[0.6 + Math.sin(O * 30) * 0.5, 0.7], [-0.3 + Math.cos(O * 30) * 0.5, 0.5]], arms: [[-2.6 + Math.sin(O * 34) * 0.5, 0, 0.6, 0.2], [-2.6 + Math.cos(O * 31) * 0.5, 0, -0.6, 0.2]] }); s.face('shock', O, true); burst(P.deb.slice(0, 8), O, sitT, V([0.3, 0.3, 0.6]), 1.2, 1.4); }
}, { grade: 'park', shakeAt: [[sitT, 0.07]], mblur: 5 });
shot(20.9, 22.4, 'park', { p0: [2.6, 1.3, 5.5], p1: [2.5, 1.3, 5.2], l0: [1.6, 9, -3], l1: [1.3, 15, -5], fov: 50, ease: 'out' }, (lt, O) => {   // into the sky
  const P = S.park; parkBase(O); P.hero.root.visible = false; const s = P.stranger; const k = seg(O, 20.9, 22.15); s.root.visible = k < 1; const kk = 1 - Math.pow(1 - k, 2);
  s.root.position.set(lerp(1.9, 0.9, kk), lerp(7, 26, kk), lerp(-2, -9, kk)); s.root.scale.setScalar(lerp(1, 0.1, kk)); s.root.rotation.set(O * 7, 1.2, O * 3);
  pose(s, { legs: [[0.6 + Math.sin(O * 30) * 0.5, 0.7], [-0.3 + Math.cos(O * 30) * 0.5, 0.5]], arms: [[-2.6 + Math.sin(O * 34) * 0.5, 0, 0.6, 0.2], [-2.6 + Math.cos(O * 31) * 0.5, 0, -0.6, 0.2]] }); s.face('shock', O, true);
  const tw = seg(O, 22.15, 22.4); P.star.visible = O >= 22.15; P.star.position.set(0.9, 26, -9); P.star.scale.setScalar(0.4 + 3.2 * Math.sin(tw * Math.PI) + 0.3 * tw); P.star.material.rotation = O * 3;
}, { grade: 'park' });
shot(22.4, 23.8, 'park', { p0: [2.9, 1.75, 4.4], p1: [3.0, 1.72, 4.0], l0: [4.1, 1.45, 0.6], fov: 36 }, (lt, O) => {
  const P = S.park; parkBase(O); const h = P.hero; h.setYams(3.2); const e = endPos(P, 1); h.root.position.set(e.x + 0.1, e.y - 0.52, 0.6); h.root.rotation.y = -Math.PI / 2 + 1.25; const tk = talking('hero', O);
  pose(h, { ...SEATED, headX: -0.5 + 0.06 * Math.sin(O * 3), headY: -0.2, spineX: -0.08, arms: [[-0.4, 0, 0.5, 0.4], [-2.35, 0, -0.75, 2.0]] }); h.face('worried', O, tk);
  P.star.visible = O < 22.75; P.star.position.set(0.9, 26, -9); P.star.scale.setScalar(0.6 * (1 - seg(O, 22.4, 22.75)) + 0.01);
}, { grade: 'park', dof: 0.5 });

// ===== DAY 5: listed on the map =====
const HP = [4.3, 0, 1.6];
shot(23.8, 25.5, 'park', { p0: [4.3, 12, 5.2], p1: [4.3, 19, 7.2], l0: [4.3, 0, 0.6], fov: 44, ease: 'out' }, (lt, O) => {
  const P = S.park; parkBase(O, { plank: -0.2 }); const h = P.hero; popYams(h, O, 23.85, 3.2, 5.0); h.root.position.set(...HP); h.root.rotation.y = Math.PI; pose(h, { ...idle(O), headX: -0.5, arms: [[0, 0, 0.5, 0.3], [0, 0, -0.5, 0.3]] }); h.face('shock', O);
}, { grade: 'park', flash: 23.8, map: true });
shot(25.5, 27.2, 'park', { p0: [4.9, 1.9, 5.6], p1: [4.75, 1.85, 5.1], l0: [4.3, 1.6, 1.6], fov: 36 }, (lt, O) => {
  const P = S.park; parkBase(O, { plank: -0.2 }); const h = P.hero; h.setYams(5.0); h.root.position.set(...HP); h.root.rotation.y = 0.2; P.phone.visible = true; const up = eOut(seg(O, 25.6, 25.8)); const tk = talking('hero', O);
  pose(h, { ...idle(O), headX: 0.42 * (1 - up) - 0.05 * up, headY: 0.25 * (1 - up), arms: [[-0.5, 0, 0.3, 1.3 + 0.1 * Math.sin(O * 14) * (1 - up)], [-0.75 - 0.25 * up, 0, -0.3 - 0.3 * up, 1.75]] }); h.face(up > 0.5 ? 'confused' : 'calm', O, tk);
}, { grade: 'park', dof: 0.5 });

// ===== MONTAGE: tourist photos =====
const tourPose = { peace: (O) => ({ ...idle(O), arms: [[-1.5, 0, 0.3, 0.25], [-2.4, 0, -0.5, 0.9]] }), lift: (O) => ({ ...idle(O), spineX: -0.1, arms: [[-2.75, 0, 0.25, 0.15], [-2.75, 0, -0.25, 0.15]] }), jump: (O) => ({ bob: 0.25 + 0.2 * Math.abs(Math.sin(O * 9)), legs: [[0.3, 0.9], [0.3, 0.9]], arms: [[-2.7, 0, 0.7, 0.1], [-2.7, 0, -0.7, 0.1]] }), snap: (O) => ({ ...idle(O), arms: [[-1.45, 0, -0.35, 1.5], [-1.45, 0, 0.35, 1.5]] }) };
const mCuts = [
  { cam: { p0: [5.3, 1.8, 7.4], l0: [4.6, 1.75, 1.6], fov: 40 }, cap: 'Twin Hills!!', rot: -0.045, t: [[0, 5.0, 4.6, 0.15, 'peace', 'laugh']] },
  { cam: { p0: [1.2, 1.1, 7.6], l0: [3.2, 2.2, 1.6], fov: 40 }, cap: 'so strong', rot: 0.04, t: [[1, 2.2, 4.4, 0.5, 'lift', 'grit']] },
  { cam: { p0: [4.3, 1.5, 8.6], l0: [4.3, 1.9, 1.6], fov: 42 }, cap: 'best trip ever', rot: -0.03, t: [[0, 3.2, 4.6, 0, 'jump', 'laugh'], [2, 5.4, 4.6, 0, 'jump', 'laugh']] },
  { cam: { p0: [4.7, 1.9, 4.4], l0: [4.3, 1.68, 1.6], fov: 36 }, cap: 'the owner (shy)', rot: 0.05, hero: 'front', t: [[1, 5.5, 2.3, -0.5, 'snap', 'smile']] },
  { cam: { p0: [4.3, 2.6, 12.5], l0: [4.3, 2.0, 1.6], fov: 40 }, cap: 'wish you were here', rot: -0.02, post: true, t: [[0, 2.0, 5.0, 2.6, 'snap', 'smile'], [1, 3.4, 6.0, 3.0, 'peace', 'smile'], [2, 6.4, 5.4, 3.4, 'snap', 'smile']] },
];
mCuts.forEach((m, i) => { const t0 = MONTAGE[0] + i * 0.72, t1 = i === mCuts.length - 1 ? MONTAGE[1] : t0 + 0.72;
  shot(t0, t1, 'park', { ...m.cam, z0: 1, z1: 1.1, ease: 'lin' }, (lt, O) => { const P = S.park; parkBase(O, { plank: -0.2 }); const h = P.hero; h.setYams(5.0); h.root.position.set(...HP);
    if (m.hero === 'front') { h.root.rotation.y = 0.25; pose(h, { ...idle(O), headY: -0.3, arms: [[-0.6, 0, 0.7, 1.5], [-0.6, 0, -0.7, 1.5]] }); h.face('worried', O); } else { h.root.rotation.y = Math.PI * 0.92; pose(h, { ...idle(O), headY: 1.0 + 0.1 * Math.sin(O * 5) }); h.face('worried', O); }
    m.t.forEach(([j, x, z, ry, ps, fc]) => { const t = P.tour[j]; t.root.visible = true; t.root.position.set(x, 0, z); t.root.rotation.y = ry; pose(t, tourPose[ps](O + j)); t.face(fc, O); });
  }, { grade: 'park', flash: t0, hideStat: true, live: 1.4, pol: { cap: m.cap, rot: m.rot, post: m.post } }); });

// ===== DAY 6: ski resort =====
function lobeC(h, i) { return wp(h.lobes[i]); }
function skiBase(O, s) { const K = S.ski, h = K.hero; resetRig(h); h.setYams(s); h.caps.forEach(c => c.visible = true); K.snow(O); const R = 0.2 * s; h.root.updateMatrixWorld(true);
  K.skiers.forEach((g, j) => { const i = j % 2; const C = lobeC(h, i); const ph = (O * 0.42 + j * 0.137) % 1; const f = (p) => { const phi = 0.3 + p * 1.15, az = (i ? -0.25 : 0.25) + Math.sin(p * 9 + j * 2) * 0.42; return V([C.x + R * Math.sin(phi) * Math.sin(az), C.y + R * 0.95 * Math.cos(phi), C.z + R * 0.9 * Math.sin(phi) * Math.cos(az)]); };
    const p = f(ph), q = f(ph + 0.02); g.position.copy(p); g.lookAt(q); g.visible = s > 8 && ph < 0.97; g.userData.p = p; });
  K.cabin.position.copy(lobeC(h, 0)).add(V([0.2, R * 0.93, R * 0.2])); K.cabin.visible = s > 8; K.flags.forEach((f, k) => { const i = k % 2, C = lobeC(h, i), phi = 0.45 + Math.floor(k / 2) * 0.3, az = (i ? 0.55 : -0.55); f.position.set(C.x + R * Math.sin(phi) * Math.sin(az), C.y + R * 0.95 * Math.cos(phi), C.z + R * 0.9 * Math.sin(phi) * Math.cos(az)); f.visible = s > 8; f.rotation.z = 0.1 * Math.sin(O * 6 + k); });
  K.puffs.forEach(p => p.visible = false); }
const shiver = (O) => Math.sin(O * 41) * 0.012;
shot(30.8, 33.0, 'ski', { p0: [0, 2.0, 7.5], p1: [0, 3.6, 16], l0: [0, 2.6, -1.4], fov: 46, ease: 'io' }, (lt, O) => {
  const K = S.ski; skiBase(O, lerp(5, 13, elastic(seg(O, 30.85, 31.75)))); const h = K.hero; const cold = seg(O, 31.6, 32.2); h.root.position.x = shiver(O) * cold;
  pose(h, { ...idle(O), headY: 0.9 * eIO(seg(O, 31.9, 32.4)), arms: [[-0.9 * cold, 0, 0.13 + 0.8 * cold, 0.15 + 1.75 * cold], [-0.9 * cold, 0, -0.13 - 0.8 * cold, 0.15 + 1.75 * cold]] }); h.face(O < 31.6 ? 'shock' : 'worried', O);
}, { grade: 'ski', flash: 30.8 });
shot(33.0, 34.0, 'ski', { pf: () => CAMP, lf: () => CAML, fov: 44 }, (lt, O) => {
  const K = S.ski; skiBase(O, 13); const h = K.hero; pose(h, idle(O)); h.face('worried', O); const g = K.skiers[1]; const p = g.userData.p; CAML = p.clone().add(V([0, 0.2, 0])); CAMP = p.clone().add(V([1.3, 0.75, 2.6]));
}, { grade: 'ski', mblur: 3 });
shot(34.0, 36.4, 'ski', { p0: [0.7, 1.95, 3.9], p1: [0.5, 1.9, 3.3], l0: [0, 1.72, 0], fov: 36 }, (lt, O) => {
  const K = S.ski; skiBase(O, 13); const h = K.hero; const tk = talking('hero', O); h.root.position.x = shiver(O); h.root.rotation.y = 0.1;
  pose(h, { bob: Math.sin(O * 39) * 0.006, spineX: 0.1, spineZ: Math.sin(O * 37) * 0.012, headX: 0.05, headY: 0.35 * Math.sin(seg(O, 34.9, 36.2) * Math.PI), legs: [[0.05, 0.12], [0.05, 0.12]], arms: [[-0.9, 0, 0.93, 1.9], [-0.9, 0, -0.93, 1.9]] }); h.face('grit', O, tk);
  K.puffs.forEach((p, i) => { const ph = ((O - 34.0) * 0.9 + i * 0.33) % 1; p.visible = tk; p.position.set(0.12 + ph * 0.5, 1.95 + ph * 0.45, 0.45 + ph * 0.6); p.scale.setScalar(0.6 + ph * 2.2); p.material.opacity = 0.45 * (1 - ph); });
}, { grade: 'ski', dof: 0.5 });

// ===== SPACE =====
function spaceBase(O, o = {}) { const P = S.space; const cos = o.cosmic ?? 0;
  P.sc.background.setRGB(lerp(0.02, 0.1, cos), lerp(0.027, 0.06, cos), lerp(0.05, 0.36, cos)); P.nebs.forEach(n => n.material.opacity = 0.38 * cos);
  resetRig(P.hero); P.hero.root.position.set(0, Math.sin(O * 1.3) * 0.08, 0); P.hero.root.rotation.set(0.05, o.heroRot ?? 0.25, Math.sin(O) * 0.04);
  P.earth.visible = o.earth ?? true; P.earth.rotation.y = O * 0.04; P.earth.position.set(0, -22, -8); P.earth.scale.setScalar(1); P.moon.visible = !!o.moon; P.astro.root.visible = false; P.planets.forEach(p => p.visible = !!o.planets);
  P.sunMesh.visible = !!o.sun; P.sunMesh.scale.setScalar(1); P.hearts.forEach(h => h.visible = false); P.bub.update(O, o.bubbles ?? 1); P.ufo.visible = !!o.ufo; P.ticket.visible = false; resetRig(P.girl); P.girl.root.scale.setScalar(0.85); P.girl.root.visible = false;
  P.ufoL.forEach((l, i) => l.material.emissiveIntensity = 1.2 + 1.5 * (Math.sin(O * 9 + i * 0.63) > 0 ? 1 : 0)); }
function floatPose(O, extra = {}) { return { bob: 0, legs: [[0.25 + 0.1 * Math.sin(O * 1.7), 0.35], [-0.1 + 0.1 * Math.sin(O * 1.5), 0.2]], arms: [[0, 0, 0.9 + 0.1 * Math.sin(O * 2), 0.3], [0, 0, -0.9 - 0.1 * Math.sin(O * 2.1), 0.3]], headY: Math.sin(O * 0.8) * 0.1, ...extra }; }
const orbitPlanets = (O, R0 = 14) => S.space.planets.forEach((p, i) => { const a = O * (0.5 + i * 0.07) + i * 0.9, R = R0 + i * 2.2, zz = Math.sin(a) * R * 0.7; p.position.set(Math.cos(a) * R, Math.sin(a * 1.3) * 2.5 + 8, -Math.abs(zz) - 14); p.rotation.y = O * 0.5 + i; });
// DAY 7 — the eclipse
shot(36.4, 38.0, 'space', { p0: [0, 1, 10], p1: [0, 1.2, 8.5], l0: [0, 6.6, -90], fov: 30, ease: 'lin' }, (lt, O) => {
  const P = S.space; spaceBase(O, { sun: true }); P.sunMesh.position.set(0, 7, -90); P.sunMesh.scale.setScalar(1.15); P.sunMesh.rotation.set(0, O * 0.2, 0);
  popYams(P.hero, O, 36.45, 13, 26, 0.9); P.hero.root.position.set(lerp(-15, 0.6, eOut(seg(O, 36.4, 37.75))), -1.3 + Math.sin(O * 1.3) * 0.1, -40); P.hero.root.rotation.set(0, Math.PI, 0); pose(P.hero, floatPose(O)); P.hero.face('shock', O);
}, { grade: 'space', flash: 36.4, bloom: 0.3, dark: (O) => 0.5 * eIO(seg(O, 37.0, 37.7)) });
function eclipseCrowd(O, back) { const M = S.market; const sl = [[-2.6, 2.4], [-1.5, 3.1], [1.6, 2.9], [2.7, 2.2], [-3.6, 3.4], [3.7, 3.3], [-0.9, 1.7], [1.0, 1.6]];
  sl.forEach(([x, z], i) => { const p = M.crowd[i]; p.root.visible = true; p.root.position.set(x, 0, z); p.root.rotation.y = 0.1 * Math.sin(i * 3); p.glasses.visible = true; pose(p, { ...idle(O, i), headX: -0.62, headY: 0, arms: i % 3 === 0 ? [[-2.5, 0, 0.3, 1.9], [0, 0, -0.13, 0.15]] : undefined }); p.face('shock', O); });
  const k = M.kid; k.root.visible = true; k.root.position.set(0.05, 0, 3.7); const tk = talking('kid', O); pose(k, { ...idle(O, 3), headX: -0.6, headY: 0.3 * Math.sin(O * 2.2) * (tk ? 1 : 0.3), arms: [[-2.75 + 0.06 * Math.sin(O * 12), 0, -0.2, 0.05], [-0.3, 0, -0.9, 1.2]] }); k.face(tk ? 'laugh' : 'shock', O, tk); }
shot(38.0, 39.6, 'market', { p0: [0.5, 0.75, 7.0], p1: [0.35, 0.8, 6.3], l0: [0, 1.15, 3.2], fov: 42 }, (lt, O) => { marketBase(O, { bus: false }); S.market.hero.root.visible = false; eclipseCrowd(O); }, { grade: 'eclipse', dof: 0.35 });
shot(39.6, 40.8, 'market', { p0: [0.4, 1.3, -1.8], p1: [0.3, 1.35, -1.4], l0: [0, 9, 20], l1: [0, 10.5, 20], fov: 50 }, (lt, O) => { marketBase(O, { bus: false }); S.market.hero.root.visible = false; eclipseCrowd(O); S.market.ecl.visible = true; S.market.ecl.children[0].scale.setScalar(46 + 3 * Math.sin(O * 5)); }, { grade: 'eclipse' });
// DAY 8 — the parking ticket
const ufoPos = (O) => { const k = seg(O, 40.95, 41.75); const e = elastic(k); return V([lerp(26, 6.0, e), lerp(30, 14.5, e) + Math.sin(O * 2.6) * 0.25, lerp(16, 9, e)]); };
function ufoSet(O) { const P = S.space; P.ufo.position.copy(ufoPos(O)); P.ufo.rotation.set(0.08 * Math.sin(O * 2.1), O * 1.2, 0.1 * Math.sin(O * 1.7)); const A = P.alien; A.root.rotation.y = -O * 1.2 + 0.1; const tk = talking('alien', O);
  pose(A, { ...idle(O), headY: 0.1 * Math.sin(O * 1.5), arms: [[-1.2, 0, 0.35, 1.3], [-1.1 + 0.12 * Math.sin(O * 16), 0, -0.45, 1.5]] }); A.face('calm', O, tk); A.glasses.visible = true; }
function ticketSet(O, s) { const P = S.space; if (O < 43.5) return; P.ticket.visible = true; const C = lobeC(P.hero, 1), R = 0.2 * s; const n = V([0.25, 0.42, 0.87]).normalize(); const k = seg(O, 43.5, 43.58), e = elastic(seg(O, 43.58, 44.1));
  P.ticket.position.copy(C).add(n.clone().multiplyScalar(R * (1.01 + 1.6 * (1 - k)))); P.ticket.lookAt(P.ticket.position.clone().add(n)); P.ticket.rotateZ(-0.18); P.ticket.scale.setScalar(k < 1 ? 1.3 : 1.25 - 0.25 * e); }
shot(40.8, 42.0, 'space', { p0: [0, 6, 44], p1: [0, 6.5, 40], l0: [0, 7.5, -2], fov: 46, ease: 'out' }, (lt, O) => {
  const P = S.space; spaceBase(O, { planets: true, earth: false, cosmic: 1, ufo: true }); popYams(P.hero, O, 40.85, 26, 34, 0.9); pose(P.hero, floatPose(O, { headY: 0.5 * seg(O, 41.3, 41.7), headX: -0.3 * seg(O, 41.3, 41.7) })); P.hero.face('shock', O); orbitPlanets(O); ufoSet(O);
}, { grade: 'cosmic', flash: 40.8, bloom: 0.22, mblur: 4 });
shot(42.0, 43.55, 'space', { pf: () => CAMP, lf: () => CAML, fov: 30 }, (lt, O) => {
  const P = S.space; spaceBase(O, { planets: true, earth: false, cosmic: 1, ufo: true }); P.hero.setYams(34); pose(P.hero, floatPose(O)); P.hero.face('worried', O); orbitPlanets(O); ufoSet(O); P.ufo.rotation.y = 0.15 * Math.sin(O * 0.9); P.alien.root.rotation.y = 0.1;
  const u = P.ufo.position; CAML = u.clone().add(V([0, 0.75, 0])); CAMP = u.clone().add(V([lerp(1.2, 0.8, lt), 1.3, lerp(8.2, 7.2, eOut(lt))]));
}, { grade: 'cosmic', bloom: 0.22, dof: 0.4 });
shot(43.55, 44.4, 'space', { p0: [9, 9, 30], p1: [8.6, 8.8, 27.5], l0: [5.5, 9.5, 0], fov: 44 }, (lt, O) => {
  const P = S.space; spaceBase(O, { planets: true, earth: false, cosmic: 1, ufo: true }); P.hero.setYams(34); pose(P.hero, floatPose(O, { headY: 0.9, headX: -0.4 })); P.hero.face('shock', O, talking('hero', O)); orbitPlanets(O); ufoSet(O); ticketSet(O, 34);
}, { grade: 'cosmic', bloom: 0.22, shakeAt: [[43.58, 0.06]], mblur: 3 });
shot(44.4, 45.8, 'space', { p0: [1.3, 2.0, 4.6], p1: [1.0, 1.95, 4.0], l0: [0.1, 1.72, 0], fov: 38 }, (lt, O) => {
  const P = S.space; spaceBase(O, { planets: true, earth: false, cosmic: 1, ufo: true, heroRot: 0.35 }); P.hero.setYams(34); const tk = talking('hero', O);
  pose(P.hero, floatPose(O, { arms: [[-0.5, 0, 1.25 + 0.1 * Math.sin(O * 9), 0.9], [-0.5, 0, -1.25 - 0.1 * Math.sin(O * 9), 0.9]], headY: -0.15, headX: -0.05 })); P.hero.face(tk ? 'confused' : 'worried', O, tk); orbitPlanets(O); ufoSet(O); ticketSet(O, 34);
  const fl = eIn(seg(O, 45.0, 45.8)); P.ufo.position.add(V([30 * fl, 40 * fl, -20 * fl]));
}, { grade: 'cosmic', bloom: 0.22, dof: 0.4 });
// DAY 9 — a chair his size
const sitE = 49.3, YS = 48;
function day9(O, o = {}) { const P = S.space; spaceBase(O, { planets: false, earth: true, cosmic: 0.55, heroRot: 0, moon: true }); const h = P.hero; popYams(h, O, 45.85, 34, YS, 0.9);
  const drop = eIn(seg(O, 48.75, sitE)), set = elastic(seg(O, sitE, sitE + 0.9)); const y = -6.5 * drop - 2.6 * set; h.root.position.set(0, y + Math.sin(O * 1.3) * 0.06 * (1 - drop), 0); h.root.rotation.set(0, 0, 0);
  const sq = set; P.earth.position.set(0, -15.5, -8.6); P.earth.scale.set(0.6 * (1 + 0.28 * sq), 0.6 * (1 - 0.47 * sq), 0.6 * (1 + 0.28 * sq));
  const a = O * 0.22 + 0.5; P.moon.position.set(Math.cos(a) * 15, -6 + Math.sin(a * 1.7) * 1.0, 14 + Math.sin(a) * 6); P.moon.rotation.y = O * 0.1;
  const g = P.girl; g.root.visible = true; g.root.position.copy(P.moon.position).add(V([0, 1.52, 0])); g.root.rotation.y = Math.atan2(-g.root.position.x, -g.root.position.z - 0) + (o.girlTurn ?? 0);
  const sh = shouting('stranger', O); pose(g, { ...idle(O, 1), headY: o.girlHead ?? 0, headX: sh ? -0.15 : 0.05, arms: sh ? [[-0.4, 0, 1.2, 0.6], [-0.4, 0, -1.2, 0.6]] : [[-0.75, 0, -0.5, 1.75], [-0.75, 0, 0.5, 1.75]] }); g.face(sh ? 'shock' : 'calm', O, sh);
  if (sh) { g.mLine.visible = false; g.cL.visible = g.cR.visible = false; g.mO.visible = true; g.mO.scale.set(1.25, 1.5 + 0.15 * Math.sin(O * 30), 1); }
  const seated = seg(O, 48.6, sitE); const tk = talking('hero', O); const relax = eOut(seg(O, sitE + 0.3, sitE + 0.9));
  pose(h, { bob: 0, legs: [[lerp(0.25, 1.35, seated), lerp(0.35, -0.5, seated)], [lerp(-0.1, 1.35, seated), lerp(0.2, -0.5, seated)]], spineX: -0.22 * relax, headX: lerp(0.45 * seg(O, 46.6, 47.2) * (1 - seg(O, 47.6, 48.0)), -0.1, relax), headY: 0.1 * Math.sin(O * 0.8),
    arms: [[lerp(0, -2.75, relax), 0, lerp(0.9, -0.55, relax), lerp(0.3, 2.3, relax)], [lerp(0, -2.75, relax), 0, lerp(-0.9, 0.55, relax), lerp(0.3, 2.3, relax)]] });
  h.face(O < 47.6 ? 'shock' : O < sitE ? 'smirk' : 'smile', O, tk); return y; }
shot(45.8, 48.6, 'space', { p0: [0, 6, 96], l0: [0, 0, -4], fov: 46, z0: 1.7, z1: 1.0, roll0: 9, roll1: 0, ease: 'out' }, (lt, O) => { day9(O); }, { grade: 'space2', bloom: 0.16, flash: 45.8 });
shot(48.6, 51.6, 'space', { p0: [0, 0, 84], p1: [0, -3, 70], l0: [0, -5, -5], fov: 46 }, (lt, O) => { day9(O); }, { grade: 'space2', bloom: 0.16, shakeAt: [[sitE, 0.09]], mblur: 3 });
shot(51.6, 53.6, 'space', { pf: () => CAMP, lf: () => CAML, fov: 36 }, (lt, O) => { const y = day9(O); CAML = V([0, y + 1.78, 0]); CAMP = V([lerp(1.3, 1.0, lt), y + 2.0, lerp(4.8, 4.1, eOut(lt))]); }, { grade: 'space2', bloom: 0.14, dof: 0.45 });
shot(53.6, 54.6, 'space', { pf: () => CAMP, lf: () => CAML, fov: 40 }, (lt, O) => { day9(O, { girlHead: 0.0 }); const m = S.space.moon.position; CAML = m.clone().add(V([-1.2, 1.9, -2])); CAMP = m.clone().add(V([lerp(3.2, 2.6, eOut(lt)), 2.6, 7.5])); }, { grade: 'space2', bloom: 0.14 });
shot(54.6, DUR, 'space', { pf: () => CAMP, lf: () => CAML, fov: 34 }, (lt, O) => { day9(O, { girlTurn: Math.PI + 0.25 }); const hd = wp(S.space.girl.head).add(V([0, 0.3, 0])); CAML = hd.clone(); CAMP = hd.clone().add(V([lerp(0.9, 0.6, lt), 0.2, lerp(4.4, 3.2, eOut(lt))])); }, { grade: 'space2', bloom: 0.14, dof: 0.4, shakeAt: [[54.8, 0.04]] });

