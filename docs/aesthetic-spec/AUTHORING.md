# Making an aesthetic (agent guide)

You are given an idea ("make an aesthetic from <idea>"). This guide takes you from the idea to a
checked, screenshotted aesthetic folder. The contract is `SPEC-v2.md` (same folder); the runtime is
documented in `dev/move-lab/README.md`. If this guide, the spec, the checker or the runtime ever
disagree, stop and report it. Do not work around it.

## Contents
1. What an aesthetic is here
2. Folder layout
3. The 12 stages, mapped to spec fields
4. Choosing moves
5. Materials and the component map
6. Params, `{light,dark}` and scope
7. The art slot
8. Writing a code-tier move
9. The round loop
10. Definition of done
11. Do not

## 1. What an aesthetic is here

An aesthetic is a folder of plain JSON: moves (small, named, parameterised pieces of look) plus a
map from every UI-kit component to a material and states. There are two parts to a look:

- **The system**: colour recipe, corners, borders, shadow model, type behaviour, kit styling. It
  has to hold with any client primary colour and any fonts, in light and dark.
- **The signature art**: the one picture or pattern on the board that makes it recognisable. It is
  board and website only. App screens and the Built kit never carry board art.

Rules from the owner that apply to every aesthetic:

- Every kit component gets styled in every style (the checker lists unmapped ones).
- The product gets no "ask AI" box and no AI feature. This work is done by an agent outside the app.
- If the style uses glass, it is clear see-through glass (material `clear-glass`), never frosted or milky.
- It must look different from the 46 built-in styles, not a re-skin of one.

Everything is lab-only: nothing loads unless the page URL has `?movelab=1`.

## 2. Folder layout

```
dev/move-lab/specs/<key>/aesthetic.json   the aesthetic (pure JSON, "spec": 2)
dev/move-lab/specs/<key>/art/...          optional art files (svg, png, jpg, webp)
dev/move-lab/specs/<key>/rounds.json      the round log
dev/move-lab/specs/<key>/shots/...        screenshots the checker writes (kept: they are the round record)
dev/move-lab/specs/index.json             {"specs": ["<key>", ...]}: the folders the lab loads
```

`<key>`: lowercase kebab-case, 3-48 characters, equal to the folder name, not equal to a built-in
key (`js/aesthetics/*.js`) or another spec. Keys ending `--moves` are reserved for rebuilds of
built-ins; use a plain key for a new look. Use `order` 950 or higher.

Starter files: `docs/aesthetic-spec/template/` (`aesthetic.json`, `rounds.json`, `art/hero.svg`;
its `README.md` is notes and is not copied). The template passes the checker as is once renamed and
listed in `index.json`; it maps all 70 kit components, with the material varying by component group.

`meta.family` must be one of: `tactile` (raised, pressed, physical), `graphic` (flat colour, hard
edges, posters), `digital` (screens, terminals, UI chrome), `print` (editorial, paper, type-led),
`luminous` (glass, glow, light). Source: `AESTHETIC_FAMILIES` in `js/aesthetic-meta.js`.

## 3. The 12 stages, mapped to spec fields

Do the stages in order in your head, then write the JSON. Each stage names the fields that carry it.

1. **Core trick.** One sentence: the mechanism that makes the look, not the mood. "Every control is
   a heavy outline with a zero-blur offset shadow" is a mechanism; "bold and playful" is not.
   Field: `coreTrick` (required, non-empty). Also `summary` (one plain sentence) and `name`.
2. **References to influences.** What it draws on, as a plain list. Field: `influences`. Do not
   copy another style's look; take the idea and change one thing.
3. **Colour as a recipe.** It has to work with any client primary, plus a fallback for a muted
   primary. Fields: `colour` (moves that run first, e.g. `tinted-neutral-canvas`,
   `canvas-ink-pull`, `muted-contrast-floor`) and the colour category of the catalog. Never hard
   code a brand hex; derive from the primary, ink and canvas roles. Check the muted case by looking
   at the stress palettes the render check uses (muted beige, grey-only).
4. **Material.** Corners, borders, shadow model, surface, light source, density. Fields:
   `moves` (`corner-radius`, `heavy-border`, `hairline-rule`, shadow and surface moves),
   `build.cls` (`flat|hard|soft|glass|glow|stepped`), `build.surface` (one sentence), `build.press`,
   `build.motion`, `build.pressText`.
5. **Type behaviour.** Font classes recommended and avoided, case, tracking, label voice, display
   treatment. Fields: `meta.fonts` (`heading`/`body`/`mono` with `classes` and `picks`, `avoid`,
   `why`, `pairings`; classes are the `FONT_CLASSES` keys in `js/data.js`), `type` (`ui`, `label`,
   `display`), and type moves (`caps-mono-labels`, `tight-display-tracking`, headline moves).
6. **Signature move.** One recognisable thing per screen and where the accent may spend. Fields:
   the strongest entry in `moves` and `highlight` (`ink|band|custom`), plus `rules.do`.
7. **Colour roles.** For canvas, ink, primary, secondary and accent: use, never, coverage. Field:
   `roles`. Start from the universal roles in `docs/aesthetics-plan.md` lines 42-57 (canvas 60-70%,
   ink 15-20%, primary about 10% for the one main action, secondary 10-15%, accent 5% or less, one
   spark per view) and override only where the look demands it.
8. **Board art and patterns (board only).** Field: `art.hero` (section 7) and any pattern or
   ornament move with `"scope": "board"`.
9. **Kit coverage.** Every component gets a material, and interactive ones get named states.
   Field: `kit` (section 5), plus `labels` (`material` name, three `states` names, `statesKind`
   `button|swatch|chip`) so the board's material strip reads in the style's own words.
10. **Voice.** Motto, kicker, descriptor triplet, specimen copy. Fields: `motto`, `kicker`,
    `descriptor` ("Word · Word · Word"), `copy` (labelled texts the board shows). Write plainly.
11. **App translation.** Principles and traps for turning the board into app screens. Field:
    `rules.do` and `rules.dont` (short, testable sentences), `layout` (`hero`
    `split|centered|poster|scene`, `palette` `swatches|chips|list|strips`, `sections`
    `two-col|asym|stacked`), `slideShape` (`minimal|soft|refined|geometric|classic`).
12. **Guardrails.** Contrast in light and dark, export safety, distinct from built-ins. Checked by
    the checker (section 10); `mode` is `light` or `dark` (the default mode), `lineage` records
    forks.

## 4. Choosing moves

The catalog is the list of moves you may use. Do not invent move names.

- Full list with params, ranges and defaults: `docs/aesthetic-spec/moves.md`. To print it fresh:
  `node dev/aesthetic-check.js --list-moves` (add `--json` for JSON).
- Catalog categories: `a11y art colour layout material shape state structure type`.
- Library categories (`docs/move-audit/move-library.md`, the 198-move audit of the 45 original
  styles) are broader: framework, colour, material, state-behaviour, type, headline, layout,
  ornament, pattern, motion, voice, structure. Each catalog move carries a `libraryId` linking it
  there. Use the library to see how existing styles combined moves.
- Tiers: **token** = pure variables; **recipe** = parameterised CSS the runtime emits (most moves);
  **generator** = code written once and driven by params (colour solvers, procedural art);
  **bespoke** = only makes sense for one style (these are not in the catalog; see section 8).
- Prefer recipe moves with params. Take two or three moves from different categories and set their
  params far from the defaults rather than stacking many moves at default values.
- Each `colour` or `moves` entry: `{ "move": "<id>", "params": { ... }, "scope": "all|board|kit" }`.
  Only use param names from the catalog. Unknown move, param or out-of-range value is a FAIL.
- `colour` moves run first, then `moves`, in listed order; later wins. They can pass values to later
  moves through the token bus (see `paper-edge` then `edge-underline` in `js/moves/core.js`).
- Example of a complete aesthetic made only of catalog moves: `dev/move-lab/specs/smoke--moves/`.
  Rebuilds of built-ins to study: `soft-form--moves`, `acid-graphics--moves`, `editorial-serif--moves`
  (read them for shape, not content; they are being tidied).

## 5. Materials and the component map

A **material** is how a component's surface is drawn (outlined, flat-fill, hard-offset, raised-relief,
recessed, clear-glass...). A **state** is a named behaviour (invert-on-hover, press-sink,
ink-fill-selected, focus-outline...). Both come from moves in the catalog; the catalog lists each
move's `materials:` and `states:` names.

`kit` maps each component to one material and optional states:

```json
"kit": {
  "button-primary": { "material": "hard-offset", "state": ["invert-on-hover", "press-sink"],
                      "params": { "hard-offset": { "fill": "primary" } } },
  "field":          { "material": "outlined", "state": "press-sink",
                      "params": { "outlined": { "width": { "light": 2, "dark": 3 } } } },
  "callout":        { "material": "outlined", "scope": "kit" }
}
```

- `params` inside a kit entry is keyed by the move/material name and overrides spec-level params for that component.
- Every entry needs a material or a state. Interactive components (`button-*`, `field`, `select`,
  `switch`, `checkbox`, `radio`, `slider`, `segmented`, `tabs`, `chip`) need at least one state, or
  `kit` FAILs.
- The kit has 70 components. Unmapped ones are a `kit-unmapped` WARN that lists them; for done,
  map all of them (the template does; change materials component by component to fit the look).
- Component names: v1 set (button-primary, button-secondary, button-ghost, button-icon, button-danger,
  field, select, switch, checkbox, radio, slider, segmented, tabs, card, panel, list-row, chip, badge,
  progress, avatar, tooltip, modal, sheet, toast, callout, menu, navbar, topbar) plus the v2 set in
  `dev/move-lab/README.md` ("Kit components"). `panel` is board-only.
- **Cheat sheet by group** (typical choices; the template follows it):

| Group | Components | Typical material | Typical state |
|---|---|---|---|
| Controls that act | `button-*`, `button-split`, `button-fab` | loudest material on the primary, a quieter one (outlined, quiet-text) on the rest | hover and press: invert, sink, lift |
| Fields that take input | `field`, `select`, `date-field`, `combo`, `listbox`, `stepper` | recessed or outlined, calm fill, readable text | focus ring, press-sink |
| Choosers | `switch`, `checkbox`, `radio`, `slider`, `segmented`, `tabs`, `chip` | flat-fill or the control material | a clear selected state (ink-fill-selected, bar-selected) |
| Surfaces that hold | `card`, `panel`, `list-row`, `accordion`, `calendar`, `matrix-tile` | the signature surface (raised, framed, glass) | none |
| Overlays | `modal`, `sheet`, `drawer`, `popover`, `lightbox`, `tooltip` | the strongest surface, with a scrim | none |
| Navigation | `navbar`, `topbar`, `tabbar`, `nav-*`, `breadcrumbs`, `link` | flat or quiet-text, so the page stays the subject | selected: bar or underline |
| Feedback | `toast`, `callout`, `badge`, `notification-dot`, `spinner`, `skeleton` | flat-fill in the accent or a role colour | none |
| Data display | `progress`, `avatar`, `kbd`, `divider`, `scrollbar` | thin and flat; the data carries the colour | none |

  Check every group in both modes: an outline that reads in light can vanish on a dark canvas (use
  `{light,dark}` params). The core trick must show in the kit, not only on the board: at least
  `card`, `button-primary` and one overlay should wear it.
- Two different materials per look is plenty to start: one for "doing" things (buttons, fields,
  switches) and one for "holding" things (cards, sheets, modals), then adjust outliers.

## 6. Params, `{light,dark}` and scope

- A param is a scalar or `{ "light": v, "dark": v }`. Use a pair when a value must differ per mode
  (a border that reads at width 2 in light needs 3 in dark; a tint that is subtle in light is invisible
  in dark). Both sides are validated like scalars; a pair with a missing or wrong-typed side FAILs.
- Param kinds: `number` (clamped to its range, FAIL outside it in the checker), `enum`
  (listed options), `colour` role names such as `primary|secondary|accent|ink|canvas|line|muted|tint`
  where the catalog lists them, `bool`, `text`.
- `scope`: `all` (default), `board` (the board and deck slides) or `kit` (the Built kit and app
  screens). Use `board` for decoration and art-adjacent moves; use `kit` for things only the app
  should do. Remember: art never goes on app screens, so anything that is picture-like is `board`.

## 7. The art slot

`art.hero` fills the board's art area (board hero, deck cover, one deck slide). Three kinds:

```json
"art": { "hero": { "kind": "generator", "move": "duotone-plate", "params": { } } }
"art": { "hero": { "kind": "svg", "src": "art/hero.svg", "fit": "cover", "alt": "what it shows" } }
"art": { "hero": { "kind": "image", "src": "art/hero.webp", "fit": "cover", "alt": "what it shows" } }
```

- `generator`: a catalog move whose `hooks:` include `art` (category `art`: `duotone-plate`,
  `op-art-ripple`...). Params as for any move.
- `svg`: a `.svg` file in the folder's `art/`, 2-10 KB of plain geometry is plenty. The runtime
  sanitises it: `script`, `foreignObject`, `iframe`, `object`, `embed`, every `on*` attribute, any
  `href` that is not `#id` or `data:image/(png|jpeg|webp|gif)`, and any `<style>` with `@import` or a
  non-local `url()` are removed. The checker FAILs on script or `on*`, WARNs on the other strips. Write
  clean SVG so nothing is stripped. The SVG is inlined on the board, so the palette roles
  work inside it as CSS variables: `--ab-primary`, `--ab-secondary`, `--ab-accent`, `--ab-ink`,
  `--ab-canvas`, `--ab-muted`, `--ab-line`, `--ab-pri-tint`, `--ab-sec-tint`, `--ab-on-primary`.
  Always add a fallback hex, and keep plain hexes for the neutral parts, so the art follows the
  client colour:

  ```svg
  <rect width="200" height="200" fill="var(--ab-canvas,#f4ecd8)"/>
  <circle cx="70" cy="80" r="46" style="fill:var(--ab-primary,#e4572e)"/>
  <path d="M20 176 L100 112 L180 176" fill="none" stroke="var(--ab-ink,#1b1b1b)" stroke-width="6"/>
  ```
- `image`: a relative `png/jpg/jpeg/webp/gif` under the folder, or a `data:image/...;base64,` URL.
  Prefer SVG; images do not follow the client palette.
- The slot's shape follows `layout.hero`: `split` (default; any unknown value falls back to it),
  `centered`, `poster`, `scene` or `bleed`. `poster` gives a small square slot (34% of the board
  width). `centered` and `scene` fill the width (16:7 and 21:10 by default), and `bleed` runs to the
  edges. Change the aspect with `--ab-art-ratio` on `.ab-art`, for example
  `${S} .ab-art { --ab-art-ratio: 4 / 3; }` in a move's `css()`. Narrow screens read
  `--ab-art-ratio-narrow` in the centered, scene and bleed layouts.
- Always give `alt`. Never reference art from `kit` or screens.

## 8. Writing a code-tier move

Try catalog moves first. Params on existing moves cover colour roles, weights, widths, radii,
offsets, tracking, case and tint amounts. Write a new move only when the signature needs something
params cannot say:

- **Needs code:** real geometry the recipes do not draw (a film-edge sprocket strip with
  perforations, a barcode, a pie menu); a lighting cast that must hold whatever the client colour is
  (a fixed safelight tint on canvas, rules and text, not derived from the primary); a procedural
  pattern; a new headline treatment.
- **Params are enough:** a different border width, radius, shadow offset, fill role or tint, or a
  recolour of something that already exists.
- A reviewer note that says the brief's most distinctive cue is missing, with no catalog move able
  to put it on the board and in the kit, is the signal for code tier.

Rules:

- **Generic.** The move describes what it does, never the style it came from: `ruled-row`, not
  `night-ferry-sign`. No style names in ids, comments or text.
- **Reusable.** Everything tunable is a param with a default and a range. No hard-coded brand hexes;
  take colours from the roles (`--ab-primary` etc.) or params.
- **`what`** (required, one line) says what the move does. **`libraryId`** is the id from
  `docs/move-audit/move-library.json` the move implements, or `null` if it is new.
- **Collisions are errors.** A move id, material name or state name that already exists logs
  `console.error` and the whole move is ignored. Check the catalog first; use a distinct name.
- Put it in a new file `js/moves/<name>.js` and append that path to `MOVE_FILES` in
  `dev/move-lab/lab.js` (lab-only loader). Do not edit `core.js`, another move file, or
  `js/aesthetic-spec.js` unless you are fixing a bug in the move you wrote.

Contract (see `dev/move-lab/README.md` "registerMove" for the full text):

```js
registerMove({
  id: 'kebab-id', libraryId: null, what: 'One line.', category: 'material', tier: 'recipe',
  params: { width: { kind: 'number', default: 2, range: [0, 8] } },
  tokens(t, p, ctx, state) { return {}; },            // custom properties; may use ctx.bus
  css(S, p, ctx) { return `${ctx.sel('card')} { border-width: ${p.width}px; }`; },
  material: { name: 'kebab-name', css(S, sel, p, ctx) { return `${sel} { ... }`; } },
  state:    { name: 'kebab-name', css(S, sel, p, ctx) { return `${sel} { ... }`; } },
  hooks: { }                                           // e.g. art(p, ctx, ...)
});
```

Every part is optional. Scope every selector with `S`/`ctx.sel(...)`; a rule that leaks outside `S`
breaks other styles. Dark-mode values: use `{light,dark}` params or `ctx.SD`. After writing the
move, run `node dev/aesthetic-check.js --list-moves | grep -A5 "### <id>"` to confirm it is in the
catalog with its `what`, then use it like any other move. Regenerate `moves.md` (below).

`tokens(t, p, ctx, state)` runs once per render and mode. Its returned values are merged after the
board's own variables, so they can override framework roles such as `--ab-canvas`, `--ab-ink`,
`--ab-muted` and `--ab-line`; later moves win. The `t` object has two helpers: `t.mix(hex, base,
amount)` blends `hex` into `base` by `amount` (0 to 1), and `t.contrast(hexA, hexB)` returns the
contrast ratio. `js/moves/darkroom.js` uses both: `t.mix(p.lamp, t.canvas, p.canvasMix)` tints the
canvas, and `muted` steps toward the canvas until `t.contrast(muted, canvas) >= 4.6`.

## 9. The round loop

An aesthetic is built in rounds. A round makes a few variants that each change ONE axis (material,
colour recipe, headline treatment, ...), looks at the screenshots, keeps or kills each, and pushes
again. Do not change several axes at once; you will not know what worked.

Round 1 starts from the stages above. Later rounds start from the open notes in `rounds.json`.
`<key>` is your key, `<port>` any free port (for example 8412; check it is free with
`lsof -i :8412`, which prints nothing when it is).

1. Copy the template (first round only):
   `mkdir -p dev/move-lab/specs/<key> && rsync -a --exclude README.md docs/aesthetic-spec/template/ dev/move-lab/specs/<key>/`
   then set `"key"` in `aesthetic.json` to `<key>` and edit `name`, `descriptor`, `coreTrick` and the rest.
2. List it (first round only), before any check, or the first run always WARNs. Other agents edit
   `dev/move-lab/specs/index.json` too, so read it immediately before you change it, add only your
   key, and never rewrite the file from memory. It holds one `specs` array; keep the format you find.
   This does read, add and write in one step:
   `node -e 'const fs=require("fs"),f="dev/move-lab/specs/index.json",j=JSON.parse(fs.readFileSync(f,"utf8"));if(!j.specs.includes("<key>"))j.specs.push("<key>");fs.writeFileSync(f,"{ \"specs\": ["+j.specs.map(k=>JSON.stringify(k)).join(", ")+"] }\n")'`
3. Edit `aesthetic.json` (one axis per variant; for several variants, make each one a round-note
   and try them one at a time, keeping the winner).
4. Static check (no server): `node dev/aesthetic-check.js dev/move-lab/specs/<key>`.
   Fix every FAIL before rendering. Output lines are `PASS|WARN|FAIL  <id>  <message>`.
5. Serve the repo root: `python3 -m http.server <port>` (run in the background from the repo root).
6. Render check and screenshots:
   `node dev/aesthetic-check.js dev/move-lab/specs/<key> --render <port> --shots`
   It prints console errors per view and a stress-contrast table (six brand palettes, light and dark;
   columns are body, primary button, field, secondary text; `!` marks a failing value). It also
   measures display text (the headline highlight word and any accent-coloured text) and WARNs
   (`render-text`) when one is under 3:1, naming palette, mode and element; fix it or explain it.
   It takes one to two minutes and writes PNGs to `dev/move-lab/specs/<key>/shots/`: board, kit-top
   and deck, each in light and dark.
   **Pinned preview brand:** every round's shots use the same input, so rounds compare: primary
   `#2f5d8a`, analogous scheme, Inter for heading and body. The values used are written to
   `shots/palette.txt`. Add `--palette <#hex>` to override the primary (it is recorded too), and
   `--out <dir>` to write the shots elsewhere.
7. Read every PNG with the Read tool. Look at: the headline, the signature move, the palette block,
   the kit in light and dark, focus and pressed states, anything cut off or low contrast. Be
   specific about what is wrong ("kit-top dark: switch track vanishes"). **Review your own shots**
   before you call the round done:
   - Does the board show the brief's single most distinctive sensory cue (the thing a person would
     name first)?
   - If the name were hidden, would it pass as a generic theme with a different accent?
   - Does the hero art fill its slot, big enough to read at a glance?
   - Is every control visible in both modes (switch track, outlines, focus ring, disabled)?
   - Does the core trick appear in the kit (cards, buttons, an overlay), not only on the board?
   Any "no" is a note in `rounds.json` for the next round.
8. Write `rounds.json` (SPEC-v2 section 7): `n`, `date`, `by: "agent"`, `summary`, `changes`
   (plain sentences), `variants` (`id`, `change` naming the single axis, `verdict` keep/kill/open),
   `notes` (`id`, `target` such as `board.hero`, `board.palette`, `kit.<component>`, `deck.cover`,
   `general`; `text`; `status` open/done; `doneIn` the round number that closed it), and `shots`
   (`shots/r<n>/`). Copy the round's PNGs into `shots/r<n>/` so later rounds do not overwrite them. Or skip the copy and
add `--out dev/move-lab/specs/<key>/shots/r<n>/` to the step 6 command, which writes them there.
9. Stop the server. Next round: read the open notes, change one axis per variant, repeat from
   step 3, and mark the notes you addressed `done` with `doneIn`. Note `id`s must be unique across
   all rounds. To close an older note, edit it in place (`status: "done"`, `doneIn: N`); never add
   it again, or the checker FAILs with "duplicated".

If a `--render` run reports many FAILs reading `unparsable eval result: ...`, rerun it once before
debugging the aesthetic.

To inspect an existing aesthetic you did not make, the same commands work on its folder, for
example `node dev/aesthetic-check.js dev/move-lab/specs/smoke--moves`. `node dev/aesthetic-check.js
--self-test` runs the checker's own fixtures (use it only if you suspect the checker).

**Non-default mode.** The default `mode` gets the full treatment. The other mode must pass every
check and read correctly (contrast, every control visible, borders and art legible) but need not be
equally rich: no second signature, no extra moves. Use `{light,dark}` pairs where a value breaks, and
look at both modes every round.

## 10. Definition of done

All of these, with the command output or PNG as evidence:

1. Static check: 0 FAIL, and no WARN other than ones you can explain
   (`node dev/aesthetic-check.js dev/move-lab/specs/<key>`).
2. Render check: 0 FAIL, including `render-console` (no errors) and `render-contrast` for all six
   stress palettes in light and dark (`--render <port>`).
3. Every kit component mapped (no `kit-unmapped` WARN), interactive ones with states.
4. `coreTrick` present and a mechanism, not a mood.
5. `similar` below 70% to every built-in (the check WARNs at 70% or more; the top three are printed).
6. Screenshots reviewed in light and dark: board, kit-top, deck cover. Note what you saw in `rounds.json`.
7. `art.hero` is clean (no stripped content) and board-only.
8. `rounds.json` records what changed in each round and which notes are done.
9. The folder is in `dev/move-lab/specs/index.json`, and a scratch or test folder is not.

Report: the key, the final check output counts, which round you stopped at, and anything unresolved.

## 11. Do not

- Do not edit app code, `index.html`, `js/aesthetics/*.js`, `css/*`, `js/aesthetic-meta.js` or any
  built-in style. Do not edit `js/aesthetic-spec.js`, `js/moves/core.js` or the checker.
- Do not copy a built-in's CSS or its move list. Reading one for ideas is fine; a result that
  scores 70% or more on `similar` is a copy.
- Do not put an AI box, prompt field or generation feature in the product.
- Do not put board art on app or Built screens.
- Do not use frosted or milky glass. Use `clear-glass` and keep it see-through.
- Do not hard-code client colours, fonts or sizes that should follow the client's brand.
- Do not leave the dev server running, and do not commit a scratch folder or its `index.json` line (remove it by re-reading the file, dropping only your key, and writing it back).
