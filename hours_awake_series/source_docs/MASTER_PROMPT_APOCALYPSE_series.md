# APOCALYPSE: MASTER SERIES PROMPT
### Built on the "Horror Choice Shorts" benchmark playbook, with the narrator voice locked to the v4 chain. Series 1: HOURS AWAKE (zombie). Series 2 slot: demon.

Produce a finished, upload-ready vertical short and deliver the HD MP4, not a plan. Work autonomously.
**Follow the "Horror Choice Shorts" benchmark exactly. The one exception is narration, which stays exactly as in section 3. Where this file and the playbook disagree, this file wins.**

---

## 0. Episode template (fill in this block)
```
Follow the "Horror Choice Shorts" benchmark exactly, using the APOCALYPSE master series rules.
Story:     <HOURS AWAKE (zombie) | story 2 slot (demon)>   Episode <n> / 7
Premise:   Imagine you + <the apocalypse> + <one impossible problem this episode>
Counter:   HOURS AWAKE <hh:mm>  (or NIGHT <n> / 7 for a demon story)
HUD:       <start time> → <end time>, stats: AWAKE IN CITY · NOISE dB · SLEEPERS NEARBY
Mid twist: <what the survivors learn at about 60-65%>
Big twist: <who or what the "helper" or "threat" really is, at 70-85%>
Choice:    A <option> vs B <option>
Last vote: <what viewers chose in the previous episode, shown in the first 3 s>
Length:    55-85 s, 9:16, 30 fps
```

Filled example (Episode 1, full file: hours_awake_ep1_v2.md):
```
Story:     HOURS AWAKE (zombie), Episode 1 / 7, "The Note"
Premise:   Imagine you + a world where one sound put everyone to sleep and they woke up as Sleepers + you're alive only because you couldn't sleep
Counter:   HOURS AWAKE 41:00 (rewinds to 00:00, then climbs back)
HUD:       41:00 → 00:00 → 42:00, stats: AWAKE IN CITY · NOISE dB · SLEEPERS NEARBY
Mid twist: Every Sleeper in the city is walking toward your building
Big twist: The Sleepers kneel, open their eyes for the first time, and look at YOU, not the building
Choice:    A ROOF vs B BASEMENT
Last vote: (none, series opener)
Length:    82 s
```

## 1. Output spec
- 1080x1920, 9:16, 30 fps, H.264 `-preset slow -crf 18 -pix_fmt yuv420p`, AAC **48 kHz** 256k, `-movflags +faststart`.
- **Length 55-85 s** (target about 80 s). Script is **140-190 words** in **10-14 beats**.

## 2. Story formula (one line)
**Hook (0-3 s) → threat setup → numbered RULES of the monster → slow burn / false hope → mid twist (about 60-65%) → silence drop → BIG twist (the thing you trusted, or the thing you feared, is not what it seemed) at 70-85% → binary choice → "FOLLOW FOR HOUR 52" (the next episode's clock) or "FOLLOW FOR NIGHT N+1".**
- **Second person, always.** The first words are **"Imagine you…"**, and the premise is clear by 3 s. You are the survivor. The apocalypse is real, close, and specific.
- Every episode has at least **3 numbered RULES** about the monster ("NEVER SLEEP", "NEVER MAKE A SOUND", "IF THEY HUM, RUN"), each built on a real, double-checked fact.
- **Escalation ladder:** every beat is worse than the one before.
- **Two reveals per episode:** a mid twist (the world is worse than you thought) and a big twist (the rules just changed). The big twist flips what the viewer believed.
- **Never see the monster move.** It is only ever in a new position after a cut, a silence drop, or a light going out.
- **Plants:** every episode plants at least 2 small clues (a sound, an object, a line) that pay off in a later episode. Never explain a plant on screen.
- **Ending:** a one-letter choice (A/B) plus "COMMENT A OR B · THE MOST VOTED CHOICE DECIDES" plus the follow line. Where possible, the last shot loops back to the object or place from the hook.
- **Series arc:** 7 episodes per story, then switch stories. Alternate zombie and demon (Story 1 zombie, Story 2 demon, Story 3 zombie, …). Both vote branches rejoin by the next episode: only the opening 150 frames differ (what you did), the rest of the episode is the same. The next episode **opens with the last vote result tag** ("YOU CHOSE: ROOF") in the HUD for 3 s.
- **Verified facts bank (Story 1, HOURS AWAKE; double-check every fact with a web search before publishing):**
  - Rule of threes: about 3 min without air, 3 days without water, 3 weeks without food.
  - Going 17-19 hours without sleep impairs you about as much as a blood alcohol level of 0.05%, and 24 hours about as much as 0.10%.
  - Microsleeps are involuntary sleep lapses lasting from a fraction of a second to about 30 seconds.
  - Sound travels about 343 m/s in air, so roughly 3 seconds per kilometer.
  - A whisper is about 30 dB; normal conversation is about 60 dB.
- **Story 2 (demon) slot:** same rules, different monsters. Keep it original: an Entity that hunts by sound, or by light, or by looking, with its own 3 rules. Do not copy any existing film's creatures or plot.

## 3. Narration: LOCKED to v4 (do NOT change)
> **Emotional narration option (Engine B):** when ElevenLabs is available, generate the narration from tagged scripts instead of the Orpheus chain below. Follow `VOICE_DIRECTION_audio_tags.md` (inline tags like `[whispers]`, `[short pause]`, `[slowly]`, one audio file per beat, captions from the tag-stripped script, timing from the transcribed audio). Everything else in this prompt (captions, HUD, camera, sound design, QA) stays the same. If ElevenLabs is not connected, use the Orpheus chain below and say so in the report.

- **Voice:** Orpheus 3B (`isaiahbjork/orpheus-3b-0.1-ft-Q4_K_M-GGUF`) through llama-cpp-python, decoded with the SNAC 24 kHz ONNX decoder (`onnx-community/snac_24khz-ONNX`, `onnx/decoder_model.onnx`).
- **Speaker `dan`.** It has the slight British tone the user wants. One line per call: temp 0.6, top_p 0.9, top_k 40, repeat_penalty 1.1.
- Retry a line (up to 3x) if its rate is outside 1.2-3.6 words/s (lines of 4 words or fewer are exempt), it is silent, or it is longer than words x 1.2 + 2 s.
- **v4 "crisp" chain** (exact ffmpeg `-af`, output 44.1 kHz mono, resampled to 48 kHz at the final mux):
  ```
  silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03,areverse,
  silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.06,areverse,
  atempo=1.18,highpass=f=90,
  equalizer=f=250:t=q:w=1:g=-2.5,equalizer=f=3500:t=q:w=1.2:g=4,equalizer=f=7000:t=q:w=1:g=2,
  acompressor=threshold=-26dB:ratio=4:attack=4:release=60:makeup=4,
  agate=threshold=0.015:ratio=4:attack=2:release=40,
  loudnorm=I=-13:TP=-1.5:LRA=7,alimiter=limit=0.89
  ```
- **No reverb, no room echo, no rubberband.** The user rejected echo.
- **NEVER use:** Dia, Kokoro, Piper, Chatterbox, or the Orpheus voices leo/zac.
- Pace: v4's natural pace (about 2.7-3 words/s after atempo 1.18). Gaps between lines 0.22 s by default; **0.3-0.7 s** where a silence drop goes.
- **Only the narrator is voiced.** Other characters' words appear as in-world text (phone texts, radio transcripts as captions, notes scratched on walls). If a radio voice is needed, use the same `dan` line with an extra `bandpass=f=1800:w=2800` after the crisp chain.
- **Narrator breath plant (Story 1):** mix ONE identical breath sample (a soft inhale, about -22 dB) 0.15 s before every narrator line. Never vary it. It is an SFX layer, not a change to the voice.

## 4. Word timestamps = the one timeline
- Get word start and end times for every line, using faster-whisper `word_timestamps=True` if installable. Otherwise split each line's duration across its words in proportion to syllable count.
- Data model (JSON, the single source of truth; changing the script means regenerating the JSON, not re-animating):
  ```
  Word = { text, start, end, color?: 'lime'|'red'|'amber' }
  Beat = { id, start, end, scene, camera:{from,to,dx,dy,rot?}, hudTime, stats:{survivors,noise,nearby}, sfx:[], silenceAt? }
  ```
- Captions, cuts, HUD clock jumps, NOISE meter changes, SFX and silence drops are all placed from these times.

## 5. Visual style bible
**Look:** flat-vector apocalypse night, built as **2.5D layers**. Near-black navy, **one light source per shot**, chunky block characters and block buildings with simple flat bevel highlights (a lighter top edge, a darker bottom edge) so everything feels 3D without real 3D. Two accent colors.

| Role | Hex | Use |
|---|---|---|
| Caption highlight (lime) | **#C8E234** | Active or keyword caption word, "COMMENT A OR B" |
| Caption base | #FFFFFF | Other caption words, HUD clock |
| Danger red | **#E5383B** | HUD dot, RULE pills, danger words, alert flashes |
| Alert wash | #641008 - #6D1208 | 1-2 frame red flash before danger reveals only |
| Warning amber | **#F2A93B** | Safe warm light, authority or warning words, "RESCUE IN 7 DAYS" |
| Background night | #0B1F3A - #16314F | Sky, streets, outside |
| Background deep | #0A0D16 - #141A2A | Explainer screens, stakes screens, choice screen (radial vignette) |
| Line-art white | #F4F4EF | Outlines, choice text |
| Sleeper skin | #C9CED6 | Zombie skin; closed eyes with dark under-eye circles |
| Eye glow | #E6F7FF | Sleeper eyes only when they OPEN (the big twist) |
| Ember (demon stories) | #FF6A1A | Demon cracks and eyes in Story 2 |

- **Color rule:** warm amber light = safe. Cold blue = outside and danger. **Red is only for alerts, stamps and HUD.** Never flood a whole shot red.
- **Characters:** simple block bodies with square eyes; faces only when emotion matters. No gradients on characters.
  - **You (survivor):** mustard hoodie `#EAB308`, mostly seen from behind, as hands, or in a reflection (the viewer IS you).
  - **Ollie (8):** red beanie, dinosaur toy. **Maya:** teal scrubs, tablet. **Reyes (60s):** gray beard, camo jacket, shotgun. **DJ:** purple hoodie, headphones.
  - **Sleepers:** pale gray, slumped upright, head tilted 10-15°, slow sway, arms hanging. They glide steadily; they never run. Their throats vibrate faintly when they hum.
  - **Demons (Story 2):** pitch-black, tall and thin, no mouth, thin glowing ember cracks. Same rule: never seen moving.
- **Lighting:** one source per scene (a lamp, a flashlight, a streetlight, a phone screen). Soft radial glow only on light sources; everything else falls into a vignette. Low-opacity film grain. Add floating dust particles inside lit areas and a light blue fog layer in the distance.
- **Depth:** build every scene from 5 flat layers (far background, mid background, character, glow, foreground) with parallax during camera moves (far layer moves 40% of the foreground's distance). Blur or darken the far layer slightly for depth.
- **Text inside the world is story:** the phone text, the radio dial, the notes scratched on the wall, the door painted "NO SOUND", chalk tally marks.
- **Explainer / stakes screens:** deep-navy background (#0A0D16) with a radial vignette, big white numbers, a lime unit or keyword, red for danger. Simple flat icons (a clock, a sound wave, an eye, a skull, a lamp) and roll every number (`Math.round(interpolate(t,[s,s+.6],[from,to]))`).
- **Fonts** (all free):
  - Captions: **Montserrat 900**, ALL CAPS.
  - HUD clock and choice titles: **Bebas Neue**.
  - HUD labels: **JetBrains Mono** with wide tracking (0.15 em), grey #8A8F99.
  - Notes and writing on walls: **Caveat**.
  - Small UI: **Inter**.
- **Optional 3D upgrade:** if the render pipeline is switched to Three.js or Remotion, reuse the same JSON timeline and the same color rules.

## 6. Captions (karaoke)
- Chunks of **1-3 words**. Start a new chunk after 3 words, after punctuation, or before a keyword (keywords stand alone: "SLEEP", "HUM", "FORTY-ONE", "YOU").
- The whole chunk shows in white and the **spoken word turns lime #C8E234**, in sync with the voice. Danger words are **red** (DEAD, SLEEP, HUM, SOUND, SLEEPER, KNEEL); authority or warning words are **amber** (RESCUE, SEVEN DAYS, ONE CHANCE).
- Position: centred, about **78% down** in wide shots and about **62%** when a character fills the frame (just under the subject, never covering a face). Never inside the top 12% or bottom 25% of the screen.
- Size: about 66 px cap height at 1080 wide. Two-line wrap allowed.
- Entrance: pop-in, scale **85% → 105% → 100% over about 6 frames** (spring: damping 12, stiffness 220). No exit animation; the next chunk hard-replaces it.
- Style: drop shadow (0 / 3 px / 6 px blur, black 70%), **no box**.
- Trailing ellipses carry suspense across cuts ("IN YOUR DOORWAY…", "THEN…").
- Captions change about every **0.47 s** (never slower than every 0.6 s).

## 7. HUD: on screen for every frame, never moves with the camera
- Position: top-left, x≈66 px, y≈225 px (at 1080 wide).
- **Line 1:** ● **EP 1 / 7** (red dot plus red mono tracked text). Optionally the story name in grey.
- **Line 2:** clock in **Bebas Neue**, huge and white, with a small mono label: **41:00** `HOURS AWAKE`.
- **Line 3:** a thin divider, then mono grey labels with white values: **AWAKE IN CITY 5 · NOISE 24 dB · SLEEPERS NEARBY 1** (the first label becomes SURVIVORS 5 once your group is introduced).
- **Line 4** (appears once it is set up): amber **RESCUE IN 7 DAYS**.
- Behaviour:
  - The clock jumps forward at every beat (41:00 → 41:10 → 41:35 → 42:05 → 43:20 → 44:00 → 45:10).
  - Any jump of more than 5 min flashes a **"+N MIN"** tag for 1 s.
  - **NOISE** rises with danger: it ticks up when a rule is broken and flashes red above 60 dB. It spikes at the twist (e.g., 24 → 110 dB).
  - **SLEEPERS NEARBY** rolls up with `Math.round(interpolate(...))` when the map twist lands (1 → 3,412).
  - Stats change with a lime "+" or red "−" delta tag.
- Story 2 (demon) swaps the labels: `NIGHT n / 7`, `ENTITY DISTANCE (m)`, `NOISE dB`.

## 8. Camera and motion
- Never fully still. Every shot runs a push-in or a float.
  - **Push-in:** x1.10-1.18 over 4-6 s (2-4%/s), with a small drift (about 110 px left, 50 px up). Use it for establishing shots and the face close-up at the twist.
  - **Pull-out:** x1.03 → 1.00 with a -1° roll for vulnerability.
  - **Float / breathe:** x1.004 over 4 s with 0.5-1° sinusoidal sway (`sin(t*0.8)*0.6`) for night scenes, so it feels like someone is watching.
  - **Vertical tilt-down:** a full-frame pan in about 1 s (sky → street → crowd).
  - **Slide-up entrance:** objects such as the phone, tablet, radio and shotgun rise from below the frame with a 3° tilt and an ease-out.
  - **Pose cuts on the beat:** stand → crouch → freeze.
- **Transitions:**
  - Hard cuts on narration beats.
  - Dip to black for 3-4 frames between locations.
  - A 1-2 frame full red flash before danger reveals.
  - **Light-off cuts:** a lamp dies or a streetlight pops out and the scene drops to near-black. That transition is a story event.
- **Easing:** cubic ease-in-out for the camera; ease-out-back (slight overshoot) for UI pop-ins. **Never linear.**
- Rule pills: a red rounded rect scales 0 → 1.08 → 1 over 6 frames, above the caption.
- **Screen shake** (4-8 px, 6 frames, damped) on every knock, boom or hum-hit.
- Choice screen:
  - The title types on.
  - Cards A and B slide in from x+40 px, staggered 0.5 s.
  - Icons fade in last.
  - Pills: **A = lime/green**, **B = red**. Dark background only, no characters behind the buttons.
- CTA: hard cut to black; the text fades up over 8 frames and holds 2-3 s.

## 9. Sound design (voice-first)
- Voice is always the loudest element (-13 LUFS per line). **SFX at about 1/2 the voice level, drone at about 1/4.**
- **Drone / bed:** dark sub-bass pad (sub-150 Hz) at -28 to -32 dB, under everything, **ducked 6 dB whenever a word is active** (computed from the word timestamps). Vary it: do not let the bass sit constant for more than 10 s.
- **Ambience:** cold wind and distant city by default; fridge hum and clock ticks inside; radio static on radio shots; building creaks when the tension rises. Cut ambience when the lamp dies.
- **The hum (zombie signature):** one low sustained note (D2). One Sleeper at the start, layered with slightly detuned copies until it is thousands by the big twist. Never loud enough to cover the narrator.
- **Hits:**
  - About one every 1.5-2 s: low boom on cuts, whoosh on push-ins.
  - Pop on every caption chunk (about -24 dB) and every UI or rule pill.
  - Knocks, glass cracks, a shotgun slide, a lamp switch click, tablet pings.
  - Rolling ticks on number counters.
- **Signature cues:**
  - Radio static with the plant breath (see section 3).
  - Two-tone alert (853 + 960 Hz) under any "warning" screen.
  - A deep boom when the Sleepers' eyes open.
  - Heartbeat into each twist, rising from 60 to 120 bpm.
- **Silence drops:** cut everything, drone and hum included, for **0.3-0.7 s** right before each major reveal, holding the frame static. **At least 2 per episode**, about one every 20 s. One long true-silence hold (about 2 s) is allowed in the buildup to the big twist.
- Final mix about **-14 LUFS** (`loudnorm=I=-14:TP=-1:LRA=9`), AAC 48 kHz.

## 10. Beat structure (13 beats). EP1 "The Note" in this style, as the reference
**Episode 1 opens on the doorway threat, REWINDS to Hour 0, shows how the world fell in fast cuts (0.8-1.5 s per shot), then snaps back to Hour 41 for the twists.** Full frame-level script: `hours_awake_ep1_v2.md`.

| # | ~Time | Narration (v4 voice) | Visual / camera | HUD |
|---|---|---|---|---|
| 1 | 0-4 | IMAGINE YOU / CAN'T SLEEP. / THAT'S THE ONLY / REASON / YOU'RE ALIVE. | A Sleeper in your doorway; the dead city at sunrise; your bloodshot eyes | 41:00 · AWAKE IN CITY 5 |
| 2 | 4-8 | FORTY-ONE HOURS AGO, / EVERY PHONE / IN THE CITY / BUZZED. / ONE LOW NOTE. | HUD clock rewinds to 00:00; windows glow blue in a ripple; phone shows "1 NEW SOUND"; you put on headphones | 00:00 · 4,127,000 |
| 3 | 8-12 | ONE HOUR LATER / EVERYONE / WAS ASLEEP. / DRIVERS. / PILOTS. / ALL OF THEM. | 5 cuts: bus driver, bus into a lamppost, stadium crowd, pilot, city lights off | 01:00 · count collapses to 2,000 |
| , | ~12 | *(silence drop, 0.4 s)* | Static black | |
| 4 | 12-17 | AT 3:07 AM / THEY ALL STOOD UP. / EYES CLOSED. / HUMMING. / HUNTING BY SOUND. | Phone clock 3:07 AM; red flash; Sleepers rise like dominoes; a car alarm; every head snaps | 03:20 · NOISE 95 dB |
| 5 | 17-21 | YOU SURVIVED / BECAUSE OF / YOUR HEADPHONES. / THE NOTE / NEVER REACHED YOU. | You in bed with headphones; you lift an earcup, the hum floods in; inserts of DJ, Maya, Reyes | 04:10 · 38 |
| 6 | 21-25 | BY SUNRISE / THE SIRENS / STOPPED. / A PLANE / FELL / FROM THE SKY. | Smoke over the skyline; gridlocked cars; silence drop; a silent plane falls, white flash, boom | 06:30 · NOISE 120 dB |
| 7 | 25-38 | RULE #1 NEVER SLEEP… / RULE #2 NEVER MAKE A SOUND… / RULE #3 IF THEY HUM… RUN. | Three red pills, each with a flashback (the neighbor's microsleep, the falling cup, the sprint) | 14:00 / 22:00 / 30:00 |
| 8 | 38-43 | FOUR OTHERS SURVIVED. / A NURSE. / A SOLDIER. / A DJ. / AND YOUR BROTHER. / EIGHT YEARS OLD. | Dollhouse crane-up, names pop in | 36:00 · SURVIVORS 5 |
| 9 | 43-49 | NOW IT'S HOUR FORTY-ONE. / THE RADIO SAYS STAY AWAKE. / HELP COMES IN SEVEN DAYS. / STAY WITH ME. | Radio close-up; amber RESCUE IN 7 DAYS; Ollie nods off and wakes (plants) | 41:00 |
| 10 | 49-55 | THEN / MAYA'S MAP / LIGHTS UP. / THOUSANDS OF DOTS. / EVERY ONE / WALKING HERE. | Tablet map; dots converge on your building; **mid twist (about 60%)** | SLEEPERS NEARBY 1 → 3,412 |
| , | ~55 | *(silence drop, 0.5 s)* | Static frame, lamp off | |
| 11 | 55.5-59.5 | THE STREET / GOES SILENT. / THOUSANDS / KNEEL. | Wide: a perfect circle of Sleepers; 1.5 s true silence; they kneel | 41:40 · NOISE 0 |
| , | ~59.5 | *(silence drop, 0.5 s)* | Static frame | |
| 12 | 60-68 | THEIR EYES OPEN. / EVERY ONE / LOOKS UP / AT YOUR WINDOW… / NOT THE BUILDING. / AT YOU. | Eyes open (glow); wave across the crowd; heads tilt up; the barcode mark behind your ear; smash to black | 42:00 · NOISE 110 dB |
| 13 | 68-79 | TWO WAYS OUT. / A THE ROOF. / B THE BASEMENT. / ONLY ONE IS QUIET. / COMMENT A OR B | Choice screen: "WHAT DO YOU DO?"; A lime, B red cards | |
| CTA | 79-82 | FOLLOW FOR HOUR 52 | Hard cut to black; text fades up; loops to the doorway Sleeper | |

Word budget for EP1 is about 165 words. The big twist (beat 12, 73-83% of the runtime) is inside the 70-85% window.

## 11. Production pipeline
1. Story, premise and counter → 2. Script in 10-14 beats (140-190 words) → 3. v4 voice plus the crisp chain (plus the breath sample) → 4. Word timestamps → 5. Beat-sheet JSON → 6. Assets as flat layers (background, mid, character, glow, foreground) → 7. Animate (camera per beat, parallax, UI entrances, story events) → 8. Karaoke captions plus the HUD on top → 9. Sound (drone, hum, SFX on cuts and pops, silence drops, ducking, -14 LUFS) → 10. Export and QA.
- Render: an HTML Canvas 2D page with `renderAt(t)` at 540x960 logical, captured at deviceScaleFactor 2 by Playwright (4 workers), then muxed with ffmpeg. The HUD and captions are drawn **outside** the camera transform.

## 12. QA checklist (all must pass before delivering)
- [ ] The first words are "Imagine you…" and the premise is clear by 3 s (the threat is on screen at frame 0)
- [ ] A new visual or camera event at least every 8 s (target every 4-6 s)
- [ ] Captions change at least every 0.6 s, keywords in lime, danger words in red, authority words in amber
- [ ] The HUD is visible on **every** frame, its clock jumps forward at each beat, NOISE and SLEEPERS NEARBY change at the right beats
- [ ] No fully static shot longer than 2 s (except the silence-drop holds and the one planned 2 s silence hold)
- [ ] At least 3 numbered RULES, every fact double-checked
- [ ] At least 2 silence drops before major reveals
- [ ] A mid twist at about 60-65% and a big twist at 70-85% of the runtime
- [ ] The monsters are never seen moving; they only appear in new positions after a cut, a drop or a light-off
- [ ] At least 2 plants for later episodes, none explained on screen
- [ ] Ends on a one-letter A/B choice plus the follow line; the vote card is on a clean dark background; the last readable image is bright and clear on a phone
- [ ] No red wash over a whole shot except the 1-2 frame danger flashes
- [ ] Narration is the v4 dan voice with the crisp chain, no echo; only the narrator is voiced; final mix about -14 LUFS; voice always the loudest element
- [ ] Contact sheets (about every 0.5 s) show no characters cut off at the edges, no captions over faces, no text in the top 12% or bottom 25%, no clipped text
- [ ] ffprobe confirms 1080x1920, 30 fps, 55-85 s, AAC 48 kHz

---
### Appendix: what changes from the STRANDED master
| Area | STRANDED | Apocalypse master |
|---|---|---|
| Genre | Survival drama (island) | **Apocalypse horror: zombie stories alternate with demon stories, 7 episodes each** |
| Voice | Orpheus dan plus the crisp chain | **Same, unchanged; only the narrator is voiced; the breath sample is added as an SFX layer** |
| Point of view | Second person | **Second person, and the viewer is literally the survivor (hands, reflections)** |
| Counter | DAY n / 7 | **HOURS AWAKE clock plus EP n / 7** |
| HUD stats | WATER · FOOD · TRUST | **AWAKE IN CITY · NOISE dB · SLEEPERS NEARBY** |
| Rules | 3 survival rules | **3 monster rules (sound, sleep, hum), each built on a verified fact** |
| Twist | One helper-is-the-threat twist | **A mid twist plus a big twist, plus plants for later episodes** |
| Monsters | None | **Never seen moving; only new positions after cuts, silence drops or light-offs** |
| Visuals | Flat vector night | **2.5D layered flat vector, block characters, parallax, one light source, warm = safe / cold = danger** |
| Audio | Ocean, wind, fire | **Hum layers, radio static, creaks, knocks, heartbeat, long silence holds** |
| Series structure | Day 1-7 | **7 episodes per story, then switch story; vote result opens the next episode; both branches rejoin** |
| Ending | "FOLLOW FOR DAY 2" | **"WHAT DO YOU DO?" A/B → "FOLLOW FOR HOUR 52" (next episode's clock)** |
