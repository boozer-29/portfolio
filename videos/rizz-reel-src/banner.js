import * as THREE from 'three';
function wait() { return new Promise(r => { const f = () => window.__lib && window.READY ? r() : setTimeout(f, 50); f(); }); }
window.renderBanner = async (opt) => {
  await wait(); const { makePerson } = window.__lib;
  const W = 2560, H = 1440, SAFE = { x: (W - 1546) / 2, y: (H - 423) / 2, w: 1546, h: 423 };
  // hero exactly like the chosen profile picture
  const HN = 1400; const hc = document.createElement('canvas'); hc.width = hc.height = HN;
  const R = new THREE.WebGLRenderer({ canvas: hc, antialias: true, alpha: true, preserveDrawingBuffer: true });
  R.setSize(HN, HN, false); R.setClearColor(0, 0); R.toneMapping = THREE.ACESFilmicToneMapping; R.outputColorSpace = THREE.SRGBColorSpace;
  const sc = new THREE.Scene();
  sc.add(new THREE.HemisphereLight(0xd9d2ff, 0x2a1460, 1.1));
  const key = new THREE.DirectionalLight(0xfff1dc, 2.8); key.position.set(4, 5, 6); sc.add(key);
  const rim = new THREE.DirectionalLight(0xffb43a, 3.2); rim.position.set(-5, 3, -4); sc.add(rim);
  const rim2 = new THREE.DirectionalLight(0x7a6bff, 2.0); rim2.position.set(5, 2, -5); sc.add(rim2);
  const P = makePerson(); sc.add(P.g); P.pose('idle'); P.expr('smug'); P.glasses.visible = true;
  P.g.rotation.y = 0.28; P.head.rotation.set(-0.05, -0.12, 0.06);
  const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 100); cam.position.set(0.9, 2.05, 4.1); cam.lookAt(0.05, 2.05, 0); R.render(sc, cam);

  const o = document.createElement('canvas'); o.width = W; o.height = H; const g = o.getContext('2d');
  const bg = g.createRadialGradient(W * 0.62, H * 0.45, 0, W * 0.5, H * 0.5, W * 0.62);
  bg.addColorStop(0, '#6a4cff'); bg.addColorStop(0.5, '#3A2BD9'); bg.addColorStop(1, '#120a4a'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
  let s = 7; const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  for (let i = 0; i < 420; i++) { const x = rnd() * W, y = rnd() * H, r = 2 + rnd() * 4; g.fillStyle = `rgba(255,255,255,${0.2 + rnd() * 0.6})`; g.fillRect(x, y, r, r); }
  // sun glow behind hero (same as pfp)
  const HD = 640; const hx = SAFE.x + SAFE.w - 590, hy = SAFE.y - 150;     // hero canvas placement (head inside the safe area)
  const sx = hx + 0.68 * HD, sy = hy + 0.30 * HD;
  const sg = g.createRadialGradient(sx, sy, 0, sx, sy, 380); sg.addColorStop(0, 'rgba(255,214,90,0.95)'); sg.addColorStop(0.35, 'rgba(255,150,60,0.5)'); sg.addColorStop(1, 'rgba(255,120,40,0)'); g.fillStyle = sg; g.fillRect(0, 0, W, H);
  // doubling blocks (1,2,4,8,16) rising across the strip
  const blocks = [[0.035, 0.63, 6], [0.075, 0.6, 11], [0.12, 0.555, 20], [0.17, 0.49, 36]];
  g.save(); g.globalAlpha = 0.5; g.strokeStyle = '#fff'; g.lineWidth = 4; g.setLineDash([16, 14]); g.beginPath(); blocks.forEach(([x, y], i) => i ? g.lineTo(x * W, y * H) : g.moveTo(x * W, y * H)); g.stroke(); g.restore();
  blocks.forEach(([x, y, w], i) => { g.fillStyle = i % 2 ? '#ffffff' : '#E21E39'; g.fillRect(x * W - w, y * H - w, w * 2, w * 2); });
  // hero (bottom faded so the bust doesn't end in a hard edge on TV)
  { const m = document.createElement('canvas'); m.width = m.height = HN; const mg = m.getContext('2d'); mg.drawImage(hc, 0, 0);
    mg.globalCompositeOperation = 'destination-in'; const fg = mg.createLinearGradient(0, HN * 0.86, 0, HN); fg.addColorStop(0, 'rgba(0,0,0,1)'); fg.addColorStop(1, 'rgba(0,0,0,0)'); mg.fillStyle = fg; mg.fillRect(0, 0, HN, HN);
    var heroImg = m; }
  g.save(); g.shadowColor = 'rgba(0,0,0,0.45)'; g.shadowBlur = 50; g.drawImage(heroImg, hx, hy, HD, HD); g.restore();
  // pixel hearts
  const HP = ['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'];
  const heart = (cx, cy, px) => { g.fillStyle = '#ff4f7b'; HP.forEach((row, r) => [...row].forEach((ch, k) => { if (ch === 'X') g.fillRect(cx + (k - 3.5) * px, cy + (r - 3) * px, px - 2, px - 2); })); };
  heart(hx + 60, SAFE.y + 70, 12); heart(SAFE.x + SAFE.w - 30, SAFE.y + SAFE.h - 120, 9); heart(SAFE.x - 210, SAFE.y + 70, 8);
  // text block inside the safe area (left side)
  const tx = SAFE.x + 40; g.textAlign = 'left'; g.fillStyle = '#fff';
  g.shadowColor = 'rgba(0,0,0,0.45)'; g.shadowBlur = 24; g.shadowOffsetY = 4;
  if (opt.name) { g.font = '800 64px Montserrat'; g.fillText(opt.name.toUpperCase(), tx, SAFE.y + 110); }
  g.font = '400 96px Lora'; const top = opt.name ? SAFE.y + 215 : SAFE.y + 150;
  g.fillText('What if it doubled', tx, top); g.fillText('every day?', tx, top + 108);
  g.shadowBlur = 0; g.shadowOffsetY = 0;
  // ×2 EVERY DAY pill (series rule pill) + tagline
  const py = SAFE.y + SAFE.h - 70; g.font = '700 40px InterW'; let px = tx; const pill = '×2 EVERY DAY';
  const sp = (t, x, y, l) => { let cx = x; for (const ch of t) { g.fillText(ch, cx, y); cx += g.measureText(ch).width + l; } return cx - x; };
  const meas = (t, l) => { let w = 0; for (const ch of t) w += g.measureText(ch).width + l; return w; };
  const pw = meas(pill, 4); g.fillStyle = '#E21E39'; g.beginPath(); g.roundRect(px, py - 44, pw + 40, 62, 6); g.fill(); g.fillStyle = '#fff'; sp(pill, px + 20, py, 4);
  g.font = '600 36px InterW'; g.globalAlpha = 0.9; sp('NEW 3D STORY EVERY DAY', px + pw + 70, py - 2, 5); g.globalAlpha = 1;
  // ×2 badge (same as pfp) near the hero
  g.save(); g.font = '800 64px Montserrat'; const t = '×2'; const bw = g.measureText(t).width; g.translate(hx + HD * 0.73, SAFE.y + SAFE.h - 95); g.rotate(-0.12);
  g.fillStyle = '#E21E39'; g.beginPath(); g.roundRect(-bw / 2 - 22, -50, bw + 44, 72, 12); g.fill(); g.lineWidth = 7; g.strokeStyle = '#fff'; g.stroke(); g.fillStyle = '#fff'; g.textAlign = 'center'; g.fillText(t, 0, 9); g.restore();
  // vignette
  const vg = g.createRadialGradient(W / 2, H / 2, H * 0.4, W / 2, H / 2, W * 0.6); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.45)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
  if (opt.guides) { g.strokeStyle = '#0f0'; g.lineWidth = 4; g.strokeRect(SAFE.x, SAFE.y, SAFE.w, SAFE.h); g.strokeStyle = '#ff0'; g.strokeRect(0, (H - 423) / 2, W, 423); }
  return o.toDataURL('image/png');
};
