import * as THREE from 'three';
const N = 2160;
function wait() { return new Promise(r => { const f = () => window.__lib && window.READY ? r() : setTimeout(f, 50); f(); }); }
window.renderPfp = async (v) => {
  await wait(); const { makePerson, makeHeart, box } = window.__lib;
  const c = document.createElement('canvas'); c.width = c.height = N;
  const R = new THREE.WebGLRenderer({ canvas: c, antialias: true, alpha: true, preserveDrawingBuffer: true });
  R.setSize(N, N, false); R.toneMapping = THREE.ACESFilmicToneMapping; R.outputColorSpace = THREE.SRGBColorSpace; R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap;
  const sc = new THREE.Scene();
  sc.add(new THREE.HemisphereLight(0xd9d2ff, 0x2a1460, 1.1));
  const key = new THREE.DirectionalLight(0xfff1dc, 2.8); key.position.set(4, 5, 6); key.castShadow = true; sc.add(key);
  const rim = new THREE.DirectionalLight(0xffb43a, 3.2); rim.position.set(-5, 3, -4); sc.add(rim);
  const rim2 = new THREE.DirectionalLight(0x7a6bff, 2.0); rim2.position.set(5, 2, -5); sc.add(rim2);
  const P = makePerson(); sc.add(P.g);
  P.pose('idle'); P.expr(v.expr); P.glasses.visible = true;
  P.g.rotation.y = v.rotY; P.head.rotation.set(v.headX, v.headY, v.headZ);
  if (v.guns) { P.arms[1].rotation.set(-1.25, 0.2, -0.55); }
  const cam = new THREE.PerspectiveCamera(v.fov, 1, 0.1, 100); cam.position.set(...v.cam); cam.lookAt(...v.look);
  R.render(sc, cam);
  // compose
  const o = document.createElement('canvas'); o.width = o.height = N; const g = o.getContext('2d');
  const bg = g.createRadialGradient(N * 0.5, N * 0.42, 0, N * 0.5, N * 0.5, N * 0.75);
  bg.addColorStop(0, '#6a4cff'); bg.addColorStop(0.55, '#3A2BD9'); bg.addColorStop(1, '#120a4a'); g.fillStyle = bg; g.fillRect(0, 0, N, N);
  // stars
  let s = 7; const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  for (let i = 0; i < 160; i++) { const x = rnd() * N, y = rnd() * N, r = 2 + rnd() * 5; g.fillStyle = `rgba(255,255,255,${0.25 + rnd() * 0.6})`; g.fillRect(x, y, r, r); }
  // sun glow behind the head
  const sg = g.createRadialGradient(N * v.sunX, N * v.sunY, 0, N * v.sunX, N * v.sunY, N * 0.42);
  sg.addColorStop(0, 'rgba(255,214,90,0.95)'); sg.addColorStop(0.35, 'rgba(255,150,60,0.55)'); sg.addColorStop(1, 'rgba(255,120,40,0)'); g.fillStyle = sg; g.fillRect(0, 0, N, N);
  g.drawImage(c, 0, 0);
  // soft bloom
  g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.18; g.filter = 'blur(40px)'; g.drawImage(c, 0, 0); g.restore();
  // pixel hearts accents
  const H = ['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'];
  const heart = (cx, cy, px, col) => { g.fillStyle = col; H.forEach((row, r) => [...row].forEach((ch, k) => { if (ch === 'X') g.fillRect(cx + (k - 3.5) * px, cy + (r - 3) * px, px - 2, px - 2); })); };
  for (const h of v.hearts) heart(N * h[0], N * h[1], h[2], '#ff4f7b');
  // ×2 pill
  if (v.pill) { g.save(); g.font = '800 150px Montserrat'; const t = '×2'; const w = g.measureText(t).width; const x = N * v.pill[0], y = N * v.pill[1];
    g.translate(x, y); g.rotate(-0.12); g.fillStyle = '#E21E39'; g.beginPath(); g.roundRect(-w / 2 - 50, -115, w + 100, 170, 26); g.fill();
    g.lineWidth = 14; g.strokeStyle = '#fff'; g.stroke(); g.fillStyle = '#fff'; g.textAlign = 'center'; g.fillText(t, 0, 20); g.restore(); }
  // vignette
  const vg = g.createRadialGradient(N / 2, N / 2, N * 0.35, N / 2, N / 2, N * 0.72); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.45)'); g.fillStyle = vg; g.fillRect(0, 0, N, N);
  return o.toDataURL('image/png');
};
