# B6a build log — frutiger-aero, gummy, big-top (round 6, packet rev 1)

Builder: Opus (b6a). Status: submitted. Spec: docs/research/round6.md sections 1, 10, 11.
Files written: js/aesthetics/{frutiger-aero,gummy,big-top}.js, css/aesthetics/{frutiger-aero,gummy,big-top}.css, this log.
Scratch: S/adv/b6a/ (deck, gore and reference captures), S/adv/sheet-b6a-<key>.png, S/adv/b6awk-*.png (WebKit).

## Frutiger Aero (37)
- Signature: the board is an Aero window. The header is a glass title bar (hard 115deg streak, min/max glass
  caption buttons, red close gel). The hero is a sky/hill/water scene (def.art: sky gradient, cumulus from
  circles, three aurora ribbons in the secondary, one lens-flare string, bokeh, rising bubbles, two hills,
  water with ripples) and the light humanist headline sits on the horizon with a wet-floor reflection
  (def.headline: five flipped slices with stepped opacity and a hair of sideways drift — ripples, no mask).
  A primary gel orb with the brand initial floats on the horizon, mirrored in the water (SVG mask inside the
  SVG, export-safe), plus a 12-point "new" seal in the accent gel.
- Gel recipe on every control (CTA, active segment, orbs, numbers, progress, mark): vertical gradient, white
  specular cap with a crisp lip, base caustic, 1px rim, coloured drop shadow. printPrimary lifts the brand
  primary to candy chroma and shades it only as far as a white label needs 4.5:1; otherwise a dark-label gel.
- Fixed: cool white canvas #F2F7FB (night #071A2B), blue-grey text #23415A (night #EAF5FF), the sky, the red
  close gel. Secondary = hill when it is a landscape green, else the aurora only (hill keeps grass #6CC24A).
- Dark mode = Aero night: black glass chrome, stars, glowing aurora, dark hills.
- Palette = gel orbs; type block / 02 / list = glass windows with title bands; 03 is an Explorer details list
  with a Vista selection row and glossy progress capsules with sheen stripes; footer = glass taskbar + start orb.
- Deck: cover is the full-bleed sky with the headline on the horizon and a glass taskbar for the meta row;
  the pattern band is hidden on the cover; the closing strip is painted as sky/hill/water (CSS gradients).

## Gummy (47)
- Signature: a candy spill (def.art) — sugared gumdrop, a pink cube overlapping it with multiply, a ridged
  ring, a two-tone ridged worm, a bean, a second gumdrop, drops — each with a radial body whose transmitted
  light pools bottom-right, a Fresnel rim, 2–3 specular dots, and a shadow in its own colour (blurred) with a
  bright caustic inside it. Headline (def.headline): fat lowercase plum with the last word as a jelly word
  (candy colour shaded to 3:1, white top-left edge light, coloured soft shadow, two dots, squashed onto the
  baseline). Scalloped OLLY-style seal for the kicker (SVG data URI from tokens).
- Flavours: primary/secondary/accent pushed to candy; two more by rotating the primary hue (the first rotation
  flips direction when it would land on the accent's hue). Labels white only at ≥4.5:1, else plum.
- Distinct from Clay: the type cards, 02 panel and list are candy MOULDS (tinted, inset), only the 01 card is
  raised and it has a gumdrop perched on its edge spilling coloured light onto the card. No grey shadows.
- States Set / Wobble (1.03 + tilt, dots shift) / Squish (scaleY .86 scaleX 1.08 from the base). Toggle =
  translucent tube with a gumdrop knob that changes flavour. Progress = ridged gummy worms in three flavours.
- Deck: cover = headline + seal over a full-bleed candy spill; closing strip and cover band painted as jelly drops.

## Big Top (46)
- Signature: a striped scalloped valance (two-colour scallops with navy keyline rings) across the top of the
  board and every slide. Showbill headline (def.headline): first line on an ARC (letters placed and rotated on a
  circle; advances measured with canvas measureText in the brand heading face; arc font-size capped by
  container width so it never overflows), navy drop shade; middle line straight between stars; last word in a
  swallowtail ribbon (border-triangle tails, export-safe).
- Art: the big top (radial striped roof clipped to a curved cone, scalloped valance, striped walls, bulb-lit
  door with warm glow, king-pole flag), two side tents, bunting on sagging lines, accent stars, faint sunburst,
  navy keylines throughout. No clowns, animals or balloons.
- Fixed cream #F6ECD6 / navy #1F2A44 / bulb #FFF4D6; night show navy #151C30. Primary shaded to 3:1 for stripes
  and 4.5:1 for the ticket (cream type); secondary shaded to 3.2:1 for the ribbon (large type).
- Components: ticket CTA (notches via radial gradients, ADMIT ONE, perforation, No. 0472 stub that drops when
  pressed), tent-flap tabs with scalloped hems, star toggle knob on candy-striped track, bulb-row input focus,
  Plain / Striped / Spotlit (bulb ring) discs, programme of acts with dotted leaders and bulb progress,
  palette as a scalloped valance, poster cards with double keylines, bunting footer.
- Deck: cover = showbill left, tent right; cover band = valance over tent stripes; closing strip = tent stripes.

## Verification (actual results)
- Boards: `KEYS=… S=b6a-b TAG=b6a ./board.sh` → S/adv/sheet-b6a-{frutiger-aero,gummy,big-top}.png (A/B/C/D).
  overflow=0 in all 12 shots; only console error is the app's favicon 404.
- Deck: S/adv/b6a/sheet-deck-<key>.png and sheet-deck-<key>-other.png; full slides in S/adv/b6a/dk/.
- Gore: `./gore.sh "frutiger-aero,gummy,big-top"` → 12 configs, 120 slides, 0 issues (S/adv/b6a/gore3.json).
  (First run flagged the new product frame's narrow list; fixed with a phone row layout under .ab-deck-prodgrid.)
- WebKit: board-wk.sh → S/adv/sheet-b6awk-<key>.png, no WebKit-only breakage, 0 console errors.
- `node tests/run.js` all passed; `node S/t5/harness.js` 0 fails for these keys (the 12 reported fails are
  wabi-sabi / dark-academia / curio-cabinet placeholders, other builders); `node S/t5/src-verify-p5.js` 0 fails.
- Contrast (tokens, warm+green × light+dark): body/UI text ≥4.5 everywhere (ink 9.9–16, muted 5.4–11, gel and
  jelly labels ≥4.52, ticket 4.68, act numbers ≥4.68); large display colours (jelly word, ribbon, highlight) ≥3.1.
- References viewed headless (S/adv/b6a/refs/): frutigeraeroarchive.org, cari.institute Frutiger Aero entry;
  olly.com and dreamland.co.uk were behind consent/promo overlays (not dismissed).

## Shared changes requested (js/patterns/fit.js — not mine)
Both suites carry an `oprings` entry that breaks the CAO-4 op-art rule (warp ≤ 0.18, freq ≥ 16, two bands,
only three keys keep it), and the leads are weak in the deck.
- frutiger-aero: lead with the sky, drop the op rings, quiet the cells.
  old: `['colony', 'Bubbles', …], ['aura', 'Sky glow', …], ['blades', …], ['terrain', …], ['flow', …], ['oprings', 'Lens rings', …, 0.6]`
  new: `['aura', 'Sky glow', 'brand', { layout: 'horizon', blobs: 5, soft: 1, mode: 'glow', strength: 0.8 }],
        ['flow', 'Aurora swoosh', 'duotone', { field: 'swirl', strands: 3, gap: 3, bend: 1.6, weight: 2 }],
        ['blades', 'Meadow', 'brand', { count: 420, size: 0.9, curve: 0.5, take: 0.7, ink: 'ink2' }],
        ['colony', 'Bubbles', 'brand', { cells: 20, rings: 2, fuse: 0.8, finish: 'film', nuclei: false }, 0.55],
        ['terrain', 'Rolling hills', 'brand', { levels: 4, pix: 0.3, dither: 0, style: 'hills' }, 0.7],
        ['burst', 'Sunrise', 'brand', { rays: 32, layers: 1, bend: 0.4, beads: 0, origin: 'low' }, 0.5]`
- gummy: lead with the jelly cells, drop the op rings.
  old: `['tokens', 'Gummy drops', …], ['colony', 'Jelly cells', …], ['zigzag', …], ['warpcheck', …], ['oprings', 'Jelly lens', …], ['halftone', …]`
  new: `['colony', 'Jelly cells', 'brand', { cells: 22, rings: 3, fuse: 1.4, finish: 'film', nuclei: true }],
        ['zigzag', 'Gummy worms', 'brand', { style: 'rounded', colors: 'four', band: 8, amp: 5, period: 10, phase: 'interlock' }],
        ['tokens', 'Gummy drops', 'brand', { cell: 7, link: 0, density: 0.6, fill: 'tint' }],
        ['warpcheck', 'Wobble check', 'brand', { pattern: 'check', warp: 'bulge', cells: 10, amp: 0.5, waves: 1, second: true }, 0.6],
        ['counterchange', 'Jelly rings', 'brand', { figure: 'circle', bar: 2, dir: 'v', size: 0.9, nest: 2, second: true }, 0.7],
        ['halftone', 'Sugar dust', 'mono', { cell: 0.9, levels: 3, shape: 'round', field: 'clouds', duo: false }, 0.6]`
  (counterchange is then in two suites: big-top and gummy.)
- Sidebar tile motifs for css/aesthetic-board.css: in the B6a return message.

## Framework notes (no change made)
- The product (08) and do/don't (09) slides changed during the build (new .ab-deck-prodframe / prodgrid and the
  big Do / Don't heads); all three keys were re-verified against the new markup.
- The palette shows the client ink hex while Aero, Gummy and Big Top print fixed text colours (#23415A, #2A1B3D,
  #1F2A44); the roles say so. A def-level ink hook would remove that mismatch on the palette and the Color slide.

## Self-score (harsh brief) and what is still short
- Big Top 7.5 — stands next to FunHaus showbill work; short: the product frame is still the shared SaaS skeleton,
  the tent could carry lithograph halftone texture.
- Frutiger Aero 7 — reads as Vista/Aqua on sight (title bar, gel, wet floor, Bliss-type sky); short: the deck's
  pattern suite (fit.js) is not Aero until the shared change lands; no macro-grass texture.
- Gummy 6.5–7 — jelly materials, coloured shadows and squash are right and it no longer reads as Clay; short:
  the spill is a centred row rather than a tumbling pile with depth, and the jelly word cannot carry an internal
  transmitted-light gradient without background-clip:text (not export-safe).

## Adoption log (b6a)
Packet rev 3 (ADOPT-BRIEF). Same files only. The SH suite changes for frutiger-aero and gummy were already on disk in
js/patterns/fit.js when the re-shoots ran.

All three keys
- Weights (scratchpad/adv/fw/weights.txt): every 300/600/700 request now resolves to a weight the face really has.
  Each def computes the nearest real weight in `tokens()` from the brand faces (`--fa-lw/--fa-bw/--fa-hbw`,
  `--gm-hw/--gm-bw`, `--bt-hw/--bt-bw`) and the CSS uses those vars. The framework parts that asked for missing
  weights (`b`, `.ab-deck-ptitle`, `-pchip`, `-pname`, `-ddhead`, `.ab-type-cur b`, the marks) are pinned too.
  Re-check with a per-element variant of weights.js (S/adv/b6a/wcheck.js): 0 mismatches, both modes, all 3 keys.
  Big Top's two italic requests (Karla has no italic) became letter-spaced caps.
- Removed CSS for markup that no longer exists: the old `.ab-deck-prodframe > .ab-head` rules (Aero, Big Top) and
  `.ab-deck-prodframe::before`. The live `.ab-deck-prodgrid` phone-row rules stay for Aero and Gummy (default
  product), and were deleted from Big Top (which now has its own product).
- `def.deck.marks` on all three: gel orb ✓ / glass orb ✕ (Aero), jelly drop ✓ / sugar mould ✕ (Gummy), ★ / ✕ in
  the wood-type face with `--dk-mark-do` = the stripe text colour (Big Top).
- `def.deck.materialArt` on all three, so the Material slide no longer repeats the cover art: a gel dissected
  (pill, cap, caustic, wet floor and an orb, with callouts), a gumdrop dissected (dots, Fresnel rim, transmitted
  light, coloured shadow, and Set vs Squish pills), and the Big Top marquee sign (bulb border, valance, brand name
  in wood type with drop shade, ribbon, ticket).
- Structure hooks (`layout.order` / palette kinds / hero kinds): not adopted. Each board already has its own
  skeleton signals (window chrome / candy moulds / showbill), and changing them would only be churn.

Frutiger Aero
- `def.deck.coverBand: false` replaces the `.ab.ab … > .ab-deck-pattern { display: none }` hack and the padding
  override. The remaining `.ab.ab` cover rules exist only to outrank the base cover-hero rule (0,7,0). The
  `!important`s on the cover art stay because `bdFitCover` writes inline sizes.
- `def.panels`: the window chrome is real markup now. `.fa-window > .fa-titlebar` holds the title text and caption
  buttons on the 01 card ("Project — Untitled") and the 02 panel ("Settings"). `.fa-explorer` holds a real header
  row (Name / Status / Progress) and the list. This replaced three CSS generated-content labels (about 20 lines).
- Comments corrected: no backdrop-filter is used anywhere.

Gummy
- `def.deck.coverBand: false` replaces the hiding hack. The cover now clips its spill to the slide body instead of
  hanging it 30px below; that hang had made `bdFitCover` shrink the headline to the 64px floor. The headline is back
  to 87px with fit 1. The aesthetic name is dropped from the cover meta row (it is in the footer) because it sat on
  the ring.

Big Top
- `def.deck.product(ctx)` replaces the shared product frame with a box office: a showbill poster for the brand
  (valance, arched tagline via the same `btBill()` the headline hook uses, ribbon, programme line, foot) beside a
  bulb-lit "Box office" sign, tonight's programme (the board's own list in a one-line row layout) and two tickets.
  The poster bill is `role="img"` with the text as `aria-label` and the drawn letters `aria-hidden`, like the
  framework's headline hook.
- The `.ab-row-n { font-size: 0 !important }` became a plain `font-size: 0` (the deck no longer lifts 0px text).

Verification (actual)
- Boards (A–D, Chromium): 12/12 overflow=0. The only console error is the app's favicon 404. WebKit: 12/12 overflow=0,
  0 errors.
- Gore (4 configs × 3 keys): 120 slides, 0 issues (S/adv/b6a/gore8.json). The first pass found the box-office arc
  letters and programme names; both were fixed.
- `node tests/run.js` all passed. `node S/t5/harness.js`: briefs 192, fails 0, warns 0. `node S/t5/src-verify-p5.js`:
  families 53, fails 0, map mismatches 0.
- Sheets: S/adv/sheet-b6a-<key>.png, S/adv/sheet-b6awk-<key>.png, S/adv/b6a/sheet-deck-<key>.png and
  `-<key>-other.png`, slides in S/adv/b6a/dk/.
