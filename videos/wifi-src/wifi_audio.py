# Wi-Fi episode mix: music bed cut to the story, an SFX for every consequence, 4 shout variants + the voicemail -> mix.wav + dialogue.json
import json, os, subprocess, numpy as np
D = os.path.dirname(os.path.abspath(__file__)); VA = os.path.join(D, 'audio'); REPO = os.path.join(D, '..', 'assets', 'audio')
TLJ = json.load(open(os.path.join(D, 'timeline.json'))); SR = 44100; DUR = TLJ['DUR']; N = int(DUR * SR)
TS = {s['day']: s for s in TLJ['steps']}
SIL = (TS['END']['t0'] - 0.6, TS['END']['t0'])
def load(path, af=''):
    cmd = ['ffmpeg', '-v', 'error', '-i', path, '-af', (af + ',' if af else '') + 'aformat=sample_fmts=flt:sample_rates=44100:channel_layouts=stereo', '-f', 'f32le', '-']
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, dtype=np.float32).reshape(-1, 2).copy()
def edge(a, fi=0.006, fo=0.006):
    n1, n2 = int(fi * SR), int(fo * SR)
    if n1: a[:n1] *= np.linspace(0, 1, n1)[:, None]
    if n2: a[-n2:] *= np.linspace(1, 0, n2)[:, None]
    return a
def place(bus, a, t, gdb=0.0):
    i = int(round(t * SR)); a = a * (10 ** (gdb / 20)); j = min(N, i + len(a))
    if i < N: bus[i:j] += a[:j - i]
def env_db(x, win=0.02, hop=0.01):
    m = x.mean(1) if x.ndim == 2 else x; w, h = int(win * SR), int(hop * SR); nh = len(m) // h
    return np.array([20 * np.log10(np.sqrt(np.mean(m[k * h:k * h + w] ** 2)) + 1e-12) for k in range(nh)])
def db(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)
def onset(a): e = env_db(a); return float(np.argmax(e > e.max() - 30) * 0.01)
def words_of(js, off):
    al = json.load(open(js)); ch, st = al['characters'], al['character_start_times_seconds']; words, cur, t0, depth = [], '', None, 0
    for c, s in zip(ch, st):
        if c == '[': depth += 1; continue
        if c == ']': depth -= 1; continue
        if depth: continue
        if c.isspace():
            if cur.strip(): words.append({'w': cur.strip(), 't': round(t0 + off, 3)})
            cur, t0 = '', None; continue
        if t0 is None: t0 = s
        cur += c
    if cur.strip(): words.append({'w': cur.strip(), 't': round(t0 + off, 3)})
    return words
# ---------------- voices: shouts (pre-built variants) + the voicemail
SHOUT_WORDS = {'sh_question': [('BOMBOCLAAT?', 0)], 'sh_stutter': [('BOMBO…', 0), ('BOMBO…', 0.68), ('BOMBOCLAAT!', 1.32)], 'sh_long': [('BOMBOOOOOOO—', 0)], 'sh_resigned': [('hmm…', 0), ('bomboclaat.', 1.13)]}
voice = np.zeros((N, 2), np.float32); dry = []; DLG = []
PAUSES = TLJ['PAUSES']
for s in TLJ['steps']:
  for a in s['audio']:
    f = a['file']
    if f.startswith('sh_'):
        x = edge(load(f"{VA}/{f}.wav", 'acompressor=threshold=-24dB:ratio=4:attack=4:release=90:makeup=1'), 0.008, 0.003 if f == 'sh_long' else 0.03)
        on = onset(x); at = a['at'] - on; e = env_db(x); act = e > e.max() - 30; hop = int(0.01 * SR); sp_ = np.concatenate([x[k * hop:(k + 1) * hop] for k in np.where(act)[0]]); g = -15.0 - db(sp_); x *= 10 ** (min(g, -1.5 - 20 * np.log10(np.abs(x).max() + 1e-12)) / 20)
        words = [{'w': w, 't': round(a['at'] + dt, 3)} for w, dt in SHOUT_WORDS[f]]; spk, kind = 'hero', 'shout'
    else:
        af = ('highpass=f=300,lowpass=f=3400,' if f == 'isp' else '') + 'acompressor=threshold=-26dB:ratio=2.5:attack=6:release=120:makeup=1'
        x = load(f'{VA}/{f}.mp3', af); sp, d = PAUSES.get(f, (None, 0))
        if sp: i = int(sp * SR); x = np.concatenate([x[:i], np.zeros((int(d * SR), 2), np.float32), x[i:]])
        cut = TLJ.get('CUTS', {}).get(f)
        if cut: x = np.concatenate([x[:int(cut[0] * SR)], x[int(cut[1] * SR):]])
        x = edge(x, 0.03, 0.03); at = a['at']; g = -18.0 - db(x[np.abs(x).max(1) > 0.01]); x *= 10 ** (g / 20)
        words = words_of(f'{VA}/{f}.json', at)
        if sp:
            for w in words:
                if w['t'] >= at + sp: w['t'] = round(w['t'] + d, 3)
        if cut:
            for w in words:
                if w['t'] >= at + cut[1]: w['t'] = round(w['t'] - (cut[1] - cut[0]), 3)
        spk, kind = ('isp' if f == 'isp' else 'hero'), 'line'
    tr = np.zeros((N, 2), np.float32); place(tr, x, at); dry.append(tr.copy()); voice += tr
    DLG.append({'file': f, 'speaker': spk, 'at': round(at, 3), 'kind': kind, 'words': words})
# ---------------- music: TIKI TIKI, muffled under the title, in on Day 1, silence before the ending, last section for the punchline
TIKI = os.path.join(D, '..', 'assets', 'music', 'tiki_tiki.mp3'); music = np.zeros((N, 2), np.float32)
place(music, edge(load(TIKI, 'atrim=1.0:4.2,asetpts=PTS-STARTPTS,lowpass=f=650,lowpass=f=650,volume=2dB,afade=t=out:st=2.9:d=0.3'), 0.3, 0.01), 0.0)
place(music, edge(load(TIKI, f"atrim=8.0:{8.0 + SIL[0] - 3.0 + 0.2},asetpts=PTS-STARTPTS"), 0.004, 0.05), 3.0)
place(music, edge(load(TIKI, f"atrim=57.0:{57.0 + DUR - SIL[1]},asetpts=PTS-STARTPTS,afade=t=out:st={DUR - SIL[1] - 1.4}:d=1.4"), 0.2, 0.02), SIL[1] + 0.05)
music *= 0.3
rng = np.random.default_rng(5)
def bp(x, lo, hi): X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X[(f < lo) | (f > hi)] = 0; return np.fft.irfft(X, len(x))
def envl(n, a=0.004, d=0.25): t = np.arange(n) / SR; return np.minimum(t / a, 1) * np.exp(-t / d)
def st(x): x = np.asarray(x, np.float32); return np.stack([x, x], 1)
def boing(): n = int(0.6 * SR); t = np.arange(n) / SR; f = 180 + 520 * (1 - np.exp(-t * 9)); ph = 2 * np.pi * np.cumsum(f * (1 + 0.08 * np.sin(2 * np.pi * 14 * t))) / SR; return st(np.sin(ph) * envl(n, 0.003, 0.22) * 0.55)
def rip(): n = int(0.42 * SR); x = bp(rng.standard_normal(n), 900, 6500); c = np.convolve((rng.random(n) < 0.004).astype(float), np.ones(60), 'same'); return st(x * (0.4 + c) * envl(n, 0.002, 0.18) * 0.45)
def thud(f=60, d=0.14, g=1.0): n = int(0.5 * SR); t = np.arange(n) / SR; return st((np.sin(2 * np.pi * f * t) + 0.4 * bp(rng.standard_normal(n), 60, 500)) * envl(n, 0.002, d) * g)
def step(): n = int(0.12 * SR); return st(bp(rng.standard_normal(n), 60, 700) * envl(n, 0.002, 0.03) * 0.8)
def creak(dur): n = int(dur * SR); t = np.arange(n) / SR; saw = 2 * ((95 * t + 0.3 * np.sin(2 * np.pi * 3.5 * t)) % 1) - 1; return st(bp(saw, 150, 1800) * (0.5 + 0.5 * np.sin(2 * np.pi * 3.5 * t)) * np.minimum(t / 0.2, 1) * np.minimum((dur - t) / 0.2, 1) * 0.16)
def crash(): n = int(0.9 * SR); t = np.arange(n) / SR; return st((bp(rng.standard_normal(n), 200, 5000) * 0.55 + np.sin(2 * np.pi * 55 * t)) * envl(n, 0.002, 0.25) * 0.8)
def wood(): n = int(0.5 * SR); x = bp(rng.standard_normal(n), 300, 4000); c = np.convolve((rng.random(n) < 0.01).astype(float), np.ones(40), 'same'); return st((x * (0.3 + c) * envl(n, 0.001, 0.12) + thud(80, 0.1, 0.6)[:, 0]) * 0.7)
def ding(f=1320): n = int(0.8 * SR); t = np.arange(n) / SR; return st((np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 2.01 * t) + 0.2 * np.sin(2 * np.pi * f * 3.0 * t)) * envl(n, 0.002, 0.25) * 0.22)
def bubble(): n = int(0.12 * SR); t = np.arange(n) / SR; f = 600 + 1800 * t / 0.12; return st(np.sin(2 * np.pi * np.cumsum(f) / SR) * envl(n, 0.001, 0.03) * 0.25)
def horn(f=420, d=0.45): n = int(d * SR); t = np.arange(n) / SR; x = np.sign(np.sin(2 * np.pi * f * t)) * 0.5 + np.sign(np.sin(2 * np.pi * f * 1.26 * t)) * 0.5; return st(bp(x, 200, 3000) * np.minimum(t / 0.01, 1) * np.minimum((d - t) / 0.03, 1) * 0.12)
def click(): n = int(0.03 * SR); return st(bp(rng.standard_normal(n), 2000, 8000) * envl(n, 0.0005, 0.004) * 0.5)
def lib(name): return edge(load(f'{REPO}/sfx/{name}.mp3'), 0.002, 0.02)
def ping(f): n = int(0.35 * SR); t = np.arange(n) / SR; fr = f * (1 + 0.5 * np.exp(-t * 30)); return st(np.sin(2 * np.pi * np.cumsum(fr) / SR) * envl(n, 0.001, 0.07) * 0.3)
def noise(dur, lo, hi, g, a=0.4, d=0.5): n = int(dur * SR); t = np.arange(n) / SR; return st(bp(rng.standard_normal(n), lo, hi) * np.minimum(t / a, 1) * np.minimum((dur - t) / d, 1) * g)
def rise(dur=0.9, f0=300, f1=2600): n = int(dur * SR); t = np.arange(n) / SR; f = f0 * (f1 / f0) ** (t / dur); return st(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.minimum(t / 0.02, 1) * (1 - t / dur) ** 0.6 * 0.2)
def drum(f0, f1, d=0.22, g=0.9): n = int(0.4 * SR); t = np.arange(n) / SR; f = f1 + (f0 - f1) * np.exp(-t * 14); return st((np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.25 * bp(rng.standard_normal(n), 300, 2500)) * envl(n, 0.002, d) * g)
def drone(dur, lvl): n = int(dur * SR); t = np.arange(n) / SR; saw = 2 * ((88 * t) % 1) - 1; x = bp(saw, 70, 900) * 0.5 + bp(rng.standard_normal(n), 100, 600) * 0.25; return st(x * lvl(t) * np.minimum(t / 0.1, 1) * 0.35)
def rattle(dur): n = int(dur * SR); t = np.arange(n) / SR; return st(bp(rng.standard_normal(n), 900, 5000) * (np.sin(2 * np.pi * 24 * t) > 0.2) * np.minimum(t / 0.1, 1) * 0.18)
def boil(dur): n = int(dur * SR); t = np.arange(n) / SR; return st(bp(rng.standard_normal(n), 120, 700) * 0.1 * np.minimum(t / 0.2, 1) * np.minimum((dur - t) / 0.2, 1))
sfx = np.zeros((N, 2), np.float32)
def whoosh_up(dur=1.4):
    n = int(dur * SR); t = np.arange(n) / SR; x = rng.standard_normal(n); out = np.zeros(n)
    for k in range(0, n, 2048): f = 400 + 5000 * (k / n); out[k:k + 2048] = bp(x[k:k + 2048], f * 0.6, f * 1.4)
    return st(out * np.minimum(t / 0.5, 1) * np.minimum((dur - t) / 0.4, 1) * 0.12)
for s in TLJ['steps']:
    if s['day'] != 'END': place(sfx, lib('pop'), s['t0'] - 0.04, -2); place(sfx, whoosh_up(1.5), s['t0'] + 0.1, -4)
T = lambda d: TS[d]['t0']
for k in range(3): place(sfx, thud(140, 0.05, 0.5), T(1) + 0.6 + k * 0.45)
place(sfx, noise(0.2, 1500, 6000, 0.05, 0.005, 0.15), T(1) + 7.0)
place(sfx, noise(0.25, 2000, 7000, 0.06, 0.005, 0.2), T(3) + 1.5); place(sfx, noise(0.3, 600, 3000, 0.05, 0.01, 0.2), T(3) + 1.6); place(sfx, noise(0.25, 2000, 7000, 0.06, 0.005, 0.2), T(3) + 3.0); place(sfx, noise(0.8, 1500, 5000, 0.035, 0.05, 0.4), T(3) + 8.5)
place(sfx, noise(2.6, 300, 2500, 0.03, 0.4, 0.6), T(5) + 0.4); place(sfx, crash(), T(5) + 3.3, -8); place(sfx, thud(70, 0.15, 0.8), T(5) + 3.3); place(sfx, noise(1.2, 300, 2500, 0.05, 0.2, 0.5), T(5) + 8.7)
place(sfx, noise(4.0, 300, 2200, 0.025, 0.4, 0.3), T(7)); place(sfx, noise(0.35, 300, 3000, 0.1, 0.01, 0.2), T(7) + 4.2)
for k in range(9): place(sfx, thud(260, 0.04, 0.35), T(7) + 4.4 + k * 0.04)
for k in range(5): place(sfx, noise(0.08, 1500, 6000, 0.08, 0.002, 0.06), T(7) + 4.7 + k * 0.18)
place(sfx, noise(8.0, 40, 600, 0.12, 1.2, 1.5), T(12))
for k in range(9): place(sfx, noise(0.25, 800, 4000, 0.05, 0.01, 0.2), T(15) + 0.3 + k * 0.33)
buzzm = (np.sin(np.arange(int(2.2 * SR)) / SR * 2 * np.pi * 18) > 0).astype(np.float32)[:, None]; place(sfx, noise(2.2, 120, 900, 0.08, 0.01, 0.01) * buzzm, T(20) + 0.1); place(sfx, thud(500, 0.03, 0.4), T(20) + 2.3)
place(sfx, thud(300, 0.03, 0.5), T(20) + 10.8); place(sfx, noise(0.6, 40, 300, 0.12, 0.01, 0.4), T(20) + 10.85); place(sfx, thud(300, 0.03, 0.5), T(20) + 11.6); place(sfx, rise(0.6, 200, 1200), T(20) + 11.65, -10)
place(sfx, noise(3.1, 2500, 9000, 0.04, 0.3, 0.3), T(23))
for k in range(6): place(sfx, thud(900, 0.02, 0.25), T(23) + 0.4 + k * 0.5)
place(sfx, noise(2.8, 200, 2000, 0.04, 0.4, 0.4), T(23) + 3.1)
place(sfx, noise(5.0, 100, 1200, 0.06, 1.0, 1.0), T(36)); place(sfx, thud(180, 0.06, 0.7), T(36) + 3.6); place(sfx, thud(180, 0.06, 0.7), T(36) + 3.95)
place(sfx, noise(0.5, 400, 3000, 0.06, 0.01, 0.4), T(72) + 7.6)
place(sfx, noise(3.6, 40, 400, 0.14, 0.3, 0.8), T(87))
for k in range(6): place(sfx, noise(0.06, 3000, 8000, 0.08, 0.002, 0.04), TS['END']['t0'] + 1.45 + k * 0.07)
sfx *= 0.8
sub = np.zeros((N, 2), np.float32); tt = np.arange(int(2.5 * SR)) / SR
for k, d in enumerate([20, 27, 36, 53, 72, 87]):
    amp = 10 ** ((-44 + 2 * (k + 1)) / 20); place(sub, st(amp * np.sin(2 * np.pi * 44 * tt) * np.minimum(tt / 0.05, 1) * np.exp(-tt / 1.1)), T(d))
bg = music + sfx + sub
# ---------------- dynamic duck: background ~7 dB under the local voice, -3..-16 dB
H = int(0.01 * SR); ve = env_db(voice); be = env_db(bg); n = min(len(ve), len(be)); ve, be = ve[:n], be[:n]
talk = ve > -50; idx = np.where(talk)[0]
for a_, b_ in zip(idx[:-1], idx[1:]):
    if 1 < b_ - a_ <= 45: talk[a_:b_] = True
req = np.zeros(n)
for k in range(n):
    if talk[k]: lo, hi = max(0, k - 8), min(n, k + 9); req[k] = min(-3.0, (np.max(ve[lo:hi]) - 9.0) - be[k])
req = np.maximum(req, -24.0); req = np.concatenate([req[6:], np.zeros(6)])
g = np.zeros(n); cur = 0.0
for k in range(n): cur += (req[k] - cur) * (0.6 if req[k] < cur else 0.04); g[k] = cur
bg_d = bg * np.interp(np.arange(N), np.arange(n) * H + H / 2, 10 ** (g / 20)).astype(np.float32)[:, None]
s0, s1, r = int(SIL[0] * SR), int(SIL[1] * SR), int(0.01 * SR); bg_d[s0 - r:s0] *= np.linspace(1, 0, r)[:, None]; bg_d[s0:s1] = 0
mix = voice + bg_d; fo = int(0.5 * SR); mix[-fo:] *= np.linspace(1, 0, fo)[:, None]

def wav(p, a): subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_f32le', p], input=a.astype(np.float32).tobytes(), check=True)
wav(f'{D}/mix_pre.wav', mix); wav(f'{D}/stem_voice.wav', voice); wav(f'{D}/stem_bg.wav', bg_d)
o = subprocess.run(['ffmpeg', '-hide_banner', '-i', f'{D}/mix_pre.wav', '-af', 'loudnorm=I=-14:TP=-1.0:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
js = json.loads(o[o.rindex('{'):o.rindex('}') + 1])
ln = f"loudnorm=I=-14:TP=-1.0:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}:measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true"
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'{D}/mix_pre.wav', '-af', ln + ',aresample=44100', '-c:a', 'pcm_s16le', f'{D}/mix.wav'], check=True)

# ---------------- audible spans per cue (dry voice within 20 dB of its peak and >= 10 dB above the ducked background)
bge = env_db(bg_d)
for c, tr in zip(DLG, dry):
    e = env_db(tr)[:len(bge)]; pk = e.max(); aud = (e > pk - (20 if c['kind'] == 'shout' else 24)) & (e > bge[:len(e)] + 10) & (e > -45)
    spans, k = [], 0
    while k < len(aud):
        if aud[k]:
            j = k
            while j < len(aud) and aud[j]: j += 1
            spans.append([k / 100, j / 100]); k = j
        else: k += 1
    merged = []
    for a_, b_ in spans:
        if merged and a_ - merged[-1][1] < 0.30: merged[-1][1] = b_
        else: merged.append([a_, b_])
    c['spans'] = [[round(a_, 2), round(b_, 2)] for a_, b_ in merged if b_ - a_ >= 0.04]
json.dump(DLG, open(f'{D}/dialogue.json', 'w'), indent=1)
for c in DLG: print(f"{c['speaker']:8} {c['spans'][0][0]:6.2f}-{c['spans'][-1][1]:6.2f}  {' '.join(w['w'] for w in c['words'])}")
print('mix ok')
