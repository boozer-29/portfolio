const { chromium } = require('playwright'); const http=require('http'),fs=require('fs'),path=require('path');
const srv=http.createServer((q,r)=>{fs.readFile(path.join(__dirname,decodeURIComponent(q.url.split('?')[0])),(e,d)=>{if(e){r.writeHead(404);r.end();return;}r.writeHead(200,{'Content-Type':q.url.endsWith('.js')?'text/javascript':q.url.endsWith('.html')?'text/html':q.url.endsWith('.json')?'application/json':'application/octet-stream'});r.end(d);});});
(async()=>{await new Promise(r=>srv.listen(0,r));const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage();
await p.goto(`http://localhost:${srv.address().port}/index.html`);await p.waitForFunction('window.READY===true');
const caps=await p.evaluate(()=>{const o=[];for(let i=0;i<1656;i++)o.push([window.captionText(i/30),window.hookText(i/30)]);return o;});
fs.writeFileSync(path.join(__dirname,'captions_per_frame.json'),JSON.stringify(caps));await b.close();srv.close();})();
