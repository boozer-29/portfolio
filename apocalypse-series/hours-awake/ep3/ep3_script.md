# HOURS AWAKE: Episode 3 / 7, "Backwards" v2 (Branch A: you crossed the plank)
Follows the posted Episode 2 "Thirty Seconds" (ended: the roof door breaking, Reyes holding the plank across the gap, Ollie's red beanie on the fire-escape ladder; vote A SAVE YOURSELF / B SAVE OLLIE; **A won**).

v2 changes from the first "Backwards" draft: fixed the timing hole (Reyes wrote the note hours before, so your 30-second microsleep was enough), gave vote A a real reason (the walkie's crackle is pulling the horde to your new roof, so turning it off saves four lives), and added warmth to Ollie (he laughs without a sound).

## 0. Episode block
```
Story:     HOURS AWAKE (zombie), Episode 3 / 7, "Backwards"
Premise:   Imagine you + you left your brother to save yourself + you learn he never chose to go
Counter:   HOURS AWAKE 52:05 → 53:10
HUD:       EP 3 / 7 · SURVIVORS 4 · NOISE dB · SLEEPERS NEARBY 3,412 → 0 → 40 → 600 ; line 4 red: OLLIE: ALONE
Hook text: MOST OF YOU CHOSE A. / YOU LEFT HIM.   (overlay 0-3 s)
Mid twist: The goodbye note is forged: the R in "BRAVE" faces the right way; Ollie always wrote it backwards.
           Reyes's fingers are red with crayon. He planned it for hours; your microsleep was his window (~58-66%)
Big twist: Three taps on the walkie. Ollie was never asleep. He's awake, alone, waiting for you (~72-76%)
Choice:    A HAND IT OVER: silence your brother's walkie, keep the group alive
           B TAP BACK: tell him you're coming, and climb down alone into thousands of them
Last vote: A, SAVE YOURSELF  ("YOU CHOSE: A · SAVE YOURSELF", 0-3 s)
Length:    85 s, 9:16, 30 fps (2550 frames). Narration 189 words.
```

## 1. Pre-writing checklist (STORY_CRAFT.md)
- **Relationship ritual:** Ollie can't speak (one sound and they come), so he talks in crayon. Three taps on your hand = "I'm still awake." Set up warm in flashback; returns over the walkie at the worst moment.
- **Who Ollie is, in 11 seconds:** writes his R backwards ("BЯAVE", his dinosaur's name); laughs with both hands over his mouth so no sound gets out; gives you the bigger half of the last granola bar; clips a toy walkie to your hoodie ("IF WE GET LOST I'LL TAP"); draws you with a cape: "MY BROTHER NEVER LEAVES".
- **Split-second moment:** Reyes kicking the plank a split second after your foot leaves it. Seen at real speed (10 frames), then replayed in slow motion once you know he planned everything.
- **Guilty vote:** the audience left him last episode. This episode first comforts them ("He chose this. It's not your fault.") and then rips that away: he didn't choose, he was sent, and he's still waiting. Vote A asks them to leave him a second time, knowingly, by switching off his voice. Vote B asks them to throw away the life they chose to save.
- **Twist through a person, not a screen:** a child's handwriting, a man's stained fingers, three taps.
- **Quiet last image:** your palm, the walkie's red light blinking, the cape drawing on the gravel; Reyes's open hand waiting at the edge of frame.
- **2 AM line:** "He thinks you're coming."
- **Unanswered on purpose:** did Maya and DJ know? (They look away.) And in Ep 2 the narrator told you Ollie was asleep. He wasn't. Why did the narrator lie?

## 2. Chain of cause and effect
1. Ep 2 vote A → you're crawling the plank, five floors up, as the roof door behind you breaks.
2. The plank creaks (rule 2) → the Sleepers burst through behind you (rule 3) → you can't run on a plank → Reyes grabs your hood and drags you over.
3. Reyes kicks the plank into the gap (no way back, nobody can follow).
4. The Sleepers line the old parapet facing you → then turn away, back down, toward Ollie (they follow him; established in Ep 2).
5. Safe, exhausted (rule 1) → you squeeze Ollie's dinosaur to stay awake → it takes you back: who Ollie is (flashback).
6. Cold hands → hoodie pocket → a crayon note signed Ollie: he chose to lead them away → relief; the narrator soothes you.
7. You re-read it → "BRAVE" is spelled correctly → in the flashback Ollie wrote it "BЯAVE" → he didn't write this.
8. You look up → Reyes's fingertips are red with crayon wax, a broken red crayon in his pocket → he wrote it during the ten quiet hours; when you microslept, he only had to lift Ollie onto the ladder and slip the note into your pocket. He holds up his own note: "IT WAS HIM OR ALL OF US." Maya and DJ look away.
9. The toy walkie Ollie clipped to you (flashback) crackles → three taps → "I'm still awake." He walked through them awake with his eyes shut, because someone told him to.
10. The crackle is noise (rule 2) → Sleepers in the street below stop and tilt their heads up at your new roof, more with every tap → Reyes holds out his hand for the walkie.
11. Choice: give it up (silence Ollie, save four lives) or tap back and climb down alone.

## 3. Tagged narration (ElevenLabs, one paragraph = one generation)
Full text in `script_tagged.txt`; captions from `script_clean.txt`. Times are targets; re-time from the transcribed audio. If the voice runs long, the first cut is "Keep them alive." in the vote (the picture already shows it).

| # | Time | Beat | Tagged line |
|---|---|---|---|
| 1 | 0.0-5.5 | HOOK | `[quietly][tense] Imagine crawling across a plank... five floors up. [short pause] Most of you chose A. [slowly] You left him.` |
| 2 | 5.5-13.5 | THE CROSSING | `[tense] Rule two: never make a sound. [short pause] The plank... creaks. [urgent] Rule three: if they hum, run. [short pause] [darkly] You can't run on a plank.` |
| 3 | 13.5-21.0 | THE KICK | `[urgent] Reyes drags you across... and kicks the plank into the dark. [long pause] [whispers] They don't come for you. [short pause] [darkly] They turn back. To him.` |
| — | 21.0-23.0 | RULE 1 (visual only) | Red pill `RULE #1 NEVER SLEEP`; you squeeze the dinosaur. No narration. |
| 4 | 23.0-34.0 | WHO OLLIE IS | `[warm][gently] Ollie never made a sound. [short pause] He talked in crayon. [softly] He laughed without noise. [short pause] And three taps on your hand meant... I'm still awake.` |
| 5 | 34.0-43.0 | THE NOTE | `[tense] In your pocket... his crayon. [softly] "I'll lead them away. Come get me after." [long pause] [warm] He chose this. [very softly] It's not your fault.` |
| — | 43.0-43.5 | silence drop | |
| 6 | 43.5-49.5 | MID TWIST 1 | `[whispering] Then you see it. "Brave." [short pause] Ollie always wrote the R backwards. [long pause] [darkly] He didn't write this.` |
| 7 | 49.5-57.0 | MID TWIST 2 | `[whispering] Reyes's fingers... are red with crayon. [long pause] [darkly] He wrote it hours ago. [short pause] Your thirty seconds... were all he needed.` |
| — | 57.0-57.5 | silence drop | |
| 8 | 57.5-64.5 | BIG TWIST | `[quietly] The walkie on your hoodie crackles. [long pause] Tap. Tap. Tap. [long pause] [very softly] He's awake. He thinks you're coming.` |
| 9 | 64.5-68.0 | THE PRICE | `[urgent] Every crackle... the street below fills. [short pause] Reyes holds out his hand.` |
| 10 | 68.0-81.0 | THE VOTE | `[calm][serious] A... hand it over. Silence him. Keep them alive. [short pause] B... tap back. And go down. Alone. [long pause] [very softly][warm] Choose. I'll stay with you. [short pause] [urgent] Comment A... or B.` |
| CTA | 81.0-85.0 | FOLLOW | `[softly] Follow for hour fifty-four.` |

**Voice notes:**
- Beat 5's "He chose this. It's not your fault." is the warmest, most comforting read of the series (the narrator-virus soothing you). It should feel like a hug, so beat 6 hurts. Regenerate until it does.
- "Tap. Tap. Tap." is said very softly; the real tap SFX land right after each word.
- If "A" is read as "uh", type `Ay...` in that one generation.

Caption colors: lime = A, AWAKE, OLLIE, BRAVE, TAP; red = YOU LEFT HIM, SOUND, RUN, HIM, BACKWARDS, RED, SILENCE, B; amber = CRAYON, WALKIE.

## 4. Shot-by-shot direction
Style, palette, HUD and captions: CLAUDE.md PART 4. Sleepers are never seen moving. **The flashback is the only warm amber scene in the episode** (soft grain, slight vignette, 1-2 frame film-burn in and out). Present day is cold blue. Only the narrator is voiced; Ollie speaks through crayon (Caveat font, child's capitals), Reyes through blocky marker.

### SCENE 1. THE GAP, NIGHT (0.0-21.0)
**0.0-1.6** POV straight down between your own hands gripping a narrow plank: five floors of black air, the street far below. HUD at frame 0: `EP 3 / 7 · 52:05`, lime tag `YOU CHOSE: A · SAVE YOURSELF`. Hook text at 32% height: white `MOST OF YOU CHOSE A.`, then at 1.3 s red `YOU LEFT HIM.`
**1.6-3.2** Side wide (geography): you halfway across on hands and knees; Reyes kneeling at the far end holding the plank; Maya and DJ behind him. Behind you, your old roof and its splintering door.
**3.2-5.5** Over your shoulder: the fire-escape rails, the red beanie on the top rung, swaying. You look a beat too long.
**5.5-7.5** Red pill `RULE #2 NEVER MAKE A SOUND`. Extreme close: the plank bowing under your knee, a crack line through the grain. CREAK.
**7.5-9.0** The roof door behind you explodes outward (gray shapes in the dark doorway, no full bodies). NOISE 30 → 105 dB, red. Shake.
**9.0-11.0** Red pill `RULE #3 IF THEY HUM, RUN`. The hum swells behind you; the plank shivers with it.
**11.0-13.5** POV: you lunge forward; Reyes's fist closes on your hood and hauls you onto gravel.
**13.5-14.0** **THE SPLIT SECOND (real speed, 10 frames):** Reyes, already standing, kicks the plank. It drops into the gap. Long whoosh, no landing sound.
**14.0-16.5** You on your back, looking across: the old parapet is lined with Sleepers, eyes glowing, all facing YOU. (New positions after the cut.)
**16.5-17.0** Silence drop.
**17.0-19.0** Same parapet: every Sleeper now turned away, facing the stairwell door.
**19.0-21.0** The old roof, empty. Only the beanie on the ladder. HUD `SLEEPERS NEARBY` rolls 3,412 → 0 (red −3,412). Line 4 appears in red: `OLLIE: ALONE`.

### SCENE 2. THE NEW ROOF (21.0-23.0)
**21.0-22.0** Wide: four of you on a bare roof, a water tank, the empty gap. Breathing hard.
**22.0-23.0** Red pill `RULE #1 NEVER SLEEP` over your own eyelids drooping. Close: your hands squeeze Ollie's dinosaur until the plastic creaks. Push-in on the toy. Film-burn.

### SCENE 3. WHO OLLIE IS (FLASHBACK, WARM AMBER, 23.0-34.0)
Each shot about 2.2 s, gentle push-in, candle/lamp light, no Sleepers in frame.
**23.0-25.2** Hour 6, your apartment floor by candlelight: Ollie (red beanie too big for him) slides a crayon note across the floorboards: `ARE YOU STILL AWAKE?` Your hand taps his three times. He grins (missing front tooth).
**25.2-27.4** Hour 19: he holds up his dinosaur and a note, `HIS NAME IS BЯAVE`. The backwards R is drawn big; hold on it so it registers.
**27.4-29.6** Hour 22: you pull a face to cheer him up. He doubles over laughing with **both hands clamped over his mouth**, shoulders shaking, tears in his eyes, not one sound escaping.
**29.6-31.8** Hour 33: he clips a small yellow toy walkie to your hoodie and taps it. Note: `IF WE GET LOST I'LL TAP`. He keeps the matching one.
**31.8-34.0** Hour 39: one granola bar left. He snaps it, looks at both halves, gives you the bigger one. Beside him a drawing: you in your mustard hoodie with a red cape, holding his hand, `MY BROTHER NEVER LEAVES`. Three taps on your hand. Film-burn out.
**SFX:** wind and drone drop away; a soft warm pad, crayon scratches, a music-box version of the hum's note (same pitch, made gentle). Breath sample before the narrator line.

### SCENE 4. THE NOTE (34.0-43.0)
**34.0-35.5** Back to cold blue, harshly. Your hand goes into your hoodie pocket for warmth and finds folded paper.
**35.5-39.0** Insert: you unfold it. Crayon, a child's capitals: `I'LL LEAD THEM AWAY. COME GET ME AFTER. BE BRAVE. — OLLIE ♥`. Hold.
**39.0-41.0** Your shoulders drop. Long exhale. The dinosaur in your other hand.
**41.0-43.0** Reyes, a few metres away, watching you read. He nods slowly, like a comfort.
**43.0-43.5** Silence drop on the note.

### SCENE 5. BACKWARDS (43.5-57.0)
**43.5-45.5** Slow push-in on one word: `BRAVE`. The R faces the right way.
**45.5-46.5** 1 s match cut to the warm flashback card `BЯAVE`, then back to the note. Same word, two different hands. **[MID TWIST 1 ~49 s, 58%]**
**46.5-49.5** Your hand starts to shake; the paper rattles. Heartbeat 90 → 120.
**49.5-51.5** Your eyes lift. Reyes's hands are folded in his lap: his right fingertips smeared **red crayon wax**; a broken red crayon in his jacket pocket.
**51.5-53.5** 1.5 s insert, desaturated (Ep 2's ten quiet hours, unseen until now): Reyes alone behind the water tank, writing slowly in red crayon, copying a child's letters, glancing over at you and Ollie asleep-ish against the parapet.
**53.5-55.5** **THE SPLIT SECOND, REPLAYED** in slow motion: Reyes's boot kicking the plank, his face calm, already decided; his eyes flick once to the empty fire escape. **[MID TWIST 2 ~56 s, 66%]**
**55.5-57.0** Reyes doesn't look away. He writes on the back of his hand with marker and holds it up: `IT WAS HIM OR ALL OF US.` Behind him, Maya stares at the gravel; DJ pulls his headphones over his ears. Neither looks at you.
**57.0-57.5** Silence drop.

### SCENE 6. THREE TAPS (57.5-68.0)
**57.5-59.0** Close: the little yellow walkie on your hoodie. Its red light blinks once. Static crackle.
**59.0-61.5** Tap (light blinks). Tap (blinks). Tap (blinks). Knuckle on plastic, dry and close. Push-in. **[BIG TWIST ~61 s, 72%]**
**61.5-62.5** 2-frame flash of Ep 2's CCTV still (Ollie walking between kneeling Sleepers, eyes shut) with a detail never noticed before: his free hand white-knuckled around the matching walkie. He was awake. He was holding on.
**62.5-64.5** Quiet image: your open palm in the moonlight, the walkie in it, red light still; the cape drawing beside it on the gravel, one corner lifting in the wind. Almost no sound.
**64.5-66.0** Tilt down over the parapet: the street below, empty a minute ago, now has Sleepers standing in it, heads tilted up at YOUR roof. Cut: more of them. HUD `SLEEPERS NEARBY` 0 → 40 → 600, red.
**66.0-68.0** Static crackle again. Reyes steps in, open palm out for the walkie. Maya's eyes on you, pleading. DJ shaking his head: no.

### SCENE 7. THE VOTE (68.0-85.0)
**68.0-70.0** POV split: your thumb on the walkie's power switch; Reyes's open hand on the left of frame; on the right, this building's fire-escape ladder going down into the Sleepers. The walkie's light blinks once more.
**70.0** Hard cut to the dark `#0A0D16` vote card. `WHAT DO YOU DO?` types on.
- Card A (lime): `A · HAND IT OVER` / `SILENCE OLLIE. KEEP THE OTHERS ALIVE.` (power-off icon)
- Card B (red): `B · TAP BACK` / `TELL HIM YOU'RE COMING. GO DOWN ALONE.` (ladder icon)
- `COMMENT A OR B · THE MOST VOTED CHOICE DECIDES`. Under the card, very quietly, three taps repeat every 4 s.
**81.0-85.0** Black, `FOLLOW FOR HOUR 54` fades up. Last sound: three taps, then nothing. Loop: frame 0 is the plank over the gap.

## 5. Sound map
- Voice -13 LUFS per line; SFX about half; drone about a quarter; final -14 LUFS.
- Present: cold roof wind, a distant car alarm, the hum (behind you on the plank, then draining down into the old building, then rising again from the street below at the end). Flashback: no wind, no drone; a warm pad, crayon scratches, a music-box version of the hum's note.
- Silence drops: 16.5-17.0, 43.0-43.5, 57.0-57.5, and the near-silent quiet image 62.5-64.5.
- Signature cue: the three taps. Use the exact same sample on your hand in the flashback (softer) and on the walkie, so the ear connects them.
- Heartbeat: 80 on the plank → gone in the flashback → 90 → 120 at the backwards R → stops dead on the first tap.
- Hits: plank creak and crack, door explosion with shake, the plank's fall (long whoosh, no landing), paper unfolding loud in the silence, walkie static.

## 6. Plants (never explained)
1. The narrator said "Ollie. Asleep." in Ep 2. He wasn't. The narrator lied (narrator = virus).
2. Maya and DJ looked away: did they know Reyes's plan?
3. The Sleepers faced YOU first, then turned to follow Ollie.
4. `SUBJECT 0` / `B1 · SLEEP STUDY` still open from Ep 2.
5. Reyes keeps the red crayon.

## 7. Where each vote leads (Episode 4, branches never rejoin)
**A · HAND IT OVER → Ep 4 "Silence" (Hour 60).** Reyes switches it off mid-tap: tap, tap... nothing. He drops it off the roof. At dawn you watch the horde march out of the city in one long line. At the front walks a small barefoot figure. He stops under your roof, looks up, and lifts his hand... and doesn't tap. He turns and leads them away. He's stopped waiting for you. Reyes is the only one who doesn't look surprised.

**B · TAP BACK → Ep 4 "Eyes Shut" (Hour 54).** You tap three times and climb down this building's fire escape into a street full of Sleepers. You do what Ollie did: close your eyes and walk. The episode is told in darkness and sound. You find the basement clinic, and Ollie, awake, crying without a sound. He taps your hand three times. Then you see the bed next to his has your name on it: `SUBJECT 0`.

## 8. Episode QA
- [ ] The backwards R is shown big and clear in the flashback (25.2-27.4) so the twist is fair.
- [ ] The walkie is clipped on in the flashback (29.6-31.8) before it's used.
- [ ] Reyes writing the note during the ten hours is shown (51.5-53.5), so the 30-second microsleep timing works.
- [ ] The plank kick is shown twice: real speed (13.5-14.0) and the slow-motion replay (53.5-55.5).
- [ ] The street filling below is shown before the vote, so option A has a real reason.
- [ ] The flashback is the only warm-colored scene; present day stays cold blue.
- [ ] Ollie never speaks aloud; his voice is crayon, silent laughter and taps.
- [ ] Hook text readable on mute in the first 3 s; vote acknowledged within 5 s.
- [ ] Twists at ~58%, ~66% and ~72%; four silence drops.
- [ ] Vote card clean and dark; 85 s, 1080x1920, 30 fps.
