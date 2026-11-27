# ElevenLabs TTS (eleven_v3, with timestamps) for each line, once. Check them with ../tools/whisper_lines.py (free) — Scribe only for the final mix.
# usage: python3 gen_tts.py [keys...]   (ELEVENLABS_API_KEY from env)
import json, base64, subprocess, sys, os
LINES = {   # v2 script: date on Saturday, the tool doubles too
 'h1': ('eRcsJdPMOM0mtGC03ul7', '[cocky, confident, speaking clearly] Date. On Saturday... Easy.'),
 'h2': ('eRcsJdPMOM0mtGC03ul7', '[offended, slow] ...Excuse you.'),
 'b3': ('FGY2WhTYpPnrIDTdsKH5', '[indignant, annoyed] Excuse me. We have a lease.'),
 'r4': ('Gubgw9l4dtIoQA9YZHgx', '[deadpan, slow, tired] It\'s yours... now.'),
 'h5': ('eRcsJdPMOM0mtGC03ul7', '[dazed, cheerful] I\'m okay!'),
 'n6': ('onwK4e9ZLuTAKqWW03F9', '[serious, slow] Experts have confirmed... it does say help.'),
 'a7': ('CwhRBWXzGAHq8TQ4Fs17', '[flat, calm, radio] Houston... we have a tangle.'),
 'h8': ('eRcsJdPMOM0mtGC03ul7', '[proud, posing] You know what? It\'s a look.'),
 'd9': ('hpp4J3VqNfWAUOO0d1Us', '[warm, casual] Sorry I\'m late. Traffic.'),
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
