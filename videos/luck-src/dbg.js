// debug views: node dbg.js out.jpg T "px,py,pz" "lx,ly,lz" fov  [T p l fov out ...] (free camera, same frame setup as the shot at T)
const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const CHROME = fs.existsSync('/Applications/Google Chrome 2.app') ? '/Applications/Google Chrome 2.app/Contents/MacOS/Google Chrome' : undefined;
const srv = http.createServer((q, r) => { const f = path.join(__dirname, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': f.endsWith('.js') ? 'text/javascript' : f.endsWith('.html') ? 'text/html' : 'application/octet-stream' }); r.end(d); }); });
(async () => { await new Promise(r => srv.listen(0, r)); const b = await chromium.launch({ executablePath: CHROME, args: ['--use-gl=angle', '--use-angle=metal', '--ignore-gpu-blocklist'] }); const p = await b.newPage({ viewport: { width: 540, height: 960 } });
  p.on('pageerror', e => console.log('PAGEERR', e.message)); await p.goto(`http://localhost:${srv.address().port}/index.html?s=0.5`); await p.waitForFunction('window.READY === true', null, { timeout: 60000 });
  const a = process.argv.slice(2); for (let i = 0; i + 4 < a.length; i += 5) { const [out, T, pp, ll, fov] = a.slice(i, i + 5);
    const d = await p.evaluate(([T, pp, ll, fov]) => { window.CAMOVR = { p0: pp.split(',').map(Number), l0: ll.split(',').map(Number), fov: Number(fov), live: 0 }; const r = window.renderFrame(T); window.CAMOVR = null; return r; }, [parseFloat(T), pp, ll, fov]);
    fs.writeFileSync(out, Buffer.from(d.split(',')[1], 'base64')); console.log('ok', out); }
  await b.close(); srv.close(); })();
