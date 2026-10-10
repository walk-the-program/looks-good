# Brand patterns — generator integrated with the brand

## Intent
The user wants generative textures and patterns inside Branding Designer, driven by the same
brand inputs, and used in the brand deck. Reference: a private local mirror of third-party tools
(~/Desktop/Ptrn). That code is someone else's work marked "do not redistribute / not for version
control", so **nothing is copied from it** — not code, not names, not assets. Workers must not
open or read files under ~/Desktop/Ptrn. Everything below is original code implementing common,
long-established generative techniques.

## Placement (decided)
1. **Patterns view** — a third workspace view next to "Board | Compare all": "Patterns". It shows
   a large live generator with controls on the right, and a "Brand suite" strip of six patterns
   auto-picked for the current aesthetic. This is the "flip over to patterns" page.
2. **Brand deck** — a "Patterns" slide (the suite as a 3×2 swatch wall with names) and the
   chosen hero pattern available as the cover/closing background treatment.
3. **AI brief** — a "Patterns" section: which pattern families fit, the ink-role mapping
   rules, and every pattern the user added to the brief (see "Brief cart" below), each with its
   use, exact ink hexes, settings, and an SVG snippet or a pointer to the exported file.
Not added to the board UI itself.

## Engine (js/patterns/)
- `engine.js`: seeded PRNG (mulberry32/xorshift — own implementation), 2D value/simplex-style
  noise + fBm (own implementation), palette mapping from brand roles, render-to-canvas at any
  size with devicePixelRatio, optional SVG output for vector families, grain/paper overlay,
  seamless-tile option where the family supports it.
- `registerPattern({ key, name, blurb, vector: bool, params: [...schema], render(ctx2d|svg,
  w, h, p, inks, rng, noise) })` — params schema drives the controls UI automatically
  (range/select/toggle/seed).
- Inks: patterns never invent colors. Each family declares ink slots (ground, ink1, ink2, spark)
  and the engine fills them from the brand roles: ground = canvas (or ink for dark variants),
  ink1 = primary or ink, ink2 = secondary, spark = accent (≤5% area by design). A "Colorway"
  control switches between: Brand (roles), Mono (ink on canvas), Duotone (primary+canvas),
  Night (canvas↔ink swapped). Optional "+ tints" adds derived tints (pri-tint/sec-tint/muted).
- Families (minimum 16, each visibly distinct and good at defaults):
  1 Halftone field — noise field banded into levels, printed through ringed or round halftone dots.
  2 Stipple — dot scatter whose density follows noise; lattice or random; optional mirror symmetry.
  3 Zigzag — interlocking teeth: rounded, chevron or staircase, duotone bands.
  4 Weave — stacked ribbon bands, each with its own vertical stripe rhythm.
  5 Op-art rings — stripes bent around 1–3 hidden centres (rings, eyes, saddles), flat colour.
  6 Counterchange — even bar field with a centred figure (circle/square/arch) phase-flipped.
  7 Pixel quilt — coarse grid of brick, plaid, checker, dithered diagonals, stair ramps.
  8 Gradient panes — rows of uneven panes, each a two-ink ramp in one of eight directions.
  9 Glyph grid — cells take square/diamond/ring/x/dot glyphs by noise band.
  10 Torn bands — ragged two-colour bands of mini-patterns with grain (print collage).
  11 Posterised terrain — noise contours cut into flat colour regions with dithered edges.
  12 Aura wash — soft blurred colour fields (radial blobs + blur + grain).
  13 Chevron mirror — banded diagonals mirrored into quadrants.
  14 Modular grid — seeded grid of blocks, dot matrices, line grids and ramps.
  15 Flow filaments — streamlines traced through a noise flow field, bundled.
  16 Signal mosaic — glitch bands: pixel confetti, block mosaics, smears, scanlines.
  17 Type terrain — noise terraces typed out in characters on a monospace grid.
  18 Arc rise — giant concentric colour bands rising from an edge over a bar field.
- Performance: render ≤ ~120 ms at 1200×800 on a laptop for every family at defaults (measure);
  heavy families render progressively or at lower internal resolution then upscale crisply.

## Aesthetic fit
`js/patterns/fit.js`: for each of the 26 aesthetics, an ordered list of 6 fitting families with
preset params (e.g. Riso Print → torn bands, halftone, stipple; Pixel Arcade → pixel quilt,
signal mosaic, type terrain; Aurora Noir → flow filaments, aura wash (subtle), modular grid;
Bauhaus Poster → counterchange, arc rise, modular grid; Liquid Glass → aura wash, op-art rings;
ASCII Art → type terrain; Xerox → halftone (threshold), stipple, signal mosaic in mono; Blueprint
→ modular grid lines, flow filaments in line ink …). The Brand suite shows these six.

## Patterns view UI
- Big canvas (16:9, fills the workspace width), "New variation" (reseed), family picker (visual
  tiles), auto-generated controls from the schema, Colorway control, Grain, Scale, Seed field.
- Brand suite strip (6 thumbnails) — click to load into the big canvas; the + on a thumbnail adds
  the pattern to the brief (saved in state.patterns, persisted with the brand, undoable, marks
  unsaved). The canvas has "Add to brief" next to the exports; each All-families thumbnail has
  the same + (it adds exactly what the thumbnail shows). In-brief items show a check. The
  "In your brief" strip lists them.
- Export: PNG (1×/2×/4K), SVG for vector families, "Copy CSS background" for small seamless
  tiles (data URI, size-capped).
- Respects locks? No — patterns are their own section; Shuffle everything does not reseed them.
- 390px: controls stack under the canvas.

## Brief cart (js/pattern-cart.js)
The old "pin" is now "Add to brief": same storage (`state.patterns`, max 8, undoable, marks the
brand unsaved), so brands saved with pins load unchanged. Each entry is
`{ key, params, colorway, seed, use, svg }` (`PatternPins`, js/patterns-ui.js):
- `use` is one of `hero` (Hero background), `band` (Section band), `card` (Card texture),
  `divider` (Divider strip), `accent` (Accent detail). Defaults by family: aura, terrain, flow,
  counterchange, arcrise, oprings, modulargrid -> hero; halftone, stipple, glyphgrid, pixelquilt ->
  card; zigzag, chevron -> divider; weave, signal, tornbands, gradpanes, typeterrain -> band.
  Brands saved without `use` load with the family default.
- `svg` (vector families only, default on) puts the SVG code in the AI brief.
- Tray: a "Brief · N" button in the workspace header (all three views; muted at 0, pulses on add)
  and a "Includes N patterns" line under "Copy AI brief". The tray lists thumbnail, name, colorway,
  use select, include-SVG toggle, per-item Copy and remove, plus "Copy full AI brief" and "Copy
  patterns only". Popover on wide screens, bottom sheet at <= 720px; Esc or an outside click closes.
- Brief text (js/ai-brief.js): `buildAiBrief(state)` (full), `buildPatternsBrief(state)` (the
  "## Patterns" section with a one-line preamble) and `buildPatternItemBrief(state, i)` (one
  block). Each block: family, use with placement rules, the exact final ink hexes by role (strength
  applied) with the brand token each one is, only the settings that differ from the defaults plus
  seed and strength, and reproduction:
  - seamless vector with SVG on: a 160x160 SVG tile plus a CSS `background-image: url("data:image/svg+xml,...")`
    block, only when the tile is <= 8 KB (`AIB_TILE_SVG_CAP`); over the cap the brief says to
    attach the exported SVG.
  - non-seamless vector with SVG on: a 1200x675 SVG (root set to fill its box) when <= 12 KB
    (`AIB_FULL_SVG_CAP`), else "attach the exported SVG/PNG" with the sizes.
  - raster families and SVG off: "attach the exported PNG at <size>" plus the regeneration settings.
  - Base64 PNGs are never pasted.
  - **Source** (every block, plus the "Families that fit" lines): where the exact generator lives, so an
    AI tool can fetch it and reproduce the pattern. It is this project's own engine only. Each block
    gets a `**Source**` sub-block with the project path (`PATTERN_SOURCE_ROOT` in js/ai-brief.js, default
    `~/Desktop/Branding Designer`; change it there), the engine file `js/patterns/engine.js`, the
    family file (e.g. `js/patterns/families/stripe.js`) with the family key, the load order (engine,
    the family files, then `fit.js`; plain scripts, no dependencies) and the exact calls in a `js`
    block: `Patterns.render(canvas, key, params, inks, seed, { width: 1200, height: 675, dpr: 1 })`, plus
    `Patterns.renderSVG(...)` for vector families and `Patterns.tileSVG(..., 160)` for seamless ones.
    `params` is the fully resolved set (`Patterns.resolve`, so `tone`, `grain`, `tints` included) and
    `inks` is `Patterns.inksFor({canvas, ink, primary, secondary, accent}, colorway, { tints })` with
    the five board-token hexes, so the call needs no `boardTokens`/aesthetic code and is deterministic
    (`dpr: 1` pins the pixel size). The Patterns section, "Copy patterns only" and the per-item Copy
    all start with one preamble line saying the patterns come from `js/patterns/` and that the same
    seed + params + inks give identical output. Each "Families that fit" bullet ends with
    `Source: <root>/js/patterns/families/<file>.js, family <key>.`
  - Family to file map: `Patterns.fileOf(key)` / `Patterns.FAMILY_FILES` (js/patterns/fit.js, kept in
    step with the `register()` calls in js/patterns/families/*.js), plus `Patterns.ENGINE_FILE` and
    `Patterns.LOAD_ORDER`. When adding a family, add its key to the map in fit.js.
- Engine: `Patterns.renderSVG(..., { tile: true })` / `Patterns.tileSVG(key, params, inks, seed, size)`
  render a seamless tile of a seamless vector family (grain forced off, same composition as
  `tileCSS`); `Patterns.finalInks(key, params, inks)` returns the inks a render really uses (tints and
  strength applied).

## Deck integration
- Patterns slide shows the patterns in the brief (or the suite if none) with family names and
  colorway labels; cover/closing may use the first one as a background panel (behind a
  solid copy area so text contrast holds).

## Acceptance
1. 18 families render well at defaults with brand inks for 3 palettes; none copy third-party code.
2. Aesthetic-fit suites look coherent with their boards for all 26.
3. Controls regenerate live; seed reproducible (same seed + params → identical pixels).
4. Patterns in the brief persist with the brand (including `use` and `svg`) and undo; exports work (PNG, SVG, CSS tile).
5. Deck Patterns slide renders and exports.
6. No console errors; renders within budget; 390px usable.
