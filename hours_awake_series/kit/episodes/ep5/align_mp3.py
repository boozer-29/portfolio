import json,re,difflib,os,sys
os.chdir(os.path.dirname(os.path.abspath(__file__)))
LINES=json.load(open('lines.json')); W=json.load(open('whisper_words.json'))
ONES='zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split()
TENS='_ _ twenty thirty forty fifty sixty seventy eighty ninety'.split()
def numw(n):
    n=int(n)
    if n<20: return [ONES[n]]
    return [TENS[n//10]]+([ONES[n%10]] if n%10 else [])
def subtoks_whisper(tok):
    t=tok.lower().strip()
    t=re.sub(r"[^a-z0-9'.:\-]","",t)
    out=[]
    for part in re.split(r"[-:.]+",t):
        if not part: continue
        if part.isdigit():
            if len(part)==2 and part.startswith('0'): out+=['oh']+numw(part[1])
            else: out+=numw(part)
        else: out.append(part.strip("'") if part.strip("'") else part)
    return out
def subtoks_script(tok):
    t=tok.lower(); t=re.sub(r"[^a-z0-9'\-]","",t)
    out=[]
    for part in t.split('-'):
        if not part: continue
        out.append(part)
    return out
# flatten
S=[];meta=[]   # S sub-tokens ; meta (line id, token idx)
toks_by_line={}
for lid,text in LINES:
    toks=text.split(); toks_by_line[lid]=toks
    for ti,tok in enumerate(toks):
        if tok.lower().strip(".,!?") in ('am','dj'):
            subs={'am':['a','m'],'dj':['d','j']}[tok.lower().strip(".,!?")]
        else: subs=subtoks_script(tok)
        for s in subs: S.append(s); meta.append((lid,ti))
Wt=[];Wm=[]
for i,w in enumerate(W):
    for s in subtoks_whisper(w['t']): Wt.append(s); Wm.append(i)
sm=difflib.SequenceMatcher(None,S,Wt,autojunk=False)
st=[None]*len(S); en=[None]*len(S); matched=0
for a,b,n in sm.get_matching_blocks():
    for k in range(n):
        w=W[Wm[b+k]]; st[a+k]=w['s']; en[a+k]=w['e']; matched+=1
print('script subtokens',len(S),'matched',matched,f'({100*matched//len(S)}%)')
# interpolate unmatched
i=0
while i<len(S):
    if st[i] is None:
        j=i
        while j<len(S) and st[j] is None: j+=1
        left=en[i-1] if i>0 else 0.0; right=st[j] if j<len(S) else left+0.3*(j-i)
        step=(right-left)/(j-i+1)
        for k in range(i,j): st[k]=left+step*(k-i+.15); en[k]=left+step*(k-i+.9)
        i=j
    else: i+=1
# per-token times, per-line
tok_t={}
for k,(lid,ti) in enumerate(meta):
    a=tok_t.setdefault((lid,ti),[st[k],en[k]]); a[0]=min(a[0],st[k]); a[1]=max(a[1],en[k])
AUD={}
for lid,text in LINES:
    toks=toks_by_line[lid]; times=[tok_t[(lid,i)] for i in range(len(toks))]
    AUD[lid]={'s':round(times[0][0],3),'e':round(times[-1][1],3),'words':[{'t':toks[i],'s':round(times[i][0],3),'e':round(times[i][1],3)} for i in range(len(toks))]}
json.dump(AUD,open('aud.json','w'),indent=1)
prev=0
print('line   start   end    gap-before')
for lid,_ in LINES:
    a=AUD[lid]; print(f"{lid:4s} {a['s']:7.2f} {a['e']:7.2f}  {a['s']-prev:5.2f}"); prev=a['e']

# ---- refine line boundaries against the real audio energy
import numpy as np,soundfile as sf
v,sr=sf.read('voice48.wav'); v=v if v.ndim==1 else v[:,0]
hop=int(sr*.01); n=len(v)//hop
env=np.array([np.sqrt((v[i*hop:(i+2)*hop]**2).mean()) for i in range(n)])
THR=0.012
def onset(t):
    i=int(t*100); lo=max(0,i-45)
    # walk back while energy stays above threshold (allowing 40ms dips)
    j=i; quiet=0
    while j>lo:
        if env[j]<THR: quiet+=1
        else: quiet=0
        if quiet>=6: return (j+6)/100
        j-=1
    return lo/100
def offset(t):
    i=int(t*100); hi=min(n-1,i+45); j=i; quiet=0
    while j<hi:
        if env[j]<THR: quiet+=1
        else: quiet=0
        if quiet>=6: return (j-5)/100
        j+=1
    return hi/100
shifts=[]
for lid,_ in LINES:
    a=AUD[lid]; s0,e0=a['s'],a['e']
    # if the line starts inside speech (no pause before), keep; else snap
    s1=onset(s0+0.05) if env[min(n-1,int((s0+.05)*100))]>=THR else s0
    # search forward for onset if we are in silence
    if env[min(n-1,int((s0+.05)*100))]<THR:
        k=int(s0*100)
        while k<n-1 and env[k]<THR: k+=1
        s1=k/100
    e1=offset(e0-0.05) if env[min(n-1,int((e0-.05)*100))]>=THR else e0
    if env[min(n-1,int((e0-.05)*100))]<THR:
        k=int(e0*100)
        while k>0 and env[k]<THR: k-=1
        e1=k/100
    if e1<=s1+.1: s1,e1=s0,e0
    shifts.append((lid,round(s1-s0,2),round(e1-e0,2)))
    for w in a['words']:
        w['s']=round(s1+(w['s']-s0)*(e1-s1)/max(1e-6,(e0-s0)),3); w['e']=round(s1+(w['e']-s0)*(e1-s1)/max(1e-6,(e0-s0)),3)
    a['s'],a['e']=round(s1,3),round(e1,3)
json.dump(AUD,open('aud.json','w'),indent=1)
print('refined; biggest start shifts:',sorted(shifts,key=lambda x:x[1])[:6]); print('biggest end shifts:',sorted(shifts,key=lambda x:-abs(x[2]))[:5])
