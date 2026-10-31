# Round 11: Tonal Shape (key `tonal-shape`, display 41, family Graphic, order 50)

Hand-off for task R. Everything below is paste-ready and was checked against the current files
(shapes follow the data-pebble entries). Style files written by task D:
`js/aesthetics/tonal-shape.js`, `css/aesthetics/tonal-shape.css`, this file. `index.html` already loads both.

## What it is

Tonal surfaces and shape libraries, with a per-brand twist: one **signature shape** per brand, drawn from six
original SVG paths (scalloped cookie, four-leaf clover, soft burst, arch, rounded diamond, leaf) and picked
deterministically from the brand name (FNV-1a hash of the trimmed, lower-cased name, mod 6; same name, same
shape, every render). In the app the shape only **contains** something: the avatar initial, the icon button
glyph, the leading icon of a list row, the empty-state icon (the kit draws no floating action button, so the
icon button carries that role). The board and deck hero is a composition of large interlocking tonal shapes
with the brand initial in the signature one (website art only).

- Colour: a tonal ramp mixed from the primary into the canvas. Light: ground = primary 4% over the neutral,
  container-low ~8%, container ~12%, container-high ~18%, primary-container ~30% tint with deep on-container
  text. Dark: a deep tinted ground (neutral pulled toward black, 6% of a lightened primary), same ramp.
  No shadows, no hairline borders on cards. No new hues. The primary stays the brand colour and only moves
  when it would miss 3:1 on the ground or neither white nor dark text would reach 4.6:1 on it.
- Shape: pill buttons (28px radius, a full pill at every control height up to 56px; a number rather than 999px
  so it can animate), cards and sheets 28px, small containers 12px; pressed = the pill squishes to a 12px corner
  in 180 ms with `cubic-bezier(0.34, 1.56, 0.64, 1)` (the overshoot); reduced motion removes the transition.
  Segmented control: connected group, full outer corners, 4px inner corners, 1px outline, selected segment in
  primary-container. Selected tab: a 60 x 32 pill behind the icon.
- Fonts: headings Outfit 600 (bundled weights are 400;600, there is no 500), body Figtree. Plus Jakarta Sans is
  allowed as a heading pick but is bundled at 300;400;600 only, so its heading weight is 600, not 700.
- `def.copy` keys: motto, kicker, state0-2, shapeCap, cardShape, cardShapeCap, cardPill, pillRest, pillPressed,
  cardTone, toneLow, toneMid, toneHigh, tonePrimary.
- Variables the style publishes (`tokens()`): `--ab-tn-low / mid / high` (containers), `--ab-tn-pc`,
  `--ab-tn-on-pc` (primary-container and its text), `--ab-tn-sc`, `--ab-tn-on-sc`, `--ab-tn-ac`,
  `--ab-tn-outline` (3:1 field and segment edge), `--ab-tn-text`, `--ab-line`, `--ab-pri-tint`, `--ab-sec-tint`,
  `--ab-primary-text`, `--ab-pri-hover`, `--ab-pri-press`, `--ab-hw` (heading weight), `--ab-ts-shape-name`,
  `--ab-ts-shape-path` (the brand's path, 0 0 100 100) and `--ts-mask` (the same as a data-URI mask).
  The brief's web Materials section resolves the signature-shape recipe to the brand's name and path.
- Brief wording note: `aibAppText` drops any sentence in app text that contains hero, art, pattern, texture,
  illustration, band, deck or poster. The AESTHETIC_BUILD strings below avoid those words on purpose; keep it so.

## 1. js/aesthetic-meta.js: AESTHETIC_META (add after `'data-pebble'`)

```js
  'tonal-shape': {
    family: 'graphic',
    fonts: {
      heading: { classes: ['geometric', 'rounded'], picks: ['Outfit', 'Plus Jakarta Sans', 'Sora', 'Urbanist'] },
      body: { classes: ['humanist', 'geometric'], picks: ['Figtree', 'Nunito Sans', 'Plus Jakarta Sans'] },
      avoid: ['serif', 'mono', 'typewriter', 'condensed', 'techno', 'pixel', 'groovy', 'blackletter', 'deco', 'slab', 'script'],
      why: 'Friendly geometric headings at a medium-bold weight over a warm humanist body keep pill buttons and soft tonal surfaces legible and fun; serifs, mono and condensed faces fight the rounded shapes. Outfit publishes 400 and 600 here, so headings use 600.',
      pairings: [['Outfit', 'Figtree'], ['Plus Jakarta Sans', 'Figtree'], ['Sora', 'Figtree'], ['Urbanist', 'Nunito Sans']],
    },
  },
```

## 2. js/aesthetic-meta.js: AESTHETIC_BUILD recipe (add after `'data-pebble'`)

```js
  'tonal-shape': {
    cls: 'flat',
    line: 0,
    sh: {}, press: { ms: 180 },
    motion: { fast: 120, base: 180, slow: 280, ease: 'spring' },
    surface: 'Tonal surfaces, no shadows and no hairline borders: each container is a few percent more of the primary over the canvas than the one beneath it (low about 8%, mid 12%, high 18%; dark mirrors it over a deep tinted canvas). Buttons are full pills, cards and sheets have 28pt corners, small containers (fields, callouts, toast, menus) 12pt. Fields and unselected segments carry a 1pt `--ab-tn-outline` edge. The brand has one signature shape, seeded from its name, used only as a container: the avatar, the icon button (or floating action button), the leading icon of a list row and the empty-state icon.',
    pressText: 'A pill squishes: its corner morphs from full pill to a 12pt corner over 180 ms with a slight overshoot (`cubic-bezier(0.34, 1.56, 0.64, 1)`) while its fill moves a state-layer step (hover 10%, pressed 16% of `--on-primary` over `--primary`). An icon button in the signature shape scales to 0.92. With Reduce Motion the corner and fill change at once.',
    states: {
      pressed: ['Fill steps toward `--on-primary` (10% hover, 16% pressed); a secondary or text control takes a `--ab-tn-pc` wash', 'The pill morphs to a 12pt corner over 180 ms with a slight overshoot; an icon button scales to 0.92. Reduce Motion: instant swap, no overshoot.'],
      disabled: ['`--line` fill, `--muted` label', 'Keeps its shape; no hover or press response, no squish.'],
      empty: ['`--ink` headline, `--muted` copy', 'The brand\'s signature shape in `--ab-tn-pc` holding one outline icon, a headline, one line of copy and one pill action.'],
    },
    reduceMotion: 'The pill corner and fill swap instantly: no morph, no overshoot, no icon-button scale.',
    increaseContrast: 'Fields and segments take a 2pt `--ink` edge, `--muted` text becomes `--ink`, tonal containers get a 1pt `--ink` edge.',
    icons: 'Stroke 1.75pt, round caps and joins, outline at rest. A selected tab sits on a 60 x 32pt pill filled with `--ab-tn-pc` with the glyph in `--ab-tn-on-pc`; a list-row or empty-state icon sits inside the brand\'s signature shape filled with `--ab-tn-pc`.',
    iconWeight: 'regular',
    appIcon: 'Full-bleed `{canvas}` tile with one large signature shape (a soft rounded polygon or scalloped disc) filled with `{primary}` and the brand initial in the heading face inside it in `{onPrimary}`; flat, no shadow, no gradient.',
  },
```

## 3. js/patterns/fit.js: suite (add after the `'data-pebble'` suite; all six families exist in js/patterns/families)

First entry drives the deck cover band: `arcrise` is not the lead of any other suite (checked against all 37).
Colourways are `brand` / `duotone` only, so nothing outside the palette is invented. Rendered and checked in the
Patterns view (all six draw, light and dark).

```js
    'tonal-shape': [
      ['arcrise', 'Arch rise', 'brand', { origin: 'bottom', bands: 6, suns: 1, bars: false, bar: 3.6, scale: 1, grain: 0, tints: false }, 0.7],
      ['tokens', 'Soft capsules', 'brand', { cell: 7.5, link: 0.4, density: 0.8, fill: 'mixed', grain: 0 }, 0.8],
      ['aura', 'Soft lumps', 'brand', { layout: 'scatter', blobs: 6, soft: 0.8, mode: 'paint', strength: 0.8, grain: 0 }, 0.7],
      ['colony', 'Cell colony', 'duotone', { cells: 26, rings: 3, fuse: 1.3, finish: 'film', nuclei: false, grain: 0.05 }, 0.7],
      ['gradpanes', 'Rounded panes', 'brand', { rows: 3, cols: 4, gap: 1.6, steps: 0, radius: 4, grain: 0 }, 0.75],
      ['modulargrid', 'Shape tiles', 'brand', { cols: 6, style: 'filled', merge: 0.5, gap: 1, empty: 0.1, grain: 0 }, 0.8],
    ],
```

## 4. js/onboarding.js: STYLE_TABLE row (after the `data-pebble` row)

```js
    { key: 'tonal-shape', loud: 0.3, kinds: 'app product website', hue: 265 },
```

## 5. js/logo-start.js: MOOD_OF value

Add to the `MOOD_OF` object (same line as `'data-pebble': 'calm'`):

```js
'tonal-shape': 'calm'
```

(i.e. `..., 'wpa-screenprint': 'craft', 'data-pebble': 'calm', 'tonal-shape': 'calm',`)

## 6. css/aesthetic-board.css: sidebar motif (greyscale; after the `data-pebble` motif rules)

Also append `, [data-motif="tonal-shape"]` to the end of the `:not(...)` key list on **both** default
`.ae-motif:not(...)::before` / `::after` rules (lines 599 and 600), as for every earlier style.

```css
[data-motif="tonal-shape"]::before { left: 0; top: 1px; width: 28px; height: 28px; background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M50 12A15 15 0 0 1 74.4 20.9A15 15 0 0 1 87.4 43.4A15 15 0 0 1 82.9 69A15 15 0 0 1 63 85.7A15 15 0 0 1 37 85.7A15 15 0 0 1 17.1 69A15 15 0 0 1 12.6 43.4A15 15 0 0 1 25.6 20.9A15 15 0 0 1 50 12Z' fill='%23888'/%3E%3C/svg%3E") center / contain no-repeat; }
[data-motif="tonal-shape"]::after { left: 36px; top: 6px; width: 36px; height: 18px; border-radius: 999px; background: #bbb; box-shadow: inset -12px 0 0 -3px #d4d4cf; }
```

## Other registration points (as for data-pebble)

- Style count 37 -> 41 everywhere it is stated; display number 41 comes from plain counting.
- No showcase favourite, no `js/share.js` entry, no `classic/` variant.
- Deck: `deck.materialArt` (three specimens: signature shape in use, pill before / after the squish with the
  segmented control, the tonal ramp). Board: `panels.list` draws a signature-shape avatar per row.

## Verification (task D, headless Chromium and WebKit via Playwright, no window opened)

- Board light and dark with two brand names (different signature shapes), Compare all, deck (10 slides, light
  and dark), Built view: UI kit tab, mobile, dashboard, settings, landing, light and dark. No console errors.
- Contrast across 24 primaries (light, dark, incl. white, black, grey, yellow, red) x 2 modes: ink on ground and every
  container >= 11.0 (>= 5.4 on the two tinted containers), muted >= 4.6, on-container text on primary-container
  >= 6.1, on-primary on primary >= 4.6, primary on ground >= 3.0, field / segment outline >= 3.1 on every ground.
- `buildAiBrief` (app and web surface, light and dark) builds without throwing; the web brief prints the brand's
  signature shape name and path.
- Pressed pill radius measured 28px -> 12px on mouse down; with `prefers-reduced-motion` the transition is 0s.
