# Toy Press (`toy-press`, order 47, tactile, light) — registration hand-off

Files owned by this task: `js/aesthetics/toy-press.js`, `css/aesthetics/toy-press.css`, this file.
`index.html` already loads the two files. Everything below is for task R to paste; shapes copy the
`data-pebble` / `clay` entries.

## 1. `js/aesthetic-meta.js` — `AESTHETIC_META` (fonts entry)

Insert after the `'data-pebble'` entry (or anywhere in the object). Every pick and class exists in
`FONTS` / `FONT_CLASSES`; no pick or pairing face is in its own `avoid` list.

```js
  'toy-press': {
    family: 'tactile',
    fonts: {
      heading: { classes: ['rounded'], picks: ['Fredoka', 'Baloo 2'] },
      body: { classes: ['humanist', 'rounded'], picks: ['Nunito Sans', 'Rubik'] },
      avoid: ['serif', 'mono', 'condensed', 'techno', 'pixel', 'blackletter', 'script', 'deco', 'groovy'],
      why: 'Chunky pressable keys need a rounded display face with soft terminals (Fredoka at 700, Baloo 2 at 800) over a friendly humanist or rounded text face, so labels stay easy and never read as childish.',
      pairings: [['Fredoka', 'Nunito Sans'], ['Baloo 2', 'Nunito Sans'], ['Fredoka', 'Rubik'], ['Baloo 2', 'Rubik']],
    },
  },
```

## 2. `js/aesthetic-meta.js` — `AESTHETIC_BUILD` recipe

Insert after the `'data-pebble'` entry. Class `hard` (offset shadow + travel on press) is the closest
recipe; the lip colour is NOT the ink, so the shadow colour is described in `surface` and carried by
the two `fixedInks` rows (`--lip`, `--edge`). Both resolve from `tokens()` keys of the same name.

```js
  'toy-press': {
    cls: 'hard',
    line: 2,
    sh: { x: 0, y: 4, blur: 0 }, lift: { x: 0, y: 0 }, press: { dx: 0, dy: 4, ms: 80 },
    motion: { fast: 80, base: 140, slow: 220, ease: 'out' },
    surface: 'A flat toy-keycap kit. Every pressable (main key, secondary key, icon key, segment, checkbox, switch track and knob, tab, a pressed list row) sits on a solid lip of its own darker shade: `box-shadow: 0 4px 0 <lip>` under 52pt keys and 3px under small controls; the lip is the face shaded darker (HSL lightness down 9 to 24 points, same hue, never black, never blurred, one depth per size everywhere). The main key\'s lip is `--lip` (the primary shaded); secondary keys, fields, boxes and the switch track use `--edge` as their 2px border and lip. Cards and list rows are flat trays: a 2px `--line` border with a 4px bottom border, no shadow. Corners 16pt (14pt for fields and small keys, pills for badges); no gradient anywhere. App screens carry no keycap or toy-block art; that is for the board and website.',
    pressText: 'Pressed = the control drops by its lip depth (4pt keys, 3pt small controls) while the lip collapses to 0: `transform: translateY(4px); box-shadow: 0 0 0 <lip>`, 80 ms ease-out; release returns it. Hover only lightens the face (`--pri-hover` on the main key, `--surface-2` on a secondary key) and never moves it. A switch knob drops 3pt while pressed and slides 24pt on change. No bounce. Keyboard focus is a 3pt ring in the focus colour, 3pt offset, outside the lip.',
    states: {
      pressed: ['Face unchanged; the key drops 4pt (3pt small) and its lip collapses to 0', '80 ms ease-out; a secondary key also takes `--surface-2`. No other colour change.'],
      disabled: ['A flat face (ink 10% into the canvas, 14% in dark), `--muted` label, a lip of that face shaded darker', 'Keeps its lip, never moves, ignores hover, press and focus.'],
    },
    fixedInks: [
      { token: '--lip', light: '--ab-lip', job: 'The lip under the main key, the progress highlight\'s base and the highlight word\'s text lip: the brand primary shaded darker (same hue, lightness down 9 to 24 points, never black). Use it only as a hard 0-blur offset shadow or text-shadow, never as a fill or text colour.', decorativeOnly: false },
      { token: '--edge', light: '--ab-edge', job: 'The 2px border and the lip of secondary keys, small keys, boxes and the switch track, and the field border: the ink mixed into the canvas until it holds 3:1 against the canvas and the card.', decorativeOnly: false },
    ],
    icons: 'Stroke 2.25pt, round caps and joins, chunky 2pt-rounded corners; outline at rest, solid when selected. In a list row a glyph sits in a 12pt-rounded tile tinted `--sec-tint`.',
    iconWeight: 'bold',
    appIcon: 'Full-bleed `{primary}` tile with one chunky keycap (a rounded square in `{primary}` over a darker same-hue lip) carrying the brand initial in the heading face in `{onPrimary}`; flat, no gradient, no shadow blur.',
  },
```

## 3. `js/patterns/fit.js` — suite (six families, each distinct)

Insert after the `'data-pebble'` suite. The lead (`bloomgrid`) is one of the families the file lists as
unclaimed (no band or strip aesthetic leads with it); the other five are used mid-suite elsewhere, so
none repeats within this suite. All colorways are `brand`.

```js
    'toy-press': [
      ['bloomgrid', 'Pixel bloom', 'brand', { px: 3, levels: 4, rings: 4, calm: 0.5, dither: false }],
      ['gradpanes', 'Pressed panes', 'brand', { rows: 3, cols: 4, gap: 1.6, radius: 3.4, steps: 0, grain: 0 }],
      ['modulargrid', 'Block grid', 'brand', { cols: 8, merge: 1, gap: 1.6, empty: 0 }],
      ['tokens', 'Chunky capsules', 'brand', { cell: 10, link: 0.3, density: 1, fill: 'mixed', grain: 0 }],
      ['glyphgrid', 'Key caps', 'brand', { glyphs: 'blocks', cell: 3.8, bands: 5, duo: true }],
      ['pixelquilt', 'Pixel quilt', 'brand', { px: 1.2, block: 6, motifs: 'geometric', big: 0.3 }],
    ],
```

## 4. `js/onboarding.js` — `STYLE_TABLE` row

Insert after the `'data-pebble'` row (a playful, medium-loud app and product look; signature hue turquoise).

```js
    { key: 'toy-press', loud: 0.6, kinds: 'app product website', hue: 192 },
```

## 5. `js/logo-start.js` — `MOOD_OF` value

Add to the `craft` group (second line of `MOOD_OF`), before `'data-pebble': 'calm'`:

```js
'toy-press': 'craft',
```

## 6. `css/aesthetic-board.css` — sidebar motif rules (greyscale)

Add after the `[data-motif="data-pebble"]` rules, and add `[data-motif="toy-press"]` to both
`.ae-motif:not(...)` key lists so the neutral fallback does not leak into it. A keycap on its lip,
and a smaller one beside it.

```css
[data-motif="toy-press"]::before { left: 0; top: 1px; width: 34px; height: 22px; border-radius: 8px; background: #a8a6a1; box-shadow: 0 5px 0 #6f6d69; }
[data-motif="toy-press"]::after { left: 44px; top: 6px; width: 24px; height: 17px; border-radius: 6px; background: #d4d2cd; box-shadow: 0 4px 0 #9a9893; }
```

## Notes for R

- Style count: Toy Press is the first of the four new styles in `index.html` order; the list shows plain
  counting, so it displays as 38 (after Data Pebble 37).
- No `showcase.js` / `share.js` / `classic/` entry.
- Specimen copy keys (all in `def.copy`): `motto`, `kicker`, `state0-2`, `matKey`, `matKeyCap`,
  `matSecond`, `matSecondCap`, `matCard`, `matCardCap`, `matBadge`, `matPressed`.
- Tokens the style adds (extras, printed in the brief's token table through `fixedInks`): `--ab-lip`,
  `--ab-edge`; the rest are board-only (`--ab-surface`, `--ab-surface-2`, `--ab-edge-lip`, `--ab-pri-hi`,
  `--ab-pri-hover`, `--ab-mid`, `--ab-mid-lip`, `--ab-sec-lip`, `--ab-acc-lip`, `--ab-ink-lip`,
  `--ab-knob`, `--ab-knob-lip`, `--ab-track-off`, `--ab-track`, `--ab-dis-face`, `--ab-dis-lip`,
  `--ab-tag-bg`, `--ab-hl`, `--ab-hl-lip`, `--ab-hl-mark`, `--ab-hw`).
- Brief limitation: build class `hard` makes the generic brief print `--shadow` as the ink and a
  Swift recipe with an ink outline. The `surface` and `pressText` text and the `--lip` / `--edge`
  rows say the truth; a `build.shadowToken` hook in `js/ai-brief.js` would remove the contradiction.
