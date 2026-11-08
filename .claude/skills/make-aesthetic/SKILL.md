---
name: make-aesthetic
description: Creates a new aesthetic (visual style) for the Looks Good repo from an idea, as a checked, screenshotted spec folder under custom-aesthetics/ (loads in the normal app), built in rounds. Use when asked to "make an aesthetic from this idea", "new style", "create a look from...", "next round on an aesthetic", or to react to open notes in an aesthetic's rounds.json. Not for editing built-in styles or app code.
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
   `mkdir -p custom-aesthetics/<key> && rsync -a --exclude README.md docs/aesthetic-spec/template/ custom-aesthetics/<key>/`
   then set `"key"` to `<key>` and `meta.family` to one of tactile, graphic, digital, print, luminous.
4. Add `"<key>"` to the `aesthetics` array in `custom-aesthetics/index.json` now, before the first check (re-read the file
   right before editing; add only your key; AUTHORING.md section 9 step 2 has the exact command).
5. Run the loop below until the definition of done in AUTHORING.md section 10 holds.

## Next round on an existing aesthetic

Read `custom-aesthetics/<key>/rounds.json`, take the notes with `"status": "open"`, change one
axis per variant, run the loop, then write the new round and mark addressed notes `done` with `doneIn`.

## Next round on a studio's file

The owner hands you `<key>.aesthetic.json` exported from the studio. Full steps: AUTHORING.md section 12.

```
node dev/aesthetic-check.js --unpack <file> <scratch>/<key>          # scratch dir outside custom-aesthetics/, never in index.json
# read rounds.json: open notes, last round's kept and killed variants; edit aesthetic.json (one axis per variant);
# append your round (by "agent", next n, notes done with doneIn, no "open" key)
node dev/aesthetic-check.js <scratch>/<key>
node dev/aesthetic-check.js <scratch>/<key> --render <port> --shots    # works on the unlisted folder
node dev/aesthetic-check.js --pack <scratch>/<key> <scratch>/<key>.aesthetic.json
```

Order: static check, render with shots (`--out <scratch>/shots-r<n>`), read the PNGs, pack; re-run pack after any late fix. Reuse a server already running at the repo root. When materials change, refresh `build.surface`, `build.pressText`, `build.icons`, `build.appIcon`, `meta.fonts.why`, `labels.material`, `rules.do`, `rules.dont`. A variant tuned in place before keeping: record the final value in its change text and name the values tried and dropped ("fleck 1.6 (2.2 tried, too big)").

Then tell the owner the packed path and to import it in Styles with Replace.

## The loop (exact commands, repo root)

```
node dev/aesthetic-check.js custom-aesthetics/<key>
python3 -m http.server <port>        # background; any free port, e.g. 8412 (lsof -i :8412 prints nothing)
node dev/aesthetic-check.js custom-aesthetics/<key> --render <port> --shots
```

Shots use one pinned preview brand (recorded in `shots/palette.txt`; `--palette <hex>` overrides the primary).
Then Read every PNG in `custom-aesthetics/<key>/shots/` (board, kit-top, deck; light and dark),
run the "review your own shots" checklist (AUTHORING.md section 9 step 7), record the round in `rounds.json`, and stop the server. Fix every FAIL before rendering.
Regenerate the move catalog after adding a code move: `dev/aesthetic-spec-catalog.sh` (keep the regenerated `moves.md`). Code moves: `tokens()` runs for listed moves, then kit-only material/state moves with default params (`kit.params` don't reach it); start `what` with `Board:` or `Kit:` for one-scope moves; an SVG on a hardcoded paper colour hardcodes its ink too (AUTHORING.md sections 7, 8).

## Hard rules

- Only write under `custom-aesthetics/<key>/` (or the scratch folder of a studio round-trip; plus a new `js/moves/<name>.js` and a `<script>` tag for it in `index.html` after the last `js/moves/` script tag when a code move is truly needed).
- Never edit app code, built-in styles, `js/aesthetic-spec.js`, `js/moves/core.js` or the checker.
- Never copy a built-in's CSS. Never add AI UI to the product.
- Board art stays off app and Built screens. Every kit component is styled. Glass is clear, never frosted.
- If the checker, runtime and SPEC-v2.md disagree, stop and report it.
