// ============ EPISODE 2: scenes B (street, building, rules, door, time) ============
SC.street_empty=(t,u,d)=>{const p=u/d;let c=cam(p,{y0:-70,y1:50,z0:1.12,z1:1.04});c=shakeCam(c,t,.5,51);
  view(c,.2,()=>{SKY.dead();glow(380,420,260,'#ffb070',.35)});
  view(c,.45,()=>{skylineLayer({seed:3,base:430,minW:34,maxW:70,minH:110,maxH:230,col:'#2a3050',gap:2,roof:true});fog(t,300,160,'#c98d64',.16);smokeCol(t,120,430,300,50,'#23242f',.4,3)});
  view(c,1,()=>{ // street seen from above: converging road, parked cars, no people, faint ring on the asphalt
    const vx=270,vy=330;vgrad(330,1100,[[0,'#2f344a'],[1,'#0f131c']]);ctx.fillStyle='#232838';ctx.beginPath();ctx.moveTo(vx-14,vy);ctx.lineTo(vx+14,vy);ctx.lineTo(vx+360,1100);ctx.lineTo(vx-360,1100);ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=3;ctx.setLineDash([22,26]);ctx.beginPath();ctx.moveTo(vx,vy);ctx.lineTo(vx,1100);ctx.stroke();ctx.setLineDash([]);
    for(const sd of[-1,1]){ctx.fillStyle='#3a4258';ctx.beginPath();ctx.moveTo(vx+sd*16,vy);ctx.lineTo(vx+sd*54,vy);ctx.lineTo(vx+sd*470,1100);ctx.lineTo(vx+sd*330,1100);ctx.fill();
      for(let i=0;i<7;i++){const e=Math.pow((i+1)/7,1.8),y=vy+40+e*740,x=vx+sd*(lerp(80,330,e)),s=lerp(.28,1.5,e);carRear(x,y,s,['#4a5568','#7a3a3a','#3a5a66','#7a7a4a','#5a4a6a'][(i+(sd>0?2:0))%5],{driver:null,hazard:false,t});lampPost(vx+sd*lerp(60,420,e),vy+30+e*700,lerp(40,190,e),{on:false})}}
    // the ring from last episode, now empty
    ctx.strokeStyle='rgba(230,247,255,.22)';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(270,690,230,64,0,0,7);ctx.stroke();glow(270,690,260,'#6fb8ff',.08);
    // litter drifting
    const r=mul(9);for(let i=0;i<10;i++){const x=((r()*700+t*(20+r()*30))%700)-80,y=520+r()*420;ctx.save();ctx.translate(x,y+Math.sin(t*3+i)*6);ctx.rotate(t*2+i);ctx.fillStyle='rgba(230,230,220,.6)';ctx.fillRect(-5,-3,10,6);ctx.restore()}
    // flickering signal
    const on=Math.sin(t*5)>0;glow(430,470,30,on?'#ff3b30':'#3a1010',.8);circ(430,470,4,on?'#ff3b30':'#3a1010')
  });
  view(c,1.2,()=>{blk(-40,860,200,160,10,'#2a3044',{hi:.15});blk(420,880,200,160,10,'#2a3044',{hi:.15})});fog(t,500,240,'#c98d64',.08)};
// ---------- the building, already full of Sleepers
SC.building_full=(t,u,d)=>{const p=u/d;const c=cam(p,{z0:1.28,z1:1.2,y0:300,y1:-230});vgrad(0,H,[[0,'#08162b'],[1,'#10243f']]);
  view(c,.3,()=>{vgrad(-500,1000,[[0,'#04091a'],[1,'#16314f']]);stars(t,80,2,-480,300)});
  view(c,1,()=>{const bx=70,bw=400,fh=130,top=130;blk(bx-8,top-4,bw+16,fh*5+90,2,'#070d1a');
    // roof with the survivors' tiny camp + hatch glow
    blk(bx-10,top-14,bw+20,16,4,'#0a1220');glow(270,top-30,150,C.amb,.35);blk(60+bx,top-34,50,22,4,'#2a3350');for(const [x,col] of [[190,C.must],[212,'#14b8a6'],[236,'#a855f7'],[258,'#5b6b3c'],[282,'#cc3b3b']]){blk(x,top-30,13,18,3,col)}
    for(let f=0;f<5;f++){const y=top+f*fh;blk(bx,y,bw,fh-6,2,'#1a2236',{hi:.05,lo:-.1});ctx.fillStyle='rgba(0,0,0,.18)';for(let i=0;i<bw;i+=26)ctx.fillRect(bx+i,y,10,fh-14);rect(bx,y+fh-16,bw,6,'#2a3350');
      // sleepers fill each floor from the bottom up (stepped appearance, never seen walking)
      const fl=4-f;const step=Math.floor(u*30/3);const n=7;for(let i=0;i<n;i++){const ord=fl*3+i*.4;if(step<ord)continue;const x=bx+40+i*(bw-80)/(n-1)+((f%2)*14),s=.72+((i*7+f)%3)*.04;sleeperAt(x,y+fh-18,s,((i+f*2)%6)+1,'stand','closed');if(step-ord<2){glow(x,y+fh-70,40,'#E6F7FF',.3)}}
      for(let k=0;k<2;k++){const ph=(t*1.4+k*.5+f*.2)%1;ctx.strokeStyle=`rgba(230,247,255,${.25*(1-ph)})`;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(270,y+fh*.6,60+ph*190,24+ph*40,0,0,7);ctx.stroke()}
      // staircase hint on the right
      ctx.strokeStyle='#4a5a7a';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(bx+bw-70,y+fh-14);ctx.lineTo(bx+bw-10,y+14);ctx.stroke()}
    blk(bx,top+fh*5,bw,80,2,'#0a1220');
  })};
// ---------- rules (roof camp): each rule gets its own picture
SC.rule1=(t,u,d)=>{const p=u/d;let c=cam(p,{z0:1.02,z1:1.12,x0:0,x1:-8});c=shakeCam(c,t,.5,52);roofWorld(t,c,{lamp:true});view(c,1,()=>{survivors(t,{sleep:.9})});
  // one of them snaps awake (a hard shake of the head = the rule)
  if(p>.55&&p<.7){ctx.fillStyle='rgba(255,255,255,.06)';ctx.fillRect(0,0,W,H)}};
SC.rule2=(t,u,d)=>{const p=u/d;let c=cam(p,{z0:1.1,z1:1.2,x0:20,x1:-30,y0:-20,y1:-30});c=shakeCam(c,t,.4,53);roofWorld(t,c,{lamp:true});view(c,1,()=>{survivors(t,{mayaShh:p>.1,static:p<.45,knob:pr(p,.2,.5),ollieEyes:'closed'})});
  // static pops from the radio then dies as the knob is turned down
  const st=1-pr(p,.2,.5);if(st>0){ctx.save();ctx.globalCompositeOperation='lighter';for(let i=0;i<3;i++){const ph=(t*2+i/3)%1;ctx.strokeStyle=`rgba(255,255,255,${.3*st*(1-ph)})`;ctx.lineWidth=2;ctx.beginPath();ctx.arc(392+0,780,20+ph*100,Math.PI*1.1,Math.PI*1.9);ctx.stroke()}ctx.restore()}};
function doorCU(t,u,d,o){const p=u/d;const hum=o.hum??1;let c=cam(p,{z0:1.05,z1:1.2});c=shakeCam(c,t,o.shake??1.6*hum,54);vgrad(0,H,[[0,'#0a1020'],[1,'#10192d']]);
  view(c,1,()=>{const bump=o.bump?Math.sin(t*38)*o.bump:0;const dx=Math.sin(t*50)*1.2*hum;
    // concrete wall + steel door
    blk(40,120,460,760,10,'#1d2840',{hi:.08});ctx.fillStyle='rgba(0,0,0,.12)';for(let i=0;i<9;i++)ctx.fillRect(40,150+i*80,460,2);
    ctx.save();ctx.translate(dx,0);blk(120,200,300,680,8,'#3b4560',{hi:.16});ctx.fillStyle='#2e384e';rr(146,240,248,230,8);ctx.fill();rr(146,500,248,330,8);ctx.fill();blk(150,244,240,226,6,'#323c54');ctx.fillStyle='#0a1222';rr(206,262,128,64,8);ctx.fill();glow(270,294,100,'#E6F7FF',.35*hum);blk(360,520,28,14,4,'#c9ccd6');blk(354,556,40,20,6,'#8f94a4');
    for(const y of[330,560,770])blk(116,y,16,34,4,'#6a7388');
    if(o.dent)for(const [x,y,r] of o.dent){const q=clamp(o.dentK||1);ctx.fillStyle=`rgba(0,0,0,${.25*q})`;ctx.beginPath();ctx.ellipse(x,y,r*q,r*.8*q,0,0,7);ctx.fill();ctx.strokeStyle=`rgba(10,14,24,${.8*q})`;ctx.lineWidth=3;for(let i=0;i<6;i++){const a=i/6*6.283+x;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a)*r*1.5*q,y+Math.sin(a)*r*1.2*q);ctx.stroke()}}
    ctx.restore();
    // light leaking under the door + dust shaking loose
    ctx.fillStyle=`rgba(207,227,255,${.4+.3*Math.sin(t*40)*hum})`;ctx.fillRect(130,872,280,5);glow(270,880,160,'#cfe3ff',.25*hum);
    for(let i=0;i<5;i++){const ph=(t*1.1*hum+i/5)%1;ctx.strokeStyle=`rgba(230,247,255,${.65*(1-ph)*hum})`;ctx.lineWidth=3+hum*1.5;ctx.beginPath();ctx.ellipse(270,520,90+ph*320,150+ph*430,0,0,7);ctx.stroke()}
    dust(t*(1+hum),90,200,360,700,34,55,'#d8e6ff',.45,1.5)})}
SC.rule3=(t,u,d)=>doorCU(t,u,d,{hum:.7+u/d*.5});
SC.run_beat=(t,u,d)=>{const p=u/d;let c=cam(p,{z0:1.1,z1:1.22,x0:0,x1:-16});c=shakeCam(c,t,2,56);roofWorld(t,c,{hum:1,lamp:true});view(c,1,()=>{survivors(t,{alert:1,ollieEyes:'wide',ollieMouth:'gasp'});})};
// ---------- nowhere left to run: pull back to see the island
SC.nowhere=(t,u,d)=>{const p=u/d;const z=lerp(1.9,1.0,EZ.io(p));vgrad(0,H,[[0,'#0a1020'],[1,'#141c2e']]);
  ctx.save();ctx.translate(270,470);ctx.scale(z,z);ctx.translate(-270,-470);
  const cx=270,cy=470;const r=mul(21);const list=[];for(let ring=0;ring<6;ring++){const n=[30,44,58,74,92,110][ring],rx=[170,225,280,340,410,490][ring],ry=[150,198,248,300,360,430][ring];for(let i=0;i<n;i++){const a=i/n*6.283+ring*.37;list.push({x:cx+Math.cos(a)*rx,y:cy+Math.sin(a)*ry*.92,s:.5+ring*.07,seed:ring*100+i})}}
  list.sort((a,b)=>a.y-b.y);for(const q of list)faceUp(q.x,q.y,q.s,q.seed,t);
  // our roof as a small island
  blk(cx-120,cy-96,240,192,8,'#252d44',{hi:.15});rect(cx-120,cy-96,240,6,'#3a4460');blk(cx-110,cy-86,90,56,4,'#1a2236');blk(cx+60,cy-80,40,40,20,'#2e3650');
  for(const [x,y,col] of [[cx-24,cy+10,'#5b6b3c'],[cx+8,cy+24,'#14b8a6'],[cx+44,cy+6,'#a855f7'],[cx-4,cy+54,C.must]]){blk(x-7,y-16,14,26,5,col);circ(x,y-22,6,'#e0b48c')}blk(cx-12,cy+38,12,12,5,'#cc3b3b');glow(cx,cy+30,90,C.amb,.4);
  // neighbouring roof: too far away
  blk(cx+190,cy-30,150,110,4,'#1a2236');ctx.setLineDash([6,8]);ctx.strokeStyle='rgba(255,255,255,.3)';ctx.lineWidth=2;ctx.strokeRect(cx+120,cy-96,70,192);ctx.setLineDash([]);
  ctx.restore();dust(t,0,100,W,700,16,13,'#9fb4d8',.18,.5)};
// ---------- ten hours: time-lapse on the roof
SC.timelapse=(t,u,d)=>{const p=u/d;const tod=EZ.io(p)*.78;const c={x:0,y:0,z:1.06,rot:0};roofWorld(t+p*6,c,{tod,lamp:p<.6});
  view(c,1,()=>{survivors(t,{sleep:1,ollieEyes:'closed'})});
  // sweeping light/shadow band + speed streaks
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=`rgba(255,220,170,${.05*Math.sin(p*Math.PI)})`;ctx.fillRect(0,0,W,H);ctx.restore()};
SC.door_hum=(t,u,d)=>doorCU(t,u,d,{hum:1,bump:0});
// ---------- Ollie fighting sleep in your arms
SC.ollie_arms=(t,u,d)=>{const p=u/d;let c=cam(p,{z0:1,z1:1.12,y0:0,y1:-14});c=shakeCam(c,t,.5,57);vgrad(0,H,[[0,'#0b1428'],[1,'#080d18']]);glow(270,420,360,C.amb,.25);
  view(c,1,()=>{
    const ph=p*3.2;const st=Math.sin(ph*Math.PI*2);const eyes=st>.55?'closed':st>-.1?'half':'open';const nod=Math.max(0,st)*14;
    // body: red sweater, dino hugged
    blk(120,640,300,380,70,'#cc3b3b',{hi:.15});
    bigHead(Object.assign({},OLLIE,{eyes:p>.62&&p<.7?'wide':eyes,mouth:Math.sin(ph*Math.PI*2+1)>.8?'o':null}),270,450,9.2,{tilt:nod*.6-3});
    const shO=[[270-19*9.2*.62+0,700],[270+19*9.2*.62,700]];ctx.save();ctx.translate(270,860);blk(-120,-40,240,100,44,'#3fa34d',{hi:.3});blk(60,-110,100,84,36,'#3fa34d',{hi:.3});circ(140,-82,8,'#fff');circ(142,-80,4,'#111');ctx.restore();
    armIK([shO[0][0]-10,720],[190,860],{auto:.58,out:-1,down:true,w0:70,w1:36,col:'#cc3b3b'});armIK([shO[1][0]+10,720],[350,860],{auto:.58,out:1,down:true,w0:70,w1:36,col:'#cc3b3b'});
    // your two arms around him from behind
    armIK([-30,1020],[150,830],{auto:.62,out:-1,down:true,w0:96,w1:50,col:C.must});armIK([570,1020],[390,830],{auto:.62,out:1,down:true,w0:96,w1:50,col:C.must})});
  dust(t,60,300,420,500,24,58,'#ffe6b8',.4,.4)};
