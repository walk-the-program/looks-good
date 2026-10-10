# CAO review — design language boards, round 1

Reviewer: Chief Aesthetic Officer (read-only). Evidence: scratchpad `cao/v1-<key>-A..D.png` and
`cao/sheet-v1-<key>.png` (A = recommended mode, warm palette, first recommended pairing, 1280;
B = opposite mode; C = green palette; D = 390px). Every finding below was seen in a render; code was
read only to name selectors.

## Summary

The set is good and much of it would hold up in a pitch. Six boards are ready now: Aurora Noir,
Retro-Futurist, Cyber HUD, Soft Form, Clay and Industrial Device. The rest fail in a few repeated
ways, not on twenty separate problems. The biggest single issue is technical, not stylistic: the
accent shading turns every yellow accent olive on light canvases. The weakest boards (Bento, Liquid
Glass, Holo) each have one part built on the wrong idea. The rest of each of those boards is sound.

### Cross-cutting problems (fix these first)

1. **Olive accent text on light canvases.** `abAccentInk` darkens the accent at constant hue. A
   yellow (#FFC914, hue 47) darkened to 3:1 becomes khaki/olive (#A07D00-ish). Seen in Soft Form B,
   Liquid Glass A, Editorial A, Bento A, Industrial A, Retro B, Aurora B, Riso ring. Olive looks like
   a printing error. Fix F1.
2. **The Type block is the most template-like part of every board.** It has the same neutral
   layout on twenty boards. The "✓ Fits" pill uses `pri-tint` with a primary border, so primary
   becomes decoration (a role violation). The fit pill wraps onto its own line in 3-column layouts.
   Picks have no hierarchy. Pixel Arcade shows an almost empty third column. Fix F2–F4, plus
   per-aesthetic restyles for the boards where the gap is worst (Pop, Raw).
3. **390px header and list breakage.** The brand name gets ellipsized ("MA…" in Cyber HUD,
   "Marigold St…" in Raw, Pop, Retro, Y2K, Mesh, Pixel, Blueprint and Bento). Tag pills wrap to two
   lines (Clay, Mesh, Pop, Groovy). Section descriptors wrap right-aligned. List names truncate
   ("Spring campai…"). Fix F5–F7.
4. **Clip-art art tropes and pair overlap.** Holo and Y2K both draw a planet with an orbit ring.
   Editorial's "duotone cover" is a stock sunset-and-hills vector. Pixel Arcade's "?" blocks quote
   Super Mario. Liquid Glass fills its scene with stock 3D primitives (sphere, torus, capsule). Raw
   Brutalist and Bauhaus Poster share a silhouette: an uppercase stacked headline, a yellow band on
   the last word, and a strips palette. Fixed per aesthetic below.
5. **Headline rag.** Split and centered heroes strand one word on a line: "should" alone in Pop and
   Industrial, "alive" alone in Mesh, and one word per line in Y2K. `text-wrap: balance` is already
   on; the cause is column width versus the face's set width. Fixed per aesthetic with column or
   display changes, and each fix names the target break.

### Ranking (best → worst)

| # | Aesthetic | Verdict | One line |
|---|-----------|---------|----------|
| 1 | Aurora Noir | Ship | Genuinely Linear-grade: product-window art, two-tone statement, white CTA. Only accent dots to trim. |
| 2 | Retro-Futurist | Ship | Credible hardware module, chrome horizon type, lamps and telemetry; an unlit-segment LCD would finish it. |
| 3 | Cyber HUD | Ship | Loud, angular, data-dense and distinct; one duplicated label. |
| 4 | Soft Form | Ship | Materials are right; word spacing and the floating state discs are the only weak spots. |
| 5 | Clay | Ship | Convincing clay objects and tonal ramp; the grey "scrollbar" rules cheapen it. |
| 6 | Industrial Device | Ship | Real Teenage Engineering energy; primary orange is overused and the headline strands "should". |
| 7 | Bauhaus Poster | Refine | Strongest graphic art in the set, but it reads as Raw Brutalist's twin. |
| 8 | Blueprint | Refine | Superb drawing and title block; a brown "blueprint" field and a misread dimension bracket. |
| 9 | Neo Deco | Refine | Elegant system; hairline deco face breaks at small sizes, and the hero frame is a flat box over the fan. |
| 10 | Riso Print | Refine | Charming and correct in detail; the headline is timid and the accent ring is muddy and cuts letters. |
| 11 | Editorial Serif | Refine | Masthead and TOC devices are excellent; the cover art is stock, the italic is fake and the headline is small. |
| 12 | Mesh Gradient | Refine | Stripe-accurate below the fold; the "mesh" is one orange wash and "alive" is orphaned. |
| 13 | Groovy 70s | Refine | Rainbow arch hero is a winner; rainbow wave dividers and accent-filled panels make it noisy. |
| 14 | Neo-Brutal Pop | Refine | Right materials; stickers float politely in margins, "should" is orphaned and the Type block is off-material. |
| 15 | Raw Brutalist | Refine | Great stack and band; a ghost initial plus an orphan primary block leave the hero half empty and break its own color rule. |
| 16 | Pixel Arcade | Refine | Good UI kit; a Mario-quoting scene, a muddy brown sky, and a light mode whose shadows smear. |
| 17 | Y2K Chrome | Refine | Chrome palette chips are lovely; the chrome type is grey mush, the art is a planet, and the headline is one word per line. |
| 18 | Holo Iridescent | Rework (art) | Clean thin-light system, but the hero is still "planet + orbit + moon" and the finishes look alike. |
| 19 | Liquid Glass | Rework (hero) | The board below is fine; the hero is 2021 glassmorphism (frosted text slab over 3D props), not Liquid Glass. |
| 20 | Bento Grid | Rework (section 01) | Hero and stat tiles are Apple-grade; section 01 explodes the card into a lone-sentence tile and a full-width orange banner. |

Counts: **Ship 6 · Refine 11 · Rework 3.**

---

## Framework fixes (X0)

Files: `js/aesthetic-board.js`, `css/aesthetic-board.css`, `js/aesthetic-meta.js`, `js/data.js`,
`js/app.js` (font URL only), `js/export-html.js` (font URL only).

**F1 — Hue-safe accent ink (`abAccentInk`, js/aesthetic-board.js:26).**
- WHAT: the darkening branch (light canvas, `darken === true`).
- CHANGE: when darkening and the accent hue is 38–80° (yellows and yellow-greens), rotate the hue
  toward 34° while darkening. At each lightness step use `h' = h - min(14, (h - 34) * 0.6)` and
  `s' = max(s, 85)`. Return the first `hslToHex(h', s', l)` that reaches ≥ 3:1. All other hues and
  the lightening branch (dark canvas) stay as they are. #FFC914 should land near an amber
  (#A86A00 ± a few), not #A07D00.
- WHY: darkened yellow at constant hue is olive. Printers and type designers shift yellow toward
  orange to keep it warm and "gold". The AI brief prints `--accent-ink`, so it updates
  automatically.
- CHECK: Soft Form B, Editorial A, Bento A, Industrial A and Liquid Glass A show an amber highlight
  word, not khaki.

**F2 — Neutral, stacked fit pill (css/aesthetic-board.css ~276–284).**
- CHANGE:
  - `.ab-fit[data-fit="match"] { background: var(--ab-sec-tint); border-color: transparent; color: var(--ab-ink); }`
  - `consider` stays as it is (transparent with a line border). `avoid` stays (ink fill).
  - `.ab-type-fit { display: grid; justify-items: start; gap: 6px; }` so the pill always sits under
    "Your heading: X" instead of wrapping raggedly.
- WHY: primary is reserved for the one action and selected states; "fits" is a tag, and tags are
  the secondary role. The stacked layout keeps the three columns aligned.
- Aesthetics that restyle `.ab-fit` themselves keep their look (scoped rules win).

**F3 — Pick hierarchy (css ~275).**
- CHANGE: `.ab-type-pick { font-weight: var(--ab-type-pick-w, 400); }` and
  `.ab-type-pick:first-child { font-size: clamp(22px, 3.1cqw, 32px); line-height: 1.12; margin-bottom: 4px; }`.
- Each aesthetic may set `--ab-type-pick-w` in `tokens()` to its headline weight. The worker sets
  it for Pop (700), Raw (400; Archivo Black is single-weight), Bauhaus (600), Groovy (400) and
  Bento (600).
- WHY: three same-size names read as a list, not a recommendation. The first pick is the one
  "Use recommended fonts" applies, so it should look like the lead.

**F4 — Drop a redundant mono column (`abTypeBlockHtml`).**
- CHANGE: push the mono column only when `f.mono` has at least one pick that is not in
  `f.body.picks`. Pixel Arcade (mono = VT323, already a body pick) then renders 2 columns.
- WHY: an almost empty third card looks broken.

**F5 — Narrow header (boardHtml line ~375 + css).**
- CHANGE markup: `<span class="ab-tag"><span class="ab-tag-pre">Design language / </span><b>${name}</b></span>`.
- CHANGE CSS in `@container ab (max-width: 600px)`:
  - `.ab-tag-pre { display: none; }`
  - `.ab-tag { max-width: none; white-space: nowrap; }`
  - `.ab-brand { flex: 1 1 auto; }`
  - Remove the 118px cap.
- Aesthetics that set `.ab-tag { max-width: … }` at narrow (Blueprint css:205 and any others found
  by grepping `ab-tag {` inside `600px` blocks) drop that cap. X1 and X2 own those lines in their
  files.
- WHY: the brand name is the one thing the header must never cut. "DESIGN LANGUAGE /" is
  redundant on a phone.
- CHECK: D shots show the full "Marigold Studio" on all 20 boards, with the tag on one line.

**F6 — Narrow label rows.**
- CHANGE in the 600px block: `.ab-labelrow { flex-wrap: wrap; row-gap: 4px; } .ab-labelrow > .ab-label:last-child:not(:first-child) { white-space: nowrap; }`.
- WHY: the descriptor drops cleanly under "The palette" instead of wrapping into a right-aligned
  two-line block (seen in Aurora, Retro, Editorial, Y2K and Holo at 390).

**F7 — Narrow list rows.**
- CHANGE in the 600px block:
  - `.ab-row { grid-template-columns: 2.6ch minmax(0, 1fr) 4.5ch; row-gap: 6px; }`
  - `.ab-row-name { white-space: normal; overflow: visible; grid-column: 2; grid-row: 1; }`
  - `.ab-row-status { grid-column: 2; grid-row: 2; justify-self: start; }`
  - `.ab-row-pct { grid-column: 3; grid-row: 1; }`
  - `.ab-av` keeps its column only where an aesthetic shows it; those aesthetics already override
    `.ab-row`.
- Aesthetics with their own narrow `.ab-row` grid (Blueprint, Pixel) keep theirs.
- WHY: "Spring campai…" in Pop, Clay, Y2K, Cyber and Groovy at 390.

**F9 — `data-hcls` / `data-bcls` on the root.**
- CHANGE: add `data-hcls="${state.headingFont.cls || ''}" data-bcls="${state.bodyFont.cls || ''}"`
  to `section.ab`.
- WHY: aesthetics can then adapt to the face without reading globals. Used by fix 12.1 (Neo Deco)
  and 18.3 (Pixel). The existing `--ab-tr` tokens can migrate later; that is not required now.

**F10 — True italics for faces that have them (js/data.js, js/app.js `googleFontChunkUrls`,
js/export-html.js).**
- CHANGE:
  - Add `ital: '400'` to these FONTS entries: Instrument Serif, Playfair Display, Bodoni Moda,
    Newsreader, Fraunces, Source Serif 4, Lora, Literata, EB Garamond, Cormorant Garamond, Libre
    Caslon Text, Spectral.
  - URL form for those entries: `family=Name:ital,wght@0,<w1>;0,<w2>;1,400`. Tuples must be sorted
    with all `0,` before `1,` and ascending weights. Entries without `ital` keep `:wght@…`.
  - Before committing, verify every chunk URL returns HTTP 200 with
    `curl -s -o /dev/null -w '%{http_code}' '<url>'`. Drop `ital` from any family that breaks its
    chunk.
  - Mirror the same rule in export-html.js so exported pages get the italic too.
- WHY: Editorial's highlight word, field value, list numbers and footer are synthesized obliques
  now (a slanted roman 'a'). A magazine board with a fake italic is the first thing a type person
  sees.

Not adopted: `tokens(t, ctx)` and an art-before-copy hero option. No fix below needs them, and
neither changes what is visible.

---

## Per aesthetic

### 01 Soft Form — Ship
**Benchmark:** the approved Soft Form reference board; the best Dribbble neumorphic dashboards;
Braun-calm product UI.
**Keep:** paired-shadow materials, the glass card with an iridescent rim, the glossy primary CTA,
the recessed list well with raised chips, and the recessed-well art with a glass bar lens.
**Fixes:**
1. WHAT `.ab[data-ae="soft-form"] .ab-headline`. CHANGE add `word-spacing: 0.06em;`. WHY at
   −0.05em tracking, "feel alive" reads as one word; tight display tracking needs its word spaces
   restored.
2. WHAT `.ab-states` (swatch kind) in soft-form.css. CHANGE wrap the three samples in one recessed
   tray. Put the tray on `.ab-states` itself: the same recess formula as the list well, radius 20,
   padding 18px 12px 14px, `justify-content: space-around`. Discs grow from ~52px to 56px. WHY
   three discs floating on the panel read as loading placeholders; in a tray they read as a
   material specimen.

### 02 Raw Brutalist — Refine
**Benchmark:** brutalistwebsites.com classics, Experimental Jetset posters, Bloomberg Businessweek
(Turley era) covers.
**Keep:** the one-word-per-line uppercase stack, the accent band bleeding off the right edge, the
strips palette, joined segments, the "ON" toggle, the bordered mono table, and the button states.
**Fixes:**
1. WHAT `art()` in raw-brutalist.js and the `.rba-*` CSS.
   - CHANGE: delete `.rba-ghost` (outline initial) and `.rba-block` (primary block).
   - Replace them with a mono spec index: `<dl class="rba-spec">`, four rows, each
     `<dt>` key + `<dd>` value:
     - `SUBJECT` → brand name, uppercase, ≤ 24 chars
     - `SYSTEM` → `5 COLORS / 2 FACES`
     - `SURFACE` → `LIGHT` or `DARK` (from `t.isDark`)
     - `FIG.` → `01`
   - Style:
     - `font: 600 10.5px var(--rb-mono)`, uppercase, letter-spacing .08em
     - `dt` in muted, `dd` in ink, right-aligned
     - 2px ink top rule, 1px ink rule under each row, row padding 6px 0
   - Position `.ab-art` (poster) at the top-right of the hero instead of the bottom:
     `top: <same as hero padding-top>; bottom: auto; right: 0;
     width: clamp(170px, 24cqw, 240px); aspect-ratio: auto;`. The headline stays above it
     (`z-index: 1`).
   - Remove the separate `.rba-cap` "FIG. 01" (now the last row).
   - At ≤600px keep the index under the subcopy, full width, max 280px.
   - WHY: the ghost M reads as a rendering artefact, and the primary block breaks the board's own
     rule ("primary = the one CTA"). Exposed metadata is the brutalist-web idiom, and it fills the
     empty right side of lines 1–4.
2. WHAT `type.display`. CHANGE 1.5 → 1.35. WHY the stack takes almost half the board's height; 10%
   less keeps the poster punch and gives the palette room.
3. WHAT `.ab[data-ae="raw-brutalist"] .ab-fit`.
   - CHANGE: radius 0; `border: 1.5px solid var(--ab-ink)`; `font: 700 10px var(--rb-mono)`;
     uppercase; letter-spacing .08em.
   - `[data-fit="match"]`: ink fill, canvas text.
   - WHY: the rounded pink pill is the only soft object on the board.
4. WHAT `tokens()`. CHANGE add `'--ab-type-pick-w': 400`. (F3.)

### 03 Neo-Brutal Pop — Refine
**Benchmark:** neobrutalism.dev, Gumroad (2023+), Figma Config 2023 site.
**Keep:** the secondary-tinted grid canvas, 2.5px outlines and offset shadows, the highlight pill,
list pills with initial avatars, hatched progress, and rest/lift/squish states.
**Fixes:**
1. WHAT the hero copy. CHANGE `.ab[data-ae="neo-brutal-pop"] .ab-hero-copy { max-width: 86cqw; }`
   and `type.display` 1.1 → 1.0. Target at 1280 with Bricolage Grotesque 800 is two lines,
   "Good design should / feel **alive**". If it still breaks in three, lower display in 0.02 steps
   down to 0.92. WHY "should" stranded alone breaks the rhythm of a centered statement.
2. WHAT the hero stickers (starburst with the initial, flower).
   - CHANGE starburst: width `clamp(84px, 15cqw, 140px)`; center it on the headline block's
     top-left corner so it overlaps the first letter's bounding box by ~20%; rotate −12°.
   - CHANGE flower: width `clamp(72px, 12cqw, 120px)`; center it on the highlight pill's
     bottom-right corner, overlapping ~15%; rotate 10°.
   - Both keep the 2.5px ink outline and `4px 4px 0` ink shadow. Stickers `z-index: 0`; headline
     `position: relative; z-index: 1` so letters cross over them.
   - At ≤600px: starburst 64px, flower 56px, same anchoring.
   - WHY: sticker culture overlaps and breaks the frame. Small stickers parked in the margins read
     as clip-art.
3. WHAT the Type block.
   - CHANGE `.ab[data-ae="neo-brutal-pop"] .ab-type-col`: paper/card fill (the same token as
     `.ab-card`), `border: 2.5px solid var(--ab-ink)`, radius 10, `box-shadow: 4px 4px 0 var(--ab-ink)`,
     padding 18px, no top rule.
   - Set `'--ab-type-pick-w': 700` in `tokens()`.
   - `.ab-type-apply`: the CTA's outline and shadow treatment, with a canvas fill (not primary).
   - WHY: it is the only section on the board without the sticker material.

### 04 Retro-Futurist — Ship
**Benchmark:** Apollo DSKY and mission-control consoles, 70s Braun/Sony hi-fi faces, Alien (1979)
Nostromo screens.
**Keep:** everything structural.
**Fixes:**
1. WHAT the LCD readout in `art()` ("M 88.8").
   - CHANGE: render a ghost "88.8" behind the live digits (same position and face) at 12% of the
     readout color: the unlit segments. Use the VT323 face when it is loaded, otherwise the
     current mono.
   - WHY: unlit segments are the detail that makes an LCD read as hardware rather than text.
2. WHAT light mode (B) headline.
   - CHANGE: when `!t.isDark`, the chrome text gradient becomes
     `ink 0% → mix(ink, canvas, .45) 54% → ink 55% → mix(ink, canvas, .25) 100%`.
   - WHY: the dark-mode chrome washes out to grey on cream.

### 05 Liquid Glass — Rework (hero)
**Benchmark:** Apple Liquid Glass (iOS 26 / macOS 26 tab bars, Control Center), the
apple.com/os hero, visionOS window chrome.
**Keep:** the neutral canvas below the hero, near-opaque regular-material panels, the capsule
segmented control, the glass-knob toggle, the Clear/Tinted/Frosted strip, the glass tab bar, and
the focus timer.
**Rework — the hero.** Liquid Glass is a control layer floating over vivid content. It is not a
frosted slab that holds the copy.
1. WHAT `.ab[data-ae="liquid-glass"] .ab-hero-copy` (scene).
   - CHANGE: remove the plate (`background: none; border: 0; box-shadow: none; backdrop-filter: none`).
   - Place the copy on the scene's dark lower-left: left inset 5cqw, bottom inset 5cqw,
     width ≤ 52cqw.
   - Colors: headline `#fff`; subcopy `rgba(255,255,255,.82)`; kicker `rgba(255,255,255,.7)`;
     `text-shadow: 0 1px 14px rgba(0,0,0,.28)`.
   - `.ab-hl`: the raw accent when its contrast with the scene base is ≥ 3:1, else
     `mix(accent, #fff, .35)`.
   - At ≤600px (copy below the scene, framework) restore ink/muted colors and the accent-ink
     highlight.
   - WHY: Apple never puts headline copy on a large frosted card. That is the 2021 glassmorphism
     look the plan said to leave behind.
2. WHAT scene content in `art()`.
   - CHANGE: delete the yellow sphere, the teal torus, the orange capsule and the small teal dot.
   - The content becomes:
     - **(a)** a full-bleed vivid field: base `mix(ink, #000, .5)` with three radial lights:
       primary `55% 70% at 18% 22%`, secondary `50% 65% at 86% 86%`, accent `34% 44% at 68% 24%`,
       each to transparent at 70%, blurred as now.
     - **(b)** one crisp element to refract: the brand initial in the heading face, white at 92%,
       font-size 30cqw, centered at 72% x / 52% y.
     - **(c)** one glass lens: a squircle (radius 28%), 30cqw wide, centered over the right half
       of the initial, built with `abLens` (scale 1.12, dx −6). Fill ≤ 10% white.
       `backdrop-filter: blur(2px) saturate(160%)` (light blur, so the bend is visible).
       Rim: `inset 1px 1px 0 rgba(255,255,255,.6), inset -1px -1px 0 rgba(255,255,255,.25)`.
       Outer `0 0 0 .5px rgba(0,0,0,.25)`. Specular: radial white 30% at the top-left 20%.
   - Keep the tab bar (top right). Keep the timer, but make it clear glass (white 10%, blur 14px,
     same rim) instead of the teal-tinted tile, with the progress ring in secondary.
   - WHY: lensing only reads when the glass bends something with edges. 3D primitives read as a
     stock render pack.
3. WHAT `.ab[data-ae="liquid-glass"] .ab-cta`.
   - CHANGE: drop the hard top-half gloss. Use
     `background: radial-gradient(120% 90% at 30% 0%, rgba(255,255,255,.30), transparent 55%), var(--ab-primary);`
     and
     `box-shadow: inset 0 1px 0 rgba(255,255,255,.5), inset 0 -1px 0 rgba(0,0,0,.10), 0 8px 20px -8px <primary at 55%>;`.
   - WHY: Apple's prominent buttons are tinted glass with a soft specular. A split gloss reads
     Web 2.0.
4. Keep the `prefers-reduced-transparency` fallback working for the lens and the timer (opaque
   `mix(canvas, ink, .1)`).

### 06 Holo Iridescent — Rework (art)
**Benchmark:** holographic foil packaging, Apple Vision Pro launch-film light ribbons, Stripe
Sessions thin-film gradients.
**Keep:** the near-black canvas, the 1px iridescent hairline on cards, the spectral gradient
highlight word, the chrome-pill segmented control, the spectral list dots, and the quiet pearl
light mode.
**Rework — the art.** It still reads as planet + orbit + moon, which the board's own `rules.dont`
forbids.
1. WHAT the bubble.
   - CHANGE: remove the uniform lilac interior glow.
   - Add a thin-film interior: a `conic-gradient` of the decorative spectrum (#ffd6f0, #c9f6ff,
     #e3d4ff, #d6ffe9, back to #ffd6f0) from 200deg, at 26% opacity. Mask it with
     `radial-gradient(circle, transparent 0 46%, #000 100%)` so the color gathers toward the rim.
     Apply `filter: blur(5px)` and rotate the layer −20°.
   - Keep the bright top-left rim, the specular arc and the secondary reflection arc.
   - Bubble diameter 34cqw, centered at 46% x.
2. WHAT the ribbon SVG (`.hoa-ribbon`).
   - CHANGE: replace the thin double-line orbit with a wide foil ribbon: a closed path forming a
     band 22–34 units tall that twists once (the band narrows to ~4 units at the twist) across the
     full 160-unit width.
   - Fill: a linearGradient of the same spectrum at 0.9 opacity, plus a 1px white 35% stroke along
     the upper edge only.
   - Split it into two segments: left segment drawn before the bubble (behind), right segment
     after it (in front). The band never runs tangent to the rim.
   - WHY: a band with a twist reads as foil. A line hugging a circle reads as an orbit.
3. WHAT the primary bead on the ribbon. CHANGE delete it. Update `roles.primary.use` to remove
   "one small bead on the art ribbon". WHY it reads as a satellite, and primary is never
   decoration.
4. WHAT palette swatches. CHANGE remove the white diagonal sheen streak. Give every `.ab-chip` the
   same 1px conic iridescent border as the cards (padding-box/border-box trick). WHY the streak is
   2008 gloss and smears the canvas swatch grey.
5. WHAT `.ab-state-chip[data-s]`.
   - CHANGE Matte (0): `mix(canvas, #fff, .08)`, no border.
   - CHANGE Pearl (1): `linear-gradient(135deg, #fff, #f1e9ff 40%, #e6fbff 70%, #fff)`, ink #1a1a1f.
   - CHANGE Foil (2): full-strength `conic-gradient` spectrum fill, text #111,
     `inset 0 0 0 1px rgba(255,255,255,.4)`.
   - WHY: the three finishes must look different. Foil is currently an outline.

### 07 Aurora Noir — Ship
**Benchmark:** linear.app, vercel.com, raycast.com.
**Keep:** all of it.
**Fixes:**
1. WHAT accent dots.
   - CHANGE: the dot before the header tag → `var(--ab-muted)`. Footer `.ab-dot` → `var(--ab-muted)`.
   - Accent stays on the headline word, the NEW badge and the focus-mode status dot only.
   - WHY: five accent marks break "≤3% one spark". Linear spends its color once.

### 08 Bauhaus Poster — Refine
**Benchmark:** Herbert Bayer's universal alphabet and 1923 exhibition material, the Joost Schmidt
1923 poster, the Bauhaus 100 (2019) identity.
**Keep:** the 3×3 tile art cropping off the edge, the vertical kicker with rule, the circle-arrow
CTA, big-numeral list rows, and rect-track/circle-knob toggle.
**Fixes:**
1. WHAT `.ab[data-ae="bauhaus-poster"] .ab-headline`.
   - CHANGE: `text-transform: lowercase;` weight 600, letter-spacing −0.02em, line-height .9.
     Display stays 1.4.
   - Card title and list names stay uppercase.
   - WHY: Bayer's universal alphabet is lowercase. It is historically exact, and it separates this
     board from Raw Brutalist's uppercase stack at thumbnail size.
2. WHAT highlight.
   - CHANGE `highlight: 'custom'`, plus
     `.ab[data-ae="bauhaus-poster"] .ab-hl { background: linear-gradient(to top, var(--ab-accent) 0 46%, transparent 46%); color: var(--ab-ink); padding: 0 .04em; }`.
     Mirror it for `[data-accent-text="low"]`.
   - Add `highlightNote: 'The highlight word sits on a flat accent plane covering its lower half; no outline, no full band.'`
   - WHY: a printed half-plane is constructivist. A full-height band is the brutalist highlighter.
3. WHAT palette.
   - CHANGE: `layout.palette: 'swatches'`. Shape `.ab-chip` by role inside a 1:1 box,
     max 96px, flat fill, no shadow:
     - `canvas`: square, 2px ink border
     - `ink`: circle
     - `primary`: circle
     - `secondary`: quarter circle, `border-radius: 100% 0 0 0`
     - `accent`: semicircle, height 50%, aligned bottom, `border-radius: 999px 999px 0 0`
   - Labels below in uppercase sans.
   - At ≤600px use the framework row layout with a 56px shape.
   - Keep the short coverage text from pass 2.
   - WHY: Raw Brutalist owns strips. Geometric primitives as swatches are the Bauhaus vocabulary.
4. WHAT `tokens()`. CHANGE add `'--ab-type-pick-w': 600`.

### 09 Clay — Ship
**Benchmark:** Dribbble claymorphism, Spline 3D landing pages, Headspace's soft 3D.
**Keep:** clay objects with colored shadows, the icon-tile art, the tonal primary ramp, clay
palette pills with contact shadows, and the clay states.
**Fixes:**
1. WHAT `.ab[data-ae="clay"] .ab-rule`. CHANGE `height: 0; background: none; margin: 10px 0;` (space
   only). WHY the 4px grey recessed bars read as scrollbars or empty progress tracks. Claymorphism
   separates with space and soft cards, not rules.

### 10 Riso Print — Refine
**Benchmark:** Hato Press and Colorama riso zines, Tubik riso spreads.
**Keep:** paper grain, halftone swatches, the three riso cards with overprinted shapes, misprinted
CTA, dashed rules, and the mono stamps.
**Fixes:**
1. WHAT headline scale.
   - CHANGE: `type.display` 1.04 → 1.5. `.ab[data-ae="riso-print"] .ab-headline { line-height: .88; }`.
   - Hero columns `1.15fr 1fr`. Target with Big Shoulders Display: three lines
     ("GOOD DESIGN / SHOULD FEEL / ALIVE") at ~100–115px.
   - WHY: riso posters run condensed type huge. At ~60px it reads like a caption.
2. WHAT the hand-drawn ring around `.ab-hl`.
   - CHANGE: stroke = raw `--ab-accent` (not accent-ink), width 3.5px, `mix-blend-mode: multiply`.
   - The ellipse extends 0.18em beyond the word on all four sides so it never crosses a letter;
     rotate −4°.
   - Add a second pass: the same ellipse rotated −1°, translated 2px 1px, at 60% opacity.
   - WHY: the olive single stroke reads muddy and cuts the "E". Fluoro ink multiplied over paper is
     the riso look.

### 11 Editorial Serif — Refine
**Benchmark:** NYT Magazine, Kinfolk, Apartamento, The Gentlewoman.
**Keep:** the centered serif masthead, the 1px + 3px double rule, the issue line, palette chips,
the TOC-style Type block with leaders and page numbers, the underline tabs, the TOC list, and the
italic footer.
**Fixes:**
1. WHAT italics (needs F10). CHANGE nothing in CSS beyond `font-style: italic` (already present).
   Verify the highlight word, field value, list numbers and footer render the true italic (single-
   storey "a" in Instrument Serif Italic). WHY a fake oblique on an editorial board gives the game
   away.
2. WHAT cover art (`art()`): **rework.**
   - Remove the sunset hills and the moon.
   - New plate: fill `mix(primary, ink, .35)` with feTurbulence grain at 5% (multiply).
   - The brand initial in the heading face, canvas color, font-size 150% of plate height,
     positioned `left: -8%; bottom: -24%` so it crops off the bottom and left edges.
   - Bottom-left inside the plate:
     - coverline "The design issue": heading face, italic, 22px, canvas color
     - under it, "{Brand} · Spring": 9px sans, uppercase, tracking .2em, canvas at 80%
   - Keep "NO. 01" at the top left and the "Fig. 1 — the brand at rest" caption below the plate.
   - WHY: magazine covers are type and photography. A vector sunset is stock clip-art. A cropped
     giant serif initial on a dark duotone plate is Kinfolk/Gentlewoman language.
3. WHAT headline size.
   - CHANGE: `type.display` 1 → 1.22 and `.ab[data-ae="editorial-serif"] .ab-hero-copy { max-width: 64cqw; }`.
   - Verify there is no overlap with the cover plate at 1280 and 1440 boards; reduce display in
     0.02 steps if it touches.
   - WHY: a coverline should dominate. At ~90px next to the plate it is balanced, not confident.

### 12 Neo Deco — Refine
**Benchmark:** The Great Gatsby (2013) title design, the Chrysler Building crown, Rockefeller
Center signage.
**Keep:** the centered monogram masthead, the outer double frame, arch palette tiles, the framed
Type cards with corner diamonds, the diamond-knob toggle, roman-numeral list with diamond progress,
and the CTA's gilt inner frame.
**Fixes:**
1. WHAT small text in the heading face.
   - CHANGE: `.ab[data-ae="neo-deco"] .ab-row-name { font-family: var(--ab-font-b); font-weight: 500; font-size: 12.5px; letter-spacing: .18em; }`
   - `.ab[data-ae="neo-deco"] .ab-card-title { font-size: clamp(24px, 2.6cqw, 28px); }`
   - Optionally, when `[data-hcls="deco"]`, set `.ab-card-title` in the body face at weight 500
     (F9).
   - WHY: Italiana and Poiret One hairlines break apart below ~20px ("LAUNCH SITE" reads "I AUNCH").
2. WHAT the hero frame.
   - CHANGE: `--ab-veil` → `alpha(canvas, .80)` so the fan shows faintly through the card.
   - Enlarge the stepped corners in `.ab-hero-copy::before`'s clip-path: steps of 10px and 20px
     instead of 6/12. Match the `border-image` slice.
   - Remove the five small triangle markers on the fan's baseline in `art()`.
   - WHY: an opaque box laid on the sunburst reads as a dialog. Readable stepped corners give the
     ziggurat silhouette. The triangles look like stray warning cones.

### 13 Y2K Chrome — Refine
**Benchmark:** Dazed Y2K-revival covers, early-2000s chrome logotypes (Nokia/Sony Ericsson era),
acid-graphics posters.
**Keep:** chrome-rimmed palette chips with metal orbs, the chrome segmented knob and toggle,
brushed/polished/liquid spheres, the acid highlight pill, and the sparkles.
**Fixes:**
1. WHAT the headline chrome gradient (keep the existing per-line mechanism).
   - CHANGE stops:
     `#ffffff 0%, #dfe9f7 22%, #8e9aab 46%, #1b1e24 50%, #4a505b 53%, #c9ced6 72%, #ffffff 88%, #aab2bd 100%`
   - Add `-webkit-text-stroke: .6px rgba(255,255,255,.55);` and
     `filter: drop-shadow(0 2px 0 rgba(0,0,0,.55)) drop-shadow(0 0 22px <primary at 35%>);`.
   - WHY: the current gradient is mid-grey on near-black. Real chrome type is bright, with a hard
     dark horizon and a sky-tinted top.
2. WHAT hero columns.
   - CHANGE: `.ab[data-ae="y2k-chrome"] .ab-hero { grid-template-columns: 1.45fr 1fr; }` and
     display .96 → .9.
   - Target: "Good design / should feel / **alive**" (3 lines), not 4 single words.
3. WHAT the orbit ring in `art()` (js:128, the rotated `<ellipse … stroke="url(#…r)">`).
   - CHANGE: delete it.
   - Add a second chrome metaball (~40% of the main blob's size) fused to the lower-left of the
     main blob through the existing gooey filter, so the art reads as a liquid-metal splash.
   - WHY: a planet ring is the same trope Holo is dropping; liquid metal is the Y2K signature.
4. WHAT chrome on small text.
   - CHANGE: `.ab-card-title` and `.ab-wordmark` get solid `var(--ab-ink)`, no gradient.
   - Chrome stays on the headline and the `.ab-mark` badge.
   - WHY: chrome at 18–20px is grey mush and fails contrast.

### 14 Cyber HUD — Ship
**Benchmark:** Cyberpunk 2077 UI, Destiny 2 HUD, F1 TV graphics.
**Keep:** all of it.
**Fixes:**
1. WHAT `labels.material`. CHANGE `'Interface'` → `'Systems'`. WHY 02 currently repeats 01's
   "Interface".

### 15 Bento Grid — Rework (section 01)
**Benchmark:** apple.com iPhone/Mac "highlights" bento, Linear and Vercel feature grids.
**Keep:** the hero tile with the cropped phone mock, palette and Type tiles, the 03 stat tiles
(the best stat treatment in the set), and the soft tile shadows.
**Rework — 01 Interface.** The card is split into a lone sentence in a tile, a full-width
segmented bar and a full-width orange banner. Bento tiles hold composed content; a banner is not a
button.
1. WHAT `.ab[data-ae="bento-grid"] .ab-card` (replaces the 6-column split, css ~131–150 and the
   narrow rules ~211–212).
   - CHANGE: `display: grid; grid-template-columns: minmax(0, 1fr) clamp(170px, 28cqw, 250px); grid-template-rows: auto auto 1fr; gap: var(--bn-gap);`.
   - Left tile = the card's own `::before` (grid-area 1 / 1 / 4 / 2, tile fill, radius 28, tile
     shadow, z-index 0).
   - `.ab-seg` (row 1, col 1): inline capsule, `justify-self: start`, margin 22px 22px 0, no
     full-width bar.
   - `.ab-card-title` (row 2, col 1): 32–40px, padding 0 22px.
   - `.ab-card-body` (row 3, col 1): muted, padding 6px 22px 22px, `align-self: end`.
   - Title and body lose their individual tile backgrounds.
   - `.ab-cta` (grid-area 1 / 2 / 4 / 3): the primary tile, square-ish (`min-height: 100%`),
     radius 28, padding 22px. Label at the bottom left, 22px weight 600, on-primary. Arrow circle at
     the top right, 40px, `on-primary` at 18%.
   - At ≤600px: one column, CTA tile below at aspect 2/1.
   - WHY: Apple's tile-as-button is a composed square, and the body copy belongs with its title.
2. WHAT the 02 tiles.
   - CHANGE: move the "Project name" label inside the field tile (absolute top-left 14px/18px,
     11px muted) with field top padding 30px.
   - Move `.ab-status` inside the toggle tile under "Focus mode" (11px muted).
   - WHY: labels floating between tiles break the "one tile, one idea" grid.
3. WHAT 03.
   - CHANGE: the 72% tile background `var(--ab-sec-tint)` (not pri-tint).
   - All three `.ab-row-bar i` use `var(--ab-secondary)`.
   - Add `'--ab-type-pick-w': 600` to `tokens()`.
   - WHY: the brief calls for one primary tile (now the CTA) and one secondary-tinted tile, and
     progress is a data series (secondary).

### 16 Mesh Gradient — Refine
**Benchmark:** stripe.com mesh hero (2020–2024), Ramp, Mercury.
**Keep:** the −6° diagonal cut, floating dashboard/code/payout cards, crisp layered-shadow cards,
gradient section underlines, gradient progress bars and avatars, and the pill CTA with arrow.
**Fixes:**
1. WHAT the mesh stack (css:25–29 and the `materials` "Mesh band" text).
   - CHANGE to (first = top):
     ```
     radial-gradient(48% 72% at 88% 78%, var(--ab-m-s), transparent 68%),
     radial-gradient(36% 58% at 76% 6%, var(--ab-m-a), transparent 66%),
     radial-gradient(44% 64% at 48% 34%, var(--ab-m-mid), transparent 70%),
     radial-gradient(64% 92% at 8% 12%, var(--ab-mesh-deep), transparent 72%),
     radial-gradient(70% 100% at 30% 112%, var(--ab-m-p), transparent 70%),
     var(--ab-mesh-deep)
     ```
   - Re-verify that the copy zone keeps `--ab-mesh-ink` ≥ 4.5:1 for the subcopy. If not, darken
     `--ab-mesh-zone` rather than shrinking the lobes.
   - WHY: Stripe's mesh shows several distinct color fields. This one is a single orange wash,
     with the secondary hidden behind the cards.
2. WHAT hero columns.
   - CHANGE: `.ab[data-ae="mesh-gradient"] .ab-hero { grid-template-columns: 1.2fr 1fr; }`,
     display .96 → .92.
   - Target: "Good design / should feel **alive**".

### 17 Industrial Device — Ship
**Benchmark:** teenage.engineering OP-1 field and TP-7, Braun ET66, Nothing Phone UI.
**Keep:** the device-face art with numbered callouts, machined panels, square keys with a bottom
edge, mono labels, the OLED strip, and the channel-strip list with the vent texture.
**Fixes:**
1. WHAT hero columns.
   - CHANGE: `.ab[data-ae="industrial-device"] .ab-hero { grid-template-columns: 1.15fr 1fr; }`,
     display .94 → .9.
   - Target: "Good design / should feel **alive**".
2. WHAT primary spread.
   - CHANGE: `.ab-row-bar` lit segments → `var(--ab-ink)` (unlit stays light).
   - `.ab[data-ae="industrial-device"] .ab-fit[data-fit="match"]` → `background: transparent; border: 1px solid var(--ab-ink); color: var(--ab-ink);`.
   - Primary stays on the CTA, the selected segment and key, the toggle and the knob pointer.
   - WHY: orange is currently in eight places. TE spends orange on one function.

### 18 Pixel Arcade — Refine
**Benchmark:** Celeste, Stardew Valley UI, PICO-8 carts, Shovel Knight.
**Keep:** stepped pixel borders, the dialog-box headline card, the HUD (hearts, score), START
buttons, block progress, the pixel switch, and the "LV.01" list.
**Fixes:**
1. WHAT the "?" blocks (`block()` in `art()`, glyph `'?'`).
   - CHANGE: draw the brand initial (from the existing glyph map) on the blocks. Fall back to a
     star glyph `'00100 00100 11111 01110 01010 10001 00000'` when the initial has no glyph.
   - Update `roles.accent.use` text from '"?" blocks' to 'item blocks'.
   - WHY: "?" blocks quote Super Mario directly. The board should feel like a game, not that game.
2. WHAT sky bands (js:120).
   - CHANGE: `sky = [mix(secondary, canvas, .22), mix(secondary, canvas, .34), mix(mix(secondary, primary, .5), canvas, .48), mix(primary, canvas, .62), mix(primary, canvas, .78)]`
     (top → horizon), with the same 2×2 dither joins.
   - WHY: primary sunk into near-black gives a muddy brown sky. Pixel palettes are saturated, and
     a cool-to-warm dusk makes the sprite pop.
3. WHAT light mode (B) shadows.
   - CHANGE: when `!isDark`, the headline's stepped shadow becomes 2px in `mix(ink, canvas, .7)`
     (not 4px ink).
   - `.ab-card-title` gets no shadow in light mode.
   - When `[data-hcls]` is not `pixel`, keep `-webkit-font-smoothing: none` off for the card
     title (F9).
   - WHY: in B the title reads doubled and blurred.

### 19 Groovy 70s — Refine
**Benchmark:** Burger King 2021 identity, Braniff/Alexander Girard supergraphics, 70s Shrikhand-
style packaging.
**Keep:** the rainbow-arch hero with the headline inside, the wavy accent underline, pill
palette strips, tinted Type cards, pill controls, and color-coded list rows.
**Fixes:**
1. WHAT `.ab[data-ae="groovy-70s"] .ab-rule` (css:20–22).
   - CHANGE: the wave mask filled with `alpha(ink, .28)`, a single color, at every section rule.
   - Only the rule directly under the header and `.ab-foot::before` keep a stripe: three stacked
     waves (primary, secondary, accent, each 3px, 3px apart).
   - Never a gradient running through all the hues.
   - WHY: the hue-interpolated wave creates muddy brown-green midpoints and repeats six times.
     Supergraphics use parallel solid bands.
2. WHAT the sunburst in the 01 card.
   - CHANGE: center it on `.ab-cta`, with radius ≤ 1.4 × half the CTA width.
     `mask-image: linear-gradient(to bottom, transparent 0, #000 45%)`, opacity .55, z-index below
     the CTA.
   - WHY: rays behind the title and body copy hurt legibility.
3. WHAT accent-tint fills.
   - CHANGE: `.ab-panel` (02), the body `.ab-type-col`, and list row 3 move from the accent tint to
     a kraft tone `mix('#e9d6ae', canvas, .35)`. Dark mode uses `mix('#5a4426', canvas, .45)`.
   - Pri-tint and sec-tint stay where they are.
   - WHY: accent as panel fill breaks "≤ 8% spark" and makes the board read yellow.

### 20 Blueprint — Refine
**Benchmark:** cyanotype architectural blueprints, US patent drawings, Dieter Rams-era technical
datasheets.
**Keep:** the extruded-initial isometric drawing with hidden lines and A/B/C callouts, dimension
lines, the drawing-sheet title block, framed DETAIL A/B panels, bill-of-materials list with scale
ticks, and the line-work Type table.
**Fixes:**
1. WHAT `canvas(b)` (js:81).
   - CHANGE (dark mode): among `b.primary` and `b.secondary`, pick the hue nearest 215°.
   - If it is within ±45° of 215: `hslToHex(h, clamp(s, 45, 62), 21)`.
   - Otherwise (no blue-ish brand hue): the current dark-tinted-toward-primary result with
     saturation capped at 26% and lightness 16–18%.
   - Update `roles.canvas.use` to "the drawing field, from the brand's bluest hue".
   - With the warm palette this produces a deep teal-blue field from #17BEBB.
   - WHY: a chocolate-brown sheet does not read as a blueprint. A desaturated fallback reads as a
     Vandyke brown-print instead of a brown web page.
2. WHAT the `.ab-hl` dimension bracket (css:48–59).
   - CHANGE: move it below the word. `::before { top: auto; bottom: -0.32em; }` and
     `::after { top: auto; bottom: -0.32em; transform: translate(-50%, 50%); }`.
   - WHY: above the word it sits in the gap under the previous line and reads as dimensioning
     "SHOULD". At 390 it collides with that line.

---

## Work split (exclusive file ownership)

**X0 — framework.** Owns `js/aesthetic-board.js`, `css/aesthetic-board.css`, `js/data.js`,
`js/app.js` (font URL builder only), `js/export-html.js` (font URL only), `js/aesthetic-meta.js`
(no change expected).
- Fixes: F1, F2, F3, F4, F5, F6, F7, F9, F10.
- Land X0 first, or in parallel with the boards: per-aesthetic rules are scoped and win over the
  framework defaults.
- Fixes that depend on X0: 11.1 (F10) and 12.1 and 18.3 (F9). The `--ab-type-pick-w` values (F3)
  are harmless before F3 lands.

**X1 — keys 1–10.** Owns `js/aesthetics/` and `css/aesthetics/` files for soft-form,
raw-brutalist, neo-brutal-pop, retro-futurist, liquid-glass, holo-iridescent, aurora-noir,
bauhaus-poster, clay and riso-print.

| Aesthetic | Fixes |
|-----------|-------|
| Soft Form | 1.1, 1.2 |
| Raw Brutalist | 2.1–2.4 |
| Neo-Brutal Pop | 3.1–3.3 |
| Retro-Futurist | 4.1, 4.2 |
| Liquid Glass | 5.1–5.4 |
| Holo Iridescent | 6.1–6.5 |
| Aurora Noir | 7.1 |
| Bauhaus Poster | 8.1–8.4 |
| Clay | 9.1 |
| Riso Print | 10.1, 10.2 |

Also remove any narrow `.ab-tag { max-width }` caps in these files (F5).

**X2 — keys 11–20.** Owns the same file pairs for editorial-serif, neo-deco, y2k-chrome,
cyber-hud, bento-grid, mesh-gradient, industrial-device, pixel-arcade, groovy-70s and blueprint.

| Aesthetic | Fixes |
|-----------|-------|
| Editorial Serif | 11.1–11.3 |
| Neo Deco | 12.1, 12.2 |
| Y2K Chrome | 13.1–13.4 |
| Cyber HUD | 14.1 |
| Bento Grid | 15.1–15.3 |
| Mesh Gradient | 16.1, 16.2 |
| Industrial Device | 17.1, 17.2 |
| Pixel Arcade | 18.1–18.3 |
| Groovy 70s | 19.1–19.3 |
| Blueprint | 20.1, 20.2 |

Also drop the blueprint.css:205 tag cap (F5).

**Verification for every worker:**
- Regenerate the affected sheets with `KEYS="…" TAG=v2 S=<unique> shoot.sh`.
- Compare against the v1 sheets: the named target line breaks, no olive highlight words, the full
  brand name at 390, and no console errors.
- Run the existing AI-brief harness for touched aesthetics: highlight wording changes for Bauhaus
  (now `custom`), and role text changes for Holo, Pixel and Blueprint.

## Not assessed

- Hover, press and motion behavior (screenshots are static).
- `prefers-reduced-transparency` fallbacks.
- The Compare-all grid at tile scale.
- Uploaded-logo headers.
- Faces other than each aesthetic's first recommended pairing, such as a serif heading on Cyber
  HUD.
- Real Google Fonts italic availability per family; F10 requires the curl check.
