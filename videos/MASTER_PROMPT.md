# MASTER PROMPT — "What if your ___ doubled every day?" (Polygram series, Blender edition)

Paste this whole file into a Claude Code session running on the Mac, in the project folder, with Blender installed.
Reference implementation (the approved rizz episode): GitHub `boozer-29/portfolio`, branch `claude/cool-bardeen-010lrr`,
folder `videos/rizz-reel-src/` (three.js version) and `videos/gyatt-test-src/` (upgraded rig test).

---

## 0. Machine and tools
- MacBook Pro M1, **8 GB RAM**. Blender 4.2+ (Apple Silicon). Render with **EEVEE** (Metal GPU). Never Cycles for full episodes.
- Drive Blender headless: `blender -b scene.blend -P build.py` and `blender -b scene.blend -a` (or render frame ranges in chunks of ~150 frames).
- 8 GB rules: low-poly only, instanced crowds/debris, textures ≤ 2K, one scene per location, `caffeinate -dimsu` while rendering, render 4K in chunks.
- Audio: ElevenLabs (API key on the user's account), ffmpeg, Python + numpy for the mix.
- Re-use the shout takes and SFX in `videos/assets/audio/` (no credits needed). Music: `TIKI_TIKI.mp3` (QMIIR) supplied by the user — put it in the project folder.

## 1. Format (never change)
Diary escalation. Something doubles **×2 every day**, Day 1 → Day 9. Each day = a new, bigger setting:
personal room → street → city → news → orbit/Moon → planets → universe. A **BOMBOCLAT** shout on every doubling.
No narrator. The story is told by the visuals, funny dialogue in accents, and the counter.
- **Length:** 50–60 s. **Cuts:** every ~1.5–2 s outside slow emotional beats. A face reaction at least every ~10 s.
- **Opening:** silent title card (0.15–2.95 s) — "What if your ___ doubled every day?" in **Playfair Display** 500, white,
  the topic word ("rizz", "yams"…) huge in *italic* (≈2.3× size), thin red (#E21E39) accent line under it, soft dark wash behind, fade in 0.45 s, fade out 0.3 s.
- **Ending:** a cosmic punchline line + one final BOMBOCLAT / reaction. Optional callback to earlier episodes (the Sun from the rizz episode).
- **Silence drop:** 0.8 s of total silence (music + SFX off, voice free) right before the Day 9 payoff.

## 2. The hero (same in every episode)
Voxel/low-poly cartoon man, ~2.2 units tall: **red hoodie (#D7262E, darker #9E1A21 trim), white drawstrings, grey or blue jeans, dark brown hair (#2A1D17), warm skin (#E7B289), black shoes**.
Big blocky head, big white eyes with black pupils, chunky brows, simple mouth. Sunglasses appear when he "levels up".
Rig v2 (required): spine, neck, shoulders + **elbows**, hips + **knees**, hands; facial controls for brows, eyelids (blinks), pupils (darts), mouth shapes.
Animation rules: anticipation before every big action, overshoot/elastic settle (squash & stretch) on every doubling, secondary motion (hoodie strings, hair),
blinks every 2–4 s, mouth only moves while that character is audibly speaking, camera shake on impacts.

**Recurring cast** (ElevenLabs voices, model `eleven_v3`, audio tags like `[shouting]`, `[deadpan]`):
| Role | Voice | voice_id |
|---|---|---|
| Hero (main voice, Caribbean/West-African-flavoured English) | Kevin – Neutral, Calm, and Clear | `eRcsJdPMOM0mtGC03ul7` |
| Stranger (woman) | Tracy Ann with Island Roots | `ZbSLps6NpxbxBHqX5xPw` |
| Gangster pigeon | Denzel Authentic Jamaican Gangster | `dhwafD61uVd8h85wAZSE` |
| News anchor | Walter – Serious News Anchor | `9ZbFvrGBxO3uSmsw6wdI` |
| Astronaut | Connery – Primetime Anchor Voice | `e6gztcS9NPqChYKvXN6c` |
| The Sun (female) | Annakay – Jamaican | `RRIjxt3K1iKEkfsLGRXU` |

**BOMBOCLAT shouts:** use `videos/assets/audio/shouts/` — these are the sample reel's exact deliveries re-voiced in Kevin's voice
(long falling "BUMMM-bo", tiny stop, short clipped "clot"; ~1 s). Alternate takes A / B; use `…_question` for confused moments and
`bomboclat_female_question.mp3` for a female character. Caption text: `BOMBOCLAAT!` (vary the A's), `BOMBOCLAAT?!` for questions.

## 3. On-screen text system
1. **Stat block** (top-left, x≈2.5%, y≈14–29%): label `<TOPIC> LEVEL` (Inter SemiBold caps, wide tracking), big number (Lora Medium), comparison line
   (Inter caps, e.g. "WIDER THAN A DOORWAY"), `DAY n`, red pill `×2 EVERY DAY`. Number swaps on each step with a 5-frame scale tick (1.0→1.06→1.0).
   Hidden during montages.
2. **Dialogue captions:** Montserrat ExtraBold caps, white with black stroke, centred at ~62% height, word-by-word build-up in chunks of ≤ 3 words,
   speaker label above for non-hero characters ("STRANGER", "PIGEON", "NEWS ANCHOR", "ASTRONAUT", "THE SUN ☀️").
   Shouts get their own card (bigger, pop-in scale, slight shake).
3. **NO narration text.** No italic diary lines, no text that nobody says (except the silent opening title card and in-world props:
   phone screens, news lower-thirds, comment cards, magazine covers).
4. **Captions appear ONLY while that character is audibly speaking** in the final mix: gate on each line's own audible spans
   (voice within 20 dB of its peak and ≥ 10 dB above the ducked background), hold through pauses < 0.3 s, no breath/echo tails.
   Word reveal times from ElevenLabs Scribe word timestamps of the voice stem.
5. No channel watermark.

## 4. Look
Soft-lit low-poly voxel 3D, editorial text layer, one colour grade per tier (warm room → bright day street → golden city → news blue →
dark space → cosmic violet #3A2BD9 → gold). EEVEE: soft shadows, AO, bloom on glowing things, real depth of field on close-ups, motion blur on fast moves.
Camera grammar: slow push-in (×1.10 per shot) by default; crash zoom (×1.9–2.6 + 4–16° roll) on big hits; pull-back (×0.6–0.86) on each new tier;
extreme face close-ups for reactions; low angle for "power" moments; orbit in space. Every shot must keep moving (no frozen frames ever).
White flash (3 frames: 95% / 60% / 25%) on tier jumps.

## 5. Audio rules (non-negotiable)
- Mix in numpy (stems: voice / music / SFX / sub). Each line loudness-matched: lines −18 dBFS RMS, shouts −15 dBFS RMS (light compression first).
- Music: TIKI TIKI cut to the story (muffled intro under the title, cut to silence for a comedic beat, **drop lands on the first BOMBOCLAT**,
  calmer section for the soft beats, record scratch for the rejection gag, second drop for the finale).
- **Music sits ~8–9 dB under the voice** during dialogue (gentle dynamic duck, min −3 dB, max −16 dB) and full level between lines.
- One SFX per counter change (pop), sub-bass swell per tier (−30 dB + 3 dB per tier), whooshes on tier jumps, scene SFX (rip, crash, creak…).
- Click-free edits (fades on every segment), no two voices overlapping, master two-pass loudnorm **−14 LUFS, −1 dBTP**.

## 6. Deliverables
- **4K only:** 2160×3840, 30 fps, H.264 High (CRF ~16, capped ~12–13 Mbps so the file stays < 100 MB), AAC 256 kbps 44.1 kHz.
- Low-res (540×960) preview first for approval, then the 4K render.

## 7. QA before delivering (all must pass)
- 0 frames with a caption and no audible voice; 0 spoken words without a caption; no caption > 0.1 s late (check against Scribe of the final MP4).
- Every BOMBOCLAT and every line recognised in a Scribe transcript of the final MP4; every line ≥ 8 dB above the background (p10).
- No clicks at edit points, no clipping, −14 LUFS ±1, true peak ≤ −0.5 dBTP.
- No duplicate/frozen frames (ffmpeg mpdecimate keeps all), no low-motion half-second, video and audio exactly the same length.
- Visual scan every 0.5 s: no camera inside geometry, no cropped faces, nothing blocking the action, text never covering faces for long.
