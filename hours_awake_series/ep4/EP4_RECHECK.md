# EP4 recheck — issues found by my own review, and what was done

## Visual
1. Characters were frozen (no breathing, no blinking) -> idle breathing, head sway and blinks for everyone awake; Sleepers stay still by rule.
2. Many shots were near-static -> gentle hand-held camera drift on every story shot.
3. Ladder: hands snapped from rung to rung while the body slid down -> real climbing: each hand holds its rung, lets go, grabs two rungs lower; clanks on each grab.
4. B1: the fingertip teleported from the B to the 1 -> it lifts and travels.
5. Reyes's lunge: the big hand looked pasted onto his side -> a tapered arm reaching toward the camera.
6. DJ's headphones read as a steering wheel -> padded band and big ear cups.
7. Headphones round your neck seen from behind showed the cups on your back -> only the band shows from behind.
8. Continuity: when you open your eyes, Ollie was two metres away although he was holding your hand -> he is right in front of you, hand in yours, his note in the other hand.
9. Ollie's hand on his note was a floating thumb -> fingertips round the paper edge + thumb.
10. "They kneel": they were already kneeling before the word -> they stand around him while he falls asleep and kneel on the word "kneel"; removed a half-second building flash.
11. The three red "tap" pulses were hard flashes -> smooth warm pulses; the tap now lands just before the spoken "Tap".
12. Rule one jolt snapped -> eases back.
13. Walking top-down and down the stairs looked like sliding -> arm swing / stepping away down the stairs.
14. Hospital sign overlapped the HUD in the kneel shot -> hidden there.

## Audio (measured from separate voice / effects / background stems)
1. Harsh digital click on your walkie presses (sample jump 1.4) -> soft filtered button click.
2. Tap sounds sat on top of the spoken "Tap" and were louder -> earlier and quieter.
3. Kneel hit and "until you answered" hit peaked above the voice -> reduced.
4. A UI tick on every caption change (~60 ticks) -> removed.
5. Whoosh + boom on all 33 cuts -> only on location changes.
6. 1 kHz EEG beep every second under the narration -> soft, lower, slower, only in the wide clinic shots.
7. Heartbeat thumps as loud as the voice -> lowered.
8. Rule-pill thuds on top of the word "Rule" -> lower and slightly earlier.
9. Low-end mud (below 45 Hz) -> high-passed background.
Checks after the fix: -14.2 LUFS, no spoken line drops >6 dB in the mix, loudest effect ~12 dB under the voice peaks, silences clean.

## Recheck 2 (final full-HD re-render) — every shot reviewed again at full size, start / middle / end
### Picture: found -> fixed
1. Reyes's lunge: the reaching hand read as a blob/bald head at the bottom of frame, and the walkie he lunges for was not in shot -> front view, his arm reaches for the walkie in YOUR hand (foreground, bottom right); a clear open hand with red crayon tips stops just short of it. Caption moved above his head.
2. Maya's grip: her hand read as a pointing finger and her arm crossed the HUD -> her arm comes from the top right; the back of her hand sits on his sleeve, her fingers wrap the far side (only the tips peek under it), her thumb lies across the near side; his cuff seam now runs across the sleeve.
3. "Reyes pulls the ladder up": Reyes, Maya and DJ were tiny and hidden behind the HUD -> roof edge lowered, the three are clearly visible (waist up, behind the parapet), Reyes hauls the ladder hand over hand, and your own hand reaches up as the bottom rung rises out of reach.
4. "Shoulders brush yours": a whole figure slid across with no "you" in frame -> over-your-shoulder view; the Sleeper stays still (the camera moves with you) and its shoulder meets yours on "brush", with the contact ring there.
5. "Breath on your neck": the breath went into empty space -> your hood and the side of your neck are in frame; the breath lands there (goosebumps). Profile face redrawn (no black box mouth).
6. The hug ("he stayed awake for you"): your arms went out to the screen edges, his hands were missing -> over-your-shoulder hug: his chin on your shoulder, his arms round your neck, his hands gripping your hoodie; your arms go round him (hidden by your back). "His eyes are closing" is the same framing, closer; his finger taps your back twice, the third never comes.
7. Continuity: Ollie fell asleep in your arms but lay alone on the cot when they kneel -> you now kneel behind the cot with a hand on him.
8. Back view of your hood looked like a face opening (a ring inside a ring) -> plain back of the hood with a seam (rig6, applies everywhere).
9. Walking down the stairs from behind, your hands showed in front of your hips -> arms hang at your sides; far steps fall away into darkness.
10. Ollie's eyes sat under his beanie brim (closed eyes read as sunglasses) -> beanie sits higher, eyes always visible (rig6).
11. Ollie's note: stick fingers in front of the paper -> fingers behind the paper, thumb on the front; the backward R's had no room and collided with the B -> spacing added, rings thinner and larger.
12. Maya's note: thumbs now lie on the front of the page.
13. Captions: over the clasped hands when you open your eyes, over the B card in the vote -> scene raised / cards raised; the clinic sign moved to the right and hidden in the zoomed shot (it touched the HUD).
14. HUD: red "SURVIVORS 4" + "+" blip in the first frames removed; a soft dark plate behind the HUD so it reads over busy frames (top-down crowd).
15. They-let-you-pass: a clear lane through the crowd.
### Audio: found -> fixed
1. The voice was raised ~13 dB and then soft-clipped with tanh (up to ~9 dB of clipping on loud syllables) -> compressor (3.5:1) + 5 ms look-ahead limiter, no clipping.
2. Final loudness used one-pass dynamic loudnorm (pumping) -> fixed gain + 4x-oversampled true-peak limiter: -14.1 LUFS, true peak -1.4 dB.
3. Effects lowered 2.5 dB: loudest effect ~10 dB under the voice peaks. No line muted. Silence drops are digital silence.
### Still weak / honest notes
- The "sample jump" click check reports ~0.98: the jumps are inside sharp F/S sounds of the original narration (present in voice.mp3 at the same times), not clicks.
- The stairs read as "going down into the dark" mainly through darkness and the figure moving away; the perspective is simple.
- DJ's headphones beat (picture only, 1 s) is unchanged.
