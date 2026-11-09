// ============ CHARACTERS: puppet rig (front/back view), faces, sleepers ============
function limb(x,y,len,w,ang,col,r=4,o={}){ctx.save();ctx.translate(x,y);ctx.rotate(ang*Math.PI/180);blk(-w/2,0,w,len,r,col,o);ctx.restore()}
function faceFront(o,p){ // eyes/brows/mouth in head-local coords (head box -13..13, -68..-42)
  const ex=5.2,ey=-57,tn=p.turn*3.2;const st=o.eyes||'open';
  if(o.under||st==='closed'){ctx.fillStyle='rgba(70,60,98,.42)';rr(-ex-3.4+tn,ey+3.2,6.8,3,1.5);ctx.fill();rr(ex-3.4+tn,ey+3.2,6.8,3,1.5);ctx.fill()}
  for(const sx of[-1,1]){const x=sx*ex+tn;
    if(st==='closed'){ctx.fillStyle='#1b1f2b';rr(x-3.2,ey+.4,6.4,1.7,1);ctx.fill();ctx.fillRect(x-3,ey+2,.9,1.6);ctx.fillRect(x-.4,ey+2,.9,1.8);ctx.fillRect(x+2.1,ey+2,.9,1.6)}
    else if(st==='glow'){glow(x,ey,10,C.eye,.3);ctx.fillStyle=C.eye;rr(x-3.2,ey-3.4,6.4,6.8,1.6);ctx.fill();ctx.fillStyle='#b9e6ff';ctx.fillRect(x-1.4,ey-1.4,2.8,2.8)}
    else{const w=st==='wide'?7.6:6.2,h=st==='wide'?8.2:6.6;ctx.fillStyle='#f4f4ef';rr(x-w/2,ey-h/2,w,h,1.6);ctx.fill();ctx.fillStyle='#1b1f2b';const lx=(o.look||0)*1.6;rr(x-1.7+lx,ey-1.7,3.4,3.6,1);ctx.fill();
      if(st==='half'){ctx.fillStyle=o.skinc;ctx.fillRect(x-w/2-.5,ey-h/2-.5,w+1,h*.55)}}
  }
  if(o.brow){ctx.strokeStyle='#1b1f2b';ctx.lineWidth=1.8;ctx.lineCap='round';for(const sx of[-1,1]){ctx.beginPath();ctx.moveTo(sx*ex+tn-3.5*sx*-1,ey-6+(o.brow>0?0:1.5));ctx.lineTo(sx*ex+tn+3.5*sx*-1,ey-6-(o.brow>0?1.5:-1.5)*sx*0);ctx.stroke()}}
  if(o.mouth==='o'){ctx.fillStyle='#2a1a1f';rr(-3+tn,-49,6,6,2.5);ctx.fill()}
  else if(o.mouth==='line'){ctx.fillStyle='#3a2a2f';ctx.fillRect(-3.5+tn,-47,7,1.5)}
  else if(o.mouth==='smile'){ctx.strokeStyle='#3a2a2f';ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(tn,-49,4,.2,Math.PI-.2);ctx.stroke()}
  else if(o.mouth==='gasp'){ctx.fillStyle='#2a1a1f';rr(-4+tn,-50,8,8,3);ctx.fill()}
}
function head(o,p){ // head box local: x -13..13, y -68..-42, pivot at neck (0,-42)
  ctx.save();ctx.translate(0,-42);ctx.rotate(p.tilt*Math.PI/180);ctx.translate(0,42);
  const sk=o.skin;o.skinc=sk;const tn=p.turn*2.2;
  // hood behind
  if(o.hood){blk(-16.5,-72,33,32,13,shade(o.top,-.2),{hi:.1,lo:-.2})}
  if(o.back){ // back of head: hair/hood only
    blk(-13,-68,26,26,9,o.hood?shade(o.top,-.1):o.hair,{hi:.18});
    if(!o.hood){ctx.fillStyle=shade(o.hair,-.3);ctx.fillRect(-13,-52,26,10)}
    if(o.phones){ctx.fillStyle='#e8e8e0';ctx.fillRect(-14,-60,28,3)}
  }else{
    blk(-11.5+tn,-67,23-Math.abs(tn)*.6,25,8,sk,{hi:.14,lo:-.18,side:tn>0?1:-1,rim:o.rim});
    // hair / hats
    if(o.hairStyle==='short'){blk(-12+tn,-69,24,9,5,o.hair,{hi:.2})}
    else if(o.hairStyle==='long'){blk(-13+tn,-69,26,10,5,o.hair);ctx.fillStyle=o.hair;ctx.fillRect(-13+tn,-62,4,20);ctx.fillRect(9+tn,-62,4,20)}
    else if(o.hairStyle==='cap'){blk(-13+tn,-70,26,10,5,o.hat||C.red)}
    if(o.hat==='beanie'){blk(-13+tn,-72,26,13,6,o.hatc||C.red,{hi:.25});ctx.fillStyle=shade(o.hatc||C.red,-.25);ctx.fillRect(-13+tn,-62,26,3);circ(tn,-74,3.2,shade(o.hatc||C.red,.3))}
    if(o.hood){ctx.strokeStyle=shade(o.top,-.35);ctx.lineWidth=2.2;rr(-12+tn,-68,24,26,8);ctx.stroke()}
    faceFront(o,p);
    if(o.beard){blk(-11+tn,-52,22,10,5,o.beard,{hi:.12});ctx.fillStyle=shade(o.beard,.2);ctx.fillRect(-6+tn,-53,12,2)}
    if(o.phones){ctx.strokeStyle='#1d212b';ctx.lineWidth=3.2;ctx.beginPath();ctx.arc(tn,-60,15,Math.PI*1.05,Math.PI*1.95);ctx.stroke();blk(-17+tn,-62,6,12,3,'#1d212b');blk(11+tn,-62,6,12,3,'#1d212b')}
  }
  // ears
  if(!o.back){blk(-14.2+tn,-57,3.2,7,1.5,shade(sk,-.1));blk(11+tn,-57,3.2,7,1.5,shade(sk,-.1))}
  ctx.restore()}
function person(o){
  const p=Object.assign({lean:0,bob:0,tilt:0,turn:0,aL:6,aR:6,eL:0,eR:0,hL:3,hR:3,kL:0,kR:0,squash:0,breath:0},o.pose||{});
  o=Object.assign({skin:'#e0b48c',top:C.must,bottom:'#3b4252',shoe:'#1d2230',hair:'#2a2f3a',hairStyle:'short',eyes:'open',s:1,flip:1},o);
  ctx.save();ctx.translate(o.x,o.y);ctx.scale(o.s*o.flip,o.s);
  if(o.shadow!==0)shadowE(0,1,27,6,.5);
  const hipY=-44+p.bob+(o.kneel?22:0);
  // legs
  for(const sd of[-1,1]){const hip=sd<0?p.hL:p.hR,kn=sd<0?p.kL:p.kR;ctx.save();ctx.translate(sd*8.5,hipY);ctx.rotate(-sd*hip*Math.PI/180);
    blk(-6,0,12,23,4,o.bottom,{rim:o.rim,side:sd});
    if(!o.kneel){ctx.translate(0,22);ctx.rotate(-sd*kn*Math.PI/180);blk(-5.4,0,10.8,22,4,o.bottom,{rim:o.rim,side:sd});blk(-7,17,14,8.5,4,o.shoe,{hi:.3})}
    else{blk(-7,16,14,8,4,o.shoe,{hi:.3})}
    ctx.restore()}
  // torso + arms + head
  ctx.save();ctx.translate(0,hipY);ctx.rotate(p.lean*Math.PI/180);ctx.scale(1,1-p.squash+p.breath);
  blk(-17,-38,34,41,8,o.top,{rim:o.rim,side:o.rimSide||1});
  if(o.hood){ctx.fillStyle=shade(o.top,-.22);rr(-10,-12,20,9,4);ctx.fill();ctx.fillStyle=shade(o.top,.25);ctx.fillRect(-1.2,-38,2.4,10);ctx.fillRect(-6,-37,1.6,9);ctx.fillRect(4.4,-37,1.6,9)}
  if(o.collar){ctx.fillStyle=o.collar;ctx.fillRect(-8,-38,16,5)}
  if(o.stripe){ctx.fillStyle=o.stripe;ctx.fillRect(-17,-20,34,3)}
  blk(-4.2,-43,8.4,7,2,shade(o.skin,-.15));
  if(!o.noArms)for(const sd of[-1,1]){const a=sd<0?p.aL:p.aR,e=sd<0?p.eL:p.eR;ctx.save();ctx.translate(sd*19,-34);ctx.rotate(-sd*a*Math.PI/180);blk(-5,-1,10,18,4.5,o.top,{rim:o.rim,side:sd});ctx.translate(0,16.5);ctx.rotate(sd*e*Math.PI/180);blk(-4.6,-1,9.2,17,4.2,o.sleeveC||o.top);blk(-4.2,14,8.4,8.5,3.6,o.glove||o.skin,{hi:.15});if(o.handItem)o.handItem(sd);ctx.restore()}
  head(o,p);
  ctx.restore();ctx.restore()}
// ---- sleepers
const TOPS=['#6b7280','#7d6f66','#59657a','#8a7f6f','#4f5d6b','#6f6a7a'],BOTS=['#3b4252','#4a4540','#35404f','#2f3a45'],HAIRS=['#2a2f3a','#4a3a2a','#8a8a90','#1b1f2a'];
function sleeperOpts(seed){const r=mul(seed*7+3);const pick=a=>a[Math.floor(r()*a.length)];return{skin:C.skin,top:pick(TOPS),bottom:pick(BOTS),shoe:'#222633',hair:pick(HAIRS),hairStyle:pick(['short','long','short','none']),eyes:'closed',under:true,
 pose:{lean:5+r()*3,tilt:11+r()*5,aL:7+r()*5,aR:7+r()*5,eL:-6,eR:-6,hL:4,hR:4,kL:3,kR:3}}}
function sleeper(x,y,s,seed,t=0,st={}){ // live (animated) sleeper: slow sway, optional hum rings
  const o=sleeperOpts(seed);o.x=x;o.y=y;o.s=s;o.eyes=st.eyes||'closed';if(st.top)o.top=st.top;if(st.hair)o.hair=st.hair;if(st.bottom)o.bottom=st.bottom;
  const sw=(st.sway??1)*Math.sin(t*1.1+seed);o.pose.lean+=sw*1.2;o.pose.tilt+=(st.tilt||0)+sw*.8;o.pose.turn=st.turn||0;o.pose.bob=Math.sin(t*1.7+seed)*.35;o.pose.breath=Math.sin(t*1.5+seed)*.012;
  if(st.kneel){o.kneel=true;o.pose.lean=14;o.pose.tilt=(st.tilt||0)+20;o.pose.aL=9;o.pose.aR=9}
  if(st.rim){o.rim=st.rim;o.rimSide=st.rimSide||1}
  if(st.back){o.back=true}
  person(o);
  if(st.hum){ctx.save();ctx.translate(x,y-(st.kneel?62:86)*s);for(let i=0;i<3;i++){const r=((t*26+i*10)%30);ctx.strokeStyle=rgba('#E6F7FF',.5*(1-r/30));ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(0,0,(6+r)*s,0,7);ctx.stroke()}ctx.restore()}
}
function sleeperSprite(v,state,eyes){const key=`slp${v}_${state}_${eyes}`;const dm=state==='lie'?[240,74]:[90,140];return sprite(key,dm[0],dm[1],()=>{const o=sleeperOpts(v);o.x=0;o.y=0;o.s=1;o.eyes=eyes;
  if(state==='kneel'){o.kneel=true;o.pose.lean=14;o.pose.tilt=22}
  if(state==='turnL'||state==='turnR'){o.pose.turn=state==='turnL'?-1:1;o.pose.tilt=18*(state==='turnL'?-1:1)}
  if(state==='lie'){ctx.save();ctx.translate(0,-4);ctx.rotate(-1.5);person(o);ctx.restore()}
  else person(o)})}
function sleeperAt(x,y,s,v,state='stand',eyes='closed',alpha=1){blit(sleeperSprite(v,state,eyes),x,y,s,1,alpha)}

// ---- joint-based arms: exactly one pair, attached at shoulders, reaching a target
function shoulderPts(o,pose={}){const s=o.s||1,fl=o.flip||1,bob=pose.bob||0;const hip=-44+bob-(o.kneel?-22:0)*0;const y=o.y+(hip-34)*s;return[[o.x-19*s*fl,y],[o.x+19*s*fl,y]]} // [left,right] on screen
function ik2(S,H,L1,L2,out,down){let dx=H[0]-S[0],dy=H[1]-S[1],d=Math.hypot(dx,dy);const mx=L1+L2-1;if(d>mx){const k=mx/d;dx*=k;dy*=k;d=mx;H=[S[0]+dx,S[1]+dy]}const a=(L1*L1-L2*L2+d*d)/(2*d);const h=Math.sqrt(Math.max(0,L1*L1-a*a));const ux=dx/d,uy=dy/d;let E=[S[0]+ux*a-uy*h,S[1]+uy*a+ux*h];const E2=[S[0]+ux*a+uy*h,S[1]+uy*a-ux*h];const mid=[(S[0]+H[0])/2,(S[1]+H[1])/2];if(down){const sc=(P)=>P[1]+(P[0]-mid[0])*out*.7;if(sc(E2)>sc(E))E=E2}else if((E[0]-mid[0])*out<(E2[0]-mid[0])*out)E=E2;return{E,H}}
function limbT(P,Q,w0,w1,col){const dx=Q[0]-P[0],dy=Q[1]-P[1],d=Math.hypot(dx,dy)||1,nx=-dy/d,ny=dx/d;ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(P[0]+nx*w0/2,P[1]+ny*w0/2);ctx.lineTo(Q[0]+nx*w1/2,Q[1]+ny*w1/2);ctx.lineTo(Q[0]-nx*w1/2,Q[1]-ny*w1/2);ctx.lineTo(P[0]-nx*w0/2,P[1]-ny*w0/2);ctx.closePath();ctx.fill();circ(P[0],P[1],w0/2,col);circ(Q[0],Q[1],w1/2,col);
  ctx.strokeStyle=shade(col,.2);ctx.lineWidth=Math.max(1.5,Math.min(w0,w1)*.14);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(P[0]+nx*w0*.28,P[1]+ny*w0*.28);ctx.lineTo(Q[0]+nx*w1*.28,Q[1]+ny*w1*.28);ctx.stroke();ctx.strokeStyle=shade(col,-.22);ctx.beginPath();ctx.moveTo(P[0]-nx*w0*.34,P[1]-ny*w0*.34);ctx.lineTo(Q[0]-nx*w1*.34,Q[1]-ny*w1*.34);ctx.stroke()}
function armIK(S,H,o){if(o.auto){const dd=Math.hypot(H[0]-S[0],H[1]-S[1]);o.L1=o.L2=Math.max(o.min||40,dd*o.auto)}const r=ik2(S,H,o.L1,o.L2,o.out,o.down);limbT(S,r.E,o.w0,(o.w0+o.w1)/2,o.col);limbT(r.E,r.H,(o.w0+o.w1)/2,o.w1,o.col);const hw=o.w1*1.15;ctx.save();ctx.translate(r.H[0],r.H[1]);blk(-hw/2,-hw/2,hw,hw,hw*.38,o.skin||'#e0b48c',{hi:.18});ctx.restore();return r}
