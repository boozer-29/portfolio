// ============ EPISODE 5 scenes
const CX=270,CY=540;   // world centre of the clinic floor (overhead shots)
// --- the ring: kneeling Sleepers around you two (sprites, rotated so each bowed head points at the centre)
const KSPR=[];function kSprite(i){if(KSPR[i])return KSPR[i];const c=document.createElement('canvas');c.width=c.height=112;const sv=ctx;ctx=c.getContext('2d');ctx.scale(2,2);ctx.translate(28,28);kneelTop(0,0,1,i,0,1000);ctx=sv;return KSPR[i]=c}
const RING=(()=>{const P=[];let k=0;for(let R=118;R<820;R+=29){const n=Math.floor(2*Math.PI*R/27);for(let i=0;i<n;i++){k++;const a=i/n*2*Math.PI+hash(k)*.12+R*.01;const x=CX+Math.cos(a)*R*.86,y=CY+Math.sin(a)*R*1.12;P.push([x,y,k,.62+hash(k+7)*.08])}}return P})();
function ringKneel(alpha=1){ctx.save();ctx.globalAlpha=alpha;for(const [x,y,k,s] of RING){const a=Math.atan2(CY-y,CX-x);ctx.save();ctx.translate(x,y);ctx.rotate(a-Math.PI/2);ctx.drawImage(kSprite(k%9),-28*s,-28*s,56*s,56*s);ctx.restore()}ctx.restore()}
function ringStand(){for(const [x,y,k,s] of RING){const c=slpC(k);if(y<CY-560)continue;topDown(x+hash(k)*10,y-40,1.25*s,c.top,c.hair,(hash(k+3)-.5)*.2,{arms:true})}}
function floorTop(t,warm=1,cold=0){vgr(-600,1600,'#33352f','#20211c');ctx.strokeStyle='rgba(255,255,255,.05)';ctx.lineWidth=1.5;for(let x=-600;x<1200;x+=46){ctx.beginPath();ctx.moveTo(x,-700);ctx.lineTo(x,1700);ctx.stroke()}for(let y=-700;y<1700;y+=46){ctx.beginPath();ctx.moveTo(-700,y);ctx.lineTo(1300,y);ctx.stroke()}
  const g=ctx.createRadialGradient(CX,CY,20,CX,CY,520);g.addColorStop(0,`rgba(255,200,130,${.38*warm})`);g.addColorStop(1,'rgba(255,200,130,0)');ctx.fillStyle=g;ctx.fillRect(-600,-600,1500,1800);
  if(cold>0){ctx.fillStyle=`rgba(140,170,210,${.16*cold})`;ctx.fillRect(-600,-700,1500,2400)}}
function overheadCam(z,fx,fy,rot=0){ctx.translate(270,500);ctx.rotate(rot);ctx.scale(z,z);ctx.translate(-fx,-fy)}
// ============ 1-2. hook: close on him asleep on your chest, then rise to the whole kneeling ring
function hookZ(t){return t<2.4?lerp(3.3,1.25,EZ.io(t/2.4)):lerp(1.25,.6,EZ.o3(pr(t,2.4,5.3)))}
SC.hook1=SC.hook2=(t,u,d)=>{QA_SHOT='hook';const z=hookZ(t);const f=pr(t,0,3.5);ctx.save();overheadCam(z,lerp(CX+4,CX,f),lerp(CY-34,CY+10,f),lerp(-.05,.04,pr(t,0,5.3)));floorTop(t,1);ringKneel();lyingHug(CX,CY,1.05);ctx.restore();
  vig(.4);stamp('THEY KNEEL TO HIM.',t,CU.hookT[0],300,'#F4F4EF',48);stamp('AS LONG AS HE SLEEPS.',t,CU.hookT[1],362,K.red,44)};
// ============ 3. the vote result over a low look across the kneeling ring
SC.vote_stamp=(t,u,d)=>{QA_SHOT='vote_stamp';const p=u/d;ctx.save();zoomAt(270,620,lerp(1.02,1.1,EZ.io(p)));clinicRoom(t,.9,true);
  for(let i=0;i<9;i++){const x=20+i*62;fig('sleeper',x,612+((i*7)%3)*6,1.0,{kneel:true,eyes:'closed',tilt:(x<270?16:-16),lean:x<270?9:-9,c:slpC(i+2),shadow:false,arms:[{to:[-20,-46]},{to:[20,-46]}]})}
  for(let i=0;i<5;i++){const x=10+i*130;fig('sleeper',x,900,2.0,{back:true,kneel:true,tilt:(x<270?-5:5),c:slpC(i+20),shadow:false})}ctx.restore();
  ctx.fillStyle='rgba(8,10,16,.35)';ctx.fillRect(0,0,W,H);vig(.45);stamp('MOST OF YOU CHOSE A',t,CU.stampT[0],318,K.lime,52);stamp('YOU LET HIM SLEEP.',t,CU.stampT[1],380,'#F4F4EF',40)};
// ============ 4. close: his sleeping face on your chest
SC.face_sleep=(t,u,d)=>{QA_SHOT='face_sleep';const p=u/d;ctx.save();overheadCam(lerp(5.2,5.6,EZ.io(p)),CX+6,CY-24,-.08);floorTop(t,1.2);ringKneel();lyingHug(CX,CY,1.05);ctx.restore();vig(.5)};
// ============ 5. they'll never hurt him: warm, the ring around you, slow turn
SC.ring_warm=(t,u,d)=>{QA_SHOT='ring_warm';const p=u/d;ctx.save();overheadCam(lerp(1.05,.98,p),CX,CY,lerp(.1,.16,p));floorTop(t,1.5);ringKneel();lyingHug(CX,CY,1.05);ctx.restore();ctx.fillStyle='rgba(255,170,80,.12)';ctx.fillRect(0,0,W,H);vig(.45)};
// ============ 6. all night, eyes shut: your face (from above), he shifts, you stop breathing
SC.night_face=(t,u,d)=>{QA_SHOT='night_face';const s0=CU.shots.find(x=>x.n==='night_face').s;const p=u/d;vgr(0,H,'#262620','#15150f');
  ctx.save();zoomAt(270,520,lerp(1,1.06,EZ.io(p)));oblob(270,980,330,300,K.must,2.8);
  figHead('you',270,420,5.6,{eyes:'closed',mouth:'line',brow:'worry',arms:[{none:true},{none:true}],idle:false,shadow:false});
  const shift=EZ.io(pr(t,s0+.8,s0+1.2));sleepHeadTop(275+shift*8,840-shift*6,5.2+shift*.2,0);
  const held=t>s0+1.3;if(!held){for(let i=0;i<2;i++){const ph=((t-s0)*1.1+i*.5)%1;ctx.strokeStyle=`rgba(230,230,255,${.35*(1-ph)})`;ctx.lineWidth=3;ctx.beginPath();ctx.arc(270,560+ph*40,20+ph*30,.3,Math.PI-.3);ctx.stroke()}}
  ctx.restore();ctx.fillStyle='rgba(10,20,55,.32)';ctx.fillRect(0,0,W,H);vig(.5)};
// ============ 7-8. his finger lifts for a third tap... and never comes down. Two faint echoes of the first taps.
SC.finger=(t,u,d)=>{QA_SHOT='finger';const p=u/d;vgr(0,H,shade(K.must,-.35),shade(K.must,-.5));ctx.strokeStyle=shade(K.must,-.6);ctx.lineWidth=4;for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(-20,200+i*170);ctx.bezierCurveTo(150,160+i*170,350,260+i*170,560,210+i*170);ctx.stroke()}
  ctx.save();zoomAt(300,560,lerp(1,1.12,EZ.io(p)));const br=Math.sin(t*1.3)*4;
  const lift=EZ.io(pr(t,13.1,13.9))*(1-EZ.io(pr(t,15.3,15.9))*.85);
  tube([[640,300+br],[360,520+br]],70,K.red,2.8);
  ctx.save();ctx.translate(320,560+br);ctx.rotate(-.65);
  union([{x:0,y:0,rx:52,ry:44},{t:[[30,30],[62,58]],w:22},{t:[[10,40],[30,82]],w:22},{t:[[-14,40],[-8,84]],w:21},{t:[[-38,10],[-62,38]],w:22}],K.skinO,2.8);ctx.restore();
  // index finger: lifts off the fabric toward us (shorter + shadow under it), then sinks back
  const base=[350,600+br],tip=[lerp(392,366,lift),lerp(668,612,lift)+br];ctx.fillStyle=`rgba(0,0,0,${.25*lift})`;ctx.beginPath();ctx.ellipse(400,676+br,18,9,0,0,7);ctx.fill();tube([base,tip],24+lift*4,K.skinO,2.8);
  for(const x of CU.tapsEcho){const a=t-x;if(a>0&&a<.9){ctx.strokeStyle=`rgba(255,220,170,${.35*(1-a/.9)})`;ctx.lineWidth=3;ctx.beginPath();ctx.arc(396,676,20+a*130,0,7);ctx.stroke()}}
  ctx.restore();ctx.fillStyle='rgba(10,20,55,.38)';ctx.fillRect(0,0,W,H);vig(.55)};
// ============ 9. dawn: your eyelids open; cold light from a high window falls on the NEXT cot (a file on it)
function nextCotRoom(t){clinicRoom(t,.35,true);ctx.fillStyle='#0e1416';ctx.fillRect(330,40,170,40);ctx.fillStyle='rgba(190,215,240,.9)';ctx.fillRect(336,46,158,28);
  ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createLinearGradient(400,80,420,660);g.addColorStop(0,'rgba(170,200,235,.35)');g.addColorStop(1,'rgba(170,200,235,0)');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(340,74);ctx.lineTo(492,74);ctx.lineTo(540,680);ctx.lineTo(300,680);ctx.fill();ctx.restore();
  for(let i=0;i<5;i++){const x=24+i*58;fig('sleeper',x,612,.95,{kneel:true,eyes:'closed',tilt:22,lean:10,c:slpC(i+31),shadow:false,arms:[{to:[-20,-46]},{to:[20,-46]}]})}
  orr(318,640,206,22,6,'#e8e4da',2.6);orr(310,630,222,14,5,'#a9b0bc',2.6);for(const x of[326,516])orr(x-4,662,8,40,3,'#59607a',2.2);
  subjectFile(420,628,.62,{stamp:false,rot:-.1})}
SC.dawn=(t,u,d)=>{QA_SHOT='dawn';const op=EZ.io(pr(t,CU.T.lines.d1[0]+.9,CU.T.lines.d1[1]+.25));ctx.save();ctx.rotate(-.05);ctx.translate(0,-40);if(op<1)ctx.filter=`blur(${(1-op)*7}px)`;nextCotRoom(t);ctx.restore();
  ctx.fillStyle='rgba(120,150,190,.12)';ctx.fillRect(0,0,W,H);
  if(op<1){const gap=op*620;ctx.save();ctx.globalAlpha=1;const r0=pr(t,CU.shots.find(x=>x.n==='dawn').s,CU.T.lines.d1[0]+.9);ctx.fillStyle='#160303';ctx.beginPath();ctx.ellipse(270,480-gap-200,560,420,0,0,7);ctx.fill();ctx.beginPath();ctx.ellipse(270,480+gap+200,560,420,0,0,7);ctx.fill();ctx.fillStyle=`rgba(150,22,12,${.6*(1-op)})`;ctx.fillRect(0,0,W,H);ctx.restore()}vig(.45)};
// ============ 10-11. the file: your name (redacted), then SUBJECT 0
function fileClose(t,z,fx,fy,sk){vgr(0,H,'#a9b0bc','#7d8592');ctx.strokeStyle='rgba(0,0,0,.08)';for(let y=0;y<H;y+=9){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
  ctx.save();ctx.translate(270,520);ctx.scale(z,z);ctx.translate(-fx,-fy);subjectFile(270,520,2.5,{stamp:sk>0,stampK:sk,rot:-.04});ctx.restore();ctx.fillStyle='rgba(150,180,215,.12)';ctx.fillRect(0,0,W,H);vig(.4)}
SC.file_pan=(t,u,d)=>{QA_SHOT='file';const nm=CU.W.d2[3][1];const k=EZ.io(pr(t,nm-.6,nm+.3));fileClose(t,lerp(1.0,1.75,k),lerp(270,186,k),lerp(520,412,k),0);};
SC.stamp_s0=(t,u,d)=>{QA_SHOT='stamp';const q=t-CU.s0T;const sk=q<0?0:q<.12?lerp(1.6,1,q/.12):1;fileClose(t,lerp(1.15,1.22,u/d),250,555,sk);if(q>=0&&q<.08){ctx.fillStyle='rgba(255,255,255,.18)';ctx.fillRect(0,0,W,H)}};
// ============ 12-14. the photo: you at six, the bandage behind your ear, the nurse's hand... then her face: Maya
function photoBig(fx,fy,z,cover=0){vgr(0,H,'#8f969f','#6d737c');ctx.save();ctx.translate(270,500);ctx.scale(7.2*z,7.2*z);ctx.rotate(.03);ctx.translate(-fx,-fy);
  ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(-32,-38,70,82);orr(-34,-42,68,80,2,'#fbfaf4',1.2/z);ctx.save();ctx.beginPath();ctx.rect(-28,-36,56,58);ctx.clip();photoScene();ctx.restore();
  ctx.font='600 4px "JetBrains Mono"';ctx.fillStyle='#6b6b6b';ctx.textAlign='center';ctx.fillText('CLINIC B1 · DAY 1',0,32);if(cover>0){const yb=lerp(-60,-19,cover);ctx.fillStyle='rgba(0,0,0,.25)';ctx.fillRect(-46,-80,92,yb+82);orr(-46,-82,92,yb+80,3,'#d9b56d',1.2/z)}ctx.restore();ctx.fillStyle='rgba(150,180,215,.1)';ctx.fillRect(0,0,W,H);vig(.45)}
SC.photo=(t,u,d)=>{QA_SHOT='photo';const p=EZ.io(u/d);photoBig(lerp(-4,-6,p),lerp(0,-6,p),lerp(1.0,1.12,p),1)};
SC.maya_photo=(t,u,d)=>{QA_SHOT='maya_photo';const tl=EZ.io(pr(t,CU.shots.find(x=>x.n==='maya_photo').s,CU.mayaT-.1));const push=EZ.o3(pr(t,CU.mayaT,CU.mayaT+.35));photoBig(lerp(-2,8,tl),lerp(-4,-24,tl),lerp(1.15,1.45,tl)+push*.35,1-EZ.io(pr(tl,0,.45)))};
// ============ 13. picture only: your fingertips find the mark behind your ear; it glows (same mark as Ollie's)
SC.mark=(t,u,d)=>{QA_SHOT='mark';vgr(0,H,'#2c3a3c','#1c2628');ctx.fillStyle='rgba(150,180,215,.12)';ctx.fillRect(0,0,W,H);const g=EZ.io(pr(t,CU.glowT,CU.glowT+.3));ctx.save();zoomAt(270,520,lerp(1,1.06,u/d));earMark(240,470,4.0,g);ctx.restore();vig(.5)};
// ============ 15-17. his hand moves, the crayon, the writing (backwards R's)
const PAPER={x:270,y:560,w:380,h:250,rot:-.04};
function writeScene(t,z,fx,fy,o){vgr(0,H,'#3a3a36','#24241f');ctx.save();ctx.translate(270,500);ctx.scale(z,z);ctx.translate(-fx,-fy);
  ctx.save();ctx.translate(PAPER.x,PAPER.y);ctx.rotate(PAPER.rot);ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(-PAPER.w/2+6,-PAPER.h/2+8,PAPER.w,PAPER.h);ctx.fillStyle='#f4f1e6';ctx.fillRect(-PAPER.w/2,-PAPER.h/2,PAPER.w,PAPER.h);ctx.strokeStyle=OLc;ctx.lineWidth=2.4;ctx.strokeRect(-PAPER.w/2,-PAPER.h/2,PAPER.w,PAPER.h);
  ctx.fillStyle='rgba(60,60,60,.12)';for(let i=0;i<7;i++)ctx.fillRect(-PAPER.w/2+20,-PAPER.h/2+26+i*30,PAPER.w-40,2);
  let tip=o.tip;if(o.write){const W1=CU.W.e3;const r1=pr(t,W1[0][1]-.15,W1[1][1]-.15),r2=pr(t,W1[1][1]-.05,CU.T.lines.e3[1]+.25);
    const p1=crayon('BЯOTHEЯ...',-10,-30,54,'#d6453c',{seed:51,reveal:r1});const p2=crayon('WAKE ME UP',0,50,54,'#d6453c',{seed:52,reveal:r2});
    const cur=r2>0?p2[Math.max(0,Math.ceil(r2*p2.length)-1)]:p1[Math.max(0,Math.ceil(r1*p1.length)-1)];const c=Math.cos(PAPER.rot),s=Math.sin(PAPER.rot);const lx=cur[0]+14,ly=cur[1]+18;tip=[PAPER.x+lx*c-ly*s,PAPER.y+lx*s+ly*c];const away=EZ.io(pr(t,CU.T.lines.e3[1]+.3,CU.T.lines.e3[1]+.75));tip=[tip[0]+away*90,tip[1]-away*120]}
  ctx.restore();
  tube([[-60,40],[110,250],[150,330]],62,K.must,2.8);   // your side / arm on the floor (you are lying here)
  const tw=o.twitch||0;crayonHand(tip,3.0,-.8+tw*.12);ctx.restore();vig(.5)}
SC.hand_moves=(t,u,d)=>{QA_SHOT='hand_moves';const s0=CU.shots.find(x=>x.n==='hand_moves').s;const tw=Math.sin(pr(t,s0+.45,s0+1.2)*Math.PI*3)*(1-pr(t,s0+.45,s0+1.2));writeScene(t,1.0,280,560,{tip:[380,520],twitch:tw})};
SC.crayon_close=(t,u,d)=>{QA_SHOT='crayon';const p=EZ.io(pr(t,CU.shots.find(x=>x.n==='crayon_close').s,CU.T.lines.e2[1]));writeScene(t,lerp(1.25,1.55,p),lerp(330,250,p),lerp(530,540,p),{tip:[lerp(380,145,p),lerp(520,528,p)]})};
SC.writes=(t,u,d)=>{QA_SHOT='writes';writeScene(t,lerp(1.18,1.25,u/d),285,560,{write:true,tip:[150,530]})};
// ============ 18. the tear: he's been awake in there the whole time
SC.tear=(t,u,d)=>{QA_SHOT='tear';const k=pr(t,CU.tearT[0],CU.tearT[1]);const push=EZ.io(pr(t,CU.T.lines.e5[0],CU.T.lines.e5[1]));rect(0,0,W,H,K.skinO);ctx.save();zoomAt(270,520,lerp(1,1.12,push));rect(0,0,W,236+20,K.red);tearEye(270,520,3.6,k);ctx.restore();ctx.fillStyle='rgba(20,10,0,.12)';ctx.fillRect(0,0,W,H);vig(.55)};
// ============ 19. he stands, eyes closed (he moves: he is not a Sleeper). They are still kneeling behind him.
SC.stands=(t,u,d)=>{QA_SHOT='stands';const up=EZ.io(pr(t,CU.standT,CU.standT+1.1));ctx.save();clinicRoom(t,.4,true);ctx.fillStyle='rgba(140,170,210,.1)';ctx.fillRect(0,0,W,H);
  for(let i=0;i<9;i++){const x=20+i*62;if(Math.abs(x-270)<70)continue;fig('sleeper',x,622,1.05,{kneel:true,eyes:'closed',tilt:(x<270?16:-16),lean:x<270?9:-9,c:slpC(i+40),shadow:false,arms:[{to:[-20,-46]},{to:[20,-46]}]})}
  fig('ollie',270,lerp(1260,925,up),2.75,{eyes:'closed',mouth:'line',tilt:lerp(10,2,up),arms:[{},{}]});ctx.restore();vig(.5)};
// ============ 20. every one of them follows him: from above they are now STANDING, facing the door; he is at the door
SC.follow_top=(t,u,d)=>{QA_SHOT='follow_top';const p=u/d;ctx.save();overheadCam(lerp(.62,.66,p),CX,CY-405,0);floorTop(t,.8,.6);
  orr(CX-70,CY-760,140,60,6,'#0b0f14',3);ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(CX,CY-730,10,CX,CY-700,240);g.addColorStop(0,'rgba(190,215,240,.5)');g.addColorStop(1,'rgba(190,215,240,0)');ctx.fillStyle=g;ctx.fillRect(CX-260,CY-960,520,520);ctx.restore();
  lyingHug(CX,CY,1.05,{noOllie:true});ringStand();topDown(CX,CY-650,1.0,K.red,'#b83236',0,{arms:true});ctx.restore();vig(.45)};
// ============ 21. ...to the door: from behind, he stands in the doorway, the line of them behind him (backs to us)
SC.follow_door=(t,u,d)=>{QA_SHOT='follow_door';const p=u/d;ctx.save();zoomAt(270,520,lerp(1,1.08,EZ.io(p)));vgr(0,H,'#1c2628','#121819');
  ctx.fillStyle='#0b0f14';ctx.fillRect(196,330,148,300);ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createLinearGradient(0,330,0,630);g.addColorStop(0,'rgba(190,215,240,.55)');g.addColorStop(1,'rgba(190,215,240,.15)');ctx.fillStyle=g;ctx.fillRect(204,338,132,292);ctx.restore();ctx.strokeStyle=OLc;ctx.lineWidth=4;ctx.strokeRect(196,330,148,300);
  fig('ollie',270,640,1.55,{back:true,arms:[{},{}],shadow:false});
  const rows=[[175,690,1.3],[365,690,1.3],[120,790,1.7],[420,790,1.7],[50,900,2.3],[490,900,2.3]];rows.forEach(([x,y,s],i)=>fig('sleeper',x,y,s,{back:true,tilt:(x<270?4:-4),c:slpC(i+50),shadow:false}));
  ctx.restore();ctx.fillStyle='rgba(140,170,210,.08)';ctx.fillRect(0,0,W,H);vig(.55)};
// ============ 22. the empty floor where he lay: his red crayon rolls to a stop against your hand
SC.empty_cot=(t,u,d)=>{QA_SHOT='empty';const r=EZ.o3(pr(t,CU.shots.find(x=>x.n==='empty_cot').s,CU.shots.find(x=>x.n==='empty_cot').s+.5));vgr(0,H,'#3a3a36','#24241f');ctx.fillStyle='rgba(140,170,210,.1)';ctx.fillRect(0,0,W,H);
  tube([[-40,700],[190,560]],70,K.must,2.8);drawHand(222,542,-.55,2.6,'relax',K.skin,2.8,{thumbToward:[240,480]});
  const x=lerp(470,300,r),y=lerp(470,520,r);ctx.save();ctx.translate(x,y);ctx.rotate(.3);orr(-46,-9,92,18,4,'#d6453c',2.6);orr(-18,-9.5,40,19,2,'#f1e3c0',1.4);ctx.beginPath();ctx.moveTo(46,-9);ctx.lineTo(58,0);ctx.lineTo(46,9);ctx.closePath();ctx.fillStyle='#c0392b';ctx.fill();ctx.strokeStyle=OLc;ctx.lineWidth=2.4;ctx.stroke();
  ctx.strokeStyle='rgba(0,0,0,.25)';ctx.lineWidth=2;const ph=(1-r)*40;for(let i=-2;i<=2;i++){const xx=((i*16+ph)%80+80)%80-40;ctx.beginPath();ctx.moveTo(xx,-8);ctx.lineTo(xx,8);ctx.stroke()}ctx.restore();vig(.5)};
// ============ 23. the vote
function miniStay(t,x,y,w,h){ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();vgr(y,y+h,'#2c3a3c','#1c2628');const cx=x+w/2,cy=y+h*.9;ctx.fillStyle='#e8e4da';ctx.fillRect(cx-70,cy-20,90,8);
  fig('you',cx-30,cy,.36,{kneel:true,eyes:'open',look:1,shadow:false,o:1.3,idle:false});ctx.fillStyle='#0b0f14';ctx.fillRect(cx+90,cy-62,40,62);fig('maya',cx+110,cy,.34,{eyes:'open',look:-1,shadow:false,o:1.3,idle:false});ctx.restore()}
function miniFollow(t,x,y,w,h){ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();vgr(y,y+h,'#1c2430','#121820');const cy=y+h*.95;for(let i=0;i<9;i++){const sx=x+20+i*50;if(i===4)continue;fig('sleeper',sx,cy,.34,{eyes:'closed',shadow:false,o:1.2,c:slpC(i)})}fig('you',x+20+4*50,cy,.36,{eyes:'closed',shadow:false,o:1.3,idle:false});ctx.restore()}
SC.vote=(t,u,d)=>{QA_SHOT='vote';const t0=CU.vote_t;vgr(0,H,'#0c1020','#07090f');dust(t,0,200,W,600,30,50,'#9fb4d8',.3,.3);const warm=clamp((t-t0[3])/.6);if(warm>0)glow(270,500,380,K.amb,.14*warm*(.7+.3*Math.sin(t*3)));
  const title='WHAT DO YOU DO?';const n=Math.floor(clamp((t-t0[0])/.5)*title.length);ctx.textAlign='center';ctx.font='60px "Bebas Neue"';ctx.letterSpacing='2px';ctx.fillStyle='#F4F4EF';ctx.fillText(title.slice(0,n),270,292);ctx.letterSpacing='0px';
  const pulse=1+.025*Math.sin((t-t0[3])*Math.PI)*(t>t0[3]?1:0);
  function card(y,tc0,col,letter,l1,l2,tc,mini){if(t<tc0)return;const q=EZ.ob(clamp((t-tc0)/.35));ctx.save();ctx.globalAlpha=clamp((t-tc0)/.2);ctx.translate(270,y+88);ctx.scale(pulse,pulse);ctx.translate(-270+40*(1-q),-y-88);
    ctx.fillStyle='rgba(0,0,0,.4)';ctx.beginPath();ctx.roundRect(34,y+8,472,176,22);ctx.fill();ctx.fillStyle='#161c30';ctx.beginPath();ctx.roundRect(30,y,472,176,22);ctx.fill();ctx.fillStyle=col;ctx.beginPath();ctx.roundRect(46,y+14,62,62,14);ctx.fill();ctx.fillStyle=tc;ctx.font='58px "Bebas Neue"';ctx.textAlign='center';ctx.fillText(letter,77,y+62);
    ctx.fillStyle='#F4F4EF';ctx.textAlign='left';ctx.font='38px "Bebas Neue"';ctx.letterSpacing='2px';ctx.fillText(l1,124,y+46);ctx.fillStyle='#8A8F99';ctx.font='600 12px "JetBrains Mono"';ctx.letterSpacing='1px';ctx.fillText(l2,124,y+68);ctx.letterSpacing='0px';ctx.textAlign='center';
    ctx.save();ctx.beginPath();ctx.roundRect(46,y+84,440,84,14);ctx.clip();mini(t,46,y+84,440,84);ctx.restore();ctx.restore()}
  card(300,t0[1],K.lime,'A','STAY','THE CITY IS SAFE · MAYA HAS ANSWERS','#0A0D16',miniStay);
  card(486,t0[2],K.red,'B','FOLLOW HIM','EYES SHUT · WHEREVER HE IS GOING','#fff',miniFollow);
  if(t>=t0[4]){ctx.globalAlpha=EZ.io(pr(t,t0[4],t0[4]+.3));ctx.font='600 13px "JetBrains Mono"';ctx.letterSpacing='1.5px';ctx.fillStyle=K.lime;ctx.textAlign='center';ctx.fillText('COMMENT A OR B · THE MOST VOTED CHOICE DECIDES',270,762);ctx.globalAlpha=1;ctx.letterSpacing='0px'}};
SC.cta=(t,u,d)=>{rect(0,0,W,H,'#000');const a=EZ.io(pr(t,CU.cta_t,CU.cta_t+8/30));ctx.globalAlpha=a;ctx.textAlign='center';ctx.font='96px "Bebas Neue"';ctx.letterSpacing='3px';ctx.fillStyle='#fff';ctx.fillText('FOLLOW FOR',270,470);ctx.fillStyle=K.lime;ctx.font='150px "Bebas Neue"';ctx.fillText('HOUR 60',270,590);
  ctx.font='700 15px Montserrat';ctx.letterSpacing='2px';ctx.fillStyle='#F4F4EF';ctx.fillText('NEW HERE? START AT PART 1 (PINNED)',270,660);ctx.globalAlpha=1;ctx.letterSpacing='0px';
  for(const k of[0,.5,1]){const q=(u-.5-k*.3);if(q>0&&q<.9){ctx.strokeStyle=`rgba(255,255,255,${.25*(1-q/.9)})`;ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(270,520,60+q*300,0,7);ctx.stroke()}}};
