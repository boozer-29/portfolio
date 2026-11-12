// ============ EPISODE 4 — shared look ============
const SC={};
function vgr(y0,y1,a,b){const g=ctx.createLinearGradient(0,y0,0,y1);g.addColorStop(0,a);g.addColorStop(1,b);ctx.fillStyle=g;ctx.fillRect(-200,y0,W+400,y1-y0)}
function vig(a=.45,r0=200){const v=ctx.createRadialGradient(270,500,r0,270,500,660);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,`rgba(0,0,0,${a})`);ctx.fillStyle=v;ctx.fillRect(0,0,W,H)}
function zoomAt(cx,cy,z){ctx.translate(cx,cy);ctx.scale(z,z);ctx.translate(-cx,-cy)}
// light through closed eyelids. k = brightness (0 dark .. 1)
function redLids(t,k=1,seed=1){const hb=(Math.sin(t*2*Math.PI*1.1)>.92?.06:0);const g=ctx.createRadialGradient(270,460,30,270,470,640);g.addColorStop(0,`rgb(${Math.round(130*k+20)},${Math.round(26*k+4)},${Math.round(20*k+3)})`);g.addColorStop(.6,`rgb(${Math.round(60*k+10)},${Math.round(8*k+2)},${Math.round(6*k+2)})`);g.addColorStop(1,'#0b0101');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  ctx.strokeStyle=`rgba(255,90,70,${.10*k})`;ctx.lineWidth=2;const r=mul(seed);for(let i=0;i<10;i++){const y=r()*H;ctx.beginPath();ctx.moveTo(-20,y);ctx.bezierCurveTo(150,y+r()*80-40,330,y+r()*80-40,560,y+r()*60-30);ctx.stroke()}
  if(hb){ctx.fillStyle=`rgba(255,80,60,${hb*k})`;ctx.fillRect(0,0,W,H)}}
function nightSky(){vgr(0,H,'#0b1226','#1c2540');const r=mul(4);for(let i=0;i<90;i++){ctx.fillStyle=`rgba(255,255,255,${.2+r()*.5})`;ctx.fillRect(r()*W,r()*520,1.3,1.3)}ctx.fillStyle='#e8eefc';ctx.beginPath();ctx.arc(420,170,16,0,7);ctx.fill();const g=ctx.createRadialGradient(420,170,10,420,170,120);g.addColorStop(0,'rgba(200,215,255,.25)');g.addColorStop(1,'rgba(200,215,255,0)');ctx.fillStyle=g;ctx.fillRect(280,40,280,260)}
function flatSkyline(base,col,seed,lit=.15){const r=mul(seed);let x=-30;while(x<W+30){const w=40+r()*60,h=120+r()*220;ctx.fillStyle=col;ctx.fillRect(x,base-h,w,h+400);for(let yy=base-h+12;yy<base-10;yy+=22)for(let xx=x+8;xx<x+w-10;xx+=16)if(r()<lit){ctx.fillStyle='rgba(230,190,110,.8)';ctx.fillRect(xx,yy,7,10);ctx.fillStyle=col}x+=w+3}}
// a grey face looking up (front, eyes shut) — used for crowds seen from above
function upFace(x,y,s,seed){const c=slpC(seed);ctx.save();ctx.translate(x,y);ctx.scale(s,s);oblob(0,10,16,9,c.top,2.2);oblob(0,0,11,11.5,K.slp,2.2);ctx.fillStyle=c.hair;ctx.beginPath();ctx.ellipse(0,-6,10,5,0,Math.PI,0);ctx.fill();ctx.strokeStyle=OLc;ctx.lineWidth=1.4;for(const sd of[-1,1]){ctx.beginPath();ctx.arc(sd*4,1,2.2,.3,Math.PI-.3);ctx.stroke()}ctx.restore()}
// top-down person: shoulders + head
function topDown(x,y,s,col,hair,rot=0,o={}){ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.scale(s,s);if(o.arms){const sw=o.swing||0;for(const sd of[-1,1]){const k=sd*sw*5;tube([[sd*15,0],[sd*17,8-k],[sd*15,15-k*1.6]],7,col,2.2/s*1.0);oblob(sd*15,16-k*1.6,3.4,3.4,o.skin||(o.hood?K.skin:K.slp),2.2/s)}}oblob(0,0,17,9,col,2.2);if(o.hood){oblob(0,-1,10,10,shade(col,-.1),2.2)}else{oblob(0,-1,8.5,9,hair,2.2)}if(o.phones){ctx.strokeStyle='#2b2f3a';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,3,10,.2,Math.PI-.2);ctx.stroke()}ctx.restore()}
// figure head close-up helper: draw fig so the head centre lands at (hx,hy)
function figHead(who,hx,hy,s,p={}){const c=CAST[who];const kid=c.kid?1:0,teen=c.teen?1:0;const L=kid?.66:teen?.93:1,hs=kid?1.32:1;const hr=15*hs*L*(kid?1.08:1);const off=(-140*L-2)+(-hr-4)+(p.kneel?40*L:0);return fig(who,hx,hy-off*s,s,p)}
function thumbDev(base,tip,w,col,o){ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.lineCap='round';ctx.strokeStyle=OLc;ctx.lineWidth=w+2*o;ctx.beginPath();ctx.moveTo(base.x,base.y);ctx.lineTo(tip.x,tip.y);ctx.stroke();ctx.strokeStyle=col;ctx.lineWidth=w;ctx.stroke();ctx.restore()}
function devPt(x,y){return ctx.getTransform().transformPoint(new DOMPoint(x,y))}
function stamp(txt,t,t0,y,col,size){const q=t-t0;if(q<0)return;const k=EZ.ob(clamp(q/.18));ctx.save();ctx.translate(270,y);ctx.scale(k*(1+.05*Math.max(0,1-q*6)),k);ctx.rotate(-.02);ctx.font=`${size}px "Bebas Neue"`;ctx.letterSpacing='2px';ctx.textAlign='center';ctx.shadowColor='rgba(0,0,0,.7)';ctx.shadowBlur=14;ctx.shadowOffsetY=4;ctx.fillStyle=col;ctx.fillText(txt,0,0);ctx.restore()}

// ============ 1. blind open: a face 10 cm away, then dozens
SC.blind_open=(t,u,d)=>{const p=u/d;const many=t>=CU.W.a1[3][1]-.05;redLids(t,1,3);
  ctx.save();zoomAt(270,430,lerp(1.0,1.08,EZ.io(p)));
  if(many){ctx.save();ctx.filter='blur(5px)';ctx.globalAlpha=.6;const r=mul(12);for(let i=0;i<14;i++){const x=r()*W,y=150+r()*560,s=1.1+r()*1.1;if(Math.abs(x-270)<120&&y<620)continue;figHead('sleeper',x,y,s,{eyes:'closed',tilt:(r()-.5)*24,arms:[{none:true},{none:true}],c:Object.assign(slpC(i),{top:'#2a0a08'})})}ctx.restore()}
  ctx.save();ctx.filter='blur(1.2px)';figHead('sleeper',270,400,6.2,{eyes:'closed',tilt:-6,mouth:'line',arms:[{none:true},{none:true}],c:{top:'#3a0d0a'}});ctx.restore();
  ctx.restore();ctx.fillStyle='rgba(120,0,0,.22)';ctx.fillRect(0,0,W,H);
  // your breath rings at the bottom edge, small and slow
  for(let i=0;i<3;i++){const ph=(t*.5+i/3)%1;ctx.strokeStyle=`rgba(255,200,190,${.28*(1-ph)})`;ctx.lineWidth=2;ctx.beginPath();ctx.arc(270,960,40+ph*120,Math.PI*1.15,Math.PI*1.85);ctx.stroke()}
  vig(.55,180)};
// ============ 2. back on the roof: the vote result
function roofNight(t){nightSky();flatSkyline(560,'#152038',7,.12);flatSkyline(600,'#1b2742',9,.06);vgr(600,H,'#2b3247','#141824');ctx.fillStyle='#3a4258';ctx.fillRect(-10,596,W+20,10);ctx.strokeStyle=OLc;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-10,596);ctx.lineTo(W+10,596);ctx.stroke()}
SC.roof_stamp=(t,u,d)=>{const p=u/d;ctx.save();zoomAt(270,700,lerp(1.0,1.05,EZ.io(p)));roofNight(t);
  QA_SHOT='roof_stamp';
  fig('reyes',110,812,1.45,{eyes:'open',brow:'angry',look:1,arms:[{},{}]});
  fig('maya',205,820,1.38,{eyes:'open',brow:'worry',look:1,mouth:'sad'});
  fig('dj',445,816,1.34,{eyes:'open',brow:'worry',look:-1,mouth:'line'});
  // you, from behind, the walkie raised to your ear (right hand); left arm hangs
  fig('you',300,955,1.9,{back:true,arms:[{},{to:[22,-176],pole:[34,-140],raise:true,hand:'grip',thumbToward:[0,-200]}],propFront:(A,g)=>{const T=A[1].T;toyWalkie(T[0]+2,T[1]-6,.42,g.oo,.5)}});
  ctx.restore();
  stamp('91% OF YOU WENT BACK FOR HIM.',t,CU.stampT[0],330,'#F4F4EF',38);stamp('HE WAS SAFE UNTIL YOU DID.',t,CU.W.b1[4][1]-.1,398,K.red,44);vig(.4)};
// ============ 3/4. your thumb on the walkie, his answer
// your hand holding the toy walkie, at any size (k=4.6 is the close-up). fingers wrap the left edge, thumb on the front button
function walkieHeld(wx,wy,k,o){const f=k/4.6;const S=o.S||[wx+314*f,wy+630*f];
  fpArm(S,[wx+30*f,wy+120*f],{w:62*f,k:3.4*f,hand:'grip',thumbToward:[wx-80*f,wy],pole:o.pole||[S[0]+100*f,S[1]-220*f],L1:300*f,L2:300*f,o:2.8});
  toyWalkie(wx,wy,k,2.8,o.led,0,o.press);
  for(let i=0;i<4;i++)tube([[wx-13*k+8*f,wy+(6+i*25)*f],[wx-13*k-7*f,wy+(10+i*25)*f]],19*f,shade(K.skin,-.06),2.8);
  const base=[wx+13*k-4*f,wy+44*f],tip=o.thumbOff?[wx+13*k-6*f,wy+12*f]:[wx+4*f,wy+(11*k-1)+o.press*2*f];
  tube([base,[lerp(base[0],tip[0],.55),lerp(base[1],tip[1],.55)+6*f],tip],22*f,K.skin,2.8);
  const len=Math.hypot(tip[0]-base[0],tip[1]-base[1]);if(len>75*f)qaFlag('thumb too long '+len.toFixed(0));return{wx,wy,k}}
function walkieClose(t,o){vgr(0,H,'#151b2e','#090c16');ctx.save();ctx.filter='blur(8px)';roofNight(t);ctx.restore();ctx.fillStyle='rgba(8,10,20,.55)';ctx.fillRect(0,0,W,H);
  QA_SHOT=QA_SHOT||'walkie';return walkieHeld(286,470,4.6,o)}
SC.you_tap=(t,u,d)=>{QA_SHOT='you_tap';let press=0;for(const x of CU.tapsYou){const a=t-x;if(a>=0&&a<.12)press=1}const w=walkieClose(t,{led:.25,press});
  for(const x of CU.tapsYou){const a=t-x;if(a>0&&a<.6){ctx.strokeStyle=`rgba(255,255,255,${.6*(1-a/.6)})`;ctx.lineWidth=3;ctx.beginPath();ctx.arc(w.wx,w.wy+11*w.k,30+a*220,0,7);ctx.stroke()}}vig(.5)};
SC.tap_back=(t,u,d)=>{QA_SHOT='tap_back';let led=.15;for(const x of CU.tapsBack){const a=t-x;if(a>=0&&a<.09)led=1}const w=walkieClose(t,{led,press:0,thumbOff:true});
  for(const x of CU.tapsBack){const a=t-x;if(a>0&&a<.7){ctx.strokeStyle=`rgba(74,222,128,${.55*(1-a/.7)})`;ctx.lineWidth=3;ctx.beginPath();ctx.arc(w.wx+8*w.k,w.wy-14*w.k,20+a*260,0,7);ctx.stroke()}}
  if(t>CU.tapsBack[0]){ctx.save();ctx.globalAlpha=.18;ctx.fillStyle='#fff';for(let i=0;i<20;i++){const r=mul(Math.floor(t*30)*5+i);ctx.fillRect(r()*W,r()*H,r()*90,2)}ctx.restore()}vig(.5)};
// ============ 5. Reyes lunges: front view, he throws his left arm at the walkie in YOUR hand (foreground, bottom right).
// layers: night roof -> Reyes body -> his reaching arm + open hand (red crayon tips) -> your hand + walkie (nearest)
SC.reyes_lunge=(t,u,d)=>{QA_SHOT='reyes_lunge';const ls=CU.lines.c1.s;const go=EZ.o3(pr(t,ls-.05,ls+.5));const jolt=t>ls&&t<ls+.35?Math.sin((t-ls)*60)*2.5*(1-pr(t,ls,ls+.35)):0;
  ctx.save();ctx.translate(jolt,0);zoomAt(270,560,lerp(1.0,1.1,go));roofNight(t);
  const fx=lerp(222,236,go),fy=lerp(930,948,go),s=lerp(2.7,3.0,go);
  const tgt=[lerp(310,336,go),lerp(700,672,go)];const loc=[(tgt[0]-fx)/s,(tgt[1]-fy)/s];
  fig('reyes',fx,fy,s,{eyes:'wide',brow:'angry',mouth:'grit',lean:lerp(0,5,go),look:1,
    arms:[{},{to:loc,pole:[44,-130],hand:'open',hk:lerp(.95,1.45,go),spread:lerp(.8,1.25,go),tips:'rgba(201,56,47,.92)',thumbToward:[0,-170],wrist:-10}]});
  ctx.restore();
  walkieHeld(466,826,2.2,{led:.2,press:0,S:[630,1080],pole:[650,880]});vig(.45)};
// ============ 6. Maya stops him. Side view of his forearm (from the left, reaching down-right toward the walkie).
// Maya's hand comes from the upper right and closes on it: her fingers go over the FAR side (hidden, only the tips peek
// under the lower edge), the back of her hand sits on top, her thumb lies across the NEAR side (in front of the sleeve).
SC.maya_grip=(t,u,d)=>{QA_SHOT='maya_grip';const g0=EZ.o3(pr(t,CU.lines.c2.s-.05,CU.lines.c2.s+.32));vgr(0,H,'#151b2e','#0a0d18');ctx.save();ctx.filter='blur(7px)';roofNight(t);ctx.restore();ctx.fillStyle='rgba(8,10,20,.5)';ctx.fillRect(0,0,W,H);
  ctx.save();zoomAt(270,480,lerp(1,1.05,EZ.io(u/d)));
  const pull=g0*14;const A=[-60,330-pull*.5],B=[392-pull,592-pull*.6],R=31;const strain=Math.sin(t*34)*1.4*g0;const dir=Math.atan2(B[1]-A[1],B[0]-A[0]);const ux=Math.cos(dir),uy=Math.sin(dir);let nx=-uy,ny=ux;if(ny>0){nx=-nx;ny=-ny}
  const G=[lerp(A[0],B[0],.56),lerp(A[1],B[1],.56)];const come=1-g0;const off=[come*70,-come*150];const at=(al,nn)=>[G[0]+ux*al+nx*nn+off[0],G[1]+uy*al+ny*nn+off[1]];
  // 1) her fingertips: drawn BEFORE his sleeve, so only the curled tips below its lower edge show
  if(g0>.55){const P=[];for(let i=0;i<4;i++){const al=(i-1.5)*15;P.push({t:[at(al,R*.2),at(al,-R-lerp(0,9,pr(g0,.55,1)))],w:14})}union(P,shade(K.skinM,-.08),2.8)}
  // 2) his forearm and open hand (red crayon on the fingertips)
  tube([A,[B[0]+strain,B[1]]],R*2,K.olive,2.8);ctx.strokeStyle=shade(K.olive,-.25);ctx.lineWidth=2;for(const k of[.3,.7]){const q=[lerp(A[0],B[0],k),lerp(A[1],B[1],k)];ctx.beginPath();ctx.moveTo(q[0]+nx*R*.7,q[1]+ny*R*.7);ctx.quadraticCurveTo(q[0]+ux*8,q[1]+uy*8,q[0]-nx*R*.5,q[1]-ny*R*.5);ctx.stroke()}
  {const q=[B[0]+strain-ux*16,B[1]-uy*16];tubeF([[q[0]+nx*(R-3),q[1]+ny*(R-3)],[q[0]-nx*(R-3),q[1]-ny*(R-3)]],7,shade(K.olive,-.3))}
  drawHand(B[0]+strain+ux*4,B[1]+uy*4,dir,3.0,'open',K.skinR,2.8,{thumbToward:[B[0]+60,B[1]-80],spread:1.05,tips:'rgba(201,56,47,.92)'});
  // 3) her teal sleeve from the upper right, then the back of her hand on top of his arm
  const Wr=at(30,R+30);tube([[640,40],Wr],46,K.teal,2.8);
  oblob(...at(2,R-2),31,21,K.skinM,2.8,dir);ctx.strokeStyle='rgba(0,0,0,.2)';ctx.lineWidth=2;ctx.beginPath();const k1=at(-18,R-8),k2=at(20,R-14);ctx.moveTo(...k1);ctx.quadraticCurveTo(...at(0,R-4),...k2);ctx.stroke();
  // 4) her thumb across the near side of his sleeve (in front)
  if(g0>.4){const c=pr(g0,.4,1);tube([at(16,R-6),at(lerp(14,12,c),lerp(R-12,R*.05,c)),at(lerp(12,4,c),lerp(R-16,-R*.5,c))],15,K.skinM,2.8);
    if(c>.8){ctx.strokeStyle='rgba(0,0,0,.22)';ctx.lineWidth=2;for(const al of[-34,40]){const q=at(al,0);ctx.beginPath();ctx.arc(q[0],q[1],7,dir-.6,dir+.6);ctx.stroke()}}}
  ctx.restore();vig(.5)};
