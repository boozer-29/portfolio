# Re-time caption words to the Scribe transcript of the final mix and rebuild audible spans (hold through pauses < 0.34 s).
import json, os
D=json.load(open('dialogue.json'))
S=[w for w in json.load(open('mix_stt.json'))['words'] if w['type']=='word']
for c in D:
    if c['kind']=='shout': continue
    nxt=min([d['spans'][0][0] for d in D if d['spans'][0][0]>c['spans'][0][0]+0.05] or [1e9])
    a,b=c['spans'][0][0]-0.3,c['spans'][-1][1]+0.5
    ws=[w for w in S if a<=w['start']<=min(b,nxt-0.05) and 'ombo' not in w['text'].lower()]
    if len(ws)>len(c['words']): ws=ws[:len(c['words'])]   # shortcut: assumes extra words are trailing ones from the next cue
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

# shouts: spans only where the voice stem is really sounding (>= -40 dB and 10 dB over the bed), gaps > 0.15 s left uncaptioned
import subprocess, numpy as np
def ld(f): return np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i',f,'-ac','1','-ar','16000','-f','f32le','-'],capture_output=True).stdout,np.float32)
VS,BS=ld('stem_voice.wav'),ld('stem_bg.wav'); lv=lambda x,i: 20*np.log10(np.sqrt(np.mean(x[i:i+320]**2))+1e-12)
for c in D:
    if c['kind']!='shout': continue
    a,b=c['spans'][0][0]-0.1,c['spans'][-1][1]+0.1; on=[]
    for k in range(int(a*100),int(b*100)):
        i=k*160; on.append((k/100, lv(VS,i)>-40 and lv(VS,i)>lv(BS,i)+10))
    sp=[]
    for t,o in on:
        if not o: continue
        if sp and t-sp[-1][1]<=0.15: sp[-1][1]=t+0.01
        else: sp.append([t,t+0.01])
    c['spans']=[[round(x+0.03,2),round(y-0.12,2)] for x,y in sp if y-x>=0.1]
    print('shout',c['file'],c['spans'])
json.dump(D,open('dialogue.json','w'),indent=1)
