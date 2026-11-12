import sys,json
from PIL import Image,ImageDraw
B=sys.argv[4] if len(sys.argv)>4 else 'episodes/ep4/'
ts=sys.argv[2].split(',');cols=int(sys.argv[3]) if len(sys.argv)>3 else 6;cw,ch=270,480
rows=(len(ts)+cols-1)//cols;S=Image.new('RGB',(cols*cw,rows*ch))
for i,t in enumerate(ts):
    im=Image.open(B+f'stills/s_{t}.jpg').resize((cw,ch));d=ImageDraw.Draw(im);d.text((4,ch-12),t,fill=(255,255,0));S.paste(im,((i%cols)*cw,(i//cols)*ch))
S.save(B+sys.argv[1])
