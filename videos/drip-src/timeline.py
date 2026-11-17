# Step 2 (Revision 2): lock the timeline -> timeline.json. Each step lists its captions, its audio cues (relative seconds) and its length,
# chosen so every caption is readable (0.9 s + 0.04 s/char) and every line/action has room. Printed table = the shot plan's backbone.
import json, subprocess
def dur(f): p = f'audio/{f}.wav' if f.startswith('sh_') else f'audio/{f}.mp3'; return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True).stdout)
read = lambda s: 0.9 + 0.04 * len(s)
PAUSES = {}
CUTS = {}
STEPS = [  # day, value, comparison, status, setup, punch, [(cue, rel_t)], length
 (1, '£40', 'A CHARITY-SHOP HOODIE', 'BASIC', 'Day 1. One hoodie. £40.', 'From a charity shop. It shows.', [('mum1', 2.4), ('h1', 5.4)], 7.6),
 (3, '£160', 'NEW WHITE TRAINERS', 'FRESH', 'Day 3. Brand-new white trainers.', "He hasn't touched the ground since.", [('h3', 3.6)], 6.4),
 (5, '£640', '≈ A DESIGNER JACKET', 'DRIPPY', 'Day 5. The pigeons start copying his fit.', 'Tiny chains. Tiny bucket hats.', [('pigeon', 3.2), ('sh_question', 5.6)], 7.4),
 (8, '£5,120', '≈ A GOLD CHAIN', 'ICED OUT', 'Day 8. The chain gets its own seat on the bus.', 'A granny has to stand.', [], 5.6),
 (10, '£20,480', '≈ A NEW CAR', 'ICED OUT', "In 2013, a London skyscraper's glare melted a car's mirror.", 'His chain does it before breakfast.', [('h10', 6.4)], 8.8),
 (12, '£81,920', "≈ TWO YEARS' WAGES", 'ICED OUT', 'Day 12. London Fashion Week.', 'The models walk off the runway to look at him.', [('sh_stutter', 3.0)], 7.8),
 (15, '£655,360', '≈ TWO HOUSES', 'NATIONAL TREASURE', 'Day 15. Worth more than two average UK houses.', 'Then he sees his reflection.', [('h15', 3.9)], 7.6),
 (18, '£5.2 million', '≈ A PRIVATE JET', 'NATIONAL TREASURE', 'Day 18. The Met Office issues a drip warning.', 'Londoners are told to carry umbrellas.', [('anchor', 1.2), ('h18', 5.7)], 8.0),
 (22, '£84 million', '≈ A SUPERYACHT', 'VISIBLE FROM SPACE', "Day 22. The Great Wall isn't visible from space.", 'His chain is.', [], 5.4),
 (27, '£2.7 billion', '≈ THE CROWN JEWELS', 'VISIBLE FROM SPACE', 'Day 27. Nearly as much as the Crown Jewels.', 'The Tower of London wants his hoodie.', [('sh_long', 5.0)], None),
 (36, '£1.4 trillion', '≈ HALF THE UK ECONOMY', 'COSMIC', "Day 36. Saturn's rings are almost pure ice.", 'The original drip.', [('saturn', 3.4), ('h36', 7.6)], 11.8),
 ('END', '', '', '', 'Day 37. He goes home.', '', [('mum2', 1.0), ('sh_resigned', 4.2)], 6.8),
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
    out.append({'day': day, 't0': round(t, 2), 't1': round(end, 2), 'value': rng, 'cmp': cmp, 'status': status, 'setup': setup, 'setup_on': round(s_on, 2), 'punch': punch, 'punch_on': round(p_on, 2) if p_on else None, 'audio': au})
    t = round(end, 2)
for a, b in zip([c for s in out for c in s['audio']], [c for s in out for c in s['audio']][1:]): assert b['at'] >= a['end'] + 0.2, f"voices overlap: {a['file']} / {b['file']}"
DUR = round(t + 0.3, 2)
json.dump({'TITLE': TITLE, 'DUR': DUR, 'PAUSES': PAUSES, 'CUTS': CUTS, 'steps': out}, open('timeline.json', 'w'), indent=1)
for s in out: print(f"Day {s['day']!s:>3} {s['t0']:6.2f}–{s['t1']:6.2f}  " + '  '.join(f"{a['file']} {a['at']}–{a['end']}" for a in s['audio']))
print('DUR', DUR)
