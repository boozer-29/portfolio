# MASTER PROMPT — Polygram "What if…?" reels (three.js + Playwright edition)

Paste this whole file into a Claude Code session on the Mac, in the repo `boozer-29/portfolio`, branch `claude/cool-bardeen-010lrr`.
Newest reference implementation: `videos/afro-src/` (rig v2 + afro, props, scenes, shots, mixer, Whisper helper). Older: `videos/mums-cooking-src/`.
**Read `videos/REFERENCE_ANALYSIS.md` first** — the owner's reference reels, broken down beat by beat. It is the quality and comedy bar.

---

## 0. Machine and tools
- MacBook Pro M1, **8 GB RAM**. The pipeline is **three.js + Playwright** (headless Chromium on the Metal GPU, `GPU=1`). Blender is not used.
- Audio: ElevenLabs (key in the macOS Keychain, see 9.8), ffmpeg, Python + numpy for the mix, **Whisper** (whisper.cpp) for timing.
- Re-use the shout takes and SFX in `videos/assets/audio/`. Music: `videos/assets/music/tiki_tiki.mp3` (owner's choice; no songs with vocals).

## 1. Format (owner's rules, revised Nov 2026 after the reference study)
A "What if ___?" escalation reel. **The joke is the consequence, not the growth.**
- **What escalates can vary:** doubling per day / hour / event ("every kick", "every burp"), linear growth (+1 inch a day, told as a life story
  with time skips), or no number at all (a world-reaction montage: "What if the Bomboclat Guy passed away?"). Pick what serves the topic.
- **Every step = one specific consequence**, ideally anchored in a real-world benchmark, and **shown happening on screen** (section 8):
  "Office chairs are tested for a 125 kg person." → the chair collapses. "194 dB is the limit for sound in air." → the shockwave flattens the street.
- **Skip steps.** Only show the numbers with a great consequence (Day 2, 3, 4, 5, 6, 7, 9, 12, 14, 18…). Never grind through every doubling.
- **Two-beat captions:** a factual setup line, then a deadpan punchline line ("It's now as long as you are tall." → "Nice.").
  House style = bureaucratic understatement against catastrophe ("The police ask you to keep it down." · "The UN asks you to please stop.").
- **Running gags and callbacks inside the episode** (the queue of opponents that never ends; "excuse you" coming back from Mom).
- **A pause beat mid-way:** one held face close-up that breaks the rhythm before the biggest hit ("He's starting to enjoy this." / "Kick #40 is charging…").
- **Twist or poignant ending**, ideally looping to the first shot ("In space, no one can hear you burp." · "You're 107. Still single.").
- **Length 50–120 s** (aim 60–90), **~2–4 s per step**, fast. A face reaction at least every ~10 s. Every shot keeps moving.
- **Opening:** title card "What if your ___ …?" in Playfair Display 500, white, the topic word huge in italic, red accent line, soft dark wash
  (fade in 0.45 s, out 0.3 s) over a slow establishing shot.
- **Standalone episodes:** only the hero recurs. No side characters, props or jokes from earlier episodes.
- Optional: a short silence drop (0.5–0.8 s) right before the final payoff.

## 2. The hero (same in every episode)
Voxel/low-poly cartoon man, ~2.2 units tall: **red hoodie (#D7262E, darker #9E1A21 trim), white drawstrings, grey or blue jeans, dark brown hair (#2A1D17), warm skin (#E7B289), black shoes**.
Big blocky head, big white eyes with black pupils, chunky brows, simple mouth. Rig v2 (required): spine, neck, shoulders + **elbows**, hips + **knees**, hands;
face controls for brows, eyelids (blinks), pupils (darts), mouth shapes. Anticipation before every big action, overshoot/elastic settle, secondary motion,
blinks every 2–4 s, mouth only moves while that character is audibly speaking, camera shake on impacts.

**Voices** (ElevenLabs `eleven_v3`, audio tags like `[deadpan]`): hero = Kevin `eRcsJdPMOM0mtGC03ul7`. One-off characters: pick fitting voices from the owner's
list (`GET /v2/voices`), new to the series each episode. **The hero always talks (owner's rule):** give him 5–8 short spoken lines per reel in Kevin's voice — reactions and punchlines on the beats
where he's on screen, reacting to or extending the caption joke (never reading the caption aloud). Shouts alone don't count. Other characters
speak when the story needs them (a friend, a doctor, a voicemail).

**BOMBOCLAT is a reaction, not a rule.** Never put one mechanically on every step. Use it only where it's funny (a few times per reel, sometimes never),
and **never the same way twice in a row**: a stuttered "bombo… bombo… bomboclat!", a confused "bomboclat?", a resigned "hmm… bomboclat",
a long "BOMBOOOOOO…" hard-cut by the next impact, a muffled one from inside something, a delayed one after a held silence.
**Generate every shout in the hero's own voice** (Kevin `eRcsJdPMOM0mtGC03ul7`, eleven_v3) so it matches his lines — the old shared takes in
`videos/assets/audio/shouts/` sound like a different person (owner, Nov 2026). Write the delivery into the text + tags, e.g.
`[confused, shocked] Bomboclaat?` · `[stuttering in disbelief, getting louder] Bombo... bombo... BOMBOCLAAAT!` ·
`[screaming, rising panic, getting louder and louder] BOMBOOOOOOOOOOOO` · `[tired, defeated, quiet sigh] Hmm... bomboclaat.`
For the long scream, shape a **crescendo** (gain ramp from ≈ −14 dB to full over its length, no compressor on it) and hard-cut it at its
loudest with the next shot — the swelling "BOMBOOOOO" is the joke. Trim each take to the slot, take word times from Whisper (`wifi-src/shouts.py`). Caption the shout exactly as it is heard ("BOMBO… BOMBO… BOMBOCLAAT!", "BOMBOOOO—").

## 3. On-screen text system
1. **Stat block** (top-left, x≈2.5 %, y≈14–29 %): label (Inter SemiBold caps, wide tracking, e.g. `BODY WEIGHT`), big number **with a unit** (Lora Medium,
   e.g. `280 kg`, `130 dB`, `1,595 J`), comparison line (Inter caps, e.g. `≈ A MOTORCYCLE`), `DAY n` / `HOUR n` / `KICK #n`, red pill `×2 EVERY DAY`,
   and an optional **status pill** that escalates (CASUAL → SMOKER → CHAIN SMOKER → CHIMNEY). Number swaps with a 5-frame scale tick.
2. **Diary captions (the main storytelling text):** Lora italic, 1–2 lines, directly under the stat block. Two beats per step: setup, then punchline
   (each on screen ≥ 1.2 s + 0.05 s per character). Never over a face.
3. **Dialogue captions** (only when someone speaks): Montserrat ExtraBold caps, white with black stroke, ~62–72 % height, word-by-word in chunks
   of ≤ 3 words, speaker label for non-hero characters. Only while that character is audibly speaking (gate on audible spans, word times from Scribe of the mix).
4. Shout captions get their own card (bigger, pop-in, slight shake) and match the variant heard.
5. In-world props carry text too (news lower-thirds, billboards, phone alerts). No channel watermark.

**Safe area (owner, Nov 2026 — the left text got cut in full-screen):** keep ALL text inside 1080×1920 safe margins:
left ≥ 90 px, right ≥ 140 px (Instagram's like/comment/share buttons), top ≥ 250 px, bottom ≥ 380 px (caption + username bar).
Stat block, diary captions and dialogue captions all start at `SAFE_L = 90` and wrap at `W − SAFE_L − SAFE_R` (see `wifi-src/part_d.js`).
Never place text at x = 30 again.

## 4. Look — the quality bar (it must never look like AI slop)
Match the references in `REFERENCE_ANALYSIS.md` (items 11–15):
- **Cinematic lighting:** motivated practical lights (lamps, neon, screens, a glowing tip), strong rim/back light, warm key vs cool fill, night scenes with
  emissive windows; volumetric haze/smoke and light shafts; bokeh lights in out-of-focus backgrounds; a filmic grade per scene (warm/teal), vignette.
- **Camera:** extreme face close-ups for reactions, macro inserts of props (a scale display, an ashtray, a clock), low hero angles, slow push-ins,
  dense aerial wides, a camera that rides with the action (following a flying body through walls); crash zoom + roll on big hits; every shot moves.
- **Readable destruction:** planks/glass/dust clouds, shockwave rings, glowing cracks, debris arcs, speed streaks, motion blur on fast moves.
- **Scale set pieces:** dense instanced cities, Earth from orbit with clouds and city lights, rings, black holes with accretion disks.
- **Depth of field only on face close-ups**; bloom on glowing things; soft contact shadows (shadow cameras set up correctly, see 9.3).
- Low-poly is the style, *not* an excuse: fill sets with props, give materials variation, light every scene on purpose.
- **Renderer upgrades to build into the next episode** (three.js, all cheap on the M1): ambient occlusion pass (`SAOPass`/N8AO) for contact depth;
  volumetric light cones + drifting haze sprites; bokeh sprites for out-of-focus practical lights; emissive window grids for night cities;
  soft particle smoke/dust (instanced, depth-faded); subtle film grain + slight chromatic aberration in the 2D compositor; per-shot colour grade LUT-style tints;
  speed streaks + radial blur on impacts; a shockwave ring mesh; glowing crack decals.

## 5. Audio rules
- Mix in numpy (stems: voice / music / SFX / sub). Lines −18 dBFS RMS, shouts −15 dBFS RMS (light compression first).
- Music: TIKI TIKI cut to the story (muffled intro under the title, the drop on the first big hit, a cut to silence for a comedic beat, a second drop for the finale).
- Music ~8–9 dB under dialogue (dynamic duck, −3…−16 dB), full level between lines. Captions-only reels: music carries the rhythm, SFX hit every consequence.
- Punchy SFX on every consequence (impact, shatter, whoosh, sonic boom, rumble); sub-bass swell on the big tiers (−44 dB + 2 dB per tier).
- Click-free edits, no two voices overlapping, master two-pass loudnorm **−14 LUFS, −1 dBTP**.

## 6. Deliverables (owner's rule, Nov 2026)
- **Render the final Full HD directly: 1080×1920, 30 fps (`RSCALE=1`), H.264 High (CRF ~17, maxrate ~10 Mbps), AAC 256 kbps 44.1 kHz.**
  **No low-res preview pass** — it doubles render time and tokens. Instead, check test frames of every shot at RSCALE 0.5 before the full render
  (section 8b step 4), then render 1080p once. Never 4K unless asked.
- File `videos/polygram-<topic>-1080p.mp4`, source in `videos/<topic>-src/`.

## 7. QA before delivering (all must pass)
- 0 frames with a caption and no audible voice; 0 spoken words without a caption; no caption > 0.1 s late (check against Scribe of the final MP4).
- Every BOMBOCLAT and every line recognised in a Scribe transcript of the final MP4; every line ≥ 8 dB above the background (p10).
- No clicks at edit points, no clipping, −14 LUFS ±1, true peak ≤ −0.5 dBTP.
- No duplicate/frozen frames (ffmpeg mpdecimate keeps all), no low-motion half-second, video and audio exactly the same length.
- Visual scan every 0.5 s: no camera inside geometry, no cropped faces, nothing blocking the action, text never covering faces for long.

## 8. Every step needs a visible consequence (owner's rule, Nov 2026)
Growth alone is boring ("his hair just grows, the kite is just stuck") and a pop + shout + one-liner pattern feels forced. Every step must show the
**consequence happening on screen**: the chair collapses, he crashes through the floor, the window explodes, the dojo wall breaks, the police turn up.
Prefer a cause → effect chain, and pay off an early beat at the end (callback).
- The consequence must happen **inside the shot's frame**. Portrait is narrow: horizontal half-FOV ≈ 0.56 × the vertical one. If it happens off-screen,
  it doesn't count — add a shot for it.
- Give each consequence its own SFX, but keep tonal/chirpy SFX out of voice-free gaps (Scribe hears them as words).

## 8b. Production workflow — step by step (owner's rule, Nov 2026)
Make every episode in this order. Finish each step before starting the next.

**Step 1 — Script.** Write the episode as a script, step by step: the number, the two-beat caption (setup / punchline), the consequence we see,
any dialogue or shout variant. Under every paragraph add one `CAMERA:` line saying exactly what the camera sees (framing, angle, movement, lighting,
who is in shot). To the point, no over-explaining. Example:
> Day 3 · 280 kg · ≈ A MOTORCYCLE — "Office chairs are tested for a 125 kg person." He sits. The gaming chair bends, then snaps; he drops to the floor.
> CAMERA: low 3/4 from the desk, monitor glow as rim light; on the snap, crash zoom on his face; dust motes in the lamp light.

Then turn the script into the shot list (times, shots, camera) — the `CAMERA:` lines become the shots.

**Step 2 — Voice.** Generate the voice lines (ElevenLabs, once each). Run **Whisper** (free, local — whisper.cpp) on every line to get
word timings and check it says the right words. Then fit the voice to the animation:
- add pauses where the animation needs a beat (split a line or insert silence between phrases),
- if a line is too fast or too slow for its shot, fix it (regenerate with a pacing tag, or `atempo` 0.9–1.1 for small changes),
- set the cue times from the Whisper timings, so the timeline is built on the real audio.
Scribe is still used for the final-mix caption QA (section 7); Whisper does the per-line checks so credits aren't spent on them.
- Run it with `python3 ../tools/whisper_lines.py audio/*.mp3` from the episode folder: prints each line's words, speech start/end,
  words per second and every pause > 0.25 s, and writes `<line>.whisper.json` (word timings) next to the mp3.
  Pace guide: ~2.5–3.5 words/s is normal; > 4.5 only for panicked/shouted lines; < 2 sounds slow.

**Step 3 — Animation.** Build the episode in the current pipeline (three.js + Playwright, rig v2), following sections 1–8 and the quality bar in section 4.
Light every scene on purpose, dress the sets, animate every consequence.

**Step 3b — Final render.** After step 4's test-frame pass is clean, render the **final 1080p directly** (`RSCALE=1`, `GPU=1`) and run the QA (section 7).

**Step 4 — Find the mistakes, then update this file.** Render a test frame at the key moment of every shot (RSCALE 0.5) and actively hunt for mistakes:
faces hidden, bad framing, off-screen events, duplicate frames, audio/caption problems, code bugs. Fix them, and once all are found,
add each one to section 9 so it never happens again.

## 9. Bug checklist — read before building, re-check before every preview
Every finished episode uses the three.js + Playwright pipeline (`videos/mums-cooking-src/`, `videos/afro-src/`), not Blender (section 0).
Each item below is a bug that actually happened. Avoid it while building; tick it off before sending a preview.

### 9.1 Copying the previous episode (things that are hard-coded)
- `part_a.js`: `DUR`, `STEPS` (day, t, value **with unit as a string** e.g. `'2.4 m'`, comparison line), `TITLE`.
- `part_d.js`: stat label (`'JOLLOF COOKED'` → new label), the value draw (no extra `' kg'` suffix), the title-card words,
  the caption **speaker-label map** (every new speaker or the label is blank), `HEROES` list (every hero rig, or strings/shout-mouth won't animate), `GRADES` for new scenes.
- `render.js`: the `pairs` mode loops to a hard-coded frame count (1728) — set it to `DUR × 30`.
- Mixer: `DUR`, every cue time, `STEPS` for pops/boings, whoosh times, sub-swell times, the silence-drop start/end, the music cut points.
- `build.sh` output name and `index.html` script `src` must match.
- `node_modules`: symlink to the previous episode (don't reinstall); `.gitignore` needs `node_modules` with **no** trailing slash (the symlink is a file).

### 9.2 Code gotchas
- `V()` takes an array: `V([x, y, z])`. `V(x, y, z)` throws "Spread syntax requires …iterable" at render time.
- `Object3D.add()` returns the parent — use `T(parent, child)` when you need the child (`T(g, cyl(...)).rotation.z = …`).
- Every rig must be added to its scene (`sc.add(P.root)`), or it is silently invisible.
- Call `resetRig(P)` **before** `P.root.visible = false` (resetRig makes it visible again).
- The code is dense one-liners: a `// comment` placed mid-line silently comments out the rest of the line (lost commas/statements → syntax
  errors or, worse, silently skipped code). Comments only at the very end of a line. Run `./build.sh` (`node --check`) after every edit.
- Anything computed from world positions (`wp()`, anchors on the hair/rig, shadows/decals under an object, props attached to a body part)
  must be computed **after** the rig is posed and scaled in that shot's setup, never in the scene-base function that runs before posing.
- When patching files with scripted find/replace, patch one file per script run so a failed match doesn't leave half the edits applied.
- **Never put a `//` comment on the same line as code when patching** — not even at the "end": these files are one-liners, so the
  "end of a line" is usually the middle of a statement. This bug happened 4 times on the afro episode. Comments go on their own line above.
- `RoundedBoxGeometry` reports `parameters.width/height/depth` as 1 (it scales a unit box), so finding a mesh by its size fails.
  Keep a direct reference (`const apron = T(spine, rbox(...))`) to anything you will animate or hide later.
- Helper poses that return `legs` (e.g. `popPose`) override a seated pose — for seated characters force `legs: SIT.legs` after merging.

### 9.3 Lighting and shadows
- `lightRig`: after setting `key.shadow.camera` left/right/top/bottom/near/far you **must call `key.shadow.camera.updateProjectionMatrix()`**,
  or three.js keeps its default ±5-unit shadow box and only things right next to the light target cast shadows. Same for every other
  shadow-casting light. (Still unfixed in `mums-cooking-src/part_a.js`; fixed in `afro-src/part_a.js`.)
- A key/directional light must sit far outside giant scaled objects (≥ 3× their size). A light inside a giant afro/planet kills its shadow.
- When shade/shadow is the joke, frame a visible sun/shade **edge** (part of the area stays in sun) and keep the fill low (hemi ≤ 0.25,
  env ≤ 0.2). A shadow that covers the whole frame under bright fill just looks like evenly lit ground.
- Very dark albedo (near-black hair, dark capes) reads as a flat black blob in shade. Keep hair around `#4a3022`/`#5c3d2b` with
  `envMapIntensity` ≈ 0.7 so the shapes still read.

### 9.4 Faces are never hidden
- A raised arm on the **camera side** crosses the face. Comb/scratch/wave poses: hand over the *top* of the head, or use the far-side arm.
- The doubling "pop" pose flings arms **out sideways**, not forward/up, so hands don't cover the face in crash zooms.
- Hide hand props (comb, phone, clippers) during crash zooms on the face.
- Side characters too: a barber holding clippers up in front of himself hides his own face — hold props low and to the side.
- Things that fly (capes, debris, smoke, thrown props) move **away from** the camera or behind heads, never across a face.
- Big hair/hats/helmets: anchor the shape above the hairline (centre above the head, bottom at the hairline) so it can't hang over the eyes.
- Two characters in one shot: offset them so neither is half-hidden behind the other's body.
- Hand props (comb, leaf blower, phone) held on the camera-side arm end up in front of the mouth. Hold props low and out to the
  side (shoulder z ≈ ±1.0–1.6), or turn the character so the prop arm is on the far side.
- A prop or side character in the foreground of a close-up (bird on a nest, barber's head) must sit to one side of the frame, with the
  look target between it and the hero's face — never on the line from the camera to the face.
- Captions sit at 72 % of the frame height: in face close-ups aim the camera slightly **below** the face so the face sits above ~60 %
  and the caption lands on the chest, not the eyes.

### 9.5 Framing and camera
- Big objects (giant hair, planets, a scaled-up hero): keep the camera ≥ 1.5× the object's radius away and frame from the hairline down.
  Too close = a brown wall filling the frame, or the camera ends up inside the geometry.
- Look targets: aim at the face/subject, not at the top of the hair — aiming high crops the face out at the bottom.
- Portrait is narrow: horizontal half-FOV ≈ 0.56 × the vertical one. Props a few metres to the side are off-screen. Check every event
  is inside the frame (render a test frame mid-event).
- Low cameras in cluttered sets (market stalls, furniture) get blocked by a roof/table edge filling half the frame — raise the camera above
  the props or move it to a clear lane.
- Random scenery (instanced city blocks) can spawn right next to the camera path and fill the frame with giant cubes — exclude scenery from
  the camera's side of the set.
- Don't put depth of field on a shot whose subject is a mid-distance prop (moon close-up became a blur) — DoF only on face close-ups.
- Aim at **computed world points** (`afroC(hero)`, `wp(head)`) for anything attached to a rig. The afro's centre sits above and behind
  the head and turns with the body, so hand-typed coordinates miss it (the HELP aerial looked at empty hair).
- Size props to the frame: at camera distance *d* the portrait frame is only ≈ 0.52·*d* wide at fov 46. Text/letters meant to be read
  should fill ≤ ~60 % of that width — compute it before placing the camera.
- Size comparisons ("hers is twice his") only read if both objects are about the same distance from the camera.
- Keep the camera ≥ 1.5 units from any side character, and shoot from the side their face points to.

### 9.6 Motion, duplicates, QA
- Low-motion shots (news desk, a still barber, a wide room shot) produce mpdecimate duplicate frames even at 30 fps. Give every shot real
  camera travel (a visible push, ≳ 0.5 units) plus character motion.
- The default camera ease is `'out'`, which slows to a near-stop at the end of the shot — on slow shots use `ease: 'lin'`.
- Run the mpdecimate count on the low-res preview **before** sending it (`ffmpeg -i preview.mp4 -vf mpdecimate -loglevel debug -f null - 2>&1 | grep -c "drop pts"` must be 0).
- Flash timing: a flash at exactly t = n/30 + 1/60 repeats the same alpha on two frames → duplicate frame. Offset slightly (40.36, not 40.35).
- Render test frames at the key moment of **every** shot and look at them before rendering the full preview.

### 9.7 Audio
- Per-line ffmpeg filters (pitch, PA, radio) must apply to dialogue lines too, not only shouts (the mums mixer only applied them to shouts).
- Small characters (birds, kids): `asetrate=44100*k,aresample=44100,atempo=1/k` (k ≈ 1.12–1.2) raises pitch without moving the
  ElevenLabs timestamps.
- Generate each line once and check it with Scribe straight away (`gen_tts.py` does both); regenerate only a line Scribe mishears.
- Scribe hallucinates words in quiet music/SFX passages: keep `verify_captions.py`'s voice-stem filter, and keep tonal/chirpy SFX
  (dings, chirps, tones) out of voice-free gaps — use noise-based whooshes there instead.
- 30 ms fade-in on every line (abrupt starts click). Sub-bass swell per tier at −44 dB + 2 dB per tier so it doesn't mask the shouts.
- After regenerating a line (e.g. slower), re-run the mixer and check the printed spans: a longer take can run into the next cue.
  Keep ≥ 0.45 s between a punchline's end and the next shout so the reaction can land.
- Whisper base.en mishears some words ("Date on" → "Dayton", "Saturday" → "sattade"). Before paying for a regeneration, run Scribe once
  on just that line (a few credits); regenerate only if Scribe also mishears it.

### 9.8 Mac setup and tooling
- ElevenLabs key lives in the macOS Keychain (item `elevenlabs`); `~/.zshrc` exports it as `ELEVENLABS_API_KEY`. In a non-login shell:
  `export ELEVENLABS_API_KEY=$(security find-generic-password -a "$USER" -s elevenlabs -w)`. An API key starts with `sk_` — the key **ID**
  shown in the dashboard list is not the key.
- `npm install` / `npx playwright install chromium` must be run by the owner in Terminal (Claude's auto mode blocks downloading external code).
- Homebrew ffmpeg has **no `drawtext`** filter, so `sheet.py` fails — label contact sheets with Pillow instead.
- Whisper = whisper.cpp (`brew install whisper-cpp`, command `whisper-cli`), model `~/.cache/whisper/ggml-base.en.bin`
  (148 MB, from huggingface ggerganov/whisper.cpp). The very first run takes ~1 min (macOS scans the new binary); after that ~1 s per line.
  `--dtw` word timing returns nothing in this build — use the token offsets from `-ojf` (whisper_lines.py does this).
- The small base.en model mishears rare words (it heard "Comb" as "Komp"). If only one unusual word differs from the script, listen to
  the line before regenerating; Scribe on the final mix is the real check.
- Don't `rm` relative globs after a `cd` (the safety check blocks it); use absolute paths or write into a fresh directory.
- Render in one process (`GPU=1`), never in parallel (8 GB RAM). Wrap long renders in `caffeinate -dimsu`. GPU=1 renders ≈ 30–50 ms/frame at RSCALE=0.5.

### 9.9 Learned on the Wi-Fi episode (portrait framing, inserts, sets)
- **Portrait is narrow.** At fov 40 the frame is only ≈ 0.4 × distance wide. A 0.66-unit head needs the camera ≳ 2 units away for a readable
  close-up (or widen the fov to 55–62 when a wall stops you backing off). Closer than that you get one eye and a mouth.
- **Wide sets don't fit.** A dollhouse cutaway of two flats (15 units) can't be framed in portrait — track the camera sideways with the action instead.
- **Moving things must cross the look direction.** Anything meant to fly through frame (a plane) has to pass within ≈ ±15° horizontally of the
  camera's look line; plan the path from the camera, not from the set.
- **Phone/screen inserts:** when a character holds a phone facing themselves, the screen side is inside their head — never put the camera there.
  Use a separate prop phone (on a desk) for macro inserts of the screen.
- **In-world text** (sat-nav, signs, phone screens) must sit in the lower two-thirds of the frame: the stat block and diary captions cover the top ~35 %.
  Put the key words where the framing shows them, and render a test frame to read them.
- **Cameras inside walls:** check camera positions against the room's wall boxes (a camera at x 2.2 sat inside the bathroom wall at x 2.0).
  Also watch for glass railings and seat backs right in front of the lens.
- **Seats and screens:** decide which way a seat faces before seating characters; seat-back screens face the row behind.
- **Sitting reads as standing from the front.** Shoot seated poses (toilet, chair, bed edge) from a 3/4 side angle so the bent legs read.
- **Decals ride on their parent:** rotating the Moon rotated its Wi-Fi icon out of view — animate the camera, not the object carrying the icon.
- **Space lighting:** an object lit only from behind is invisible against black space. Give every space shot a key light from the camera side plus a rim.
- **Crater/texture detail:** stroked circles read as bubbles. Use soft radial gradients (dark floor, light rim) for craters and spots.
- **Reusing an old mixer:** copy helper *functions* only — the old file's placement lines come along and break the new mix. String-replace patterns
  fail on tiny differences; use a regex or rewrite the section.

### 9.10 Learned on Wi-Fi revision 2 (owner's screenshots)
- **THE arm bug (caused hands-through-faces in every episode):** in the original `pose()`, a shoulder's z rotation swings the **right** arm
  (+x side) *inward* for negative values — so every "arm out to the side" pose crossed the face. Fixed in `wifi-src/part_a.js`:
  `A.sh.rotation.set(a[0], a[1], -a[2])`, so now arm 0 (left) uses **+z = outward**, arm 1 (right) uses **−z = outward**, for every rig.
  Copy this `part_a.js` for new episodes; never copy the older ones (mums/afro still have the inward sign).
- Hand props raised high: hold the arm *up and out* (`[-2.3, 0, ±1.05, 0.25]`), never folded over the top of the head (the forearm bends back through the skull).
- Seated characters need real seats: give every sitter a chair (seat ≈ 0.5, hips bob ≈ −0.26) — without one they hover at desk height and read as sitting *on* the desk.
- A phone's glow light goes **in front of the face** (≈ 0.45 in front of the head), not at the phone — a light inside the torso makes the chest glow.
- Captions vs in-world text: move boards/signs out of the caption band (y ≈ 33–40 % of frame) or reframe — text over text is unreadable.
- Status pills must match the place (the school was labelled STREET).
- "Something happens, then it doubles": every step needs a physical action the hero or the world performs (chair collapses, a bike crashes into a bin,
  the plug gets pulled and a continent goes dark, rent envelopes pile up) — a ring sweeping past plus a caption is not an action.
- The hero talks on most beats (section 2); generate his lines, check them with Whisper, and when a written `[pause]` produces an over-long gap, trim it in the mix (`CUTS` in `timeline.py`) instead of regenerating again.
- Inserting a pause: cut only at true silence (≤ −45 dB). If two words run together (no silence), regenerate with the beat written into the line.
- Turned characters: after a turn, check the final yaw faces the camera (the teacher ended up back-to-camera).
- **Camera paths through bodies/props:** a push-in that passes through a character or a chair gives frames of solid colour (and mpdecimate flags them as duplicates). Check both ends AND the middle of every camera move against the characters and furniture near it.
