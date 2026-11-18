import numpy as np, os, sys
from PIL import Image
D=sys.argv[1]; d5=np.load('d5.npy')
def L(f): return np.asarray(Image.open(f).convert('L').resize((135,240)),dtype=np.float32)
low=[]
for k in range(0,1728,15):
    a,b=f'{D}/{k+7:05d}.jpg',f'{D}/{k+8:05d}.jpg'
    if not os.path.exists(b): continue
    v=np.abs(L(a)-L(b)).mean(); old=d5[k+7] if k+7<len(d5) else 0
    if v<0.5: low.append((k/30,v))
    print(f"{k/30:5.1f}s new={v:5.2f} old={old:5.2f}{'  <<< LOW' if v<0.5 else ''}")
print('LOW:',[(round(t,1),round(v,2)) for t,v in low])
