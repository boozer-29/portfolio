# Step 2 (Revision 2): lock the timeline -> timeline.json. Each step lists its captions, its audio cues (relative seconds) and its length,
# chosen so every caption is readable (0.9 s + 0.04 s/char) and every line/action has room. Printed table = the shot plan's backbone.
import json, subprocess
def dur(f): p = f'audio/{f}.wav' if f.startswith('sh_') or f == 'h5c' else f'audio/{f}.mp3'; return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True).stdout)
read = lambda s: 0.9 + 0.04 * len(s)
PAUSES = {}
CUTS = {}
STEPS = [  # day, value, comparison, status(unused in v2), setup, punch, [(cue, rel_t)], length
 (1, '£40', 'A CHARITY-SHOP JACKET', '', 'Day 1. A £40 jacket from a charity shop.', 'The bouncer has questions.', [('b1', 1.2), ('h1', 5.6)], 7.8),
 (3, '£160', 'NEW WHITE TRAINERS', '', 'Day 3. New white trainers.', 'His shadow starts walking like a model.', [('h3', 4.0)], 7.0),
 (5, '£640', '≈ A DESIGNER JACKET', '', 'Day 5. A trip to the zoo.', 'The peacock retires.', [('narr', 0.6), ('h5c', 6.8)], 8.6),
 (8, '£5,120', '≈ A GOLD CHAIN', '', 'Day 8. He walks past a clothes shop.', 'The mannequins notice.', [('h8', 4.0)], 6.0),
 (10, '£20,480', '≈ A NEW CAR', '', 'In 2019, a pair of trainers sold for $437,500.', 'Now a man in white gloves ties his laces.', [], 6.4),
 (12, '£81,920', "≈ TWO YEARS' WAGES", '', 'Day 12. It starts to rain.', 'The rain goes round him.', [('h12', 5.0)], 7.0),
 (15, '£655,360', '≈ TWO HOUSES', '', "Day 15. He's arrested for stopping traffic.", 'The judge has one question.', [('judge1', 1.0), ('h15', 2.4), ('judge2', 5.4)], 8.2),
 (18, '£5.2 million', '≈ A PRIVATE JET', '', 'Day 18. Two men try to rob him.', 'They tip him instead.', [('mugger', 3.6)], 7.0),
 (22, '£84 million', '≈ A SUPERYACHT', '', 'Day 22. He stops to tie his shoe in a gallery.', "They won't let him leave.", [('sh_whisper', 4.4)], 7.4),
 (27, '£2.7 billion', '≈ A FOOTBALL CLUB', '', 'Day 27. He pays for crisps with one button.', 'His change comes in a wheelbarrow.', [], 6.0),
 (30, '£21.5 billion', '≈ A SMALL COUNTRY', '', 'Day 30. All of London copies his look.', "Only the £40 jacket. It's all they can afford.", [], 6.2),
 ('END', '£42.9 billion', 'STILL NOT ON THE LIST', '', 'Day 31. Back at the club.', '', [('b2', 1.6), ('sh_squeak', 4.4)], 6.0),
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
