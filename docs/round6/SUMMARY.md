# Round 6 — summary

Request (2026-10-11): an even harsher review, 10+ new aesthetics from research into popular missing ones, the
ability to blend two aesthetics, then a harsh and severe QC of everything, clean everything, document it all so
any step can be rolled back. Done autonomously. Rollback: `docs/round6/ROLLBACK.md`.

## What changed
- **48 aesthetics** (was 36). Researched in `docs/research/round6.md`: frutiger-aero, naive-doodle, wabi-sabi,
  dark-academia, mid-century, art-nouveau, transit-wayfinding, gorpcore, old-web, big-top, gummy, curio-cabinet.
  Build logs: `docs/round6/build-b6{a,b,c,d}.md`.
- **Blend any two aesthetics** (`js/blend.js`, `docs/blend.md`). The base keeps structure; the donor lends art,
  type, colour, patterns and/or material (Subtle / Balanced / Bold or per channel). Board, deck, Patterns view and
  AI brief follow; saved with the brand; one undo step; `BLEND_ENABLED` kill switch.
- **Harsh review of all 36 existing aesthetics** (`docs/adversarial-review/round6/hr1–hr6`, scores 3–6/10), then
  every ranked fix applied (fix and adoption logs at the end of each review).
- **Framework**: native "In product" and "Do and don't" slides built from each aesthetic's own parts; hooks for
  product scenes, Do/Don't marks, material art, patterns stage, panels, states, structure order; deck radius
  from the aesthetic; `font-synthesis: none`; fixed pattern colourways (tonal, spectrum, broadcast, primaries,
  earth, brass, safety, hud, toner); pattern contrast floor; one safe hook runner; shared weight helpers;
  state-aware tokens. Contract: `docs/aesthetics-plan.md`.
- **Pattern ownership**: every aesthetic that shows a deck cover band owns a unique lead pattern
  (`docs/patterns.md`, "Round 6 suite ownership").
- **Export (PNG/PDF)**: html2canvas gaps fixed in a prepare step (shadows, switch knobs, inline-flex text,
  border-image/clip-path/filter baking, SVG web fonts, vertical text, WebKit-safe backgrounds) —
  `docs/brand-deck.md`.

## Severe QC
Four visual inspectors and one code auditor (`docs/round6/qc/qc1–qc5`): 15 BLOCKER, 174 MAJOR, 202 MINOR visual
defects plus 35 code findings. All BLOCKER and MAJOR items fixed (per-defect logs at the end of each report);
declined items carry a measured reason there.

## Where the evidence lives
Reviews and QC reports in this folder and `docs/adversarial-review/round6/`; screenshots and scripts in the
session scratchpad (not in the repo). Tests: `node tests/run.js` (67+ checks).
