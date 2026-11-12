import numpy as np, subprocess, json
def load(f):
    b=subprocess.run(['ffmpeg','-v','error','-i',f,'-ac','1','-ar','16000','-f','f32le','-'],capture_output=True).stdout
    return np.frombuffer(b,dtype=np.float32)
v=load('stem_voice.wav'); bg=load('stem_bg.wav'); n=min(len(v),len(bg)); v=v[:n]; bg=bg[:n]
hop=800
def db(x): return 20*np.log10(np.sqrt(np.mean(x**2))+1e-12)
D=json.load(open('dialogue.json')); worst=99
print('cue          speaker   voice  bg     SNR p10 / median   spans')
for c in D:
    rows=[]
    for s,e in c['spans']:
        for i in range(int(s*16000),int(e*16000)-hop+1,hop//2):
            if db(v[i:i+hop]) > -40: rows.append(db(v[i:i+hop])-db(bg[i:i+hop]))   # only where the voice is actually sounding
    r=np.array(rows) if rows else np.array([np.nan])
    p10=np.percentile(r,10); worst=min(worst,p10)
    vd=np.median([db(v[int(s*16000):int(e*16000)]) for s,e in c['spans']])
    print(f"{c['file']:12} {c['speaker']:8} {vd:6.1f}  SNR {p10:5.1f} / {np.median(r):5.1f}   {len(c['spans'])} spans {c['spans'][0][0] if c['spans'] else '-'}-{c['spans'][-1][1] if c['spans'] else '-'}")
print('WORST p10 SNR:',round(worst,1),'dB')
