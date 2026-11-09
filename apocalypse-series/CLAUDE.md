# APOCALYPSE VIDEO SERIES: COMPLETE PROJECT BRIEF FOR CLAUDE CODE
One file. Everything decided so far in the planning chat. Read it fully before doing anything, then follow PART 1 for how to work.

**Contents**
1. PART 1: Read first (mission, standing rules, workflow)
2. PART 2: Project context and decisions log
3. PART 3: Series bible (Story 1 "HOURS AWAKE")
4. PART 4: Master production prompt (visuals, captions, HUD, camera, sound, QA)
5. PART 5: Voice direction (emotional narration with audio tags)
6. PART 6: Episode 1 v2 "The Note" (full script)
7. PART 7: Tooling and setup
8. PART 8: Reference analysis, lessons learned, retention, monetization

---

# PART 1: READ FIRST

## 1.1 Mission
Make a series of **vertical (9:16) animated horror shorts for Instagram Reels (and later YouTube Shorts / TikTok)**. Each episode is 55-85 s, in a stylized block/cartoon look, strictly **apocalyptic** (zombie or demon stories; "last person on Earth" is allowed only as the *situation* inside an apocalypse). Each episode:
- puts the **viewer in the story** (second person: "Imagine you…", the viewer is the survivor),
- has a **huge plot twist** (a mid twist and a big twist),
- ends on an **A or B choice** the viewers vote on in the comments,
- uses an **emotional, tag-directed narrator voice**,
- is built to **maximize retention** (see PART 8).

After a fixed number of episodes (7), the series **switches to a new story** (alternate zombie and demon).

The owner wants **perfection-level quality**, stunning animation and visuals, fast pacing, and scripts so detailed (frame by frame, camera angle by camera angle) that you can build the video without guessing.

## 1.2 The owner (how to work with them)
- Dictates messages by voice, so expect typos and run-on sentences ("plugins" may appear as "0lugins"). Interpret generously.
- Works from the Claude mobile app for planning and from Claude Code on a computer for building. They will paste or upload files like this one.
- Wants **step-by-step, plain instructions** for any setup, and **short answers on mobile**, but files and scripts should be complete.
- Asks for **brutal honesty** ("brutally criticize it as a viewer with a shit attention span"). Give real critique, not praise. Admit when something was weak.
- Prefers you to **do the work** instead of asking many questions. Ask **at most one** question per reply, and only when the answer changes what you build.
- Saved preference: **every video script includes inline voice-emotion audio tags (ElevenLabs style) plus voice-direction instructions for Claude Code.**

## 1.3 Standing rules (never break these)
1. **Strictly apocalyptic.** Zombie or demon world-ending stories. (The owner also runs a separate STRANDED series, island/isolated survival, with its own master prompt; never mix the two.)
2. **Second person, viewer = character.** First words are "Imagine you…". Use hands, reflections, phone screens and a HUD so the viewer is the survivor.
3. **Hook in the first second.** The threat must be on screen at frame 0. No slow openings, no black starts.
4. **Every episode has:** at least 3 numbered RULES of the monster, a mid twist (about 60-65%), a big twist (70-85%), at least 2 silence drops before reveals, at least 2 plants for later episodes, and an **A/B vote** ending with a "Follow for…" line.
5. **7 episodes per story, then switch.** Alternate zombie / demon / last-person-in-an-apocalypse. **(Updated by owner) Each vote changes the course of the story completely; branches do NOT rejoin.** The A/B options must be a painful trade-off (save a loved one vs. something huge, like the world or a billion dollars). Only the winning branch is built; plan one episode ahead per vote. **The POSTED Episode 1 is v2 "The Note" (PART 6, `hours-awake/ep1/`).** v3 "The Last Seat" was never posted (`hours-awake/ep1/v3_unposted/`, an idea reserve). The PART 3.4 arc table is superseded; `SERIES_LOG.md` is the source of truth for what has aired and what won.
6. **Pace up.** Flashback or montage shots 0.8-1.5 s; other shots no longer than 3 s except planned holds. A visual or sound event at least every 0.8 s in montage beats.
7. **Quality bar.** Clear geography (always a wide shot before close-ups), two-color lighting logic (warm amber = safe, cold blue = danger, red only for alerts), readable final frame on a phone at low brightness, text kept out of the top 12% and bottom 25% of the screen. No clutter on the vote card.
8. **Never see the monster move.** Monsters only appear in new positions after a cut, a silence drop or a light going out.
9. **Original stories only.** Inspiration: A Quiet Place (sound-hunters), The Last of Us and The Walking Dead (collapse, survivors). Never copy their creatures, scenes or plots, and never copy the reference channels' scripts.
10. **No gore.** Violence is implied by cuts to black.
11. **Voice:** tagged narration per PART 5. Captions come from the tag-stripped text. Timing comes from the transcribed audio.
12. **Facts:** every real-world fact used in a rule must be double-checked with a web search before publishing (microsleeps, speed of sound, etc.).
13. **Be honest about limits.** You cannot see Instagram analytics, cannot hear audio quality in renders, and cannot verify that a concept is unique on the platform. Say so when relevant.

## 1.3b Owner's viral-retention notes (added before Episode 2; apply from Ep 2 on)
1. **Hook (first 3 s):** start mid-action or with a jarring, counterintuitive line, never a slow intro ("In the year 2045..."). Keep "Imagine you..." but put the shock inside it (e.g. "Imagine you have sixty seconds..."), or put the shock line first and "Imagine you" within 2 s.
2. **"You see" turn within 5 s:** a quick pivot that makes the viewer re-read what they are looking at (the safe thing is the threat, the rescue is a trap, the person is a Sleeper).
3. **Hook text overlay:** a big high-contrast suspense line on screen for the first 3 s, readable on mute, separate from the karaoke captions, inside the safe zone.
4. **Voice:** human-sounding emotional ElevenLabs voice, never flat or default TTS; pacing matches the anxiety.
5. **Sound is mandatory:** sub-bass drone, distant alarms, static crackle, wind under every line. Never deliver a silent render.
6. **Don't accept the first render:** iterate on camera glides, harsh backgrounds, and make the focal point clear on a small phone screen.
7. **Snappy length:** the owner's research says 20-45 s works best; this conflicts with the 55-85 s rule in PART 4. Until the owner decides, aim for the shortest length the story allows and cut every non-essential line.
9. **Episode openings (owner rule):** every episode after the first starts with "Imagine..." + the final moment of the previous episode, then the narrator acknowledges the vote in plain words ("Most of you chose A. So..."), with a `YOU CHOSE: A · <option>` HUD tag for 3 s.
10. **Vote format (owner rule):** the final A/B grows straight out of the big twist and is a concrete, physical, on-the-clock situation the viewer is in. A = save yourself / take the safe or selfish way out; B = risk your life for someone you love (or the reverse framing, but always that tension). Example: the Sleepers are breaking the door, your brother is in the basement: A run to the roof and leave him, B go down for him. Full immersion: POV, your hands, your breath.
11. **Movie-style continuity (owner rule):** write every episode like a film scene, not a list of events. Each event must be caused by the one before it and shown step by step (e.g. you lock the door, it shakes, you search the roof, you find blocks and a plank, you brace it). Any object used in the vote must be found and used earlier in the episode. Skip only dead time where nothing happens ("ten hours"). Default length 85 s. Include a "chain of cause and effect" list in every episode file.
8. **Iterate, don't spam:** no near-identical re-uploads. Use the drop-off point in analytics (owner reports it) to fix that exact scene.

## 1.3c Story craft (MANDATORY)
Before writing any episode, read `STORY_CRAFT.md` and answer its pre-writing checklist. Events alone are boring (owner's verdict on Ep 2); every episode needs a relationship ritual, a split-second moment replayed, a guilty vote, a quiet last image and one unanswered 2 AM question.

## 1.4 Workflow for any request
**When the owner says "Episode N" (or gives a vote result):**
1. If the previous episode's vote result is unknown, ask which option won (A or B). If it is known, start immediately.
2. Fill in the **Episode block** (PART 4, section 0 template).
3. Write the **tagged narration, one block per beat** (PART 5 format), 140-190 words, plus the clean (tag-free) caption text.
4. Write the **beat-by-beat shot script** with times (seconds), camera moves, visuals, HUD values, SFX and silence drops (use PART 6 as the format reference).
5. Include the **opening variant** for the chosen A/B branch (about 5 s, rejoining the main episode).
6. Add the **plants** list and the **episode QA checklist**.
7. Save as `epN_script.md` (and a `timeline.json` when building). Never put gore, real people or copyrighted material in a script.

**When the owner says "build it":**
1. **Plan mode first.** List components, file structure, timeline data format; wait for the owner's OK.
2. All timing lives in **one data file** (`timeline.json` or `src/timeline.ts`): shots, voice lines, caption words, SFX, HUD changes. Components read from it. No hardcoded frame numbers.
3. Generate voice per beat (PART 5), transcribe it for word timestamps, build captions from the clean script.
4. Render check with **Playwright contact sheets** (a frame about every 0.5 s) before the full render. Fix clipping, captions over faces, and safe-zone violations.
5. Re-render only the changed time range for small fixes. Run the QA checklist (PART 4, section 12, and the episode checklist).
6. Deliver `/out/hours_awake_epN.mp4` and a short report (what was built, what is approximate, what needs the owner's decision).

**When the owner asks for a new story:** propose a one-page story bible (premise, 3 monster rules with real-fact anchors, cast, 7-episode twist table, plants, A/B votes), then write Episode 1 in full.

**When the owner shows a reference video:** analyze its hook, cut cadence, HUD, rules, twist, ending and captions; extract the *structure*, never the content.

---

# PART 2: PROJECT CONTEXT AND DECISIONS LOG

## 2.1 Definition (agreed)
An **apocalypse** is when the world you knew has ended and **no help is coming**. Three parts make a story apocalyptic: (1) the old world is gone; (2) a force you can't beat head-on (virus, demons, a sound); (3) survival is the whole story.
- **Zombies and demons** are the *threat*. **"Last person on Earth"** is the *situation* (needs a cause behind it).
- **Apocalypse** = the collapse itself; **post-apocalyptic** = life after. Episode 1 shows the collapse; later episodes lean post-apocalyptic.
- **Stranded** (two people on an island, one mountain, a desert) is a **different genre**: the rest of the world is fine and rescue exists. Test: *is the rest of the world fine?* Yes → stranded. No → apocalypse. Keep the two series and their master prompts separate; a crossover is possible later, but only after each has its own audience.

## 2.2 Decisions made (in order)
1. Style: animated block/cartoon shorts like the owner's reference channels; apocalyptic/horror; viewer as the character; very immersive; cliffhanger endings.
2. Early drafts ("Don't Open the Door", "CAM 4", a first "THE LAST SIGNAL" family bunker story) were **discarded**: a render critique found them flat, confusing and slow (see 8.2). Some ideas are kept in the seed bank (3.6).
3. The owner briefly asked for pure cliffhangers without a vote, then **reinstated the A/B vote** for the series. **Final: every episode ends with an A/B vote; the most voted choice decides the next episode.**
4. **Strictly apocalyptic** from now on; **zombie outbreak first** for Story 1. The story must be unique, outstanding and shocking.
5. Story 1 = **HOURS AWAKE** (zombie "Sleepers", 7 episodes; see PART 3).
6. **Episode 1 must show how it all went down** (the collapse from Hour 0 to Hour 41), **paced up**, properly apocalyptic, at perfection quality. This is delivered as PART 6.
7. Narration must **talk with emotion**: ElevenLabs-style audio tags in every script (PART 5).
8. One more series exists separately: **STRANDED** (island survival). It has its own master prompt and is out of scope here.

## 2.3 Open items (decide with the owner, don't assume)
- **Episode 1 vote result:** A, THE ROOF (posted Ep 1 = v2 "The Note"). Episode 2 "Thirty Seconds" is written. See `SERIES_LOG.md` for later results.
- **Look: 2.5D layered flat vector (default, Canvas 2D pipeline) vs real 3D** (Remotion + @remotion/three, see 7.4). The owner said "3D like the samples I sent"; the samples are a mix of flat stickman (2D), flat cartoon (2D) and Roblox-style 3D. The default in this file is **chunky block characters with bevel shading, 5 parallax layers, one light source** so it reads as 3D. If the owner asks for true 3D, use 7.4.
- **Voice engine:** ElevenLabs (emotional tags, uses account credits) vs the local free Orpheus fallback (no emotion tags). Default: ElevenLabs when connected.
- A downloaded skill named **cartoon-audio-short** (SKILL.md) exists on the owner's side. Its contents have **not** been reviewed; read it if present and follow its audio/caption rules where they don't conflict with this file.
- Story 2 (demon) and Story 3 (last person) are **not outlined yet**; only slots and seeds exist (3.6).
- Episodes 2-7 outlines are drafts; reconcile them with Episode 1 v2's changes before writing each (see 3.4 continuity notes).

## 2.4 Other ideas the owner raised (parked, separate from this series)
- A **"30-day glow-up" channel** (a man with a high-school reunion in 30 days; viewers vote on the next step like gym or hair clinic; several posts a day). Good structure (countdown, transformation, voting). Risk: body-shaming backlash can reduce reach; make the character a lovable underdog. It is a different genre and **must not be mixed into the apocalypse account.**

---

# PART 3: SERIES BIBLE: STORY 1 "HOURS AWAKE" (ZOMBIE)

## 3.1 Premise
One night a single low sound (the **Note**) reaches every phone in a city at once. Anyone who falls asleep wakes up as a **Sleeper**: eyes closed, slumped upright, silent except for one low humming note, **hunting by sound**. **You** have been awake 41 hours, alive only because you couldn't sleep and wore noise-canceling headphones. You are trapped in a 5-floor apartment building with four other survivors. A radio says: "Stay awake. Help comes in seven days."

**Hidden secret (never explained until the finale):** the calm second-person **narrator is the virus**, keeping you company and keeping you awake. It is hinted at in every episode.

## 3.2 Cast
- **YOU:** the viewer. Mustard hoodie `#EAB308`. Seen from behind, as hands at the bottom of the frame, or in reflections. Never shown full-face.
- **OLLIE:** your brother, 8. Red beanie, dinosaur toy. (Later reveal: he has been sleeping for two days and is fine.)
- **MAYA:** nurse. Teal scrubs, tablet.
- **REYES:** 60s, gray beard, camo jacket, shotgun. (Later: he slept 6 hours before the story and will turn.)
- **DJ:** teen, purple hoodie, headphones, radio. (He broadcasts the radio voice; later we learn the voice is a loop.)
- **SLEEPERS:** pale gray `#C9CED6`, dark under-eye circles, eyes closed, head tilted 10-15°, slow sway, arms hanging, throats vibrating when they hum. **They glide; they never run. Their eyes glow cold white `#E6F7FF` only when they open (episode 1's big twist).**
- **THE NARRATOR:** calm, warm, close-mic, **slightly too gentle** (that is the hint).

## 3.3 The rules of the world (used across episodes)
1. **Never sleep.** A microsleep is enough (microsleeps can last up to about 30 s; verify before publishing).
2. **Never make a sound.** Sleepers hear everything; sound travels about 343 m/s (about 3 s per kilometer; verify).
3. **If they hum, run.** One low note means they have chosen a target.
New rules may be added per episode, but every episode keeps **at least 3 numbered rules**.

## 3.4 Seven-episode arc (drafts: refine each time, keep the twists)
| Ep | Hour | Title | Mid twist | Big twist | Vote A / B |
|---|---|---|---|---|---|
| 1 | 41 | The Note | Every Sleeper in the city is walking toward your building | They kneel, open their eyes for the first time, and look at YOU, not the building | Roof / Basement |
| 2 | 52 | (TBD) | A "rescue" helicopter circles but never lands: it is tracking you | Reyes confesses he slept 6 hours ago and will turn in 8 hours | Lock Reyes up / Take his shotgun and trust him |
| 3 | 63 | (TBD) | Maya's notebook: a code tattooed behind every Sleeper's ear, from a sleep study | You have the same mark. You were Subject 0 | Read the rest / Burn it |
| 4 | 79 | (TBD) | The radio voice is a loop (the same breath at the same second) | "Dawn Camp" is a collection point, not a refuge | Go to the camp / Hold the building |
| 5 | 96 | (TBD) | Reyes turns and doesn't attack you | The Sleepers kneel around you. Ollie has been sleeping for two days and is fine | Wake Ollie / Let him sleep |
| 6 | 120 | (TBD) | The Sleepers aren't undead | They are people stuck in a shared dream anchored to you; they hunt you because you keep it open | Sleep / Stay awake |
| 7 | 168 | (TBD) | The narrator drops the act | The narrator speaks through every Sleeper's mouth at once: "I never warned you. I was keeping you company." | Cliffhanger into Story 2 |

**Continuity notes from Episode 1 v2 (reconcile Eps 2-7 with these):**
- The Note arrived through **phones**; all five survivors had something in their ears (headphones, earbuds, earplugs) when it played.
- Episode 1 planted: the narrator's breath sample = the radio's breath; "Stay with me" (narrator); Ollie nodding off; Reyes humming for 4 frames (in v1; optional in v2); the barcode-like mark glowing behind your ear in a window reflection.
- Voting rule: both branches rejoin; the next episode opens with a ~5 s variant and a "YOU CHOSE: …" HUD tag.

## 3.5 Plants and payoffs tracker
| Plant (episode) | Payoff (episode) |
|---|---|
| Barcode mark behind your ear (1) | Subject 0 reveal (3) |
| Narrator inhale = radio exhale (1) | The radio voice is a loop / the narrator is the virus (4, 7) |
| "Stay with me" / "I'll stay with you" (1) | Finale line (7) |
| Ollie nods off and wakes (1) | Ollie has been sleeping for two days and is fine (5) |
| Headphones / earplugs on all five (1) | Ear protection is why the Note didn't reach you; later it also hints you were chosen (3, 6) |
| Reyes's throat humming (v1 idea) | His confession (2) |
Keep this tracker updated as episodes are written.

## 3.6 Seed bank for future stories (originals; develop before using)
- **Story 2 (demon) options:**
  - *The Dimmers:* demons that can only move where there is no light; streetlights go out one by one; a shadow that does not wave; a voice at the door in a dead loved one's voice (they repeat last words). Rules: stay in the light, never answer your name, only open for two knocks.
  - *Quiet-style entity:* hunts by sound, or by looking, with its own three rules (keep it original; do not copy any film's creatures).
  - *CAM 4:* an apartment security-camera story where your own room's feed is delayed by 3 seconds, so anything you see behind you on screen is already there.
- **Story 3 (last person in an apocalypse):** you wake up and the world is empty; the reveal is what emptied it.
- Rotation: Story 1 zombie → Story 2 demon → Story 3 last-person (or zombie again).


---

# PART 4: MASTER PRODUCTION PROMPT (APOCALYPSE SERIES)
> Note: the owner also has an existing "Horror Choice Shorts" benchmark playbook and a STRANDED master prompt (the file this one was adapted from). If the playbook is present in the project, follow it; where it conflicts with this file, **this file wins**. If it is not present, this file is self-contained.

## APOCALYPSE: MASTER SERIES PROMPT
#### Built on the "Horror Choice Shorts" benchmark playbook, with the narrator voice locked to the v4 chain. Series 1: HOURS AWAKE (zombie). Series 2 slot: demon.

Produce a finished, upload-ready vertical short and deliver the HD MP4, not a plan. Work autonomously.
**Follow the "Horror Choice Shorts" benchmark exactly. The one exception is narration, which stays exactly as in section 3. Where this file and the playbook disagree, this file wins.**

---

### 0. Episode template (fill in this block)
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

Filled example (Episode 1, full file: PART 6 of this file):
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

### 1. Output spec
- 1080x1920, 9:16, 30 fps, H.264 `-preset slow -crf 18 -pix_fmt yuv420p`, AAC **48 kHz** 256k, `-movflags +faststart`.
- **Length 55-85 s** (target about 80 s). Script is **140-190 words** in **10-14 beats**.

### 2. Story formula (one line)
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

### 3. Narration: LOCKED to v4 (do NOT change)
> **Emotional narration option (Engine B):** when ElevenLabs is available, generate the narration from tagged scripts instead of the Orpheus chain below. Follow PART 5 of this file (inline tags like `[whispers]`, `[short pause]`, `[slowly]`, one audio file per beat, captions from the tag-stripped script, timing from the transcribed audio). Everything else in this prompt (captions, HUD, camera, sound design, QA) stays the same. If ElevenLabs is not connected, use the Orpheus chain below and say so in the report.

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

### 4. Word timestamps = the one timeline
- Get word start and end times for every line, using faster-whisper `word_timestamps=True` if installable. Otherwise split each line's duration across its words in proportion to syllable count.
- Data model (JSON, the single source of truth; changing the script means regenerating the JSON, not re-animating):
  ```
  Word = { text, start, end, color?: 'lime'|'red'|'amber' }
  Beat = { id, start, end, scene, camera:{from,to,dx,dy,rot?}, hudTime, stats:{survivors,noise,nearby}, sfx:[], silenceAt? }
  ```
- Captions, cuts, HUD clock jumps, NOISE meter changes, SFX and silence drops are all placed from these times.

### 5. Visual style bible
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

### 6. Captions (karaoke)
- Chunks of **1-3 words**. Start a new chunk after 3 words, after punctuation, or before a keyword (keywords stand alone: "SLEEP", "HUM", "FORTY-ONE", "YOU").
- The whole chunk shows in white and the **spoken word turns lime #C8E234**, in sync with the voice. Danger words are **red** (DEAD, SLEEP, HUM, SOUND, SLEEPER, KNEEL); authority or warning words are **amber** (RESCUE, SEVEN DAYS, ONE CHANCE).
- Position: centred, about **78% down** in wide shots and about **62%** when a character fills the frame (just under the subject, never covering a face). Never inside the top 12% or bottom 25% of the screen.
- Size: about 66 px cap height at 1080 wide. Two-line wrap allowed.
- Entrance: pop-in, scale **85% → 105% → 100% over about 6 frames** (spring: damping 12, stiffness 220). No exit animation; the next chunk hard-replaces it.
- Style: drop shadow (0 / 3 px / 6 px blur, black 70%), **no box**.
- Trailing ellipses carry suspense across cuts ("IN YOUR DOORWAY…", "THEN…").
- Captions change about every **0.47 s** (never slower than every 0.6 s).

### 7. HUD: on screen for every frame, never moves with the camera
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

### 8. Camera and motion
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

### 9. Sound design (voice-first)
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

### 10. Beat structure (13 beats). EP1 "The Note" in this style, as the reference
**Episode 1 opens on the doorway threat, REWINDS to Hour 0, shows how the world fell in fast cuts (0.8-1.5 s per shot), then snaps back to Hour 41 for the twists.** Full frame-level script: PART 6 of this file.

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

### 11. Production pipeline
1. Story, premise and counter → 2. Script in 10-14 beats (140-190 words) → 3. v4 voice plus the crisp chain (plus the breath sample) → 4. Word timestamps → 5. Beat-sheet JSON → 6. Assets as flat layers (background, mid, character, glow, foreground) → 7. Animate (camera per beat, parallax, UI entrances, story events) → 8. Karaoke captions plus the HUD on top → 9. Sound (drone, hum, SFX on cuts and pops, silence drops, ducking, -14 LUFS) → 10. Export and QA.
- Render: an HTML Canvas 2D page with `renderAt(t)` at 540x960 logical, captured at deviceScaleFactor 2 by Playwright (4 workers), then muxed with ffmpeg. The HUD and captions are drawn **outside** the camera transform.

### 12. QA checklist (all must pass before delivering)
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
#### Appendix: what changes from the STRANDED master
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


---

# PART 5: VOICE DIRECTION

## VOICE DIRECTION: emotional narration with audio tags
Add this file to every episode's instructions for Claude Code. It tells Claude how to write, generate and mix a narrator that **acts** instead of reading.

The reference you shared (ElevenLabs Text to Speech, voice "Brian: Deep, Resonant and Comforting") shows the method: **plain script text with inline [audio tags] before the words they affect.** Tags are never spoken. They direct the delivery.

---

### 1. Engine and settings
- **Engine B: ElevenLabs Text to Speech** (Eleven v3 or newer, the model your screen shows). Engine A (the local Orpheus voice in the master prompt, section 3) stays available as the free fallback, but it cannot act: it has no tag vocabulary like this.
- **Voice:** a deep, calm, close-mic male narrator. Start with "Brian: Deep, Resonant and Comforting" as in your video. Use the **same voice for the whole series.** Never switch voices between episodes.
- **Stability: Creative or Natural.** Robust stability makes the voice ignore tags. Do not use Robust.
- **No SSML.** `<break time="1s"/>` does not work with these models. Use `[short pause]`, `[long pause]`, commas, and ellipses instead. If an exact pause length is needed, add silence in the audio editor/ffmpeg after export.
- Output: MP3 or WAV at 44.1 kHz or higher, resampled to 48 kHz at the final mux (same as the master prompt).

### 2. Tag vocabulary (use only these unless a test proves another works)
| Group | Tags | Use for |
|---|---|---|
| Volume / intimacy | `[whispers]` `[whispering]` `[quietly]` `[softly]` `[very softly]` | Dread, secrets, the plants |
| Mood | `[calm]` `[serious]` `[darkly]` `[ominous]` `[tense]` `[gently]` `[warm]` `[numb]` `[urgent]` | Setting the emotional color of a beat |
| Pace | `[slowly]` `[rushed]` `[drawn out]` `[short breaths]` | Slow for weight, rushed for danger |
| Pauses | `[short pause]` `[long pause]` | Before reveals, after rules |
| Reactions | `[sighs]` `[exhales]` `[gasps]` `[exhales sharply]` | Rare. One or two per episode, at most |
| Intensity | CAPITALS on one word, `...` ellipses | Emphasis and weight |

Tags can be combined: `[whispering][darkly]`, `[low, restrained voice]`.

### 3. Writing rules for tagged scripts
1. **One clear cue per clause.** Put a new tag exactly where the tone should change. If the mood stays the same, do not repeat the tag.
2. **Tag BEFORE the words it should affect.**
3. **Every beat starts with a mood tag.** Never leave a beat untagged (it falls back to flat reading).
4. **Alternate energy.** Don't whisper every line. A good episode swings: calm → tense → whisper → urgent → silence. Following a whisper with a normal-volume line makes the next whisper feel bigger.
5. **Pauses before reveals.** Put `[short pause]` or `[long pause]` right before every twist word (HERE, KNEEL, OPEN, YOU) and after every rule.
6. **Capitalize at most one word per beat** for emphasis (ALIVE, THEM, RUN, YOU).
7. **Use ellipses for weight,** not for every sentence: `One low... note.`
8. **Short sentences.** 3-8 words. Fragments are fine.
9. **Don't over-tag.** About 2-4 tags per beat. If a line sounds odd, delete tags rather than adding more.
10. **Narrator secret (Series 1):** the narrator is secretly the virus. Make it **a little too gentle**: use `[softly]` or `[warm]` on lines like "Stay with me" and "Choose. I'll stay with you." Never explain why.

### 4. Emotional arc for every episode
| Stage | Mood tags | Delivery |
|---|---|---|
| Hook | `[quietly]` `[tense]` | Low and close, like a secret |
| Backstory / world | `[calm]` `[slowly]` `[ominous]` | Steady, drained |
| Rules | `[serious]` `[urgent]` `[whispers]` | Firm. Each rule gets its own pause |
| Slow burn | `[gently]` `[softly]` `[numb]` | Warmth that makes the horror hurt |
| Mid twist | `[tense]` `[building energy]` `[whispers]` | Pace creeps up |
| Silence before the big twist | `[long pause]` then `[whispering]` | Barely audible |
| Big twist | `[whispering][darkly]` `[slowly]` | Slow, heavy, one word at a time |
| Vote | `[calm]` `[warm]` `[urgent]` | Direct, an invitation, not a shout |

### 5. How Claude Code should generate the voice
1. **Write two versions of the script:**
   - `script_tagged.txt` (with tags, sent to the voice engine).
   - `script_clean.txt` (tags stripped with the regex `\[[^\]]*\]`, used for captions and the on-screen text).
2. **Generate one audio file per beat** (not the whole script at once). This keeps each call small, makes retries cheap, and lets the timeline place each beat exactly. Use the same voice ID, the same model, and the same settings for every call. Use a fixed `seed` if the API offers it, for consistency.
3. **Do not assume the timing from the script.** Tags and pauses change durations. After generating each beat, **transcribe the audio (faster-whisper with word timestamps)** to get the real start and end of every word, and build the caption and cue timeline from that.
4. **Check every beat.** Re-generate (up to 3 tries) if the beat is silent, if it reads a tag aloud (the transcript contains words like "whispers" or "short pause" that are not in the clean script), or if its length is outside the expected range (words ÷ 2.0-3.2 per second).
5. **Mix:** trim leading/trailing silence, then normalize each beat to about -16 LUFS and apply the master prompt's final loudness target (-14 LUFS for the full mix). Keep the voice the loudest element, and duck the drone 6 dB under each word.
6. **Place silences on purpose.** Add the planned silence drops from the shot script (0.3-0.7 s of total silence before reveals) in the mix, not in the voice engine.
7. **If ElevenLabs is not connected,** use Engine A (Orpheus) with the clean script and say clearly in the report that the emotion tags were not used.

### 6. Test line (run before every episode to verify the voice reacts to tags)
```
[calm] The sirens stopped on the third day. [short pause] Nobody noticed at first... because the silence was louder. [whispers] They told us it was a storm. [short pause] That the sky would clear. [slowly] But the sky never cleared. [serious] Maya walked the empty highway, counting the cars. Every door open. [short pause] Every engine cold. [softly] And every seat... still warm. [long pause] She thought she was the last one left.
```
The audio must clearly change in volume, pace and mood at each tag. If it does not, lower the stability setting or switch the voice before generating the episode.

---

### 7. EPISODE 1 v2 "THE NOTE": tagged narration (use with PART 6 of this file)
Beat numbers match that file. Generate one audio file per beat. Caption text is the same line with the tags removed.

**BEAT 1** (hook)
`[quietly][tense] Imagine you can't sleep. [short pause] That's the only reason... you're ALIVE.`

**BEAT 2** (the note, rewind)
`[calm][ominous] Forty-one hours ago, every phone in the city buzzed. [short pause] One low... note.`

**BEAT 3** (the city sleeps)
`[slowly][ominous] One hour later... everyone was asleep. [short pause] Drivers. [short pause] Pilots. [short pause] All of them.`

**BEAT 4** (3:07 AM)
`[serious] At three-oh-seven AM... they ALL stood up. [short pause] [whispering] Eyes closed. [short pause] Humming. [slowly][darkly] Hunting by sound.`

**BEAT 5** (headphones)
`[softly] You survived... because of your headphones. [short pause] [whispers] The note... never reached you.`

**BEAT 6** (sunrise, the plane)
`[numb][serious] By sunrise, the sirens stopped. [long pause] A plane... fell from the sky.`

**BEAT 7a** (rule 1)
`[serious] Rule number one. [short pause] Never sleep. [short pause] One microsleep... and you're one of THEM.`

**BEAT 7b** (rule 2)
`[whispers] Rule number two. [short pause] Never make a sound. [serious] It travels a kilometer... in three seconds.`

**BEAT 7c** (rule 3)
`[urgent][low, restrained voice] Rule number three. [short pause] If they hum... [rushed] RUN.`

**BEAT 8** (the five of you)
`[gently] Four others survived. [short pause] A nurse. A soldier. A DJ. [softly] And your brother. [short pause] Eight years old.`

**BEAT 9** (hour 41, the radio)
`[calm] Now... it's hour forty-one. [short pause] The radio says: stay awake. [slowly] Help comes in seven days. [long pause] [very softly][warm] Stay with me.`

**BEAT 10** (the map, mid twist)
`[tense] Then... Maya's map lights up. [short pause] Thousands of dots. [short pause] [whispers][building energy] Every one... walking HERE.`

**BEAT 11** (the circle)
`[whispers] The street goes silent. [long pause] Thousands... [slowly] kneel.`

**BEAT 12** (the eyes, big twist)
`[whispering] Their eyes... open. [long pause] [slowly] Every one... looks up. At your window. [short pause] [darkly] Not the building. [long pause] [whispering] At YOU.`

**BEAT 13** (the vote)
`[calm][warm] Two ways out. [short pause] A... the roof. [short pause] B... the basement. [slowly] Only one... is quiet. [short pause] [urgent] Comment A... or B.`

**CTA**
`[softly] Follow for hour fifty-two.`

### 8. Checklist for every episode (voice)
- [ ] Every beat starts with a mood tag; no beat is untagged.
- [ ] Pauses sit right before every twist word and after every rule.
- [ ] At most one CAPITALIZED word per beat.
- [ ] The test line changes audibly at each tag.
- [ ] The transcript of each beat contains no tag words (nothing read aloud by mistake).
- [ ] Captions come from `script_clean.txt`; timing comes from the transcribed audio.
- [ ] Same voice, model, settings and seed for the whole episode (and series).
- [ ] The narrator's two "too gentle" lines (Stay with me / Choose. I'll stay with you.) are warm and soft.


---

# PART 6: EPISODE 1 v2 "THE NOTE" (FULL SCRIPT)

## HOURS AWAKE: EPISODE 1 v2, "THE NOTE"
Full outbreak flashback, faster pacing, built to the APOCALYPSE master series prompt (same voice chain, same pipeline, same QA).

**What changed from v1:** Episode 1 no longer starts at Hour 41. It opens on the doorway threat, then **rewinds to Hour 0** and shows exactly how the world fell, in fast montage cuts, then snaps back to the present for the twists and the vote. Cuts are every 0.8-1.5 s in the flashback and every 2-3 s elsewhere. The end is the same: A/B vote.

---

### 0. Episode block
```
Story:     HOURS AWAKE (zombie), Episode 1 / 7, "The Note"
Premise:   Imagine you + a world where one sound put everyone to sleep and they woke up as Sleepers + you're alive only because you couldn't sleep
Counter:   HOURS AWAKE 41:00 (rewinds to 00:00, then climbs back)
HUD:       41:00 → 00:00 → 42:00, stats: AWAKE IN CITY · NOISE dB · SLEEPERS NEARBY
Mid twist: Every Sleeper in the city is walking toward your building
Big twist: The Sleepers kneel, open their eyes for the first time, and look at YOU, not the building
Choice:    A ROOF vs B BASEMENT
Last vote: (none, series opener)
Length:    82 s, 9:16, 30 fps (2460 frames)
```
Frame = seconds x 30.

### 1. Pacing rules for this episode
- **No shot longer than 1.5 s in beats 2-6** (the flashback). Hard cuts on the narration beats.
- **No shot longer than 3 s anywhere else**, except the planned holds (beat 11 hold and the silence drops).
- A visual event (cut, camera move, HUD jump, SFX hit) at least every **0.8 s** in beats 2-6.
- The flashback is **tinted slightly desaturated with a VHS-style rewind flicker for 0.8 s** at the start, then returns to full color.

### 2. Master timeline (seconds)
| # | Time | Beat | HUD clock | AWAKE IN CITY | NOISE |
|---|---|---|---|---|---|
| 1 | 0.0-4.0 | THE DOORWAY (hook) | 41:00 | 5 | 24 dB |
| 2 | 4.0-8.0 | THE NOTE (rewind to Hour 0) | 41:00 → 00:00 | 4,127,000 | 80 dB |
| 3 | 8.0-12.0 | THE CITY SLEEPS | 01:00 | 4,127,000 → 2,000 | 40 dB |
| 4 | 12.0-17.0 | 3:07 AM, THEY STAND | 03:20 | 212 | 20 → 95 dB |
| 5 | 17.0-21.0 | THE HEADPHONES | 04:10 | 38 | 30 dB |
| 6 | 21.0-25.0 | SUNRISE, THE PLANE | 06:30 | 14 | 25 → 120 dB |
| 7 | 25.0-38.0 | THREE RULES | 14:00 / 22:00 / 30:00 | 9 / 7 / 6 | 24 dB |
| 8 | 38.0-43.0 | THE FIVE OF YOU | 36:00 | 5 (label becomes SURVIVORS) | 24 dB |
| 9 | 43.0-49.0 | HOUR 41, THE RADIO | 41:00 | 5 | 24 dB |
| 10 | 49.0-55.0 | THE MAP (mid twist, 60%) | 41:20 | 5 | 24 dB |
| , | 55.0-55.5 | silence drop | | | |
| 11 | 55.5-59.5 | THE CIRCLE | 41:40 | 5 | 0 dB |
| , | 59.5-60.0 | silence drop | | | |
| 12 | 60.0-68.0 | THE EYES (big twist, 73-83%) | 42:00 | 5 | 110 dB (red) |
| 13 | 68.0-79.0 | THE VOTE | 42:00 | 5 | |
| CTA | 79.0-82.0 | FOLLOW FOR HOUR 52 | | | |

HUD line 3 reads: `AWAKE IN CITY n · NOISE n dB · SLEEPERS NEARBY n`. SLEEPERS NEARBY is 1 until the map beat, when it rolls to 3,412. At beat 8 the first label changes to `SURVIVORS 5`.

### 3. Narration script (v4 voice, about 165 words)
Slash = caption chunk break. [Brackets] = keyword color in the caption: (L) lime, (R) red, (A) amber.

**1.** IMAGINE YOU / [CAN'T SLEEP](L). / THAT'S THE ONLY / REASON / YOU'RE [ALIVE](R).
**2.** [FORTY-ONE HOURS](L) AGO, / EVERY PHONE / IN THE CITY / BUZZED. / ONE LOW [NOTE](R).
**3.** ONE HOUR LATER / EVERYONE / WAS [ASLEEP](R). / DRIVERS. / PILOTS. / ALL OF THEM.
**4.** AT [3:07 AM](L) / THEY / ALL / STOOD UP. / EYES [CLOSED](R). / HUMMING. / HUNTING BY [SOUND](R).
**5.** YOU SURVIVED / BECAUSE OF / YOUR [HEADPHONES](L). / THE NOTE / NEVER REACHED YOU.
**6.** BY SUNRISE / THE SIRENS / [STOPPED](R). / A PLANE / FELL / FROM THE SKY.
**7a.** [RULE #1](R) / NEVER SLEEP. / ONE MICROSLEEP / AND YOU'RE / ONE OF [THEM](R).
**7b.** [RULE #2](R) / NEVER MAKE / A [SOUND](R). / IT TRAVELS / A KILOMETER / IN THREE SECONDS.
**7c.** [RULE #3](R) / IF THEY HUM… / [RUN](R).
**8.** FOUR OTHERS / SURVIVED. / A NURSE. / A SOLDIER. / A DJ. / AND YOUR BROTHER. / EIGHT YEARS OLD.
**9.** NOW / IT'S / HOUR [FORTY-ONE](L). / THE RADIO SAYS / STAY AWAKE. / [HELP](A) COMES / IN [SEVEN DAYS](A). / STAY WITH ME.
**10.** THEN / MAYA'S MAP / LIGHTS UP. / THOUSANDS / OF DOTS. / EVERY ONE / WALKING / [HERE](R).
**11.** THE STREET / GOES / [SILENT](R). / THOUSANDS / [KNEEL](R).
**12.** THEIR EYES / [OPEN](R). / EVERY ONE / LOOKS UP / AT YOUR WINDOW… / NOT THE BUILDING. / AT [YOU](L).
**13.** TWO WAYS OUT. / [A](L) / THE ROOF. / [B](R) / THE BASEMENT. / ONLY ONE / IS [QUIET](L). / COMMENT A OR B
**CTA.** FOLLOW FOR HOUR 52

Facts to verify with a web search before publishing: microsleeps last from a fraction of a second up to about 30 seconds; sound travels about 343 m/s (about 2.9 s per kilometer).

### 4. Beat-by-beat production

All camera moves are never linear (cubic ease-in-out). One light source per shot. Characters: **YOU** mustard hoodie, seen from behind or in reflection; **OLLIE** red beanie + dinosaur; **MAYA** teal scrubs + tablet; **REYES** gray beard, camo, shotgun; **DJ** purple hoodie + headphones; **SLEEPERS** pale gray `#C9CED6`, slumped, head tilted 10-15°, throats vibrating, never seen moving (they appear in new positions after cuts, drops or light-offs).

#### BEAT 1 · 0.0-4.0 · THE DOORWAY
- **0.0-1.6** Your kitchen at dawn, cold blue through the blinds. A **Sleeper stands in the doorway** 3 m away, backlit, eyes closed, swaying. Your hands on a trembling coffee mug (the surface ripples with your heartbeat). Push-in x1.15. *HUD already on screen at frame 0.*
- **1.6-2.8** Hard cut: wide through the window, the **dead city at sunrise**: columns of smoke, abandoned cars in a jammed street, silent skyline. Slow tilt-down from sky to street.
- **2.8-4.0** Close on your bloodshot eyes, one blink too long, snap open. Handheld sway.
- **SFX:** hum starts at 0.0 (one Sleeper); mug rattle; whoosh on the cut at 1.6; narrator inhale 0.15 s before the line.

#### BEAT 2 · 4.0-8.0 · THE NOTE (rewind to Hour 0)
- **4.0-4.8** **Rewind effect:** the HUD clock spins backward 41:00 → 00:00 in 0.8 s; the image flickers with a tape-rewind distortion; stamp `HOUR 0` slams in (red pill).
- **4.8-5.6** Night skyline, every window lit. In-world text: a bedside clock, `11:47 PM`.
- **5.6-6.4** Phone screens in the windows **glow blue one after another in a ripple** across the whole city (fast pan along the skyline).
- **6.4-7.2** Extreme close on a phone lock screen: a gray sound-wave icon and `1 NEW SOUND`. The phone shakes.
- **7.2-8.0** Your hands pressing noise-canceling headphones over your ears.
- **SFX:** rewind whoosh; one deep low note (D2) begins at 5.6; a chorus of phone buzzes; heartbeat is NOT yet on.

#### BEAT 3 · 8.0-12.0 · THE CITY SLEEPS (cuts every 0.8 s)
- **8.0-8.8** A bus driver's head drops. Cut.
- **8.8-9.6** The bus drifts silently into a lamppost, slow.
- **9.6-10.4** A stadium crowd slumps in a wave, row by row.
- **10.4-11.2** A cockpit window: a pilot's head drops. Cut.
- **11.2-12.0** Wide: the city's lights go off district by district until the screen is nearly black.
- **HUD:** `AWAKE IN CITY` rolls 4,127,000 → 2,000 in red, with tick SFX.
- **SFX:** layered yawns and thuds; the hum thickens (3 voices).

#### BEAT 4 · 12.0-17.0 · 3:07 AM, THEY STAND
- **11.6-12.0 silence drop** (0.4 s, everything cut, static black).
- **12.0-12.8** In-world: a phone clock `3:07 AM`. 1-2 frame red flash.
- **12.8-13.6** A woman in pajamas on a sidewalk **stands up**, eyes closed, head tilted. Low angle.
- **13.6-14.6** Wide street: silhouettes rise like dominoes, one every 4 frames, in a wave down the block.
- **14.6-15.6** A car alarm chirps somewhere. **Every head snaps toward it at once.**
- **15.6-17.0** The alarm cuts out. The screen drops to black (implied, no gore). The hum is now 12 layered voices.
- **HUD:** clock `03:20`, `AWAKE IN CITY` 212, `NOISE` spikes 20 → 95 dB (flashing red).
- **SFX:** silence drop, then the standing thud, the alarm, a huge hum swell.

#### BEAT 5 · 17.0-21.0 · THE HEADPHONES
- **17.0-18.2** You in bed in the dark, phone-glow on your face, a rain-sound app running. Eyes wide.
- **18.2-19.4** You lift one earcup. The **hum floods in** (distorted, shaking the frame, red flash). You slam it back.
- **19.4-19.9** Insert: DJ's headphones. **19.9-20.4** Insert: Maya's earbuds. **20.4-21.0** Insert: Reyes's earplugs.
- **HUD:** `04:10`, `AWAKE IN CITY` 38.
- **SFX:** rain loop, then the hum with a sharp filter sweep, then a muffled return to rain.

#### BEAT 6 · 21.0-25.0 · SUNRISE, THE PLANE
- **21.0-22.2** You at the window at dawn, smoke columns beyond the skyline, every screen dark.
- **22.2-23.2** Streets: gridlocked cars with sleeping drivers, motionless.
- **23.2-24.0 silence drop** on a static wide of the skyline.
- **24.0-24.6** A passenger plane descends **silently** behind the buildings. White flash, shockwave ripple across your window.
- **24.6-25.0** Smoke blooms over the skyline.
- **HUD:** `06:30`, `AWAKE IN CITY` 14, `NOISE` 25 → 120 dB on the flash (red).
- **SFX:** the boom hits right after the flash, then a long ringing tone.

#### BEAT 7 · 25.0-38.0 · THREE RULES (each rule is about 4.3 s; red pill above each)
- **7a RULE #1, NEVER SLEEP (25.0-29.3):** a neighbor in a corridor nods off mid-sentence; his eyelids flutter; text `MICROSLEEP: UP TO 30 SECONDS`; he slides down the wall; his throat begins to hum. Hard cut away. HUD `14:00` (+14 HRS tag), `AWAKE IN CITY` 9.
- **7b RULE #2, NEVER MAKE A SOUND (29.3-33.6):** slow-motion: a cup slips from a hand, hangs in the air; in the dark behind it, a Sleeper's head turns. **Cut before the cup hits the floor.** A sound-wave icon, with the number `3 SECONDS` rolling in. HUD `22:00`, `AWAKE IN CITY` 7, `NOISE` flashes red.
- **7c RULE #3, IF THEY HUM… RUN (33.6-38.0):** extreme close on a throat starting to vibrate; the hum begins; you sprint down a hallway (handheld), a door slams, the two-tone alert (853 + 960 Hz). HUD `30:00`, `AWAKE IN CITY` 6.
- **SFX:** pill thuds at 25.2, 29.5, 33.8; shake on the door slam.

#### BEAT 8 · 38.0-43.0 · THE FIVE OF YOU
- Cutaway "dollhouse" of the five-floor building, **crane up** from the basement to the roof, warm amber windows against the blue night.
- Floor by floor, Caveat name stamps pop in: `DJ` (floor 2, headphones on at a radio), `REYES` (floor 3, shotgun at the window), `MAYA` (floor 4, tablet), and on floor 5 `OLLIE` hugging his dinosaur beside you.
- **HUD:** `36:00`; the first label changes to `SURVIVORS 5` with a lime "+" tick.
- **SFX:** warm low pad under the amber light; footsteps; the hum is far away.

#### BEAT 9 · 43.0-49.0 · HOUR 41, THE RADIO
- **43.0-43.8** HUD clock jumps `36:00` → `41:00` with a `+5 HRS` tag; the image returns to full color after the flashback tint.
- **43.8-45.6** Close on DJ's radio dial and his tired face, green waveform. Push-in.
- **45.6-47.4** Amber text `RESCUE IN 7 DAYS` appears as HUD line 4. A static cut.
- **47.4-49.0** Ollie on the couch **nods off**, his head drooping; your hand touches his shoulder; he gasps awake (plant).
- **SFX:** radio static with a soft **exhale** at 44.4 and 46.2 (the same sample as the narrator's inhale); the narrator inhale before "Stay with me."

#### BEAT 10 · 49.0-55.0 · THE MAP (MID TWIST at about 60%)
- **49.0-50.2** Maya's tablet: a map of the city with thousands of tiny white dots.
- **50.2-52.2** The dots **begin to slide** in unison. Thin arrows appear showing every dot's direction.
- **52.2-54.0** They all converge on one glowing icon: **your building**. `SLEEPERS NEARBY` rolls 1 → 3,412.
- **54.0-55.0** Maya's face lit by the screen; Reyes steps into frame behind her. Slow push-in.
- **55.0-55.5 silence drop,** then the lamp clicks off.
- **SFX:** tablet pings; a heartbeat starts at 49.0 at 60 bpm; a low synth swell at 52.2.

#### BEAT 11 · 55.5-59.5 · THE CIRCLE (planned HOLD)
- Wide shot from the dark window: the street fills; thousands of Sleepers arrive and stand in a **perfect circle** around the building. All motion stops at 57.0.
- **1.5 s of true silence** (57.0-58.5). At 58.5 they **kneel in unison**, slowly.
- Locked wide frame with a very slow push (100% → 108%). This is the only still shot.
- **HUD:** `41:40`, `NOISE` drops to 0 dB.
- **SFX:** layered knee creaks and one huge soft thud at 59.4.
- **59.5-60.0 silence drop** on the static frame.

#### BEAT 12 · 60.0-68.0 · THE EYES (BIG TWIST at 73-83%)
- **60.0-62.0** Close on the front-line Sleeper kneeling, eyes closed. One pure hum note returns. Push-in x1.5.
- **62.0-62.4** Its eyes **OPEN**: glowing cold white `#E6F7FF`. Boom; 2-frame white flash; shake.
- **62.4-64.0** Wide: **a wave of eyes opening** spreads outward through the whole crowd.
- **64.0-65.2** Every head tilts up toward your window.
- **65.2-67.0** Your reflection in the glass; for 8 frames a **faint green barcode mark glows behind your ear** (plant).
- **67.0-68.0** Smash cut to black with a sub-bass boom.
- **HUD:** `42:00`, `NOISE` 110 dB flashing red.
- **SFX:** heartbeat peaks at 120 bpm; the boom at 62.0; a rising whoosh across the wave.

#### BEAT 13 · 68.0-79.0 · THE VOTE
- **68.0-69.0** Black and silence.
- **69.0-70.0** Title types on: `WHAT DO YOU DO?` (white, Bebas Neue).
- **70.0-71.0** Card **A: ROOF** slides in from x+40 px (lime pill, amber roof-ladder icon). **70.5-71.5** card **B: BASEMENT** (red pill, blue stairs icon). Icons fade in last.
- **71.5-79.0** Hold. Cards pulse gently (scale 1.0 → 1.03). `COMMENT A OR B · THE MOST VOTED CHOICE DECIDES` in small white text. Dark `#0A0D16` background with a radial vignette, no characters.
- **SFX:** two soft whooshes; the hum dies to nothing by 79.0.

#### CTA · 79.0-82.0
- Hard cut to black; `FOLLOW FOR HOUR 52` fades up over 8 frames and holds. Optional loop: the final black frame cuts back to the doorway Sleeper from beat 1 in the first frame of the next play.

### 5. Sound map (for the mixer)
- **Voice -13 LUFS per line, SFX about half, drone about a quarter. Final -14 LUFS.**
- **The hum (D2):** 1 voice (beat 1) → 3 (beat 3) → 12 (beat 4) → far-off (beats 5-9) → hundreds (beat 10) → thousands, cut to silence (beat 11) → a single pure note (beat 12).
- **Silence drops (5):** 11.6-12.0, 23.2-24.0 (before the plane), 55.0-55.5, 57.0-58.5 (the long hold), 59.5-60.0, plus the black at 67.0-69.0.
- **Heartbeat:** starts at 49.0, 60 bpm → 120 bpm by 62.0.
- **Breath sample:** the same soft inhale before every narrator line, and in the radio static at 44.4 and 46.2. Never vary it.
- **Hits:** whoosh on push-ins and cuts; a pop on every caption chunk (about -24 dB); a click on every pill; rolling ticks on number counters.
- Do not let the sub-bass sit constant for more than 10 s.

### 6. Plants (never explained on screen)
- The narrator's inhale is the same sample as the radio's exhale.
- "Stay with me" (narrator, beat 9).
- Ollie nodding off (beat 9).
- The barcode mark behind your ear (beat 12).
- The headphones: all five survivors had something in their ears (beat 5 inserts).

### 7. Episode-specific QA (on top of the master checklist)
- [ ] The Sleeper in the doorway is on screen at frame 0.
- [ ] The rewind (beat 2) is clear and fast; nobody is confused about "Hour 0."
- [ ] The flashback has no shot longer than 1.5 s.
- [ ] The plane (beat 6) is silent until the white flash.
- [ ] The eyes-opening (beat 12) is the brightest, cleanest image of the episode.
- [ ] The HUD's `AWAKE IN CITY` counter visibly collapses in beats 3-7.
- [ ] No red wash over a whole shot except the 1-2 frame flashes.
- [ ] No gore: violence is implied by cuts to black.
- [ ] The vote card sits on a clean dark background and is readable on a phone.
- [ ] Total length is 82 s (2460 frames), 1080x1920, 30 fps.

---

# PART 7: TOOLING AND SETUP

## 7.1 MCP servers for Claude Code
Keep the list short: every connected server adds tool descriptions that use tokens.
- **Playwright MCP:** lets Claude preview and screenshot the render and check its own output. `claude mcp add --transport stdio playwright -- npx @playwright/mcp@latest` (needs Node.js).
- **Context7 MCP:** fetches current library docs (Remotion, Three.js, etc.) so Claude doesn't guess APIs. `claude mcp add --transport stdio context7 -- npx -y @upstash/context7-mcp`
- **ElevenLabs MCP (optional, for the emotional voice):** needs an API key and `uv`. `claude mcp add --transport stdio --env ELEVENLABS_API_KEY=your_key elevenlabs -- uvx elevenlabs-mcp` (package names for Context7 and ElevenLabs come from memory; if a command fails, check that server's README).
- Add `--scope user` right after `add` to make a server available in every project (`--scope project` shares through a `.mcp.json` file).
- Check with `claude mcp list` in the terminal, or `/mcp` inside Claude Code. Remove with `claude mcp remove <name>`.
- The owner's current list showed these as connected: Playwright, Context7, claude.ai Claude Docs, claude.ai Three.js 3D Viewer. Needing authentication (not needed for this project): Semrush, Lovable, Firecrawl, Motion Creative Analytics. **Disable the ones not needed** (via `/mcp`) to save tokens.

## 7.2 Skills
- A skill is a folder with a `SKILL.md`. To install the owner's **cartoon-audio-short** skill: create `~/.claude/skills/cartoon-audio-short/` (on Windows `C:\Users\<name>\.claude\skills\cartoon-audio-short\`), put the file inside named exactly `SKILL.md` (case-sensitive), restart Claude Code, then use `/cartoon-audio-short` or ask Claude to use it. If it doesn't appear in autocomplete, run `/doctor` or just ask Claude to follow the skill; a known bug can hide installed skills from autocomplete.
- `/skill-creator` is only for *building* skills (a plugin from the official marketplace; the install command reported by one guide is `/plugin install skill-creator@claude-plugins-official`, verify in Claude Code docs).
- That skill probably expects audio tools (text-to-speech, ffmpeg, API keys). **Read its requirements before running it.**

## 7.3 Token and time savers
- Put this brief (or the master prompt part) in `CLAUDE.md` so you never re-explain.
- Use **plan mode** before building.
- Keep all timing in one data file; edit data, not components.
- Use `/clear` between episodes and `/compact` mid-session.
- Render only the changed range for small fixes; do contact-sheet checks instead of full renders.
- Use instanced meshes for crowds; reduce crowd size first if rendering is slow.

## 7.4 Optional: true 3D build (Remotion + @remotion/three)
Only if the owner asks for real 3D instead of the 2.5D default.
- Remotion with `@remotion/three` (react-three-fiber, `@react-three/drei`). 1080x1920, 30 fps. Characters and buildings from `RoundedBox` (radius ≈ 0.08), simple rigs (torso, head, arms, legs), idle breathing, squash on landings, blinking square eyes.
- Soft shadows, light blue scene fog, floating dust in lit areas, film grain (~0.06 opacity), mild vignette. Camera rig component for push-ins, orbits, handheld sway; `spring()` and `interpolate()` only (never linear).
- Crowds (Sleepers) as **instanced meshes** (hundreds of boxes). Keep colors per PART 4, section 5.
- All frame data in `src/timeline.ts`. One component per shot. Check with Playwright screenshots at planned frames before rendering with ffmpeg audio mux.

## 7.5 Output convention
- Scripts: `epN_script.md` (+ `epN_timeline.json`). Voice: `/audio/epN/beat_XX.mp3` + `script_tagged.txt` + `script_clean.txt`. Render: `/out/hours_awake_epN.mp4`.

---

# PART 8: REFERENCE ANALYSIS, LESSONS LEARNED, RETENTION, MONETIZATION

## 8.1 Reference videos the owner shared (viral, 1M+ views; use structure only)
The owner supplied a profile screenshot and three videos. Findings from sampled frames (audio not judged):
- **stick.dimension, "Last One Left" (stickman survival).** The profile showed two posts at about 893K and 1.6M views and 10K followers; the bio is a three-line hook ("Everyone vanished at 3:12 AM. Except you. A stickman survival story · Start at Part 1"). The sampled video was Part 2 (about 57 s). Structure: **"Imagine you're the last person on Earth…" hook, big word-by-word captions in white with lime keywords, a HUD (DAY, time, BATTERY, POPULATION), phone text thread ("Turn off your light. Now. They can see you."), "RULE #2" tags, footsteps/floor counter, then an A/B vote ("Open the door" / "Trust the phone") and "Follow for Part 3".**
- **Gas-station night-shift story ("Night 1/7", @dontopenit.stories).** About 84 s, flat cartoon with a HUD (NIGHT 1/7, 2:47 AM, HELP IN 7 DAYS), an **emergency-alert phone screen** ("STAY INDOORS. KILL ALL LIGHTS. DO NOT OPEN FOR ANYONE. HELP ARRIVES IN 7 DAYS."), rule stamps (RULE #1-3), a "Good news / Bad news" beat (water bottles / all glass), an uncanny **smiling sheriff at the night window**, a note ("Don't let him in. He already came for me."), a radio ("Units confirmed… officers left"), the twist "You behind the…", a binary choice (OPEN / LOCK) and "Follow for Night 2".
- **Roblox-style storytelling video.** About 140 s, 3D blocky, narrator voiceover with **word-by-word captions**, constantly changing camera angles (about 80 cuts, roughly one every 1.7 s), a sign ("NEVER ENTER THE OLD PATH"), a crossroads, and a hospital beep ending.
**Shared patterns:** second-person hook in the first second; a persistent **HUD** (clock, day/night counter, battery or population); **rules** with numbered tags; a **ticking clock/countdown**; **in-world text** (texts, alerts, notes, radio); a **twist** near the end; a **binary vote**; a "Follow for next part" line; fast cuts; big karaoke captions.

## 8.2 Lessons from the render critiques (what not to repeat)
Two earlier renders (from drafts that were then discarded) were critiqued as a viewer with a short attention span (about 4/10: "would swipe at ~3-8 seconds"). Reasons:
1. **Dead hook:** black screen or tiny text, no threat or character in the first seconds, hook line with no stakes.
2. **No geography:** nearly all shots were giant face close-ups; no wide shot of the place, so the viewer didn't know where they were or who anyone was.
3. **All red:** red light flooded the first seconds and blew faces out to orange; no contrast between safe and dangerous scenes.
4. **Not immersive:** third person ("Mira"), nothing putting the viewer's hands or phone in frame.
5. **Invisible backstory:** a key twist depended on a line of dialogue about something never shown.
6. **Blank faces:** the same expression repeated; no emotional beat for the big moment.
7. **Murky ending:** dark, from behind, unreadable on a phone; the cliffhanger didn't register; tiny survivor counter change.
8. **Too much text carrying the story;** captions low where Instagram's UI can cover them; a clutter-heavy end card with buttons over characters; possible cut-off caption.
**Fixes now baked into the standing rules:** threat at frame 0, second person, wide shots first, two-color lighting logic, show backstory instead of telling it, readable bright last frame, clean dark vote card, captions kept in the safe zone.

## 8.3 Retention checklist (apply to every episode)
1. Hook in the first second (danger, countdown or a "Don't…" line).
2. Second person ("you").
3. A rule within the first 5-10 s (rules let viewers predict; they stay to see them broken).
4. A new beat every 1.5-3 s; nothing static.
5. A readable ticking clock/HUD on screen.
6. A mid twist (60-65%) and a bigger end twist (70-85%).
7. Plant a clue early that pays off later (rewatches help the algorithm).
8. Big, short, word-by-word captions (many watch on mute).
9. A vote that feels urgent; show it on a clean dark card with big A/B buttons.
10. Reply to and pin comments with the results; open the next episode with "You chose X" so people feel their vote mattered.
11. A bright, readable ending frame.
12. Consistent posting schedule and a profile bio that works as a hook.

## 8.4 Monetization snapshot (from a web search; ranges vary a lot, verify before relying)
- **YouTube Shorts:** roughly $0.03-0.10 per 1,000 views (so ~$30-100 per million).
- **YouTube long-form:** roughly $1-10 per 1,000 views.
- **Instagram:** no standard per-view rate; bonus programs are invite-only and inconsistent. Claims of $10-50 per 1,000 views conflict with other sources; don't plan around them.
- **TikTok Creator Rewards:** roughly $0.40-1.00 per qualified 1,000 views, needs videos over one minute.
- Most real income for pages like this comes from **brand deals, affiliate links, products, or selling the video-making service**, not platform payouts.

## 8.5 Known unknowns (say so instead of guessing)
- Whether the concept or story is unique on Instagram (no access to analytics or trend data).
- How the audio sounds in renders (only frames and loudness were inspected).
- The contents of the cartoon-audio-short skill.
- The Episode 1 vote result and the performance of any posted episode.
- Exact view counts of the reference videos beyond the profile screenshot.
