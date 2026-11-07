// Bundle once, render many stills fast. Usage: node scripts/stills.mjs out/stills 0,120,400
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';

const outDir = process.argv[2] ?? 'out/stills';
const frames = (process.argv[3] ?? '0,120,400,800,1100,1500,1700,1795').split(',').map(Number);
fs.mkdirSync(outDir, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), onProgress: () => {}});
const browserExecutable = '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
const comp = await selectComposition({serveUrl, id: 'cam4-ep1', browserExecutable, chromeMode: 'chrome-for-testing'});
for (const f of frames) {
  const t = Date.now();
  await renderStill({composition: comp, serveUrl, frame: f, output: path.join(outDir, `f${String(f).padStart(4, '0')}.png`), browserExecutable, chromeMode: 'chrome-for-testing', chromiumOptions: {gl: 'swangle'}});
  console.log('frame', f, ((Date.now() - t) / 1000).toFixed(1) + 's');
}
