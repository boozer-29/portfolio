const { chromium } = require('playwright'); const http=require('http'),fs=require('fs'),path=require('path');
const types={'.html':'text/html','.js':'text/javascript','.json':'application/json','.woff2':'font/woff2'};
const srv=http.createServer((q,r)=>{const f=path.join(__dirname,decodeURIComponent(q.url.split('?')[0]));fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return;}r.writeHead(200,{'Content-Type':types[path.extname(f)]||'application/octet-stream'});r.end(d);});});
const V=[
 {name:'A', expr:'smug', rotY:0.28, headX:-0.05, headY:-0.12, headZ:0.06, fov:30, cam:[0.9,2.05,4.1], look:[0.05,2.05,0], sunX:0.68, sunY:0.30, hearts:[[0.18,0.2,26],[0.86,0.66,18]], pill:[0.8,0.82]},
 {name:'B', expr:'smirk', rotY:-0.3, headX:-0.08, headY:0.15, headZ:-0.05, fov:30, cam:[-0.8,1.95,4.0], look:[0,2.0,0], sunX:0.3, sunY:0.3, hearts:[[0.82,0.2,24]], pill:null, guns:true},
 {name:'C', expr:'wink', rotY:0.2, headX:-0.04, headY:-0.1, headZ:0.08, fov:28, cam:[0.6,2.1,4.3], look:[0,2.05,0], sunX:0.5, sunY:0.36, hearts:[[0.17,0.24,24],[0.84,0.22,20],[0.82,0.72,16]], pill:null},
];
(async()=>{await new Promise(r=>srv.listen(0,r));const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage();
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto(`http://localhost:${srv.address().port}/pfp.html`);
fs.mkdirSync(path.join(__dirname,'pfp'),{recursive:true});
for(const v of V){const d=await p.evaluate(v=>window.renderPfp(v),v);fs.writeFileSync(path.join(__dirname,'pfp',`pfp_${v.name}.png`),Buffer.from(d.split(',')[1],'base64'));console.log('ok',v.name);}
await b.close();srv.close();})();
