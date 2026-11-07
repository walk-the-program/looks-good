# Aesthetic spec v2 (contract, 2026-11-06)

Coordinator-owned. Workers implement this; changes go through the coordinator. It builds on the
v1 runtime documented in `dev/move-lab/README.md` and closes the gaps in
`docs/move-audit/findings.md` §4. Since 2026-11-07 the runtime, the move files and custom
aesthetics load in the normal app (`js/custom-aesthetics.js`, and `index.html` loads every `js/moves/*.js`);
only the lab specs (smoke and the `--moves` rebuilds) still need `?movelab=1`. Library and loading: `docs/aesthetic-library/PLAN.md`.

## 1. Files

One folder per aesthetic: `custom-aesthetics/<key>/` for real aesthetics (listed in
`custom-aesthetics/index.json` as `{ "aesthetics": ["darkroom"] }`), or `dev/move-lab/specs/<key>/`
for lab specs (listed in `dev/move-lab/specs/index.json`). Imported styles live in the app's
`aesthetics` library collection as one bundle file, `<key>.aesthetic.json`:
`{ "format": "looks-good-aesthetic", "version": 1, "aesthetic": {…}, "rounds": {…}|null, "art": { "art/hero.svg": "…" }, "versions": [ … ] }`.
`versions` is optional (studio snapshots, newest last, capped so the bundle stays under 2 MB; older bundles without it load
as before): `[ { "round": 2, "date": "2026-11-07", "aesthetic": {…spec 2, same key…} } ]`. As a folder it is
`versions.json` = `{ "versions": [ … ] }`. The checker's `--unpack <bundle> <dir>` / `--pack <dir> <bundle>` convert between the
two forms (art svg as text, other art as `data:image` URLs; byte-identical round trip).

```
<key>/aesthetic.json   the aesthetic (pure JSON, spec 2)
<key>/art/…            optional art files (svg, png, jpg, webp)
<key>/rounds.json      optional round log (§7)
<key>/shots/…          screenshots written by the checker (committed: they are the round record)
```

Adding an aesthetic = add its folder and one line to the matching index. Move files (code tier) stay
in `js/moves/*.js` and are loaded by `index.html`.

## 2. aesthetic.json

```json
{
  "spec": 2,
  "key": "night-ferry",
  "order": 950,
  "name": "Night Ferry",
  "descriptor": "Three · Words · Here",
  "influences": "plain list",
  "summary": "one sentence",
  "coreTrick": "one sentence: the mechanism, not the mood (required)",
  "motto": "", "kicker": "", "mode": "light|dark",
  "lineage": { "forkedFrom": null, "version": 1 },
  "meta": { },  "build": { },
  "labels": { }, "copy": { }, "layout": { }, "type": { }, "roles": { }, "rules": { "do": [], "dont": [] },
  "highlight": "", "highlightNote": "", "slideShape": "",
  "deck":   { "coverDisplay": 0.8, "principles": [["Title", "One line"]], "do": [], "dont": [], "marks": { "do": "+", "dont": "x" } },
  "colour": [ { "move": "id", "params": { } } ],
  "moves":  [ { "move": "id", "params": { }, "scope": "all|board|kit" } ],
  "kit":    { "<component>": { "material": "name", "state": "name" | ["names"], "params": { }, "scope": "all|board|kit" } },
  "art":    { "hero": { "kind": "generator", "move": "id", "params": { } }
                   |  { "kind": "svg" | "image", "src": "art/hero.svg", "fit": "cover|contain", "alt": "" } }
}
```

- `key`: lowercase kebab-case, 3–48 chars, must not equal a built-in key or another spec's key.
  Rebuilds of built-ins end in `--moves`.
- Meta fields are copied to the def verbatim (same meaning as in `registerAesthetic`).
  `meta` / `build` have the shape of an `AESTHETIC_META` / `AESTHETIC_BUILD` entry.
- `scope` defaults to `all`. `board` = the board and the deck; `kit` = the Built kit and screens.
- `deck` (optional) tunes the brand deck: `coverDisplay` (number 0.2 to 2, the cover headline size factor), `principles`
  (up to 6 `[title, line]` pairs), `do` / `dont` (up to 8 short strings each), `marks` (`{ do, dont }` strings of up
  to 4 characters). `highlightNote` (optional string, up to 400 characters) explains the headline highlight. Stored and
  imported styles may carry both; any other key inside `deck` is refused (no code, no functions).
- Required: `spec`, `key`, `name`, `descriptor`, `coreTrick`, `mode`, `colour`, `moves`, `kit`.

## 3. Params

A param value is a scalar, or a per-mode pair `{ "light": v, "dark": v }`.
The runtime resolves pairs: `tokens()` gets the value for the current mode; `css()` is called once
with light values on `S` and, if any param of that move or kit entry is a pair, once more with dark
values on `SD` (dark scope, higher specificity). Pairs are validated per side like scalars.

## 4. Runtime (js/aesthetic-spec.js) changes

1. **Loader.** `index.html` loads the runtime and move files; `lab.js` then loads `specs/index.json`
   and each `<key>/aesthetic.json` with synchronous XHR (lab only; the app loader `js/custom-aesthetics.js`
   uses async fetch and passes art in `opts.files`) and calls
   `registerSpecAesthetic(json, { base: 'dev/move-lab/specs/<key>/' })`. A missing or invalid file
   logs one `console.error` naming the file and is skipped; the rest load.
2. **`spec: 2` required** for JSON files. v1 JS specs are migrated, not supported side by side.
3. **Token bus.** `ctx.bus` is a fresh object per tokens pass (per render, per mode). Tokens run
   `colour` moves first, then `moves`, in order. Each `tokens()` may read and write `ctx.bus`;
   returned `--props` are also merged into `ctx.bus`. Share with CSS through custom properties.
4. **Scope.** `scope: board|kit` narrows `S` for that move or kit entry (`ctx.S` and `ctx.sel`
   reflect it). `ctx.scope` tells the move which.
5. **Collisions are errors.** A second `registerMove` with an existing id, or a material / state
   name that exists, logs `console.error` and is ignored (the first wins).
6. **`registerMove` adds** `what` (one line, required for new moves) and `libraryId` (the
   `docs/move-audit/move-library.json` id this move implements, or null). The runtime exposes
   `SPEC_LAB.catalog()` returning every move: id, libraryId, category, tier, what, params
   (kind, default, range/options), material/state names, hooks provided.
7. **Kit components.** `KIT_COMPONENTS` covers every component the Built kit actually renders:
   70 since v2 (the original 28 plus lightbox controls, top-bar title, stepper, FAB, calendar,
   dial, split button and the rest; full list in `dev/move-lab/README.md`). Names stay kebab-case.
8. **Art slot.** `art.hero`:
   - `generator`: calls that move's art hook with its params (as the rebuilds do today).
   - `svg`: taken from `opts.files` (app, imports) or fetched (sync, lab) relative to `base`, **sanitised**: parse with DOMParser
     (`image/svg+xml`), remove `script`, `foreignObject`, `iframe`, `object`, `embed`, every `on*`
     attribute, any `href`/`xlink:href` that is not `#…` or `data:image/(png|jpeg|webp|gif)`, and any
     `<style>` containing `@import` or `url(` to a non-`#`/non-`data:image` target. Then inlined.
   - `image`: only a relative path under `base` or a `data:image/(png|jpeg|webp|gif)` URL; rendered
     as `<img>` with `alt`, `object-fit` from `fit`.
   - The hero art appears wherever the framework calls a style's art hook (the board art slot,
     the deck cover and one deck art slide, as for built-ins), never on Built screens.
9. Everything else in v1 stays (pure-data validation, meta/build tables, `tokens(t,p,ctx,state)`).

## 5. Checker (dev/aesthetic-check.js)

`node dev/aesthetic-check.js <folder | aesthetic.json> [--json] [--render <port>] [--shots] [--list-moves]`

No npm dependencies. Exit code 1 if any FAIL. Output one line per check: `PASS|WARN|FAIL  <id>  <message>`.

Static checks (node only, no server):
- `json` parses; `spec` is 2; required fields present; types right; pure data.
- `key` format; no clash with built-in keys (parse `js/aesthetics/*.js` for `key:`) or other specs.
- `moves` every move id, param name, param kind/range (scalar and `{light,dark}`) valid, against the
  live catalog (load `js/aesthetic-spec.js` + `js/moves/*.js` in a `vm` sandbox with a minimal
  window/document stub).
- `kit` every component maps to a known material; interactive components (buttons, field, select,
  switch, checkbox, radio, slider, segmented, tabs, chip) have at least one state. Unmapped
  components: WARN listing them.
- `art` files exist, type allowed, SVG passes the same sanitiser rules (report what would be stripped
  as WARN; script / on* as FAIL).
- `rounds` if present, validates §7.
- `similar` closest built-ins by move overlap: map spec moves to library ids (`libraryId`), Jaccard
  against each style's move list in `docs/move-audit/move-library.json`; print top 3 with %;
  WARN if ≥ 70%.

Render checks (`--render <port>`, a server already running at the repo root; headless
`playwright-cli` exactly as `dev/move-lab/shoot.sh` uses it, same quiet rules):
- 0 console errors on board, Built kit and deck, light and dark.
- Stress palettes: for each of 6 brand palettes (muted beige, neon green, deep navy, near-white
  primary, pure red, grey-only) × light/dark, measure WCAG contrast from computed styles:
  body text on canvas ≥ 4.5, primary button label on its fill ≥ 4.5, field text on field ≥ 4.5,
  secondary text ≥ 3. FAIL below; report the palette and element.
- `--shots`: run `shoot.sh` (LG_PIN) into `<folder>/shots/` (board, kit-top, deck-cover; light, dark).

`--list-moves`: print the catalog (id, category, tier, what, params with defaults, material/state
names) as Markdown; `--json` for JSON.

## 6. Moves to tidy (migration)

Merge duplicates into the shared move with params: `focus-ring--soft`, `focus-ring--acid` →
`focus-ring`; `kit-cell-frame--soft`, `kit-cell-frame--acid` → `kit-cell-frame`;
`section-number-marker--acid` → `section-number-marker`. `soft.js`: rim gradient colours become
params. Every move gets `what` and `libraryId`. Rebuild specs become
`custom-aesthetics/starters/<key>--moves/aesthetic.json`, use `art.hero` where they use a generator today, and must render
the same as the committed shots in `docs/move-audit/shots/` (re-shoot and compare).

## 7. rounds.json

```json
{ "rounds": [ {
  "n": 1, "date": "2026-11-06", "by": "agent|studio",
  "summary": "what this round tried",
  "changes": ["plain sentences"],
  "variants": [ { "id": "r1a", "change": "one axis only, e.g. material: hard-offset → soft relief", "verdict": "keep|kill|open" } ],
  "notes": [ { "id": "n1", "target": "board.hero | board.palette | kit.<component> | deck.cover | general",
               "text": "headline too loud", "status": "open|done", "doneIn": 2 } ],
  "shots": "shots/r1/"
} ] }
```

Notes are what a studio pins in the UI; an agent reads the open notes, makes the next round,
and marks them done. One axis per variant.

Studio rounds (`"by": "studio"`, written by the studio editor, `js/studio-rounds.js`):
- A round the studio has open carries `"open": true` (and may have an empty `summary` and `"shots": null`). Closing it
  removes `open`, fills `summary`, and drops a null `shots`, so a closed round matches the schema above exactly.
  A closed round never has an `open` key; at most one round in the file is open.
- Variant ids are `r<n><letter>`; note ids `n<k>` are unique across all rounds. `doneIn` is the round that was open (or last)
  when the note was marked done.
- `changes` are plain-word lines ("corner-radius: base 4 → 12", "material (card, panel): recessed → film-frame").
- A snapshot of the aesthetic at each closed round goes to the bundle's `versions` (§1), not into rounds.json.
- An agent adds its own round as the next `n` (`"by": "agent"`); see `docs/aesthetic-spec/AUTHORING.md` §12.
