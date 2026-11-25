# ElevenLabs TTS (eleven_v3, with timestamps) for each line, once. Check them with ../tools/whisper_lines.py (free) — Scribe only for the final mix.
# usage: python3 gen_tts.py [keys...]   (ELEVENLABS_API_KEY from env)
import json, base64, subprocess, sys, os
LINES = {   # Luck (script approved 2026-11-25). Kevin = hero; Marcus = Harry; kid = Della (pitched up in the mix); driver = Nolan;
            # commentator = Bill; racegoer = River; pit boss = Jack; lottery host = Brian (nPcz); bakery lady = Grandma Santa Maria (all new to the series)
 'h0':   ('eRcsJdPMOM0mtGC03ul7', "[flat, sorry for himself, deadpan] Everybody wins something. Except me."),
 'h1':   ('eRcsJdPMOM0mtGC03ul7', "[flat, defeated, not even surprised] Course it did."),
 'h2':   ('eRcsJdPMOM0mtGC03ul7', "[stunned, then delighted, can't believe it] Five pound? For ME?"),
 'h3':   ('eRcsJdPMOM0mtGC03ul7', "[strolling, casual, a bit smug] I never even pressed the button."),
 'h13':  ('eRcsJdPMOM0mtGC03ul7', "[quiet, staring, genuinely unsettled, not whispering] Okay... now I'm scared."),
 'h23':  ('eRcsJdPMOM0mtGC03ul7', "[kind, comforting, patting a friend's shoulder] Look on the bright side. You've got a meteorite."),
 'h26':  ('eRcsJdPMOM0mtGC03ul7', "[deadpan, flat, reading his phone, pronouncing every word clearly] Sixty-four... pennies."),
 'hEnd': ('eRcsJdPMOM0mtGC03ul7', "[calm, slow, sweet revenge, smug] Unlucky, mate."),
 'sl':   ('eRcsJdPMOM0mtGC03ul7', "[laughing uncontrollably while shouting, can't stop laughing] Bombo... hahahaha... claaat!"),
 'sc':   ('eRcsJdPMOM0mtGC03ul7', "[singing like a gospel choir, hallelujah, one long held high note] Bombo-claaaaaaaaat!"),
 'm0':   ('SOYHLrjzK2X1ezoPC6cr', "[smug, smirking, chewing] Unlucky, mate."),
 'm7':   ('SOYHLrjzK2X1ezoPC6cr', "[spluttering, soaked, dripping, stunned] Un... lucky."),
 'm23':  ('SOYHLrjzK2X1ezoPC6cr', "[tiny, broken voice, about to cry] Unlucky..."),
 'kid':  ('WJKK5TZYH4eofsHoDaNT', "[outraged little kid, pointing, shouting] Mum! He took ALL of them!"),
 'drv':  ('31Il5zoNpJznlwCVD8UT', "[angry, leaning out of a car window, shouting] Oi! Seriously?!"),
 'com':  ('pqHfZKP75CvOlQylNhV4', "[frantic horse racing commentator, shouting fast, amazed] And the favourite has stopped... for a sandwich!"),
 'rg':   ('SAz9YHcvj6GT2YYXdXww', "[excited, nudging friends, loud] He's backing the pony. Copy him!"),
 'boss': ('BVPhWQykET1TSvfGzrUr', "[sweating, nervous, very polite] Sir. Please. Take it all... and leave."),
 'host': ('nPczCjzI2devNBz1zQrb', "[cheesy nineties TV lottery host, beaming, huge energy] This week's jackpot is shared by thirty-one million winners!"),
 'lady': ('A0g6t0RQc9zkMPsGNEIG', "[warm, friendly old lady behind a counter] Last one, love."),
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
