# Aesthetics refinement — round 2

The ten categories stay. The user's verdict: "good, but each feels ever so slightly off". This round
calibrates every board against real, high-quality examples. Coordinator review screenshots of the
current state: scratchpad `r1/before-<key>.png` (warm palette #E4572E / #17BEBB / #FFC914 /
#2E282A / #F6F5F1, Inter + Literata).

## What is off across all ten (framework problems)

1. **One skeleton, ten skins.** Every board has the same split hero, the same row of five equal
   swatches, the same 2-column 01/02 block and the same list. Real design languages compose
   differently: Linear centres a statement over a product UI; Bauhaus posters crop giant type
   off the edge; Liquid Glass floats controls over a vivid scene. Same layout + recolor = template.
2. **Wrong typeface on UI.** The brand body font (often a serif such as Literata) is used for
   every label, tab, button and table cell. Brutalist, Aurora, Glass, Retro and Pop UIs use a
   grotesk or mono for interface text. The body serif should be for reading copy only.
3. **The low-contrast accent band.** A flat accent rectangle behind the headline word looks cheap
   in soft or luminous aesthetics. It is idiomatic only in Raw Brutalist, Neo-Brutal Pop and Bauhaus.
4. **Abstract material row.** "Three circles" (Flat/Raised/Recessed) only makes sense in Soft Form.
   Elsewhere it reads as filler (three identical teal balls in Clay, three empty boxes in Aurora).
   Show a real component (the CTA or a chip) in its three states instead.
5. **Display type too timid.** Headlines sit at ~56px with a large empty band above the kicker.
   Reference sites push display type to 72–120px with tight leading and fill the hero.
6. **Clip-art hero art.** The planet-with-ring, the blob plinth and the ring + circle + squircle are
   generic. Art should demonstrate the aesthetic's material on something meaningful.

## Framework changes (R1)

Additive; keep every existing class, token and hook working.

- `def.layout` (all optional, defaults = today's behavior):
  - `hero`: `'split'` (today) | `'centered'` (statement centred, art below, full width) |
    `'poster'` (headline spans full width at very large size, art overlaps/crops at an edge) |
    `'scene'` (art is a full-width framed scene panel and the headline sits on top of or beside it).
  - `palette`: `'swatches'` (today) | `'strips'` (full-width horizontal bands sized by coverage
    %, label inside each band) | `'chips'` (compact pills in one row, for dense aesthetics).
  - `sections`: `'two-col'` (today) | `'stacked'` | `'asym'` (≈ 7/5 split).
- `def.type` (optional):
  - `ui`: `'body'` | `'heading'` | `'sans'` | `'mono'` — the face for tabs, buttons, labels, list
    cells and field values. `'sans'` = whichever brand face is a sans/display/mono category
    (check FONTS category), else the heading face. `'mono'` = `ui-monospace, "SF Mono", Menlo, monospace`.
  - `label`: same options for the small caps section labels / captions.
  - `display`: scale multiplier for the headline (default 1). Base headline uses
    `clamp(44px, 7.2cqi, 104px)`-style container sizing so `display` scales it.
  - Expose as CSS vars `--ab-font-ui`, `--ab-font-label`, `--ab-display`.
  - Body serif remains for the hero sub-copy and card body copy only.
- **Accent text shading:** replace the default low-contrast band. Compute `t.accentInk` = the
  accent hue shaded (or tinted, in dark mode) until it reaches ≥ 3:1 on canvas (large-text AA),
  keeping hue and as much saturation as possible. Default `.ab-hl` uses `accentInk` as text color.
  Keep the band treatment available as an opt-in: `def.highlight = 'band' | 'ink' | 'custom'`
  (default `'ink'`). Raw Brutalist, Neo-Brutal Pop and Bauhaus Poster opt into `'band'`.
  The AI brief (js/ai-brief.js) must describe whichever treatment the aesthetic uses and list
  `--accent-ink` with its hex in the tokens table.
- **States row:** `def.labels.statesKind`: `'swatch'` (today's three samples) | `'button'`
  (renders the primary CTA three times in rest / hover / pressed using the aesthetic's own CSS
  via classes `.is-hover` / `.is-pressed`) | `'chip'`. Default `'swatch'`.
- A sub-copy line under the headline (the brand tagline is the headline; use a fixed neutral
  line "A design language for <Brand> — type, color and material in one place." in the body face,
  muted) so heroes have the hierarchy real sites have. Aesthetics may hide it.

## Per-aesthetic refinements

Reference notes are what the real examples showed. Everything not mentioned stays.

### 01 Soft Form — reference: the approved Soft Form board (`~/.claude/skills/soft-form-design/assets/approved-reference.html`)
- Render the approved reference side by side and match its proportions: larger, tighter headline
  (tracking −0.05em, weight 500), more breathing room in the palette row, flat swatches (only
  canvas gets a hairline outline; swatches are not raised).
- Highlight: `'ink'` (shaded accent text), like the reference's vermilion word.
- Art: the blob plinth reads as a cloud. Replace with a cleaner composition from the same
  materials: one large recessed circular well; a raised canvas disc sitting off-centre inside it;
  a primary semicircle; a slim glass bar lens crossing the semicircle and the well rim with the
  clipped refraction duplicate. Fewer, larger forms.
- UI type `'sans'`; labels `'sans'` uppercase tracked.
- Keep states as swatches (this is the one aesthetic where Flat/Raised/Recessed is the point).

### 02 Raw Brutalist — reference: brutalistwebsites.com, Swiss editorial brutalism
- Layout: hero `'poster'` — headline full width, enormous (display ≈ 1.5), cropping into the
  right edge; the cropped initial + primary block move under/behind the right end of the headline.
- Drop the barcode (gimmick). Keep one mono caption "FIG. 01".
- Palette `'strips'`. UI and labels `'mono'`. Highlight `'band'` (keep).
- States `'button'` (rest / hover / pressed on the real CTA).

### 03 Neo-Brutal Pop — reference: neobrutalism.dev, Gumroad
- Radius down to 6px controls / 10px cards (real neo-brutalism is near-square, not bubbly).
- Canvas: a confident colored field — secondary mixed ~22% into Light — with a 32px square line
  grid (ink at 7%) instead of dots.
- Hero `'centered'`: big bold statement centred, the highlight word in a color fill with a 2px
  ink outline, flanked by outlined star/flower stickers in accent and primary. One centred CTA
  with `4px 4px 0 ink`.
- Headline weight 800, tracking −0.02em. UI `'sans'` weight 700.
- States `'button'` (rest / lift / squish on the real CTA). Highlight `'band'` (color fill + ink outline).

### 04 Retro-Futurist — reference: hardware control-panel UIs (knobs, LCDs, LED meters)
- Strong already. Refine: replace the synthwave sun with a hardware module: a bezel containing a
  round analog dial (primary needle, tick marks), a small amber LCD readout in secondary showing
  the brand initials + "88.8", and a vertical row of 5 LED level bars (accent at the top).
  Keep the scanline screen for the field and list.
- UI `'mono'`, labels `'mono'`. Highlight `'custom'` (keep lamp glow, but use `accentInk` when
  the canvas is light).

### 05 Liquid Glass — reference: Apple Liquid Glass (iOS/macOS 26), Dribbble liquid-glass shots
- The current pastel blob wallpaper reads as 2021 glassmorphism. Real Liquid Glass is *clear*
  glass with bright specular rims floating over vivid content.
- Hero `'scene'`: a full-width rounded scene panel filled with a vivid, saturated mesh of the
  brand colors over a dark base (radial gradients at full saturation — this is the "content").
  Over it float glass controls: a capsule tab bar (3 icons + labels, selected tab is a brighter
  lens), a round glass play/arrow button, and a small glass card with the headline-highlight word.
  Glass fill ≤ 12% white, `backdrop-filter: blur(14px) saturate(160%)`, rim: inset 1px white 60%
  top-left and inset −1px white 25% bottom-right, plus a 0.5px outer dark hairline for separation.
  Lensing: content near the glass edges magnified (clipped duplicate scaled 1.08 inside a ring mask).
- The rest of the board sits on a neutral canvas (no pastel blobs); panels are near-opaque
  "regular material" with glass reserved for floating controls (segmented, toggle knob, CTA).
- Headline: weight 600, tracking −0.03em. UI `'sans'`.
- States `'chip'` → Clear / Tinted / Frosted shown on a capsule over a vivid mini scene strip.

### 06 Holo Iridescent — reference: high-end iridescent branding (dark canvases, thin chromatic light)
- Recommended mode → `'dark'`. Canvas = Dark pushed to ≤ 10% lightness.
- Art: replace the planet with a thin-film soap bubble / light ribbon: a large circle whose fill is
  transparent in the centre with a thin iridescent rim (conic spectrum, blurred 1–2px, brighter on
  the top-left), an inner secondary reflection arc, and one flowing ribbon (SVG path stroked with a
  spectral gradient, 1.5–3px, with a soft glow). Spectrum stays decorative.
- Cards: near-black panels with a 1px iridescent hairline edge (conic), no pastel wash.
- Headline: ink, weight 500; highlight word = spectral gradient text that starts at `accentInk`.
- Light mode stays pearl but quieter (wash alpha back to ~15%).
- CTA: solid primary with a thin spectral top edge, no wide foil band across the label.

### 07 Aurora Noir — reference: linear.app (2026), Vercel, Raycast
- Restraint. Hero `'centered'`-left: big solid headline in ink (no gradient fill), weight 510,
  tracking −0.045em; followed by a two-tone statement sentence ("<Brand> is … " first clause ink,
  rest muted) — the signature Linear device.
- Art: replace rings/nodes with a product-UI fragment: a dark app window (sidebar with 4 items,
  an issue header with mono ID, 3 property rows) framed by a 1px hairline, sitting on a very
  faint aurora (primary/secondary at ≤ 18% alpha, large blur) behind the window only.
- Primary CTA = ink-filled (near-white) pill with canvas text; primary color shows in the selected
  states, focus ring, progress bars and status dot. (Linear's CTA is white; brand primary is
  reserved for state.) Update roles override text accordingly.
- Mono "FIG 0.1 / FIG 0.2" captions above sections. UI `'sans'`, labels `'mono'`.
- States `'button'` (Rest / Hover / Focus on a ghost button).

### 08 Bauhaus Poster — reference: Bauhaus exhibition posters (Schmidt, Bayer), Dribbble Bauhaus sites
- Shapes are flat fills with **no ink outlines** (remove strokes on art shapes). Replace the
  target ring with a tiled 3×3 grid of quarter-circles / semicircles / squares in primary,
  secondary, accent, ink, rotated at 0/90/180/270 — the classic Bauhaus pattern tile.
- Hero `'poster'`: headline huge (display ≈ 1.45), uppercase, tight, can break per word; one
  word may run vertical. Keep the vertical kicker.
- Palette `'strips'`. UI `'sans'` uppercase. Highlight `'band'` (flat accent plane, no outline).
- States `'button'`.

### 09 Clay — reference: Dribbble claymorphism (white cards, clay objects, tonal ramps, colored glow shadows)
- Panels become near-white (canvas lightened) cards with a soft colored shadow; the clay
  formula moves to objects: CTA, chips, toggle knob, avatars, segmented selection, art.
- Use a tonal ramp of primary (lighter/darker steps) for objects rather than every brand hue at
  once; secondary appears in chips and one art object; accent once.
- Art: keep sphere + torus + capsule but add a clay "app icon" tile (rounded square, primary,
  brand initial embossed) as the focal object; objects slightly overlap with contact shadows.
- States `'button'` (Rest / Hover / Pressed on the clay CTA). Fix the beige card (remove).

### 10 Riso Print — reference: Tubik "Five small rituals", editorial riso sites
- Headline: **single crisp ink, no misregistered text-shadow** (it reads as blur). Condensed
  feel: weight 800, tracking −0.03em, uppercase optional; set in primary ink.
- Misregistration and grain live on art, cards and swatches only.
- Art: a row of 3 riso "cards" (rounded 6px) each a flat ink color (primary, secondary, accent)
  with a grainy halftone illustration shape (circle / arch / zigzag) printed in an overlapping
  second ink with multiply and 2px offset — like a riso zine spread.
- Accent hand-drawn circle around the highlight word stays (it's idiomatic).
- UI `'sans'`; labels `'mono'` uppercase small.

## Process

| ID | Owner | Depends | Writes |
|----|-------|---------|--------|
| R1 | Sonnet | — | js/aesthetic-board.js, css/aesthetic-board.css, js/ai-brief.js (accent-ink + highlight wording), aurora-noir + liquid-glass files, docs Board anatomy |
| R2 | Sonnet | R1 | soft-form, raw-brutalist, neo-brutal-pop, bauhaus-poster files |
| R3 | Sonnet | R1 | retro-futurist, holo-iridescent, clay, riso-print files |
| R4 | Coordinator | R2, R3 | side-by-side review vs r1/before shots, fixes round, Mac build |

Acceptance for every aesthetic: matches its refinement notes; visibly closer to its references;
still works in light + dark, warm + green palettes, 390px; no console errors; AI brief harness
(scratchpad t5/harness.js) still passes for all 10 × 2 modes.
