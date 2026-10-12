# B6d build log — transit-wayfinding, gorpcore, old-web (round 6, packet rev 1)

Builder: Opus (b6d). Status: submitted. Spec: docs/research/round6.md sections 7, 8, 9.
Files written: js/aesthetics/{transit-wayfinding,gorpcore,old-web}.js, css/aesthetics/{transit-wayfinding,gorpcore,old-web}.css, this log.
Scratch: S/adv/b6d/ (deck sheets, gore output, pattern tests, reference captures), S/adv/sheet-b6d-<key>.png,
S/adv/sheet-b6d-wk-<key>.png (WebKit).

## Transit Wayfinding (43)
- Signature: everything that speaks is a sign — a #000 panel, white mixed-case type at the heading face's
  heaviest weight up to 800, a 1px white rule 6px inside the top edge, 4px corners — hung on a fixed concourse
  (#16181A dark, #E8E8E4 light, faint 48px tile grid). Header and footer are overhead sign bands.
- Colour = information: primary, secondary and accent are routes 1–3, used only as line strokes and route
  bullets. Each route colour is tinted until it holds 3:1 on black (abAccentInk) and, in light mode, shaded to
  3:1 on the white map paper; bullet text white when it holds 4.5:1, else black. Bullet letters are the first
  three distinct letters of the brand name (M / A / R) — never real line letter/colour pairs. Route 3 is the
  express with a diamond bullet. One fixed alert yellow #FFC72C, used only for "Diverted".
- Headline (def.headline): an arrow drawn on a 10-unit grid (1.6-unit shaft, 45° head) always before the
  words; the destination word gets a route-1 line under it. The hero copy is a full-width overhead sign with
  a route bullet + "Next stop · Platform 2" and a white platform module at the right.
- Hero art: the brand network — an INAT-style octilinear map (0/45/90° only, rounded 45° turns at 3× line
  width), line-colour station ticks, a white interchange disc named after the brand, terminus bullets, a dashed
  inactive-grey extension, river and park fills; above it a sign strip (bullets, "<Brand> network", arrow +
  "All lines"), below it a legend of six procedural pictograms on a 6×6 grid. A second SVG (<use> of the
  first) crops to the interchange for narrow boxes (390 px, deck material stage, small donor boxes).
- Components: platform-number tabs (selected = white square, black number), route-1 CTA with a CSS grid arrow
  (hover = 2px white keyline + arrow nudge, pressed = white panel), "Where to?" field with a pin pictogram and a
  2px white rule (focus = route colour), rail toggle (two station dots, the knob is a bullet), states
  Scheduled / Approaching / Diverted, departures board (bullet · destination · platform · status · line
  progress with the current station as a ring), palette routes as line + bullet + station ticks.
- Deck: cover lays the sign and a 4:3 network map side by side (coverDisplay 0.55, coverMin 50); principles,
  do/don't, interface cells and the product screen are sign panels.

## Gorpcore (44)
- Signature: a topographic map generated from a seeded height field (five bumps + a ridge + value noise) by
  marching squares: 24 contour levels, every fifth an index contour at double weight with a rotated elevation
  label knocking out the line (paint-order stroke), a dashed switchback trail in the shell colour with a
  stone halo, a summit triangle with elevation, one blaze-orange "you are here" dot, a lake, north tick,
  coordinates chip, scale bar. A paper hang tag (grommet, carbon header band with the brand, model + size box,
  mono spec table with units, colourway chips) hangs off a carabiner on a cord from a webbing loop.
- Colour: fixed stone #EDEBE6 (carbon #1A1C1B dark) with a ripstop grid (5px, every 5th line heavier, ~3%),
  carbon Unigrid title band with a reflective silver edge, blaze orange #FF5F1F only on the zip pull, the
  position dot and progress dots. Client colours are fabrics dyed 10% flatter: primary = shell, secondary =
  second panel + contour tint, accent = trail blazes (accent shaded to 3:1).
- Headline: condensed caps at the heaviest weight; the last word is a woven label (shell fabric with a dashed
  stitch inset). Kicker carries a blaze diamond + "SS26 · REF GC-044".
- Components: webbing-strap tabs with a silver buckle as the selected tab, shell CTA with a pull-tab loop and
  an orange zip pull, stencil field label (Saira Stencil, loaded from FONTS) with a mono unit note, a
  side-release buckle toggle, fabric swatches Ripstop / Taped / Reflective, gear cards with grommets and spec
  codes, trail log rows with blaze markers (circle / square / diamond), an elevation profile with an orange
  position dot, mono numbers with units.

## Old Web (45)
- Signature: a starfield page (multi-tile radial-gradient stars + 4-point twinkles; a pale paper tile in light
  mode) holding silver windows drawn with the four-tone bevel implemented in this aesthetic's own CSS
  (--ow-raised / --ow-sunken / --ow-window), navy-to-primary title bars with bevelled caption buttons (drawn
  as background layers on the board windows, real elements in the art), Times body, links #0000EE / visited
  #551A8B (light blues on the black page), a dotted focus rectangle inside buttons.
- Headline (def.headline): export-safe WordArt — each word is an inline-block with a base copy (8 stacked
  text-shadows = extrusion) and two clipped overlay copies (38% / 64% height) giving a three-band gradient
  face; the last word uses accent bands; whole headline slanted skewY(-3°). Bands are held to 3:1 on the page
  (yellows go amber on white). No background-clip:text, no masks.
- Hero art: "Welcome to <Brand>'s Homepage!" window — menu bar, a link column with drawn icons, an
  under-construction notice, a marquee band shown mid-scroll, a visitor counter (VT323 LED digits in the
  accent), a Comic Neue guestbook line (the one Comic element), a webring group box, What's New? list with
  NEW! badges, three 88×31 badges in Silkscreen, a status bar with the URL. Two drawn planets on the starfield.
- Components: browser toolbar header with a sunken address field + Go button, Win9x tabs, silver default
  button with the 1px black frame, Raised / Visited / Sunken states, sunken white field, classic checkbox,
  group boxes for the type block, a grid-lined projects table with link names (one visited) and segmented
  navy progress, grooved <hr> rules, footer webring + "last updated" line.

## Verification (actual results)
- Boards: S/adv/sheet-b6d-{transit-wayfinding,gorpcore,old-web}.png (A warm rec, B other mode, C green, D 390).
  Page overflow 0 in every shot. Console: only the favicon 404.
- Contrast audit (all text nodes outside SVG, warm + green × both modes, solid-background walk): 0 below
  4.5:1 (3:1 for large text).
- Decks: S/adv/b6d/sheet-deck-<key>-{rec,oth}.png. Gore (4 configs × 3 keys × 10 slides = 120 slides): 0 issues.
- WebKit: S/adv/sheet-b6d-wk-<key>.png — no WebKit-only breakage.
- Blend donor: each art rendered inside corporate-vandalism / aurora-noir / bauhaus-poster hero boxes
  (S/adv/b6d/blend-all.png) — self-contained, legible.
- node tests/run.js: all passed. scratchpad/t5/harness.js: briefs 192, fails 0. scratchpad/t5/src-verify-p5.js:
  families 53, fails 0, map mismatches 0.

## Shared changes requested (js/patterns/fit.js, not owned)
- gorpcore: lead `terrain` (brand) renders as orange/teal "lava" blobs on the cover band and closing strip.
  Replace the first two entries with
  `['sonar', 'Lake map', 'brand', { land: 0.5, size: 1, speckle: 0.3, contours: true }, 0.45],`
  `['terrain', 'Relief', 'mono', { levels: 8, pix: 0.3, dither: 0, style: 'hills' }, 0.5],`
  (rendered and compared in S/adv/b6d/ptest.png: sonar brand at 0.45 reads as a lake map with contour lines).
- old-web: lead `kaleidopix` reads as an Aztec tile and its family is shared with Pixel Arcade. Move
  `['marble', 'Marble GIF', 'brand', { bands: 5, warp: 1.6, cover: 0.9, stars: 0, outline: true }]` to the
  first position (S/adv/b6d/ptest-ow2.png: reads as the GeoCities marble background).
