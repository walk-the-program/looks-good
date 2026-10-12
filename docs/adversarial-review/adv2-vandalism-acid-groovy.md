# ADV-2: adversarial review of corporate-vandalism, acid-graphics and groovy-70s

Reviewer: Opus (adv2), read-only. Packet rev 1. Date: 2026-10-11.

Evidence used: `adv-<key>-A/B/C/D.png`, `sheet-adv-<key>.png`, `sheet-deck-<key>.png`, full-size `dk/<key>-*.png`, and crops I made in `scratchpad/adv/adv2/`. I opened the reference pages headlessly (`playwright-cli -s=adv2`) and saved the screenshots to `scratchpad/adv/adv2/refs/`. References marked **(seen)** were inspected visually. References marked **(text)** were blocked by a bot wall or paywall, or only the article text loaded, so the mechanism comes from the source text or well-documented canon. I did not open the live app because the supplied screenshots covered every state I needed.

---

## 1. corporate-vandalism

**Score: 6.5 / 10. Verdict: Refine.** The copy is the best thing here. The receipt, the redaction bars, the `!!!` chip and the mono fine print are all on-reference. The problem is that the hijack is typeset by the same polite hand as the shell. Nothing on the board looks like it was applied to the object by a second party, which is the whole mechanism in Kruger, Off-White, Holzer and MSCHF.

### References
- MSCHF homepage: https://mschf.com/ **(seen)**. A giant mono-caps numbered drop index (`#118 CLOUD TEE`, `#125 KING SOLOMON'S BABY↗`), unreleased drops shown as rows of `??????`, a `!!!` chip, on a black ground. The index *is* the brand.
- MSCHF C&D Grand Prix (Print): https://www.printmag.com/culturally-related-design/mschfs-68th-drop-invites-corporate-brands-to-send-them-a-cease-and-desist-letter-for-stealing-their-logos/ **(text)**. A legal letter addressed to brand lawyers is the product page. The vandalism is real other-party paperwork.
- Off-White zip tie (Highsnobiety): https://highsnobiety.com/p/virgil-abloh-off-white-zip-ties **(seen)**. A hazard-red industrial tag is physically attached to the finished product. The intrusion is an add-on object, not a restyle.
- Off-White quotation labelling (The Fashion Law): https://www.thefashionlaw.com/from-off-white-stripes-to-red-zip-ties-virgil-ablohs-approach-to-branding/ **(text, paywalled)**. Labels like `"SHOELACES"` and `"FOAM"` name a part *as itself*, printed on that part. This is literalism, not sarcasm.
- Barbara Kruger at Sprüth Magers: https://www.spruethmagers.com/artists/barbara-kruger/ **(seen)**. White Futura Bold Oblique sits on red bars slapped across a found black-and-white image. The second voice is a different typeface, colour and production layer.
- Jenny Holzer, Redaction Paintings: https://spruethmagers.com/the-work/jenny-holzer-the-work/ and https://www.nationalgalleries.org/art-and-artists/94707 **(text; the page loaded but showed no painting)**. Real FOIA documents with whole blocks and whole lines blacked out, plus stamps, classification banners and exemption codes. The redaction is dense and bureaucratic, not three tidy word-bars.
- Jenny Holzer projections: https://projects.jennyholzer.com/ **(seen)**. Plain caps truisms at architectural scale. A deadpan sentence becomes the dominant image.
- The Designers Republic, "Amalgamation" / WORK BUY CONSUME DIE: https://fontsinuse.com/typefaces/246221/amalgamation **(seen)**. A corporate slogan grammar turned against itself, with a red-disc mark and katakana.
- Virgil Abloh × IKEA MARKERAD (Dezeen): https://www.dezeen.com/2019/06/10/virgil-abloh-ikea-markerad-collection-launch/ **(text; Cloudflare check, which I did not bypass)**. A receipt rug and a `"SCULPTURE"` label: everyday corporate paperwork blown up into the object itself.

### Where it falls short (ranked)
1. **There is no applied second layer. Severity: high.** In the refs the intrusion is a physical other-party object: Kruger's red bar, the Off-White tag, the MSCHF legal letter, the FOIA stamp. Ours has every element in the same 1px-border, same-mono system. The notice card, receipt and form all read as designed by the brand (A0: the notice card, receipt and `WARNING: CONTAINS 14% OPINION` chip). Nothing overlaps, abuts or is pinned onto the headline or the CTA.
2. **The quotation-mark mechanism is misread. Severity: high.** Off-White quotes label an object as itself (`"BUTTON"`). Ours puts scare quotes around `"alive"` in the headline (A0, `.ab-hl::before/::after`). That is sarcasm, a different joke, and it reads as an ordinary ironic tagline. The deck's material slide does it right (`"REDACTION BAR"`, `"WARNING LABEL"`), but the board never labels its own UI.
3. **The redaction is too polite. Severity: medium.** There are three word-width bars in a short paragraph (A0, `.cva` notice). Holzer's sources black out whole lines and blocks, with exemption codes like `(b)(6)` in the margin and a classification banner. Our bars read as a cute gag, not as bureaucracy.
4. **The MSCHF index is not used where the board has one. Severity: medium.** The "In use" list (A2) is grotesk names at 28px with tiny `01/02/03` (`.ab-row-name`, `.ab-row-n`). MSCHF's signature is a mono-caps `#NNN` index with `????` for the unknown. Ours reads as a SaaS project list.
5. **Hazard red collides with the client primary. Severity: medium.** In the warm palette, `APPROVED` (#E4572E) and `FLAGGED` (#D40F14) sit side by side at nearly the same hue (A2 compliance panel, D). The "wrong" element doesn't stand out from the "official" one. In the green palette (C) it works, which proves the issue is palette-dependent.
6. **The top notice strip takes the client accent. Severity: medium.** In C it becomes pale mint #A8D5BA (sheet, column 3) and loses its warning voice. The code already defines a fixed `SAFETY #FFD500` but doesn't use it here (`css/aesthetics/corporate-vandalism.css` line 18, `background: var(--ab-accent)`).
7. **The headline tracking is trendy, not bored. Severity: low.** `letter-spacing: -0.05em` with `line-height: 0.9` (A0) makes Inter Tight look like a 2024 startup hero. Off-White and MSCHF type is default-tracked and deadpan.

### Off-key / cliché
- The teal-tinted compliance panel (`--cv-form`, A2 right) reads as a friendly SaaS card. Real forms are white or grey.
- The deck pattern suite (`glyphgrid`, `onebit`, `parcels`, `modulargrid`, `signal`, `relief`) is xerox and tech texture. Nothing in it is corporate stationery. The cover and closing bands (`glyphgrid`) look like QR noise.
- The `†` dagger on the headline is a cute footnote tic. Fine once, but it does the work the fine print should do.

### Fixes (ranked)
1. **Add Off-White literal labels to the UI** in `css/aesthetics/corporate-vandalism.css`. Give `.ab-cta`, `.ab-input`, `.ab-switch` and `.ab-seg` a quoted mono micro-label pinned outside the top-left corner: `::after { content: '"BUTTON"'; position: absolute; top: -14px; left: 0; font: 600 9px/1 var(--cv-mono); letter-spacing: .08em; color: var(--ab-ink); }` (then `"TEXT FIELD"`, `"CHECKBOX"`, `"TABS"`). Set `position: relative` on the hosts. Drop the quotes from `.ab-hl` and put `"HEADLINE"` as a label above the headline instead, or keep `"alive"` but make the label the primary joke. Respect the one-intrusion rule by counting the label system as the screen's one intrusion and removing the `†`.
2. **Make one element physically applied.** Add a fixed hazard-red tag, Off-White zip-tie style, to the hero CTA or notice card. In `js/aesthetics/corporate-vandalism.js` `art()`, add a small `<span class="cva-tag">"FOR OFFICIAL USE"</span>`: `background:#D40F14; color:#fff; padding:2px 6px; font:700 9px mono;`, absolutely positioned overlapping the card's top-right border by 8px, with a 1px black "tie" line (`::before`, 24px wide) running into the card. No rotation, so the shell rule still holds. Overlap is the vandalism.
3. **Bureaucratize the redaction** in `art()`. Black out one *full line* plus one block of two lines. Put mono exemption codes `(b)(6)` / `(b)(7)(C)` in a right margin column at 8px. Add a centred classification banner `UNCLASSIFIED // FOR INTERNAL FEELINGS ONLY` at 8px mono above `Notice of Compliance Review`.
4. **Rebuild the "In use" index as MSCHF** (`.ab-row-n`, `.ab-row-name`). Set the numbers as `#027`/`#028`/`#029` (mono, same size as the name) and the names in `var(--cv-mono)` uppercase at `clamp(16px,2.4cqw,22px)` with `letter-spacing: 0`. Add a fourth CSS-only row, or a `.ab-list::after`, that reads `#030 ??????????????` in `--cv-rest` grey.
5. **Fix the hazard/primary collision** in `tokens()` in `corporate-vandalism.js`. If the hue distance between `t.printPrimary` and HAZARD is under 25° and both have chroma over 0.12, render `.ab-cta` and the `APPROVED` state in ink (#000/#fff) with a 3px primary underline. The shell goes black-and-white, which is also more MSCHF.
6. **Fix the notice strip colour.** Change `background: var(--ab-accent)` to `background: var(--ab-safety, #FFD500); color: #000` (line 18). The vandal layer is meant to be fixed.
7. **Bore the headline.** Use `letter-spacing: calc(-0.02em * var(--ab-tr,1)); line-height: 0.98` on `.ab-headline`.
8. **Replace the deck pattern suite** in `js/patterns/fit.js` `'corporate-vandalism'`: a security-envelope tint (tiny repeated diagonal logotype or hatch, ink at 0.5), a hazard stripe (45° #000/#FFD500, 12px bands), a redaction field (rows of bars of varying length with some gaps), a perforated tear-off coupon edge, a form grid with `[ ]` boxes, and a barcode run (keep `signal`). Use the security-envelope tint for the cover and closing bands.

### Keep
- The receipt (`RECEIPT … AMOUNT DUE: ONE (1) APOLOGY`, zig-zag torn edge, barcode). It is the most on-reference element on the board.
- The `!!!` safety chip in the header (MSCHF-exact), the mono labels, the dashed rule lines and the crop-mark rules.
- The footer fine print and the `NO REFUNDS ON SARCASM` tone. The copy voice is right.
- The dark mode on pure #000 with the notice kept on light paper (B). That is right for MSCHF.
- The fixed hazard and safety colours, and the no-radius, no-shadow, no-rotation rule.

### Deck
- **Patterns (07):** fully off-key. See fix 8.
- **Product (08):** the vandal layer vanishes, leaving a plain SaaS project list. Add the one intrusion: a redacted project name or the `"PROJECTS"` literal label.
- **Material (06):** good instinct. The quoted labels are right, but they describe things rather than sit on them. Pin the labels to the notice card itself.
- **Cover / closing:** the `glyphgrid` band reads as QR code noise. Swap it for the security-envelope tint.

---

## 2. acid-graphics

**Score: 6 / 10. Verdict: Refine.** The flyer card, ticket stub, event strip and equal-luminance pair are real acid mechanisms. Light mode (B) as a full acid-orange slab and the green palette (C, which becomes neon green and pink) are genuinely good. But the headline "warp" is a uniform horizontal squeeze that just looks like a condensed font. The chrome is a flat grey gradient sliced into glitch. The ripple has stair-stepped pixel edges, and the density is far below the references.

### References
- Jonathan Castro, Skechers China (in Eye on Design, "Acid Graphics Are the New Psychedelia"): https://eyeondesign.aiga.org/acid-graphics-are-the-new-psychedelia-with-a-heady-dose-of-cynicism/ **(seen)**. Liquid chrome letterforms with spiky extrusions, an acid-yellow outline duplicate offset behind them, and a magenta glow halo. The type is sculpted, not squeezed. The article also names Hugo Hoppmann and David Rudnick as touchstones.
- GUCCIMAZE (Typeroom, Diesel Art Gallery): https://typeroom.eu/diesel-art-gallery-x-guccimaze-prepare-for-acid-graphics-overload **(seen)**. Calligraphic chrome with "venomous" green and violet rim light on black. The chrome reflects colour.
- The Designers Republic: https://www.thedesignersrepublic.com/ **(seen)**. A slogan stream full of ™ marks on acid yellow with a single magenta word. Corporate-parody copy carries density.
- TDR "Amalgamation" / WORK BUY CONSUME DIE: https://fontsinuse.com/typefaces/246221/amalgamation **(seen)**. Unicase pseudo-corporate type, katakana, a red disc and mock logos.
- TDR × WipEout (Creative Review oral history): https://www.creativereview.co.uk/an-oral-history-of-wipeout/ **(text)**. Pictogram systems, team logos, Eurostile-like type and wireframes. Information density as decoration.
- Phatmedia, the UK rave flyer archive: https://www.phatmedia.co.uk/ **(seen)**. Thousands of flyers: airbrush, 3D, maximal collage, sponsor and logo rows, legal small print, every inch used.
- The Ransom Note, Gone To A Rave #52 (Fantazia and others): https://theransomnote.com/?p=19030 **(seen, partial)**. Painted fantasy scenes plus stretched display type plus dense event info.
- David Rudnick / Terrain: https://davidrudnick.org/ **(seen; the page is minimal, and the mechanism is from his known posters)**. Hair-fine calligraphic and techno hybrids and micro-detail at poster scale.
- daisyUI "Acid Graphics" trend page: https://trends.daisyui.com/trend/acid-graphics/ **(seen)**. Treat this as the floor, not the bar: a fluorescent stretched italic `ACID`, a magenta star sticker and neon offset frames. Even this UI-trend page warps its type harder than ours.

### Where it falls short (ranked)
1. **The warp is a uniform squeeze. Severity: high.** `.ab-headline { transform: scaleX(var(--ac-sx)) }`, with `sx = 0.62` for the wide class (`acid-graphics.js` line 101). This takes Unbounded, a wide face, and squeezes it back to normal proportions. It *undoes* the face and reads as a stock condensed grotesk (A0 `GOOD DESIGN SHOULD FEEL`, deck typography slide `AA`). The refs warp non-uniformly: vertical stretch that grows across the word, bulge, envelope, letters merging.
2. **The chrome is not chrome. Severity: high.** The flyer wordmark `MARIGOLD` (my crop `adv2/ac-poster-zoom.png`) is a 4-stop grey gradient that `#acw` (`feDisplacementMap scale=30`, `baseFrequency 0.004 0.02`) shears into horizontal slices. It reads as VHS glitch or cyber. Castro and GUCCIMAZE chrome has a black horizon line, a hot white specular highlight, colour reflections from the palette, a glow and an outline echo.
3. **The ripple edges are pixel-crunchy, and the ripple is vignetted. Severity: medium.** `#acr` displaces unblurred turbulence at `scale=46`, so the band edges stair-step (visible at 2× zoom). The radial mask fades it to black at the card edges. Op-art and rave ripples are crisp-edged and run edge to edge.
4. **The density is too low. Severity: medium.** The flyer has four tidy info boxes and three sponsor marks. Below the hero, the board turns into a calm standard board (A1/A2). The refs layer micro-type (6–7px catalogue numbers, ™ slogans, katakana, barcodes, registration marks, pictogram rows) into every margin.
5. **Teal plus orange reads as film-grade "teal and orange" in the warm palette. Severity: low.** This comes from the client palette, and the computed clash is principled. But the default never shows acid's characteristic lime, magenta or violet unless the client palette supplies it. C (green) proves how much stronger the style is with a fluorescent primary.

### Off-key / cliché
- The sliced `MARIGOLD` wordmark is a glitch or cyber trope, not acid.
- The dotted `✱ ✱ ✱` rules and the faint 12-column grid lines are Swiss-techno tidy. They are fine as "the hidden calm", but there is no noise on top of them outside the hero.
- The deck patterns `neon spray` and `thermal screen` read as heat-map or aura blur, which is another aesthetic.

### Fixes (ranked)
1. **Replace the squeeze with a real stretch** in `css/aesthetics/acid-graphics.css` `.ab-headline`. Drop `scaleX(var(--ac-sx))` and keep the face's natural width with `transform: scaleY(1.18)`, `transform-origin: 0 0`, and `margin-bottom: .18em` to compensate. In `acid-graphics.js`, wrap the *last line or last word* in per-letter spans with `--i`, and set `transform: scaleY(calc(1 + var(--i) * .12))` with `transform-origin: 50% 100%` (letters grow taller left to right, the classic stretch-ramp) and `letter-spacing: -0.06em` so the outlines kiss. Keep `--ac-sx` only for the `condensed` class (1) and the phone breakpoint.
2. **Real acid chrome** on `.aca-word span`. Use `background: linear-gradient(180deg, #fff 0 14%, #c9d0d8 26%, #3a3f47 47%, #0b0c0e 50%, #f4f7fa 53%, var(--ab-clash) 66%, #e9edf1 80%, var(--ab-acid) 94%)`. Add `-webkit-text-stroke: 1px rgba(255,255,255,.85); filter: drop-shadow(0 0 .08em var(--ab-acid)) drop-shadow(.05em .05em 0 var(--ab-clash))`. Retune `#acw` so it warps smoothly instead of slicing: insert `<feGaussianBlur in="w" stdDeviation="6" result="wb"/>` and displace with `in2="wb"`, `scale="18"`, `baseFrequency="0.006 0.009"`.
3. **De-crunch the ripple** in `#acr`. Add `<feGaussianBlur stdDeviation="4">` on the turbulence before `feDisplacementMap`, lower `scale` to 34, and remove the radial `mask` on `.aca-rip` so the ripple fills the flyer edge to edge (keep it dark behind `.aca-grid` via the existing #050505 boxes).
4. **Add a micro-type density layer** in `art()`. Put a vertical spine along the flyer's right edge (`writing-mode: vertical-rl`, 7px mono, `CAT.NO ACG-030 ✱ ${brand}™ ✱ 1-800-NO-SLEEP ✱ …`). Add a 6-item pictogram and logo row instead of 3, two registration crosshairs (`⊕`) in opposite corners, a 7px katakana or ™ slogan line under the wordmark (`WORK BUY DANCE REPEAT™` style; write original copy), and a tiny barcode beside `N° 030`. On the board, extend the event strip idea with a second, reversed strip above the footer.
5. **Use acid-native accents when the client accent is weak.** In `tokens()`, if the client accent is not fluorescent (OKLCH chroma under 0.17), use a fixed `#B6FF00` for the ticket stub and the `18+` tab only. This is a single small spark, so client fidelity stays intact.
6. **Swap two deck patterns** in `js/patterns/fit.js` `'acid-graphics'`. Replace `neonspray` and `thermal` with a star-sticker scatter (burst with `rays: 8–12`, sharp, accent fill) and a stretched-type wallpaper or `oprings` second centre. Keep `warpcheck`, `burst`, `oprings` and `ribbonrise`.

### Keep
- The ticket stub `✱ ADMIT ONE 18+` with notched mask, the perforated segmented control (circle notches), and the event strip marquee. These are on-reference and well crafted.
- The equal-luminance clash computation, the hard offset shadows (5px clash), and the outline-with-offset-echo last word `ALIVE`.
- Light mode as a full-bleed acid slab (B), and the C palette result (neon green and pink). This is the strongest frame of the three.
- The deck cover band (warped check). It is the most acid thing in the deck.

### Deck
- **Typography (04):** `AA` in squeezed Unbounded demonstrates the very problem in fix 1. Show the stretch ramp and chrome instead.
- **Product (08):** a plain dark SaaS panel with no pair edge, no ticket tab and no strip. Add a clash-coloured 2px frame with a 5px offset and the ticket-tab nav.
- **Material (06):** the flyer is shown well. After fixes 2–4 this slide will carry the style.
- **Patterns (07):** see fix 6.

---

## 3. groovy-70s

**Score: 5.5 / 10. Verdict: Refine (heavy).** The concentric rainbow arch with straight legs is a correct and pleasant signature, and the wavy dividers are fine. But the type, palette mapping and components come from 2020s "retro-flavoured SaaS", not the 70s. In the period, type is the supergraphic: multiline Stripes letters, tight Cooper-weight setting, stacked contours. Our type is a single flat Shrikhand italic. The palette is literal client colours (teal and near-black) instead of an earth ramp, and the UI is pastel pill cards. The deck's do/don't even bans the decade's signature treatment.

### References
- Burger King 2021 identity by JKR (Brand New): https://www.underconsideration.com/brandnew/archives/new_logo_and_identity_for_burger_king_by_jones_knowles_ritchie.php **(seen)**, plus Creative Bloq https://creativebloq.com/design/branding/why-burger-kings-stunning-rebrand-is-still-the-best-of-the-2020s **(seen)**. The custom Flame face is Cooper-descended, tightly set and very fat, in BBQ brown, flame red and orange on cream. The modern benchmark for flat 70s.
- Man, German single covers 1973–74, set in Stripes: https://fontsinuse.com/uses/34151/man-german-single-covers-1973-1974 **(seen)**. Letters built from 5–6 parallel rounded stripes. The rainbow band *is* the type.
- Milton Wright, *Friends and Buddies* (1975, set in Stilla): https://fontsinuse.com/uses/51933/milton-wright-friends-and-buddies-album-art **(seen)**. Fat swash display, a maroon, orange, cream and brown earth palette, and a sun-disc halo.
- Alexander Girard, *Alphabet* textile (Cooper Hewitt): https://www.cooperhewitt.org/2013/09/12/alphabet/ **(seen)**. Orange slab letters packed edge to edge as texture. Type as pattern at wall scale.
- Barbara Stauffacher Solomon supergraphics (Design Milk): https://design-milk.com/the-supergraphics-collection-collab-features-art-by-iconic-barbara-stauffacher-solomon/ **(seen)**, plus the Sea Ranch archive https://searanch.ced.berkeley.edu/s/sea-ranch/page/color-nature **(text)**. Parallel multi-stripe bands that *turn corners* and wrap forms, at architectural scale.
- CARI, "Supergraphic Ultramodern": https://cari.institute/aesthetics/supergraphic-ultramodern **(seen)**. Orange, mustard and avocado stripe floors, rounded plastics and a warm analogous palette.
- Lester & Denwood, *Angela* (1974; sunrise-and-cloud display face): https://fontsinuse.com/uses/22642/lester-and-denwood-angela-single-cover **(text)**. Illustrative 3-colour letterforms in the Letraset and Mecanorma era.
- Cooper Black history (Wikipedia, and the CreativePro "Influenced by the '70s" round-up): https://en.wikipedia.org/wiki/Cooper_Black and https://creativepro.com/fonts-friday-influenced-70s **(text)**. Soft, low-contrast, phototype-tight kerning. The face of the decade.
- Braniff and Alexander Girard (DWR): https://www.dwr.com/designer-alexander-girard **(text)**. Seven solid fuselage colours: colour blocking at object scale, not tints.

### Where it falls short (ranked)
1. **The type does nothing 70s. Severity: high.** The headline is flat Shrikhand italic with a wavy underline (A0, `.ab-headline`, `.ab-hl`). The refs make the *type* the supergraphic: Stripes multiline letters, stacked outline contours in band colours, Cooper-tight setting where the letters nearly touch. The CSS header literally says "no outlines, no offset shadows" (line 5). That bans the canonical inline/outline stack.
2. **The palette mapping is literal, not an earth ramp. Severity: high.** The arch is `[primary, secondary, accent, ink]` (`groovy-70s.js` line 78): orange, **teal**, yellow, **near-black**. That reads as a kids' or Pride rainbow (A0, D), not a 70s run. Period work steps analogously (brown, rust, orange, mustard, cream), with at most one cool counter-band.
3. **The components are 2020s pastel SaaS. Severity: high.** The 26%-tinted mint card (`--ab-card-a`), peach and kraft rows, white pill input and soft halo hover (A2) look like a Headspace or Notion template. 70s product graphics use *solid* band colours with cream type, or cream panels framed by thick concentric coloured stripes (Stauffacher corner-turning stripes, Braniff solid fills).
4. **Shrikhand is the wrong default face. Severity: medium.** It is a 2015 Gujarati-inspired italic, and reads as 2010s hipster-retro. The Cooper and Flame lineage (upright, soft, fat, tight) is the period signal. `Bagel Fat One` or `Fraunces` at 900 with SOFT 100 (both already in the picks) is much closer.
5. **There is no print materiality. Severity: low to medium.** Everything is vector-flat on #F5EEE2. BK proves flat can work, but the period refs (Milton Wright, Man) have paper, slight misregister and a halftone or grain. One subtle layer would separate "70s print" from "app with retro colours".
6. **The sunburst is nearly invisible. Severity: low.** The rays behind the CTA show as a faint stub under the card edge (A2 left card). The refs' sunbursts are bold solid wedges.

### Off-key / cliché
- The deck patterns `aura` ("Aura wash", a 2020s blurred-gradient trend), `waves` ("Solarised waves", 3D tubes with beads) and `burst` (a speckled op-art dash burst) belong to the aura, 3D and op-art aesthetics.
- The pastel pill cards, white pill input and halo hover ring are generic 2020s friendly UI.
- The wavy underline on `alive` is a 2020s Instagram retro tic. The period would set the word in a contrasting band colour or on an arc.

### Fixes (ranked)
1. **Make the headline a stacked contour** in `css/aesthetics/groovy-70s.css` `.ab-headline`. Use `letter-spacing: calc(-0.035em * var(--ab-tr,1))` and `text-shadow: .035em .035em 0 var(--ab-canvas), .07em .07em 0 var(--ab-accent), .105em .105em 0 var(--ab-canvas), .14em .14em 0 var(--ab-primary)`. That gives a cream gap, mustard, cream gap, orange: a stepped multiline echo, which is the Stripes and BK-poster mechanism. Delete "no outlines, no offset shadows" from the header comment and from the do/don't in `groovy-70s.js` (line ~114 don't list). In dark mode, swap the canvas gaps for `--ab-canvas` (already dark). Replace the wavy underline on `.ab-hl` with `color: var(--ab-primary)`.
2. **Use an earth-ramp arch** in `groovy-70s.js` `art()`. Replace `bands = [primary, secondary, accent, ink]` with an analogous ramp built from primary toward accent: `[mix(primary, ink, .45) /*brown*/, primary, mix(primary, accent, .5), accent, mix(accent, canvas, .45)]`, five bands with the outermost darkest. Keep `secondary` only when its hue is within 60° of primary. Otherwise use it once as the innermost counter-band or drop it. Keep the straight legs and canvas gaps (1.5 units).
3. **Solid colour-blocked components** in `.ab-card` and `.ab-panel`. Make one card a *solid* primary fill with cream text (`background: var(--ab-primary); color: var(--ab-on-primary)`). Give the other a cream panel framed by three concentric stripes: `box-shadow: 0 0 0 6px var(--ab-primary), 0 0 0 10px var(--ab-canvas), 0 0 0 16px var(--ab-accent), 0 0 0 20px var(--ab-canvas), 0 0 0 26px var(--ab-brown)`. Keep the 36px radius so the stripes turn the corners, Stauffacher style. Make the In-use rows solid band colours (`--ab-primary`, mustard, brown) with cream text instead of 16–26% tints (`--ab-card-a/b/c` in `tokens()` lines 62–64 become full-strength or a 0.8 mix).
4. **Change the default font pairing** in `js/aesthetic-meta.js` `'groovy-70s'`: `pairings[0] = ['Bagel Fat One', 'Work Sans']`, or `['Fraunces', 'Rubik']` with `font-variation-settings: "SOFT" 100, "WONK" 0, "opsz" 144; font-weight: 900` applied in `.ab-headline`. Move Shrikhand to the third pick.
5. **Fix the sunburst** behind `.ab-cta`. Use solid `repeating-conic-gradient(from -90deg at 50% 100%, var(--ab-accent) 0 9deg, transparent 9deg 18deg)` at full opacity (not `--ab-ray` at 0.8 alpha), sized 140% of the card width and anchored to the bottom edge so it reads as a rising sun.
6. **Add one print-grain layer.** An SVG `feTurbulence` noise at `opacity: .07; mix-blend-mode: multiply` on `.ab[data-ae="groovy-70s"]::after`, with `pointer-events: none`. Optionally misregister the arch's accent band by `translate(0.6px, 0.4px)`.
7. **Replace the deck pattern suite** in `js/patterns/fit.js` `'groovy-70s'`. Drop `waves`, `burst` and `aura`. Add a corner-turning stripe (`ribbonrise` with `ring: true` reused as parallel 5-band stripes, or a new stripe-L), a solid sunburst (`burst` with `rays: 24, layers: 1, bend: 0, beads: 0`), and a daisy or flower-power tile. Keep `arcrise`, `zigzag` (wavy stripes) and `ribbonrise`.

### Keep
- The concentric arch with straight legs and canvas gaps, and the statement nested in its hollow (A0). This is a correct period motif, well drawn.
- The three-wave header and footer stripe and the warm cream canvas pulled toward #f3e6cf.
- The dark mode on warm brown #2C2120 (B) rather than black. That is right for the decade.
- The palette as stacked stripe bands (sheet column 1).

### Deck
- **Do/Don't (09):** "Add outlines or offset shadows" is listed as a *don't*. That is the opposite of the references (Stripes, Cooper posters, BK). Replace it with "Do: echo the headline in 2–3 stepped band contours".
- **Patterns (07):** `Solarised waves` (3D tubes), `Dash burst` (speckle) and `Aura wash` (blurred gradient) are off-key. See fix 7.
- **Material (06):** this is just the arch again. Show a supergraphic: a huge cropped letter in the multiline stripe treatment, or a corner-turning 5-band stripe.
- **Cover (01):** the small arch beside the headline loses the scale contrast that supergraphics live on. Make the arch bleed off the slide edge at 120% height.
- **Product (08):** this is a generic app with italic numerals and no stripes. Add the stripe-framed panel from fix 3.

---

## Fix log (fx2)

Files touched: `js/aesthetics/{corporate-vandalism,acid-graphics,groovy-70s}.js`, `css/aesthetics/{corporate-vandalism,acid-graphics,groovy-70s}.css`. Shared files untouched.

### corporate-vandalism
- Fix 1 done: Off-White literal labels (`"BUTTON"`, `"TEXT FIELD"`, `"CHECKBOX"`, `"TABS"`, `"PROJECTS"`, `"HEADLINE"`) pinned above their parts. Quotes and dagger removed from the headline; the `†` is gone.
- Fix 2 done: hazard-red `"FOR OFFICIAL USE"` tag overlaps the notice's top-right corner with a 26px black tie line (fixed colours, no rotation).
- Fix 3 done: classification banner, one fully blacked-out line, a two-line block, `(b)(6)` / `(b)(7)(C)` margin codes. Fine print shortened so the notice stays short enough for the deck cover.
- Fix 4 done: In use list is a mono-caps index `#027 #028 #029` plus `#030 ??????????????` in the resting grey.
- Fix 5 done: `tokens()` turns the official shell (button, header strips, APPROVED state) ink with a 3px primary underline when the printed primary is within 25 degrees of the hazard red. Warm palette now has an ink button; the green palette keeps its green shell.
- Fix 6 done: notice strip is fixed `#FFD500` with black text.
- Fix 7 done: headline tracking -0.02em, line-height 0.98.
- Fix 8: SHARED CHANGE (fit.js pattern suite), now landed by fx6.
- Also: form panel is a neutral grey, no brand tint (review "Off-key"); `deck.coverDisplay: 0.78` so the taller notice does not collapse the cover; deck product slide gets `"PROJECTS"` and `"BUTTON"` labels; roles / rules / deck copy updated.

### acid-graphics
- Fix 1 done: real stretch. No scaleX; the face keeps its natural width (type size scaled by `--ac-fs`), block `scaleY(--ac-sy)`; a `headline()` hook splits the last word into letters with `scaleY(1 + i * step)` from the baseline, `letter-spacing -0.06em`.
- Fix 2 done: multi-stop chrome (white top, black horizon at 50%, clash reflection, acid base), 1px white rim, acid glow, clash offset echo; `#acw` now displaces by a blurred turbulence (scale 18).
- Fix 3 done: `#acr` blurred (stdDeviation 4, scale 34); radial mask removed, the ripple runs edge to edge.
- Fix 4 done: vertical catalogue spine, six invented marks, two registration crosshairs, trademark / katakana slogan line, barcode by N° 030, micro-type on the section rules, second reversed strip above the footer.
- Fix 5 done: `--ac-spark` is `#B6FF00` when the accent is soft (HSL saturation < 70); used for the ticket stub and the deck's active nav tab only.
- Fix 6: SHARED CHANGE (fit.js), landed by fx6.
- Deck: typography `AA` is the stretch; product slide gets a clash edge, 5px acid offset and a ticket-tab nav.

### groovy-70s
- Fix 1 done: stepped echo `text-shadow` (cream gap, accent, gap, primary), tracking -0.035em; highlighted word turns primary with an inverted echo; wavy underline removed; "no outlines, no offset shadows" removed from the header comment, `rules.dont` and the deck don'ts (now "hard black outlines or stickers"); deck Do now says "Echo the headline in 2-3 stepped band contours".
- Fix 2 done: earth-ramp arch `[brown, primary, midtone, accent, pale accent]` (secondary replaces the midtone only within 60 degrees of the primary; a cool secondary is dropped); same ramp in the wave stripe, header mark and footer dot; accent band 0.6/0.4 off register.
- Fix 3 done: 01 card is a cream panel framed by three corner-turning stripes; 02 panel and type column are solid brown / accent blocks; In-use rows are solid primary, accent and brown with contrast-picked type.
- Fix 4: SHARED CHANGE (font pick), landed by fx6 (Bagel Fat One). `--ab-hw` is 900 for Fraunces (see request below).
- Fix 5 done: solid accent wedges rising from the card's bottom edge (`repeating-conic-gradient from -90deg at 50% 100%`, no mask).
- Fix 6 done: feTurbulence grain at 9% opacity (plain alpha, no blend mode, export-safe) and the misregistered accent band.
- Fix 7: SHARED CHANGE (fit.js), landed by fx6.
- Deck: cover arch drawn at supergraphic scale and cropped; product CTA card stripe-framed.
