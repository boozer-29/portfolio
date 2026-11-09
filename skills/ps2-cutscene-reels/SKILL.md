---
name: ps2-cutscene-reels
description: Produce vertical 9:16 comedy reels in the "remastered PS2-era open-world game cutscene" look (low-poly faceted bodies and blocky polygon hair with photoreal face textures, warm amber grade, pixel-font captions, deadpan slacker hero, merch end card). Use whenever the user asks for this style of reel, a scene, a character, a keyframe, a voice line or a full video in this look. Covers script, shot list, camera grammar, color grade, image prompts, image-to-video prompts, ElevenLabs voices/SFX/music, lip-sync, ffmpeg assembly and a QA checklist.
---

# PS2 Cutscene Reels — Master Skill

This file is a complete production bible. It was reverse-engineered frame by frame from a
3 min 28 s screen recording containing 11 reels from one meme account (63 detected cuts,
full speech transcript, pitch/loudness/tempo analysis). Follow it **top to bottom**. Every
block marked **LOCK** is copied verbatim into every prompt. Never paraphrase a LOCK.

> Honest limit: generative image/video models are stochastic. Nothing can guarantee a
> perfect video on the very first click. What this skill does is remove every *avoidable*
> failure: fixed specs, locked prompt blocks, a pre-flight check, a QA checklist and a
> fallback ladder (section 12). Follow it and the first full render is normally publishable.

---

## 0. Quick start (what to do when invoked)

1. Ask for (or invent if the user says "you choose"): **premise**, **hero line**, **payoff
   line**, **product/end card** (optional). Default runtime 18–26 s.
2. Write the script using the **6-beat structure** (section 5).
3. Build the **shot list** as JSON (section 10.1). 8–14 shots, 1.2–3.0 s each.
4. Generate one **keyframe image per shot** with the image prompt template (section 8.1).
5. Generate **voice lines** with ElevenLabs (section 7), one file per line.
6. Animate keyframes with **image-to-video** (section 8.2); lip-sync talking shots (section 8.3).
7. Assemble, grade, caption and mix with the **ffmpeg recipe** (section 9).
8. Run the **QA checklist** (section 11). Fix with the **fallback ladder** (section 12).

---

## 1. Style DNA (what makes the look)

The look is a deliberate clash: **2004 game geometry + 2026 lighting and face textures.**

| Element | Exact treatment |
|---|---|
| Body geometry | Low-poly, visibly faceted silhouettes, slightly stiff "mannequin" posture, simplified chunky hands (fingers often fused). |
| Hair | THE signature. A rigid helmet made of a few large flat polygon planes with a painted/photo hair texture. Bob cuts, beehives, mullets and long beards are all "carved" in flat facets. Never strand-level hair. |
| Face | High-res photoreal skin texture on a low-poly head: pores, oily sheen, wet realistic eyes, real teeth. Angular jaw/cheek planes still visible at the silhouette. |
| Clothes | Low-poly shell wearing a photographed fabric texture (cotton noise, baked wrinkles). Tees are oversized and boxy. |
| Environments | Simple box geometry with low-res, slightly blurry tiling textures (damask wallpaper, siding, carpet, grass). Clutter is sparse and "placed". |
| Lighting | Modern soft global illumination, soft contact shadows, gentle rim light, highlight bloom. |
| Lens | Shallow depth of field on close-ups; deep focus on wides. 35 mm-equivalent for mediums, 50–85 mm for close-ups, 24 mm for wides. |
| Finish | Lifted blacks, mild desaturation, soft bloom, fine grain, faint compression softness (it should feel like a captured cutscene, not a Pixar render). |
| Acting | Deadpan. Small, exact gestures: a sip, a pointed finger, a slow head turn. Reaction faces are big: mouth open, eyes wide. |
| Comedy engine | Everyone brags about jobs → the hero is proudly unemployed → shock reaction → hero lives a better life → catchphrase "Tutto passa" (Italian: "everything passes") → merch end card. |

### 1.1 LOCK — STYLE block (paste into every image AND video prompt)

```
RENDERING RULES (keep exactly): a still from a video-game cutscene with an early-2000s PS2-era 3D open-world game look, remastered. Low-polygon character models with visibly faceted silhouettes; blocky hair built from a few large flat polygon planes wearing a painted photo texture (a rigid hair helmet, no individual strands); angular jaw and cheek planes; simple chunky hands with fused fingers; slightly stiff mannequin posture. BUT a high-resolution photoreal face texture (skin pores, slight oily sheen, realistic wet eyes, natural teeth). Clothing is a low-poly shell with a photographed fabric texture. Props and walls use low-resolution, slightly blurry tiling textures. Modern soft global illumination, soft contact shadows, gentle rim light. Slightly desaturated, lifted blacks, soft highlight bloom, subtle film grain and faint video-compression softness. Shallow depth of field. Vertical 9:16 phone frame, subject centered in the middle third. No text, no captions, no subtitles, no UI, no logos, no brand marks, no watermark.
```

### 1.2 LOCK — NEGATIVE block (models that accept a negative prompt)

```
strand-level realistic hair, smooth high-poly hair, anime, cel shading, cartoon, Pixar, claymation, plastic toy, photograph of a real person, celebrity likeness, readable text, subtitles, letters, logos, brand marks, watermark, UI, extra fingers, extra limbs, warped face, melting geometry, morphing, flicker, camera shake, horizontal frame, letterbox bars
```

**Lesson from test renders:** on wide/full-body shots the model drifts toward realistic hair.
For any shot wider than a medium, add: `the hair is a solid faceted polygon helmet, clearly
low-poly even at this distance`.

---

## 2. Format & technical specs (never change)

| Spec | Value |
|---|---|
| Canvas | 1080 × 1920, 9:16, square pixels |
| Frame rate | 30 fps constant (the source was captured at 60, edited at 30) |
| Video codec | H.264 High, yuv420p, CRF 18, `-movflags +faststart` |
| Audio | AAC 192 kbps, 48 kHz, stereo; integrated **-14 LUFS**, true peak ≤ -1.5 dBTP (source measured -13.1 LUFS, LRA 5.2) |
| Runtime | 15–30 s (sweet spot 20–25 s) |
| Safe zones | Keep faces and captions inside y = 12 %–72 % of frame height. Bottom 22 % is covered by app UI; right 12 % by like/comment buttons. |
| Cuts | Hard cuts only. No dissolves, wipes, zoom transitions or flashes. |

---

## 3. Camera grammar — which shot, which angle, and WHY

Average shot length in the source: **1.5–2.5 s** in story beats, **2.5–4 s** on the end card.
Cameras are **static or slow push-in** (2–8 % scale over the shot). Handheld is never used —
the "game cutscene" feel depends on a locked, synthetic camera.

| # | Shot | Framing / angle | Lens | Move | Used for | Why it works |
|---|---|---|---|---|---|---|
| A | **Ensemble establisher** | Wide/medium-wide, seated eye height, table or BBQ in foreground | 24–28 mm | Static | Opening beat: the bragging group | Shows the social pressure in one frame: the hero isn't there yet, so the audience reads the "setup". |
| B | **Brag MCU** | Medium close-up, chest-up, camera **slightly below chin** (5–10° low angle) | 50 mm | Slow push-in 4 % | Each person's brag line | Low angle = smug superiority; push-in adds pressure. |
| C | **Hero entrance** | Full/medium shot, centered, door or car behind | 35 mm | Static, or slow track-in | "I'm unemployed" line | Centered symmetry makes the hero's calm feel like confidence, not failure. |
| D | **Reaction ECU** | Extreme close-up, face fills 2/3, dead-straight eye level | 85 mm | Hard punch-in (cut, not zoom), 0.8–1.5 s | Gasp / shock | The joke lands on the reaction, not the line. ECU makes the shock comically huge. |
| E | **Prop insert** | Macro/insert of an object (coffee pour, teacup spill, flip phone, business card, keys) | 50–100 mm macro | Static | Punctuation between lines | Gives the editor a "beat" and a sound-effect hook (spill, shatter, beep). |
| F | **Hero deadpan CU** | Close-up, slight low angle, hero looks just off-lens | 50–85 mm | Very slow push-in | Catchphrase / payoff ("Tutto passa") | Intimacy + low angle = the hero is the winner. |
| G | **Hero from behind** | Medium/over-shoulder from behind, hero faces a vast landscape (mountains, sea, farm) | 24–35 mm | Slow push-in | Freedom / "now I finally have time" | Classic freedom image; the viewer stands where the hero stands. |
| H | **Low-angle triumph** | Full body from floor level, hero on a desk/table, crowd and flying paper around | 18–24 mm | Slow orbit 10–15° or static | Celebration climax | Extreme low angle = power and absurd victory. |
| I | **High-angle defeat** | Medium shot from above (15–30° down) on the employed/tired character | 35 mm | Static | "Employed friend" contrast | High angle makes the worker small and trapped. |
| J | **Split-screen timelapse** | Two stacked 1080×960 panels, top "POV: ME", bottom "MY EMPLOYED FRIEND", pixel clock in each | — | Static per panel, cuts every 0.8–1.2 s, clock advances | "Life on easy mode" format | Same timestamps, opposite lives; the clock does the storytelling. |
| K | **Scenic insert** | Wide landscape or car on a coastal road | 24 mm | Slow pan or tracking | Lifestyle montage | Sells the fantasy. 1.5–2 s each. |
| L | **Product end card** | Flat-lay T-shirt on concrete with hard window-light shadows, or hero holding the shirt up against blue sky | 35–50 mm top-down | Static | Last 2–3 s | Converts the laugh into a merch sale; the URL is the only text. |

### 3.1 Edit rhythm

- Cut **on the line**: the new shot starts 2–4 frames before the first syllable.
- Hold a reaction shot **6–10 frames after** the gasp ends — the silence is the joke.
- The hero's line is always **slower** than everyone else's; give it 0.3–0.5 s of air before.
- End card appears on the last word of the catchphrase, never after a pause.

---

## 4. Color grading (per scene family)

The grade is **warm and lifted** by default. Contrast between warm "freedom" and cold
"employment" is the main storytelling tool.

| Scene family | Look | Key hex references | ffmpeg grade (section 9) |
|---|---|---|---|
| Family kitchen / home | Amber-gold, tungsten, mustard wallpaper, pink florals | walls #B89A4E, shadows #3A2A1C, skin #C98E6B | `WARM` |
| Office / interview | Neutral-warm beige, soft fluorescent + window light | #CFC3A6, #6E6A55 | `WARM` (saturation 0.85) |
| Suburban BBQ | Overcast, cool-neutral, muted greens/blues, warm skin | sky #C9CED3, siding #8DA3B5, grass #5E7A3A | `OVERCAST` |
| "Employed friend" / night work | Cold teal-grey, desaturated, crushed sad | #2E3A44, #5D6B73 | `COLD` |
| Freedom / holiday / Mediterranean | Golden hour, saturated sea blues balanced by warm skin | sea #2B8FB3, sun #F2B45A | `GOLDEN` |
| Secret society / throne | High-contrast gold and black, candle bloom | #C9962E, #1A120A | `GOLD_NOIR` |
| Sunset timelapse panels | Night blue → pink dawn → white day → orange dusk → night blue | #2B2F7A → #F1A7B5 → #F4F1E6 → #E8622C → #2B2F7A | Bake into image prompts |
| Product end card | Neutral, crisp, hard window-light shadows | concrete #8C8A86 | `NEUTRAL` |

Always finish with the **FINISH** chain: soft bloom + fine animated grain (section 9).

---

## 5. Story structure — the 6-beat reel

| Beat | Time | Content | Shots |
|---|---|---|---|
| 1 HOOK | 0–2 s | POV text on screen + first brag line. | A or B |
| 2 ESCALATION | 2–7 s | 1–2 more brags, each bigger ("Harvard Law" → "surgeon, gold medal"). Ends with "And yours?" | B, B, A |
| 3 TWIST | 7–11 s | Hero appears, beat of silence (yawn/cough), says the deadpan line ("I'm unemployed."). | C |
| 4 REACTION | 11–14 s | Shock: gasp ECU, spilled cup, dropped spoon, glass shatter. | D, E |
| 5 FLEX | 14–20 s | Hero wins anyway: takes the money, takes the burger, lounges by a pool, sports car, crowd cheers. | F, G, H, K |
| 6 PAYOFF + CARD | last 3–5 s | Catchphrase ("Tutto passa, boss.") on hero CU → product end card with URL. | F → L |

### 5.1 Proven formats from the source (re-skin, don't copy dialogue verbatim)

1. **Tea-table moms** — moms brag about sons; hero in boxers + tee: "I'm unemployed." → grandma spills tea → hero takes cash from mom's purse → "Tutto passa, mamas."
2. **Job interview** — hero walks in in boxers, coffee-pour insert, "Any work experience?" "20 years, zero experience." → interviewer ECU gasp → "We're gonna pass." → "Whatever. [video game] won't play itself."
3. **BBQ dads** — dads brag (partner at law firm, banker) → "And yours?" → sports car arrives → hero: "I'm unemployed." → hands dad the keys "It's yours, Dad." → other son jumps out of the trunk "I quit, Dad." → hero takes the burger: "Smells great, Mr. Johnson."
4. **Life on easy mode** — split-screen day timelapse with clocks (06:05 AM → 08:54 PM): hero sleeps through sunrise, sunset; friend commutes, drowns in paperwork, collapses.
5. **CEO of Unemployed** — letterboxed "cinematic" lifestyle montage (wine at a café, walking past a stressed businessman, poolside) with smug voiceover ("Being unemployed is a full-time job. My schedule is packed.").
6. **Mom asks about plans** — "What's your plan for the future?" → hero lifts a sign "FIVE-YEAR PLAN: STAY UNEMPLOYED" → montage (bathrobe on a balcony, red convertible, cinema) → "And your career?" "That's not in the plan." → spoon drops.
7. **Tuesday 2 PM club** — black invite card "Tuesday, 2 PM. Come alone." → dark corridor → masked figure: "Do you have a boss?" "Not anymore." → golden hall, clock reads TUE 2:00 → bearded elder on throne: "Never speak of Mondays." "What's Monday?"
8. **Peak male experience** — fast-food worker rips off his cap → hero from behind facing mountains → convertible on coastal road → espresso on a sea terrace: "Now I finally have time. Tutto passa, boss."
9. **NEET of Wall Street** — hero dances on a trading-floor desk, paper rains, crowd cheers; billboard "$PRODUCTIVITY ↓ -99.9% MARKET REACTS POSITIVELY".
10. **No Job November** — farm, windmill, red sports car; flip phone shows "JOB OFFER" and dies ("I can reject job offers with my mind"), car headlights pop up ("Machines obey me now").
11. **Historical re-skin** — ancient Rome: hero as a lounging emperor with laptop, grapes, peacock; Colosseum smoking in the background: "Caesar, the empire is collapsing." "So is my LinkedIn career."

---

## 6. Captions & on-screen text

| Text type | Font (free, Google Fonts / Fontsource) | Style | Position |
|---|---|---|---|
| Dialogue captions | **Silkscreen Bold** (pixel) | ALL CAPS, white #FFFFFF, black outline 5–6 px, no box, 60–70 px | Centered, baseline at **63 %** of height |
| Hook / POV header | **Anton** or Montserrat Black | Sentence or all caps, white, black outline 4 px, 54–64 px, max 2 lines | Centered, top at **10–14 %** |
| Mystic / secret-society lines | **Pirata One** (blackletter) | ALL CAPS, white, black outline 4 px | Same as dialogue |
| Clock / timestamps (split-screen) | Silkscreen Bold | "06:05 AM" in a black box with white 2 px border | Top-right of each panel |
| End card URL | Anton | ALL CAPS, white, letter-spacing +2 | Centered at 60 % |

Rules:
- Chunk captions **2–4 words** at a time, synced to speech (word timestamps from ElevenLabs
  Scribe). Never show a full sentence.
- Captions are added in the edit (ffmpeg), **never** generated inside images or video
  (models misspell text).
- Do not use real brand names or logos on clothes, cars or signs (the source does; it is a
  takedown risk). Use invented brands.

---

## 7. Audio

### 7.1 What the source sounds like (measured)

- **Dialogue-first**, dry, close-mic "game ADR" voices, no room reverb.
- **Hero**: young adult male, low relaxed baritone (median F0 ≈ 104 Hz), laid-back slacker
  drawl, deadpan, slightly smug, light vocal fry, unhurried but not slow (≈ 3 words/s).
- **Moms**: mid-50s, bright and boastful (F0 ≈ 145 Hz). **Interviewer**: brisk professional
  woman (≈ 184 Hz). **Dads**: hearty middle-aged men (≈ 150 Hz, excited). **Elder**: deep,
  slow, grave (≈ 95 Hz).
- **Non-verbal performance** sells the jokes: coughs, yawns, sighs, gasps, laughs.
- **SFX hits**: glass shatter, porcelain spill, metal clatter, alarm-clock beeping, crowd
  cheering, paper rustle, car door.
- **Music bed under everything**: warm, bass-heavy, low-passed lo-fi / dreamy lounge loop,
  roughly 75–80 BPM (felt half-time), quiet but continuous; switches to upbeat Italo-lounge
  for "freedom" montages and to an ominous organ/choir drone for the secret-society format.

### 7.2 ElevenLabs cast

**LOCK — Hero voice: `Slacker Hero - Deadpan Drawl`, voice_id `M5iS4o2i0R8IeaOr2LmG`**
(saved in the ElevenLabs voice library; approved by the user as the perfect match). Always use
this voice_id for every hero line. Never substitute another voice for the hero.
Reference sample: `examples/voice/hero_voice_FINAL.mp3`.

It was designed with ElevenLabs Voice Design (`eleven_ttv_v3`) from this description (keep it
in case the voice ever needs to be re-created in another workspace):

```
Young American man, about 24, low relaxed baritone (around 100 Hz), lazy laid-back slacker drawl, deadpan and completely unbothered, slightly smug, soft vocal fry at the ends of phrases, stretched vowels, slow unhurried pacing with small pauses, sounds half-asleep but confident. Clean, dry, close-mic studio recording, no reverb.
```

Supporting cast (design or pick from the Voice Library with these descriptions):

| Role | Voice description for Voice Design / library search |
|---|---|
| Bragging mom | American woman in her late 50s, bright, proud, slightly nasal, gossipy, quick, smug laugh, dry close-mic. |
| HR interviewer | American woman mid-40s, brisk, clipped corporate tone, polite but cold, dry close-mic. |
| BBQ dad | American man about 60, hearty, loud, proud, slightly gravelly, beer-in-hand energy, dry close-mic. |
| Secret elder | Very old man, deep, slow, grave whisper-to-boom, ceremonial, slight rasp, dry close-mic. |
| Employed friend | Tired American man late 20s, monotone, exhausted, sighing, dry close-mic. |

> Do **not** clone a real person's voice (including the original account's actor) without
> their written consent. Design an original voice that hits the same notes.

### 7.3 TTS settings (Eleven v3)

- Model: `eleven_v3` (supports audio tags). Fallback: `eleven_multilingual_v2`.
- Stability **0.40–0.50** (Natural), similarity 0.75, style 0.2, speaker boost on.
- One line per generation; keep each ≤ 12 words. Generate 2 takes and pick.
- Use tags for the non-verbal acting, e.g.:
  - `[yawns] [coughs] I'm unemployed.`
  - `[sighs] Tutto passa, boss.` (pronounced TOO-toh PAH-sah)
  - `[gasps]` for reaction-only clips; `[laughs]` after brags.
- Write numbers as words ("twenty years").

### 7.4 SFX & music (ElevenLabs)

- SFX: `eleven_text_to_sound_v2`, 0.5–2 s each. Prompts: "porcelain teacup knocked over,
  tea splash on tablecloth", "single glass bottle shattering on concrete", "old digital alarm
  clock beeping", "office crowd cheering and whistling, paper rustling", "metal spoon dropping
  on a wooden table".
- Music: `eleven_music_v2` (or v2.5), 30 s, instrumental. Prompt:
  `Warm lo-fi lounge loop, 78 BPM, dusty Rhodes chords, round muted bass, soft brushed drums, tape saturation, low-pass filtered, dreamy and lazy, no vocals, seamless loop.`
  Freedom variant: `Upbeat Italian lounge, 112 BPM, mandolin and nylon guitar, light bossa groove, sunny, no vocals.`
  Society variant: `Ominous cathedral organ drone with distant male choir, slow, mysterious, no vocals.`

### 7.5 Mix

| Layer | Level (short-term, under dialogue) |
|---|---|
| Dialogue | -14 LUFS reference, high-pass 80 Hz, light compression |
| Music bed | -26 to -24 LUFS (≈ 10–12 dB under voice); duck a further 3 dB under lines |
| SFX hits | Peaks at -6 dBFS; land exactly on the cut |
| Master | loudnorm I=-14, TP=-1.5 |

---

## 8. Generation prompts

### 8.1 Keyframe image prompt (one per shot)

Recommended model: `gpt-image-2.5-sunburst` (best adherence to this look in tests),
`aspect_ratio: 9:16`, `resolution: 1K` (or 2K for hero close-ups), `quality: high`.
For the **same character across shots**, generate the hero sheet first, then pass it as a
reference image (`gemini-3-pro-image` or `flux-2-pro`) with "same character, same outfit".

Template:

```
SCENE: <location, 4–6 concrete props, time of day>.
SUBJECT: <who>, <SHOT TYPE from section 3> from <ANGLE> (<why: e.g. low angle = smug superiority>). <hair as faceted polygon planes, colour>, <face details>, <outfit>. <exact pose/action>, <exact expression>.
LIGHT & GRADE: <scene family from section 4 in words>.
<LOCK STYLE block>
```

Hero bible (keep identical across a series; invent your own if you prefer):
`23-year-old guy, chunky shoulder-length wavy dirty-blond hair as a faceted polygon helmet,
sleepy half-lidded eyes, light stubble, smug relaxed smirk, oversized plain heather-grey tee
(or black tee with an invented script logo), black track pants with two white side stripes,
white socks, plain black slides.`

### 8.2 Image-to-video prompt (one per shot)

Recommended models (all available in ElevenLabs Creative): `kling-3-pro` (best for stiff
"game" motion), `veo-3.1-generate-001` (best for subtle facial acting), `bytedance-seedance-v2`.
Duration 5 s (trim in edit). Start frame = the keyframe.

Template:

```
Animate this frame as an in-engine video-game cutscene. Locked-off virtual camera with a very slow push-in (about 5% over the shot); no handheld shake, no cuts. <SUBJECT> performs ONE simple action: <action>, with slightly stiff, game-like body animation and smooth, subtle facial animation. Background stays still except <one ambient motion: steam, curtains, leaves>. Keep the faceted low-poly hair rigid — it never flows or deforms. Keep geometry, faces, outfit and lighting identical to the first frame. <LOCK STYLE block>
```

Motion rules: one action per shot; no walking toward camera for more than 2 s (morphing risk);
hands stay away from faces unless holding a prop; never ask for text in video.

### 8.3 Lip-sync (talking shots only)

- Generate the line first (7.3), then lip-sync the animated clip with `sync-lipsync-v3`
  (dub existing video) or animate the still directly with `bytedance-omnihuman-v1.5` /
  `creatify-aurora` (image + audio → talking head).
- Talking shots must be B, C, D or F framings with the mouth clearly visible and ≥ 15 % of
  frame height.
- Keep the clip 0.3 s longer than the audio so the mouth settles before the cut.

---

## 9. Assembly — tested ffmpeg recipe

Folder layout:

```
reel/
  shots/   s01.png … sNN.png      (keyframes, or sNN.mp4 animated clips)
  vo/      l01.mp3 …              (voice lines)
  sfx/     spill.mp3 …
  music/   bed.mp3
  fonts/   Silkscreen-Bold.(ttf|woff), Anton-Regular.(ttf|woff), PirataOne-Regular.(ttf|woff)
```

Grade presets (copy as-is; verified on ffmpeg 6/7):

```bash
WARM="eq=saturation=0.88:contrast=1.05,colorbalance=rs=0.05:gs=0.01:bs=-0.05:rm=0.03:bm=-0.04:rh=0.02:bh=-0.03,curves=all='0/0.035 0.5/0.52 1/0.96'"
GOLDEN="eq=saturation=1.0:contrast=1.06,colorbalance=rs=0.06:bs=-0.03:rh=0.05:bh=-0.05,curves=all='0/0.03 0.5/0.53 1/0.97'"
OVERCAST="eq=saturation=0.82:contrast=1.02,colorbalance=rs=-0.01:bs=0.02:rh=0.02,curves=all='0/0.04 0.5/0.51 1/0.95'"
COLD="eq=saturation=0.55:contrast=1.03,colorbalance=rs=-0.04:bs=0.06:rm=-0.03:bm=0.05,curves=all='0/0.05 0.5/0.47 1/0.92'"
GOLD_NOIR="eq=saturation=0.95:contrast=1.15,colorbalance=rs=0.07:bs=-0.07:rm=0.05:bm=-0.05,curves=all='0/0.02 0.4/0.36 1/0.98'"
NEUTRAL="eq=saturation=0.9:contrast=1.04"
FINISH="split[a][b];[b]curves=all='0/0 0.75/0 1/1',gblur=sigma=18[g];[a][g]blend=all_mode=screen:all_opacity=0.35,noise=alls=3:allf=t,format=yuv420p"
```

Render one shot from a still (push-in + grade + finish + caption). Tested: 4 shots / 8.5 s
rendered in 25 s on 4 CPU cores, output 1080×1920 30 fps yuv420p.

```bash
FONT=fonts/Silkscreen-Bold.woff   # .ttf or .woff both work with ffmpeg drawtext

capsize(){ # auto font size so any caption fits inside 940 px
  python3 -c "import sys; n=max(1,len(sys.argv[1])); print(min(66, int(940/(0.80*n))))" "$1"; }

shot(){ # $1=image $2=seconds $3=grade $4=caption (any text, apostrophes OK) $5=out.mp4
  local frames=$(python3 -c "print(round($2*30))") fs=$(capsize "$4")
  printf '%s' "$4" > "$5.txt"
  # IMPORTANT: no "-loop 1" here. zoompan turns ONE input frame into d frames;
  # with -loop 1 it would make d×d frames (10× slower, wrong length).
  ffmpeg -v error -y -i "$1" -filter_complex \
  "[0]scale=1620:2880:flags=lanczos,zoompan=z='min(1+0.0009*on,1.08)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=1080x1920:fps=30,$3,$FINISH,drawtext=fontfile=$FONT:textfile=$5.txt:fontsize=$fs:fontcolor=white:borderw=6:bordercolor=black:x=(w-tw)/2:y=h*0.63" \
  -frames:v "$frames" -r 30 -c:v libx264 -preset medium -crf 20 -maxrate 14M -bufsize 28M -pix_fmt yuv420p -an "$5"
}
# no caption on a shot? pass a single space " " as $4
```

Render one shot from an animated clip (scale/crop to canvas + grade + finish + caption):

```bash
clip(){ # $1=in.mp4 $2=start $3=seconds $4=grade $5=caption $6=out.mp4
  local fs=$(capsize "$5"); printf '%s' "$5" > "$6.txt"
  ffmpeg -v error -y -ss "$2" -t "$3" -i "$1" -filter_complex \
  "[0]fps=30,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,$4,$FINISH,drawtext=fontfile=$FONT:textfile=$6.txt:fontsize=$fs:fontcolor=white:borderw=6:bordercolor=black:x=(w-tw)/2:y=h*0.63" \
  -r 30 -c:v libx264 -preset medium -crf 20 -maxrate 14M -bufsize 28M -pix_fmt yuv420p -an "$6"
}
```

Every shot MUST come out of `shot`/`clip` (same size, fps, pixel format, codec) — that is
what makes the concat step below lossless and error-free.

Join shots + mix audio + loudness:

```bash
printf "file '%s'\n" s01.mp4 s02.mp4 s03.mp4 > list.txt          # in edit order
ffmpeg -v error -y -f concat -safe 0 -i list.txt -c copy video.mp4
# dialogue.wav = every line placed at its timestamp, e.g. line 1 at 0.2 s, line 2 at 2.0 s:
ffmpeg -v error -y -i vo/l01.mp3 -i vo/l02.mp3 -filter_complex \
 "[0]adelay=200|200[a];[1]adelay=2000|2000[b];[a][b]amix=inputs=2:normalize=0:duration=longest" -ar 48000 dialogue.wav
# (add SFX the same way: one input + adelay per hit, then include it in the amix)
# final mix — tested: music ducks under voice, output -14.6 LUFS, video stream copied untouched
ffmpeg -v error -y -i video.mp4 -i dialogue.wav -i music/bed.mp3 -filter_complex \
 "[1]highpass=f=80,acompressor=threshold=-18dB:ratio=3:attack=5:release=80,asplit=2[d][dsc];\
  [2]volume=-12dB,aloop=loop=-1:size=2e9[m0];[m0][dsc]sidechaincompress=threshold=0.05:ratio=4:release=250[m];\
  [d][m]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[a]" \
 -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart final.mp4
```

Captions are written to a text file and passed with `textfile=` (already done inside `shot`/`clip`), so
apostrophes, commas and colons never break the filter graph. Add `:enable='between(t,0.2,1.4)'` to time word chunks.

Split-screen panel (format J): render each panel at 1080×960 with the same `shot` logic
(`s=1080x960`, scale source to 2160×1920), then `vstack=inputs=2`.

---

## 10. Planning artifacts

### 10.1 Shot list JSON (fill before generating anything)

```json
{
  "title": "Tea-table moms",
  "runtime_s": 22,
  "hero_bible": "see 8.1",
  "shots": [
    {"id": "s01", "beat": "HOOK", "type": "A", "dur": 2.2, "grade": "WARM",
     "image": "four moms at a floral-tablecloth kitchen table…", "action": "sip tea",
     "line": {"who": "mom1", "text": "My son just got into Harvard Law."},
     "caption_chunks": ["MY SON JUST GOT", "INTO HARVARD LAW!"],
     "pov_header": "POV: MOM HAS TO EXPLAIN YOUR JOB (YOU DON'T HAVE ONE)", "sfx": null}
  ]
}
```

### 10.2 Pre-flight check (before spending credits)

- [ ] Every shot has exactly one action and ≤ 12 spoken words.
- [ ] Shot types follow section 3; at least one D (reaction) and one F (payoff).
- [ ] Every image prompt ends with the LOCK STYLE block; wide shots carry the hair-helmet line.
- [ ] No real brands, game titles, celebrities or real people anywhere in prompts or captions.
- [ ] Aspect ratio set to **9:16 in the model parameters** (prompt text alone is ignored by
      several models — in testing the default came out 16:9).
- [ ] Captions are only in the edit, never in generations.

---

## 11. QA checklist (watch the final file once, start to end)

- [ ] 1080×1920, 30 fps, yuv420p, AAC 48 kHz, -14 LUFS ±1 (check with
      `ffmpeg -i final.mp4 -af ebur128 -f null -`).
- [ ] Hair stays rigid and faceted in every shot; no strand hair crept in.
- [ ] Faces stable (no morph/flicker) across each clip; hands have no extra fingers.
- [ ] Hero looks identical in every shot (hair, tee, pants).
- [ ] Captions inside safe zone, 2–4 words, synced within ±2 frames.
- [ ] Reaction shots hold 6–10 frames after the gasp.
- [ ] Music audible but never masking a word; SFX on the cut.
- [ ] Last frame is the end card; no black frames, no frozen frames at joins.

## 12. Fallback ladder (when a shot fails)

1. Re-roll the **same** prompt once (variation, not rewrite).
2. Shorten the action ("lifts cup" instead of "lifts cup, sips, puts it down").
3. Tighten the framing one step (wide → medium → MCU); fewer pixels of body = fewer errors.
4. Switch video model (Kling ↔ Veo ↔ Seedance).
5. Use the keyframe still with the `shot()` push-in instead of video — in this style a
   static, slowly pushed-in cutscene frame is fully on-brand.
