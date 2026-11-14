// ===== HOURS AWAKE — BLOCK RIG (master prompt §5): chunky block characters, flat colours, bevel = lighter top edge +
// darker bottom edge (toward the world's up, whatever the part's rotation), square eyes, no gradients on characters.
const BK={you:{top:'#EAB308',hood:'#C99A07',bot:'#33405C',shoe:'#1D2230',skin:'#E8B98F',hair:'#4A3020'},
  ollie:{top:'#D93A3F',bot:'#4A6FB8',shoe:'#1D2230',skin:'#D9A57A',hair:'#4A3020',beanie:'#D93A3F',band:'#B32D33',pom:'#FF9AA6',dino:'#3FA34D'},
  slp:{skin:'#C9CED6',ring:'#7E7A92',tops:['#5E6673','#6E655B','#4F5B6B','#6B6676','#575E52','#6A5A5A'],bots:['#2E3440','#3A3530','#2B3038','#33303A'],hair:['#2B2F38','#3A2F26','#6A6E76','#1D2028','#4A3A2A']}};
const PH='#23262F';
// world-up shift expressed in the current local frame
function upLocal(d){const m=ctx.getTransform().inverse();return[m.c*(-d),m.d*(-d)]}
// fill a path with bevel: light strip on top, dark strip at the bottom (world space)
function bev(path,col,o={}){const hl=o.hl??2.2,sh=o.sh??2.6;const U=upLocal(hl),Dn=upLocal(-sh);   // U = 'up by hl', Dn = 'down by sh' (local vectors)
  ctx.save();path();ctx.clip();
  path();ctx.fillStyle=shade(col,-(o.dk??.3));ctx.fill();                                    // 1) dark everywhere
  ctx.save();ctx.translate(-Dn[0],-Dn[1]);path();ctx.fillStyle=shade(col,o.lt??.2);ctx.fill();   // 2) light = shape moved up by sh (bottom strip stays dark)
  path();ctx.clip();ctx.translate(Dn[0],Dn[1]);ctx.translate(-U[0],-U[1]);path();ctx.fillStyle=col;ctx.fill();ctx.restore();   // 3) base = that ∩ shape moved down by hl
  ctx.restore();if(o.line!==false){path();const sc_=Math.hypot(ctx.getTransform().a,ctx.getTransform().b);ctx.strokeStyle='rgba(8,10,16,.6)';ctx.lineWidth=(o.lw??2.2)/sc_;ctx.stroke()}}
const RR=(x,y,w,h,r)=>()=>{ctx.beginPath();ctx.roundRect(x,y,w,h,r)};
const EL=(x,y,rx,ry,a=0)=>()=>{ctx.beginPath();ctx.ellipse(x,y,rx,ry,a,0,7)};
// a block limb between two joints: rounded slab of width w (drawn in its own rotated frame so the bevel stays world-up)
function slab(A,B,w,col,o={}){const L=Math.hypot(B[0]-A[0],B[1]-A[1]),a=Math.atan2(B[1]-A[1],B[0]-A[0]);ctx.save();ctx.translate(A[0],A[1]);ctx.rotate(a);bev(RR(-w*.42,-w/2,L+w*.84,w,w*.42),col,o);ctx.restore()}
function sqEye(x,y,s,closed,ring){if(closed){ctx.fillStyle=PH;ctx.fillRect(x-s*1.1,y-s*.18,s*2.2,s*.36);if(ring){ctx.fillStyle=ring;ctx.fillRect(x-s*1.1,y+s*.55,s*2.2,s*.3)}}else{ctx.fillStyle=PH;ctx.fillRect(x-s*.6,y-s*.6,s*1.2,s*1.2);ctx.fillStyle='#fff';ctx.fillRect(x-s*.35,y-s*.45,s*.35,s*.35)}}

// ---------- block head (rounded square), facing 'side' (+x) or 'front'. returns nothing; local origin = head centre
function blockHead(c,sz,view,o={}){const h=sz,r=h*.26;
  bev(RR(-h/2,-h/2,h,h,r),c.skin,{hl:h*.07,sh:h*.09});
  if(c.hair&&!o.noHair){ctx.save();RR(-h/2,-h/2,h,h,r)();ctx.clip();ctx.fillStyle=c.hair;if(view==='side'){ctx.fillRect(-h/2,-h/2,h,h*.26);ctx.fillRect(-h/2,-h/2,h*.36,h*.66)}else{ctx.fillRect(-h/2,-h/2,h,h*.24)}ctx.restore()}
  if(view==='side'){ctx.fillStyle=shade(c.skin,-.1);ctx.fillRect(-h*.12,-h*.02,h*.13,h*.2);ctx.fillStyle=shade(c.skin,-.25);ctx.fillRect(-h*.08,h*.03,h*.05,h*.1);   // ear
    sqEye(h*.24,o.eyeY??h*.02,h*.075,o.closed,o.ring);ctx.fillStyle=PH;ctx.fillRect(h*.26,h*.27,h*.16,h*.045)}
  else{sqEye(-h*.2,o.eyeY??h*.02,h*.075,o.closed,o.ring);sqEye(h*.2,o.eyeY??h*.02,h*.075,o.closed,o.ring);if(o.mouth==='o'){ctx.fillStyle='#5a2a2a';ctx.fillRect(-h*.05,h*.26,h*.1,h*.08)}else{ctx.fillStyle=PH;ctx.fillRect(-h*.09,h*.27,h*.18,h*.045)}}}
function beanie(c,sz,view,t=0){const h=sz;bev(()=>{ctx.beginPath();ctx.moveTo(-h*.54,-h*.18);ctx.quadraticCurveTo(-h*.56,-h*.86,0,-h*.86);ctx.quadraticCurveTo(h*.56,-h*.86,h*.54,-h*.18);ctx.closePath()},c.beanie,{hl:h*.06,sh:h*.05});
  bev(RR(-h*.57,-h*.3,h*1.14,h*.2,h*.08),c.band,{hl:h*.04,sh:h*.04});const sw=Math.sin(t*2.2)*h*.03;bev(EL((view==='side'?-h*.18:0)+sw,-h*.95,h*.13,h*.13),c.pom,{hl:h*.04,sh:h*.04})}
// ---------- YOU, sitting on the floor against the cot, Ollie asleep in your lap (side view, facing right). (x,y)=hip on the floor
function youHoldOllie(t,x,y,s,o={}){const Y=BK.you,O=BK.ollie;const br=Math.sin(t*2*Math.PI/4.2)*1.2,obr=Math.sin(t*2*Math.PI/3.1+1)*1.1;
  const nod=o.nod??0;ctx.save();ctx.translate(x,y);ctx.scale(s,s);
  // far leg, then near leg (knees up)
  slab([2,-12],[40,-46],19,shade(Y.bot,-.18));slab([40,-46],[64,-8],17,shade(Y.bot,-.18));bev(RR(56,-15,30,15,6),shade(Y.shoe,-.1));
  slab([8,-8],[46,-40],19,Y.bot);slab([46,-40],[72,-4],17,Y.bot);bev(RR(64,-11,30,15,6),Y.shoe);
  // torso, leaning back against the cot (rotated about the hip)
  ctx.save();ctx.translate(-4,-10);ctx.rotate(-.2);
    bev(()=>{ctx.beginPath();ctx.moveTo(-18,4);ctx.lineTo(-19,-50-br);ctx.quadraticCurveTo(-18,-62-br,-6,-63-br);ctx.lineTo(10,-63-br);ctx.quadraticCurveTo(19,-62-br,19,-50-br);ctx.lineTo(18,4);ctx.closePath()},Y.top,{hl:2.6,sh:3});
    ctx.strokeStyle=shade(Y.top,-.3);ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(4,-14);ctx.lineTo(17,-14);ctx.stroke();   // pocket edge
    bev(EL(-12,-60-br,13,9,-.3),Y.hood,{hl:2,sh:2});                                                                // hood bunched behind the neck
    // neck + head bowed toward him
    bev(RR(-3,-72-br,12,14,4),Y.skin,{hl:1,sh:1});
    ctx.save();ctx.translate(6,-86-br);ctx.rotate(.55+nod);blockHead(Y,34,'side',{closed:o.eyes==='closed',eyeY:5});ctx.restore();
    // DJ's headphones round your neck: band over the collar + the near ear cup
    ctx.strokeStyle='#1a1c22';ctx.lineWidth=4;ctx.beginPath();ctx.arc(2,-66-br,11,.2,Math.PI-.2);ctx.stroke();bev(RR(-6,-64-br,10,14,4),'#2B2F3A',{hl:1.2,sh:1.2});
  ctx.restore();
  // OLLIE: curled sideways across your thighs, back against your chest, head under your chin, face toward us, asleep
  ctx.save();ctx.translate(26,-40);
    slab([4,2],[22,-6],13,O.bot);slab([22,-6],[27,10],12,O.bot);bev(RR(22,7,17,10,4),O.shoe);                          // his legs over your knee
    ctx.save();ctx.rotate(-.45);bev(RR(-14,-30-obr,26,36,9),O.top,{hl:2.2,sh:2.4});ctx.restore();                   // his body (red sweater)
    // the dino toy held loosely on his lap
    ctx.save();ctx.translate(16,-6);ctx.rotate(-.2);bev(RR(-8,-6,18,9,4),O.dino,{hl:1.2,sh:1.2});bev(RR(6,-12,8,8,3),O.dino,{hl:1,sh:1});ctx.fillStyle=PH;ctx.fillRect(11,-10,1.6,1.6);ctx.restore();
    slab([4,-16],[14,-6],8,O.top);bev(EL(16,-5,4,3.6),O.skin,{hl:.8,sh:.8});                                         // his arm, hand on the dino
    ctx.save();ctx.translate(-8,-44-obr*.6);ctx.rotate(-.18);blockHead(O,28,'front',{closed:true,eyeY:3,mouth:'o',noHair:true});beanie(O,28,'front',t);ctx.restore();
  ctx.restore();
  // your near arm round him: shoulder -> elbow -> hand flat on his back
  ctx.save();ctx.translate(-4,-10);ctx.rotate(-.2);const S=[4,-54-br];ctx.restore();
  const Sw=[-4+Math.cos(-.2)*4-Math.sin(-.2)*(-54-br),-10+Math.sin(-.2)*4+Math.cos(-.2)*(-54-br)];
  const stroke=Math.sin(t*1.3)*2;slab(Sw,[18,-28],13,Y.top);slab([18,-28],[34+stroke,-52],12,Y.top);bev(RR(30+stroke,-60,13,12,4),Y.skin,{hl:1,sh:1});
  ctx.restore()}
// ---------- SLEEPER kneeling (never moves). view: 'side' (dir +1 faces right) | 'front' | 'back'. (x,y) = knees on the floor
function slpKneel(x,y,s,seed,view='front',dir=1){const S=BK.slp,top=S.tops[seed%6],bot=S.bots[seed%4],hair=S.hair[seed%5],c={skin:S.skin,hair};const tl=((seed%7)-3)*.05;ctx.save();ctx.translate(x,y);ctx.scale(s*(view==='side'?dir:1),s);
  if(view==='side'){slab([0,-8],[-28,-5],15,shade(bot,-.15));bev(RR(-38,-10,14,9,3),'#22262E');slab([0,-8],[3,-44],18,bot);
    ctx.save();ctx.translate(3,-44);ctx.rotate(.22);bev(RR(-14,-46,28,48,8),top,{hl:2,sh:2.4});ctx.restore();
    slab([12,-82],[16,-58],10,shade(top,-.08));slab([16,-58],[16,-44],9,shade(top,-.08));bev(RR(12,-46,9,8,3),S.skin,{hl:.8,sh:.8});
    ctx.save();ctx.translate(22,-98);ctx.rotate(.62+tl);blockHead(c,28,'side',{closed:true,ring:S.ring,eyeY:3});ctx.restore()}
  else{const bk=view==='back';for(const sd of[-1,1]){bev(RR(sd*11-8,-22,16,20,5),bot,{hl:1.6,sh:2})}
    bev(RR(-17,-74,34,54,9),top,{hl:2.2,sh:2.6});for(const sd of[-1,1]){slab([sd*18,-68],[sd*20,-40],9,shade(top,-.08));bev(RR(sd*20-5,-40,10,9,3),S.skin,{hl:.8,sh:.8})}
    ctx.save();ctx.translate(tl*30+(bk?0:2),-82);ctx.rotate(tl*2.4+(bk?0:.08));if(bk){bev(RR(-14,-14,28,28,7),hair,{hl:1.8,sh:2})}else{blockHead(c,28,'front',{closed:true,ring:S.ring,eyeY:7});ctx.fillStyle=hair;ctx.fillRect(-14,-14,28,9)}ctx.restore()}
  ctx.restore()}
// ---------- top-down sprites: a kneeling Sleeper seen from directly above, head toward -y
const SLPT={};function slpTopSprite(seed){const k=seed%12;if(SLPT[k])return SLPT[k];const c=document.createElement('canvas');c.width=c.height=120;const sv=ctx;ctx=c.getContext('2d');ctx.scale(2,2);ctx.translate(30,30);
  const S=BK.slp,top=S.tops[k%6],bot=S.bots[k%4],hair=S.hair[k%5];bev(RR(-11,6,9,16,4),bot,{hl:1,sh:1});bev(RR(2,6,9,16,4),bot,{hl:1,sh:1});bev(RR(-15,-8,30,20,7),top,{hl:1.6,sh:1.8});
  for(const sd of[-1,1]){bev(RR(sd*15-4,-6,8,16,4),shade(top,-.08),{hl:1,sh:1});bev(RR(sd*15-3,8,7,6,2),S.skin,{hl:.6,sh:.6})}bev(RR(-10,-22,20,18,6),S.skin,{hl:1.4,sh:1.4});ctx.fillStyle=hair;ctx.beginPath();ctx.roundRect(-10,-22,20,13,[6,6,2,2]);ctx.fill();ctx=sv;return SLPT[k]=c}
// ---------- top-down: YOU sitting (facing +y), OLLIE curled asleep in your lap, his face turned up on your chest
function youOllieTop(t,x,y,s){const Y=BK.you,O=BK.ollie;const br=Math.sin(t*2*Math.PI/4.2)*.6,obr=Math.sin(t*2*Math.PI/3.1+1)*.8;ctx.save();ctx.translate(x,y);ctx.scale(s,s);
  for(const sd of[-1,1]){slab([sd*9,8],[sd*12,46],15,Y.bot);bev(RR(sd*12-8,44,16,12,5),Y.shoe)}
  bev(EL(0,-30,18,11),Y.hood,{hl:1.6,sh:1.6});bev(RR(-24,-24+br*.3,48,30,10),Y.top,{hl:2,sh:2.2});bev(RR(-12,-40,24,22,7),Y.hair,{hl:1.6,sh:1.6});
  ctx.strokeStyle='#1a1c22';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,-16,12,.25,Math.PI-.25);ctx.stroke();
  // Ollie
  slab([8,16],[24,30],11,O.bot);slab([24,30],[30,44],10,O.bot);bev(RR(-14,0+obr,28,26,9),O.top,{hl:1.8,sh:2});
  ctx.save();ctx.translate(13,22);ctx.rotate(.4);bev(RR(-7,-4,15,8,3),O.dino,{hl:1,sh:1});ctx.restore();
  ctx.save();ctx.translate(-2,-6+obr*.5);ctx.rotate(-.25);blockHead(O,22,'front',{closed:true,eyeY:4,mouth:'o',noHair:true});beanie(O,22,'front',t);ctx.restore();
  for(const sd of[-1,1]){slab([sd*21,-14],[sd*22,4],11,Y.top);slab([sd*22,4],[sd*9,12],10,Y.top);bev(RR(sd*9-5,8,10,9,3),Y.skin,{hl:.8,sh:.8})}
  ctx.restore()}
