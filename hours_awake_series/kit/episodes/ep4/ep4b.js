// ============ 7. Maya's note (pen handwriting, not crayon)
function penText(t,x,y,size,col,reveal=1){ctx.save();ctx.font=`700 ${size}px Caveat`;ctx.textAlign='left';const w=ctx.measureText(t).width;const n=Math.floor(clamp(reveal)*t.length+.001);ctx.fillStyle=col;ctx.fillText(t.slice(0,n),x-w/2,y);ctx.restore()}
SC.maya_note=(t,u,d)=>{QA_SHOT='maya_note';const p=u/d;const Wd=CU.W;vgr(0,H,'#151b2e','#0a0d18');ctx.save();ctx.filter='blur(6px)';roofNight(t);ctx.restore();ctx.fillStyle='rgba(8,10,20,.45)';ctx.fillRect(0,0,W,H);
  ctx.save();zoomAt(270,560,lerp(1.0,1.14,EZ.io(p)));ctx.translate(Math.sin(t*1.3)*3,Math.sin(t*2.1)*2);
  const pg={y:-98,w:80,h:60};
  fig('maya',270,912,3.4,{eyes:'open',brow:'worry',mouth:'sad',tears:t>Wd.c5[0][1],tilt:-3,
    arms:[{elbow:[-27,-111],to:[-pg.w/2+2,pg.y+14],hand:'grip',thumbToward:[0,pg.y]},{elbow:[27,-111],to:[pg.w/2-2,pg.y+14],hand:'grip',thumbToward:[0,pg.y]}],
    propFront:(A,g)=>{ctx.save();ctx.translate(0,pg.y);ctx.rotate(-.02);paperSheet(0,0,pg.w,pg.h,0,'#f3eee2',true);const ink='#1f3a7a',r=(i)=>pr(t,Wd[i][0][1],Wd[i][0][1]+.45);
      penText("I knew.",0,-16,10.5,ink,r('c4'));penText("I'm sorry.",0,-3,10.5,ink,r('c5'));penText('Eyes shut...',-4,11,10.5,ink,pr(t,Wd.c6[0][1],Wd.c6[1][1]+.3));penText('like him.',0,24,10.5,ink,pr(t,Wd.c6[2][1],Wd.c6[3][1]+.4));
      if(t>Wd.c6[3][1]){ctx.strokeStyle=ink;ctx.lineWidth=1;for(const sd of[-1,1]){ctx.beginPath();ctx.arc(27+sd*5,19,2.6,.2,Math.PI-.2);ctx.stroke()}}ctx.restore();
      for(let i=0;i<2;i++)thumbOver(g.grips[i],g.skin,g.o,[2,8])}});
  ctx.restore();vig(.45)};
// ============ 8. DJ gives you his headphones
function phonesProp(cx,cy,s,oo){ctx.save();ctx.translate(cx,cy);ctx.scale(s,s);ctx.lineCap='round';ctx.strokeStyle=OLc;ctx.lineWidth=7;ctx.beginPath();ctx.arc(0,0,22,Math.PI*1.05,Math.PI*1.95);ctx.stroke();ctx.strokeStyle='#5b6274';ctx.lineWidth=3.5;ctx.stroke();orr(-28,-6,12,20,5,'#2b2f3a',oo/s);orr(16,-6,12,20,5,'#2b2f3a',oo/s);ctx.restore()}
SC.dj_phones=(t,u,d)=>{QA_SHOT='dj_phones';const p=u/d;const fw2=EZ.io(pr(p,.1,.95));vgr(0,H,'#151b2e','#0a0d18');ctx.save();ctx.filter='blur(6px)';roofNight(t);ctx.restore();ctx.fillStyle='rgba(8,10,20,.45)';ctx.fillRect(0,0,W,H);
  // he holds the headphones by the ear-cups, fingers behind the cups, thumbs in front; they come toward you
  const cy=lerp(-112,-100,fw2),half=lerp(17,21,fw2);
  fig('dj',270,930,3.3,{eyes:'half',brow:'worry',mouth:'line',noPhones:true,tilt:4,
    arms:[{elbow:[-22,-108],to:[-half-6,cy+8],hand:'grip',thumbToward:[0,-200]},{elbow:[22,-108],to:[half+6,cy+8],hand:'grip',thumbToward:[0,-200]}],
    propFront:(A,g)=>{ctx.save();ctx.lineCap='round';ctx.strokeStyle=OLc;ctx.lineWidth=9;ctx.beginPath();ctx.arc(0,cy-2,half-1,Math.PI*1.12,Math.PI*1.88);ctx.stroke();ctx.strokeStyle='#3a3f4e';ctx.lineWidth=5.5;ctx.stroke();ctx.strokeStyle='#6b7286';ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(0,cy-2,half-2.5,Math.PI*1.25,Math.PI*1.75);ctx.stroke();ctx.restore();
      for(const sd of[-1,1]){orr(sd*half-7+sd*1,cy-6,14,20,6,'#2b2f3a',g.oo);orr(sd*half-4.5+sd*1-sd*3.5,cy-3,9,14,4,'#4b5163',g.oo*.6)}for(let i=0;i<2;i++)thumbOver(g.grips[i],g.skin,g.o,[0,-6])}});
  vig(.45)};
// ============ 9. you climb down into them (from behind, camera above)
function ladder(x0,x1,ytop,ybot,gap,o){for(const x of[x0,x1])orr(x-6,ytop,12,ybot-ytop,4,'#59607a',o);const rungs=[];for(let y=ytop+20;y<ybot;y+=gap){orr(x0,y-5,x1-x0,10,4,'#7a8199',o);rungs.push(y)}return rungs}
SC.ladder_down=(t,u,d)=>{QA_SHOT='ladder_down';const L=CU.ladder,g=L.g,v=L.v,tt=t-L.t0;const cam=v*tt;
  vgr(0,H,'#101626','#05070c');
  ctx.save();ctx.translate(0,-cam*.25);const r=mul(31);for(let i=0;i<260;i++){const x=r()*W,y=560+r()*480;upFace(x,y,.55+(y-560)/480*.5,i)}ctx.restore();
  const gg=ctx.createLinearGradient(0,0,0,700);gg.addColorStop(0,'rgba(16,22,38,1)');gg.addColorStop(1,'rgba(16,22,38,0)');ctx.fillStyle=gg;ctx.fillRect(0,0,W,700);
  ctx.fillStyle='#232b40';ctx.fillRect(120,-40,300,760);
  // world: ladder fixed; you descend at speed v; the camera follows you
  ctx.save();ctx.translate(0,-cam);
  ladder(176,364,-400,1400,g,2.6);
  const s=2.05,fx=270,fy=L.y0+cam;const shW=fy+(-137)*s;   // your shoulder height in world
  const handY=(i)=>{const ph=(v*tt+i*g)/(2*g);const k=Math.floor(ph),f=ph-k;const base=L.r0-i*g+2*g*k;const tr=clamp((f-.86)/.14);return{y:lerp(base,base+2*g,EZ.io(tr)),lift:Math.sin(tr*Math.PI)}};
  const hs=[0,1].map(i=>handY(i));const step=Math.sin(tt*v/g*Math.PI);
  fig('you',fx,fy,s,{back:true,step:step*.5,neck:neckPhones,
    arms:[0,1].map(i=>{const sd=i?1:-1;const h=hs[i];return{to:[sd*32+sd*h.lift*10,(h.y-fy)/s+6-h.lift*4],pole:[sd*52,-150],raise:true,hand:'back',thumbToward:[0,(h.y-fy)/s+30],behind:false}})});
  ctx.restore();vig(.5)};
// ============ 10. above you, Reyes pulls the ladder up. Looking up from the street: the roof edge, Maya, Reyes (centre right,
// hauling the ladder hand over hand) and DJ; your own hand reaches up from below and the bottom rung rises out of reach.
// layers: sky -> wall -> ladder part above the parapet -> the three survivors -> parapet -> ladder part on the wall -> heads + your arm
SC.ladder_up=(t,u,d)=>{QA_SHOT='ladder_up';const p=u/d;const W2=CU.W.d2;const up=EZ.io(pr(t,W2[3][1]-.25,W2[6][1]+.55));nightSky();
  ctx.save();zoomAt(270,600,lerp(1,1.04,EZ.io(p)));
  const PY=372,LX0=380,LX1=436,shift=up*330;
  ctx.fillStyle='#1c2338';ctx.beginPath();ctx.moveTo(-20,960);ctx.lineTo(70,PY);ctx.lineTo(560,PY);ctx.lineTo(560,960);ctx.fill();
  for(let r=0;r<5;r++)for(let c=0;c<4;c++){const yy=PY+40+r*100,xx=lerp(95,40,r/5)+c*lerp(120,140,r/5);if(xx>LX0-60&&xx<LX1+10)continue;ctx.fillStyle='#121829';ctx.fillRect(xx,yy,lerp(48,70,r/5),lerp(46,62,r/5))}
  const lad=(clipTop)=>{ctx.save();ctx.beginPath();if(clipTop)ctx.rect(0,PY-150,W,150);else ctx.rect(0,PY,W,800);ctx.clip();ladder(LX0,LX1,250-shift,620-shift,38,2.4);ctx.restore()};
  lad(true);
  ctx.save();ctx.beginPath();ctx.rect(-50,-300,W+100,PY+300);ctx.clip();fig('maya',222,PY+78,.92,{eyes:'open',brow:'worry',mouth:'sad',look:1,shadow:false});
  const ph=up*Math.PI*4;const hA=-104+Math.sin(ph)*14,hB=-104-Math.sin(ph)*14;
  fig('reyes',408,PY+86,1.0,{eyes:'open',brow:'angry',mouth:'grit',look:-1,shadow:false,
    arms:[{to:[(LX0-408)+2,hA],pole:[-40,-120],raise:true,hand:'fist',thumbToward:[0,-200]},{to:[(LX1-408)-2,hB],pole:[40,-120],raise:true,hand:'fist',thumbToward:[0,-200]}]});
  fig('dj',300,PY+82,.9,{eyes:'open',brow:'worry',mouth:'line',look:1,noPhones:true,shadow:false});ctx.restore();
  ctx.fillStyle='#2b3350';ctx.fillRect(60,PY-6,500,16);ctx.strokeStyle=OLc;ctx.lineWidth=2.4;ctx.strokeRect(60,PY-6,500,16);
  lad(false);ctx.restore();
  const r=mul(5);for(let i=0;i<9;i++){const x=i*70-20+r()*20,y=900+r()*40,s=2.2+r()*.6;figHead('sleeper',x,y,s,{back:true,arms:[{none:true},{none:true}],c:slpC(i)})}
  const reach=EZ.io(pr(t,W2[0][1],W2[2][1]+.3));fpArm([150,1080],[lerp(250,372,reach),lerp(860,650,reach)],{w:58,k:2.3,hand:'open',spread:1.1,thumbToward:[200,600],pole:[60,900],L1:260,L2:260});
  vig(.5)};
