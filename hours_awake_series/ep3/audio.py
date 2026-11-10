import json,numpy as np,soundfile as sf,subprocess,os
from scipy import signal
os.chdir(os.path.dirname(os.path.abspath(__file__))+'/..')
SR=48000
T=json.load(open('e4/timeline.json')); C=json.load(open('e4/cues.json'))
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
vv,vsr=sf.read('e4/voice48.wav'); vv=vv if vv.ndim==1 else vv[:,0]
voice=np.zeros(N); voice[:min(N,len(vv))]=vv[:N]
_l=pln.Meter(SR).integrated_loudness(voice); voice=voice*10**((-13.0-_l)/20); voice=np.tanh(voice/.95)*.93
tb=t_(int(.3*SR)); br=bp(rng.standard_normal(len(tb)),600,4200)*np.sin(np.pi*np.clip(tb/.3,0,1))**2
breath=br/np.abs(br).max()*10**(-22/20)*0.89
sfx=np.zeros(N); bed=np.zeros(N)
LL=json.load(open('e4/lines.json')); firsts=[l[0] for l in LL][1:]
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
SS=lambda n:S0[n]['s']; EE=lambda n:S0[n]['e']; LN=C['lines']; t=t_(N); amb=np.zeros(N)
for c in T['chunks']: add(sfx,pop(),c['s'],10**(-26/20)*.8)
warmA,warmB=SS('fb_shh'),SS('pocket')
for s in shots:
    if warmA<=s['s']<warmB: continue
    add(sfx,whoosh(.4,1,False),s['s']-.35,.035); add(sfx,boom(1,.6),s['s'],.07)
for name,a,b in C['pills']: add(sfx,thud(1),a,.3); add(sfx,pop(),a,.1)
def humsig(dur,f=73.42):
    n=int(dur*SR);tt=t_(n);x=sum(np.sin(2*np.pi*f*(1+rng.uniform(-.01,.01))*tt*h+rng.uniform(0,6))/h for h in (1,2,3) for _ in range(3));return lp(x,500)/9
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
# wind: whole cold section, off during the warm flashback
wind=lp(rng.standard_normal(N),260)*(0.5+0.5*np.sin(2*np.pi*.11*t+1)); wind=lp(wind,180); wind*=.03/np.abs(wind).max()
wm=np.interp(t,[0,EE('door_burst'),EE('door_burst')+.5,SS('side_elev')+1.5,SS('kick')+1.2,SS('line_front'),SS('fb_shh')-.2,SS('fb_shh'),SS('pocket'),SS('pocket')+.5,SS('ollie_awake'),SS('street_fills')],[1.2,1.2,.6,1.0,.8,.5,.4,0,0,.6,.3,.9])
amb+=wind*wm
# plank flex creaks while you crawl
for tt in np.arange(1.0,SS('creak'),1.7): add(sfx,creak(.9,.07,200,300),tt,1)
for tt in (SS('hand_close')+.8,SS('hand_close')+1.6): add(sfx,creak(.6,.05,220,260),tt,1)
# the long creak + crack + splinters
c0=C['crackT']-.1; add(sfx,creak(1.6,.5,180,520),c0,1); add(sfx,click(1)*4,c0+.5,.3); add(sfx,hit(1) if False else thud(1),c0+.55,.25)
for k in range(12): add(sfx,hp(rng.standard_normal(int(.05*SR)),2500)*np.exp(-t_(int(.05*SR))/.012),c0+.6+k*.08,.08)
# rule 3: hum builds, door blasts open on RUN
h_=humsig(C['burstT']-LN['c3']['s']+.5); add(bed,h_*np.linspace(.1,1,len(h_))**2*.28,LN['c3']['s']-.1,1)
bt=C['burstT']; add(sfx,boom(1,2.0),bt,.6); add(sfx,thud(1),bt,.5); add(sfx,hp(rng.standard_normal(int(.5*SR)),800)*np.exp(-t_(int(.5*SR))/.15),bt,.25)
for k in range(5): add(sfx,thud(1),bt+.1+k*.11,.14)
# heartbeat during the crossing
def hb(a,b,g=.4):
    for tt in np.arange(a,b,.62): add(sfx,thump(55),tt,g); add(sfx,thump(48),tt+.2,g*.7)
hb(SS('side_elev'),SS('kick'))
# drag, kick, the long fall
for k in (0,.45,.9): add(sfx,thud(1),LN['d1']['s']+1.0+k,.3); add(sfx,lp(rng.standard_normal(int(.3*SR)),600)*np.exp(-t_(int(.3*SR))/.1),LN['d1']['s']+1.0+k,.1)
kt=C['kickT']; add(sfx,whoosh(.25,1,True),kt-.05,.25); add(sfx,thud(1),kt,.5); add(sfx,hit(1) if False else boom(1,.5),kt,.12)
n=int(1.8*SR);tt=t_(n);fall=np.sin(2*np.pi*np.cumsum(np.linspace(900,120,n))/SR)*np.linspace(.8,0,n)**1.5; add(sfx,fall,kt+.2,.05)
add(sfx,hp(rng.standard_normal(int(.9*SR)),1200)*np.exp(-t_(int(.9*SR))/.2)*np.sin(np.linspace(0,np.pi,int(.9*SR)))**.3,kt+1.75,.05)
add(sfx,boom(1,1.4),kt+1.75,.1)
# they don't come for you: one pure hum into the true silence
n=int(1.4*SR);tt=t_(n);add(sfx,np.sin(2*np.pi*146.8*tt)*np.sin(np.pi*tt/1.4)**2,LN['e1']['s']+.1,.06)
add(bed,lp(humsig(EE('line_back')-SS('line_back')),400)*.14,SS('line_back'),1)
# ---- the warm flashback: soft pad, crayon, taps, a silent laugh
def pad(dur,fs=(110,164.8,220,277.2),g=1.0):
    n=int(dur*SR);tt=t_(n);x=sum(np.sin(2*np.pi*f*tt+rng.uniform(0,6))*(1+.1*np.sin(2*np.pi*(.3+i*.07)*tt)) for i,f in enumerate(fs));return lp(x,900)*np.sin(np.pi*np.clip(tt/dur,0,1))**.5*g/len(fs)
wa,wb=SS('fb_shh'),EE('fb_taps'); add(bed,pad(wb-wa+.6,g=1.0)*.16,wa-.1,1)
for k in range(4): add(sfx,hp(bp(rng.standard_normal(int(.35*SR)),1500,6000),1200)*np.sin(np.linspace(0,np.pi,int(.35*SR)))*.5,SS('fb_crayon')+.35+k*.22,.06)
for tt in C['fbTaps']: add(sfx,ov(thump(110)*3,click(1)*.5),tt,.22)
# laugh window: the whole bed goes dead
lw0,lw1=SS('fb_laugh')+.3,EE('fb_laugh')-.1
# pocket: paper rustle; note; comfort pad; crumple
add(sfx,lp(rng.standard_normal(int(.7*SR)),5000)*np.sin(np.linspace(0,np.pi,int(.7*SR)))*.5,SS('pocket')+.5,.08)
add(bed,pad(EE('comfort')-SS('comfort')+.5,g=1.0)*.14*np.hstack([np.ones(1)]),SS('comfort'),1) if False else None
cp=pad(EE('comfort')-SS('comfort')+.5); add(bed,cp*.14,SS('comfort'),1)
bt2=LN['h4']['s']; add(sfx,boom(1,1.2),bt2,.4); add(sfx,thud(1),bt2,.3); add(sfx,lp(rng.standard_normal(int(.6*SR)),3500)*np.exp(-t_(int(.6*SR))/.2),bt2+.1,.12)
# reyes: low drone, crayon scratch, stopwatch ticks
add(bed,lp(humsig(EE('reyes_fingers')-SS('reyes_fingers')),300)*.1,SS('reyes_fingers'),1)
for k in range(5): add(sfx,hp(bp(rng.standard_normal(int(.3*SR)),1500,6000),1200)*np.sin(np.linspace(0,np.pi,int(.3*SR)))*.5,SS('wrote_hours')+.1+k*.28,.05)
for tt in np.arange(SS('thirty_a'),EE('thirty_a'),.045): add(sfx,click(1),tt,.1)
for tt in np.arange(SS('lead_ollie'),EE('lead_ollie'),.3): add(sfx,thud(1),tt,.1)
k0=S0['kick_replay']['s']+.35; add(sfx,whoosh(.7,1,False),k0-.1,.1); add(sfx,lp(rng.standard_normal(int(.6*SR)),200)*np.exp(-t_(int(.6*SR))/.25),k0+.2,.4)
add(sfx,boom(1,1.0),SS('sign'),.22)
# the walkie: static, crackle, three taps through static
def stat(dur,g=1): 
    n=int(dur*SR);x=hp(rng.standard_normal(n),600)*(rng.random(n)>.35);return x*np.sin(np.linspace(0,np.pi,n))**.6*g
wk=C['wcrk']; add(sfx,stat(1.4,.5),wk,.12)
for k in range(6): add(sfx,click(1)*3,wk+.1+k*.21,.08)
for tt in C['tapsT']: add(sfx,stat(.35,.8),tt-.03,.14); add(sfx,thump(140)*3,tt,.3); add(sfx,ping(1900,1)*.4,tt,.08)
add(bed,lp(rng.standard_normal(int((EE('taps')-SS('taps'))*SR)),600)*.01,SS('taps'),1)
# ollie awake: near-silent pad; street fills: static bursts + rising mass hum
add(bed,pad(EE('ollie_awake')-SS('ollie_awake'),fs=(98,147,196),g=1.0)*.08,SS('ollie_awake'),1)
for i,tt in enumerate(C['crk']): add(sfx,stat(.5,1),tt,.16); add(sfx,boom(1,.8),tt,.12+.04*i)
hh=humsig(EE('reyes_hand')-SS('street_fills')+.5); add(bed,hh*np.linspace(.1,1,len(hh))*.28,SS('street_fills'),1)
add(sfx,whoosh(1.4,1,True),SS('reyes_hand')-.9,.1); add(sfx,boom(1,1.2),SS('reyes_hand'),.25)
vt=C['vote_t']
for tt in vt[1:3]: add(sfx,whoosh(.35,1,True),tt-.2,.08); add(sfx,thud(1),tt,.25)
for k in (.7,1.0,1.3): add(sfx,ov(thump(140)*3,ping(1900,1)*.3),C['cta_t']+k,.12)
# drone
f1_=36.7*(1+0.003*np.sin(2*np.pi*.07*t)); drone=np.sin(2*np.pi*np.cumsum(f1_)/SR)+.6*np.sin(2*np.pi*np.cumsum(55*(1+.004*np.sin(2*np.pi*.13*t)))/SR)+.35*np.sin(2*np.pi*38.5*t)
drone=drone*(0.7+0.3*np.sin(2*np.pi*t/9)); drone=lp(drone,150)*.1/np.abs(drone).max(); drone*=np.clip((t-.2)/2,0,1)
drone*=np.interp(t,[0,wa-.1,wa+.3,EE('fb_taps'),SS('pocket')+.4,N/SR],[1,1,0,0,1,1])
bedmix=(amb+drone+bed)*duck
gate=np.ones(N)
for a,b in C['drops']: gate[int(a*SR):int(b*SR)]=0
gate[int(lw0*SR):int(lw1*SR)]*=0  # true silence under the laugh (voice has no words here)
gate=sm(gate,0.012)
duckS=1-(1-10**(-5/20))*np.clip(sm(act,0.06),0,1)
mix=(voice+sfx*duckS+bedmix)*gate
sf.write('e4/mix_raw.wav',mix.astype(np.float32),SR)
subprocess.run(['ffmpeg','-y','-loglevel','error','-i','e4/mix_raw.wav','-af','loudnorm=I=-14:TP=-1:LRA=9','-ar','48000','e4/mix_final.wav'],check=True)
print('audio ok',D)
