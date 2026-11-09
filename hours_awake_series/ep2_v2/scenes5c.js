// ============ EPISODE 2: scenes C (POV, tablet, sleepwalk, reveal, door, plank, stairs, vote) ============
// ---------- your eyes: heavy, closing, microsleep, open to empty arms
function openHand(x,y,sd,s=1,col='#e0b48c'){ctx.save();ctx.translate(x,y);ctx.scale(s,s);blk(-22,-30,44,40,14,col,{hi:.2});for(let i=0;i<4;i++){const a=(i-1.5)*.17;ctx.save();ctx.translate((i-1.5)*10.5,-30);ctx.rotate(a);const L=(i===1||i===2)?44:38;blk(-4.8,-L,9.6,L+2,4.8,col,{hi:.2});ctx.restore()}ctx.save();ctx.translate(-sd*21,-6);ctx.rotate(-sd*.75);blk(-5.6,-30,11.2,34,5.6,col,{hi:.2});ctx.restore();ctx.restore()}
function povOllie(t,sl){ // first person: Ollie in YOUR lap, held by YOUR two arms
  const nod=Math.sin(t*1.6)*sl*10;const O=ollieFront({x:270,y:1040,s:3.0,kneel:true,noArms:true,eyes:'closed',pose:{tilt:nod+3}});person(O);const so=shoulderPts(O,O.pose);
  const dc=[270,O.y-26*O.s];ctx.save();ctx.translate(dc[0],dc[1]);blk(-50,-8,100,44,20,'#3fa34d',{hi:.3});blk(34,-30,36,32,14,'#3fa34d',{hi:.3});circ(56,-20,3.4,'#fff');ctx.restore();
  armIK(so[0],[dc[0]-40,dc[1]+14],{auto:.6,out:-1,down:true,w0:34,w1:18,col:'#cc3b3b'});armIK(so[1],[dc[0]+40,dc[1]+14],{auto:.6,out:1,down:true,w0:34,w1:18,col:'#cc3b3b'});
  for(const sd of[-1,1]){const tr=hand(t*4,.5,sd>0?5:2);armIK([270+sd*250+tr.x,1100],[270+sd*128+tr.x,dc[1]+34+tr.y],{auto:.6,out:sd,down:true,w0:84,w1:50,col:C.must})}}
function campBlur(t,px){ctx.save();ctx.filter=`blur(${px}px)`;roofWorld(t,{x:0,y:0,z:1.05,rot:0},{});view({x:0,y:0,z:1.05,rot:0},1,()=>survivors(t,{sleep:1,ollieEyes:'closed',noYou:true}));ctx.restore();ctx.save();ctx.filter=`blur(${Math.max(0,px-3)}px)`;povOllie(t,1);ctx.restore()}
function lids(close,t){ // two heavy eyelids; close 0..1
  const h=close*H*.5+Math.sin(t*3)*2*close;ctx.fillStyle='#120a0c';ctx.beginPath();ctx.moveTo(-10,-10);ctx.lineTo(W+10,-10);ctx.lineTo(W+10,h-10);ctx.quadraticCurveTo(W/2,h+60*close,-10,h-10);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.moveTo(-10,H+10);ctx.lineTo(W+10,H+10);ctx.lineTo(W+10,H-h+10);ctx.quadraticCurveTo(W/2,H-h-60*close,-10,H-h+10);ctx.closePath();ctx.fill();
  ctx.fillStyle=`rgba(120,40,30,${.35*close})`;ctx.fillRect(0,h-6,W,4);ctx.fillRect(0,H-h+2,W,4)}
SC.pov_heavy=(t,u,d)=>{const p=u/d;const slow=.2+.35*EZ.io(p)+.12*Math.sin(t*5);campBlur(t,2+p*5);lids(slow,t);const vg=ctx.createRadialGradient(270,480,120,270,480,560);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,`rgba(0,0,0,${.5+p*.3})`);ctx.fillStyle=vg;ctx.fillRect(0,0,W,H)};
SC.pov_close=(t,u,d)=>{const p=u/d;const c=EZ.io(clamp(p*1.5));rect(0,0,W,H,'#05070d');if(c<1){campBlur(t,8);}lids(Math.min(1,.45+c*.6),t);
  // light through the eyelids fading to black + heartbeat
  const hb=Math.max(0,Math.sin(t*9))**6;const a=(1-c)*.5;rect(0,0,W,H,`rgba(5,7,13,${.3+c*.7})`);glow(270,480,300,'#7a2a1c',(.18*(1-c)+.05)*(1+hb));ctx.strokeStyle=`rgba(200,60,50,${.25*(1-p)})`;ctx.lineWidth=2;ctx.beginPath();for(let i=0;i<30;i++){const a=i/30*6.283;ctx.moveTo(270+Math.cos(a)*40,480+Math.sin(a)*80);ctx.lineTo(270+Math.cos(a)*(120+30*Math.sin(i*3)),480+Math.sin(a)*(240+60*Math.sin(i*2)))}ctx.stroke()};
SC.micro_a=(t,u,d)=>{const p=u/d;rect(0,0,W,H,'#05070d');glow(270,480,420,'#0d3a2a',.12);
  ctx.textAlign='center';ctx.font='600 15px "JetBrains Mono"';ctx.letterSpacing='4px';ctx.fillStyle='#8A8F99';ctx.fillText('BRAIN ACTIVITY',270,330);ctx.letterSpacing='0px';
  // EEG: fast waking waves slowing into sleep waves
  const slow=EZ.io(pr(p,.15,.8));ctx.strokeStyle='#3ddc84';ctx.shadowColor='#3ddc84';ctx.shadowBlur=10;ctx.lineWidth=3;ctx.beginPath();for(let x=30;x<=510;x+=3){const k=x/540;const f=lerp(.5,.09,slow*(.4+k));const amp=lerp(26,64,slow);const y=480+Math.sin(x*f+t*(6-slow*4))*amp*(.6+.4*Math.sin(x*.03))+(Math.sin(x*.9+t*10)*lerp(10,0,slow));x===30?ctx.moveTo(x,y):ctx.lineTo(x,y)}ctx.stroke();ctx.shadowBlur=0;
  const a=EZ.ob(pr(p,.35,.65));ctx.save();ctx.translate(270,640);ctx.scale(a,a);ctx.fillStyle=C.red;rr(-150,-24,300,48,24);ctx.fill();ctx.fillStyle='#fff';ctx.font='900 22px Montserrat';ctx.letterSpacing='2px';ctx.fillText('MICROSLEEP',0,8);ctx.restore()};
SC.micro_b=(t,u,d)=>{const p=u/d;rect(0,0,W,H,'#05070d');glow(270,470,380,'#3a2a08',.18);const q=EZ.io(pr(p,.05,.78));const n=Math.round(q*30);
  ctx.save();ctx.translate(270,470);ctx.strokeStyle='#1c2236';ctx.lineWidth=18;ctx.beginPath();ctx.arc(0,0,170,0,7);ctx.stroke();ctx.strokeStyle=C.amb;ctx.shadowColor=C.amb;ctx.shadowBlur=18;ctx.lineCap='round';ctx.beginPath();ctx.arc(0,0,170,-Math.PI/2,-Math.PI/2+q*6.283);ctx.stroke();ctx.shadowBlur=0;
  for(let i=0;i<60;i++){const a=i/60*6.283-Math.PI/2;ctx.strokeStyle=i%5?'rgba(255,255,255,.25)':'rgba(255,255,255,.7)';ctx.lineWidth=i%5?2:3;ctx.beginPath();ctx.moveTo(Math.cos(a)*190,Math.sin(a)*190);ctx.lineTo(Math.cos(a)*(i%5?198:206),Math.sin(a)*(i%5?198:206));ctx.stroke()}
  ctx.fillStyle='#fff';ctx.font='170px "Bebas Neue"';ctx.textAlign='center';ctx.fillText(String(n).padStart(2,'0'),0,56);ctx.fillStyle=C.amb;ctx.font='600 16px "JetBrains Mono"';ctx.letterSpacing='5px';ctx.fillText('SECONDS ASLEEP',0,104);ctx.restore()};
SC.pov_empty=(t,u,d)=>{const p=u/d;const open=EZ.o3(pr(p,0,.25));const focus=EZ.io(pr(p,.05,.5));let c=cam(p,{z0:1.05,z1:1.0,y0:-20,y1:0});c=shakeCam(c,t,.7,61);
  vgrad(0,H,[[0,'#2a3450'],[1,'#1a2236']]);
  // looking down at your lap: the roof floor, the lamp, the dino left behind
  view(c,.8,()=>{vgrad(300,1100,[[0,'#4a5166'],[1,'#1c2130']]);const r=mul(5);for(let i=0;i<160;i++){ctx.fillStyle=`rgba(255,255,255,${.03+r()*.06})`;ctx.fillRect(r()*W,300+r()*740,1.5+r()*2.5,1.4)}
    glow(300,560,420,'#c9d4ea',.18);
    // dino toy left behind on the gravel (plant for later)
    ctx.save();ctx.translate(404,760);ctx.rotate(-.35);blk(-50,-18,100,42,19,'#3fa34d',{hi:.3});blk(34,-36,34,30,13,'#3fa34d',{hi:.3});circ(56,-26,3.4,'#fff');circ(57,-25,1.6,'#111');ctx.fillStyle='#2e7d3a';for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(-32+i*18,-18);ctx.lineTo(-26+i*18,-30);ctx.lineTo(-20+i*18,-18);ctx.fill()}ctx.restore();
    // the warm patch where he was sitting, already fading
    ctx.save();ctx.globalAlpha=.25*(1-p*.5);ctx.fillStyle='#ffb060';ctx.beginPath();ctx.ellipse(270,760,86,56,0,0,7);ctx.fill();ctx.restore()});
  // your two empty hands, palms up (first person), trembling
  view(c,1.15,()=>{for(const sd of[-1,1]){const tr=hand(t*5,1.6,sd>0?7:3);const W2=[270+sd*96+tr.x,830+tr.y];armIK([270+sd*240,1120],W2,{auto:.58,out:sd,down:true,w0:92,w1:58,col:C.must,noHand:true});openHand(W2[0],W2[1]-4,sd,1.45)}});
  // eyes snapping open: lids fly away, vision focusing
  ctx.fillStyle=`rgba(5,7,13,${1-open})`;ctx.fillRect(0,0,W,H);if(focus<1){ctx.save();ctx.globalAlpha=(1-focus)*.9;ctx.filter=`blur(${10*(1-focus)}px)`;ctx.drawImage(cv,0,0,1080,1920,0,0,W,H);ctx.restore()}
  const vg=ctx.createRadialGradient(270,480,200,270,480,600);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.45)');ctx.fillStyle=vg;ctx.fillRect(0,0,W,H)};
// ---------- Maya's tablet: a building map, one dot moving
function tabletMap(t){const hS=CU.lines.l2.s,hE=CU.lines.l4.s-.15;const q=EZ.io(pr(t,hS,hE));const lab=pr(t,CU.lines.l4.s,CU.lines.l4.s+.5);const ap=EZ.o3(pr(t,CU.shots.find(s=>s.n==='tablet_dots').s,CU.shots.find(s=>s.n==='tablet_dots').s+.5));
  vgrad(0,H,[[0,'#07101c'],[1,'#05080f']]);glow(270,520,380,'#8cd5ff',.14);
  ctx.save();ctx.translate(0,(1-ap)*260);
  blk(24,200,492,640,36,'#1a2236',{hi:.25,lo:-.3});ctx.fillStyle='#08111f';rr(42,218,456,604,22);ctx.fill();ctx.save();rr(42,218,456,604,22);ctx.clip();
  // header + building section
  ctx.fillStyle='#8A8F99';ctx.font='600 11px "JetBrains Mono"';ctx.textAlign='left';ctx.letterSpacing='2px';ctx.fillText('BUILDING · LIVE',58,244);ctx.letterSpacing='0px';
  const bx=96,bw=300,top=290,fh=88;ctx.strokeStyle='rgba(120,160,210,.5)';ctx.lineWidth=2;ctx.strokeRect(bx,top,bw,fh*6);for(let i=1;i<6;i++){ctx.beginPath();ctx.moveTo(bx,top+i*fh);ctx.lineTo(bx+bw,top+i*fh);ctx.stroke()}
  ctx.fillStyle='rgba(120,160,210,.12)';ctx.fillRect(bx+bw-44,top,44,fh*6);ctx.strokeStyle='rgba(120,160,210,.5)';ctx.strokeRect(bx+bw-44,top,44,fh*6); // stairwell column
  ctx.fillStyle='#8A8F99';ctx.font='500 10px "JetBrains Mono"';ctx.fillText('ROOF',404,top+fh*.5);for(let i=1;i<6;i++)ctx.fillText('F'+(6-i),404,top+i*fh+fh*.5);
  // sleepers: a dot for each, filling every floor below the roof
  const r=mul(91);for(let f=1;f<6;f++){for(let i=0;i<48;i++){const x=bx+8+r()*(bw-60),y=top+f*fh+6+r()*(fh-12);ctx.fillStyle='rgba(255,255,255,.85)';ctx.fillRect(x-1.6,y-1.6,3.2,3.2)}}
  // the four survivors still on the roof (coloured dots)
  [['#5b6b3c',130],['#14b8a6',160],['#a855f7',190],[C.must,220]].forEach(([c,x])=>{circ(x,top+fh*.55,5,c);glow(x,top+fh*.55,16,c,.5)});
  // ONE dot moving: Ollie. roof -> stairwell -> down through every floor
  const path=[[262,top+fh*.55],[bx+bw-22,top+fh*.55],[bx+bw-22,top+fh*5.6]];const L0=Math.hypot(path[1][0]-path[0][0],0),L1=path[2][1]-path[1][1];const dd=q*(L0+L1);let ox,oy;if(dd<L0){ox=path[0][0]+dd;oy=path[0][1]}else{ox=path[1][0];oy=path[1][1]+(dd-L0)}
  if(t>=hS-.3){const pu=1+.4*Math.sin(t*9);glow(ox,oy,46*pu,C.red,.8);circ(ox,oy,7,C.red);ctx.strokeStyle=C.red;ctx.lineWidth=2;ctx.beginPath();ctx.arc(ox,oy,14*pu,0,7);ctx.stroke()}
  // sleepers kneel as the dot passes (dots near it vanish to rings)
  for(let k=0;k<26&&q>0;k++){const yy=top+fh+k*(fh*4.6/26);if(yy<oy){ctx.strokeStyle='rgba(230,247,255,.5)';ctx.beginPath();ctx.arc(bx+bw-22+((k%2)?-20:20),yy,4,0,7);ctx.stroke()}}
  ctx.restore();
  if(lab>0){const a=EZ.ob(lab);ctx.save();ctx.translate(270,810);ctx.scale(a,a);ctx.fillStyle='rgba(0,0,0,.6)';rr(-190,-44,380,88,22);ctx.fill();blk(-172,-30,60,60,14,'#cc3b3b',{hi:.2});ctx.fillStyle='#e0b48c';rr(-160,-14,36,26,8);ctx.fill();blk(-164,-24,44,14,6,C.red);ctx.fillStyle='#fff';ctx.font='36px "Bebas Neue"';ctx.textAlign='left';ctx.letterSpacing='2px';ctx.fillText('OLLIE',-96,-2);ctx.fillStyle=C.amb;ctx.font='600 14px "JetBrains Mono"';ctx.fillText('ASLEEP  z z z',-96,22);ctx.restore()}
  ctx.restore();
  // Maya's hands holding it (one pair)
  for(const sd of[-1,1]){const Hd=[270+sd*238,820];const S=[270+sd*330,1100];armIK(S,Hd,{auto:.6,out:sd,down:true,w0:100,w1:60,col:'#14b8a6'})}}
SC.tablet_dots=(t)=>tabletMap(t);SC.tablet_down=(t)=>tabletMap(t);SC.tablet_ollie=(t)=>tabletMap(t);
