You are continuing my Instagram series of low-poly 3D comedy reels ("What if your ___ doubled every day?" and similar "What if…?" escalations), made locally on my Mac with three.js + Playwright.

## Setup (do this first)
- Repo `boozer-29/portfolio`, branch `claude/cool-bardeen-010lrr`, already cloned at `~/Desktop/claude code/portfolio`. `git pull` first. Work, commit and push on this branch only (GitHub CLI is logged in).
- Read these fully before doing anything:
  1. `videos/MASTER_PROMPT.md` — all rules, the step-by-step workflow (section 8b) and the bug checklist (section 9, every mistake made so far — do not repeat any of them).
  2. `videos/REFERENCE_ANALYSIS.md` — beat-by-beat study of the reference reels I like. This is the comedy and quality bar.
  3. `videos/episodes/ep-wifi-script.md` — the latest approved episode script (both revisions).
- **Template = `videos/wifi-src/`** (the latest, approved episode). Copy it for a new episode; never copy the older `mums-cooking-src` or `afro-src` (they still have the arm-through-face bug and the old text margins).
- Tools already installed: node + Playwright Chromium, ffmpeg, Python 3 + numpy/Pillow, Whisper (`whisper-cli`, model at `~/.cache/whisper/ggml-base.en.bin`, helper `videos/tools/whisper_lines.py`).
- ElevenLabs key is in the macOS Keychain: `export ELEVENLABS_API_KEY=$(security find-generic-password -a "$USER" -s elevenlabs -w)`. Credits are limited: generate each line once, check it with Whisper, regenerate only what's wrong.
- Render with `GPU=1`, one process at a time (8 GB RAM), `caffeinate -dimsu` for long renders. Symlink `node_modules` from `wifi-src`.

## How we make every episode (non-negotiable)
1. **Script** — scene by scene. Every step = something physically HAPPENS on screen (a real consequence, ideally with a real fact), not just growth + a caption. Two-beat captions (setup / deadpan punchline). Skip steps; only show the numbers with great consequences. A pause beat, a callback and a twist/loop ending. Under every paragraph one `CAMERA:` line (framing, angle, movement, lighting). Send it to me and wait for approval.
2. **Voice** — the hero (Kevin `eRcsJdPMOM0mtGC03ul7`) TALKS: 5–8 short lines that react to the jokes. BOMBOCLATs are generated in Kevin's own voice, varied (confused / stuttered / swelling scream with a crescendo + hard cut / resigned), only where they're funny — never one per step. Whisper-check every line, fix pacing/pauses, lock the timeline (`timeline.py`), send me the timing reel.
3. **Animation** — cinematic look (motivated practical lights, haze, bokeh, DOF on faces only, per-scene grade, film grain), readable destruction, faces never hidden, all text inside the safe area. Render a test frame at the key moment of EVERY shot and hunt mistakes before the final.
4. **Final** — render the **final 1080×1920 30 fps directly** (no low-res preview pass). QA: 0 duplicate frames (mpdecimate), −14 LUFS, Scribe check of the final mix. Make a < 30 MB phone copy and send it to me.
5. **Log every mistake** you found into section 9 of `MASTER_PROMPT.md`, then commit and push.

Keep messages short. Start by confirming the setup works (build `wifi-src` and render one test frame), then give me 5–6 ideas for the next episode in the style of the reference reels, with your recommendation.
