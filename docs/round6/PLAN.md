# Round 6 — expansion, blending, harsh review, severe QC

Owner request (2026-10-11): an even harsher review set; 10+ more aesthetics from research into popular
ones that are missing; the ability to blend 2 aesthetics; then a harsh, severe quality-control pass over
every aesthetic; clean everything; document everything so any step can be rolled back at once. Fully
autonomous, no questions.

## Phases, owners, rollback points
| Phase | What | Owner | Git tag after |
|-------|------|-------|---------------|
| 0 | Baseline (36 aesthetics, round-5 + adversarial fixes) | coordinator | `r6-0-baseline` |
| 1 | Research missing aesthetics → docs/research/round6.md | R6 (Opus, web) | — |
| 2 | Blend engine (procedural, any 2 aesthetics) | BL (Opus lead) | `r6-2-blend` |
| 3 | Scaffold + build 10–12 new aesthetics | P6 (Sonnet) then B6a–c | `r6-3-new-aesthetics` |
| 4 | Harsh adversarial review of all aesthetics (existing 36 now, new ones after phase 3) | HR1–HRn (Opus) | — |
| 5 | Apply harsh-review fixes | FX6a–d | `r6-5-harsh-fixes` |
| 6 | Severe QC (visual + code) of everything incl. blends; cleanup | QC (Opus) + fixers | `r6-6-qc` |
| 7 | Final gate: tests, gore all, WebKit, Mac build | VER | `r6-final` |

Rollback instructions live in `docs/round6/ROLLBACK.md` and are updated at every tag.

## Shared decisions
- **Blend is procedural**, not hand-authored combos (36×35 pairs → impossible to hand-tune; procedural
  scales to new aesthetics automatically). Model (from design-blend-lab: give each influence a job):
  - `state.aesthetic` stays the **base** — owns structure: layout, components, CSS scope, mode default.
  - `state.blend = { with: <key>, channels: {...}, strength }` names the **donor** and which channels it
    supplies. Channels: `art` (hero illustration), `type` (font pairing + display treatment), `color`
    (palette treatment / highlight / accent handling), `patterns` (suite), `material` (ornament,
    surfaces, states). Strength presets: Subtle (art+patterns) · Balanced (art+type+patterns) ·
    Bold (all channels). Manual channel toggles override.
  - Base wins conflicts on structure and accessibility; donor wins only on its granted channels.
  - Brief: a "Blend" section naming dominant/supporting systems, per-channel source, merged do/don't
    with contradictions removed (and stated).
  - Kill switch: one constant `BLEND_ENABLED` hides the UI and ignores `state.blend` (old brands load
    unchanged; brands saved with a blend load as the base alone).
- **New aesthetics** follow the round-5 contract (docs/aesthetics-plan.md + aesthetics-round5.md):
  register via js/aesthetics/registry.js pattern, own js+css file, meta entry, 6-pattern suite, fonts.
- **Harsh review bar**: score against the best work in the world, not "good for an app". Nothing above
  7/10 without named evidence. Every aesthetic gets ≥3 concrete fixes, plus a distinctness check against
  its nearest neighbours.
- Third-party code rule unchanged: never open anything under ~/Desktop/Ptrn.
- One writer per file at a time; shared files (index.html, js/data.js, js/aesthetic-meta.js,
  js/patterns/fit.js, framework js) are owned by the task named in its packet only.

## Acceptance (whole round)
1. ≥10 new aesthetics, each researched with cited premium references, distinct from all existing ones.
2. Any 2 aesthetics can be blended from the UI; board, deck (0 gore) and brief reflect the blend;
   persisted, undoable, kill-switchable.
3. Every aesthetic (old + new) reviewed harshly; all top fixes applied or declined with a reason.
4. Severe QC: no gore, no overflow at 390px, no console errors, contrast ≥4.5:1 body text, works in
   WebKit, dead code removed, docs current.
5. Every phase committed and tagged; ROLLBACK.md says exactly how to undo each.
