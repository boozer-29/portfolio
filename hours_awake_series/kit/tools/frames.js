// usage: node tools/frames.js episodes/epN PORT still 1.0,2.5     |  node tools/frames.js episodes/epN PORT range START END WORKER NWORKERS
// prints every pose-QA flag raised while rendering (crossed arms, stretched limbs, missed contacts ...)
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const [,, ep, port, mode, a, b, w, nw]=process.argv;
(async()=>{const br=await chromium.launch();const p=await br.newPage({viewport:{width:540,height:960}});p.on('pageerror',e=>console.log('ERR',e.message));await p.goto(`http://localhost:${port}/index.html`);await p.evaluate(()=>window.ready);
const grab=async t=>p.evaluate(t=>{QA.length=0;renderAt(t);return [document.getElementById('c').toDataURL('image/jpeg',0.93),QA.slice()]},t);const qa=[];
if(mode==='still'){for(const t of a.split(',')){const [d,q]=await grab(+t);fs.writeFileSync(path.join(ep,'stills',`s_${t}.jpg`),Buffer.from(d.split(',')[1],'base64'));for(const x of q)qa.push(t+' '+x)}}
else{for(let f=+a+(+w);f<+b;f+=+nw){const [d,q]=await grab(f/30);fs.writeFileSync(path.join(ep,'frames',`f_${String(f).padStart(5,'0')}.jpg`),Buffer.from(d.split(',')[1],'base64'));for(const x of q)qa.push((f/30).toFixed(2)+' '+x)}}
console.log(qa.length?('QA FLAGS '+qa.length+': '+[...new Set(qa.map(x=>x.replace(/^\S+ /,'')))].slice(0,40).join(' || ')):'QA clean');await br.close()})()
