# QC2 — severe QC, round 6 (packet rev 1)

Inspector: qc2 (Opus, read-only). Aesthetics: raw-brutalist, bauhaus-poster, radical-memphis, groovy-70s, mid-century,
naive-doodle, art-nouveau, neo-deco, editorial-serif, mixed-type, dystopian-luxury, micrographics.

Method: every board A/B/C/D and all 20 deck slides per aesthetic viewed (full-size crops for anything suspect); a DOM scan of
every text node for contrast, clipping, bleed, placeholders and missing font faces on the board (warm, green, pastel
#F4C2C2…, dark #7A00FF… palettes x light/dark) and on all 10 slides in both modes; a pixel check of each text box against the
screenshot (to cover text over images and gradients); long name "BallKnowledge Collective International" and "Ox" at 1280
and 390; a PNG logo; the typography lock (Lora/Lora); keyboard focus (real Tab) and mouse hover on CTA and segments;
24 Bold blends (each key as base with 1 random donor and as donor into 1 random base); `buildAiBrief(state)` for all 12;
deck PNG export through the real `rasterizeDeckSlide` path for 12 slides across 9 aesthetics.
Contrast numbers are measured WCAG ratios (fg composited over the measured background).

Severity: BLOCKER = visibly broken in a default view or export; MAJOR = owner will see it / contradicts own rules;
MINOR = polish.

---

## Cross-cutting (shared files; affects several of mine)

1. **BLOCKER · deck PNG/PDF export · inset box-shadows export as solid fills.** html2canvas 1.4.1 paints
   `box-shadow: inset 0 0 0 Npx C` as a filled box. Measured on exported PNGs:
   micrographics cover (spec table, QR sticker and barcode sticker export as black slabs; header mark filled), micrographics
   Color slide (all five swatches export black, palette is destroyed), micrographics Interface (segmented control and toggle
   are black bars, labels gone); dystopian-luxury Interface (primary CTA is a blank black bar, "Catalogued" state blank);
   editorial-serif Interface ("Pressed" state exports as an empty box); mixed-type Interface ("Paper" chip solid black);
   neo-deco Interface ("Stepped" state missing). Inset rules: micrographics.css 7, neo-deco.css 8, dystopian-luxury.css 5,
   editorial-serif.css 4, mixed-type.css 3. Fix: `js/brand-deck.js` `bdSanitizeClone` — in the clone, rewrite each
   `inset 0 0 0 Npx C` shadow to `outline: Npx solid C; outline-offset: -Npx` (and `inset Npx 0 0 C` to a border-left)
   before html2canvas runs. One shared fix covers all five aesthetics.
2. **MAJOR · AI brief describes a board nobody sees.** All 12 briefs say "Headings: 44px, weight 700, letter-spacing 0px,
   text-transform none" (actual: raw-brutalist 178px uppercase, neo-deco/mid-century tracked caps, bauhaus lowercase 125px,
   micrographics 48px/600) and a Shape radius the boards don't have (mixed-type "12px / 16px", radical-memphis, groovy-70s
   and naive-doodle "20px / 28px", mid-century/art-nouveau/neo-deco "8px / 10px", bauhaus/editorial/dystopian/micrographics
   "4px / 6px"; every one of those boards draws square or style-specific shapes). Fix `js/ai-brief.js`: read heading
   size/weight/case/tracking from the rendered `.ab-headline` (or the aesthetic def) and the radius from `slideShape` / the
   aesthetic CSS, not from the global shape preset.
3. **MAJOR · AI brief bloated with data URIs.** The CSS-variables section dumps URL-encoded SVG: naive-doodle 32,752 of
   50,968 chars (64%), art-nouveau 18,205 of 43,732, neo-deco 7,950, mid-century 6,098, groovy-70s 1,037. Fix
   `js/ai-brief.js`: skip custom properties whose value contains `url("data:` (or replace with "[inline SVG texture]").
4. **MAJOR · blend art channel puts donor hero art over the base headline.** Seen in bauhaus+riso-print, neo-deco+riso-print,
   neo-deco+naive-doodle, bauhaus-poster+micrographics, editorial-serif+clay, dark-academia+dystopian-luxury (details under
   each key). Fix `js/blend.js` art channel / `css/blend.css .ab-blend-inner`: keep donor art inside the base's art box
   (contain + overflow hidden) and never above the headline's z-index; skip the donor art if the base hero is "type over art".
5. **MINOR · muted ink lands at 4.49:1 on the pastel palette** (light mode, #FFFFFF canvas): every muted label in
   bauhaus-poster, dystopian-luxury, micrographics, mixed-type measures 4.49. `js/aesthetic-board.js:101` loop stops at
   `< 4.5` with rounding error; target 4.6.
6. **MINOR · SVG logo without width/height renders 0x0** in the header of all 12 boards (an uploaded SVG under the size
   limit keeps its original src). `css/aesthetic-board.css:62 .ab-logo` has only max-height/max-width; add
   `height: 32px; width: auto`.
7. **MINOR · Do/Don't numerals** 01–03 measure 3.19–3.92:1 at small size (bauhaus, radical-memphis, groovy, mixed-type,
   dystopian, micrographics decks). aria-hidden, but visible. Use ink or ≥4.5 muted.

Coordinator pre-known items:
- mixed-type cover band / closing strip: **fixed** — 0.0% saturated pixels measured in both. Patterns slide still prints
  client orange+teal (see mixed-type 1).
- micrographics default font IBM Plex Sans: **confirmed** (48px/600 one-line headline; recommended body flagged "Consider"
  by its own fit check). See micrographics 3.
- Shared heading faces: raw-brutalist vs radical-memphis (Archivo Black) — **not siblings**: RB is a 178px uppercase
  grid poster on a 12-column index with Times links; RM is 72px mixed case on tilted white tape slabs over laminates. The
  face is only recognisable in the type specimen. bauhaus-poster vs mid-century (Jost) — **not siblings**: BP is 125px
  lowercase crossed by a -24° bar in fixed primaries; MC is 42px tracked caps with a Yellowtail script word and cut-paper
  atomic art. No change needed for either pair.

---

## 1. raw-brutalist

1. MINOR · A (1280), hero headline · "SHOULD" line ends at x=869 while the 12-column grid ends at 845 (left margin 39px,
   right 15px); the ALIVE band also starts 4px left of column 1. Fix: `css/aesthetics/raw-brutalist.css` cap
   `.ab-headline` at the grid width (`max-width: calc(100% - 2*var(--ab-pad))`) or reduce the poster display factor 1.35→1.3.
2. MINOR · A, spec table in hero · column heads ID/ITEM/STATE/UPDATED (11px) 4.28:1 warm-dark, 3.86 pastel-dark,
   4.16 pastel-light, 4.37 dark-palette light, 4.45 green-light. Fix `raw-brutalist.css:103 .rba-th` color → `var(--ab-ink)`.
3. MINOR · A, palette strips · job text wraps leaving "≈10%", "15%", "≤5%" alone on line 2. Fix: `white-space: nowrap` on
   the percentage span or shorten the job label in the strips layout.
4. MINOR · deck Principles · item 3 title "Mono, uppercase, numbered like [01]" breaks with "[01]" orphaned. Fix
   `js/aesthetics/raw-brutalist.js:73` → "Mono caps, numbered [01]" or a non-breaking space before "[01]".
5. MINOR · deck Material (wireframe) · the `SECTION.hero` label `<b>` stretches the full box width with a canvas background,
   masking the X diagonals across the top. Fix `raw-brutalist.css:130` add `align-self: flex-start` to `.rba-w-hero b`.
6. MINOR · segmented control · inactive segment has no hover state (0.0% pixels change). Fix: add
   `.ab-seg-btn:not([aria-pressed="true"]):hover { background: var(--ab-ink); color: var(--ab-canvas); }` (invert, per its rule).

Clean: B/C/D, pastel + dark palettes, fixed link blue (#0000EE / #9EB8FF dark) as designed, Times counter-voice is not a
fallback, 390 hides UPDATED column cleanly, long/short names (ellipsis in 390 header acceptable), logo, focus rings, CTA
hover, cover, product (Apache index), do/don't, closing, blends (RB+pirate-broadcast, holo-iridescent+RB).

## 2. bauhaus-poster

1. MAJOR · blend bauhaus-poster + riso-print (Bold) · donor halftone M fills the hero under the headline: "ALIVE" sits on
   the halftone and is crossed by the poster bar; the subcopy starts against the red side rail. Fix: cross-cutting 4.
2. MINOR · pastel-light · muted labels (palette jobs, type class, influences, 10–12px) 4.49:1. Fix: cross-cutting 5.
3. MINOR · segmented control · no hover state on inactive segments (0.0% change). Fix
   `css/aesthetics/bauhaus-poster.css`: inactive segment hover → ink fill, canvas text.

Clean: A/B/C/D, fixed primaries hold on green/pastel/dark palettes, dark-mode reversed bar, product wall (dark-mode captions
are on paper posters — scanner false positive), cover/closing art bleed is intended, long/short names, logo, focus, CTA
hover, blueprint+bauhaus blend, export not affected.

## 3. radical-memphis

1. MAJOR · 390 + long name · wordmark sticker 347px wide in a 350px card bleeds +62px and is cut mid-word ("…Interna"),
   no ellipsis. Fix `css/aesthetics/radical-memphis.css .ab-wordmark` at ≤480px: `max-width: 100%; overflow: hidden;
   text-overflow: ellipsis` (or allow a 2-line sticker).
2. MAJOR · blend radical-memphis + riso-print · the white tape slab is sized to Archivo Black metrics; with the donor's
   condensed face the cap tops of "GOOD DESIGN" are cut off by the slab edge. Fix `.mm-slab`: padding-block in em and
   `line-height: 1.08` so the slab follows the active face.
3. MAJOR · deck export, Interface slide · the CTA exports with a teal triangular wedge across "Save direction"
   (html2canvas misrenders the offset-sheet gradient). Fix: draw the sheet with a plain `box-shadow` (no gradient) or add
   it to `bdSanitizeClone`.

Clean: A/B/C/D, all palettes (dark-mode slab text is on white paper — scanner false positive), offset sheets not outlines,
deck 10 slides both modes, "Ox", logo, focus, CTA hover, gummy+RM and RM+art-nouveau blends.

## 4. groovy-70s

1. MAJOR · board + deck Interface, state buttons · "Save" ink on primary #E4572E = 3.16–3.29:1 at 15px (fails 4.5), both
   modes. Fix `css/aesthetics/groovy-70s.css`: label colour from `--ab-on-primary` chosen by ensureContrast, or set the
   label ≥19px bold so 3:1 applies.
2. MINOR · palette job lines (12px, role-tinted) · "Main action · ≈10%" 4.06:1 warm, "Support" 4.40 green, "One spark"
   4.32 dark palette, "#E4572E" hex 4.31. Fix: set `.ab-sw-job`/`.ab-sw-hex` to `var(--ab-muted)`.
3. MINOR · deck cover · the arch art box is 780px tall inside a 720px slide; the arch is cut flat at the meta row, so the
   "straight legs" the brief promises never show. Fix: cover `.ab-art { max-height: 100%; }` / scale the arch SVG.

Clean: A/B/C/D, earth ramp fixed on all palettes, pastel/dark brand band reads, deck both modes, long/short names, logo,
focus, hover, export (Interface slide clean), groovy+RM and ascii-art+groovy blends.

## 5. mid-century

1. MAJOR · 390 header · wordmark box is 113px, so even the default name ellipsises ("MARIGOLD ST…"); the long name gives
   "BALLKNOWLED…". Fix `css/aesthetics/mid-century.css .ab-wordmark` at ≤480px: drop tracking to 0.08em and font-size to
   13px, or let it wrap to two lines.
2. MAJOR · deck Patterns / cover band / closing strip · contradicts its own Don't "Use outlines, grain or misregistration"
   (`js/aesthetics/mid-century.js:306`): lead "Molecules" is outline-only line art (`fill: 'open'`), "Screen print" is a
   halftone, "Cut-paper hills" carries grain. Fix `js/patterns/fit.js:364` tokens `fill: 'solid'`; replace the halftone
   entry with a flat family.
3. MINOR · CTA label ink on "prints as #D66E3C" = 4.24:1 at 12px (both modes). Fix: darken the print tone to ≥4.5 with ink
   (≈#C9612F) in the aesthetic tokens.
4. MINOR · dark palette, dark mode · list numerals `i.ab-n` 01–03 = 3.10:1 at 11px.
5. MINOR · A hero · the orange boomerang is cut by a hard vertical line at x≈845 (content edge); reads as clipping, not
   cut paper. Fix: let `.ab-art` overflow to the card edge or pull the shape inside.
6. MINOR · deck In-product · teal blob overflows the slide by 7px (scrollWidth 1287).
7. MINOR · D (390) · "prints as #D66E3C" falls under the swatch blob, out of the text column.
8. MINOR · segmented control · no hover on inactive segments (0.0% change).

Clean: B/C, pastel/dark palettes, deck cover/principles/color/type/do-don't/closing, focus (offset ink shadow on Tab),
logo, retro-futurist+MC and MC-as-donor-into-naive-doodle blends.

## 6. naive-doodle

1. MAJOR · deck cover band + closing strip · lead "Marker garden" prints five inks (red, pink tint, teal, yellow, black)
   against its own Don't "Use more than three crayons per view" (`js/aesthetics/naive-doodle.js:389`). Fix
   `js/patterns/fit.js:340` colorway `'duotone'` or `colors` limited to ink1/ink2.
2. MAJOR · AI brief · 32.7k of 51k characters are SVG data URIs. Fix: cross-cutting 3.
3. MAJOR · blend as donor into neo-deco · the doodle sun and rays are drawn behind the headline inside the deco frame and
   the "made by hand!" label is clipped at the frame top. Fix: cross-cutting 4.
4. MINOR · Interface "Save" state labels ink on hatched primary 3.42:1 (17px); card body on mint 4.26 green-light, 4.35
   warm-light, 4.47 pastel-dark (14px). Fix: darken card tint / use ink at 100% on the mint card.
5. MINOR · deck Patterns · "Crayon pebbles" are soft blurred blobs — airbrush, not crayon. Swap the family.
6. MINOR · A hero · teal hill hard-cropped by straight box edges at x≈845 and y≈425.
7. MINOR · deck Material · numeral ovals touch their labels ("01Wobble line", 0px gap).
8. MINOR · deck cover · art is small (sun ≈120px), right half and bottom empty.
9. MINOR · D (390) · "this one!" arrow points at empty space below the card.
10. MINOR · segmented control · no hover on inactive segments.

Clean: B/C, palettes, focus (squiggle on Tab), long/short names, logo, deck interface/product/do-don't/closing,
naive-doodle+curio-cabinet blend.

## 7. art-nouveau

1. MAJOR · D (390) · state chips Bare/Framed/Haloed overlap: Bare runs into Framed's frame, the halo overlaps Framed.
   Fix `css/aesthetics/art-nouveau.css` states row at ≤480px: gap ≥12px, chips at 80% scale.
2. MAJOR · deck cover band + closing strip · lead "Iris stems" (blades) is a grainy airbrushed red leaf scatter with no
   contour — contradicts its principle "Muted lithograph colour: flat, soft hues with a dark contour line" and reads as
   autumn leaves. Fix `js/patterns/fit.js:372` lead → "Botanical frieze" (sprigs) or "Whiplash" (flow), if free in the
   ownership table.
3. MINOR · deck Patterns · "Japonisme waves" are shaded 3D tubes, not flat litho.
4. MINOR · A, Frames panel · the curl ornament sits on the "P" of PROJECT NAME and touches the input border.
5. MINOR · CTA cartouche · primary fill shows 1.5px above the top rule and below the bottom rule (rules at 1.5px /
   100%-1.5px, fill 0–100%). Fix `art-nouveau.css:134-136`: fill at `23px 1.5px / calc(100% - 46px) calc(100% - 3px)`.
6. MINOR · CTA hover `brightness(1.04)` is imperceptible (0.0% pixels change >24); inactive segments no hover. Fix:
   brightness 0.92 or swap fill to olive.
7. MINOR · AI brief carries 18.2k chars of data URIs (cross-cutting 3).

Clean: A/B/C, all palettes, CTA contrast 4.71 (5.24 pastel), deck principles/color/type/interface/material/product/
do-don't/closing both modes, long/short names, logo, focus, export (cover clean), AN+RM and RM+AN blends.

## 8. neo-deco

1. MAJOR · deck, every slide, both modes · the header diamond mark overlaps the "B" of "BRAND GUIDELINES". Fix
   `css/aesthetics/neo-deco.css:256-258`: slide `.ab-head` gap ≥10px and drop the negative mark margin.
2. MAJOR · Don't "Use arches, glows or blurred rays" (`js/aesthetics/neo-deco.js:218`) contradicts the board: the hero
   sunburst is a half-arch of rays, the header has a radial glow, and "Radio City bands" is concentric arches. Fix: reword
   to "Blurred rays, soft glows or rounded pills" or remove the glow.
3. MAJOR · 390 + long name · centred wordmark is clipped on both sides ("NOWLEDGE COLLECTIVE INTERNATI"). Fix
   `.ab-wordmark` at ≤480px: wrap to two centred lines, tracking 0.2em.
4. MAJOR · blend neo-deco + riso-print · donor halftone M sits over the headline and subcopy inside the deco frame.
   Fix: cross-cutting 4.
5. MAJOR · deck export Interface · "Stepped" state exports blank (cross-cutting 1).
6. MINOR · header prefix "Design language /" (10px) 4.48 warm, 4.35 green, 4.27 dark palette, 3.86 pastel. Fix: muted →
   brass-on-dark at ≥4.5.
7. MINOR · pastel-light · muted labels and card body 4.3:1.
8. MINOR · A hero · stepped frame's bottom edge crosses the sunburst arcs (frame line over rays).
9. MINOR · AI brief carries 7.9k chars of data URIs.

Clean: B/C/D, brass fixed on all palettes, deck color/type/interface/material/patterns/product/do-don't/closing, "Ox",
logo, focus, CTA hover, retro-futurist+neo-deco blend.

## 9. editorial-serif

1. MAJOR · A + deck Interface · Hover and Pressed state buttons are identical (both ink in light, both paper in dark;
   Pressed only 1–2px lower). Fix `css/aesthetics/editorial-serif.css`: Pressed = outlined (1px ink, transparent fill) or
   underlined label.
2. MAJOR · long name, cover · masthead wraps and `text-align-last: justify` throws "Collective" to the far right of line 1
   and "International" under "BallKnowledge" — reading order scrambled; header "VOL. 01 · NO. 1" and "DESIGN LANGUAGE /
   EDITORIAL SERIF" wrap to 3–4 lines. Fix `editorial-serif.css:92-96`: `text-align-last: left` when the name has more
   than 2 words (or shrink to one line); `white-space: nowrap` on the header meta.
3. MAJOR · logo present · the framed print (`js/aesthetics/editorial-serif.js:114-115`, y 52–160) sits on top of the
   masthead "Studio". Fix: move the print to y≥175 or below the masthead line.
4. MAJOR · deck Material · shows only a stipple pattern; the list (Paper, Masthead rule, Hairline, Duotone cover) draws
   none of them. Fix: `materialArt` with the duotone still life plus the double rule and hairline samples.
5. MAJOR · blend editorial-serif + clay · white headline sits on the cream canvas and pale blobs; subcopy under a blob
   shadow is illegible (measured 1.0:1 on part). Fix: cross-cutting 4 plus headline colour from the canvas when donor
   art replaces the dark cover band.
6. MAJOR · deck export Interface · "Pressed" state exports as an empty box (cross-cutting 1).
7. MINOR · kicker "Issue 01 — Spring" over the image gradient 2.85:1 pastel-light, 3.27 pastel-dark (10px); "No. 01 ·
   Spring" 4.27 dark-palette light (9px).
8. MINOR · deck cover · headline ≈36px against the principle "a didone at 120px"; cover feels cramped.
9. MINOR · D (390) · folio "P. 14" wraps to two lines.

Clean: B/C, all palettes, CSS generated text page reads, deck principles/color/type/patterns/product/do-don't/closing,
"Ox", focus, CTA hover, cybersigilism+editorial blend.

## 10. mixed-type

1. MAJOR · deck Patterns · client colours still print: Fly-poster ("brand") 8.6% primary + 8.0% secondary pixels, Glyphs
   ("brand") 4.0% + 6.3% — against its own "Support ≤2%". Fix `js/patterns/fit.js:231-232` colorway → `'mono'`.
   (Cover band and closing strip: fixed, 0.0% saturated pixels.)
2. MAJOR · typography lock ignored · with lock on (Lora/Lora) the board still sets Fraunces (361 chars), DM Mono (566),
   Bricolage Grotesque (119). Fix `js/aesthetics/mixed-type.js` tokens(): when `state.locks.typography`, map
   `--mt-f-b/-i` to the locked heading and `--mt-f-h/-m` to the locked body.
3. MAJOR · deck export Interface · "Paper" chip exports solid black, label gone (cross-cutting 1).
4. MINOR · deck cover band · "Specimen collage" (cutup) is grey dither noise with no letterforms; it doesn't read as
   Mixed Type. Fix: lead with "Type wall" (specimens) if the ownership table allows.
5. MINOR · A–Z specimen line orphans "YZ" at 390 and "Z" on the Material slide. Fix: `letter-spacing` −0.01em or
   `text-wrap: balance`.
6. MINOR · pastel-light muted 4.49 (cross-cutting 5).

Clean: A/B/C/D, palettes, four voices on one line, focus, hover, long/short names, logo, deck principles/color/type/
interface/product/do-don't/closing both modes, export of Patterns slide renders, mixed-type+rebus (glyph-for-"sign" is the
rebus joke) and blob-tracking+mixed-type blends.

## 11. dystopian-luxury

1. MAJOR · deck slides 2–10, recommended mode · content is 738px in a 720px slide, so the grey footer band (motto +
   "ARCHIVE REF … / 0n / 10") is cut off at the bottom with its text on the edge (also in the exported PNG). Fix
   `css/aesthetics/dystopian-luxury.css` slide rules: footer `margin-top: auto` inside a 100%-height slide, or trim 18px.
2. MAJOR · contrast, light mode · motto "Access is a privilege." and influences (10px) 3.83 warm, 4.04 pastel, 4.29 green,
   4.29 dark palette; deck footer 3.98:1 on all 10 slides. Fix: footer text → `--ab-ink` at 70% or a darker band text.
3. MAJOR · Don't "Add barcodes, grids or a colour bar" (`js/aesthetics/dystopian-luxury.js:232`) vs its own lead
   pattern "Cold cells" (a cell grid) on the cover band and closing strip, "Accession tags"/"Twill" barcode-like stripes,
   and the Color slide's proportion bar. Fix `js/patterns/fit.js:323` lead → a non-grid family (e.g. "Dust"), or reword.
4. MAJOR · deck Material · nearly empty: one 150px label card in a 1280 slide. Fix: `materialArt` showing hairline,
   blank label, security strip and the main-action square at scale.
5. MAJOR · blend as donor into dark-academia · the DL slab overlaps the DA headline card, the accession label is clipped
   ("026.114.3"), 31 contrast failures including the wordmark at 1.83:1. Fix: cross-cutting 4 + recolour donor strip.
6. MAJOR · blend DL + bento-grid · donor phone mock is cropped at the top ("On track" UI cut) and the giant word is lost.
7. MAJOR · deck export Interface · primary CTA exports as a blank black bar, "Catalogued" blank (cross-cutting 1).
8. MINOR · A · ≈100px dead band between Type and Interface (double section gap).
9. MINOR · UI labels set in Courier Prime while its own "why" says "small clinical labels in a neutral sans".
10. MINOR · "Ox" · the cropped giant word renders "O" and "X" at the two card edges with a ≈300px hole between.

Clean: B/C/D (MARI/GOLD split is clean), palettes (primary only as a small square), long name crop, logo, focus,
hover, deck cover/principles/color/type/interface/patterns/product/do-don't/closing content.

## 12. micrographics

1. BLOCKER · deck cover, both modes · the plate is forced to 400px tall (`css/aesthetics/micrographics.css:265`) but its
   contents need 455px: spec-table rows 06/07 collide with "© 2026 MARIGOLD STUDIO" and the ruler, the A.08 ORIGIN label
   overlaps the table, A.05 OPT. CENTER is hidden under the QR sticker ("TER" shows), A.02 is overlapped by the glyph.
   Fix: on the cover hide `.mga-stk-spec` and `.mga-nph` labels, or set height 460px and shrink the left column.
2. BLOCKER · deck export · cover stickers, all Color-slide swatches, segmented control and toggle export as black slabs
   (7 inset box-shadow rules). Fix: cross-cutting 1, or here replace each inset shadow with `outline: 1px solid
   var(--ab-ink); outline-offset: -1px`.
3. MAJOR · default fonts · pairing[0] IBM Plex Sans / IBM Plex Mono: the board's own fit check marks the recommended body
   "CONSIDER" (body picks are Inter / IBM Plex Sans, class neo-grotesk); the headline is 48px/600 on one line, not the
   loud one, and reads as a sibling of dystopian-luxury's neutral grotesk. Fix `js/aesthetic-meta.js:271`: make
   ['Archivo Black', 'IBM Plex Sans'] pairing[0] (both "Fits"). That puts Archivo Black on three defaults (RB, RM, MG);
   if that is not acceptable, keep IBM Plex Sans but load weight 700 and set the headline ≥72px, and add 'mono' to the
   body classes so IBM Plex Mono fits.
4. MAJOR · A hero · the A.04 ADVANCE label (`js/aesthetics/micrographics.js:170`, x 58, y 17) knocks a rectangular notch
   out of the M's right shoulder (labels knock out with the canvas colour, css:105-107); the glyph looks broken. Fix:
   x 50 (inside the V) or y 6 (above the cap line).
5. MAJOR · blend as donor into bauhaus-poster · plate leaders and crosshair markers run through "should feel". Fix:
   cross-cutting 4.
6. MINOR · deck Material · pattern only; the list (hairline, microtype, micro corner labels, crosshair marker) isn't drawn.
7. MINOR · D (390) and deck In-product · panel meta strings ellipsised ("8PX GRID ·…", "P…"), "[02] NEXT STEP" wraps.
8. MINOR · CTA hover `brightness(1.08)` and segment hover `--ab-hair-faint` are imperceptible (0.0% pixels change).
9. MINOR · pastel-light · all microtype 4.49:1 (cross-cutting 5).
10. MINOR · AI brief says headings weight 700 and radius 4px; the board renders 600 and 0 radius (cross-cutting 2).

Clean: B/C/D layout, hazard tape safety ink flips correctly on dark, palettes, focus, long/short names (glyph uses the
initial), logo, deck principles/type/do-don't/closing, micrographics+xerox-punk blend.

---

## Counts

BLOCKER 3 (cross-cutting export 1; micrographics cover collision; micrographics export, same root cause as the
cross-cutting one) · MAJOR 39 · MINOR 49.

---

## Fix log (qf2a)

Keys: micrographics, dystopian-luxury, editorial-serif, mixed-type, neo-deco, raw-brutalist. Files touched:
`js/aesthetics/{micrographics,dystopian-luxury,editorial-serif,mixed-type,neo-deco,raw-brutalist}.js` and the six
matching `css/aesthetics/*.css`. Cross-cutting items 1–7 and the blend items are CL1's (framework); re-exported after
CL1's inset-shadow sanitizer landed and fixed what was still wrong in these files.

**micrographics** — 1 BLOCKER fixed: cover plate fills the hero height (no forced 400px), takes 1.08fr of the row; the
spec sticker, A.02/A.04/A.05 callouts and the bottom ruler stay off the cover plate (`.mga-ncv`), QR/hazard stickers
re-placed; 0 collisions. 2 BLOCKER fixed (CL1 sanitizer + switch knob now drawn on the input itself, since html2canvas
skips an input's ::before; swatches, segments, toggle and stickers export). 3 MAJOR: shared request (pairing order).
Lower half made loud per coordinator: 01–05 display numerals in every palette chip (role ink), In-use percentages at
display size, the motto as a closing display line. 4 MAJOR fixed: A.04 sits above the cap line (y 7%), no notch. 6 fixed:
`deck.materialArt` draws hairline, microtype, corner labels and crosshair cells. 7 fixed: short section codes on phones
and In product; labels nowrap. 8 fixed: CTA hover inverts to ink (97% px change), segment hover 20% ink (30%).
Migration: `tokens(t, st)` + `abWeight`; inline weight picker in art replaced by `abWeight`.

**dystopian-luxury** — 1 fixed: slide footer bleeds to the slide's real padding (0 −56 −26), in.sh 738→720 on slides
2–10, flush on cover/closing. 2 fixed: footer text in `--ab-dl-ink`. 3 MAJOR: Don't reworded to "Add barcodes,
crosshairs or a second mark." (rules: "no colour stripe… no barcodes, crosshairs or ruled grid furniture on the page");
lead/suite change requested (shared). 4 fixed: materialArt shows hairline, blank label, security strip and the main
action with its 6px mark. 7 fixed: CTA exported blank because html2canvas drops an inline-flex button's label →
inline-block; toggle X drawn on the input (export). 8 fixed: 96px on both sides of every rule (was ~120 above 01/02).
9 shared request (meta "why" says neutral sans). 10 fixed: a short word ("OX") keeps its natural width from the left
edge instead of being tracked to both edges.

**editorial-serif** — 1 fixed: Pressed = transparent, 1px ink border, underlined label (Rest primary / Hover ink /
Pressed outlined; exports). 2 fixed: masthead fits one justified line up to 40 chars (longer: `.is-multi`, left
aligned); header metas nowrap, a long name wraps in the middle column (slides: ellipsis). 3 fixed: framed print moved
below the masthead band, right of the bottles (group y 160). 4 fixed: materialArt = paper sheet with the 3-over-1
masthead rule and hairline beside the duotone still life (`edsStill`, shared with the cover). 7 fixed: lower-third
scrim token `--ab-eds-scrim` (pastel kicker now ≥4.5), "No. 01" set in the darkest neutral. 8 fixed: cover copy column
56fr and art min-height 340 → cover headline 100.6px (was the 64px floor). 9 fixed: folio nowrap. C2 dead rules
(.ab-fieldlabel/.ab-input/.ab-status) removed after an in-page check (0 on board and deck). Migration: `tokens(t, st)`.

**mixed-type** — 1 MAJOR: shared request (fly-poster/glyphs → mono). 2 fixed: with `locks.typography` the four voices
and the condensed voice come from the locked heading/body faces (italic only where a face publishes one; `--mt-s-i`);
measured with Lora/Lora: board text Lora except the type-recommendation specimens (framework), deck Lora only.
4 declined here: lead family ownership (specimens is bauhaus-poster's lead) — see shared requests. 5 fixed: A–Z / a–z
carry a soft break at the middle (13+13). C4 dead `.ab-disc` rule removed. Migration: `tokens(t, view)`, `mtWeight` on
`abWeights`.

**neo-deco** — 1 fixed: slide header gap 14px, mark margin 6px (rotated corners clear the tag line). 2 fixed: Don't
rewritten to "Blur a ray, airbrush a glow, use a glassy gradient or frame anything in a round arch…" (deck: "Blur the
rays or airbrush a glow."); header radial glow removed. 3 fixed: ≤600px wordmark wraps centred (balance, .2em).
5 fixed: "Stepped" grade drawn as an exact 58×46 SVG background (`--ab-nd-step`; border-image does not export).
6 fixed: header tag in gilt text. 7 fixed: `--ab-nd-muted` (≥4.6 on panel and canvas), pastel light/dark clean.
8 fixed: title card fill opaque, rays and bands stop cleanly at its outer line. E1: `ndEsc` → `escapeHtml`. Migration:
`tokens(t, view)`.

**raw-brutalist** — 1 fixed: headline 22.6cqw (right edge 841 ≤ grid 845), band flush with column 1 (x 39). 2 fixed:
`.rba-th` ink. 3 fixed: strips size to their job line (no lone "≈10%"; balance under 780px). 4 fixed: "Mono caps,
numbered [01]". 5 fixed: `align-self: flex-start` on the wireframe hero label. 6 fixed: inactive segment hover inverts
(29% px change). Migration: `rbHeavy` removed → `abWeight(face, 900)` in `tokens(t, st)`.

## Fix log (qf2b)

Keys: bauhaus-poster, radical-memphis, groovy-70s, mid-century, naive-doodle, art-nouveau. Files touched: js/aesthetics and
css/aesthetics for those six keys only. Evidence: scratchpad/adv/qf2b/ (board sheets `sheet-post-*`, deck sheets `sheet-deck-*`,
WebKit `sheet-wk-*`, exports `exp/`, pattern candidates `c1..c9.png`, proposed suites `fit.proposed.js` + `fit.diff`).

- bauhaus-poster 1 (blend + riso): open, CL1. After 8d7fb49 the headline still overlaps the donor art box by 59px (headline
  bottom y488, art top y429) and "ALIVE" sits on the halftone; blendLegibility does not mark the poster hero.
- bauhaus-poster 2 (4.49 pastel muted): open, CL1 (aesthetic-board.js:101 loop still stops at `< 4.5`).
- bauhaus-poster 3: fixed. Inactive segment hover inverts to ink with canvas text (28.6% of pixels change).
- radical-memphis 1: fixed by CL1's header (long name wraps to two lines at 390, no clip, sticker inside the card).
- radical-memphis 2: fixed. Slab padding is now in em (0.06em top) and a blended headline keeps line-height >= 1.1, so each
  slab clears the line above (checked with riso-print: cap tops intact).
- radical-memphis 3: fixed. The offset sheet is a ::before shape in the card's stacking context (no box-shadow, no
  transform), with fixed 26px/18px radii. The deck PNG export now matches the live slide. Hover lifts the pill; press
  pushes it down. C5: the stray `-webkit-mask: none` was removed. M1/M4: tokens(t, state) + abWeight().
- groovy-70s 1: fixed. The pressed pill's label colour is picked for the darker fill (`--gv-on-pri-dark`); the rest/hover
  label was already 5.2:1.
- groovy-70s 2: fixed. Job and hex lines are at full opacity in --sw-on (pixel scan clean on all 4 palettes x 2 modes).
- groovy-70s 3: fixed. The cover arch stands on the meta row with its straight legs showing (352px tall, top unchanged).
  M1/M4: tokens(t, state) + abWeight(). E4: the 7 unread colour tokens were kept as builder-facing ramp values.
- mid-century 1: fixed by CL1's header (default and long names wrap at 390, no ellipsis).
- mid-century 2: shared request (fit.js, below).
- mid-century 3: fixed. printPrimary (mcPrint) shifts the warmed primary's lightness until its label reads >= 4.8:1
  (warm palette: #D66E3C -> #DA7B4D, charcoal label 4.93:1). The pixel scan no longer flags the CTA.
- mid-century 4: fixed. List numerals use the script colour only when it reaches 4.5:1, otherwise ink.
- mid-century 5: fixed. The hero art box now actually bleeds to the card edge (width: 100% + pad).
- mid-century 6: fixed. The In-product blob was pulled in (right: -24px), so the slide no longer scrolls.
- mid-century 7: fixed. At 390 the "prints as" line sits in the text column.
- mid-century 8: fixed. Inactive segment hover shows the secondary plane (27.3% of pixels change). E4: 2 unread data-URI
  tokens were dropped (--mc-spark, --mc-burst).
- naive-doodle 1 and 5: shared request (fit.js, below).
- naive-doodle 2 and 3: open, CL1 (brief data URIs; donor art in neo-deco is still drawn behind the frame and
  "made by hand!" is clipped at the top after 8d7fb49).
- naive-doodle 4: fixed. UI crayon streaks are now lighter (paper showing through), so pencil labels keep >= 4.6:1, and
  card body text on the mint card is ink.
- naive-doodle 6: fixed. The hill is a drawn mound that starts and ends inside the drawing.
- naive-doodle 7: fixed. The Material numeral tab and its label have a 10px gap.
- naive-doodle 8: fixed. coverDisplay is 0.92 and the cover art ratio is 1.15:1, so the cover drawing is 420x365 (sun
  about 185px; it was 235x188).
- naive-doodle 9: fixed. The note tucks up under the card, so its arrow lands on the main action (390 and 1280).
- naive-doodle 10: fixed. Hovering an inactive box starts colouring it in. C4: the dead `[data-stage="pattern"]` and
  `.ab-slide .ab-panel` selectors were removed. M1: tokens(t, state). E4: --nd-tick-pencil was dropped.
- art-nouveau 1: fixed. Cartouches are 62px (54px at 390) and the gaps are 12px. At 390 the gaps are 18px and 9px, frame to
  halo.
- art-nouveau 2 and 3: shared request (fit.js, below).
- art-nouveau 4: fixed. The curl sits to the left of the label, centred on it, clear of the letters and the field.
- art-nouveau 5: fixed. The cartouche fill now stays between its rules (CTA and state plates).
- art-nouveau 6: fixed. CTA hover is brightness(0.84), 34 levels of change on the fill. Inactive segment hover shows the
  halo tint with a gold underline (27.1%).
- art-nouveau 7 and 10: CL1 (brief). C4: the dead `.ab-slide .ab-panel` selectors were removed. E4: --an-capc-l/-r were
  dropped.

SHARED CHANGES REQUESTED (js/patterns/fit.js; exact text in scratchpad/adv/qf2b/fit.proposed.js; fitcheck2: 48 suites,
bad 0, 48 unique leads):
- mid-century: the lead is `chevron` "Girard chevrons" (a free family). The `tokens` family draws outlines in every fill
  mode (open, tint and mixed all stroke), so it was dropped. `halftone` and `cutup` are replaced by `oprings`
  "Atomic rings" and `zigzag` "Rickrack". Every entry has grain: 0 (its own Don't is "outlines, grain or misregistration").
- naive-doodle: "Marker garden" moves to colorway `duotone` (one crayon, a tint and a dark line: 3 inks). "Crayon pebbles"
  is replaced by `blades` "Grass tufts" (flat, take 0, grain 0).
- art-nouveau: the lead is `zigzag` "Japonisme waves" (flat, three soft hues; it replaces the shaded `waves` tubes).
  "Botanical frieze" is second (slip 0.15, grain 0), and "Iris stems" is flattened (take 0, grain 0, ink2).
- big-top (owner: big-top's fixer; its deck hides the band image, so this costs it nothing visible): the lead is
  `festival` "Confetti" (free; already in its suite, moved first). "Bunting" becomes `chevron`. This frees `zigzag`
  for art-nouveau.
- docs/patterns.md ownership table: mid-century chevron, art-nouveau zigzag, big-top festival. The free leads become
  bloomgrid, snow, satellite, tokens and blades.

Checks: node tests/run.js all passed; t5 harness 0 fails (briefs 192); src-verify-p5 0 fails / 0 mismatches; gore 6 keys
x 4 configs = 0; pixel contrast scan (4 palettes x 2 modes) clean except bauhaus pastel-light 4.49 (CL1); 390 long and
"Ox" names: no clip or page overflow; WebKit boards render (sheet-wk-*); a PNG export of one slide per key is not blank
(36 to 171 colour buckets).
