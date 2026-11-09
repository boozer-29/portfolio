# HOURS AWAKE: series bible (characters stay exactly like this in every episode)

All characters are drawn by `engine/chars.js` (`person()` rig). Same colours, props and proportions every episode.

| Character | Look | Signature props |
|---|---|---|
| YOU (the survivor) | Mustard hoodie `#EAB308`, hood, short dark-brown hair. Seen mostly from behind, as hands/arms, or in a reflection. | Headphones in Ep 1 (white noise-cancelling) |
| OLLIE (8) | Red beanie with pompom, red sweater, tan skin, small | Green dinosaur toy |
| MAYA | Teal scrubs, long brown hair, calm tired face | Tablet (city map) |
| REYES (60s) | Gray beard, bald, olive/camo jacket, bushy brows | Shotgun, window watch |
| DJ | Purple hoodie, black headphones | Radio with green waveform, mic |
| SLEEPERS | Pale gray skin `#C9CED6`, closed eyes with dark under-eye circles, slumped, head tilted 11-16 degrees, arms limp, throat hum rings. Eyes glow `#E6F7FF` only when they open. Never seen moving, only in new positions after cuts. | Muted tattered clothes |

Colour rules: warm amber = safe, cold blue = danger, red only for alerts/HUD. HUD top-left, captions karaoke (Montserrat 900), fonts Bebas Neue / JetBrains Mono / Caveat.

Rig rule: one pair of arms per character. Arms are solved at the joints (`armIK`) so they attach at the shoulders and reach what they hold. Use `noArms:true` on `person()` whenever arms are drawn explicitly.

Pipeline: narration mp3 -> `pipeline/align_mp3.py` (word timing) -> `pipeline/plan.py` (shots, HUD, cues) -> `engine/*` (render frames) -> `pipeline/audio.py` (mix) -> ffmpeg.
