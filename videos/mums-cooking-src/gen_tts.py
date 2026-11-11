import json, base64, subprocess, sys, os
LINES = {
 'h1': ('eRcsJdPMOM0mtGC03ul7', '[warm, delighted, Nigerian accent] Mummy, this one sweet o.'),
 'n2': ('ZbSLps6NpxbxBHqX5xPw', '[innocent, sheepish, Nigerian accent] I just dey pass.'),
 'f4': ('dhwafD61uVd8h85wAZSE', '[deadpan, matter-of-fact, Nigerian accent] Dem no even need bait again.'),
 'p5': ('NFG5qt843uXKj4pFvR7C', '[calm, professional] Ladies and gentlemen, we are making a small detour.'),
 'm6': ('p4M8XW4N954o56wN9vKM', '[unbothered, flat, Nigerian accent] Wash your hands first.'),
 'h7': ('eRcsJdPMOM0mtGC03ul7', '[overwhelmed, amazed, Nigerian accent] Ah God, this is too much rice!'),
 'a8': ('e6gztcS9NPqChYKvXN6c', '[dreamy, tranquil] Houston... we are not coming back.'),
 'm9': ('p4M8XW4N954o56wN9vKM', '[calm, curious, Nigerian accent] Who invited all these people?'),
 'h9': ('eRcsJdPMOM0mtGC03ul7', '[deflated, sad, Nigerian accent] So... nothing remain for me?'),
}
only = sys.argv[1:] or list(LINES)
for k in only:
    vid, text = LINES[k]
    if os.path.exists(f'audio/{k}.mp3'): print('skip', k); continue
    body = json.dumps({'text': text, 'model_id': 'eleven_v3'})
    r = subprocess.run(['curl','-sS','-H','xi-api-key: dummy','-H','Content-Type: application/json','-d',body,f'https://api.elevenlabs.io/v1/text-to-speech/{vid}/with-timestamps?output_format=mp3_44100_128'],capture_output=True,text=True)
    try: j = json.loads(r.stdout)
    except Exception: print(k,'ERR',r.stdout[:300]); continue
    if 'audio_base64' not in j: print(k,'ERR',json.dumps(j)[:300]); continue
    open(f'audio/{k}.mp3','wb').write(base64.b64decode(j['audio_base64']))
    json.dump(j['alignment'], open(f'audio/{k}.json','w'))
    print(k,'ok',len(j['alignment']['characters']))
