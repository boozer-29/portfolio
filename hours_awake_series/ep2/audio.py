import json,numpy as np,soundfile as sf,subprocess,os
from scipy import signal
os.chdir(os.path.dirname(os.path.abspath(__file__))+'/..')
SR=48000
T=json.load(open('e2/timeline.json')); C=json.load(open('e2/cues.json'))
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
vv,vsr=sf.read('e2/voice48.wav'); vv=vv if vv.ndim==1 else vv[:,0]
voice=np.zeros(N); voice[:min(N,len(vv))]=vv[:N]
_l=pln.Meter(SR).integrated_loudness(voice); voice=voice*10**((-13.0-_l)/20); voice=np.tanh(voice/.95)*.93
tb=t_(int(.3*SR)); br=bp(rng.standard_normal(len(tb)),600,4200)*np.sin(np.pi*np.clip(tb/.3,0,1))**2
breath=br/np.abs(br).max()*10**(-22/20)*0.89
sfx=np.zeros(N); bed=np.zeros(N)
LL=json.load(open('e2/lines.json')); firsts=['b1','c1','d1','e1','f1','g1','h1','i1','j1','k1','l1','m1','z1']
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

shots=C['shots']; S0={}
for s in shots: S0.setdefault(s['n'],[]).append(s)
def SS(n): return S0[n][0]['s']
def EE(n): return S0[n][0]['e']
for c in T['chunks']: add(sfx,pop(),c['s'],10**(-24/20)*.9)
for s in shots:
    t0=s['s']; add(sfx,whoosh(.4,1,False),t0-.35,.04); add(sfx,boom(1,.6),t0,.10)
for name,a,b in C['pills']: add(sfx,thud(1),a,.34); add(sfx,pop(),a,.1)
t=t_(N); amb=np.zeros(N)
wind=lp(rng.standard_normal(N),260)*(0.5+0.5*np.sin(2*np.pi*.11*t+1)); wind=lp(wind,180); wind*=0.03/np.abs(wind).max()
roofmask=((t<EE('stair_run'))|((t>=SS('stare_a'))*0)|((t>=SS('plank'))&(t<EE('plank'))))*1.0
amb+=wind*(.4+.6*roofmask)
# run footsteps on stairs and street
for a,b in [(SS('stair_run'),EE('stair_run')),(SS('run_beat'),EE('run_beat'))]:
    for tt in np.arange(a,b,.2): add(sfx,thud(1),tt,.16)
# hum behind door
for n_ in ('door_hum','ollie_arms'):
    i,j=int(SS(n_)*SR),int(EE(n_)*SR)
    amb[i:j]+=np.sin(2*np.pi*73.4*t[i:j])*.02*np.sin(np.pi*np.linspace(0,1,j-i))**.5
# micro
for tt in np.arange(SS('pov_heavy'),SS('micro_a'),.8): add(sfx,thump(50,1),tt,.3)
for tt in np.arange(SS('micro_a'),EE('micro_b'),.5): add(sfx,click(),tt,.1)
# tablet pings
for tt in np.arange(SS('tablet_dots')+.3,EE('tablet_dots'),.45): add(sfx,ping(),tt,.06)
add(sfx,ping(880),SS('tablet_ollie')+.3,.1)
# kneel thuds
for tt in C['kneel_times']: add(sfx,thud(1),tt,.32); add(sfx,boom(1,.8),tt,.08)
# stare swell
add(sfx,whoosh(1.6,1,True),SS('stare_a'),.08); add(sfx,boom(1,1.4),C['stare_swap'],.25)
# door break hits
for tt in (49.193,50.5,50.636,50.9): add(sfx,boom(1,1.2),tt,.3); add(sfx,thud(1),tt,.3)
# plank creak
for tt in np.arange(SS('plank')+.2,EE('plank'),.45):
    n=int(.3*SR); add(sfx,bp(rng.standard_normal(n),300,900)*np.sin(np.pi*t_(n)/.3)*.05,tt,1)
# stairwell down: rising sub + hum
add(sfx,whoosh(2.0,1,False),SS('stair_down'),.06)
# vote
vt=C['vote_t']
for tt in vt[1:3]: add(sfx,whoosh(.35,1,True),tt-.2,.08); add(sfx,thud(1),tt,.25)
add(sfx,thud(1),C['cta_t'],.3)
# breath plants
f1=36.7*(1+0.003*np.sin(2*np.pi*.07*t)); drone=np.sin(2*np.pi*np.cumsum(f1)/SR)+.6*np.sin(2*np.pi*np.cumsum(55*(1+.004*np.sin(2*np.pi*.13*t)))/SR)+.35*np.sin(2*np.pi*38.5*t)
drone=drone*(0.7+0.3*np.sin(2*np.pi*t/9)); drone=lp(drone,150)*0.11/np.abs(drone).max(); drone*=np.clip((t-.2)/2,0,1)
hm=np.zeros(N)
for k in range(30):
    f=73.42*(1+rng.uniform(-.02,.02)); hm+=np.sin(2*np.pi*f*t+rng.uniform(0,6))*(1+.1*np.sin(2*np.pi*rng.uniform(.3,.9)*t))
hm=lp(hm,400); hm/=np.abs(hm).max()
lvl_=np.interp(t,[0,SS('sleepwalk')-1,SS('sleepwalk'),EE('stare_b'),EE('door_break'),SS('vote'),SS('vote')+1],[.02,.04,.12,.18,.2,.06,.0])
amb+=hm*lvl_*.5
bedmix=(amb+drone)*duck
gate=np.ones(N)
for a,b in C['drops']: gate[int(a*SR):int(b*SR)]=0
gate=sm(gate,0.012)
duckS=1-(1-10**(-5/20))*np.clip(sm(act,0.06),0,1)
mix=(voice+sfx*duckS+bedmix)*gate
sf.write('e2/mix_raw.wav',mix.astype(np.float32),SR)
subprocess.run(['ffmpeg','-y','-loglevel','error','-i','e2/mix_raw.wav','-af','loudnorm=I=-14:TP=-1:LRA=9','-ar','48000','e2/mix_final.wav'],check=True)
print('audio ok',D)
