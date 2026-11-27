const { chromium } = require('playwright');
// shortcut: uses the installed Chrome when Playwright's own browser cache is missing; run `npx playwright install` to go back to the bundled one
const CHROME = process.env.CHROME || (require('fs').existsSync('/Applications/Google Chrome 2.app') ? '/Applications/Google Chrome 2.app/Contents/MacOS/Google Chrome' : undefined);
 const http=require('http'),fs=require('fs'),path=require('path');
const srv=http.createServer((q,r)=>{fs.readFile(path.join(__dirname,decodeURIComponent(q.url.split('?')[0])),(e,d)=>{if(e){r.writeHead(404);r.end();return;}r.writeHead(200,{'Content-Type':q.url.endsWith('.js')?'text/javascript':q.url.endsWith('.html')?'text/html':q.url.endsWith('.json')?'application/json':'application/octet-stream'});r.end(d);});});
(async()=>{await new Promise(r=>srv.listen(0,r));const b=await chromium.launch({executablePath:CHROME,args:['--use-gl=angle','--use-angle=metal','--ignore-gpu-blocklist']});const p=await b.newPage();
await p.goto(`http://localhost:${srv.address().port}/index.html`,{timeout:120000});await p.waitForFunction('window.READY===true',null,{timeout:120000});
const caps=await p.evaluate(()=>{const o=[];const NF=Math.round(window.TIMELINE.DUR*30);for(let i=0;i<NF;i++)o.push([window.captionText(i/30),window.hookText(i/30)]);return o;});
fs.writeFileSync(path.join(__dirname,'captions_per_frame.json'),JSON.stringify(caps));await b.close();srv.close();})();
