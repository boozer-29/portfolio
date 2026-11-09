// ============ MAIN COMPOSITION ============
const BL=document.createElement('canvas');BL.width=135;BL.height=240;const BLC=BL.getContext('2d');
function bloom(a=.22){BLC.clearRect(0,0,135,240);BLC.drawImage(cv,0,0,135,240);ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalCompositeOperation='screen';ctx.globalAlpha=a;ctx.filter='blur(7px)';ctx.drawImage(BL,0,0,1080,1920);ctx.restore()}
function frame(t){
  ctx.setTransform(2,0,0,2,0,0);ctx.clearRect(0,0,W,H);rect(0,0,W,H,'#05070d');const sh=shotAt(t);
  let shk=0;for(const s of CU.shake){const d=t-s;if(d>=0&&d<.2)shk=Math.max(shk,6*(1-d/.2))}
  ctx.save();if(shk){const r=mul(Math.floor(t*30)+7);ctx.translate((r()-.5)*2*shk,(r()-.5)*2*shk)}
  if(sh&&SC[sh.n]){const tf=sh.freeze&&t>sh.e-sh.freeze?sh.e-sh.freeze:t;SC[sh.n](tf,tf-sh.s,sh.e-sh.s,sh)}else if(sh){rect(0,0,W,H,'#222');ctx.fillStyle='#fff';ctx.font='20px sans-serif';ctx.fillText('TODO '+sh.n,40,400)}
  ctx.restore();
  if(t>=CU.fb[0]&&t<CU.fb[1]){ctx.save();ctx.globalCompositeOperation='saturation';ctx.globalAlpha=.4;ctx.fillStyle='#808080';ctx.fillRect(0,0,W,H);ctx.restore();ctx.fillStyle='rgba(120,150,190,.05)';ctx.fillRect(0,0,W,H)}
  const rw=CU.rewind;if(t>=rw[0]&&t<rw[1]){const r=mul(Math.floor(t*30)*13+5);ctx.save();ctx.setTransform(1,0,0,1,0,0);for(let i=0;i<10;i++){const y=Math.floor(r()*1800),h=20+Math.floor(r()*120),dx=(r()-.5)*160;ctx.drawImage(cv,0,y,1080,h,dx,y,1080,h)}ctx.fillStyle='rgba(255,255,255,.12)';for(let i=0;i<14;i++)ctx.fillRect(0,Math.floor(r()*1920),1080,2+Math.floor(r()*4));ctx.restore()}
  bloom(.2);
  for(const [a,b] of CU.dark)if(t>=a&&t<b){ctx.fillStyle='rgba(3,4,8,.96)';ctx.fillRect(0,0,W,H)}
  for(const d of CU.dip){const x=Math.abs(t-d);if(x<2/30){ctx.fillStyle=`rgba(0,0,0,${1-x/(2/30)})`;ctx.fillRect(0,0,W,H)}}
  for(const f of CU.flash){if(t>=f&&t<f+2/30){ctx.fillStyle='rgba(109,18,8,.85)';ctx.fillRect(0,0,W,H)}}
  for(const f of CU.whiteflash){if(t>=f&&t<f+2/30){ctx.fillStyle='rgba(255,255,255,.9)';ctx.fillRect(0,0,W,H)}}
  const vg=ctx.createRadialGradient(270,470,200,270,480,640);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.5)');ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
  const r2=mul(Math.floor(t*24)+99);ctx.globalAlpha=.06;for(let i=0;i<240;i++){ctx.fillStyle=r2()>.5?'#fff':'#000';ctx.fillRect(r2()*W,r2()*H,1.2,1.2)}ctx.globalAlpha=1;
  const hg=ctx.createLinearGradient(0,0,0,260);hg.addColorStop(0,'rgba(3,5,12,.7)');hg.addColorStop(.7,'rgba(3,5,12,.4)');hg.addColorStop(1,'rgba(3,5,12,0)');ctx.fillStyle=hg;ctx.fillRect(0,0,W,260);
  pills(t,sh);captions(t,sh);hud(t)}
window.renderAt=function(t){frame(t)};
