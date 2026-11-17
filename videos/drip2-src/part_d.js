const SAFE_L = 90, SAFE_R = 140, CAP_W = W - SAFE_L - SAFE_R, CAP_X = SAFE_L + CAP_W / 2;   // safe area: full-screen players crop the edges, Instagram's buttons cover the right side
function stepAt(T) { let s = null; for (const st of STEPS) if (T >= st.t) s = st; return s; }
function spaced(g, text, x, y, sp) { let cx = x; for (const ch of text) { g.fillText(ch, cx, y); cx += g.measureText(ch).width + sp; } return cx - x; }
const measC = mk(10, 10).getContext('2d');
function drawTag(T, sh) {   // the price tag: a paper tag on a string, each day's old price scribbled out and the new one written under it
  const s = stepAt(T); if (!s || sh.hideStat) return; const idx = STEPS.indexOf(s); const g = ctx; const dt = T - s.t;
  const ang = 0.05 * Math.sin(T * 2.1) + 0.3 * Math.exp(-dt * 3) * Math.sin(dt * 11); const hx = SAFE_L + 150, hy = 238, w = 330, prev = STEPS.slice(Math.max(0, idx - 2), idx).map(p => p.v);
  g.save(); g.strokeStyle = 'rgba(245,240,230,0.9)'; g.lineWidth = 3; g.beginPath(); g.moveTo(hx - 30, 150); g.lineTo(hx + Math.sin(ang) * 4, hy); g.stroke();
  g.translate(hx, hy); g.rotate(ang); g.shadowColor = 'rgba(0,0,0,0.45)'; g.shadowBlur = 18; g.shadowOffsetY = 6;
  const hgt = 120 + prev.length * 54 + 112; g.fillStyle = '#f3ead6'; g.beginPath(); g.moveTo(-w / 2 + 34, 0); g.lineTo(w / 2 - 34, 0); g.lineTo(w / 2, 34); g.lineTo(w / 2, hgt); g.lineTo(-w / 2, hgt); g.lineTo(-w / 2, 34); g.closePath(); g.fill();
  g.shadowBlur = 0; g.shadowOffsetY = 0; g.fillStyle = '#c9bfa8'; g.beginPath(); g.arc(0, 22, 9, 0, 7); g.fill(); g.fillStyle = '#5a5040'; g.beginPath(); g.arc(0, 22, 5, 0, 7); g.fill();
  g.textAlign = 'left'; g.fillStyle = '#6a5c48'; g.font = '700 24px InterW'; spaced(g, 'DAY ' + (s.day === 'END' ? 31 : s.day), -w / 2 + 22, 72, 3);
  g.fillStyle = '#c0392b'; g.font = '700 22px InterW'; spaced(g, '×2 DAILY', w / 2 - 132, 72, 2);
  let y = 128; g.textAlign = 'left';
  prev.forEach((v, k) => { g.font = 'italic 400 40px Lora'; g.fillStyle = 'rgba(70,60,48,0.55)'; g.fillText(v, -w / 2 + 22, y); const tw = g.measureText(v).width;
    const strike = k < prev.length - 1 ? 1 : clamp(dt / 0.3); g.strokeStyle = '#c0392b'; g.lineWidth = 4; g.beginPath(); g.moveTo(-w / 2 + 16, y - 12 + (k % 2) * 4); g.lineTo(-w / 2 + 16 + (tw + 14) * strike, y - 16); g.stroke(); y += 54; });
  const a = clamp((dt - 0.22) / 0.3); g.globalAlpha = idx === 0 ? 1 : a; let nf = 64; g.font = `italic 500 ${nf}px Lora`; while (g.measureText(s.v).width > w - 40 && nf > 30) { nf -= 2; g.font = `italic 500 ${nf}px Lora`; }
  g.fillStyle = '#1d1a26'; g.fillText(s.v, -w / 2 + 20, y + 12); g.font = '700 19px InterW'; g.fillStyle = '#6a5c48'; let cf = 19; while (g.measureText(s.cmp).width > w - 40 && cf > 13) { cf -= 1; g.font = `700 ${cf}px InterW`; } g.fillText(s.cmp, -w / 2 + 22, y + 58);
  g.restore(); }
function drawTitle(O) {
  if (O < TITLE.t0 || O >= TITLE.t1) return;
  const a = eOut(clamp((O - TITLE.t0) / 0.45)) * clamp((TITLE.t1 - O) / 0.3), rise = (1 - eOut(clamp((O - TITLE.t0) / 0.7))) * 40;
  const g = ctx; g.save(); g.globalAlpha = a; g.textAlign = 'center';
  const wash = g.createLinearGradient(0, 120, 0, 900); wash.addColorStop(0, 'rgba(40,16,6,0.55)'); wash.addColorStop(1, 'rgba(40,16,6,0)'); g.fillStyle = wash; g.fillRect(0, 0, W, 900);
  g.translate(0, rise); g.shadowColor = 'rgba(0,0,0,0.45)'; g.shadowBlur = 30; g.shadowOffsetY = 4; g.fillStyle = '#fff';
  g.font = '500 96px Playfair'; g.fillText('What if your', W / 2, 380);
  g.font = 'italic 500 236px Playfair'; g.fillStyle = '#ffe2a0'; g.fillText('drip', W / 2, 600);
  g.fillStyle = '#fff'; g.font = '500 96px Playfair'; g.fillText('doubled every day?', W / 2, 735);
  g.shadowBlur = 0; g.shadowOffsetY = 0; g.globalAlpha = a * 0.85; g.fillStyle = '#E21E39'; g.fillRect(W / 2 - 70, 780, 140, 6); g.restore();
}
function cueAt(O) { let best = null; for (const c of DIALOGUE) if (spanHit(c, O) && O >= c.words[0].t - 0.03) if (!best || c.spans[0][0] > best.spans[0][0]) best = c; return best; }
function strokeText(g, text, x, y, sw) { g.lineJoin = 'round'; g.miterLimit = 2; g.lineWidth = sw; g.strokeStyle = '#000'; g.strokeText(text, x, y); g.fillText(text, x, y); }
function captionChunk(c, O) { const chunks = []; let cur = []; c.words.forEach((w, i) => { cur.push(w); if (cur.length >= 3 || /[.!?…,]$/.test(w.w) || i === c.words.length - 1) { chunks.push(cur); cur = []; } });
  let chunk = chunks[0]; for (const ch of chunks) if (O >= ch[0].t - 0.03) chunk = ch; return chunk.filter(w => O >= w.t - 0.03).map(w => w.w.toUpperCase()).join(' '); }
function drawCaptions(O) {
  const c = cueAt(O); if (!c) return; const g = ctx; g.save(); g.textAlign = 'center'; g.fillStyle = '#fff';
  if (c.kind === 'shout' && c.file === 'sh_whisper') { g.font = 'italic 800 64px Montserrat'; c.words.forEach((w, i) => { const k = O - w.t; if (k < -0.03) return; g.globalAlpha = i ? clamp(1 - k / 0.9) * (i === 1 ? 0.6 : 0.35) : 1; strokeText(g, w.w, CAP_X + (i ? (i === 1 ? -120 : 140) : 0), H * 0.72 + i * 70, 10); }); g.restore(); return; }
  if (c.kind === 'shout') { const k = O - c.words[0].t; const s = k < 0.12 ? 0.6 + 4 * k : 1 + 0.04 * Math.sin(O * 50); const txt = c.words.filter(w => O >= w.t - 0.03).map(w => w.w).join(' ');
    g.translate(CAP_X + Math.sin(O * 73) * 6, H * 0.7 + Math.cos(O * 61) * 5); g.scale(s, s); g.rotate(Math.sin(O * 9) * 0.03);
    let fs = 118; g.font = `800 ${fs}px Montserrat`; while (g.measureText(txt).width > CAP_W - 30 && fs > 36) { fs -= 4; g.font = `800 ${fs}px Montserrat`; }
    g.shadowColor = 'rgba(0,0,0,0.45)'; g.shadowBlur = 20; strokeText(g, txt, 0, 0, 16); g.restore(); return; }
  const shown = captionChunk(c, O); if (!shown) { g.restore(); return; }
  let fs = 78; g.font = `800 ${fs}px Montserrat`; while (g.measureText(shown).width > CAP_W && fs > 40) { fs -= 3; g.font = `800 ${fs}px Montserrat`; }
  const nm = { hero: null, bouncer: 'BOUNCER', narrator: 'NARRATOR', judge: 'JUDGE', mugger: 'MUGGER' }[c.speaker];
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
const PAPER = (() => { const c = mk(270, 480), g = c.getContext('2d'); g.fillStyle = '#f4ecdc'; g.fillRect(0, 0, 270, 480); const r2 = rnd(19); for (let i = 0; i < 3000; i++) { g.fillStyle = `rgba(120,100,70,${r2() * 0.08})`; g.fillRect(r2() * 270, r2() * 480, 1 + r2() * 2, 1 + r2() * 2); } return c; })();
const HATCH = (() => { const c = mk(64, 64), g = c.getContext('2d'); g.strokeStyle = 'rgba(40,30,20,0.55)'; g.lineWidth = 1.2; for (let k = -64; k < 128; k += 7) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k + 64, 64); g.stroke(); } return c; })();
function drawSketch() {   // courtroom-sketch look: paper, pencil edges (image minus itself shifted), soft graphite shading, hatching, a pastel colour wash
  const edge = (c, dx, dy) => { c.globalCompositeOperation = 'source-over'; c.filter = 'none'; c.drawImage(sceneC, 0, 0, W, H); c.globalCompositeOperation = 'difference'; c.drawImage(sceneC, dx, dy, W, H); c.globalCompositeOperation = 'source-over'; };
  edge(tctx, 2, 0); edge(actx, 0, 2);
  const g = ctx; g.save(); g.globalCompositeOperation = 'source-over'; g.drawImage(PAPER, 0, 0, W, H);
  g.globalCompositeOperation = 'multiply'; g.globalAlpha = 0.8; g.filter = 'grayscale(1) brightness(1.45) contrast(0.85)'; g.drawImage(sceneC, 0, 0, W, H);
  g.globalAlpha = 0.4; g.filter = 'blur(3px) saturate(1.4) brightness(1.5)'; g.drawImage(sceneC, 0, 0, W, H);
  g.globalAlpha = 1; g.filter = 'grayscale(1) brightness(5) invert(1)'; g.drawImage(tmpC, 0, 0, W, H); g.drawImage(accC, 0, 0, W, H);
  g.filter = 'none'; g.globalAlpha = 0.22; g.fillStyle = g.createPattern(HATCH, 'repeat'); g.fillRect(0, 0, W, H);
  g.globalCompositeOperation = 'screen'; g.globalAlpha = 0.55; g.filter = 'grayscale(1) brightness(0.7) contrast(2.5)'; g.drawImage(sceneC, 0, 0, W, H); g.restore(); g.filter = 'none';
  actx.clearRect(0, 0, W, H); }
function drawCCTV(T) { const g = ctx; g.save(); g.globalCompositeOperation = 'overlay'; g.globalAlpha = 0.5; g.drawImage(GRAIN[(Math.floor(T * 30) * 7) % 4], 0, 0, W, H); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 0.18; g.fillStyle = '#000'; for (let y = (Math.floor(T * 30) % 2) * 2; y < H; y += 4) g.fillRect(0, y, W, 2); g.globalAlpha = 1;
  const vg = g.createRadialGradient(W / 2, H / 2, H * 0.22, W / 2, H / 2, H * 0.62); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.7)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
  g.font = '700 34px InterW'; g.fillStyle = 'rgba(220,255,220,0.92)'; g.textAlign = 'left'; const sec = Math.floor(41 * 60 + 7 + T - 54); const hh = '23', mm = String(Math.floor(sec / 60) % 60).padStart(2, '0'), ss = String(sec % 60).padStart(2, '0');
  g.fillText('CAM 04  ALLEY REAR', SAFE_L, 1150); g.fillText(`18/11/2026  ${hh}:${mm}:${ss}`, SAFE_L, 1196); if (Math.floor(T * 2) % 2) { g.fillStyle = '#ff3b3b'; g.beginPath(); g.arc(W - SAFE_R - 120, 1138, 13, 0, 7); g.fill(); g.fillStyle = 'rgba(220,255,220,0.92)'; g.fillText('REC', W - SAFE_R - 96, 1150); } g.restore(); }
// ---------------------------------------------------------------- grading / compositing
const GRADES = {
  club: { f: 'saturate(1.15) contrast(1.12) brightness(1.04)', tint: 'rgba(200,60,160,0.10)', mode: 'soft-light', vig: 0.5 },
  wall: { f: 'saturate(1.05) contrast(1.15) brightness(1.02)', tint: 'rgba(255,170,90,0.12)', mode: 'soft-light', vig: 0.55 },
  doc: { f: 'saturate(0.92) contrast(1.06) brightness(1.04) sepia(0.12)', tint: 'rgba(255,200,130,0.14)', mode: 'soft-light', vig: 0.4 },
  shop: { f: 'saturate(1.08) contrast(1.1) brightness(1.03)', tint: 'rgba(255,190,120,0.08)', mode: 'soft-light', vig: 0.45 },
  plaza: { f: 'saturate(1.1) contrast(1.06) brightness(1.03)', tint: 'rgba(255,200,140,0.08)', mode: 'soft-light', vig: 0.32 },
  rain: { f: 'saturate(0.9) contrast(1.12) brightness(1.0)', tint: 'rgba(70,100,170,0.18)', mode: 'soft-light', vig: 0.45 },
  freeze: { f: 'saturate(0.45) contrast(1.2) brightness(1.04)', tint: 'rgba(120,170,255,0.22)', mode: 'soft-light', vig: 0.5 },
  court: { f: 'grayscale(1) contrast(1.5) brightness(1.3)', tint: null, vig: 0.2 },
  cctv: { f: 'grayscale(1) contrast(1.3) brightness(1.6)', tint: 'rgba(60,255,110,0.55)', mode: 'multiply', vig: 0.65 },
  gallery: { f: 'saturate(1.05) contrast(1.05) brightness(1.02)', tint: null, vig: 0.22 },
  corner: { f: 'saturate(1.12) contrast(1.06) brightness(1.03)', tint: 'rgba(200,255,220,0.06)', mode: 'soft-light', vig: 0.35 },
  lapse: { f: 'saturate(1.15) contrast(1.08) brightness(1.03)', tint: 'rgba(255,190,120,0.1)', mode: 'soft-light', vig: 0.35 },
};
function setCam(sh, T, O) {
  const c = sh.cam; const lt = clamp((T - sh.t0) / (sh.t1 - sh.t0)); const e = EASE[c.ease || 'out'](lt);
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
const HEROES = ['club', 'wall', 'zoo', 'window', 'plaza', 'court', 'alley', 'gallery', 'corner'].map(k => S[k].hero);
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
  const gr = GRADES[sh.grade] || GRADES.street;
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
  if (sh.sketch) drawSketch(); if (sh.cctv) drawCCTV(Oreal); if (sh.letterbox) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, 300); ctx.fillRect(0, H - 300, W, 300); }
  if (sh.flare) drawFlare(sh.flare[0], sh.flare[1], 0.9);
  if (sh.dark) { const d = sh.dark(O); if (d > 0) { ctx.fillStyle = `rgba(4,6,18,${d})`; ctx.fillRect(0, 0, W, H); } }
    if (!sh.hideStat && !sh.letterbox && O >= STEPS[0].t) { ctx.save(); ctx.translate(W * 0.2, 400); ctx.scale(1, 0.62); const sg = ctx.createRadialGradient(0, 0, 0, 0, 0, W * 0.62); sg.addColorStop(0, 'rgba(0,0,0,0.34)'); sg.addColorStop(0.55, 'rgba(0,0,0,0.16)'); sg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = sg; ctx.fillRect(-W, -W, W * 3, W * 2); ctx.restore(); }
  drawGrain(Oreal); drawTitle(O); drawTag(Oreal, sh); drawDiary(Oreal, sh); drawCaptions(Oreal);
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