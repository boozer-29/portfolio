// ============ EPISODE 3 — vote + CTA ============
function miniHand(t,x,y,w,h){ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();vgrad(y,y+h,[[0,'#232a3c'],[1,'#10162a']]);
  const q=EZ.io(((t*.4)%1.25)/1.0>1?1:((t*.4)%1.25));const wx=lerp(x+w*.18,x+w*.52,Math.min(1,q)),led=Math.max(0,1-Math.max(0,q-.8)*5);
  ctx.save();ctx.translate(x+w*.72,y+h*.62);blk(-34,-8,68,36,14,REY.skin,{hi:.2});for(let i=0;i<4;i++)blk(-30+i*16,-22,14,26,6,'#e7bd97',{hi:.25});ctx.restore();
  toyWalkie(wx,y+h*.4,.5,{led:led});ctx.restore()}
function miniTapDown(t,x,y,w,h){ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();vgrad(y,y+h,[[0,'#5a6684'],[1,'#2a3350']]);
  for(let i=0;i<4;i++){const py=y+14+i*(h/3.4),sd=i%2?1:-1;ctx.fillStyle='#1a2030';ctx.fillRect(x+w*.2,py,w*.6,5);if(i<3){ctx.strokeStyle='#1a2030';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(sd>0?x+w*.25:x+w*.75,py);ctx.lineTo(sd>0?x+w*.75:x+w*.25,py+h/3.4);ctx.stroke()}}
  const q=(t*.3)%1;const dy=y+14+q*(h-28);const pu=1+.3*Math.sin(t*8);glow(x+w*.5,dy,22*pu,C.red,.7);circ(x+w*.5,dy,5,C.red);
  const r=mul(3);for(let i=0;i<30;i++){faceUp(x+r()*w,y+h-10-r()*18,.22,i,t)}
  for(let i=0;i<3;i++){const ph=(t*1.1+i/3)%1;ctx.strokeStyle=`rgba(255,255,255,${.5*(1-ph)})`;ctx.lineWidth=2;ctx.beginPath();ctx.arc(x+w*.88,y+h*.25,6+ph*22,0,7);ctx.stroke()}ctx.restore()}
SC.vote=(t,u,d)=>{const t0=CU.vote_t;vgrad(0,H,[[0,'#0c1020'],[1,'#07090f']]);const g=ctx.createRadialGradient(270,400,0,270,400,520);g.addColorStop(0,'rgba(60,80,130,.35)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);dust(t,0,200,W,600,30,50,'#9fb4d8',.3,.3);
  const warm=clamp((t-t0[3])/.6);if(warm>0)glow(270,500,380,C.amb,.14*warm*(.7+.3*Math.sin(t*3)));
  const title='WHAT DO YOU DO?';const n=Math.floor(clamp((t-t0[0])/.5)*title.length);ctx.textAlign='center';ctx.font='60px "Bebas Neue"';ctx.letterSpacing='2px';ctx.fillStyle='#F4F4EF';ctx.fillText(title.slice(0,n),270,292);
  const pulse=1+.025*Math.sin((t-t0[3])*Math.PI/1.0)*(t>t0[3]?1:0);
  function card(y,tc0,col,letter,l1,l2,tc,mini){if(t<tc0)return;const q=EZ.ob(clamp((t-tc0)/.35));ctx.save();ctx.globalAlpha=clamp((t-tc0)/.2);ctx.translate(270,y+88);ctx.scale(pulse,pulse);ctx.translate(-270+40*(1-q),-y-88);
    ctx.fillStyle='rgba(0,0,0,.4)';rr(34,y+8,472,176,22);ctx.fill();blk(30,y,472,176,22,'#161c30',{hi:.14});blk(46,y+14,62,62,14,col,{hi:.25});ctx.fillStyle=tc;ctx.font='58px "Bebas Neue"';ctx.letterSpacing='0px';ctx.textAlign='center';ctx.fillText(letter,77,y+62);
    ctx.fillStyle='#F4F4EF';ctx.textAlign='left';ctx.font='38px "Bebas Neue"';ctx.letterSpacing='2px';ctx.fillText(l1,124,y+46);ctx.fillStyle='#8A8F99';ctx.font='600 13px "JetBrains Mono"';ctx.fillText(l2,124,y+68);ctx.textAlign='center';
    ctx.save();rr(46,y+84,440,84,14);ctx.clip();mini(t,46,y+84,440,84);ctx.restore();ctx.restore()}
  card(312,t0[1],C.lime,'A','HAND IT OVER','SILENCE HIM · KEEP THEM ALIVE','#0A0D16',miniHand);
  card(504,t0[2],C.red,'B','TAP BACK','GO DOWN ALONE','#fff',miniTapDown);
  if(t>=t0[4]){ctx.globalAlpha=EZ.io(pr(t,t0[4],t0[4]+.3));ctx.font='600 13px "JetBrains Mono"';ctx.letterSpacing='1.5px';ctx.fillStyle=C.lime;ctx.fillText('COMMENT A OR B · THE MOST VOTED CHOICE DECIDES',270,762);ctx.globalAlpha=1}};
SC.cta=(t,u,d)=>{rect(0,0,W,H,'#000');
  const a=EZ.io(pr(t,CU.cta_t,CU.cta_t+8/30));ctx.globalAlpha=a;ctx.textAlign='center';ctx.font='96px "Bebas Neue"';ctx.letterSpacing='3px';ctx.fillStyle='#fff';ctx.fillText('FOLLOW FOR',270,470);ctx.fillStyle=C.lime;ctx.font='150px "Bebas Neue"';ctx.fillText('HOUR 54',270,590);ctx.globalAlpha=1;
  // three faint rings = three taps, in the dark
  for(const k of[0,.5,1]){const q=(u-.7-k*.3);if(q>0&&q<.9){ctx.strokeStyle=`rgba(255,255,255,${.25*(1-q/.9)})`;ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(270,520,60+q*300,0,7);ctx.stroke()}}};
