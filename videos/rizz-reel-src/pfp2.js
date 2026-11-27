import * as THREE from 'three';
const N = 2160;
function wait() { return new Promise(r => { const f = () => window.__lib && window.READY ? r() : setTimeout(f, 50); f(); }); }
function renderHeroes(v) {
  const { makePerson } = window.__lib;
  const c = document.createElement('canvas'); c.width = c.height = N;
  const R = new THREE.WebGLRenderer({ canvas: c, antialias: true, alpha: true, preserveDrawingBuffer: true });
  R.setSize(N, N, false); R.setClearColor(0x000000, 0); R.toneMapping = THREE.ACESFilmicToneMapping; R.outputColorSpace = THREE.SRGBColorSpace;
  const sc = new THREE.Scene();
  sc.add(new THREE.HemisphereLight(0xe6e2ff, 0x2a1460, 1.15));
  const key = new THREE.DirectionalLight(0xfff1dc, 2.8); key.position.set(4, 5, 6); sc.add(key);
  const rim = new THREE.DirectionalLight(0xff4a5a, 2.6); rim.position.set(-5, 3, -4); sc.add(rim);
  const rim2 = new THREE.DirectionalLight(0x7a9bff, 2.2); rim2.position.set(5, 2, -5); sc.add(rim2);
  for (const h of v.heroes) {
    const P = makePerson(); sc.add(P.g); P.pose(h.pose || 'idle'); P.expr(h.expr); P.glasses.visible = !!h.glasses;
    P.g.position.set(...h.pos); P.g.scale.setScalar(h.s || 1); P.g.rotation.y = h.rotY || 0; P.head.rotation.set(h.hx || 0, h.hy || 0, h.hz || 0);
    if (h.arms) { P.arms[0].rotation.set(...h.arms[0]); P.arms[1].rotation.set(...h.arms[1]); }
  }
  const cam = new THREE.PerspectiveCamera(v.fov, 1, 0.1, 100); cam.position.set(...v.cam); cam.lookAt(...v.look); R.render(sc, cam);
  return c;
}
window.renderPfp2 = async (v) => {
  await wait();
  const o = document.createElement('canvas'); o.width = o.height = N; const g = o.getContext('2d');
  const bg = g.createRadialGradient(N * 0.5, N * 0.45, 0, N * 0.5, N * 0.5, N * 0.75);
  bg.addColorStop(0, v.bg[0]); bg.addColorStop(0.6, v.bg[1]); bg.addColorStop(1, v.bg[2]); g.fillStyle = bg; g.fillRect(0, 0, N, N);
  let s = 11; const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  for (let i = 0; i < 140; i++) { const x = rnd() * N, y = rnd() * N, r = 2 + rnd() * 5; g.fillStyle = `rgba(255,255,255,${0.2 + rnd() * 0.5})`; g.fillRect(x, y, r, r); }
  // doubling squares: 1,2,4,8,16 climbing an exponential curve
  if (v.blocks) {
    const pts = [[0.10, 0.80, 18], [0.17, 0.72, 34], [0.26, 0.60, 62], [0.40, 0.42, 116], [0.62, 0.16, 210]];
    g.save(); g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 10; g.setLineDash([26, 22]); g.beginPath();
    pts.forEach(([x, y], i) => i ? g.lineTo(x * N, y * N) : g.moveTo(x * N, y * N)); g.stroke(); g.restore();
    pts.forEach(([x, y, w], i) => { if (i < v.blocks) { g.fillStyle = i % 2 ? '#ffffff' : '#E21E39'; g.shadowColor = 'rgba(0,0,0,0.35)'; g.shadowBlur = 30; g.fillRect(x * N - w, y * N - w, w * 2, w * 2); g.shadowBlur = 0; } });
  }
  // giant ×2 behind the hero
  if (v.x2) {
    g.save(); g.translate(N * v.x2[0], N * v.x2[1]); g.rotate(v.x2[3] || 0); g.font = `800 ${v.x2[2]}px Montserrat`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.lineJoin = 'round'; g.lineWidth = v.x2[2] * 0.09; g.strokeStyle = '#ffffff'; g.strokeText('×2', 0, 0); g.fillStyle = '#E21E39'; g.fillText('×2', 0, 0); g.restore();
  }
  // hero glow halo
  const hg = g.createRadialGradient(N * 0.5, N * 0.5, 0, N * 0.5, N * 0.5, N * 0.45); hg.addColorStop(0, 'rgba(255,255,255,0.18)'); hg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = hg; g.fillRect(0, 0, N, N);
  const c = renderHeroes(v);
  g.save(); g.shadowColor = 'rgba(0,0,0,0.5)'; g.shadowBlur = 60; g.drawImage(c, 0, 0); g.restore();
  g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.12; g.filter = 'blur(40px)'; g.drawImage(c, 0, 0); g.restore();
  if (v.badge) { g.save(); g.font = '800 170px Montserrat'; const t = '×2'; const w = g.measureText(t).width; const x = N * v.badge[0], y = N * v.badge[1];
    g.translate(x, y); g.rotate(-0.12); g.fillStyle = '#E21E39'; g.beginPath(); g.roundRect(-w / 2 - 55, -125, w + 110, 185, 28); g.fill();
    g.lineWidth = 16; g.strokeStyle = '#fff'; g.stroke(); g.fillStyle = '#fff'; g.textAlign = 'center'; g.fillText(t, 0, 22); g.restore(); }
  const vg = g.createRadialGradient(N / 2, N / 2, N * 0.35, N / 2, N / 2, N * 0.72); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.5)'); g.fillStyle = vg; g.fillRect(0, 0, N, N);
  return o.toDataURL('image/png');
};
