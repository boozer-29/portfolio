# Yams episode: cue sheet -> dialogue.json, numpy mix with loudness-matched voices, dynamic ducking, synthesized + library SFX.
import json, os, re, subprocess, numpy as np
D = os.path.dirname(os.path.abspath(__file__)); VA = os.path.join(D, 'audio')
REPO = '/home/user/portfolio/videos/assets/audio'; TIKI = os.path.join(D, '..', 'reel', 'audio2', 'tiki.mp3')
SR = 44100; DUR = 56.6; N = int(DUR * SR)

# (file path, speaker, desired speech onset, kind, caption override for shouts, echo)
SH_A, SH_B, SH_Q = f'{REPO}/shouts/bomboclat_hero_A.mp3', f'{REPO}/shouts/bomboclat_hero_B.mp3', f'{REPO}/shouts/bomboclat_hero_question.mp3'
CUES = [
    (f'{VA}/h_normal.mp3', 'hero', 3.3, 'line', None, False),
    (SH_A, 'hero', 7.02, 'shout', 'BOMBOCLAAT!', False),
    (f'{VA}/h_jeans.mp3', 'hero', 8.8, 'line', None, False),
    (SH_Q, 'hero', 10.27, 'shout', 'BOMBOCLAAT?!', False),
    (f'{VA}/s_wah.mp3', 'stranger', 12.05, 'line', None, False),
    (f'{VA}/h_push.mp3', 'hero', 14.75, 'line', None, False),
    (SH_B, 'hero', 17.65, 'shout', 'BOMBOCLAAT!', False),
    (f'{VA}/p_apt.mp3', 'pigeon', 21.1, 'line', None, False),
    (SH_A, 'hero', 23.87, 'shout', 'BOMBOCLAAAT!', False),
    (SH_B, 'hero', 30.85, 'shout', 'BOMBOCLAAT!', False),
    (f'{VA}/n_news.mp3', 'anchor', 32.0, 'line', None, False),
    (SH_A, 'hero', 36.45, 'shout', 'BOMBOCLAAAAT!', True),
    (f'{VA}/a_houston.mp3', 'astro', 38.9, 'line', None, False),
    (SH_B, 'hero', 40.85, 'shout', 'BOMBOCLAAT!', False),
    (f'{VA}/h_mean3.mp3', 'hero', 43.25, 'line', None, False),
    (SH_A, 'hero', 45.85, 'shout', 'BOMBOCLAAAAT!', True),
    (f'{VA}/h_wallpaper.mp3', 'hero', 48.95, 'line', None, False),
    (f'{VA}/sun_nice.mp3', 'sun', 51.6, 'line', None, False),
    (SH_Q, 'hero', 54.75, 'shout', 'BOMBOCLAAT?!', False),
]

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
def onset(a):
    e = env_db(a); return float(np.argmax(e > e.max() - 30) * 0.01)

def words_of(js, off):
    al = json.load(open(js)); ch, st = al['characters'], al['character_start_times_seconds']
    words, cur, t0, depth = [], '', None, 0
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

# ---------------- voices
voice = np.zeros((N, 2), np.float32); dry = []; DLG = []
for path, spk, on_t, kind, cap, echo in CUES:
    a = load(path, 'acompressor=threshold=-24dB:ratio=4:attack=4:release=90:makeup=1' if kind == 'shout' else 'acompressor=threshold=-26dB:ratio=2.5:attack=6:release=120:makeup=1')
    a = edge(a, 0.01, 0.03); on = onset(a); at = on_t - on
    e = env_db(a); act = e > e.max() - 30; hop = int(0.01 * SR)
    sp = np.concatenate([a[k * hop:(k + 1) * hop] for k in np.where(act)[0]])
    g = (-15.0 if kind == 'shout' else -18.0) - db(sp); g = min(g, -1.5 - 20 * np.log10(np.abs(a).max() + 1e-12)); a = a * (10 ** (g / 20))
    tr = np.zeros((N, 2), np.float32); place(tr, a, at); dry.append(tr.copy())
    if echo:
        for d, gd in ((0.2, -7), (0.4, -13)): place(tr, a, at + d, gd)
    voice += tr
    words = [{'w': cap, 't': round(on_t, 3)}] if kind == 'shout' else words_of(path[:-4] + '.json', at)
    DLG.append({'file': path, 'speaker': spk, 'at': round(at, 3), 'kind': kind, 'words': words})

# ---------------- music: TIKI TIKI cut to the story
music = np.zeros((N, 2), np.float32)
place(music, edge(load(TIKI, 'atrim=1.0:7.6,asetpts=PTS-STARTPTS,lowpass=f=650,lowpass=f=650,volume=2dB,afade=t=out:st=6.35:d=0.25'), 0.3, 0.01), 0.0)   # muffled intro under the title
place(music, edge(load(TIKI, 'atrim=8.0:46.0,asetpts=PTS-STARTPTS'), 0.004, 0.05), 7.0)       # drop lands on the first BOMBOCLAAT
place(music, edge(load(TIKI, 'atrim=57.0:67.0,asetpts=PTS-STARTPTS,afade=t=out:st=9.2:d=0.8'), 0.004, 0.02), 46.6)  # second drop for Day 9
music *= 0.32

# ---------------- SFX: library + synthesized
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
sfx = np.zeros((N, 2), np.float32)
STEPS = [3.0, 7.0, 10.2, 17.6, 23.8, 30.8, 36.4, 40.8, 45.8]
for t in STEPS: place(sfx, lib('pop'), t - 0.06, 0)
for t in (17.5, 23.7, 30.7, 36.3, 40.7, 45.7): place(sfx, lib('whoosh'), t, -5)
place(sfx, boing(), 7.0); place(sfx, rip(), 7.06)
for k in range(4): place(sfx, step(), 10.35 + k * 0.39)
place(sfx, thud(70, 0.12, 0.9), 11.8); place(sfx, creak(2.7), 11.9); place(sfx, crash(), 16.4); place(sfx, thud(48, 0.15, 1.0), 16.95); place(sfx, thud(52, 0.12, 0.7), 17.05)
place(sfx, wood(), 19.9); place(sfx, lib('pigeons'), 20.1, -4)
place(sfx, lib('screams'), 24.35, -5); [place(sfx, thud(60 + 10 * k, 0.1, 0.6), 24.3 + k * 0.17) for k in range(5)]; place(sfx, crash(), 24.7, -4)
for k in range(5): place(sfx, ding(1180 + 140 * k), 27.2 + k * 0.72)
place(sfx, lib('news'), 30.35, -10); [place(sfx, horn(380 + 60 * k), t) for k, t in enumerate((33.85, 34.55, 35.2))]
for t in (1.2, 4.6, 18.9, 22.7, 28.3, 41.9): place(sfx, bubble(), t)
place(sfx, click(), 47.42); place(sfx, click(), 47.6); place(sfx, lib('chime'), 48.05, -2); place(sfx, lib('chime'), 51.45, 2)
sfx *= 0.75
sub = np.zeros((N, 2), np.float32); tt = np.arange(int(2.5 * SR)) / SR
for k, t in enumerate([10.2, 17.6, 23.8, 30.8, 36.4, 40.8, 45.8]):
    amp = 10 ** ((-30 + 3 * (k + 1)) / 20)   # -27 dB rising 3 dB per tier; w = amp * np.sin(2 * np.pi * 44 * tt) * np.minimum(tt / 0.05, 1) * np.exp(-tt / 1.1); place(sub, st(w), t)
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
s0, s1, r = int(45.0 * SR), int(45.8 * SR), int(0.01 * SR); bg_d[s0 - r:s0] *= np.linspace(1, 0, r)[:, None]; bg_d[s0:s1] = 0   # silence drop before Day 9
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
