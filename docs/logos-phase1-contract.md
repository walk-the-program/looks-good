# Logos module — phase 1 contract (rev 1)

Shared decisions for the phase 1 workers. Scope and product decisions are in `logo-module-brainstorm.md`. This file is the interface: if your work needs a change here, stop and report it rather than drifting.

Plain JS, no modules or bundler. Each file exposes one global. Node is not installed: syntax-check with `osascript -l JavaScript` and `new Function(src)`, and test in the browser at http://localhost:8090.

## 1. Logo document (LogoDoc v1)

```js
{
  v: 1,
  id: 'lg_<base36 time><4 random>',       // matches /^[A-Za-z0-9_-]{1,64}$/ (native storage rule)
  name: 'Nominal Studios',
  createdAt: ms, updatedAt: ms,
  brandId: 'brand id' | null,             // the brand whose tokens resolve linked refs (linked by default)
  attached: ['brand id', ...],            // brands that use this logo (written by T11)
  artboard: { w: 1200, h: 600, bg: ColorRef | null },   // units = px at 100% zoom; bg null = transparent
  nodes: [Node, ...],                     // bottom → top
  preview: '<svg …>' ,                    // ink-on-transparent SVG of the artboard, written on every save (home thumbnails)
}
```

**Node.** Every node has:
- `id` (`'n_…'`), `type`, `name`.
- Placement: `x`, `y`, `w`, `h` (box in artboard units, before rotation), `rotation` (degrees, about the box centre), `flipX`, `flipY`.
- `opacity` (0–1), `locked`, `hidden`.

The types:
- `text`:
  - `text`, `font: FontRef`, `size` (px), `tracking` (1/1000 em, as in the logo engine), `lineHeight` (multiplier).
  - `case: 'as-typed'|'upper'|'lower'`, `align: 'left'|'center'|'right'`, `fill: ColorRef`.
  - `w`/`h` are derived from layout (auto-size) and stored for hit-testing. The engine shapes with HarfBuzz and draws outlines; text is never drawn with CSS fonts.
- `rect`: `fill`, `stroke`, `strokeWidth`, `radius`.
- `ellipse`: `fill`, `stroke`, `strokeWidth`.
- `line`: runs from the box's top-left to its bottom-right (w or h can be 0). It has `stroke`, `strokeWidth` and `cap`.
- `polygon`: `sides` (3–12), `fill`, `stroke`, `strokeWidth`.
- `star`: `points` (3–24), `inner` (0.1–0.95), `fill`, `stroke`, `strokeWidth`.
- `group`: `children: [Node]`, in the group's own coordinates. Its box is the union of the children.

**ColorRef:** `{ ref: 'ink'|'primary'|'secondary'|'accent'|'canvas'|'white' }` (linked to the brand) or `{ hex: '#RRGGBB' }` (unlinked). `fill: null` means none.

**FontRef:** `{ ref: 'heading'|'body', weight, style }` (linked) or `{ family, weight, style, axes? }` (unlinked). The family must be in `fonts/logo-manifest.json`.

## 2. Tokens

```js
LogoDoc.tokensFromBrandState(st) → {
  colors: { ink, primary, secondary, accent, canvas, white: '#FFFFFF' },   // hex
  fonts: { heading: { family, weight }, body: { family, weight } }
}
LogoDoc.defaultTokens()   // used when brandId is null: ink #1C1F26, Inter/Inter
```

`st` is a brand `savedState` (serializeState output) or the live `state`. Map the app's actual fields to these names (ink is `colors.neutralDark`) and document the mapping in doc.js.

## 3. Globals and ownership

| Global | File | Owner |
|---|---|---|
| `LogoDoc`: schema, ids, `create({name, brandId})`, `validate`, `clone`, `tokensFromBrandState`, `defaultTokens`, `resolveColor`, `resolveFont`, `fromRecipe(recipe)` (Logo Studio recipe → nodes: text, plus a rect for strip, rule and box, so that a same-colour strip covering the feet reproduces the crop without a mask) | js/logos/doc.js | T8 |
| `LogoRender`: `await toSVG(doc, tokens, {fill?: hex override, box: 'artboard'\|'content', pad: 0})` → outlined SVG string; `await toPNG(doc, tokens, widthPx, opts)` → Blob; `await nodeGeometry(node, tokens)` (cached outlines) | js/logos/render.js | T8 |
| `LogoEditor`: canvas interaction core (§4) | js/logos/editor.js | T8 |
| `LogoStore`: `list()`, `get(id)`, `put(doc)`, `remove(id)` | js/logos/store.js (+ library-store.js IndexedDB upgrade, mac/main.swift collection) | T9 |
| `LogosHome`: mode switch, grid, new-logo dialog, `open(id)`, editor shell, autosave | js/logos/home.js | T9 |
| `LogoChrome`: toolbar, inspector, layers, align bar, zoom, export dialog | js/logos/chrome.js | T10 |
| Attach to brand, brand sync, "Open in Logos" | js/logos/attach.js + js/logo-studio.js + js/app.js | T11 |

CSS: `css/logos-editor.css` (canvas, selection handles; T8), `css/logos.css` (home and editor shell; T9), `css/logos-chrome.css` (T10).

`index.html` has a single writer per wave: T9 in wave 1 adds the tags for every file above, including chrome.js, attach.js and logos-chrome.css, plus empty stubs for them so nothing 404s. T10 and T11 fill their own stubs.

## 4. LogoEditor API (T8 builds; T10 and T9 consume)

```js
const ed = LogoEditor.mount(containerEl, doc, { tokens });
ed.doc()                         // current doc (treat as read-only; mutate via methods)
ed.setTokens(tokens)             // re-resolve linked refs, re-render
ed.setTool('select'|'text'|'rect'|'ellipse'|'line'|'polygon'|'star'|'hand')
ed.tool()
ed.select(ids) / ed.selection() → [ids]
ed.add(nodeSpec) → id            // fills defaults; places at centre if no x/y
ed.update(ids, patch)            // shallow patch; one undo step per call (or per drag)
ed.remove(ids)
ed.group(ids) → id / ed.ungroup(id)
ed.reorder(id, 'forward'|'backward'|'front'|'back'|<index>)
ed.align(kind, relativeTo)       // kind: left|hcenter|right|top|vcenter|bottom; relativeTo: 'selection'|'artboard'
ed.distribute('h'|'v')
ed.duplicate(ids) → ids
ed.undo() / ed.redo() / ed.canUndo() / ed.canRedo()
ed.zoom(n|'fit'|'selection'|'in'|'out') / ed.zoomLevel()
ed.on('change'|'select'|'zoom'|'tool'|'history', fn) / ed.off(...)
ed.destroy()
```

**Interactions inside the canvas:**
- Click to select; shift-click adds to the selection; marquee selects; double-click a group to enter it and a text node to edit it.
- Handles resize (shift keeps proportions, alt resizes from centre) and rotate (shift snaps to 15°).
- Arrows nudge 1 unit, shift-arrows 10.
- Snapping to the artboard edges and centre, other objects' edges and centres, with guide lines and equal-spacing hints.
- Space-drag pans, pinch and ⌘± zoom, ⌘0 fits.
- Shortcuts: V, T, R, O, L, H for tools; ⌘G and ⇧⌘G group and ungroup; ⌘D duplicate; ⌘Z and ⇧⌘Z undo and redo; ⌘C, ⌘V and ⇧⌘V copy, paste and paste in place; ⌘[ and ⌘] reorder; Delete removes; Esc deselects.

Text editing on the canvas is an overlay textarea positioned over the node (no custom caret). The rendered glyphs update as you type.

## 5. Storage (T9)

- **Browser:** IndexedDB `brandingDesigner` goes to version 2, adding a `logos` object store keyed by `id`. The upgrade must keep `brands` intact.
- **Mac app:** the `library` message handler accepts an optional `collection: 'logos'`, which reads and writes `<app support>/Branding Designer/logos/<id>.json`. With no collection it behaves exactly as today.
- Autosave runs 800 ms after the last change, plus on leaving the editor.

## 6. Attach to brand (T11)

Attaching logo L to brand B writes B's `content.logo` in the existing contract shape (the one `brandLogo()` and the brief already read):

```js
{
  v: 1,
  ref: { logoId, updatedAt },
  files: { full: { ink, white }, wordmark: { ink, white }, mono: { light, dark } },
  minPx: { full, wordmark },
  clearSpace: 0.25,
  fonts: { word, secondary },
  updatedAt,
}
```

- Files are rendered with **B's tokens**, so a linked logo takes each brand's colours and fonts.
- `full` and `wordmark` are the tight content export: `white` sets every fill to white, `ink` uses the resolved colours.
- `mono` is the first letter of the topmost text node, made with `LogoEngine.monogram` in that node's font.
- When L is saved, every attached brand record is refreshed: both its saved and draft states, and the live `state` if that brand is open.
- When B's fonts or colours change in the brand editor, its `content.logo` is regenerated from L.
