# usage: python3 tools/transcribe.py episodes/epN   -> whisper_words.json + a per-sentence prosody table (pace, loudness, pitch, pauses)
import sys,os,json,numpy as np,soundfile as sf
from faster_whisper import WhisperModel
d=sys.argv[1];a,sr=sf.read(os.path.join(d,'voice16.wav'),dtype='float32')
m=WhisperModel(os.environ.get('WHISPER','small.en'),device='cpu',compute_type='int8')
seg,_=m.transcribe(a,word_timestamps=True,language='en',beam_size=5)
W=[{'t':w.word.strip(),'s':round(w.start,2),'e':round(w.end,2)} for s in seg for w in s.words]
json.dump(W,open(os.path.join(d,'whisper_words.json'),'w'))
import librosa
f0,_,_=librosa.pyin(a,fmin=60,fmax=300,sr=16000,frame_length=1024,hop_length=160)
sent,cur=[],[]
for w in W:
    cur.append(w)
    if w['t'][-1] in '.?!':sent.append(cur);cur=[]
if cur:sent.append(cur)
prev=0
for s in sent:
    s0,e0=s[0]['s'],s[-1]['e'];seg_=a[int(s0*16000):int(e0*16000)];rms=20*np.log10(np.sqrt((seg_**2).mean())+1e-9);f=f0[int(s0*100):int(e0*100)];f=f[~np.isnan(f)]
    print(f"{s0:6.2f}-{e0:6.2f} gap{s0-prev:5.2f} wps{len(s)/max(.2,e0-s0):4.1f} {rms:6.1f}dB f0 {np.median(f) if len(f) else 0:4.0f} | {' '.join(w['t'] for w in s)}");prev=e0
