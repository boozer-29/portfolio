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
# Luck shouts (Kevin's own takes, no pitch shift):
#  sh_laugh: "haha— BOMBO— hahaha —CLAAAT!" (D5, buried in teddies): the last second of the laugh-in, "Bombo", a short laugh, "Claaat"
#  sh_choir: "HALLELUJAH! BOMBOCLAAAT!" sung (D26, the balls match), with a church-hall echo (the echo is the gag)
sl = load('audio/sl.mp3')
A = cut(sl, 2.55, 4.15, 0.08, 0.02); B = cut(sl, 5.65, 8.12, 0.01, 0.12); g = 0.03
save('sh_laugh', np.concatenate([A, np.zeros((int(g * SR), 2), np.float32), B]))
B0 = len(A) / SR + g
sc = load('audio/sc.mp3'); x = cut(sc, 0.08, 5.0, 0.01, 0.3)
wet = np.zeros((len(x) + int(0.9 * SR), 2), np.float32); wet[:len(x)] += x
for dt, k in ((0.09, 0.16), (0.21, 0.09), (0.36, 0.05)): i = int(dt * SR); wet[i:i + len(x)] += x * k
save('sh_choir', wet / max(1.0, np.abs(wet).max() / 0.95))
words = {'sh_laugh': [('HAHA—', 0.0), ('BOMBO—', round(3.37 - 2.55, 2)), ('HAHAHA—', round(B0, 2)), ('CLAAAT!', round(B0 + 6.53 - 5.65, 2))],
         'sh_choir': [('HALLELUJAH!', 0.07), ('BOMBOCLAAAT!', round(2.67 - 0.08, 2))]}
json.dump(words, open('audio/shout_words.json', 'w'), indent=1); print(words)
