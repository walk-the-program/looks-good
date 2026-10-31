# Mainframe (`mainframe`): registration hand-off for task R

Style files (done, do not edit): `js/aesthetics/mainframe.js`, `css/aesthetics/mainframe.css`.
Family `digital`, order 49 (display number 40 once the four Round 11 styles are in), recommended mode light.
`index.html` already loads both files.

Every snippet below goes in "after the `data-pebble` entry" of the file named in its heading, in the
same shape as the `data-pebble` entry there. Each block is paste-ready (a trailing comma is included
where the entry sits inside an object or array).

Two notes for R:

- The 300 weight of IBM Plex Sans is declared by an `@font-face` at the top of `css/aesthetics/mainframe.css`
  that points at the file `fonts/fonts.css` already uses for 400 and 600 (one variable file; no new download).
  `FONTS` still lists `weights: '400;600'` (js/data.js is not touched). `tokens()` asks for 300 only when the heading
  face is IBM Plex Sans; any other face gets its nearest published weight through `abWeightNear`.
- The fit suite's lead (the deck cover band and closing strip) is `panels`. It is not the lead of any suite today.
  If another Round 11 style also leads with `panels`, change the lead of one of them (the list of free lead families
  is in the header comment of `js/patterns/fit.js`).

## 1. `js/aesthetic-meta.js`: AESTHETIC_META (fonts entry)

Insert after the `'data-pebble': { ... },` entry of `AESTHETIC_META`.

```js
  'mainframe': {
    family: 'digital',
    fonts: {
      heading: { classes: ['neo-grotesk'], picks: ['IBM Plex Sans', 'Public Sans', 'Geist', 'Inter'] },
      body: { classes: ['neo-grotesk', 'humanist'], picks: ['IBM Plex Sans', 'Public Sans', 'Inter'] },
      mono: { picks: ['IBM Plex Mono'], note: 'labels, values and numbering, with tabular figures' },
      avoid: ['script', 'hand', 'rounded', 'woodtype', 'blackletter', 'groovy', 'pixel', 'soft-serif', 'deco', 'didone', 'heavy', 'wide'],
      why: 'An operations-room look wants a plain, even grotesque for headings and body (IBM Plex Sans: light 300 for the big expressive headings, 600 for productive titles) and a matching mono (IBM Plex Mono) for labels, values and numbering. Nothing rounded, scripted or display.',
      pairings: [['IBM Plex Sans', 'IBM Plex Sans'], ['Public Sans', 'IBM Plex Sans'], ['Geist', 'IBM Plex Sans'], ['Inter', 'Inter']],
    },
  },
```

## 2. `js/aesthetic-meta.js`: AESTHETIC_BUILD recipe

Insert after the `'data-pebble': { ... },` entry of `AESTHETIC_BUILD`.

```js
  'mainframe': {
    cls: 'flat',
    line: 1,
    motion: { fast: 110, base: 110, slow: 160, ease: 'out' },
    surface: 'Layers instead of shadows, on an 8pt grid (every size and gap a multiple of 8, 4 only for fine-tuning): canvas, layer 1 (canvas shaded 4% toward the ink; cards, panels, lists, sheets) and layer 2 (8%; a field inside a card, the table header row). A component takes the next layer up from the one it sits on. Corners are 0 everywhere except a tag, which is a full pill. There is no shadow except on overlays (sheet, dialog, menu, toast): 0 2pt 6pt ink 12%, 0 16pt 32pt -8pt ink 28%. Fields are a filled layer with a 1pt bottom rule in the muted ink and no other border. Buttons are 48pt tall rectangles with the label left-aligned and the icon flush right with 16pt padding; the main one is filled `--primary`, the secondary is filled `--ink` with on-ink text, the third level is text only. Tables and lists use 1pt hairlines, a header row on layer 2 in 14pt semibold, and values in IBM Plex Mono with tabular figures. App screens carry no art: the stripe raster, the punch-card perforation divider and the hanging numbering column are board and website only.',
    pressText: 'The main button moves one step darker in light mode (lighter in dark) and the secondary one step toward the canvas, both over 110 ms ease-out with no scale or travel. Text buttons take no wash; their label dims to `--muted`.',
    states: {
      error: ['`--error`', '2pt inset outline in `--error` on the field (the bottom rule goes away) and a 12pt helper line in `--error` under it. Never colour alone.'],
    },
    icons: 'Simple 1.5pt outline glyphs on a 16pt or 24pt grid, square caps, no fills at rest; the selected tab or nav item draws a 2pt `--primary` bar, not a filled glyph.',
    appIcon: '`{canvas}` tile with the brand initial in `{primary}` cut by horizontal stripes of uneven pitch and width (the barcode-like raster), a 1pt `{ink}` hairline frame inset 8pt; flat, no gradients, no shadow.',
  },
```

## 3. `js/patterns/fit.js`: suite (six families that fit)

Insert after the `'data-pebble': [ ... ],` suite inside `FIT`. All six families are valid keys registered in `js/patterns/families/`
(`panels`, `modulargrid`, `weave`, `parcels`, `pixelgrid`, `glyphgrid`), none repeats, colourways are the plain `mono` / `brand`.
The lead (first entry) is `panels`.

```js
    'mainframe': [
      ['panels', 'Rack panels', 'mono', { depth: 4, gutter: 0.6, pitch: 0.9, flat: 0.5, frame: true }, 0.8],
      ['modulargrid', 'Module grid', 'mono', { cols: 8, style: 'filled', merge: 0.6, gap: 0.3, empty: 0.25 }, 0.8],
      ['weave', 'Uneven pitch', 'brand', { bands: 14, rhythm: 'mixed', gap: 0.1, stripe: 0.9 }, 0.9],
      ['parcels', 'Ledger tags', 'mono', { cell: 1.6, size: 1, every: 6, labels: true }, 0.8],
      ['pixelgrid', 'Punch field', 'mono', { cell: 2.5, mode: 'dots', zones: 2, density: 0.8, phase: 0 }, 0.8],
      ['glyphgrid', 'Register marks', 'mono', { glyphs: 'crosses', cell: 5, bands: 4, duo: false }, 0.8],
    ],
```

## 4. `js/onboarding.js`: STYLE_TABLE row

Insert after the `data-pebble` row of `STYLE_TABLE`.

```js
    { key: 'mainframe', loud: 0.25, kinds: 'app product website', hue: 215 },
```

## 5. `js/logo-start.js`: MOOD_OF value

Add to the `MOOD_OF` object (for example on the line that holds `'blueprint': 'tech'`).

```js
'mainframe': 'tech',
```

## 6. `css/aesthetic-board.css`: sidebar motif rules and the `:not()` key

Insert after the `[data-motif="data-pebble"]::after` rule (greyscale, same technique as its neighbours: a stack of three layers
as a square chip, and a short tab bar with a stripe cut).

```css
[data-motif="mainframe"]::before { left: 0; top: 2px; width: 34px; height: 26px; background: linear-gradient(#6b6b66, #6b6b66) 0 0 / 100% 3px no-repeat, linear-gradient(#6b6b66, #6b6b66) 0 7px / 100% 5px no-repeat, linear-gradient(#6b6b66, #6b6b66) 0 16px / 100% 2px no-repeat, linear-gradient(#6b6b66, #6b6b66) 0 22px / 100% 4px no-repeat; }
[data-motif="mainframe"]::after { left: 42px; top: 4px; width: 28px; height: 22px; background: #d6d6d1; box-shadow: inset 0 -5px 0 #bdbdb8, inset 0 -10px 0 #d6d6d1, inset 0 -10px 0 1px #9c9c97; }
```

Also add `[data-motif="mainframe"]` to both `.ae-motif:not([...])` lists (lines near 599-600), after `[data-motif="data-pebble"]`,
or the neutral fallback hairline card will leak into this tile.

## Notes for the reviewer

- Specimen copy lives in `def.copy` (hero readout, list header, layer and field samples); nothing names a company or product.
- Contrast was measured on the board root over 90 brand states (30 hues x 3 schemes, light and dark): ink, muted (4.6 target) on
  canvas, layer 1 and layer 2; primary text on canvas and layer 2; on-primary on the primary, hover and pressed fills; focus 3:1;
  tag ink on the tag fill; the secondary button label on its fill, hover and pressed. No failures.
- Sizes inside `.sb-kit` (UI kit tab and phone screens: 52pt buttons, 17/24 body, the kit's type roles) stay the kit's, as the
  kit contract requires; mainframe only restyles colour, faces, edges and layering there. The 48px buttons and the 14/20 productive
  scale apply to the board, the deck, and the dashboard, settings and landing screens.
