const { chromium } = require('playwright'); const http=require('http'),fs=require('fs'),path=require('path');
const types={'.html':'text/html','.js':'text/javascript','.json':'application/json','.woff2':'font/woff2'};
const srv=http.createServer((q,r)=>{const f=path.join(__dirname,decodeURIComponent(q.url.split('?')[0]));fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return;}r.writeHead(200,{'Content-Type':types[path.extname(f)]||'application/octet-stream'});r.end(d);});});
const BG=['#4a3cff','#2a1fb8','#0c0838'];
const V=[
 {name:'X2b', bg:BG, x2:[0.70,0.33,640,-0.12], fov:31, cam:[0.75,1.95,4.6], look:[0.42,1.9,0],
  heroes:[{pos:[0,0,0], expr:'shock', rotY:0.3, hx:-0.06, hy:-0.12, hz:0.06}]},
 {name:'TWINb', bg:BG, fov:36, cam:[0.5,2.4,9.2], look:[0.35,2.35,0], badge:[0.26,0.25],
  heroes:[{pos:[-0.75,0,0.6], s:1, expr:'shock', rotY:0.5, hx:-0.15, hy:0.35}, {pos:[0.95,-0.6,-0.4], s:1.85, expr:'smirk', rotY:-0.25, hy:-0.2, hz:-0.05}]},
];
(async()=>{await new Promise(r=>srv.listen(0,r));const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage();
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto(`http://localhost:${srv.address().port}/pfp.html`);
fs.mkdirSync(path.join(__dirname,'pfp2'),{recursive:true});
for(const v of V){const d=await p.evaluate(v=>window.renderPfp2(v),v);fs.writeFileSync(path.join(__dirname,'pfp2',`pfp_${v.name}.png`),Buffer.from(d.split(',')[1],'base64'));console.log('ok',v.name);}
await b.close();srv.close();})();
