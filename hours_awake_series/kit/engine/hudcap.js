const CU=window.CUES,TL=window.TL;
const SH=CU.shots;
function shotAt(t){for(const x of SH)if(t>=x.s&&t<x.e)return x;return null}
const fmtC=m=>{m=Math.round(m);return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0')};
function clockStr(t){const rw=CU.rewind;if(t>=rw[0]&&t<rw[1])return {s:fmtC(lerp(41*60,0,eio(pr(t,rw[0],rw[1])))),tag:null,t0:rw[0]};const ro=CU.roll;if(ro&&t>=ro[0]&&t<ro[1])return {s:fmtC(lerp(ro[2],ro[3],eio(pr(t,ro[0],ro[1])))),tag:null,t0:ro[0],roll:true};
let r=CU.clock[0];for(const c of CU.clock)if(t>=c[0])r=c;return {s:r[1],tag:r[2],t0:r[0]}}
function evVal(ev,t,ease=.25){let v=ev[0][1],prev=v,lt=-1e9;for(const [tt,val,rd] of ev){if(t>=tt){prev=v;v=val;lt=tt;ease=rd||.25}}return lerp(prev,v,eio(clamp((t-lt)/ease)))}
function hud(t){ctx.save();const X=33;
ctx.fillStyle=RED;ctx.beginPath();ctx.arc(X+5,106,4.5,0,7);ctx.fill();
ctx.font='500 13px "JetBrains Mono"';ctx.letterSpacing='2px';ctx.fillStyle=RED;ctx.fillText('EP '+(CU.ep||1)+' / 7',X+16,111);
ctx.fillStyle='#8A8F99';ctx.font='500 11px "JetBrains Mono"';ctx.fillText('HOURS AWAKE',X+104,111);
const ck=clockStr(t);ctx.letterSpacing='1px';ctx.font='64px "Bebas Neue"';ctx.fillStyle='#fff';ctx.shadowColor='rgba(0,0,0,.8)';ctx.shadowBlur=8;
const rewinding=(t>=CU.rewind[0]&&t<CU.rewind[1])||ck.roll;if(rewinding)ctx.fillStyle=AMB;ctx.fillText(ck.s,X,166);ctx.shadowBlur=0;
if(ck.tag&&t-ck.t0<1.0){ctx.globalAlpha=1-pr(t-ck.t0,.7,1);ctx.fillStyle=AMB;ctx.font='600 13px "JetBrains Mono"';ctx.fillText(ck.tag,X+118,150);ctx.globalAlpha=1}
rect(X,176,300,1,'rgba(255,255,255,.25)');
ctx.font='500 13px "JetBrains Mono"';ctx.letterSpacing='1.2px';
let x=X,y=195;const part=(lab,val,col)=>{ctx.fillStyle='#8A8F99';ctx.fillText(lab,x,y);x+=ctx.measureText(lab).width+6;ctx.fillStyle=col;ctx.fillText(val,x,y);x+=ctx.measureText(val).width+14};
const surv=t>=CU.survivors_t;
let av=Math.round(evVal(CU.awake,t,.5));const rolling=CU.awake.some(e=>t>=e[0]&&t<e[0]+(e[2]||.25)&&e[2]);
part(surv?'SURVIVORS':'AWAKE IN CITY',av.toLocaleString('en-US'),rolling?RED:'#fff');
const nz=evVal(CU.noise,t);part('NOISE',Math.round(nz)+' dB',nz>60&&(nz>100||Math.floor(t*6)%2==0)?RED:(nz>60?RED:'#fff'));
x=X;y=213;const nb=CU.nearby;part('SLEEPERS NEARBY',Math.round(lerp(nb.from,nb.to,eio(pr(t,nb.t,nb.t+nb.dur)))).toLocaleString('en-US'),'#fff');
if(t>=nb.t&&t-nb.t<2.2){ctx.globalAlpha=1-pr(t-nb.t,1.6,2.2);ctx.fillStyle=LIME;ctx.fillText(nb.tag||'',X+215,y);ctx.globalAlpha=1}
if(t>=CU.survivors_t&&t-CU.survivors_t<1.4){ctx.globalAlpha=1-pr(t-CU.survivors_t,1,1.4);ctx.fillStyle=LIME;ctx.fillText('+',X+150,194);ctx.globalAlpha=1}
if(t>=CU.rescue){ctx.globalAlpha=eio(pr(t-CU.rescue,0,.3));ctx.fillStyle=AMB;ctx.font='600 13px "JetBrains Mono"';ctx.fillText((CU.rescue6&&t>=CU.rescue6)?'RESCUE IN 6 DAYS':'RESCUE IN 7 DAYS',X,232);ctx.globalAlpha=1}
if(CU.votetag&&t>=CU.votetag[0]&&t<CU.votetag[1]){const a=clamp((t-CU.votetag[0])/.2)*(1-pr(t,CU.votetag[1]-.35,CU.votetag[1]));ctx.globalAlpha=a;ctx.fillStyle=LIME;ctx.beginPath();ctx.roundRect(X,244,172,24,12);ctx.fill();ctx.fillStyle='#0A0D16';ctx.font='900 12px Montserrat';ctx.letterSpacing='1px';ctx.textAlign='left';ctx.fillText(CU.votetag[2],X+12,261);ctx.globalAlpha=1}
ctx.restore()}
function captions(t,sh){if(!sh||CU.nocap.includes(sh.n))return;const ch=TL.chunks.find(c=>t>=c.s&&t<c.e);if(!ch)return;
const el=(t-ch.s)/0.2;const sc=lerp(.85,1,eob(clamp(el)));const y=CU.cap_y[sh.n]||690;
ctx.save();ctx.font='900 36px Montserrat';ctx.letterSpacing='0px';ctx.textAlign='left';
const gap=ctx.measureText(' ').width+3;const txt=ch.words.map(w=>w.t+(w.ell?'…':''));const wid=txt.map(a=>ctx.measureText(a).width);
let total=wid.reduce((a,b)=>a+b,0)+gap*(txt.length-1);let idx=[...txt.keys()];let lines=[idx];
if(total>470&&txt.length>1)lines=[idx.slice(0,Math.ceil(txt.length/2)),idx.slice(Math.ceil(txt.length/2))];
ctx.translate(270,y);ctx.scale(sc,sc);
lines.forEach((ln,li)=>{const lw=ln.reduce((a,i)=>a+wid[i],0)+gap*(ln.length-1);let x=-lw/2;
for(const i of ln){const w=ch.words[i];const act=t>=w.s&&t<w.e+.08||(i===ch.words.length-1&&t>=w.s);
let col='#fff';if(w.col==='red'||w.danger)col=RED;else if(w.col==='amber'||w.amber)col=AMB;else if(act||(w.col==='lime'&&t>=w.s))col=LIME;
ctx.shadowColor='rgba(0,0,0,.7)';ctx.shadowBlur=6;ctx.shadowOffsetY=3;ctx.lineWidth=5;ctx.strokeStyle='rgba(0,0,0,.35)';ctx.strokeText(txt[i],x,li*44);ctx.fillStyle=col;ctx.fillText(txt[i],x,li*44);x+=wid[i]+gap}});
ctx.restore()}
function pills(t,sh){for(const [name,s0,e0] of CU.pills){if(t>=s0&&t<e0){const el=(t-s0)/(6/30);const sc=el<1?(el<.6?lerp(0,1.08,el/.6):lerp(1.08,1,(el-.6)/.4)):1;
const big=name==='HOUR 0';const y=big?430:((sh&&CU.cap_y[sh.n])||690)-78;ctx.save();ctx.translate(270,y);ctx.scale(sc*(big?2.2:1),sc*(big?2.2:1));ctx.font='900 22px Montserrat';ctx.letterSpacing='1px';const w=ctx.measureText(name).width+44;ctx.fillStyle=RED;ctx.beginPath();ctx.roundRect(-w/2,-20,w,40,20);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.fillText(name,0,8);ctx.restore()}}}
