# QC1 — severe QC, round 6 (packet rev 1)

Inspector: QC1 (Opus, read-only). Aesthetics: soft-form, liquid-glass, holo-iridescent, mesh-gradient, aurora-noir,
clay, frutiger-aero, gummy, y2k-chrome, bento-grid, neo-brutal-pop, big-top.

Method. Every board screenshot (A/B/C/D) and every deck slide (dk + dko) was opened; suspicious areas were re-cropped at
native or 1.3–2x scale. Contrast was measured, not guessed: an in-page script (scratchpad `qc1/audit.js`) collected every
text run in `#previewCard` with its computed colour, opacity chain and rect; `qc1/contrast.py` sampled the rendered
background under each run from the element screenshot and computed WCAG ratios (4.5 body / 3 large). The same script
flags clipping, ellipsis, text outside the card, text-on-text overlap, fallback fonts and placeholder strings. It ran on
11 variants per aesthetic: warm rec/other, green, 390px, pastel rec/other, dark-saturated rec/other, long name 1280/390,
short name "Ox".

Totals: 5 BLOCKER · 55 MAJOR · 77 MINOR (per-aesthetic, blends, export and cross-cutting sections; cross-cutting items counted once).

Severity: BLOCKER = visibly broken / illegible core content / wrong brand colour shown. MAJOR = defect a client would
notice in a pitch. MINOR = polish.

---

## soft-form

1. MAJOR · deck cover band + closing strip (dk/soft-form-cover.png, -closing.png) · the lead pattern is `counterchange`
   "Bauhaus relief": hard 50% grey vertical stripes with a bullseye target. It is the hardest-edged, highest-contrast
   object in the deck and contradicts the style's own motto ("Soft edges") and fit.js's own lead rule ("no hazard
   stripes, targets … on a cover"). Nothing about it is relief — no shading, flat grey bars. · Fix: js/patterns/fit.js
   `'soft-form'` — move `counterchange` out of slot 1; lead with `gradpanes` "Pressed panes" or `aura` "Quiet glow" once
   those are fixed (items 3–4), or set `deck.coverBand:false` / `closingStrip:false` in js/aesthetics/soft-form.js.
2. MINOR · deck closing (dk/soft-form-closing.png, y≈49 and y≈131) · brand lockup printed twice: slide header wordmark
   and, 80px lower, `.ab-deck-wordmark` again. Framework-wide (see Cross-cutting C1).
3. MAJOR · deck patterns (dk/soft-form-patterns.png) · four of six tiles are near-blank at tone 0.45 (measured luminance SD /
   share of pixels >25 off the mean, warm: River stones 11/1%, Ring studies 6/0%, Pressed panes 7/1%, Quiet glow 4/0%).
   "Quiet glow" is flat canvas plus one 8px orange dot; "Ring studies" crams three faint ring cells into the bottom-right
   and leaves the left 60% empty. The slide reads as failed renders beside two hard grey stripe tiles. · Fix: fit.js soft-form — tone 0.45→0.65 for the tonal entries, `aura` `strength` 0.6→0.9,
   `specimens` `cols` 3→2 so cells fill the tile.
4. MAJOR · deck patterns, tile "Pressed panes" (x≈430, y≈515–560) · a 4px orange sliver of a pane that starts outside the
   tile is cut by the right edge — a cropping accident. Same bug in liquid-glass "Glass panes" (engine-level, see C3).
5. MINOR · deck patterns, tile "River stones" (bottom-left) · the only coloured stone is a hard-dithered halftone blob cut
   by the tile edge; the dither pixels read as aliasing on an otherwise soft board. · Fix: fit.js soft-form `pebbles`
   `mode:'halftone'`→ a smooth mode, or `lit` 0.5→0.
6. MAJOR · board D 390px, "03 / In use" (qc-soft-form-D.png, bottom) · progress meters collapse to 20–30px stubs tucked
   under the row number; 72% / 45% / 10% are no longer readable as bars. · Fix: css/aesthetics/soft-form.css mobile rule
   for the in-use row — put the meter on its own full-width line (`grid-column:1/-1`) under the status at ≤480px.
7. MINOR · 390px, long brand name "BallKnowledge Collective International" · the header wordmark truncates to "BallKnowledge C…" (no collision; the label stays clear) — the client's name is never shown in full on mobile (C2).
8. MAJOR · board, pastel palette #F4C2C2/#C2E0F4/#F4EFC2 (audit P) · the headline highlight "alive" (accent #F4EFC2
   contrast-darkened) renders as a muddy olive-mustard. Same mechanism gives the amber-brown "alive"/"edges." on warm
   (#FFC914 → ≈#B8800A) — legible but brown. · Fix: soft-form.js headline highlight — when the darkened accent's chroma
   drops below ~0.25, fall back to `t.primary` (or darken in OKLCH keeping hue/chroma) instead of mixing toward ink.
9. MINOR · board B (dark mode) and pastel-other · "A little structure. Room to play." 4.04:1 (#A9A6A5 on #444345) and
    3.90:1 on pastel-dark, 13px body. · Fix: soft-form.css muted text in the glass card → mix 70% ink, not 55%.
10. MINOR · deck do/don't (dk/soft-form-dodont.png) · "Do" numerals 01–03 in primary #E4572E on canvas #EAE9E5 = 3.0:1 at
    14px. · Fix: framework do/don't numerals use ink, or primary darkened to ≥4.5.
11. MINOR · board, pastel palette · toggle "Focus mode" on-state: pink knob on pink-grey track, on/off states differ only
    by knob position (track #F4C2C2 vs canvas ≈1.2:1). · Fix: soft-form.css toggle on-state adds ink tick or darker rim.

Clean: hero art (circle/half-disc/glass bar) on warm/green/pastel/dark; segmented, field, raised/recessed/glass wells;
typography lock card; green palette; dark-saturated palette; "Ox"; long name at 1280; principles, color, typography,
interface, material, product slides (rec + other mode).

## liquid-glass

1. BLOCKER · deck cover band, closing strip and Material slide (dk/liquid-glass-cover.png, -closing.png,
   -material.png) · all three lead with `neonspray` "Light leaks", the pattern liquid-glass's own harsh review killed
   (hr1 kill list; coordinator checkpoint). On the Material slide it fills 60% of the slide in place of the lens art, so
   the slide no longer shows the board's material at all; on dark mode (dko) it turns into a muddy brown/teal camouflage.
   · Fix: js/patterns/fit.js `'liquid-glass'` — remove `neonspray` (it is killed), lead with a non-killed entry the style
   can own (`aura` "Glass light" reads as glass), and make the Material slide use the lens hero
   (`deck.materialArt` / hero hook in js/aesthetics/liquid-glass.js) rather than the lead pattern.
2. BLOCKER · board hero tab bar "Home / Search / Library" (every variant, audit A/B/C/P/K) · white 10px labels on the
   bright glass: Home 1.00:1 (white on the white selected pill), Search 1.60:1, Library 1.56:1 on warm; 1.25:1 on pastel
   and on the dark-saturated palette. Illegible. · Fix: css/aesthetics/liquid-glass.css `.lgs-tab em` — ink colour
   (`--ab-ink`) when the tab sits on the secondary plane, or a darker glass tint behind the bar (rgba(0,0,0,.28)); the
   selected pill needs ink text.
3. MAJOR · hero lens (qc-liquid-glass-A/C/D, cover slide) · the refraction shows stair-stepped, blocky edges (4–6px steps
   along the letter and accent bar) — aliasing from feDisplacementMap on a 512px normal map; at 390px the lens content is
   an unreadable white/orange/yellow jumble. · Fix: js/aesthetics/liquid-glass.js filter — add
   `<feGaussianBlur in="map" stdDeviation="1.5" result="mapS"/>` and drive both displacement passes from `mapS`; raise the
   ramp image to 1024.
4. BLOCKER · hero lens on the green palette (qc-liquid-glass-C, crop) · orange-red pixels appear inside the lens on an
   all-green brand — the separate red-channel pass (scale 48 vs 40) splits R from GB and paints a hue the client never
   chose. Same fringe on pastel. · Fix: liquid-glass.js — drop the `red`/`gb` split (use `d1` directly), or make the
   fringe pass a 0.25-opacity copy of the full colour, not the R channel.
5. MAJOR · board "01 / Interface" segmented control (qc-liquid-glass-A/B, crop) · the dark glass track over the
   yellow→teal seam produces a muddy olive-brown smear (#8A7A10-ish) between "Build" and "Launch"; also visible on the
   Interface and In-product slides. · Fix: liquid-glass.css — segmented track over the stripe band uses a neutral
   frosted fill (mix with canvas) instead of a dark multiply tint, or move the accent bar out from under the track.
6. MAJOR · board B (dark mode) segmented "Design" selected pill · ink #10131C on dark pill #4B4A4F = 2.13:1 (1.94:1 on
   dark-saturated other mode); also invisible on dko interface slide. · Fix: liquid-glass.css `.ab-seg .on` in dark mode
   — light pill (as light mode) or light text.
7. MAJOR · deck patterns (dk/liquid-glass-patterns.png) · "Bent bands" (stripes + concentric arcs) is the same
   construction as soft-form "Rising arcs", and "Glass panes" is a clone of soft-form "Pressed panes" (same family,
   same layout, same orange edge-sliver bug). Distinctness. · Fix: fit.js liquid-glass — replace `ribbonrise` and
   `gradpanes` with families neither soft-form nor mesh-gradient uses.
8. MINOR · board "The palette" pills · five pills on a four-across row; "Accent" sits alone on a second row (A/B/C and
   both palettes). · Fix: liquid-glass.css palette pills — `flex-wrap` with `justify-content:space-between` or shrink pill
   padding so five fit at 1280.
9. MINOR · board interface card · the stripe band stops with a hard cut and "Your next good idea." starts 8px below it —
   cramped. · Fix: liquid-glass.css card body `padding-top:20px`.
10. MINOR · pastel-other (dark mode) · muted text #B0B0B0 on #484848 = 4.21:1 for 13–17px labels ("In review",
    "Building", "Planned", hex values). · Fix: liquid-glass.css dark muted mix → ≥4.5.
11. MINOR · 390px, long brand name "BallKnowledge Collective International" · the header wordmark truncates to "BallKnowledge C…" (no collision; the label stays clear) — the client's name is never shown in full on mobile (C2).
12. MINOR · deck closing duplicate wordmark (C1).

Clean: palette pills content, type card, Optics card (Clear / Tinted / Frosted), In-use list, toggle, dark-saturated
palette mapping, principles/color/typography/product/do-don't slides, short name.

## holo-iridescent

1. MAJOR · deck cover (dk/holo-iridescent-cover.png, x≈700–840, y≈505) · the soap-bubble lens overlaps the cover meta
   label: "HOLO IRIDESCENT" runs through the bubble ("IRIDESC|ENT" crosses its rim). Same on dko cover. · Fix:
   css/aesthetics/holo-iridescent.css `.ab-slide[data-slide="cover"] .ab-art` — `max-height` so the art ends above the
   meta row, or move the bubble (`.hob`) to the card's upper-left corner on the cover.
2. MAJOR · deck cover band + closing strip (cover, closing; dko too) · lead `oprings` "Interference" in the `spectrum`
   colourway renders as three flat inks — pink, sky blue, white (black on dark mode) — in hard-edged melting bands. It is
   the psychedelic-poster look HR1 killed ("brand … on black, which is psychedelic poster, not pearl") and reads as a
   groovy-70s / acid-graphics sibling, not thin-film foil. · Fix: js/patterns/fit.js `'holo-iridescent'` — lead with a
   soft-banded entry (`aura` "Spectral haze" once item 3 is fixed) or give `oprings` `warp:0`, many thin bands and a
   pastel ground; js/patterns/engine.js `spectrum` colourway — interpolate 6+ stops so bands blend, not three flat inks.
3. MAJOR · deck patterns, tile "Spectral haze" (dk/holo-iridescent-patterns.png, top-middle) · light mode tile is
   blank white with a faint grey diagonal — reads as an empty slot. · Fix: fit.js holo `aura` — `strength` 0.9→1 and
   `mode:'glow'`→`'paint'` in light mode, or a colourway that maps the spectrum onto a mid-tone ground.
4. MAJOR · deck interface slide (dk/holo-iridescent-interface.png, y≈470) · the Matte / Pearl / Foil chips float
   unframed under the three boxes — exactly the defect on HR1's kill list; still present in both modes. · Fix:
   holo-iridescent.css `.ab-slide[data-slide="interface"] .ab-states` — wrap in a fourth panel or drop from the slide.
5. MAJOR · board hero (qc-holo-iridescent-A/B/C, right edge) · the foil card bleeds past the card edge and the "M"
   monogram is cut by the right edge (≈20% of the glyph lost); the audit shows `.ab` scrollWidth 980 vs 884 (96px of
   art beyond the card). Same crop on the Material slide. · Fix: holo-iridescent.js — move the monogram to ~70% of the
   card width (it is placed at the card's lower right), or holo-iridescent.css `.ab-art` width 124cqw → 108cqw.
6. MINOR · board/deck CTA (crop of qc-holo-iridescent-A interface card; dk interface) · the spectral top line
   (`.ab-cta::before`) is a straight 2px bar that sticks out above the CTA's rounded corners — a second time on HR1's
   kill list. · Fix: holo-iridescent.css `.ab-cta::before` — `left:var(--r); right:var(--r)` (the CTA radius) or
   `border-radius:inherit` with a top-only mask.
7. MINOR · board palette strip, Primary/Accent cells · "Main action · / ≈10%" and "One spark · / ≤5%" break after the
   middot, leaving a dangling "·" at line end. Ink at 0.78 opacity on #E4572E = 3.85:1 (11px), on the dark palette's
   #FF2E63 4.03:1. · Fix: holo-iridescent.css strip labels `white-space:nowrap` (or `·` + nbsp), opacity 0.78 → 0.9.
8. MINOR · board B and dko (dark mode) · the bubble's "black spot" becomes a muddy grey-olive blot in the centre of the
   lens on a dark page. · Fix: holo-iridescent.js `.hob` — in dark mode drop the black-spot gradient or lighten it.
9. MINOR · board D 390px · headline breaks "Good design / should feel / alive" — the highlight word is an orphan, and
   its amber start measures 2.99:1 at 35px (large-text minimum 3). · Fix: holo css 390 headline `text-wrap:balance`;
   the spectral highlight starts on a darker stop in light mode.
10. MINOR · deck patterns "Lamination" · a stray orange chip at x≈596,y≈525 and a row of garbled pink marks at
    y≈585; "Pearl dust" has orange specks — the only warm colour in a fixed-spectrum suite. · Fix: engine `weave` /
    `stipple` spark should use a spectrum stop when colourway is `spectrum`.
11. MINOR · 390px, long brand name "BallKnowledge Collective International" · the header wordmark truncates to "BallKnowledge C…" (no collision; the label stays clear) — the client's name is never shown in full on mobile (C2).
12. MINOR · deck closing duplicate wordmark (C1).

Clean: green palette (spectrum stays fixed, brand roles map cleanly), dark-saturated palette, typography card,
segmented, toggle, In-use rows, principles, color, typography, product, do/don't slides.

## mesh-gradient

1. MAJOR · deck cover (dk/mesh-gradient-cover.png, x≈855–930, y≈330–345) · the `type.spec` code card clips its own
   text: "Plus Jakarta Sa|" is cut at the card's right edge on both H1 and H2 rows (cover scale only; the board's card
   is wide enough). · Fix: css/aesthetics/mesh-gradient.css `.ab-slide[data-slide="cover"]` code card — `min-width`
   in cqw that fits the longest row, or `font-size` down one step, or abbreviate the font name to the family's short
   name in mesh-gradient.js.
2. MAJOR · deck cover band, closing strip, patterns tile "Silk" (crop at 1.6x) · `flow` strands are drawn as
   square-ended hatched ribbons: each strand shows zig-zag moiré inside, ends are cut square, and overlapping strands
   leave visible rectangular seams. It looks like a render glitch, and on dark mode it becomes a dense rust/teal
   psychedelic stripe field (a groovy-70s sibling). · Fix: js/patterns/fit.js mesh `flow` — `weight` 0.5→1.2 (solid
   strands, no hatch), round caps; or lead with a cleaner entry; engine `flow` should not hatch at weight < 1.
3. MAJOR · board B (dark mode) hero band and dko cover (crop of qc-mesh-gradient-B hero) · the band body renders as a
   muddy dark rust-brown (≈#4A2A22) — the exact "muddy band" HR1 killed — and the board's own Don't #1 says "Darken the
   gradient behind white type". The fine striations at the top moiré. · Fix: mesh-gradient.js tokens() dark mode —
   keep the field at light-mode luminosity (luminous band on a dark page) and put the cards' ink, not the field, in
   charge of contrast.
4. MAJOR · deck patterns + do/don't (consistency) · the suite contains "Mesh wash" (`aura`, six blurred blobs, with a
   brown mix where orange meets teal), while principle 02 says "Hairlines, not blobs" and Don't #2 says "Use blurred
   blobs". The deck contradicts itself on adjacent slides. · Fix: fit.js mesh — replace `aura` with a striation family.
5. MAJOR · deck patterns (distinctness) · "Gradient studies" (`specimens`, study 'fans') is the same construction as
   holo-iridescent "Foil swatches"; "Fan" (`burst`) is the same dashed-ray burst as holo "Prism rays" and liquid-glass
   "Caustics"; "Ramp panes" is the fourth `gradpanes` in this group (soft-form, liquid-glass, y2k-chrome). · Fix:
   fit.js — give each of these a family no sibling in the soft/luminous group uses.
6. MAJOR · deck patterns "Ramp panes" (x≈430, y≈510–565) · same edge-sliver crop bug as soft-form/liquid-glass, here a
   yellow sliver (C3).
7. MAJOR · board A segmented control, selected "Design" · primary #E4572E text on white = 3.68:1 at 12px/600 (3.21:1 on
   dark mode, 2.67:1 #7A00FF on dark-saturated other mode). · Fix: mesh-gradient.css `.ab-seg .on` — ink text with a
   primary underline/dot, or primary darkened to ≥4.5.
8. MINOR · board A, 01 Interface · the card is 225px tall beside a 375px Surfaces card, leaving a 150px empty hole
   under it. · Fix: mesh-gradient.css — `align-items:stretch` on the 01/02 row and let the card body flex, or move the
   states table under 01.
9. MINOR · board "03 / In use" progress bars · primary→secondary gradient passes through a grey-brown midpoint
   (orange→teal). · Fix: mesh-gradient.css bar fill — interpolate `in oklch` or use a single colour per row.
10. MINOR · board B, Surfaces "Build"/"Launch" 3.85:1; pastel-other muted labels 4.20–4.28:1 (9–14px); Save pill ink on
    #D5512A 4.47:1. · Fix: mesh-gradient.css muted text mix up 8–10%.
11. MINOR · deck material slide (dko) · list says "02 / White card" while the card is dark grey in dark mode. · Fix:
    mesh-gradient.js material labels mode-aware ("Opaque card").
12. MINOR · 390px, long brand name "BallKnowledge Collective International" · the header wordmark truncates to "BallKnowledge C…" (no collision; the label stays clear) — the client's name is never shown in full on mobile (C2).
13. MINOR · deck closing duplicate wordmark (C1).

Clean: green palette (band reads luminous), pastel and dark-saturated light mode, 390 layout (stacked cards fit,
type.spec stays inside), typography, color, principles, product, interface slides.

## aurora-noir

1. BLOCKER · deck cover band (dk/aurora-noir-cover.png and dko cover, y 588–720) · the `.pt-deck-band` image is a flat
   field: measured max luminance 21/255, mean 20.3 over 1278×133px — no pattern at all, so the cover ends in a 130px
   dead black (or blank cream, light mode) strip. The lead `prismpix` "Aurora stream" at tone 0.4 only draws streams in
   the middle of its tile; the wide band crop lands on empty ground. · Fix: js/patterns/fit.js `'aurora-noir'` lead —
   raise `streams` 3→5 and tone 0.4→0.6, or js/patterns-deck.js band crop centred on the drawn content; or set
   `deck.coverBand:false` in js/aesthetics/aurora-noir.js so the cover reflows.
2. MAJOR · board hero (qc-aurora-noir-A crop, y≈620–640) · the hairline horizon arc runs straight through the activity
   row "Status changed to In progress" like a strikethrough, and the beam crosses the "MS-142" tag. At 390px (D) the arc
   crosses "Progress" and the window cuts the "Status changed…" row in half; on the deck cover the window is cropped
   mid-row with the arc through "Assignee". · Fix: css/aesthetics/aurora-noir.css — put the horizon `z-index` below the
   window's content (`.ana-win` above `.ana-horizon`) or move the arc to sit under the window's bottom edge
   (`top: calc(100% - 2px)`); at ≤480px hide the activity list.
3. MAJOR · board, any brand not starting with "M"·"S" (code js/aesthetics/aurora-noir.js:107 and :144) · issue IDs are
   `initial + 'S'` with a hard-coded S: "BallKnowledge Collective International" shows **BS-142, BS-101…103** on the
   board; "Ox" shows OS-142. · Fix: build the prefix from the first letters of the first two words
   (`ctx.copy.brandName.split(/\s+/).slice(0,2).map(w=>w[0]).join('')`), padded with the second letter for one-word names.
4. MINOR · board 390px (qc-aurora-noir-D, LD) · the app window is cut mid-row at its 255px max-height: the activity
   list shows half a row ("Status changed to In progress" at 30% opacity, sliced through the text) and on the long
   name "Assignee" wraps to two lines and pushes Progress under the horizon arc. · Fix: aurora-noir.css ≤480px — hide
   `.ana-activity` and let the window size to content.
5. MAJOR · deck patterns + closing strip (distinctness) · "Aurora stream" is `prismpix` — blocky 8-bit pixel mosaics
   in rust/teal/yellow — the same family bento-grid leads its "Pixel streams" with; on aurora-noir it reads as
   pixel-arcade, not "one sharp beam and a hairline horizon". The closing strip is a pixel mountain on light mode's grey
   ground. · Fix: fit.js aurora-noir — replace `prismpix` with a hairline/beam family (e.g. `burst` with 1 thin ray
   layer at tone 0.5 is free in this suite) and lead with it.
6. MAJOR · deck patterns "Beam" in light mode (dko patterns) · blank white tile. "Hairline grid" is a scatter of icon
   glyphs (circles, crosses, bars), not a hairline grid — the name and the art disagree. · Fix: fit.js — `aura` "Beam"
   strength up for light mode; rename "Hairline grid" → "Glyph sheet" or change params to `style:'line'` only.
7. MINOR · board B (light, the "other" mode) · eyebrow still reads "// BUILT FOR THE DARK" on a cream page. · Fix:
   aurora-noir.js eyebrow mode-aware ("// Built for the dark — and the light").
8. MINOR · board section numbering · "Fig 0.1 / 03 In use" precedes "Fig 0.2 / 01 Interface" and "Fig 0.3 / 02
   Surfaces": the 0x numbers run 03, 01, 02. · Fix: aurora-noir.js labels — renumber to the rendered order.
9. MINOR · light mode (B, pastel-other, dark-saturated other) · muted sidebar/meta text 3.90–4.38:1 at 8–12px
   ("Teams" 8px 4.04:1, "Build"/"Launch" 3.90:1). · Fix: aurora-noir.css light muted → 62% ink.
10. MINOR · deck closing duplicate wordmark (C1).

Clean: dark-mode contrast on warm/green/dark-saturated palettes (audit: zero failures), palette, type card with mono
column, issues table, interface, surfaces/states (Rest/Hover/Focus distinct), principles, color, typography, product
and do/don't slides, "Ox".

## clay

1. MAJOR · deck cover band, closing strip, patterns "Pebbles" (dk/clay-cover.png y 588–720, crop) · on the warm palette
   (orange/teal/yellow/charcoal) a third of the pebbles are sage olive-green — sampled rgb(153,161,144) and
   rgb(139,151,129) — a colour the client never chose (a muddy mix of secondary and ink). Every pebble also shows
   vertical comb streaks inside the halftone (aliasing of the "lit" shading), so the lead pattern reads as a bad scan,
   not matte clay. · Fix: js/patterns/fit.js clay `pebbles` — drop the mixed ink slot (only canvas/primary/secondary/
   accent/ink inks), `mode:'halftone'`→ a smooth/grain mode, `lit` 0.8→0.4; engine.js `pebbles` should not emit
   mixed inks under the `brand` colourway.
2. MINOR · board 03 In use (qc-clay-A) · the row avatars are glossy clay balls (radial highlight + drop shadow), while the
   AI brief says the interface is "flat" and allows one clay capsule action per view; with the CTA that is four clay
   objects inside the interface. "Launch site" avatar is a pale-peach ball whose white "L" is ≈2:1. · Fix:
   css/aesthetics/clay.css 03 avatars — flat primary-tint discs with ink initials.
3. MAJOR · deck patterns (dk/clay-patterns.png) · "Glazed tiles" is wavy ink scribbles, not tiles; "Marbled clay" is a
   psychedelic multi-ink swirl (acid-graphics sibling); "Coils" is the maze of outlined tubes HR1 killed on soft-form
   ("a maze of brand tubes"); "Rolled bands" is hard pinstripes + concentric arcs (same `ribbonrise` construction as
   liquid-glass "Bent bands" and aurora "Signal bands"); "Soft lumps" is a blurred blob whose orange/teal overlap goes
   brown. Five of six tiles contradict "matte, soft, tangible". · Fix: fit.js `'clay'` — replace `marble`, `tokens`,
   `ribbonrise` with families that read as pressed/rolled material (e.g. `gradpanes` with radius, `counterchange`
   tonal); `specimens` study 'marbling' → 'rings'.
4. MINOR · board section order (qc-clay-A) · "02 / Clay" is rendered above "01 / Interface". · Fix: js/aesthetics/clay.js
   structure — renumber to rendered order or swap the sections.
5. MINOR · board B (dark) headline highlight · the "alive" chip's 3D underside is an olive-brown slab (#8A7A2A-ish under
   #FFC914) on the dark page. · Fix: clay.css highlight underside — mix accent toward ink in OKLCH or use
   `color-mix(in oklch, var(--ab-accent) 70%, #000)`.
6. MINOR · pastel-other (dark) · segmented "Build"/"Launch" #B3B2B2 on #4D4C4C = 4.05:1 at 12px. · Fix: clay.css dark
   muted mix → ≥4.5.
7. MINOR · 390px, long brand name "BallKnowledge Collective International" · the header wordmark truncates to "BallKnowledge C…" (no collision; the label stays clear) — the client's name is never shown in full on mobile (C2).
8. MINOR · deck closing duplicate wordmark (C1).

Clean: hero objects on warm/green/pastel/dark (tonal ramps stay in palette), palette pebbles row, type card, states
(Rest/Pressed/Lifted distinct), toggle, In-use rows, 390 layout, principles, color, typography, interface, material,
product slides, both modes.

## frutiger-aero

Coordinator item (lead pattern blank once): the cover has `deck.coverBand:false` (full-bleed sky), so there is no cover
band to go blank. I re-rendered the deck 4× on warm — the six pattern images are byte-identical each time (no flaky
render). The blanks are palette/mode-dependent and reproducible (measured luminance SD / % of pixels >25 off the mean):
"Sunrise" 8/0% on pastel and 5/0% on dark-saturated other mode, "Aurora swoosh" 11/2% on dark-saturated other mode,
lead "Sky glow" only 25/8% on pastel. The closing strip in dark mode (dko closing) is a near-empty navy blur with one
dark ellipse.

1. MAJOR · deck closing (dk/frutiger-aero-closing.png, y≈410–465) · the mirrored reflection of "good weather." runs
   straight through the descriptor "Glossy · Airy · Hopeful" — text crossing text. On the principles slide the
   reflection sits flush on top of the descriptor line. On the board (audit, every variant) the hero reflection's
   rects overlap the tagline pill by ~150×18px (hidden by the pill today, so only the deck shows it). · Fix:
   css/aesthetics/frutiger-aero.css — on `.ab-slide[data-slide="closing"]` and `[data-slide="principles"]` add
   `margin-top: .75em` to the descriptor (`.ab-deck-desc` / the principles lede) so it starts below the reflection
   (reflection depth = 5 × 0.14em = 0.7em of the headline).
2. MAJOR · deck patterns (dk/frutiger-aero-patterns.png) · "Sky glow" (the lead) ends in a dark grey-brown smear
   bottom-right — ink leaking into a sky pattern on the warm palette; "Rolling hills" is orange/teal/charcoal camouflage
   with yellow blotches (not hills); "Bubbles" are charcoal-filled rings (reads as industrial washers). The board's own
   Don't says "Use … muddy gels". · Fix: js/patterns/fit.js `'frutiger-aero'` — `aura` and `terrain` use a sky/duotone
   colourway that excludes ink; `colony` `finish:'film'` with canvas fill; `terrain` style 'hills' needs green/blue
   inks only, or swap family.
3. MAJOR · deck patterns, pastel and dark-saturated palettes (probe above) · "Sunrise" renders blank on pastel and on
   dark other mode; "Aurora swoosh" blank on dark other mode. · Fix: fit.js frutiger `burst` tone 0.5→0.8, `flow` tone
   → 1; engine should floor ink/ground contrast at ≥1.6:1 after tone is applied.
4. MAJOR · board number badges "01 / 02 / 03" (qc-frutiger-aero-A crop, x≈40/490, y≈1236; y≈1636) · white 10px
   numerals on a glossy red orb whose white specular cap sits behind the digits — illegible ("01" reads as a smudge).
   · Fix: frutiger-aero.css badge — move the specular cap above the text baseline (top 0–35%) or drop the numeral and
   keep the orb, or 12px/700 with `text-shadow:0 1px 0 rgba(0,0,0,.35)`.
5. MINOR · board/deck segmented "Design" and "Save" pills on light primaries · white text over the gel highlight band
   measures 3.7:1 (warm) and 1.84–2.47:1 on the dark-saturated palette's lilac gel (#D5AEFE / #C28BFE) — the gel ramp
   lightens #7A00FF to lilac, so white text fails. · Fix: frutiger-aero.js gel ramp — pick label colour from the
   ramp's mid-stop contrast (ink when < 4.5).
6. MINOR · dark mode (B, dko) · Do/Don't slide says "Don't: Use dark backgrounds or muddy gels" while the deck itself is
   a dark navy deck. · Fix: frutiger-aero.js deck donts — mode-aware text ("Don't let the night sky go muddy").
7. MINOR · deck closing strip (rec) · the hill is two flat ellipses (green + teal) with two white dot "bubbles" — looks
   unfinished next to the board's rendered hills. · Fix: frutiger-aero.js closing art — reuse the hero `fa-sky` hill
   path instead of ellipses.
8. MINOR · deck cover · the subtitle pill sits on the water with the reflection lines crossing behind it at 60% —
   busy, and "A design language for…" pill text 11px on cover. · Fix: frutiger-aero.css cover pill `font-size` up to
   13px.
9. MINOR · 390px, long brand name "BallKnowledge Collective International" · the header wordmark truncates to "BallKnowledge C…" (no collision; the label stays clear) — the client's name is never shown in full on mobile (C2).
10. MINOR · deck closing duplicate wordmark (C1).
11. MAJOR · board/deck toggle · no keyboard focus ring on the switch in its default (checked) state — see "Also checked".

Clean: hero sky/hills/clouds/orb/reflection on warm/green/pastel/dark, dark-mode night sky, palette orbs, title-bar
chrome, segmented, gel CTA, Rest/Shine/Pressed states, In-use table with striped bars, 390 layout, material anatomy
slide, principles, color, typography, interface, product slides.

## gummy

1. MAJOR · brand mark on every board and slide (crop of dk/gummy-cover.png header, 2.5x) · the white "M" in the
   gumdrop mark is overpainted by the two white specular dots: the dots sit on the M's left stem and shoulder, so the
   glyph reads as a blob with a notch. It is the logo, repeated on all 10 slides. · Fix: css/aesthetics/gummy.css (mark
   `::before/::after` specular dots) — move the dots to the top-left rim, outside the glyph's box (top ≤ 18%,
   left ≤ 22%), or drop them below 32px mark size.
2. MAJOR · deck patterns + do/don't consistency (dk/gummy-patterns, -dodont) · Don't #2 "Use grey shadows or opaque
   matte fills", Principle 03 "no grey" — but the suite shows "Sugar dust" (mono grey camouflage) and "Jelly cells" (the
   lead: opaque black/teal/orange camo with eye-spots). "Gummy drops" is a pixel grid of squares and rings, not drops.
   "Jelly rings" is the same `counterchange` stripe-and-bullseye as soft-form's lead. · Fix: js/patterns/fit.js
   `'gummy'` — drop `halftone` mono (or colourway 'brand' tint), `colony` `nuclei:false` and no ink fill, `tokens`
   `fill:'tint'` with round cells, replace `counterchange`.
3. MAJOR · board D 390px hero (qc-gummy-D.png, y≈190–260) · the candy spill is cropped on both sides: the gumdrop is
   cut in half at the left edge, the magenta drop and the yellow worm exit right; only the ring is whole. Reads as a
   bad crop, not a composition. · Fix: css/aesthetics/gummy.css ≤480px — scale the art SVG to the card width
   (`width:100%; height:auto`, no negative margins) or switch `preserveAspectRatio` to `xMidYMid meet`.
4. MINOR · board/deck jelly labels (audit A/B/D/P) · white on the shaded primary measures 4.34–4.38:1 (CTA "Save
   direction" 15px/700, segmented "Design", "Save" pills) — gmButton() shades to 4.5 against the base, but the label
   sits on the lighter top of the gradient. · Fix: js/aesthetics/gummy.js gmButton — target 4.8:1 (or test against the
   gradient's lightest stop).
5. MINOR · dark-saturated palette (audit K) · seal text "fresh batch" white on #F9265C = 3.84:1 at 14px.
   `--ab-gm-seal-on` only falls back to white when plum fails 4.5, without checking white passes. · Fix: gummy.js:331 —
   choose whichever of plum/white has the higher ratio.
6. MINOR · palette swatches vs usage (qc-gummy-C) · the green palette's swatch row shows the client's #2F6B4F/#5E9C7A,
   but every control and the hero use the candy-pushed mint (#3ED07F-ish); the client's primary never appears. The
   rule is documented, but the swatch should say so. · Fix: gummy.js palette hook — add "prints as #xxxxxx" under
   primary/secondary/accent (frutiger-aero already does this).
7. MINOR · deck closing strip · candy balls are cut by the strip's right edge (half balls at x≈150 on every row). ·
   Fix: gummy.js closing art — column count derived from strip width, or `background-size` so the tile ends on a gap.
8. MINOR · 390px, long brand name "BallKnowledge Collective International" · the header wordmark truncates to "BallKnowledge C…" (no collision; the label stays clear) — the client's name is never shown in full on mobile (C2).
9. MINOR · deck closing duplicate wordmark (C1).

Clean: hero candy spill on warm/green/pastel/dark (multiply overlaps, coloured shadows), palette gumdrops, type card,
segmented, toggle, set/wobble/squish states distinct, In-use worms, material anatomy slide, principles, color,
typography, interface, product, do/don't layout, both modes; computed fifth "flavour" (magenta on warm) is documented.

## y2k-chrome

1. MAJOR · deck cover (dk/y2k-chrome-cover.png) · the cover is a shrunken, centred block: headline is ~44px (the
   board's is ~62px), the text column starts at x=235 while the slide header, footer and rule start at x=56, and the
   meta row "Brand guidelines / Y2K Chrome / 2026" is indented to 235 too — it breaks the slide's own grid and leaves
   180px dead margins left and right. The weakest cover in this group. · Fix: css/aesthetics/y2k-chrome.css
   `.ab-slide[data-slide="cover"] .ab-hero` — remove the max-width/centring so the hero spans the slide's content box
   (56→1222), and set `deck.coverDisplay` in js/aesthetics/y2k-chrome.js to ≥72px.
2. MAJOR · deck cover band, closing strip, patterns "Chrome streaks" (lead `thermalstreak`, `night`) · renders as a
   ragged orange/teal VHS-tear smear — reads as glitch/xerox/pirate-broadcast, not polished chrome; in light mode
   (dko) it is an orange/teal smear on cream. · Fix: js/patterns/fit.js `'y2k-chrome'` — `rough` 0.1→0, `smear` 30→60,
   `flip:'mirror'` for a horizon line, or lead with `gradpanes` "Chrome bars" (a clean chrome gradient) — the family
   is already used by three soft siblings, so better a `oprings` horizon in 'mono'.
3. MAJOR · deck patterns "Icon sheet" (`glyphgrid`, duotone) · measured blank-ish on every palette: luminance SD 14
   (warm), 6 (dark-saturated, 0% pixels off-ground), 5 on pastel other mode; on the slide it is faint red squares on
   navy. "Bubble screen" is blank on pastel other mode (SD 7). · Fix: fit.js y2k `glyphgrid` — colourway 'brand',
   `cell` 5→3.5; `halftone` tone floor.
4. MINOR · board hero vertical side label (qc-y2k-chrome-A crop, x≈866) · "MRG-01™" set vertically renders the ™ as a
   sideways superscript blob ("MRG-01 ²"), and "液体金属" falls back to a system CJK face (Sora has no CJK). At 390px
   the label is clipped at "NOT FOR RES". · Fix: js/aesthetics/y2k-chrome.js side label — drop "™" from the vertical
   string, use `text-orientation:mixed` with Latin only, and `overflow:visible`/shorter string at ≤480px.
5. MINOR · board A hero · the headline "Good design" ends 11px from the yellow acid panel (x 446 vs 457) — cramped
   collision with the art. · Fix: y2k-chrome.css `.ab-hero` column gap ≥ 32px.
6. MINOR · light mode (B, dko) · principle 01 "A bright line just off-centre over a dark ground" and the AI brief's
   ultramarine field are shown on a pale grey page; the "night" colourway patterns become orange/teal on cream. ·
   Fix: y2k-chrome.js principle copy mode-aware, or force `night` patterns onto the fixed navy ground in light mode.
7. MINOR · 390px, long brand name "BallKnowledge Collective International" · the header wordmark truncates to "BallKnowledge C…" (no collision; the label stays clear) — the client's name is never shown in full on mobile (C2).
8. MINOR · deck closing duplicate wordmark (C1).

Clean: chrome headline + acid block + liquid-metal blob on warm/green/pastel/dark (accent block follows the client
accent), palette chips, type card, segmented, gel CTA with chrome knob, toggle, Gel/Polished/Liquid states, In-use
rows, contrast audit zero failures on all 8 colour variants, principles, color, typography, interface, material,
product, do/don't slides.

## bento-grid

1. MAJOR · deck cover band (dk/bento-grid-cover.png, y 588–720) · the lead `modulargrid` "Tile grid" fills only the
   left 60% of the band (dot block, yellow bar, five teal bars, a cross and a dot); x≈780–1278 is empty canvas, so the
   cover ends in a half-finished strip. On the pastel palette the band measures SD 25 / 4% of pixels off-ground —
   nearly blank. It is also a chart/icon collage, not tiles. · Fix: js/patterns/fit.js `'bento-grid'` lead — `empty`
   0.12→0, `cols` 6→12 so the grid spans the band; or js/patterns-deck.js band crop that fits the drawn content.
2. MAJOR · deck patterns slide (dk/bento-grid-patterns.png) · shows a tile-size diagram (2×2 / 2×1 / 1×1 / 1×2) instead
   of the pattern suite, so the six patterns defined in fit.js ("Tile grid", "Block parcels", "Rendered cells", "Pixel
   streams", "Heat tiles", "Product map") never appear in the deck, and the slide repeats the Material slide's tile
   anatomy. · Fix: js/aesthetics/bento-grid.js — keep the tile diagram on the Material slide only and let the Patterns
   slide render the suite in bento tiles (the `.bns` layout with pattern images inside the tiles).
3. MINOR · deck closing strip · a dense icon/glyph collage (bars, crosses, dot grids, squares) contradicts the deck's
   own Do 03 "Let one tile dominate the grid" and principle "One tile, one idea". · Fix: fit.js bento lead — fewer,
   larger tiles (`merge` 1→1.6).
4. MINOR · deck cover · the meta row "Brand guidelines / Bento Grid / 2026" sits 15px under the tiles and 60px above
   the footer — it belongs to neither. · Fix: css/aesthetics/bento-grid.css cover — `margin-top:28px` on the meta row
   or place it inside the hero tile's foot.
5. MINOR · deck In-product slide · the board's tiles are scaled to ≈60%: labels "Launch site", "Planned", "Focus mode"
   render at ≈6–7px and the segmented control at ≈7px. · Fix: bento-grid.css `[data-slide="product"]` — show 2 stat
   tiles + 1 action tile at full size instead of the whole 03 row.
6. MINOR · board pastel-other (dark) · muted text #B0B0B0 on #474747 = 4.28:1 (11–14px, 12 runs incl. "Rest / Hover /
   Pressed"). · Fix: bento-grid.css dark muted mix ≥ 4.5.
7. MINOR · board A, 01 Interface tile · 75px empty band between "Your next good idea." and "A little structure…"
   while the tile is stretched to match the art tiles. · Fix: bento-grid.css — `justify-content:space-between` with the
   caption under the headline, or let the tile shrink.
8. MINOR · 390px, long brand name "BallKnowledge Collective International" · the header wordmark truncates to "BallKnowledge C…" (no collision; the label stays clear) — the client's name is never shown in full on mobile (C2).
9. MINOR · deck closing duplicate wordmark (C1).

Clean: board on warm/green/pastel/dark (tiles flat, no borders, radius 28 consistent), hero phone mock (intentional
bleed), palette tiles, type tiles, Rest/Hover/Pressed distinct, stat tiles, 390 stacking (no overflow), principles,
color, typography, interface, material, do/don't slides, both modes.

## neo-brutal-pop

1. MAJOR · deck cover band, closing strip, patterns "Fly-poster pop" (dk/neo-brutal-pop-cover.png y 588–720) · the lead
   `flyposter` renders as soft blurred gradient chevron smears (orange→cream→teal ramps with 20+ steps) with small
   ASCII-glyph stickers. The deck's own Don't #1 is "Blur a shadow or add a gradient" and principle 01 "hard 4px shadow
   and no blur"; the cover is the one place a viewer sees first. "Cut-out sheets" has the same blurred ramp. · Fix:
   js/patterns/fit.js `'neo-brutal-pop'` — `flyposter` `harden` 0.8→1 and `stripe` step colours flat (or engine
   `flyposter` should quantise to ≤4 flat inks when harden ≥ 0.8); `cutup` `hills` 1.2→0.
2. MINOR · deck In-product slide (dk/neo-brutal-pop-product.png) · the yellow product card has a ~1px hairline outline
   while every other object is 2px ink (principle 01); the "$1" tag on the card and the "$1+" price chip repeat the same
   price twice. · Fix: css/aesthetics/neo-brutal-pop.css `[data-slide="product"]` card `border:2px solid var(--ab-ink)`;
   js/aesthetics/neo-brutal-pop.js product copy — drop the "$1" tag on the card or change the chip to a rating.
3. MINOR · dark mode (B, dko) · the 4px hard shadows use ink, which is cream in dark mode, so every card, swatch and CTA
   gets a cream offset that reads as a light halo rather than a drop shadow (most visible on the palette swatches and
   the product card). · Fix: neo-brutal-pop.css dark mode — shadow colour `#000` (or canvas mixed 60% to black), keep
   ink for outlines.
4. MINOR · board dark mode type card muted labels · "Headings", "grotesk, geometric sans…", "Your heading:" #AEABA9 on
   #544F50 = 3.52:1 (pastel-other 3.49:1, dark-saturated other 4.37:1), 11–12px. · Fix: neo-brutal-pop.css dark muted
   inside the type card → mix 80% ink.
5. MINOR · board type panel · headings card is tilted and stacks three names vertically while the body card lists them
   inline in one row ("DM Sans Rubik Work Sans") — the two cards use different layouts for the same content, and the
   body card leaves a 160px empty hole below it on the orange panel. · Fix: neo-brutal-pop.css — body card list
   `flex-direction:column` and `align-self:stretch`.
6. MINOR · deck patterns (distinctness) · "Chunky capsules" (`tokens`) is the same outlined tube maze as clay "Coils";
   "Poured pop" (`marble`) is the same psychedelic marble as clay "Marbled clay". · Fix: fit.js — one owner per
   family; give neo-brutal-pop `kaleidopix`-style flat stickers or `festival` instead.
7. MINOR · 390px, long brand name "BallKnowledge Collective International" · the header wordmark truncates to "BallKnowledge C…" (no collision; the label stays clear) — the client's name is never shown in full on mobile (C2).
8. MINOR · deck closing duplicate wordmark (C1).

Clean: hero sticker stack (price tag, starburst, cursor, check) on warm/green/pastel/dark, palette stickers, segmented,
chunky CTA, Rest/Lift/Squish distinct, toggle, In-use panel on accent, 390 layout, principles, color, typography,
interface, material, do/don't slides.

## big-top

1. MAJOR · deck interface slide (dk/big-top-interface.png) · the ticket CTA is wider than its panel: it runs from
   x=445 to 833 while the panel is 453–825, so both notched ends bleed 8px over the panel border; "SAVE DIRECTION" ends
   at x≈670, 2px from the perforation line. The segmented control's "LAUNCH" tab loses its last scallop at the clip
   (x≈392). · Fix: css/aesthetics/big-top.css `[data-slide="interface"] .ab-cta` — `max-width:100%; box-sizing:border-box`
   and letter-spacing .18em→.12em at slide scale; segmented `overflow:visible` or one fewer scallop per tab.
2. MAJOR · deck material slide (dk/big-top-material.png, x≈470–530, y≈515) · on the tilted ticket "No. 0472" is cut by
   the right-hand notch ("No. 047|2"). Marquee corners carry doubled bulbs (two bulbs stacked at x=124 and x=593,
   y≈243/257 and y≈451/465). · Fix: js/aesthetics/big-top.js material art — stub text `text-anchor:middle` centred in
   the stub with 14px padding before the notch; bulb loop should skip the corner positions already drawn by the side
   rows.
3. MAJOR · deck patterns + do/don't consistency (dk/big-top-patterns, -dodont) · Don't #2 "Use more than two stripe
   colours plus cream" — the suite's "Awning stripes" uses orange + teal + black + yellow stripes and "Bunting" three
   colours plus cream; "Confetti" is black scribble loops over blobs (reads as a doodle error, not confetti);
   "Lithograph dots" is orange/teal camouflage. · Fix: js/patterns/fit.js `'big-top'` — `weave` `colors` two inks +
   canvas; `zigzag` `colors:'two'`; `festival` `loops` 0.2→0, `weight` 0.8→0.4.
4. MINOR · deck patterns, pastel palette (render above) · tiles wash out to pink/blue on cream: "Ring" measures SD 14 /
   0% pixels off-ground, "Bunting" 13/0%, "Lithograph dots" 13/0% — the board and cover darken the stripes but the
   patterns use the raw pastel inks. · Fix: fit.js big-top — colourway that applies the same contrast floor the board
   uses for stripes (`t.stripe`), or engine tone floor (see C4).
5. MINOR · board palette strip (all palettes) · Primary/Accent labels at 0.78 opacity: ink on #E4572E = 3.85:1
   (11px), white on #7A00FF 4.23:1, ink on #FF2E63 4.03:1. The Accent cell wraps "One spark · / ≤5%" so its name sits
   11px higher than the other four (labels misaligned on one baseline). · Fix: css/aesthetics/big-top.css strip labels
   `opacity:.92; white-space:nowrap; align-self:end`.
6. MINOR · board 390px (qc-big-top-D) · the tent art is cropped: the two side tents are cut in half by both edges and
   the bunting exits the frame. · Fix: big-top.css ≤480px — scale the hero SVG to width, no negative margins.
7. MINOR · deck closing · the stripe strip runs full-height down the left 150px, but the slide's valance stripes
   continue across the top of it, so the two stripe systems cross in the top-left corner. · Fix: big-top.css closing —
   start the valance at the strip's right edge (`left:155px`).
8. MINOR · 390px, long brand name "BallKnowledge Collective International" · the header wordmark truncates to "BallKnowledge C…" (no collision; the label stays clear) — the client's name is never shown in full on mobile (C2).
9. MINOR · deck closing duplicate wordmark (C1).

Clean: hero showbill (arched wood type, ribbon, tents, bunting, sunburst) on warm/green/pastel/dark, valance, scalloped
palette strip, type cards, awning segmented, ticket CTA on the board, toggle, Plain/Striped/Spotlit, Act I–III bulb
meters, principles, color, typography, product ("Box office") and do/don't slides, both modes.

---

## Blends (Bold, all five channels; 24 renders, seeded random donors/bases)

Pairs: soft-form←bento-grid, frutiger-aero←soft-form, liquid-glass←gorpcore, blob-tracking←liquid-glass,
holo-iridescent←gorpcore, mixed-type←holo-iridescent, mesh-gradient←cybersigilism, y2k-chrome←mesh-gradient,
aurora-noir←bauhaus-poster, transit-wayfinding←aurora-noir, clay←micrographics, aurora-noir←clay,
frutiger-aero←cybersigilism, cybersigilism←frutiger-aero, gummy←gorpcore, bauhaus-poster←gummy, y2k-chrome←big-top,
biomechanical-gothic←y2k-chrome, bento-grid←industrial-hazard, blob-tracking←bento-grid, neo-brutal-pop←blueprint,
biomechanical-gothic←neo-brutal-pop, big-top←art-nouveau, gummy←big-top. Renders: scratchpad `qc1/out/bl-*.png`.

B1. MAJOR · frutiger-aero base ← soft-form donor (art) · the soft-form glass bar and orange half-disc are dropped
    behind the centred frutiger headline: the bar slices through "design / feel" and the half-disc sits behind
    "alive", turning the highlight word into amber-on-orange (#B87700 on #E4572E, measured 1.0:1 against the disc it
    sits on). Text crossing art, the exact defect class the blend engine is meant to avoid. · Fix: js/blend.js art
    channel — when the base hero is `centered` (frutiger-aero, big-top) place donor art in the hero's art slot below the
    headline, never behind it; or frutiger-aero.js declare `blend.artSlot:'below'`.
B2. MAJOR · cybersigilism base ← frutiger-aero donor (art) · the donor's 24px "new" starburst badge is scaled to the
    art box and becomes a 330px yellow starburst covering half the hero; the sky/hills it belongs to are pushed to the
    edges. Broken donor art scale. · Fix: frutiger-aero.js — mark the badge as an overlay that keeps its intrinsic size
    under blend (`data-blend-fixed`), or blend.js: scale the art scene, not each child.
B3. MAJOR · liquid-glass base ← gorpcore donor (art) · liquid-glass keeps its white headline/eyebrow/lede over the
    donor's pale topographic map: eyebrow "Light, layered × Field tested" 1.25:1, lede 1.30:1 (measured). Only the
    56px headline survives (via its shadow). · Fix: liquid-glass.js — when `state.blend.channels.art` is on, put the
    hero copy on the dark `sceneBase` panel (it already exists) instead of over the art.
B4. MAJOR · y2k-chrome base ← big-top donor (material) · the scalloped valance is applied to the 02 card header and
    covers the "Project name" label (label cream #F6F5F1 on valance cream #F6ECD6 = 1.08:1, and occluded). · Fix:
    big-top.css valance-as-material rule → add `padding-top` equal to the valance height on the receiving card
    (`.ab-blend-mat-valance { padding-top: 22px }`).
B5. MAJOR · blob-tracking base ← liquid-glass donor · the liquid-glass tab bar comes along with the same 1.0–1.7:1 white
    labels (see liquid-glass #2) — the defect propagates into every base that takes liquid-glass art.
B6. MAJOR · blob-tracking base ← bento-grid donor (art) · the phone mock goes ink-on-near-black: "Brand health", "72%",
    "On track" at 1.03–1.04:1 — the phone body disappears, leaving floating chips and a white bar. · Fix:
    bento-grid.js phone art — use its own fixed light screen colour (`#FBFBFA`) rather than `--ab-card` when blended
    into a dark base.
B7. MINOR · bauhaus-poster base ← gummy donor (art) · gummy's ring sits on top of the "l" of "feel" and the base's own
    diagonal bar runs through "should feel"; the hero overflows its box by 72px (`ab-hero` scrollWidth 885 vs 813). ·
    Fix: blend.js — clamp donor art to the art column (`max-width:100%`), z-index below the headline.
B8. MINOR · neo-brutal-pop base ← blueprint donor (art) · blueprint's figure labels ("FIG. 3", "FIG. 4", "64.0", tick
    numbers) render at x=894–1140 in an 884px card — clipped off the board. · Fix: blueprint art scaled to the art box
    in blend mode (same mechanism as B2).
B9. MINOR · gummy base ← gorpcore donor (art) · donor contour label "1,970" sits on top of the base wordmark "Marigold
    Studio" on the gear tag (46×22px overlap). · Fix: gorpcore.js art — keep contour labels out of the tag rect.

Clean blends: soft-form←bento-grid, holo←gorpcore, mixed-type←holo (foil plane reads well), mesh←cybersigilism,
y2k←mesh, aurora←bauhaus, transit←aurora, clay←micrographics, aurora←clay, frutiger←cybersigilism (thorns cross the
headline but that is the donor's own idiom), biomech←y2k, bento←industrial-hazard, biomech←neo-brutal-pop,
big-top←art-nouveau, gummy←big-top — read as one design, no collisions, donor art intact.

## Export (deck PNG via the app's own `rasterizeDeckSlide`, the code path behind "Download PNG")

Ten slides from five aesthetics exported, all 1280×720, none blank (luminance SD 16–82). With a logo uploaded.

E1. BLOCKER · big-top cover + material PNG (scratchpad `qc1/dl/big-top-cover.png`) · the exported file loses the
    style's signature: the striped valance across the top and the striped cover band at the bottom export as two empty
    hairlines with one stray circle; the "ALIVE" ribbon exports slate (sampled rgb(72,80,97)) instead of the teal
    secondary. The PNG is not the slide the client approved. · Fix: css/aesthetics/big-top.css — the valance/band use
    `repeating-linear-gradient` + radial scallops with calc() sizes that html2canvas drops (see the calc workarounds in
    js/brand-deck.js:1237); render them as an inline SVG (or px sizes) and give the ribbon a plain fill colour.
E2. MAJOR · liquid-glass cover PNG (`qc1/dl/liquid-glass-cover.png`) · the lens's duplicate scene is misregistered in
    html2canvas: a second white "M" chunk is pasted 90px right of the real one, so the monogram reads "MF". The code
    comment says the unbent copy "still reads as glass" — it doesn't, it reads as a doubled letter. · Fix:
    js/brand-deck.js export clone — hide `.ab-lens-scene` (or the whole `.ab-lens`) in the export clone for
    liquid-glass, or bake the lens offset (`left/top` %) into px before html2canvas.
E3. MAJOR · aurora-noir cover PNG (`qc1/dl/aurora-noir-cover.png`) · the aurora beam's blurred conic gradient exports
    unblurred as a solid rust fill over the whole app window (window turns orange-brown) and the horizon arc is
    missing. · Fix: js/brand-deck.js export — replace the beam with a pre-rendered radial/linear fallback in the clone
    (html2canvas ignores `filter: blur`), same treatment as other filter-based art.

Clean export: frutiger-aero cover/material, gummy cover/material — match the screen.

## Cross-cutting (framework; affects all 12 — counted once)

C1. MINOR · deck closing slide, every aesthetic · brand lockup printed twice (header wordmark at y≈49 and
    `.ab-deck-wordmark` at y≈131/1222 of 720). · Fix: js/brand-deck.js closing `build()` — drop `.ab-deck-wordmark`
    (the header carries the brand), or hide the header wordmark on the closing slide.
C2. MINOR · 390px header, long brand name · every aesthetic truncates "BallKnowledge Collective International" to
    "BallKnowledge C…"; no aesthetic wraps to two lines or shrinks. (The geometric overlap my script reported is the
    clipped text box, not visible ink — verified on crops.) · Fix: css/aesthetic-board.css `.ab-wordmark` at ≤480px —
    `white-space:normal; line-height:1.1; -webkit-line-clamp:2`.
C3. MAJOR · `gradpanes` family (soft-form "Pressed panes", liquid-glass "Glass panes", mesh "Ramp panes") · a pane that
    starts outside the tile leaves a 4–6px coloured sliver at the right edge. · Fix: js/patterns/families (gradpanes) —
    cull panes whose visible width < 12% of a cell, or clip the grid to whole cells.
C4. MAJOR · pattern tone has no contrast floor · tiles go blank on pastel or dark-other palettes (measured, SD ≤ 8 and
    ~0% pixels off-ground): soft-form 4 tiles, holo "Spectral haze", mesh pastel lead/strip (SD 7–9), aurora "Beam",
    frutiger "Sunrise"/"Aurora swoosh", y2k "Icon sheet"/"Bubble screen", big-top pastel ×4. · Fix: js/patterns/engine.js
    tone — after toning inks, enforce ≥1.6:1 between the darkest/lightest ink and the ground.
C5. MAJOR · pattern family ownership inside this group · `counterchange` stripe+bullseye appears as soft-form lead,
    gummy "Jelly rings" and big-top "Ring"; `ribbonrise` in liquid-glass, aurora and clay; `aura` blur in 7 of 12 suites;
    `tokens` tube maze in clay and neo-brutal-pop; `marble` in clay and neo-brutal-pop. The decks' pattern slides make
    these aesthetics read as siblings. · Fix: js/patterns/fit.js — extend the round-6 lead-ownership rule to whole suites
    within a group (one family per group), starting with the pairs listed.

## Also checked

Typography lock (Playfair Display + Inter locked, each aesthetic chosen): fonts held on all 12, no fallback fonts, no
placeholders; only frutiger-aero's reflection/tagline overlap persists (frutiger #1). Logo upload present (2:1 test
image) on all 12 boards and exported slides: renders in the header, no distortion; absent: initial marks fine. Short
name "Ox": clean on all 12 except aurora's "OS-142" (aurora #3). Keyboard focus (`:focus-visible`, every control on
every board): rings present on all controls except **frutiger-aero `.ab-switch`** — the `:checked` rule
(css/aesthetics/frutiger-aero.css:216) re-declares `box-shadow` after the focus rule (line 193) with equal
specificity, so the checked switch (its default state) shows no focus ring (MAJOR; fix: move line 193 below 216 or
add `.ab-switch:checked:focus-visible`). Placeholder scan of all 12 AI briefs (3,289 lines): none. AI brief vs board:
liquid-glass brief still lists "Light leaks" (neonspray) as a pattern; mesh brief says "Use blurred radial blobs" is a
don't while the suite ships "Mesh wash"; neo-brutal-pop brief bans gradients while the lead pattern is gradients;
big-top brief bans a third stripe colour while two suite patterns use three/four — all covered by the items above.

---

## Fix log (qf1b)

Keys: frutiger-aero, gummy, y2k-chrome, bento-grid, neo-brutal-pop, big-top. Files: js/aesthetics/<key>.js,
css/aesthetics/<key>.css. Evidence: scratchpad `adv/qf1b/` (sheet-fix-*, sheet-wk-*, sheet-deck-*-{rec,other},
sheet-exp-bt3, dl/*, ptfinal/*, audit-all.txt, gore-q-1.json).

**big-top** — E1 BLOCKER fixed: the deck export path (html2canvas 1.4.1) drops repeating gradients, draws a radial
gradient once instead of tiling it, and paints every box-shadow layer over the element. Big Top now uses only
export-safe primitives: stripes are a tiled two-stop linear gradient; valance, swatch hems, tab flaps, bulb rows,
toggle candy stripe and rope are SVG tiles from tokens(); keylines are borders or background lines; the ribbon keyline is
a border (no more slate ribbon); mark, discs, switch, sign, poster, closing strip lost their box-shadows. All ten
slides exported side by side with the screen match (sheet-exp-bt3). #1 fixed (deck ticket fits its cell: 476–804 in a
476–804 body, 18px between label and perforation; tab flaps centred). #2 fixed (serial set as NO./0472 inside the stub;
side bulb rows skip the corners). #5 fixed (strip labels .92, job line min-height so names align). #6 fixed (390 art
is the whole 1200/520 scene). #7 fixed (valance starts at the strip's edge). B4 fixed (panel under a Big Top
material ornament gets 58px top padding; label sits below the valance). #3/#4 → shared request. #8/#9 framework.
**frutiger-aero** — #1 fixed (reflection is generated content, slides get .6em under the wet floor; board audit no
longer sees clipped mirror text). #4 fixed (24px badge, darker ramp, cap under the numerals). #5 fixed (labelled gels
keep the light ramp and cap above the label; Shine has no brightness filter; 0 contrast fails on all 8 colour
variants). #6 fixed (mode-neutral Don't). #7 fixed (closing strip is one SVG of the hero world, day and night).
#8 checked: cover pill is 15px at slide scale, left as is. #11 fixed (switch focus is an outline). B1 fixed (board and
deck cover: donor art goes below / beside the copy, cover fit sees overflow). B2 fixed (scene SVGs sized with
specificity a base's `.ab-art svg` rule cannot beat; seal capped 66px). #2/#3 → shared request (#3 also covered by the
engine floor). qc5 C3 (dead band CSS) and E4 (5 dead vars) removed.
**gummy** — #1 fixed (specular dots on the mark's top-left rim). #3 fixed (390 spill whole, 1200/350). #4 fixed
(button labels at 4.8:1). #5 fixed (seal flavour lifted until plum/white reads ≥5.4:1). #6 fixed ("prints as #…" under
primary/secondary/accent). #7 fixed (closing strip is an SVG tile, every drop inside its tile; exports). E4 dead vars
removed. #2 → shared request.
**y2k-chrome** — #1 fixed (cover spans 56→1224 at natural scale, headline 81px, no fit scale-down). #4 fixed (Latin-only
side label, no ™, short string at ≤600px). #5 fixed (acid field starts 32px after the copy column: 78px clearance).
#6 fixed for copy (principle 01 mode-neutral); patterns → shared. #2/#3 → shared.
**bento-grid** — #2 fixed (patterns slide renders the suite in the bento tiles). #4 fixed (meta row 28px off the
tiles). #5 fixed (bespoke In product bento at slide scale, labels 13–17px). #6 fixed (muted pulled to 4.6:1 on tiles).
#7 fixed (capsule top, title + caption together at the bottom). Also: dark-mode headline word held at 3:1 on the hero
tile; B6: the phone render is sized to its own box (≤1.45× its height), so it stays phone-sized in a wide blend art box.
#1/#3 → shared request.
**neo-brutal-pop** — #2 fixed (cover tile 3px; "$1" tag dropped from the product cover). #3 fixed (hard shadows black
in dark mode, CSS and SVG). #4 fixed (muted on paper cards ≥4.6:1). #5 fixed (both type cards stack picks; equal
heights). #1/#6 → shared request.
**Migration** (all six): tokens(t, state) / hooks read the passed view state (global only as fallback); private
weight pickers replaced by abWeight / abWeightNear / abWeights; private escape helpers replaced by escapeHtml.

Checks: board A–D Chromium + WebKit (no overflow, no console errors); QC1 11-variant audit on all six — remaining flags
are measured false positives (SVG text with fill, clipped phone rows obs 1.00, seal text obs ≥9) plus the framework
C2 ellipsis; gore 4 configs × 6 keys → 0; node tests/run.js all passed; t5 harness 0 fails; src-verify-p5 0 fails;
PNG export of every key not blank (SD 42–76).

### SHARED CHANGES REQUESTED (js/patterns/fit.js, measured in ptfinal/*.png on 7 palette × mode variants)

```
'frutiger-aero': [
  ['aura', 'Sky glow', 'brand', { layout: 'horizon', blobs: 5, soft: 0.8, mode: 'paint', strength: 1 }],
  ['flow', 'Aurora swoosh', 'brand', { field: 'swirl', strands: 3, gap: 3, bend: 1.6, weight: 2 }],
  ['blades', 'Meadow', 'brand', { count: 420, size: 0.9, curve: 0.5, take: 0.7, ink: 'ink2' }],
  ['colony', 'Bubbles', 'duotone', { cells: 20, rings: 2, fuse: 0.8, finish: 'film', nuclei: false }, 0.55],
  ['waves', 'Rolling water', 'brand', { rows: 5, crests: 2, curl: 1.2, strands: 8, drops: 3 }, 0.8],
  ['burst', 'Sunrise', 'brand', { rays: 32, layers: 2, bend: 0.4, beads: 0, origin: 'low' }, 0.8],
],
'gummy': [
  ['colony', 'Jelly cells', 'duotone', { cells: 18, rings: 2, fuse: 1.1, finish: 'film', nuclei: false }],
  ['zigzag', 'Gummy worms', 'brand', { style: 'rounded', colors: 'four', band: 8, amp: 5, period: 10, phase: 'interlock' }],
  ['tokens', 'Gummy drops', 'brand', { cell: 7, link: 0, density: 0.95, fill: 'tint' }],
  ['warpcheck', 'Wobble check', 'brand', { pattern: 'check', warp: 'bulge', cells: 10, amp: 0.5, waves: 1, second: false }, 0.6],
  ['patchwork', 'Candy buttons', 'duotone', { cell: 10, layers: 22, ragged: 0.2, motif: 'circles', dotgrid: false }],
  ['halftone', 'Sugar dust', 'brand', { cell: 1.2, levels: 3, shape: 'round', field: 'clouds', duo: true, tints: true }, 0.6],
],
'y2k-chrome' (two rows change):
  ['thermalstreak', 'Chrome streaks', 'night', { bands: 7, smear: 30, slides: 2, rough: 0.1, flip: 'bright' }]
  -> ['thermalstreak', 'Chrome streaks', 'mono', { bands: 7, smear: 60, slides: 1, rough: 0, flip: 'bright' }]
  ['glyphgrid', 'Icon sheet', 'duotone', { glyphs: 'geometric', cell: 5, bands: 3 }]
  -> ['glyphgrid', 'Icon sheet', 'night', { glyphs: 'geometric', cell: 3.5, bands: 3 }]
'bento-grid' (lead):
  ['modulargrid', 'Tile grid', 'brand', { cols: 6, merge: 1, gap: 1.6, empty: 0.12 }]
  -> ['modulargrid', 'Tile grid', 'brand', { cols: 8, merge: 1, gap: 1.6, empty: 0 }]   (merge max is 1; band now full width)
'neo-brutal-pop': [
  ['chevron', 'Pop chevrons', 'brand', { bands: 6, slope: 30, mirror: 'x', rhythm: 'varied', colors: 'four' }],
  ['halftone', 'Big dots', 'duotone', { cell: 4, levels: 3, shape: 'round', field: 'clouds', duo: true }],
  ['tornbands', 'Torn stickers', 'brand', { bands: 6, tear: 0.8, tilt: -3, minis: 'mixed', shadow: 1 }],
  ['cutup', 'Cut-out sheets', 'brand', { pieces: 4, cell: 2, hills: 0, slip: 0.4 }],
  ['kaleidopix', 'Sticker sheet', 'brand', { px: 2.2, patches: 1.2, fold: 'quad' }],
  ['pixelquilt', 'Pixel quilt', 'brand', { px: 1.2, block: 6, motifs: 'geometric', big: 0.3 }],
],
'big-top': [
  ['zigzag', 'Bunting', 'brand', { style: 'chevron', band: 10, amp: 6, period: 8, phase: 'interlock', colors: 'two' }],
  ['weave', 'Awning stripes', 'duotone', { bands: 8, rhythm: 'even', gap: 0, stripe: 2.5 }],
  ['burst', 'Tent canopy', 'brand', { rays: 28, layers: 1, bend: 0, beads: 0.8, origin: 'low' }],
  ['arcrise', 'Circus ring', 'duotone', { origin: 'bottom', bands: 5, suns: 1, bars: true, bar: 3 }],
  ['stipple', 'Confetti', 'brand', { density: 0.5, dot: 2.4, layout: 'random', mirror: 'none', field: 'clouds', duo: true }],
  ['halftone', 'Lithograph dots', 'brand', { cell: 2.2, levels: 4, shape: 'round', angle: 15, field: 'clouds', duo: true }],
],
```
Why: flyposter's sweep is a gradient LUT at any harden (family code), so neo leads with chevron (free lead, flat bands);
tokens/marble leave neo (clay owns them), counterchange leaves gummy and big-top (soft-form owns it), festival's
scribble lines survive loops 0 / echo false. Lead ownership: chevron is unled; y2k keeps its non-lead chevron. Also update
docs/patterns.md suite table if it lists these rows.

Framework (CL1): html2canvas paints every box-shadow layer over the element (rings, insets, blurred) and drops switch
knobs (bdFlattenSwitches reads the clone's ::before after html2canvas set it display:none) — affects all 48 exports;
deck-frame zoom 0.9984 snaps 2px borders to 1px at DPR 1 (the "hairline" on neo's product card).

## Fix log (qf1a)

Fixer qf1a (Opus), packet rev 1, 2026-10-12. Keys: liquid-glass, aurora-noir, soft-form, mesh-gradient,
holo-iridescent, clay. Files changed: `js/aesthetics/{liquid-glass,aurora-noir,soft-form,mesh-gradient,holo-iridescent,clay}.js`
and the matching `css/aesthetics/*.css`. Suite changes are a shared request (fit.js), verified in-page with an
override (scratch `adv/qf1a/inject-suites.js`); scratch evidence lives in `adv/qf1a/`.

**soft-form.** 1 fixed via shared suite: lead is `chevron` "Pressed facets" in `tonal` (soft tone-on-tone
lozenges, a free lead), `counterchange` leaves the suite. 2 C1 (CL1). 3 fixed via suite: every entry tonal at
full tone (tonal is quiet by design; 0.45 made four tiles blank), "Ring studies" and "Quiet glow" replaced by
`modulargrid` "Bauhaus forms" and `oprings` "Ripples", `tissue` "Quilted cells" added. 4 C3 (CL1 fixed the
sliver). 5 fixed via suite: `pebbles` mode crumble, lit 0. 6 fixed: at ≤600px the progress channel takes its
own full-width row. 7 C2 (CL1). 8 fixed: a yellow/amber accent that needs shading falls back to the primary
shaded to 3:1 (`--ab-accent-ink` in tokens); warm "alive" is now orange, pastel is dusty rose. 9 fixed: card and
panel secondary text uses a muted pulled to 4.6:1 on the lifted dark panel. 10 framework (do/don't numerals).
11 fixed: the on-state knob gets a rim of primary pushed 45% toward ink.

**liquid-glass.** 1 fixed: `deck.coverBand/closingStrip: false`, `materialStage` removed so slide 06 shows the
lens scene; `neonspray` leaves the suite (shared). 2 fixed: tab bar is dark adaptive glass (14,16,26 @ .62),
labels #fff; selected tab is a white lens with ink labels; 0 failures on 11 variants and in blob-tracking ←
liquid-glass. 3 fixed: normal map 1024px, blurred 4px, plus a 0.6px blur on the bent result (Chrome samples the
displacement nearest-neighbour). 4 fixed: no channel split; the fringe is a 20% full-colour echo (only brand
colours). 5 fixed: segmented track is light frosted glass (white .55) with ink labels; no olive seam. 6 fixed:
selected segment is a white lens with ink text in both modes. 7 fixed via suite: `ribbonrise`/`gradpanes` out;
`counterchange` "Lens bars", `weave` "Reeded glass", `colony` "Droplets" in. 8 fixed: five capsules on one row
(role over hex). 9 fixed: 46px under the segmented strip. 10 fixed: `--ab-muted` pulled to 4.5:1 on the
material panel. 11/12 C2/C1. B3 fixed: with a donor's art the hero copy sits on the scene-base panel. E2 fixed:
the export hides the lens duplicate and draws flat rims; 0.5px hairline shadows became 1px half-alpha (a 0.5px
spread made html2canvas throw on cover/interface/material).

**holo-iridescent.** 1 fixed: cover reflows without a band; the bubble moves to the plane's top-left on the
cover. 2 fixed on the deck: `coverBand/closingStrip: false` (the fixed spectrum is three flat inks, so any band
of it reads op-art); the lead tile is `oprings` saddle, freq 36, warp 0, tone .75 (shared); the remaining
op-art look needs the engine request below. 3 fixed via suite: `aura` mode paint, strength 1. 4 fixed: the chips
sit in a fourth framed panel. 5 fixed: plane 100cqw, the initial is whole. 6 fixed: the spectral line is inset
by the radius. 7 fixed: strip captions at .92, the "·" no longer ends a line. 8 fixed: no black spot in dark
mode. 9 fixed: headline `text-wrap: balance` at ≤600px; the word starts on the accent shaded to 3.2:1 (solid
`color` too). 10 engine request. qc5 C1 fixed: `.is-hover/.is-pressed` CTA rules removed. Export: the foil
plane exports as a flat banded sweep (no 3D tilt, no conic).

**mesh-gradient.** 1 fixed: the type.spec card grows to fit its longest line. 2 fixed via suite: `flow` weight 2
(solid strands), 3 strands, gap 2.6. 3 fixed: the band keeps light-mode luminosity in dark mode. 4/5 fixed via
suite: `aura`, `burst`, `specimens` out; `waves` "Combed silk", `ribbonrise` "Striations", `sonar` "Contours"
in (`gradpanes` "Ramp panes" kept: now in two suites of this group, soft-form tonal and y2k). 6 C3 (CL1). 7
fixed: selected segment is ink with a 2px primary underline. 8 fixed: 01 card stretches and carries an owner /
due / reviewers list above the action. 9 fixed: bars are one primary colour. 10 fixed: muted pulled to 4.6:1 on
the ink fills; the Pressed pill no longer darkens (ink on primary keeps its ratio). 11 fixed: "Opaque card".
12/13 C2/C1. CL1 to-do done: `.ab-head` uses `min-height`.

**aurora-noir.** 1 fixed: `coverBand/closingStrip: false`; suite replaced (shared). 2 fixed: the window ends
above the horizon arc (arc z 1, window z 2, two activity rows), the crumb tag sits above the beam cone, the arc
no longer overflows the board (sw 893→884). 3 fixed: `anPrefix` — MS, BC (BallKnowledge Collective…), OX.
4 fixed: ≤600px hides the activity log and sizes the window to content. 5/6 fixed via suite: `prismpix`,
`modulargrid`, `aura` out; `typeterrain` "Readout", `burst` "Beam" (one thin ray layer), `signal` "Packet log",
`relief` "Traces" in. 7 fixed: kicker "Lit by one beam" (true in both modes). 8 fixed: section numbers follow
the rendered order (counter, like the FIG captions). 9 fixed: muted pulled to 4.5:1 on the 12% ink fill in both
modes (also clears aurora ← clay). 10 C1. E3 fixed: the export drops the conic beam, the front cone, the
window's box-shadow (html2canvas filled it rust) and the wallpaper fade; the beam is a vertical fade and the
horizon a 1.5px elliptical border.

**clay.** 1 fixed via suite: `pebbles` duotone (a tonal primary ramp, no sage mix), mode crumble, lit .4.
2 fixed: avatars are flat primary tints with ink initials. 3 fixed via suite: `marble`, `tokens`, `ribbonrise`,
`aura` out; `tissue` "Pressed tiles", `rods` "Coils", `colony` "Clay beads", `blades` "Petals" in; `specimens`
study rings. 4 fixed: section numbers follow the rendered order. 5 fixed: the highlight underside turns a yellow
toward orange before darkening. 6 fixed: muted pulled to 4.6:1 on the card fill. 7/8 C2/C1. Export: grain
overlay and soft inset shadows dropped in the export (they printed a grey veil).

**Checks.** Inspector audit (11 variants × 6 keys): 0 real contrast/clip/overlap failures; what remains are the
script's known artifacts (color(srgb) parsing, text sampled on its own fill) and the mesh approval chip's
deliberate ellipsis on the long name. Gore 4 configs: 0 (24 combos). node tests/run.js: all passed. harness: 192
briefs, 0 fails. src-verify-p5: 53 families, 0 fails, 0 map mismatches. Deck PNG export: 120 slides (6 keys × 2
modes × 10) export without error; covers not blank (luminance SD 29–87). WebKit boards checked. Blends: 14 pairs
with my keys, no new failures.
