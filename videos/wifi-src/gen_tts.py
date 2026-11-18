# ElevenLabs TTS (eleven_v3, with timestamps) for each line, once. Check them with ../tools/whisper_lines.py (free) — Scribe only for the final mix.
# usage: python3 gen_tts.py [keys...]   (ELEVENLABS_API_KEY from env)
import json, base64, subprocess, sys, os
LINES = {   # Wi-Fi episode: voicemail + the hero's lines (Revision 1, approved)
 'isp': ('cjVigY5qzO86Huf0OWal', '[polite, nervous, phone voicemail] Hi... this is your internet provider. We have... questions.'),
 'hmm': ('eRcsJdPMOM0mtGC03ul7', '[tired, resigned, quiet] Hmm...'),
 'h1': ('eRcsJdPMOM0mtGC03ul7', '[pleading, frustrated] Come on... one bar. Just one more bar.'),
 'h3': ('eRcsJdPMOM0mtGC03ul7', '[outraged, confused] Who is watching Peppa Pig on MY account?!'),
 'h5': ('eRcsJdPMOM0mtGC03ul7', '[shouting out of a window, outraged] Oi! I can see your phones! That is MY Wi-Fi!'),
 'h12': ('eRcsJdPMOM0mtGC03ul7', '[smug, proud] Flight 302... you are welcome.'),
 'h15': ('eRcsJdPMOM0mtGC03ul7', '[smug, slow, deep voice] From today... you call me... [pause] Landlord.'),
 'h20': ('eRcsJdPMOM0mtGC03ul7', '[calm, bored] Tell them to turn it off and on again.'),
 'h72': ('eRcsJdPMOM0mtGC03ul7', '[sad, deflated] Left on read... by a whole galaxy.'),
 'kq': ('eRcsJdPMOM0mtGC03ul7', '[confused, shocked, staring] Bomboclaat?'),
 'ks': ('eRcsJdPMOM0mtGC03ul7', '[stuttering in disbelief, getting louder] Bombo... bombo... BOMBOCLAAAT!'),
 'kl': ('eRcsJdPMOM0mtGC03ul7', '[screaming, rising panic, getting louder and louder] BOMBOOOOOOOOOOOOOOOO'),
 'kr': ('eRcsJdPMOM0mtGC03ul7', '[tired, defeated, quiet sigh] Hmm... bomboclaat.'),
 'hend': ('eRcsJdPMOM0mtGC03ul7', '[tired, defeated] The whole universe is connected... and I cannot load one video.'),
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
