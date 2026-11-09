# HOURS AWAKE: Episode 2 / 7, "Thirty Seconds" (Branch A: THE ROOF)
Follows the posted Episode 1 v2 "The Note" (ended: thousands of Sleepers kneel, open their eyes and stare up at YOU; vote A ROOF / B BASEMENT; A won).

## 0. Episode block
```
Story:     HOURS AWAKE (zombie), Episode 2 / 7, "Thirty Seconds"
Premise:   Imagine you + you ran for the roof + one microsleep costs you your brother
Counter:   HOURS AWAKE 42:00 → 52:00 (+10 HRS) → frozen 30 s microsleep → 52:01
HUD:       EP 2 / 7 · SURVIVORS 5 → 4 · NOISE dB · IN BUILDING 3,412; line 4 amber RESCUE IN 6 DAYS
Hook text: MOST OF YOU CHOSE THE ROOF. / YOU SHOULDN'T HAVE.   (overlay, 0-3 s)
You-see:   The street is empty... because they're already inside the building (5-8 s)
Mid twist: Ollie is sleepwalking DOWN through the horde, and every Sleeper kneels as he passes (~64%)
Big twist: Ep 1 re-read: they were never staring at you, they were staring at Ollie behind you.
           The moment he's gone, the roof door starts to break (~73-77%)
Choice:    A SAVE YOURSELF: cross the plank to the next roof, leave Ollie
           B SAVE OLLIE: go down into the basement, through thousands of them
Last vote: A, THE ROOF ("YOU CHOSE: A · ROOF" HUD tag, 0-3 s)
Length:    ~65 s, 9:16, 30 fps (~1950 frames). Narration 142 words.
```

## 1. Why this works (and isn't basic)
- **The opening rewards the voters.** It starts on Episode 1's last image, the narrator says "Most of you chose A", and the hook text immediately punishes it: "YOU SHOULDN'T HAVE." Viewers stay to find out why.
- **The relief-to-horror flip in 5 seconds.** The street is empty, so you're safe... no: they're already inside.
- **The rules get broken on screen.** Rule 1 is "never sleep", and 20 seconds later you microsleep. In Episode 1 the rule said one microsleep makes you one of them. You don't turn. That is never explained, and it's comment bait plus a Subject 0 plant.
- **The twist rewrites Episode 1.** Episode 1 ended "At YOU." Now we learn they were staring at your little brother standing behind you. Rewatchers will go back to check, which helps the algorithm.
- **Cause and effect with no exposition.** The door held for ten hours. It breaks the second Ollie is gone. Nobody says why; viewers work out that he was protecting you.
- **The vote is the user's own format:** A = save yourself and abandon your brother; B = risk your life to save him. It's physical, it's on a clock, and both options cost something.

## 2. Tagged narration (ElevenLabs, one paragraph = one generation)
Full text in `script_tagged.txt`; captions from `script_clean.txt`. Times are estimates; re-time from the transcribed audio.

| # | Time | Beat | Tagged line |
|---|---|---|---|
| 1 | 0.0-6.5 | HOOK + RECAP | `[quietly][tense] Imagine thousands of eyes... staring at you. [short pause] Most of you chose A. [urgent] So you run... for the roof.` |
| 2 | 6.5-10.5 | YOU-SEE TURN | `[tense] The street below... is empty. [long pause] [whispers] They're already INSIDE.` |
| 3 | 10.5-18.5 | RULES | `[serious] Rule one: never sleep. Rule two: never make a sound. [urgent] Rule three: if they hum... run. [long pause] [numb] Nowhere left to run.` |
| 4 | 18.5-22.0 | TEN HOURS | `[slowly][numb] Ten hours. They just hum... behind the door.` |
| 5 | 22.0-28.5 | FIGHTING SLEEP | `[softly] Ollie fights sleep in your arms. [short pause] So do you. [long pause] [very softly] Your eyes... close.` |
| — | 28.5-29.5 | TRUE SILENCE (the microsleep) | |
| 6 | 29.5-33.5 | EMPTY ARMS | `[whispering] One microsleep. [short pause] Thirty seconds. [long pause] [tense] Your arms are EMPTY.` |
| 7 | 33.5-38.0 | THE DOT | `[urgent][building energy] Maya's map. [short pause] One dot is moving. Down. [short pause] Through all of them.` |
| 8 | 38.0-48.0 | MID + BIG TWIST | `[whispering] It's Ollie. Asleep. [long pause] And every Sleeper... kneels as he passes. [long pause] [darkly] They were never staring at you. [short pause] They were staring at HIM.` |
| — | 48.0-48.5 | silence drop | |
| 9 | 48.5-51.5 | THE DOOR | `[urgent] Then the door behind you... starts to break.` |
| 10 | 51.5-62.5 | THE VOTE | `[calm][serious] A... cross the plank. Save yourself. [short pause] B... go down for Ollie. Through thousands of them. [long pause] [very softly][warm] Choose. I'll stay with you. [short pause] [urgent] Comment A... or B.` |
| CTA | 62.5-65.0 | FOLLOW | `[softly] Follow for hour fifty-three.` |

Caption colors: lime = A, ROOF, OLLIE, MAP; red = INSIDE, SLEEP, SOUND, RUN, EMPTY, KNEELS, HIM, BREAK, B; amber = PLANK.

**ElevenLabs tip:** if the voice reads "A" as "uh", type it as `Ay...` in that one generation (captions still show "A").

## 3. Beat-by-beat production
Style, palette, HUD, captions, camera: CLAUDE.md PART 4. Sleepers are never seen moving. POV shots (your hands, your breath) whenever possible, so the viewer *is* you.

**1 · 0.0-6.5 · HOOK + RECAP**
- 0.0-1.8 Episode 1's last image, re-rendered: wide from your window, the perfect kneeling circle, thousands of glowing white eyes staring up. HUD on at frame 0: `EP 2 / 7`, `42:00`, lime tag `YOU CHOSE: A · ROOF` (0-3 s).
- Hook text overlay 0.0-3.0, centred at ~32% height, Montserrat 900: white `MOST OF YOU CHOSE THE ROOF.` then at 1.4 s red `YOU SHOULDN'T HAVE.` pops in under it.
- 1.8-4.0 POV handheld sprint up the stairwell: your hands on the rail, Ollie's arms locked around your neck (his red beanie and dinosaur toy in frame), Reyes's flashlight behind you (amber = the only light).
- 4.0-6.5 The roof door bursts open: cold blue wind. Wide from behind you (mustard hoodie): five of you on a small gravel roof, skyline beyond.
- SFX: the Ep 1 hum chord held under 0-1.8, footsteps, your breathing, door bang, wind rush. Narrator breath sample 0.15 s before the line.

**2 · 6.5-10.5 · THE YOU-SEE TURN**
- 6.5-8.0 You at the ledge, 1 s tilt-down: the street is EMPTY. Just a perfect ring of scuffed dust where they knelt.
- 8.0-8.5 Silence drop, static frame.
- 8.5-10.5 Hard cut to the roof door from your side: the hum swells behind it, the light under the door gap flickers with shadows. Reyes rams a steel pipe through the handle. Shake.
- HUD: `SLEEPERS NEARBY` label flips to red `IN BUILDING 3,412`; NOISE 30 → 85 dB (red).

**3 · 10.5-18.5 · RULES**
- 10.5-12.2 Red pill `RULE #1 NEVER SLEEP` over DJ's drooping eyelids.
- 12.2-14.2 Red pill `RULE #2 NEVER MAKE A SOUND` over your own hand clamped over your mouth (POV).
- 14.2-16.0 Red pill `RULE #3 IF THEY HUM, RUN` over the door, vibrating with the hum.
- 16.0-18.5 Drone crane-up: the tiny roof, five survivors, a five-floor drop on every side. A long scaffold **plank** lies by the ledge facing the next building (setup for the vote).

**4 · 18.5-22.0 · TEN HOURS**
- HUD clock rolls `42:00 → 52:00` with a `+10 HRS` tag. Time-lapse of shadows sliding across the roof; survivors slumped against the parapet; the door pulses with the hum but never opens.
- Reyes glances at the gap to the next roof, then at the plank (setup).
- HUD line 4 amber `RESCUE IN 6 DAYS`. Radio crackle with the breath sample (plant).

**5 · 22.0-28.5 · FIGHTING SLEEP**
- 22.0-24.5 Close: Ollie in your arms, head bobbing; your hand jostles him awake. He clutches his dinosaur.
- 24.5-27.0 POV: your own eyelids closing (black vignette closing top and bottom), sound goes muffled, heartbeat slows 70 → 50 bpm.
- 27.0-28.5 Fully black.
- **28.5-29.5 TRUE SILENCE** (everything cut). A tiny red mono counter in the black rolls `MICROSLEEP 00:01 → 00:30`.

**6 · 29.5-33.5 · EMPTY ARMS**
- 29.5-30.5 POV snaps open, 2-frame white flash. Your arms hold only **the dinosaur toy**.
- 30.5-31.5 3-frame plant: a faint hum in the mix that could be coming from YOUR throat. Never explained.
- 31.5-33.5 Wide: Maya, Reyes, DJ asleep-ish, jolting up. The fire escape ladder at the roof edge: **Ollie's red beanie** caught on the top rung.
- HUD: `SURVIVORS 5 → 4` with a red `−1` tag. Heartbeat jumps to 100 bpm.

**7 · 33.5-38.0 · THE DOT**
- 33.5-35.0 Maya's tablet slides up into frame (3° tilt): a floor-by-floor map of the building packed with white dots, all frozen.
- 35.0-38.0 One small lime dot moves **down**, floor by floor (cut-based steps, not smooth): 5 → 4 → 3 → 2. The white dots around it shift into a ring after each cut. Label flashes for 6 frames at the bottom floor: `B1 · SLEEP STUDY` (plant, never explained).
- SFX: tablet pings per floor, heartbeat 100 → 120.

**8 · 38.0-48.0 · MID TWIST → BIG TWIST**
- 38.0-41.0 Building CCTV stills (static frames, timestamped, green tint), one per cut: a stairwell packed with Sleepers; next still, they're **kneeling**, eyes glowing; Ollie, eyes closed, walking between them. **[MID TWIST ~41-43 s, 63-66%]**
- 41.0-43.5 Next still: Ollie at the basement door, one small hand on the handle. Every Sleeper in the frame faces him.
- 43.5-44.0 Silence drop.
- 44.0-46.5 **Re-cut of Episode 1's last shot**, now pulling BACK from your window: you at the glass... and Ollie standing right behind you, eyes closed. Every glowing eye was aimed past you, at him. **[BIG TWIST ~46-48 s, 71-74%]**
- 46.5-48.0 Push-in on Ollie's sleeping face in that flashback. Sub-bass boom on "HIM".

**9 · 48.0-51.5 · THE DOOR**
- 48.0-48.5 Silence drop on the roof door.
- 48.5-50.0 BANG. The door bows, the pipe bends. Shake. NOISE 95 dB flashing red. The hum becomes thousands.
- 50.0-51.5 Reyes slides the plank across the gap to the next roof. DJ and Maya already crawling across it, a five-floor drop under them. Reyes looks back at you and holds out his hand.

**10 · 51.5-62.5 · THE VOTE**
- 51.5-53.0 POV split moment: your left hand reaching for Reyes's hand and the plank; your right hand still holding the dinosaur, near the fire-escape ladder down into the dark.
- 53.0 Hard cut to the dark `#0A0D16` vote card. `WHAT DO YOU DO?` types on.
- Card A (lime): `A · SAVE YOURSELF` / small: `CROSS THE PLANK. LEAVE OLLIE.` (plank icon)
- Card B (red): `B · SAVE OLLIE` / small: `GO DOWN. THROUGH THOUSANDS.` (stairs icon)
- `COMMENT A OR B · THE MOST VOTED CHOICE DECIDES`. The door-banging continues under the card, louder with each hit.

**CTA · 62.5-65.0** Black, `FOLLOW FOR HOUR 53` fades up. Loop: frame 0 is the staring eyes again.

## 4. Sound map
- Voice -13 LUFS per line; SFX about half; drone about a quarter; final -14 LUFS. Never silent apart from the planned drops.
- Bed: sub-bass drone (varied every <10 s), wind on the roof, distant car alarm far off in the city, radio static crackle at 19-21 s.
- The hum: thousands (beat 1) → muffled behind the door (2-5) → nothing (microsleep) → thousands breaking loose (9-10).
- Silence drops: 8.0-8.5, 28.5-29.5 (true silence), 43.5-44.0, 48.0-48.5.
- Heartbeat: 70 → 50 bpm (falling asleep) → 100 (empty arms) → 120 (the dot) → peak at "HIM".
- Hits: door bangs with shake, pill thuds, tablet pings, the boom on "HIM", caption pops (-24 dB).

## 5. Plants (never explained)
1. You microslept 30 s and didn't turn, which breaks Episode 1's rule ("one microsleep and you're one of them"). Payoff: Subject 0 / immunity.
2. The 3-frame hum that might be coming from your own throat.
3. `B1 · SLEEP STUDY` on the map (6 frames). Payoff: the basement's secret.
4. The door holds for 10 hours and breaks only once Ollie is gone.
5. Radio crackle with the narrator's breath sample; "I'll stay with you".

## 6. Where each vote leads (Episode 3, branches never rejoin)
**A · SAVE YOURSELF → Ep 3 "The Other Roof" (Hour 53).** You cross; the plank drops behind you. Your old roof floods with Sleepers, but none of them come after you. They all turn and go back down, to Ollie. Then every radio in the city starts playing a child humming the Note. Ollie is broadcasting, and he's calling them all home.

**B · SAVE OLLIE → Ep 3 "The Basement" (Hour 53).** You climb down the fire escape into the dark, through rows of kneeling Sleepers who let you pass. The basement is an old sleep-study clinic. Ollie is asleep on a bed wired to a speaker playing the Note. Next to him is an empty bed with a name tag: yours. `SUBJECT 0`.

## 7. Episode QA (on top of the master checklist)
- [ ] The staring eyes are on screen at frame 0; the hook text is readable on mute in the first 3 s.
- [ ] "Most of you chose A" is said within the first 4 s; the `YOU CHOSE: A · ROOF` tag shows 0-3 s.
- [ ] The empty-street turn lands by about 6-8 s.
- [ ] The plank is shown twice before the vote (beats 3 and 4), so option A isn't a surprise.
- [ ] Ollie is never seen moving: only static CCTV stills and map steps.
- [ ] The Episode 1 re-cut (Ollie behind you) is the brightest, clearest image of the episode.
- [ ] The vote card is clean and dark; door bangs under it.
- [ ] Facts on screen (microsleep up to ~30 s) web-verified before publishing.
- [ ] ~65 s, 1080x1920, 30 fps.
