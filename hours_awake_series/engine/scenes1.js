// ============ SCENES 1 ============
const SC={};
function blurred(px,fn){ctx.save();ctx.filter=`blur(${px}px)`;fn();ctx.restore()}
// ---------- kitchen world (hook / present)
function kitchenWorld(t,c,o={}){
  const warm=o.warm??1;
  view(c,.35,()=>{ // far: wall + window with blinds
    vgrad(-120,700,[[0,'#0d1a31'],[1,'#172b49']]);
    rect(-120,520,W+240,10,'#1f3150');rect(-120,530,W+240,200,'#122240');
    blk(26,70,150,250,8,'#07101e',{hi:.05,lo:-.1});
    ctx.save();rr(34,78,134,234,5);ctx.clip();vgrad(70,320,[[0,'#6b93c4'],[1,'#a9c4e0']],34,134);for(let i=0;i<14;i++){ctx.fillStyle='rgba(8,16,30,.78)';ctx.fillRect(34,86+i*16.5,134,9)}ctx.restore();
    blindsLight(60,300,300,260,'#7fa8d8',.22,.55);glow(100,190,230,'#6fb8ff',.22);
    // cabinets
    blk(360,60,150,160,6,'#101e36');rect(360,140,150,2,'#0a1526');blk(372,150,60,60,4,'#0e1a30');blk(440,150,60,60,4,'#0e1a30');
  });
  view(c,.7,()=>{ // mid: hall doorway + floor
    vgrad(560,1000,[[0,'#2b1e13'],[1,'#150e08']]);for(let i=0;i<9;i++){ctx.fillStyle=`rgba(0,0,0,${.18})`;ctx.fillRect(-120,570+i*i*4+i*10,W+240,1.5)}
    blk(150,190,240,450,6,'#1d2b46',{hi:.1});ctx.fillStyle='#05080f';rr(166,205,208,435,3);ctx.fill();
    ctx.save();rr(166,205,208,435,3);ctx.clip();vgrad(205,640,[[0,'#0b1626'],[1,'#17283f']],166,208);glow(270,520,200,C.cold,.28);ctx.restore();
    if(o.sleeper!==false){const hum=t>0;sleeper(270,640,2.55,4,t,{hum,rim:C.cold,rimSide:1,sway:.7});}
    glow(270,430,180,C.cold,.16);
  });
  view(c,1.12,()=>{ // fg: table, lamp, mug, hands, you
    vgrad(690,1000,[[0,'#4a3320'],[1,'#2a1c10']]);rect(-120,690,W+240,7,'#6b4a2e');rect(-120,697,W+240,2,'#8a6240');
    // lamp
    ctx.save();ctx.translate(96,692);blk(-20,-8,40,8,3,'#2a2a30');rect(-2.5,-90,5,82,'#1f1f26');ctx.fillStyle=shade('#F2A93B',-.1);ctx.beginPath();ctx.moveTo(-34,-86);ctx.lineTo(34,-86);ctx.lineTo(22,-124);ctx.lineTo(-22,-124);ctx.closePath();ctx.fill();ctx.restore();
    const fl=1+(o.flicker?Math.sin(t*60)*.08:0);glow(96,600,300,C.amb,.55*warm*fl);glow(96,610,120,'#ffd9a0',.5*warm*fl);
    const tr=hand(t*5,1.4,2);mug(300+tr.x,790+tr.y,1.55,t);
    // you from behind (bottom-left) + hands
    const you={x:78,y:1140,s:5.0,top:C.must,hood:true,back:true,hairStyle:'none',shadow:0,noArms:true,pose:{lean:-3,tilt:-4}};person(you);const sh=shoulderPts(you);
    // exactly one pair of arms, both reaching the mug
    armIK(sh[0],[300-44+tr.x,794+tr.y],{auto:.56,out:-1,down:true,w0:44,w1:24,col:C.must});armIK(sh[1],[300+44+tr.x,794+tr.y],{auto:.56,out:1,down:true,w0:48,w1:26,col:C.must});
    dust(t,60,520,300,240,22,9,'#ffe6b8',.55,.6);
  });
  fog(t,640,160,'#3b5a85',.1);
}
SC.door=(t,u,d)=>{const p=u/d;let c=cam(p,{z0:1,z1:1.16,x0:0,x1:-16,y0:0,y1:-8});c=shakeCam(c,t,.9,1);kitchenWorld(t,c,{flicker:true})};
SC.door2=(t,u,d)=>{const p=u/d;let c=cam(p,{z0:1.1,z1:1.2,x0:0,x1:-12});c=shakeCam(c,t,.8,2);kitchenWorld(t,c,{})};
SC.rewind=(t,u,d)=>{const p=u/d;const c=cam(1-p*.8,{z0:1,z1:1.16,x0:0,x1:-16});kitchenWorld(t,c,{})};
// ---------- city at dawn (dead)
function cityDawn(t,c,o={}){
  view(c,.2,()=>{SKY.dead();glow(380,470,300,'#ffb070',.55);glow(380,470,90,'#ffe0b0',.7);stars(t,40,4,-600,-100);
    for(let i=0;i<4;i++){const x=(i*190+t*(3+i))%800-120;ctx.fillStyle=`rgba(255,200,170,${.07})`;ctx.beginPath();ctx.ellipse(x,-40+i*60,120,10,0,0,7);ctx.fill()}});
  view(c,.4,()=>{skylineLayer({seed:3,base:560,minW:34,maxW:70,minH:150,maxH:330,col:'#3a3f5e',winFn:(x,y,q)=>q<.06?'#b99a6a':null,gap:2,roof:true});fog(t,420,200,'#c98d64',.14);if(o.hook)o.hook();
    smokeCol(t,110,560,430,64,'#23242f',.55,3);smokeCol(t,300,560,560,84,'#1f2029',.6,5);smokeCol(t,445,560,400,58,'#26283a',.5,8)});
  view(c,.65,()=>{skylineLayer({seed:8,base:620,minW:44,maxW:90,minH:200,maxH:380,col:'#1d2540',winFn:(x,y,q)=>q<.04?'#5a4a3a':null,gap:2,roof:true,minH2:0});fog(t,520,160,'#b07a64',.12)});
  view(c,1,()=>{ // street level, high angle: rows of jammed cars
    vgrad(620,1100,[[0,'#2a2f45'],[1,'#10141f']]);ctx.fillStyle='rgba(255,255,255,.07)';for(let i=0;i<8;i++){const y=640+i*i*6+i*18;ctx.fillRect(-100,y,W+200,1.5)}
    for(let i=0;i<7;i++){ctx.fillStyle='rgba(230,210,150,.18)';const y=630+i*i*7+i*20;for(let k=0;k<6;k++)ctx.fillRect(k*100+((i*37)%50)-20,y+8,34+i*4,3+i)}
    const r=mul(21);const cols=['#4a5568','#7a3a3a','#3a5a66','#7a7a4a','#5a4a6a','#2f3a4a'];
    for(let row=0;row<4;row++){const y=664+row*row*20+row*34,s=.5+row*.34,n=5-Math.floor(row/2);for(let i=0;i<n+1;i++){const x=40+i*(110+row*18)+((row%2)*45)+r()*14;const ang=(row==2&&i==1)?.18:0;ctx.save();ctx.translate(x,y);ctx.rotate(ang);carRear(0,0,s,cols[Math.floor(r()*6)],{driver:r()>.4?'slump':'up',hazard:r()>.7,t});ctx.restore()}}
    lampPost(40,720,150,{on:false});lampPost(500,700,130,{on:false});
  });
  // birds
  ctx.fillStyle='#10141f';for(let i=0;i<5;i++){const bx=(t*22+i*70)%700-80,by=170+i*26+Math.sin(t*2+i)*8;ctx.beginPath();ctx.moveTo(bx-7,by);ctx.quadraticCurveTo(bx-3,by-4-Math.sin(t*14+i)*3,bx,by);ctx.quadraticCurveTo(bx+3,by-4-Math.sin(t*14+i)*3,bx+7,by);ctx.lineWidth=1.6;ctx.strokeStyle='#10141f';ctx.stroke()}
  dust(t,0,200,W,500,30,11,'#ffd9b0',.25,.6);
}
SC.city_dead=(t,u,d)=>{const p=u/d;let c=cam(p,{y0:-330,y1:10,z0:1,z1:1.1,x0:0,x1:-14});c=shakeCam(c,t,.35,3);cityDawn(t,c)};
SC.static_sky=(t,u,d)=>{cityDawn(1.3,{x:-14,y:10,z:1.1,rot:0})};
// ---------- the bloodshot eye
SC.eye_blood=(t,u,d)=>{const p=u/d;const h=hand(t,1.1,5);ctx.save();ctx.translate(h.x*2,h.y*2);ctx.rotate(h.rot*.01);
  vgrad(0,H,[[0,'#16101a'],[1,'#0a0810']]);glow(270,420,420,'#6fb8ff',.18);
  const sk='#b78f78';rect(-20,-20,W+40,H+40,sk);vgrad(0,H,[[0,'rgba(60,40,60,.5)'],[.4,'rgba(0,0,0,0)'],[1,'rgba(40,20,30,.5)']],-20,W+40);
  const cl=p<.28?0:p<.62?EZ.io((p-.28)/.34):p<.74?1:1-EZ.o3(clamp((p-.74)/.1));const cx=270,cy=440,ew=205,eh=104*(1-cl*.97);
  // brow
  ctx.fillStyle='#2a1e1c';ctx.beginPath();ctx.moveTo(40,210);ctx.quadraticCurveTo(250,130,500,200);ctx.quadraticCurveTo(250,185,40,235);ctx.fill();
  // under-eye bag
  ctx.fillStyle='rgba(88,62,96,.5)';ctx.beginPath();ctx.ellipse(cx,cy+86,ew*.92,30,0,0,Math.PI);ctx.fill();
  // eye opening
  ctx.save();ctx.beginPath();ctx.ellipse(cx,cy,ew,Math.max(2,eh),0,0,7);ctx.clip();
  ctx.fillStyle='#ece5df';ctx.fillRect(cx-ew,cy-eh,ew*2,eh*2);
  const pu=lerp(34,22,Math.min(1,pr(p,.8,.9)));
  // iris
  const lx=Math.sin(t*1.3)*6*(1-cl);ctx.fillStyle='#7a5632';ctx.beginPath();ctx.arc(cx+lx,cy+6,66,0,7);ctx.fill();
  for(let i=0;i<48;i++){const a=i/48*6.283;ctx.strokeStyle=i%2?'#a37a44':'#5a3e22';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(cx+lx+Math.cos(a)*(pu+4),cy+6+Math.sin(a)*(pu+4));ctx.lineTo(cx+lx+Math.cos(a)*64,cy+6+Math.sin(a)*64);ctx.stroke()}
  ctx.strokeStyle='#2a1a10';ctx.lineWidth=4;ctx.beginPath();ctx.arc(cx+lx,cy+6,66,0,7);ctx.stroke();ctx.fillStyle='#0a0808';ctx.beginPath();ctx.arc(cx+lx,cy+6,pu,0,7);ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.85)';rr(cx+lx-40,cy-34,34,22,5);ctx.fill();ctx.fillStyle='rgba(255,255,255,.5)';ctx.beginPath();ctx.arc(cx+lx+28,cy+40,6,0,7);ctx.fill();
  // veins
  const r=mul(14);ctx.lineCap='round';for(let i=0;i<26;i++){const side=r()<.5?-1:1,sy=(r()-.5)*150;ctx.strokeStyle=`rgba(190,40,48,${.55+r()*.35})`;ctx.lineWidth=1.2+r()*1.6;ctx.beginPath();let x=cx+side*ew,y=cy+sy;ctx.moveTo(x,y);for(let k=0;k<5;k++){x-=side*(24+r()*20);y+=(r()-.5)*28;ctx.lineTo(x,y)}ctx.stroke()}
  ctx.fillStyle='rgba(200,60,60,.22)';ctx.fillRect(cx-ew,cy-eh,ew*2,eh*2);
  ctx.restore();
  // lid edges
  ctx.strokeStyle='#1c1010';ctx.lineWidth=9;ctx.lineCap='round';ctx.beginPath();ctx.ellipse(cx,cy,ew,Math.max(2,eh),0,Math.PI,0,true);ctx.stroke();ctx.lineWidth=4;ctx.strokeStyle='#4a2a28';ctx.beginPath();ctx.ellipse(cx,cy,ew,Math.max(2,eh),0,0,Math.PI);ctx.stroke();
  // upper lid fold/crease + lashes
  ctx.strokeStyle='rgba(60,30,30,.5)';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(cx,cy-18+cl*50,ew*1.02,Math.max(2,eh)*1.18+10,0,Math.PI*1.04,Math.PI*1.96);ctx.stroke();
  for(let i=0;i<26;i++){const a=Math.PI*(1.05+i/26*.9);const x0=cx+Math.cos(a)*ew,y0=cy+Math.sin(a)*Math.max(2,eh);ctx.strokeStyle='#1c1010';ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x0+Math.cos(a)*14,y0+Math.sin(a)*14-3);ctx.stroke()}
  ctx.restore()};
