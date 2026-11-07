# Move lab (spec runtime, contract: docs/aesthetic-spec/SPEC-v2.md)

An aesthetic is a plain JSON folder (spec 2): `aesthetic.json` + optional `art/` + `rounds.json`.
`js/aesthetic-spec.js` turns it into a normal `registerAesthetic` def plus a generated, scoped `<style id="spec-<key>">`.

Two places hold folders:
- `custom-aesthetics/<key>/` (listed in `custom-aesthetics/index.json`, `{ "aesthetics": [folder, ...] }`): real styles. They
  load in the normal app with no flag, through `js/custom-aesthetics.js` (async fetch, `CustomAesthetics.ready`), and appear in
  every style picker. New agent-made styles go here. Users can also import, export, duplicate and delete their own
  (`CustomAesthetics`, stored in the library; folder styles cannot be deleted in the app).
- `dev/move-lab/specs/<key>/` (listed in `dev/move-lab/specs/index.json`, `{ "specs": [...] }`): lab rebuilds and smoke specs, loaded
  only with `?movelab=1` (one guarded tag in `index.html` loads `dev/move-lab/lab.js`, which reads the index with synchronous XHR).
  Lab keys end in `--moves`, `order` 900+.

Files: `js/aesthetic-spec.js` (runtime) and `js/moves/*.js` (move libraries, code tier) are always loaded by `index.html`; a new
move file needs a `<script>` tag there, after `js/moves/darkroom.js`. A 404 for a listed file shows as a console error.

Run: serve the repo, open `/` (custom styles) or `/?movelab=1` (also the lab specs). Shots:
`node dev/aesthetic-check.js custom-aesthetics/<key> --render <port> --shots` (no flag needed), or for the lab
`LG_QUERY='?movelab=1' dev/move-lab/shoot.sh <port> <outdir> smoke--moves`.
Inspect: `SPEC_LAB.{moves,materials,states,specs,css}` (css is keyed by spec key), `SPEC_LAB.catalog()`, `SPEC_LAB.loadSpecs(indexUrl)`.

Loaders: `SPEC_LAB.loadSpecs` (lab) reads `index.json` and each `<key>/aesthetic.json` with synchronous XHR and calls
`registerSpecAesthetic(json, { base: 'dev/move-lab/specs/<key>/', file, json: true })`. `CustomAesthetics` (app) does the same
with async `fetch`, passes the art it fetched as `opts.files`, and registers stored/imported styles with `opts.untrusted`
(strict checks: field whitelist, no `<` `>` in strings, meta/build shape, art only from the bundle, data:image only). A missing,
unparsable or invalid file logs one `console.error` naming it and is skipped; the rest load. JSON files need `"spec": 2`.
`unregisterSpecAesthetic(key)` undoes a registration. Text and colour params are checked in every spec: no `{ } < > ; " \`,
comments, `url(`, `@import` in text; colours must be hex, `rgb()`, `hsl()` or a name (a bad value falls back to the default with a warning).
Selector-fragment text params are flagged `selector: true` in the move (no commas or combinators).

## aesthetic.json (spec 2)

See SPEC-v2.md §2 for the field list. Required: `spec key name descriptor coreTrick mode colour moves kit`. `key` is kebab-case,
3-48 chars, and must not equal a built-in key or another spec. Every `moves` / `colour` entry and every `kit` entry takes
`"scope": "all|board|kit"` (default all).

```json
"colour": [{ "move": "tinted-neutral-canvas", "params": { "tint": 16 } }],
"moves":  [{ "move": "edge-underline", "params": { "width": 2 }, "scope": "board" }],
"kit":    { "field": { "material": "outlined", "params": { "outlined": { "width": { "light": 2, "dark": 3 } } } } },
"art":    { "hero": { "kind": "svg", "src": "art/hero.svg", "fit": "cover", "alt": "" } }
```

### Per-mode params
Any param value is a scalar or `{ "light": v, "dark": v }` (validated per side). `tokens()` gets the value for the current
mode (`ctx.mode`). `css()` runs once with light values on `S`; if any param of that move or kit entry is a pair it runs a second time
with dark values on `SD` (heading `/* ... (dark) */`, `ctx.mode` `'light'` then `'dark'`, `S` is `SD` in that call, so a css that also writes
`ctx.SD` rules emits them twice). A move with no pairs runs once, `ctx.mode === 'any'`, byte-identical to v1. Hooks get the param set for the
mode found in their arguments (`isDark` or `t.isDark`), light otherwise.

### Token bus
`ctx.bus` is a fresh object per tokens pass (per render, per mode). Tokens run `colour` moves first, then `moves`, in order; each `tokens()` may
read and write `ctx.bus`, and its returned `--props` are merged into it. Share with CSS through custom properties. Example in core:
`paper-edge` (colour) writes `ctx.bus.edge`; `edge-underline` reads it. (`css()` and hooks get an empty `ctx.bus`.)

### Scope
`S = .ab[data-ae="<key>"]`. `scope: board` narrows to `S:not(.sb-ab)` (the board and the deck slides); `scope: kit` to `S.sb-ab.sb-kit` (the Built kit page and the
phone/dashboard/landing/settings screens, which all carry `.sb-ab.sb-kit`). `ctx.S`, `ctx.SD`, `ctx.sel()` reflect the scope; `ctx.scope` names it. `all` emits
both forms as before (`S frag` and `S.sb-ab.sb-kit frag`).

### Collisions
A second `registerMove` with an existing id, or a material / state name that already exists, logs `console.error` and the whole move is ignored (first wins).

### Art slot (`art.hero`)
- `generator`: `{ kind, move, params }`: that move's `art` hook (its css joins the spec as a board-scoped entry unless the move is already in `moves`, which is reused).
- `svg`: `src` relative to the folder, must end `.svg`; fetched (async in the app, sync in the lab), sanitised, inlined into the art slot. Stripped items are logged with one `console.warn`.
- `image`: relative `png/jpg/jpeg/webp/gif` path or a `data:image/(png|jpeg|webp|gif);base64,` URL; rendered as `<img alt>` with `object-fit` from `fit`.
It fills `.ab-art` (board hero, and the deck slides that call the art hook); Built screens never render it.
Sanitiser rules (`SPEC_SVG_RULES`, global and `module.exports`): remove `script foreignObject iframe object embed`; remove every `on*` attribute; remove `href` / `xlink:href`
unless `#fragment` or `data:image/(png|jpeg|webp|gif)`; remove a `<style>` (or `style=""`) containing `@import` or a `url()` whose target is not `#` / `data:image/...`.
`specSanitizeSvg(text, { parser?, serializer?, fit? }) -> { svg, stripped: ['element:script', 'attr:onload', 'href:...', 'style:...', 'parse-error', 'root:<name>'] }`
(default parser/serializer are `DOMParser` / `XMLSerializer`; pass DOM-like objects in node). `specAllowedImage(src) -> boolean` is the image check.

### Catalog
`SPEC_LAB.catalog()` -> one entry per move: `{ id, libraryId, category, tier, what, params: [{ name, kind, default, range|null, options|null }], material: name|null, state: name|null, hooks: [names] }`.
`registerMove` takes `what` (one line, required for new moves; a missing one shows as `''`) and `libraryId` (a `docs/move-audit/move-library.json` id or null).

## Scope and selectors

Scope `S = .ab[data-ae="<key>"]` matches the board, Built kit/phones (`.ab.sb-ab.sb-kit`) and every deck slide.
A kit component is a list of selector fragments (`KIT_COMPONENTS`); each is emitted as `S frag` and
`S.sb-ab.sb-kit frag` (the second outranks `css/see-built.css`). Styling reads the framework vars
(`--ab-canvas --ab-ink --ab-primary --ab-on-primary --ab-secondary --ab-accent --ab-line --ab-muted --ab-pri-tint`...).

## registerMove

```js
registerMove({
  id: 'corner-radius', libraryId: 'corner-radius', what: 'one line', category: 'shape', tier: 'token|recipe|generator|bespoke',
  params: { base: { kind: 'number', default: 8, range: [0, 40] },        // kinds: number | enum | colour | bool | text
            mode: { kind: 'enum', default: 'a', options: ['a', 'b'] } },
  tokens(t, p, ctx, state) { return { '--ab-tr': 0 }; }, // t = framework token object (canvas, ink, isDark, primary...); 4th arg = the framework's view state (headingFont, bodyFont, brand name...), any further args follow
  css(S, p, ctx) { return `${ctx.sel('card')} { border-radius: ${p.base}px; }`; },
  material: { name, css(S, sel, p, ctx) },               // sel = selector list of ONE kit component
  state:    { name, css(S, sel, p, ctx) },
  hooks: { canvas(p, ctx, base) { return '#f4ecd8'; } }  // any def hook except tokens; called fn.call(def, p, ctx, ...hookArgs)
});
```
Every part is optional. `corner-radius` params: `pill` (controls fully round), `round` (default true: switch/progress/avatar 999px; false = they take the `controls` radius). `p` = resolved params (defaults applied, numbers clamped, bad values warn and fall back).
`ctx = { spec, key, scope, S, SD, ON, sel, mode, bus, specContrastFit }`: `SD` is the dark scope (`S[data-mode="dark"]`),
`sel(name | [names])` the selector list of kit components, `ON.hover|press|focus|selected|disabled(sel)` wraps a list in
a state selector, `mode` is `'light'|'dark'` inside `tokens`, `'any'` in css unless a param is a per-mode pair (then `'light'` / `'dark'`; use vars or `SD`), `ctx.component` is set
for material/state calls. Materials/states are global by `name`; a duplicate id or name is a `console.error` and the second move is ignored.

## Validation

The spec must be pure JSON data. A function (or NaN, undefined, class instance) is rejected with `console.error` naming the key and path; nothing
registers. Unknown move, param, kit component, material or state: `console.warn`, that piece skipped. `def.tokens` = every move's `tokens()` merged in
order (later wins). Hooks: first provider wins, a second warns. CSS order: each move's `css`, then per kit entry the material then the states, then the
art slot rules. Kit params override the spec-level params for that move. Returns the def (or null).

## Kit components (`KIT_COMPONENTS`, 70)

v1 set (28, unchanged): button-primary, button-secondary, button-ghost, button-icon, button-danger, field, select, switch, checkbox, radio, slider, segmented,
tabs, card, panel, list-row, chip, badge, progress, avatar, tooltip, modal, sheet, toast, callout, menu, navbar, topbar.

v2 additions (42, each with real selectors in `js/aesthetic-spec.js`; all match elements in the Built kit): button-split, button-fab, button-back-top, link,
stepper, knob, date-field, combo, listbox, calendar, calendar-day, wheel, accordion, carousel-card, matrix-tile, divider, section-label, empty-state,
overlay-scrim, side-sheet, drawer, popover, popup-tip, lightbox, lightbox-control, topbar-title, tabbar, nav-menu, nav-item, breadcrumbs, anchor-nav, scrollbar,
dropdown-trigger, menu-item, mega-menu, menubar, ribbon, pie-menu, spinner, skeleton, notification-dot, kbd. (`panel` is board-only; the rest match in the kit page.)

## Core moves (`js/moves/core.js`)

corner-radius, hairline-rule, heavy-border, tinted-neutral-canvas (hook), caps-mono-labels, tight-display-tracking, paper-edge (colour, writes `ctx.bus.edge`),
edge-underline (reads it); materials flat-fill, outlined, hard-offset; states invert-on-hover, ink-fill-selected, press-sink.
Helper: `specContrastFit(fg, bg, min = 4.5)` (global) returns fg nudged in lightness to meet the ratio.
