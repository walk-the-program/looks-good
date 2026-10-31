# Round 12: Tab Stack (key `tab-stack`, display 43, family Digital, order 52, default mode dark)

Hand-off for the registration step. Everything below is paste-ready and was checked against the current files
(shapes follow the `tonal-shape` / `toy-press` entries). Style files: `js/aesthetics/tab-stack.js`,
`css/aesthetics/tab-stack.css`, this file. `index.html` must load both (not touched by this task).

## Influence -> spin (3 lines)

- Influence: dark operations-app screens that fan their categories as saturated rounded cards tucked under one another like index tabs, with chunky condensed capitals, small mono copy, white pill dropdowns and white circular arrow buttons.
- Spin: the five card colours are the brand's own hues (primary, secondary, accent) plus derived companions, each lifted until ONE near-black text colour reads on it at 7:1; the ground is charcoal (dark) or pale sage-grey (light); every control is a pill or a plain circle; a pressed card or row is pulled up 4px like drawing a tab out of a file.
- Art is ours: a code-drawn fanned stack of five colour tab-cards carrying mono tags and the brand initial, plus loose ink doodle marks (star, squiggle, ring, tick lines), board / deck / website only. The app (UI kit and the five phone screens) draws none of it.

## What it is

- Colour: `canvas(b)` returns a charcoal (dark: primary hue at 8% saturation, 11.5% lightness) or a sage-grey (light: hue leaning a quarter of the way from sage 140 toward the primary, 12% saturation, 87% lightness), moved only as far as needed to hold 7:1 against the brand ink. `printPrimary(t)` prints the primary as the first card colour (dark: lifted until the near-black label reads at 7:1; light: pushed deeper until it holds 3.2:1 on the ground and its readable label holds 4.6:1). `tokens()` publishes five card colours `--ab-tb-a..e` (brand hues in order primary, secondary, accent, then companions rotated from the first hue at least 30 degrees apart; a grey brand stays grey), `--ab-tb-on` (near-black, the one text colour on every card, 7:1 or better on all five), `--ab-tb-on-dark` (the light colour for text and glyphs on the near-black), the white pill `--ab-tb-pill` / `--ab-tb-on-pill`, the field bed `--ab-tb-field`, the raised surface `--ab-tb-raised` (tab bar, sheet, menu), the edge `--ab-tb-edge` (3.05:1 or better on the ground and the raised surface, and on the pill in light mode), plus `--ab-muted`, `--ab-line`, `--ab-pri-tint`, `--ab-sec-tint`, `--ab-primary-text`, `--ab-pri-hover`, `--ab-hw`.
- Cards and rows: 24px radius, no border, no shadow, solid fill. In the app a grouped list is a stack: each row tucks 20px under the next (negative margin, extra top and bottom padding, later rows above earlier ones) and takes the next card colour in order; an open list stays flat. On the board the "03 in use" rows do the same. Inside a card or a stacked row the shared tokens are re-pointed (`--ab-ink`, `--ab-muted`, `--ab-primary`, `--ab-on-primary`, `--ab-canvas`), so text, switches, progress, buttons and chart marks adapt without their own rules.
- Type: headings Barlow Condensed 800 in capitals (bundle weights 400;600;800), details and body in a mono face (DM Mono, 400;500, labels in capitals with 0.04 to 0.08em tracking). `abWeightNear(headingFont, 800)` gives the nearest published weight for other faces (Saira Condensed 800, Big Shoulders Display 700, Oswald 600).
- Controls (app and board): main button = full pill (52px) in the primary with a 38px circular arrow chip in the label colour; pill select / secondary button = white pill (ink itself in dark mode, near-white with a 1.5px edge in light); icon button = a plain circle (ink fill with canvas glyph on the ground, near-black fill with a light glyph on a card); fields 16px radius with a 2px edge; switch = a 54 x 32 pill; segmented control = a pill group with a solid selected pill; selected tab = a 36px circle in card colour A behind the icon; in-page tabs = pills.
- Motion: press = scale 0.97 in 120 ms ease-out (a pressed stacked row translates up 4px instead); reduced motion removes every transition and transform.
- `def.copy` keys: motto, kicker, state0-2, tagA-tagE, artCap, matStack, matStackCap, matPill, matPillOpt, matPillCap, matChart, matChartCap, matSegA-matSegC.
- Brief wording note: `aibAppText` drops any sentence in app text that contains hero, art, pattern, texture, illustration, band, deck or poster. The AESTHETIC_BUILD strings below avoid those words on purpose; keep it so.

## How its app UI differs from neo-brutal-pop and bento-grid (one line per component)

| Component | neo-brutal-pop | bento-grid | tab-stack |
|---|---|---|---|
| Card | near-square corners, 2px ink outline, hard offset shadow, paper fill | 28px tile, no border, soft shadow, near-canvas fill | 24px, one of five saturated brand-hue fills, no border, no shadow, near-black text |
| List rows | ruled rows | each row a tile that scales 1.01 on hover | each row a colour card tucked 20px under the next; a pressed row rises 4px |
| Main button | blocky, ink outline, hard shadow it travels onto | solid primary tile | full pill with a circular arrow chip, scales to 0.97, no shadow |
| Secondary button / select | outlined block | ink-filled pill | white pill (a 1.5px ring in light mode); on a card a transparent pill with a near-black ring |
| Field | 2px ink outline, square, hard shadow on focus | borderless soft well | 16px, 2px edge on a filled bed; search and select are full pills |
| Segmented / tabs | outlined blocks, offset shadow | ink-filled pill segments | a ringed pill group, selected = solid pill (inverted inside a card); in-page tabs are ringed pills, selected = card colour |
| Switch / checkbox | outlined box, hard shadow | filled track, white knob with a soft shadow | ring-only track with no shadow, 8px-radius box with a 2px edge |
| Icon button | outlined block | rounded tile | plain circle: ink on the ground, near-black on a card |
| Tab bar | outlined bar | floating tile | raised bar with 24px top corners, the selected item a 36px colour circle |
| Type | heavy grotesk, sentence case | clean sans, huge numerals | condensed capitals for headings, mono for every detail |

## 1. js/aesthetic-meta.js: AESTHETIC_META (add after `'tonal-shape'`)

```js
  'tab-stack': {
    family: 'digital',
    fonts: {
      heading: { classes: ['condensed'], picks: ['Barlow Condensed', 'Saira Condensed', 'Big Shoulders Display', 'Oswald'] },
      body: { classes: ['mono'], picks: ['DM Mono', 'Geist Mono', 'JetBrains Mono', 'Space Mono'] },
      avoid: ['serif', 'script', 'blackletter', 'groovy', 'hand', 'pixel', 'rounded', 'deco', 'slab'],
      why: 'Chunky condensed capitals over small monospace detail read like an operations dashboard and keep five saturated cards legible; serifs, scripts and soft rounded faces fight the stacked-card look. Barlow Condensed publishes 400, 600 and 800 here, so headings use 800.',
      pairings: [['Barlow Condensed', 'DM Mono'], ['Saira Condensed', 'Geist Mono'], ['Big Shoulders Display', 'JetBrains Mono'], ['Oswald', 'Space Mono']],
    },
  },
```

## 2. js/aesthetic-meta.js: AESTHETIC_BUILD recipe (add after `'tonal-shape'`)

```js
  'tab-stack': {
    cls: 'flat',
    line: 0,
    sh: {}, press: { scale: 0.97, ms: 120 },
    motion: { fast: 100, base: 120, slow: 200, ease: 'out' },
    surface: 'Solid colour cards on a flat ground (charcoal in dark mode, pale sage-grey in light mode): 24pt corners, no border, no shadow, no gradient. There are five card colours, `--tab-a` to `--tab-e`, taken in that order (the first is the primary, the next two the secondary and accent, the last two derived companions), and one near-black text colour, `--tab-on`, on every card; a control inside a card uses `--tab-on` for its fill, edge and glyph and `--tab-on-light` for text on that fill. A grouped list is a stack: each row is its own card, tucked 20pt under the next (negative top margin, extra top and bottom padding, later rows drawn above earlier ones), taking the card colours in order; an open list with no box stays flat. Buttons and selects are full pills; every icon button is a plain circle with a diagonal-arrow, plus or glyph; fields are 16pt with a 2pt `--edge` border; a switch is a 54 x 32pt pill. Headings are condensed capitals; every label, tag, number and button is the small mono body face, in capitals with 0.04 to 0.08em tracking.',
    pressText: 'A pill or circle scales to 0.97 over 120 ms (ease-out) and back on release, with the fill moving a step toward its label colour (hover `--pri-hover`). A pressed stacked row is drawn up 4pt, like pulling a tab out of a file, and keeps its colour. With Reduce Motion nothing moves; the fill change is instant.',
    states: {
      pressed: ['Fill steps toward its label colour; a secondary pill takes a 16% wash of its label colour', 'Scales to 0.97 in 120 ms; a stacked row rises 4pt. Reduce Motion: instant swap, no movement.'],
      disabled: ['A 58% `--canvas` veil over the fill, `--muted` label', 'A dashed 2pt edge on a field, box or switch; keeps its shape, no hover or press response.'],
      empty: ['`--ink` headline in capitals, `--muted` copy', 'One circle in card colour B holding an outline icon, a capitals headline, one line of copy and one pill button.'],
    },
    fixedInks: [
      { token: '--tab-a', light: '--ab-tb-a', job: 'Card colour 1: the brand primary lifted until `--tab-on` holds 7:1 on it. The first card in any stack, the selected tab circle and the selected in-page tab. Never text.', decorativeOnly: false },
      { token: '--tab-b', light: '--ab-tb-b', job: 'Card colour 2: the brand secondary lifted the same way. The second card, avatars and list-icon circles. Never text.', decorativeOnly: false },
      { token: '--tab-c', light: '--ab-tb-c', job: 'Card colour 3: the brand accent lifted the same way (or a derived companion). The third card and the tab behind the highlighted headline word. Never text.', decorativeOnly: false },
      { token: '--tab-d', light: '--ab-tb-d', job: 'Card colour 4: a derived companion hue rotated from the first, lifted the same way. The fourth card. Never text.', decorativeOnly: false },
      { token: '--tab-e', light: '--ab-tb-e', job: 'Card colour 5: a second derived companion. The fifth card. Never text.', decorativeOnly: false },
      { token: '--tab-on', light: '--ab-tb-on', job: 'The one text, icon and edge colour on every card (a near-black in the primary hue, 7:1 or better on all five card colours); also the fill of a control inside a card.', decorativeOnly: false },
      { token: '--tab-on-light', light: '--ab-tb-on-dark', job: 'Text and glyphs on a `--tab-on` fill (a button, chip, badge or selected segment inside a card).', decorativeOnly: false },
      { token: '--pill', light: '--ab-tb-pill', on: '--ab-tb-on-pill', job: 'The pill select and secondary button on the ground: ink itself in dark mode, a near-white with a 1.5pt `--edge` border in light mode.', decorativeOnly: false },
      { token: '--edge', light: '--ab-tb-edge', job: 'The border of fields, the unselected segment, the unselected in-page tab and the switch track: the ink eased toward the ground until it holds 3:1 on the ground, the raised surface and (light mode) the pill.', decorativeOnly: false },
    ],
    reduceMotion: 'No scale, no row lift, no transition: the fill and state change at once.',
    increaseContrast: 'Edges and rings take 2pt `--ink` (`--tab-on` inside a card), `--muted` text becomes `--ink`.',
    icons: 'Stroke 2pt, round caps and joins, outline at rest. An icon button is a plain 40 to 44pt circle: `--ink` fill with a `--canvas` glyph on the ground, `--tab-on` fill with a `--tab-on-light` glyph on a card; the selected tab item sits on a 36pt circle in `--tab-a` with the glyph in `--tab-on`. The arrow glyph is always the diagonal one.',
    iconWeight: 'bold',
    appIcon: 'Full-bleed `{canvas}` tile with three rounded colour cards fanned and tucked under one another ({primary}, {secondary}, {accent}), the brand initial in the heading face, capitals, on the front card; flat, no shadow, no gradient.',
  },
```

## 3. js/patterns/fit.js: suite (add after the `'tonal-shape'` suite)

Lead: `flyposter` (paste-up colour blocks, angle 0, a sweep hardening into stripes with solid blocks punched over it; the nearest family to stacked colour slabs). It is not the first entry of any current suite and the header lists it as free. Second choice if a later step finds a clash: `kaleidopix` (sticker-like colour patches; free), as `['kaleidopix', 'Patch tabs', 'brand', { px: 2.4, patches: 1.0, fold: 'quad' }, 0.8]` in first position, moving the `flyposter` entry to the end. (`waves` was the obvious runner-up but the sibling `patchbay` hand-off already leads with it, and `halftone` is led by `paddock-pass`; both appear below only as non-lead entries.) Colourways are `brand` / `duotone` only, so nothing outside the palette is invented. Parameters were checked against each family's declared ranges (not rendered).

```js
    'tab-stack': [
      ['flyposter', 'Tab slabs', 'brand', { stripe: 1.1, harden: 0.6, blocks: 7, marks: 1, angle: 0 }, 0.85],
      ['gradpanes', 'Stacked panes', 'brand', { rows: 5, cols: 2, gap: 1.2, steps: 0, radius: 3.6, grain: 0 }, 0.85],
      ['tokens', 'Tab capsules', 'brand', { cell: 8, link: 0.5, density: 0.9, fill: 'mixed', grain: 0 }, 0.85],
      ['modulargrid', 'Index grid', 'brand', { cols: 5, style: 'filled', merge: 0.7, gap: 1.2, empty: 0.1, grain: 0 }, 0.85],
      ['halftone', 'Dot screen', 'duotone', { cell: 4, levels: 3, shape: 'round', field: 'ridges', duo: true }, 0.7],
      ['waves', 'Layered bands', 'brand', { rows: 5, crests: 1.5, curl: 0.6, strands: 8, drops: 0 }, 0.8],
    ],
```

## 4. js/onboarding.js: STYLE_TABLE row (after the `tonal-shape` row)

```js
    { key: 'tab-stack', loud: 0.55, kinds: 'app product website', hue: 165 },
```

## 5. js/logo-start.js: MOOD_OF value

Add to the `MOOD_OF` object (next to `'tonal-shape': 'calm'`):

```js
'tab-stack': 'tech'
```

(i.e. `..., 'toy-press': 'craft', 'live-tile': 'tech', 'mainframe': 'tech', 'tonal-shape': 'calm', 'tab-stack': 'tech',`)

## 6. css/aesthetic-board.css: sidebar motif (greyscale; after the `tonal-shape` motif rules)

Also append `, [data-motif="tab-stack"]` to the end of the `:not(...)` key list on **both** default
`.ae-motif:not(...)::before` / `::after` rules, as for every earlier style.

```css
[data-motif="tab-stack"]::before { left: 0; top: 1px; width: 36px; height: 14px; border-radius: 7px; background: #777; box-shadow: 5px 8px 0 -1px #999, 10px 16px 0 -2px #bbb; }
[data-motif="tab-stack"]::after { left: 50px; top: 4px; width: 22px; height: 22px; border-radius: 50%; background: #ccc; }
```

## Other registration points (as for tonal-shape)

- Style count stated everywhere goes up by one; display number 43 comes from plain counting (order 52).
- No `classic/` variant. Showcase favourite and `js/share.js` entry are the coordinator's call.
- Deck: `deck.materialArt` (three specimens: stacked cards, pill + circular chip + segmented pill, bar chart in a card colour). Board: the "03 in use" rows are the stack (no `panels.list` hook needed).

## Checks run (no browser, no window opened)

- `node --check js/aesthetics/tab-stack.js` passes; CSS braces balance (depth 0, never negative); grep for the four real company / product names finds nothing in the three files.
- Colour maths run in a Node vm against the real `js/color.js` (same `slMix`, `contrastRatio`, `pickReadableText`) and the real `canvas` / `printPrimary` / `tokens` hooks, five brands (indigo, yellow, grey, navy, red) in light and dark. Worst cases: ink on ground 13.2, ink on raised 12.5, muted on ground 4.68 and on raised 5.10, near-black on every card 7.00, light-on-near-black 16.9, field / pill edge on ground 3.59, on raised 4.24, on the light-mode pill 4.5, printed primary on the ground 3.2 (3:1 floor), label on the printed primary 4.61, primary-as-text on ground 4.66.
- The hero art SVG was rasterised headlessly (sips) with resolved colours in both modes to check the fan, tag and chip placement; fonts there are fallbacks.
- Not run: the board, deck, Built views, the kit states in a browser, `node tests/run.js`, the brief. The stacked-row CSS (negative margins against the kit's `!important` row padding) and the `.sb-tab` circle are written against the shared CSS but unseen.
