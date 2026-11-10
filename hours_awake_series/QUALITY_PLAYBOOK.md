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

## Mistakes the user caught in EP2 (must never repeat)
1. Facing vs limbs: a character with their back/head turned away had hands reaching toward the camera.
   Rule: the facing direction (front / back / side) is decided first; head, torso, arms and held objects must all
   agree with it. Back-view characters reach AWAY from camera, front-view ones reach toward the subject they look at.
2. Occlusion: the cinder blocks and plank were drawn behind a survivor, yet the highlight ring was drawn on top as if
   visible. Rule: anything the narration names must be fully unobstructed in frame; highlights are drawn in the same
   layer as the object, so they are hidden whenever the object is. Stage named props in clear space, never behind people.
3. Z-order check on every shot: list foreground / mid / background objects explicitly, and confirm nothing important is covered.

## Process change
- Before rendering, I produce a per-shot staging sheet (facing, who holds what, what is occluded, what is highlighted)
  and review it against the narration line by line.
- Every shot is checked as a full-resolution frame at three moments (start, middle, end) for facing, limbs, occlusion.
- Render a low-fps preview strip of the whole video and check motion, not just stills, before the final render.

## EP3 build notes
- Side-view puppet (`sideFig`), crayon lettering with a mirrored R (`crayonText`), warm flashback palette, toy walkie prop.
- Reviewed every shot at start/middle/end as full frames before the final render; automated check found no static runs >1.5 s and no unplanned black frames.
- Known weak spots: crayon-arm sleeves in the flashback read as large red tubes; the white ring on the correct R in the note is hard to see; first-person knee in the hand shot is a plain dark block.
