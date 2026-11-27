import json
D=json.load(open('dialogue.json'))
S=[w for w in json.load(open('mix_stt.json'))['words'] if w['type']=='word']
for c in D:
    if c['kind']=='shout': continue
    a,b=c['spans'][0][0]-0.3,c['spans'][-1][1]+0.6
    ws=[w for w in S if a<=w['start']<=b and 'ombo' not in w['text'].lower()]
    if len(ws)!=len(c['words']): print('COUNT MISMATCH',c['words'],[w['text'] for w in ws]); continue
    for cw,w in zip(c['words'],ws): cw['t']=round(w['start'],3); cw['e']=round(w['end'],3)
    sp=[]
    for w in ws:
        s,e=w['start']-0.06,w['end']+0.12
        if sp and s-sp[-1][1]<0.3: sp[-1][1]=e
        else: sp.append([s,e])
    old=c['spans']; c['spans']=[[round(s,3),round(e,3)] for s,e in sp]
    print(c['speaker'],old,'->',c['spans'])
json.dump(D,open('dialogue.json','w'),indent=1)
