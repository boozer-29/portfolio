// ---- vote (animated option cards) + CTA
function miniPlank(t,x,y,w,h){ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();vgrad(y,y+h,[[0,'#7b88a6'],[1,'#3a4660']]);
  blk(x-10,y+h*.62,w*.34+10,h*.5,3,'#3a4258',{hi:.15});blk(x+w*.66,y+h*.62,w*.34+10,h*.5,3,'#3a4258',{hi:.15});ctx.fillStyle='#06080e';ctx.fillRect(x+w*.34,y+h*.7,w*.32,h*.4);
  plankDraw(x+w*.3,y+h*.62,x+w*.7,y+h*.62,9);
  const q=(t*.35)%1;const px=lerp(x+w*.18,x+w*.86,q);const by=y+h*.62-1;person({x:px,y:by,s:.42,top:C.must,hood:true,back:true,hairStyle:'none',shadow:0,pose:{aL:70,aR:70,kL:Math.sin(t*9)*18,kR:-Math.sin(t*9)*18}});ctx.restore()}
function miniFire(t,x,y,w,h){ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();vgrad(y,y+h,[[0,'#5a6684'],[1,'#2a3350']]);
  for(let i=0;i<4;i++){const py=y+14+i*(h/3.4),sd=i%2?1:-1;ctx.fillStyle='#1a2030';ctx.fillRect(x+w*.2,py,w*.6,5);if(i<3){ctx.strokeStyle='#1a2030';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(sd>0?x+w*.25:x+w*.75,py);ctx.lineTo(sd>0?x+w*.75:x+w*.25,py+h/3.4);ctx.stroke()}}
  const q=(t*.3)%1;const dy=y+14+q*(h-28);const pu=1+.3*Math.sin(t*8);glow(x+w*.5,dy,22*pu,C.red,.7);circ(x+w*.5,dy,5,C.red);ctx.restore()}
SC.vote=(t,u,d)=>{const t0=CU.vote_t;vgrad(0,H,[[0,'#0c1020'],[1,'#07090f']]);const g=ctx.createRadialGradient(270,400,0,270,400,520);g.addColorStop(0,'rgba(60,80,130,.35)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);dust(t,0,200,W,600,30,50,'#9fb4d8',.3,.3);
  const warm=clamp((t-t0[3])/.6);if(warm>0)glow(270,500,380,C.amb,.14*warm*(.7+.3*Math.sin(t*3)));
  const title='WHAT DO YOU DO?';const n=Math.floor(clamp((t-t0[0])/.5)*title.length);ctx.textAlign='center';ctx.font='60px "Bebas Neue"';ctx.letterSpacing='2px';ctx.fillStyle='#F4F4EF';ctx.fillText(title.slice(0,n),270,292);
  const pulse=1+.025*Math.sin((t-t0[3])*Math.PI/1.0)*(t>t0[3]?1:0);
  function card(y,tc0,col,letter,l1,l2,tc,mini){if(t<tc0)return;const q=EZ.ob(clamp((t-tc0)/.35));ctx.save();ctx.globalAlpha=clamp((t-tc0)/.2);ctx.translate(270,y+88);ctx.scale(pulse,pulse);ctx.translate(-270+40*(1-q),-y-88);
    ctx.fillStyle='rgba(0,0,0,.4)';rr(34,y+8,472,176,22);ctx.fill();blk(30,y,472,176,22,'#161c30',{hi:.14});blk(46,y+14,62,62,14,col,{hi:.25});ctx.fillStyle=tc;ctx.font='58px "Bebas Neue"';ctx.letterSpacing='0px';ctx.textAlign='center';ctx.fillText(letter,77,y+62);
    ctx.fillStyle='#F4F4EF';ctx.textAlign='left';ctx.font='38px "Bebas Neue"';ctx.letterSpacing='2px';ctx.fillText(l1,124,y+46);ctx.fillStyle='#8A8F99';ctx.font='600 13px "JetBrains Mono"';ctx.fillText(l2,124,y+68);ctx.textAlign='center';
    ctx.save();rr(46,y+84,440,84,14);ctx.clip();mini(t,46,y+84,440,84);ctx.restore();ctx.restore()}
  card(312,t0[1],C.lime,'A','CROSS THE PLANK','SAVE YOURSELF','#0A0D16',miniPlank);
  card(504,t0[2],C.red,'B','DOWN THE FIRE ESCAPE','FOR YOUR BROTHER','#fff',miniFire);
  if(t>=t0[4]){ctx.globalAlpha=EZ.io(pr(t,t0[4],t0[4]+.3));ctx.font='600 13px "JetBrains Mono"';ctx.letterSpacing='1.5px';ctx.fillStyle=C.lime;ctx.fillText('COMMENT A OR B · THE MOST VOTED CHOICE DECIDES',270,762);ctx.globalAlpha=1}};
SC.cta=(t,u,d)=>{rect(0,0,W,H,'#000');if(u>=.9){ctx.globalAlpha=.55*EZ.io(pr(u,.9,1.9));ctx.save();crowdBelow(t,0,{cy:420});ctx.restore();ctx.globalAlpha=1;ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(0,0,W,H)}
  const a=EZ.io(pr(t,CU.cta_t,CU.cta_t+8/30));ctx.globalAlpha=a;ctx.textAlign='center';ctx.font='96px "Bebas Neue"';ctx.letterSpacing='3px';ctx.fillStyle='#fff';ctx.fillText('FOLLOW FOR',270,470);ctx.fillStyle=C.lime;ctx.font='150px "Bebas Neue"';ctx.fillText('HOUR 53',270,590);ctx.globalAlpha=1};
