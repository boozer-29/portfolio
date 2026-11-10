// ============ EPISODE 3 — the warm flashback (shots 10-18) ============
function warmRoom(t,o={}){const w=o.warm??1;const gr=(a,b)=>mixc(a,b,1-w);
  vgrad(0,H,[[0,gr('#7a5232','#2a3350')],[1,gr('#3a2616','#10162a')]]);
  ctx.fillStyle='rgba(255,220,170,.05)';for(let x=-20;x<W;x+=44)ctx.fillRect(x,0,18,820);
  // window with a drawn-back curtain, dusk outside
  blk(26,250,150,230,6,gr('#d7a569','#3a4666'));ctx.fillStyle=gr('#e7a35a','#233049');ctx.fillRect(38,262,126,206);ctx.fillStyle=gr('#3a2a3c','#10162a');for(let i=0;i<5;i++)ctx.fillRect(48+i*22,380+Math.sin(i*2)*20,18,90);rect(99,262,3,206,gr('#d7a569','#3a4666'));rect(38,364,126,3,gr('#d7a569','#3a4666'));
  ctx.fillStyle=gr('#a8402f','#3a4258');ctx.beginPath();ctx.moveTo(26,240);ctx.lineTo(70,240);ctx.quadraticCurveTo(52,360,64,500);ctx.lineTo(26,500);ctx.fill();
  // lamp light
  glow(430,300,420,gr('#ffbe6b','#8aa4d8'),.5*w+.12);rect(420,180,4,120,gr('#4a3a2a','#2a3040'));blk(386,300,90,60,10,gr('#f3c98a','#8a97b8'),{hi:.3});glow(430,330,120,gr('#fff0cf','#cfe0ff'),.6*w+.2);
  // table
  vgrad(790,H,[[0,gr('#a8703a','#33405c')],[1,gr('#5a3a1c','#141a2a')]]);rect(0,786,W,5,gr('#c98d4e','#46526e'));
  dust(t,0,200,W,600,22,41,gr('#ffe2b0','#cfe0ff'),.35,.5)}
// Ollie bust from the front. o: arms 'sides'|'shh'|'mouth'|'tap'
function ollieBust(t,o={}){const sh=o.shake||0;const bx=270+Math.sin(t*38)*sh,by=470+Math.abs(Math.sin(t*19))*sh*1.4;
  blk(116,660,308,420,70,'#cc3b3b',{hi:.16});ctx.fillStyle='rgba(0,0,0,.14)';for(let i=0;i<7;i++)ctx.fillRect(116,700+i*40,308,3);
  bigHead(Object.assign({},OLLIE,{eyes:o.eyes||'open',mouth:o.mouth||null}),bx,by,8.4,{tilt:o.tilt||0});
  if(o.squint){ctx.strokeStyle='#1b1f2b';ctx.lineWidth=9;ctx.lineCap='round';for(const sx of[-1,1]){ctx.beginPath();ctx.arc(bx+sx*43,by+8,18,Math.PI*1.12,Math.PI*1.88);ctx.stroke()}}
  const sho=[[270-108,700],[270+108,700]];return{sho,bx,by}}
SC.fb_shh=(t,u,d)=>{const p=u/d;const c=cam(p,{z0:1.0,z1:1.08});ctx.save();ctx.translate(270,520);ctx.scale(c.z,c.z);ctx.translate(-270,-520);
  warmRoom(t,{warm:1});
  const up=EZ.o3(pr(t,CU.lines.f1.s+.25,CU.lines.f1.s+.85));const b=ollieBust(t,{eyes:blinkE(t,4),mouth:'smile'});
  // left arm resting on the table, right hand raised: one finger across his lips
  armIK(b.sho[0],[190,880],{auto:.6,out:-1,down:true,w0:70,w1:48,col:'#cc3b3b'});
  const hand=[lerp(380,300,up),lerp(900,596,up)];armIK(b.sho[1],hand,{auto:.58,out:1,down:true,w0:70,w1:46,col:'#cc3b3b',noHand:true});
  ctx.save();ctx.translate(hand[0],hand[1]);blk(-26,-8,52,50,16,'#e0b48c',{hi:.2});blk(-8,-70,16,70,8,'#e7bd97',{hi:.25});ctx.restore();
  ctx.restore();const v=ctx.createRadialGradient(270,520,260,270,520,640);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(30,10,0,.45)');ctx.fillStyle=v;ctx.fillRect(0,0,W,H)};
SC.fb_crayon=(t,u,d)=>{const p=u/d;const t0=CU.lines.f2.s+.35;const rv=EZ.io(pr(t,t0,t0+.9));
  warmRoom(t,{warm:1});ctx.fillStyle='rgba(30,14,0,.2)';ctx.fillRect(0,0,W,H);
  ctx.save();ctx.translate(270,520);ctx.scale(1+.06*p,1+.06*p);ctx.translate(-270,-520);
  // top-down on the table: the dino drawing being finished, a second drawing (you with a cape)
  ctx.save();ctx.translate(200,430);ctx.rotate(-.07);dinoDrawing(0,0,1.05,{reveal:rv});ctx.restore();
  ctx.save();ctx.translate(386,572);ctx.rotate(.09);paper(0,0,170,150);
  ctx.strokeStyle='#2f7fd6';ctx.lineWidth=4;ctx.lineCap='round';ctx.beginPath();ctx.arc(0,-34,13,0,7);ctx.moveTo(0,-21);ctx.lineTo(0,18);ctx.moveTo(0,-8);ctx.lineTo(-20,6);ctx.moveTo(0,-8);ctx.lineTo(20,6);ctx.moveTo(0,18);ctx.lineTo(-14,46);ctx.moveTo(0,18);ctx.lineTo(14,46);ctx.stroke();
  ctx.fillStyle='rgba(214,69,60,.85)';ctx.beginPath();ctx.moveTo(-4,-18);ctx.quadraticCurveTo(-40,10,-30,44);ctx.lineTo(0,10);ctx.fill();
  crayonText('MY BROTHER',0,58,17,'#d6453c',{seed:9});crayonText('NEVER LEAVES',0,72,17,'#d6453c',{seed:11});ctx.restore();
  // crayons on the table + his small hand drawing the last letters
  for(let i=0;i<5;i++){ctx.save();ctx.translate(70+i*26,700+i*3);ctx.rotate(.2*i-.3);blk(0,0,10,70,3,['#d6453c','#2f7fd6','#3fa34d','#f59e0b','#a855f7'][i],{hi:.3});ctx.restore()}
  const hx=lerp(210,336,rv)+Math.sin(t*14)*2,hy=lerp(470,500,rv)+Math.cos(t*17)*2;ctx.save();ctx.translate(hx,hy);ctx.rotate(.5);blk(-6,-44,12,64,3,'#d6453c',{hi:.3});blk(-26,-8,48,42,16,'#e0b48c',{hi:.2});for(let i=0;i<3;i++)blk(-24+i*17,22,15,14,6,'#e7bd97',{hi:.2});ctx.restore();
  armIK([700,640],[hx+30,hy+26],{auto:.58,out:1,down:true,w0:52,w1:38,col:'#b83232',noHand:true});
  ctx.restore();const v=ctx.createRadialGradient(270,520,260,270,520,640);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(30,10,0,.45)');ctx.fillStyle=v;ctx.fillRect(0,0,W,H)};
SC.fb_laugh=(t,u,d)=>{const p=u/d;const t0=CU.lines.f3.s+.3;const a=clamp((t-t0)/.2);const sh=a*(2.6+1.2*Math.sin(t*3));
  warmRoom(t,{warm:1});const b=ollieBust(t,{eyes:'closed',squint:true,shake:sh,tilt:Math.sin(t*19)*sh*.9,mouth:null});
  // both hands clamped over his mouth, shoulders shaking
  armIK(b.sho[0],[b.bx-18,b.by+90],{auto:.58,out:-1,down:true,w0:70,w1:48,col:'#cc3b3b'});armIK(b.sho[1],[b.bx+18,b.by+92],{auto:.58,out:1,down:true,w0:70,w1:48,col:'#cc3b3b'});
  // tiny tears of joy, and a hush of warm light; deliberately no sound cue on screen
  if(a>0){for(const sx of[-1,1]){ctx.fillStyle='rgba(180,220,255,.85)';ctx.beginPath();ctx.ellipse(b.bx+sx*66,b.by+56+((t*80)%30),4,7,0,0,7);ctx.fill()}}
  const v=ctx.createRadialGradient(270,520,260,270,520,640);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(30,10,0,.45)');ctx.fillStyle=v;ctx.fillRect(0,0,W,H)};
// first person: your open hand, his small hand taps it three times
SC.fb_taps=(t,u,d)=>{const p=u/d;warmRoom(t,{warm:1});ctx.fillStyle='rgba(30,14,0,.2)';ctx.fillRect(0,0,W,H);
  const taps=CU.fbTaps;let tap=0,k=-1;taps.forEach((x,i)=>{const a=t-x;if(a>-.12&&a<.3){const q=a<0?(a+.12)/.12:1-a/.3;if(q>tap){tap=q;k=i}}});
  // your palm, resting up
  const hx=250,hy=760;armIK([-40,1130],[hx-30,hy+50],{auto:.56,out:-1,down:true,w0:112,w1:72,col:C.must,noHand:true});openHand(hx,hy+36,-1,2.1);
  // his small hand comes down from above and taps
  const lift=70*(1-tap);const tx=hx+40,ty=hy-120+tap*68-lift*.0;armIK([640,330],[tx+10,ty-30],{auto:.58,out:1,down:true,w0:60,w1:44,col:'#b83232',noHand:true});
  ctx.save();ctx.translate(tx+10,ty);ctx.rotate(.12);blk(-22,-20,44,40,14,'#e0b48c',{hi:.2});blk(-6,16,12,42,6,'#e7bd97',{hi:.25});ctx.restore();
  if(tap>.55){const q=tap;for(let i=0;i<2;i++){ctx.strokeStyle=`rgba(255,226,170,${.7*(q-.55)*2*(1-i*.4)})`;ctx.lineWidth=4;ctx.beginPath();ctx.arc(tx+10,hy-20,34+i*26+(1-q)*40,0,7);ctx.stroke()}}
  // the toy walkie clipped to your hoodie strap, in clear view at the lower-left
  ctx.save();ctx.translate(86,900);ctx.rotate(-.12);blk(-70,-30,140,200,26,C.must,{hi:.2});rect(-22,-30,8,190,'#e8e8e0');rect(14,-30,8,190,'#e8e8e0');ctx.restore();toyWalkie(100,890,.9,{rot:-.12,led:.35+.2*Math.sin(t*3)});
  // crayon note appears on the last words
  const aw=CU.awakeT-.1;if(t>aw){const q=EZ.o3(pr(t,aw,aw+.4));ctx.save();ctx.translate(270,330);ctx.scale(q,q);ctx.rotate(-.03);paper(0,0,420,92,0,'#f6efdc');crayonText("I'M STILL AWAKE",0,18,52,'#d6453c',{seed:13,reveal:pr(t,aw+.1,aw+.9)});ctx.restore()}
  const v=ctx.createRadialGradient(270,520,260,270,520,640);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(30,10,0,.45)');ctx.fillStyle=v;ctx.fillRect(0,0,W,H)};
// ---- back to the cold present: the note
function hoodieBelly(t,warmK=0,y0=700){vgrad(0,H,[[0,mixc('#1c2438','#5a3a1c',warmK*.6)],[1,mixc('#0a0e18','#2a1808',warmK*.6)]]);blk(-40,y0,W+80,H-y0+120,70,C.must,{hi:.18});ctx.fillStyle='rgba(0,0,0,.18)';ctx.fillRect(-40,y0+70,W+80,6);for(const sd of[-1,1]){rect(270+sd*74-4,y0-10,8,150,'#e8e8e0')}}
SC.pocket=(t,u,d)=>{const p=u/d;const out=EZ.io(pr(p,.15,.7));vgrad(0,H,[[0,'#232a3c'],[1,'#0b0f19']]);
  // yellow hoodie belly with the kangaroo pocket
  blk(-60,520,W+120,700,90,C.must,{hi:.18});ctx.fillStyle='rgba(0,0,0,.14)';rr(90,780,360,170,26);ctx.fill();blk(86,770,368,170,26,shade(C.must,-.08),{hi:.15});rect(86,774,368,6,shade(C.must,-.3));
  // the paper, pulled out of the pocket and held up, red crayon showing through the fold
  const py=lerp(800,560,out),sc=lerp(.5,1,out);ctx.save();ctx.translate(270,py);ctx.scale(sc,sc);ctx.rotate(-.04);ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(-120+6,-90+8,240,180);ctx.fillStyle='#e9e0c8';ctx.fillRect(-120,-90,240,180);ctx.fillStyle='rgba(0,0,0,.08)';ctx.fillRect(-2,-90,4,180);
  ctx.strokeStyle='rgba(214,69,60,.6)';ctx.lineWidth=5;ctx.lineCap='round';for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(-90,-40+i*36);for(let x=-90;x<=90;x+=15)ctx.lineTo(x,-40+i*36+Math.sin(x*.3+i)*4);ctx.stroke()}ctx.restore();
  // your one hand pinching the paper
  const tr=hand(t*3,.4,3);armIK([560,1140],[286+tr.x,py+66*sc+tr.y],{auto:.56,out:1,down:true,w0:104,w1:64,col:C.must,noHand:true});ctx.save();ctx.translate(286+tr.x,py+54*sc+tr.y);blk(-26,-14,52,52,16,'#e0b48c',{hi:.2});blk(-34,-30,22,40,10,'#e7bd97',{hi:.25});ctx.restore();
  // other hand holds the pocket open
  armIK([-20,1140],[130,880],{auto:.56,out:-1,down:true,w0:104,w1:64,col:C.must,noHand:true});blk(104,858,52,52,16,'#e0b48c',{hi:.2});
  const v=ctx.createRadialGradient(270,560,220,270,560,660);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.5)');ctx.fillStyle=v;ctx.fillRect(0,0,W,H)};
// the note, full frame. focusBrave 0..1 : the last line is blurred until the rack focus
function noteSheet(t,o={}){const cold=o.cold??1;ctx.save();ctx.translate(270,o.y??500);ctx.rotate(o.rot??-.02);ctx.scale(o.s??1,o.s??1);
  ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(-196,-236,400,500);ctx.fillStyle=mixc('#e6dcc4','#cfd6e4',cold*.55);ctx.fillRect(-200,-250,400,500);ctx.fillStyle='rgba(0,0,0,.07)';for(let i=1;i<9;i++)ctx.fillRect(-200,-250+i*56,400,1.6);ctx.fillStyle='rgba(0,0,0,.08)';ctx.fillRect(-2,-250,4,500);
  const col=o.col||'#c9382f';const L=CU.lines;
  crayonText("I'LL LEAD",-4,-120,60,col,{seed:21,reveal:o.r1??1});crayonText('THEM AWAY.',-4,-52,60,col,{seed:22,reveal:o.r1b??o.r1??1});
  crayonText('COME GET',-4,40,60,col,{seed:23,reveal:o.r2??1});crayonText('ME AFTER.',-4,108,60,col,{seed:24,reveal:o.r2b??o.r2??1});
  ctx.save();if(o.blur)ctx.filter=`blur(${o.blur}px)`;const bw=crayonText('BE BRAVE',-4,196,66,col,{seed:25,reveal:o.r3??1});
  if(o.ringR){ctx.strokeStyle='#fff';ctx.lineWidth=4;ctx.beginPath();ctx.arc(o.ringR[0],o.ringR[1],o.ringR[2],0,7);ctx.stroke()}ctx.restore();
  ctx.restore()}
SC.note_read=(t,u,d)=>{const p=u/d;const L=CU.lines;vgrad(0,H,[[0,'#232a3c'],[1,'#0b0f19']]);
  const r1=pr(t,L.g2.s,L.g2.s+.9),r2=pr(t,L.g3.s,L.g3.s+.8),sc=lerp(.98,1.04,EZ.io(p));
  noteSheet(t,{r1:r1,r2:r2,r3:1,blur:6,s:.82*sc,cold:1,y:458});
  // both hands hold the paper's lower corners (one pair)
  for(const sd of[-1,1]){const tr=hand(t*3,.4,sd>0?3:8);armIK([270+sd*330,1160],[270+sd*196+tr.x,740+tr.y],{auto:.56,out:sd,down:true,w0:100,w1:62,col:C.must,noHand:true});gripHand(270+sd*196+tr.x,738+tr.y,sd,1.25,0)}
  const v=ctx.createRadialGradient(270,540,220,270,540,660);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.5)');ctx.fillStyle=v;ctx.fillRect(0,0,W,H)};
// the false comfort: warmth creeps in, you press the note to your chest
SC.comfort=(t,u,d)=>{const p=u/d;const L=CU.lines;const warm=EZ.io(pr(t,L.g4.s-.2,L.g5.s+.6));
  hoodieBelly(t,warm,560);glow(270,460,520,'#ffbe6b',.45*warm);
  const z=lerp(1,1.1,EZ.io(p));ctx.save();ctx.translate(270,640);ctx.scale(z,z);ctx.translate(-270,-640);
  ctx.save();ctx.translate(270,600);ctx.rotate(-.03);ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(-124,-96,252,196);ctx.fillStyle=mixc('#cfd6e4','#f1e6cd',warm);ctx.fillRect(-130,-104,260,200);ctx.strokeStyle='rgba(201,56,47,.85)';ctx.lineWidth=5;ctx.lineCap='round';for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(-96,-60+i*44);for(let x=-96;x<=96;x+=16)ctx.lineTo(x,-60+i*44+Math.sin(x*.3+i)*3);ctx.stroke()}ctx.restore();
  const br=Math.sin(t*1.6)*3;for(const sd of[-1,1]){const tr=hand(t*2,.3,sd>0?3:8);armIK([270+sd*330,1160],[270+sd*118+tr.x,640+br+tr.y],{auto:.56,out:sd,down:true,w0:100,w1:62,col:C.must,noHand:true});gripHand(270+sd*118+tr.x,640+br+tr.y,sd,1.2,0)}
  ctx.restore();const v=ctx.createRadialGradient(270,560,240,270,560,660);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(30,10,0,.5)');ctx.fillStyle=v;ctx.fillRect(0,0,W,H)};
SC.see_it=(t,u,d)=>{const p=u/d;const L=CU.lines;const bt=CU.braveT;const rack=EZ.io(pr(t,bt-.35,bt+.25));const drain=EZ.io(pr(t,bt-.1,bt+.6));
  vgrad(0,H,[[0,mixc('#5a3a1c','#232a3c',drain)],[1,mixc('#2a1808','#0b0f19',drain)]]);glow(270,470,520,'#ffbe6b',.4*(1-drain));
  const z=lerp(1.0,1.1,EZ.io(pr(p,.2,.95)));ctx.save();ctx.translate(270,458);ctx.scale(z,z);ctx.translate(-270,-458);
  noteSheet(t,{r1:1,r2:1,r3:1,blur:(1-rack)*7,cold:drain,s:.82,y:458});
  // outline the correct R
  if(rack>.7){ctx.save();ctx.translate(270,458);ctx.scale(.82,.82);ctx.rotate(-.02);ctx.globalAlpha=(rack-.7)/.3*(.6+.4*Math.sin(t*8));ctx.strokeStyle='#fff';ctx.lineWidth=3.5;rr(-62,146,48,64,8);ctx.stroke();ctx.restore()}
  ctx.restore();
  for(const sd of[-1,1]){armIK([270+sd*330,1160],[270+sd*214,760],{auto:.56,out:sd,down:true,w0:100,w1:62,col:C.must,noHand:true});gripHand(270+sd*214,758,sd,1.25,0)}
  const v=ctx.createRadialGradient(270,560,240,270,560,660);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.55)');ctx.fillStyle=v;ctx.fillRect(0,0,W,H)};
// split: his BЯAVE (warm) next to the note's BRAVE (cold)
SC.split_r=(t,u,d)=>{const p=u/d;const L=CU.lines;const sl=EZ.o3(pr(p,0,.2));
  ctx.save();ctx.beginPath();ctx.rect(0,0,270,H);ctx.clip();vgrad(0,H,[[0,'#7a5232'],[1,'#3a2616']]);glow(135,480,320,'#ffbe6b',.4);ctx.save();ctx.translate(135,500);ctx.scale(.84,.84);ctx.rotate(-.05);dinoDrawing(0,0,1.0,{});ctx.restore();ctx.restore();
  ctx.save();ctx.beginPath();ctx.rect(270,0,270,H);ctx.clip();vgrad(0,H,[[0,'#232a3c'],[1,'#0b0f19']]);ctx.save();ctx.translate(405,500);ctx.scale(.84,.84);ctx.rotate(.04);paper(0,0,300,250,0,'#d4dae6');crayonText('BRAVE',0,70,64,'#c9382f',{seed:25});ctx.restore();ctx.restore();
  rect(268,0,4,H,'#000');
  // ring the two R's, a mirrored one and a normal one
  const pu=.6+.4*Math.sin(t*7);ctx.lineWidth=3.5;
  const bw=EZ.o3(pr(t,L.h3.s+.9,L.h3.s+1.5));ctx.strokeStyle=`rgba(255,226,170,${pu*bw+0.0})`;ctx.beginPath();ctx.ellipse(135-29*.84,500+82*.84,25,30,0,0,7);ctx.stroke();ctx.strokeStyle=`rgba(255,255,255,${pu*bw})`;ctx.beginPath();ctx.ellipse(405-29*.84,500+48*.84,25,30,0,0,7);ctx.stroke();
  ctx.font='600 12px "JetBrains Mono"';ctx.letterSpacing='2px';ctx.textAlign='center';ctx.fillStyle='#ffd9a0';ctx.fillText('HIS',135,330);ctx.fillStyle='#cfe0ff';ctx.fillText('THE NOTE',405,330)};
SC.fist=(t,u,d)=>{const p=u/d;const t0=CU.lines.h4.s;const cl=EZ.o3(pr(t,t0+.05,t0+.55));vgrad(0,H,[[0,'#232a3c'],[1,'#0b0f19']]);
  // the note crumples as your hands close on it
  const s=lerp(1,.34,cl);ctx.save();ctx.translate(270,560);ctx.rotate(-.02+cl*.4);ctx.scale(s,s);ctx.fillStyle='#cfd6e4';ctx.fillRect(-190,-220,380,440);ctx.strokeStyle='rgba(201,56,47,.9)';ctx.lineWidth=7;for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(-130,-130+i*80);ctx.lineTo(130,-130+i*80);ctx.stroke()}
  ctx.strokeStyle=`rgba(40,40,60,${cl*.6})`;ctx.lineWidth=3;const r=mul(5);for(let i=0;i<14;i++){ctx.beginPath();ctx.moveTo((r()-.5)*380,(r()-.5)*440);ctx.lineTo((r()-.5)*380,(r()-.5)*440);ctx.stroke()}ctx.restore();
  for(const sd of[-1,1]){const gx=270+sd*lerp(216,64,cl),gy=lerp(740,590,cl);armIK([270+sd*300,1160],[gx,gy+24],{auto:.51,out:sd,down:true,w0:104,w1:70,col:C.must,noHand:true});ctx.save();ctx.translate(gx,gy);blk(-30,-22,60,52,20,'#e0b48c',{hi:.2});for(let i=0;i<4;i++)blk(-28+i*15,-26-(1-cl)*18,13,30+(1-cl)*16,6,'#e7bd97',{hi:.25});ctx.restore()}
  const k=EZ.ob(pr(t,t0,t0+.2));ctx.fillStyle=`rgba(201,56,47,${.35*(1-cl)})`;ctx.fillRect(0,0,W,H);
  const v=ctx.createRadialGradient(270,560,240,270,560,660);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.55)');ctx.fillStyle=v;ctx.fillRect(0,0,W,H)};
