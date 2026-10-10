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

---

## Second pass (CAO-2)

Evidence: `cao/v2-<key>-A..D.png` and `cao/sheet-v2-<key>.png`, compared against v1. I reviewed
every A shot at full resolution and every sheet for B, C and D.

The round worked. All three Rework boards are fixed at the root:
- Bento's section 01 is now a composed card with a primary CTA tile.
- Liquid Glass has a vivid scene with white copy and a real lens.
- Holo's art is a foil ribbon and bubble instead of planet and orbit.

Bauhaus now reads clearly differently from Raw Brutalist. The olive accent is gone everywhere. The
brand name is no longer cut off at 390 on 19 of 20 boards.

**10 boards are signed off.** The other 10 have one to three small fixes each: 12 fixes in total,
none of them structural. Three are regressions introduced this round.

### Updated ranking

| # | Aesthetic | Status | Note |
|---|-----------|--------|------|
| 1 | Aurora Noir | Sign-off | Unchanged leader. |
| 2 | Bauhaus Poster | Sign-off | Lowercase Bayer stack, half-plane highlight and shape swatches. Now unmistakable. |
| 3 | Retro-Futurist | 1 fix | The LCD ghost segments sell the hardware. Narrow list rows are misaligned. |
| 4 | Cyber HUD | Sign-off | |
| 5 | Bento Grid | Sign-off | Up from 20th. The 01 card and the stat tiles are Apple-grade. |
| 6 | Industrial Device | Sign-off | Orange now spent on function only. |
| 7 | Soft Form | Sign-off | The states tray reads as a specimen. |
| 8 | Blueprint | 1 fix (regression) | The teal field is right, but the primary now renders as pastel salmon. |
| 9 | Clay | 1 fix | |
| 10 | Neo Deco | Sign-off | Translucent stepped frame over the fan; small text now holds. |
| 11 | Editorial Serif | 1 fix | True italics land. Cover labels collide with the initial. |
| 12 | Pixel Arcade | Sign-off | Brand-initial blocks and a dusk sky; no longer a Mario quote. |
| 13 | Riso Print | Sign-off | |
| 14 | Raw Brutalist | 1 fix | The spec index fills the hero. The name still truncates at 390. |
| 15 | Neo-Brutal Pop | 1 fix (regression) | Stickers now overlap the headline correctly at 1280, but cover the "G" at 390. |
| 16 | Mesh Gradient | Sign-off | |
| 17 | Groovy 70s | 3 fixes | Neutral waves and kraft panels fixed the noise. Sunburst, fit pill and narrow arch remain. |
| 18 | Liquid Glass | 1 fix | The hero is now Liquid Glass. The lens splits the initial into a broken glyph. |
| 19 | Holo Iridescent | 1 fix | Foil ribbon reads correctly. A visible seam runs through the bubble. |
| 20 | Y2K Chrome | 1 fix | The chrome type is fixed. Palette chips leave Accent orphaned on a second row. |

### Rulings on worker deviations

| Deviation | Ruling |
|-----------|--------|
| F1 accent ink #C27E00 (3.07:1) instead of #A86A00 | **Accept.** It reads as warm amber/gold, not olive, in Soft Form B, Editorial A, Bento A, Industrial A and Aurora B. My number was illustrative; the rule is what matters. |
| Retro LCD "M  9.5" with ghost segments at 14% | **Accept.** The ghost 8s read correctly. |
| Pop stickers as headline pseudo-elements, 2px outline | **Accept** the mechanism and the 2px weight (it matches the hero CTA). The narrow overlap is a separate bug (fix 3.4). |
| Bauhaus `::before` half-plane with a two-colour text clip | **Accept.** It renders correctly in A, B, C and D. |
| Liquid Glass timer top-left; second lens at narrow | **Accept.** Over the primary light the timer reads orange; that is physically right for clear glass. |
| Riso `text-wrap: wrap` to reach three lines | **Accept.** |
| Editorial initial at bottom −38% with a plate halo | **Accept the position, overrule the halo.** The labels are still cut by the strokes (fix 11.4). |
| Mesh zone contrast 7.4 plus a scrim lobe | **Accept.** Secondary shows only at the right edge, but the copy zone is clean and the mesh reads as multi-hue. |
| Groovy sunburst radius 0.9× CTA width | **Overrule.** Rays still sit behind the card body copy (fix 19.4). |
| Groovy's own `.ab-fit[match]` still primary-filled | **Overrule.** This is the same role violation F2 removed (fix 19.5). |
| Pixel light-mode `.ab-hl` shadow at 2px | **Accept.** |
| Bento 02 field label overlaying the input (`pointer-events: none`) | **Accept.** |

### Regressions vs v1

1. **Neo-Brutal Pop at 390:** the starburst sticker paints over the "G", so the headline reads
   "ood design". Fix 3.4.
2. **Blueprint:** with the new teal field, `--ab-pri-ui` (the primary lifted toward white for
   contrast) now fills the CTA, the selected tab and the state buttons. The brand's #E4572E shows
   as pastel salmon; in green it shows as mint. Fix 20.3.
3. **Holo:** the new two-segment ribbon leaves a visible vertical seam inside the bubble. Fix 6.6.

### Remaining fixes

**X0 (framework): none.**

**X1 (keys 1–10)**

Signed off: Soft Form, Aurora Noir, Bauhaus Poster, Riso Print.

- **2.5 Raw Brutalist, 390 header.**
  - WHAT: inside `@container ab (max-width: 600px)`.
  - CHANGE:
    `.ab[data-ae="raw-brutalist"] .ab-wordmark { font-size: 13px; letter-spacing: 0; }`
    `.ab[data-ae="raw-brutalist"] .ab-tag { font-size: 9px; letter-spacing: .06em; }`
  - CHECK: D shows the full "MARIGOLD STUDIO".
  - WHY: Archivo Black is wide enough to defeat F5.
- **3.4 Neo-Brutal Pop, stickers vs headline (regression).**
  - CHANGE: `.ab[data-ae="neo-brutal-pop"] .ab-headline { position: relative; isolation: isolate; }`
    with both sticker pseudo-elements at `z-index: -1`, so glyphs always paint over stickers.
  - At ≤600px the starburst is 56px wide at `left: -8px; top: -30px`; it may overlap at most the
    top-left 10% of the first glyph.
  - CHECK: D reads "Good design" in full; A is unchanged.
- **4.3 Retro-Futurist, narrow list.**
  - WHAT: inside the 600px block.
  - CHANGE:
    - `.ab[data-ae="retro-futurist"] .ab-row { grid-template-columns: 3ch minmax(0, 1fr) 5ch; }`
    - `.ab-row-n { grid-column: 1; grid-row: 1 / span 2; align-self: start; display: block; }`
    - `.ab-row-name { grid-column: 2; justify-self: start; text-align: left; }`
    - `.ab-row-status { grid-column: 2; grid-row: 2; justify-self: start; }`
    - `.ab-row-pct { grid-column: 3; grid-row: 1; }`
    - Remove any right-justification the file applies to the name at narrow.
  - WHY: names are currently pushed right, with an empty left half and no row numbers.
- **5.5 Liquid Glass, lens alignment.**
  - WHAT: `abLens` call(s) in `art()`, both wide and narrow.
  - CHANGE: center the lens on the initial's center (same x/y), lens width = 1.15 × the glyph's
    width, scale 1.08, dx 0, dy 0.
  - WHY: the current offset turns the M into a split "И" with a stray stem outside the lens, which
    reads as a rendering bug. A centered lens magnifies, and the bend shows only at the rim, as real
    glass does.
- **6.6 Holo Iridescent, ribbon seam (regression).**
  - CHANGE: split the two ribbon segments where the band crosses the bubble's right rim, not at the
    bubble's center. Overlap the segments by 1.5 units.
  - Give both segments the same `linearGradient` with `gradientUnits="userSpaceOnUse"`, x1=0 and
    x2=160, so the colors match across the join.
  - CHECK: no vertical line inside the bubble in A, B or C.
- **9.2 Clay, footer bar.**
  - CHANGE: `.ab[data-ae="clay"] .ab-foot { border-top: 0; }`. Also remove any `::before` bar on it.
  - WHY: the last grey "scrollbar" rule survived 9.1.

**X2 (keys 11–20)**

Signed off: Neo Deco, Cyber HUD, Bento Grid, Mesh Gradient, Industrial Device, Pixel Arcade.

- **11.4 Editorial Serif, cover labels.**
  - CHANGE:
    - Initial fill = `mix(plate, canvas, .28)`, a tonal letter instead of a canvas-colored one.
    - "NO. 01", the coverline and the brand/season line stay canvas color at full opacity with
      `position: relative; z-index: 2`.
    - Remove the halo.
  - WHY: the labels are cut by the M's strokes ("MARIGOLD STUD|O"). A tonal giant letter keeps the
    crop drama and lets the cover type sit on top, as on Kinfolk and Gentlewoman covers.
- **13.5 Y2K Chrome, palette chips.**
  - CHANGE (above 600px):
    `.ab[data-ae="y2k-chrome"] .ab-swatches[data-kind="chips"] { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 10px; }`
    with chips `min-width: 0`.
  - Hide `.ab-sw-hex` in `@container ab (max-width: 820px)` and above 600px; the framework narrow
    layout keeps showing it below that.
  - WHY: Accent alone on a second row reads as an afterthought.
- **19.4 Groovy 70s, sunburst.**
  - CHANGE: radius 0.7 × CTA width; mask `linear-gradient(to bottom, transparent 0 50%, #000 78%)`.
  - CHECK: no ray behind "Your next good idea." or the body line.
- **19.5 Groovy 70s, fit pill.**
  - CHANGE: delete the aesthetic's `.ab-fit[data-fit="match"]` fill so the framework's sec-tint and
    ink text apply. The pill shape may stay.
- **19.6 Groovy 70s, 390 hero.**
  - CHANGE (≤600px):
    `.ab[data-ae="groovy-70s"] .ab-hero-copy { max-width: 58cqw; margin-inline: auto; }`
    `.ab[data-ae="groovy-70s"] .ab-headline { font-size: calc(clamp(24px, 8.2cqw, 36px) * var(--ab-hl-scale, 1) * var(--ab-hs, 1) * var(--ab-display, 1)); }`
  - CHECK: in D no glyph crosses an arch band.
- **20.3 Blueprint, primary fills (regression).**
  - CHANGE: these fills become `background: var(--ab-primary); color: var(--ab-on-primary)`, with
    the existing 1px ink outline kept for edge definition:
    - `.ab-cta`
    - the selected `.ab-seg-btn[aria-pressed="true"]`
    - `.ab-state-ctl` (all three states)
    - the switch "on" fill
  - The lifted `--ab-pri-ui` stays only for strokes, small markers and text.
  - CHECK: A shows #E4572E fills; C shows #2F6B4F fills.
  - WHY: the brand's primary must render as itself wherever it fills; a pastel version reads as a
    different brand.

**Totals:** X0 0 · X1 6 · X2 6.

**Verification:** regenerate only the affected keys with `TAG=v3` and check the named CHECK lines.
These fixes are small and local. I do not need another full review round; a coordinator spot-check
of the ten v3 sheets is enough to accept.

---

## Round 4 (CAO-3) — six new aesthetics

Evidence: the builders' shots `cao/b1-<key>-A..D.png` (blob-tracking, xerox, micrographics),
`cao/b2-<key>-A..D.png` (mixed-type, ascii-art, rebus) and their `sheet-b1/b2-*` sheets. Every
source file predates its sheet, so the shots match the current code. I did not re-shoot.

**Verdict.** This is the strongest first-build round so far. Every board is clearly its own style
at a glance, and none relies on clip-art. The builders applied the quality bar from the earlier
reviews: no stranded words at 1280, primary limited to the CTA and selected states, a restyled
Type block on every board, and the full brand name at 390.

| # | Aesthetic | Verdict | One line |
|---|-----------|---------|----------|
| 1 | Micrographics | Ship (1 fix) | The scale contrast is the aesthetic, and the spec plate is excellent. The callout labels claim glyph features they don't point at. |
| 2 | Xerox | Refine (2) | Toner, threshold type, tape and overprint are right. The hero leaves a dead paper field. |
| 3 | ASCII Art | Ship (2) | A real character-density map with TUI controls. The light-mode map washes out, and the Type block has a near-empty column. |
| 4 | Mixed Type | Ship (1) | A convincing specimen-poster headline. The card title's bold first letter looks like a bug. |
| 5 | Blob Tracking | Refine (2) | The footage plate sells the look. Too many labels fall below readable contrast. |
| 6 | Rebus | Refine (2) | The pictogram headline works. The brand "equation" claims a reading it doesn't have. |

**Distinctness:** passes every pair the coordinator asked about.
- **Xerox vs Riso:** black toner and degradation, not soft colored ink.
- **Xerox vs Raw Brutalist:** dirty and analog, not a clean grid.
- **Micrographics vs Blueprint and Cyber HUD:** light print microtype, with no drawing field and no glow.
- **Blob Tracking vs Cyber HUD and Aurora:** clinical white overlays on footage, no neon.
- **ASCII vs Pixel Arcade:** characters are the medium, not sprites.
- **Rebus and Mixed Type vs Neo-Brutal Pop and Editorial:** no outlines or stickers. Rebus's language is pictograms; Mixed Type's is face-switching.

### Rulings on builder choices

| Choice | Ruling |
|--------|--------|
| Mixed Type and Rebus draw the visible headline in `def.art` with the real h2 visually hidden | **Accept for now, no hook.** Both render correctly at 1280 and 390, in both modes and both palettes, and the h2 keeps the semantics. Add a `def.headline(ctx)` hook (it would return the h2's inner HTML) only when a third aesthetic needs it; adding it now changes nothing a viewer sees. |
| Blob Tracking boxes the whole headline plus the highlight word | **Accept.** A region box around the text with a nested target box is how real trackers nest detections, so no second-word hook is needed. |
| Xerox leaves open paper left of the poster art | **Overrule.** At 1280 it is a ~500×280px dead field, and pasted-up flyers have no dead space (fix 22.1). |
| Micrographics callouts point at grid positions, not glyph features | **Overrule.** "TERMINAL" and "COUNTER" landing on empty grid points is exactly what a spec-sheet reader notices (fix 23.1). |
| ASCII Art falls back to JetBrains Mono when the brand face isn't a known mono | **Accept, with one refinement.** Also use the brand heading when its `data-hcls` is `pixel` (VT323, Silkscreen and similar). Order: heading if mono or pixel, else body if mono, else JetBrains Mono (fix 25.2). |

### Framework (X0)

- **X0-R4.1** `js/aesthetic-meta.js`, `ascii-art` entry.
  - CHANGE: `mono: { picks: ['VT323', 'Space Mono'], note: 'VT323 for readouts' }`.
  - WHY: F4 keeps the mono column because VT323 is not a body pick, so the third Type card shows a
    lone "VT323" under an empty "//" line. Two picks fill it, and the note fills the class line.

### X1 — blob-tracking, xerox, micrographics

**21 Blob Tracking — Refine**
*Benchmark:* TouchDesigner blob-track reels, OpenCV detection overlays, Zach Lieberman-style
tracking studies.
*Keep:* the dithered footage plate with the primary "locked" target, ID/confidence tabs, corner
ticks, the constellation lines, detection-boxed UI, the boxed headline, and the TRACKED list.
1. **WHAT:** dim labels in blob-tracking.css. These include palette job lines
   ("Background · 70–75%"), unselected segments (BUILD, LAUNCH), state names (SEARCHING, LOST),
   `.ab-kicker`, `.ab-sub-rest`, `.ab-type-class` and `.ab-type-why`.
   - **CHANGE:** every one of these uses `color: var(--ab-muted)`, which the framework guarantees
     at ≥ 4.5:1. Remove any extra opacity or alpha on them.
   - "Lost" and "searching" may keep a dashed border to signal state, but their text stays muted,
     not fainter.
   - **WHY:** at roughly 2:1 on a speckled ground they read as missing text. Clinical UI is crisp.
2. **WHAT:** the board-wide noise texture.
   - **CHANGE:** keep the grain inside the footage plate (`.ab-art`) only. Cards, panels and the
     Type block become flat `mix(canvas, ink, .04)` with no grain. Halve the opacity of the board
     background grain.
   - **WHY:** the footage plate and the overlay should read as two layers. Grain everywhere makes
     the UI look like the footage, and the overlay loses its clinical contrast.

**22 Xerox — Refine**
*Benchmark:* 80s hardcore flyers (Pettibon, SST era), Sniffin' Glue, current xerox-revival gig
posters.
*Keep:* the threshold-toothed Anton headline with the primary overprint block, the halftone M plate
with tape and the copy-machine edge band, the strike-through avoid list, the taped paper-scrap
cards, the toner CTA with offset overprint, and the dashed-rule list.
1. **WHAT:** the empty paper left of the art (hero, 1280).
   - **CHANGE:** add a tear-off tab strip to `art()`, absolutely placed at the hero's bottom-left.
     Its width is from the left edge to 16px before the art; its height is 38% of the art.
     - 7 vertical tabs, each separated by a 1px dashed ink cut line.
     - Each tab holds the brand name rotated −90° in the body face (Courier Prime), 10px,
       uppercase, letter-spacing .08em.
     - Above the tabs is a solid band: "TAKE ONE —" in the heading face at 22px, plus
       "COPY 02 OF 50" in the body face at 10px.
     - The whole strip rotates −0.8° and the third tab is missing: an irregular gap with a torn
       edge drawn as an SVG zigzag clip.
     - Hide the strip at ≤600px.
   - **WHY:** tear-off tabs are the most recognisable flyer device, and they fill the dead field
     with something functional rather than decorative.
2. **WHAT:** accent highlighter spread.
   - **CHANGE:** remove the yellow highlighter from list row 1 ("BRAND REFRESH"). Keep it on the
     subcopy lead and the footer square.
   - **WHY:** accent is one spark. Three highlighter swipes read as a theme color.

**23 Micrographics — Ship**
*Benchmark:* Acronym product sheets, Nike ISPA graphics, Experimental Jetset/Spin spec layouts.
*Keep:* everything else, including the giant headline vs 8px microtype, the spec plate with
rulers, QR, barcode and the BOM column, the per-panel micro corner labels, the vertical margin
microtype, and the bracketed list.
1. **WHAT:** `calls` in `art()` (micrographics.js ~121–128).
   - **CHANGE:** draw four guide lines across the glyph area as 1px dashed ink at 35%:
     - cap height at y=34%
     - baseline at y=78%
     - left bearing at x=21%
     - right bearing at x=77%
   - Rename and re-aim the callouts so every marker sits on a drawn guide or intersection:

     | Callout | Label | Marker at (x, y) |
     |---------|-------|------------------|
     | A.01 | `CAP HEIGHT` | (30, 34) |
     | A.02 | `L. BEARING` | (21, 58) |
     | A.03 | `GRID 10` | unchanged |
     | A.04 | `ADVANCE` | (77, 34) |
     | A.05 | `OPT. CENTER` | (49, 56), the center of the guide box |
     | A.06 | `BASELINE` | (77, 78) |
     | A.07 | `REG. MARK` | unchanged |
     | A.08 | `ORIGIN` | (21, 78) |

   - Delete the "TERMINAL" and "COUNTER" labels.
   - **WHY:** the labels must be true for any brand face. Font metrics are always true;
     terminals and counters depend on the glyph.

### X2 — mixed-type, ascii-art, rebus

**24 Mixed Type — Ship**
*Benchmark:* Pangram Pangram and Displaay specimen posters, Commercial Type specimens,
It's Nice That covers.
*Keep:* the four-voice headline on a shared cap height, the specimen "Aa" block with cap/base
guides and the glyph rows, italic palette labels, the italic list numerals, and the Roman/Italic/
Mono states.
1. **WHAT:** `.ab-card-title` ("Your next good idea.", where only the "Y" is heavy).
   - **CHANGE:** drop the first-letter treatment. Set "Your next" in the heavy grotesk voice
     (weight 800, the same face as "GOOD") and "good idea." in the serif-italic voice, sized to
     the same cap height.
   - If the title is a single text node, wrap the last two words in a span in CSS-only fashion
     via `::first-line`. Otherwise the worker adds the split where the board copy is rendered for
     this aesthetic, with markup unchanged elsewhere.
   - If neither is possible without touching shared markup, set the whole title in the serif
     italic (weight 400) and remove the bold Y.
   - **WHY:** one heavy capital reads as a rendering glitch, not a voice change.

**25 ASCII Art — Ship**
*Benchmark:* btop and lazygit TUIs, ASCII video-art renderers, text-mode landing pages.
*Keep:* the generated density map with brand-gradient cells and accent sparks, box-drawing frames
with tab labels, `[ Design ]` segments, `[■ ON ]`, the `> Save direction █` CTA, block progress,
dither-tailed palette bars, and the sparse/dense/solid states.
1. **WHAT:** light mode (B) density map and caret.
   - **CHANGE:** when `!t.isDark`, color each cell with `mix(cellColor, ink, .35)`, and render
     the headline caret block in light mode too (it is missing in B).
   - **WHY:** pale orange and teal characters on cream drop below legibility, and the map
     disappears.
2. **WHAT:** the headline face fallback (see the ruling above).
   - **CHANGE:** the chosen face is:
     - the heading face if `data-hcls` is `mono` or `pixel`;
     - else the body face if its class is `mono`;
     - else JetBrains Mono.

**26 Rebus — Refine**
*Benchmark:* Paul Rand's IBM Eye-Bee-M poster, Eye on Design's "Nouveau Rebus" identities.
*Keep:* the "Good [pencil] / should feel [sun]" headline, the symbol legend chips, pictogram
palette tiles, icon tabs, symbol avatars, and the Word/Mixed/Symbol states.
1. **WHAT:** the brand equation fallback (`rebus.js` ~163–172, the no-key branch).
   - **CHANGE:** when no syllable key matches, the caption reads "the mark: `${initial}` +
     `${sym}`", not "read it aloud: … = Marigold Studio".
   - "Read it aloud" stays only for the keyed branch, which is a true phonetic rebus.
   - **WHY:** "M + sun = Marigold Studio" is not a rebus; claiming it is undercuts the one idea
     the board sells.
2. **WHAT:** `.rb-eq-name` (the ink-filled pill holding the brand name).
   - **CHANGE:** no fill. The brand name sits in the heading face at the same size and weight as
     the "M" tile's letter, in ink, on canvas, with a 4px ink underline offset .12em.
     Tile heights are unchanged.
   - **WHY:** a full-width ink slab is the heaviest object on the board and outweighs the
     headline. The result of the equation should read as a word, not as a button.
3. **WHAT:** headline pictogram size (`.rb-hl-sym` or the equivalent svg class in rebus.css).
   - **CHANGE:** height = 0.72em (cap height). `vertical-align: baseline` with
     `transform: translateY(0.02em)`. The pencil stays rotated −35°, but its bounding box
     respects the same cap height.
   - **WHY:** the brief says symbols sit on the baseline at cap height. The pencil currently
     floats high and small next to "Good".

### Work split and counts

- **X0:** 1 (R4.1)
- **X1:** 5
  - Blob Tracking 21.1, 21.2
  - Xerox 22.1, 22.2
  - Micrographics 23.1
- **X2:** 6
  - Mixed Type 24.1
  - ASCII Art 25.1, 25.2
  - Rebus 26.1, 26.2, 26.3

Each worker re-shoots its keys with `TAG=v4` and checks:
- **Xerox:** no dead paper field at 1280.
- **Micrographics:** every marker sits on a drawn guide.
- **Blob Tracking:** labels are readable in A.
- **ASCII Art:** the map is legible in B.
- **Rebus:** the caption is honest and the pill is gone.
- **Mixed Type:** the card title has no lone bold capital.

A coordinator spot-check is enough to accept; this doesn't need another CAO round.
