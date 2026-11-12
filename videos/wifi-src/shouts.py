# Build the episode's BOMBOCLAT variants by editing the recorded takes (never TTS the shout).
# Syllable split measured from the loudness envelope: "BOMBO" ≈ 0.08–0.57 s, dip, "CLAT" ≈ 0.62–1.18 s.
import subprocess, numpy as np
SR = 44100; SH = '../assets/audio/shouts/bomboclat_hero_'
def load(p, af=''):
    cmd = ['ffmpeg', '-v', 'error', '-i', p] + (['-af', af] if af else []) + ['-ac', '2', '-ar', str(SR), '-f', 'f32le', '-']
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32).reshape(-1, 2).copy()
def cut(a, t0, t1, fi=0.004, fo=0.01):
    x = a[int(t0 * SR):int(t1 * SR)].copy(); n1, n2 = int(fi * SR), int(fo * SR)
    if n1: x[:n1] *= np.linspace(0, 1, n1)[:, None]
    if n2: x[-n2:] *= np.linspace(1, 0, n2)[:, None]
    return x
sil = lambda s: np.zeros((int(s * SR), 2), np.float32)
def save(name, x): subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s16le', f'audio/{name}.wav'], input=x.astype(np.float32).tobytes(), check=True); print(name, round(len(x) / SR, 2), 's')
A, B, Q = load(SH + 'A.mp3'), load(SH + 'B.mp3'), load(SH + 'question.mp3')
save('sh_question', cut(Q, 0.10, 1.0))                                                        # "bomboclat?"
save('sh_stutter', np.concatenate([cut(A, 0.10, 0.58), sil(0.2), cut(A, 0.10, 0.58), sil(0.16), cut(B, 0.06, 1.2)]))   # "bombo… bombo… bomboclat!"
long_ = load(SH + 'B.mp3', 'atrim=0.06:0.52,asetpts=PTS-STARTPTS,atempo=0.5,atempo=0.62')        # the "BOOOMBOOOO" stretched ~3.2x, pitch kept
save('sh_long', cut(long_, 0, len(long_) / SR, 0.004, 0.003))                                  # ends on a hard cut (no tail): the next shot cuts it off
hmm = load('audio/hmm.mp3'); res = load(SH + 'B.mp3', 'asetrate=39300,aresample=44100,atempo=1.0,lowpass=f=3200,volume=-5dB')   # ~2 semitones down, dull, tired
save('sh_resigned', np.concatenate([cut(hmm, 0.08, 0.86), sil(0.35), cut(res, 0.06, 1.3)]))   # "hmm… bomboclat."
