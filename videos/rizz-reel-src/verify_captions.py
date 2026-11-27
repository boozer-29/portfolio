import json, numpy as np, subprocess
def load(f):
    b=subprocess.run(['ffmpeg','-v','error','-i',f,'-ac','1','-ar','16000','-f','f32le','-'],capture_output=True).stdout
    return np.frombuffer(b,dtype=np.float32)
VS=load('stem_voice.wav'); BS=load('stem_bg.wav')
def lvl(x,O): i=int(O*16000); s=x[max(0,i-320):i+320]; return 20*np.log10(np.sqrt(np.mean(s**2))+1e-12)
def clearly_audible(O): return lvl(VS,O) > -35 and lvl(VS,O) > lvl(BS,O) + 10
caps=json.load(open('captions_per_frame.json')); D=json.load(open('dialogue.json'))
stt=[w for w in json.load(open('mix4_stt.json'))['words'] if w['type']=='word']
def in_span(c,O): return any(a-0.03<=O<b+0.04 for a,b in c['spans'])
# words heard in the final mix, with pauses shorter than 0.3 s inside a sentence bridged (captions hold through them)
heard=[]
for w in stt:
    if heard and w['start']-heard[-1][1] < 0.30: heard[-1][1]=max(heard[-1][1],w['end'])
    else: heard.append([w['start'],w['end']])
errs=[]
for i,(cap,hook) in enumerate(caps):
    O=i/30
    if cap or hook:
        # 1) the text on screen must belong to a voice that is audible right now
        if not any(in_span(c,O) for c in D) or not (clearly_audible(O) or any(a-0.15<=O<=b+0.2 for a,b in heard)): errs.append(('text with no voice',round(O,2),cap or hook))
        # 2) the transcript of the FINAL mix must have a word being spoken at (or right around) this frame
        if not any(a-0.15<=O<=b+0.2 for a,b in heard) and not (any(a-0.5<=O<=b+0.5 for a,b in heard) and clearly_audible(O)): errs.append(('text but nothing heard in final mix',round(O,2),cap or hook))
# 3) every word heard in the final mix must be captioned (or be the hook) at its midpoint
for w in stt:
    i=min(int(round((w['start']+w['end'])/2*30)),len(caps)-1)
    if not (caps[i][0] or caps[i][1]): errs.append(('heard but no caption',round((w['start']+w['end'])/2,2),w['text']))
# 4) caption must show within 0.1 s of each word starting
for w in stt:
    i=int(round(w['start']*30))+3
    if i<len(caps) and not (caps[i][0] or caps[i][1]): errs.append(('caption late',round(w['start'],2),w['text']))
print('frames with on-screen speech text:',sum(1 for c,h in caps if c or h))
print('ERRORS:',len(errs)); [print(' ',e) for e in errs[:40]]
