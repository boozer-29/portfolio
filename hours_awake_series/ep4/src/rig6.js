// ===== HOURS AWAKE — outlined 2D rig v6 (with anatomy rules + automatic pose QA) =====
const OLc='#1b1e29';
const K={must:'#EAB308',red:'#E5484D',lime:'#C6F432',amb:'#F5A524',teal:'#14b8a6',olive:'#5b6b3c',purple:'#8b5cf6',skin:'#E8B98F',skinR:'#D3A47E',skinO:'#D9A57A',skinM:'#C88E66',skinD:'#8a5a3c',slp:'#C9CED6',jeans:'#33405c'};
const RAD=Math.PI/180;
window.QA=[];let QA_SHOT='';
function qaFlag(msg){QA.push(QA_SHOT+' | '+msg)}
// ---------- outlined primitives
function opath(pts){ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i][0],pts[i][1])}
function tubeO(pts,w,o){ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=OLc;ctx.lineWidth=w+2*o;opath(pts);ctx.stroke()}
function tubeF(pts,w,col){ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=col;ctx.lineWidth=w;opath(pts);ctx.stroke()}
function tube(pts,w,col,o){tubeO(pts,w,o);tubeF(pts,w,col)}
function shapeO(fn,col,o){ctx.lineJoin='round';fn();if(o>0){ctx.strokeStyle=OLc;ctx.lineWidth=o*2;ctx.stroke()}ctx.fillStyle=col;ctx.fill()}
function oblob(x,y,rx,ry,col,o,rot=0){shapeO(()=>{ctx.beginPath();ctx.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),rot,0,7)},col,o)}
function orr(x,y,w,h,r,col,o){shapeO(()=>{ctx.beginPath();ctx.roundRect(x,y,w,h,r)},col,o)}
function union(parts,col,o){for(const p of parts){if(p.t)tubeO(p.t,p.w,o);else{ctx.beginPath();ctx.ellipse(p.x,p.y,p.rx,p.ry,p.rot||0,0,7);ctx.strokeStyle=OLc;ctx.lineWidth=o*2;ctx.stroke()}}
  for(const p of parts){if(p.t)tubeF(p.t,p.w,p.col||col);else{ctx.beginPath();ctx.ellipse(p.x,p.y,p.rx,p.ry,p.rot||0,0,7);ctx.fillStyle=p.col||col;ctx.fill()}}}
// ---------- IK with a pole target: of the two possible elbows, take the one nearest the pole
function ikPole(S,T,L1,L2,pole){let dx=T[0]-S[0],dy=T[1]-S[1],d=Math.hypot(dx,dy);const mx=L1+L2-.01;let reach=true;if(d>mx){dx*=mx/d;dy*=mx/d;d=mx;reach=false}d=Math.max(d,Math.abs(L1-L2)+.01);
  const a=Math.acos(clamp((L1*L1+d*d-L2*L2)/(2*L1*d),-1,1)),base=Math.atan2(dy,dx);
  const E1=[S[0]+Math.cos(base+a)*L1,S[1]+Math.sin(base+a)*L1],E2=[S[0]+Math.cos(base-a)*L1,S[1]+Math.sin(base-a)*L1];
  const E=Math.hypot(E1[0]-pole[0],E1[1]-pole[1])<=Math.hypot(E2[0]-pole[0],E2[1]-pole[1])?E1:E2;return{E,T:[S[0]+dx,S[1]+dy],reach}}
function segX(a,b,c,d){const o=(p,q,r)=>Math.sign((q[0]-p[0])*(r[1]-p[1])-(q[1]-p[1])*(r[0]-p[0]));return o(a,b,c)!==o(a,b,d)&&o(c,d,a)!==o(c,d,b)}
// ---------- HANDS. ang = world direction from wrist to fingertips. k = size. thumbToward = world point the thumb should face.
// kinds: relax | open | palmUp | fist | point | grip (fingers drawn; thumb returned for a later front pass) | back (back of hand, fingers curled over an edge)
const HAND_LEN={relax:23,open:28,palmUp:28,fist:21,point:31,grip:20,back:24};
function handTip(x,y,ang,k,kind){const L=(HAND_LEN[kind]||24)*k;return[x+Math.cos(ang)*L,y+Math.sin(ang)*L]}
function drawHand(x,y,ang,k,kind,skin,o,opt={}){ctx.save();ctx.translate(x,y);ctx.rotate(ang-Math.PI/2);
  // local frame: +y = toward fingertips. decide thumb side
  let ts=1;if(opt.thumbToward){const lx=opt.thumbToward[0]-x,ly=opt.thumbToward[1]-y;const c=Math.cos(-(ang-Math.PI/2)),s=Math.sin(-(ang-Math.PI/2));ts=(lx*c-ly*s)>=0?1:-1}else if(opt.ts)ts=opt.ts;
  ctx.scale(k*ts,k);const oo=o/k;const P=[],fw=4.6;const palm={x:0,y:9.5,rx:8.6,ry:9,col:skin};let thumbBase=null;
  if(kind==='open'||kind==='palmUp'){const sp=opt.spread??1;[[-6,-12],[-2,-4],[2.2,4],[6,12]].forEach(([fx,a],i)=>{const L=i==1||i==2?13.5:11.5;const r=a*sp*RAD;P.push({t:[[-fx*.9,14],[-fx*.9-Math.sin(r)*L,14+Math.cos(r)*L]],w:fw})});
    P.push({t:[[7,6],[14,12.5]],w:5.2});P.push(palm);union(P,skin,oo);if(opt.tips){ctx.fillStyle=opt.tips;for(const q of P.slice(0,4)){const e=q.t[1];ctx.beginPath();ctx.ellipse(e[0],e[1]-1.5,2.1,3.2,0,0,7);ctx.fill()}}if(kind==='palmUp'){ctx.strokeStyle='rgba(0,0,0,.2)';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(0,8,5,.4,2.5);ctx.stroke()}}
  else if(kind==='relax'){P.push({x:0,y:9,rx:8.6,ry:8.4});P.push({t:[[0,13],[0,18.5]],w:13.5});P.push({t:[[7.4,5],[10.2,12.5]],w:5});union(P,skin,oo);
    ctx.strokeStyle='rgba(0,0,0,.22)';ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(-2.2,17);ctx.lineTo(-2.2,23);ctx.moveTo(2.2,17);ctx.lineTo(2.2,23);ctx.stroke()}
  else if(kind==='fist'){P.push({x:0,y:11,rx:9.6,ry:10});P.push({t:[[7,6],[5,15]],w:5.2});union(P,skin,oo);ctx.strokeStyle=OLc;ctx.lineWidth=1.3;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(-4.5+i*4.5,16.5);ctx.lineTo(-4.5+i*4.5,20.5);ctx.stroke()}}
  else if(kind==='point'){P.push({t:[[1.5,14],[1.5,31]],w:fw});P.push({x:-1.5,y:15,rx:7.5,ry:5.8});P.push({t:[[7,7],[8,15]],w:5});P.push(palm);union(P,skin,oo)}
  else if(kind==='grip'){P.push({x:0,y:9,rx:8.6,ry:8.6});P.push({t:[[0,13],[0,17]],w:13.5});union(P,shade(skin,-.06),oo);thumbBase=[7,6]}
  else if(kind==='back'){ // back of the hand on top, knuckles toward fingers; fingers bend down over an edge (drawn short = foreshortened)
    P.push({x:0,y:9,rx:9.4,ry:9.6});P.push({t:[[7.5,4],[10.5,12]],w:5.2});for(const fx of[-5.6,-1.9,1.9,5.6])P.push({t:[[fx,15],[fx,20.5]],w:fw});union(P,skin,oo);
    ctx.strokeStyle='rgba(0,0,0,.25)';ctx.lineWidth=1.1;for(const fx of[-5.6,-1.9,1.9,5.6]){ctx.beginPath();ctx.arc(fx,14.5,1.6,Math.PI*1.1,Math.PI*1.9);ctx.stroke()}}
  let out=null;if(thumbBase){const m=ctx.getTransform();out={m,ts}}
  ctx.restore();return out}
// thumb in front of a held object: uses the matrix stored by a 'grip' hand
function thumbOver(g,skin,o,dir=[3,9]){if(!g)return;ctx.save();ctx.setTransform(g.m);tube([[7,6],[7+dir[0],6+dir[1]]],5.2,skin,o/Math.hypot(g.m.a,g.m.b)*2);ctx.restore()}
// ---------- the cast
const CAST={
 you:{skin:K.skin,top:K.must,bot:K.jeans,shoe:'#1d2230',hair:'#4a3020',hood:true},
 ollie:{skin:K.skinO,top:K.red,bot:'#2f4a7a',shoe:'#1d2230',beanie:true,kid:true},
 reyes:{skin:K.skinR,top:K.olive,bot:'#3b3f2e',shoe:'#1d2230',bald:true,beard:'#a9adb5',brow:true},
 maya:{skin:K.skinM,top:K.teal,bot:'#0f7d71',shoe:'#e8e8e0',hair:'#3a2618',long:true},
 dj:{skin:K.skinD,top:K.purple,bot:'#2a2e3c',shoe:'#e8e8e0',hair:'#1b1b22',phones:true,teen:true},
 sleeper:{skin:K.slp,top:'#6b7280',bot:'#3b4252',shoe:'#222633',hair:'#3a3f4a',sleeper:true}};
const SLP_TOPS=['#6b7280','#7d6f66','#59657a','#8a7f6f','#4f5d6b','#6f6a7a'],SLP_HAIR=['#3a3f4a','#4a3a2a','#8a8a90','#1b1f2a','#5a4a3a'];
function slpC(seed){return{top:SLP_TOPS[seed%6],hair:SLP_HAIR[(seed*7)%5],bald:seed%9===4,long:seed%5===2}}
// face drawn in head-local coords (head centre 0,hy radius hr)
function face(c,p,hy,hr,s){const look=p.look||0,ey=hy-1;const eyes=p.eyes||'open',ex=hr*.38;
  for(const sd of[-1,1]){const X=sd*ex+look*2.5;
    if(eyes==='closed'){ctx.strokeStyle=OLc;ctx.lineWidth=1.9;ctx.beginPath();ctx.arc(X,ey-1,3.2,.25,Math.PI-.25);ctx.stroke();if(c.sleeper){ctx.strokeStyle='rgba(90,80,120,.5)';ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(X,ey+1.8,3.6,.3,Math.PI-.3);ctx.stroke()}}
    else if(eyes==='happy'){ctx.strokeStyle=OLc;ctx.lineWidth=2;ctx.beginPath();ctx.arc(X,ey+1.5,3,Math.PI+.3,-.3);ctx.stroke()}
    else{const big=eyes==='wide'?1.25:1;ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(X,ey,3.3*big,3.8*big,0,0,7);ctx.fill();ctx.strokeStyle=OLc;ctx.lineWidth=1.1;ctx.stroke();ctx.fillStyle=OLc;ctx.beginPath();ctx.arc(X+look*1.2,ey+.4,1.75*big,0,7);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(X+look*1.2+.6,ey-.5,.55,0,7);ctx.fill();
      const lid=eyes==='half'?.55:eyes==='heavy'?.75:0;if(lid){ctx.fillStyle=c.skin;ctx.fillRect(X-4.6,ey-5.6,9.2,9.2*lid);ctx.strokeStyle=OLc;ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(X-4,ey-5.6+9.2*lid);ctx.lineTo(X+4,ey-5.6+9.2*lid);ctx.stroke()}
      if(p.tears){ctx.fillStyle='rgba(150,210,255,.9)';ctx.beginPath();ctx.ellipse(X+sd*1.5,ey+5.5,1.3,2.2,0,0,7);ctx.fill()}}}
  if(c.brow||p.brow){ctx.strokeStyle=OLc;ctx.lineWidth=1.9;ctx.lineCap='round';for(const sd of[-1,1]){const b=p.brow;const inner=b==='worry'?-2.2:b==='angry'?2:0;ctx.beginPath();ctx.moveTo(sd*ex-sd*4,ey-6.5);ctx.lineTo(sd*ex+sd*3.6,ey-6.5+inner*(-1));ctx.stroke()}}
  if(c.beard){ctx.save();ctx.beginPath();ctx.ellipse(0,hy,hr,hr*1.04,0,0,7);ctx.clip();ctx.fillStyle=c.beard;ctx.beginPath();ctx.ellipse(0,hy+hr*.8,hr*.95,hr*.55,0,0,7);ctx.fill();ctx.restore()}
  const m=p.mouth||'line',my=hy+hr*.5;ctx.strokeStyle=OLc;ctx.lineWidth=1.6;ctx.lineCap='round';
  if(m==='smile'){ctx.beginPath();ctx.arc(0,my-2.5,4,.35,Math.PI-.35);ctx.stroke()}else if(m==='o'){ctx.fillStyle='#4a2028';ctx.beginPath();ctx.ellipse(0,my,2.3,2.8,0,0,7);ctx.fill()}else if(m==='sad'){ctx.beginPath();ctx.arc(0,my+3,3.5,Math.PI+.45,-.45);ctx.stroke()}else if(m==='grit'){ctx.fillStyle='#fff';ctx.fillRect(-4,my-1.5,8,3);ctx.strokeRect(-4,my-1.5,8,3)}else{ctx.beginPath();ctx.moveTo(-3,my);ctx.lineTo(3,my);ctx.stroke()}
  if(c.sleeper){ctx.fillStyle='rgba(120,110,150,.16)';ctx.beginPath();ctx.ellipse(0,hy,hr*.95,hr,0,0,7);ctx.fill()}}
// FIGURE. (x,y)=feet, s=scale (adult ≈ 190*s tall). p.arms[i]: {to:[lx,ly] local, pole:[lx,ly], hand, thumbToward(local), behind, raise}
function fig(who,x,y,s,p={}){const c=Object.assign({},CAST[who],p.c||{});const o=p.o??2.6;const kid=c.kid?1:0,teen=c.teen?1:0;
  const hs=kid?1.32:1,L=kid?.66:teen?.93:1,back=!!p.back;const oo=o/s;
  ctx.save();ctx.translate(x,y);ctx.scale(s,s);
  const bob=p.bob||0,lean=(p.lean||0)*RAD,tilt=(p.tilt||0)*RAD;const kd=p.kneel?40*L:0;
  const hipY=-82*L+bob+kd,shY=-140*L+bob+kd;
  if(p.shadow!==false){ctx.fillStyle='rgba(0,0,0,.22)';ctx.beginPath();ctx.ellipse(0,2,30*L,6,0,0,7);ctx.fill()}
  // legs
  for(const sd of[-1,1]){const hx=sd*8*L;const st=(p.step||0)*sd;const fx=hx+sd*(p.stance??3)*L;
    if(p.kneel){tube([[hx,hipY],[hx+sd*3,-7*L]],15*L,c.bot,oo);oblob(hx+sd*3,-5*L,9*L,5*L,shade(c.bot,-.15),oo)}
    else{const lift=Math.max(0,st)*10;tube([[hx,hipY],[lerp(hx,fx,.5)+(p.knee||0)*sd,hipY*.5-lift*.5],[fx,-6-lift]],15*L,c.bot,oo);oblob(fx+sd*2,-4-lift,10*L,6*L,c.shoe,oo)}}
  ctx.save();ctx.translate(0,hipY);ctx.rotate(lean);ctx.translate(0,-hipY);
  const tw=(kid?26:teen?30:32),sw=tw*L*1.05;
  const torso=()=>{ctx.beginPath();ctx.moveTo(-sw*.5,shY-4);ctx.quadraticCurveTo(-sw*.62,(shY+hipY)/2,-tw*L*.5,hipY+4);ctx.lineTo(tw*L*.5,hipY+4);ctx.quadraticCurveTo(sw*.62,(shY+hipY)/2,sw*.5,shY-4);ctx.quadraticCurveTo(0,shY-10,-sw*.5,shY-4);ctx.closePath()};
  const SH=[[-sw*.5+3,shY+3],[sw*.5-3,shY+3]];const UA=30*L,FA=27*L,aw=11*L;
  const A=[0,1].map(i=>{const a=(p.arms&&p.arms[i])||{};const sd=i?1:-1;const to=a.to||[SH[i][0]+sd*5,SH[i][1]+50*L];const pole=a.pole||[SH[i][0]+sd*22,SH[i][1]+30*L];let r;if(a.elbow){const E=a.elbow;const lu=Math.hypot(E[0]-SH[i][0],E[1]-SH[i][1]),lf=Math.hypot(to[0]-E[0],to[1]-E[1]);if(lu>UA*1.08)qaFlag(who+' arm'+(sd<0?'L':'R')+' upper arm stretched '+(lu/UA).toFixed(2));if(lf>FA*1.08)qaFlag(who+' arm'+(sd<0?'L':'R')+' forearm stretched '+(lf/FA).toFixed(2));r={E,T:to,reach:true}}else r=ikPole(SH[i],to,UA,FA,pole);return Object.assign({},a,r,{S:SH[i],sd})});
  // ---- pose QA (in figure space)
  {const nm=who+(p.qa?'('+p.qa+')':'');for(const a of A){if(a.none)continue;const ia=Math.acos(clamp(((a.S[0]-a.E[0])*(a.T[0]-a.E[0])+(a.S[1]-a.E[1])*(a.T[1]-a.E[1]))/(UA*FA),-1,1))/RAD;if(ia<25)qaFlag(nm+' arm'+(a.sd<0?'L':'R')+' elbow folded '+ia.toFixed(0)+'°');
    if(!a.raise&&a.E[1]<a.S[1]-4)qaFlag(nm+' arm'+(a.sd<0?'L':'R')+' elbow above shoulder');if(!a.reach&&a.to)qaFlag(nm+' arm'+(a.sd<0?'L':'R')+' cannot reach target');
    if(a.sd*(a.E[0]-0)<-sw*.15&&!a.cross)qaFlag(nm+' arm'+(a.sd<0?'L':'R')+' elbow crosses the body midline');}
   if(!p.allowCross&&(segX(A[0].S,A[0].E,A[1].S,A[1].E)||segX(A[0].E,A[0].T,A[1].E,A[1].T)||segX(A[0].S,A[0].E,A[1].E,A[1].T)||segX(A[0].E,A[0].T,A[1].S,A[1].E)))qaFlag(nm+' arms cross each other')}
  const grips=[null,null];
  const drawArm=(i)=>{const a=A[i];if(a.none)return;tube([a.S,a.E,a.T],aw,a.sleeve||c.top,oo);const kind=a.hand||'relax';if(kind==='none')return;
    const fang=Math.atan2(a.T[1]-a.E[1],a.T[0]-a.E[0]);const wr=clamp(a.wrist||0,-35,35)*RAD;
    const tt=a.thumbToward||[0,a.T[1]];grips[i]=drawHand(a.T[0],a.T[1],fang+wr,(a.hk||.95)*L*(kid?1.05:1),kind,c.skin,o/s,{thumbToward:tt,spread:a.spread,tips:a.tips})};
  for(let i=0;i<2;i++)if(A[i].behind??back)drawArm(i);
  if(p.propBehind)p.propBehind(A,{shY,hipY,L,oo,s});
  shapeO(torso,c.top,oo);
  if(!back){if(c.hood){ctx.strokeStyle=shade(c.top,-.25);ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(-3,shY+2);ctx.lineTo(-4,shY+20);ctx.moveTo(3,shY+2);ctx.lineTo(4,shY+20);ctx.stroke();orr(-11*L,hipY-24*L,22*L,14*L,5,shade(c.top,-.1),oo*.7)}
    if(who==='maya'){ctx.fillStyle=shade(c.top,-.25);ctx.beginPath();ctx.moveTo(-7,shY-3);ctx.lineTo(0,shY+11);ctx.lineTo(7,shY-3);ctx.fill()}
    if(who==='reyes'){orr(-12,shY+16,9,8,2,shade(c.top,-.15),oo*.6);orr(3,shY+16,9,8,2,shade(c.top,-.15),oo*.6)}}
  if(p.neck)p.neck({shY,L,oo});
  if(p.propMid)p.propMid(A,{shY,hipY,L,oo,s});
  for(let i=0;i<2;i++)if(!(A[i].behind??back))drawArm(i);
  if(p.propFront)p.propFront(A,{shY,hipY,L,oo,s,grips,skin:c.skin,o});
  // head
  ctx.save();ctx.translate(0,shY-2);ctx.rotate(tilt);const hr=15*hs*L*(kid?1.08:1);const hy=-hr-4;
  if(c.hood){oblob(0,hy+3,hr*1.25,hr*1.18,shade(c.top,-.12),oo)}
  if(c.long){orr(-hr*1.12,hy-hr*.1,hr*2.24,hr*1.95,hr*.6,c.hair,oo)}
  tube([[0,0],[0,-6]],9*L,c.skin,oo);
  const headCol=back?(c.hood?shade(c.top,-.05):(c.bald?c.skin:c.hair)):c.skin;oblob(0,hy,hr,hr*1.04,headCol,oo);
  if(!back){
    if(c.hair&&!c.bald&&!c.beanie){ctx.save();ctx.beginPath();ctx.ellipse(0,hy,hr,hr*1.04,0,0,7);ctx.clip();ctx.fillStyle=c.hair;
      if(c.hood){ctx.beginPath();ctx.ellipse(0,hy-hr*.82,hr*1.1,hr*.5,0,0,7);ctx.fill()}
      else if(c.long){ctx.beginPath();ctx.ellipse(-hr*.2,hy-hr*.8,hr*1.15,hr*.55,-.15,0,7);ctx.fill();ctx.fillRect(-hr,hy-hr*.6,hr*.24,hr*1.5);ctx.fillRect(hr*.76,hy-hr*.6,hr*.24,hr*1.5)}
      else{ctx.beginPath();ctx.ellipse(0,hy-hr*.78,hr*1.2,hr*.6,0,0,7);ctx.fill()}
      ctx.restore();ctx.beginPath();ctx.ellipse(0,hy,hr,hr*1.04,0,0,7);ctx.strokeStyle=OLc;ctx.lineWidth=oo*2;ctx.stroke()}
    face(c,p,hy,hr,s);
    if(c.beard){ctx.beginPath();ctx.ellipse(0,hy,hr,hr*1.04,0,0,7);ctx.strokeStyle=OLc;ctx.lineWidth=oo*2;ctx.stroke()}
  }else if(c.long){orr(-hr*1.05,hy-hr*.5,hr*2.1,hr*1.9,hr*.55,c.hair,oo)}
  if(c.beanie){shapeO(()=>{ctx.beginPath();ctx.ellipse(0,hy-hr*.35,hr*1.04,hr*.82,0,Math.PI,0);ctx.closePath()},K.red,oo);orr(-hr*1.08,hy-hr*.48,hr*2.16,hr*.42,hr*.2,'#b83236',oo);oblob(0,hy-hr*1.22,hr*.3,hr*.3,'#ff9a9a',oo)}
  if(c.phones&&!p.noPhones){ctx.lineCap='round';ctx.strokeStyle=OLc;ctx.lineWidth=6.5;ctx.beginPath();ctx.arc(0,hy,hr*1.14,Math.PI*1.1,Math.PI*1.9);ctx.stroke();ctx.strokeStyle='#5b6274';ctx.lineWidth=3;ctx.stroke();orr(-hr*1.32,hy-6,9,16,4,'#2b2f3a',oo);orr(hr*1.32-9,hy-6,9,16,4,'#2b2f3a',oo)}
  if(p.headExtra)p.headExtra(hy,hr,oo);
  ctx.restore();ctx.restore();ctx.restore();return{A,grips}}
// convert a figure-local point to world
function fw(x,y,s,lx,ly){return[x+lx*s,y+ly*s]}
// ---------- first-person arm (shoulder off-frame), with QA
function fpArm(S,T,o){const L1=o.L1||Math.hypot(T[0]-S[0],T[1]-S[1])*.56,L2=o.L2||L1;const r=ikPole(S,T,L1,L2,o.pole||[S[0],T[1]+200]);tube([S,r.E,r.T],o.w,o.col||K.must,o.o??2.8);
  const fang=Math.atan2(r.T[1]-r.E[1],r.T[0]-r.E[0]);const kind=o.hand||'relax';let g=null;if(kind!=='none')g=drawHand(r.T[0],r.T[1],fang+clamp(o.wrist||0,-35,35)*RAD,o.k||2,kind,o.skin||K.skin,o.o??2.8,{thumbToward:o.thumbToward,spread:o.spread});
  if(!r.reach)qaFlag('first-person arm cannot reach its target');return Object.assign(r,{fang,g})}
// ---------- props
function toyWalkie(x,y,k,o,led=.7,rot=0,press=0){ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.scale(k,k);const oo=o/k;
  orr(-3,-34,6,22,3,'#23262f',oo);oblob(0,-36,4,4,K.amb,oo);orr(-13,-16,26,46,7,'#2f7fd6',oo);orr(-9,-11,18,15,3,'#164a87',oo*.6);ctx.strokeStyle='#0c2748';ctx.lineWidth=1.4;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(-6,-8+i*4.5);ctx.lineTo(6,-8+i*4.5);ctx.stroke()}
  orr(-8,8+press*1.2,16,6-press,3,press?'#d58a12':K.amb,oo*.6);oblob(8,-14,2.3,2.3,led>.1?'#4ade80':'#1c3b2a',oo*.5);
  if(led>.1){ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(8,-14,0,8,-14,14);g.addColorStop(0,`rgba(74,222,128,${.85*led})`);g.addColorStop(1,'rgba(74,222,128,0)');ctx.fillStyle=g;ctx.fillRect(-8,-30,32,32);ctx.restore()}
  ctx.restore()}
function crayon(t,x,y,size,col,o={}){ctx.save();ctx.font=`700 ${size}px Caveat`;ctx.textAlign='left';const r=mul(o.seed||7);let w=0;const chs=[...t];const ws=chs.map(ch=>{const m=ctx.measureText(ch==='Я'?'R':ch).width+(o.ls||0);w+=m;return m});let cx=x-w/2;const n=o.reveal===undefined?chs.length:Math.floor(clamp(o.reveal)*chs.length+.001);const pos=[];
  chs.forEach((ch,i)=>{const jx=(r()-.5)*size*.05,jy=(r()-.5)*size*.08,ro=(r()-.5)*.08;pos.push([cx+ws[i]/2,y-size*.33]);if(i<n){ctx.save();ctx.translate(cx+ws[i]/2+jx,y+jy);ctx.rotate(ro);if(ch==='Я')ctx.scale(-1,1);const c2=ch==='Я'?'R':ch;const hw=ctx.measureText(c2).width/2;ctx.globalAlpha=(o.alpha??1)*.93;ctx.fillStyle=col;ctx.fillText(c2,-hw,0);ctx.globalAlpha=(o.alpha??1)*.4;ctx.fillText(c2,-hw+size*.02,size*.02);ctx.restore()}cx+=ws[i]});ctx.restore();return pos}
function paperSheet(x,y,w,h,rot,col='#f1ead8',torn=false){ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(-w/2+5,-h/2+7,w,h);ctx.beginPath();ctx.moveTo(-w/2,-h/2);if(torn){for(let i=0;i<=12;i++)ctx.lineTo(-w/2+i*w/12,-h/2+(i%2?4:-2))}else ctx.lineTo(w/2,-h/2);ctx.lineTo(w/2,h/2);ctx.lineTo(-w/2,h/2);ctx.closePath();ctx.fillStyle=col;ctx.fill();ctx.strokeStyle=OLc;ctx.lineWidth=2.4;ctx.stroke();ctx.fillStyle='rgba(60,90,160,.12)';for(let i=1;i<6;i++)ctx.fillRect(-w/2+6,-h/2+i*h/6,w-12,1.2);ctx.restore()}

function fpReach(S,tip,o){const kind=o.hand||'point',k=o.k||2,L=(o.tipLen??HAND_LEN[kind])*k;let wrist=[tip[0]-L*.7,tip[1]];let r;
  for(let it=0;it<6;it++){const L1=o.L1||Math.hypot(wrist[0]-S[0],wrist[1]-S[1])*.56;r=ikPole(S,wrist,o.L1||L1,o.L2||L1,o.pole||[S[0],wrist[1]+200]);const a=Math.atan2(r.T[1]-r.E[1],r.T[0]-r.E[0])+clamp(o.wrist||0,-35,35)*RAD;wrist=[tip[0]-Math.cos(a)*L,tip[1]-Math.sin(a)*L]}
  const L1=o.L1||Math.hypot(wrist[0]-S[0],wrist[1]-S[1])*.56;const res=fpArm(S,wrist,Object.assign({},o,{L1:o.L1||L1,L2:o.L2||L1}));const a=res.fang+clamp(o.wrist||0,-35,35)*RAD;const got=[res.T[0]+Math.cos(a)*L,res.T[1]+Math.sin(a)*L];
  const err=Math.hypot(got[0]-tip[0],got[1]-tip[1]);if(err>3)qaFlag((o.name||'contact')+' misses by '+err.toFixed(1)+'px');res.tip=got;res.err=err;return res}
