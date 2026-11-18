# Afro episode: cue sheet -> dialogue.json, numpy mix with loudness-matched voices, dynamic ducking, synthesized + library SFX.
import json, os, re, subprocess, numpy as np
D = os.path.dirname(os.path.abspath(__file__)); VA = os.path.join(D, 'audio')
REPO = os.path.join(D, '..', 'assets', 'audio'); SONG = os.path.join(D, '..', 'assets', 'music', 'let_it_all_work_out.mp3')
SR = 44100; DUR = 58.0; N = int(DUR * SR)

# (file path, speaker, desired speech onset, kind, caption override for shouts, echo, extra ffmpeg filter)
SH_A, SH_B, SH_Q = f'{REPO}/shouts/bomboclat_hero_A.mp3', f'{REPO}/shouts/bomboclat_hero_B.mp3', f'{REPO}/shouts/bomboclat_hero_question.mp3'
PA = 'highpass=f=420,lowpass=f=3300,aecho=0.8:0.5:55:0.22,volume=1.3'
RADIO = 'highpass=f=260,lowpass=f=5200'
PITCH = lambda k: f'asetrate={int(44100*k)},aresample=44100,atempo={1/k:.5f}'
# v2 timeline (step 2): built from the Whisper timings of each line. Onset = when speech starts.
PAUSES = {'n6': [(1.89, 0.5)]}   # comic beats inserted into a line: (split time in the file, seconds of silence)
CUES = [
    (f'{VA}/h1.mp3', 'hero', 3.7, 'line', None, False, ''),            # Date. On Saturday... Easy.
    (SH_A, 'hero', 6.22, 'shout', 'BOMBOCLAAT!', False, ''),           # Day 2
    (f'{VA}/h2.mp3', 'hero', 10.0, 'line', None, False, ''),           # ...Excuse you. (after the burp at 9.2)
    (SH_B, 'hero', 12.02, 'shout', 'BOMBOCLAAT!', False, ''),          # Day 3
    (f'{VA}/b3.mp3', 'bird', 15.0, 'line', None, False, PITCH(1.18)),   # Excuse me. We have a lease.
    (SH_A, 'hero', 17.62, 'shout', 'BOMBOCLAAAT!', False, ''),         # Day 4
    (f'{VA}/r4.mp3', 'barber', 22.0, 'line', None, False, ''),         # It's yours... now.
    (SH_B, 'hero', 24.42, 'shout', 'BOMBOCLAAT!', False, ''),          # Day 5
    (f'{VA}/h5.mp3', 'hero', 28.3, 'line', None, False, ''),           # I'm okay!
    (SH_A, 'hero', 29.82, 'shout', 'BOMBOCLAAT!', False, ''),          # Day 6
    (f'{VA}/n6.mp3', 'anchor', 33.8, 'line', None, False, 'highpass=f=140'),   # Experts have confirmed... [0.5 s] it does say help.
    (SH_B, 'hero', 38.62, 'shout', 'BOMBOCLAAAT!', True, ''),          # Day 7
    (f'{VA}/a7.mp3', 'astronaut', 41.6, 'line', None, False, 'highpass=f=260,lowpass=f=5200'),   # Houston... we have a tangle.
    (SH_A, 'hero', 44.22, 'shout', 'BOMBOCLAAT!', True, ''),           # Day 8
    (f'{VA}/h8.mp3', 'hero', 46.6, 'line', None, False, ''),           # You know what? It's a look.
    (SH_B, 'hero', 49.62, 'shout', 'BOMBOCLAAAAT!', True, ''),         # Day 9 (after the 0.8 s silence 48.8-49.6)
    (f'{VA}/d9.mp3', 'date', 53.0, 'line', None, False, ''),           # Sorry I'm late. Traffic.
    (SH_Q, 'hero', 55.4, 'shout', 'BOMBOCLAAT?!', False, ''),
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
for path, spk, on_t, kind, cap, echo, xf in CUES:
    a = load(path, (xf + ',' if xf else '') + ('acompressor=threshold=-24dB:ratio=4:attack=4:release=90:makeup=1' if kind == 'shout' else 'acompressor=threshold=-26dB:ratio=2.5:attack=6:release=120:makeup=1'))
    key = os.path.basename(path)[:-4]
    for sp_t, sp_d in reversed(PAUSES.get(key, [])):
        i = int(sp_t * SR); a = np.concatenate([a[:i], np.zeros((int(sp_d * SR), 2), np.float32), a[i:]])
    a = edge(a, 0.01 if kind == 'shout' else 0.03, 0.03); on = onset(a); at = on_t - on
    e = env_db(a); act = e > e.max() - 30; hop = int(0.01 * SR)
    sp = np.concatenate([a[k * hop:(k + 1) * hop] for k in np.where(act)[0]])
    g = (-15.0 if kind == 'shout' else -18.0) - db(sp); g = min(g, -1.5 - 20 * np.log10(np.abs(a).max() + 1e-12)); a = a * (10 ** (g / 20))
    tr = np.zeros((N, 2), np.float32); place(tr, a, at); dry.append(tr.copy())
    if echo:
        for d, gd in ((0.2, -7), (0.4, -13)): place(tr, a, at + d, gd)
    voice += tr
    words = [{'w': cap, 't': round(on_t, 3)}] if kind == 'shout' else words_of(path[:-4] + '.json', at)
    for sp_t, sp_d in PAUSES.get(key, []):
        for w in words:
            if w['t'] >= at + sp_t: w['t'] = round(w['t'] + sp_d, 3)
    DLG.append({'file': path, 'speaker': spk, 'at': round(at, 3), 'kind': kind, 'words': words})

# ---------------- music: TIKI TIKI cut to the v2 story
TIKI = os.path.join(D, '..', 'assets', 'music', 'tiki_tiki.mp3')
music = np.zeros((N, 2), np.float32)
place(music, edge(load(TIKI, 'atrim=1.0:7.0,asetpts=PTS-STARTPTS,lowpass=f=650,lowpass=f=650,volume=2dB,afade=t=out:st=5.75:d=0.25'), 0.3, 0.01), 0.0)   # muffled intro under the title
place(music, edge(load(TIKI, 'atrim=8.0:50.7,asetpts=PTS-STARTPTS'), 0.004, 0.05), 6.2)        # drop on the first BOMBOCLAAT
place(music, edge(load(TIKI, 'atrim=57.0:65.3,asetpts=PTS-STARTPTS,afade=t=out:st=7.4:d=0.8'), 0.25, 0.02), 49.75)   # second drop for Day 9
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
STEPS = [3.0, 7.0, 10.6, 14.8, 19.2, 24.4, 29.4, 34.2, 40.35]
for t in STEPS[:-1]: place(sfx, lib('pop'), t - 0.06, 0)
for t in (10.45, 14.65, 19.05, 24.25, 29.25, 34.05): place(sfx, lib('whoosh'), t, -5)
def ping(f): n = int(0.35 * SR); t = np.arange(n) / SR; fr = f * (1 + 0.5 * np.exp(-t * 30)); return st(np.sin(2 * np.pi * np.cumsum(fr) / SR) * envl(n, 0.001, 0.07) * 0.3)
def noise(dur, lo, hi, g, a=0.4, d=0.5): n = int(dur * SR); t = np.arange(n) / SR; return st(bp(rng.standard_normal(n), lo, hi) * np.minimum(t / a, 1) * np.minimum((dur - t) / d, 1) * g)
def rise(dur=0.9, f0=300, f1=2600): n = int(dur * SR); t = np.arange(n) / SR; f = f0 * (f1 / f0) ** (t / dur); return st(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.minimum(t / 0.02, 1) * (1 - t / dur) ** 0.6 * 0.2)
def drum(f0, f1, d=0.22, g=0.9): n = int(0.4 * SR); t = np.arange(n) / SR; f = f1 + (f0 - f1) * np.exp(-t * 14); return st((np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.25 * bp(rng.standard_normal(n), 300, 2500)) * envl(n, 0.002, d) * g)
def drone(dur, lvl): n = int(dur * SR); t = np.arange(n) / SR; saw = 2 * ((88 * t) % 1) - 1; x = bp(saw, 70, 900) * 0.5 + bp(rng.standard_normal(n), 100, 600) * 0.25; return st(x * lvl(t) * np.minimum(t / 0.1, 1) * 0.35)
def rattle(dur): n = int(dur * SR); t = np.arange(n) / SR; return st(bp(rng.standard_normal(n), 900, 5000) * (np.sin(2 * np.pi * 24 * t) > 0.2) * np.minimum(t / 0.1, 1) * 0.18)
def boil(dur): n = int(dur * SR); t = np.arange(n) / SR; return st(bp(rng.standard_normal(n), 120, 700) * 0.1 * np.minimum(t / 0.2, 1) * np.minimum((dur - t) / 0.2, 1))
# ---------------- SFX (v2: every doubling has an action beat with its own sound)
STEPS = [3.0, 6.2, 12.0, 17.6, 24.4, 29.8, 38.6, 44.2, 49.6]
for t in STEPS[:-1]: place(sfx, lib('pop'), t - 0.06, 0)
for t in STEPS[1:]: place(sfx, boing(), t + 0.02, -7)
for t in (11.85, 17.45, 24.25, 29.65, 38.45, 44.05): place(sfx, lib('whoosh'), t, -5)
def buzz(dur, die=None, f0=118, g=0.12):
    n = int(dur * SR); t = np.arange(n) / SR; f = f0 * (1 - 0.6 * np.clip((t - (die or 99)) / 0.5, 0, 1)); saw = 2 * ((np.cumsum(f) / SR) % 1) - 1
    amp = np.clip(1 - (t - (die or 99)) / 0.55, 0, 1) * np.minimum(t / 0.05, 1) * np.minimum((dur - t) / 0.05, 1); return st(bp(saw, 90, 3500) * amp * g)
def flaps(dur): n = int(dur * SR); t = np.arange(n) / SR; return st(bp(rng.standard_normal(n), 300, 2500) * (0.5 + 0.5 * np.sin(2 * np.pi * 9 * t)) ** 2 * 0.1 * np.minimum(t / 0.1, 1) * np.minimum((dur - t) / 0.2, 1))
def burp(): n = int(0.55 * SR); t = np.arange(n) / SR; f = 70 + 25 * np.sin(2 * np.pi * 7 * t); x = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.6 + bp(rng.standard_normal(n), 80, 900) * 0.6; return st(bp(x, 60, 1200) * np.minimum(t / 0.02, 1) * np.minimum((0.55 - t) / 0.12, 1) * 0.5)
place(sfx, noise(0.8, 1500, 6000, 0.03, 0.05, 0.2), 0.55)                                   # title: marker on the calendar
for t in (6.75, 6.86, 6.95): place(sfx, thud(300, 0.05, 0.45), t)                          # Day 2: table props land
place(sfx, noise(0.5, 1500, 6000, 0.05, 0.05, 0.2), 7.05); place(sfx, rise(0.35, 250, 1300), 7.6, -6); place(sfx, noise(1.0, 400, 3000, 0.05, 0.1, 0.2), 7.65)   # brush, slurp, struggle
place(sfx, lib('pop'), 8.6, -2); place(sfx, burp(), 9.2)                                    # hand pops out, the afro burps
place(sfx, noise(0.6, 800, 5000, 0.05, 0.05, 0.2), 13.0); place(sfx, noise(0.8, 300, 2500, 0.06, 0.1, 0.3), 13.7); place(sfx, lib('pop'), 14.75, -6); place(sfx, flaps(0.9), 14.8)   # Day 3: rake, nest, bird
place(sfx, noise(0.35, 2500, 9000, 0.25, 0.002, 0.25), 17.65); [place(sfx, thud(260, 0.05, 0.4), t) for t in (18.05, 18.2, 18.32)]   # Day 4: mirror cracks, bottles
place(sfx, buzz(1.3, die=1.0, f0=150, g=0.14), 18.6); place(sfx, noise(0.3, 2500, 9000, 0.14, 0.003, 0.15), 19.6); place(sfx, noise(1.0, 200, 1500, 0.05, 0.1, 0.6), 19.7)   # trimmer jams, sparks, smoke
place(sfx, noise(0.4, 600, 3000, 0.05, 0.05, 0.2), 20.7); [place(sfx, noise(0.06, 3000, 9000, 0.12, 0.002, 0.04), 21.65 + k * 0.07) for k in range(4)]   # apron, keys
for k in range(9): place(sfx, step(), 21.95 + k * 0.24)                                    # barber walks out
place(sfx, buzz(0.7, f0=220, g=0.08), 25.55); place(sfx, noise(0.9, 300, 3000, 0.14, 0.05, 0.3), 25.65); place(sfx, lib('whoosh'), 25.85, 0)   # Day 5: blower, he flies
for t in (26.3, 26.9): place(sfx, thud(90, 0.08, 0.6), t)
place(sfx, noise(0.4, 1500, 6000, 0.08, 0.005, 0.2), 26.55); place(sfx, thud(55, 0.2, 1.0), 27.6); place(sfx, crash(), 27.6, -10)   # ice cream gone, landing
[place(sfx, thud(420, 0.04, 0.4), t) for t in (30.7, 30.9, 31.1)]; place(sfx, buzz(2.4, f0=70, g=0.06), 31.6)   # Day 6: ladders, mower engines
place(sfx, lib('news'), 34.0, -8)
place(sfx, noise(1.5, 40, 400, 0.14, 0.2, 0.3), 38.9); place(sfx, crash(), 40.3, -6); place(sfx, noise(0.7, 200, 1800, 0.12, 0.05, 0.3), 40.9); place(sfx, thud(60, 0.2, 0.9), 40.95)   # Day 7: launch, jam, yank
place(sfx, noise(2.6, 1000, 6000, 0.012, 0.2, 0.3), 41.5)                                  # capsule radio hiss under the line
place(sfx, noise(1.0, 300, 2000, 0.08, 0.3, 0.3), 45.0); place(sfx, thud(110, 0.1, 0.7), 45.95); [place(sfx, thud(500, 0.03, 0.4), 45.95 + i * 0.16) for i in range(5)]   # Day 8: frisbee rings, beads click in
place(sfx, rise(1.0, 400, 3000), 49.7, -12); place(sfx, noise(1.4, 30, 200, 0.2, 0.4, 0.5), 51.2); place(sfx, thud(45, 0.35, 1.0), 52.6)   # Day 9: galaxy, eclipse, her arrival
place(sfx, thud(46, 0.3, 1.0), 55.4)
sfx *= 0.75
sub = np.zeros((N, 2), np.float32); tt = np.arange(int(2.5 * SR)) / SR
for k, t in enumerate(STEPS[2:]):
    amp = 10 ** ((-44 + 2 * (k + 1)) / 20); w = amp * np.sin(2 * np.pi * 44 * tt) * np.minimum(tt / 0.05, 1) * np.exp(-tt / 1.1); place(sub, st(w), t)
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
s0, s1, r = int(48.8 * SR), int(49.6 * SR), int(0.01 * SR); bg_d[s0 - r:s0] *= np.linspace(1, 0, r)[:, None]; bg_d[s0:s1] = 0   # silence drop before Day 9
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
