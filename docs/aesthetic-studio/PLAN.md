# Aesthetic studio: the editor (2026-11-07)

Coordinator: main session (Opus). Workers: Sonnet, at most two at once, disjoint files. Only the
coordinator edits this file.

## Outcome

A studio makes and refines its own aesthetic in Looks Good, the Nominal Studios way: in rounds.
Dials edit the same spec v2 file an agent writes; **Variations** show three versions that each change
one thing; the studio keeps or kills them, pins notes on the preview, and closes the round. Closed
rounds and notes land in `rounds.json` inside the style's bundle, so an agent pointed at the exported
file can read the open notes and make the next round, and the studio imports it back. No AI box,
prompt field or "describe it" anywhere.

Out of scope: the closest-match % in the UI, editing built-in styles, Mac folder watching.

## Decisions

1. **What the editor edits.** Only "mine" styles (stored in the app). A folder style gets
   **Edit a copy** (duplicate, then open). Built-ins can't be edited.
2. **New style.** Styles home gets **New style**: a dialog asks for a name, the core trick (one
   sentence, required: the mechanism, not the mood) and a starting point: Blank, one of the three
   starters (the Soft Form, Acid Graphics and Editorial Serif rebuilds) or any custom style.
   Starters move to `custom-aesthetics/starters/<key>/` (listed in `custom-aesthetics/index.json`
   under `"starters"`; not registered as styles; `?movelab=1` still shows the rebuilds by loading them
   from there). Blank is the spec template, also kept under `starters/`.
3. **Editor layout.** A full-height view inside the Styles section:
   - **Left: panels** Identity (name, descriptor, summary, core trick, influences, mode, family),
     Colour (colour moves), Material and moves (the `moves` list: add from the catalog by category
     with its one-line `what`, remove, reorder, scope), Kit (component → material + states, grouped),
     Type, Art (generator move + params, or the studio's own SVG/image upload), Voice (motto, kicker,
     labels, copy), Rules (do / don't).
   - **Dials** come from move params: number → slider in its range, enum → segmented or select,
     colour → colour input, bool → switch, text → input. A per-param "Light / Dark differ" toggle
     makes the `{light, dark}` pair.
   - **Centre: live preview** with tabs Board, Kit, Deck cover and Stress (the board top in the six
     stress palettes), the Brand colours select and Light / Dark, as on the Styles home.
   - **Right: the round** (Variations, notes, changes, Close round).
4. **Saving.** Every change autosaves to the stored bundle (debounced), with undo/redo in the editor.
   Preview and variation styles register under temporary keys that never appear in any picker and
   are removed when the editor closes.
5. **Rounds.** A round is open while you work. Dial edits are recorded as plain-word changes
   ("corner-radius: radius 4 → 12"). **Variations** makes three variants of the current spec, each
   changing exactly one axis, picked deterministically from the catalog (material swap for a component
   group, a param step, a colour-recipe swap, a headline treatment, art fit, …); the studio can pin the
   axis (Any, Colour, Material, Type, Corners and edges, Kit, Art). **Keep** applies a variant's change,
   **Kill** discards it. **Notes** pin to what was clicked in the preview (`board.hero`,
   `board.palette`, `kit.<component>`, `deck.cover`, `general`) and can be marked done.
   **Close round** writes the round to `rounds.json` (by "studio", summary, changes, variants with
   verdicts, notes) and stores a snapshot of the aesthetic, so the studio can compare with or go back
   to an earlier round.
6. **Bundle additions.** Optional `versions: [{ round, date, aesthetic }]` (snapshots, newest last,
   capped so the bundle stays under 2 MB). Older bundles without it load as before.
7. **Agent round trip.** `node dev/aesthetic-check.js --unpack <bundle> <dir>` writes a folder;
   `--pack <dir> <bundle>` writes a bundle. The checker's `--render`/`--shots` work for an unlisted
   folder. The `make-aesthetic` skill covers "next round on this exported file": unpack outside the
   index, read open notes, make the round (by "agent", one axis per variant), check, pack; the studio
   imports with Replace and sees the agent's round waiting for review.

## Module contracts

`js/studio-rounds.js` (E2, pure, no DOM; loads after `js/custom-aesthetics.js`):

```
window.StudioRounds = {
  AXES,                                  // [{ id, label }] Any, colour, material, type, edges, kit, art
  variations(spec, { axis, seed, count = 3, catalog }),
                                         // -> [{ id, axis, change: "plain words", spec }]; each spec differs
                                         //    from the input on exactly one axis and passes validation
  diff(before, after, catalog),          // -> ["plain-word change", …] (params, moves, kit, art, fields)
  openRound(rounds, { by }),             // -> rounds with a new open round (n = last + 1)
  addNote(rounds, { target, text }),     // -> { rounds, note }   ids unique across all rounds
  setNote(rounds, id, { status }),       // open | done (doneIn = current round n)
  recordVariant(rounds, { change, verdict }),
  recordChanges(rounds, changes),
  closeRound(rounds, { summary, date }), // -> rounds with that round closed
  current(rounds),                       // the open round or null
  snapshot(bundle, n, spec),             // -> bundle with versions[] appended (capped)
}
```

`js/studio.js` + `css/studio.css` (E1): `window.Studio = { open(key), close(), isOpen() }`; the
Styles home calls `Studio.open(key)` from New style, Edit and Edit a copy.

## Tasks

| ID | Owner | Writes | Depends | State |
|----|-------|--------|---------|-------|
| E1 | Sonnet | editor shell, panels, dials, preview, new-style flow, starters move, autosave, undo | none | accepted (starter deck fields dropped: fixed in E3) |
| E2 | Sonnet | `js/studio-rounds.js`, node tests, checker pack/unpack/unlisted render, skill + AUTHORING round-trip | none | accepted (309 tests, 252 one-axis variation checks, byte-equal round trip) |
| E3 | Sonnet | round panel UI in the editor (Variations, keep/kill, notes pinned on preview, close round, versions) + deck whitelist, checker starters scan | E1, E2 | accepted (rev 3: cards crop to the change, invisible variants filtered) |
| V | Coordinator | browser checks, review, commit | E3 | accepted |

## Not done here

- Variation steps can be small (e.g. a 1 → 2.8 px radius): visible, but subtle at card size.
- Colour, type and art variants aren't checked for a visible difference (the runtime has no
  token read-out without drawing).
- Pins are working state only; the notes persist, the pin positions don't.
- Closest-match % in the UI and Mac folder watching stay out of scope.
- Testing on port 8090 (plain http.server) can run stale cached scripts; hard-reload. The app's own
  launcher (`tools/serve.py`) sends no-cache.
