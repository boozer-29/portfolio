# Crowd ambience beds (ElevenLabs sound generation), generated once. usage: python3 gen_sfx.py
import json, subprocess, os
KEY = os.environ['ELEVENLABS_API_KEY']
SFX = {'walla_club': ('muffled crowd chatter and laughter in a queue outside a nightclub at night, bass thumping through the wall', 9),
       'walla_gallery': ('hushed art gallery crowd murmuring and whispering, footsteps echoing in a big quiet hall', 7),
       'walla_street': ('busy London high street crowd chatter, people talking and laughing, footsteps', 8),
       'walla_court': ('small courtroom audience gasps and murmurs ooooh', 3)}
for k, (txt, d) in SFX.items():
    if os.path.exists(f'audio/{k}.mp3'): print('skip', k); continue
    r = subprocess.run(['curl', '-sS', '-H', 'xi-api-key: ' + KEY, '-H', 'Content-Type: application/json', '-d', json.dumps({'text': txt, 'duration_seconds': d, 'prompt_influence': 0.5}), 'https://api.elevenlabs.io/v1/sound-generation', '-o', f'audio/{k}.mp3', '-w', '%{http_code}'], capture_output=True, text=True)
    print(k, r.stdout)
