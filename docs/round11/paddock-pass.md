# Round 12: Paddock Pass (key `paddock-pass`, display 45, family Graphic, order 54)

Hand-off for the registration step (task R). Everything below is paste-ready and was checked against the
current files (shapes follow the `tonal-shape` / `mainframe` entries). Style files written by task S3:
`js/aesthetics/paddock-pass.js`, `css/aesthetics/paddock-pass.css`, this file. `index.html` must load both
(not edited here). Default mode light.

## Influence -> spin

- Influence: sci-fi motorsport tickets and team liveries (ice-grey ground, a neon edge strip, squared technical
  type, micro-labels, hairline rules with ticks, a dot-matrix panel, boxed numbers, chevrons). Ideas only; none of
  its names, marks or copy.
- Spin: the brand becomes a team livery. One hi-vis strip on the leading edge is drawn from the brand's brightest
  colour (a neon companion when the palette has none), a race numeral (10..99) is generated from the brand name
  (FNV-1a, same name same number), dividers are ticket-stub perforations, spec rows are ruled hairlines.
- Board / website / deck art is code-drawn: livery panel (numeral in an ink box with chevrons, dot-matrix block,
  tick rulers, ruled spec rows, a perforated stub with angled stripe bands and a barcode). App UI draws none of it.

## What it is

- Colour: ground = a pale ice blue-grey (light: hsl(~204, 30%, 93%) with 10% of the brand hue; dark: hsl(~222, 36%, 8%)).
  Card = one step whiter (light: 60% white over the ground; dark: 4.5% white). `--ab-pp-panel2` = hover / picked row.
  Hairline `--ab-pp-rule` (decorative), edge `--ab-pp-edge` (ink pulled toward the ground until 3.1:1 on ground and
  card; fields, checkboxes, segments, switch), `--ab-pp-track` (empty progress). Hi-vis `--ab-pp-hv` + label
  `--ab-pp-hv-on` (fill only, never text on the ground). `--ab-pp-chev`: the chevron on the numeral box, hi-vis where it
  holds 3:1 on the ink box (light mode), else the canvas (dark mode, where the box is light). Primary stays the brand
  colour and only moves (same hue) when it would miss 3:1 on ground or card, or white/dark text would miss 4.6:1.
- Shape: every corner 0, no shadows. Card / panel / grouped list: 1px rule + 4px hi-vis left strip. Buttons: 48px
  rectangles, label left in 13-14px bold caps (0.06em), a CSS-drawn 7px chevron flush right; primary filled, secondary a
  1.5px ink outline. Tag / badge: boxed number (24px square, 1.5px ink edge, mono 12px bold); the highlight badge is a
  hi-vis fill with its on-colour label. Segmented control: connected squares, selected = ink fill.
- Board and deck only: the full-height 10-18px hi-vis leading strip (with a 1px ink edge), the perforation divider
  (dashed hairline with ink end ticks), the livery panel, the deck material specimens. App (.sb-ab, .sb-kit): none of
  these; a plain 1px rule.
- Fonts (all in the bundled FONTS list): heading Barlow Condensed (400;600;800, weight 800 via abWeightNear 700) with
  Saira Condensed (700), Tektur (700) and Chakra Petch (700) as picks; body Barlow (400;600;700) / Public Sans /
  IBM Plex Sans; values and badges Kode Mono (400;700), stack falls back to JetBrains Mono / system mono. Micro labels
  use the body face (11px, 600, caps, 0.1em).
- `def.copy` keys: motto, kicker, state0-2, artTitle, artNo, artRow0-2, artStub, artSector, artCap, cardNumber,
  cardNumberCap, cardStub, cardControls, stubRow0-2, btnLabel, tagLabel, segOn, segOff.
- Not copy (data derived from the brand name): the race numeral, zone `Z-n`, gate `Gn`, sector time, team name in the
  panel row.
- Variables published by `tokens()`: `--ab-muted`, `--ab-line`, `--ab-pp-panel`, `--ab-pp-panel2`, `--ab-pp-hv`,
  `--ab-pp-hv-on`, `--ab-pp-chev`, `--ab-pp-edge`, `--ab-pp-rule`, `--ab-pp-track`, `--ab-pri-hover`, `--ab-pri-press`,
  `--ab-primary-text`, `--ab-hw`. `cardFill: '--ab-pp-panel'`.
- Brief wording note: `aibAppText` drops any sentence in app text matching `\bbands?\b|hero|illustration|pattern|striation|
  texture|plate|\bdeck\b|poster|glow behind|art box|\bart\b`. The AESTHETIC_BUILD strings below keep those words out
  of every sentence except the last one of `surface`, which is meant to reach the website brief only.

## 1. js/aesthetic-meta.js: AESTHETIC_META (add after `'tonal-shape'`)

```js
  'paddock-pass': {
    family: 'graphic',
    fonts: {
      heading: { classes: ['condensed', 'techno', 'grotesk'], picks: ['Barlow Condensed', 'Saira Condensed', 'Tektur', 'Chakra Petch'] },
      body: { classes: ['grotesk', 'neo-grotesk'], picks: ['Barlow', 'Public Sans', 'IBM Plex Sans'] },
      mono: { picks: ['Kode Mono', 'DM Mono', 'Share Tech Mono'], note: 'values, numbers and badges' },
      avoid: ['serif', 'script', 'groovy', 'rounded', 'pixel', 'blackletter', 'woodtype', 'heavy', 'wide'],
      why: 'A credential reads as technical when the display face is squared and condensed or techno (Barlow Condensed at 800, Saira Condensed or Tektur at 700), the body is a plain grotesque, and every value is mono. Serifs, rounded and script faces fight the square corners and ruled rows.',
      pairings: [['Barlow Condensed', 'Barlow'], ['Saira Condensed', 'Public Sans'], ['Tektur', 'IBM Plex Sans'], ['Chakra Petch', 'Barlow']],
    },
  },
```

(Validated with the same rules as `validateAestheticMeta`: every pick and pairing is in FONTS, none sits on its own
avoid list, every class exists.)

## 2. js/aesthetic-meta.js: AESTHETIC_BUILD recipe (add after `'tonal-shape'`)

```js
  'paddock-pass': {
    cls: 'flat',
    line: 1,
    motion: { fast: 90, base: 120, slow: 180, ease: 'out' },
    surface: 'Ruled, not boxed: a pale ice ground (dark: a deep navy) with cards one step whiter (dark: one step lighter), separated by 1pt hairlines in `--ab-pp-rule`. Every corner is 0 and nothing casts a shadow. A card has a 1pt hairline and a 4pt hi-vis strip down its left edge (`--ab-pp-hv`, a fill only: the label on it is `--ab-pp-hv-on` and it is never text on the ground). Rows are ruled: a 1pt hairline under each, the label on the left in 11pt semibold caps with 0.1em tracking in `--muted`, the value on the right in mono. Fields, checkboxes, segments and the switch track carry a 1pt (1.5pt for boxes) `--ab-pp-edge` edge. Buttons are 48pt rectangles: the label left in bold caps, a small 7pt chevron flush right; the main one is filled `--primary`, the secondary is a 1.5pt `--ink` outline. Tags and badges are boxed numbers: a 24pt square with a 1.5pt `--ink` edge and a mono value; the one highlight badge is filled `--ab-pp-hv` with `--ab-pp-hv-on` text. App screens carry no art, dot-matrix or texture: the livery panel, the perforation divider and the angled stripe bands are board and website only.',
    pressText: 'The main button steps one shade darker in light mode (lighter in dark) over 90 ms ease-out, with no scale, travel or shadow; the secondary fills with `--ab-pp-panel2`. A picked row takes `--ab-pp-panel2` and a 4pt hi-vis strip on its left. Keyboard focus is a 2pt `--ink` ring with a 2pt offset.',
    states: {
      pressed: ['Fill steps toward black (light) or white (dark): 14% hover, 26% pressed', 'A 90 ms ease-out colour step; no scale, travel or shadow. The secondary fills with `--ab-pp-panel2`.'],
      disabled: ['`--muted` label over the fill veiled with the canvas', 'Keeps its square shape and chevron; no hover or press response.'],
      error: ['`--error`', '1pt `--error` edge plus a 4pt `--error` bar inset on the field\'s left edge and a 13pt helper line in `--error` under it. Never colour alone.'],
      empty: ['`--ink` headline, `--muted` copy', 'A 1.5pt `--ink` outlined square holding one outline icon, a headline, one line of copy and one rectangular action.'],
    },
    reduceMotion: 'Colour steps swap at once; nothing else moves.',
    increaseContrast: 'Hairlines and field edges take 2pt `--ink`, `--muted` text becomes `--ink`; the 4pt card strip stays.',
    icons: 'Stroke 1.75pt, square caps and miter joins, 0pt corners; outline at rest. A list-row or empty-state icon sits in a 1.5pt `--ink` outlined square; the selected tab draws a 3pt `--ink` bar above its glyph and sets the label in bold.',
    iconWeight: 'regular',
    appIcon: 'Full-bleed `{canvas}` tile with a boxed two-digit race numeral in the heading face: an `{ink}` square with the digits in `{canvas}`, a `{primary}` chevron beside it and a 12pt strip in `{accent}` down the tile\'s left edge; flat, square, no gradient, no shadow.',
    fixedInks: [
      { token: '--hivis', light: '--ab-pp-hv', on: '--ab-pp-hv-on', job: 'Hi-vis: the brightest of the palette (a neon companion when it has none) as the 4pt card strip and the one highlight badge; a fill only, its label is the on-colour, never text on the ground.', decorativeOnly: false },
    ],
  },
```

If the brief's Colors table treats a `decorativeOnly: false` fixed ink as a text candidate, flip it to `true`
(the strip is its main use; the badge label already uses `--ab-pp-hv-on`).

## 3. js/patterns/fit.js: suite (add after the `'tonal-shape'` suite)

Lead `halftone` ("Dot matrix", the dot-matrix panel of the credential; square dots, mono, tone 0.7, safe at cover size,
no hazard stripes / targets / reef colour / noise band). Free of every other suite's lead (checked against the 41
suites in the file now; Isogrid and the other Round 12 styles are not in it yet, so the registration step still has to
confirm). **Second choice: `burst`** (swap the first entry for
`['burst', 'Pit-lane beam', 'mono', { rays: 24, layers: 1, bend: 0, beads: 0, origin: 'corner', grain: 0 }, 0.55]` and move
the halftone entry to second place). Six distinct families, all registered, colourways `brand` / `mono` only.

```js
    'paddock-pass': [
      ['halftone', 'Dot matrix', 'mono', { cell: 2.4, levels: 3, shape: 'square', angle: 0, field: 'ridges', duo: false, grain: 0 }, 0.7],
      ['chevron', 'Pit-lane chevrons', 'brand', { bands: 8, slope: 38, mirror: 'x', rhythm: 'even', colors: 'three', grain: 0 }, 0.85],
      ['weave', 'Livery stripes', 'brand', { bands: 7, rhythm: 'pinstripe', skew: 0.55, gap: 0.2, stripe: 1.2, spark: true, grain: 0 }, 0.85],
      ['gradpanes', 'Panel set', 'brand', { rows: 3, cols: 5, gap: 0.8, steps: 0, radius: 0, grain: 0 }, 0.8],
      ['modulargrid', 'Number blocks', 'mono', { cols: 10, style: 'filled', merge: 0.3, gap: 0.6, empty: 0.2, grain: 0 }, 0.7],
      ['pixelquilt', 'Chequer flag', 'mono', { px: 1.2, block: 6, motifs: 'geometric', big: 0.2, grain: 0 }, 0.7],
    ],
```

Param keys and select values were read from the family definitions (halftone shape `square`, chevron mirror `x`,
weave rhythm `pinstripe`, pixelquilt motifs `geometric`). Not rendered here (no browser): run the Patterns suite wall once.

## 4. js/onboarding.js: STYLE_TABLE row (after the `tonal-shape` row)

```js
    { key: 'paddock-pass', loud: 0.6, kinds: 'website product app', hue: 205 },
```

## 5. js/logo-start.js: MOOD_OF value

Add to the `MOOD_OF` object (same line as `'tonal-shape': 'calm'`):

```js
'paddock-pass': 'tech'
```

## 6. css/aesthetic-board.css: sidebar motif (greyscale; after the `tonal-shape` motif rules)

Also append `, [data-motif="paddock-pass"]` to the end of the `:not(...)` key list on **both** default
`.ae-motif:not(...)::before` / `::after` rules (lines 599 and 600), as for every earlier style.
The motif is a hi-vis strip beside a boxed numeral, then a tick-marked rule over a dashed line.

```css
[data-motif="paddock-pass"]::before { left: 0; top: 2px; width: 32px; height: 26px; background: linear-gradient(#999, #999) 0 0 / 6px 100% no-repeat, linear-gradient(#555, #555) 10px 0 / 22px 100% no-repeat; }
[data-motif="paddock-pass"]::after { left: 40px; top: 4px; width: 34px; height: 22px; background: repeating-linear-gradient(90deg, #777 0 1px, transparent 1px 4px) 0 0 / 100% 7px no-repeat, linear-gradient(#999, #999) 0 9px / 100% 2px no-repeat, repeating-linear-gradient(90deg, #bbb 0 4px, transparent 4px 8px) 0 16px / 100% 2px no-repeat; }
```

## Other registration points

- Style count increments by one for this style (resolved by R together with the other Round 12 styles); display number
  45 comes from plain counting at order 54.
- Showcase favourite: not requested here; `js/share.js` entry and a `classic/` variant: none.
- Deck: `deck.materialArt` (three specimens: boxed race numeral on a strip card, perforated stub with ruled spec rows,
  button + boxed badges + segmented control). Board: no `panels` hook; the default rows are restyled as ruled spec rows.
- `slideShape: 'geometric'`, `layout: { hero: 'split', palette: 'strips', sections: 'two-col' }`, `highlight: 'ink'`,
  `type: { ui: 'sans', label: 'sans' }`, states kind `button`.

## How its app UI differs (one line per component)

| Component | Paddock Pass | micrographics | cyber-hud |
|---|---|---|---|
| Ground | pale ice (dark: navy); cards a step whiter, hairline-ruled | the brand's own paper/ink; cards transparent | near-black with neon edges |
| Card | filled square, 1px rule, 4px hi-vis left strip; no marks, no glow | 1px ink outline, no fill, crop marks and a tiny caption | chamfered panel drawn from ::before / ::after edges |
| Button | 48px rectangle, caps label left, CSS chevron right; outline secondary | 9.5px mono, 0.24em tracking, crop marks, ink-invert hover | chamfered neon key, brightness hover |
| Tag / badge | 24px boxed mono number (12px bold); highlight = hi-vis fill | 8px mono tag, 1px ink outline, dashed when "consider" | chamfered chip |
| Row | hairline under, micro-caps label left, mono value right | microtype annotations around one huge figure | readout lines inside a panel |
| Field | 1px edge box, mono value, 2px ink ring, 4px error bar | mono field, underline focus | neon-edged field |
| Type | squared condensed / techno heading + grotesque + mono values | heavy headline + 8px mono microtype | wide techno (Orbitron-like) |

Against `transit-wayfinding` (pictogram badges, route lines, sign-green panels) and `retro-futurist` (glowing mission
panels, pill keys) it shares only the square-ish geometry; and against `mainframe` (the closest neighbour: grey layers,
filled fields with a bottom rule, Plex, pill tags) it differs by ice/navy ground, boxed number badges, the 4px card
strip, outlined-box fields, a condensed heading face and a chevron on every button.

## Verification (task S3; no browser or GUI was opened)

- `node --check js/aesthetics/paddock-pass.js`: OK. CSS braces 204 / 204, parens balanced, max nesting 2.
- The JS was run in a Node vm against the real `color.js`, `slMix`, `abAlpha` with the `boardTokens` maths copied in:
  `canvas`, `printPrimary`, `tokens`, `art` (the SVG parses as well-formed XML) and `deck.materialArt` run without throwing
  for four sample palettes in light and dark.
- Contrast (WCAG ratios, same maths the style uses):

| Sample | Mode | ink / ground | ink / card | muted / ground | muted / card | muted / row | edge / ground | edge / card | on-primary / primary | primary / ground | primary / card | hv-on / hv |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| A blue, teal, yellow accent | light | 15.32 | 16.83 | 4.79 | 5.26 | 4.67 | 4.44 | 4.88 | 5.87 | 5.02 | 5.52 | 11.53 |
| A | dark | 16.71 | 15.10 | 6.48 | 5.85 | 5.00 | 6.48 | 5.85 | 5.66 | 3.33 | 3.01 | 11.53 |
| C yellow primary | light | 16.94 | 18.37 | 4.90 | 5.31 | 4.69 | 4.90 | 5.31 | 5.19 | 3.10 | 3.36 | 11.53 |
| C | dark | 18.28 | 16.49 | 7.10 | 6.41 | 5.43 | 7.10 | 6.41 | 11.53 | 11.44 | 10.32 | 11.53 |

  Across four palettes x two modes the minimums were: ink >= 12.5 on ground, card and row; muted >= 4.67; edge >= 4.12
  (light, warm palette) and >= 5.6 (dark); on-primary >= 5.19; primary >= 3.01 on ground and card (the printed primary
  moves, same hue, when it would not hold 3:1; yellow became #a38500 in light); hi-vis label >= 9.4. Numeral digits
  (canvas on the ink box) >= 13.67. Ink on the chevron / hi-vis strip edge is not text.
- The hi-vis colour is a fill; no rule sets text in it. Empty progress track is decorative; the fill (primary) holds >= 3:1 on
  the ground and the track carries a 1px `--ab-pp-edge` inset edge.
- Not run: headless render of the board, Compare, deck, Built screens and the Patterns suite; `node tests/run.js`;
  the real brief (`buildAiBrief`). The app-UI rules in the CSS follow the shared kit selectors (`.sb-k-*`) but have not
  been looked at in a rendered kit.
