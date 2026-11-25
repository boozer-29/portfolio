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
# speech band only (300 Hz-4 kHz): AURA's bass would otherwise hide a clearly heard shout (MASTER_PROMPT 9.18)
def ld(f): return np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i',f,'-af','highpass=f=300,lowpass=f=4000','-ac','1','-ar','16000','-f','f32le','-'],capture_output=True).stdout,np.float32)
VS,BS=ld('stem_voice.wav'),ld('stem_bg.wav'); lv=lambda x,i: 20*np.log10(np.sqrt(np.mean(x[max(0,i-320):i+320]**2))+1e-12)   # same window as verify_captions.py
for c in D:
    if c['kind']!='shout': continue
    # frame by frame, the same test verify_captions.py uses; runs shorter than 0.2 s are dropped, silent gaps stay uncaptioned
    a,b=c['spans'][0][0]-0.1,c['spans'][-1][1]+0.1; sp=[]
    for k in range(int(a*30),int(b*30)+1):
        O=k/30; i=int(O*16000)
        if lv(VS,i)>-38 and lv(VS,i)>lv(BS,i)+6:
            if sp and k-sp[-1][1]==1: sp[-1][1]=k
            else: sp.append([k,k])
    c["spans"]=[[round(x/30-0.01,3),round(y/30,3)] for x,y in sp if y-x>=5]
    print('shout',c['file'],c['spans'])
json.dump(D,open('dialogue.json','w'),indent=1)
