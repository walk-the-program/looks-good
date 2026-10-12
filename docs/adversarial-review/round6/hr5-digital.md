# HR5: harsh review, round 6 (packet rev 1). Digital and screen aesthetics

Keys covered: retro-futurist, y2k-chrome, cyber-hud, pixel-arcade, pirate-broadcast, blob-tracking.

**Evidence.** Board shots are `adv/r6/r6-<key>-A/B/C/D.png`. Deck sheets are `adv/r6/sheet-deck-<key>.png`, with full slides in `adv/r6/dk/`. Zoom crops are in `adv/hr5/`: `y2k-head`, `y2k-hero`, `rf-head`, `rf-prod`, `pa-hero-zoom`, `pa-head-zoom`, `bt-zoom`, `pb-hero`, `ch-hero`. Neighbour composites are `adv/hr5/nb1–3.png`. Reference captures are in `adv/hr5/refs/`, with grids `g-*.png` and `g2a/g2b.png`. All of this lives in scratch, not in the repo.

**How references were checked.** I opened each one headless and looked at the capture. "(not viewed)" means the page failed, was blocked or redirected, or showed no artwork. "(text only)" means the page loaded but showed no relevant imagery. No consent banners were clicked, and no CAPTCHAs were attempted.

**Code.** I read the code to find fix targets and changed nothing. Cross-cutting findings are at the end.

**Scoring.** The bar is the best work in the world for each style, not "good for a generated board." Nothing here gets above 5. None of these boards would hang in a Pentagram, Collins or Order portfolio today. Two are close to a credible studio exercise: pixel-arcade and pirate-broadcast. The rest are costume over a shared dark SaaS skeleton.

### The skeleton problem (applies to all six; fix once)
Every board runs the same sequence:
- header bar
- 2-column hero
- five equal palette chips
- three type cards
- "01 Interface / 02 X" two-up
- three-row "In use" table with a progress bar and a %
- footer line

Five of the six are dark, warm-brown fields with orange, teal and yellow on top. Put them at thumbnail size and the six blur into one product.

That is not a reskin problem. The best work in each of these styles has a different composition, not just a different skin:
- A teletext page is a 40×24 grid.
- A HUD is a full-bleed viewport with data at the edges.
- A NASA spread is a white page with one red mark.
- An arcade title screen is one centred marquee.

Each of my fixes below therefore includes at least one layout move, not only CSS dressing.

---

## retro-futurist

**Score: 4/10 — Rework.** This is a nicely rendered synth faceplate wearing y2k-chrome's headline, sitting on the same brown SaaS page as cyber-hud. Nothing on it says space age except the word "orbital".

### References
1. **NASA Graphics Standards Manual** (Danne & Blackburn, 1975; reissued by Order / Standards Manual). https://standardsmanual.com/products/nasa-graphics-standards-manual. One red worm on a white field, a strict modular grid and Helvetica. Here futurism is a system, not props. Order is the studio this board would be judged in.
2. **Creative Review, "Why does NASA still have a grip on branding?"** https://www.creativereview.co.uk/nasa-worm-logo-influence-vast-space-branding/. The hero is an orange-to-black horizon gradient with a tiny rocket and a vertical caption. Enormous negative space; the object is about 2% of the frame.
3. **Typeset in the Future, *2001*.** https://typesetinthefuture.com/2014/01/31/2001-a-space-odyssey/. White, evenly lit interiors with numbered wall panels and extended grotesk labels. Retro-futurism is lit and white as often as it is dark.
4. **Typeset in the Future, *Alien*.** https://typesetinthefuture.com/2014/12/01/alien/ (hero viewed only). Nostromo hardware. Ron Cobb's semiotic icon set and monochrome CRT text are the canonical "70s console". That is one colour on black, not five brand colours.
5. **Syd Mead, Visual Futurist.** https://sydmead.com/. Airbrushed warm landscapes, huge machines and tiny people, with ultra-thin, very widely tracked caps ("V I S U A L  F U T U R I S T"). Scale contrast is the whole trick.
6. **Art of the Title, *Severance*** (Oliver Latta / Extraweg, 2022). https://www.artofthetitle.com/title/severance/. Corporate 1970s retro-futurism in clean CG: muted teal-green offices and cream terminals. The current revival is quiet, not glowing.
7. ***Space: 1999*** (Wikipedia, title card). https://en.wikipedia.org/wiki/Space:_1999. A heavy, extended logotype over a moon photograph. Type and planet are the image.
8. **HUDS+GUIS, *Andor* Season 2** (2025). https://www.hudsandguis.com/ (index thumbnail only). Analogue Imperial screens, chunky physical keys and one-colour CRT. This is the best 2025 retro screen work.
9. **Eurostile / Microgramma** (Novarese, 1952–62). Fonts In Use, https://fontsinuse.com/typefaces/41/eurostile, *(not viewed: the URL served a different typeface)*. The bold extended cut is the voice of 70s space graphics.
10. **Teenage Engineering** consoles. Listed only to mark the boundary: that territory belongs to industrial-device *(not viewed)*.

### Kill list
- **Chrome headline** (`r6-retro-futurist-A.png`, hero; `rf-head.png`). This is y2k-chrome's signature mechanism: a hard horizon gradient clipped to text (`--ab-chrome`). Seventies space type was flat white, flat red or a flat sunset; it was not chrome. Michroma ships only in weight 400, and `.ab-headline { font-weight: 800 }` (`css/aesthetics/retro-futurist.css:77`) makes the browser fake the bold. The strokes are smeared, not drawn.
- **The hero object category** (A hero; deck 06). A boxed module with a VFD "M 89.5", a dial and an LED ladder is industrial-device's hero (a VFD, a knob and keys; see `nb1.png`) and industrial-hazard's panel-with-lamps. The aesthetic file's own rule even bans "a planet, a landscape", which bans the actual style.
- **The starfield** (`::before`, 14 radial dots, `retro-futurist.css:21–37`). Fourteen scattered 1px dots on brown are wallpaper, not space.
- **The glowing orange pill CTA with "»"** (A2, "Save direction"). This is a SaaS gradient pill with a drop glow. Seventies hardware had square lit keys.
- **The gloss balls** for Idle/Armed/Engaged (A2 console). They are candy spheres, which is the y2k "gel" language.
- **The deck patterns slide.** Orbit lines (a fingerprint swirl), Sunburst, Warp grid checker and Scope rings are op-art and psychedelia from groovy-70s and acid-graphics, in brand colours. The cover band and closing strip use the same swirl.
- **The "Telemetry" table with segmented bars and a %** (A2 "03 / In use"). It is near pixel-identical to cyber-hud's "03 / In use".
- **Palette leakage.** Orange, teal and yellow are all lit at once (needle, readout, lamps, CTA). The references run one hue per screen: Nostromo green, NASA red, Severance teal.

### Gaps (ranked)
1. **Signature mechanism · high.** The best work does space-age systems: a horizon, orbital geometry, extended type, a lot of white or black, and one red. Ours does a gadget.
2. **Type voice · high.** The best work uses bold-extended grotesk (Eurostile Bold Extended), tight, often one line, very large, or ultra-wide thin caps à la Mead. Ours is regular-weight Michroma, faux-bolded, over five lines at ~60px, with chrome fill.
3. **Scale contrast · high.** The best work puts a tiny object in a vast field, or a planet-sized arc. Ours has every element at mid scale in a 1.45:1 split.
4. **Colour logic · med-high.** The best work fixes the palette (white, black, NASA red, or one phosphor). Ours spreads every client colour across lamps.
5. **Distinctness · high** (see below).
6. **Light mode · med.** B is a beige SaaS page with a dark widget. *2001* shows light mode should be the hero mode: white, lit, numbered.
7. **Phone · low.** D stacks cleanly but is a squashed desktop: the module simply drops under the headline.

### Distinctness
- **industrial-device:** sibling. Both have a hardware module with a VFD, a dial and controls, mono labels and numbered sections.
- **cyber-hud:** sibling. Same warm-brown dark field, orange/teal/yellow, mono uppercase labels, telemetry rows and segmented bars.
- **y2k-chrome** borrows the headline treatment.

**Verdict:** retro-futurist must move, because it is the one without a defensible territory. Give it *space-age graphic systems* (NASA manual, *2001*, Mead, *Space: 1999*). Leave consoles to industrial-device and industrial-hazard.

### Fixes (ranked)
1. **★ Replace the hero art with an orbital horizon plate** (`art()` in `js/aesthetics/retro-futurist.js`).
   - Use `viewBox 0 0 160 100`, full-bleed in the hero. Use `layout.hero: 'centered'` with blob-tracking's full-bleed art rule (`css/aesthetics/blob-tracking.css:98`, negative `--ab-pad` margins), or `'scene'` as pixel-arcade does. There is no `'band'` hero type.
   - Draw a planet limb as an arc: a circle `cx=80 cy=250 r=175`, filled with a vertical gradient from the canvas to `mix(primary, canvas, .35)`.
   - Add an atmosphere rim: the same circle, stroke `primary` at 0.8 width and 0.9 opacity, plus a 6-unit blurred copy at 0.35.
   - Add 3 orbit ellipses (rx 70/95/120, ry 9/13/17, rotate −8°, stroke `ink` at 0.35, width 0.25, `stroke-dasharray` "0.6 1.4" on the outer one).
   - Add one tiny spacecraft: a 3×1.2-unit white polygon on the middle orbit, with a 0.2-unit trajectory tick and a 5px mono label `MRG-01 / T+00:41:07`.
   - Make the sky black-to-canvas.
   - Move the console to deck slide 06 as a secondary material, or delete it.
2. **★ Change the type voice.**
   - In `js/aesthetic-meta.js` `'retro-futurist'`, make the first pairing `['Syncopate', 'IBM Plex Sans']`. Add Syncopate (Google, weights 400;700, `cls: 'wide'`) to `FONTS` in `js/data.js`. Keep Michroma second.
   - In `retro-futurist.css` `.ab-headline`:
     - Remove the `--ab-chrome` background clip and set `color: var(--ab-ink)`.
     - Set `font-weight: 700` with `font-synthesis: none`.
     - Set `letter-spacing: 0.04em; line-height: .92`, size `clamp(48px, 9cqw, 128px)`, and `text-wrap: balance`.
   - Set the `.ab-kicker` and `.ab-tag` in Michroma at 9px with `letter-spacing: .5em` (Mead caps).
   - The highlight word becomes flat `primary` (NASA red logic), with no glow.
3. **★ Make it a system, not a palette spray.**
   - In `tokens()`, add `--rf-signal` = primary. It should be the only chromatic colour on the page: CTA, highlight word, one orbit, the craft.
   - Secondary and accent drop to `ink` alpha variants on boards (keep the swatches).
   - Make light the recommended mode (`mode: 'light'`): a white field `mix('#fff', canvas, .15)`, black type and red signal, as in *2001* and NASA. Keep the dark (deep-space) mode as B.
4. **Kill the SaaS chrome.**
   - Set `.ab-card`/`.ab-panel` radius from 18px to 2px (line 115).
   - Replace the bezel gradient with a flat panel plus a 1px `ink` 18% hairline.
   - Make the CTA (line 147) a square lit key: `border-radius: 2px`, flat primary, `box-shadow: inset 0 -3px 0 rgba(0,0,0,.25)`, and no outer glow.
   - Replace the candy lamps with flat 10px squares (on = primary, off = ink 15%).
5. **Add NASA-manual structure.**
   - Number each section `1.1`, `1.2`, ….
   - Add a 12-col hairline grid overlay at 4% on the hero.
   - Add a vertical rotated caption at the hero right edge: `writing-mode: vertical-rl`, 9px mono, "A NEW KIND OF SPACE". This mirrors the CR/NASA hero.
6. **Patterns** (`js/patterns/fit.js` `'retro-futurist'`). Suites never repeat a family, and the first entry drives the cover band.
   - Make the lead `gradpanes` `{rows:1, cols:1, steps:7}` in the `night` colourway (a stepped horizon sunset), replacing `flow` (Orbit lines).
   - Retune the existing `oprings` (Scope rings) to `{mode:'rings', centres:1, freq:6, warp:0, bands:'two'}` in `mono` (an orbital diagram).
   - Replace `burst` (Sunburst) with `modulargrid` `{style:'line', cols:12}` in `mono` (the standards grid).
   - Replace `warpcheck` (Warp grid) with `glyphgrid` `{glyphs:'crosses', cell:5, bands:1}` in `mono` (registration marks).
   - Use `tone: 0.6` across the suite.
7. **Remove the starfield** `::before`, or reduce it to 3 dots in the hero band only.

### Keep
- The dial drawing itself: 31 ticks, a value arc and a needle with a soft echo. It is genuinely well made. Move it to slide 06 as one material.
- The "ALL SYSTEMS NOMINAL." motto and the vocabulary (Idle / Armed / Engaged).
- The green palette (C), which almost lands as Nostromo phosphor by accident.

### Deck
- **01 cover:** the swirl band is psychedelia; replace it with the horizon plate (fix 1). The tiny console thumbnail top right is a sticker, not a cover image.
- **02 principles:** "Panels are bezels / Glow means active" describes industrial-device. Rewrite it to "One signal colour / Horizon and orbit / Extended type".
- **06 material:** the same console as the hero, so the deck has no second idea.
- **07 patterns:** the whole suite is off-key (fix 6).
- **08 in product:** Michroma renders "%" as "°/o" (`rf-prod.png`: "72°/o"). Set the `%` and figures in the mono (`.ab-deck-rpct { font-family: var(--ab-font-mono) }`). The shared product template (`js/brand-deck.js`, `key: 'product'`) drops every bezel and lamp, so it is a generic dark app.
- **09 do/don't:** a dead text slide. Add one visual pair, e.g. horizon vs. glow-everything.

---

## y2k-chrome

**Score: 5/10 — Refine (heavy).** The chrome type now has real volume. Everything around it is still a dark SaaS template with pills, and the sculpture is a soft bag with tape on it.

### References
1. **The Designers Republic.** https://www.thedesignersrepublic.com/. A flat acid-yellow full-screen field, a bold grotesk nav list and ™ on every noun. Acid is a field, not a sticker.
2. **Fonts In Use, Amalgamation (tDR).** https://fontsinuse.com/typefaces/246221/amalgamation. A unicase techno face and a "work buy consume die" katakana roundel. Product-label micro-type is the ornament.
3. **Creative Review, "An oral history of Wipeout."** https://www.creativereview.co.uk/an-oral-history-of-wipeout/. Feisar livery: flat colour blocks, numerals and logos on hard-surface hardware.
4. **AIGA Eye on Design, "Liquid Metal is everywhere."** https://eyeondesign.aiga.org/the-futuristic-gleam-of-liquid-metal-is-everywhere-right-now-heres-why/ (header image). A Klein-blue field, a black eye target and crop marks. The chrome object sits inside a flat, hard graphic.
5. **iMac G3** (Wikipedia). https://en.wikipedia.org/wiki/IMac_G3. Bondi-blue translucent shell with the internals visible.
6. **Aqua UI** (Wikipedia). https://en.wikipedia.org/wiki/Aqua_(user_interface). Gel buttons, pinstripes and brushed metal, with hard specular tops and caustic bottoms.
7. **Hajime Sorayama** (Wikipedia). https://en.wikipedia.org/wiki/Hajime_Sorayama (text only). Airbrushed chrome with softbox-window speculars and edge rims.
8. **CARI, Y2K aesthetic.** https://cari.institute/aesthetics/y2k *(not viewed: 404)*.

### Kill list
- **Speculars drawn as outlined trapezoids** with a white 1px stroke and a dark mullion (`y2k-hero.png`; `art()`, the two `<g transform="translate(33 42) rotate(-34)">` groups). They read as tape or stickers stuck on the blob, which the deck's own "don't" bans: "Scatter sparkles or stickers".
- **The detached white ball** (`<circle cx="22" cy="28" r="6.5">`). After thresholding it is a flat cotton ball, not chrome.
- **The flat orange radial wash** over the lower-left lobe (`${n}p`, primary at opacity 1 → .5). This is palette leakage: chrome reflects an environment, it is not tinted with the client hex. It reads as clay or gradient-mesh.
- **Pills everywhere.** Kicker, chips, Fits badges, segmented control, CTA, rows (`border-radius: 999px` × 9 rules) and 24–26px cards. This is the generic "glassy SaaS" look.
- **Footer influences "Y2K web / Chrome type / Acid graphics".** "Acid graphics" is another aesthetic's name in the same set.
- **Deck cover band "Chrome strips"** (stepped brand-colour gradient bars, `gradpanes`). Still 70s stripes in orange and teal.
- **"Chrome target" and "Speed chevrons" in the brand colourway.** They are op-art in orange and teal, and acid-graphics already owns that.

### Gaps (ranked)
1. **Hero object · high.** The refs reflect an environment, rim every edge and dominate or cut into the type. Ours is a mid-scale bag in its own column with tape speculars.
2. **The tDR/Wipeout half is still a garnish · high.** The refs use flat acid fields, product codes, icon grids and katakana. Ours has one kicker pill ("LIQUID METAL / MRG-01™") and one plate.
3. **Layout · med-high.** The refs run asymmetric product-sheet layouts with tiny type and big flat blocks. Ours is the shared skeleton.
4. **Type distinctness · med.** It recommends Unbounded and Syne, which are holo-iridescent's first two heading picks (`nb1.png`).
5. **Phone · low.** D holds; the sculpture stays legible. It is still a squash.

### Distinctness
- **holo-iridescent:** sibling. Dark field, one glossy 3D hero object to the right, and the same Unbounded/Syne heading picks.
- **liquid-glass:** cousin. Glossy pills and a soft object.

**Verdict:** y2k must move toward tDR flat graphics plus chrome. Chrome alone is not enough to separate it from holo.

### Fixes (ranked)
1. **★ Re-render the speculars and drop the leak** (`art()`).
   - Remove `stroke="#fff"` and the mullion `<rect>` from both window groups.
   - Fill the main window with `url(#${n}w)` at opacity .85 and apply a `feGaussianBlur stdDeviation=".35"` filter so it reads as reflected light, not a label.
   - Delete `<circle cx="22" cy="28" r="6.5">` from `blobs`, or move it to touch the main lobe (`cx="28" cy="34"`) so it merges.
   - Drop the `${n}p` primary radial's stop-opacity from 1/.5 to .45/.15.
   - Add a cool environment band: a second horizontal reflection at y≈30 in `mix(secondary,'#cfe3ff',.6)`, at opacity .5 through the same displacement.
2. **★ Make the acid layer a field, not a word.**
   - Behind the hero (`.ab-hero`), add a hard-edged accent block: `position:absolute; inset: 8% -4% 18% 52%; background: var(--ab-accent); z-index:0`.
   - Let the sculpture sit on it and overlap its edge (`.ab-art { margin-left:-12% }`), as in the EOD Klein-blue eye.
   - On the block, print 8px Michroma micro-type in `onAccent` (`MRG-01™ / LIQUID METAL / 液体金属 / NOT FOR RESALE`), rotated 90° along its right edge.
3. **★ De-pill the system.**
   - In `css/aesthetics/y2k-chrome.css`, take cards and panels from 24/22px to 6px.
   - Rows go to radius 4 with a 1px rim.
   - Fits badges go to radius 2.
   - Keep 999px only on the CTA and the switch (the gel objects).
   - The kicker becomes a flat ink label with a "™" instead of a rim pill.
4. **Separate the type from holo.**
   - In `js/aesthetic-meta.js` `'y2k-chrome'`, lead with `['Dela Gothic One','Sora']`. Move Unbounded to the second pick.
   - Labels stay Michroma.
   - Change `influences` to `'tDR / Wipeout / Aqua / Chrome type'`.
5. **Patterns** (`fit.js` `'y2k-chrome'`).
   - Set `oprings` (Chrome target) and `chevron` to `mono`/`night` colourways.
   - Replace `aura` (Lens flare, which renders as mush) with `modulargrid` `{style:'line', cols:8, merge:0.3, empty:0.5}` in `mono` (a tDR spec sheet). `glyphgrid` is already in the suite, so retune it to `{glyphs:'geometric', cell:5, bands:2}` in `duotone` (the icon sheet).
   - For the cover band, use `gradpanes` with `rows: 2, cols: 1` so it reads as two polished bars, not a stripe chart.
6. **Translucent material** on deck 06 item "04 / Translucent gel": render an actual swatch. It is listed but never drawn.

### Keep
- **The bevelled chrome headline** (`y2k-head.png`). The `feSpecularLighting` bevel plus the off-centre horizon finally reads as volume, which is the best typographic rendering in this set.
- The flat "alive™" plate.
- The Gel / Polished / Liquid discs.
- The chrome switch knob.
- The C palette.

### Deck
- **01 cover:** stepped strips band (fix 5). The sculpture is thumbnail-sized; at cover scale it should overlap the headline.
- **06 material:** the taped blob at full size. This is the slide that exposes fix 1 most.
- **07 patterns:** four of six are op-art or mush.
- **09 do/don't:** "Scatter sparkles or stickers" sits under a hero with a sparkle and two stickers. The rules contradict the art.

---

## cyber-hud

**Score: 4/10 — Rework.** Orbitron, a wireframe globe on a Tron floor grid, and a targeting reticle make the stock-asset HUD. It sits on retro-futurist's brown page, so the style's whole point (fixed signal colour, edge-anchored data) is missing.

### References
1. **cyberpunk.net** (CD Projekt Red, 2020–26). https://www.cyberpunk.net/ (partly behind the consent modal). A fixed acid-yellow field with red and cyan signal, a slanted glitched logotype, heavy condensed caps and `/// NEWS.MODULE_HIGHLIGHT` bracket labels. The palette is the brand's own and never the client's.
2. **Arknights** (Hypergryph). https://arknights.global/ (loading screen). A pale field, an isometric cube landscape, a 1px bracketed progress bar and microscopic type. HUD as restraint, the current high bar.
3. **HUDS+GUIS** index. https://www.hudsandguis.com/. Thumbnails of *Andor* S2, *Jurassic World Rebirth* and *The Silent Sea*: dense multi-panel screen graphics where data hugs edges and the centre stays open.
4. **Sci-Fi Interfaces.** https://scifiinterfaces.com/ (catalogue). The cross-film HUD canon, used as a checklist of mechanisms: reticles, telemetry, overlays.
5. **GMUNK, *Oblivion* GFX.** https://gmunk.com/OBLIVION-GFX (text only; video blocked). Mechanism known from the film: hairline white on black, huge negative space and a light-table feel.
6. **Territory Studio.** https://territorystudio.com/ *(not viewed: menu only)*. *The Martian* and *Guardians* screen graphics.
7. **Perception, *Iron Man 2*.** https://www.experienceperception.com/work/iron-man-2/ *(not viewed: page failed)*.
8. **Ash Thorp.** https://ashthorp.com/ *(not viewed: redirected to an unrelated site)*.

### Kill list
- **The wireframe globe plus perspective floor grid** (A hero; `ch-hero.png`; `art()` `floor` and `sphere`). The Tron or synthwave floor is the single most stock sci-fi image there is, and it says retrowave, not HUD.
- **Orbitron** as the default heading (A, "GOOD DESIGN SHOULD FEEL"). It is the default "sci-fi font," a font from the category, not a voice.
- **The warm-brown canvas.** `canvas()` mixes 3.5% primary into L5. With an orange client that gives the same brown as retro-futurist, and on screen the two boards are hard to tell apart.
- **Light mode** (B). Peach panels, an orange outline and a beige grid. It collapses into a soft SaaS form with chamfers.
- **"ALIVE" chromatic split** in yellow with orange and teal ghosts (A hero). At 2px it reads as a misregistered print, not a signal glitch.
- **Type cards rendered as three chamfered boxes** of uppercase font names (A1/A2). This is the template block wearing a chamfer.
- **The Idle/Target/Locked save trio with corner brackets** (A2 "02 / Systems"). It is the same demo as blob-tracking's Searching/Locked/Lost with brackets.
- **Deck patterns.** Data glitch, Slipped feed, Corrupt feed and One-bit scan are four variants of glitch. "HUD grid" is a Memphis-like icon scatter.

### Gaps (ranked)
1. **Signature composition · high.** The refs make the frame the HUD: data anchored to the four edges, the centre clear, and one reticle on a real subject. Ours is a 2-column page with a HUD illustration in the right column.
2. **Colour logic · high.** The refs use a fixed signal palette (yellow/red/cyan, or cyan on black). Ours uses client orange as "neon", which reads as warm and analogue.
3. **Type voice · high.** The refs use heavy condensed or squared faces with micro labels and bracketed slashes. Ours is Orbitron at 700 with Rajdhani body.
4. **Detail density · med.** The refs carry dozens of micro readouts, rulers and tick scales. Ours has four corner readouts in the hero and nothing elsewhere.
5. **Distinctness · high** (below).

### Distinctness
- **retro-futurist:** sibling, with the same brown, orange, teal, segmented bars and mono caps.
- **blob-tracking:** sibling in mechanism: corner brackets, LOCK state, ID tags.

**Verdict:** cyber-hud moves to a fixed signal palette and a full-frame HUD composition. Brackets and locks stay with blob-tracking (the CV overlay); cyber-hud gets edge rulers, angled data slabs and the slashed label system.

### Fixes (ranked)
1. **★ Fixed signal colour with the client as one channel.**
   - In `tokens()`, set `--ab-neon` to `#00F0FF` (cyan) and `--ab-neon2` to `#FF2A6D`. Keep the client `primary` only for the main CTA fill and the selected tab.
   - `canvas()` returns `#05070A` (cool), not a primary mix. Dark mode should be blue-black, never brown.
   - Light mode: `#E9ECEF` with `#0B0D10` ink, and neon lines darkened to `#007C86`.
2. **★ Replace the globe and floor with a full-bleed viewport frame** (`art()` and `layout.hero`).
   - Use `layout.hero: 'centered'` with the full-bleed art rule from `blob-tracking.css:98`. The art is a 21:9 dark viewport.
   - Edge rulers: top and bottom 1px tick rails with a major tick every 10%, labelled `000 / 090 / 180 / 270` in 8px mono.
   - Left vertical altitude ladder. Right stacked data slabs (3 parallelogram tags, `clip-path: polygon(8px 0,100% 0,calc(100% - 8px) 100%,0 100%)`).
   - Centre: one thin reticle (no sphere, no floor) over the brand mark drawn as a 1px outline at 30% scale.
   - The headline moves inside the band, bottom-left, as a slab.
3. **★ Change the type voice.**
   - Add `Saira Condensed` (700/800) and `Tektur` (Google; 400–900; `cls:'techno'`) to `FONTS`.
   - Meta pairing 1 becomes `['Tektur','Saira Condensed']`, pairing 2 `['Chakra Petch','IBM Plex Sans']`. Drop Orbitron to the last pick.
   - Labels become `/// SECTION.NAME_01` style: prefix `.ab-label::before { content: "/// " }`, underscore separators, 9px, `letter-spacing:.14em`.
4. **Retire the bracket-lock state demo.** Set `labels.states` to `['Standby','Armed','Live']`. "Live" is a filled slab with a moving 1px scan line (static in shots), "Armed" a 1px outline with a diagonal hatch, and "Standby" a dashed outline. No corner brackets.
5. **Kill the 2px RGB split.** `.ab-hl` should be a solid neon2 slab behind the word (`background: var(--ab-neon2); color:#05070A; clip-path: polygon(0 0,100% 0,calc(100% - .3em) 100%,0 100%)`), as in the cyberpunk.net hero tags.
6. **Detail density.** Add a 6px tick ruler to every panel's top edge (a repeating-linear-gradient of 1px every 8px, 30% neon), a 4-digit panel ID at its top-right (`PNL-0412`), and a 1px diagonal hatch fill in the panel's cut corner.
7. **Patterns** (`fit.js` `'cyber-hud'`).
   - Keep `signal` and `typeterrain` (binary).
   - Retune the existing `modulargrid` (HUD grid) to `{style:'line', cols:24, merge:0.1, gap:0.4, empty:0.6}` (a ruler grid). Make it the lead, because a glitch band is a noise band on the cover.
   - Replace `slipgrid`, `satellite` and `onebit` (three glitch clones) with:
     - `chevron` `{bands:6, slope:45, colors:'two'}` (angled data slabs)
     - `glyphgrid` `{glyphs:'crosses', cell:4, bands:2}` (reticle field)
     - `gradpanes` `{rows:8, cols:1, gap:0.8, steps:0}` in `night` (scan bands)
   - Run the suite at tone 0.6–0.8.

### Keep
- The chamfered panel with a 1px neon edge (the material is right).
- The segmented progress bar.
- The palette swatches with their chamfer and "01 //" numbering.
- The green palette state (C). Monochrome green on black is the closest the board gets to a real HUD.

### Deck
- **01 cover:** the HUD globe is a 60px thumbnail; the glitch band is the only energy. Use the viewport band full-width (fix 2).
- **06 material:** the globe at full size, which is the cliché at its largest.
- **07 patterns:** glitch ×4 (fix 7).
- **10 closing:** a glitch strip. Fine once the cover changes.

---

## pixel-arcade

**Score: 5/10 — Refine.** It is the most committed board in this group, a real title screen with a real grid system. It still uses the Mario kit (coins, "?" blocks, a block mascot) and smears its own pixels with a scanline overlay at the wrong pitch.

### References
1. **Balatro** (LocalThunk, 2024). https://www.playbalatro.com/. Chunky pixel UI under a CRT shader, a saturated red/teal felt and a distorted, flaming logotype. Proof that pixel UI can be maximal and contemporary.
2. **Departure Mono** (Helena Zhang, 2024). https://departuremono.com/. A pixel font used as a technical document on grey, with QR textures and redaction bars. Pixel without game clichés is the 2024 frontier.
3. **eBoy.** https://hello.eboy.com/. Isometric pixel cities with insane detail density, and a stepped pixel logotype. Every pixel placed; no smooth anything.
4. **Susan Kare.** https://kare.com/. One-bit 32×32 icons. Pixel as clarity, maximum meaning per pixel.
5. **PICO-8** (Lexaloffle). https://www.lexaloffle.com/pico-8.php. A fixed 16-colour palette and the cartridge as a unit. The palette is the console's, never the user's.
6. **Sea of Stars** (Sabotage, 2023). https://seaofstarsgame.co/. High-end painterly pixel key art with a carved serif logotype. Pixel art at portfolio level.
7. **Animal Well** (Billy Basso, 2024). https://www.animalwell.net/. A glowing outlined condensed logotype on black and a dark, luminous pixel scene. Atmosphere over mascots.
8. **Hyper Light Drifter** (Heart Machine). https://www.heartmachine.com/hyper-light-drifter. A magenta/teal fixed palette, huge silhouetted pixel figures and an angular pixel logotype.

### Kill list
- **Scanline overlay** (`.ab-art::after`, `repeating-linear-gradient(0deg, rgba(0,0,0,.16) 0 2px, transparent 2px 4px)`, `css/aesthetics/pixel-arcade.css:48–50`). It is a 4-screen-px pitch over sprites whose pixel is ~4.7 screen px, so stripes beat inside every coin and block (`pa-hero-zoom.png`). These are mixels, the cardinal pixel-art sin.
- **The "?"-block-with-M and the spinning coins** (A hero). That is Super Mario costume. Refs 1, 3, 7 and 8 own their worlds; this borrows Nintendo's.
- **The brand sprite as a red block with two feet and a black "M"** (A hero). It is a box, not a character: no face, no silhouette, no animation frame.
- **The deck "Pixel quilt", "Kaleidoscope", "Pixel totem" and "Pixel bloom" patterns** (deck 07, cover band and closing strip). Folk quilts and Mexican tile, not games. The cover band is a quilt.
- **Silkscreen tracked at ~0.2em** for the hero headline. It is the most default pixel display face, spaced out like a web font.
- **The product slide** (deck 08). Round coloured dots, smooth panels and a generic app. Nothing is on the grid.

### Gaps (ranked)
1. **Owned world · high.** The refs invent a palette, a protagonist and a place. Ours is Mario's coins and blocks with a box mascot.
2. **Pixel integrity · high.** The refs lock one pixel scale per scene, with no overlays at another pitch. Ours mixes a 2px scanline over a ~4.7px pixel; the dialog box text shadow is 4px, the hearts are another scale and the score is a third.
3. **Detail density · med.** eBoy and Sea of Stars place thousands of deliberate pixels. Ours has a sparse landscape: two hill bands, one tree, sky dither.
4. **Palette logic · med.** PICO-8 and HLD use fixed palettes. Ours lets the client tint everything, which works for green (C is a Game Boy accident and the best state) but fails for warm (orange sky bands look muddy).
5. **Type voice · med.** The refs use custom pixel logotypes. Ours uses a stock face with no logotype treatment.

### Distinctness
- **ascii-art:** cousin. Dark, mono, character-grid hero, VT323.
- **neo-brutal-pop:** cousin. Hard offset borders.

**Verdict:** distinct. The scene hero and the stepped borders carry it, and nothing needs to move for distinctness. It needs to move for quality.

### Fixes (ranked)
1. **★ Kill the mixels.** Delete `.ab-art::after` (`pixel-arcade.css:48–51`). If a CRT feel is wanted, do it inside the SVG at scene units: a `<pattern width="1" height="2">` with `<rect height="1" fill="#000" opacity=".12"/>`, applied over the scene so it locks to the sprite grid. Do the same on deck 06.
2. **★ Own the world.**
   - In `art()` (`js/aesthetics/pixel-arcade.js`), replace the "?" blocks and coins with brand collectibles: the initial as a 7×7 gem (diamond silhouette, 2-tone with a 1px highlight), and three "spark" pickups (a 5-px plus sign in accent).
   - Replace the box mascot with a 12×16 character: head 6×6 with 2 eye pixels, body in primary, 2-frame legs, and a 1px darker outline (`pDeep`), not black.
   - The block-M becomes a sign the character stands under.
3. **★ Lock one pixel scale.**
   - Render hearts, score and the dialog-box shadow from the same 4px unit as the scene. Today the scene unit is `viewBox 0 0 168 80` at `slice`, so the screen pixel varies with width.
   - Set `preserveAspectRatio="xMidYMid meet"` and size `.ab-art` to an integer multiple: `width: calc(168px * var(--pxs))` with `--pxs: 4` (desktop) and `2` (phone).
4. **Logotype, not a font.** Set the headline in Silkscreen at `letter-spacing: 0` (it is drawn with spacing) and give it a 2-step pixel extrusion: `text-shadow: 4px 0 0 var(--ab-p-deep), 4px 4px 0 var(--ab-p-deep), 8px 4px 0 #000`. Add `Jersey 10` (Google, 2024) to `FONTS` as an alternative heading for a marquee feel.
5. **Patterns** (`fit.js` `'pixel-arcade'`).
   - Move the existing `terrain` to the lead (it drives the cover band) and retune it to `{style:'hills', levels:4, pix:1, dither:0.5}` (parallax hills).
   - Replace `pixelquilt`, `kaleidopix` and `totem` with:
     - `pixelgrid` `{mode:'blocks', cell:2, zones:3}` (tile map)
     - `glyphgrid` `{glyphs:'blocks', cell:4, bands:2}` in `night` (an item sheet)
     - `parcels` `{cell:2, size:1, every:6, labels:false}` (a level map)
6. **Detail density.** Add a parallax back layer (distant city or mountains in `mix(secondary, canvas, .7)`), 3 cloud sprites, a 1-row ground grass tuft pattern and a "1UP" counter. Target ~3× the current rect count.
7. **Product slide.** In `js/brand-deck.js` `'product'`, the `.ab-deck-dot` circles must become squares for pixel-arcade (`[data-ae="pixel-arcade"] .ab-deck-dot { border-radius:0 }`). Better, render the board's own `.ab-row` markup (cross-cutting fix A).

### Keep
- The stepped 4px border system and the LV.01 rows with letter badges.
- The pixel buttons with a 4px underside that vanishes on press.
- The dialog-box headline on the scene, and the phone recomposition (D separates scene and dialog, the only phone layout in this group that recomposes rather than squashes).
- The C palette (Game Boy).

### Deck
- **01/10:** quilt band and strip (fix 5).
- **06 material:** the same scene, with the mixel scanlines at full size.
- **07 patterns:** four of six are folk textiles.
- **08 product:** off-grid (fix 7).

---

## pirate-broadcast

**Score: 5/10 — Refine.** The best idea in the group: page numbers, the Fastext footer and a diagnostic frame. It is set in Bebas Neue and the client's colours, and teletext is neither.

### References
1. **MUTA / International Teletext Art Festival.** https://www.teletextart.com/. A black field, the 8 teletext colours only, double-height mono headings and mosaic block graphics. The colour set is fixed by the hardware.
2. **Ceefax** (Wikipedia). https://en.wikipedia.org/wiki/Ceefax. A blue mosaic "CEEFAX" logotype in yellow sixels, with page numbers as navigation.
3. **Hyperallergic, "The Retro Aesthetics of Teletext Art."** https://hyperallergic.com/the-retro-aesthetics-of-teletext-art/. Double-height mosaic "TELETEX" lettering in blue and yellow, with a mosaic eye. The headline is built from blocks.
4. **Bedstead** (bjh21). https://bjh21.me.uk/bedstead/. A faithful outline font of the SAA5050 Mode 7 character generator, green on black. This is the actual teletext typographic voice.
5. **Test Card F** (Wikipedia). https://en.wikipedia.org/wiki/Test_Card_F. Castellations, a greyscale step, a frequency grating and a central picture. Every element has a diagnostic job.
6. **Max Headroom signal hijacking** (Wikipedia). https://en.wikipedia.org/wiki/Max_Headroom_signal_hijacking. A low-res frame grab: a figure in a mask before a rippling metal sheet. Intrusion is image, not decoration.
7. **NTS Radio.** https://www.nts.live/ (behind the consent modal). Pirate-radio lineage: channel numbers 1/2, a live ticker bar, and black chrome with cut-up imagery.
8. **Local 58** (Kris Straub). https://www.youtube.com/@LOCAL58TV *(not viewed)*. Analog-horror test cards and plain-mono intrusion messages.

### Kill list
- **Bebas Neue headline in client orange** (A hero). Bebas is the generic poster condensed. Teletext headlines are double-height Mode 7 characters or sixel-mosaic letters (refs 2–4). It is also the same move as industrial-hazard's Barlow Condensed caps (`nb3.png`).
- **Client colours inside the SMPTE bars** (`art()`, `bars = [S.fg, '#FFE600', S.sec, '#00E676', '#FF2EE0', S.acc, S.pri]`). With the green palette (C) three bars go sage and mint and the test card stops being a test card (`pirate-broadcast-BC.png`). Test patterns are fixed signals.
- **The teletext header in brand teal** (panel title rows) and the header strip in brand colours. Teletext has 8 fixed colours.
- **Rounded TV bezel** (`.ab-art { border-radius: 5% / 6.6% }` plus a grey surround). It frames the test card as an icon of a TV. The refs fill the screen; you are watching the broadcast, not a TV.
- **Deck patterns "Static" (a paisley/leaf mosaic), "Intercept" (marbled swirl) and "Roll bars" (orange diagonal dashes).** Off-key psychedelia.
- **The "intrusion"** is a 4-glyph noise patch in the hero and a yellow hatched SAVE. Intrusion should break the grid; here it is polite.

### Gaps (ranked)
1. **Character grid · high.** The refs are literally 40×24 cells with double-height rows. Ours is the shared skeleton with teletext labels ("P101").
2. **Type voice · high.** The refs use Mode 7 or mosaic letters. Ours uses Bebas Neue plus IBM Plex Mono.
3. **Colour logic · high.** The refs fix the palette at R, G, Y, B, M, C, W, K. Ours uses the client palette everywhere except the footer strip, which is the only correct element.
4. **Intrusion as image · med.** The refs show a frame grab or a masked figure tearing the signal. Ours has none.
5. **Phone · low.** D holds well: the test card stays readable and the P-numbers survive.

### Distinctness
- **industrial-hazard:** sibling in type. Dark, condensed caps headline and numbered mono labels.
- **ascii-art:** cousin. Dark, VT323, character feel.

**Verdict:** pirate must move to Mode 7 type and a true grid. That alone separates it from both.

### Fixes (ranked)
1. **★ Teletext type.**
   - Self-host Bedstead (public domain): add `@font-face { font-family:'Bedstead'; src:url(../fonts/bedstead.woff2) }` and a `FONTS` entry (`cls:'pixel'`).
   - Make `['Bedstead','IBM Plex Mono']` pairing 1 in meta. Move Bebas to the last pick.
   - Headline double-height: `.ab-headline { font-family: Bedstead; transform: scaleY(2); transform-origin: top; line-height: .5; letter-spacing: 0 }`, with the wrapper given `padding-bottom` equal to the line box.
   - Fallback if self-hosting is refused: Doto (already in FONTS) at weight 900, which is dot-matrix rather than Mode 7.
2. **★ Fixed broadcast palette.**
   - In `pbScreen()`, add `tt = { r:'#FF0000', g:'#00FF00', y:'#FFFF00', b:'#0000FF', m:'#FF00FF', c:'#00FFFF', w:'#FFFFFF' }`.
   - Panel title rows use `tt.c` on black, not `--ab-secondary`.
   - Bars in `art()`: `[tt.w, tt.y, tt.c, tt.g, tt.m, tt.r, tt.b]`.
   - The client colour is limited to the station ident: the brand mark, one page number and the inverse "ALIVE" block. In light mode, keep black screens on a pale wall (as now).
3. **★ Build the page on a 40-column grid.**
   - Hero container: `display:grid; grid-template-columns: repeat(40, 1ch); font-family: Bedstead; font-size: clamp(12px, 2cqw, 22px)`.
   - The header row reads `P100  MARIGOLD 100  Sat 11 Oct  23:41/07`, laid out exactly like a Ceefax row 0.
   - The headline occupies rows 2–5 double-height. Fastext keys form row 24.
   - The test card moves to deck slide 06 and the board's "02" panel. The hero *is* the teletext page.
4. **A real intrusion.** In `art()`, add a frame-grab slice. Take the brand mark rendered at 24×18 sixels (2×3 cells per character) in `tt.w` on `tt.b`, horizontally torn: 3 bands offset by +6/−4/+9 units with a 1px white tear line. Overlay "THIS IS NOT YOUR SIGNAL." in plain mono. Set it on the card's lower third, replacing the noise patch.
5. **Remove the TV bezel.** Set `.ab-art { border-radius: 0; box-shadow: none }`, delete the grey surround and let castellations run to the edge.
6. **Patterns** (`fit.js` `'pirate-broadcast'`).
   - Retune the existing lead `pixelgrid` to `{mode:'blocks', cell:2, zones:6}` (sixel mosaic).
   - Retune the existing `signal` (Dead air) to `{px:0.5, bands:4, noise:0.1, blank:0.6}` (a rolling bar).
   - Replace `snow` (Static), `satellite` (Intercept) and `warpcheck` (Roll bars) with:
     - `gradpanes` `{rows:1, cols:7, steps:0}` (colour bars)
     - `modulargrid` `{style:'line', cols:40, merge:0, empty:0.7}` in `mono` (the character grid)
     - `glyphgrid` `{glyphs:'blocks', cell:3, bands:2}` (mosaic glyphs)
   - Bars in true teletext colours need a fixed `'broadcast'` colourway in `Patterns.inksFor` (`js/patterns/engine.js:314`). fit.js's rule "nothing here invents a colour" blocks doing it in params. That is an engine decision for the coordinator.

### Keep
- The P100 / P201–P205 page numbering.
- The Fastext footer strip (fixed R/G/Y/B, the one correct colour decision).
- The `> SAVE` keys with signal-strength glyphs.
- The dotted-leader index rows (101 BRAND REFRESH ……).
- The "DO NOT ADJUST YOUR SET." motto.
- The phone layout.

### Deck
- **01 cover:** the TV is right, the band is a generic mosaic. Use a row of 40 sixel blocks in the fixed colours.
- **04 typography:** "AA / BEBAS NEUE" at display size states the problem plainly. After fix 1 this becomes the deck's best slide.
- **07 patterns:** three of six off-key (fix 6).
- **08 product:** generic app, no page numbers. Add `P1xx` prefixes to the rows (cross-cutting fix A).

---

## blob-tracking

**Score: 5/10 — Refine.** The overlay system is the most specific mechanism in this group: box types, tabs, links, and processing inside vs. outside. It tracks a pile of 4px mosaic noise rather than a subject, and below the fold it is micrographics in Inter Tight.

### References
1. **Ultralytics YOLO, object detection.** https://docs.ultralytics.com/tasks/detect/. A real photo (a person, traffic cones) with coloured class boxes and filled label tabs ("Person 92%"). The subject is legible first; the overlay explains it.
2. **Forensic Architecture.** https://forensic-architecture.org/. Clinical overlays on real imagery and maps, one red signal and dense captions. Machine-vision language as evidence.
3. **Rafael Lozano-Hemmer.** https://www.lozano-hemmer.com/ (home: *Sphere Packing*). Zoom Pavilion: https://www.lozano-hemmer.com/zoom_pavilion.php (text, plus video poster). Face-detection boxes projected over a crowd. The subject is the audience.
4. **Interactive & Immersive HQ, "Blob tracking tricks in TouchDesigner."** https://interactiveimmersive.io/blog/touchdesigner-resources/blob-tracking-tricks-in-touchdesigner/ (header and text). Threshold footage, then box moving regions. Contrast comes from the source footage.
5. **Trevor Paglen.** https://paglen.studio/ (index, text only). "Machine Visions" and "Training Images": the series that defined CV-as-art.
6. **Adam Harvey, CV Dazzle / Exposing.ai.** https://adam.harvey.studio/ (text only). Counter-surveillance research. The detection box as a political object.
7. **TouchDesigner Blob Track TOP.** https://derivative.ca/UserGuide/Blob_Track_TOP *(not viewed)*.

### Kill list
- **The "footage" plate** (A hero band; `bt-zoom.png`). It is 58 Gaussian ellipses (`BT_SUBJ`, rx 1.3–4 cells) thresholded on a 216×90 Bayer grid (`BT_NX`/`BT_NY`), so each subject is a 5–15px white mosaic splat. It reads as QR codes or pixel noise, not a flock. Every reference tracks something you can name.
- **Label pile-ups** (`bt-zoom.png`):
  - "X073" is overprinted by "ID 29 · 0.70 0.93".
  - "X104Y" is clipped.
  - "ID 16 · 0.8" is cut by "ID 2…".
  - The red "X 1890 Y 0534 A 1884px" sits under a box.

  Some overlap is authentic. Collisions on the *locked* target's own readout are not.
- **The lower board** (A2): Inter Tight headings, Inter body and Geist Mono labels in thin-bordered dark cards. It is the micrographics and dystopian-luxury stack (`nb2.png`, `nb3.png`: same Inter Tight / Inter pairing).
- **The Searching/Locked/Lost button trio with corner brackets.** It duplicates cyber-hud's Idle/Target/Locked.
- **Deck "Bounding boxes" pattern** (`modulargrid` line). It renders as a Bauhaus icon scatter of circles, X's and stripes, not boxes.

### Gaps (ranked)
1. **Subject · high.** The refs show a person, crowd, flock or traffic, legible at a glance. Ours is noise.
2. **Resolution contrast · high.** The refs use fine footage grain under crisp 1px vector boxes. Ours has 4px dither cells, nearly the same weight as the 1px boxes, so overlay and image merge.
3. **Below-the-fold voice · med.** The refs carry the CV language through every element (class labels, confidence, frame counters). Ours brings it back only as tags on two buttons and the rows.
4. **Distinctness · med** (below).
5. **Phone · low.** D crops the band naturally, which works. The headline box tag "ID 07" overlaps the next line slightly.

### Distinctness
- **micrographics:** sibling in type and tags. The same Inter Tight / Geist Mono and ID / crosshair micro-labels.
- **cyber-hud:** sibling in brackets and lock states.

**Verdict:** blob-tracking keeps brackets and locks (it is the CV style) and cyber-hud gives them up. Against micrographics, blob must change its text stack.

### Fixes (ranked)
1. **★ Track a subject** (`BT_SUBJ` / `BT_LUM` in `js/aesthetics/blob-tracking.js`).
   - Double the grid to `BT_NX = 432, BT_NY = 180`, so cells are ~2px at 884w.
   - Replace the ellipses with 9–14 walking-figure silhouettes seen from a high angle: head disc r=3, torso capsule 5×11, two leg strokes at ±15° (2-frame stride), and a long cast shadow (an ellipse at 25% amplitude, offset +8, +4).
   - Place them along two crossing paths on a plaza with a faint paving grid (luminance 0.06 lines every 24 cells) and a bright doorway rectangle at right.
   - Keep the clustering code; it already derives boxes from `BT_SUBJ`.
2. **★ Separate image from overlay.**
   - With the finer grid, keep boxes at 1px, tabs at 9px mono with a solid fill (`ink` bg / `canvas` text), and label everything with a class name plus confidence: `PERSON 0.93`, `SHADOW 0.41`, `GROUP 03 · 4 OBJ`.
   - Add a de-collision pass after `BT_BOXES`: sort tabs by y, and if two tab rects intersect, flip the lower one to the box's bottom edge. Cap tabs at 18 and give the rest an ID only.
3. **★ Change the text stack.**
   - Meta pairing 1 becomes `['IBM Plex Mono','Inter']`: the headline is set in mono at weight 600, `letter-spacing: -0.02em`, so every word is a label.
   - Inter Tight moves to the second pick.
   - The headline box tag becomes `TEXT 0.99 · CLASS: HEADLINE`.
4. **Carry the CV language down the board.**
   - Every section header gets a frame counter (`F0412 → F0413…`, one per section).
   - The palette swatches become detected regions: a 1px box offset 4px outside each chip, plus a tab `CANVAS 0.98` replacing the label row.
   - The type cards get a dashed bounding box only around the specimen word, with `FONT 0.97`.
5. **Pattern fix** (`fit.js` `'blob-tracking'`). Replace `modulargrid` (Bounding boxes), which renders as Bauhaus shapes, with `pixelgrid` `{mode:'crosses', cell:3, zones:2, density:0.4}` in `mono` (a detection grid). Retune `parcels` (Track IDs) to `{cell:2.2, size:1.6, every:4, labels:true}` so the boxes are the subject of that tile.
6. **Locked readout.** Move the red `X / Y / A` line above the locked box's tab (`y - 14`) and give it a canvas-coloured backing so the one locked target is always legible.

### Keep
- The overlay grammar: group vs. cluster vs. single boxes, dashed long links, inverted interiors, and the locked box in primary.
- The full-bleed band hero.
- The "ID 07 · 0.93" highlight box on "alive".
- The tick-rail progress bars.
- The mono deck patterns (onebit, dropout, crosshairs).
- The light mode (B), which keeps the plate dark.

### Deck
- **01 cover:** the band strip at the bottom shows only splats.
- **02/10:** "Everything in frame is accounted for" in a tagged box is a strong motto treatment.
- **06 material:** the plate at full size, exposing the noise problem (fix 1).
- **09 do/don't:** "Track a real subject in dithered footage", while the art tracks none.

---

## Cross-cutting fixes (outside the six aesthetic files)

- **A. "In product" slide is one generic template for all six** (`js/brand-deck.js`, `key: 'product'`). It has round `.ab-deck-dot`s, a plain row list and a % in the heading face. Build the rows from the board's own row component (the `.ab-row` markup the board's "03 / In use" uses) so each aesthetic's row skin applies: segmented bars, LV badges, P-numbers, ID tabs. Set `.ab-deck-rpct` in `var(--ab-font-mono)` to stop display faces mangling "%" (Michroma "72°/o").
- **B. Faux bold.** Several aesthetics ask single-weight faces for 700–800. retro-futurist does it with Michroma at 800. y2k and cyber-hud already have `*Weight()` helpers. Add `font-synthesis: none` on `.ab` globally, or reuse the helper in retro-futurist (`--ab-hw`).
- **C. Brown-field convergence.** retro-futurist `canvas()` (s ≤ 45, L14) and cyber-hud `canvas()` (3.5% primary into L5) both warm the dark field toward the client primary. Five of six boards end up brown under a warm palette. At most one aesthetic per family should tint the dark field with primary.
- **D. Patterns default to op-art and glitch.** Four of six suites lean on `oprings`, `warpcheck`, `burst`, `satellite` or `slipgrid` in the brand colourway. These families belong to acid-graphics and groovy-70s; elsewhere, use them only in `mono` or `night`.
