# v4 mix: built sample-accurately in numpy so every line is clearly audible.
#  - every dialogue cue is loudness-matched (lines -18 dBFS RMS, shouts -15 dBFS RMS of active speech)
#  - music + SFX + sub are ducked dynamically so the background sits >= 12 dB under whoever is talking
#  - click-free edges on every segment, silence drop before Day 9, two-pass loudnorm to -14 LUFS / -1 dBTP
#  - writes per-cue audible spans back into dialogue.json (captions are gated on them)
import json, subprocess, os, numpy as np
D = os.path.dirname(os.path.abspath(__file__)); A1 = os.path.join(D, 'audio'); A2 = os.path.join(D, 'audio2')
TL = json.load(open(os.path.join(D, 'timeline.json'))); DUR = TL['DUR_OUT']
DLG = json.load(open(os.path.join(D, 'dialogue.json')))
SR = 44100; N = int(round(DUR * SR))

def load(path, af=''):
    cmd = ['ffmpeg', '-v', 'error', '-i', path, '-af', (af + ',' if af else '') + 'aformat=sample_fmts=flt:sample_rates=44100:channel_layouts=stereo', '-f', 'f32le', '-']
    a = np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, dtype=np.float32).reshape(-1, 2).copy()
    return a
def edge(a, fin=0.006, fout=0.006):
    n1, n2 = int(fin * SR), int(fout * SR)
    if n1: a[:n1] *= np.linspace(0, 1, n1)[:, None]
    if n2: a[-n2:] *= np.linspace(1, 0, n2)[:, None]
    return a
def place(bus, a, t, gain_db=0.0):
    i = int(round(t * SR)); a = a * (10 ** (gain_db / 20))
    j = min(N, i + len(a)); bus[i:j] += a[:j - i]
def db(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)
def env_db(x, win=0.02, hop=0.01):  # short-term RMS in dB, mono, 10 ms hop
    m = x.mean(1) if x.ndim == 2 else x; w, h = int(win * SR), int(hop * SR)
    nh = len(m) // h; out = np.empty(nh)
    for k in range(nh): seg = m[k * h:k * h + w]; out[k] = 20 * np.log10(np.sqrt(np.mean(seg ** 2)) + 1e-12)
    return out

# ---------------- voice: one track per cue, loudness matched
voice = np.zeros((N, 2), np.float32); cue_tracks = []; dry_tracks = []
for c in DLG:
    af = f"atrim={c['ts']}" + (f":{c['te']}" if c['te'] else '') + ',asetpts=PTS-STARTPTS'
    # even out each performance so quiet syllables stay audible (shouts get firmer control)
    af += ',acompressor=threshold=-24dB:ratio=4:attack=4:release=90:makeup=1' if c['kind'] == 'shout' else ',acompressor=threshold=-26dB:ratio=2.5:attack=6:release=120:makeup=1'
    a = edge(load(os.path.join(A2, c['file'] + '.mp3'), af), 0.01, 0.03)
    e = env_db(a); act = e > e.max() - 30
    hop = int(0.01 * SR); speech = np.concatenate([a[k * hop:(k + 1) * hop] for k in np.where(act)[0]]) if act.any() else a
    target = -15.0 if c['kind'] == 'shout' else -18.0
    g = target - db(speech); peak = 20 * np.log10(np.abs(a).max() + 1e-12)
    g = min(g, -1.5 - peak)                         # never clip a cue
    a = a * (10 ** (g / 20))
    tr = np.zeros((N, 2), np.float32); place(tr, a, c['at']); dry_tracks.append(tr.copy())
    if c['kind'] == 'shout' and (36 <= c['at'] < 40 or c['at'] >= 47):  # space / finale echo (quieter repeats)
        d1, d2 = (0.18, 0.36) if c['at'] < 40 else (0.21, 0.42)
        for d, gdb in ((d1, -7), (d2, -13)): place(tr, a, c['at'] + d, gdb)
    cue_tracks.append(tr); voice += tr
    c['gain_db'] = round(float(g), 2)

# ---------------- music: TIKI TIKI cut to the story (same cuts as before, click-free)
TK = os.path.join(A2, 'tiki.mp3')
music = np.zeros((N, 2), np.float32)
place(music, edge(load(TK, 'atrim=0:9.8,asetpts=PTS-STARTPTS,lowpass=f=650,lowpass=f=650,volume=2dB,afade=t=out:st=9.55:d=0.25'), 0.02, 0.01), 0.0)
place(music, edge(load(TK, 'atrim=8.0:42.42,asetpts=PTS-STARTPTS'), 0.004, 0.05), 12.78)
place(music, edge(load(TK, 'atrim=42.42:47.02,asetpts=PTS-STARTPTS'), 0.05, 0.012), 48.0)
place(music, edge(load(TK, 'atrim=57.0:59.2,asetpts=PTS-STARTPTS,afade=t=out:st=1.6:d=0.4'), 0.004, 0.01), 55.6)
music *= 0.2

# ---------------- SFX (same placements as the approved cut)
def warp_out(v):
    W = TL['WARP']
    for (o0, v0), (o1, v1) in zip(W, W[1:]):
        if v <= v1: return o0 + (v - v0) * (o1 - o0) / (v1 - v0)
    return DUR
steps = [warp_out(s['t']) for s in TL['STEPS']]
sfx_list = [(A1, 'pop.mp3', t, 6) for t in steps]
sfx_list += [(A1, 'read.mp3', 3.75, 0), (A1, 'pop.mp3', 9.55, 6), (A2, 'sfx_whistle.mp3', 14.45, -4), (A1, 'wave.mp3', 15.0, -10),
             (A1, 'pigeons.mp3', 18.0, -6), (A1, 'pigeons.mp3', 19.45, -6), (A2, 'sfx_screams.mp3', 22.9, -6), (A1, 'news.mp3', 30.0, -14),
             (A1, 'whoosh.mp3', 13.3, -5), (A1, 'whoosh.mp3', 22.3, -7), (A1, 'whoosh.mp3', 35.9, -4), (A1, 'whoosh.mp3', 41.9, -4), (A1, 'whoosh.mp3', 45.7, -5),
             (A1, 'chime.mp3', 49.95, 6), (A1, 'pop.mp3', warp_out(49.1), 6), (A2, 'sfx_scratch.mp3', 52.6, 0), (A1, 'news.mp3', 55.6, -2), (A1, 'whoosh.mp3', 55.55, -4)]
sfx_list += [(A1, 'shutter.mp3', TL['MONTAGE'][0] + k * 0.72, -2) for k in range(5)]
sfx = np.zeros((N, 2), np.float32)
for d, f, t, g in sfx_list: place(sfx, edge(load(os.path.join(d, f)), 0.002, 0.02), t, g)
sfx *= 0.75

# ---------------- sub swell per tier
sub = np.zeros((N, 2), np.float32); tt = np.arange(int(2.5 * SR)) / SR
for k, t in enumerate([13.4, 22.4, 30.2, 36.0, 42.0, 48.0]):
    amp = 10 ** ((-30 + 3 * (k + 1) + 12) / 20); w = (amp * np.sin(2 * np.pi * 44 * tt) * np.minimum(tt / 0.05, 1) * np.exp(-tt / 1.1)).astype(np.float32)
    place(sub, np.stack([w, w], 1), t)

bg = music + sfx + sub

# ---------------- dynamic ducking: keep background >= 12 dB under the voice
H = int(0.01 * SR)
ve = env_db(voice); be = env_db(bg); n = min(len(ve), len(be)); ve, be = ve[:n], be[:n]
talking = ve > -50
# hold the duck across short gaps inside speech (< 0.45 s) so music doesn't pump between words
idx = np.where(talking)[0]
for a_, b_ in zip(idx[:-1], idx[1:]):
    if 1 < b_ - a_ <= 45: talking[a_:b_] = True
req = np.zeros(n)
for k in range(n):
    if talking[k]:
        # use the louder of current voice level and the local speech level (avoid over-ducking on quiet consonants)
        lo, hi = max(0, k - 8), min(n, k + 9); vloc = np.max(ve[lo:hi])
        req[k] = min(-10.0, (vloc - 18.0) - be[k])     # at least -8 dB under any speech, keep bg >= 16 dB under the local voice level
req = np.maximum(req, -40.0)
# lookahead 60 ms, fast attack, slow release (in dB)
look = 6; req = np.concatenate([req[look:], np.zeros(look)])
g = np.zeros(n); cur = 0.0
for k in range(n):
    tgt = req[k]
    cur = cur + (tgt - cur) * (0.6 if tgt < cur else 0.04)
    g[k] = cur
gs = np.interp(np.arange(N), np.arange(n) * H + H / 2, 10 ** (g / 20)).astype(np.float32)
bg_d = bg * gs[:, None]

# silence drop before Day 9: background fully off from 47.2 to 48.0 (10 ms ramps); the voice is left untouched
s0, s1 = int(47.2 * SR), int(48.0 * SR); r = int(0.01 * SR)
bg_d[s0 - r:s0] *= np.linspace(1, 0, r)[:, None]; bg_d[s0:s1] = 0
vs = voice[s0:s1].copy(); assert np.abs(vs[:int(0.6 * SR)]).max() < 0.01, 'voice must be silent during the drop'
mix = voice + bg_d
fo = int(0.4 * SR); mix[-fo:] *= np.linspace(1, 0, fo)[:, None]

def write_wav(path, a):
    p = subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_f32le', path], input=a.astype(np.float32).tobytes(), check=True)
write_wav(os.path.join(D, 'mix4_pre.wav'), mix)
# stems for verification (same gain as mix, before loudnorm)
v_stem = voice.copy(); b_stem = bg_d.copy(); v_stem[s0:s1] = 0; b_stem[s0:s1] = 0
write_wav(os.path.join(D, 'stem_voice.wav'), v_stem); write_wav(os.path.join(D, 'stem_bg.wav'), b_stem)

# two-pass loudnorm (linear) to -14 LUFS / -1 dBTP
o = subprocess.run(['ffmpeg', '-hide_banner', '-i', os.path.join(D, 'mix4_pre.wav'), '-af', 'loudnorm=I=-14:TP=-1.0:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
js = json.loads(o[o.rindex('{'):o.rindex('}') + 1])
ln = f"loudnorm=I=-14:TP=-1.0:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}:measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true"
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', os.path.join(D, 'mix4_pre.wav'), '-af', ln + ',aresample=44100', '-c:a', 'pcm_s16le', os.path.join(D, 'mix4.wav')], check=True)
master_gain_db = float(js['target_offset']) + (-14.0 - float(js['input_i'])) - float(js['target_offset'])  # = -14 - input_i

# ---------------- per-cue audible spans (cue's own audio, within 30 dB of its peak, >= 6 dB over ducked background)
bge = env_db(bg_d)
for c, tr in zip(DLG, dry_tracks):            # dry voice only: captions end with the word, not its echo
    e = env_db(tr)[:len(bge)]
    pk = e.max(); aud = (e > pk - 20) & (e > bge[:len(e)] + 10) & (e > -45)   # full speaking level only (no breaths / trailing exhales)
    aud[int(47.2 * 100):int(48.0 * 100)] = False
    # drop blips < 40 ms, bridge gaps < 60 ms
    spans = []; k = 0
    while k < len(aud):
        if aud[k]:
            j = k
            while j < len(aud) and aud[j]: j += 1
            spans.append([k / 100, j / 100]); k = j
        else: k += 1
    merged = []
    for s_, e_ in spans:
        if merged and s_ - merged[-1][1] < 0.30: merged[-1][1] = e_   # hold through short mid-sentence pauses
        else: merged.append([s_, e_])
    c['spans'] = [[round(a_, 2), round(b_, 2)] for a_, b_ in merged if b_ - a_ >= 0.04]
json.dump(DLG, open(os.path.join(D, 'dialogue.json'), 'w'), indent=1)
print('mix4 ok; master gain', round(master_gain_db, 2), 'dB')
