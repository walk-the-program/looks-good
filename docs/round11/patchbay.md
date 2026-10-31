# Round 12: Patchbay (key `patchbay`, display 44, family Digital, order 53, default mode dark)

Hand-off for the registration step. Everything below is paste-ready and was checked against the current files
(shapes follow the tonal-shape / live-tile entries). Style files written by task S2:
`js/aesthetics/patchbay.js`, `css/aesthetics/patchbay.css`, this file. `index.html` must load both (script after
the other aesthetics, link in the aesthetics CSS group).

## Influence -> spin

- Influence: the dark node-graph workflow editors of current creative tools (ideas only: near-black canvas, faint dot grid, dark rounded node cards with hairline borders, coloured port dots on smooth wires, small multiplayer name tags, floating pill toolbars, one white pill action beside grey ones, mono read-outs).
- Spin: a modular-synth patch bay. The brand colours are the cables and ports; status dots and name-tag chips carry the palette; ONE white pill (light mode: an ink pill, `ctaFill: 'ink'`) is the main action; numbers are Geist Mono.
- Art split: the board / deck / website art is a code-drawn node graph (four modules spelling the brand initial and name, bezier cables in the three brand colours, a soft primary glow behind the output module, a faint dot grid, two name tags with cursors, pill toolbars, a mono read-out). The app UI (UI kit and the five phone screens) draws none of it: no dot grid, glow, wires or texture; only dark rounded cards, title rows with a status dot, pill toolbars, the ink pill, grey pills, name-tag chips and mono numerals.

## What it is

- Colour. Ground: near-black neutral (dark: lightness 6.5%, saturation capped at 10%) or pale grey (light: 94.5%, saturation capped at 8%), hue from the brand neutral. Card: ink 5.5% over the ground (dark) or white (light). Inset (fields, toolbar track): ink 6% / 4.5% over the card. Grey (grey pill, selected segment, icon button): ink 13% / 9% over the card; hover 19% / 14%. Hairline (decorative card edge): ink 13% / 12% over the ground. Edge (3:1 control edge: field, checkbox, selected-segment ring, unfilled slider track, progress track edge): the ink pulled toward the card until it holds 3.1:1 on ground, card and inset. Port colours: primary (via `printPrimary`), secondary, accent, each pushed toward black or white the least it can until it holds 3.1:1 on ground, card and inset AND a white / near-black label on it holds 4.5:1.
- Main action: ink pill (`ctaFill: 'ink'`, canvas label), hover `--ab-pb-ink-hover` (ink 86% over the ground), pressed `--ab-pb-ink-press` (74%) and scale 0.98 in 120 ms. Secondary: grey pill, no outline. Disabled: flat grey pill, muted label.
- Shape: modules 14px, fields / icon tiles 10px, pills and the pill toolbar (segmented control) 999px, name tags `7px 7px 7px 2px` (a squared bottom-left corner, like a cursor label), status dots 8px. No shadows, no gradients, no blur anywhere in the app.
- Fonts: headings and body Geist (bundled 400 and 600; headings use 600, tight tracking), numerals / labels / read-outs Geist Mono (bundled 400 / 500 / 600). The mono face is named directly in the CSS (`--pb-mono`, with a system mono fallback), as mainframe does with IBM Plex Mono.
- `def.copy` keys: motto, kicker, state0-2, nodeIn, nodeMix, nodeName, nodeOut, paramA, paramB, tag1, tag2, barA, barB, pillMain, pillSecondary, readout.
- Variables the style publishes (`tokens()`, placeholder form in the materials list): `--ab-pb-card` (pbCard), `--ab-pb-inset` (pbInset), `--ab-pb-grey` / `--ab-pb-grey-hi` (pbGrey / pbGreyHi), `--ab-pb-hair` (pbHair), `--ab-pb-edge` (pbEdge), `--ab-pb-pri` / `--ab-pb-on-pri`, `--ab-pb-sec` / `--ab-pb-on-sec`, `--ab-pb-acc` / `--ab-pb-on-acc`, `--ab-pb-ink-hover` / `--ab-pb-ink-press`, `--ab-hw` (heading weight), plus overrides of `--ab-muted` and `--ab-line`.
- Brief wording note: `aibAppText` drops any sentence in app text that contains hero, art, pattern, texture, illustration, band, deck or poster. The AESTHETIC_BUILD strings below avoid those words on purpose; keep it so. `aibPrimaryBarred` stays false (the primary role's "never" does not match its regex): the primary still draws the switch "on", slider / progress fill, checked box, focus ring and field focus edge; only the main action is ink.

## 1. js/aesthetic-meta.js: AESTHETIC_META (add after `'tonal-shape'`)

```js
  'patchbay': {
    family: 'digital',
    fonts: {
      heading: { classes: ['neo-grotesk', 'grotesk'], picks: ['Geist', 'Inter', 'Instrument Sans', 'Space Grotesk'] },
      body: { classes: ['neo-grotesk', 'humanist'], picks: ['Geist', 'Inter', 'Onest', 'Figtree'] },
      mono: { picks: ['Geist Mono', 'JetBrains Mono', 'IBM Plex Mono'], note: 'numerals, counts, labels and read-outs, with tabular figures' },
      avoid: ['serif', 'script', 'hand', 'blackletter', 'groovy', 'pixel', 'deco', 'woodtype', 'slab', 'heavy', 'wide', 'soft-serif'],
      why: 'A dark tool interface is all small type on cards, so an even neo-grotesque (Geist, 600 for titles over 400 for body) does the work and a matching mono (Geist Mono) carries numerals, counts and read-outs. Nothing scripted, serif or display: the colour is in the dots, tags and cables, not the letters. Geist publishes 400 and 600 here, so headings use 600.',
      pairings: [['Geist', 'Geist'], ['Inter', 'Inter'], ['Instrument Sans', 'Geist'], ['Space Grotesk', 'Inter']],
    },
  },
```

## 2. js/aesthetic-meta.js: AESTHETIC_BUILD recipe (add after `'tonal-shape'`)

```js
  'patchbay': {
    cls: 'flat',
    line: 1,
    press: { opacity: 1, scale: 0.98, ms: 120 },
    motion: { fast: 100, base: 140, slow: 220, ease: 'out' },
    surface: 'Dark rounded modules instead of shadows: the canvas is a near-black neutral (light mode: a pale grey) and every card, list group, sheet and menu is a step above it (dark: the `--ink` at 5.5% over the canvas, light: white) with a 1pt `--ab-pb-hair` edge and a 14pt corner. Fields and the track of a progress bar sit one step further in (`--ab-pb-inset`) with a 1pt `--ab-pb-edge` edge (a 3:1 line) and a 10pt corner. A card starts with a small title row: an 8pt status dot in one of the three port colours (`--ab-pb-pri`, `--ab-pb-sec`, `--ab-pb-acc`), then a 17pt 600 title. Controls are pills. A toolbar or segmented control is a pill track (`--ab-pb-inset`, 1pt hair edge) whose selected segment is a `--ab-pb-grey` pill with a 1pt `--ab-pb-edge` ring and an `--ink` label; the others set their label in `--muted`. The tag component (badge, count, status) is a name tag: a coloured chip with a 7pt corner and a 2pt bottom-left corner, a 600 mono label in the matching on-colour. Numerals, counts and trailing values are set in the mono face with tabular figures. No gradient, glow, blur, grid or drawn wires appear anywhere in the app; the shadow is `none` everywhere.',
    pressText: 'The main pill steps from `--ink` to `--ab-pb-ink-press` and scales to 0.98 over 120 ms (ease-out) and back on release; a grey pill steps from `--ab-pb-grey` to `--ab-pb-grey-hi` and scales the same way. There is no veil and no shadow. A focused field draws its edge and a 1pt ring in `--ab-pb-pri` (a 2pt line in all); a keyboard-focused control shows the 2pt focus ring in the primary with a 2pt offset.',
    accentOverride: { light: '--ab-pb-acc', on: '--ab-pb-on-acc', note: 'the brand accent pushed (toward black or white) until it holds 3:1 on the canvas, a card and a field and a label on it holds 4.5:1; it is the third port colour and the loud name tag, never text or the main action' },
    secondaryOverride: { light: '--ab-pb-sec', on: '--ab-pb-on-sec', note: 'the brand secondary pushed until it holds 3:1 on the canvas, a card and a field and a label on it holds 4.5:1; it is the second port colour and a name-tag fill' },
    fixedInks: [
      { token: '--card', light: '--ab-pb-card', job: 'Card, list group, sheet and menu fill: a step above the canvas (dark: ink 5.5% over it; light: white).', decorativeOnly: false },
      { token: '--inset', light: '--ab-pb-inset', job: 'Field, toolbar track and progress track fill: one step inside a card.', decorativeOnly: false },
      { token: '--grey', light: '--ab-pb-grey', job: 'Grey pill (secondary action, icon button), selected segment and selected row fill. Its label is `--ink`.', decorativeOnly: false },
      { token: '--edge', light: '--ab-pb-edge', job: 'The 3:1 line: a field, checkbox, radio and switch edge, the selected-segment ring, the unfilled slider track and the progress track edge.', decorativeOnly: false },
      { token: '--hair', light: '--ab-pb-hair', job: 'The 1pt card edge and dividers. Decorative: it never carries meaning alone.', decorativeOnly: true },
    ],
    states: {
      pressed: ['Main pill `--ab-pb-ink-press`; grey pill `--ab-pb-grey-hi`', 'Scales to 0.98 and back, 120 ms ease-out; no veil, no shadow.'],
      disabled: ['`--ab-pb-grey` fill, `--muted` label', 'Keeps its pill shape; no press response.'],
      empty: ['`--ink` headline, `--muted` copy', 'A 56pt rounded tile in `--ab-pb-grey` holding one outline icon, a headline, one line of copy and one pill action.'],
      error: ['`--error` edge on the field', '1pt edge and a 1pt ring in the error colour, plus a 13pt helper line in the error colour under the field. Never colour alone.'],
    },
    reduceMotion: 'The press scale and the colour steps swap at once: no transition, no scale.',
    increaseContrast: 'Fields, segments and the card edge take a 1.5pt `--ink` line, `--muted` text becomes `--ink`, name-tag chips keep their fill and add a 1pt `--ink` edge.',
    icons: 'Stroke 1.5pt, round caps and joins, outline at rest. The selected tab sits on a 56 x 32pt `--ab-pb-grey` pill with a 1pt `--ab-pb-edge` ring and its glyph in `--ink`; a list-row icon sits in a 32pt rounded tile in `--ab-pb-grey`.',
    iconWeight: 'regular',
    appIcon: '`{canvas}` tile with one rounded 14pt card holding the brand initial in the heading face in `{ink}`, a `{primary}` port dot on its right edge and one `{secondary}` cable curving away from it; flat, no glow, no gradient, no shadow.',
  },
```

## 3. js/patterns/fit.js: suite (add after the `'tonal-shape'` suite)

Fit lead: **`waves`** (not the lead of any suite in js/patterns/fit.js today: current leads are listed in the
header of that file and docs/patterns.md; the recent styles took `panels`, `arcrise`, `totem`, `bloomgrid`, and
`cutup` went to wpa-screenprint). It is on the header's free-for-a-new-lead list and obeys the fit.js cover rule
(smooth, no hazard, no target, no noise band): "Solarised waves" read as rows of combed cable strands.
**Second choice: `prismpix`** ("Pixel aurora": pixel streams over a dark dot-grid field, which is the board art's
dot grid and glow), also on the free list. If a later step finds a clash on `waves`, move the `prismpix` entry to
the top of the suite (it is already entry 2). Isogrid will take one more lead; neither of these is a likely pick for it.
Colourways are `brand` / `duotone` only, so nothing outside the palette is invented. Every param name and value is
inside the family's min / max (checked against js/patterns/families/organic2.js, pixel2.js and grid.js); the six
families are distinct and all exist. Not rendered in the Patterns view (no browser was allowed for this task).

```js
    'patchbay': [
      ['waves', 'Cable strands', 'brand', { rows: 5, crests: 2.5, curl: 1.4, strands: 12, drops: 0, grain: 0.1 }, 0.7],
      ['prismpix', 'Dot-grid streams', 'brand', { px: 2.2, streams: 4, glow: 0.8, dots: true, grain: 0.05 }, 0.7],
      ['relief', 'Routed traces', 'duotone', { cols: 4, traces: 9, blocks: 4, trace: 1, grain: 0 }, 0.8],
      ['tokens', 'Port capsules', 'brand', { cell: 7.5, link: 0.45, density: 0.7, fill: 'open', grain: 0 }, 0.8],
      ['gradpanes', 'Module panes', 'brand', { rows: 3, cols: 4, gap: 1.6, steps: 0, radius: 3.6, grain: 0 }, 0.75],
      ['modulargrid', 'Rack tiles', 'brand', { cols: 7, style: 'filled', merge: 0.4, gap: 1.4, empty: 0.16, grain: 0 }, 0.8],
    ],
```

## 4. js/onboarding.js: STYLE_TABLE row (after the `tonal-shape` / `live-tile` rows)

```js
    { key: 'patchbay', loud: 0.35, kinds: 'app product website', hue: 245 },
```

## 5. js/logo-start.js: MOOD_OF value

Add to the `MOOD_OF` object (same line as `'live-tile': 'tech', 'mainframe': 'tech'`):

```js
'patchbay': 'tech'
```

## 6. css/aesthetic-board.css: sidebar motif (greyscale; after the `mainframe` motif rules)

Also append `, [data-motif="patchbay"]` to the end of the `:not(...)` key list on **both** default
`.ae-motif:not(...)::before` / `::after` rules (lines 599 and 600), as for every earlier style.

```css
[data-motif="patchbay"]::before { left: 0; top: 1px; width: 30px; height: 28px; background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 28'%3E%3Crect x='1.5' y='3' width='24' height='22' rx='7' fill='none' stroke='%23888' stroke-width='3'/%3E%3Ccircle cx='26' cy='14' r='3.5' fill='%23888'/%3E%3C/svg%3E") center / contain no-repeat; }
[data-motif="patchbay"]::after { left: 36px; top: 4px; width: 40px; height: 22px; background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 22'%3E%3Cpath d='M3 18C19 18 21 4 37 4' fill='none' stroke='%23aaa' stroke-width='3' stroke-linecap='round'/%3E%3Ccircle cx='3' cy='18' r='3' fill='%23888'/%3E%3Ccircle cx='37' cy='4' r='3' fill='%23888'/%3E%3C/svg%3E") center / contain no-repeat; }
```

## Other registration points (as for tonal-shape / live-tile)

- Style count 41 -> 45 or whatever the Round 12 total is (this style is one of four siblings plus Isogrid); display number 44 comes from plain counting.
- `index.html`: `<script src="js/aesthetics/patchbay.js">` after the other aesthetics and `<link>` for `css/aesthetics/patchbay.css`.
- No showcase favourite, no `js/share.js` entry, no `classic/` variant, no `panels.list` / `deck.materialArt` hook (the board list rows are styled by CSS: port-dot number column, name-tag status, mono percent).
- Fonts: Geist and Geist Mono are already in `FONTS` and `fonts/fonts.css`; no new font, no network request.

## Verification (task S2)

No browser was allowed, so nothing here was rendered in the app. What was run:

- `node --check js/aesthetics/patchbay.js`: passes. CSS braces balanced (219 open, 219 close, parentheses balanced).
- A node harness loaded js/color.js, `slMix` and the style, built `canvas()`, `printPrimary()` and `tokens()` for 7 palettes (indigo, yellow, black, white, red, teal, grey) in light and dark, and ran `art()` with a long brand name containing `&`, `'` and `<`: no NaN / undefined, names escaped once, every `abCopy` key resolves.
- The art SVG alone was rasterised once (macOS Quick Look, with the style's CSS inlined) in light and dark: layout, cables, ports, tags, toolbars and glow read as intended.
- Contrast, across all 7 palettes x 2 modes (worst case): ink on ground / card / grey pill >= 13.7 / 15.4 / 10.6 (8.7 on the hovered grey pill); muted >= 5.38 on the ground, 6.10 card, 5.60 inset, 5.12 grey, 4.63 hovered grey; canvas label on the ink pill >= 13.7 (hover 9.0, pressed 6.2); each port colour on ground / card / inset >= 3.14 / 3.57 / 3.12 with its label >= 4.54; the 3:1 edge on ground / card / inset / grey >= 3.21 / 3.60 / 3.30 / 3.02.
