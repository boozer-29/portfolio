# Audio mix driven by the same step list as the visuals.
import json, subprocess, os
D = os.path.dirname(os.path.abspath(__file__)); A = os.path.join(D, 'audio')
TL = json.load(open(os.path.join(D, 'timeline.json')))
DUR = TL['DUR']
inputs, chains, labels = [], [], []

def add(file, filt, label):
    inputs.extend(['-i', os.path.join(A, file)])
    i = len(inputs) // 2 - 1
    chains.append(f'[{i}:a]{filt}[{label}]'); return label

def at(t): ms = int(round(t * 1000)); return f'adelay={ms}|{ms}'

# --- voice: segments of take A placed on the step grid (src_start, src_end, first_word_src, first_word_T)
VO = [(0.0, 3.45, 0.16, 0.30), (3.65, 8.80, 3.82, 3.75), (9.05, 13.40, 9.20, 9.15), (13.55, 17.85, 13.70, 13.55),
      (18.0, 22.40, 18.16, 17.95), (22.5, 26.85, 22.66, 22.55), (27.0, 30.95, 27.14, 30.35), (31.0, 35.45, 31.14, 34.35),
      (35.55, 40.10, 35.70, 38.95), (40.6, 41.6, 40.82, 44.95), (41.8, 43.73, 42.02, 46.40)]
vo_labels = []
for k, (s, e, fw, T) in enumerate(VO):
    start = T - (fw - s)
    vo_labels.append(add('vo_a.mp3', f'atrim={s}:{e},asetpts=PTS-STARTPTS,afade=t=in:d=0.02,afade=t=out:st={e - s - 0.04}:d=0.04,aformat=sample_rates=44100:channel_layouts=stereo,{at(start)}', f'vo{k}'))
chains.append(''.join(f'[{l}]' for l in vo_labels) + f'amix=inputs={len(vo_labels)}:normalize=0,volume=1.6,apad=whole_dur={DUR},asplit=2[voice][vkey]')

# --- music: take A, offset so the beat drop lands on "Wait. Something changed."
OFF = 1.1
m1 = add('music_a.mp3', f'atrim=0:{44.0 - OFF},asetpts=PTS-STARTPTS,aformat=sample_rates=44100:channel_layouts=stereo,{at(OFF)},'
         # silence drop before the montage, sub dip before the final line handled below
         f"volume='if(between(t,26.2,26.6),0.0,1)':eval=frame,afade=t=out:st={44.0 - 0.06}:d=0.06", 'm1')
m2 = add('music_a.mp3', f'atrim=49.0:58.0,asetpts=PTS-STARTPTS,aformat=sample_rates=44100:channel_layouts=stereo,afade=t=in:d=0.25,{at(44.8)},'
         f"volume='if(between(t,46.0,46.35),0.15,1)':eval=frame", 'm2')
chains.append(f'[m1][m2]amix=inputs=2:normalize=0,volume=0.30[mus]')
chains.append('[mus][vkey]sidechaincompress=threshold=0.03:ratio=4:attack=20:release=300:makeup=1[musd]')

# --- SFX: one hit per counter step + signature effects
sfx = []
for i, st in enumerate(TL['STEPS']): sfx.append(('pop.mp3', st['t'], 10))
sfx += [('read.mp3', 3.75, 0), ('pop.mp3', 9.55, 6), ('wave.mp3', 15.05, -6), ('wave.mp3', 23.0, -8), ('pigeons.mp3', 17.9, -4), ('pigeons.mp3', 19.6, -2),
        ('pigeons.mp3', 21.0, -14), ('news.mp3', 30.22, -4), ('whoosh.mp3', 13.25, -5), ('whoosh.mp3', 22.3, -7), ('whoosh.mp3', 34.05, -4),
        ('whoosh.mp3', 38.65, -4), ('whoosh.mp3', 42.5, -5), ('chime.mp3', 46.75, 6), ('chime.mp3', 48.4, 0)]
for k in range(5): sfx.append(('shutter.mp3', TL['MONTAGE'][0] + k * 0.72, -2))
sfx_labels = []
for k, (f, t, g) in enumerate(sfx):
    sfx_labels.append(add(f, f'aformat=sample_rates=44100:channel_layouts=stereo,volume={g}dB,{at(t)}', f's{k}'))
chains.append(''.join(f'[{l}]' for l in sfx_labels) + f'amix=inputs={len(sfx_labels)}:normalize=0,volume=0.8[sfx]')

# --- sub-bass swell per tier: -30 dB + 3 dB per tier
tiers = [13.4, 22.4, 30.2, 34.2, 38.8, 44.8]
subs = []
for k, t in enumerate(tiers):
    amp = 10 ** ((-30 + 3 * (k + 1) + 12) / 20)
    expr = f'{amp}*sin(2*PI*44*t)*min(t/0.05\\,1)*exp(-t/1.1)'
    inputs.extend(['-f', 'lavfi', '-i', f'aevalsrc={expr}:s=44100:d=2.5'])
    i = len(inputs) // 2 - 1 - 0  # lavfi pairs counted below
    subs.append(t)
# lavfi inputs add 4 args each; recompute indices
idx = 0; real = []
j = 0
while j < len(inputs):
    if inputs[j] == '-f': real.append(('lavfi', idx)); j += 4
    else: real.append(('file', idx)); j += 2
    idx += 1
sub_idx = [i for kind, i in real if kind == 'lavfi']
for k, (i, t) in enumerate(zip(sub_idx, subs)):
    chains.append(f'[{i}:a]aformat=sample_rates=44100:channel_layouts=stereo,{at(t)}[b{k}]')
chains.append(''.join(f'[b{k}]' for k in range(len(subs))) + f'amix=inputs={len(subs)}:normalize=0[sub]')

# --- master: hard silence 44.0–44.8 on everything but nothing is speaking then anyway
chains.append(f"[voice][musd][sfx][sub]amix=inputs=4:normalize=0,volume='if(between(t,44.0,44.8),0,1)':eval=frame,"
              f"atrim=0:{DUR},afade=t=out:st={DUR - 1.2}:d=1.2,loudnorm=I=-14:TP=-1.0:LRA=11,aresample=44100[out]")
cmd = ['ffmpeg', '-y', '-v', 'error', *inputs, '-filter_complex', ';'.join(chains), '-map', '[out]', '-c:a', 'pcm_s16le', os.path.join(D, 'mix.wav')]
subprocess.run(cmd, check=True)
print('mix ok')
