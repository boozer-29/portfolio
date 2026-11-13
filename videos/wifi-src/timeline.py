# Step 2 (Revision 2): lock the timeline -> timeline.json. Each step lists its captions, its audio cues (relative seconds) and its length,
# chosen so every caption is readable (0.9 s + 0.04 s/char) and every line/action has room. Printed table = the shot plan's backbone.
import json, subprocess
def dur(f): p = f'audio/{f}.wav' if f.startswith('sh_') else f'audio/{f}.mp3'; return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True).stdout)
read = lambda s: 0.9 + 0.04 * len(s)
PAUSES = {'isp': (3.542, 0.45)}
CUTS = {'h15': (2.85, 3.70)}   # shorten the 1.34 s silence before 'Landlord' to ~0.5 s
STEPS = [  # day, range, comparison, status, setup, punch, [(cue, rel_t)], length
 (1, '10 m', 'A NORMAL ROUTER', 'HOME', 'Day 1. 10 metres. A normal router.', 'One bar in the bathroom.', [('h1', 2.9)], 8.0),
 (3, '40 m', 'THROUGH THE WALL', 'HOME', "Day 3. 40 metres. The neighbour's TV connects.", "He's been using your Netflix.", [('sh_question', 4.3), ('h3', 5.65)], 9.0),
 (5, '160 m', 'THE WHOLE STREET', 'STREET', 'Day 5. The whole street connects.', 'Nobody here has paid for internet since Tuesday.', [('h5', 4.6)], 9.8),
 (7, '640 m', 'REACHES THE SCHOOL', 'NEIGHBOURHOOD', 'Day 7. The school next door connects.', 'Exam results: up 0%. TikTok: up 4,000%.', [], 6.4),
 (12, '20.5 km', 'HIGHER THAN PLANES', 'CITY', 'Day 12. Planes cruise at 11 km.', 'Flight 302 is now buffering over your house.', [('sh_stutter', 3.0), ('h12', 6.8)], 9.8),
 (15, '164 km', 'THREE CITIES', 'CITY', 'Day 15. Three cities run on your Wi-Fi.', "You've stopped paying rent. They pay you now.", [('h15', 3.6)], 7.8),
 (20, '5,243 km', 'COAST TO COAST', 'COUNTRY', 'Day 20. Coast to coast.', 'Your internet provider calls.', [('isp', 2.6), ('h20', 8.0)], 12.6),
 (23, '41,943 km', 'PAST THE SATELLITES', 'PLANET', 'Day 23. Past the GPS satellites.', "Every map app now says 'Turn left at his house.'", [], 6.0),
 (27, '671,089 km', 'THE MOON HAS FULL BARS', 'PLANET', 'Day 27. The Moon now has full bars.', '', [('sh_long', 2.25)], None),
 (36, '344 million km', 'MARS', 'SOLAR SYSTEM', 'Day 36. Mars connects.', 'Ping: 25 minutes. The rover still blames lag.', [], 5.4),
 (53, '4.76 light-years', 'THE NEAREST STAR', 'GALACTIC', 'Day 53. The nearest star system has full bars.', 'Someone there is watching your Netflix too.', [], 6.2),
 (72, '2.5 million light-years', 'ANDROMEDA', 'GALACTIC', 'Day 72. Andromeda connects.', "Your 'hi' takes 2.5 million years.", [('h72', 4.6)], 8.2),
 (87, '82 billion light-years', 'EVERYTHING', 'EVERYWHERE', 'Day 87. The whole observable universe is on your Wi-Fi.', '', [], 4.0),
 ('END', '', '', '', 'And still…', 'One bar in the bathroom.', [('hend', 2.4), ('sh_resigned', 8.4)], 11.2),
]
TITLE = 3.0; t = TITLE; out = []
for day, rng, cmp, status, setup, punch, cues, length in STEPS:
    s_on = t + 0.35; p_on = s_on + read(setup) if punch else None
    au = []
    for f, rel in cues:
        d = dur(f) + (PAUSES[f][1] if f in PAUSES else 0) - (CUTS[f][1] - CUTS[f][0] if f in CUTS else 0); au.append({'file': f, 'at': round(t + rel, 2), 'end': round(t + rel + d, 2)})
    if length is None: length = au[-1]['end'] - t          # the Moon: the long shout is hard-cut by the next shot
    end = t + length
    assert (p_on or s_on) + read(punch or setup) <= end + 0.05, f'caption too long for Day {day}'
    assert all(a['end'] <= end + 0.05 for a in au), f'audio overruns Day {day}'
    out.append({'day': day, 't0': round(t, 2), 't1': round(end, 2), 'range': rng, 'cmp': cmp, 'status': status, 'setup': setup, 'setup_on': round(s_on, 2), 'punch': punch, 'punch_on': round(p_on, 2) if p_on else None, 'audio': au})
    t = round(end, 2)
for a, b in zip([c for s in out for c in s['audio']], [c for s in out for c in s['audio']][1:]): assert b['at'] >= a['end'] + 0.2, f"voices overlap: {a['file']} / {b['file']}"
DUR = round(t + 0.3, 2)
json.dump({'TITLE': TITLE, 'DUR': DUR, 'PAUSES': PAUSES, 'CUTS': CUTS, 'steps': out}, open('timeline.json', 'w'), indent=1)
for s in out: print(f"Day {s['day']!s:>3} {s['t0']:6.2f}–{s['t1']:6.2f}  " + '  '.join(f"{a['file']} {a['at']}–{a['end']}" for a in s['audio']))
print('DUR', DUR)
