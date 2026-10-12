# HR6: harsh review of Industrial Device, Industrial Hazard, Blueprint, Religious Futurism, Cybersigilism and Biomechanical Gothic

Reviewer: HR6 (Opus, read-only). Packet rev 1. Date: 2026-10-11.

**What I looked at.** For all six aesthetics I looked at the `r6-<key>-A.png` board at full size, the `-D` phone board, the `sheet-r6-<key>.png` A|B|C|D sheet and the `sheet-deck-<key>.png` deck sheet. I also viewed these slides at 960 px: the cover (blueprint, industrial-hazard), patterns (industrial-device, industrial-hazard, cybersigilism, biomechanical-gothic) and material (religious-futurism, cybersigilism). The 2x hero crops and UI crops are in `S/adv/hr6/`. For distinctness I looked at the neighbour boards: micrographics, cyber-hud, raw-brutalist, dystopian-luxury, y2k-chrome, aurora-noir and neo-deco (`S/adv/hr6/neigh.png`).

**References I viewed** (screenshots are in `S/adv/hr6/refs/`):
- the Teenage Engineering OP-1 field and EP-133 pages, and the OP-1 concept render
- a Braun quartz clock (Wikimedia)
- the Wipeout article, the Hazard symbol article and the Lockout–tagout article
- The Designers Republic home page
- the NASA Graphics Standards Manual reissue page
- the Blueprint article and an Anna Atkins cyanotype
- Richter's Cologne window at night, and Sainte-Chapelle's upper chapel
- the Giger Bar in Gruyères, H. R. Giger on Wikipedia, and Scorn on Steam and Wikipedia
- Are.na search results for "cybersigilism"

Some references wouldn't open, so I didn't count them as viewed. acrnm.com showed a Cloudflare challenge, which I did not solve. cocreate.com gave a TLS error. nothing.tech only showed a region gate. Everything else is marked "(not viewed)".

---

## Shared failures (all six; each one is counted against every score below)

1. **One skeleton for all six.** The order is the same on every board: header → hero → five swatches → three type cards → "Interface | Controls" pair → three-row "In use" table → footer. A machine panel, a cathedral and a Giger nave all run on the same SaaS landing-page template, just reskinned. No studio in the brief would show six identities with the same page architecture. Each aesthetic CSS already overrides `.ab-hero` grid columns, so it can also reorder or replace sections. None of them does.
2. **The dark trio share one control: the three-state orb.**
   - Religious Futurism has Dormant / Lit / Consecrated, Cybersigilism has Etched / Lit / Bound, and Biomechanical Gothic has Dormant / Breathing / Awake.
   - All three are `statesKind: 'swatch'` in `js/aesthetics/{religious-futurism,cybersigilism,biomechanical-gothic}.js` (`labels`, lines 68 / 118 / 42).
   - All three render as a row of three glowing circles: dark → half-lit → full glow. Put the three boards side by side and this control is the same widget.
3. **Two dead deck slides in every deck.**
   - Slide 08, "In product", is the identical sidebar + "Projects" list + "Your next good idea" card in all six decks, with only the fonts swapped.
   - Slide 09, "Do and don't", is six lines of 14 px text in two columns.
   - Neither slide shows anything a reviewer couldn't infer from slide 05.
4. **The pattern suites borrow other aesthetics' families.**
   - `js/patterns/fit.js` gives Religious Futurism `bloomgrid 'Pixel bloom'`. That is the same family and name, with near-identical params, as pixel-arcade's 'Pixel bloom' (line 170 vs 247).
   - Religious Futurism also takes groovy-70s's `arcrise` and `burst`.
   - Cybersigilism takes pixel-arcade's `kaleidopix`.
   - Industrial Hazard takes groovy's `zigzag`.
   - Industrial Device's `specimens 'CMF chips'` renders red/teal sunbursts and swirls (`dk/industrial-device-patterns.png`).
   - The suites are where these brands look least like themselves.

---

## 1. Industrial Device — 5/10 · Refine

**It's a neat vector diagram of an OP-1 inside a Bootstrap card, labelled like a micrographics spec sheet, set in the default grotesk of 2021.**

### References
1. Teenage Engineering OP-1 field — https://teenage.engineering/products/op-1 — (viewed) The product is the hero: life-size on flat grey, full bleed. There is one small lowercase line ("the beauty of evolution"), and every label is printed on the hardware itself, never in callouts.
2. Teenage Engineering EP-133 K.O. II — https://teenage.engineering/products/ep-133 — (viewed) A full-bleed photograph with huge outlined display type over it. Product colour comes in fixed key families.
3. OP-1 concept render — https://commons.wikimedia.org/wiki/File:OP-1_Sequencer_Concept.png — (viewed) Flat aluminium with four encoder colours (blue/green/white/orange) as a fixed function code. Icons sit on the keys, not numbered annotations.
4. Braun quartz clock (Rams/Lubs) — https://commons.wikimedia.org/wiki/File:002_2020_04_21_Uhren_fuer_den_Innenbereich.jpg — (viewed) One black field with one yellow hand. The colour is functional and fixed, and there is only one spot of it.
5. Dieter Rams, Braun SK4 / T3 — https://en.wikipedia.org/wiki/Dieter_Rams — (not viewed) Monochrome housing, one coloured control, and a grid of round perforations as the only ornament.
6. Teenage Engineering OP-1 field guide — https://teenage.engineering/guides/op-1 — (not viewed) Isometric line drawings with tiny lowercase legends; the manual is the brand.
7. Panic Playdate (designed with TE) — https://play.date — (not viewed) One fixed yellow body colour, a crank as the single gesture, and a playful mono UI.
8. Nothing Phone / Nothing brand — https://nothing.tech — (not viewed: region gate) Dot-matrix Ndot type as the brand voice, transparent hardware and one red LED.
9. Rabbit r1 (TE) — https://www.rabbit.tech — (not viewed) One saturated object on white, almost no type.

### Kill list
- **Circled leader callouts ① ② ③ around the device** (`r6-industrial-device-A.png` hero, plus the "DISPLAY / ENCODER / KEYS · 16" legend row).
  - TE never annotates its products like this. This is micrographics' and blueprint's mechanism: blueprint has A/B/C callouts and micrographics has leader lines around a giant M (`neigh.png`).
  - Three aesthetics now share it.
- **The device sitting inside a rounded off-white card with a 1px border** (`.idv-*` frame, `Machined panel` radius 14). The device *is* the panel. Wrapping it in a card is the clearest SaaS tell on the board.
- **Space Grotesk 400 as the headline voice.** It's merely "a font from the category". TE's voice is tiny lowercase plus the product, and Nothing's is dot-matrix. A 48 px sentence-case grotesk with an orange highlight block on "alive" is the generic landing-page hero.
- **The `CMF chips` pattern** (`dk/industrial-device-patterns.png`, top right): red/teal sunbursts, bullseyes and swirls. It reads as groovy-70s, not colour/material/finish chips.
- **The `Perforation` cover band and closing strip** (`dk/industrial-device-cover.png`, `-closing.png`): a cloud-field halftone that reads as cow-hide or camo, not a speaker grille. It is suite[0], so it leads the deck.
- **Teal and orange bar meter in the OLED.** That is client secondary leaking into a display that should be single-colour pixels.

### Gaps (ranked)
1. **Scale and composition.** **High.**
   - Refs: the product fills the frame and the type is tiny.
   - Ours: the device occupies ~50% of the hero at about 440 px wide, with a 48 px headline beside it (a 50/50 split). Nothing is big or small enough to matter.
2. **Labelling system.** **High.**
   - Refs: legends are printed on the hardware (icons, 7 px caps under the knob, numbers on keys).
   - Ours: the keys carry numbers *and* external callouts plus a legend row, so the same information appears three times. This is costume.
3. **Colour logic.** **Medium.**
   - Refs: a fixed function code (OP-1's four encoder colours; Braun's single yellow).
   - Ours: the client yellow takes the "A" key, the client orange takes key 8 and the knob ticks, and the client teal takes the meter. With the green palette (C) the whole device turns mint and loses any sense of a manufactured object.
4. **Material.** **Medium.**
   - Ours: flat greys, a knob with no knurl or cap/skirt split, and a grille drawn as rows of grey vertical pills.
   - TE's aluminium has an anodised flatness with crisp printed legends. Ours is clean but low in detail density: 16 keys, one knob, nothing else.
5. **Phone.** **Medium.** At 390 px (`-D`), the headline drops to about 24 px and the "alive" block collides with the line above. The device is scaled-down desktop with the same ① ② ③ callouts at 8 px.

### Distinctness
- **Nearest:** micrographics and industrial-hazard.
- **Micrographics:** siblings. Both use the circled-number leader-line callout, a pale grey canvas, mono caps labels and a neutral grotesk headline. Industrial Device must drop the callouts and labels-as-ornament and go product-first.
- **Industrial Hazard:** distinct enough in mode and colour. But both use "panel with lamps and a key row", so Industrial Device should never show lamps as a row of status dots (the `PWR REC PLY` row is the hazard lamp row in miniature).

### Fixes (ranked)
1. **TOP: hero.**
   - Rebuild the hero as product-first. In `css/aesthetics/industrial-device.css:51`, change `.ab-hero` to `grid-template-columns: minmax(0, .55fr) minmax(0, 1.45fr)`.
   - Make the art bleed to the board's right edge (`margin-right: calc(-1 * var(--ab-pad, 40px))`) and remove the card frame around the device, leaving only the device body's own 1px edge and radius.
   - Set the headline in lowercase at `clamp(30px, 3.6cqw, 44px)`, weight 400, tracking −0.01em, with no highlight block. The product carries the scale.
2. **TOP: callouts.**
   - Delete the ①②③ callouts and the `.idv-legend` row (`industrial-device.css:140-141`, and the callout markup in `art()` in `js/aesthetics/industrial-device.js`).
   - Instead, print legends on the hardware: 6–7 px Azeret Mono caps under the knob (`vol`, `0`…`10` already there), on the graphite keys (`rec`, `play`, `loop`), and above the screen (`mode`).
3. **TOP: colour code.**
   - Fix the function colours instead of using client hues. The graphite and aluminium families stay as they are. The single main-action key and the knob pointer use the client primary.
   - The function column gets one fixed signal: either the Braun move (one key in the primary, all others graphite) or the OP-1 move (four fixed encoder caps, e.g. `#2B7BE4 / #2FB15C / #F2F2EE / primary`).
   - The OLED meter becomes single-ink pixels in `--ab-oled-ink`. Remove secondary from the meter bars in `art()`.
4. **Replace the deck lead pattern and `CMF chips`** in `js/patterns/fit.js:159-161`.
   - Lead with a regular speaker grille: `['halftone','Speaker grille','mono',{ cell: 2.2, levels: 2, shape: 'round', angle: 0, field: 'ridges', duo: false, scale: 0.6 }]`. Better still, add a `field: 'flat'` option to `js/patterns/families/field.js` so every dot is the same size.
   - Replace `specimens 'CMF chips'` with `modulargrid 'Keybed'` (`{ cols: 16, style: 'filled', merge: 0, gap: 0.4, empty: 0 }`) in mono.
5. **UI radii.** Cut the panel radius from 14px to 8px for cards and 4px for keys (`Machined panel` / `Key` in `js/aesthetics/industrial-device.js:144-145` and the matching CSS). Remove the 1px light-edge inset on cards that aren't hardware. Only hardware gets an edge.
6. **Phone.**
   - In the `@container ab (max-width: 600px)` block (`industrial-device.css:268`), set the headline to `clamp(30px, 9cqw, 40px)` with `line-height: 1.02`.
   - Let the device go full-bleed (`margin-inline: calc(-1 * var(--ab-pad))`) and crop it to the keys and knob, rather than scaling the whole object down.
7. **Detail density.** Add a second row of 16 small step keys (OP-1 keybed), a knurled ring on the knob (a 48-tick `stroke-dasharray` circle) and a printed model line (`tp-01 · field`) in 6 px lowercase.

### Keep
- The device drawing's key families (white / graphite / one accent) and the Doto OLED strip are the only parts that would sit near a TE manual page.
- The "Channel strip" segmented meter in "In use" is honest and reads as hardware.

### Deck
- **Cover:** the cow-print halftone band undercuts the whole deck (fix 4). The device is repeated at the same size on cover and material slides, so the deck has only one picture.
- **06 Material:** the same device again with a "Controls 01–04" list. Show an exploded or isometric line drawing (TE field-guide style) or the keybed close-up instead.
- **07 Patterns:** CMF chips (groovy) and Panel grid (a Bauhaus-poster collage) are off-key. Indicator lamps reads as a circuit maze.
- **08 / 09:** dead (see shared failures). Replace 08 with the device UI on a 128×64 OLED mock (the TE screen *is* the product UI).

---

## 2. Industrial Hazard — 5/10 · Refine

**The ANSI ladder and lockout tag are real research. Everything around them is a dark grey dashboard in Barlow Condensed, with exactly one hazard stripe, and that stripe is chroma-reduced because the client happens to be orange.**

### References
1. The Designers Republic, Wipeout (1995) — https://en.wikipedia.org/wiki/Wipeout_(video_game) — (viewed, box-art thumbnail) Hazard and industrial signage taken over as a brand system, with stencil numerals, katakana, rigid yellow fields and pictograms.
2. The Designers Republic site — https://www.thedesignersrepublic.com — (viewed) A full-bleed flat safety-yellow field, a heavy grotesk at 40 px and up, and one red word. The colour *is* the ground.
3. Hazard symbol / GHS / ISO 7010 — https://en.wikipedia.org/wiki/Hazard_symbol — (viewed) Fixed signal colours and fixed geometry: a red diamond, a yellow triangle, a black pictogram. None of it is negotiable.
4. Lockout–tagout — https://en.wikipedia.org/wiki/Lockout%E2%80%93tagout — (viewed) A red hasp with multiple padlocks and tags; physical red is the brand of the procedure.
5. NASA Graphics Standards Manual (Danne & Blackburn, reissue) — https://www.standardsmanual.com/products/nasa-graphics-standards-manual — (viewed) Spec-plate layouts, Helvetica and one red, applied to vehicles and hardware at full scale.
6. Off-White "Industrial" belt / c/o Virgil Abloh — https://en.wikipedia.org/wiki/Off-White — (not viewed) Yellow/black safety webbing used as the *whole* object, with a quoted Helvetica label.
7. Heron Preston (CTNMB, workwear orange) — https://www.heronpreston.com — (not viewed) Hi-vis orange, reflective tape and stencil caps as the field, not as a trim.
8. ACRONYM — https://acrnm.com — (not viewed: Cloudflare) Spec-sheet product pages, serial-number typography and diagrammatic hardware.
9. ISA-101 HMI guidelines — https://www.isa.org/standards-and-publications/isa-standards/isa-101-standards — (not viewed) Grey screens where colour is reserved for abnormal states. This is the board's stated principle, and it is honoured.

### Kill list
- **The chroma-reduced safety colours.**
  - `js/aesthetics/industrial-hazard.js:67-70`: `warm = …; sig = hex => (warm ? t.mix('#808080', hex, 0.26) : hex)`.
  - With the warm palette the CAUTION key turns mustard and DANGER turns brick (`r6-industrial-hazard-A.png`, Interlocks).
  - ANSI Z535 colours are the one fixed thing in this style. Bending them to make room for client orange is backwards. The client colour must yield.
- **"Hazard stripes" as a black/white mirrored chevron** (`dk/industrial-hazard-patterns.png`, bottom right; `fit.js:284` `chevron … mirror: 'x'`). Hazard tape is straight 45° yellow/black and never mirrors into a V. This one reads as a Missoni or ski-sweater print.
- **"Tread plate" as a stair zigzag** (`fit.js:283` `zigzag 'stair'`). Diamond tread plate is a raised lozenge lattice; this is groovy wavy stripes in black and white.
- **"Bay grid"** (`fit.js:282`): bar charts, a plus sign and quarter circles. That is a Bauhaus-poster collage, not a floor-bay grid.
- **The client teal as the RUN lamp and the "IN REVIEW" ring** (`A` hero lamps, In use row). The lamp colours should come from the ladder: RUN green `#00A651`, ALM yellow.
- **A 48 px headline on a 1280 board.** Hazard signage is the largest type in any room. Ours is about the size of a SaaS hero.

### Gaps (ranked)
1. **Colour as ground.** **High.**
   - Refs (TDR, Off-White, Heron Preston): the safety colour is a *field*, a full-bleed yellow or hi-vis orange slab with black type.
   - Ours: 98% grey, plus a 6 px stripe rail and one 1/4-width orange CTA. That is ISA-101 (correct for a control-room HMI) but not industrial hazard as a *brand*. The board never says "danger" at a glance.
2. **Type voice.** **High.**
   - Refs: stencil numerals and heavy grotesk or DIN caps at extreme size.
   - Ours: Barlow Condensed 700 at 48 px, and the hero numeral "07" (good) is the only big thing. Big Shoulders is listed as the second option, but there is no stencil face at all.
3. **Signage geometry.** **Medium.** The triangle glyph appears only at 10 px inside buttons. ISO 7010 triangles and diamonds as large graphic elements are missing.
4. **Light mode (B).** **Medium.** Pale concrete with white modules reads as a 2010 admin panel. The hazard identity relies entirely on the dark grey.
5. **Phone.** **Low.** It is actually the best phone of the six: the headline is resized, the panel is full width and the rows are restacked.

### Distinctness
- **Nearest:** cyber-hud and industrial-device.
- **Cyber-hud:** siblings. Both are dark, both use condensed uppercase, both have an orange CTA, panel title bars ("CTRL-01 · OPERATOR PANEL" vs. cyber-hud's "01 // INTERFACE") and mono serial numbers. Hazard must move to the physical and printed side: a yellow field, stencil, decals and screws, no glow at all. Cyber-hud keeps the screen side.
- **Industrial Device:** distinct (mode, palette and density differ). The shared premise is the device panel; keep Industrial Hazard heavy and Industrial Device delicate.

### Fixes (ranked)
1. **TOP: unbend the ladder.**
   - Delete the `warm` branch: `const sig = hex => hex;` (`js/aesthetics/industrial-hazard.js:70`), and `--ab-hz-stripe: '#F2C500'` always (line 83).
   - When the client primary falls in the 0–65° hue band, demote the client primary instead. It paints only the enamel nameplate and the slab key, never a lamp or a signal word, which the rules already say.
2. **TOP: a safety-yellow field.**
   - Add one full-bleed `#F2C500` band per board: the hero itself, or a 120–160 px "DANGER ZONE" strip between hero and palette.
   - Put the headline on it in black at `clamp(64px, 9cqw, 132px)` (`industrial-hazard.css:69`, condensed rule).
   - Frame the band top and bottom with 45° yellow/black tape at 14 px pitch, using `repeating-linear-gradient(-45deg, #111 0 14px, #F2C500 14px 28px)`.
3. **TOP: stencil numerals.**
   - Add a stencil face to the heading picks in `js/aesthetic-meta.js:361-370`: `'Stardos Stencil'` or `'Saira Stencil One'` (Google Fonts), used for the zone numeral and section numbers only. Keep Barlow Condensed for the headline.
   - Set the "07" at 2× its current size so it overlaps the nameplate edge.
4. **Patterns** (`js/patterns/fit.js:278-285`).
   - Replace `zigzag 'Tread plate'` with a diamond lattice: `glyphgrid` with `{ glyphs: 'diamonds' }` if available, otherwise a new `treadplate` family. Also drop `modulargrid 'Bay grid'`.
   - Make `Hazard stripes` straight: add `mirror: 'none'` to the chevron family (`js/patterns/families/stripe.js:312`) or use a plain diagonal stripe family. Give it a fixed `safety` colorway (`#F2C500` / `#111111`), which needs a new colorway in engine.js because "nothing here invents a colour" forbids this today.
   - Lead the deck with Steel plates (fine).
5. **Lamps.** Fix the lamp colours to the ladder (`PWR` white, `RUN` `#00A651`, `ALM` `#F2C500`, `LCK` `#D3202A`) in the `.hz-lamp.run` / `.alm` CSS. Client secondary never lights a lamp.
6. **ISO pictograms.** Add one 64–96 px ISO 7010 warning triangle (black border, yellow fill, black glyph) or a GHS diamond as a graphic element in the Interlocks card header, rather than a 10 px glyph inside buttons.
7. **Light mode.** Make B a yellow-dominant board (canvas `#F2C500` at 100%, modules `#111` with white legends) instead of pale concrete. That gives the style a second identity rather than an inverted admin panel.

### Keep
- The lockout tag with string and hasp, the enamel nameplate (`MODEL MR-7 / S/N 004-1187-B / 24 V DC / MFD 03-26`), the 2D mimic line (tank, valve, pump) and the Normal / Caution / Danger key ladder.
- The ANSI Z535 rule set in `js/aesthetics/industrial-hazard.js:157-162`. That is real system thinking.

### Deck
- **Cover:** the hero panel plus a grey "steel plates" band. It is correct but timid. The cover is where the yellow field (fix 2) must land.
- **07 Patterns:** three of the six are off-key (Tread plate, Bay grid, Hazard stripes). Indicator lamps reads as a glitch pixel field.
- **02 Principles:** "LOCK IT OUT. TAG IT." at about 40 px is the deck's strongest line. Set it at 120 px and up, in stencil, on yellow.
- **08 / 09:** dead. Replace 08 with an HMI mimic screen (pipes and valves, one alarm row lit yellow) at full slide.

---

## 3. Blueprint — 4/10 · Rework

**It isn't a blueprint: it's a teal chalkboard with filled orange buttons, a 200 px isometric "M", and patterns borrowed from a topographic map.**

### References
1. Blueprint — https://en.wikipedia.org/wiki/Blueprint — (viewed) A Prussian-blue ground (hue ≈ 215–225°) with white line work and nothing filled. The white *is* the absence of exposure.
2. Anna Atkins, cyanotype of algae — https://commons.wikimedia.org/wiki/File:Anna_Atkins_algae_cyanotype.jpg — (viewed) A deep saturated blue (about `#1F3F8C` to `#24479A`) where white is the only ink, with handwritten captions.
3. NASA Graphics Standards Manual — https://www.standardsmanual.com/products/nasa-graphics-standards-manual — (viewed) Spec-sheet grids, title blocks and dimensioned application drawings at full-page scale.
4. Google Patents drawings (any US utility patent, e.g. Apple US D558,758) — https://patents.google.com — (not viewed) Black line on white, "FIG. 3", reference numerals with leader lines, and standard hatch conventions. This is the light-mode model.
5. ISO 3098 / technical lettering — https://en.wikipedia.org/wiki/Technical_lettering — (not viewed) Single-stroke, uniform-weight lettering, slightly condensed, uppercase, set with a stencil or template. It is not a bold grotesk.
6. Technical-drawing dimensioning example — https://commons.wikimedia.org/wiki/File:AcotacionTecnico.svg — (not viewed) Arrowheads, extension lines with gaps and centre lines in chain dash. The line-type hierarchy *is* the visual.
7. Charles & Ray Eames, office drawings / Eames Lounge patent — https://www.eamesoffice.com — (not viewed) Construction drawings as finished graphic art: exploded views and multi-view orthographics.
8. Tom Sachs, Space Program — https://www.tomsachs.com — (not viewed) Engineering-document styling (title blocks, revision tables) as a brand system across print and objects.

### Kill list
- **The teal ground.**
  - `js/aesthetics/blueprint.js:59-66` picks "the hue nearest 215" among primary and secondary and accepts anything within ±45°. #17BEBB (178°) passes, so the field is 178° teal (`r6-blueprint-A.png`).
  - With the green palette (C), nothing passes, so the field becomes a desaturated forest green: a chalkboard.
  - Every reference is Prussian blue. The ground is the style, and client colour must never set it.
- **Filled orange slabs:** the DESIGN tab, SAVE DIRECTION and both SAVE states in Drawing. A blueprint has no fills. The rules say "color marks only a state", then the board paints three solid orange buttons and the selected tab.
- **The headline:** Archivo/IBM Plex Sans 600–700 at 48 px. That's a SaaS heading, not engineering lettering.
- **"Contour lines" and "Wiring" patterns** (`fit.js:186-187`, `flow` and `rods`). These are topographic and organic squiggles: cartography and botany, not engineering.
- **The cover band** (`modulargrid 'Drafting grid'` as suite[0]): random rectangles, half-circles and an X along the cover bottom read as a kid's construction set (`dk/blueprint-cover.png`).
- **The hero drawing at about 200 × 200 px**, occupying the right ~40% of the hero at 20% density. On the deck cover it shrinks to about 100 px in a 1280 slide (`dk/blueprint-cover.png`). Dead.

### Gaps (ranked)
1. **Ground colour.** **High.** Refs: always Prussian blue. Ours: a client-derived teal or green.
2. **Line work is the content.** **High.**
   - Refs: the drawing fills the sheet: multiple views (front / side / iso), section hatching, a dimension chain, centre lines, and a revision table.
   - Ours: one oblique extrusion of the brand initial with three callouts and two dimensions. Detail density is about a tenth of a real sheet.
3. **Line hierarchy.** **High.**
   - Refs: a strict line-type set (thick visible 0.7 mm, thin dimension 0.35 mm, dashed hidden, chain centre).
   - Ours: card borders, grid and drawing are all 1px of similar opacity, so nothing is visible versus hidden. The CTA "corner ticks" in yellow are costume.
4. **Type.** **Medium.**
   - Refs: single-stroke template lettering.
   - Ours: Plex Mono body (fine), but a bold grotesk headline. Mono body text at 14 px for paragraphs is also tiring and reads as a terminal.
5. **Phone.** **Medium.** The headline is 24 px, the drawing about 300 px wide with 7 px callouts, and the title block stacked as a list. It's a squashed desktop.

### Distinctness
- **Nearest:** micrographics and industrial-device.
- **Micrographics:** close in mechanism, with callouts, a title block, mono caps and spec annotations. Today blueprint is separated only by its dark teal field. If the field were blue and the drawing filled the sheet they would separate, because micrographics is tiny print on white and blueprint is a full sheet in reverse.
- **Industrial Device:** shares the ①②③ callout device. One of them must give it up, and blueprint has the stronger claim.

### Fixes (ranked)
1. **TOP: fix the ground.** Replace `canvas(b)` in `js/aesthetics/blueprint.js:58-66` with a fixed Prussian blue that the client can only nudge:
   - `return b.hslToHex(218, 62, 24)` (≈ `#173D63`). Optionally allow ±8° of hue toward the brand's bluest hue if it falls within 200–235°.
   - Never use teal or green.
   - Grid: minor `rgba(255,255,255,.08)` every 8 px, major `.16` every 40 px.
2. **TOP: no fills.**
   - The CTA, selected tab and SAVE states become white 1.5px outlines with white text. The selected state is a *double* outline (1.5px + 1px at 3px offset), plus a hatched fill (`repeating-linear-gradient(45deg, rgba(255,255,255,.35) 0 1px, transparent 1px 6px)`).
   - The client primary appears only as one revision cloud or one highlight dimension (≤2% of the board).
   - Change `Filled CTA` / `Selected tab` in `js/aesthetics/blueprint.js:183-184` and the matching CSS.
3. **TOP: the drawing fills the hero.**
   - The art becomes a full sheet with a front elevation, a side section with 45° hatching, the existing isometric view, and an overall dimension chain. Label them "VIEW A / SECTION B-B / DETAIL C (2:1)".
   - Draw it at 100% hero width, not a column. The headline goes into the title block, bottom right, as the drawing's TITLE field.
   - Use line types `stroke-width` 1.6 (visible), 0.8 (dimension), `stroke-dasharray: 4 3` (hidden) and `10 3 2 3` (centre).
4. **Headline:** use a single-stroke technical face. `'Osifont'` (ISO 3098; not on Google Fonts, so self-host) is first choice. Failing that, set `'IBM Plex Mono'` 500 uppercase at `clamp(40px, 6cqw, 72px)` with tracking 0.04em, or `'Share Tech Mono'`. Drop Archivo and Big Shoulders from `js/aesthetic-meta.js:230-238` picks.
5. **Patterns** (`js/patterns/fit.js:182-189`).
   - Remove `flow 'Contour lines'` and `rods 'Wiring'`.
   - Add `glyphgrid` with `{ glyphs: 'crosses' }` as registration marks (already there as Survey marks, so keep it), a hatch family (45° 1px at 6 px pitch) and a `modulargrid 'Title blocks'` in line style with `merge: 0.2`.
   - Lead the deck with the hatch, not the "construction kit" drafting grid.
6. **Light mode (B):** make it a patent drawing. Black line on white, `FIG. 1` labels, reference numerals 10/12/14 with curved leaders, and no grid at all. Today B is the dark board inverted onto a beige grid.
7. **Phone:** headline `clamp(34px, 10cqw, 44px)`. Show one view of the drawing cropped to fill the width, with callouts at 9 px minimum.

### Keep
- The title block (project / title / scale / sheet / date / ref) and "Bill of materials" as the In-use list. Those are the right objects.
- The `126.0` dimension under the headline is a good idea at the wrong scale. Make it a real dimension of a real object.

### Deck
- **Cover:** a 100 px drawing in a 1280 slide, plus a construction-kit band. The worst cover of my six.
- **02 Principles** says "1px white line work on a blue field" on a teal field. The deck contradicts itself.
- **05 Interface:** three filled orange SAVE slabs at full slide width. That breaks the deck's own rule 3.
- **06 Material:** the same small M drawing again.
- **07 Patterns:** Wiring and Contour lines are off-key, and Routed traces is a light-on-light muddle.
- **08 / 09:** dead.

---

## 4. Religious Futurism — 4/10 · Rework

**Better glass than last round, but it is still RGB noise in ogive cut-outs. The one interactive object (the CTA) is illegible, and the deck leads with a pixel-arcade pattern that reads as a Navajo rug.**

### References
1. Gerhard Richter, Cologne Cathedral Window (2007) — https://en.wikipedia.org/wiki/Cologne_Cathedral_Window — (viewed, night photo) 11,263 squares in 72 colours, set inside *Gothic tracery*. The tracery and mullions give the noise architecture, and the field is mostly cool and mid-grey.
2. Sainte-Chapelle, upper chapel — https://en.wikipedia.org/wiki/Sainte-Chapelle — (viewed) One dominant key (deep blue) with red as counterpoint, gold ribs, and glass as the walls, not as objects in the wall.
3. Dune (2021) title lettering — https://dejareviewer.com/2023/12/12/i-love-the-way-they-did-the-dune-2021-title-font/ — (not viewed this round) Monoline ultra-wide caps; the gaps weigh as much as the strokes.
4. Dune: Part Two posters — https://www.imdb.com/title/tt15239678/mediaindex/ — (not viewed) Tiny figure, monumental mass, two colours.
5. Pierre Soulages, Conques Abbey windows — https://en.wikipedia.org/wiki/Conques_Abbey — (not viewed) Near-colourless translucent glass; light as the ornament.
6. Tadao Ando, Church of the Light — https://en.wikipedia.org/wiki/Church_of_the_Light — (not viewed) One cut of light in a dark mass.
7. Blade Runner 2049, Wallace Corporation interiors — https://en.wikipedia.org/wiki/Blade_Runner_2049 — (not viewed) Caustic light on monumental planes, one figure, no chrome.
8. ECM Records, Arvo Pärt *Tabula Rasa* — https://www.ecmrecords.com — (not viewed) Liturgical quiet in type: small caps, huge margins.
9. Hagia Sophia Deësis mosaic — https://en.wikipedia.org/wiki/Hagia_Sophia — (not viewed) Gold ground as tilted tesserae that flicker.

### Kill list
- **The CTA "SAVE DIRECTION"** (`rf-ui.png`):
  - The label is dark serif caps on mid-orange glass, with lead lines every 22 px running *through the letters*, plus a text-shadow halo (`css/aesthetics/religious-futurism.css:138-145`).
  - At board scale it is the least legible primary action of my six.
- **The orb triad Dormant / Lit / Consecrated** (`js/aesthetics/religious-futurism.js:68`). This is the game-UI orb, shared with Cybersigilism and Biomechanical Gothic.
- **Arched palette swatches.** They are neo-deco's swatches (`neigh.png`, bottom right: neo-deco uses the identical arch-topped chips on a dark ground with gold hairlines).
- **Arched "tombstone" tabs** (DESIGN / BUILD / LAUNCH) and the arched card heads. That is three arch motifs in one viewport.
- **The deck's lead pattern `bloomgrid 'Pixel bloom'`** (`js/patterns/fit.js:247`). It is pixel-arcade's pattern (line 170) with `calm` 0.7 instead of 0.5. It is the cover band, the material slide hero and the closing strip, and it reads as a woven textile or a retro-game ring.
- **"Apse and pipes" = groovy rainbow (`arcrise`), "Rose windows" = sunbursts, "Veined stone" = acid marble** (`dk/religious-futurism-patterns.png`). Four of the six patterns belong to other aesthetics.
- **Mixed headline weights in the deck**: "Gold is a rim, never fill" is set in Unbounded *bold* next to the hairline-wide display. Unbounded bold is y2k-chrome's and acid-graphics' voice.

### Gaps (ranked)
1. **Glass as light, not as tiles.** **High.**
   - Refs: Richter's squares are set in tracery, the field is cool-dominant, and colour falls on stone.
   - Ours: `cell = 8` (`js/aesthetics/religious-futurism.js:141`) has improved the pane density, but every window is an equal-weight RGB scatter with no mullions inside the lancets and no dominant key.
   - On the green palette (C) the windows become a green CRT. In light mode (B) the glass sits on cream with no light behind it, which is physically wrong: glass only glows against dark.
2. **Monumentality.** **High.**
   - Refs: one huge form and a tiny human.
   - Ours: five symmetric windows at equal height steps, centred under a centred headline. It is a symmetrical altarpiece diagram, not a space. Nothing is cropped by the frame.
3. **Type.** **Medium.**
   - Unbounded Light at 0.4em tracking is the right *move* (the Dune 2021 spacing), but Unbounded is a rounded geometric. Its "G", "S" and "D" are soft, so the hairline-wide reads as y2k, not liturgical.
   - The monoline references are squarer: Michroma, or Syncopate at weight 400.
4. **UI.** **Medium.** Every component is an arch. The style has one idea and applies it to everything, which is costume.
5. **Phone.** **Low.** It is reasonable: the windows crop off both edges, which is accidentally the most monumental view of the six.

### Distinctness
- **Nearest:** biomechanical-gothic and neo-deco.
- **Biomechanical Gothic:** siblings. Both have a dark ground, arch-headed cards, Roman-numeral section labels (I, II, III), the orb triad, an inscriptional serif in the pick list (Marcellus and Cinzel are in *both* `js/aesthetic-meta.js` entries) and a central glowing point in the hero.
- **Neo-deco:** siblings in the palette row (arched swatches) and the gold hairline dividers with a centred diamond node.
- **What must move:** Religious Futurism owns *light and glass*. Drop the arch from every UI component. Cards become rectangular panes with lead-line borders; the arch survives only in the hero.

### Fixes (ranked)
1. **TOP: CTA legibility.**
   - Remove the lead-line gradient layer from `.ab-cta` (`css/aesthetics/religious-futurism.css:141`, the first `repeating-linear-gradient`).
   - Set the label in `#F6F1E6` on a deep glass, `mix(primary, #0D0B0B, .55)`, with a 1px gold rim and a single 2px gold inner rule. Contrast must be at least 7:1.
   - The "lit" effect goes in a 1px top highlight `inset 0 1px 0 rgba(255,255,255,.35)`, not in lines through the text.
2. **TOP: replace the lead pattern and three borrowed ones** (`js/patterns/fit.js:246-253`).
   - Lead with a quiet `gradpanes` (`{ rows: 6, cols: 9, gap: 0.6, steps: 0, grain: 0.35 }`, tone 0.45). As a band it reads as clerestory glass.
   - Drop `bloomgrid`, `arcrise` and `marble`.
   - Add a `slipgrid 'Clerestory'` (`{ cell: 1.2, slip: 0, streak: 0.4, gutter: 0.25, scatter: 0.6 }`) and a light-fall pattern: a `flow` with `{ field: 'waves', strands: 2, gap: 4, weight: 0.4 }` at tone 0.35 for caustics.
3. **TOP: glass with a dominant key and tracery.** In `art()` (`js/aesthetics/religious-futurism.js` ~141-280):
   - Set 65% of panes to cool neutrals (`#3B4A5E`, `#56627A`, `#7A8496`, `#A7A9AE`, smoke), 25% to the brand secondary darkened, and ≤10% to the primary and accent.
   - Add 2 mullions per lancet plus one horizontal saddle bar every 6 rows, in `lead` at 2.2 units.
   - Make the centre window 2.2× the height of the flanking ones and crop its top by the frame.
   - In light mode, render the windows *as seen from outside*: dark glass, with no colour except the lit oculus.
4. **De-arch the UI.**
   - Tabs become a flat row with a 1px gold underline on the active tab.
   - Cards become rectangular, with a 1px gold border and one 2px lead rule 6px inside.
   - Palette chips become tall narrow lancet *panes* (36 × 120 px rectangles with one saddle bar), not arches.
   - Replace the orb triad with three window panes going dark → partly lit → fully lit, square and leaded.
   - Changes go in `css/aesthetics/religious-futurism.css` (card head, seg, swatch rules) and `labels.statesKind` in the JS.
5. **Display face:** reorder pairings in `js/aesthetic-meta.js:317-326` to `['Michroma', 'EB Garamond']` or `['Syncopate', 'EB Garamond']` first, with Unbounded last. Drop Cinzel and Marcellus from picks entirely; Biomechanical Gothic owns those.
6. **Highlight word:** "ALIVE" in `#D9B76A` gold-leaf at 0.5 opacity with a 1px gold underline is fine. The underline currently runs to "ALIVE"'s right edge plus 30 px, so trim it to the word width.

### Keep
- The tracked hairline headline at 0.4em, the canonical-hours footer (MATINS · LAUDS · VESPERS · COMPLINE), the beam projection on the floor, and the rosary-bead progress in "In use".
- The hero on the phone, cropped edge to edge.

### Deck
- **Cover:** the windows overlap the headline baseline glow. This is the best cover of my six for atmosphere, so keep it.
- **06 Material** is a 450 px pixel-arcade ring. Replace it with a 1:1 crop of one lancet at 4× showing the lead, saddle bars and glass variation.
- **07 Patterns:** four of six are off-key.
- **Closing strip:** the pixel textile again.
- **08 / 09:** dead.

---

## 5. Cybersigilism — 4/10 · Rework

**The hero is a glowing chrome moth on two guide lines, the headline is a pirate-flag blackletter, and the CTA is y2k-chrome's button. The thing the style is actually made of (hundreds of needle-thin tapering hairlines) is nowhere on the board.**

### References
1. Are.na search "cybersigilism" — https://www.are.na/search/cybersigilism — (viewed) Two real modes:
   - (a) a dense sprawl of hundreds of 0.3–1 px ash-grey strokes that branch, barb and taper, mostly asymmetric, on paper or skin
   - (b) a solid black bladed glyph, mirrored, with razor points and no glow
2. Are.na "Illuminated Cybersigilism" channel (same search) — (viewed, thumbnail) Thorny hairline set inside medieval illuminated borders. The density is the ornament.
3. CO:CREATE, "8 cybersigilism artists" — https://www.cocreate.com — (not viewed: TLS error) Prior-round summary: DanyKim and Sadan, with fine-line tattoo flash on skin.
4. Aingelblood, *Unholy Seraphim* — https://www.instagram.com/aingelblood — (not viewed) Asymmetric thorn halos in one weight of hairline.
5. Underblast — https://underblast.co — (not viewed) Cyber-tribal chrome type in the y2k register. This is the version to *avoid* confusing with y2k-chrome.
6. Balenciaga / Demna metal-band logotype era — https://www.balenciaga.com — (not viewed) Spiked custom lettering drawn as one-offs, never set in a stock blackletter.
7. Albrecht Dürer, engravings (e.g. *Melencolia I*) — https://en.wikipedia.org/wiki/Melencolia_I — (not viewed) Swelling-tapering burin lines; the line itself carries value.
8. Book of Kells, carpet pages — https://en.wikipedia.org/wiki/Book_of_Kells — (not viewed) Interlace density across the whole page.

### Kill list
- **The hero stroke quality** (`hero-cybersigilism.png`). The strokes are uniform 3–4 px tubes with round ends, blurred by a 2.6 px glow filter (`js/aesthetics/cybersigilism.js:261` `feGaussianBlur stdDeviation="2.6"`). They read as neon tubing or a chrome insect. The code comment says "tapers to a needle", but the render doesn't.
- **The two horizontal lines through the sigil** (y ≈ 530 and 580 in `A`). They read as a rendering mistake or a scanner bar.
- **Pirata One as the headline.** It is a heavy rotunda-ish blackletter with a "pirate tavern" voice, the costume-store metal the BG rules warn about. Cybersigilism lettering is custom, thin and spiked; a stock fat blackletter is the opposite.
- **The chrome gradient CTA** (`.ab-cta { background: var(--cs-silver) }`, `css/aesthetics/cybersigilism.css:123-125`). It is y2k-chrome's CTA (`neigh.png`).
- **The sunburst "Etched / Lit / Bound" triad** (`cs-ui`). This is the shared orb control with spikes added.
- **"Mirrored glyphs" (`kaleidopix`)** reads as a Fair-Isle sweater or rug (`dk/cybersigilism-patterns.png`). **"Thorn sigils"** is a backgammon board of sawtooth triangles. **"Etched marks"** is a dot-matrix display.
- **Centred everything.** The headline, sigil, footer and nav ornaments are all centred. The style's energy is asymmetric sprawl.

### Gaps (ranked)
1. **Line.** **High.**
   - Refs: hundreds of strokes, each tapering from about 1.2 px to 0, with barbs off barbs.
   - Ours: about 30 strokes of uniform weight. The density is about a tenth and the taper is near zero at board scale.
2. **Two modes, neither delivered.** **High.**
   - Refs: either a hairline sprawl (light, airy, grey) or a solid black blade glyph (heavy, crisp, no glow).
   - Ours: a third, wrong thing: glowing chrome tubes.
3. **Type voice.** **High.**
   - Refs: custom thin spiked display lettering, or a clean grotesk next to the art.
   - Ours: Pirata One bold for every heading on board and deck ("Curved blades, mirrored", "Projects"). It's merely "a blackletter".
4. **Ground.** **Medium.** Real cybersigil work lives on skin and paper as much as on black. Our light mode (B) is a pale blue-grey and the sigil turns into a dark moth, so the style has no paper identity.
5. **Detail density.** **Medium.** The board below the hero is the shared skeleton with ornamental dividers. There is no field of fine line anywhere except the hero.

### Distinctness
- **Nearest:** biomechanical-gothic and y2k-chrome.
- **Biomechanical Gothic:** siblings on the dark ground, ornamental hairline dividers with nodes, the orb triad and the centred hero. Cybersigilism must go *thin, grey, asymmetric and white-ground capable*; Biomechanical Gothic stays heavy, brown and architectural.
- **Y2k-chrome:** they share the chrome-gradient CTA and the glow. Cybersigilism must drop chrome entirely. Silver becomes the *ink colour* of a hairline (`#B9BEC6` on black, `#4A4F57` on paper), not a reflective material.

### Fixes (ranked)
1. **TOP: redraw the sigil as tapering filled hairline.**
   - In `art()` (`js/aesthetics/cybersigilism.js` ~200-280), cap blade width at `wMax = 1.6` units at 800 viewBox width, so the needles go to 0. Generate three generations of barbs (each child 0.55× length, 0.6× width, at 25–55°), giving at least 180 strokes.
   - Break perfect symmetry: mirror the main skeleton, but seed the barbs separately per side.
   - Remove the glow filter (`stdDeviation 2.6` → none). Replace it with a 0.4 px `feGaussianBlur` at most for antialias softness.
   - Remove the two horizontal guide lines.
2. **TOP: replace the headline face.**
   - Make the first pairing in `js/aesthetic-meta.js:350-358` `['Grenze Gotisch', 'Inter']` at weight 300 (thin, spiky, condensed). Better still, set the headline in Inter Tight 300 at `clamp(44px, 6cqw, 84px)`, tracking −0.03em, and let the one sigil word ("alive") be hand-drawn SVG thorns.
   - Remove Pirata One from picks. Its weight and swash read as pirate or tavern.
3. **TOP: kill the chrome CTA.**
   - `.ab-cta` becomes black with a 1px `#B9BEC6` border, a chamfered corner (keep `--cs-chamfer`) and a 0.75px thorn flourish growing out of the top-right corner (an SVG `::after`).
   - Hover lengthens the thorn. There is no gradient anywhere.
4. **A paper mode.** Make light mode (B) bone paper `#EEEBE4` with `#2A2A2E` hairline at 0.75 px, no glow and no silver ramp. This is the tattoo-flash sheet and gives the aesthetic a second, true identity.
5. **Patterns** (`js/patterns/fit.js:270-277`).
   - Drop `kaleidopix`, `glyphgrid 'Etched marks'` and `specimens 'Thorn sigils'`.
   - Use `rods 'Thorn rods'` (already the best) as lead, with `thick: 0.35, fork: 0.9, length: 3`.
   - Add `flow` with `{ field: 'swirl', strands: 7, gap: 1.1, weight: 0.25 }` as "Hairline field", plus a sparse `stipple` at `dot: 0.35`.
   - Every entry should be ≤0.5 px of ink at 1×.
6. **States:** replace the sunburst triad with three versions of one small sigil: outline only → hairline filled → barbed. Set `statesKind: 'button'` or a new `'glyph'` kind (`js/aesthetics/cybersigilism.js:118`).
7. **Composition:** offset the sigil to the right two-thirds of the hero, let it bleed off the top and right edges, and left-align the headline.

### Keep
- The corner-bracket thorns on the UI cards, the progress "needle" with a diamond head in "In use", and "Sharp lines, kept apart." as a line.
- The palette chips as black slabs with a coloured 1px glow-edge. That is the right way to show client colour as cold light.

### Deck
- **Cover:** the sigil fills the right half (good scale), but it is the chrome moth. Headline at 120 px Pirata (wrong voice).
- **06 Material:** a small sigil centred in black with 60% empty slide. It should be a 2× crop of the hairline barbs.
- **07 Patterns:** three of six are off-key.
- **08 / 09:** dead. Slide 08's Pirata One "Projects" heading shows the stock-blackletter problem at its worst.

---

## 6. Biomechanical Gothic — 5/10 · Refine

**The nave has real depth and fog, the best atmosphere of the six. But it is nine thin pearl necklaces receding to an orange dot, not Giger's fused, crushing rib vault. The UI under it is cream pills and three glowing marbles.**

### References
1. Giger Bar, Gruyères — https://commons.wikimedia.org/wiki/File:Giger_Bar_Gruyeres_Ben_W_Bell_30_5_2005.jpg — (viewed) The vault is ribs packed shoulder to shoulder with no gap. Every rib is a thick column of vertebrae, the stone is bone-grey (not brown), and the chairs are cast from the same material. Density and mass are the whole effect.
2. H. R. Giger — https://en.wikipedia.org/wiki/H._R._Giger — (viewed, text) Airbrushed monochrome, tubes fused into flesh, and the *Necronom* series.
3. Scorn (Ebb Software, 2022) — https://store.steampowered.com/app/698670/Scorn/ — (viewed) Fleshy stone in green-grey and ochre, monumental organic architecture and fog.
4. Zdzisław Beksiński — https://en.wikipedia.org/wiki/Zdzis%C5%82aw_Beksi%C5%84ski — (not viewed) Fog, dusk palette, and cathedral-scale decay.
5. Tsutomu Nihei, *BLAME!* — https://en.wikipedia.org/wiki/Blame! — (not viewed) Megastructure with a tiny figure, cables and conduits as architecture.
6. Sedlec Ossuary — https://en.wikipedia.org/wiki/Sedlec_Ossuary — (not viewed) Bones as *ornament system*: repeated, garlanded and chandelier-scale.
7. *Alien* (1979), the derelict ship — https://en.wikipedia.org/wiki/Alien_(film) — (not viewed) Ribbed corridors where the rhythm is irregular and grown.
8. Iris van Herpen — https://www.irisvanherpen.com — (not viewed) Grown structure as a finished luxury surface.
9. Gaudí, Sagrada Família nave columns — https://en.wikipedia.org/wiki/Sagrada_Fam%C3%ADlia — (not viewed) Branching bone-like columns, organic vaulting at monumental scale.

### Kill list
- **Pills:** the cream "SAVE DIRECTION" pill (`border-radius: 999px`, `css/aesthetics/biomechanical-gothic.css:167`), the "USE RECOMMENDED FONTS" pill and the pill tabs. That's the SaaS template tell, in bone colour.
- **Glowing marble palette swatches** (`A`, palette row). They read as gumballs and christmas baubles, not cast material.
- **The Dormant / Breathing / Awake orb triad.** This is the shared orb control again.
- **The brown-sepia ground with orange glow.** Giger's work is grey-green-black airbrush, and Scorn is ochre-green. The warm palette makes this read as a "steampunk tunnel". The C (green) version is *closer* to Giger than the recommended palette.
- **Patterns "Ossicles"** (cow spots), **"Cast contours"** (camo), **"Spore colony"** (lava lamp) and **"Bone grain"** (acid marble) (`dk/biomechanical-gothic-patterns.png`). Four of six read as other aesthetics.
- **Marcellus as headline.** It is the RF/neo-deco inscriptional voice (Marcellus and Cinzel are in Religious Futurism's picks too). There is nothing biomechanical about a Trajan-derived roman.

### Gaps (ranked)
1. **Density and mass.** **High.**
   - Refs (Giger Bar): ribs touch, and each rib is about 1/12 of the vault width.
   - Ours: nine arches with large gaps of empty brown between them. Each rib is a single bead chain about 1/60 of the width, with a thin orange "cord" line. It reads as a necklace tunnel or stargate.
2. **Material.** **High.**
   - Refs: one cast, stone-bone material with airbrush gradients and wet specular highlights.
   - Ours: flat brown walls and beads with a single highlight. There is no tube, no hose and no fused machine part. "Biomechanical" is missing its *mechanical* half.
3. **UI.** **Medium.**
   - Refs: furniture and fixtures cast from the vault material.
   - Ours: arch-topped cards with tick rims (good idea), but the content inside is generic dark-mode SaaS (pill tabs, a black text field, a cream pill CTA).
4. **Palette logic.** **Medium.** The bone and cast tokens are good, but the client primary is the glowing core in the tunnel and the orange progress fill. Two oranges in one board read as "warm tunnel", not sinew.
5. **Phone.** **Low.** The hero image at 350 px loses all detail and the pill CTA dominates.

### Distinctness
- **Nearest:** religious-futurism and cybersigilism.
- **Religious Futurism:** siblings (see RF: arch cards, Roman numerals, orb triad, shared inscriptional serifs, central glow). Biomechanical Gothic must own *mass, tube and bone*. It should keep the rib-arch card (its own motif) while Religious Futurism drops all UI arches.
- **Cybersigilism:** siblings on the dark ground and node dividers. Cybersigilism goes thin and paper; Biomechanical Gothic goes heavy and cast.

### Fixes (ranked)
1. **TOP: pack the vault.** In `art()` (`js/aesthetics/biomechanical-gothic.js:108-190`):
   - Go from 9 to 22 arches with the spacing ratio tightened so neighbouring ribs touch (gap ≤ 0.15 × rib thickness).
   - Rib thickness should be 3.5× the current bead size, and each vertebra a 3-part body (centrum plus two processes) instead of one bead.
   - Add two tube runs, 6–8 parallel hoses at 0.8 units, along each wall from foreground to vanishing point, fused into the ribs every third arch. That supplies the "mechanical".
2. **TOP: cold, cast palette.**
   - Ground `#121412`, cast `#2A2D2A` → `#5C605A` airbrush ramp, bone `#C9C3B4`.
   - The client primary appears *only* as sinew: hsl(h, s × 0.5, 30%) at ≤3% of the board. Its saturation is currently ×0.75 at a 42% lightness cap (`js/aesthetics/biomechanical-gothic.js:62`), which is still too orange with the warm palette. Use ×0.5 and a 30% cap.
   - The tunnel core becomes a pale bone light, not client orange.
3. **TOP: kill the pills.**
   - `.ab-cta` (`css/aesthetics/biomechanical-gothic.css:166-168`) becomes a vertebra: a 6 px radius body with two 10 px tapered lateral processes (`clip-path: polygon(...)`), bone fill and ink text.
   - Tabs become three vertebrae on a spinal line.
   - The fonts button becomes a plain text link with a 1px bone underline.
4. **Palette swatches:** cast-material tiles, 56 × 72 px rounded-top ossicles with a 3px recessed rim (`box-shadow: inset 0 2px 3px rgba(0,0,0,.6), inset 0 -1px 0 rgba(255,255,255,.08)`), not glowing marbles.
5. **States:** replace the orb triad with a single valve or sphincter drawn three ways: closed (5 folds meeting), partly open, open with sinew glow. Use `statesKind: 'button'` or a new kind (`js/aesthetics/biomechanical-gothic.js:42`).
6. **Patterns** (`js/patterns/fit.js:294-301`).
   - Keep `waves 'Tubing runs'` as lead. It is the one pattern that is unmistakably this style.
   - Drop `pebbles`, `sonar`, `colony` and `marble`.
   - Add `rods` (`{ density: 1.6, thick: 1.4, length: 6, fork: 0.2, slip: 0.1, second: 'ground' }`) as "Ribcage", plus a `tissue` at `veins: 0.9, loose: 0.2` as "Cast lattice".
7. **Headline face:** move to `['Cormorant Garamond', 'Spectral']` at weight 300, all-caps, tracking 0.06em, or Italiana as the first pick. Either way, keep Marcellus and Cinzel out so they don't overlap with Religious Futurism (`js/aesthetic-meta.js:382-391`).

### Keep
- The one-point nave with fog thickening by depth and the vertebral column on the floor. These are the best-rendered pieces of hero art in my six.
- The rib-arch card heads with tick rims, "IT GREW THIS WAY.", the MMXXVI footer and the ribbed tick rule.
- The ribbed draped surface on deck slide 06 (Material, `waves`). It's the deck's best single image across my six.

### Deck
- **Cover:** the nave in a framed plate on the right half, with the headline left at about 70 px. It is the most complete cover of my six.
- **06 Material:** the corrugated tubing render is strong, so keep it.
- **07 Patterns:** four of six are off-key.
- **05 Interface:** the cream pill CTA is the largest object on the slide (fix 3).
- **08 / 09:** dead.

---

## Scores

| Aesthetic | Score | Verdict | Biggest single problem |
|---|---|---|---|
| Industrial Device | 5 | Refine | It's a product diagram in a card, with micrographics' callouts |
| Industrial Hazard | 5 | Refine | Safety colours bend to the client, and there's no yellow field |
| Blueprint | 4 | Rework | The ground is client teal, the UI has filled orange buttons, and the drawing is tiny |
| Religious Futurism | 4 | Rework | The CTA is illegible, it leads with a pixel-arcade pattern, and every UI part is an arch |
| Cybersigilism | 4 | Rework | Glowing chrome tubes instead of tapering hairline, a pirate blackletter, a y2k CTA |
| Biomechanical Gothic | 5 | Refine | A sparse pearl tunnel instead of a packed vault, plus pills and marbles |

None of these scores goes above 5. None of the six stands next to its references yet. The closest single objects are the Industrial Hazard lockout panel, the Biomechanical Gothic nave and the Industrial Device keybed, and none of those is ready for a portfolio wall.

---

## Fix log (fx66)

Worker fx66, 2026-10-11. Files changed: `js/aesthetics/{industrial-device,industrial-hazard,blueprint,religious-futurism,cybersigilism,biomechanical-gothic}.js` and the matching `css/aesthetics/*.css`. Nothing shared was edited. Font-pairing, font-weight and pattern-suite changes are listed for the coordinator under "Shared changes requested" in the fx66 return. The shots below were taken with those pairings simulated in the page (`scratchpad/adv/fx66/pre.js`). Shots: `scratchpad/adv/fx66/sheet-fx66-<key>.png` (boards), `sheet-deck-fin-<key>.png` and `sheet-deck-fin-<key>-o.png` (decks), `covers.png`.

### Industrial Device
- **Hero (top 1):** The hero is now product-first, with columns at .55fr / 1.45fr. The device bleeds off the board's right edge and its body has square right corners, so it no longer sits in a card. The headline is lowercase at `clamp(30px, 3.6cqw, 44px)`, weight 400, with no highlight block.
- **Callouts (top 2):** The ①②③ callouts, leader lines and legend row are deleted. Legends are now printed on the hardware in 6–8px lowercase Azeret Mono: `mode · a.01` over the screen, `vol` and 0/5/10 at the knob, tune/mix/fx/lvl under the encoders, loop/play/rec/stop under the transport keys, seq…shift under the function keys, and `tp-01 · field · <brand>` as the model line. The circled section numbers are also gone, replaced by plain mono.
- **Colour code (top 3):** The four OP-1 encoder caps are fixed at `#2B7BE4 / #2FB15C / #F2F2EE / primary`. The keys come in white and graphite families with one primary main key, and the knob pointer is primary. The OLED is single-ink pixels, and the secondary no longer appears in the meter. The client accent key, the PWR/REC/PLY lamp row and every LED glow are removed.
- **Radii:** Cards use 8px and keys 4px. Cards no longer carry the light-edge inset; only the hardware does.
- **Phone:** The headline is `clamp(30px, 9cqw, 40px)`. The device is full-bleed and cropped to the knob and keys rather than scaled down.
- **Detail:** The device gains a 16-step keybed, a 48-tick knurled ring, the encoder row, a six-key function block and the model line.
- **Structure:** The palette uses `strips` and the sections use `asym`. The meter bar's CSS mask is replaced by a gradient so it exports.
- **Deck:** The cover is product-first (`coverDisplay` 0.6) and the Material slide is a 1.9× crop of the pads and keybed. The CMF chips and lead pattern swap is a shared request.

### Industrial Hazard
- **Ladder (top 1):** `sig = hex => hex` and the stripe is always `#F2C500`. The client primary paints only the nameplate and the slab key; it no longer paints the numeral.
- **Yellow field (top 2):** The hero is a full-bleed `#F2C500` field framed top and bottom by 14px tape at 45°. The headline is black at `clamp(52px, 9cqw, 132px)` with one DANGER-red word. The deck cover and the Principles lead carry the same field, and the Principles line is set at about 108px.
- **Stencil (top 3):** The zone numeral "07" is now 2× its old size, painted safety yellow, cut by drawn stencil bridges, and overlapping the nameplate edge. Section numbers are yellow on black with a stencil bridge. A real stencil webfont is requested as optional.
- **Lamps:** PWR is white, RUN `#00A651`, ALM `#F2C500` and LCK red-off. No glow appears anywhere, and the client secondary never lights a lamp.
- **ISO sign:** The Interlocks module header carries a 72px ISO 7010 warning triangle.
- **Light mode:** The board is 100% `#F2C500` with `#111` steel modules and white legends, carried by `--ab-hz-mod-ink`.
- **Patterns:** These are a shared request.

### Blueprint
- **Ground (top 1):** The canvas is a fixed `hsl(218, 62%, 24%)`, nudged by at most ±8° when a brand hue sits in 200–235°. The grid is .08 every 8px and .16 every 40px. Teal or green can no longer reach the ground.
- **No fills (top 2):** The CTA, tabs, states and switch are 1.5px white outlines. Selected or active states get a double outline over 45° hatching. The primary appears only as the revision cloud and the revision triangle. The CTA corner ticks are removed.
- **Sheet (top 3):** The art is now a full sheet (480×300): VIEW A front elevation with a dimension chain and cutting plane, SECTION B-B hatched, VIEW C oblique with A/B/C callouts, DETAIL D at 2:1, notes, a third-angle symbol, a revision table and zone marks. Line types are 1.6 / 0.8 / `4 3` / `10 3 2 3`. The headline sits in the sheet's TITLE block, bottom right.
- **Headline:** Single-stroke mono caps, weight 500, tracking .04em. The pairing change is a shared request.
- **Light mode:** A patent sheet: white, black line, no grid, FIG. 1–4, reference numerals 10/12/14/16 with curved leaders, and a "U.S. Patent · Sheet 1 of 1" header.
- **Phone:** The headline is `clamp(30px, 10cqw, 44px)`. The drawing is cropped to VIEW A plus SECTION B-B, with labels at 9px or more.
- **Deck:** The cover is the sheet with its title block, and the construction-kit band is hidden on the cover. The Material slide is the oblique view plus detail.
- **Patterns:** These are a shared request.

### Religious Futurism
- **CTA (top 1):** The lead lines and text halo are gone. The button is deep glass, `mix(primary, #0D0B0B, .55)` darkened until `#F6F1E6` reaches at least 7:1. It has a 1px gold rim, a 2px gold inner rule and a 1px top highlight.
- **Patterns (top 2):** These are a shared request. With them, the deck Material slide stops using the pattern stage: `materialStage` is removed and the slide is now a 3.6× crop of the centre lancet.
- **Glass (top 3):** 65% of the panes are fixed cool neutrals (`#3B4A5E #56627A #7A8496 #A7A9AE` and smoke), 25% are the secondary darkened, and the primary and accent together are at most 10%. Each lancet has two mullions, with a 2.2-unit saddle bar every 6 rows. The centre lancet is 2.2× its flanks and its top is cropped by the frame. In light mode the windows are seen from outside: dark glass, with only the oculus lit.
- **De-arch:** Tabs are a flat row with a gold underline. Cards are rectangular with a 1px gold border and a 2px lead rule 6px inside. Swatches are 36×120 lancet panes with a saddle bar. The states are a leaded pane shown unlit, at dawn and in full light, replacing the orb. The CSS masks are removed.
- **Type:** Michroma first is a shared request. The deck headings are all weight 400.
- **Highlight:** The underline is trimmed to the glyphs, which also removes the trailing tracking.

### Cybersigilism
- **Sigil (top 1):** The sigil is rebuilt from filled needles with a maximum width of 1.6 that taper to 0. A mirrored skeleton (a spine, six wing pairs and almond cells) carries three generations of barbs, each 0.55× the length and 0.6× the width of its parent, at 25–55°. Each side is seeded separately; there are 636 strokes for "Marigold Studio". There is no glow filter (0.3 blur at most) and no guide lines.
- **Headline (top 2):** Inter Tight is set at weight 300 (falling back to 400), tracking −0.03em, `clamp(40px, 6cqw, 84px)`, left-aligned. A `headline()` hook draws hairline SVG thorns from the last word. Removing Pirata One is a shared request.
- **CTA (top 3):** The button is black with a 1px `#B9BEC6` line, one chamfered corner drawn as layered 1px gradients (no clip) and a hairline thorn out of the top-right corner that lengthens on hover. There is no gradient fill.
- **Paper mode:** Bone `#EEEBE4` with `#2A2A2E` hairline, no glow and no silver ramp.
- **States:** One small sigil drawn three ways (Etched, Inked, Barbed) as data-URI glyphs, replacing the orb and its mask.
- **Composition:** The sigil takes the right two-thirds and bleeds off the right edge and the top of the hero. The header and divider flourishes are moved to the left.
- **Deck:** On the cover the sigil fills the right half, clear of the header. The Material slide is a 2.3× crop of the barbs.
- **Patterns:** These are a shared request.

### Biomechanical Gothic
- **Vault (top 1):** 22 ribs at an even depth step. Each rib is 12.6·s thick, about 1/12 of the vault width, so neighbours touch. Every vertebra is a centrum plus two tapered processes. Two runs of seven 0.8-unit hoses run along each wall, with a bone collar fusing them into every third rib. The floor column and the fog are kept.
- **Palette (top 2):** The ground is a fixed `#121412`, with a cast ramp `#1A1C1A / #2A2D2A / #5C605A` and bone `#C9C3B4`. The sinew is `hsl(h, s×0.5, 30%)`, used in a few rib hairlines, the progress fill and the open valve. The tunnel core is pale bone light.
- **Pills (top 3):** The CTA and tabs are vertebrae, a body plus two tapered processes drawn with clip-path, with the tabs on a spinal line. The fonts button is a text link with a 1px bone underline. The status chips use a 3px radius.
- **Swatches:** 56×72 rounded-top ossicles with a 3px recessed rim, replacing the marbles.
- **States:** A five-fold valve shown closed, parting and open on sinew, replacing the orb.
- **Headline:** Cormorant at weight 300, uppercase, tracking .06em. The picks change is a shared request.
- **Distinct from Religious Futurism:** Section labels are C1 / T6 / L1 rather than Roman numerals. The divider's CSS mask is replaced by a canvas overlay so it exports.
- **Patterns:** These are a shared request. Tubing runs stays as the lead and as the Material stage.

### Verification
- `node tests/run.js`: all passed.
- `node scratchpad/t5/src-verify-p5.js`: 53 families, 0 failures, map mismatches 0.
- `node scratchpad/t5/harness.js`: 20 failures, none for these six keys. All 20 are retro-futurist, wabi-sabi, dark-academia and pirate-broadcast, which belong to other workers.
- **Gore** (4 configs × 6 keys × 10 slides): 0 issues. One Industrial Hazard light-mode state-key contrast issue was found and fixed before the final run.
- **Board contrast** (deck-gore contrast check on the board, 6 keys × warm/green × both modes): 0 issues.
- **390px:** 0 document overflow, and nothing outside the board in either mode for all six.
- **Console:** only the favicon 404.

### Self-score against the references (honest)
- **Industrial Device: 7.** It now reads as a TE product page: the product is life size and the type is tiny. It still falls short in two ways. The hardware is clean vector rather than anodised photography. The "In use" and "Controls" sections are still generic cards.
- **Industrial Hazard: 7.** The TDR yellow field, the fixed ladder and the stencil 07 all land. The stencil is drawn rather than a typeface, and the suite still lacks a real tread-plate family.
- **Blueprint: 7.** It is a real drawing sheet on Prussian blue with a patent light mode. The single-stroke lettering depends on the mono pairing request. The palette row still shows filled colour chips; that is necessary to show the colours.
- **Religious Futurism: 6.** The CTA is legible, the glass is cool-dominant and the centre lancet is monumental. The type depends on the Michroma request. The windows are still a mosaic rather than Richter-grade glass.
- **Cybersigilism: 6.** The hairline density, the taper and the paper mode are there. The sprawl still reads partly as branches rather than barbed thorns, and the mirrored skeleton keeps it emblem-like.
- **Biomechanical Gothic: 7.** The vault is packed, cold and fused with tubes. The UI below it is still fairly conventional apart from the vertebra controls.
