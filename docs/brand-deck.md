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
