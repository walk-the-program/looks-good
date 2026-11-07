# Move library (merged from the 9 audit parts)

Source: `docs/move-audit/parts/A.json` to `I.json` (45 styles, 511 raw move records under 389 ids). Machine copy: `move-library.json`. Written by task M1.

## Headline numbers

- **389 raw ids collapse to 198 merged moves** (190 a studio could pick, plus 8 `framework` helpers the engine builds in). Every raw id maps to exactly one merged move through its `aliases` list.
- Of the 190 pickable moves: **79 are used by 1 style, 60 by 2 to 4 styles, 51 by 5 or more.**
- Tier split of the pickable moves: **token 16, recipe 108, generator 45, bespoke 21** (framework helpers add 4 generator and 4 recipe).
- The 217 remainder items (what moves did not carry) re-judged by the same tiers: **85 generator, 47 recipe, 85 bespoke.** Most colour solvers and headline hooks are generators, not bespoke; what stays bespoke is hand-placed art, deck slides and panel markup.
- Bespoke moves: 21. The library is therefore mostly generalisable, but the single-style art (scenes, posters) is a large share of the *distinctiveness* of many styles; see the per-style table.
- Reading the tiers: `token` = pure variables; `recipe` = parameterised CSS the engine emits; `generator` = code written once in the framework and reused by params (colour solvers, wobble paths, headline hooks, procedural art); `bespoke` = only makes sense for one style.
- Counting rule: a move's tier is the highest tier any of its merged variants needs, unless noted. `appSafe` is true if any variant is app-safe; `exportSafe` and `paletteAgnostic` are true only if every variant is.

### Model decisions applied

- Same idea with different settings is one move; each style's settings are in `usedBy[].variant` (JSON) and in the rebuild kits below.
- The single CTA is split into two moves: `single-primary-action` (the rule: exactly one filled primary per view, plus the button dress params) and the `glossy` material (the finish layer the primary button can be given). The seed `glossy-single-action` is an alias of `glossy`.
- Kit styling is materials + a component map. The enum-family kit moves from the audits (button-style, input-field-style, switch-style, progress-bar-form, card-surface, kit-per-component-dress and similar, 32 raw ids) are the component map itself and live in `kit-component-map`; each style's values are in `styles[].componentMap`. Concrete ideas found inside the kit became materials (`field-form`, `segment-form`, `recessed`, `glossy`, `outline-frame`) or `state-behaviour` moves (`press-sink`, `press-squish`, `press-invert`, `ink-filled-selected`, `selected-bar`, `selected-tint`, `selected-capsule`, `selected-hatch`, `focus-ring`, `disabled-state`, `state-signature`).
- Three framework moves have no raw alias because the workers named them as schema gaps rather than as moves: `fw-mode-variants` (per-mode values), `fw-seeded-random` (seeded PRNG and name hash), `fw-headline-hooks` (hook slots for headline, panel, deck and art markup).

## Per style

Worker estimate = the auditor's guess at how much of the look the listed moves carry. Bespoke share = (bespoke moves + bespoke remainder items) / (all merged moves + remainder items). Gen/recipe/bespoke columns count the style's merged moves by tier; Rem = remainder items (generator / recipe / bespoke).

| Style | Worker est. % | Moves | token | recipe | generator | bespoke | Remainder gen/rec/besp | Bespoke share % |
|---|---:|---:|---:|---:|---:|---:|---|---:|
| acid-graphics | 55 | 35 | 5 | 20 | 9 | 1 | 2/1/2 | 8 |
| ascii-art | 40 | 24 | 2 | 17 | 5 | 0 | 4/1/1 | 3 |
| aurora-noir | 70 | 25 | 4 | 18 | 2 | 1 | 3/0/2 | 10 |
| bauhaus-poster | 80 | 20 | 2 | 17 | 1 | 0 | 0/1/2 | 9 |
| bento-grid | 75 | 20 | 4 | 14 | 1 | 1 | 0/1/3 | 17 |
| blob-tracking | 40 | 20 | 4 | 14 | 2 | 0 | 0/0/5 | 20 |
| blueprint | 45 | 20 | 4 | 14 | 2 | 0 | 3/1/1 | 4 |
| clay | 70 | 15 | 4 | 10 | 1 | 0 | 0/1/2 | 11 |
| corporate-vandalism | 50 | 22 | 4 | 15 | 3 | 0 | 2/0/3 | 11 |
| cyber-hud | 65 | 22 | 6 | 13 | 3 | 0 | 2/1/1 | 4 |
| data-pebble | 75 | 27 | 5 | 19 | 3 | 0 | 3/1/1 | 3 |
| dystopian-luxury | 70 | 27 | 5 | 21 | 1 | 0 | 2/3/0 | 0 |
| editorial-serif | 85 | 35 | 4 | 30 | 1 | 0 | 1/3/1 | 2 |
| frutiger-aero | 60 | 29 | 5 | 19 | 4 | 1 | 3/0/3 | 11 |
| gorpcore | 62 | 30 | 4 | 24 | 2 | 0 | 2/1/2 | 6 |
| holo-iridescent | 70 | 28 | 4 | 21 | 3 | 0 | 1/3/0 | 0 |
| industrial-device | 65 | 25 | 4 | 16 | 3 | 2 | 1/0/3 | 17 |
| isogrid | 80 | 22 | 4 | 14 | 4 | 0 | 3/0/0 | 0 |
| japanese-minimal | 80 | 22 | 4 | 16 | 2 | 0 | 2/1/2 | 7 |
| liquid-glass | 72 | 23 | 2 | 17 | 3 | 1 | 2/2/1 | 7 |
| live-tile | 72 | 16 | 3 | 10 | 3 | 0 | 1/2/1 | 5 |
| mainframe | 70 | 20 | 4 | 13 | 3 | 0 | 4/0/2 | 8 |
| mesh-gradient | 60 | 14 | 3 | 9 | 2 | 0 | 1/1/3 | 16 |
| micrographics | 55 | 20 | 3 | 12 | 5 | 0 | 2/2/1 | 4 |
| mid-century | 60 | 18 | 5 | 8 | 4 | 1 | 2/1/2 | 13 |
| mixed-type | 55 | 21 | 2 | 15 | 4 | 0 | 3/1/1 | 4 |
| naive-doodle | 55 | 19 | 2 | 11 | 5 | 1 | 2/0/2 | 13 |
| neo-brutal-pop | 80 | 22 | 2 | 16 | 3 | 1 | 1/1/2 | 12 |
| old-web | 60 | 18 | 3 | 12 | 3 | 0 | 2/1/2 | 9 |
| paddock-pass | 70 | 25 | 2 | 16 | 7 | 0 | 4/0/1 | 3 |
| patchbay | 70 | 23 | 4 | 16 | 3 | 0 | 3/1/1 | 4 |
| pirate-broadcast | 50 | 29 | 4 | 22 | 3 | 0 | 0/0/6 | 17 |
| pixel-arcade | 68 | 27 | 4 | 21 | 1 | 1 | 2/0/3 | 12 |
| radical-memphis | 62 | 24 | 5 | 13 | 5 | 1 | 2/0/3 | 14 |
| raw-brutalist | 85 | 24 | 4 | 18 | 2 | 0 | 1/2/1 | 4 |
| retro-futurist | 68 | 18 | 2 | 13 | 1 | 2 | 0/3/3 | 21 |
| riso-print | 78 | 20 | 3 | 15 | 2 | 0 | 2/3/1 | 4 |
| soft-form | 85 | 20 | 3 | 14 | 2 | 1 | 2/4/1 | 7 |
| tab-stack | 72 | 22 | 2 | 17 | 2 | 1 | 2/0/3 | 15 |
| tonal-shape | 76 | 16 | 3 | 10 | 2 | 1 | 2/2/2 | 14 |
| toy-press | 62 | 15 | 3 | 9 | 2 | 1 | 1/0/3 | 21 |
| transit-wayfinding | 55 | 17 | 3 | 10 | 3 | 1 | 3/1/1 | 9 |
| wpa-screenprint | 62 | 19 | 3 | 12 | 3 | 1 | 2/1/1 | 9 |
| xerox | 48 | 24 | 1 | 17 | 4 | 2 | 3/0/1 | 11 |
| xerox-punk | 40 | 28 | 2 | 18 | 6 | 2 | 2/0/3 | 15 |

Mean worker estimate: 65%. Mean bespoke share: 9%.

## The library by category

Columns: id, what it does, tier, number of styles using it. Aliases and per-style values are in the JSON.

### framework (8)

| id | what | tier | styles |
|---|---|---|---:|
| `fw-contrast-fit` | One shared solver: walk a colour (mix toward ink, lightness step, alpha step, hue turn) by the smallest move until it holds a target ratio… | generator | 36 |
| `fw-real-weight-snap` | A target font weight (300, 600, 700, heaviest) is snapped to the nearest weight the chosen face actually ships, because synthetic bold is d… | generator | 8 |
| `fw-a11y-media-fallbacks` | Reduced-motion, reduced-transparency and more-contrast overrides that remove transforms, blur and translucency while keeping the look recog… | recipe | 6 |
| `fw-state-colour-derivation` | Hover and pressed fills are computed from the primary by mixing toward black, white or ink by a fixed amount. | recipe | 3 |
| `fw-export-safe-fallback` | Where html2canvas cannot draw a material (3D transform, conic gradient, backdrop filter, displacement filter, mask) the framework substitut… | recipe | 2 |
| `fw-headline-hooks` | Registry hook slots the engine exposes so moves can emit markup: per-word and per-letter headline wrapping, panel (list/card) rewrites, dec… | generator | all |
| `fw-mode-variants` | Every move can carry separate values (or a structural variant) for light and dark: tuned literals, ink-to-chalk swaps, a plate that stays d… | recipe | all |
| `fw-seeded-random` | Deterministic PRNG and name-hash (FNV-1a / mulberry-style) so generators render identically for the same brand name. Derived from worker sc… | generator | all |

### colour (21)

| id | what | tier | styles |
|---|---|---|---:|
| `tinted-neutral-canvas` | The framework canvas is replaced by a near-neutral the style controls: a lightness cap, a mix toward ink, or a pure value. | token | 35 |
| `mono-plus-accent` | The page is neutral and the accent appears only in a tiny capped form (6px square, one dot, one stamp, one flag), or only in named marks. | recipe | 15 |
| `fixed-palette` | A small set of style-owned colours that never follow the client palette: pigments, signal/hazard inks, hardware colours, a decorative spect… | token | 13 |
| `tonal-ramp` | Derives lighter / base / darker (or mix-toward-black/white/canvas) steps of one colour with matching on-colours; includes the relief light/… | token | 13 |
| `primary-reprint` | The client primary is re-printed at a style-chosen saturation and lightness rule: pushed to full chroma by hue band, neon, pastel-clamped,… | generator | 8 |
| `single-primary-action` | Exactly one filled primary object (the main button) per view; everything else stays ink / outlined. The button dress (radius, label case, f… | recipe | 8 |
| `alpha-ramp` | One colour (ink or a role) published as a ladder of alphas (full, soft, hair, fill, glow) used for lines, fills and selected chips. | token | 6 |
| `fixed-canvas` | The page ground ignores the client canvas and is a fixed neutral or signature value per mode. | token | 6 |
| `positional-colour-cycle` | Rows, cards, stat blocks and kit cells cycle fills through primary / secondary / accent (or a derived set) by position, re-pointing ink and… | recipe | 6 |
| `duotone-ink` | A dark base with a small percentage of the secondary mixed in, and one light ink for all marks, so a plate reads as two-tone. | recipe | 4 |
| `fixed-ink` | Text and rules use a style-fixed near-black (or near-white at night) instead of the client ink. | token | 3 |
| `role-tint-fill` | A role colour mixed at low strength into a surface to give a tinted tile, row or chip. | token | 3 |
| `snap-to-fixed-palette` | Client colours snap to the nearest entry of a small fixed palette (hue-aware, lightness picked), with grey falling back to a default. | generator | 3 |
| `companion-hues` | Extra hues are rotated from the primary (triad, complement) or picked from the brand hues with a minimum spacing, to supply secondary colou… | generator | 2 |
| `overprint-multiply` | A second ink drawn with mix-blend-mode multiply (screen in dark), shifted a few px, so overlaps print a third colour; SVG variant paints th… | generator | 2 |
| `board-app-colour-split` | The board prints a snapped/shifted colour but app screens and the kit use the true brand primary with a derived label colour. | recipe | 1 |
| `equal-luminance-clash` | A second colour is derived from the primary: either a fixed fluorescent partner by hue family or the hue ~165 degrees round at the most chr… | generator | 1 |
| `gradient-action-carry` | The brand gradient (primary to a turned second hue) is reused on the main button, avatars, progress bars, chart fills and selected nav. | recipe | 1 |
| `offset-sheet-colour` | The colour behind an offset shape is the other brand hue mixed into the canvas (secondary behind primary shapes, primary elsewhere). | token | 1 |
| `primary-collision-guard` | Tests whether the client primary sits within N degrees of a fixed signal colour and, if so, swaps the shell to ink with an underline in the… | generator | 1 |
| `warm-period-shift` | Client secondary and accent colours are nudged a few degrees toward a period hue and slightly desaturated. | token | 1 |

### material (37)

| id | what | tier | styles |
|---|---|---|---:|
| `corner-radius` | One or two radii, applied by role (container, control, pill) or a strict square-or-round rule. | token | 45 |
| `outline-frame` | A solid, double or dashed line frame in ink or a role colour on controls and containers, from 1px hairline panels to 3px heavy borders. | recipe | 39 |
| `hard-offset-shadow` | A zero-blur shadow offset 1-6px in a second or darker colour under raised things (including a 1-2px darker underside lip with top highlight… | recipe | 10 |
| `field-form` | Text field drawn as an underline-only rule, outlined box, or ink side walls with corner ticks and a mono value. | recipe | 8 |
| `grain-overlay` | A fixed fractal-noise data-URI tile over the whole board at low opacity, tuned per mode. | recipe | 8 |
| `recessed` | Surfaces inside a tile sit one tone step deeper with no outline, or seat in an inset well (fields, tracks, pads in sockets). | recipe | 7 |
| `fixed-surface` | A card or panel keeps its own ground and ink regardless of light/dark mode (paper, black screen, black sign, cream scrap). | recipe | 6 |
| `glossy` | A lit gel/gloss finish: gradient ramp plus white cap, specular or radial highlight, rim, and a primary-tinted shadow; the finish layer on t… | recipe | 6 |
| `flat-surface` | box-shadow and text-shadow cleared everywhere; optionally cards also lose fill, border and radius and are separated only by whitespace. | recipe | 5 |
| `raised-relief` | Surface relief from three layers: a soft drop shadow tinted with the object colour, an inner dark underside and an inner light top. | recipe | 5 |
| `edge-light` | A 1px lit top edge, or two inset 1px shadows (bright top-left, darker bottom-right), giving a bevelled glassy rim. | recipe | 4 |
| `elevation-shadow` | Elevation as a stack of low, wide, low-alpha neutral or tinted drop shadows, not outlines. | recipe | 4 |
| `halftone-dots` | A fine dot screen multiplied over a plate and masked to fade (strongest at the foot); an offset sparser duplicate gives misregistration. | recipe | 4 |
| `title-bar-strip` | Cards, panels and dialogs carry a filled strip (OS window title bar, caption buttons, labelled strip) on top. | recipe | 4 |
| `clear-glass` | See-through surface: white at low alpha over the content behind, small backdrop blur with saturate/brightness lift; frosted and floating-ca… | recipe | 3 |
| `clip-corner-cut` | Corners cut at 45deg or shaped by clip-path (chamfers, notches, slanted tabs); a clipped neon layer behind forms the edge. | recipe | 3 |
| `lit-sphere-solid` | CSS-built sphere, torus, capsule, planet with specular, shaded edge and a contact shadow. | recipe | 3 |
| `segment-form` | Segment or tab anatomy as overlapped folder tabs, connected rounded group, or large light pivot headings. | recipe | 3 |
| `text-legend-controls` | Controls carry text as their face: [x] / (*) boxes, < a / b > segments, an ON AIR or ON / OFF switch legend. | recipe | 3 |
| `callout-tones` | Info/success/warning/error callouts distinguished by shape (bar, dashed, hazard stripe, reversed or censored) rather than colour. | recipe | 2 |
| `copier-degrade-filter` | SVG filter chain that degrades a shape like a copier: turbulence displacement, noise punched holes, alpha threshold, generational fattening. | generator | 2 |
| `refraction-lens` | A lens shape that redraws the scene scaled and counter-rotated, or through an SVG displacement filter, to fake refraction. | generator | 2 |
| `switch-form` | A square two-cell toggle printed OFF / ON with the knob as a filled half. | recipe | 2 |
| `ticket-cutout` | Tickets: dotted perforated edge with semicircle notches, skewed segments, stub and body. | generator | 2 |
| `blob-radius` | Small marks (swatches, avatars, icons, FAB, badges) take one of a few irregular elliptical border-radius silhouettes instead of circles or… | token | 1 |
| `dotted-colour-band-card` | Cards, panels and lists have a 14px colour band with a dot pattern across the top and a thick outline with one cut corner. | recipe | 1 |
| `four-tone-bevel` | Raised, sunken and window edges drawn as four inset 1px shadows (white/light and grey/black, swapped for sunken) on a silver face. | token | 1 |
| `glow-edge` | A small drop-shadow glow on the unclipped parent of an edged panel, plus a soft text-shadow on readout values. | recipe | 1 |
| `hardware-key-grid` | A grid of square keys in two families (light key, graphite key) plus one primary key, with a legend inside each cap. | recipe | 1 |
| `offset-fill-under-outline` | A coloured fill sits a few pixels off its outline (down-right), like crayon coloured in slightly outside the line; hover snaps it inside. | recipe | 1 |
| `reflective-strip` | A diagonal silver band (115deg) with a bright core runs across a surface like reflective tape. | recipe | 1 |
| `shape-masked-data-mark` | A progress bar or sparkline is a plain coloured box clipped by a data-URI SVG mask of repeated shapes. | recipe | 1 |
| `spectral-edge` | A gradient border (padding-box fill over a conic or linear border-box) used on exactly one featured surface, the focused field and the prim… | recipe | 1 |
| `stack-peek-edge` | Depth as two colour cards peeking beneath the bottom of a panel via zero-blur negative-spread shadows. | recipe | 1 |
| `stacked-surface-layers` | Every component sits one tonal layer above what it is on (canvas, then card, then field) so depth comes from the stack, not from shadows. | recipe | 1 |
| `stepped-pixel-border` | A 4-shadow stack on a pixel step that notches the corners; inner highlight/shade bevel. | recipe | 1 |
| `wobble-line-outline` | Outlines drawn as seeded hand-wobbled SVG paths (amplitude, step, seed, overshoot) that any component can use as its edge. | generator | 1 |

### state-behaviour (11)

| id | what | tier | styles |
|---|---|---|---:|
| `state-signature` | Hover and pressed each have a deliberate named signature: lift, scale, brightness, skew, nudge, ink flood, glow. | recipe | 45 |
| `ink-filled-selected` | The selected item (segment, tab, menu row) or the main action is a solid fill of ink or another colour with its on-colour label. | recipe | 26 |
| `focus-ring` | Keyboard focus ring: width, offset, dash style and colour set per style. | recipe | 24 |
| `press-sink` | On press the control translates by its offset and the shadow collapses to zero in a very short time; hover lifts first. | recipe | 10 |
| `disabled-state` | Disabled controls are marked by a dashed edge, hatch or flat unlit tile rather than opacity alone. | recipe | 5 |
| `selected-bar` | The selected item is marked by a 2-4px bar or rule in ink or primary on one edge or underneath; the same bar also marks cards and rows as a… | recipe | 5 |
| `press-invert` | Hover swaps fill and text (ink/canvas); pressed flips back. | recipe | 3 |
| `selected-tint` | Selection is one soft tint of the primary (tag tint or pale gel), optionally with a multi-stop foil sheen, with ink text. | recipe | 3 |
| `selected-capsule` | The selected segment, nav item or day becomes a bright near-white capsule (chrome or glass gradient) with dark ink and a small lift, instea… | recipe | 2 |
| `press-squish` | Pill corners animate from 28px to 12px on press with an overshoot easing (cubic-bezier(.34,1.56,.64,1), .18s); reduced motion snaps. | recipe | 1 |
| `selected-hatch` | The selected/pressed/avoid state is a 45-degree hatch over a double outline, with the label on a clear plate. | recipe | 1 |

### type (13)

| id | what | tier | styles |
|---|---|---|---:|
| `caps-mono-labels` | Small labels, tags and states in uppercase with wide tracking and/or a monospace face; the opposite setting is plain sentence-case labels. | recipe | 39 |
| `tight-display-tracking` | Negative letter-spacing on display and numeral text, scaled by --ab-tr so condensed/heavy faces are not tightened into collisions. | recipe | 22 |
| `display-weight-scale` | Headline weight and size step per style: light at huge size, regular at small, or bold; uses the lightest published weight at or below a ta… | token | 8 |
| `kicker-treatment` | The small line above the headline: pill, rule-led caption, prefix badge, or vertical running beside the headline. | recipe | 7 |
| `display-case-style` | Headline, brand and card titles set in a chosen case and width: heavy caps, condensed caps, stretched wide caps, or lowercase poster, with… | recipe | 6 |
| `bleed-display` | One oversized word or initial, or a huge one-line headline, cropped or bled off an edge so only part of its height shows. | generator | 5 |
| `bracketed-labels` | Labels, numbers, actions and section titles wrapped in literal brackets, slashes or rule-with-bracket glyphs. | recipe | 4 |
| `face-role-map` | Which face and style each text role uses: heading face on controls, serif numerals, italic for secondary text, a fixed second face for the… | recipe | 4 |
| `big-numeral-rows` | Rows or tiles lead with a very large heading-face numeral, tabular, tight, with a small label. | recipe | 3 |
| `browser-default-links` | Fixed browser blue/purple underlined links (lighter in dark) and bracketed link-like buttons. | recipe | 2 |
| `hard-text-shadow` | Zero-blur offset text-shadow in a deep shade for headline and titles. | recipe | 2 |
| `arrow-led-headline` | A straight arrow glyph in front of the headline words. | generator | 1 |
| `hanging-drop-cap` | The first letter of the first paragraph floats left at about three lines tall. | recipe | 1 |

### headline (9)

| id | what | tier | styles |
|---|---|---|---:|
| `highlight-word` | The last (or one) headline word gets one distinct treatment: italic accent, band, inverse block, hard shadow, slab, plane, detection box, d… | recipe | 32 |
| `mixed-face-headline` | The one emphasised headline word switches to a different face (a mincho serif) at regular weight and keeps the ink colour. | generator | 4 |
| `tilt-rotation` | Small per-element rotation (kicker, cards, chips, headline blocks or each headline word) fixed or seeded by position. | generator | 4 |
| `bitmap-glyph-text` | Text or the brand initial rendered from a 5x7 pixel glyph table as one SVG path with per-cell shading; block-letter headline is a size sett… | generator | 3 |
| `outline-echo-headline` | Last line or name set as outline only (stroke, no fill) with one to two offset echo copies in role colours. | generator | 2 |
| `bar-headline` | A hazard-colour bar with white bold-oblique display text, rotated about -2deg, set over a small, plain official headline (scale inversion). | recipe | 1 |
| `warped-display-headline` | Each display line is split into letters scaled on a wave, one line compressed and stretched, sized so the longest line fits its column. | generator | 1 |
| `wet-floor-reflection` | The headline (or hero object) is flipped under its baseline, sliced into horizontal bands that fade and drift, with no text nodes. | generator | 1 |
| `wordart-headline` | A headline with a three-band gradient face and a stacked-text-shadow extrusion, built from one base copy and two clipped overlay copies per… | generator | 1 |

### layout (13)

| id | what | tier | styles |
|---|---|---|---:|
| `hero-layout` | Which hero arrangement and column ratio the board uses (poster, split, centred, scene) with gap, art bleed and copy-on-scene settings. | recipe | 20 |
| `palette-board-form` | How the five role swatches are drawn on the board: strips, blocks, numbered chips, role-shaped glyphs, ruled list. | recipe | 19 |
| `ruled-row-list` | A list drawn as rows separated by rules: leading index, dotted leader to status, spec label/value pairs, header row, tray tiles. | recipe | 14 |
| `info-strip` | A band of micro-text (codes, BPM, katakana, sponsors) with a barcode, under every section header or across the top and foot. | recipe | 8 |
| `footer-treatment` | The footer is a style-specific band: ruled colophon, grey legal block, glass taskbar or reflective strip. | recipe | 4 |
| `header-treatment` | The header is a tiny wordmark, a three-column dateline masthead, or a full-bleed filled band with a heavy bottom edge. | recipe | 4 |
| `bento-cells` | The board is a 12-column grid of rounded tiles with one radius and one gap; spans vary so one tile dominates; wrappers dissolve into the gr… | recipe | 2 |
| `character-cell-grid` | Hero text and art laid out on an N-column monospace cell grid where one cell sets the font size. | recipe | 1 |
| `fanned-stack-tuck` | Cards/rows overlap by 18-20px (negative margin), later above earlier, each in the next colour; hover pulls one up 4px. | recipe | 1 |
| `ruled-cell-grid` | A grid of cells that share 1px ink borders like a spec table, with no gaps. | recipe | 1 |
| `solid-section-field` | A whole section is filled at 100% primary or accent with an ink outline, using the matching on-colour for text, while cards inside stay pap… | recipe | 1 |
| `title-block-layout` | The hero copy is a boxed title block in a corner of a full sheet drawing, with kicker row, headline, subcopy and meta cells ruled off. | recipe | 1 |
| `vast-whitespace` | Large vertical gaps (48-96px) surround each board block, with the same air on both sides of every rule. | token | 1 |

### ornament (41)

| id | what | tier | styles |
|---|---|---|---:|
| `catalogue-number` | Invented serials and IDs printed as micro-type: CAT.NO strings, N° counters, brand-prefixed issue IDs. | recipe | 26 |
| `section-number-marker` | Section and row numbers as a disc, chip, slash, FIG caption counter, or boxed (outlined or ink-filled) number. | recipe | 12 |
| `broken-rule` | A dashed or dotted line as divider, stitch, leader or tear-off perforation, with a stepped period and optional end ticks. | recipe | 9 |
| `registration-marks` | Crosshair and ring marks in the corners of the flyer. | recipe | 5 |
| `rubber-stamp` | Tags, statuses and Do / Don't markers as bordered, rotated (dashed for negative) rubber-stamp boxes. | recipe | 5 |
| `status-marker` | A small coloured dot, shape (circle / square / diamond) or route-letter bullet before a title or in a row. | recipe | 5 |
| `barcode-serial` | A striped barcode and a serial number printed on tickets and info strips. | generator | 4 |
| `brand-initial-hero-object` | The brand initial is the one subject of the hero art, drawn as a flat glyph, a debossed mark, or an extruded block stack. | generator | 4 |
| `brand-mark` | The small mark beside the brand name. | recipe | 4 |
| `sticker-label` | A rotated flat-colour sticker, corner star or flower, bordered canvas panel, or embossed label-maker tape stuck over a control or object. | recipe | 4 |
| `hand-drawn-marks` | Hand-drawn wavy line, squiggle tile, circle / strike / tick strokes used for underline, focus mark and selection. | generator | 3 |
| `micro-caption` | Tiny printed lines on or beside objects: captions on parts of a drawing, live brand data (hex, fonts, page), figure captions. | recipe | 3 |
| `paper-scrap` | A paper label or translucent tape strip sits on the board as an object, with corner hardware, rotation or tape across a corner. | recipe | 3 |
| `border-legend-label` | A short uppercase legend sitting on a card/list border like a fieldset legend ("Detail E", "TRACKED · 3 OBJECTS"). | recipe | 2 |
| `callout-tab-frame` | A small solid mono tab (class, id, confidence) attached to a box edge; a faint offset box drawn around any element. | recipe | 2 |
| `colour-bar-strip` | A strip of fixed adjacent colour bars or three thin stripes as masthead, footer, card-top rule. | recipe | 2 |
| `corner-brackets` | Eight linear-gradient strokes (two per corner) published as a CSS variable and applied as a frame around targets, focused fields, buttons a… | recipe | 2 |
| `redaction-bar` | Real text set transparent on an ink background so the bar is exactly word width; also an error line. | recipe | 2 |
| `sliced-mark` | A mark or initial is cut by horizontal stripes of uneven pitch or offset sideways in bands with tear lines. | generator | 2 |
| `contour-map-art` | A procedural topographic map: seeded height field, marching-squares contours, heavier index contours with knock-out elevation labels, a das… | generator | 1 |
| `cut-paper-shape-set` | Starbursts, atoms, kidneys, sputniks, boomerangs and sparkles drawn as flat shapes whose edges are resampled with small jitter. | bespoke | 1 |
| `double-rule` | A 3px rule over a 1px rule, drawn as two gradient layers in a 7px box, frames the masthead and then reappears on kit buttons, menus, cards… | recipe | 1 |
| `encoder-knob-scale` | A round knob with 11 printed ticks over 270 degrees, 0/5/10 numerals, a knurled ring and a primary pointer; and a row of coded encoder caps. | bespoke | 1 |
| `engineering-line-types` | A named set of stroke styles (visible, hidden dash, centre chain, dimension, hatch) as classes shared by all drawn art. | recipe | 1 |
| `gauge-instruments` | Stat dials (conic arc, --dial value), lamp chips (8px dot with 6px glow only when lit), T+ readout in a dark LCD, a console art (31-tick di… | bespoke | 1 |
| `handwritten-note-arrow` | One handwritten note in a script face with a looping hand-drawn arrow pointing at the main action. | bespoke | 1 |
| `horizon-arc` | A hairline elliptical arc beneath the window, stroked in a gradient (transparent, primary, white, secondary, transparent) with a blurred co… | recipe | 1 |
| `invented-sponsor-marks` | A wall of hand-drawn fake sponsor marks plus warning pictograms (no camera, ear protection, 18+, strobe) at mixed sizes. | bespoke | 1 |
| `isometric-extrusion-art` | Each lit cell of a bitmap glyph is extruded backwards 1-3 blocks (seeded from the brand name), drawn at 30-degree axes with hidden faces cu… | generator | 1 |
| `leader-callouts` | Labels with index and coordinates connect to marks by one horizontal run and one vertical drop, with the label knocking out the line behind… | generator | 1 |
| `marker-strike` | A hazard-colour bar through one word with a handwritten replacement above it. | recipe | 1 |
| `node-graph-diagram` | Procedural diagram of modules, bezier cables and ports in brand colours with name tags and toolbars. | generator | 1 |
| `oled-pixel-strip` | A black screen with the name in pixel type and a segmented meter, both in one lifted ink, with scanlines over the glass. | bespoke | 1 |
| `pull-quote` | A centred italic quote between two rules breaks up the board. | recipe | 1 |
| `receipt-strip` | Thermal-paper block with sawtooth top and bottom edges drawn in the page colour, dashed rules, a total line. | recipe | 1 |
| `revision-cloud` | A scalloped arc path around a rectangle plus a numbered triangle, in the primary. | generator | 1 |
| `route-map-art` | Two-route 0/45/90 map with rounded turns, ticks, labelled stations and an interchange disc. | generator | 1 |
| `signature-shape-container` | One shape per brand chosen by FNV-1a hash of the name from a library of six original paths (scallop, clover, soft burst, arch, rounded diam… | generator | 1 |
| `sticker-object-art` | Board art made from flat UI objects (price tag, starburst, checkbox, cursor, flower, squiggle), each outlined with a hard shadow and tilted. | bespoke | 1 |
| `thin-film-bubble` | A circle ring of 40 spectral wedges swirled by feTurbulence, faded in from 56% radius, with a thin white rim and an optional canvas-coloure… | generator | 1 |
| `wireframe-sphere-reticle` | Generated SVG: latitude/longitude ellipses, perspective floor grid, dotted reticle rings, ticks, lock brackets and a blip, all non-scaling… | generator | 1 |

### pattern (32)

| id | what | tier | styles |
|---|---|---|---:|
| `line-grid` | Background grid of 1px lines (columns, squares, graph paper with a heavier major line every Nth, hairline hero grid with edge ticks) at low… | recipe | 9 |
| `stripe-fill` | A repeating-linear-gradient of stripes or blocks over a base colour: hatch, segmented blocks, hazard 45-degree slash, webbing. | recipe | 5 |
| `dot-lattice` | A regular lattice of small dots (square or isometric), a dim matrix with seeded lit subset, or a faint grid with a radial brand glow. | generator | 4 |
| `radial-colour-wash` | Several low-alpha radial colour clouds or blurred blobs layered over the canvas or behind the hero as atmosphere. | recipe | 4 |
| `tick-ruler` | Repeating 1px ticks with a longer tick every Nth, as rails, slider ground, scale or platen edge scale with tiny numerals. | generator | 4 |
| `flat-colour-planes` | Flat decorative planes (diagonal bar, three-block stripe, parallelogram bands) in fixed or role colours. | recipe | 3 |
| `geometric-fill` | Tile or band fills built from primitives in brand colours: terrazzo, dots, zig-zag, repeating radial or conic bands, quarter/semi/circle ce… | generator | 3 |
| `scanlines` | A repeating horizontal line overlay over a screen or art box. | recipe | 3 |
| `checker-pattern` | A conic-gradient checker of a given cell size and two colours; used as shading, band or tab fill. | recipe | 2 |
| `radial-rays` | Alternating wedges or a conic fan radiating from a centre or apex in role colours. | generator | 2 |
| `area-proportional-pebbles` | Data values are drawn as smooth closed 8-point blobs seeded for variety, rescaled so each blob's area equals the value. | generator | 1 |
| `character-field-background` | A sparse field of ramp characters on 10px cells in ink at ~9%, generated into a data-URI SVG, behind sections that are cut out of it. | generator | 1 |
| `foil-fringe-plane` | A large tilted card whose surface is repeating radial bands in a fixed colour order plus a conic angle sweep and a fixed specular band, so… | recipe | 1 |
| `glyph-raster-art` | The brand word or initial is rendered on an offscreen canvas, each cell's luminance maps to a character ramp, an edge pass swaps in line ch… | generator | 1 |
| `hard-edged-scene-under-glass` | A dark base plus adjacent hard-stop planes of primary, accent and secondary (and one crisp glyph) so something sharp exists for glass to fl… | bespoke | 1 |
| `keycap-block-art` | Hero SVG of stacked toy blocks and a keycap with the brand initial, each on its lip. | bespoke | 1 |
| `layered-landscape-poster` | Flat ridge bands, sun disc, lake and pines in the spot inks with a title strip. | bespoke | 1 |
| `op-art-ripple` | Concentric bands in two colours bent by a blurred turbulence displacement filter, so edges stay smooth. | generator | 1 |
| `ordered-dither-field` | Renders a luminance field into two tone levels via an n x n Bayer matrix as run-length SVG paths. | generator | 1 |
| `paper-wear-speckle` | A seeded layer of mottling ellipses, fold creases, specks and an edge stroke makes the art look like aged paper without filters. | generator | 1 |
| `pixel-scene-landscape` | Rects-only procedural pixel landscape (dithered sky bands, hills, ground, collectibles, sprite of the initial) from the palette. | bespoke | 1 |
| `planet-horizon-plate` | Full-bleed deep-space plate: black-to-haze sky, a planet limb (radius 262 circle, 4-stop gradient from pale to deep primary) with a blurred… | bespoke | 1 |
| `platen-copy-art` | Black field with dither fall-off, the brand initial as a dot screen, ghost copy, dust and edge scale. | bespoke | 1 |
| `ring-comparison-series` | The previous or comparison data series is drawn as a soft secondary fill with a deeper edge instead of the lead series' solid primary. | recipe | 1 |
| `sine-striation-field` | About 140 fine sine strokes, each a shifted copy of one path, run through a colour ramp of the brand colours and fade out from the left. | generator | 1 |
| `sky-scene-art` | A procedural board scene: aqua sky gradient with rays, sparkles, flare string, swooshes, hill, rising orbs and water with a mirrored orb. | bespoke | 1 |
| `stacked-primitives-art` | A showroom totem of stacked shapes (circle, bar, triangle, semi, trapezoid) each in a laminate/flat fill with an offset sheet behind. | bespoke | 1 |
| `starfield-ground` | A page background of layered radial-gradient dots and crosses at different pitches over a solid canvas. | recipe | 1 |
| `tab-card-fan-art` | Hero: five tab-cards rotated -3..3 deg tucked in order, each with mono tag and arrow chip; front card has the brand initial; ink doodle mar… | bespoke | 1 |
| `tonal-shape-composition-art` | Hero: five library shapes at set position, size, rotation, separated by 7px strokes in the panel colour; signature shape largest in primary… | bespoke | 1 |
| `wall-collage-art` | Torn poster remnants, giant name, flyer, defaced stapled photo card stacked at low contrast. | bespoke | 1 |
| `well-disc-semi-scene` | Hero art of few large forms: recessed circular well 90%, raised canvas disc 37% off-centre, primary semicircle 40x20% with inset gloss, siz… | bespoke | 1 |

### motion (4)

| id | what | tier | styles |
|---|---|---|---:|
| `ambient-motion` | Low-key looping motion: stepped cursor blink, blinking caret, slow pulse, drifting ticker; stops under reduced motion. | recipe | 5 |
| `state-motion-curve` | Transition timing for state changes: spring overshoot, steps, instant or short ease. | recipe | 5 |
| `stepped-spinner` | A loading ring or square that rotates in discrete steps (no smooth easing) with a style-specific shape. | recipe | 5 |
| `tile-flip-motion` | Live tiles flip slowly on the X axis to a second face on a staggered 22s cycle, and a row of five squares slides as a loader. | recipe | 1 |

### voice (1)

| id | what | tier | styles |
|---|---|---|---:|
| `voice-register` | Motto, kicker, state names, readouts and sample copy follow one register (publication paratext, clinical, arcade); the editable specimen co… | token | 15 |

### structure (8)

| id | what | tier | styles |
|---|---|---|---:|
| `kit-component-map` | The table that says which material and which press/hover/selected behaviour each kit component (button, field, switch, segmented, checkbox/… | recipe | 35 |
| `action-with-glyph` | The main action carries a glyph or icon in its own slot: end arrow, label left with icon right, corner-anchored arrow, chevron, or a circul… | recipe | 10 |
| `kit-cell-frame` | Each kit cell on the UI-kit page is framed as a numbered caption, ruled column, accession cell or window caption. | recipe | 10 |
| `base-unit-scale` | All gaps, sizes and type steps are multiples (or doublings) of one base unit, defined once as tokens. | token | 3 |
| `bespoke-list-markup` | panels.list returns different HTML for the 03 list (route bullets, set list, copy roster). | bespoke | 3 |
| `material-specimen-slide` | deck.materialArt builds a themed specimen of the kit for the deck. | generator | 2 |
| `product-mock-art` | The hero art is a fake product screen in real HTML (dev-tool window with sidebar, issue and log; or a phone with card, rows and tabs) style… | bespoke | 2 |
| `type-specimen-art` | Board art showing each type voice as a large 'Aa' with cap/x-height/baseline guides, a glyph set and a size scale. | generator | 1 |

## Generators the framework must ship

Each is code written once and driven by params. "Styles" are the styles that used it in the audits.

| generator | what | styles it unlocks |
|---|---|---|
| `fw-contrast-fit` | One shared solver: walk a colour (mix toward ink, lightness step, alpha step, hue turn) by the smallest move… | acid-graphics, ascii-art, aurora-noir, bento-grid, blob-tracking, blueprint, corporate-vandalism (+29 more) |
| `fw-real-weight-snap` | A target font weight (300, 600, 700, heaviest) is snapped to the nearest weight the chosen face actually ship… | live-tile, mainframe, micrographics, mixed-type, naive-doodle, neo-brutal-pop, old-web (+1 more) |
| `primary-reprint` | The client primary is re-printed at a style-chosen saturation and lightness rule: pushed to full chroma by hu… | acid-graphics, clay, cyber-hud, data-pebble, frutiger-aero, gorpcore, paddock-pass (+1 more) |
| `bleed-display` | One oversized word or initial, or a huge one-line headline, cropped or bled off an edge so only part of its h… | dystopian-luxury, editorial-serif, live-tile, radical-memphis, raw-brutalist |
| `barcode-serial` | A striped barcode and a serial number printed on tickets and info strips. | acid-graphics, corporate-vandalism, micrographics, paddock-pass |
| `brand-initial-hero-object` | The brand initial is the one subject of the hero art, drawn as a flat glyph, a debossed mark, or an extruded… | holo-iridescent, industrial-device, isogrid, liquid-glass |
| `dot-lattice` | A regular lattice of small dots (square or isometric), a dim matrix with seeded lit subset, or a faint grid w… | industrial-device, isogrid, paddock-pass, patchbay |
| `mixed-face-headline` | The one emphasised headline word switches to a different face (a mincho serif) at regular weight and keeps th… | japanese-minimal, mid-century, mixed-type, xerox-punk |
| `tick-ruler` | Repeating 1px ticks with a longer tick every Nth, as rails, slider ground, scale or platen edge scale with ti… | micrographics, mixed-type, paddock-pass, xerox |
| `tilt-rotation` | Small per-element rotation (kicker, cards, chips, headline blocks or each headline word) fixed or seeded by p… | naive-doodle, neo-brutal-pop, radical-memphis, xerox-punk |
| `bitmap-glyph-text` | Text or the brand initial rendered from a 5x7 pixel glyph table as one SVG path with per-cell shading; block-… | ascii-art, pirate-broadcast, pixel-arcade |
| `geometric-fill` | Tile or band fills built from primitives in brand colours: terrazzo, dots, zig-zag, repeating radial or conic… | acid-graphics, bauhaus-poster, radical-memphis |
| `hand-drawn-marks` | Hand-drawn wavy line, squiggle tile, circle / strike / tick strokes used for underline, focus mark and select… | naive-doodle, radical-memphis, xerox-punk |
| `snap-to-fixed-palette` | Client colours snap to the nearest entry of a small fixed palette (hue-aware, lightness picked), with grey fa… | ascii-art, xerox, xerox-punk |
| `companion-hues` | Extra hues are rotated from the primary (triad, complement) or picked from the brand hues with a minimum spac… | frutiger-aero, tab-stack |
| `copier-degrade-filter` | SVG filter chain that degrades a shape like a copier: turbulence displacement, noise punched holes, alpha thr… | xerox, xerox-punk |
| `material-specimen-slide` | deck.materialArt builds a themed specimen of the kit for the deck. | toy-press, xerox-punk |
| `outline-echo-headline` | Last line or name set as outline only (stroke, no fill) with one to two offset echo copies in role colours. | acid-graphics, micrographics |
| `overprint-multiply` | A second ink drawn with mix-blend-mode multiply (screen in dark), shifted a few px, so overlaps print a third… | riso-print, wpa-screenprint |
| `radial-rays` | Alternating wedges or a conic fan radiating from a centre or apex in role colours. | aurora-noir, mid-century |
| `refraction-lens` | A lens shape that redraws the scene scaled and counter-rotated, or through an SVG displacement filter, to fak… | liquid-glass, soft-form |
| `sliced-mark` | A mark or initial is cut by horizontal stripes of uneven pitch or offset sideways in bands with tear lines. | mainframe, pirate-broadcast |
| `ticket-cutout` | Tickets: dotted perforated edge with semicircle notches, skewed segments, stub and body. | acid-graphics, paddock-pass |
| `area-proportional-pebbles` | Data values are drawn as smooth closed 8-point blobs seeded for variety, rescaled so each blob's area equals… | data-pebble |
| `arrow-led-headline` | A straight arrow glyph in front of the headline words. | transit-wayfinding |
| `character-field-background` | A sparse field of ramp characters on 10px cells in ink at ~9%, generated into a data-URI SVG, behind sections… | ascii-art |
| `contour-map-art` | A procedural topographic map: seeded height field, marching-squares contours, heavier index contours with kno… | gorpcore |
| `equal-luminance-clash` | A second colour is derived from the primary: either a fixed fluorescent partner by hue family or the hue ~165… | acid-graphics |
| `glyph-raster-art` | The brand word or initial is rendered on an offscreen canvas, each cell's luminance maps to a character ramp,… | ascii-art |
| `isometric-extrusion-art` | Each lit cell of a bitmap glyph is extruded backwards 1-3 blocks (seeded from the brand name), drawn at 30-de… | isogrid |
| `leader-callouts` | Labels with index and coordinates connect to marks by one horizontal run and one vertical drop, with the labe… | micrographics |
| `node-graph-diagram` | Procedural diagram of modules, bezier cables and ports in brand colours with name tags and toolbars. | patchbay |
| `op-art-ripple` | Concentric bands in two colours bent by a blurred turbulence displacement filter, so edges stay smooth. | acid-graphics |
| `ordered-dither-field` | Renders a luminance field into two tone levels via an n x n Bayer matrix as run-length SVG paths. | blob-tracking |
| `paper-wear-speckle` | A seeded layer of mottling ellipses, fold creases, specks and an edge stroke makes the art look like aged pap… | mid-century |
| `primary-collision-guard` | Tests whether the client primary sits within N degrees of a fixed signal colour and, if so, swaps the shell t… | corporate-vandalism |
| `revision-cloud` | A scalloped arc path around a rectangle plus a numbered triangle, in the primary. | blueprint |
| `route-map-art` | Two-route 0/45/90 map with rounded turns, ticks, labelled stations and an interchange disc. | transit-wayfinding |
| `signature-shape-container` | One shape per brand chosen by FNV-1a hash of the name from a library of six original paths (scallop, clover,… | tonal-shape |
| `sine-striation-field` | About 140 fine sine strokes, each a shifted copy of one path, run through a colour ramp of the brand colours… | mesh-gradient |
| `thin-film-bubble` | A circle ring of 40 spectral wedges swirled by feTurbulence, faded in from 56% radius, with a thin white rim… | holo-iridescent |
| `type-specimen-art` | Board art showing each type voice as a large 'Aa' with cap/x-height/baseline guides, a glyph set and a size s… | mixed-type |
| `warped-display-headline` | Each display line is split into letters scaled on a wave, one line compressed and stretched, sized so the lon… | acid-graphics |
| `wet-floor-reflection` | The headline (or hero object) is flipped under its baseline, sliced into horizontal bands that fade and drift… | frutiger-aero |
| `wireframe-sphere-reticle` | Generated SVG: latitude/longitude ellipses, perspective floor grid, dotted reticle rings, ticks, lock bracket… | cyber-hud |
| `wobble-line-outline` | Outlines drawn as seeded hand-wobbled SVG paths (amplitude, step, seed, overshoot) that any component can use… | naive-doodle |
| `wordart-headline` | A headline with a three-band gradient face and a stacked-text-shadow extrusion, built from one base copy and… | old-web |
| `fw-headline-hooks` | Registry hook slots the engine exposes so moves can emit markup: per-word and per-letter headline wrapping, p… | all (engine) |
| `fw-seeded-random` | Deterministic PRNG and name-hash (FNV-1a / mulberry-style) so generators render identically for the same bran… | all (engine) |

### Remainder items re-judged as generator work

Items from the audits' remainder lists that a generator in the engine could produce (so they are not bespoke):

| generator family | items | styles |
|---|---:|---|
| colour solvers (contrast, hue, hi-vis, snap) | 37 | acid-graphics, ascii-art, aurora-noir, blueprint, corporate-vandalism, cyber-hud, data-pebble, dystopian-luxury, frutiger-aero, gorpcore, holo-iridescent, live-tile, mainframe, mesh-gradient, mixed-type, naive-doodle, neo-brutal-pop, old-web, paddock-pass, patchbay, radical-memphis, raw-brutalist, soft-form, tab-stack, toy-press, transit-wayfinding, wpa-screenprint |
| procedural art (seeded paths, filters, extrusion, rasters) | 18 | ascii-art, blueprint, isogrid, liquid-glass, mainframe, micrographics, mid-century, patchbay, riso-print, tonal-shape, transit-wayfinding, xerox, xerox-punk |
| headline / per-word / per-letter hooks | 13 | ascii-art, corporate-vandalism, dystopian-luxury, frutiger-aero, industrial-device, japanese-minimal, mixed-type, old-web, radical-memphis, riso-print, transit-wayfinding, xerox-punk |
| font metrics, font loading, brand-name text | 8 | aurora-noir, editorial-serif, isogrid, japanese-minimal, mainframe, micrographics, pixel-arcade |
| other generator | 8 | data-pebble, gorpcore, isogrid, mid-century, naive-doodle, paddock-pass, soft-form |
| export workarounds | 1 | aurora-noir |

## Bespoke: cannot be generalised

### Bespoke moves (single-style by nature)

| id | what | style |
|---|---|---|
| `bespoke-list-markup` | panels.list returns different HTML for the 03 list (route bullets, set list, copy roster). | transit-wayfinding, xerox, xerox-punk |
| `cut-paper-shape-set` | Starbursts, atoms, kidneys, sputniks, boomerangs and sparkles drawn as flat shapes whose edges are resampled… | mid-century |
| `encoder-knob-scale` | A round knob with 11 printed ticks over 270 degrees, 0/5/10 numerals, a knurled ring and a primary pointer; a… | industrial-device |
| `gauge-instruments` | Stat dials (conic arc, --dial value), lamp chips (8px dot with 6px glow only when lit), T+ readout in a dark… | retro-futurist |
| `handwritten-note-arrow` | One handwritten note in a script face with a looping hand-drawn arrow pointing at the main action. | naive-doodle |
| `hard-edged-scene-under-glass` | A dark base plus adjacent hard-stop planes of primary, accent and secondary (and one crisp glyph) so somethin… | liquid-glass |
| `invented-sponsor-marks` | A wall of hand-drawn fake sponsor marks plus warning pictograms (no camera, ear protection, 18+, strobe) at m… | acid-graphics |
| `keycap-block-art` | Hero SVG of stacked toy blocks and a keycap with the brand initial, each on its lip. | toy-press |
| `layered-landscape-poster` | Flat ridge bands, sun disc, lake and pines in the spot inks with a title strip. | wpa-screenprint |
| `oled-pixel-strip` | A black screen with the name in pixel type and a segmented meter, both in one lifted ink, with scanlines over… | industrial-device |
| `pixel-scene-landscape` | Rects-only procedural pixel landscape (dithered sky bands, hills, ground, collectibles, sprite of the initial… | pixel-arcade |
| `planet-horizon-plate` | Full-bleed deep-space plate: black-to-haze sky, a planet limb (radius 262 circle, 4-stop gradient from pale t… | retro-futurist |
| `platen-copy-art` | Black field with dither fall-off, the brand initial as a dot screen, ghost copy, dust and edge scale. | xerox |
| `product-mock-art` | The hero art is a fake product screen in real HTML (dev-tool window with sidebar, issue and log; or a phone w… | aurora-noir, bento-grid |
| `sky-scene-art` | A procedural board scene: aqua sky gradient with rays, sparkles, flare string, swooshes, hill, rising orbs an… | frutiger-aero |
| `stacked-primitives-art` | A showroom totem of stacked shapes (circle, bar, triangle, semi, trapezoid) each in a laminate/flat fill with… | radical-memphis |
| `sticker-object-art` | Board art made from flat UI objects (price tag, starburst, checkbox, cursor, flower, squiggle), each outlined… | neo-brutal-pop |
| `tab-card-fan-art` | Hero: five tab-cards rotated -3..3 deg tucked in order, each with mono tag and arrow chip; front card has the… | tab-stack |
| `tonal-shape-composition-art` | Hero: five library shapes at set position, size, rotation, separated by 7px strokes in the panel colour; sign… | tonal-shape |
| `wall-collage-art` | Torn poster remnants, giant name, flyer, defaced stapled photo card stacked at low contrast. | xerox-punk |
| `well-disc-semi-scene` | Hero art of few large forms: recessed circular well 90%, raised canvas disc 37% off-centre, primary semicircl… | soft-form |

### Bespoke remainder items, by style

- **acid-graphics** (2): The flyer: composed 4:5 HTML poster (name, slogan, info grid, stub, kana spine,…; Line-up bill type list and per-section info strip copy
- **ascii-art** (1): Live ticker re-rendering panels and re-rasterising on font load
- **aurora-noir** (2): Product-window markup with sidebar, properties and activity rows from editable…; Issues table panel built by rewriting the shared list markup and computing the…
- **bauhaus-poster** (2): Hand-composed 3x3 cell table with the overlapping circle and triangle that over…; Diagonal bar and thin ink bar angled to 21 degrees, placed behind the art
- **bento-grid** (3): Phone product mock with floating chips and cropped rise; Deck Patterns stage as a bento of pattern images with fixed tile sizes; Deck In-product and Material bentos
- **blob-tracking** (5): Footage subject: 13 figures on two paths, shadows, doorway, as a luminance field; Detection boxes derived from the subjects (person, group, shadow, zones) and ta…; Centroid links (k=2 nearest plus long dashed); Per-box footage processing (revealed groups, inverted persons, primary-tinted l…; Deck cover band / closing strip as a crop of the plate via data URI with caching
- **blueprint** (1): Do / Don't pair art (line-type set versus filled, rounded, shaded part)
- **clay** (2): Hand-composed art scene: app-icon tile with embossed initial, sphere with a fac…; Embossed initial on the tile via text-shadow pair and cqw-based sizing
- **corporate-vandalism** (3): Hijacked notice document and receipt as hero art: memo line, title, redacted li…; Panel and list markup rewrites (header strips, footnote, PO list with struck wo…; Rule "exactly one foreign mark per view" and per-slide placement of marks
- **cyber-hud** (1): Readout composition on the art: coordinates, lock tag, leader line, callout, se…
- **data-pebble** (1): Board hero art composition: a frosted card over a blurred pebble field; the clu…
- **editorial-serif** (1): Cover plate art markup: figure > plate with half-tone layer, grain layer, plate…
- **frutiger-aero** (3): Procedural scene: sky gradient, light rays, sparkles, lens-flare string, three…; panels hooks emit real window chrome markup (title bar text plus caption-button…; Built screens bring a sky band and a bubble behind the app UI
- **gorpcore** (2): Map composition: hand-authored switchback trail points relative to the summit,…; Kit signature: field label as carbon tape folder tab, stencil face on the tape,…
- **industrial-device** (3): Device layout: a 100x64 unit coordinate board placing grille, OLED, encoders, k…; Deck material slide reuses the same drawing at 1.5x zoom cropped on the pads an…; About 20 editable device legend strings (copy keys)
- **japanese-minimal** (2): Hero art and deck specimen SVGs: coordinates, tick loops, rotated label, three…; Deck rules: do/dont marks drawn as a square and a rotated rule, deck cell and r…
- **liquid-glass** (1): Tab icons and the hero art markup (scene, two lenses for wide and narrow, tabs,…
- **live-tile** (1): Tile wall composition: seven fixed tiles (role, size, count, flip delay, back f…
- **mainframe** (2): Hero readout composition: hanging numbered mono rows, perforation hole row, cap…; Board list built as a table with a header row (panels.list) and its responsive…
- **mesh-gradient** (3): Hero art: a product-fragment trio (project card with sparkline, type-spec code…; Panels overrides: 01 card gains a spec detail list, 03 list gains a header, str…; Blended-with-Liquid-Glass rules for app surfaces and the title glow in product…
- **micrographics** (1): Spec plate composition: glyph measured on a canvas for true ink edges, callout…
- **mid-century** (2): Hero poster: composed layout of sunburst, sun, atom with three coloured electro…; Kit restyle in cut paper (calendar, wheel pickers, accordion, carousel, lightbo…
- **mixed-type** (1): Built-screen voice mixing: stat labels get a serif-italic asterisk, lead stat i…
- **naive-doodle** (2): The hero drawing: smiley sun, 12 dash rays, scalloped clouds, hill coloured out…; ndKit specific shapes: toggle faces on/off, flag, star with offset fill, tab el…
- **neo-brutal-pop** (2): Sticker cluster composition: price tag, starburst (20-point), checkbox, flower,…; Deck Material sticker sheet and In-product page (Gumroad-style cover, price, bu…
- **old-web** (2): Homepage window art: menu bar, nav list with drawn icons, under-construction si…; Table panel with list-view column headers, folder icons, NEW! badge, segmented…
- **paddock-pass** (1): Livery panel art composition: numeral box with chevrons, dot matrix, three spec…
- **patchbay** (1): Node-graph composition: fixed module boxes, port coordinates, wire routing table
- **pirate-broadcast** (6): Test card SVG: fixed bars, castellations, grey ramp, grating, circle ident with…; 5x7 punctuation table the shared font lacks; panels hook that string-replaces markup to inject P101-P103 title rows and the…; Signal-bar icon drawn with stacked gradients per state, RGB-split pressed state; Teletext hero page: row 0/24 absolute layout and torn grab message box; Deck materialArt hook returning the test card
- **pixel-arcade** (3): Landscape drawing: hand-placed stars, moon spans, clouds, pines, gems, sine-wav…; Heart and HUD sprite bitmaps and score overlay; RPG dialog box with blinking ▼ and tab kicker
- **radical-memphis** (3): Showroom totem composition: 10 hand-placed shapes with percent coordinates and…; deck.product room-set (frame, floor, totem, side table, plaque with year); Bacterio squiggle data-URI tile artwork
- **raw-brutalist** (1): Deck cover reflow turning the spec table into a four-column strip
- **retro-futurist** (3): Planet limb with blurred rim, gradients, three orbits, craft, vertical caption; Mission console: 31 ticks, value arc, needle with echo, LCD segments, LED ladder; Do/don't SVG pair rendered into data URIs in tokens
- **riso-print** (1): Zine spread art: three rotated ink cards each with a circle/arch/zigzag shape p…
- **soft-form** (1): Deck slide 06 material names set large instead of tracked micro caps; cover art…
- **tab-stack** (3): Fanned five-card SVG with rotations, mono tags, arrow chips and ink doodles; Kit signature block: index slot with corner tab labels, asymmetric tab radii (0…; Deck material specimens (stack, pill and chip, bar chart)
- **tonal-shape** (2): Hero composition geometry; Deck material specimens (shape, pill before and after, ramp)
- **toy-press** (3): Keycap and toy-block hero art composition; Deck material specimen markup; Per-component kit geometry (grooved knob, ratchet spinner, split keycap pair, w…
- **transit-wayfinding** (1): Departures list markup
- **wpa-screenprint** (1): Layered landscape poster art
- **xerox** (1): States hook renders initial through three generation filters
- **xerox-punk** (3): Wall collage and photo card art; Hand-drawn marker circle, strike and staple paths; Kit signature with 120 lines of hand-made component rules

## Closest-named pairs kept apart

Spot check for "no two moves describe the same idea". Each pair was compared on mechanism, not name.

| move A | move B | why they stay separate |
|---|---|---|
| `single-primary-action` | `glossy` | A rule (one filled primary per view, plus the button dress) versus a finish layer (gradient, cap, rim) that any object can get. |
| `hard-offset-shadow` | `hard-text-shadow` | Box shadow under a shape versus a text-shadow on glyphs; different CSS properties and different components. |
| `hard-offset-shadow` | `offset-fill-under-outline` | A shadow below a raised object versus a coloured fill shifted off its own outline (crayon misregistration). |
| `hard-offset-shadow` | `offset-sheet-colour` | The shape versus the colour rule that picks what sits behind it (the other brand hue mixed into canvas). |
| `hard-offset-shadow` | `stack-peek-edge` | One offset shadow versus several zero-blur layers that show as cards peeking out under a panel. |
| `fixed-canvas` | `fixed-surface` | Page ground ignoring the client canvas versus a card keeping its own ground in both modes. |
| `fixed-canvas` | `tinted-neutral-canvas` | A constant per mode versus a canvas still derived from the client one (lightness cap, tint). |
| `fixed-ink` | `fixed-palette` | One text/rule ink versus a set of accent or signal colours; they land on different roles. |
| `tonal-ramp` | `alpha-ramp` | Opaque colour steps of one hue versus one colour at several alphas over whatever is behind. |
| `tonal-ramp` | `stacked-surface-layers` | Colour derivation (tokens) versus a material that stacks components one layer above what they sit on. |
| `role-tint-fill` | `selected-tint` | A tint as a surface fill versus a tint used only to mark the selected state. |
| `raised-relief` | `elevation-shadow` | Light-from-a-corner relief with highlight and shadow versus plain neutral drop shadows with no lit edge. |
| `glossy` | `edge-light` | A gradient-and-cap gel finish versus only a 1px lit rim; the rim alone is far more widely used. |
| `clear-glass` | `refraction-lens` | A translucent surface versus a lens that redraws the scene (needs generator code). |
| `halftone-dots` | `dot-lattice` | A multiplied, masked dot screen over a plate versus a plain regular lattice used as ground or perforation. |
| `line-grid` | `ruled-cell-grid` | A background grid under everything versus content cells that share borders like a spec table. |
| `scanlines` | `stripe-fill` | A full-screen overlay at fixed 1-2px pitch versus a fill pattern on a component with chosen angle and colours. |
| `selected-tint` | `selected-capsule` | Soft tint behind ink text versus a bright near-white capsule; opposite brightness logic. |
| `press-sink` | `press-squish` | Moves the whole control by its shadow offset versus animating the corner radius. |
| `bitmap-glyph-text` | `glyph-raster-art` | Draws text from a fixed 5x7 glyph table versus sampling a rendered word on a canvas into ramp characters. |
| `sticker-label` | `paper-scrap` | A sticker (flat, keyline, rotated) versus a paper object with tape or corner hardware. |
| `rubber-stamp` | `redaction-bar` | A bordered rotated stamp versus text hidden under an ink bar at exact word width. |
| `callout-tab-frame` | `border-legend-label` | A detection-style tab with id and confidence versus a fieldset-style legend sitting on a border. |
| `catalogue-number` | `micro-caption` | Invented serials and IDs versus captions that carry real brand data or label a drawn part. |
| `title-bar-strip` | `header-treatment` | A strip on a card or dialog versus the whole board header. |
| `kit-cell-frame` | `kit-component-map` | How the kit page frames each sample versus which material each kit component gets. |
| `highlight-word` | `bar-headline` | Restyles one real word inside the headline versus setting the whole headline on a rotated bar. |

## Kit component names the audits mention

Canonical component (number of styles whose audit touches it) with the names the audits used:

| component | styles | audit names |
|---|---:|---|
| button | 45 | button, state-control, icon-button, fab, split-button, link, backtop |
| segmented | 45 | segmented, tab, nav, tabs, segment, stepper, navbar, seg, sidebar |
| card | 45 | card, panel, stat, page, title, stat-card, page-chrome, cell, carousel-card, card-board-only, tile, header, card-top |
| field | 45 | field, input, search, select, listbox, field-label, help |
| list | 45 | list, row, tray, list-icon, empty-state |
| switch | 41 | switch, toggle, knob-indicator, knob |
| chip-badge | 40 | tag, chip, badge, avatar, status, fit-chip, mark |
| progress | 39 | progress, chart, spinner, skeleton, bar, fill |
| overlay | 32 | menu, dialog, sheet, toast, overlay, popover, side-sheet, menu-item-selected |
| divider-label | 29 | label, divider, headline, separator, kicker, rule |
| calendar | 19 | calendar, calendar-day-selected, calendar-day |
| checkbox-radio | 17 | checkbox, radio, checkbox-on, radio-dot |
| state | 17 | all, state, selected, focus |
| slider-wheel | 13 | slider, range, wheel |
| other | 13 | swatch, icon, every text token |
| accordion | 6 | accordion, accordion-open |
| callout | 2 | callout |

Every name the audits used in `kitScope`: accordion, accordion-open, all, avatar, backtop, badge, bar, button, calendar, calendar-day, calendar-day-selected, callout, card, card-board-only, card-top, carousel-card, cell, chart, checkbox, checkbox-on, chip, dialog, divider, empty-state, every text token, fab, field, field-label, fill, fit-chip, focus, header, headline, help, icon, icon-button, input, kicker, knob, knob-indicator, label, link, list, list-icon, listbox, mark, menu, menu-item-selected, nav, navbar, overlay, page, page-chrome, panel, popover, progress, radio, radio-dot, range, row, rule, search, seg, segment, segmented, select, selected, separator, sheet, side-sheet, sidebar, skeleton, slider, spinner, split-button, stat, stat-card, state, state-control, status, stepper, swatch, switch, tab, tabs, tag, tile, title, toast, toggle, tray, wheel.

The component map model held for every audited component. Two limits worth knowing: (1) some kit shapes are one-off drawings (grooved knob, ratchet spinner, zig-zag cut lines, carbon-tape folder tab, calendar and wheel pickers in cut paper) that are neither a material nor a behaviour; they are listed as bespoke remainder; (2) board-only kit-page chrome (`kit-cell-frame`) is a presentation choice, not a component dress.

## REBUILD KITS

Each kit lists the exact merged moves with this style's values (taken from `usedBy.variant` in the parts), its component map, and the remainder items a moves-only rebuild has to drop. Ids ending in a `fw-` prefix are engine built-ins. Notation `a/b` in a value means board/app or light/dark as the audit stated.

**Mix convention (resolved from `js/brand-deck.js`):** `slMix(a, b, t)` returns `t` of `a` over `b`, so `mix(primary, ink, 0.35)` is 35% primary + 65% ink. The editorial-serif table below uses this: plate = 35% primary / 65% ink; plate-hi (light) = 30% plate / 70% canvas, (dark) = 40% plate / 60% ink; plate-lo (light) = 45% plate / 55% black, (dark) = 25% plate / 75% ink; primary-press = 78% primary / 22% black; ink-hover = 88% ink / 12% primary. Confirmed against `js/aesthetics/editorial-serif.js` lines 93-102.

### soft-form

- Core trick: Fill every surface with the canvas colour itself and let a paired dark/light shadow (offset down-right / up-left, derived from the canvas) make it look raised or recessed, with one iridescent glass panel and one glossy primary.
- Colour recipe: Canvas is pulled 6% (light) or 4% (dark) toward ink. Primary appears only on the single glossy CTA, switch knob, one swatch pad and checked boxes; ink fills the selected segment and slider fill (55%). hi = white@.79 and lo = canvas mixed 25% to black@.6 (dark: white@.11 and black@.53, app .13/.8 plus 1px top rim). Muted is pulled toward ink to 4.6:1 on every surface; the highlight word is the accent shaded to 3:1 (yellows fall back to the shaded primary). A muted or pastel primary still works because the on-state knob gets a ring mixed 45% toward ink.
- Worker estimate 85%; 20 merged moves; bespoke share 7%.

**Merged moves with this style's values**

- `raised-relief` [recipe]: --sf-raised: 6px 6px 13px lo, -6px -6px 13px hi, inset 0 1px 0 white@.06; --sf-raised-s 3px/7px | brand mark: 30px, radius 10, raised-s | apply key: raised-s, pressed = inset-s | app card: 22px radius, 5px 5px 12px lo / -5px -5px 12px hi, no border | art disc: 3.8cqw 4.4cqw 7.5cqw lo, -3cqw -3cqw 6.5cqw hi | materials[] Raised control: 6px 6px 13px / -6px -6px 13px
- `recessed` [recipe]: --sf-inset: inset 6px 6px 13px lo, inset -6px -6px 13px hi; --sf-inset-s 3px/6px (recessed-field) | .ab-input: 12px radius, 15px padding, 1px transparent border, focus = primary-text border (recessed-field) | list rows sit in one recessed well, 22px radius, flat inside (recessed-field) | states row: recessed tray 22px, discs inside (recessed-field) | app input: inset 4px 4px 9px lo / -4px -4px 9px hi (recessed-field) | materials[] Recessed well 9px/20px and Recessed field 6px/13px (recessed-field) | .ab-chip socket + ::after pad; primary pad glossy, canvas pad raised with 1px grey ring (socketed-pad) | checkbox: recessed socket + 1px ink@30% ring; knob dial raised (socketed-pad) | sf-slider markup injected by panels.panel; track top 8px, fill 62% (recessed-track-slider) | app: ::-webkit/-moz-range track gradient var(--v), thumb raised-s (recessed-track-slider) | materials[] Recessed slider (recessed-track-slider)
- `tonal-ramp` [token]: hi/lo by isDark (light-pair-derivation) | app pair --sfk-hi/lo/rim: dark lifts hi to .13, deepens lo, adds 1px top rim .08 (light-pair-derivation)
- `clear-glass` [recipe]: .ab-card: ring + gloss + canvas layers, inset 1px 1px 2px white@.5, 6px 9px 20px lo, -4px -4px 12px hi (clear-glass-panel) | ::before radial tints (clear-glass-panel) | glass disc (state 3): 135deg multi-stop wash, inset 2px 2px 3px white@.75, inner ring 6px in (clear-glass-panel) | materials[] Glass panel (clear-glass-panel)
- `glossy` [recipe]: .ab-cta, active = translateY(1px) scale(.99) + inset shadow (glossy-single-action) | app: --sfk-gloss, 3px 4px 10px lo (glossy-single-action) | primary swatch pad gets the same gloss (glossy-single-action) | materials[] Primary action (glossy-single-action)
- `ink-filled-selected` [recipe]: .ab-seg recessed-s; pressed button = ink fill, weight 500 (ink-filled-selected) | app seg: padding 5px, selected shadow 2px 2px 6px lo (ink-filled-selected) | materials[] Selected segment (ink-filled-selected)
- `kit-component-map` [recipe]: recessed field (field-surface) | recessed 50x29 track, glossy knob (145deg white wash over muted off / primary on), on-rim = primary mixed 45% toward ink (switch-knob) | 10px recessed channel, 6px ink fill at .55 (progress-bar-fill) | glass card on board; raised card in app (card-surface) | rows flat inside one recessed well (list-row-container) | .ab.sb-ab.sb-kit block: ~190 rules covering card, seg, buttons, fields, boxes, switch, slider, progress, list, tab bar, toast, sheet, callout, menu, stepper, knob, calendar, wheel, accordion, dialogs, drawers (kit-per-component-dress)
- `corner-radius` [token]: 24 card, 22 wells, 12 fields, 10 buttons, 9 selected segment
- `tinted-neutral-canvas` [token]: canvas = mix(ink, canvas, .06 light / .04 dark)
- `fw-contrast-fit` [generator]: strongMuted 4.6:1 on panel; mutedAA 4.6 on canvas/panel/ink-tint; highlight word shaded to 3:1 (contrast-floor-search)
- `highlight-word` [recipe]: shaded text, no band; falls back to shaded primary if accent is yellow/amber (see remainder) (highlight-word-treatment)
- `tight-display-tracking` [recipe]: weight 600, -.045em, lh .95, word-spacing .04em
- `caps-mono-labels` [recipe]: tag .14em, kicker .17em (micro labels, TE/Braun scale contrast) (caps-mono-labels)
- `state-signature` [recipe]: states are the three materials (raised, recessed, glass discs 84px) (named-states) | translateY(1px) scale(.99) + inset shadow; app parts sink to inset-s (press-state-motion)
- `mono-plus-accent` [recipe]: primary only on glossy CTA and switch (mono-plus-accent) | colour only on primary action and switch knob (rule, not tokens) (single-signal-colour)
- `well-disc-semi-scene` [bespoke]: .sfa-well/.sfa-disc/.sfa-semi | scene markup
- `refraction-lens` [generator]: .sfa-lens (glass-lens-refraction) | abLens(scene, ...) (glass-lens-refraction)
- `hero-layout` [recipe]: 1.3fr/1fr, art max 440px margin-right -6% (hero-split-art-bleed)
- `brand-mark` [recipe]: 30px raised key with a glossy primary dot
- `fw-a11y-media-fallbacks` [recipe]: transparency hides glass tints; more-contrast ink border (a11y-media-fallbacks)

**Component map**

| component | material / behaviour (move via audit id): this style's value |
|---|---|
| accordion | `recessed` (recessed-field): --sf-inset: inset 6px 6px 13px lo, inset -6px -6px 13px hi; --sf-inset-s 3px/6px; `recessed` (recessed-field): .ab-input: 12px radius, 15px padding, 1px transparent border, focus = primary-text border; `recessed` (recessed-field): list rows sit in one recessed well, 22px radius, flat inside; `recessed` (recessed-field): states row: recessed tray 22px, discs inside; `recessed` (recessed-field): app input: inset 4px 4px 9px lo / -4px -4px 9px hi; `recessed` (recessed-field): materials[] Recessed well 9px/20px and Recessed field 6px/13px |
| all-components | `kit-component-map` (kit-per-component-dress): .ab.sb-ab.sb-kit block: ~190 rules covering card, seg, buttons, fields, boxes, switch, slider, progress, list, tab bar, toast, sheet, callout, menu, stepper, knob, calendar, wheel, accordion, dialogs, drawers |
| button | `raised-relief` (soft-raised-relief): --sf-raised: 6px 6px 13px lo, -6px -6px 13px hi, inset 0 1px 0 white@.06; --sf-raised-s 3px/7px; `raised-relief` (soft-raised-relief): brand mark: 30px, radius 10, raised-s; `raised-relief` (soft-raised-relief): apply key: raised-s, pressed = inset-s; `raised-relief` (soft-raised-relief): app card: 22px radius, 5px 5px 12px lo / -5px -5px 12px hi, no border; `raised-relief` (soft-raised-relief): art disc: 3.8cqw 4.4cqw 7.5cqw lo, -3cqw -3cqw 6.5cqw hi; `raised-relief` (soft-raised-relief): materials[] Raised control: 6px 6px 13px / -6px -6px 13px; `glossy` (glossy-single-action): .ab-cta, active = translateY(1px) scale(.99) + inset shadow; `glossy` (glossy-single-action): app: --sfk-gloss, 3px 4px 10px lo; `glossy` (glossy-single-action): primary swatch pad gets the same gloss; `glossy` (glossy-single-action): materials[] Primary action; `state-signature` (press-state-motion): translateY(1px) scale(.99) + inset shadow; app parts sink to inset-s |
| calendar | `ink-filled-selected` (ink-filled-selected): .ab-seg recessed-s; pressed button = ink fill, weight 500; `ink-filled-selected` (ink-filled-selected): app seg: padding 5px, selected shadow 2px 2px 6px lo; `ink-filled-selected` (ink-filled-selected): materials[] Selected segment; `raised-relief` (soft-raised-relief): --sf-raised: 6px 6px 13px lo, -6px -6px 13px hi, inset 0 1px 0 white@.06; --sf-raised-s 3px/7px; `raised-relief` (soft-raised-relief): brand mark: 30px, radius 10, raised-s; `raised-relief` (soft-raised-relief): apply key: raised-s, pressed = inset-s; `raised-relief` (soft-raised-relief): app card: 22px radius, 5px 5px 12px lo / -5px -5px 12px hi, no border; `raised-relief` (soft-raised-relief): art disc: 3.8cqw 4.4cqw 7.5cqw lo, -3cqw -3cqw 6.5cqw hi; `raised-relief` (soft-raised-relief): materials[] Raised control: 6px 6px 13px / -6px -6px 13px |
| card | `raised-relief` (soft-raised-relief): --sf-raised: 6px 6px 13px lo, -6px -6px 13px hi, inset 0 1px 0 white@.06; --sf-raised-s 3px/7px; `raised-relief` (soft-raised-relief): brand mark: 30px, radius 10, raised-s; `raised-relief` (soft-raised-relief): apply key: raised-s, pressed = inset-s; `raised-relief` (soft-raised-relief): app card: 22px radius, 5px 5px 12px lo / -5px -5px 12px hi, no border; `raised-relief` (soft-raised-relief): art disc: 3.8cqw 4.4cqw 7.5cqw lo, -3cqw -3cqw 6.5cqw hi; `raised-relief` (soft-raised-relief): materials[] Raised control: 6px 6px 13px / -6px -6px 13px; `clear-glass` (clear-glass-panel): .ab-card: ring + gloss + canvas layers, inset 1px 1px 2px white@.5, 6px 9px 20px lo, -4px -4px 12px hi; `clear-glass` (clear-glass-panel): ::before radial tints; `clear-glass` (clear-glass-panel): glass disc (state 3): 135deg multi-stop wash, inset 2px 2px 3px white@.75, inner ring 6px in; `clear-glass` (clear-glass-panel): materials[] Glass panel; `kit-component-map` (card-surface): glass card on board; raised card in app |
| checkbox-radio | `glossy` (glossy-single-action): .ab-cta, active = translateY(1px) scale(.99) + inset shadow; `glossy` (glossy-single-action): app: --sfk-gloss, 3px 4px 10px lo; `glossy` (glossy-single-action): primary swatch pad gets the same gloss; `glossy` (glossy-single-action): materials[] Primary action; `recessed` (socketed-pad): .ab-chip socket + ::after pad; primary pad glossy, canvas pad raised with 1px grey ring; `recessed` (socketed-pad): checkbox: recessed socket + 1px ink@30% ring; knob dial raised |
| field | `recessed` (recessed-field): --sf-inset: inset 6px 6px 13px lo, inset -6px -6px 13px hi; --sf-inset-s 3px/6px; `recessed` (recessed-field): .ab-input: 12px radius, 15px padding, 1px transparent border, focus = primary-text border; `recessed` (recessed-field): list rows sit in one recessed well, 22px radius, flat inside; `recessed` (recessed-field): states row: recessed tray 22px, discs inside; `recessed` (recessed-field): app input: inset 4px 4px 9px lo / -4px -4px 9px hi; `recessed` (recessed-field): materials[] Recessed well 9px/20px and Recessed field 6px/13px; `kit-component-map` (field-surface): recessed field |
| list | `recessed` (recessed-field): --sf-inset: inset 6px 6px 13px lo, inset -6px -6px 13px hi; --sf-inset-s 3px/6px; `recessed` (recessed-field): .ab-input: 12px radius, 15px padding, 1px transparent border, focus = primary-text border; `recessed` (recessed-field): list rows sit in one recessed well, 22px radius, flat inside; `recessed` (recessed-field): states row: recessed tray 22px, discs inside; `recessed` (recessed-field): app input: inset 4px 4px 9px lo / -4px -4px 9px hi; `recessed` (recessed-field): materials[] Recessed well 9px/20px and Recessed field 6px/13px; `state-signature` (press-state-motion): translateY(1px) scale(.99) + inset shadow; app parts sink to inset-s; `kit-component-map` (list-row-container): rows flat inside one recessed well |
| other | `recessed` (socketed-pad): .ab-chip socket + ::after pad; primary pad glossy, canvas pad raised with 1px grey ring; `recessed` (socketed-pad): checkbox: recessed socket + 1px ink@30% ring; knob dial raised; `fw-contrast-fit` (contrast-floor-search): strongMuted 4.6:1 on panel; mutedAA 4.6 on canvas/panel/ink-tint; highlight word shaded to 3:1 |
| overlay | `ink-filled-selected` (ink-filled-selected): .ab-seg recessed-s; pressed button = ink fill, weight 500; `ink-filled-selected` (ink-filled-selected): app seg: padding 5px, selected shadow 2px 2px 6px lo; `ink-filled-selected` (ink-filled-selected): materials[] Selected segment; `raised-relief` (soft-raised-relief): --sf-raised: 6px 6px 13px lo, -6px -6px 13px hi, inset 0 1px 0 white@.06; --sf-raised-s 3px/7px; `raised-relief` (soft-raised-relief): brand mark: 30px, radius 10, raised-s; `raised-relief` (soft-raised-relief): apply key: raised-s, pressed = inset-s; `raised-relief` (soft-raised-relief): app card: 22px radius, 5px 5px 12px lo / -5px -5px 12px hi, no border; `raised-relief` (soft-raised-relief): art disc: 3.8cqw 4.4cqw 7.5cqw lo, -3cqw -3cqw 6.5cqw hi; `raised-relief` (soft-raised-relief): materials[] Raised control: 6px 6px 13px / -6px -6px 13px |
| progress | `kit-component-map` (progress-bar-fill): 10px recessed channel, 6px ink fill at .55 |
| segmented | `ink-filled-selected` (ink-filled-selected): .ab-seg recessed-s; pressed button = ink fill, weight 500; `ink-filled-selected` (ink-filled-selected): app seg: padding 5px, selected shadow 2px 2px 6px lo; `ink-filled-selected` (ink-filled-selected): materials[] Selected segment; `raised-relief` (soft-raised-relief): --sf-raised: 6px 6px 13px lo, -6px -6px 13px hi, inset 0 1px 0 white@.06; --sf-raised-s 3px/7px; `raised-relief` (soft-raised-relief): brand mark: 30px, radius 10, raised-s; `raised-relief` (soft-raised-relief): apply key: raised-s, pressed = inset-s; `raised-relief` (soft-raised-relief): app card: 22px radius, 5px 5px 12px lo / -5px -5px 12px hi, no border; `raised-relief` (soft-raised-relief): art disc: 3.8cqw 4.4cqw 7.5cqw lo, -3cqw -3cqw 6.5cqw hi; `raised-relief` (soft-raised-relief): materials[] Raised control: 6px 6px 13px / -6px -6px 13px; `state-signature` (press-state-motion): translateY(1px) scale(.99) + inset shadow; app parts sink to inset-s |
| slider-wheel | `recessed` (recessed-field): --sf-inset: inset 6px 6px 13px lo, inset -6px -6px 13px hi; --sf-inset-s 3px/6px; `recessed` (recessed-field): .ab-input: 12px radius, 15px padding, 1px transparent border, focus = primary-text border; `recessed` (recessed-field): list rows sit in one recessed well, 22px radius, flat inside; `recessed` (recessed-field): states row: recessed tray 22px, discs inside; `recessed` (recessed-field): app input: inset 4px 4px 9px lo / -4px -4px 9px hi; `recessed` (recessed-field): materials[] Recessed well 9px/20px and Recessed field 6px/13px; `recessed` (recessed-track-slider): sf-slider markup injected by panels.panel; track top 8px, fill 62%; `recessed` (recessed-track-slider): app: ::-webkit/-moz-range track gradient var(--v), thumb raised-s; `recessed` (recessed-track-slider): materials[] Recessed slider |
| switch | `glossy` (glossy-single-action): .ab-cta, active = translateY(1px) scale(.99) + inset shadow; `glossy` (glossy-single-action): app: --sfk-gloss, 3px 4px 10px lo; `glossy` (glossy-single-action): primary swatch pad gets the same gloss; `glossy` (glossy-single-action): materials[] Primary action; `recessed` (socketed-pad): .ab-chip socket + ::after pad; primary pad glossy, canvas pad raised with 1px grey ring; `recessed` (socketed-pad): checkbox: recessed socket + 1px ink@30% ring; knob dial raised; `kit-component-map` (switch-knob): recessed 50x29 track, glossy knob (145deg white wash over muted off / primary on), on-rim = primary mixed 45% toward ink |

**Remainder a moves-only rebuild will not carry**

- Drop (bespoke):
  - Deck slide 06 material names set large instead of tracked micro caps; cover art size (css/aesthetics/soft-form.css:216-225)
- Needs a generator the core must ship; drop if absent:
  - Lens refraction: the scene is rendered twice, the copy scaled 1.24x and counter-rotated inside a clipped tilted pill (js/aesthetics/soft-form.js:98-108)
  - Yellow/amber accent fallback: if the accent is below 3:1 and hue 35-80, the highlight word switches to the primary shaded to 3:1 (js/aesthetics/soft-form.js:57-65)
- Recipe-level, derivable only if the engine emits it from the component map; otherwise drop:
  - Real slider markup is injected into the panel after the status line (js/aesthetics/soft-form.js:110-117)
  - Dark-mode constants for highlight, shadow, rim and gloss are hand-tuned literals (js/aesthetics/soft-form.js:55-56)
  - Narrow-container reflow of progress channel, art and discs (css/aesthetics/soft-form.css:207-214)
  - App kit: ~190 per-component rules (calendar range pills, menu separators, knob indicator, split buttons) (css/aesthetics/soft-form.css:245-437)

**Reference values from the audit notes (verbatim)**

> Exact recipe: raised 6px 6px 13px lo, -6px -6px 13px hi (small 3/7); inset 6/13 (small 3/6); app raised 5/12, inset 4/9 and 2/5. Radii 24 card, 22 wells/trays/app card, 12 field/seg track (14 in app), 10 CTA (12 app), 9 selected segment, 10 mark. Glass ring 1.5px; glass disc 84px. Light direction fixed top-left, no motion. Soft Form is the planned rebuild target: the moves above cover board and kit; the lens and highlight fallback must be built as bespoke helpers or omitted in the rebuild.

### acid-graphics

- Core trick: The primary is pushed to full chroma and paired with a computed fluorescent clash colour at near-equal luminance, then every display line is individually warped (stretched on a wave, compressed, outlined with echoes) over a hidden 12-column grid.
- Colour recipe: Primary re-printed at 100% saturation with lightness by hue band; a muted primary (s<24) falls back to fixed #B6FF00. The clash is chartreuse beside a dark acid, hot magenta beside a green/yellow one, else the hue 165 degrees round at equal luminance. Soft accent replaced by fixed lime. Canvas near-black (L 2.4) or near-white.
- Worker estimate 55%; 35 merged moves; bespoke share 8%.

**Merged moves with this style's values**

- `primary-reprint` [generator]: printPrimary hook; client hex still shown in the palette readout (primary-push-chroma) | wired in as printPrimary (primary-push-chroma)
- `equal-luminance-clash` [generator]: OKLCH search with gamut bisection, dull-hue rejection and fallback offsets
- `fixed-palette` [token]: a soft accent is replaced by acid lime #B6FF00 for the ticket stub and 18+ tab (fixed-pigment-fallback)
- `tinted-neutral-canvas` [token]: dark: L 2.4, s <= 12; light: near white
- `fw-contrast-fit` [generator]: acid lifted toward white to 5:1 on the tinted rows, dark mode only (contrast-lift)
- `role-tint-fill` [token]: alternating rows tinted acid then clash at 12%
- `alpha-ramp` [token]: grid hairlines at 4.5-6.5% of ink; role tints are 12% alphas of acid and clash (ink-alpha-ramp)
- `hard-offset-shadow` [recipe]: cards echo in clash, panels in acid, 5px (hard-offset-shadow) | toast and menu 3px echo in the kit (hard-offset-shadow) | kit cell 4px echo; pressed collapses it and translates 3px (hard-offset-shadow)
- `outline-frame` [recipe]: 2px acid or clash edges on cards, panels, ticket tabs (heavy-border)
- `corner-radius` [token]: 0 everywhere
- `warped-display-headline` [generator]: def.headline builds spans with --s per letter and --acn for fitting | wrapper fits longest line, per-letter scaleY from baseline
- `outline-echo-headline` [generator]: highlight is outline-only, with two echoes in the acid and the clash | Echo name material: transparent fill, 2px stroke, drop-shadow echoes | headline last line and flyer name
- `tight-display-tracking` [recipe]: --ab-tr by class
- `caps-mono-labels` [recipe]: mono caps, 700, 0.1-0.14em (caps-mono-labels)
- `big-numeral-rows` [recipe]: row numerals 26-36px in the acid tint
- `line-grid` [recipe]: 12 hairline columns across the board padding (hidden-column-grid)
- `palette-board-form` [recipe]: strips with an extra readout block for acid, clash and luminance delta (palette-as-blocks)
- `section-number-marker` [recipe]: acid block chip (section-number-marker)
- `info-strip` [recipe]: labelrow::after strip with per-section content | event strip across the top and a reversed one above the footer
- `catalogue-number` [recipe]: CAT.NO ACG-030/x strings on rule and strips | kit cells numbered N°01.. via a CSS counter
- `barcode-serial` [generator]: N° 030 with an inline barcode | ticket serial № 000417 | barcode as a repeating-linear-gradient at the end of the strip
- `registration-marks` [recipe]: svg crosshair, placed twice | positioning and density of micro-type
- `invented-sponsor-marks` [bespoke]: 10 sponsor paths, 5 pictograms | rendered as aca-spons
- `ticket-cutout` [generator]: seg buttons with 3px dotted left edge, active ticket in acid (ticket-tabs) | flyer ticket stub with cut-outs (ticket-tabs) | kit cells with an acid N° stub; skewed tabs; overlays top 8px acid (ticket-tabs)
- `flat-colour-planes` [recipe]: panel carries 135deg stripes in the secondary (flat-colour-planes)
- `geometric-fill` [generator]: ripple for palette, strobe rays for type, warped check for interface, rings for in-use (field-band-pattern)
- `op-art-ripple` [generator]: two SVG filters #acw and #acr | ripple layers in the flyer | Op-art ripple material
- `ink-filled-selected` [recipe]: acid block on skewed ticket (ink-filled-selected)
- `state-signature` [recipe]: hover scaleX 1.05 and flip; press skewX -12 with split text-shadow (named-states)
- `action-with-glyph` [recipe]: ✱ (cta-arrow-glyph)
- `kit-component-map` [recipe]: 3px clash underline, acid on focus; kit uses 2px ink with a clash echo (field-anatomy) | equaliser SVG data URI of ten bars (progress-bar-skin) | row bar uses the equaliser as a repeating image (progress-bar-skin) | 2px ink border, no fill, mono caps (status-chip)
- `text-legend-controls` [recipe]: switch reads OFF / ON AIR
- `kit-cell-frame` [recipe]: ticket cell with acid N° stub, stretched names (kit-cell-chrome)
- `focus-ring` [recipe]: 3px dashed ink, 3px off (focus-ring)
- `disabled-state` [recipe]: clash hatch, no echo

**Component map**

| component | material / behaviour (move via audit id): this style's value |
|---|---|
| button | `hard-offset-shadow` (hard-offset-shadow): cards echo in clash, panels in acid, 5px; `hard-offset-shadow` (hard-offset-shadow): toast and menu 3px echo in the kit; `hard-offset-shadow` (hard-offset-shadow): kit cell 4px echo; pressed collapses it and translates 3px; `outline-frame` (heavy-border): 2px acid or clash edges on cards, panels, ticket tabs; `corner-radius` (corner-radius): 0 everywhere; `state-signature` (named-states): hover scaleX 1.05 and flip; press skewX -12 with split text-shadow; `action-with-glyph` (cta-arrow-glyph): ✱; `focus-ring` (focus-ring): 3px dashed ink, 3px off; `disabled-state` (disabled-state): clash hatch, no echo |
| card | `hard-offset-shadow` (hard-offset-shadow): cards echo in clash, panels in acid, 5px; `hard-offset-shadow` (hard-offset-shadow): toast and menu 3px echo in the kit; `hard-offset-shadow` (hard-offset-shadow): kit cell 4px echo; pressed collapses it and translates 3px; `outline-frame` (heavy-border): 2px acid or clash edges on cards, panels, ticket tabs; `corner-radius` (corner-radius): 0 everywhere; `ticket-cutout` (ticket-tabs): seg buttons with 3px dotted left edge, active ticket in acid; `ticket-cutout` (ticket-tabs): flyer ticket stub with cut-outs; `ticket-cutout` (ticket-tabs): kit cells with an acid N° stub; skewed tabs; overlays top 8px acid; `kit-cell-frame` (kit-cell-chrome): ticket cell with acid N° stub, stretched names |
| checkbox-radio | `text-legend-controls` (text-legend-controls): switch reads OFF / ON AIR; `disabled-state` (disabled-state): clash hatch, no echo |
| chip-badge | `caps-mono-labels` (caps-mono-labels): mono caps, 700, 0.1-0.14em; `kit-component-map` (status-chip): 2px ink border, no fill, mono caps |
| divider-label | `caps-mono-labels` (caps-mono-labels): mono caps, 700, 0.1-0.14em |
| field | `outline-frame` (heavy-border): 2px acid or clash edges on cards, panels, ticket tabs; `corner-radius` (corner-radius): 0 everywhere; `kit-component-map` (field-anatomy): 3px clash underline, acid on focus; kit uses 2px ink with a clash echo; `focus-ring` (focus-ring): 3px dashed ink, 3px off; `disabled-state` (disabled-state): clash hatch, no echo |
| list | `ink-filled-selected` (ink-filled-selected): acid block on skewed ticket |
| overlay | `hard-offset-shadow` (hard-offset-shadow): cards echo in clash, panels in acid, 5px; `hard-offset-shadow` (hard-offset-shadow): toast and menu 3px echo in the kit; `hard-offset-shadow` (hard-offset-shadow): kit cell 4px echo; pressed collapses it and translates 3px; `ticket-cutout` (ticket-tabs): seg buttons with 3px dotted left edge, active ticket in acid; `ticket-cutout` (ticket-tabs): flyer ticket stub with cut-outs; `ticket-cutout` (ticket-tabs): kit cells with an acid N° stub; skewed tabs; overlays top 8px acid; `ink-filled-selected` (ink-filled-selected): acid block on skewed ticket; `state-signature` (named-states): hover scaleX 1.05 and flip; press skewX -12 with split text-shadow |
| progress | `kit-component-map` (progress-bar-skin): equaliser SVG data URI of ten bars; `kit-component-map` (progress-bar-skin): row bar uses the equaliser as a repeating image |
| segmented | `outline-frame` (heavy-border): 2px acid or clash edges on cards, panels, ticket tabs; `caps-mono-labels` (caps-mono-labels): mono caps, 700, 0.1-0.14em; `ticket-cutout` (ticket-tabs): seg buttons with 3px dotted left edge, active ticket in acid; `ticket-cutout` (ticket-tabs): flyer ticket stub with cut-outs; `ticket-cutout` (ticket-tabs): kit cells with an acid N° stub; skewed tabs; overlays top 8px acid; `ink-filled-selected` (ink-filled-selected): acid block on skewed ticket; `state-signature` (named-states): hover scaleX 1.05 and flip; press skewX -12 with split text-shadow; `text-legend-controls` (text-legend-controls): switch reads OFF / ON AIR; `focus-ring` (focus-ring): 3px dashed ink, 3px off |
| switch | `text-legend-controls` (text-legend-controls): switch reads OFF / ON AIR |

**Remainder a moves-only rebuild will not carry**

- Drop (bespoke):
  - The flyer: composed 4:5 HTML poster (name, slogan, info grid, stub, kana spine, sponsor wall) with two SVG displacement filters (js/aesthetics/acid-graphics.js:246-305)
  - Line-up bill type list and per-section info strip copy (css/aesthetics/acid-graphics.css:154-176)
- Needs a generator the core must ship; drop if absent:
  - OKLCH clash search (gamut bisection, luminance solve, dull-hue rejection, fallback offsets) (js/aesthetics/acid-graphics.js:56-93)
  - Per-letter warped headline with wave, compressed middle line and fit-to-column sizing (js/aesthetics/acid-graphics.js:218-244)
- Recipe-level, derivable only if the engine emits it from the component map; otherwise drop:
  - Luminance-delta readout and pair legend printed in the palette strip (js/aesthetics/acid-graphics.js:188-213)

**Reference values from the audit notes (verbatim)**

> Light mode turns the hero into a full-bleed acid field (css 65-68). The file also holds a classic copy of the kit block (css 388-452) which was ignored.

### editorial-serif

- Core trick: Set the page like a magazine: weight comes from contrast (400-weight serif, one italic accent word, small-caps sans labels) and structure from hairline and thick-over-thin rules on a cream-warmed paper canvas, with a duotone cover plate mixed from the primary as the only filled object.
- Colour recipe: Canvas (light only) is mixed toward cream: b.mix(b.canvas,'#f3ead9',0.74) (comment says ~25% toward cream; check mix() weight order). Primary fills only the one main action, the duotone plate (primary mixed 35% toward ink, so even a light or muted primary goes dark; a grey primary yields a grey plate, no chroma boost), the switch-on and the board tab underline. Pressed = mix(primary,#000,0.78) with readable text. Hover = ink background, canvas text. Accent is text only (accent-ink on the italic word and the section sign). Secondary tints small tags. In the kit everything except the one main action is ink (css 336-342).
- Worker estimate 85%; 35 merged moves; bespoke share 2%.

**Merged moves with this style's values**

- `tinted-neutral-canvas` [token]: light only: mix(canvas,'#f3ead9',0.74), a cream warm; dark mode untouched
- `duotone-ink` [recipe]: plate=mix(primary,ink,.35); hi toward canvas .3 (dark: toward ink .4); lo toward black .45 (dark: ink .25); css 77-84
- `halftone-dots` [recipe]: dot rgba(0,0,0,.75) 0.9-1.3px on a 5px grid, mix-blend multiply, mask 180deg transparent 20% to black; dark opacity .16 (85) (halftone-dots)
- `grain-overlay` [recipe]: feTurbulence fractalNoise .85, 2 octaves, 180px, grey .5 matrix alpha .9, opacity .09, multiply, plate only
- `bleed-display` [generator]: brand initial 150cqh, heading face 400 uppercase, left -8% bottom -38%, tone mix(plate 72%, canvas 28%) (cropped-giant-type)
- `micro-caption` [recipe]: body face clamp(10.5px,3.8cqw,12.5px), em italic ink, page number ui .82em .14em caps (css 110-114); chart caption 'Fig. 2 — ...' on Built screens (290-293) (figure-caption)
- `double-rule` [recipe]: board masthead; kit: borders on buttons (556), cards (624), lists (626), menus (583), navbar (469), divider 5px (636); overlays use 3px double (641-646)
- `header-treatment` [recipe]: grid 1fr auto 1fr, dateline 10.5px .16em caps via ::before, wordmark 400 uppercase, mark hidden; collapses to flex under 600px (255-258); built landing nav the same (306-310) (centered-masthead)
- `outline-frame` [recipe]: three tiers: hair alpha(ink,.30/.26), soft .16/.14, strong = ink; vertical hairline between asym columns (css 183) (hairline-rule)
- `corner-radius` [token]: 0 everywhere; kit --k-r:0px (341); only radio ring and skeleton avatar round
- `flat-surface` [recipe]: padding 0, no rule at all; paper with hairlines elsewhere; kit cards keep screen margin (369) (chromeless-card)
- `caps-mono-labels` [recipe]: caps SANS, 10.5px .16em 500; swatch role .14em 600 (136); field labels .18em 600 (211) (caps-mono-labels)
- `tight-display-tracking` [recipe]: headline -0.028em x --ab-tr; card title -0.02em (196); row names -0.01em (239); tr from face class js 73-79
- `display-weight-scale` [token]: 400 everywhere; 'weight from contrast' (js 7) (light-display-weight)
- `highlight-word` [recipe]: italic 400, accent-ink, no fill or underline (js 37-38) (highlight-last-word)
- `face-role-map` [recipe]: italic: section numerals 17px (119), row n 15px (238), row pct 17px (243), stepper 26px (607), knob 20px (437) (serif-numeral-figures) | type class (144), type why (164), field value 24px (214), status (223), motto (247), accordion body (453), dialog titles (643) (italic-secondary-voice)
- `hanging-drop-cap` [recipe]: heading face 400, ink; excluded in app screens and slides (302)
- `pull-quote` [recipe]: italic 400/1.08, tracking -0.015em x tr, 1px strong top + 1px hair bottom, hidden in app screens and slides
- `ruled-row-list` [recipe]: type picks: ::after dotted leader, ::before counter 11px tabular; list rows grid with dotted bar (240); counters start 12/24/38 (145-147); drops leader at <=360px (314-319) (dotted-leader-contents) | contents: strong top rule, soft row rules, italic index, serif name, dotted leader, caps status, italic pct (board-list-recipe)
- `field-form` [recipe]: heading italic 24px/1.2, 1px strong rule, mb 20px, focus rule primary + 0 1px 0 (kit: ink + 0 2px 0, 575-579) (underline-field)
- `selected-bar` [recipe]: board tab 2px primary underline (194); kit 3px ink (602, 659); picked row inset 3px left bar (630, 635, 661); anchors/nav inset rules (471, 479) (rule-marked-selected)
- `ink-filled-selected` [recipe]: only for open menu items (415, 483, 490) and pressed state (559); normal selection is a rule (ink-filled-selected)
- `state-signature` [recipe]: Rest / Hover / Pressed, button samples; hover ink swap, pressed darkened primary (css 224-228) (named-states)
- `fw-state-colour-derivation` [recipe]: hover = ink bg + canvas text (css 206); pressed = mix(primary,#000,.78) + readable text + translateY(1px) (207)
- `mono-plus-accent` [recipe]: accent only as the italic headline word and the § sign (249); in the kit primary fills only the one action (336-342) (mono-plus-accent)
- `catalogue-number` [recipe]: 'Vol. 01 · No. 1' dateline, 'No. 01' plate number (js 28), kit cell 'No. NN' (531), page 'p. 01' (js 33)
- `hero-layout` [recipe]: poster re-gridded: headline and standfirst left, plate right: 1fr / clamp(190px,29cqw,370px), gap clamp(24px,4.4cqw,60px) (css 44-48), plate aspect 3/4.15 (hero-layout)
- `palette-board-form` [recipe]: index: 5 cols, 18px squares ringed 1px strong, 1px soft cell separators, top 1px strong / bottom 1px hair (palette-swatch-form)
- `section-number-marker` [recipe]: serif italic 17px followed by ' — ' (section-number-marker)
- `kit-component-map` [recipe]: square, padding 15px 18px, 11.5px 600 .18em caps, primary fill, '→' arrow; kit: 3px/1px masthead-ruled outlined key (556-561) (button-shape-recipe) | 40x18 square with 1px ring, 12px slug, on = primary; kit 48x24 rule with 16px square slug, on = ink (597-599) (toggle-recipe) | underline: gap 26px, 11px .16em caps, selected 600 + 2px primary rule (segmented-recipe) | 22px 1px ink square with a 28px serif x; radio 22px ring 1.5px with an 8px ink bullet (checkbox-radio-marks) | board: dotted 1px strong leader, no fill; kit: 2px ink over hairline (386-387) (progress-recipe) | 3px double rule, no shadow; sheets 3px double top; tooltip ink fill (overlay-surface)
- `kit-cell-frame` [recipe]: 3px strong top + 1px hair bottom, no box; italic 13px 'No. NN' counter; names 24px/28px serif (kit-cell-frame)
- `focus-ring` [recipe]: 2px solid ink, offset 3px (kit --sb-focus-offset 3px, 523) (focus-ring)
- `footer-treatment` [recipe]: rule: 1px strong top, 11px .12em caps, italic motto, '§' dot
- `voice-register` [token]: publication: Issue 01, Vol., Fig., p. 01, 'The design issue' (voice-register)
- `broken-rule` [recipe]: dotted: disabled keys use 3px/1px dotted rules; dotted leaders (152) (dashed-stitch)

**Component map**

| component | material / behaviour (move via audit id): this style's value |
|---|---|
| accordion | `selected-bar` (rule-marked-selected): board tab 2px primary underline (194); kit 3px ink (602, 659); picked row inset 3px left bar (630, 635, 661); anchors/nav inset rules (471, 479) |
| button | `corner-radius` (corner-radius): 0 everywhere; kit --k-r:0px (341); only radio ring and skeleton avatar round; `state-signature` (named-states): Rest / Hover / Pressed, button samples; hover ink swap, pressed darkened primary (css 224-228); `focus-ring` (focus-ring): 2px solid ink, offset 3px (kit --sb-focus-offset 3px, 523); `mono-plus-accent` (mono-plus-accent): accent only as the italic headline word and the § sign (249); in the kit primary fills only the one action (336-342); `fw-state-colour-derivation` (state-colour-derivation): hover = ink bg + canvas text (css 206); pressed = mix(primary,#000,.78) + readable text + translateY(1px) (207); `kit-component-map` (button-shape-recipe): square, padding 15px 18px, 11.5px 600 .18em caps, primary fill, '→' arrow; kit: 3px/1px masthead-ruled outlined key (556-561); `double-rule` (double-rule-masthead): board masthead; kit: borders on buttons (556), cards (624), lists (626), menus (583), navbar (469), divider 5px (636); overlays use 3px double (641-646); `broken-rule` (dashed-stitch): dotted: disabled keys use 3px/1px dotted rules; dotted leaders (152) |
| calendar | `ink-filled-selected` (ink-filled-selected): only for open menu items (415, 483, 490) and pressed state (559); normal selection is a rule |
| card | `tinted-neutral-canvas` (tinted-neutral-canvas): light only: mix(canvas,'#f3ead9',0.74), a cream warm; dark mode untouched; `outline-frame` (hairline-rule): three tiers: hair alpha(ink,.30/.26), soft .16/.14, strong = ink; vertical hairline between asym columns (css 183); `corner-radius` (corner-radius): 0 everywhere; kit --k-r:0px (341); only radio ring and skeleton avatar round; `tight-display-tracking` (tight-display-tracking): headline -0.028em x --ab-tr; card title -0.02em (196); row names -0.01em (239); tr from face class js 73-79; `flat-surface` (chromeless-card): padding 0, no rule at all; paper with hairlines elsewhere; kit cards keep screen margin (369); `display-weight-scale` (light-display-weight): 400 everywhere; 'weight from contrast' (js 7); `face-role-map` (serif-numeral-figures): italic: section numerals 17px (119), row n 15px (238), row pct 17px (243), stepper 26px (607), knob 20px (437); `kit-cell-frame` (kit-cell-frame): 3px strong top + 1px hair bottom, no box; italic 13px 'No. NN' counter; names 24px/28px serif; `double-rule` (double-rule-masthead): board masthead; kit: borders on buttons (556), cards (624), lists (626), menus (583), navbar (469), divider 5px (636); overlays use 3px double (641-646) |
| checkbox-radio | `kit-component-map` (checkbox-radio-marks): 22px 1px ink square with a 28px serif x; radio 22px ring 1.5px with an 8px ink bullet |
| chip-badge | `corner-radius` (corner-radius): 0 everywhere; kit --k-r:0px (341); only radio ring and skeleton avatar round; `caps-mono-labels` (caps-mono-labels): caps SANS, 10.5px .16em 500; swatch role .14em 600 (136); field labels .18em 600 (211); `broken-rule` (dashed-stitch): dotted: disabled keys use 3px/1px dotted rules; dotted leaders (152) |
| divider-label | `caps-mono-labels` (caps-mono-labels): caps SANS, 10.5px .16em 500; swatch role .14em 600 (136); field labels .18em 600 (211); `section-number-marker` (section-number-marker): serif italic 17px followed by ' — '; `double-rule` (double-rule-masthead): board masthead; kit: borders on buttons (556), cards (624), lists (626), menus (583), navbar (469), divider 5px (636); overlays use 3px double (641-646); `broken-rule` (dashed-stitch): dotted: disabled keys use 3px/1px dotted rules; dotted leaders (152) |
| field | `outline-frame` (hairline-rule): three tiers: hair alpha(ink,.30/.26), soft .16/.14, strong = ink; vertical hairline between asym columns (css 183); `corner-radius` (corner-radius): 0 everywhere; kit --k-r:0px (341); only radio ring and skeleton avatar round; `focus-ring` (focus-ring): 2px solid ink, offset 3px (kit --sb-focus-offset 3px, 523); `face-role-map` (italic-secondary-voice): type class (144), type why (164), field value 24px (214), status (223), motto (247), accordion body (453), dialog titles (643); `field-form` (underline-field): heading italic 24px/1.2, 1px strong rule, mb 20px, focus rule primary + 0 1px 0 (kit: ink + 0 2px 0, 575-579) |
| list | `outline-frame` (hairline-rule): three tiers: hair alpha(ink,.30/.26), soft .16/.14, strong = ink; vertical hairline between asym columns (css 183); `face-role-map` (serif-numeral-figures): italic: section numerals 17px (119), row n 15px (238), row pct 17px (243), stepper 26px (607), knob 20px (437); `selected-bar` (rule-marked-selected): board tab 2px primary underline (194); kit 3px ink (602, 659); picked row inset 3px left bar (630, 635, 661); anchors/nav inset rules (471, 479); `ruled-row-list` (board-list-recipe): contents: strong top rule, soft row rules, italic index, serif name, dotted leader, caps status, italic pct; `double-rule` (double-rule-masthead): board masthead; kit: borders on buttons (556), cards (624), lists (626), menus (583), navbar (469), divider 5px (636); overlays use 3px double (641-646); `ruled-row-list` (dotted-leader-contents): type picks: ::after dotted leader, ::before counter 11px tabular; list rows grid with dotted bar (240); counters start 12/24/38 (145-147); drops leader at <=360px (314-319) |
| other | `palette-board-form` (palette-swatch-form): index: 5 cols, 18px squares ringed 1px strong, 1px soft cell separators, top 1px strong / bottom 1px hair |
| overlay | `ink-filled-selected` (ink-filled-selected): only for open menu items (415, 483, 490) and pressed state (559); normal selection is a rule; `kit-component-map` (overlay-surface): 3px double rule, no shadow; sheets 3px double top; tooltip ink fill; `double-rule` (double-rule-masthead): board masthead; kit: borders on buttons (556), cards (624), lists (626), menus (583), navbar (469), divider 5px (636); overlays use 3px double (641-646) |
| progress | `kit-component-map` (progress-recipe): board: dotted 1px strong leader, no fill; kit: 2px ink over hairline (386-387) |
| segmented | `caps-mono-labels` (caps-mono-labels): caps SANS, 10.5px .16em 500; swatch role .14em 600 (136); field labels .18em 600 (211); `ink-filled-selected` (ink-filled-selected): only for open menu items (415, 483, 490) and pressed state (559); normal selection is a rule; `focus-ring` (focus-ring): 2px solid ink, offset 3px (kit --sb-focus-offset 3px, 523); `mono-plus-accent` (mono-plus-accent): accent only as the italic headline word and the § sign (249); in the kit primary fills only the one action (336-342); `face-role-map` (serif-numeral-figures): italic: section numerals 17px (119), row n 15px (238), row pct 17px (243), stepper 26px (607), knob 20px (437); `header-treatment` (centered-masthead): grid 1fr auto 1fr, dateline 10.5px .16em caps via ::before, wordmark 400 uppercase, mark hidden; collapses to flex under 600px (255-258); built landing nav the same (306-310); `selected-bar` (rule-marked-selected): board tab 2px primary underline (194); kit 3px ink (602, 659); picked row inset 3px left bar (630, 635, 661); anchors/nav inset rules (471, 479); `kit-component-map` (segmented-recipe): underline: gap 26px, 11px .16em caps, selected 600 + 2px primary rule; `double-rule` (double-rule-masthead): board masthead; kit: borders on buttons (556), cards (624), lists (626), menus (583), navbar (469), divider 5px (636); overlays use 3px double (641-646) |
| state | `face-role-map` (italic-secondary-voice): type class (144), type why (164), field value 24px (214), status (223), motto (247), accordion body (453), dialog titles (643) |
| switch | `focus-ring` (focus-ring): 2px solid ink, offset 3px (kit --sb-focus-offset 3px, 523); `kit-component-map` (toggle-recipe): 40x18 square with 1px ring, 12px slug, on = primary; kit 48x24 rule with 16px square slug, on = ink (597-599) |

**Remainder a moves-only rebuild will not carry**

- Drop (bespoke):
  - Cover plate art markup: figure > plate with half-tone layer, grain layer, plate number, cropped initial, coverline and sub-line, plus figcaption with italic label and page number, all copy-driven with a {brand} placeholder (js/aesthetics/editorial-serif.js:109-121)
- Needs a generator the core must ship; drop if absent:
  - Tracking multiplier --ab-tr from the heading face class (condensed 0, heavy 0, wide 0.4, techno 0.4, else 1) and the interface sans choice (the brand's own sans, else Inter): read from global state.headingFont/bodyFont (js/aesthetics/editorial-serif.js:73-82)
- Recipe-level, derivable only if the engine emits it from the component map; otherwise drop:
  - Pull quote text lives as a literal in a CSS ::before content string and is only shown outside .sb-ab and .ab-slide (css/aesthetics/editorial-serif.css:174-179)
  - Narrow and phone container-query re-layouts: masthead collapses to flex, hero to one column (plate to 4/4.6 under), palette to one column, list rows drop the leader at <=360px (css/aesthetics/editorial-serif.css:254-275)
  - Kit adapter: ~230 lines of selectors that map each shared-kit component class (.sb-k-*, .sb-tab, .ab-row.sb-k-row) to the editorial recipes; counters for 'No. NN' cell numbers; drop cap disabled on .ab-slide (css/aesthetics/editorial-serif.css:336-670)

**Reference values from the audit notes (verbatim)**

> REBUILD TABLE (exact values). Radii: 0 everywhere (board css 15, kit --k-r 0px css 341); only radio ring and skeleton avatar are round. Rules: --ab-hair = alpha(ink, 0.30 light / 0.26 dark); --ab-hair-soft = alpha(ink, 0.16 / 0.14); --ab-hair-strong = ink. Masthead rule = 7px tall: 3px strong on top + 1px strong at the foot (two 100% x 3px / 100% x 1px linear-gradient layers, css 37-41); kit reuses it as 3px solid top + 1px solid bottom on buttons, cards, menus, bars, cells; overlays 3px double. Plate: primary mix ink 0.35 (plate), mix black 0.5 (dark, unused in css), hi = mix(plate,canvas,0.3) light / mix(plate,ink,0.4) dark, lo = mix(plate,black,0.45) light / mix(plate,ink,0.25) dark; background = radial(90% 70% at 24% 14%, hi, transparent 62%) over linear(162deg, plate, lo); 1px strong border; halftone 5px grid, dot rgba(0,0,0,.75) 0.9-1.3px, opacity .34 (dark .16) multiply, mask 180deg transparent 20% to black 100%; grain 180px feTurbulence fractalNoise baseFrequency .85, 2 octaves, opacity .09 multiply. Initial letter: heading face 400 uppercase, 150cqh, left -8%, bottom -38%, colour mix(plate 72%, canvas 28%). Plate box: width clamp(190px,29cqw,370px), aspect 3/4.15 (narrow 4/4.6). Headline: weight 400, size clamp(44px,11.5cqw,160px) x hl-scale x hs x display(1.22), line-height .94, tracking -0.028em x tr, balance wrap; narrow clamp(44px,17cqw,78px). Wordmark: uppercase 400, .05em x tr, clamp(20px,3cqw,34px). Dateline/tag 10.5px .16em uppercase muted; 'Vol. 01 · No. 1' is a ::before string. Kicker 11px 500 .22em ink with a flex hairline after. Standfirst clamp(16px,2cqw,23px)/1.38, max 30em, 1px hair top rule, padding-top clamp(12px,1.8cqw,20px). Section label 10.5px .16em 500; labelrow border-bottom 1px hair, pb 9px mb 18px; numerals heading italic 17px followed by ' — '. Palette: 5 cols, top 1px strong / bottom 1px hair, chips 18px square ringed 1px strong, role 10.5px 600 .14em caps, hex 11px tabular. Contents row: grid 3.4ch auto 1fr auto 5ch, row padding clamp(11px,1.5cqw,16px) 0, top 1px soft, name serif clamp(19px,2.3cqw,26px)/1.1 tracking -0.01em x tr, dotted 1px strong leader, status 10.5px .14em caps muted, pct italic 17px; type-pick counters start 12/24/38. Pull quote italic clamp(26px,4cqw,50px)/1.08, max 17em, centred, 1px strong top / 1px hair bottom. Card title clamp(28px,3.6cqw,42px)/1.02 tracking -0.02em x tr, body 17px/1.4 in 12.5em, drop cap 3.15em / line-height .8 / padding .05em .09em 0 0. Main action: padding 15px 18px, 11.5px 600 .18em uppercase, bg primary, hover bg ink / canvas text, active mix(primary,#000,.78) + translateY(1px), arrow '→' 15px. Field: underline 1px strong, italic heading 24px/1.2, label 10.5px 600 .18em caps; focus underline primary + 0 1px 0. Tabs: gap 26px, 11px 500 .16em caps muted, selected ink 600 + 2px primary underline (kit: 700 + 3px ink). Toggle: 40x18 square, inset 1px strong ring, 12px ink slug (kit 48x24 rule with 16px square slug). Kit: selection = ink text + 2-3px ink rule and italic title; pressed = ink fill reversed; focus = 2px ink outline offset 3px; disabled = dotted 3px/1px rules; checkbox = 22px 1px ink square with serif x (28px); radio = 22px ring 1.5px with 8px ink bullet; slider = 3px ink fill over 1px rule with 22px ink diamond; calendar: 3px/1px rules, serif 17px days, chosen day bold italic with inset 3px ink underline; cells numbered 'No. NN' italic 13px with 24px/28px serif name; accordion/menus hairline or dotted separators. Footer: 1px strong top, 11px .12em caps; motto italic 14px; dot replaced by serif '§' 15px in accent-ink. Unused tokens declared but not referenced in css I read: --ab-eds-plate-dark, --ab-eds-paper, --ab-eds-ink-hover.

## How this was built

Script (scratch, not in repo): `/private/tmp/claude-501/-Users-walker-tracy--claude-spares-spare-hdar7H/6fa18187-e4b3-48ac-8743-f3489cd81d0d/scratchpad/m1/` (`mapping.py` is the id-by-id merge, `build.py` writes the JSON and prints the checks, `mdgen.py` writes this file). Param lists in the JSON are the union of the merged raw params; they have not been normalised into one schema per move, so a framework author should treat them as a hint list.
