// ============ EPISODE 2: scenes A (roof, hook, stairs, rules) ============
const OLLIE={skin:'#e0b48c',top:'#cc3b3b',hat:'beanie',hatc:C.red,bottom:'#2f4a7a',hairStyle:'none'};
function todSky(tod){ // 0 night, .35 dawn, .75 day
  const A=[[0,['#04091a','#1b3658']],[.35,['#0d1830','#d99a68']],[.75,['#2a3a5c','#a69aa0']],[1,['#0d1830','#7d5a66']]];let i=0;while(i<A.length-2&&tod>A[i+1][0])i++;const k=pr(tod,A[i][0],A[i+1][0]);return[mixc(h3(A[i][1][0]),h3(A[i+1][1][0]),k),mixc(h3(A[i][1][1]),h3(A[i+1][1][1]),k)]}
const h3=x=>x;
function roofWorld(t,c,o={}){
  const tod=o.tod??0;const [top,bot]=todSky(tod);const night=1-clamp(tod*3);
  view(c,.15,()=>{vgrad(-700,640,[[0,top],[1,bot]]);if(night>0){ctx.globalAlpha=night;stars(t,120,2,-600,260);ctx.globalAlpha=1}
    const ma=tod*3.1-.3;glow(120+tod*420,260-Math.sin(clamp(tod*1.3)*Math.PI)*170,150,night>.3?'#cfe0ff':'#ffd9a0',.35+.3*(1-night));circ(120+tod*420,260-Math.sin(clamp(tod*1.3)*Math.PI)*170,night>.3?14:22,night>.3?'#e8eefc':'#fff2cc')});
  view(c,.38,()=>{skylineLayer({seed:3,base:600,minW:34,maxW:70,minH:150,maxH:330,col:mixc('#1d2a48','#3a3f5e',tod),winFn:(x,y,q)=>night>.4&&q<.25?'#d9b060':null,gap:2,roof:true,beacon:true,t});fog(t,440,200,tod>.2?'#c98d64':'#2a4a7a',.14);smokeCol(t,90,600,380,60,'#23242f',.35*clamp(tod*3),3);smokeCol(t,430,600,320,52,'#26283a',.3*clamp(tod*3),8)});
  view(c,.6,()=>{skylineLayer({seed:8,base:640,minW:46,maxW:90,minH:140,maxH:260,col:mixc('#0f1a30','#242c48',tod),gap:2,roof:true,t});
    // neighbouring roof (right), lower, for the plank
    blk(400,590,200,60,3,mixc('#0d1626','#2a3250',tod));rect(396,584,208,8,mixc('#1a2540','#3a4468',tod))});
  view(c,.85,()=>{ // our roof surface + props
    vgrad(630,1100,[[0,mixc('#2b3144','#4a4f60',tod)],[1,'#10141e']]);for(let i=0;i<8;i++){ctx.fillStyle='rgba(0,0,0,.18)';ctx.fillRect(-100,640+i*i*6+i*14,W+200,2)}const r=mul(5);for(let i=0;i<120;i++){ctx.fillStyle=`rgba(255,255,255,${.03+r()*.05})`;ctx.fillRect(r()*W,640+r()*340,1.5+r()*2,1.2)}
    blk(-100,596,W+200,32,3,mixc('#202840','#4a5068',tod),{hi:.18});blk(-100,592,W+200,8,2,mixc('#2a3350','#5a6078',tod));
    // stair door structure (left)
    blk(8,410,172,190,5,mixc('#242c44','#4a5068',tod),{hi:.12});blk(2,402,184,12,3,mixc('#2e3856','#5a6078',tod));
    const door=o.door||0;ctx.save();blk(60,468,76,132,3,'#3a4258',{hi:.18});if(!o.noWin){ctx.fillStyle='#0a1222';ctx.fillRect(86,484,24,22);glow(98,495,40,o.hum?'#E6F7FF':C.amb,.3+.4*(o.hum||0))}blk(122,534,8,10,2,'#c9ccd6');ctx.restore();
    // hum rings from the door
    if(o.hum){for(let i=0;i<4;i++){const ph=(t*1.2+i/4)%1;ctx.strokeStyle=`rgba(230,247,255,${.55*(1-ph)*o.hum})`;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(98,534,30+ph*120,50+ph*170,0,0,7);ctx.stroke()}}
    // water tank
    for(const x of[345,445]){rect(x,470,6,130,mixc('#1c2236','#3a4058',tod))}blk(318,350,160,130,18,mixc('#2a3350','#5a6078',tod),{hi:.2});ctx.fillStyle='rgba(0,0,0,.25)';for(let i=1;i<4;i++)ctx.fillRect(318,350+i*30,160,2);rect(470,380,5,220,'#3a4258');for(let i=0;i<9;i++)rect(470,390+i*22,18,3,'#3a4258');
    // antenna + beacon
    rect(266,290,5,310,'#3a4258');rect(246,330,45,3,'#3a4258');rect(252,370,32,3,'#3a4258');if(Math.floor(t*.9)%2)glow(268,288,26,'#ff3b30',.9);circ(268,288,3,'#ff3b30');
    // AC unit
    blk(430,520,96,80,6,mixc('#2e3652','#5a6078',tod),{hi:.15});for(let i=0;i<5;i++)rect(440,530+i*13,76,3,'rgba(0,0,0,.3)');
    if(o.lamp!==false){glow(270,770,320,C.amb,.38*(1-tod*.5));blk(256,788,28,22,6,'#2a2a30');glow(270,790,40,'#ffd9a0',.5)}
  });
  fog(t,620,160,'#3b5a85',.07*(1-tod*.5))}
// ---- the survivors on the roof (each: exactly one pair of arms)
function you_back(o){return Object.assign({top:C.must,hood:true,back:true,hairStyle:'none',shadow:.5},o)}
function ollieFront(o){return Object.assign({},OLLIE,{shadow:0},o)}
function gunLine(a,b){ctx.save();ctx.strokeStyle='#1a1a20';ctx.lineWidth=6;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();ctx.strokeStyle='#5a4023';ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(a[0]+(b[0]-a[0])*.32,a[1]+(b[1]-a[1])*.32);ctx.stroke();ctx.restore()}
function survivors(t,o={}){
  const sl=o.sleep||0, alert=o.alert||0;
  // REYES (back view, guarding the door at left)
  {const nod=Math.sin(t*1.7)*sl*5;const R={x:112,y:716,s:1.75,top:'#5b6b3c',back:true,hairStyle:'none',hair:'#9aa0a8',noArms:true,pose:{tilt:nod+alert*(-4),lean:alert*-4}};person(R);const sh=shoulderPts(R,R.pose);
   const g1=[sh[0][0]-58,sh[0][1]+16-alert*12],g0=[sh[1][0]+4,sh[1][1]+32];gunLine([g0[0]+26,g0[1]+8],[g1[0]-34,g1[1]-8]);
   armIK(sh[0],g1,{auto:.6,out:-1,down:true,w0:28,w1:15,col:'#5b6b3c'});armIK(sh[1],g0,{auto:.6,out:1,down:true,w0:30,w1:15,col:'#5b6b3c'})}
  // MAYA (kneeling, tablet at her chest)
  {const M={x:214,y:748,s:1.95,top:'#14b8a6',hairStyle:'long',hair:'#3a2a1a',mouth:o.mayaShh?'o':'line',eyes:sl>.4?'half':'open',kneel:true,noArms:true,pose:{tilt:Math.sin(t*1.1)*sl*5}};person(M);const sh=shoulderPts(M,M.pose);
   const tb=[M.x,M.y-52*M.s];blk(tb[0]-32,tb[1]-20,64,44,7,'#0b1630',{hi:.2});glow(tb[0],tb[1],70,'#8cd5ff',.45);ctx.fillStyle='#14305a';ctx.fillRect(tb[0]-26,tb[1]-14,52,32);
   if(o.mayaShh)armIK(sh[1],[M.x+6,M.y-69*M.s],{auto:.62,out:1,down:false,w0:28,w1:15,col:'#14b8a6'});else armIK(sh[1],[tb[0]+24,tb[1]+14],{auto:.6,out:1,down:true,w0:28,w1:15,col:'#14b8a6'});
   armIK(sh[0],[tb[0]-24,tb[1]+14],{auto:.6,out:-1,down:true,w0:28,w1:15,col:'#14b8a6'})}
  // DJ (kneeling at the radio)
  {const nod=Math.sin(t*1.3+1)*sl*7;const D={x:404,y:742,s:1.95,top:'#a855f7',hood:true,phones:true,hairStyle:'none',eyes:sl>.4?'half':'open',kneel:true,noArms:true,pose:{tilt:nod,lean:3}};person(D);const sh=shoulderPts(D,D.pose);
   const rx=D.x-44,ry=D.y+18;blk(rx,ry,88,44,8,'#2b2f3a',{hi:.2});ctx.fillStyle='#06110b';ctx.fillRect(rx+8,ry+8,34,22);ctx.strokeStyle='#22c55e';ctx.lineWidth=1.4;ctx.beginPath();for(let x=0;x<34;x+=2){const y=ry+19+Math.sin(x*.5+t*(o.static?30:8))*(o.static?7:2.5);x?ctx.lineTo(rx+8+x,y):ctx.moveTo(rx+8+x,y)}ctx.stroke();circ(rx+64,ry+19,10,'#111');ctx.strokeStyle=C.amb;ctx.lineWidth=2.4;const ka=-2+(o.knob||0)*1.4;ctx.beginPath();ctx.moveTo(rx+64,ry+19);ctx.lineTo(rx+64+Math.cos(ka)*8,ry+19+Math.sin(ka)*8);ctx.stroke();
   armIK(sh[0],[rx+14,ry+6],{auto:.58,out:-1,down:true,w0:28,w1:16,col:'#a855f7'});armIK(sh[1],[rx+64,ry+10],{auto:.58,out:1,down:true,w0:28,w1:16,col:'#a855f7'})}
  // YOU holding OLLIE (you behind him; his front faces us; your arms wrap around him)
  if(!o.noYou){const Y=you_back({x:322,y:946,s:2.35,kneel:true,noArms:true,pose:{lean:-2}});person(Y);const shY=shoulderPts(Y,Y.pose);
   const nodO=Math.sin(t*1.6)*sl*10;const O=ollieFront({x:322,y:912,s:1.5,kneel:true,noArms:true,eyes:o.ollieEyes||(sl>.4?'closed':'half'),mouth:o.ollieMouth||null,pose:{tilt:nodO+4,lean:1}});person(O);const shO=shoulderPts(O,O.pose);
   const dc=[322,O.y-26*O.s];ctx.save();ctx.translate(dc[0],dc[1]);blk(-27,-4,54,24,11,'#3fa34d',{hi:.3});blk(16,-17,19,17,7,'#3fa34d',{hi:.3});circ(28,-10,1.8,'#fff');ctx.restore();
   armIK(shO[0],[dc[0]-22,dc[1]+8],{auto:.6,out:-1,down:true,w0:18,w1:10,col:'#cc3b3b'});armIK(shO[1],[dc[0]+22,dc[1]+8],{auto:.6,out:1,down:true,w0:18,w1:10,col:'#cc3b3b'});
   armIK(shY[0],[dc[0]-40,dc[1]+22],{auto:.6,out:-1,down:true,w0:40,w1:22,col:C.must});armIK(shY[1],[dc[0]+40,dc[1]+22],{auto:.6,out:1,down:true,w0:40,w1:22,col:C.must})}
}
SC.survivors_demo=(t)=>{roofWorld(t,{x:0,y:0,z:1,rot:0},{});survivors(t,{})};
// ---------- 1. hook: crowd of glowing eyes looking up at you
function faceUp(x,y,s,seed,t){const fl=.85+.15*Math.sin(t*2+seed);ctx.save();ctx.translate(x,y);ctx.scale(s,s);blk(-13,-13,26,26,9,'#6f7686',{hi:.12,lo:-.3});ctx.fillStyle='rgba(60,52,86,.55)';ctx.fillRect(-9,4,6.5,2.4);ctx.fillRect(2.5,4,6.5,2.4);glow(-5.6,-1,11,'#E6F7FF',.5*fl);glow(5.6,-1,11,'#E6F7FF',.5*fl);ctx.fillStyle='#E6F7FF';rr(-8.8,-4.6,6.4,7,1.4);ctx.fill();rr(2.4,-4.6,6.4,7,1.4);ctx.fill();ctx.restore()}
function crowdBelow(t,p,o={}){ // looking down from the roof edge at the ring of staring Sleepers
  const r=mul(21);const cx=270,cy=o.cy??400;
  vgrad(0,H,[[0,'#0a1020'],[1,'#141c2e']]);ctx.fillStyle='rgba(255,255,255,.05)';for(let i=0;i<12;i++)ctx.fillRect(0,60+i*i*5+i*20,W,1.5);
  glow(cx,cy,320,'#6fb8ff',.18);
  const list=[];for(let ring=0;ring<5;ring++){const n=[34,48,62,78,96][ring],rx=[150,205,260,320,390][ring],ry=[78,108,136,168,205][ring];for(let i=0;i<n;i++){const a=i/n*6.283+ring*.37+r()*.1;list.push({x:cx+Math.cos(a)*rx,y:cy+Math.sin(a)*ry,s:.62+ring*.16+r()*.08,seed:ring*100+i})}}
  list.sort((a,b)=>a.y-b.y);for(const q of list)faceUp(q.x,q.y,q.s,q.seed,t);
  blk(cx-80,cy-40,160,80,6,'#070b14',{hi:.05});ctx.fillStyle=C.amb;ctx.fillRect(cx-8,cy-8,16,18);glow(cx,cy,60,C.amb,.35);
  dust(t,0,100,W,700,18,13,'#9fb4d8',.2,.5)}
SC.roof_edge=(t,u,d)=>{const p=u/d;let c=cam(p,{z0:1.16,z1:1.0,y0:-12,y1:10});c=shakeCam(c,t,.5,50);
  view(c,.9,()=>{crowdBelow(t,p,{cy:380})});
  view(c,1.25,()=>{ // parapet + your hands gripping it
    vgrad(790,1100,[[0,'#2a3044'],[1,'#10141e']]);blk(-60,790,W+120,60,6,'#3a4258',{hi:.2});rect(-60,786,W+120,8,'#4a5268');
    for(const sd of[-1,1]){const S=[270+sd*190,1060],Hd=[270+sd*96,806];limbT(S,Hd,90,40,C.must);ctx.save();ctx.translate(Hd[0],Hd[1]);blk(-26,-20,52,36,16,'#e0b48c',{hi:.2});ctx.restore()}
  })};
// ---------- 2. vote result card
SC.vote_result=(t,u,d)=>{const p=u/d;vgrad(0,H,[[0,'#0c1020'],[1,'#07090f']]);const g=ctx.createRadialGradient(270,420,0,270,420,520);g.addColorStop(0,'rgba(60,80,130,.35)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  ctx.textAlign='center';ctx.font='600 14px "JetBrains Mono"';ctx.letterSpacing='4px';ctx.fillStyle='#8A8F99';ctx.fillText('LAST EPISODE · YOUR VOTE',270,300);ctx.letterSpacing='0px';
  const a=EZ.ob(pr(p,.0,.35)),b=EZ.ob(pr(p,.12,.45));
  function bar(y,col,lab,letter,len,dim,delay){const q=EZ.ob(pr(p,delay,delay+.4));ctx.save();ctx.globalAlpha=(dim?.5:1)*clamp(q*1.5);ctx.translate(0,(1-q)*30);ctx.fillStyle='rgba(0,0,0,.4)';rr(54,y+8,432,96,20);ctx.fill();blk(50,y,432,96,20,'#161c30',{hi:.14});blk(64,y+14,68,68,14,col,{hi:.25});ctx.fillStyle=dim?'#fff':'#0A0D16';ctx.font='64px "Bebas Neue"';ctx.fillText(letter,98,y+66);ctx.fillStyle='#F4F4EF';ctx.textAlign='left';ctx.font='40px "Bebas Neue"';ctx.letterSpacing='2px';ctx.fillText(lab,152,y+50);
    ctx.fillStyle='rgba(255,255,255,.12)';rr(152,y+62,306,14,7);ctx.fill();ctx.fillStyle=col;rr(152,y+62,306*len*EZ.o3(pr(p,delay+.2,delay+.8)),14,7);ctx.fill();ctx.restore();ctx.textAlign='center';ctx.letterSpacing='0px'}
  bar(340,C.lime,'THE ROOF','A',.74,false,0);bar(470,C.red,'THE BASEMENT','B',.26,true,.1);
  const k=EZ.ob(pr(p,.45,.7));ctx.save();ctx.translate(446,388);ctx.scale(k,k);ctx.fillStyle=C.lime;ctx.beginPath();ctx.arc(0,0,22,0,7);ctx.fill();ctx.strokeStyle='#0A0D16';ctx.lineWidth=5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-9,0);ctx.lineTo(-2,8);ctx.lineTo(11,-9);ctx.stroke();ctx.restore();
  ctx.fillStyle=C.lime;ctx.font='600 15px "JetBrains Mono"';ctx.letterSpacing='3px';ctx.fillText('MOST OF YOU CHOSE A',270,640);ctx.letterSpacing='0px'};
// ---------- 3. running up the stairwell
function stairRun(t,u,d){const p=u/d;vgrad(0,H,[[0,'#06090f'],[1,'#0e1626']]);const vx=270,vy=250;const ph=(t*1.7)%1;
  // light at the top (roof door)
  glow(vx,vy,260,'#cfe3ff',.5);rect(vx-26,vy-34,52,60,'#e8f2ff');ctx.fillStyle='rgba(255,255,255,.2)';ctx.beginPath();ctx.moveTo(vx-26,vy+26);ctx.lineTo(vx-150,780);ctx.lineTo(vx+150,780);ctx.lineTo(vx+26,vy+26);ctx.fill();
  // side walls
  ctx.fillStyle='#10192d';ctx.beginPath();ctx.moveTo(-60,-60);ctx.lineTo(vx-60,vy-40);ctx.lineTo(vx-60,vy+70);ctx.lineTo(-60,1040);ctx.fill();ctx.beginPath();ctx.moveTo(600,-60);ctx.lineTo(vx+60,vy-40);ctx.lineTo(vx+60,vy+70);ctx.lineTo(600,1040);ctx.fill();
  ctx.fillStyle='#0a1222';ctx.beginPath();ctx.moveTo(-60,-60);ctx.lineTo(600,-60);ctx.lineTo(vx+60,vy-40);ctx.lineTo(vx-60,vy-40);ctx.fill();
  // steps scrolling toward the camera
  for(let k=0;k<11;k++){const dd=((k/11)+(1-ph)/11)%1;const e=Math.pow(dd,2.3);const y=vy+70+e*820,w=lerp(120,760,e),hh=lerp(6,60,e);ctx.fillStyle=mixc('#2a3a5a','#3d5280',e);ctx.fillRect(vx-w/2,y,w,hh);ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(vx-w/2,y+hh,w,hh*.8);ctx.fillStyle='rgba(255,255,255,.12)';ctx.fillRect(vx-w/2,y,w,Math.max(1,hh*.12))}
  // handrails
  ctx.strokeStyle='#5a6a8a';ctx.lineWidth=6;for(const sd of[-1,1]){ctx.beginPath();ctx.moveTo(vx+sd*70,vy+80);ctx.lineTo(vx+sd*330,900);ctx.stroke()}
  // runners: Reyes, DJ, Maya, you carrying Ollie (back views, run cycle in place)
  const RN=[{x:276,y:560,s:1.15,top:'#5b6b3c',k:0,hair:'#9aa0a8'},{x:262,y:640,s:1.45,top:'#a855f7',hood:true,k:1.6},{x:282,y:732,s:1.8,top:'#14b8a6',hairStyle:'long',hair:'#3a2a1a',k:3.1}];
  const run=(k)=>{const q=Math.sin(t*13+k),q2=Math.sin(t*13+k+Math.PI);return{bob:-Math.abs(q)*4,hL:Math.max(0,q)*26,hR:Math.max(0,q2)*26,kL:Math.max(0,q)*55,kR:Math.max(0,q2)*55,aL:30+q*30,aR:30+q2*30,eL:50,eR:50,lean:4}};
  for(const r of RN){person({x:r.x,y:r.y,s:r.s,top:r.top,back:true,hood:r.hood,hairStyle:r.hairStyle||'none',hair:r.hair||'#3a2a1a',shadow:.4,pose:run(r.k)})}
  // you carrying Ollie: he clings over your shoulder (his arms wrap your neck; your arms are in front of you, out of view)
  {const Y=you_back({x:270,y:905,s:2.5,noArms:true,pose:run(4.7)});person(Y);const sh=shoulderPts(Y,Y.pose);
   const O=ollieFront({x:322,y:800,s:1.3,noArms:true,eyes:'half',pose:{tilt:Math.sin(t*13)*3+6,bob:0}});person(O);const so=shoulderPts(O,O.pose);
   armIK(so[0],[sh[1][0]-18,sh[1][1]-26],{auto:.6,out:-1,down:true,w0:15,w1:9,col:'#cc3b3b'});armIK(so[1],[sh[1][0]+30,sh[1][1]+8],{auto:.6,out:1,down:true,w0:15,w1:9,col:'#cc3b3b'})}
  const fl=Math.sin(t*20)>.7?.08:0;ctx.fillStyle=`rgba(0,0,0,${.2+fl})`;ctx.fillRect(0,0,W,H)}
SC.stair_run=(t,u,d)=>{const p=u/d;ctx.save();const h=hand(t,1.2,60);ctx.translate(h.x*1.5,h.y*1.5);stairRun(t,u,d);ctx.restore()};
