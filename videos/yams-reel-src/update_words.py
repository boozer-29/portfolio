import json
D=json.load(open('dialogue.json')); stt=[w for w in json.load(open('voice_stt.json'))['words'] if w['type']=='word']
for c in D:
    s0=c['spans'][0][0]-0.08; s1=c['spans'][-1][1]+0.08
    ws=[w for w in stt if s0 <= (w['start']+w['end'])/2 <= s1]
    n,m=len(c['words']),len(ws)
    if c['kind']=='shout':
        c['words'][0]['t']=round(max(c['spans'][0][0], min(c['words'][0]['t'], ws[0]['start'] if ws else 99)),3); continue
    for i,w in enumerate(c['words']):
        # same word count -> trust the transcript of the real mix; otherwise use the generator's own alignment for this audio
        t = ws[i]['start'] if m == n else w['t']
        w['t']=round(max(c['spans'][0][0], t),3)
    for i in range(1,n): c['words'][i]['t']=max(c['words'][i]['t'],c['words'][i-1]['t'])
    c['stt']=' '.join(w['text'] for w in ws)
json.dump(D,open('dialogue.json','w'),indent=1)
for c in D: print(f"{c['file']:10} {c['speaker']:8} n={len(c['words'])} stt=[{c.get('stt','')}]  " + ' '.join(f"{w['w']}@{w['t']}" for w in c['words'])[:120])
