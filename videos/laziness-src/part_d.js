const SAFE_L = 90, SAFE_R = 140, CAP_W = W - SAFE_L - SAFE_R, CAP_X = SAFE_L + CAP_W / 2;   // safe area: full-screen players crop the edges, Instagram's buttons cover the right side
function stepAt(T) { let s = null; for (const st of STEPS) if (T >= st.t) s = st; return s; }
function spaced(g, text, x, y, sp) { let cx = x; for (const ch of text) { g.fillText(ch, cx, y); cx += g.measureText(ch).width + sp; } return cx - x; }
const measC = mk(10, 10).getContext('2d');
function drawWatch(T, sh) {   // the smartwatch: steps today halve every day (laziness ×2); it buzzes on every new day and nags
  const s = stepAt(T); if (!s || sh.hideStat) return; const idx = STEPS.indexOf(s); const g = ctx; const dt = T - s.t; const prev = idx > 0 ? STEPS[idx - 1] : null;
  const bz = dt < 0.5 ? Math.sin(dt * 90) * 7 * (1 - dt / 0.5) : 0; const x = SAFE_L, y = 250, w = 400, h = 236;
  g.save(); g.translate(bz, 0); g.shadowColor = 'rgba(0,0,0,0.5)'; g.shadowBlur = 24; g.shadowOffsetY = 8;
  g.fillStyle = '#2a2d33'; rr(g, x + 70, y - 34, w - 140, 50, 12); g.fill(); rr(g, x + 70, y + h - 16, w - 140, 50, 12); g.fill();
  g.fillStyle = '#0d0f13'; rr(g, x, y, w, h, 46); g.fill(); g.shadowBlur = 0; g.shadowOffsetY = 0; g.strokeStyle = '#3a3f48'; g.lineWidth = 4; rr(g, x + 2, y + 2, w - 4, h - 4, 44); g.stroke();
  g.fillStyle = '#4a4f58'; rr(g, x + w - 2, y + 70, 12, 50, 5); g.fill();
  g.textAlign = 'left'; g.fillStyle = '#7fe3ff'; g.font = '700 21px InterW'; spaced(g, 'STEPS TODAY', x + 34, y + 50, 3);
  const steps = (v) => parseFloat(String(v).replace(/,/g, '')); const ringK = clamp(steps(s.v) / 10000);
  g.lineWidth = 12; g.strokeStyle = '#26303a'; g.beginPath(); g.arc(x + w - 70, y + 64, 30, 0, 7); g.stroke(); g.strokeStyle = '#3fe08a'; g.lineCap = 'round'; g.beginPath(); g.arc(x + w - 70, y + 64, 30, -Math.PI / 2, -Math.PI / 2 + Math.max(0.03, ringK) * Math.PI * 2); g.stroke(); g.lineCap = 'butt';
  const slide = prev ? eOut(clamp((dt - 0.15) / 0.35)) : 1; g.save(); g.beginPath(); g.rect(x + 20, y + 62, w - 120, 96); g.clip(); g.fillStyle = '#fff';
  const fit = (v) => { let f = 76; g.font = `700 ${f}px InterW`; while (g.measureText(v).width > w - 130 && f > 34) { f -= 2; g.font = `700 ${f}px InterW`; } };
  if (prev && slide < 1) { g.globalAlpha = 1 - slide; fit(prev.v); g.fillText(prev.v, x + 34, y + 138 - slide * 70); }
  g.globalAlpha = slide; fit(s.v); g.fillText(s.v, x + 34, y + 138 + (1 - slide) * 70); g.restore();
  g.fillStyle = '#8a929e'; g.font = '700 22px InterW'; spaced(g, 'DAY ' + (s.day === 'END' ? 31 : s.day), x + 34, y + 196, 3);
  g.fillStyle = '#d7262e'; rr(g, x + 150, y + 170, 214, 38, 19); g.fill(); g.fillStyle = '#fff'; g.font = '700 19px InterW'; spaced(g, 'LAZINESS ×2 DAILY', x + 165, y + 196, 1.5);
  const blink = s.day === 'END' ? 1 : 0.55 + 0.45 * (Math.floor(T * 2.5) % 2); g.globalAlpha = blink * clamp(dt / 0.4); g.fillStyle = s.day === 'END' ? '#3fe08a' : '#ffd21f'; g.font = '700 26px InterW'; g.shadowColor = 'rgba(0,0,0,0.8)'; g.shadowBlur = 10;
  spaced(g, (s.day === 'END' ? '' : '⚠ ') + s.cmp, x + 8, y + h + 78, 2); g.restore(); }
function drawTitle(O) {
  if (O < TITLE.t0 || O >= TITLE.t1) return;
  const a = eOut(clamp((O - TITLE.t0) / 0.45)) * clamp((TITLE.t1 - O) / 0.3), rise = (1 - eOut(clamp((O - TITLE.t0) / 0.7))) * 40;
  const g = ctx; g.save(); g.globalAlpha = a; g.textAlign = 'center';
  const wash = g.createLinearGradient(0, 120, 0, 900); wash.addColorStop(0, 'rgba(40,16,6,0.55)'); wash.addColorStop(1, 'rgba(40,16,6,0)'); g.fillStyle = wash; g.fillRect(0, 0, W, 900);
  g.translate(0, rise); g.shadowColor = 'rgba(0,0,0,0.45)'; g.shadowBlur = 30; g.shadowOffsetY = 4; g.fillStyle = '#fff';
  g.font = '500 96px Playfair'; g.fillText('What if your', W / 2, 380);
  g.font = 'italic 500 206px Playfair'; g.fillStyle = '#ffe2a0'; g.fillText('laziness', W / 2, 600);
  g.fillStyle = '#fff'; g.font = '500 96px Playfair'; g.fillText('doubled every day?', W / 2, 735);
  g.shadowBlur = 0; g.shadowOffsetY = 0; g.globalAlpha = a * 0.85; g.fillStyle = '#E21E39'; g.fillRect(W / 2 - 70, 780, 140, 6); g.restore();
}
function cueAt(O) { let best = null; for (const c of DIALOGUE) if (spanHit(c, O) && O >= c.words[0].t - 0.03) if (!best || c.spans[0][0] > best.spans[0][0]) best = c; return best; }
function strokeText(g, text, x, y, sw) { g.lineJoin = 'round'; g.miterLimit = 2; g.lineWidth = sw; g.strokeStyle = '#000'; g.strokeText(text, x, y); g.fillText(text, x, y); }
function captionChunk(c, O) { const chunks = []; let cur = []; c.words.forEach((w, i) => { cur.push(w); if (cur.length >= 3 || /[.!?…,]$/.test(w.w) || i === c.words.length - 1) { chunks.push(cur); cur = []; } });
  let chunk = chunks[0]; for (const ch of chunks) if (O >= ch[0].t - 0.03) chunk = ch; return chunk.filter(w => O >= w.t - 0.03).map(w => w.w.toUpperCase()).join(' '); }
function drawCaptions(O) {
  const c = cueAt(O); if (!c) return; const g = ctx; g.save(); g.textAlign = 'center'; g.fillStyle = '#fff';
  if (false) { g.font = 'italic 800 64px Montserrat'; c.words.forEach((w, i) => { const k = O - w.t; if (k < -0.03) return; g.globalAlpha = i ? clamp(1 - k / 0.9) * (i === 1 ? 0.6 : 0.35) : 1; strokeText(g, w.w, CAP_X + (i ? (i === 1 ? -120 : 140) : 0), H * 0.72 + i * 70, 10); }); g.restore(); return; }
  if (c.kind === 'shout') { const k = O - c.words[0].t; const s = k < 0.12 ? 0.6 + 4 * k : 1 + 0.04 * Math.sin(O * 50); const txt = c.words.filter(w => O >= w.t - 0.03).map(w => w.w).join(' ');
    g.translate(CAP_X + Math.sin(O * 73) * 6, H * 0.7 + Math.cos(O * 61) * 5); g.scale(s, s); g.rotate(Math.sin(O * 9) * 0.03);
    let fs = 118; g.font = `800 ${fs}px Montserrat`; while (g.measureText(txt).width > CAP_W - 30 && fs > 36) { fs -= 4; g.font = `800 ${fs}px Montserrat`; }
    g.shadowColor = 'rgba(0,0,0,0.45)'; g.shadowBlur = 20; strokeText(g, txt, 0, 0, 16); g.restore(); return; }
  const shown = captionChunk(c, O); if (!shown) { g.restore(); return; }
  let fs = 78; g.font = `800 ${fs}px Montserrat`; while (g.measureText(shown).width > CAP_W && fs > 40) { fs -= 3; g.font = `800 ${fs}px Montserrat`; }
  const nm = { hero: null, dev: 'DEV', priya: 'PRIYA', host: 'TV HOST', golf: 'COMMENTATOR', engineer: 'ENGINEER (RADIO)', driver: 'DELIVERY DRIVER', neighbour: 'NEIGHBOUR', london: 'SOMEONE IN THE DARK' }[c.speaker];
  strokeText(g, shown, CAP_X, H * 0.72, 12); if (nm) { g.font = '700 30px InterW'; g.globalAlpha = 0.85; strokeText(g, nm, CAP_X, H * 0.72 - fs - 8, 6); }
  g.restore();
}
function wrapLines(g, text, maxW) { const out = []; let cur = ''; for (const w of text.split(' ')) { const t = cur ? cur + ' ' + w : w; if (g.measureText(t).width > maxW && cur) { out.push(cur); cur = w; } else cur = t; } if (cur) out.push(cur); return out; }
function drawDiary(O, sh) { const s = stepAt(O); if (!s || sh.hideDiary) return; const g = ctx, x = SAFE_L; let y = 640; g.save(); g.textAlign = 'left'; g.font = 'italic 400 46px Lora';
  g.shadowColor = 'rgba(0,0,0,0.7)'; g.shadowBlur = 16; g.shadowOffsetY = 2; g.fillStyle = '#fff';
  for (const [txt, on] of [[s.setup, s.son], [s.punch, s.pon]]) { if (!txt || on == null || O < on - 0.02) continue; g.globalAlpha = eOut(clamp((O - on) / 0.22)); for (const ln of wrapLines(g, txt, W - SAFE_L - SAFE_R)) { g.fillText(ln, x, y); y += 56; } y += 10; }
  g.restore(); }
const GRAIN = [0, 1, 2, 3].map(i => { const c = mk(270, 480), g = c.getContext('2d'), d = g.createImageData(270, 480), r2 = rnd(i + 3); for (let k = 0; k < d.data.length; k += 4) { const v = 128 + (r2() - 0.5) * 120; d.data[k] = d.data[k + 1] = d.data[k + 2] = v; d.data[k + 3] = 255; } g.putImageData(d, 0, 0); return c; });
function drawGrain(O) { ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = 0.07; ctx.drawImage(GRAIN[Math.floor(O * 30) % 4], 0, 0, W, H); ctx.restore(); }
function drawFlare(fx, fy, a = 1) {   // Frutiger lens flare
  const g = ctx; const sx = fx * W, sy = fy * H; g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = a;
  const s = g.createRadialGradient(sx, sy, 0, sx, sy, 260); s.addColorStop(0, 'rgba(255,255,240,0.9)'); s.addColorStop(0.2, 'rgba(255,250,210,0.35)'); s.addColorStop(1, 'rgba(255,240,200,0)'); g.fillStyle = s; g.fillRect(sx - 260, sy - 260, 520, 520);
  const cx = W / 2, cy = H / 2; [[0.35, 40, 'rgba(140,240,255,0.18)'], [0.7, 70, 'rgba(160,255,190,0.12)'], [1.25, 26, 'rgba(255,255,255,0.2)'], [1.6, 110, 'rgba(120,200,255,0.1)']].forEach(([k, r, c]) => {
    const x = sx + (cx - sx) * k * 2, y = sy + (cy - sy) * k * 2; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, c); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); });
  g.restore();
}
function drawInfomercial(T) {   // 90s infomercial: VHS lines, chroma fringe, CALL NOW banner, price starburst
  const g = ctx; g.save(); g.globalCompositeOperation = 'screen'; g.globalAlpha = 0.18; g.drawImage(sceneC, 5, 0, W, H); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 0.12; g.fillStyle = '#000'; for (let y = (Math.floor(T * 30) % 2) * 2; y < H; y += 4) g.fillRect(0, y, W, 2);
  g.globalAlpha = 1; const by = 1470; g.fillStyle = '#d7262e'; g.fillRect(0, by, W, 74); g.fillStyle = '#ffd21f'; g.fillRect(0, by + 74, W, 8); g.font = '800 46px Montserrat'; g.textAlign = 'center'; g.fillStyle = (Math.floor(T * 3) % 2) ? '#fff' : '#ffd21f'; g.fillText('CALL NOW!  0800 NAH NAH', W / 2 - 25, by + 54);
  g.translate(W - SAFE_R - 120, 940); g.rotate(-0.2 + 0.03 * Math.sin(T * 6)); const sc2 = 1 + 0.05 * Math.sin(T * 9); g.scale(sc2, sc2); g.fillStyle = '#ffd21f'; g.beginPath(); for (let i = 0; i < 28; i++) { const a = i / 28 * Math.PI * 2, r = i % 2 ? 98 : 128; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fill();
  g.fillStyle = '#d7262e'; g.font = '800 30px Montserrat'; g.fillText('ONLY', 0, -22); g.font = '800 52px Montserrat'; g.fillText('£19.99', 0, 30); g.restore(); }
function drawGolf(T) {   // TV golf lower third
  const g = ctx; g.save(); const y = 1450; g.globalAlpha = 0.95; g.fillStyle = '#0e3b22'; g.fillRect(SAFE_L, y, 640, 64); g.fillStyle = '#f5f1e6'; g.fillRect(SAFE_L, y + 64, 640, 52); g.fillStyle = '#ffd21f'; g.fillRect(SAFE_L, y, 10, 116);
  g.textAlign = 'left'; g.fillStyle = '#ffd21f'; g.font = '800 34px Montserrat'; g.fillText('THE SOFA OPEN', SAFE_L + 30, y + 45); g.fillStyle = '#fff'; g.font = '700 26px InterW'; g.fillText('HOLE 16', SAFE_L + 420, y + 43);
  g.fillStyle = '#0e3b22'; g.font = '700 26px InterW'; g.fillText('PAR 3  ·  11 m TO THE DOOR  ·  0 STEPS', SAFE_L + 30, y + 100); g.restore(); }
const BP = {   // blueprint drawings: parts laid out left->right, top->bottom, joined by dashed arrows
  light: { title: 'LIGHT-OFF DEVICE MK1', parts: ['DOMINOES ×16', 'TOY CAR', 'RAMP', 'MOUSETRAP', 'STRING', 'LIGHT SWITCH'] },
  drone: { title: 'BRUSH-DRONE', parts: ['DRONE', 'TOOTHBRUSH', 'MOUTH (OPEN)', 'TIMER: 2 MIN', 'NO HANDS'] },
  london: { title: 'LONDON MK1', parts: ['HIS WINDOW', 'STRING ×4 KM', 'PULLEYS', 'ROOFTOPS', 'ZIPLINE', 'CHIPPY'] },
};
function drawBlueprint(sh, T) {
  const d = BP[sh.bp], k = clamp((T - sh.t0) / 0.5), rev = clamp((T - sh.t0 - 0.25) / 0.9), g = ctx; const uh = H * eOut(k);
  g.save(); g.beginPath(); g.rect(0, 0, W, uh); g.clip(); g.fillStyle = '#17478f'; g.fillRect(0, 0, W, H); g.strokeStyle = 'rgba(255,255,255,0.08)'; g.lineWidth = 2; const gx = (T * 9) % 54, gy = (T * 14) % 54; for (let x = -54 + gx; x < W; x += 54) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); } for (let y = -54 + gy; y < H; y += 54) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }   // the grid drifts so no two frames match
  g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = 4; g.strokeRect(SAFE_L - 30, 760, W - SAFE_L - SAFE_R + 60, 740);
  g.fillStyle = '#fff'; g.textAlign = 'center'; g.font = '800 64px Montserrat'; g.fillText(d.title, CAP_X, 860); g.font = '700 24px InterW'; g.globalAlpha = 0.8; g.fillText('DRAWN BY: HIM  ·  FROM: THE SOFA  ·  SCALE: OVERKILL', CAP_X, 905); g.globalAlpha = 1;
  const n = d.parts.length; const pos = d.parts.map((p, i) => [SAFE_L + 120 + (i % 3) * ((CAP_W - 160) / 2), 1040 + Math.floor(i / 3) * 280]); const shown = rev * n;
  g.setLineDash([14, 10]); g.lineWidth = 4; for (let i = 0; i < n - 1; i++) { const f = clamp(shown - i - 0.6); if (f <= 0) continue; const [x0, y0] = pos[i], [x1, y1] = pos[i + 1]; g.beginPath(); g.moveTo(x0, y0); g.lineTo(lerp(x0, x1, f), lerp(y0, y1, f)); g.stroke(); }
  g.setLineDash([]); d.parts.forEach((p, i) => { const f = clamp(shown - i); if (f <= 0) return; const [x, y] = pos[i]; g.globalAlpha = f; g.strokeStyle = '#fff'; g.lineWidth = 4; g.beginPath(); g.arc(x, y, 62, 0, Math.PI * 2 * f); g.stroke(); g.font = '800 30px InterW'; g.fillStyle = '#fff'; g.fillText(String(i + 1), x, y + 11); g.font = '700 24px InterW'; g.fillText(p, x, y + 104); });
  { const u = (T - sh.t0) * 0.9 % n, i0 = Math.floor(u), f = u - i0, [x0, y0] = pos[i0], [x1, y1] = pos[Math.min(n - 1, i0 + 1)]; g.globalAlpha = 1; g.fillStyle = '#ffd21f'; g.beginPath(); g.arc(lerp(x0, x1, f) + 50, lerp(y0, y1, f) - 50, 10, 0, 7); g.fill(); }   // the pen keeps moving over the drawing
  g.globalAlpha = 1; g.restore(); if (k < 1) { g.save(); const gr = g.createLinearGradient(0, uh - 40, 0, uh + 30); gr.addColorStop(0, 'rgba(10,40,90,0)'); gr.addColorStop(0.5, '#cfe0ff'); gr.addColorStop(1, 'rgba(10,40,90,0)'); g.fillStyle = gr; g.fillRect(0, uh - 40, W, 70); g.restore(); } }
// ---------------------------------------------------------------- grading / compositing
const GRADES = {
  flat: { f: 'saturate(1.12) contrast(1.06) brightness(1.03)', tint: 'rgba(255,190,120,0.10)', mode: 'soft-light', vig: 0.35 },
  dark: { f: 'saturate(0.9) contrast(1.15) brightness(1.0)', tint: 'rgba(60,80,160,0.22)', mode: 'soft-light', vig: 0.6 },
  lamp: { f: 'saturate(1.05) contrast(1.18) brightness(1.0)', tint: 'rgba(255,150,60,0.16)', mode: 'soft-light', vig: 0.62 },
  tv: { f: 'saturate(1.45) contrast(1.12) brightness(1.08)', tint: 'rgba(255,80,200,0.08)', mode: 'soft-light', vig: 0.2 },
  golf: { f: 'saturate(1.18) contrast(1.04) brightness(1.04)', tint: 'rgba(120,255,140,0.07)', mode: 'soft-light', vig: 0.3 },
  factory: { f: 'saturate(1.1) contrast(1.12) brightness(1.02)', tint: 'rgba(80,200,255,0.10)', mode: 'soft-light', vig: 0.45 },
  city: { f: 'saturate(1.15) contrast(1.06) brightness(1.04)', tint: 'rgba(255,140,120,0.08)', mode: 'soft-light', vig: 0.35 },
  storm: { f: 'saturate(0.8) contrast(1.15) brightness(1.0)', tint: 'rgba(60,90,170,0.25)', mode: 'soft-light', vig: 0.55 },
};
function setCam(sh, T, O) {
  const c = window.CAMOVR ? { ...sh.cam, ...window.CAMOVR, p1: null, l1: null, pf: null, lf: null } : sh.cam; const lt = clamp((T - sh.t0) / (sh.t1 - sh.t0)); const e = EASE[c.ease || 'out'](lt);
  const p = c.pf ? c.pf(O).clone() : V(c.p0); if (c.p1) p.lerp(V(c.p1), e); const l = c.lf ? c.lf(O).clone() : V(c.l0); if (c.l1) l.lerp(V(c.l1), e);
  cam.setViewOffset(W, H, 0, -H * (c.shift ?? 0.07), W, H); cam.position.copy(p); cam.up.set(0, 1, 0); cam.lookAt(l);
  const z = lerp(c.z0 ?? 1, c.z1 ?? 1.06, e); const roll = lerp(c.roll0 ?? 0, c.roll1 ?? 0, e);
  cam.fov = 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(c.fov) / 2) / z) * 180 / Math.PI; cam.rotateZ(THREE.MathUtils.degToRad(roll));
  const live = sh.live ?? 1;   // gentle camera life on the real clock
  cam.rotateY((Math.sin(O * 0.9) * 0.018 + Math.sin(O * 2.3) * 0.003) * live); cam.rotateX((Math.sin(O * 0.7 + 1.3) * 0.012 + Math.sin(O * 3.1) * 0.0025) * live); cam.rotateZ(Math.sin(O * 0.55) * 0.01 * live);
  let sk = 0; for (const [t0, amt] of sh.shakeAt || []) sk += shake(O, t0, amt); cam.rotateZ(Math.sin(O * 61) * sk); cam.rotateX(Math.sin(O * 47) * sk * 0.6); cam.rotateY(Math.cos(O * 53) * sk * 0.6);
  cam.fov /= 1 + 0.03 * live * (0.5 + 0.5 * Math.sin(O * 1.1)); cam.updateProjectionMatrix();
  return lt;
}
const HEROES = [S.flat.hero];
export function renderFrame(Oreal) {
  let O = Oreal; const sh = shots.find(s => O >= s.t0 && O < s.t1) || shots[shots.length - 1]; if (sh.fps) O = Math.max(sh.t0, Math.floor(O * sh.fps) / sh.fps);
  const lt = clamp((O - sh.t0) / (sh.t1 - sh.t0));
  const nb = typeof sh.mblur === 'function' ? sh.mblur(O) : (sh.mblur || 1);
  for (let k = nb - 1; k >= 0; k--) {       // motion blur: average sub-frames across the shutter on fast shots
    const Ok = Math.max(sh.t0, O - (k / nb) * 0.6 / 30); const ltk = clamp((Ok - sh.t0) / (sh.t1 - sh.t0));
    sh.setup(ltk, Ok, Ok); setCam(sh, Ok, Ok);
    HEROES.forEach(P => P.strings.forEach((s, i) => s.rotation.set(0.2 * Math.sin(Ok * 9 + i), 0, 0.12 * Math.sin(Ok * 7 + i))));
    { const sc = DIALOGUE.find(c => c.kind === 'shout' && c.speaker === 'hero' && spanHit(c, Ok)); if (sc) { const kk = clamp((Ok - sc.spans[0][0]) / 0.12) * clamp((sc.spans[0][1] + 0.03 - Ok) / 0.1); HEROES.forEach(P => { [P.mLine, P.mGrin, P.teeth, P.cL, P.cR].forEach(m => m.visible = false); P.mO.visible = true; P.mO.scale.set(1.25, 0.5 + 1.1 * kk + 0.12 * Math.sin(Ok * 30), 1); P.brows.forEach(b => { b.position.y = 0.49 + 0.07 * kk; }); P.neck.rotation.x -= 0.16 * kk; }); } }
    renderer.render(S[sh.scene].sc, cam);
    if (nb > 1) { actx.globalAlpha = 1 / (nb - k); actx.drawImage(glc, 0, 0, W, H); actx.globalAlpha = 1; }
  }
  const SRC = nb > 1 ? accC : glc;
  const gr = GRADES[sh.grade] || GRADES.flat;
  sctx.globalCompositeOperation = 'source-over'; sctx.filter = 'none';
  const dofv = typeof sh.dof === 'function' ? sh.dof(O) : sh.dof;
  if (dofv) {
    smctx.filter = 'blur(2.5px)'; smctx.drawImage(SRC, 0, 0, 270, 480); smctx.filter = 'none'; sctx.drawImage(smallC, 0, 0, W, H);
    shctx.globalCompositeOperation = 'source-over'; shctx.clearRect(0, 0, W, H); shctx.drawImage(SRC, 0, 0, W, H); shctx.globalCompositeOperation = 'destination-in';
    const rg = shctx.createRadialGradient(W / 2, H * 0.47, W * 0.2 * (1 - dofv * 0.3), W / 2, H * 0.47, W * 0.85 * (1 - dofv * 0.3)); rg.addColorStop(0, 'rgba(0,0,0,1)'); rg.addColorStop(1, 'rgba(0,0,0,0)'); shctx.fillStyle = rg; shctx.fillRect(0, 0, W, H);
    sctx.drawImage(sharpC, 0, 0, W, H);
  } else sctx.drawImage(SRC, 0, 0, W, H);
  const bloom = sh.bloom ?? 0.1;    // a touch of glow everywhere (Frutiger sheen)
  smctx.filter = 'blur(6px) brightness(1.25)'; smctx.drawImage(sceneC, 0, 0, 270, 480); smctx.filter = 'none';
  sctx.globalCompositeOperation = 'lighter'; sctx.globalAlpha = bloom; sctx.drawImage(smallC, 0, 0, W, H); sctx.globalAlpha = 1; sctx.globalCompositeOperation = 'source-over';
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.filter = gr.f; ctx.drawImage(sceneC, 0, 0, W, H); ctx.filter = 'none';
  if (gr.tint) { ctx.globalCompositeOperation = gr.mode; ctx.fillStyle = gr.tint; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over'; }
  const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, `rgba(0,0,0,${gr.vig})`); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  if (sh.tv) drawInfomercial(Oreal); if (sh.golf) drawGolf(Oreal); if (sh.bp) drawBlueprint(sh, Oreal); if (sh.letterbox) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, 300); ctx.fillRect(0, H - 300, W, 300); }
  if (sh.flare) drawFlare(sh.flare[0], sh.flare[1], 0.9);
  if (sh.dark) { const d = sh.dark(O); if (d > 0) { ctx.fillStyle = `rgba(4,6,18,${d})`; ctx.fillRect(0, 0, W, H); } }
    if (!sh.hideStat && !sh.bp && O >= STEPS[0].t) { ctx.save(); ctx.translate(W * 0.2, 400); ctx.scale(1, 0.62); const sg = ctx.createRadialGradient(0, 0, 0, 0, 0, W * 0.62); sg.addColorStop(0, 'rgba(0,0,0,0.34)'); sg.addColorStop(0.55, 'rgba(0,0,0,0.16)'); sg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = sg; ctx.fillRect(-W, -W, W * 3, W * 2); ctx.restore(); }
  drawGrain(Oreal); drawTitle(O); drawWatch(Oreal, sh); drawDiary(Oreal, sh); drawCaptions(Oreal);
  for (const s of shots) if (s.flash !== undefined) { const d = Math.round((Oreal - s.flash) * 30); if (d >= 0 && d < 3) { ctx.fillStyle = `rgba(255,255,255,${(s.fa || [0.95, 0.6, 0.25])[d]})`; ctx.fillRect(0, 0, W, H); } }
  if (sh.dark && sh.dark(Oreal) >= 1) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 0.16; ctx.drawImage(GRAIN[Math.floor(Oreal * 30) % 4], 0, 0, W, H); ctx.globalAlpha = 1; }   // clean black ending, with faint noise so no two frames are identical
  return out.toDataURL('image/jpeg', RS > 1 ? 0.95 : 0.94);
}
export const TIMELINE = { STEPS, DUR, cuts: shots.map(s => s.t0), flashes: shots.filter(s => s.flash !== undefined).map(s => s.flash) };
window.captionText = (O) => { const c = cueAt(O); if (!c) return ''; return c.kind === 'shout' ? c.words.map(w => w.w).join(' ') : captionChunk(c, O); };
window.hookText = () => '';
window.S = S; window.cam = cam; window.shots = shots; window.renderFrame = renderFrame; window.TIMELINE = TIMELINE;
fetch('dialogue.json').then(r => r.json()).then(d => { DIALOGUE = d; }).catch(() => { DIALOGUE = []; })
  .then(() => Promise.all(['800 78px Montserrat', '500 96px Playfair', 'italic 500 236px Playfair', '500 128px Lora', '600 30px InterW', '700 30px InterW', 'italic 400 46px Lora', 'italic 500 190px Playfair'].map(f => document.fonts.load(f)))).then(() => { window.READY = true; });