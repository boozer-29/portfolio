import urllib.error, time
import json, base64, urllib.request, sys, concurrent.futures as cf
H={'xi-api-key':'dummy','Content-Type':'application/json'}
def post(url, body):
    r=urllib.request.Request(url, data=json.dumps(body).encode(), headers=H, method='POST')
    with urllib.request.urlopen(r, timeout=300) as f: return f.read(), f.headers.get('content-type')
V={'hero':'RwxnXycZivqX0ua10Yoh','pigeon':'dhwafD61uVd8h85wAZSE','stranger':'ZbSLps6NpxbxBHqX5xPw','anchor':'9ZbFvrGBxO3uSmsw6wdI','astro':'e6gztcS9NPqChYKvXN6c','sun':'RRIjxt3K1iKEkfsLGRXU'}
LINES={
 'l_hook':('hero','[sad, mumbling] Mi send har one "hey"...'),
 'l_d1':('hero','[devastated, quiet] She leave mi pon read... Mi life done.'),
 'l_d2':('hero','[shocked whisper] Wait... she seh LOL?!'),
 'l_d3s':('stranger','[flirty, excited] Wah gwaan, handsome!'),
 'l_d3h':('hero','[smug] Ah suh mi stay.'),
 'l_d4h':('hero','[confused, shouting] Why di pigeon dem a follow mi?!'),
 'l_d4p':('pigeon','[deep, slow, seductive] Coo... yuh single?'),
 'l_d5':('hero','[cocky, laughing] Easy, easy! One at a time, man!'),
 'l_d6':('anchor','[urgent breaking news] Breaking news. A local man\'s rizz is now a public safety issue.'),
 'l_d7':('astro','[panicking, radio] Houston... the Moon is BLUSHING!'),
 'l_d8':('hero','[amazed] Di planets dem line up fi mi!'),
 'l_d9s':('sun','[shy, flirty, whispering] Hey... can I get your number?'),
 'l_end':('hero','[deadpan, smooth] Sorry, darlin\'... mi nuh date older woman.'),
}
SHOUTS=['[shouting] BOMBOCLAAAT!','[screaming, shocked] BOMBOCLAAAAT!','[yelling, excited] BOMBOCLAAT!','[shouting in disbelief] BOMBO... CLAAAAT!','[screaming at the top of his lungs] BOMBOCLAAAAAAT!','[shocked gasp, shouting] BOMBOCLAAT?!','[hyped, shouting] BOMBOCLAAAT!','[echoing scream] BOMBOCLAAAAAT!']
def tts(name, voice, text, model='eleven_v3'):
  for a in range(6):
   try:
    return _tts(name,voice,text,model)
   except urllib.error.HTTPError as e:
    if e.code==429: time.sleep(4); continue
    raise
def _tts(name, voice, text, model):
    b,_=post(f'https://api.elevenlabs.io/v1/text-to-speech/{voice}/with-timestamps?output_format=mp3_44100_128', {'text':text,'model_id':model})
    d=json.loads(b); open(name+'.mp3','wb').write(base64.b64decode(d['audio_base64'])); json.dump(d.get('normalized_alignment') or d.get('alignment'), open(name+'.json','w')); return name
import os,time
jobs=[(k,V[v],t) for k,(v,t) in LINES.items()]+[(f'shout{i}',V['hero'],s) for i,s in enumerate(SHOUTS)]
jobs=[j for j in jobs if not os.path.exists(j[0]+'.mp3')]
with cf.ThreadPoolExecutor(2) as ex:
    for fut in cf.as_completed([ex.submit(tts,*j) for j in jobs]):
        try: print('ok',fut.result())
        except Exception as e: print('ERR',e, getattr(e,'read',lambda:b'')()[:300])
