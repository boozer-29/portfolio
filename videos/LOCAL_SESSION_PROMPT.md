# Prompt for a local Claude Code session (paste everything below the line)

---

You are continuing my Instagram series of low-poly 3D comedy reels, "What if your ___ doubled every day?". A cloud session built the episodes so far; you are now running locally on my computer and take over from here.

## 1. Get the project
- Repo: `boozer-29/portfolio`, branch `claude/cool-bardeen-010lrr`. Clone it, or `git fetch` and check out that branch, and work and push on it only.
- Read these fully before doing anything:
  - `videos/MASTER_PROMPT.md`: the style bible and all rules. Its section 0 talks about Blender, but **every finished episode was made with the three.js + Playwright pipeline below. Keep using that pipeline.**
  - `videos/episodes/`: the episode plans.
  - `videos/mums-cooking-src/README.md`: the build steps for the latest episode.
- **Reference implementation (newest, copy and adapt it, don't start from scratch): `videos/mums-cooking-src/`**
  - `part_a.js` holds the helpers and the hero rig v2 (spine, elbows, knees, face controls, blinks, talk mouth). `part_b.js` and `part_b2.js` hold the scenes. `part_c0.js`…`part_c5.js` hold the shots. `part_d.js` holds the overlays (stat block, title card, captions), grading, camera and motion blur.
  - `./build.sh` concatenates the parts into `mums.js`, which `index.html` loads.
  - `render.js` is the Playwright frame renderer:
    - `node render.js test 3.0 7.5 …` renders single test frames into `TDIR` (defaults to `test/`).
    - `node render.js range 0 1656 frames/` renders a range of frames. It skips frames that already exist, so an interrupted render resumes.
    - `RSCALE=0.5` gives the 540×960 preview and `RSCALE=1` the 1080×1920 final.
    - **`GPU=1` uses the Mac's Metal GPU and is much faster. Use it locally.**
  - `mums_audio.py` is the numpy mixer: loudness-matched voices, dynamic duck, synthesized SFX, the music cuts, the 0.8 s silence before Day 9, loudnorm to −14 LUFS, and the audible spans written to `dialogue.json`.
  - `gen_tts.py` generates the ElevenLabs TTS lines with timestamps. `fix_spans.py` retimes the caption words from a Scribe transcript of the mix.
  - QA:
    - `node capcheck.js` dumps the caption shown on every frame.
    - `python3 qa_final.py out.mp4 frames/` runs every check. It covers 1080×1920/30 fps, duplicate frames, motion, clipping, LUFS/true peak, clicks, Scribe of the final MP4, the shout count, each line heard, captions with 0 errors, and SNR. It calls `verify_captions.py` and `snr_check.py`.
    - `sheet.py` makes contact sheets and `bright.py` checks for overexposure.
  - Older reference: `videos/yams-reel-src/v2/`.

## 2. Local setup
- Run `npm install` in the episode source folder. That installs three@0.169.0, the @fontsource fonts (inter, lora, montserrat, playfair-display) and playwright.
- Run `npx playwright install chromium`.
- Install ffmpeg plus Python 3 with numpy and pillow.
- ElevenLabs: run `export ELEVENLABS_API_KEY=…`. `gen_tts.py` and `qa_final.py` read that variable. Credits are limited, so generate each line once, check it with Scribe, and regenerate only a line that is unclear.
- 8 GB RAM: render in one process (`GPU=1`), not in parallel.

## 3. Assets
- Shouts: `videos/assets/audio/shouts/`. Use takes A and B alternately, and the `_question` take for confused moments. Never TTS the BOMBOCLAT.
- SFX: `videos/assets/audio/sfx/`.
- **Music: always use `videos/assets/music/tiki_tiki.mp3` (TIKI TIKI).** That is my choice. Don't use songs with vocals: the transcript reads the lyrics as speech and the caption QA fails.
- Recurring voice: the hero is Kevin (`eRcsJdPMOM0mtGC03ul7`). Pick other one-off voices from my ElevenLabs voices.

## 4. My standing preferences (on top of MASTER_PROMPT)
- **Stat block: show a real quantity with a unit, not a bare number.** Write it like "6 mph", "70 dB", "200 J" or "256 kg". The layout is: a label (e.g. JOLLOF COOKED), the big number with its unit in Lora, a comparison line, DAY n, and the red pill ×2 EVERY DAY.
- Standalone episodes: only the hero recurs. No returning characters, props or jokes.
- No narration. Silent title card at the start. A BOMBOCLAT on every doubling and one at the end.
- Captions appear only while that character is audibly speaking, timed from Scribe of the final mix, with 0 caption errors.
- Clean animation:
  - anticipation plus squash/stretch on every doubling
  - mouths move only while speaking, and blinks
  - the camera always moves, with no frozen or duplicate frames
  - no camera inside geometry
  - **faces are never hidden**, by props, pots, hands or captions
  - no overexposure (check with `bright.py`)
- Delivery: Full HD 1080×1920, 30 fps (RSCALE=1), never 4K. File name `videos/polygram-<topic>-1080p.mp4`, source in `videos/<topic>-src/`.

## 5. Workflow for each episode
1. Build the episode, then send me a quick LOW-RES preview (RSCALE=0.5) and a contact sheet. Stop and wait for my approval.
2. Apply my changes, render the final 1080p, and run the full QA (adapt `qa_final.py` to the episode's lines and frame count). Fix anything that fails.
3. Commit, push, and give me the video. Keep messages short.

## 6. Lessons learned (avoid these bugs)
- `Object3D.add()` returns the parent. Use the `T(parent, child)` helper when you need the child, e.g. `T(g, cyl(...)).rotation.z = …`.
- Every rig must be added to its scene (`sc.add(P.root)`). A missing `sc.add` makes a character silently invisible.
- Call `resetRig(P)` **before** setting `P.root.visible = false`, because resetRig makes it visible.
- Flash timing: a flash at exactly t = n/30 + 1/60 rounds the same alpha into two frames and creates a duplicate frame. Offset the flash time slightly, e.g. 40.36 rather than 40.35.
- Scribe sometimes hallucinates words in quiet music/SFX passages. `verify_captions.py` ignores transcript words where the voice stem is silent. Keep that filter, and keep chirpy tonal SFX away from voice-free gaps.
- When a voice line starts abruptly, use a 30 ms fade-in on lines to avoid a click.
- Use the sub-bass swell per tier at a low level (−44 dB + 2 dB per tier) so it doesn't mask the shouts.

Start by confirming the setup works: `npm install`, then `GPU=1 RSCALE=0.5 node render.js test 3.0 20.0 41.0` in `videos/mums-cooking-src/`. Show me the frames, then ask me for the next episode's topic.
