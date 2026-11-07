#!/usr/bin/env python3
"""Transcribe the DELIVERED audio (full mix: voice + SFX + beds) inside each narration window and
compare it with the script. Run with the voice venv:  .venv-voice/bin/python scripts/check_voice.py"""
import json, os, re, sys, wave
os.environ.setdefault('HF_HUB_DISABLE_XET', '1')
import numpy as np
from faster_whisper import WhisperModel

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR, FPS = 48000, 30
path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'out', 'delivered_audio.wav')
cues = json.load(open(os.path.join(ROOT, 'src', 'cues.json')))
with wave.open(path) as w:
    x = np.frombuffer(w.readframes(w.getnframes()), dtype='<i2').reshape(-1, w.getnchannels()).astype(np.float64) / 32768.0
m = x.mean(axis=1)

def to16k(a):
    n = int(round(len(a) * 16000 / SR)); X = np.fft.rfft(a); Y = np.zeros(n // 2 + 1, complex)
    k = min(len(X), len(Y)); Y[:k] = X[:k]; return (np.fft.irfft(Y, n) * (n / len(a))).astype(np.float32)

EXPAND = {"they're": 'they are', "can't": 'cannot', "don't": 'do not', "chain's": 'chains', "city's": 'city is', 'cities': 'city is'}
def nw(t):
    t = t.lower().replace('...', ' ')
    for k, r in EXPAND.items(): t = t.replace(k, r)
    return re.sub(r"[^a-z0-9 ]", ' ', t).replace('three', '3').replace('two', '2').split()

asr = WhisperModel('small.en', device='cpu', compute_type='int8')
bad = 0
for v in cues['voice']:
    a = int((v['start'] - 6) * SR / FPS); b = int((v['end'] + 6) * SR / FPS)
    segs, _ = asr.transcribe(to16k(m[max(0, a):b]), language='en', beam_size=5)
    heard = ' '.join(s.text.strip() for s in segs)
    ok = nw(heard) == nw(v['text'])
    bad += not ok
    print(f"{v['id']} {'OK ' if ok else 'BAD'} | {v['text']!r:44} | heard: {heard!r}")
print(f"\n{len(cues['voice']) - bad}/{len(cues['voice'])} lines transcribe to the script in the finished mix")
sys.exit(1 if bad else 0)
