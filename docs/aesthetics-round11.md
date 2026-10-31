# Round 11: four styles drawn from public design systems, plus kit states

Source list: github.com/streamich/awesome-styleguides (a README of links, checked
2026-10-30: no code, no downloads, no foreign redirects). We borrow **ideas**
(structure, component anatomy, state rules), never assets, names, logos, fonts
outside our bundle, or copy. No user-visible text names a company or product.

## Acceptance criteria

1. Four new aesthetics render on the board, in Compare all, in the deck (10 slides),
   in the Built view (UI kit tab and the five phone screens) and in Copy AI brief,
   light and dark, with no console errors.
2. Each one reads as its own style, not a clone of its influence (the "spin" below).
3. App UI (`.sb-kit`, `.sb-ab` screens) draws no art, pattern or texture
   (see the app/website split in docs/aesthetics-plan.md).
4. Text in ink / muted / on-* tokens only; body text 4.5:1, large text and UI edges 3:1.
5. Fonts only from the bundled `FONTS` list in js/data.js. No new network requests,
   no CDN, no external images.
6. Every flavour string goes through `def.copy` / `abCopy` (contract in js/aesthetics/registry.js).
7. The UI kit gains keyboard-focus and disabled states (task K) and the brief reports them.
8. `node tests/run.js` passes; style count 37 → 41 everywhere it is stated.

## Shared decisions

| key | name | family | order | default mode | influence → our spin |
|---|---|---|---|---|---|
| `toy-press` | Toy Press | tactile | 47 | light | chunky "lip" buttons of playful learning apps → a toy-keycap kit: every pressable sits on a solid lip of its own darker shade that collapses when pressed |
| `live-tile` | Live Tile | digital | 48 | dark | early-2010s flat tile phone UI → typographic panorama: huge light lowercase titles that run off the edge, flat brand-colour tiles, pivot headings |
| `mainframe` | Mainframe | digital | 49 | light | 8px-grid enterprise systems with filled bottom-rule fields → an operations-room look: Plex type, layered greys, left-aligned button labels, an uneven-pitch stripe raster as website art |
| `tonal-shape` | Tonal Shape | graphic | 50 | light | tonal surfaces and shape libraries of current Android design → a per-brand signature shape (seeded from the brand name) on avatars, the FAB and the hero, tonal containers mixed from the primary, pill buttons that squish on press |

`registerAesthetic` sorts by `order`; display numbers become 38–41.

## Tasks

| id | owner | writes | depends |
|---|---|---|---|
| S0 | coordinator | index.html tags, empty stub files | — |
| A | Sonnet | js/aesthetics/toy-press.js, css/aesthetics/toy-press.css, docs/round11/toy-press.md | S0 |
| B | Sonnet | js/aesthetics/live-tile.js, css/aesthetics/live-tile.css, docs/round11/live-tile.md | S0 |
| C | Sonnet | js/aesthetics/mainframe.js, css/aesthetics/mainframe.css, docs/round11/mainframe.md | S0 |
| D | Sonnet | js/aesthetics/tonal-shape.js, css/aesthetics/tonal-shape.css, docs/round11/tonal-shape.md | S0 |
| K | Sonnet | js/ui-kit.js, js/see-built.js, css/see-built.css, js/ai-brief.js | — |
| R | Sonnet | js/aesthetic-meta.js, js/patterns/fit.js, js/onboarding.js, js/logo-start.js, css/aesthetic-board.css, docs/aesthetics-plan.md, README.md | A–D |

`docs/round11/<key>.md` is each style worker's registration hand-off: the exact
AESTHETIC_META entry, AESTHETIC_BUILD recipe, fit.js suite, onboarding STYLE_TABLE row,
logo-start MOOD_OF value and the two `[data-motif]` sidebar rules, copied from the
data-pebble entries' shapes. R applies them. Coordinator commits.

## Kit states (task K)

- `btn-primary`, `btn-secondary`: states `rest, pressed, focus, disabled`.
- `checkbox`: `off, on, disabled`; `toggle`: `off, on, disabled`.
- `field` rest shows helper text under the field (`.sb-k-help`, muted), error replaces it.
- Focus is a keyboard-only ring: 2px in the focus colour the brief already names
  (printPrimary, or ink when the primary is barred or under 3:1), 2px offset,
  drawn by a shared default in css/see-built.css; an aesthetic may override it.
- The brief's measured kit table lists the new states with what changes.

## Status (task R, 2026-10-30)

Registration applied at the six points for all four styles (plus both `.ae-motif:not()` lists); style count 41 stated in README.md and docs; Round 11 note in docs/aesthetics-plan.md; tests/run.js brief pin updated (only kit state, Focus row and keyboard-focus rule lines changed); cyber-hud kit focus ring drawn inside its chamfer clip; toy-press brief uses `shadowToken` / `edgeToken` so `--shadow` is the lip colour and the SwiftUI recipe draws no ink outline; the kit's error colour holds 4.5:1 on the canvas and on the 6% tinted panel ground.

## Isogrid (`isogrid`): added after the four

| key | name | family | order | default mode | influence → our spin |
|---|---|---|---|---|---|
| `isogrid` | Isogrid | graphic | 51 | light | the brand side of a large technology design language (a doubling "2x" grid, very large light display type, isometric line illustration, pictograms) → a grid where every gap, size and type step is twice the one below, outlines instead of fills, and an isometric block drawing of the brand initial as website art |

Display number 42; style count 41 → 42 in `README.md`, `docs/logo-module-brainstorm.md` and the `js/patterns/fit.js` header. The same
acceptance criteria 1 to 7 above apply. Mainframe already covers that company's product system (layered greys, filled
bottom-rule fields, 48px buttons with the label left and the icon right, an uneven stripe raster); Isogrid is built to read
as the opposite on each of those: no fills, outlined fields, tall corner-set buttons, a top-edge selection bar, a lattice drawing.

Key decisions:

- **Doubling.** Spacing 4 / 8 / 16 / 32 / 64 / 128 (`--ig-1` to `--ig-6`), type 12 / 24 / 48 / 96 with body at 16; the board hero
  headline is Plex Sans 300 at up to 96px, line height 1. Panels split on halves (hero, sections) and quarters (the palette is an
  8-column grid: primary and secondary take 4, ink, canvas and accent take 2). The deck cover fits itself (`bdFitCover`).
- **Type.** IBM Plex Sans 300 for display, 400 / 600 for text and controls, IBM Plex Mono 12px for labels and numbers. The 300 weight
  is the existing `@font-face` in `css/aesthetics/mainframe.css` (same variable file, no new download); Isogrid reuses it.
- **Board / deck art only.** An original SVG: the initial from the shared 5 x 7 table stands on 30 degree axes over a faint isometric
  dot lattice, every lit cell extruded 1 to 3 blocks backward. The depths and the filled face set (top, front or right) are seeded from
  the brand name with FNV-1a, so each brand draws a different stack; one face set is filled in the primary, the others are hairline ink.
  Beside it, four cubes of edge 4 / 8 / 16 / 32 show the doubling. Nothing is traced from an illustration kit.
- **App UI (UI kit and phone screens).** White or near-white canvas (dark: near-black), 0 radius, 1px hairline outlines at 3:1 or more
  (`--ab-edge`, which also replaces `--ab-line`), outlined fields, buttons at least 64px with the label top-left and an arrow
  bottom-right (main filled in the primary, secondary a 1px ink outline), selected tab / segment / row / menu item marked by a 4px
  primary bar on its TOP edge, square outlined tags, 1px-outline cards with 32px padding, no shadow, no art, no lattice. The shared
  kit states (rest, pressed, focus, disabled, error, helper text) all work; the focus ring is 2px in the primary, 4px off the edge,
  so it shows on the tall buttons. The 64 / 32 / 32 sizes are set through the kit's own variables (`--k-btn`, `--k-cardpad`,
  `--k-gap`) on the style's root; no shared kit file changed.
- **Colour.** The printed primary is the brand colour whenever it already holds 4.6:1 on the canvas and carries a readable label;
  otherwise it moves along lightness only. Text uses ink, muted and on-* only.
- **Fit lead: `kaleidopix`.** A geometric grid collage built in one quadrant and folded across the sheet (quarters, diamonds, lattices,
  stairs). It is a band-safe pattern that no other suite leads with, so the deck cover and closing strip stay unique (`fit.js` header
  rules); the rest of the suite is `modulargrid` (line), `chevron` (30 degree slope), `glyphgrid`, `parcels` and `counterchange`.
- Registration points as for the four: see `docs/round11/isogrid.md`. Also added to `SHOWCASE_KEYS` (after `tonal-shape`).

## Round 12: Tab Stack, Patchbay, Paddock Pass

Display numbers 43-45 (orders 52-54). Hand-offs: `docs/round11/tab-stack.md`, `docs/round11/patchbay.md`,
`docs/round11/paddock-pass.md`. Registered at the same points as Isogrid, and added to `SHOWCASE_KEYS` after `isogrid`.
Style count 42 -> 45 in `README.md`, `docs/logo-module-brainstorm.md` and the `js/patterns/fit.js` header.

- **Tab Stack** (Digital, default dark). Dark operations-app screens with saturated cards tucked under one another like index tabs -> the brand's own hues lifted to carry one near-black text colour, pill and circle controls, a pressed row pulled up like a tab. Fit lead: `flyposter`.
- **Patchbay** (Digital, default dark). Dark node-graph workflow editors -> a modular-synth patch bay: dark rounded modules, brand colours as ports and name-tag chips, one ink pill as the main action, mono numerals; no wires or grid in the app. Fit lead: `waves`.
- **Paddock Pass** (Graphic, default light). Sci-fi motorsport tickets and team liveries -> the brand as a livery: a hi-vis leading strip from the brightest brand colour (a fill, never text), a race numeral from the brand name, ruled spec rows, boxed-number tags. The hi-vis fixed ink is marked `decorativeOnly: true`. Fit lead: `halftone`.
