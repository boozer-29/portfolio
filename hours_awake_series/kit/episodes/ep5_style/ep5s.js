// ============ STYLE TEST (option A): dark cinematic rooms, one light source, haze; small thin figures
const SC={};
function vgr(y0,y1,a,b){const g=ctx.createLinearGradient(0,y0,0,y1);g.addColorStop(0,a);g.addColorStop(1,b);ctx.fillStyle=g;ctx.fillRect(-400,y0,W+800,y1-y0)}
function vig(a=.45,r0=200){const v=ctx.createRadialGradient(270,500,r0,270,500,660);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,`rgba(0,0,0,${a})`);ctx.fillStyle=v;ctx.fillRect(0,0,W,H)}
// ---- LIGHT: everything is drawn lit, then multiplied by a light map (ambient + light sources) in the same camera transform
const LMc=document.createElement('canvas');LMc.width=1080;LMc.height=1920;const LMx=LMc.getContext('2d');
function lightPass(ambient,lights){const m=ctx.getTransform();LMx.setTransform(1,0,0,1,0,0);LMx.globalCompositeOperation='source-over';LMx.fillStyle=ambient;LMx.fillRect(0,0,1080,1920);LMx.setTransform(m);LMx.globalCompositeOperation='lighter';
  for(const L of lights){LMx.save();if(L.sy){LMx.translate(L.x,L.y);LMx.scale(1,L.sy);LMx.translate(-L.x,-L.y)}const g=LMx.createRadialGradient(L.x,L.y,0,L.x,L.y,L.r);g.addColorStop(0,L.c);g.addColorStop(L.k??.45,L.c2||L.c.replace(/[\d.]+\)$/,m_=>(parseFloat(m_)*.45)+')'));g.addColorStop(1,'rgba(0,0,0,0)');LMx.fillStyle=g;LMx.fillRect(L.x-L.r,L.y-L.r,2*L.r,2*L.r);LMx.restore()}
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalCompositeOperation='multiply';ctx.drawImage(LMc,0,0);ctx.restore()}
function beamCone(x,y,x0,x1,yb,col,a){ctx.save();ctx.globalCompositeOperation='screen';const g=ctx.createLinearGradient(0,y,0,yb);g.addColorStop(0,`rgba(${col},${a})`);g.addColorStop(1,`rgba(${col},${a*.15})`);ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(x-10,y);ctx.lineTo(x+10,y);ctx.lineTo(x1,yb);ctx.lineTo(x0,yb);ctx.closePath();ctx.filter='blur(6px)';ctx.fill();ctx.restore()}
function motes(t,x0,x1,y0,y1,n,seed,col){const r=mul(seed);ctx.save();ctx.globalCompositeOperation='screen';for(let i=0;i<n;i++){const px=x0+r()*(x1-x0)+Math.sin(t*.5+i)*6,py=y0+((r()*(y1-y0)-t*6*(.3+r()))%(y1-y0)+(y1-y0))%(y1-y0);const a=.25+.5*Math.abs(Math.sin(t*.8+i*1.7));ctx.fillStyle=`rgba(${col},${a*.55})`;ctx.beginPath();ctx.arc(px,py,.6+r()*1.1,0,7);ctx.fill()}ctx.restore()}
// ---- THIN FIGURES (reference style: round head, thin limbs, small; detail goes into the light, not the body)
const TF={you:{top:'#d9a21a',bot:'#2c3550',skin:'#e0b48c',hair:'#3a2618'},ollie:{top:'#c8373c',bot:'#2c3f66',skin:'#d9a57a',hair:'#3a2618',beanie:'#d23a40'},slp:['#5d6470','#6c6359','#4f5a6a','#6e6a74','#565c52']};
function limb(pts,w,col){ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i][0],pts[i][1]);ctx.stroke()}
// kneeling, head bowed. view: 'front' (face down toward us) | 'back' | 'side' (dir=+1 faces right). x,y = knees on the floor
function kneelThin(x,y,s,seed,view='front',dir=1){const top=TF.slp[seed%5],skin='#a9aeb6',hair=['#2b2f38','#3a2f26','#5b5f66','#1d2028'][seed%4];ctx.save();ctx.translate(x,y);ctx.scale(s*(view==='side'?dir:1),s);
  if(view==='side'){limb([[0,0],[-14,0]],5.5,'#2d323d');limb([[0,0],[2,-20]],6,'#2d323d');ctx.fillStyle=top;ctx.beginPath();ctx.moveTo(-2,-18);ctx.quadraticCurveTo(4,-38,12,-44);ctx.lineTo(18,-38);ctx.quadraticCurveTo(10,-30,6,-16);ctx.closePath();ctx.fill();
    limb([[14,-40],[18,-26],[16,-12]],4,top);ctx.fillStyle=skin;ctx.beginPath();ctx.arc(16,-11,2.4,0,7);ctx.fill();ctx.fillStyle=skin;ctx.beginPath();ctx.arc(21,-44,6.5,0,7);ctx.fill();ctx.fillStyle=hair;ctx.beginPath();ctx.arc(19,-46,6.5,Math.PI*.8,Math.PI*1.9);ctx.fill()}
  else{const bk=view==='back';limb([[-5,0],[-6,-14]],6,'#2d323d');limb([[5,0],[6,-14]],6,'#2d323d');ctx.fillStyle=top;ctx.beginPath();ctx.moveTo(-9,-13);ctx.quadraticCurveTo(-11,-30,-7,-38);ctx.lineTo(7,-38);ctx.quadraticCurveTo(11,-30,9,-13);ctx.closePath();ctx.fill();
    limb([[-8,-35],[-11,-22],[-9,-10]],4,top);limb([[8,-35],[11,-22],[9,-10]],4,top);ctx.fillStyle=skin;for(const sd of[-1,1]){ctx.beginPath();ctx.arc(sd*9,-9,2.3,0,7);ctx.fill()}
    ctx.fillStyle=bk?hair:skin;ctx.beginPath();ctx.arc(0,-34,6.4,0,7);ctx.fill();if(!bk){ctx.fillStyle=hair;ctx.beginPath();ctx.arc(0,-38,6.4,Math.PI*1.05,Math.PI*1.95);ctx.fill()}else{ctx.fillStyle=top;ctx.beginPath();ctx.ellipse(0,-36,10,3.5,0,0,Math.PI);ctx.fill()}}
  ctx.restore()}
// you sitting on the floor, back against the cot, knees up; Ollie asleep in your lap, his head under your chin (side view, facing right)
function sitHold(t,x,y,s){const Y=TF.you,O=TF.ollie;const br=Math.sin(t*1.6)*.5;ctx.save();ctx.translate(x,y);ctx.scale(s,s);
  limb([[0,-2],[22,-16],[40,-1]],5.2,shade(Y.bot,-.25));limb([[2,0],[25,-13],[43,1]],5.2,Y.bot);ctx.fillStyle='#16181f';for(const fx of[41,44]){ctx.beginPath();ctx.ellipse(fx,1,4,2.3,0,0,7);ctx.fill()}   // knees up
  ctx.save();ctx.rotate(-.24);ctx.fillStyle=Y.top;ctx.beginPath();ctx.moveTo(-5,0);ctx.quadraticCurveTo(-8,-16,-6,-28+br);ctx.quadraticCurveTo(-1,-33+br,5,-31+br);ctx.quadraticCurveTo(9,-16,7,0);ctx.closePath();ctx.fill();          // slim torso
  ctx.fillStyle=shade(Y.top,-.28);ctx.beginPath();ctx.ellipse(-1,-31+br,6.5,3.2,-.2,0,7);ctx.fill();                                                                                           // hood down
  limb([[1,-31+br],[3,-35+br]],3,Y.skin);ctx.fillStyle=Y.skin;ctx.beginPath();ctx.arc(6,-39+br,5.2,0,7);ctx.fill();ctx.fillStyle=Y.hair;ctx.beginPath();ctx.arc(4.5,-40.5+br,5.4,Math.PI*.7,Math.PI*1.95);ctx.fill();ctx.restore();   // head bowed toward him
  // Ollie curled in your lap: back toward us, knees tucked, head against your chest under your chin
  ctx.fillStyle=O.top;ctx.beginPath();ctx.ellipse(15,-18,7.5,9.5,.35,0,7);ctx.fill();limb([[18,-10],[26,-12],[28,-6]],4,O.bot);limb([[20,-9],[27,-7],[30,-2]],4,shade(O.bot,-.2));
  ctx.fillStyle=O.skin;ctx.beginPath();ctx.arc(12,-30+br*.5,4.6,0,7);ctx.fill();ctx.fillStyle=O.beanie;ctx.beginPath();ctx.arc(12.4,-31+br*.5,4.9,Math.PI*1.0,Math.PI*2.0);ctx.fill();ctx.fillRect(7.5,-31.5+br*.5,9.8,1.6);ctx.fillStyle='#ff9a9a';ctx.beginPath();ctx.arc(10.5,-36+br*.5,1.5,0,7);ctx.fill();
  // your near arm round his back, hand on his shoulder blade; your far hand shows on his knees
  limb([[-4,-27+br],[11,-21],[19,-19]],3.4,Y.top);ctx.fillStyle=Y.skin;ctx.beginPath();ctx.arc(20,-19,2.1,0,7);ctx.fill();ctx.beginPath();ctx.arc(27,-10,1.9,0,7);ctx.fill();
  ctx.restore()}
// top-down: kneeling figure (back + bowed head toward the centre)
function kneelTopThin(x,y,s,seed,cx,cy){const top=TF.slp[seed%5],hair=['#2b2f38','#3a2f26','#5b5f66','#1d2028'][seed%4];const a=Math.atan2(cy-y,cx-x)-Math.PI/2;ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.scale(s,s);
  ctx.fillStyle='#252a33';ctx.beginPath();ctx.ellipse(0,-7,7,4,0,0,7);ctx.fill();ctx.fillStyle=top;ctx.beginPath();ctx.ellipse(0,0,9,6.5,0,0,7);ctx.fill();limb([[-7,2],[-6,10]],3,top);limb([[7,2],[6,10]],3,top);ctx.fillStyle=hair;ctx.beginPath();ctx.arc(0,7,4.6,0,7);ctx.fill();ctx.restore()}
// top-down: you lying on your back, Ollie asleep face down on your chest
function lieTopThin(t,x,y,s){const Y=TF.you,O=TF.ollie;const br=Math.sin(t*1.6)*.5;ctx.save();ctx.translate(x,y);ctx.scale(s,s);
  limb([[-4,14],[-6,44]],6,Y.bot);limb([[4,14],[6,44]],6,Y.bot);ctx.fillStyle=Y.top;ctx.beginPath();ctx.roundRect(-10,-16,20,32,8);ctx.fill();ctx.fillStyle=Y.skin;ctx.beginPath();ctx.arc(0,-23,7,0,7);ctx.fill();ctx.fillStyle=Y.hair;ctx.beginPath();ctx.arc(0,-26,7,Math.PI,0);ctx.fill();
  limb([[-2,6],[-3,26]],4,O.bot);limb([[2,6],[3,26]],4,O.bot);ctx.fillStyle=O.top;ctx.beginPath();ctx.ellipse(0,0+br,8,10,0,0,7);ctx.fill();ctx.fillStyle=O.beanie;ctx.beginPath();ctx.arc(0,-11+br,5.2,0,7);ctx.fill();ctx.fillStyle='#ff9a9a';ctx.beginPath();ctx.arc(0,-15+br,1.8,0,7);ctx.fill();
  limb([[-10,-12],[-12,0],[-5,2]],3.6,Y.top);limb([[10,-12],[12,0],[5,2]],3.6,Y.top);ctx.restore()}
function stampT(txt,t,t0,y,col,size){const q=t-t0;if(q<0)return;const k=EZ.ob(clamp(q/.18));ctx.save();ctx.translate(270,y);ctx.scale(k,k);ctx.font=`${size}px "Bebas Neue"`;ctx.letterSpacing='2px';ctx.textAlign='center';ctx.shadowColor='rgba(0,0,0,.8)';ctx.shadowBlur=16;ctx.shadowOffsetY=4;ctx.fillStyle=col;ctx.fillText(txt,0,0);ctx.restore()}

// ============ SHOT 1 (0-2.4): the basement clinic, one bulb swinging slowly on its cord. You sit against the cot, Ollie asleep
// in your lap. A ring of Sleepers kneels around you in the dark, heads bowed; the swinging light slides over them.
// 5 layers with parallax: far wall (.4) -> far ring (.75) -> you + Ollie (1) -> near ring backs (1.15) -> foreground heads (1.5)
const R1=(()=>{const P=[];let k=0;for(const [R,n] of[[180,10],[250,13],[330,16]]){for(let i=0;i<n;i++){k++;const a=i/n*Math.PI*2+R*.017+(hash(k)-.5)*.14;P.push({a,R:R+(hash(k+5)-.5)*16,k})}}return P})();
function lamp1(t){return{x:270+Math.sin(t*1.25)*22,y:250}}
SC.s_wide=(t,u,d)=>{const p=u/d;const cm={x:lerp(-10,-22,EZ.io(p)),y:lerp(58,46,EZ.io(p)),z:lerp(1.42,1.56,EZ.io(p))};const Lp=lamp1(t);const C=[262,630],E=.4;
  const layer=(par,fn)=>{ctx.save();ctx.translate(270,560);const z=Math.pow(cm.z,par);ctx.scale(z,z);ctx.translate(-270-cm.x*par,-560-cm.y*par);fn();ctx.restore()};
  layer(.4,()=>{vgr(0,430,'#1f2329','#171a1f');for(let x=-20;x<580;x+=62){bev(RR(x,250,46,150,4),'#20242a',{hl:2,sh:2,line:false})}ctx.fillStyle='#2b2f36';ctx.fillRect(-40,420,640,10);
    ctx.save();ctx.globalAlpha=.16;for(let i=0;i<3;i++){const fx=((t*8+i*190)%760)-110;const g=ctx.createRadialGradient(fx,420,10,fx,420,220);g.addColorStop(0,'rgba(140,170,210,1)');g.addColorStop(1,'rgba(140,170,210,0)');ctx.fillStyle=g;ctx.fillRect(fx-220,300,440,240)}ctx.restore()});   // cold fog far away
  const pts=R1.filter(o=>!(Math.sin(o.a)>.75)).map(o=>({x:C[0]+Math.cos(o.a)*o.R*1.05,y:C[1]+Math.sin(o.a)*o.R*E,o})).sort((a,b)=>a.y-b.y);
  const sc=y=>lerp(.62,1.05,(y-500)/300);const kn=(q,front)=>{const side=Math.abs(Math.cos(q.o.a))>.5;slpKneel(q.x,q.y,sc(q.y),q.o.k,side?'side':front?'front':'back',Math.cos(q.o.a)>0?-1:1)};
  const shadow=(x,y,w)=>{const dx=(x-Lp.x)*.18;ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(x+dx,y+2,w,w*.22,0,0,7);ctx.fill()};
  layer(.75,()=>{vgr(430,1000,'#2a2925','#141412');ctx.strokeStyle='rgba(255,255,255,.03)';ctx.lineWidth=1;for(let i=-14;i<=14;i++){ctx.beginPath();ctx.moveTo(270+i*22,430);ctx.lineTo(270+i*120,1000);ctx.stroke()}
    for(const q of pts)if(q.y<C[1]-20){shadow(q.x,q.y,24*sc(q.y));kn(q,true)}});
  layer(1,()=>{bev(RR(140,560,200,12,3),'#d6d2c6',{hl:2,sh:2});ctx.fillStyle='#8a8f99';ctx.fillRect(140,572,200,6);for(const x of[146,334])slab([x,578],[x,628],5,'#59607a',{line:false});   // the cot behind you
    shadow(272,632,70);youHoldOllie(t,206,632,1.15,{nod:Math.sin(t*.9)*.03})});
  layer(1.15,()=>{for(const q of pts)if(q.y>=C[1]-20){shadow(q.x,q.y,26*sc(q.y));kn(q,false)}});
  // the bulb (swinging) + cord
  layer(1,()=>{ctx.strokeStyle='#0c0d10';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(270,-60);ctx.lineTo(Lp.x,Lp.y-14);ctx.stroke();ctx.save();ctx.translate(Lp.x,Lp.y);ctx.rotate(-(Lp.x-270)*.004);bev(()=>{ctx.beginPath();ctx.moveTo(-17,-14);ctx.lineTo(17,-14);ctx.lineTo(25,0);ctx.lineTo(-25,0);ctx.closePath()},'#3a3d44',{hl:1.5,sh:1.5});ctx.restore()});
  // light: warm pool that follows the bulb + faint cold ambient
  ctx.save();ctx.translate(270,560);ctx.scale(cm.z,cm.z);ctx.translate(-270-cm.x,-560-cm.y);
  const fl=1-.05*Math.max(0,Math.sin(t*23))*(Math.sin(t*3.1)>.6?1:0);
  lightPass('rgb(24,27,38)',[{x:Lp.x+(C[0]-Lp.x)*.1,y:C[1],r:300,c:`rgba(255,205,140,${fl})`,k:.34,sy:.55},{x:Lp.x,y:470,r:420,c:'rgba(255,190,120,.45)',k:.3},{x:Lp.x,y:Lp.y+4,r:110,c:'rgba(255,230,180,1)',k:.2}]);
  ctx.fillStyle='#fff6dc';ctx.beginPath();ctx.arc(Lp.x,Lp.y+4,6,0,7);ctx.fill();glow(Lp.x,Lp.y+4,70,'#ffd9a0',.9*fl);
  beamCone(Lp.x,Lp.y+2,Lp.x-150+(Lp.x-270)*1.4,Lp.x+150+(Lp.x-270)*1.4,700,'255,214,150',.18*fl);motes(t,Lp.x-130,Lp.x+130,260,700,80,9,'255,225,180');ctx.restore();
  ctx.fillStyle='rgba(4,5,8,.35)';ctx.fillRect(0,850,W,110);vig(.6,150);stampT('THEY KNEEL TO HIM.',t,CU.hookT[0],330,'#F4F4EF',50)};
// ============ SHOT 2 (2.4-5.45): high angle above the cot. Close on Ollie asleep in your lap, then the camera pulls up and
// back: ring after ring of kneeling Sleepers, thousands; on "kneel" the old ceiling lights flicker on across the room.
// (Sleepers are sprites of the same block figure as shot 1, cached per view/colour, so thousands stay sharp and fast.)
const KSP={};function kneelSprite(view,dir,seed){const key=view+dir+(seed%6);if(KSP[key])return KSP[key];const c=document.createElement('canvas');c.width=180;c.height=300;const sv=ctx;ctx=c.getContext('2d');ctx.scale(2,2);ctx.translate(45,140);slpKneel(0,0,1,seed%6,view,dir);ctx=sv;return KSP[key]=c}
const R3=(()=>{const P=[];let k=0;for(let R=200;R<2200;R+=40){const n=Math.floor(2*Math.PI*R/40);for(let i=0;i<n;i++){k++;if(hash(k+11)<.04)continue;const a=i/n*Math.PI*2+R*.011+(hash(k)-.5)*.05;if(R<420&&Math.sin(a)>.55)continue;const rr=R+(hash(k+3)-.5)*12;P.push({X:Math.cos(a)*rr,Y:Math.sin(a)*rr,a,k})}}return P.sort((p,q)=>p.Y-q.Y)})();
SC.s_top=(t,u,d)=>{const kt=CU.hookT[1];const q=EZ.io(pr(t,2.4,5.3));const z=lerp(1.75,.5,q),E=lerp(.5,.66,q),cx=270,cy=lerp(560,600,q);const Lx=Math.sin(t*1.25)*18;
  const P=(X,Y)=>[cx+X*z,cy+Y*E*z];vgr(0,H,'#1a1b19','#121310');
  ctx.save();ctx.strokeStyle='rgba(255,255,255,.035)';ctx.lineWidth=1;for(let i=-40;i<=40;i++){const a=P(i*60,-2600),b=P(i*60,2600);ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke();const c=P(-2600,i*60),e=P(2600,i*60);ctx.beginPath();ctx.moveTo(...c);ctx.lineTo(...e);ctx.stroke()}ctx.restore();
  const fs=z*1.0;let drawnSubj=false;
  const subj=()=>{const [x,y]=P(0,0);ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(x+10*z,y,70*z,16*z,0,0,7);ctx.fill();bev(RR(x-100*z,y-70*z,200*z,12*z,3*z),'#d6d2c6',{hl:2,sh:2});youHoldOllie(t,x-40*z,y,fs,{nod:Math.sin(t*.9)*.03})};
  for(const o of R3){if(!drawnSubj&&o.Y>0){subj();drawnSubj=true}const [x,y]=P(o.X,o.Y);if(x<-60||x>600||y<-40||y>1100)continue;const side=Math.abs(Math.cos(o.a))>.5;const view=side?'side':(o.Y<0?'front':'back');const dir=Math.cos(o.a)>0?-1:1;
    const sc=fs*.95;ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(x,y+1,22*sc,6*sc,0,0,7);ctx.fill();ctx.drawImage(kneelSprite(view,side?dir:1,o.k),x-45*sc,y-140*sc,90*sc,150*sc)}
  if(!drawnSubj)subj();
  const [lx,ly]=P(Lx,-10);const Ls=[{x:lx,y:ly,r:380*z+90,c:'rgba(255,205,140,1)',k:.36,sy:E+.2}];
  const on=i=>{const t0=kt+.04+i*.07;return t>t0?(t<t0+.14?(Math.sin((t-t0)*95)>0?.9:.12):1):0};
  [-1600,-1050,-520,520,1050,1600].forEach((ry,i)=>{const k=on(i);if(k>0)for(const rx of[-1300,-650,0,650,1300]){const [x,y]=P(rx,ry);Ls.push({x,y,r:420*z+80,c:`rgba(175,205,240,${k})`,k:.42,sy:E+.15})}});
  lightPass('rgb(14,15,21)',Ls);glow(lx,ly-60*z,90*z+30,'#ffd9a0',.35);
  motes(t,0,W,150,900,40,21,'255,225,180');vig(.5,170);
  stampT('THEY KNEEL TO HIM.',t,-1,330,'#F4F4EF',50);stampT('AS LONG AS HE SLEEPS.',t,kt,392,K.red,44)};
function zoomAt(cx,cy,z){ctx.translate(cx,cy);ctx.scale(z,z);ctx.translate(-cx,-cy)}
