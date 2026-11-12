# VOICE DIRECTION: emotional narration with audio tags
Add this file to every episode's instructions for Claude Code. It tells Claude how to write, generate and mix a narrator that **acts** instead of reading.

The reference you shared (ElevenLabs Text to Speech, voice "Brian: Deep, Resonant and Comforting") shows the method: **plain script text with inline [audio tags] before the words they affect.** Tags are never spoken. They direct the delivery.

---

## 1. Engine and settings
- **Engine B: ElevenLabs Text to Speech** (Eleven v3 or newer, the model your screen shows). Engine A (the local Orpheus voice in the master prompt, section 3) stays available as the free fallback, but it cannot act: it has no tag vocabulary like this.
- **Voice:** a deep, calm, close-mic male narrator. Start with "Brian: Deep, Resonant and Comforting" as in your video. Use the **same voice for the whole series.** Never switch voices between episodes.
- **Stability: Creative or Natural.** Robust stability makes the voice ignore tags. Do not use Robust.
- **No SSML.** `<break time="1s"/>` does not work with these models. Use `[short pause]`, `[long pause]`, commas, and ellipses instead. If an exact pause length is needed, add silence in the audio editor/ffmpeg after export.
- Output: MP3 or WAV at 44.1 kHz or higher, resampled to 48 kHz at the final mux (same as the master prompt).

## 2. Tag vocabulary (use only these unless a test proves another works)
| Group | Tags | Use for |
|---|---|---|
| Volume / intimacy | `[whispers]` `[whispering]` `[quietly]` `[softly]` `[very softly]` | Dread, secrets, the plants |
| Mood | `[calm]` `[serious]` `[darkly]` `[ominous]` `[tense]` `[gently]` `[warm]` `[numb]` `[urgent]` | Setting the emotional color of a beat |
| Pace | `[slowly]` `[rushed]` `[drawn out]` `[short breaths]` | Slow for weight, rushed for danger |
| Pauses | `[short pause]` `[long pause]` | Before reveals, after rules |
| Reactions | `[sighs]` `[exhales]` `[gasps]` `[exhales sharply]` | Rare. One or two per episode, at most |
| Intensity | CAPITALS on one word, `...` ellipses | Emphasis and weight |

Tags can be combined: `[whispering][darkly]`, `[low, restrained voice]`.

## 3. Writing rules for tagged scripts
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

## 4. Emotional arc for every episode
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

## 5. How Claude Code should generate the voice
1. **Write two versions of the script:**
   - `script_tagged.txt` (with tags, sent to the voice engine).
   - `script_clean.txt` (tags stripped with the regex `\[[^\]]*\]`, used for captions and the on-screen text).
2. **Generate one audio file per beat** (not the whole script at once). This keeps each call small, makes retries cheap, and lets the timeline place each beat exactly. Use the same voice ID, the same model, and the same settings for every call. Use a fixed `seed` if the API offers it, for consistency.
3. **Do not assume the timing from the script.** Tags and pauses change durations. After generating each beat, **transcribe the audio (faster-whisper with word timestamps)** to get the real start and end of every word, and build the caption and cue timeline from that.
4. **Check every beat.** Re-generate (up to 3 tries) if the beat is silent, if it reads a tag aloud (the transcript contains words like "whispers" or "short pause" that are not in the clean script), or if its length is outside the expected range (words ÷ 2.0-3.2 per second).
5. **Mix:** trim leading/trailing silence, then normalize each beat to about -16 LUFS and apply the master prompt's final loudness target (-14 LUFS for the full mix). Keep the voice the loudest element, and duck the drone 6 dB under each word.
6. **Place silences on purpose.** Add the planned silence drops from the shot script (0.3-0.7 s of total silence before reveals) in the mix, not in the voice engine.
7. **If ElevenLabs is not connected,** use Engine A (Orpheus) with the clean script and say clearly in the report that the emotion tags were not used.

## 6. Test line (run before every episode to verify the voice reacts to tags)
```
[calm] The sirens stopped on the third day. [short pause] Nobody noticed at first... because the silence was louder. [whispers] They told us it was a storm. [short pause] That the sky would clear. [slowly] But the sky never cleared. [serious] Maya walked the empty highway, counting the cars. Every door open. [short pause] Every engine cold. [softly] And every seat... still warm. [long pause] She thought she was the last one left.
```
The audio must clearly change in volume, pace and mood at each tag. If it does not, lower the stability setting or switch the voice before generating the episode.

---

## 7. EPISODE 1 v2 "THE NOTE": tagged narration (use with `hours_awake_ep1_v2.md`)
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

## 8. Checklist for every episode (voice)
- [ ] Every beat starts with a mood tag; no beat is untagged.
- [ ] Pauses sit right before every twist word and after every rule.
- [ ] At most one CAPITALIZED word per beat.
- [ ] The test line changes audibly at each tag.
- [ ] The transcript of each beat contains no tag words (nothing read aloud by mistake).
- [ ] Captions come from `script_clean.txt`; timing comes from the transcribed audio.
- [ ] Same voice, model, settings and seed for the whole episode (and series).
- [ ] The narrator's two "too gentle" lines (Stay with me / Choose. I'll stay with you.) are warm and soft.
