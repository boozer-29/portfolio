// ============ EPISODE 2: scenes D ============
// ---------- sleepwalk: Ollie walks the corridor, every Sleeper kneels as he passes
function sleepwalk(t,u,d){const kt=CU.kneel_times;const SPD=1.55;const t0=kt[0];
  vgrad(0,H,[[0,'#08101e'],[1,'#10192d']]);const vx=270,vy=440;
  // corridor planes
  ctx.fillStyle='#17233d';ctx.beginPath();ctx.moveTo(-80,-60);ctx.lineTo(vx-46,vy-50);ctx.lineTo(vx-46,vy+60);ctx.lineTo(-80,1040);ctx.fill();ctx.beginPath();ctx.moveTo(620,-60);ctx.lineTo(vx+46,vy-50);ctx.lineTo(vx+46,vy+60);ctx.lineTo(620,1040);ctx.fill();
  ctx.fillStyle='#0b1324';ctx.beginPath();ctx.moveTo(-80,-60);ctx.lineTo(620,-60);ctx.lineTo(vx+46,vy-50);ctx.lineTo(vx-46,vy-50);ctx.fill();ctx.fillStyle='#223a64';ctx.beginPath();ctx.moveTo(-80,1040);ctx.lineTo(620,1040);ctx.lineTo(vx+46,vy+60);ctx.lineTo(vx-46,vy+60);ctx.fill();
  glow(vx,vy,220,'#cfe3ff',.28);rect(vx-30,vy-36,60,86,'#0e1a30');
  const proj=(z)=>({k:4.4/z,y:440+790/z});
  // ceiling lights scrolling toward us
  for(let i=0;i<8;i++){const z=((i*1.7-(t-t0)*SPD)%13.6+13.6)%13.6+1.4;const q=proj(z);ctx.fillStyle=`rgba(207,227,255,${.12+.5/z})`;ctx.fillRect(vx-26*q.k,vy-60-130*q.k*.5,52*q.k,4*q.k+1);glow(vx,vy-60-130*q.k*.5,60*q.k,'#cfe3ff',.12)}
  // sleepers: pairs line the walls. pair i is level with Ollie exactly at kt[i] and kneels then
  const OZ=2.1,items=[];for(let i=0;i<9;i++){for(const sd of[-1,1]){const z=OZ+(kt[i]-t)*SPD;items.push({i,sd,z})}}
  // extra standing Sleepers further ahead so the corridor never looks empty
  for(let j=0;j<6;j++){for(const sd of[-1,1]){const z=OZ+(kt[8]+.28*(j+1)-t)*SPD;items.push({i:9+j,sd,z})}}
  items.sort((a,b)=>b.z-a.z);
  for(const it of items){if(it.z<=.6||it.z>16)continue;const q=proj(it.z);const x=vx+it.sd*118*q.k*.92,s=q.k*.5;const kn=t>=kt[it.i%9]&&it.i<9;
    const age=t-kt[it.i%9];if(kn&&age<.45&&it.i<9){ctx.strokeStyle=`rgba(230,247,255,${.55*(1-age/.45)})`;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(x,q.y,20*q.k+age*80*q.k,6*q.k+age*22*q.k,0,0,7);ctx.stroke()}
    sleeperAt(x,q.y,s,(it.i*2+(it.sd>0?1:0))%6+1,kn?'kneel':'stand','closed')}
  // Ollie from behind: sleepwalking (arms limp, head down, legs alternate)
  const w=Math.sin((t-t0)*6.4);const O={x:vx,y:proj(OZ).y,s:proj(OZ).k*.5,top:'#cc3b3b',hat:'beanie',hatc:C.red,back:true,hairStyle:'none',bottom:'#2f4a7a',shadow:.7,pose:{bob:-Math.abs(w)*3,hL:Math.max(0,w)*10,hR:Math.max(0,-w)*10,kL:Math.max(0,w)*28,kR:Math.max(0,-w)*28,aL:10+w*7,aR:10-w*7,eL:-8,eR:-8,tilt:9+Math.sin((t-t0)*2)*2,lean:3}};
  // 'back' head draws hat as hair: draw beanie on top afterwards
  person(O);ctx.save();ctx.translate(O.x,O.y);ctx.scale(O.s,O.s);ctx.translate(0,-44+O.pose.bob);ctx.rotate(O.pose.lean*Math.PI/180);ctx.translate(0,-42);ctx.rotate(O.pose.tilt*Math.PI/180);ctx.translate(0,42);blk(-14,-74,28,17,8,C.red,{hi:.25});ctx.fillStyle=shade(C.red,-.25);ctx.fillRect(-14,-62,28,3.5);circ(0,-77,3.8,shade(C.red,.3));
  // plant: a faint green barcode glows behind his ear for 8 frames at the first kneel
  if(t>=kt[1]&&t<kt[1]+8/30){const a=.55+.45*Math.sin((t-kt[1])*60);ctx.globalAlpha=a;glow(12,-58,16,'#34d399',.9);ctx.fillStyle='#34d399';for(let i=0;i<7;i++)ctx.fillRect(8+i*1.3,-64,i%3?.7:1.3,12);ctx.globalAlpha=1}ctx.restore();
  fog(t,480,200,'#3b5a85',.06);const vg=ctx.createRadialGradient(270,500,160,270,520,620);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.4)');ctx.fillStyle=vg;ctx.fillRect(0,0,W,H)}
SC.sleepwalk=(t,u,d)=>{const h=hand(t,.5,62);ctx.save();ctx.translate(h.x,h.y);sleepwalk(t,u,d);ctx.restore()};
// ---------- the reveal: they were staring at HIM
function staring(t,focusOllie,swap){ // view from the street, behind the crowd, looking up at the window
  vgrad(0,H,[[0,'#06101f'],[1,'#0b1626']]);stars(t,60,4,0,300);
  // facade
  const fx=60,fw=420;blk(fx,40,fw,720,4,'#0d1830',{hi:.06});for(let r=0;r<7;r++)for(let c2=0;c2<4;c2++){if(r===2&&c2===2)continue;ctx.fillStyle=(r+c2)%3?'#0a1224':'#1a2540';ctx.fillRect(fx+24+c2*100,70+r*96,66,64)}
  // the lit window with the two of you
  const wx=286,wy=250,ww=130,wh=170;blk(wx-8,wy-8,ww+16,wh+16,6,'#1a2236');ctx.fillStyle='#2b1c10';ctx.fillRect(wx,wy,ww,wh);glow(wx+ww/2,wy+wh/2,170,C.amb,.55);ctx.fillStyle='rgba(255,200,120,.2)';ctx.fillRect(wx,wy,ww,wh);
  ctx.save();ctx.beginPath();ctx.rect(wx,wy,ww,wh);ctx.clip();
  const youA=1-swap*.55;ctx.globalAlpha=youA;ctx.save();if(swap>0){ctx.filter=`blur(${swap*3}px)`}person({x:wx+40,y:wy+wh+20,s:1.15,top:C.must,hood:true,hairStyle:'none',eyes:'wide',shadow:0,pose:{aL:8,aR:8}});ctx.restore();ctx.globalAlpha=1;
  person({x:wx+96,y:wy+wh+26,s:.95,top:'#cc3b3b',hat:'beanie',hatc:C.red,bottom:'#2f4a7a',hairStyle:'none',eyes:'closed',shadow:0,pose:{tilt:6,aL:8,aR:8}});ctx.restore();
  // gaze beams from the crowd to whoever they are looking at
  const tx=lerp(wx+40,wx+96,swap),ty=wy+wh*.45;ctx.save();ctx.globalCompositeOperation='lighter';const r=mul(33);
  for(let i=0;i<70;i++){const x=30+r()*480,y=800+r()*220;const g=ctx.createLinearGradient(x,y,tx,ty);g.addColorStop(0,'rgba(230,247,255,.0)');g.addColorStop(.3,'rgba(230,247,255,.10)');g.addColorStop(1,'rgba(230,247,255,.34)');ctx.strokeStyle=g;ctx.lineWidth=2.6;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(tx+(r()-.5)*14,ty+(r()-.5)*14);ctx.stroke()}ctx.restore();
  // spotlight ring on the target
  const pr_=1+.2*Math.sin(t*6);ctx.strokeStyle=swap>.5?'#E6F7FF':'rgba(230,247,255,.45)';ctx.lineWidth=swap>.5?3:2;ctx.beginPath();ctx.arc(tx,ty,(swap>.5?44:56)*pr_,0,7);ctx.stroke();glow(tx,ty,swap>.5?80:60,'#E6F7FF',swap>.5?.35:.2);
  // plant: green barcode glow behind Ollie's ear (8 frames)
  if(swap>.9&&t>=CU.stare_swap+.55&&t<CU.stare_swap+.55+8/30){ctx.globalAlpha=.7+.3*Math.sin(t*60);glow(wx+96+12,wy+wh-76,26,'#34d399',.9);ctx.fillStyle='#34d399';for(let i=0;i<7;i++)ctx.fillRect(wx+104+i*1.6,wy+wh-86,i%3?.9:1.6,18);ctx.globalAlpha=1}
  // the crowd's backs in the foreground, heads tilted up
  const r2=mul(8);for(let row=0;row<4;row++)for(let i=0;i<9;i++){const x=i*66+(row%2)*30-10+r2()*10,y=860+row*58,s=1.15+row*.28;ctx.save();ctx.translate(x,y);ctx.scale(s,s);blk(-13,-30,26,36,8,shade('#6b7280',-.3-row*.05),{hi:.1});blk(-9,-52,18,22,8,'#7b8294',{hi:.08});ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(-9,-40,18,8);ctx.restore()}
  const vg=ctx.createLinearGradient(0,780,0,H);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.5)');ctx.fillStyle=vg;ctx.fillRect(0,780,W,H-780)}
SC.stare_a=(t,u,d)=>{const h=hand(t,.4,63);ctx.save();ctx.translate(h.x,h.y);staring(t,false,0);ctx.restore()};
SC.stare_b=(t,u,d)=>{const sw=EZ.io(pr(t,CU.stare_swap,CU.stare_swap+.4));const h=hand(t,.4,64);ctx.save();ctx.translate(h.x,h.y);staring(t,true,sw);ctx.restore()};
// ---------- the door breaks
SC.door_break=(t,u,d)=>{const p=u/d;const hits=[CU.shake[4],CU.shake[5],CU.shake[6],CU.shake[7]].filter(x=>t>=x).length;const dm=[];const D=[[210,350,26],[330,640,34],[250,520,40],[300,300,44]];for(let i=0;i<hits;i++)dm.push(D[i]);
  doorCU(t,u,d,{hum:1.1+hits*.15,shake:2+hits*1.4,bump:hits*2,dent:dm,dentK:1});
  // shotgun barrel + Reyes' arms enter bottom-left
  ctx.save();ctx.translate(60,890);ctx.rotate(-.5);blk(0,-10,170,16,6,'#1a1a20',{hi:.3});ctx.restore();
  if(hits>=3){ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=`rgba(207,227,255,${.12+.25*Math.sin(t*40)})`;ctx.fillRect(130,200,280,680);ctx.restore()}
  if(hits>=4){ctx.fillStyle='rgba(255,255,255,.05)';ctx.fillRect(0,0,W,H)}};
// ---------- plank: cross to the next roof
SC.plank=(t,u,d)=>{const p=u/d;let c=cam(p,{z0:1.02,z1:1.12,y0:0,y1:-26});c=shakeCam(c,t,.9,65);const wob=Math.sin(t*3.2)*1.6;
  view(c,.25,()=>{SKY.night();stars(t,100,2,-600,240);glow(120,200,140,'#cfe0ff',.2)});
  view(c,.5,()=>{skylineLayer({seed:12,base:520,minW:40,maxW:84,minH:140,maxH:300,col:'#0d1a30',winFn:(x,y,q)=>q<.18?'#d9b060':null,gap:2,roof:true,beacon:true,t});fog(t,380,160,'#2a4a7a',.12)});
  view(c,.8,()=>{ // far roof (the other building) with exit door + ladder
    blk(130,520,280,140,4,'#1a2236',{hi:.1});rect(130,514,280,8,'#2a3350');blk(236,440,60,80,4,'#10192d');ctx.fillStyle='#0a1222';ctx.fillRect(246,452,40,68);glow(266,486,60,'#3ddc84',.4);ctx.fillStyle='#3ddc84';ctx.font='600 10px "JetBrains Mono"';ctx.textAlign='center';ctx.fillText('EXIT',266,446);rect(160,470,4,50,'#3a4258');rect(184,470,4,50,'#3a4258');for(let i=0;i<5;i++)rect(160,476+i*9,28,2,'#3a4258')});
  view(c,1,()=>{ // the gap: a deep drop with the street (and the crowd's eyes) far below
    const g=ctx.createLinearGradient(0,540,0,1100);g.addColorStop(0,'#0b1220');g.addColorStop(1,'#03050a');ctx.fillStyle=g;ctx.fillRect(-100,540,W+200,600);
    const r=mul(13);for(let i=0;i<90;i++){const x=r()*W,y=900+r()*200;glow(x,y,6,'#E6F7FF',.5);ctx.fillStyle='#E6F7FF';ctx.fillRect(x-1.5,y-1,3,2)}
    // our roof edge (bottom) + the other roof lip (top)
    blk(-60,980,W+120,140,6,'#2a3044',{hi:.15});blk(-60,960,W+120,26,4,'#3a4258',{hi:.2});
    // the plank: wide near us, narrow far away, bowing in the middle
    ctx.save();ctx.translate(wob,0);const nearL=190,nearR=350,farL=254,farR=286;ctx.fillStyle='#8a6a40';ctx.beginPath();ctx.moveTo(nearL,968);ctx.lineTo(nearR,968);ctx.lineTo(farR,560);ctx.lineTo(farL,560);ctx.closePath();ctx.fill();ctx.fillStyle='rgba(0,0,0,.2)';ctx.beginPath();ctx.moveTo(nearR-24,968);ctx.lineTo(nearR,968);ctx.lineTo(farR,560);ctx.lineTo(farR-6,560);ctx.fill();
    ctx.strokeStyle='rgba(60,36,16,.5)';ctx.lineWidth=2;for(let i=0;i<9;i++){const k=i/9;const x0=lerp(nearL+20,farL+3,k*k),x1=lerp(nearR-20,farR-3,k*k);ctx.beginPath();ctx.moveTo(lerp(x0,x1,.2),lerp(968,560,k));ctx.lineTo(lerp(x0,x1,.5),lerp(968,560,k)-18);ctx.stroke()}
    for(let i=0;i<6;i++){const k=i/6;ctx.fillStyle='rgba(255,255,255,.1)';ctx.fillRect(lerp(nearL,farL,k)+4,lerp(968,560,k),4,3)}ctx.restore();
    // you on the plank from behind, arms out for balance (one pair, the body's own arms)
    const sw=Math.sin(t*3.2);person({x:270+wob,y:962,s:2.2,top:C.must,hood:true,back:true,hairStyle:'none',shadow:.5,pose:{aL:78+sw*5,aR:78-sw*5,eL:-6,eR:-6,lean:sw*2.2,kL:4,kR:4,hL:3,hR:3}});
  });
  fog(t,600,260,'#3b5a85',.1)};
// ---------- B: down the stairwell, packed with kneeling Sleepers, a tiny red beanie far below
function stairShaft(t,zoom,o={}){vgrad(0,H,[[0,'#050810'],[1,'#0a1020']]);const cx=270,cy=500+(o.sy||0);const levels=11;
  for(let i=levels;i>=0;i--){const k=i/levels;const size=lerp(60,640,Math.pow(1-k,1.6)*.0+Math.pow(1-k,1.0));const sz=lerp(38,720,Math.pow(1-k,1.25))*zoom;const col=mixc('#0a1222','#2a3a5c',1-k);
    ctx.fillStyle=col;ctx.fillRect(cx-sz/2,cy-sz/2,sz,sz);ctx.fillStyle=mixc('#05080f','#10192d',1-k);const inn=sz*.58;ctx.fillRect(cx-inn/2,cy-inn/2,inn,inn);
    ctx.strokeStyle=`rgba(140,170,220,${.1+.3*(1-k)})`;ctx.lineWidth=Math.max(1.5,sz*.012);ctx.strokeRect(cx-sz/2,cy-sz/2,sz,sz);ctx.strokeRect(cx-inn/2,cy-inn/2,inn,inn);
    // kneeling Sleepers around each landing
    const n=12;for(let j=0;j<n;j++){const a=j/n*4;const side=Math.floor(a);const f=a-side;let px,py;const m=(sz+inn)/4;const half=m;px=cx+(side===0?-half+f*2*half:side===1?half:side===2?half-f*2*half:-half);py=cy+(side===0?-half:side===1?-half+f*2*half:side===2?half:half-f*2*half);const ss=sz/720*1.05;if(ss>.05)sleeperAt(px,py+ss*40,ss,(i+j)%6+1,'kneel','closed')}}
  // light + hum from far below, and Ollie's tiny beanie
  const by=cy+ (o.by||18);glow(cx,by,120*zoom,'#E6F7FF',.18);const pu=1+.25*Math.sin(t*5);glow(cx,by,28*pu,C.red,.8);circ(cx,by,5.5*zoom,C.red);circ(cx,by-1,2,shade(C.red,.4));
  for(let i=0;i<4;i++){const ph=(t*.9+i/4)%1;ctx.strokeStyle=`rgba(230,247,255,${.4*(1-ph)})`;ctx.lineWidth=2.5;ctx.strokeRect(cx-(40+ph*300)*zoom/2,cy-(40+ph*300)*zoom/2,(40+ph*300)*zoom,(40+ph*300)*zoom)}
  // your hands on the railing at the bottom of frame
  for(const sd of[-1,1]){const Hd=[270+sd*104,950],S=[270+sd*250,1120];armIK(S,Hd,{auto:.58,out:sd,down:true,w0:92,w1:50,col:C.must})}
  const vg=ctx.createRadialGradient(270,520,100,270,520,620);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.55)');ctx.fillStyle=vg;ctx.fillRect(0,0,W,H)}
SC.stair_down=(t,u,d)=>{const p=u/d;const c=shakeCam({x:0,y:0,z:1,rot:0},t,.6,66);ctx.save();ctx.translate(c.x*2,c.y*2);stairShaft(t,lerp(1,1.16,EZ.io(p)),{});ctx.restore()};
SC.stair_down2=(t,u,d)=>{const p=u/d;ctx.save();stairShaft(t,lerp(1.16,1.34,EZ.io(p)),{sy:lerp(0,-30,p),by:lerp(18,34,p)});ctx.restore()};
// ---------- the vote + CTA
SC.vote=(t,u,d)=>{const t0=CU.vote_t;vgrad(0,H,[[0,'#0c1020'],[1,'#07090f']]);const g=ctx.createRadialGradient(270,400,0,270,400,520);g.addColorStop(0,'rgba(60,80,130,.35)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);dust(t,0,200,W,600,30,50,'#9fb4d8',.3,.3);
  const warm=clamp((t-t0[3])/.6);if(warm>0)glow(270,470,380,C.amb,.16*warm*(.7+.3*Math.sin(t*3)));
  const title='WHAT DO YOU DO?';const n=Math.floor(clamp((t-t0[0])/0.7)*title.length);ctx.textAlign='center';ctx.font='72px "Bebas Neue"';ctx.letterSpacing='2px';ctx.fillStyle='#F4F4EF';ctx.fillText(title.slice(0,n),270,290);
  const pulse=1+.03*Math.sin((t-t0[1])*Math.PI/1.2)*(t>t0[1]+.6?1:0);
  function card(y,tc0,col,letter,l1,l2,tc,icon){const q=EZ.ob(clamp((t-tc0)/.35));if(t<tc0)return;ctx.save();ctx.globalAlpha=clamp((t-tc0)/.2);ctx.translate(270,y+66);ctx.scale(pulse,pulse);ctx.translate(-270+40*(1-q),-y-66);
    ctx.fillStyle='rgba(0,0,0,.4)';rr(54,y+8,440,132,22);ctx.fill();blk(50,y,440,132,22,'#161c30',{hi:.14});blk(66,y+22,88,88,16,col,{hi:.25});ctx.fillStyle=tc;ctx.font='80px "Bebas Neue"';ctx.letterSpacing='0px';ctx.fillText(letter,110,y+92);
    ctx.fillStyle='#F4F4EF';ctx.textAlign='left';ctx.font='42px "Bebas Neue"';ctx.letterSpacing='2px';ctx.fillText(l1,176,y+66);ctx.fillStyle='#8A8F99';ctx.font='600 15px "JetBrains Mono"';ctx.fillText(l2,176,y+94);ctx.textAlign='center';ctx.globalAlpha=clamp((t-tc0-.5)/.3);icon(446,y+66);ctx.restore()}
  card(330,t0[1],C.lime,'A','CROSS THE PLANK','SAVE YOURSELF','#0A0D16',(x,y)=>{ctx.fillStyle='#8a6a40';ctx.save();ctx.translate(x,y);ctx.rotate(-.25);ctx.fillRect(-28,-6,56,12);ctx.fillStyle='#5a4023';ctx.fillRect(-28,3,56,3);ctx.restore()});
  card(490,t0[2],C.red,'B','GO DOWN','FOR OLLIE','#fff',(x,y)=>{ctx.fillStyle='#6fb8ff';for(let i=0;i<4;i++)ctx.fillRect(x-24+i*11,y+18-i*11,14,9);circ(x+12,y-22,9,C.red)});
  if(t>=t0[4]){ctx.globalAlpha=EZ.io(pr(t,t0[4],t0[4]+.3));ctx.font='600 14px "JetBrains Mono"';ctx.letterSpacing='1.5px';ctx.fillStyle=C.lime;ctx.fillText('COMMENT A OR B · THE MOST VOTED CHOICE DECIDES',270,660);ctx.globalAlpha=1}};
SC.cta=(t,u,d)=>{rect(0,0,W,H,'#000');if(u>=.9){ctx.globalAlpha=.55*EZ.io(pr(u,.9,1.9));ctx.save();crowdBelow(t,0,{cy:420});ctx.restore();ctx.globalAlpha=1;ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(0,0,W,H)}
  const a=EZ.io(pr(t,CU.cta_t,CU.cta_t+8/30));ctx.globalAlpha=a;ctx.textAlign='center';ctx.font='96px "Bebas Neue"';ctx.letterSpacing='3px';ctx.fillStyle='#fff';ctx.fillText('FOLLOW FOR',270,470);ctx.fillStyle=C.lime;ctx.font='150px "Bebas Neue"';ctx.fillText('HOUR 53',270,590);ctx.globalAlpha=1};
