import json,numpy as np,soundfile as sf,subprocess,os
from scipy import signal
os.chdir(os.path.dirname(os.path.abspath(__file__))+'/..')
SR=48000
T=json.load(open('v4/timeline.json')); C=json.load(open('v4/cues.json'))
D=C['duration']; N=int(D*SR); rng=np.random.default_rng(23); K=C['T']; BS=K['BS']
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
vv,vsr=sf.read('v4/voice48.wav'); vv=vv if vv.ndim==1 else vv[:,0]
voice=np.zeros(N); voice[:min(N,len(vv))]=vv[:N]
_l=pln.Meter(SR).integrated_loudness(voice); voice=voice*10**((-13.0-_l)/20); voice=np.tanh(voice/.95)*.93
tb=t_(int(.3*SR)); br=bp(rng.standard_normal(len(tb)),600,4200)*np.sin(np.pi*np.clip(tb/.3,0,1))**2
breath=br/np.abs(br).max()*10**(-22/20)*0.89
sfx=np.zeros(N); bed=np.zeros(N)
LL=json.load(open('v4/lines.json')); firsts=['b1','c1','d1','e1','f1','g1','h1','i1','j1','k1','l1','m1','n1','o1','z1']
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
shots=C['shots']
S0={}
for s in shots: S0.setdefault(s['n'],[]).append(s)
# pops
for c in T['chunks']: add(sfx,pop(),c['s'],10**(-24/20)*.9)
# cut hits: boom on every cut, whoosh before
fb0,fb1=C['fb']
for i,s in enumerate(shots):
    if s['n'] in ('blk',) : continue
    t0=s['s']; g=.12 if fb0<=t0<fb1 else .14
    add(sfx,whoosh(.4,1,False),t0-.35,.05); add(sfx,boom(1,.6),t0,g*.8)
# pills
for name,a,b in C['pills']:
    if name!='HOUR 0': add(sfx,thud(1),a,.34); add(sfx,pop(),a,.1)
    else: add(sfx,thud(1),a,.4)
# rewind whoosh (reverse noise swell) + tape
n=int(.8*SR); rw=bp(rng.standard_normal(n),200,6000)*np.linspace(0,1,n)**2; add(sfx,rw,BS['B2'],.05)
# phones: buzz chorus ripple
for s in S0['phones']+S0['phone_lock']:
    for k in range(int((s['e']-s['s'])*14)): add(sfx,buzz(),s['s']+k*.07+rng.uniform(0,.05),.06)
# B3 thuds / yawn-ish
for s in S0['driver']+S0['bus_lamp']+S0['stadium']+S0['cockpit']: add(sfx,thud(1),s['s']+.45,.3)
add(sfx,lp(rng.standard_normal(int(.5*SR)),500)*np.sin(np.pi*t_(int(.5*SR))/.5),S0['bus_lamp'][0]['e']-.3,.15)
# counters ticks: awake roll, sound3, nearby
for tt in np.arange(BS['B3']+.2,BS['B3']+3.4,.07): add(sfx,click(),tt,.12)
for tt in np.arange(S0['sound3'][0]['s'],S0['sound3'][0]['s']+.9,.1): add(sfx,click(),tt,.15)
for tt in np.arange(C['nearby']['t'],C['nearby']['t']+1.1,.05): add(sfx,click(),tt,.12)
# B4: standing thud, alarm chirps (stop at cut), car alarm
add(sfx,thud(1),S0['woman'][0]['s']+.3,.4)
al=S0['alarm'][0]
for tt in np.arange(al['s']+.05,al['e']-.05,.45): add(sfx,chirp(),tt,.18); add(sfx,chirp(),tt+.16,.18)
# B5: rain bed in 'bed' shot, hum floods at earcup (filter sweep) , muffled rain after
b=S0['bed'][0]; n=int((b['e']-b['s'])*SR); rain=hp(rng.standard_normal(n),2500)*.05; add(bed,rain,b['s'],1)
ec=S0['earcup'][0]
n=int((ec['e']-ec['s'])*SR); flood=bp(rng.standard_normal(n),90,900)*np.sin(np.pi*t_(n)/(n/SR))*.2; add(sfx,flood,ec['s'],1)
n=int(.9*SR); add(bed,lp(rng.standard_normal(n),700)*.04,ec['e'],1)
# B6: plane: silent until flash; boom + ringing tone
pe=K['planeE']; add(sfx,boom(1,2.4),pe-.12,.45); n=int(3.5*SR); t=t_(n); add(sfx,np.sin(2*np.pi*3200*t)*np.exp(-t/1.4),pe-.1,.03)
add(sfx,whoosh(.5,1,False),pe-.7,.04)
# B7: door slam + two-tone alert, footsteps
ds=S0['door_slam'][0]['s']; add(sfx,thud(1),ds+.05,.32); add(sfx,boom(1,.6),ds+.05,.1)
spr=S0['sprint'][0]
for tt in np.arange(spr['s'],spr['e'],.21): add(sfx,thud(1),tt,.14)
n=int(.4*SR);t=t_(n)
for k in range(3):
    a=(np.sin(2*np.pi*853*t)+np.sin(2*np.pi*960*t))*np.sin(np.pi*t/.4)**.5*.05; add(sfx,a,ds+.2+k*.5,1)
# B7b: cup whoosh slow
add(sfx,whoosh(1.4,1,False),S0['cup1'][0]['s'],.05)
# B9: radio static + plant exhale (same breath sample)
rs=S0['radio'][0]['s']; re_=S0['rescue'][0]['e']; n=int((re_-rs)*SR); tt=t_(n)
st=bp(rng.standard_normal(n),900,3800)*(0.5+0.5*np.sin(2*np.pi*3*tt)*(rng.random(n)>.5))*.045; add(bed,st,rs,1)
add(sfx,breath,rs+.7,1); add(sfx,breath,rs+2.4,1)
# B10: pings, swell, boom at twist, heartbeat
mp=C['map']
for tt in (mp[0]+.6,mp[0]+1.5,mp[3]+.2): add(sfx,ping(),tt,.1)
add(sfx,whoosh(1.4,1,True),C['nearby']['t']-1.4,.1); add(sfx,boom(1,1.4),C['nearby']['t'],.3)
# lamp click
add(sfx,click(),C['lampoff'],.4)
# B11 kneel thud, B12 boom
add(sfx,boom(1,1.6),K['kneel_t'],.26); add(sfx,thud(1),K['kneel_t'],.26)
add(sfx,boom(1,1.8),K['openT'],.22); add(sfx,whoosh(1.6,1,True),K['openT']+.4,.06)
add(sfx,boom(1,1.6),K['reflE'],.3)   # smash to black, sub-bass
add(sfx,boom(1,1.2),K['ctaT']-.05,.25)
# fridge hum / clock ticks in door shots
t=t_(N); amb=np.zeros(N)
for s in S0['door']+S0['door2']:
    i,j=int(s['s']*SR),int(s['e']*SR); amb[i:j]+=np.sin(2*np.pi*50*t[i:j])*.012
for s in S0['door']:
    for tt in np.arange(s['s']+.3,s['e'],.8): add(sfx,click(),tt,.05)
# wind
wind=lp(rng.standard_normal(N),260)*(0.5+0.5*np.sin(2*np.pi*.11*t+1))*0.5; wind=lp(wind,180); wind*=0.035/np.abs(wind).max()*0.6
amb+=wind
# drone
f1=36.7*(1+0.003*np.sin(2*np.pi*.07*t)); drone=np.sin(2*np.pi*np.cumsum(f1)/SR)+.6*np.sin(2*np.pi*np.cumsum(55*(1+.004*np.sin(2*np.pi*.13*t)))/SR)+.35*np.sin(2*np.pi*38.5*t)
drone=drone*(0.7+0.3*np.sin(2*np.pi*t/9)); drone=lp(drone,150)*0.11/np.abs(drone).max(); drone*=np.clip((t-.2)/2,0,1)
# hum layers
def hum(nv,spread=.008,harm=True):
    h=np.zeros(N)
    for k in range(nv):
        f=73.42*(1+rng.uniform(-spread,spread)); s=np.sin(2*np.pi*f*t+rng.uniform(0,6))+.5*np.sin(2*np.pi*2*f*t)+.25*np.sin(2*np.pi*3*f*t)
        s*=(1+.12*np.sin(2*np.pi*rng.uniform(.3,.9)*t)); h+=s
    h=lp(h,400); return h/np.abs(h).max()
def lvl(points): 
    xs=[p[0] for p in points]; ys=[p[1] for p in points]; return np.interp(t,xs,ys)
nightS=S0['night_sky'][0]['s']; B3=BS['B3']; B4=BS['B4']; B5=BS['B5']; B9=BS['B9']; B10=BS['B10']; B11=BS['B11']; B12=BS['B12']; ec0=ec['s']; ec1=ec['e']
h1=hum(1); h12=hum(12,.012); h40=hum(40,.02); hp1=hum(1,.001)
single=h1*lvl([(0,.10),(nightS,.10),(nightS+.4,.22),(B3,.22),(B5,.12),(B9,.1),(B10,.1),(B11,.1),(B11+1,.0),(B12,0),(K['openT']-.2,0),(K['openT'],.3),(K['blkE'],.3),(K['blkE']+.3,0)])
chorus=h12*lvl([(0,0),(B3,0),(B3+1.2,.12),(B4,.14),(B4+1.0,.22),(S0['alarm'][0]['e'],.25),(B5,.03),(ec0,.03),(ec0+.3,.3),(ec1,.04),(B9,.04),(B10,.08),(B10+3,.12),(B11,.0)])
mass=h40*lvl([(0,0),(B10,0),(B10+3,.12),(C['nearby']['t'],.3),(B11,.38),(K['hold0'],.0),(K['kneel_t']-.01,.0),(K['kneel_t'],.38),(K['kneel_t']+1.5,.3),(B12,0),(K['openT'],.45),(K['reflE'],.45),(K['reflE']+.3,0)])
pure=hp1*lvl([(0,0),(B12-.1,0),(B12+.3,.18),(K['openT']-.1,.18),(K['openT'],0)])
humall=(single*.16+chorus*.16+mass*.12+pure*.16)
# heartbeat
hb=np.zeros(N)
def beats(t0,t1,b0,b1):
    cur=t0
    while cur<t1:
        bpm=b0+(b1-b0)*(cur-t0)/(t1-t0); per=60/bpm; add(hb,thump(55,1),cur,.5); add(hb,thump(48,1),cur+.22*per,.36); cur+=per
beats(B10,K['openT']-.5,60,110); beats(K['openT'],K['reflE'],120,120)
hb=lp(hb,160)*.9
# vote end: dying hum/drone
fade=np.clip(1-(t-K['reflE'])/(max(.1,K['ctaT']-K['reflE'])),0,1)
bedmix=(amb+drone*np.where(t>K['reflE'],fade,1)+humall)*duck+hb*.9*np.where(t<K['reflE'],1,0)+bed
gate=np.ones(N)
drops=C['drops']+[[K['reflE']+.5,K['blkE']+.0],]
for a,b in drops: gate[int(a*SR):int(b*SR)]=0
gate=sm(gate,0.012)
duckS=1-(1-10**(-5/20))*np.clip(sm(act,0.06),0,1)
mix=(voice+sfx*duckS+bedmix)*gate
sf.write('v4/mix_raw.wav',mix.astype(np.float32),SR); sf.write('v4/voice_only.wav',voice.astype(np.float32),SR)
subprocess.run(['ffmpeg','-y','-loglevel','error','-i','v4/mix_raw.wav','-af','loudnorm=I=-14:TP=-1:LRA=9','-ar','48000','v4/mix_final.wav'],check=True)
print('audio ok',D)
