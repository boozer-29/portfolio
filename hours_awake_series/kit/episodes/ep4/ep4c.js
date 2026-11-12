function neckPhones(g){ctx.lineCap='round';ctx.strokeStyle=OLc;ctx.lineWidth=4.2;ctx.beginPath();if(g.back)ctx.arc(0,g.shY-6,11,.35,Math.PI-.35);else ctx.arc(0,g.shY+1,12,.25,Math.PI-.25);ctx.stroke();ctx.strokeStyle='#5b6274';ctx.lineWidth=1.8;ctx.stroke();if(!g.back){orr(-15,g.shY+4,7,10,3,'#2b2f3a',g.oo);orr(8,g.shY+4,7,10,3,'#2b2f3a',g.oo)}}
// ============ 11. memory: Ollie walking with his eyes shut (grey)
SC.ollie_memory=(t,u,d)=>{QA_SHOT='ollie_memory';const p=u/d;const st=Math.sin(t*5.2);
  vgr(0,H,'#2a3048','#141826');const vx=270,vy=380;ctx.fillStyle='#1d2338';ctx.beginPath();ctx.moveTo(-40,-40);ctx.lineTo(vx-60,vy-40);ctx.lineTo(vx-60,vy+60);ctx.lineTo(-40,1000);ctx.fill();ctx.beginPath();ctx.moveTo(580,-40);ctx.lineTo(vx+60,vy-40);ctx.lineTo(vx+60,vy+60);ctx.lineTo(580,1000);ctx.fill();vgr(vy+60,H,'#3a4258','#232838');
  // kneeling Sleepers line both walls (still)
  for(let i=0;i<5;i++)for(const sd of[-1,1]){const z=i/5;const x=vx+sd*lerp(80,250,1-z)*1.0,y=lerp(470,880,1-z),s=lerp(.45,1.25,1-z);if(i<5)fig('sleeper',x,y,s,{kneel:true,eyes:'closed',tilt:20,lean:10,arms:[{to:[-20,-46+0]},{to:[20,-46]}],c:slpC(i*2+(sd>0?1:0)),shadow:false})}
  // Ollie walks toward us, eyes shut, calm
  fig('ollie',270,lerp(800,830,p),lerp(2.5,2.75,EZ.io(p)),{eyes:'closed',mouth:'line',tilt:4,step:st*.6});
  ctx.save();ctx.globalCompositeOperation='saturation';ctx.fillStyle='#808080';ctx.globalAlpha=.85;ctx.fillRect(0,0,W,H);ctx.restore();ctx.fillStyle='rgba(180,190,210,.08)';ctx.fillRect(0,0,W,H);vig(.55)};
// ============ 12. you close your eyes
SC.eyes_close=(t,u,d)=>{QA_SHOT='eyes_close';const p=u/d;const W_=CU.W.e2;const c0=W_[1][1],c1=W_[3][1]+.25;const k=pr(t,c0,c1);const eyes=k<.25?'open':k<.6?'half':k<.95?'heavy':'closed';
  nightSky();ctx.fillStyle='rgba(10,14,30,.4)';ctx.fillRect(0,0,W,H);
  ctx.save();zoomAt(270,430,lerp(1.0,1.07,EZ.io(p)));figHead('you',270,430,6.4,{eyes,brow:'worry',mouth:'line',arms:[{none:true},{none:true}],neck:neckPhones});ctx.restore();
  // after the eyes shut, the red of your own eyelids comes in from the edges
  const red=pr(t,c1,CU.shots.find(s=>s.n==='eyes_close').e);if(red>0){ctx.save();ctx.globalAlpha=EZ.io(red);redLids(t,1,5);ctx.restore()}vig(.45)};
// ============ 13. rule one: never sleep — and your eyes are closed (the red sags darker, then you jolt)
SC.rule1_red=(t,u,d)=>{const p=u/d;const e4=CU.lines.e4.s;const sag=pr(t,e4-.2,e4+1.0);const jolt=t>e4+1.0;const back=jolt?EZ.o3(pr(t,e4+1.0,e4+1.5)):0;const k=jolt?lerp(1.12,1,back):1-.75*EZ.io(sag)+.06*Math.sin(t*1.7);
  redLids(t,k,7);ctx.save();ctx.filter='blur(9px)';ctx.globalAlpha=.35*k;const r=mul(9);for(let i=0;i<6;i++){const x=r()*W,y=300+r()*400;figHead('sleeper',x,y,1.6+r(),{eyes:'closed',arms:[{none:true},{none:true}],c:{top:'#2a0a08',skin:'#8a6a66'}})}ctx.restore();
  // heavy lids: top and bottom close in as you sag toward sleep
  const lid=jolt?400*(1-EZ.o3(pr(t,e4+1.0,e4+1.12))):EZ.io(sag)*400;if(lid>1){ctx.fillStyle='#050000';ctx.beginPath();ctx.ellipse(270,-400+lid,560,380,0,0,7);ctx.fill();ctx.beginPath();ctx.ellipse(270,1360-lid,560,380,0,0,7);ctx.fill()}vig(.5,160)};
// ============ 14. shoulders brush yours. Over your shoulder (eyes shut, red): you walk, a Sleeper stands still; the camera moves
// with you so it slides past and its shoulder touches yours on "brush" (ring at the contact).
SC.shoulder=(t,u,d)=>{QA_SHOT='shoulder';const p=u/d;redLids(t,1,9);const touch=CU.W.f1[1][1];const s0=CU.shots.find(x=>x.n==='shoulder').s;
  const k=(t-s0)/(touch-s0);const sx=k<1?lerp(560,268,EZ.o2(clamp(k))):268-(t-touch)*45;
  ctx.save();ctx.filter='blur(2.5px)';fig('sleeper',sx,1260,4.0,{eyes:'closed',tilt:-8,arms:[{none:true},{none:true}],c:{top:'#5a2420',skin:'#9a7470',hair:'#3a1a18'},shadow:false});ctx.restore();
  fig('you',120,1300,4.3,{back:true,arms:[{none:true},{none:true}],neck:neckPhones,c:{top:'#b08a20'},idle:false});
  const a=t-touch;const cx=200,cy=718;if(a>-.05&&a<.9){for(let i=0;i<3;i++){const q=Math.max(0,a);ctx.strokeStyle=`rgba(255,215,200,${.6*(1-q/.9)*(1-i*.3)})`;ctx.lineWidth=3;ctx.beginPath();ctx.arc(cx,cy,14+q*150+i*22,0,7);ctx.stroke()}}
  ctx.fillStyle='rgba(120,0,0,.22)';ctx.fillRect(0,0,W,H);vig(.55,160)};
// ============ 15. breath on your neck: a pale face in profile right behind you, its breath reaching the side of your neck
function profileHead(x,y,s,dir,skin,hair){ctx.save();ctx.translate(x,y);ctx.scale(s*dir,s);const o=2.6/s;
  shapeO(()=>{ctx.beginPath();ctx.moveTo(-15,-18);ctx.bezierCurveTo(-17,-38,15,-40,16,-16);ctx.quadraticCurveTo(17,-10,17,-7);ctx.quadraticCurveTo(22,-1,21,2);ctx.quadraticCurveTo(19,4,17,4);ctx.quadraticCurveTo(18,9,16,11);ctx.quadraticCurveTo(15,17,8,19);ctx.lineTo(4,30);ctx.lineTo(-12,30);ctx.quadraticCurveTo(-19,6,-15,-18);ctx.closePath()},skin,o);
  ctx.fillStyle=hair;ctx.beginPath();ctx.moveTo(-15,-18);ctx.bezierCurveTo(-17,-38,15,-40,16,-16);ctx.quadraticCurveTo(2,-26,-10,-8);ctx.quadraticCurveTo(-15,-12,-15,-18);ctx.fill();
  oblob(-4,-3,3.2,4.4,shade(skin,-.08),o*.7);
  ctx.strokeStyle=OLc;ctx.lineWidth=1.8;ctx.lineCap='round';ctx.beginPath();ctx.arc(10,-6,3,.2,Math.PI-.4);ctx.stroke();ctx.strokeStyle='rgba(90,80,120,.5)';ctx.beginPath();ctx.arc(10,-3,3.4,.3,Math.PI-.5);ctx.stroke();ctx.strokeStyle=OLc;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(13,9);ctx.lineTo(16.5,8.5);ctx.stroke();ctx.restore()}
SC.breath_neck=(t,u,d)=>{QA_SHOT='breath_neck';const p=u/d;redLids(t,.95,11);ctx.save();zoomAt(300,560,lerp(1,1.06,EZ.io(p)));
  oblob(214,700,15,26,shade(K.skin,-.05),2.6,.2);
  fig('you',128,1330,4.7,{back:true,arms:[{none:true},{none:true}],neck:neckPhones,c:{top:'#b08a20'},idle:false});
  ctx.save();ctx.filter='blur(1px)';profileHead(452,560,6.0,-1,'#c9b9b6','#3a1a18');ctx.restore();
  const M=[452-16.5*6,560+8.5*6],N_=[222,690];for(let i=0;i<4;i++){const ph=(t*.75+i/4)%1;const x0=lerp(M[0],N_[0],ph),y0=lerp(M[1],N_[1],ph);ctx.strokeStyle=`rgba(255,225,215,${.5*Math.sin(ph*Math.PI)})`;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x0+18,y0-6);ctx.bezierCurveTo(x0+6,y0-18,x0-6,y0+10,x0-18,y0);ctx.stroke()}
  const gb=.5+.5*Math.sin(t*9);ctx.fillStyle=`rgba(255,235,225,${.35+.3*gb})`;for(const [gx,gy] of[[214,684],[222,696],[212,708],[224,714]]){ctx.beginPath();ctx.arc(gx,gy,1.8,0,7);ctx.fill()}
  ctx.restore();ctx.fillStyle='rgba(120,0,0,.16)';ctx.fillRect(0,0,W,H);vig(.55,160)};
// ============ 16/17. rule two: your breath on the NOISE meter, then "don't breathe" -> 0
function breathMeter(t,val,flat){ctx.save();ctx.fillStyle='rgba(0,0,0,.55)';ctx.translate(0,-70);ctx.beginPath();ctx.roundRect(90,420,360,170,22);ctx.fill();ctx.strokeStyle='rgba(255,180,170,.35)';ctx.lineWidth=2;ctx.stroke();
  ctx.font='700 14px "JetBrains Mono"';ctx.fillStyle='#ffb4a8';ctx.textAlign='left';ctx.letterSpacing='3px';ctx.fillText('YOUR BREATH',112,452);ctx.letterSpacing='0px';ctx.font='68px "Bebas Neue"';ctx.fillStyle=val>0?'#fff':K.lime;ctx.fillText(Math.round(val)+' dB',112,520);
  ctx.strokeStyle=val>0?'#ffb4a8':K.lime;ctx.lineWidth=3;ctx.beginPath();for(let x=0;x<=300;x+=4){const y=560+(flat?0:Math.sin(x*.05+t*6)*Math.min(14,val*1.1)*Math.sin(x/300*Math.PI));x?ctx.lineTo(120+x,y):ctx.moveTo(120,y)}ctx.stroke();ctx.restore()}
SC.rule2_noise=(t,u,d)=>{redLids(t,.9,13);const v=evVal(CU.noise,t,.15);breathMeter(t,v,false);vig(.5,160)};
SC.dont_breathe=(t,u,d)=>{redLids(t,.75,13);const f0=CU.W.f4[1][1];const v=t<f0?evVal(CU.noise,t,.15)*(1-pr(t,f0-.5,f0)):0;breathMeter(t,v,t>f0);vig(.6,160)};
// ============ 18. they let you pass (seen from above)
SC.let_pass=(t,u,d)=>{QA_SHOT='let_pass';const p=u/d;const sc=lerp(0,120,p);vgr(0,H,'#2a2f3c','#1c212c');ctx.save();ctx.translate(0,sc);
  const r=mul(51);for(let i=0;i<90;i++){const x=r()*W,y=-200+r()*1200;if(Math.abs(x-270)<100)continue;const c=slpC(i);topDown(x,y,2.1+r()*.3,c.top,c.hair,(r()-.5)*.6,{arms:true})}ctx.restore();
  topDown(270,520,2.6*(1+.015*Math.sin(t*12)),K.must,K.must,Math.sin(t*6)*.05,{hood:true,phones:true,arms:true,swing:Math.sin(t*6)});vig(.45)};
// ============ 19/20. down, down
function stairsDown(t,dark,fy,s){vgr(0,H,'#151a26','#05070c');const vx=270,vy=330;for(let k=0;k<12;k++){const z=k/12;const y=lerp(960,vy,Math.pow(z,.6));const w=lerp(520,90,Math.pow(z,.6));ctx.fillStyle=shade('#3a4258',-z*.6);ctx.fillRect(vx-w/2,y-6,w,lerp(20,4,z));ctx.fillStyle='rgba(0,0,0,.4)';ctx.fillRect(vx-w/2,y+lerp(14,2,z),w,lerp(10,2,z))}
  ctx.strokeStyle='#59607a';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(40,700);ctx.lineTo(vx-50,vy+10);ctx.stroke();
  const sw_=Math.sin(t*7)*5;fig('you',270,fy,s,{back:true,step:Math.sin(t*7)*.7,bob:Math.abs(Math.sin(t*7))*-2,neck:neckPhones,arms:[{to:[-26+sw_*.3,-90+sw_],pole:[-44,-110],behind:false},{to:[26+sw_*.3,-90-sw_],pole:[44,-110],behind:false}]});
  {const g=ctx.createLinearGradient(0,240,0,560);g.addColorStop(0,'rgba(2,3,6,.95)');g.addColorStop(1,'rgba(2,3,6,0)');ctx.fillStyle=g;ctx.fillRect(0,240,W,320);ctx.fillStyle='rgba(2,3,6,.95)';ctx.fillRect(0,0,W,240)}
  ctx.fillStyle=`rgba(0,0,0,${dark})`;ctx.fillRect(0,0,W,H)}
SC.down1=(t,u,d)=>{QA_SHOT='down1';const p=EZ.io(u/d);stairsDown(t,.25,lerp(900,830,p),lerp(2.0,1.7,p));vig(.55)};
SC.down2=(t,u,d)=>{QA_SHOT='down2';const p=EZ.io(u/d);stairsDown(t,.5,lerp(760,690,p),lerp(1.45,1.2,p));ctx.save();ctx.fillStyle='#e7e2d0';ctx.beginPath();ctx.roundRect(360,260,92,54,6);ctx.fill();ctx.strokeStyle=OLc;ctx.lineWidth=3;ctx.stroke();ctx.font='34px "Bebas Neue"';ctx.fillStyle='#1b1e29';ctx.textAlign='center';ctx.fillText('B1 ↓',406,300);ctx.restore();vig(.6)};
// ============ 21. your fingertip finds the raised B1 (eyes shut: the letters appear where you touch)
const B1PATH=(()=>{const P=[];const seg=(a,b,n=8)=>{for(let i=0;i<=n;i++)P.push([lerp(a[0],b[0],i/n),lerp(a[1],b[1],i/n)])};const arc=(cx,cy,r,ry,a0,a1,n=12)=>{for(let i=0;i<=n;i++){const a=lerp(a0,a1,i/n);P.push([cx+Math.cos(a)*r,cy+Math.sin(a)*ry])}};
  seg([190,560],[190,380],10);seg([190,380],[226,380],3);arc(226,425,34,45,-Math.PI/2,Math.PI/2);seg([226,470],[196,470],3);seg([196,470],[232,470],3);arc(232,515,38,45,-Math.PI/2,Math.PI/2);seg([232,560],[190,560],3);
  const travel0=P.length;for(let i=1;i<=6;i++){const q=i/7;P.push([lerp(190,300,q),lerp(560,410,q)-Math.sin(q*Math.PI)*40,'up'])}seg([300,410],[330,380],4);seg([330,380],[330,560],10);return P})();
function b1Scene(t,q,o={}){redLids(t,.55,15);const n=Math.floor(q*(B1PATH.length-1));
  // the plate, barely there in the dark; the raised letters light up where your finger has been
  ctx.save();ctx.globalAlpha=.25;ctx.fillStyle='#b9bcc6';ctx.beginPath();ctx.roundRect(140,330,240,280,18);ctx.fill();ctx.restore();
  ctx.save();ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='rgba(255,215,190,.9)';ctx.shadowColor='rgba(255,180,150,.8)';ctx.shadowBlur=12;ctx.lineWidth=13;ctx.beginPath();let pen=false;for(let i=0;i<=n;i++){const p=B1PATH[i];if(p[2]==='up'){pen=false;continue}if(!pen){ctx.moveTo(p[0],p[1]);pen=true}else ctx.lineTo(p[0],p[1])}ctx.stroke();ctx.restore();
  const fq=q*(B1PATH.length-1),i0=Math.floor(fq),i1=Math.min(B1PATH.length-1,i0+1),fr=fq-i0;const tip=[lerp(B1PATH[i0][0],B1PATH[i1][0],fr),lerp(B1PATH[i0][1],B1PATH[i1][1],fr)];QA_SHOT='b1_plate';fpReach([600,1120],[tip[0]+2,tip[1]+3],{w:66,k:2.6,hand:'point',thumbToward:[tip[0]-120,tip[1]+40],pole:[720,800],name:'fingertip on B1',L1:420,L2:420});vig(.55,160)}
SC.b1_plate=(t,u,d)=>{const q=EZ.io(pr(t,CU.lines.g4.s+.3,CU.lines.g5.s+.5));b1Scene(t,q)};
// ============ 22/23. a small hand finds yours: your palm up, his hand lies across it, his fingers curl over the far edge of your palm
// holding hands, side view: your hand from the left, his small hand from the right.
// order: his fingertips (under your palm) -> your palm -> his hand -> your fingers wrapping over the back of his hand -> his thumb on your knuckle
function clasp(t,arrive,curl,tap,o={}){const cx=o.x??270,cy=o.y??520,s=o.s??1;ctx.save();ctx.translate(cx,cy);if(o.rot)ctx.rotate(o.rot);ctx.scale(s,s);const ol=2.8/s;
  const sl=(1-EZ.o3(arrive))*420;
  if(!o.noSleeves)tube([[-330,90],[-62,10]],72,K.must,ol);                                  // your sleeve
  ctx.save();ctx.translate(sl,0);if(!o.noSleeves)tube([[330,-70],[78,-6]],40,K.red,ol);        // his sleeve
  if(curl>.2)union([0,1,2].map(i=>({t:[[22,10+i*9],[-6,22+i*8],[-14,16+i*8]],w:11})),shade(K.skinO,-.1),ol);ctx.restore(); // his fingertips, under your palm
  union([{x:-32,y:4,rx:40,ry:33},{t:[[-40,30],[-14,46]],w:20}],K.skin,ol);    // your palm (+ the base of your thumb below)
  ctx.save();ctx.translate(sl,0);union([{x:36,y:-2,rx:30,ry:25}],K.skinO,ol);ctx.restore(); // his small hand, back toward us
  // your four fingers: straight while he arrives, then they close over the back of his hand
  const P=[];for(let i=0;i<4;i++){const y=-22+i*12;const L=lerp(46,30,curl);P.push({t:[[-4,y],[lerp(36,30,curl),y+lerp(0,4,curl)],[lerp(52,42,curl),y+lerp(0,16,curl)]],w:12})}union(P,K.skin,ol);
  // his thumb: rests on your index knuckle, lifts and presses on each tap
  if(arrive>.6){ctx.save();ctx.translate(sl,0);const lift=tap*10;tube([[34,-24],[12,-34-lift],[-4,-30-lift]],12,K.skinO,ol);ctx.restore()}
  ctx.restore();return{tx:cx+(-4)*s,ty:cy+(-30)*s}}
SC.small_hand=(t,u,d)=>{QA_SHOT='small_hand';redLids(t,.6,17);const t0=CU.lines.h1.s;const arr=EZ.io(pr(t,t0+.1,t0+1.0)),curl=EZ.io(pr(t,t0+1.0,t0+1.6));clasp(t,arr,curl,0,{s:2.2,y:500});vig(.55,160)};
SC.taps_red=(t,u,d)=>{QA_SHOT='taps_red';redLids(t,.6,17);let tk=0;CU.tapsOllie.forEach(x=>{const a=t-x;if(a>-.12&&a<.22){const q=a<0?(a+.12)/.12:1-a/.22;tk=Math.max(tk,q)}});const h=clasp(t,1,1,tk,{s:2.2,y:500});
  for(const x of CU.tapsOllie){const a=t-x;if(a>0&&a<.8){ctx.strokeStyle=`rgba(255,200,140,${.7*(1-a/.8)})`;ctx.lineWidth=3;ctx.beginPath();ctx.arc(h.tx,h.ty,30+a*200,0,7);ctx.stroke();ctx.fillStyle=`rgba(255,170,90,${.13*Math.sin(Math.min(1,a/.8)*Math.PI)})`;ctx.fillRect(0,0,W,H)}}vig(.55,160)};
