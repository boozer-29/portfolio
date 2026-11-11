// ===== HOURS AWAKE — outlined 2D rig (v6). Logical canvas 540x960, drawn at 2x.
const cv=document.getElementById('c'),ctx=cv.getContext('2d');const W=540,H=960;
const OL='#1b1e29';
const C={must:'#EAB308',red:'#E5484D',lime:'#C6F432',amb:'#F5A524',teal:'#14b8a6',olive:'#5b6b3c',purple:'#8b5cf6',skin:'#E8B98F',skinR:'#D3A47E',slp:'#C9CED6',jeans:'#33405c',dark:'#232838'};
const R2=Math.PI/180;const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));const lerp=(a,b,t)=>a+(b-a)*t;
function shade(hex,k){const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const f=k<0?0:255,a=Math.abs(k);r=Math.round(r+(f-r)*a);g=Math.round(g+(f-g)*a);b=Math.round(b+(f-b)*a);return`rgb(${r},${g},${b})`}
// ---- outlined primitives. o = outline width (screen px)
function path(pts){ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i][0],pts[i][1])}
function tubeO(pts,w,o){ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=OL;ctx.lineWidth=w+2*o;path(pts);ctx.stroke()}
function tubeF(pts,w,col){ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=col;ctx.lineWidth=w;path(pts);ctx.stroke()}
function tube(pts,w,col,o){tubeO(pts,w,o);tubeF(pts,w,col)}
function shapeO(fn,col,o){ctx.lineJoin='round';fn();ctx.strokeStyle=OL;ctx.lineWidth=o*2;ctx.stroke();ctx.fillStyle=col;ctx.fill()}
function blob(x,y,rx,ry,col,o,rot=0){shapeO(()=>{ctx.beginPath();ctx.ellipse(x,y,rx,ry,rot,0,7)},col,o)}
function rrect(x,y,w,h,r,col,o){shapeO(()=>{ctx.beginPath();ctx.roundRect(x,y,w,h,r)},col,o)}
// union of several tubes/blobs with ONE outline (outline pass first, then fill pass)
function union(parts,col,o){for(const p of parts){if(p.t)tubeO(p.t,p.w,o);else{ctx.beginPath();ctx.ellipse(p.x,p.y,p.rx,p.ry,p.rot||0,0,7);ctx.strokeStyle=OL;ctx.lineWidth=o*2;ctx.stroke()}}
  for(const p of parts){if(p.t)tubeF(p.t,p.w,p.col||col);else{ctx.beginPath();ctx.ellipse(p.x,p.y,p.rx,p.ry,p.rot||0,0,7);ctx.fillStyle=p.col||col;ctx.fill()}}}
// 2-bone IK; bend: +1/-1 picks elbow side
function ik(S,T,L1,L2,bend){let dx=T[0]-S[0],dy=T[1]-S[1],d=Math.hypot(dx,dy);const mx=L1+L2-.01;if(d>mx){dx*=mx/d;dy*=mx/d;d=mx}d=Math.max(d,Math.abs(L1-L2)+.01);
  const a=Math.acos(clamp((L1*L1+d*d-L2*L2)/(2*L1*d),-1,1));const base=Math.atan2(dy,dx)+bend*a;const E=[S[0]+Math.cos(base)*L1,S[1]+Math.sin(base)*L1];return{E,T:[S[0]+dx,S[1]+dy]}}
// ---- HANDS. Local frame: wrist at (0,0), hand points along +y. k = scale. returns nothing.
// kind: relax | open | point | fist | palmUp | grip (grip has part:'back'|'front')
function hand(x,y,ang,k,kind,skin,o,opt={}){ctx.save();ctx.translate(x,y);ctx.rotate(ang);ctx.scale(k*(opt.flip?-1:1),k);const oo=o/k;
  const P=[],fw=4.6;
  const palm={x:0,y:9.5,rx:8.6,ry:9,col:skin};
  if(kind==='open'||kind==='palmUp'){const sp=opt.spread??1;
    [[-6,-14],[-2,-4],[2.2,5],[6,15]].forEach(([fx,a],i)=>{const L=i==1||i==2?13.5:11.5;const r=(a*sp)*R2;P.push({t:[[fx*.9,14],[fx*.9+Math.sin(r)*L,14+Math.cos(r)*L]],w:fw})});
    P.push({t:[[-7,6],[-14,13]],w:5.2});P.push(palm);union(P,skin,oo);
    if(kind==='palmUp'){ctx.strokeStyle='rgba(0,0,0,.18)';ctx.lineWidth=1/k*1.2;ctx.beginPath();ctx.arc(0,9,5,.3,2.4);ctx.stroke()}}
  else if(kind==='relax'){P.push({x:0,y:9,rx:8.6,ry:8.4,col:skin});P.push({t:[[0,13],[0,18.5]],w:13.5});P.push({t:[[-7.4,5],[-10.2,12.5]],w:5});union(P,skin,oo);
    ctx.strokeStyle='rgba(0,0,0,.22)';ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(-2.2,17);ctx.lineTo(-2.2,23);ctx.moveTo(2.2,17);ctx.lineTo(2.2,23);ctx.stroke()}
  else if(kind==='point'){P.push({t:[[-2,14],[-2.6,30]],w:fw});P.push({x:1.5,y:16,rx:7.5,ry:5.5,col:skin});P.push({t:[[-7,7],[-8,15]],w:5});P.push(palm);union(P,skin,oo)}
  else if(kind==='fist'){P.push({x:0,y:12,rx:9.5,ry:10});P.push({t:[[-7,6],[-5,16]],w:5.2});union(P,skin,oo);ctx.strokeStyle=OL;ctx.lineWidth=1.3/k*1.6;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(-4.5+i*4.5,17);ctx.lineTo(-4.5+i*4.5,21);ctx.stroke()}}
  else if(kind==='grip'){ // fingers wrap AROUND an object of thickness opt.th lying across the hand at y=opt.at
    const at=opt.at??14,th=opt.th??8;
    if(opt.part==='back'){ // finger segments on the far side of the object (drawn BEFORE the object)
      for(const fx of[-5.6,-1.9,1.9,5.6]){P.push({t:[[fx,at-th/2-2],[fx,at+th/2+3]],w:fw})}union(P,shade(skin,-.12),oo)}
    else{ // palm + knuckle line + thumb on the near side (drawn AFTER the object)
      P.push({x:0,y:at-th/2-5,rx:9,ry:7.5,col:skin});P.push({t:[[-8,at-th/2-6],[-11.5,at+1]],w:5.2});union(P,skin,oo);
      ctx.strokeStyle='rgba(0,0,0,.25)';ctx.lineWidth=1.2/k*1.5;for(const fx of[-4,0,4]){ctx.beginPath();ctx.moveTo(fx,at-th/2-2.5);ctx.lineTo(fx,at-th/2);ctx.stroke()}}}
  ctx.restore()}
// ---- FIGURE (front or back). height ≈ 190*s from feet (x,y). pose: hands targets etc.
const CAST={
 you:{skin:C.skin,top:C.must,bot:C.jeans,shoe:'#1d2230',hair:'#4a3020',hood:true},
 ollie:{skin:'#D9A57A',top:C.red,bot:'#2f4a7a',shoe:'#1d2230',beanie:true,kid:true},
 reyes:{skin:C.skinR,top:C.olive,bot:'#3b3f2e',shoe:'#1d2230',bald:true,beard:'#a9adb5',brow:true},
 maya:{skin:'#C88E66',top:C.teal,bot:'#0f7d71',shoe:'#e8e8e0',hair:'#3a2618',long:true},
 dj:{skin:'#8a5a3c',top:C.purple,bot:'#2a2e3c',shoe:'#e8e8e0',hair:'#1b1b22',phones:true,teen:true},
 sleeper:{skin:C.slp,top:'#6b7280',bot:'#3b4252',shoe:'#222633',hair:'#3a3f4a',sleeper:true}};
function fig(who,x,y,s,p={}){const c=Object.assign({},CAST[who],p.c||{});const o=p.o??2.6;const kid=c.kid?1:0,teen=c.teen?1:0;
  const hs=kid?1.32:1;const L=kid?.66:teen?.93:1;const back=!!p.back;
  ctx.save();ctx.translate(x,y);ctx.scale(s,s);const oo=o/s;
  const bob=p.bob||0,lean=(p.lean||0)*R2,tilt=(p.tilt||0)*R2;
  const kd=p.kneel?40*L:0;const hipY=-82*L+bob+kd,shY=-140*L+bob+kd,headY=shY-30*L*(kid?1.05:1);
  // shadow
  if(p.shadow!==false){ctx.fillStyle='rgba(0,0,0,.22)';ctx.beginPath();ctx.ellipse(0,2,30*L,6,0,0,7);ctx.fill()}
  // legs
  const kn=p.kneel?1:0;
  for(const sd of[-1,1]){const hx=sd*8*L;const fx=hx+sd*(p.stance??3)*L+(p.step?sd*p.step:0);let pts;
    if(kn){pts=[[hx,hipY],[hx+sd*3,-7*L]]}else{const ky=hipY+(-hipY)*.5;pts=[[hx,hipY],[lerp(hx,fx,.5)+(p.knee||0)*sd,ky],[fx,-6]]}
    tube(pts,15*L,c.bot,oo);if(kn){blob(hx+sd*3,-5*L,9*L,5*L,shade(c.bot,-.15),oo)}if(!kn){ctx.save();blob(fx+sd*2,-4,10*L,6*L,c.shoe,oo);ctx.restore()}}
  // torso (+ lean around hip)
  ctx.save();ctx.translate(0,hipY);ctx.rotate(lean);ctx.translate(0,-hipY);
  const tw=(kid?26:c.teen?30:32)*1,sw=tw*L*1.05;
  const torso=()=>{ctx.beginPath();ctx.moveTo(-sw*.5,shY-4);ctx.quadraticCurveTo(-sw*.62,(shY+hipY)/2,-tw*L*.5,hipY+4);ctx.lineTo(tw*L*.5,hipY+4);ctx.quadraticCurveTo(sw*.62,(shY+hipY)/2,sw*.5,shY-4);ctx.quadraticCurveTo(0,shY-10,-sw*.5,shY-4);ctx.closePath()};
  // arm helper
  const SH=[[-sw*.5+3,shY+3],[sw*.5-3,shY+3]];const UA=30*L,FA=27*L,aw=11*L;
  const arms=[],defT=[[-sw*.5-6,hipY+6],[sw*.5+6,hipY+6]];
  for(let i=0;i<2;i++){const T=(p.hands&&p.hands[i])||defT[i];const bend=(p.bend&&p.bend[i])??(i?-1:1);arms.push(ik(SH[i],T,UA,FA,bend))}
  const drawArm=(i)=>{if(p.noArm&&p.noArm[i])return;const a=arms[i];tube([SH[i],a.E,a.T],aw,c.top,oo);const kind=(p.hk&&p.hk[i])||'relax';
    if(kind!=='none'){const ang=Math.atan2(a.T[1]-a.E[1],a.T[0]-a.E[0])-Math.PI/2+((p.hr&&p.hr[i])||0);hand(a.T[0],a.T[1],ang,.95*L*(kid?1.05:1),kind,c.skin,o,{flip:(i===0)!==back,part:p.hpart&&p.hpart[i]})}};
  const behind=p.armsBehind||[back,back];
  for(let i=0;i<2;i++)if(behind[i])drawArm(i);
  shapeO(torso,c.top,oo);
  if(!back){ // details
    if(c.hood){ctx.strokeStyle=shade(c.top,-.25);ctx.lineWidth=1.6/s*2;ctx.beginPath();ctx.moveTo(-3,shY+2);ctx.lineTo(-4,shY+20);ctx.moveTo(3,shY+2);ctx.lineTo(4,shY+20);ctx.stroke();rrect(-11*L,hipY-24*L,22*L,14*L,5,shade(c.top,-.1),oo*.7)}
    if(who==='maya'){ctx.fillStyle=shade(c.top,-.25);ctx.beginPath();ctx.moveTo(-7,shY-3);ctx.lineTo(0,shY+11);ctx.lineTo(7,shY-3);ctx.fill()}
    if(who==='reyes'){rrect(-12,shY+16,9,8,2,shade(c.top,-.15),oo*.6);rrect(3,shY+16,9,8,2,shade(c.top,-.15),oo*.6)}
  }
  if(p.prop&&!p.propLast)p.prop(SH,arms,{shY,hipY,L,oo});
  for(let i=0;i<2;i++)if(!behind[i])drawArm(i);
  if(p.prop&&p.propLast)p.prop(SH,arms,{shY,hipY,L,oo});
  // head
  ctx.save();ctx.translate(0,shY-2);ctx.rotate(tilt);const hr=15*hs*L*(kid?1.08:1);const hy=-hr-4;
  if(c.hood){blob(0,hy+3,hr*1.25,hr*1.18,shade(c.top,-.12),oo)}
  if(c.long&&!back){rrect(-hr*1.1,hy-hr*.4,hr*2.2,hr*2.05,hr*.55,c.hair,oo)}
  tube([[0,0],[0,-6]],9*L,c.skin,oo);
  blob(0,hy,hr,hr*1.04,back?(c.hood?shade(c.top,-.05):(c.bald?c.skin:c.hair)):c.skin,oo);
  if(back&&c.long){blob(0,hy+5,hr*1.08,hr*1.25,c.hair,oo)}
  if(!back){const look=p.look||0,ey=hy-1;const eyes=p.eyes||'open';
    // hair
    if(c.hair&&!c.bald&&!c.beanie&&!c.hood){ctx.save();ctx.beginPath();ctx.ellipse(0,hy,hr,hr*1.04,0,0,7);ctx.clip();ctx.fillStyle=c.hair;ctx.beginPath();ctx.ellipse(0,hy-hr*.75,hr*1.2,hr*.62,0,0,7);ctx.fill();if(c.long){ctx.fillRect(-hr,hy-hr*.4,hr*.32,hr*1.4);ctx.fillRect(hr*.68,hy-hr*.4,hr*.32,hr*1.4)}ctx.restore();ctx.beginPath();ctx.ellipse(0,hy,hr,hr*1.04,0,0,7);ctx.strokeStyle=OL;ctx.lineWidth=oo*2;ctx.stroke()}
    if(c.hood){ctx.save();ctx.beginPath();ctx.ellipse(0,hy,hr,hr*1.04,0,0,7);ctx.clip();ctx.fillStyle=c.hair;ctx.beginPath();ctx.ellipse(0,hy-hr*.82,hr*1.1,hr*.5,0,0,7);ctx.fill();ctx.restore()}
    // eyes
    const ex=hr*.38;
    for(const sd of[-1,1]){const X=sd*ex+look*2.5;
      if(eyes==='closed'){ctx.strokeStyle=OL;ctx.lineWidth=1.7/s*2*.5+1.2;ctx.beginPath();ctx.arc(X,ey-1,3.2,.25,Math.PI-.25);ctx.stroke();if(c.sleeper){ctx.strokeStyle='rgba(90,80,120,.55)';ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(X,ey+1.5,3.6,.3,Math.PI-.3);ctx.stroke()}}
      else if(eyes==='happy'){ctx.strokeStyle=OL;ctx.lineWidth=2;ctx.beginPath();ctx.arc(X,ey+1.5,3,Math.PI+.3,-.3);ctx.stroke()}
      else{const big=eyes==='wide'?1.3:1;ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(X,ey,3.3*big,3.8*big,0,0,7);ctx.fill();ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.stroke();ctx.fillStyle=OL;ctx.beginPath();ctx.arc(X+look*1.2,ey+.4,1.75*big,0,7);ctx.fill();
        if(eyes==='half'){ctx.fillStyle=c.skin;ctx.fillRect(X-4.5,ey-5.5,9,4.4);ctx.strokeStyle=OL;ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(X-4,ey-1.1);ctx.lineTo(X+4,ey-1.1);ctx.stroke()}}}
    if(c.brow||p.brow){ctx.strokeStyle=OL;ctx.lineWidth=2;for(const sd of[-1,1]){ctx.beginPath();ctx.moveTo(sd*ex-sd*4,ey-6.5+(p.brow==='worry'?-1.5*sd:0));ctx.lineTo(sd*ex+sd*3.5,ey-6+(p.brow==='angry'?1.8:0));ctx.stroke()}}
    // mouth
    const m=p.mouth||'line';ctx.strokeStyle=OL;ctx.lineWidth=1.6;
    if(c.beard){ctx.save();ctx.beginPath();ctx.ellipse(0,hy,hr,hr*1.04,0,0,7);ctx.clip();ctx.fillStyle=c.beard;ctx.beginPath();ctx.ellipse(0,hy+hr*.78,hr*.95,hr*.55,0,0,7);ctx.fill();ctx.restore();ctx.beginPath();ctx.ellipse(0,hy,hr,hr*1.04,0,0,7);ctx.strokeStyle=OL;ctx.lineWidth=oo*2;ctx.stroke()}
    const my=hy+hr*.5;ctx.strokeStyle=OL;ctx.lineWidth=1.6;
    if(m==='smile'){ctx.beginPath();ctx.arc(0,my-2.5,4,.35,Math.PI-.35);ctx.stroke()}else if(m==='o'){ctx.fillStyle='#4a2028';ctx.beginPath();ctx.ellipse(0,my,2.3,2.8,0,0,7);ctx.fill()}else if(m==='sad'){ctx.beginPath();ctx.arc(0,my+3,3.5,Math.PI+.4,-.4);ctx.stroke()}else{ctx.beginPath();ctx.moveTo(-3,my);ctx.lineTo(3,my);ctx.stroke()}
    if(c.sleeper){ctx.fillStyle='rgba(120,110,150,.18)';ctx.beginPath();ctx.ellipse(0,hy,hr*.95,hr,0,0,7);ctx.fill()}
  }
  if(c.beanie){shapeO(()=>{ctx.beginPath();ctx.ellipse(0,hy-hr*.35,hr*1.04,hr*.82,0,Math.PI,0);ctx.closePath()},C.red,oo);rrect(-hr*1.08,hy-hr*.48,hr*2.16,hr*.42,hr*.2,'#b83236',oo);blob(0,hy-hr*1.22,hr*.3,hr*.3,'#ff9a9a',oo)}
  if(c.phones){ctx.lineCap='round';ctx.strokeStyle=OL;ctx.lineWidth=6.5;ctx.beginPath();ctx.arc(0,hy,hr*1.14,Math.PI*1.1,Math.PI*1.9);ctx.stroke();ctx.strokeStyle='#5b6274';ctx.lineWidth=3;ctx.stroke();rrect(-hr*1.32,hy-6,9,16,4,'#2b2f3a',oo);rrect(hr*1.32-9,hy-6,9,16,4,'#2b2f3a',oo)}
  ctx.restore();ctx.restore();ctx.restore()}
// ---- props
function walkie(x,y,k,o,led=.7,rot=0){ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.scale(k,k);const oo=o/k;
  rrect(-3,-34,6,22,3,'#23262f',oo);blob(0,-36,4,4,C.amb,oo);rrect(-13,-16,26,46,7,'#2f7fd6',oo);rrect(-9,-11,18,15,3,'#164a87',oo*.6);ctx.strokeStyle='#0c2748';ctx.lineWidth=1.4;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(-6,-8+i*4.5);ctx.lineTo(6,-8+i*4.5);ctx.stroke()}
  rrect(-8,8,16,6,3,C.amb,oo*.6);blob(8,-14,2.3,2.3,led>.1?'#4ade80':'#1c3b2a',oo*.5);if(led>.1){ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(8,-14,0,8,-14,12);g.addColorStop(0,`rgba(74,222,128,${.8*led})`);g.addColorStop(1,'rgba(74,222,128,0)');ctx.fillStyle=g;ctx.fillRect(-6,-28,28,28);ctx.restore()}
  rrect(-17,-2,5,12,2,'#23262f',oo*.6); // side PTT button
  ctx.restore()}
function label(t,x,y,size=13,col='#fff'){ctx.font=`700 ${size}px Montserrat, sans-serif`;ctx.textAlign='center';ctx.fillStyle=col;ctx.fillText(t,x,y)}
