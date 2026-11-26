const SAFE_L = 90, SAFE_R = 140, CAP_W = W - SAFE_L - SAFE_R, CAP_X = SAFE_L + CAP_W / 2;   // safe area: full-screen players crop the edges, Instagram's buttons cover the right side
function stepAt(T) { let s = null; for (const st of STEPS) if (T >= st.t) s = st; return s; }
function spaced(g, text, x, y, sp) { let cx = x; for (const ch of text) { g.fillText(ch, cx, y); cx += g.measureText(ch).width + sp; } return cx - x; }
const measC = mk(10, 10).getContext('2d');
// the slot-machine widget (top-left): LUCK, three reels that spin and land on every new day, the odds he beats today, DAY n
const SYMS = { 1: ['lemon', 'lemon', 'skull'], 2: ['cherry', 'cherry', 'lemon'], 3: ['cherry', 'cherry', 'cherry'], 5: ['bell', 'bell', 'cherry'], 7: ['bell', 'bell', 'bell'], 9: ['clover', 'clover', 'bell'], 13: ['clover', 'clover', 'clover'], 20: ['seven', 'seven', 'clover'], 23: ['seven', 'seven', 'seven'], 26: ['seven', 'seven', 'seven'], END: ['seven', 'seven', 'seven'] };
const SYMLIST = ['lemon', 'cherry', 'bell', 'clover', 'seven', 'skull'];
function drawSym(g, k, cx, cy, s) { g.save(); g.translate(cx, cy); g.scale(s, s); g.lineWidth = 3;
  if (k === 'lemon') { g.fillStyle = '#ffe23a'; g.beginPath(); g.ellipse(0, 0, 30, 22, 0.3, 0, 7); g.fill(); g.fillStyle = '#e8c21a'; g.beginPath(); g.arc(26, -12, 6, 0, 7); g.fill(); }
  else if (k === 'cherry') { g.strokeStyle = '#2bb673'; g.lineWidth = 4; g.beginPath(); g.moveTo(-12, 4); g.quadraticCurveTo(-4, -26, 8, -28); g.moveTo(14, 8); g.quadraticCurveTo(10, -18, 8, -28); g.stroke(); g.fillStyle = '#e8243c'; g.beginPath(); g.arc(-12, 12, 14, 0, 7); g.fill(); g.beginPath(); g.arc(14, 14, 14, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,0.6)'; g.beginPath(); g.arc(-16, 7, 4, 0, 7); g.fill(); }
  else if (k === 'bell') { g.fillStyle = '#ffc21a'; g.beginPath(); g.moveTo(-26, 18); g.quadraticCurveTo(-22, -30, 0, -30); g.quadraticCurveTo(22, -30, 26, 18); g.closePath(); g.fill(); g.fillStyle = '#c88a10'; g.fillRect(-28, 16, 56, 7); g.beginPath(); g.arc(0, 28, 7, 0, 7); g.fill(); }
  else if (k === 'clover') { g.fillStyle = '#2bd96b'; [[0, -13], [13, 0], [0, 13], [-13, 0]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 13, 0, 7); g.fill(); }); g.strokeStyle = '#1a8a42'; g.lineWidth = 5; g.beginPath(); g.moveTo(0, 0); g.lineTo(10, 30); g.stroke(); }
  else if (k === 'seven') { g.fillStyle = '#e8243c'; g.font = '800 64px Montserrat'; g.textAlign = 'center'; g.strokeStyle = '#fff1a0'; g.lineWidth = 6; g.strokeText('7', 0, 22); g.fillText('7', 0, 22); }
  else if (k === 'skull') { g.fillStyle = '#e8e8e8'; g.beginPath(); g.arc(0, -4, 24, 0, 7); g.fill(); g.fillRect(-14, 12, 28, 14); g.fillStyle = '#1a1a1a'; g.beginPath(); g.arc(-9, -4, 7, 0, 7); g.fill(); g.beginPath(); g.arc(9, -4, 7, 0, 7); g.fill(); g.fillRect(-2, 6, 4, 6); }
  g.restore(); }
function drawSlot(T, sh) { const s = stepAt(T); if (!s || sh.hideStat) return; const g = ctx, dt = T - s.t; const x = SAFE_L, y = 250, w = 450, h = 286;
  g.save(); g.shadowColor = 'rgba(0,0,0,0.55)'; g.shadowBlur = 26; g.shadowOffsetY = 8; const bg = g.createLinearGradient(0, y, 0, y + h); bg.addColorStop(0, '#2a1240'); bg.addColorStop(1, '#14081f'); g.fillStyle = bg; rr(g, x, y, w, h, 28); g.fill(); g.shadowBlur = 0; g.shadowOffsetY = 0;
  const rim = g.createLinearGradient(x, y, x + w, y + h); rim.addColorStop(0, '#ffe08a'); rim.addColorStop(0.5, '#c9902a'); rim.addColorStop(1, '#ffe08a'); g.strokeStyle = rim; g.lineWidth = 5; rr(g, x + 3, y + 3, w - 6, h - 6, 26); g.stroke();
  for (let i = 0; i < 9; i++) { const on = (Math.floor(T * 6) + i) % 2; g.fillStyle = on ? '#ffd23a' : '#7a5a1a'; g.beginPath(); g.arc(x + 30 + i * 49, y + 14, 4, 0, 7); g.fill(); }
  g.textAlign = 'left'; g.fillStyle = '#ffd23a'; g.font = '700 24px InterW'; spaced(g, 'LUCK', x + 26, y + 50, 6); g.fillStyle = '#d7262e'; rr(g, x + w - 168, y + 26, 144, 34, 17); g.fill(); g.fillStyle = '#fff'; g.font = '700 18px InterW'; spaced(g, '×2 DAILY', x + w - 150, y + 49, 2);
  const sy = SYMS[s.day] || SYMS.END; const rx = x + 22, ry = y + 66, rw = 96, rh = 92;
  for (let i = 0; i < 3; i++) { const bx = rx + i * (rw + 8); g.fillStyle = '#fbf6ea'; rr(g, bx, ry, rw, rh, 10); g.fill(); g.save(); rr(g, bx, ry, rw, rh, 10); g.clip();
    const stop = 0.3 + i * 0.16; if (dt < stop) { const off = ((T * 9 + i * 0.37) % 1) * rh; for (let k = -1; k < 2; k++) { g.globalAlpha = 0.55; drawSym(g, SYMLIST[(Math.floor(T * 9) + k + i * 2 + 6) % 6], bx + rw / 2, ry + rh / 2 + k * rh + off, 0.9); } g.globalAlpha = 1; }
    else { const b = clamp((dt - stop) / 0.18); drawSym(g, sy[i], bx + rw / 2, ry + rh / 2 + (1 - elastic(b)) * -18, 1.0 + (s.day === 'END' || s.day === 26 ? 0.06 * Math.sin(T * 8 + i) : 0)); }
    g.restore(); g.strokeStyle = '#c9902a'; g.lineWidth = 3; rr(g, bx, ry, rw, rh, 10); g.stroke(); }
  g.fillStyle = '#b9a8d8'; g.font = '700 18px InterW'; g.textAlign = 'center'; const dx = x + w - 52; g.fillText('DAY', dx, ry + 30); g.fillStyle = '#fff'; g.font = '800 44px Montserrat'; g.fillText(String(s.day === 'END' ? 27 : s.day), dx, ry + 78);
  g.textAlign = 'left'; const prev = STEPS[STEPS.indexOf(s) - 1]; const slide = prev ? eOut(clamp((dt - 0.15) / 0.35)) : 1; g.save(); g.beginPath(); g.rect(x + 16, ry + rh + 8, w - 32, 66); g.clip();
  const fit = (v) => { let f = 54; g.font = `800 ${f}px Montserrat`; while (g.measureText(v).width > w - 48 && f > 26) { f -= 2; g.font = `800 ${f}px Montserrat`; } };
  g.fillStyle = '#fff'; if (prev && slide < 1) { g.globalAlpha = 1 - slide; fit(prev.v); g.fillText(prev.v, x + 24, ry + rh + 58 - slide * 60); } g.globalAlpha = slide; fit(s.v); g.fillText(s.v, x + 24, ry + rh + 58 + (1 - slide) * 60); g.restore();
  g.fillStyle = '#ffd23a'; g.font = '700 21px InterW'; spaced(g, s.cmp, x + 24, y + h - 20, 1.5); g.restore(); }
function drawTitle(O) {
  if (O < TITLE.t0 || O >= TITLE.t1) return;
  const a = eOut(clamp((O - TITLE.t0) / 0.45)) * clamp((TITLE.t1 - O) / 0.3), rise = (1 - eOut(clamp((O - TITLE.t0) / 0.7))) * 40;
  const g = ctx; g.save(); g.globalAlpha = a; g.textAlign = 'center';
  const wash = g.createLinearGradient(0, 120, 0, 900); wash.addColorStop(0, 'rgba(40,16,6,0.55)'); wash.addColorStop(1, 'rgba(40,16,6,0)'); g.fillStyle = wash; g.fillRect(0, 0, W, 900);
  g.translate(0, rise); g.shadowColor = 'rgba(0,0,0,0.45)'; g.shadowBlur = 30; g.shadowOffsetY = 4; g.fillStyle = '#fff';
  g.font = '500 96px Playfair'; g.fillText('What if your', W / 2, 380);
  g.font = 'italic 500 236px Playfair'; g.fillStyle = '#ffe2a0'; g.fillText('luck', W / 2, 610);
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
  const nm = { hero: null, marcus: 'MARCUS', baker: 'BAKER', kid: 'KID', driver: 'DRIVER', racegoer: 'RACEGOER', commentator: 'COMMENTATOR (TV)', 'pit boss': 'PIT BOSS', 'tv host': 'LOTTERY HOST (TV)' }[c.speaker];
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
function drawRacing(sh, T) {   // TV racing graphics: LIVE bug, race name, the running order (it flips when the field piles up)
  const g = ctx; g.save(); g.textAlign = 'left'; g.fillStyle = '#d7262e'; rr(g, W - SAFE_R - 150, 262, 150, 50, 8); g.fill(); g.fillStyle = '#fff'; g.font = '800 30px Montserrat'; g.fillText('● LIVE', W - SAFE_R - 136, 298);
  const y = 1420; g.fillStyle = 'rgba(10,40,24,0.92)'; g.fillRect(SAFE_L, y, W - SAFE_L - SAFE_R, 62); g.fillStyle = '#f5f1e6'; g.fillRect(SAFE_L, y + 62, W - SAFE_L - SAFE_R, 56); g.fillStyle = '#ffd23a'; g.fillRect(SAFE_L, y, 10, 118);
  g.fillStyle = '#ffd23a'; g.font = '800 32px Montserrat'; g.fillText('DOWNS PARK  ·  2:15', SAFE_L + 28, y + 43);
  const piled = T > PILE + 0.2; g.fillStyle = '#0e3b22'; g.font = '700 27px InterW';
  const txt = sh.race === 2 ? 'WINNER: 9 NO CHANCE  ·  500-1' : piled ? '1 NO CHANCE  ·  2 … nobody else' : '1 THUNDERBOLT  2 SILVER DART  …  9 NO CHANCE'; g.fillText(txt, SAFE_L + 28, y + 101); g.restore(); }
function drawVHS(T) {   // 1990s broadcast tape: scanlines, colour fringe, a tracking band rolling down, PLAY
  const g = ctx; g.save(); g.globalCompositeOperation = 'screen'; g.globalAlpha = 0.22; g.drawImage(sceneC, 6, 0, W, H); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 0.16; g.fillStyle = '#000'; for (let y = (Math.floor(T * 30) % 2) * 2; y < H; y += 4) g.fillRect(0, y, W, 2);
  const by = ((T * 0.45) % 1) * (H + 200) - 100; g.globalAlpha = 0.22; g.drawImage(GRAIN[Math.floor(T * 30) % 4], 0, by, W, 70); g.globalAlpha = 1;
  g.fillStyle = '#fff'; g.font = '800 42px Montserrat'; g.textAlign = 'right'; g.shadowColor = '#000'; g.shadowBlur = 6; g.fillText('PLAY ▶', W - SAFE_R - 10, 300); g.textAlign = 'left'; g.font = '700 34px Montserrat'; g.fillText('SAT 8:00 PM', SAFE_L, 1470); g.restore(); }
// ---------------------------------------------------------------- grading / compositing
const GRADES = {
  bakery: { f: 'saturate(1.1) contrast(1.08) brightness(1.03)', tint: 'rgba(255,170,90,0.12)', mode: 'soft-light', vig: 0.42 },
  coin: { f: 'saturate(1.15) contrast(1.12) brightness(1.05)', tint: 'rgba(255,170,70,0.14)', mode: 'soft-light', vig: 0.55 },
  bridge: { f: 'saturate(0.95) contrast(1.06) brightness(1.04)', tint: 'rgba(120,150,200,0.12)', mode: 'soft-light', vig: 0.32 },
  street: { f: 'saturate(1.1) contrast(1.06) brightness(1.04)', tint: 'rgba(255,200,150,0.08)', mode: 'soft-light', vig: 0.3 },
  arcade: { f: 'saturate(1.3) contrast(1.12) brightness(1.06)', tint: 'rgba(200,60,255,0.12)', mode: 'soft-light', vig: 0.5 },
  sunny: { f: 'saturate(1.18) contrast(1.05) brightness(1.05)', tint: 'rgba(255,220,150,0.1)', mode: 'soft-light', vig: 0.28 },
  races: { f: 'saturate(1.22) contrast(1.06) brightness(1.05)', tint: 'rgba(160,255,140,0.06)', mode: 'soft-light', vig: 0.25 },
  night: { f: 'saturate(0.9) contrast(1.12) brightness(1.02)', tint: 'rgba(80,170,200,0.18)', mode: 'soft-light', vig: 0.6 },
  casino: { f: 'saturate(1.15) contrast(1.12) brightness(1.04)', tint: 'rgba(255,150,60,0.14)', mode: 'soft-light', vig: 0.55 },
  pub: { f: 'saturate(1.1) contrast(1.1) brightness(1.05)', tint: 'rgba(255,160,80,0.13)', mode: 'soft-light', vig: 0.5 },
  vhs: { f: 'saturate(1.4) contrast(1.15) brightness(1.08)', tint: 'rgba(255,60,200,0.08)', mode: 'soft-light', vig: 0.6 },
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
const HEROES = [S.bakery.hero, S.bridge.hero, S.junction.hero, S.arcade.hero, S.drive.hero, S.races.hero, S.laundrette.hero, S.casino.hero, S.pub.hero];
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
  const gr = GRADES[sh.grade] || GRADES.bakery;
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
  if (sh.race) drawRacing(sh, Oreal); if (sh.vhs) drawVHS(Oreal); if (sh.letterbox) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, 300); ctx.fillRect(0, H - 300, W, 300); }
  if (sh.flare) drawFlare(sh.flare[0], sh.flare[1], 0.9);
  if (sh.dark) { const d = sh.dark(O); if (d > 0) { ctx.fillStyle = `rgba(4,6,18,${d})`; ctx.fillRect(0, 0, W, H); } }
    if (!sh.hideStat && O >= STEPS[0].t) { ctx.save(); ctx.translate(W * 0.2, 400); ctx.scale(1, 0.62); const sg = ctx.createRadialGradient(0, 0, 0, 0, 0, W * 0.62); sg.addColorStop(0, 'rgba(0,0,0,0.34)'); sg.addColorStop(0.55, 'rgba(0,0,0,0.16)'); sg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = sg; ctx.fillRect(-W, -W, W * 3, W * 2); ctx.restore(); }
  drawGrain(Oreal); drawTitle(O); drawSlot(Oreal, sh); drawDiary(Oreal, sh); drawCaptions(Oreal);
  for (const s of shots) if (s.flash !== undefined) { const d = Math.round((Oreal - s.flash) * 30); if (d >= 0 && d < 3) { ctx.fillStyle = `rgba(255,255,255,${(s.fa || [0.95, 0.6, 0.25])[d]})`; ctx.fillRect(0, 0, W, H); } }
  if (sh.dark && sh.dark(Oreal) >= 1) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 0.16; ctx.drawImage(GRAIN[Math.floor(Oreal * 30) % 4], 0, 0, W, H); ctx.globalAlpha = 1; }   // clean black ending, with faint noise so no two frames are identical
  return out.toDataURL('image/jpeg', RS > 1 ? 0.95 : 0.94);
}
export const TIMELINE = { STEPS, DUR, cuts: shots.map(s => s.t0), flashes: shots.filter(s => s.flash !== undefined).map(s => s.flash) };
window.captionText = (O) => { const c = cueAt(O); if (!c) return ''; return c.kind === 'shout' ? c.words.map(w => w.w).join(' ') : captionChunk(c, O); };
window.hookText = () => '';
// ---------------------------------------------------------------- solidity check (owner rule: nothing passes through a body, car or prop)
// window.collide(O) poses the shot at time O (no render) and returns every pair of solid bodies whose oriented boxes overlap.
const SOLIDS = () => { const L = (sc, list) => list.filter(([, o]) => o).map(([n, o]) => [n, o]);
  return { bakery: L(S.bakery, [['hero', S.bakery.hero.root], ['marcus', S.bakery.marcus.root], ['baker', S.bakery.baker.root], ['extra0', S.bakery.extras[0].root], ['extra1', S.bakery.extras[1].root], ['toast', S.bakery.toast], ['toast2', S.bakery.toast2], ['plate', S.bakery.plate], ['coinspin', S.bakery.spin]]),
    hand: L(S.hand, Object.entries(S.hand.solids || {})),
    bridge: L(S.bridge, [['hero', S.bridge.hero.root], ...S.bridge.walkers.map((P, i) => ['walker' + i, P.root])]),
    junction: L(S.junction, [['hero', S.junction.hero.root], ['driver', S.junction.driver.root], ...S.junction.peds.map((P, i) => ['ped' + i, P.root]), ...S.junction.cars.map((c, i) => ['car' + i, c]), ...S.junction.signals.flat().map((s, i) => ['signal' + i, s])]),
    arcade: L(S.arcade, [['hero', S.arcade.hero.root], ['kid', S.arcade.kid.root], ['mum', S.arcade.mum.root], ['machine', S.arcade.cm], ...S.arcade.bears.map((b, i) => ['bear' + i, b])]),
    drive: L(S.drive, [['hero', S.drive.hero.root], ['marcus', S.drive.marcus.root], ['car', S.drive.car], ['bus', S.drive.bus], ['fish', S.drive.fish]]),
    races: L(S.races, [['hero', S.races.hero.root], ['marcus', S.races.marcus.root], ['fan', S.races.fan.root], ...S.races.copiers.map((P, i) => ['copier' + i, P.root]), ...S.races.horses.map((h, i) => ['horse' + i, h]), ['pony', S.races.pony], ['post', S.races.post]]),
    laundrette: L(S.laundrette, [['hero', S.laundrette.hero.root]]),
    casino: L(S.casino, [['hero', S.casino.hero.root], ['dealer', S.casino.dealer.root], ['boss', S.casino.boss.root], ...S.casino.near.map((P, i) => ['near' + i, P.root]), ...S.casino.stacks.map((t, i) => ['chips' + i, t])]),
    pub: L(S.pub, [['hero', S.pub.hero.root], ['barman', S.pub.barman.root], ...S.pub.near.map((P, i) => ['near' + i, P.root])]),
    ticket: [], plaza: [] }; };
const CROWDS = () => ({ drive: S.drive.crowd, races: S.races.crowd, casino: S.casino.crowd, pub: S.pub.crowd, plaza: S.plaza.crowd });
const shownDeep = (o) => { for (let p = o; p; p = p.parent) if (!p.visible) return false; return true; };
function obbsOf(obj) { const out = []; obj.traverse(m => { if (!m.isMesh || m.isInstancedMesh || !shownDeep(m)) return; const mt = Array.isArray(m.material) ? m.material[0] : m.material; if (mt && mt.transparent && mt.opacity < 0.5) return;
  if (!m.geometry.boundingBox) m.geometry.computeBoundingBox(); const bb = m.geometry.boundingBox; const ob = new OBB().fromBox3(bb); ob.applyMatrix4(m.matrixWorld); ob.halfSize.multiplyScalar(0.82); if (Math.max(ob.halfSize.x, ob.halfSize.y, ob.halfSize.z) < 0.025) return; out.push(ob); }); return out; }
function crowdObbs(cr) { if (!cr) return []; return cr.D.map((d, i) => { if (d.vis === false) return null; const ob = new OBB(V([d.p[0], d.p[1] + 1.15 * d.s, d.p[2]]), V([0.26 * d.s, 1.0 * d.s, 0.17 * d.s]), new THREE.Matrix3().setFromMatrix4(new THREE.Matrix4().makeRotationY(d.ry))); return ['crowd' + i, [ob]]; }).filter(Boolean); }
window.collide = (O) => { const sh = shots.find(s => O >= s.t0 && O < s.t1) || shots[shots.length - 1]; sh.setup(clamp((O - sh.t0) / (sh.t1 - sh.t0)), O, O); const sc = S[sh.scene].sc; sc.updateMatrixWorld(true);
  const ents = (SOLIDS()[sh.scene] || []).filter(([, o]) => shownDeep(o)).map(([n, o]) => [n, obbsOf(o)]).filter(([, b]) => b.length).concat((CROWDS()[sh.scene] && CROWDS()[sh.scene].D.some(d => d.vis !== false)) ? crowdObbs(CROWDS()[sh.scene]) : []);
  const hits = []; for (let i = 0; i < ents.length; i++) for (let j = i + 1; j < ents.length; j++) { if (ents[i][0].startsWith('crowd') && ents[j][0].startsWith('crowd')) continue; let hit = false;
    for (const a of ents[i][1]) { for (const b of ents[j][1]) if (a.center.distanceTo(b.center) < a.halfSize.length() + b.halfSize.length() && a.intersectsOBB(b)) { hit = true; break; } if (hit) break; }
    if (hit) hits.push(ents[i][0] + '×' + ents[j][0]); }
  return { scene: sh.scene, hits }; };
window.THREE = THREE; window.S = S; window.cam = cam; window.shots = shots; window.renderFrame = renderFrame; window.TIMELINE = TIMELINE;
fetch('dialogue.json').then(r => r.json()).then(d => { DIALOGUE = d; }).catch(() => { DIALOGUE = []; })
  .then(() => Promise.all(['800 78px Montserrat', '500 96px Playfair', 'italic 500 236px Playfair', '500 128px Lora', '600 30px InterW', '700 30px InterW', 'italic 400 46px Lora', 'italic 500 190px Playfair'].map(f => document.fonts.load(f)))).then(() => { window.READY = true; });