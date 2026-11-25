# contact sheets of test/t*.jpg -> sheet_N.jpg (8 per sheet)
import glob, re
from PIL import Image, ImageDraw
fs = sorted(glob.glob('test/t*.jpg'), key=lambda f: float(re.findall(r't([\d.]+)\.jpg', f)[0]))
for s in range(0, len(fs), 8):
    im = Image.new('RGB', (1440, 1280))
    for k, f in enumerate(fs[s:s + 8]):
        t = Image.open(f).resize((360, 640)); ImageDraw.Draw(t).text((6, 6), f, fill=(255, 255, 0)); im.paste(t, ((k % 4) * 360, (k // 4) * 640))
    im.save(f'sheet_{s // 8}.jpg', quality=85)
print(len(fs))
