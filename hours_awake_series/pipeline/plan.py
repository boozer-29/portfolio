import json,re,subprocess,numpy as np,sys,os
os.chdir(os.path.dirname(os.path.abspath(__file__))+'/..')
AUD=json.load(open('v4/aud.json')); LINES=json.load(open('v4/lines.json'))
S=[{'id':l[0],'text':l[1]} for l in LINES]; LN={x['id']:x for x in S}
AUDIO_LEN=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0','v4/voice48.wav']))
lines={k:v['s'] for k,v in AUD.items()}; dur={k:v['e']-v['s'] for k,v in AUD.items()}
MERGE={'d1':[(1,4,'3:07 AM')]}
def rel_words(i):
    out=[]
    for w in AUD[i]['words']:
        out.append({'t':re.sub(r"[.,!?]","",w['t']).upper(),'s':w['s']-AUD[i]['s'],'e':w['e']-AUD[i]['s'],'brk':bool(re.search(r"[.,!?]$",w['t']))})
    for a,b,txt in MERGE.get(i,[]):
        w={'t':txt,'s':out[a]['s'],'e':out[b]['e'],'brk':out[b]['brk']}; out=out[:a]+[w]+out[b+1:]
    return out
def ST(l): return lines[l]
def E(l): return lines[l]+dur[l]
def WS(l,word,nth=0): return lines[l]+[w for w in rel_words(l) if w['t']==word][nth]['s']
shots=[]; beats=[]; BS={}
def SHOT(n,a,b,beat): 
    assert b>a-1e-6,(n,a,b); shots.append({'n':n,'s':round(a,4),'e':round(max(b,a+.05),4),'beat':beat}); return b
def wt(lid,word,nth=0): return WS(lid,word,nth)
# ---------------- schedule (everything anchored to your recording)
B2s=max(E('a2')+.06,ST('b1')-.8)
SHOT('door',0,ST('a2')-.05,'B1'); SHOT('city_dead',ST('a2')-.05,WS('a2',"YOU'RE")-.05,'B1'); SHOT('eye_blood',WS('a2',"YOU'RE")-.05,B2s,'B1'); BS['B1']=0
BS['B2']=B2s; SHOT('rewind',B2s,B2s+.8,'B2'); x=SHOT('night_sky',B2s+.8,WS('b1','EVERY')-.05,'B2'); x=SHOT('phones',x,WS('b1','CITY'),'B2'); x=SHOT('phones_b',x,E('b1')+.05,'B2')
x=SHOT('phone_lock',x,ST('b2')+.7,'B2'); B3s=ST('c1')-.12; SHOT('headphones',x,B3s,'B2')
BS['B3']=B3s; x=SHOT('driver',B3s,WS('c1','EVERYONE')-.05,'B3'); x=SHOT('stadium',x,E('c1')+.45,'B3'); x=SHOT('bus_lamp',x,WS('c2','PILOTS')-.05,'B3'); x=SHOT('cockpit',x,WS('c2','ALL')-.05,'B3')
B4s=ST('d1')-.06; D1=(E('c2')+.1,E('c2')+.5); SHOT('lights_off',x,B4s,'B3')
BS['B4']=B4s; x=SHOT('phone307',B4s,WS('d1','THEY')-.05,'B4'); x=SHOT('woman',x,E('d1'),'B4'); x=SHOT('dominoes',x,E('d1')+1.3,'B4'); x=SHOT('alarm',x,ST('d3')-.2,'B4'); x=SHOT('alarm2',x,E('d3')-.4,'B4'); B5s=E('d3')+.15; SHOT('blk',x,B5s,'B4')
BS['B5']=B5s; x=SHOT('bed',B5s,ST('e1')+1.2,'B5'); x=SHOT('earcup',x,E('e1')+.3,'B5'); x=SHOT('ins_dj',x,ST('e2')+.45,'B5'); x=SHOT('ins_maya',x,ST('e2')+1.15,'B5'); SHOT('ins_reyes',x,E('e2'),'B5')
B6s=ST('f1'); BS['B6a']=B6s; x=SHOT('dawn_window',B6s,B6s+1.2,'B6a'); x=SHOT('gridlock',x,E('f1')+.05,'B6a'); PA0=x; x=SHOT('plane_a',x,ST('f2')+.75,'B6a'); x=SHOT('plane_b',x,E('f2')+.04,'B6a')
PL0=E('f2')+.04+.3; BS['D2']=E('f2')+.04; x=SHOT('static_sky',E('f2')+.04,PL0,'D2'); B7s=PL0+.65; x=SHOT('plane',PL0,B7s,'B6b'); BS['B6b']=PL0
BS['B7a']=B7s; x=SHOT('nap1',B7s,E('g1b')+.2,'B7a'); x=SHOT('nap2',x,ST('g2')+1.1,'B7a'); B7bs=ST('h1')-.12; SHOT('nap3',x,B7bs,'B7a')
BS['B7b']=B7bs; x=SHOT('cup1',B7bs,E('h1b')+.1,'B7b'); x=SHOT('cup2',x,ST('h2')+.9,'B7b'); B7cs=ST('i1')-.12; SHOT('sound3',x,B7cs,'B7b')
BS['B7c']=B7cs; x=SHOT('throat',B7cs,ST('i2'),'B7c'); x=SHOT('sprint',x,ST('i3'),'B7c'); B8s=E('i3')+.6; SHOT('door_slam',x,B8s,'B7c')
BS['B8']=B8s; B9s=E('j4')+.1; a=B8s; step=(B9s-B8s)/3; SHOT('doll_a',a,a+step,'B8'); SHOT('doll_b',a+step,a+2*step,'B8'); SHOT('doll_c',a+2*step,B9s,'B8')
BS['B9']=B9s; x=SHOT('door2',B9s,ST('k2'),'B9'); x=SHOT('radio',x,ST('k3')-.05,'B9'); x=SHOT('rescue',x,ST('k4')-.05,'B9'); B10s=E('k4')+.1; SHOT('ollie',x,B10s,'B9')
BS['B10']=B10s; x=SHOT('map1',B10s,ST('l2'),'B10'); x=SHOT('map2',x,ST('l3'),'B10'); l3e=E('l3'); x=SHOT('map4',x,l3e+.02,'B10'); CONV=[ST('l3'),l3e-.1]
B11s=l3e+.32; BS['D3']=l3e+.02; SHOT('map_hold',l3e+.02,B11s,'D3')
BS['B11']=B11s; hold0=E('m1')+.04; kneel_t=ST('m2'); x=SHOT('win_fill',B11s,hold0,'B11'); x=SHOT('win_hold',x,kneel_t-.04,'B11'); x=SHOT('win_kneel',x,E('m2')+.04,'B11')
B12s=ST('n1')-.04; BS['D4']=E('m2')+.04; SHOT('win_kneel_static',E('m2')+.04,B12s,'D4')
BS['B12']=B12s; openT=WS('n1','OPEN'); lookT=WS('n2','UP'); n3s=ST('n3'); markT=WS('n4','YOU'); n4e=E('n4'); reflE=n4e; blkE=n4e+.25
SHOT('eye_close',B12s,openT,'B12'); SHOT('eye_open',openT,openT+.4,'B12'); we=SHOT('eye_wave',openT+.4,max(lookT-.1,openT+1.2),'B12'); SHOT('heads_up',we,n3s,'B12'); SHOT('refl',n3s,reflE,'B12'); SHOT('blk',reflE,blkE,'B12')
BS['B13']=blkE; vs=blkE; ctas=ST('z1')-.25
voteA=wt('o1a','A'); voteB=wt('o1b','B'); quietT=wt('o2','ONLY'); commT=wt('o3','COMMENT')
SHOT('vote',vs,ctas,'B13'); SHOT('cta',ctas,AUDIO_LEN,'CTA'); ctaT=ST('z1'); D=AUDIO_LEN
print('TOTAL',round(D,2))
# ---- global words/chunks
LIME={'3:07 AM','HEADPHONES','QUIET','3:07'};RED={'ALIVE','NOTE','ASLEEP','CLOSED','SOUND','STOPPED','SLEEP','THEM','RUN','HERE','SILENT','KNEEL','OPEN','RULE','HUM'};AMB={'HELP','SEVEN','DAYS'}
allw=[]
for x in S:
    i=x['id']
    for j,w in enumerate(rel_words(i)):
        col=None; T=w['t']
        if i=='a1' and T in ("CAN'T","SLEEP"): col='lime'
        elif i=='b1' and T in ('FORTY-ONE','HOURS'): col='lime'
        elif i=='n4' and T=='YOU': col='lime'
        elif i=='o1a' and T=='A': col='lime'
        elif T=='B' and i=='o1b': col='red'
        elif i=='k3' and T in AMB: col='amber'
        elif i=='k1' and T=='FORTY-ONE': col='lime'
        elif T in LIME: col='lime'
        elif T in RED: col='red'
        elif i in('g1','h1','i1'): col='red'
        ell=(i=='i2' and T=='HUM') or (i=='n2' and T=='WINDOW')
        allw.append({'t':T,'s':round(lines[i]+w['s'],3),'e':round(lines[i]+w['e'],3),'brk':w['brk'],'col':col,'line':i,'ell':ell})
KW={'3:07 AM','FORTY-ONE','HUM','SLEEP','SOUND','RUN','YOU'}
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
for i,c in enumerate(chunks):
    TL['chunks'].append({'s':c[0]['s'],'line':c[0]['line'],'words':[{k:w[k] for k in ('t','s','e','col','ell')} for w in c]})
for i,c in enumerate(TL['chunks']):
    nxt=TL['chunks'][i+1]['s'] if i+1<len(TL['chunks']) else c['words'][-1]['e']+.4
    c['e']=min(nxt,c['words'][-1]['e']+.6)
# ---- cues
def clk(h,m): return f'{h:02d}:{m:02d}'
bs=lambda b:BS[b]
CU={'duration':round(D,3),'shots':[{**s,'s':round(s['s'],4),'e':round(s['e'],4)} for s in shots]}
CU['fb']=[bs('B2'),bs('B9')]; CU['rewind']=[bs('B2'),bs('B2')+.8]
clock=[(0,'41:00',None),(bs('B3'),'01:00',None),(bs('B4'),'03:20',None),(bs('B5'),'04:10',None),(bs('B6a'),'06:30',None),(bs('B7a'),'14:00',None),(bs('B7b'),'22:00',None),(bs('B7c'),'30:00',None),(bs('B8'),'36:00',None),(bs('B9'),'41:00',None),(bs('B10'),'41:20',None),(bs('B11'),'41:40',None),(bs('B12'),'42:00',None)]
def mins(s): h,m=s.split(':'); return int(h)*60+int(m)
out=[];prev=None
for tt,c,_ in clock:
    tag=None
    if prev is not None and c!='41:00' or (prev is not None):
        dm=mins(c)-mins(prev)
        if dm>5: tag=f'+{dm//60} HRS' if dm>=60 else f'+{dm} MIN'
        if prev=='36:00': tag='+5 HRS'
    out.append([round(tt,3),c,tag]); prev=c
CU['clock']=out
CU['awake']=[[0,5,.25],[bs('B2')+.8,4127000,.05],[bs('B3'),4127000,.05],[bs('B3')+.2,2000,3.2],[bs('B4'),212,.5],[bs('B5'),38,.5],[bs('B6a'),14,.5],[bs('B7a'),9,.5],[bs('B7b'),7,.5],[bs('B7c'),6,.5],[bs('B8'),5,.5]]
CU['awake'].sort(key=lambda e:e[0])
alarmS=[s for s in shots if s['n']=='alarm'][0]['s']; planeS=[s for s in shots if s['n']=='plane'][0]; soundS=[s for s in shots if s['n']=='sound3'][0]['s']
CU['noise']=[[0,24],[bs('B2'),24],[bs('B2')+.8,80],[bs('B3'),40],[bs('B4'),20],[alarmS,95],[bs('B5'),30],[bs('B6a'),25],[planeS['e']-.12,120],[bs('B7a'),24],[soundS,66],[bs('B7c'),24],[ST('m1')+.4,0],[openT,110]]
CU['noise']=sorted(CU['noise'],key=lambda e:e[0])
CU['survivors_t']=lines['j1']
CU['nearby']={'t':wt('l3','WALKING'),'from':1,'to':3412,'dur':1.1}
CU['rescue']=wt('k3','SEVEN')
CU['pills']=[['HOUR 0',bs('B2')+.15,bs('B2')+.8],['RULE #1',ST('g1')-.04,E('g2')],['RULE #2',ST('h1')-.04,E('h2')],['RULE #3',ST('i1')-.04,B8s]]
CU['shake']=[bs('B7a')+.12,bs('B7b')+.12,bs('B7c')+.12,[s for s in shots if s['n']=='door_slam'][0]['s']+.05,wt('i2','HUM'),kneel_t,openT,planeS['e']-.12,alarmS+.05]
CU['dark']=[]
CU['dip']=[round(s['s'],3) for s in shots if s['n'] in ('city_dead','phone307','bed','dawn_window','door2','doll_a','map1','win_fill','eye_close','vote') and s['s']>0]
CU['flash']=[bs('B4')+.02,[s for s in shots if s['n']=='earcup'][0]['s']+.25,wt('i2','HUM')-.02,openT-.07,CU['nearby']['t']-.02,reflE-.0-.0]
CU['flash']=[f for f in CU['flash'] if f!=reflE]
CU['whiteflash']=[planeS['e']-.12,openT]
CU['planeFlight']=[PA0,B7s]; CU['planeHold']=[BS['D2'],PL0]
CU['cap_y']={'eye_close':650,'eye_open':650,'heads_up':650,'throat':700,'nap2':745,'sound3':720,'eye_blood':700,'ins_dj':700,'ins_maya':700,'ins_reyes':700}
CU['nocap']=['cta','win_hold','win_kneel_static','static_sky','map_hold']
CU['names']=[wt('j2','DJ'),wt('j2','SOLDIER'),wt('j2','NURSE'),wt('j3','BROTHER')]
doll=[s for s in shots if s['n'].startswith('doll')]; CU['doll']=[doll[0]['s'],doll[-1]['e']]
mp=[s for s in shots if s['n'].startswith('map') and s['n']!='map_hold']; CU['map']=[mp[0]['s'],mp[-1]['e'],mp[-1]['e'],CONV[0],CONV[1]]
CU['kneel_t']=kneel_t; CU['wave_t']=openT+.4; CU['mark_t']=markT
CU['vote_t']=[vs+.05,voteA-.15,voteB-.15,commT+.3,quietT,commT]; CU['cta_t']=ctaT
CU['drops']=[list(D1),[BS['D2'],PL0],[BS['D3'],BS['D3']+.3],[hold0,kneel_t-.04],[BS['D4'],B12s]]
CU['lampoff']=B11s-.02
CU['T']={'BS':BS,'openT':openT,'lookT':lookT,'kneel_t':kneel_t,'hold0':hold0,'markT':markT,'planeE':planeS['e'],'alarmS':alarmS,'soundS':soundS,'reflE':reflE,'blkE':blkE,'ctaT':ctaT}
# lines list for audio
CU['lines']={i:{'s':round(lines[i],3),'d':dur[i]} for i in lines}
json.dump(CU,open('v4/cues.json','w'),indent=1); json.dump(TL,open('v4/timeline.json','w'),indent=1)
open('v4/site/data.js','w').write('window.TL='+json.dumps(TL)+';window.CUES='+json.dumps(CU)+';')
print('beats'); 
for b in beats: print(' ',b['id'],round(b['s'],2),round(b['e'],2))
mx=[(s['n'],round(s['e']-s['s'],2)) for s in shots if s['e']-s['s']>1.5 and s['beat'] in ('B1','B2','B3','B4','B5','B6a','B6b','D2')]
print('long flashback shots:',mx); print('big twist at',round(openT/D*100),'%  mid',round(CU['nearby']['t']/D*100),'%')
