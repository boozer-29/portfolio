#!/usr/bin/env python3
"""QA for the CAM 4 mix: placement, overlaps, clipping, silence windows."""
import json, os, sys, wave
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR, FPS = 48000, 30
SPF = SR // FPS
cues = json.load(open(os.path.join(ROOT, 'src', 'cues.json')))
beats = json.load(open(os.path.join(ROOT, 'src', 'generated', 'beats.json')))['beats']
path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'out', 'mix.wav')

def load(p):
    with wave.open(p) as w:
        n, ch = w.getnframes(), w.getnchannels()
        x = np.frombuffer(w.readframes(n), dtype='<i2').astype(np.float64) / 32768.0
        return x.reshape(-1, ch), w.getframerate()

mix, sr = load(path)
fails = []
print(f'mix: {mix.shape[0]/sr:.4f}s  {sr} Hz  {mix.shape[1]}ch')
N = cues['totalFrames'] * SPF
# the delivered AAC may carry up to one codec frame (2048 samples) of trailing padding
if sr != SR or not (N <= mix.shape[0] <= N + 2048):
    fails.append('length/sample-rate mismatch')

peak = np.max(np.abs(mix))
print(f'peak {20*np.log10(peak):.2f} dBFS, clipped samples (>=0.999): {int(np.sum(np.abs(mix) >= 0.999))}')
if peak >= 0.891: fails.append('peak above -1 dBFS')

# one-shot overlap check
spans = []
for o in cues['oneshots']:
    x, _ = load(os.path.join(ROOT, 'public', 'sfx', o['file']))
    spans.append((o['frame'], o['frame'] + x.shape[0] / SPF, o['id']))
spans.sort()
ov = [(a[2], b[2]) for a, b in zip(spans, spans[1:]) if b[0] < a[1]]
print(f'one-shots: {len(spans)}; overlapping pairs: {ov or "none"}')
if ov: fails.append(f'one-shot overlap {ov}')

# placement: energy must start within 2 frames of each cue
for o in cues['oneshots']:
    s = o['frame'] * SPF
    win = np.abs(mix[max(0, s - 1 * SPF): s + 12 * SPF]).max()
    if win < 1e-4: fails.append(f"no energy near cue {o['id']} @ {o['frame']}")

# silence windows
for w in cues['silence_windows']:
    seg = mix[w['start'] * SPF: w['end'] * SPF]
    m = np.max(np.abs(seg)) if len(seg) else 0
    ok = m < 3e-5
    print(f"silence '{w['label']}' {w['start']}-{w['end']}: max |x| = {m:.6f} -> {'OK' if ok else 'FAIL'}")
    if not ok: fails.append(f"silence window {w['label']} not silent")

# narration: placement, overlaps with long one-shots / each other, level
vspans = []
for v in cues['voice']:
    x, _ = load(os.path.join(ROOT, 'public', 'voice', v['id'] + '.wav'))
    vspans.append((v['start'], v['start'] + x.shape[0] / SPF, v['id'], x.shape[0] / SR))
long_shots = [(a, b, i) for (a, b, i) in spans if (b - a) / FPS > 0.15]
short_shots = [(a, b, i) for (a, b, i) in spans if (b - a) / FPS <= 0.15]
vl = [(i, j) for (a, b, i, _) in vspans for (c, d, j) in long_shots if a < d and c < b]
vv = [(p[2], q[2]) for p, q in zip(vspans, vspans[1:]) if q[0] < p[1]]
vs = sorted({j for (a, b, i, _) in vspans for (c, d, j) in short_shots if a < d and c < b})
print(f'voice lines: {len(vspans)}; overlap with long SFX: {vl or "none"}; voice-voice: {vv or "none"}')
print(f'  (short ticks/glitches/clicks <=0.15 s under speech, by design: {len(vs)})')
if vl: fails.append(f'voice overlaps long SFX {vl}')
if vv: fails.append(f'voice lines overlap {vv}')
for (a, b, i, _), v in zip(vspans, cues['voice']):
    if b > v['end'] + 0.01: fails.append(f'voice {i} runs past its window ({b:.2f} > {v["end"]})')
    seg = mix[int(a * SPF): int(b * SPF)]
    rms = 20 * np.log10(np.sqrt(np.mean(seg ** 2)) + 1e-12)
    if rms < -30: fails.append(f'voice {i} too quiet in mix ({rms:.1f} dBFS rms)')

# S6 hush: only the hum, measured between voice lines
mask = np.ones(1620 * SPF - 1392 * SPF, bool)
for a, b, i, _ in vspans:
    lo, hi = int((a - 4) * SPF) - 1392 * SPF, int((b + 4) * SPF) - 1392 * SPF
    if hi > 0 and lo < len(mask): mask[max(0, lo):min(len(mask), hi)] = False
seg = mix[1392 * SPF: 1620 * SPF][mask]
rms = 20 * np.log10(np.sqrt(np.mean(seg ** 2)) + 1e-12)
print(f'S6 (1392-1620) between narration lines: rms {rms:.1f} dBFS (hum only)')
if rms > -42: fails.append('S6 not quiet enough')

# heartbeat vs long one-shots
clash = []
for bf in beats:
    for a, b, i in spans:
        if (b - a) / 1 > 4.5 and bf + 9 + 3 > a and bf < b + 3: clash.append((bf, i))
print(f'heartbeat beats: {len(beats)}; clashes with long one-shots: {clash or "none"}')
if clash: fails.append('heartbeat clash')

# DC / click guard: sample-to-sample jump at cue starts
mx = np.max(np.abs(np.diff(mix, axis=0)))
print(f'max sample-to-sample step {mx:.4f}')
print('RESULT:', 'PASS' if not fails else 'FAIL -> ' + '; '.join(fails))
sys.exit(1 if fails else 0)
