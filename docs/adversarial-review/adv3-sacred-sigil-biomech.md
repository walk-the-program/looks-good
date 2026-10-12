# ADV-3 adversarial review: Religious Futurism, Cybersigilism, Biomechanical Gothic

Reviewer: ADV-3 (Opus, read-only). Packet rev 1. Date: 2026-10-11.

**Machine output I looked at:** `adv-<key>-A/B/C/D.png`, the `sheet-adv-<key>.png` and `sheet-deck-<key>.png` sheets, the full-size RF cover, CS cover, CS patterns and BG material slides, and 800px crops of every A and B board in `adv/adv3/`.

**References I looked at as images** (saved under `adv/adv3/refs/`):
- the Richter window page on Wikipedia: the nocturnal exterior, the sunlit pane detail and the floor projection photo
- Aingelblood's *Unholy Seraphim*, zoomed
- CO:CREATE's "8 cybersigilism artists" article, with DanyKim and Sadan pieces
- the Dune 2021 title-lettering analysis page
- the HR Giger Museum Bar site and the We Heart Giger Bar photo
- Sedlec Ossuary on Wikipedia
- Beksiński on WikiArt and Wikipedia

Anything cited from knowledge or from its page text is marked "(not viewed)".

**Shared finding.** All three hero arts are tidy, flat vector diagrams of the right *idea*. None of them has the material rendering, density or line quality that makes the real thing. The deck then undercuts all three: suite[0] in `js/patterns/fit.js` becomes the cover band and the closing strip (see `js/patterns-deck.js` `leadEntry`), and for all three that first entry is the most off-key pattern in the suite.

---

## 1. Religious Futurism — Score 5/10 · Refine

The idea is right: a Richter pixel cathedral on obsidian with gold hairlines. The execution reads as "saturated mosaic tiles in a fantasy-film serif". Richter's window is mostly cool, quiet glass with a few hot panes. Ours is 100% client-saturated tiles, so with the warm palette it reads as a Southwestern textile, and with the green palette as a terminal screen.

### References
- Gerhard Richter, Cologne Cathedral Window (2007) — https://en.wikipedia.org/wiki/Cologne_Cathedral_Window — 11,263 squares in 72 colours. The majority is blue-grey and smoke, with only sparse saturated panes. Iron saddle bars cross the field every few rows, and the colour lands on the floor as smeared light. (viewed)
- Richter, *4096 Farben* (1974) — https://www.gerhard-richter.com/en/art/paintings/abstracts/colour-charts-12 — the source grid: equal squares, with grey/white mortar lines as part of the image. (not viewed)
- Dune (2021) title lettering — https://dejareviewer.com/2023/12/12/i-love-the-way-they-did-the-dune-2021-title-font/ — monoline, ultra-wide geometric caps, tracked so far apart that the gaps weigh as much as the strokes. It is the opposite of Cinzel. (viewed)
- Dune: Part Two theatrical posters — https://www.imdb.com/title/tt15239678/mediaindex/ — tiny figures against monumental mass, two colours, small widely tracked type. (not viewed)
- Pierre Soulages, Conques Abbey windows — https://en.wikipedia.org/wiki/Conques_Abbey — contemporary non-figurative glass. The light itself is the ornament: near-colourless, with graded translucency and lead lines as drawing. (not viewed)
- Sainte-Chapelle, Paris — https://en.wikipedia.org/wiki/Sainte-Chapelle — walls of glass, a dominant blue/red key, iron armature as a visible grid. (not viewed)
- Tadao Ando, Church of the Light — https://en.wikipedia.org/wiki/Church_of_the_Light — one light cut in a dark mass, total silence. This is the "obsidian silence" the builder wants. (not viewed)
- Blade Runner 2049, Wallace Corp interiors (Dennis Gassner / Roger Deakins) — https://en.wikipedia.org/wiki/Blade_Runner_2049 — caustic light rippling on monumental planes, one figure, no UI chrome. (not viewed)
- Byzantine gold-ground mosaic, Hagia Sophia Deësis — https://en.wikipedia.org/wiki/Hagia_Sophia — gold as a field of slightly tilted tesserae that flicker. Useful contrast with our gold, which is only a hairline. (not viewed)
- ECM Records covers (Arvo Pärt, *Tabula Rasa*) — https://www.ecmrecords.com/catalogue/143038750696 — liturgical quiet in typography: small caps, huge margins, one image. (not viewed)

### Where it falls short (ranked)
1. **The glass reads as paint, not light.** **High.**
   - Refs: Richter's field is about 60–70% cool neutral glass (blue-grey, smoke, pale amber), and the saturated panes are rare. Every pane has blown-glass variation, and horizontal saddle bars break the field.
   - Ours: `art()` builds `base` entirely from client hues (g1, g1d, g2, g2d, gm, deep, g1p, around line 145). Every pane is a flat fill of a saturated client colour (`adv-religious-futurism-A.png` hero). The C board, with the green palette, turns into a mono-green pixel screen, so the stained-glass reading disappears.
2. **The pane scale is chunky.** **High.**
   - Refs: Richter's window has thousands of small squares, so it reads as a shimmering field.
   - Ours: `cell = 14` in an 800-wide viewBox gives about 11 columns in the central window and about 4 in the outer ones. At board size that reads as "mosaic tiles", and at the deck's cover size as needlepoint.
3. **The display face is the fantasy-film cliché.** **High.**
   - Refs: Dune 2021 is monoline and ultra-wide, with huge tracking.
   - Ours: Cinzel caps at 0.07em tracking (`js/aesthetic-meta.js` pairings[0] `['Cinzel','EB Garamond']`). That reads as Dune 1984, a fantasy-novel cover or a wedding invitation. The code comment cites Dune 2021, but the type doesn't follow it.
4. **The highlight word uses casino yellow.** **Med.** "ALIVE" is raw `--ab-accent-ink` (#FFC914) on obsidian. The aesthetic's own `rules.dont` forbids casino yellow.
5. **The CTA is a painted game button.** **Med.**
   - Ours: "SAVE DIRECTION" is a flat orange slab with a 26px orange outer glow (`.ab-cta` in `css/aesthetics/religious-futurism.css` line 133). The glass-to-glassDeep radial gradient is invisible at that size. It reads as a generic RPG menu button, not a lit pane.
6. **The light doesn't land anywhere.** **Med.**
   - Refs: Richter's floor photo shows coloured squares smeared across the stone.
   - Ours: `beams` are single-colour skewed gradient quads in one halo colour, so they read as stage spotlights.
7. **The composition is crowded and the scale is timid.** **Med.**
   - Refs: Dune and Ando use one huge form, a tiny human scale and vast silence.
   - Ours: the hero stacks headline, subcopy, nimbus, five windows, beams and three annotation lines into one centred block. Nothing is monumental relative to the frame, because the central window is about 20% of the board width.
8. **The tracery is missing.** **Low.** The windows are bare ogive outlines. Every cathedral reference has mullions and a head (oculus or trefoil) that give the glass architecture.

### Off-key / cliché
- The deck cover band and closing strip are `kaleidopix`, a "collage of zebra stripes, stairs, chevrons". On the cover it reads unmistakably as a Navajo or Andean woven textile (`dk/religious-futurism-cover.png`). This is the single most off-key thing across my three aesthetics.
- `pixelquilt` ("Leaded panes") reads as a quilt too, and `modulargrid` ("Ashlar bays") reads as Bauhaus.
- Cinzel plus a gold "§" kicker plus "MATINS · 03:00" stacks up into costume liturgy. The annotations are good; the font makes them cosplay.
- The "Consecrated" state glyph (a vesica drawn as a slanted leaf) reads as a flame or leaf emoji.

### Fixes (ranked)
1. **Rebuild the glass recipe Richter's way.** `js/aesthetics/religious-futurism.js` `art()`:
   - Prepend a fixed cathedral base of about 8 neutral glass hues, weighted to about 65% of `pool`: `#4A5A78 #5D6E8C #3E4A5E #7A8296 #8C7A5E #A89270 #6B5E70 #2E3646`. In light mode, lift them 10 L.
   - Keep the client families as about 35% of the pool, and put the deep/pale steps on the neutrals.
   - Result: any palette still reads as stained glass, and the warm board stops looking like a textile.
2. **Use finer panes and add armature.** Same function:
   - Set `cell = 8` (about 19 columns in the central window). Pane inset 0.6, so the leading stays about 1.2px.
   - Every 7 rows, draw a 1.6px saddle bar across each window in `lead` with a 0.5px `line` highlight on top.
   - Add one central mullion (2px) on the three large windows.
   - Give the central window an oculus at its apex: a 9-pane rosette ring, or a circle of panes clipped to r = 0.28·gw.
3. **Add blown-glass variation.** Give each pane path group a per-colour `<linearGradient>` (±6 L top to bottom, angle seeded), or overlay one `feTurbulence` (baseFrequency .9, 2 octaves) at 12% `mix-blend-mode: soft-light` inside the clip. Flat fills are the main "vector" giveaway.
4. **Change the display face.** `js/aesthetic-meta.js` `religious-futurism.fonts`:
   - Make the pairings `[['Unbounded','EB Garamond'], ['Marcellus','EB Garamond'], ['Cinzel','EB Garamond']]`.
   - `js/data.js`: add weight 200 to Unbounded (`weights: '200;400;600'`).
   - `css/aesthetics/religious-futurism.css` `.ab-headline`: when `data-hcls="wide"`, use font-weight 200, letter-spacing 0.32em and font-size × 0.62.
   - That is the Dune 2021 move. Cinzel stays available, but it isn't the default.
5. **Fix the floor light.** In `art()`, replace `beams` with the mosaic group itself, transformed onto the floor: `transform="matrix(1 0 0.6 -0.35 ...)"` (vertically flipped, skewed and squashed), blurred with stdDeviation 3, at opacity .28 under a vertical fade mask. That gives coloured squares on stone, like the Richter floor photo.
6. **Restyle the highlight word.** In `css/aesthetics/religious-futurism.css`, set `.ab-hl` colour to `var(--ab-gold-hi)`, or to the accent lifted through `rfGlass(accent, 70, 40)` and capped at 55% saturation. Keep the tapered 1px rule.
7. **Turn the CTA into a lit window.** In `.ab-cta`:
   - `background: repeating-linear-gradient(90deg, var(--ab-leading) 0 1.5px, transparent 1.5px 22px), radial-gradient(120% 150% at 50% 0, var(--ab-glass), var(--ab-glass-deep))`.
   - Drop the outer glow to `0 0 14px var(--ab-halo)` (half the current alpha).
   - The button becomes a strip of panes, not paint.
8. **Clean up the deck patterns.** In `js/patterns/fit.js` `'religious-futurism'`:
   - Delete `kaleidopix` and `pixelquilt`.
   - Lead with `bloomgrid` ("Mirrored pixel bloom": square pixels mirrored around a quiet middle, Richter plus mandorla) with brand colourway and tone 0.5.
   - Then add `gradpanes` ("Gradient panes", which reads as blown glass), `arcrise` (concentric bands rising over upright bars, which reads as apse plus organ pipes), `marble` and `burst`.
9. **Make the hero monumental.** In `css/aesthetics/religious-futurism.css`, change `.ab-art` `--ab-art-ratio: 800 / 420`, so the windows rise into the headline's silence. In `art()`, set the central window to `win(400, 210, 10)`, which makes it about 26% of the width.

### Keep
- The arched palette chips with leading grids (`.ab-chip::after`).
- The ogive-capped cards with a gold 1px rim.
- The canonical-hours and Roman-numeral annotations.
- The rosary-bead progress.
- The nimbus tick ring.
- Seeded, mirrored lanes. That really is Richter's method; don't lose the mirroring.
- The light-mode bone ground.

### Deck
- **Cover:** remove or replace the kaleidopix band (fix 8). The cathedral is about 24% of the slide height, so it's too small. Let it take the lower 55% and drop the band entirely: the `rules.do` says "never more than three forms per view".
- **Material slide:** repeats the cover art, so set `deck.materialStage: 'pattern'` and use bloomgrid.
- **Patterns slide:** the textile tiles go (fix 8).
- **Do/Don't:** text only. One small visual per column (a gold-fill swatch crossed out) would make the rules legible at a glance.

---

## 2. Cybersigilism — Score 4/10 · Rework

The chrome, the frame ornament and the state wreaths are close. The hero sigil, which is the signature, is the wrong drawing. Real cybersigils are **curved, swelling, hooked blades** around a **vertical spine**, with **enclosed negative-space cells**, chrome shading and **4-point star glints**. Ours is a straight-segment binary fractal fanning **horizontally**, so it reads as a snowflake, frost, lightning or a neuron diagram.

### References
- Aingelblood (A.i), *Unholy Seraphim* — https://www.cocreate.ink/tattoos/cybersigilism/unholy-seraphim — the style's originator. The piece has a dominant vertical spine, curling C- and S-hooks closing into almond and teardrop cells, two long thin horizontal lances crossing the mass, and needle tips radiating. Zero straight branches. (viewed)
- CO:CREATE, "8 cybersigilism tattoo artists you should know" — https://www.cocreate.ink/articles/8-cybersigilism-tattoo-artists-you-should-know — the canonical survey. (viewed)
- DanyKim (Busan) — https://www.cocreate.ink/artists/danykim — strokes swell to about 4× width mid-length and taper to needle points. The shading is metallic, with a bright core and dark edges. Junctions carry 4-point sparkle stars. (viewed in the article)
- Sadan (@4dan_blk) — https://www.instagram.com/4dan_blk/ — a closed chrome lattice: thorns loop back to form voids, and tips hook. (viewed in the article)
- Chainsmaiden — https://www.instagram.com/chainsmaiden/ — the hairline variant: 0.5–1px, but still curved and mirrored. (not viewed)
- Firekeeper — https://www.instagram.com/firekeep3r/ — large-scale back pieces following the spine, which is the vertical architecture. (not viewed)
- CO:CREATE, "The rise of cybersigilism" — https://www.cocreate.ink/articles/rise-of-cybersigilism-tattoo-trend — the neo-tribal and Y2K lineage. (not viewed)
- Chrome Hearts — https://www.chromehearts.com — sterling silver plus blackletter. Silver is sculpted and specular, never a flat grey line. (not viewed)
- HUNGER, "The best of chrome font accounts" — https://hungermag.com/editorial/the-best-of-chrome-font-accounts — chrome lettering whose terminals grow thorns. Type and ornament are one system. (not viewed)
- Sectra Chrome (Creative Market) — https://creativemarket.com/alitdesign/291972672-Sectra-Chrome-Typeface — a sharp textura with chrome treatment: the type register the style uses, far crisper than Grenze Gotisch. (not viewed)

### Where it falls short (ranked)
1. **The hero sigil uses the wrong geometry.** **High.**
   - Refs: curved, swelling, hooked blades; closed cells; a vertical spine; horizontal lances.
   - Ours: `csGrow()` (`js/aesthetics/cybersigilism.js` lines 50–60) draws straight triangles, forks at 28° to depth 4, and has three mains leaving horizontally (`mains` angles −0.62, 0, 0.62). The result is a radial 6-arm star (`adv-cybersigilism-A.png` hero; `D.png` shows it plainly as a snowflake).
   - The file's own `materials[0]` says "curve once in an S", and the art ignores it.
2. **The stroke has no swell or chrome.** **High.**
   - Refs: the width profile is 0, then max around 35%, then 0, with a bright core and dark edges, like polished metal.
   - Ours: the width tapers linearly from a 2.2px root, and the fill is one horizontal `linearGradient` across the whole half, so the gradient doesn't follow the stroke. At board scale everything reads as 1px grey wire.
3. **There's no negative space and no density centre.** **High.**
   - Refs: the mass is concentrated at the centre, with enclosed voids, thinning to needles at the edge.
   - Ours: density is even everywhere, and the fractal reaches the frame edges, so it reads as a texture rather than an emblem.
4. **There are no glints.** **Med.** The refs place 4-point stars at junctions, which carry the "cyber" sparkle. Ours uses round dot `nodes` only.
5. **The type is soft and beery.** **Med.**
   - Ours: Grenze Gotisch at weight 700 (`--cs-hw`), a rounded, chunky Fraktur-ish face. It reads as a craft-beer label or a medieval-fair sign. The style wants a sharp textura with hairline thorn extensions.
6. **Raw palette blocks break the "cold" rule.** **Med.**
   - Ours: three full-saturation chamfered chips (orange, teal, yellow) are the loudest pixels on the board (`adv-…-A.png` palette row). The aesthetic says client colour is "only cold light".
7. **Warm glow.** **Low.** The "alive" glow is raw accent yellow (`--cs-hl-glow: alpha(t.accent, .4)`), which reads as candlelight. The selected-tab dot and progress heads are also raw yellow.
8. **Light mode reads as a pencil sketch.** **Low.** Graphite fractal on pale grey (`B.png`) looks like a botanical frost sketch.

### Off-key / cliché
- The hero reads as a snowflake, frost crystal, lightning or a neural-network illustration.
- The deck's `seafan` tile is literally two leafless trees. `blades` is scattered leaves. `rods` (cover band and closing strip) is a tangle of twigs. `glyphgrid` is a dot matrix. None of the six suite entries is a sigil (`dk/cybersigilism-patterns.png`).
- The "N 47°21′ / E 008°32′" survey annotations come from the HUD and blueprint vocabulary, not tattoo flash. Keep at most one.

### Fixes (ranked)
1. **Rewrite the sigil generator around curved blades.** `js/aesthetics/cybersigilism.js`: replace `csTri`/`csGrow` with a `csBlade(out, p0, c1, c2, p3, wMax)` that samples a cubic Bézier at 16 steps.
   - Half-width w(u) = wMax · sin(π·u^0.7) · (1−u)^0.4. This peaks around u = 0.3 and comes to a needle tip.
   - Emit left and right offsets as one closed polygon.
   - Primaries use wMax 4–6, secondaries 2–3 and barbs 1–1.5.
   - Each blade bends once (|c1|, |c2| offsets about 0.35·len, opposite signs, which gives the S). The last 15% hooks back 50–70°.
2. **Recompose the hero vertically.** In `art()`:
   - **Spine:** cx ± 0, from y 8 to 352, wMax 5. Add a diamond lozenge at y 120 and y 240.
   - **Wings:** 3 per side leave the spine at y ≈ 110/180/250, sweeping up and outward (angles −1.1, −0.5, +0.35 rad), each about 150–210 long. Their tips curl back toward the spine.
   - **Cells:** 2 pairs of mirrored C-blades meet at the spine to enclose almond voids (about 40×70).
   - **Lances:** 2 thin straight lines at y 150 and y 210, wMax 0.8, running about 70% of the width.
   - Keep the brand-seeded ±8% nudge and the exact `<use>` mirror.
   - Keep the mass within the central 70% of the width so it reads as an emblem.
3. **Render chrome per blade.** Draw each blade twice:
   - First pass: full polygon in `l3` (`#5B6572`).
   - Second pass: an inner polygon at 0.38× width in `l1`, with a `feGaussianBlur` stdDeviation 0.4.
   - Add a single specular 4-point star at 3 junctions: a 4-ray path with r 6/1.2, in `l1`; one of them in `--cs-cold`.
   - This replaces the flat horizontal `${id}g` gradient.
4. **Make the deck suite on-key.** `js/patterns/fit.js` `'cybersigilism'`:
   - Remove `seafan` and `blades`, and move `rods` off the lead.
   - The lead should be a new `sigillace` family, ideally in `js/patterns/families/organic2.js`: tile the new `csBlade` crest at 3 scales, mirrored, with a tone of about 0.55.
   - Until it exists, lead with `flow` (silver filaments), then `stipple` and `glyphgrid`.
5. **Sharpen the type.**
   - `js/aesthetic-meta.js`: set pairings[0] to `['Pirata One','Inter']`, which is crisper than Grenze.
   - `js/data.js`: add `Texturina` (Google Fonts textura, 400–700) or `UnifrakturMaguntia`, classed blackletter, and make it the first pick.
   - `css/aesthetics/cybersigilism.css` `.ab-hl::before/::after`: grow a data-URI thorn swash from the first and last glyph, 0.7em long, tapered, `--cs-l2`, offset −0.1em. This is the chrome-type move.
6. **Make the palette cold.** In `css/aesthetics/cybersigilism.css`, render the primary, secondary and accent `.ab-chip` as obsidian chips with a 2px inner edge and an inner glow in that role's cold-light value (`csCold`, using one per role via tokens). Show the raw hex as a 6px dot beside the label.
7. **Cool the warm accent.**
   - `tokens()`: `--cs-hl-glow: alpha(csCold(t.accent), .45)`.
   - The tab dot and progress head use `--cs-cold`. Raw accent stays only for the single node in the hero.

### Keep
- The silver chamfered CTA (`.ab-cta` with `--cs-silver` and `--cs-chamfer`). It's the most "cyber" element on the board.
- The thorn-wreath state discs: Etched, Lit, Bound.
- The corner-bracket card frames with sprig thorns.
- The centre-out tapered flourish dividers.
- Exact mirroring through `<use>`.
- The clear zone between ornament and text.
- Obsidian at 2.4% L.

### Deck
- **Cover:** the sigil sits small at the right, about 30% width. Real cybersigil posters centre one emblem at full height. Put the new vertical crest behind the right half, at about 90% of the slide height, and drop the twig band.
- **Patterns slide:** fix 4.
- **Material slide:** reuses the hero, which is fine once the hero is right.
- **Typography slide:** "Aa" in Grenze is the weakest specimen. It changes automatically with fix 5.

---

## 3. Biomechanical Gothic — Score 4/10 · Rework

The type, colour discipline, tube progress and texture grain are restrained and tasteful. The hero shows no vertebrae, which are the signature module. "The Nave" is nine smooth, flat-filled, onion-pointed bands with tick marks. It reads as a Mughal or Moorish arcade, or a Wes Anderson corridor, drawn in flat vector. Giger's bar and Sedlec are *made of* hundreds of repeated, rounded bone modules, lit from above with deep occlusion between them.

### References
- HR Giger Museum Bar, Gruyères — https://www.hrgigermuseum.com/gigerbar — parabolic ribs, each built from about 30–40 stacked vertebrae. Every vertebra carries a highlight and a shadow gap. The ribs cross diagonally into a vault. Warm brass-and-bone monochrome. (viewed)
- We Heart, "HR Giger Museum Bar" (photo by Annie Bertram) — https://www.we-heart.com/?p=37815 — lamp pools on cast surfaces; the ribs converge at the vanishing point; the bar-top rim is a single polished metal edge. (viewed)
- Sedlec Ossuary, Kutná Hora — https://en.wikipedia.org/wiki/Sedlec_Ossuary — the module repeated into garlands, chandelier and arches, with a uniform bleached bone tone. The repetition is the ornament. (viewed, thumbnail)
- Zdzisław Beksiński, architectural "fantastic period" — https://www.wikiart.org/en/zdzislaw-beksinski — ochre and umber haze and aerial perspective. Forms dissolve into fog with distance. (viewed)
- Scorn (Ebb Software, 2022) — https://scorn-game.com — cast-flesh architecture rendered as stone and metal, with ribbed doorways and tube runs. A single sculpted material. (not viewed)
- Tsutomu Nihei, *Blame!* — https://en.wikipedia.org/wiki/Blame! — megastructure scale. Tiny lights in vast ribbed darkness. (not viewed)
- Gaudí, Casa Batlló ("house of bones") — https://en.wikipedia.org/wiki/Casa_Batll%C3%B3 — bone-like mullions and columns, with grown rather than drawn forms. (not viewed)
- Santiago Calatrava, WTC Oculus — https://en.wikipedia.org/wiki/World_Trade_Center_Transportation_Hub — repeated white ribs as the entire architecture; dark luxury made of rhythm. (not viewed)
- Iris van Herpen couture — https://www.irisvanherpen.com — ribbed, layered, grown surfaces in a monochrome palette. (not viewed)
- Rick Owens furniture (alabaster, bone, ox-bone pieces) — https://www.rickowens.eu — the dark-luxury brand register: cast, monolithic, matte, warm grey. (not viewed)

### Where it falls short (ranked)
1. **There are no vertebral modules.** **High.**
   - Refs: every arch is a chain of rounded segments, and the repetition *is* the style.
   - Ours: `art()` (`js/aesthetics/biomechanical-gothic.js` lines 129–159) strokes each arch as one smooth band (`stroke-width 0.5+3.4s`) plus an inner hairline, with 4–8 short ticks. At board size it reads as a railing or a tunnel lining (`adv-biomechanical-gothic-A.png` hero).
2. **It's flat vector with no volume.** **High.**
   - Refs: modelled form, a specular top, occluded gaps, lamp pools.
   - Ours: every ring wall is a flat `fill`, every rim a flat stroke, and there are no gradients anywhere in the SVG. Next to Giger and Beksiński, flatness is the giveaway.
3. **The arch profile is wrong.** **Med.**
   - Refs: Giger ribs are parabolic or catenary, rounded like a ribcage. Gothic arches are two-centred and equilateral.
   - Ours: the `dPath` cubic control points (x0, e − b·0.55 → cx − a·0.3, apex + b·0.3) make a bulbous shoulder and a needle apex: an ogee or onion arch, which reads as Islamic or Mughal. The arch-top cards (`border-radius: 120px 120px 0 0 / 64px 64px 0 0`) repeat the 2023 "arch card" Instagram trend.
4. **No atmosphere.** **Med.**
   - Refs: Beksiński fog, with distance going warm, hazy and lighter.
   - Ours: depth comes only from scale. The far rings are a uniform dark, and the lamp is a 7-unit dot.
5. **The floor spine reads as records.** **Med.** The `spine` ellipses with dark holes read as vinyl records, washers or a target, not vertebrae. The nearest one is cut by the frame bottom (A0 crop, y ≈ 770).
6. **Gumball swatches.** **Med.** The palette chips are glossy full-saturation spheres (orange, teal, yellow marbles, `.ab-chip` border-radius 50% plus inset highlights). They read as candy and contradict "colour is a dim glow".
7. **The heading face is too editorial.** **Low–Med.** Cormorant Garamond 400 in sentence case reads as skincare or wedding editorial. It's elegant, but it isn't "carved relic".
8. **Soft UI.** **Low.** The tabs as dark pills with a red rim and the bone pill CTA with grip lines read as Soft Form or neumorphic hardware, not cast bone.

### Off-key / cliché
- The hero reads as a Moorish arcade or a "tunnel of arches" stock vector.
- The deck cover band and closing strip are `rods` ("Chained rods"). On the cover at full width they read as worms or intestines: unintentionally gore-adjacent, which the rules forbid.
- `seafan` in the deck is bare trees, and `relief` ("Routed board") is a PCB. Both are off-key.
- The arch-top cards are an interior-design trend, not biomechanics.

### Fixes (ranked)
1. **Build the arches from vertebrae.** `js/aesthetics/biomechanical-gothic.js` `art()`:
   - For each arch, sample the outer curve at n = round(18 + 14·s) points.
   - At each point, draw one vertebra: a rounded rect (rx 40%) with w = 5.2s and h = 3.4s, rotated to the tangent, with a 0.5s gap to the next.
   - Fill it with a shared `<radialGradient>` (cx 40%, cy 30%): `bone`, then `metalHi` at 55%, then `castLo` at 100%.
   - Give every second vertebra a transverse spur (a small tapered triangle, length 3s, pointing outward).
   - Replace the smooth `rims` band with the chain, and keep the inner hairline as the "spinal cord" in `P.glow` at opacity .5. This one change carries most of the score.
2. **Change the arch profile.**
   - Option A, preferred: switch `dPath` to a parabolic rib, `Q`-curved, with control point (cx, apex − 0.15·Ht) from each springer, for the Giger ribcage.
   - Option B: a true two-centred Gothic arch, reusing `rfOgive` from RF.
   - Drop the onion shoulder.
   - In `css/aesthetics/biomechanical-gothic.css`, change the card `border-radius` to `50% 50% 0 0 / 38% 38% 0 0` and add a ribbed rim: `.ab-card::after` with mask `repeating-conic-gradient(from -90deg at 50% 100%, #000 0 1.2deg, transparent 1.2deg 2.4deg)` over a 6px band, so the card cap is segmented.
3. **Add volume and fog.**
   - Give each ring wall a vertical `linearGradient`: `castHi` at top to `castLo` at bottom.
   - Over the whole SVG, add a radial haze centred on the lamp, r 60%, in `t.mix(P.glow, P.bone, .5)` at opacity .18, fading to 0.
   - Raise the lamp core to r 4 with a 3-stop glow (r 24 at .10, r 10 at .25).
   - Add a floor highlight: an ellipse at vpy+30, 60×8, glow at .12.
4. **Replace the floor spine.** Use a true vertebral column on the floor: trapezoid bodies with 2 lateral processes each, using the same module as fix 1. Alternatively, remove the spine and let the converging ribs carry it. Clamp the nearest segment so it sits inside the frame.
5. **Restyle the swatches as organs.** In `css/aesthetics/biomechanical-gothic.css` `.ab-chip`:
   - Use `border-radius: 54% 46% 50% 50% / 48% 52% 48% 52%` (the state-organ shape already used in `materials`).
   - Background: `radial-gradient(circle at 50% 55%, <role colour> 0 22%, transparent 60%), var(--ab-bi-cast-hi)`. The brand colour shows as a glowing core in cast bone, not a marble.
   - Canvas and ink stay solid.
6. **Promote the inscriptional caps.** `js/aesthetic-meta.js`: set pairings[0] to `['Marcellus','Spectral']`. In `.ab-headline` (`data-hcls="deco"`), use uppercase, letter-spacing 0.06em and weight 400. Marcellus's flared terminals read as carved, and that keeps Cinzel distinct for RF. Cormorant moves to the second pairing.
7. **Rework the deck suite.** In `js/patterns/fit.js` `'biomechanical-gothic'`:
   - Lead with `waves` ("Tubing runs"). On the patterns slide it is the most biomechanical tile: overlapping ribbed shells.
   - Then `colony`, then `tissue`.
   - Remove `seafan` and `relief`.
   - Move `rods` out of the lead, or remove it (the worms risk).

### Keep
- The warm charcoal canvas (`#15130F` lineage) and the grain overlay.
- The tube progress bars with glow fill.
- The organ state discs (Dormant, Breathing, Awake). They're the best "grown" elements on the board.
- The tick-ruler footer.
- The palette discipline (glow = desaturated primary, lightness ≤ 42).
- The "Plate III / Fig. VII" specimen captions.
- The ban on gore and blackletter.

### Deck
- **Cover:** the hero sits at a small inset (about 37% width) next to a large headline. Biomech references are immersive. Let the nave bleed to the full right half and drop the rods band (fix 7).
- **Material slide:** repeats the cover art, so set `deck.materialStage: 'pattern'` with `waves`.
- **Patterns slide:** remove the trees and the PCB.
- **Do/Don't:** text only, and "Show gore or flesh textures" sits on a deck whose cover band looks like worms. Fix the band first.

---

## Fix log (fx3)

Worker fx3, 2026-10-11. Files changed: `js/aesthetics/{religious-futurism,cybersigilism,biomechanical-gothic}.js`, `css/aesthetics/{religious-futurism,cybersigilism,biomechanical-gothic}.css`. Shared font and pattern-suite changes were landed by fx6; the CSS type treatments here assume them (Unbounded 200, Pirata One, Marcellus).

### Religious Futurism
1. Glass recipe: a fixed pool of 8 neutral cathedral hues (each in 3 blown-glass lightness steps, lifted for transmitted light) makes up 24 of 37 pool slots (65%). The brand families take the other 13, with chroma capped at 72%. The green palette now reads as glass, not a terminal.
2. Panes and armature: `cell = 8` on a global grid. Saddle bars every 7 rows (lead plus a gold catch-light), a 2px mullion on the three large windows, and an oculus in the central window: two leaded rings (9 and 18 panes, mirrored) around the accent jewel.
3. Blown-glass variation: a per-pane sheen pattern (light at the top, dark at the bottom, aligned to the grid) plus a faint feTurbulence mottle inside the window clip. No blend modes.
4. Type treatment: when `data-hcls="wide"`, the headline is weight 200, tracked a fixed 0.32em (the board's `--ab-tr` damping is bypassed), at ×0.62 size, with trailing-tracking compensation in the hero only. At 390px it uses 0.2em.
5. Floor light: the beams are gone. The mosaic itself is flipped, sheared and squashed onto the floor, blurred, and faded out with an SVG mask.
6. Highlight word: `--ab-hl-ink` is gold-hi on obsidian and gold-mid on bone.
7. CTA: now a leaded strip of panes (leading every 22px over the glass radial) with the halo at half strength. A glass-coloured text-shadow keeps the label legible over the leading.
8. Deck suite: landed by fx6 (Pixel bloom lead). `deck.materialStage: 'pattern'` is set.
9. Monumental hero: art ratio 800/420, and the central window is 208 of 800 units (26%).
- Deck cover: the band is dropped on the cover, and the cathedral stands on the bottom edge at about 58% of the slide height under a two-line headline.

### Cybersigilism
1. Generator rewritten. `csBlade` builds a cubic S-bend (opposite-side control points at 0.35·len) with a hook on the last 20% (15% was invisible at board size). Half-width follows w(u) = wMax·sin(π·u^0.7)·(1−u)^0.4, with a small root so blades join the spine. The output is a closed polygon.
2. Vertical composition: a spine (8→352), three wings per side (y 108/180/252) curling back, hooked secondaries, bridges closing teardrop cells, a crown and tail of needles, almond C-cells around the spine, lances at y 150/210, lozenges at 120/240 plus the central initial lozenge. There is a ±8% seeded reach nudge and an exact `<use>` mirror. The mass stays within the central ~70%.
3. Chrome: three passes per blade (l3 base, l2 at 0.7 width, l1 core at 0.38 width with a 0.4 blur). Three 4-point glints, one in cold light, sit off-axis. The flat horizontal gradient is gone.
4. Deck suite: landed by fx6 (Silver filaments lead).
5. Thorn swashes: hooked tapered data-URI swashes (baked per mode) grow from the first and last letters of `.ab-hl`.
6. Palette: primary, secondary and accent chips are obsidian (pale in light mode) with a 2px cold-light inner edge and inner glow. The raw colour appears only as a 6px diamond beside the role name. Alpha tokens are used, not color-mix, so export stays safe.
7. Cold accent: `--cs-hl-glow` uses `csCold(accent)`. The tab dot and progress head use `--cs-cold`. Raw accent survives only as one node on the hero spine.
- The survey annotations are cut to "SIGIL N° 031" and "MIRRORED ABOUT X". Material and rule copy now describe blades.
- Deck cover: the band and the meta row are dropped. The crest fills the right half at about 75% of the slide height, the outer wings fade into obsidian through a canvas-coloured overlay (not a mask), and the headline column keeps clear.

### Biomechanical Gothic
1. Vertebral ribs: each of the 9 arches is a chain of n = round(18+14s) shaded vertebrae per side. Each is a rounded block turned to the tangent with a bone → metalHi → castLo radial gradient and a gap between blocks, with a transverse spur on every second one and a glow "spinal cord" at 0.5 just inside.
2. Profile: a parabolic, catenary-like rib that springs near-vertical and rounds over the crown. There is no onion or ogee shoulder. Cards use `50% 50% 0 0 / 120px 120px 0 0` (90px at narrow sizes) rather than 38% of height, because a height-relative cap clipped content on tall cards at 390px. The ribbed rim is an SVG dashed band, not a CSS mask, so it exports.
3. Volume and fog: ring walls have a castHi → castLo vertical gradient. A haze veil inside each nearer arch stacks Beksiński fog on the far nave. There is a lamp-centred haze, the lamp is a 3-stop glow (r 24/10/4), and a floor highlight sits under it.
4. Floor: the record-like ellipses are replaced by a vertebral column of trapezoid bodies with two lateral processes. The nearest one stays inside the frame.
5. Swatches: the brand roles are organ pods (organ radius, cast bone with pores, and the role colour as a glowing core). Canvas and ink stay solid.
6. Type treatment: `data-hcls="deco"` (Marcellus) is uppercase at 0.06em, weight 400, ×0.8 size in the hero. The pairing was landed by fx6.
7. Deck suite: landed by fx6 (Tubing runs lead). `deck.materialStage: 'pattern'` is set.
- Deck cover: the band and the meta row are dropped. The nave is one plate filling the right half between the header rule and the foot.

### Verification
- `node tests/run.js`: all passed. `node scratchpad/t5/harness.js`: briefs 144, fails 0. `node scratchpad/t5/src-verify-p5.js`: families 53, fails 0, map mismatches 0.
- Gore (`fx3/gore.sh`, 4 configs × 10 slides × 3 keys): 0 issues.
- Board: 390px overflow is 0 for all three. The only console error is the favicon 404.
- Sheets: `scratchpad/adv/fx3/sheet-fx3-<key>.png` (board) and `scratchpad/adv/fx3/sheet-deck-<key>-rec|oth.png` (deck).
