import json,numpy as np,soundfile as sf,subprocess,os
from scipy import signal
os.chdir(os.path.dirname(os.path.abspath(__file__))+'/..')
SR=48000
T=json.load(open('e3/timeline.json')); C=json.load(open('e3/cues.json'))
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
vv,vsr=sf.read('e3/voice48.wav'); vv=vv if vv.ndim==1 else vv[:,0]
voice=np.zeros(N); voice[:min(N,len(vv))]=vv[:N]
_l=pln.Meter(SR).integrated_loudness(voice); voice=voice*10**((-13.0-_l)/20); voice=np.tanh(voice/.95)*.93
tb=t_(int(.3*SR)); br=bp(rng.standard_normal(len(tb)),600,4200)*np.sin(np.pi*np.clip(tb/.3,0,1))**2
breath=br/np.abs(br).max()*10**(-22/20)*0.89
sfx=np.zeros(N); bed=np.zeros(N)
LL=json.load(open('e3/lines.json')); firsts=[l[0] for l in LL][1:]
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
SS=lambda n:S0[n][0]['s']; EE=lambda n:S0[n][0]['e']; LN=C['lines']
t=t_(N); amb=np.zeros(N)
def tap_echo(sig,delays=(.2,.4,.62),gains=(.5,.3,.16)):
    out=np.zeros(int((len(sig)/SR+max(delays)+.2)*SR)); out[:len(sig)]+=sig
    for d_,g_ in zip(delays,gains): 
        s2=lp(sig,3000-1500*d_*3)*g_; i=int(d_*SR); out[i:i+len(s2)]+=s2
    return out
for c in T['chunks']: add(sfx,pop(),c['s'],10**(-24/20)*.9)
for s in shots: add(sfx,whoosh(.4,1,False),s['s']-.35,.04); add(sfx,boom(1,.6),s['s'],.09)
for name,a,b in C['pills']: add(sfx,thud(1),a,.34); add(sfx,pop(),a,.1)
# footsteps on stairs (stair_run, stair_echo, stair_run2): strikes where sin(13t+k) crosses zero
def strikes(a,b,k,off=0.0):
    out=[];n=int(np.ceil((a*13+k+off*13)/np.pi))
    while True:
        ts=(n*np.pi-k)/13-off
        if ts>=b: break
        if ts>=a: out.append(ts)
        n+=1
    return out
for tt in strikes(SS('stair_run'),EE('stair_run'),4.7): add(sfx,thud(1),tt,.18)
for tt in strikes(SS('stair_echo'),EE('stair_echo'),4.7): add(sfx,tap_echo(thud(1)),tt,.3)
for tt in strikes(SS('stair_run2'),EE('stair_run2'),4.7,2.3): add(sfx,thud(1),tt,.22)
# rule 2: dead silence-ish: single fading echo tail
add(sfx,lp(rng.standard_normal(int(1.4*SR)),900)*np.exp(-t_(int(1.4*SR))/.5)*.05,SS('landing_hush'),1)
# glass: crack tick, shatter burst + tinkle
g0=C['glassT']
add(sfx,click(1)*3,g0-.22,.12)
n=int(1.6*SR);tt=t_(n);sh=hp(rng.standard_normal(n),2500)*np.exp(-tt/.25)*.9+hp(rng.standard_normal(n),5000)*np.exp(-tt/.7)*.3
add(sfx,sh,g0,.45); add(sfx,boom(1,.5),g0,.12)
for k in range(14): add(sfx,ping(rng.uniform(2400,4800),1)*.4,g0+.15+rng.uniform(0,1.0),.05)
# hum swell on landing_hum, stairwell hum loud
def humsig(dur,f=73.42):
    n=int(dur*SR);tt=t_(n);x=sum(np.sin(2*np.pi*f*(1+rng.uniform(-.01,.01))*tt*h+rng.uniform(0,6))/h for h in (1,2,3) for _ in range(3))
    return lp(x,500)/9
a,b=SS('landing_hum'),EE('stair_hum'); h_=humsig(b-a); env=np.interp(t_(len(h_)),[0,(b-a)*.35,(b-a)],[0,.5,1]); add(bed,h_*env*.22,a,1)
# door slam
sl=C['slamT']; add(sfx,boom(1,1.4),sl,.5); add(sfx,thud(1),sl,.45); add(sfx,hp(rng.standard_normal(int(.3*SR)),1200)*np.exp(-t_(int(.3*SR))/.06),sl,.18)
# banging on the door (metal hits) then it stops
def hit(g=1):
    n=int(.5*SR);tt=t_(n);return (np.sin(2*np.pi*95*tt)*np.exp(-tt/.12)+bp(rng.standard_normal(n),300,1800)*np.exp(-tt/.05)*.7)*g
for tt in C['bangs']: add(sfx,hit(1),tt,.32)
for tt in C['bangs2']: add(sfx,hit(1),tt,.42); add(sfx,boom(1,.5),tt,.08)
# items + jamming
f1=LN['f1']['s']; add(sfx,thud(1),f1+1.25,.3); add(sfx,thud(1),f1+1.38,.2); add(sfx,thud(1),f1+2.2,.24)
f2=LN['f2']['s']
for dt in (.5,.8,1.05): add(sfx,thud(1),f2+dt,.34); add(sfx,hit(1),f2+dt,.12)
add(sfx,hit(1),f2+1.2,.3)
n=int(.5*SR); add(sfx,bp(rng.standard_normal(n),200,1200)*np.sin(np.pi*t_(n)/.5)*.1,f2+.95,1)
# the door hum afterwards (carrying through the day)
a,b=SS('door_hum'),EE('beanie_fire'); h2=humsig(b-a,73.42); add(bed,h2*np.interp(t_(len(h2)),[0,1,b-a],[.2,.14,.1])*.2,a,1)
# time-lapse: rising sweep, tape-ish ticks, then birdless wind
tl0,tl1=SS('timelapse'),EE('timelapse'); n=int((tl1-tl0)*SR); sw=bp(rng.standard_normal(n),200,5000)*np.linspace(.05,1,n)**2; add(sfx,sw,tl0,.12)
for tt in np.arange(tl0,tl1,.09): add(sfx,click(1),tt,.1)
add(sfx,boom(1,1.2),tl1,.2)
# POV: slow heartbeat, EEG, brain beep, ring
for tt in np.arange(SS('pov_heavy'),SS('micro_a'),.78): add(sfx,thump(55),tt,.45); add(sfx,thump(48),tt+.2,.3)
for tt in np.arange(SS('micro_a'),EE('micro_b'),.5): add(sfx,click(1),tt,.12)
add(sfx,boom(1,1.6),SS('pov_close')+1.0,.2)
n=int(2*SR); tt=t_(n); add(sfx,np.sin(2*np.pi*3000*tt)*np.exp(-tt/.8),SS('pov_empty'),.02)
add(sfx,thud(1),SS('pov_empty'),.3)
# wind (day & night), fire-escape creak
wind=lp(rng.standard_normal(N),260)*(0.5+0.5*np.sin(2*np.pi*.11*t+1)); wind=lp(wind,180); wind*=.03/np.abs(wind).max()
wmask=np.interp(t,[0,SS('stair_run'),SS('stair_run')+.1,SS('roof_door')-.2,SS('roof_door'),SS('door_brace')-.1,SS('door_brace'),SS('door_still')+1.0,SS('beanie_fire'),EE('beanie_fire'),SS('sleepwalk'),SS('plank_bridge')-.1,SS('plank_bridge'),N/SR],[.5,.5,0,0,1,1,.3,.3,1,1,.2,.2,1,1])
amb+=wind*wmask*1.3
for tt in (SS('beanie_fire')+.5,SS('beanie_fire')+1.4,SS('beanie_fire')+2.1):
    n=int(.45*SR); add(sfx,bp(rng.standard_normal(n),400,1200)*np.sin(np.pi*t_(n)/.45)**2*.06,tt,1)
# tablet
for tt in np.arange(SS('tablet_dots')+.2,EE('tablet_dots'),.4): add(sfx,ping(),tt,.07)
for tt in np.arange(SS('tablet_down'),EE('tablet_down'),.34): add(sfx,ping(1320),tt,.035)
add(sfx,ping(880),SS('tablet_ollie')+.2,.12)
# kneel thuds
for tt in C['kneel_times']: add(sfx,thud(1),tt,.28); add(sfx,boom(1,.7),tt,.07)
# stare: swell + swap boom
add(sfx,whoosh(1.8,1,True),SS('stare_a'),.09); add(sfx,boom(1,1.4),C['stare_swap'],.26)
# plank rip + bridge
r0=LN['o2']['s']
n=int(.7*SR); add(sfx,bp(rng.standard_normal(n),250,2500)*np.sin(np.pi*t_(n)/.7)*.3,r0+.15,1); add(sfx,thud(1),r0+.9,.3); add(sfx,hit(1),r0+.9,.2)
n=int(1.0*SR); add(sfx,bp(rng.standard_normal(n),300,1500)*np.sin(np.pi*t_(n)/1.0)**.7*.12,r0+1.9,1)
add(sfx,boom(1,1.2),C['landT'],.35); add(sfx,thud(1),C['landT'],.4)
# vote
vt=C['vote_t']
for tt in vt[1:3]: add(sfx,whoosh(.35,1,True),tt-.2,.08); add(sfx,thud(1),tt,.25)
add(sfx,thud(1),C['cta_t'],.3)
# drone, warm swell under the final line, hum mass at stare
f1_=36.7*(1+0.003*np.sin(2*np.pi*.07*t)); drone=np.sin(2*np.pi*np.cumsum(f1_)/SR)+.6*np.sin(2*np.pi*np.cumsum(55*(1+.004*np.sin(2*np.pi*.13*t)))/SR)+.35*np.sin(2*np.pi*38.5*t)
drone=drone*(0.7+0.3*np.sin(2*np.pi*t/9)); drone=lp(drone,150)*0.11/np.abs(drone).max(); drone*=np.clip((t-.2)/2,0,1)
hm=np.zeros(N)
for k in range(30):
    f=73.42*(1+rng.uniform(-.02,.02)); hm+=np.sin(2*np.pi*f*t+rng.uniform(0,6))*(1+.1*np.sin(2*np.pi*rng.uniform(.3,.9)*t))
hm=lp(hm,400); hm/=np.abs(hm).max()
lv=np.interp(t,[0,SS('sleepwalk')-1,SS('sleepwalk'),EE('stare_b'),SS('vote')-.2,SS('vote'),SS('cta')],[.02,.04,.14,.2,.2,.04,0])
amb+=hm*lv*.5
bedmix=(amb+drone+bed)*duck
gate=np.ones(N)
for a,b in C['drops']: gate[int(a*SR):int(b*SR)]=0
gate=sm(gate,0.012)
duckS=1-(1-10**(-5/20))*np.clip(sm(act,0.06),0,1)
mix=(voice+sfx*duckS+bedmix)*gate
sf.write('e3/mix_raw.wav',mix.astype(np.float32),SR)
subprocess.run(['ffmpeg','-y','-loglevel','error','-i','e3/mix_raw.wav','-af','loudnorm=I=-14:TP=-1:LRA=9','-ar','48000','e3/mix_final.wav'],check=True)
print('audio ok',D)
