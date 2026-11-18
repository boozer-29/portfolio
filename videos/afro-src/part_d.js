function stepAt(T) { let s = null; for (const st of STEPS) if (T >= st.t) s = st; return s; }
function spaced(g, text, x, y, sp) { let cx = x; for (const ch of text) { g.fillText(ch, cx, y); cx += g.measureText(ch).width + sp; } return cx - x; }
const measC = mk(10, 10).getContext('2d');
function drawStat(T, sh) {
  const s = stepAt(T); if (!s || sh.hideStat) return; const g = ctx, x = 30; g.save();
  g.shadowColor = 'rgba(0,0,0,0.55)'; g.shadowBlur = 14; g.shadowOffsetY = 2; g.fillStyle = '#fff'; g.textAlign = 'left';
  g.font = '600 30px InterW'; spaced(g, 'AFRO WIDTH', x, 288, 4.5);
  const dt = (T - s.t) * 30; const sc = dt < 5 ? (dt < 2.5 ? 1 + 0.06 * dt / 2.5 : 1.06 - 0.06 * (dt - 2.5) / 2.5) : 1;
  g.save(); g.translate(x, 412); g.scale(sc, sc); g.font = '500 128px Lora'; g.fillText(s.v, 0, 0); g.restore();
  g.font = '600 27px InterW'; spaced(g, s.cmp, x, 462, 3.6);
  g.font = '600 25px InterW'; g.globalAlpha = 0.9; spaced(g, 'DAY ' + s.day, x, 502, 3.2); g.globalAlpha = 1;
  g.shadowBlur = 0; g.shadowOffsetY = 0; g.font = '700 25px InterW'; measC.font = '700 25px InterW'; const tw = spaced(measC, '×2 EVERY DAY', 0, 0, 2.5);
  rr(g, x, 520, tw + 26, 42, 3); g.fillStyle = '#E21E39'; g.fill(); g.fillStyle = '#fff'; spaced(g, '×2 EVERY DAY', x + 13, 550, 2.5); g.restore();
}
function drawTitle(O) {
  if (O < TITLE.t0 || O >= TITLE.t1) return;
  const a = eOut(clamp((O - TITLE.t0) / 0.45)) * clamp((TITLE.t1 - O) / 0.3), rise = (1 - eOut(clamp((O - TITLE.t0) / 0.7))) * 40;
  const g = ctx; g.save(); g.globalAlpha = a; g.textAlign = 'center';
  const wash = g.createLinearGradient(0, 120, 0, 900); wash.addColorStop(0, 'rgba(40,16,6,0.55)'); wash.addColorStop(1, 'rgba(40,16,6,0)'); g.fillStyle = wash; g.fillRect(0, 0, W, 900);
  g.translate(0, rise); g.shadowColor = 'rgba(0,0,0,0.45)'; g.shadowBlur = 30; g.shadowOffsetY = 4; g.fillStyle = '#fff';
  g.font = '500 96px Playfair'; g.fillText('What if your', W / 2, 380);
  g.font = 'italic 500 236px Playfair'; g.fillStyle = '#fff1d6'; g.fillText('afro', W / 2, 600);
  g.fillStyle = '#fff'; g.font = '500 96px Playfair'; g.fillText('doubled every day?', W / 2, 735);
  g.shadowBlur = 0; g.shadowOffsetY = 0; g.globalAlpha = a * 0.85; g.fillStyle = '#E21E39'; g.fillRect(W / 2 - 70, 780, 140, 6); g.restore();
}
function cueAt(O) { let best = null; for (const c of DIALOGUE) if (spanHit(c, O) && O >= c.words[0].t - 0.03) if (!best || c.spans[0][0] > best.spans[0][0]) best = c; return best; }
function strokeText(g, text, x, y, sw) { g.lineJoin = 'round'; g.miterLimit = 2; g.lineWidth = sw; g.strokeStyle = '#000'; g.strokeText(text, x, y); g.fillText(text, x, y); }
function captionChunk(c, O) { const chunks = []; let cur = []; c.words.forEach((w, i) => { cur.push(w); if (cur.length >= 3 || /[.!?…,]$/.test(w.w) || i === c.words.length - 1) { chunks.push(cur); cur = []; } });
  let chunk = chunks[0]; for (const ch of chunks) if (O >= ch[0].t - 0.03) chunk = ch; return chunk.filter(w => O >= w.t - 0.03).map(w => w.w.toUpperCase()).join(' '); }
function drawCaptions(O) {
  const c = cueAt(O); if (!c) return; const g = ctx; g.save(); g.textAlign = 'center'; g.fillStyle = '#fff';
  if (c.kind === 'shout') { const k = O - c.words[0].t; const s = k < 0.12 ? 0.6 + 4 * k : 1 + 0.04 * Math.sin(O * 50); const txt = c.words.map(w => w.w).join(' ');
    g.translate(W / 2 + Math.sin(O * 73) * 6, H * 0.7 + Math.cos(O * 61) * 5); g.scale(s, s); g.rotate(Math.sin(O * 9) * 0.03);
    let fs = 118; g.font = `800 ${fs}px Montserrat`; while (g.measureText(txt).width > W * 0.84 && fs > 60) { fs -= 4; g.font = `800 ${fs}px Montserrat`; }
    g.shadowColor = 'rgba(0,0,0,0.45)'; g.shadowBlur = 20; strokeText(g, txt, 0, 0, 16); g.restore(); return; }
  const shown = captionChunk(c, O); if (!shown) { g.restore(); return; }
  let fs = 78; g.font = `800 ${fs}px Montserrat`; while (g.measureText(shown).width > W * 0.82 && fs > 44) { fs -= 3; g.font = `800 ${fs}px Montserrat`; }
  const nm = { hero: null, bird: 'BIRD', barber: 'BARBER', kid: 'KID', anchor: 'NEWS ANCHOR', saturn: 'SATURN', astronaut: 'ASTRONAUT', date: 'DATE' }[c.speaker];
  strokeText(g, shown, W / 2, H * 0.72, 12); if (nm) { g.font = '700 30px InterW'; g.globalAlpha = 0.85; strokeText(g, nm, W / 2, H * 0.72 - fs - 8, 6); }
  g.restore();
}
function drawLower(O) {   // in-world news lower third (prop text)
  const g = ctx, y = 1560, a = eOut(clamp((O - 34.05) / 0.35)); g.save(); g.globalAlpha = a; g.translate((1 - a) * -200, 0);
  g.fillStyle = '#E21E39'; g.fillRect(40, y, 250, 70); g.fillStyle = '#fff'; g.font = '700 38px InterW'; g.textAlign = 'left'; spaced(g, 'BREAKING', 62, y + 49, 3);
  g.fillStyle = 'rgba(255,255,255,0.95)'; g.fillRect(290, y, 750, 70); g.fillStyle = '#0b1a3a'; g.font = '700 36px InterW'; spaced(g, 'CITY MOWS LOCAL MAN\u2019S HAIR', 316, y + 48, 2.5);
  g.fillStyle = '#0b1a3a'; g.fillRect(40, y + 70, 1000, 40); g.fillStyle = '#fff'; g.font = '600 24px InterW'; spaced(g, 'EXPERTS CONFIRM: IT SAYS HELP', 62, y + 98, 2); g.restore(); }
function drawFlare(fx, fy, a = 1) {   // Frutiger lens flare
  const g = ctx; const sx = fx * W, sy = fy * H; g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = a;
  const s = g.createRadialGradient(sx, sy, 0, sx, sy, 260); s.addColorStop(0, 'rgba(255,255,240,0.9)'); s.addColorStop(0.2, 'rgba(255,250,210,0.35)'); s.addColorStop(1, 'rgba(255,240,200,0)'); g.fillStyle = s; g.fillRect(sx - 260, sy - 260, 520, 520);
  const cx = W / 2, cy = H / 2; [[0.35, 40, 'rgba(140,240,255,0.18)'], [0.7, 70, 'rgba(160,255,190,0.12)'], [1.25, 26, 'rgba(255,255,255,0.2)'], [1.6, 110, 'rgba(120,200,255,0.1)']].forEach(([k, r, c]) => {
    const x = sx + (cx - sx) * k * 2, y = sy + (cy - sy) * k * 2; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, c); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); });
  g.restore();
}
// ---------------------------------------------------------------- grading / compositing
const GRADES = {
  warm: { f: 'saturate(1.14) contrast(1.06) brightness(0.98)', tint: 'rgba(255,170,90,0.12)', mode: 'soft-light', vig: 0.3 },
  dawn: { f: 'saturate(1.16) contrast(1.07) brightness(0.92)', tint: 'rgba(255,150,70,0.16)', mode: 'soft-light', vig: 0.34 },
  street: { f: 'saturate(1.14) contrast(1.07) brightness(0.96)', tint: 'rgba(255,200,130,0.10)', mode: 'soft-light', vig: 0.28 },
  quiet: { f: 'saturate(0.92) contrast(1.06) brightness(0.9)', tint: 'rgba(110,150,210,0.14)', mode: 'soft-light', vig: 0.34 },
  lagoon: { f: 'saturate(1.2) contrast(1.07) brightness(0.96)', tint: 'rgba(120,220,255,0.08)', mode: 'soft-light', vig: 0.26 },
  sky: { f: 'saturate(1.12) contrast(1.08) brightness(0.84)', tint: 'rgba(255,190,120,0.10)', mode: 'soft-light', vig: 0.26 },
  cockpit: { f: 'saturate(1.1) contrast(1.07) brightness(0.96)', tint: 'rgba(255,170,100,0.12)', mode: 'soft-light', vig: 0.34 },
  rice: { f: 'saturate(1.1) contrast(1.06) brightness(0.88)', tint: 'rgba(255,220,170,0.10)', mode: 'soft-light', vig: 0.3 },
  space: { f: 'saturate(1.12) contrast(1.06) brightness(0.95)', tint: 'rgba(70,110,230,0.12)', mode: 'screen', vig: 0.4 },
  cosmic: { f: 'saturate(1.14) contrast(1.06) brightness(0.92)', tint: 'rgba(110,70,230,0.14)', mode: 'screen', vig: 0.4 },
  shop: { f: 'saturate(1.1) contrast(1.06) brightness(0.97)', tint: 'rgba(255,220,170,0.08)', mode: 'soft-light', vig: 0.3 },
  news: { f: 'saturate(1.12) contrast(1.08) brightness(0.98)', tint: 'rgba(90,150,255,0.12)', mode: 'soft-light', vig: 0.32 },
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
const HEROES = [S.room.hero, S.street.hero, S.barber.hero, S.market.hero, S.space.hero];
export function renderFrame(O) {
  const sh = shots.find(s => O >= s.t0 && O < s.t1) || shots[shots.length - 1];
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
  const gr = GRADES[sh.grade] || GRADES.room;
  sctx.globalCompositeOperation = 'source-over'; sctx.filter = 'none';
  if (sh.dof) {
    smctx.filter = 'blur(2.5px)'; smctx.drawImage(SRC, 0, 0, 270, 480); smctx.filter = 'none'; sctx.drawImage(smallC, 0, 0, W, H);
    shctx.globalCompositeOperation = 'source-over'; shctx.clearRect(0, 0, W, H); shctx.drawImage(SRC, 0, 0, W, H); shctx.globalCompositeOperation = 'destination-in';
    const rg = shctx.createRadialGradient(W / 2, H * 0.47, W * 0.2 * (1 - sh.dof * 0.3), W / 2, H * 0.47, W * 0.85 * (1 - sh.dof * 0.3)); rg.addColorStop(0, 'rgba(0,0,0,1)'); rg.addColorStop(1, 'rgba(0,0,0,0)'); shctx.fillStyle = rg; shctx.fillRect(0, 0, W, H);
    sctx.drawImage(sharpC, 0, 0, W, H);
  } else sctx.drawImage(SRC, 0, 0, W, H);
  const bloom = sh.bloom ?? 0.1;    // a touch of glow everywhere (Frutiger sheen)
  smctx.filter = 'blur(6px) brightness(1.25)'; smctx.drawImage(sceneC, 0, 0, 270, 480); smctx.filter = 'none';
  sctx.globalCompositeOperation = 'lighter'; sctx.globalAlpha = bloom; sctx.drawImage(smallC, 0, 0, W, H); sctx.globalAlpha = 1; sctx.globalCompositeOperation = 'source-over';
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.filter = gr.f; ctx.drawImage(sceneC, 0, 0, W, H); ctx.filter = 'none';
  if (gr.tint) { ctx.globalCompositeOperation = gr.mode; ctx.fillStyle = gr.tint; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over'; }
  const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, `rgba(0,0,0,${gr.vig})`); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  if (sh.flare) drawFlare(sh.flare[0], sh.flare[1], 0.9);
  if (sh.dark) { const d = sh.dark(O); if (d > 0) { ctx.fillStyle = `rgba(4,6,18,${d})`; ctx.fillRect(0, 0, W, H); } }
    if (!sh.hideStat && O >= STEPS[0].t) { ctx.save(); ctx.translate(W * 0.2, 400); ctx.scale(1, 0.62); const sg = ctx.createRadialGradient(0, 0, 0, 0, 0, W * 0.62); sg.addColorStop(0, 'rgba(0,0,0,0.34)'); sg.addColorStop(0.55, 'rgba(0,0,0,0.16)'); sg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = sg; ctx.fillRect(-W, -W, W * 3, W * 2); ctx.restore(); }
  if (sh.lower) drawLower(O); drawTitle(O); drawStat(O, sh); drawCaptions(O);
  for (const s of shots) if (s.flash !== undefined) { const d = Math.round((O - s.flash) * 30); if (d >= 0 && d < 3) { ctx.fillStyle = `rgba(255,255,255,${(s.fa || [0.95, 0.6, 0.25])[d]})`; ctx.fillRect(0, 0, W, H); } }
  return out.toDataURL('image/jpeg', RS > 1 ? 0.95 : 0.94);
}
export const TIMELINE = { STEPS, DUR, cuts: shots.map(s => s.t0), flashes: shots.filter(s => s.flash !== undefined).map(s => s.flash) };
window.captionText = (O) => { const c = cueAt(O); if (!c) return ''; return c.kind === 'shout' ? c.words.map(w => w.w).join(' ') : captionChunk(c, O); };
window.hookText = () => '';
window.S = S; window.cam = cam; window.shots = shots; window.renderFrame = renderFrame; window.TIMELINE = TIMELINE;
fetch('dialogue.json').then(r => r.json()).then(d => { DIALOGUE = d; }).catch(() => { DIALOGUE = []; })
  .then(() => Promise.all(['800 78px Montserrat', '500 96px Playfair', 'italic 500 236px Playfair', '500 128px Lora', '600 30px InterW', '700 30px InterW'].map(f => document.fonts.load(f)))).then(() => { window.READY = true; });