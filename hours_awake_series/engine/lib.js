// ============ LIB: engine utilities ============
const cv=document.getElementById('c');let ctx=cv.getContext('2d');const MAINCTX=ctx;
const W=540,H=960;
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),lerp=(a,b,x)=>a+(b-a)*x,pr=(t,a,b)=>clamp((t-a)/(b-a));
const EZ={io:x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2,o3:x=>1-Math.pow(1-x,3),i3:x=>x*x*x,o2:x=>1-(1-x)*(1-x),i2:x=>x*x,ob:x=>{const c1=1.70158,c3=c1+1;return 1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2)},oe:x=>x<=0?0:x>=1?1:Math.pow(2,-10*x)*Math.sin((x*10-.75)*(2*Math.PI)/3)+1,ss:x=>x*x*(3-2*x)};
function mul(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const hash=n=>{n=Math.sin(n*127.1+311.7)*43758.5453;return n-Math.floor(n)};
function vn(x,seed=0){const i=Math.floor(x),f=x-i,a=hash(i+seed*17.3),b=hash(i+1+seed*17.3);const u=f*f*(3-2*f);return a+(b-a)*u}   // 0..1 smooth noise
function hand(t,amp=1,seed=0){return{x:(vn(t*1.7,seed)-.5)*5*amp+(vn(t*5.3,seed+3)-.5)*1.6*amp,y:(vn(t*1.3,seed+1)-.5)*5*amp+(vn(t*4.1,seed+4)-.5)*1.4*amp,rot:(vn(t*1.1,seed+2)-.5)*.9*amp}}
// colors
function h2r(h){if(h[0]==='r'){const m=h.match(/[\d.]+/g);return[+m[0],+m[1],+m[2]]}const n=parseInt(h.slice(1),16);return[n>>16,n>>8&255,n&255]}
function rgba(h,a){const[r,g,b]=h2r(h);return`rgba(${r},${g},${b},${a})`}
function shade(h,a){const[r,g,b]=h2r(h);const f=v=>Math.round(clamp(a>=0?v+(255-v)*a:v*(1+a),0,255));return`rgb(${f(r)},${f(g)},${f(b)})`}
function mixc(a,b,t){const A=h2r(a),B=h2r(b);return`rgb(${Math.round(lerp(A[0],B[0],t))},${Math.round(lerp(A[1],B[1],t))},${Math.round(lerp(A[2],B[2],t))})`}
const C={navy:'#0B1F3A',navy2:'#16314F',deep:'#0A0D16',lime:'#C8E234',red:'#E5383B',amb:'#F2A93B',must:'#EAB308',skin:'#C9CED6',eye:'#E6F7FF',white:'#F4F4EF',cold:'#6fb8ff'};
// shapes
function rr(x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r)}
function blk(x,y,w,h,r,c,o={}){ // flat-shaded block: top highlight, bottom shade (no gradients)
  ctx.save();rr(x,y,w,h,r);ctx.fillStyle=c;ctx.fill();ctx.clip();
  ctx.fillStyle=shade(c,o.hi??.2);ctx.fillRect(x,y,w,Math.max(1.5,h*(o.hh??.14)));
  ctx.fillStyle=shade(c,o.lo??-.26);ctx.fillRect(x,y+h*(1-(o.lh??.2)),w,h*(o.lh??.2));
  if(o.rim){ctx.fillStyle=rgba(o.rim,o.ra??.55);const rw=Math.max(1.2,w*.08);ctx.fillRect(o.side<0?x:x+w-rw,y,rw,h)}
  ctx.restore()}
function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(x,y,w,h)}
function circ(x,y,r,c){ctx.fillStyle=c;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill()}
function glow(x,y,r,col,a=1,mode='lighter'){ctx.save();ctx.globalCompositeOperation=mode;const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,rgba(col,a));g.addColorStop(.35,rgba(col,a*.4));g.addColorStop(1,rgba(col,0));ctx.fillStyle=g;ctx.fillRect(x-r,y-r,2*r,2*r);ctx.restore()}
function shadowE(x,y,rx,ry,a=.4){ctx.save();ctx.translate(x,y);ctx.scale(1,ry/rx);const g=ctx.createRadialGradient(0,0,0,0,0,rx);g.addColorStop(0,`rgba(0,0,0,${a})`);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,rx,0,7);ctx.fill();ctx.restore()}
function beam(x,y,ang,len,spread,col,a=.3){ctx.save();ctx.globalCompositeOperation='lighter';const dx=Math.cos(ang),dy=Math.sin(ang),nx=-dy,ny=dx;const g=ctx.createLinearGradient(x,y,x+dx*len,y+dy*len);g.addColorStop(0,rgba(col,a));g.addColorStop(1,rgba(col,0));ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+dx*len+nx*spread,y+dy*len+ny*spread);ctx.lineTo(x+dx*len-nx*spread,y+dy*len-ny*spread);ctx.closePath();ctx.fill();ctx.restore()}
function vgrad(y0,y1,stops,x=-300,w=W+600){const g=ctx.createLinearGradient(0,y0,0,y1);stops.forEach(([o,c])=>g.addColorStop(o,c));ctx.fillStyle=g;ctx.fillRect(x,y0,w,y1-y0)}
function dust(t,x,y,w,h,n,seed,col='#ffffff',a=.5,sp=1){const r=mul(seed);ctx.save();ctx.globalCompositeOperation='lighter';for(let i=0;i<n;i++){const px=x+((r()*w+Math.sin(t*.4*sp+i*1.7)*10+t*3*sp*r())%w),py=y+((r()*h-t*5*sp*(.3+r()))%h+h)%h;const tw=.4+.6*Math.abs(Math.sin(t*.9+i));ctx.fillStyle=rgba(col,a*tw*(.3+r()*.7));ctx.beginPath();ctx.arc(px,py,.5+r()*1.3,0,7);ctx.fill()}ctx.restore()}
function fog(t,y,h,col,a,seed=1){ctx.save();for(let i=0;i<4;i++){const ox=(t*(4+i*2)*(i%2?-1:1)+i*140)%(W+400)-200;const g=ctx.createRadialGradient(ox,y+h*.5,0,ox,y+h*.5,260+i*40);g.addColorStop(0,rgba(col,a));g.addColorStop(1,rgba(col,0));ctx.fillStyle=g;ctx.save();ctx.translate(0,y+h*.5);ctx.scale(1,h/520);ctx.translate(0,-(y+h*.5));ctx.fillRect(ox-340,y-100,680,h+200);ctx.restore()}ctx.restore()}
// camera: c={x,y,z,rot}; par = parallax weight of the layer
function view(c,par,fn){ctx.save();ctx.translate(270,480);ctx.rotate((c.rot||0)*Math.PI/180*Math.min(1,par));const z=Math.pow(c.z||1,par);ctx.scale(z,z);ctx.translate(-270-(c.x||0)*par,-480-(c.y||0)*par);fn();ctx.restore()}
function cam(p,o){const e=EZ.io(clamp(p));return{x:lerp(o.x0||0,o.x1||0,e),y:lerp(o.y0||0,o.y1||0,e),z:lerp(o.z0||1,o.z1||1,e),rot:lerp(o.r0||0,o.r1||0,e)}}
function shakeCam(c,t,amp=1,seed=0){const h=hand(t,amp,seed);return{x:(c.x||0)+h.x,y:(c.y||0)+h.y,z:c.z,rot:(c.rot||0)+h.rot}}
// offscreen sprite cache: draw once at 2x, blit many times (crowds)
const SPR={};
function sprite(key,w,h,draw,sc=2){if(SPR[key])return SPR[key];const o=document.createElement('canvas');o.width=w*sc;o.height=h*sc;const oc=o.getContext('2d');const saved=ctx;ctx=oc;ctx.scale(sc,sc);ctx.translate(w/2,h*.95);try{draw()}finally{ctx=saved}SPR[key]={cv:o,w,h};return SPR[key]}
function blit(s,x,y,scale=1,flip=1,alpha=1){ctx.save();ctx.translate(x,y);ctx.scale(scale*flip,scale);ctx.globalAlpha=alpha;ctx.drawImage(s.cv,-s.w/2,-s.h*.95,s.w,s.h);ctx.restore()}

// compat aliases used by HUD/captions
const eio=EZ.io,eob=EZ.ob,RED=C.red,AMB=C.amb,LIME=C.lime,MUST=C.must,DEEP=C.deep,NAVY=C.navy,NAVY2=C.navy2,SKIN=C.skin;
