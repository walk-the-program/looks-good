# Live Tile (`live-tile`, number 38 in the list, family digital, `order: 48`): registration hand-off

Task B wrote `js/aesthetics/live-tile.js` and `css/aesthetics/live-tile.css`. Task R applies the six
snippets below, copied from the shapes of the `data-pebble` entries. Nothing in these snippets names a
company or product. `index.html` already loads both files.

Notes for R:

- The style registers through `registerAesthetic`, so the board, Compare all, the deck, Built and the brief
  already render it; only the hand-off points below are missing (the console prints
  "no entry in AESTHETIC_META / AESTHETIC_BUILD" until they land).
- Fonts (decided in packet rev 2): the bundle has Lato at 400 and 700 only (js/data.js `weights: '400;700'`, two
  static files) and Figtree at 400 and 600 only; Inter Tight is the only recommended face with a real 300. So the
  first pairing is Inter Tight (heading) with Lato (body): the panorama title, pivot headings and tile counts render a
  true light 300. Lato and Figtree stay as alternatives and render their lightest bundled weight (400).
  `tokens()` asks for `abWeightNear(headingFont, 300)`, so every face gets its nearest published weight.
- The flat recipe in `aibRecipe` ignores `press.scale` for SwiftUI (it emits `.opacity` and `.offset` only),
  so the SwiftUI button style will not show the 0.97 tilt; the CSS and the text in `pressText` do.

## 1. AESTHETIC_META (js/aesthetic-meta.js, fonts entry, after `'data-pebble'`)

```js
  'live-tile': {
    family: 'digital',
    fonts: {
      heading: { classes: ['neo-grotesk', 'humanist'], picks: ['Inter Tight', 'Lato', 'Figtree'] },
      body: { classes: ['humanist', 'neo-grotesk'], picks: ['Lato', 'Figtree', 'Inter Tight'] },
      avoid: ['serif', 'script', 'slab', 'heavy', 'wide', 'condensed', 'groovy', 'deco', 'pixel', 'blackletter', 'hand'],
      why: 'Tile labels, huge panorama titles and pivot headings are all type, so a light humanist or neo-grotesk sans does the whole job. Set the headings in the lightest weight the face has: Inter Tight is the only recommended face with a true 300, so it leads; Lato and Figtree fall back to 400.',
      pairings: [['Inter Tight', 'Lato'], ['Lato', 'Lato'], ['Figtree', 'Figtree'], ['Inter Tight', 'Figtree']],
    },
  },
```

## 2. AESTHETIC_BUILD recipe (js/aesthetic-meta.js, after `'data-pebble'`)

```js
  'live-tile': {
    cls: 'flat',
    line: 2,
    press: { opacity: 1, scale: 0.97, ms: 100 },
    motion: { fast: 100, base: 140, slow: 220, ease: 'out' },
    surface: 'Flat rectangles with zero corner radius and zero shadow everywhere (a radio stays round so it reads as a radio). Colour lives on solid tiles on a 4-column grid with 8pt gaps: the primary, the secondary, one accent tile at most per view, and an ink-tinted neutral; a tile\'s label sits bottom-left at 13pt, a count or glyph top-right. Cards and panels are the ground itself: no fill, no border. Fields and secondary buttons are 2pt-edged rectangles. The app carries no tile-wall art, no flipping tiles and no ambient motion.',
    pressText: 'The control tilts toward the finger: it scales to 0.97 over 100 ms (ease-out) and back on release, with no colour change. A focused field fills with `--ink` and sets its text in `--canvas`.',
    accentOverride: { light: '--ab-lt-acc', on: '--ab-lt-on-acc', note: 'the brand accent pushed (toward black or white) until it holds 3:1 on the ground and a label on it holds 4.5:1; it fills one tile per view and is never text or a button' },
    secondaryOverride: { light: '--ab-lt-sec', on: '--ab-lt-on-sec', note: 'the brand secondary pushed until it holds 3:1 on the ground and a label on it holds 4.5:1; it fills supporting tiles only' },
    fixedInks: [
      { token: '--tile-neutral', light: '--ab-lt-neu', on: '--ab-lt-on-neu', job: 'Neutral tile: the ink eased toward the ground until it holds 3:1 on it; the third tile colour and the avatar / icon tile.', decorativeOnly: false },
      { token: '--track', light: '--ab-lt-track', job: 'Unfilled track of a slider or progress bar: the ink eased toward the ground until it holds 3:1 on it.', decorativeOnly: false },
    ],
    states: {
      pressed: ['No colour change', 'Scales to 0.97 and back, 100 ms ease-out; no veil, no shadow.'],
      disabled: ['`--canvas` veil over the fill, `--muted` label', 'The 2pt edge of a secondary button or field stays; no press response.'],
      loading: ['`--ink` squares on `--canvas`', 'Five 5pt squares sliding left to right in a row, each 0.17 s behind the last; on the web board only. With Reduce Motion they sit still, evenly spaced.'],
    },
    reduceMotion: 'Tiles stop flipping and the five squares sit still and evenly spaced; the press tilt is dropped and the state swaps instantly.',
    icons: 'Stroke 1.5pt, square caps and joins, no rounded corners; outline at rest and filled in `--ink` when selected. A glyph sits top-right of a tile, in the tile\'s label colour.',
    appIcon: '`{canvas}` tile with one flat `{primary}` rectangle and a smaller `{secondary}` one beside it, the brand initial in the heading face, light weight, lowercase, on the larger; zero radius inside the tile, no shadow, no gradient.',
  },
```

## 3. js/patterns/fit.js suite (after `'data-pebble'`)

Six families, none repeated. The lead is `totem`: no other suite in `js/patterns/fit.js` leads with it, and neither
`docs/round11/mainframe.md` (lead `panels`) nor `docs/round11/toy-press.md` (lead `bloomgrid`) does, so the global
lead-ownership rule holds (checked against `Patterns.fit` at runtime and against the other Round 11 docs). With
`panel: 1` and `frame: 1` it draws flat nested rectangles in the brand colours, which suits the cover band.
All six are `brand` colourway: no new colourway is needed. All six family keys exist in `js/patterns/families/*.js`
and are already listed in `FAMILY_FILES`.

```js
    'live-tile': [
      ['totem', 'Nested tiles', 'brand', { px: 3, panel: 1, band: 3, frame: 1 }],
      ['modulargrid', 'Tile wall', 'brand', { cols: 4, merge: 0.7, gap: 1.6, empty: 0.08 }],
      ['gradpanes', 'Flat panes', 'brand', { rows: 3, cols: 4, gap: 1.6, radius: 0, steps: 0, grain: 0 }],
      ['weave', 'Pivot bands', 'brand', { bands: 4, rhythm: 'even', skew: 0, gap: 0.35, stripe: 1 }],
      ['panels', 'Wide panels', 'brand', { depth: 2, gutter: 0.5, pitch: 1.2, flat: 1, frame: false }],
      ['parcels', 'Block parcels', 'brand', { cell: 2, size: 1.35, every: 8, labels: false }],
    ],
```

## 4. js/onboarding.js STYLE_TABLE row (after the `data-pebble` row)

```js
    { key: 'live-tile', loud: 0.35, kinds: 'app product website', hue: 215 },
```

## 5. js/logo-start.js MOOD_OF value (same object as `'data-pebble': 'calm'`)

```js
'live-tile': 'tech',
```

## 6. css/aesthetic-board.css sidebar motif (after the `data-pebble` rules)

Greyscale, 30px tall: one large tile and a 2 x 2 block of small ones.

```css
[data-motif="live-tile"]::before { left: 0; top: 1px; width: 28px; height: 28px; background: #777; }
[data-motif="live-tile"]::after { left: 34px; top: 1px; width: 13px; height: 13px; background: #aaa; box-shadow: 15px 0 0 #ccc, 0 15px 0 #ddd, 15px 15px 0 #999; }
```

Also add `[data-motif="live-tile"]` to both `.ae-motif:not([data-motif="soft-form"], ...)` lists
(lines 599 and 600), exactly as was done for `data-pebble`.
