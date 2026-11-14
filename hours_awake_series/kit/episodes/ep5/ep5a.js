// ============ EPISODE 5 — shared look + new pieces (test card first)
const SC={};
function vgr(y0,y1,a,b){const g=ctx.createLinearGradient(0,y0,0,y1);g.addColorStop(0,a);g.addColorStop(1,b);ctx.fillStyle=g;ctx.fillRect(-200,y0,W+400,y1-y0)}
function vig(a=.45,r0=200){const v=ctx.createRadialGradient(270,500,r0,270,500,660);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,`rgba(0,0,0,${a})`);ctx.fillStyle=v;ctx.fillRect(0,0,W,H)}
function zoomAt(cx,cy,z){ctx.translate(cx,cy);ctx.scale(z,z);ctx.translate(-cx,-cy)}
function figHead(who,hx,hy,s,p={}){const c=CAST[who];const kid=c.kid?1:0,teen=c.teen?1:0;const L=kid?.66:teen?.93:1,hs=kid?1.32:1;const hr=15*hs*L*(kid?1.08:1);const off=(-140*L-2)+(-hr-4)+(p.kneel?40*L:0);return fig(who,hx,hy-off*s,s,p)}
// ---- top-down: a kneeling Sleeper seen from above, head bowed toward (cx,cy)
function kneelTop(x,y,s,seed,cx,cy){const c=slpC(seed);const rot=Math.atan2(cy-y,cx-x)-Math.PI/2;ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.scale(s,s);
  oblob(0,-9,13,8,shade(c.top,-.15),2.2);            // folded legs/heels behind
  oblob(0,0,17,10,c.top,2.2);                        // shoulders + back
  for(const sd of[-1,1]){tube([[sd*14,2],[sd*11,12]],6.5,c.top,2.2);oblob(sd*10,14,3.6,3.4,K.slp,2.2)}   // forearms on the floor in front
  oblob(0,9,8,7.6,c.bald?K.slp:c.hair,2.2);ctx.restore()}       // bowed head, crown toward us
// ---- top-down: YOU lying on your back on the clinic floor, OLLIE asleep on your chest, your arms round his back.
// layers: floor -> your legs -> your torso + hood/head -> Ollie's legs + body -> his sleeping head (cheek on your chest) -> your arms + hands on his back
function lyingHug(x,y,s,o={}){ctx.save();ctx.translate(x,y);ctx.scale(s,s);const br=Math.sin((window.NOWT||0)*1.4)*1.2;
  for(const sd of[-1,1]){tube([[sd*9,40],[sd*12,120]],17,K.jeans,2.6/s*1.6);oblob(sd*13,126,8,11,'#1d2230',2.6/s*1.6)}
  orr(-34,-40+br*.3,68,90,26,K.must,2.6/s*1.6);                       // your torso (yellow)
  oblob(0,-62,27,22,shade(K.must,-.12),2.6/s*1.6);                      // hood around your head
  oblob(0,-60,19,20,K.skin,2.6/s*1.6);ctx.fillStyle='#4a3020';ctx.beginPath();ctx.ellipse(0,-72,19,10,0,Math.PI,0);ctx.fill();
  ctx.strokeStyle=OLc;ctx.lineWidth=1.6;ctx.lineCap='round';for(const sd of[-1,1]){ctx.beginPath();ctx.arc(sd*7,-58,3.6,.25,Math.PI-.25);ctx.stroke()}ctx.beginPath();ctx.moveTo(-3,-48);ctx.lineTo(3,-48);ctx.stroke();
  // Ollie: legs down your legs, body on your chest, head on your upper chest turned to his right (cheek down)
  for(const sd of[-1,1]){tube([[sd*6,20],[sd*8,66]],11,'#2f4a7a',2.6/s*1.6);oblob(sd*8,70,6,8,'#1d2230',2.6/s*1.6)}
  orr(-20,-26+br,40,52,16,K.red,2.6/s*1.6);
  sleepHeadTop(4,-30+br,1,o.tear||0);
  // your arms come from your shoulders round his back; hands flat on his back (back of the hand up, fingers toward the middle)
  for(const sd of[-1,1]){tube([[sd*30,-30],[sd*36,-6],[sd*16,6]],12,K.must,2.6/s*1.6);drawHand(sd*14,6,sd<0?-.15:Math.PI+.15,.55,'back',K.skin,2.6/s*1.6,{thumbToward:[0,-40]})}
  ctx.restore()}
// Ollie's head seen from above, cheek down on your chest, face turned toward camera-right: beanie, one closed eye, mouth
function sleepHeadTop(x,y,k,tear){ctx.save();ctx.translate(x,y);ctx.rotate(-.35);ctx.scale(k,k);oblob(0,0,15,14,K.skinO,2.2);
  shapeO(()=>{ctx.beginPath();ctx.ellipse(-4,-4,15,13,-.5,Math.PI*.9,Math.PI*1.95);ctx.closePath()},K.red,2.2);oblob(-14,-12,4.5,4.5,'#ff9a9a',2.2);
  ctx.strokeStyle=OLc;ctx.lineWidth=1.6;ctx.lineCap='round';ctx.beginPath();ctx.arc(5,1,3.4,.25,Math.PI-.25);ctx.stroke();ctx.beginPath();ctx.arc(-3,3,2.6,.3,Math.PI-.3);ctx.stroke();ctx.beginPath();ctx.moveTo(3,9);ctx.lineTo(6,9.5);ctx.stroke();
  if(tear>0){ctx.fillStyle='rgba(190,230,255,.95)';ctx.beginPath();ctx.ellipse(8,4+tear*7,1.3,2,0,0,7);ctx.fill()}ctx.restore()}
// ---- Ollie's small hand holding a red crayon like a pencil, writing. tip = crayon point (world).
// layers: paper -> crayon (behind the fingers) -> his curled fingers -> thumb over the crayon (front)
function crayonHand(tip,s,ang=-2.2){ctx.save();ctx.translate(tip[0],tip[1]);ctx.rotate(ang);ctx.scale(s,s);
  tube([[0,0],[6,0]],5,'#c0392b',2.2/s*1.4);orr(6,-4,44,8,2,'#d6453c',2.2/s*1.4);orr(14,-4.4,22,8.8,1,'#f1e3c0',1.4/s);ctx.fillStyle='#d6453c';ctx.font='bold 5px sans-serif';ctx.fillText('RED',18,2);
  tube([[52,-2],[66,-12]],12,K.red,2.2/s*1.4);                                    // sleeve cuff coming in
  union([{x:30,y:-1,rx:12,ry:10},{t:[[22,4],[16,7]],w:5.5},{t:[[26,6],[20,9.5]],w:5.5},{t:[[31,7],[26,10.5]],w:5.2}],K.skinO,2.2/s*1.4);   // curled fingers under/around
  tube([[30,-8],[22,-6],[14,-3]],5.6,K.skinO,2.2/s*1.4);                        // thumb on top of the crayon
  ctx.restore()}
// ---- the file on the next cot: manila folder, SUBJECT 0 stamp, polaroid of you at six holding young Maya's hand
function subjectFile(x,y,s,o={}){ctx.save();ctx.translate(x,y);ctx.rotate(o.rot??-.05);ctx.scale(s,s);
  ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(-88,-58,184,128);orr(-92,-70,70,16,4,'#d9b56d',2);orr(-92,-62,184,124,5,'#d9b56d',2);
  orr(-80,-52,100,108,2,'#f4f1e6',1.2);ctx.fillStyle='#555';for(let i=0;i<9;i++)ctx.fillRect(-72,-38+i*9,i%3==2?50:80,1.6);
  ctx.font='700 7px "JetBrains Mono"';ctx.fillStyle='#333';ctx.fillText('NAME:',-72,-43);ctx.fillStyle=o.nameCol||'#1b1e29';ctx.fillRect(-48,-48,56,7);    // your name line (see sheet: redacted strip by default)
  if(o.stamp!==false){ctx.save();ctx.translate(-30,30);ctx.rotate(-.18);ctx.strokeStyle='rgba(201,40,40,.9)';ctx.lineWidth=2.4;ctx.strokeRect(-36,-11,72,22);ctx.font='22px "Bebas Neue"';ctx.fillStyle='rgba(201,40,40,.92)';ctx.textAlign='center';ctx.fillText('SUBJECT 0',0,8);ctx.restore()}
  // polaroid, paper-clipped top right
  ctx.save();ctx.translate(52,-6);ctx.rotate(.08);orr(-34,-42,68,80,2,'#fbfaf4',1.6);ctx.save();ctx.beginPath();ctx.rect(-28,-36,56,58);ctx.clip();photoScene();ctx.restore();ctx.strokeStyle='#8a8f99';ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(-6,-48);ctx.lineTo(-6,-30);ctx.arc(-2,-30,4,Math.PI,0,true);ctx.lineTo(2,-44);ctx.stroke();ctx.restore();
  ctx.restore()}
// inside the photo (sepia): you at six (yellow hoodie, bandage behind the ear) holding a young nurse's hand (Maya, teal scrubs)
function photoScene(){vgr(-36,22,'#e9dcc0','#c9b48e');
  fig('maya',8,24,.36,{eyes:'open',mouth:'smile',look:-1,idle:false,shadow:false,o:1.6,arms:[{to:[-26,-86],pole:[-10,-120]},{}]});
  fig('you',-12,24,.36,{c:{kid:true},eyes:'open',mouth:'line',idle:false,shadow:false,o:1.6,arms:[{},{to:[24,-62],pole:[20,-88],hand:'relax'}],headExtra:(hy,hr,oo)=>{orr(hr*.75,hy-3,6,8,2,'#fff',oo*.6)}});
  ctx.fillStyle='rgba(150,110,60,.28)';ctx.fillRect(-30,-38,60,62)}
// ---- back of your head, hood pushed down: fingertips behind your right ear; the mark under them glows green
function earMark(x,y,s,glow){ctx.save();ctx.translate(x,y);ctx.scale(s,s);
  oblob(0,62,70,34,K.must,2.4/s*1.6);oblob(0,52,48,22,shade(K.must,-.14),2.4/s*1.6);       // shoulders + the hood bunched at the neck
  tube([[0,40],[0,20]],26,K.skin,2.4/s*1.6);
  oblob(0,0,36,40,'#4a3020',2.4/s*1.6);                                                    // back of the head, short dark-brown hair
  oblob(37,4,7,12,K.skin,2.4/s*1.6);ctx.strokeStyle='rgba(0,0,0,.25)';ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(37,4,4,-1.2,1.2);ctx.stroke();   // right ear
  ctx.fillStyle=K.skin;ctx.beginPath();ctx.ellipse(30,22,7,9,0,0,7);ctx.fill();          // bare skin behind the ear, below the hairline
  if(glow>0){glow&&glowMark(30,22,glow)}
  // your right hand comes up from below; index + middle fingertips land on the mark
  tube([[90,120],[52,54]],22,K.must,2.4/s*1.6);ctx.save();ctx.translate(52,54);ctx.rotate(Math.atan2(22-54,30-52)-Math.PI/2);union([{x:0,y:9,rx:9,ry:9},{t:[[-2.5,14],[-2.5,29]],w:4.6},{t:[[2.5,14],[2.5,30]],w:4.6},{t:[[7,6],[12,13]],w:5}],K.skin,2.4/s*1.6);ctx.restore();
  ctx.restore()}
function glowMark(x,y,g){ctx.save();ctx.globalCompositeOperation='lighter';const r=ctx.createRadialGradient(x,y,0,x,y,22);r.addColorStop(0,`rgba(74,222,128,${.9*g})`);r.addColorStop(1,'rgba(74,222,128,0)');ctx.fillStyle=r;ctx.fillRect(x-24,y-24,48,48);ctx.restore();
  ctx.fillStyle=`rgba(40,180,90,${.9*g})`;for(let i=0;i<5;i++)ctx.fillRect(x-5+i*2.3,y-4,i%2?.9:1.5,8)}
// ---- Ollie's closed eye, extreme close-up, a tear sliding out of the corner (k 0..1 = how far it has run)
function tearEye(x,y,s,k){ctx.save();ctx.translate(x,y);ctx.scale(s,s);rect(-80,-60,160,120,K.skinO);ctx.fillStyle='#b83236';ctx.fillRect(-80,-60,160,26);ctx.strokeStyle=OLc;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-80,-34);ctx.lineTo(80,-34);ctx.stroke();
  ctx.strokeStyle=OLc;ctx.lineWidth=3;ctx.lineCap='round';ctx.beginPath();ctx.arc(0,-2,22,.2,Math.PI-.2);ctx.stroke();for(let i=0;i<5;i++){const a=.45+i*.55;ctx.beginPath();ctx.moveTo(Math.cos(a)*22,-2+Math.sin(a)*22);ctx.lineTo(Math.cos(a)*27,-2+Math.sin(a)*27);ctx.stroke()}
  if(k>0){const ty=lerp(16,58,EZ.io(clamp(k)));ctx.strokeStyle='rgba(170,220,255,.5)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-21,14);ctx.quadraticCurveTo(-24,ty*.6,-23,ty-6);ctx.stroke();ctx.fillStyle='rgba(190,230,255,.95)';ctx.beginPath();ctx.ellipse(-23,ty,4,6,0,0,7);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(-24,ty-2,1.3,0,7);ctx.fill()}
  ctx.restore()}
// ============ TEST CARD
SC.card=(t)=>{rect(0,0,W,H,'#11141c');const P=[[0,0],[270,0],[0,320],[270,320],[0,640],[270,640]];const lab=['A  lying hug, top-down, ring kneels','B  crayon grip: thumb over, fingers round','C  SUBJECT 0 file + photo (you 6, Maya)','D  hood down: fingers on the mark','E  closed eye + tear','F  Ollie stands, eyes shut'];
  const panel=(i,fn)=>{const [px,py]=P[i];ctx.save();ctx.beginPath();ctx.rect(px+4,py+4,262,312);ctx.clip();ctx.translate(px,py);fn();ctx.restore();ctx.fillStyle='#000a';ctx.fillRect(px+4,py+292,262,24);ctx.font='600 11px "JetBrains Mono"';ctx.fillStyle='#fff';ctx.textAlign='left';ctx.fillText(lab[i],px+10,py+308)};
  panel(0,()=>{vgr(0,320,'#3a3a36','#24241f');const g=ctx.createRadialGradient(135,150,10,135,150,170);g.addColorStop(0,'rgba(255,200,130,.35)');g.addColorStop(1,'rgba(255,200,130,0)');ctx.fillStyle=g;ctx.fillRect(0,0,270,320);
    let k=0;for(const R of[88,122,156,190])for(let a=0;a<Math.PI*2;a+=24/R){k++;kneelTop(135+Math.cos(a)*R,150+Math.sin(a)*R*1.05,.62+R*.0005,k,135,150)}lyingHug(135,150,1.25)});
  panel(1,()=>{vgr(0,320,'#2a2620','#1a1712');ctx.save();ctx.translate(135,150);ctx.rotate(-.06);ctx.fillStyle='#f3eee2';ctx.fillRect(-110,-80,220,160);ctx.restore();const ps=crayon('BЯOTHEЯ',96,170,30,'#d6453c',{seed:5});crayonHand([180,166],1.7,-.8)});
  panel(2,()=>{vgr(0,320,'#e8e4da','#cfcabb');subjectFile(135,150,1.25)});
  panel(3,()=>{vgr(0,320,'#2c3a3c','#1c2628');earMark(125,140,1.35,1)});
  panel(4,()=>{vgr(0,320,'#2a2620','#1a1712');tearEye(135,150,1.4,.7)});
  panel(5,()=>{clinicBack(.6);for(let i=0;i<6;i++){const x=20+i*46;if(Math.abs(x-135)<40)continue;fig('sleeper',x,240,.95,{eyes:'closed',tilt:(x<135?6:-6),c:slpC(i),shadow:false})}fig('ollie',135,290,1.55,{eyes:'closed',mouth:'line',tilt:2})});
};
function clinicBack(w=1){vgr(0,320,'#2c3a3c','#1c2628');ctx.strokeStyle='rgba(255,255,255,.05)';for(let y=0;y<320;y+=24){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(540,y);ctx.stroke()}const g=ctx.createRadialGradient(135,200,10,135,200,160);g.addColorStop(0,`rgba(255,200,130,${.3*w})`);g.addColorStop(1,'rgba(255,200,130,0)');ctx.fillStyle=g;ctx.fillRect(0,0,540,320)}
