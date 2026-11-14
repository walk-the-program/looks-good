# Agent interface — plan (coordinator-owned, rev 2, 2026-11-14)

Only the coordinator edits this file. Workers report in their return message.

## Outcome

Looks Good has a human side (the app, the studio) and an AI side (spec-v2 files in
`custom-aesthetics/`, `docs/aesthetic-spec/`, `dev/aesthetic-check.js`). This work makes the AI side
something the owner can point any agent at from any app repo (Youch! = `~/Desktop/Projects/TTS+`,
OpenText = `~/Desktop/Projects/OpenText`), code-driven, no clicking:

1. learn how every style draws every UI kit component (computed values, real CSS rules, motion timing);
2. build a one-off, in-depth style for that app as a spec-v2 folder in `custom-aesthetics/<key>/`
   (so the owner can open and refine it in the studio too);
3. render the app's own screens in that style (iPhone and Mac window) as PNGs, read them, iterate in rounds;
4. export the build pack (tokens + real component CSS) for the app's build.

Not a separate program and no MCP server: a root `AGENTS.md`, a Node CLI `dev/lg.js`, and a global
pointer skill. No AI box in the product. No paid APIs. Headless renders follow the checker's quiet
rules (playwright-cli, unique in-memory session, localhost only, always closed).

## One-off style for an app (folder contract rev 2)

```
custom-aesthetics/<key>/            normal spec-v2 folder (aesthetic.json, art/, rounds.json, shots/), listed in index.json
custom-aesthetics/<key>/app/
  look.json                         the preview brand for this app (below)
  product-sheet.md                  the app's screens (docs/product-sheet-format.md)
  renders/r<n>/                     PNGs per screen x mode + index.html contact sheet
```

`app/` is ignored by the runtime, the studio bundle and the checker's static checks (verify; if the
checker or pack chokes on it, report, don't change the checker contract silently).

### look.json

```json
{
  "app": "Youch!", "repo": "~/Desktop/Projects/TTS+",
  "brandName": "Youch!",
  "style": "<key>",                          // any registered key (built-in or custom); defaults to the folder's key
  "blend": null,                             // or Looks Good's { "with", "strength", "channels" }
  "primary": "#2f5d8a", "scheme": "analogous",
  "colors": null,                            // optional explicit state.colors; wins over primary/scheme
  "heading": "Inter", "body": "Inter",       // FONTS names
  "typography": null, "pureBg": false,
  "modes": ["light", "dark"]
}
```

Applied by building a `serializeState`-shaped object and calling `applySavedSessionToState(saved, state)`
then `render()`. Unknown keys warn; unknown style or font fails naming close matches.

## CLI `node dev/lg.js <command>` (contract rev 2)

Starts its own read-only static server for the repo root on a free localhost port unless `--port` is
given (no python needed), drives one headless page, closes everything on exit. Every command takes
`--json` (machine output; default is compact readable text).

| Command | Does |
| --- | --- |
| `styles [--query q] [--family f]` | every registered style: key, name, descriptor, family, summary, mode, built-in or custom |
| `style <key>` | meta, build, rules do/don't, labels, core trick, font picks; for custom: moves, kit materials/states |
| `components` | UI_KIT: id, group, name, use, states, ios |
| `fonts` | FONTS: name, category/classes, weights |
| `moves` | the spec-v2 move catalog (wraps `aesthetic-check.js --list-moves`) |
| `inspect <component> --style <key> [--state s] [--look file] [--png out.png]` | per drawn state: computed background, colour, border, radius, shadow, backdrop/filter, padding, font family/size/weight/tracking/case, height; motion (transition property/duration/timing/delay, transform, animation); the CSS rules that match it (text, source file); markup |
| `compare <component> --styles a,b,c [--state s] [--png out.png]` | the same key values + motion side by side, and one PNG strip |
| `screens <key-or-folder> [--look file] [--sheet file] [--round n] [--out dir]` | render every product-sheet screen x mode at 1:1, 2x (iPhone 390x844, Mac 1280x800, taller when content is taller) via `ProductScreens.exportInto`; also `kit-<mode>.png`; writes `index.html`; defaults: `<folder>/app/look.json`, `<folder>/app/product-sheet.md`, `<folder>/app/renders/r<n>/` (n = next) ; prints sheet warnings |
| `pack <key-or-folder> [--look file] [--sheet file] [--target web|swiftui|both] [--surface app|web|both] [--out file]` | the build pack Markdown for that look + sheet (BuildPack.collect + markdown), default `<folder>/app/build-pack.md` |

A folder not listed in `custom-aesthetics/index.json` is imported under a temporary key the way the
checker's render does. The checker stays the tool for `check`, `--render`, `--shots`, `--pack/--unpack`.

## Looks Good change (task A): Mac windows

Product sheet: `Platform: iphone | mac` (product level, default iphone). On mac, `Tabs:` become a
sidebar; `Chrome:` is `sidebar | toolbar | none` (`tabbar` reads as sidebar, `topbar` as toolbar).
New API `ProductScreens.exportInto(host, state, screenId, mode)` draws one comp at 1:1 into `host` and
returns `{ width, height }`; `compPng` uses it. The Built view's Product tab shows Mac comps scaled to fit.

## Tasks

| ID | Owner | Writes | Depends | Status |
| --- | --- | --- | --- | --- |
| A | Sonnet | `js/product-sheet.js`, `js/product-screens.js`, `css/product-screens.css`, `docs/product-sheet-format.md`, `tests/run.js`, `js/brief-view.js` (briefProductBlock only) | — | running |
| B | Sonnet | `dev/lg.js`, `dev/lg/**` | A's `exportInto` for screens (falls back to a clear error until A lands) | running |
| C | coordinator | `AGENTS.md`, global skill, `.claude/skills/make-aesthetic/SKILL.md`, this file, end-to-end test, commit, push | A, B | planned |

Budget: 2 workers at once, disjoint files, shared checkout. Workers do not commit.

## Acceptance

1. From the TTS+ repo, an agent following AGENTS.md lists styles and inspects `btn-primary` in two styles, getting values incl. transition timing and the matching CSS rules.
2. `screens` renders a 3-screen iPhone sheet light + dark in a built-in and in a custom style; PNGs correct.
3. `screens` renders a Mac sheet as windows built from kit pieces, styled per style.
4. A one-off style for Youch! is scaffolded, checked (static + render) and rendered with its `app/` files.
5. `pack` writes a build pack for that look.
6. `node tests/run.js` passes; the Built view's phone comps look unchanged.
7. The CLI never writes outside the target folder / `--out`, and never touches the owner's app storage.
