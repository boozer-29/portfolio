import json,re,subprocess,numpy as np,sys,os
os.chdir(os.path.dirname(os.path.abspath(__file__))+'/..')
AUD=json.load(open('e2/aud.json')); LINES=json.load(open('e2/lines.json'))
S=[{'id':l[0],'text':l[1]} for l in LINES]; LN={x['id']:x for x in S}
AUDIO_LEN=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0','e2/voice48.wav']))
lines={k:v['s'] for k,v in AUD.items()}; dur={k:v['e']-v['s'] for k,v in AUD.items()}
MERGE={}
def rel_words(i):
    out=[]
    for w in AUD[i]['words']:
        out.append({'t':re.sub(r"[.,!?]","",w['t']).upper(),'s':w['s']-AUD[i]['s'],'e':w['e']-AUD[i]['s'],'brk':bool(re.search(r"[.,!?]$",w['t']))})
    return out
def ST(l): return lines[l]
def E(l): return lines[l]+dur[l]
def WS(l,word,nth=0): return lines[l]+[w for w in rel_words(l) if w['t']==word][nth]['s']
def wt(l,word,nth=0): return WS(l,word,nth)
shots=[]; BS={}
def SHOT(n,a,b,**k):
    assert b>a+1e-6,(n,a,b); d={'n':n,'s':round(a,4),'e':round(b,4)};d.update(k);shots.append(d);return b
# ---------------- schedule anchored to the recording
T=[0.0]
def seq(name,end,**k): a=T[0]; SHOT(name,a,end,**k); T[0]=end; return a
seq('roof_edge',ST('b1')-.3)
seq('vote_result',ST('b2')-.05)
seq('stair_run',ST('c1')-.12)
seq('street_empty',ST('c2')-.2)
seq('building_full',ST('d1')-.12)
seq('rule1',ST('d2')-.1)
seq('rule2',ST('d3')-.1)
seq('rule3',ST('d3c')-.1)
seq('run_beat',ST('e1')-.3)
seq('nowhere',ST('e2')-.05)
seq('timelapse',ST('f1')-.1)
seq('door_hum',ST('f2'))
seq('ollie_arms',ST('f3')-.1)
seq('pov_heavy',ST('g1')-.1)
seq('pov_close',ST('g2')-.1)
seq('micro_a',ST('g3')-.1)
seq('micro_b',ST('g4')-.1,freeze=.4)
seq('pov_empty',ST('h1')-.12)
seq('tablet_dots',ST('h3')-.1)
seq('tablet_down',ST('h5')-.1,freeze=.38)
seq('tablet_ollie',ST('i1')-.1)
seq('sleepwalk',ST('j1')-.2,freeze=.4)
seq('stare_a',ST('j2')-.1)
seq('stare_b',ST('k1')-.1)
seq('door_break',ST('k3')-.2)
seq('plank',ST('l1')-.1)
seq('stair_down',ST('l3')-.05)
seq('stair_down2',ST('m1')-.1,freeze=.44)
seq('vote',ST('z1')-.3)
seq('cta',AUDIO_LEN)
D=AUDIO_LEN
print('TOTAL',round(D,2))

# ---- captions
RED={'SLEEP','SOUND','HUM','RUN','MICROSLEEP','KNEELS','EMPTY','BREAK','INSIDE','RULE','ASLEEP'};LIME={'EYES','ROOF','OLLIE','HIM','YOU','PLANK','DOWN','A'};AMB={'TEN','HOURS','THIRTY','SECONDS','THOUSANDS'}
allw=[]
for x in S:
    i=x['id']
    for j,w in enumerate(rel_words(i)):
        col=None;T=w['t']
        if i=='l1' and T=='B': col='red'
        elif i=='k2' and T=='A': col='lime'
        elif i in('d1','d2','d3'): col='red'
        elif T in RED: col='red'
        elif T in AMB: col='amber'
        elif T in LIME and not(i in('f2','j1','a1') and T=='YOU'): col='lime'
        allw.append({'t':T,'s':round(lines[i]+w['s'],3),'e':round(lines[i]+w['e'],3),'brk':w['brk'],'col':col,'line':i,'ell':False})
KW={'SLEEP','SOUND','HUM','RUN','OLLIE','MICROSLEEP','KNEELS'}
def kw(w): return w['col'] is not None and w['t'] in KW
chunks=[];cur_=[]
def flush():
    global cur_
    if cur_: chunks.append(cur_); cur_=[]
for w in allw:
    if cur_ and (len(cur_)>=3 or cur_[-1]['brk'] or cur_[-1]['line']!=w['line'] or kw(w) or kw(cur_[-1])): flush()
    cur_.append(w)
flush()
TL={'chunks':[]}
for i,c in enumerate(chunks): TL['chunks'].append({'s':c[0]['s'],'line':c[0]['line'],'words':[{k:w[k] for k in ('t','s','e','col','ell')} for w in c]})
for i,c in enumerate(TL['chunks']):
    nxt=TL['chunks'][i+1]['s'] if i+1<len(TL['chunks']) else c['words'][-1]['e']+.5
    c['e']=min(nxt,c['words'][-1]['e']+.6)
# ---- cues
sh=lambda n:[s for s in shots if s['n']==n][0]
CU={'duration':round(D,3),'shots':shots,'ep':2,'fb':[-1,-1],'rewind':[-1,-1]}
roll0=ST('e2')+.05; roll1=roll0+1.0
CU['roll']=[roll0,roll1,42*60,52*60]
CU['clock']=[[0,'42:00',None],[roll1,'52:00','+10 HRS']]
CU['awake']=[[0,5,.25]]; CU['survivors_t']=0
CU['noise']=[[0,18],[ST('d3b')-.05,72],[ST('d3c')+.3,30],[ST('e1'),16],[ST('f1'),66],[ST('g1')-.05,14],[ST('h1'),20],[ST('i1')+.1,0],[ST('j1')-.05,22],[ST('k1')+.2,108],[ST('m1'),24]]
CU['nearby']={'t':9999,'from':3412,'to':3412,'dur':1}
CU['rescue']=0; CU['rescue6']=roll1
CU['votetag']=[0,3.2,'YOU CHOSE: ROOF']
CU['pills']=[['RULE #1',ST('d1')-.04,E('d1b')+.25],['RULE #2',ST('d2')-.04,E('d2b')+.25],['RULE #3',ST('d3')-.04,E('d3c')+.2]]
kt=[ST('i1')+.35+k*(2.0/8) for k in range(9)]
CU['kneel_times']=kt
CU['shake']=[ST('d3b')+.05,ST('d3c')+.02,ST('f1')+.4,ST('f1')+1.2]+[wt('k1','DOOR'),wt('k1','BREAK'),ST('k1')+1.6,ST('k1')+2.0]+[k for k in kt[::2]]
CU['dark']=[]
CU['dip']=[ST('b2')-.05,ST('c1')-.12,ST('d1')-.12,ST('f3')-.1,ST('g4')-.1,ST('h1')-.12,ST('j1')-.2,ST('l1')-.1,ST('vote') if False else sh('vote')['s']]
CU['flash']=[ST('c2')+.02,ST('d3b')+.02,ST('j2')+.02,ST('k1')+.02,ST('d3c')+.0]
CU['whiteflash']=[]
CU['cap_y']={'ollie_arms':700,'pov_empty':700}
CU['nocap']=['cta','micro_a','micro_b','pov_close']
CU['drops']=[[ST('g4')-.5,ST('g4')-.12],[E('h4')+.04,ST('h5')-.04],[E('i1')+.05,ST('j1')-.05],[E('l3')+.04,ST('m1')-.04]]
CU['cta_t']=ST('z1'); CU['vote_t']=[sh('vote')['s']+.05,sh('vote')['s']+.5,sh('vote')['s']+1.0,ST('m2')-.1,ST('m3')]
CU['T']={'roll':[roll0,roll1],'kneel_times':kt,'lines':{k:[round(v,3),round(v+dur[k],3)] for k,v in lines.items()}}
CU['lines']={i:{'s':round(lines[i],3),'d':dur[i]} for i in lines}
CU['stare_swap']=ST('j2')
CU['micro']=[ST('g2'),E('g3')]
CU['door_break_t']=wt('k1','BREAK')
json.dump(CU,open('e2/cues.json','w'),indent=1); json.dump(TL,open('e2/timeline.json','w'),indent=1)
open('e2/site/data.js','w').write('window.TL='+json.dumps(TL)+';window.CUES='+json.dumps(CU)+';')
print('shots',len(shots)); 
for s in shots: print(f"{s['n']:14s} {s['s']:6.2f} {s['e']:6.2f} {s['e']-s['s']:4.2f}")
