# Re-time caption words to the Scribe transcript of the final mix and rebuild audible spans (hold through pauses < 0.34 s).
import json, os
D=json.load(open('dialogue.json'))
S=[w for w in json.load(open('mix_stt.json'))['words'] if w['type']=='word']
for c in D:
    if c['kind']=='shout': continue
    a,b=c['spans'][0][0]-0.3,c['spans'][-1][1]+0.5
    ws=[w for w in S if a<=w['start']<=b and 'ombo' not in w['text'].lower()]
    if len(ws)!=len(c['words']): print('COUNT MISMATCH',c['speaker'],[w['w'] for w in c['words']],[w['text'] for w in ws]); continue
    T=[(w['start'],w['end']) for w in ws]
    for cw,(s,e) in zip(c['words'],T): cw['t']=round(s,3); cw['e']=round(e,3)
    sp=[]
    for s,e in T:
        if sp and s-sp[-1][2]<0.34: sp[-1][1]=e+0.12; sp[-1][2]=e
        else: sp.append([s-0.06,e+0.12,e])
    c['spans']=[[round(x,3),round(y,3)] for x,y,_ in sp]
    print(f"{c['speaker']:9}",c['spans'],' '.join(w['w'] for w in c['words']))
json.dump(D,open('dialogue.json','w'),indent=1)
