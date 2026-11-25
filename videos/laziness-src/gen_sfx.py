# Laziness: music stings + ambience/SFX (ElevenLabs music + sound generation), generated once. usage: python3 gen_sfx.py
import json, subprocess, os
KEY = os.environ['ELEVENLABS_API_KEY']
SFX = {'snore': ('a single comedic cartoon snore from a man falling asleep standing up, long inhale snore then a whistle out', 3),
       'thunder': ('loud thunder crack and heavy storm rain, then the power cutting out with an electrical buzz dying down', 5),
       'walla_dark': ('city crowd panicking in a blackout, people shouting in the distance, car horns, sirens', 6),
       'walla_cheer': ('a whole city cheering and whooping as the lights come back on, car horns honking happily, distant applause', 6),
       'golf_clap': ('polite golf crowd applause and a few murmurs of amazement, outdoors', 3),
       'audience_ooh': ('TV studio audience going ooooh, then applauding', 3),
       'blower': ('a petrol leaf blower revving up loudly indoors', 3),
       'drone': ('a small toy drone buzzing and hovering close by', 5),
       'smash': ('a single ceramic dinner plate smashing on a hard floor', 1),
       'walla_street': ('quiet London residential street, a few neighbours chatting from windows, birds, distant traffic', 8),
       'room_flat': ('quiet shared flat in the morning, a fridge humming, a kettle, birds and traffic outside the window', 8),
       'factory': ('busy comedic factory: conveyor belts whirring, robot arms hissing and clanking, rhythmic machines', 6),
       'power_up': ('a huge power station switching back on, a deep electrical hum rising, big relays clunking on one after another', 4)}
for k, (txt, d) in SFX.items():
    if os.path.exists(f'audio/{k}.mp3'): print('skip', k); continue
    r = subprocess.run(['curl', '-sS', '-H', 'xi-api-key: ' + KEY, '-H', 'Content-Type: application/json', '-d', json.dumps({'text': txt, 'duration_seconds': d, 'prompt_influence': 0.5}), 'https://api.elevenlabs.io/v1/sound-generation', '-o', f'audio/{k}.mp3', '-w', '%{http_code}'], capture_output=True, text=True)
    print(k, r.stdout)
MUS = {'jingle': ('Instrumental only. Cheesy over-the-top 1990s American TV infomercial jingle, bright brass stabs, synth bass, cowbell, very upbeat and salesy, ends on a big ta-daa.', 8000)}
for k, (p, ms) in MUS.items():
    if os.path.exists(f'audio/{k}.mp3'): print('skip', k); continue
    r = subprocess.run(['curl', '-sS', '-H', 'xi-api-key: ' + KEY, '-H', 'Content-Type: application/json', '-d', json.dumps({'prompt': p, 'music_length_ms': ms, 'force_instrumental': True}), 'https://api.elevenlabs.io/v1/music', '-o', f'audio/{k}.mp3', '-w', '%{http_code}'], capture_output=True, text=True)
    print(k, r.stdout)
