# BOMBOCLAT variants in the hero's own voice (Kevin, eleven_v3 takes kq/ks/kl/kr from gen_tts.py), trimmed and shaped.
# The long scream is shaped into a crescendo (starts ~14 dB down, swells to full) and ends on a hard cut at its loudest.
import json, subprocess, numpy as np
SR = 44100
def load(p): return np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout, np.float32).reshape(-1, 2).copy()
def save(name, x): subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s16le', f'audio/{name}.wav'], input=x.astype(np.float32).tobytes(), check=True); print(name, round(len(x) / SR, 2), 's')
def cut(a, t0, t1, fi=0.006, fo=0.02):
    x = a[int(t0 * SR):int(t1 * SR)].copy(); n1, n2 = int(fi * SR), int(fo * SR)
    if n1: x[:n1] *= np.linspace(0, 1, n1)[:, None]
    if n2: x[-n2:] *= np.linspace(1, 0, n2)[:, None]
    return x
W = lambda f: [(w['w'], w['s']) for w in json.load(open(f'audio/{f}.whisper.json'))['words']]
Z = lambda d: np.zeros((int(d * SR), 2), np.float32)
save('sh_question', cut(load('audio/kq.mp3'), 0.08, 1.12))
ks = load('audio/ks.mp3')   # trim the 1.1 s gap before the final "bomboclaaat" to 0.3 s
save('sh_stutter', np.concatenate([cut(ks, 0.02, 0.82), Z(0.25), cut(ks, 1.28, 2.22), Z(0.3), cut(ks, 3.28, 5.1)]))
kl = cut(load('audio/kl.mp3'), 0.10, 2.40, 0.004, 0.003); n = len(kl); kl *= (10 ** (np.linspace(-14, 0, n) / 20))[:, None]
save('sh_long', kl)
save('sh_resigned', cut(load('audio/kr.mp3'), 0.1, 2.1))
words = {'sh_question': [('BOMBOCLAAT?', 0.0)], 'sh_long': [('BOMBOOOOOOOOO—', 0.0)],
         'sh_stutter': [('BOMBO…', 0.0), ('BOMBO…', 1.05), ('BOMBOCLAAAT!', 2.29)],
         'sh_resigned': [('hmm…', 0.0), ('bomboclaat.', 1.0)]}
json.dump(words, open('audio/shout_words.json', 'w'), indent=1); print(words)
