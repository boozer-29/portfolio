# usage: python3 tools/qa_video.py episodes/epN  -> sudden jumps inside shots, still runs > 1.5 s, black frames, low-motion shots
import sys,os,json,cv2,numpy as np
d=sys.argv[1];C=json.load(open(os.path.join(d,'cues.json')));cuts=[s['s'] for s in C['shots']]
cap=cv2.VideoCapture(os.path.join(d,'final.mp4'));prev=None;n=0;D=[];static=0;stat=[];black=[]
while True:
    ok,f=cap.read()
    if not ok:break
    g=cv2.cvtColor(cv2.resize(f,(135,240)),cv2.COLOR_BGR2GRAY).astype(float)
    if g.mean()<6:black.append(round(n/30,2))
    if prev is not None:
        x=np.abs(g-prev).mean();D.append((n,x))
        if x<.35:static+=1
        else:
            if static>45:stat.append((round((n-static)/30,2),round(static/30,2)))
            static=0
    prev=g;n+=1
D=np.array(D);med=np.median(D[:,1])
print('frames',n,'black',black[:20]);print('still runs >1.5s',stat)
print('jumps inside shots (check each: intended flash/cut or glitch?)',[(round(f/30,2),round(v,1)) for f,v in D if v>max(6,med*8) and min(abs(f/30-c) for c in cuts)>2.5/30])
for s in C['shots']:
    a,b=int(s['s']*30)+2,int(s['e']*30)-1;seg=D[(D[:,0]>=a)&(D[:,0]<b),1]
    if len(seg) and seg.mean()<.3:print('low motion:',s['n'],round(seg.mean(),2))
