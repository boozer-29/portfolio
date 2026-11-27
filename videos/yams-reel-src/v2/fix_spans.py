# Re-time caption words to the Scribe transcript of the final mix and rebuild the audible spans (hold through pauses < 0.34 s).
import json, os
D=json.load(open('dialogue.json'))
S=[w for w in json.load(open('mix_stt.json'))['words'] if w['type']=='word']
OV={'h1':[(3.42,3.66),(3.74,4.08),(4.34,4.5),(4.5,4.9)],'h2':[(8.44,8.56),(8.56,8.7),(8.98,9.12),(9.16,9.38),(9.48,10.0)],'h3':[(15.26,15.34),(15.4,15.56),(15.64,15.92),(15.98,16.06),(16.06,16.14)],'s4bt':[(20.58,21.08)],
 'c3':[(12.78,13.06),(13.62,13.66),(13.72,13.86),(13.9,14.06),(14.14,14.28),(14.36,14.56),(14.68,15.02)],
 'n6t':[(32.02,32.38),(32.46,32.56),(32.62,32.86),(32.94,33.26),(33.32,33.48),(33.54,33.96)],
 'a8t':[(42.02,42.24),(42.58,42.66),(42.72,43.02),(43.08,43.32),(43.36,43.52),(43.56,43.76)],
 'h8':[(43.94,44.02),(44.08,44.18),(44.24,44.54),(44.6,44.78),(44.92,45.28)]}
for c in D:
    if c['kind']=='shout': continue
    key=os.path.basename(c['file'])[:-4]
    if key in OV: T=OV[key]
    else:
        a,b=c['spans'][0][0]-0.3,c['spans'][-1][1]+0.5
        ws=[w for w in S if a<=w['start']<=b and 'ombo' not in w['text'].lower()]
        if len(ws)!=len(c['words']): print('COUNT MISMATCH',key,[w['w'] for w in c['words']],[w['text'] for w in ws]); continue
        T=[(w['start'],w['end']) for w in ws]
    assert len(T)==len(c['words']),key
    for cw,(s,e) in zip(c['words'],T): cw['t']=round(s,3); cw['e']=round(e,3)
    sp=[]
    for s,e in T:
        if sp and s-sp[-1][2]<0.34: sp[-1][1]=e+0.12; sp[-1][2]=e
        else: sp.append([s-0.06,e+0.12,e])
    c['spans']=[[round(a,3),round(b,3)] for a,b,_ in sp]
    print(f"{c['speaker']:9}",c['spans'],' '.join(w['w'] for w in c['words']))
json.dump(D,open('dialogue.json','w'),indent=1)
