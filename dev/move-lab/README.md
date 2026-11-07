# Move lab (spec runtime, contract rev 1)

Prototype: an aesthetic is pure data (moves + params + a kit component map). `js/aesthetic-spec.js`
turns it into a normal `registerAesthetic` def plus a generated, scoped `<style id="spec-<key>">`.
Nothing loads unless the URL has `?movelab=1` (one guarded tag in `index.html` loads `dev/move-lab/lab.js`).

Files: `js/aesthetic-spec.js` (runtime), `js/moves/*.js` (move libraries; `core.js` now, `soft.js`, `acid.js`,
`editorial.js` later), `dev/move-lab/specs/*.js` (one spec per rebuild; `smoke.js` now), `lab.js` (loader; edit its
arrays to add files, list only files that exist, a 404 shows as a console error). Lab keys end in `--moves`, `order` 900+.

Run: serve the repo, open `/?movelab=1`. Shots: `LG_QUERY='?movelab=1' dev/move-lab/shoot.sh <port> <outdir> smoke--moves`.
Inspect: `SPEC_LAB.{moves,materials,states,specs,css}` (css is keyed by spec key).

## Scope and selectors

Scope `S = .ab[data-ae="<key>"]` matches the board, Built kit/phones (`.ab.sb-ab.sb-kit`) and every deck slide.
A kit component is a list of selector fragments (`KIT_COMPONENTS`); each is emitted as `S frag` and
`S.sb-ab.sb-kit frag` (the second outranks `css/see-built.css`). Styling reads the framework vars
(`--ab-canvas --ab-ink --ab-primary --ab-on-primary --ab-secondary --ab-accent --ab-line --ab-muted --ab-pri-tint`...).

## registerMove

```js
registerMove({
  id: 'corner-radius', category: 'shape', tier: 'token|recipe|generator|bespoke',
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
`ctx = { spec, key, S, SD, ON, sel, mode, specContrastFit }`: `SD` is the dark scope (`S[data-mode="dark"]`),
`sel(name | [names])` the selector list of kit components, `ON.hover|press|focus|selected|disabled(sel)` wraps a list in
a state selector, `mode` is `'light'|'dark'` inside `tokens`, `'any'` in css (use vars or `SD`), `ctx.component` is set
for material/state calls. Materials/states are global by `name`; the same name twice overwrites with no warning.

## Spec

```js
registerSpecAesthetic({
  key: 'smoke--moves', order: 900, name, descriptor, influences, summary, motto, kicker, mode,
  meta, build,                                                              // pure data, same shape as an AESTHETIC_META / AESTHETIC_BUILD entry; written to the live tables under the spec key
  labels, copy, layout, type, roles, rules, highlight, slideShape,           // meta: copied verbatim to the def
  colour: [{ move: 'tinted-neutral-canvas', params: { tint: 16 } }],        // colour moves (hooks.canvas / tokens)
  moves:  [{ move: 'corner-radius', params: { base: 2 } }],                 // applied in order, later tokens win
  kit: { 'button-primary': { material: 'hard-offset', state: ['invert-on-hover', 'press-sink'],
                             params: { 'hard-offset': { fill: 'primary' } } } },   // params keyed by material/state name or move id
});
```
Rules: the spec must be pure JSON data. A function (or NaN, undefined, class instance) is rejected with
`console.error` naming the key and path; nothing registers. Unknown move, param, kit component, material or state:
`console.warn`, that piece skipped. `def.tokens` = every move's `tokens()` merged in order (later wins). Hooks: first
provider wins, a second warns. CSS order: each move's `css`, then per kit entry the material then the states.
Kit params override the spec-level params for that move. Returns the def (or null).

## Kit components (`KIT_COMPONENTS`)

button-primary, button-secondary, button-ghost, button-icon, button-danger, field, select, switch, checkbox, radio,
slider, segmented, tabs, card, panel, list-row, chip, badge, progress, avatar, tooltip, modal, sheet, toast, callout,
menu, navbar, topbar.

## Core moves (`js/moves/core.js`)

corner-radius, hairline-rule, heavy-border, tinted-neutral-canvas (hook), caps-mono-labels, tight-display-tracking;
materials flat-fill, outlined, hard-offset; states invert-on-hover, ink-fill-selected, press-sink.
Helper: `specContrastFit(fg, bg, min = 4.5)` (global) returns fg nudged in lightness to meet the ratio.
