// usage: node collide.js [step]  -> every overlap between solid bodies over the whole timeline, merged into time ranges (solidity rule)
const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const CHROME = fs.existsSync('/Applications/Google Chrome 2.app') ? '/Applications/Google Chrome 2.app/Contents/MacOS/Google Chrome' : undefined;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2', '.json': 'application/json' };
const srv = http.createServer((q, r) => { const f = path.join(__dirname, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); });
(async () => { await new Promise(r => srv.listen(0, r)); const b = await chromium.launch({ executablePath: CHROME, args: ['--use-gl=angle', '--use-angle=metal', '--ignore-gpu-blocklist'] }); const p = await b.newPage({ viewport: { width: 270, height: 480 } });
  p.on('pageerror', e => console.log('PAGEERR', e.message)); await p.goto(`http://localhost:${srv.address().port}/index.html?s=0.25`, { timeout: 120000 }); await p.waitForFunction('window.READY === true', null, { timeout: 120000 });
  const step = parseFloat(process.argv[2] || '0.1'), DUR = await p.evaluate('window.TIMELINE.DUR');
  const res = await p.evaluate(([step, DUR]) => { const out = []; for (let O = 0.01; O < DUR; O += step) { const r = window.collide(O); for (const h of r.hits) out.push([+O.toFixed(2), r.scene, h]); } return out; }, [step, DUR]);
  const open = {}; const ranges = []; for (const [t, sc, h] of res) { const k = sc + ' ' + h; if (open[k] && t - open[k][1] <= step * 1.5) open[k][1] = t; else { if (open[k]) ranges.push([k, ...open[k]]); open[k] = [t, t]; } }
  for (const k in open) ranges.push([k, ...open[k]]); ranges.sort((a, b) => a[1] - b[1]); for (const [k, a, z] of ranges) console.log(`${a.toFixed(2)}-${z.toFixed(2)}  ${k}`); console.log('TOTAL', ranges.length);
  await b.close(); srv.close(); })();
