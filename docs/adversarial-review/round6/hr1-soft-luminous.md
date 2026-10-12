# HR1: soft and luminous group (round 6 harsh review, packet rev 1)

Aesthetics: soft-form, liquid-glass, holo-iridescent, mesh-gradient, aurora-noir, clay.

Evidence: board screenshots `r6-<key>-A/B/C/D.png` and sheets, deck sheets and full-size slides in `r6/dk/`, crops in scratch `adv/hr1/`, and reference screenshots in `adv/hr1/refs/` (grids: `g-sf.png`, `g-lg.png`, `g-ho.png`, `g-mg.png`, `g-an.png`, `g-cl.png`, `g-b2.png`). None of these are in the repo. I read the code but did not edit it. "Viewed" means I opened the page headless and looked at it on 2026-10-11.

## Scores

| Aesthetic | Score | Verdict | Nearest neighbours | Who must move |
|---|---|---|---|---|
| soft-form | 5 | Refine | clay, liquid-glass | clay moves off recessed fields; soft-form goes light and monochrome |
| liquid-glass | 4 | Rework | mesh-gradient, soft-form | liquid-glass: it shares mesh's blob scene and white cards |
| holo-iridescent | 4 | Rework | aurora-noir, mesh-gradient | holo: below the hero it is aurora-noir with rainbow borders |
| mesh-gradient | 4 | Rework | liquid-glass, aurora-noir | mesh moves to a light, striated field with ink type |
| aurora-noir | 5 | Refine | holo-iridescent, mesh-gradient | aurora keeps the dark; it has to actually show an aurora |
| clay | 5 | Refine | soft-form, mesh-gradient | clay: put the clay back on objects only |

None of the six would get past the first round at Collins or Koto. Each one gets a recognisable surface right, but the system underneath belongs to the generator, not to the style.

## Problems shared by the whole group

These hurt every board in the group, and they are why the six look like siblings. The fixes per aesthetic below assume they are addressed.

1. **Same skeleton, six skins.** Every board has the same order: header, hero, five swatches, a two-column type block with "✓ Fits" pills and an outlined "Use recommended fonts" button, then "01 Interface" (a "Your next good idea." card with a segmented control and a full-width CTA), "02" (field, toggle, three state samples) and "03 In use" (Brand refresh 72 / Launch site 45 / Spring campaign 10, each with a status pill and a progress bar). With the hero cropped off, you can only tell them apart by the shadow recipe. The phone layout (D) is the same stack in all six, down to the palette list. Only the hero and the surfaces are allowed to differ, so distinctness has to be won there.
2. **Three of the six share one typeface.** soft-form, liquid-glass and aurora-noir all default to Inter Tight / Inter (`js/aesthetic-meta.js`, first `pairings` entry). Inter is a reasonable proxy for the reference in each case, but on the board it reads as the same voice three times.
3. **The pattern suites are interchangeable** (`js/patterns/fit.js`). `aura` (blurred blobs) appears in all six suites and leads five of them. The lead pattern drives the deck's cover band and closing strip, so five of the six decks open and close on the same blurred brand-colour smear. `gradpanes` is in five suites (Pressed panes, Glass panes, Foil strips, Pillow panes, Ramp panes), `halftone` in all six, and `waves` renders liquid-glass "Currents" and mesh "Ribbon waves" almost identically. The colorways only remap brand roles, which leads to the next problem.
4. **Brand colours leak into every pattern.** The engine has no colorway that is not built from the brand's roles. holo's own rule ("the spectrum is fixed and decorative, never a brand colour") cannot be followed by its own suite, so its patterns come out in orange and teal camo. The same mechanism puts orange on soft-form's "Soft screen" and on aurora's "Filaments". Fix: add a `spectrum` colorway (holo's fixed thin-film ramp) and a `tonal` colorway (canvas ± 8% L with one primary spark) to `js/patterns/engine.js`.
5. **One orange CTA everywhere.** It is a full-width pill or rounded slab with a trailing arrow glyph in all six. Only the shadow changes between them.

---

## soft-form

**Score: 5/10. Refine.** The hero composition is a real idea (Bauhaus well, disc, semicircle, glass bar). Everything under it is a dark settings page with inner shadows, and in its own recommended dark mode the highlight half of the material is 7% white, so the effect it exists to show barely registers.

### References
- Teenage Engineering EP-133 / OP-1 page, https://teenage.engineering/products/op-1 (viewed): grey keys raised out of a grey body, so one material is pressed and lifted. Tiny printed icons and one red dot are the only colour. This is the strongest single reference for the brief.
- neumorphism.io, https://neumorphism.io (viewed): the canonical generator. A #e0e0e0 canvas with paired 20/60px shadows. The effect reads because the canvas is mid-light grey.
- Michal Malewicz, "Neumorphism in user interfaces", https://hype4.academy/articles/design/neumorphism-in-user-interfaces (viewed): pale canvas, a ring gauge as the hero object, one saturated accent. It is also the standard critique of neumorphic contrast.
- Alexander Plyuto, "Skeuomorph Mobile Banking" (Dribbble, 2019), https://dribbble.com/shots/8355305 (not viewed: the URL now serves another shot). The origin of the style: sliders, dials and cards, all canvas-coloured.
- Braun Audio / Dieter Rams lineage, https://www.braun-audio.com/en-GB (viewed): few controls, one coloured key, every object a single material.
- rabbit r1, https://www.rabbit.tech (viewed): one orange, one object, everything else neutral.
- Daylight Computer, https://daylightcomputer.com (viewed): a matte tactile object in soft daylight, where warmth comes from light rather than colour.
- Bauhaus Dessau, https://www.bauhaus-dessau.de/en/ (viewed): geometry cut out as content (gear-edged photo mask) on a soft tinted field.
- The approved reference, `~/.claude/skills/soft-form-design/assets/approved-reference.html` and `references/visual-system.md` (read): canvas `#eae9e3` light, highlight 79%. Dark mode is the documented fallback, not the default.

### Kill list
- **The "Flat" disc** in the 02 Touch & depth well (A, B, D). It is a 1px hairline ring (`.ab-disc[data-s="0"] { border: 1px solid var(--ab-line) }`), so a wireframe circle sits inside a tactile panel and reads as an empty socket.
- **Glossy teal progress bars and raised status capsules** in 03 In use (A). They break the board's own rule ("one glossy action per screen", "keep dense rows flat"): three glossy cyan fills compete with the one glossy orange CTA, and the secondary colour leaks into the dense rows.
- **"✓ Fits" pills and the outlined "Use recommended fonts" button** (A, type block). They are flat SaaS chrome outside the material vocabulary.
- **Deck patterns "Soft capsules", "Soft screen" and "Dot matrix"** (sheet-deck, slide 07): a maze of brand tubes, orange camo halftone and a glyph grid. None of them is relief, so all three are print patterns in brand colours.
- **The cover band and closing strip** ("Quiet glow", `aura`). It is the same blurred smear as four other decks.

### Gaps (ranked)
1. **The recommended mode undercuts the material. Severity: high.** Every reference sits on a pale mid-tone. On `#363032` the highlight is `rgba(255,255,255,.07)`, so in A the Raised and Recessed discs differ by a faint smudge and the palette sockets nearly vanish. B (light) is plainly the better board.
2. **Scale contrast is timid. Severity: high.** TE and Braun use one big object and micro labels. Ours puts a ~60px headline beside a 310px art box (`.ab-art { max-width: 310px }`), and below the hero nothing is bigger than 22px or smaller than 11px.
3. **Too few instruments. Severity: medium-high.** The style's vocabulary is dials, sliders, keys, rings and gauges (Plyuto, Malewicz, EP-133). The board has one toggle, one field and three 56px discs, so detail density is low.
4. **The type is not Bauhaus. Severity: medium.** Inter Tight 500 at -0.05em is neat but anonymous, and it is the same face as liquid-glass and aurora-noir.
5. **Phone. Severity: low.** The art scales well, and everything else is the stacked desktop.

### Distinctness
- **vs clay:** soft-form B and clay A are both pale canvases with puffy raised controls and a recessed input tray (clay's `.ab-input` is an inset tray). They are siblings in light mode. Soft-form keeps the recess and same-colour relief; clay must give up inset trays and recessed fields (see clay fix 1).
- **vs liquid-glass:** both use `abLens` simulated refraction and an iridescent rim. In practice they read differently (dark relief versus a bright scene), so this is fine as long as soft-form stays monochrome.
- **Verdict:** distinct from liquid-glass, too close to clay. Soft-form has to own "one colour, all relief", which means no teal in the UI at all.

### Fixes (ranked)
1. **(Top 3) Make light the recommended mode.** In `js/aesthetics/soft-form.js`, change `mode: 'dark'` to `mode: 'light'`. The light canvas already resolves near the approved `#eae9e3`. For the dark fallback, raise `hi` in `tokens()` from `0.07` to `0.11` and add a 1px top rim to raised surfaces: in `css/aesthetics/soft-form.css`, set `--sf-raised` to `6px 6px 13px var(--ab-lo), -6px -6px 13px var(--ab-hi), inset 0 1px 0 rgba(255,255,255,.06)`. The skill's dark-scheme note asks for exactly this.
2. **(Top 3) One colour, one gloss.** In the CSS:
   - `.ab-row-bar i`: set `background: var(--ab-ink); opacity: .55; box-shadow: none;` and height 6px inside the recessed track.
   - `.ab-row-status`: set `background: none; box-shadow: none; padding: 0; color: var(--ab-muted);`.
   - `.ab-swatch[data-role="secondary"|"accent"] .ab-chip::after`: drop the gloss gradient.

   The only colour left on the page should be the primary CTA and the switch knob.
3. **(Top 3) Show the material with instruments, not discs.** Set `labels.states` to `['Raised', 'Recessed', 'Glass']` and grow the discs to 84px (`.ab-disc { width: 84px; height: 84px }`). Rebuild `data-s="0"` as the skill's glass circle lens: `background: linear-gradient(135deg, rgba(255,255,255,.6), rgba(197,234,229,.18) 30%, rgba(215,190,243,.34) 62%, rgba(245,214,168,.35) 83%, rgba(255,255,255,.53)); border: 1px solid rgba(255,255,255,.44); box-shadow: inset 2px 2px 3px rgba(255,255,255,.75), inset -2px -2px 4px rgba(197,173,235,.6);`. Add a recessed slider (track 8px, inset `--sf-inset-s`, raised 22px thumb) under the toggle in the 02 panel.
4. **Push the scale.** In `soft-form.js`, change `type.display` from `1.12` to `1.36`. In the CSS, change `.ab-art { max-width: 310px }` to `440px` and let the well bleed 6% past the right gutter (`margin-right: -6%`). Kicker and labels stay at 11px.
5. **Give it its own voice.** In `js/aesthetic-meta.js` `'soft-form'`, make `['Manrope', 'Inter']` the first pairing. Set the headline to Manrope 600 at `letter-spacing: -0.045em` in `.ab-headline`. Its geometric construction with soft terminals suits Bauhaus-with-feeling and moves it off Inter Tight.
6. **Make the type chrome material.** Use `.ab[data-ae="soft-form"] .ab-type-apply { border: 0; background: var(--ab-canvas); box-shadow: var(--sf-raised-s); border-radius: 10px; }`, and render `.ab-fit` as plain muted text with a 6px primary dot (`background: none; box-shadow: none`).
7. **Replace the deck suite** (`fit.js` `'soft-form'`):
   - Lead with `['counterchange', 'Bauhaus relief', 'mono', { figure: 'circle', bar: 3.6, dir: 'v', size: 0.6, nest: 2, second: false }, 0.45]`.
   - Drop `tokens`, the `halftone` "Soft screen" and `glyphgrid`.
   - Longer term, add an `emboss` family (canvas-coloured circles and semicircles rendered with the paired shadow), which is the only pattern that could honestly carry this style.

### Keep
- The hero composition: the recessed well, the off-centre raised disc, the primary semicircle and the tilted glass bar that refracts a duplicate (`sfa-*`). It is the one hero in this group that is an authored composition rather than a stock asset.
- The iridescent ring on the 01 glass card, which is faithful to the approved reference.

### Deck
- **01 cover:** the art at 180px beside a 70px headline gives no scale drama, and the "Quiet glow" band below is a blurred smear.
- **05 interface:** three equal boxes plus a Flat/Raised/Recessed well. "Flat" is a hairline circle again.
- **06 material:** the best slide. It needs the four material names set much larger, not as 9px tracked caps.
- **07 patterns:** see the kill list. "River stones" is the only pattern that reads as tactile.
- **10 closing:** the blurred left strip is the same as on four other decks.

---

## liquid-glass

**Score: 4/10. Rework.** There is no liquid and barely any glass. A hairline squircle sits over a giant white "M" on blurred blobs, holding a 1.08× copy that nobody can see. Below the hero is a white-card SaaS template.

### References
- Apple Newsroom, "Apple introduces a delightful and elegant new software design" (9 Jun 2025), https://www.apple.com/newsroom/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/ (viewed): Liquid Glass as the control layer floating over content, with speculars that react to light and motion.
- Apple HIG, Materials, https://developer.apple.com/design/human-interface-guidelines/materials (viewed): Liquid Glass is reserved for controls and navigation, and standard materials go underneath.
- Apple iOS, https://www.apple.com/os/ios/ (viewed): device shots show glass tab bars and toolbars over photos and lists, not over gradients.
- Apple visionOS, https://www.apple.com/visionos/ (viewed): glass windows over real environments.
- kube.io, "Liquid Glass in the Browser: Refraction with CSS and SVG" (Sep 2025), https://kube.io/blog/liquid-glass-css-svg/ (viewed): the technique. A displacement map is derived from the squircle's surface profile, bending is concentrated at the rim with the centre close to 1:1, and it is applied with `feDisplacementMap` plus a specular rim.
- liquid-glass-react demo, https://liquid-glass.maxrovensky.com (viewed): a glass card over a beach photo, with edge displacement, adjustable displacement and blur, and chromatic aberration. Refraction is only visible where a hard edge crosses the rim.
- Apple Developer, "Liquid Glass" technology overview, https://developer.apple.com/documentation/technologyoverviews/liquid-glass (not viewed).
- WWDC25, "Meet Liquid Glass" (not viewed): lensing, adaptive tint, and the glass-droplet morph on controls.

### Kill list
- **The "Focus 18:24" timer card** (A hero, top left). It is a stock iOS-widget costume. Its 10% white fill sits on the saturated primary blob, so in A it reads as a solid orange slab, not glass.
- **The lens as a picture frame** (A hero; `lg-mat.png`). `scale: 1.08, dx: 0, dy: 0` (`art()`, `lens()`) means the copy inside is indistinguishable from the scene, so the squircle is just a hairline box around the M.
- **The three-blob scene** (`.lgs-mesh`, three radial gradients). It is the same language as mesh-gradient's band, and refraction of a blur is invisible by definition.
- **White SaaS cards below the hero** (A: 01, 02, 03). They are radius 28, a hairline and a soft drop shadow: correct as Apple "regular material", but with no glass control anywhere in the interface it reads as any light SaaS template.
- **Deck patterns "Refraction" (topographic lines), "Currents" (a duplicate of mesh's "Ribbon waves"), "Bubble screen" and "Light leaks".**

### Gaps (ranked)
1. **No lensing. Severity: high.** The references bend content at the rim (kube.io, the react demo). Ours applies a uniform 1.08× scale with no offset, so there is no visible bend anywhere on the board.
2. **There is nothing sharp to bend. Severity: high.** Apple puts glass over photos, text and lists. Ours puts it over blurred blobs. The M is the only edge, and the lens is centred on it, so the rim crosses empty blur.
3. **There is no glass in the interface. Severity: high.** In Apple's system the tab bar, toolbar, segmented control and slider thumb are glass. Ours has a grey well with a white pill for the segmented control and an opaque orange CTA. The 02 "Clear / Tinted / Frosted" strip is the only interface glass, and it is 60px tall.
4. **The type and list voice are not Apple's. Severity: medium.** Apple's tell is the type scale (34pt large title, 17pt body, 13pt footnote) and inset grouped lists with separators inset 16pt. Ours uses the shared 03 row with numbered IDs and progress bars, in the same face as soft-form and aurora-noir.
5. **The hero is identical in dark mode (B). Severity: medium.** It is a dark slab pasted on a dark board. The light/dark mode switch never touches the scene.
6. **Phone. Severity: low.** The stacked hero is actually better than desktop (the lens is larger), but the rest is the shared stack.

### Distinctness
- **vs mesh-gradient:** both are light mode, both have a hero of radial brand blobs (3 here, 6 there), and both put white cards with soft shadows below. They are siblings. Liquid-glass is the derivative one and must move: sharp content under the glass and glass controls in the interface (fixes 1–3). Mesh moves too (its fixes 1–2).
- **vs soft-form:** both use `abLens` and an iridescent or specular rim. This is fine once soft-form goes monochrome and light.

### Fixes (ranked)
1. **(Top 3) Real rim refraction.** The lens holds a duplicate DOM scene, so an ordinary CSS `filter: url()` works cross-browser; this is not a backdrop filter. Emit one SVG filter from `art()`: `<filter id="lg-refract-${seq}" x="0" y="0" width="1" height="1"><feImage href="data:image/svg+xml,…squircle normal map…" result="map"/><feDisplacementMap in="SourceGraphic" in2="map" scale="34" xChannelSelector="R" yChannelSelector="G"/></filter>`. Build the normal map as two linear gradients (R across x, G across y) inside a squircle, fading to 50% grey from 78% of the radius inwards, so the centre stays 1:1 and the outer 22% bends. Apply it as `.lgs-lens .ab-lens-scene { filter: url(#lg-refract-N) saturate(1.15); }` and set the lens `scale` to `1.0`. For chromatic fringing, add a second pass at `scale="40"` on the red channel only (`feColorMatrix` split, then `feBlend`).
2. **(Top 3) Give the glass hard edges to bend.**
   - Move the lens off-centre so its rim cuts through the letter: in `lens(72, 52, …)`, use `cx 80, cy 40`, and change the width factor from `1.15` to `0.62` of the glyph advance.
   - Replace `.lgs-mesh` with a hard-edged scene: `linear-gradient(100deg, var(--ab-scene-base) 0 38%, var(--ab-primary) 38% 61%, var(--ab-accent) 61% 66%, var(--ab-secondary) 66%)`, plus one soft radial highlight at 25% opacity for depth.
   - The stripes and the M strokes then visibly kink at the rim, which is the whole point.
3. **(Top 3) Put glass in the interface.** Give the 01 card a content header (a 96px strip of the scene) and float the segmented control on it as glass: `.ab[data-ae="liquid-glass"] .ab-seg { background: rgba(255,255,255,.12); backdrop-filter: blur(14px) saturate(160%); box-shadow: var(--lg-glass-rim), var(--lg-glass-shadow); }`. Render the switch knob as the documented "Glass droplet knob" material instead of a plain white disc.
4. **Drop the widget costume.** Delete `.lgs-card` (the timer) from `art()`. If a second floating control is needed, use a glass slider (track 4px, glass thumb 28px) placed over the dark base (left 6%, top 70%), where a 10% fill actually reads as glass.
5. **Use Apple's list and type voice below the hero.**
   - Rows: `.ab-row { padding: 11px 0; font-size: 17px }`, separators inset 16px (`.ab-row + .ab-row { border-top: 0; box-shadow: inset 16px 1px 0 -15px var(--ab-material-line) }`), hide `.ab-row-n`, and use a trailing chevron instead of a percentage.
   - Card title: 22px/600 (`.ab-card-title`).
   - In `aesthetic-meta.js`, make `['Inter', 'Inter']` the first pairing, with the headline at `font-variation-settings: 'opsz' 32` and weight 680. Inter is the closest SF Pro proxy, and a different first pairing separates it from soft-form and aurora-noir.
6. **Make the hero react to mode.** In `tokens()`, when the mode is light, lift `sceneBase` to `t.mix(t.ink, '#000', .2)` and give `.ab-art` a 1px `--ab-rim` outline, so the scene reads as content inside the board rather than a pasted slab. Also set `--lg-glass-fill` to 0.18 in light mode.
7. **Replace the deck suite** (`fit.js` `'liquid-glass'`):
   - Lead with `['warpcheck', 'Lens grid', 'mono', { pattern: 'check', warp: 'bulge', cells: 22, amp: 0.45, second: false }, 0.6]`. It is the only existing family that shows refraction.
   - Drop `waves` (it duplicates mesh), `neonspray` and the `halftone` "Bubble screen".

### Keep
- The squircle tab bar with its brighter selected lens (`.lgs-tabs`, `.lgs-tab.on`). It is faithful to iOS 26.
- The 02 "Clear / Tinted / Frosted" strip as a concept. It is the only honest material demo on the board, so it should be scaled up, not removed.

### Deck
- **01 cover:** the scene card is shrunk to a dark rounded rectangle on cream. The "Light, bent gently" story never appears on the cover.
- **06 material:** the same hero again at 300px, so nothing new is shown.
- **05 interface:** the Clear/Tinted/Frosted strip is the best slide in this deck. Make it full-bleed with the refraction from fix 1.
- **07 patterns:** none of the six shows glass.
- **10 closing:** blurred strip.

---

## holo-iridescent

**Score: 4/10. Rework.** The hero is a stock "holographic gradient" ribbon: five pastel stops mapped left to right, with an hourglass pinch where a twist should be. A clip-art bubble orbits it, and both are centred over a near-black SaaS board that is aurora-noir with rainbow borders.

### References
- Hue Studio, Cru+ café and patisserie identity, https://theinspirationgrid.com/hue-studios-iridescent-brand-identity-for-cru-cafe-patisserie (viewed): iridescent print on pale lilac stock. The sheen covers a large flat plane whose hue drifts with the angle, and the logotype is quiet and debossed. Iridescence is the surface, not a decoration on it.
- Parámetro Studio, Black & Bone, https://thedieline.com/how-black-bone-got-its-stylish-eye-catching-look/ (viewed; the page sits behind a consent modal, but the story and lead image were visible): holographic foil used as the statement on some pieces only, against strict black and white.
- Wikipedia, "Thin-film interference", https://en.wikipedia.org/wiki/Thin-film_interference (viewed): the physics and the oil-slick image. Colour comes as banded, contour-like fringes in a repeating order with thickness, not as one smooth five-stop sweep.
- Stripe Sessions, https://stripe.com/sessions (viewed): a twisted ribbon done properly. Thousands of fine striations follow the surface, the hue order changes across the twist, and the back face reads as a back face.
- Arc / Dia, https://arc.net (viewed): spectral colour as a thin scalloped fringe on a flat field. Restraint is the point.
- Victionary, "Palette 08: Iridescent", https://victionary.com/products/palette-08-iridescent (not viewed: 404).
- Selwaye Studio, Profaligner, https://worldbranddesign.com/?p=235073 (not viewed: the URL served another project).
- Dawn Creative internal rebrand (holographic foil on GF Smith Colourplan; featured in Palette 08) (not viewed).

### Kill list
- **The ribbon** (A hero; `holo-mat.png`). Its gradient runs along x only (`linearGradient … x1="0" x2="160"`), so colour ignores the surface. The "twist" is a Gaussian pinch to 4 units (`thick()` × `(1 - exp(-((x-118)/9)^2))`), which gives a candy-wrapper neck with no edge crossing. The dark mauve bands at both ends read as smudges.
- **The bubble's clip-art arcs** (`.hob-arcs`: two stroked arcs and a dot). The light-mode bubble is a hairline circle.
- **Rainbow conic hairlines on every panel** (A: 01, 02 and 03 all carry `--ab-spec-conic` borders). A gradient-bordered dark card is the dev-tool cliché, and it is aurora-noir's featured-card trick.
- **The "Foil" chip** (A, 02 Finish). It is a rainbow gradient pill, the most generic possible way to show foil.
- **The CTA's spectral top edge** (dk/holo-iridescent-interface.png). It is inset 14px each side and sits at `top: -1px`, so it reads as a misaligned sticker peeking above the button (`.ab-cta::before { left: 14px; right: 14px; top: -1px }`).
- **Deck patterns "Light threads", "Neon haze", "Foil strips", "Pearl marbling" and "Ring screen"**: brand orange and teal on black, which is psychedelic poster, not pearl.

### Gaps (ranked)
1. **The art is not iridescent. Severity: high.** In thin film and in Stripe Sessions, colour changes with angle and thickness, in bands. Ours is a flat x-mapped rainbow. It is a gradient asset, not a material.
2. **The material never reaches the surface. Severity: high.** Cru+ and Black & Bone make a large foil plane the object. Ours confines iridescence to 1px borders, one word and a chip, so it reads as an accent rather than a finish.
3. **Wrong default ground. Severity: high.** The best iridescent identities are pale (pearl stock) or strict black and white. Near-black plus pastel rainbow is the 2021 crypto-landing look, and it is exactly aurora-noir's canvas. B (pearl) is already closer to the references than A.
4. **Centred, mid-scale hero. Severity: medium.** `layout.hero: 'centered'` is the most templated composition in the app. A ~60px Syne headline at regular weight throws away Syne's character, which lives in its heavy, wide weights.
5. **Palette leakage in the deck. Severity: medium.** The rule says the spectrum is fixed, but the engine can only paint brand roles (see shared problem 4).
6. **Phone. Severity: low.** The ribbon is cropped at both edges, which is fine, but the twist neck lands on the right edge and reads as a defect.

### Distinctness
- **vs aurora-noir:** in A, the 01/02/03 sections are near-identical: near-black canvas, hairline panels, a gradient-border card, an Inter body and a pill status column. Swap the heroes and nobody could tell. Holo must move.
- **vs mesh-gradient:** once mesh adopts Stripe's striated ribbon (mesh fix 2), holo must not have a ribbon at all. The ribbon belongs to mesh.
- **Verdict:** holo moves to a light pearl ground and a foil plane, and gives up the ribbon.

### Fixes (ranked)
1. **(Top 3) Replace the ribbon with a foil plane** (`art()` in `js/aesthetics/holo-iridescent.js`). Draw one large rotated card as the hero object: `transform: perspective(900px) rotateX(16deg) rotate(-8deg); width: 52cqw; aspect-ratio: 1.6; border-radius: 2.4cqw;`. Build it from three layers:
   - a pearl base `#ece8f1`;
   - interference fringes: `repeating-radial-gradient(circle at 28% 118%, #ff9ad5 0 2.2cqw, #8fe3ff 3.4cqw, #b79cff 4.6cqw, #8bf5c4 5.8cqw, #ffe08f 7cqw, #ff9ad5 8.2cqw)` at `opacity: .55; mix-blend-mode: soft-light`;
   - an angle term: `conic-gradient(from 200deg at 72% 30%, #ff9ad5, #8fe3ff, #b79cff, #8bf5c4, #ffe08f, #ff9ad5)` at `opacity: .35; mix-blend-mode: overlay`.

   Deboss the brand initial in the card's lower right (`color: transparent; text-shadow: 0 1px 0 rgba(255,255,255,.7), 0 -1px 0 rgba(0,0,0,.18)`). Keep the bubble as a secondary object overlapping one corner of the card. Delete the ribbon generator (`centre`, `thick`, `seg`, `back`, `front`).
2. **(Top 3) Make pearl the default.** Change `mode: 'dark'` to `mode: 'light'` in `holo-iridescent.js` and raise the pearl wash from `0.15` to `0.22` (`const wash`). Change `layout.hero` from `'centered'` to `'split'`, with copy on the left and the foil plane bleeding off the right edge.
3. **(Top 3) Take the rainbow off the panels.**
   - `.ab-panel` and `.ab-list`: `border: 1px solid var(--ab-hair); background: var(--ab-card-solid);`.
   - Keep the conic hairline on `.ab-card` only, as the one featured surface.
   - Replace the "Foil" chip with a 28px foil disc that uses the fix 1 recipe (fringes plus conic), so the finish is shown as a material sample, not a gradient pill.
4. **Fix the bubble.** Delete `.hob-arcs`. Give `.hob-film` marbled fringes: `background: repeating-conic-gradient(from 10deg at 45% 28%, #ff9ad5 0 9deg, #8fe3ff 18deg, #b79cff 27deg, #8bf5c4 36deg, #ffe08f 45deg); mask: radial-gradient(circle, transparent 56%, #000 70% 95%, transparent 99%); filter: blur(1.2px) url(#hob-swirl-N); opacity: .6;`, where `#hob-swirl-N` is `feTurbulence baseFrequency=".012" numOctaves="2"` feeding `feDisplacementMap scale="14"`. Add a thinning "black spot" at the top (a radial-gradient of canvas at 0.6, r 12%), as in a real soap film.
5. **Fix the CTA edge.** `.ab-cta::before { left: 0; right: 0; top: 0; height: 1.5px; border-radius: 12px 12px 0 0; }`, clipped by `overflow: hidden` on `.ab-cta`.
6. **Type.** In `aesthetic-meta.js`, make `['Unbounded', 'Inter']` the first pairing. Headline: weight 300, `letter-spacing: -0.02em`, `type.display` 1.25. Light, wide and large is the luxury-packaging voice, where Syne Regular at 60px is neither.
7. **Deck suite.** Add the `spectrum` colorway (shared problem 4), then:
   - Lead with `['oprings', 'Interference', 'spectrum', { mode: 'lens', centres: 2, freq: 22, warp: 0.1, bands: 'three' }]`. Moiré rings are literally interference fringes.
   - Drop `neonspray`, `gradpanes` "Foil strips", `marble` and `flow`.

### Keep
- The spectral headline word that starts at the shaded accent and resolves into the ramp (`--ab-hl-fill`, with the 3.2:1 legibility loop). It is careful work.
- The rule that the spectrum is never a brand role. It is correct, and it is the right foundation for the `spectrum` colorway.

### Deck
- **01 cover:** the ribbon is shrunk beside a 70px headline. The band is blurred teal and orange smears.
- **05 interface:** the "Matte / Pearl / Foil" chips float unframed under the three boxes, and the CTA edge strip is misaligned (kill list).
- **06 material:** the ribbon and bubble again, with four tracked-caps labels. None of them shows foil as a surface.
- **07 patterns:** all six are in brand colours, so none is iridescent.
- **10 closing:** blurred strip.

---

## mesh-gradient

**Score: 4/10. Rework.** This is Stripe's costume with Stripe's own copy (`POST /v1/charges`, `cus_m9`, "Payout sent") on a mesh that the contrast loop has darkened to burnt umber. It looks like the 2019 Stripe hero seen through a dusk filter, while Stripe itself has moved on.

### References
- Stripe, https://stripe.com (viewed): the current hero is a luminous fan of fine striations (orange to magenta to violet) bleeding off the top right of a white page. The headline is in dark ink. There are no blobs.
- Stripe Sessions, https://stripe.com/sessions (viewed): a twisted 3D ribbon of fine striations on pale grey. Detail density comes from thousands of hairlines.
- Kevin Hufnagl, "How to create the Stripe gradient with WebGL", https://kevinhufnagl.com/how-to-stripe-gradient-webgl-tutorial/ (not viewed: the page showed "not available"). It documents the 2020–23 mesh: noise-displaced vertex colours, four colours, a -12° skewed band.
- Ramp, https://ramp.com (viewed): fintech marketing has moved to dense, light, product-first pages with no gradient. It shows what mesh has to justify.
- Mercury, https://mercury.com (viewed): atmosphere from a photographic landscape, with type over a calm, desaturated field.
- Figma Config, https://www.figma.com/config/ (captured, not reviewed in detail).
- Apple macOS wallpapers, https://www.apple.com/macos/ (not viewed: the page showed the Siri banner, not wallpapers).

### Kill list
- **Stripe's product copy in the hero** (A, art): "Gross volume $48,210.00", a `POST /v1/charges` JSON snippet with `"customer": "cus_m9"` and "Payout sent $1,280". For a design studio this is impersonation, not style. A client sees Stripe.
- **The muddy band** (A; C is the same in green). `tokens()` darkens the deep primary until white holds 7.4:1 (`for (… contrast(ink, zone) < 7.4 …) l -= 2`), so warm brands go to rust brown. B (dark mode) keeps the same band on a dark page.
- **Primary-tinted glow shadows on every card** (`--ab-shadow` uses `pa(.18)` and `pa(.3)`). They put an orange halo under the palette swatches, type cards, panels and list. This is palette leakage into lighting.
- **Pill badges:** the header "DESIGN LANGUAGE / MESH GRADIENT" in a rust pill, the hero chip "Gradient, with discipline", and the 28px gradient underline under every section label (the label underline material). These are template tells.
- **The states row of three orange "Save →" pills** (A, 02 Surfaces). It is identical to clay's 02.

### Gaps (ranked)
1. **The colour logic is backwards. Severity: high.** Stripe keeps the gradient luminous and saturated and puts dark ink on white next to it. Ours puts white type on a mesh, then darkens the mesh to make the type legible, which kills the luminosity that is the style.
2. **Blobs, not a mesh. Severity: high.** The references are directional: a sheared band (2020–23) and now fine striations (2024–26). Ours is six radial-gradient blobs with no direction and no fine detail.
3. **Costume content. Severity: high.** See the kill list. The "product fragment on the mesh edge" mechanism is right; the content is someone else's product.
4. **Generic lighting below the band. Severity: medium.** Stripe's card shadows are neutral navy (`rgba(50,50,93,.25)` plus `rgba(0,0,0,.3)`), not tinted with the brand.
5. **Type voice. Severity: medium.** Stripe sets large, light-weight headlines in Söhne at weight 300–400 with tight tracking. Ours is Sora 600, which is chunky and generic.
6. **Phone. Severity: low-medium.** The three hero cards stack diagonally over a 1000px rust field. The code card nearly touches the right edge.

### Distinctness
- **vs liquid-glass:** both are light mode, both have a blob-scene hero and white cards with soft shadows. They are siblings, and both must move: mesh to striations on white with ink type, liquid to hard-edged content under real glass.
- **vs aurora-noir:** both use "show a SaaS product window as the hero art". That is acceptable only if mesh's fragment stops being Stripe and aurora's stops being Linear.
- **vs holo (after the fixes):** mesh owns the ribbon, holo owns the foil plane.

### Fixes (ranked)
1. **(Top 3) Flip the colour logic** (`tokens()` in `js/aesthetics/mesh-gradient.js` and the CSS band):
   - Set the headline and nav ink to `t.ink` on the canvas, and delete the 7.4:1 darkening loop.
   - Keep the mesh lights at full brand saturation (`sat(+10)`) with a light base (`t.mix('#ffffff', p, .12)`).
   - Confine the band to the right and top: `.ab-hero::before { left: 34%; clip-path: polygon(14% 0, 100% 0, 100% 100%, 0 100%); }`, so the band's left edge is a -12° shear and the copy sits on white.
2. **(Top 3) Replace the blobs with a striated field.**
   - In `art()`, prepend an SVG `viewBox="0 0 400 240"` with 140 paths: path `i` is `y = 60 + 70*sin(x*0.012 + i*0.045) + i*0.9`, `stroke-width: .7`, `opacity: .55`.
   - Each stroke colour comes from a `linearGradient` along `i` (primary to accent to secondary to `--ab-m-mid`), on a white ground with `mix-blend-mode: multiply`.
   - Mask it with `linear-gradient(90deg, transparent, #000 30%)`.

   This is the current Stripe mechanism and gives the board the hairline detail density it lacks.
3. **(Top 3) Remove Stripe's content.** Keep three fragments straddling the band, but make them the brand's own: a "Brand refresh, 72%, review Thursday" project card with a sparkline, a type-spec tile in mono (`H1 Sora 300 / 64 / -0.03em`) in place of the API call, and an "Approved by Marigold Studio" chip in place of "Payout sent". Draw the data from `ctx` and the board's projects.
4. **Use neutral, layered shadows.** `--ab-shadow: 0 1px 1px rgba(10,37,64,.06), 0 13px 27px -5px rgba(50,50,93,.25), 0 8px 16px -8px rgba(0,0,0,.3)`, and the same family for `--ab-shadow-lift`. Remove `pa()` from both.
5. **Type voice.** In `aesthetic-meta.js` `'mesh-gradient'`, make `['Plus Jakarta Sans', 'Inter']` the first pairing, with the headline at weight 300, `letter-spacing: -0.035em` and `type.display` from `0.92` to `1.2`. A light, large headline is the Stripe signal. Sora 600 is not.
6. **Strip the pills.** Header `.ab-tag` becomes plain text with no pill. The hero kicker chip becomes a plain kicker. Remove the gradient underlines (`.ab-labelrow .ab-label:first-child::after`, line 135, and `.ab-type-role::after`, line 156) everywhere except the palette heading.
7. **Deck suite.**
   - Lead with `['flow', 'Silk', 'brand', { field: 'waves', strands: 14, gap: 1.1, bend: 1.2, weight: 0.5 }]`, whose striations match fix 2, and keep `aura` second.
   - Drop `waves` (it duplicates liquid-glass), `neonspray` and the `halftone` "Soft screen".

### Keep
- The diagonal cut of the band, as a mechanism.
- The product fragment straddling the cut, as a mechanism (with new content).
- The code tile's lifted syntax colours (`lift()`), which is careful contrast work.

### Deck
- **01 cover:** the rust band with Stripe cards. Every issue above is on the first slide a client sees.
- **05 interface:** three orange "Save" pills at 180px wide, which is the clay deck's slide 05 in different shadows.
- **06 material:** the Stripe cards again.
- **07 patterns:** "Ribbon waves" duplicates liquid-glass's "Currents", and "Soft spray" is neon.
- **10 closing:** the blurred left strip.

---

## aurora-noir

**Score: 5/10. Refine.** It is a faithful Linear screenshot with the aurora turned down to 18% and blurred 44px. The one thing the name promises is the one thing you cannot see.

### References
- Linear, https://linear.app (viewed): a black page, one very large product window and a near-absent glow. Precision comes from the window's detail, not from effects.
- The Linear Method, https://linear.app/method (viewed): a serif display headline ("Practices for building") on black, with hairline light arcs as a horizon. Light is a thin, bright line, not fog.
- Raycast, https://www.raycast.com (viewed): the hero is a bold, hard-edged red light sculpture of diagonal bars with grain. The "aurora" of this category is a saturated, sculpted object.
- Resend, https://resend.com (viewed): black, one rendered glossy cube, and a serif display headline over a neo-grotesk UI.
- Vercel, https://vercel.com (viewed; light now): a single black prism as the hero object, set in Geist.
- Warp, https://www.warp.dev (viewed): mono "[ fig. 1 — the factory ]" labels, the source of the board's "FIG 0.1" tic.
- Cursor, https://cursor.com (viewed): a product window on a painted landscape. Atmosphere comes from an image, not blur.
- Supabase, https://supabase.com (captured, not used).

### Kill list
- **The invisible aurora** (A, behind the app window). `--ab-au1/2/3` are capped at ≤0.18 alpha by the 6:1 loop and then blurred 44px (`.ab-art::before`), which leaves a brown-teal smudge at best. The loop protects text on a window that is already opaque (`--ab-solid`), so the alpha is being reduced for nothing.
- **Linear's IA copied verbatim** (art): "Inbox 3 / My issues / Projects / Cycles / Teams", the `AN-142` breadcrumb and the issue layout.
- **Deck "Filaments"** (orange and teal noodles: cover band, closing strip, 07) and **"Deep coral"** (white branching trees): neither belongs to a dev-tool aesthetic, and the cover band reads like 1970s carpet.
- **The 48px grid at 3.5% alpha.** It is invisible in A, so it is noise in the code and absent on screen.

### Gaps (ranked)
1. **There is no light object. Severity: high.** Raycast, Resend and Vercel each have one rendered, high-contrast light or object, and Linear has its hairline horizon arc. Ours has fog nobody can see.
2. **Costume. Severity: medium-high.** A product window is a strategy every SaaS page uses. Taking Linear's exact navigation turns it into imitation.
3. **Type. Severity: medium.** Inter Tight 510 is right for the category but identical to two neighbours. Linear Method and Resend show the category's top work pairing a serif display face with the neo-grotesk UI.
4. **Deck. Severity: high for the deck.** See the kill list. The suite contradicts the motto "Quiet. Exact.".
5. **Phone. Severity: low.** The window collapses well to its main pane. This is the best phone in the group.

### Distinctness
- **vs holo-iridescent:** see holo; holo moves.
- **vs mesh-gradient:** both use a product fragment as the hero, and both are acceptable after their content fixes. Aurora's differentiator must become the light object (fix 1).
- **Verdict:** aurora keeps black, hairlines and mono. Holo and mesh are the ones that move off its ground.

### Fixes (ranked)
1. **(Top 3) Build the aurora as a light, not a fog.**
   - In `css/aesthetics/aurora-noir.css`, replace `.ab-art::before` with a beam from above: `background: conic-gradient(from 180deg at 50% -18%, transparent 158deg, var(--ab-au1) 170deg, rgba(255,255,255,.22) 180deg, var(--ab-au2) 190deg, transparent 202deg); filter: blur(14px);`.
   - Add a hairline horizon arc under the window: an SVG ellipse stroke at 1px, `stroke: url(#au-arc)` going primary to white to secondary, opacity .8.
   - In `tokens()`, raise the `wash()` start values to `0.55 / 0.5 / 0.3` and skip the 6:1 loop, because the window behind the text is opaque.
   - Give the window a lit top edge: `.ana-win { box-shadow: inset 0 1px 0 rgba(255,255,255,.14), 0 -1px 0 var(--ab-au1); }`.
2. **(Top 3) Remove Linear.** In `art()`, change the nav to `['Briefs', 'Reviews', 'Assets', 'Releases']` and the teams to `['Identity', 'Web']`. Prefix the ID from the brand (`${initial}S-142` rather than the constant `AN-142`). Keep the property rows and the activity log; they are generic and well made.
3. **(Top 3) Change the type voice.** In `aesthetic-meta.js` `'aurora-noir'`, make `['Geist', 'Geist']` the first pairing, with Geist Mono for labels. Add a serif display option for the headline only (for example `['Instrument Serif', 'Geist']` as pairing 2, as in Linear Method and Resend), so the deck can carry an editorial voice.
4. **Make the grid visible or delete it.** Set `--ab-grid` to `t.alpha(t.ink, .06)` and widen the mask from `ellipse 90% 60%` to `120% 80%`. Otherwise remove `::after`.
5. **Mute the featured card's gradient border.** It is holo's trick in different colours. Change `.ab-card` to `border: 1px solid var(--ab-hair2)` and put the beam colours on the top 1px only (`background: linear-gradient(90deg, transparent, var(--ab-au1), var(--ab-au2), transparent) top / 100% 1px no-repeat`).
6. **Deck suite** (`fit.js` `'aurora-noir'`):
   - Lead with `['modulargrid', 'Hairline grid', 'mono', { cols: 12, style: 'line', merge: 0.4, gap: 0.6, empty: 0.4 }, 0.35]`.
   - Second: `['aura', 'Beam', 'brand', { layout: 'ribbon', blobs: 3, strength: 0.9, soft: 0.6, mode: 'glow', grain: 0.3 }, 0.6]`.
   - Drop `seafan`, `flow`, `stipple` and the `halftone` "Fine screen".

### Keep
- The product window. It is the densest, best-crafted component in this group: mono IDs, tabular figures, property rows and a muted activity log.
- The ink-filled main action with primary reserved for state, which is exactly Linear's logic.
- The 03 issues table with coloured left edges, mono status caps and the Σ footer.

### Deck
- **01 cover:** this is the best cover in the group (huge headline, the window). It is spoiled by the noodle band.
- **06 material:** the window at 300px with four labels, and no light, so it does not demonstrate the aurora at all.
- **07 patterns:** see the kill list.
- **10 closing:** the noodle strip.

---

## clay

**Score: 5/10. Refine.** The hero objects are the best rendering in this group. The board then drowns them in Dribbble-2021 claymorphism, with every control a puffy orange lozenge, every label in a pill and Fredoka over the top, so clay stops being an object and becomes wallpaper.

### References
- It's Nice That, "From homes to haircuts: Airbnb's new app is designed to do it all" (14 May 2025), https://www.itsnicethat.com/articles/airbnb-app-redesign-140525 (viewed behind a cookie banner): dimensional, toy-like 3D icons inside an otherwise flat, crisp UI. The objects are small and precious.
- Michael Flarup, "The Future is Colourful and Dimensional" (May 2025), https://www.flarup.email/p/the-future-is-colourful-and-dimensional (viewed): an inflated blue object with seam lines, set against restrained editorial type. Dimensional work needs a quiet typographic frame.
- Spline, https://spline.design (viewed): soft 3D forms with real light falloff, rim light and saturated colour on black.
- Microsoft Fluent 3D emoji, https://github.com/microsoft/fluentui-emoji (repo page viewed; the artwork was not in view): the reference for matte, soft-lit, tonal 3D objects at icon scale.
- Toss, https://toss.im (viewed; the hero was a photo, so the 3D icon system was not in view).
- Michal Malewicz, "Claymorphism in user interface", https://hype4.academy/articles/design/claymorphism-in-user-interface (not viewed: 404). The 2021 origin: inner plus outer shadow formula, pastel.
- Aardman / Plasticine stop-motion (not viewed): real clay is matte with low specular, fingerprints and slightly imperfect forms.

### Kill list
- **Clay on everything** (A): the segmented tray, the CTA, three orange "Save" lozenges, puffy palette pills, the teal "Soft and puffy" tag, the header badge, the section number badges, the status beans and the avatars. Eleven different element types share one material.
- **The tilted, glossy "alive" pill** (A headline; `.ab-hl { transform: rotate(-1.5deg) }` plus `--cl-gloss`). It is the single most Dribbble-template element on the board.
- **Vinyl gloss on the objects** (`clay-mat.png`): a sharp white radial highlight at 30%/15% on the tile and sphere reads as glossy plastic, not clay.
- **The deck cover's 130px art** (dk/clay-cover.png). The best asset in the group is parked on the right edge.
- **Deck patterns "Fingerprints" (speckle noise), "Wave ribbons" (four-colour zigzag) and "Pillow panes"** (a `gradpanes` duplicate).

### Gaps (ranked)
1. **When everything is clay, nothing is. Severity: high.** In Airbnb and Flarup, dimensional objects sit inside flat UI and type. Ours renders the UI itself in clay, which is the 2021 claymorphism Dribbble look the best 2025 work deliberately left behind.
2. **The material is wrong. Severity: medium-high.** Clay is matte: a broad soft top light, a deep soft underside, subsurface warmth and fine surface grain. Ours has a crisp specular, which makes it vinyl toy.
3. **The type is a category font. Severity: medium.** Fredoka 700 with Nunito Sans is a children's-app voice. The references frame dimensional objects with a grown-up neo-grotesk or an editorial serif.
4. **The deck cover. Severity: high for the deck.** See the kill list.
5. **The canvas leans 8% toward the secondary** (`canvas(b)`), which gives a mint page in A that is close to soft-form B's tinted grey. **Severity: low-medium.**

### Distinctness
- **vs soft-form:** both are light, soft and raised, with recessed inputs. Clay must give up recess (the inset tray and inset input), and soft-form takes monochrome relief.
- **vs mesh-gradient:** the 02 "Save" Rest / Hover / Pressed rows are the same orange pill row in both.
- **Verdict:** clay's distinct asset is coloured objects. Keep those and flatten everything else.

### Fixes (ranked)
1. **(Top 3) Put clay on objects only** (`css/aesthetics/clay.css`):
   - `.ab-seg`: `background: none; box-shadow: none; border: 1px solid color-mix(in srgb, var(--ab-ink) 12%, transparent);`, with the selected segment a flat ink fill.
   - `.ab-input`: flat, `border: 1px solid` the same hairline, `box-shadow: none`.
   - `.ab-row-status`: flat text in `--ab-secondary-text`, no bean.
   - `.ab-row-bar i`: flat `var(--ab-primary)`, no gloss.
   - `.ab-chip`: flat `border-radius: 16px`, or replace each swatch with one clay *blob object* per colour; that is an object, which is allowed.
   - `.ab-tag` and the section badges: plain text.

   Only the CTA, the avatars and the art keep the clay formula.
2. **(Top 3) Make the material matte.**
   - On `.cla-tile`, `.cla-sphere` and `.cla-cap`, and in the shared `--cl-gloss` token (`clay.css` line 15), replace the gloss with `radial-gradient(140% 120% at 35% 0%, rgba(255,255,255,.18), transparent 60%)`.
   - Deepen the underside to `inset 0 -14px 22px rgba(0,0,0,.18)`.
   - Add grain: a shared SVG `feTurbulence baseFrequency=".9" numOctaves="2"` at `opacity: .08; mix-blend-mode: overlay`, applied via `::after` on each object.
   - Make the forms imperfect: `.cla-tile { border-radius: 30% 34% 31% 36% / 33% 30% 36% 31% }`, and the sphere at `52% 48% 50% 50%`.
   - Tighten the contact shadows (`.cla-sh` height 7% → 3.5%, core `var(--ab-ink-sh)` at 0.6).
3. **(Top 3) Give the deck cover a hero.** `.ab[data-ae="clay"].ab-slide[data-slide="cover"] .ab-art { width: 44%; max-width: none; justify-self: end; }`, with the grid at `1.2fr 1fr` (see `css/brand-deck.css` line 82 for the shared cover grid).
4. **Retire the sticker pill.** `.ab-hl { transform: none; background: var(--ab-accent); box-shadow: 0 .14em 0 -.02em var(--ab-acc-sh); }`, flat with one soft drop, and update `highlightNote`.
5. **Grow up the type.** In `aesthetic-meta.js` `'clay'`, make `['Rubik', 'Figtree']` the first pairing, with the headline at Rubik 600 and `letter-spacing: -0.03em`. Rubik's softened corners keep it friendly without reading as a children's app.
6. **Neutral canvas.** `canvas(b) { return b.mix(b.primary, b.canvas, 0.03); }` gives a warm off-white rather than mint, which moves it off soft-form's light ground.
7. **Deck suite.**
   - Lead with `['pebbles', 'Pebbles', 'brand', { size: 1.6, gap: 0.8, erode: 0.2, mode: 'halftone', lit: 0.8 }]`. Lumps read as clay.
   - Drop `stipple` "Fingerprints", `zigzag` "Wave ribbons" and `gradpanes` "Pillow panes".

### Keep
- The hero still life (`cla-tile` with the embossed initial, the sphere, the torus and the capsule): good overlap, a tonal primary ramp, and one secondary object. It needs a matte finish and imperfection, not a new idea.
- The rule of building objects from a tonal ramp of the primary. It is the right colour logic.

### Deck
- **01 cover:** the art is 130px (kill list).
- **05 interface:** three full-width orange lozenges for Rest / Hover / Pressed, the same as mesh 05.
- **06 material:** the hero at full size. This is the best slide in the deck, and it should be the cover's composition.
- **07 patterns:** "Glazed tiles" is the only one that belongs.
- **10 closing:** the blurred strip again.
