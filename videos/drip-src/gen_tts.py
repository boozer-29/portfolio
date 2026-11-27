# ElevenLabs TTS (eleven_v3, with timestamps) for each line, once. Check them with ../tools/whisper_lines.py (free) — Scribe only for the final mix.
# usage: python3 gen_tts.py [keys...]   (ELEVENLABS_API_KEY from env)
import json, base64, subprocess, sys, os
LINES = {   # Drip episode (script approved 2026-11-17). Kevin = hero; Mum = Tracy Ann; pigeon = Hurker (pitched up in the mix); anchor = Daniel; Saturn = Titan
 'mum1': ('ZbSLps6NpxbxBHqX5xPw', "[stern, unimpressed, arms crossed] You're not leaving the house in that."),
 'mum2': ('ZbSLps6NpxbxBHqX5xPw', "[stern, deadpan, unimpressed] You're not leaving the planet in that."),
 'pigeon': ('AgWmGPmoY5bWqnxOVd0j', '[cocky, sizing someone up] Coo... drip check.'),
 'anchor': ('onwK4e9ZLuTAKqWW03F9', '[serious British newsreader] Experts say the drip... is now a flood.'),
 'saturn': ('ZGgk7KqsgEdrlwJ93DA8', '[deep, slow, sincere] Here... you need these more than me.'),
 'h1': ('eRcsJdPMOM0mtGC03ul7', '[proud, cheerful] Mi look fresh, Mummy!'),
 'h3': ('eRcsJdPMOM0mtGC03ul7', '[panicked, protective, shouting] Nobody touch di creps!'),
 'h10': ('eRcsJdPMOM0mtGC03ul7', '[defensive, panicking] A nuh mi fault! A di sun!'),
 'h15': ('eRcsJdPMOM0mtGC03ul7', '[whispering, stunned, in awe] Lawd... a who dat?'),
 'h18': ('eRcsJdPMOM0mtGC03ul7', '[smug, cool, relaxed] Unu need umbrella fi dis.'),
 'h36': ('eRcsJdPMOM0mtGC03ul7', '[smug, slow, cool, clearly emphasizing the last word] Mi good. Mi already have a... ring.'),
 'kq': ('eRcsJdPMOM0mtGC03ul7', '[confused, shocked, staring] Bomboclaat?'),
 'ks': ('eRcsJdPMOM0mtGC03ul7', '[stuttering in disbelief, getting louder] Bombo... bombo... BOMBOCLAAAT!'),
 'kl': ('eRcsJdPMOM0mtGC03ul7', '[screaming, rising panic, getting louder and louder] BOMBOOOOOOOOOOOOOOOO'),
 'kr': ('eRcsJdPMOM0mtGC03ul7', '[tired, defeated, quiet sigh] Hmm... bomboclaat.'),
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
