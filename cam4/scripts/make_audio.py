#!/usr/bin/env python3
"""Synthesize placeholder SFX + build a sample-accurate mix for CAM 4 Ep.1.

Single source of truth for timing: src/cues.json (frames @30 fps).
Outputs:
  public/sfx/*.wav        individual placeholder files (mono, peak-normalised)
  out/mix.wav             48 kHz stereo master, exactly 1800 frames long
  src/generated/beats.json  heartbeat frames that are actually audible (for visual pulse)
Linear gain only. No compression, no ducking, no limiter: levels are set so nothing clips.
"""
import json, os, wave
import numpy as np

SR = 48000
FPS = 30
SPF = SR // FPS  # 1600 samples per frame
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SFX = os.path.join(ROOT, 'public', 'sfx')
os.makedirs(SFX, exist_ok=True)
os.makedirs(os.path.join(ROOT, 'out'), exist_ok=True)
os.makedirs(os.path.join(ROOT, 'src', 'generated'), exist_ok=True)
rng = np.random.default_rng(1234)


def T(d): return np.arange(int(round(d * SR))) / SR
def db(x): return 10 ** (x / 20.0)


def norm(x, peak=1.0):
    m = np.max(np.abs(x))
    return x * (peak / m) if m > 0 else x


def fbp(x, lo=None, hi=None):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    m = np.ones_like(f)
    if lo: m = m / (1 + (lo / np.maximum(f, 1e-9)) ** 4)
    if hi: m = m / (1 + (f / hi) ** 4)
    return np.fft.irfft(X * m, len(x))


def fades(x, fin=0.002, fout=0.004):
    x = x.copy()
    n = len(x)
    a = min(int(fin * SR), n // 2)
    b = min(int(fout * SR), n // 2)
    if a: x[:a] *= 0.5 - 0.5 * np.cos(np.pi * np.arange(a) / a)
    if b: x[-b:] *= 0.5 + 0.5 * np.cos(np.pi * np.arange(b) / b)
    return x


def sweep(t, f0, f1, tau):
    f = f1 + (f0 - f1) * np.exp(-t / tau)
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def noise(n): return rng.standard_normal(n)


# ---------------------------------------------------------------- one-shots
def s_buzz():
    t = T(0.40); y = np.zeros_like(t)
    for s in (0.0, 0.20):
        i0 = int(s * SR); d = int(0.17 * SR)
        tt = np.arange(d) / SR
        car = np.sin(2 * np.pi * 105 * tt) + 0.5 * np.sin(2 * np.pi * 210 * tt)
        am = 0.65 + 0.35 * np.sign(np.sin(2 * np.pi * 34 * tt))
        am = fbp(am, None, 90)
        e = np.minimum(1, tt / 0.006) * np.minimum(1, (0.17 - tt) / 0.02)
        y[i0:i0 + d] += car * am * e
    return fades(norm(y))


def s_bass():
    t = T(1.3)
    y = sweep(t, 90, 34, 0.06) * np.exp(-t / 0.38)
    y += 0.3 * np.sin(2 * np.pi * 68 * t) * np.exp(-t / 0.16)
    click = fbp(noise(len(t)), 40, 900) * np.exp(-t / 0.004)
    y += 0.25 * click
    return fades(norm(y), 0.001, 0.08)


def s_thud():
    t = T(0.36)
    y = sweep(t, 110, 46, 0.035) * np.exp(-t / 0.09)
    y += 0.4 * fbp(noise(len(t)), 60, 700) * np.exp(-t / 0.012)
    return fades(norm(y), 0.001, 0.05)


def s_knock():
    t = T(0.30)
    y = np.zeros_like(t)
    for f, tau, a in ((185, 0.06, 1.0), (340, 0.04, 0.6), (610, 0.025, 0.35)):
        y += a * np.sin(2 * np.pi * f * t) * np.exp(-t / tau)
    y += 0.5 * fbp(noise(len(t)), 200, 2200) * np.exp(-t / 0.004)
    return fades(norm(y), 0.0008, 0.06)


def s_static():
    n = int(2.0 * SR)
    base = fbp(noise(n), 700, 5200)
    gate = np.ones(n); i = 0
    while i < n:
        L = int(rng.uniform(0.015, 0.07) * SR)
        gate[i:i + L] = rng.uniform(0.12, 1.0); i += L
    pops = np.zeros(n)
    for _ in range(40):
        k = rng.integers(0, n - 200)
        pops[k:k + 120] += rng.uniform(-1, 1) * np.exp(-np.arange(120) / 18)
    env = np.minimum(1, np.arange(n) / (0.08 * SR))
    y = (base * gate + 1.2 * pops) * env
    return fades(norm(y), 0.01, 0.12)


def s_breath():
    t = T(1.3); n = len(t)
    body = fbp(noise(n), 350, 2800)
    env = np.sin(np.pi * np.clip(t / 1.3, 0, 1)) ** 2.2
    trem = 1 + 0.12 * np.sin(2 * np.pi * 5.5 * t)
    return fades(norm(body * env * trem), 0.02, 0.12)


def s_boom():
    t = T(0.90)
    y = sweep(t, 95, 38, 0.10) * np.exp(-t / 0.22)
    y += 0.35 * np.sin(2 * np.pi * 76 * t) * np.exp(-t / 0.12)
    y += 0.2 * fbp(noise(len(t)), 30, 400) * np.exp(-t / 0.02)
    tail = np.where(t > 0.70, 0.5 + 0.5 * np.cos(np.pi * (t - 0.70) / 0.20), 1.0)
    return fades(norm(y * tail), 0.0008, 0.002)


def s_creak():
    t = T(0.90)
    f = 640 + 110 * np.sin(2 * np.pi * 2.6 * t) + 30 * fbp(noise(len(t)), None, 20)
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = sum(np.sin(k * ph) / k for k in (1, 2, 3, 4))
    env = np.sin(np.pi * t / 0.9) ** 2
    return fades(norm(fbp(y, 300, 3500) * env), 0.02, 0.1)


def s_tick():
    t = T(0.05)
    y = fbp(noise(len(t)), 1500, 6500) * np.exp(-t / 0.006)
    return fades(norm(y), 0.0004, 0.01)


def s_flick():
    t = T(0.06)
    y = np.sin(2 * np.pi * 2400 * t) * np.exp(-t / 0.007) + 0.6 * fbp(noise(len(t)), 800, 7000) * np.exp(-t / 0.005)
    return fades(norm(y), 0.0004, 0.012)


def s_glitch():
    n = int(0.09 * SR); y = np.zeros(n); i = 0
    while i < n:
        L = int(rng.uniform(0.004, 0.014) * SR)
        y[i:i + L] = rng.uniform(-1, 1) * (rng.random() > 0.3); i += L
    y += 0.4 * fbp(noise(n), 1200, 6000)
    return fades(norm(y), 0.001, 0.02)


def s_bulbdie():
    t = T(0.28)
    y = 0.7 * fbp(noise(len(t)), 400, 6000) * np.exp(-t / 0.004)
    y += np.sin(2 * np.pi * 120 * t) * np.exp(-t / 0.07)
    y += 0.5 * sweep(t, 2800, 900, 0.05) * np.exp(-t / 0.06)
    return fades(norm(y), 0.0006, 0.06)


def s_nvon():
    t = T(0.40)
    f = 900 + 1700 * (t / 0.4) ** 2
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / 0.4) ** 2
    return fades(norm(y), 0.01, 0.06)


def s_whoosh():
    n = int(0.45 * SR); t = np.arange(n) / SR
    raw = noise(n); out = np.zeros(n)
    for i, (lo, hi) in enumerate(((150, 600), (500, 1600), (1400, 4200))):
        out += fbp(raw, lo, hi) * np.clip((t - i * 0.08) / 0.3, 0, 1) ** 1.5
    out *= (t / 0.45) ** 1.6
    return fades(norm(out), 0.02, 0.03)


def s_rustle():
    n = int(0.55 * SR); t = np.arange(n) / SR
    y = fbp(noise(n), 120, 1900)
    gate = np.abs(fbp(noise(n), None, 14)); gate = gate / gate.max()
    env = np.sin(np.pi * t / 0.55) ** 1.5
    return fades(norm(y * (0.35 + gate) * env), 0.02, 0.1)


def s_heartbeat():
    t = T(0.30); y = np.zeros_like(t)
    for s, f, a, tau in ((0.0, 56, 1.0, 0.045), (0.13, 48, 0.7, 0.04)):
        i0 = int(s * SR); tt = t[:len(t) - i0]
        y[i0:] += a * np.sin(2 * np.pi * f * tt) * np.exp(-tt / tau) * np.minimum(1, tt / 0.004)
    return fades(norm(fbp(y, 25, 180)), 0.001, 0.04)


def s_drone(dur=40.0):
    t = T(dur); n = len(t)
    def side(detune):
        vib = 1 + 0.004 * np.sin(2 * np.pi * 0.17 * t)
        a = np.sin(2 * np.pi * np.cumsum(55.0 * vib) / SR)
        b = 0.5 * np.sin(2 * np.pi * np.cumsum(82.41 * vib + detune) / SR)
        c = 0.3 * np.sin(2 * np.pi * np.cumsum(110.0 * vib + detune * 2) / SR)
        r = 0.5 * fbp(noise(n), 25, 130)
        return a + b + c + r
    swell = 1 + 0.25 * np.sin(2 * np.pi * 0.07 * t)
    st = np.stack([side(0.0) * swell, side(0.35) * swell], axis=1)
    return st / np.max(np.abs(st))


def s_hum(dur=12.0):
    t = T(dur); n = len(t)
    y = np.sin(2 * np.pi * 100 * t) + 0.3 * np.sin(2 * np.pi * 200 * t) + 0.05 * fbp(noise(n), 450, 700)
    y = y / np.max(np.abs(y))
    return np.stack([y, y], axis=1)


MONO = {
    'buzz': s_buzz, 'bass': s_bass, 'thud': s_thud, 'knock': s_knock, 'static': s_static,
    'breath': s_breath, 'boom': s_boom, 'creak': s_creak, 'tick': s_tick, 'flick': s_flick,
    'glitch': s_glitch, 'bulbdie': s_bulbdie, 'nvon': s_nvon, 'whoosh': s_whoosh,
    'rustle': s_rustle, 'heartbeat': s_heartbeat,
}


def write_wav(path, x):
    x = np.asarray(x)
    if x.ndim == 1: x = x[:, None]
    # TPDF dither at 16-bit, then clip-safe quantise
    d = (rng.random(x.shape) - rng.random(x.shape)) / 32768.0
    d = d * (np.abs(x) > 0)  # never dither digital silence: hard silence must be exact zeros
    q = np.clip(np.round((x + d) * 32767.0), -32768, 32767).astype('<i2')
    with wave.open(path, 'wb') as w:
        w.setnchannels(x.shape[1]); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(q.tobytes())


def main():
    cues = json.load(open(os.path.join(ROOT, 'src', 'cues.json')))
    lib = {}
    for name, fn in MONO.items():
        y = fn(); lib[name] = y
        write_wav(os.path.join(SFX, f'{name}.wav'), y * db(-1.0))
    drone = s_drone(); hum = s_hum()
    write_wav(os.path.join(SFX, 'drone.wav'), drone * db(-1.0))
    write_wav(os.path.join(SFX, 'hum.wav'), hum * db(-1.0))
    lib['drone'], lib['hum'] = drone, hum

    N = cues['totalFrames'] * SPF
    mix = np.zeros((N, 2))

    def put(x, start_sample, gain):
        if x.ndim == 1: x = np.stack([x, x], axis=1)
        end = min(N, start_sample + len(x))
        if end > start_sample: mix[start_sample:end] += x[:end - start_sample] * gain

    # beds
    for b in cues['beds']:
        need = (b['end'] - b['start']) * SPF
        src = lib[b['file'].replace('.wav', '')]
        assert len(src) >= need, f"bed {b['id']} source too short"
        x = src[:need].copy()
        rms = np.sqrt(np.mean(x ** 2))
        x *= db(b['rms_db']) / rms
        fi, fo = b['fade_in'] * SPF, b['fade_out'] * SPF
        env = np.ones(need)
        env[:fi] = (0.5 - 0.5 * np.cos(np.pi * np.arange(fi) / fi))
        env[-fo:] = (0.5 + 0.5 * np.cos(np.pi * np.arange(fo) / fo))
        put(x * env[:, None], b['start'] * SPF, 1.0)

    # one-shots (peak-normalised then placed at exact frame)
    spans = []
    for o in cues['oneshots']:
        src = lib[o['file'].replace('.wav', '')]
        y = src * db(o['peak_db'])
        put(y, o['frame'] * SPF, 1.0)
        spans.append((o['frame'], o['frame'] + len(src) / SPF, len(src) / SR))

    # heartbeat: skip beats that would overlap a long (>0.15 s) one-shot
    hb = cues['heartbeat']; hbs = lib['heartbeat']; hb_dur = len(hbs) / SPF
    played, skipped = [], []
    smooth = lambda u: u * u * (3 - 2 * u)
    for seg in hb['segments']:
        f = float(seg['start'])
        while f <= seg['end']:
            u = (f - seg['start']) / max(1, seg['end'] - seg['start'])
            bpm = seg['bpm0'] + (seg['bpm1'] - seg['bpm0']) * smooth(min(1, u))
            clash = any(dur > 0.15 and f + hb_dur + 3 > a and f < b + 3 for a, b, dur in spans)
            (skipped if clash else played).append(round(f, 3))
            f += 60.0 / bpm * FPS
    for f in played:
        put(hbs * db(hb['peak_db']), int(round(f * SPF)), 1.0)
    json.dump({'beats': played}, open(os.path.join(ROOT, 'src', 'generated', 'beats.json'), 'w'))

    peak = np.max(np.abs(mix))
    print(f'heartbeat beats played {len(played)}, skipped (clash) {len(skipped)}')
    print(f'master peak before safety: {20*np.log10(peak):.2f} dBFS')
    if peak > db(-1.0):
        mix *= db(-1.0) / peak
        print('applied single linear safety gain to hold -1 dBFS')
    write_wav(os.path.join(ROOT, 'out', 'mix.wav'), mix)
    print('wrote out/mix.wav', mix.shape, f'{mix.shape[0]/SR:.3f}s')


if __name__ == '__main__':
    main()
