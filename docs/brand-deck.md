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
| 9 | Closing | Wordmark, motto, contact line placeholder ("hello@{brand-slug}.com"), aesthetic influences | board footer vocabulary |

## Mechanics
- New `js/brand-deck.js` + `css/brand-deck.css`. Each slide is its own root:
  `<section class="ab ab-slide" data-ae="…" …same data attrs + inline CSS vars as boardHtml…>` at
  a fixed design size of 1280×720 (overflow hidden), so container queries resolve to the wide
  layout and every aesthetic's existing scoped CSS applies. Reuse boardHtml's internal builders —
  refactor `js/aesthetic-board.js` to expose its section builders (hero, swatches, type block,
  sections 01/02/03, footer) and the root-attribute/vars builder as functions instead of
  duplicating markup. Keep boardHtml output byte-identical for the board (verify by diffing the
  rendered HTML for all 26 aesthetics before/after the refactor).
- Each slide's outer card scales the 1280×720 slide to its grid cell with CSS `zoom` (already used
  by Compare) and keeps 16:9.
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

### Known limits
- Covers that cannot reach scale 0.85 with the 132px band: neo-deco (about 0.5; its title-card row is a fixed 560px stage), mixed-type (about 0.65; the statement is the tall art) and bento-grid (about 0.79). They are scaled, never clipped.
- Pre-existing, not from this change: Blob Tracking's slide header overflows 34px on four slides; Raw Brutalist's closing headline is wider than its column; the Interface slide is 2-20px wider than its box in a few aesthetics.
- PNG/PDF export (html2canvas) flattens backdrop effects; Liquid Glass's cover copy is missing from the export (it was before this change too).

