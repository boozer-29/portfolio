# Drip v2 shouts (Kevin's own takes from gen_tts.py), trimmed and shaped. Only two in the episode, both new deliveries:
#  sh_whisper: whispered "bomboclaat" in the gallery + its "…claat… claat…" echo off the walls
#  sh_squeak:  "bomboclaat?" whose second half cracks up in pitch (asetrate ×1.3)
#  h5c: "Sorry, boss." without the TTS's 1 s lead-in
import json, subprocess, numpy as np
SR = 44100
def load(p, rate=None):
    af = ['-af', f'asetrate={int(SR*rate)},aresample={SR}'] if rate else []
    return np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', p, *af, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout, np.float32).reshape(-1, 2).copy()
def save(name, x): subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s16le', f'audio/{name}.wav'], input=x.astype(np.float32).tobytes(), check=True); print(name, round(len(x) / SR, 2), 's')
def cut(a, t0, t1, fi=0.006, fo=0.02):
    x = a[int(t0 * SR):int(t1 * SR)].copy(); n1, n2 = int(fi * SR), int(fo * SR)
    if n1: x[:n1] *= np.linspace(0, 1, n1)[:, None]
    if n2: x[-n2:] *= np.linspace(1, 0, n2)[:, None]
    return x
kw = cut(load('audio/kw.mp3'), 0.82, 1.82, 0.01, 0.05); claat = cut(load('audio/kw.mp3'), 1.36, 1.82, 0.03, 0.08)
out = np.zeros((len(kw) + int(1.5 * SR), 2), np.float32); out[:len(kw)] += kw
for i, (d, g) in enumerate([(0.55, -8), (1.05, -15)]):   # two echoes of "claat", each softer and duller
    e = claat * 10 ** (g / 20); e = np.convolve(e[:, 0], np.ones(6) / 6, 'same')[:, None].repeat(2, 1)
    s = int((0.54 + d - 0.0) * SR); out[s:s + len(e)] += e
for d, g in [(0.06, -12), (0.13, -16), (0.21, -20)]:      # small room tail
    s = int(d * SR); out[s:] += out[:len(out) - s] * 10 ** (g / 20) * 0.5
save('sh_whisper', out[:int(2.35 * SR)])
a = cut(load('audio/ksq.mp3'), 0.0, 0.62, 0.004, 0.01); b = cut(load('audio/ksq.mp3', 1.3), 0.62 / 1.3, 1.26 / 1.3, 0.004, 0.04)
save('sh_squeak', np.concatenate([a, b]))
save('h5c', cut(load('audio/h5.mp3'), 1.0, 2.0, 0.01, 0.03))
words = {'sh_whisper': [('bomboclaat…', 0.0), ('…claat', 1.09), ('…claat', 1.59)], 'sh_squeak': [('BOMBO-', 0.0), ('CLAAT?!', 0.55)], 'h5c': [('Sorry,', 0.0), ('boss.', 0.45)]}
json.dump(words, open('audio/shout_words.json', 'w'), indent=1); print(words)
