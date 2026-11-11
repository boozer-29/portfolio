// ============ 7. Maya's note (pen handwriting, not crayon)
function penText(t,x,y,size,col,reveal=1){ctx.save();ctx.font=`700 ${size}px Caveat`;ctx.textAlign='left';const w=ctx.measureText(t).width;const n=Math.floor(clamp(reveal)*t.length+.001);ctx.fillStyle=col;ctx.fillText(t.slice(0,n),x-w/2,y);ctx.restore()}
SC.maya_note=(t,u,d)=>{QA_SHOT='maya_note';const p=u/d;const Wd=CU.W;vgr(0,H,'#151b2e','#0a0d18');ctx.save();ctx.filter='blur(6px)';roofNight(t);ctx.restore();ctx.fillStyle='rgba(8,10,20,.45)';ctx.fillRect(0,0,W,H);
  ctx.save();zoomAt(270,560,lerp(1.0,1.14,EZ.io(p)));ctx.translate(Math.sin(t*1.3)*3,Math.sin(t*2.1)*2);
  const pg={y:-98,w:80,h:60};
  fig('maya',270,912,3.4,{eyes:'open',brow:'worry',mouth:'sad',tears:t>Wd.c5[0][1],tilt:-3,
    arms:[{elbow:[-27,-111],to:[-pg.w/2-1,pg.y+8],hand:'grip',thumbToward:[0,-200]},{elbow:[27,-111],to:[pg.w/2+1,pg.y+8],hand:'grip',thumbToward:[0,-200]}],
    propFront:(A,g)=>{ctx.save();ctx.translate(0,pg.y);ctx.rotate(-.02);paperSheet(0,0,pg.w,pg.h,0,'#f3eee2',true);const ink='#1f3a7a',r=(i)=>pr(t,Wd[i][0][1],Wd[i][0][1]+.45);
      penText("I knew.",0,-16,10.5,ink,r('c4'));penText("I'm sorry.",0,-3,10.5,ink,r('c5'));penText('Eyes shut...',-4,11,10.5,ink,pr(t,Wd.c6[0][1],Wd.c6[1][1]+.3));penText('like him.',0,24,10.5,ink,pr(t,Wd.c6[2][1],Wd.c6[3][1]+.4));
      if(t>Wd.c6[3][1]){ctx.strokeStyle=ink;ctx.lineWidth=1;for(const sd of[-1,1]){ctx.beginPath();ctx.arc(27+sd*5,19,2.6,.2,Math.PI-.2);ctx.stroke()}}ctx.restore();
      for(let i=0;i<2;i++)thumbOver(g.grips[i],g.skin,g.o,[0,-7])}});
  ctx.restore();vig(.45)};
// ============ 8. DJ gives you his headphones
function phonesProp(cx,cy,s,oo){ctx.save();ctx.translate(cx,cy);ctx.scale(s,s);ctx.lineCap='round';ctx.strokeStyle=OLc;ctx.lineWidth=7;ctx.beginPath();ctx.arc(0,0,22,Math.PI*1.05,Math.PI*1.95);ctx.stroke();ctx.strokeStyle='#5b6274';ctx.lineWidth=3.5;ctx.stroke();orr(-28,-6,12,20,5,'#2b2f3a',oo/s);orr(16,-6,12,20,5,'#2b2f3a',oo/s);ctx.restore()}
SC.dj_phones=(t,u,d)=>{QA_SHOT='dj_phones';const p=u/d;const fw2=EZ.io(pr(p,.1,.95));vgr(0,H,'#151b2e','#0a0d18');ctx.save();ctx.filter='blur(6px)';roofNight(t);ctx.restore();ctx.fillStyle='rgba(8,10,20,.45)';ctx.fillRect(0,0,W,H);
  // he holds the headphones by the ear-cups, fingers behind the cups, thumbs in front; they come toward you
  const cy=lerp(-114,-104,fw2),half=lerp(19,24,fw2);
  fig('dj',270,930,3.3,{eyes:'half',brow:'worry',mouth:'line',noPhones:true,tilt:4,
    arms:[{elbow:[-22,-108],to:[-half-2,cy+4],hand:'grip',thumbToward:[0,-200]},{elbow:[22,-108],to:[half+2,cy+4],hand:'grip',thumbToward:[0,-200]}],
    propFront:(A,g)=>{ctx.save();ctx.lineCap='round';ctx.strokeStyle=OLc;ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(0,cy,half,half*.9,0,Math.PI*1.08,Math.PI*1.92);ctx.stroke();ctx.strokeStyle='#5b6274';ctx.lineWidth=2.4;ctx.stroke();ctx.restore();
      orr(-half-6,cy-7,10,15,4,'#2b2f3a',g.oo);orr(half-4,cy-7,10,15,4,'#2b2f3a',g.oo);for(let i=0;i<2;i++)thumbOver(g.grips[i],g.skin,g.o,[0,-6])}});
  vig(.45)};
// ============ 9. you climb down into them (from behind, camera above)
function ladder(x0,x1,ytop,ybot,gap,o){for(const x of[x0,x1])orr(x-6,ytop,12,ybot-ytop,4,'#59607a',o);const rungs=[];for(let y=ytop+20;y<ybot;y+=gap){orr(x0,y-5,x1-x0,10,4,'#7a8199',o);rungs.push(y)}return rungs}
SC.ladder_down=(t,u,d)=>{QA_SHOT='ladder_down';const p=u/d;const dy=lerp(0,70,EZ.io(p));
  vgr(0,H,'#101626','#05070c');
  // the street far below: hundreds of upturned grey faces
  ctx.save();ctx.translate(0,-dy*.25);const r=mul(31);for(let i=0;i<260;i++){const x=r()*W,y=560+r()*480;upFace(x,y,.55+(y-560)/480*.5,i)}ctx.restore();
  const g=ctx.createLinearGradient(0,0,0,700);g.addColorStop(0,'rgba(16,22,38,1)');g.addColorStop(1,'rgba(16,22,38,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,700);
  // building wall + ladder, you on it from behind
  ctx.fillStyle='#232b40';ctx.fillRect(120,-40,300,760);ctx.save();ctx.translate(0,-dy);
  const rungs=ladder(176,364,-60,820,58,2.6);
  const ry=rungs.find(y=>y>230)||300;const rL=ry,rR=ry+58;
  // hands: fingers go over the top of the rung and behind it (hidden); back of the hand in front
  const s=2.05,fx=270,fy=rR+330;
  fig('you',fx,fy,s,{back:true,step:.6,neck:(g)=>{ctx.strokeStyle=OLc;ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,g.shY+2,13,.15,Math.PI-.15);ctx.stroke();ctx.strokeStyle='#2b2f3a';ctx.lineWidth=2.6;ctx.stroke()},
    arms:[{to:[-34,(rL-fy)/s+6],pole:[-48,-150],raise:true,hand:'back',thumbToward:[0,(rL-fy)/s+30],behind:false},{to:[34,(rR-fy)/s+6],pole:[48,-130],raise:true,hand:'back',thumbToward:[0,(rR-fy)/s+30],behind:false}]});
  ctx.restore();vig(.5)};
// ============ 10. above you, Reyes pulls the ladder up
SC.ladder_up=(t,u,d)=>{QA_SHOT='ladder_up';const p=u/d;const up=EZ.i3(pr(t,CU.W.d2[3][1]-.15,CU.W.d2[6][1]+.25));nightSky();
  // building wall seen from below, roof edge high up with three small silhouettes
  ctx.fillStyle='#1c2338';ctx.beginPath();ctx.moveTo(60,960);ctx.lineTo(150,250);ctx.lineTo(390,250);ctx.lineTo(480,960);ctx.fill();ctx.fillStyle='#2b3350';ctx.fillRect(140,240,260,14);
  for(let r=0;r<6;r++)for(let c=0;c<3;c++){ctx.fillStyle='#121829';const yy=300+r*95,xx=lerp(170,95,r/6)+c*lerp(70,115,r/6);ctx.fillRect(xx,yy,lerp(40,70,r/6),lerp(40,60,r/6))}
  for(const [x,who,sc] of[[215,'maya',.42],[270,'reyes',.46],[325,'dj',.42]]){ctx.save();ctx.globalAlpha=.95;fig(who,x,244,sc,{eyes:'open',look:0,shadow:false,c:{top:'#0e1220',bot:'#0e1220',skin:'#2a3044',hair:'#0e1220',beard:'#3a4258'}});ctx.restore()}
  // the ladder rising out of reach
  ctx.save();ctx.translate(0,-up*520);ladder(238,302,250,720,40,2);ctx.restore();
  // grey heads around you in the foreground (backs of heads, eyes facing the building)
  const r=mul(5);for(let i=0;i<9;i++){const x=i*70-20+r()*20,y=900+r()*40,s=2.2+r()*.6;figHead('sleeper',x,y,s,{back:true,arms:[{none:true},{none:true}],c:slpC(i)})}
  vig(.5)};
