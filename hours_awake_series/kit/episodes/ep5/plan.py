import json,re,subprocess,numpy as np,sys,os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
AUD=json.load(open('aud.json')); LINES=json.load(open('lines.json'))
S=[{'id':l[0],'text':l[1]} for l in LINES]; LN={x['id']:x for x in S}
AUDIO_LEN=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0','voice48.wav']))
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
seq('hook1',2.40)
seq('hook2',5.30)
seq('vote_stamp',ST('b2')-.2)
seq('face_sleep',ST('b3')-.1)
seq('ring_warm',ST('c1')-.1)
seq('night_face',E('c1')+.04)
seq('finger',16.0)
seq('dawn',ST('d2')-.65)
seq('file_pan',ST('d3')-.24)
seq('stamp_s0',ST('d4')-.17)
seq('photo',24.90)
seq('mark',ST('d5')-.03)
seq('maya_photo',ST('e1')-.05)
seq('hand_moves',ST('e2')-.07)
seq('crayon_close',ST('e3')-.07)
seq('writes',ST('e4')-.05)
seq('tear',E('e5')+.05)
seq('stands',39.0)
seq('follow_top',40.4)
seq('follow_door',E('f2')+.05)
seq('empty_cot',ST('p1'))
seq('vote',ST('z1')-.15)
seq('cta',AUDIO_LEN)
D=AUDIO_LEN
print('TOTAL',round(D,2))

# ---- captions
RED={'KNEEL','ZERO','SUBJECT','AWAKE'};LIME={'BROTHER','A','STAY','FOLLOW','CHOOSE','MAYA','CRAYON','YOU'};AMB={'SIXTY','DAWN','THOUSAND','THREE'}
allw=[]
for x in S:
    i=x['id']
    for j,w in enumerate(rel_words(i)):
        col=None;T=w['t']
        if T=='B' and i in('p4','p9'): col='red'
        elif T in RED: col='red'
        elif T in AMB: col='amber'
        elif T in LIME: col='lime'
        allw.append({'t':T,'s':round(lines[i]+w['s'],3),'e':round(lines[i]+w['e'],3),'brk':w['brk'],'col':col,'line':i,'ell':False})
KW={'CRAYON'}
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
CU={'duration':round(D,3),'shots':shots,'ep':5,'part':5,'fb':[-1,-1],'rewind':[-1,-1]}
R0=sh('night_face')['s']+.3;R1=sh('dawn')['s']+1.6
CU['roll']=[R0,R1,55*60,59*60+40]
CU['clock']=[[0,'55:00',None],[R1,'59:40',None]]
CU['awake']=[[0,4]]; CU['survivors_t']=-5
CU['noise']=[[0,0],[sh('night_face')['s'],6],[sh('night_face')['s']+.9,9],[sh('night_face')['s']+1.3,0],[ST('f2'),14],[sh('vote')['s'],0]]
CU['nearby']={'t':ST('f2')+.2,'from':9806,'to':0,'dur':6.5,'tag':'LEAVING'}
CU['rescue']=0; CU['rescue6']=0.0001
CU['votetag']=None
CU['pills']=[]
CU['hookT']=[0.15,wt('a2','KNEEL')]
CU['stampT']=[ST('b1'),ST('b1')+.55]
CU['tapsEcho']=[sh('finger')['s']+1.55,sh('finger')['s']+2.05]
CU['s0T']=wt('d3','SUBJECT')-.1
CU['glowT']=sh('mark')['s']+.25
CU['mayaT']=wt('d5','MAYA')
CU['tearT']=[wt('e4','AWAKE')-.1,E('e5')]
CU['standT']=ST('f1')
CU['shake']=[]
CU['dark']=[]
CU['dip']=[sh('vote_stamp')['s'],sh('dawn')['s'],sh('mark')['s'],sh('follow_top')['s'],sh('vote')['s']]
CU['flash']=[]
CU['whiteflash']=[]
CU['cap_y']={'face_sleep':575}
CU['nocap']=['vote_stamp','cta']
CU['nohud']=[]
CU['drops']=[[12.97,14.28],[24.93,25.72],[33.38,34.08]]
CU['cta_t']=ST('z1'); CU['vote_t']=[sh('vote')['s']+.02,ST('p1')+.02,ST('p4')-.05,ST('p8'),ST('p9')]
CU['T']={'lines':{k:[round(v,3),round(v+dur[k],3)] for k,v in lines.items()}}
CU['lines']={i:{'s':round(lines[i],3),'d':dur[i]} for i in lines}
CU['W']={i:[[w['t'],round(lines[i]+w['s'],3)] for w in rel_words(i)] for i in lines}
CU['stampT']=[ST('b1'),ST('b1')+1.0]
json.dump(CU,open('cues.json','w'),indent=1); json.dump(TL,open('timeline.json','w'),indent=1)
open('site/data.js','w').write('window.TL='+json.dumps(TL)+';window.CUES='+json.dumps(CU)+';')
print('shots',len(shots)); 
for s in shots: print(f"{s['n']:14s} {s['s']:6.2f} {s['e']:6.2f} {s['e']-s['s']:4.2f}")
