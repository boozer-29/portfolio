import json, urllib.request, urllib.error, time, sys
H={'xi-api-key':'dummy','Content-Type':'application/json'}
def post(url, body, out):
    for a in range(6):
        try:
            r=urllib.request.Request(url, data=json.dumps(body).encode(), headers=H, method='POST')
            with urllib.request.urlopen(r, timeout=600) as f: open(out,'wb').write(f.read()); print('ok',out); return
        except urllib.error.HTTPError as e:
            msg=e.read()[:300]
            if e.code==429: time.sleep(5); continue
            print('ERR',out,e.code,msg); return
M={
 'mu_sad.mp3':('Instrumental only. Sad lonely lo-fi piano, slow, soft vinyl crackle, melancholic minor chords, comedic heartbreak mood, no drums.',11000),
 'mu_dancehall.mp3':('Instrumental only, no vocals. Bouncy modern Jamaican dancehall riddim, 100 BPM, punchy kick, rimshot snare, deep bass, bright steel-drum and synth plucks, confident swaggering party vibe, starts immediately with full beat.',32000),
 'mu_cosmic.mp3':('Instrumental only. Epic cinematic space build-up, huge synth pads, choir-like swells, pounding drums building to a massive climax, heroic and absurdly grand.',11000),
 'mu_slowjam.mp3':('Instrumental only. Smooth romantic 90s R&B slow jam, saxophone melody, warm Rhodes keys, soft finger snaps, cheesy seductive love-song vibe.',10000),
}
for k,(p,ms) in M.items():
    post('https://api.elevenlabs.io/v1/music', {'prompt':p,'music_length_ms':ms,'force_instrumental':True}, k)
for k,p in {'sfx_scratch.mp3':'Vinyl record scratch, music stops abruptly, comedic','sfx_screams.mp3':'Crowd of excited fangirls screaming and cheering wildly','sfx_whistle.mp3':'Cartoon wolf whistle, comedic'}.items():
    post('https://api.elevenlabs.io/v1/sound-generation', {'text':p,'duration_seconds':2.0 if 'scratch' in k else 3.0}, k)
