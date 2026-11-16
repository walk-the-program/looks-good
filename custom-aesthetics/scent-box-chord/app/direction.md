# Direction: Scent Box

<!-- Copied by `node dev/lg.js direction <folder> --init`. Fill it before any style JSON or render.
Guidance lives in HTML comments; the gate and the build pack ignore comments. Replace every {{...}}.
How to think each section through: .claude/skills/ui-direction/references/thinking.md
**Sections** (1 to 5 before any render; all eight before the build pack)
1. Product truth
2. Content shape
3. The world
4. Thesis
5. Directions
6. System
7. Defaults ledger
8. Beyond the renderer
-->

## 1. Product truth

- Who and when: One collector on a Mac, at home. Two moments: the evening at the shelf deciding what to wear tomorrow (five minutes of browsing 37 fragrances by feel, accord or house), and the five seconds after buying or receiving a sample (add it, rate it later). Opened a few times a week, never in a rush.
- The moment that matters: Scanning the shelf and picking by smell. The owner thinks "something smoky and vanilla", not "Givenchy". The collection browse is the product; every other screen supports it. Adding a fragrance is the core action but it is a short chore, not the experience.
- Should feel: "clean, simple", and (owner's r1 word) "even simpler", with a quiet, personal, collected feeling: a private shelf, not a store.
- Must never feel: "really cheap and like not thought out at all" (r2): equal grey boxes, a black slab button, one font for everything, every label in tracked caps, scent colour missing. Also never like a retail site (no hero banners, no price tags), never decorated with bottle illustrations (app screens have no art).
- Owner notes so far: r1 of the earlier attempt (hairline paper): "even simpler, probably more bento box". r2 (soft grey bento tiles): "really cheap and like not thought out at all". Lesson recorded in owner-taste.md: simpler means fewer, better ideas; keep the scent colours. The current app (scent-box.html) already has a working idea the earlier styling buried: each card carries a three-colour accord strip and the drawer draws accords as coloured bars.

## 2. Content shape

| Object | What it really is | Drawn as | Not as |
| --- | --- | --- | --- |
| Accords (vanilla 100, sweet 80, woody 55 ...) | A weighted chord: parts of a whole, each with its own colour (the app maps about 80 accord names to real colours) | One bar split by weight in the accords' own colours; the top three on a shelf tile, the full chord on the detail screen | A list of "TOBACCO 100" label and value pairs, or grey percentage tiles |
| Notes (top, heart, base) | Tiers in time: what you smell first, then later, then at the end | Three bands stacked in their real order, each note a swatch in its own colour (the app's noteColor rules) | One run-on line "Top: ... Heart: ... Base: ..." |
| The 37 fragrances | A shelf with a size: 7 full bottles, 3 travel and decants, 24 samples, 3 liked and not owned | A gallery where each fragrance is a coloured object; sampler sets (d'Annam Memories of Japan, 9 samples) grouped in a tray | Six grey tiles with a house line, a name and stars |
| Format (full, travel, decant, sample) | A physical size | A mark whose size is the format (a tall bar for a bottle, a short one for a decant, a dot for a sample) | The word "Sample" in a chip |
| Rating (0 to 10 in half steps) | A scale the owner sets by feel, mostly unrated (only 5 of 37 rated) | One numeral set large on the detail screen, and a quiet scale mark on the shelf only when rated; unrated shows nothing | Five glyph stars, and "Unrated" on 32 tiles |
| Status (owned, interested, liked) | Position on the shelf, not a tag | A sidebar view with its own count; liked-not-owned sits in its own place | A chip on every row |
| Collection counts (7 bottles, 3 small, 24 samples, 18 houses) | A composition of the shelf by format | One line of the shelf as a bar split by format, or the numeral 37 large | Three equal stat tiles plus two more |

## 3. The world

| Artifact | Mechanism to take | Where it lands in the UI |
| --- | --- | --- |
| Paint and Pantone swatch cards | A colour sample is the object itself; the name is printed small beneath it, and a fan is browsed by colour | The shelf: each fragrance is a swatch whose face is its accord chord, name beneath in small type |
| The perfumer's organ and the scent pyramid | A formula is a chord stacked in tiers (top, heart, base), ordered by when you smell it | The detail screen: notes as three stacked bands in real order, accords as one weighted bar |
| Paper scent strips (blotters) dipped in a vial | A tall narrow strip carries one scent; strips are lined up and compared side by side | The shelf spectrum: every fragrance is one narrow vertical strip, 37 laid side by side |
| Apothecary and catalogue labels (Santa Maria Novella is on this shelf) | A printed label sets house and name in a fixed hierarchy, with the formula in a ruled panel | The list rows and the detail header: house line small, name larger, facts ruled below |
| The sample card and decant box (d'Annam Memories of Japan sampler) | Small vials live in a tray, counted together | Grouped samplers: one tray row with its nine strips |

Software precedents:
- Apple Music and Photos on the Mac: keep the sidebar, the gallery grid and the quiet toolbar; break the artwork as the content (here the chord is the artwork, drawn from data).
- Vivino and Fragrantica: keep accord bars coloured by accord and the top, heart, base pyramid (people already know them); break the marketplace feel, the ads and the dense text pages.
- Mail on the Mac: keep the list plus detail panes for a long list you read through; break nothing on the layout, but replace sender and date columns with a chord.

## 4. Thesis

Thesis: The shelf is a spectrum: every fragrance is drawn as its own accord chord in the scents' real colours, split by weight, and the interface around it is neutral, small and quiet.
Tension: Personal but proficient: the colour and the display type carry the personality; the sidebar, lists, fields and toolbar stay plain and exact.
Signature: The accord chord, a bar split by weight in each scent's own colours. It sits on the shelf tile and list row of every fragrance and as the big bar on the detail screen. It comes from the app's own data (accords with strengths and colours), and with the logo covered it still says "fragrance".
Principles:
1. Colour belongs to the scents; the interface owns none. Chrome is neutral, and the one brand accent appears only on the primary action.
2. A fragrance is shown by its chord first and its name second; a number or label appears only where the owner would otherwise have to ask.
3. Parts of a whole are drawn as a split bar (accords, notes in tiers, the shelf by format), never as tiles of numbers.
4. A Mac window uses its width: sidebar, content and an inspector or grid. Never a centred phone column.
5. Simple means removing chrome, not removing ideas: no boxes around things that are not objects, no labels the value already explains.

## 5. Directions

### A. Swatch Shelf
- Thesis: The shelf is a fan of swatches: a gallery of tiles whose faces are each fragrance's accord chord, on a quiet paper ground with a sidebar.
- Structure: Mac sidebar (All, Owned with the format split beneath it, Interested, Liked, Houses), a gallery grid of 4 to 5 columns in the content area, detail as an inspector pane on the right. Primary action in the toolbar's trailing edge. Medium density, built for scanning.
- Type: Newsreader for fragrance names and the screen title (the house names on the real labels are printed serifs, and a text serif gives names a printed warmth); Instrument Sans for everything else. House names in small caps, not tracked, on one role only. Names about 2.5 times the body size on the detail.
- Colour: Content-led. Warm paper neutrals (light) and warm charcoal (dark); the accord colours fill the swatch faces; one deep brass accent only on the Add button.
- Material: Flat paper tiles with square-ish 6px corners and no shadow; fields are underlined; selection is a 2px ink edge on the swatch, not a grey tint.
- Signature: The swatch tile: the upper two thirds of every tile is the chord in colour, the name below it.

### B. Label Ledger
- Thesis: The shelf is a catalogue: ruled rows set like apothecary labels, and the detail is a scent strip dipped in its accord bands beside the notes in their three tiers.
- Structure: Three panes like Mail: a slim filter column, a ruled list of one row per fragrance (house in small caps, name, a thin chord strip, format mark, rating), and a detail pane on the right. Dense, built for working through 37 rows. Add lives in the toolbar; fields in a ruled form sheet.
- Type: Libre Caslon Text for names and headings (printed label voice); Source Sans 3 for facts, so the facts column reads as a ruled panel. Small caps for houses; numerals tabular.
- Colour: Tonal. Warm cream paper and one oxblood ink for rules, selection and the primary action; the accord colours appear only inside the chord strips and the scent-strip. The dark mode is a warm brown-black ledger.
- Material: Ruled paper: hairlines are deliberate here because a ledger has them; no cards at all; selection is an oxblood bar at the row's left edge plus bold weight.
- Signature: The scent strip on the detail screen: a tall narrow blotter standing at the left of the detail, banded in the accord colours by weight, with the notes pyramid as three ruled tiers beside it.

### C. Spectrum
- Thesis: The shelf is one spectrum: all 37 fragrances laid side by side as vertical colour strips on a dark ground, with the name of whichever you point at set huge.
- Structure: Top toolbar with tabs instead of a sidebar. The Collection screen is mostly the spectrum: 37 strips grouped by house with the numeral 37 large; the focused fragrance is read out beneath (name very large, chord facts small). Sparse, one idea per screen. Detail fills the window: the chord as a full-height colour field, the name huge.
- Type: Bricolage Grotesque in a heavy weight for names and the numeral (a loud, characterful grotesque, the voice the owner picks when offered the loudest option); Inter Tight small for facts.
- Colour: Content-led and loud: a near-black ground with the accord colours at full saturation as the only colour; a white primary action. Light mode inverts to a pale ground with the same strips.
- Material: No containers: colour fields with zero radius, edges butted together; controls are text with an underline; selection is the strip rising 12px above its neighbours.
- Signature: The shelf spectrum: all 37 fragrances as one row of strips that the eye reads like a barcode of the whole collection.

Chosen: C+B. C's spectrum is the shelf screen and B's scent strip is the detail screen, in C's type and colour voice (a heavy grotesque on a dark ground, no containers, no tracked caps). I take C because it is the only direction whose signature argues the thesis alone: 37 strips read as one object, they carry the product's own accord colours, and it is the loud, structural idea this owner tends to pick. I take B's detail because a tall blotter strip beside three tiers of notes makes the single fragrance the same object as the shelf at one scale. I drop A (swatch tiles): it is a tasteful default and a bento grid with colour, the family the owner already rejected. I drop B's ruled ledger rows, dotted rules and oxblood: tracked caps, rules under every row and a second brand colour fight the "interface owns no colour" principle.

## 6. System

### Layout
Mac window, no sidebar. A top toolbar carries the wordmark, the four views as underlined text tabs (All, Owned, Interested, Liked, each with its count), search as an underlined field, and Add fragrance as the trailing bold word. Beneath it the Shelf is one wide band: the numeral 37 at about half the spectrum's height, then the spectrum across the full width (strips grouped by house, a short monogram under each group, the d'Annam sampler kept as one group), then a readout for the focused fragrance (house, name set huge, five accord labels, the rating numeral at the right), and the shelf split by format as a thin bar along the foot. The fragrance screen is a three-column Mac layout: a tall scent strip (a full-height chord), the name, description and rating numeral, then notes as three bands and the accords as a weighted bar. The primary action (Add fragrance, Save, Save fragrance) is always the toolbar's trailing edge, never a slab in content.

### Type
Bricolage Grotesque 800 with tight tracking (-0.035em, leading 0.92) for the shelf count, fragrance names and the rating; Inter Tight for everything else. Scale: the rating numeral 150px, names 64 to 92px, the shelf count 84px, facts 14 to 15px, strip labels 11px. House names and group labels are sentence case, never tracked capitals. Numerals are tabular. Each style has one job: heavy grotesque = a name or one number; Inter Tight 600 = the primary action and the selected tab; Inter Tight 400 muted = facts and labels.

### Colour
Content-led: the only saturated colour on any screen is the accord colours, taken from the app's own accord map (vanilla cream, tobacco brown, amber orange, warm spicy red and so on), drawn at full strength in both modes. The chrome is the ground and one ink: near-black #121111 with ink #f1eee8 in dark (the default), warm off-white #ece9e4 with ink #0b0a0a in light. The brand colour owns nothing; selection and the primary action are ink. Chords never take a tint of the ink; where an accord is near the ground colour (white floral, lactonic) a 1px edge keeps it visible. Dark is designed, not inverted: the ground is a step off black and the strips keep their hues.

### Material and shape
No containers. Strips, bands and the format bar are flat colour fields with square corners and a 1px edge, no shadow, no radius. Controls are text: tabs and segmented controls are small text with a 2px underline when selected; fields are text over a 1px ink underline; buttons are bold or regular words with no box. Holding surfaces (cards, panels, list rows) are the ground itself; groups are separated by space and one hairline only where a list needs it. Radius family: zero.

### Motion
Press: opacity drops to 70% over 90 ms, ease-out. Select: the selected tab's underline and weight change over 140 ms; the selected strip rises 12px and shows a 3px ink tick beneath it over 140 ms, which is the signature moment. Nothing else moves; no ambient motion.

### Words
The product's own vocabulary: Shelf (not Items), Add fragrance, Interested, Liked, Owned, Samples, Full bottle, my rating, Notes in the order you smell them, Accords by weight. Empty shelf: "Nothing on the shelf yet. Add the first bottle, decant or sample." and the format bar shows a blank track. First fragrance added: its strip appears at the left of its house group.

### Craft
One strong left edge at 40px that the numeral, strips, name and facts all align to. Inner gaps (strip to strip 2px, tick to label) are far smaller than outer gaps (house group 10px, band to readout 24px) so groups read without boxes. Selected state reads without colour: weight plus a 2px underline for tabs, a 3px ink bar for list rows, the strip rising for the shelf. One icon set at 1.5pt only where text cannot say it (search, more); no arrows on buttons.

## 7. Defaults ledger

| Reflex | Decision | Why, for this product |
| --- | --- | --- |
| One neutral sans for everything (Inter, DM Sans, Geist, Manrope, SF) | change | Names and numbers are Bricolage Grotesque 800 so the fragrance reads as the loud object; Inter Tight carries facts only, which is the contrast the earlier DM Sans-only round lacked. |
| Tracked uppercase micro-labels above values | change | Labels are sentence case and often removed: "on the shelf" beside the numeral says what 37 is, and the strips' monograms replace a "HOUSE" caption. |
| Every group in a card, all cards the same fill and radius | change | Nothing is boxed; the fragrance is a strip and the group is its house, so the grey equal boxes the owner called cheap are gone. |
| Radius 12 to 20 on everything | change | Radius is zero: strips are cut like paint chips and blotter paper, which are rectangles. |
| Off-white canvas, near-black ink, one muted accent | keep | Content brings all the colour (accords), so the chrome should disappear into near-black and ink, and there is no accent at all. |
| Full-width pill primary button inside the content | change | The primary action is a bold word at the toolbar's trailing edge, the Mac convention; no slab in content. |
| An icon on a button that adds no meaning | change | Buttons are words; the one arrow the renderer adds to the primary is neutralised with a blank glyph and the mocks carry none. |
| Numbers in stat tiles | change | The 7 / 3 / 24 split is one bar split by format, the shelf total is one large numeral, and the rating is one numeral, never tiles. |
| Ratings as text glyphs | change | The rating is a single large numeral (8.5, 9) because the owner scores by feel out of 10 and most fragrances are unrated; unrated shows nothing. |
| A Mac window drawn as one centred column | change | The shelf spans the window and the detail is three columns; the renderer's column is a preview limit, the mocks show the real layout. |
| Grey tint as the selected state | change | Selection is weight plus an underline, a 3px bar on rows, and the strip rising with a tick, all visible without colour. |
| A hairline under every row | change | Rows keep no rules; only the selected row has a bar, and the spectrum has none at all. |
| Soft blurred drop shadow | change | No shadows anywhere; depth would fight the flat colour strips. |
| Chips for every tag | change | Accords are colour in a bar and notes are colour swatches in three bands; no pills. |
| Section headers as one plain word | change | Headers are the product's phrases: "Notes, in the order you smell them", "Accords, by weight". |
| Empty state as "No X yet" plus a button | change | "Nothing on the shelf yet. Add the first bottle, decant or sample." with an empty format track, so the screen shows what it will become. |

## 8. Beyond the renderer

| Idea | Why it matters | Mock |
| --- | --- | --- |
| The shelf spectrum (mock only: the renderer draws no accord colour, and a one-hue tile ramp would misrepresent it, so the sheet shows accords as words): 37 strips, each fragrance's accord chord, grouped by house with monograms, focused strip rising, readout beneath | It is the signature and the whole shelf screen; the renderer can only draw a one-colour tile strip in a single column | mocks/shelf.html |
| The fragrance screen (mock only, chord and note colours included): tall scent strip, notes as three colour bands, accords as one labelled weighted bar, one large rating numeral | The chord and the notes pyramid are the product's content shape; the renderer lists them as rows | mocks/fragrance.html |
| Add fragrance (mock only) with a live chord preview in accord colours as the accords field is typed | It makes a typed string visible as the thing the shelf will show; the renderer cannot colour a typed value | mocks/add-fragrance.html |
