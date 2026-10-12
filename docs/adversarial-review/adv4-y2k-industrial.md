# ADV-4 — Y2K Chrome and Industrial Device (adversarial review, packet rev 1)

Evidence: board screenshots `adv-<key>-A/B/C/D.png`, deck sheets and full-size slides in `dk/`, zoom crops and
reference screenshots in scratch `adv/adv4/` and `adv/adv4/refs/` (not in the repo). Code was read but not edited.

---

## y2k-chrome

**Score: 5/10 — Refine (heavy).** It reads correctly as "chrome" from across the room. Up close, though, the
signature mechanism is a flat two-band gradient with a visible rendering defect. The board covers one slice of
Y2K (gradient chrome) and leaves out the rest: tDR techno-graphics, translucent plastics, Aqua gel.

### References (viewed headless unless noted)
- The Designers Republic — https://www.thedesignersrepublic.com/ — a flat acid-yellow field, a dense bold sans, and fake trademarks used as ornament (™ on every noun). Acid here is a flat, hard-edged colour, not a sticker.
- Fonts In Use, "Amalgamation" (tDR) — https://fontsinuse.com/typefaces/246221/amalgamation — a custom unicase techno face, plus bilingual product-label micro-type ("work buy consume die" over a katakana roundel).
- Creative Review, "An oral history of Wipeout" — https://www.creativereview.co.uk/an-oral-history-of-wipeout/ — tDR team liveries: flat colour blocks, speed chevrons, icon-logos on hardware.
- AIGA Eye on Design, "Liquid Metal is everywhere" — https://eyeondesign.aiga.org/the-futuristic-gleam-of-liquid-metal-is-everywhere-right-now-heres-why/ — survey of the contemporary revival. Its images supply the next five bullets:
- &Walsh / Jessica Walsh liquid-chrome identity (via EOD) — chrome objects reflect a real environment (blue sky and cloud, white ground), so the reflections carry colour and the horizon curves around each form.
- Jonathan Castro poster (via EOD) — liquid chrome whose orange and blue reflections stretch along the form. There is no single straight horizon.
- Goliagolia, TDF 2019 (via EOD) — custom liquid lettering with bevelled highlights running along every stroke edge on a pale field. The chrome is the letter's volume, not a fill.
- "Retrograde Youth" poster (via EOD) — a chrome ring reflecting a pastel sky and a peach ground. The horizon bends with the torus.
- Julia Ballmann / Pppanik "2009" (via EOD) — inflated, melted chrome numerals with iridescent rims on black.
- Eye on Design hero "OS" (via EOD) — one small chrome mark inside a flat, hard graphic (Klein-blue eye, crop marks). The power comes from chrome set against flat vector, not chrome everywhere.
- iMac G3 "Bondi Blue" — https://en.wikipedia.org/wiki/IMac_G3 — translucent candy plastic with the internals visible through it.
- Mac OS X Aqua — https://en.wikipedia.org/wiki/Aqua_(user_interface) — gel buttons: a hard top specular, a bright bottom caustic glow, pinstripes and brushed metal.
- Hajime Sorayama — https://en.wikipedia.org/wiki/Hajime_Sorayama — airbrushed chrome (also the Sony AIBO). Speculars are softbox "window" shapes and edge rims, not round cartoon dots. (Page text viewed; artwork not reproduced.)

### Where it falls short (ranked)
1. **The chrome headline shows glyph-overlap seams — high.** In the refs, chrome letters are clean, continuous volumes. Ours has hairline contours visible inside G, d, e, h and u on the board hero and on deck cover and typography slides (`adv4/y2k-covertype.png`). The cause is `-webkit-text-stroke: 0.6px` on `.ab-headline` in `css/aesthetics/y2k-chrome.css`, which strokes the overlapping contours of the variable font (Unbounded). This is a craft defect on the signature element.
2. **Chrome is a flat fill, not a volume — high.** In Goliagolia, Pppanik and the Walsh chrome, highlights follow each stroke edge (bevel and inflation) and the reflections bend with the form. Ours repeats one horizontal gradient per line (`--ab-chrome`, hard stop at 50%), so every letter has the same straight dark band at the same height. It reads as a Photoshop gradient overlay, which is exactly the "Instagram template chrome" the brief rules out.
3. **The hero sculpture is a two-tone sticker — high.** The refs bend the horizon around each lobe and show a coloured environment. In ours (`art()` in `js/aesthetics/y2k-chrome.js`), one `userSpaceOnUse` gradient (y 14→92, hard stops at .495/.515) cuts a ruler-straight line across every lobe, the bottom half is a primary radial wash, and the speculars are three cartoon ellipses (rx 11 / ry 4.6 and so on). A flat floor ellipse sits underneath. The result reads as a glossy vector clip-art blob (`adv4/y2k-hero.png`).
4. **Half of Y2K is missing — med.** The brief names tDR, Warp/Mo'Wax, translucent iMac plastics and early-2000s tech gloss. The board has no techno micro-type, no icon or code system, no translucent material and no Aqua caustic. Every surface is opaque gunmetal. tDR and Wipeout, the "artistically exciting" half, are absent.
5. **Sparkles and the sticker plate are template clichés — med.** Four 4-point stars (two in acid yellow) around the blob, plus "✦" glyphs on the tag, the kicker and the footer dot, make up the Canva "Y2K sparkle" kit. The "alive" plate is a rotated (−2.4°), blobby-radius sticker (`.ab-hl`). That is neo-brutal-pop sticker language, not tDR's flat, hard-edged acid block.
6. **Scale contrast is timid — med.** The refs let one chrome object dominate and overlap the type, or set chrome tiny inside a big flat graphic. Ours is a balanced 1.45fr/1fr split: a ~60px headline beside a 470px blob, no overlap, everything mid-scale.
7. **Panels read as generic dark SaaS — low/med.** The cards are 32px-radius dark slabs with a white gradient rim and a soft drop shadow. Nothing on them is brushed, pinstriped or translucent, so "metal panel" is only a claim.
8. **The pattern suite is off-key — med (deck).** Heat smear, Neon spray, Swirl and Bubble screen (`fit.js`) read as 90s rave flyer or vaporwave, not chrome or tDR. The cover band and closing strip ("Chrome strips", `gradpanes` steps:8, brand colourway) render as stepped teal and orange bars that look 70s, not polished metal.

### Off-key / cliché
- Yellow 4-point sparkles and "✦" bullets (template kit).
- Rotated rounded "sticker" highlight (neo-brutal-pop).
- Neon spray, heat smear and swirl patterns (rave/vaporwave).
- The cover band's stepped brand-colour stripes (groovy-70s).
- The sculpture's three cartoon highlight ellipses (generic vector "glossy").

### Fixes (ranked, implementable)
1. **Kill the seams.** In `css/aesthetics/y2k-chrome.css` `.ab-headline`, delete `-webkit-text-stroke: 0.6px rgba(255,255,255,.55)`. Get the edge light from the filter chain instead: `filter: drop-shadow(0 -0.5px 0 rgba(255,255,255,.55)) drop-shadow(0 2px 0 rgba(0,0,0,.55)) drop-shadow(0 0 22px var(--ab-pri-glow-35));`. Re-check deck slides 01 and 04 at 63px.
2. **Make the chrome type a volume.** Add one shared SVG filter (emit it once from `art()`, or from the board shell) and apply it to `.ab-headline` with `filter: url(#y2k-bevel) drop-shadow(...)`:
   `<filter id="y2k-bevel"><feGaussianBlur in="SourceAlpha" stdDeviation="1.6" result="b"/><feSpecularLighting in="b" surfaceScale="4" specularConstant="1.1" specularExponent="26" lighting-color="#fff" result="s"><feDistantLight azimuth="235" elevation="40"/></feSpecularLighting><feComposite in="s" in2="SourceAlpha" operator="in" result="si"/><feComposite in="SourceGraphic" in2="si" operator="arithmetic" k2="1" k3="0.85"/></filter>`.
   Then soften the per-line horizon by moving the hard stop from 46/50/53% to 44/49/55%, so the band sits slightly off-centre and is less ruler-like. Keep a no-filter fallback for Safari, which handles `url()` filters on HTML poorly.
3. **Re-render the sculpture (`art()` in `js/aesthetics/y2k-chrome.js`).**
   (a) Bend the horizon by wrapping the chrome `<rect>` in a filter: `<feGaussianBlur in="SourceAlpha" stdDeviation="6" result="a"/><feTurbulence type="fractalNoise" baseFrequency=".02" numOctaves="2" seed="${y2kSeq}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="16" xChannelSelector="R" yChannelSelector="G"/>`.
   (b) Add a rim: a `feMorphology operator="erode" radius="1.2"` copy of the mask, subtracted from the mask and filled white at .7, gives a 1px bright edge on every lobe.
   (c) Replace the three ellipses with one softbox specular: a rounded rect about 15×6 units at −34°, white, with a 0.6-unit dark mullion. Add one small secondary window on the right lobe.
   (d) Swap the flat floor ellipse (`cy=93 opacity .5`) for a mirrored copy of the silhouette at 12% opacity with a fade mask, or drop it.
4. **Strip the sparkle kit.** In `art()`, keep at most one white lens glint: a 4-point core r 3, plus two 0.3-unit hairlines 26 long crossing it. Remove both accent stars. In CSS, replace the `content: "✦"` on `.ab-tag::before` and `.ab-kicker::before` with a 7px chrome bead (`background: var(--ab-chrome-fixed); border-radius: 50%`) or a "™"-style micro-mark, and do the same for `.ab-dot`. Accent then belongs to the acid plate alone.
5. **Make the acid plate tDR, not a sticker.** In `.ab-hl`, set `transform: none; border-radius: 0.05em; padding: 0 0.12em 0.04em;` and add `::after { content: "™"; font-size: .22em; vertical-align: super; }` in dark ink. Update `highlightNote` and the "Acid highlight plate" material (`rotate(-2deg)` → none).
6. **Add the techno layer.** Set labels (`.ab-label`, `.ab-tag`, `.ab-state`) in Michroma, which is already in the meta picks and is Microgramma-like, at 9–10px, uppercase, tracking .22em. Add a product-code line to the hero kicker, for example `LIQUID METAL  /  MRG-01™`. This is the Wipeout and tDR micro-type mechanism, done with existing hooks.
7. **Add the translucent / Aqua material.** On `--y2-pill` and `.ab-cta`, add a bottom caustic above the primary fill: `radial-gradient(ellipse 70% 60% at 50% 105%, rgba(255,255,255,.42), transparent 70%) padding-box`, plus `inset 0 -1px 0 rgba(0,0,0,.25)`. Replace the "Brushed" disc (`.ab-disc[data-s="0"]`) with "Gel": primary at 70% alpha over a 1px pinstripe (`repeating-linear-gradient(0deg, rgba(255,255,255,.12) 0 1px, transparent 1px 3px)`), with the top specular. Update `labels.states` to `['Gel', 'Polished', 'Liquid']`.
8. **Push the scale.** Set `type.display` to 1.1. At ≥601px, let `.ab-art` overlap the headline column (`margin-left: -10%; position: relative; z-index: 0`, headline `z-index: 1`) so the chrome object breaks the grid as in the refs.
9. **Make panels metal.** In `.ab-card` and `.ab-panel`, set radius 32 → 22, add `inset 0 1px 0 rgba(255,255,255,.16)`, and add a 4% brushed grain layer: `repeating-linear-gradient(90deg, rgba(255,255,255,.035) 0 1px, transparent 1px 3px)` on top of `--y2-metal`.
10. **Patterns (`js/patterns/fit.js`, `'y2k-chrome'`).** Replace `thermalstreak` (Heat smear), `neonspray` (Neon spray) and `flow` (Swirl) with `oprings` (concentric chrome target), `glyphgrid` (tDR icon grid, mono) and `chevron` (Wipeout speed chevrons). For the lead `gradpanes`, try `steps: 0` and the `mono` or `night` colorway so the cover band reads as polished bars rather than stepped brand stripes.

### Keep
- Palette chips with glossy beads and chrome rims.
- Silver status pills and glossy primary progress tubes in "03 / In use".
- The chrome-filled row numerals.
- The Brushed/Polished/Liquid disc idea: it is the strongest material demo on the board.
- The chrome switch knob on a primary track.
- The near-black canvas nudged 5% toward primary.
- The dark-chrome variant on light mode (B holds).
- The 390px phone layout (D holds: chips stack, sculpture stays legible).
- The green palette (C), which tints the edge-light correctly.

### Deck
- **01 cover / 10 closing:** the band and strip are stepped brand-colour bars (gradpanes steps:8) with no chrome reading. Fix 10 applies. Headline seams are visible at 63px (fix 1).
- **04 typography:** the "Aa" and the display line show the same contour seams, and this is the slide that sells the type.
- **06 material:** the same two-tone blob and sparkles. After fix 3 it becomes the hero; until then it is the weakest slide.
- **07 patterns:** slot labels show family names ("Flow filaments", "Neon spray") rather than the suite names in `fit.js` ("Swirl", "Lens flare"). That may be cross-cutting and worth checking in the patterns deck code. The patterns themselves are off-key (fix 10).

---

## industrial-device

**Score: 6.5/10 — Refine.** Of the two, this one is clearly closer to the bar. The device hero, numbered
callouts, OLED strip and LED meters are well chosen. But the hero device is mute (no legends), the board breaks
its own "no soft shadow" rule, and the type voice is startup-landing, not TE, Braun or Nothing.

### References (viewed headless unless noted)
- Teenage Engineering EP-133 K.O. II — https://teenage.engineering/products/ep-133 — every key carries a printed legend (7, 8, 9, ENTER, RECORD, "+/−"). Two key colours (graphite and light), stacked black/white label plates (SOUND/EDIT, MAIN/COMMIT), small labelled LED dots (LEVEL, PITCH), one orange knob and one black knob, a fader. The page puts headlines on a flat orange block ("NO. I CHAMPION").
- Teenage Engineering OP-1 field — https://teenage.engineering/products/op-1 — an icon silkscreen on every key (arrows, record, scissors, shift), coloured encoder caps, a round-hole speaker grille. The page uses light lowercase centred type, vast empty grey, and hairline grid cells for the system diagram.
- Teenage Engineering TP-7 — https://teenage.engineering/products/tp-7 — machined aluminium, a tiny LCD readout ("0:00.27 REC"), light-weight lowercase headline, one orange text link.
- rabbit r1 (TE design) — https://www.rabbit.tech/rabbit-r1 — one saturated orange object on a black field, tiny lowercase UI type, extreme product-to-text scale contrast.
- Nothing — https://us.nothing.tech — dot-matrix display type (NDot) for navigation and numerals, a dot grid on the page ground, black/white with one red.
- Elektron Digitakt II — https://www.elektron.se/explore/digitakt-ii — a silkscreened label under every key and knob, a graphite body, small coloured LEDs, a regular knob grid.
- Braun ET66 (Rams / Lubs, 1987), V&A O1360553 — https://collections.vam.ac.uk/item/O1360553 — colour by function: black number keys, brown operator keys, one yellow equals key. (Catalogue text read; the image sat behind a cookie wall, which was not accepted.)
- Teenage Engineering product pages, typography generally (the same three pages) — very small mono and grotesk labels against very large product renders; nothing in between.

### Where it falls short (ranked)
1. **The hero device has no legends — high.** On EP-133, OP-1 and Elektron, every control is labelled: numbers, words, icons. On ours, all 16 keys carry the same 1px dash (`.idv-key::after`, see `adv4/ind-hero.png`), and the board's own principle is "One label per control". There is also one key colour. The refs use two or three key families (graphite and light, or ET66's black, brown and yellow).
2. **The board contradicts its own rule — high.** The rules and the deck say "Add soft drop shadows… no" and "Build panels flat", yet `.ab-card`, `.ab-panel` and `.ab-list` carry `0 12px 16px -14px rgba(0,0,0,.35)`, and `.idv-body` carries `0 14px 18px -16px rgba(0,0,0,.45)`. The result is floating "cards", which is the SaaS reading the aesthetic is meant to avoid.
3. **The type voice is wrong — high.** TE pages are light-weight and lowercase with huge whitespace, and Nothing uses dot-matrix. Ours is Space Grotesk 600 with tight tracking, and "alive" sits in the accent pulled darker for contrast: on A it renders mustard (`adv-industrial-device-A.png`), which reads muddy and off-palette. That reads as a startup landing hero. The accent is also meant to be "≤3%" and reserved for the function key and LEDs.
4. **The recommended mono face is never used — med.** Meta recommends Azeret / IBM Plex / Space Mono, and the type card displays Azeret Mono. But every label uses `--id-mono: ui-monospace, "SF Mono", Menlo` (and `abResolveFace('mono')` returns the system mono). So the board doesn't follow its own recommendation, and there is no dot-matrix voice (the Nothing mechanism) anywhere outside the tiny OLED.
5. **The knob is crude — med.** The knurl is `repeating-conic-gradient(... 2.4deg ...)` on a small disc, which aliases into a fan-shaped moiré. The ticks are conic wedges masked to a ring, so they render as skewed trapezoids of uneven length (zoom crop). The refs use smooth matte or coloured caps with printed, evenly spaced, sometimes numbered scales.
6. **Scale contrast is middling — med.** The refs pair a dominant product with very small labels. Ours sets the device at ~380px in a 1.15fr/1fr split beside a ~56px semibold headline, with mid-sized labels throughout.
7. **The pattern suite and the deck lead are off-key — med (deck).** The lead `modulargrid` "Panel grid" renders quarter-circles, triangles and dot blocks, which is Bauhaus-poster vocabulary on the cover band and closing strip. `zigzag` "Tread plate" renders harlequin diamonds, and `signal` "Scanlines" is CRT, cyber-hud territory. There is no perforation grid, the most recognisable physical texture in the refs (OP-1 and EP-133 grilles, Braun speakers, Nothing's dot ground).

### Off-key / cliché
- Mustard "alive" headline word.
- Floating soft-shadow cards.
- Bauhaus quarter-circle cover band.
- Harlequin "tread plate".
- CRT scanlines.
- Space Grotesk semibold as the hero voice. Its quirky Space Mono heritage is fine for labels but wrong as the calm Rams/TE headline.

### Fixes (ranked, implementable)
1. **Give the keys legends and key families (`art()` in `js/aesthetics/industrial-device.js`, `.idv-key` CSS).** Emit `<i class="idv-key…"><b>${L[r*4+c]}</b></i>` with `L = ['1','2','3','A','4','5','6','B','7','8','9','C','*','0','#','D']`, or icons (▶ ● ■ ↺) for the top row. Style the label as `font: 600 1.9cqw var(--id-mono); position: absolute; left: 14%; top: 10%;`, printed top-left as on EP-133. Delete the dash `::after`. Make row 3 and column 3 a graphite family: a new token `--ab-key-dark: mix(ink, canvas, .82)` with `--ab-on-key-dark` for the legend. Keep the one accent function key and the one primary active key.
2. **Obey the flat rule (`css/aesthetics/industrial-device.css`).** Remove the soft shadows from `.ab-card, .ab-panel, .ab-list` (`0 12px 16px -14px…`) and `.idv-body` (`0 14px 18px -16px…`). Replace them with `var(--id-panel), 0 1px 0 var(--ab-key-edge)`, a machined 1px lower lip.
3. **Fix the headline voice.**
   - In `.ab-headline`, use `font-weight: 400` with letter-spacing −0.02em.
   - Change `highlight: 'ink'` to `'custom'` and put the word on a flat primary plate, as on TE's EP-133 page: `.ab-hl { background: var(--ab-primary); color: var(--ab-on-primary); padding: 0 .1em; border-radius: 2px; }`.
   - Update `highlightNote` and the accent role so the accent stays on the function key and LEDs only. This also removes the mustard contrast-darkening.
   - Consider promoting Inter (or Archivo at 400) to the first heading pairing in `js/aesthetic-meta.js`, keeping Space Grotesk second.
4. **Use the recommended mono faces and add a dot-matrix voice.** Point `--id-mono` at the meta mono pick (`"Azeret Mono", "IBM Plex Mono", ui-monospace, monospace`) and make sure it is loaded with the board fonts. Add Doto (Google Fonts dot-matrix) for `.idv-oled b`, `.ab-row-pct` and the palette index numerals (`.ab-sw-role::before`), at weight 700. That is Nothing's NDot mechanism, kept to numerals and the display.
5. **Rebuild the knob.**
   - Drop the `repeating-conic-gradient` knurl on `.idv-knob` and make the cap flat `var(--ab-key)` with a 1px hair edge and a 1px top highlight.
   - Render the scale in the existing `.idv-marks` SVG: 11 radial `<line>`s over 270° (−135° to +135°), every 5th one 1.6× longer, with mono numerals "0 · 5 · 10" at 1.6cqw. Replace `.idv-ticks` and `.idv-arc` (the lit arc becomes primary-coloured lines 0–5).
   - Optional: cap in primary, as the one coloured encoder (OP-1).
6. **Scale contrast.** Set `.ab-hero { grid-template-columns: minmax(0, .85fr) minmax(0, 1.15fr); }` and `.ab-art { max-width: 600px; }`. Hold the headline at `display: 0.85`. Labels stay at 9.5–10.5px.
7. **Add label plates and labelled LEDs to the device.** Above the key grid, add two stacked plates (`MODE / EDIT`) as 1.6cqw mono on ink and on face. Next to the LEDs, add labels (`PWR`, `REC`).
8. **Patterns (`js/patterns/fit.js`, `'industrial-device'`).**
   - Lead with a perforation grid: `['halftone', 'Perforation', 'mono', { cell: 2.4, levels: 3, shape: 'round', field: 'ridges', duo: false }]`.
   - Replace `zigzag` "Tread plate" with `['specimens', 'CMF chips', 'brand', {...}]` (colour-material-finish swatches).
   - Replace `signal` "Scanlines" with `glyphgrid` blocks.
   - Move `modulargrid` out of the lead slot, so the cover band stops reading as Bauhaus.
9. **Deck material slide.** The callout circle collides with its label ("⓪①MACHINED PANEL", `adv4/ind-mat.png`). Add `.ab[data-ae="industrial-device"] .ab-deck-mat .ab-label { display: flex; align-items: center; gap: 10px; }` and widen `.ab-n` to 24px, since "01" at 8.5px overflows the 21px ring. The list also reads "02 KEY / 03 KEY" because `bdMatName` strips "(up)/(down)". Rename those materials to "Key" and "Key pressed", or reorder so slots 1–4 are Machined panel, Key, Function key, OLED strip.

### Keep
- The OLED strip: pixel-mask overlay, brand name in primary pixels, level bars, "A.01".
- The numbered callouts with leader lines and the legend under the device.
- The single accent function key and single primary active key.
- The segmented LED meters and the left-colour-coded status tags in the channel strip.
- The Up/Hover/Down key states with the 2px compress.
- The recessed slot input and gripped slide switch.
- The numbered CMF-style palette with roles and coverage.
- The LED dot on the kicker and tag.
- The graphite dark mode (B), green palette (C) and phone layout (D), which all hold without breakage.

### Deck
- **01 cover / 10 closing:** the band and strip are the Bauhaus-like `modulargrid` (fix 8). The cover device is good.
- **02 principles:** "Every control has a **job**" uses the mustard accent word (fix 3).
- **05 interface:** good, a direct lift of the key states.
- **06 material:** the callout collision and duplicate "KEY" labels (fix 9). The device is mute (fix 1).
- **07 patterns:** zigzag (diamonds) and signal mosaic (CRT) are off-key (fix 8). Slot labels show family names rather than suite names; this may be cross-cutting.
- **09 do/don't:** "Add soft shadows" is listed as a don't while every board panel has one (fix 2).

---

## Fix log (fx4)

Files: `js/aesthetics/y2k-chrome.js`, `css/aesthetics/y2k-chrome.css`, `js/aesthetics/industrial-device.js`, `css/aesthetics/industrial-device.css`. Shots: `scratchpad/adv/fx4-*-A..D.png`, `sheet-fx4-*.png`, `fx4/sheet-deck-*.png`.

### y2k-chrome
1. Seams: `-webkit-text-stroke` removed from `.ab-headline`; edge light is now `drop-shadow(0 -0.5px 0 white .55)` in the filter chain. Done.
2. Volume: SVG specular-lighting bevel (review values) applied as `filter: url(data:image/svg+xml...#b)` from a CSS variable, so no `<filter id>` has to exist in the page (works on board and every deck slide, no duplicate ids). Horizon moved to 44/49/55%, sky cooled by the secondary and ground warmed by the primary. Fallback: the plain drop-shadow chain is the base rule; the bevel only applies inside an `@supports` block that excludes iOS Safari. The export already strips `filter` and flattens clipped text; the flat fill is now `--ab-chrome-flat` (silver) instead of ink.
3. Sculpture re-rendered: displacement-bent horizon, 1px white rim (silhouette minus eroded copy), softbox specular with mullion plus a small second window, mirrored faded floor reflection. Done.
4. Sparkles gone: the four stars and every "✦" removed. One white lens glint remains. Tag, kicker and footer dot are 7-8px chrome beads. Done.
5. Acid plate is flat, square-cornered (0.05em), unrotated, dark ink with a "™" mark. Done. Note and material updated.
6. Techno layer: labels, tags, state names, type-role and kicker in Michroma (9-9.5px, uppercase, .22em), kicker reads `LIQUID METAL / MRG-01™`. Done.
7. Translucent/Aqua: CTA, segment and progress pills get the bottom caustic; "Brushed" disc is now "Gel" (primary 70% over pinstripe, top specular, caustic); states `['Gel','Polished','Liquid']`; seg track pinstriped. Done.
8. Scale: `type.display` 1.1 tried, 3-line headline held at 1.0; the art is 128% of its column, pulled 28% left under the headline at 601px and wider, z-index 0 vs headline 1. Partly declined: 1.1 wrapped the headline to four lines.
9. Panels: radius 22, inset top highlight, 2.2% brushed grain (the review's 3.5% read as corduroy at 1x). Done.
10. Patterns: shared file (fx6).

### industrial-device
1. Legends on all 16 keys (1-9, A-D, loop/play/record icons on the bottom row), graphite family on the function column and transport row, dash removed, accent and primary keys keep their one slot. Tokens `--ab-key-dark`, `--ab-on-key-dark`. Done. (The `*`, `0`, `#` keys became the three icons.)
2. Soft shadows replaced by `--id-lip` (panel edge + 1px `key-edge` lower lip) on card, panel, list and device body. Done.
3. Headline weight 400, -0.02em; `highlight: 'custom'`, "alive" on a flat primary plate (2px radius); accent role no longer used for type; `display` 0.85. Done. Meta pairing swap (Inter first) is a shared change, not made.
4. `--id-mono` and `--ab-font-label` set to Azeret Mono / IBM Plex Mono; Doto for OLED name, `.ab-row-pct`, palette index numerals. Done.
5. Knob rebuilt: flat cap, dished inner ring, primary index, 11-line printed scale with 0/5/10 numerals, 0-5 lit in primary; conic ticks/arc removed. Done.
6. Hero grid .85fr/1.15fr, art max 600px. Done.
7. MODE/EDIT label plates above the keys; PWR/REC/PLY LED labels. Done.
8. Patterns: shared file (fx6).
9. Material slide: ring 24px, flex+gap on the deck label; materials reordered and renamed (Machined panel, Key, Function key, OLED strip, then Key pressed, Graphite key, ...). Done.
