# Drip v2 mix: Espresso bed, continuous, processed per scene (through-the-wall, muffled, CCTV-tinny), crowd ambience + background voices, synth SFX per gag -> mix.wav + dialogue.json
import json, os, subprocess, numpy as np
D = os.path.dirname(os.path.abspath(__file__)); VA = os.path.join(D, 'audio'); REPO = os.path.join(D, '..', 'assets', 'audio')
TLJ = json.load(open(os.path.join(D, 'timeline.json'))); SR = 44100; DUR = TLJ['DUR']; N = int(DUR * SR)
TS = {s['day']: s for s in TLJ['steps']}
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
SHOUT_WORDS = json.load(open(os.path.join(VA, 'shout_words.json')))   # word reveal offsets of each shout (from shouts.py)
voice = np.zeros((N, 2), np.float32); dry = []; DLG = []
PAUSES = TLJ['PAUSES']
SPK = {'b1': 'bouncer', 'b2': 'bouncer', 'narr': 'narrator', 'judge1': 'judge', 'judge2': 'judge', 'mugger': 'mugger', 'm1': 'mugger', 'q1': 'queue', 'e1': 'queue', 'kid': 'kid', 'g1': 'guard', 'v1': 'visitor', 'k1': 'shopkeeper', 'p1': 'passer', 'p2': 'passer'}
FX = {'judge1': 'aecho=0.8:0.6:45:0.18,', 'judge2': 'aecho=0.8:0.6:45:0.12,', 'mugger': 'highpass=f=320,lowpass=f=3400,', 'm1': 'highpass=f=320,lowpass=f=3400,'}   # judge: courtroom room; mugger: heard through the CCTV mic
for s in TLJ['steps']:
  for a in s['audio']:
    f = a['file']
    if f.startswith('sh_'):
        x = edge(load(f"{VA}/{f}.wav", '' if f == 'sh_whisper' else 'acompressor=threshold=-24dB:ratio=4:attack=4:release=90:makeup=1'), 0.008, 0.03)
        on = onset(x); at = a['at'] - on; e = env_db(x); act = e > e.max() - 30; hop = int(0.01 * SR); sp_ = np.concatenate([x[k * hop:(k + 1) * hop] for k in np.where(act)[0]]); g = (-17.0 if f == 'sh_whisper' else -15.0) - db(sp_); x *= 10 ** (min(g, -1.5 - 20 * np.log10(np.abs(x).max() + 1e-12)) / 20)
        words = [{'w': w, 't': round(a['at'] + dt, 3)} for w, dt in SHOUT_WORDS[f]]; spk, kind = 'hero', 'shout'
    elif f == 'h5c':   # pre-trimmed wav, word times from shouts.py
        x = edge(load(f'{VA}/h5c.wav', 'acompressor=threshold=-26dB:ratio=2.5:attack=6:release=120:makeup=1'), 0.01, 0.03); at = a['at']; x *= 10 ** ((-18.0 - db(x[np.abs(x).max(1) > 0.01])) / 20)
        words = [{'w': w, 't': round(at + dt, 3)} for w, dt in SHOUT_WORDS[f]]; spk, kind = 'hero', 'line'
    else:
        af = FX.get(f, '') + 'acompressor=threshold=-26dB:ratio=2.5:attack=6:release=120:makeup=1'
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
        spk, kind = SPK.get(f, 'hero'), 'line'
    tr = np.zeros((N, 2), np.float32); place(tr, x, at); dry.append(tr.copy()); voice += tr
    DLG.append({'file': f, 'speaker': spk, 'at': round(at, 3), 'kind': kind, 'words': words})
# ---------------- music: Espresso (groove from 7.0 s) running continuously; each scene picks a processed version of it
ESP = os.path.join(D, '..', 'assets', 'music', 'espresso.mp3')
raw = load(ESP, f'atrim=7.0:{7.0 + DUR + 1},asetpts=PTS-STARTPTS')[:N]; raw = np.concatenate([raw, np.zeros((N - len(raw), 2), np.float32)])
wall = load(ESP, f'atrim=7.0:{7.0 + DUR + 1},asetpts=PTS-STARTPTS,lowpass=f=420,lowpass=f=420,volume=4dB')[:N]   # heard through the club wall
tinny = load(ESP, f'atrim=7.0:{7.0 + DUR + 1},asetpts=PTS-STARTPTS,highpass=f=500,lowpass=f=2600,volume=-3dB')[:N]; tinny[:] = tinny.mean(1, keepdims=True)   # CCTV speaker
T = lambda d: TS[d]['t0']
T1, T3, T5, T8, T10, T12, T15, T18, T22, T27, T30, TE = [T(d) for d in (1, 3, 5, 8, 10, 12, 15, 18, 22, 27, 30, 'END')]
FREEZE = (T12 + 1.2, T12 + 4.4)   # bullet time: the bed goes muffled (never silent), opens up on the unfreeze
SQ = TE + 6.55   # the only silence in the episode: under the final "BOMBOCLAAAAAT?!" and the cut to black
soft = load(ESP, f'atrim=7.0:{7.0 + DUR + 1},asetpts=PTS-STARTPTS,lowpass=f=900,lowpass=f=900,volume=1dB')[:N]   # zoo, freeze, gallery hush
def gate(segs, fade=0.25):   # 0/1 envelope over [t0, t1) segments with linear fades
    g = np.zeros(N, np.float32); t = np.arange(N) / SR
    for a_, b_ in segs: g = np.maximum(g, np.clip(np.minimum((t - a_) / fade + 1, (b_ - t) / fade + 1), 0, 1))
    return g[:, None]
music = raw * gate([(T3, T5), (T8, FREEZE[0]), (FREEZE[1], T18), (T22, T22 + 3.6), (T22 + 7.2, TE)], 0.2) \
      + wall[:N] * gate([(0, T3), (TE, SQ)], 0.2) + tinny[:N] * gate([(T18, T22)], 0.15) \
      + soft[:N] * (gate([(T5, T8), (FREEZE[0], FREEZE[1])], 0.2) * 0.85 + gate([(T22 + 3.6, T22 + 7.2)], 0.2) * 0.5)   # continuous: every scene hands over to the next version with a crossfade
music[int(T15 * SR):int(T18 * SR)] *= 0.6   # courtroom: quieter
music *= 0.3
rng = np.random.default_rng(7)
def bp(x, lo, hi): X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X[(f < lo) | (f > hi)] = 0; return np.fft.irfft(X, len(x))
def envl(n, a=0.004, d=0.25): t = np.arange(n) / SR; return np.minimum(t / a, 1) * np.exp(-t / d)
def st(x): x = np.asarray(x, np.float32); return np.stack([x, x], 1)
def thud(f=60, d=0.14, g=1.0): n = int(0.5 * SR); t = np.arange(n) / SR; return st((np.sin(2 * np.pi * f * t) + 0.4 * bp(rng.standard_normal(n), 60, 500)) * envl(n, 0.002, d) * g)
def step(): n = int(0.12 * SR); return st(bp(rng.standard_normal(n), 60, 700) * envl(n, 0.002, 0.03) * 0.8)
def heel(): n = int(0.08 * SR); return st(bp(rng.standard_normal(n), 1500, 6000) * envl(n, 0.0005, 0.012) * 0.6)
def creak(dur, f0=95): n = int(dur * SR); t = np.arange(n) / SR; saw = 2 * ((f0 * t + 0.3 * np.sin(2 * np.pi * 3.5 * t)) % 1) - 1; return st(bp(saw, 150, 2500) * (0.5 + 0.5 * np.sin(2 * np.pi * 5 * t)) * np.minimum(t / 0.05, 1) * np.minimum((dur - t) / 0.08, 1) * 0.16)
def wood(): n = int(0.5 * SR); x = bp(rng.standard_normal(n), 300, 4000); c = np.convolve((rng.random(n) < 0.01).astype(float), np.ones(40), 'same'); return st((x * (0.3 + c) * envl(n, 0.001, 0.12) + thud(80, 0.1, 0.6)[:, 0]) * 0.7)
def ding(f=1320, d=0.25, g=0.22): n = int(0.8 * SR); t = np.arange(n) / SR; return st((np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 2.01 * t) + 0.2 * np.sin(2 * np.pi * f * 3.0 * t)) * envl(n, 0.002, d) * g)
def beep(f=2100, d=0.07): n = int(d * SR); t = np.arange(n) / SR; return st(np.sin(2 * np.pi * f * t) * np.minimum(t / 0.003, 1) * np.minimum((d - t) / 0.005, 1) * 0.12)
def chirp(): n = int(0.18 * SR); t = np.arange(n) / SR; f0 = rng.uniform(2500, 4500); f = f0 * (1 + 0.35 * np.sin(2 * np.pi * rng.uniform(18, 30) * t)); return st(np.sin(2 * np.pi * np.cumsum(f) / SR) * envl(n, 0.005, 0.05) * 0.05)
def lib(name): return edge(load(f'{REPO}/sfx/{name}.mp3'), 0.002, 0.02)
def noise(dur, lo, hi, g, a=0.4, d=0.5): n = int(dur * SR); t = np.arange(n) / SR; return st(bp(rng.standard_normal(n), lo, hi) * np.minimum(t / a, 1) * np.minimum((dur - t) / d, 1) * g)
def scribble(dur=0.45):   # price-tag pen: the day's transition sound
    n = int(dur * SR); t = np.arange(n) / SR; am = 0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 9 * t + 2 * np.sin(2 * np.pi * 3 * t))); return st(bp(rng.standard_normal(n), 1800, 7000) * am * np.minimum(t / 0.02, 1) * np.minimum((dur - t) / 0.05, 1) * 0.09)
def swish(dur=0.5, f0=600, f1=4000):
    n = int(dur * SR); x = rng.standard_normal(n); out = np.zeros(n); t = np.arange(n) / SR
    for k in range(0, n, 1024): f = f0 + (f1 - f0) * (k / n); out[k:k + 1024] = bp(x[k:k + 1024], f * 0.6, f * 1.4)
    return st(out * np.sin(np.pi * t / dur) * 0.16)
def clap(n_=40, dur=2.6):   # applause from two people
    out = np.zeros(int(dur * SR))
    for k in range(n_):
        i = int((k * dur / n_ + rng.uniform(0, 0.03)) * SR); c = bp(rng.standard_normal(int(0.03 * SR)), 900, 5000) * envl(int(0.03 * SR), 0.0005, 0.006)
        out[i:i + len(c)] += c[:len(out) - i] * 0.5
    return st(out)
sfx = np.zeros((N, 2), np.float32)
for s in TLJ['steps']: place(sfx, scribble(), s['t0'] + 0.05, -3)
def steps(t0, t1, dt=0.27, g=-4, f=step):
    t = t0
    while t < t1: place(sfx, f(), t, g); t += dt
# title / Day 1: crowd murmur outside the club, hand slaps his chest
steps(0.05, 1.5, 0.22, -6); place(sfx, thud(110, 0.08, 0.9), 1.7)
# Day 3: his steps vs the shadow's heels; whoosh on the spin; record scratch when he stops
steps(T3 + 0.2, T3 + 3.4, 0.3, -6); steps(T3 + 0.9, T3 + 2.6, 0.26, -6, heel); place(sfx, swish(0.45), T3 + 2.7, -2); place(sfx, lib('scratch'), T3 + 3.4, -8)
# Day 5: zoo birds, the tail folding, the bush rustle
for k in range(26): place(sfx, chirp(), T5 + rng.uniform(0, 8.4), -2)
place(sfx, noise(8.4, 400, 3000, 0.015, 1.0, 0.6), T5); place(sfx, swish(0.7, 3000, 700), T5 + 4.6, -2); place(sfx, noise(0.8, 500, 5000, 0.07, 0.05, 0.4), T5 + 5.6)
# Day 8: three plastic head-turn creaks in sync, the jacket flops to the floor
for k in range(3): place(sfx, creak(0.55, 140 + 25 * k), T8 + 2.1, -4)
place(sfx, noise(0.35, 200, 2500, 0.08, 0.01, 0.2), T8 + 3.5)
# Day 10: radio squelch, bomb-defusal beeps while he ties the lace, final click + "all clear" squelch
place(sfx, noise(0.25, 1200, 3200, 0.07, 0.005, 0.1), T10 + 0.8)
for k in range(6): place(sfx, beep(2100 + 30 * k), T10 + 1.2 + k * 0.36, -2)
place(sfx, ding(2600, 0.06, 0.15), T10 + 3.2); place(sfx, noise(0.25, 1200, 3200, 0.07, 0.005, 0.1), T10 + 3.85)
# Day 12: rain; freeze (rain stops dead, a high ring), orbit whoosh, sizzle, snap back
place(sfx, noise(FREEZE[0] - T12, 2000, 8000, 0.05, 0.4, 0.01), T12); place(sfx, noise(T15 - FREEZE[1], 2000, 8000, 0.05, 0.01, 0.4), FREEZE[1])
place(sfx, st(np.sin(2 * np.pi * 4200 * np.arange(int(3.2 * SR)) / SR) * 0.006), FREEZE[0]); place(sfx, swish(2.6, 300, 1500), FREEZE[0] + 0.3, -4)
place(sfx, noise(0.7, 3000, 9000, 0.08, 0.005, 0.25), T12 + 3.6); place(sfx, lib('whoosh'), FREEZE[1] - 0.1, -3)
# Day 15: pencil scratching under the sketch look, gavel
for k in range(5): place(sfx, scribble(0.35), T15 + 0.6 + k * 1.5, -8)
place(sfx, wood(), T15 + 7.6, 0); place(sfx, thud(140, 0.05, 0.8), T15 + 7.6)
# Day 18: CCTV hum + hiss, footsteps, the muggers clapping
place(sfx, st(np.sin(2 * np.pi * 50 * np.arange(int(7 * SR)) / SR) * 0.012) + noise(7.0, 3000, 9000, 0.012, 0.1, 0.1), T18); steps(T18 + 0.4, T18 + 2.0, 0.32, -6)
place(sfx, noise(0.35, 300, 3000, 0.09, 0.01, 0.2), T18 + 1.8); place(sfx, swish(0.4, 600, 5000), T18 + 1.35, -4); place(sfx, ding(3200, 0.5, 0.25), T18 + 3.5); place(sfx, ding(4100, 0.5, 0.2), T18 + 3.55); place(sfx, swish(0.6, 4000, 800), T18 + 3.5, -2)
place(sfx, clap(36, 2.4), T18 + 4.85, -6)   # grab, flash, wallets, applause
# Day 22: gallery room tone, echoing steps, the rope stand clunk
place(sfx, noise(7.4, 80, 900, 0.012, 0.5, 0.5), T22); steps(T22 + 0.2, T22 + 1.2, 0.4, -6); place(sfx, thud(300, 0.06, 0.6), T22 + 2.0); place(sfx, thud(300, 0.06, 0.5), T22 + 2.5)
# Day 27: shop bell, button clink, wheelbarrow squeak, two till dings
place(sfx, ding(1760, 0.3, 0.18), T27 + 0.25); place(sfx, ding(1320, 0.3, 0.14), T27 + 0.37); place(sfx, ding(3400, 0.05, 0.2), T27 + 1.4)
place(sfx, creak(1.6, 230), T27 + 2.6, -2); place(sfx, ding(2100, 0.12), T27 + 4.4); place(sfx, ding(2800, 0.12), T27 + 4.55)
# Day 30: time-lapse rush of crowd
place(sfx, noise(6.0, 200, 2500, 0.05, 0.5, 0.8), T30); place(sfx, swish(1.2, 500, 3000), T30 + 0.2, -6)
# END: crowd outside, the hand on his chest, tag tap
steps(TE + 0.1, TE + 2.3, 0.24, -6); place(sfx, thud(110, 0.08, 0.9), TE + 2.4); place(sfx, noise(0.06, 2000, 6000, 0.1, 0.002, 0.03), TE + 5.4)
# crowd ambience beds (ElevenLabs sound generation, gen_sfx.py), each levelled to the same loudness
def walla(name, t0, dur, gdb):
    w = load(f'{VA}/{name}.mp3'); w = w / (np.sqrt(np.mean(w ** 2)) + 1e-9) * 10 ** (-28 / 20); t = 0.0
    while dur - t > 1.0: seg_ = edge(w[:int(min(len(w), (dur - t) * SR))].copy(), 0.4, 0.4); place(sfx, seg_, t0 + t, gdb); t += len(w) / SR - 0.4   # loop with 0.4 s crossfades
walla('walla_club', 0.0, T3 + 0.3, -2); walla('walla_club', TE, SQ - TE, -2); walla('walla_gallery', T22, T27 - T22, 0); walla('walla_street', T30, TE - T30 + 0.3, 0); walla('walla_court', T15 + 4.98, 3.0, 0)
sfx *= 0.8

bg = music + sfx
_c = int(SQ * SR); bg[_c - 1323:_c] *= np.linspace(1, 0, 1323)[:, None]; bg[_c:] = 0   # silence (30 ms fade, no click) for the squeak and the cut to black

# ---------------- dynamic duck: background ~7 dB under the local voice, -3..-16 dB
H = int(0.01 * SR); ve = env_db(voice); be = env_db(bg); n = min(len(ve), len(be)); ve, be = ve[:n], be[:n]
talk = ve > -50; idx = np.where(talk)[0]
for a_, b_ in zip(idx[:-1], idx[1:]):
    if 1 < b_ - a_ <= 45: talk[a_:b_] = True
req = np.zeros(n)
for k in range(n):
    if talk[k]: lo, hi = max(0, k - 8), min(n, k + 9); req[k] = min(-3.0, (np.max(ve[lo:hi]) - 11.0) - be[k])
req = np.maximum(req, -24.0); req = np.concatenate([req[6:], np.zeros(6)])
g = np.zeros(n); cur = 0.0
for k in range(n): cur += (req[k] - cur) * (0.6 if req[k] < cur else 0.04); g[k] = cur
bg_d = bg * np.interp(np.arange(N), np.arange(n) * H + H / 2, 10 ** (g / 20)).astype(np.float32)[:, None]
for c, tr in zip(DLG, dry):   # shouts: extra 4 dB duck so they sit >= 10 dB above the bed
    if c['kind'] != 'shout': continue
    nz = np.where(np.abs(tr).max(1) > 1e-4)[0]; i0, i1, rr = nz[0], nz[-1], int(0.05 * SR); env = np.ones(N, np.float32); env[i0:i1] = 10 ** (-4 / 20); env[i0 - rr:i0] = np.linspace(1, 10 ** (-4 / 20), rr); env[i1:i1 + rr] = np.linspace(10 ** (-4 / 20), 1, rr); bg_d *= env[:, None]

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
