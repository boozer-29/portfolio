# Luck mix: AURA at full presence the whole reel (drop on Day 2's first TING), the coin-flip TING signature, slot-reel ticks, a scene ambience bed under every scene, event SFX -> mix.wav + dialogue.json
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
# LIFT: the soft 'Of course it did' sits low in the speech band; DROPW: words removed with the CUTS trim
PAUSES = TLJ['PAUSES']; LIFT = {}; DROPW = {'m0': ('Hmm.',)}
SPK = {'m0': 'marcus', 'm7': 'marcus', 'm23': 'marcus', 'kid': 'kid', 'drv': 'driver', 'com': 'commentator', 'rg': 'racegoer', 'boss': 'pit boss', 'host': 'tv host', 'lady': 'baker'}
FX = {'kid': 'asetrate=44100*1.18,aresample=44100,atempo=0.8475,', 'host': 'highpass=f=260,lowpass=f=5200,', 'com': 'highpass=f=200,lowpass=f=6500,'}   # kid: pitched up (timestamps kept); host + commentator: through a TV
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
        x = edge(x, 0.03, 0.03); at = a['at']; g = -18.0 + LIFT.get(f, 0) - db(x[np.abs(x).max(1) > 0.01]); x *= 10 ** (g / 20)
        words = words_of(f'{VA}/{f}.json', at)
        if sp:
            for w in words:
                if w['t'] >= at + sp: w['t'] = round(w['t'] + d, 3)
        if cut:
            words = [dict(w, t=at + cut[1]) if at + cut[0] <= w['t'] < at + cut[1] else w for w in words if w['w'] not in DROPW.get(f, ())]   # TTS word starts can sit inside the trimmed gap: move them to its end
            for w in words:
                if w['t'] >= at + cut[1]: w['t'] = round(w['t'] - (cut[1] - cut[0]), 3)
        spk, kind = SPK.get(f, 'hero'), 'line'
    tr = np.zeros((N, 2), np.float32); place(tr, x, at); dry.append(tr.copy()); voice += tr
    DLG.append({'file': f, 'speaker': spk, 'at': round(at, 3), 'kind': kind, 'words': words})
# ---------------- music: AURA (owner's pick), full-band and clearly audible for the whole reel (MASTER_PROMPT 9.18)
T = lambda d: TS[d]['t0']
T1, T2, T3, T5, T7, T9, T13, T20, T23, T26, TE = [T(d) for d in (1, 2, 3, 5, 7, 9, 13, 20, 23, 26, 'END')]
OFF = 21.5 - (T2 + 0.3)   # the drop (21.5 s into the track) lands on Day 2's first TING
aura = load(os.path.join(D, '..', 'assets', 'music', 'aura.mp3'), f'atrim=start={OFF:.3f}')
assert len(aura) >= N, 'AURA too short from this offset'
music = aura[:N].copy(); i2 = int((T2 + 0.3) * SR); music *= 10 ** ((-20.0 - db(music[i2:])) / 20)   # post-drop bed at -20 dBFS RMS (lines sit at -18)
def gate(segs, fade=0.3):
    g = np.zeros(N, np.float32); t = np.arange(N) / SR
    for a_, b_ in segs: g = np.maximum(g, np.clip(np.minimum((t - a_) / fade + 1, (b_ - t) / fade + 1), 0, 1))
    return g[:, None]
music[:i2] *= 10 ** (4 / 20); music[i2:i2 + int(0.05 * SR)] *= np.linspace(10 ** (4 / 20), 1, int(0.05 * SR))[:, None] ** 0   # AURA's intro is quiet: +4 dB so the title and Day 1 aren't bare
music *= 1 - (1 - 10 ** (-6 / 20)) * gate([(T13 + 0.4, T20 - 0.2)], 0.4)   # the coin-on-its-edge pause: dipped 6 dB, never cut
rng = np.random.default_rng(11)
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
def walla(name, t0, dur, gdb, s0=0.0):
    w = load(f'{VA}/{name}.mp3')[int(s0 * SR):]; w = w / (np.sqrt(np.mean(w ** 2)) + 1e-9) * 10 ** (-28 / 20); t = 0.0
    while dur - t > 1.0: seg_ = edge(w[:int(min(len(w), (dur - t) * SR))].copy(), 0.4, 0.4); place(sfx, seg_, t0 + t, gdb); t += len(w) / SR - 0.4
def ting(t, g=0, ring=0.5):   # the signature: thumb flick, coin whirr, TING on the back of the hand
    place(sfx, click(3000, 0.6), t - 0.38, g); place(sfx, swish(0.3, 2500, 5000), t - 0.32, g - 6)
    place(sfx, ding(2637, ring, 0.26), t, g); place(sfx, ding(3951, ring * 0.7, 0.11), t + 0.004, g); place(sfx, ding(5274, ring * 0.4, 0.05), t + 0.008, g)
def reels(t, g=-10):   # the slot widget spinning, three stops
    for k in range(10): place(sfx, click(1800 + 150 * (k % 3), 0.3), t + 0.05 + k * 0.055, g)
    for k in range(3): place(sfx, thud(180, 0.03, 0.4), t + 0.62 + k * 0.09, g)
for s in TLJ['steps']:
    if s['day'] not in (1, 13, 'END'): ting(s['t0'] + 0.33)
    reels(s['t0'] + 0.5)
place(sfx, click(3000, 0.6), T1 - 0.05, 0); place(sfx, click(2600, 0.5), T1 + 0.17, -4); place(sfx, thud(320, 0.05, 0.9), T1 + 0.3); place(sfx, thud(240, 0.04, 0.7), T1 + 0.52)   # Day 1: flick, tink on the hand, BONK on the forehead, thk: tails
ting(T13 + 0.33, 0, 1.6)   # Day 13: the coin lands on its edge and rings on
# beds: every scene has its own ambience (no dead air)
for name, a_, b_, gd in [('amb_bakery', 0, T2, -2), ('amb_wind', T2, T3, 0), ('amb_traffic', T3, T5, -2), ('amb_arcade', T5, T7, -2), ('amb_suburb', T7, T9, -2),
                         ('amb_races', T9, T13, 0), ('amb_laundrette', T13, T13 + 3.55, -4), ('amb_casino', T20, T23, -2), ('amb_suburb', T23, T26, -2), ('amb_pub', T26 + 3.6, TE, -2), ('amb_bakery', TE, DUR, -2)]:
    walla(name, a_, b_ - a_ + 0.4, gd - 6, 4.6 if name == 'amb_pub' else 0.0)   # the pub bed loops only its murmur tail; the cheer plays once, on the balls   # beds sit under the music, never over it
# title: till bell, the roll taken, rain; Day 1: the toast flip + splat on the trainer
place(sfx, ding(1760, 0.6, 0.12), 0.05, -6); place(sfx, swish(0.3, 2500, 900), 0.95, -8); place(sfx, swish(0.45, 900, 300), T1 + 2.3, -4)
for tl in (T1 + 2.75, T1 + 3.65): place(sfx, noise(0.25, 150, 1500, 0.3, 0.003, 0.12) + thud(90, 0.08, 0.6)[:int(0.25 * SR)], tl + 0.02)   # both slices land butter-down
place(sfx, swish(0.35, 700, 250), T1 + 3.3, -6)
# Day 2: the note fluttering down the bridge, the slap on his face
for k in range(10): place(sfx, noise(0.07, 1500, 6000, 0.05, 0.01, 0.03), T2 + 1.2 + k * 0.17, -6)
place(sfx, noise(0.12, 400, 4000, 0.4, 0.002, 0.05), T2 + 3.05); place(sfx, swish(0.5, 400, 2500), T2 + 1.35, -2); place(sfx, thud(110, 0.05, 0.5), T2 + 1.78, -6)   # the hood whooshes up and settles
# Day 3: green-man beeps rippling away, horns stacking up
for k in range(8): place(sfx, ding(2093, 0.05, 0.06), T3 + 1.0 + k * 0.22, -8)
place(sfx, thud(85, 0.12, 1.0) + thud(160, 0.04, 0.6), T3 + 4.27, 0); place(sfx, click(2400, 0.8), T3 + 4.4, -2); place(sfx, gen('horn_stuck', 0.9, 2.4), T3 + 4.45, -4)   # door slams, locks, horn stuck
place(sfx, click(1500, 0.9) + thud(400, 0.02, 0.3)[:int(0.05 * SR)], T3 + 6.07, -2)   # the button presses itself
# Day 5: coin in the slot, the claw whine, the clunk, the avalanche
place(sfx, click(2200, 0.8), T5 + 1.05); place(sfx, whine(1.2, 300, 520, 0.05), T5 + 1.3, -4); place(sfx, thud(150, 0.06, 0.7), T5 + 2.5); place(sfx, gen('teddy_avalanche', 1.2), T5 + 2.7, 0); place(sfx, gen('teddy_avalanche', 1.0), T5 + 5.2, -2); place(sfx, click(1200, 0.7), T5 + 4.7, -4); place(sfx, thud(260, 0.05, 0.4), T5 + 6.37, -4)   # the flood, the sign flips to SORRY, the crown lands
# Day 7: the bus, the puddle wave around him, onto Marcus
place(sfx, gen('splash', 1.3), T7 + 1.5, 0); place(sfx, gen('fish_flop', 1.0), T7 + 2.75, -6); place(sfx, gen('fish_flop', 1.1), T7 + 5.2, 0)   # the fish lands on the seat and flops
# Day 13: launderette tumble thuds under the hush
for k in range(6): place(sfx, thud(70, 0.1, 0.3), T13 + 1.3 + k * 0.9, -10)
place(sfx, thud(55, 0.25, 0.8), T13 + 3.55, -4)   # every machine stops at once (the bed below cuts there too)
# Day 20: five card flips, chip towers clattering, the crowd gasp
for k in range(5): place(sfx, swish(0.18, 2000, 4500), T20 + 1.0 + k * 0.55, -6); place(sfx, click(1500, 0.5), T20 + 1.15 + k * 0.55, -6)
place(sfx, gen('chip_spill', 1.2), T20 + 3.7, 0); place(sfx, gen('coin_cascade', 1.1), T20 + 3.9, -2)   # the towers topple; every slot machine pays out
# Day 23: the meteor scream + impact
place(sfx, gen('meteor', 1.5), T23 + 1.2, 0); place(sfx, thud(40, 0.6, 1.0), T23 + 2.4, 0); place(sfx, gen('car_alarm_die', 1.0), T23 + 2.65, -4)   # the alarm's sad death
# Day 26: pen scratch on the ticket, printers jamming, balls tumbling, every ball cheered, confetti
place(sfx, noise(0.9, 2000, 7000, 0.025, 0.05, 0.2), T26 + 1.0, -6)
for k in range(16): place(sfx, click(900 + 100 * (k % 5), 0.5), T26 + 2.2 + k * 0.08, -8)
for k in range(30): place(sfx, click(1200 + 200 * (k % 6), 0.3), T26 + 3.8 + k * 0.05, -10)
for k in range(6): place(sfx, thud(200, 0.05, 0.5), T26 + 4.0 + k * 0.28, -6)
place(sfx, gen('amb_pub', 1.0), T26 + 3.6, -2); place(sfx, gen('crowd_sigh', 1.2), T26 + 15.5, -2); place(sfx, ding(3200, 0.12, 0.08), T26 + 15.47, -6)   # the whole pub sighs; 64p clinks into the tip jar
# END: the till, 64p sliding over the counter, the final coin spin rattling down to one last TING
place(sfx, noise(0.4, 1500, 5000, 0.04, 0.02, 0.1), TE + 1.7, -6); place(sfx, ding(1760, 0.6, 0.12), TE + 2.05, -6)
for k in range(24): place(sfx, click(3500, 0.25), TE + 6.0 + 1.4 * (1 - (1 - k / 24) ** 1.6), -8)
ting(TE + 7.45, 0, 1.4)   # it stops dead, standing on its edge
place(sfx, gen('faint_thud', 1.2), TE + 8.25, 0)
sfx *= 0.8


# ---------------- duck (9.18): the music keeps its kick, bass and hats (-4 dB under lines); only its speech band (250 Hz-4.5 kHz) ducks hard
H = int(0.01 * SR); ve = env_db(voice); n = len(ve); talk = ve > -50; idx = np.where(talk)[0]
for a_, b_ in zip(idx[:-1], idx[1:]):
    if 1 < b_ - a_ <= 45: talk[a_:b_] = True
def curve(d_line, d_shout):
    req = np.where(talk, d_line, 0.0)
    for c, tr in zip(DLG, dry):
        if c['kind'] == 'shout': nz = np.where(np.abs(tr).max(1) > 1e-4)[0]; req[nz[0] // H:nz[-1] // H] = d_shout
    req = np.concatenate([req[6:], np.zeros(6)]); g = np.zeros(n); cur = 0.0
    for k in range(n): cur += (req[k] - cur) * (0.5 if req[k] < cur else 0.05); g[k] = cur
    return np.interp(np.arange(N), np.arange(n) * H + H / 2, 10 ** (g / 20)).astype(np.float32)[:, None]
mid = np.stack([bp(music[:, k], 250, 4500) for k in (0, 1)], 1).astype(np.float32); rest = music - mid
music_d = rest * curve(-4.0, -5.0) + mid * curve(-13.0, -11.0)
bg_d = music_d + sfx * curve(-15.0, -12.0)   # crowd chatter in the beds masks words far more than the music does

mix = voice + bg_d; fo = int(0.5 * SR); mix[-fo:] *= np.linspace(1, 0, fo)[:, None]

def wav(p, a): subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_f32le', p], input=a.astype(np.float32).tobytes(), check=True)
wav(f'{D}/mix_pre.wav', mix); wav(f'{D}/stem_voice.wav', voice); wav(f'{D}/stem_bg.wav', bg_d); wav(f'{D}/stem_music.wav', music_d)
o = subprocess.run(['ffmpeg', '-hide_banner', '-i', f'{D}/mix_pre.wav', '-af', 'loudnorm=I=-14:TP=-1.0:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
js = json.loads(o[o.rindex('{'):o.rindex('}') + 1])
ln = f"loudnorm=I=-14:TP=-1.0:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}:measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true"
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'{D}/mix_pre.wav', '-af', ln + ',aresample=44100', '-c:a', 'pcm_s16le', f'{D}/mix.wav'], check=True)

# ---------------- audible spans per cue (dry voice within 20 dB of its peak and >= 10 dB above the ducked background)
bge = env_db(bg_d)
for c, tr in zip(DLG, dry):
    e = env_db(tr)[:len(bge)]; pk = e.max(); aud = (e > pk - (20 if c['kind'] == 'shout' else 24)) & (e > bge[:len(e)] + 4) & (e > -45)   # +4 dB: the bed now only ducks 6 dB (9.18)
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
