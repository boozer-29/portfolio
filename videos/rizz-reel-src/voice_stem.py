# v3 mix (TIKI TIKI bed, sample-matched shouts): no narrator. Patois dialogue + BOMBOCLAAT shouts on every doubling, situational music, SFX.
import json, subprocess, os
D = os.path.dirname(os.path.abspath(__file__)); A1 = os.path.join(D, 'audio'); A2 = os.path.join(D, 'audio2')
TL = json.load(open(os.path.join(D, 'timeline.json'))); DUR = TL['DUR_OUT']
DLG = json.load(open(os.path.join(D, 'dialogue.json')))
inputs, chains = [], []
def add(path, filt, label):
    inputs.extend(['-i', path]); i = len(inputs) // 2 - 1
    chains.append(f'[{i}:a]aformat=sample_rates=44100:channel_layouts=stereo,{filt}[{label}]'); return label
def at(t): ms = int(round(t * 1000)); return f'adelay={ms}|{ms}'
def warp_out(v):  # visual -> output time
    W = TL['WARP']
    for (o0, v0), (o1, v1) in zip(W, W[1:]):
        if v <= v1: return o0 + (v - v0) * (o1 - o0) / (v1 - v0)
    return DUR

# --- dialogue + shouts
def echo(c):
    if c['kind'] != 'shout': return ''
    if 36 <= c['at'] < 40: return 'aecho=0.8:0.6:180|360:0.45|0.25,'   # Day 7, in space
    if c['at'] >= 47 and c['kind'] == 'shout': return 'aecho=0.8:0.5:210:0.3,'
    return ''
vl = []
for k, c in enumerate(DLG):
    trim = f"atrim={c['ts']}" + (f":{c['te']}" if c['te'] else '') + ',asetpts=PTS-STARTPTS,'
    gain = 3.0 if c['kind'] == 'shout' else 0.0
    vl.append(add(os.path.join(A2, c['file'] + '.mp3'), f"{trim}afade=t=in:d=0.01,{echo(c)}volume={gain}dB,{at(c['at'])}", f'v{k}'))
chains.append(''.join(f'[{l}]' for l in vl) + f'amix=inputs={len(vl)}:normalize=0,volume=1.5,apad=whole_dur={DUR},asplit=2[voice][vkey]')

# --- music: TIKI TIKI (QMIIR) cut to the story
TK = os.path.join(A2, 'tiki.mp3')
ml = [
    add(TK, f'atrim=0:9.8,asetpts=PTS-STARTPTS,lowpass=f=650,lowpass=f=650,volume=2dB,afade=t=out:st=9.55:d=0.25,{at(0)}', 'mu1'),        # muffled intro -> cut for "lol"
    add(TK, f'atrim=8.0:42.42,asetpts=PTS-STARTPTS,afade=t=out:st=34.37:d=0.05,{at(12.78)}', 'mu2'),                                   # drop lands on the first BOMBOCLAAT
    add(TK, f'atrim=42.42:47.02,asetpts=PTS-STARTPTS,afade=t=in:d=0.05,{at(48.0)}', 'mu3'),                                           # after the silence drop, until the record scratch
    add(TK, f'atrim=57.0:59.2,asetpts=PTS-STARTPTS,afade=t=out:st=1.6:d=0.4,{at(55.6)}', 'mu4'),                                       # second drop under the Sun's shout
]
chains.append(''.join(f'[{l}]' for l in ml) + f'amix=inputs={len(ml)}:normalize=0,volume=0.2[mus]')
chains.append('[mus][vkey]sidechaincompress=threshold=0.04:ratio=5:attack=15:release=250:makeup=1[musd]')

# --- SFX
steps = [warp_out(s['t']) for s in TL['STEPS']]
sfx = [(A1, 'pop.mp3', t, 10) for t in steps]
sfx += [(A1, 'read.mp3', 3.75, 0), (A1, 'pop.mp3', 9.55, 6), (A2, 'sfx_whistle.mp3', 14.45, -4), (A1, 'wave.mp3', 15.0, -10),
        (A1, 'pigeons.mp3', 18.0, -6), (A1, 'pigeons.mp3', 19.45, -6), (A2, 'sfx_screams.mp3', 22.9, -6), (A1, 'news.mp3', 30.0, -14),
        (A1, 'whoosh.mp3', 13.3, -5), (A1, 'whoosh.mp3', 22.3, -7), (A1, 'whoosh.mp3', 35.9, -4), (A1, 'whoosh.mp3', 41.9, -4), (A1, 'whoosh.mp3', 45.7, -5),
        (A1, 'chime.mp3', 49.95, 6), (A1, 'pop.mp3', warp_out(49.1), 6), (A2, 'sfx_scratch.mp3', 52.6, 0), (A1, 'news.mp3', 55.6, -2), (A1, 'whoosh.mp3', 55.55, -4)]
sfx += [(A1, 'shutter.mp3', TL['MONTAGE'][0] + k * 0.72, -2) for k in range(5)]
sl = [add(os.path.join(d, f), f'volume={g}dB,{at(t)}', f's{k}') for k, (d, f, t, g) in enumerate(sfx)]
chains.append(''.join(f'[{l}]' for l in sl) + f'amix=inputs={len(sl)}:normalize=0,volume=0.75[sfx]')

# --- sub swell per tier (-30 dB + 3 dB per tier)
tiers = [13.4, 22.4, 30.2, 36.0, 42.0, 48.0]
base = len(inputs) // 2
for k, t in enumerate(tiers):
    amp = 10 ** ((-30 + 3 * (k + 1) + 12) / 20)
    inputs.extend(['-f', 'lavfi', '-i', f'aevalsrc={amp}*sin(2*PI*44*t)*min(t/0.05\\,1)*exp(-t/1.1):s=44100:d=2.5'])
    chains.append(f'[{base + k}:a]aformat=sample_rates=44100:channel_layouts=stereo,{at(t)}[b{k}]')
chains.append(''.join(f'[b{k}]' for k in range(len(tiers))) + f'amix=inputs={len(tiers)}:normalize=0[sub]')

chains.append(f"[voice]atrim=0:{DUR},aresample=44100[out]")
chains.append('[musd]anullsink'); chains.append('[sfx]anullsink'); chains.append('[sub]anullsink')
subprocess.run(['ffmpeg', '-y', '-v', 'error', *inputs, '-filter_complex', ';'.join(chains), '-map', '[out]', '-c:a', 'pcm_s16le', os.path.join(D, 'voice_only.wav')], check=True)
print('voice ok')
