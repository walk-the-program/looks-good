# Template notes

Copy with `rsync -a --exclude README.md docs/aesthetic-spec/template/ custom-aesthetics/<key>/`
(this file is not part of a spec folder), set `"key"`, then follow `docs/aesthetic-spec/AUTHORING.md`.

- `meta.family` must be one of `tactile`, `graphic`, `digital`, `print`, `luminous`
  (`AESTHETIC_FAMILIES` in `js/aesthetic-meta.js`). The template says `graphic`.
- `kit` maps all 70 components and varies by group: controls that act (hard-offset primary, outlined
  and quiet-text secondaries), fields that take input (outlined), choosers (flat-fill with
  `ink-fill-selected`), surfaces that hold (hard-offset card, flat panel), overlays (hard-offset),
  navigation (flat or quiet-text), feedback (flat-fill, outlined), data display (flat or outlined).
  Change materials component by component to fit the look; see the cheat sheet in AUTHORING.md section 5.
- `art/hero.svg` may use `var(--ab-primary,#hex)` and the other `--ab-*` roles so the art follows the
  client palette (AUTHORING.md section 7).
- Add the key to `custom-aesthetics/index.json` (`"aesthetics"` array) before the first static check.
