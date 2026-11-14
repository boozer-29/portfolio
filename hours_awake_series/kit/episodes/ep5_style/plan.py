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
seq('s_wide',2.40)
seq('s_top',5.45)
D=5.45;AUDIO_LEN=5.45
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
CU['roll']=None
CU['clock']=[[0,'55:00',None]]
CU['awake']=[[0,4]]; CU['survivors_t']=-5
CU['noise']=[[0,0]]
CU['nearby']={'t':9999,'from':9806,'to':9806,'dur':1,'tag':''}
CU['rescue']=0; CU['rescue6']=0.0001
CU['votetag']=None;CU['pills']=[]
CU['hookT']=[0.15,wt('a2','KNEEL')]
CU['shake']=[];CU['dark']=[];CU['dip']=[];CU['flash']=[];CU['whiteflash']=[]
CU['cap_y']={};CU['nocap']=[];CU['nohud']=[]
CU['drops']=[]
CU['T']={'lines':{k:[round(v,3),round(v+dur[k],3)] for k,v in lines.items()}}
CU['lines']={i:{'s':round(lines[i],3),'d':dur[i]} for i in lines}
CU['W']={i:[[w['t'],round(lines[i]+w['s'],3)] for w in rel_words(i)] for i in lines}
CU['stampT']=[ST('b1'),ST('b1')+1.0]
json.dump(CU,open('cues.json','w'),indent=1); json.dump(TL,open('timeline.json','w'),indent=1)
open('site/data.js','w').write('window.TL='+json.dumps(TL)+';window.CUES='+json.dumps(CU)+';')
print('shots',len(shots)); 
for s in shots: print(f"{s['n']:14s} {s['s']:6.2f} {s['e']:6.2f} {s['e']-s['s']:4.2f}")
