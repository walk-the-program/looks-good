# Move audit and rebuild test (2026-11-06)

Coordinator: main session (Opus). Workers: Sonnet. Ledger lives here; only the coordinator edits this file.

## Outcome

Find out whether the 45 built-in aesthetics break down into a reusable **move library** that a
custom-aesthetic framework (UI for studios, file + checker for agents, no AI box in the product)
can be built on. Proof: rebuild three very different styles from moves only and compare them
with the originals.

Excluded: no product UI changes, no edits to any existing `js/aesthetics/*.js` or
`css/aesthetics/*.css` file, nothing under `classic/`.

## Acceptance criteria

1. Every one of the 45 current styles has an audit record: core trick, colour recipe, the moves
   it uses, and the remainder (what only bespoke code does), with file:line evidence.
2. One merged move library (`move-library.json` + `move-library.md`): deduplicated ids, params,
   which styles use each move, how each can be expressed (tokens / css-recipe / svg-generator /
   needs-code), palette-agnostic, export-safe, app-safe.
3. Soft Form, Acid Graphics and Editorial Serif are rebuilt from a spec file of moves only,
   loaded behind `?movelab=1` (invisible in the normal app), rendering board + kit.
4. Original vs rebuild screenshots (light + dark where the style has both), taken headless.
5. Findings doc with a per-style score, what was lost, and the verdict on the framework.

## Tasks

| ID | Owner | Writes | Depends | State |
|----|-------|--------|---------|-------|
| A1–A9 | Sonnet x9 | `docs/move-audit/parts/<group>.json` | none | accepted (45 styles, 511 raw moves, 389 ids) |
| R0 | Sonnet | `docs/move-audit/runtime-notes.md`, `dev/move-lab/shoot.sh` | none | accepted |
| M1 | Sonnet | `docs/move-audit/move-library.{json,md}` | A1–A9 | accepted (198 merged moves) |
| B1 | Sonnet | `js/aesthetic-spec.js`, `js/moves/core.js`, `dev/move-lab/lab.js`, `dev/move-lab/specs/smoke.js`, one guarded line in `index.html` | R0 | accepted |
| B2–B4 | Sonnet x3 | `js/moves/<soft|acid|editorial>.js`, `dev/move-lab/specs/<style>.js`, `docs/move-audit/shots/<style>/` | M1, B1 | accepted (self-est. 75–85% on rendered surfaces) |
| B5 | Sonnet | runtime meta/state/radius fixes, pinned `shoot.sh`, re-shoot all pairs | B2–B4 | accepted (kit crops repaired by coordinator) |
| F1 | Coordinator | `docs/move-audit/findings.md`, `docs/move-audit/compare.html` | B5 | accepted |

S1 folded into B2–B4 (each worker shoots original vs rebuild). Shared move ids: core canonical;
Editorial owns outline-frame, focus-ring, kit-cell-frame, catalogue-number, section-number-marker,
palette-board-form, hero-layout, highlight-word, mono-plus-accent; Soft owns state-signature;
others register `<id>--<worker>` duplicates.
| F1 | Coordinator | `docs/move-audit/findings.md` | S1 | planned |

Groups (alphabetical, 5 each):
A acid-graphics, ascii-art, aurora-noir, bauhaus-poster, bento-grid ·
B blob-tracking, blueprint, clay, corporate-vandalism, cyber-hud ·
C data-pebble, dystopian-luxury, editorial-serif, frutiger-aero, gorpcore ·
D holo-iridescent, industrial-device, isogrid, japanese-minimal, liquid-glass ·
E live-tile, mainframe, mesh-gradient, micrographics, mid-century ·
F mixed-type, naive-doodle, neo-brutal-pop, old-web, paddock-pass ·
G patchbay, pirate-broadcast, pixel-arcade, radical-memphis, raw-brutalist ·
H retro-futurist, riso-print, soft-form, tab-stack, tonal-shape ·
I toy-press, transit-wayfinding, wpa-screenprint, xerox-punk, xerox

## Audit part schema (contract rev 1)

```json
{
  "group": "A",
  "styles": [{
    "key": "acid-graphics", "name": "Acid Graphics",
    "coreTrick": "one sentence: the mechanism, not the mood",
    "colourRecipe": "plain words: what happens to the client primary, the fallback for a muted one",
    "moves": ["move-id"],
    "remainder": [{ "what": "", "where": "file:line", "whyCode": "" }],
    "moveCoverage": 0,
    "notes": ""
  }],
  "moves": [{
    "id": "kebab-case", "category": "colour|material|type|layout|ornament|pattern|motion|kit|voice|structure",
    "name": "", "what": "one sentence",
    "params": [{ "name": "", "kind": "number|enum|colour|bool|text", "range": "", "default": "" }],
    "usedBy": [{ "key": "", "where": "file:line-line", "variant": "how this style's use differs" }],
    "expressibleAs": "tokens|css-recipe|svg-generator|needs-code",
    "paletteAgnostic": true, "exportSafe": true, "appSafe": true,
    "kitScope": ["button"], "conflictsWith": []
  }]
}
```

`moveCoverage` = the worker's estimate of how much of the style's look (0–100) the listed moves
carry; the rest is the remainder. `appSafe` false = board/website art only (app screens use the
kit only). The same idea with different settings is one move with params, not two moves.

Seed ids (reuse when the idea matches; add new ones freely):
colour: `primary-push-chroma`, `equal-luminance-clash`, `mono-plus-accent`, `duotone-ink`,
`tonal-ramp`, `tinted-neutral-canvas` · material: `hard-offset-shadow`, `soft-raised-relief`,
`recessed-field`, `glossy-single-action`, `clear-glass-panel`, `hairline-rule`, `heavy-border`,
`corner-radius`, `grain-overlay`, `halftone-dots` · type: `outline-echo-headline`,
`stretched-display`, `caps-mono-labels`, `tight-display-tracking`, `mixed-face-headline` ·
layout: `hidden-column-grid`, `bento-cells`, `info-strip` · ornament: `barcode-serial`,
`registration-marks`, `catalogue-number` · kit: `ink-filled-selected`, `named-states`.
