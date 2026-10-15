# Brand deck — slides that follow the aesthetic

## Problem
The "Slide mockups" section renders a generic six-slide pitch deck (cover, what we do, results,
growth, testimonial, closing) from the brand colors, fonts and the old shape preset. It ignores
the selected aesthetic, so the board and the slides disagree. The user wants the slides to be a
**branding deck that reflects the UI decisions** — the same aesthetic, color roles, type, materials
and components as the board.

## Outcome
Replace the pitch-deck mockups with a **brand deck**: nine 16:9 slides rendered *inside the
selected aesthetic* (same `.ab[data-ae]` root, tokens, fonts and aesthetic CSS as the board), so
switching aesthetic restyles the deck exactly like the board. Per-slide PNG download, "Download
all", and a new "Download deck PDF" (jsPDF is already loaded; the Mac app vendors it).

## Slides (content holds the brand's own copy; every slide is a real brand-guidelines page)

| # | Slide | Content | Built from |
|---|-------|---------|------------|
| 1 | Cover | Wordmark/logo, tagline as headline with the aesthetic's highlight treatment, the signature art, "Brand guidelines" + aesthetic name + year | board hero markup (`.ab-hero`, `def.art`) |
| 2 | Principles | "How {Brand} looks and feels": the motto large, then 3–4 principles derived from `def.rules.do` (short title + one line each), aesthetic descriptor | new `.ab-deck-principles`, labels use `.ab-label` |
| 3 | Color system | Five role swatches (role, job, hex, use/never) + a proportion bar showing coverage (canvas/ink/primary/secondary/accent widths from the role coverage numbers) + 3 key contrast pairs with ratios | board `.ab-swatches` + new `.ab-deck-ratio`, `.ab-deck-pairs` |
| 4 | Typography | Heading face and body face specimens in the brand fonts: display line ("Aa" + tagline), type scale (Display / H1 / H2 / Body / Caption with px values from state.typography + aesthetic display scale), the recommended classes and the fit | new `.ab-deck-type` + the board Type block's recommendation line |
| 5 | Interface | The aesthetic's components: segmented control, primary CTA, field, toggle, the three states | board sections 01 + 02 markup |
| 6 | Material & graphics | The signature art large, plus the aesthetic's material names (from `def.materials[].name`) as labelled chips/annotations | `def.art` + new `.ab-deck-materials` |
| 7 | In product | A product-like composition: the 03 list + card from 01 composed as an app screen / landing section (the most "real-world" slide) | board 03 + 01 card |
| 8 | Do / Don't | Two columns from `def.rules.do` / `def.rules.dont` (4 each), with ✓ / ✕ marks in the aesthetic's style | new `.ab-deck-dodont` |
| 9 | Closing | Motto (the slide header carries the wordmark; it is not printed a second time), contact line placeholder ("hello@{brand-slug}.com"), aesthetic influences | board footer vocabulary |

## Mechanics
- New `js/brand-deck.js` + `css/brand-deck.css`. Each slide is its own root:
  `<section class="ab ab-slide" data-ae="…" …same data attrs + inline CSS vars as boardHtml…>` at
  a fixed design size of 1280×720 (overflow hidden), so container queries resolve to the wide
  layout and every aesthetic's existing scoped CSS applies. Reuse boardHtml's internal builders —
  refactor `js/aesthetic-board.js` to expose its section builders (hero, swatches, type block,
  sections 01/02/03, footer) and the root-attribute/vars builder as functions instead of
  duplicating markup. Keep boardHtml output byte-identical for the board (verify by diffing the
  rendered HTML for all 26 aesthetics before/after the refactor).
- Each slide's outer card scales the 1280×720 slide to its grid cell with a transform
  (`--deck-z`, set by `bdZoomCards`; see "WebKit: no CSS zoom on slides" below) and keeps 16:9.
- Slide chrome: a small header (brand + "Brand guidelines" + slide title) and footer (page n/9,
  aesthetic name) using `.ab-label` so aesthetics style them. Neutral base styles in
  css/brand-deck.css using board tokens only; aesthetics may add `.ab[data-ae="key"].ab-slide …`
  rules later (the CAO review will judge the deck too).
- Hooks for aesthetics (optional, additive): `def.deck = { coverArtScale, hideSlides: [] }` only
  if needed — default works for all 26.
- Rendering: `renderBrandDeck()` called from render() (replace the renderSlideMocks call there and
  in suggest-ui.js hover preview); only render when the slides section is in view or on idle
  (IntersectionObserver / requestIdleCallback) so 9 extra aesthetic roots don't slow every render.
- Export: PNG per slide via html2canvas on an off-screen 1280×720 clone at scale 2 (not the zoomed
  card). "Download all" sequential like today. "Download deck PDF": jsPDF landscape 1280×720 px
  pages, one image per slide. Note that html2canvas cannot reproduce backdrop-filter, conic
  gradients and some blend modes; where an aesthetic depends on them, export may look flatter —
  report which aesthetics are affected (test all 26 once) rather than hiding it.
- Remove the old pitch-deck markup from index.html and stop loading js/slide-mocks.js only if
  nothing else uses its helpers (slMix etc. are used by app.js/brand-guide.js — check; move shared
  helpers if needed). css/slides.css removed if unused.
- Section title "Brand deck" with a one-line description ("Nine guideline slides in the {aesthetic}
  language."). Keep the Download all button; add Download PDF.

## Acceptance
1. Switching aesthetic restyles all nine slides consistently with the board (spot-check 6 diverse
   aesthetics: Soft Form, Raw Brutalist, Aurora Noir, Bauhaus Poster, Pixel Arcade, Blueprint).
2. Every slide fits 1280×720 with no clipped content for all 26 aesthetics (automated check:
   scrollHeight ≤ clientHeight per slide root, plus a contact sheet of all 9 slides for 6
   aesthetics reviewed by eye).
3. Board HTML unchanged by the refactor (diff for all 26).
4. PNG, Download all and PDF export work; list aesthetics whose export degrades.
5. No console errors; render performance: switching aesthetic stays responsive (measure render()
   time before/after; deck rendering deferred).
6. 390px: slides grid becomes one column, cards scale, no page overflow.

## Cover, product slide and per-aesthetic overrides (CAO-4: D1-D6, A1-A4)

The deck now has ten slides (Patterns is slide 07, added by js/patterns-deck.js); the table above lists the original nine.

- **D1 Cover.** The cover's pattern is a full-width bottom band (`.pt-deck-band`, 1280x132, 1px `--ab-line` rule on its top edge, in css/brand-deck.css). The cover content is padded 158px above it. The closing slide keeps its 288px left strip.
  `bdFitCover` (js/brand-deck.js) sizes the cover headline *first*: start at `min(132px, 11.5cqw) x display scale` (inline `!important`, since aesthetics size their hero headline themselves), then
  1. shrink in 4% steps only until the copy stays inside its column (and, for the scene hero, inside the art);
  2. if the cover would still need a scale under 0.85: shrink the headline down to 88px x display, then the art box (`max-width`, 8% steps, floor 40% of its width; the scene hero's art is left alone), then the headline on to the 64px floor;
  3. an art-led hero that still cannot reach 0.85 may drop the headline below 64px (floor 40px) only if that actually helps; otherwise `bdScaleToFit` scales it (never below 0.4).
  `bdScaleToFit` is the last resort. The scale it applied is left on each slide root as `data-fit-scale` (the cover also carries `data-cover-fs`, `data-cover-clear`) for the fit checks.
  Cover layout helpers (all cover-only): a centered hero with a wide, short art stage (Aurora's window) goes side by side (`data-cover-side`); a scene hero's art ratio is 2.7:1; a hero that is `display: contents` on the board (Bento) becomes a plain split (`data-cover-flat`); the poster hero's reserved bottom padding is cut to what the art needs, and the copy is narrowed so no text line is within 24px of the art (`bdCoverClearArt`).
- **D2 In product.** `.ab-deck-side` is a neutral panel (`ink 4% over canvas`, not the primary tint), 196px wide; the sidebar wordmark wraps (13px, line-height 1.2) instead of truncating.
- **D3 Material stage.** `def.deck.materialStage`: `'art'` (default) or `'pattern'`. With `'pattern'` the stage shows the first pinned (else first suite) pattern at stage size, through the new `deckStageHook` (set by js/patterns-deck.js); the material chips are unchanged. Set for raw-brutalist, micrographics, rebus.
- **D4 Quiet tone.** Every pattern render in the deck (wall, cover band, closing strip, material stage) passes `Object.assign({}, entry.params, { tone })` with the suite entry's `tone` (or the pin's `params.tone`), default 1. Quiet suites (Aurora, Soft Form, Liquid Glass, Blueprint) stay quiet on the deck.
- **D5 Principle titles.** `.ab-deck-ptitle` uses the body face at weight 600 when the root has `data-hcls` `pixel`, `deco` or `condensed`.
- **D6 Type scale.** The Display / H1 / H2 samples of light serifs rendered at ~20-30px because Editorial gives its hero headline `grid-column: 1; grid-row: 2`, which leaked into the type-scale grid and squeezed every sample into the 120px label column (so `bdFitSamples` shrank them). The deck headings now reset their grid placement (css/brand-deck.css); the caps are 96 / 56 / 40px, and the label states the size actually shown.
- **A1-A4** are scoped rules appended to css/aesthetics/{xerox,liquid-glass,editorial-serif}.css (`.ab[data-ae="key"].ab-slide ...`): Xerox cover art lower and narrower with the tear-off strip hidden; Liquid Glass cover copy `max-width: 46%` (and its small timer card hidden: it sits where the headline goes); Editorial's drop cap off on slides. Rebus needs no CSS (D3 `materialStage: 'pattern'`).

### Cover-scoped rules and final cleanup (ZC)
- **Per-aesthetic covers** (deck-scoped rules appended to css/aesthetics/{rebus,raw-brutalist,neo-deco,mixed-type,bento-grid}.css; the board is unchanged):
  - Rebus: one full-width column (the `data-cover-side` split is overridden): kicker, the rebus headline at 112px, the equation and legend as a supporting row.
  - Raw Brutalist: poster scale. The spec index becomes a one-row, four-column strip under the headline, the kicker and the cover meta row are hidden, the headline runs 120px+ (three lines) across the slide.
  - Neo Deco: header and footer compacted to one row each, the fixed 560px stage row dropped, thinner frame; the sunburst and the stepped frame stay.
  - Mixed Type: full-width art, 104px mixed headline, one caption line and the four-voice specimen row (glyph set and scale row stay on the board).
  - Bento Grid: hero tile (statement) beside one tall tile (the phone), the tile's board min-height dropped.
- **bdCoverCopyFits** (js/brand-deck.js): `scrollWidth` also counts decoration that bleeds on purpose (Raw Brutalist's highlight band), so when it reports overflow the check looks at the text lines themselves (`bdCopyTextInside`). That is what held Raw Brutalist's cover headline at 64px.
- **Highlight band** (`bdBleedBands`, Raw Brutalist deck slides): the band's pseudo-element is sized to the slide content's right edge (`--ab-hl-bleed`) instead of the board's fixed `100cqw`, so it no longer overflows the slide's column.
- **Deck headings stay `position: relative`** (css/brand-deck.css), not static, so an aesthetic's tracking boxes and labels anchor to the heading as on the board. Static anchored Blob Tracking's `.ab-headline::before` to the slide (a 745px box) and made the slide header overflow 34px.
- **Interface slide** keeps a 24px right gutter so a pressed button, a rotated or shadowed panel stays inside the column.
- **Export**: `bdLiftSceneCopy` lifts a scene hero's copy above the art in the html2canvas clone (and drops the text-shadow glow), which fixed the Liquid Glass cover copy missing from PNG/PDF.

### Known limits
- Cover scale: every cover reaches 0.85 or better (Neo Deco 1.0, Mixed Type 0.88, Bento Grid 0.98). They are scaled, never clipped.
- Covers whose art deliberately bleeds past the content column into the slide margin (Neo Brutal Pop, Aurora Noir, Bauhaus Poster, Riso Print, Mesh Gradient, Xerox: 2-55px) report a wider `scrollWidth` than their box; the slide root clips and nothing leaves the slide.
- PNG/PDF export (html2canvas) flattens backdrop effects, conic gradients and some blend modes; the aesthetics affected stay flatter in the export than on screen.

## Simplified deck and the gore detector (DS)

The deck reused board components inside narrow containers (Bento's `display: contents` tiles, the board list and card), which squeezed, truncated and overlapped. The slides now carry less and render deck-owned components with fixed, comfortable sizes. The board is unchanged (`boardHtml` diffed for all 26 aesthetics in both modes: identical).

### Content per slide (supersedes the table above where it differs)
- **Principles**: the motto, one summary line, exactly three principles (title <= 6 words, optional line <= 12). Hand-written per aesthetic in `def.deck.principles = [[title, line], ...]`; without it `bdPrinciples` shortens the first three `rules.do`.
- **Color system**: five swatches (role, job of 2-4 words, hex), the proportion bar with a one-line legend, three compact contrast chips (Text, Action, Highlight). No use / never paragraphs.
- **Typography**: heading and body specimens ("Aa" + face name) and a three-row scale (Display, Heading, Body, with px). The recommended / fit lines live on the board.
- **Interface**: three cells (segmented control with a fixed minimum segment width, the primary action, the toggle with its label) taken from the board's own markup (`bdPart`), plus the board's states row when it has one.
- **Material**: the art and up to four material names (a parenthetical is dropped from the name).
- **In product**: a deck-owned app screen (264px sidebar with the brand wrapping at word boundaries and three nav items; a title, three rows of dot + name + percentage, one CTA card). Status is a dot, never a chip over the number.
- **Do / Don't**: three lines each, <= 10 words: `def.deck.do` / `def.deck.dont`, else the shortened rules.
- Cover, Patterns and Closing keep their content; only gore was fixed.
- `def.deck` may now hold `principles`, `do`, `dont` (and still `materialStage`).

### Text floor
Nothing on a slide is under 12px (tracked uppercase labels may be 11px). `bdMinText` lifts any text below the floor after the build; a slide that still has to scale (`bdScaleToFit`) lifts its text once more by `12 / scale`. That second pass undoes only its own lifts (`data-bd-min`): sizes another fit set in between (the cover headline, a long brand name) stay. Scales of 0.97 or more are not applied (the body's bottom padding absorbs them and a near-1 transform makes Y2K Chrome's clipped-text headline paint a ghost word). `BD_COVER_MIN_SCALE` is now 0.98.

### `deckGoreReport(slideEl)` (dev/deck-gore.js)
The "no UI gore" detector is a test-only file, `dev/deck-gore.js` (load it after `js/brand-deck.js` in a test page); it is not part of the shipped app and `js/brand-deck.js` does not define it. It returns `[{ type, slide, el, text, detail }]` for one built slide (empty = clean); `.stats` holds `{ text, contrastSkipped, whitelisted }`. For every visible text-bearing element it checks:
1. `overflow`: text runs past its own box, or a clipping box (`overflow` not visible) has `scrollWidth > clientWidth + 1` / ellipsis / `scrollHeight` overflow.
2. `broken`: one word wrapped across lines (a Range per word; splits on spaces, hyphens, slashes).
3. `overlap`: text of two unrelated elements intersects by more than 2px both ways (ink boxes, 0.8 x font size tall). Text drawn in the art counts as the second party; a painted label in the art (a floating button) counts as its whole box.
4. `clipped`: text cut off by an ancestor with overflow hidden / clip, the slide root included.
5. `small`: computed size under 12px (11px for tracked uppercase), after the slide's fit scale.
6. `contrast`: under 3:1 against a flat background; skipped (counted in `contrastSkipped`) under gradients, images, absolutely positioned pseudo-element fills and over the art.
Skipped as not text on the slide: anything `aria-hidden` (art), `.ab-deck-pattern`, `svg`, visually hidden 1px boxes (the real headline of aesthetics that draw it in the art), checkboxes. An intentional overlay can opt out of overlap / clipped with `data-gore-ok="reason"` on the element or an ancestor (the reason is required). None are used.
Not detected by machine: text over decorative art shapes that carry no text (a sunburst behind a framed headline). Review those on contact sheets.

### Deck-scoped aesthetic rules added (DS)
mesh-gradient (header ink on non-cover slides, payout card hidden on the cover), neo-brutal-pop (mock "Get started" button hidden on the cover), groovy-70s (cover arch beside the statement, not around it), bento-grid ("Direction saved" chip hidden on slides).

### Export
`bdShadowFixes` drops blurred negative-spread box-shadow layers in the export clone (html2canvas draws them as a grey rectangle that ignores the radius). Other blurred shadows on rounded boxes still render with html2canvas artifacts in PNG / PDF (Bento, Soft Form, Clay); this is the existing limit listed above.

## Round 6: native In product and Do/Don't, aesthetic radius, deck hooks (FW)

- **In product** is assembled from the aesthetic's own board parts (list rows, 01 card, toggle) in their own section wrappers inside a screen frame that wears the aesthetic's card border and radius; `bdFitProduct` zooms it (1.3 → 1, then a wider list column, then stacked sections down to 0.72) so no text is cut. `def.deck.product(ctx)` (alias `productStage`) replaces the scene.
- **Do and don't**: "Do" / "Don't" set big in the aesthetic's headline face (`bdFitDoDont` shrinks both together until they fit), three rules each as equal ruled bands, text markers (`def.deck.marks`, else the rule numbers in the label face). No teal discs.
- **`--dk-r`** is the aesthetic's own card radius (probe card, `bdApplyRadius`) or `def.deck.radius`; the user's shape preset no longer reaches the deck.
- New hooks: `def.deck.materialArt(ctx)`, `def.deck.patternsStage(ctx)`, `def.deck.coverBand: false`, `def.deck.closingStrip: false`, `def.deck.coverMin`, `--dk-min-text: off | <px>`; text at `font-size: 0` is never lifted by the 12px floor. Full contract: docs/aesthetics-plan.md, "Round 6 framework hooks".
- `font-synthesis: none` on every slide (and board): single-weight faces are never fake-bolded.

### Export sanitizer (round 6 cleanup)
`bdSanitizeClone` (the html2canvas `onclone` hook) rewrites what html2canvas cannot draw, in the clone only:
- **Inset rings and outer `0 0 0 Npx` rings**: html2canvas painted them as a solid fill (swatches black, buttons blank) while the export clone sat at `left: -10000px`; with the host on screen but invisible (`.deck-export-host`: `left: 0; opacity: 0; z-index: -1`) it draws them correctly, so no shadow rewriting is needed for them (an earlier `bdInsetFixes` was removed). Keep the host on screen.
- **calc() in background-size / -position**: `bdCalcPx` resolves any calc() of px, %, + - * / against the padding box, so `calc(var(--x) * 2)` works.
- **Prepared in the page before html2canvas** (`bdPrepareExportClone`; html2canvas does not wait for an async `onclone`): inline svg gets the filters / masks / gradients it references from other svgs copied into its own `<defs>` (Xerox keeps its filters in a hidden `.xr-defs` svg, so its Material art exported empty), attributes the HTML parser made from broken markup are dropped (an unescaped quote in a style attribute made the serialized svg invalid), and `var()` in attributes is resolved; a background of 4+ gradient layers (Old Web's starfield), a `cover` / `contain` picture background (Blob Tracking's band and strip) and `object-fit` on an `<img>` are baked into a bitmap by the browser (SVG foreignObject / canvas) and set as a single image. If the browser refuses (a tainted canvas) the element is left as it was.
- The earlier fixes (color(srgb), switches, clipped-text, scene copy, negative-spread shadows, background layer lists) are unchanged.
Known limits that remain per aesthetic: clip-path shapes and some pseudo-element glyphs (neo-deco "Stepped" frame, dystopian-luxury CTA label) do not export. (Superseded by the round 6 final sweep below.)

### Export, round 6 final sweep
Measured on 8 aesthetics x all slides (curio-cabinet, dark-academia, dystopian-luxury, neo-deco, big-top, frutiger-aero, liquid-glass, industrial-device): mean PNG-vs-screen difference at most 7.3/255 per slide, every switch knob present. What changed:
- **Box shadows** (`bdShadowFixes`): html2canvas 1.4.1 only clips a shadow to the outside of a square, untransformed box. On a rounded box (radius > 1px) or one that is rotated / skewed (itself or an ancestor) every layer was painted over the element (a ring became a 10px slab; Curio's pinned card left a dark block under it). There a plain ring (`0 0 0 Npx`, outer or inset) becomes a border of the same colour sized so neither the outer box nor the content moves, and every other layer is dropped. Square boxes keep their shadows (html2canvas draws those right), minus negative-spread blurs.
- **Switch knobs** (`bdFlattenSwitches`) now run in the in-page prepare step: inside html2canvas's own clone the `::before` knob was already `display: none`, so it was lost in every export.
- **`inline-flex` / `inline-grid`** (`bdFlattenInlineFlex`): html2canvas dropped their children (Curio, Dark Academia and Dystopian Luxury CTA labels and knobs). They become `flex` / `grid` (inside an inline-block wrapper of their exact width when the parent is not a flex/grid container).
- **border-image, clip-path, `filter: url(#id)`** (`bdBakeBoxes`): the element's own box is drawn by the browser into a bitmap (SVG foreignObject, with the referenced filter defs copied in) and becomes its only background; pseudo-elements that need it are first made real spans. Fixes Neo Deco's stepped frames and notched blocks and Acid Graphics' ripple.
- **svg text fonts** (`bdEmbedSvgFonts`): an svg drawn as an image cannot see the page's web fonts, so svg `<text>` fell back to another face (Dystopian Luxury's cover wordmark, Riso Print's cover). The Google Fonts it uses (latin, latin-ext) are inlined into the svg as data URLs.
- **Vertical text** (`bdFlattenVerticalText`): html2canvas ignores `writing-mode`; vertical labels (Dark Academia's book spines) are laid out horizontally in an inner box turned 90deg.
- **`isolation: isolate`** (`bdIsolate`): not a stacking context to html2canvas, so a `z-index: -1` child vanished under its parent; a positioned isolated element gets `z-index: 0`.
- **WebKit** (Safari, the Mac app): a pattern made from an svg image marks the canvas insecure, so one tiled svg background made `toDataURL` throw ("The operation is insecure"; Neo Deco's In product and Interface slides). In WebKit only, svg background layers are drawn once into PNGs first (`bdRasterSvgBackgrounds`).
- **Deck card zoom**: `bdZoomCards` snaps a zoom within 0.5% of 1 to 1 (0.9984 turned 2px borders into 1px at DPR 1); the card clips the last pixel or two.
- **Acid Graphics** (fixed inside the aesthetic, round 6 final gate): export now differs from the screen by 3.7-7.7 mean per slide (was 11.6-38.5). Causes and fixes, all in css/aesthetics/acid-graphics.css and the flyer markup:
  - html2canvas read `calc(100% - 1px)` in a gradient stop as 0, so the slide's 12-column grid layer filled the whole stage with the line colour (+10 on every pixel). The right-edge line is now `linear-gradient(270deg, line 1px, transparent 1px)`, and the column lines a tiled plain gradient (`0 0 / calc(100% / 12) 100%`) instead of a `repeating-linear-gradient`, which html2canvas does not repeat (the flyer barcode had the same fix).
  - html2canvas inserts a parent's `::before` as a real first child, so the `.ab-label:first-child` section-title rule stopped matching and "Pattern suite" etc. exported as small mono labels. The rule now uses `.ab-label:not(.ab-label ~ .ab-label)`. Any aesthetic rule that relies on `:first-child` / `:last-child` inside a parent with `::before` / `::after` content has the same trap.
  - html2canvas 1.4.1 paints equal negative z-indexes in reverse DOM order (its insertion index for a new negative stack is always before the existing one), so the flyer's small ripple vanished under the big one. The small ripple is now first in the DOM at z-index -1 and the big one at -2: the same order on screen and in the export.
  - `filter: drop-shadow()` is not drawn, so the outline words (the headline's last line, the flyer word) lost their two offset echoes. Export-only rules under `.deck-export-host` draw the echoes as two stroked `attr()` copies (`data-c` on each headline letter, `data-w` on the flyer word) at z-index -1, relying on the reverse order above to put the far echo underneath.
  - Remaining: the flyer word's turbulence warp (`filter: url(#acw)` on text) and the flyer's 5px offset shadow do not export; the pattern tiles rasterise slightly differently (Patterns slide 7.7).
- **Switch labels** (`bdFlattenSwitches`): a switch pseudo-element whose content is text (Xerox OFF / ON, Acid Graphics ON AIR) now carries that text into the flattened span; only the knob's box was copied before, so the labels were blank in every export.
- **Xerox** (export-only rules under `.deck-export-host` in css/aesthetics/xerox.css; the screen is unchanged, live before/after 0.00): the dashed row and footer rules and the striped progress fills are tiled plain gradients instead of `repeating-linear-gradient`; the card's inset toner edge is a border (the filtered card box is baked by `bdBakeBoxes`, which does not carry an inset box-shadow); the CTA's dotted ghost copy is 2px squares on its 4px grid (html2canvas draws no radial-gradient dots in a tile) offset with `inset` (html2canvas over-shifted its `translate()`). Remaining: the roughening filters on text (`#xrx-lite` on the card title) do not export.
- **Measuring**: the export kit (S/fs/exp.sh) screenshots the live slide at a fractional page offset, so the live image is 721px tall and is resized to 720 before the diff. On fine noise textures (Xerox's toner patterns) that half-pixel resample alone costs about 3 points: Xerox Patterns is 9.7 resized and 6.6 against the live image cropped at its best integer offset.

### Pattern layering on slides
`.ab-deck-pattern` (the cover band, the closing strip) sits at `z-index: 1`, below `.ab-in` (also 1, later in the DOM) and above any `z-index: 0` wallpaper pseudo-element an aesthetic puts on the slide root (Aurora Noir's grid-fade `::after` used to paint over the band and leave it flat black).

## WebKit: no CSS zoom on slides (show build, DECK)
- The Mac app's engine (WebKit) never lets CSS `zoom` take text of 9px or more below 9px. With the
  deck cards zoomed to 0.36 (a 464px card), every 12-24px label was drawn at 9px and outgrew its
  box: 1,067 gore issues over 35 aesthetics x 4 configs, none in Chromium. Deck cards
  (`.deck-frame`, css/brand-deck.css) and present mode (`.pr-stage`, js/present.js `layout()`) now
  scale with `transform: scale()`; the frame's negative margins give it the scaled size in the card.
  Present mode also used zoom above 1x, where WebKit zooms container-query units twice (ASCII Art's
  cover art ran over the footer at 1.5x).
- Present mode fits its slides with all of them shown and without `aria-hidden` for that one pass
  (`fitSlides`): the fits skip hidden and aria-hidden text, so the 12px floor never reached slides
  that were off screen.
- A type-scale sample ignores the aesthetic's headline `max-width` (Frutiger Aero's 11.2em shrank
  with the font, so a wide face could never fit).
- Gore run: 35 aesthetics x {recommended mode, other mode, "BallKnowledge Collective International",
  Unbounded headings}, recommended font pairing, seeded colours; deck grid at 1000, 1360 and 1920
  wide and present mode at 900, 1100, 1360 and 1920 wide: 0 issues.
