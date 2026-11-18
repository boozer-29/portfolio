# Step 2 helper: run local Whisper (whisper.cpp) on voice lines -> words, word timings, pauses, pace.
# usage: python3 whisper_lines.py audio/*.mp3        (writes <line>.whisper.json next to each file)
# needs: brew install whisper-cpp; model at ~/.cache/whisper/ggml-base.en.bin
import json, os, subprocess, sys, tempfile
MODEL = os.path.expanduser(os.environ.get('WHISPER_MODEL', '~/.cache/whisper/ggml-base.en.bin'))
PAUSE = 0.25   # gaps longer than this are reported as pauses

def words_of(tokens):
    """Merge whisper.cpp tokens into words; a token starting with a space starts a new word, punctuation joins the word before."""
    words = []
    for t in tokens:
        tx = t['text']
        if not tx.strip() or tx.startswith('[_'): continue
        s, e = t['offsets']['from'] / 1000, t['offsets']['to'] / 1000
        if words and not tx.startswith(' '):
            words[-1]['w'] += tx.strip()
            if tx.strip().isalnum(): words[-1]['e'] = e   # punctuation doesn't extend the word end
        else: words.append({'w': tx.strip(), 's': s, 'e': e})
    return words

def run(path):
    with tempfile.TemporaryDirectory() as td:
        wav, base = os.path.join(td, 'a.wav'), os.path.join(td, 'out')
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', path, '-ar', '16000', '-ac', '1', wav], check=True)
        subprocess.run(['whisper-cli', '-m', MODEL, '-f', wav, '-ojf', '-of', base, '-np'], check=True, capture_output=True)
        d = json.load(open(base + '.json'))
    words = words_of([t for s in d['transcription'] for t in s['tokens']])
    pauses = [{'after': a['w'], 'at': a['e'], 'len': round(b['s'] - a['e'], 2)} for a, b in zip(words, words[1:]) if b['s'] - a['e'] > PAUSE]
    dur = words[-1]['e'] - words[0]['s'] if words else 0
    return {'file': path, 'text': ' '.join(w['w'] for w in words), 'words': words, 'pauses': pauses,
            'speech': [round(words[0]['s'], 2), round(words[-1]['e'], 2)] if words else None, 'wps': round(len(words) / dur, 2) if dur else 0}

if __name__ == '__main__':
    assert words_of([{'text': ' Hi', 'offsets': {'from': 0, 'to': 200}}, {'text': ',', 'offsets': {'from': 200, 'to': 300}}, {'text': ' you', 'offsets': {'from': 600, 'to': 800}}]) == \
        [{'w': 'Hi,', 's': 0.0, 'e': 0.2}, {'w': 'you', 's': 0.6, 'e': 0.8}]   # self-check of the token merge
    for p in sys.argv[1:]:
        r = run(p); json.dump(r, open(os.path.splitext(p)[0] + '.whisper.json', 'w'), indent=1)
        ps = ', '.join(f"{x['len']}s after '{x['after']}'" for x in r['pauses']) or 'none'
        print(f"{os.path.basename(p):10} {r['speech']}  {r['wps']} words/s  | {r['text']}\n{'':10} pauses: {ps}")
