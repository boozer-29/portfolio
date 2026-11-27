# Step 2: lock the timeline -> timeline.json. Cue lengths use where the sound really ends (RMS), not the file length (TTS adds trailing silence).
import json, subprocess, numpy as np
def env(f):
    p = f'audio/{f}.wav' if f.startswith('sh_') else f'audio/{f}.mp3'
    a = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True).stdout, np.int16) / 32768
    w = 160; r = np.array([np.sqrt(np.mean(a[i:i + w] ** 2)) for i in range(0, len(a) - w, w)]); db = 20 * np.log10(r + 1e-9)
    return db
def endof(f): db = env(f); return (np.where(db > db.max() - 35)[0][-1] + 1) * 0.01 + 0.05
def startof(f): db = env(f); return np.where(db > db.max() - 35)[0][0] * 0.01
read = lambda s: 0.9 + 0.04 * len(s)
TITLE = 4.2; TITLE_CUES = [('h0', 0.35)]
STEPS = [  # day, steps today, watch nag, setup, punch, [(cue, rel_t)], length
 (1, '4,000', 'GOAL: 10,000', 'Doctors recommend 10,000 steps a day.', "He's saving them for later.", [('d1', 0.5), ('nah', 1.6), ('h1', 4.8)], 6.8),
 (2, '2,000', 'TIME TO STAND!', 'The remote is two metres away.', 'So he goes fishing.', [('nah', 0.2), ('p2', 3.4), ('h2', 6.4)], 8.2),
 (4, '500', 'MOVE GOAL: FAILED', 'The light switch is four metres away.', 'Engineers would call this overkill.', [('h4', 4.75)], 6.0),
 (6, '125', 'ARE YOU OK?', "It's his turn to wash up.", "He'd rather invent something.", [('host', 0.2), ('sh_yawn', 6.7)], 10.9),
 (9, '15.6', 'CHECKING PULSE…', 'Dentists say brush for two minutes.', 'He outsources it.', [('h9', 2.2), ('d9', 4.8)], 7.0),
 (13, '0.98', 'LESS THAN 1 STEP', 'He now takes less than one step a day.', "Today's is still loading.", [('d13', 1.4), ('h13', 4.4), ('nah', 8.0), ('sh_sleep', 10.2)], 12.6),
 (16, '0.12', 'PLEASE MOVE', 'The pizza is at the door.', 'The door is eleven metres away.', [('golf', 0.3), ('drv', 5.0), ('h16', 7.4)], 9.8),
 (20, '0.0076', 'WATCH GIVING UP', 'Putting on socks takes about nine seconds.', 'He builds a factory to save them.', [('p20', 2.8), ('nah', 6.8)], 9.2),
 (25, '0.00024', 'WATCH ASLEEP', 'The chippy is 300 metres away.', 'So he strings the whole city together.', [('h25', 2.4), ('nb', 5.9)], 8.4),
 (30, '0.0000075', 'LOW BATTERY', 'A storm cuts the power across London.', 'Every machine stops. Except his.', [('bo', 0.6), ('eng', 2.4)], 12.4),
 ('END', '0', 'SAVED LONDON ✓', 'Day 31. London is saved.', 'The washing-up is not.', [('dEnd', 1.0), ('nah', 5.1), ('sh_wake', 7.9)], 10.2),
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
json.dump({'TITLE': TITLE, 'DUR': DUR, 'PAUSES': {}, 'CUTS': {}, 'title_audio': title_audio, 'steps': out}, open('timeline.json', 'w'), indent=1)
print('TITLE', ' '.join(f"{a['file']} {a['at']}–{a['end']}" for a in title_audio))
for s in out: print(f"Day {s['day']!s:>3} {s['t0']:6.2f}–{s['t1']:6.2f}  " + '  '.join(f"{a['file']} {a['at']}–{a['end']}" for a in s['audio']))
print('DUR', DUR)
