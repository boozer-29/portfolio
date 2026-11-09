// ============ SCENES 3 ============
function bigHead(o,x,y,s,pose={}){ctx.save();ctx.translate(x,y+55*s);ctx.scale(s,s);head(Object.assign({skin:'#e0b48c',top:C.must,hair:'#3a2a20',hairStyle:'short',eyes:'open',s:1},o),Object.assign({tilt:0,turn:0},pose));ctx.restore()}
function streetNight(t,c,o={}){
  view(c,.2,()=>{SKY.night();stars(t,90,5,-600,150)});
  view(c,.4,()=>{skylineLayer({seed:31,base:520,minW:34,maxW:70,minH:150,maxH:320,col:'#12233c',winFn:(x,y,q)=>q<.3?'#d9b060':null,gap:2,roof:true,beacon:true,t})});
  view(c,.65,()=>{for(let i=0;i<5;i++){const x=-30+i*130;building(x,640,126,300+((i*53)%90),i%2?'#0f1a2e':'#142238',{winFn:(wx,wy,q)=>q<.32?'#e8c070':null,roof:true,t});blk(x+10,590,106,50,3,'#0a1322');rect(x+14,600,98,34,'#2a2418');glow(x+63,618,60,'#e8c070',.25)}fog(t,560,120,'#2a4a7a',.1)});
  view(c,1,()=>{vgrad(640,1100,[[0,'#2a3040'],[1,'#10141f']]);rect(-100,640,W+200,6,'#3a4258');vgrad(646,700,[[0,'#3a4258'],[1,'#20263a']]);ctx.fillStyle='rgba(255,255,255,.18)';for(let k=0;k<5;k++){const y=740+k*k*14+k*30;for(let i=0;i<6;i++)ctx.fillRect(i*120-((k*30)%120),y,50+k*10,3+k)}
    for(const x of[60,300,520])lampPost(x,700,230,{glow:140,flick:(o.flick&&Math.sin(t*40)>0.3)?.4:1})})}
const CROWD=(()=>{const a=[];const rows=[[700,.9,[40,130,225,320,415,500]],[800,1.25,[70,190,310,430]],[905,1.6,[110,300,490]]];let k=0;const r=mul(77);for(const [y,s,xs] of rows)for(const x of xs){a.push({x:x+(r()-.5)*14,y:y+(r()-.5)*10,s,v:(k%6)+1,ord:(x/540)*6.5+(y-700)/200*1.2});k++}return a})();
SC.woman=(t,u,d)=>{const p=u/d;let c=cam(p,{z0:1,z1:1.1,y0:0,y1:-20,r0:-1,r1:1});c=shakeCam(c,t,.25,11);ctx.save();streetNight(t,c,{});
  view(c,1.05,()=>{glow(270,500,260,'#ffd27a',.28);sleeper(270,930,3.7,9,t,{top:'#d98fb0',bottom:'#8f6fa0',sway:.5,hum:true,rim:'#ffd27a',rimSide:-1});});dust(t,100,300,340,500,26,12,'#ffd9a0',.3,.5);ctx.restore()};
SC.dominoes=(t,u,d)=>{const p=u/d;let c=cam(p,{z0:1,z1:1.06,x0:0,x1:-12});c=shakeCam(c,t,.3,12);streetNight(t,c,{});
  view(c,1,()=>{const step=Math.floor(u*30/4);CROWD.slice().sort((a,b)=>a.y-b.y).forEach(q=>{const stand=step>=Math.floor(q.ord);const justPop=stand&&step-Math.floor(q.ord)<2;
    if(!stand){sleeperAt(q.x,q.y+8*q.s,q.s*.95,q.v,'lie','closed')}
    else{sleeperAt(q.x,q.y,q.s,q.v,'stand','closed');if(justPop){glow(q.x,q.y-50*q.s,60*q.s,'#E6F7FF',.35);ctx.save();ctx.globalAlpha=.6;ctx.fillStyle='#8a93a8';for(let k=0;k<6;k++)circ(q.x+(k-3)*10*q.s,q.y-2,6*q.s,'rgba(138,147,168,.5)');ctx.restore()}}});});
  dust(t,0,500,W,420,24,13,'#9fb4d8',.25,.8)};
function alarmScene(t,u,d,snap){const p=u/d;let c=cam(p,{z0:1,z1:1.07,x0:0,x1:-14});c=shakeCam(c,t,.3,14);streetNight(t,c,{});
  view(c,1,()=>{carSide(86,770,1.45,'#4a3a3a');const on=Math.floor(t*6)%2;if(snap!==1&&on){glow(30,745,80,'#ff9a2a',.8);glow(150,745,60,'#ff9a2a',.5)}
    if(snap!==1)for(let i=0;i<3;i++){const ph=(t*2+i/3)%1;ctx.strokeStyle=`rgba(255,210,120,${.6*(1-ph)})`;ctx.lineWidth=3;ctx.beginPath();ctx.arc(86,700,30+ph*190,-.9,.9);ctx.stroke()}
    const snapNow=snap===1||(snap===0&&p>.5);CROWD.slice().sort((a,b)=>a.y-b.y).forEach(q=>{if(q.x<150&&q.y>740)return;sleeperAt(q.x,q.y,q.s,q.v,snapNow?'turnL':'stand','closed')})});
  if(snap===0&&p>.5&&p<.56){ctx.fillStyle='rgba(255,255,255,.12)';ctx.fillRect(0,0,W,H)}
  dust(t,0,500,W,420,20,15,'#9fb4d8',.22,.8)}
SC.alarm=(t,u,d)=>alarmScene(t,u,d,0);SC.alarm2=(t,u,d)=>alarmScene(t,u,d,1);SC.blk=()=>rect(0,0,W,H,'#000');
// ---------- bed: headphones + rain app
SC.bed=(t,u,d)=>{const p=u/d;let c=cam(p,{z0:1,z1:1.1});c=shakeCam(c,t,.4,15);vgrad(0,H,[[0,'#04060c'],[1,'#080b14']]);
  view(c,.3,()=>blurred(6,()=>{blk(40,100,200,300,10,'#0b1830');for(let i=0;i<30;i++){const x=60+((i*61+t*160)%170),y=120+((i*97+t*340)%260);ctx.strokeStyle='rgba(170,200,255,.5)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-3,y+14);ctx.stroke()}glow(140,250,200,'#6fb8ff',.2)}));
  view(c,1,()=>{vgrad(660,1100,[[0,'#1b2a44'],[1,'#0d1626']]);blk(-40,640,600,140,30,'#243a5c',{hi:.15});blk(100,600,340,90,40,'#2e4670');
    bigHead({hood:false,eyes:'wide',phones:true,hairStyle:'short',hair:'#3a2a20',skin:'#e0b48c'},270,440,9,{tilt:-3});
    // blue phone glow on face
    ctx.save();ctx.globalCompositeOperation='screen';const g=ctx.createRadialGradient(270,640,10,270,520,320);g.addColorStop(0,'rgba(100,170,255,.65)');g.addColorStop(1,'rgba(100,170,255,0)');ctx.fillStyle=g;ctx.fillRect(0,300,540,500);ctx.restore();
    // hands + phone (back facing us) at bottom
    blk(150,690,240,250,26,'#10131c',{hi:.25});ctx.fillStyle='#0b0e16';rr(165,705,210,220,18);ctx.fill();ctx.fillStyle='rgba(120,180,255,.18)';ctx.fillRect(170,712,200,14);
    for(const sd of[-1,1])blk(270+sd*150-22,820,44,180,18,C.must);for(const sd of[-1,1])blk(270+sd*130-18,760,36,60,15,'#e0b48c');
    ctx.fillStyle='rgba(180,220,255,.9)';ctx.font='600 14px "JetBrains Mono"';ctx.textAlign='center';ctx.fillText('♪ RAIN SOUNDS',270,660);
  })};
SC.earcup=(t,u,d)=>{const p=u/d;let c=cam(p,{z0:1,z1:1.12});const lift=p<.25?0:p<.8?EZ.o3(pr(p,.25,.4)):1-EZ.ob(pr(p,.8,.92));const hum=p>.3&&p<.84;c=shakeCam(c,t,hum?2.2:.4,16);
  vgrad(0,H,[[0,'#0a1224'],[1,'#05080f']]);glow(270,420,320,'#6fb8ff',.2);
  view(c,1,()=>{bigHead({hood:false,eyes:hum?'wide':'open',hairStyle:'short',hair:'#3a2a20',mouth:hum?'o':null},270,430,10.4,{tilt:0});
    // headphones: right cup stays, left lifts away
    ctx.save();ctx.translate(270,310);ctx.strokeStyle='#e8e8e0';ctx.lineWidth=20;ctx.lineCap='round';ctx.beginPath();ctx.arc(0,60,155,Math.PI*1.04,Math.PI*1.96);ctx.stroke();ctx.restore();
    blk(398,380,66,150,24,'#e8e8e0');blk(78-lift*70,380-lift*30,66,150,24,'#e8e8e0',{hi:.2});
    // hand pulling the cup
    ctx.save();ctx.translate(60-lift*80,430-lift*30);blk(-40,-30,60,60,22,'#e0b48c');ctx.translate(-30,40);ctx.rotate(.4);blk(-26,0,52,260,20,C.must);ctx.restore();
    if(hum){for(let i=0;i<6;i++){const ph=(t*2.4+i/6)%1;ctx.strokeStyle=`rgba(230,247,255,${.7*(1-ph)})`;ctx.lineWidth=4*(1-ph)+1;ctx.beginPath();ctx.arc(110-lift*70,455,20+ph*260,-1.2,1.2);ctx.stroke()}
      ctx.save();ctx.globalAlpha=.25;ctx.fillStyle='#E6F7FF';ctx.fillRect(0,0,W,H);ctx.restore()}})};
function insert(o,name,item){rect(0,0,W,H,'#0a1224');vgrad(0,H,[[0,'#10182c'],[1,'#05080f']]);glow(270,400,320,C.amb,.25);const h=hand(performance&&0,0);bigHead(o,270,430,10.2,{tilt:0});item();ctx.save();ctx.font='86px Caveat';ctx.fillStyle='#fff';ctx.textAlign='center';ctx.lineWidth=7;ctx.strokeStyle='rgba(0,0,0,.65)';ctx.strokeText(name,270,630);ctx.fillText(name,270,630);ctx.restore()}
SC.ins_dj=(t,u,d)=>{const p=u/d;ctx.save();ctx.translate(270,430);ctx.scale(1+p*.06,1+p*.06);ctx.translate(-270,-430);insert({hood:true,top:'#a855f7',phones:true,hairStyle:'none',eyes:'half'},'DJ',()=>{});ctx.restore()};
SC.ins_maya=(t,u,d)=>{const p=u/d;ctx.save();ctx.translate(270,430);ctx.scale(1+p*.06,1+p*.06);ctx.translate(-270,-430);insert({hairStyle:'long',hair:'#3a2a1a',skin:'#c99a7a',eyes:'half'},'MAYA',()=>{for(const sd of[-1,1]){blk(270+sd*146-11,400,22,40,10,'#f4f4ef',{hi:.1});ctx.strokeStyle='#f4f4ef';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(270+sd*146,440);ctx.quadraticCurveTo(270+sd*166,520,270+sd*140,600);ctx.stroke()}});ctx.restore()};
SC.ins_reyes=(t,u,d)=>{const p=u/d;ctx.save();ctx.translate(270,430);ctx.scale(1+p*.06,1+p*.06);ctx.translate(-270,-430);insert({hairStyle:'none',beard:'#9aa0a8',skin:'#d3a47e',hair:'#9aa0a8',brow:1,eyes:'half'},'REYES',()=>{for(const sd of[-1,1]){blk(270+sd*146-13,398,26,46,12,'#ff8a1a',{hi:.25})}});ctx.restore()};
// ---------- dawn window / gridlock / plane
SC.dawn_window=(t,u,d)=>{const p=u/d;let c=cam(p,{z0:1,z1:1.1,x0:0,x1:-14});c=shakeCam(c,t,.5,17);cityDawn(t,{x:-10,y:10,z:1.08,rot:0});
  view(c,1.1,()=>{rect(-120,-120,70,1300,'#05070d');rect(W-50,-120,170,1300,'#05070d');rect(-120,-120,W+240,50,'#05070d');vgrad(660,1100,[[0,'#10121a'],[1,'#07080c']]);rect(-120,656,W+240,6,'#2a2f3d');
    person({x:90,y:1120,s:5.6,top:C.must,hood:true,back:true,hairStyle:'none',shadow:0,pose:{lean:-2}});
    ctx.fillStyle='rgba(255,255,255,.05)';ctx.fillRect(60,60,200,520);ctx.fillStyle='rgba(255,255,255,.03)';ctx.fillRect(300,60,120,520)})};
SC.gridlock=(t,u,d)=>{const p=u/d;let c=cam(p,{z0:1,z1:1.08,y0:-10,y1:10});c=shakeCam(c,t,.3,18);
  view(c,.2,()=>{SKY.dead()});view(c,.5,()=>{skylineLayer({seed:3,base:420,minW:34,maxW:70,minH:100,maxH:220,col:'#2a3050',gap:2,roof:true});fog(t,300,160,'#c98d64',.18)});
  view(c,1,()=>{vgrad(400,1100,[[0,'#2f344a'],[1,'#10141f']]);ctx.fillStyle='rgba(255,255,255,.08)';for(let i=0;i<9;i++){const y=430+i*i*7+i*24;ctx.fillRect(-100,y,W+200,2)}
    const r=mul(33);const cols=['#4a5568','#7a3a3a','#3a5a66','#7a7a4a','#5a4a6a','#2f3a4a'];for(let row=0;row<5;row++){const y=470+row*row*22+row*40,s=.45+row*.34;for(let i=0;i<6;i++){carRear(30+i*(95+row*14)+(row%2)*40,y,s,cols[Math.floor(r()*6)],{driver:'slump',hazard:r()>.6,t})}}});
  fog(t,520,260,'#c98d64',.1)};
function airliner(x,y,s,rot){ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.scale(s,s);
  // far wing + tail (behind fuselage)
  ctx.fillStyle='#9aa1b0';ctx.beginPath();ctx.moveTo(-6,-8);ctx.lineTo(34,-8);ctx.lineTo(-22,-50);ctx.lineTo(-52,-50);ctx.closePath();ctx.fill();
  ctx.fillStyle='#b7bdca';ctx.beginPath();ctx.moveTo(-96,-12);ctx.lineTo(-64,-12);ctx.lineTo(-88,-62);ctx.lineTo(-110,-62);ctx.closePath();ctx.fill();ctx.fillStyle='#c33';ctx.beginPath();ctx.moveTo(-92,-34);ctx.lineTo(-72,-34);ctx.lineTo(-82,-60);ctx.lineTo(-104,-60);ctx.closePath();ctx.fill();
  // fuselage
  blk(-114,-15,226,30,15,'#e8ecf2',{hi:.08,lo:-.14});ctx.fillStyle='#e8ecf2';ctx.beginPath();ctx.moveTo(100,-15);ctx.quadraticCurveTo(146,-2,102,15);ctx.fill();
  ctx.fillStyle='#c33';ctx.fillRect(-112,3,214,4);ctx.fillStyle='#10192b';for(let i=0;i<15;i++)ctx.fillRect(-92+i*11.5,-7,5,6);ctx.beginPath();ctx.moveTo(104,-9);ctx.lineTo(124,-4);ctx.lineTo(104,-3);ctx.fill();
  // near wing + engine
  ctx.fillStyle='#cdd2dd';ctx.beginPath();ctx.moveTo(-8,10);ctx.lineTo(36,10);ctx.lineTo(-24,78);ctx.lineTo(-62,78);ctx.closePath();ctx.fill();ctx.fillStyle='#b4bac7';ctx.beginPath();ctx.moveTo(-8,10);ctx.lineTo(8,10);ctx.lineTo(-44,78);ctx.lineTo(-62,78);ctx.closePath();ctx.fill();
  blk(-30,46,34,15,7,'#7a8090',{hi:.25});ctx.fillStyle='#cdd2dd';ctx.beginPath();ctx.moveTo(-100,8);ctx.lineTo(-70,8);ctx.lineTo(-96,34);ctx.lineTo(-118,34);ctx.closePath();ctx.fill();ctx.restore()}
SC.plane=(t)=>planeScene(t,true);
function planeScene(t,crash){const [f0,f1]=CU.planeFlight,[h0,h1]=CU.planeHold;const hold=h1-h0;const tt=t<=h0?t:t<h1?h0:t-hold;const q=clamp((tt-f0)/((f1-hold)-f0));const q2=Math.pow(q,1.5);
    const bx=(k)=>{const a=(1-k)*(1-k),b2=2*(1-k)*k,c2=k*k;return[a*-70+b2*150+c2*330,a*150+b2*210+c2*500]};
    const [px,py]=bx(q2);const [nx,ny]=bx(Math.min(1,q2+.02));const ang=Math.atan2(ny-py,nx-px)+.12+q2*.2;const sc=lerp(.85,1.5,q2);
    const hook=()=>{ctx.save();ctx.globalAlpha=.9;for(let i=0;i<8;i++){const k=Math.max(0,q2-i*.05);const [sx,sy]=bx(k);smokeCol(t,sx,sy,60+i*10,34+i*6,'#1d1e26',.5-i*.03,19+i)}ctx.restore();ctx.strokeStyle='rgba(40,40,50,.75)';ctx.lineWidth=14;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-70,150);for(let k=0;k<=q2;k+=.03){const [sx,sy]=bx(k);ctx.lineTo(sx-12,sy-4)}ctx.stroke();airliner(px,py,sc,ang);glow(px-28*sc,py+8*sc,46*sc,'#ff8a3a',.55+.3*Math.sin(t*30))};
    cityDawn(t<h0||t>=h1?t:h0,{x:-14,y:10,z:1.1,rot:0},{hook});
    if(crash&&q>.86){const k=(q-.86)/.14;ctx.fillStyle=`rgba(255,255,255,${(1-k)*.95})`;ctx.fillRect(0,0,W,H);ctx.save();ctx.globalCompositeOperation='lighter';for(let i=0;i<4;i++){ctx.strokeStyle=`rgba(255,240,220,${.6*(1-k)})`;ctx.lineWidth=6;ctx.beginPath();ctx.arc(330,490,k*520+i*40,0,7);ctx.stroke()}ctx.restore()}}
SC.plane_a=(t)=>planeScene(t,false);SC.plane_b=(t)=>planeScene(t,false);SC.plane=(t)=>planeScene(t,true);
// ---------- corridor + microsleep
function corridorWorld(t,c,o={}){view(c,.5,()=>{vgrad(-100,900,[[0,'#14213a'],[1,'#0c1628']]);
    // perspective walls
    const vx=270,vy=430;ctx.fillStyle='#1a2a47';ctx.beginPath();ctx.moveTo(-60,-60);ctx.lineTo(190,330);ctx.lineTo(190,540);ctx.lineTo(-60,980);ctx.fill();ctx.fillStyle='#1a2a47';ctx.beginPath();ctx.moveTo(600,-60);ctx.lineTo(350,330);ctx.lineTo(350,540);ctx.lineTo(600,980);ctx.fill();
    ctx.fillStyle='#10192d';ctx.fillRect(190,330,160,210);ctx.fillStyle='#0b1220';ctx.fillRect(210,360,120,180);ctx.fillStyle='#223a64';ctx.beginPath();ctx.moveTo(-60,980);ctx.lineTo(190,540);ctx.lineTo(350,540);ctx.lineTo(600,980);ctx.fill();
    ctx.fillStyle='#0f1930';ctx.beginPath();ctx.moveTo(-60,-60);ctx.lineTo(190,330);ctx.lineTo(350,330);ctx.lineTo(600,-60);ctx.fill();
    for(const sd of[-1,1]){for(let i=0;i<2;i++){const k=i?.55:.2;const dx=sd<0?lerp(-20,190,k):lerp(560,350,k);const dh=lerp(520,160,k),dw=lerp(160,52,k);ctx.fillStyle='#0d1424';ctx.fillRect(dx-(sd<0?0:dw),vy-dh*.5-10,dw,dh);const gl=.5+.5*Math.sin(t*3+i);glow(dx+(sd<0?dw:-dw)*.5,vy-dh*.5-30,90,C.amb,.35)}}
    const fl=o.flick?(Math.sin(t*37)>.4?1:.5):1;glow(270,70,360,'#ffe0a8',.3*fl);glow(270,330,200,C.amb,.22*fl)})}
SC.nap1=(t,u,d)=>{const p=u/d;let c=cam(p,{z0:1,z1:1.12,x0:0,x1:-10});c=shakeCam(c,t,.8,20);ctx.save();corridorWorld(t,c,{});
  view(c,1,()=>{const nod=Math.sin(p*7)*.6+p*.8;person({x:190,y:880,s:3.4,top:'#7a5a4a',bottom:'#3a3a48',hairStyle:'short',hair:'#d8d8dc',skin:'#d3a47e',eyes:'half',mouth:(Math.floor(t*7)%2)?'o':'line',pose:{tilt:nod*10,lean:3,aL:10,aR:30,eR:60,breath:Math.sin(t*2)*.01}});
    person({x:410,y:900,s:3.2,top:C.must,hood:true,back:true,hairStyle:'none',shadow:.6,pose:{aL:8,aR:8}})});ctx.restore()};
SC.nap2=(t,u,d)=>{const p=u/d;vgrad(0,H,[[0,'#14213a'],[1,'#0a1020']]);glow(270,380,360,C.amb,.3);const fl=p*10;const cl=clamp(.35+Math.sin(fl*3.1)*.2+p*.5);
  ctx.save();ctx.translate(270,420);ctx.scale(1+p*.08,1+p*.08);ctx.translate(-270,-420);bigHead({hairStyle:'short',hair:'#d8d8dc',skin:'#d3a47e',eyes:cl>.62?'closed':'half',mouth:p<.6?((Math.floor(t*7)%2)?'o':'line'):null,under:true},270,440,10.2,{tilt:Math.sin(fl)*2+p*6});ctx.restore();
  ctx.fillStyle='rgba(10,13,22,.88)';rr(46,596,448,58,12);ctx.fill();ctx.fillStyle=C.lime;ctx.font='500 17px "JetBrains Mono"';ctx.textAlign='center';ctx.letterSpacing='1px';ctx.fillText('MICROSLEEP: UP TO 30 SECONDS',270,631)};
SC.nap3=(t,u,d)=>{const p=u/d;let c=cam(p,{z0:1.05,z1:1.12});c=shakeCam(c,t,.6,21);corridorWorld(t,c,{});
  view(c,1,()=>{const sl=EZ.io(pr(p,.15,.6));const y=880+sl*60;
    ctx.save();ctx.translate(190+sl*10,y);ctx.rotate(sl*-.5);ctx.translate(-190,-y);
    person({x:190,y,s:3.4,top:'#7a5a4a',bottom:'#3a3a48',hairStyle:'short',hair:'#d8d8dc',skin:'#d3a47e',eyes:'closed',under:true,pose:{tilt:10+sl*16,lean:3+sl*18,aL:12+sl*20,aR:20+sl*30,hL:3+sl*50,hR:3+sl*40,kL:sl*30,kR:sl*40,squash:sl*.06,eyes:'closed'}});ctx.restore();
    if(p>.5){for(let i=0;i<4;i++){const r=((t*30+i*10)%40);ctx.strokeStyle=rgba('#E6F7FF',.55*(1-r/40));ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(200+sl*10,y-170+sl*50,10+r,0,7);ctx.stroke()}}
    person({x:420,y:900,s:3.2,top:C.must,hood:true,back:true,hairStyle:'none',shadow:.6,pose:{lean:-3}})})};
// ---------- slow-motion cup
SC.cup1=(t,u,d)=>{const p=u/d;let c=cam(p,{z0:1,z1:1.12,y0:-20,y1:30});c=shakeCam(c,t,.3,22);vgrad(0,H,[[0,'#0b1426'],[1,'#080d18']]);
  view(c,.4,()=>{blk(-20,380,600,10,2,'#1a1410');vgrad(390,1100,[[0,'#2e2014'],[1,'#120b06']]);glow(160,420,320,C.amb,.4);glow(160,420,100,'#ffd9a0',.4)});
  view(c,1,()=>{const q=EZ.o3(p)*.85+p*.15;const cy=lerp(250,640,Math.min(1,q*.9));const rot=lerp(0,1.1,EZ.o2(p));
    // hand releasing
    const open=EZ.io(pr(p,0,.25));ctx.save();ctx.translate(260,150-open*40);blk(-30,-150,60,160,20,C.must);blk(-26,0,52,56,18,'#e0b48c');ctx.rotate(open*.3);blk(-22,40,18,34,8,'#e0b48c');blk(6,40,18,34,8,'#e0b48c');ctx.restore();
    ctx.save();ctx.translate(290,cy);ctx.rotate(rot);ctx.scale(2.1,2.1);blk(-24,-44,48,44,9,'#e8e8e0',{hi:.1,lo:-.2});ctx.strokeStyle='#e8e8e0';ctx.lineWidth=7;ctx.beginPath();ctx.arc(26,-24,11,-1.3,1.3);ctx.stroke();ctx.fillStyle='#2a1810';ctx.beginPath();ctx.ellipse(0,-42,21,5.5,rot*.2,0,7);ctx.fill();ctx.restore();
    const r=mul(8);ctx.fillStyle='#3a2014';for(let i=0;i<14;i++){const a=-1.6+r()*3.2+rot*.3,dd=40+r()*120*Math.min(1,p*3);ctx.beginPath();ctx.arc(290+Math.cos(a)*dd*1.2,cy-90+Math.sin(a)*dd*.8+p*30,3+r()*5,0,7);ctx.fill()}
    shadowE(290,880,110*(.6+p*.4),20,.4*p);rect(-100,880,W+200,2,'rgba(255,200,140,.12)')});
  dust(t,100,300,360,500,30,23,'#ffd9a0',.4,.2)};
SC.cup2=(t,u,d)=>{const p=u/d;let c=cam(p,{z0:1,z1:1.07});c=shakeCam(c,t,.3,24);vgrad(0,H,[[0,'#05080f'],[1,'#0a1020']]);
  view(c,.5,()=>{glow(380,520,300,C.cold,.25);rect(-100,800,W+200,300,'#0e0a08')});
  view(c,1,()=>{sleeper(390,800,3.6,5,t,{turn:1,tilt:-6,sway:0,rim:'#ffd27a',rimSide:-1});
    glow(150,640,260,C.amb,.3);shadowE(150,806,46,9,.5);ctx.strokeStyle='rgba(255,255,255,.18)';ctx.lineWidth=2;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(130+i*20,520-i*10);ctx.lineTo(130+i*20,585-i*10);ctx.stroke()}
    ctx.save();ctx.translate(150,660);ctx.rotate(1.1+Math.sin(t*1.5)*.04);ctx.scale(1.8,1.8);blk(-24,-44,48,44,9,'#e8e8e0');ctx.strokeStyle='#e8e8e0';ctx.lineWidth=7;ctx.beginPath();ctx.arc(26,-24,11,-1.3,1.3);ctx.stroke();ctx.fillStyle='#2a1810';ctx.beginPath();ctx.ellipse(0,-42,21,5.5,0,0,7);ctx.fill();ctx.restore();
    const r=mul(8);ctx.fillStyle='#3a2014';for(let i=0;i<8;i++){ctx.beginPath();ctx.arc(150+(r()-.5)*150,610+(r()-.5)*110,2.5+r()*3.5,0,7);ctx.fill()}});
  ctx.fillStyle='rgba(0,0,0,.25)';ctx.fillRect(0,0,W,H)};
// ---------- sound travels 1 km in 3 s
SC.sound3=(t,u,d)=>{const p=u/d;vgrad(0,H,[[0,'#0a0d16'],[1,'#141a2a']]);const g=ctx.createRadialGradient(270,400,0,270,400,520);g.addColorStop(0,'rgba(60,90,140,.3)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  const gy=640;rect(40,gy,460,3,'#3a4258');for(let i=0;i<=4;i++){rect(60+i*95,gy-8,2,16,'#5a6278')}ctx.fillStyle='#8A8F99';ctx.font='600 12px "JetBrains Mono"';ctx.textAlign='center';ctx.fillText('0',60,gy+30);ctx.fillText('1 KM',440,gy+30);
  person({x:80,y:gy,s:1.3,top:C.must,hood:true,hairStyle:'none',eyes:'wide',mouth:'o'});
  const wavep=pr(p,.05,.85);for(let i=0;i<7;i++){const ph=(wavep*1.6-i*.12);if(ph<0||ph>1.2)continue;const rr_=ph*380;ctx.strokeStyle=`rgba(230,247,255,${.8*(1-ph/1.2)})`;ctx.lineWidth=3;ctx.beginPath();ctx.arc(120,gy-80,rr_,-.9,.9);ctx.stroke()}
  const hit=wavep>.9;sleeperAt(440,gy,1.3,3,'stand','closed');if(hit){ctx.save();ctx.translate(440,gy-140);for(let i=0;i<3;i++){ctx.strokeStyle=rgba(C.red,.7-i*.2);ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,16+i*10,0,7);ctx.stroke()}ctx.restore()}
  const n=Math.round(EZ.io(pr(p,.05,.85))*3);ctx.textAlign='center';ctx.fillStyle='#fff';ctx.font='220px "Bebas Neue"';ctx.fillText(String(n),270,420);ctx.fillStyle=C.lime;ctx.font='600 17px "JetBrains Mono"';ctx.letterSpacing='5px';ctx.fillText('SECONDS PER KILOMETER',270,462);ctx.letterSpacing='0px';ctx.fillStyle='#8A8F99';ctx.font='500 13px "JetBrains Mono"';ctx.fillText('SOUND TRAVELS ~343 m/s',270,500)};
// ---------- throat close-up
SC.throat=(t,u,d)=>{const p=u/d;let c=cam(p,{z0:1,z1:1.14,y0:0,y1:-20});const hum=p>.2;c=shakeCam(c,t,hum?1.8:.4,25);vgrad(0,H,[[0,'#0a1224'],[1,'#05080f']]);glow(270,420,360,C.cold,.22);
  view(c,1,()=>{sleeper(270,1225,8.6,2,t,{hum,sway:.15,rim:C.cold,rimSide:1});
    if(hum){const a=.5+.5*Math.sin(t*70);ctx.save();ctx.globalAlpha=.5*a;ctx.fillStyle='#E6F7FF';ctx.beginPath();ctx.ellipse(270,492,22,30,0,0,7);ctx.fill();ctx.restore()}})};
// ---------- first-person sprint
SC.sprint=(t,u,d)=>{const p=u/d;const bob=Math.sin(t*15)*7;const c={x:0,y:bob*.4,z:1,rot:Math.sin(t*7.5)*1.6};
  vgrad(0,H,[[0,'#0a1020'],[1,'#10192d']]);
  view(c,.9,()=>{const vx=270,vy=400;ctx.fillStyle='#16233d';ctx.beginPath();ctx.moveTo(-120,-80);ctx.lineTo(vx-60,vy-70);ctx.lineTo(vx-60,vy+90);ctx.lineTo(-120,1040);ctx.fill();ctx.beginPath();ctx.moveTo(660,-80);ctx.lineTo(vx+60,vy-70);ctx.lineTo(vx+60,vy+90);ctx.lineTo(660,1040);ctx.fill();
    ctx.fillStyle='#0c1426';ctx.beginPath();ctx.moveTo(-120,-80);ctx.lineTo(660,-80);ctx.lineTo(vx+60,vy-70);ctx.lineTo(vx-60,vy-70);ctx.fill();ctx.fillStyle='#223a64';ctx.beginPath();ctx.moveTo(-120,1040);ctx.lineTo(660,1040);ctx.lineTo(vx+60,vy+90);ctx.lineTo(vx-60,vy+90);ctx.fill();
    const z=((t*1.7)%1);for(let k=0;k<7;k++){const s=((k/7+z)%1),e=s*s*s;const hw=lerp(60,420,e),hh=lerp(80,520,e);ctx.strokeStyle=`rgba(90,130,200,${.15+e*.5})`;ctx.lineWidth=1+e*5;ctx.strokeRect(vx-hw,vy+10-hh*.5-hh*.1,hw*2,hh*1.05);
      const dl=vx-hw*.98;ctx.fillStyle=`rgba(8,14,28,${.6})`;ctx.fillRect(dl-e*20,vy-hh*.45,e*40+6,hh*.8);ctx.fillStyle=`rgba(8,14,28,.6)`;ctx.fillRect(vx+hw*.98-e*20,vy-hh*.45,e*40+6,hh*.8);glow(vx,vy-hh*.58,60+e*200,C.amb,.28*(1-e*.5))}
    ctx.fillStyle='#05070d';ctx.fillRect(vx-60,vy-70,120,160);ctx.fillStyle='#1a0a0c';ctx.fillRect(vx-34,vy-40,68,110);ctx.fillStyle='#3ddc84';ctx.font='600 12px "JetBrains Mono"';ctx.textAlign='center';ctx.fillText('EXIT',vx,vy-52);glow(vx,vy-55,50,'#3ddc84',.4)});
  // speed streaks
  ctx.strokeStyle='rgba(180,210,255,.18)';ctx.lineWidth=2;for(let i=0;i<24;i++){const a=i/24*6.283,r0=120+((t*500+i*53)%400);ctx.beginPath();ctx.moveTo(270+Math.cos(a)*r0,420+Math.sin(a)*r0);ctx.lineTo(270+Math.cos(a)*(r0+40),420+Math.sin(a)*(r0+40));ctx.stroke()}
  // your arms pumping
  for(const sd of[-1,1]){const ph=Math.sin(t*15+(sd>0?Math.PI:0));ctx.save();ctx.translate(270+sd*(150+ph*14),930+ph*30+bob);ctx.rotate(sd*(.25+ph*.1));blk(-40,-230,80,300,30,C.must,{hi:.18});blk(-30,-290,60,70,24,'#e0b48c');ctx.restore()}
  const fl=Math.sin(t*20)>.6?.12:0;ctx.fillStyle=`rgba(255,40,40,${fl})`;ctx.fillRect(0,0,W,H)};
SC.door_slam=(t,u,d)=>{const p=u/d;const sw=1-EZ.i3(clamp(p*1.7));const flash=p>.55&&p<.7;let c=cam(p,{z0:1.1,z1:1});c={x:0,y:0,z:c.z,rot:0};vgrad(0,H,[[0,'#0b1224'],[1,'#10182c']]);
  view(c,1,()=>{ // door frame + door swinging shut (perspective)
    rect(60,120,420,760,'#05070d');const w=lerp(30,380,1-sw);ctx.fillStyle='#4a3320';ctx.beginPath();ctx.moveTo(70,130);ctx.lineTo(70+w,130+sw*50);ctx.lineTo(70+w,870-sw*50);ctx.lineTo(70,870);ctx.fill();ctx.save();ctx.beginPath();ctx.moveTo(70,130);ctx.lineTo(70+w,130+sw*50);ctx.lineTo(70+w,870-sw*50);ctx.lineTo(70,870);ctx.clip();ctx.translate(70,130);ctx.scale(w/380,1);ctx.strokeStyle='#38261a';ctx.lineWidth=5;for(const [x,y] of [[30,50],[200,50],[30,420],[200,420]])ctx.strokeRect(x,y,150,300);for(let i=0;i<14;i++){ctx.fillStyle='rgba(0,0,0,.08)';ctx.fillRect(0,i*54,380,2)}ctx.restore();
    if(sw<.05){blk(80,120,400,760,8,'#4a3320');for(const [x,y] of [[110,200],[260,200],[110,560],[260,560]]){ctx.strokeStyle='#38261a';ctx.lineWidth=4;ctx.strokeRect(x,y,150,300)}
      blk(420,480,40,12,5,'#c9c9d0');blk(430,420,20,50,6,'#aab4c0');const bolt=EZ.o3(pr(p,.7,.85));blk(360-bolt*0,500,70,14,6,'#d8dce4');ctx.fillStyle='#3ddc84';ctx.beginPath();ctx.arc(455,560,6,0,7);ctx.fill()}
    glow(270,130,300,'#6fb8ff',.18*sw)});
  if(p>.5&&p<.8){for(let i=0;i<3;i++){const ph=(p-.5)/.3;ctx.strokeStyle=`rgba(220,230,255,${.5*(1-ph)})`;ctx.lineWidth=6;ctx.beginPath();ctx.ellipse(270,500,100+ph*340+i*30,160+ph*300+i*30,0,0,7);ctx.stroke()}}
  if(flash){ctx.fillStyle='rgba(255,255,255,.55)';ctx.fillRect(0,0,W,H)}};
SC.static_sky=(t)=>planeScene(t,false);
