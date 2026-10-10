# Round 4 — six more aesthetics (21–26)

Builds on docs/aesthetics-plan.md (contract, Board anatomy incl. Round 2/3 hooks and CAO framework
fixes F1–F10), docs/aesthetics-round3.md (font classes, recommendations, families) and
docs/cao-review.md (the quality bar and the mistakes not to repeat: clip-art tropes, stranded
headline words, template-like Type block, primary used as decoration, narrow-header breakage).

## The six

Keys: blob-tracking, xerox, micrographics, mixed-type, ascii-art, rebus. Orders 21–26.

### 21 Blob Tracking — Tracked · Clinical · Live
Influences: Computer vision / TouchDesigner visuals / Surveillance UI. Mode dark. Slide shape
`minimal`. Family Digital. Material label "Detection", states Searching / Locked / Lost (button).
Reference: the TouchDesigner / After Effects "blob track" look — OpenCV-style detection overlays
on footage: thin white bounding boxes around moving regions, small ID + confidence labels
("ID 07 · 0.93"), crosshair centroids, thin connector lines between boxes, coordinates, often over
a dithered or high-contrast monochrome image. Build: the hero art is a "footage" plate — a dark,
grainy, slightly blurred abstract scene made from the brand colors (large soft shapes, ordered
dither overlay) — with 5–7 tracked blobs: 1px boxes in ink (one in primary = the "locked" target),
corner ticks, mono labels on a solid label tab above each box, centroid crosshairs, and straight
1px connector lines forming a constellation. Small HUD readout in a corner ("TRACKING 7 · 30 FPS").
The tagline headline itself is tracked: boxes around two words with IDs. UI: interface elements
get detection treatment — the selected segment has a bounding box with a label tab, the CTA has
corner ticks, list rows show IDs and confidence bars. Type: mono labels, neo-grotesk headline.
Distinct from Cyber HUD (no neon, no chamfers, no glow — clinical white-on-footage) and Aurora
(the overlay vocabulary is the whole identity).

### 22 Xerox — Toner · Raw · Copied
Influences: Photocopy zines / Punk flyers / Office ephemera. Mode light. Slide shape `minimal`.
Family Print & editorial. Material label "Copy", states Original / 2nd gen / 5th gen (swatch).
Reference: 80s–90s punk/hardcore flyers, Raymond Pettibon era zines, modern xerox-revival
posters. Black toner on white paper: hard threshold contrast, toner speckle, edge burn (darker
vignette at the copy edges), streak lines from a dirty drum (1–2 faint vertical streaks), slightly
skewed copies (rotate ±0.6–1.2°), visible tape pieces and cut edges. Color is used like a
second-pass spot color or a highlighter on the copy (primary as a fluorescent overprint block,
accent as a highlighter swipe), never as smooth UI fills. Headline: condensed/heavy, uppercase,
cut-out ransom feel is NOT the default (too cliché) — instead a single heavy face, copied
(threshold-crisp, slightly toothed edges via SVG filter), with the highlight word in a primary
overprint block. Art: a degraded photocopied halftone image of the brand initial (coarse
threshold dots), a taped-on paper scrap, a copy-machine edge (black frame band). Components look
pasted-up: cards are paper scraps with tape, the CTA is a black toner block with a primary
overprint offset. Distinct from Riso (no soft colored inks/grain; this is black toner, contrast,
degradation) and Raw Brutalist (analog, dirty, human).

### 23 Micrographics — Tiny · Technical · Precise
Influences: Swiss technical print / Streetwear graphics / Product spec sheets. Mode light. Slide
shape `minimal`. Family Graphic. Material label "Detail", states Base / Annotated / Marked (swatch).
Reference: streetwear and tech-editorial layouts (Acronym, Nike ISPA, "techwear" graphics, modern
Swiss posters) where one huge element is surrounded by clusters of tiny type: 7–9px mono labels,
index numbers, registration marks, crosshairs, tiny barcodes, warning glyphs, coordinate pairs,
version strings, small arrows, hairline brackets. The contrast of scale IS the aesthetic: giant
headline (display ≈ 1.5, tight) vs microtype at 8–9px with generous tracking. Clean light canvas,
one primary accent used in tiny marks + the single CTA. Art: the brand initial as a huge
outlined/solid glyph with 20–30 micro annotations orbiting it on a precise grid (labels with
leader lines, tick rulers along edges, a small QR-like block, "SPEC 01/26"). Every panel has
micro corner labels (top-left index, top-right code, bottom-right page). Distinct from Blueprint
(no drawing-sheet field, light and graphic) and Cyber HUD (print, not screen; no glow).

### 24 Mixed Type — Eclectic · Editorial · Witty
Influences: Contemporary type mixing / Editorial covers / Specimen posters. Mode light. Slide
shape `refined`. Family Graphic. Material label "Voice", states Roman / Italic / Mono (swatch).
Reference: current type-mixing trend in identities and editorial (e.g. headlines that switch
between a high-contrast serif italic, a heavy grotesk and a mono within one line; specimen
posters by Pangram Pangram, Displaay, Commercial Type). The headline is set word-by-word in 3–4
contrasting faces from the library (heading face, a serif italic — Instrument Serif/Playfair
italic — a grotesk, a mono), sizes optically matched (cap heights aligned, not font-size equal),
with one word in the accent color. Pick the faces from the brand's own heading/body plus
recommended contrast faces so it still feels like the brand. Art: a type specimen block —
"Aa" in four faces with labels, a glyph set row, weight scale — not an illustration. Components
use one quiet face; the mixing lives in headlines, card titles and the palette labels. Strict
grid and generous whitespace keep it from chaos. Highlight `custom`. Distinct from Editorial
Serif (one serif voice) and Neo-Brutal Pop (no outlines/stickers).

### 25 ASCII Art — Textual · Generative · Nerdy
Influences: Text-mode art / Terminal UI / Generative ASCII. Mode dark. Slide shape `minimal`.
Family Digital. Material label "Characters", states Sparse / Dense / Solid (swatch).
Reference: modern ASCII renderings (character-density images, e.g. ASCII video art, terminal
dashboards, TUI apps like btop/lazygit, ascii-art landing pages). Everything is built from
monospace characters on a character grid. Art: the brand initial (or a radial/brand-shape form)
rendered as an ASCII density map — generate it in JS from a small bitmap/SDF: characters
" .:-=+*#%@" chosen by brightness, colored by a brand gradient (primary → secondary → accent) per
cell, crisp monospace, with a few highlighted cells. Box-drawing borders (┌─┐│└┘) for panels;
the segmented control as [ Design ] Build  Launch; progress as ████░░░░; toggle as [■ ON ];
buttons as > Save direction _ with a blinking block caret (static under reduced motion). Headline
in a mono or pixel face; the highlight word in the accent. Distinct from Pixel Arcade (no sprites
or stepped pixel borders; characters are the medium) and Cyber HUD.

### 26 Rebus — Playful · Symbolic · Clever
Influences: Rebus puzzles / Paul Rand's IBM eye-bee-M / Nouveau Rebus branding. Mode light. Slide
shape `soft`. Family Graphic. Material label "Symbols", states Word / Mixed / Symbol (swatch).
Reference: AIGA Eye on Design's "Nouveau Rebus" — dingbats or emoji-like symbols sandwiched
between words in identities; Rand's IBM rebus poster. The headline swaps one or two words for
bold flat pictograms in brand colors (built in SVG, not emoji): e.g. "feel" → a heart, "alive" →
a sprouting plant or a sun, "design" → a pencil — map common words with a small dictionary in JS
(eye/I, heart/love/feel, sun/day/alive/light, star/good/best, arrow/go/next, key/key, plant/grow,
bolt/power/fast, home/house, pencil/design/draw) and fall back to placing a symbol between words if
no word matches. Symbols sit on the baseline at cap height, same visual weight as the type. Art: a
rebus "equation" for the brand name — symbols + letters + "=" (e.g. a symbol for the first syllable
+ the remaining letters). Components carry small pictograms (tabs with icons, list rows with symbol
avatars). Heavy friendly sans, generous spacing, flat color, no outlines. Highlight `custom`
(the symbol replaces the highlight word; keep the word in visually-hidden text for accessibility).
Distinct from Neo-Brutal Pop and Groovy 70s (symbol language is the identity).

## Font recommendations (add to js/aesthetic-meta.js)

New library faces to add (verify css2 200): Special Elite (400) and Courier Prime (400;700) —
new class `typewriter` ("Typewriter"). Add `ital` only if Google serves it (Courier Prime does:
italic 400/700 — verify; if verifying is hard, skip ital).

| # | Aesthetic | Heading classes → picks | Body → picks | Mono / UI | Avoid | Pairings |
|---|-----------|------------------------|--------------|-----------|-------|----------|
| 21 | Blob Tracking | neo-grotesk → Inter Tight, Geist, Archivo | neo-grotesk → Inter, Geist | Geist Mono, JetBrains Mono, IBM Plex Mono | serif (all), rounded, groovy, deco | Inter Tight/Inter · Geist/Geist · Archivo/Inter |
| 22 | Xerox | condensed, heavy → Anton, Archivo Black, Bebas Neue | typewriter, grotesk → Courier Prime, Special Elite, Work Sans | Courier Prime | rounded, soft-serif, deco, geometric | Anton/Courier Prime · Archivo Black/Work Sans · Bebas Neue/Special Elite |
| 23 | Micrographics | neo-grotesk, heavy → Inter Tight, Archivo Black, Geist | neo-grotesk → Inter, IBM Plex Sans | Geist Mono, Azeret Mono, IBM Plex Mono | serif (all), groovy, rounded, deco | Inter Tight/Inter · Archivo Black/IBM Plex Sans · Geist/Geist |
| 24 | Mixed Type | soft-serif, didone, grotesk → Instrument Serif, Playfair Display, Bricolage Grotesque, Fraunces | neo-grotesk → Inter, Instrument Sans | DM Mono, Space Mono | pixel, techno, groovy | Instrument Serif/Instrument Sans · Bricolage Grotesque/Inter · Playfair Display/Inter |
| 25 | ASCII Art | mono, pixel → JetBrains Mono, IBM Plex Mono, VT323, Space Mono | mono → IBM Plex Mono, JetBrains Mono | VT323 | serif (all), rounded, groovy, deco | JetBrains Mono/IBM Plex Mono · VT323/JetBrains Mono · Space Mono/IBM Plex Mono |
| 26 | Rebus | heavy, geometric, rounded → Bricolage Grotesque, Archivo Black, Lexend, Fredoka | geometric, neo-grotesk → DM Sans, Inter | — | didone, old-style, techno, pixel | Bricolage Grotesque/DM Sans · Archivo Black/Inter · Fredoka/DM Sans |

Families: Blob Tracking, ASCII Art → Digital; Xerox → Print & editorial; Micrographics, Mixed
Type, Rebus → Graphic.

## Quality bar (from the CAO reviews — apply from the start)
- Signature art demonstrates the aesthetic's real mechanism; no generic props/clip-art.
- Headline breaks: no stranded single word at 1280 with the first recommended pairing.
- Primary only for the one CTA / selected states; secondary for support; accent ≤5%.
- Type block restyled to belong to the aesthetic.
- 390px: full brand name, one-line tag, no overflow; light/dark + warm/green palettes hold.
- Set `--ab-type-pick-w`; use `data-hcls` for face-dependent tweaks; accent-ink for text.

## Process
| ID | Owner | Writes |
|----|-------|--------|
| P4 | Sonnet | js/data.js (2 fonts + typewriter class), js/aesthetic-meta.js (6 entries), index.html tags, 6 stub js/css with full metadata, tile motifs in css/aesthetic-board.css, harness still passes |
| B1 | Sonnet | blob-tracking, xerox, micrographics |
| B2 | Sonnet | mixed-type, ascii-art, rebus |
| CAO-3 | Opus CAO | review of 21–26 (+ compare-all sanity across 26) → docs/cao-review.md "Round 4" |
| Y | Sonnet ×2 | CAO fixes; coordinator accepts; Mac build |
