# QC3 — severe QC, round 6 (packet rev 1)

Inspector: QC3 (Opus, read-only). Aesthetics: riso-print, xerox, xerox-punk, corporate-vandalism, acid-graphics,
ascii-art, rebus, blob-tracking, pixel-arcade, pirate-broadcast, old-web, cyber-hud.

Method. Every board shot (A/B/C/D) and all 20 deck slides per aesthetic (dk + dko) were opened at native size;
suspect areas were re-cropped at 2–4x. Contrast was measured, not guessed: QC1's in-page audit (copied to scratchpad
`qc3/audit.js`, `qc3/contrast.py`) ran 11 variants per aesthetic (warm rec/other, green, 390, pastel rec/other,
dark-saturated rec/other, long name 1280/390, "Ox"; log `qc3/all.log`). Extra live checks in session `qc3`: 24 Bold
blends (each aesthetic as base with one random donor and as donor into one random base, all channels, `qc3/bl/`),
typography lock (Playfair/Lora locked, `qc3/lk/`), logo present (`qc3/lg/`), focus-visible on CTA / input / switch /
segmented, faux-bold scan, `buildAiBrief(state)` for all 12 (`qc3/brief/`), and deck PNG export through the real
`rasterizeDeckSlide()` path for xerox, old-web and blob-tracking (cover, material, closing; `qc3/ex/`).

Severity: BLOCKER = broken / illegible core content / missing art. MAJOR = a client would notice in a pitch.
MINOR = polish.

---

## Cross-cutting (fix once, affects several of my 12)

X1. BLOCKER · deck PNG export (html2canvas path, `js/brand-deck.js` `rasterizeDeckSlide`) loses art and chrome that
    the on-screen slide shows. xerox Material: the whole M copy art is gone (0 dark pixels in the art area at 2x; the
    art is an SVG with feTurbulence/feDisplacementMap filters). old-web cover/material/closing: the silver browser bar
    renders black, the wordmark in it disappears, the starfield is gone, badges render as blank black blocks.
    blob-tracking closing: the footage-plate strip renders as flat grey. Files are not blank, but they do not match
    the slide. · Fix: in `rasterizeDeckSlide` `onclone`, replace each `.ab-art svg`, `.pt-deck-band`, `.pt-deck-strip`
    and any element with a `filter:url(#…)` by an `<img>` rasterised from the live node (XMLSerializer → canvas) before
    html2canvas runs; and extend `bdSanitizeClone` to resolve `background` shorthands that use `var()`/color-mix on
    `.ab-head` (old-web) and `--ab-plate` (blob-tracking) to computed rgba.
X2. MAJOR · pattern colourway `night` is inverted on dark grounds: `js/patterns/engine.js:378` sets `ground = k`
    (the ink). In dark mode the ink is the light neutral, so "night" tiles render cream. Visible: old-web "Starfield"
    (cream with dots on the dark deck, dark on the light deck), pixel-arcade "Item sheet" (cream tile on the night
    deck). · Fix: `ground = lum(k) < lum(g) ? k : g; deep = the other`.
X3. MAJOR · AI brief prescribes faux bold: every brief says "Headings: 44px, weight 700" even when the heading face
    ships one weight — Anton (xerox-punk, old-web), Tilt Warp (acid-graphics), VT323 (pirate-broadcast heading).
    · Fix: `js/ai-brief.js` clamp the heading/body weight to the nearest value in `FONTS[i].weights`.
X4. MAJOR · focus ring missing on the text field (`.ab-input` computed style identical focused vs not) in xerox,
    xerox-punk and old-web. Listed under each.
X5. MINOR · closing slide prints the wordmark twice (header + lockup) — QC1 C1, applies to all 12.
X6. MINOR · 390px long name "BallKnowledge Collective International" truncates to "BallKnowledge Co…" in every
    header — QC1 C2, applies to all 12 (no collisions found).

---

## riso-print

1. BLOCKER · deck cover, both modes (dk/riso-print-cover.png, dko/riso-print-cover.png) · the one-line headline runs
   into the big M art. Light: "ALIVE" is sea-foam on the sea-foam M stem, "VE" vanishes. Dark: cream "ALIVE" on the
   cream M, only "AL" reads. · Fix: css/aesthetics/riso-print.css — slide-scoped
   `.ab[data-ae="riso-print"].ab-slide[data-slide="cover"] .ab-hero-copy { max-width: 50%; }` and keep the art in the
   right 45%, or give `.rzh` a paper knock-out on slides.
2. MAJOR · board A (also L, S) headline "GOOD DESIGN SHOULD FEEL" drum 1 #FF6C2F on paper #F9F6F0 = 2.64:1 at 84px
   (<3:1 large); 390px 2.52:1. · Fix: js/aesthetics/riso-print.js tokens() — raise the `pale` threshold
   (`t.contrast(D.d1.hex, t.canvas) < 2.3`) to 3.0 so pass B overprints the words, or snap the headline drum to the
   next darker ink.
3. MAJOR · board A "ALIVE" sea-foam #62C2B1 on paper = 1.99:1 (pastel 1.61:1), and the word overlaps the M stem so
   its last letters merge into the art. · Fix: same threshold applied to drum 2 for the last word; riso-print.css:39
   `.ab-hero-copy` width `min(100%, 64cqw)` → `52cqw` so the headline ends before the art.
4. MAJOR · palette 6th chip "OVERPRINT 1×2" label clipped: "ORANGE × SEA FOA…" (warm), "HUNTER GREEN × GI…" (green).
   · Fix: riso-print.css:80 `white-space: pre; overflow: hidden` → `white-space: pre-line; overflow-wrap: anywhere;`.
5. MAJOR · pastel palette (#F4C2C2 primary) snaps drum 1 to "LIGHT GRAY": headline prints grey, the client's pink is
   gone (out/riso-print-P.png). · Fix: riso-print.js `rzDrums` — exclude grey inks unless the input chroma is below
   ~0.04, weight hue/chroma over lightness in the nearest-ink distance.
6. MINOR · CTA "registered" state (board + deck interface) prints the overprint as olive-brown #625221 (light) /
   cream (dark); reads as disabled/dirty. · Fix: riso-print.css:118 registered → drums aligned, keep drum 1 fill.
7. MINOR · input focus outline sea-foam #62C2B1 on paper ≈2.0:1 (<3:1). · Fix: riso-print.css:124 outline
   `var(--rz-d2)` → `var(--ab-ink)`.
8. MINOR · patterns "Riso still life" and "Coastline" print solid black masses; the style's own don't is "a fourth
   black ink". · Fix: js/patterns/fit.js 'riso-print' inkstill/sonar → ink from drums only.
9. MAJOR · blend riso-print base + dystopian-luxury (Bold): riso's scene art is dropped; a black date bar
   ("2026.1…", cropped at the right edge) crosses the headline and an empty frame with X corners sits on "should".
   · Fix: js/blend.js — when the base hero is `scene`, place donor art in the scene slot only, never as a bar across
   the copy.

Clean: B dark, C green, D 390 layout, principles/color/typography/interface/product/do-don't slides (both modes),
as donor into mixed-type (reads as one design), typography lock, logo, "Ox", AI brief vs board.

## xerox

1. BLOCKER · deck PNG export, Material slide: art missing (X1).
2. MAJOR · dark deck Interface (dko/xerox-interface.png) · Gen 1/3/7 "M" glyphs #111 on canvas #050404 = 1.1:1,
   invisible. · Fix: css/aesthetics/xerox.css:180 `.xr-gen { background: var(--ab-canvas) }` →
   `var(--xr-paper)` (the copy is always paper).
3. MAJOR · board B (dark) palette: chips are fixed paper/toner while labels follow the mode — "CANVAS #050404" sits
   on a salmon paper chip, "INK #F6F5F1" on a #111 chip; in light mode "INK #2E282A" sits on a #111 toner chip.
   · Fix: xerox.css:97-98 — in dark mode map canvas chip to `var(--ab-canvas)`, ink chip to `var(--ab-ink)`, or
   relabel the chips "Paper stock" / "Toner" with their real hexes.
4. MAJOR · consistency: cover band + closing strip lead "Toner heat" print mid-grey camouflage, "Toner crush" and
   "Copied screen" tiles are grey; the brief and do/don't say "Never: greys or gradients … a copy has toner or paper".
   · Fix: js/patterns/fit.js 'xerox' — lead with `halftone` at levels 2 (pure toner), set thermal `levels: 2` or drop it.
5. MINOR · palette usage lines read "Support · 0%" and "One spark · 0%" — looks like an unfilled value.
   · Fix: xerox.js palette coverage → "copies as toner dots" wording instead of 0%.
6. MINOR · footer influences "Pati Hill copier works / Copy art / …" 3.75:1 declared, ~3.2:1 on the speckle (11px).
   · Fix: xerox.css footer muted → 75% toner.
7. MAJOR · input focus ring missing (X4). · Fix: xerox.css add `.ab-input:focus-visible { outline: 3px solid
   var(--xr-toner); outline-offset: 2px; }`.

Clean: A, C, D boards, ALIVE block, generations art, deck light mode (all 10), blends (xerox + art-nouveau,
xerox + xerox-punk, as donor into clay), lock, logo, export of cover/closing.

## xerox-punk

Coordinator item verified: the "ALIVE" tile is legible on A, B, C, D, long name and the deck cover (fluoro tile + black
tiles, ring clear).

1. MAJOR · input focus ring missing (X4). · Fix: xerox-punk.css `.ab-input:focus-visible` marker underline/outline.
2. MINOR · deck cover (dk) · the marker ring around ALIVE touches the "BRAND GUIDELINES" footer label (2–4px).
   · Fix: xerox-punk.css slide cover headline `margin-bottom: 16px`.
3. MINOR · palette "Canvas" swatch (torn paper, no keyline) disappears into the canvas in both modes, only the tape
   shows (board A, deck color). · Fix: 1px toner keyline on the canvas chip.
4. MINOR · patterns "Dead channel" renders marbled leaf shapes (not TV snow); "Bill posting" is an RGB smear that
   reads acid/pirate. · Fix: fit.js 'xerox-punk' snow → `grain` high, flyposter → mono.
5. MINOR · Anton is also old-web's default heading; the deck typography slides of both show plain Anton
   "Aa / Good design" — the one slide where the two read as siblings. · Fix: aesthetic-meta xerox-punk pairing[0]
   heading → Bebas Neue or Alfa Slab One (already listed alternates); the board's ransom headline is unaffected.
6. MINOR · AI brief heading weight 700 on Anton (X3).

Clean: B newsprint mode, C green (signal-green fluoro), D 390, long name (ghost word behind is decor, no text
collision with UI), deck both modes, blends (base + art-nouveau; as donor into xerox), lock, logo.

## corporate-vandalism

1. MAJOR · deck Do/Don't (dk + dko) · the rotated APPROVED / REJECTED stamps (`.cv-stamp`, 10px mono) overflow
   the numeral column and overprint the first letter of every item ("[APPROVED]Leave", "[REJECTED]Recolour").
   · Fix: css/aesthetics/corporate-vandalism.css:277 add `margin-right: 12px` and give the do/don't number column
   `min-width: 86px` (or put the stamp on its own line above the item).
2. MAJOR · dark deck Interface (dko) · "REDACTED" state is a black bar on the black slide — invisible except
   "(b)(6)". · Fix: corporate-vandalism.css redacted state in dark → `background: var(--ab-ink)` or a 1px ink border.
3. MINOR · dark board B + dko color · "OURS · FIXED" black chip vanishes on the black canvas. · Fix: 1px ink keyline.
4. MINOR · deck principles/closing · the Kruger bar covers line 2 of the official headline ("Please initial here."
   shows only ascender halves) — reads as a render bug, not a deliberate slap. · Fix: slide `.cvh-k`
   `margin-top: 0.1em` so it covers the line fully or not at all.
5. MINOR · deck cover · notice + receipt art shrunk to a ~210px column, body text ~5px; left half of the cover empty.
   · Fix: brand-deck cover stage for this key: art at 45% width.
6. MINOR · board A: "Focus mode on", "Approved", "Flagged", "Redacted" 4.22:1 declared, 3.1–3.3:1 measured, 10px.
   · Fix: muted text → 70% ink.
7. MINOR · blend neo-brutal-pop base + corporate-vandalism donor: the notice art is cropped at the right and bottom
   ("IGOLD STUDIO", text cut mid-paragraph). · Fix: blend art fit for `cva` — scale to fit, not crop.

Clean: A, C, D, long name, "Ox" (sticker covers the name by design), Jost italic 800 actually loaded (audit
"fallback" flag was a false positive), focus ring, blend base + frutiger-aero, lock, logo, AI brief.

## acid-graphics

1. MAJOR · palette "VIBRATING PAIR" chip text clipped at the chip edge: "ACID #FF4914 × CLASH #009…" (warm),
   "#597…" (dark palette) — every variant. · Fix: css/aesthetics/acid-graphics.css pair chip → two lines
   ("ACID #FF4914" / "CLASH #009C99"), `overflow-wrap: anywhere`.
2. MAJOR · dark-saturated palette (#7A00FF): computed clash is a muddy olive #597400 — fills half the pair chip and
   the ALIVE echo. · Fix: js/aesthetics/acid-graphics.js `acClash` — pick the complementary hue at max chroma in
   OKLCH and match luminance by moving lightness only within gamut; reject results with chroma < 0.12.
3. MAJOR · board primary chip text rgb(20,20,20) at opacity .78 on #E4572E = 3.85:1 declared, 3.0 measured, 10–11px.
   · Fix: acid-graphics.css chip text opacity 1 (6.0:1).
4. MAJOR · deck cover (dk + dko) · headline shrunk to ~30px lines in a narrow column and the flyer ~100px wide; the
   centre of the cover is empty. Weakest cover of the twelve. · Fix: acid-graphics.css slide cover → headline 60%
   width at display scale, flyer at 35%.
5. MINOR · dko cover · subcopy's last line sits on the orange hero box's bottom edge (0px padding, descenders touch).
   · Fix: slide cover `.ab-hero-copy { padding-bottom: 14px }`.
6. MINOR · board A · empty 480×175 hole above the flyer (right column). · Fix: align flyer to top of hero copy.
7. MINOR · board A · "02 SIGNAL" meta line "… PEAK-9 ✱ ROO…" truncated by the barcode. · Fix: shorten meta string.
8. MINOR · AI brief heading weight 700 on Tilt Warp (X3).

9. MAJOR · blend cybersigilism base + acid-graphics donor: flyer art cropped at the bottom ("DANCE" cut) and its
   pictogram strip blown up ~3x over the MARIGOLD lockup. · Fix: js/blend.js donor art fit for `aca` — preserve
   the flyer's aspect (`contain`), never scale inner parts.

Clean: B light, C green, D 390 (ticker overflow is a clipped marquee by design), base + mid-century blend, lock,
logo, focus rings.

## ascii-art

1. MAJOR · board C (green palette): primary #2F6B4F snaps to CGA grey #555555 and secondary to grey; hero, CTA and
   primary chip are all grey, the client's green is gone. · Fix: js/aesthetics/ascii-art.js `aaCga` — add hue weight
   (reject grey when input chroma > 0.06; take the nearest chromatic CGA colour, e.g. #00AA00 / #55FF55).
2. MAJOR · board B (light): ALIVE prints olive #8C893D while the accent chip shows bright #FFFF55; primary prints
   CGA brown #AA5500. Muddy, and chip ≠ headline. · Fix: ascii-art.js aaQuant — on paper show the shaded colour on
   the chip too, and pick #AA00AA/#0000AA family by hue instead of "dark yellow".
3. MAJOR · deck cover · the character hero is a ~200×55px panel (glyphs ~3px), right half of the cover empty.
   · Fix: ascii-art.css slide cover art width 45%.
4. MAJOR · deck Material · art panel ~520×150 in the top-left of a 640×360 stage, the rest empty; glyphs ~5px.
   · Fix: same — material stage art fills the stage.
5. MAJOR · consistency · do/don't says "Don't: Use a mono webfont as display" while the typography slide shows
   "Good design" 70px in JetBrains Mono and the brief recommends JetBrains Mono for headings. · Fix: reword the
   don't to "Don't set the hero headline as plain mono text — build it from block letters".
6. MINOR · readouts print "0x#E4572E" (prefix plus hash) on every swatch; the code comment says `0xE4572E`.
   · Fix: ascii-art.css `.ab-sw-hex::before` strip the "#".
7. MINOR · type card "UI & MONO" shows "//" with no description — looks unfinished. · Fix: fill the meta line.
8. MINOR · patterns "Box-drawing grid" is circles/X/stripes (no box characters); "Density map" smooth grey clouds.
   · Fix: fit.js 'ascii-art' modulargrid → glyphgrid with box chars; terrain → typeterrain.

Clean: A, D 390, pastel, dark-saturated, long name, blends (base + y2k-chrome, as donor into radical-memphis), lock,
logo, focus rings.

## rebus

1. MAJOR · deck Patterns, "Sentence wall" tile · text fills the top 40%, bottom 60% empty. · Fix: fit/slide —
   repeat the sentence to fill or vertically centre.
2. MINOR · deck Material · the 24-unit grid's stripe cuts run as paper-coloured bars through the grid lines across
   the whole box, reading as seams. · Fix: clip stripe cuts to the glyph (`clip-path` to the glyph path).
3. MINOR · deck do/don't · "Do" numerals primary on paper ≈3.4:1 at 12px (framework, QC1 #11).
4. MAJOR · blend frutiger-aero base + rebus donor: the subcopy appears twice (top-left, flush to x=0 with no gutter,
   and again in the pill under the headline); "READ IT ALOUD. ANSWER" is orphaned at the left edge with no answer.
   · Fix: js/blend.js — drop the rebus lockup sub-line when the base owns the subcopy; respect base padding.

Clean: A, B, C, D, pastel (CTA pink with ink text ok), dark-saturated, long name (rebus lockup wraps cleanly),
"Ox", base + frutiger-aero blend, lock, logo, focus, AI brief.

## blob-tracking

1. MAJOR · deck Typography · the "TEXT 0.99 · CLASS: HEADLINE" tabs overprint the "DISPLAY · 70px" and "HEADING"
   labels (text on text). · Fix: css/aesthetics/blob-tracking.css slide-scoped
   `.ab-slide[data-slide="typography"] .ab-headline::after { content: none }` or move the tab to the right.
2. MAJOR · deck Principles · the tab is clipped at the slide edge: "XT 0.99 · CLASS: HEADLINE". · Fix:
   blob-tracking.css:313 `.ab-slide .ab-headline::before { right: 0 }` → also `left: 0` on the ::after tab.
3. MAJOR · deck Cover · the headline box's bottom rule strikes through "BRAND GUIDELINES". · Fix: slide cover
   headline `margin-bottom: 40px` (box extends 34px below).
4. MAJOR · deck Closing · the tab sits on the lockup's M box and the box's bottom rule runs through
   "Tracked · Clinical · Live". · Fix: same slide margins as 3.
5. MAJOR · deck export closing: plate strip blank (X1).
6. MINOR · board A hero plate · label tabs collide in the GROUP 03 cluster ("PERSON 0.92" over "PERSON 0.89",
   "SHADOW 0.42" over a figure) — the do/don't only allows collision on the locked target. · Fix: label de-collision
   pass in blob-tracking.js plate builder.
7. MINOR · D 390 / deck material · plate crop cuts labels at the frame edge ("E 01 · 10 OBJ", "SON 0.93").
   · Fix: inset labels by 6px from the crop.
8. MINOR · board B: "alive" accent-ink #C27E00 on paper — legible (3.2:1) but mustard-brown.

Clean: A, C, pastel, dark-saturated, long name, blends (base + art-nouveau; as donor into mid-century), lock, logo.

## pixel-arcade

1. MAJOR · deck Patterns "Item sheet" (tone Night) renders a cream tile on the night deck (X2).
2. MAJOR · board B (light): type-card labels "Headings", "Body", "01/02/03" 2.97:1, "Pixel Arcade" 3.06:1, "Build"/
   "Launch" 4.15:1 at 15–16px VT323. · Fix: css/aesthetics/pixel-arcade.css light-mode muted → 70% ink.
3. MINOR · deck cover band "Parallax hills" reads as leopard camouflage (orange/teal/white/black blobs), not hills.
   · Fix: fit.js 'pixel-arcade' terrain → `bands` stepped horizontally, or lead with `pixelgrid` Tile map.
4. MINOR · deck cover · hero card cuts the gem sprite in half at its left edge. · Fix: shift card or sprite 24px.

Clean: A, C, D, pastel, dark-saturated, long name, interface/product/dodont slides, blends (base + editorial-serif
reads as one; as donor into bento-grid), lock, logo, focus.

## pirate-broadcast

1. MAJOR · deck Interface · segmented control overflows its own frame: "01 DESIGN" selected tab starts left of the
   inner frame, "03 LAUNCH" ends past it. · Fix: css/aesthetics/pirate-broadcast.css slide segmented
   `width: 100%; box-sizing: border-box`, tabs `flex: 1 1 0; min-width: 0`.
2. MAJOR · deck Patterns "Dead air" · black tile with one cyan bar — reads as a failed render. · Fix: fit.js
   'pirate-broadcast' signal → more bands / test-card bars.
3. MINOR · deck Patterns "Colour bars" shows yellow/cyan triangles, no bars. · Fix: gradpanes cols 7, steps 0.
4. MINOR · INTRUSION "SAVE" (board + deck): blue label on red with scanlines ≈2.1:1 — it is the CTA label.
   · Fix: label in white with the RGB split as a shadow only.
5. MAJOR · blend pirate-broadcast base + wabi-sabi: subcopy runs over the bowl art and a red stamp square lands on
   "in". · Fix: js/blend.js — keep donor art out of the teletext text column (art right 45%).
6. MINOR · AI brief heading weight 700 on VT323 (X3).

Clean: A, B, C, D, pastel/dark (fixed palette holds), long name, "Ox", as donor into clay, lock (teletext headline
is drawn, not set — by design), logo, focus.

## old-web

Coordinator items. Distinctness vs pixel-arcade: boards are clearly distinct (starfield + grey windows vs pixel game
scene). The deck is not: old-web's cover band and closing strip are `pixelquilt` chunky 8-bit tiles in the client
colours — the same signature pixel-arcade's deck carried — so the two decks open and close on sibling textures.
Shared Anton: see xerox-punk #5.

1. BLOCKER · deck Closing (dark, dk/old-web-closing.png) · the lockup wordmark is invisible — every pixel in the
   text area is #000 (black text on black); only the M tile shows. · Fix: css/aesthetics/old-web.css closing lockup
   `.ab-deck-wordmark { color: var(--ab-ink) }` (it inherits the silver-window ink).
2. BLOCKER · deck export: browser bar black, wordmark lost, starfield gone (X1).
3. MAJOR · distinctness · cover band / closing strip lead `pixelquilt` (see above). · Fix: js/patterns/fit.js
   'old-web' — lead with `marble` "Marble GIF" or a fixed `stipple` Starfield (after X2); keep pixelquilt lower.
4. MAJOR · deck Patterns "Starfield" (Night) is cream with dots on the dark deck (X2).
5. MAJOR · deck Cover · the welcome window's marquee band is crushed to an ~8px navy bar, text clipped to glyph tops.
   · Fix: old-web.css slide cover marquee `min-height: 18px; line-height: 18px`.
6. MAJOR · board B (light): WordArt "alive" #CC8400/#8F5C00 — mustard-brown. · Fix: old-web.js accent ramp in light
   mode → keep hue, darken in OKLCH (ow-ha3/ow-hx), not toward brown.
7. MAJOR · focus ring missing on the text field (X4). · Fix: old-web.css `.ab-input:focus-visible { outline: 1px
   dotted #000; outline-offset: -4px }` (Win98 style).
8. MAJOR · blend old-web base + holo-iridescent: WordArt "alive" is olive #614C08 on the black starfield, 2.2:1.
   · Fix: blend colour channel must re-run old-web's `--ow-ha*` contrast step on the blended accent.
9. MINOR · board A/B/C: starfield dots fall inside text lines (subcopy, footer links). · Fix: old-web.css text
   blocks `background: var(--ab-canvas)` padding 2px, or mask stars behind `.ab-subcopy`.
10. MINOR · address bar reads "http://Design language /Old Web" (spaces, capitals) — looks like a typo; deck
    "http://Brand guidelines /Cover". · Fix: slugify (`design-language/old-web.htm`).
11. MINOR · deck do/don't titles in green #1E7A1E and purple #9933CC — not in the brief's token list ("do not
    introduce new colors"). · Fix: use `--ow-link` / `--ow-visited` tokens and list them in the brief.
12. MINOR · deck Typography · Anton specimens flat rust #A03D20 on black (3.18:1, large) with no WordArt treatment —
    the board never shows the heading face flat. · Fix: apply the WordArt gradient to the display specimen.
13. MINOR · AI brief heading weight 700 on Anton (X3).

Clean: A, C, D (390 window chrome holds), pastel, dark-saturated, long name, "Ox", as donor into mesh-gradient,
lock, logo.

## cyber-hud

1. MAJOR · deck cover band + closing strip lead `totem` "HUD strip": a grey Fair-Isle knit/tribal band, mono grey,
   not cyan/magenta, not HUD. · Fix: js/patterns/fit.js 'cyber-hud' — lead with `modulargrid` Ruler grid or `signal`
   in the fixed neon colourway; remove totem.
2. MAJOR · deck Cover · the headline panel sits over the top ruler (the "000" tick label is half hidden) and the
   ALIVE slab touches the subcopy line (0px gap). · Fix: css/aesthetics/cyber-hud.css slide cover panel
   `margin-top: 24px`, `.ab-hl` slab `margin-bottom: 10px`.
3. MAJOR · deck Material · readouts (TGT/VEL/LIVE) overlap the reticle; the crosshair arm and magenta arrow cross
   "VEL". · Fix: cyber-hud.css material readouts `right: 4%` outside the reticle radius.
4. MAJOR · blend liquid-glass base + cyber-hud donor: HUD headline white #FFF on pale glass #E9ECEF = 1.19:1.
   · Fix: js/blend.js / css/blend.css — the `[data-bl-scrim]` scrim (or `--ab-ink`) must apply when the donor's
   headline colour was fixed for a dark field and the base canvas is light.
5. MINOR · D 390 · readout panels overlap the reticle circle (bottom-right). · Fix: stack readouts under the
   reticle at ≤480px.
6. MINOR · LIVE state "SAVE" (board + deck) has a 1px line through the label — reads as strikethrough.
   · Fix: move the scan line 4px below the baseline.
7. MINOR · light mode (B): ruler numerals 8px #007C86 @ .85 = 3.33:1, "Sync 98.2%" 10px 4.19:1. · Fix: full opacity.

Clean: A, C, pastel, dark-saturated (client colour stays one channel), long name, base + gummy blend, lock, logo,
focus, AI brief.

---

## Counts

Numbered items: BLOCKER 5, MAJOR 47, MINOR 42 (94). The 5 BLOCKER lines are 3 distinct defects: deck PNG export
dropping art/chrome (X1, repeated under xerox and old-web), riso-print deck cover ALIVE lost in the M art, old-web
dark closing wordmark black on black.

## Fix log (qf3b)

Keys: rebus, blob-tracking, pixel-arcade, pirate-broadcast, old-web, cyber-hud. Files: js/aesthetics/<key>.js,
css/aesthetics/<key>.css. Evidence: scratchpad/adv/qf3b/ (sheets/, sheet-deck-*.png, ex/, gore-qf3b-1.json).

- rebus 1 fixed (sentence wall spreads top to bottom) · 2 fixed (stripe cuts masked to the glyph on the
  construction sheet: rbDraw `clip`) · 3 fixed locally (`--dk-mark-do: ink` on rebus slides) · 4 fixed on the
  aesthetic side (`.ab-blend-art[data-ae=rebus] .rb-sub` hidden: the base owns the subcopy).
- blob-tracking 1/2/3/4 fixed (deck: no box/tab on typography and do/don't; principles lead column gets 18px
  inside its clip; headline box bottom -22px + 26px margin on cover/principles/closing, 26px clearance) · 5
  export re-checked after CL1 (strip renders) · 6 0 overlapping tabs at 1280 (one 0px touch) · 7 fixed (tabs and
  the lock readout are held 6px inside a cropped frame; tabs of off-frame boxes move out) · 8 declined: accent ink
  is the framework's 3:1 shade of yellow on paper, and a fill would break the "no fill" tracking rule. Also: lock
  tab text and X/Y readout now 4.5:1 (dark-saturated light mode was 2.6:1), muted holds on the flat panels.
- pixel-arcade 1 by CL1 (night colourway) · 2 fixed (`--pa-a-label` 4.5:1 on canvas/panels/slots; muted lifted
  on panels) · 3 shared request (lead `bloomgrid` Pixel bloom) · 4 fixed (cover card stops short of the gem).
- pirate-broadcast 1 fixed (deck channel keys share the cell width, inside the frame) · 2/3 shared request · 4
  fixed (black label, RGB split on the control's edges) · 5 fixed on the aesthetic side (donor art takes the
  right 46% of the page above 600px) · 6 CL1. Also: P100 ident held to 4.5:1 on black.
- old-web 1 resolved by CL1 (closing lockup removed) plus `.ab-brand` is black only inside the toolbar · 2 export
  re-checked after CL1 (silver bar, starfield, badges) · 3 shared request · 4 CL1 · 5 fixed (marquee min-height)
  · 6 fixed (yellow WordArt on white runs amber/orange/red-orange, no olive/brown) · 7 fixed (dotted focus
  rectangle) · 8 CL1 · 9 fixed (text runs sit on a canvas patch) · 10 fixed (address field shows
  `http://brand-guidelines/cover.htm` etc.) · 11 fixed (#0000EE / #551A8B, !important because the deck's
  bdLegibleHeadings measures against the black slide, not the silver window: gore was 1.67:1, now 0) · 12 fixed
  (WordArt face colour + extrusion on the typography specimens) · 13 CL1. Badge 3 flat secondary (8px text 4.5:1).
- cyber-hud 1 fixed on the aesthetic side (cover band / closing strip are a CSS HUD rail in the fixed signal
  colours) + shared request · 2 fixed (coverDisplay 0.5, copy 44px under the rail, subcopy 16px under the slab)
  · 3 fixed (stage reticle at 46%) · 4 not cyber-hud: liquid-glass.css:52 sets the scene headline #fff; with a
  donor's pale canvas it needs the blend scrim (CL1/liquid-glass) · 5 fixed (≤520px reticle at 40%) · 6 fixed
  (scan line below the baseline) · 7 fixed (light neon #006F78 = 5.0:1, ladder labels full strength).
- Code: tokens(t, state) in blob-tracking, cyber-hud, pixel-arcade, rebus (global only as fallback); abWeight in
  blob-tracking, cyber-hud (hudWeight removed), rebus (rbHeadWeight is now abWeight(face, 800) plus the heavy-face rule); pbEsc removed; static inline styles moved to CSS in
  pirate-broadcast (.pba-*) and cyber-hud (.chv-ret/.chv-slabs/.chv-ro); dead `.bta-tab.is-in` and old-web
  `.ab-av` removed; pirate-broadcast !important 14 -> 11 (the 4 positioning overrides of the old inline styles are gone; 2 new ones beat blend.css for the donor art box). Kept old-web's --ow-face/--ow-shade/--ow-dark (the brief hands the
  bevel tones to builders).

Checks: gore 4 configs x 6 keys = 0 issues; DOM contrast scan (11 variants x 6) leaves only sr-only swatch
labels, 4px SVG text in the test card and the clipped marquee; node tests/run.js all passed; t5/harness.js 0
fails; t5/src-verify-p5.js 0 fails; board A-D Chromium + WebKit 6/6 (overflow 0); PNG export of cover/closing
for all 6 non-blank and matching the slides.

## Fix log (qf3a)

Fixer qf3a (Opus), keys riso-print, xerox, xerox-punk, corporate-vandalism, acid-graphics, ascii-art. Files:
js/aesthetics/{key}.js, css/aesthetics/{key}.css. Evidence: scratchpad/adv/qf3a/ (audit logs final-*.log, deck
shots dk/, exports ex/, gore-q2-1.json); board sheets scratchpad/adv/sheet-qf3a-*.png (Chromium) and
sheet-qf3a-wk-*.png (WebKit).

riso-print
- 1 BLOCKER fixed: the copy column is 50cqw (was 64) and the drum-2 initial moved to x=298, so the headline wraps
  before the M; deck cover and board: ALIVE sits clear of the M in both modes.
- 2, 3, 5 fixed: new drum snap (rzSnap). Lab distance with hue and chroma weighted over lightness, never Light
  Gray/Black for a chromatic colour, and drums 1 and 2 must hold 3:1 on the stock (drum 1 also 4.5:1 for its CTA
  label), taking the nearest such ink within 45 degrees of hue. Warm: Scarlet + Teal; pastel: Bright Red + Blue;
  dark-saturated: Orchid/Purple + Grass/Green. Pale-drum fallback threshold 2.3 -> 3.0, plus a pale drum-2 guard.
  Audit: all 11 variants have 0 contrast findings (was 2.64 / 1.99 / 1.61 / 2.78 / 2.75 / 2.52).
- 4 fixed (pre-line + overflow-wrap). 6 fixed (Registered = drums aligned, drum 1 shows). 7 fixed (ink outline).
- Also: CTA uses a lighter mottle (Ko CTA 4.25 -> passes); subcopy rest colour from tokens (Po 4.49 -> passes).
- 8 -> shared request (fit.js). 9 -> CL1 (blend.js).
xerox
- 1 export: re-exported after CL1, Material art present (ex/xerox-material.png). Art font-family quoting fixed.
- 2 fixed (.xr-gen on paper with toner keyline). 3 fixed (dark: canvas chip = platen with ink keyline, ink chip =
  printed ink; ink chip shows "prints as <hex>" in both modes). 5 fixed ("copies as toner dots"). 6 fixed (footer
  influences 86% toner; no longer flagged). 7 fixed (:focus-visible 3px toner outline, verified).
- 4 -> shared request (toner colourway).
xerox-punk
- 1 fixed (3px #111 outline, verified computed). 2 fixed (cover headline margin-bottom 16px). 3 fixed (canvas
  scrap gets a keyline traced on its torn polygon, toner light / bone dark).
- 4, 5 -> shared requests. 6 -> CL1 (X3).
corporate-vandalism
- 1 fixed (stamp column 96px). 2 fixed (dark redacted bar has an ink keyline). 3 fixed (black OURS chip keyline in
  dark). 4 fixed (slide Kruger bar margin-top 0.34em, clears line 2). 5 fixed (cover art keeps full width:
  notice + receipt side by side, fit scale 1.0). 6 fixed (--cv-small, 70% ink: 0 findings). 7 -> CL1.
acid-graphics
- 1 fixed (ACID / CLASH on separate lines, pre-line). 2 fixed (acClash in OKLCH: hue +165 at max in-gamut chroma,
  lightness moved to equal luminance; rejects C < 0.10 or olive/brown and tries 150/180/135/195... at C >= 0.12;
  #7A00FF -> #087C2F green, warm stays teal #0E9BA1). 3 fixed (strip text opacity 1). 4 fixed (cover: headline
  flows two lines per row at 64px, flyer 330px; fit 0.856). 5 fixed (padding-bottom 14px). 6 fixed (flyer aligned
  to the top of the copy). 7 fixed (meta shortened). Also: light-mode subcopy on the acid field uses on-acid
  (4.28 / 2.90 / 3.67 -> pass), descriptor label ink (3.6 -> pass). E3 fixed seed. 8 -> CL1. 9 -> CL1.
ascii-art
- 1, 2 fixed (aaCga: OKLCH hue snap, never grey for chroma > 0.035; on paper all three from the dark set; accent chip
  shows the colour the highlight prints). Warm light: red primary, brown ALIVE = chip; green: #00AA00 family.
- 3, 4 fixed (cover and Material use the 40 x 20 panel: cover art 380px, Material art 535 x 532).
- 5 fixed (don't reworded). 6 fixed (readout from tokens: 0xE4572E). 7 fixed (mono card meta line filled).
- 8 -> shared request. E1 (aaEsc -> escapeHtml), C1 (.is-hover) done.
Code findings (qc5): M1 migration done in all six (tokens(t, view) with global fallback only when undefined;
acid brand name from view state); M4 private weight pickers replaced by abWeight; E3, C1 (xerox, ascii-art), C4
(xerox-punk .xpl:nth-child(3)), E4 private unread vars removed (--rz-on-ov, --xr-gen, --ac-fs, --ac-sy; the
--ab-stamp / --ab-receipt brief-facing names kept), A3 xerox states reads ctx.labels.names.
Checks: gore 6 keys x 4 configs = 0 issues; node tests/run.js all passed; t5 harness 0 fails; src-verify-p5 0
fails; WebKit sheets clean; PNG export 1+ slide per key non-blank; console 0 errors.
