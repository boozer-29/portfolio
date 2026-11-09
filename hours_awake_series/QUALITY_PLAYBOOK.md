# Quality playbook for Episode 3+ (written after EP2 feedback: "mid")

## Why EP2 read as mid
- Characters are rigid blocks: no squash/stretch, overshoot, follow-through or blinking; poses hold still.
- Shots are mostly static compositions with a slow push-in; little parallax depth, no foreground elements.
- Flat lighting: few cast shadows, no rim light, no volumetric beams, no colour grade.
- Cramped staging (survivors piled together), captions/pills sitting on bodies.
- Sound is fully synthesised: thin, no room tone, no layered real-world texture.
- I only checked still sheets, not motion, so timing problems went unseen.

## Rules for the next build
1. Listen first: transcribe, write a word-by-word shot table, get it approved by me before animating.
2. Every shot: one clear subject, a foreground layer, a background layer, and a camera move with intent.
3. Animation: anticipation, overshoot, settle, blinks, breathing, cloth/hair secondary motion, eased cuts.
4. Lighting: per-scene key + rim light, cast shadows, light beams/dust, grade applied in post (ffmpeg curves/LUT).
5. Layout: caption zone reserved per shot; faces never under captions or pills; max 4 characters per frame with spacing.
6. Audio: layered room tone + foley per action + reverb on echoes, voice stays loudest, -14 LUFS.
7. QA before delivery: automated checks (static runs, black frames, caption/face overlap, duplicate limbs) with opencv,
   plus motion-strip review (every 6th frame) not just stills.
8. Deliver one polished cut, with a short issues list.
