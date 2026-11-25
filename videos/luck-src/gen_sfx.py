# Luck: ambience beds + SFX (ElevenLabs sound generation), generated once. usage: python3 gen_sfx.py
import json, subprocess, os
KEY = os.environ['ELEVENLABS_API_KEY']
SFX = {'amb_bakery': ('small British bakery on a rainy morning, rain on the window, a coffee machine, quiet customer chatter, a till bell', 8),
       'amb_wind': ('strong gusty wind on a city bridge, people gasping, hats blowing, distant traffic below', 6),
       'amb_traffic': ('rush hour junction, dozens of car horns honking angrily, engines idling, a pedestrian crossing beeping', 7),
       'amb_arcade': ('busy seaside amusement arcade, coin pusher machines, electronic game jingles in the distance, kids laughing', 8),
       'teddy_avalanche': ('a huge pile of soft plush toys pouring out of a machine onto a person, soft thuds and rustling, a machine rattling', 3),
       'splash': ('a bus driving through a big puddle, a huge wave of water splashing onto a person, then dripping', 3),
       'amb_suburb': ('quiet suburban driveway, a car being washed with a sponge and bucket, birds, a lawnmower far away', 7),
       'amb_races': ('horse racing grandstand, a big crowd roaring, hooves thundering past on turf, a commentator-free roar', 7),
       'amb_laundrette': ('a quiet launderette at night, washing machines humming and spinning, a fluorescent light buzzing', 7),
       'amb_casino': ('a busy glamorous casino, chips clattering, a roulette wheel, people murmuring and gasping in amazement', 7),
       'meteor': ('a meteorite screaming down from the sky and smashing into a car, huge impact, metal crunching, glass shattering, debris raining down', 4),
       'amb_pub': ('a packed British pub watching TV, crowd murmuring, then the whole pub erupting in a huge cheer', 7)}
for k, (txt, d) in SFX.items():
    if os.path.exists(f'audio/{k}.mp3'): print('skip', k); continue
    r = subprocess.run(['curl', '-sS', '-H', 'xi-api-key: ' + KEY, '-H', 'Content-Type: application/json', '-d', json.dumps({'text': txt, 'duration_seconds': d, 'prompt_influence': 0.5}), 'https://api.elevenlabs.io/v1/sound-generation', '-o', f'audio/{k}.mp3', '-w', '%{http_code}'], capture_output=True, text=True)
    print(k, r.stdout)
