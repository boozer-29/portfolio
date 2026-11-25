# Laziness mix: one continuous lazy lo-fi bed (muffled for the pause beat + blackout, under a jingle for the infomercial), the tk-tk-tk… DING machine motif, watch buzzes, room tone / crowd / storm beds -> mix.wav + dialogue.json
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
SPK = {'d1': 'dev', 'd9': 'dev', 'd13': 'dev', 'dEnd': 'dev', 'p2': 'priya', 'p20': 'priya', 'host': 'host', 'golf': 'golf', 'eng': 'engineer', 'drv': 'driver', 'nb': 'neighbour', 'bo': 'london'}
FX = {'eng': 'highpass=f=420,lowpass=f=3000,', 'bo': 'aecho=0.8:0.5:60:0.2,'}   # engineer: over the radio; the voice in the dark: street echo
for a in TLJ['title_audio'] + [c for s in TLJ['steps'] for c in s['audio']]:
  if True:
    f = a['file']
    if f.startswith('sh_'):
        x = edge(load(f"{VA}/{f}.wav", 'acompressor=threshold=-24dB:ratio=4:attack=4:release=90:makeup=1'), 0.008, 0.03)
        on = 0.0; at = a['at']; e = env_db(x); act = e > e.max() - 30; hop = int(0.01 * SR); sp_ = np.concatenate([x[k * hop:(k + 1) * hop] for k in np.where(act)[0]]); g = -16.0 - db(sp_); x *= 10 ** (min(g, -1.5 - 20 * np.log10(np.abs(x).max() + 1e-12)) / 20)
        words = [{'w': w, 't': round(a['at'] + dt, 3)} for w, dt in SHOUT_WORDS[f]]; spk, kind = 'hero', 'shout'
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
# ---------------- music: one lazy lo-fi bed (ElevenLabs music, 100 s), looped with a 2 s crossfade to cover the episode; each scene picks a version of it
T = lambda d: TS[d]['t0']
T1, T2, T4, T6, T9, T13, T16, T20, T25, T30, TE = [T(d) for d in (1, 2, 4, 6, 9, 13, 16, 20, 25, 30, 'END')]
def bed(af=''):
    a = load(f'{VA}/music_lazy.mp3', af); L = len(a) - int(2.0 * SR); out = np.zeros((N + SR, 2), np.float32); i = 0
    while i < N:
        seg_ = a.copy(); n2 = int(2.0 * SR); seg_[:n2] *= np.linspace(0, 1, n2)[:, None] if i else 1; seg_[-n2:] *= np.linspace(1, 0, n2)[:, None]
        j = min(len(out), i + len(seg_)); out[i:j] += seg_[:j - i]; i += L
    return out[:N]
raw = bed(); soft = bed('lowpass=f=700,lowpass=f=700,volume=2dB')
def gate(segs, fade=0.25):   # 0/1 envelope over [t0, t1) segments with linear fades
    g = np.zeros(N, np.float32); t = np.arange(N) / SR
    for a_, b_ in segs: g = np.maximum(g, np.clip(np.minimum((t - a_) / fade + 1, (b_ - t) / fade + 1), 0, 1))
    return g[:, None]
BLACK, WAVE = T30 + 0.25, T30 + 10.25
SOFT = [(0, T1), (T13, T16), (BLACK, WAVE)]; TV = (T6, T9); GOLF = (T16, T20)
music = raw * gate([(T1, T6), (T9, T13), (T20, BLACK), (WAVE, DUR + 1)], 0.3) + soft * (gate([SOFT[0], SOFT[2]], 0.3) + 0.55 * gate([SOFT[1]], 0.3)) \
      + 0.35 * raw * gate([TV], 0.2) + 0.6 * soft * gate([GOLF], 0.3)   # never silent: every scene hands over to another version with a crossfade
jg = load(f'{VA}/jingle.mp3'); jg = jg / (np.abs(jg).max() + 1e-9) * 0.9; place(music, edge(jg[:int(min(len(jg) / SR, T9 - T6) * SR)], 0.01, 0.4), T6)
music *= 0.3
rng = np.random.default_rng(7)
def bp(x, lo, hi): X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X[(f < lo) | (f > hi)] = 0; return np.fft.irfft(X, len(x))
def envl(n, a=0.004, d=0.25): t = np.arange(n) / SR; return np.minimum(t / a, 1) * np.exp(-t / d)
def st(x): x = np.asarray(x, np.float32); return np.stack([x, x], 1)
def thud(f=60, d=0.14, g=1.0): n = int(0.5 * SR); t = np.arange(n) / SR; return st((np.sin(2 * np.pi * f * t) + 0.4 * bp(rng.standard_normal(n), 60, 500)) * envl(n, 0.002, d) * g)
def click(f0=2500, g=0.5): n = int(0.05 * SR); return st(bp(rng.standard_normal(n), f0 * 0.6, f0 * 1.6) * envl(n, 0.0005, 0.008) * g)
def ding(f=1568, d=0.35, g=0.22): n = int(1.0 * SR); t = np.arange(n) / SR; return st((np.sin(2 * np.pi * f * t) + 0.45 * np.sin(2 * np.pi * f * 2.01 * t) + 0.2 * np.sin(2 * np.pi * f * 3.0 * t)) * envl(n, 0.002, d) * g)
def buzz(d=0.12, g=0.25): n = int(d * SR); t = np.arange(n) / SR; return st(np.sign(np.sin(2 * np.pi * 160 * t)) * 0.5 * bp(np.sin(2 * np.pi * 160 * t) + 0.3 * rng.standard_normal(n), 80, 600) * np.minimum(t / 0.01, 1) * np.minimum((d - t) / 0.02, 1) * g)
def noise(dur, lo, hi, g, a=0.4, d=0.5): n = int(dur * SR); t = np.arange(n) / SR; return st(bp(rng.standard_normal(n), lo, hi) * np.minimum(t / a, 1) * np.minimum((dur - t) / d, 1) * g)
def swish(dur=0.5, f0=600, f1=4000):
    n = int(dur * SR); x = rng.standard_normal(n); out = np.zeros(n); t = np.arange(n) / SR
    for k in range(0, n, 1024): f = f0 + (f1 - f0) * (k / n); out[k:k + 1024] = bp(x[k:k + 1024], f * 0.6, f * 1.4)
    return st(out * np.sin(np.pi * t / dur) * 0.16)
def whine(dur, f0, f1, g=0.05): n = int(dur * SR); t = np.arange(n) / SR; f = f0 + (f1 - f0) * t / dur; return st((np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.3 * np.sin(4 * np.pi * np.cumsum(f) / SR)) * np.minimum(t / 0.1, 1) * np.minimum((dur - t) / 0.15, 1) * g)
def gen(name, gl=1.0, dur=None): w = load(f'{VA}/{name}.mp3'); w = w / (np.sqrt(np.mean(w ** 2)) + 1e-9) * 10 ** (-24 / 20) * gl; return edge(w[:int(dur * SR)] if dur else w, 0.01, 0.15)
sfx = np.zeros((N, 2), np.float32)
def motif(t, g=0):   # the machine signature: tk-tk-tk… DING
    for k, dt in enumerate((0.45, 0.3, 0.15)): place(sfx, click(2600 + 200 * k, 0.45), t - dt, g)
    place(sfx, ding(1568, 0.4, 0.24), t, g); place(sfx, ding(2349, 0.3, 0.1), t + 0.02, g)
for s in TLJ['steps']: place(sfx, buzz(), s['t0'] + 0.05, -2); place(sfx, buzz(), s['t0'] + 0.22, -2)   # the watch buzzes on every new day
def walla(name, t0, dur, gdb):
    w = load(f'{VA}/{name}.mp3'); w = w / (np.sqrt(np.mean(w ** 2)) + 1e-9) * 10 ** (-28 / 20); t = 0.0
    while dur - t > 1.0: seg_ = edge(w[:int(min(len(w), (dur - t) * SR))].copy(), 0.4, 0.4); place(sfx, seg_, t0 + t, gdb); t += len(w) / SR - 0.4
# title: Dev's footsteps across the room, the rota magnet clack
for k in range(14): place(sfx, thud(70, 0.05, 0.35), 0.2 + k * 0.29, -6)
place(sfx, click(1800, 0.8), 1.3, -2)
# Day 1: Dev bouncing; the roll + face-plant onto the rug
for k in range(int(3.8 / 0.45)): place(sfx, thud(65, 0.05, 0.4), T1 + 0.1 + k * 0.45, -8)
place(sfx, swish(0.5, 900, 300), T1 + 3.9, -4); place(sfx, thud(55, 0.16, 1.0), T1 + 4.4, 0)
# Day 2: cast whoosh, hook, shake flying, SPLAT on the rota; second cast, reel clicks, remote landed (motif)
place(sfx, swish(0.45, 500, 3500), T2 + 2.3, -2); place(sfx, swish(0.6, 3000, 800), T2 + 2.75, -2); place(sfx, noise(0.35, 120, 1800, 0.35, 0.003, 0.15) + thud(70, 0.1, 0.8)[:int(0.35 * SR)], T2 + 3.35, 0)
place(sfx, swish(0.45, 500, 3500), T2 + 5.0, -3)
for k in range(16): place(sfx, click(3200, 0.35), T2 + 5.5 + k * 0.05, -4)
motif(T2 + 6.3)
# Day 4: domino clicks, toy car rolling, mousetrap SNAP, string tug, switch + DING, room goes dark
for i in range(22): place(sfx, click(1900 + (i % 3) * 300, 0.6), T4 + 1.9 + 1.5 * i / 22 + 0.12, -3)
place(sfx, noise(0.5, 300, 1500, 0.06, 0.05, 0.1), T4 + 3.4); place(sfx, click(3500, 1.0) + thud(160, 0.04, 0.4)[:int(0.05 * SR)], T4 + 4.05, 0); motif(T4 + 4.45); place(sfx, thud(45, 0.3, 0.5), T4 + 4.5, -4)
# Day 6: jingle (in the music); the blower revs, the drum spins, plates whoosh out, catches, the fifth smashes; studio audience
place(sfx, gen('blower', 0.9, 2.5), T6 + 5.2, -2); place(sfx, whine(1.6, 120, 380, 0.05), T6 + 5.3, -2)
for i in range(5): place(sfx, swish(0.4, 2500, 700), T6 + 5.4 + i * 0.22, -4)
for i in range(4): place(sfx, thud(140, 0.04, 0.5), T6 + 5.95 + i * 0.22, -4)
place(sfx, gen('smash', 1.2), T6 + 6.4, 0); place(sfx, gen('audience_ooh', 0.8), T6 + 6.6, -4)
# Day 9: drone in, brushing, drone over to Dev
place(sfx, gen('drone', 0.7, 5.0), T9 + 1.3, -6); place(sfx, gen('drone', 0.7, 2.6), T9 + 4.4, -6); motif(T9 + 2.4, -3)
for k in range(14): place(sfx, noise(0.09, 2500, 8000, 0.07, 0.01, 0.04), T9 + 2.5 + k * 0.13, -4)
for k in range(8): place(sfx, noise(0.09, 2500, 8000, 0.07, 0.01, 0.04), T9 + 5.3 + k * 0.13, -4)
# Day 13: the watch ticking in the hush, a creak as the foot lifts, the snore when he falls asleep standing
for k in range(12): place(sfx, click(4200, 0.35), T13 + 0.65 + k * 1.0, -8)   # off the cue starts (QA reads a tick on an edit as a click)
place(sfx, gen('snore', 0.9, 1.3), T13 + 12.0 - 0.6 + 0.0, -6)
# Day 16: doorbell, the arm whirring out, grab clunk, coin flick + catch, the arm back, the golf crowd
place(sfx, ding(1318, 0.3, 0.2), T16 + 0.05); place(sfx, ding(1046, 0.4, 0.2), T16 + 0.3); place(sfx, whine(4.0, 220, 520, 0.04), T16 + 0.6, -4)
motif(T16 + 4.75, -2); place(sfx, ding(4200, 0.08, 0.15), T16 + 5.2); place(sfx, ding(3800, 0.06, 0.12), T16 + 5.6); place(sfx, whine(2.3, 500, 200, 0.035), T16 + 5.9, -4)
place(sfx, gen('golf_clap', 0.9), T16 + 9.2, -4)
for k in range(8): place(sfx, ding(4600, 0.03, 0.05), T16 + 7.6 + k * 0.28, -8)   # the second coin rattling down the arm
# Day 20: the factory bed + motif hits
walla('factory', T20, T25 - T20, 0); [motif(T20 + d, -4) for d in (1.2, 4.0, 7.6)]
# Day 25: blueprint pen scratch, zipline whizz + chips landed, the street outside
place(sfx, noise(1.0, 2000, 7000, 0.02, 0.1, 0.3), T25 + 0.2, -6); place(sfx, swish(1.0, 1500, 600), T25 + 1.6, -2); motif(T25 + 2.6, -2)
walla('walla_street', T25 + 5.4, T30 - T25 - 5.4, 0)
# Day 30: thunder + blackout, rain, the panicking city, radio squelch, the tug, the domino rumble over London, the lever, DING, the station humming back, the city cheering
place(sfx, gen('thunder', 1.3), T30 + 0.1, 0); place(sfx, noise(T30 + 10.25 + 1.0 - T30, 2000, 8000, 0.035, 0.5, 0.8), T30, -2)
walla('walla_dark', T30 + 0.6, 6.0, 0); place(sfx, noise(0.25, 1200, 3200, 0.07, 0.005, 0.1), T30 + 2.3)
place(sfx, gen('thunder', 0.7, 2.0), T30 + 3.3, -6); place(sfx, swish(0.3, 300, 1200), T30 + 6.5, 0)
for i in range(60): place(sfx, click(1500 + (i % 4) * 250, 0.5), T30 + 7.1 + 2.4 * i / 60 + 0.12, -6)
place(sfx, noise(2.5, 80, 600, 0.05, 0.3, 0.3), T30 + 7.1, -4); place(sfx, thud(90, 0.2, 1.0), T30 + 9.65); motif(T30 + 9.7); place(sfx, gen('power_up', 1.0), T30 + 9.8, 0)
walla('walla_cheer', T30 + 10.5, tE30 - T30 - 10.5 + 0.6 if (tE30 := TS[30]['t1']) else 2.0, 0)
# END: marker squeak, Dev bursting in (door bang + steps), the arm bringing the medal (whine), medal clunk, one last snore
for k in range(5): place(sfx, noise(0.12, 2500, 6000, 0.05, 0.01, 0.03), TE + 0.45 + k * 0.15, -6)
place(sfx, thud(80, 0.12, 0.9), TE + 1.0); [place(sfx, thud(70, 0.05, 0.4), TE + 1.1 + k * 0.2, -6) for k in range(5)]
place(sfx, whine(1.9, 200, 480, 0.04), TE + 5.4, -4); motif(TE + 7.3); place(sfx, thud(130, 0.06, 0.6), TE + 7.35)
place(sfx, gen('snore', 0.8, 1.5), TE + 9.25, -8)
# room tone under every flat scene
for a_, b_ in [(0, T16), (T16, T25 + 5.4), (TE, DUR)]: walla('room_flat', a_, b_ - a_, -4)
sfx *= 0.8

bg = music + sfx

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
