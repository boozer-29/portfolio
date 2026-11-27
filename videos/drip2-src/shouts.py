# Drip v2 shouts (Kevin's own takes from gen_tts.py), trimmed and shaped. Only two in the episode, both new deliveries:
#  sh_whisper: a quiet, stunned "bomboclaat…" in the gallery + its "…claat… claat…" echo off the walls
#  sh_squeak:  the outraged, dragged-out "BOMBOCLAAAAAT?!" at the end (no pitch shifting: it must stay Kevin's voice)
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
kg = load('audio/kgb.mp3'); main = cut(kg, 0.08, 1.5, 0.01, 0.06); claat = cut(kg, 0.68, 1.5, 0.03, 0.08)   # Kevin's own voiced take, no pitch change
out = np.zeros((len(main) + int(1.5 * SR), 2), np.float32); out[:len(main)] += main
for d, g in [(0.62, -9), (1.12, -16)]:   # the gallery throws "…claat" back twice, softer and duller
    e = claat * 10 ** (g / 20); e = np.convolve(e[:, 0], np.ones(6) / 6, 'same')[:, None].repeat(2, 1); s0 = int((0.6 + d) * SR); out[s0:s0 + len(e)] += e[:len(out) - s0]
for d, g in [(0.06, -12), (0.13, -16), (0.21, -20)]:
    s0 = int(d * SR); out[s0:] += out[:len(out) - s0] * 10 ** (g / 20) * 0.5
save('sh_whisper', out[:int(2.6 * SR)])
save('sh_squeak', cut(load('audio/keb.mp3'), 0.12, 2.0, 0.006, 0.04))   # outraged, dragged-out, Kevin's own pitch
save('h5c', cut(load('audio/h5.mp3'), 1.0, 2.0, 0.01, 0.03))
words = {'sh_whisper': [('bomboclaat…', 0.0), ('…claat', 1.22), ('…claat', 1.72)], 'sh_squeak': [('BOMBO-', 0.03), ('CLAAAAAT?!', 0.88)], 'h5c': [('Sorry,', 0.0), ('boss.', 0.45)]}
json.dump(words, open('audio/shout_words.json', 'w'), indent=1); print(words)
