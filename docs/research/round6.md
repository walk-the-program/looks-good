# Design research R6: twelve new aesthetics for the Branding Designer (round 6, phase 1)

Packet: R6 rev 1 (docs/round6/PLAN.md, phase 1). Writer: R6 (Opus design researcher). Date: 2026-10-11.
Builders (P6, B6a-c) read their aesthetics' sections in full. The two summary tables at the end
(aesthetic table, font table) are in the round-5 format so P6 can scaffold straight from them.

Evidence tags (same as round 5):
- [V] observed or read directly this session (page rendered in a headless browser and screenshotted,
  or the page text fetched and read).
- [S] taken from a search-result summary or a page only partly read; secondary.
- [K] design knowledge or inference. Build from it, but do not cite it as sourced.
- "(not viewed)" on a reference means the URL was checked to resolve (HTTP 200, or 403 from bot
  protection where noted) but the page itself was not inspected; the mechanism given is [K].

Screenshots taken this session (scratchpad only, not in the repo): frutigeraeroarchive.org, 98.css,
cameronsworld.net, inat.fr, charleyharperartstudio.com, muchafoundation.org, dreamland.co.uk,
oatly.com, kinto-usa.com, olly.com.

---------------------------------------------------------------------------

## 0. How the twelve were chosen

### 0.1 What is popular now (2024-2026), with sources
- **Kittl 2026 trend report** [V] https://www.kittl.com/blogs/graphic-design-trends-2026/ — #1 Naive
  design, #2 Type collage, #3 Blueprint, #4 Trinket design, #5 Punk grunge, #6 Future Medieval,
  #7 Distorted portrait, #8 Surveillance, #9 Grainy blur, #10 Signal graphics; special mentions
  Frutiger Aero and Kid Core. (Kittl's 2025 list is the source of most of round 5: corporate
  vandalism, religious futurism, xerox punk, acid graphics, cybersigilism, etc. Round 6 is the
  natural continuation, minus what we already have.)
- **Pinterest Predicts 2026** [V headings] https://nssmag.com/en/lifestyle/43770/pinterest-predicts-2026-aesthetic-trends
  — Gimme Gummy, Glamoratti, Poetcore, Neodeco, Brooched, FunHaus, Pen Pals, Vamp Romantic, Cool
  Blue, Afro Decor, Mystic Outlands, Glitchy Glam, Khaki Coded, Extra Celestial, Wilderkind, Throwback
  Kid, Opera Aesthetic. Figures [S]: "circus interior" +130%, "vintage circus aesthetic" +70%,
  "jelly blush" +130%, "gummy bears aesthetic" +50%, "the poet aesthetic" +175%, "poet core" +75%
  (FashionUnited, https://fashionunited.uk/news/fashion/poetcore-opera-aesthetic-and-brooches-key-style-predictions-from-pinterest-for-2026/2025121085277).
- **Adobe Express, Top 10 graphic design trends 2026** [V text] https://www.adobe.com/express/learn/blog/graphic-design-trends-2026
  — trend 1 "All our senses, to the max": "Puffy, soft, and squishy textures are almost a delicacy
  now"; a backlash against hi-tech toward organic, analog, human design.
- **Digital Synopsis, Top 20 graphic design trends 2026** [V headings] https://digitalsynopsis.com/design/graphic-design-trends-2026/
  — includes #8 Nature-inspired design, #10 Utilitarian design ("signage systems, industrial
  graphics, and wayfinding"), #11 Pixel art revival, #13 Bold minimalism, #16 Handmade and collage,
  #18 Retro-futurism, #19 Maximalism.
- **Jukebox 2026 trendbook** [V headings] https://www.jukeboxprint.com/blog/20-of-the-biggest-graphic-design-trends-for-2026
  — custom iconography, illustrations, mono fonts, patterns, stickers, organic shapes, playful
  design, retro-futurism, serif fonts, sustainability (kraft, earth palettes, hand-drawn).
- **G2 2026** [V headings] https://learn.g2.com/graphic-design-trends — maximalist colour, mixed-media,
  organic shapes, retro mashups, serif fonts, handcrafted imperfection.
- **Creative Bloq on Frutiger Aero** [V partial] https://www.creativebloq.com/news/frutiger-aero-aesthetic-resurgance
  and **CARI** [V] https://cari.institute/aesthetics/frutiger-aero.
- **Shopify 2025** [S] https://www.shopify.com/blog/graphic-design-trends — "the rejection of digital
  sterility and the return of ornamentation".

### 0.2 Long list, scored
P = popularity evidence 2024-26, D = distinctness from the 36 existing aesthetics, S = suitability
for a procedural UI board + 10-slide deck (no photos, drawable in SVG/CSS). Each 1-3. Score = P×D×S.

| Candidate | P | D | S | Score | Decision / reason |
|---|---|---|---|---|---|
| Frutiger Aero | 3 | 3 | 3 | 27 | **Pick.** Kittl special mention, CARI, Creative Bloq; nothing like it in the set |
| Naive doodle / Kidcore | 3 | 2.5 | 3 | 22.5 | **Pick.** Kittl #1 + Kid Core |
| Big Top / FunHaus circus | 3 | 3 | 2.5 | 22.5 | **Pick.** Pinterest 2026 FunHaus, circus stripes |
| Gummy / jelly | 3 | 2 | 3 | 18 | **Pick.** Pinterest Gimme Gummy + Adobe #1 squishy |
| Dark academia / Poetcore | 3 | 2.5 | 2.5 | 18.75 | **Pick.** Pinterest Poetcore, Pen Pals |
| Old web / Webcore (Web 1.0) | 2.5 | 2.5 | 3 | 18.75 | **Pick.** Neocities revival, 98.css |
| Transit wayfinding (utilitarian) | 2 | 2.5 | 3 | 15 | **Pick.** DigSyn #10 utilitarian/wayfinding |
| Trinket / curio cabinet | 2.5 | 2.5 | 2.5 | 15.6 | **Pick.** Kittl #4, Pinterest Brooched |
| Gorpcore / trail utility | 2.5 | 2.5 | 2.5 | 15.6 | **Pick.** Pinterest Khaki Coded, Artribune 2026 |
| Wabi-sabi / Japandi | 2.5 | 2.5 | 2.5 | 15.6 | **Pick.** Vista 2025, Kittl (organic textures), Japandi |
| Atomic mid-century | 2 | 2.5 | 2.5 | 12.5 | **Pick.** Herman Miller 2024 rebrand, Clark 2025 show |
| Art Nouveau | 2 | 2.5 | 2 | 10 | **Pick.** Interiors/type forecasts 2025-26 (mixed evidence, stated) |
| Swiss International Style | 2 | 1.5 | 3 | 9 | Runner-up: evergreen not trending; overlaps Raw Brutalist + Bauhaus Poster + new Wayfinding |
| Grainy blur | 2.5 | 1 | 2 | 5 | Kittl #9, but Mesh Gradient / Aurora Noir / `aura` pattern already own it |
| Future Medieval | 2.5 | 1 | 2 | 5 | Kittl #6, but would be a 4th gothic (Cybersigilism, Biomech, Religious Futurism) |
| Type collage | 2.5 | 1 | 2 | 5 | Kittl #2 = Mixed Type + Xerox Punk |
| Old money / country club | 2 | 1.5 | 2 | 6 | Pinterest Glamoratti/Brooched; collides with Dark Academia + Editorial Serif |
| Newspaper broadsheet | 1.5 | 1.5 | 2.5 | 5.6 | Close to Editorial Serif |
| Vaporwave | 1.5 | 1.5 | 2 | 4.5 | Splits between Y2K Chrome, Retro-futurist and Old Web |
| Synthwave / Outrun | 1.5 | 1.5 | 2 | 4.5 | Cyber HUD + Y2K Chrome + Retro-futurist cover it |
| Solarpunk | 1.5 | 1.5 | 1.5 | 3.4 | Thin graphic vocabulary; overlaps Aero + Nouveau |
| Afrofuturism / Afrohemian | 2 | 3 | 1 | 6 | Culturally specific; not appropriate as a generic skin for any client |
| Cottagecore / Wilderkind | 2 | 1.5 | 1.5 | 4.5 | Peak 2020-22; overlaps Nouveau + Naive |
| Scrapbook / zine collage | 2 | 1 | 2 | 4 | Xerox + Xerox Punk + Neo-Brutal Pop stickers |
| Skeuomorphism revival | 2 | 1 | 2 | 4 | Soft Form, Industrial Device, Aero |
| Swiss punk / New Wave | 1 | 1.5 | 2 | 3 | Mixed Type + Riso |
| Surveillance / Signal / Punk grunge / Blueprint | 2.5 | 0 | – | 0 | Already exist (Blob Tracking, Pirate Broadcast, Xerox Punk, Blueprint) |
| Distorted portrait | 2 | 2 | 0.5 | 2 | Photo-dependent, not procedural |
| Aliencore / Extra Celestial | 2 | 1 | 1.5 | 3 | Holo Iridescent |

### 0.3 Balance of the picks
- Families: Tactile 3 (wabi-sabi, gorpcore, gummy), Graphic 4 (naive-doodle, mid-century,
  transit-wayfinding, big-top), Digital 1 (old-web), Print & editorial 3 (dark-academia,
  art-nouveau, curio-cabinet), Luminous 1 (frutiger-aero). Tactile (5) and Print (6) were the
  thinnest families; this round adds most there.
- Modes: 8 light, 4 dark (dark-academia, transit-wayfinding, old-web, curio-cabinet). The existing
  36 split about evenly; the new set leans light because the 2026 evidence is almost all about warm,
  human, light work (naive, gummy, circus, Aero, wabi-sabi).

---------------------------------------------------------------------------

# 1. FRUTIGER AERO (the sunny default future)

**key** `frutiger-aero` · **Name** Frutiger Aero · **Descriptor** Glossy · Airy · Hopeful ·
**mode** light · **family** Luminous · **slideShape** soft ·
**material** "Gloss" · Rest / Shine / Pressed (button)

## 1.1 The one idea
Technology as good weather. A high-key world of sky, water, grass and white light in which every
control is a wet, glossy gel object lit from above, and the hero object is mirrored on a wet floor.
The optimism is literal: blue sky, green hill, bubbles.

## 1.2 References
1. **Frutiger Aero Archive** [V] https://frutigeraeroarchive.org/ — a fan museum built in the style.
   Black glass header with a soft gloss band; a left nav of dark glossy pill buttons, each with a
   small icon, the active one in green gel; a macro grass-and-bokeh photo as page ground; content in
   rounded panels with a 1px light inner rim; humanist sans throughout. The page states the term was
   coined in 2017 by Sofi Xian of CARI and that the look was popularised by Apple's Aqua and Windows.
2. **CARI, Frutiger Aero entry** [V] https://cari.institute/aesthetics/frutiger-aero — lists the
   motifs: skeuomorphic UI, glossy design, Frutiger/humanist sans, tertiary colour palettes,
   glassy/transparent materials, aurora photos, bokeh, macro grass. Period ~2005-2013. Name from
   Vista's "Aero" guideline + Adrian Frutiger's face (which inspired Segoe UI).
3. **Kittl 2026, special mention #1** [V] https://www.kittl.com/blogs/graphic-design-trends-2026/ —
   "shiny aqua gradients, floating globes, lens flares, and bubble-like typography"; "Best for: Tech
   brands, SaaS startups, digital products".
4. **Creative Bloq, "Why Gen Z is infatuated with the Frutiger Aero design aesthetic"** [V partial]
   https://www.creativebloq.com/news/frutiger-aero-aesthetic-resurgance — bright skeuomorphism,
   glossy textures, "a refreshingly hopeful outlook of the future" as Gen Z's reaction to flat design.
5. **Windows Aero (Vista/7)** (not viewed) https://en.wikipedia.org/wiki/Windows_Aero — translucent
   tinted title bars with blur, a hard diagonal gloss streak, glowing caption buttons, Segoe UI.
6. **Mac OS X Aqua** (not viewed) https://en.wikipedia.org/wiki/Aqua_(user_interface) — the "lickable"
   gel button: opaque saturated pill, white specular cap over the top half, light pooling at the base.
7. **Bliss (Windows XP wallpaper)** (not viewed) https://en.wikipedia.org/wiki/Bliss_(image) — the
   archetype of the environment: one rolling green hill, deep-blue sky, white cumulus. Draw an
   abstract hill; never trace the photo.
8. **Wii Menu** (not viewed) https://en.wikipedia.org/wiki/Wii_Menu — white rounded glossy channel
   tiles, pale-blue frames, friendly rounded sans: the calm, white end of the style.
9. **Frutiger Aero (Wikipedia)** (not viewed) https://en.wikipedia.org/wiki/Frutiger_Aero — overview.
10. **iMac G3 / translucent era** (not viewed) https://en.wikipedia.org/wiki/IMac_G3 — the
    "candy" precursor; useful only to show where Aero ends and Gummy (section 11) begins.

## 1.3 Popularity evidence
Kittl 2026 special mention [V]; CARI catalogue entry and archive community [V]; Creative Bloq
feature [V]; Kittl's own "Frutiger Aero ... making a comeback in 2026" page [S]
https://www.kittl.com/blogs/?p=19536; Pinterest 2026 "Cool Blue" [V heading] supports the palette.

## 1.4 Signature mechanisms
- **Gel object** [K], the core recipe for buttons, orbs and icons:
  fill `linear-gradient(180deg, L+35% 0%, base 55%, L-10% 100%)`; **specular cap**: a white ellipse
  covering the top 46-50% of the shape, inset ~4% each side, `linear-gradient(white 85% → white
  15%)`, with a crisp lower edge (no blur) — the "lip" is the tell; **base caustic**: radial
  gradient at bottom centre, base +30% lightness at 60% opacity (light passing through gel);
  **rim**: 1px inner stroke at base -20% lightness; small coloured drop shadow `0 2px 4px
  base@35%`. Label white with `0 1px 1px rgba(0,0,0,.35)`.
- **Aero glass chrome** [K]: panel `rgba(255,255,255,.55)` + backdrop blur 8px, 1px outer
  `rgba(0,0,0,.22)`, 1px inner `rgba(255,255,255,.8)`, and a **hard diagonal gloss streak**:
  `linear-gradient(115deg, rgba(255,255,255,.5) 0 38%, transparent 38.5%)`. The hard edge of the
  streak (not refraction) is what makes it Vista and not Liquid Glass.
- **Wet-floor reflection** [K]: the hero object or wordmark repeated below its baseline,
  `scaleY(-1)`, masked `linear-gradient(to bottom, rgba(0,0,0,.35), transparent 60%)`. The single
  most "Web 2.0" device.
- **Environment layer** [V CARI motifs]: sky gradient, one hill, water ripples, rising bubbles
  (circle + radial highlight at 30%/30% + 1px light rim), bokeh discs (white 10-30%), a lens-flare
  string of rings on a diagonal, and the **aurora swoosh**: 3-5 translucent bezier ribbons of
  decreasing width, white→tint, screen blend.
- **Orbs and globes** as icons: every icon sits in a glossy sphere.
- **Starburst "new" seal** (12-point star polygon) in accent gel; lowercase friendly copy.

## 1.5 Composition
High-key. Horizon at ~62% of the hero height; content in rounded glass windows floating over the
landscape; the wordmark centred with its reflection; a row of 3 rounded feature cards each led by an
icon orb. Area: ~70% sky/white air, ~20% glass, ~10% saturated gel. Nothing is dark except text.

## 1.6 Typography
Humanist sans only (Frutiger, Segoe UI, Myriad in the originals [V CARI]). Google: **Source Sans 3**
(new; Paul D. Hunt's Adobe humanist, Myriad-adjacent) for headings at 300 and UI at 400/600;
**Nunito Sans**, **Figtree** as alternates. Headlines light (300) at large size, sentence case or
lowercase, tracking -0.01em; UI labels 13-15px 600. Never heavy grotesk, condensed or serif.

## 1.7 Colour and brand mapping
- **Fixed:** sky gradient `#2AA7FF → #BFE9FF → #FFFFFF` (horizon), cloud white, gloss white, cool
  panel chrome `#F4F8FB`, text deep blue-grey `#23415A` (never pure black), fixed grass `#6CC24A`
  used only when the client has no usable green.
- **Primary → gel**: primary buttons, the hero orb, active nav pill.
- **Secondary → the hill and aurora ribbons** (if secondary is not a plausible landscape hue, use it
  for the ribbons and keep the fixed grass for the hill).
- **Accent → bubbles tint, starburst seal, toggle-on.**
- Gels must read as candy glass, never mud: raise a dark client colour to L ≥ 45% and keep its
  chroma before building the gel gradient. Text on gel must pass 4.5:1 (white on L ≤ 55%, else
  blue-grey text).

## 1.8 UI translation
- **Buttons:** primary = gel pill (radius 999). Secondary = frosted white glass pill, blue-grey text,
  the same cap at 60%. **Shine** (hover): cap brightens + `0 0 8px base@50%` glow. **Pressed**: cap
  drops to 30%, gradient inverts (darker top), 1px inset shadow — pushed into water.
- **Segmented control:** white glass capsule track with 1px inset shadow; selected segment = gel with
  cap; 1px white separators.
- **Toggle:** glass capsule track; on = gel fill (accent); knob = glossy white orb with cap.
- **Input:** white field, 6px radius, 1px `#9DB7CC` border, inner top shadow; focus = 3px soft cyan
  outer glow.
- **Cards:** rounded 14px frosted panel with a title band carrying the diagonal gloss streak; icon orb
  top-left.
- **List rows:** pale rows; selection = Vista highlight `linear-gradient(#E8F4FF, #CFE8FF)`, 1px
  `#7DA2CE` rim, 3px radius.
- **Progress:** glossy capsule; fill = green or primary gel with 3 faint diagonal highlight stripes
  (static sheen) under the cap.
- **Window chrome:** an Aero title bar (glass + streak) with min/max/close; close is a red gel.
- **Motion:** static-safe. Optional single shine sweep on hover (reduced-motion: none).

## 1.9 SVG hero ideas
1. **Bliss with a wordmark:** sky gradient; two cumulus clusters from overlapping circles; one hill
   path with top-light gradient; a primary gel orb floating above a strip of water with its wet
   reflection; 8-14 bubbles rising; 3 aurora ribbons behind.
2. **Dew macro:** one huge droplet (teardrop path) with an inverted mini-gradient inside (refraction
   of the sky), dew dots on a grass blade.
3. **Desktop moment:** an Aero glass window over the landscape holding the brand's sign-up form with
   gel buttons.

## 1.10 Pattern suite (fit.js proposal; lead first)
1. `aura` "Sky glow" brand `{ layout: 'horizon', blobs: 5, soft: 1, mode: 'glow', strength: 0.8 }`
2. `colony` "Bubbles" brand `{ cells: 20, rings: 2, fuse: 0.8, finish: 'film', nuclei: false }`
3. `blades` "Meadow" brand `{ count: 420, size: 0.9, curve: 0.5, take: 0.7, ink: 'ink2' }`
4. `terrain` "Rolling hills" brand `{ levels: 4, pix: 0.3, dither: 0, style: 'hills' }`
5. `flow` "Aurora swoosh" duotone `{ field: 'swirl', strands: 3, gap: 3, bend: 1.6, weight: 2 }`
6. `oprings` "Lens rings" brand `{ mode: 'lens', centres: 1, freq: 9, warp: 0.05, bands: 'two' }`, tone 0.6
(Liquid Glass already uses aura/halftone-bubbles/waves/gradpanes/flow; this suite avoids its
halftone bubbles, waves and gradpanes, and uses aura/flow with different layout and field.)

## 1.11 Pitfalls
- Sliding into Liquid Glass: clear neutral refraction with no gloss cap and no environment.
- Muddy gels from dark brand colours (fix the lightness, keep chroma).
- Clip-art overload: lens flare on everything, dolphins, globes everywhere. One flare string per view.
- Reproducing Windows/Apple marks, the Windows flag, the Bliss photograph or real wallpapers.
- Gloss on everything: the white air and flat text are what make the gel pop.
- Anime mascots and fan-site clutter (the archive has them [V]; the style does not need them).

## 1.12 Distinctness
- **Liquid Glass** (nearest): clear, colourless, refractive panes with bright rims floating over a
  vivid brand scene. Aero: opaque saturated gel with a hard specular cap, tinted glass with a hard
  diagonal streak, a sky/grass/water environment, wet-floor reflections, humanist type.
- **Y2K Chrome:** dark field, liquid metallic chrome, blobby forms. Aero is light, coloured, aquatic.
- **Holo Iridescent:** near-black with spectral hairlines. Aero has no black and no spectrum.
- **Gummy (new):** translucent candy bodies with coloured shadows, no environment. Aero = gloss
  layer on an opaque gel + nature.

## 1.13 Deck
- Principles: "Sky first, then gloss" · "Every control looks wet" · "Optimism you can see"
- Do: "Put a crisp highlight cap on every primary control." · "Keep sky, water and white air
  dominant." · "Mirror the hero object on a wet floor."
- Don't: "No dark backgrounds and no muddy gels." · "Don't trace real wallpapers or OS logos." ·
  "No clear refractive glass; that's Liquid Glass."

---------------------------------------------------------------------------

# 2. NAIVE DOODLE (proof a human made this)

**key** `naive-doodle` · **Name** Naive Doodle · **Descriptor** Wobbly · Honest · Sunny ·
**mode** light · **family** Graphic · **slideShape** soft ·
**material** "Crayon" · Outlined / Coloured in / Circled (button)

## 2.1 The one idea
Everything is drawn by hand with a confident but untrained line: the line wobbles, the colour is
filled a little outside it, and the page talks back in handwriting. Naive is a decision, not a lack
of skill: few marks, big shapes, lots of paper.

## 2.2 References
1. **Kittl 2026 #1 "Naive design"** [V] https://www.kittl.com/blogs/graphic-design-trends-2026/ —
   "uneven fills, scratchy linework, smiley suns"; after "AI-smooth perfection ... people are
   craving proof that a human made this". Best for food & beverage, kids, wellness, startups.
2. **Kittl 2026 special mention "Kid Core"** [V] same page — "crayons, stickers, bold colors, and
   naive shapes", "intentionally imperfect".
3. **Oatly** [V] https://www.oatly.com — cream ground covered in faint graph-paper grid; a custom
   hand-drawn uppercase face; boxes with thin black outlines and a hard 2px offset second line;
   small yellow tag chips. Copy is deadpan and handwritten in tone.
4. **Keith Haring** (not viewed) https://www.haring.com — single-weight outline figures, short
   radiating "action lines", flat fills: motion and emotion from three strokes.
5. **Jean Jullien** (not viewed) https://www.jeanjullien.com — brush-pen loose line, flat colour, a
   joke per drawing.
6. **Geoff McFetridge / Champion Don't Stop** (not viewed) https://www.championdontstop.com —
   naive but exact line, two or three flat colours, lots of space.
7. **Bráulio Amado** (not viewed) https://www.braulioamado.net — scribbly crayon-like poster
   lettering; wobble applied to type at display size only.
8. **Mr Doodle** (not viewed) https://mrdoodle.com — total all-over doodle density; use as the upper
   bound to stay well under.
9. **Graza** (not viewed) https://www.graza.co — naive illustration and hand type on olive-oil
   squeeze bottles (2022-): naive as a premium grocery brand.
10. **Fishwife** (not viewed) https://eatfishwife.com — painted naive illustration on tinned fish.
11. **Kid Pix** (not viewed) https://en.wikipedia.org/wiki/Kid_Pix — a crayon toolbox UI with
    stamps and wacky brushes; a model for playful controls.
12. **Naïve art** (not viewed) https://en.wikipedia.org/wiki/Na%C3%AFve_art and **Kidcore**
    (not viewed) https://en.wikipedia.org/wiki/Kidcore — the canon and the internet aesthetic.

## 2.3 Popularity evidence
Kittl 2026 #1 and the Kid Core mention [V]; Digital Synopsis 2026 #14 "Quirky illustrations" and #16
"Handmade & collage" [V]; G2 2026 #9 "Handcrafted and imperfect" [V]; Pinterest 2026 "Throwback
Kid" [V heading].

## 2.4 Signature mechanisms
- **Wobble line** [K]: every stroke is a seeded path. Sample the ideal shape every 8-14px, displace
  each point perpendicular to the path by low-frequency noise (amplitude 0.8-1.6px, *smooth*, not
  per-point random), round caps and joins, stroke 2.5-3.5px, ink warm black `#1F1B16`. Boxes don't
  close neatly: lines overshoot the corners by 2-4px.
- **Offset fill** [K]: the colour fill is its own wobbly path, offset (3px, 2px) from the outline and
  slightly larger or smaller, so line and fill never coincide ("coloured in a bit outside").
- **Crayon texture**: fill drawn as 45° hatch strokes (3px pitch, 1.5px, 0.85 opacity) or masked
  with feTurbulence wax grain. One method per board.
- **Hand type** for display only; tiny per-word rotation (±1.5°) on headlines, never on body.
- **Motif kit**: smiley sun with dash rays, wobbly 5-point star, heart, loop arrow, squiggle
  underline, cloud, five-loop flower, overshooting check mark, zigzag scribble-out.
- **Annotation voice**: a hand arrow + handwritten note pointing at a UI element ("this one!").
- **Paper**: plain cream or faint graph/ruled paper at low contrast (Oatly [V]).

## 2.5 Composition
One big drawing per view, centred or stacked, wide blank paper around it; elements slightly askew;
drawings overlap card edges; a sun in a corner. Area: ~60% paper, ~25% line, ~15% fill.

## 2.6 Typography
New handwriting class `hand`: **Patrick Hand** (headlines, readable even at 18px) and **Caveat**
(annotations only, 20-24px). UI and body in a tidy rounded or geometric sans: **DM Sans**, **Nunito
Sans**, **Fredoka** for labels. Never two handwriting faces in one block; never handwriting for
long body copy.

## 2.7 Colour and brand mapping
- **Fixed:** ink warm black `#1F1B16`, paper `#FFFBF2`, optional grid lines `#E7EBDD`.
- **Primary → the main crayon** (sun, primary button fill). **Secondary → second crayon.**
  **Accent → highlighter and annotation colour.**
- Client colours fill only; the line is always ink. At most three crayons per view. Keep chroma
  (crayons are bright); if a client colour is very dark, use it for small fills only.

## 2.8 UI translation
- **Buttons:** wobbly rounded-rect outline (radius ~14px) + offset fill. **Outlined** = rest (fill
  sits offset), **Coloured in** = hover (fill snaps back inside the outline), **Circled** = pressed
  (a loose hand circle drawn round it). Label in Patrick Hand.
- **Segmented control:** a hand-drawn row of boxes sharing slightly crooked walls; selected gets a
  crayon fill and a small star.
- **Toggle:** drawn oval track; knob is a face: on = smiley, off = sleepy (– –). Keep a text label.
- **Input:** a single hand-drawn underline (ruled paper), label above; focus = accent squiggle
  underline; errors handwritten with an arrow.
- **Cards:** wobbly frame + offset fill behind; a corner doodle and a hand-lettered tab.
- **List rows:** hand-drawn checkbox squares; done = overshooting tick; dividers = slightly wavy
  hairlines.
- **Progress:** a crayon bar being coloured in left to right in hatch, a flag doodle at the end; or
  five stars filling.
- **Badges:** hand-drawn burst circles ("new!").
- **Motion:** optional "line boil" (re-seed the wobble 3 frames at 8fps); off under reduced motion.

## 2.9 SVG hero ideas
1. A wobbly smiley sun (circle + 12 dash rays + face) in primary crayon over a hill line,
   hand-lettered wordmark below, two clouds, flowers along the bottom.
2. **Doodle margin:** the client's headline huge in Patrick Hand with doodles packed only into a
   border band (stars, arrows, hearts).
3. **Blob mascot:** a wobbly bean with dot eyes and stick limbs holding a sign with the brand name.

## 2.10 Pattern suite
1. `sprigs` "Marker garden" brand `{ size: 1.2, line: 1.4, mix: 0.6, fills: 0.7, slip: 0.8 }`
2. `zigzag` "Wiggle lines" brand `{ style: 'rounded', band: 6, amp: 3, period: 8, phase: 'drift', colors: 'three' }`
3. `festival` "Scribble stars" brand `{ patches: 4, loops: 0.9, weight: 1.6, stars: 3, echo: false }`
4. `arcrise` "Crayon sun" brand `{ origin: 'bottom', bands: 4, suns: 1, bars: true, bar: 5 }`
5. `tokens` "Stickers" brand `{ cell: 6, link: 0.2, density: 0.5, fill: 'mixed' }`
6. `patchwork` "Doodle quilt" brand `{ cell: 9, layers: 24, ragged: 0.9, motif: 'circles', dotgrid: false }`

## 2.11 Pitfalls
- Fake naive: perfect geometry with a hand font. The line itself must wobble.
- Comic Sans and kids-party clichés (balloons, rainbows on everything).
- Rainbow mush (4+ crayons), low-contrast pastel ink. Ink stays near-black.
- Jittering body text, labels or form fields (illegible, inaccessible).
- Doodle density everywhere (Mr Doodle is the limit, not the target).
- Copying Haring figures or other artists' characters.
- Thick perfect outlines with hard offset shadows — that is Neo-Brutal Pop.

## 2.12 Distinctness
- **Neo-Brutal Pop** (nearest): perfect geometric thick outlines, hard offset shadows, squish.
  Naive: wobbly mid-weight line, offset *fill* (not shadow), crayon texture, handwriting.
- **Radical Memphis:** laminate pattern fills on stacked primitives, no outlines.
- **Riso Print:** two-ink overprint, grain and print misregistration. Naive's offset is hand
  imprecision with a black line.
- **Xerox Punk:** dark collage of rage. Naive is sunny and empty.

## 2.13 Deck
- Principles: "Proof a human drew it" · "Wobble the line, not text" · "Colour outside the lines"
- Do: "Offset every fill from its outline by a few pixels." · "Keep paper empty around one big
  drawing." · "Annotate one thing with an arrow and a note."
- Don't: "No perfect circles or ruler-straight boxes." · "Never jitter body text or form labels." ·
  "No more than three crayons per view."

---------------------------------------------------------------------------

# 3. WABI-SABI (unbleached, imperfect, still)

**key** `wabi-sabi` · **Name** Wabi-Sabi · **Descriptor** Unbleached · Imperfect · Still ·
**mode** light · **family** Tactile · **slideShape** minimal ·
**material** "Glaze" · Raw / Glazed / Mended (swatch)

## 3.1 The one idea
Emptiness is the content. A warm unbleached page, small asymmetric marks, one brush gesture and one
gold-mended crack. Humble, natural materials; nothing shouts, nothing is perfect, nothing is careless.

## 3.2 References
1. **Wabi-sabi** (not viewed) https://en.wikipedia.org/wiki/Wabi-sabi — impermanence, imperfection,
   incompleteness (Leonard Koren's framing).
2. **Kenya Hara / Hara Design Institute** (not viewed) https://www.ndc.co.jp/hara/en/ — "emptiness"
   rather than simplicity; white as a container that receives meaning; Muji art direction.
3. **Muji** (not viewed; timed out) https://www.muji.com — kraft/unbleached materials, small
   labels, the "no-brand" restraint.
4. **Ikko Tanaka** (not viewed) https://en.wikipedia.org/wiki/Ikko_Tanaka — Muji's founding art
   director (1980); flat colour fields and generous space.
5. **Kinto** [V] https://kinto-usa.com — warm earth photography (oak, plaster, stone) under thin,
   widely spaced uppercase sans nav; a tiny small-caps serif caption with a hairline slide indicator;
   a muted grey announcement bar. Colour lives in materials, not in UI.
6. **Ensō** (not viewed) https://en.wikipedia.org/wiki/Ens%C5%8D — one brush circle, left open,
   dry-brush tail.
7. **Kintsugi** (not viewed) https://en.wikipedia.org/wiki/Kintsugi — cracks mended with gold;
   repair as beauty → the "Mended" state.
8. **Axel Vervoordt** (not viewed) https://www.axel-vervoordt.com — raw plaster, linen, tonal stone.
9. **Kinfolk** (not viewed) https://www.kinfolk.com — slow editorial: big margins, small serif,
   muted photography.
10. **Aesop** (403, not viewed) https://www.aesop.com — amber, apothecary labels, earthy tonal
    retail; serif + sans pairing.
11. **Kittl, Japandi style design** [S] https://www.kittl.com/article/japandi-style-design and
    **VistaCreate 2025 trends** [S] https://create.vista.com/blog/creative-design-trends-2025/ —
    wabi-sabi calm as the counterweight to "cluttercore".

## 3.3 Popularity evidence
VistaCreate 2025 (wabi-sabi vs cluttercore) [S]; Kittl 2025 organic textures influenced by
wabi-sabi [S]; Japandi as a sustained interior trend [S]; Jukebox 2026 #20 sustainability (kraft,
muted earth) [V]; Digital Synopsis 2026 #8 nature-inspired and #13 bold minimalism [V].

## 3.4 Signature mechanisms
- **Ma** [K]: 55-70% of each surface empty; content small, asymmetric, anchored to an edge or a
  third line. No visible grid.
- **Unbleached ground with fibres, not noise** [K]: base `#F2EDE4` (kinari); scatter short curved
  hairlines (0.5px, 4-10px long, 8% opacity) at ~1% density. Grain noise reads digital; fibres
  read washi.
- **Deckled edge** on one side of a paper card (irregular edge, 1-2px amplitude).
- **Ensō** as hero and loader: tapered brush stroke (filled polygon, width 3→14→2px), gap 15-30°,
  2-3 dry-brush streaks at the tail.
- **Kintsugi seam**: a crack polyline (5-9 segments, small branch) stroked 1.5-2px in a gold
  gradient `#B8913A → #E2C374`. One per view. Used for the Mended state and as a special divider.
- **Hanko seal**: small square, client accent or fixed shu `#C8442F`, the brand initial knocked out
  in white, slightly uneven ink edge. The approval/signature mark.
- **Vertical label**: a short section name set `writing-mode: vertical-rl` in Latin small caps.
  Never fake Japanese.
- **Glaze swatches**: colour chips shaped like glaze drips (round top, uneven drip bottom).

## 3.5 Composition
Asymmetric balance: long left margin, one object (ensō, bowl) upper right, a small text block lower
left, horizontal hairlines that stop short (incomplete). Three values only (paper, ash, sumi) plus one
glaze and one gold or vermilion moment.

## 3.6 Typography
Mincho serif headings: **Shippori Mincho** (new; Japanese mincho with full Latin, sharp wedge
serifs), alternates **Cormorant Garamond**, **EB Garamond**. UI and body: **Zen Kaku Gothic New**
(new; light gothic sans with Latin) at 300/400. Headings modest (32-48px), never bold; small caps
labels +0.08em; body line-height 1.8.

## 3.7 Colour and brand mapping
- **Fixed:** kinari paper `#F2EDE4`, sumi ink `#2E2B27`, ash `#8C857A`, gold (kintsugi only).
- **Primary → the main glaze**: reduce to ≤45% of its chroma and mix 15% toward ash; used for the
  primary button and one swatch. **Secondary → second glaze** (swatches, a bowl). **Accent → hanko
  seal** if it holds 3:1 on paper, else fixed shu vermilion.
- Never a saturated client colour at full strength. Body text sumi on kinari (~12:1).

## 3.8 UI translation
- **Buttons:** flat rectangle, 2px radius, muted glaze fill, paper text; or a text button with a
  0.75px slightly irregular underline. Hover deepens one value; pressed = 1px inset hairline.
  Swatch states: **Raw** (unglazed paper tone), **Glazed** (glaze fill), **Mended** (glaze + gold
  seam).
- **Segmented control:** words separated by vertical hairlines; selected word gets an irregular ink
  dot beneath.
- **Toggle:** a pebble (irregular ellipse) sliding in a hairline groove; on = glazed pebble.
- **Input:** bottom hairline only, small-caps label above; focus thickens the hairline to 1.25px in
  glaze. No glow.
- **Cards:** a paper sheet with a deckled right edge and a 1px `rgba(46,43,39,.08)` shadow, or no
  card at all: space plus a hairline.
- **List rows:** 56px rows, hairlines that stop 24px short of the right edge, index numbers in mincho.
- **Progress:** an ensō arc drawn clockwise, or an ink dot travelling along a hairline.
- **Badges:** the hanko seal.
- **Motion:** slow fades only.

## 3.9 SVG hero ideas
1. Ensō in sumi with a dry-brush tail, a hanko seal lower right, one line of mincho text; mostly
   empty washi.
2. A chawan (tea bowl) silhouette with an uneven rim, glaze drips in client colours, and one gold
   kintsugi crack.
3. Raked sand: concentric ripples around 2-3 stones (matches the `oprings` suite entry).

## 3.10 Pattern suite (quiet)
1. `marble` "Suminagashi" mono `{ bands: 6, warp: 1.4, cover: 0.5, stars: 0, outline: false }`, tone 0.5
2. `oprings` "Raked garden" mono `{ mode: 'rings', centres: 2, freq: 11, warp: 0.18, bands: 'two' }`, tone 0.45
3. `stipple` "Washi fibre" mono `{ density: 0.5, dot: 0.6, layout: 'random', mirror: 'none', field: 'clouds', duo: false }`, tone 0.4
4. `pebbles` "Stepping stones" brand `{ size: 1.5, gap: 1.8, erode: 0.6, mode: 'crumble', lit: 0.3 }`, tone 0.5
5. `terrain` "Ink-wash ridges" duotone `{ levels: 3, pix: 0.6, dither: 0.15, style: 'ridges' }`, tone 0.5
6. `weave` "Tatami" mono `{ bands: 6, rhythm: 'even', gap: 0.2, stripe: 0.8 }`, tone 0.45

## 3.11 Pitfalls
- Faux-Japanese clichés: cherry blossoms, torii, rising sun, fake kanji. Never generate CJK text.
- Too clean and cold → becomes Dystopian Luxury.
- Beige-everything with no gold/vermilion moment → bland.
- Heavy textures or grain noise instead of sparse fibres.
- Centred, symmetric layouts; filling the grid.
- More than one ensō, seal or seam per view.

## 3.12 Distinctness
- **Dystopian Luxury** (nearest): surgical white, enormous cropped type, blood red, accession
  labels — cold severity. Wabi-sabi: warm unbleached paper, small mincho type, brush, gold mend,
  asymmetry — warm humility.
- **Editorial Serif:** magazine columns and confident high-contrast headings; wabi-sabi has almost
  no headings.
- **Soft Form:** raised/recessed neumorphic surfaces; wabi-sabi is flat paper.
- **Riso Print:** two-ink overprint with grain; wabi-sabi is one ink plus brush.

## 3.13 Deck
- Principles: "Emptiness is the content" · "Imperfect, never careless" · "One mended crack only"
- Do: "Leave most of each slide as empty unbleached paper." · "Set small mincho headings
  off-centre, never bold." · "Use one gold seam or one seal per slide."
- Don't: "No fake kanji, blossoms or rising suns." · "Don't centre everything or fill the grid." ·
  "No saturated brand colour at full strength."

---------------------------------------------------------------------------

# 4. DARK ACADEMIA (the lamp-lit library)

**key** `dark-academia` · **Name** Dark Academia · **Descriptor** Bookish · Candlelit · Inked ·
**mode** dark · **family** Print & editorial · **slideShape** classic ·
**material** "Binding" · Cloth / Gilt / Sealed (swatch)

## 4.1 The one idea
A pool of lamp light on a paper page inside a dark oak room. The interface is made of book objects:
cloth spines, catalogue cards, bookplates, wax seals, marginal notes. Text lives on paper, never on
the dark wood.

## 4.2 References
1. **Pinterest Predicts 2026 — Poetcore** [S] https://fashionunited.uk/news/fashion/poetcore-opera-aesthetic-and-brooches-key-style-predictions-from-pinterest-for-2026/2025121085277
   — "the poet aesthetic" +175%, "poet core" +75%, satchels +85%; leather notebooks, fountain pens,
   handwritten letters.
2. **RUSSH, "Poet aesthetic explained"** [S] https://www.russh.com/poet-aesthetic-explained-where-to-shop/
   — poetcore distinguished from (and succeeding) dark academia.
3. **Dark academia** (not viewed) https://en.wikipedia.org/wiki/Dark_academia — Tumblr origin, TikTok
   peak 2020; *The Secret History* (https://en.wikipedia.org/wiki/The_Secret_History) as its book.
4. **Trinity College Old Library, Long Room** (not viewed) https://www.tcd.ie/library/old-library/ —
   barrel vault, lettered shelf bays, marble busts → bay-letter navigation.
5. **Penguin Clothbound Classics (Coralie Bickford-Smith)** (not viewed)
   https://www.penguin.co.uk/discover/articles/coralie-bickford-smith-penguin-clothbound-classics —
   one foil-stamped repeating emblem on coloured cloth per title.
6. **Bookplate / ex libris** (not viewed) https://en.wikipedia.org/wiki/Bookplate — framed owner
   label with an engraved emblem → profile card.
7. **Library catalogue cards** (not viewed) https://en.wikipedia.org/wiki/Library_catalog — 3×5
   cards, typed call numbers, red top rule, punched hole → list rows.
8. **Rubrication** (not viewed) https://en.wikipedia.org/wiki/Rubrication and **Marginalia**
   (not viewed) https://en.wikipedia.org/wiki/Marginalia — red initials and section marks; notes in
   the margin.
9. **Wax seal** (not viewed) https://en.wikipedia.org/wiki/Wax_seal — the "Sealed" state.
10. **Diptyque** (not viewed) https://www.diptyqueparis.com — the oval label with letters dancing
    round it; black on cream since 1961.
11. **Cire Trudon** (not viewed) https://trudon.com — candle maker since 1643; engraved emblems on
    dark grounds.
12. **Daunt Books** (not viewed) https://dauntbooks.co.uk and **Shakespeare and Company**
    (not viewed) https://shakespeareandcompany.com — bookshop identities: green, oak, painted signs.

## 4.3 Popularity evidence
Pinterest Predicts 2026 Poetcore, Pen Pals, Vamp Romantic, Opera Aesthetic [V headings, S figures];
"Poetcore meets Georgian" 2026 interiors piece [S]; Jukebox 2026 #19 serif fonts, G2 2026 #8 serif
fonts [V].

## 4.4 Signature mechanisms
- **Lamp pool** [K]: dark oak/leather ground `#1E1712`; content on aged-paper leaves `#EFE6D2`;
  a radial warm vignette (centre +4% lightness, edges -20%) — one light source.
- **Spine navigation** [K]: tabs as vertical spines of varied width/height, 2-3 raised bands
  (horizontal ribs with highlight), gilt title set vertically; the selected spine is pulled out
  8px.
- **Rubrication**: drop cap and ¶ § marks in oxblood `#7A1F1F` (or client accent); everything else
  ink.
- **Marginalia**: one handwritten note per view in a pencil grey with a short underline.
- **Catalogue-card rows**: typed call number (Courier Prime), faint ruled lines, a red rule under
  the heading line, a punched hole at bottom centre.
- **Bookplate frame**: double rule (1px + 0.5px, 3px apart) with an engraved emblem (laurel wreath
  from leaf ellipses around a monogram).
- **Wax seal**: irregular blob circle with radial shading and an embossed initial (inner shadow).
- **Engraving texture**: steel-engraving hatch for illustration (see `halftone` suite entry).
- **Gilt foil** `#B08D57`: rules, spine titles, folios. Thin lines only, never fills.

## 4.5 Composition
A book page: centred 60-68ch column, wide margins with marginal notes, small-caps running head,
folio numbers, fleurons (❦) between sections; the dark surround frames the paper. Classical
symmetry, little ornament.

## 4.6 Typography
**IM Fell English** (new; the Fell types, 17th-century printing irregularity) and **Cormorant
Garamond**, **Libre Caslon Text**, **Playfair Display** for headings; **EB Garamond**, **Crimson Pro**
for body; **Courier Prime** for catalogue/typed text. Small caps +0.1em for running heads; old-style
figures; italic for epigraphs.

## 4.7 Colour and brand mapping
- **Fixed:** oak `#1E1712`, paper `#EFE6D2`, ink `#2A2018`, gilt `#B08D57` (lines only), pencil
  `#6E6458`.
- **Primary → book cloth** (spines, cover panels, primary button), darkened to L 25-35% and
  desaturated ~20% (bottle green / oxblood / navy register). **Secondary → a second cloth.**
  **Accent → rubrication and wax seal** (drop caps need ≥3:1 on paper; body text never uses it).

## 4.8 UI translation
- **Buttons:** cloth-bound rectangle (primary cloth, 3px radius, linen texture as 1px diagonal hatch
  at 6%), small-caps gilt or paper label, 1px gilt rule inset 3px. Swatch states: **Cloth** (plain
  cloth), **Gilt** (gilt rule + title), **Sealed** (wax seal on it).
- **Segmented control:** book spines (see 4.4).
- **Toggle:** inset paper groove; knob = a wax seal disc; on = seal in accent with initial.
- **Input:** a ruled line on paper with typewriter text, small-caps label; focus = fountain-pen
  underline in blue-black `#1C2A44`.
- **Cards:** paper leaf with a 14px dog-ear corner and a double-rule frame; faint foxing spots
  (3-5 tiny warm dots at 6%).
- **List rows:** catalogue cards — call number in mono left, title italic, date right.
- **Progress:** "Chapter III of XII" with a ribbon bookmark moving down a spine.
- **Badges:** wax seal; "Ex Libris" tag. **Dividers:** fleuron between hairlines.

## 4.9 SVG hero ideas
1. A shelf of spines in client cloth colours with gilt bands; the wordmark on the pulled-out spine;
   a warm lamp vignette.
2. An open book spread: drop cap and text lines left; an engraved laurel-and-monogram emblem right;
   a marginal handwritten note with an arrow.
3. An ex libris bookplate with the brand monogram in a laurel wreath and "EX LIBRIS" small caps.

## 4.10 Pattern suite
1. `marble` "Endpapers" brand `{ bands: 7, warp: 2, cover: 0.85, stars: 0.3, outline: false }`, tone 0.75
2. `weave` "Tweed" brand `{ bands: 10, rhythm: 'pinstripe', gap: 0.1, stripe: 0.7 }`
3. `halftone` "Steel engraving" mono `{ cell: 1.1, levels: 5, shape: 'round', angle: 45, field: 'ridges', duo: false }`, tone 0.6
4. `sprigs` "Pressed flowers" night `{ size: 0.8, line: 0.7, mix: 0.3, fills: 0.4, slip: 0.2 }`, tone 0.6
5. `counterchange` "Library arches" night `{ figure: 'arch', bar: 2.4, dir: 'v', size: 0.7, nest: 2, second: false }`
6. `modulargrid` "Ledger" mono `{ cols: 12, style: 'line', merge: 0.2, gap: 0.6, empty: 0.3 }`, tone 0.5

## 4.11 Pitfalls
- Costume: skulls, ravens, quill piles, candles everywhere.
- Sepia mud; low-contrast body text set on the dark wood.
- Lorem-ipsum Latin. Use real, generic phrases ("Ex Libris", "Liber I", "Caput III").
- Blackletter (crypt, not library) — that's Cybersigilism/Biomechanical Gothic territory.
- Gold fills or haloes (Religious Futurism).

## 4.12 Distinctness
- **Editorial Serif** (nearest): light magazine pages, high-contrast didone, spacious modern columns.
  Dark Academia: dark room, book objects (spines, cards, plates, seals), Fell/old-style types,
  marginalia.
- **Religious Futurism:** obsidian, monumental, stained-glass light, gold rims. DA is intimate,
  paper and cloth, no light-as-colour.
- **Neo Deco:** geometric stepped gilt symmetry; DA has none.
- **Curio Cabinet (new):** objects in trays with specimen labels. DA: books and text.

## 4.13 Deck
- Principles: "A lamp-lit page in the dark" · "Rubricate, don't decorate" · "Books are the interface"
- Do: "Set body text on paper leaves, never on dark wood." · "Use one oxblood drop cap or seal per
  slide." · "Add small-caps running heads and folio numbers."
- Don't: "No skulls, ravens or quill clip-art." · "No blackletter; this is a library." · "Don't
  sepia-tint everything into mud."

---------------------------------------------------------------------------

# 5. ATOMIC MID-CENTURY (cut paper, sparkles, orbits)

**key** `mid-century` · **Name** Atomic Mid-Century · **Descriptor** Optimistic · Cut-paper ·
Atomic · **mode** light · **family** Graphic · **slideShape** classic ·
**material** "Cut paper" · Cut / Layered / Printed (swatch)

## 5.1 The one idea
1950s optimism built from flat shapes cut out of coloured paper: slightly rough edges, no outlines,
starbursts, orbits and boomerangs, a tracked geometric sans with one brush-script word, cream paper
showing between the planes.

## 5.2 References
1. **Charley Harper Art Studio** [V] https://charleyharperartstudio.com — "minimal realism": a
   polar bear reduced to a striped half-circle and a cardinal to triangles and a circle, on a flat
   turquoise ground; pattern (vertical stripes) inside one shape; flat colour, no outlines.
2. **Saul Bass** (not viewed) https://en.wikipedia.org/wiki/Saul_Bass — hand-cut paper shapes with
   rough edges, one symbol, two or three colours.
3. **Alexander Girard (Herman Miller)** (not viewed) https://www.hermanmiller.com/designers/girard/
   — folk-modern textiles: diamonds, suns, hearts, repeat patterns.
4. **Paul Rand** (not viewed) https://www.paulrand.design — playful collage and cut shapes in
   children's books and identities.
5. **Mary Blair** (not viewed) https://en.wikipedia.org/wiki/Mary_Blair — flat stylised colour,
   childlike geometry.
6. **Jim Flora** (not viewed) https://www.jimflora.com — angular jazz-record figures, atomic shapes.
7. **Alvin Lustig** (not viewed) https://en.wikipedia.org/wiki/Alvin_Lustig — New Directions covers:
   abstract symbol + type.
8. **Googie architecture** (not viewed) https://en.wikipedia.org/wiki/Googie_architecture —
   boomerangs, starbursts, parabolas.
9. **Atomic Age (design)** (not viewed) https://en.wikipedia.org/wiki/Atomic_Age_(design) — atom
   orbits, starbursts, ball-and-stick molecules.
10. **Herman Miller rebrand by Order (2024)** [S] https://www.lsnglobal.com/article/view/30405 —
    revives the John Massey-era modernist identity; the swooping M freed as a graphic element.
11. **Clark Art Institute, "Bold by Design: Mid-century Modern Graphic Art" (2025)** [S, 403]
    https://digital.clarkart.edu/paginations/bold-by-design.

## 5.3 Popularity evidence
Herman Miller's 2024 heritage rebrand [S]; Clark Art 2025 exhibition [S]; "mid-century is in the
midst of a comeback" (Liberty Champion) [S]; Digital Synopsis 2026 #18 retro-futurism and Jukebox
2026 #13 retro-futurism [V] (the optimistic-future strand).

## 5.4 Signature mechanisms
- **Cut-paper edge** [K]: flat fills with vertex jitter 0.5-1px on polygons (a paper cut, not a
  wobbly pen line). No outlines anywhere.
- **Atomic kit**: 4- and 8-point concave sparkles (tapered spikes), atom = 3 ellipses rotated 60°
  around a dot, boomerang/kidney shapes, ball-and-stick molecules, parabolas.
- **Minimal realism** (Harper [V]): objects reduced to circles, half-circles, triangles; one stripe
  or dot pattern inside one shape.
- **Stacked planes**: shapes overlap by stacking (no multiply, no grain — those are Riso).
- **Diagonal energy**: secondary elements tilted on a 12-15° axis.
- **Script + geometric pair**: tracked caps sans headline with one slanted brush-script word.
- **Kidney panels**: asymmetric rounded shapes behind rectangular content.

## 5.5 Composition
An asymmetric poster: one big cut shape off-centre bleeding off the edge, the headline in tracked
caps with a script swash, 3-4 inks on cream, starbursts as punctuation.

## 5.6 Typography
**Jost** (Futura-like) and **Josefin Sans** for headings and labels (caps +0.12em); **Yellowtail**
(new; script class) for one word per view; **Alfa Slab One** as a Clarendon-ish alternate for
signage. Body **Jost** or **DM Sans**.

## 5.7 Colour and brand mapping
- **Fixed:** cream paper `#F3EAD7`, charcoal ink `#2B2622`, and one period support ink — mustard
  `#E0A526` or teal `#1F7A7A`, whichever is farther in hue from the client primary — capped at 15%
  area.
- **Primary → the biggest cut shape and primary buttons. Secondary → second plane. Accent →
  sparkles and atoms.**
- Warm the client colours slightly (hue 5-10° toward yellow) and drop neon chroma ~15% for the
  period register.

## 5.8 UI translation
- **Buttons:** flat, skewed `skewX(-10deg)` with caps label (text counter-skewed); swatch states
  **Cut** (single plane), **Layered** (a second-colour plane offset beneath), **Printed** (sparkle
  added at a corner).
- **Segmented control:** capsule; selected marked with an atom dot.
- **Toggle:** a TV dial: circle knob with an indicator line that rotates 45° when on.
- **Input:** cream field, 2px charcoal bottom bar; a tiny sparkle appears on focus.
- **Cards:** content card on a kidney-shaped colour panel (stacked planes).
- **List rows:** atom-dot bullets in client colours; tracked caps labels.
- **Progress:** a row of sparkles filling, or electrons placed around an orbit.
- **Badges:** 8-point starburst seal.

## 5.9 SVG hero ideas
1. **Atomic sky:** cream ground, a large client-primary boomerang plane, three sparkles, an atom with
   three orbits, wordmark in Jost caps with a Yellowtail swash.
2. **Harper-style bird** built only from circles, half-circles and triangles, one wing striped.
3. **Googie sign:** a parabolic arch on a pole crowned by a starburst holding the brand panel.

## 5.10 Pattern suite
1. `halftone` "Screen print" brand `{ cell: 3, levels: 3, shape: 'round', angle: 15, field: 'clouds', duo: true }`
2. `burst` "Atomic stars" brand `{ rays: 24, layers: 1, bend: 0, beads: 1, origin: 'centre' }`
3. `counterchange` "Girard diamonds" brand `{ figure: 'diamond', bar: 3, dir: 'v', size: 0.6, nest: 2, second: true }`
4. `tokens` "Molecules" brand `{ cell: 6, link: 0.9, density: 0.5, fill: 'open' }`
5. `zigzag` "Rickrack" brand `{ style: 'rounded', colors: 'three', band: 5, amp: 3, period: 7, phase: 'parallel' }`
6. `panels` "Cut planes" brand `{ depth: 3, gutter: 0.8, pitch: 1.3, flat: 0.6, frame: false }`

## 5.11 Pitfalls
- Diner/jukebox/rocket/poodle clip-art; Mad Men pastiche.
- Console lamps and bezels (Retro-futurist).
- Grain, misregistration, multiply overprint (Riso).
- Copying Bass title sequences or Harper's animals.
- More than four inks; rainbow; Memphis squiggles.

## 5.12 Distinctness
- **Bauhaus Poster** (nearest): primaries, hard ink lines, constructivist circle/square/triangle,
  loud type. MCM: warm period palette, rough-cut edges, sparkles/orbits/boomerangs, script + geometric,
  no ink lines.
- **Groovy 70s:** fat soft type, concentric rainbow bands. MCM is crisp and 1950s.
- **Radical Memphis:** 1980s laminate patterns and clashing stacks.
- **Retro-futurist:** dark mission-control console. MCM is light paper.

## 5.13 Deck
- Principles: "Cut it from coloured paper" · "Sparkles, orbits, boomerangs" · "Optimism with
  restraint"
- Do: "Build every image from flat, slightly rough-cut shapes." · "Pair tracked geometric caps with
  one script word." · "Keep cream paper showing between the planes."
- Don't: "No diner, rocket or jukebox clip-art." · "No outlines, grain or misregistration." ·
  "Don't use more than four inks."

---------------------------------------------------------------------------

# 6. ART NOUVEAU (every line grows like a stem)

**key** `art-nouveau` · **Name** Art Nouveau · **Descriptor** Whiplash · Botanical · Framed ·
**mode** light · **family** Print & editorial · **slideShape** classic ·
**material** "Frames" · Bare / Framed / Haloed (swatch)

## 6.1 The one idea
Lithograph posters circa 1900: content held in arched frames, a halo disc behind the key element,
stems rising both sides and ending in whiplash curls and buds, muted flat colour with a dark contour.
Ornament frames the content; it never covers it.

## 6.2 References
1. **Mucha Foundation** [V] https://www.muchafoundation.org — the hero image: a figure inside a
   curvilinear border whose lines sweep into arches at the top; a star field behind; cream, salmon,
   grey-violet; the frame is part of the picture. Site UI is a quiet cream with a terracotta news bar.
2. **Hector Guimard, Paris Métro entrances** (not viewed) https://en.wikipedia.org/wiki/Paris_M%C3%A9tro_entrances_by_Hector_Guimard
   — cast-iron plant stems, organic "METROPOLITAIN" lettering, green paint.
3. **Aubrey Beardsley** (not viewed) https://en.wikipedia.org/wiki/Aubrey_Beardsley — black/white
   flat masses, hairline detail, huge negative space.
4. **Victor Horta, Hôtel Tassel** (not viewed) https://en.wikipedia.org/wiki/H%C3%B4tel_Tassel — the
   whiplash line in ironwork and mosaic floors.
5. **Will H. Bradley** (not viewed) https://en.wikipedia.org/wiki/Will_H._Bradley — American poster:
   flat colour, decorative lettering, framed panels.
6. **Vienna Secession** (not viewed) https://www.secession.at and **Koloman Moser** (not viewed)
   https://en.wikipedia.org/wiki/Koloman_Moser — the geometric strand: square mosaics, repeating
   motifs (use only for the mosaic base strip).
7. **Jugendstil** (not viewed) https://en.wikipedia.org/wiki/Jugendstil.
8. **Liberty London** (not viewed) https://www.libertylondon.com — Liberty prints; Nouveau and Arts &
   Crafts textiles.
9. **Visi, "Art Nouveau revival in 2026"** [S] https://visi.co.za/art-nouveau-revival-in-2026/ —
   stylised florals reworked through new materials and tech.
10. **AE World, luxury interior trends 2025** [S] https://aeworld.com/?p=140655 — early-20th-century
    curvilinear, nature-inspired styles back in luxury interiors.
11. **Checkpoint Systems, "Key 2026 font trends"** [S] https://checkpointsystems.com/blog/key-2026-font-trends/
    — a type designer links Nouveau's organic shapes to wobbly AI imagery and expects Deco to follow.
12. **Wix Studio typography trends** [S] https://wix.com/studio/blog/typography-trends — fluid faces
    "reminiscent of the Art Nouveau movement".

## 6.3 Popularity evidence (mixed, stated honestly)
Interiors and type forecasts for 2025-26 point to a Nouveau revival [S above]; Shopify 2025 "the
return of ornamentation" [S]. Counter-evidence: Creative Bloq's 2025 type forecast calls some
Nouveau-adjacent styles worn out [S]. It is in the twelve because ornament is returning, nothing in
the set is organic-light-floral, and it is a frequent client request (beauty, wine, florists,
hospitality).

## 6.4 Signature mechanisms
- **Whiplash curve** [K]: cubic bezier chains whose curvature accelerates toward the end and resolves
  in a spiral, bud or leaf; drawn as filled tapered polygons (1 → 4 → 1px).
- **Arched frame**: content inside a round-arch panel (semicircular top), stems rising up both sides
  and curling over the arch. (Round arch only; ogive/pointed arches are Religious Futurism.)
- **Halo disc** (Mucha): a large circle behind the headline or key art with a decorative ring band
  (dots or tiny stylised flowers) and a thin gold ring.
- **Stylised botanicals**: iris/lily/poppy — long vertical stems, almond leaves, layered petal heads.
- **Contour line**: flat colour areas edged with a 1.5-2px deep olive-brown line (never pure black).
- **Cartouche**: titles in a label with concave/convex curved ends.
- **Mosaic strip**: a base band of small squares/triangles (Secession).

## 6.5 Composition
Tall vertical panels (poster ratio ~1:2.5), symmetric about a centre axis with asymmetric flourishes;
a cartouche at the top, the halo in the middle, a mosaic band at the base; patterned background
(stars or flowers) at low contrast.

## 6.6 Typography
**Federant** (new; Cyreal, early-20th-century sign lettering) for display; **Fraunces** (soft serif
in the Windsor/1905 tradition), **Marcellus**, **Cormorant Garamond** as alternates; body **EB
Garamond** or **Spectral**. Display caps with generous tracking; never geometric sans.

## 6.7 Colour and brand mapping
- **Fixed:** cream `#F1E7D3`, contour olive-brown `#3B3A2A`, gold `#C2A05A` (halo rings only, thin).
- **Primary → the dominant flat** (panel fill / large drapery-like mass). **Secondary → stems and
  leaves** (keep its value, desaturate if it is not a plant hue). **Accent → flower heads and the
  halo's inner fill.**
- Push all client colours to a lithograph register: chroma -25%, lightness toward 55-70%.

## 6.8 UI translation
- **Buttons:** cartouche shape, 1.5px contour, flat fill. Swatch states **Bare** (cartouche only),
  **Framed** (a second outer contour with curl terminals), **Haloed** (thin gold ring behind).
- **Segmented control:** round-arched tabs in a row; selected filled.
- **Toggle:** a vine track with a leaf knob; on = leaf rotates and fills.
- **Input:** contour field with curl terminals at the top-left corner only.
- **Cards:** round-arch-topped panels with stems up the sides and a title cartouche.
- **List rows:** separated by short centred whiplash dividers with bud ends.
- **Progress:** a stem growing with a leaf per step; a flower at 100%.
- **Badges:** circular medallion with a ring of dots.

## 6.9 SVG hero ideas
1. **Mucha without a figure:** a tall arched panel, a halo disc of stylised flowers behind the
   wordmark, iris stems rising both sides with whiplash curls, mosaic strip at the base.
2. **Guimard gate:** two stems curving up into a sign panel holding the brand name.
3. **Frieze:** a procedurally repeated poppy or peacock-feather band.

## 6.10 Pattern suite
1. `flow` "Whiplash" brand `{ field: 'swirl', strands: 4, gap: 2, bend: 2.2, weight: 1.4 }`
2. `arcrise` "Halo" brand `{ origin: 'bottom', bands: 6, suns: 1, bars: false }`
3. `sprigs` "Botanical frieze" brand `{ size: 1.1, line: 1, mix: 0.5, fills: 0.8, slip: 0.3 }`
4. `waves` "Japonisme waves" brand `{ rows: 5, crests: 2.5, curl: 2.6, strands: 12, drops: 0 }`
5. `blades` "Iris stems" brand `{ count: 120, size: 1.8, curve: 0.9, take: 0.3, ink: 'ink1' }`
6. `specimens` "Tendril studies" brand `{ cols: 3, gap: 1, round: 3, study: 'tendrils', line: 1 }`

## 6.11 Pitfalls
- Figures and Mucha pastiche portraits (we can't draw them well; use halo + flora).
- Ornament covering UI or touching body text.
- Drift into Art Deco: geometric steps, sunburst fans, gilt on dark (Neo Deco).
- Saturated colour; gold fills; ogive arches.
- Display face used for body copy.

## 6.12 Distinctness
- **Neo Deco** (nearest): geometric symmetry, stepped ziggurats, fans, gilt lines on a dark canvas.
  Nouveau: organic whiplash curves, botanicals, round arches, light cream, muted lithograph colour.
- **Biomechanical Gothic:** dark bone and ribs; Nouveau is light and floral.
- **Religious Futurism:** ogive arches, gold on obsidian, stained glass.
- **Wabi-Sabi (new):** emptiness; Nouveau is ornament-rich.

## 6.13 Deck
- Principles: "Every line grows like a stem" · "Frame it, then let it flow" · "Muted lithograph colour"
- Do: "End every flourish in a curl, bud or spiral." · "Put the headline in a cartouche, art in a
  halo." · "Use thin gold only for halo rings."
- Don't: "No stepped geometric frames; that's Neo Deco." · "No figures or Mucha portrait
  pastiche." · "Never let ornament touch body text."

---------------------------------------------------------------------------

# 7. TRANSIT WAYFINDING (colour means a route)

**key** `transit-wayfinding` · **Name** Transit Wayfinding · **Descriptor** Directional · Coded ·
Calm · **mode** dark · **family** Graphic · **slideShape** minimal ·
**material** "Lines" · Scheduled / Approaching / Diverted (button)

## 7.1 The one idea
The interface behaves like a station: black sign panels with white type, every brand colour is a
route with its own bullet and line, diagrams run at 0/45/90°, arrows always come with words, and the
only other colour is a single alert yellow. Calm because colour is rationed to meaning.

## 7.2 References
1. **NYCTA Graphics Standards Manual (Unimark: Vignelli & Noorda, 1970)** (not viewed)
   https://standardsmanual.com/products/nyctacompactedition — white Helvetica on black, modular sign
   panels, a thin white rule near the top edge, coloured route discs.
2. **Massimo Vignelli** (not viewed) https://en.wikipedia.org/wiki/Massimo_Vignelli and **Unimark
   International** (not viewed) https://en.wikipedia.org/wiki/Unimark_International — the 1972
   subway diagram: 45/90° lines, dots for stations.
3. **Harry Beck's Tube map** (not viewed) https://en.wikipedia.org/wiki/Tube_map — topological
   octilinear diagram; ticks for stations, rings for interchanges.
4. **Kinneir & Calvert, Transport** (not viewed) https://en.wikipedia.org/wiki/Transport_(typeface)
   — mixed-case sign type; panel colour encodes road class.
5. **Otl Aicher, Munich 1972 pictograms** (not viewed) https://en.wikipedia.org/wiki/Otl_Aicher — 45/90°
   grid pictograms.
6. **AIGA/DOT symbol signs (1974)** (not viewed) https://en.wikipedia.org/wiki/DOT_pictograms — 50
   public-domain pictograms: a legal pictogram vocabulary.
7. **Highway Gothic** (not viewed) https://en.wikipedia.org/wiki/Highway_Gothic — FHWA series;
   Overpass is its open-source interpretation.
8. **Mijksenaar (Schiphol)** (not viewed) https://www.mijksenaar.com — yellow signs for flight
   information, grey for facilities: colour = meaning.
9. **INAT standard metro maps (Jug Cerovic)** [V] https://www.inat.fr — thick saturated line colours,
   45° turns with rounded corners, white station pills with black outlines, line letter/number
   bullets, pale water and park fills, white ground.
10. **Tokyo Metro station numbering** (not viewed) https://en.wikipedia.org/wiki/Tokyo_Metro — line
    letter in a coloured ring + station number (G09) → list-row tags.
11. **Mini Metro** (not viewed) https://dinopoloclub.com/games/mini-metro/ — a transit diagram as a
    playable UI.
12. **TTC Wayfinding Strategy (Toronto, Sept 2025)** [S] https://www.toronto.ca/legdocs/mmis/2025/ttc/bgrd/backgroundfile-258833.pdf
    — wayfinding treated as brand.

## 7.3 Popularity evidence
Digital Synopsis 2026 #10 "Utilitarian Design: signage systems, industrial graphics, and wayfinding"
[V]; Jukebox 2026 #18 modular systems [V]; Kittl 2026 #3 blueprint/over-explaining (adjacent) [V];
the Standards Manual reissues' long-running popularity [K].

## 7.4 Signature mechanisms
- **Sign panel** [K]: `#000` panel on a `#16181A` concourse ground, white type, 0-4px radius, a 1px
  white rule inset 6px from the top edge.
- **Route bullets**: 24-32px filled circles in a line colour with a white (or black) centred letter
  or number; a diamond for an express variant.
- **Line diagram**: 6-8px strokes at 0/45/90° only, 45° turns rounded (radius = 3× line width);
  stations as white ticks or white pills with a black outline (INAT [V]); interchanges as joined
  rings.
- **Arrow glyph** on a grid (shaft 1 unit, 45° head 2 units), always paired with a label; arrow sits
  left of the label for left/up.
- **Pictograms** on a 6×6 grid: information i, stairs, lift, exit, accessible entrance, plus.
  Procedural, AIGA/DOT style.
- **Colour = information**: brand colours appear only as lines and bullets; one fixed alert yellow.
- **Departure rows**: bullet · destination · platform · time (tabular numerals) · status.

## 7.5 Composition
A concourse: a long overhead sign band (arrows, bullets, destinations), a line-diagram hero, a
departures list, a platform tab row. Flush-left, modular widths (1/2/4 modules), mostly black and
white; brand colour ≤12% of area.

## 7.6 Typography
**Overpass** (new; Highway Gothic interpretation) for signs and body; **Inter Tight**, **Public Sans**
(USWDS) and **Barlow** (new; DIN-like) as alternates. Signs at 600-800, mixed case (Transport) or
caps for short platform labels; tabular numerals for times. No mono, no serif.

## 7.7 Colour and brand mapping
- **Fixed:** sign black `#000`, concourse `#16181A`, white `#FFF`, alert yellow `#FFC72C` (black
  text), inactive line grey `#6D6E71`.
- **Primary, secondary, accent → three routes** (bullets and line strokes). Each line colour needs
  ≥3:1 against black; lighten a dark brand colour for line use. Bullet text white if ≥4.5:1 else
  black.
- Body and sign text never take brand colour.

## 7.8 UI translation
- **Buttons:** primary = client-primary panel, white label, arrow at right, 4px radius. **Scheduled**
  (rest), **Approaching** (hover: 2px white keyline + arrow nudges 2px), **Diverted** (error/alert:
  yellow panel, black label, warning pictogram). Pressed inverts to white panel, black text.
- **Segmented control:** platform tabs — numbers in squares; selected = white square, black number.
- **Toggle:** a rail switch: a short line between two station dots; the knob is a route bullet that
  moves across; on = line in route colour.
- **Input:** "Where to?" — black field, white text, pictogram at left, 2px white bottom rule; focus =
  rule in route colour.
- **Cards:** sign modules: top white rule, bullet cluster top-left, label, arrow.
- **List rows:** departures (see 7.4); delayed status in yellow.
- **Progress:** the line diagram coloured up to the current station; the current station a larger
  ring.
- **Badges:** route bullets; express diamond.

## 7.9 SVG hero ideas
1. **The brand network:** three octilinear lines in client colours crossing, station ticks, an
   interchange ring labelled with the brand name, a pale river band.
2. **Overhead sign:** a long black panel with arrows, route bullets and the brand name as a
   destination.
3. **Pictogram strip:** six procedural pictograms plus the brand initial as a route bullet.

## 7.10 Pattern suite
1. `relief` "Route board" brand `{ cols: 4, traces: 9, blocks: 3, trace: 1.4 }`
2. `tokens` "Stations" brand `{ cell: 6, link: 1, density: 0.6, fill: 'open' }`
3. `ribbonrise` "Line bands" brand `{ edge: 'left', bar: 2.4, bands: 5, ring: false }`
4. `counterchange` "Line bullets" brand `{ figure: 'circle', bar: 2, dir: 'v', size: 0.5, nest: 1, second: false }`
5. `modulargrid` "Sign modules" mono `{ cols: 8, style: 'filled', merge: 0.6, gap: 0.3, empty: 0.2 }`
6. `glyphgrid` "Pictogram grid" mono `{ glyphs: 'shapes', cell: 5, bands: 4, duo: false }`

## 7.11 Pitfalls
- Copying real system marks: the TfL roundel, MTA bullets with their real letter/colour pairs, real
  line maps.
- Colour as decoration; too many lines (max 3-4).
- Arrows without words; tiny type.
- Expressive Swiss-poster typography (signage is mid-size and functional).
- Alarm language (that's Industrial Hazard): one yellow alert only.

## 7.12 Distinctness
- **Industrial Hazard** (nearest): heavy grey machine, ANSI alarm ladder, hazard stripes, bezels,
  lockout tags. Wayfinding: flat black signs, route bullets, octilinear diagrams, pictograms, calm.
- **Blueprint:** white line drawing on blue with dimensions.
- **Raw Brutalist:** thick borders, hard shadows, mono.
- **Micrographics:** tiny labels around one huge element; wayfinding type is mid-size and legible
  at distance.

## 7.13 Deck
- Principles: "Colour means a route" · "Arrow first, then words" · "Readable from fifty feet"
- Do: "Give each brand colour a line and a route bullet." · "Draw lines only at 0, 45 and 90
  degrees." · "Pair every arrow with a plain-language label."
- Don't: "No colour used purely as decoration." · "Don't copy real transit marks or roundels." ·
  "No tiny type; signs read at distance."

---------------------------------------------------------------------------

# 8. GORPCORE (the gear spec is the story)

**key** `gorpcore` · **Name** Gorpcore · **Descriptor** Technical · Outdoor · Rugged ·
**mode** light · **family** Tactile · **slideShape** minimal ·
**material** "Fabric" · Ripstop / Taped / Reflective (swatch)

## 8.1 The one idea
Outdoor technical gear as a brand language: stone-coloured ground, contour maps, hang tags with spec
tables, webbing and buckles as controls, fabric-coloured panels, numbers with units, and one blaze-
orange zip pull.

## 8.2 References
1. **Arc'teryx** (not viewed) https://arcteryx.com — technical product pages, spec tables (weight in
   grams, membrane, denier), black/white UI with fabric colour as the only colour.
2. **Patagonia** (not viewed) https://www.patagonia.com — earth palette, activism copy, field-
   tested voice.
3. **Snow Peak** (rendered unstyled, not effectively viewed) https://www.snowpeak.com — Japanese camp
   gear, minimal.
4. **and wander** [V partial] https://andwander.com — the black triangle-flag mark on white (loading
   screen only).
5. **Salomon** (403, not viewed) https://www.salomon.com — trail shoe tech diagrams.
6. **USGS topographic maps** (not viewed) https://www.usgs.gov/programs/national-geospatial-program/topographic-maps
   — contour lines with every fifth line heavier (index contour) and inline elevation labels;
   public domain cartography.
7. **swisstopo** (not viewed) https://www.swisstopo.admin.ch — relief shading and rock hachures; the
   gold standard of map craft.
8. **NPS Unigrid (Vignelli, 1977)** (not viewed) https://en.wikipedia.org/wiki/Unigrid — black title
   band with white Helvetica on a modular grid → the header band.
9. **Trail blazing** (not viewed) https://en.wikipedia.org/wiki/Trail_blazing — painted rectangles/
   diamonds on trees; difficulty symbols.
10. **Gorpcore** (not viewed) https://en.wikipedia.org/wiki/Gorpcore and **Artribune (Jan 2026)** [S]
    https://www.artribune.com/progettazione/moda/2026/01/gorpcore-significato-moda/ — gorpcore now a
    consolidated code in streetwear and luxury.
11. **Cotopaxi** (not viewed) https://www.cotopaxi.com — colour-blocked panels, bright colourways.

## 8.3 Popularity evidence
Pinterest Predicts 2026 "Khaki Coded" [V heading]; Artribune 2026 "Gorp culture" [S]; nss magazine
"It's gorpcore season" [S]; Digital Synopsis 2026 #10 utilitarian [V].

## 8.4 Signature mechanisms
- **Topographic contours** [K]: closed irregular curves from a noise field (marching squares); every
  5th line 2× weight (index contour); elevation labels breaking the line ("1840").
- **Hang tag / spec label**: rounded rect with a grommet hole and a cord; a spec table ("Weight 312
  g", "20D ripstop", "3-layer shell", "-5 to 15 °C") with tiny icons. Generic terms only (no
  trademarked membranes).
- **Ripstop grid** ground texture: 5px square grid, thicker every 5th line, at 3% contrast.
- **Webbing and hardware**: side-release buckle, carabiner and cord-lock glyphs; pull-tab loops on
  card corners; a reflective strip (silver diagonal band).
- **Blaze orange** `#FF5F1F`, fixed and tiny (zip pulls, the current position on a map).
- **Coordinates and elevation** in mono: `N 46°32′48″ E 7°57′45″ · 2,061 m`.
- **Trail-blaze markers**: circle / square / diamond as difficulty levels.

## 8.5 Composition
Clean stone ground, a product or hero object centred with spec tags hanging off it, a contour map
behind at low contrast, a black Unigrid-style header band with the logo, modular rounded blocks (8px)
and data rows with units.

## 8.6 Typography
Condensed headlines **Barlow Condensed**, **Big Shoulders Display**; stencil labels **Saira Stencil**
(new); body **Barlow** (new) or **Inter**, **IBM Plex Sans**; mono for coordinates **JetBrains Mono**
or **IBM Plex Mono**. Tracked uppercase labels; numbers large.

## 8.7 Colour and brand mapping
- **Fixed:** stone `#EDEBE6`, carbon `#1B1D1C`, blaze orange `#FF5F1F` (≤3% area), reflective silver
  `#C9CCCF`.
- **Primary → the shell fabric** (main panels, primary button = the jacket colour). **Secondary →
  colour-blocked second fabric panel and contour tint. Accent → trail-blaze markers.**
- Client colours stay as fabric colourways, slightly desaturated (-10%) for a dyed-textile read.

## 8.8 UI translation
- **Buttons:** rounded 6px solid fabric with a small pull-tab loop on the right and an orange zip
  pull. Swatch states **Ripstop** (plain fabric with grid texture), **Taped** (seam-taped: a dashed
  1px inset stitch line), **Reflective** (a silver diagonal strip).
- **Segmented control:** a webbing strap (woven stripe texture) with a buckle as the selected marker.
- **Toggle:** a side-release buckle: the male clip slides into the female when on.
- **Input:** 1px carbon border, stencil label above, unit suffix in mono at right (m, g, °C).
- **Cards:** gear cards with a grommet top-left and a hang-tag cord.
- **List rows:** trail list: blaze marker · name · distance · elevation gain (mono) · difficulty.
- **Progress:** an elevation profile silhouette with an orange dot at the current position.
- **Badges:** hang tags; spec chips ("Waterproof 20K").

## 8.9 SVG hero ideas
1. A contour map of a summit in secondary hairlines, a dashed trail in primary, a summit triangle,
   a coordinates label, and the brand name on a hang tag.
2. A giant hang tag (grommet, cord, spec table, logo) over a ripstop grid.
3. Three layered jagged ridgelines (aerial perspective) generated from noise — generic, not any brand
   skyline.

## 8.10 Pattern suite
1. `terrain` "Topo contours" brand `{ levels: 7, pix: 0.3, dither: 0, style: 'ridges' }`
2. `sonar` "Lake map" brand `{ land: 0.5, size: 1, speckle: 0.3, contours: true }`
3. `weave` "Ripstop" mono `{ bands: 14, rhythm: 'even', gap: 0.05, stripe: 0.6 }`
4. `pebbles` "Scree" brand `{ size: 0.8, gap: 0.2, erode: 0.5, mode: 'halftone', lit: 0.7 }`
5. `parcels` "Gear tags" mono `{ cell: 1.6, size: 1, every: 6, labels: true }`
6. `zigzag` "Switchbacks" brand `{ style: 'chevron', colors: 'two', band: 6, amp: 8, period: 12, phase: 'parallel', vertical: true }`

## 8.11 Pitfalls
- Camo and military cosplay.
- Brand logos and skylines (Arc'teryx fossil, Patagonia ridgeline, The North Face dome).
- Cartoon camping: tents, campfires, bears.
- HUD sci-fi readouts (Cyber HUD) or hazard stripes (Industrial Hazard).
- Khaki-only mud: the shell fabric needs a real colourway.

## 8.12 Distinctness
- **Industrial Device** (nearest): Braun/TE machined panels, physical keys. Gorpcore: fabric,
  webbing, contour maps, hang tags.
- **Industrial Hazard:** control-room alarms and stripes; gorpcore has one orange zip pull.
- **Blueprint:** line drawings on a blue field; gorpcore: map contours on stone.
- **Transit Wayfinding (new):** signs and route lines; gorpcore: terrain and gear tags.

## 8.13 Deck
- Principles: "Gear specs are the story" · "Map lines, not decoration" · "One orange zip pull"
- Do: "Hang a spec tag off every hero product." · "Make every fifth contour line heavier." · "Write
  numbers with units: grams, metres, degrees."
- Don't: "No camo, tents or campfire clip-art." · "Don't copy outdoor brand logos or skylines." ·
  "No hazard stripes; that's Industrial Hazard."

---------------------------------------------------------------------------

# 9. OLD WEB (default HTML, made with love)

**key** `old-web` · **Name** Old Web · **Descriptor** Handmade · Beveled · Hyperlinked ·
**mode** dark · **family** Digital · **slideShape** minimal ·
**material** "Bevels" · Raised / Visited / Sunken (button)

## 9.1 The one idea
Web 1.0 (1995-2001): a black starfield homepage holding grey bevelled OS windows, Times body text,
blue underlined links that turn purple, a visitor counter, a WordArt headline, an under-construction
banner and a row of 88×31 badges. Earnest, handmade, a little chaotic, and fully usable.

## 9.2 References
1. **98.css** [V] https://jdan.github.io/98.css/ — silver `#C0C0C0` ground; four-tone 2px bevels
   (white top-left, dark grey/black bottom-right); a navy→blue gradient title bar with white bold
   caption and min/max/close buttons; tree view with dotted connectors; sunken white fields; blue
   underlined links; a project that stresses semantic HTML and accessibility.
2. **Cameron's World** [V] https://www.cameronsworld.net — black starfield tile; a dense collage of
   GeoCities GIFs (planets, UFOs, stars, a temple); a centred ornamental divider bar; a speaker icon
   in a bevelled box. No grid.
3. **Neocities** (not viewed) https://neocities.org — the personal-web host at the centre of the
   revival (~600k sites per a 2025 write-up [S]).
4. **One Terabyte of Kilobyte Age** (not viewed) https://oneterabyteofkilobyteage.tumblr.com —
   screenshots of the GeoCities archive.
5. **Space Jam (1996)** (not viewed) https://www.spacejam.com/1996/ — starfield, planets as nav,
   table layout.
6. **GifCities** (not viewed) https://gifcities.org — GeoCities GIF search (reference only; do not
   embed GIFs).
7. **88×31 buttons collection** (not viewed) https://cyber.dabamos.de/88x31/ — the badge format.
8. **Poolside FM** (not viewed) https://poolside.fm — an OS-desktop metaphor as a product UI.
9. **sadgrl.online** (not viewed) https://sadgrl.online — a modern Neocities layout editor.
10. **Windows 95** (not viewed) https://en.wikipedia.org/wiki/Windows_95 — teal desktop `#008080`,
    taskbar, Start button (do not reproduce the logo).
11. **disassociated.com (2025)** [S] https://disassociated.com/neocities-nekoweb-bringing-back-weird-personal-websites/,
    **ITU "Netstalgia"** [S] https://ethos.itu.dk/netstalgia/, **Framer "90s websites"** [S]
    https://www.framer.com/blog/90s-websites/.
12. **Webcore** (not viewed) https://en.wikipedia.org/wiki/Webcore — the 2020 TikTok aesthetic.

## 9.3 Popularity evidence
The Neocities/Nekoweb indie-web revival skewing under-30 [S]; Webcore on TikTok [S]; Digital
Synopsis 2026 #11 pixel art revival [V]; Kittl 2026 #2 type collage cites "early web aesthetics" [V].

## 9.4 Signature mechanisms
- **The bevel** (exact, from 98.css [V]): raised = `box-shadow: inset -1px -1px #0a0a0a, inset 1px
  1px #ffffff, inset -2px -2px #808080, inset 2px 2px #dfdfdf`; sunken swaps the pairs. Lock it as
  a CSS token; do not approximate.
- **Title bar**: `linear-gradient(90deg, #000080, #1084D0)`, white bold 11-12px caption, three
  bevelled 16×14 caption buttons.
- **Starfield tile**: 64×64 tile of 1-2px white/blue dots with a few 4-point twinkles, on `#000`.
- **HTML defaults**: Times body, links `#0000EE` underlined, visited `#551A8B`, grooved `<hr>` (1px
  grey over 1px white), tables with double borders.
- **Dotted focus rectangle** (1px dotted inside the button): the original focus ring — keep it, it
  is both authentic and accessible.
- **Hit counter**: odometer digits in black cells with green LED numerals ("You are visitor #000417").
- **88×31 badges**: tiny pixel-text badges with gradient backs ("best viewed 800×600", "made with
  notepad").
- **WordArt headline**: gradient fill + 3D extrusion (6-10 stacked offset copies in a darker tone).
- **Under-construction banner**: one yellow/black diagonal stripe band with a simple drawn sign.
- **Webring bar**: `<< prev | random | next >>`. **Marquee**: a text band shown mid-scroll (static).

## 9.5 Composition
A black starfield page; a centred 760px "homepage" made of one or two bevelled windows; WordArt
title; left link column; grooved rules between sections; counter and badge row at the bottom;
desktop icons optional. The board's real UI lives inside the windows.

## 9.6 Typography
**Tinos** (new; Times metrics) for body and default headings; **Anton** as the Impact stand-in for
WordArt; **Comic Neue** (new) for exactly one guestbook-style element; **Pixelify Sans** / **Silkscreen**
for 88×31 badges and the counter; **Courier Prime** for code/pre. UI chrome 11-13px.

## 9.7 Colour and brand mapping
- **Fixed:** page `#000` starfield, silver `#C0C0C0`, bevel greys, navy title start `#000080`, link
  blue `#0000EE`, visited `#551A8B`, white fields.
- **Primary → WordArt gradient and the title-bar end colour** (title bar `#000080 → primary`;
  fall back to `#1084D0` if primary is too light for white caption text). **Secondary → the
  window's accent fills and desktop-icon colours. Accent → NEW! bursts and counter LEDs.**
- Links stay default blue/purple on silver or white. On the black page, links are `#9DB4FF` /
  `#C9A0FF` for contrast.

## 9.8 UI translation
- **Buttons:** raised bevel, silver, black 11px label; the default button gets an extra 1px black
  outer border; **Raised** (rest), **Visited** (link-buttons turn purple), **Sunken** (pressed:
  sunken bevel, label offset 1px down-right). Focus = dotted rectangle.
- **Segmented control:** Win9x tabs (raised tabs; the selected tab merges with the panel).
- **Toggle:** classic sunken checkbox with a black tick, or radio dot. (No modern switch.)
- **Input:** sunken white field.
- **Cards:** windows with title bars; group boxes (etched groove border with the label breaking it).
- **List rows:** tree view with dotted connectors, or a grid-lined table.
- **Progress:** segmented navy blocks in a sunken track.
- **Badges:** 88×31, NEW! burst, hit counter. **Dividers:** grooved `<hr>`.

## 9.9 SVG hero ideas
1. **Homepage:** starfield, a window titled "Welcome to [Brand]'s Homepage!", WordArt title with
   extrusion, an under-construction band, a visitor counter, a webring bar, three 88×31 badges.
2. **Desktop:** a client-colour desktop with two windows and three drawn icons (folder, globe, note).
3. **Dialog parody:** "[Brand] has performed an amazing operation." with an OK button.

## 9.10 Pattern suite
1. `pixelquilt` "Tiled wallpaper" brand `{ px: 1, block: 6, motifs: 'all', big: 0.1 }`
2. `stipple` "Starfield" night `{ density: 0.6, dot: 0.8, layout: 'random', mirror: 'none', field: 'clouds', duo: true }`
3. `marble` "Marble GIF" brand `{ bands: 8, warp: 2.5, cover: 0.9, stars: 0, outline: false }`
4. `gradpanes` "WordArt bands" brand `{ rows: 2, cols: 7, gap: 0.4, steps: 8, radius: 0 }`
5. `pixelgrid` "Construction tape" brand `{ cell: 2.5, mode: 'diagonals', zones: 2, density: 1, phase: 0 }`
6. `kaleidopix` "Clip-art tile" brand `{ px: 1.4, patches: 1, fold: 'quad' }`

## 9.11 Pitfalls
- OS logos, the Windows flag, real GIF assets, real 88×31 badges of real sites.
- Comic Sans everywhere; body text on busy tiles; unreadable link blue on black.
- Gloss, gradients and rounded corners on buttons (that's Frutiger Aero / Web 2.0).
- Vaporwave statues and Japanese text (a different aesthetic).
- Game sprites (Pixel Arcade).

## 9.12 Distinctness
- **Pixel Arcade** (nearest): game sprites, stepped pixel borders, dithered landscapes. Old Web: OS
  bevels, Times and blue links, tiled wallpapers, counters, badges.
- **ASCII Art:** monospace characters as the medium; Old Web uses HTML defaults.
- **Raw Brutalist ("brutalist web"):** severe and honest, thick borders, mono. Old Web is naive,
  bevelled, cluttered and cheerful.
- **Frutiger Aero (new):** Web 2.0 gloss (2005-13). Old Web is Web 1.0 flat bevels.

## 9.13 Deck
- Principles: "Default HTML, made with love" · "Bevel, link, badge, repeat" · "Best viewed at
  800×600"
- Do: "Use the exact four-tone bevel on every control." · "Keep links blue and underlined; visited
  purple." · "Add a visitor counter and a row of badges."
- Don't: "No OS logos or real GIF assets." · "No gloss or rounded buttons; that's Aero." · "Don't
  set body text on busy tiles."

---------------------------------------------------------------------------

# 10. BIG TOP (grown-up circus)

**key** `big-top` · **Name** Big Top · **Descriptor** Striped · Showy · Scalloped ·
**mode** light · **family** Graphic · **slideShape** classic ·
**material** "Canvas" · Plain / Striped / Spotlit (swatch)

## 10.1 The one idea
A grown-up circus showbill: wide tent stripes, scalloped valance edges, wood-type headlines on arcs
and ribbons, ticket-shaped buttons and a few marquee bulbs, in a warm vintage palette with lots of
cream. Theatrical, symmetric, confident — chic, not a kids' party.

## 10.2 References
1. **Pinterest Predicts 2026 — FunHaus** [S] (via AOL/Style coverage) — "circus interior" +130%,
   "vintage circus aesthetic" +70%, "striped ceiling" +40%; "bold stripes, sculptural curves,
   big-top color, and a wink of vintage clown charm"; framed as circus-inspired chic.
2. **AOL, "Circus stripes are the bold pattern trend taking over 2026"** [S]
   https://www.aol.com/articles/circus-stripes-bold-pattern-trend-170000033.html.
3. **Dynamic Mockups, FunHaus guide** [S] https://dynamicmockups.com/trends/funhaus-trend-2026-circus-aesthetic-mockups/
   — warm reds, creams, buttery yellows, vintage carnival lettering on apparel and paper goods.
4. **nss magazine, Pinterest 2026 list** [V headings] — FunHaus listed among 21 trends.
5. **Strobridge Lithographing Company** (not viewed) https://en.wikipedia.org/wiki/Strobridge_Lithographing_Company
   — the great circus-poster printer: chromolithography, ornate wood-type, ribbon banners.
6. **Hamilton Wood Type & Printing Museum** (not viewed) https://woodtype.org — Tuscan and French
   Clarendon (reversed-stress) wood types: the circus/showbill faces.
7. **Ringling Circus Museum** (not viewed) https://www.ringling.org/visit/circus-museum — posters and
   carved, gilded parade wagons with scrolls.
8. **Circusmuseum (NL)** (not viewed) https://www.circusmuseum.nl — European circus posters.
9. **Luna Park, Coney Island (1903)** (not viewed) https://en.wikipedia.org/wiki/Luna_Park,_Coney_Island_(1903)
   — bulb-outlined towers, pennants.
10. **Big top** (not viewed) https://en.wikipedia.org/wiki/Big_top — radial canvas panels, scalloped
    valance, king poles.
11. **Dreamland Margate** [V] https://www.dreamland.co.uk — a living amusement-park identity: a
    marquee ticker bar of uppercase items split by "|", a magenta header, a condensed caps wordmark
    with a widely letter-spaced sub-line (most of the page was behind a consent overlay).

## 10.3 Popularity evidence
Pinterest Predicts 2026 FunHaus with search figures [S]; multiple 2026 interiors/wedding/pattern
articles [S]; Jukebox 2026 #11 playful design and #5 patterns [V].

## 10.4 Signature mechanisms
- **Tent stripes** [K]: wide equal vertical stripes (1:1) in client primary and cream.
- **Scalloped valance**: a band whose bottom edge is a row of semicircles (radius 8-14px) — the
  signature edge for headers, cards and the deck cover band.
- **Radial canvas**: tent ceiling as radial stripes from a centre (sunburst geometry, straight
  edges).
- **Marquee bulbs**: evenly spaced warm-white circles with a soft glow ring around a sign; used to
  spotlight one element only (the **Spotlit** state).
- **Wood-type headlines**: Tuscan/Western display set on an arc path or inside a swallowtail ribbon
  banner; drop shade (offset second-colour copy 3px down-right).
- **Ticket stubs**: rectangles with semicircle side notches, a dashed perforation, "ADMIT ONE", a
  serial number.
- **Pennant bunting** on a sagging catenary; a twisted rope border (alternating short diagonals).

## 10.5 Composition
Symmetric showbill: centred headline on an arc; a ribbon banner across; a striped valance at the top
and stripes at the floor; stacked type sizes; a ticket CTA. Plenty of cream; clutter kept low.

## 10.6 Typography
**Rye** (new; woodtype class; Nicole Fally) for display; **Alfa Slab One** and **Abril Fatface** as
alternates; body **Karla** or **Bitter**; small caps for "Admit One"; numbers in the slab.

## 10.7 Colour and brand mapping
- **Fixed:** cream `#F6ECD6`, navy ink `#1F2A44` for text, bulb warm white `#FFF4D6`.
- **Primary → the stripe colour** (tent stripes, valance). **Secondary → ribbon banners and a
  tri-stripe second colour. Accent → stars, tickets and bulb glow.**
- Darken a pale primary until stripes hold 3:1 against cream. Never more than two stripe colours
  plus cream.

## 10.8 UI translation
- **Buttons:** ticket shape (side notches), primary fill, cream label, a dashed perforation near the
  right end. Swatch states **Plain** (flat canvas), **Striped** (tent stripes), **Spotlit** (bulb
  border). Pressed: the stub portion drops 2px ("torn").
- **Segmented control:** tent flaps with scalloped bottom edges; selected = striped.
- **Toggle:** candy-striped track when on; knob = a 5-point star.
- **Input:** cream field, 2px navy border, label in small caps; focus = a row of bulb dots along
  the bottom.
- **Cards:** poster cards with a striped scalloped valance header and cream body; or ticket cards.
- **List rows:** a programme of acts with dotted leaders ("The Amazing ………… 8:00").
- **Progress:** a row of bulbs lighting up.
- **Badges:** starburst "Tonight!", ribbon banners. **Dividers:** small bunting or rope.

## 10.9 SVG hero ideas
1. **The tent:** striped big-top silhouette with a scalloped valance, a flag on the king pole,
   bunting to both sides, the brand name in an arched ribbon above.
2. **Marquee sign:** a bulb-bordered panel with the brand name in Rye and a drop shade, a ticket
   below.
3. **Canvas ceiling:** radial stripes from centre with a circular medallion holding the logo.

## 10.10 Pattern suite
1. `weave` "Awning stripes" brand `{ bands: 8, rhythm: 'even', gap: 0, stripe: 2.5 }`
2. `burst` "Tent canopy" brand `{ rays: 28, layers: 1, bend: 0, beads: 0.8, origin: 'low' }`
3. `zigzag` "Bunting" brand `{ style: 'chevron', band: 10, amp: 6, period: 8, phase: 'interlock', colors: 'three' }`
4. `counterchange` "Ring" brand `{ figure: 'circle', bar: 3, dir: 'v', size: 0.8, nest: 3, second: true }`
5. `festival` "Confetti" brand `{ patches: 8, loops: 0.2, weight: 0.8, stars: 4, echo: true }`
6. `halftone` "Lithograph dots" brand `{ cell: 2.2, levels: 4, shape: 'round', angle: 15, field: 'clouds', duo: true }`

## 10.11 Pitfalls
- Clowns, performing animals, rainbow balloons, kids' party.
- Red-and-white candy overload; three or more stripe colours.
- Wood type for body copy.
- Ringling/Barnum marks or reproduced posters.
- Victorian clutter (ornate scroll everywhere).

## 10.12 Distinctness
- **Groovy 70s** (nearest): concentric rainbow bands, fat soft type, waves. Big Top: straight tent
  stripes, scallops, wood type, tickets, bulbs.
- **Radical Memphis:** laminate patterns and diagonal clashing stacks.
- **Neo-Brutal Pop:** thick outlines and offset shadows.
- **Atomic Mid-Century (new):** cut-paper sparkles of the 1950s; Big Top is 1900s showbill.

## 10.13 Deck
- Principles: "Stripes, scallops, showbill symmetry" · "Every button is a ticket" · "Grown-up
  circus, not party"
- Do: "Edge headers with a scalloped valance in brand stripes." · "Set headlines in wood type on an
  arc or ribbon." · "Use bulbs to spotlight one element only."
- Don't: "No clowns, animals or rainbow balloons." · "No more than two stripe colours plus cream."
  · "Never set body text in wood type."

---------------------------------------------------------------------------

# 11. GUMMY (light passes through, colour spills)

**key** `gummy` · **Name** Gummy · **Descriptor** Translucent · Squishy · Sweet ·
**mode** light · **family** Tactile · **slideShape** soft ·
**material** "Jelly" · Set / Wobble / Squish (button)

## 11.1 The one idea
Controls and objects are translucent candy: saturated bodies that light passes through, coloured
shadows with a bright caustic inside, tiny specular dots, and squash-and-stretch when pressed.
Sweet, bouncy, tactile — and still readable.

## 11.2 References
1. **Pinterest Predicts 2026 — Gimme Gummy** [V heading, S figures] — "jelly blush" +130%, "gummy
   bears aesthetic" +50%; "tactile, squishy, high-shine textures".
2. **Adobe Express 2026, trend #1** [V] https://www.adobe.com/express/learn/blog/graphic-design-trends-2026
   — "Puffy, soft, and squishy textures are almost a delicacy now".
3. **Framer, Jelly Button** [S] https://www.framer.com/marketplace/components/jelly-button/ —
   volumetric glass-clay look with a wobble on hover; evidence of the UI form.
4. **Gummiz identity (Design Monks, 2026)** [S] https://www.designmonks.co/projects/gummiz-playful-visual-identity-packaging-design
   — candy identity with expressive fruit characters and bold palettes.
5. **OLLY** [V] https://www.olly.com — gummy-vitamin brand: magenta/pink, rounded geometric caps,
   pill CTAs, a scalloped seal badge ("1g of sugar"), candy product shots on pastel.
6. **iMac G3** (not viewed) https://en.wikipedia.org/wiki/IMac_G3 — translucent fruit-flavour
   polycarbonate: seeing the inside as delight.
7. **Game Boy Color** (not viewed) https://en.wikipedia.org/wiki/Game_Boy_Color — translucent
   "Atomic Purple".
8. **Rhode** (not viewed) https://www.rhodeskin.com — "glazed", jelly-finish beauty packaging.
9. **Haribo** (not viewed) https://www.haribo.com — the gummy archetype; reference only, never the
   bear.
10. **Spline** (not viewed) https://spline.design — the 3D tool behind most 2023-26 squishy web
    visuals.
11. **Nothing Phone** (not viewed) https://us.nothing.tech — transparency as brand (show the inside).
12. **Lemme** (not viewed) https://lemmelive.com — supplement gummies, candy palette.

## 11.3 Popularity evidence
Pinterest 2026 Gimme Gummy [V/S]; Adobe 2026 #1 sensory/squishy [V]; squishies/fidget craze 2026 [S];
Framer marketplace jelly components [S].

## 11.4 Signature mechanisms
- **Jelly body** [K]: fill = base at 78-85% opacity over a pale ground; **transmitted light**:
  radial gradient lighter and more saturated near the bottom-right (light exits opposite the
  top-left source); **Fresnel rim**: a denser, darker band 2-4px inside the edge; **specular
  dots**: 2-3 small sharp white ellipses top-left (not a big gloss cap — that's Aero).
- **Coloured shadow + caustic**: the shadow is the jelly's own colour (offset 6-10px down, blur
  12px, 40%) with a small bright focused spot inside it. Grey shadows kill the effect.
- **Squash and stretch**: pressed = `scaleY(.88) scaleX(1.08)` from the bottom edge; hover wobble =
  scale 1.03 with specular dots shifting 1px.
- **Sugar coat**: optional "sugared" finish of tiny white speckles at 40% (for badges/hero only).
- **Overlap mixing**: where jellies overlap, `mix-blend-mode: multiply` at 85% — candy glass.
- **Shapes**: super-ellipse pills, gumdrop domes, ridged rings, rounded worms. No bears.

## 11.5 Composition
A few big jelly objects tumbling in a loose pile or a playful diagonal; UI pills floating on a pale
tinted ground; everything round; coloured shadows give depth instead of borders.

## 11.6 Typography
Round fat display: **Bagel Fat One**, **Fredoka** (600-700), **Baloo 2** (800); body **Nunito Sans**
or **DM Sans**; headlines lowercase or title case, tracking -0.02em; jelly-text treatment only on the
hero headline.

## 11.7 Colour and brand mapping
- **Fixed:** sugar white highlights; text ink warm plum `#2A1B3D`; ground = white tinted 6% toward
  the primary.
- **Primary → main jelly; secondary → second flavour; accent → third flavour.** If a pile needs more
  flavours, rotate primary hue ±40° at the same lightness/chroma (computed, never invented).
- Push client colours to candy: chroma up, lightness 55-75%. Each shadow takes its jelly's colour.

## 11.8 UI translation
- **Buttons:** jelly pill; **Set** (rest), **Wobble** (hover), **Squish** (pressed). Label white with a
  1px darker shadow when the jelly is dark enough for 4.5:1, else plum.
- **Segmented control:** pale frosted candy track; selected segment is a jelly bean.
- **Toggle:** translucent tube track; knob = gumdrop that changes flavour (to primary) when on.
- **Input:** pale field with a soft inner shadow (a candy mould), radius 16px; focus = 3px jelly-colour
  ring with soft glow.
- **Cards:** pale card, radius 24px, neutral soft shadow; a jelly object overlaps the top edge.
- **List rows:** gumdrop bullets in flavours.
- **Progress:** a ridged gummy worm filling (rounded bar with ring segments, translucent fill).
- **Badges:** scalloped seal in jelly (OLLY [V]).
- **Motion:** wobble/squish ≤150ms; reduced motion = colour change only.

## 11.9 SVG hero ideas
1. A pile of 5-7 gummies (domes, rings, worms) in brand flavours with coloured shadows and caustics;
   the wordmark in Bagel Fat One as jelly text.
2. One giant jelly brand initial, sugar-coated, squashed on the ground plane.
3. Overlapping jelly spheres mixing like a candy Venn diagram.

## 11.10 Pattern suite
1. `colony` "Jelly cells" brand `{ cells: 22, rings: 3, fuse: 1.4, finish: 'film', nuclei: true }`
2. `tokens` "Gummy drops" brand `{ cell: 7, link: 0, density: 0.6, fill: 'tint' }`
3. `zigzag` "Gummy worms" brand `{ style: 'rounded', colors: 'four', band: 8, amp: 5, period: 10, phase: 'interlock' }`
4. `warpcheck` "Wobble check" brand `{ pattern: 'check', warp: 'bulge', cells: 10, amp: 0.5, waves: 1, second: true }`
5. `oprings` "Jelly lens" brand `{ mode: 'eyes', centres: 3, freq: 8, warp: 0.3, bands: 'three' }`
6. `halftone` "Sugar dust" mono `{ cell: 0.9, levels: 3, shape: 'round', field: 'clouds', duo: false }`, tone 0.6
(Clay uses specimens/pebbles/gradpanes/aura; this suite avoids all four.)

## 11.11 Pitfalls
- Gummy bears or any candy brand's trade dress.
- Opaque matte fills (Clay), clear colourless glass (Liquid Glass), big gloss caps + sky (Aero).
- Grey shadows; pastel so pale the translucency doesn't read.
- Long text on translucent jelly.
- Constant wobble animation (motion sickness).

## 11.12 Distinctness
- **Clay** (nearest): opaque matte modelling clay on white cards, soft grey shadows. Gummy:
  translucent saturated bodies, coloured shadows with caustics, specular dots, squash.
- **Liquid Glass:** clear refractive colourless glass over a vivid scene. Gummy: the object itself is
  coloured and dense.
- **Frutiger Aero (new):** gloss cap on opaque gel + sky/nature environment. Gummy: no environment,
  transmitted light, candy.
- **Y2K Chrome:** dark metallic.

## 11.13 Deck
- Principles: "Light passes through, colour spills" · "Squash on press, never sag" · "Candy colour,
  coloured shadows"
- Do: "Tint every shadow with its jelly's colour, plus a caustic." · "Use tiny specular dots, not a
  big gloss cap." · "Squash pressed controls down and outward from the base."
- Don't: "No gummy bears or candy brand shapes." · "No grey shadows or opaque matte fills." · "Don't
  put long text on translucent jelly."

---------------------------------------------------------------------------

# 12. CURIO CABINET (collected, numbered, labelled)

**key** `curio-cabinet` · **Name** Curio Cabinet · **Descriptor** Collected · Labelled · Precious ·
**mode** dark · **family** Print & editorial · **slideShape** classic ·
**material** "Specimens" · Found / Pinned / Treasured (swatch)

## 12.1 The one idea
A Wunderkammer drawer under a warm lamp: small objects arranged in unequal recessed compartments on
dark baize, each one numbered and given a typed paper label. Identity through curation — the brand
shows what it keeps.

## 12.2 References
1. **Kittl 2026 #4 "Trinket design"** [V] https://www.kittl.com/blogs/graphic-design-trends-2026/ —
   "shells, buttons, coins, fruit, or crystals arranged in neat grids or museum-style displays";
   "part still life, part scrapbook"; the curation test: 5-10 objects, shot from above, subtle
   shadows — "the trick is in the spacing and the lighting".
2. **Cabinet of curiosities** (not viewed) https://en.wikipedia.org/wiki/Cabinet_of_curiosities and
   **Ole Worm** (not viewed) https://en.wikipedia.org/wiki/Ole_Worm — the Museum Wormianum engraving:
   shelves and compartments of labelled objects.
3. **Albertus Seba** (not viewed) https://en.wikipedia.org/wiki/Albertus_Seba — Thesaurus plates:
   specimens arranged symmetrically on a page.
4. **Ernst Haeckel, Kunstformen der Natur** (not viewed) https://en.wikipedia.org/wiki/Kunstformen_der_Natur
   — symmetric plates of radiolaria with numbered figures.
5. **Type case** (not viewed) https://en.wikipedia.org/wiki/Type_case — the printer's drawer of
   unequal compartments → the layout grid.
6. **Joseph Cornell** (not viewed) https://en.wikipedia.org/wiki/Joseph_Cornell — shallow shadow
   boxes of found objects.
7. **Deyrolle** (not viewed) https://www.deyrolle.com — Paris natural-history cabinet shop; pedagogic
   charts and specimen labels.
8. **Things Organized Neatly** (not viewed) https://thingsorganizedneatly.tumblr.com and **Knolling**
   (not viewed) https://en.wikipedia.org/wiki/Knolling — 90° flat-lay arrangement.
9. **Pitt Rivers Museum** (not viewed) https://www.prm.ox.ac.uk — dense typological cases,
   handwritten labels.
10. **Natural History Museum, London** (not viewed) https://www.nhm.ac.uk — specimen drawers and
    string-tied tags.
11. **Sophie Buhai** (not viewed) https://sophiebuhai.com — jewellery presented as artefacts on
    neutral grounds; trinket-curation as a 2020s brand language.
12. **Pinterest Predicts 2026 — Brooched** [S] — "heirloom jewelry" +45%, "brooch for men suit"
    +90%: the collecting/heirloom impulse.

## 12.3 Popularity evidence
Kittl 2026 #4 [V]; Pinterest 2026 Brooched [S]; "what's in my bag" and knolling culture cited by
Kittl [V]; Jukebox 2026 #1 custom iconography (object-as-identity) [V].

## 12.4 Signature mechanisms
- **Compartment grid** [K]: unequal rectangles (type-case logic: 1×1, 2×1, 2×2, 1×3) recessed into
  a tray: each cell has an inset shadow (top-left darker), walls 3-6px oak with a lighter top edge.
  Leave 1-2 compartments empty.
- **Procedural objects** (each with a top-down contact shadow: offset 2,3, blur 4, 35%): spiral
  shell (log spiral with ridges), coin (circle + milled edge ticks + embossed initial), button
  (4 holes, rim), glass marble (circle + swirl band + specular), crystal (hexagonal prism, facet
  shading), pebble, key, feather (vane strokes), pressed leaf (veins), bead strand.
- **Labels**: small paper tags, typed ("No. 0417 — Turbo shell, coll. 1898"), thin border; tied to the
  object with a curved thin string or pinned (a pin-head dot).
- **Numbering**: every object has a figure number; a legend lists them (Haeckel plates).
- **Baize ground**: deep green-black `#1F2A26` with sparse fibre texture.
- **Brass card-frame pulls** on drawer fronts: a small brass rectangle frame holding a label → nav.
- **Vitrine sheen**: one subtle diagonal glass reflection across the case.

## 12.5 Composition
The board is a cabinet: a hero tray of 8-15 objects in compartments; UI in "drawers" with brass
label pulls; a numbered legend column; warm lamp light from top-left; generous dark margins.

## 12.6 Typography
Headings **Libre Caslon Text**, **Bodoni Moda**, **Cormorant Garamond**; body **Newsreader** or
**Literata**; labels **Courier Prime** (typed) with Latin names in Caslon italic; old-style figures;
tiny caps on tags.

## 12.7 Colour and brand mapping
- **Fixed:** baize `#1F2A26`, oak walls `#4A3626` / top edge `#6B5038`, label paper `#EDE4CF`, label
  ink `#2A2520`, brass `#A8874A`.
- **Primary → drawer fronts** (primary buttons, nav). **Secondary → object materials** (enamel,
  marble glass, ribbon). **Accent → pin heads and the one "treasured" object's glow.**
- Client colours are rendered as materials (two-tone shading), never flat fills.

## 12.8 UI translation
- **Buttons:** drawer front, 4px radius, brass card-frame pull with the label inside. Swatch states
  **Found** (plain drawer), **Pinned** (a pin head on the label), **Treasured** (brass rim + soft
  glow). Pressed = pushed in (inset shadow).
- **Segmented control:** a row of drawer fronts; the selected one pulled out (lighter, shadow below).
- **Toggle:** a specimen-box track; knob = a pin head; on = pinned right in accent.
- **Input:** a paper label field (cream, 1px border, typewriter text) on baize; focus = brass outline.
- **Cards:** a recessed compartment holding an object, its label beneath.
- **List rows:** the legend: figure number · name (italic) · date · place; brass hairlines.
- **Progress:** compartments filling ("7 of 12 collected").
- **Badges:** string-tied tags.

## 12.9 SVG hero ideas
1. **Type-case tray:** 12 unequal compartments holding shell, coins, marble, crystal, button, key,
   leaf; numbered tags; the brand name on a brass-framed drawer label.
2. **Haeckel plate:** nine radial rosettes (procedural radiolarian geometry) in a 3×3 grid with figure
   numbers on a cream plate inside a dark frame.
3. **Knolled flat-lay:** brand-coloured objects at 90° on baize.

## 12.10 Pattern suite
1. `specimens` "Specimen trays" brand `{ cols: 5, gap: 0.6, round: 0, study: 'mixed', line: 0.8 }`
2. `modulargrid` "Type case" mono `{ cols: 10, style: 'line', merge: 0.7, gap: 0.4, empty: 0 }`, tone 0.6
3. `pebbles` "Mineral drawer" brand `{ size: 1, gap: 1.2, erode: 0.4, mode: 'mixed', lit: 0.8 }`
4. `inkstill` "Still life" brand `{ px: 0.8, masses: 4, vessels: 3, dither: 1, marks: false }`
5. `parcels` "Tags" mono `{ cell: 1.4, size: 1, every: 6, labels: true }`, tone 0.6
6. `seafan` "Coral specimen" night `{ fans: 1, branch: 1.2, ribs: false, screen: 0.3, lobes: 2 }`, tone 0.7

## 12.11 Pitfalls
- Taxidermy, pinned insects, dead animals.
- Hoarder clutter; no empty compartments.
- Tracing Seba/Haeckel plates (public domain, but generate, don't trace).
- Cold white museum (Dystopian Luxury) or a library of books (Dark Academia).
- Rounded tiles with headlines (that's Bento Grid).

## 12.12 Distinctness
- **Dystopian Luxury** (nearest): clinical white, vast emptiness, accession numbers, one red.
  Curio: warm dark baize, many objects, wooden compartments, string tags — abundance under a lamp.
- **Bento Grid:** light rounded tiles each making one product point. Curio: recessed compartments
  holding objects.
- **Dark Academia (new):** books and paper text. Curio: objects and specimen labels.
- **Wabi-Sabi (new):** emptiness and one gesture.

## 12.13 Deck
- Principles: "Collected, numbered, labelled" · "Every object earns a tag" · "Warm lamp over dark
  baize"
- Do: "Arrange 5 to 12 objects in unequal recessed compartments." · "Number every object and give
  it a typed label." · "Light from top-left with soft contact shadows."
- Don't: "No taxidermy, insects or dead animals." · "Leave some compartments empty; no clutter." ·
  "No clinical white; that's Dystopian Luxury."

---------------------------------------------------------------------------

# Runners-up (not picked)
- **Swiss International Style** — the most-requested evergreen. Not picked because it is not a
  current trend signal and its mechanisms (grid, Helvetica, flush-left, red) are already partly owned
  by Raw Brutalist and Bauhaus Poster; Transit Wayfinding carries the Swiss/Vignelli lineage. Best
  candidate for round 7 if the harsh review finds Raw Brutalist too broad.
- **Grainy blur** (Kittl 2026 #9) — owned by Mesh Gradient / Aurora Noir and the `aura` pattern.
- **Future Medieval** (Kittl 2026 #6) — would be the fourth gothic aesthetic.
- **Old money / country club** (Pinterest Glamoratti, Brooched) — collides with Dark Academia.
- **Vaporwave / Synthwave** — split across Y2K Chrome, Retro-futurist, Cyber HUD and Old Web.
- **Newspaper broadsheet** — close to Editorial Serif.
- **Afrofuturism / Afrohemian** — culturally specific; not appropriate as a skin for any client.

---------------------------------------------------------------------------

# Cross-cutting notes for the build
- **Fixed vs client roles:** Aero — fixed sky/white/gloss, client = gels. Naive — fixed ink/paper,
  client = crayons. Wabi-sabi — fixed paper/sumi/gold, client = muted glazes. Dark Academia — fixed
  oak/paper/gilt, client = book cloths + rubric. Mid-Century — fixed cream/charcoal + one period
  ink, client = cut planes. Art Nouveau — fixed cream/contour/gold rings, client = muted lithograph
  flats. Wayfinding — fixed black/white/alert yellow, client = routes. Gorpcore — fixed stone/carbon/
  blaze orange, client = fabrics. Old Web — fixed starfield/silver/link blue, client = WordArt +
  title bar. Big Top — fixed cream/navy/bulb, client = stripes. Gummy — fixed sugar/plum, client =
  flavours. Curio — fixed baize/oak/paper/brass, client = drawer fronts + materials.
- **Overlap guardrails (the one rule each):** Aero ≠ Liquid Glass (gloss cap + environment);
  Naive ≠ Neo-Brutal Pop (wobble + offset fill, no hard shadow); Wabi ≠ Dystopian Luxury (warm,
  small, brush); Dark Academia ≠ Editorial Serif (dark room, book objects); Mid-Century ≠ Bauhaus
  Poster (rough-cut, no ink lines, sparkles); Nouveau ≠ Neo Deco (organic curls, round arches,
  light); Wayfinding ≠ Industrial Hazard (calm, routes, one alert); Gorpcore ≠ Industrial Device
  (fabric, maps, tags); Old Web ≠ Pixel Arcade (OS bevels, HTML defaults); Big Top ≠ Groovy 70s
  (straight stripes, scallops, wood type); Gummy ≠ Clay (translucent, coloured shadows); Curio ≠
  Dystopian Luxury (warm abundance on baize).
- **Pairs inside this round to keep apart:** Aero vs Gummy (gloss cap + sky vs transmitted light +
  coloured shadow); Dark Academia vs Curio (books vs objects); Wayfinding vs Gorpcore (signs vs
  terrain).
- **Procedural drawing budget:** every hero above is drawable from primitives (circles, ellipses,
  beziers, polygons, noise contours). No photography, no figures, no copyrighted characters or
  marks.
- **Unverified claims removed:** Coralie Bickford-Smith's personal site (coralieb.com is an unrelated
  business — not cited); The Cut's 2017 gorpcore URL (404 — cited via Wikipedia instead); the
  Herman Miller Dezeen URL (403 — cited via LS:N Global); NPS Unigrid page (404 — cited via
  Wikipedia).

---------------------------------------------------------------------------

# Summary table — the twelve

| # | key | Name | Descriptor | Mode | Family | Slide shape | Material label · states (statesKind) |
|---|-----|------|-----------|------|--------|-------------|---------------------------------------|
| 37 | frutiger-aero | Frutiger Aero | Glossy · Airy · Hopeful | light | Luminous | soft | "Gloss" · Rest / Shine / Pressed (button) |
| 38 | naive-doodle | Naive Doodle | Wobbly · Honest · Sunny | light | Graphic | soft | "Crayon" · Outlined / Coloured in / Circled (button) |
| 39 | wabi-sabi | Wabi-Sabi | Unbleached · Imperfect · Still | light | Tactile | minimal | "Glaze" · Raw / Glazed / Mended (swatch) |
| 40 | dark-academia | Dark Academia | Bookish · Candlelit · Inked | dark | Print & editorial | classic | "Binding" · Cloth / Gilt / Sealed (swatch) |
| 41 | mid-century | Atomic Mid-Century | Optimistic · Cut-paper · Atomic | light | Graphic | classic | "Cut paper" · Cut / Layered / Printed (swatch) |
| 42 | art-nouveau | Art Nouveau | Whiplash · Botanical · Framed | light | Print & editorial | classic | "Frames" · Bare / Framed / Haloed (swatch) |
| 43 | transit-wayfinding | Transit Wayfinding | Directional · Coded · Calm | dark | Graphic | minimal | "Lines" · Scheduled / Approaching / Diverted (button) |
| 44 | gorpcore | Gorpcore | Technical · Outdoor · Rugged | light | Tactile | minimal | "Fabric" · Ripstop / Taped / Reflective (swatch) |
| 45 | old-web | Old Web | Handmade · Beveled · Hyperlinked | dark | Digital | minimal | "Bevels" · Raised / Visited / Sunken (button) |
| 46 | big-top | Big Top | Striped · Showy · Scalloped | light | Graphic | classic | "Canvas" · Plain / Striped / Spotlit (swatch) |
| 47 | gummy | Gummy | Translucent · Squishy · Sweet | light | Tactile | soft | "Jelly" · Set / Wobble / Squish (button) |
| 48 | curio-cabinet | Curio Cabinet | Collected · Labelled · Precious | dark | Print & editorial | classic | "Specimens" · Found / Pinned / Treasured (swatch) |

Family keys for js/aesthetic-meta.js: Luminous = `luminous`, Graphic = `graphic`, Tactile =
`tactile`, Print & editorial = `print`, Digital = `digital`.

# Font recommendations (add to js/aesthetic-meta.js; picks must exist in FONTS)

## New Google fonts to add to FONTS (js/data.js)
All css2 URLs below returned **HTTP 200** on 2026-10-11 (`https://fonts.googleapis.com/css2?<param>&display=swap`).
Categories and designers checked against the fonts.google.com metadata.

| Font | category | weights | ital | cls | css2 family param | Used by |
|---|---|---|---|---|---|---|
| Source Sans 3 | sans | 300;400;600 | — | humanist | `family=Source+Sans+3:wght@300;400;600` | frutiger-aero |
| Patrick Hand | display | 400 | — | hand (new) | `family=Patrick+Hand:wght@400` | naive-doodle |
| Caveat | display | 400;700 | — | hand (new) | `family=Caveat:wght@400;700` | naive-doodle (annotations) |
| Shippori Mincho | serif | 400;600 | — | text-serif | `family=Shippori+Mincho:wght@400;600` | wabi-sabi |
| Zen Kaku Gothic New | sans | 300;400;500 | — | humanist | `family=Zen+Kaku+Gothic+New:wght@300;400;500` | wabi-sabi |
| IM Fell English | serif | 400 | 400 | old-style | `family=IM+Fell+English:ital,wght@0,400;1,400` | dark-academia |
| Yellowtail | display | 400 | — | script (new) | `family=Yellowtail:wght@400` | mid-century |
| Federant | display | 400 | — | deco | `family=Federant:wght@400` | art-nouveau |
| Overpass | sans | 400;600;800 | — | neo-grotesk | `family=Overpass:wght@400;600;800` | transit-wayfinding |
| Barlow | sans | 400;600;700 | — | grotesk | `family=Barlow:wght@400;600;700` | gorpcore, transit-wayfinding |
| Saira Stencil | display | 400;700 | — | techno | `family=Saira+Stencil:wght@400;700` | gorpcore |
| Tinos | serif | 400;700 | 400 | text-serif | `family=Tinos:ital,wght@0,400;0,700;1,400` | old-web |
| Comic Neue | display | 400;700 | — | hand (new) | `family=Comic+Neue:wght@400;700` | old-web (one element) |
| Rye | display | 400 | — | woodtype (new) | `family=Rye:wght@400` | big-top |

Notes:
- `Saira Stencil` is the current catalogue name (variable). The legacy `Saira+Stencil+One` css2
  family also still returns 200; use the current name.
- Shippori Mincho and Zen Kaku Gothic New are CJK families; css2 serves them with `unicode-range`
  subsets, so a Latin-only page downloads only the Latin files.
- `css` stacks: hand → `"<name>", "Marker Felt", cursive`; script → `"Yellowtail", cursive`;
  woodtype → `"Rye", Georgia, serif`; Tinos → `"Tinos", "Times New Roman", serif`; Comic Neue →
  `"Comic Neue", "Comic Sans MS", cursive`.

## New font classes (FONT_CLASSES in js/data.js)
- `hand`: `{ label: 'handwritten', blurb: 'casual hand-lettered and marker faces' }`
- `script`: `{ label: 'script', blurb: 'connected brush and pen scripts' }` — `script` already
  exists as an avoid-list pseudo class ("the library has none yet"); making it a real class keeps
  those avoid lists meaning the same thing. Remove it from the pseudo-class comment.
- `woodtype`: `{ label: 'wood type', blurb: 'Tuscan, Western and circus poster wood types' }` — add
  `woodtype` to `AESTHETIC_SERIF_CLASSES` so avoid: ['serif'] still excludes it.

## Per-aesthetic recommendations

| # | Heading → picks | Body → picks | Mono | Avoid | Pairings (first applied) |
|---|-----------------|--------------|------|-------|--------------------------|
| 37 frutiger-aero | humanist, geometric → Source Sans 3, Nunito Sans, Figtree | humanist → Source Sans 3, Nunito Sans | — | serif (all), condensed, heavy, pixel, typewriter, hand | Source Sans 3/Source Sans 3 · Figtree/Nunito Sans · Nunito Sans/Source Sans 3 |
| 38 naive-doodle | hand, rounded → Patrick Hand, Caveat, Fredoka, Baloo 2 | geometric, humanist → DM Sans, Nunito Sans | — | didone, deco, techno, blackletter, condensed, mono | Patrick Hand/DM Sans · Fredoka/Nunito Sans · Caveat/DM Sans |
| 39 wabi-sabi | text-serif, old-style → Shippori Mincho, Cormorant Garamond, EB Garamond | humanist → Zen Kaku Gothic New, Figtree | — | heavy, condensed, groovy, pixel, techno, rounded, hand | Shippori Mincho/Zen Kaku Gothic New · Cormorant Garamond/Zen Kaku Gothic New · EB Garamond/Figtree |
| 40 dark-academia | old-style, didone → IM Fell English, Cormorant Garamond, Libre Caslon Text, Playfair Display | old-style → EB Garamond, Crimson Pro, Libre Caslon Text | Courier Prime | geometric, rounded, techno, pixel, groovy, wide, blackletter | IM Fell English/EB Garamond · Cormorant Garamond/Crimson Pro · Playfair Display/Libre Caslon Text |
| 41 mid-century | geometric, script, slab → Jost, Josefin Sans, Yellowtail, Alfa Slab One | geometric → Jost, DM Sans | — | techno, pixel, blackletter, mono, condensed, didone | Jost/DM Sans · Yellowtail/Jost · Josefin Sans/Karla |
| 42 art-nouveau | deco, soft-serif, old-style → Federant, Fraunces, Marcellus, Cormorant Garamond | old-style → EB Garamond, Spectral | — | techno, pixel, heavy, condensed, mono, geometric | Federant/EB Garamond · Fraunces/Spectral · Marcellus/Cormorant Garamond |
| 43 transit-wayfinding | neo-grotesk, grotesk → Overpass, Inter Tight, Public Sans, Barlow | neo-grotesk → Overpass, Public Sans, Inter | — | serif (all), groovy, hand, script, pixel, deco | Overpass/Overpass · Inter Tight/Public Sans · Barlow/Inter |
| 44 gorpcore | condensed, techno → Barlow Condensed, Saira Stencil, Big Shoulders Display | grotesk, neo-grotesk → Barlow, Inter, IBM Plex Sans | JetBrains Mono, IBM Plex Mono | serif (all), groovy, script, hand, deco, rounded | Barlow Condensed/Barlow · Saira Stencil/Inter · Big Shoulders Display/IBM Plex Sans |
| 45 old-web | text-serif, condensed, hand → Tinos, Anton, Comic Neue | text-serif → Tinos | Courier Prime | deco, soft-serif, didone, geometric, script, blackletter | Anton/Tinos · Tinos/Tinos · Comic Neue/Tinos |
| 46 big-top | woodtype, slab, didone → Rye, Alfa Slab One, Abril Fatface | grotesk, slab → Karla, Bitter | — | techno, pixel, mono, blackletter, hand, wide | Rye/Karla · Alfa Slab One/Bitter · Abril Fatface/Karla |
| 47 gummy | groovy, rounded → Bagel Fat One, Fredoka, Baloo 2 | humanist, geometric, rounded → Nunito Sans, DM Sans, Fredoka | — | serif (all), condensed, techno, blackletter, mono, typewriter | Bagel Fat One/Nunito Sans · Fredoka/Fredoka · Baloo 2/DM Sans |
| 48 curio-cabinet | old-style, didone → Libre Caslon Text, Bodoni Moda, Cormorant Garamond | text-serif → Newsreader, Literata | Courier Prime, DM Mono | heavy, techno, pixel, groovy, rounded, hand | Libre Caslon Text/Newsreader · Bodoni Moda/Literata · Cormorant Garamond/Newsreader |

`why` sentences (one per entry, ≤ 1 sentence):
- frutiger-aero: "A friendly humanist sans in light weights is the face of 2000s tech optimism, and it
  lets the gloss do the talking."
- naive-doodle: "A readable hand for headlines and a tidy sans for everything else keep the charm
  without hurting legibility."
- wabi-sabi: "A sharp mincho serif with a light gothic sans reads calm and crafted, and neither ever
  raises its voice."
- dark-academia: "Old-style book faces with a little printing irregularity make every screen feel like
  a page from the stacks."
- mid-century: "A Futura-style geometric with one brush-script word is the signature 1950s pairing."
- art-nouveau: "Period sign lettering for display and a classic Garamond for text keep ornament in the
  headings and clarity in the body."
- transit-wayfinding: "Highway-sign and Swiss-descended grotesks are built to be read at a glance from a
  distance."
- gorpcore: "Condensed and stencil faces with a plain DIN-like body read like gear labels and spec
  sheets."
- old-web: "Times body text, an Impact-style headline and one Comic Sans moment are the honest defaults
  of the 1990s web."
- big-top: "Wood-type display faces carry the showbill, and a plain sans keeps the programme readable."
- gummy: "Fat rounded display faces look as soft and squishy as the jelly they sit on."
- curio-cabinet: "Caslon and typewritten labels make every item look catalogued by hand."
