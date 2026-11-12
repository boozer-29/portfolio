# Step 2: lock the timeline from caption reading time + shout/voice lengths -> timeline.json (+ printed table).
# Each step: setup caption at +0.35 s, punchline appears once the setup is read, both stay until the cut.
import json, subprocess
def dur(p): return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True).stdout)
read = lambda s: 0.9 + 0.04 * len(s)          # seconds to read a caption line (reels are read fast and loop)
STEPS = [  # (day, range, comparison, status, setup, punch, extra seconds the visuals need, audio cue (file, offset after punch))
 (1, '10 m', 'A NORMAL ROUTER', 'HOME', 'Day 1. 10 metres. A normal router.', 'One bar in the bathroom.', 0.4, None),
 (3, '40 m', 'THROUGH THE WALL', 'HOME', "Day 3. 40 metres. The neighbour's TV connects.", "He's been using your Netflix.", 0.6, ('sh_question', 0.6)),
 (5, '160 m', 'THE WHOLE STREET', 'STREET', 'Day 5. The whole street connects.', 'Nobody here has paid for internet since Tuesday.', 0.3, None),
 (7, '640 m', 'REACHES THE SCHOOL', 'STREET', 'Day 7. The school next door connects.', 'Exam results: up 0%. TikTok: up 4,000%.', 0.6, None),
 (12, '20.5 km', 'HIGHER THAN PLANES', 'CITY', 'Day 12. Planes cruise at 11 km.', 'Flight 302 is now buffering over your house.', 0.4, ('sh_stutter', 0.2)),
 (15, '164 km', 'THREE CITIES', 'COUNTRY', 'Day 15. Three cities run on your Wi-Fi.', "You've stopped paying rent. They pay you now.", 1.2, None),
 (17, '655 km', 'REACHES THE ISS', 'COUNTRY', 'Day 17. The space station connects.', 'An astronaut asks for the password.', 0.4, None),
 (20, '5,243 km', 'COAST TO COAST', 'COUNTRY', 'Day 20. Coast to coast.', 'Your internet provider calls.', 0.3, ('isp', 0.3)),
 (23, '41,943 km', 'PAST THE SATELLITES', 'PLANET', 'Day 23. Past the GPS satellites.', "Every map app now says 'Turn left at his house.'", 0.3, None),
 (27, '671,089 km', 'THE MOON HAS FULL BARS', 'PLANET', 'Day 27. The Moon now has full bars.', '', 0.0, ('sh_long', -0.2)),
 (36, '344 million km', 'MARS', 'SOLAR SYSTEM', 'Day 36. Mars connects.', 'Ping: 25 minutes. The rover still blames lag.', 0.3, None),
 (43, '44 billion km', 'PASSES VOYAGER 1', 'SOLAR SYSTEM', 'Day 43. Voyager 1 took 49 years to get this far.', 'You took 43 days.', 0.5, None),
 (53, '4.76 light-years', 'THE NEAREST STAR', 'GALACTIC', 'Day 53. The nearest star system has full bars.', 'Someone there is watching your Netflix too.', 0.4, None),
 (72, '2.5 million light-years', 'ANDROMEDA', 'GALACTIC', 'Day 72. Andromeda connects.', "Your 'hi' takes 2.5 million years. Left on read.", 0.3, None),
 (87, '82 billion light-years', 'EVERYTHING', 'EVERYWHERE', 'Day 87. The whole observable universe is on your Wi-Fi.', '', 0.6, None),
 ('END', '', '', '', 'And still…', 'One bar in the bathroom.', 0.4, ('sh_resigned', 0.5)),
]
ISP_PAUSE = (3.542, 0.45)   # quietest point between 'have' and 'questions' (3.18 cut into 'have')   # beat before "questions." in the voicemail
TITLE = 3.0; t = TITLE; out = []
for day, rng, cmp, status, setup, punch, extra, cue in STEPS:
    t0 = t; s_on = t0 + 0.35; p_on = s_on + read(setup) if punch else None
    end = (p_on + read(punch)) if punch else (s_on + read(setup))
    a = None
    if cue:
        f, off = cue; d = dur(f'audio/{f}.wav' if f.startswith('sh_') else f'audio/{f}.mp3') + (ISP_PAUSE[1] if f == 'isp' else 0)
        at = (p_on if p_on else s_on) + off if off >= 0 else None
        if f == 'sh_long': at = s_on + read(setup) - 0.4; end = at + d          # the hard cut lands exactly at the end of the stretched shout
        a = {'file': f, 'at': round(at, 2), 'end': round(at + d, 2)}; end = max(end, at + d + (0.0 if f == 'sh_long' else 0.35))
    end += extra; t = round(end, 2)
    out.append({'day': day, 't0': round(t0, 2), 't1': t, 'range': rng, 'cmp': cmp, 'status': status, 'setup': setup, 'setup_on': round(s_on, 2), 'punch': punch, 'punch_on': round(p_on, 2) if p_on else None, 'audio': a})
DUR = round(t + 0.3, 2)
assert all(s['t1'] - s['t0'] >= 2.5 for s in out), 'a step is too short to read'
json.dump({'TITLE': TITLE, 'DUR': DUR, 'ISP_PAUSE': ISP_PAUSE, 'steps': out}, open('timeline.json', 'w'), indent=1)
for s in out:
    au = f"  ♪ {s['audio']['file']} {s['audio']['at']}–{s['audio']['end']}" if s['audio'] else ''
    print(f"Day {s['day']!s:>3} {s['t0']:6.2f}–{s['t1']:6.2f} ({s['t1'] - s['t0']:.1f}s)  {s['range']:<24}{au}")
print('DUR', DUR)
