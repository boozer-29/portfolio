# "What if your mum's cooking doubled every day?" — source

Build/render (Playwright + Chromium preinstalled; `npm i` for three + fonts):
1. `python3 gen_tts.py` — ElevenLabs lines into `audio/` (already included).
2. Music bed (vocals removed so the transcript never hears lyrics): 
   `ffmpeg -i ../assets/music/let_it_all_work_out.mp3 -af "aformat=sample_rates=44100:channel_layouts=stereo,lowpass=f=120,lowpass=f=120,lowpass=f=120,volume=2.5" -c:a pcm_f32le song_nv.wav`
3. `python3 mums_audio.py` — mix + `dialogue.json` (word timing was then retimed from a Scribe transcript, `fix_spans.py`).
4. `./build.sh` (concatenates `part_*.js` into `mums.js`), then `RSCALE=1 node render.js range 0 1656 frames/` (RSCALE=0.5 for preview).
5. Encode: `ffmpeg -framerate 30 -i frames/%05d.jpg -i mix.wav -c:v libx264 -crf 17 -maxrate 10M -bufsize 20M -pix_fmt yuv420p -c:a aac -b:a 256k -shortest out.mp4`
6. QA: `node capcheck.js && python3 qa_final.py out.mp4 frames/`
