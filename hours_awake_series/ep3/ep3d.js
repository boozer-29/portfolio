// ============ EPISODE 3 — shots 20-30 ============
SC.line_front=(t,u,d)=>{const p=u/d;const c=cam(p,{z0:1.0,z1:1.05});ctx.save();ctx.translate(270,560);ctx.scale(c.z,c.z);ctx.translate(-270,-560);
  oldRoof(t,{hum:.1,door:1,blockSlide:1,beanie:true});lineSleepers(t,false);
  // the gap in front of us: nothing crosses it
  const g=ctx.createLinearGradient(0,760,0,H);g.addColorStop(0,'rgba(5,8,14,0)');g.addColorStop(1,'rgba(5,8,14,.8)');ctx.fillStyle=g;ctx.fillRect(0,760,W,H-760);ctx.restore();
  const a=pr(t,CU.lines.e1.s+.2,CU.lines.e1.s+.9);if(a>0){for(let i=0;i<3;i++){const ph=(t*.8+i/3)%1;ctx.strokeStyle=`rgba(230,247,255,${.14*(1-ph)*a})`;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(250,590,60+ph*340,24+ph*80,0,0,7);ctx.stroke()}}
  windLines(t,4,6,.07);const v=ctx.createRadialGradient(270,520,220,270,520,660);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.4)');ctx.fillStyle=v;ctx.fillRect(0,0,W,H)};
SC.line_back=(t,u,d)=>{const p=u/d;const c=cam(p,{z0:1.05,z1:1.0});ctx.save();ctx.translate(270,560);ctx.scale(c.z,c.z);ctx.translate(-270,-560);
  oldRoof(t,{hum:.1,door:1,blockSlide:1,beanie:true});lineSleepers(t,true);
  const g=ctx.createLinearGradient(0,760,0,H);g.addColorStop(0,'rgba(5,8,14,0)');g.addColorStop(1,'rgba(5,8,14,.8)');ctx.fillStyle=g;ctx.fillRect(0,760,W,H-760);ctx.restore();
  windLines(t,4,6,.07);const v=ctx.createRadialGradient(270,520,220,270,520,660);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.4)');ctx.fillStyle=v;ctx.fillRect(0,0,W,H)};
// Reyes' red fingertips, then up to his calm face
SC.reyes_fingers=(t,u,d)=>{const p=u/d;const off=-330*(1-EZ.io(pr(t,CU.redT-.35,CU.redT+.6)));vgrad(0,H,[[0,'#2a3350'],[1,'#10162a']]);glow(270,420,420,'#8aa4d8',.12);
  ctx.save();ctx.translate(0,off);const s=5.4,x0=270,y0=1010;
  person(Object.assign({x:x0,y:y0,s:s,eyes:p>.45?'half':'open',mouth:'line',shadow:0,pose:{aL:7,aR:7,breath:Math.sin(t*1.8)*.01,tilt:1}},REY));
  ctx.save();ctx.translate(x0,y0);ctx.scale(s,s);ctx.translate(0,-44);
  // crayon-red fingertips on his right hand (screen left), a smear on the palm, a drip
  for(const sd of[-1,1]){const hx=sd*22,hy=-34+17+16.5+9;ctx.fillStyle='rgba(201,56,47,.95)';for(let i=0;i<3;i++){rr(hx-4+i*2.6-1,hy-3+i*.6,2.6,6,1.2);ctx.fill()}ctx.fillStyle='rgba(201,56,47,.6)';ctx.beginPath();ctx.ellipse(hx,hy-2,5,2.5,0,0,7);ctx.fill()}
  ctx.restore();ctx.restore();
  const v=ctx.createRadialGradient(270,520,220,270,520,660);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.55)');ctx.fillStyle=v;ctx.fillRect(0,0,W,H)};
// memory of the ten quiet hours: desaturated dawn, Reyes writing
SC.wrote_hours=(t,u,d)=>{const p=u/d;ctx.save();const c={x:0,y:0,z:1.06,rot:0};roofWorld(t,c,{tod:.42,lamp:false,brace:4});
  view(c,1,()=>{ // the others dozing, small and far; Reyes large in the clear foreground, side-on, writing
    ctx.save();ctx.translate(380,700);ctx.scale(.62,.62);ctx.translate(-380,-700);survivors(t,{noReyes:true,sleep:1,ollieEyes:'closed'});ctx.restore();
    const wr=Math.sin(t*12);sideFig({x:150,y:960,s:2.6,dir:1,top:REY.top,beard:REY.beard,skin:REY.skin,hair:REY.hair,brow:1,eyes:'half',shadow:.4,pose:{lean:12,tilt:22,aF:46,eF:-78,aB:34,eB:-70,hF:4,kF:4,hB:-4,kB:4}});
    ctx.save();ctx.translate(262,818);ctx.rotate(-.1);ctx.fillStyle='#e9e0c8';ctx.fillRect(-62,-6,124,78);ctx.strokeStyle='#c9382f';ctx.lineWidth=3.5;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(-50,12+i*18);ctx.lineTo(-50+(26+i*10)*(.35+.65*((t*1.1+i*.31)%1)),12+i*18);ctx.stroke()}ctx.restore();
    ctx.restore()});
  ctx.restore();ctx.save();ctx.globalCompositeOperation='saturation';ctx.fillStyle='#808080';ctx.globalAlpha=.55;ctx.fillRect(0,0,W,H);ctx.restore();ctx.fillStyle='rgba(120,150,190,.08)';ctx.fillRect(0,0,W,H);
  const v=ctx.createRadialGradient(270,520,200,270,520,660);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.5)');ctx.fillStyle=v;ctx.fillRect(0,0,W,H)};
SC.thirty_a=(t,u,d)=>{const p=u/d;vgrad(0,H,[[0,'#06080e'],[1,'#0c1020']]);const n=Math.max(0,Math.round(30*(1-EZ.io(p))));ctx.strokeStyle='rgba(255,255,255,.12)';ctx.lineWidth=14;ctx.beginPath();ctx.arc(270,470,130,0,7);ctx.stroke();ctx.strokeStyle=C.amb;ctx.beginPath();ctx.arc(270,470,130,-Math.PI/2,-Math.PI/2+(1-p)*6.283);ctx.stroke();ctx.fillStyle='#fff';ctx.font='170px "Bebas Neue"';ctx.textAlign='center';ctx.fillText(String(n).padStart(2,'0'),270,530);ctx.font='600 12px "JetBrains Mono"';ctx.letterSpacing='3px';ctx.fillStyle='#8A8F99';ctx.fillText('SECONDS ASLEEP',270,580)};
SC.lead_ollie=(t,u,d)=>{const p=u/d;ctx.save();const c={x:0,y:0,z:1.0,rot:0};roofWorld(t,c,{tod:.42,lamp:false,brace:4});
  view(c,1,()=>{ // fire-escape rail at the roof's right edge
    ctx.strokeStyle='#1a2030';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(380,640);ctx.lineTo(580,640);ctx.stroke();ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(380,690);ctx.lineTo(580,690);ctx.stroke();for(let x=380;x<=580;x+=33){ctx.beginPath();ctx.moveTo(x,640);ctx.lineTo(x,740);ctx.stroke()}
    const wx=lerp(90,300,EZ.io(p)),sw=Math.sin(t*9);
    // Reyes leads sleepwalking Ollie by the hand (both in profile, facing right)
    sideFig({x:wx+104,y:900,s:1.95,dir:1,top:'#cc3b3b',hat:'beanie',eyes:'closed',shadow:.4,pose:{lean:6,tilt:14,aF:-8,eF:-6,aB:34,eB:20,hF:sw*20,kF:Math.max(0,sw)*30,hB:-sw*20,kB:Math.max(0,-sw)*30,hip:0},bottom:'#2f4a7a'});
    sideFig({x:wx,y:905,s:2.7,dir:1,top:REY.top,beard:REY.beard,skin:REY.skin,hair:REY.hair,brow:1,eyes:'open',shadow:.4,pose:{lean:8,tilt:-2,aF:52,eF:-4,aB:-12,eB:10,hF:sw*20,kF:Math.max(0,sw)*30,hB:-sw*20,kB:Math.max(0,-sw)*30}})});
  ctx.restore();ctx.save();ctx.globalCompositeOperation='saturation';ctx.fillStyle='#808080';ctx.globalAlpha=.55;ctx.fillRect(0,0,W,H);ctx.restore();ctx.fillStyle='rgba(120,150,190,.08)';ctx.fillRect(0,0,W,H)};
SC.kick_replay=(t,u,d)=>{const p=u/d;ctx.save();kickScene(t,u,d,{kt:CU.shots.find(x=>x.n==='kick_replay').s+.35,k:.5,calm:true,push:true,z0:1.25,z1:1.9,fx:410,fy:610});ctx.restore();ctx.save();ctx.globalCompositeOperation='saturation';ctx.fillStyle='#808080';ctx.globalAlpha=.5;ctx.fillRect(0,0,W,H);ctx.restore();
  // t is remapped by slow motion: kickScene uses (t-kt)*k, so shift kt into this shot
  };
// the sheet
SC.sign=(t,u,d)=>{const p=u/d;vgrad(0,H,[[0,'#232a3c'],[1,'#0b0f19']]);
  sideFig(Object.assign({x:96,y:900,s:2.5,dir:-1,eyes:'closed',shadow:0,pose:{tilt:10}},MAYA));sideFig(Object.assign({x:444,y:900,s:2.5,dir:1,eyes:'closed',shadow:0,pose:{tilt:10}},DJ_));
  const R=Object.assign({x:270,y:790,s:3.0,noArms:true,eyes:'half',mouth:'line',shadow:0,pose:{tilt:0,breath:Math.sin(t*1.8)*.008}},REY);person(R);const sh=shoulderPts(R,R.pose);
  const up=EZ.ob(pr(p,0,.35));const py=lerp(800,700,up);
  armIK(sh[0],[142,py+34],{auto:.6,out:-1,down:true,w0:50,w1:28,col:REY.top,noHand:true});armIK(sh[1],[398,py+34],{auto:.6,out:1,down:true,w0:50,w1:28,col:REY.top,noHand:true});
  ctx.save();ctx.translate(270,py);ctx.rotate(-.02);paper(0,0,300,130,0,'#f1ead8');crayonText('IT WAS HIM',0,-8,46,'#c9382f',{seed:31});crayonText('OR ALL OF US',0,40,46,'#c9382f',{seed:32});ctx.restore();
  for(const sd of[-1,1]){blk(270+sd*128-18,py+14,36,40,13,REY.skin,{hi:.2});ctx.fillStyle='rgba(201,56,47,.9)';ctx.fillRect(270+sd*128-14,py+44,28,8)}
  const v=ctx.createRadialGradient(270,520,200,270,520,660);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.55)');ctx.fillStyle=v;ctx.fillRect(0,0,W,H)};
// ---- the walkie
function hoodieStrap(){blk(-60,640,W+120,500,80,C.must,{hi:.18});rect(150,640,10,500,'#e8e8e0');rect(380,640,10,500,'#e8e8e0');ctx.fillStyle='rgba(0,0,0,.15)';ctx.fillRect(-60,760,W+120,6)}
SC.walkie=(t,u,d)=>{const p=u/d;const L=CU.lines;const ck=CU.wcrk;const cr=pr(t,ck,L.j1.s+1.7);const fl=t>ck?(Math.sin(t*50)>0?1:.15):.2;const buz=t>ck?Math.sin(t*70)*2.4:0;
  vgrad(0,H,[[0,'#1c2438'],[1,'#0a0e18']]);const z=lerp(1.0,1.12,EZ.io(p));ctx.save();ctx.translate(270,560);ctx.scale(z,z);ctx.translate(-270,-560);
  ctx.save();ctx.translate(0,40);hoodieStrap();ctx.restore();toyWalkie(270+buz,560,2.5,{led:fl,rot:Math.sin(t*50)*.01*(t>ck?1:0)});
  if(t>ck){staticArcs(t,270,500,4,.5*cr+.2);ctx.save();ctx.globalAlpha=.5*cr;ctx.fillStyle='#fff';for(let i=0;i<30;i++){const r=mul(Math.floor(t*30)+i);ctx.fillRect(r()*W,r()*H,r()*120,2)}ctx.restore()}
  ctx.restore();const v=ctx.createRadialGradient(270,540,220,270,540,660);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.55)');ctx.fillStyle=v;ctx.fillRect(0,0,W,H)};
function ollieTapFlash(t){vgrad(0,H,[[0,'#8a5a30'],[1,'#3a2616']]);glow(270,420,480,'#ffbe6b',.55);
  toyWalkie(270,640,2.0,{led:1,rot:.05});ctx.save();ctx.translate(300,470);ctx.rotate(.15);blk(-30,-8,60,56,18,'#e0b48c',{hi:.2});blk(-9,-70,18,72,9,'#e7bd97',{hi:.25});ctx.restore();ctx.fillStyle='rgba(255,220,160,.12)';ctx.fillRect(0,0,W,H)}
SC.taps=(t,u,d)=>{const T=CU.tapsT;let flash=false;for(const x of T)if(t>=x&&t<x+4/30)flash=true;
  if(flash){ollieTapFlash(t);return}
  let pu=0;for(const x of T){const a=t-x;if(a>=4/30&&a<.5)pu=Math.max(pu,1-(a-4/30)/.4)}
  vgrad(0,H,[[0,'#1c2438'],[1,'#0a0e18']]);ctx.save();ctx.translate(0,40);hoodieStrap();ctx.restore();
  ctx.save();ctx.translate(270,560);const z=2.5*(1+.05*pu);ctx.scale(z/2.5,z/2.5);ctx.translate(-270,-560);toyWalkie(270,560,2.5,{led:.3+pu*.7});ctx.restore();
  for(const x of T){const a=t-x;if(a>0&&a<.7){ctx.strokeStyle=`rgba(255,255,255,${.5*(1-a/.7)})`;ctx.lineWidth=3;ctx.beginPath();ctx.arc(270,540,60+a*340,0,7);ctx.stroke()}}
  ctx.save();ctx.globalAlpha=.16;ctx.fillStyle='#fff';for(let i=0;i<24;i++){const r=mul(Math.floor(t*30)*3+i);ctx.fillRect(r()*W,r()*H,r()*100,2)}ctx.restore();
  const v=ctx.createRadialGradient(270,540,220,270,540,660);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.6)');ctx.fillStyle=v;ctx.fillRect(0,0,W,H)};
SC.ollie_awake=(t,u,d)=>{const p=u/d;vgrad(0,H,[[0,'#0a0e18'],[1,'#060810']]);glow(270,720,440,'#2f7fd6',.14);
  // kneeling Sleepers ring him in the dark, all facing him, eyes shut
  const r=mul(5);const pts=[];for(let i=0;i<14;i++){const a=i/14*6.283+.2;pts.push({x:270+Math.cos(a)*(210+r()*60),y:760+Math.sin(a)*70+r()*10,s:.8+Math.sin(a)*.18})}pts.sort((a,b)=>a.y-b.y);for(const q of pts){ctx.globalAlpha=.8;sleeperAt(q.x,q.y,q.s,(Math.floor(q.x)%6)+1,'kneel','closed');ctx.globalAlpha=1}
  ctx.fillStyle='rgba(6,8,16,.55)';ctx.fillRect(0,0,W,H);glow(270,820,300,'#2f7fd6',.2);
  const O=Object.assign({},OLLIE,{x:270,y:985,s:3.6,kneel:true,noArms:true,eyes:blinkE(t,6,'wide'),shadow:0,pose:{tilt:-9,breath:Math.sin(t*1.6)*.01,bob:Math.sin(t*1.6)*1.5}});person(O);const so=shoulderPts(O,O.pose);
  toyWalkie(270,O.y-40*O.s,1.15,{led:.6+.4*Math.sin(t*5)});armIK(so[0],[250,O.y-34*O.s],{auto:.58,out:-1,down:true,w0:40,w1:26,col:'#cc3b3b'});armIK(so[1],[290,O.y-34*O.s],{auto:.58,out:1,down:true,w0:40,w1:26,col:'#cc3b3b'});
  const v=ctx.createRadialGradient(270,640,160,270,640,640);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.6)');ctx.fillStyle=v;ctx.fillRect(0,0,W,H)};
SC.street_fills=(t,u,d)=>{const c=CU.crk;let n=40;c.forEach((x,i)=>{if(t>=x)n=[40,130,270,520][i]});let burst=false;for(const x of c)if(t>=x&&t<x+2/30)burst=true;
  const cc=shakeCam({x:0,y:0},t,.5,85);ctx.save();ctx.translate(cc.x*2,cc.y*2);
  streetTop(t,-20,-20,580,1000,n,12,{fs:.5,max:560,cs:30});const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'rgba(5,8,14,.5)');g.addColorStop(1,'rgba(5,8,14,.1)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  // the parapet in the foreground with your two hands on it
  blk(-60,800,W+120,300,4,'#4a5068',{hi:.18});rect(-60,794,W+120,10,'#6a7088');for(const sd of[-1,1]){armIK([270+sd*330,1160],[270+sd*96,824],{auto:.56,out:sd,down:true,w0:96,w1:60,col:C.must,noHand:true});gripHand(270+sd*96,822,sd,1.2,0)}
  ctx.restore();
  if(burst){ctx.fillStyle='rgba(255,255,255,.35)';ctx.fillRect(0,0,W,H);ctx.fillStyle='rgba(0,0,0,.4)';for(let i=0;i<16;i++){const r=mul(Math.floor(t*30)+i);ctx.fillRect(0,r()*H,W,2+r()*6)}}
  const v=ctx.createRadialGradient(270,500,200,270,500,660);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.45)');ctx.fillStyle=v;ctx.fillRect(0,0,W,H)};
SC.reyes_hand=(t,u,d)=>{const p=u/d;vgrad(0,H,[[0,'#232a3c'],[1,'#0b0f19']]);
  person(Object.assign({x:96,y:900,s:2.2,eyes:'closed',shadow:0,pose:{turn:-2,tilt:-10}},MAYA));person(Object.assign({x:444,y:900,s:2.2,eyes:'closed',shadow:0,pose:{turn:2,tilt:10}},DJ_));
  const ext=EZ.o3(pr(p,0,.4));const R=Object.assign({x:270,y:800,s:2.6,noArms:true,eyes:'half',mouth:'line',shadow:0,pose:{tilt:0,lean:-2}},REY);person(R);const sh=shoulderPts(R,R.pose);
  armIK(sh[0],[sh[0][0]-12,sh[0][1]+130],{auto:.6,out:-1,down:true,w0:44,w1:24,col:REY.top,skin:REY.skin});
  // right arm foreshortened toward the camera: palm up, open, red fingertips
  const hp=[lerp(sh[1][0]+10,300,ext),lerp(sh[1][1]+60,790,ext)];armIK(sh[1],hp,{auto:.6,out:1,down:true,w0:52,w1:62,col:REY.top,noHand:true});
  ctx.save();ctx.translate(hp[0],hp[1]+8);ctx.scale(1+ext*.2,1+ext*.2);openHand(0,0,1,2.0,REY.skin);ctx.fillStyle='rgba(201,56,47,.95)';for(let i=0;i<4;i++){const a=(i-1.5)*.17;ctx.save();ctx.translate(((i-1.5)*10.5)*2,-30*2);ctx.rotate(a);const L=((i===1||i===2)?44:38)*2;rr(-5.5,-L-2,11,34,5);ctx.fill();ctx.restore()}ctx.restore();
  const v=ctx.createRadialGradient(270,520,220,270,520,660);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.55)');ctx.fillStyle=v;ctx.fillRect(0,0,W,H)};
