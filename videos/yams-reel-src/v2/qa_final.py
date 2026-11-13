# Full QA on the finished MP4. Every check must pass.
import json, subprocess, sys, os, numpy as np
from PIL import Image
MP4 = sys.argv[1]; FR = sys.argv[2]
ok = True
def check(name, cond, detail=''):
    global ok; ok &= bool(cond); print(f"[{'PASS' if cond else 'FAIL'}] {name} {detail}")

# --- container / sync
pr = json.loads(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'stream=codec_type,nb_frames,duration,width,height,r_frame_rate', '-of', 'json', MP4], capture_output=True, text=True).stdout)['streams']
v = [s for s in pr if s['codec_type'] == 'video'][0]; a = [s for s in pr if s['codec_type'] == 'audio'][0]
check('2160x3840 (true 4K) @ 30 fps', v['width'] == 2160 and v['height'] == 3840 and v['r_frame_rate'] == '30/1')
check('1698 video frames', int(v['nb_frames']) == 1698, v['nb_frames'])
check('audio/video same length', abs(float(v['duration']) - float(a['duration'])) < 0.03, f"{v['duration']} vs {a['duration']}")

# --- frames: no duplicates / freezes
kept = subprocess.run(f"ffmpeg -hide_banner -i {MP4} -an -vf mpdecimate,showinfo -f null - 2>&1 | grep -c 'Parsed_showinfo.*n:'", shell=True, capture_output=True, text=True).stdout.strip()
check('no duplicate frames in the MP4 (mpdecimate keeps all)', kept == '1698', kept)
fs = sorted(os.listdir(FR)); prev = None; d = []
for f in fs:
    im = np.asarray(Image.open(os.path.join(FR, f)).convert('L').resize((135, 240)), dtype=np.float32)
    if prev is not None: d.append(np.abs(im - prev).mean())
    prev = im
d = np.array(d)
low = [round(k / 30, 1) for k in range(0, len(d), 15) if np.median(d[k:k + 15]) < 0.45]
check('no low-motion half-second anywhere', not low, low)

# --- audio quality
b = subprocess.run(['ffmpeg', '-v', 'error', '-i', MP4, '-vn', '-f', 'f32le', '-ac', '2', '-ar', '44100', '-'], capture_output=True).stdout
au = np.frombuffer(b, dtype=np.float32).reshape(-1, 2)
check('no clipped samples', int((np.abs(au) >= 0.999).sum()) == 0)
eb = subprocess.run(['ffmpeg', '-hide_banner', '-i', MP4, '-vn', '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
I = float(eb.split('Integrated loudness:')[1].split('I:')[1].split('LUFS')[0]); TP = float(eb.split('True peak:')[1].split('Peak:')[1].split('dBFS')[0])
check('loudness -14 LUFS (+-1)', abs(I + 14) <= 1, f'{I} LUFS'); check('true peak <= -0.5 dBTP', TP <= -0.5, f'{TP} dBTP')
m = au.mean(1); sr = 44100; D = json.load(open('dialogue.json'))
edits = [c['at'] for c in D] + [0.0, 7.0, 45.0, 45.8, 46.6]
clicks = []
for t in edits:
    i = int(t * sr)
    if 200 < i < len(m) - 200:
        jump = np.abs(np.diff(m[i - 180:i + 180])).max(); ctx = np.abs(np.diff(m[i - 2400:i - 300])).max()
        if jump > max(0.08, 3 * ctx): clicks.append((round(t, 2), round(float(jump), 3)))
check('no clicks at any edit point', not clicks, clicks)

# --- captions vs what is actually heard in the MP4
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', MP4, '-vn', '-ac', '1', '-b:a', '128k', 'final_check.mp3'], check=True)
subprocess.run('curl -sS -H "xi-api-key: dummy" -F model_id=scribe_v1 -F file=@final_check.mp3 -F timestamps_granularity=word https://api.elevenlabs.io/v1/speech-to-text -o mix_stt.json', shell=True, check=True)
txt = json.load(open('mix_stt.json'))['text']; print('   transcript of the MP4:', txt)
shouts = sum('ombo' in w['text'].lower() for w in json.load(open('mix_stt.json'))['words'] if w['type'] == 'word')
check('all 9 BOMBOCLAT shouts heard (8 doublings + the last word)', shouts >= 9, shouts)
for line in ['fine boy', 'trouser', 'two seat', 'only me', 'sit down', 'sorry', 'reviewing me', 'ski resort', 'cold back there', 'has a crack', 'cannot park', 'even get car', 'chair my size']:
    check(f'line heard: "{line}"', line.lower() in txt.lower())
r = subprocess.run(['python3', 'verify_captions.py'], capture_output=True, text=True).stdout; print('  ', r.strip().replace('\n', '\n   '))
check('captions: 0 errors (no text without voice, no voice without text, none late)', 'ERRORS: 0' in r)
s = subprocess.run(['python3', 'snr_check.py'], capture_output=True, text=True).stdout
med = [float(l.split('SNR')[1].split('/')[1].split()[0]) for l in s.splitlines() if l.startswith('/') and 'SNR' in l]
check('every line sits above the music (median SNR >= 7.5 dB)', min(med) >= 7.5, f'min median {min(med)} dB')
print('\nALL CHECKS PASSED' if ok else '\nSOME CHECKS FAILED')
