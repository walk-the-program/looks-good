# HR2 — Round 6 harsh review: graphic aesthetics

Reviewer: Opus adversarial creative director (task hr2, packet rev 1). Read-only on the repo except this file.
Keys: raw-brutalist, neo-brutal-pop, bauhaus-poster, radical-memphis, bento-grid, groovy-70s.

Evidence: `S/adv/r6/r6-<key>-{A,B,C,D}.png`, `sheet-r6-<key>.png`, `sheet-deck-<key>.png`, full-size crops in
`S/adv/hr2/<key>-A{0,1,2}.png`, `S/adv/hr2/<key>-D.png`, `S/adv/hr2/D-tops.png` (S = the session scratchpad).
Reference captures: `S/adv/hr2/refs/` (sheets `sheet-rb|nb|bh|mm|bg|gv|c|d.png`). Anything marked "(not viewed)"
was not loaded (refused, 404, bot wall, or no image found) and is cited from knowledge only.

| Key | Score | Verdict |
|---|---|---|
| raw-brutalist | 5 | Refine |
| neo-brutal-pop | 4 | Rework |
| bauhaus-poster | 4 | Rework |
| radical-memphis | 5.5 | Refine |
| bento-grid | 5 | Refine |
| groovy-70s | 5.5 | Refine |

Nothing in this set clears 6. None of it would get past a Pentagram or Collins portfolio review in its current form.

---

## Cross-cutting failures (these hit all six; fix once, lift everything)

1. **One shared pattern pool feeds six "different" styles.** `js/patterns/fit.js`:
   `zigzag` appears in raw-brutalist, neo-brutal-pop, groovy-70s and radical-memphis. `panels` appears in raw-brutalist, neo-brutal-pop, bauhaus-poster and radical-memphis.
   `patchwork` appears in neo-brutal-pop, groovy-70s and radical-memphis (it leads radical-memphis). `arcrise` leads both neo-brutal-pop and groovy-70s.
   `modulargrid` leads both raw-brutalist and bento-grid. `festival` is in neo-brutal-pop and radical-memphis. `oprings` and `ribbonrise` are in bauhaus-poster and groovy-70s.
   `glyphgrid` is in raw-brutalist and radical-memphis. Bento also shares `gradpanes`, `tokens` and `aura` with soft-form.
   Result on screen: the raw-brutalist and bento-grid deck covers carry the **same** dots/bar-chart/plus band
   (sheet-deck covers), their closing columns are the same mosaic, neo-brutal-pop's cover is groovy's rainbow,
   and groovy's "Flower-power dots" is memphis's "Terrazzo" recoloured. Rule to adopt: **a lead family is never
   reused by another aesthetic, and no family appears in more than two suites.** Per-key reassignments are in each Fixes list.
2. **The deck skeleton is identical across all six.** `js/brand-deck.js` slides `interface` (L300), `product`
   (L345) and `dodont` (L380) render the same layout everywhere: three outlined cells with three full-width buttons under them,
   a grey sidebar dashboard with "Projects / 72% 45% 10%" and a "Your next good idea" card, and a two-column checklist.
   The product slide is a generic SaaS admin screen in every style, which is the single biggest template tell in the decks.
   Each aesthetic needs a `deck.productStage` hook. For example, a poster wall for bauhaus-poster, a showroom vignette for
   radical-memphis, an album or packaging sleeve for groovy-70s, an app tile cluster for bento-grid, a raw HTML index for
   raw-brutalist, and a sticker-covered laptop for neo-brutal-pop.
3. **The "alive" highlight device is on every board.** It shows up as a yellow slab (raw-brutalist), a yellow sticker (neo-brutal-pop),
   a half-plane (bauhaus-poster), mustard text (radical-memphis and bento-grid) and orange echo type (groovy-70s). It is one generator gesture wearing six costumes.
   At least three of these aesthetics should express emphasis with their own mechanism instead (see the per-key fixes).
4. **Accent-as-text leaks muddy gold.** `--ab-accent-ink` (set in `js/aesthetic-board.js` L225) darkens #FFC914 to an
   olive-mustard that reads dirty on cream (radical-memphis and bento-grid "alive", and bento's deck "idea."). None of the references colours
   text this way.
5. **The board skeleton is the same** (header, hero, palette, type, interface + material, in use, footer) with the same
   copy. Raw-brutalist and bauhaus-poster are the only two that make the skeleton look intended.

---

## 1. raw-brutalist — 5/10 · Refine

It isn't raw brutalism. It's a tidy Swiss-editorial template wearing neo-brutalism's offset shadow, and the hero has 200px of empty grid where the idea should be.

**References**
1. brutalistwebsites.com — https://brutalistwebsites.com — browser-default HTML: Times, blue underlined links, unstyled thumbnails, no chrome (viewed).
2. Yale School of Art — https://www.art.yale.edu — wiki-editable HTML, default serif body, colour blocks and widgets dropped in raw (viewed).
3. MSCHF — https://mschf.com — numbered mono product index at display size, black field, RGB system colours, "?????" filler as texture (viewed).
4. Bureau Borsche — https://bureauborsche.com — grey utility labels over full-bleed imagery, a grid exposed as UI (viewed).
5. Are.na — https://www.are.na — plain list typography, `a. b. c.` enumeration, no decoration (viewed).
6. Experimental Jetset — https://www.experimentaljetset.nl — Helvetica lists, black rules, total refusal of ornament (not viewed: connection refused).
7. Bloomberg Businessweek covers, Richard Turley era 2010–14 — default-UI and screenshot aesthetics, crude system type at poster scale (not viewed).
8. Balenciaga.com 2017 — e-commerce reduced to a default list and black Helvetica (not viewed).
9. ABC Dinamo — https://abcdinamo.com — grotesk at extreme scale beside raw specimen tables (not viewed).

**Kill list**
- The hard offset shadow, `--rb-shadow: 6px 6px 0` (raw-brutalist.css L10) on the card, CTA and states (A2: interface card, the SAVE rest/hover set). This is neo-brutal-pop's signature, so the two now read as siblings.
- The dead hero zone: `.ab-hero { padding-bottom: clamp(70px, 16cqw, 190px) }` (L40). A1 opens with about 140px of empty 12-column grid.
- Teal-filled status chips (A2 "IN REVIEW / BUILDING / PLANNED"). That's client colour put somewhere the style puts no colour.
- The grey quarter-circle, plus-sign and bar-chart "Slab grid" art (deck material slide and cover band). That's Bauhaus clip-art in greyscale.
- Teal-tinted checkbox squares on the deck do/don't slide (09). They're soft, friendly UI.

**Gaps (ranked)**
1. The mechanism. The best work exposes the medium: default browser type, blue links, raw tables and visible markup. Ours is polished grotesk and mono labels, the 2019 "Awwwards brutalist" template. Severity: high.
2. Hero scale. MSCHF and Dinamo set type that fights the frame. Our headline is big but stops at about 72% width with the gap filled by a metadata table. Only "ALIVE" bleeds. Severity: medium.
3. Detail density. The references are dense with indexes, counts and timestamps. Ours has a four-row spec table, then air. Severity: medium.
4. Phone (D). This is honestly fine, just a stacked desktop. Severity: low.

**Distinctness**
- vs neo-brutal-pop: shared ink borders and 6px offset shadows that lift on hover and press flat. **Raw must move.** It drops the shadows and owns flatness, inversion and default-HTML.
- vs bento-grid: identical deck cover band and closing column (both lead `modulargrid`). **Raw must move**, because bento has a better claim to the tile motif.
- vs bauhaus-poster: raw's deck material art is greyscale Bauhaus. **Raw must move.**

**Fixes**
1. **TOP: Flatten.** In raw-brutalist.css set L10 to `--rb-shadow: none`. Change L99–100 so hover is `background: var(--ab-ink); color: var(--ab-canvas); transform: none` and pressed is `outline: 2px solid var(--ab-ink); outline-offset: -6px`. On the input focus (L108), replace the shadow with `outline: 3px solid var(--ab-ink)`. Raw states should be inversion and outline, never lift.
2. **TOP: Add the default-HTML counter-voice.** Set the hero sub-line, footer links, the "Use recommended fonts" link and the deck footer in `font: 16px/1.3 "Times New Roman", Times, serif; color: #0000EE; text-decoration: underline` (visited `#551A8B`). These are fixed browser colours, not client colours. That one mechanism makes the style unmistakable and unlike any other key.
3. **TOP: Fill the hero with exposed structure.** Cut L40 padding-bottom to `clamp(20px, 3cqw, 40px)`. Number the 12 columns along the top of `.ab-hero::before` as mono `01…12` ticks at 9px. Raise display size so "SHOULD" reaches the right edge, about 17.5cqw instead of the current ~12.5cqw. Move the spec index under the headline as a full-width four-column mono table: `ID / ITEM / STATE / UPDATED`.
4. Status chips: `.ab-row-status` (L143) becomes `background: none; border: 1.5px solid var(--ab-ink); color: var(--ab-ink)`. Colour stays only in the palette strip and the accent band.
5. Patterns, `fit.js` L38–45: drop `modulargrid` (give it to bento) and `panels`, and lead with `glyphgrid` `{glyphs: 'blocks'}` mono. Add `onebit` as the second entry. Replace the deck material art (`art()` in raw-brutalist.js L64) with a wireframe of the board itself: ink boxes labelled `DIV.hero 1280×640`, `UL.rows 3` in mono. That's literal exposure, not geometry.
6. Fonts (aesthetic-meta pairings): keep Archivo Black and pair it with IBM Plex Mono for UI. Drop Inter, Inter Tight and Anton from the list, because they're category fonts, not the voice. Body falls back to the system serif from Fix 2.
7. Deck do/don't (09): render the marks as mono `[x]` / `[ ]` text, not tinted squares.

**Keep**
The uppercase Archivo Black poster with the yellow band bleeding off the right edge. The mono bracket numbering `[01]`. The full-width palette strip with the 2px frame. Together those are a credible Swiss-print skeleton.

**Deck**
- Cover: the type is strong, but the `modulargrid` band (dots, bars, plus) is bento's cover too. Replace it (Fix 5).
- 05 interface: the three SAVE buttons are stretched to full cell width, so they read as form bars. Size them to content.
- 06 material: grey Bauhaus collage. Replace (Fix 5).
- 08 product: the generic SaaS dashboard (cross-cutting #2). Render it as an unstyled HTML index page instead.
- 09 do/don't: "Keep the page monochrome" contradicts slide 03, a five-colour palette. Reword it to "Colour only in the swatch strip and one band."

---

## 2. neo-brutal-pop — 4/10 · Rework

It's a centred SaaS landing hero at 64px with two stickers stuck on, and the stickers sit on top of the words.

**References**
1. Gumroad — https://gumroad.com — huge black type, pink "G" coins as 3D stickers, 2px ink outlines, flat fields (viewed).
2. Gumroad features — https://gumroad.com/features — full-saturation yellow and pink section fields, hand-drawn ink illustrations, hard shadows (viewed).
3. NN/g, "Neobrutalism: Definition and Best Practices" — https://www.nngroup.com/articles/neobrutalism/ (viewed).
4. neobrutalism.dev — https://www.neobrutalism.dev — saturated blue pills with hard shadow, starburst stickers, grid canvas (viewed; it's the template baseline to beat, not the bar).
5. Duolingo — https://www.duolingo.com — chunky bottom-border buttons and character-led art (viewed).
6. Mailchimp by Collins (2018) — https://mailchimp.com — Cavendish yellow and illustrated wit (viewed, mostly occluded by a modal).
7. Figma Config 2022 identity — sticker-sheet type lockups (not viewed).
8. Hype4 Academy, "Neubrutalism is taking over the web" — https://hype4.academy/articles/design/neubrutalism-is-taking-over-web (not viewed).
9. Poolsuite — https://poolsuite.net — desktop-window brutal pop (not viewed).

**Kill list**
- The centred hero (`layout: { hero: 'centered' }`, neo-brutal-pop.js L17) with a ~64px headline (A0). Gumroad's hero type is about twice that, and left or full measure.
- The pastel teal canvas: `canvas(b) = mix(secondary, canvas, 0.22)` (L44). It's client teal washed to mint across the entire board. Gumroad uses paper plus 100%-saturated section fields, never a pastel wash.
- The starburst over the "G" of "Good design" on phone (D-tops, first column).
- The flower over body copy on deck 02 ("bright stickers and b[flower]squish").
- Two starbursts over the DISPLAY and HEADING labels on deck 04.
- Generic type cards: rounded paper boxes listing Space Grotesk, Bricolage and Lexend with a mint "✓ Fits" pill (A1).
- "Sticker sunrise" rainbow (`arcrise`) as the cover lead. That's groovy-70s's motif.
- "Doodle party" (`festival`) and "Pop patches" (`patchwork`), which belong to memphis.

**Gaps (ranked)**
1. Scale contrast. The references put a 120–180px headline beside 16px body. Ours is 64 to 15px, with everything mid-sized. Severity: high.
2. Sticker craft. Gumroad's stickers are objects (3D coins, die-cut illustrations). Ours are two flat vector shapes with a 3px shadow, placed as decoration rather than composed. Severity: high.
3. Colour logic. Pop wants flat 100% fields switched per section. Ours is one mint wash with paper cards. Severity: medium.
4. Deck. Slide 06 is effectively empty, and 02 and 04 have collision bugs. Severity: high.
5. Phone. A squashed desktop with the collision above. Severity: medium.

**Distinctness**
- vs radical-memphis: shared offset sheets, stickers, squiggles, and `festival`/`patchwork`/`zigzag` patterns. **Neo-brutal must move** toward the product-UI, Gumroad and Figma end (ink outlines, UI-object stickers, big grotesk). Memphis keeps furniture and laminate.
- vs raw-brutalist: shared ink borders and offset shadows. **Neo-brutal keeps the shadow** (it's its signature). Raw drops it (raw Fix 1).
- vs groovy-70s: shared rainbow cover. **Neo-brutal drops `arcrise`.**

**Fixes**
1. **TOP: Recompose the hero.** Switch to `layout: { hero: 'split' }`. Headline left-aligned at `clamp(56px, 11.5cqw, 150px)`, weight 800, three lines. "alive" becomes a rotated (-4deg) yellow sticker block with a 2px ink border and a 6px hard shadow. On the right, a cluster of 3–4 UI-object stickers (a price tag "$1", a cursor, a "NEW" starburst, a checkbox), each 2px outlined, 4px shadow, rotated ±6–12deg. Gumroad's mechanism is objects, not blobs.
2. **TOP: Stop sticker collisions.** In neo-brutal-pop.css, clamp sticker placement to the gutters. Under 480px, move `.ab-headline::before` to `top: -0.9em; left: auto; right: 0` (L265–270 currently translates it onto the text). In decks, add `.ab-slide:not([data-slide="cover"]) .ab-headline::before, … ::after { display: none }`, and keep stickers only on cover and closing.
3. **TOP: Build the empty material slide (06).** Set `deck.materialStage` to a sticker sheet: a paper rectangle with a 2px ink border and an 8px shadow, holding six die-cut stickers in a 3×2 grid at 120px with 18px labels (Sticker card, Chunky button, Paper button, Squish state, Starburst, Price tag). The lone "Get started" button goes.
4. Canvas: change L44 to `canvas(b) { return b.isDark ? b.mix(b.ink, b.canvas, 0.1) : b.mix('#ffffff', b.canvas, 0.85) }` (paper). Add a full-saturation section field: the "In use" section on `var(--ab-accent)` at 100% and the type section on `var(--ab-primary)`, cards staying paper. Drop the 32px grid to 6% alpha or remove it, since it's neobrutalism.dev's default.
5. Type specimen: replace the font-list cards with one oversized "Aa" (Bricolage Grotesque 800, 160px) inside a -2deg rotated paper card, plus a one-line ramp. Remove Space Grotesk and Lexend from the pairings in aesthetic-meta. Space Grotesk is a category font, not a voice.
6. Patterns, `fit.js` L46–53: remove `arcrise`, `festival` and `patchwork`. Lead with `halftone` Big dots (duo, cell 4), keep `panels` and `zigzag`, and add `flyposter` (sticker and poster culture) and `tokens` `{fill: 'solid'}` (chunky capsules). Do this together with groovy's Fix 6 and memphis's Fix 5.
7. Status chips, `.ab-row-status`: solid secondary fill at 100% with ink text and a 2px border, square 6px radius. No mint tint.

**Keep**
The 2px ink outlines with the 4px hard shadow and the lift/squish state demo. The tilted palette chips. The cleanest part of the board is the "In use" rows with the coloured initial tiles.

**Deck**
- 01 cover: centred and small, with a groovy rainbow cut off at the bottom edge.
- 02 principles: the flower occludes the body text, and the starburst clips the "HOW MARIGOLD…" eyebrow.
- 04 typography: two starbursts overlap the DISPLAY and HEADING labels.
- 06 material: empty (Fix 3).
- 08 product: generic dashboard (cross-cutting #2). Show the sticker-covered laptop or Gumroad-style product card instead.
- 10 closing: a strip of rainbow arcs (groovy) again.

---

## 3. bauhaus-poster — 4/10 · Rework

It's the Etsy "mid-century geometric" print with a lowercase Futura-alike beside it. Bauhaus posters are diagonal, constructed and loud. This is horizontal, polite and decorative.

**References**
1. Joost Schmidt, Bauhaus Ausstellung Weimar poster, 1923 — circle, square and profile constructed on a diagonal (thumbnail viewed via Wikimedia Commons, "Bauhaus Ausstellung 1923").
2. Bauhaus Ausstellung postcards, 1923 (Bayer, Moholy-Nagy, Schlemmer) — diagonal figures, red/black/yellow, rotated type (thumbnails viewed, same search).
3. László Moholy-Nagy, Bauhausbücher covers 1925–30 — heavy bars, type rotated 90°, asymmetric black/red on white (viewed, Commons "Moholy-Nagy Bauhausbücher").
4. Josef Müller-Brockmann, "der Film", 1960 — post-Bauhaus scale contrast and diagonal type (thumbnail viewed).
5. Herbert Bayer, Kandinsky 60th birthday poster 1926 and the universal alphabet (not viewed; Commons search returned nothing).
6. Bauhaus Dessau Foundation current site — https://www.bauhaus-dessau.de/en/ — the contemporary institution avoids pastiche entirely (viewed).
7. Pentagram / Paula Scher, The Public Theater identity — constructivist wood-type scale (not viewed: 404).
8. Herbert Bayer, "Europäisches Kunstgewerbe" poster 1927 (not viewed).

**Kill list**
- The 3×3 quarter-circle tile mosaic (A0 bottom right, deck cover, deck 06 at full size). It's the stock "Bauhaus pattern" sold on every print-on-demand site and appears nowhere in the 1919–33 canon.
- Teal standing in for Bauhaus blue, and in the green palette (C) a mint and forest "Bauhaus". The primaries are the style. Client colours belong on UI, not on the poster.
- Rounded teal status pills (A2 "IN REVIEW"), the mint "✓ Fits" pill, the round "Use recommended fonts" button.
- Op-art and 70s patterns: "Target" (`oprings`), "Banded rise" (`ribbonrise` rainbow), "Counterchange" stripes as the cover band. The cover and closing read as circus or op art.
- The highlight half-plane behind "alive" (cross-cutting #3). Bauhaus emphasises with a bar, a rule, or a colour change of the whole word.

**Gaps (ranked)**
1. Composition. Every reference runs on a diagonal or a 90° rotation with heavy bars. Ours has every element square to the page. Severity: high.
2. Hero art. The canon uses a few huge primitives (one circle at 40–60% of the sheet). Ours is nine small tiles at 30cqw, tucked in a corner. Severity: high.
3. Colour logic. Fixed primaries plus black on off-white, versus client-driven colours. Severity: high.
4. Typographic voice. Bayer and Schmidt set lowercase geometric sans, but at extreme scale against tiny bold labels and rules. Our Jost 600 is decent but not violent enough, and labels are timid 10px tracked caps. Severity: medium.
5. Phone. The art drops under the headline intact and survives. Severity: low.

**Distinctness**
- vs groovy-70s: both carry rings and rainbow bands (`oprings`, `ribbonrise`). **Bauhaus must drop them.**
- vs raw-brutalist: raw's deck uses greyscale Bauhaus geometry. **Raw moves** (raw Fix 5), and Bauhaus keeps the primitives.
- vs radical-memphis: both use flat primitives. They're distinguishable now (memphis has pattern-filled solids, Bauhaus flat solids) but only just.

**Fixes**
1. **TOP: Replace the tile mosaic with a constructed poster.** In bauhaus-poster.js `art()`, build one large circle (diameter 0.62 × art width) in red, a black bar (height 0.09 × width) crossing it at -24deg, a yellow square at 0.28 × width offset off-axis, and a thin black rule. Enlarge the art in bauhaus-poster.css L37 to `--ab-poster-art-w: clamp(220px, 46cqw, 560px)` and let it overlap the headline's right side (z-index under the type).
2. **TOP: Put the board on a diagonal.** Add `.ab-hero::after`: an ink bar `height: clamp(10px, 1.6cqw, 20px)` spanning 120% width, rotated -12deg, behind the headline. Turn the vertical "CONSTRUCTED" kicker (L48) into a solid red bar 28px wide with the label reversed in 12px bold caps. Rotate the section numbers' circle markers into a 45deg diagonal sequence on the deck principles slide.
3. **TOP: Fix the poster palette.** The art, patterns and the highlight bar use fixed primaries (red `#D7332A`, yellow `#F2C230`, blue `#1F4FA2`, black `#151515` on `#F1ECE2`). Client primary drives only the CTA and toggle. Implement this as a fixed `posterInks` set in bauhaus-poster.js, used by `art()`, with `fit.js` colorway `'mono'` or a new `'fixed'` for this suite.
4. Kill the pills: `.ab-row-status` (L144) becomes `border-radius: 0; background: none; border: 2px solid var(--ab-ink); letter-spacing: .1em`. `.ab-fit` and the font button become square. Keep only the circle markers, since circle-or-square is the stated rule.
5. Patterns, `fit.js` L86–93: drop `oprings` and `ribbonrise`. Lead with `specimens` `{study: 'squares', round: 0}` or `panels` `{frame: false}` (flat colour planes). Add `chevron` `{mirror: 'none', slope: 30}` for diagonal thrust. The cover band must not be stripes.
6. Type scale: increase headline display so "good design" spans the full measure (about 14cqw). Set the highlight word as a whole-word colour change to red (no plane). Add a heavy 6px ink rule above the headline.
7. Phone: keep the art, but rotate it 0→-8deg and bleed it off the right edge by 12%. As it stands it's a centred tile block.

**Keep**
Lowercase Jost at poster size (a real nod to Bayer). The palette shown as primitives (square, circle, quarter, semicircle), which is the best palette idea in this batch. Square segmented control with circle radio markers. Big tabular 01/02/03 numerals in "In use".

**Deck**
- 01 cover: a small mosaic plus an orange-stripe and target band, which reads as a circus. Replace it with the Fix 1 poster at 60% slide height.
- 06 material: the stock mosaic blown up full height, which is the worst single slide in the set. Use the constructed poster with annotation rules.
- 07 patterns: four of six (Counterchange, Banded rise, Colour studies rings, Target) are op-art or 70s.
- 08 product: generic dashboard (cross-cutting #2). Use an exhibition poster wall: three posters at different scales on a grid.
- 10 closing: a stripe column with a target. Replace it with a diagonal bar crossing the slide.

---

## 4. radical-memphis — 5.5/10 · Refine

It has the best hero object in the batch (a real Sottsass-style totem), set beside a 52px headline that whispers. Pill-shaped SaaS controls then undo the furniture logic.

**References**
1. Ettore Sottsass, Carlton bookcase, 1981 — https://commons.wikimedia.org (search "Sottsass Carlton Memphis") — stacked primitives on a diagonal, Abet laminate patterns (viewed).
2. Memphis Milano interiors and objects — Commons "Memphis Milano design" — clashing laminate, terrazzo and black-and-white Bacterio against flat pastels (viewed).
3. Memphis Milano — https://www.memphis-milano.com — current official site; viewed only in its loading state (green and white bars), so of limited use.
4. Nathalie Du Pasquier — https://www.nathaliedupasquier.com — hand-made pattern collage, sticker-like labels on a notebook (viewed). Her 1981 table laminates are on Commons ("Nathalie Du Pasquier", viewed).
5. Camille Walala — https://www.camillewalala.com — contemporary Memphis: black triangles and zig shapes at architectural scale (viewed).
6. Adam Nathaniel Furman — https://www.adamnathanielfurman.com — glossy contemporary postmodern pattern, saturated pastels (viewed).
7. Christoph Radl, Memphis catalogue graphics 1981–86 — huge stacked type with pattern fills (not viewed).
8. Peter Shire, Bel Air chair — quarter circles and wedges in clashing colour (not viewed).
9. Sottsass, Tahiti lamp, 1981 (not viewed; the board's "TAHITI — NO. 07" label names it).

**Kill list**
- Full-pill controls: segmented "Design / Build / Launch" as rounded mint pills, the "Save direction" pill with a yellow circle, the black "Use recommended fonts" pill, white rotated status pills (A1/A2). Memphis furniture is slab, cylinder and semicircle, not capsule.
- "alive" in muddy accent-ink mustard with a salmon text-shadow (`.ab-hl`, radical-memphis.css L69).
- Wavy ink dividers used four times (A0–A2). That's groovy-70s's rule device.
- The pink/mint washed table rows (A2 "In use"), which read as a zebra-striped SaaS table.
- "Speckle top" (`pebbles` crumble): blurry, soft blobs. Bacterio and terrazzo are crisp-edged.

**Gaps (ranked)**
1. Scale. Radl's catalogues and Walala's walls are loud at type level too. Our headline is about 52px against a 330px object. Severity: high.
2. Shape grammar in the UI. The totem obeys Memphis grammar, but the controls are SaaS. Severity: high.
3. Black-and-white counterpoint. Memphis always sets saturated colour against black-and-white pattern (Bacterio squiggle, checker, grid). We have checker only in the footer and a little in the totem. Severity: medium.
4. Phone. The headline is about 26px with the totem below it. Severity: medium.

**Distinctness**
- vs neo-brutal-pop: shared stickers, offset sheets and four pattern families. **Memphis keeps** `festival`, `patchwork` and `zigzag`; neo-brutal-pop gives them up.
- vs groovy-70s: shared wavy rules and `patchwork`. **Memphis drops the wavy rule**, and groovy drops `patchwork`.

**Fixes**
1. **TOP: Make the headline furniture.** Set display to `clamp(44px, 9.5cqw, 120px)`, two lines. Set each line on its own laminate slab (line 1 on a white slab with Bacterio squiggle edge, "alive" on a solid secondary slab with ink text). Keep the -2.5deg tilt. Replace L69 with `.ab-hl { color: var(--ab-m-black); background: var(--ab-secondary); padding: 0 .12em; box-shadow: .08em .08em 0 var(--ab-m-sheet); text-shadow: none }`.
2. **TOP: Use the Memphis shape grammar for controls.** `.ab-seg-btn` gets radius 0, with each option a different primitive marker (the circle, triangle and square markers already exist, so make them 14px and keep them). `.ab-cta` becomes a rectangle with a single semicircle end cap (`border-radius: 0 999px 999px 0`), checker-filled arrow block. The fonts button becomes a black slab with radius 0. `.ab-row-status` (L213) becomes a tilted rectangle with radius 0.
3. **TOP: Phone hero.** Under 480px put the totem first, bleeding 10% off the right edge, with the headline on top at `clamp(36px, 11cqw, 48px)` overlapping the totem's base slab.
4. Section dividers: replace the wavy rule with a 10px black-and-white checker or Bacterio squiggle band. That leaves wavy rules to groovy.
5. Patterns, `fit.js` L286–293: replace `pebbles` (Speckle top) with a crisp Bacterio-style `festival` variant, `{loops: 1, weight: 0.9, echo: false}` mono, so there's a black-and-white field. Keep `patchwork` as lead (memphis owns it). Change `glyphgrid` to duotone false and black-and-white.
6. In-use table: make the first cell of each row a 56px pattern swatch (Bacterio, terrazzo, checker), with the rest of the row white and ink. No pastel washes.
7. Deck 05 interface: the lower half holds three 40px objects with labels. Scale them to 160px and arrange as a showroom vignette on a tilted floor slab (reuse the totem's base).

**Keep**
The "TAHITI — NO. 07" totem: stacked primitives, checker, dot and squiggle fills, offset coloured sheets, diagonal stance. It genuinely stands next to the Carlton logic. The rotated "Marigold Studio" slab logo. The tilted palette chips with wave-pattern fills. The checker footer.

**Deck**
- 01 cover: good composition, but the `patchwork` band at the bottom reappears as groovy's "Flower-power dots" (groovy Fix 6 resolves it).
- 05 interface: dead lower half (Fix 7).
- 06 material: the totem at full height, the strongest material slide in this batch.
- 07 patterns: "Speckle top" is soft (Fix 5).
- 08 product: generic dashboard (cross-cutting #2). Show a showroom room-set instead: floor slab, totem, one framed pattern.
- 10 closing: fine, but it's the same strip mechanism as every other closing slide.

---

## 5. bento-grid — 5/10 · Refine

It does what the brief asks, and that's the problem: equal-weight tiles, nested cards and a gold "alive" make it the Framer template, not Apple.

**References**
1. Apple iPhone — https://www.apple.com/iphone/ — "Get to know iPhone" cards: photography-led tiles, one line of copy, product as image (viewed).
2. bentogrids.com — https://bentogrids.com — curated bento gallery. The best entries mix one dominant tile, imagery and one huge stat (viewed).
3. Linear — https://linear.app — product UI as the hero tile, dark tiles, tight type (viewed).
4. Raycast — https://www.raycast.com — a single expressive rendered hero, then feature tiles (viewed).
5. Vercel — https://vercel.com — monochrome, a rendered 3D primitive, tiles kept to one radius (viewed).
6. Apple WWDC keynote recap slides, 2023–25 — the canonical bento: varied spans, imagery in most tiles (not viewed).
7. Apple Vision Pro marketing page — giant numerals in tiles, full-bleed image tiles (not viewed).
8. Apple iPhone 15 Pro features grid, 2023 — 2×2 hero tile with product render, 1×1 stats (not viewed; current page shows the successor cards).

**Kill list**
- The equal-height hero pair (A0). The headline tile is half empty below "Good design should feel alive", and nothing dominates.
- Three levels of radius: section tile, inner card, rounded swatch (A0 palette, A1 type). That's a card inside a card inside a card.
- Mustard "alive" (accent-ink) in the headline and in the deck's "idea.".
- The hover glow on the primary button (`--ab-pri-glow` shadow, the A2 "Hover" state) and the gradient pills.
- The pattern suite and deck patterns slide: bento has no pattern culture. "Tile glow" and "Gradient tiles" are soft-form's, and "Tile grid" is raw-brutalist's cover.

**Gaps (ranked)**
1. Imagery. Every top bento puts product imagery, render or photography in most tiles. Ours has one phone mock; everything else is text, flat swatches or a bar. Severity: high.
2. Hierarchy. The references have one 2×2 hero, 1×1 stats and wide bars. Ours is two equal halves, then uniform rows. The "In use" stats (72% at 2 columns) are the only place the rhythm works. Severity: high.
3. Craft. Apple's tiles sit on #F5F5F7 with no shadow. Ours add soft shadows on top of fill contrast. Severity: medium.
4. Phone. A plain one-column stack; Apple keeps 2-up 1×1 tiles on phone. Severity: low to medium.

**Distinctness**
- vs raw-brutalist: same deck cover band and closing mosaic (`modulargrid`). Raw gives it up (raw Fix 5), so bento keeps a tile motif.
- vs soft-form (outside this set): shared `gradpanes`, `tokens`, `aura`. **Bento must drop them.**
- vs neo-brutal-pop: none. Clearly distinct.

**Fixes**
1. **TOP: Set a real tile hierarchy.** Hero row: the headline tile spans 7 of 12 columns and 2 rows, with the headline at `clamp(44px, 7.6cqw, 104px)` bottom-aligned (`margin-top: auto`, not `margin: auto 0`, bento-grid.css L49). The phone tile spans 5 columns and 2 rows. Add a third row tile: a full-bleed primary-colour 1×1 holding one 120px numeral ("3 · projects").
2. **TOP: One radius level.** Remove the inner card backgrounds in palette and type. Each swatch becomes its own grid tile (5 tiles, colour fills the tile edge to edge, label inside at 13px). Each type specimen becomes its own tile with a 96px "Aa". Delete the section wrapper tiles.
3. **TOP: Highlight colour.** `.ab-hl` uses `var(--ab-primary)` (or a two-stop primary→secondary gradient clip, which is Apple's actual device). Never accent-ink. Fix the deck "idea." the same way.
4. Remove the soft shadows: the `.ab-in` children's `box-shadow: var(--ab-shadow)` (L29) becomes `none`, and hover is `transform: scale(1.01)`. Drop `--ab-pri-glow` (L76) and the gradient on buttons, keeping a flat primary fill.
5. Patterns, `fit.js` L142–149: drop `gradpanes`, `tokens` and `aura`. Lead with `modulargrid` `{gap: 1.6, merge: 1}` (bento now owns it), keep `parcels` and `pixelquilt`. Replace deck slide 07 with "Tile system": 1×1, 2×1, 2×2 and 1×2 tiles annotated with spans, gap 14px and radius 28px. That's bento's real material.
6. Imagery: add one image tile in the interface section (a cropped rendering of the phone at 3× scale, or an abstract product render from the primary) so it isn't all copy.
7. Phone: keep the palette and stats as 2-up 1×1 tiles. The hero phone tile becomes square and crops the device.

**Keep**
The "In use" stat tiles (huge 72% / 45% / 10% numerals with one tinted 2-column tile) are honestly Apple-grade. The primary "Save direction" tile, a whole tile as the action. The phone mock with floating "72% on track" and "Direction saved" chips.

**Deck**
- 01 cover: the `modulargrid` dots, bars and plus band is raw-brutalist's cover. Use a tile mosaic of the board's own tiles instead.
- 06 material: repeats the hero phone mock verbatim.
- 07 patterns: irrelevant to the style (Fix 5).
- 08 product: generic dashboard, ironically the one style where a dashboard fits, but it should be in tiles.
- 10 closing: the raw-brutalist mosaic column. Replace it with a 3×3 tile wall of the board's tiles at 20% scale.

---

## 6. groovy-70s — 5.5/10 · Refine

The arch and echo type have real conviction, but they contradict their own rules. The pastel bands, the client teal and a 20px phone headline undo it.

**References**
1. Barbara Stauffacher Solomon, Sea Ranch supergraphics, 1966–67 — https://en.wikipedia.org/wiki/Barbara_Stauffacher_Solomon — flat solid bands and arcs at architectural scale, no tints (Commons thumbnail viewed).
2. Alexander Girard, Braniff International "End of the Plain Plane", 1965 — solid saturated colour fields, hot pink and orange (Commons textile viewed; the Braniff Wikipedia page was also viewed).
3. Milton Glaser, Bob Dylan poster, 1966 — flat rainbow hair bands and silhouette (not viewed: MoMA bot wall, nothing on Commons).
4. Jones Knowles Ritchie, Burger King rebrand, 2021 — "Flame" fat soft type and a fixed earth palette (not viewed: 404).
5. Wes Wilson, Fillmore posters, 1966–68 — lettering that fills the shape (not viewed).
6. Herb Lubalin, Avant Garde and U&lc — tight 70s display setting (not viewed).
7. Rob Janoff, Apple rainbow logo, 1977 — horizontal solid bands, the earth-adjacent 70s ramp (not viewed).
8. 1970s US supergraphics, wide survey (not viewed; Commons search empty).

**Kill list**
- The pastel inner bands of the arch (A0: two cream-yellow tints inside the solid bands). The deck do/don't (09) says "Don't use … pastel tints". The style contradicts itself on its own cover.
- Client teal in a 70s ramp: palette pill "Secondary", the cover band's teal rings, "Rainbow rise" and "Corner stripes" in teal, the closing strip. A 70s palette is earth: brown, burnt orange, harvest gold, avocado.
- "Far out" yellow pill (A0), white status pills, the segmented pill, the font button pill. There are too many capsules, and the pill becomes the SaaS tell.
- The headline straddling the arch's feet (A0: "feel alive" sits half above, half below the base line). It reads as misregistered, not composed.
- "Flower-power dots" (`patchwork`), which is memphis's terrazzo.

**Gaps (ranked)**
1. Colour logic. The references use a fixed earth ramp in solid fills. Ours is client-driven with tints. Severity: high.
2. Phone. `clamp(24px, 8.2cqw, 36px)` (groovy-70s.css L182) gives about 20px echo type inside the arch (D-tops, column 2). The echo shadows turn to mush at that size. Severity: high.
3. Type-in-shape. Wilson and Glaser make lettering fill or follow the shape. Ours centres text inside an arch with no relationship to the curve. Severity: medium.
4. Deck. The cover arch is small, pushed left, and the lower half is empty. Interface slide buttons render desaturated. Severity: medium.

**Distinctness**
- vs neo-brutal-pop: shared rainbow `arcrise`. **Groovy keeps it**; neo-brutal-pop drops it.
- vs bauhaus-poster: shared `oprings` and `ribbonrise`. **Groovy keeps them**; Bauhaus drops them.
- vs radical-memphis: shared `patchwork` and wavy rules. **Groovy keeps wavy rules and drops `patchwork`**.

**Fixes**
1. **TOP: Solid arch, earth ramp.** In groovy-70s.js `art()`, draw 6 solid bands with no tint fills and the inside left as canvas. Use a fixed ramp for art and patterns only: `#6E3421` brown, `#C8471E` burnt orange, `#E38B1F` orange, `#F2B62A` harvest gold, `#8C8F2A` avocado. Client primary maps to the CTA and one band, never the whole ramp. Add an `earth` colorway in `fit.js` and use it for all six groovy entries.
2. **TOP: Phone headline.** Change L182 to `clamp(40px, 12.5cqw, 56px)`. Under 480px, reduce the echo `text-shadow` (L62) to two layers (`.035em` gap and `.07em` primary), and let the headline sit below the arch at full width, with the arch as a cropped half-dome above.
3. **TOP: Lock the headline to the arch.** Either bottom-align the last line's baseline to the arch base (`.ab-hero-copy { margin-top: calc(-1 * var(--gv-arch-inner-h)) }` with the copy block sized to the inner radius), or move all copy below the arch. No straddling.
4. Replace the "Far out" pill with curved text on the arch's inner band (SVG `<textPath>` along the innermost arc, Bagel Fat One, 14px, letter-spacing .2em). That's real 70s lettering logic and removes one pill. Status chips get the same treatment as palette rows: full-width solid band pills only, so no white mini-pills.
5. Interface states: the deck 05 Save buttons render about 70% saturation (rest and pressed look washed). Use the board's solid primary, with pressed as the darker `--ab-pri-dark`.
6. Patterns, `fit.js` L174–181: remove `patchwork` ("Flower-power dots") and replace it with `waves` (organic2), set to 4 solid bands, low amplitude. Keep `arcrise`, `ribbonrise`, `burst` and `oprings`, which groovy now owns.
7. Deck cover: set the arch at 85% slide height, centred, bleeding off the bottom edge, with the headline under it at 72px. Remove the teal ring band.

**Keep**
The stepped echo headline (ink with gap, accent, gap, primary) in Bagel Fat One. The concentric rounded-frame interface card with the sunburst foot. The brown type card. The wavy triple rules. Of the six boards this one has the most personality per square inch.

**Deck**
- 01 cover: a small arch top-left plus a cropped teal and black rainbow band at the bottom (Fix 7).
- 03 color: pill bars are right for the style, but the teal bar sits in a 70s ramp.
- 05 interface: washed buttons (Fix 5).
- 06 material: repeats the hero arch.
- 07 patterns: "Flower-power dots" is memphis's (Fix 6).
- 08 product: generic dashboard (cross-cutting #2). Use an LP sleeve or packaging front instead: square sleeve, arch, curved title.
- 09 do/don't: "Don't … pastel tints" is broken by the hero (Fix 1).
- 10 closing: the left wave strip is the best closing in this batch. Keep it, minus the teal.

---

## Priority order for the build team
1. Pattern ownership (`js/patterns/fit.js`). One edit clears six distinctness failures: raw Fix 5, neo Fix 6, bauhaus Fix 5, memphis Fix 5, bento Fix 5, groovy Fix 6.
2. Per-aesthetic `deck.productStage` and the neo-brutal-pop material slide (`js/brand-deck.js` L322 and L345).
3. Fixed style palettes for bauhaus-poster (primaries) and groovy-70s (earth ramp) on art and patterns.
4. Hero scale on neo-brutal-pop, radical-memphis, bento-grid and the groovy-70s phone layout.
5. Raw-brutalist: flatten the shadows and add the default-HTML voice.

---

## Fix log (fx62)

Worker fx62 (FX6-2, packet rev 2). Files changed: `js/aesthetics/{raw-brutalist,neo-brutal-pop,bauhaus-poster,radical-memphis,bento-grid,groovy-70s}.js` and the matching `css/aesthetics/*.css`. No shared files touched. Evidence is in `S/adv/fx62/`: board sheets `sheet-fx62-<key>.png` (A/B/C/D), deck sheets `sheet-deck-<key>-rec.png` / `-oth.png`, and `gore.json`.

**raw-brutalist**
- Fix 1 (top): done. `--rb-shadow: none`. The card, CTA and states are flat. Hover inverts to ink, pressed takes `outline 2px ink, offset -6px`, and the input focus is a 3px ink outline.
- Fix 2 (top): done. The sub-line, footer influences, "Use recommended fonts", the pair line and the deck footer page number all render as Times with `#0000EE` underlined links (visited `#551A8B`). On a dark canvas they use `#9EB8FF` / `#C9A2FF`, because `#0000EE` fails contrast there.
- Fix 3 (top): done. Hero padding-bottom is `clamp(20px,3cqw,40px)`. Mono ticks `01…12` sit on the hero grid. The board headline is sized so "SHOULD" reaches the right edge (961px against a 936px hero, bleeding into the pad). The spec index is now a full-width `ID / ITEM / STATE / UPDATED` table under the headline.
- Fix 4: done. Status chips are ink outline only.
- Fix 5: deck material art done. The art carries a wireframe of the board (`DIV.hero 1280×640`, `UL.rows 3`…), shown only on the Material slide, and `materialStage:'pattern'` is removed. The suite is under SHARED.
- Fix 6: under SHARED (fonts).
- Fix 7: done. Do/don't marks are mono `[x]` / `[ ]`.
- Deck: the Save states on 05 are sized to content. The 09 "monochrome" line is replaced with "Color only in the swatch strip and one band."

**neo-brutal-pop**
- Fix 1 (top): done. The hero is split, with a left-set headline at `clamp(56px,10.2cqw,150px)` across three lines. "alive" is a -4deg yellow sticker block with a 2px ink border and a 6px shadow. The art is a cluster of UI-object stickers: a "$1" price tag on a string, a NEW starburst, a checkbox and a cursor, each 3px ink with a hard shadow. The base is 11.5cqw times the 0.86 length scale; I trimmed it to 10.2 so it holds three lines in the copy column.
- Fix 2 (top): done. The headline pseudo-stickers are deleted, so nothing sits on text in the board or the deck. Stickers appear only in the art (cover) and as a closing-slide starburst in the gutter. Gore reports 0.
- Fix 3 (top): done. The Material slide is a die-cut sticker sheet: a paper rectangle, 2px border, 8px shadow, 3×2 objects at 120px with 18px labels. "Get started" is removed.
- Fix 4: done. The canvas is paper. The type section is a 100% primary field and "In use" is a 100% accent field, with paper cards inside. The 32px grid is removed.
- Fix 5: done. One rotated (-2deg) paper card holds a 160px "Aa" with the picks as a one-line ramp. The pairings change is under SHARED.
- Fix 6: under SHARED.
- Fix 7: done. Status chips are solid secondary with a 2px border and 6px radius. Text uses `--ab-on-secondary` rather than ink, so it stays readable in dark mode.

**bauhaus-poster**
- Fix 1 (top): done. The art is a constructed poster: a red circle at 0.62W, a black bar at -24deg (0.09W), a yellow square at 0.28W off-axis, a blue half-disc and a thin parallel rule. The art width is `clamp(220px,46cqw,560px)`. It starts at the headline's third line, so it overlaps only the tail of line two and stays under the type.
- Fix 2 (top): done. A `.ab-hero::after` ink bar crosses at -12deg behind the headline. The kicker is a solid 28px red bar with the label reversed in 12px bold caps. The principle number discs step down a diagonal (red discs) on the deck. The closing slide gets a diagonal bar.
- Fix 3 (top): done. `BP_INKS` holds the fixed primaries (#D7332A / #F2C230 / #1F4FA2 / #151515 on #F1ECE2) for the art, the highlight word and the kicker. The client primary drives only the CTA, selection and switch; the green palette still prints a red, yellow and blue poster. On a dark canvas the black marks reverse to paper. The `primaries` colorway is under SHARED.
- Fix 4: done. Status, fit stamp and fonts button are square with no fill.
- Fix 5: under SHARED.
- Fix 6: done. The board headline is 16.4cqw times the length scale and spans the measure. "alive" changes to red as a whole word (`--bp-red-text`, contrast-checked). There is a 6px ink rule above the headline.
- Fix 7: done. On phones the poster is tilted -8deg and bleeds 12% off the right edge.
- Deck: the cover poster is about 430px (60% of the slide) and replaces the stripe band. Material shows the poster with dimension annotations (Ø 0.62, −24°, 0.28, BAR 0.09).

**radical-memphis**
- Fix 1 (top): done. The headline is `clamp(44px,9.5cqw,120px)`, tilted -2.5deg. A new `headline()` hook puts each line on a paper slab with a squiggle edge and "alive" on a solid secondary slab with a primary-tint offset sheet. The `.ab-hl` rule is as specified, with the text colour contrast-picked (`--ab-m-on-sec`). It sets in three lines, not two, because the art column takes the rest of the width.
- Fix 2 (top): done. The segmented control is radius 0 with 14px circle, triangle and square markers. The CTA is a slab with one semicircle end and a checker arrow block. The fonts button is a black slab, the status chip is a tilted rectangle, and the fit stamp is square.
- Fix 3 (top): done. On phones the totem comes first and bleeds 10% off the right; the headline at `clamp(36px,11cqw,48px)` overlaps its base slab.
- Fix 4: done. Dividers are a 10px black-and-white checker band. The CSS `mask` on the rule and on the chip squiggles is replaced with background images, which also makes them export-safe.
- Fix 5: under SHARED. A `glyphgrid` black-and-white entry is impossible because glyphgrid becomes raw's exclusive lead, so I substituted other families.
- Fix 6: done. Each in-use row opens on a 56px Bacterio, terrazzo or checker swatch; the rows are paper and ink with black rules, and the pastel washes are gone.
- Fix 7: done. Deck 05 states are 120px objects (about 144px after zoom) on a skewed terrazzo floor slab.

**bento-grid**
- Fix 1 (top): done. The headline tile spans 7 columns and 2 rows, with the headline at `clamp(44px,7.6cqw,104px)` bottom-aligned. The phone tile is 5×1. A full-bleed primary numeral tile ("3", "Projects in motion") is built from the hero's ::before/::after, which become grid items because the hero is `display:contents`.
- Fix 2 (top): done. There is one radius level. Palette and type wrappers dissolve into the board grid; each swatch is a filled tile (canvas spans 4 columns, the rest 2) and each specimen is a tile with a 96px "Aa".
- Fix 3 (top): done. `.ab-hl` uses `--ab-primary-text`, including the deck's "idea.". I did not use a gradient-clip version because html2canvas cannot export `background-clip:text`.
- Fix 4: done. All soft shadows, `--ab-pri-glow` and the art gradient are gone; hover is `scale(1.01)`.
- Fix 5: suite under SHARED. The deck Material slide now shows the "Tile system" (2×2, 2×1, 1×1, 1×2, gap 14, radius 28) in place of the repeated phone. Replacing slide 07 itself needs a framework hook.
- Fix 6: done. The interface row has an image tile: a lit primary sphere render on its own shadow.
- Fix 7: done. On phones the palette is 2-up (canvas full width), stats stay 2-up, and the phone tile is square and crops the device.

**groovy-70s**
- Fix 1 (top): done. The arch is six solid bands with no tints and a canvas interior. They come from a fixed earth ramp (`GV_EARTH` #6E3421 / #C8471E / #E38B1F / #F2B62A / #8C8F2A) with the client primary as the single brand band. The echo and the stripes also use the ramp. The `earth` colorway is under SHARED.
- Fix 2 (top): done. On phones the headline is `clamp(40px,12.5cqw,56px)` with a two-layer echo, and the arch is a cropped half-dome above it.
- Fix 3 (top): done, using the "move all copy below the arch" option. Nothing straddles the arch.
- Fix 4: done. "far out" is lettered on an SVG textPath along the inner curve in place of the pill. Status chips are plain lettering on the band. The tabs and fonts button are arch-topped instead of capsules.
- Fix 5: done. The ~70% wash came from `opacity:.8` on `.ab-state`; it is removed. Pressed uses `--ab-pri-dark`.
- Fix 6: under SHARED.
- Fix 7: done. The cover arch is 1000px wide (about 560px tall, ~78% of the slide), centred and rising from behind a cream ground band, with the headline at about 72px (`coverDisplay .55`). The teal ring band is hidden on this cover. The wavy rule's CSS `mask` is replaced with a background-image wave.

**Verification**
- Board: `board.sh` for all six (24 shots) gives `overflow=0` on every shot.
- Gore: `gore.sh` on the six keys, 4 configs each (24 combos), reports **0 issues**.
- `node tests/run.js`: all passed.
- `harness.js`: 0 failures for these keys. The remaining FAILs are retro-futurist and wabi-sabi placeholders, which belong to other workers.
- `src-verify-p5.js`: families 53, fails 0, map mismatches 0.
- Console: the only error is the pre-existing favicon 404.
- Blend donor smoke test: all six render as donor art on another base with no errors.

**Still short (honest re-score)**
- raw-brutalist: 6.5. The default-HTML voice and flatness land. The cover and closing still carry the modulargrid band until fit.js changes, and the product slide is still the SaaS dashboard.
- neo-brutal-pop: 6.5. The hero now reads as Gumroad. The stickers are flat vector, not 3D objects like Gumroad's coins. The cover and closing still show groovy's rainbow until fit.js changes.
- bauhaus-poster: 7. This is the biggest jump: constructed, diagonal, fixed primaries. The patterns slide is still op-art until fit.js changes.
- radical-memphis: 6.5. The headline is furniture and the controls are slabs. The totem shrank because the copy column grew. "Speckle top" remains until fit.js changes.
- bento-grid: 6.5. It has hierarchy, one radius level and a render tile. Imagery is still thin compared with Apple, and slide 07 is still patterns.
- groovy-70s: 7. The arch is solid earth and the headline is locked below it. The palette strip and the deck colour slide still show the client teal, because the palette must show the client's roles.

## Adoption log (fx62)

This is the adopt pass, packet rev 3. It was shot after the SH shared-changes worker had landed the fit.js suites, the meta fonts and the `primaries` / `earth` colourways. Only my six aesthetics' js/css files changed. Diff line counts are against HEAD, so they include the fx62 fix round.

**raw-brutalist** (+82 / -39)
- `def.deck.materialArt` now draws the board wireframe. It was removed from `art()`, along with the 9 `.ab-slide[data-slide="material"]` toggle rules.
- `def.deck.marks = { do: '[x]', dont: '[ ]' }` replaces the `font-size:0` / `::before` mark hack (6 lines deleted).
- New `def.deck.product`: an unstyled Apache "Index of /…/projects" page. It has Times type, default blue and visited links, `<hr>` rules, grey browser buttons and an italic server signature.
- Deleted the redundant slide-footer 16px rule; the framework's (0,2,0) footer rule lets the board rule apply.
- Weights: the heading face is now `var(--rb-hw)`, the heaviest real weight from FONTS. That is 400 for Archivo Black, so no more 600/700/900 requests on it.

**neo-brutal-pop** (+133 / -71)
- `def.deck.materialArt` draws the sticker sheet. The sheet is removed from `art()`, and the shared SVG pieces moved into an `npKit()` helper.
- The 4 Material toggle rules are deleted.
- New `def.deck.product`: a Gumroad-style product page. An accent cover holds an initial disc, a NEW starburst and a $1 tag, beside a title, description, price sticker, rating and an "I want this!" chunky CTA.
- Weights: `--np-hw` for the heading face (Bricolage, 800) and `--np-uw` for the UI face (DM Sans, 700) replace every 600/800 request.
- `--ab-type-pick-w` is now 400, and 3 stray `!important`s on the type picks are removed.

**bauhaus-poster** (+96 / -48)
- `coverBand: false` replaces the `.ab-deck-pattern` hiding and the `padding-bottom … !important`.
- `materialArt` returns the poster with its dimension notes, through a new `bpPoster(ctx, notes)`. The `.bpa-note` CSS toggles are deleted.
- New `def.deck.product`: an exhibition wall with three posters (A1, A2, A4) on an ink rail, printed in the fixed inks, with captions.
- Weights: Jost only has 400 and 600, so every 700/800 became 600 and every 500 became 400. Deck pchip, pname, ptitle and mark are at 600.

**radical-memphis** (+57 / -8)
- New `def.deck.product`: a showroom room-set. It has a framed Bacterio laminate, the Tahiti totem on a skewed terrazzo floor slab, a semicircle-and-checker side table and a paper plaque.
- Weights: DM Sans 600/800 requests became 700. Heading-face labels use `var(--mm-hw)`, which resolves to 400 for Archivo Black.

**bento-grid** (+75 / -48)
- `def.deck.patternsStage` now holds the "Tile system": 2×2, 2×1, 1×1, 1×2 and an action tile, annotated "gap 14 · radius 28 · no borders".
- `def.deck.materialArt` is a small bento of the tile materials: a render tile (sphere), a numeral tile, a colour tile and a flat tile.
- Removed `.bna-sys` from `art()` and its 7 Material toggle rules.
- Fractional weights (550, 560, 580, 620, 640, 650) are snapped to 600.
- The default In product slide is already native here (tiles), so no product hook.

**groovy-70s** (+72 / -23)
- `coverBand: false` replaces the `.ab-deck-pattern` hiding and the `!important` padding.
- New `def.deck.product`: an LP sleeve. The sleeve carries the solid earth arch with the brand lettered along the outer curve; the record slides out to the right, and an A-side track list sits beside it as solid band pills.
- Deleted the dead `.ab-deck-ctacard` rule and the unused `--gv-wave` mask variable.
- Weights: Work Sans 700 became 600 and 500 became 400. Bagel labels use `var(--ab-hw)`, which is 400.

**Not adopted, deliberately**
- `def.states` / `def.panels`: no board fakes panel markup with CSS generated content, and no review asked for a different states component.
- `layout.order` / new hero and palette kinds: each board's structure was already made distinct in the fx62 round. Bento re-grids into tiles, and Bauhaus, Groovy and Memphis have their own heroes. More would be churn.

**Checks**
- Board shots: 24 at `overflow=0`, no console errors.
- Gore: 4 configs × 6 keys = 24 combos, 0 issues.
- Missing-weight scan on board plus all deck slides: 0 for all six keys.
- `node tests/run.js`: all passed.
- `harness.js`: 0 FAIL, briefs 192 fails 0.
- `src-verify-p5.js`: families 53, fails 0, map mismatches 0.

Sheets are in `S/adv/fx62/ad/`:
- Boards: `sheet-ad-<key>.png`
- Decks: `sheet-deck-ad-<key>.png` (recommended mode) and `sheet-deck-ado-<key>.png` (other mode)
- Gore: `gore2.json`
