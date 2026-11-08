# Builds dialogue.json (captions + mix placement) from ElevenLabs alignment data.
# All times are OUTPUT times (after the time-warp).
import json, os
D = os.path.dirname(os.path.abspath(__file__)); A = os.path.join(D, 'audio2')

# (file, speaker, place_at, trim_start, trim_end or None, kind)
CUES = [
    ('k_hook', 'hero', 0.7, 0, None, 'line'),
    ('k_d1', 'hero', 5.0, 0, None, 'line'),
    ('k_d2', 'hero', 10.5, 0, None, 'line'),
    ('ksts05', 'hero', 12.78, 0, None, 'shout', 'BOMBOCLAAT!'),      # D2 "lol" realisation -> beat drop into D3
    ('l_d3s', 'stranger', 14.7, 0, None, 'line'),
    ('k_d3h', 'hero', 16.35, 0, None, 'line'),
    ('ksts06', 'hero', 18.02, 0, None, 'shout', 'BOMBOCLAAT?!'),       # D4
    ('k_d4h', 'hero', 19.0, 0, None, 'line'),
    ('l_d4p', 'pigeon', 20.85, 0, None, 'line'),
    ('ksts00', 'hero', 23.22, 0, None, 'shout', 'BOMBOCLAAAT!'),      # D5
    ('k_d5', 'hero', 24.6, 0, 1.6, 'line'),
    ('ksts05', 'hero', 30.35, 0, None, 'shout', 'BOMBOCLAAT!'),       # D6
    ('l_d6', 'anchor', 32.3, 1.2, None, 'line'),
    ('ksts10', 'hero', 36.21, 0, None, 'shout', 'BOMBOCLAAAAT!'),      # D7 (space echo)
    ('l_d7', 'astro', 39.2, 0, None, 'line'),
    ('ksts05', 'hero', 42.12, 0, None, 'shout', 'BOMBOCLAAT!'),      # D8
    ('k_d8', 'hero', 44.0, 0, None, 'line'),
    ('ksts00', 'hero', 48.0, 0, None, 'shout', 'BOMBOCLAAAAT!'),      # D9 after the silence drop
    ('l_d9s', 'sun', 50.2, 0, None, 'line'),
    ('k_end', 'hero', 52.85, 0, None, 'line'),
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
    # speech ends only at a TRAILING silence (one that runs to the end of the file)
    dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', os.path.join(A, f + '.mp3')], capture_output=True, text=True).stdout)
    off = None
    if st and st[-1] > on + 0.3 and (len(en) < len(st) or en[-1] >= dur - 0.08): off = st[-1]
    return on, off
for cue in CUES:
    f, spk, at, ts, te, kind = cue[:6]
    if len(cue) > 6:  # re-voiced sample shout: 'at' is the desired speech onset
        on, endp = speech_span(f); at = round(at - on, 3)
        dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', os.path.join(A, f + '.mp3')], capture_output=True, text=True).stdout)
        endp = endp or dur
        out.append({'file': f, 'speaker': spk, 'at': at, 'ts': 0, 'te': None, 'kind': kind, 'words': [{'w': cue[6], 't': round(at + on, 3)}], 'end': round(at + endp, 3)}); continue
    ws, last = words_of(f, ts, te)
    on_, sp_end = speech_span(f)
    if sp_end: last = min(last, sp_end + 0.05)
    if te is not None: last = min(last, te)
    off = at - ts
    out.append({'file': f, 'speaker': spk, 'at': at, 'ts': ts, 'te': te, 'kind': kind,
                'words': [{'w': w.upper() if kind == 'shout' else w, 't': round(t + off, 3)} for w, t in ws],
                'end': round(last + off, 3)})
json.dump(out, open(os.path.join(D, 'dialogue.json'), 'w'), indent=1)
for o in out: print(f"{o['at']:6.2f} {o['words'][0]['t']:6.2f}-{o['end']:6.2f} {o['speaker']:8} {' '.join(w['w'] for w in o['words'])}")
