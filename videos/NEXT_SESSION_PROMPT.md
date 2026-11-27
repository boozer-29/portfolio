You are continuing my Instagram series of low-poly 3D comedy reels ("What if your ___ doubled every day?" and similar "What if…?" escalations), made locally on my Mac with three.js + Playwright.

## Setup (do this first)
- Repo `boozer-29/portfolio`, branch `claude/cool-bardeen-010lrr`, cloned at `~/Desktop/claude code/portfolio`. Run `git pull` first. Work, commit and push on this branch only (GitHub CLI is logged in).
  - If a push of big MP4s stalls, push from a fresh clone outside Desktop with `git -c http.postBuffer=524288000 -c http.version=HTTP/1.1 push`, then verify with `git ls-remote`.
- Read these fully before doing anything:
  1. `videos/MASTER_PROMPT.md`: all the rules.
     - Section 8b: the step-by-step workflow.
     - Section 8c: why reels go viral (the Drizzle "HUSS" study).
     - Section 9: every mistake made so far. Don't repeat any of them; 9.19 is the newest (9.18 = music must be clearly audible, every joke must read with the sound off).
  2. `videos/REFERENCE_ANALYSIS.md`: the comedy and quality bar.
  3. `videos/episodes/ep-laziness-script.md`: the latest approved script.
  4. Every other `videos/episodes/*.md`, plus `videos/rizz-reel-src/dialogue.json`, so you know what's already used.
- **Template: `videos/luck-src/`**, the latest episode (mixer `luck_audio.py`, slot-machine widget in `part_d.js`; older template: `laziness-src`). Copy it for a new episode. Its parts:
  - `part_a`: the rig and faces.
  - `part_b*`: characters, sets and props.
  - `part_c*`: the shots.
  - `part_d`: the compositor and overlays.
  - Scripts: `gen_tts.py`, `gen_sfx.py`, `shouts.py`, `timeline.py`, `lazy_audio.py` (the mixer), `fix_spans.py`, `qa_final.py`, `dbg.js` (free-camera debug render), `build.sh`, `sheetx.sh`.
  - Symlink `node_modules` to `../wifi-src/node_modules`.
  - Never copy the older `mums-cooking-src` or `afro-src`.
- **Tools:**
  - Node, Playwright and ffmpeg.
  - numpy/Pillow exist only in `/opt/homebrew/bin/python3`.
  - Whisper: `whisper-cli` with the model at `~/.cache/whisper/ggml-base.en.bin`.
  - If Playwright's Chromium fails, use `/Applications/Google Chrome 2.app`.
- **ElevenLabs:** the key is in the macOS Keychain: `export ELEVENLABS_API_KEY=$(security find-generic-password -a "$USER" -s elevenlabs -w)`.
  - About 16.5k of 32.8k credits are left until 9 Dec 2026; the luck episode cost about 2.1k.
  - All voices on the account are now used: add new ones from the Voice Library before casting the next episode.
  - Generate each line once, check it with Whisper, and regenerate only what's wrong.
- **Rendering:** use `GPU=1`, one process at a time (8 GB RAM), and `caffeinate -dimsu` for long renders.

## My standing rules (all in MASTER_PROMPT; they matter most)
- **Never repeat anything across episodes:** no setting, side character, gag, shout delivery, style break, stat display or ending type used before. List the used ones before writing.
  - The laziness episode used:
    - The lazy flatmate and Dev/Priya.
    - The smartwatch step counter.
    - "Mmm… nah."
    - Blueprint, infomercial and golf-commentary breaks.
    - Domino and string machines.
    - The London blackout.
    - The yawned and split BOMBOCLATs.
  - The aura idea is also done.
  - The luck episode used:
    - Marcus the smug neighbour, the bakery and the last sausage roll ("Unlucky, mate.").
    - The coin-flip TING insert and the slot-machine widget.
    - A windy bridge, a rush-hour junction, a seaside claw machine, a racecourse, a launderette, a casino, a pub, a nationwide queue.
    - TV-racing and 1990s VHS lottery-draw breaks.
    - The laughing and choir-sung BOMBOCLATs; a meteorite on a car; the 31-million-way jackpot ending.
- **The hero speaks:** Kevin `eRcsJdPMOM0mtGC03ul7`, 5–8 real lines. BOMBOCLATs are in his own natural voice (no pitch shift or whisper), only where funny, and delivered differently every time.
- **Every doubling shows a visible event:** a whole new look, an action or gag, never just growth plus a caption.
- **No dead air:** the music never cuts mid-video, and every scene has background voices and crowd ambience.
- **Apply the Drizzle viral lessons:** a signature sound, a first-person hook in the first second, a quotable line and a loopable ending.
- **Bodies never pass through each other:** check every contact shot (MASTER_PROMPT 9.16).

## How we make every episode
1. **Script:** go scene by scene, with two-beat captions (setup, then a deadpan punchline) and a `CAMERA:` line under every paragraph. Include a pause beat, a callback and a twist ending. Send it to me and wait for my approval.
2. **Voice:** generate it, run the Whisper check, lock the timeline (`timeline.py`) and send me the timing reel.
3. **Animation:** make it cinematic and keep all text inside the safe area. Render a test frame at the key moment of every shot, plus a contact sheet, and look for mistakes before the final.
4. **Final:** render 1080×1920 at 30 fps directly, then run QA (`qa_final.py`). It needs 0 duplicate frames, −14 LUFS, a Scribe check of the final mix and 0 caption errors. Send me a phone copy under 30 MB.
5. **Log:** write every mistake you found into section 9 of `MASTER_PROMPT.md`, then commit and push.

Keep messages short. Start by confirming the setup works: build `laziness-src` and render one test frame. Then give me 5–6 fresh ideas for the next episode with your recommendation.
