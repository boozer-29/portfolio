const { chromium } = require('playwright'); const http=require('http'),fs=require('fs'),path=require('path');
const types={'.html':'text/html','.js':'text/javascript','.json':'application/json','.woff2':'font/woff2'};
const srv=http.createServer((q,r)=>{const f=path.join(__dirname,decodeURIComponent(q.url.split('?')[0]));fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return;}r.writeHead(200,{'Content-Type':types[path.extname(f)]||'application/octet-stream'});r.end(d);});});
(async()=>{await new Promise(r=>srv.listen(0,r));const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage();
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto(`http://localhost:${srv.address().port}/pfp.html`); fs.mkdirSync(path.join(__dirname,'banner'),{recursive:true});
for (const [n,o] of [['banner',{}],['banner_guides',{guides:true}]]) { const d=await p.evaluate(o=>window.renderBanner(o),o); fs.writeFileSync(path.join(__dirname,'banner',n+'.png'),Buffer.from(d.split(',')[1],'base64')); console.log('ok',n); }
await b.close();srv.close();})();
