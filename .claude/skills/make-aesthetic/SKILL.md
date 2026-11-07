---
name: make-aesthetic
description: Creates a new aesthetic (visual style) for the Looks Good repo from an idea, as a checked, screenshotted spec folder under dev/move-lab/specs/, built in rounds. Use when asked to "make an aesthetic from this idea", "new style", "create a look from...", "next round on an aesthetic", or to react to open notes in an aesthetic's rounds.json. Not for editing built-in styles or app code.
---

# Make an aesthetic

Source of truth: `docs/aesthetic-spec/AUTHORING.md`. Read it fully before starting; it has the
12 stages, the field map, the rules and the definition of done. This file only routes you.

Related files:
- Contract: `docs/aesthetic-spec/SPEC-v2.md`
- Starter files: `docs/aesthetic-spec/template/` (`aesthetic.json`, `rounds.json`, `art/hero.svg`)
- Move catalog (ids, params, ranges): `docs/aesthetic-spec/moves.md`
- Runtime and `registerMove`: `dev/move-lab/README.md`
- Worked example: `dev/move-lab/specs/smoke--moves/`

## New aesthetic

1. Read AUTHORING.md. Pick a `<key>` (kebab-case, 3-48 chars, no built-in key).
2. Write the core trick (one sentence mechanism), colour recipe and material before touching JSON.
3. Start from the template:
   `mkdir -p dev/move-lab/specs/<key> && rsync -a --exclude README.md docs/aesthetic-spec/template/ dev/move-lab/specs/<key>/`
   then set `"key"` to `<key>` and `meta.family` to one of tactile, graphic, digital, print, luminous.
4. Add `"<key>"` to `dev/move-lab/specs/index.json` now, before the first check (re-read the file
   right before editing; add only your key; AUTHORING.md section 9 step 2 has the exact command).
5. Run the loop below until the definition of done in AUTHORING.md section 10 holds.

## Next round on an existing aesthetic

Read `dev/move-lab/specs/<key>/rounds.json`, take the notes with `"status": "open"`, change one
axis per variant, run the loop, then write the new round and mark addressed notes `done` with `doneIn`.

## The loop (exact commands, repo root)

```
node dev/aesthetic-check.js dev/move-lab/specs/<key>
python3 -m http.server <port>        # background; any free port, e.g. 8412 (lsof -i :8412 prints nothing)
node dev/aesthetic-check.js dev/move-lab/specs/<key> --render <port> --shots
```

Shots use one pinned preview brand (recorded in `shots/palette.txt`; `--palette <hex>` overrides the primary).
Then Read every PNG in `dev/move-lab/specs/<key>/shots/` (board, kit-top, deck; light and dark),
run the "review your own shots" checklist (AUTHORING.md section 9 step 7), record the round in `rounds.json`, and stop the server. Fix every FAIL before rendering.
Regenerate the move catalog after adding a code move: `dev/aesthetic-spec-catalog.sh`.

## Hard rules

- Only write under `dev/move-lab/specs/<key>/` (plus a new `js/moves/<name>.js` and its entry in `MOVE_FILES` in `dev/move-lab/lab.js` when a code move is truly needed).
- Never edit app code, built-in styles, `js/aesthetic-spec.js`, `js/moves/core.js` or the checker.
- Never copy a built-in's CSS. Never add AI UI to the product.
- Board art stays off app and Built screens. Every kit component is styled. Glass is clear, never frosted.
- If the checker, runtime and SPEC-v2.md disagree, stop and report it.
