# Builds dialogue.json (captions + mix placement) from ElevenLabs alignment data.
# All times are OUTPUT times (after the time-warp).
import json, os
D = os.path.dirname(os.path.abspath(__file__)); A = os.path.join(D, 'audio2')

# (file, speaker, place_at, trim_start, trim_end or None, kind)
CUES = [
    ('l_hook', 'hero', 0.85, 0, None, 'line'),
    ('l_d1', 'hero', 4.8, 0, None, 'line'),
    ('l_d2', 'hero', 10.0, 0, None, 'line'),
    ('sts05', 'hero', 12.78, 0, None, 'shout', 'BOMBOCLAAT!'),      # D2 "lol" realisation -> beat drop into D3
    ('l_d3s', 'stranger', 14.7, 0, None, 'line'),
    ('l_d3h', 'hero', 16.75, 0, 1.3, 'line'),
    ('sts06', 'hero', 18.02, 0, None, 'shout', 'BOMBOCLAAT?!'),       # D4
    ('l_d4h', 'hero', 19.3, 0, None, 'line'),
    ('l_d4p', 'pigeon', 21.15, 0, None, 'line'),
    ('sts00', 'hero', 23.22, 0, None, 'shout', 'BOMBOCLAAAT!'),      # D5
    ('l_d5', 'hero', 24.5, 0, 2.2, 'line'),
    ('sts01', 'hero', 30.35, 0, None, 'shout', 'BOMBOCLAAT!'),       # D6
    ('l_d6', 'anchor', 32.3, 1.2, None, 'line'),
    ('sts10', 'hero', 36.21, 0, None, 'shout', 'BOMBOCLAAAAT!'),      # D7 (space echo)
    ('l_d7', 'astro', 39.2, 0, None, 'line'),
    ('sts05', 'hero', 42.12, 0, None, 'shout', 'BOMBOCLAAT!'),      # D8
    ('l_d8', 'hero', 44.1, 0, None, 'line'),
    ('sts00', 'hero', 48.0, 0, None, 'shout', 'BOMBOCLAAAAT!'),      # D9 after the silence drop
    ('l_d9s', 'sun', 50.2, 0, None, 'line'),
    ('l_end', 'hero', 52.75, 0, None, 'line'),
    ('sts_sun06', 'sun', 55.88, 0, None, 'shout', 'BOMBOCLAAT?!'),
]

def words_of(name, ts, te):
    al = json.load(open(os.path.join(A, name + '.json')))
    ch, st, en = al['characters'], al['character_start_times_seconds'], al['character_end_times_seconds']
    words, cur, t0, depth, last = [], '', None, 0, 0
    for c, s, e in zip(ch, st, en):
        if c == '[': depth += 1; continue
        if c == ']': depth -= 1; continue
        if depth: continue
        if s < ts or (te is not None and s > te): continue
        if c.isspace():
            if cur.strip(): words.append((cur.strip(), t0))
            cur, t0 = '', None; continue
        if t0 is None: t0 = s
        cur += c; last = e
    if cur.strip(): words.append((cur.strip(), t0))
    return words, last

out = []
import subprocess, re
def speech_span(f):
    o = subprocess.run(['ffmpeg', '-hide_banner', '-i', os.path.join(A, f + '.mp3'), '-af', 'silencedetect=n=-35dB:d=0.1', '-f', 'null', '-'], capture_output=True, text=True).stderr
    st = [float(x) for x in re.findall(r'silence_start: ([0-9.]+)', o)]; en = [float(x) for x in re.findall(r'silence_end: ([0-9.]+)', o)]
    on = en[0] if st and st[0] < 0.01 else 0.0
    off = next((x for x in st if x > on + 0.3), None)
    return on, off
for cue in CUES:
    f, spk, at, ts, te, kind = cue[:6]
    if len(cue) > 6:  # re-voiced sample shout: 'at' is the desired speech onset
        on, endp = speech_span(f); at = round(at - on, 3)
        dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', os.path.join(A, f + '.mp3')], capture_output=True, text=True).stdout)
        endp = endp or dur
        out.append({'file': f, 'speaker': spk, 'at': at, 'ts': 0, 'te': None, 'kind': kind, 'words': [{'w': cue[6], 't': round(at + on, 3)}], 'end': round(at + endp, 3)}); continue
    ws, last = words_of(f, ts, te)
    off = at - ts
    out.append({'file': f, 'speaker': spk, 'at': at, 'ts': ts, 'te': te, 'kind': kind,
                'words': [{'w': w.upper() if kind == 'shout' else w, 't': round(t + off, 3)} for w, t in ws],
                'end': round(last + off, 3)})
json.dump(out, open(os.path.join(D, 'dialogue.json'), 'w'), indent=1)
for o in out: print(f"{o['at']:6.2f} {o['words'][0]['t']:6.2f}-{o['end']:6.2f} {o['speaker']:8} {' '.join(w['w'] for w in o['words'])}")
