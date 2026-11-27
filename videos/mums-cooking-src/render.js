// usage: node render.js test 1.0 5.0 ...   |  node render.js all <start> <end> <outdir>
const { chromium } = require('playwright');
const http = require('http'); const fs = require('fs'); const path = require('path');
const ROOT = __dirname;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2', '.json': 'application/json' };
const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); });
(async () => {
  await new Promise(res => srv.listen(0, res)); const port = srv.address().port;
  const GPU = process.env.GPU === '1';   // GPU=1 -> use the Mac's Metal GPU (fast); default -> software renderer (slow, works anywhere)
  const b = await chromium.launch({ args: GPU ? ['--use-gl=angle', '--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu-rasterization'] : ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('console', m => { if (m.type() === 'error') console.log('ERR', m.text()); }); p.on('pageerror', e => console.log('PAGEERR', e.message));
  await p.goto(`http://localhost:${port}/index.html?s=${process.env.RSCALE || 1}`); await p.waitForFunction('window.READY === true', null, { timeout: 60000 });
  const mode = process.argv[2];
  if (mode === 'timeline') { fs.writeFileSync(path.join(ROOT, 'timeline.json'), JSON.stringify(await p.evaluate('window.TIMELINE'), null, 1)); }
  else if (mode === 'test') {
    fs.mkdirSync(path.join(ROOT, process.env.TDIR || 'test'), { recursive: true });
    for (const t of process.argv.slice(3)) { const d = await p.evaluate(t => window.renderFrame(t), parseFloat(t)); fs.writeFileSync(path.join(ROOT, process.env.TDIR || 'test', `t${t}.jpg`), Buffer.from(d.split(',')[1], 'base64')); console.log('ok', t); }
  } else if (mode === 'pairs') {
    fs.mkdirSync(path.join(ROOT, 'pairs'), { recursive: true });
    for (let k = 0; k < 1728; k += 15) for (const j of [0, 1]) { const i = k + 7 + j; const d = await p.evaluate(t => window.renderFrame(t), i / 30); fs.writeFileSync(path.join(ROOT, 'pairs', String(i).padStart(5, '0') + '.jpg'), Buffer.from(d.split(',')[1], 'base64')); }
  } else {
    const s = parseInt(process.argv[3]), e = parseInt(process.argv[4]), dir = process.argv[5]; fs.mkdirSync(dir, { recursive: true });
    const t0 = Date.now();
    for (let i = s; i < e; i++) {
      if (fs.existsSync(path.join(dir, String(i).padStart(5, '0') + '.jpg')) && fs.statSync(path.join(dir, String(i).padStart(5, '0') + '.jpg')).size > 2000) continue;
      const d = await p.evaluate(t => window.renderFrame(t), i / 30);
      fs.writeFileSync(path.join(dir, String(i).padStart(5, '0') + '.jpg'), Buffer.from(d.split(',')[1], 'base64'));
      if (i % 60 === 0) console.log(i, ((Date.now() - t0) / (i - s + 1)).toFixed(0) + 'ms/f');
    }
  }
  await b.close(); srv.close();
})();
