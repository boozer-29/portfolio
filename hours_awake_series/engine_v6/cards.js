function bg(a,b){const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,a);g.addColorStop(1,b);ctx.fillStyle=g;ctx.fillRect(0,0,W,H)}
function title(t,sub){ctx.font='700 30px "Bebas Neue"';ctx.textAlign='left';ctx.fillStyle='#F4F4EF';ctx.letterSpacing='2px';ctx.fillText(t,24,52);ctx.letterSpacing='0px';if(sub){ctx.font='600 11px "JetBrains Mono"';ctx.fillStyle='#8A8F99';ctx.fillText(sub,24,72)}}
function thumbFront(x,y,ang,k,skin,o,len=11){ctx.save();ctx.translate(x,y);ctx.rotate(ang);ctx.scale(k,k);tube([[0,0],[0,len]],5.4,skin,o/k);ctx.restore()}
// shotgun across Reyes' chest, both hands on it
function reyesGun(SH,arms,g){}
function card1(){bg('#1a2135','#0c1020');title('CAST · OUTLINED STYLE','one style, same proportions every episode · one pair of arms each');
  const floor=(y)=>{ctx.fillStyle='rgba(255,255,255,.05)';ctx.fillRect(0,y,W,2)};
  const s=1.12,y1=430,y2=760;floor(y1+4);floor(y2+4);
  // YOU front
  fig('you',72,y1,s,{eyes:'open',mouth:'line'});label('YOU',72,y1+30,12);
  // YOU back
  fig('you',182,y1,s,{back:true});label('YOU · BACK',182,y1+30,12);
  // OLLIE holding walkie in both hands: fingers behind the walkie, thumbs in front
  fig('ollie',288,y1,s,{eyes:'open',mouth:'smile',hands:[[-8,-60],[8,-60]],hk:['none','none'],propLast:true,
    prop:(SH,arms,g)=>{const T=arms.map(a=>a.T);for(let i=0;i<2;i++)hand(T[i][0],T[i][1]-3,i?.5:-.5,.62,'relax','#D9A57A',g.oo,{flip:i==0});walkie(0,T[0][1]+3,.5,g.oo,.8);for(let i=0;i<2;i++)thumbFront(T[i][0]+(i?-1.5:1.5),T[i][1]-1,i?1.0:-1.0,.6,'#D9A57A',g.oo,9)}});
  label('OLLIE · 8',288,y1+30,12);
  // REYES with shotgun held across the body
  fig('reyes',402,y1,s,{eyes:'open',hands:[[-26,-106],[12,-86]],hk:['fist','fist'],bend:[-1,1],armsBehind:[false,false],
    prop:(SH,arms,g)=>{tube([[-46,-118],[20,-79]],6.5,'#2a2d36',g.oo);tube([[8,-86],[34,-70]],11,'#6b4a2a',g.oo)}});
  label('REYES',402,y1+30,12);
  // MAYA with tablet (fingers behind, thumbs over the edge)
  fig('maya',90,y2,s,{eyes:'open',mouth:'line',hands:[[-17,-100],[17,-100]],hk:['none','none'],
    prop:(SH,arms,g)=>{const T=arms.map(a=>a.T);for(let i=0;i<2;i++)hand(T[i][0],T[i][1],0,.95,'relax','#C88E66',g.oo,{flip:i==0});rrect(-20,-116,40,30,4,'#16223d',g.oo);ctx.fillStyle='#8cd5ff';ctx.fillRect(-16,-112,32,22);ctx.fillStyle='#e5484d';ctx.beginPath();ctx.arc(8,-98,2.2,0,7);ctx.fill();for(let i=0;i<2;i++)thumbFront(T[i][0]+(i?-1:1),T[i][1]-4,i?.9:-.9,.95,'#C88E66',g.oo,10)}});
  label('MAYA',90,y2+30,12);
  // DJ, 16, headphones on
  fig('dj',196,y2,s,{eyes:'open',mouth:'line'});label('DJ · 16',196,y2+30,12);
  // SLEEPERS
  fig('sleeper',300,y2,s,{eyes:'closed',tilt:13,lean:4,hands:[[-24,-74],[24,-74]]});label('SLEEPER',300,y2+30,12);
  fig('sleeper',410,y2,s,{eyes:'closed',tilt:20,lean:10,kneel:true,hands:[[-20,-46],[20,-46]],c:{top:'#7d6f66'}});label('SLEEPER · KNEEL',410,y2+30,12);
  // notes
  ctx.font='600 11px "JetBrains Mono"';ctx.textAlign='left';ctx.fillStyle='#8A8F99';
  ['• thick outline, round joints: limbs can never detach','• held props: fingers BEHIND the object, thumb in front','• kid proportions for Ollie (bigger head, shorter limbs)','• sleepers: grey skin, eyes shut, dark rings, head tilt'].forEach((t,i)=>ctx.fillText(t,24,840+i*18))}
function panel(x,y,w,h,t){ctx.save();ctx.beginPath();ctx.roundRect(x,y,w,h,14);ctx.clip();const g=ctx.createLinearGradient(0,y,0,y+h);g.addColorStop(0,'#2a3350');g.addColorStop(1,'#151b2c');ctx.fillStyle=g;ctx.fillRect(x,y,w,h);return()=>{ctx.restore();ctx.strokeStyle='rgba(255,255,255,.12)';ctx.lineWidth=1.5;ctx.beginPath();ctx.roundRect(x,y,w,h,14);ctx.stroke();ctx.font='700 11px "JetBrains Mono"';ctx.textAlign='left';ctx.fillStyle='#C6F432';ctx.fillText(t,x+10,y+18)}}
function card2(){bg('#141a2a','#0a0d16');title('HANDS & GRIPS','fingers stay attached · contact decides what is in front');
  const o=2.8,sk=C.skin;
  // (a) side view: palm on top, fingers over the FAR edge (behind the board; only the tips curl out below), thumb on the near face
  {const end=panel(16,92,248,250,'A · GRIP THE PLANK (SIDE)');ctx.save();ctx.translate(140,236);ctx.scale(3,3);const oo=o/3;
    union([0,1,2].map(i=>({t:[[-6+i*5,-6],[-7+i*5,8],[-4+i*5,11.5]],w:4.4})),shade(sk,-.15),oo);        // fingers: behind the plank
    rrect(-46,-5,92,12,2,'#9a7444',oo);ctx.fillStyle='rgba(255,255,255,.18)';ctx.fillRect(-46,-5,92,2.6);ctx.fillStyle='rgba(0,0,0,.12)';for(let x=-40;x<46;x+=13)ctx.fillRect(x,0,8,1);  // the plank's near face
    tube([[-36,-38],[-4,-14]],11,C.must,oo);                                                              // forearm + sleeve
    union([{x:0,y:-10,rx:10.5,ry:6.5},{t:[[-7,-8],[-9,4]],w:5}],sk,oo);                                    // palm on top + thumb down the near face
    ctx.restore();ctx.font='600 10px "JetBrains Mono"';ctx.fillStyle='#8A8F99';ctx.textAlign='left';ctx.fillText('fingertips curl under, out of sight',28,330);end()}
  // (b) first-person plank crawl: hands on the top face, fingers curl over the OUTER edges and down the side
  {const end=panel(276,92,248,250,'B · PLANK, FIRST PERSON');ctx.save();
    const top=[[340,330],[460,330],[420,120],[380,120]];ctx.fillStyle='#9a7444';ctx.beginPath();ctx.moveTo(332,342);ctx.lineTo(468,342);ctx.lineTo(424,120);ctx.lineTo(376,120);ctx.closePath();ctx.fill();ctx.strokeStyle=OL;ctx.lineWidth=o*2;ctx.stroke();
    ctx.fillStyle='#6b4f2c';ctx.beginPath();ctx.moveTo(332,342);ctx.lineTo(468,342);ctx.lineTo(468,356);ctx.lineTo(332,356);ctx.fill();
    for(const sd of[-1,1]){const ex=sd<0?346:454,ey=262;
      // fingers drawn first so the plank's side face could cover their tips; they wrap over the outer edge
      ctx.save();ctx.translate(ex,ey);ctx.scale(sd,1);union([0,1,2,3].map(i=>({t:[[-6,-10+i*6.2],[-13,-9+i*6.2],[-16,-5+i*6.2]],w:5.2})),shade(sk,-.08),o);ctx.restore();
      // palm + thumb on the top face, sleeve from below
      tube([[ex+sd*-30,346],[ex+sd*4,ey+16]],22,C.must,o);ctx.save();ctx.translate(ex,ey);ctx.scale(sd,1);union([{x:2,y:2,rx:12,ry:13},{t:[[6,8],[14,0]],w:6}],sk,o);ctx.restore()}
    ctx.restore();end()}
  // (c) small hand tapping your open palm
  {const end=panel(16,354,248,250,'C · HIS TAP ON YOUR PALM');ctx.save();
    tube([[20,600],[110,500]],26,C.must,o);hand(110,500,-2.4+Math.PI,2.2,'palmUp',sk,o,{flip:true,spread:.8});
    tube([[262,380],[176,454]],15,C.red,o);hand(176,454,0.85,1.5,'point','#D9A57A',o,{flip:true});
    for(let i=0;i<3;i++){ctx.strokeStyle=`rgba(255,226,170,${.6-i*.18})`;ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(146,492,14+i*12,0,7);ctx.stroke()}
    ctx.restore();end()}
  // (d) fingertips reading the raised B1 on the door plate
  {const end=panel(276,354,248,250,'D · FINGERTIPS FIND “B1”');ctx.save();
    ctx.fillStyle='#3a4258';ctx.fillRect(276,374,248,230);rrect(330,430,140,90,8,'#b9bcc6',o);ctx.font='900 54px Montserrat';ctx.textAlign='center';ctx.fillStyle='rgba(0,0,0,.25)';ctx.fillText('B1',402,497);ctx.fillStyle='#d9dce4';ctx.fillText('B1',400,494);
    tube([[520,620],[430,520]],24,C.must,o);hand(430,520,2.45,1.9,'point',sk,o);
    ctx.restore();end()}
  // (e) gripping a ladder rung, seen from behind: fingers over the top and BEHIND the rung, back of hand in front
  {const end=panel(16,616,248,250,'E · LADDER RUNG (FROM BEHIND)');ctx.save();
    for(const x of[60,220]){rrect(x-6,616,12,250,4,'#59607a',o)}
    const rungY=740;
    for(const sd of[-1,1]){const hx=140+sd*42;tube([[hx+sd*10,870],[hx,rungY+16]],20,C.must,o);ctx.save();ctx.translate(hx,rungY);ctx.scale(sd,1);union([0,1,2,3].map(i=>({t:[[-9+i*6,-4],[-9+i*6,-12],[-8+i*6,-9]],w:5.4})),shade(sk,-.12),o);ctx.restore()}
    rrect(54,rungY-5,172,12,5,'#7a8199',o);
    for(const sd of[-1,1]){const hx=140+sd*42;ctx.save();ctx.translate(hx,rungY);ctx.scale(sd,1);union([{x:0,y:12,rx:13,ry:12},{t:[[-11,10],[-16,1]],w:6}],sk,o);ctx.restore()}
    ctx.restore();end()}
  // (f) Reyes' open hand held out to you, red crayon on the fingertips
  {const end=panel(276,616,248,250,'F · REYES HOLDS OUT HIS HAND');ctx.save();
    tube([[300,880],[396,778]],28,C.olive,o);hand(400,770,Math.PI,2.5,'open',C.skinR,o,{spread:.9});
    ctx.fillStyle='rgba(201,56,47,.85)';ctx.globalAlpha=.75;for(const [x,y,r] of[[386,712,.2],[397,706,-.1],[409,708,.1],[421,716,.3]]){ctx.beginPath();ctx.ellipse(x,y,4.5,9,r,0,7);ctx.fill()}ctx.beginPath();ctx.ellipse(404,746,10,5,.4,0,7);ctx.fill();ctx.globalAlpha=1
    ctx.restore();end()}
  ctx.font='600 11px "JetBrains Mono"';ctx.textAlign='left';ctx.fillStyle='#8A8F99';['• every hand is one outlined shape: palm, fingers, thumb, wrist','• two passes for anything held: fingers behind, palm/thumb in front'].forEach((t,i)=>ctx.fillText(t,24,900+i*18))}
function card3(){ // the blind walk: red light through your eyelids, a pale face 10 cm away
  const g=ctx.createRadialGradient(270,470,40,270,470,620);g.addColorStop(0,'#7a1a14');g.addColorStop(.55,'#3a0806');g.addColorStop(1,'#120202');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='rgba(255,90,70,.12)';ctx.lineWidth=2;for(let i=0;i<9;i++){ctx.beginPath();ctx.moveTo(-20,120+i*95);ctx.bezierCurveTo(150,90+i*95+40,330,150+i*95-30,560,110+i*95);ctx.stroke()}
  // far faces (blurred), then one face very close
  ctx.save();ctx.filter='blur(6px)';ctx.globalAlpha=.55;for(const [x,y,s] of[[70,520,1.2],[460,560,1.3],[130,250,.9],[420,260,.95],[250,640,.8]])fig('sleeper',x,y+190*s,s*1.4,{eyes:'closed',tilt:12,shadow:false,c:{top:'#2a0a08',bot:'#1a0505'}});ctx.restore();
  ctx.save();ctx.filter='blur(1.4px)';ctx.globalAlpha=.92;fig('sleeper',300,1260,5.2,{eyes:'closed',tilt:-8,shadow:false,c:{top:'#3a0d0a',skin:'#d9c9c6'}});ctx.restore();
  ctx.fillStyle='rgba(120,0,0,.28)';ctx.fillRect(0,0,W,H);
  // NOISE meter: your breathing, must stay at 0
  rrect(24,104,150,46,10,'rgba(0,0,0,.55)',0);ctx.font='700 11px "JetBrains Mono"';ctx.textAlign='left';ctx.fillStyle='#ffb4a8';ctx.fillText('YOUR BREATH',36,122);ctx.font='700 22px "JetBrains Mono"';ctx.fillStyle='#fff';ctx.fillText('NOISE 0 dB',36,144);
  for(let i=0;i<3;i++){ctx.strokeStyle=`rgba(255,200,190,${.35-i*.1})`;ctx.lineWidth=2;ctx.beginPath();ctx.arc(270,880,30+i*26,Math.PI*1.15,Math.PI*1.85);ctx.stroke()}
  ctx.font='900 34px Montserrat';ctx.textAlign='center';ctx.lineWidth=6;ctx.strokeStyle='rgba(0,0,0,.4)';ctx.strokeText('WITH YOUR EYES',270,690);ctx.fillStyle='#fff';ctx.fillText('WITH YOUR EYES',270,690);ctx.fillStyle=C.lime;ctx.strokeText('CLOSED',270,732);ctx.fillText('CLOSED',270,732)}
window.draw=(n)=>{ctx.setTransform(2,0,0,2,0,0);ctx.clearRect(0,0,W,H);({1:card1,2:card2,3:card3})[n]()};
