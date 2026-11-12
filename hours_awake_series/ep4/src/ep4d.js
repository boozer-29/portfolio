// ============ the old sleep clinic, B1
function clinicRoom(t,warm=1,noSign=false){vgr(0,640,'#2c3a3c','#1c2628');ctx.strokeStyle='rgba(255,255,255,.05)';ctx.lineWidth=1.5;for(let y=0;y<640;y+=34){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}for(let x=0;x<W;x+=34){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,640);ctx.stroke()}
  vgr(640,H,'#232a30','#12161a');ctx.fillStyle='#3a4448';ctx.fillRect(0,636,W,6);
  // sign
  if(!noSign){ctx.fillStyle='#d9dcd2';ctx.beginPath();ctx.roundRect(318,262,184,40,6);ctx.fill();ctx.strokeStyle=OLc;ctx.lineWidth=3;ctx.stroke();ctx.font='24px "Bebas Neue"';ctx.letterSpacing='2px';ctx.fillStyle='#2a3a3a';ctx.textAlign='center';ctx.fillText('SLEEP CLINIC · B1',410,291);ctx.letterSpacing='0px'}
  // EEG cart (left) with a flat green trace
  orr(40,470,100,150,8,'#3a4250',2.4);orr(52,482,76,52,5,'#0b1a14',2);ctx.strokeStyle='#4ade80';ctx.lineWidth=1.6;ctx.beginPath();for(let x=0;x<70;x+=2){const y=508+Math.sin(x*.4+t*6)*2;x?ctx.lineTo(55+x,y):ctx.moveTo(55,y)}ctx.stroke();ctx.strokeStyle='#1b1e29';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(140,520);ctx.quadraticCurveTo(200,600,240,600);ctx.stroke();
  // lamp + warm cone over the cot
  ctx.strokeStyle='#1b1e29';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(270,0);ctx.lineTo(270,330);ctx.stroke();orr(246,326,48,20,6,'#4a4f5c',2.2);
  const g=ctx.createRadialGradient(270,560,10,270,600,300);g.addColorStop(0,`rgba(255,200,130,${.42*warm})`);g.addColorStop(1,'rgba(255,200,130,0)');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(250,346);ctx.lineTo(290,346);ctx.lineTo(470,760);ctx.lineTo(70,760);ctx.fill()}
function cot(){orr(160,640,220,24,6,'#e8e4da',2.6);orr(150,630,240,14,5,'#a9b0bc',2.6);for(const x of[168,372])orr(x-4,662,8,40,3,'#59607a',2.2)}
// mode: mixed (back row stands, front row kneels) | kneel | stand ; ollie: awake | asleepLying | asleepKneel
function clinic(t,o={}){const mode=o.mode||'mixed';clinicRoom(t,o.warm??1,o.noSign);
  const back=[[70,602,1.02],[130,606,1.05],[190,610,1.05],[350,610,1.05],[410,606,1.05],[470,602,1.02]];const fx=o.frontX||[60,150,390,480];const front=[[fx[0],800,1.5],[fx[1],820,1.55],[fx[2],820,1.55],[fx[3],800,1.5]];
  const standB=mode!=='kneel',standF=mode==='stand';
  back.forEach(([x,y,s],i)=>fig('sleeper',x,y,s,{kneel:!standB,eyes:'closed',tilt:(x<270?14:-14)+(standB?0:8),lean:standB?0:8,arms:standB?[{},{}]:[{to:[-20,-46]},{to:[20,-46]}],c:slpC(i+3),shadow:false}));
  if(o.youBehind){fig('you',282,646,1.05,{kneel:true,eyes:'half',brow:'worry',mouth:'line',look:-1,tilt:-8,neck:neckPhones,arms:[{to:[-36,-58],pole:[-40,-75],hand:'back',thumbToward:[0,0]},{to:[22,-60],pole:[34,-80]}]})}
  cot();
  if(o.ollie==='asleepLying'){ctx.save();ctx.translate(330,640);ctx.rotate(-Math.PI/2);fig('ollie',0,0,1.25,{eyes:'closed',mouth:'line',shadow:false});ctx.restore()}
  else if(o.holding){const J=[268,602];const ox=300,oy=650,os=1.6;fig('ollie',ox,oy,os,{kneel:true,eyes:o.ollieEyes||'open',mouth:o.ollieMouth||'smile',look:-1,
      arms:[{to:[(J[0]+16-ox)/os,(J[1]-10-oy)/os],pole:[-30,-30],hand:'none'},{to:[14,-50],pole:[30,-40],hand:'grip',thumbToward:[0,-200]}],
      propFront:(A,g)=>{ctx.save();ctx.translate(16,-58);ctx.rotate(.12);ctx.fillStyle='#f6efdc';ctx.fillRect(-11,-9,22,16);ctx.strokeStyle=OLc;ctx.lineWidth=1.2;ctx.strokeRect(-11,-9,22,16);ctx.strokeStyle='#d6453c';ctx.lineWidth=1.1;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(-8,-5+i*4.5);ctx.lineTo(6,-5+i*4.5);ctx.stroke()}ctx.restore();thumbOver(g.grips[1],g.skin,g.o,[0,-5])}})}
  else fig('ollie',270,650,1.5,{kneel:true,eyes:o.ollie==='asleepKneel'?'closed':(o.ollieEyes||'open'),mouth:o.ollieMouth||'line',tilt:o.ollieTilt||0,look:0,arms:o.ollieArms||[{},{}]});
  front.forEach(([x,y,s],i)=>fig('sleeper',x,y,s,{back:true,kneel:!standF,tilt:(x<270?-6:6),c:slpC(i+11),shadow:false,arms:[{},{}]}));
  if(o.you){if(o.holding){const J=[268,602];const yx=170,yy=1060,ys=2.6;fig('you',yx,yy,ys,{back:true,neck:neckPhones,arms:[{},{to:[(J[0]-28-yx)/ys,(J[1]+16-yy)/ys],pole:[40,-110],raise:true,hand:'none',behind:false}]});clasp(t,1,1,0,{x:J[0],y:J[1],s:.42,rot:-.55,noSleeves:true})}
    else fig('you',o.youX??120,1210,2.7,{back:true,arms:[{},{}],neck:neckPhones})}}
// ============ 24. you open your eyes
SC.open_eyes=(t,u,d)=>{QA_SHOT='open_eyes';const p=u/d;const op=EZ.io(pr(p,.0,.45));ctx.save();if(op<1)ctx.filter=`blur(${(1-op)*8}px)`;ctx.translate(0,-60);clinic(t,{mode:'mixed',ollie:'awake',ollieEyes:'wide',ollieMouth:'smile',you:true,holding:true});ctx.restore();
  // your eyelids part
  const gap=op*620;ctx.fillStyle='#120202';ctx.beginPath();ctx.ellipse(270,480-gap-200,560,420,0,0,7);ctx.fill();ctx.beginPath();ctx.ellipse(270,480+gap+200,560,420,0,0,7);ctx.fill();ctx.fillStyle=`rgba(150,20,10,${.5*(1-op)})`;ctx.fillRect(0,0,W,H);vig(.45)};
// ============ 25/26. his crayon note
function ollieNote(t,o){ctx.save();ctx.filter='blur(7px)';clinic(t,{mode:'mixed',ollie:'awake'});ctx.restore();ctx.fillStyle='rgba(10,8,6,.45)';ctx.fillRect(0,0,W,H);QA_SHOT='note';
  const px=270,py=460,pw=340,ph=380;
  // his small hand holds the bottom-left corner: fingers behind the paper, thumb on the front
  const arm=fpArm([-30,980],[px-pw/2-4,py+ph/2-30],{w:34,col:K.red,k:2.1,hand:'grip',skin:K.skinO,thumbToward:[px,py],pole:[-40,800],L1:240,L2:240});
  ctx.save();ctx.translate(px,py);ctx.rotate(-.03);ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(-pw/2+6,-ph/2+8,pw,ph);ctx.fillStyle='#f6efdc';ctx.fillRect(-pw/2,-ph/2,pw,ph);ctx.strokeStyle=OLc;ctx.lineWidth=2.4;ctx.strokeRect(-pw/2,-ph/2,pw,ph);
  const Wd=CU.W;const p1=crayon('MY BЯOTHEЯ',0,-110,50,'#d6453c',{seed:41,ls:2,reveal:pr(t,Wd.i2[0][1]-.3,Wd.i2[1][1]+.3)});crayon('CAME.',0,-52,54,'#d6453c',{seed:42,reveal:pr(t,Wd.i2[2][1]-.1,Wd.i2[2][1]+.35)});
  // both R's are backwards: ring them
  const rr_=pr(t,Wd.i2[1][1]+.2,Wd.i2[1][1]+.5);if(rr_>0){ctx.strokeStyle=`rgba(255,255,255,${.75*rr_})`;ctx.lineWidth=3;ctx.lineWidth=2.2;for(const i of[3,9]){const q=p1[i];ctx.beginPath();ctx.ellipse(q[0],q[1]+2,24,30,0,0,7);ctx.stroke()}}
  if(o.under){crayon('WHEN I TAPPED',0,40,42,'#d6453c',{seed:43,reveal:pr(t,Wd.i3[3][1],Wd.i3[6][1]+.3)});crayon('BACK...',0,90,42,'#d6453c',{seed:44,reveal:pr(t,Wd.i3[6][1],Wd.i3[6][1]+.4)});crayon('THEY STOOD UP',0,142,42,'#d6453c',{seed:45,reveal:pr(t,Wd.i3[7][1]-.1,Wd.i3[9][1]+.2)})}
  ctx.restore();thumbOver(arm.g,K.skinO,2.8,[4,8]);vig(.45)}
SC.note_came=(t)=>ollieNote(t,{under:false});SC.note_under=(t)=>ollieNote(t,{under:true});
// ============ 27. they stood up (from the cot, looking out)
SC.stood_up=(t,u,d)=>{QA_SHOT='stood_up';const p=u/d;ctx.save();zoomAt(270,520,lerp(1,1.08,EZ.io(p)));clinicRoom(t,.6);
  const ppl=[[60,700,1.6],[160,690,1.5],[270,680,1.45],[380,690,1.5],[480,700,1.6],[110,860,2.1],[430,860,2.1]];ppl.forEach(([x,y,s],i)=>fig('sleeper',x,y,s,{eyes:'closed',tilt:(x<270?8:-8),arms:[{},{}],c:slpC(i+20),shadow:false}));ctx.restore();ctx.fillStyle='rgba(10,20,30,.25)';ctx.fillRect(0,0,W,H);vig(.55)};
// ============ 28. he was safe ... until you answered
SC.until_answer=(t,u,d)=>{QA_SHOT='until_answer';const cut=CU.lines.i5.s-.02;
  if(t<cut){clinic(t,{mode:'kneel',ollie:'asleepKneel'});ctx.save();ctx.globalCompositeOperation='saturation';ctx.fillStyle='#808080';ctx.globalAlpha=.6;ctx.fillRect(0,0,W,H);ctx.restore();ctx.fillStyle='rgba(255,220,170,.06)';ctx.fillRect(0,0,W,H);vig(.5);return}
  if(t<cut+3/30){walkieClose(t,{led:.25,press:1});ctx.fillStyle='rgba(201,56,47,.35)';ctx.fillRect(0,0,W,H);return}
  ctx.save();zoomAt(270,560,1.18);clinic(t,{mode:'stand',ollie:'awake',ollieEyes:'wide',ollieMouth:'o',noSign:true});ctx.restore();vig(.55)};
// ============ 29/30. fifty-four hours: he is in your arms. Over your shoulder (you from behind, kneeling): Ollie faces us,
// his chin on your right shoulder; his body is on the far side of you (only his sweater shows at your side); his arms go round
// your neck and his hands hold the back of your hoodie. Your arms are round him on the far side (hidden by your back).
// layers: room -> Ollie (body + head) -> you (back) -> his forearms on your upper back -> his hands (one finger taps later)
function hugShot(t,o){const z=o.z||1,zc=o.zc||[300,700],eyes=o.eyes||'half',tap=o.tap||0;
  vgr(0,H,'#2a2620','#14110c');const g=ctx.createRadialGradient(330,560,40,330,600,480);g.addColorStop(0,'rgba(255,200,130,.32)');g.addColorStop(1,'rgba(255,200,130,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  ctx.save();ctx.translate(zc[0],zc[1]);ctx.scale(z,z);ctx.translate(-zc[0],-zc[1]);ctx.translate(0,-220);const br=Math.sin(t*1.5)*2.5;
  figHead('ollie',392,688+br,5.6,{eyes,mouth:'smile',tilt:-12,brow:'worry',arms:[{none:true},{none:true}],idle:o.idle,shadow:false});
  fig('you',236,1560+br*.4,5.2,{back:true,arms:[{to:[-8,-96],pole:[-40,-112],hand:'none',cross:true},{to:[8,-96],pole:[40,-112],hand:'none',cross:true}],allowCross:true,neck:neckPhones,shadow:false});
  // his right arm over your right shoulder, his left arm round your left side; both hands grip the hoodie on your upper back
  tube([[372,792],[300,846],[262,872]],40,K.red,2.8);tube([[150,968],[188,936],[214,922]],40,K.red,2.8);
  const fist=(x,y,rot,lift)=>{ctx.save();ctx.translate(x,y);ctx.rotate(rot);union([{x:0,y:0,rx:24,ry:21},{t:[[-14,14],[-15,20]],w:11},{t:[[-4,16],[-4,22]],w:11},{t:[[6,15],[7,21]],w:11},{t:[[16,-4],[18-lift*6,4-lift*22]],w:10}],K.skinO,2.8);ctx.strokeStyle='rgba(0,0,0,.25)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-12,6);ctx.quadraticCurveTo(0,10,12,5);ctx.stroke();ctx.restore()};
  ctx.strokeStyle=shade(K.must,-.3);ctx.lineWidth=2.5;for(const [x,y] of[[246,890],[226,940]])for(const a of[-.8,0,.8]){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.sin(a)*34,y+Math.cos(a)*26);ctx.stroke()}
  fist(248,884,.5,tap);fist(226,934,-.4,0);
  ctx.restore();return{tap:[zc[0]+(266-zc[0])*z,zc[1]+(642-zc[1])*z]}}
SC.in_arms=(t,u,d)=>{QA_SHOT='in_arms';const p=u/d;hugShot(t,{z:lerp(1,1.06,EZ.io(p))});vig(.45)};
SC.eyes_closing=(t,u,d)=>{QA_SHOT='eyes_closing';const p=u/d;const W_=CU.W.j3;const k=pr(t,W_[1][1],W_[3][1]+.2);const eyes=k<.3?'half':k<.75?'heavy':'closed';
  let tk=0;for(const x of CU.lastTaps){const q=t-x;if(q>-.1&&q<.2)tk=Math.max(tk,q<0?(q+.1)/.1:1-q/.2)}
  const h=hugShot(t,{z:lerp(1.32,1.38,EZ.io(p)),zc:[330,480],eyes,tap:tk,idle:false});
  for(const x of CU.lastTaps){const q=t-x;if(q>0&&q<.8){ctx.strokeStyle=`rgba(255,200,140,${.7*(1-q/.8)})`;ctx.lineWidth=3;ctx.beginPath();ctx.arc(h.tap[0],h.tap[1],14+q*110,0,7);ctx.stroke()}}
  vig(.5)};
// ============ 31. and around him... they kneel (then the whole building)
function buildingKneel(t){vgr(0,H,'#0b1226','#1c2540');ctx.fillStyle='#232b40';ctx.fillRect(70,150,400,720);ctx.strokeStyle=OLc;ctx.lineWidth=3;ctx.strokeRect(70,150,400,720);
  for(let f=0;f<7;f++){const y=150+f*100;ctx.fillStyle='#2b3350';ctx.fillRect(74,y+92,392,8);for(let i=0;i<9;i++){const x=104+i*42+(f%2)*10;fig('sleeper',x,y+92,.34,{kneel:true,eyes:'closed',tilt:22,lean:12,shadow:false,o:1.2,c:slpC(f*9+i),arms:[{to:[-20,-46]},{to:[20,-46]}]})}}
  // basement: the cot under the warm lamp
  ctx.fillStyle='#120f0a';ctx.fillRect(70,870,400,90);const g=ctx.createRadialGradient(270,905,4,270,905,90);g.addColorStop(0,'rgba(255,200,130,.8)');g.addColorStop(1,'rgba(255,200,130,0)');ctx.fillStyle=g;ctx.fillRect(170,860,200,90);ctx.font='14px "Bebas Neue"';ctx.fillStyle='#ffd9a0';ctx.textAlign='center';ctx.fillText('B1',270,940)}
SC.kneel_all=(t,u,d)=>{QA_SHOT='kneel_all';const k=t>=CU.kneelT;ctx.save();ctx.translate(0,-80);if(k)zoomAt(270,560,lerp(1.0,1.06,EZ.o3(pr(t,CU.kneelT,CU.kneelT+.9))));clinic(t,{mode:k?'kneel':'stand',ollie:'asleepLying',frontX:[30,105,435,510],noSign:true,youBehind:true});ctx.restore();vig(.5)};
// ============ 32. the vote
function miniSleep(t,x,y,w,h){ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();vgr(y,y+h,'#2c3a3c','#1c2628');const cx=x+w/2,cy=y+h*.7;ctx.fillStyle='#e8e4da';ctx.fillRect(cx-40,cy,80,8);ctx.save();ctx.translate(cx+16,cy);ctx.rotate(-Math.PI/2);fig('ollie',0,0,.42,{eyes:'closed',shadow:false,o:1.4});ctx.restore();for(let i=0;i<6;i++){const sx=cx+(i-2.5)*62;if(Math.abs(sx-cx)<50)continue;fig('sleeper',sx,cy+16,.32,{kneel:true,eyes:'closed',tilt:16,lean:8,shadow:false,o:1.2,c:slpC(i),arms:[{to:[-20,-46]},{to:[20,-46]}]})}ctx.restore()}
function miniWake(t,x,y,w,h){ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();vgr(y,y+h,'#2c3a3c','#1c2628');const cx=x+w/2,cy=y+h*.85;fig('ollie',cx,cy,.42,{kneel:true,eyes:'wide',mouth:'o',shadow:false,o:1.4});for(let i=0;i<6;i++){const sx=cx+(i-2.5)*62;if(Math.abs(sx-cx)<40)continue;fig('sleeper',sx,cy+6,.36,{eyes:'closed',tilt:(sx<cx?10:-10),shadow:false,o:1.2,c:slpC(i)})}ctx.restore()}
SC.vote=(t,u,d)=>{QA_SHOT='vote';const t0=CU.vote_t;vgr(0,H,'#0c1020','#07090f');dust(t,0,200,W,600,30,50,'#9fb4d8',.3,.3);
  const warm=clamp((t-t0[3])/.6);if(warm>0)glow(270,500,380,K.amb,.14*warm*(.7+.3*Math.sin(t*3)));
  const title='WHAT DO YOU DO?';const n=Math.floor(clamp((t-t0[0])/.5)*title.length);ctx.textAlign='center';ctx.font='60px "Bebas Neue"';ctx.letterSpacing='2px';ctx.fillStyle='#F4F4EF';ctx.fillText(title.slice(0,n),270,292);ctx.letterSpacing='0px';
  const pulse=1+.025*Math.sin((t-t0[3])*Math.PI)*(t>t0[3]?1:0);
  function card(y,tc0,col,letter,l1,l2,tc,mini){if(t<tc0)return;const q=EZ.ob(clamp((t-tc0)/.35));ctx.save();ctx.globalAlpha=clamp((t-tc0)/.2);ctx.translate(270,y+88);ctx.scale(pulse,pulse);ctx.translate(-270+40*(1-q),-y-88);
    ctx.fillStyle='rgba(0,0,0,.4)';ctx.beginPath();ctx.roundRect(34,y+8,472,176,22);ctx.fill();ctx.fillStyle='#161c30';ctx.beginPath();ctx.roundRect(30,y,472,176,22);ctx.fill();ctx.fillStyle=col;ctx.beginPath();ctx.roundRect(46,y+14,62,62,14);ctx.fill();ctx.fillStyle=tc;ctx.font='58px "Bebas Neue"';ctx.textAlign='center';ctx.fillText(letter,77,y+62);
    ctx.fillStyle='#F4F4EF';ctx.textAlign='left';ctx.font='38px "Bebas Neue"';ctx.letterSpacing='2px';ctx.fillText(l1,124,y+46);ctx.fillStyle='#8A8F99';ctx.font='600 12px "JetBrains Mono"';ctx.letterSpacing='1px';ctx.fillText(l2,124,y+68);ctx.letterSpacing='0px';ctx.textAlign='center';
    ctx.save();ctx.beginPath();ctx.roundRect(46,y+84,440,84,14);ctx.clip();mini(t,46,y+84,440,84);ctx.restore();ctx.restore()}
  card(300,t0[1],K.lime,'A','LET HIM SLEEP','SAFE FOREVER · NEVER YOURS AGAIN','#0A0D16',miniSleep);
  card(486,t0[2],K.red,'B','WAKE HIM','EVERY ONE OF THEM HUNTS HIM','#fff',miniWake);
  if(t>=t0[4]){ctx.globalAlpha=EZ.io(pr(t,t0[4],t0[4]+.3));ctx.font='600 13px "JetBrains Mono"';ctx.letterSpacing='1.5px';ctx.fillStyle=K.lime;ctx.textAlign='center';ctx.fillText('COMMENT A OR B · THE MOST VOTED CHOICE DECIDES',270,762);ctx.globalAlpha=1;ctx.letterSpacing='0px'}};
SC.cta=(t,u,d)=>{rect(0,0,W,H,'#000');const a=EZ.io(pr(t,CU.cta_t,CU.cta_t+8/30));ctx.globalAlpha=a;ctx.textAlign='center';ctx.font='96px "Bebas Neue"';ctx.letterSpacing='3px';ctx.fillStyle='#fff';ctx.fillText('FOLLOW FOR',270,470);ctx.fillStyle=K.lime;ctx.font='150px "Bebas Neue"';ctx.fillText('HOUR 55',270,590);ctx.globalAlpha=1;ctx.letterSpacing='0px';
  for(const k of[0,.5,1]){const q=(u-.6-k*.3);if(q>0&&q<.9){ctx.strokeStyle=`rgba(255,255,255,${.25*(1-q/.9)})`;ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(270,520,60+q*300,0,7);ctx.stroke()}}};
