# What the two reference shorts do (analysed from frames, nothing recreated)

Files studied: two ~80 s screen recordings (60 fps), "Day 1 of the Outbreak" (stick-man style, 14th floor) and
"The Last Cruise" (cruise ship). I can only study stills and numbers, not hear them or watch motion.

## Measured
- About 48-50 hard cuts in ~80 s: average shot 1.6 s. Every shot is a different composition.
- 60 fps; only 15-20 % of frames are exact repeats, so animation is mostly on ones (smooth), not held poses.

## Design language (what makes it read as professional)
1. One simple style, applied everywhere: flat vector shapes, a thick dark outline on every character, simple round head,
   tube limbs with rounded joints, mitten/open-hand hands. Detail is spent on backgrounds, not on anatomy.
2. Strong silhouettes and scale contrast: wide establishing shot (building at dusk with the marker "YOU · FLOOR 14")
   -> tight door -> window -> top-down street with tiny figures. Camera is always telling you where you are.
3. UI as props: lock-screen notifications, red emergency-alert card, ship intercom with ripple rings, crew-code card,
   phone chat. Information appears as a physical object, not floating text.
4. Layout is constant: HUD top-left (day, time, floor), lower-third tags ("DAN · THROUGH THE GLASS"),
   RULE #n pill with a red-underlined title, bold white captions with the active word in lime, all in the same place.
5. Colour: warm dusk glow against dark navy; red reserved for alerts; one accent colour for emphasis.
6. Motion shows what happens: a dotted arc traces a climb, a bookshelf visibly topples, rings pulse from a speaker.
7. Layer order follows physical contact. Figures overlap furniture correctly (shelf, sofa, door); nothing is drawn
   on the wrong side of what it touches.
8. Little distortion: figures keep their proportions, no detached limbs, no floating props. (At screen-recording
   compression I cannot judge fine anatomy; this is about what is visible.)

## What I did wrong, concretely
- Hands: blocky fists, fingers as separate thin sticks pasted on top. A hand must be one connected shape:
  palm -> knuckles -> finger segments -> thumb, with a visible wrist joining the forearm.
- Holding a plank: the palm rests on the near side, the fingers wrap over/around the far edge, so the fingers are
  hidden behind the plank (only curled tips may show past the far edge) and the thumb stays in front.
  I drew the fingers in front of the plank. Same rule for any held object: contact decides z-order.
- Props behind characters were highlighted as if visible.
- Characters were built from rigid blocks, so poses looked broken; the references use simple outlined tubes with
  consistent proportions.
- Too many tiny, rigid figures; the references use fewer, larger, clearer subjects per shot.
- I reviewed thumbnails; defects only show at full size.

## Rules I will follow from now on
1. Layer contract per shot, written before drawing: far side / held object / near side (thumbs, sleeves).
2. Two-pass hand rig: draw the back-of-hand/finger pass behind the object, then the palm/thumb pass in front.
3. One consistent character style (outlined, proportional, joint-based). I will show you a character + hand
   test card (grip on a plank, push a shelf, hold a phone, point, open palm) at full size, and wait for your OK,
   before animating any episode.
4. Establish location in each scene, then cut tighter; use UI props for information.
5. Review every shot at full size (at least 540x960) at three moments, plus a motion strip, before rendering.
6. Audio: verify nothing overlaps the narration (the "He laughed without noise" gate bug), by measuring voice vs mix.
7. Fix known defects found in my own review before delivery; deliver one polished cut.
