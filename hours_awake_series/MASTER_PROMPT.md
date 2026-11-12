# HOURS AWAKE — MASTER PROMPT (paste this at the start of a new session)

You are continuing my animated vertical horror series HOURS AWAKE. The whole production kit, the story bible and every past
episode are in my repo `boozer-29/portfolio`, branch `claude/vibrant-ptolemy-554d1n`, folder `hours_awake_series/`.
Work on that branch (or a new branch from it if I say so), commit and push your work, never open a PR unless I ask.

## Read first, in this order, before doing anything
1. `hours_awake_series/SERIES_BIBLE.md` — world, rules, characters, story so far, open threads.
2. `hours_awake_series/QUALITY_PLAYBOOK.md` and `hours_awake_series/REFERENCE_ANALYSIS.md` — every mistake I have already caught and the rules that prevent them.
3. `hours_awake_series/kit/README.md` — the production kit (engine, tools, commands).
4. `hours_awake_series/ep4/EP4_STAGING_SHEET.md` and `hours_awake_series/ep4/EP4_RECHECK.md` — the format of a staging sheet and of a self-review.
5. `hours_awake_series/source_docs/` — my original master prompt + voice-direction doc (format rules), and two frames sheets of the reference style.
Set up the tools as in the kit README and render one EP4 still to prove the kit works before starting.

## What I give you per episode
The narration MP3 (ElevenLabs, voice "Brian - Deep, Resonant and Comforting"), the tagged script, and the plot/inspiration notes.
Never generate or change the voice unless I ask. If I only send a script, ask whether I want you to generate it with ElevenLabs.

## Workflow (do not skip steps)
1. Transcribe the MP3 (tools/transcribe.py) and read the performance from the numbers: pace, loudness, pitch, pauses per line.
   Be honest: you cannot hear audio or watch video; you measure and look at frames.
2. Write the STAGING SHEET: every shot with time, words, what the voice does, the picture, and FACING + LAYERS
   (back -> front: who faces where, what is held, what is in front of what). Note anything in the plot that is not in the narration.
3. If the episode needs a new character, pose type, prop or grip, make a full-size TEST CARD first.
4. Send me the staging sheet (+ test card) and WAIT for approval.
5. Build (align, plan, scenes, audio) following the kit. Check every shot at FULL SIZE at start/middle/end, zoom into every
   hand/contact, and fix what you find before rendering. The pose QA must report 0 flags.
6. Render, then run tools/qa_video.py and tools/qa_audio.py and fix: in-shot jumps that are not intended, still runs > 2 s
   (except planned holds), muted lines, effects louder than the voice, clicks, silence drops that are not silent.
7. Recheck the finished MP4 yourself one more time (frames from the encoded file, motion strips around flagged moments)
   and write a short recheck list (found -> fixed, still weak). Then deliver: commit + push, send me the MP4 and the list.
8. Update SERIES_BIBLE.md (story so far, open threads, any new look) and QUALITY_PLAYBOOK.md (new lessons).

## Quality rules I care about most
- Characters look identical every episode (bible + rig6.js). One pair of arms per person.
- Hands are one connected shape. Contact decides layering: holding something = fingers behind, thumb in front;
  gripping an edge = fingers wrap over/around the edge; a touch lands exactly on its target. Facing direction is decided first
  and head, arms and props agree with it.
- Anything the narration names is in clear view, never hidden behind a person; highlights are hidden when the object is.
- What the viewer sees is literally what the narration says, at the moment it says it (sounds made visible: echoes, cracks,
  hums, taps). Time jumps are shown (e.g. ten hours = night to day + clock roll).
- Continuity between shots (who holds what, who is where).
- Life in every shot: breathing/blinks (automatic), gentle camera drift, real motion (climbing, walking, writing); Sleepers
  never seen moving.
- Captions never cover faces or key props; HUD every frame; red only for alerts/stamps/rules.
- Audio: voice always loudest; final -14 LUFS, true peak <= -1 dB; effects timed to the visuals and never on top of an
  important word; silence drops only in the real pauses; no clicks.
- Output: 1080x1920, 30 fps, H.264 CRF 18 (preset slow), AAC 256k 48 kHz, faststart.

## Now
Tell me in a few lines what you understood (series, where the story stands, the kit, the workflow), show me one EP4 still
rendered with the kit, and wait for my next episode's MP3 and script.
