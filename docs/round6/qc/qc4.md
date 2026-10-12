# QC4 — Round 6 severe QC (packet rev 1)

Inspector: qc4 (Opus, read-only). Aesthetics: retro-futurist, industrial-device, industrial-hazard, blueprint,
transit-wayfinding, gorpcore, religious-futurism, cybersigilism, biomechanical-gothic, wabi-sabi, dark-academia,
curio-cabinet.

Method: every board A/B/C/D and all 20 deck slides per aesthetic viewed at full or 2-up size (contact sheets in
scratchpad `qc4w/`), zoom crops on anything suspicious; DOM scan in the live app (session `qc4`) for clipping,
overflow, overlap, contrast, placeholder text and unloaded font faces across 9 configs per aesthetic (warm rec/other,
green, pastel rec/other, dark-saturated rec/other, long name, short name) plus 390 px; blends; AI brief; PNG export.

Screenshot shorthand: `A/B/C/D` = `adv/qc/qc-<key>-A..D.png`; `dk/<slide>` = recommended-mode deck slide,
`dko/<slide>` = other-mode deck slide.

Severity: BLOCKER = visibly broken / unreadable / wrong in the default view. MAJOR = visible defect a client would
notice, or off-style. MINOR = polish.

## 1. retro-futurist

1. MAJOR · `dk/principles` principle titles ("one signaL coLour", "Horizon and orbit", "EXTEnDED TYPE") · Syncopate has
   unicase lowercase glyphs, so sentence-case titles render as a broken mix of small caps and capitals. Same on
   `dk/typography` label "syncopate" and board type card "Your heading: syncopate". The aesthetic's own rule is
   "uppercase, tight". · Fix `css/aesthetics/retro-futurist.css`: `text-transform: uppercase` on the deck principle
   title (`.ab[data-ae="retro-futurist"] .bd-pr-title` or the slide's principle-title selector) and on the type-card
   font-name samples when the heading face is Syncopate (or always, for this aesthetic).
2. MAJOR · `dk/cover` band and `dk/closing` strip (lead "Horizon", gradpanes, colorway `brand`) · the band is a
   teal/yellow/orange gradient wall; the aesthetic's rules say secondary and accent are "off the board" and "one hue
   per screen". The cover is the one place that most visibly breaks the rule. · Fix `js/patterns/fit.js:67`: set the
   Horizon colorway to `'mono'` (ink ramp with the signal only), or `duotone` primary/ink.
3. MAJOR · long brand name ("BallKnowledge Collective International") · header `.ab-wordmark` is truncated with an
   ellipsis 227 px over its box and its box overlaps `.ab-tag-pre "Design language /"` by 197×9 px. · Fix
   `css/aesthetics/retro-futurist.css`: allow the wordmark to wrap (`white-space: normal; max-width: 60%`) and drop
   letter-spacing above ~24 chars, or let `.ab-head` wrap the tag under the wordmark.
4. MINOR · `dk/patterns` "Orbital diagram" (oprings rings, freq 16) · at slide size it reads as a high-contrast
   target / op-art, which the don't-list forbids ("psychedelic swirls or op-art"). · Fix `js/patterns/fit.js:68`:
   `bands: 'one'`, larger freq spacing, tone 0.4 so it reads as thin orbits.
5. MINOR · `dk/patterns` "Readout" (typeterrain) · grey smeared noise, no legible readout characters at tile size. ·
   Fix `fit.js:72`: `size: 2` and tone 0.8.

Clean: hero planet limb (A/B/C), 390 layout, palette mapping on green/pastel/dark-saturated palettes (DOM scan: no
clipping, no contrast failures), console material slide, do/don't art, CTA/toggle/segmented states, short name "Ox".

## 2. industrial-device

1. MAJOR · `A`, `B`, `dk/color`, `dko/color` palette strip · the swatch counter on the Ink swatch is invisible: every
   swatch shows "01 / 03 / 04 / 05" but Ink has no "02" because `::before` is coloured `var(--ab-ink)` on the ink
   swatch. · Fix `css/aesthetics/industrial-device.css:139`: `color: var(--sw-on)` (the per-swatch on-colour already
   set inline) instead of `var(--ab-ink)`.
2. MAJOR · `A/B/C/D` hero OLED · the brand name is cut to "marigold …" at the default 15-char name (DOM: 97 px box,
   142 px text, ellipsis) in every palette and mode; long names worse. · Fix `industrial-device.css:83`: drop the
   ellipsis for the OLED name and either shrink (`font-size: clamp(.7em, …)`) or show the first word only from
   `js/aesthetics/industrial-device.js` (`name.split(' ')[0]`).
3. MAJOR (pre-known, confirmed) · `dk/cover` · headline wraps to 4 lines ("good / design / should / feel alive")
   with Space Grotesk and the device occupies ~21% of slide width, floating mid-slide; reads cramped left, empty
   right. · Fix `industrial-device.js` deck cover: smaller `coverDisplay` (≈56 px) so the line sets in 2–3 lines and
   scale the device to ≥45% width, bleeding right per principle 01 ("life size, bleeding off the edge").
4. MINOR · `A` palette strip labels · narrow chips wrap mid-value: "Text & icons · 15–/20%", "Main action · /≈10%",
   "One spark · /≤1%". · Fix `industrial-device.css` `.ab-sw-job { white-space: nowrap }` inside wide chips, or
   wrap value in a `nowrap` span.
5. MINOR · `dk/material`, `dko/material` · device crop cuts the top key row at half height and the dial at its
   centre; reads as an accidental crop rather than a deliberate bleed. · Fix the material art viewBox in
   `industrial-device.js` (`deck.materialArt`): crop on key-row boundaries.
6. MINOR · all configs · mono labels request Azeret Mono 500 (`.idv-pr`, key legends) but only 400 is loaded; with
   `font-synthesis: none` they render 400. · Fix: add 500 to Azeret Mono weights in `js/data.js` FONTS or set the
   labels to 400.

Clean: B (dark) mode, green palette, 390 layout, toggle/CTA up/hover/down states, in-product slide, do/don't,
closing, pattern suite, PNG export (see Export).

## 3. industrial-hazard

1. MAJOR · `A/B/C`, `dk/cover`, `dk/material` hero plate · the giant "07" stencil sits on top of the enamel
   nameplate so "MODEL" is hidden ("…MR-7 / S/N…"), and the red lockout hasp line crosses the tag text "J. KOWAL".
   Text crossing art. · Fix `js/aesthetics/industrial-hazard.js:120-138`: move the nameplate `y` above the digit
   cap height (or start it at x≈60 right of the "0"), and route the hasp path below the tag text.
2. MAJOR · `A` (all palettes) header + interface · `.ab-tag-pre "Design language /"` and inactive segments
   "Build"/"Launch" are #A5A4A2 on #4E4C4D = 3.42:1 at 10–11 px (needs 4.5). · Fix
   `css/aesthetics/industrial-hazard.css`: muted-on-plate colour → mix(ink, plate, .85) (≥ #C4C3C1).
3. MAJOR · Distinctness with gorpcore · same default heading face (Barlow Condensed), same orange square "M" mark
   + condensed caps wordmark in a black header bar, same charcoal ground in hazard-rec / gorpcore-other. The decks'
   headers are near-identical at thumbnail. · Fix `js/aesthetic-meta.js`: industrial-hazard pairings[0] →
   `['Big Shoulders Display','IBM Plex Sans']` (already in its picks; stencil signage) and keep Barlow for gorpcore.
4. MINOR · `dk/patterns` "Hazard tape" tile and `dk/cover` band · a stray diagonal yellow sliver crosses the middle
   band (weave `skew: 1` seam). · Fix `js/patterns/fit.js:292` `skew: 0` or fix the weave skew seam in
   `js/patterns/families`.
5. MINOR · `dko/patterns` (yellow mode) "Hazard tape"/"Hazard stripes" · the fixed `safety` colourway turns
   orange/red on the yellow ground, while in dark mode it is yellow/black. A fixed colourway should not change. ·
   Fix engine `E.COLORWAYS.safety` to hard yellow+black regardless of ground.
6. MINOR · `.ab-sub-lead`, `.ab-row-name` request IBM Plex Sans 700, not loaded (600 max) — renders 600. · Fix
   weight to 600 in `industrial-hazard.css` or load 700.
7. BLOCKER · `dko/interface` (yellow mode deck) segmented control · active "DESIGN" is #2E282A on #161616 = 1.25:1
   (invisible), inactive "BUILD"/"LAUNCH" #5F4F20 on #262626 = 1.89:1. The board's B mode is fine, so the deck
   cell picks up the light-mode ink/olive tokens on the dark slot plate. · Fix `industrial-hazard.css`: seg labels
   inside the plate must use the plate's own ink (`--ab-hz-plate-ink`, light) regardless of `bgMode`; set it on
   `.ab-seg` not on `.ab`.
8. MAJOR · `dk/closing` · highlight "IT." in danger red #C8102E on charcoal #2C2A2B = 2.42:1 at 104 px (needs 3:1);
   it reads as a dark hole, unlike `dk/principles` where the same word sits on yellow. · Fix
   `industrial-hazard.css` closing `.ab-hl`: on charcoal use the safety yellow (or brighten red to ≥ #E5303F).
9. MAJOR · Export (`rasterizeDeckSlide`, `dk/material` tested) · the header mark exports as a black square
   (orange `--ab-primary` fill and the "M" lost), the header rivet row is gone and the footer gains a grey band;
   the PNG does not match the slide. · Fix `js/brand-deck.js` rasterizer: inline computed `background-color`/`color`
   for `.ab-mark` (custom property set on `.ab[data-ae]` is not resolved in the clone), or set the mark fill inline
   in `industrial-hazard.js`.

Clean: other (yellow) mode board, interlock states normal/caution/danger, 390, green/pastel/dark palettes,
annunciator list.

## 4. blueprint

1. MINOR · `dk/cover` title block · headline sets one word per line ("GOOD / DESIGN / SHOULD / FEEL / ALIVE",
   5 lines) in a narrow title block; the board sets it in 2 lines. · Fix deck cover title size in
   `css/aesthetics/blueprint.css` (~44 px) so it sets in 2–3 lines like the board.
2. MINOR · `A/B` interface and `dk/interface` · selected segment "DESIGN" is set over a diagonal hatch; strokes run
   through the letters (legibility ~3:1 locally). · Fix `blueprint.css`: put a solid canvas-coloured backing behind
   the label (`background: var(--ab-canvas)` on the label span) inside the hatched tab.
3. MINOR · `dk/patterns` "Section hatch" and `dk/closing` strip · one bright white diagonal line crosses the middle
   band — same weave-skew seam as industrial-hazard. · Fix `js/patterns/fit.js:195` `skew: 0`.
4. MINOR · `dk/dodont` · two text columns only, half the slide empty — the one deck slide with no drawing. · Fix:
   add the line-type set (`deck.dodontArt`) as in other aesthetics.

Clean: muted text measured 5.1:1 (#9DA7B8 on #173363), light "patent" mode, 390, all palettes (canvas fixed,
client hues only in revision cloud/status), BOM list, title block, Share Tech Mono 600 renders 400 (no faux bold).

## 5. transit-wayfinding

1. BLOCKER · `dko/closing` (light mode) · the closing brand name "Marigold Studio" is white on the light concourse
   (#E8E8E4) — invisible. · Fix `css/aesthetics/transit-wayfinding.css`: the closing wordmark uses the panel ink
   (white) but sits off-panel in light mode; set `color: var(--ab-ink)` there, or put it on a black sign panel.
2. MAJOR · `dk/interface`, `dko/interface` segmented control · the control overflows its card: the "1" chip sticks
   out ~40 px left of the black panel and "Launch" is clipped at the right edge. · Fix `transit-wayfinding.css`:
   seg control inside the deck interface card needs `max-width: 100%; flex-wrap: nowrap; gap` reduced, or the deck
   card padding/`min-width: 0`.
3. MAJOR · `dk/cover`, `dk/material`, `D` · the network map is cropped so station labels are cut to fragments ("e",
   "Lc", "ay", "Id Quay", "Looko") at the frame edges. · Fix the map viewBox / crop in
   `js/aesthetics/transit-wayfinding.js` art for the deck/390 sizes (keep the whole map, or drop labels that fall
   outside the crop).
4. MAJOR · `A/B/C` map · route lines run through labels: yellow line crosses the "G" of "Gallery" and covers part
   of "Studio". · Fix label offsets in `transit-wayfinding.js` map (move "Gallery" +14 px right, "Studio" left of
   the line with a canvas halo `paint-order: stroke`).
5. MINOR · everywhere Overpass is used · middle-dot separators hug the next word ("Routes M ·A ·R ·step-free",
   "Plat 1 ·In review", "Directional ·Coded ·Calm", "Overpass ·in use") — Overpass's U+00B7 has a large left and
   no right side-bearing. · Fix: wrap separators in a span with `margin: 0 .25em` or use U+2022 at 0.6em in
   `transit-wayfinding.css`/`.js`.
6. MINOR · 390 (`D`) footer · "Colour means a route." strip wraps the reference line to 3 lines with an orphan
   "Calvert / Tokyo Metro numbering". · Fix: hide the reference list under 480 px.

Clean: board A/B/C dark & light, sign-panel header, palette as route bullets, in-use departures list, toggle,
Scheduled/Approaching/Diverted states, green palette mapping, short name.

## 6. gorpcore

1. MAJOR · `dk/cover` band, `dk/closing` strip, `dk/patterns` lead "Lake map" (sonar, brand) · at band size the
   salmon/grey blobs read as camouflage — the do/don't slide says "Don't: use camo". · Fix `js/patterns/fit.js:388`:
   lead with "Relief" or "Ripstop" (mono), or set sonar `contours: true, land: 0.2` so contour lines dominate.
2. MAJOR · long brand name · the hang-tag brand line "BallKnowledge Collective International" overflows the tag
   and the board card (text spans x 659–908 of an 884 px card) and collides with "GC—044". · Fix
   `js/aesthetics/gorpcore.js` tag: truncate to first two words or scale text with `textLength` + max width.
3. MAJOR · Distinctness with industrial-hazard (shared Barlow Condensed) · see hazard #3; gorpcore's dark mode deck
   header is the same black bar + orange "M" square + condensed caps wordmark. · Fix on the hazard side (above); if
   kept, change gorpcore's mark to the carabiner/grommet circle.
4. MINOR · `dk/color` · "Second panel · contours · ≈8–/12%" breaks the range across lines. · Fix: nowrap on the
   value in the swatch job line.
5. MINOR · `dk/patterns` "Relief" and "Scree" · blurred grey cloud / soft blobs; read unfinished next to the crisp
   contour art. · Fix `fit.js:389,391`: relief `dither: 0.5, levels: 5`; scree `mode: 'flat'`.

Clean: board A/B/C, hang-tag hero, trail-log list with elevation sparklines, segmented/CTA/toggle, fabric chips,
390, pastel/dark palettes.

## 7. religious-futurism

1. MAJOR (pre-known, confirmed) · `dk/patterns` lead "Stained glass" (tissue, tone 0.5) and `dk/closing` strip · reads
   as muddy brown/teal tiles with dark walls, not lit glass; the closing strip is the largest pattern in the deck. ·
   Fix `js/patterns/fit.js:259`: lead with "Clerestory glass" (gradpanes) or "Rose windows", or raise tissue tone to
   0.8 with gold walls (`wall` in ink2 = gold).
2. MAJOR · `B` (light mode) hero · the window panes collapse to a near-uniform dark slate mosaic; no lit colour
   survives, so the light board loses its one image idea ("brand colour is the light"). · Fix
   `js/aesthetics/religious-futurism.js` art: keep the lit pane colours in light mode (do not ink-tint them), only
   the leading and halo change with mode.
3. MAJOR · 390 + long name · centred wordmark does not wrap and spills both card edges (text x −74..466 of 350),
   showing "NOWLEDGE COLLECTIVE INTER". · Fix `css/aesthetics/religious-futurism.css`: `.ab-wordmark { white-space:
   normal; text-wrap: balance; font-size: clamp(14px, 5cqw, 22px) }`.
4. MINOR · `A`, `dk/interface` relic states · UNLIT and DAWN are two near-black 2×2 panes (dark slate vs black); the
   states are indistinguishable at a glance. · Fix `religious-futurism.js` state art: DAWN = one lit pane in the
   primary, FULL LIGHT = all four.
5. MINOR · board footer `::after` "Matins · Lauds · Vespers · Compline" · #999795 at opacity .6 on #0D0B0B ≈ 3.05:1
   at 9 px. · Fix `religious-futurism.css`: drop the opacity (use `--ab-muted` at 1).
6. MINOR · headline requests Michroma 200 and CTA EB Garamond 500, neither loaded (`font-synthesis: none`, so they
   render 400). · Fix weights to 400 in `religious-futurism.css`.

Clean: dark board, palette as glass phials, type cards, list with bead progress, 390 at default name, pastel/dark
palettes, deck cover/principles/typography, PNG export of `dk/cover` (non-blank, matches slide).

## 8. cybersigilism

1. MAJOR · `A/B` headline, `dk/cover`, `dk/principles`, `dk/closing` · the thorn ornament attached to the highlight
   word crosses the letters ("feel ⟋alive", "kept ⟋apart.", a stray thorn after "should" on the cover). The
   aesthetic's own Don't says "Run ornament through text" and principle 03 is "Ornament keeps its distance". (Also
   in the R6 checkpoint as a known cover issue.) · Fix `css/aesthetics/cybersigilism.css` (`.ab-hl` thorn
   pseudo/SVG): anchor the thorn outside the word box (`left: 100%; margin-left: .25em; top: -.8em`) and never on
   the cover's line breaks.
2. MINOR · Distinctness with bento-grid (shared default Inter Tight/Inter) · judged NOT siblings: black/bone
   ground, hairline thorn art, mono labels and corner thorns make it unmistakable; bento shares only the face. No
   change required; optional: make Grenze Gotisch the cover display face only.
3. MINOR · `A/B`, `dk/color` palette · Primary/Secondary/Accent chips render as black (dark) or pale (light) plates
   with a faint coloured edge glow; the hex says #E4572E but no orange is visible. · Fix `cybersigilism.js`
   swatch: show a 4–6 px solid stripe of the real colour inside the plate.
4. MINOR · `dk/patterns` "Mirrored glyphs" (kaleidopix) is a chunky pixel checker and "Hairline field" a
   fingerprint vortex; neither is hairline/thorn. · Fix `fit.js:284,288`: swirl → `field: 'flow'`, replace
   kaleidopix with `flow` thorns or `stipple` sparse.
5. MINOR · hero caption "i1 · 636 lines" is ~6 px, unreadable. · Fix: 9 px min in `cybersigilism.css`.

Clean: dark/light boards, segmented/CTA/toggle states, sigil states (etched/inked/barbed distinct), list, 390,
pastel/dark palettes, material slide, PNG export of `dk/cover`.

## 9. biomechanical-gothic

1. MAJOR · `B` (light mode) muted text · #585353 on #C8C6BE = 4.42:1 (warm), 4.10 (pastel), 3.95 (dark-saturated)
   for card body 14 px, field labels, state names, type classes. · Fix `css/aesthetics/biomechanical-gothic.css`
   light mode: `--ab-muted: mix(ink, canvas, .82)` (≥ #45403F).
2. MAJOR · Blend `biomechanical-gothic ← retro-futurist` (type channel) · the arched type card breaks "Syncopate" as
   "syncopat / e" (broken word). · Fix `biomechanical-gothic.css`: `.ab-type-name { overflow-wrap: normal;
   font-size: clamp(16px, 2.2cqw, 26px) }` inside the arch.
3. MINOR · `A/B` hero caption "PLATE III · THE NAVE, FROM THE THRESHOLD" sits on the ribbed art; in light mode it
   is grey on grey (~2:1 over the ribs). · Fix: move the caption below the plate or add a canvas scrim.
4. MINOR · `dk/patterns` "Ossicles" (pebbles) shows one bright white blob and "Spore colony" reads as cartoon cells;
   both break the dim bone palette. · Fix `fit.js:310-311`: tone 0.35, `lit: 0.15`.

Clean: dark board, arched swatches, ribbed CTA/segmented, iris states (closed/parting/open distinct), list, 390,
pastel/dark palettes, deck cover/material/closing, do/don't.

## 10. wabi-sabi

1. MAJOR (pre-known, confirmed) · `dk/patterns` lead "Ikebana" (inkstill) · a flat grey mass with two faint line
   vessels; reads unfinished/mostly blank next to the other tiles. · Fix `js/patterns/fit.js:348`: `masses: 3,
   dither: 0.5`, tone 0.6, or lead with "Suminagashi".
2. MAJOR · `dk/patterns` "Stepping stones" (brand) and "Ink-wash ridges" (duotone) · saturated salmon/teal/yellow
   blobs and a pink ridge field — the slide breaks the aesthetic's own Don't "Use saturated brand colour at full
   strength". · Fix `fit.js:352-353`: colorway `mono` (or tone 0.3) for both.
3. MINOR · `A/B` palette · the Accent chip is shu vermilion (fallback seal, correct per rule) but the label reads
   "#FFC914" with a yellow dot; the swatch contradicts itself. · Fix `js/aesthetics/wabi-sabi.js` swatch: show the
   seal hex and "(client accent below 3:1 on paper)".
4. MINOR · `A`, `dk/interface` segmented · the active state is only a 4 px dot under "Design"; at a glance all
   three tabs look the same. · Fix `wabi-sabi.css`: active label in ink at 500 + the dot; inactive in muted.

Clean: hero chawan with one seam and one seal, staggered headline (lines overlap 3–10 px by design; no glyph
collision), drip swatches, glaze states raw/glazed/mended distinct, list, closing, 390, pastel/dark palettes,
blends with clay (base) and gorpcore (donor).

## 11. dark-academia

1. MAJOR · `dk/cover` band, `dk/closing` strip, lead "Endpapers" (marble, brand, tone .75) · a loud teal/orange/
   yellow psychedelic marbling; the cover's loudest element reads acid-graphics rather than "candlelit". · Fix
   `fit.js:356`: colorway `night` or tone 0.45 so it reads as a dark Turkish endpaper.
2. MAJOR · `A/B`, `dk/interface` segmented control (book spines) · DESIGN/BUILD/LAUNCH are three spines in
   different cloth colours; no spine reads as selected (no pull-out, no ribbon). · Fix `dark-academia.css`: active
   spine pulled forward (translateY −6 px + shadow) and a ribbon marker.
3. MINOR · `dk/patterns` "Tweed" renders orange/black/white bold stripes (reads as signage, not tweed) and
   "Library arches" as hard orange bars. · Fix `fit.js:357,360`: tone 0.5, colorway `night`.
4. MINOR · `A` vs `B` list · the pager dot under the card catalogue is solid black in dark mode and a hollow ring in
   light mode. · Fix: same token in both modes in `dark-academia.css`.

Clean: hero title page + bookshelf, framed swatches, type card, catalogue-card list, binding states
cloth/gilt/sealed distinct, 390, pastel/dark palettes, material ex libris, do/don't, closing.

## 12. curio-cabinet

1. MAJOR (pre-known, confirmed) · blend base curio-cabinet + y2k-chrome type · list numbers overflow their box:
   "02" 30/29 px, "03" 31/29 px (2 px, not 1). · Fix `css/aesthetics/curio-cabinet.css`: `.ab-row-n { min-width:
   3ch; }` (or `width: auto`).
2. MAJOR · blend `curio-cabinet ← xerox` (colour channel) · highlight "ALIVE" in the client accent #FFC914 on the
   cream label = 1.22:1. · Fix `curio-cabinet.css` `.ab-hl.cc-it`: fall back to primary/ink when accent < 3:1 on the
   label paper.
3. MINOR · `A/B`, `dk/interface` states Found / Pinned / Treasured · three identical teal marbles; only a 6 px yellow
   dot and a faint ring differ. · Fix `curio-cabinet.js` state art: Found = loose, Pinned = brass pin through a tag,
   Treasured = gilt ring + label.
4. MINOR · `dk/patterns` "Specimen trays" is a saturated orange/teal op-tile and "Still life" crude blobs. · Fix
   `fit.js:422-423`: colorway `night`, tone 0.6.
5. MINOR · Distinctness with dark-academia · both dark wood ground, brass/gilt "M" plate, Caslon serif and
   paper-label cards; at thumbnail the decks are close. · Fix: keep curio's baize green canvas in light mode too and
   drop Libre Caslon from dark-academia's picks.

Clean: cabinet hero with numbered collection key, deliberate empty compartments (per its own rule), drawer
swatches, typed labels, list, brass motto plate, 390, pastel/dark palettes, material Haeckel plate, closing.

## Cross-cutting (all 12; framework files)

1. MAJOR · long brand name ("BallKnowledge Collective International") at 390 · in all 12 the header wordmark
   truncates with an ellipsis and its box overlaps the "Design language / <name>" tag (overlaps 59–122 px);
   religious-futurism overflows (see RF 3). At 1280 retro-futurist and gorpcore also fail. · Fix
   `css/aesthetic-board.css` `.ab-head`: `flex-wrap: wrap` with the tag dropping under the wordmark below ~520 px,
   wordmark `white-space: normal`.
2. MINOR · `dk/dodont` numbered marks in the client primary #E4572E: 3.43:1 (retro-futurist), 3.87:1
   (industrial-hazard), 3.04:1 (religious-futurism other), 4.18:1 (industrial-device other) at 14 px. · Fix
   `css/brand-deck.css` `.ab-deck-mark`: bold 16 px+ or ink colour with a primary rule.
3. Blends (24 rendered: each of my 12 as base and as donor, Bold, all channels). Defects beyond those listed above:
   - MAJOR · `industrial-hazard ← mid-century`: highlight "alive" yellow on the yellow hero, 1.07:1 (invisible). Fix
     `css/blend.css` or hazard: highlight must re-check contrast against the base hero ground.
   - MAJOR · `retro-futurist ← holo-iridescent`: wordmark truncates "MARIGOLD STU…" at the default name (holo's
     wide type in retro's header) and holo's giant "M" glyph spills past the card (x 671–998 of 884). Fix: blend
     header wordmark `white-space: normal`; clip donor `.hof-mark` to the art frame.
   - MAJOR · `frutiger-aero ← dark-academia`: headline set directly over the bookshelf art; "alive" red on red
     spines is unreadable. Fix: blend art behind headline needs a scrim (frutiger base) when donor art is busy.
   - MINOR · `cybersigilism ← blob-tracking`: donor art labels "22", "DOORWAY 0.88" render outside the card
     (x 889–1141 of 884); `mid-century ← industrial-device`: device art cropped through the dial. Fix donor art
     viewBox fit in `js/blend.js`.
   - Read as one design with no collisions: art-nouveau ← retro, device ← neo-brutal-pop, bento ← hazard,
     blueprint ← pirate-broadcast, transit ← riso, hazard ← transit, gorpcore ← frutiger, neo-brutal-pop ← gorpcore,
     religious ← raw-brutalist, liquid-glass ← religious, pirate ← cybersigilism, raw-brutalist ← biomech,
     wabi ← clay, gorpcore ← wabi, dark-academia ← groovy, xerox-punk ← curio.
4. Export · PNG via the Download-PNG path (`rasterizeDeckSlide`) for 4 slides: cybersigilism cover,
   religious-futurism cover, transit-wayfinding closing, industrial-hazard material. All 1280×720, non-blank
   (stddev 41–70), art intact. One defect: industrial-hazard mark (see hazard 9).
5. AI brief (`buildAiBrief`) for all 12: no placeholders, fonts and mode match the board. Contradictions: the
   retro-futurist brief lists an "Op-art rings" pattern while its rules forbid op-art (retro 4); the gorpcore brief
   forbids camo while its lead pattern reads as camo (gorpcore 1).
6. Default-face sharing verdicts: industrial-hazard & gorpcore — siblings at deck-header level (fix on hazard,
   hazard 3); cybersigilism & bento-grid — not siblings (cybersigilism 2).

## Counts

BLOCKER 2 · MAJOR 33 · MINOR 34.

Ten worst:
1. BLOCKER transit-wayfinding `dko/closing`: brand name white on the light concourse, invisible.
2. BLOCKER industrial-hazard `dko/interface`: segmented labels 1.25:1 and 1.89:1.
3. MAJOR industrial-hazard hero plate: "07" stencil covers "MODEL" on the nameplate; hasp line crosses "J. KOWAL".
4. MAJOR transit-wayfinding deck interface: segmented control overflows its card ("1" chip outside, "Launch"
   clipped); deck/390 map crops station labels to fragments.
5. MAJOR cybersigilism: thorn ornament runs through the headline word, breaking its own "ornament keeps its
   distance" rule.
6. MAJOR industrial-device: Ink swatch number invisible; OLED brand name truncated at the default name.
7. MAJOR retro-futurist: Syncopate unicase lowercase renders as broken mixed case on the principles slide; cover
   band uses three hues against "one hue per screen".
8. MAJOR religious-futurism: "Stained glass" lead reads as brown tiles; light-mode windows lose all colour.
9. MAJOR industrial-hazard export: the header mark exports as a black square.
10. MAJOR long brand names: all 12 headers truncate and overlap the tag at 390; gorpcore's hang tag overflows the
    card at 1280.

## Fix log (qf4a)

Keys: industrial-device, industrial-hazard, transit-wayfinding, gorpcore, retro-futurist, blueprint. Files touched:
`js/aesthetics/<key>.js`, `css/aesthetics/<key>.css` for the six keys only. Work dir: scratchpad `adv/qf4a/`.

**retro-futurist**
1. fixed: heading-face samples set in caps (`.ab-deck-ptitle`, heading type-card picks and name, typography slide face name).
2. shared change requested (fit.js:67 Horizon `brand` → `mono`); checked with an in-session suite override.
3. fixed: board wordmark wraps (framework change by CL1, scan 0 at 1280 and 390); slide headers wrap the wordmark too (closing overlap 12×11 → 0).
4. shared change requested (fit.js:68 op-art rings → flow "Trajectories").
5. shared change requested (fit.js:72 Readout size 2, tone 0.8).
Also: the lit first-row lamp rule never matched (`.ab-row:first-child`, list opens with `.rf-loghead`) → `.rf-loghead + .ab-row`; do/don't SVGs get an intrinsic size so the PNG export matches.

**industrial-device**
1. fixed: swatch counter uses `var(--sw-on)`.
2. fixed: OLED shows the first word, sized to fit (no ellipsis).
3. fixed: `deck.coverDisplay 0.42`, `coverMin 50` (headline ≈55px, 3 lines); cover art end-aligned so it bleeds right (≈48% of the slide).
4. fixed: `text-wrap: balance` on the job line (values are never split).
5. fixed: Material zoom 1.5 about (97.8%, 93.75%): the view starts in the gap above the top key row and between keybed keys.
6. fixed: printed legends at 400 (Azeret has 400/600); medium weights from `abWeight` tokens; deck "Aa" chips at a real weight and 24px.
Also: dead `.idv em` removed; private escape helper removed.

**industrial-hazard**
1. fixed: nameplate drawn over the numeral; numeral cap height pinned (`font-size-adjust: cap-height 0.62`, top at y 17.5 under a plate ending at 14.8; bridges rescaled); tag raised 5 units clear of the mimic line. Checked in Big Shoulders, Barlow Condensed, Oswald and Anton, Chromium and WebKit.
2. fixed: plate legends lifted to ≥4.6:1 (tag 4.89, idle keys 4.89, was 3.42).
3. shared change requested (meta default Big Shoulders Display / IBM Plex Sans); CSS verified with it.
4. declined in my files: the sliver is the weave family's deliberate spark stripe, not a skew seam (`skew: 0` keeps it, checked). Framework request filed.
5. framework (engine `safety` colourway), request filed.
6. fixed: body weights `--ab-hz-bw` = abWeight(body, 700) (600 for Plex), heading `--ab-hz-hw`; type-card picks at each face's real weight.
7. BLOCKER fixed: the segmented bank and the switch keep plate legends wherever they sit. Deck other mode 15.86 / 7.87 / 7.87:1 (was 1.25 / 1.89); rec 10.83 / 4.89 / 4.89.
8. fixed: on dark concrete the word is lamp red #F0353F (closing 3.59:1); hero and principles keep #C8102E on yellow.
9. root cause: `.deck-export-host` sits at `left: -10000px`, which breaks html2canvas's box-shadow mask: outer shadows paint over their box (the mark turns black) and inset shadows tint it (footer band). This hits every aesthetic with box-shadows (device keys too). Framework request filed; the in-session fix was checked. In the hazard file, lamp rings are borders (round spread shadows export as discs) and the rivet row is an SVG tile.

**blueprint**
1. fixed: `coverDisplay 0.34`, `coverMin 40` (3 lines). 2. fixed: a canvas plate behind the selected label inside the hatch.
3. as hazard 4 (spark stripe): framework request. 4. fixed: do/don't pair art (line-type set vs filled, rounded, shaded part), exports correctly.
Also: heading weights from `--bp-hw`; private escape helper removed; brand name read from the tokens state.

**transit-wayfinding**
1. BLOCKER: resolved by CL1, which removed the closing wordmark from the framework slide. Closing other mode scans 0 and exports correctly.
2. fixed: smaller platform tabs in deck cells (no overflow).
3. fixed: map `meet`; a label is drawn only where it fits whole in that view box; narrow box 182–546; lines, river and paper extended; hub name cut to whole words before route 1.
4. fixed: Gallery moved to (419,159) under its tick; the Studio station moved to y 240, labelled right of the line.
5. fixed: our separators are a neutral-sans span or tspan; framework copy gets U+00B7 from a one-glyph local face (`tw-dot`).
6. fixed: reference list hidden under 480px. Also: the sign's destination wraps instead of using an ellipsis.

**gorpcore**
1. shared change requested (fit.js:388 Lake map `mono`, land 0.25, size 2, speckle 0); checked on the band and closing strip.
2. fixed: tag name is whole words up to 16 characters; a single long word is scaled. 3. fixed through hazard's heading change, plus the mark is now a round grommet with a silver rim.
4. fixed: balanced job line. 5. shared change requested (fit.js:389, 391). Also: dead `.ab-deck-prodframe > .ab-head` rule removed.

**Migration**: all six `tokens(t, state)` read the argument (global only as fallback); `twWeight`, `gcWeight` and `rfWeight` were replaced by `abWeight`; private escapes were removed in the device, hazard and blueprint files.

**Checks**: board DOM scan at 1280 px (9 configs × 6 keys) found 0 issues, excluding the 9 transit diamond-bullet false positives (the letter sits on a `::after` diamond, measured 5.70–17.97:1). The scan at 390 px (6 configs) found 0, excluding the device hero crop, which cuts the device by design. The deck scan (rec, other, long, short) found 0, excluding framework-wide items. Gore: 0 across 24 combos, and 0 for hazard on the current Barlow default. WebKit boards are clean. `node tests/run.js` passed; harness 192 briefs with 0 fails; src-verify-p5 53 families with 0 fails. PNG exports are non-blank (stddev 32.5–80.2).

## Fix log (qf4b)

Keys: religious-futurism, cybersigilism, biomechanical-gothic, wabi-sabi, dark-academia, curio-cabinet.
Evidence in scratchpad `adv/qf4b/` (sheets `sheet-final-<key>.png`, decks `sheet-dk-<key>.png` /
`sheet-dko-<key>.png`, WebKit `sheet-wk-<key>.png`, exports `png/`, `sheet-png-export.png`).
Deck sheets were shot with the requested fit.js suites injected in-page (`adv/qf4b/fitpatch.js`).

- RF 1 · lead → shared request (below): "Pixel rose" bloomgrid (free lead; Richter's mirrored pixel lanes,
  dark heart, lit teal/brand glass). The closing strip and wall tile now read as lit glass.
- RF 2 · fixed: light-mode windows keep the lit glass colours (the "outside" darkening is gone); only leading,
  halo and the dark-only backlight/floor cast change with mode.
- RF 3 · fixed: wordmark wraps balanced on the centre axis (390 + long name: no overflow).
- RF 4 · fixed: Unlit = four dark panes; Dawn = one pane lit in the primary glass; Full light = four lit panes
  (primary, secondary glass, two cool neutrals) with a halo.
- RF 5 · fixed: canonical hours at full `--ab-muted`, 9.5px.
- RF 6 · fixed: hairline headline weight and CTA weight come from the face's real weights
  (`abWeights`/`abWeight`, tokens `--rf-hl-w`, `--rf-cta-w`); no faux 200/500 left.
- CS 1 · fixed: one thorn sprig grows to the right of the word, 0.22em clear of the last glyph, inside the
  word's own line box and clipped there; the word reserves the sprig's room (margin-right 1.45em) so the deck
  fit keeps it in the column. Board, cover, principles and closing checked: no thorn touches a letter.
- CS 2 · no change (inspector's verdict: not siblings).
- CS 3 · fixed: a 5px solid stripe of the real colour across each brand plate.
- CS 4 · shared request: swirl → flow; kaleidopix → "Shed thorns" (blades, hairline slivers).
- CS 5 · fixed: plate caption 15 (viewBox) units, ≥9.4px rendered at 390, moved clear of the roots; hidden on
  the deck cover where the art fades into the headline column.
- BG 1 · fixed: light-mode `--ab-muted` pulled toward ink until ≥4.6:1 on the cast plates and the ground.
- BG 2 · fixed: type picks never break inside a name (overflow-wrap normal; size capped so an 8.2em one-word
  name fits the arch column). Retro-futurist and religious-futurism donors, 8 widths × 2 modes: 0 broken words.
- BG 3 · fixed: caption and fig. label on a small canvas plate in ink, 9–10px.
- BG 4 · shared request: Spore colony quieter (no nuclei, tone .3); Ossicles → "Trabecula" halftone .35.
- WS 1 · lead → shared request: "Washi leaves" (snow, mono, .35).
- WS 2 · shared request: Stepping stones and Ink-wash ridges mono, tone .4.
- WS 3 · fixed: the accent code and dot name the seal shown (#C8442F) and add "Shu seal · client accent
  #FFC914 is under 3:1 on paper" when it falls back.
- WS 4 · fixed: selected tab in ink at the face's real medium weight + the sesame dot; others muted.
- DA 1, DA 3 · shared request: Endpapers duotone .5 (oxblood marble), Tweed duotone .5, Library arches duotone .5.
- DA 2 · fixed: inactive spines dimmed; the selected spine is raised, scaled, gilt-edged with a cast shadow and
  a rubric silk ribbon draped over the shelf lip.
- DA 4 · fixed: the catalogue-card rod hole is the same dark drawer in both modes.
- CC 1 · fixed: number column `minmax(3ch, max-content)` (y2k-chrome donor: 29/30/31 of 29/30/31 px).
- CC 2 · fixed in curio: the hero label scopes `--ab-accent-ink` to `--ab-cc-label-hl` (accent, else primary,
  else label ink, ≥3:1 on the cream paper). Xerox donor: highlight renders label ink.
- CC 3 · fixed: Found = loose marble rolled to the corner, dusty; Pinned = paper tag with a brass pin;
  Treasured = gilt ring + brass name plate.
- CC 4 · shared request: Specimen trays and Still life duotone .6.
- CC 5 · fixed in curio: light mode keeps the baize as a pale sage felt; shared request to drop Libre Caslon
  from dark-academia's picks.
- Code (qc5): `rfEsc`, `csEsc` removed (escapeHtml); dead `.is-hover/.is-pressed` halves removed in all six CSS
  files; dead deck rules removed (dark-academia closemain .ab-brand/.ab-mark, deck-cell .ab-card::before,
  deck-prod .ab-list .ab-label; wabi-sabi closemain .ab-brand). Tokens take `(t, state)` with global fallback
  in religious-futurism, biomechanical-gothic, wabi-sabi; no private weight pickers remain.
- Also fixed while verifying: PNG export failed (html2canvas 0-size pattern) on wabi-sabi `color` and
  dark-academia `interface` (pre-existing: 0.5–0.6px gradient lines and shadow spreads → 1px) and on my new
  curio plate (gradient → flat fill + inset bevel); now 120/120 slides export non-blank. Biomechanical-gothic
  type/row/sub-lead faux 500 → real weight. Wabi-sabi and curio row names line-height (no descender clip).
  Cybersigilism blended state names no longer break mid-word; dark-academia 390 swatch role fits with wide
  blended faces.

Checks: board DOM scan 6 keys × 9 configs at 1280 and 390: 0 clip/overflow/contrast/placeholder findings
(excluding the scanner's undecidable gradient grounds, wabi-sabi's by-design staggered lines, and one
framework item below); gore 6 keys × 4 configs: 0; WebKit boards 24/24 overflow 0, no errors; node
tests/run.js all passed; t5/harness 192 briefs 0 fails; src-verify-p5 53 families 0 fails, 0 mismatches;
proposed suites through fitcheck2: 48 suites, 0 bad, 48 unique leads.

Framework items seen (CL1): `.ab-type-cur b` asks for weight 600 on single-weight faces (faux in every
aesthetic); at 390 a blended "Recommended for <base> × <donor>" label is held `nowrap` by
`css/aesthetic-board.css:373` and overflows the card in every base; blob-tracking donor art labels outside
the card (already QC cross-cutting 3); html2canvas drops some text inside `.ab-deck-cellzoom` (curio and
dark-academia CTA labels on the interface export; present before this round); `liquid-glass ← religious-futurism`
breaks "should" in the base headline; `xerox-punk ← curio-cabinet` breaks "COMPARTMENT" in a state name.
