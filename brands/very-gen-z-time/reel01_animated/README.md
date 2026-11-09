# Reel 01 — animated draft (no ElevenLabs credits)

Real-time 3D (Three.js) low-poly scene rendered frame by frame in headless Chromium,
then graded / captioned / mixed with ffmpeg. Voice lines, SFX and music are the files
generated earlier (`../reel01/audio/`).

Run (from a folder that also contains `node_modules/three`, the fonts and the audio):
1. `npm i three@0.169.0` and `python3 -m http.server 8765` in this folder
2. `node render.js full 0 20` → 480 frames at 24 fps (≈2.5 min on 4 CPUs, software GL)
3. `python3 post.py` → per-shot grade, bloom/grain, pixel captions, VO + SFX + music, tee end card

Shots: A walk-in (wide, push-in) · B boss MCU low angle · C Zay ECU shock · D boss tighter ·
E Zay medium · F Zay CU golden · G tee end card. Mouths flap from the voice-line loudness envelopes (`env.json`).
