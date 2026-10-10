# Round 3 — ten more aesthetics, font recommendations, second refinement pass

Builds on docs/aesthetics-plan.md (contract + Board anatomy + Round 2 hooks) and
docs/aesthetics-refinement.md. Nothing in those contracts changes; everything here is additive.

## Outcomes

1. Ten new aesthetics (11–20), built to the same quality bar as the refined first ten.
2. Font recommendations for all twenty: font *classes* for heading, body and UI/mono, specific
   picks from the app's font library, what to avoid and why, plus a one-click "Use recommended
   fonts" that applies the first recommended pairing (undoable, respects the Typography lock).
3. A second refinement pass on the existing ten (coordinator critique in "Refinement pass 2").
4. The sidebar and Compare view stay usable at twenty: family filter chips, and Compare renders
   only while visible.

## Font classes (taxonomy)

Every entry in `FONTS` (js/data.js) gets a `cls` field — one primary class from this list:

| cls | Meaning | Library members (existing + new) |
|-----|---------|----------------------------------|
| `neo-grotesk` | Neutral, tight, Swiss-descended sans | Inter, Inter Tight*, Geist, Public Sans, Onest, Instrument Sans, Archivo, IBM Plex Sans |
| `grotesk` | Quirky grotesques with character | Space Grotesk, Bricolage Grotesque*, Syne, Work Sans, Karla |
| `geometric` | Circle/square construction | Poppins, Montserrat, Outfit, Sora, Urbanist, Jost, Josefin Sans, Red Hat Display, Lexend, Plus Jakarta Sans, Manrope, DM Sans |
| `humanist` | Calligraphic, warm sans | Lato, Nunito Sans, Figtree, Raleway |
| `rounded` | Soft terminals | Fredoka*, Baloo 2*, Rubik |
| `condensed` | Tall, narrow display | Bebas Neue, Anton, Oswald, Big Shoulders Display |
| `heavy` | Black-weight display grotesk | Archivo Black, Dela Gothic One |
| `wide` | Extended display | Unbounded, Michroma* |
| `techno` | Squared, sci-fi | Orbitron*, Chakra Petch*, Rajdhani* |
| `didone` | High-contrast vertical stress | Playfair Display, Bodoni Moda, Abril Fatface, DM Serif Display, Yeseva One |
| `old-style` | Garalde/Venetian text | EB Garamond, Cormorant Garamond, Crimson Pro, Libre Caslon Text, Spectral |
| `text-serif` | Transitional/modern text serif | Libre Baskerville, Source Serif 4, Merriweather, Lora, Newsreader, Literata, Domine |
| `soft-serif` | Display serif with soft/quirky shapes | Fraunces, Gloock, Instrument Serif |
| `deco` | Art Deco / inscriptional caps | Poiret One*, Limelight*, Italiana, Cinzel, Marcellus |
| `groovy` | 70s fat display | Shrikhand*, Bagel Fat One*, Righteous |
| `pixel` | Bitmap | Press Start 2P*, Silkscreen*, Pixelify Sans*, VT323* |
| `slab` | Slab serif | Roboto Slab, Zilla Slab, Arvo, Bitter, Alfa Slab One |
| `mono` | Monospace | JetBrains Mono, IBM Plex Mono, Space Mono, DM Mono, Fira Code, Geist Mono, Azeret Mono |

`*` = new Google Fonts to add to `FONTS` (verify each family + weights returns 200 from the css2
endpoint before adding — one bad entry blanks its whole chunk). Suggested weights: Inter Tight
400;500;600;700;800, Bricolage Grotesque 400;600;800, Fredoka 400;500;600;700, Baloo 2
400;600;800, Michroma 400, Orbitron 400;600;800, Chakra Petch 400;500;700, Rajdhani 400;600;700,
Poiret One 400, Limelight 400, Shrikhand 400, Bagel Fat One 400, Press Start 2P 400, Silkscreen
400;700, Pixelify Sans 400;600, VT323 400. Map their `category` to the app's existing groups
(pixel/techno/groovy/deco → 'display'; VT323 → 'mono').

## Font recommendations per aesthetic

Shape: `{ heading: {classes, picks}, body: {classes, picks}, mono?: {picks}, avoid: [classes],
why: '1 sentence', pairings: [[heading, body], …] }`. Picks are library names; first pairing is
what "Use recommended fonts" applies. Fit check on the board: ✓ if the brand's current face is in
a recommended class, "consider" otherwise, "avoid" if in an avoid class.

| # | Aesthetic | Heading classes → picks | Body classes → picks | Mono / UI | Avoid | Pairings (first = applied) |
|---|-----------|------------------------|----------------------|-----------|-------|------------------------------|
| 01 | Soft Form | neo-grotesk, geometric → Inter Tight, Instrument Sans, Manrope | neo-grotesk → Inter, Instrument Sans | — | didone, condensed, pixel, groovy | Inter Tight/Inter · Manrope/Inter · Instrument Sans/Instrument Sans |
| 02 | Raw Brutalist | heavy, neo-grotesk, condensed → Archivo Black, Inter Tight, Anton | neo-grotesk → Inter, Archivo, IBM Plex Sans | JetBrains Mono, IBM Plex Mono, Space Mono | soft-serif, rounded, deco, groovy | Archivo Black/Archivo · Inter Tight/Inter · Anton/IBM Plex Sans |
| 03 | Neo-Brutal Pop | grotesk, geometric, heavy → Space Grotesk, Bricolage Grotesque, Lexend | grotesk, geometric → Space Grotesk, DM Sans, Rubik | — | text-serif, old-style, deco, thin didone | Bricolage Grotesque/DM Sans · Space Grotesk/Space Grotesk · Lexend/Rubik |
| 04 | Retro-Futurist | wide, techno, condensed → Michroma, Orbitron, Unbounded, Big Shoulders Display | neo-grotesk → IBM Plex Sans, Inter | Space Mono, IBM Plex Mono, VT323 (readouts) | old-style, rounded, groovy | Michroma/IBM Plex Sans · Unbounded/Inter · Orbitron/IBM Plex Sans |
| 05 | Liquid Glass | neo-grotesk → Inter Tight, Geist, Onest | neo-grotesk → Inter, Geist | — | slab, didone, condensed, pixel | Inter Tight/Inter · Geist/Geist · Onest/Inter |
| 06 | Holo Iridescent | wide, soft-serif, geometric → Unbounded, Syne, Instrument Serif, Sora | neo-grotesk → Inter, Geist | — | slab, condensed, old-style | Syne/Inter · Instrument Serif/Geist · Unbounded/Inter |
| 07 | Aurora Noir | neo-grotesk → Inter Tight, Geist, Inter | neo-grotesk → Inter, Geist | Geist Mono, JetBrains Mono | soft-serif, rounded, groovy, deco | Inter Tight/Inter · Geist/Geist · Inter/Inter |
| 08 | Bauhaus Poster | geometric → Jost, Josefin Sans, Outfit, Urbanist | geometric, neo-grotesk → Jost, Work Sans | — | text-serif, old-style, techno, groovy | Jost/Jost · Outfit/Work Sans · Josefin Sans/Jost |
| 09 | Clay | rounded, geometric → Fredoka, Baloo 2, Lexend, Rubik | rounded, humanist → Rubik, Nunito Sans, Figtree | — | condensed, didone, mono, techno | Fredoka/Nunito Sans · Baloo 2/Rubik · Lexend/Figtree |
| 10 | Riso Print | condensed, grotesk, heavy → Big Shoulders Display, Bricolage Grotesque, Anton | grotesk, text-serif → Work Sans, Literata, Spectral | Space Mono, DM Mono | geometric light, techno, pixel | Big Shoulders Display/Work Sans · Bricolage Grotesque/Literata · Anton/Spectral |
| 11 | Editorial Serif | didone, soft-serif → Playfair Display, Bodoni Moda, Instrument Serif, Gloock | text-serif, old-style → Newsreader, Source Serif 4, Libre Caslon Text, EB Garamond | Inter (captions) | rounded, techno, pixel, groovy | Instrument Serif/Newsreader · Bodoni Moda/Source Serif 4 · Playfair Display/Libre Caslon Text |
| 12 | Neo Deco | deco, didone → Poiret One, Limelight, Italiana, Cinzel, Bodoni Moda | geometric (light) → Jost, Josefin Sans, Raleway | — | heavy, pixel, rounded, grotesk | Italiana/Jost · Limelight/Josefin Sans · Cinzel/Raleway |
| 13 | Y2K Chrome | wide, heavy → Unbounded, Syne, Dela Gothic One, Michroma | geometric → Sora, Outfit, Plus Jakarta Sans | — | old-style, slab, text-serif | Unbounded/Sora · Dela Gothic One/Outfit · Syne/Plus Jakarta Sans |
| 14 | Cyber HUD | techno, wide → Orbitron, Chakra Petch, Rajdhani, Michroma | techno, neo-grotesk → Rajdhani, Chakra Petch, IBM Plex Sans | JetBrains Mono, Space Mono | serif (all), rounded, groovy | Orbitron/Rajdhani · Chakra Petch/IBM Plex Sans · Michroma/Chakra Petch |
| 15 | Bento Grid | neo-grotesk, geometric → Inter Tight, Geist, Manrope, Plus Jakarta Sans | neo-grotesk → Inter, Geist | — | groovy, pixel, deco, condensed | Inter Tight/Inter · Manrope/Inter · Geist/Geist |
| 16 | Mesh Gradient | geometric, neo-grotesk → Sora, Plus Jakarta Sans, Inter Tight, Manrope | neo-grotesk → Inter, Public Sans | — | slab, condensed, pixel | Sora/Inter · Plus Jakarta Sans/Inter · Inter Tight/Public Sans |
| 17 | Industrial Device | grotesk, neo-grotesk → Space Grotesk, Inter, Archivo | neo-grotesk → Inter, IBM Plex Sans | Azeret Mono, IBM Plex Mono, Space Mono | serif (all), rounded, groovy | Space Grotesk/Inter · Archivo/IBM Plex Sans · Inter/Inter |
| 18 | Pixel Arcade | pixel → Press Start 2P, Silkscreen, Pixelify Sans | pixel, mono → VT323, Space Mono, JetBrains Mono | VT323 | serif (all), thin geometric, script | Silkscreen/VT323 · Press Start 2P/Space Mono · Pixelify Sans/JetBrains Mono |
| 19 | Groovy 70s | groovy, soft-serif → Shrikhand, Bagel Fat One, Righteous, Fraunces | humanist, soft-serif → Work Sans, Rubik, Lora | — | techno, mono, condensed, pixel | Shrikhand/Work Sans · Fraunces/Rubik · Bagel Fat One/Lora |
| 20 | Blueprint | neo-grotesk, condensed → Archivo, IBM Plex Sans, Big Shoulders Display | mono → IBM Plex Mono, JetBrains Mono | IBM Plex Mono, Space Mono | groovy, deco, soft-serif, rounded | IBM Plex Sans/IBM Plex Mono · Archivo/JetBrains Mono · Big Shoulders Display/IBM Plex Mono |

Each row also needs a one-sentence `why` (write it from the aesthetic's character, e.g. Aurora:
"Dev-tool interfaces read as precise because the face disappears; a neutral neo-grotesk at tight
tracking is the whole voice.").

## Families (sidebar filter)

| Family | Members |
|--------|---------|
| Tactile | Soft Form, Clay, Liquid Glass, Industrial Device |
| Graphic | Raw Brutalist, Neo-Brutal Pop, Bauhaus Poster, Groovy 70s |
| Digital | Aurora Noir, Cyber HUD, Bento Grid, Mesh Gradient, Pixel Arcade |
| Print & editorial | Riso Print, Editorial Serif, Blueprint |
| Luminous | Holo Iridescent, Y2K Chrome, Neo Deco, Retro-Futurist |

## The ten new aesthetics

Same board content as the first ten. Every one must use the Round 2 hooks deliberately (its own
hero/palette/sections layout, type roles, highlight, statesKind) so none reads as a reskin.

### 11 Editorial Serif — Literate · Confident · Spacious
Influences: Magazine editorial / Swiss columns / Book typography. Mode light. Slide shape
`minimal`. Family Print & editorial. Material label "Page", states Rest / Hover / Pressed (button).
Reference: NYT Magazine, Kinfolk, Apartamento web. Hero `poster`: the headline as a magazine
coverline — huge serif (display ≈ 1.5), tight leading 0.95, set in the heading face at weight 400
(serifs carry weight through contrast, not boldness); the highlight word in italic (font-style)
in accent-ink. Kicker as an issue line "ISSUE 01 — SPRING" in small caps sans. A thin double rule
(1px + 3px) under the masthead. Art = a tall "cover image" block: a duotone plate (primary over
canvas, multiply) with a large drop-cap initial and a caption "Fig. 1 — the brand at rest".
Palette `chips`. Sections `asym`. Body text in two columns with a drop cap on the card body.
UI `sans` small caps, labels `sans` uppercase tracked .12em. Hairline rules everywhere, no
shadows, radius 0–2px. List = table of contents with dotted leaders and page numbers.

### 12 Neo Deco — Gilded · Symmetric · Stepped
Influences: Art Deco / Chrysler Building / Modern luxury hospitality. Mode dark. Shape `classic`.
Family Luminous. Material label "Ornament", states Plain / Framed / Gilded (swatch).
Reference: The Great Gatsby (2013) titles, Soho House, modern deco hotel identities. Canvas =
Dark (deep, e.g. navy/ink); accent acts as the "metal" — thin 1px lines and ornaments, never
fills. Hero `centered` and symmetric: sunburst fan (SVG rays from bottom centre in accent at
30–60% alpha), stepped ziggurat frame around the headline (nested 1px rectangles with stepped
corners via clip-path or SVG), headline uppercase with wide tracking .12em at weight 400.
Double-rule borders (1px, gap 3px, 1px) on cards; corner ornaments (small diamonds). Primary CTA
= solid primary with a 1px accent inner frame. Segmented = framed tabs with a diamond marker on
the selected. Arches: card tops can be arched (border-radius 999px 999px 0 0) for the art window.
Palette `swatches` as arched tiles. List rows separated by ornamental rules (line–diamond–line).

### 13 Y2K Chrome — Liquid · Metallic · Hyper
Influences: Y2K web / Chrome type / Acid graphics. Mode dark. Shape `soft`. Family Luminous.
Material label "Chrome", states Brushed / Polished / Liquid (swatch).
Reference: 2000s chrome logos, Dazed Y2K revival, acid-graphics posters. Chrome = multi-stop
silver gradient (#fff → #9aa0a6 → #f4f4f4 → #5f646b → #e8e8e8) with a hard horizon, used on the
headline (background-clip text, heavy wide face) and on blobby pill buttons. Liquid chrome blob
art: 2–3 SVG metaballs (gooey filter: feGaussianBlur + feColorMatrix) filled with the chrome
gradient, reflecting primary/secondary tints at the edges; 4-point sparkles in accent. Canvas
near-black with a faint primary radial glow. Primary CTA = primary pill with a chrome 1.5px rim
and a glossy top highlight. Highlight `custom`: accent "acid" fill behind word with chrome text.
Palette `chips` as chrome-rimmed pills. Distinct from Holo (no thin-film/pastel; this is heavy,
metallic, saturated) and from Liquid Glass (opaque metal, not clear glass).

### 14 Cyber HUD — Angular · Neon · Live
Influences: Sci-fi HUD / Cyberpunk UI / Esports overlays. Mode dark. Shape `minimal`. Family
Digital. Material label "Interface", states Idle / Target / Locked (button).
Reference: Cyberpunk 2077 UI, Destiny/Apex HUDs, F1 TV graphics. Cut-corner panels via
clip-path (8–14px chamfers on two opposite corners), 1px neon borders in primary with a soft glow
(drop-shadow, small), corner brackets ⌜ ⌝ on focus. Canvas near-black with a faint hex or 24px
grid and a diagonal scanline sweep (static). Headline uppercase, techno/wide face, with a 2px
chromatic split (text-shadow primary −2px, secondary +2px) only on the highlight word (`custom`).
Data everywhere: tiny mono readouts ("SYNC 98.2%", coordinates), a radial gauge, segmented bars.
Primary CTA = chamfered primary fill with mono label and a ▶ glyph. Segmented = chamfered tabs.
Toggle = rectangular with a sliding block and ON/OFF readout. Hero `split` but the art is a
targeting reticle over a wireframe sphere/grid with lock-on brackets. Distinct from Retro-Futurist
(warm analog bezels) and Aurora (restrained): this is loud, angular and neon.

### 15 Bento Grid — Modular · Clear · Product-proud
Influences: Apple feature grids / Bento layouts / Product marketing. Mode light. Shape `refined`.
Family Digital. Material label "Tiles", states Rest / Hover / Pressed (button).
Reference: apple.com iPhone/Mac "highlights" grids, Linear/Vercel feature bentos. The whole board
is a bento: sections `stacked`, and each section is a grid of tiles with varied spans (2×2 hero
tile, 1×1 stats, 2×1 wide). Tiles: radius 28, fill = canvas lightened (white-ish) on a slightly
darker canvas, no borders, very soft shadow. Hero tile = big headline + a product-like art (a
phone/app-card mock built in CSS showing the brand's primary). Stat tiles: huge numbers
(72% / 45% / 10% from the list data) in heading face with small labels. One tile filled solid
primary (on-primary text), one secondary-tinted. Palette `chips` inside a tile. Highlight `ink`.

### 16 Mesh Gradient — Fluid · Optimistic · Precise
Influences: Stripe / Fintech marketing / Gradient mesh. Mode light. Shape `refined`. Family
Digital. Material label "Surfaces", states Rest / Hover / Pressed (button).
Reference: stripe.com hero (angled mesh), Ramp, Mercury. Hero `scene`-like but the scene is a
skewed band: a full-width mesh gradient (4–5 overlapping radial gradients of primary, secondary,
accent and a deepened primary, saturated) clipped to a −6° diagonal at its bottom edge. Headline
sits on the mesh in white or ink, whichever has contrast (compute), weight 600, tracking −0.035em.
Below, crisp white cards with layered shadows (0 1px 1px, 0 6px 18px −6px, 0 24px 48px −24px,
tinted with primary at low alpha), radius 12, 1px hairline. Thin gradient underline under section
labels. Primary CTA = solid pill with arrow that nudges on hover. Small "code"/API snippet tile in
mono as a realistic dense element. Distinct from Liquid Glass (no glass; opaque crisp cards).

### 17 Industrial Device — Precise · Physical · Calm
Influences: Teenage Engineering / Braun (Dieter Rams) / Lab equipment. Mode light. Shape
`minimal`. Family Tactile. Material label "Controls", states Up / Hover / Down (button).
Reference: teenage.engineering product pages (OP-1, TP-7), Braun ET66, Nothing Phone UI. Canvas
light warm-grey "aluminium" (Light mixed toward #d9d9d6). Device panels: radius 14, flat fill,
1px inset highlight top and darker bottom edge — machined, not puffy. Keys: square physical
buttons with a 2px darker bottom edge that compresses on press (translateY 2px). Accent = the one
orange-style function key and indicator LEDs; primary = active states. Dot-grid speaker/vent
texture (radial-gradient dots) as decoration. Labels tiny mono uppercase with numbered callouts
(① ② ③) and thin leader lines. Hero `split`: art = a device face — a round knob with knurling
(repeating-conic-gradient), a 4×4 key grid with one accent key, a small OLED strip (black with
primary pixels) showing the brand name, a speaker grille. Highlight `ink`.

### 18 Pixel Arcade — Playful · Crunchy · Nostalgic
Influences: 8-bit/16-bit games / Pixel art / Indie game UI. Mode dark. Shape `minimal`. Family
Digital. Material label "Sprites", states Idle / Hover / Press (button).
Reference: Celeste and Stardew UI, PICO-8, pixel-art itch.io pages. Everything on a 4px grid.
Borders are stepped pixel borders (box-shadow stacks forming notched corners, no border-radius),
`image-rendering: pixelated` for art. Art = a pixel sprite of the brand initial on a pixel
landscape (SVG with shape-rendering="crispEdges", rects only) in brand colors, plus a pixel coin
and a heart HUD. Dithered gradients (2×2 checker patterns) instead of smooth gradients. Headline
in the pixel heading face; if the brand heading isn't pixel, render the headline with
`-webkit-font-smoothing: none` and a hard 4px drop shadow in ink. CTA = pixel button with a 4px
bottom shadow that disappears on press, "▶ START". Progress = segmented pixel hearts/blocks.
Toggle = pixel switch. Highlight `custom` (word in accent with a 4px stepped ink shadow).

### 19 Groovy 70s — Warm · Wavy · Joyful
Influences: 1970s psychedelia / Supergraphics / Retro packaging. Mode light. Shape `soft`.
Family Graphic. Material label "Waves", states Rest / Hover / Pressed (button).
Reference: 70s supergraphic stripes (Braniff, Ettore Sottsass era), Shrikhand/Cooper-style
type, modern revivals (Mailchimp Fresh Books, Burger King 2021 rebrand). Canvas warm cream (Light
mixed toward #f3e6cf). Signature = concentric rounded stripe bands (rainbow-style arches) in
primary, secondary, accent and ink — the classic "groovy rainbow" built from brand colors (SVG
concentric arcs, 3–5 bands). Wavy dividers (SVG sine path) instead of straight rules. Headline
fat, soft display face, tight; the highlight word sits on a wavy underline in accent. Pills and
blobs, radius full; a sunburst behind the CTA. Hero `centered` with the rainbow arching over the
headline. Palette `strips` drawn as stacked stripe bands. Distinct from Neo-Brutal Pop (no
outlines/offset shadows; this is warm, curvy and flat).

### 20 Blueprint — Technical · Annotated · Exact
Influences: Architectural drawings / Engineering blueprints / Patent diagrams. Mode dark (blue).
Shape `minimal`. Family Print & editorial. Material label "Drawing", states Default / Hover /
Active (button). Reference: cyanotype blueprints, patent drawings, technical datasheets. Canvas =
primary deepened toward navy if primary is blue-ish; otherwise Dark tinted 20% toward primary —
the "blueprint" field; ink = near-white line color. 24px + 120px double grid (white 6% / 12%).
Everything is line work: 1px strokes, no fills except tiny primary/accent markers. Dimension lines
with arrowheads and measurements ("320 mm") around the art; leader-line callouts labelled
A/B/C; title block in the bottom-right like a drawing sheet (project, scale 1:1, sheet 01/01,
date). Art = an isometric/orthographic line drawing of the brand initial as an extruded object
with hidden lines dashed. CTA = outlined 1px ink with a filled primary? — use ink outline +
accent corner tick; primary used for the selected tab and the one filled CTA only. Highlight
`custom`: word boxed by a dimension bracket. UI `mono`, headings `sans` uppercase.

## Refinement pass 2 (existing ten)

Coordinator critique after round 2 (shots in scratchpad r1/r2-final-*, r3-*, r4-*):

- **Raw Brutalist**: the cropped "M" frame under the headline collides with the bottom rule and
  floats awkwardly. Integrate it: either move the initial into the right edge as a full-height
  cropped glyph behind the headline (ink at 6–8%, outline only), or drop it and let the primary
  block + "FIG. 01" stand. Sub-copy column is too narrow (wraps at ~45ch) — widen to ~60ch.
- **Riso Print**: the hand-drawn accent ring fills with a muddy yellow wash over orange type.
  Keep the ring as a stroke only (no fill), slightly rotated, drawn in accent ink; if accent is
  low contrast on paper, use accent-ink for the stroke.
- **Liquid Glass**: hero card reads grey over the dark scene. Tint the card material toward the
  canvas (warm) rather than neutral grey and raise its specular rim; keep contrast checks.
  The "Now playing / alive" card duplicates the highlight word — change its content to a
  realistic mini control (e.g. "Focus · 25:00" timer with a progress ring).
- **Neo-Brutal Pop**: the palette swatches are tilted at random angles that look accidental;
  use a consistent ±2° alternation. Hero sticker sizes: starburst too close to the headline at
  1280 — give 24px more clearance.
- **Soft Form**: list rows and the palette row look generic next to the materials above. Put the
  list inside a recessed well (same material vocabulary) and make the progress tracks recessed
  with a raised glossy fill.
- **Aurora Noir**: the selected segment uses a primary-tinted fill with a primary border that
  reads orange-on-brown; Linear uses a neutral lifted chip (white 8–10%) with ink text for the
  selected segment and reserves primary for the status/focus. Match that.
- **Clay**: the palette pills are the only clay objects without contact shadows; add them.
  The kicker "Soft and puffy" pill is secondary-filled — fine — but its text is too small (11px);
  bump to 12–13px.
- **Bauhaus Poster**: very strong. Only: the strips palette labels wrap to 3 lines on narrow
  strips ("SUPPORT · ≈10–15%, MORE IN ART"); shorten the coverage note in the strip and keep the
  long version in roles text.
- **Retro-Futurist, Holo Iridescent**: no structural changes. Check both with the green palette
  and with a serif heading font (e.g. Fraunces) and fix anything that breaks.
- **All ten**: after font recommendations land, screenshot each with its *first recommended
  pairing* applied — that is how the user will most often see it — and fix anything that looks
  off with the recommended faces (sizes, tracking, weights differ per face).

## Tasks

| ID | Owner | Depends | Writes |
|----|-------|---------|--------|
| F1 | Sonnet | — | js/data.js (cls + new fonts), new js/aesthetic-meta.js (family + fonts recs for all 20), js/aesthetic-board.js + css/aesthetic-board.css (type-rec block, fit check, apply button, family filter, lazy compare), index.html (meta script tag + 10 new aesthetic tags), js/app.js (apply-fonts handler only), js/ai-brief.js (font section), 10 new stub files js/aesthetics/<new>.js + css, README, docs Board anatomy |
| E1 | Sonnet | — (parallel with F1) | existing 10 aesthetics' js/css only (refinement pass 2, except the "recommended fonts" screenshot step, which runs after F1) |
| N1 | Sonnet | F1 | 11 Editorial Serif, 12 Neo Deco, 13 Y2K Chrome, 14 Cyber HUD, 15 Bento Grid |
| N2 | Sonnet | F1 | 16 Mesh Gradient, 17 Industrial Device, 18 Pixel Arcade, 19 Groovy 70s, 20 Blueprint |
| CAO-1 | Opus "Chief Aesthetic Officer" (read-only reviewer) | F1, E1, N1, N2 | review of all 20 boards: per-aesthetic verdict + ranked, concrete fix specs → docs/cao-review.md |
| X1, X2 | Sonnet | CAO-1 | implement CAO fixes, split 10/10 by file ownership |
| CAO-2 | Opus CAO | X1, X2 | re-review; sign-off or a final short fix list (one more X round max) |
| C  | Coordinator | all | acceptance, Mac build, commit |

### Chief Aesthetic Officer brief
An expert across aesthetic movements, design languages and brand systems. Judges each board as a
brand director would: does it read as a credible, current, high-end expression of its style
(compared with the best real-world references), is it distinct from the other nineteen, does the
type, color-role discipline, material, composition, spacing and detail hold up in light/dark,
two palettes, recommended fonts and 390px. Produces concrete, implementable fixes (values,
components, compositions), not adjectives. Reviews rendered screenshots, never code alone.

New keys: editorial-serif, neo-deco, y2k-chrome, cyber-hud, bento-grid, mesh-gradient,
industrial-device, pixel-arcade, groovy-70s, blueprint.
