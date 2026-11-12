import json,re,subprocess,numpy as np,sys,os
os.chdir(os.path.dirname(os.path.abspath(__file__))+'/..')
AUD=json.load(open('e5/aud.json')); LINES=json.load(open('e5/lines.json'))
S=[{'id':l[0],'text':l[1]} for l in LINES]; LN={x['id']:x for x in S}
AUDIO_LEN=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0','e5/voice48.wav']))
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
seq('blind_open',ST('b1')-.6)
seq('roof_stamp',ST('b2')-.12)
seq('you_tap',ST('b3')-.1)
seq('tap_back',ST('c1')-.12)
seq('reyes_lunge',ST('c2')-.12)
seq('maya_grip',ST('c3')-.1)
seq('maya_note',E('c6')+.05)
seq('dj_phones',ST('d1')+.35)
seq('ladder_down',ST('d2')-.1)
seq('ladder_up',ST('e1')-.1)
seq('ollie_memory',ST('e2')-.1)
seq('eyes_close',ST('e3')-.12)
seq('rule1_red',ST('f1')-.12)
seq('shoulder',ST('f2')-.12)
seq('breath_neck',ST('f3')-.12)
seq('rule2_noise',ST('f4')-.1)
seq('dont_breathe',ST('g1')-.1)
seq('let_pass',ST('g2')-.08)
seq('down1',ST('g3')-.08)
seq('down2',ST('g4')-.12)
seq('b1_plate',ST('h1')-.12)
seq('small_hand',ST('h2')-.12)
seq('taps_red',ST('h5')-.12)
seq('open_eyes',ST('i1')-.1)
seq('note_came',ST('i3')-.1)
seq('note_under',wt('i3','THEY')-.08)
seq('stood_up',ST('i4')-.12)
seq('until_answer',ST('j1')-.12)
seq('in_arms',ST('j3')-.12)
seq('eyes_closing',ST('j4')-.1)
seq('kneel_all',ST('p1')-.12)
seq('vote',ST('z1')-.12)
seq('cta',AUDIO_LEN)
D=AUDIO_LEN
print('TOTAL',round(D,2))

# ---- captions
RED={'SOUND','RULE','ONE','TWO','SLEEP','BREATHE','KNEEL','HUNTS','STOOD','ANSWERED','CLOSED','DON\'T'};LIME={'TAPPED','TAP','BRAVE','BROTHER','CAME','SAFE','A','HIM','AWAKE','YOU','EYES','B1','CHOOSE'};AMB={'FIFTY-FOUR','HOURS','NINETY-ONE','PERCENT','FIFTY-FIVE'}
allw=[]
for x in S:
    i=x['id']
    for j,w in enumerate(rel_words(i)):
        col=None;T=w['t']
        if T=='B' and i in('p4','p7','b1'): col='red'
        elif T in RED: col='red'
        elif T in AMB: col='amber'
        elif T in LIME: col='lime'
        allw.append({'t':T,'s':round(lines[i]+w['s'],3),'e':round(lines[i]+w['e'],3),'brk':w['brk'],'col':col,'line':i,'ell':False})
KW={'TAP','DOWN','B1','KNEEL'}
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
CU={'duration':round(D,3),'shots':shots,'ep':4,'fb':[-1,-1],'rewind':[-1,-1]}
CU['roll']=[ST('j1')-.05,ST('j1')+.9,53*60+40,54*60]
CU['clock']=[[0,'53:40',None],[ST('j1')+.9,'54:00',None]]
CU['awake']=[[0,4,.25]]; CU['survivors_t']=0
CU['noise']=[[0,0],[sh('roof_stamp')['s'],8],[ST('b2'),26],[ST('b3'),32],[ST('c1'),44],[ST('d1'),12],[sh('eyes_close')['s'],4],[ST('f3')+.9,6],[ST('f3')+1.4,9],[ST('f3')+1.9,12],[ST('f4')+.2,0],[sh('let_pass')['s'],0],[sh('open_eyes')['s'],0],[ST('i5'),18],[sh('in_arms')['s'],0],[sh('vote')['s'],0]]
CU['nearby']={'t':9999,'from':9806,'to':9806,'dur':1,'tag':''}
CU['rescue']=0; CU['rescue6']=0.0001
CU['votetag']=[sh('roof_stamp')['s'],sh('roof_stamp')['e']-.05,'YOU CHOSE: B']
CU['pills']=[['RULE #1',ST('e3')-.04,E('e3')+.3],['RULE #2',ST('f3')-.04,E('f3')+.3]]
CU['kneel_times']=[]
CU['tapsYou']=[ST('b2')+.0,ST('b2')+.22,ST('b2')+.44]
CU['tapsBack']=[ST('b3')+.02,ST('b3')+.14,ST('b3')+.26]
CU['tapsOllie']=[ST('h2')-.12,ST('h3')-.12,ST('h4')-.12]
CU['lastTaps']=[ST('j3')+.15,ST('j3')+.75]
CU['kneelT']=wt('j4','KNEEL')
CU['shake']=[ST('c1')+.12,CU['kneelT']]
CU['dark']=[]
CU['dip']=[sh('roof_stamp')['s'],sh('ladder_down')['s'],sh('eyes_close')['s'],sh('let_pass')['s'],sh('open_eyes')['s'],sh('vote')['s']]
CU['flash']=[ST('i5')-.02]
CU['whiteflash']=[]
CU['cap_y']={}
CU['nocap']=['cta','roof_stamp','maya_note']
CU['drops']=[[E('a1')+.08,ST('b1')-.06],[E('f4')+.05,ST('g1')-.06],[E('j3')+.06,ST('j4')-.05]]
CU['cta_t']=ST('z1'); CU['vote_t']=[sh('vote')['s']+.02,ST('p1')-.05,ST('p4')-.1,ST('p6'),ST('p7')]
CU['T']={'lines':{k:[round(v,3),round(v+dur[k],3)] for k,v in lines.items()}}
CU['lines']={i:{'s':round(lines[i],3),'d':dur[i]} for i in lines}
CU['W']={i:[[w['t'],round(lines[i]+w['s'],3)] for w in rel_words(i)] for i in lines}
CU['stampT']=[ST('b1'),ST('b1')+1.0]
CU['flashFwd']=sh('blind_open')['e']
CU['tod']=[-2,-1]
L_=sh('ladder_down');CU['ladder']={'t0':L_['s'],'v':110.0,'g':58.0,'y0':760.0,'r0':490.0}
gr=[]
for i in (0,1):
    for k in range(1,6):
        tt=(2*58*k-i*58)/110.0
        if tt<L_['e']-L_['s']: gr.append(round(L_['s']+tt,3))
CU['ladderGrabs']=sorted(gr)
json.dump(CU,open('e5/cues.json','w'),indent=1); json.dump(TL,open('e5/timeline.json','w'),indent=1)
open('e5/site/data.js','w').write('window.TL='+json.dumps(TL)+';window.CUES='+json.dumps(CU)+';')
print('shots',len(shots)); 
for s in shots: print(f"{s['n']:14s} {s['s']:6.2f} {s['e']:6.2f} {s['e']-s['s']:4.2f}")
