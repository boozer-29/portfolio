# Step 2: lock the timeline -> timeline.json. Cue lengths use where the sound really ends (RMS), not the file length (TTS adds trailing silence).
import json, subprocess, numpy as np
CUTS = {'h0': [2.15, 2.6], 'm0': [0.05, 0.9], 'm7': [0.4, 1.45]}   # trim the long TTS gaps ("something … except", Marcus's "Hmm.", "Un… lucky")
def env(f):
    p = f'audio/{f}.wav' if f.startswith('sh_') else f'audio/{f}.mp3'
    a = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True).stdout, np.int16) / 32768
    if f in CUTS: c = CUTS[f]; a = np.concatenate([a[:int(c[0] * 16000)], a[int(c[1] * 16000):]])
    w = 160; r = np.array([np.sqrt(np.mean(a[i:i + w] ** 2)) for i in range(0, len(a) - w, w)]); db = 20 * np.log10(r + 1e-9)
    return db
def endof(f): db = env(f); return (np.where(db > db.max() - 35)[0][-1] + 1) * 0.01 + 0.05
def startof(f): db = env(f); return np.where(db > db.max() - 35)[0][0] * 0.01
read = lambda s: 0.9 + 0.04 * len(s)
TITLE = 5.2; TITLE_CUES = [('h0', 0.25), ('m0', 3.55)]
STEPS = [  # day, odds, comparison, setup, punch, [(cue, rel_t)], length.  Every day opens on the coin-flip insert (TING at +0.3 s)
 (1, '1 IN 2', '≈ A COIN FLIP', 'Day 1. He loses a coin flip.', 'Against himself.', [('h1', 4.1)], 5.8),
 (2, '1 IN 4', '≈ 2 HEADS IN A ROW', 'Day 2. The wind picks a side.', 'His.', [('h2', 3.9)], 6.6),
 (3, '1 IN 8', '≈ 3 HEADS IN A ROW', 'Day 3. Rush hour.', 'Every light turns green for him. Only him.', [('drv', 3.0), ('h3', 4.6)], 7.0),
 (5, '1 IN 32', '≈ A CLAW MACHINE WIN', 'Claw machines usually grip properly about once every 30 goes.', 'First go.', [('sh_laugh', 3.6), ('kid', 7.95)], 10.9),
 (7, '1 IN 128', '≈ 7 HEADS IN A ROW', 'Day 7. Bad luck still exists.', 'It just goes next door.', [('m7', 3.8)], 6.4),
 (9, '1 IN 512', '≈ A 500-TO-1 OUTSIDER', 'Day 9. He bets £2 on the worst horse in the race.', '500 to 1.', [('rg', 1.2), ('com', 4.1)], 8.8),
 (13, '1 IN 8,192', '≈ A COIN ON ITS EDGE', 'A coin lands on its edge about once in 6,000 flips.', 'His did.', [('h13', 3.6)], 7.4),
 (20, '1 IN 1 MILLION', '≈ A ROYAL FLUSH', 'A royal flush: 1 in 649,740 hands.', 'He gets five in a row.', [('boss', 4.4)], 8.6),
 (23, '1 IN 8.4 MILLION', '≈ 23 HEADS IN A ROW', 'Only one person has ever been confirmed hit by a meteorite.', "Today, it's a car.", [('m23', 3.5), ('h23', 5.15)], 8.6),
 (26, '1 IN 67 MILLION', '≈ THE LOTTO JACKPOT', 'Lotto jackpot: 1 in 45 million.', 'By now, the whole country copies his numbers.', [('sh_choir', 5.6), ('host', 10.85), ('h26', 14.75)], 18.1),
 ('END', '1 IN 134 MILLION', '≈ ONE SAUSAGE ROLL', 'Day 27. One sausage roll left. It costs 64p.', 'He has exactly 64p.', [('lady', 2.3), ('hEnd', 4.8)], 8.6),
]
def cues(lst, t):
    return [{'file': f, 'at': round(t + rel, 2), 'on': round(t + rel + startof(f), 2), 'end': round(t + rel + endof(f), 2)} for f, rel in lst]
title_audio = cues(TITLE_CUES, 0.0); assert all(a['end'] <= TITLE + 0.05 for a in title_audio)
t = TITLE; out = []
for day, val, nag, setup, punch, cl, length in STEPS:
    s_on = t + 0.35; p_on = s_on + read(setup); au = cues(cl, t); end = t + length
    assert p_on + read(punch) <= end + 0.05, f'caption too long for Day {day}'
    assert all(a['end'] <= end + 0.05 for a in au), f'audio overruns Day {day}: {au}'
    out.append({'day': day, 't0': round(t, 2), 't1': round(end, 2), 'value': val, 'cmp': nag, 'status': '', 'setup': setup, 'setup_on': round(s_on, 2), 'punch': punch, 'punch_on': round(p_on, 2), 'audio': au})
    t = round(end, 2)
allc = title_audio + [c for s in out for c in s['audio']]
for a, b in zip(allc, allc[1:]):
    assert b["on"] >= a["end"] + 0.12, f"voices overlap: {a} / {b}"  # b['at'] >= a['end'] + 0.15, f"voices overlap: {a['file']} / {b['file']}"
DUR = round(t + 0.3, 2)
json.dump({'TITLE': TITLE, 'DUR': DUR, 'PAUSES': {}, 'CUTS': CUTS, 'title_audio': title_audio, 'steps': out}, open('timeline.json', 'w'), indent=1)
print('TITLE', ' '.join(f"{a['file']} {a['at']}–{a['end']}" for a in title_audio))
for s in out: print(f"Day {s['day']!s:>3} {s['t0']:6.2f}–{s['t1']:6.2f}  " + '  '.join(f"{a['file']} {a['at']}–{a['end']}" for a in s['audio']))
print('DUR', DUR)
