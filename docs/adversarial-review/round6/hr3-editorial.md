# HR3 harsh review (round 6): Editorial Serif, Neo Deco, Dystopian Luxury, Mixed Type, Rebus, Micrographics

Reviewer: HR3 (Opus, read-only). Packet rev 1. Date: 2026-10-11.

**What I looked at.** For each key: `r6-<key>-A.png` at full size, the `D` phone capture, `sheet-r6-<key>.png` (A|B|C|D), `sheet-deck-<key>.png`, and the full-size cover, product and do/don't slides. Zoomed crops are in `adv/hr3/`: `mg-hero.png`, `nd-hero.png`, `nd-green-dl.png`, `rb-tabs.png`, `phones-top.png`, `deck-product-crops.png` and `neigh.png`. For distinctness I also looked at the neighbouring sheets for Religious Futurism, Aurora Noir and Raw Brutalist.

**References.** I captured these headlessly into `adv/hr3/refs/`, with contact sheets in `adv/hr3/sheet-*.png`. Some sites wouldn't load. The Atlantic and T Magazine were blocked (403 and bot wall). SSENSE and Acronym showed a Cloudflare CAPTCHA, which I didn't solve. balenciaga.com returned Access Denied. Veilance and Experimental Jetset didn't resolve or refused the connection, paul-rand.com had a certificate error, Nike ISPA returned a 404, and the Art of the Title Gatsby page returned a 404. Anything I couldn't see is marked "(not viewed)" and cited from my own knowledge of the work. I also looked at the Rebus images ADV-1 had already captured (`adv/adv1/refs/img/eod-*`).

**What applies to all six (fix once, in shared code).**

1. **The "In product" slide is the same SaaS mock in every deck.** It has a 264px grey sidebar, a tinted rounded CTA card, a rounded "3 active" pill chip and coloured status dots. Everything is rounded by `--dk-r`, which `js/brand-deck.js:414` takes from the *user's shape preset* (`state.shapePreset.radiusLg`), not from the aesthetic. That's why square-cornered styles (Editorial Serif says "0–2px", Dystopian Luxury says "0") show ~6–12px corners on this slide (`adv/hr3/deck-product-crops.png`). Fix: each aesthetic declares `deck.radius` (0 for five of these six) and `brand-deck.js` uses it before the shape preset. Drop `.ab-deck-chip` and `.ab-deck-dot` (`css/brand-deck.css:211,216`) unless the aesthetic opts in.
2. **The Do/Don't slide uses teal-tint check discs.** `.ab-deck-mark` (`css/brand-deck.css:234`) is a 30px circle in `--ab-sec-tint`, which is the Bootstrap alert-list look. None of these six styles would ever draw a tinted disc. Replace it with a per-aesthetic glyph hook (`def.deck.mark = ['✓','✕']` as text, no disc). The defaults should be a typeset "Do" and "Don't" set in the label face.
3. **The pattern suites are a generic pattern library dressed with the brand colours.** The first entry in `js/patterns/fit.js` drives the cover band and the closing strip. For four of the six it puts the *client* orange, teal and yellow into a field the style would never colour (Neo Deco chevrons, Mixed Type zigzag and fly-poster, Rebus target and stripes). The rest are the same textures every other aesthetic gets: stipple, halftone, marble, contours.

---

## 1. Editorial Serif — 5/10 · Refine

A clean hairline-and-masthead kit that would pass as a Squarespace "Magazine" template, but not as a page from any magazine on the reference list.

### References
1. The Gentlewoman — https://thegentlewoman.co.uk — The cover photo carries the page. The masthead is lowercase Futura/Lyon (per Fonts In Use) and type stays tiny and quiet around one huge image. (viewed)
2. Fantastic Man — https://www.fantasticman.com — A full-width wordmark spans the page edge to edge, one image fills the page, and the captions are 9pt with arrows. The scale contrast is extreme: about 120px against 9px. (viewed)
3. Apartamento — https://www.apartamentomagazine.com — Full-bleed reportage photo with the coverline set *on* the image. (viewed)
4. Kinfolk — https://www.kinfolk.com — Wide-tracked caps masthead and a centred cover with huge margins. Restraint here comes from emptiness, not from rules. (viewed)
5. The Paris Review — https://www.theparisreview.org — A big block of colour holds the season in heavy caps beside a dense black table of contents. Two weights of information sit side by side. (viewed)
6. The New Yorker — https://www.newyorker.com — Irvin caps headline, centred deck in the text serif, and an illustration that holds half the screen. (viewed)
7. NYT Magazine on Fonts In Use — https://fontsinuse.com/search?terms=new+york+times+magazine — Each cover is a single typographic idea at enormous scale ("WHO MADE THAT?"), set in a custom Cheltenham/Stymie/Times family. (viewed: search grid)
8. The Gentlewoman on Fonts In Use — https://fontsinuse.com/search?terms=gentlewoman — The system is Futura plus a book serif. The magazine voice comes from the hierarchy, not from a display serif. (viewed)
9. The Atlantic 2019 redesign (Mendelsund/Munday) — https://www.theatlantic.com/magazine/ — A custom didone, a giant italic "A" and a single black or red field. (not viewed: 403)
10. T: The New York Times Style Magazine — https://www.nytimes.com/section/t-magazine — Blackletter T plus a didone, with photos that run off the page. (not viewed: bot wall)

### Kill list
- **The cover plate is a stand-in for a photograph** (A: the 256×330 brown square at top right; deck cover: a 160px stamp). Every reference above is carried by an image. A cropped "M" on a muddy primary-into-ink duotone (`--ab-eds-plate: mix(primary, ink, .35)`, which comes out as #6B3528 on the warm palette) reads as a book-club placeholder.
- **The drop cap on a two-line card body** ("A / little structure. Room to play.", A at x=39 y=1380). A drop cap on 9 words is a typesetting error, not a flourish.
- **The italic "alive" in mustard** (`--ab-accent-ink` from #FFC914 shades to roughly #B98208). That's client yellow pushed into the headline. Real editorial accents are ink-italic or one house colour, and they're never derived from a yellow brand swatch.
- **The SAVE / SAVE / SAVE state strip** (A: x=540–845 y=1448). It's three coloured bricks, and orange next to oxblood reads as a broken palette, not a magazine.
- **The "3 active" pill, rounded app card and teal check discs on deck slides 8 and 9.** All are template tells (see the shared issues above).
- **The cover band and closing strip are stipple dots** (deck 1 and 10). They're noise with no editorial meaning. "Pinstripe" (piano keys), "Plate studies" and "Endpaper" marbling on slide 7 come from three other aesthetics.

### Gaps (ranked)
1. **Scale contrast.** The best work goes from about 120–200px display to 8–9px captions. Ours goes from about 95px (A headline) to 10.5px, and the headline sits in a 550px column with a 300px empty gutter beside the plate. On the deck cover the headline is ~70px on a 1280px slide. Severity: high.
2. **Image.** The best work runs a full-bleed photograph or illustration. Ours has a tonal letter on a brown square. Severity: high.
3. **Typographic voice.** The best work uses a didone or a custom serif with real optical sizes (Cheltenham, Irvin, Lyon Display). Our recommended heading is Instrument Serif, the condensed 2023 landing-page serif. It gives a "startup that reads" voice, not a magazine. Bodoni Moda is in the picks list but isn't the default. Severity: medium-high.
4. **The editorial grid.** The best work has a real multi-column text block, a pull quote, folios and a byline. Ours has no running text at all. The "standfirst in two columns" promised in the JS header comment isn't on screen. Severity: medium.
5. **Phone.** Ours is the desktop stack in one column. The plate becomes a 290×290 brown square and the type list repeats in full. No magazine app does this. Severity: medium.

### Distinctness
The nearest neighbours are **Mixed Type** and **Dystopian Luxury**. Mixed Type is a sibling: same warm-cream canvas, same Instrument Serif heading default, same italic mustard last word, same hairline-and-label rhythm, same "§ Set it like a page." / "● Many voices, one page." italic footer. Verdict: **siblings**. Editorial Serif should keep the light serif page and move toward *image plus extreme type scale*. Mixed Type has to move further (see section 4). Dystopian Luxury is distinct enough.

### Fixes (ranked)
1. **[TOP] Make the hero a magazine cover, not a column beside a stamp.** In `js/aesthetics/editorial-serif.js` `art()` and `css/aesthetics/editorial-serif.css:56,75–95`: the plate becomes full-width (`grid-column: 1 / -1`) at an aspect ratio of 4:5 on desktop. Set the masthead wordmark in the heading face at `font-size: 15cqw` across the top of the plate, with tracking at `-0.02em` and the wordmark touching both edges. Set the headline over the lower third in canvas colour. Replace the cropped initial with a real duotone *image slot* (use `ctx.logo` or a brand image if present, otherwise a greyscale still-life SVG from `Patterns`' `inkstill` family). Keep the Fig. 1 caption.
2. **[TOP] Change the default heading to a didone and lift the scale.** In `js/aesthetic-meta.js:142`, the pairings become `[['Bodoni Moda','Newsreader'], ['Playfair Display','Source Serif 4'], ['Instrument Serif','Newsreader']]`. Set `font-variation-settings: "opsz" 96` on the headline. Set the `--eds-hl` clamp to `clamp(64px, 14cqw, 168px)` so the headline reaches about 2× its current size. Captions stay at 9–10px. That gives the 15:1 contrast the references have.
3. **[TOP] Use a fixed ink italic for the accent instead of client yellow.** At `editorial-serif.css` line 60 `.ab-hl`: set `color: var(--ab-ink)` with `font-style: italic` (the "contrast, not colour" rule the style claims). If a brand colour must appear, use primary at ≤3% as a 1px rule under the folio, never yellow in a headline.
4. **Add a real text block.** In section 02 ("Page"), replace the form with a two-column standfirst plus body: about 120 words of placeholder copy in the body serif at 15/22, a 3-line drop cap only here, a pull quote in heading italic at 28px between hairlines, and a byline and folio. Move the form into the deck "Interface" slide only.
5. **Kill the three-colour state strip.** Show the states as one button with `REST` / `HOVER` / `PRESSED` set as small-caps captions under hairline ticks, with ink-on-paper hover and press only (`--ab-eds-ink-hover`). Remove `--ab-eds-primary-press`.
6. **Remove the drop cap from the card body.** At `editorial-serif.css` `.ab-card-body::first-letter`, keep it only in fix 4's long text.
7. **Phone.** Below 480px, the plate becomes full-bleed (`margin-inline: calc(var(--ab-pad) * -1)`) with the headline over it. Collapse the type list to the selected pair only.
8. **Pattern suite** (`js/patterns/fit.js:110`): lead with `weave` as a hairline 1px column rule, not "Pinstripe" piano keys. Drop `marble`, `specimens` and `stipple` and replace them with `halftone` newsprint at `cell: 0.9`, plus a typeterrain made of the brand's own text set as a justified column.

### Keep
- The thick-over-thin masthead rule. The contents-list rows with dotted leaders and italic numerals (03 — In use) are the best thing on the board, and they belong next to Paris Review's table of contents.
- Small-caps sans labels at about .14em tracking.

### Deck
- **01 Cover:** the headline is 70px, the plate is a 160px stamp, and there's a stipple band. Rebuild it as fix 1 at slide scale: the plate fills the right 55%, with the masthead across the top.
- **02 Principles:** acceptable. "Set it like a page." in italic mustard repeats the leakage.
- **03 Colour:** about 60% of the slide is empty, and the proportion bar plus three "Aa" chips is the same template every aesthetic gets. Show the palette as a magazine colophon instead: "Printed on #F5F2EB with #2E282A".
- **06 Material:** the brown plate again, at 190×250. That makes three appearances of one asset in ten slides.
- **07 Patterns:** five of six tiles aren't editorial (see the kill list).
- **08 Product:** shared SaaS mock, rounded and tinted.
- **09 Do/Don't:** teal discs.

---

## 2. Neo Deco — 3/10 · Rework

A Gatsby-party e-invite. The ornament set is real, but the metal is the client's yellow, the type is too thin to be deco, and it's a twin of Religious Futurism.

### References
1. Chrysler Building crown (William Van Alen, 1930) — Wikimedia Commons search "chrysler building crown" — Stepped, *nested* sunburst arches in stainless steel, with triangular windows radiating from one centre. The geometry is hard-edged and repeated, never a soft fade. (viewed: thumbnails)
2. Radio City Music Hall auditorium (Donald Deskey / Edward Durell Stone, 1932) — Commons search "radio city music hall interior" — Concentric proscenium bands of warm gold light. The sunburst is *architecture*, made of bands, not rays. (viewed: thumbnails)
3. Daily Express Building lobby, London (Robert Atkinson, 1932) — Commons search "daily express building lobby" — Silver-and-gold relief panels with dense figurative detail inside geometric frames. (viewed: thumbnails)
4. Art deco sunburst mirrors and furniture — Commons search "art deco sunburst" — Alternating long and short rays radiate from a central disc. The rays have *two lengths*, which is what makes them deco rather than "beams". (viewed: thumbnails)
5. A. M. Cassandre, Dubonnet mural and posters (Normandie, Étoile du Nord) — Commons search "cassandre poster" — Airbrushed geometry, monoline geometric caps and heavy thick/thin contrast. (viewed: the Dubonnet wall; the Normandie poster not viewed)
6. Claridge's, London — https://www.claridges.co.uk — A real deco hotel. Today's identity is a thin roman serif in caps on photography. The deco lives in the building, not in ornament piles. (viewed)
7. The Ned, London — https://www.thened.com — Serif small caps, an italic "of" and "in" in the tagline, and burgundy and brass. Restraint over costume. (viewed, under a cookie banner)
8. Broadway (Morris Fuller Benton, 1928) — https://fontsinuse.com/typefaces/1159/broadway — An extreme fat/hairline geometric display face. That is the deco *typographic* voice. (not viewed: the URL served Typo American)
9. Erté — https://en.wikipedia.org/wiki/Ert%C3%A9 — Attenuated figures and calligraphic line in gold on black. (viewed: page only, no works)
10. *The Great Gatsby* (2013) titles and production design by Catherine Martin — Gilded linework, but always with *Broadway-class* fat display caps and dense fans. (not viewed: Art of the Title page 404)
11. Sexy Fish, London (Martin Brudnizki) — https://www.sexyfish.com — Neo-deco hospitality with a thin-line serif wordmark on very dark photography. (viewed, under a cookie banner)

### Kill list
- **The gilt is the client accent.** In `js/aesthetics/neo-deco.js:72`, `const gilt = t.accentInk`. On the warm palette the "metal" is lemon #FFC914 (A). On the green palette every ray, frame and diamond turns mint #A8D5BA (C, `adv/hr3/nd-green-dl.png`), and "ALIVE" nearly vanishes. Metal is a material, not a brand role. This is the worst palette leakage in my set.
- **The orange and teal chevron band on the deck cover and the full-height chevron strip on the closing slide.** These are the client's primary and secondary as large fills, which breaks the style's own "Lines and ornaments only" rule (`neo-deco.js:52`) and its Don't ("Fill areas with the accent"). With this palette they read as a Southwestern rug.
- **The pattern slide (deck 07).** All six tiles are orange and teal fills: diamonds, rainbow arcs, arch inlay, zigzag frieze, a Memphis-ish lattice and a burst. Five of the six would sit as well in Groovy 70s.
- **The soft sunburst** (`css/aesthetics/neo-deco.css:89–92`). A `repeating-conic-gradient` with a radial mask gives fuzzy, feathered wedges (`adv/hr3/nd-hero.png`) that read as stage spotlights. Deco rays are crisp, two-length and end on a line.
- **The full orange primary button with a gilt inset** (A: 01 Interface). Orange in a gold frame is neither deco nor the brand.
- **Arch palette swatches.** The same device, at the same size and position, appears on Religious Futurism (`neigh.png`).

### Gaps (ranked)
1. **Typographic voice.** The best work uses fat/hairline geometric caps (Broadway, Cassandre's Bifur/Peignot) or a high-contrast roman at a large size. Ours uses Italiana, a thin 400 caps face with 0.3em tracking, at about 44px in a box. It reads as "luxury candle", not 1930. Severity: high.
2. **Metal rendering.** The best work uses brass and gold as *material*, with directional light and a highlight edge. Ours uses flat 1px client-colour strokes at alpha .14–.62. Severity: high.
3. **Ornament density and hierarchy.** The best work has dense, nested, stepped geometry with every element locked to one centre. Ours has one frame, one fan and a few small diamonds, with large empty areas and type in a box. Severity: medium-high.
4. **Distinctness** (see below). Severity: high.
5. **Phone.** The fan is moved above the title and shrunk to about 120px. Palette arches become a 2-column stack with a third orphan (D: ACCENT alone). Severity: medium.

### Distinctness
The nearest neighbours are **Religious Futurism** and **Aurora Noir**. Religious Futurism is a twin: dark canvas, centred wide-tracked thin caps headline, line-diamond-line gilt dividers, arch swatches, symmetric axis and "gilded" adjectives. With the logos covered I couldn't tell which board is which above the fold apart from the window art (`adv/hr3/neigh.png`). Verdict: **twins; Neo Deco must move.** Aurora Noir (dark plus product UI) is distinct.

**Move:** Neo Deco takes *heavy display caps plus stepped geometry plus brass*. Religious Futurism keeps *thin caps plus arches plus stained light*. Concretely: no arches anywhere in Neo Deco, the swatches become stepped ziggurat tiles, and the headline becomes fat.

### Fixes (ranked)
1. **[TOP] Fixed metal, never the accent.** In `neo-deco.js:72`, replace `const gilt = t.accentInk` with a fixed brass ramp: `--ab-gilt: #C8A24A`, `--ab-gilt-hi: #F1D592`, `--ab-gilt-lo: #7A5A1E` (on light mode `#9A7425 / #C8A24A / #5B4214`). Draw strokes with a 3-stop `linearGradient` (lo, hi, lo at 135°) in the SVG frame and fan. Client colours stay only in the swatches, the single CTA and status tags. Update `roles.accent.use` to say "the headline highlight word only".
2. **[TOP] Deco display type.** In `aesthetic-meta.js:149–155`, the heading picks become `['Limelight','Poiret One','Bodoni Moda','Italiana']` and the pairings `[['Limelight','Josefin Sans'], ['Bodoni Moda','Jost'], ['Italiana','Jost']]`. Render the hero headline at `clamp(56px, 9cqw, 112px)` with `letter-spacing: .08em`, not .3em. Add a gilt **inline**: a pseudo-element duplicate with `-webkit-text-stroke: 1px var(--ab-gilt-hi); color: transparent; transform: translate(-1.5px, -1.5px)`. That's the Broadway/Gatsby voice without a paid font.
3. **[TOP] Crisp two-length rays, not a conic glow.** In `neo-deco.css:89–92`, drop `.nds-rays`. In `art()` (`neo-deco.js:103`), draw 48 SVG lines from (100,100) that alternate radius 96 and 70, use stroke width 1.2 and 0.6 in the brass gradient, and start each at r=18 so the rays end on a solid half-disc. Add three concentric stepped arcs (Radio City bands) at r=24, 36 and 48. Remove the radial mask.
4. **Kill the arches and give Neo Deco its own swatch.** In `neo-deco.css:100`, `.ab-chip`: change the shape to a stepped ziggurat via `clip-path: polygon(0 100%, 0 30%, 15% 30%, 15% 15%, 30% 15%, 30% 0, 70% 0, 70% 15%, 85% 15%, 85% 30%, 100% 30%, 100% 100%)` with a 1px brass inner stroke. Remove the "Plain / Framed / Gilded" arch demo in 02 Ornament and replace it with three frame grades (single rule, double rule, stepped double).
5. **Make the cover band and pattern suite line-only and brass.** In `fit.js:118–125`, set every entry's colorway to `'mono'` with ink mapped to the brass ramp and ground to canvas. Lead with `burst` (Gilt rays) or `arcrise` as *line* art, not `chevron` brand-fill. Remove `zigzag` (colors: four) and `modulargrid` (Gilt lattice). Add `weave` with `rhythm: 'pinstripe'` as a fluted reeded-glass texture.
6. **CTA.** The primary fill stays, but drop the inset gilt ring (`neo-deco.css:133–140`). Make it a stepped-end shape using `clip-path` with 6px notched corners. The ring plus orange plus diamond arrow is three ideas on one button.
7. **Phone.** Keep the fan *behind* the headline at 100% width, as on desktop. Palette: a 5-across row of 56px stepped tiles, never 2+2+1.

### Keep
- The nine-slice stepped frame SVG (`neo-deco.js:76–80`). The construction is right and it scales cleanly.
- The roman-numeral list (I, II, III) with line-diamond-line separators and slim slider tracks. That's the most deco moment on the board.

### Deck
- **01 Cover:** the orange and teal chevron band kills the slide. The headline in a framed box at about 40px is too small for a 1280 cover.
- **02 Principles:** "SYMMETRY, POLISHED." is set left-aligned on a style whose first principle is a centred vertical axis. Centre it.
- **03 Colour:** five arches with the same "Aa" chip block as everyone else.
- **05 Interface:** arches again (plain, framed, gilded), with no new information.
- **06 Material:** a big empty fan on the left with a label list on the right. This is the slide to show brass as material (a gradient swatch, a reeded texture and a stepped frame at 1:1).
- **07 Patterns:** client-colour fills (kill list).
- **08 Product:** shared mock. The "PROJECTS" title in Italiana is the only deco touch.
- **10 Closing:** a 155px orange and teal chevron column.

---

## 3. Dystopian Luxury — 5/10 · Refine

The smartest system in my set (accession numbers, catalogued/restricted/classified), let down by a two-headed hero, a full-width brand-orange bar and a phone that shrinks the one enormous word to a caption.

### References
1. Bureau Borsche, studio site — https://www.bureauborsche.com — Tiled project grid with 8px labels on grey bars and no ornament. The studio behind the 2017 Balenciaga site. (viewed)
2. Balenciaga on Fonts In Use — https://fontsinuse.com/search?terms=balenciaga — The web identity is plain Arial, with Wulkan and Feature in the editorial work. The tool is *default type*, used without apology. (viewed)
3. balenciaga.com (2017 onward) — https://www.balenciaga.com — Tiny logo, small Arial, black on white, one neon-green button, grey footer. (not viewed: Access Denied. Cited from knowledge.)
4. Maison Margiela — https://www.maisonmargiela.com — Washed-out, near-white monochrome imagery and a typewriter mono for the label copy. (viewed, under a consent box)
5. Margiela on Fonts In Use — https://fontsinuse.com/search?terms=margiela — Consolas, Space Mono, Courier and Helvetica. The label number 0–23 is the identity. (viewed)
6. Lumon (Severance) — https://lumon.industries — The giant corporate wordmark is *photographed in an environment* (on a building at night). The benevolent institution sits at architectural scale. (viewed)
7. Rick Owens — https://www.rickowens.eu — Handwritten logo, grey ground and severe bodies. Severity comes from the subject, not from UI ornament. (viewed, under a modal)
8. 032c — https://032c.com — Black and white, one hard red bar and Arial-style grotesk. (viewed)
9. Jil Sander — https://www.jilsander.com — A centred ultra-plain wordmark over a single full-bleed photograph. (viewed, under consent)
10. SSENSE — https://www.ssense.com — Monospaced micro labels with editorial at full bleed. (not viewed: CAPTCHA not solved)
11. Arc'teryx Veilance — https://veilance.arcteryx.com — Technical silence. (not viewed: DNS failure)

### Kill list
- **Two headlines fighting.** "Good design should feel alive" at about 95px in Inter Tight sits at the top, and "MARIGOLD" at about 150px sits 250px below it (A). The style's own spec is "a tiny wordmark … one enormous word". Right now there are two enormous things and neither wins.
- **The full-width orange CTA** (A: 01 Interface, 428×42px; D: full phone width). The spec says the primary is ≤2% of the area. This one bar is about 1.1% of the board by itself, and with the underline under "alive", the dot by the tag, the "classified" dot and the list ticks it exceeds 2%. Balenciaga's single green button was *small*.
- **The orange underline under "alive"** (A, C). A fat brand-colour underline is a SaaS marketing tell. The real move is no highlight at all.
- **Equal-size teal and yellow swatches** labelled "≤1%" and "≤0.5%" (A). The swatch row contradicts its own captions. Size them by coverage.
- **The ID tag with ✕ stitches, a circled 7 and a barcode** floating over the word (A: x=547–748 y=480–618). It's well drawn, but at 200px wide over an 800px word it reads as a cute sticker. Margiela's label works because it's *the only thing on a blank garment*.
- **The deck cover band** "Cold modules" (circles, Xs, bars in grey). That's Micrographics' vocabulary (see Distinctness).
- **Deck 07 pattern suite:** clinical screen, survey contours and registration marks are noise textures with nothing about luxury or classification in them.

### Gaps (ranked)
1. **One gesture.** The best work is either one huge cropped word or a tiny logo on emptiness, never both at once. Ours has both, plus palette and type blocks at full volume. Severity: high.
2. **Removal.** The best work is about 90% blank, with no section header bars and no boxed type specimens. Ours has section rules every 200px, a three-column type card and a full palette row. It reads like a design system doc that happens to be grey. Severity: high.
3. **Typographic voice.** The best work uses default faces (Arial, Courier, Consolas) for the "un-designed" chill. Ours uses Inter Tight, tight-tracked at -0.045em, which is the 2024 product-marketing voice. Severity: medium.
4. **Phone.** The best work keeps the word giant on phone (Lumon's wordmark fills the frame). Ours shrinks MARIGOLD to about 40px cap height, and the tag becomes illegible at 6px (D). Severity: high.
5. **Material.** The best work uses metal and stitching on hardware, or photography. Ours has none (the code says "not drawn here"). Severity: low, because removal is the point, but the deck needs one object.

### Distinctness
The nearest neighbours are **Micrographics** and **Raw Brutalist**. Micrographics is a sibling: same recommended pairing (Inter Tight/Inter, `aesthetic-meta.js:268` and `:408`), same light grey canvas, same tight-tracked grotesk headline, mono micro labels, bracketed indexes, barcode and QR furniture, and numbered panels. Both decks also share "modular grid of circles and Xs" pattern tiles. Verdict: **siblings; both must move.** Dystopian Luxury goes *quieter and default* (Arial/Helvetica-class, no barcode, no grid furniture, the ID tag only). Micrographics goes *louder and denser*. Raw Brutalist is distinct: it is the loud cropped grotesk with a yellow band, and Dystopian Luxury must never pick up its band.

### Fixes (ranked)
1. **[TOP] One enormous word, one tiny headline.** In `css/aesthetics/dystopian-luxury.css:43`, `.ab-headline` drops to `font-size: 15px; font-weight: 500; letter-spacing: 0; max-width: 22em` and sits *under* the strip as a caption, so the board's only display type is the cropped word. Push the word plate to the top of the hero, directly under the header (move `art` above the copy in the layout; `layout.hero` should be `'poster'` with art first). Raise the word's `fsFull` cap (`dystopian-luxury.js` `dlWordFit`, "Past 44…") so the word's width is 100–103% of the *board* at 1280, not of a 760px plate.
2. **[TOP] Change the default type to the un-designed default.** In `aesthetic-meta.js:404–411`, the pairings become `[['Archivo','Arimo'], ['Inter Tight','Inter'], ['Bodoni Moda','Arimo']]`, where Arimo is the metric-compatible Arial clone. Labels become Courier Prime or IBM Plex Mono at 10px with 0.04em tracking (not 0.1em). The cropped word uses Archivo at 800–900 width 100. Inter Tight leaves the default slot, which separates it from Micrographics.
3. **[TOP] Make the primary a mark, not a bar.** In `dystopian-luxury.css:90`, `.ab-cta` becomes `display: inline-flex; width: auto; padding: 10px 14px; background: var(--ab-dl-ink); color: var(--ab-canvas)` with a 6px primary square before the label (`::before{content:'';width:6px;height:6px;background:var(--ab-dl-mark)}`). Remove the orange underline from the highlight (`highlightNote`, `dystopian-luxury.js:60`) and keep the highlight in ink with no decoration. Primary appears exactly once per view.
4. **Swatches sized by coverage.** In `dystopian-luxury.css:58–59`, the canvas swatch spans about 60% of the row, ink about 25%, and primary, secondary and accent are 24px squares. Set the flex-basis from the role coverage numbers already in `roles`.
5. **Phone keeps the word huge.** At ≤480px, set the word as two lines ("MARI" / "GOLD" split at the syllable nearest the middle), each cropped vertically under the strip at 100% width, cap height ≥90px. Hide the ID tag and show the accession number as plain text under the strip.
6. **Strip the furniture.** Remove the numbered circle bullets (①②③) from section labels and list rows. Remove the barcode from the tag (Micrographics owns barcodes). Section dividers become 1px at 12% ink with 2× the current vertical space (`padding: clamp(48px, 8cqw, 96px) 0`).
7. **Pattern suite** (`fit.js:310–317`): lead with `stipple` dust at tone 0.3, so the cover band is near-blank paper. Remove `modulargrid`, `parcels` and `glyphgrid` (the shared Micrographics vocabulary). Add `onebit` at tone 0.35 as a photocopied garment label.

### Keep
- The accession-number system (2026.114.1 / .2 / .3) and the Catalogued / Restricted / Classified button states. This is a genuinely clever, style-specific state model, and nothing else in the 36 has it.
- The vertical crop of the word under a black strip (desktop only).
- The grey footer bar quoting the 2017 Balenciaga site.

### Deck
- **01 Cover:** the headline and the word sit side by side at similar weight, with a "cold modules" band underneath. Make it one word, cropped, full slide width.
- **02 Principles:** "Access is a privilege." with an orange underline is good copy wearing a SaaS underline.
- **03 Colour:** the proportion bar is correct (a mostly grey bar with a sliver), but the swatches above it contradict it.
- **06 Material:** the word plate again at the same size as the cover. Show a single label object at 1:1 here instead.
- **08 Product:** shared mock with coloured dots. This style should show a single product page with one item, the accession number, and nothing else.
- **10 Closing:** the "cold modules" pattern strip down the left edge. Kill it.

---

## 4. Mixed Type — 4/10 · Rework

The headline mix is a 2021 Instagram trend done at half volume, and everything below the specimen is Editorial Serif with grey cards and teal pills.

### References
1. Collins, Mailchimp (2018) — https://www.wearecollins.com/work/mailchimp/ — Cooper Light, a soft serif, against Graphik, plus Cavendish yellow and illustration. Two voices with total commitment. (viewed)
2. Mailchimp on Fonts In Use — https://fontsinuse.com/search?terms=mailchimp — Cooper BT, Graphik and Means. The mix happens *between* lines and roles, not word by word. (viewed)
3. Commercial Type — https://commercialtype.com — Each family gets a full-width colour band at 140px: Spectator, New Doric, Orlando. Every specimen is a poster. (viewed)
4. Pangram Pangram — https://pangrampangram.com — Huge type set over photography, one family per card. (viewed)
5. Displaay — https://displaay.net — Rounded-outline nav pills, with type printed on acrylic blocks photographed as objects. (viewed)
6. Dinamo — https://abcdinamo.com — A collage of photos, type, a hand and a fortune cookie. The type mix *is* the brand's chaos. (viewed)
7. Grilli Type — https://www.grillitype.com — A construction-drawing specimen (MCNK on guides) beside a large list of retail faces. (viewed)
8. Klim — https://klim.co.nz — An object photo (an orange crate) with the type at the margin. (viewed)
9. It's Nice That — https://www.itsnicethat.com — Section headers set in different display faces (Insights, Nicer Tuesdays, The Weekend) on yellow. (viewed)
10. Eye on Design, Nouveau Rebus / Songtrust and Upwork billboards — https://eyeondesign.aiga.org — Mixed type *plus* inline images at billboard scale. (viewed via `adv/adv1/refs/img/eod-*`)

### Kill list
- **Headline scale.** "GOOD design should FEEL alive*" is about 75px cap height on an 884px board (A), and on the deck cover about 55px. The references set mixed headlines at 140–300px. At this size the face changes look like a font-loading glitch, not a decision.
- **Grey tinted panels** (`css/aesthetics/mixed-type.css:174,200`: `.ab-card` and `.ab-panel` with `background: var(--ab-paper)` and `border-radius: 2px`). These are SaaS cards on a "page" style.
- **Teal-tint status pills** (`mixed-type.css:231`: `.ab-row-status` on `--ab-sec-tint`) and teal progress bars (`:233`). These are textbook template tells.
- **Mustard italic "alive"** from client yellow. It's the same leakage as Editorial Serif, and the same move as Editorial Serif.
- **"Roman / Italic / Mono" Aa boxes** in 02 Voice. They repeat the specimen row above at a smaller size, with no new information.
- **Deck patterns (07):** typeterrain warp in orange, yellow and teal confetti, a fly-poster, chevron zigzag bands and a geometric "Glyphs" field. All client-colour fills, and "Zig bands" belongs to Groovy 70s and Neo Pop. The cover band is a confetti of coloured dots.

### Gaps (ranked)
1. **Scale and commitment.** The best work makes the mixed headline *the* image, 3–5× the body width. Ours is a modest two-line H1 with a specimen grid below. Severity: high.
2. **Choice of faces.** The best work uses contrast with intent (Cooper's softness against Graphik's neutrality) and adds texture: a variable-width grotesk, an ink-trap serif, a stencil. Ours is the four most expected Google faces (Instrument Serif, Playfair italic, Bricolage 800, DM Mono). Playfair italic is the single most overused "editorial" italic on the web. Severity: high.
3. **System beyond the headline.** In the best work the mix shows up in navigation, numbers and captions (It's Nice That section heads). Ours goes back to Instrument Sans everywhere after line 2. Severity: medium.
4. **Images.** The best work mixes in photos and objects (Dinamo, Klim, the Songtrust billboard). Ours has none. Severity: medium.
5. **Phone.** The headline wraps to "GOOD design / should / FEEL alive*" (D), which is actually good. The specimen collapses to a 2×2 grid that's fine. Everything else is the stacked desktop. Severity: low-medium.

### Distinctness
The nearest neighbours are **Editorial Serif** and **Rebus**. Editorial Serif is a sibling: same canvas, heading default, italic-yellow last word, hairline-plus-small-caps rhythm and italic footer motto. Rebus is a cousin: same light canvas, same palette row, same two-column sections and a similar "word replaced by something else" headline idea. Verdict: **Mixed Type must move most.** It should become the *loud* one of the three: poster-scale, colour-blocked, one face per line in Commercial Type-style bands, with a variable grotesk as a fifth voice. Editorial Serif keeps quiet and serif. Rebus keeps pictures.

### Fixes (ranked)
1. **[TOP] Poster-scale headline in bands.** In `mixed-type.css:48`, change the clamp to `clamp(64px, 18cqw, 220px)`. Set each line on its own full-bleed band (`display:block; margin-inline: calc(var(--ab-pad)*-1); padding-inline: var(--ab-pad)`). Band 1 is canvas, band 2 ink with canvas type, and band 3 primary with `--ab-on-primary` type. One voice per line, *plus* one swap inside the line. The idea is Commercial Type's homepage turned into a headline.
2. **[TOP] Change the voices.** In `aesthetic-meta.js:274–284`, the heading picks become `['Fraunces','Bricolage Grotesque','Instrument Serif','Gloock']`, with the italic voice changed from Playfair Display to Fraunces Italic at `"SOFT" 100, "WONK" 1`. Add a fifth voice: a width-variable grotesk (Bricolage at `wdth 75`) for numbers and nav. Pairings: `[['Fraunces','Instrument Sans'], ['Bricolage Grotesque','Inter'], ['Gloock','Instrument Sans']]`. That breaks the Instrument Serif link to Editorial Serif.
3. **[TOP] Kill cards and pills.** At `mixed-type.css:174,200`, set `background: transparent; border: 0; border-top: 2px solid var(--ab-ink); border-radius: 0; padding-inline: 0`. At `:231`, set `.ab-row-status` to `background: none; padding: 0;` in the italic voice in ink. At `:233`, change the bar to ink at 2px.
4. **Carry the mix through the UI.** Set tab labels as Design (serif italic), Build (heavy), Launch (mono), one voice each. List-row numerals are already italic; make the percentages the heavy voice at 24px. The section numbers (01, 02, 03) are already italic, so keep them.
5. **Inline image slots.** Put one inline photo or brand-image chip at cap height inside the headline (the Songtrust and Upwork move), using `ctx.logo` or a pattern tile at `height: 0.8em; aspect-ratio: 1.4; vertical-align: baseline`. This also separates it from Rebus, which uses pictograms, not images.
6. **Pattern suite** (`fit.js:214–221`): lead with `specimens` set in *mono* colourway as a type wall. Remove `zigzag` and `glyphgrid` shapes and replace them with `typeterrain` at `charset: 'letters'` using the brand name, plus `tornbands` as a cut-up in ink only.
7. **Accent.** Use the italic voice in ink, and let primary do the colour work through the band in fix 1. Remove the yellow from the headline.

### Keep
- The cap-height-matched specimen (×1.00 / 1.02 / 1.09 / 1.03 with cap and base guides). It's real typographic thinking and could sit on Grilli Type's site.
- The asterisk footnote mark after the highlight word.

### Deck
- **01 Cover:** a 55px headline, a specimen strip and a confetti band. Use the banded poster headline from fix 1 at full slide.
- **02 Principles:** "MANY voices, ONE page*." is the best copy in the deck. Set it at 180px across the slide instead of 60px in the left third.
- **05 Interface:** Roman/Italic/Mono boxes again.
- **06 Material:** the specimen block repeated from the cover at a smaller size.
- **07 Patterns:** client-colour Memphis (kill list).
- **08 Product:** shared mock with rounded pill and dots.
- **09 Do/Don't:** teal discs. "Use more than four faces" is a good rule, and it shouldn't come with a tinted ✓.

---

## 5. Rebus — 6/10 · Refine

The only board in my set with a real idea, an honest sound-based engine with the answer printed upside down. It's set at icon-font scale, its own interface breaks its rule, and its pattern suite has never heard of a rebus.

### References
1. Paul Rand, Eye-Bee-M poster (1981) — Wikimedia Commons search "eye bee m rand" — Three pictures (eye, bee, striped M) at *equal visual weight* and very large, filling the poster. (viewed: thumbnail)
2. Milton Glaser, I ♥ NY (1977) — https://en.wikipedia.org/wiki/I_Love_New_York — A slab (American Typewriter) and one red heart at cap height, stacked into a square lockup. (viewed)
3. Songtrust "Sign the best deal in the business" billboard — via Eye on Design — Heavy grotesk caps with photo chips replacing letters, at billboard scale. (viewed: `eod-*`)
4. Upwork "Lydia in London" billboard — via Eye on Design — A green grotesk with portrait thumbnails at cap height. People stand in for words. (viewed)
5. Maev and Sunrise web copy — via Eye on Design — Body-size copy with small inline pictures carrying meaning in running text. (viewed)
6. Nike "The [Jumpman] man doesn't live on Earth" tee — via Eye on Design — Mixed scripts and logos inline, multiple pictures per line. (viewed)
7. "Rebus sur les misères de la France" (1592) — via Eye on Design — A dense full page of alternating roman caps and woodcut pictures, line after line. (viewed)
8. Victorian escort card "May I see you home my dear" — https://en.wikipedia.org/wiki/Rebus — Multiple pictures in one line, decorative card format. (viewed: thumbnail)
9. Fonts In Use, "rebus" tag — https://fontsinuse.com/search?terms=rebus — Brand rebuses in use (EMPO, Windsor, poster sets). (viewed)
10. paul-rand.com, "Designing IBM" — https://www.paul-rand.com/foundation/thoughts_designingIBM/ — (not viewed: certificate error)

### Kill list
- **Icons beside tab words** (`css/aesthetics/rebus.css:111–114`; `adv/hr3/rb-tabs.png`). A signpost next to "Design", a bee next to "Build" and an arrow next to "Launch". A rebus *replaces* a sound and never decorates a word. The bee next to "Build" doesn't even sound right, and the arrow is meaning, not sound. This is an icon-tab template, and it contradicts the style's own Don't ("Swap a word for a picture of its meaning", deck 09).
- **The headline is mostly letters.** "Good de[sign] should feel alive" has *one* 40px glyph in an 80px line (A). Every reference has two or more pictures per line at equal weight with the letters.
- **The client palette row at full saturation** (A: five 150×70 blocks). Rebus is ink plus one red. The style's own principle ("One colour, one red") makes teal and yellow swatches the same size as ink a contradiction.
- **Teal progress bars** in 03 In use. Secondary in a list nobody reads as a puzzle.
- **Deck 07 patterns:** "Eye" (an orange and teal target on stripes), "Picture patches" (a Memphis collage), "Pictogram sheet" (concentric rings in orange and teal) and "Logotype stripes". None contain a single rebus glyph, while the cover band and closing strip *do* (`deck` hook). The pattern slide is the only one off-concept.
- **The orange horse at 300px on deck 06** over a 24-unit grid. It's the best drawing in the set, but it sits in client orange as a fill, at the size of a mascot.

### Gaps (ranked)
1. **Scale and density of pictures.** The best work has pictures at cap height, several per line, the line at poster scale. Ours has one glyph per headline, and the brand lockup (mare + eye + gold + Studio) at about 70px. Severity: high.
2. **Drawing richness.** The best work has woodcut detail (1592), photo chips (Songtrust) or Rand's striped, bold geometric pictures. Ours are flat black geometric pictograms at icon weight, and the signpost reads as a UI glyph. Severity: medium-high.
3. **Honesty in the UI.** In the best work every picture is a sound. In ours the tabs, CTA arrow and toggle eye are icons (see the kill list). Severity: medium.
4. **Colour.** The best work is ink plus one red (Glaser), or a full illustration palette (1592 woodcut). Ours is ink plus orange plus teal bars plus a yellow footer square. Severity: medium.
5. **Phone.** The lockup holds at about 36px glyphs (D, `phones-top.png`), and "READ IT ALOUD. ANSWER" keeps the upside-down answer. That works. The rest is the stacked desktop. Severity: low.

### Distinctness
The nearest neighbours are **Mixed Type** and **Neo Pop / Bauhaus Poster** (flat pictograms). Against Mixed Type, both are "a headline where some words become something else" on a cream page. Verdict: **cousins; Rebus holds if it goes picture-heavy and Mixed Type goes type-heavy** (fixes above). Bauhaus Poster uses geometry as composition, not as words, so they're distinct.

### Fixes (ranked)
1. **[TOP] Picture density in the headline.** In `js/aesthetics/rebus.js` `rbSegment` / headline build (around `:266–295`), allow up to 3 glyph substitutions per headline instead of the current single best candidate, and widen the honest homophone tables (`RB_WHOLE`/`RB_PRE`/`RB_SUF`) so ordinary copy gets hits. The engine already knows I, be, see, you, for, ate and -sign. Add [can] = can, [knot] = not, [tea] = -ty/tee, [2] = to/too, [hour] = our, [rows] = rose. Words with no honest sound stay type, as now. Raise the glyph size to 1.0em cap height (currently it reads at about 0.75em) and the headline clamp at `rebus.css:37` to `clamp(56px, 13cqw, 168px)`.
2. **[TOP] Make the brand equation the hero, at poster scale.** At `rebus.css:55–57`, `.rb-eq-row` goes to `font-size: clamp(64px, 16cqw, 200px)`, glyphs at equal visual weight with the letters (Rand). Put it *above* the headline as the board's first element, and give the "+" operators a hairline weight so the pictures dominate.
3. **[TOP] No icons in the UI.** At `rebus.css:111–114`, remove `::before` icons from `.ab-seg-btn`. Instead *spell* the tabs as rebuses where the engine finds a sound ("De[sign]", and leave "Build" and "Launch" as letters). Drop the CTA arrow glyph (`--rb-i-cta`) and use a typeset "→" in the slab. The toggle knob eye stays only if it is labelled "I" (eye = I: "I'm on").
4. **One colour, one red.** In the palette section, render ink and canvas as the large swatches and primary as one swatch. Show secondary and accent as 20px squares with "(support)" captions. Set `.ab-row-bar i` to ink. The footer square becomes primary, not accent yellow.
5. **Richer drawing.** Add a stripe-cut treatment to every glyph (Rand's IBM stripes, already hinted at in "Drawn at the letters' weight … stripe cuts" on deck 02): `RB_G` paths get 3 horizontal knock-out bars at 1/8 cap height, matching the slab's stroke weight.
6. **Pattern suite** (`fit.js:230–237`): replace all six with rebus-native fields: (a) a rebus sentence wall made of the brand's own lines, typeset with glyphs inline, repeated like the 1592 sheet; (b) a glyph-only grid in ink (already used in the cover band, so promote it to tile 1); (c) the striped IBM-style glyph at 1:1 on a construction grid. Delete `counterchange` Eye, `patchwork` and `weave`.
7. **Deck 06:** the horse goes in ink with primary on one stripe only, at 200px instead of 300px, with the full eight-glyph set below at 48px.

### Keep
- The sound-segmentation engine and the honesty rule (no synonym fallback). It's a real concept, and it would survive a crit at Pentagram.
- The upside-down answer under the lockup. It's a genuine Victorian-card gesture, and nobody else in the 36 has a joke.
- The Word / Picture / Its-name triptych (I / eye / "eye"). It explains the mechanism in three boxes.
- "[bee] [sea]n. [bee] heard." in the closing line.

### Deck
- **01 Cover:** the strongest cover in my set. Fix the lockup scale (fix 2), and the glyph band at the bottom should be ink-only (it is).
- **03 Colour:** five equal blocks contradict "one colour, one red".
- **05 Interface:** the icon tabs (kill list).
- **06 Material:** the mascot-scale orange horse (fix 7).
- **07 Patterns:** entirely off-concept (fix 6).
- **08 Product:** shared mock. The rebus engine should rename "Projects" here if it can.

---

## 6. Micrographics — 5/10 · Refine

The spec plate is the densest, most credible hero art in my set, but it's caged in a 330px box. Its labels collide, its leaders run at random diagonals, and the "one huge element" it claims never shows up.

### References
1. The Designers Republic — https://www.thedesignersrepublic.com — A bright yellow field with an all-type manifesto in a heavy grotesk. TDR is louder than its imitators. (viewed)
2. The Designers Republic on Fonts In Use — https://fontsinuse.com/search?terms=designers+republic — Republic and their custom faces: dense label stacks, SNAP, Wipeout-era packaging. (viewed)
3. Wipeout (1995) packaging by TDR — https://en.wikipedia.org/wiki/Wipeout_(video_game) — Box art with Japanese micro type, logos as stickers and huge wordmarks. (viewed: thumbnail)
4. Teenage Engineering — https://teenage.engineering — A dense icon nav strip with tiny labels and huge product photos. (viewed)
5. Teenage Engineering OP-1 field — https://teenage.engineering/products/op-1 — Product silkscreen: tiny pictograms on keys and one big object. (viewed)
6. Acronym on Fonts In Use — https://fontsinuse.com/search?terms=acronym — Acronym's own face, the "DANGER! SLIGHT CHANCE" stencil and hazard labels. (viewed)
7. acrnm.com — https://acrnm.com — Product spec sheets with ultra-small mono technical text. (not viewed: Cloudflare CAPTCHA, not solved)
8. Nike ISPA — https://www.nike.com/ispa — Spec-heavy product graphics. (not viewed: 404)
9. Off-White ("quotation" labels) — https://www.off---white.com — Quoted micro labels on product, such as "SHOELACES". (viewed only under a modal, so effectively not viewed)
10. Experimental Jetset — https://www.experimentaljetset.nl — Swiss micro-meta typography. (not viewed: connection refused)

### Kill list
- **Labels colliding with the grid and the leaders** (`adv/hr3/mg-hero.png`). The "+" module marks run through "CAP+HEIGHT" and "X 21+0". The A.01 and A.02 leaders cut through their own labels, and the A.07 crosshair sits on its coordinate text. At 8px, a collision is the difference between a spec sheet and a mess.
- **Diagonal leaders at arbitrary angles.** The comment at `js/aesthetics/micrographics.js:150` says "one right-angle bend", but the code draws a single straight `L` (`d="M${ax} ${ay}L${c.tx} ${c.ty}"`). Real technical callouts are orthogonal or 45° only.
- **No huge element.** The headline is about 85px. The "giant brand glyph" is a 130px M inside a framed box that takes 37% of the board width (A). The style's stated contrast ("a giant tight headline and a giant brand glyph against microtype at 8px") isn't on screen.
- **Mustard "alive"** from client yellow (A, B, D). This is the third aesthetic in my set with the same yellow-italic or yellow-solid last word.
- **Boxed type cards** (T.01–T.03), each a bordered rectangle with corner IDs. That's three SaaS cards with mono labels on top.
- **The phone spec plate** at 290px wide. Every label becomes ≤6px and unreadable (D). This is a squashed desktop in the most literal sense.

### Gaps (ranked)
1. **Scale contrast.** The best work goes from about 600px (a glyph or object) to 7px, roughly 80:1 (TDR, Wipeout, OP-1). Ours goes from about 130px to 8px, roughly 16:1. Severity: high.
2. **Precision.** The best work has orthogonal leaders, no collisions and labels on a baseline grid. Ours has diagonal leaders and collisions. Severity: high.
3. **Attitude.** The best work has saturated fields, sticker logic and hazard humour (TDR yellow, Acronym's "DANGER! SLIGHT CHANCE"). Ours is a polite grey spec sheet that reads closer to Blueprint or Dystopian Luxury than to TDR. Severity: medium.
4. **Detail density outside the hero.** The best work puts micro type on *everything* (keys, edges, tabs). Ours adds a ruler and corner tags on the panels, but the palette and type sections are standard. Severity: medium.
5. **Phone.** The best work crops to the huge element and lets the micro type run off the edge. Ours shrinks the whole plate. Severity: high.

### Distinctness
The nearest neighbours are **Dystopian Luxury** and **Blueprint** (spec-sheet linework). As with Dystopian Luxury, they're siblings (see section 3). Micrographics must go **loud**: TDR-style saturated field, giant glyph and sticker labels. Blueprint is cousin-level, since both draw annotated technical drawings on a grid. Micrographics differs by being *product and streetwear* (barcodes, QR, warnings), so lean into that and drop the module-grid "+" field, which is Blueprint's.

### Fixes (ranked)
1. **[TOP] Break the glyph out of the box.** In `css/aesthetics/micrographics.css:104–108` and the `art()` layout, the plate becomes full board width and the glyph's height goes from `44cqh` to `86cqh`, so the M is about 520px tall at 1280. Move the spec table and the QR/barcode column *over* the glyph's counters as overlays (the TDR sticker logic), with canvas-coloured knock-out backgrounds. The headline drops to 48px so the M is the one huge element.
2. **[TOP] Orthogonal leaders and knock-outs.** At `micrographics.js:148–152`, draw each leader as `M ax ay H tx V ty` (one horizontal run, one vertical drop). At `micrographics.css:112`, `.mga-call` gets `background: var(--ab-canvas); padding: 1px 3px; z-index: 2`, so no grid mark or leader crosses text. Snap label y to an 8px baseline.
3. **[TOP] Fixed signal colour instead of client yellow.** Replace the yellow highlight on "alive" with ink, and give the style a fixed *safety* accent that doesn't come from the brand, used only for the caution triangle and one hazard bar: `#FF4A1C` on light, `#FFE500` on dark. Client primary stays on the single CTA and the "05 PRI" chip. Of the six aesthetics, this is the one where a fixed non-brand colour is canon (hazard orange, TDR yellow).
4. **Remove the type cards.** At `micrographics.css`, the type section rules become `border: 0; border-top: 1px solid var(--ab-ink)` with T.01/MG-T1 kept as micro labels on the rule. That removes three boxes and keeps the meta.
5. **Phone crop, not shrink.** At ≤480px, the plate shows only the glyph at 100% width, about 300px tall, with four callouts (A.01, A.04, A.06, A.08) at 8px. Hide the spec table and QR column, and move them to a separate full-width micro table under the plate at legible 9px.
6. **Detail density.** Add an 8px mono micro line to every section rule (`.ab-sec .ab-labelrow::after` already exists at 7.5px; fill it with real data: the section hex, grid unit and page count). Add a 1px hairline ruler with ticks every 8px along the left edge of the board (the vertical "MICROGRAPHICS · SPEC 01/26" strip is a start).
7. **Pattern suite** (`fit.js:206–213`): lead with `signal` (Barcode field) at tone 1 so the cover band reads as a label strip. Replace `modulargrid` (shared with Dystopian Luxury and Rebus) with a hazard-stripe `chevron` in the fixed safety colour at 4% of the tile.

### Keep
- The spec table built from real brand data (head and body faces, hex values with role squares), the QR block seeded by the brand name, the version string and the rulers. This is real detail density, and it's the closest thing in my set to the references' texture.
- The corner tick marks on panels and the page counters (P.01/04).
- "SMALL PRINT, LARGE IDEA." as a motto.

### Deck
- **01 Cover:** the plate is a 100px thumbnail in the corner. Make it the full-slide glyph per fix 1.
- **02 Principles:** "Small print, large idea." at 60px. The principle "One huge element" is violated by its own slide.
- **05 Interface:** good. The bracketed corner ticks on the CTA are the best interface detail in my set.
- **06 Material:** a 300px grey checker or stripe collage. It's the strongest pattern image, but it says "texture", not "specification".
- **07 Patterns:** all six are grey textures, with "Micro type" a cloudy blob.
- **08 Product:** shared mock.
- **10 Closing:** the grey stripe strip. Swap in the barcode field.

---

## Scores
| Aesthetic | Score | Verdict |
|---|---|---|
| Editorial Serif | 5 | Refine |
| Neo Deco | 3 | Rework |
| Dystopian Luxury | 5 | Refine |
| Mixed Type | 4 | Rework |
| Rebus | 6 | Refine |
| Micrographics | 5 | Refine |

None of these reaches 7. Nothing on any of the six boards stands next to a named reference *as a whole*. The parts that come closest are the Rebus engine and upside-down answer (next to Victorian cards), the Dystopian Luxury accession and state model (next to Margiela's numbering), and the Micrographics spec table (next to TDR's label stacks).

---

## Fix log (fx63)

Fixer: FX6-3 (task fx63), packet rev 2. Date: 2026-10-11. Files changed: `js/aesthetics/` and `css/aesthetics/` for editorial-serif, neo-deco, dystopian-luxury, mixed-type, rebus, micrographics. Originals are backed up in `scratchpad/adv/fx63/orig/`. Before: `adv/r6/sheet-r6-<key>.png`. After: `adv/fx63/sheet-fx63-<key>.png` (board A|B|C|D), `adv/fx63/sheet-deck-<key>-rec.png` and `-oth.png` (deck). The after-shots use the requested font defaults, patched in page memory (`adv/fx63/fontov.js`) until the shared change lands.

**Status:** submitted. Gore 24 combos, 0 issues. `tests/run.js` all passed. `harness.js` 16 fails, all in other aesthetics (retro-futurist, wabi-sabi, dark-academia); none in these six. `src-verify-p5.js` 0 fails. No console errors except the existing favicon 404. No overflow at 390px.

### Editorial Serif
1. **(Top)** The hero is now a magazine cover. A full-width 4:5 plate holds a duotone still life (Morandi bottles drawn in SVG from four tones: the dark neutral and a primary spot tint). The masthead wordmark is justified edge to edge across the top. The headline sits over the dark lower third in paper colour. The Fig. 1 caption is kept, and a 1px primary rule sits under the folio. The logo hangs in the image as a framed print when one is set. The cropped-initial plate is gone.
2. **(Top)** The headline clamp is now `clamp(64px, 14cqw, 168px)` × display 1.22 (about 130px at 1280), with `opsz 96` set. Captions are 9–10px. The didone default is a shared request (below).
3. **(Top)** The accent word is ink italic (`color: inherit`), never yellow. The footer § is ink.
4. Section 02 is now a text page: two justified columns at 15/22 with the only drop cap, a pull quote in heading italic at 28px between hairlines, and a byline. The board hides the form; the deck Interface slide keeps the real controls. This is done with generated content, because no framework hook exists for panel markup.
5. The states read as one button shown three ways: REST is primary, HOVER is ink, PRESSED is ink with an inset. Small-caps captions sit under hairline ticks. `--ab-eds-primary-press` is removed.
6. The card-body drop cap is removed.
7. On a phone the cover goes full bleed (negative pad) with the headline over it, and the type list collapses to the pair in use.
8. The pattern suite is a shared request. The deck cover is the plate at the right 55%. The Material slide uses `materialStage: 'pattern'` so the plate no longer appears three times.

### Neo Deco
1. **(Top)** The metal is a fixed brass ramp in `ndBrass()`: dark mode `#C8A24A / #F1D592 / #7A5A1E`, light mode `#9A7425 / #C8A24A / #5B4214`. Small text uses `#D4B061` (dark) or `#6E5118` (light), both 4.5:1 or better. Strokes use a lo-hi-lo gradient. The accent is now only the headline word. Green palettes stay brass.
2. **(Top)** The headline uses fat display caps at .08em tracking with a gilt inline. The headline hook emits a duplicate copy with a transparent fill, a 1px brass-highlight stroke and a −1.5px offset. The Limelight default is a shared request.
3. **(Top)** The rays are crisp SVG: 48 rays alternating r96 and r70, 1.6px and 0.8px, starting at r18 on a solid brass half-disc. Three Radio City bands sit at r24, r36 and r48. The conic gradient and its mask are deleted.
4. The arches are gone. Swatches are stepped ziggurat tiles (`clip-path`) with a brass inner stroke. The states are three frame grades: single rule, double rule and stepped double.
5. The pattern suite is a shared request; a fixed brass colourway would also need an engine change.
6. The CTA keeps the primary fill with 6px notched stepped corners. The gilt ring and the diamond arrow are removed.
7. On a phone the sunburst stays behind the headline and the palette is one row of five stepped tiles.
- Deck: Principles and Closing are centred. The Material slide shows brass as material: a gradient swatch, reeded flutes and a stepped frame at 1:1. `coverDisplay` is 1.45.

### Dystopian Luxury
1. **(Top)** There is one gesture. The word plate sits directly under the header and runs the full board width (102%), cropped vertically under the strip. The headline is a 15px caption under it.
2. **(Top)** Labels use Courier Prime at 10px with .04em tracking (already in FONTS). The `Archivo` / `Arimo` default is a shared request; Arimo is a new font.
3. **(Top)** The CTA is an inline ink block with a 6px primary square, so primary appears once per view. The underline is removed, and the classified dot, the bar tick and the footer dot no longer use colour.
4. Swatches are sized by coverage: canvas about 60%, ink about 25%, and the three brand roles as 24px squares.
5. On a phone the word splits at its middle syllable onto two cropped plates (MARI / GOLD; `dlSplit` also handles STRAW|BERRY and NORTH|WIND). The label is hidden and the accession number runs as plain text.
6. The circled numerals and the barcode are removed. Rules are 1px at 12% ink with `clamp(48px, 8cqw, 96px)` of air.
7. The pattern suite is a shared request.
- Deck: the Material slide shows the single label at 1:1. The cover headline cannot drop below the 64px floor in `bdFitCover` (framework item, below).

### Mixed Type
1. **(Top)** The headline is poster scale, up to `clamp(64px, 18cqw, 220px)`, with each line fitted by voice width. Each line sits on its own full-bleed band: paper, then ink, then primary. Each band has one voice plus one swap inside the line.
2. **(Top)** The italic voice is Fraunces Italic, and a fifth voice (Big Shoulders Display) sets numbers. The default pairing is a shared request. The SOFT/WONK and wdth axes need axis support in the font loader (framework).
3. **(Top)** Cards and pills are gone: transparent fills, a 2px ink top rule, radius 0. Status is italic ink and bars are ink.
4. The mix carries through the UI: the tabs are Design (italic), Build (heavy) and Launch (mono), and percentages use the condensed voice at 26px.
5. An inline type-object chip sits at cap height in the middle line: the logo if there is one, else the brand initial in the italic voice on primary.
6. The pattern suite is a shared request.
7. The yellow is removed from the headline.
- The "Aa" state boxes are replaced by Paper / Ink / Spark band chips. Keep items are intact: the cap-height specimen and the asterisk.

### Rebus
1. **(Top)** The sound dictionary is extended. New: f+[eel] = feel, th+[ink] = think, b+[ring] = bring, -ty = [tea] (beauty, twenty, quality), [pea] = peace/p. Already present: can, knot = not, tea, 2, hour = our, rows = rose. The headline now carries two honest pictures (de[sign], f[eel]), with up to 3 words and 4 pictures as before. Glyphs are 0.92em and the clamp is `clamp(56px, 13cqw, 168px)`. There is still no synonym fallback.
2. **(Top)** The brand equation is the hero's first element, at `clamp(64px, 16cqw, 200px)`, with hairline "+" and "−" operators.
3. **(Top)** No UI icons remain. The Design tab is spelled De+[sign] through an overlay, so the word stays its accessible name; Build and Launch are letters. The CTA uses a typeset "→", and the switch knob is a plain square.
4. One colour, one red: ink and canvas are the large swatches, primary is one, and secondary and accent are 20px "(support)" squares. Bars are ink and the footer square is primary.
5. Every glyph has three Rand stripe cuts (`rbDraw`).
6. The pattern suite needs a framework hook (below); `fit.js` can only approximate it.
7. On deck 06 the horse is ink with primary on one stripe (masked to the glyph) at a maximum of 220px, with the glyph set below at about 48px.

### Micrographics
1. **(Top)** The glyph is the one huge element. The plate is full board width (1.36:1) and the glyph cap is 78% of its height, about 470px. The spec table, the QR block and a hazard tape are canvas-backed stickers over the glyph. The headline is 48px.
2. **(Top)** Leaders are orthogonal (`M x y H tx V ty`). Labels knock out on canvas and snap to the 8px baseline (`round()`). The module "+" field is removed. The guides come from the glyph's measured ink edges.
3. **(Top)** A fixed safety colour (`--ab-mg-safe`: `#FF4A1C` light, `#FFE500` dark) is used only for the caution triangle and the hazard tape. "alive" is ink.
4. The type cards are now a 1px top rule with T.0x / MG-Tx labels.
5. On a phone the plate crops to the glyph with 4 callouts at 8px, and the spec table and QR sit under it at 9px.
6. Every section rule carries a real data line (code · hex · grid · page from tokens), and both board edges have 8px tick rulers.
7. The pattern suite is a shared request; a fixed safety colourway would need an engine change.
- Deck: the cover plate sits at full slide height and the principles motto renders at 1.8× size.

### Re-score
Scores against the references:

| Aesthetic | Score | What still falls short |
|---|---|---|
| Editorial Serif | 6.5 | The still life is drawn, not photographed. |
| Neo Deco | 6 | The ornament is still sparser than the Chrysler or Gatsby references, and the deck cover and patterns stay client-coloured until the `fit.js` change lands. |
| Dystopian Luxury | 7 | Arial-class type needs Arimo, and the deck cover headline is held at 64px by the framework. |
| Mixed Type | 6.5 | There are no real photos, and the axes are unavailable. |
| Rebus | 7 | The pattern slide is still off-concept. |
| Micrographics | 6.5 | The saturated-field attitude is limited to the hazard tape and the stickers. |
