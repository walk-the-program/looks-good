# Mobile UI refinement — shared brief (2026-10-18)

The owner reviewed the Built view and found small-detail failures: list-row labels nearly touching the card edge, a red destructive button that is nowhere in the brand, card shadows too dark, a hard black edge under the selected segment. App UI must look designer-finished at the detail level in every style.

## Scope (what a refiner looks at)
For each style you own, in the Built view:
- **Mobile app** tab: Welcome and Home phones.
- **UI kit** tab: every component cell (all states) and the five Screen layout phones.
Check light and dark (if the style/brand has a dark mode), and with two brands: "Soft Hours" (wellness) and "Signl" (a math-practice app; set `state.content.brandName='Signl'; state.content.tagline='Scroll math, not social media'`).

## Detail checklist
1. **Insets.** Text and icons sit at least 16pt from any container edge (rows, cards, buttons, fields, segmented cells, callouts, badges have at least 8pt horizontal). Row content aligns with the section label above it and with the 20pt screen margin.
2. **Nested radii.** Inner radius = outer radius − padding (never an inner corner rounder than its container).
3. **Shadows.** Soft and low: large blur, low opacity, offset small. No near-black shadows or hard dark edges unless they are the style's signature (then thin and deliberate, never on a selected segment or small chip).
4. **Colour.** Only the brand's palette and the style's neutrals. No hue that isn't in the palette (no default red, green, blue, yellow). Status and destructive come from the palette (see global rules).
5. **Type.** UI_KIT_PHONE sizes and line heights; weights the face actually has; no word splits, truncation, orphaned single words in headlines where a balanced break is possible; labels vertically centred in their control.
6. **Rhythm.** Spacing from the 4/8 scale; equal gaps between equal things; groups separated by ~28pt.
7. **Targets.** Everything tappable ≥44pt tall.
8. **Icons.** One size and stroke weight per context, optically centred with their label.
9. **States.** Rest/pressed/focus/disabled/error clearly different but in the same family.
10. **Contrast.** Body text ≥4.5:1, large text and UI edges ≥3:1, in light and dark.
11. **No art.** No illustration, pattern, plate or decorative band in app screens.
12. **Character.** Keep the style's personality (its edges, type treatment, texture on components). Refine, don't flatten it into a generic look. The owner's favourites (dystopian-luxury, old-web, pirate-broadcast, blob-tracking, xerox, xerox-punk, acid-graphics, corporate-vandalism, radical-memphis, ascii-art, micrographics, gorpcore, naive-doodle, bento-grid, mesh-gradient, soft-form, holo-iridescent, aurora-noir, industrial-device, blueprint) must stay recognisably themselves.

## Global rules (handled by the global-fixes worker in base files; refiners don't redo these)
- Grouped list rows get proper inner padding in base CSS.
- Destructive and status (callout) colours derive from the brand palette; no hard-coded red/green/amber.
- Base kit shadows softened; selected segment uses a soft shadow, no hard bottom edge.

## How to check (no visible windows)
- Static server: http://localhost:8090 (already running; never start another).
- Offscreen WebKit harness: `/private/tmp/claude-501/-Users-walker-tracy-Desktop-Branding-Designer/484205c6-3490-4a17-ae0f-5356f3fadf36/scratchpad/f1/wk2` with helper `common.js` in the same folder. Usage: write a probe `X.js`, then `(echo "try{"; cat common.js X.js; echo "}catch(e){return 'EX '+e.message}") > run.js; ./wk2 http://localhost:8090/ 1400 1000 run.js <out.png or -> 0.3`. Put your probes and screenshots in your own folder `scratchpad/<your task id>/` (copy common.js there; reference wk2 by absolute path). Set `ONLY=['key',...]` before common.js to limit styles.
- In page: `applyAesthetic('key'); render(); Show.built('mobile'|'kit');` Classic version: `setAestheticVersion('classic')` (only if `hasClassicAesthetic(key)`).
- Look at screenshots (zoom in on phones) as well as measuring. Measurements catch overflow; only your eyes catch "too close", "too dark", "off-brand".

## Hard rules
- Never launch visible apps, kill processes, or run git stash/reset/checkout. Don't commit.
- Write only the files your packet owns.
