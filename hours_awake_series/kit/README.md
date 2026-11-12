# HOURS AWAKE production kit

Everything needed to make an episode. Run all commands from this `kit/` folder.

```
engine/      lib.js (utilities) · rig6.js (outlined character rig + automatic pose QA) · hudcap.js (HUD, captions, pills) · main.js (frame composition) · site/ (index.html + fonts)
tools/       prep_voice.sh · transcribe.py · frames.js · render_all.sh · qa_video.py · qa_audio.py · sheet.py
episodes/ep4 the finished EP4 as the reference episode (scenes ep4a-d.js, plan.py, audio.py, lines.json, voice.mp3)
```

## Setup (once per machine)
```
pip install faster-whisper librosa pyloudnorm soundfile scipy numpy pillow opencv-python-headless
npm i -g playwright && npx playwright install chromium      # (skip if Playwright + Chromium already exist)
# ffmpeg must be installed. faster-whisper downloads "small.en" on first use (set WHISPER=/path/to/model to use a local copy).
```

## Make episode N
1. `cp -r episodes/ep4 episodes/epN`, put the narration at `episodes/epN/voice.mp3`, delete the old `ep4*.js` scenes when you write new ones.
2. `tools/prep_voice.sh episodes/epN` then `python3 tools/transcribe.py episodes/epN` (word timings + per-sentence pace/loudness/pitch/pauses = how the voice performs each line).
3. Write `lines.json` (the script split into lines, ids in order), run `python3 episodes/epN/align_mp3.py` -> `aud.json` (exact word times, refined on the waveform).
4. Edit `plan.py`: the shot list (`seq('shot_name', end_time)` anchored to words with `ST()/E()/wt()`) and the cues (HUD, pills, silence drops, taps...). Run it -> `cues.json`, `timeline.json`, `site/data.js`.
5. Write the scenes (`SC.shot_name=(t,u,d)=>{...}`) in `epN*.js` using the rig (`fig`, `figHead`, `fpArm`, `fpReach`, `drawHand`, `thumbOver`, `clasp` ...).
6. `episodes/epN/build.sh`, serve `episodes/epN/site` (`python3 -m http.server PORT`), check stills: `node tools/frames.js episodes/epN PORT still 1.0,2.5,...` -> `episodes/epN/stills/`. Every pose problem prints as a QA flag.
7. Edit + run `python3 episodes/epN/audio.py` (mix, -14 LUFS, stems in aud/), then `python3 tools/qa_audio.py episodes/epN`.
8. `tools/render_all.sh episodes/epN PORT` -> `episodes/epN/final.mp4`; `python3 tools/qa_video.py episodes/epN`.

## Rig essentials (rig6.js)
- `fig(who,x,y,s,{back,kneel,eyes,mouth,brow,tilt,look,step,arms:[{to,pole,elbow,hand,thumbToward,raise,behind,none}],propBehind,propMid,propFront,neck})` — who: you|ollie|reyes|maya|dj|sleeper. (x,y)=feet. Arm targets are figure-local. Living characters breathe and blink automatically; sleepers stay still.
- Arms: `pole` = where the elbow should go; `elbow` = explicit elbow for forearms pointing at the camera. Hands continue the forearm (wrist clamp ±35°). `thumbToward` picks the thumb side.
- Holding things: `hand:'grip'` draws the fingers BEHIND the object, then draw the object, then `thumbOver(grips[i],...)` puts the thumb IN FRONT.
- First person: `fpArm(shoulder,wrist,{...})`; contacts: `fpReach(shoulder,tip,{...})` places a fingertip exactly (error > 3 px = QA flag).
- QA flags: elbow folded, elbow above shoulder (unless raise), unreachable target, stretched limb, arms crossing, missed contact.
