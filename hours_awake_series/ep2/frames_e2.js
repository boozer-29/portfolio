const {chromium}=require('playwright');const fs=require('fs');
const [,, mode, a, b, w, nw]=process.argv; // mode: still t1,t2,... | range start end worker nworkers
(async()=>{const br=await chromium.launch();const p=await br.newPage({viewport:{width:540,height:960}});await p.goto('http://localhost:8770/index.html');await p.evaluate(()=>window.ready);
const grab=async t=>{const d=await p.evaluate(t=>{renderAt(t);return document.getElementById('c').toDataURL('image/jpeg',0.93)},t);return Buffer.from(d.split(',')[1],'base64')};
if(mode==='still'){for(const t of a.split(',')){fs.writeFileSync(`e2/stills/s_${t}.jpg`,await grab(+t))}}
else{const s=+a,e=+b,W=+w,NW=+nw;for(let f=s+W;f<e;f+=NW){fs.writeFileSync(`e2/frames/f_${String(f).padStart(5,'0')}.jpg`,await grab(f/30))}}
await br.close()})()
