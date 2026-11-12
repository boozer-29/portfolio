import json,numpy as np,soundfile as sf,subprocess,os
from scipy import signal
os.chdir(os.path.dirname(os.path.abspath(__file__))+'/..')
SR=48000
T=json.load(open('e5/timeline.json')); C=json.load(open('e5/cues.json'))
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
vv,vsr=sf.read('e5/voice48.wav'); vv=vv if vv.ndim==1 else vv[:,0]
voice=np.zeros(N); voice[:min(N,len(vv))]=vv[:N]
_l=pln.Meter(SR).integrated_loudness(voice); voice=voice*10**((-13.0-_l)/20); voice=np.tanh(voice/.95)*.93
tb=t_(int(.3*SR)); br=bp(rng.standard_normal(len(tb)),600,4200)*np.sin(np.pi*np.clip(tb/.3,0,1))**2
breath=br/np.abs(br).max()*10**(-22/20)*0.89
sfx=np.zeros(N); bed=np.zeros(N)
LL=json.load(open('e5/lines.json')); firsts=[l[0] for l in LL][1:]
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
NEWPLACE={'roof_stamp','ladder_down','ladder_up','ollie_memory','eyes_close','let_pass','down1','b1_plate','open_eyes','stood_up','in_arms','vote'}
for s in shots:
    if s['n'] in NEWPLACE: add(sfx,whoosh(.35,1,False),s['s']-.3,.02); add(sfx,boom(1,.5),s['s'],.04)
for name,a,b in C['pills']: add(sfx,thud(1),a-.06,.16); add(sfx,pop(),a-.06,.06)
# red-eyelid sections: heartbeat, muffled
def hb(a,b,bpm=64,g=.42):
    tt=a
    while tt<b: add(sfx,thump(55),tt,g); add(sfx,thump(48),tt+.22,g*.7); tt+=60/bpm
hb(.5,SS('roof_stamp')-.1,62,.3); hb(SS('rule1_red'),SS('let_pass'),66,.24); hb(SS('b1_plate'),SS('open_eyes'),72,.2)
for tt in np.arange(.6,SS('roof_stamp'),2.6): add(sfx,breath(1.1),tt,.05)
for tt in (SS('breath_neck')+.15,SS('breath_neck')+1.0): add(sfx,lp(breath(.8),900),tt,.07)
add(bed,humsig(SS('roof_stamp'))*.06,0,1)
# roof: wind, stamps, walkie
wind=lp(rng.standard_normal(N),260)*(0.5+0.5*np.sin(2*np.pi*.11*t+1)); wind=lp(wind,180); wind*=.03/np.abs(wind).max()
amb+=wind*np.interp(t,[0,SS('roof_stamp')-.05,SS('roof_stamp'),SS('ollie_memory'),SS('ollie_memory')+.3,N/SR],[0,0,1,1,0,0])
for tt in C['stampT']: add(sfx,thud(1),tt,.3); add(sfx,boom(1,.7),tt,.12)
def btn():
    n=int(.05*SR);tt=t_(n);return lp(bp(rng.standard_normal(n),900,3500)*np.exp(-tt/.008),4000)*1.2+np.sin(2*np.pi*180*tt)*np.exp(-tt/.02)*.5
for tt in C['tapsYou']: add(sfx,btn(),tt,.22); add(sfx,stat(.12),tt+.03,.05)
for tt in C['tapsBack']: add(sfx,stat(.08),tt,.14); add(sfx,ping(2100,1)*.5,tt,.06)
add(sfx,stat(1.3,.6),C['tapsBack'][0],.05)
lt=LN['c1']['s']; add(sfx,whoosh(.4,1,True),lt-.1,.14); add(sfx,thud(1),lt+.35,.22)
add(sfx,thud(1),LN['c2']['s']+.05,.3); add(sfx,lp(rng.standard_normal(int(.25*SR)),1500)*np.exp(-t_(int(.25*SR))/.08),LN['c2']['s']+.05,.15)
add(sfx,lp(rng.standard_normal(int(.6*SR)),5000)*np.sin(np.linspace(0,np.pi,int(.6*SR)))*.5,SS('maya_note')+.1,.06)
add(sfx,lp(rng.standard_normal(int(.5*SR)),2500)*np.sin(np.linspace(0,np.pi,int(.5*SR)))*.5,SS('dj_phones')+.2,.05)
# ladder: rung clanks going down, the crowd's hum below; the ladder scrapes up out of reach
for tt in C['ladderGrabs']: add(sfx,clank(1,380+rng.uniform(-30,30)),tt,.06); add(sfx,thud(1),tt,.08)
n=int(1.2*SR); add(sfx,bp(rng.standard_normal(n),600,3000)*np.sin(np.linspace(0,np.pi,n))*.5,WD['d2'][5][1]-.2,.08); add(sfx,clank(1,300),WD['d2'][6][1]+.35,.08)
hh=humsig(EE('ladder_up')-SS('ladder_down')); add(bed,hh*.1,SS('ladder_down'),1)
# eyes close: inhale then the world goes muffled; jolt awake after the sag
add(sfx,breath(1.0),SS('eyes_close')+.2,.1)
e4=LN['e4']['s']; add(sfx,breath(.5),e4+1.0,.22); add(sfx,hit(1),e4+1.02,.18)
add(sfx,lp(rng.standard_normal(int(.4*SR)),1800)*np.sin(np.linspace(0,np.pi,int(.4*SR))),WD['f1'][1][1],.08)
# your breathing rises on the NOISE meter, then stops
for i,tt in enumerate(np.arange(LN['f3']['s']+.6,LN['f4']['s']+.3,.75)): add(sfx,breath(.6),tt,.05+.03*i)
for tt in np.arange(SS('let_pass'),EE('down2'),.42): add(sfx,thud(1),tt,.08)
add(sfx,boom(1,.6),SS('down1'),.1); add(sfx,boom(1,.6),SS('down2'),.12)
n=int(1.6*SR); add(sfx,bp(rng.standard_normal(n),2500,7000)*np.sin(np.linspace(0,np.pi,n))**.5*.4,LN['g4']['s']+.3,.04)
# warmth: his hand, three taps
add(bed,pad(EE('taps_red')-SS('small_hand')+.4)*.13,SS('small_hand'),1)
for tt in C['tapsOllie']: add(sfx,ov(thump(120)*2,ping(1500,1)*.25),tt,.16)
# the clinic: eyes open, EEG beeps, crayon, hum of the ring
add(sfx,whoosh(.6,1,True),SS('open_eyes'),.08)
for tt in np.arange(SS('open_eyes')+.4,SS('until_answer'),1.4): add(sfx,lp(ping(740,1),2000)*.4,tt,.012)
for k in range(5): add(sfx,hp(bp(rng.standard_normal(int(.3*SR)),1500,6000),1200)*np.sin(np.linspace(0,np.pi,int(.3*SR)))*.5,SS('note_came')+.3+k*.35,.04)
hr=humsig(EE('until_answer')-SS('stood_up')+.5); add(bed,hr*np.linspace(.3,1,len(hr))*.2,SS('stood_up'),1)
ua=LN['i5']['s']; add(sfx,stat(.3,1),ua-.08,.12); add(sfx,hit(1),ua-.04,.16); add(sfx,boom(1,1.0),ua-.04,.09)
# fifty-four hours: warm pad, a slow heartbeat; two taps, then nothing
add(bed,pad(EE('eyes_closing')-SS('in_arms')+.3,fs=(98,147,196,247))*.15,SS('in_arms'),1)
hb(SS('in_arms'),EE('eyes_closing'),58,.2)
for tt in C['lastTaps']: add(sfx,ov(thump(120)*2,ping(1500,1)*.25),tt,.22)
# they kneel: one huge soft thud, then the whole building
kt=C['kneelT']; add(sfx,boom(1,2.2),kt,.22); add(sfx,thud(1),kt,.2)
for k in range(8): add(sfx,thud(1),kt+.15+k*.1,.05*(1-k/8))
add(bed,humsig(EE('kneel_all')-kt)*.16,kt,1)
vt=C['vote_t']
for tt in vt[1:3]: add(sfx,whoosh(.35,1,True),tt-.2,.08); add(sfx,thud(1),tt,.22)
for k in (.7,1.0,1.3): add(sfx,ov(thump(120)*2,ping(1500,1)*.25),C['cta_t']+k,.1)
f1_=36.7*(1+0.003*np.sin(2*np.pi*.07*t)); drone=np.sin(2*np.pi*np.cumsum(f1_)/SR)+.6*np.sin(2*np.pi*np.cumsum(55*(1+.004*np.sin(2*np.pi*.13*t)))/SR)
drone=lp(drone*(0.7+0.3*np.sin(2*np.pi*t/9)),150)*.09/np.abs(drone).max()
drone*=np.interp(t,[0,SS('small_hand'),SS('small_hand')+.5,EE('taps_red'),SS('open_eyes'),SS('in_arms'),SS('in_arms')+.4,EE('eyes_closing'),EE('eyes_closing')+.3,N/SR],[1,1,.3,.3,1,1,.2,.2,1,1])
bedmix=hp(amb+drone*.7+bed,45)*duck
gate=np.ones(N)
for a,b in C['drops']: gate[int(a*SR):int(b*SR)]=0
gate=sm(gate,0.012)
duckS=1-(1-10**(-5/20))*np.clip(sm(act,0.06),0,1)
mix=(voice+sfx*duckS+bedmix)*gate
sf.write('e5/mix_raw.wav',mix.astype(np.float32),SR)
sf.write('e5/aud/st_voice.wav',(voice*gate).astype(np.float32),SR);sf.write('e5/aud/st_sfx.wav',(sfx*duckS*gate).astype(np.float32),SR);sf.write('e5/aud/st_bed.wav',(bedmix*gate).astype(np.float32),SR)
subprocess.run(['ffmpeg','-y','-loglevel','error','-i','e5/mix_raw.wav','-af','loudnorm=I=-14:TP=-1:LRA=9','-ar','48000','e5/mix_final.wav'],check=True)
print('audio ok',D)
