function neckPhones(g){ctx.lineCap='round';ctx.strokeStyle=OLc;ctx.lineWidth=4.2;ctx.beginPath();ctx.arc(0,g.shY+1,12,.25,Math.PI-.25);ctx.stroke();ctx.strokeStyle='#5b6274';ctx.lineWidth=1.8;ctx.stroke();orr(-15,g.shY+4,7,10,3,'#2b2f3a',g.oo);orr(8,g.shY+4,7,10,3,'#2b2f3a',g.oo)}
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
SC.rule1_red=(t,u,d)=>{const p=u/d;const e4=CU.lines.e4.s;const sag=pr(t,e4-.2,e4+1.0);const jolt=t>e4+1.0&&t<e4+1.25;const k=1-.75*EZ.io(sag)+.06*Math.sin(t*1.7);
  redLids(t,jolt?1.15:k,7);ctx.save();ctx.filter='blur(9px)';ctx.globalAlpha=.35*k;const r=mul(9);for(let i=0;i<6;i++){const x=r()*W,y=300+r()*400;figHead('sleeper',x,y,1.6+r(),{eyes:'closed',arms:[{none:true},{none:true}],c:{top:'#2a0a08',skin:'#8a6a66'}})}ctx.restore();
  // heavy lids: top and bottom close in as you sag toward sleep
  const lid=EZ.io(sag)*(jolt?0:1)*400;if(lid>1){ctx.fillStyle='#050000';ctx.beginPath();ctx.ellipse(270,-400+lid,560,380,0,0,7);ctx.fill();ctx.beginPath();ctx.ellipse(270,1360-lid,560,380,0,0,7);ctx.fill()}vig(.5,160)};
// ============ 14. shoulders brush yours (we walk past them: the camera moves, they stay still)
SC.shoulder=(t,u,d)=>{const p=u/d;redLids(t,1,9);const pan=lerp(-60,260,EZ.io(p));
  ctx.save();ctx.translate(-pan,0);ctx.filter='blur(4px)';fig('sleeper',300,1250,4.2,{eyes:'closed',tilt:-10,arms:[{none:true},{none:true}],c:{top:'#5a2420',skin:'#9a7470'}});ctx.restore();
  const touch=CU.W.f1[1][1];const a=t-touch;if(a>0&&a<.8){for(let i=0;i<3;i++){ctx.strokeStyle=`rgba(255,210,200,${.5*(1-a/.8)*(1-i*.3)})`;ctx.lineWidth=3;ctx.beginPath();ctx.arc(70,640,30+a*160+i*24,-1.2,1.2);ctx.stroke()}}
  ctx.fillStyle='rgba(120,0,0,.18)';ctx.fillRect(0,0,W,H);vig(.55,160)};
// ============ 15. breath on your neck: a pale face in profile at your ear
function profileHead(x,y,s,dir,skin,hair){ctx.save();ctx.translate(x,y);ctx.scale(s*dir,s);const o=2.6/s;
  shapeO(()=>{ctx.beginPath();ctx.moveTo(-14,-20);ctx.bezierCurveTo(-16,-36,14,-38,16,-18);ctx.lineTo(18,-8);ctx.lineTo(23,-2);ctx.lineTo(18,1);ctx.lineTo(17,8);ctx.quadraticCurveTo(14,18,2,19);ctx.lineTo(-6,26);ctx.lineTo(-14,24);ctx.quadraticCurveTo(-20,4,-14,-20);ctx.closePath()},skin,o);
  ctx.fillStyle=hair;ctx.beginPath();ctx.moveTo(-14,-20);ctx.bezierCurveTo(-16,-36,14,-38,16,-18);ctx.quadraticCurveTo(0,-26,-10,-12);ctx.closePath();ctx.fill();
  ctx.strokeStyle=OLc;ctx.lineWidth=1.8;ctx.beginPath();ctx.arc(10,-6,3,.2,Math.PI-.4);ctx.stroke();ctx.strokeStyle='rgba(90,80,120,.5)';ctx.beginPath();ctx.arc(10,-3,3.4,.3,Math.PI-.5);ctx.stroke();ctx.strokeStyle=OLc;ctx.beginPath();ctx.moveTo(15,10);ctx.lineTo(19,10);ctx.stroke();ctx.restore()}
SC.breath_neck=(t,u,d)=>{const p=u/d;redLids(t,.95,11);ctx.save();zoomAt(400,420,lerp(1,1.06,EZ.io(p)));ctx.filter='blur(1.5px)';profileHead(470,420,6.2,-1,'#c9b9b6','#3a1a18');ctx.restore();
  // breath: soft curling wisps from its mouth toward your ear (off-frame left)
  for(let i=0;i<4;i++){const ph=(t*.7+i/4)%1;ctx.strokeStyle=`rgba(255,220,210,${.35*(1-ph)})`;ctx.lineWidth=3;ctx.beginPath();const x0=330-ph*200,y0=480+i*6;ctx.moveTo(x0,y0);ctx.bezierCurveTo(x0-30,y0-20,x0-60,y0+20,x0-90,y0);ctx.stroke()}
  ctx.fillStyle='rgba(120,0,0,.16)';ctx.fillRect(0,0,W,H);vig(.55,160)};
// ============ 16/17. rule two: your breath on the NOISE meter, then "don't breathe" -> 0
function breathMeter(t,val,flat){ctx.save();ctx.fillStyle='rgba(0,0,0,.55)';ctx.translate(0,-70);ctx.beginPath();ctx.roundRect(90,420,360,170,22);ctx.fill();ctx.strokeStyle='rgba(255,180,170,.35)';ctx.lineWidth=2;ctx.stroke();
  ctx.font='700 14px "JetBrains Mono"';ctx.fillStyle='#ffb4a8';ctx.textAlign='left';ctx.letterSpacing='3px';ctx.fillText('YOUR BREATH',112,452);ctx.letterSpacing='0px';ctx.font='68px "Bebas Neue"';ctx.fillStyle=val>0?'#fff':K.lime;ctx.fillText(Math.round(val)+' dB',112,520);
  ctx.strokeStyle=val>0?'#ffb4a8':K.lime;ctx.lineWidth=3;ctx.beginPath();for(let x=0;x<=300;x+=4){const y=560+(flat?0:Math.sin(x*.05+t*6)*Math.min(14,val*1.1)*Math.sin(x/300*Math.PI));x?ctx.lineTo(120+x,y):ctx.moveTo(120,y)}ctx.stroke();ctx.restore()}
SC.rule2_noise=(t,u,d)=>{redLids(t,.9,13);const v=evVal(CU.noise,t,.15);breathMeter(t,v,false);vig(.5,160)};
SC.dont_breathe=(t,u,d)=>{redLids(t,.75,13);const f0=CU.W.f4[1][1];const v=t<f0?evVal(CU.noise,t,.15)*(1-pr(t,f0-.5,f0)):0;breathMeter(t,v,t>f0);vig(.6,160)};
// ============ 18. they let you pass (seen from above)
SC.let_pass=(t,u,d)=>{QA_SHOT='let_pass';const p=u/d;const sc=lerp(0,120,p);vgr(0,H,'#2a2f3c','#1c212c');ctx.save();ctx.translate(0,sc);
  const r=mul(51);for(let i=0;i<90;i++){const x=r()*W,y=-200+r()*1200;if(Math.abs(x-270)<70)continue;const c=slpC(i);topDown(x,y,2.1+r()*.3,c.top,c.hair,(r()-.5)*.6,{arms:true})}ctx.restore();
  topDown(270,520,2.6,K.must,K.must,0,{hood:true,phones:true,arms:true});vig(.45)};
// ============ 19/20. down, down
function stairsDown(t,dark,fy,s){vgr(0,H,'#151a26','#05070c');const vx=270,vy=330;for(let k=0;k<12;k++){const z=k/12;const y=lerp(960,vy,Math.pow(z,.6));const w=lerp(520,90,Math.pow(z,.6));ctx.fillStyle=shade('#3a4258',-z*.6);ctx.fillRect(vx-w/2,y-6,w,lerp(20,4,z));ctx.fillStyle='rgba(0,0,0,.4)';ctx.fillRect(vx-w/2,y+lerp(14,2,z),w,lerp(10,2,z))}
  ctx.strokeStyle='#59607a';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(40,700);ctx.lineTo(vx-50,vy+10);ctx.stroke();
  fig('you',270,fy,s,{back:true,step:Math.sin(t*4)*.6,neck:neckPhones});
  ctx.fillStyle=`rgba(0,0,0,${dark})`;ctx.fillRect(0,0,W,H)}
SC.down1=(t,u,d)=>{QA_SHOT='down1';stairsDown(t,.25,lerp(860,880,u/d),1.9);vig(.55)};
SC.down2=(t,u,d)=>{QA_SHOT='down2';stairsDown(t,.5,lerp(700,720,u/d),1.3);ctx.save();ctx.fillStyle='#e7e2d0';ctx.beginPath();ctx.roundRect(360,260,92,54,6);ctx.fill();ctx.strokeStyle=OLc;ctx.lineWidth=3;ctx.stroke();ctx.font='34px "Bebas Neue"';ctx.fillStyle='#1b1e29';ctx.textAlign='center';ctx.fillText('B1 ↓',406,300);ctx.restore();vig(.6)};
// ============ 21. your fingertip finds the raised B1 (eyes shut: the letters appear where you touch)
const B1PATH=(()=>{const P=[];const seg=(a,b,n=8)=>{for(let i=0;i<=n;i++)P.push([lerp(a[0],b[0],i/n),lerp(a[1],b[1],i/n)])};const arc=(cx,cy,r,ry,a0,a1,n=12)=>{for(let i=0;i<=n;i++){const a=lerp(a0,a1,i/n);P.push([cx+Math.cos(a)*r,cy+Math.sin(a)*ry])}};
  seg([190,560],[190,380],10);seg([190,380],[226,380],3);arc(226,425,34,45,-Math.PI/2,Math.PI/2);seg([226,470],[196,470],3);seg([196,470],[232,470],3);arc(232,515,38,45,-Math.PI/2,Math.PI/2);seg([232,560],[190,560],3);
  seg([300,410],[330,380],4);seg([330,380],[330,560],10);return P})();
function b1Scene(t,q,o={}){redLids(t,.55,15);const n=Math.floor(q*(B1PATH.length-1));
  // the plate, barely there in the dark; the raised letters light up where your finger has been
  ctx.save();ctx.globalAlpha=.25;ctx.fillStyle='#b9bcc6';ctx.beginPath();ctx.roundRect(140,330,240,280,18);ctx.fill();ctx.restore();
  ctx.save();ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='rgba(255,215,190,.9)';ctx.shadowColor='rgba(255,180,150,.8)';ctx.shadowBlur=12;ctx.lineWidth=13;ctx.beginPath();for(let i=0;i<=n;i++){const p=B1PATH[i];if(i&&Math.hypot(p[0]-B1PATH[i-1][0],p[1]-B1PATH[i-1][1])>40)ctx.moveTo(p[0],p[1]);else i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1])}ctx.stroke();ctx.restore();
  const tip=B1PATH[Math.max(0,n)];QA_SHOT='b1_plate';fpReach([600,1120],[tip[0]+2,tip[1]+3],{w:66,k:2.6,hand:'point',thumbToward:[tip[0]-120,tip[1]+40],pole:[720,800],name:'fingertip on B1',L1:420,L2:420});vig(.55,160)}
SC.b1_plate=(t,u,d)=>{const q=EZ.io(pr(t,CU.lines.g4.s+.3,CU.lines.g5.s+.5));b1Scene(t,q)};
// ============ 22/23. a small hand finds yours: your palm up, his hand lies across it, his fingers curl over the far edge of your palm
// holding hands, side view: your hand from the left, his small hand from the right.
// order: his fingertips (under your palm) -> your palm -> his hand -> your fingers wrapping over the back of his hand -> his thumb on your knuckle
function clasp(t,arrive,curl,tap,o={}){const cx=o.x??270,cy=o.y??520,s=o.s??1;ctx.save();ctx.translate(cx,cy);ctx.scale(s,s);const ol=2.8/s;
  const sl=(1-EZ.o3(arrive))*420;
  tube([[-330,90],[-62,10]],72,K.must,ol);                                  // your sleeve
  ctx.save();ctx.translate(sl,0);tube([[330,-70],[78,-6]],40,K.red,ol);        // his sleeve
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
  for(const x of CU.tapsOllie){const a=t-x;if(a>0&&a<.8){ctx.strokeStyle=`rgba(255,200,140,${.7*(1-a/.8)})`;ctx.lineWidth=3;ctx.beginPath();ctx.arc(h.tx,h.ty,30+a*200,0,7);ctx.stroke();ctx.fillStyle=`rgba(255,170,90,${.16*(1-a/.8)})`;ctx.fillRect(0,0,W,H)}}vig(.55,160)};
