# Isogrid (`isogrid`): registration hand-off

Style files: `js/aesthetics/isogrid.js`, `css/aesthetics/isogrid.css`.
Family `graphic`, order 51 (display number 42 with the four Round 11 styles in), recommended mode light.

All six registration points below are already applied (this file records them in the same shape as
`docs/round11/mainframe.md`, so a reviewer can diff the snippets against the files). `index.html` loads both
files after `tonal-shape`.

Notes for the reviewer:

- The 300 weight of IBM Plex Sans comes from the `@font-face` at the top of `css/aesthetics/mainframe.css`
  (it points at the variable Plex file `fonts/fonts.css` already uses for 400 and 600; no new download). Isogrid
  does not declare it again, so **Isogrid depends on `mainframe.css` staying loaded**. If Mainframe is ever removed,
  move that one rule into `isogrid.css`. `FONTS` still lists `weights: '400;600'` (js/data.js is not touched);
  `tokens()` asks for 300 only when the heading face is IBM Plex Sans, any other face gets its nearest published
  weight through `abWeightNear` (Inter Tight, Plus Jakarta Sans and Source Sans 3 publish a 300).
- The fit suite's lead (the deck cover band and closing strip) is `kaleidopix`. It is the lead of no other suite
  (free per the header of `js/patterns/fit.js`), and its quad fold is the "quarters" idea. If another Round 12 style
  also leads with `kaleidopix`, change the lead of one of them.
- The UI kit contract says the kit's sizes do not change per aesthetic. Isogrid asks for 64px buttons and 32px
  card padding, so it sets the kit's own inputs on its root, `.ab.sb-ab[data-ae="isogrid"] { --k-btn: 64px;
  --k-cardpad: 32px; --k-gap: 32px; --k-list-box: open; }`, and nothing in `js/ui-kit.js`, `js/see-built.js`,
  `css/see-built.css` or `js/ai-brief.js` is touched. Delete that one line to fall back to the kit's 52 / 20 / 28.
- One `!important` padding declaration in `isogrid.css` (`padding: 16px !important` on `.sb-k-btn`, `.sb-k-btn2` and
  `.sb-k-danger`) beats the kit's `padding-top/bottom: 0 !important`, so the label can hang top-left and the arrow
  bottom-right inside the 64px height.

## 1. `js/aesthetic-meta.js`: AESTHETIC_META (fonts entry)

Inserted after the `'tonal-shape': { ... },` entry of `AESTHETIC_META`.

```js
  'isogrid': {
    family: 'graphic',
    fonts: {
      heading: { classes: ['neo-grotesk', 'geometric'], picks: ['IBM Plex Sans', 'Inter Tight', 'Plus Jakarta Sans', 'Source Sans 3'] },
      body: { classes: ['neo-grotesk', 'humanist'], picks: ['IBM Plex Sans', 'Inter Tight', 'Source Sans 3'] },
      mono: { picks: ['IBM Plex Mono'], note: 'small labels and numbers, with tabular figures' },
      avoid: ['script', 'hand', 'rounded', 'woodtype', 'blackletter', 'groovy', 'pixel', 'soft-serif', 'deco', 'didone', 'heavy', 'wide', 'condensed'],
      why: 'A doubling grid wants a plain, even grotesque set very large and very light: IBM Plex Sans at weight 300 for display (400 and 600 for text and controls), with IBM Plex Mono for small labels and numbers. Pick a face that publishes a light weight (Inter Tight, Plus Jakarta Sans and Source Sans 3 do); one that only has 400 and 600 will not look airy at display size.',
      pairings: [['IBM Plex Sans', 'IBM Plex Sans'], ['Inter Tight', 'Inter Tight'], ['Plus Jakarta Sans', 'IBM Plex Sans'], ['Source Sans 3', 'Source Sans 3']],
    },
  },
```

## 2. `js/aesthetic-meta.js`: AESTHETIC_BUILD recipe

Inserted after the `'tonal-shape': { ... },` entry of `AESTHETIC_BUILD`.

```js
  'isogrid': {
    cls: 'flat',
    line: 1,
    motion: { fast: 60, base: 120, slow: 240, ease: 'out' },
    surface: 'A grid that doubles at every step, with outlines instead of fills. Every gap, size and type step is twice the one below: spacing 4 / 8 / 16 / 32 / 64 / 128pt, type 12 / 24 / 48 / 96pt with body at 16pt. Corners are 0 everywhere. The only edge is a 1pt hairline `--ab-edge` (the ink pulled toward the canvas until it holds 3:1); use it, and not `--line`, for every outline. There is no shadow and no tinted fill: a card, panel, list and sheet are the canvas with a 1pt outline and 32pt padding; fields are outlined all round (not filled, not bottom-rule only). Buttons are at least 64pt tall with the label set top-left and a 20pt arrow set bottom-right: the main one is filled `--primary`, the secondary is a 1pt `--ink` outline on the canvas, the third level is text only (underlined). Tags are square 1pt outlines in Plex Mono 12pt. Whatever is selected (a tab, a segment, a menu or list row, a nav item) carries a 4pt `--primary` bar on its TOP edge and sets its label in `--ink` at weight 600. The isometric block drawing and its dot lattice are board and website art only.',
    pressText: 'Colour change only, no movement or scale, 120 ms ease-out: the main button steps toward the ink (12% hover, 26% pressed; in dark mode toward white), and a secondary, text or icon control takes a 5% then 10% ink wash (`--ab-wash`, `--ab-wash-press`).',
    states: {
      pressed: ['Main fill steps toward the ink (12% hover, 26% pressed); secondary and text controls take an ink wash (`--ab-wash`, `--ab-wash-press`)', 'Colour change only, 120 ms ease-out; no movement, no scale, no shadow.'],
      disabled: ['1pt dashed `--ab-edge` outline, no fill, `--muted` label', 'Keeps its size and anatomy; no hover or press response.'],
      empty: ['`--ink` headline, `--muted` copy', 'A 56pt square outlined icon, a headline in the light weight, one line of copy and one tall outlined button on the plain canvas; no illustration.'],
      error: ['`--error`', '2pt `--error` outline on the field (not colour alone) and a 13pt helper line in `--error` under it.'],
    },
    icons: 'Simple 1.5pt outline glyphs on a 24pt grid built from 90 and 30 degree strokes, square caps and mitred joins, no fills at rest. The selected tab keeps its outline glyph and draws the 4pt `--primary` bar on the top edge of the tab, never a filled glyph or a pill.',
    iconWeight: 'regular',
    appIcon: '`{canvas}` tile with the brand initial built as a stack of extruded blocks on 30 degree axes: one face set filled `{primary}`, the other faces a 1pt `{ink}` hairline on `{canvas}`; flat, no gradient, no shadow, no dot lattice.',
  },
```

## 3. `js/patterns/fit.js`: suite (six families that fit)

Inserted after the `'tonal-shape': [ ... ],` suite inside `FIT`. All six families are valid keys registered in
`js/patterns/families/`; none repeats; colourways are the plain `mono` / `brand`. The lead (first entry) is
`kaleidopix`. The header comment now says 42 aesthetics.

```js
    'isogrid': [
      ['kaleidopix', 'Folded quarters', 'brand', { px: 3, patches: 0.7, fold: 'quad' }, 0.7],
      ['modulargrid', 'Doubling grid', 'mono', { cols: 8, style: 'line' }, 0.6],
      ['chevron', 'Thirty-degree lozenges', 'brand', { bands: 8, slope: 30, mirror: 'quad', rhythm: 'even', colors: 'three' }, 0.6],
      ['glyphgrid', 'Lattice marks', 'mono', { glyphs: 'geometric', cell: 4.5, bands: 3, duo: false }, 0.6],
      ['parcels', 'Survey blocks', 'mono', { cell: 1.6, size: 1, every: 8, labels: true }, 0.7],
      ['counterchange', 'Counter-step', 'mono', { figure: 'square', bar: 3, dir: 'v', size: 0.6, nest: 2, second: false }, 0.6],
    ],
```

## 4. `js/onboarding.js`: STYLE_TABLE row

Inserted after the `tonal-shape` row.

```js
    { key: 'isogrid', loud: 0.25, kinds: 'app product website', hue: 225 },
```

## 5. `js/logo-start.js`: MOOD_OF value

Added to the `MOOD_OF` object, on the line that holds `'tonal-shape': 'calm'`.

```js
'isogrid': 'tech',
```

## 6. `css/aesthetic-board.css`: sidebar motif rules and the `:not()` key

Inserted after the `[data-motif="tonal-shape"]::after` rule (greyscale: an isometric cube, and a pair of doubling squares).
`[data-motif="isogrid"]` is also appended to both `.ae-motif:not([...])` lists (lines 599 and 600).

```css
[data-motif="isogrid"]::before { left: 0; top: 1px; width: 28px; height: 28px; background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3E%3Cpath d='M15 2L27 9V21L15 28L3 21V9Z' fill='none' stroke='%23777' stroke-width='1.2'/%3E%3Cpath d='M15 2L27 9L15 16L3 9Z' fill='%23888'/%3E%3Cpath d='M15 16V28M3 9V21M27 9V21' stroke='%23777' stroke-width='1.2' fill='none'/%3E%3C/svg%3E") center / contain no-repeat; }
[data-motif="isogrid"]::after { left: 36px; top: 6px; width: 36px; height: 20px; background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 36 20'%3E%3Crect x='0.5' y='12.5' width='7' height='7' fill='none' stroke='%23999' stroke-width='1'/%3E%3Crect x='12.5' y='4.5' width='15' height='15' fill='none' stroke='%23999' stroke-width='1'/%3E%3Crect x='12.5' y='4.5' width='15' height='3.5' fill='%23999'/%3E%3C/svg%3E") center / contain no-repeat; }
```

## 7. Everything else registered

- `index.html`: `<link>` for `css/aesthetics/isogrid.css` and `<script>` for `js/aesthetics/isogrid.js`, after `tonal-shape`.
- `js/showcase.js`: `'isogrid'` appended to `SHOWCASE_KEYS` after `'tonal-shape'`.
- Style count 41 -> 42 in `README.md` (two places), `docs/logo-module-brainstorm.md` and the header of `js/patterns/fit.js`.
  `docs/aesthetics-plan.md` (Round 11 note, "Style count is now 41") is a dated record and was not edited.
- No `js/share.js` entry, no `classic/` variant, no `panels.list` hook (the board list rows are styled by CSS).

## Notes for the reviewer: how it differs from Mainframe

| piece | Mainframe | Isogrid |
|---|---|---|
| surfaces | layered greys (canvas, 4%, 8%), no outline | canvas only; every container a 1px outline, no fill |
| field | filled layer + bottom rule | outlined all round, transparent |
| main button | 48px, label left, icon flush right, vertically centred | 64px+, label top-left, arrow bottom-right |
| secondary button | filled ink | 1px ink outline on the canvas |
| selected tab / row | 3px left bar on a layer | 4px primary bar on the TOP edge, no fill |
| tag | filled pill | square 1px outline |
| avatar, list icon | square, filled layer | square, 1px ink outline |
| sheet, toast, menu | the only shadows in the system | 1px outline, no shadow anywhere |
| type | 300 display with a 600 highlight word | 300 display up to 96px, no weight change on the highlight |
| spacing | 8px grid (4 for fine-tuning) | doubling ladder 4 / 8 / 16 / 32 / 64 / 128 |
| board art | stripe raster of uneven pitch + numbered readout | isometric block stack of the initial on a dot lattice |
| palette | ruled index list | 8-column grid: primary and secondary take 4, ink, canvas and accent take 2 |

Specimen copy lives in `def.copy` (hero caption and scale, material-card labels, button, field and tab samples);
nothing names a company or product. App screens (`.sb-ab`, the UI kit) draw no art, lattice or texture.

Contrast was measured through the real `boardTokens()` + `tokens()` for five brand palettes (blue, yellow, green, red,
navy) in light and dark (10 states). Worst cases over all 10: ink on canvas 16.3; muted on canvas 6.1, on the hover
wash 5.5, on the pressed wash 4.6; the `--ab-edge` hairline 3.6 on the canvas and 3.2 on the hover wash; on-primary on
the printed primary 4.6, on its hover fill 5.4, on its pressed fill 6.6; the printed primary (also the focus ring and
the 4px bar) on the canvas 4.6. Sample (blue `#2f5bd8`, ink `#14171f`): light canvas `#fbfbfb`, body 17.3, muted
6.1, edge 3.6, on-primary 5.8; dark canvas `#0f1012`, primary printed as `#5a7de0`, body 17.9, muted 6.9, edge 3.9,
on-primary 4.8. `node tests/run.js` does not cover these; a primary that cannot reach 4.6 on the canvas moves along
lightness only (`igPrimary`).
