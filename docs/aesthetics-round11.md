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
