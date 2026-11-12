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

## EP4 (outlined rig v6)
- Arms are solved with a pole target (elbow goes to the natural side) or an explicit elbow for forearms pointing at the camera.
- Hands always continue the forearm; wrist bend clamped to ±35°. Thumb side is chosen semantically (thumbToward).
- Contacts (fingertip on a palm, fingertip on a letter) are solved from the contact point backwards; error must be < 3 px.
- Every rendered frame runs an automatic pose check: elbow folded, elbow above shoulder, unreachable target,
  stretched limb, arms crossing each other, missed contact. EP4 final render: 0 flags.
- Audio check: every spoken line's level in the final mix is compared with the voice track (no line may drop > 6 dB).

## EP4 recheck 2 lessons (user: "the last one had many mistakes")
- A shot about an action toward an object must show the object: "lunges for the walkie" = the walkie is in frame.
- A sensation on "you" (shoulder brush, breath on the neck) needs your body part in frame and the contact landing ON it.
- Never compose the main subject in the HUD corner (top-left, y < 240 at 540x960) — check stills for HUD overlap.
- Hugs: one clear framing (over the shoulder). Arms that leave the frame read as arms spread, not a hug.
- Continuity of physical contact across cuts (asleep in your arms -> you stay with him).
- Hats/brims must not cover eyes; back views must never look like a face.
- Audio: never tanh-clip the narration. Compressor + look-ahead limiter on the voice; final = fixed gain + true-peak limiter (4x oversampled), not one-pass dynamic loudnorm.
