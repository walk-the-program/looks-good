# Round 6 harsh review: HR4, print and zine group

Reviewer: Opus adversarial creative director (read-only). Task hr4, packet rev 1.
Keys: riso-print, xerox, xerox-punk, corporate-vandalism, acid-graphics, ascii-art.
Evidence: `S/adv/r6/r6-<key>-{A,B,C,D}.png`, `sheet-r6-<key>.png`, `sheet-deck-<key>.png`, crops in `S/adv/hr4/`, reference captures in `S/adv/hr4/refs/` (contact sheets `contact.png`, `contact2.png`, `contact3.png`). S = the session scratchpad.
The live app was not needed. All six screenshot sets were present.

## Scoreboard

| Key | Score | Verdict | One sentence |
|---|---|---|---|
| riso-print | 4/10 | Rework | A friendly SaaS dashboard with grain and three rounded playing cards. No riso studio would recognise its own machine in it. |
| xerox | 4.5/10 | Rework | One good object (the lid-open black slab). Everything else is xerox-punk's paste-up kit with the lights on. |
| xerox-punk | 5.5/10 | Refine | The ransom headline is the best idea in this group, but the tiles are too polite, the wall is lorem-ipsum grey bars, and the UI below the hero is xerox again. |
| corporate-vandalism | 4/10 | Rework | MSCHF cosplay. It lifts their house marks outright, and nobody ever vandalises anything. |
| acid-graphics | 5/10 | Refine | The flyer is real. The board around it is a dark admin template, and the type is Y2K Chrome's. |
| ascii-art | 4/10 | Rework | A dark IDE theme in JetBrains Mono, with one blurry ASCII blob that doesn't read as an M. |

No board in this group would survive the Pentagram/Collins/DIA room. The two that come closest (xerox-punk's headline, acid's flyer) are hero objects. The system underneath them is the same board template every other aesthetic uses: label row, five swatches, three type columns, two cards, a three-row list.

## Cross-cutting findings (apply to all six)

1. **The print trio is not three languages.** Riso, xerox and xerox-punk share the first pattern generator: `tornbands` is slot 1 for all three (`js/patterns/fit.js:103`, `:200`, `:255`). The deck draws its cover and closing bands from slot 1, so the riso and xerox-punk deck covers and closings are the same torn orange/teal/halftone stripe with a yellow square (`sheet-deck-riso-print.png` slide 1 vs `sheet-deck-xerox-punk.png` slide 1). `cutup` is shared by riso and xerox-punk, and `onebit` by xerox, xerox-punk and ascii-art. Xerox and xerox-punk also share a component kit: a 30px square "X" toggle (`xerox.css:191`, `xerox-punk.css:215`), black status tags rotated -1.5deg (`xerox.css:215`, `xerox-punk.css:232`), tape strips, torn paper card edges, Anton headings over a typewriter body, and the "No.01" index. Their heading font picks are identical (`Anton / Archivo Black / Bebas Neue` in `js/aesthetic-meta.js:252` and `:328`).
   **Ruling:** riso owns *colour and overprint*. Xerox owns *the machine*: generation loss, toner threshold, platen, enlargement. Xerox-punk owns *the hand*: scissors, glue, tape, marker, ransom. Each fix list below enforces that split.
2. **Font picks collide with neighbours.** Corporate Vandalism's first pairing `['Inter Tight','Inter']` is identical to Micrographics' first pairing. Acid's heading picks `Unbounded / Dela Gothic One / Syne` are Y2K Chrome's heading picks. ASCII lists VT323, which Pirate Broadcast and Pixel Arcade also use.
3. **Deck slide 8 ("In product") is one template for all six:** a sidebar reading Overview / Projects / Assets, round coloured bullet dots, a "3 active" pill and a "Your next good idea" card. It is the clearest template tell in the deck set, and in xerox and ascii the round coloured dots contradict their own rules.
4. **Self-contradiction between rules and render.** Several decks state a rule that the board on screen breaks. Each case is listed per aesthetic below. A reviewer at a top studio reads the do/don't slide first, so these contradictions do real damage.

---

## 1. Riso Print: 4/10, Rework

**Brutal sentence:** It is a warm-cream product UI with a noise overlay, plus a hero of three rounded, drop-shadowed "trading cards". Riso shows up as a texture, not as a printing process.

### References
| # | Name | URL | Mechanism | Viewed |
|---|---|---|---|---|
| 1 | RISOTTO Studio | https://risottostudio.com | Fluorescent Pink and Green drums overprinting into a third colour; type built out of the overprint checker | viewed |
| 2 | Colorama, Berlin | https://colorama.space | A riso press identity: one red ink, hairline grid, big serif. Discipline comes from having one drum | viewed |
| 3 | Rollo Press (Urs Lehni) | https://rollo-press.com | Flat single-ink art books with no texture tricks; the ink colour *is* the identity | viewed (home) |
| 4 | Nieves, Zurich | https://nieves.ch | One-ink line drawing on pastel stock; uncoated paper carries the warmth | viewed |
| 5 | Stencil Wiki ink library | https://stencil.wiki/colors | Riso colour is picked from a list of drums (Yellow, Fluorescent Pink, Blue, Flat Gold…), not from a hex picker | viewed |
| 6 | Studio Hato / Hato Press | https://hato.co | Two-drum overprint identities for cultural clients | not viewed (blocked) |
| 7 | Knust / Extrapool, Nijmegen | https://www.extrapool.nl | Stencil/riso pioneers; ink starvation and roller streaks as texture | not viewed |
| 8 | Tan & Loose Press | https://tanandloose.com | Halftone photography split across two drums with deliberate misregistration | not viewed |
| 9 | People of Print, 51 riso studios | https://peopleofprint.com/best-of/51-riso-studios-you-should-all-know-about/ | Survey of the field | not viewed |
| 10 | AIGA Eye on Design on Hato | https://eyeondesign.aiga.org/sourdough-typography-and-risograph-parma-ham-are-on-the-menu-at-hato-press/ | Riso as a publishing practice | not viewed |

### Kill list
- **Rounded, shadowed hero cards.** `r6-riso-print-A.png` hero; `.rza-card { border-radius: 6px; box-shadow: .8cqw .6cqw 0 … }` (`css/aesthetics/riso-print.css:84-85`). Printed paper has no corner radius and casts no shadow in the print. These read as playing cards in a fintech onboarding illustration.
- **SaaS radii everywhere.** Cards 4px (`:100`), chips 3px (`:94`), segmented buttons 4px (`:103`), status tags 3px (`:151`), a 999px pill toggle (`:131`) and a pill-shaped "✓ Fits" chip. On the A board, the interface card, the input and the "Fits" chips all read as a default component library.
- **"Plate" box-shadow on cards** (`box-shadow: 4px 3px 0 var(--ab-plate)`, `:100`). This is neo-brutalist offset-shadow grammar dressed in teal. Misregistration is a second ink layer, not an outline offset (`.ab-cta::after` teal stroke, `:114`; see `hr4/riso-ui.png`).
- **Factually wrong captions.** The kicker says "TWO INKS, ONE PASS". The art caption says "FIG. 01 · 3 INKS · 1 PASS" (`js/aesthetics/riso-print.js:92`). The art itself uses four inks: primary, secondary, accent, and an ink-black halftone, because the halftone pattern fills with `t.ink` (`:83`). A riso printer would laugh at this.
- **Uniform dot screen labelled "dot size carries the shade".** The material spec (`riso-print.js:98`) and the deck rule ("Shade with halftone dots whose size changes", `:109`) promise AM halftone. On screen every dot is r=1.05 on a 3.4 grid (`:83`), which is flat polka-dot fill.
- **Hand-drawn yellow ring around "ALIVE".** This is a generic "highlight one word" doodle shared in spirit with xerox-punk's marker circle. It isn't a riso move.
- **Client colours used as raw hex.** The palette row shows `#E4572E / #17BEBB / #FFC914` on swatches with a dot screen. No riso drum is named, and no overprint colour is shown. The C board turns into three greens with nothing like a drum change.
- **Fractal-noise "grain"** (`--rz-grain`, baseFrequency .85 at opacity .42, `:18-19`). It is high-frequency digital sandpaper over the whole page, paper included. Riso texture is low-frequency ink-density mottling *inside inked areas*, plus white pinholes. The paper stays clean.

### Gaps (ranked)
1. **Overprint as the system.** Best work: the third colour (pink over aqua → purple) does the heavy lifting, and type and image are split across drums. Ours: one multiply in a small shape inside each card; type, UI and palette never overprint. **Severity: critical.**
2. **Drum discipline.** Best work: 1–3 named inks chosen from a real drum list. Ours: client hexes plus a fourth black. **Critical.**
3. **Halftone craft.** Best work: AM dots, a different screen angle per drum, moiré and rosette where drums meet. Ours: a uniform dot texture at one angle. **High.**
4. **Composition and scale.** Best work: full-bleed image to the trim with a 3mm unprinted margin and type 20–30% of page height. Ours: a 70px headline in a left column, a cluster of cards on the right, and a SaaS board below. **High.**
5. **Typographic voice.** Big Shoulders over Work Sans is "a condensed font from the category". Colorama and Rollo get their voice from one confident face printed in ink. **Medium.**
6. **Phone.** It stacks acceptably (`r6-riso-print-D.png`). The cards shrink to stickers, and nothing riso-specific happens at 390px. **Medium.**

### Distinctness
Nearest: **xerox-punk** (shared torn-collage and cut-up patterns, identical deck cover and closing band) and **neo-brutal-pop** (offset solid shadows, rounded chunky buttons). Verdict: **riso must move.** Drop the paste-up patterns, drop offset shadows, and become the only aesthetic in the set that shows *colour made by overprint*.

### Fixes (ranked; top 3 marked ★)
1. ★ **Snap to a real drum library.** In `riso-print.js` `tokens()`, map primary, secondary and accent to the nearest RISO ink by ΔE. Approximate values (verify against the stencil.wiki / riso-colors libraries): Fluorescent Pink `#FF48B0`, Yellow `#FFE800`, Bright Red `#F15060`, Orange `#FF6C2F`, Teal `#00838A`, Aqua `#5EC8E5`, Blue `#0078BF`, Federal Blue `#3D5588`, Green `#00A95C`, Sunflower `#FFB511`, Purple `#765BA7`, Mint `#82D8D5`. Print the drum name on each swatch ("PRIMARY · RISO ORANGE · DRUM 1"). Add a sixth chip, `OVERPRINT 1×2`, computed with multiply. Max two drums plus their overprint; the accent becomes an optional third drum. Remove `t.ink` from the art entirely.
2. ★ **Rebuild the hero art as a two-drum print.** Replace `art()` (`riso-print.js:64-93`) and `.rza-card` (`riso-print.css:84-85`). Use one sheet with square corners and no shadow. Drum 1 prints a large AM-halftone mass (dot radius 0.15–1.6 driven by a field, screen angle 15°). Drum 2 prints the brand initial or headline word at 60–80% of the art height, solid plus AM halftone at 75°, offset 2–3px with multiply, so the overlap visibly makes the third colour. Leave a 3mm unprinted margin. Add ink starvation as a low-frequency density falloff across one axis, not as opacity.
3. ★ **Remove the component-library kit.** Set `border-radius: 0` on `.ab-card`, `.ab-chip`, `.ab-seg-btn`, `.ab-row-status`, `.ab-row-bar` and `.ab-input` (`riso-print.css:94-155`). Delete the card `box-shadow` (`:100`). Replace the pill `.ab-switch` (`:131`) with a square two-state ink block (off = drum outline, on = drum solid with an offset second-drum layer). Show misregistration on the CTA as a second *filled* layer behind it in drum 2 at a 2–3px offset with multiply, not as a stroke.
4. **Overprint the headline.** Print the headline in drum 1 and one word ("ALIVE") in drum 2 overlapping it by 0.08em, so the overlap shows the third colour. Delete the hand-drawn yellow ring. Raise the headline from about 70px to `clamp(56px, 11cqw, 150px)` so it owns the page.
5. **Make the grain real.** Change `--rz-grain` to baseFrequency .03–.06 with 2 octaves, masked to inked areas only (apply on `.ab-cta`, the chips and the art, not on `.ab::after`). Add sparse white pinholes at 1–2% coverage. The paper stays flat `#F5F2E9`.
6. **Fix the copy.** Kicker: "TWO DRUMS, THREE COLOURS". Caption: "FIG. 01 · DRUM 1 + DRUM 2 · OVERPRINT". The halftone rule must match the render (fix 2).
7. **Patterns.** In `fit.js:102-108`, move `halftone 'Riso halftone'` to slot 1 so the deck cover and closing become it. Use `duo: true`, with angles that differ per drum if the engine supports it. Drop `tornbands` and `cutup` (they belong to xerox-punk) for an overprint-specific study, such as two offset gradient-of-dots fields.

### Keep
The warm uncoated canvas `#F5F2E9`. The multiply blend math in the art (orange × teal really does give the dark green). Space Mono stamps for captions. The deck's "Riso still life" pattern (black line vessels with colour masses), which is the one tile that looks like a riso zine page.

### Deck
- Cover (01) and closing (10): the torn stripe band is xerox-punk's, see the cross-cutting findings.
- Principles (02): "Halftone, never gradients / every edge is a printed edge" is contradicted by the soft card shadows on slides 05 and 06.
- Interface (05): three identical orange SAVE bars with teal stroke outlines. Rest, hover and pressed are indistinguishable at deck scale.
- Material (06): the rounded trading cards again, at full size, which exposes the radius and shadow.
- In product (08): the shared template, with coloured round dots.
- Do/don't (09): "Misregister the second ink consistently" is a good rule, but no slide shows a second ink misregistered over the first.

---

## 2. Xerox: 4.5/10, Rework

**Brutal sentence:** The lid-open black slab is the only thing on the board that came from a copier. The tape, sticky notes, highlighter, teal paper and torn edges came from xerox-punk's craft drawer.

### References
| # | Name | URL | Mechanism | Viewed |
|---|---|---|---|---|
| 1 | Pati Hill, copier works | https://en.wikipedia.org/wiki/Pati_Hill | The copier as a camera: objects on the platen in a black void; the image *is* the machine's limits | viewed (article) |
| 2 | Copy art / Xerox art | https://en.wikipedia.org/wiki/Copy_art | Direct imaging, generational degradation, moving the original during the scan | viewed (article) |
| 3 | Bruno Munari, *Xerografie originali* (1964) | n/a | Moving the original during the scan: smeared, stretched forms | not viewed |
| 4 | SisterSerpents poster (1993), Cooper Hewitt | https://collection.cooperhewitt.org/objects/18649859 | A faulty drum and toner noise used as the image | not viewed (DNS failure) |
| 5 | *Hard Copy* exhibition, Arles 2026 (Dazed) | https://www.dazeddigital.com/art-photography/article/70722/1/hard-copy-zine-exhibition-photography-xerox-exhibition-collier-schorr | Photographers re-made through a copy shop; grain and threshold as authorship | not viewed (consent wall declined) |
| 6 | Wolfgang Tillmans, photocopy enlargements | n/a | Enlargement grain; generations as a series | not viewed |
| 7 | *Sniffin' Glue* #1 (Mark Perry, 1976) | https://en.wikipedia.org/wiki/Sniffin%27_Glue | Typewriter plus felt pen, copied in monochrome, stapled | viewed (thumbnail) |
| 8 | Getty Iris on the photocopier | https://blogs.getty.edu/iris/?p=43327 | Copy-machine art history | not viewed |
| 9 | JSTOR Daily, "Xerox and roll" | https://daily.jstor.org/xerox-and-roll-the-corporate-machine-and-the-making-of-punk | The corporate machine behind punk | not viewed |

### Kill list
- **Yellow sticky note with tape in the hero** ("NO. 02 OF 50 DO NOT FOLD", `hr4/xerox-hero.png`). The deck's own don't says "Use coloured tape or coloured bars". This is both.
- **Tape on every card** (`xerox.css:162`) and **torn scrap edges** (`#xrx-edge`, `:153`). These belong to xerox-punk.
- **Yellow highlighter on the subcopy** ("A design language for Marigold Studio", A board). A copier can't produce yellow.
- **The orange block in the hero art and the orange "ALIVE" slab.** The principle "Colour is the paper" is broken in the first viewport.
- **The teal "COPY" panel** (`--xr-stock-b`, `xerox.css:158`, A board right card). It reads as a riso tint card, not coloured copy stock, because only one card gets it.
- **Generation demo built from smooth CSS gradients.** `.ab-disc { background: linear-gradient(135deg, ink, canvas) }` (`xerox.css:201`). "ORIGINAL / 2ND GEN / 5TH GEN" are grey and cyan gradients (`hr4/xerox-ui.png`). A photocopy has no greys, only threshold. This is the single most wrong element on the board.
- **"TAKE ONE –" tear-off strip.** A punk-flyer prop, not a machine artefact.
- **Shared X-box toggle and rotated black status tags.** Identical to xerox-punk (cross-cutting finding 1).

### Gaps (ranked)
1. **Generation loss as a system.** Best work: the same image degraded across generations; threshold, filled counters, broken hairlines. Ours: one gradient swatch row. **Critical.**
2. **The platen as a frame.** Best work (Pati Hill): objects in a black void, edge shadows and scale marks. Ours: one black slab, and the rest of the page is clean paper with props. **High.**
3. **Monochrome discipline.** Best work: toner black plus one coloured paper stock for the whole sheet. Ours: orange, yellow and teal accents. **High.**
4. **Type through the machine.** Best work: clean type enlarged until it rots, with ink traps filling and edges fraying. Ours: Anton with a mild roughen filter. It reads as a "distressed font", not as a copy. **Medium.**
5. **Phone.** Hero art is 70% of the first screen; tolerable, but no machine logic adapts. **Low.**

### Distinctness
Nearest: **xerox-punk** (shares the kit, fonts and toggle) and **riso-print** (shares tornbands; the teal stock card). Verdict: **xerox must move.** Strip every hand-made gesture and become the cold, straight, mechanical one. Xerox is the machine; punk is the person using it.

### Fixes (ranked; top 3 marked ★)
1. ★ **Remove all paste-up props.** Delete the card tape (`xerox.css:162`), `#xrx-edge` torn edges (use a straight edge with a 1px toner fringe), the hero sticky note (`xerox.js` hero art), the subcopy highlighter, the "TAKE ONE" strip and every rotation (`rotate(-1deg)` on `.ab-chip`, `.ab-fit`, `.ab-seg-btn`, `.ab-row-status`, `.ab-disc`). Copies are square to the page; only the *image* distorts.
2. ★ **Turn generation loss into the material system.** Replace `.ab-disc` gradients (`xerox.css:201-203`) with the brand initial (or a crop of the hero art) rendered at gen 1 / gen 3 / gen 7. Each step adds `feGaussianBlur` stdDeviation 0 → 0.6 → 1.4, then `feComponentTransfer` discrete threshold (tableValues `0 1`) with rising contrast (slope 6 → 10 → 16) and a 1–2% scale drift. The output is pure black on paper with no greys. Reuse the same chain for the headline on hover (one generation per hover).
3. ★ **Monochrome plus one paper stock.** In `tokens()`, set ink to toner `#111` and paper to one stock derived from the client palette as a *pale* copy-paper tint for the whole page: canary, pink, goldenrod, blue, green at L≈90–94%. The client primary may appear only as that stock or as one overprinted rubber stamp. Remove the orange block from the hero and the orange slab behind "ALIVE" (keep a black slab).
4. **Platen hero.** Keep the lid-open black slab. Replace the orange rectangle with a halftone-thresholded copy of the brand initial. Add the copier's edge scale (mm ruler ticks along one edge), a ghost double-copy offset 8–12px at 30% toner, and a reduction/enlargement label ("A4→A3 141%" in Courier) instead of "NO. 02 OF 50".
5. **Type.** Change the default pairing from Anton/Courier Prime to Archivo Black (or a neutral bold grotesk) with IBM Plex Mono, so it stops sharing xerox-punk's Anton. Run the headline through `#xrx-copy` at stronger settings so counters in "D", "O" and "G" partially fill. Push the size to `clamp(64px, 13cqw, 168px)`.
6. **Machine components.** Toggle: a rectangular copier key "1-SIDED | 2-SIDED" with an inverted active state, not the shared X box. Status: unrotated reversed-out mono labels ("TONER LOW", "JAM", "READY") in place of the punk tags. Progress: a copy-count readout ("COPY 032/050") alongside the bar.
7. **Patterns.** Drop `tornbands 'Paste-up'` (`fit.js:200`). Make slot 1 the `halftone 'Copied screen'` so the cover and closing become a copy, not a collage.

### Keep
The lid-open black slab with dither fall-off (`hr4/xerox-hero.png`), which is genuinely on-reference. The toner-reversed "THE PALETTE" band. The vertical drum-streak overlay (`--xr-streak`). The edge burn vignette. Courier for body copy.

### Deck
- Cover (01): one of the stronger covers in the set (black slab plus "COPY 02 OF 50"), but the sticky note and the orange "ALIVE" violate the deck's own slide 09.
- Interface (05): the gradient "generation" squares are fully exposed at deck scale.
- In product (08): orange, teal and yellow bullet dots plus a "3 active" pill, on an aesthetic whose principle is "Colour is the paper".
- Do/don't (09): "Use coloured tape or coloured bars" is listed as a don't while slides 01 and 06 use both.

---

## 3. Xerox Punk: 5.5/10, Refine

**Brutal sentence:** The ransom headline proves the idea, but every tile is the same size on the same baseline, the wall behind it is grey placeholder bars, and from "THE PALETTE" down you are looking at the xerox board in dark mode.

### References
| # | Name | URL | Mechanism | Viewed |
|---|---|---|---|---|
| 1 | Jamie Reid, *God Save the Queen* sleeve (1977) | https://en.wikipedia.org/wiki/God_Save_the_Queen_(Sex_Pistols_song) | Ransom words slapped across a found image; the cut is violent and the image is defaced | viewed (thumbnail) |
| 2 | Jamie Reid, Suburban Press | https://www.artsy.net/artist/jamie-reid | Cut-up headline type mixed with slogans; whole words as tiles, not just letters | not viewed (bot check) |
| 3 | Gee Vaucher, Crass sleeves and posters | https://en.wikipedia.org/wiki/Gee_Vaucher | Dense photomontage, black-and-white, stencil logo, text in tight blocks | viewed (article) |
| 4 | Linder Sterling, *Orgasm Addict* sleeve (1977) | n/a | Magazine-cut collage, crude scale clashes | not viewed |
| 5 | Raymond Pettibon, Black Flag/SST flyers | https://www.princeton.edu/~graphicarts/2010/02/raymond_pettibons_captive_chai.html | Hand-drawn image plus hand-lettered caption, copied hard | not viewed (bot check) |
| 6 | *Sniffin' Glue* | https://en.wikipedia.org/wiki/Sniffin%27_Glue | Typewriter plus marker, felt-tip headings, mistakes left in | viewed (thumbnail) |
| 7 | Winston Smith, Dead Kennedys collage | n/a | Clean collage of found ad imagery, political | not viewed |
| 8 | JSTOR Daily, "Xerox and roll" | https://daily.jstor.org/xerox-and-roll-the-corporate-machine-and-the-making-of-punk | Context | not viewed |

### Kill list
- **Uniform tiles.** Every tile in `hr4/xp-hero.png` has the same cap height (±5%), similar padding and near-zero baseline shift. Grey, cream and orange rotate like a pattern. Reid's tiles vary 0.6–1.6×, mix whole words with letters, and many are cut from photographs.
- **Lorem-ipsum wall.** The background scraps are translucent grey rectangles with grey bar "text" (`.xpo`, `xerox-punk.css:86`, `rgba(233,227,208,.07)`). This is a wireframe skeleton, not a wheatpasted wall.
- **The "M" photo card** is a grey sheet with a black bar and a speckled M, plus a paperclip. A paperclip is office stationery, not punk.
- **Shared xerox kit** below the hero: X-box toggle, rotated black tags, tape strips, the "No.01" index and torn cards (cross-cutting finding 1).
- **Hand-drawn ellipse around "ALIVE" and around "LAUNCH SITE".** A marker circle is legitimate punk, but it's used twice and also exists in riso. It has become a board-wide tic.
- **Mint neon CTA on the green palette** (`sheet-r6-xerox-punk.png` C: "prints as #8AFF8D"). Nobody's Day-Glo set has mint, and it reads as acid/cyber.

### Gaps (ranked)
1. **Violence of the cut.** Best work: scale clash, words over faces, image defaced. Ours: tidy letter tiles in a row, nothing defaced. **High.**
2. **Image content.** Best work: found photography (halftoned, contrasty) is half the language. Ours: no photography anywhere; the "photo" card is a letter. **High.**
3. **Wall density.** Best work: layers of posters, partial huge type, paste-over. Ours: three placeholder scraps. **High.**
4. **Component voice.** Below the hero the board reverts to the xerox kit. Punk UI should be cut words, marker ticks and stencil stamps. **High.**
5. **Phone.** The fluoro strip overlaps "FIG. 1 — NO COMMENT", hiding "FIG" (`hr4/xp-D-crop.png`). The subcopy card is squeezed to about 50% width, and the "NO GODS" strip wraps to three lines. **Medium (visible bug).**

### Distinctness
Nearest: **xerox** (shared kit) and **riso-print** (shared torn collage and cut-up patterns, same deck bands). Verdict: xerox-punk keeps its ground. Xerox and riso must move *off* it (see their fixes). Xerox-punk must then take the components back for itself (fix 3).

### Fixes (ranked; top 3 marked ★)
1. ★ **Make the tiles violent.** In the tile builder (`js/aesthetics/xerox-punk.js:100-123`): per-tile font-size scale random 0.72–1.45; baseline `--dy` ±0.15em; rotation ±6deg (now about ±3); padding 0.04–0.18em varied per side; 2–4px overlaps between neighbours. Every 3rd–5th unit is a *whole word* tile from a third face. 20% of tiles get a one-bit halftone photo-crop background (reuse the `onebit` generator at 1.5px) with the letter knocked out in paper colour. Keep the "brand face every 4th tile" rule.
2. ★ **Build a real wall.** Replace `.xpo` placeholder scraps (`xerox-punk.css:86`) with 2–3 torn poster remnants: thresholded halftone image (toner black on newsprint `#D9D4C4`) plus giant cropped type ("STUDIO" at about 30cqw, 60% off-canvas), at 18–30% contrast on the black wall, with visible paste-over edges and one torn-away corner revealing a lower layer.
3. ★ **Take the components back from xerox.** Segmented control: three cut word tiles in different faces; the active one is circled in marker. Toggle: a marker tick or cross drawn in `--xp-hand` on a scrap, not the shared 30px X box (`:215`). Status tags: stencil-cut or rubber-stamp text (`clip-path` stencil bridges) instead of the black rotated tag (`:232`). The "In use" list becomes a handwritten set-list scrap in `--xp-hand`. B mode (grey) becomes a newsprint flyer with black toner and one fluoro, so it no longer turns into the xerox board.
4. **Phone fix.** In `@container (max-width: 560px)` (`xerox-punk.css:122`): add `.xpa-strip { position: relative; z-index: 1; margin-top: 0.8em; }` and move `.xpa-cap` below the photo with `margin-bottom: 14px`. Set `.ab-subcopy { max-width: none; width: 100%; }`. Raise the headline clamp to `clamp(30px, 10cqw, 52px)` with a minimum of two words per line.
5. **A real Day-Glo set.** For the fluoro token, snap the client primary to the nearest of a 5-ink fluoro set: pink, orange, red, yellow and green (Day-Glo-style, values to be verified). Never use a lightness-shifted client hue such as `#8AFF8D`.
6. **Deface something.** Put one marker strike or safety-pin hole *through* the brand initial in the photo card, and replace the paperclip with a staple. Delete one of the two marker ellipses.
7. **Deck material slide (06).** Replace the colour tornbands with a ransom specimen sheet: tile anatomy, faces pool, scale range, photo-tile examples.

### Keep
The ransom headline engine (face pool, neighbour rule). The "STICK NO BILLS" kicker. The marker crossed-out SAVE state. The typewriter scrap cards. The black wall as the default mode. "CUT IT. PASTE IT. MEAN IT." The fluoro strip "NO GODS · NO MASTERS · NO TEMPLATES" works on desktop.

### Deck
- Cover (01): strong ransom headline, but the bottom band is riso's torn stripe.
- Principles (02): "CUT IT. PASTE IT. MEAN IT." in tiles is the best principles slide in the group.
- Typography (04): "Good design feels alive" in condensed Anton reads as a normal specimen. Show the tile system instead.
- Material (06): torn colour stripes, a riso image.
- In product (08): the shared template, plus round coloured dots.

---

## 4. Corporate Vandalism: 4/10, Rework

**Brutal sentence:** The aesthetic is called vandalism, but nothing is vandalised. It is a clean Micrographics shell with copied MSCHF house marks and a funny compliance form, and the joke is carried entirely by copywriting.

### References
| # | Name | URL | Mechanism | Viewed |
|---|---|---|---|---|
| 1 | MSCHF | https://mschf.com | Numbered drop index, `???` rows, `!!!` chip, mono caps | viewed |
| 2 | Brandalism | https://brandalism.ch | Fake ads installed in real JCDecaux frames; the vandal uses the corporation's own medium | viewed |
| 3 | Jenny Holzer, *Truisms* / projections | https://projects.jennyholzer.com | Language in the vernacular of signage, placed on corporate architecture | viewed |
| 4 | Barbara Kruger | https://en.wikipedia.org/wiki/Barbara_Kruger | Futura Bold Oblique on red bars over found photos; a second voice cutting into an image | viewed (article) / barbarakruger.com not viewed (certificate error) |
| 5 | Vetements DHL tee (2016) | https://en.wikipedia.org/wiki/Vetements | A corporate logo hijacked as couture | viewed (article) |
| 6 | Off-White quotation-mark labelling (Virgil Abloh) | https://en.wikipedia.org/wiki/Off-White_(company) | Literal labels ("SCULPTURE") as commentary | viewed (article) |
| 7 | Adbusters spoof ads | https://www.adbusters.org | Pixel-perfect ad parody with one word changed | not viewed |
| 8 | Balenciaga 2017 campaign-logo parody | n/a | Political logo appropriated as luxury mark | not viewed |
| 9 | Heron Preston × DSNY | n/a | Municipal uniform as fashion | not viewed |

### Kill list
- **Lifted MSCHF house marks.** The `!!!` yellow chip (`corporate-vandalism.css:30`), the `#027 … #030 ??????????????` index (`:215` `::after`), and the `↗` after a project name. Compare with `refs/mschf.png`, where the same `!!!`, `???` rows and numbered index appear. That is quoting one studio's website, not using a style. A Pentagram partner would call it plagiarism.
- **No second hand.** The deck do/don't (`sheet-deck-corporate-vandalism.png` 09) bans "Rotate, tape or distress anything". Every reference above depends on a *foreign mark applied on top* of the official surface: a red bar, a sticker, a swapped poster, a marker. The board has none. Redaction bars belong to the bureaucracy itself, not to the vandal.
- **Micrographics clone shell.** Inter Tight over Inter (identical first pairing), white canvas, crosshair rules, mono microtype, a barcode. Put next to `r6-micrographics-A.png`, the two read as one family.
- **Palette contradiction.** Deck slide 02 says "Fixed vandal palette: black, white and hazard red never take the client colours". Slide 03 and the board swatches are the client's orange, teal and yellow. On C, the CTA, form header bars and APPROVED button all turn green.
- **Scare-quote labels everywhere** (`"HEADLINE"`, `"TABS"`, `"BUTTON"`, `"TEXT FIELD"`, `"CHECKBOX"`, `"PROJECTS"`). Off-White uses one label per object. Six per screen is a tic.

### Gaps (ranked)
1. **The act of vandalism.** Best work: a visibly second intervention (Kruger bar, Brandalism swap, sticker over logo). Ours: none. **Critical.**
2. **Originality.** Best work: a borrowed *method*. Ours: a borrowed *website*. **Critical.**
3. **Two voices in type.** Best work: the official face (Helvetica/Arial) versus the vandal face (Futura Bold Oblique, marker, label-maker). Ours: one family, Inter. **High.**
4. **Scale story.** Best work: the hijack dominates and the official copy is small and bored. Ours: a big polite headline, with the "hijack" in 10px mono. **High.**
5. **Phone.** The headline drops to about 34px and the notice document dominates. Acceptable, but no scale contrast survives. **Medium.**

### Distinctness
Nearest: **micrographics** (same fonts, white shell, mono microtype, barcode) and **registry/official-forms territory** (form numbers, classification banners). Verdict: **corporate-vandalism must move.** Its whole identity has to be the collision of two hands: the corporation's surface, then the vandal's mark.

### Fixes (ranked; top 3 marked ★)
1. ★ **Add the vandal layer: one foreign mark per view, on top, in a different technology and angle.** Options, chosen by seed:
   (a) a Kruger bar: hazard-red `#E10600` slab, white bold oblique sans, 2–4 words, over the headline;
   (b) a label-maker strip: black Dymo tape, embossed white caps, slightly skewed, over the CTA label;
   (c) a sticker slap: a circular or rectangular vinyl sticker with a hard 1px white keyline, peeled corner, over the logo;
   (d) a marker strike through one official word, with a handwritten replacement.
   Put it in `corporate-vandalism.js` `art()` and in an overlay hook on `.ab-headline`. Rewrite deck rule 09: "Leave the shell spotless; apply exactly one foreign mark per view, on top."
2. ★ **Remove the MSCHF marks.** Delete the `!!!` pseudo-chip (`css:30`), the `#030 ???` `::after` (`css:215`) and the `#027` numbering. Replace them with a procurement vocabulary: PO numbers (`PO-2291-B`), SKU tags, asset tags ("PROPERTY OF MARIGOLD STUDIO · DO NOT REMOVE"), and Approved/Rejected rubber stamps. Remove "MSCHF" from `influences` (`js:40`) and use "Kruger / Brandalism / Holzer / Off-White".
3. ★ **Split the palette and the type into theirs and ours.** `tokens()`: the client palette is the *corporation's* (shell, header bars, CTA). The vandal set is fixed: hazard red `#E10600`, safety yellow `#FFD400`, black, white, used only by the vandal layer. Label the palette row "THEIRS" (client) and "OURS" (fixed). Type: change pairing 1 from `['Inter Tight','Inter']` to `['Archivo','Public Sans']` for the shell, plus a fixed vandal face (bold oblique geometric sans such as Jost 800 italic, or a marker face) that is never client-selectable.
4. **Reverse the scale.** Set the official headline at form-title size (28–34px, regular weight, like a policy document) and let the vandal mark carry display scale (Kruger bar type at 7–9cqw). That tells the story in one glance.
5. **Labels.** Keep at most two literal `"…"` labels per screen (`"BUTTON"` on the CTA, `"HEADLINE"` on the headline) and remove the rest.
6. **Deck.** Slides 02–05 are near-empty white pages with no intervention. Give every slide one vandal mark, and give the cover a full Kruger bar across the headline. Replace the grey "envelope tint" cover band with a Brandalism-style swapped-poster crop.

### Keep
The Notice of Compliance Review document: the classification banner, redaction bars with FOIA codes `(b)(6)`, "Unlisted feelings are deemed alive." The receipt with "AMOUNT DUE: ONE (1) APOLOGY". The deadpan footer fine print. The copywriting is the best in the group. The Approved/Flagged/Redacted button states.

### Deck
- 01 Cover: the form and receipt are well placed. The hazard band at the bottom is grey and weak.
- 02 Principles: says "A second party at work", but no second party appears anywhere in the deck.
- 03 Colour: contradicts slide 02 (client colours shown as primary, secondary and accent).
- 05 Interface: the REDACTED state is a solid black bar with no label, so it reads as a rendering bug.
- 08 In product: the shared template.

---

## 5. Acid Graphics: 5/10, Refine

**Brutal sentence:** The rave flyer is a genuinely good object. Below it sits a black admin dashboard with orange headings in Y2K Chrome's typeface, and the "warp" happens to one outlined word.

### References
| # | Name | URL | Mechanism | Viewed |
|---|---|---|---|---|
| 1 | The Designers Republic | https://www.thedesignersrepublic.com | Slogan as identity, invented corporate marks, "Design will eat itself" | viewed |
| 2 | tDR × Psygnosis, *Wipeout* (1995) | https://en.wikipedia.org/wiki/Wipeout_(video_game) | Invented sponsor logos as world-building; katakana; extended type | viewed (box-art thumbnail) |
| 3 | Tomato / Underworld | https://www.tomato.co.uk | Type as texture, layered at many scales | viewed (home) |
| 4 | Weirdcore (Aphex Twin AV) | https://weirdcore.tv | Glitched 3D, neon outline figures, liquid surfaces | viewed |
| 5 | Bráulio Amado | https://badbadbadbad.com | Maximal colour-clash posters, warped display type | viewed (home) |
| 6 | Studio Feixen | https://studiofeixen.ch | Vibrating colour pairs, kinetic modular posters | viewed (home) |
| 7 | Fantazia / Helter Skelter rave flyers 1990–93 | n/a | Airbrushed chrome, dense who/where/when, sponsor walls | not viewed (CAPTCHA, not solved) |
| 8 | Shoom smiley flyer (1988) | n/a | Acid house iconography | not viewed |

### Kill list
- **Dashboard outside the flyer.** Palette, type, interface and "In use" (`r6-acid-graphics-A.png`, everything below the fold) form a dark-mode admin layout. The type columns, the "Use recommended fonts" button and the boxed cards are generic.
- **The headline isn't warped.** "GOOD DESIGN SHOULD FEEL" is plain Unbounded in solid orange. Only "ALIVE" gets outline and stepped heights. The CSS header says "stretched tall", but at 1280 it reads as a normal heavy wide sans.
- **Flat-gradient chrome.** "MARIGOLD" in the flyer is a CSS linear-gradient with slice offsets (`acid-graphics.js:198`). Next to Weirdcore it reads as a 2005 WordArt preset.
- **Segmented control with circular connector nodes** (A board, interface card). These are flowchart handles, not a rave artefact.
- **Y2K font picks** (`aesthetic-meta.js:339` vs the Y2K entry: identical heading picks).

### Gaps (ranked)
1. **System-wide distortion.** Best work: every type element is stretched, compressed, outlined or echoed. Ours: one word. **High.**
2. **Detail density.** Best work: 20–40 information elements per flyer at 5+ scales. Ours: the flyer has about 15 (good), and every other section has 4–6. **High.**
3. **Rendering craft of the "special" surface.** Best work: liquid or 3D chrome, or none. Ours: flat gradient chrome. **Medium.**
4. **Colour logic.** Pushing the client primary to full chroma is the right move (C turns acid green and pink, which works). Keep it. **Low.**
5. **Phone.** The flyer fits, the headline wraps to 3 lines, and the ripple stays readable. Acceptable. **Low.**

### Distinctness
Nearest: **y2k-chrome** (identical heading fonts, chrome word) and **pirate-broadcast** (dark board, marquee strips, condensed orange headline, ticket and stamp vocabulary). Verdict: **acid must move away from Y2K on type and chrome.** Its ground is op-art vibration plus tDR's invented-corporate density. Chrome belongs to Y2K.

### Fixes (ranked; top 3 marked ★)
1. ★ **Distort every display line, not just one word.** Apply per-letter `scaleY` 1.4–2.2 across the whole headline. Give the last line an outline echo (2–3 offset strokes in acid and clash), and give one line horizontal compression (`scaleX .62`). Set the headline at `clamp(64px, 12cqw, 180px)` before the stretch. Apply the same treatment to the section titles ("THE PALETTE" and so on) at a smaller scale.
2. ★ **Carry the flyer into the whole board.** Each section gets a field band: the ripple behind the palette label row, strobe rays behind type, warped check behind interface, at 12–25% contrast. Add a dense info strip to every section header (catalogue no., BPM, katakana, invented sponsor marks, barcode). Replace the boxed type columns with a "line-up" typesetting: faces listed like DJs on a bill, in size order.
3. ★ **Move off Y2K.** Change the heading picks to faces that *stretch* rather than shine: Climate Crisis (it has a stretch axis), Tilt Warp, Syncopate or Monoton, added to `FONTS` if missing, with `Kode Mono` or Space Mono for info. Remove the chrome word. Make "MARIGOLD" in the flyer an outlined triple-echo in acid, clash and ink, so the vibration is the effect, not metal.
4. **Density in the flyer.** Add a sponsor wall of 8–12 invented marks at mixed sizes (already started, about 6), a warning pictogram row, a vertical katakana strip, a perforated stub with serial number, and a second smaller ripple. Target 30+ elements.
5. **Components.** Replace the node-handle segmented control with ticket tabs (a perforated left edge, already in the patterns as `ribbonrise`). Toggle: an "ON AIR / OFF" strobe tab. Progress: equaliser bars.
6. **Deck.** The colour slide (03) is five flat slabs; make it the vibrating-pair demonstration (acid next to clash, with the measured luminance delta). The interface slide (05) is sparse. The closing (10) "UNTIL IT HUMS" with outlined "HUMS" is the best slide; give that treatment to every slide title.

### Keep
The flyer composition: date and number header, ADMIT ONE stub, who/where/when blocks, sponsor row, ticker. The op-art ripple with the blurred displacement. The full-bleed acid hero in light mode (B). The chroma-pushed palette mapping. The ticker strips at the top and bottom. The warped-check, strobe-rays and vibrating-rings patterns.

### Deck
- 01 Cover: good, but the flyer is shrunk to a thumbnail; it should take half the slide.
- 03 Colour: dead slide.
- 05 Interface: three components floating in black.
- 08 In product: the shared template (the yellow selected-row bar is the only acid touch).
- 09 Do/don't: "Stretch the headline taller, never squeeze it" is contradicted by the board, which barely stretches.

---

## 6. ASCII Art: 4/10, Rework

**Brutal sentence:** Take away the one density-map panel and this is a VS Code theme. Even that panel renders the brand "M" as a blurred horseshoe with two eyes.

### References
| # | Name | URL | Mechanism | Viewed |
|---|---|---|---|---|
| 1 | Andreas Gysin, ertdfgcvb | https://ertdfgcvb.xyz | The whole site is a character field; navigation, works and imagery are all text | viewed |
| 2 | play.core (Gysin) | https://play.ertdfgcvb.xyz | Live density-string rendering of fields, shapes and video | viewed |
| 3 | 16colo.rs ANSI archive | https://16colo.rs | Block glyphs `█▓▒░` in the 16-colour CGA palette; colour is quantised | viewed |
| 4 | Vuk Ćosić, *ASCII History of Moving Images* | https://www.ljudmila.org/~vuk/ascii/film/ | Film rendered as ASCII, high resolution, legible faces | not viewed (TLS failure) |
| 5 | Raquel Meyers, text-mode art | https://raquelmeyers.org | PETSCII/teletext as a full graphic language | not viewed (DNS) |
| 6 | FIGlet | http://www.figlet.org | Block-letter headlines built from characters | not viewed |
| 7 | Paul Bourke, character ramps | https://paulbourke.net/dataformats/asciiart/ | A 70-step ramp and an aspect-corrected cell | not viewed |
| 8 | Joan Stark ASCII archive | https://asciiart.website | Line ASCII: `/\|_` contour drawing, not only density | not viewed |

### Kill list
- **The headline is a font, not characters.** "> Good design should feel alive▌" is JetBrains Mono at about 54px with a cursor. Every terminal-themed SaaS landing page looks like this.
- **The hero "M" doesn't read.** A 5×7 bitmap blurred into 88×17 cells (`ascii-art.js:45-82`) gives a horseshoe with highlighted "eyes" (`hr4/ascii-hero.png`). The yellow cursor cells are scattered at random, and the orange/teal colouring is salt-and-pepper noise rather than a field.
- **Debug labels as decoration.** "density.map / ramp / cells 1496 / levels 10 / 'M' 5x7 → 88x17". It's a code comment, not a design.
- **Palette swatches are CSS bars** with a dithered end (`r6-ascii-art-A.png` palette row). On "Everything is a character", the swatches are not characters.
- **Warm brown-black canvas `#2E282A` with grey hairline cards.** This is the generic dark-mode surface shared with half the set.
- **Sparse page.** About 70% of the board is empty dark field. Gysin's pages are 90% characters.

### Gaps (ranked)
1. **Characters as the only medium.** Best work: swatches, rules, buttons, imagery and type are all glyphs. Ours: progress bars and panel frames are, nothing else is. **Critical.**
2. **Image fidelity.** Best work: a legible image from a 70-step ramp with edge glyphs and aspect correction. Ours: a 10-step ramp from a 5×7 source. **High.**
3. **Display type.** Best work: FIGlet or block-letter headlines. Ours: a mono webfont. **High.**
4. **Colour logic.** Best work: quantised to a 16-colour ANSI palette or a single phosphor. Ours: raw client hex on glyphs. **Medium.**
5. **Phone.** The 40×20 art scales down cleanly and legibility is fine. **Low.**

### Distinctness
Nearest: **pirate-broadcast** (VT323, mono, dark, teletext) and **pixel-arcade** (grid, block cells). Verdict: **ascii must move.** It is the only aesthetic in the set whose pixels are *glyphs*, so make every pixel a glyph.

### Fixes (ranked; top 3 marked ★)
1. ★ **FIGlet headline.** Render the headline as block-letter ASCII (an ANSI Shadow / Big-style 6-row font table in `ascii-art.js`) in the body mono, wrapped by words, at a cell size where 6 rows ≈ 15–18% of viewport height. The `<h1>` stays visually hidden for accessibility. On phone, fall back to a 3-row small FIGlet.
2. ★ **A legible hero.** Rasterise the brand initial (or the full brand name) in the heading face onto an offscreen canvas at cols×rows×2. Read luminance, correct for the cell aspect (0.6:1), use a 70-step ramp, and add an edge pass that substitutes `/ \ | _ -` on gradient direction (as in Gysin and line ASCII). Colour comes from a single field, not per-cell random. Animate slowly (noise drift 0.2 cells/s, reduced-motion respected). Delete the debug labels, or make them a live status line that actually changes.
3. ★ **Every surface a glyph.** Swatches: 12×3 cells of `█▓▒░` in each colour, with the hex printed as `0xE4572E` beneath (already there). Segmented control: `< Design | Build | Launch >` with an inverse-video active cell. Toggle: `[x] Focus mode` / `[ ] Focus mode`. Button: box-drawing `┌──────────────┐ │ > Save … │ └──────────────┘`. Section rules: `═══`. Card frames are already box-drawing (good).
4. **ANSI colour quantisation.** In `tokens()`, snap client colours to the nearest of the 16 CGA/ANSI colours for glyph colour, keep the exact client hex only in the readout text, and offer a single-phosphor mode (amber `#FFB000` or green `#33FF66` on `#000`). Canvas: pure `#000` (dark) or `#F4F1E8` paper (light), not `#2E282A`.
5. **Density.** Put a full-board background character field (ramp noise at 6–10% contrast, 10px cells) behind sections, with sections reading as cut-outs in the field, as on ertdfgcvb.
6. **Fonts.** Remove VT323 from the picks to separate from pirate-broadcast and pixel-arcade. Use JetBrains Mono / IBM Plex Mono only. The display voice comes from FIGlet, not a pixel font.

### Keep
The box-drawing panel frames with titled top edges. The cell-based progress bars. The `$ cat brand.txt` kicker. `[01]` indices. The sparse/dense/solid density demo. The phone layout.

### Deck
- 01 Cover: the art is a small thumbnail; the ramp field band at the bottom is the best part.
- 05 Interface: three tiny components and three tiny swatches in a big empty slide.
- 06 Material: the horseshoe "M" again, larger, which makes the legibility problem worse.
- 07 Patterns: "One-bit dither" and "Density map" are pixel patterns, not character patterns (and `onebit` is shared with xerox and xerox-punk).
- 08 In product: round CSS bullet dots on an "everything is a character" deck.

---

## Priority order for the builder (across the group)

1. Separate the print trio. Re-slot patterns in `fit.js` (no `tornbands` outside xerox-punk). Give xerox and xerox-punk different heading defaults and components. Remove paste-up props from xerox and SaaS radii and shadows from riso.
2. Corporate vandalism: add the vandal layer and remove the MSCHF marks.
3. Riso: real drum library plus the two-drum hero art.
4. ASCII: FIGlet headline, legible hero, glyph-only components.
5. Acid: system-wide distortion and a font move off Y2K.
6. Shared deck slide 8 ("In product"): give each aesthetic its own product mock, or at minimum swap round dots and pills for the aesthetic's own markers.
