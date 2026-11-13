const { chromium } = require('playwright'); const http=require('http'),fs=require('fs'),path=require('path');
const types={'.html':'text/html','.js':'text/javascript'};
const srv=http.createServer((q,r)=>{const f=path.join(__dirname,decodeURIComponent(q.url.split('?')[0]));fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return;}r.writeHead(200,{'Content-Type':types[path.extname(f)]||'application/octet-stream'});r.end(d);});});
(async()=>{await new Promise(r=>srv.listen(0,r));const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage();
p.on('pageerror',e=>console.log('ERR',e.message)); await p.goto(`http://localhost:${srv.address().port}/gy.html`); await p.waitForFunction('window.READY===true');
const dir=path.join(__dirname,process.argv[2]); fs.mkdirSync(dir,{recursive:true});
const times = process.argv.slice(3).length ? process.argv.slice(3).map(Number) : [...Array(198).keys()].map(i=>i/30);
for(const t of times){const d=await p.evaluate(t=>window.renderFrame(t),t); fs.writeFileSync(path.join(dir, process.argv.slice(3).length?`t${t}.jpg`:String(Math.round(t*30)).padStart(5,'0')+'.jpg'),Buffer.from(d.split(',')[1],'base64'));}
await b.close();srv.close();})();
