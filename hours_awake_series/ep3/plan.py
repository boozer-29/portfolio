import json,re,subprocess,numpy as np,sys,os
os.chdir(os.path.dirname(os.path.abspath(__file__))+'/..')
AUD=json.load(open('e4/aud.json')); LINES=json.load(open('e4/lines.json'))
S=[{'id':l[0],'text':l[1]} for l in LINES]; LN={x['id']:x for x in S}
AUDIO_LEN=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0','e4/voice48.wav']))
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
seq('pov_plank',ST('b1')-.25)
seq('look_back',ST('c1')-.1)
seq('hand_close',ST('c2')-.1)
seq('creak',ST('c3')-.1)
seq('door_burst',ST('c4')-.1)
seq('side_elev',ST('d1')-.1)
seq('drag',wt('d1','KICKS')-.2)
seq('kick',ST('e1')-.6)
seq('line_front',ST('e2')-.1)
seq('line_back',ST('f1')-.15)
seq('fb_shh',ST('f2')-.1)
seq('fb_crayon',ST('f3')-.2)
seq('fb_laugh',ST('f4')-.1)
seq('fb_taps',ST('g1')-.2)
seq('pocket',ST('g2')-.1)
seq('note_read',ST('g4')-.25)
seq('comfort',ST('h1')-.25)
seq('see_it',ST('h3')-.15)
seq('split_r',ST('h4')-.1)
seq('fist',ST('i1')-.1)
seq('reyes_fingers',ST('i2')-.1)
seq('wrote_hours',ST('i3')-.1)
seq('thirty_a',ST('i3')+.6)
seq('lead_ollie',wt('i3','ALL')-.05)
seq('kick_replay',E('i3'))
seq('sign',ST('j1')-.1)
seq('walkie',ST('j2')-.1)
seq('taps',ST('j3')-.15)
seq('ollie_awake',ST('k1')-.1)
seq('street_fills',ST('k2')-.1)
seq('reyes_hand',ST('p1')-.25)
seq('vote',ST('z1')-.12)
seq('cta',AUDIO_LEN)
D=AUDIO_LEN
print('TOTAL',round(D,2))

# ---- captions
RED={'SOUND','HUM','RUN','CREAKS','RULE','TWO','THREE','CRACKLES','CRACKLE','SILENCE','RED','DARK'};LIME={'PLANK','A','AWAKE','BRAVE','TAP','COMING','ALIVE','HIM','BACKWARDS'};AMB={'FIVE','FLOORS','THIRTY','SECONDS','HOURS','FIFTY-FOUR'}
allw=[]
for x in S:
    i=x['id']
    for j,w in enumerate(rel_words(i)):
        col=None;T=w['t']
        if T=='B' and i in('p4','p6'): col='red'
        elif T in RED: col='red'
        elif T in AMB: col='amber'
        elif T in LIME: col='lime'
        allw.append({'t':T,'s':round(lines[i]+w['s'],3),'e':round(lines[i]+w['e'],3),'brk':w['brk'],'col':col,'line':i,'ell':False})
KW={'RUN','BRAVE','TAP'}
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
CU={'duration':round(D,3),'shots':shots,'ep':3,'fb':[-1,-1],'rewind':[-1,-1]}
CU['roll']=None
CU['clock']=[[0,'53:00',None]]
CU['awake']=[[0,4,.25]]; CU['survivors_t']=0
burst=wt('c3','RUN')+.02; kick=wt('d1','KICKS')+.12
taps=[wt('j2','TAP',0)+.04,wt('j2','TAP',1)+.04,wt('j2','TAP',2)+.04]
crk=[ST('k1')+.02,ST('k1')+.8,ST('k1')+1.55,ST('k1')+2.2]
CU['noise']=[[0,12],[wt('c2','CREAKS'),58],[E('c2')+.3,20],[ST('c3')+.9,70],[burst,112],[ST('d1'),64],[kick,90],[E('d1')+.3,8],[sh('fb_shh')['s'],0],[sh('pocket')['s'],10],[ST('j1')+.35,48],[taps[0],62],[E('j2')+.2,30],[crk[0],66],[crk[1],74],[crk[2],82],[crk[3],90],[ST('p1'),72]]
CU['nearby']={'t':crk[0],'from':3412,'to':9806,'dur':2.6,'tag':'RISING'}
CU['rescue']=0; CU['rescue6']=0.0001
CU['votetag']=[0,3.4,'YOU CHOSE: PLANK']
CU['pills']=[['RULE #2',ST('c1')-.04,E('c1')+.25],['RULE #3',ST('c3')-.04,burst]]
CU['kneel_times']=[]
CU['shake']=[burst,kick,ST('h4')]+taps
CU['dark']=[]
CU['dip']=[ST('b1')-.25,sh('line_front')['s'],sh('pocket')['s'],sh('reyes_fingers')['s'],sh('walkie')['s'],sh('vote')['s']]
CU['flash']=[ST('h4')-.02,burst]
CU['whiteflash']=[]
CU['cap_y']={}
CU['nocap']=['cta','look_back','thirty_a','sign']
CU['cap_y']['ollie_awake']=540
CU['drops']=[[E('d1')+.35,ST('e1')-.06],[E('g5')+.12,ST('h1')-.05],[E('h1')+.05,ST('h2')-.05],[E('j2')+.06,ST('j3')-.05]]
CU['cta_t']=ST('z1'); CU['vote_t']=[sh('vote')['s']+.02,ST('p1')-.05,ST('p4')-.1,ST('p5'),ST('p6')]
CU['T']={'lines':{k:[round(v,3),round(v+dur[k],3)] for k,v in lines.items()}}
CU['lines']={i:{'s':round(lines[i],3),'d':dur[i]} for i in lines}
CU['burstT']=burst; CU['kickT']=kick; CU['tapsT']=taps; CU['crk']=crk
CU['fbTaps']=[wt('f4','TAPS')+.0,wt('f4','TAPS')+.3,wt('f4','TAPS')+.6]; CU['awakeT']=wt('f4',"I'M")
CU['stampT']=[ST('b1'),wt('b1','YOU',1)]
CU['noteT']=[ST('g2'),ST('g3')]; CU['braveT']=ST('h2'); CU['redT']=wt('i1','RED'); CU['crackT']=wt('c2','CREAKS')
CU['wcrk']=ST('j1')+.35
CU['tod']=[-2,-1]
CU['W']={i:[[w['t'],round(lines[i]+w['s'],3)] for w in rel_words(i)] for i in lines}
json.dump(CU,open('e4/cues.json','w'),indent=1); json.dump(TL,open('e4/timeline.json','w'),indent=1)
open('e4/site/data.js','w').write('window.TL='+json.dumps(TL)+';window.CUES='+json.dumps(CU)+';')
print('shots',len(shots)); 
for s in shots: print(f"{s['n']:14s} {s['s']:6.2f} {s['e']:6.2f} {s['e']-s['s']:4.2f}")
