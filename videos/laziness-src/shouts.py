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
# Laziness shouts (Kevin's own takes): sh_yawn = "Bombo—" + a real Kevin yawn spliced into the silent gap v3 left + "—claaat";
# sh_sleep = "Bom… bo…" trailing off (D13); sh_wake = "…claaat." (the END, finishing the D13 word)
sy = load('audio/sy.mp3'); yw = load('audio/yawn.mp3')
bom = cut(sy, 0.0, 1.12, 0.006, 0.08); yn = cut(yw, 0.12, 1.65, 0.05, 0.25); cl = cut(sy, 1.85, 2.95, 0.03, 0.08)
x = np.concatenate([bom, np.zeros((int(0.05 * SR), 2), np.float32), yn * 0.9, np.zeros((int(0.08 * SR), 2), np.float32), cl])
save('sh_yawn', x)
save('sh_sleep', cut(load('audio/sa.mp3'), 0.0, 2.05, 0.006, 0.25))
save('sh_wake', cut(load('audio/sb.mp3'), 0.05, 1.35, 0.01, 0.12))
Y0 = 1.12 + 0.05; C0 = Y0 + (1.65 - 0.12) + 0.08
words = {'sh_yawn': [('BOMBO—', 0.0), ('*YAAAWN*', round(Y0, 2)), ('—CLAAAT.', round(C0, 2))], 'sh_sleep': [('BOM…', 0.0), ('BO…', 1.4)], 'sh_wake': [('…CLAAAT.', 0.05)]}
json.dump(words, open('audio/shout_words.json', 'w'), indent=1); print(words)
