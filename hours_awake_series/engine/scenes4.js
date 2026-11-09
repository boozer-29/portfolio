// ============ SCENES 4: dollhouse, radio, map, circle, eyes, reflection, vote, CTA ============
let STAMPS=[];
function room(x,y,w,h,wall,o={}){blk(x,y,w,h,2,wall,{hi:.06,lo:-.1,hh:.04,lh:.08});ctx.fillStyle='rgba(0,0,0,.08)';for(let i=0;i<w;i+=22)ctx.fillRect(x+i,y,9,h-14);rect(x,y+h-14,w,14,o.floor||'#3a2812');rect(x,y+h-16,w,3,'#5a4023');if(o.lamp!==false){const f=1+Math.sin(performance&&0)*0;glow(x+(o.lx??w*.5),y+40,210,C.amb,.75);glow(x+(o.lx??w*.5),y+50,90,'#ffd9a0',.35);}}
function sofa(x,y,w){blk(x,y-62,w,62,16,'#7a3b2a',{hi:.2});blk(x+10,y-92,w-20,44,14,'#8a4632',{hi:.2});blk(x-12,y-56,26,56,10,'#6a3022');blk(x+w-14,y-56,26,56,10,'#6a3022')}
function doll(t,gp){const p=EZ.io(gp);const c={x:0,y:lerp(330,-330,p),z:1.34,rot:0};STAMPS=[];vgrad(0,H,[[0,'#08162b'],[1,'#10243f']]);
  view(c,.3,()=>{vgrad(-500,1000,[[0,'#04091a'],[1,'#16314f']]);stars(t,80,2,-480,300)});
  view(c,1,()=>{const bx=70,bw=400,fh=130,top=130;
    // roof + hatch + ladder
    blk(bx-6,top-14,bw+12,16,4,'#0a1220');blk(210,top-52,120,40,10,C.amb,{hi:.2});glow(270,top-30,150,C.amb,.4);ctx.strokeStyle='#8a5a2a';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(244,top-14);ctx.lineTo(244,top-120);ctx.moveTo(296,top-14);ctx.lineTo(296,top-120);ctx.stroke();for(let i=0;i<6;i++){ctx.beginPath();ctx.moveTo(244,top-26-i*16);ctx.lineTo(296,top-26-i*16);ctx.stroke()}
    rect(bx-12,top-2,12,fh*5+130,'#070d1a');rect(bx+bw,top-2,12,fh*5+130,'#070d1a');
    const fy=n=>top+n*fh;
    // F5: you + Ollie on couch
    room(bx,fy(0),bw,fh,'#3b2a1c',{lx:190});sofa(150,fy(1)-14,190);
    const nod=Math.sin(t*1.1)*.7;person({x:210,y:fy(1)-14+32,s:.95,top:C.must,hood:true,back:true,hairStyle:'none',shadow:0,pose:{tilt:Math.sin(t*.6)*3,lean:0}});
    person({x:296,y:fy(1)-14+34,s:.82,top:'#cc3b3b',hat:'beanie',hatc:C.red,eyes:'half',mouth:null,shadow:0,pose:{tilt:nod*9+4,lean:2}});blk(280,fy(1)-62,26,18,8,'#3fa34d',{hi:.3});blk(300,fy(1)-68,12,10,5,'#3fa34d');
    // F4: Maya tablet
    room(bx,fy(1),bw,fh,'#2a3a3c',{lx:260});blk(210,fy(2)-62,150,12,4,'#5a4023');rect(220,fy(2)-50,8,38,'#4a3520');rect(342,fy(2)-50,8,38,'#4a3520');blk(250,fy(2)-86,34,24,5,'#d33');
    person({x:196,y:fy(2)-14,s:.95,top:'#14b8a6',hairStyle:'long',hair:'#3a2a1a',mouth:'line',shadow:0,pose:{tilt:3,aL:40,aR:42,eL:70,eR:70}});blk(176,fy(2)-62,40,28,5,'#0b1630');glow(196,fy(2)-48,70,'#8cd5ff',.5);
    // F3: Reyes at window
    room(bx,fy(2),bw,fh,'#2c3326',{lx:200});blk(330,fy(3)-110,100,92,6,'#05070d');ctx.fillStyle='#0b1a30';ctx.fillRect(338,fy(3)-102,84,76);glow(380,fy(3)-70,90,C.cold,.3);ctx.fillStyle='#1a2236';ctx.fillRect(374,fy(3)-102,4,76);
    const sc=Math.sin(t*.8);person({x:300,y:fy(3)-14,s:.95,top:'#5b6b3c',beard:'#9aa0a8',hairStyle:'none',hair:'#9aa0a8',brow:1,shadow:0,pose:{turn:sc,tilt:sc*3,aL:20,aR:30,eL:40,eR:55}});
    ctx.save();ctx.translate(290,fy(3)-56);ctx.rotate(-.35);blk(-10,-4,90,8,3,'#1a1a20');blk(-20,-6,34,12,4,'#5a4023');ctx.restore();
    // F2: DJ radio
    room(bx,fy(3),bw,fh,'#2a2540',{lx:170});blk(100,fy(4)-62,190,12,4,'#5a4023');blk(190,fy(4)-98,92,40,6,'#2b2f3a');ctx.fillStyle='#06110b';ctx.fillRect(196,fy(4)-92,40,28);ctx.strokeStyle='#22c55e';ctx.lineWidth=1.5;ctx.beginPath();for(let x=0;x<40;x++){const y=fy(4)-78+Math.sin(x*.5+t*10)*5*(.5+.5*Math.sin(t*3));x?ctx.lineTo(196+x,y):ctx.moveTo(196+x,y)}ctx.stroke();circ(262,fy(4)-78,12,'#111');ctx.strokeStyle=C.amb;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(262,fy(4)-78);ctx.lineTo(262+Math.cos(t*.9)*10,fy(4)-78+Math.sin(t*.9)*10);ctx.stroke();
    person({x:150,y:fy(4)-14,s:.95,top:'#a855f7',hood:true,phones:true,hairStyle:'none',eyes:'half',shadow:0,pose:{tilt:Math.sin(t*2.4)*3,aL:30,aR:12,eR:20}});
    // F1: barricade
    room(bx,fy(4),bw,fh,'#2a2018',{lx:260,lamp:false});glow(270,fy(4)+40,120,'#ffb060',.18);blk(200,fy(5)-112,92,98,5,'#4a3320');ctx.strokeStyle='#8a6a40';ctx.lineWidth=7;for(const [a,b,c2,d2] of [[190,fy(5)-100,300,fy(5)-30],[300,fy(5)-100,190,fy(5)-30],[190,fy(5)-65,300,fy(5)-65]]){ctx.beginPath();ctx.moveTo(a,b);ctx.lineTo(c2,d2);ctx.stroke()}blk(110,fy(5)-70,70,56,6,'#5a4023');blk(310,fy(5)-60,90,46,8,'#6b5a3a');ctx.strokeStyle='#9aa0a8';ctx.lineWidth=3;ctx.beginPath();ctx.arc(246,fy(5)-60,16,0,7);ctx.stroke();
    // basement
    blk(bx,fy(5),bw,80,2,'#0a1220');blk(220,fy(5)+8,70,64,4,'#1d3b66',{hi:.2});glow(255,fy(5)+40,110,C.cold,.35);const dr=(t*1.3)%1;ctx.fillStyle='#8cc8ff';ctx.beginPath();ctx.arc(150,fy(5)+10+dr*50,2,0,7);ctx.fill();
    // names (positions captured for screen-space stamps)
    const names=[['DJ',CU.names[0],150,fy(3)+30],['REYES',CU.names[1],300,fy(2)+24],['MAYA',CU.names[2],196,fy(1)+24],['OLLIE',CU.names[3],296,fy(0)+22]];const m=ctx.getTransform();for(const [n,t0,x,y] of names){if(t>=t0){const q=m.transformPoint(new DOMPoint(x,y));STAMPS.push({n,t0,x:q.x/2,y:q.y/2})}}
    dust(t,100,200,360,700,34,41,'#ffe6b8',.35,.4)});
  {const colx={DJ:96,MAYA:190,OLLIE:300,REYES:410};const arr=STAMPS.map(q=>({...q,y:clamp(q.y,285,610),x:colx[q.n]})).sort((a,b)=>a.y-b.y);for(let i=1;i<arr.length;i++)if(arr[i].y-arr[i-1].y<48)arr[i].y=arr[i-1].y+48;STAMPS=arr}
  for(const s of STAMPS){const a=EZ.ob(clamp((t-s.t0)/.25));ctx.save();ctx.translate(s.x,Math.min(s.y,640));ctx.scale(a,a);ctx.rotate(-.06);ctx.font='42px Caveat';ctx.textAlign='center';ctx.lineWidth=6;ctx.strokeStyle='rgba(0,0,0,.75)';ctx.strokeText(s.n,0,0);ctx.fillStyle='#fff';ctx.fillText(s.n,0,0);ctx.restore()}}
SC.doll_a=(t,u,d)=>doll(t,pr(t,CU.doll[0],CU.doll[1]));SC.doll_b=SC.doll_a;SC.doll_c=SC.doll_a;
// ---------- radio room
function radioRoom(t,p,opt={}){const e=EZ.o3(pr(p,0,.4));let c=cam(p,{z0:1,z1:1.1});c=shakeCam(c,t,.5,30);vgrad(0,H,[[0,'#0c1228'],[1,'#080b16']]);
  view(c,.35,()=>{glow(380,340,300,'#22c55e',.1);blk(30,120,200,260,8,'#0a1424');blk(300,150,200,200,8,'#0a1424');glow(130,250,160,C.amb,.25)});
  view(c,1,()=>{ctx.save();ctx.translate(0,(1-e)*260);ctx.rotate((1-e)*.05);
    person({x:350,y:1010,s:4.2,top:'#a855f7',hood:true,phones:true,hairStyle:'none',eyes:'half',under:false,mouth:Math.floor(t*6)%3?null:'line',pose:{tilt:Math.sin(t*1.3)*3+3,lean:1,aL:25,aR:40,eR:60}});
    // mic
    ctx.strokeStyle='#2a2f3a';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(430,900);ctx.quadraticCurveTo(440,730,370,690);ctx.stroke();blk(350,676,38,28,10,'#10131c');
    // radio
    blk(30,700,330,230,22,'#2b2f3a',{hi:.2});ctx.fillStyle='#06110b';rr(52,722,170,98,8);ctx.fill();ctx.strokeStyle='#22c55e';ctx.lineWidth=2.4;ctx.beginPath();for(let x=0;x<160;x+=3){const a=(Math.sin(x*.2+t*18)+Math.sin(x*.07-t*7))*14*(opt.big?1.4:1);x?ctx.lineTo(58+x,771+a):ctx.moveTo(58+x,771+a)}ctx.stroke();glow(140,771,110,'#22c55e',.3);
    circ(280,775,50,'#111');ctx.strokeStyle='#8a8f98';ctx.lineWidth=3;ctx.beginPath();ctx.arc(280,775,45,0,7);ctx.stroke();const a=-2.2+Math.sin(t*1.6)*.3+p*.8;ctx.strokeStyle=C.amb;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(280,775);ctx.lineTo(280+Math.cos(a)*38,775+Math.sin(a)*38);ctx.stroke();for(let i=0;i<8;i++)rect(60+i*17,846,8,42,'#555');ctx.strokeStyle='#8a8f98';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(330,700);ctx.lineTo(350,520);ctx.stroke();ctx.restore();
    const r=mul(Math.floor(t*30));ctx.globalAlpha=.1;for(let i=0;i<120;i++){ctx.fillStyle=r()>.5?'#fff':'#9ee';ctx.fillRect(r()*W,300+r()*600,r()*18+4,1)}ctx.globalAlpha=1});dust(t,0,300,W,500,20,52,'#ffe6b8',.25,.5)}
SC.radio=(t,u,d)=>radioRoom(t,u/d);
SC.rescue=(t,u,d)=>{const p=u/d;rect(0,0,W,H,'#05090c');vgrad(0,H,[[0,'#0a1410'],[1,'#05090c']]);const r=mul(Math.floor(t*30));
  ctx.save();ctx.translate(270,420);ctx.fillStyle='#10201a';rr(-230,-200,460,420,24);ctx.fill();ctx.strokeStyle='#1d3a2c';ctx.lineWidth=6;rr(-230,-200,460,420,24);ctx.stroke();ctx.restore();
  ctx.fillStyle=C.amb;ctx.shadowColor=C.amb;ctx.shadowBlur=22;ctx.textAlign='center';ctx.font='110px "Bebas Neue"';ctx.fillText('RESCUE',270,380);ctx.fillText('IN 7 DAYS',270,490);ctx.shadowBlur=0;
  ctx.fillStyle='rgba(61,220,132,.7)';ctx.font='500 13px "JetBrains Mono"';const lines=['> STAY AWAKE','> HELP COMES IN 7 DAYS','> STAY AWAKE'];lines.forEach((l,i)=>{const n=Math.floor(clamp((p*3-i*.6)*20));ctx.fillText(l.slice(0,n),270,560+i*22)});
  ctx.globalAlpha=.12;for(let i=0;i<260;i++){ctx.fillStyle=r()>.5?'#fff':'#9ee';ctx.fillRect(r()*W,r()*H,r()*30+4,1.5)}ctx.globalAlpha=1;ctx.fillStyle='rgba(0,0,0,.15)';for(let y=0;y<H;y+=4)ctx.fillRect(0,y,W,1);
  if(Math.sin(t*9)>.9){ctx.fillStyle='rgba(255,255,255,.05)';ctx.fillRect(0,0,W,H)}};
SC.ollie=(t,u,d)=>{const p=u/d;let c=cam(p,{z0:1,z1:1.1});c=shakeCam(c,t,.5,31);vgrad(0,H,[[0,'#10182c'],[1,'#0a1020']]);
  view(c,.4,()=>{glow(150,360,320,C.amb,.35);blk(40,120,150,200,8,'#1a2236');blk(330,180,160,140,8,'#141c30')});
  view(c,1,()=>{const nodA=p<.55?Math.sin(p*9)*.5+.5:0;const wake=pr(p,.68,.76);const gasp=wake>0;const wk=EZ.ob(wake);
    const ol={x:270,y:1010,s:4.4,top:'#cc3b3b',hat:'beanie',hatc:C.red,eyes:gasp?'wide':'closed',under:false,mouth:gasp?'gasp':null,shadow:0,noArms:true,pose:{tilt:p<.55?nodA*16+6:lerp(18,-3,wk),lean:p<.55?nodA*4:0}};person(ol);const sh=shoulderPts(ol,ol.pose);
    blk(10,900,520,200,40,'#7a3b2a',{hi:.2});blk(40,860,460,60,30,'#8a4632',{hi:.2});
    // dino hugged in his lap; it slips when he startles
    const dy=860+Math.min(1,p*1.2)*10+wk*60;ctx.save();ctx.translate(270,dy);blk(-86,-30,172,76,34,'#3fa34d',{hi:.3});blk(52,-58,56,50,22,'#3fa34d',{hi:.3});circ(88,-40,5,'#fff');circ(89,-39,2.4,'#111');ctx.fillStyle='#2e7d3a';for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(-60+i*30,-30);ctx.lineTo(-50+i*30,-46);ctx.lineTo(-40+i*30,-30);ctx.fill()}ctx.restore();
    // his arms: hugging the dino, then flying up to his cheeks
    for(const sd of[-1,1]){const hug=[270+sd*78,dy-6],up=[270+sd*66,590];const H=[lerp(hug[0],up[0],wk),lerp(hug[1],up[1],wk)];armIK(sd<0?sh[0]:sh[1],H,{auto:.58,min:70,out:sd,down:wk<.5,w0:54,w1:32,col:'#cc3b3b'})}
    const hx=lerp(560,372,EZ.o3(pr(p,.42,.64)));blk(hx-40,720,150,60,26,C.must,{hi:.18});blk(hx-52,716,46,54,20,'#e0b48c');
    if(gasp){for(let i=0;i<3;i++){ctx.strokeStyle=`rgba(255,255,255,${.5-i*.14})`;ctx.lineWidth=3;ctx.beginPath();ctx.arc(270,580,60+i*26+(wake)*30,-2.3,-.8);ctx.stroke()}}
  });dust(t,60,380,300,420,22,32,'#ffe6b8',.3,.4)};
// ---------- tablet map (mid twist)
const MR=mul(77),DOTS=Array.from({length:520},()=>({a:MR()*6.283,r:Math.sqrt(MR())*205}));
function mapScene(t,face){const g0=CU.map[0],g1=CU.map[1];const tt=Math.min(t,CU.map[2]);const e=EZ.o3(pr(t,g0,g0+.7));let c=cam(pr(t,g0,g1),{z0:1,z1:1.08});c=shakeCam(c,t,.4,33);
  vgrad(0,H,[[0,'#07101c'],[1,'#05080f']]);glow(270,470,380,'#8cd5ff',.12);
  view(c,1,()=>{ctx.save();ctx.translate(0,(1-e)*280);ctx.rotate((1-e)*.05);
    blk(26,200,488,520,34,'#1a2236',{hi:.25,lo:-.3});ctx.fillStyle='#08111f';rr(44,218,452,484,20);ctx.fill();
    ctx.save();rr(44,218,452,484,20);ctx.clip();
    ctx.fillStyle='#0c1a2c';ctx.fillRect(44,218,452,484);ctx.fillStyle='#0a2a28';ctx.fillRect(70,250,110,80);ctx.fillRect(360,520,100,90);ctx.fillStyle='#0a2038';ctx.beginPath();ctx.moveTo(44,470);ctx.bezierCurveTo(180,430,260,540,496,500);ctx.lineTo(496,540);ctx.bezierCurveTo(260,580,180,470,44,510);ctx.fill();
    ctx.strokeStyle='rgba(80,120,170,.28)';ctx.lineWidth=1.4;for(let i=0;i<10;i++){ctx.beginPath();ctx.moveTo(44+i*50,218);ctx.lineTo(44+i*50+(i%3)*10,702);ctx.stroke()}for(let i=0;i<9;i++){ctx.beginPath();ctx.moveTo(44,218+i*54);ctx.lineTo(496,218+i*54+(i%2)*8);ctx.stroke()}ctx.strokeStyle='rgba(120,160,210,.4)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(44,300);ctx.lineTo(496,420);ctx.moveTo(150,218);ctx.lineTo(380,702);ctx.stroke();
    const cx=270,cy=460;const move=EZ.io(pr(tt,CU.map[3],CU.map[4]));const show=pr(tt,g0+.5,g0+1.5);
    DOTS.forEach((dd,i)=>{if(i/DOTS.length>show)return;const x0=cx+Math.cos(dd.a)*dd.r*1.1,y0=cy+Math.sin(dd.a)*dd.r*.9;const x=lerp(x0,cx+(x0-cx)*.28,move)+Math.sin(tt*2+i)*(1-move)*1.5,y=lerp(y0,cy+(y0-cy)*.28,move)+Math.cos(tt*2+i)*(1-move)*1.5;
      if(tt>CU.map[3]+.7&&i%5===0){ctx.strokeStyle=rgba(C.red,.75);ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(cx-x)*.16,y+(cy-y)*.16);ctx.stroke()}ctx.fillStyle='rgba(255,255,255,.92)';ctx.fillRect(x-1.4,y-1.4,2.8,2.8)});
    const pu=1+.2*Math.sin(tt*6);glow(cx,cy,70*pu,C.amb,.8);blk(cx-10,cy-10,20,20,4,C.amb);ctx.strokeStyle=C.amb;ctx.lineWidth=2;ctx.beginPath();ctx.arc(cx,cy,18*pu,0,7);ctx.stroke();ctx.restore();ctx.restore();
    glow(130,880,260,'#8cd5ff',.35);person({x:120,y:1060,s:3.5,top:'#14b8a6',hairStyle:'long',hair:'#3a2a1a',mouth:'line',eyes:'wide',shadow:0,pose:{tilt:-3,lean:2}});
    if(face)person({x:410,y:1080,s:3.7,top:'#5b6b3c',beard:'#9aa0a8',hairStyle:'none',hair:'#9aa0a8',brow:1,eyes:'wide',shadow:0,pose:{tilt:3}})})}
SC.map1=(t)=>mapScene(t,false);SC.map2=SC.map1;SC.map4=(t)=>mapScene(t,true);SC.map_hold=(t,u,d)=>{mapScene(CU.map[2],true);ctx.fillStyle=`rgba(2,3,8,${EZ.i2(u/d)*.9})`;ctx.fillRect(0,0,W,H)};
// ---------- the circle (view from window)
const RINGP=(()=>{const a=[];const r=mul(55);for(let ring=0;ring<3;ring++){const n=[30,38,46][ring],rad=[1,1.2,1.4][ring];for(let i=0;i<n;i++)a.push({ang:i/n*6.283+ring*.12,rad,ring,v:Math.floor(r()*6)+1,ord:(i/n)*3+ring*.35})}return a})();
function ringWorld(t,p,o){const c=shakeCam({x:0,y:0,z:lerp(1,1.09,EZ.io(p)),rot:Math.sin(t*.6)*.3},t,.25,40);
  view(c,.2,()=>{SKY.night();stars(t,70,6,-600,100)});
  view(c,.5,()=>{skylineLayer({seed:61,base:470,minW:44,maxW:84,minH:150,maxH:300,col:'#0e1a30',winFn:(x,y,q)=>q<.2?'#d9b060':null,gap:2,roof:true,t})});
  view(c,1,()=>{vgrad(460,1100,[[0,'#1d2638'],[1,'#0b1019']]);const cx=270,cy=700,rx=232,ry=112;
    ctx.strokeStyle='rgba(230,247,255,.16)';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(cx,cy,rx*.82,ry*.82,0,0,7);ctx.stroke();glow(cx,cy,300,'#6fb8ff',.2);
    for(const x of[60,480])lampPost(x,560,150,{glow:90});
    const list=RINGP.filter(q=>q.ord<=o.fill).map(q=>({...q,x:cx+Math.cos(q.ang)*rx*q.rad,y:cy+Math.sin(q.ang)*ry*q.rad})).sort((a,b)=>a.y-b.y);
    for(const q of list){const kn=o.kneel&&!(o.kneelAt&&t<o.kneelAt);const s=(.34+.3*(q.y-560)/280)*(kn?.74:1);const eo=o.eyesAt!=null&&t>=o.eyesAt+Math.hypot(q.x-270,(q.y-700)*1.6)/520;const eyes=eo?'glow':'closed';sleeperAt(q.x,q.y,s,q.v,o.kneel&&!(o.kneelAt&&t<o.kneelAt)?'kneel':'stand',eyes);if(eo)glow(q.x,q.y-(o.kneel?66:92)*s,34*s,'#E6F7FF',.7)}
    // our building footprint (dark) at bottom
    blk(190,830,160,150,6,'#070b14',{hi:.05});ctx.fillStyle=C.amb;ctx.fillRect(230,850,16,22);glow(238,862,50,C.amb,.4)});
  if(o.kneel&&t-CU.kneel_t>=0&&t-CU.kneel_t<.6){const q=(t-CU.kneel_t)/.6;view(c,1,()=>{ctx.strokeStyle=`rgba(230,247,255,${.6*(1-q)})`;ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(270,700,40+q*330,18+q*150,0,0,7);ctx.stroke()})}
  view(c,1.2,()=>{rect(-120,-120,70,1300,'#05070d');rect(W-50,-120,170,1300,'#05070d');rect(-120,-120,W+240,70,'#05070d');rect(-120,900,W+240,200,'#05070d');rect(262,50,16,860,'#080b12')});
  dust(t,0,300,W,500,16,41,'#9fb4d8',.2,.5)}
SC.win_fill=(t,u,d)=>ringWorld(t,u/d*.4,{fill:EZ.io(clamp(u/d*1.15))*3.5});
SC.win_hold=(t,u,d)=>ringWorld(t,.4+u/d*.3,{fill:9});
SC.win_kneel=(t,u,d)=>ringWorld(t,.7+u/d*.3,{fill:9,kneel:true});
SC.win_kneel_static=(t,u,d)=>ringWorld(CU.kneel_t+.3,1,{fill:9,kneel:true});
// ---------- eyes
function kneelFace(t,p,st){const c=shakeCam({x:0,y:lerp(0,-8,p),z:lerp(1,1.28,EZ.io(p)),rot:0},t,st.shake||.3,41);vgrad(0,H,[[0,'#08162b'],[1,'#050a14']]);
  view(c,.4,()=>blurred(7,()=>{glow(270,360,360,st.open?'#9fdcff':C.cold,st.open?.22:.2);for(let r=0;r<2;r++)for(let i=0;i<7;i++)sleeperAt(40+i*75+(r%2)*30,200+r*90,1.3,(i+r)%6+1,'kneel',st.open?'glow':'closed')}));
  view(c,1,()=>{blk(40,660,460,420,80,'#6b7280',{hi:.12});const o=sleeperOpts(2);bigHead({skin:C.skin,hairStyle:'short',hair:'#4a3a2a',eyes:st.eyes,under:true,top:'#6b7280'},270,440,9.4,{tilt:st.tilt||14});
    if(st.hum)for(let i=0;i<4;i++){const ph=(t*1.8+i/4)%1;ctx.strokeStyle=`rgba(230,247,255,${.5*(1-ph)})`;ctx.lineWidth=3;ctx.beginPath();ctx.arc(270,690,40+ph*220,Math.PI*1.1,Math.PI*1.9);ctx.stroke()}})}
SC.eye_close=(t,u,d)=>kneelFace(t,u/d,{eyes:'closed',tilt:12,hum:true});
SC.eye_open=(t,u,d)=>{const p=u/d;kneelFace(t,.7+p*.1,{eyes:'glow',open:true,tilt:6,shake:2});ctx.fillStyle=`rgba(230,247,255,${.5*Math.max(0,1-p*4)})`;ctx.fillRect(0,0,W,H)};
SC.eye_wave=(t,u,d)=>ringWorld(t,.9+u/d*.1,{fill:9,kneel:true,eyesAt:CU.wave_t});
SC.heads_up=(t,u,d)=>{const p=u/d;kneelFace(t,.8+p*.2,{eyes:'glow',open:true,tilt:lerp(10,-16,EZ.io(p)),hum:true})};
// ---------- reflection in the glass
SC.refl=(t,u,d)=>{const p=u/d;let c=cam(p,{z0:1,z1:1.1});c=shakeCam(c,t,.2,42);vgrad(0,H,[[0,'#060a14'],[1,'#0a1830']]);
  view(c,.5,()=>{glow(270,300,360,C.cold,.14)});
  view(c,1,()=>{const r=mul(91);for(let row=0;row<7;row++)for(let k=0;k<11;k++){const x=22+k*48+(row%2)*24+r()*8,y=560+row*58;const s=.55+row*.12;const fl=.85+.15*Math.sin(t*3+k+row);glow(x,y,30*s,'#E6F7FF',.7*fl);ctx.fillStyle='#0b1220';rr(x-14*s,y-13*s,28*s,26*s,5*s);ctx.fill();glow(x-5.5*s,y,12*s,'#fff',.8);glow(x+5.5*s,y,12*s,'#fff',.8);ctx.fillStyle='#E6F7FF';rr(x-9*s,y-4*s,7*s,8*s,1.4*s);ctx.fill();rr(x+2*s,y-4*s,7*s,8*s,1.4*s);ctx.fill()}
    ctx.save();ctx.globalAlpha=.8;person({x:270,y:640,s:2.8,top:C.must,hood:true,hairStyle:'none',eyes:'wide',shadow:0,pose:{tilt:Math.sin(t)*1.5}});ctx.restore();
    if(t>=CU.mark_t&&t<CU.mark_t+8/30){const a=.55+.45*Math.sin((t-CU.mark_t)*50);ctx.save();ctx.globalAlpha=a;ctx.translate(318,372);glow(0,0,70,'#34d399',.95);ctx.fillStyle='#34d399';for(let i=0;i<11;i++)ctx.fillRect(-18+i*3.6,-22,i%3?1.8:3.4,44);ctx.restore()}
    // glass streaks
    ctx.fillStyle='rgba(255,255,255,.04)';ctx.fillRect(80,0,50,H);ctx.fillRect(330,0,26,H);rect(-120,-120,W+240,50,'#04060b');rect(-120,-120,36,1300,'#04060b');rect(W-36,-120,200,1300,'#04060b')})};
// ---------- vote + CTA
SC.vote=(t,u,d)=>{const t0=CU.vote_t;vgrad(0,H,[[0,'#0c1020'],[1,'#07090f']]);const g=ctx.createRadialGradient(270,400,0,270,400,520);g.addColorStop(0,'rgba(60,80,130,.35)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);dust(t,0,200,W,600,30,50,'#9fb4d8',.3,.3);
  const title='WHAT DO YOU DO?';const n=Math.floor(clamp((t-t0[0])/0.7)*title.length);ctx.textAlign='center';ctx.font='72px "Bebas Neue"';ctx.letterSpacing='2px';ctx.fillStyle='#F4F4EF';ctx.fillText(title.slice(0,n),270,290);
  const pulse=1+.03*Math.sin((t-t0[3])*Math.PI/1.2)*(t>t0[3]?1:0);
  function card(y,tc0,col,letter,lab,tc,icon){const q=EZ.ob(clamp((t-tc0)/.35));if(t<tc0)return;ctx.save();ctx.globalAlpha=clamp((t-tc0)/.2);ctx.translate(270,y+56);ctx.scale(pulse,pulse);ctx.translate(-270+40*(1-q),-y-56);
    ctx.fillStyle='rgba(0,0,0,.4)';rr(54,y+8,440,112,22);ctx.fill();blk(50,y,440,112,22,'#161c30',{hi:.14});blk(66,y+16,80,80,16,col,{hi:.25});ctx.fillStyle=tc;ctx.font='72px "Bebas Neue"';ctx.letterSpacing='0px';ctx.fillText(letter,106,y+78);
    ctx.fillStyle='#F4F4EF';ctx.textAlign='left';ctx.font='46px "Bebas Neue"';ctx.letterSpacing='2px';ctx.fillText(lab,168,y+72);ctx.textAlign='center';ctx.globalAlpha=clamp((t-tc0-.5)/.3);icon(458,y+56);ctx.restore()}
  card(330,t0[1],C.lime,'A','THE ROOF','#0A0D16',(x,y)=>{ctx.strokeStyle=C.amb;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x-10,y-34);ctx.lineTo(x-10,y+34);ctx.moveTo(x+10,y-34);ctx.lineTo(x+10,y+34);for(let i=0;i<5;i++){ctx.moveTo(x-10,y-26+i*14);ctx.lineTo(x+10,y-26+i*14)}ctx.stroke()});
  card(470,t0[2],C.red,'B','THE BASEMENT','#fff',(x,y)=>{ctx.fillStyle='#6fb8ff';for(let i=0;i<4;i++)ctx.fillRect(x-22+i*11,y+18-i*11,14,9)});
  if(t>=t0[4]){ctx.globalAlpha=EZ.io(pr(t,t0[4],t0[4]+.3));ctx.font='600 15px "JetBrains Mono"';ctx.letterSpacing='3px';ctx.fillStyle=C.amb;ctx.fillText('ONLY ONE IS QUIET',270,604);ctx.globalAlpha=1}
  if(t>=t0[5]){ctx.globalAlpha=EZ.io(pr(t,t0[5],t0[5]+.3));ctx.font='600 14px "JetBrains Mono"';ctx.letterSpacing='1.5px';ctx.fillStyle=C.lime;ctx.fillText('COMMENT A OR B · THE MOST VOTED CHOICE DECIDES',270,632);ctx.globalAlpha=1}};
SC.cta=(t,u,d)=>{rect(0,0,W,H,'#000');if(u>=1.5){ctx.globalAlpha=.55*EZ.io(pr(u,1.5,2.7));kitchenWorld(t,{x:0,y:0,z:1,rot:0},{});ctx.globalAlpha=1;ctx.fillStyle='rgba(0,0,0,.45)';ctx.fillRect(0,0,W,H)}
  const a=EZ.io(pr(t,CU.cta_t,CU.cta_t+8/30));ctx.globalAlpha=a;ctx.textAlign='center';ctx.font='96px "Bebas Neue"';ctx.letterSpacing='3px';ctx.fillStyle='#fff';ctx.fillText('FOLLOW FOR',270,470);ctx.fillStyle=C.lime;ctx.font='150px "Bebas Neue"';ctx.fillText('HOUR 52',270,590);ctx.globalAlpha=1};
// alias scenes from the shared plan
SC.phones_b=SC.phones_b||SC.phones;
