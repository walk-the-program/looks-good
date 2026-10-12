# ADV-1 adversarial review: Blob Tracking, Xerox, Rebus

Reviewer: ADV-1 (Opus, read-only). Packet rev 1. Date: 2026-10-11.

I looked at these machine outputs: `adv-<key>-A/B/C/D.png`, `sheet-adv-<key>.png`, `sheet-deck-<key>.png`, the full-size cover, principles, interface and material slides, and zoomed crops in `adv/adv1/`.
I looked at these references as images, saved under `adv/adv1/refs/`: the Effect.app blob-tracker demo, Lozano-Hemmer's Zoom Pavilion page, the YOLO page, IBM's rebus SVG, Rand's Eye-Bee-M poster (People's Graphic Design Archive), the Wikimedia rebus plates (the "May I see you home my dear" escort card and the Frederick rebus), the Eye on Design "Nouveau Rebus" images (Songtrust, Upwork, Maev, Sunrise, Nike tee, and a 1592 French rebus sheet), a 1988 xerographic band flyer (People's GD Archive), Ginny Lloyd's copier art and Chel White's *Choreography for Copy Machine* poster (Wikimedia), and the UK/US punk zine piles (Wikimedia).
Bing and DuckDuckGo image search either returned junk or showed a CAPTCHA. I didn't solve the CAPTCHA, so a few references below are cited from their pages and my own knowledge of the work, and each of those is marked "(not viewed)".

---

## 1. Blob Tracking — Score 6/10 · Refine

The UI system (1px boxes, corner ticks, ID tabs, one locked target) is a competent overlay kit. The hero "footage" fails the signature, though. It shows seven soft coloured orbs with neat, evenly spaced boxes, so it reads as stage-light bokeh with a HUD on top. It doesn't read as a machine tracking something real.

### References
- Effect.app Blob Tracker demo — https://effect.app/effects/blob-tracker — about 35 boxes at a 1:12 size range, heavily overlapping. Every box has a solid coordinate tag (`X075Y034`). Dashed paths run between centroids. Footage shows only inside the boxes; the rest of the frame drops to black. (viewed)
- Rafael Lozano-Hemmer, *Zoom Pavilion* (2015) — https://www.lozano-hemmer.com/zoom_pavilion.php — detection boxes on real people at architectural scale. The subject being recognisable is the whole point. (page viewed)
- YOLO real-time detection demo — https://pjreddie.com/darknet/yolo/ — class-name and confidence tabs on every box, colour per class, boxes nested and overlapping. (viewed)
- Derivative, Blob Track TOP — https://docs.derivative.ca/Blob_Track_TOP — the native TouchDesigner source of the look: ID, position and size per blob, read off a threshold mask.
- Interactive & Immersive HQ, "Blob tracking tricks in TouchDesigner" — https://interactiveimmersive.io/blog/touchdesigner-resources/blob-tracking-tricks-in-touchdesigner/ — the 2024 viral-trend vocabulary: zoom or invert inside the box, connector webs, trails.
- Kyle McDonald & Jonas Jongejan, *Exhausting a Crowd* (V&A, 2015) — https://hyperallergic.com/211950/an-addictive-experiment-in-annotating-footage-from-a-london-street/ — dense annotation on crowd footage, labels on everything, tracing lines that follow subjects. (not viewed)
- Harun Farocki, *Eye/Machine III* — https://www.macba.cat/en/obra/r2471-eye--machine-iii/ — the "operational image": recognition boxes and guidance lines are part of the process, not decoration. (not viewed)
- Trevor Paglen, "Operational Images" (e-flux 59) — https://www.e-flux.com/journal/59/61130/operational-images/ — the theory behind why the look reads as machine seeing. (text)
- Jordan Dorsey, fish blob-track study — https://jordandorsey3.artstation.com/projects/V2nXmP — tracked motion turned into box and line overlays, then dithered with Ditherboy. The page was Cloudflare-gated, so I'm citing its description. (not viewed)

### Where it falls short (ranked)
1. **The plate has no subject (high).** In the references the payoff is a recognisable thing being tracked: people, birds, an eye, traffic. Ours (`adv-blob-tracking-A.png`, the hero plate; `BT_BLOBS` in `js/aesthetics/blob-tracking.js`) is seven gaussian glows, each tinted a different brand colour (`glow: 'primary'|'secondary'|'accent'`). The result reads as nightclub bokeh.
2. **Box count and scale contrast are too low (high).** The references show 20–40 boxes spanning roughly 1:12 in size, with overlap, nesting and group boxes around clusters. Ours has 7 boxes in a size band of about 1:3. None overlap, and they're spaced like a layout grid. The scene looks composed, not detected.
3. **The inside and outside of a box look the same (high).** The defining 2024 move is that the box interior is processed differently from the rest of the frame: revealed, inverted, zoomed, sharper or thresholded. Effect.app blacks out everything outside the boxes. In ours the dither runs straight through every box; only the lock gets an 8% tint.
4. **The labels are thin (med).** The references tag every box with coordinates or a class name. Ours gives only `ID · conf`, and only the lock gets XY. The 7–8px tabs on the phone hero (`-D`) collide into an illegible stack.
5. **The connector web is too weak (med).** `BT_LINKS` has 8 lines at 0.5 opacity, and they vanish against the dither. The references draw a visible graph: nearest-neighbour links at full ink, or dashed curves.
6. **There are too many boxes in the UI (med).** Every type card, swatch, card and panel carries an ID tab and corner ticks (`.ab-type-col::before`, `.ab-card::after`, `.ab-sw-role::before`). That breaks the aesthetic's own "box only what matters" rule and flattens the hierarchy. The tracking stops meaning anything when it's everywhere.
7. **The hero sits small and inset (med).** The plate is about 35% of the first screen and padded inside the page. The references are full-bleed footage with small type on top.

### Off-key / cliché
- The multicolour orb glows (teal, orange and yellow halos) read as Aurora Noir or stage lighting, not machine vision.
- The cover and closing pattern, `colony` ("Tracked cells", stippled metaballs with nucleus rings), reads as microscopy or reaction-diffusion.
- The `tissue` pattern (brand-coloured Voronoi) reads as stained glass. Neither carries a single bounding box.

### Fixes (ranked)
1. **Give the plate a subject.** In `js/aesthetics/blob-tracking.js`, replace the 7 orbs with a procedural flock or crowd of 45–70 small subjects: ellipses 1.2–3 cells wide strung along one or two flow curves, like a murmuration. Feed them through the existing `btLum` and Bayer pipeline. Map every `glow` to `'ink'` so the plate is monochrome, and keep `secondary` only as a full-plate duotone wash at 12–15% (`t.mix(plate, t.secondary, .15)`).
2. **Derive boxes from clusters.** Group subjects with single-link clustering at a distance threshold. Draw 18–30 boxes with sizes from 3 to 45 cells, let them overlap, and add 2–3 large group boxes around dense clusters. Keep exactly one `lock`.
3. **Process the box interiors.** In `art()`, add `<clipPath id="${id}c">` holding every box rect. Outside the clip, drop the dither to 55% (`fill-opacity` .3 to .16 and .92 to .5). Inside, redraw the dither paths inverted: a `lit` rect, then the paths filled with `plate`. Inside the lock box, add a primary multiply at 35%.
4. **Label every box and strengthen the web.** Each box gets a tab. Alternate `ID nn · 0.xx` with `X075 Y034`, and use `bta-tab` at 8px. Hide tabs for boxes under 6% of plate width when the container is under 600px. Replace `BT_LINKS` with k=2 nearest-neighbour links between centroids at stroke-opacity .8, plus 3 long links.
5. **Make the plate the hero.** In `css/aesthetics/blob-tracking.css`, make `.bta` full-bleed (escape the page padding) at 2.4:1 on desktop and 4:3 on phone. Cut the headline display (`type.display`) from 0.86 to about 0.7 so the plate dominates.
6. **Un-box the static UI.** Remove the ID tabs from `.ab-type-col::before`, `.ab-sw-role::before` and `.ab-card::after`. Keep the corner ticks only on interactive controls, the hero and the In-use list. Swatches become plain 1px boxes.
7. **Repair the deck patterns.** In `js/patterns/fit.js` under `'blob-tracking'`, drop `colony`, `tissue` and the brand `glyphgrid`. Lead with `onebit` (set `dither: 'bayer'`, `glitch: 0.1`), `terrain` and `signal` in mono. The cover band and closing panel should reuse the hero plate (or a crop of it), not a pattern.
8. **Fix the principles slide collision.** The headline tab `ID 01 · TEXT · 0.99` (`.ab-headline::after`, line 85) paints over the kicker "HOW MARIGOLD STUDIO LOOKS AND FEELS" (`dk/blob-tracking-principles.png`). Add `.ab[data-ae="blob-tracking"].ab-slide .ab-kicker { margin-bottom: 34px !important; }` to mirror the board rule at line 262.

### Keep
- The 8×8 Bayer two-tone ordered dither and fine grain.
- The 1px square boxes with 1.5px corner ticks.
- "Lock exactly one target in primary".
- The HUD corners (`REC · FRAME 0412`, `THRESH 0.62 · MIN AREA 240`, timecode).
- The Searching / Locked / Lost button triptych.
- The In-use list with tick-ruled confidence tracks.
- The plate staying dark in light mode (`-B` holds).
- Neutral grotesk plus mono labels.

### Deck
- The cover pattern band (`colony`) is off-key; see fix 7.
- The principles slide has the tab overlap; see fix 8.
- The material slide reuses the small hero plate. Run it full-height so the box density reads.
- The patterns slide shows six fields with no tracking overlay at all, so the signature disappears from the deck's most "graphic" page.

---

## 2. Xerox — Score 6/10 · Refine

The SVG filter pipeline is real craft. Toothed thresholds, the gen-2/gen-5 sample, the copier band and the tear-off tabs are all good. But the page reads as a distressed web template, not a copy. The noise is uniform salt-and-pepper, the colour is clean and multi-hue, black is used only for text, and there is no copied image.

### References
- Xerographic band flyer, Elks Lodge 1988 (People's GD Archive) — https://peoplesgdarchive.org/item/15817/xerographic-band-flyer-elks-lodge-1988-january-02 — full-bleed solid black, white type reversed out of toner, hand lettering, pasted text blocks at angles, photos crushed to threshold. No colour at all. (viewed)
- Ginny Lloyd, *Lesson Plan* and *Jeans* (Wikimedia, Xerox art) — https://en.wikipedia.org/wiki/Xerox_art — the copier's own screens and frames, and objects laid on the glass with soft falloff into black. (viewed)
- Chel White, *Choreography for Copy Machine* poster — https://en.wikipedia.org/wiki/Xerox_art — colour comes from a coloured stock and a second pass, and the image is a copied photo (a face pressed to the glass). (viewed)
- UK/US punk zines (Wikimedia) — https://commons.wikimedia.org/wiki/File:UK_and_US_zines.jpg — mostly black toner on white or coloured paper. Where colour exists, it's the paper stock (orange or pink covers). (viewed)
- Gallery 98, "Photocopy Machines: Xerox Flyers, Zines and Other Art Ephemera" — https://gallery98.org/news/photocopy-machines-xerox-flyers-zines-and-other-art-ephemera/ — copy-shop ephemera: one-colour cards and flyers on coloured stock. (viewed)
- Brooklyn Museum, *Copy Machine Manifestos: Artists Who Make Zines* (2023–24) — https://www.brooklynmuseum.org/exhibitions/copy_machine_manifestos — the canonical survey of the form. (page viewed)
- Cooper Hewitt, SisterSerpents poster (1993) — https://collection.cooperhewitt.org/objects/18649859/ — "noise" from a faulty drum and toner: streaks and banding, not uniform speckle. (not viewed)
- Pati Hill, copier works — https://www.patihill.org/ — objects copied lid-open on a deep black field with a soft grey halo; the master of copier-as-medium. (not viewed)
- It's Nice That, Raymond Pettibon's Black Flag flyer archive — https://itsnicethat.com/articles/black-flag-raymond-pettibon — ink drawing plus typewritten caption, photocopied: a single black, enormous image-to-type scale. (not viewed)
- Dazed, *Hard Copy* zine show — https://www.dazeddigital.com/art-photography/article/70722/1/hard-copy-zine-exhibition-photography-xerox-exhibition-collier-schorr — contemporary photographers using copier degradation on photographs. (not viewed)

### Where it falls short (ranked)
1. **There's no big black (high).** Every reference spends 30–60% of the sheet on solid toner: reversed bands, lid-open fields, crushed photos. On `adv-xerox-A.png`, black is the headline, the rules, the CTA and a 15-unit band in the art. Paper covers about 85%.
2. **There's no copied image (high).** The hero art is a tidy 45° dot screen masked by the initial M (`art()` dots loop). That reads as a digital halftone filter, which is Riso or print territory. A copied photo collapses into clumped threshold shapes: midtones vanish, shadows merge into slabs.
3. **The noise is the wrong kind (high).** `--xr-speck` (CSS line 17) is isotropic fractal noise at 0.8, so it scatters evenly over every surface, cards and swatches included. Copier noise is structured: dust clusters, drum streaks running the length of the sheet, and toner-starved bands. The `xrx-copy` dropouts in the headline are evenly sprinkled white pinholes, which is the "distressed font" look, not toner loss.
4. **The colour is too clean and too many (med).** The palette strip shows five flat saturated chips. Teal shows up as washi tape (4×) and as all three progress fills. In the references, colour is the paper stock, or at most one spot pass.
5. **Dark mode is a chalkboard (med).** `-B` is white type on charcoal `#2E282A` with white specks. The copier's "dark" is the lid-open black field (near `#0a0a0a`) with paper scraps pasted on, never white toner.
6. **The composition is polite (med).** A tidy left headline, a right art tile and even section rhythm make it a web template. The flyers crop type off the edge, run images full-bleed and angle the pasted blocks.

### Off-key / cliché
- Teal **washi tape** is scrapbook or bullet-journal, and it leans toward the Xerox Punk sibling. On a copy, tape reads as a grey translucent band with darker edges.
- **Special Elite** among the body picks is the stock "grunge typewriter" font.
- The deck patterns `thermal` ("Heat screen", reads as military camo or thermal imaging) and `signal` ("Copy glitch", a digital dropout) belong to digital aesthetics. The `onebit` "Toner crush" with `dither: 'mixed', glitch: 0.5` is also digital.

### Fixes (ranked)
1. **Spend on black.** In `css/aesthetics/xerox.css`, turn one section header per view (THE PALETTE, or the 03 IN USE band) into a full-width toner block (`background: var(--ab-ink); filter: url(#xrx-toner)`) with paper-coloured type. In `art()`, widen the copier band path `M0 0H15V200H0Z` to about 38% of the sheet and fade it into the paper with a threshold-noise edge (`xrx-g5` on a horizontal ramp), giving a lid-open black field.
2. **Copy an image, not a screen.** In `art()`, wrap the masked dot group in a threshold filter: `feGaussianBlur stdDeviation 1.1`, then `feComponentTransfer` alpha `discrete "0 0 1 1"`. Dots then fuse into slabs in the shadow corner and drop out in highlights. Raise the tone-ramp contrast (`0.18 + 0.82*` becomes a 0.05–1.0 curve with a gamma of about 0.6).
3. **Structure the noise.** In `css/aesthetics/xerox.css`, change `--xr-speck` to a two-octave mask: `baseFrequency=".8"` multiplied by a low-frequency mask (`.012`), so specks cluster into 3–6 patches per screen. Add one vertical drum streak 24–48px wide at 6–9% ink with a turbulent edge in the `::before` gradient stack. In the `xrx-copy` holes, use anisotropic `baseFrequency="0.015 0.5"` and `cut` 0.72→0.8, so headline dropouts become a few horizontal streaks instead of pinholes.
4. **Get colour from paper.** In `tokens()` and `css/aesthetics/xerox.css`:
   - `--ab-tape` becomes `t.alpha(t.ink, .13)` and `--ab-tape-edge` becomes `t.alpha(t.ink, .32)`, so tape copies grey.
   - Progress fills (`.ab-row-bar`) become a toner hatch on paper.
   - One scrap per view sits on "coloured stock" (`t.mix(t.accent, t.canvas, .55)`, or secondary for a second scrap).
   - Primary stays the single misregistered overprint.
   - Palette swatches are rendered through `xrx-copy` with speck, so they read as copied chips.
5. **Make dark mode a negative copy.** `canvas(b)` returns `b.mix('#000000', b.canvas, .12)` for dark. Cards become white paper scraps with toner type (`--ab-scrap` = paper, not `mix(ink, canvas, .1)`).
6. **Fix the fonts.** In `js/aesthetic-meta.js` `'xerox'`, drop Special Elite from body picks (keep it in xerox-punk), add IBM Plex Mono, and set pairings to `['Anton','Courier Prime'], ['Archivo Black','Work Sans'], ['Bebas Neue','IBM Plex Mono']`.
7. **Fix the deck patterns.** In `js/patterns/fit.js` `'xerox'`:
   - Replace `thermal` with `['halftone','Copied screen','mono',{cell:3.2,levels:2,shape:'round',angle:45,field:'warp',duo:false,grain:0.5}]`.
   - Replace `signal` with `['tornbands','Paste-up','mono',{bands:5,tear:1,tilt:-0.8,minis:'stripes',shadow:0.2}]`.
   - Set `onebit` to `dither:'threshold', glitch:0.05`.
   - The cover band and closing panel use the halftone or onebit threshold field.

### Keep
- The `xrx-*` filter defs (toothed thresholds, `xrx-rule` rules).
- The Original / 2nd gen / 5th gen triptych, the best and most honest element.
- The TAKE ONE tear-off strip with one tab torn.
- The "NO. 02 OF 50 · DO NOT FOLD" scrap.
- The misregistered primary overprint behind the highlight word and CTA.
- The one heavy condensed headline face (Anton).
- The `No.01` counters, the edge burn vignette, and "Copy of a copy of a copy."

### Deck
- The cover band and closing panel use the camo-like `thermal` field; see fix 7.
- The color slide shows five clean chips and no paper-stock story.
- The material slide (the M art) is fine, but would sing with the lid-open black field from fix 1.
- The patterns slide has 2 of 6 tiles in digital-glitch language.

---

## 3. Rebus — Score 3/10 · Rework

The mechanism is wrong. A rebus works by sound: eye = I, bee = B, deer = dear, and "de" + a signpost = "design". Ours swaps words for icons of synonyms (`pencil` = design, `sun` = alive). It uses a generic UI icon set inside a rounded SaaS shell. The headline decodes as "Good pencil should feel sunny". The brand equation "M + sun = Marigold Studio" doesn't sound out at all.

### References
- Paul Rand, Eye-Bee-M poster (1981) — https://peoplesgdarchive.org/item/13953/eye-bee-mandnbsp — three glyphs at identical height across the sheet on black. The bee's body stripes are the IBM 8-bar stripes, so the pictures are built from the logotype's own construction. (viewed)
- IBM Design Language, Rebus — https://www.ibm.com/design/language/ibm-logos/rebus — the eye and bee redrawn as solid geometric primitives on a spacing grid, monochrome by default. (viewed SVG)
- Paul Rand, "The Rebus and the Visual Pun" (essay) — https://assets.paulrand.design/Life/Exhibits%20and%20Events/2013%20Paul%20Rand%20Defining%20Design/_Copy/Articles%20(raw%20original%20copy)/Designers%20Art/The%20Rebus%20and%20the%20Visual%20Pun/The%20Rebus%20and%20the%20Visual%20Pun.txt — the reader must decode; the dual reading is the mnemonic. (text)
- Milton Glaser, I ♥ NY (MoMA) — https://www.moma.org/collection/works/197055 — black slab type (American Typewriter) plus exactly one red symbol at cap height, tightly kerned as if it were a letter. (not viewed; canonical)
- Victorian rebus escort card, "May I see you home my dear" (Wikimedia) — https://en.wikipedia.org/wiki/Rebus — EYE · C U · HOUSE · MY · DEER. Letters and pictures mix in one line, all engraved in the same black. (viewed)
- Frederick the Great's rebus (Wikimedia, same page) — fraction-and-picture arithmetic ("p over two hands", "à saw over 100"). The puzzle uses position as grammar. (viewed)
- AIGA Eye on Design, "Nouveau Rebus" — https://eyeondesign.aiga.org/fcd2d4f3d70390ca1734749df06fd904/ — the contemporary version. (viewed)
  - Songtrust and Upwork crop photos to exact cap-height blocks inside one-colour type.
  - Sunrise draws tiny bespoke glyphs in the serif's own stroke.
  - The Nike Jordan tee mixes scale, so a figure becomes a hyphen and "4" stands for "for".
  - Maev sets inline objects inside body copy.
- 1592 "Rebus sur les misères de la France" (in the same article) — dense lines of capitals interleaved with woodcut pictures, with syllables completed by letters ("PAR + [animal] + GE"). (viewed)
- MSLK, "I (Eye) Love LC" posters — https://mslk.com/?p=2401 — a found rebus built from a heart and forehead lines. (not viewed)
- Wallpaper, "Anatomy of a logo: Milton Glaser's I ♥ NY" — https://www.wallpaper.com/design-interiors/corporate-design-branding/milton-glaser-i-love-new-york-logo (not viewed)

### Where it falls short (ranked)
1. **The substitution isn't phonetic (high).** `RB_DICT` in `js/aesthetics/rebus.js` maps synonyms: `pencil ← design draw write…`, `sun ← day alive light…`. A picture that shares meaning but not sound is an icon caption, not a rebus. The board headline (`adv-rebus-A.png`, the hero) and the equation (`rbEquation`, "M + sun") both fail to decode.
2. **The pictograms are a stock icon set (high).** The house, pencil, arrow, heart, star, key, bolt and plant read as Font Awesome or Material dingbats. Rand's eye and bee are built from his logotype's stripes and stem weights. Glaser's heart has the weight and roundness of the slab. Ours share no construction with the type. The pencil is two-tone orange and teal; the sun is black on a yellow disc.
3. **Size and spacing break the line (high).** The sun sits on an accent disc at 1.08em, bigger than the caps. The pencil floats with a word-space each side. The references kern pictures like letters at exact cap height, and often inside a word (C U, de-sign).
4. **The legend gives away the puzzle (med).** The chip row "eye I · ♥ love · sun day…" under the equation hands the reader the key, so there's nothing left to decode.
5. **The shell is generic friendly SaaS (high).**
   - Elements: 999px pills, 22px radius pastel tiles, and a teal list-avatar circle around every icon.
   - Equation: the M sits in an orange app-icon tile and the sun in a teal one.
   - Who that look belongs to: Notion, Duolingo or a fintech onboarding screen. None of it comes from Rand, Glaser or the Nouveau Rebus campaigns, which are poster-flat, type-led and mostly one colour.
6. **The type is wrong (med).** Bricolage Grotesque, Lexend and Fredoka (rounded) are trendy and soft. The canonical rebus voice is a slab (American Typewriter, City) or a hard grotesk.
7. **The colour count is too high (med).** Up to four brand hues share the hero (orange pencil, teal tile, yellow disc, orange M). The references use one colour plus a single red heart, or flat black.

### Off-key / cliché
- The accent "sun on a yellow disc" is an emoji sticker.
- The rounded pill chips and pastel tiles are SaaS onboarding.
- The deck patterns are off-key: `glyphgrid` shapes (dot/triangle confetti), `festival` doodle, `arcrise` rising sun and `sprigs` marker botanicals are generic "playful brand" wallpapers with no pictogram or word in them.
- The "Word / Mixed / Symbol" tiles teach "love → ♥", which is a meaning swap, not a sound swap.

### Fixes (ranked)
1. **Add a phonetic engine.** In `js/aesthetics/rebus.js`, add `RB_SOUND`, a homophone and syllable table mapped to pictograms. The headline planner should:
   - Try a whole-word homophone first.
   - Then try a prefix or suffix syllable, keeping the remainder as letters ("de" + [sign] = design; "[eye]dea" = idea).
   - Then allow letter arithmetic ("[bee] + r − e").
   - Never fall back to a synonym. With no phonetic hit, the word stays type and a symbol is placed only where a sound match exists.

   Table entries:

   | Sound or word | Pictogram |
   |---|---|
   | I, i- | eye |
   | be, b | bee |
   | see, sea, c | wave |
   | you, u | ewe |
   | tea, t | cup |
   | for | 4 |
   | to, too | 2 |
   | ate | 8 |
   | can | can |
   | not | knot |
   | dear | deer |
   | son | sun |
   | -sign | signpost |
   | gold | bar |
   | mare | horse |
   | stud | stud |
   | ant | ant |
   | ear | ear |
   | knee | knee |
   | tie | tie |
   | pen | pen |
   | key | key |
   | row, rose | rose |
   | saw | saw |

   For the default brand, the equation becomes `[horse] + [eye] + [gold bar] = Marigold`. Print the answer upside down in small type, which is the puzzle convention, instead of the legend.
2. **Draw the glyphs from the type.** Rebuild `RB_SYM` from geometric primitives only: circles, half-discs, bars and stripe cuts in the 8-bar spirit, with no rounded-rect pencils. Derive the stem from the heading weight (`--rb-stem: calc(var(--rb-hw)/800 * 3.4)` units on the 24 grid). Fill everything in `ink`, and allow exactly one glyph per view in `primary` (the Glaser heart rule). Delete the accent disc (`.rb-hlsym` in `css/aesthetics/rebus.css`) and the two-tone `b` detail colour.
3. **Set glyphs like letters.** In `css/aesthetics/rebus.css`, `.rb-sym` gets height = cap height (keep 0.72em), side margin `0.01em` and no word-space when the glyph is a syllable inside a word. Run the heading tight: `letter-spacing: -0.01em` for slab faces.
4. **Strip the SaaS shell.** In `css/aesthetics/rebus.css`:
   - Every `border-radius: 999px` and `22px` becomes `0`, or `2px` for inputs.
   - Remove `--ab-tile` and `--ab-tile2` pastel fills from cards, the legend, `.ab-av` and `.rb-eq-*`.
   - Cards become hairline-ruled poster blocks.
   - The CTA is a flat ink or primary rectangle ending in the arrow glyph.
   - The equation drops its tiles: bare glyphs at display size, with `+` and `=` in the heading face.
   - Make the hero a Rand-scale lockup that fills the width, with an optional ink-field variant in dark mode.
5. **Fix the fonts.** In `js/aesthetic-meta.js` `'rebus'`:
   - Heading picks become `['Zilla Slab','Roboto Slab','Arvo','Archivo Black']`; all are in FONTS.
   - Body picks become `['Work Sans','Inter']`.
   - Add `'rounded'` to `avoid`.
   - Pairings become `[['Zilla Slab','Work Sans'],['Roboto Slab','Inter'],['Archivo Black','Work Sans']]`.
   - The `why` text becomes: "A slab or hard grotesk gives the pictograms a letter to match, as with Glaser's American Typewriter and Rand's City."
6. **Put rebus in running text.** Following Sunrise and Maev, put one phonetic glyph in the sub-copy and one in a card title ("Your next good [eye]dea"). Use it at x-height in body text and at cap height in headings. Retitle the Word / Mixed / Symbol triptych to a sound swap: `I` / `[eye]` / `eye`.
7. **Fix the deck patterns.** In `js/patterns/fit.js` `'rebus'`, drop `glyphgrid` shapes, `festival`, `arcrise` and `sprigs`. Keep `counterchange` (the eye reads as Rand). Add a pictogram-wallpaper pattern that tiles the brand's own `RB_SYM` glyphs in ink on canvas with one primary, either as a new fit.js pattern fed by RB_SYM or as a static SVG repeat built in `art()`. The material slide should show the glyph construction grid (24 units, stem width), like IBM's rebus spacing grid, instead of a confetti field.

### Keep
- The real `<h2 aria-label>` with replaced words in visually hidden text, which is an exemplary accessibility pattern.
- The 24-unit authoring grid.
- The pictograms baked into CSS vars as data URIs, so PNG export and brand recolouring work.
- Pictograms reused in controls (tab leaders, CTA arrow, switch knob). It's a good idea, once the glyphs are redrawn.
- The "Read it aloud" kicker, which is exactly the right instruction for a rebus.

### Deck
- The cover repeats the hero failure: synonym icons, an accent disc, app-icon equation tiles and the legend.
- The principles and closing slides say "Say it with ♥ a picture", where the heart stands for nothing phonetic.
- The material and patterns slides are confetti and botanicals unrelated to rebus; see fix 7.
- The do/don't slide rule "Replace more than two words" (don't) is sensible, but "Replace the last word with its pictogram" should become "Replace a word or syllable only where the picture says the sound."

---

## Fix log (fx1)

Worker fx1, packet rev 1 (coordinator updates 1.1 and 1.2 noted). Files changed: `js/aesthetics/{blob-tracking,xerox,rebus}.js`, `css/aesthetics/{blob-tracking,xerox,rebus}.css`. Fonts and pattern suites (fixes Blob 7, Xerox 6–7, Rebus 5 and 7's fit.js part) were applied by fx6 in the shared files.

### Blob Tracking
1. Done. The plate's subject is a procedural murmuration: 58 rotated-ellipse subjects along two flow curves, bunched into lumps. It's monochrome ordered dither with a 12% secondary wash, and the brand-colour glows are gone.
2. Done. Boxes come from single-link clustering at 4.5 and 12 cells. That gives 30 boxes: 3 dashed group boxes, 14 cluster boxes, and 13 single and nested boxes, ranging from about 4 to 61 cells, overlapping and nested. Exactly one is locked.
3. Done. Box interiors are processed through clip paths. Groups and clusters show the footage at full strength, singles and the lock are inverted, and the lock gets a primary multiply at 35%. Outside the boxes the dither drops to 55%.
4. Done. Every box has a tab that alternates between `ID nn · 0.xx` and `X075Y034`, and group tabs read `GRP nn · n OBJ`. Tabs on small boxes hide below 600px. Each centroid links to its 2 nearest neighbours at 0.8 opacity, plus 3 long dashed curves from the lock.
5. Done. The plate is full-bleed at 2.4:1, and on phone it shows at 4:3 with the sides cropped. Headline display is 0.7, back to 1 on phone so the headline stays a headline.
6. Done. ID tabs and ticks are removed from the type columns, swatches and the 01/02 cards. Ticks stay on the hero, the controls and the In-use list.
7. The suite change in fit.js was done by fx6. The cover band and closing strip now show the hero plate, through a CSS data URI with the pattern image hidden.
8. Done. Kicker margin on slides, including `.ab-deck-kick`. The principles collision is gone.
Deck: the material slide runs the plate at full stage height.

### Xerox
1. Done. The palette header is a full-width toner band with reversed type. In the art, the lid-open black field covers the left ~38% of the sheet and dissolves into the paper through `xrx-g5`.
2. Done. The dot screen is blurred (1.1) and re-thresholded with a contrasty tone curve, so shadows fuse into slabs and highlights drop out.
3. Done. Specks cluster through a two-octave turbulence mask (640px tile). There's one 30px vertical drum streak with a turbulent edge at 7.5%. `xrx-copy` holes are anisotropic (`0.015 0.5`, cut 0.8), so the headline drops out in horizontal streaks.
4. Done. Tape and progress fills are now grey toner on paper. Colour comes from the paper: the NO.02 scrap sits on accent stock and the 02 panel on secondary stock. Primary stays the single overprint pass, and the swatches go through `xrx-copy` with dust.
5. Done. Dark mode is the lid-open black (88% black) with white paper scraps and toner type. Card, panel and strip vars are re-scoped, so there's no chalkboard and no white toner on grey.
6 and 7. Done by fx6 in aesthetic-meta.js and fit.js.

### Rebus (rework)
1. Done. The phonetic engine (`rbSegment`) tries a whole-word homophone first, then a prefix and/or suffix syllable with the rest of the word kept as letters, so "de"+[sign] and [bee][4]=before. There is never a synonym fallback; words with no sound match stay type. The brand lockup uses sound pictures first, then spelling arithmetic ([bee] − e + ar), then the sign-off [eye][sea][ewe] "I see you". Marigold reads as [mare]+[eye]+[gold], and the answer prints upside down instead of a legend.
2. Done. Twenty-three sound glyphs plus 2 control glyphs, built from discs, bars and stripe cuts on the 24-unit grid. The stem is the heading weight / 800 × 3.4 units. All glyphs are ink, and exactly one per view is primary. The accent disc and the two-tone details are gone.
3. Done. Glyphs sit at cap height (0.72em) with a 0.01em side bearing and no word space inside a word.
4. Done. The pills, tiles, avatars and app-icon equation tiles are gone. Blocks are ruled with 2px ink, the CTA is a flat rectangle with the arrow glyph, and the lockup shows bare glyphs at display size with + set in the heading face.
5. Done by fx6.
6. Partly done. The art carries the rebus sub-line "A de[sign] language…", and the triptych is now I / [eye] / eye. Declined: a glyph in the card title. That copy comes from the framework, and the only way to change it from CSS would hide the real text from screen readers.
7. Suite done by fx6. The cover band and closing strip show a wallpaper of the brand's own glyphs, ink on paper. The material slide shows the glyph construction sheet: the lead glyph on the 24-unit grid with the stem marked, plus the set.
Deck copy (principles, do/don't) is rewritten around the sound rule. The motto is "Be seen. Be heard.", which reads as [bee] [sea]n. [bee] heard.
