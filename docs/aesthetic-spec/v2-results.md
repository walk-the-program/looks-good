# Spec v2: what was built and what it showed (2026-11-06)

Contract: [SPEC-v2.md](SPEC-v2.md). Agent guide: [AUTHORING.md](AUTHORING.md), with the repo skill
`.claude/skills/make-aesthetic/`. Everything still loads only with `?movelab=1`; the app is
unchanged without it (45 styles, clean console, `node tests/run.js` passes).

## Built

- **An aesthetic is a folder of plain files**: `dev/move-lab/specs/<key>/aesthetic.json`, optional
  `art/` and `rounds.json`, listed in `specs/index.json`.
- **Runtime v2** (`js/aesthetic-spec.js`): JSON loading, per-mode params (`{light, dark}`), a token bus
  between moves, board/kit scoping, collision errors, a move catalog, 70 kit components (was 28),
  and an art slot that takes a generator, the studio's own SVG (sanitised) or an image.
- **Checker** (`dev/aesthetic-check.js`): static checks with no server; `--render <port>` for console
  errors, contrast across 6 stress palettes in light and dark, and highlight/accent text;
  `--shots` with a pinned palette so rounds compare; `--list-moves`; `--self-test` (16 fixtures).
- **Move catalog** (`docs/aesthetic-spec/moves.md`, 158 moves, indexed by category and purpose),
  a template, and the authoring guide.
- **The three rebuilds** (Soft Form, Acid Graphics, Editorial Serif) migrated to JSON with duplicates
  merged; each now styles all 70 kit components. Static and render checks: 0 fail, 0 warn.

## The test that matters: a new aesthetic from one line

A fresh agent was given only "Darkroom: a photo darkroom under the safelight: contact sheets, film
edges with frame numbers, grease-pencil marks on the picks, chemical trays" and the repo skill.

- **Rounds 1–2 (agent alone):** passed every check and was only 39% similar to its nearest built-in,
  but it read as a generic dark theme: no safelight, a small hero, plain boxes.
- **Studio review:** four notes pinned in `rounds.json` (n5–n8), as a studio would in the UI.
- **Round 3 (a second fresh agent, working from the notes):** a fixed red-amber safelight cast that
  holds whatever the client colour is, a full-width contact sheet with rebates and frame numbers,
  film-frame cards with perforated edges, and a grease-pencil pick in the client's colour. Checked on
  the pinned palette and a red alternate: 0 fail.

What this shows: the framework and the agent path work end to end, and the round loop is where the
quality comes from. An agent's first pass is a competent theme. Reviewer notes turn it into an
aesthetic. That is the process to build the studio UI around.

## Friction fixed along the way

Ports, index editing order, a kit cheat sheet by component group, the catalog index, `--ab-*`
colours inside SVG art, `meta.family` values, coloured-text contrast, pinned shot palettes, when to
write a code-tier move, how much the second mode needs, a self-review checklist, token overrides and
helpers for code moves, how `layout.hero` sizes the art slot, unique note ids, and retrying a render
after a browser session collision.

## Open (spec v3 list)

1. **CSS priority.** Generated kit rules lose to some base kit selectors, so move files use
   `!important` (34 times). The runtime should emit rules with enough priority on its own.
2. **Tall screenshots.** `dev/move-lab/shoot.sh` element shots corrupt below 16,384px on the full
   kit page. The checker's own `--shots` crops the top 4,000px, so it is unaffected.
3. **Palette block vs cast.** Darkroom's palette swatch shows the raw canvas hex, not the cast canvas.
4. **Rebuild leftovers.** Each rebuild lists its weakest components in its worker report (for
   example Soft Form's split-button corners and Editorial's popup tip); worth one polish round each.
5. **Product side.** Loading custom aesthetics without `?movelab=1`, the aesthetic library (built-in,
   mine, imported), and the studio UI (dials, Variations, pinned notes writing `rounds.json`).
