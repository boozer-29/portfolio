// ============ PROPS & ENVIRONMENT PIECES ============
const SKY={
 night:()=>vgrad(-700,620,[[0,'#04091a'],[.55,'#0b1c36'],[1,'#1b3658']]),
 dawn:()=>vgrad(-700,620,[[0,'#0d1830'],[.45,'#2c3250'],[.78,'#7d5a66'],[1,'#d99a68']]),
 dead:()=>vgrad(-700,620,[[0,'#101a2c'],[.5,'#3a3a52'],[.8,'#8a6a68'],[1,'#c98d64']]),
 deep:()=>vgrad(-700,620,[[0,'#050a14'],[1,'#0c1a30']])
};
function stars(t,n,seed,y0=-500,y1=200){const r=mul(seed);for(let i=0;i<n;i++){const x=r()*W*1.6-100,y=y0+r()*(y1-y0),tw=.4+.6*Math.abs(Math.sin(t*.7+i));ctx.fillStyle=`rgba(255,255,255,${.25+.5*tw*r()})`;ctx.fillRect(x,y,1.3,1.3)}}
// windowed building: returns nothing, draws block + windows + roof detail.  winFn(wx,wy,q,i)->color|null
function building(x,base,w,h,col,o={}){
  blk(x,base-h,w,h,3,col,{hi:.12,lo:-.2,hh:.05,lh:.1});
  if(o.roof){const r=mul(Math.floor(x*13+w));const k=r();if(k<.3){blk(x+w*.2,base-h-10,w*.25,10,2,shade(col,-.1))}else if(k<.55){ctx.fillStyle=shade(col,.15);ctx.fillRect(x+w*.6,base-h-22,1.6,22);if(o.beacon&&Math.floor((o.t||0)*.8+x)%2)glow(x+w*.6,base-h-22,7,'#ff3b30',.9)}else if(k<.7){blk(x+w*.15,base-h-14,w*.3,14,5,shade(col,.08))}}
  if(o.winFn){const gx=11,gy=15,r=mul(Math.floor(x*7+h));for(let wy=base-h+10,j=0;wy<base-10;wy+=gy,j++){const rowq=r();for(let wx=x+7,i=0;wx<x+w-10;wx+=gx,i++){const q=Math.min(.999,r()*.7+rowq*.3);const c=o.winFn(wx,wy,q,i+j*7,x);if(c){ctx.fillStyle=c;ctx.fillRect(wx,wy,6.4,9);ctx.fillStyle='rgba(255,255,255,.18)';ctx.fillRect(wx,wy,6.4,1.4)}}}}
}
function skylineLayer(o){const r=mul(o.seed);let x=o.x0??-60;const x1=o.x1??W+60;const out=[];while(x<x1){const w=o.minW+r()*(o.maxW-o.minW),h=o.minH+r()*(o.maxH-o.minH);building(x,o.base,w,h,o.col,{winFn:o.winFn,roof:o.roof,beacon:o.beacon,t:o.t});x+=w+(o.gap??1)+r()*3}}
function smokeCol(t,x,base,h,w,col='#3a3d4a',a=.2,seed=1){const r=mul(seed);ctx.save();for(let i=0;i<22;i++){const k=i/22,ph=(k+t*.04+r())%1;const yy=base-ph*h,xx=x+Math.sin(ph*5+r()*6+t*.35)*w*.35*(.3+ph)+(ph*ph)*w*.5;const rad=(10+ph*w*.7)*(.7+r()*.6);const g=ctx.createRadialGradient(xx,yy,0,xx,yy,rad);g.addColorStop(0,rgba(col,a*(1-ph*.7)));g.addColorStop(1,rgba(col,0));ctx.fillStyle=g;ctx.fillRect(xx-rad,yy-rad,rad*2,rad*2)}ctx.restore()}
// car rear view; o.driver: 'slump'|'up'|null ; o.hazard
function carRear(x,y,s,col,o={}){ctx.save();ctx.translate(x,y);ctx.scale(s,s);shadowE(0,2,38,7,.55);
  blk(-30,-22,60,24,6,col,{hi:.2});blk(-23,-40,46,22,7,shade(col,-.08),{hi:.2});ctx.fillStyle='#10192b';rr(-19,-37,38,15,4);ctx.fill();
  if(o.driver){ctx.fillStyle=o.driver==='slump'?'#8a7a6a':'#9a8a7a';const hx=o.driver==='slump'?-8:-8,hy=o.driver==='slump'?-26:-31;rr(hx,hy,10,10,3);ctx.fill();ctx.fillStyle=shade(col,-.3);ctx.fillRect(hx-3,hy+8,16,6)}
  for(const sx of[-1,1]){blk(sx*24-4,-16,8,6,2,(o.hazard&&Math.floor((o.t||0)*1.6)%2)?'#ff9a2a':'#7a1820');if(o.hazard&&Math.floor((o.t||0)*1.6)%2)glow(sx*24,-13,16,'#ff9a2a',.6);blk(sx*22-5,-1,10,7,3,'#0b0d14')}
  ctx.restore()}
function carSide(x,y,s,col,o={}){ctx.save();ctx.translate(x,y);ctx.scale(s*(o.flip||1),s);shadowE(0,2,70,8,.5);
  blk(-62,-26,124,26,9,col,{hi:.2});blk(-34,-48,62,24,10,shade(col,-.06),{hi:.2});ctx.fillStyle='#10192b';rr(-30,-45,25,19,5);ctx.fill();rr(-2,-45,28,19,5);ctx.fill();
  for(const wx of[-38,38]){circ(wx,0,12,'#0b0d14');circ(wx,0,5,'#3a3f4d')}blk(54,-18,8,7,3,'#ffd27a');blk(-62,-18,6,7,3,'#8a1820');ctx.restore()}
function lampPost(x,y,h,o={}){ctx.save();ctx.translate(x,y);blk(-2.5,-h,5,h,2,'#1b2438');blk(-2,-h,26,4,2,'#1b2438');ctx.fillStyle=o.on===false?'#3a3f4d':'#fff3c8';ctx.fillRect(18,-h+3,10,3);if(o.on!==false){glow(23,-h+5,o.glow||70,'#ffd27a',.5*(o.flick??1))}ctx.restore()}
function phoneObj(x,y,w,h,ang,screen,o={}){ctx.save();ctx.translate(x,y);ctx.rotate(ang*Math.PI/180);
  shadowE(0,h*.5,w*.7,h*.12,.5);blk(-w/2,-h/2,w,h,w*.14,'#161b2a',{hi:.28,lo:-.3});
  ctx.fillStyle=o.screenBg||'#0b1630';rr(-w/2+w*.04,-h/2+w*.04,w*.92,h-w*.08,w*.11);ctx.fill();ctx.save();rr(-w/2+w*.04,-h/2+w*.04,w*.92,h-w*.08,w*.11);ctx.clip();if(screen)screen(w,h);ctx.restore();
  ctx.fillStyle='#0a0d16';rr(-w*.16,-h/2+w*.06,w*.32,w*.07,w*.035);ctx.fill();ctx.restore()}
function mug(x,y,s,t,o={}){ctx.save();ctx.translate(x,y);ctx.scale(s,s);shadowE(0,3,36,7,.55);
  blk(-24,-44,48,44,9,'#e8e8e0',{hi:.1,lo:-.2});ctx.strokeStyle='#e8e8e0';ctx.lineWidth=7;ctx.beginPath();ctx.arc(26,-24,11,-1.3,1.3);ctx.stroke();
  ctx.fillStyle='#2a1810';ctx.beginPath();ctx.ellipse(0,-42,21,5.5,0,0,7);ctx.fill();const hb=(Math.sin(t*7)+1)/2;for(let i=0;i<3;i++){ctx.strokeStyle=`rgba(255,220,170,${.25-i*.07+.1*hb})`;ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(0,-42,5+i*6+hb*2,1.5+i*1.5,0,0,7);ctx.stroke()}
  ctx.globalAlpha=.5;for(let i=0;i<3;i++){const ph=(t*.5+i*.33)%1;ctx.strokeStyle=`rgba(255,255,255,${.28*(1-ph)})`;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-6+i*6,-46);ctx.bezierCurveTo(-12+i*6+Math.sin(t*2+i)*4,-60-ph*30,0+i*6,-72-ph*40,-4+i*6,-92-ph*50);ctx.stroke()}ctx.restore()}
function headphonesObj(x,y,s,rot=0,col='#e8e8e0'){ctx.save();ctx.translate(x,y);ctx.rotate(rot*Math.PI/180);ctx.scale(s,s);ctx.strokeStyle=col;ctx.lineWidth=11;ctx.lineCap='round';ctx.beginPath();ctx.arc(0,0,60,Math.PI*1.04,Math.PI*1.96);ctx.stroke();ctx.strokeStyle=shade(col,-.3);ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,56,Math.PI*1.1,Math.PI*1.9);ctx.stroke();blk(-72,-8,24,50,10,col,{hi:.2});blk(48,-8,24,50,10,col,{hi:.2});ctx.restore()}
// window light stripes (blinds)
function blindsLight(x,y,w,h,col,a,skew=.5){ctx.save();ctx.globalCompositeOperation='lighter';for(let i=0;i<9;i++){const yy=y+i*h/9;ctx.fillStyle=rgba(col,a*(.6+.4*(i%2)));ctx.beginPath();ctx.moveTo(x,yy);ctx.lineTo(x+w,yy+w*skew);ctx.lineTo(x+w,yy+w*skew+h/20);ctx.lineTo(x,yy+h/20);ctx.fill()}ctx.restore()}
