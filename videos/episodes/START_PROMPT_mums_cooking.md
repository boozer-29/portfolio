You are making the next reel for my Instagram page (low-poly 3D comedy reels, "What if your ___ doubled every day?").

SETUP
- Repo boozer-29/portfolio, branch `claude/cool-bardeen-010lrr`. Work and push on this branch only.
- Read these first, fully: `videos/MASTER_PROMPT.md` (style bible, all rules) and `videos/episodes/ep-mums-cooking.md` (this episode's plan, shot by shot).
- Reference implementation to copy and adapt (do NOT start from scratch): `videos/yams-reel-src/v2/`
  - `yams2.js` = three.js episode renderer (rig v2 hero, scenes, shots, grading, captions, stat block, title card, motion blur)
  - `render.js` = Playwright frame renderer (`node render.js test t1 t2 …` with TDIR=dir, `node render.js range start end outdir`, RSCALE=1 for 1080p)
  - `yams2_audio.py` = numpy mixer (loudness match, dynamic duck, SFX synth, loudnorm, audible spans -> dialogue.json)
  - `fix_spans.py` (retime captions to Scribe of the mix), `capcheck.js` + `verify_captions.py` + `snr_check.py` + `qa_final.py` (QA), `sheet.py` (contact sheets), `bright.py` (exposure check)
  - Copy into a scratch working folder; `index.html` needs a `node_modules` with three@0.169.0 + @fontsource inter/lora/montserrat/playfair-display.
    In the cloud, Playwright + Chromium are preinstalled: install only three and the fonts, never reinstall Playwright.
- Audio assets: shouts `videos/assets/audio/shouts/` (BOMBOCLAT takes A / B / question), SFX `videos/assets/audio/sfx/`, music `videos/assets/music/let_it_all_work_out.mp3`.
- ElevenLabs is available through the proxy (header `xi-api-key: dummy`): TTS with timestamps (model eleven_v3), Scribe speech-to-text. Credits are limited: generate each line once, check it with Scribe, only regenerate a line that is unclear.

RULES (non-negotiable)
- Standalone episode: only the hero recurs. No characters, props or jokes from earlier episodes.
- Hero voice = Kevin (`eRcsJdPMOM0mtGC03ul7`), Nigerian English. Mum: pick a warm Nigerian/West-African female voice from my ElevenLabs voices. Other one-off characters: pick fitting voices.
- BOMBOCLAT shout on every doubling, said the sample's way (use the shout files, not new TTS). No narration. Silent title card at the start.
- Captions only while that character is audibly speaking; word timing from Scribe of the final mix; 0 caption errors.
- Music ~8–9 dB under the voices, full level between lines, drop on the first BOMBOCLAT, 0.8 s silence before Day 9. −14 LUFS.
- Clean, high-quality animation: anticipation + squash/stretch, mouths move only when speaking, blinks, camera always moving, no frozen frames, no camera inside geometry, faces never hidden. Lighting not overexposed (check with bright.py).
- Delivery: Full HD 1080×1920, 30 fps (RSCALE=1). NOT 4K.

WORKFLOW
1. Build the episode and send me a quick LOW-RES preview (540×960, RSCALE=0.5) plus a contact sheet. Stop and wait for my approval.
2. Apply my changes, then render the final 1080p, run the full QA (qa_final.py adapted to 1080×1920 and this episode's lines), fix anything that fails.
3. Commit the source to `videos/mums-cooking-src/` and the video to `videos/polygram-mums-cooking-1080p.mp4`, push, and send me the video.
Keep messages short; don't send status updates unless I ask.
