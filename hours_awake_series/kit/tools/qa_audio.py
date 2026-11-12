# usage: python3 tools/qa_audio.py episodes/epN  (audio.py writes aud/st_voice|st_sfx|st_bed.wav stems)
import sys,os,json,numpy as np,soundfile as sf
d=sys.argv[1];j=lambda *p:os.path.join(d,*p)
v,sr=sf.read(j('aud','st_voice.wav'));x,_=sf.read(j('aud','st_sfx.wav'));m,_=sf.read(j('mix_final.wav'));vv,_=sf.read(j('voice48.wav'));C=json.load(open(j('cues.json')))
mm=m if m.ndim==1 else m.mean(1);db=lambda a:20*np.log10(np.sqrt((a**2).mean())+1e-12)
bad=[k for k,l in C['lines'].items() if l['d']>.15 and db(mm[int(l['s']*sr):int((l['s']+l['d'])*sr)])<db(vv[int(l['s']*sr):int((l['s']+l['d'])*sr)])-6]
print('MUTED/MASKED LINES:',bad or 'none')
w=int(.05*sr);pk=sorted([(db(x[i:i+w]),i/sr) for i in range(0,len(x)-w,w)],reverse=True)[:8];vp=max(db(v[i:i+w]) for i in range(0,len(v)-w,w))
print('voice 50ms peak',round(vp,1),'| loudest effects',[(round(a,1),round(t,2)) for a,t in pk],'(keep them >= 8 dB under the voice peak)')
for a,b in C['drops']:print('silence drop',a,b,'level',round(db(mm[int(a*sr):int(b*sr)]),1),'dB (should be < -45)')
print('max sample jump (click check, keep < 0.9):',round(float(np.abs(np.diff(mm)).max()),3))
