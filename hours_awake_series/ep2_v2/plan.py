import json,re,subprocess,numpy as np,sys,os
os.chdir(os.path.dirname(os.path.abspath(__file__))+'/..')
AUD=json.load(open('e3/aud.json')); LINES=json.load(open('e3/lines.json'))
S=[{'id':l[0],'text':l[1]} for l in LINES]; LN={x['id']:x for x in S}
AUDIO_LEN=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0','e3/voice48.wav']))
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
seq('roof_edge',ST('b1')-.35)
seq('vote_result',ST('b2')-.05)
seq('stair_run',ST('c1')-.05)
seq('stair_echo',ST('d1')-.12)
seq('landing_hush',ST('d2')-.1)
seq('shaft_glass',ST('d3')-.1)
seq('landing_hum',wt('d3','RUN')-.1)
seq('stair_run2',ST('e1')-.1)
seq('stair_hum',ST('e2')-.1)
seq('roof_door',ST('f1')-.1)
seq('roof_items',ST('f2')-.05)
seq('jam_door',ST('g1')-.05)
seq('door_brace',ST('g2')-.05)
seq('door_hum',ST('h1')-.8)
seq('timelapse',ST('i1')-.08)
seq('rule1',ST('i2')-.1)
seq('ollie_arms',ST('i3')-.1)
seq('pov_heavy',ST('i4')-.1)
seq('pov_close',ST('j1')-.1)
seq('micro_a',ST('j2')-.1)
seq('micro_b',ST('j3')-.1,freeze=.3)
seq('pov_empty',ST('k1')-.12)
seq('door_still',ST('k2')-.1)
seq('beanie_fire',ST('l1')-.1)
seq('tablet_dots',ST('l2')-.1)
seq('tablet_down',ST('l4')-.1)
seq('tablet_ollie',ST('m1')-.1)
seq('sleepwalk',ST('n1')-.1,freeze=.35)
seq('stare_a',wt('n2','WERE')+.05)
seq('stare_b',ST('o1')-.1)
seq('door_rattle',ST('o2')-.1)
seq('plank_rip',wt('o2','AND')-.05)
seq('plank_bridge',ST('p1')-.3)
seq('vote',ST('z1')-.1)
seq('cta',AUDIO_LEN)
D=AUDIO_LEN
print('TOTAL',round(D,2))

# ---- captions
RED={'SLEEP','SOUND','HUM','HUMS','RUN','MICROSLEEP','KNEELS','EMPTY','SHATTERS','BANGING','ASLEEP','ECHO','TWO','THREE','ONE','RULE'};LIME={'EYES','ROOF','OLLIE','HIM','PLANK','DOWN','A','BRAIDED'};AMB={'TEN','HOURS','THIRTY','SECONDS','THOUSANDS','53'}
allw=[]
for x in S:
    i=x['id']
    for j,w in enumerate(rel_words(i)):
        col=None;T=w['t']
        if i=='p4' and T=='B': col='red'
        elif T in RED: col='red'
        elif T in AMB: col='amber'
        elif T in LIME: col='lime'
        allw.append({'t':T,'s':round(lines[i]+w['s'],3),'e':round(lines[i]+w['e'],3),'brk':w['brk'],'col':col,'line':i,'ell':False})
KW={'SLEEP','SOUND','HUM','HUMS','RUN','OLLIE','MICROSLEEP','KNEELS','SHATTERS','ECHO','ASLEEP'}
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
roll0=wt('h1','TEN')-.3; roll1=roll0+1.5
CU['roll']=[roll0,roll1,42*60,52*60]
CU['clock']=[[0,'42:00',None],[roll1,'52:00','+10 HRS']]
CU['awake']=[[0,5,.25]]; CU['survivors_t']=0
CU['noise']=[[0,18],[wt('c1','FOOTSTEPS'),64],[ST('d1')+.1,22],[wt('d2','SHATTERS'),104],[ST('d2')+2.2,40],[wt('d3','RUN'),30],[ST('e1'),84],[ST('e2')+1.7,96],[ST('f1')+.3,58],[ST('g1')+.7,12],[ST('h1'),16],[ST('j1'),14],[ST('j3'),20],[ST('l4'),22],[wt('m1','KNEELS'),0],[ST('o1')+.1,108],[ST('p1'),24]]
CU['nearby']={'t':9999,'from':3412,'to':3412,'dur':1}
CU['rescue']=0; CU['rescue6']=roll1
CU['votetag']=[0,3.2,'YOU CHOSE: ROOF']
CU['pills']=[['RULE #2',ST('d1')-.04,E('d1')+.3],['RULE #3',ST('d3')-.04,E('d3')+.3],['RULE #1',ST('i1')-.04,E('i1')+.3]]
kt=[wt('m1','KNEELS')+k*.15 for k in range(9)]
CU['kneel_times']=kt
CU['bangs']=[ST('e2')+1.95,ST('f1')+.55,ST('f1')+1.12,ST('f1')+1.7,ST('f1')+2.25,ST('f2')+.2,ST('f2')+.7,ST('f2')+1.2,ST('g1')-.05]
CU['bangs2']=[ST('o1')+.18,ST('o1')+.55,ST('o1')+.9,ST('o1')+1.25,ST('o2')-.1,ST('o2')+.3]
CU['shake']=[wt('d2','SHATTERS'),wt('e2','DOOR')+.0]+CU['bangs']+CU['bangs2']+kt[::2]
CU['dark']=[]
CU['dip']=[ST('b2')-.05,ST('c1')-.05,ST('e2')-.1,ST('f1')-.1,ST('i1')-.08,ST('j1')-.1,ST('k1')-.12,ST('l1')-.1,ST('m1')-.1,ST('o2')-.1,sh('vote')['s']]
CU['flash']=[wt('d2','SHATTERS'),wt('e2','DOOR'),ST('n2')+.02]
CU['whiteflash']=[]
CU['cap_y']={'ollie_arms':700,'pov_empty':700,'stair_run':560,'stair_echo':560,'stair_run2':560,'plank_bridge':500}
CU['nocap']=['cta','micro_a','micro_b','pov_close']
CU['drops']=[[E('g2')+.04,ST('h1')-.1],[E('i4')+.04,ST('j1')-.05],[E('n2')+.03,ST('o1')-.05],[E('o2')+.04,ST('p1')-.05]]
CU['cta_t']=ST('z1'); CU['vote_t']=[ST('p1')-.3,ST('p1')-.05,ST('p4')-.15,ST('p6'),ST('p8')]
CU['T']={'roll':[roll0,roll1],'kneel_times':kt,'lines':{k:[round(v,3),round(v+dur[k],3)] for k,v in lines.items()}}
CU['lines']={i:{'s':round(lines[i],3),'d':dur[i]} for i in lines}
CU['stare_swap']=wt('n2','STAFRING') if False else wt('n2','STARING')-.2
CU['micro']=[ST('j1'),E('j2')]
CU['door_break_t']=ST('o1')
CU['tod']=[sh('timelapse')['s'],sh('timelapse')['e']]
CU['slamT']=wt('e2','DOOR')+.02
CU['glassT']=wt('d2','SHATTERS')
CU['landT']=wt('o2','ROOF')

json.dump(CU,open('e3/cues.json','w'),indent=1); json.dump(TL,open('e3/timeline.json','w'),indent=1)
open('e3/site/data.js','w').write('window.TL='+json.dumps(TL)+';window.CUES='+json.dumps(CU)+';')
print('shots',len(shots)); 
for s in shots: print(f"{s['n']:14s} {s['s']:6.2f} {s['e']:6.2f} {s['e']-s['s']:4.2f}")
