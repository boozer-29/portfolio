// ============ EPISODE 2 (v2 narration): scenes E ============
function TOD(t){const a=CU.tod;return t<a[0]?0:t<a[1]?EZ.io(pr(t,a[0],a[1]))*.78:.78}
function bangAmp(t,list,A=1){let s=0;for(const h of list){const a=t-h;if(a>0&&a<.5)s+=Math.exp(-a*13)*Math.sin(a*75)*A}return s}
function lastHit(t,list){let l=-9;for(const h of list)if(h<=t)l=Math.max(l,h);return l}
function cb(x,y,w=44,h=24,rot=0){ctx.save();ctx.translate(x+w/2,y+h/2);ctx.rotate(rot);blk(-w/2,-h/2,w,h,3,'#9a9ea9',{hi:.22});ctx.fillStyle='#4c505c';ctx.fillRect(-w*.3,-h*.22,w*.18,h*.44);ctx.fillRect(w*.12,-h*.22,w*.18,h*.44);ctx.restore()}
function plankDraw(x0,y0,x1,y1,w=16){limbT([x0,y0],[x1,y1],w,w,'#8a6a40');limbT([x0,y0],[x1,y1],w*.18,w*.18,'#5a4023');const dx=x1-x0,dy=y1-y0,d=Math.hypot(dx,dy)||1;ctx.fillStyle='#b48d58';ctx.beginPath();ctx.arc(x0,y0,w*.5,0,7);ctx.fill();ctx.beginPath();ctx.arc(x1,y1,w*.5,0,7);ctx.fill()}
// roof door (world coords): swing 0 closed..1 open, shk = bang offset, brace 0..4 (blocks 1-3, plank 4)
function roofDoor(o,t,tod){const sw=o.swing||0;ctx.save();
  if(sw>.001){ctx.fillStyle='#04070e';ctx.fillRect(60,468,76,132);glow(98,540,110,'#cfe3ff',.35*sw);const w=Math.max(5,76*(1-sw*.92));ctx.fillStyle='#3a4258';ctx.beginPath();ctx.moveTo(60,468);ctx.lineTo(60+w,464-sw*8);ctx.lineTo(60+w,604+sw*8);ctx.lineTo(60,600);ctx.fill();ctx.fillStyle='rgba(255,255,255,.14)';ctx.fillRect(60,468,w,3)}
  else{ctx.translate(o.shk||0,0);blk(60,468,76,132,3,'#3a4258',{hi:.18});if(!o.noWin){ctx.fillStyle='#0a1222';ctx.fillRect(86,484,24,22);glow(98,495,40,o.hum?'#E6F7FF':C.amb,.3+.4*(o.hum||0))}blk(122,534,8,10,2,'#c9ccd6')}
  ctx.restore();
  const b=o.brace||0;if(b>0){const bs=(k)=>EZ.ob(clamp(b-k));
    if(b>=4-.001||o.plank!==undefined){const q=o.plank===undefined?EZ.o3(clamp(b-3)):o.plank;plankDraw(126,484,lerp(300,178,q),lerp(560,590,q),9)}
    for(const [k,x,y] of[[0,170,588],[1,198,588],[2,184,572]])if(b>k){const q=bs(k);cb(x,y-(1-q)*30,26,14)}}}
// ---------- stairs: running (solo) + echo rings
function echoRings(t,k,col){ // one ring per footfall + echoes travelling up the stairwell
  const base=(n)=>(n*Math.PI-k)/13;const n0=Math.floor((t*13+k)/Math.PI);
  for(let n=n0;n>n0-6;n--){const ts=base(n);const sd=(n%2)?-1:1;
    for(let e=0;e<4;e++){const te=ts+e*.2;const a=t-te;if(a<0||a>.75)continue;const fall=1-a/.75;const y=905-e*92,x=270+sd*30*(1-e*.2);const sc=1-e*.17;ctx.strokeStyle=`rgba(${col},${(.62-e*.12)*fall})`;ctx.lineWidth=(4-e*.7);ctx.beginPath();ctx.ellipse(x,y,(34+a*260)*sc,(10+a*64)*sc,0,0,7);ctx.stroke()}}}
SC.stair_echo=(t,u,d)=>{const p=u/d;vgrad(0,H,[[0,'#06090f'],[1,'#0e1626']]);const vx=270,vy=250,ph=(t*1.7)%1;
  glow(vx,vy,260,'#cfe3ff',.4);rect(vx-26,vy-34,52,60,'#e8f2ff');
  ctx.fillStyle='#10192d';ctx.beginPath();ctx.moveTo(-60,-60);ctx.lineTo(vx-60,vy-40);ctx.lineTo(vx-60,vy+70);ctx.lineTo(-60,1040);ctx.fill();ctx.beginPath();ctx.moveTo(600,-60);ctx.lineTo(vx+60,vy-40);ctx.lineTo(vx+60,vy+70);ctx.lineTo(600,1040);ctx.fill();ctx.fillStyle='#0a1222';ctx.beginPath();ctx.moveTo(-60,-60);ctx.lineTo(600,-60);ctx.lineTo(vx+60,vy-40);ctx.lineTo(vx-60,vy-40);ctx.fill();
  for(let k=0;k<11;k++){const dd=((k/11)+(1-ph)/11)%1;const e=Math.pow(dd,2.3);const y=vy+70+e*820,w=lerp(120,760,e),hh=lerp(6,60,e);ctx.fillStyle=mixc('#2a3a5a','#3d5280',e);ctx.fillRect(vx-w/2,y,w,hh);ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(vx-w/2,y+hh,w,hh*.8);ctx.fillStyle='rgba(255,255,255,.12)';ctx.fillRect(vx-w/2,y,w,Math.max(1,hh*.12))}
  ctx.strokeStyle='#5a6a8a';ctx.lineWidth=6;for(const sd of[-1,1]){ctx.beginPath();ctx.moveTo(vx+sd*70,vy+80);ctx.lineTo(vx+sd*330,900);ctx.stroke()}
  // wall-echo ripples (sound bouncing off both walls)
  for(const sd of[-1,1]){const n0=Math.floor((t*13+4.7)/Math.PI);for(let n=n0;n>n0-5;n--){const ts=(n*Math.PI-4.7)/13;for(let e=1;e<4;e++){const a=t-ts-e*.2;if(a<0||a>.5)continue;const fall=1-a/.5;const y=860-e*120;ctx.strokeStyle=`rgba(150,200,255,${.35*fall})`;ctx.lineWidth=3;ctx.beginPath();ctx.arc(270+sd*(220-e*45),y,20+a*90,sd>0?Math.PI*.55:-Math.PI*.55-Math.PI*.0,sd>0?Math.PI*1.45:Math.PI*.55,false);ctx.stroke()}}}
  echoRings(t,4.7,'160,215,255');
  const run=(k)=>{const q=Math.sin(t*13+k),q2=Math.sin(t*13+k+Math.PI);return{bob:-Math.abs(q)*4,hL:Math.max(0,q)*26,hR:Math.max(0,q2)*26,kL:Math.max(0,q)*55,kR:Math.max(0,q2)*55,aL:30+q*30,aR:30+q2*30,eL:50,eR:50,lean:4}};
  {const Y=you_back({x:270,y:925,s:2.5,noArms:true,pose:run(4.7)});person(Y);const sh=shoulderPts(Y,Y.pose);
   const O=ollieFront({x:322,y:820,s:1.3,noArms:true,eyes:'half',pose:{tilt:Math.sin(t*13)*3+6}});person(O);const so=shoulderPts(O,O.pose);
   armIK(so[0],[sh[1][0]-18,sh[1][1]-26],{auto:.6,out:-1,down:true,w0:15,w1:9,col:'#cc3b3b'});armIK(so[1],[sh[1][0]+30,sh[1][1]+8],{auto:.6,out:1,down:true,w0:15,w1:9,col:'#cc3b3b'})}
  ctx.fillStyle='rgba(0,0,0,.2)';ctx.fillRect(0,0,W,H)};
SC.stair_run2=(t,u,d)=>{ctx.save();const h=hand(t,1.6,61);ctx.translate(h.x*1.5,h.y*1.5);stairRun(t+2.3,u,d);ctx.restore()};
// ---------- stairwell landing: the group, front view
function landing(t,o={}){const al=o.alert||0,hush=o.hush||0,run=o.run||0;
  vgrad(0,H,[[0,'#0b1426'],[1,'#162038']]);
  // moonlit window (left) + stair flight rising behind
  blk(40,130,120,190,4,'#1a2236');ctx.fillStyle='#2b4a78';ctx.fillRect(50,140,100,170);glow(100,225,150,'#7fb0ff',.28);ctx.fillStyle='#1a2236';ctx.fillRect(98,140,4,170);ctx.fillRect(50,224,100,4);
  for(let k=0;k<9;k++){const x=150+k*44,y=700-k*40;blk(x,y,48,16,2,'#2c3c63',{hi:.18});ctx.fillStyle='#1a2540';ctx.fillRect(x,y+16,48,30)}
  ctx.strokeStyle='#5a6a8a';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(150,630);ctx.lineTo(560,230);ctx.stroke();for(let k=0;k<8;k++){ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(170+k*50,626-k*40);ctx.lineTo(170+k*50,690-k*40);ctx.stroke()}
  const fl=.8+.2*Math.sin(t*23)*(al?1:.2);glow(330,120,160,'#cfe3ff',.22*fl);rect(300,96,60,6,'#e8f2ff');
  vgrad(800,960,[[0,'#1a2540'],[1,'#0c1426']]);rect(0,796,W,3,'#2c3c63');
  // hum rising from below the floor
  if(o.hum){for(let i=0;i<4;i++){const ph=(t*1.1+i/4)%1;ctx.strokeStyle=`rgba(230,247,255,${.5*(1-ph)*o.hum})`;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(270,830,60+ph*320,14+ph*80,0,0,7);ctx.stroke()}}
  if(o.faint){for(let i=0;i<3;i++){const ph=(t*.9+i/3)%1;ctx.strokeStyle=`rgba(160,205,255,${.18*(1-ph)})`;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(270,840,50+ph*240,12+ph*60,0,0,7);ctx.stroke()}}
  const sw=(k)=>Math.sin(t*1.3+k)*(1-hush*.8);const lk=al?-1:0;
  // Reyes (front), shotgun across his chest
  {const R={x:92,y:944,s:1.5,top:'#5b6b3c',beard:'#9aa0a8',skin:'#d3a47e',hairStyle:'none',hair:'#9aa0a8',brow:1,eyes:al?'wide':'open',noArms:true,pose:{tilt:lk*2,turn:al*.4}};person(R);const sh=shoulderPts(R,R.pose);
   const g0=[R.x+30,R.y-64*R.s],g1=[R.x-34,R.y-104*R.s];gunLine([g0[0]+22,g0[1]+10],[g1[0]-24,g1[1]-12]);armIK(sh[0],[R.x-18,R.y-92*R.s],{auto:.6,out:-1,down:true,w0:26,w1:14,col:'#5b6b3c'});armIK(sh[1],[R.x+22,R.y-70*R.s],{auto:.6,out:1,down:true,w0:26,w1:14,col:'#5b6b3c'})}
  // Maya (front): tablet; finger to lips when hushing
  {const M={x:206,y:950,s:1.6,top:'#14b8a6',hairStyle:'long',hair:'#3a2a1a',mouth:hush>.5?'line':null,eyes:al?'wide':'open',noArms:true,pose:{tilt:al*-3}};person(M);const sh=shoulderPts(M,M.pose);
   const tb=[M.x-20,M.y-52*M.s];blk(tb[0]-18,tb[1]-12,36,26,5,'#0b1630',{hi:.2});glow(tb[0],tb[1],46,'#8cd5ff',.35);ctx.fillStyle='#14305a';ctx.fillRect(tb[0]-14,tb[1]-8,28,18);
   armIK(sh[0],[tb[0]-8,tb[1]+8],{auto:.6,out:-1,down:true,w0:24,w1:13,col:'#14b8a6'});
   if(hush>.5)armIK(sh[1],[M.x+6,sh[1][1]-14*M.s],{auto:.62,out:1,down:false,w0:24,w1:13,col:'#14b8a6'});else armIK(sh[1],[tb[0]+10,tb[1]+10],{auto:.6,out:1,down:true,w0:24,w1:13,col:'#14b8a6'})}
  // DJ (front) with radio in hand
  {const D={x:322,y:952,s:1.6,top:'#a855f7',hood:true,phones:true,hairStyle:'none',eyes:al?'wide':'open',noArms:true,pose:{tilt:al*3}};person(D);const sh=shoulderPts(D,D.pose);
   const rx=D.x-34,ry=D.y-56*D.s;blk(rx,ry,68,34,6,'#2b2f3a',{hi:.2});ctx.fillStyle='#06110b';ctx.fillRect(rx+6,ry+6,26,18);circ(rx+50,ry+16,7,'#111');
   armIK(sh[0],[rx+10,ry+30],{auto:.6,out:-1,down:true,w0:24,w1:13,col:'#a855f7'});armIK(sh[1],[rx+52,ry+10],{auto:.6,out:1,down:true,w0:24,w1:13,col:'#a855f7'})}
  // you (back) with Ollie over your shoulder
  {const Y=you_back({x:448,y:966,s:1.85,noArms:true,pose:{tilt:al*-2}});person(Y);const sh=shoulderPts(Y,Y.pose);
   const O=ollieFront({x:470,y:900,s:1.0,noArms:true,eyes:hush?'half':al?'wide':'half',pose:{tilt:6}});person(O);const so=shoulderPts(O,O.pose);
   armIK(so[0],[sh[1][0]-14,sh[1][1]-20],{auto:.6,out:-1,down:true,w0:12,w1:8,col:'#cc3b3b'});armIK(so[1],[sh[1][0]+22,sh[1][1]+6],{auto:.6,out:1,down:true,w0:12,w1:8,col:'#cc3b3b'})}
  dust(t,0,100,W,700,14,17,'#9fb4d8',.18,.4);const vg=ctx.createRadialGradient(270,560,160,270,560,640);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.45)');ctx.fillStyle=vg;ctx.fillRect(0,0,W,H)}
SC.landing_hush=(t,u,d)=>{const p=u/d;ctx.save();const z=1+.05*EZ.io(p);ctx.translate(270,700);ctx.scale(z,z);ctx.translate(-270,-700);landing(t,{hush:1,faint:true,alert:.3*p});ctx.restore()};
SC.landing_hum=(t,u,d)=>{const p=u/d;const a=EZ.io(pr(p,.15,.45));const hs=CU.lines.d3.s;ctx.save();const h=hand(t,.8*a,70);ctx.translate(h.x*1.2,h.y*1.2);landing(t,{alert:a,hum:Math.min(1,a*1.2)});ctx.restore()};
// ---------- looking down the stairwell shaft (no sleepers): glass + hum
function shaftView(t,o={}){vgrad(0,H,[[0,'#050810'],[1,'#0a1020']]);const cx=270,cy=500,z=o.zoom||1,hum=o.hum||0,g=o.glassT;
  for(let i=11;i>=0;i--){const k=i/11;const sz=lerp(38,720,Math.pow(1-k,1.25))*z;const pl=hum?(.5+.5*Math.sin(t*9-i*.8)):0;const col=mixc(mixc('#0a1222','#2a3a5c',1-k),'#5f92d6',pl*.22*hum);
    ctx.fillStyle=col;ctx.fillRect(cx-sz/2,cy-sz/2,sz,sz);ctx.fillStyle=mixc('#05080f','#10192d',1-k);const inn=sz*.58;ctx.fillRect(cx-inn/2,cy-inn/2,inn,inn);
    ctx.strokeStyle=`rgba(140,170,220,${.1+.3*(1-k)+pl*.3*hum})`;ctx.lineWidth=Math.max(1.5,sz*.012);ctx.strokeRect(cx-sz/2,cy-sz/2,sz,sz);ctx.strokeRect(cx-inn/2,cy-inn/2,inn,inn);
    const sd=i%4;ctx.strokeStyle=`rgba(120,150,200,${.12+.22*(1-k)})`;ctx.lineWidth=Math.max(1,sz*.006);for(let s=1;s<5;s++){const f=s/5;let ax,ay,bx,by;const lo=sz/2,li=inn/2;if(sd===0){ax=cx-lo+f*sz;ay=cy-lo;bx=cx-li+f*inn;by=cy-li}else if(sd===1){ax=cx+lo;ay=cy-lo+f*sz;bx=cx+li;by=cy-li+f*inn}else if(sd===2){ax=cx+lo-f*sz;ay=cy+lo;bx=cx+li-f*inn;by=cy+li}else{ax=cx-lo;ay=cy+lo-f*sz;bx=cx-li;by=cy+li-f*inn}ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);ctx.stroke()}}
  // the ground-floor window far below
  const ww=36*z,wh=28*z,wx=cx-ww/2,wy=cy+10*z;const age=g===undefined?-9:t-g;
  if(g!==undefined&&age<0||g===undefined){ctx.fillStyle='#8fb6e8';ctx.fillRect(wx,wy,ww,wh);glow(cx,wy+wh/2,70*z,'#9cc4ff',.45);ctx.fillStyle='#1a2236';ctx.fillRect(cx-1,wy,2,wh);ctx.fillRect(wx,wy+wh/2-1,ww,2)}
  if(g!==undefined&&age>=-.24&&age<0){ctx.strokeStyle='#fff';ctx.lineWidth=1.4;const r=mul(4);for(let i=0;i<9;i++){const a=r()*6.28;ctx.beginPath();ctx.moveTo(cx,wy+wh/2);ctx.lineTo(cx+Math.cos(a)*ww*.7*(1+age*-2),wy+wh/2+Math.sin(a)*wh*.7)}ctx.stroke()}
  if(g!==undefined&&age>=0){const r=mul(17);ctx.save();for(let i=0;i<46;i++){const a=r()*6.283,v=70+r()*320,sp=r()*8-4;const px=cx+Math.cos(a)*v*age*z*.7,py=wy+wh/2+Math.sin(a)*v*age*z*.7+age*age*120;const al=Math.max(0,1-age/1.1);ctx.save();ctx.translate(px,py);ctx.rotate(sp*age);ctx.fillStyle=`rgba(200,225,255,${al})`;ctx.beginPath();ctx.moveTo(0,-7*z);ctx.lineTo(4*z,5*z);ctx.lineTo(-5*z,3*z);ctx.fill();ctx.restore()}ctx.restore();glow(cx,wy+wh/2,260*z,'#bcdcff',.6*Math.max(0,1-age/.5));if(age<.1){ctx.fillStyle=`rgba(255,255,255,${.5*(1-age/.1)})`;ctx.fillRect(0,0,W,H)}}
  if(hum){for(let i=0;i<4;i++){const ph=(t*.9+i/4)%1;ctx.strokeStyle=`rgba(230,247,255,${.45*(1-ph)*hum})`;ctx.lineWidth=2.5;const s=(40+ph*300)*z;ctx.strokeRect(cx-s/2,cy-s/2,s,s)}dust(t*2,0,100,W,800,26,19,'#aac4ea',.3,2)}
  blk(-20,928,W+40,22,6,'#3a4258',{hi:.25});rect(-20,924,W+40,5,'#5a6a8a');for(const sd of[-1,1]){const Hd=[270+sd*110,918],S=[270+sd*290,1130];armIK(S,Hd,{auto:.55,out:sd,down:true,w0:96,w1:56,col:C.must})}
  const vg=ctx.createRadialGradient(270,520,100,270,520,620);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.55)');ctx.fillStyle=vg;ctx.fillRect(0,0,W,H)}
SC.shaft_glass=(t,u,d)=>{const p=u/d;ctx.save();const c=shakeCam({x:0,y:0},t,.6,66);ctx.translate(c.x*2,c.y*2);shaftView(t,{zoom:lerp(1,1.25,EZ.io(p)),glassT:CU.glassT});ctx.restore()};
SC.stair_hum=(t,u,d)=>{const p=u/d;ctx.save();const c=shakeCam({x:0,y:0},t,1.6,67);ctx.translate(c.x*2,c.y*2);shaftView(t,{zoom:lerp(1.1,1.3,EZ.io(p)),hum:Math.min(1,.5+p)});ctx.restore()};
// ---------- the roof: door slam, items, jamming, braced door
SC.roof_door=(t,u,d)=>{const p=u/d;const hs=CU.slamT;let c=cam(p,{z0:1.1,z1:1.04,x0:-70,x1:-54,y0:60,y1:48});c=shakeCam(c,t,.5,71);
  const sw=1-EZ.i3(pr(t,hs-.7,hs));const shk=t>hs?Math.sin((t-hs)*60)*5*Math.exp(-(t-hs)*14):0;
  roofWorld(t,c,{swing:sw,shk,lamp:true,hum:t>hs?.5:0});
  view(c,1,()=>{survivors(t,{noReyes:true,alert:1,ollieEyes:'wide'});
    // Reyes shoves the door shut: back to us, both hands flat on it (his one pair of arms)
    const R={x:128,y:716,s:1.75,top:'#5b6b3c',back:true,hairStyle:'none',hair:'#9aa0a8',noArms:true,pose:{lean:6*(1-sw)}};person(R);const sh=shoulderPts(R,R.pose);const dx=Math.min(1,sw*1);
    armIK(sh[0],[96+shk,548],{auto:.62,out:-1,down:false,w0:28,w1:15,col:'#5b6b3c'});armIK(sh[1],[118+shk,566],{auto:.62,out:1,down:false,w0:30,w1:15,col:'#5b6b3c'});
    gunLine([R.x+40,R.y-60],[R.x+90,R.y+10]);
    if(t>hs&&t<hs+.5){ctx.save();ctx.globalCompositeOperation='lighter';for(let i=0;i<14;i++){const a=i/14*6.28,r=(t-hs)*180;ctx.fillStyle=`rgba(255,235,200,${.5*(1-(t-hs)/.5)})`;ctx.fillRect(98+Math.cos(a)*r*1.1,590+Math.sin(a)*r*.5-10,4,4)}ctx.restore()}});
  if(t>hs&&t<hs+.14){ctx.fillStyle=`rgba(255,255,255,${.22*(1-(t-hs)/.14)})`;ctx.fillRect(0,0,W,H)}};
function itemPulse(t,t0,x,y,r){const a=t-t0;if(a<0||a>1)return;const k=Math.min(1,a/.25)*(1-pr(a,.6,1));ctx.strokeStyle=`rgba(255,235,170,${.8*k})`;ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,r*(1+.25*(1-Math.min(1,a/.3))),0,7);ctx.stroke()}
SC.roof_items=(t,u,d)=>{const p=u/d;let c=cam(p,{z0:1.02,z1:1.16,x0:-10,x1:-82,y0:10,y1:-8});c=shakeCam(c,t,.4,72);
  roofWorld(t,c,{lamp:true,hum:.3,shk:bangAmp(t,CU.bangs,3)});
  view(c,.9,()=>{ // cinder blocks stacked mid-roof, scaffold plank leaning on the AC unit
    const o=.5;cb(300,672,48,26);cb(352,672,48,26);cb(404,672,48,26);cb(326,646,48,26);cb(378,646,48,26);cb(352,620,48,26);ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(376,700,92,10,0,0,7);ctx.fill();
    plankDraw(486,676,540,520,20);plankDraw(500,680,556,524,20);for(let i=0;i<6;i++){const k=i/6;ctx.fillStyle='rgba(0,0,0,.18)';ctx.fillRect(lerp(494,544,k)-6,lerp(676,524,k),12,3)}
    itemPulse(t,CU.lines.f1.s+1.24,376,646,92);itemPulse(t,CU.lines.f1.s+2.2,520,600,80)});
  view(c,1,()=>{survivors(t,{alert:.4,noReyes:false})})};
SC.jam_door=(t,u,d)=>{const p=u/d;const t0=CU.lines.f2.s;let c=cam(p,{z0:1.45,z1:1.55,x0:-160,x1:-150,y0:58,y1:50});c=shakeCam(c,t,.6,73);
  const b=1+2*pr(t,t0+.35,t0+.95)+pr(t,t0+1.0,t0+1.45);
  roofWorld(t,c,{lamp:true,hum:.3,shk:bangAmp(t,CU.bangs,3),brace:Math.min(4,b)});
  view(c,1,()=>{ // Reyes + you heave the blocks and plank into place (one pair of arms each)
    const R={x:128,y:716,s:1.75,top:'#5b6b3c',back:true,hairStyle:'none',hair:'#9aa0a8',noArms:true,pose:{lean:4+Math.sin(t*9)*2}};person(R);const sh=shoulderPts(R,R.pose);
    armIK(sh[0],[132,560],{auto:.62,out:-1,down:false,w0:28,w1:15,col:'#5b6b3c'});armIK(sh[1],[160,580],{auto:.62,out:1,down:false,w0:30,w1:15,col:'#5b6b3c'});
    if(b<4)cb(150+Math.sin(t*9)*2,566+Math.sin(t*9)*3,30,16,.15)});
  if(t>t0+1.1&&t<t0+1.3){ctx.fillStyle='rgba(255,255,255,.07)';ctx.fillRect(0,0,W,H)}};
// ---------- the door (stairwell side), braced
function doorScene(t,u,d,o){const p=u/d;const hum=o.hum||0;let c=cam(p,{z0:o.z0||1.05,z1:o.z1||1.16});c=shakeCam(c,t,o.shake??1.2,54);vgrad(0,H,[[0,'#0a1020'],[1,'#10192d']]);
  view(c,1,()=>{const dxb=o.hits?bangAmp(t,o.hits,o.A||11):0;const lh=o.hits?lastHit(t,o.hits):-9;
    blk(40,120,460,760,10,'#1d2840',{hi:.08});ctx.fillStyle='rgba(0,0,0,.12)';for(let i=0;i<9;i++)ctx.fillRect(40,150+i*80,460,2);
    ctx.save();ctx.translate(dxb,0);blk(120,200,300,680,8,'#3b4560',{hi:.16});ctx.fillStyle='#2e384e';rr(146,240,248,230,8);ctx.fill();rr(146,500,248,330,8);ctx.fill();blk(150,244,240,226,6,'#323c54');ctx.fillStyle='#0a1222';rr(206,262,128,64,8);ctx.fill();glow(270,294,100,'#E6F7FF',.35*hum);blk(360,520,28,14,4,'#c9ccd6');blk(354,556,40,20,6,'#8f94a4');for(const y of[330,560,770])blk(116,y,16,34,4,'#6a7388');
    if(o.dents)for(const [x,y,r,t1] of o.dents){const q=clamp((t-t1)/.1);if(q<=0)continue;ctx.fillStyle=`rgba(0,0,0,${.3*q})`;ctx.beginPath();ctx.ellipse(x,y,r,r*.8,0,0,7);ctx.fill();ctx.strokeStyle=`rgba(10,14,24,${.85*q})`;ctx.lineWidth=3;for(let i=0;i<6;i++){const a=i/6*6.283+x;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a)*r*1.5,y+Math.sin(a)*r*1.2);ctx.stroke()}}
    ctx.restore();
    // the brace: three cinder blocks and the scaffold plank wedged diagonally
    const rip=o.rip||0;if(o.brace){ctx.save();const pk=EZ.i3(clamp((rip-.05)/.55));ctx.translate(dxb*.5,0);
      cb(300,846,76,38);cb(380,846,76,38);cb(340,808,76,38);
      ctx.save();ctx.translate(pk*340,pk*120+Math.max(0,rip-.6)*600);ctx.rotate(pk*.7);plankDraw(176,330,356,812,32);ctx.restore();ctx.restore();
      if(o.rip&&rip>.1){for(const [x,y,k] of[[300,846,1],[380,846,-1],[340,808,1.5]]){}}}
    ctx.fillStyle=`rgba(207,227,255,${.35+.2*Math.sin(t*40)*hum})`;ctx.fillRect(130,872,280,5);glow(270,880,160,'#cfe3ff',.2+.1*hum);
    if(hum){for(let i=0;i<5;i++){const ph=(t*1.0*hum+i/5)%1;ctx.strokeStyle=`rgba(230,247,255,${.6*(1-ph)*hum})`;ctx.lineWidth=3+hum;ctx.beginPath();ctx.ellipse(270,520,90+ph*320,150+ph*430,0,0,7);ctx.stroke()}}
    if(lh>0&&t-lh<.35){for(let i=0;i<18;i++){const a=t-lh;const r=mul(i*7+Math.floor(lh*10));ctx.fillStyle=`rgba(230,235,245,${.7*(1-a/.35)})`;ctx.fillRect(130+r()*280,260+r()*560+a*180,3,3)}}
    dust(t*(1+hum),90,200,360,700,24,55,'#d8e6ff',.35,1.2)});
  if(o.arms){ // Reyes' two hands (olive sleeves) wrench the plank free
    const rip=o.rip||0;const pk=EZ.i3(clamp((rip-.05)/.55));const hx=356+pk*340,hy=812+pk*120+Math.max(0,rip-.6)*600;view(c,1,()=>{armIK([300,1180],[hx-10,hy+24],{auto:.6,out:-1,down:true,w0:96,w1:46,col:'#5b6b3c',skin:'#d3a47e'});armIK([560,1180],[hx+8,hy-34],{auto:.6,out:1,down:true,w0:96,w1:46,col:'#5b6b3c',skin:'#d3a47e'})})}}
SC.door_brace=(t,u,d)=>doorScene(t,u,d,{hum:0,brace:1,hits:CU.bangs,A:12,shake:1.2});
SC.door_hum=(t,u,d)=>doorScene(t,u,d,{hum:.9,brace:1,shake:.6});
SC.door_still=(t,u,d)=>doorScene(t,u,d,{hum:.45,brace:1,shake:.3,z0:1.04,z1:1.1});
SC.door_rattle=(t,u,d)=>{const hs=CU.bangs2;doorScene(t,u,d,{hum:.9,brace:1,hits:hs,A:16,shake:1.8,dents:[[210,350,24,hs[1]],[320,620,32,hs[2]],[250,520,38,hs[3]],[300,300,42,hs[4]]]})};
SC.plank_rip=(t,u,d)=>{const t0=CU.lines.o2.s;const rip=EZ.o3(pr(t,t0+.12,t0+1.15));doorScene(t,u,d,{hum:.9,brace:1,hits:CU.bangs2.slice(3),A:16,shake:2,rip:rip,arms:true,z0:1.12,z1:1.24,dents:[[210,350,24,-1],[320,620,32,-1],[250,520,38,-1],[300,300,42,-1]]})};
// ---------- Reyes bridges the plank to the next roof (side elevation: gap, plank spanning it)
SC.plank_bridge=(t,u,d)=>{const p=u/d;const t0=CU.lines.o2.s;const land=CU.landT;let c=cam(p,{z0:1.0,z1:1.05,y0:0,y1:-10});c=shakeCam(c,t,.5,65);const L=EZ.io(pr(t,t0+1.7,land));const bob=Math.sin(t*3)*1.2*(1-L);
  view(c,.25,()=>{const [top,bot]=todSky(.78);vgrad(-700,640,[[0,top],[1,bot]]);glow(380,200,180,'#fff2cc',.3)});
  view(c,.5,()=>{skylineLayer({seed:12,base:640,minW:40,maxW:84,minH:140,maxH:300,col:'#3a3f5e',gap:2,roof:true,t});fog(t,420,160,'#c98d64',.1)});
  view(c,1,()=>{
    // the gap: a deep drop, the crowd's eyes far below
    const g=ctx.createLinearGradient(0,780,0,1100);g.addColorStop(0,'#1c2338');g.addColorStop(1,'#04060b');ctx.fillStyle=g;ctx.fillRect(-100,780,W+200,400);
    const r=mul(13);for(let i=0;i<60;i++){const x=190+r()*190,y=900+r()*140;glow(x,y,6,'#E6F7FF',.5);ctx.fillStyle='#E6F7FF';ctx.fillRect(x-1.5,y-1,3,2)}
    // near roof (left) and the next roof (right) with its exit door
    blk(-60,780,250,300,4,'#4a5068',{hi:.15});rect(-60,776,250,8,'#6a7088');blk(390,780,250,300,4,'#4a5068',{hi:.15});rect(390,776,250,8,'#6a7088');
    blk(450,690,70,90,4,'#3a4258');ctx.fillStyle='#10192d';ctx.fillRect(460,702,50,78);glow(485,742,60,'#3ddc84',.4);ctx.fillStyle='#3ddc84';ctx.font='600 11px "JetBrains Mono"';ctx.textAlign='center';ctx.fillText('EXIT',485,684);
    // Reyes (front), both hands on the plank, shoving it out
    const R={x:84,y:792,s:1.9,top:'#5b6b3c',beard:'#9aa0a8',skin:'#d3a47e',hairStyle:'none',hair:'#9aa0a8',brow:1,eyes:'open',noArms:true,pose:{lean:-4-L*4,tilt:-3}};person(R);const sh=shoulderPts(R,R.pose);
    const xr=lerp(180,444,L),xl=xr-430;const py=766+bob;
    ctx.fillStyle='rgba(0,0,0,.25)';ctx.fillRect(Math.max(-60,xl),782,xr-Math.max(-60,xl),5);
    plankDraw(xl,py,xr,py+(L>.95?0:bob*.5),16);limbT([xl,py-5],[xr,py-5],3,3,'rgba(255,255,255,.25)');
    armIK(sh[0],[112,py+2],{auto:.62,out:-1,down:true,w0:30,w1:16,col:'#5b6b3c'});armIK(sh[1],[150,py+2],{auto:.62,out:1,down:true,w0:30,w1:16,col:'#5b6b3c'});
    if(t>land&&t<land+.5){const a=t-land;ctx.fillStyle=`rgba(230,220,200,${.6*(1-a/.5)})`;for(let i=0;i<12;i++)ctx.fillRect(420+i*4+Math.sin(i*5)*a*70,772-a*50-(i%3)*6,4,4)}});
  if(t>land&&t<land+.12){ctx.fillStyle=`rgba(255,255,255,${.18*(1-(t-land)/.12)})`;ctx.fillRect(0,0,W,H)}};
// ---------- ten hours: time-lapse from night through dawn to day
SC.timelapse=(t,u,d)=>{const p=u/d;const q=EZ.io(p);const c={x:0,y:0,z:1.05,rot:0};roofWorld(t*2.5,c,{tod:q*.78,lamp:q<.35,hum:.25*(1-q)});
  view(c,1,()=>{survivors(t,{sleep:.4,ollieEyes:'closed'})});
  // fast cloud streaks + long shadow sweep across the roof
  ctx.save();const r=mul(61);ctx.globalAlpha=.16*Math.sin(p*Math.PI);for(let i=0;i<9;i++){const y=60+r()*380,x=((r()*700+t*(400+r()*500))%900)-200;ctx.fillStyle='#e8eefc';rr(x,y,160+r()*160,10+r()*10,10);ctx.fill()}ctx.restore();
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=`rgba(255,200,140,${.16*Math.sin(clamp((q-.25)/.5)*Math.PI)})`;ctx.fillRect(0,0,W,H);ctx.restore();
  // stars/moon fade, sun rises: speed-lines
  ctx.fillStyle='rgba(255,255,255,.05)';for(let i=0;i<10;i++)ctx.fillRect(0,((i*97+t*900)%960),W,2)};
SC.rule1=(t,u,d)=>{const p=u/d;let c=cam(p,{z0:1.02,z1:1.12,x0:0,x1:-8});c=shakeCam(c,t,.5,52);roofWorld(t,c,{brace:4});view(c,1,()=>{survivors(t,{sleep:.9})});if(p>.55&&p<.7){ctx.fillStyle='rgba(255,255,255,.06)';ctx.fillRect(0,0,W,H)}};
// ---------- red beanie on the fire escape
function fireEscapeWall(t,oy){const [top,bot]=todSky(.78);vgrad(0,H,[[0,'#7b86a0'],[1,'#47536c']]);
  const r=mul(14);for(let y=-40;y<1100;y+=26){for(let x=(Math.floor(y/26)%2)*20-40;x<600;x+=40){ctx.fillStyle=`rgba(${60+r()*20},${50+r()*14},${60+r()*14},.14)`;ctx.fillRect(x+1,y+oy%26+1,38,24)}}
  // windows
  for(const [x,y] of[[30,210],[400,210],[30,600],[400,600],[30,990],[400,990]]){blk(x,y+oy,110,150,4,'#2a3350');ctx.fillStyle='#10192d';ctx.fillRect(x+8,y+oy+8,94,134);ctx.fillStyle='rgba(180,200,240,.12)';ctx.fillRect(x+8,y+oy+8,94,40)}
  // fire escape: platforms, railings, diagonal stairs
  const lv=[190,500,810];const X0=130,X1=410;
  for(let i=0;i<lv.length;i++){const y=lv[i]+oy;rect(X0-20,y,X1-X0+40,12,'#1a2030');ctx.fillStyle='#2b3248';for(let x=X0-16;x<X1+20;x+=10)ctx.fillRect(x,y+2,6,8);
    ctx.strokeStyle='#1a2030';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(X0-20,y-70);ctx.lineTo(X1+20,y-70);ctx.stroke();ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(X0-20,y-36);ctx.lineTo(X1+20,y-36);ctx.stroke();for(let x=X0-20;x<=X1+20;x+=35){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y-70);ctx.stroke()}
    if(i<lv.length-1){const sd=i%2?1:-1;const xa=sd>0?X0+10:X1-10,xb=sd>0?X1-10:X0+10;ctx.strokeStyle='#1a2030';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(xa,y+12);ctx.lineTo(xb,lv[i+1]+oy);ctx.stroke();ctx.beginPath();ctx.moveTo(xa,y-58);ctx.lineTo(xb,lv[i+1]+oy-70);ctx.stroke();ctx.lineWidth=3;for(let s=1;s<9;s++){const f=s/9;const sx=lerp(xa,xb,f),sy=lerp(y+12,lv[i+1]+oy,f);ctx.beginPath();ctx.moveTo(sx-18,sy);ctx.lineTo(sx+18,sy);ctx.stroke()}}}
  // roof lip + ladder at the top
  blk(-20,-60+oy,W+40,70,4,'#4a5268',{hi:.2});rect(-20,6+oy,W+40,10,'#2b3248');ctx.strokeStyle='#1a2030';ctx.lineWidth=5;for(const x of[250,286]){ctx.beginPath();ctx.moveTo(x,16+oy);ctx.lineTo(x,330+oy-0);ctx.stroke()}ctx.lineWidth=3;for(let y=34;y<320;y+=24){ctx.beginPath();ctx.moveTo(250,y+oy);ctx.lineTo(286,y+oy);ctx.stroke()}
  dust(t,0,100,W,800,16,23,'#ffe9c8',.2,.5)}
SC.beanie_fire=(t,u,d)=>{const p=u/d;const oy=lerp(30,-30,EZ.io(p));const c=shakeCam({x:0,y:0},t,.5,74);ctx.save();ctx.translate(c.x*2,c.y*2);fireEscapeWall(t,oy);
  // the beanie, caught on the railing, swaying in the wind
  const bt=CU.lines.k2.s+.62;const sw=Math.sin(t*2.2)*.09;const bx=290,by=500+oy-70;ctx.save();ctx.translate(bx,by);ctx.scale(1.9,1.9);ctx.rotate(sw);
  ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(6,84,34,6,0,0,7);ctx.fill();
  ctx.strokeStyle='#1a2030';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-60,0);ctx.lineTo(60,0);ctx.stroke();
  // red knit beanie hooked by its cuff on the rail: ribbed cuff, dome hanging down, pompom at the tip
  ctx.fillStyle='#8f2323';rr(-34,-8,68,20,6);ctx.fill();ctx.strokeStyle='rgba(0,0,0,.3)';ctx.lineWidth=1.6;for(let x=-28;x<=28;x+=8){ctx.beginPath();ctx.moveTo(x,-6);ctx.lineTo(x,10);ctx.stroke()}
  ctx.fillStyle=C.red;ctx.beginPath();ctx.moveTo(-32,12);ctx.quadraticCurveTo(-34,78,0,86);ctx.quadraticCurveTo(34,78,32,12);ctx.closePath();ctx.fill();ctx.fillStyle='rgba(255,255,255,.14)';ctx.beginPath();ctx.moveTo(-26,14);ctx.quadraticCurveTo(-27,60,-8,76);ctx.lineTo(-14,14);ctx.fill();ctx.strokeStyle='rgba(0,0,0,.18)';ctx.lineWidth=1.4;for(let x=-20;x<=20;x+=10){ctx.beginPath();ctx.moveTo(x,14);ctx.quadraticCurveTo(x*1.1,60,x*.5,82);ctx.stroke()}
  circ(0,94,12,'#ff8a8a');circ(-3,91,4,'#ffc0c0');
  ctx.restore();
  const a=t-bt;if(a>0&&a<.9){const k=Math.min(1,a/.2)*(1-pr(a,.5,.9));ctx.strokeStyle=`rgba(255,255,255,${.85*k})`;ctx.lineWidth=3;ctx.beginPath();ctx.arc(bx+Math.sin(sw)*30,by+50,100+(1-Math.min(1,a/.3))*30,0,7);ctx.stroke()}
  const vg=ctx.createRadialGradient(270,500,200,270,500,640);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.45)');ctx.fillStyle=vg;ctx.fillRect(0,0,W,H)};
