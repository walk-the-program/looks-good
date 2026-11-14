# Looks Good for AI agents

You were pointed here to design an app's look with Looks Good. Everything on this side is files and
commands: no clicking, no screenshots of the app window. The owner works on the other side of the same
files (the Looks Good app and its studio), so whatever you make here opens there too.

Run every command from this folder (`~/Desktop/Looks Good`). Never edit app code (`js/`, `css/`,
`index.html`), built-in styles or the checker. Never add an "ask the AI" box to the product.

## What you can do

| Goal | Command |
| --- | --- |
| See every style | `node dev/lg.js styles` (`--query`, `--family`, `--json`) |
| Read one style's rules, materials and font picks | `node dev/lg.js style <key>` |
| List the UI kit components and their states | `node dev/lg.js components` |
| See exactly how a style draws a component: values, timing, CSS | `node dev/lg.js inspect btn-primary --style soft-form` |
| Compare one component across styles | `node dev/lg.js compare btn-primary --styles soft-form,raw-brutalist --png /tmp/x.png` |
| List fonts / the move catalog for new styles | `node dev/lg.js fonts`, `node dev/lg.js moves` |
| Render the app's own screens in a style | `node dev/lg.js screens <key-or-folder>` |
| Export the build pack (tokens + the real component CSS) | `node dev/lg.js pack <key-or-folder>` |
| Check a style folder (static, then headless render + shots) | `node dev/aesthetic-check.js custom-aesthetics/<key>` |

`node dev/lg.js --help` has every flag. Add `--json` when you want to parse the output.

## Making a one-off style for an app

A one-off style is a normal Looks Good style folder that also carries the app's screens:

```
custom-aesthetics/<key>/
  aesthetic.json          the style (spec v2)
  art/  rounds.json  shots/
  app/
    look.json             palette, fonts, blend and modes used to preview this app
    product-sheet.md      the app's screens and their real content
    renders/r<n>/         PNGs + index.html, one folder per round
    build-pack.md         from `lg.js pack`
```

Steps:

1. **Read the app first.** Its product docs (`docs/product/one-pager.md`, UX brief) and any existing
   `design/brand.json`. Write `app/product-sheet.md` from them (format: `docs/product-sheet-format.md`;
   `Platform: mac` for a Mac app). Use the app's real screens and content, not placeholder copy.
2. **Study before inventing.** Run `styles`, read two or three close styles with `style`, and `compare`
   the components the app leans on most. Note the values and timings you want to keep or push against.
3. **Write the style.** Follow `docs/aesthetic-spec/AUTHORING.md` end to end (core trick first, then
   colour recipe, material, moves, every kit component). Pick a key like `<app>-<idea>` and add it to
   `custom-aesthetics/index.json`. Template: `docs/aesthetic-spec/template/`.
4. **Write `app/look.json`.** Shape:
   ```json
   { "app": "Youch!", "repo": "~/Desktop/Projects/TTS+", "brandName": "Youch!",
     "style": "<key>", "blend": null, "primary": "#2f5d8a", "scheme": "analogous", "colors": null,
     "heading": "Inter", "body": "Inter", "typography": null, "pureBg": false, "modes": ["light", "dark"] }
   ```
5. **Loop in rounds.** `node dev/aesthetic-check.js custom-aesthetics/<key>` until there is no FAIL, then
   `node dev/lg.js screens custom-aesthetics/<key>`. Read every PNG yourself. Change one thing per variant
   and record the round in `rounds.json` (AUTHORING.md section 9). Show the owner the round's
   `index.html` and wait for notes before the next round.
6. **Hand off.** `node dev/lg.js pack custom-aesthetics/<key>` writes `app/build-pack.md`. Copy it into
   the app repo (for example `design/looks-good-build-pack.md`) and build from it. The pack, not memory,
   is the source of truth for colours, sizes, radii, shadows and timings.

To try a built-in style on the app before inventing one, give `screens` a built-in key with
`--look` and `--sheet` paths and an `--out` folder.

## Rules that matter to the owner

- App screens use only the UI kit, styled per style. Board art and patterns never go on app screens.
- Every kit component gets its own treatment in a new style; none just inherits defaults.
- Glass is clear, never frosted.
- Judge quality by rounds and the owner's notes, not by your first pass.

## Where things are

- Style spec: `docs/aesthetic-spec/SPEC-v2.md`. How to write one: `docs/aesthetic-spec/AUTHORING.md`.
- Move catalog: `docs/aesthetic-spec/moves.md`. Product sheets: `docs/product-sheet-format.md`.
- Built-in styles: `css/aesthetics/<key>.css` + `js/aesthetics/<key>.js`. UI kit: `js/ui-kit.js`.
- Example custom style: `custom-aesthetics/darkroom/`.
