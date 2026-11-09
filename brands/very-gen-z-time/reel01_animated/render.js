const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const [,, mode, fromS, toS] = process.argv;
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 720, height: 1280 } });
  p.on('console', m => console.log('page:', m.text())); p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('http://127.0.0.1:8765/scene.html'); await p.waitForFunction('window.ready === true', null, { timeout: 120000 });
  fs.mkdirSync('frames', { recursive: true });
  const times = mode === 'test' ? fromS.split(',').map(Number) : null;
  const list = times || (() => { const a = []; for (let f = Math.round(+fromS * 24); f < Math.round(+toS * 24); f++) a.push(f / 24); return a; })();
  for (const t of list) {
    const d = await p.evaluate(t => window.renderAt(t), t);
    const name = mode === 'test' ? `test_${t}.jpg` : `frames/f_${String(Math.round(t * 24)).padStart(4, '0')}.jpg`;
    fs.writeFileSync(name, Buffer.from(d.split(',')[1], 'base64'));
  }
  await b.close(); console.log('done', list.length);
})();
