import json,numpy as np,soundfile as sf,subprocess,os
from scipy import signal
os.chdir(os.path.dirname(os.path.abspath(__file__)))
SR=48000
T=json.load(open('timeline.json')); C=json.load(open('cues.json'))
D=C['duration']; N=int(D*SR); rng=np.random.default_rng(23); 
def t_(n): return np.arange(n)/SR
def lp(x,f,o=2): return signal.sosfilt(signal.butter(o,f,'lp',fs=SR,output='sos'),x)
def hp(x,f,o=2): return signal.sosfilt(signal.butter(o,f,'hp',fs=SR,output='sos'),x)
def bp(x,a,b,o=2): return signal.sosfilt(signal.butter(o,[a,b],'bp',fs=SR,output='sos'),x)
def add(buf,sig,t0,g=1.0):
    i=int(t0*SR)
    if i<0: sig=sig[-i:]; i=0
    j=min(N,i+len(sig))
    if j>i: buf[i:j]+=sig[:j-i]*g
def sm(x,w): k=int(w*SR); return np.convolve(x,np.ones(k)/k,mode='same') if k>1 else x
import pyloudnorm as pln
vv,vsr=sf.read('voice48.wav'); vv=vv if vv.ndim==1 else vv[:,0]
voice=np.zeros(N); voice[:min(N,len(vv))]=vv[:N]
# voice chain: gentle RMS compressor (3:1 above -20 dBFS) then a 5 ms look-ahead peak limiter (no tanh clipping of Brian's voice)
def env_follow(x,att,rel):
    a=np.exp(-1/(att*SR)); r=np.exp(-1/(rel*SR)); y=np.zeros_like(x); e=0.0
    for i,v in enumerate(x):
        c=a if v>e else r; e=c*e+(1-c)*v; y[i]=e
    return y
def compress(x,thr_db=-20,ratio=3,att=.01,rel=.15):
    p=env_follow(x**2,att,rel); lv=10*np.log10(p+1e-12); over=np.maximum(0,lv-thr_db); g=10**(-(over*(1-1/ratio))/20); return x*g
def limit(x,ceil=.79,look=.005,rel=.08):
    n=int(look*SR); a=np.abs(x); from scipy.ndimage import maximum_filter1d
    pk=maximum_filter1d(a,size=2*n+1); g=np.minimum(1,ceil/np.maximum(pk,1e-9)); gs=np.copy(g); r=np.exp(-1/(rel*SR)); 
    for i in range(1,len(gs)): gs[i]=min(g[i],r*gs[i-1]+(1-r)*g[i]) if g[i]>=gs[i-1] else g[i]
    gs=np.convolve(gs,np.ones(n)/n,mode='same'); return x*np.minimum(gs,g)
_l=pln.Meter(SR).integrated_loudness(voice); voice=voice*10**((-19.0-_l)/20); voice=compress(voice,thr_db=-25,ratio=3.5,att=.004,rel=.12)
_l=pln.Meter(SR).integrated_loudness(voice); voice=voice*10**((-14.5-_l)/20); voice=limit(voice)
tb=t_(int(.3*SR)); br=bp(rng.standard_normal(len(tb)),600,4200)*np.sin(np.pi*np.clip(tb/.3,0,1))**2
breath=br/np.abs(br).max()*10**(-22/20)*0.89
sfx=np.zeros(N); bed=np.zeros(N)
LL=json.load(open('lines.json')); firsts=[l[0] for l in LL][1:]
order=[l[0] for l in LL]
for lid in firsts:
    k=order.index(lid); gap=C['lines'][lid]['s']-(C['lines'][order[k-1]]['s']+C['lines'][order[k-1]]['d'])
    if gap>=0.4: add(sfx,breath,C['lines'][lid]['s']-0.15-0.02)
act=np.zeros(N)
for c in T['chunks']:
    for w in c['words']: act[int(w['s']*SR):int(w['e']*SR)]=1
duck=1-(1-10**(-6/20))*np.clip(sm(act,0.08),0,1)
def boom(g=1,dur=1.2):
    n=int(dur*SR);t=t_(n); f=35+60*np.exp(-t/0.12); ph=2*np.pi*np.cumsum(f)/SR
    return (np.sin(ph)*np.exp(-t/0.45)+lp(rng.standard_normal(n),200)*np.exp(-t/0.08)*0.6)*g
def whoosh(dur=.6,g=1,up=True):
    n=int(dur*SR);t=t_(n);x=rng.standard_normal(n);e=np.sin(np.pi*t/dur)**2
    f=np.linspace(300,3000,n) if up else np.linspace(3000,300,n);out=np.zeros(n);seg=max(1,n//12)
    for i in range(12):
        c=f[min(n-1,i*seg+seg//2)]; out[i*seg:(i+1)*seg]=bp(x,c*.7,c*1.4)[i*seg:(i+1)*seg]
    return out*e*g
def pop(g=1):
    n=int(.05*SR);t=t_(n);f=900*np.exp(-t/.02)+300;return np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t/.015)*g
def thud(g=1):
    n=int(.35*SR);t=t_(n);return (np.sin(2*np.pi*58*t)*np.exp(-t/.12)+lp(rng.standard_normal(n),700)*np.exp(-t/.02)*.7)*g
def click(g=1):
    n=int(.02*SR);return hp(rng.standard_normal(n),1500)*np.exp(-t_(n)/.004)*g
def ping(f=1760,g=1):
    n=int(.5*SR);t=t_(n);return (np.sin(2*np.pi*f*t)+.3*np.sin(2*np.pi*f*2*t))*np.exp(-t/.12)*g
def thump(f=55,g=1):
    n=int(.12*SR);t=t_(n);return np.sin(2*np.pi*f*t)*np.exp(-t/.035)*g
def chirp(g=1):
    n=int(.12*SR);t=t_(n);return np.sin(2*np.pi*2400*t)*np.sin(np.pi*t/.12)*g
def buzz(g=1):
    n=int(.25*SR);t=t_(n);return (np.sin(2*np.pi*180*t)>0).astype(float)*np.sin(np.pi*t/.25)*.5*g




shots=C['shots']; S0={s['n']:s for s in shots}
SS=lambda n:S0[n]['s']; EE=lambda n:S0[n]['e']; LN=C['lines']; WD=C['W']; t=t_(N); amb=np.zeros(N)
def hit(g=1):
    n=int(.5*SR);tt=t_(n);return (np.sin(2*np.pi*95*tt)*np.exp(-tt/.12)+bp(rng.standard_normal(n),300,1800)*np.exp(-tt/.05)*.7)*g
def ov(*a):
    n=max(len(x) for x in a);o=np.zeros(n)
    for x in a:o[:len(x)]+=x
    return o
def creak(dur=1.4,g=1.0,f0=260,f1=420):
    n=int(dur*SR);tt=t_(n);f=np.linspace(f0,f1,n)*(1+.25*np.sin(2*np.pi*7*tt));ph=2*np.pi*np.cumsum(f)/SR
    x=(np.sign(np.sin(ph))*.5+np.sin(ph*2.1)*.3)*(.6+.4*np.sin(2*np.pi*23*tt)); x=bp(x+rng.standard_normal(n)*.25,180,1800)
    return x*np.sin(np.pi*tt/dur)**.7*g

def humsig(dur,f=73.42):
    n=int(dur*SR);tt=t_(n);x=sum(np.sin(2*np.pi*f*(1+rng.uniform(-.01,.01))*tt*h+rng.uniform(0,6))/h for h in (1,2,3) for _ in range(3));return lp(x,500)/9
def pad(dur,fs=(110,164.8,220,277.2)):
    n=int(dur*SR);tt=t_(n);x=sum(np.sin(2*np.pi*f*tt+rng.uniform(0,6))*(1+.1*np.sin(2*np.pi*(.3+i*.07)*tt)) for i,f in enumerate(fs));return lp(x,900)*np.sin(np.pi*np.clip(tt/dur,0,1))**.5/len(fs)
def breath(dur=1.2,g=1):
    n=int(dur*SR);tt=t_(n);return bp(rng.standard_normal(n),400,2600)*np.sin(np.pi*tt/dur)**2*g
def stat(dur,g=1):
    n=int(dur*SR);x=hp(rng.standard_normal(n),600)*(rng.random(n)>.35);return x*np.sin(np.linspace(0,np.pi,n))**.6*g
def clank(g=1,f=420):
    n=int(.6*SR);tt=t_(n);return (np.sin(2*np.pi*f*tt)+.6*np.sin(2*np.pi*f*2.71*tt)+.3*np.sin(2*np.pi*f*4.1*tt))*np.exp(-tt/.12)*g
# (no UI pop on every caption change)
NEWPLACE={'vote_stamp','dawn','file_pan','photo','mark','stands','follow_door','vote'}
for s_ in shots:
    if s_['n'] in NEWPLACE: add(sfx,whoosh(.35,1,False),s_['s']-.3,.015)
def hb(a,b,bpm=64,g=.42):
    tt=a
    while tt<b: add(sfx,thump(55),tt,g); add(sfx,thump(48),tt+.22,g*.7); tt+=60/bpm
# basement room tone + the low hum of three thousand kneeling (they hum while he sleeps)
room=lp(rng.standard_normal(N),180);room*=.02/np.abs(room).max();amb+=room
hm=humsig(EE('tear'));add(bed,hm*np.interp(t_(len(hm)),[0,3,EE('tear')],[0,.11,.13]),0,1)
# hook text cards: a soft thud each, before the word, never on top of it
for tt in C['hookT']: add(sfx,thud(1),tt-.05,.1)
for tt in C['stampT']: add(sfx,thud(1),tt-.08,.14)
# your slow heartbeat through the night, his breathing on your chest
hb(SS('face_sleep'),EE('finger'),56,.16)
for tt in np.arange(SS('face_sleep'),SS('night_face')+1.2,2.2): add(sfx,lp(breath(1.0),1200),tt,.035)
add(sfx,lp(rng.standard_normal(int(.3*SR)),900)*np.sin(np.linspace(0,np.pi,int(.3*SR))),SS('night_face')+.8,.05)   # he shifts (cloth)
for tt in C['tapsEcho']: add(sfx,lp(ov(thump(120)*2,ping(1500,1)*.25),2500),tt,.07)       # faint echoes of the old taps
# dawn: eyelids, a cold air tone; the file: paper; the stamp just BEFORE the whisper
add(bed,pad(EE('maya_photo')-SS('dawn'),fs=(146.8,220,293.7))*.07,SS('dawn'),1)
for tt in (SS('file_pan')+.1,SS('photo')+.05): add(sfx,hp(bp(rng.standard_normal(int(.4*SR)),900,5000),600)*np.sin(np.linspace(0,np.pi,int(.4*SR))),tt,.05)
add(sfx,thud(1),C['s0T']-.12,.16)
gl=C['glowT'];n=int(.9*SR);add(sfx,np.sin(2*np.pi*880*t_(n))*np.sin(np.pi*t_(n)/.9)*.5+np.sin(2*np.pi*1320*t_(n))*np.sin(np.pi*t_(n)/.9)*.25,gl,.03)   # the mark glows
add(sfx,boom(1,.8),C['mayaT']-.02,.08)
# crayon scratch under the writing (quieter than the whisper), the tear
W3=C['W']['e3']
for k in range(9): add(sfx,hp(bp(rng.standard_normal(int(.12*SR)),2000,7000),1500)*np.sin(np.linspace(0,np.pi,int(.12*SR))),W3[0][1]-.15+k*.14,.02)
add(sfx,ping(2600,1)*.3,C['tearT'][0]+.6,.025)
# he stands: the hum swells; they rise (heard, never seen); shuffling out the door
add(sfx,lp(rng.standard_normal(int(1.2*SR)),300)*np.sin(np.linspace(0,np.pi,int(1.2*SR))),SS('follow_top')-.05,.12)
for tt in np.arange(SS('follow_top')+.2,SS('vote')+1.5,.31): add(sfx,thud(1),tt,.03)
vt=C['vote_t']
for tt in vt[1:3]: add(sfx,whoosh(.35,1,True),tt-.2,.06); add(sfx,thud(1),tt-.05,.16)
for k in (.6,.9,1.2): add(sfx,ov(thump(120)*2,ping(1500,1)*.25),C['cta_t']+k,.08)
add(bed,pad(EE('vote')-vt[3],fs=(98,147,196,247))*.12,vt[3],1)
f1_=36.7*(1+0.003*np.sin(2*np.pi*.07*t)); drone=np.sin(2*np.pi*np.cumsum(f1_)/SR)+.6*np.sin(2*np.pi*np.cumsum(55*(1+.004*np.sin(2*np.pi*.13*t)))/SR)
drone=lp(drone*(0.7+0.3*np.sin(2*np.pi*t/9)),150)*.09/np.abs(drone).max()
drone*=np.interp(t,[0,SS('face_sleep'),SS('face_sleep')+.4,SS('dawn'),SS('dawn')+.5,EE('follow_door'),SS('vote'),N/SR],[.6,.6,.3,.3,1,1,.5,.5])
bedmix=hp(amb+drone*.7+bed,45)*duck
gate=np.ones(N)
for a,b in C['drops']: gate[int(a*SR):int(b*SR)]=0
gate=sm(gate,0.012)
duckS=1-(1-10**(-5/20))*np.clip(sm(act,0.06),0,1)
sfx*=10**(-2.5/20)
mix=(voice+sfx*duckS+bedmix)*gate
sf.write('mix_raw.wav',mix.astype(np.float32),SR)
sf.write('aud/st_voice.wav',(voice*gate).astype(np.float32),SR);sf.write('aud/st_sfx.wav',(sfx*duckS*gate).astype(np.float32),SR);sf.write('aud/st_bed.wav',(bedmix*gate).astype(np.float32),SR)
# final: one fixed gain to -14 LUFS, then the look-ahead limiter at -1.6 dBFS (sample peak) so the true peak stays <= -1 dB
def limitTP(x,ceil_db=-1.4,look=.004,rel=.06):
    # true-peak limiter: peaks are measured on a 4x oversampled copy, the gain is applied at 48 kHz
    from scipy.signal import resample_poly; from scipy.ndimage import maximum_filter1d
    up=np.abs(resample_poly(x,4,1));tp=up[:len(x)*4].reshape(-1,4).max(1)[:len(x)];n=int(look*SR)
    pk=maximum_filter1d(tp,size=2*n+1);g=np.minimum(1,10**(ceil_db/20)/np.maximum(pk,1e-9));r=np.exp(-1/(rel*SR));gs=np.copy(g)
    for i in range(1,len(gs)): gs[i]=g[i] if g[i]<gs[i-1] else min(g[i],r*gs[i-1]+(1-r)*g[i])
    gs=np.minimum(np.convolve(gs,np.ones(n)/n,mode='same'),g);return x*gs
tgt=-14.0
for _ in range(12):
    fin=limitTP(mix*10**((tgt-pln.Meter(SR).integrated_loudness(mix))/20))
    li=pln.Meter(SR).integrated_loudness(fin)
    if abs(li+14.0)<.05:break
    tgt+=-14.0-li
print('final LUFS',round(li,2),'pre-gain target',round(tgt,2))
sf.write('mix_final.wav',fin.astype(np.float32),SR,subtype='PCM_24')
print('audio ok',D)
