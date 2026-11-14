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
// ============ SHOT 1 (0-2.4): the basement clinic at floor level. One bulb. You hold him asleep in the only pool of light;
// around you, in the dark, a ring of kneeling figures, heads bowed, lit only at their edges.
const RING1=(()=>{const P=[];let k=0;for(const [R,n] of[[170,11],[240,14],[316,17]]){for(let i=0;i<n;i++){k++;const a=i/n*Math.PI*2+R*.013+(hash(k)-.5)*.12;P.push({a,R:R+(hash(k+5)-.5)*14,k})}}return P})();
SC.s_wide=(t,u,d)=>{const p=u/d;ctx.save();zoomAt(270,560,lerp(1.0,1.1,EZ.io(p)));
  vgr(0,410,'#24272d','#1b1d22');vgr(410,H,'#2a2823','#121210');ctx.strokeStyle='rgba(255,255,255,.035)';ctx.lineWidth=1;for(let i=-14;i<=14;i++){ctx.beginPath();ctx.moveTo(270+i*20,410);ctx.lineTo(270+i*110,980);ctx.stroke()}for(let y=430;y<980;y+=(y-380)*.18){ctx.beginPath();ctx.moveTo(-50,y);ctx.lineTo(590,y);ctx.stroke()}
  for(let x=10;x<W;x+=58){ctx.fillStyle='#1f2227';ctx.fillRect(x,250,40,150)}
  const C=[270,610],E=.42;const pts=RING1.map(o=>({x:C[0]+Math.cos(o.a)*o.R*1.05,y:C[1]+Math.sin(o.a)*o.R*E,o})).sort((a,b)=>a.y-b.y);
  const sc=y=>lerp(.95,1.6,(y-470)/330);const draw=(q,front)=>{const side=Math.abs(Math.cos(q.o.a))>.45;kneelThin(q.x,q.y,sc(q.y),q.o.k,side?'side':front?'front':'back',Math.cos(q.o.a)>0?-1:1)};
  for(const q of pts)if(q.y<C[1]-14)draw(q,true);
  ctx.fillStyle='#d8d4c8';ctx.fillRect(150,548,190,12);ctx.fillStyle='#8a8f99';ctx.fillRect(150,560,190,6);limb([[156,566],[156,612]],3.5,'#5a5f6a');limb([[334,566],[334,612]],3.5,'#5a5f6a');
  sitHold(t,236,622,2.6);
  for(const q of pts)if(q.y>=C[1]-14)draw(q,false);
  limb([[270,-40],[270,232]],2,'#0c0d10');ctx.fillStyle='#3a3d44';ctx.beginPath();ctx.moveTo(254,232);ctx.lineTo(286,232);ctx.lineTo(296,246);ctx.lineTo(244,246);ctx.closePath();ctx.fill();
  lightPass('rgb(22,24,33)',[{x:262,y:610,r:330,c:'rgba(255,205,140,1)',k:.32,sy:.6},{x:270,y:500,r:430,c:'rgba(255,190,120,.45)',k:.3},{x:270,y:248,r:110,c:'rgba(255,230,180,1)',k:.2}]);
  ctx.fillStyle='#fff6dc';ctx.beginPath();ctx.arc(270,249,6,0,7);ctx.fill();glow(270,249,60,'#ffd9a0',.9);
  beamCone(270,248,130,410,660,'255,214,150',.2);motes(t,150,390,250,660,70,9,'255,225,180');
  ctx.save();ctx.filter='blur(5px)';kneelThin(30,1020,4.6,3,'back');kneelThin(530,1040,5.0,6,'back');ctx.restore();ctx.fillStyle='rgba(5,6,9,.45)';ctx.fillRect(0,840,W,120);
  ctx.restore();vig(.6,150);stampT('THEY KNEEL TO HIM.',t,CU.hookT[0],330,'#F4F4EF',50)};
// ============ SHOT 2 (2.4-5.45): straight down from the ceiling. The bulb's pool shows the first rings;
// on "kneel" the old ceiling tubes flicker on, row by row, and the dark fills with thousands more.
const RING2=(()=>{const P=[];let k=0;for(let R=70;R<1100;R+=19){const n=Math.floor(2*Math.PI*R/17);for(let i=0;i<n;i++){k++;const a=i/n*Math.PI*2+hash(k)*.05+R*.02;if(hash(k+11)>.06)P.push([Math.cos(a)*R+(hash(k+3)-.5)*7,Math.sin(a)*R*1.08+(hash(k+4)-.5)*7,k])}}return P})();
SC.s_top=(t,u,d)=>{const p=u/d;const kt=CU.hookT[1];const z=lerp(1.9,.62,EZ.io(pr(t,2.4,5.2)));ctx.save();ctx.translate(270,520);ctx.rotate(lerp(-.08,.03,p));ctx.scale(z,z);
  ctx.fillStyle='#2a2925';ctx.fillRect(-1400,-1400,2800,2800);ctx.strokeStyle='rgba(255,255,255,.035)';ctx.lineWidth=1.2;for(let i=-30;i<=30;i++){ctx.beginPath();ctx.moveTo(i*46,-1400);ctx.lineTo(i*46,1400);ctx.stroke();ctx.beginPath();ctx.moveTo(-1400,i*46);ctx.lineTo(1400,i*46);ctx.stroke()}
  for(const [x,y,k] of RING2)kneelTopThin(x,y,1.0,k,0,0);
  lieTopThin(t,0,0,1.15);
  // lights: the bulb pool; then the tubes come on in rows (with a flicker) after "kneel"
  const L=[{x:0,y:0,r:150,c:'rgba(255,205,140,1)',k:.4}];const rows=[-760,-500,-250,250,500,760];
  rows.forEach((ry,i)=>{const t0=kt+.05+i*.09;const on=t>t0?(t<t0+.12?(Math.sin((t-t0)*90)>0?.85:.15):1):0;if(on>0)for(const rx of[-520,-260,0,260,520])L.push({x:rx,y:ry,r:210,c:`rgba(170,200,235,${.75*on})`,k:.35})});
  lightPass('rgb(12,13,18)',L);
  glow(0,0,90,'#ffd9a0',.35);ctx.restore();vig(.55,160);
  stampT('THEY KNEEL TO HIM.',t,-1,330,'#F4F4EF',50);stampT('AS LONG AS HE SLEEPS.',t,kt,392,K.red,44)};
function zoomAt(cx,cy,z){ctx.translate(cx,cy);ctx.scale(z,z);ctx.translate(-cx,-cy)}
