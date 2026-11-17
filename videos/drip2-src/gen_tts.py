# ElevenLabs TTS (eleven_v3, with timestamps) for each line, once. Check them with ../tools/whisper_lines.py (free) — Scribe only for the final mix.
# usage: python3 gen_tts.py [keys...]   (ELEVENLABS_API_KEY from env)
import json, base64, subprocess, sys, os
LINES = {   # Drip v2 (script approved 2026-11-17). Kevin = hero; bouncer = Oliver Silk; narrator = Rowan; judge = George; mugger = Callum (all new to the series)
 'b1': ('jfIS2w2yJi0grJZPyEsk', "[deadpan, unimpressed, slowly looking him up and down] Not tonight, mate. Is that... a curtain?"),
 'b2': ('jfIS2w2yJi0grJZPyEsk', "[deadpan, flat, not even sorry] Sorry, mate. Dress code."),
 'narr': ('kLhAstPcnnPxqzk6gS5i', "[hushed, whispering, nature documentary narrator] The male peacock displays his feathers... then he sees the competition."),
 'judge1': ('JBFqnCBsd6RMkjVDRZzb', "[stern, elderly British judge, firm] How do you plead?"),
 'judge2': ('JBFqnCBsd6RMkjVDRZzb', "[leaning in, whispering, genuinely curious] Where's the jacket from?"),
 'mugger': ('N2lVS1w4EtoT3dr4eOWO', "[impressed, walking away, London accent] Respect, bro. Respect."),
 'h1': ('eRcsJdPMOM0mtGC03ul7', "[indignant, proud, offended] It's vintage, bredda!"),
 'h3': ('eRcsJdPMOM0mtGC03ul7', "[confused, offended, staring at his own shadow] Oi! Who teach YOU fi walk like dat?"),
 'h5': ('eRcsJdPMOM0mtGC03ul7', "[awkward, apologetic, quiet] Sorry, boss."),
 'h8': ('eRcsJdPMOM0mtGC03ul7', "[nervous whisper, backing away slowly] Mi nah like dis."),
 'h12': ('eRcsJdPMOM0mtGC03ul7', "[unbothered, smug, cool] Rain cyaan touch di fit."),
 'h15': ('eRcsJdPMOM0mtGC03ul7', "[proud, dramatic, slow] Guilty... of being too fresh."),
 'kw': ('eRcsJdPMOM0mtGC03ul7', "[whispering under his breath, stunned] bomboclaat."),
 'ksq': ('eRcsJdPMOM0mtGC03ul7', "[voice cracking into a high-pitched squeak, disbelief] Bomboclaat?"),
}
KEY = os.environ.get('ELEVENLABS_API_KEY', 'dummy')
only = sys.argv[1:] or list(LINES)
for k in only:
    vid, text = LINES[k]
    if os.path.exists(f'audio/{k}.mp3'): print('skip', k); continue
    body = json.dumps({'text': text, 'model_id': 'eleven_v3'})
    r = subprocess.run(['curl', '-sS', '-H', 'xi-api-key: ' + KEY, '-H', 'Content-Type: application/json', '-d', body, f'https://api.elevenlabs.io/v1/text-to-speech/{vid}/with-timestamps?output_format=mp3_44100_128'], capture_output=True, text=True)
    try: j = json.loads(r.stdout)
    except Exception: print(k, 'ERR', r.stdout[:300]); continue
    if 'audio_base64' not in j: print(k, 'ERR', json.dumps(j)[:300]); continue
    open(f'audio/{k}.mp3', 'wb').write(base64.b64decode(j['audio_base64']))
    json.dump(j['alignment'], open(f'audio/{k}.json', 'w'))
    print(k, 'ok')
