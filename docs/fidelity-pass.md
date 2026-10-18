# Style fidelity pass

Date: 2026-10-17. Goal: make each of the 35 aesthetics unmistakably its named style, across Board, Built and Deck, while keeping UI fun and legible. Before/after screenshots of every changed style are in the private review artifact (https://claude.ai/artifact/CiMcNRFEec7KB9k8HBmgL1).

Revert point: the tag `r10-0-before-fidelity`. Each style is in its own commit, so one style can be undone alone:

```bash
git checkout r10-0-before-fidelity -- js/aesthetics/<key>.js css/aesthetics/<key>.css
```

## How it was done

1. **Audit.** Each style was compared against real references for it. The before shots use one brand, Tessel. Each style was scored 1–10, its gaps were ranked by how visible they are in product UI, and a list of what to keep was recorded.
2. **Shared fixes.**
   - Switching style now applies that style's recommended fonts, unless Type is locked. Before this, editorial-serif had no serif and gorpcore wasn't condensed.
   - Shuffle everything and the spin reel now land on one of the style's own font pairings.
   - Logos flip colour or sit on a plate when they would disappear on dark surfaces.
   - Built stat values scale to fit instead of truncating.
   - Shared Built text (muted text, the danger button, the current tab) holds 4.5:1 contrast in every style.
3. **Per-style work.** Low-scoring styles were reworked. Favourites got only their one audited gap fixed.
4. **The AI brief follows the board.**
   - Font pairings, press effects, motion (a new gel spring and an ambient-drift line) and surface notes were updated in `js/aesthetic-meta.js`.
   - Colours a style fixes regardless of the brand are printed as they're drawn:
     - japanese-minimal's vermilion accent;
     - riso-print's fluorescent accent;
     - mid-century's period inks;
     - the decorative planes in bauhaus-poster and cyber-hud.
   - These appear in the Colors table, tokens.css and Theme.swift.

## Scores (audit before → builder's estimate after)

| Style | Before | After | Kind |
|---|---|---|---|
| mid-century | 4 | 8.5 | rework (now real mid-century: cut paper, starbursts, period inks; no CRT or trefoil) |
| retro-futurist | 5 | 8 | rework |
| editorial-serif | 5 | 9 | rework |
| liquid-glass | 6 | 8 | rework |
| mesh-gradient | 6 | 7.5 | favourite, one gap |
| pixel-arcade | 6 | 8.5 | rework |
| raw-brutalist | 6 | 8 | rework (raw web, distinct from neo-brutal-pop) |
| riso-print | 6 | 7.5 | rework |
| bauhaus-poster | 6 | 9 | rework |
| cyber-hud | 6 | 9 | rework |
| aurora-noir | 6 | 8.5 | favourite, one gap |
| clay | 7 | 8.5 | rework |
| japanese-minimal | 7 | 8.5 | rework |
| acid-graphics | 7 | 8.5 | favourite, one gap |
| gorpcore | 7 | 9 | shared fixes only |
| mixed-type | 7 | 8 | light touch |
| neo-brutal-pop | 7 | 8.5 | light touch |
| xerox | 7 | 8 | favourite, one gap |
| ascii-art, blob-tracking, holo-iridescent, corporate-vandalism, dystopian-luxury, bento-grid, frutiger-aero, old-web, naive-doodle, micrographics, radical-memphis, soft-form, transit-wayfinding | 8 | 8.5–9 | light touch |
| pirate-broadcast, xerox-punk | 8 | 8 | shared logo and stat fixes, small contrast fixes |
| blueprint, industrial-device | 9 | 9 | unchanged |

The "after" numbers are the builders' own estimates and haven't been independently re-scored.

## Also fixed

- **No fake security captions.** corporate-vandalism now reads "MEMO // FOR INTERNAL FEELINGS ONLY", and dystopian-luxury's state captions read "Catalogued / Private / Reserved".
- **dystopian-luxury crop.** The giant brand-name crop now reads as the name (it had read "TESSFI").
- **transit-wayfinding** works in light mode as well as dark.

## Not checked

- PNG/PDF export through html2canvas, in the browser version only. It hasn't been checked for xerox's masked dust or naive-doodle's SVG graph-paper tile. The Mac app exports through WebKit itself.
- The remaining contrast-scan flags sit on text over pseudo-element or gradient backgrounds that the scanner can't read. Spot checks looked fine, but not every one was viewed.
