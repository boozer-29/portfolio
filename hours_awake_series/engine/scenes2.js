// ============ SCENES 2: night city, phones, bus, stadium, cockpit ============
function cityNight(t,c,o={}){
  view(c,.18,()=>{SKY.night();stars(t,110,2,-600,220);glow(430,120,150,'#cfe0ff',.1)});
  view(c,.4,()=>{skylineLayer({seed:11,base:600,x0:o.x0??-60,x1:o.x1??W+60,minW:30,maxW:62,minH:170,maxH:360,col:'#14263f',winFn:o.winFar||((x,y,q)=>q<.52?(q<.3?'#f2b45a':'#e8d08a'):null),gap:2,roof:true,beacon:true,t});fog(t,470,160,'#2a4a7a',.12)});
  view(c,.68,()=>{skylineLayer({seed:12,base:690,x0:o.x0??-60,x1:o.x1??W+60,minW:46,maxW:98,minH:230,maxH:480,col:'#0d1a30',winFn:o.winNear||((x,y,q)=>q<.5?(q<.28?'#f5bd62':'#ffd98a'):null),gap:2,roof:true,beacon:true,t})});
}
SC.night_sky=(t,u,d)=>{const p=u/d;let c=cam(p,{z0:1,z1:1.1,x0:0,x1:-12,y0:20,y1:-6});c=shakeCam(c,t,.3,4);
  cityNight(t,c);
  view(c,1.15,()=>{ // bedroom foreground: window frame, nightstand, clock
    rect(-120,-120,150,1200,'#05070d');rect(W-30,-120,150,1200,'#05070d');rect(-120,-120,W+240,40,'#05070d');
    vgrad(-120,960,[[0,'rgba(0,0,0,0)'],[1,'rgba(0,0,0,0)']]);
    // curtain edges
    ctx.fillStyle='#0b1220';ctx.beginPath();ctx.moveTo(30,-80);ctx.quadraticCurveTo(80,300,36,720);ctx.lineTo(-120,720);ctx.lineTo(-120,-80);ctx.fill();ctx.beginPath();ctx.moveTo(W-30,-80);ctx.quadraticCurveTo(W-84,300,W-36,720);ctx.lineTo(W+120,720);ctx.lineTo(W+120,-80);ctx.fill();
    vgrad(720,1100,[[0,'#2b1d12'],[1,'#120c07']]);rect(-120,716,W+240,6,'#46301c');
    blk(130,660,280,82,16,'#1a1410',{hi:.12});ctx.save();rr(142,668,256,66,10);ctx.clip();rect(142,668,256,66,'#0b0806');ctx.restore();
    ctx.textAlign='center';ctx.font='62px "Bebas Neue"';ctx.fillStyle=C.amb;ctx.shadowColor=C.amb;ctx.shadowBlur=18;ctx.fillText('11:47',250,722);ctx.font='26px "Bebas Neue"';ctx.fillText('PM',352,722);ctx.shadowBlur=0;glow(270,700,200,C.amb,.4);
    phoneObj(470,790,70,130,12,(w,h)=>{ctx.fillStyle='#10223f';ctx.fillRect(-w/2,-h/2,w,h);ctx.fillStyle='#fff';ctx.font='18px "Bebas Neue"';ctx.textAlign='center';ctx.fillText('11:47',0,-h*.2)});
  });
  dust(t,0,300,W,400,18,6,'#fff',.2,.4)};
function phonesRipple(t,p0,p1,u,d){const p=lerp(p0,p1,u/d);const front=lerp(-280,1000,EZ.io(clamp(p)));
  const fn=(x,y,q,i,bx)=>{const wx=x;if(q>.6)return null;const behind=front-wx;if(behind>0){const f=clamp(1-behind/140);return f>.01&&behind<55?mixc('#9fd4ff','#ffffff',.4+f*.4):mixc('#4f9bff','#2a6ad8',clamp(behind/400))}return q<.42?'#f2b45a':'#e8d08a'};
  const c={x:lerp(-260,380,EZ.io(clamp(p)))*1,y:10,z:1.04,rot:0};cityNight(t,shakeCam(c,t,.5,5),{x0:-480,x1:1100,winFar:fn,winNear:fn});
  // ripple glow bands
  view(c,.68,()=>{glow(front,520,230,'#6fb8ff',.5);glow(front,400,150,'#cfe9ff',.3)})}
SC.phones=(t,u,d)=>phonesRipple(t,0,.5,u,d);SC.phones_b=(t,u,d)=>phonesRipple(t,.5,1,u,d);
SC.phone_lock=(t,u,d)=>{const p=u/d;const c=cam(p,{z0:1,z1:1.1});ctx.save();
  vgrad(0,H,[[0,'#0d0c12'],[1,'#1a1410']]);
  view(c,.3,()=>blurred(7,()=>{const r=mul(3);for(let i=0;i<12;i++){glow(40+r()*460,80+r()*320,34+r()*30,'#6fb8ff',.4)}}));
  view(c,1,()=>{ // wood table + phone buzzing
    vgrad(430,1000,[[0,'#3a2616'],[1,'#1c120a']]);for(let i=0;i<7;i++){ctx.fillStyle='rgba(0,0,0,.16)';ctx.fillRect(-100,440+i*80+Math.sin(i)*8,W+200,2)}
    glow(270,620,380,'#6fb8ff',.35);
    const sh=Math.sin(t*160)*2.2*Math.min(1,p*6);
    phoneObj(270+sh,560+Math.cos(t*140)*1.4,250,500,-8,(w,h)=>{
      vgrad(-h/2,h/2,[[0,'#17306a'],[1,'#0a1228']],-w/2,w);ctx.textAlign='center';ctx.fillStyle='#fff';ctx.font='96px "Bebas Neue"';ctx.fillText('11:47',0,-h*.28);ctx.font='600 14px Montserrat';ctx.fillStyle='rgba(255,255,255,.7)';ctx.fillText('TUESDAY, OCTOBER 14',0,-h*.28+28);
      const a=EZ.ob(pr(p,.12,.4));ctx.save();ctx.translate(0,h*.14);ctx.scale(a,a);ctx.fillStyle='rgba(255,255,255,.14)';rr(-w*.42,-34,w*.84,68,18);ctx.fill();ctx.fillStyle='rgba(255,255,255,.18)';rr(-w*.37,-22,40,40,10);ctx.fill();ctx.strokeStyle='#cfd5e2';ctx.lineWidth=2.4;for(let i=0;i<5;i++){const hh=6+Math.abs(Math.sin(t*9+i))*16;ctx.beginPath();ctx.moveTo(-w*.37+8+i*7,-2-hh/2);ctx.lineTo(-w*.37+8+i*7,-2+hh/2);ctx.stroke()}ctx.fillStyle='#fff';ctx.font='900 17px Montserrat';ctx.textAlign='left';ctx.fillText('1 NEW SOUND',-w*.37+52,-2);ctx.fillStyle='rgba(255,255,255,.55)';ctx.font='500 11px Montserrat';ctx.fillText('now',-w*.37+52,16);ctx.restore()});
    if(p>.08)for(let i=0;i<3;i++){const ph=(t*3+i/3)%1;ctx.strokeStyle=`rgba(180,215,255,${.5*(1-ph)})`;ctx.lineWidth=3;ctx.beginPath();ctx.arc(270,560,270+ph*60,-2.2,-.9);ctx.stroke();ctx.beginPath();ctx.arc(270,560,270+ph*60,.9,2.2);ctx.stroke()}
  });ctx.restore()};
SC.headphones=(t,u,d)=>{const p=u/d;let c=cam(p,{z0:1,z1:1.1,y0:0,y1:-14});c=shakeCam(c,t,.5,6);ctx.save();
  view(c,.25,()=>blurred(5,()=>{SKY.night();skylineLayer({seed:12,base:640,minW:46,maxW:98,minH:220,maxH:440,col:'#0d1a30',winFn:(x,y,q)=>q<.6?'#6fb8ff':null,gap:2,t});glow(270,420,300,'#6fb8ff',.25)}));
  view(c,1,()=>{vgrad(760,1100,[[0,'#0b0f1a'],[1,'#05070d']]);
    const you={x:270,y:1190,s:6.5,top:C.must,hood:false,back:true,hairStyle:'short',hair:'#3a2a20',shadow:0,noArms:true,pose:{lean:0}};person(you);const sh=shoulderPts(you);
    const q=EZ.ob(pr(p,.12,.62));const hy=lerp(330,505,q);const hx=270;
    headphonesObj(hx,hy+60,2.15,0);
    // one pair of arms: shoulders -> elbows (out) -> hands gripping the cups
    const rel=EZ.io(pr(p,.8,.98));for(const sd of[-1,1]){const S=sd<0?sh[0]:sh[1];const cup=[hx+sd*152,hy+104],rest=[S[0]+sd*34,S[1]+250];const H=[lerp(cup[0],rest[0],rel),lerp(cup[1],rest[1],rel)];armIK(S,H,{L1:112,L2:112,out:sd,down:rel>.3,w0:64,w1:34,col:C.must})}
    if(p>.7){const a=clamp((p-.7)*6);glow(hx+150,hy+118,26,'#3ddc84',.9*a);ctx.fillStyle='#3ddc84';ctx.beginPath();ctx.arc(hx+150,hy+118,4,0,7);ctx.fill();for(let i=0;i<3;i++){const ph=(t*1.2+i/3)%1;ctx.strokeStyle=`rgba(61,220,132,${.5*(1-ph)})`;ctx.lineWidth=2;ctx.beginPath();ctx.arc(hx+150,hy+118,12+ph*40,0,7);ctx.stroke()}}
  });ctx.restore()};
// ---------- bus driver nods off
SC.driver=(t,u,d)=>{const p=u/d;let c=cam(p,{z0:1,z1:1.08,x0:0,x1:-8});c=shakeCam(c,t,.7,7);const slump=EZ.io(pr(p,.38,.78));const jerk=p>.3&&p<.38?Math.sin((p-.3)*80)*3:0;
  vgrad(0,H,[[0,'#04070f'],[1,'#0a0f1a']]);
  view(c,.35,()=>{ // windshield: night road streaming
    ctx.save();rr(20,60,500,440,24);ctx.clip();vgrad(60,500,[[0,'#0a1426'],[.7,'#16305a'],[1,'#2a4f80']],20,500);
    const vx=270,vy=300;for(let i=0;i<7;i++){const ph=((t*.9+i/7)%1);const k=ph*ph;const lx=vx+(i%2?1:-1)*(30+k*420),ly=vy-60+k*160;glow(lx,ly,12+k*60,'#ffd27a',.8*(.3+k));ctx.fillStyle='#ffe6a8';ctx.fillRect(lx-2*k*3,ly,4*k*3+1,3+k*10)}
    for(let i=0;i<14;i++){const ph=((t*1.6+i/14)%1);const k=ph*ph;ctx.fillStyle='rgba(255,255,255,.25)';ctx.fillRect(vx-3-k*300*(i%2?-1:1)*.3,vy+k*200,2+k*8,1+k*14)}
    ctx.fillStyle='#10192b';ctx.beginPath();ctx.moveTo(vx-14,vy);ctx.lineTo(vx+14,vy);ctx.lineTo(vx+330,500);ctx.lineTo(vx-330,500);ctx.fill();ctx.strokeStyle='rgba(255,255,255,.4)';ctx.setLineDash([10,16]);ctx.lineDashOffset=-t*180;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(vx,vy);ctx.lineTo(vx,500);ctx.stroke();ctx.restore();
    blk(14,54,512,10,3,'#1b2335');blk(14,496,512,12,3,'#1b2335');rect(250,60,8,440,'#1b2335')});
  view(c,.8,()=>{ // dash
    vgrad(480,960,[[0,'#10141f'],[1,'#07090f']]);blk(60,500,420,90,18,'#171d2c',{hi:.2});for(let i=0;i<5;i++){circ(110+i*80,545,20,'#05070d');ctx.strokeStyle=C.amb;ctx.lineWidth=2;ctx.beginPath();ctx.arc(110+i*80,545,15,.9,2.3+i*.4);ctx.stroke();glow(110+i*80,545,32,C.amb,.2)}
    glow(270,600,260,C.amb,.25)});
  view(c,1.1,()=>{ // driver from behind + wheel + one pair of arms
    const drv={x:270,y:1000,s:3.3,top:'#2f4a7a',back:true,hairStyle:'cap',hat:'#1b2a4a',hair:'#1b2a4a',shadow:0,noArms:true,pose:{lean:slump*10,tilt:slump*30+jerk}};person(drv);const sh=shoulderPts(drv,drv.pose);
    ctx.save();ctx.translate(270,720);ctx.strokeStyle='#0b0d14';ctx.lineWidth=22;ctx.beginPath();ctx.ellipse(0,0,150,46,0,0,7);ctx.stroke();ctx.strokeStyle='#272d3c';ctx.lineWidth=6;ctx.beginPath();ctx.ellipse(0,-2,150,46,0,Math.PI*1.1,Math.PI*1.9);ctx.stroke();ctx.restore();
    for(const sd of[-1,1]){const H=[270+sd*(112-slump*42),722+slump*188];armIK(sd<0?sh[0]:sh[1],H,{auto:.58,min:60,out:sd,down:true,w0:44,w1:28,col:'#2f4a7a'})}
  });
  fog(t,300,300,'#3b5a85',.05);ctx.fillStyle='rgba(0,0,0,.2)';ctx.fillRect(0,0,W,H)};
// ---------- bus meets lamppost (slow motion)
SC.bus_lamp=(t,u,d)=>{const p=u/d;const e=EZ.io(p);let c=cam(p,{x0:-30,x1:80,z0:1,z1:1.06});c=shakeCam(c,t,.4,8);
  view(c,.25,()=>{SKY.night();stars(t,60,3,-600,100)});
  view(c,.5,()=>{skylineLayer({seed:14,base:600,minW:40,maxW:84,minH:140,maxH:300,col:'#0e1a2f',winFn:(x,y,q)=>q<.3?'#6b5a2a':null,gap:2,roof:true,t})});
  view(c,1,()=>{vgrad(560,1100,[[0,'#151c2b'],[1,'#0a0e17']]);ctx.fillStyle='rgba(255,255,255,.12)';ctx.fillRect(-200,700,1000,4);ctx.fillRect(-200,820,1000,4);
    const hit=pr(p,.78,.95);const lx=420;ctx.save();ctx.translate(lx,640);ctx.rotate(hit*.34);blk(-6,-300,12,300,5,'#243049');blk(-6,-300,64,10,5,'#243049');ctx.fillStyle='#fff3c8';ctx.fillRect(40,-290,20,6);ctx.restore();
    const fl=hit>0?(Math.sin(t*50)>0?1:.2):1;glow(lx+(hit*40),350+hit*40,260,'#ffd27a',.55*fl);beam(lx+50,350,Math.PI/2,300,70,'#ffd27a',.18*fl);
    const bx=lerp(-190,330,e);ctx.save();ctx.translate(bx,640);shadowE(0,4,190,12,.55);
    blk(-170,-150,340,140,24,'#c9a21f',{hi:.2});blk(-170,-60,340,22,6,'#7a6410');for(let i=0;i<6;i++){blk(-150+i*54,-132,44,50,8,'#0e1830');const hy=-98;ctx.fillStyle='#e0b48c';const dr=Math.min(1,p*2+i*.05);rr(-141+i*54,hy+dr*10,18,18,6);ctx.fill();ctx.fillStyle='#3a3f4d';rr(-146+i*54,hy+14+dr*10,28,18,6);ctx.fill()}
    for(const wx of[-110,110]){circ(wx,0,32,'#0a0c12');circ(wx,0,14,'#4a4f5d')}blk(150,-60,22,20,6,'#ffe6a8');glow(176,-48,90,'#ffe6a8',.5);beam(172,-48,0,300,60,'#ffe6a8',.22);ctx.restore();
    if(hit>.05){const r=mul(5);ctx.save();ctx.globalCompositeOperation='lighter';for(let i=0;i<14;i++){const a=r()*6.28,sp=40+r()*120;ctx.fillStyle=`rgba(255,${190+r()*60|0},120,${(1-hit)*.9})`;ctx.fillRect(lx+120*hit*(1)+Math.cos(a)*sp*hit,330+hit*60+Math.sin(a)*sp*hit,2,2)}ctx.restore()}
  });fog(t,640,120,'#2a4a7a',.1)};
// ---------- stadium wave
function fan(x,y,s,seed,sl){ctx.save();ctx.translate(x,y+4*s);ctx.fillStyle='rgba(0,0,0,.25)';ctx.fillRect(-9*s,0,18*s,4*s);ctx.restore();const r=mul(seed);const cols=['#c9534a','#4a7ac9','#d9b44a','#5a9a6a','#c9c9c9','#8a5ac9'];const col=cols[Math.floor(r()*6)];const sk=['#e0b48c','#c28a64','#8a5a3c','#f0cba8'][Math.floor(r()*4)];ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.rotate(sl*.5*(r()>.5?1:-1));ctx.fillStyle=sl>.5?shade(col,-.35):col;rr(-7,-13,14,15,5);ctx.fill();ctx.fillStyle=sl>.5?shade(sk,-.35):sk;ctx.beginPath();ctx.arc(0,-18+sl*6,5.4,0,7);ctx.fill();ctx.restore()}
SC.stadium=(t,u,d)=>{const p=u/d;let c=cam(p,{z0:1.02,z1:1.1,y0:0,y1:-10});c=shakeCam(c,t,.35,9);
  vgrad(0,H,[[0,'#05080f'],[1,'#0c1424']]);
  view(c,.3,()=>{for(const sx of[60,480]){blk(sx-6,120,12,260,3,'#10192b');rect(sx-34,100,68,26,'#1a2336');for(let i=0;i<6;i++)for(let j=0;j<2;j++){glow(sx-26+i*10,106+j*10,26,'#fff3d0',.5)}beam(sx,126,sx<270?.9:2.25,520,150,'#fff3d0',.1)}
    blk(190,170,160,50,6,'#05080f');ctx.fillStyle=C.amb;ctx.font='34px "Bebas Neue"';ctx.textAlign='center';ctx.fillText('00:00',270,208)});
  view(c,.8,()=>{vgrad(260,960,[[0,'#101a2e'],[1,'#05080f']]);
    const fx=lerp(-120,700,EZ.io(p));
    for(let r=0;r<10;r++){const y=300+r*66,s=.9+r*.17,n=Math.ceil(W/(30*s))+2;for(let i=0;i<n;i++){const x=i*30*s+((r%2)*15*s)-10;const sl=EZ.ss(clamp((fx-(x+r*14))/90));fan(x,y+sl*3*s,s,r*50+i,sl)}
      ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(-20,y+8*s,W+40,3)}
  });
  ctx.fillStyle='rgba(0,0,0,.15)';ctx.fillRect(0,0,W,H)};
// ---------- cockpit
SC.cockpit=(t,u,d)=>{const p=u/d;const dn=EZ.io(pr(p,.4,.85));let c=cam(p,{z0:1,z1:1.08,r0:0,r1:3*dn});c=shakeCam(c,t,.5,10);
  vgrad(0,H,[[0,'#060912'],[1,'#0a1020']]);
  view(c,.3,()=>{ctx.save();ctx.beginPath();ctx.moveTo(50,470);ctx.lineTo(95,140);ctx.lineTo(445,140);ctx.lineTo(490,470);ctx.closePath();ctx.clip();vgrad(120,480,[[0,'#04091a'],[.55,'#14305a'],[1,'#3a5a8a']],40,460);stars(t,70,3,140,380);
    ctx.fillStyle='rgba(180,205,240,.18)';for(let i=0;i<8;i++){const x=(i*90+t*8)%700-100;ctx.beginPath();ctx.ellipse(x,430,120,30,0,0,7);ctx.fill()}glow(380,200,120,'#cfe0ff',.25);ctx.restore();
    ctx.strokeStyle='#05080f';ctx.lineWidth=18;ctx.beginPath();ctx.moveTo(95,140);ctx.lineTo(50,470);ctx.moveTo(445,140);ctx.lineTo(490,470);ctx.moveTo(270,140);ctx.lineTo(270,470);ctx.stroke()});
  view(c,.75,()=>{vgrad(450,960,[[0,'#10162a'],[1,'#080b14']]);blk(40,450,460,120,18,'#161d32',{hi:.2});
    for(const [x,col] of [[120,'#3ddc84'],[270,'#6fb8ff'],[420,'#3ddc84']]){ctx.fillStyle='#05080f';rr(x-50,468,100,70,8);ctx.fill();ctx.strokeStyle=col;ctx.lineWidth=2;ctx.beginPath();for(let k=0;k<50;k++){const xx=x-44+k*1.8,yy=503+Math.sin(k*.4+t*3+x)*10;k?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy)}ctx.stroke();glow(x,503,70,col,.25)}
    for(let i=0;i<14;i++){circ(60+i*32,556,3,i%3?'#3ddc84':C.amb);glow(60+i*32,556,10,i%3?'#3ddc84':C.amb,.5)}
    ctx.fillStyle=C.amb;ctx.font='600 13px "JetBrains Mono"';ctx.textAlign='center';ctx.fillText('AUTOPILOT',270,590)});
  view(c,1.1,()=>{ // pilots from behind, each with exactly one pair of arms on the yoke
    for(const [sx,who] of [[150,'L'],[390,'R']]){const k=who==='L'?dn:0;
      blk(sx-110,700,220,300,28,'#1a2236',{hi:.18});
      const pl={x:sx,y:1010,s:4.2,top:'#e8ecf2',back:true,hairStyle:'cap',hat:'#1b2a4a',hair:'#1b2a4a',phones:true,shadow:0,noArms:true,pose:{lean:k*14,tilt:k*-26+Math.sin(t*1.2)*.4}};person(pl);const sh=shoulderPts(pl,pl.pose);
      blk(sx-90,830,36,12,5,'#d9b44a');blk(sx+54,830,36,12,5,'#d9b44a');
      // yoke
      ctx.save();ctx.translate(sx,700+k*40);ctx.rotate(k*.1);blk(-6,-70,12,92,5,'#10131c');blk(-50,-80,100,16,8,'#0b0d14');ctx.restore();
      for(const sd of[-1,1]){const H=[sx+sd*(46+k*50),(690+k*120)];armIK(sd<0?sh[0]:sh[1],H,{auto:.58,min:60,out:sd,down:true,w0:48,w1:30,col:'#e8ecf2',skin:'#e0b48c'})}}
  });ctx.fillStyle='rgba(0,0,0,.18)';ctx.fillRect(0,0,W,H)};
// ---------- city lights go out district by district
SC.lights_off=(t,u,d)=>{const p=u/d;const thr=lerp(-60,640,EZ.io(p));let c=cam(p,{z0:1.02,z1:1.06,x0:0,x1:-10});
  const fn=(x,y,q)=>{if(q>.6)return null;const a=clamp((x-thr)/70);if(a<=0)return q<.012?'#f2b45a':null;return mixc('#0d1a30',q<.4?'#f5bd62':'#ffd98a',a)};
  cityNight(t,c,{winFar:fn,winNear:fn});view(c,.7,()=>{glow(lerp(thr,thr+240,.5),560,260,'#f5bd62',.25*(1-p*.8))});
  ctx.fillStyle=`rgba(2,3,8,${.55*p})`;ctx.fillRect(0,0,W,H)};
// ---------- 3:07 AM
SC.phone307=(t,u,d)=>{const p=u/d;vgrad(0,H,[[0,'#05070d'],[1,'#0b0f1a']]);const c=cam(p,{z0:1,z1:1.08});
  view(c,.3,()=>blurred(9,()=>{glow(120,200,100,'#2a4a7a',.4);glow(430,300,130,'#1a2a4a',.4)}));
  view(c,1,()=>{vgrad(520,1000,[[0,'#1c130c'],[1,'#0a0705']]);glow(270,600,360,'#6fb8ff',.3);const sh=Math.sin(t*120)*1.4*Math.max(0,1-p*2);
    phoneObj(270+sh,560,260,520,-5,(w,h)=>{vgrad(-h/2,h/2,[[0,'#0b1022'],[1,'#05070f']],-w/2,w);ctx.textAlign='center';ctx.fillStyle='#fff';ctx.font='130px "Bebas Neue"';ctx.fillText('3:07',0,-h*.12);ctx.fillStyle=C.lime;ctx.font='60px "Bebas Neue"';ctx.fillText('AM',0,-h*.12+54);ctx.fillStyle='rgba(255,255,255,.14)';rr(-w*.4,h*.16,w*.8,50,14);ctx.fill();ctx.fillStyle='rgba(255,255,255,.7)';ctx.font='600 14px Montserrat';ctx.fillText('0 NEW MESSAGES',0,h*.16+30)});
  })};
