// ============ EPISODE 3 — shots 2-7: the old roof, the plank, the crossing ============
// the roof we left, seen from the plank. z = zoom about (zx,zy)
function oldRoof(t,o={}){const dO=o.door||0,hum=o.hum||0,z=o.z||1;
  daySky(0,H);view({x:0,y:0,z:1},.2,()=>{});
  ctx.save();ctx.translate(o.zx??270,o.zy??560);ctx.scale(z,z);ctx.translate(-(o.zx??270),-(o.zy??560));
  skylineLayer({seed:3,base:430,minW:40,maxW:84,minH:120,maxH:260,col:'#4a4f6e',gap:2,roof:true,t});fog(t,320,150,'#c9b7ae',.14);
  // the old building: roof slab and a facade dropping into the gap
  facadeDown(-40,640,620,560,'#323a54',6);
  blk(-40,596,620,48,3,'#59607a',{hi:.2});rect(-40,590,620,8,'#7a8199');
  // stair-door shed on the left (blocks stacked at its foot)
  blk(24,420,190,176,5,'#454d68',{hi:.14});rect(18,412,202,12,'#5a627e');
  ctx.fillStyle='#10192d';ctx.fillRect(64,456,100,140);
  if(dO>0){ctx.fillStyle='#04070e';ctx.fillRect(64,456,100,140);glow(114,520,170,'#cfe3ff',.5*dO);}
  const sw=Math.max(6,100*(1-dO*.93));ctx.fillStyle='#3a4258';ctx.beginPath();ctx.moveTo(64,456);ctx.lineTo(64+sw,456-dO*10);ctx.lineTo(64+sw,596+dO*10);ctx.lineTo(64,596);ctx.fill();
  if(dO<.02){ctx.save();ctx.translate((o.shk||0),0);blk(64,456,100,140,3,'#3a4258',{hi:.18});ctx.fillStyle='#0a1222';ctx.fillRect(98,474,32,28);glow(114,488,44,'#E6F7FF',.25+.5*hum);blk(144,528,8,12,2,'#c9ccd6');ctx.restore()}
  if(hum>0&&dO<.02){for(let i=0;i<4;i++){const ph=(t*1.2+i/4)%1;ctx.strokeStyle=`rgba(230,247,255,${.5*(1-ph)*hum})`;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(114,530,40+ph*160,60+ph*210,0,0,7);ctx.stroke()}}
  if(!o.noBlocks){const sl=o.blockSlide||0;for(const [k,x,y] of[[0,182,572],[1,214,572],[2,198,550]]){cb(x+sl*(70+k*30),y+(sl>0?sl*sl*26*(k+1):0),32,18,sl*(k-1)*.6)}}
  // water tank + antenna
  rect(300,470,6,120,'#3a4058');rect(396,470,6,120,'#3a4058');blk(284,360,136,112,16,'#454d68',{hi:.2});ctx.fillStyle='rgba(0,0,0,.2)';for(let i=1;i<4;i++)ctx.fillRect(284,360+i*28,136,2);
  rect(450,300,5,290,'#3a4058');if(Math.floor(t*.9)%2)glow(452,298,22,'#ff3b30',.8);circ(452,298,3,'#ff3b30');
  // fire escape at the right edge: top rail + the red beanie, nothing in front of it
  const fx=478;ctx.strokeStyle='#1a2030';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(fx-30,540);ctx.lineTo(fx+80,540);ctx.stroke();ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(fx-30,568);ctx.lineTo(fx+80,568);ctx.stroke();for(let x=fx-30;x<=fx+80;x+=27){ctx.beginPath();ctx.moveTo(x,540);ctx.lineTo(x,592);ctx.stroke()}
  if(o.beanie!==false){ctx.save();ctx.translate(fx+30,542);ctx.rotate(Math.sin(t*2.1)*.07);ctx.fillStyle='#8f2323';rr(-14,-4,28,9,3);ctx.fill();ctx.fillStyle=C.red;ctx.beginPath();ctx.moveTo(-13,5);ctx.quadraticCurveTo(-15,34,0,38);ctx.quadraticCurveTo(15,34,13,5);ctx.fill();circ(0,42,5.5,'#ff8a8a');ctx.restore()}
  ctx.restore()}
function lineSleepers(t,back,upto=99,fadeIn=0){const xs=[50,114,178,242,306,370,434];for(let i=0;i<xs.length;i++){sleeper(xs[i],600,1.12,i+3,t,{sway:.4,back:back,tilt:back?16:0,eyes:'closed'})}}
// plank from the near foreground (bottom) back to the old roof
function plankBack(t,sway=0){ctx.save();ctx.translate(270,960);ctx.rotate(sway);ctx.translate(-270,-960);plankPersp(150,390,980,230,310,642);ctx.restore()}

// 2. looking back at what you left
SC.look_back=(t,u,d)=>{const p=u/d;const c=cam(p,{z0:1.0,z1:1.07,y0:0,y1:-8});const sway=Math.sin(t*1.4)*.006;
  ctx.save();ctx.translate(270,560);ctx.scale(c.z,c.z);ctx.translate(-270,-560+c.y);oldRoof(t,{hum:.15});plankBack(t,sway);ctx.restore();
  windLines(t,6,5,.1);
  const a=CU.stampT;function stamp(txt,t0,y,col,sz){const q=t-t0;if(q<0)return;const k=EZ.ob(clamp(q/.18));ctx.save();ctx.translate(270,y);ctx.scale(k*(1+.04*Math.max(0,1-q*6)),k);ctx.rotate(-.025);ctx.font=`${sz}px "Bebas Neue"`;ctx.letterSpacing='3px';ctx.textAlign='center';ctx.shadowColor='rgba(0,0,0,.6)';ctx.shadowBlur=14;ctx.shadowOffsetY=4;ctx.fillStyle=col;ctx.fillText(txt,0,0);ctx.restore()}
  stamp('MOST OF YOU CHOSE A.',a[0]+.0,330,'#F4F4EF',66);stamp('YOU LEFT HIM.',CU.stampT[1]-.05,420,C.red,88);
  const v=ctx.createRadialGradient(270,500,220,270,500,660);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.4)');ctx.fillStyle=v;ctx.fillRect(0,0,W,H)};
// 3. your hand and knee inching forward (first person, looking down at the plank)
SC.hand_close=(t,u,d)=>{const p=u/d;const sway=Math.sin(t*1.6)*.01;
  vgrad(0,H,[[0,'#232a3c'],[1,'#0b0f19']]);streetTop(t,-60,-40,660,1100,60,17,{fs:.3,cs:16});const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'rgba(8,11,20,.55)');g.addColorStop(1,'rgba(8,11,20,.75)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  ctx.save();ctx.translate(270,520);ctx.rotate(sway);ctx.translate(-270,-520);
  plankPersp(110,430,1100,150,390,-100);
  // palm settling flat, soundlessly: slow ease-in with a tiny hover
  const place=EZ.io(pr(p,.12,.78));const hx=300,hy=lerp(520,640,place);const lift=1-place;const shd=.5*(1-lift*.6);
  ctx.fillStyle=`rgba(0,0,0,${shd*.5})`;ctx.beginPath();ctx.ellipse(hx+10,640+8,66*(1+lift*.5),30*(1+lift*.5),0,0,7);ctx.fill();
  // your knee (left) already planted lower in frame, one pair of limbs total
  blk(120,830,118,150,40,'#2e3546',{hi:.16});blk(130,880,98,80,34,'#3a4258',{hi:.15});
  ctx.restore();
  const tr=hand(t*3,.5,8);armIK([560,1130],[hx+tr.x,hy+tr.y+20],{auto:.56,out:1,down:true,w0:100,w1:62,col:C.must,noHand:true});
  ctx.save();ctx.translate(hx+tr.x,hy+tr.y);ctx.rotate(.1);openHand(0,10,1,1.65);ctx.restore();
  // the other hand, braced and trembling slightly on the plank edge (still, holding)
  gripHand(122+Math.sin(t*9)*.6,700,-1,1.4,0);armIK([-30,1130],[122,724],{auto:.56,out:-1,down:true,w0:100,w1:62,col:C.must,noHand:true});
  if(place>.95&&place<1){} 
  const bp=Math.sin(t*1.1)*.5+.5;ctx.fillStyle=`rgba(230,247,255,${.05+.05*bp})`;ctx.fillRect(0,0,W,H);
  const v=ctx.createRadialGradient(270,560,200,270,560,640);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.5)');ctx.fillStyle=v;ctx.fillRect(0,0,W,H)};
// 4. the plank creaks: macro side-on
SC.creak=(t,u,d)=>{const p=u/d;const t0=CU.crackT-.1;const a=Math.max(0,t-t0);const grow=EZ.o3(clamp(a/.9));const bow=EZ.io(pr(p,.0,.5))*26+grow*18+Math.sin(t*6)*Math.min(1,a)*1.2;
  vgrad(0,H,[[0,'#2b3350'],[1,'#0a0e18']]);ctx.save();ctx.filter='blur(7px)';facadeDown(-60,100,400,900,'#2a3350',7);streetTop(t,0,760,560,300,70,5,{fs:.4});ctx.restore();ctx.fillStyle='rgba(6,9,16,.45)';ctx.fillRect(0,0,W,H);
  const x0=-40,x1=580,y0=520;
  // support ledge at both ends
  blk(-80,y0+4,70,160,4,'#4a5068',{hi:.15});blk(550,y0+4,70,160,4,'#4a5068',{hi:.15});
  // bowed plank (thick board, side view)
  const top=(x)=>y0+bow*Math.sin(Math.PI*(x-x0)/(x1-x0));const th=46;
  ctx.fillStyle='#5a4023';ctx.beginPath();for(let x=x0;x<=x1;x+=10)ctx.lineTo(x,top(x)+th);for(let x=x1;x>=x0;x-=10)ctx.lineTo(x,top(x));ctx.closePath();ctx.fill();
  ctx.fillStyle='#8f6d3e';ctx.beginPath();for(let x=x0;x<=x1;x+=10)ctx.lineTo(x,top(x)+th*.82);for(let x=x1;x>=x0;x-=10)ctx.lineTo(x,top(x));ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(50,30,12,.4)';ctx.lineWidth=2;for(let i=1;i<5;i++){ctx.beginPath();for(let x=x0;x<=x1;x+=10){const y=top(x)+th*.18*i;x===x0?ctx.moveTo(x,y):ctx.lineTo(x,y)}ctx.stroke()}
  // weight (your hand + knee pressing from above) at the middle
  const mx=290;const ty=top(mx);ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(mx,ty-2,80,8,0,0,7);ctx.fill();blk(mx-150,ty-46,110,50,22,'#2e3546',{hi:.16});blk(mx-132,ty-62,80,34,16,'#3a4258',{hi:.14});limbT([mx+110,ty-170],[mx+12,ty-30],62,44,C.must);blk(mx-30,ty-34,84,36,15,'#e0b48c',{hi:.2});for(let i=0;i<4;i++)blk(mx-34+i*21,ty-12,17,16,7,'#e7bd97',{hi:.2});
  // the crack: grows along the underside from the middle
  if(a>0){const n=Math.floor(grow*26);ctx.strokeStyle='#150d05';ctx.lineWidth=3.5;ctx.beginPath();let cx=mx,cy=top(mx)+th;ctx.moveTo(cx,cy);const r=mul(4);for(let i=0;i<n;i++){cx+=(r()-.3)*14*(i%2?1:-1);cy-=th/26*1.0;ctx.lineTo(cx,cy)}ctx.stroke();
    ctx.strokeStyle='rgba(255,230,190,.7)';ctx.lineWidth=1;ctx.stroke();
    // splinters + dust falling into the dark
    for(let i=0;i<22;i++){const r2=mul(i*5+1);const t1=t0+.1+i*.045;const q=t-t1;if(q<0||q>1.2)continue;const sx=mx+(r2()-.5)*90,sy=top(sx)+th+q*q*240+q*30;ctx.save();ctx.translate(sx+Math.sin(q*6+i)*6,sy);ctx.rotate(q*5+i);ctx.fillStyle=`rgba(190,150,96,${1-q/1.2})`;ctx.fillRect(-2,-7,4,14*(.5+r2()));ctx.restore()}
    // creak rings
    for(let i=0;i<3;i++){const ph=((a*1.4)+i/3)%1;ctx.strokeStyle=`rgba(255,235,200,${.4*(1-ph)*Math.min(1,a*3)})`;ctx.lineWidth=2.4;ctx.beginPath();ctx.ellipse(mx,top(mx)+th*.6,30+ph*180,12+ph*60,0,0,7);ctx.stroke()}}
  dust(t,0,200,W,700,16,19,'#ffe9c8',.2,.6);const v=ctx.createRadialGradient(270,520,200,270,520,640);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.5)');ctx.fillStyle=v;ctx.fillRect(0,0,W,H)};
// 5. rule three: hum, the door bursts on "run"
SC.door_burst=(t,u,d)=>{const p=u/d;const b=CU.burstT;const a=t-b;const humK=EZ.io(pr(t,CU.lines.c3.s+.8,b));
  const shk=a<0?Math.sin(t*70)*(1+humK*3)*humK:0;const dO=a<0?0:EZ.o3(clamp(a/.12));
  let z=lerp(1.25,1.45,EZ.io(p));ctx.save();ctx.translate(114,520);const k=a<0?0:Math.exp(-a*5);ctx.rotate(0);ctx.translate(-114,-520);
  const cc=shakeCam({x:0,y:0},t,.3+humK*1.2+(a>0&&a<.5?4*(1-a/.5):0),81);ctx.translate(cc.x*2,cc.y*2);
  oldRoof(t,{z:z,zx:150,zy:520,hum:humK,door:dO,shk:shk,blockSlide:a<0?Math.max(0,(humK-.55)*.6):Math.min(1,.35+a*1.4),beanie:true});
  if(a>0){ // light burst + the doorway full of faces (eyes only, they have not moved)
    glow(114,520,260,'#e6f2ff',.6*Math.max(0,1-a/.5));const r=mul(19);if(a>.06)for(let i=0;i<7;i++){const ex=70+(i%4)*24+(i>3?12:0),ey=490+Math.floor(i/4)*44;const q=clamp((a-.08)/.15);ctx.globalAlpha=q;ctx.fillStyle='#E6F7FF';rr(ex-8,ey-3,5,7,1.4);ctx.fill();rr(ex+3,ey-3,5,7,1.4);ctx.fill();glow(ex,ey,14,'#E6F7FF',.5);ctx.globalAlpha=1}}
  ctx.restore();plankBack(t,Math.sin(t*20)*.004*humK);
  ctx.fillStyle='rgba(255,255,255,.18)';if(a>0&&a<.07)ctx.fillRect(0,0,W,H);windLines(t,4,8,.08)};
// ---- the plank crossing in side elevation (shared geometry)
function gapScene(t,o={}){daySky(0,640);ctx.save();ctx.translate(0,0);skylineLayer({seed:12,base:620,minW:40,maxW:84,minH:140,maxH:300,col:'#4a4f6e',gap:2,roof:true,t});fog(t,420,150,'#c9b7ae',.14);ctx.restore();
  const g=ctx.createLinearGradient(0,640,0,1100);g.addColorStop(0,'#1d2438');g.addColorStop(1,'#03050a');ctx.fillStyle=g;ctx.fillRect(-100,640,W+200,500);
  const r=mul(13);for(let i=0;i<50;i++){const x=170+r()*210,y=860+r()*160;glow(x,y,5,'#E6F7FF',.4);ctx.fillStyle='#E6F7FF';ctx.fillRect(x-1.2,y-1,2.4,2)}
  blk(-80,640,230,420,3,'#4a5068',{hi:.15});rect(-80,636,230,8,'#6a7088');blk(390,640,260,420,3,'#4a5068',{hi:.15});rect(390,636,260,8,'#6a7088');
  // left: the burst stair door, light spilling out, eyes in the dark
  blk(-10,500,120,140,4,'#3a4258');ctx.fillStyle='#04070e';ctx.fillRect(10,520,74,120);glow(46,580,120,'#cfe3ff',.35);
  if(o.doorFaces){const r2=mul(7);for(let i=0;i<8;i++){const ex=22+(i%4)*17,ey=548+Math.floor(i/4)*34;ctx.fillStyle='#E6F7FF';rr(ex-5,ey-2,3.5,5,1);ctx.fill();rr(ex+2,ey-2,3.5,5,1);ctx.fill();glow(ex,ey,9,'#E6F7FF',.5)}}
  // right: exit door
  blk(480,540,70,100,3,'#3a4258');ctx.fillStyle='#10192d';ctx.fillRect(490,552,50,88);glow(515,596,50,'#3ddc84',.35);ctx.fillStyle='#3ddc84';ctx.font='600 10px "JetBrains Mono"';ctx.textAlign='center';ctx.fillText('EXIT',515,534)}
// crawling figure in profile (facing right, on all fours on the plank)
function crawler(x,y,t,sp=1){const c=(t*.9*sp)%1;const ph=Math.sin(c*Math.PI*2);const fig={x:x,y:y,s:1.35,dir:1,top:C.must,hood:true,hair:'#3a2a1a',shadow:0,eyes:'wide',pose:{lean:72,hip:20,tilt:-30,aF:72+ph*6,eF:-4,aB:72-ph*6,eB:-4,hF:2,kF:-86,hB:2,kB:-86}};sideFig(fig)}
SC.side_elev=(t,u,d)=>{const p=u/d;let c=cam(p,{z0:1.0,z1:1.1,x0:0,x1:20,y0:0,y1:-16});c=shakeCam(c,t,.5,82);
  ctx.save();ctx.translate(270,640);ctx.scale(c.z,c.z);ctx.translate(-270-c.x,-640-c.y);
  gapScene(t,{doorFaces:p>.18});
  plankDraw(60,628,420,628,16);limbT([60,623],[420,623],3,3,'rgba(255,255,255,.2)');
  crawler(lerp(190,300,EZ.io(p)),624,t);
  sideFig({x:452,y:640,s:1.5,dir:-1,top:REY.top,beard:REY.beard,skin:REY.skin,hair:REY.hair,brow:1,eyes:blinkE(t,3),shadow:.4,pose:{lean:14,aF:62,eF:6,aB:50,eB:14,hF:10,kF:6,hB:-18,kB:20}});
  ctx.restore()};
// 7a. Reyes drags you across (first person, your forearm in his grip)
SC.drag=(t,u,d)=>{const p=u/d;const pulls=[0,.45,.9].map(x=>CU.lines.d1.s+1.0+x);let jerk=0;for(const q of pulls){const a=t-q;if(a>0&&a<.4)jerk=Math.max(jerk,Math.sin(a/.4*Math.PI))}
  const cc=shakeCam({x:0,y:0},t,.7+jerk*1.2,83);ctx.save();ctx.translate(cc.x*2,cc.y*2+jerk*10);
  daySky(0,H);skylineLayer({seed:12,base:520,minW:40,maxW:84,minH:120,maxH:260,col:'#4a4f6e',gap:2,roof:true,t});fog(t,380,150,'#c9b7ae',.12);
  // right roof surface and edge, EXIT door behind Reyes
  blk(-60,560,W+120,500,3,'#59607a',{hi:.18});rect(-60,556,W+120,8,'#7a8199');blk(380,380,90,180,3,'#3a4258');ctx.fillStyle='#10192d';ctx.fillRect(392,394,66,166);glow(425,470,70,'#3ddc84',.35);
  // the plank sliding toward the camera as you are hauled
  const slide=(t*160)%60;plankPersp(160,380,1100,230,310,560);ctx.fillStyle='rgba(255,255,255,.06)';for(let i=0;i<5;i++)ctx.fillRect(170,700+i*90+slide,200,3);
  // Reyes (front view, braced on his knees), both hands clamped on your forearm, leaning back
  const lean=-8-jerk*6;const R=Object.assign({x:276,y:690,s:2.7,kneel:true,noArms:true,eyes:'half',mouth:'o',shadow:0,pose:{lean:lean,tilt:-4,bob:jerk*5}},REY);person(R);const sh=shoulderPts(R,R.pose);
  // your forearm comes up from the bottom edge, hand open, his hands wrapped around the wrist
  const wr=[262,672+jerk*14];armIK([250,1150],[wr[0]-4,wr[1]+36],{auto:.56,out:1,down:true,w0:96,w1:66,col:C.must,noHand:true});openHand(wr[0],wr[1]+34,-1,1.3);
  armIK(sh[0],[wr[0]-16,wr[1]-2],{auto:.6,out:-1,down:true,w0:44,w1:24,col:REY.top,skin:REY.skin});armIK(sh[1],[wr[0]+22,wr[1]+10],{auto:.6,out:1,down:true,w0:46,w1:24,col:REY.top,skin:REY.skin});
  // strain lines
  ctx.strokeStyle='rgba(255,255,255,.5)';ctx.lineWidth=2.4;for(let i=0;i<3;i++){const a=t*3+i;ctx.beginPath();ctx.moveTo(190+i*8,610+Math.sin(a)*3);ctx.lineTo(176+i*8,590)}ctx.stroke();
  ctx.restore();windLines(t,5,12,.1);const v=ctx.createRadialGradient(270,520,200,270,520,640);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.45)');ctx.fillStyle=v;ctx.fillRect(0,0,W,H)};
// 7b. the kick: plank spins away into the dark. rep=true replays in slow motion, close on Reyes' calm face
function kickScene(t,u,d,o={}){const p=u/d;const kt=o.kt,k=o.k||1;const a0=(t-kt)*k;const a=Math.max(0,a0);
  let z=o.z||1;if(o.push)z=lerp(o.z0,o.z1,EZ.io(p));
  ctx.save();ctx.translate(o.fx||330,o.fy||600);ctx.scale(z,z);ctx.translate(-(o.fx||330),-(o.fy||600));
  gapScene(t,{});
  // you, collapsed on the right roof behind Reyes (profile, facing left, one pair of arms)
  sideFig({x:520,y:640,s:1.2,dir:-1,top:C.must,hood:true,hair:'#3a2a1a',eyes:'wide',shadow:.35,pose:{lean:48,hip:10,tilt:12,aF:48,eF:-8,aB:30,eB:-6,hF:30,kF:-66,hB:6,kB:-20}});
  // plank
  const sl=EZ.o3(clamp(a/.22));let cx=240-sl*10,cy=628,ang=0,al=1;if(a>0){const q=Math.max(0,a-.18);cx=240-sl*10-q*50;cy=628+q*q*620;ang=-q*3.1;al=1-clamp((a-.7)/.5)}
  ctx.save();ctx.globalAlpha=al;ctx.translate(cx,cy);ctx.rotate(ang);plankDraw(-180,0,180,0,16);limbT([-180,-5],[180,-5],3,3,'rgba(255,255,255,.2)');ctx.restore();
  // Reyes' kicking leg: anticipation, then a hard swing
  const ant=EZ.io(pr(a0,-.5,-.02));const sw=a0<0?-14*ant:EZ.o3(clamp(a0/.12))*86*(1-EZ.io(clamp((a0-.25)/.3))*.9)-14*(1-clamp(a0/.12));
  sideFig({x:410,y:640,s:1.7,dir:-1,top:REY.top,beard:REY.beard,skin:REY.skin,hair:REY.hair,brow:1,eyes:o.calm?'half':'wide',shadow:.4,pose:{lean:8+ant*4,aF:20,eF:8,aB:-14,eB:20,hF:sw,kF:Math.max(0,sw)*.15+4,hB:-4,kB:10}});
  if(a>.02&&a<.5){ctx.strokeStyle=`rgba(255,255,255,${.7*(1-a/.5)})`;ctx.lineWidth=3;ctx.beginPath();ctx.arc(344,628,34+a*80,-.6,.6);ctx.stroke()}
  if(a>.4){for(let i=0;i<10;i++){const r=mul(i+4);const q=a-.4;ctx.fillStyle=`rgba(210,170,110,${Math.max(0,1-q/.9)})`;ctx.fillRect(cx+(r()-.5)*120,cy-q*40+(r()-.5)*20+q*q*140,4,9)}}
  ctx.restore()}
SC.kick=(t,u,d)=>{const cc=shakeCam({x:0,y:0},t,.5,84);ctx.save();ctx.translate(cc.x*2,cc.y*2);kickScene(t,u,d,{kt:CU.kickT,k:1,z:1.0});ctx.restore();const a=t-CU.kickT;if(a>0&&a<.1){ctx.fillStyle=`rgba(255,255,255,${.2*(1-a/.1)})`;ctx.fillRect(0,0,W,H)}};
