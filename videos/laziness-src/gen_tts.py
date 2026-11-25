# ElevenLabs TTS (eleven_v3, with timestamps) for each line, once. Check them with ../tools/whisper_lines.py (free) — Scribe only for the final mix.
# usage: python3 gen_tts.py [keys...]   (ELEVENLABS_API_KEY from env)
import json, base64, subprocess, sys, os
LINES = {   # Laziness (script approved 2026-11-25). Kevin = hero; Dev = RV; Priya = Alice; host = Adam; golf = William; engineer = David;
            # background: driver = Sumon, neighbour = Matilda, blackout voice = Sarah (all new to the series)
 'h0':   ('eRcsJdPMOM0mtGC03ul7', "[flat, lazy, deadpan, lying face down on a sofa] Everyone in this flat does chores. Except me."),
 'nah':  ('eRcsJdPMOM0mtGC03ul7', "[slow, lazy, deadpan, can't be bothered at all] Mmm... nah."),
 'h1':   ('eRcsJdPMOM0mtGC03ul7', "[muffled, face pressed into the carpet, content] Floor's comfy, innit."),
 'h2':   ('eRcsJdPMOM0mtGC03ul7', "[calm, quietly satisfied] Caught one."),
 'h4':   ('eRcsJdPMOM0mtGC03ul7', "[sleepy, cosy, soft voice, not whispering] Night, night."),
 'h6':   ('eRcsJdPMOM0mtGC03ul7', "[deadpan, straight to camera, like the end of an advert] Call now. Actually... don't."),
 'h9':   ('eRcsJdPMOM0mtGC03ul7', "[mumbling with a mouth full of toothpaste foam] Two minutes. Dentist said."),
 'h13':  ('eRcsJdPMOM0mtGC03ul7', "[dead serious, philosophical, slow] Walking is just falling... but slowly."),
 'h16':  ('eRcsJdPMOM0mtGC03ul7', "[relaxed, generous, lazy] Keep the change. It's on its way."),
 'h25':  ('eRcsJdPMOM0mtGC03ul7', "[proud, lazy, smug] Why walk... when London can do it for me?"),
 'sy':   ('eRcsJdPMOM0mtGC03ul7', "[shocked, but yawning hugely in the middle of the word] Bombo... [yawns] ...claaat."),
 'yawn': ('eRcsJdPMOM0mtGC03ul7', "[big long loud yawn, mouth wide open] Aaaaaaaahhhh-hmmmm."),
 'sa':   ('eRcsJdPMOM0mtGC03ul7', "[starting to shout, but too lazy to finish, trailing off and falling asleep] Bom... bo..."),
 'sb':   ('eRcsJdPMOM0mtGC03ul7', "[waking up for one second, sleepy, mumbling, finishing his word] ...claaat."),
 'd1':   ('kPv1bzDMIBuZDSXRjCAT', "[hyped gym bro, bouncing on his toes] Bro. Gym?"),
 'd9':   ('kPv1bzDMIBuZDSXRjCAT', "[startled, outraged] Bro! My eyebrows!"),
 'd13':  ('kPv1bzDMIBuZDSXRjCAT', "[whispering, desperate, begging] Bro. It's ONE step."),
 'dEnd': ('kPv1bzDMIBuZDSXRjCAT', "[bursting in, excited, out of breath] Bro! The King wants to give you a medal! You gotta go to the palace!"),
 'p2':   ('Xb7hH8MSUJpSbSDYk0k2', "[disgusted, shrieking] My rota!"),
 'p20':  ('Xb7hH8MSUJpSbSDYk0k2', "[furious, through gritted teeth] Your name is STILL not on this rota."),
 'host': ('pNInz6obpgDQGcFmaJgB', "[over-the-top American TV infomercial host, huge energy, shouting with joy] Tired of washing up? Introducing... the SINK-O-MATIC!"),
 'golf': ('mGYXQUKA7vEbwSnoNuBD', "[hushed whisper, British golf commentator, amazed] He's going for the doorbell... from the sofa. The audacity."),
 'eng':  ('idhN4TDLN5lGcHTWtz8p', "[panicking, shouting over a crackly radio] The backup switch is twelve kilometres away... and nobody can get here!"),
 'drv':  ('rjzfuMqaVXKNgQQStSXa', "[confused, catching a coin] Cheers... I think?"),
 'nb':   ('XrExE9yKIg1WjnnlVkGX', "[cheerful, shouting across the rooftops] Oi! Send the ketchup down the string!"),
 'bo':   ('EXAVITQu4vr4xnSDxMaL', "[scared, in the dark] Who turned the lights off?!"),
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
