# MEXICAN TIME — Reel 01 "La Mirada" — Free-tool prompt sheet

Copy-paste prompts for free tools. You generate the images and clips; send them back in the
chat and Claude assembles the reel (grade, captions, voices, SFX, music, end card).

---

## 0. How to use this sheet

**Recommended free tools**
| Job | Tool | Notes |
|---|---|---|
| Images (best character consistency) | **Google Gemini** (gemini.google.com, image model "Nano Banana") | Accepts a reference image. Ask for "vertical 9:16". |
| Images (backup) | Leonardo.ai, Microsoft Designer / Bing Image Creator, Meta AI, Ideogram | Bing/Meta have short prompt limits: use the SHORT prompts. |
| Animation | **Kling** (klingai.com) or **Hailuo** (hailuoai.video) | Image-to-video, 5 s, upload the shot image as the first frame. |
| Talking shots | **Hedra** (hedra.com) | Upload the shot image + the voice MP3 Claude sends you. |

**Order of work**
1. Make the **Santi** character sheet (A1). Pick the best one. This is your reference image.
2. Make the **Mamá** character sheet (A2). Pick the best one.
3. Make shots 1–9. In Gemini: attach the Santi sheet (and the Mamá sheet for shot 5) and paste
   the prompt. Start every prompt with "Using the attached character sheet…" — already written in.
4. Optional: animate the shots marked **ANIMATE** in Kling/Hailuo with the motion prompt.
5. Optional: lip-sync the shots marked **TALK** in Hedra once Claude sends the voice MP3s.
6. Upload everything here, named like `s01.png`, `s01.mp4`, `santi_sheet.png`.

**Every image:** vertical 9:16 (portrait). If a tool ignores it, add "tall vertical phone
wallpaper format, 9:16" at the start. **No text in images** — Claude adds captions later.
If a result shows letters, logos or signs, re-roll.

**If a tool has a short prompt limit**, use the shot's **SHORT** line + this tail:
> `, remastered early-2000s PS2 video game cutscene, low-poly faceted bodies, blocky polygon hair, photoreal face texture, warm soft lighting, film grain, vertical 9:16, no text`

---

## A1. SANTI — character sheet (make first)
```
Character turnaround sheet on a plain mid-grey studio backdrop, soft even studio light, three views of the SAME man side by side: full body front view, full body three-quarter view, head-and-shoulders close-up.
SANTI: Mexican man in his early 30s, tall and broad-shouldered, warm tan skin, thick well-groomed black mustache, short neat stubble, slicked-back black hair, strong jawline, calm heavy-lidded dark eyes, slight confident half-smile. Crisp white western shirt with pearl snap buttons, sleeves rolled to the forearms, dark straight-leg jeans, brown tooled leather belt with a large plain silver buckle, polished brown cowboy boots, cream felt rancher cowboy hat (sombrero vaquero, not a tourist sombrero), thin gold chain, plain gold ring. Holding a small clay cup of coffee.
Style: a remastered early-2000s PS2-era open-world video game character model. Low-polygon body with visibly faceted silhouette, hat and hair built from a few large flat polygon planes with a painted texture, angular jaw and cheek planes, simple chunky hands, slightly stiff mannequin pose, BUT a high-resolution photoreal face texture with skin pores and realistic eyes. Clothes are low-poly shells with photographed fabric textures. Soft global illumination, soft shadows, slightly desaturated, soft bloom, subtle film grain. No text, no labels, no logos, no watermark.
```

## A2. MAMÁ — character sheet
```
Character turnaround sheet on a plain mid-grey studio backdrop, soft even studio light, three views of the SAME woman side by side: full body front view, full body three-quarter view, head-and-shoulders close-up.
MAMÁ: Mexican mother in her late 50s, short and sturdy, warm tan skin, black hair with grey streaks pulled into a tight bun, thin arched eyebrows, small gold hoop earrings, reading glasses on a beaded chain around her neck, colourful floral blouse, a plain apron, dark skirt, comfortable flat shoes. Arms crossed, one eyebrow raised, unimpressed but loving.
Style: a remastered early-2000s PS2-era open-world video game character model. Low-polygon body with visibly faceted silhouette, hair built from a few large flat polygon planes with a painted texture, angular jaw and cheek planes, simple chunky hands, slightly stiff mannequin pose, BUT a high-resolution photoreal face texture with skin pores and realistic eyes. Clothes are low-poly shells with photographed fabric textures. Soft global illumination, soft shadows, slightly desaturated, soft bloom, subtle film grain. No text, no labels, no logos, no watermark.
```

---

## STYLE TAIL (already included in every shot below)
`Style: a still from a remastered early-2000s PS2-era open-world video game cutscene. Low-polygon character models with visibly faceted silhouettes, hat and hair built from a few large flat polygon planes with a painted texture, angular jaw and cheek planes, simple chunky hands, slightly stiff pose, BUT high-resolution photoreal face textures with skin pores and realistic eyes. Props and walls use low-resolution slightly blurry textures. Soft global illumination, soft shadows, slightly desaturated, lifted blacks, soft highlight bloom, subtle film grain. Vertical 9:16 frame. No text, no letters, no signs, no logos, no watermark.`

---

## SHOT 1 — Santi walks in (2.5 s) · ANIMATE
```
Using the attached character sheet, keep Santi exactly the same (face, mustache, cream rancher hat, white western shirt, silver buckle, boots).
Scene: a hacienda courtyard party at night, warm string lights zig-zagging overhead, bougainvillea on adobe walls, long wooden tables with colourful papel picado-style blank paper banners (no letters), a mariachi band in black charro suits with silver details on the left, guests in their Sunday best.
Shot: WIDE shot from a LOW angle at knee height, Santi walking straight toward camera through the middle of the courtyard in slow motion, the crowd stepping aside on both sides staring at him, the mariachi frozen mid-song.
Light: warm golden string-light glow, deep blue night sky, rim light on Santi's hat.
Style: a still from a remastered early-2000s PS2-era open-world video game cutscene. Low-polygon character models with visibly faceted silhouettes, hat and hair built from a few large flat polygon planes with a painted texture, angular jaw and cheek planes, simple chunky hands, slightly stiff pose, BUT high-resolution photoreal face textures with skin pores and realistic eyes. Props and walls use low-resolution slightly blurry textures. Soft global illumination, soft shadows, slightly desaturated, lifted blacks, soft highlight bloom, subtle film grain. Vertical 9:16 frame. No text, no letters, no signs, no logos, no watermark.
```
SHORT: `Santi (attached) walks toward camera in slow motion through a night hacienda party with string lights, crowd parting, mariachi band frozen, low angle wide shot`
**Motion prompt (Kling/Hailuo):** `Santi walks slowly and confidently toward the camera, stiff video-game walk cycle, the crowd steps aside, string lights sway gently, locked camera with a slow push-in, no camera shake, hat stays rigid.`

## SHOT 2 — Rival drops his cup (1 s)
```
Scene: the same night hacienda party, warm string lights blurred in the background.
Shot: close-up INSERT of a rival vaquero's hand at chest height letting go of a small brown clay cup, the cup mid-fall, a splash of dark coffee flying out, his other hand blurred behind. The rival wears a black western shirt and a silver ring.
Light: warm golden practical light, shallow depth of field.
Style: a still from a remastered early-2000s PS2-era open-world video game cutscene. Low-polygon models with visibly faceted silhouettes, simple chunky hands, low-resolution slightly blurry textures on props. Soft global illumination, slightly desaturated, lifted blacks, soft highlight bloom, subtle film grain. Vertical 9:16 frame. No text, no logos, no watermark.
```
SHORT: `close-up of a man's hand dropping a clay coffee cup mid-fall, splash, night party string lights blurred behind`

## SHOT 3 — The last tamal (2 s)
```
Using the attached character sheet, keep Santi exactly the same.
Scene: a long wooden party table at the night hacienda party: big clay pots, a basket of tortillas wrapped in cloth, salsas in molcajetes, and in the centre a plate with exactly ONE tamal left in its corn husk.
Shot: MEDIUM shot at table height. Santi leans in and reaches for the last tamal. Around the table five tías (aunts in floral blouses, hair in buns) freeze mid-bite and stare at him in shock, eyes wide.
Light: warm string-light glow, amber grade.
Style: a still from a remastered early-2000s PS2-era open-world video game cutscene. Low-polygon character models with visibly faceted silhouettes, hat and hair built from a few large flat polygon planes with a painted texture, angular jaw and cheek planes, simple chunky hands, slightly stiff pose, BUT high-resolution photoreal face textures with skin pores and realistic eyes. Props use low-resolution slightly blurry textures. Soft global illumination, soft shadows, slightly desaturated, lifted blacks, soft highlight bloom, subtle film grain. Vertical 9:16 frame. No text, no letters, no logos, no watermark.
```
SHORT: `Santi (attached) reaches for the last tamal on a party table while five aunts freeze and stare in shock, night string lights`

## SHOT 4 — "Nobody tells Santi what to do." (2.5 s) · TALK
```
Using the attached character sheet, keep Santi exactly the same.
Scene: the night hacienda party softly blurred behind him, string lights as warm bokeh.
Shot: CLOSE-UP from a LOW angle (10–15 degrees, power and confidence), 85mm lens, shallow depth of field. Santi tips the brim of his cream rancher hat with one finger, one eyebrow raised, calm smug half-smile, looking straight into the lens.
Light: warm golden key light, strong rim light on the hat brim and shoulders.
Style: a still from a remastered early-2000s PS2-era open-world video game cutscene. Low-polygon character model with visibly faceted silhouette, hat and hair built from a few large flat polygon planes with a painted texture, angular jaw and cheek planes, simple chunky hands, BUT a high-resolution photoreal face texture with skin pores and realistic eyes. Soft global illumination, slightly desaturated, lifted blacks, soft highlight bloom, subtle film grain. Vertical 9:16 frame. No text, no logos, no watermark.
```
SHORT: `low angle close-up of Santi (attached) tipping his rancher hat with one finger, eyebrow raised, smug, night party bokeh`
**Hedra:** this image + voice line L1.

## SHOT 5 — Mamá's "La Mirada" (1.5 s)
```
Using the attached Mamá character sheet, keep Mamá exactly the same (bun with grey streaks, gold hoops, glasses on a chain, floral blouse, apron).
Scene: across the night hacienda courtyard, string lights blurred behind her, a few guests out of focus.
Shot: EXTREME CLOSE-UP, her face fills two-thirds of the frame, dead-straight eye level. "La Mirada": her eyes slowly narrowed into a deadly, silent stare, one eyebrow raised, lips pressed thin, chin slightly down. Pure mom authority.
Light: warm light from one side, the other side in shadow, a dramatic western-showdown feel.
Style: a still from a remastered early-2000s PS2-era open-world video game cutscene. Low-polygon character model with visibly faceted silhouette, hair built from a few large flat polygon planes with a painted texture, angular jaw and cheek planes, BUT a high-resolution photoreal face texture with skin pores and realistic eyes. Soft global illumination, slightly desaturated, lifted blacks, soft highlight bloom, subtle film grain. Vertical 9:16 frame. No text, no logos, no watermark.
```
SHORT: `extreme close-up of Mamá (attached) giving a deadly narrowed stare, one eyebrow raised, western showdown lighting, night party`
**Motion prompt:** `Her eyes slowly narrow, the camera pushes in fast toward her eyes, nothing else moves, dramatic.`

## SHOT 6 — Santi freezes (1 s)
```
Using the attached character sheet, keep Santi exactly the same.
Scene: the night hacienda party softly blurred behind.
Shot: EXTREME CLOSE-UP, dead-straight eye level. Santi frozen in fear: eyes wide, mustache slightly trembling, a single drop of sweat rolling down his temple, the hat brim lowering slightly.
Light: warm light, slightly cooler fill, tense mood.
Style: a still from a remastered early-2000s PS2-era open-world video game cutscene. Low-polygon character model with visibly faceted silhouette, hat built from large flat polygon planes, angular jaw and cheek planes, BUT a high-resolution photoreal face texture with skin pores and realistic eyes. Soft global illumination, slightly desaturated, lifted blacks, soft bloom, subtle film grain. Vertical 9:16 frame. No text, no logos, no watermark.
```
SHORT: `extreme close-up of Santi (attached) frozen in fear, eyes wide, one sweat drop on his temple, night party blurred`

## SHOT 7 — He gives the tamal to Abuela (2 s) · ANIMATE
```
Using the attached character sheet, keep Santi exactly the same.
Scene: the same long party table with clay pots, tortillas and salsas.
Shot: MEDIUM-WIDE shot at table height. Santi bows slightly and respectfully places the last tamal on a plate in front of ABUELA, a tiny white-haired grandmother in a black shawl sitting at the head of the table, who smiles sweetly. The tías around the table relax and nod in approval.
Light: warm string-light glow, amber grade.
Style: a still from a remastered early-2000s PS2-era open-world video game cutscene. Low-polygon character models with visibly faceted silhouettes, hat and hair built from a few large flat polygon planes with a painted texture, angular jaw and cheek planes, simple chunky hands, slightly stiff pose, BUT high-resolution photoreal face textures with skin pores and realistic eyes. Props use low-resolution slightly blurry textures. Soft global illumination, slightly desaturated, lifted blacks, soft highlight bloom, subtle film grain. Vertical 9:16 frame. No text, no logos, no watermark.
```
SHORT: `Santi (attached) respectfully serves the last tamal to a tiny smiling grandmother at a party table, aunts nod approvingly`
**Motion prompt:** `Santi slowly places the plate in front of the grandmother with a small respectful bow, she smiles, the aunts nod, locked camera, stiff video-game animation.`

## SHOT 8 — The most feared man in Jalisco, washing dishes (1.5 s)
```
Using the attached character sheet, keep Santi exactly the same, still wearing the cream rancher hat and white western shirt.
Scene: a rustic outdoor kitchen behind the hacienda: a big metal sink overflowing with a mountain of clay pots, plates and pans, soap bubbles, a single bare bulb, the party glowing in the background.
Shot: MEDIUM shot from a HIGH angle looking down on him (defeat, smallness). Santi, sleeves rolled up, yellow rubber gloves on, scrubbing a giant pot with a deadpan face.
Light: one bare warm bulb overhead, the rest cooler and darker, slightly desaturated.
Style: a still from a remastered early-2000s PS2-era open-world video game cutscene. Low-polygon character model with visibly faceted silhouette, hat built from large flat polygon planes, angular jaw and cheek planes, simple chunky hands, BUT a high-resolution photoreal face texture with skin pores and realistic eyes. Props use low-resolution slightly blurry textures. Soft global illumination, lifted blacks, soft bloom, subtle film grain. Vertical 9:16 frame. No text, no logos, no watermark.
```
SHORT: `high angle shot of Santi (attached) in his rancher hat washing a mountain of dishes in yellow rubber gloves, deadpan, single bulb`

## SHOT 9 — "Some powers… even I respect." + end line (4 s) · TALK
```
Using the attached character sheet, keep Santi exactly the same.
Scene: the hacienda courtyard late at night, the party winding down, string lights glowing softly behind him, warm bokeh.
Shot: CLOSE-UP, slight LOW angle. Santi sips from a small clay cup of café de olla, eyes half closed, calm, wise, slightly defeated but still smooth, a tiny knowing smile.
Light: warm golden light, gentle rim light on the hat.
Style: a still from a remastered early-2000s PS2-era open-world video game cutscene. Low-polygon character model with visibly faceted silhouette, hat built from large flat polygon planes, angular jaw and cheek planes, simple chunky hands, BUT a high-resolution photoreal face texture with skin pores and realistic eyes. Soft global illumination, slightly desaturated, lifted blacks, soft highlight bloom, subtle film grain. Vertical 9:16 frame. No text, no logos, no watermark.
```
SHORT: `close-up of Santi (attached) sipping from a clay coffee cup, calm and wise, night party bokeh, slight low angle`
**Hedra:** this image + voice lines L2 and L3 (two separate clips, or one combined MP3).

## TEE — "LA MIRADA SURVIVOR" (end card)
```
Product photo for a streetwear drop. Top-down flat lay of ONE heavyweight oversized boxy t-shirt in vintage cream, on raw grey concrete, hard late-afternoon window light casting long diagonal window-frame shadows, subtle fabric wrinkles.
Front chest print in faded dark-brown ink, screen-print texture:
Small arched line at the top in a vintage western-label serif font: "LA MIRADA"
A simple line drawing of two narrowed eyes with one raised eyebrow.
Below in bold condensed western-label letters: "SURVIVOR"
Exact text only — no other words, no logos, no watermark.
```

---

## Voice lines (Claude makes these on the ElevenLabs API balance — asks you first)
| ID | Who | Line |
|---|---|---|
| L1 | Santi | "Nobody tells Santi what to do." |
| L2 | Santi | "[sighs] Some powers… even I respect." |
| L3 | Santi | "You met me at a very Mexican time of my life." |
| L4 | Santi | "Get yours at mexican time dot com." |
| (opt) | Mamá | "Mijo." (whispered, over shot 5) |

Santi's voice needs a one-time Voice Design (deep, slow, smooth, natural Mexican accent in
English). Claude will show the cost and wait for approval before creating it.

## What Claude does after you upload
Edit to the timing in the shot table (`brands/mexican-time` pack), hook header
"POV: THE MOST FEARED MAN IN JALISCO", pixel captions, warm grade (cooler for shot 8),
SFX (boots, mariachi cut, cup shatter, western whistle + sting, heartbeat, dishes), a
mariachi-meets-lo-fi bed, the tee end card, and export at 1080×1920 for Instagram.
Still images get slow push-ins, so the reel works even without any animated clips.
