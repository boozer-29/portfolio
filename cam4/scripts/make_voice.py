#!/usr/bin/env python3
"""Narration for CAM 4 Ep.1 (Piper 'ryan-high' neural voice).

For every line in src/cues.json "voice":
  1. synthesize, trim silence so speech starts exactly at the cue frame,
  2. auto-fit: if the line is longer than its window, speed it up (never past x0.72) -
     windows were chosen to sit BETWEEN loud sound effects so voice and SFX never overlap,
  3. light cleanup (80 Hz high-pass, gentle presence lift), level to the cue's peak target,
  4. word-level timestamps via faster-whisper -> src/generated/voice_words.json,
     so on-screen captions pop in on the actual spoken words.
Outputs: public/voice/<id>.wav (48 kHz mono), src/generated/voice_words.json
"""
import json, os, re, wave
os.environ.setdefault('HF_HUB_DISABLE_XET', '1')  # sandbox blocks the Xet host; plain LFS works
import numpy as np
from piper import PiperVoice
from piper.config import SynthesisConfig

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR, FPS, SPF = 48000, 30, 1600
cues = json.load(open(os.path.join(ROOT, 'src', 'cues.json')))
voice = PiperVoice.load(os.path.join(ROOT, 'voice_models', 'en_US-ryan-high.onnx'))
SRC = voice.config.sample_rate
os.makedirs(os.path.join(ROOT, 'public', 'voice'), exist_ok=True)
os.makedirs(os.path.join(ROOT, 'src', 'generated'), exist_ok=True)


def synth(text, scale, whisper):
    cfg = SynthesisConfig(length_scale=scale, noise_scale=0.5 if whisper else 0.6, noise_w_scale=0.6 if whisper else 0.75)
    return np.concatenate([c.audio_float_array for c in voice.synthesize(text, syn_config=cfg)]).astype(np.float64)


def resample(x, a, b):
    n = int(round(len(x) * b / a))
    X = np.fft.rfft(x)
    m = n // 2 + 1
    Y = np.zeros(m, dtype=complex)
    k = min(len(X), m)
    Y[:k] = X[:k]
    return np.fft.irfft(Y, n) * (n / len(x))


def trim(x, thr_db=-46, pad=0.006):
    thr = 10 ** (thr_db / 20) * np.max(np.abs(x))
    idx = np.where(np.abs(x) > thr)[0]
    a = max(0, idx[0] - int(pad * SR)); b = min(len(x), idx[-1] + int(0.02 * SR))
    return x[a:b]


def fbp(x, lo=None, hi=None):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); m = np.ones_like(f)
    if lo: m = m / (1 + (lo / np.maximum(f, 1e-9)) ** 4)
    if hi: m = m / (1 + (f / hi) ** 4)
    return np.fft.irfft(X * m, len(x))


def write(path, x):
    q = np.clip(np.round(x * 32767), -32768, 32767).astype('<i2')
    with wave.open(path, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(q.tobytes())


from faster_whisper import WhisperModel
asr = WhisperModel('small.en', device='cpu', compute_type='int8')
EXPAND = {"they're": 'they are', "can't": 'cannot', "don't": 'do not', "chain's": 'chains', "city's": 'city is', 'cities': 'city is'}


def norm_words(t):
    t = t.lower().replace('...', ' ')
    for k, r in EXPAND.items(): t = t.replace(k, r)
    t = re.sub(r"[^a-z0-9 ]", ' ', t).replace('three', '3').replace('two', '2')
    return t.split()


def transcribe(a16):
    segs, _ = asr.transcribe(a16, word_timestamps=True, language='en', beam_size=5)
    return [w for s in segs for w in s.words]


def render(v, scale):
    window = (v['end'] - v['start']) / FPS
    for _ in range(5):
        x = trim(resample(synth(v['text'], scale, v['whisper']), SRC, SR))
        dur = len(x) / SR
        if dur <= window * 0.97 or scale <= 0.72: break
        scale = max(0.72, scale * (window * 0.95) / dur)
    return x, scale


report = {}
audio16 = {}
asr_words = {}
for v in cues['voice']:
    window = (v['end'] - v['start']) / FPS
    scale = v.get('scale', 1.08 if v['whisper'] else 1.0)
    for attempt in range(1, 9):  # keep the first take the transcriber hears as exactly the script
        x, sc = render(v, scale)
        ws = transcribe(resample(x, SR, 16000).astype(np.float32))
        if norm_words(' '.join(w.word for w in ws)) == norm_words(v['text']):
            break
    scale = sc
    asr_words[v['id']] = (ws, attempt)
    x = fbp(x, 80, None)
    # gentle presence lift (1.5-4 kHz) so the voice reads over drone/heartbeat
    x = x + 0.18 * fbp(x, 1500, 4000)
    if v['whisper']:
        x = fbp(x, 110, 7500)
    x = x / np.max(np.abs(x)) * 10 ** (v['peak_db'] / 20)
    n = int(0.008 * SR)
    x[:n] *= np.linspace(0, 1, n); x[-n:] *= np.linspace(1, 0, n)
    write(os.path.join(ROOT, 'public', 'voice', f"{v['id']}.wav"), x)
    audio16[v['id']] = resample(x, SR, 16000).astype(np.float32)
    ok = len(x) / SR <= window + 1e-6
    report[v['id']] = {'dur': round(len(x) / SR, 3), 'window': round(window, 3), 'scale': round(scale, 3), 'fits': ok}
    print(f"{v['id']}  {len(x)/SR:5.2f}s / window {window:4.2f}s  scale {scale:.2f}  {'OK' if ok else 'TOO LONG'}  {v['text']}")

bad = [k for k, r in report.items() if not r['fits']]
if bad:
    raise SystemExit(f'lines do not fit their windows: {bad} - shorten the text or widen the window in cues.json')

# word timestamps -> captions (taken from the verified take)
words = {}
for v in cues['voice']:
    ws, attempt = asr_words[v['id']]
    heard = ' '.join(w.word.strip() for w in ws)
    ok = norm_words(heard) == norm_words(v['text'])
    words[v['id']] = {
        'start': v['start'], 'text': v['text'], 'asr': heard, 'takes': attempt, 'verified': ok,
        'frames': [round(v['start'] + w.start * FPS, 2) for w in ws],
        'ends': [round(v['start'] + w.end * FPS, 2) for w in ws],
    }
    print(v['id'], f'| take {attempt} | heard: {heard}', '' if ok else '   <-- NOT VERIFIED')
json.dump(words, open(os.path.join(ROOT, 'src', 'generated', 'voice_words.json'), 'w'), indent=1)
json.dump(report, open(os.path.join(ROOT, 'out', 'voice_report.json'), 'w'), indent=1)
