import numpy as np,sys,os
from PIL import Image
d=sys.argv[1]
for f in sorted(os.listdir(d),key=lambda f: float(f[1:-4])):
    im=np.asarray(Image.open(os.path.join(d,f)).convert('RGB').resize((135,240)),dtype=np.float32)
    L=im.mean(2); c=(im.min(2)>243).mean()*100; h=(L>225).mean()*100
    print(f'{f[1:-4]:>5} mean {L.mean():5.1f} hot {h:5.1f}% white {c:5.1f}%','<<<' if h>22 or c>6 or L.mean()>170 else '')
