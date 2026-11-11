// ============ the old sleep clinic, B1
function clinicRoom(t,warm=1){vgr(0,640,'#2c3a3c','#1c2628');ctx.strokeStyle='rgba(255,255,255,.05)';ctx.lineWidth=1.5;for(let y=0;y<640;y+=34){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}for(let x=0;x<W;x+=34){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,640);ctx.stroke()}
  vgr(640,H,'#232a30','#12161a');ctx.fillStyle='#3a4448';ctx.fillRect(0,636,W,6);
  // sign
  ctx.fillStyle='#d9dcd2';ctx.beginPath();ctx.roundRect(170,262,200,42,6);ctx.fill();ctx.strokeStyle=OLc;ctx.lineWidth=3;ctx.stroke();ctx.font='26px "Bebas Neue"';ctx.letterSpacing='2px';ctx.fillStyle='#2a3a3a';ctx.textAlign='center';ctx.fillText('SLEEP CLINIC · B1',270,292);ctx.letterSpacing='0px';
  // EEG cart (left) with a flat green trace
  orr(40,470,100,150,8,'#3a4250',2.4);orr(52,482,76,52,5,'#0b1a14',2);ctx.strokeStyle='#4ade80';ctx.lineWidth=1.6;ctx.beginPath();for(let x=0;x<70;x+=2){const y=508+Math.sin(x*.4+t*6)*2;x?ctx.lineTo(55+x,y):ctx.moveTo(55,y)}ctx.stroke();ctx.strokeStyle='#1b1e29';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(140,520);ctx.quadraticCurveTo(200,600,240,600);ctx.stroke();
  // lamp + warm cone over the cot
  ctx.strokeStyle='#1b1e29';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(270,0);ctx.lineTo(270,330);ctx.stroke();orr(246,326,48,20,6,'#4a4f5c',2.2);
  const g=ctx.createRadialGradient(270,560,10,270,600,300);g.addColorStop(0,`rgba(255,200,130,${.42*warm})`);g.addColorStop(1,'rgba(255,200,130,0)');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(250,346);ctx.lineTo(290,346);ctx.lineTo(470,760);ctx.lineTo(70,760);ctx.fill()}
function cot(){orr(160,640,220,24,6,'#e8e4da',2.6);orr(150,630,240,14,5,'#a9b0bc',2.6);for(const x of[168,372])orr(x-4,662,8,40,3,'#59607a',2.2)}
// mode: mixed (back row stands, front row kneels) | kneel | stand ; ollie: awake | asleepLying | asleepKneel
function clinic(t,o={}){const mode=o.mode||'mixed';clinicRoom(t,o.warm??1);
  const back=[[70,602,1.02],[130,606,1.05],[190,610,1.05],[350,610,1.05],[410,606,1.05],[470,602,1.02]];const fx=o.frontX||[60,150,390,480];const front=[[fx[0],800,1.5],[fx[1],820,1.55],[fx[2],820,1.55],[fx[3],800,1.5]];
  const standB=mode!=='kneel',standF=mode==='stand';
  back.forEach(([x,y,s],i)=>fig('sleeper',x,y,s,{kneel:!standB,eyes:'closed',tilt:(x<270?14:-14)+(standB?0:8),lean:standB?0:8,arms:standB?[{},{}]:[{to:[-20,-46]},{to:[20,-46]}],c:slpC(i+3),shadow:false}));
  cot();
  if(o.ollie==='asleepLying'){ctx.save();ctx.translate(330,640);ctx.rotate(-Math.PI/2);fig('ollie',0,0,1.25,{eyes:'closed',mouth:'line',shadow:false});ctx.restore()}
  else fig('ollie',270,650,1.5,{kneel:true,eyes:o.ollie==='asleepKneel'?'closed':(o.ollieEyes||'open'),mouth:o.ollieMouth||'line',tilt:o.ollieTilt||0,look:0,arms:o.ollieArms||[{},{}]});
  front.forEach(([x,y,s],i)=>fig('sleeper',x,y,s,{back:true,kneel:!standF,tilt:(x<270?-6:6),c:slpC(i+11),shadow:false,arms:[{},{}]}));
  if(o.you)fig('you',o.youX??120,1210,2.7,{back:true,arms:[{},{}],neck:(g)=>{ctx.strokeStyle=OLc;ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,g.shY+2,13,.15,Math.PI-.15);ctx.stroke();ctx.strokeStyle='#2b2f3a';ctx.lineWidth=2.6;ctx.stroke()}})}
// ============ 24. you open your eyes
SC.open_eyes=(t,u,d)=>{QA_SHOT='open_eyes';const p=u/d;const op=EZ.io(pr(p,.0,.45));ctx.save();if(op<1)ctx.filter=`blur(${(1-op)*8}px)`;clinic(t,{mode:'mixed',ollie:'awake',ollieEyes:'wide',ollieMouth:'smile',you:true});ctx.restore();
  // your eyelids part
  const gap=op*620;ctx.fillStyle='#120202';ctx.beginPath();ctx.ellipse(270,480-gap-200,560,420,0,0,7);ctx.fill();ctx.beginPath();ctx.ellipse(270,480+gap+200,560,420,0,0,7);ctx.fill();ctx.fillStyle=`rgba(150,20,10,${.5*(1-op)})`;ctx.fillRect(0,0,W,H);vig(.45)};
// ============ 25/26. his crayon note
function ollieNote(t,o){ctx.save();ctx.filter='blur(7px)';clinic(t,{mode:'mixed',ollie:'awake'});ctx.restore();ctx.fillStyle='rgba(10,8,6,.45)';ctx.fillRect(0,0,W,H);QA_SHOT='note';
  const px=270,py=460,pw=340,ph=380;
  // his small hand holds the bottom-left corner: fingers behind the paper, thumb on the front
  const arm=fpArm([-30,980],[px-pw/2+34,py+ph/2-18],{w:34,col:K.red,k:2.1,hand:'grip',skin:K.skinO,thumbToward:[px,py],pole:[-40,800],L1:240,L2:240});
  ctx.save();ctx.translate(px,py);ctx.rotate(-.03);ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(-pw/2+6,-ph/2+8,pw,ph);ctx.fillStyle='#f6efdc';ctx.fillRect(-pw/2,-ph/2,pw,ph);ctx.strokeStyle=OLc;ctx.lineWidth=2.4;ctx.strokeRect(-pw/2,-ph/2,pw,ph);
  const Wd=CU.W;const p1=crayon('MY BЯOTHEЯ',0,-110,50,'#d6453c',{seed:41,ls:2,reveal:pr(t,Wd.i2[0][1]-.3,Wd.i2[1][1]+.3)});crayon('CAME.',0,-52,54,'#d6453c',{seed:42,reveal:pr(t,Wd.i2[2][1]-.1,Wd.i2[2][1]+.35)});
  // both R's are backwards: ring them
  const rr_=pr(t,Wd.i2[1][1]+.2,Wd.i2[1][1]+.5);if(rr_>0){ctx.strokeStyle=`rgba(255,255,255,${.9*rr_})`;ctx.lineWidth=3;for(const i of[3,9]){const q=p1[i];ctx.beginPath();ctx.ellipse(q[0],q[1],17,21,0,0,7);ctx.stroke()}}
  if(o.under){crayon('WHEN I TAPPED',0,40,42,'#d6453c',{seed:43,reveal:pr(t,Wd.i3[3][1],Wd.i3[6][1]+.3)});crayon('BACK...',0,90,42,'#d6453c',{seed:44,reveal:pr(t,Wd.i3[6][1],Wd.i3[6][1]+.4)});crayon('THEY STOOD UP',0,142,42,'#d6453c',{seed:45,reveal:pr(t,Wd.i3[7][1]-.1,Wd.i3[9][1]+.2)})}
  ctx.restore();thumbOver(arm.g,K.skinO,2.8,[2,-8]);vig(.45)}
SC.note_came=(t)=>ollieNote(t,{under:false});SC.note_under=(t)=>ollieNote(t,{under:true});
// ============ 27. they stood up (from the cot, looking out)
SC.stood_up=(t,u,d)=>{QA_SHOT='stood_up';const p=u/d;ctx.save();zoomAt(270,520,lerp(1,1.08,EZ.io(p)));clinicRoom(t,.6);
  const ppl=[[60,700,1.6],[160,690,1.5],[270,680,1.45],[380,690,1.5],[480,700,1.6],[110,860,2.1],[430,860,2.1]];ppl.forEach(([x,y,s],i)=>fig('sleeper',x,y,s,{eyes:'closed',tilt:(x<270?8:-8),arms:[{},{}],c:slpC(i+20),shadow:false}));ctx.restore();ctx.fillStyle='rgba(10,20,30,.25)';ctx.fillRect(0,0,W,H);vig(.55)};
// ============ 28. he was safe ... until you answered
SC.until_answer=(t,u,d)=>{QA_SHOT='until_answer';const cut=CU.lines.i5.s-.02;
  if(t<cut){clinic(t,{mode:'kneel',ollie:'asleepKneel'});ctx.save();ctx.globalCompositeOperation='saturation';ctx.fillStyle='#808080';ctx.globalAlpha=.6;ctx.fillRect(0,0,W,H);ctx.restore();ctx.fillStyle='rgba(255,220,170,.06)';ctx.fillRect(0,0,W,H);vig(.5);return}
  if(t<cut+3/30){walkieClose(t,{led:.25,press:1});ctx.fillStyle='rgba(201,56,47,.35)';ctx.fillRect(0,0,W,H);return}
  ctx.save();zoomAt(270,560,1.18);clinic(t,{mode:'stand',ollie:'awake',ollieEyes:'wide',ollieMouth:'o'});ctx.restore();vig(.55)};
// ============ 29. fifty-four hours: he is in your arms
SC.in_arms=(t,u,d)=>{QA_SHOT='in_arms';const p=u/d;
  // your chest (yellow hoodie) behind him, seen looking down
  vgr(0,H,'#2a2620','#14110c');ctx.fillStyle=shade(K.must,-.32);ctx.beginPath();ctx.ellipse(270,1060,420,620,0,0,7);ctx.fill();ctx.strokeStyle=OLc;ctx.lineWidth=5;ctx.stroke();ctx.strokeStyle=shade(K.must,-.3);ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(240,460);ctx.lineTo(236,620);ctx.moveTo(300,460);ctx.lineTo(304,620);ctx.stroke();
  const g=ctx.createRadialGradient(270,500,40,270,520,420);g.addColorStop(0,'rgba(255,200,130,.25)');g.addColorStop(1,'rgba(255,200,130,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  ctx.save();zoomAt(270,560,lerp(1.0,1.1,EZ.io(p)));
  // your arms come round his back from both sides; your hands are behind him (hidden)
  for(const sd of[-1,1])tube([[270+sd*330,520],[270+sd*170,640],[270+sd*60,700]],62,K.must,2.8);
  // Ollie against your chest, face tilted up at you, both fists holding your hoodie
  fig('ollie',270,1000,4.0,{eyes:'half',mouth:'smile',tilt:-6,brow:'worry',arms:[{to:[-26,-58],pole:[-34,-70],hand:'fist',thumbToward:[0,-140]},{to:[26,-58],pole:[34,-70],hand:'fist',thumbToward:[0,-140]}]});
  ctx.restore();
  // your own chest and belly (yellow hoodie) in the foreground hide his legs
  ctx.fillStyle=K.must;ctx.beginPath();ctx.ellipse(270,1110,560,370,0,0,7);ctx.fill();ctx.strokeStyle=OLc;ctx.lineWidth=5;ctx.stroke();orr(170,860,200,70,22,shade(K.must,-.1),2.6);vig(.45)};
// ============ 30. his eyes close; the third tap never comes
SC.eyes_closing=(t,u,d)=>{QA_SHOT='eyes_closing';const p=u/d;const W_=CU.W.j3;const k=pr(t,W_[1][1],W_[3][1]+.2);const eyes=k<.3?'half':k<.75?'heavy':'closed';
  vgr(0,H,'#2a2620','#14110c');ctx.fillStyle=K.must;ctx.fillRect(0,0,W,H);ctx.fillStyle='rgba(20,16,10,.35)';ctx.fillRect(0,0,W,H);
  ctx.save();zoomAt(270,380,lerp(1,1.06,EZ.io(p)));ctx.beginPath();ctx.rect(0,0,W,740);ctx.clip();figHead('ollie',270,380,6.2,{eyes,mouth:'smile',tilt:-5,arms:[{none:true},{none:true}]});ctx.restore();
  // below: the clasp; his thumb taps twice... and the third never comes (the thumb slides off)
  ctx.fillStyle='rgba(20,16,10,.55)';ctx.fillRect(0,740,W,220);let tk=0;for(const x of CU.lastTaps){const q=t-x;if(q>-.1&&q<.2)tk=Math.max(tk,q<0?(q+.1)/.1:1-q/.2)}
  const h=clasp(t,1,1,tk,{s:1.15,y:840});
  for(const x of CU.lastTaps){const q=t-x;if(q>0&&q<.8){ctx.strokeStyle=`rgba(255,200,140,${.7*(1-q/.8)})`;ctx.lineWidth=3;ctx.beginPath();ctx.arc(h.tx,h.ty,16+q*120,0,7);ctx.stroke()}}
  vig(.5)};
// ============ 31. and around him... they kneel (then the whole building)
function buildingKneel(t){vgr(0,H,'#0b1226','#1c2540');ctx.fillStyle='#232b40';ctx.fillRect(70,150,400,720);ctx.strokeStyle=OLc;ctx.lineWidth=3;ctx.strokeRect(70,150,400,720);
  for(let f=0;f<7;f++){const y=150+f*100;ctx.fillStyle='#2b3350';ctx.fillRect(74,y+92,392,8);for(let i=0;i<9;i++){const x=104+i*42+(f%2)*10;fig('sleeper',x,y+92,.34,{kneel:true,eyes:'closed',tilt:22,lean:12,shadow:false,o:1.2,c:slpC(f*9+i),arms:[{to:[-20,-46]},{to:[20,-46]}]})}}
  // basement: the cot under the warm lamp
  ctx.fillStyle='#120f0a';ctx.fillRect(70,870,400,90);const g=ctx.createRadialGradient(270,905,4,270,905,90);g.addColorStop(0,'rgba(255,200,130,.8)');g.addColorStop(1,'rgba(255,200,130,0)');ctx.fillStyle=g;ctx.fillRect(170,860,200,90);ctx.font='14px "Bebas Neue"';ctx.fillStyle='#ffd9a0';ctx.textAlign='center';ctx.fillText('B1',270,940)}
SC.kneel_all=(t,u,d)=>{QA_SHOT='kneel_all';const wide=CU.W.j4[3][1]-.1;if(t<wide){ctx.save();ctx.translate(0,-80);clinic(t,{mode:'kneel',ollie:'asleepLying',frontX:[30,105,435,510]});ctx.restore();vig(.5);return}buildingKneel(t);vig(.45)};
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
  card(312,t0[1],K.lime,'A','LET HIM SLEEP','SAFE FOREVER · NEVER YOURS AGAIN','#0A0D16',miniSleep);
  card(504,t0[2],K.red,'B','WAKE HIM','EVERY ONE OF THEM HUNTS HIM','#fff',miniWake);
  if(t>=t0[4]){ctx.globalAlpha=EZ.io(pr(t,t0[4],t0[4]+.3));ctx.font='600 13px "JetBrains Mono"';ctx.letterSpacing='1.5px';ctx.fillStyle=K.lime;ctx.textAlign='center';ctx.fillText('COMMENT A OR B · THE MOST VOTED CHOICE DECIDES',270,762);ctx.globalAlpha=1;ctx.letterSpacing='0px'}};
SC.cta=(t,u,d)=>{rect(0,0,W,H,'#000');const a=EZ.io(pr(t,CU.cta_t,CU.cta_t+8/30));ctx.globalAlpha=a;ctx.textAlign='center';ctx.font='96px "Bebas Neue"';ctx.letterSpacing='3px';ctx.fillStyle='#fff';ctx.fillText('FOLLOW FOR',270,470);ctx.fillStyle=K.lime;ctx.font='150px "Bebas Neue"';ctx.fillText('HOUR 55',270,590);ctx.globalAlpha=1;ctx.letterSpacing='0px';
  for(const k of[0,.5,1]){const q=(u-.6-k*.3);if(q>0&&q<.9){ctx.strokeStyle=`rgba(255,255,255,${.25*(1-q/.9)})`;ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(270,520,60+q*300,0,7);ctx.stroke()}}};
