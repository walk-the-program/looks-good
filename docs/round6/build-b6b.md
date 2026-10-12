# Build log — B6b (round 6, packet rev 1)

Keys: `naive-doodle` (38), `mid-century` (41), `art-nouveau` (42). Builder: Opus. Status: submitted.
Files written: `js/aesthetics/{naive-doodle,mid-century,art-nouveau}.js`, `css/aesthetics/{same}.css`, this log.
Scratch evidence: `S/adv/b6b/` (S = session scratchpad). Board sheets `S/adv/sheet-b6b-<key>.png`
(A rec warm · B other mode · C green · D 390px), WebKit `S/adv/sheet-b6bwk-<key>.png`, decks
`S/adv/b6b/sheet-deck-<key>-rec.png` / `-oth.png`, full slides `S/adv/b6b/dk/`.

## Naive Doodle
- Signature: every outline is a seeded wobble path (smooth two-sine noise along the arc length, loops that
  overshoot, square sides that run past corners) and every fill is a separate crayon shape offset a few px
  off its outline, hatched at 45°. `tokens(t)` builds the whole shape kit (card, button, segmented walls,
  underline, squiggle, wavy rule, toggle oval + fill, smiley/sleepy faces, loop ring, tick, cross, checkbox,
  star, bar, flag, loop arrows, sun, tab) as SVG data URIs with non-scaling strokes, seeded per brand.
- Headline hook: per-word tilt (±1.5°, display only); last word coloured in with an accent crayon scribble
  and a squiggle. Hero art: smiley sun bleeding off the edge, dash rays, clouds, hill coloured outside its
  line, loop flowers, a Caveat note with a loop arrow. Pure SVG.
- Colour: fixed paper #FFFBF2 + graph grid, warm-black pen (chalk on a warm slate in dark mode); crayons =
  client colours lifted until pencil text reads 4.6:1, so every label on a fill is legible.
- Components: wobble card with offset wash and a star breaking the edge, crooked-wall segmented row,
  Outlined / Coloured in / Circled button states, oval toggle with a face knob, underline field with a
  squiggle focus, hand checkboxes, circled status, hatch progress with a flag, one "this one!" annotation.

## Atomic Mid-Century
- Signature: flat cut-paper planes with no outlines (outline points resampled and nudged 0.5–1px),
  stacked on cream; atomic kit as punctuation (concave sparkles, atom, starburst seal, molecule,
  boomerang, kidney, Harper-style bird from circles/half-circle/triangles with one striped shape).
- Headline hook: tracked geometric caps; last word swapped for one Yellowtail script word in the
  primary on a cut-paper swoosh (Yellowtail loaded on demand).
- Colour: cream #F3EAD7 / charcoal fixed, one period ink (mustard or teal, farther from the primary);
  `printPrimary` warms the primary 6° toward yellow, −15% chroma; secondary/accent warmed in tokens.
- Components: skewed paper planes behind straight labels (CTA, segments, kicker), kidney panel behind the
  01 card, TV-dial toggle, cream field with charcoal bar + sparkle focus, Cut / Layered / Printed swatches,
  atom bullets, sparkle progress, starburst brand mark.

## Art Nouveau
- Signature: filled tapered whiplash strokes (cubic stem running into a tightening spiral, width
  1→4→1), round-arched panels, halo disc with a dot band and thin gold rings, cartouches with notched
  corners, Secession mosaic strip.
- Hero (split, art left): Mucha without a figure — arched litho panel with star field, halo, stylised
  poppy on a central stem, whiplash stems rising both sides with almond leaves and buds, mosaic strip,
  initial medallion. Pure SVG.
- Colour: cream / olive-brown contour / gold (rings only) fixed; client colours in the litho register
  (chroma −25%, L 55–70%, lifted until olive text reads 4.6:1); `printPrimary` prints the primary that way;
  stems and the highlight word are the hue deepened to 3.2:1 on the paper.
- Components: three-part cartouche CTA (SVG ends + gradient body), arched tabs, arched cards with inner
  hairline and stems up the sides, curl-cornered field, vine toggle with a leaf knob, Bare / Framed /
  Haloed swatches, dot-ring medallion numerals, whiplash row dividers, stem-and-leaf progress with a bud,
  roman section numerals, mosaic footer.

## Verification (actual)
- `board.sh` (Chromium) all 12 shots overflow=0; console: favicon 404 only. WebKit `board-wk.sh`: 12 shots,
  overflow=0, 0 errors, no WebKit-only breakage seen.
- Deck: rec + other mode for all 3 shot; gore 3 keys × 4 configs = 12 combos, **0 issues**.
- `node tests/run.js`: all passed. `t5/harness.js`: 0 failures for these keys (failures present belong to
  other in-flight keys: retro-futurist, wabi-sabi, dark-academia, pirate-broadcast). `src-verify-p5.js`:
  families 53, fails 0, map mismatches 0.
- References opened headless (`S/adv/b6b/refs/`): Charley Harper Art Studio, Mucha Foundation, Jean Jullien;
  Oatly loaded behind its cookie dialog (not dismissed).

## Self-score (HARSH-BRIEF rules)
- Naive Doodle 7: the line and offset-fill system carries the board; still short of Jullien/Oatly on line
  weight and lettering (Patrick Hand is a stock hand, not custom lettering), and the hatch reads digital.
- Atomic Mid-Century 6.5: cut planes, script word and kit are right; hero is a motif sampler rather than one
  Harper-grade image, and the vertex jitter is barely visible at board scale.
- Art Nouveau 6.5–7: frame/halo/whiplash/cartouche system is coherent; stems and poppy are simpler than a
  Mucha border, ornament density is moderate, Federant leans Gothic-sign.
- All three: the shared board skeleton and the framework "In product" slide still show; restyled only.

## Shared changes requested (js/patterns/fit.js; verify in the global pattern-ownership pass)
- naive-doodle: `['arcrise', 'Crayon sun', 'brand', { origin: 'bottom', bands: 4, suns: 1, bars: true, bar: 5 }]`
  → `['pebbles', 'Crayon pebbles', 'brand', {}]` (arcrise renders a rainbow = Groovy 70s / Neo-Brutal Pop lead).
- art-nouveau: `['arcrise', 'Halo', 'brand', { origin: 'bottom', bands: 6, suns: 1, bars: false }]`
  → `['rods', 'Tendril chains', 'brand', {}]` (same rainbow problem).
- mid-century: `['zigzag', 'Rickrack', 'brand', { style: 'rounded', colors: 'three', band: 5, amp: 3, period: 7, phase: 'parallel' }]`
  → `['cutup', 'Cut-paper hills', 'brand', {}]` (zigzag is in 13 suites).
- Sidebar motifs for css/aesthetic-board.css: in the B6b return.
