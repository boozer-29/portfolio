// ============ EPISODE 3 — helpers ============
const REY={top:'#5b6b3c',beard:'#9aa0a8',skin:'#d3a47e',hairStyle:'none',hair:'#9aa0a8',brow:1};
const MAYA={top:'#14b8a6',hairStyle:'long',hair:'#3a2a1a'};
const DJ_={top:'#a855f7',hood:true,phones:true,hairStyle:'none'};
function blinkE(t,seed,base='open'){const ph=(t+seed*1.37)%(3.1+seed%1.3);return ph<.11?'closed':base}
function daySky(y0=0,y1=H){const [a,b]=todSky(.78);vgrad(y0,y1,[[0,a],[1,b]])}
function windLines(t,n,seed,a=.12){const r=mul(seed);ctx.save();ctx.strokeStyle=`rgba(255,255,255,${a})`;ctx.lineWidth=1.5;for(let i=0;i<n;i++){const y=r()*H,sp=260+r()*340,x=((r()*900+t*sp)%900)-180,l=40+r()*90;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+l,y-3);ctx.stroke()}ctx.restore()}
// ---- profile (side-view) figure. dir=1 faces right. pose angles in degrees.
function sideFig(o){const p=Object.assign({lean:0,tilt:0,aF:10,eF:10,aB:-10,eB:10,hF:8,kF:6,hB:-8,kB:6,hip:0},o.pose||{});o=Object.assign({skin:'#e0b48c',top:C.must,bottom:'#3b4252',shoe:'#1d2230',hair:'#2a2f3a',s:1,dir:1,eyes:'open'},o);
  const R=Math.PI/180;ctx.save();ctx.translate(o.x,o.y);ctx.scale(o.s*o.dir,o.s);if(o.shadow!==0)shadowE(0,1,24,5,.45);
  const hy=-44+p.hip;
  const leg=(h,k,col)=>{ctx.save();ctx.translate(0,hy);ctx.rotate(-h*R);blk(-5.5,0,11,24,4,col);ctx.translate(0,22);ctx.rotate(k*R);blk(-5,0,10,22,4,col);blk(-5,17,16,8,4,o.shoe,{hi:.3});ctx.restore()};
  const arm=(a,e,col,item)=>{ctx.save();ctx.translate(0,-33);ctx.rotate(-a*R);blk(-4.6,-1,9.2,18,4.4,col);ctx.translate(0,16);ctx.rotate(-e*R);blk(-4.2,-1,8.4,17,4,col);blk(-4,14,8,8.5,3.6,o.skin,{hi:.15});if(item)item();ctx.restore()};
  leg(p.hB,p.kB,shade(o.bottom,-.2));
  ctx.save();ctx.translate(0,hy);ctx.rotate(p.lean*R);ctx.translate(0,-hy);
  ctx.save();ctx.translate(0,hy);arm(p.aB,p.eB,shade(o.top,-.2),o.itemB);ctx.restore();
  ctx.restore();
  leg(p.hF,p.kF,o.bottom);
  ctx.save();ctx.translate(0,hy);ctx.rotate(p.lean*R);
  blk(-10,-38,21,41,7,o.top,{hi:.14});if(o.hood)blk(-13,-40,12,16,6,shade(o.top,-.18));
  // head
  ctx.save();ctx.translate(1,-40);ctx.rotate(p.tilt*R);blk(-3,-5,7,8,2,shade(o.skin,-.15));
  if(o.hood)blk(-13,-32,24,30,11,shade(o.top,-.12),{hi:.12});
  blk(-10,-29,22,25,8,o.skin,{hi:.14,lo:-.16});blk(11,-18,4,5,2,shade(o.skin,-.06));
  if(o.hat==='beanie'){blk(-12,-34,25,13,6,C.red,{hi:.25});ctx.fillStyle=shade(C.red,-.25);ctx.fillRect(-12,-24,25,3);circ(-1,-36,3.2,shade(C.red,.3))}
  else if(o.hood){blk(-12,-32,17,27,9,shade(o.top,-.05),{hi:.15})}
  else if(o.hairStyle==='long'){blk(-12,-31,18,11,5,o.hair);ctx.fillStyle=o.hair;ctx.fillRect(-12,-24,8,22)}
  else if(o.hairStyle!=='none'){blk(-12,-31,20,9,5,o.hair)}else{ctx.fillStyle=o.hair;ctx.fillRect(-10,-24,5,10)}
  if(o.eyes==='closed'){ctx.fillStyle='#1b1f2b';ctx.fillRect(3,-18,6,1.8)}else{ctx.fillStyle='#f4f4ef';rr(3,-21,6,6.4,1.5);ctx.fill();ctx.fillStyle='#1b1f2b';rr(5.6,-19.4,3,3.4,1);ctx.fill()}
  if(o.brow){ctx.strokeStyle='#1b1f2b';ctx.lineWidth=1.7;ctx.beginPath();ctx.moveTo(2,-24.5);ctx.lineTo(10,-23.5+(o.brow<0?2:0));ctx.stroke()}
  if(o.beard){blk(0,-12,12,10,4,o.beard,{hi:.12})}else{ctx.fillStyle='#3a2a2f';ctx.fillRect(6,-9.5,5,1.4)}
  if(o.phones){blk(-4,-22,9,12,3,'#1d212b')}
  ctx.restore();
  arm(p.aF,p.eF,o.top,o.itemF);
  ctx.restore();ctx.restore()}
// ---- crayon lettering (Caveat, waxy double stroke). 'Я' draws a mirrored R.
function crayonText(txt,x,y,size,col,o={}){ctx.save();ctx.font=`700 ${size}px Caveat`;ctx.textAlign='left';ctx.letterSpacing='0px';const r=mul(o.seed||7);let w=0;const ws=[...txt].map(ch=>{const m=ctx.measureText(ch==='Я'?'R':ch).width+(o.ls||0);w+=m;return m});let cx=o.align==='left'?x:x-w/2;const n=o.reveal===undefined?txt.length:Math.floor(clamp(o.reveal)*txt.length+.001);
  [...txt].forEach((ch,i)=>{if(i<n){const jx=(r()-.5)*size*.05,jy=(r()-.5)*size*.09,ro=(r()-.5)*.09;ctx.save();ctx.translate(cx+ws[i]/2+jx,y+jy);ctx.rotate(ro);if(ch==='Я'){ctx.scale(-1,1)}const c2=ch==='Я'?'R':ch;const hw=ctx.measureText(c2).width/2;ctx.globalAlpha=(o.alpha??1)*.92;ctx.fillStyle=col;ctx.fillText(c2,-hw,0);ctx.globalAlpha=(o.alpha??1)*.45;ctx.fillText(c2,-hw+size*.022,size*.02);ctx.restore()}else{r();r();r()}cx+=ws[i]});ctx.restore();return w}
function paper(x,y,w,h,rot=0,col='#f1ead8'){ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.fillStyle='rgba(0,0,0,.28)';ctx.fillRect(-w/2+5,-h/2+7,w,h);ctx.fillStyle=col;ctx.fillRect(-w/2,-h/2,w,h);ctx.fillStyle='rgba(0,0,0,.05)';for(let i=1;i<3;i++)ctx.fillRect(-w/2,-h/2+i*h/3,w,1.5);ctx.restore()}
// crayon dino drawing with the backwards R  (the plant)
function dinoDrawing(cx,cy,s,o={}){ctx.save();ctx.translate(cx,cy);ctx.scale(s,s);paper(0,0,300,250,0,o.col||'#f6efdc');
  ctx.strokeStyle='#3fa34d';ctx.lineWidth=7;ctx.lineCap='round';ctx.lineJoin='round';ctx.globalAlpha=.9;
  ctx.beginPath();ctx.moveTo(-100,20);ctx.quadraticCurveTo(-60,-50,10,-40);ctx.quadraticCurveTo(40,-78,74,-60);ctx.quadraticCurveTo(96,-40,66,-26);ctx.quadraticCurveTo(50,10,20,24);ctx.lineTo(20,48);ctx.moveTo(-30,26);ctx.lineTo(-30,48);ctx.moveTo(20,24);ctx.quadraticCurveTo(-50,40,-100,20);ctx.stroke();
  ctx.lineWidth=5;for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(-64+i*22,-34-i*3);ctx.lineTo(-56+i*22,-54-i*3);ctx.lineTo(-46+i*22,-38-i*3);ctx.stroke()}
  ctx.fillStyle='#1b1f2b';ctx.beginPath();ctx.arc(66,-48,4,0,7);ctx.fill();ctx.globalAlpha=1;
  crayonText('BЯAVE',0,104,60,'#d6453c',{seed:3,reveal:o.reveal,ls:7});
  if(o.ring){ctx.strokeStyle=o.ring;ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(-37,84,26,32,0,0,7);ctx.stroke()}
  ctx.restore()}
// toy walkie-talkie
function toyWalkie(x,y,s,o={}){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.rotate(o.rot||0);
  blk(-9,-74,7,34,3,'#1d212b');circ(-5.5,-76,5,'#f59e0b');
  blk(-26,-44,52,96,12,'#2f7fd6',{hi:.25,lo:-.25});blk(-20,-36,40,34,7,'#184a86');ctx.fillStyle='#0c2748';for(let i=0;i<4;i++)ctx.fillRect(-14,-30+i*7,28,3);
  blk(-20,6,40,14,5,'#f59e0b',{hi:.3});blk(-12,28,24,16,6,'#e8e8e0',{hi:.2});
  const led=o.led??0;circ(16,-40,4.5,led>.05?'#4ade80':'#1c3b2a');if(led>.05)glow(16,-40,22,'#4ade80',.8*led);
  ctx.restore()}
function staticArcs(t,x,y,n,a,col='255,255,255'){ctx.save();ctx.lineWidth=3;for(let i=0;i<n;i++){const ph=(t*1.6+i/n)%1;ctx.strokeStyle=`rgba(${col},${a*(1-ph)})`;ctx.beginPath();const r=20+ph*110;for(let k=0;k<=14;k++){const an=-1.0+k/14*2.0;const rr_=r+Math.sin(k*2.3+t*40+i)*5;const px=x+Math.cos(an)*rr_,py=y+Math.sin(an)*rr_;k?ctx.lineTo(px,py):ctx.moveTo(px,py)}ctx.stroke()}ctx.restore()}
// top-down street far below, n sleepers looking up
function streetTop(t,x,y,w,h,n,seed,o={}){ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();vgrad(y,y+h,[[0,'#232a3a'],[1,'#161b28']]);
  ctx.fillStyle='rgba(255,255,255,.2)';for(let i=0;i<12;i++)ctx.fillRect(x+w/2-3,y+i*(h/12)+4,6,h/24);rect(x+w*.16,y,4,h,'rgba(255,255,255,.1)');rect(x+w*.84,y,4,h,'rgba(255,255,255,.1)');
  const r=mul(seed);for(let i=0;i<5;i++){const cx=x+(r()>.5?w*.3:w*.68)+(r()-.5)*20,cy=y+r()*h,cw=o.cs||26;blk(cx-cw/2,cy-cw,cw,cw*2,cw*.3,['#3a4458','#4b3f3a','#2f4a55','#55506a'][i%4],{hi:.15});ctx.fillStyle='rgba(10,14,24,.7)';ctx.fillRect(cx-cw*.36,cy-cw*.5,cw*.72,cw*.5)}
  const fs=o.fs||.5;const r2=mul(seed+5);const pts=[];for(let i=0;i<(o.max||400);i++){pts.push([x+r2()*w,y+r2()*h,r2()])}
  for(let i=0;i<Math.min(n,pts.length);i++){const q=pts[i];faceUp(q[0],q[1],fs*(.85+q[2]*.3),i,t)}
  ctx.restore()}
// first-person hand gripping a plank edge (fingers wrap inward)
function gripHand(x,y,sd,s=1,rot=0){ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.scale(s,s);blk(-22,-20,44,42,13,'#e0b48c',{hi:.2});for(let i=0;i<4;i++){blk(-sd*(-6)-(sd>0?30:0),-22+i*10.5,30,9.6,4.8,'#e7bd97',{hi:.25})}ctx.save();ctx.translate(sd*16,18);ctx.rotate(sd*.5);blk(-6,-4,12,26,6,'#e0b48c',{hi:.2});ctx.restore();ctx.restore()}
function plankPersp(xn0,xn1,yn,xf0,xf1,yf,o={}){ // perspective plank with thickness + grain
  ctx.save();ctx.fillStyle='#5a4023';ctx.beginPath();ctx.moveTo(xn0,yn);ctx.lineTo(xn1,yn);ctx.lineTo(xn1,yn+60);ctx.lineTo(xn0,yn+60);ctx.fill();
  ctx.fillStyle='#93703f';ctx.beginPath();ctx.moveTo(xn0,yn);ctx.lineTo(xn1,yn);ctx.lineTo(xf1,yf);ctx.lineTo(xf0,yf);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.1)';ctx.beginPath();ctx.moveTo(xn0,yn);ctx.lineTo(xn0+(xn1-xn0)*.1,yn);ctx.lineTo(xf0+(xf1-xf0)*.1,yf);ctx.lineTo(xf0,yf);ctx.fill();
  ctx.fillStyle='rgba(0,0,0,.2)';ctx.beginPath();ctx.moveTo(xn1,yn);ctx.lineTo(xn1-(xn1-xn0)*.08,yn);ctx.lineTo(xf1-(xf1-xf0)*.08,yf);ctx.lineTo(xf1,yf);ctx.fill();
  ctx.strokeStyle='rgba(60,36,16,.45)';ctx.lineWidth=2;for(let i=1;i<6;i++){const f=i/6;ctx.beginPath();ctx.moveTo(lerp(xn0,xn1,f),yn);ctx.lineTo(lerp(xf0,xf1,f),yf);ctx.stroke()}
  for(let i=0;i<7;i++){const k=Math.pow(i/7,1.6);const y=lerp(yn,yf,k);const a=lerp(xn0,xf0,k),b=lerp(xn1,xf1,k);ctx.fillStyle='rgba(40,24,10,.35)';ctx.beginPath();ctx.ellipse(lerp(a,b,.3+.4*((i*37)%10)/10),y,(b-a)*.035,(b-a)*.012,0,0,7);ctx.fill()}
  ctx.restore()}
// facade of a building seen across the gap (windows compress toward the bottom = looking down)
function facadeDown(x,y,w,h,col,rows=5){blk(x,y,w,h,2,col);for(let r=0;r<rows;r++){const k0=1-Math.pow(1-r/rows,1.5),k1=1-Math.pow(1-(r+.62)/rows,1.5);const yy=y+12+k0*(h-20),hh=(k1-k0)*(h-20);for(let c=0;c<5;c++){ctx.fillStyle=(r*3+c)%4?'#151d30':'#232d46';ctx.fillRect(x+16+c*(w-32)/5,yy,(w-32)/5-12,hh)}}const g=ctx.createLinearGradient(0,y,0,y+h);g.addColorStop(0,'rgba(5,8,14,0)');g.addColorStop(1,'rgba(5,8,14,.75)');ctx.fillStyle=g;ctx.fillRect(x,y,w,h)}

// ============ 1. crawling across the plank, five floors up (first person)
SC.pov_plank=(t,u,d)=>{const tip=EZ.io(pr(t,2.55,3.9));const cyc=(t*.62)%1;const sway=Math.sin(t*1.5)*.012+Math.sin(t*3.7)*.004;const bob=Math.sin(t*.62*Math.PI*2)*4;
  daySky(0,560);
  ctx.save();ctx.translate(270,520);ctx.rotate(sway+tip*.03);ctx.scale(1+tip*.07,1+tip*.07);ctx.translate(-270,-520-tip*150+bob);
  skylineLayer({seed:12,base:420,minW:40,maxW:84,minH:120,maxH:260,col:'#4a4f6e',gap:2,roof:true,t});fog(t,330,160,'#c9b7ae',.16);
  // the alley floor far below + the far building's wall dropping away
  streetTop(t,-80,700,700,560,14,31,{fs:.34,cs:20});const dg=ctx.createLinearGradient(0,700,0,1000);dg.addColorStop(0,'rgba(8,11,20,.45)');dg.addColorStop(1,'rgba(8,11,20,.05)');ctx.fillStyle=dg;ctx.fillRect(-80,700,700,560);
  facadeDown(70,452,400,300,'#3b4460',5);
  // next roof: slab + Reyes reaching (front view), Maya and DJ behind him
  blk(50,404,440,50,3,'#59607a',{hi:.2});rect(50,398,440,8,'#737a94');
  person(Object.assign({x:176,y:412,s:.86,eyes:blinkE(t,2,'wide'),shadow:0,pose:{breath:Math.sin(t*3)*.01}},MAYA));person(Object.assign({x:372,y:412,s:.86,eyes:blinkE(t,5,'wide'),shadow:0,pose:{breath:Math.sin(t*3+1)*.01}},DJ_));
  {const R=Object.assign({x:270,y:452,s:1.25,kneel:true,noArms:true,eyes:blinkE(t,1),shadow:0,pose:{lean:0,tilt:2}},REY);person(R);const sh=shoulderPts(R,R.pose);const rr2=Math.sin(t*2)*3;
   armIK(sh[0],[sh[0][0]-14,452],{auto:.6,out:-1,down:true,w0:13,w1:9,col:REY.top,skin:REY.skin});armIK(sh[1],[286+rr2,474+rr2*.4],{auto:.56,out:1,down:true,w0:14,w1:12,col:REY.top,skin:REY.skin})}
  // the plank, from under your hands to the far roof edge
  ctx.save();ctx.translate(270,1000);ctx.rotate(sway*1.5);ctx.translate(-270,-1000);
  plankPersp(96,444,1000,236,304,456);
  ctx.restore();
  // depth label
  if(tip>.05){ctx.globalAlpha=tip;ctx.strokeStyle='rgba(255,255,255,.55)';ctx.setLineDash([6,7]);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(38,456);ctx.lineTo(38,880);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#fff';ctx.font='600 13px "JetBrains Mono"';ctx.textAlign='left';ctx.letterSpacing='1.5px';ctx.save();ctx.translate(30,760);ctx.rotate(-Math.PI/2);ctx.fillText('5 FLOORS · 17 M',0,0);ctx.restore();ctx.globalAlpha=1}
  ctx.restore();
  // your two hands (one pair), alternating forward
  const adv=(ph)=>{const c=(cyc+ph)%1;return c<.4?EZ.io(c/.4):1-EZ.io((c-.4)/.6)};
  for(const sd of[-1,1]){const a=adv(sd<0?0:.5);const hy=880-a*70+bob*.6;const edge=270+sd*lerp(150,128,(960-hy)/400);const tr=hand(t*3,.7,sd>0?4:9);
    armIK([270+sd*330,1130],[edge+sd*10+tr.x,hy+18+tr.y],{auto:.56,out:sd,down:true,w0:104,w1:62,col:C.must,noHand:true});gripHand(edge+tr.x,hy+tr.y,sd,1.25,sd*-.1)}
  windLines(t,7,3,.1);dust(t,0,200,W,700,14,9,'#fff2dc',.25,1.2);
  const vg=ctx.createRadialGradient(270,560,220,270,560,660);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.4)');ctx.fillStyle=vg;ctx.fillRect(0,0,W,H)};
