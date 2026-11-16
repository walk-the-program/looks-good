> DRAFT: not for building. The direction and refinement gates have not passed (node dev/lg.js direction custom-aesthetics/scent-box-chord).

# Scent Box build pack

## Direction (read before building)

### 1. Product truth

- Who and when: One collector on a Mac, at home. Two moments: the evening at the shelf deciding what to wear tomorrow (five minutes of browsing 37 fragrances by feel, accord or house), and the five seconds after buying or receiving a sample (add it, rate it later). Opened a few times a week, never in a rush.
- The moment that matters: Scanning the shelf and picking by smell. The owner thinks "something smoky and vanilla", not "Givenchy". The collection browse is the product; every other screen supports it. Adding a fragrance is the core action but it is a short chore, not the experience.
- Should feel: "clean, simple", and (owner's r1 word) "even simpler", with a quiet, personal, collected feeling: a private shelf, not a store.
- Must never feel: "really cheap and like not thought out at all" (r2): equal grey boxes, a black slab button, one font for everything, every label in tracked caps, scent colour missing. Also never like a retail site (no hero banners, no price tags), never decorated with bottle illustrations (app screens have no art).
- Owner notes so far: r1 of the earlier attempt (hairline paper): "even simpler, probably more bento box". r2 (soft grey bento tiles): "really cheap and like not thought out at all". Lesson recorded in owner-taste.md: simpler means fewer, better ideas; keep the scent colours. The current app (scent-box.html) already has a working idea the earlier styling buried: each card carries a three-colour accord strip and the drawer draws accords as coloured bars.

### 2. Content shape

| Object | What it really is | Drawn as | Not as |
| --- | --- | --- | --- |
| Accords (vanilla 100, sweet 80, woody 55 ...) | A weighted chord: parts of a whole, each with its own colour (the app maps about 80 accord names to real colours) | One bar split by weight in the accords' own colours; the top three on a shelf tile, the full chord on the detail screen | A list of "TOBACCO 100" label and value pairs, or grey percentage tiles |
| Notes (top, heart, base) | Tiers in time: what you smell first, then later, then at the end | Three bands stacked in their real order, each note a swatch in its own colour (the app's noteColor rules) | One run-on line "Top: ... Heart: ... Base: ..." |
| The 37 fragrances | A shelf with a size: 7 full bottles, 3 travel and decants, 24 samples, 3 liked and not owned | A gallery where each fragrance is a coloured object; sampler sets (d'Annam Memories of Japan, 9 samples) grouped in a tray | Six grey tiles with a house line, a name and stars |
| Format (full, travel, decant, sample) | A physical size | A mark whose size is the format (a tall bar for a bottle, a short one for a decant, a dot for a sample) | The word "Sample" in a chip |
| Rating (0 to 10 in half steps) | A scale the owner sets by feel, mostly unrated (only 5 of 37 rated) | One numeral set large on the detail screen, and a quiet scale mark on the shelf only when rated; unrated shows nothing | Five glyph stars, and "Unrated" on 32 tiles |
| Status (owned, interested, liked) | Position on the shelf, not a tag | A sidebar view with its own count; liked-not-owned sits in its own place | A chip on every row |
| Collection counts (7 bottles, 3 small, 24 samples, 18 houses) | A composition of the shelf by format | One line of the shelf as a bar split by format, or the numeral 37 large | Three equal stat tiles plus two more |

### 3. The world

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

### 4. Thesis

Thesis: The shelf is a spectrum: every fragrance is drawn as its own accord chord in the scents' real colours, split by weight, and the interface around it is neutral, small and quiet.
Tension: Personal but proficient: the colour and the display type carry the personality; the sidebar, lists, fields and toolbar stay plain and exact.
Signature: The accord chord, a bar split by weight in each scent's own colours. It sits on the shelf tile and list row of every fragrance and as the big bar on the detail screen. It comes from the app's own data (accords with strengths and colours), and with the logo covered it still says "fragrance".
Principles:
1. Colour belongs to the scents; the interface owns none. Chrome is neutral, and the one brand accent appears only on the primary action.
2. A fragrance is shown by its chord first and its name second; a number or label appears only where the owner would otherwise have to ask.
3. Parts of a whole are drawn as a split bar (accords, notes in tiers, the shelf by format), never as tiles of numbers.
4. A Mac window uses its width: sidebar, content and an inspector or grid. Never a centred phone column.
5. Simple means removing chrome, not removing ideas: no boxes around things that are not objects, no labels the value already explains.

### 5. Directions

#### A. Swatch Shelf
- Thesis: The shelf is a fan of swatches: a gallery of tiles whose faces are each fragrance's accord chord, on a quiet paper ground with a sidebar.
- Structure: Mac sidebar (All, Owned with the format split beneath it, Interested, Liked, Houses), a gallery grid of 4 to 5 columns in the content area, detail as an inspector pane on the right. Primary action in the toolbar's trailing edge. Medium density, built for scanning.
- Type: Newsreader for fragrance names and the screen title (the house names on the real labels are printed serifs, and a text serif gives names a printed warmth); Instrument Sans for everything else. House names in small caps, not tracked, on one role only. Names about 2.5 times the body size on the detail.
- Colour: Content-led. Warm paper neutrals (light) and warm charcoal (dark); the accord colours fill the swatch faces; one deep brass accent only on the Add button.
- Material: Flat paper tiles with square-ish 6px corners and no shadow; fields are underlined; selection is a 2px ink edge on the swatch, not a grey tint.
- Signature: The swatch tile: the upper two thirds of every tile is the chord in colour, the name below it.

#### B. Label Ledger
- Thesis: The shelf is a catalogue: ruled rows set like apothecary labels, and the detail is a scent strip dipped in its accord bands beside the notes in their three tiers.
- Structure: Three panes like Mail: a slim filter column, a ruled list of one row per fragrance (house in small caps, name, a thin chord strip, format mark, rating), and a detail pane on the right. Dense, built for working through 37 rows. Add lives in the toolbar; fields in a ruled form sheet.
- Type: Libre Caslon Text for names and headings (printed label voice); Source Sans 3 for facts, so the facts column reads as a ruled panel. Small caps for houses; numerals tabular.
- Colour: Tonal. Warm cream paper and one oxblood ink for rules, selection and the primary action; the accord colours appear only inside the chord strips and the scent-strip. The dark mode is a warm brown-black ledger.
- Material: Ruled paper: hairlines are deliberate here because a ledger has them; no cards at all; selection is an oxblood bar at the row's left edge plus bold weight.
- Signature: The scent strip on the detail screen: a tall narrow blotter standing at the left of the detail, banded in the accord colours by weight, with the notes pyramid as three ruled tiers beside it.

#### C. Spectrum
- Thesis: The shelf is one spectrum: all 37 fragrances laid side by side as vertical colour strips on a dark ground, with the name of whichever you point at set huge.
- Structure: Top toolbar with tabs instead of a sidebar. The Collection screen is mostly the spectrum: 37 strips grouped by house with the numeral 37 large; the focused fragrance is read out beneath (name very large, chord facts small). Sparse, one idea per screen. Detail fills the window: the chord as a full-height colour field, the name huge.
- Type: Bricolage Grotesque in a heavy weight for names and the numeral (a loud, characterful grotesque, the voice the owner picks when offered the loudest option); Inter Tight small for facts.
- Colour: Content-led and loud: a near-black ground with the accord colours at full saturation as the only colour; a white primary action. Light mode inverts to a pale ground with the same strips.
- Material: No containers: colour fields with zero radius, edges butted together; controls are text with an underline; selection is the strip rising 12px above its neighbours.
- Signature: The shelf spectrum: all 37 fragrances as one row of strips that the eye reads like a barcode of the whole collection.

Chosen: C+B. C's spectrum is the shelf screen and B's scent strip is the detail screen, in C's type and colour voice (a heavy grotesque on a dark ground, no containers, no tracked caps). I take C because it is the only direction whose signature argues the thesis alone: 37 strips read as one object, they carry the product's own accord colours, and it is the loud, structural idea this owner tends to pick. I take B's detail because a tall blotter strip beside three tiers of notes makes the single fragrance the same object as the shelf at one scale. I drop A (swatch tiles): it is a tasteful default and a bento grid with colour, the family the owner already rejected. I drop B's ruled ledger rows, dotted rules and oxblood: tracked caps, rules under every row and a second brand colour fight the "interface owns no colour" principle.

### 6. System

#### Layout
Mac window, no sidebar. A top toolbar carries the wordmark, the four views as underlined text tabs (All, Owned, Interested, Liked, each with its count), search as an underlined field, and Add fragrance as the trailing bold word. Beneath it the Shelf is one wide band: the numeral 37 at about half the spectrum's height, then the spectrum across the full width (strips grouped by house, a short monogram under each group, the d'Annam sampler kept as one group), then a readout for the focused fragrance (house, name set huge, five accord labels, the rating numeral at the right), and the shelf split by format as a thin bar along the foot. The fragrance screen is a three-column Mac layout: a tall scent strip (a full-height chord), the name, description and rating numeral, then notes as three bands and the accords as a weighted bar. The primary action (Add fragrance, Save, Save fragrance) is always the toolbar's trailing edge, never a slab in content.

#### Type
Bricolage Grotesque 800 with tight tracking (-0.035em, leading 0.92) for the shelf count, fragrance names and the rating; Inter Tight for everything else. Scale: the rating numeral 150px, names 64 to 92px, the shelf count 84px, facts 14 to 15px, strip labels 11px. House names and group labels are sentence case, never tracked capitals. Numerals are tabular. Each style has one job: heavy grotesque = a name or one number; Inter Tight 600 = the primary action and the selected tab; Inter Tight 400 muted = facts and labels.

#### Colour
Content-led: the only saturated colour on any screen is the accord colours, taken from the app's own accord map (vanilla cream, tobacco brown, amber orange, warm spicy red and so on), drawn at full strength in both modes. The chrome is the ground and one ink: near-black #121111 with ink #f1eee8 in dark (the default), warm off-white #ece9e4 with ink #0b0a0a in light. The brand colour owns nothing; selection and the primary action are ink. Chords never take a tint of the ink; where an accord is near the ground colour (white floral, lactonic) a 1px edge keeps it visible. Dark is designed, not inverted: the ground is a step off black and the strips keep their hues.

#### Material and shape
No containers. Strips, bands and the format bar are flat colour fields with square corners and a 1px edge, no shadow, no radius. Controls are text: tabs and segmented controls are small text with a 2px underline when selected; fields are text over a 1px ink underline; buttons are bold or regular words with no box. Holding surfaces (cards, panels, list rows) are the ground itself; groups are separated by space and one hairline only where a list needs it. Radius family: zero.

#### Motion
Press: opacity drops to 70% over 90 ms, ease-out. Select: the selected tab's underline and weight change over 140 ms; the selected strip rises 12px and shows a 3px ink tick beneath it over 140 ms, which is the signature moment. Nothing else moves; no ambient motion.

#### Words
The product's own vocabulary: Shelf (not Items), Add fragrance, Interested, Liked, Owned, Samples, Full bottle, my rating, Notes in the order you smell them, Accords by weight. Empty shelf: "Nothing on the shelf yet. Add the first bottle, decant or sample." and the format bar shows a blank track. First fragrance added: its strip appears at the left of its house group.

#### Craft
One strong left edge at 40px that the numeral, strips, name and facts all align to. Inner gaps (strip to strip 2px, tick to label) are far smaller than outer gaps (house group 10px, band to readout 24px) so groups read without boxes. Selected state reads without colour: weight plus a 2px underline for tabs, a 3px ink bar for list rows, the strip rising for the shelf. One icon set at 1.5pt only where text cannot say it (search, more); no arrows on buttons.

### 7. Defaults ledger

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

### 8. Beyond the renderer

| Idea | Why it matters | Mock |
| --- | --- | --- |
| The shelf spectrum (mock only: the renderer draws no accord colour, and a one-hue tile ramp would misrepresent it, so the sheet shows accords as words): 37 strips, each fragrance's accord chord, grouped by house with monograms, focused strip rising, readout beneath | It is the signature and the whole shelf screen; the renderer can only draw a one-colour tile strip in a single column | mocks/shelf.html |
| The fragrance screen (mock only, chord and note colours included): tall scent strip, notes as three colour bands, accords as one labelled weighted bar, one large rating numeral | The chord and the notes pyramid are the product's content shape; the renderer lists them as rows | mocks/fragrance.html |
| Add fragrance (mock only) with a live chord preview in accord colours as the accords field is typed | It makes a typed string visible as the thing the shelf will show; the renderer cannot colour a typed value | mocks/add-fragrance.html |

Latest critic review: app/reviews/r7.json (verdict refine)

Everything an AI coding agent needs to rebuild the Scent Box app UI in the Scent Box Chord style for Web (HTML and CSS): the brief, the design tokens, the real code that draws the UI kit and screens and the logo, with a prompt at the top that says how to use it. Generated by Looks Good.

## Contents

1. [Part 0: How to use this file (prompt for the agent)](#part-0-how-to-use-this-file-prompt-for-the-agent)
2. [Part 1: Brand brief](#part-1-brand-brief)
3. [Part 2: Design tokens](#part-2-design-tokens)
4. [Part 3: UI kit source](#part-3-ui-kit-source)
5. [Part 4: Screen layouts](#part-4-screen-layouts)
6. [Part 5: Patterns](#part-5-patterns)
7. [Part 6: Logo](#part-6-logo)
8. [Part 7: Verification checklist](#part-7-verification-checklist)

## Part 0: How to use this file (prompt for the agent)

This section is addressed to you, the AI coding agent. Read it first and follow it exactly. It tells you what this file is, which part wins when two disagree, what to do in what order, and what to report when you finish.

**What this file is.** The build pack for Scent Box: App UI, Scent Box Chord style, for Web (HTML and CSS). It holds the brand brief (Part 1), the design tokens (Part 2), the real CSS and reference markup that draw every UI kit component (Part 3) and every screen layout (Part 4), the logo (Part 6) and a checklist you must pass (Part 7). Everything you need is here; do not redraw anything from memory and do not invent values this file does not give.

**Authority order.** When two things in this file disagree, the earlier one wins:

1. Part 1 brief rules: what is allowed, where, and why.
2. Part 2 tokens: the only colours, type faces and spacing values you may use.
3. Part 3 component CSS values (`kit.css`): every colour, size, radius, border, shadow and type setting of every component.
4. Part 3 and Part 4 reference markup: illustrative. It shows structure and intent; class names are Looks Good's own, and the demo copy ("Brand refresh", "Maya Ortiz") is placeholder text.

**Steps.**

1. Save this file in the project root as `BUILD-PACK.md`, and read Part 1 completely before writing code.
2. Create the token file from Part 2 (`tokens.css`: CSS custom properties, light and dark) in the project's stack (plain CSS, Tailwind theme, CSS modules). Keep the token names; every colour in the project comes from them.
3. Build each UI kit component from Part 3 by porting the `kit.css` values exactly into the project's styling system. You may rename the Looks Good class names (`ab-*`, `sb-k-*`, `sb-*`) to the project's own conventions, but keep every value: colours, sizes, radii, borders, shadows, type, spacing and every state (rest, pressed, focus, disabled, open and so on). The selectors are scoped to the kit root described in Part 3; keep the same scoping or fold it into your own. The custom properties `kit.css` reads are resolved in Part 2.
4. Assemble screens from Part 4: each layout names its blocks in order, its rules, and gives the reference markup of the phone screen. Spacing, the 44pt tap target and the type scale come from Part 1 and do not change per screen.
5. Patterns are out of scope for this build: it is an App, and app screens carry no patterns or art.
6. Place the logo from Part 6 at the sizes and positions Part 1 gives.
7. Finish with the Part 7 checklist: go through every item, fix what fails, and do not call the work done until all of it passes.

**Hard rules** (they repeat Part 1 on purpose).

- No colour outside the tokens. No gradient, opacity or tint that is not derived from them as Part 1 says.
- No art and no patterns in app UI: app screens are built from the UI kit only.
- The demo copy in the reference markup ("Brand refresh", "Maya Ortiz" and the like) is placeholder: replace it with the product's real text, but keep the structure and length discipline.
- Keep the 44pt minimum tap target and the phone type scale (sizes, line heights, weights) exactly as Part 1 gives them.
- Match both light and dark exactly as the tokens define them; the dark palette is designed, not inverted.

**Report back** when you finish: (1) the files you created or changed; (2) which Part 7 items pass, and for any that do not, why; (3) every place you could not match a Part 3 value or a Part 1 rule, and what you used instead; (4) any placeholder copy you left in.

## Part 1: Brand brief

The full AI brief for this brand, unchanged apart from its headings being one step deeper. It holds the rules: colours and where each is used, type, shape, states, motion, accessibility and what is allowed where. Where anything in this file conflicts with it, the brief wins.

### Scent Box — build brief
Build the real product from this brief, not a mock-up. Sections are marked Locked, Guided or Free. Locked values are final: use only these colors, fonts, shapes and motion, and where one is missing use the nearest listed token. Guided sections give an intent and a range; stay inside them. Free means design it for this product: layout, screen structure and how many sections a screen has. Screens are composed from the UI kit below, one component for each need; do not invent new component styles, and do not copy the brand board's layout. Target: a phone app in HTML and CSS, laid out in iOS points (1pt = 1 CSS px).
Scent Box: Thoughtful by design. Aesthetic: Scent Box Chord (Spectral · Bare · Loud; Paint-chip fans and barcode-like colour strips; the perfumer's accord chord; Swiss grotesque posters set huge on a dark ground). A bare dark interface where every fragrance is a strip of its own accord colours, split by weight, and nothing else on screen owns a colour. The shelf is a spectrum.
Product: Scent Box. A personal fragrance collection: what I own, what I want and what I liked, with every scent drawn as its accords in their own colours.

#### App UI rules (Guided)
Build every screen from the UI kit only. The brand shows up through colour, type, corners, edges, shadow and how each component is drawn. Never put the board's hero illustration, deck art, patterns, textures, decorative bands or header art into app screens. The logo appears at icon size in the top bar or on the welcome screen, nowhere else. Images appear only when they are content (a user photo, a product photo). Never introduce a colour that is not in the palette: destructive and status colours come from it too.
The brand board, deck and landing page show art for the brand's identity and marketing; none of it belongs in the app.
Screens are composed from the UI kit and the phone layout below: pick the component for the need, set text in the type scale, and leave the rest to the tokens.
Focus rings appear on keyboard focus only (`:focus-visible` on the web, the system focus on SwiftUI), never on tap or click; disabled controls take no focus and no press response.

##### How Scent Box Chord shows up in the app
- Corners: buttons square, fields square, cards square, badges pill.
- Surfaces: card unfilled; list rows unfilled; bottom sheet unfilled.
- Type: welcome title Bricolage Grotesque (display) 800, tracking -0.04em; section labels Inter Tight (body) 400; button labels Inter Tight (body) 600.
- Primary and selection: the primary button is none with a --ink label; the selected segment is none; the selected tab shows a 16x3pt --primary pill, near the bottom of the box, centred.
- Signature details: toggle: a 21pt --canvas dot, vertically centred in the box, at the left; pie menu: a 152pt --ink at 3% dot with a 1pt solid --line edge, vertically centred in the box, centred; skeleton screen: a smooth fade of --canvas at 55% at 90° to transparent (a soft gloss, no hard line).

#### Colors (Locked)
| Token | Dark (default) | Light | Job | On (text and icons on it) |
| --- | --- | --- | --- | --- |
| `--canvas` | `#121111` | `#ece9e4` | The screen background. | `--ink` #f1eee8 / #0b0a0a |
| `--ink` | `#f1eee8` | `#0b0a0a` | Default text and icons. | none |
| `--muted` | `#989692` | `#656361` | Secondary text from the palette. In the UI kit: not drawn by any component. `--ab-muted` is Scent Box Chord's own muted colour for the components its row lists; use each only where stated. | none |
| `--line` | `#333231` | `#cac8c3` | Hairlines, dividers, resting input borders. | none |
| `--primary` | `#8a847a` | `#8a847a` | Main action. In the UI kit: Text field (focus); Search field (focus); Checkbox (fill); Radio (fill); Toggle (fill); Divider and section label (rule); Tab bar (selected); Badge and tag (accent); Link (focus); Combo box (open); Knob (arc, dial); Date picker (focus); Wheel picker (fill); Wheel-style date picker (fill); Navigation bar (selected); Anchor links (selected); Scrollbar (fill); Pie menu (hub); Spinner (fill). | `--on-primary` #141414 |
| `--accent-ink` | `#e8a02c` | `#0b0a0a` | The accent as text when it reaches 3:1 on the canvas; otherwise the ink, with the exact accent as a marker behind the word. Never a shaded or tinted accent. | none |
| `--pri-tint` | `#201f1e` | `#e0ddd7` | Quiet primary wash: selected background, hover on primary-linked items. | `--ink` #f1eee8 / #0b0a0a |
| `--error` | `#f1eee8` | `#0b0a0a` | Errors and destructive actions; never a stock red. In the UI kit: drawn as `--ink` (the same value here) wherever a kit row shows an error or destructive state. | `--on-error` #121111 / #ece9e4 |
| `--kit-primary` | `#b7b5b1` | `#3f3d3c` | Measured from the UI kit in light and dark. Drawn by: Primary button, Secondary button, Text field, Search field, Checkbox, Toggle, List rows, Tab bar, Empty state, Icon, Input stepper, Knob, Date picker, Calendar picker, Wheel picker, Wheel-style date picker, Accordion, 2D matrix, Navigation bar, Anchor links, Spinner, screens. | none |
| `--ab-muted` | `#a19f9b` | `#535150` | A colour of Scent Box Chord's UI kit. Drawn by: Segmented control, Divider and section label, Tabs, 2D matrix, Anchor links, Megamenu, Ribbon, screens. | none |
| `--info-icon` | `#8a847a` | `#7d786f` | Info callout icon, 3:1 on its tint. Drawn by: Callout. | none |
| `--kit-callout` | `#6b6967` | `#7c7a77` | Measured from the UI kit in light and dark. Drawn by: Callout. | none |
| `--primary-text` | `#8a847a` | `#6a665e` | The primary as text and small icons (text buttons, tinted icons), shaded to 4.5:1 on the canvas. Drawn by: Carousel, screens. | none |
| `--black` | `#000000` | `#000000` | Pure black, where the UI kit draws it. Drawn by: Dialog, Side sheet, Drawer menu. | none |
| `--kit-toast-text` | `#7d7c7c` | `#6a6967` | Text of this component, kept at 4.5:1 on its fill in both modes. Drawn by: kit details. | none |
| `--kit-stepper-text` | `#807f7e` | `#3b3a38` | Text of this component, kept at 4.5:1 on its fill in both modes. Drawn by: kit details. | none |
| `--kit-calendar-text` | `#7e7e7e` | `#141414` | Text of this component, kept at 4.5:1 on its fill in both modes. Drawn by: kit details. | none |
| `--kit-wheel-text` | `#181817` | `#0b0a0a` | Text of this component, kept at 4.5:1 on its fill in both modes. Drawn by: kit details. | none |
| `--kit-wheel-date-text` | `#181817` | `#0b0a0a` | Text of this component, kept at 4.5:1 on its fill in both modes. Drawn by: kit details. | none |
| `--kit-popup-tip-text` | `#7d7c7c` | `#6a6967` | Text of this component, kept at 4.5:1 on its fill in both modes. Drawn by: kit details. | none |
| `--kit-lightbox-text` | `#7d7c7c` | `#6a6967` | Text of this component, kept at 4.5:1 on its fill in both modes. Drawn by: kit details. | none |
| `--kit-spinner-text` | `#1c1b1a` | `#1c1c1b` | Text of this component, kept at 4.5:1 on its fill in both modes. Drawn by: kit details. | none |
| `--kit-title-tile` | `rgba(0, 0, 0, 0)` | `#e8a02c` | Measured from the UI kit in light and dark. Drawn by: screens. | none |
| `--kit-feature` | `#8a847a` | `#645f58` | Measured from the UI kit in light and dark. Drawn by: screens. | none |
Where this aesthetic's colour rules and a component description disagree, the colour rules win.
Palette colours no app component draws (brand board and app icon only; they stay in `:root`): `--secondary` #2a2623, `--accent` #e8a02c, `--sec-tint` #cdcac5 / #161414, `--kit-stepper` #3b3a38.
- Primary budget: `--primary` appears only where the UI kit draws it (Text field, Search field, Checkbox, Radio, Toggle, Divider and section label, Tab bar, Badge and tag, Link, Combo box, Knob, Date picker, Wheel picker, Wheel-style date picker, Navigation bar, Anchor links, Scrollbar, Pie menu, Spinner), never as extra fills, text or rules. Selection, toggles, tabs and focus are drawn as their kit rows say, not in extra primary.
- Highlight word: use the brand's tagline unchanged as the welcome title (never reword it) and highlight its last word together with any full stop, wrapped in one span with `white-space: nowrap`; draw it as the Built Welcome screen does: text --accent-ink, a --kit-title-tile band covering the lower 38% of the word's height (a hard edge, no fade).
- Text colours are the ones each UI kit row states; no other colours, tints or gradients on text.

#### UI kit (Locked)
Measured from the UI kit tab as Scent Box Chord draws it. Every control and container in the product is one of these components, drawn exactly as stated. Colours are tokens from Colors (a plain hex or rgba() is a fixed value the kit draws); "`--x` at N%" means `color-mix(in srgb, var(--x) N%, transparent)` and "at N% over `--canvas`" means `color-mix(in srgb, var(--x) N%, var(--canvas))`; sizes are points at the 390 x 844 reference (1pt = 1 CSS px); padding is CSS shorthand; exact shadow values are the `--shadow-*` tokens; (display) and (body) name the brand faces. "Other states" lists only what changes from the first state.

##### Actions
| Element | Use | Fill | Text | Edge, corners, shadow | Size | Parts and marks | Other states |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Primary button | The one main action on a screen. | none | --ink, Inter Tight (body) 17pt 600 | no edge; square corners | 52pt high, padding 0 16pt | label: --ink, Inter Tight (body) 17pt 600 | pressed: opacity 0.7 · focus: outline 2 solid --ink offset 3 · disabled: text --kit-primary, a --canvas at 58% veil over the whole control; label text --kit-primary |
| Secondary button | The alternative next to a primary button. | none | --ink, Inter Tight (body) 17pt 600 | no edge; square corners | 52pt high | none | pressed: opacity 0.7 · focus: outline 2 solid --ink offset 3 · disabled: text --kit-primary, a --canvas at 58% veil over the whole control |
| Text button | Low-emphasis actions: Skip, Cancel, See all. | none | --ink, Inter Tight (body) 15pt 600 | no edge; square corners | 44pt high, padding 0 4pt | none | pressed: opacity 0.7 |
| Destructive button | Delete, remove, sign out. | none | --ink, Inter Tight (body) 17pt 600 | no edge; square corners | 52pt high | none | pressed: opacity 0.7 |
| Icon button | A single icon action in a top bar or row. | none | --ink, Inter Tight (body) 13pt 600 | no edge; square corners | 44x44pt | none | pressed: opacity 0.7 |
| Split button | A default action plus a menu of related ones on an attached chevron. | none | --ink, Inter Tight (body) 17pt 600 | no edge; square corners | 52pt high, padding 0 16pt | none | open: menu appears: edge 1pt solid --line, square corners; chosen option appears: --ink, Inter Tight (body) 17pt 600 |
| Floating button | The screen's main create action, floating above scrolling content. | none | --ink, Inter Tight (body) 15pt 600 | no edge; square corners | 56x56pt | none | pressed: opacity 0.7 |
| Link | Text that goes to another page or opens a resource. | none | --ink, Inter Tight (body) 15pt 400, underlined | no edge; square corners | fits its content | none | pressed: looks the same · focus: outline 2 solid --primary offset 2 |
| Icon | One line-icon set at fixed sizes, always paired with a label or an accessible name. | none | --ink, Inter Tight (body) 12pt 400 | no edge; square corners | fits its content | label: --kit-primary, Inter Tight (body) 12pt 400 | one state |

##### Inputs
| Element | Use | Fill | Text | Edge, corners, shadow | Size | Parts and marks | Other states |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Text field | Single-line entry with a label above it. | none | --ink, Inter Tight (body) 17pt 400 | no edge; square corners | 48pt high | label: --ink, Inter Tight (body) 13pt 400; message: --kit-primary, Inter Tight (body) 13pt 400 | focus: a 3pt --primary at 24% ring outside the edge · error: a soft the ink shadow no down, no blur; message text --ink · disabled: opacity 0.5 |
| Search field | Search with a leading icon. | none | --ink, Inter Tight (body) 17pt 400 | no edge; square corners | 48pt high | none | focus: input a 3pt --primary at 24% ring outside the edge |
| Select | Pick one value from a list. | none | --ink, Inter Tight (body) 17pt 400 | no edge; square corners | 48pt high | label: --ink, Inter Tight (body) 13pt 400 | open: menu appears: edge 1pt solid --line, square corners; chosen option appears: --ink, Inter Tight (body) 17pt 600 |
| Combo box | Type a value or pick one of the suggestions that match. | none | --ink, Inter Tight (body) 17pt 400 | no edge; square corners | 48pt high | label: --ink, Inter Tight (body) 13pt 400 | open: a 3pt --primary at 24% ring outside the edge; its text and marks follow the same colour |
| Listbox | A visible list of options; pick one or several without opening anything. | none | --ink, Inter Tight (body) 17pt 400 | no edge; square corners | padding 8pt 0 9pt 0 | chosen option: --ink, Inter Tight (body) 17pt 600 | multiple: box appears: fill --ink, edge 1pt solid --ink, square corners |
| Checkbox | Multi-select options. | --primary | --ink, Inter Tight (body) 17pt 400 | no edge; square corners | 24x24pt | none | on: fill --ink, text --canvas, edge 1pt solid --ink, a 12x6pt block drawn as bottom 2pt solid --on-primary, left 2pt solid --on-primary strokes, after the text, rotated -45° · disabled: fill --ink, text --canvas, edge 1pt solid --ink, opacity 0.5, a 12x6pt block drawn as bottom 2pt solid --on-primary, left 2pt solid --on-primary strokes, after the text, rotated -45°; its text and marks follow the same colour |
| Radio | Single choice from a short list. | --primary | --ink, Inter Tight (body) 17pt 400 | no edge; circle | 24x24pt | none | on: fill --ink, text --canvas, edge 1pt solid --ink, a 10pt --on-primary dot, after the text |
| Toggle | An on/off setting that applies at once. | --primary | --ink, Inter Tight (body) 17pt 400 | no edge; pill | 50x29pt | knob: off — at the left; on — at the right; any tag beside it keeps at least 6pt from the knob; a 21pt --canvas dot, vertically centred in the box, at the left | on: fill --ink, text --canvas, a 21pt --canvas dot, vertically centred in the box, at the right · disabled: fill --ink, text --canvas, opacity 0.5, a 21pt --canvas dot, vertically centred in the box, at the right; label text --kit-primary |
| Segmented control | Switch between 2 to 4 views of the same content. | none | --ink, Inter Tight (body) 14pt 600 | no edge; square corners | 43pt high | selected: edge bottom 2pt solid --ink; unselected: --ab-muted, Inter Tight (body) 14pt 500, 44pt high | one state |
| Input stepper | Raise or lower a small whole number one step at a time. | none | --kit-stepper-text, Geist Mono (mono) 17pt 600 italic | no edge; square corners | 61pt high, padding 8pt 0 9pt 0 | none | minimum: button text --kit-primary, a --canvas at 58% veil over the whole control |
| Slider | A value on a continuous range. | track 2pt high | --ink, Inter Tight (body) 15pt 400 | no edge; square corners | 44pt hit area | thumb: 16x16pt | one state |
| Knob | A value on a range, turned like a dial: audio and other media controls. | none | --ink, Inter Tight (body) 14pt 400 | no edge; square corners | fits its content | arc: fill a soft conic sweep of --primary and --ink at 16%, circle; dial: fill --primary, circle, rotated 40.5°; indicator: fill --ink, pill; value: --kit-primary, Inter Tight (body) 15pt 400 | one state |

##### Pickers
| Element | Use | Fill | Text | Edge, corners, shadow | Size | Parts and marks | Other states |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Date picker | A date shown in a field; tapping it opens the calendar or wheels. | none | --ink, Inter Tight (body) 17pt 400 | no edge; square corners | 48pt high, padding 0 46pt 0 0 | label: --ink, Inter Tight (body) 13pt 400 | focus: a 3pt --primary at 24% ring outside the edge |
| Calendar picker | A month grid for choosing a day or a range of days. | none | --kit-calendar-text, Inter Tight (body) 15pt 600 | 1pt solid --line; square corners | padding 8pt 8pt 12pt 8pt | title: --ink, Inter Tight (body) 17pt 600; weekday label: --kit-primary, Inter Tight (body) 12pt 600, 28pt high; day: --ink, Inter Tight (body) 15pt 400, 44pt high; today: --ink, Inter Tight (body) 15pt 400, 44pt high; outside day: --kit-primary, Inter Tight (body) 15pt 400, 44pt high | range: range day appears:  |
| Wheel picker | Spinning columns of values with the choice in a centre band. | --primary | --kit-wheel-text, Inter Tight (body) 22pt 600 | no edge; square corners | fits its content | band: fill --ink at 8%; value: --kit-primary, Inter Tight (body) 15pt 400 | one state |
| Wheel-style date picker | Month, day and year as three wheels. | --primary | --kit-wheel-date-text, Inter Tight (body) 22pt 600 | no edge; square corners | fits its content | band: fill --ink at 8%; value: --kit-primary, Inter Tight (body) 15pt 400 | one state |

##### Containers
| Element | Use | Fill | Text | Edge, corners, shadow | Size | Parts and marks | Other states |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Card | A boxed group of related content and its action. | none | --ink, Bricolage Grotesque (display) 22pt 800, tracking -0.02em | no edge; square corners | fits its content | none | one state |
| List rows | Grouped rows: label, value, chevron or control. | none | --ink, Inter Tight (body) 17pt 500 | no edge; square corners | fits its content | grouping: an open list on the canvas, rows separated by no rule; row: 58pt high, padding 8pt 0; detail: --kit-primary, Inter Tight (body) 13pt 400; trailing value: --kit-primary, Inter Tight (body) 15pt 400; row avatar: 32pt high | pressed: row a 3pt --ink inner line along the left edge |
| Accordion | Stacked headings that each open to show their section. | none | --ink, Inter Tight (body) 17pt 500 | no edge; square corners | fits its content | none | open: looks the same |
| Carousel | A row of cards that swipes sideways, one page at a time. | none | --ink, Bricolage Grotesque (display) 22pt 800, tracking -0.02em | no edge; square corners | padding 20pt 0 0 0 | placeholder: fill --ink at 8% over --canvas; page dot: fill --ink at 30% over --canvas, circle, 8pt high; current dot: fill --primary-text, circle, 8pt high | one state |
| 2D matrix | Rows of tiles: scroll down through rows, sideways within a row. | --ink at 8% over --canvas | --kit-primary, Inter Tight (body) 15pt 400 | no edge; square corners | fits its content | caption label: --ink, Inter Tight (body) 15pt 400; row label: --ab-muted, Inter Tight (body) 13pt 400, 18pt high | one state |
| Callout | An inline message: info, success, warning, error. | none | --ink, Inter Tight (body) 16pt 600 | 1pt solid --info-icon; square corners | padding 14pt 16pt | none | success: edge 1pt solid --kit-callout; icon text --kit-callout · warning: edge 1pt solid --ink; icon text --ink · error: edge 2pt solid --ink; icon text --ink |
| Divider and section label | Separates and names groups of content. | none | --ab-muted, Inter Tight (body) 13pt 400 | no edge; square corners | fits its content | rule: fill --primary | one state |

##### Overlays
| Element | Use | Fill | Text | Edge, corners, shadow | Size | Parts and marks | Other states |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Overlay | The dimmed layer behind anything modal; tapping it closes non-critical overlays. | --ink at 24% | --ink, Inter Tight (body) 14pt 400 | no edge; square corners; a frosted backdrop blur (blur(3pt)) | fits its content | none | one state |
| Dialog | A centred box that stops the task for a decision or a warning. | none | --ink, Bricolage Grotesque (display) 22pt 800, tracking -0.02em | no edge; square corners | padding 20pt 0 0 0 | scrim: fill --pri-tint; scrim: a --black at 38% sheet covering the whole box | one state |
| Bottom sheet | A task or set of choices that slides up from the bottom. | none | --ink, Bricolage Grotesque (display) 22pt 800, tracking -0.02em | no edge; square corners | padding 10pt 20pt 20pt 20pt | grabber: fill --line, pill, 5pt high | one state |
| Side sheet | Supporting content or filters that slide in from the side edge. | none | --ink, Bricolage Grotesque (display) 22pt 800, tracking -0.02em | left 1pt solid --line; square corners | padding 8pt 16pt 16pt 16pt | scrim: fill --pri-tint; scrim: a --black at 38% sheet covering the whole box | one state |
| Popup | A small panel attached to the control that opened it. | none | --ink, Bricolage Grotesque (display) 17pt 800, tracking -0.02em | no edge; square corners | padding 20pt 0 0 0 | trailing mark at the end of the label: nothing | one state |
| Popup tip | A one-time hint pointing at a feature, with a way to dismiss it. | none | --kit-popup-tip-text, Bricolage Grotesque (display) 17pt 800, tracking -0.02em | no edge; square corners | padding 20pt 0 0 0 | trailing mark at the end of the label: nothing; action: --ink, Inter Tight (body) 15pt 600 | one state |
| Tooltip | A short label for a control, shown on hover, focus or long press. | --ink | --canvas, Inter Tight (body) 13pt 400 | no edge; square corners | padding 6pt 10pt | trailing mark at the end of the label: a 14pt chip filled --ink, holding nothing | one state |
| Lightbox | One image enlarged over a dark layer, with close and next. | none | --kit-lightbox-text, Inter Tight (body) 13pt 400 | no edge; square corners | padding 56pt 56pt 48pt 56pt | image: fill --ink at 86% over --canvas | one state |

##### Navigation
| Element | Use | Fill | Text | Edge, corners, shadow | Size | Parts and marks | Other states |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Top bar | Screen title, back and one or two icon actions. | --canvas | --ink, Inter Tight (body) 15pt 600 | no edge; square corners | 44pt bar plus its 1pt bottom rule | none | one state |
| Tab bar | 3 to 5 top-level destinations at the bottom of a phone. | --canvas | per tab, as the tab bar row lists | no edge; square corners | 83pt high on a screen, including the 34pt home indicator area | selected tab: --ink, Inter Tight (body) 10pt 600, 47pt high; selected tab: a 16x3pt --primary pill, near the bottom of the box, centred; unselected tab: --kit-primary, Inter Tight (body) 10pt 500, 47pt high | one state |
| Tabs | In-page sections under a title. | none | --ink, Inter Tight (body) 14pt 600 | bottom 1pt solid --line; square corners | 44pt high | selected: edge bottom 2pt solid --ink; selected: a 60x2pt --ink bar, near the bottom of the box, centred; unselected: --ab-muted, Inter Tight (body) 14pt 500, 44pt high | one state |
| Navigation menu | A vertical list of destinations with the current one marked. | --canvas | --ink, Inter Tight (body) 14pt 400 | no edge; square corners | fits its content | row: a 3pt --ink inner line along the left edge, 52pt high, padding 8pt 16pt; selected row: --ink, Inter Tight (body) 17pt 400 italic, a 3pt --ink inner line along the left edge, 52pt high, padding 8pt 16pt; title: --ink, Inter Tight (body) 17pt 500 italic; icon tile: fill --ink at 4% over --canvas, 32pt high | one state |
| Drawer menu | Navigation hidden behind a menu button, sliding in from the side. | none | --ink, Inter Tight (body) 14pt 400 | right 1pt solid --line; square corners | padding 12pt 8pt | scrim: fill --pri-tint; scrim: a --black at 38% sheet covering the whole box; selected row: --ink, Inter Tight (body) 17pt 400 italic, a 3pt --ink inner line along the left edge, 52pt high, padding 8pt 16pt; row: 52pt high, padding 8pt 16pt | one state |
| Scrollbar | Shows where you are in content that scrolls, and drags it. | --primary | --on-primary, Inter Tight (body) 14pt 400 | no edge; pill | fits its content | thumb: fill --ink at 45%, pill, 71pt high | one state |

##### Menus
| Element | Use | Fill | Text | Edge, corners, shadow | Size | Parts and marks | Other states |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Dropdown menu | A button that opens a list of commands. | none | --ink, Inter Tight (body) 17pt 600 | no edge; square corners | fits its content | none | open: menu appears: edge 1pt solid --line, square corners; its text and marks follow the same colour |
| Contextual menu | Actions for one item, on long press or right click. | none | --ink, Inter Tight (body) 14pt 400 | 1pt solid --line; square corners | fits its content | chosen option: --ink, Inter Tight (body) 17pt 600; target row: a 3pt --ink inner line along the left edge, 58pt high, padding 8pt 16pt | one state |
| Submenu | A menu item that opens a second list of its own. | none | --ink, Inter Tight (body) 14pt 400 | 1pt solid --line; square corners | fits its content | open item: 44pt high; submenu: edge 1pt solid --line | one state |
| Expandable menu | Navigation items that open in place to show their children. | --canvas | --ink, Inter Tight (body) 14pt 400 | no edge; square corners | fits its content | parent row: 52pt high, padding 8pt 16pt; selected row: --ink, Inter Tight (body) 17pt 400 italic, a 3pt --ink inner line along the left edge, 52pt high, padding 8pt 16pt 8pt 62pt; child row: 52pt high, padding 8pt 16pt 8pt 62pt | one state |
| Pie menu | Up to 6 actions in a ring around the press point. | none | --ink, Inter Tight (body) 14pt 400 | no edge; square corners | fits its content | a 152pt --ink at 3% dot with a 1pt solid --line edge, vertically centred in the box, centred; hub: fill --primary, circle, 14pt high; item: 44pt high; chosen item: --ink, Inter Tight (body) 13pt 600, 44pt high | one state |

##### Feedback
| Element | Use | Fill | Text | Edge, corners, shadow | Size | Parts and marks | Other states |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Badge and tag | Status, counts and categories. | none | --ink, Inter Tight (body) 11pt 600 | 1pt solid --line; pill | 23pt high, padding 2pt 9pt | count: fill --ink, --canvas, Inter Tight (body) 12pt 600, 22pt high | accent: fill --ink, text --canvas, edge no edge; dot appears: fill --primary, circle |
| Progress | A bar for known progress. | none | --ink, Inter Tight (body) 14pt 400 | bottom 1pt solid --line; square corners | 14pt high | fill: fill a hand-drawn the text colour loop (an SVG stroke) around it, 14pt high | one state |
| Spinner | Unknown wait under a few seconds. | --primary | --kit-spinner-text, Inter Tight (body) 15pt 400 | no edge; circle | 28x28pt | none | one state |
| Skeleton screen | Blocks in the shape of the coming layout while content loads. | a smooth fade of --canvas at 55% at 90° to transparent (a soft gloss, no hard line), drawn as a sheet covering the whole box | --ink, Inter Tight (body) 14pt 400 | no edge; square corners | fits its content | avatar: a a smooth fade of --canvas at 55% at 90° to transparent (a soft gloss, no hard line) sheet covering the whole box; line: a a smooth fade of --canvas at 55% at 90° to transparent (a soft gloss, no hard line) sheet covering the whole box | one state |
| Toast | A brief confirmation that disappears by itself. | none | --kit-toast-text, Inter Tight (body) 15pt 400 | no edge; square corners | 52pt high, padding 0 6pt 0 16pt | action: --canvas, Inter Tight (body) 15pt 600, underlined | one state |
| Empty state | What to do when there is nothing here yet. | --ink at 4% over --canvas | --ink, Bricolage Grotesque (display) 22pt 800, tracking -0.02em | no edge; circle | fits its content | message: --kit-primary, Inter Tight (body) 15pt 400 | one state |
| Avatar | A person or account: photo or initials. | none | --ink, Inter Tight (body) 13pt 600, uppercase | no edge; square corners | 32x32pt | none | one state |

#### Product screens (Guided)
These are Scent Box's own screens, from its product sheet. What gets checked is the content ranking (1 is the most important), where the style's signature lands, and the fold budget; the layout itself is designed for the product from the kit's components, with no pixel positions given. Comps of these screens are viewable in Looks Good only.
Platform: Mac. Each screen is a Mac app window, 1280x800 (comps are 2560x1600 at 2x); content taller than the window is drawn in full with a fold line at 800.

##### Shelf
- Job: See the whole shelf by smell, narrow it by status, accord or house, and open any fragrance.
- Primary action: Add fragrance
- Chrome: Toolbar in the title bar
- Content, ranked:
  1. Hero numeral "37", labelled "Fragrances on the shelf".
  2. Muted caption "7 bottles · 3 small · 24 samples · 18 houses".
  3. Segmented control "Show" with options "All 37", "Owned 34", "Interested 0", "Liked 3", "All 37" selected.
  4. Input field "Search", placeholder "Search name, house, note or accord".
  5. The one primary button "Add fragrance", pinned in a bottom bar above the home indicator or tab bar, always above the fold.
  6. Body line "Santa Maria Novella: Tabacco Toscano (tobacco, amber, woody), Vaniglia (vanilla, sweet, woody), Muschio Oro (musky, floral, white floral)".
  7. Body line "Ghost Stories: Harvest Moon, 9 (warm spicy, gourmand, leather) · Le Labo: Thé Noir 29, 7.5 · Santal 33 · Givenchy: Pi".
  8. Muted caption "d'Annam Memories of Japan sampler, 9 samples: Moonlight Samurai · Tokyo Nights · Sakura Snow".
- Signature placement: Every fragrance is its accord chord: the spectrum strip across the shelf, drawn in the scents' own colours (mock only; the sheet shows each fragrance's top accords as words).
- Fold budget: The shelf count, the view switch, search and the first fragrances fit in the 800 px window, with Add fragrance in the bottom bar.
- States:
  - Empty: The shelf is empty. One line in the shop's own voice ("Nothing on the shelf yet. Add the first bottle, decant or sample.") and Add fragrance as the only action; the format bar shows a blank track.
  - Loading: none; the data is on the device.
  - Error: none.
  - First run: none.

##### Fragrance
- Job: Read how one fragrance smells (its accord chord and its notes in time order), rate it and keep my own notes.
- Primary action: Save
- Chrome: Toolbar in the title bar
- Content, ranked:
  1. Card "Pi", with "Givenchy · Full bottle · Owned · EDT 1998", body "A fresh herbal opening of tarragon and mandarin gives way to anise and neroli, then settles into a warm vanilla, tonka and benzoin base.".
  2. Hero numeral "8.5", labelled "My rating, out of 10".
  3. Muted caption "Accords, by weight: aromatic, vanilla, fresh spicy, sweet, amber, woody, citrus".
  4. Body line "Top: Rosemary · Basil · Tarragon · Mandarin Orange".
  5. Body line "Heart: Geranium · Lily-of-the-Valley · Anise · Neroli".
  6. Body line "Base: Benzoin · Vanilla · Cedar · Tonka Bean".
  7. Body line "Best in spring. Two sprays; the vanilla stays all evening.".
  8. The one primary button "Save", pinned in a bottom bar above the home indicator or tab bar, always above the fold.
- Signature placement: The accord chord as one bar split by weight, and the notes as three bands in their real order (mock only; the sheet shows both as words).
- Fold budget: The name, the rating, the accords and the notes fit above the fold, with Save in the bottom bar.
- States:
  - Empty: Unrated shows no number, only the line "Rate it by feel, 0 to 10."
  - Loading: none.
  - Error: none.
  - First run: none.

##### Add fragrance
- Job: Add a new fragrance in a few fields and put it on the shelf.
- Primary action: Save fragrance
- Chrome: Toolbar in the title bar
- Content, ranked:
  1. Large title "Add fragrance".
  2. Input field "House", placeholder "Santa Maria Novella".
  3. Input field "Name", placeholder "Tabacco Toscano".
  4. Segmented control "Status" with options "Owned", "Interested", "Liked", "Owned" selected.
  5. Segmented control "Format" with options "Full bottle", "Travel", "Decant", "Sample", "Full bottle" selected.
  6. Input field "Accords", placeholder "tobacco:100, amber:85, woody:75".
  7. The one primary button "Save fragrance", pinned in a bottom bar above the home indicator or tab bar, always above the fold.
- Signature placement: The accord field turns what you type into the chord as you go (mock only; the sheet shows the field alone).
- Fold budget: Every field and the action fit in the window.
- States:
  - Empty: All fields blank; Save fragrance is disabled until House and Name are filled.
  - Loading: none.
  - Error: House and Name are required; the missing field gets a plain line under it.
  - First run: none.

#### Phone layout and type (Guided)
| Role | Face | Size pt | Line | Weight |
| --- | --- | --- | --- | --- |
| Display | Bricolage Grotesque (display), tracking -0.04em | 34 | 41 | 800 |
| Eyebrow | Inter Tight (body) | 13 | 18 | 400 |
| Label | Inter Tight (body) | 13 | 18 | 400 |
| Large title | Bricolage Grotesque (display), tracking -0.02em | 34 | 41 | 800 |
| Title | Bricolage Grotesque (display), tracking -0.02em | 28 | 34 | 800 |
| Title 2 | Bricolage Grotesque (display), tracking -0.02em | 22 | 28 | 800 |
| Headline | Inter Tight (body) | 17 | 22 | 500 |
| Body | Inter Tight (body) | 17 | 24 | 400 |
| Callout | Inter Tight (body) | 16 | 22 | 400 |
| Subhead | Inter Tight (body) | 15 | 20 | 400 |
| Footnote | Inter Tight (body) | 13 | 18 | 400 |
| Caption | Inter Tight (body) | 12 | 16 | 600 |
| Tab label | Inter Tight (body) | 10 | 12 | 600 selected, 500 unselected |
- Phone chrome: the status bar takes 54pt at the top and the home indicator 34pt at the bottom; nothing tappable sits in either. The top bar is 44pt high plus its 1pt bottom rule, under the status bar. At rest it shows only the back button and icon actions, with the Large title below it in the content; the title appears in the top bar (Headline size) only once the Large title has scrolled under it.
- Title colours: welcome title --ink, screen titles --ink, eyebrows --ab-muted.
- Layout: 20pt side margins on every screen. Spacing comes from 4, 8, 12, 16, 20, 24, 28, 32, 40, 48pt only; 28pt between sections. Sizes: buttons 52pt, fields 48pt, list rows 52pt with one line and 58pt with a detail line, card insides as the Home card in the sample screens, tab bar 83pt, nothing tappable under 44pt.
- Support Dynamic Type; never let a word split or a label truncate; one Large title per screen.

#### Light and dark (Locked)
The default look is dark, as the sample screens draw it: `color-scheme: dark` and the dark values on `:root`. Light is used only when the user chooses it (`[data-theme="light"]`). The light values are designed, not inverted. Text on the canvas uses `--ink` / `--muted`, with each mode's value from the Colors table.

#### States (Locked)
| State | Colour | Visual |
| --- | --- | --- |
| Pressed and disabled | as each UI kit row states | The "Other states" column of the UI kit is the one definition; nothing else changes on press. Disabled controls take no press response. |
| Focus | `--primary` | Keyboard focus on any control: a 2pt ring with a 2pt gap, following the control's corners; exactly as the "focus" state of the Primary and Secondary button rows in the UI kit draws it. Shown on keyboard focus only (`:focus-visible` on the web), never on tap or click; never removed. Text fields show their own focus state from the UI kit instead. |
| Empty | `--ink` headline, `--muted` copy | The Empty state row of the UI kit. |
| Loading | `--line` track, `--primary` fill | Indeterminate bar, or skeleton blocks in `--line` easing between 100% and 60% opacity every 1.2 s. Show it after 300 ms of waiting, with a text label for screen readers. |
| Error | `--error` | The Text field row's error state, with the message under the field. |

#### Motion (Guided)
- Durations: fast 90 ms (press, toggle), base 140 ms (color, selection, shadow), slow 220 ms (sheets, page changes). Easing: ease-out `cubic-bezier(0.2, 0.8, 0.2, 1)`.
- Reduce Motion: Replace slides and fades with an instant state swap; colour changes stay. State changes stay; only the movement goes. Nothing else animates idly or loops except loading indicators.

#### Accessibility (Locked)
- Contrast kept (light | dark): ink on canvas 16.3 | 16.3 (AAA); muted on canvas 4.9 | 6.4 (AA); on-primary on primary 5.0 | 5.0 (AA); accent-ink on canvas 16.3 | 8.5 (AAA); error on canvas 16.3 | 16.3 (AAA). Keep every text pair at 4.5:1 or better (3:1 for the accent-ink highlight word); do not swap tokens in a way that breaks them.
- Every tappable target is at least 44x44 CSS px even when the visible shape is smaller, with 8pt between neighbours. Text scales: sizes in rem, no fixed-height text boxes; layouts reflow at the largest accessibility size (stack, wrap, never truncate a primary label).
- Reduce Transparency (`prefers-reduced-transparency`): translucent fills in the kit (overlay, skeleton screen) become opaque. Increase Contrast (`prefers-contrast: more`): Hairlines become 2pt `--ink`, `--muted` text becomes `--ink`, tints get a 1pt `--ink` edge.
- Reduce Motion (`prefers-reduced-motion`): see Motion. Never color alone: selection, status and errors also use an icon, text or shape; icon-only buttons carry an accessibility label.

#### Icons (Locked)
One 1.5pt line set, only where the label does not say it; square caps, no filled shapes. Web: inline SVG on a 24px grid, `currentColor`.
- Sizes as the sample screens draw them: 24pt tab bar icons over their 10pt labels; 20pt icons in icon buttons, centred in a 44x44pt hit area; 18pt icons inside the 32pt feature-row chips; 16pt chevrons in the trailing slot of rows, never a text glyph (no ›, > or →); 24pt anywhere else.
- Glyphs the kit uses (draw each once, same stroke): back, more, notifications (bell), search, chevron right, chevron down, check, plus, info, success, warning, error, inbox (empty state), home, list, heart, user.

#### Fonts to bundle (Locked)
- Bricolage Grotesque: 800 (Display, Large title, Title, Title 2, UI kit).
- Inter Tight: 400 (Eyebrow, Label, Body, Callout, Subhead, Footnote, UI kit), 400 italic (UI kit), 500 (Headline, UI kit), 500 italic (UI kit), 600 (Caption, Tab label, UI kit).
- Geist Mono: 600 italic (UI kit).
- System faces, no file to bundle: -apple-system.
- Bundle exactly these weights and no others; the type scale uses no more. Web: https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@800&family=Geist+Mono:wght@600&family=Inter+Tight:wght@400;500;600&display=swap

#### Signature and product imagery (Guided)
- Embedded product screenshots, app icons and product imagery keep their own colours. They are exempt from the canvas and colour coverage budget and from the accent and primary limits; the studio frame around them (surfaces, captions, borders) follows the brand rules.
- Coverage and whitespace targets apply to the brand's own surfaces, not to product pages that showcase a product's own visual system.

#### Do and don't (Guided)
- Do: Draw every fragrance as a strip or bar split by accord weight in the accords' own colours; the chord is the first read on every screen.
- Do: Keep controls as plain text with an underline: Add fragrance and Save are heavy-underlined words in the toolbar, never filled blocks.
- Do: Set one number huge per screen (the shelf count or the rating) and cap it at roughly twice the strip height; everything else is small.
- Do: Label strips by house, under each group, in small sentence-case type.
- Don't: Use a black or filled slab for Add or Save, an arrow on a button, or a full-width button inside content.
- Don't: Use tracked capitals for labels or buttons, boxed badges like '7 BOTTLES' or 'OUT OF 10', or italic placeholders.
- Don't: Show 'aromatic 100' label and value rows or five glyph stars; use weighted bars and one numeral.

#### Tokens (CSS) (Locked)
```css
:root {
  color-scheme: dark;
  --canvas: #121111; --ink: #f1eee8; --muted: #989692;
  --line: #333231; --primary: #8a847a; --on-primary: #141414;
  --accent-ink: #e8a02c; --pri-tint: #201f1e; --error: #f1eee8;
  --on-error: #121111; --kit-primary: #b7b5b1; --ab-muted: #a19f9b;
  --info-icon: #8a847a; --kit-callout: #6b6967; --primary-text: #8a847a;
  --black: #000000; --kit-toast-text: #7d7c7c; --kit-stepper-text: #807f7e;
  --kit-calendar-text: #7e7e7e; --kit-wheel-text: #181817; --kit-wheel-date-text: #181817;
  --kit-popup-tip-text: #7d7c7c; --kit-lightbox-text: #7d7c7c; --kit-spinner-text: #1c1b1a;
  --kit-title-tile: rgba(0, 0, 0, 0); --kit-feature: #8a847a; --secondary: #2a2623;
  --on-secondary: #ffffff; --accent: #e8a02c; --on-accent: #141414;
  --sec-tint: #161414; --kit-stepper: #3b3a38;
  --font-heading: "Bricolage Grotesque", -apple-system, sans-serif; --font-body: "Inter Tight", -apple-system, sans-serif;
  --font-geist-mono: "Geist Mono", ui-monospace, monospace;
  --text-display: 34px; --text-eyebrow: 13px; --text-label: 13px; --text-large-title: 34px; --text-title: 28px; --text-title-2: 22px; --text-headline: 17px; --text-body: 17px; --text-callout: 16px; --text-subhead: 15px; --text-footnote: 13px; --text-caption: 12px; --text-tab-label: 10px;
  --space-4: 4px; --space-8: 8px; --space-12: 12px; --space-16: 16px; --space-20: 20px; --space-24: 24px; --space-28: 28px; --space-32: 32px; --space-40: 40px; --space-48: 48px;
  --status-bar: 54px; --home-indicator: 34px; --top-bar: 44px; --top-bar-rule: 1px; --tab-bar: 83px; --margin: 20px;
  --row: 52px; --row-detail: 58px;
  --radius-control: 0px; --radius-field: 0px; --radius-card: 0px; --hit: 44px;
  /* the kit draws no box shadows */
  --dur-fast: 90ms; --dur-base: 140ms; --dur-slow: 220ms; --ease: cubic-bezier(0.2, 0.8, 0.2, 1);
}
:root[data-theme="light"] {
  color-scheme: light;
  --canvas: #ece9e4; --ink: #0b0a0a; --muted: #656361;
  --line: #cac8c3; --accent-ink: #0b0a0a; --pri-tint: #e0ddd7;
  --error: #0b0a0a; --on-error: #ece9e4; --kit-primary: #3f3d3c;
  --ab-muted: #535150; --info-icon: #7d786f; --kit-callout: #7c7a77;
  --primary-text: #6a665e; --kit-toast-text: #6a6967; --kit-stepper-text: #3b3a38;
  --kit-calendar-text: #141414; --kit-wheel-text: #0b0a0a; --kit-wheel-date-text: #0b0a0a;
  --kit-popup-tip-text: #6a6967; --kit-lightbox-text: #6a6967; --kit-spinner-text: #1c1c1b;
  --kit-title-tile: #e8a02c; --kit-feature: #645f58; --sec-tint: #cdcac5;
}
@media (prefers-reduced-motion: reduce) { :root { --dur-fast: 0ms; --dur-base: 0ms; --dur-slow: 0ms; } }
```

#### App icon (Locked)
A dark ground with a row of narrow vertical colour strips of unequal height. Deliver a 1024x1024 master without transparency or pre-rounded corners (the system masks it), a dark variant on `#121111` and a tinted variant (glyph only, one color), and derive every other size from the master. Web: also a 512px maskable icon and a 32px favicon from the same master.

## Part 2: Design tokens

These are the brand's tokens: use them as given, and use nothing else for colour, type or spacing. The first block is the same file "Save + files" writes; the last block holds the values of every custom property the Part 3 CSS reads, resolved on the kit root, so every `var(--x)` in Part 3 has a value here.

### tokens.css

```css
:root {
  color-scheme: dark;
  --canvas: #121111; --ink: #f1eee8; --muted: #989692;
  --line: #333231; --primary: #8a847a; --on-primary: #141414;
  --accent-ink: #e8a02c; --pri-tint: #201f1e; --error: #f1eee8;
  --on-error: #121111; --kit-primary: #b7b5b1; --ab-muted: #a19f9b;
  --info-icon: #8a847a; --kit-callout: #6b6967; --primary-text: #8a847a;
  --black: #000000; --kit-toast-text: #7d7c7c; --kit-stepper-text: #807f7e;
  --kit-calendar-text: #7e7e7e; --kit-wheel-text: #181817; --kit-wheel-date-text: #181817;
  --kit-popup-tip-text: #7d7c7c; --kit-lightbox-text: #7d7c7c; --kit-spinner-text: #1c1b1a;
  --kit-title-tile: rgba(0, 0, 0, 0); --kit-feature: #8a847a; --secondary: #2a2623;
  --on-secondary: #ffffff; --accent: #e8a02c; --on-accent: #141414;
  --sec-tint: #161414; --kit-stepper: #3b3a38;
  --font-heading: "Bricolage Grotesque", -apple-system, sans-serif; --font-body: "Inter Tight", -apple-system, sans-serif;
  --font-geist-mono: "Geist Mono", ui-monospace, monospace;
  --text-display: 34px; --text-eyebrow: 13px; --text-label: 13px; --text-large-title: 34px; --text-title: 28px; --text-title-2: 22px; --text-headline: 17px; --text-body: 17px; --text-callout: 16px; --text-subhead: 15px; --text-footnote: 13px; --text-caption: 12px; --text-tab-label: 10px;
  --space-4: 4px; --space-8: 8px; --space-12: 12px; --space-16: 16px; --space-20: 20px; --space-24: 24px; --space-28: 28px; --space-32: 32px; --space-40: 40px; --space-48: 48px;
  --status-bar: 54px; --home-indicator: 34px; --top-bar: 44px; --top-bar-rule: 1px; --tab-bar: 83px; --margin: 20px;
  --row: 52px; --row-detail: 58px;
  --radius-control: 0px; --radius-field: 0px; --radius-card: 0px; --hit: 44px;
  /* the kit draws no box shadows */
  --dur-fast: 90ms; --dur-base: 140ms; --dur-slow: 220ms; --ease: cubic-bezier(0.2, 0.8, 0.2, 1);
}
:root[data-theme="light"] {
  color-scheme: light;
  --canvas: #ece9e4; --ink: #0b0a0a; --muted: #656361;
  --line: #cac8c3; --accent-ink: #0b0a0a; --pri-tint: #e0ddd7;
  --error: #0b0a0a; --on-error: #ece9e4; --kit-primary: #3f3d3c;
  --ab-muted: #535150; --info-icon: #7d786f; --kit-callout: #7c7a77;
  --primary-text: #6a665e; --kit-toast-text: #6a6967; --kit-stepper-text: #3b3a38;
  --kit-calendar-text: #141414; --kit-wheel-text: #0b0a0a; --kit-wheel-date-text: #0b0a0a;
  --kit-popup-tip-text: #6a6967; --kit-lightbox-text: #6a6967; --kit-spinner-text: #1c1c1b;
  --kit-title-tile: #e8a02c; --kit-feature: #645f58; --sec-tint: #cdcac5;
}
@media (prefers-reduced-motion: reduce) { :root { --dur-fast: 0ms; --dur-base: 0ms; --dur-slow: 0ms; } }
```

### Resolved custom properties read by the kit CSS

Set these on the kit root (the element carrying class `ab sb-ab`) before the Part 3 CSS applies. The first block is the dark look; the second lists only the values that differ in light, scoped by `data-mode`.

```css
.ab.sb-ab {
  --ab-accent: #f1eee8;
  --ab-accent-ink: #e8a02c;
  --ab-accent-mark: transparent;
  --ab-canvas: #121111;
  --ab-display: 1.35;
  --ab-font-b: "Inter Tight", -apple-system, sans-serif;
  --ab-font-h: "Bricolage Grotesque", -apple-system, sans-serif;
  --ab-font-label: "Inter Tight", -apple-system, sans-serif;
  --ab-font-ui: "Inter Tight", -apple-system, sans-serif;
  --ab-hl-scale: 1;
  --ab-hs: 1;
  --ab-ink: #f1eee8;
  --ab-line: #333231;
  --ab-muted: #a19f9b;
  --ab-on-accent: #121111;
  --ab-on-primary: #141414;
  --ab-on-secondary: #f1eee8;
  --ab-pri-tint: color-mix(in srgb, #f1eee8 4%, #121111);
  --ab-primary: #8a847a;
  --ab-primary-text: #f1eee8;
  --ab-sec-tint: #161414;
  --ab-secondary: #121111;
  --ab-skyline-a: url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22140%22%20height%3D%2230%22%20viewBox%3D%220%200%20140%2030%22%20preserveAspectRatio%3D%22none%22%3E%3Crect%20x%3D%220%22%20y%3D%2213.5%22%20width%3D%226%22%20height%3D%2216.5%22%20fill%3D%22%238a847a%22%2F%3E%3Crect%20x%3D%2210%22%20y%3D%223.0%22%20width%3D%226%22%20height%3D%2227.0%22%20fill%3D%22%238a847a%22%2F%3E%3Crect%20x%3D%2220%22%20y%3D%229.0%22%20width%3D%226%22%20height%3D%2221.0%22%20fill%3D%22%23e8a02c%22%2F%3E%3Crect%20x%3D%2230%22%20y%3D%220.0%22%20width%3D%226%22%20height%3D%2230.0%22%20fill%3D%22%238a847a%22%2F%3E%3Crect%20x%3D%2240%22%20y%3D%2216.5%22%20width%3D%226%22%20height%3D%2213.5%22%20fill%3D%22%238a847a%22%2F%3E%3Crect%20x%3D%2250%22%20y%3D%226.0%22%20width%3D%226%22%20height%3D%2224.0%22%20fill%3D%22%23e8a02c%22%2F%3E%3Crect%20x%3D%2260%22%20y%3D%2212.0%22%20width%3D%226%22%20height%3D%2218.0%22%20fill%3D%22%238a847a%22%2F%3E%3Crect%20x%3D%2270%22%20y%3D%221.5%22%20width%3D%226%22%20height%3D%2228.5%22%20fill%3D%22%238a847a%22%2F%3E%3Crect%20x%3D%2280%22%20y%3D%2215.0%22%20width%3D%226%22%20height%3D%2215.0%22%20fill%3D%22%23e8a02c%22%2F%3E%3Crect%20x%3D%2290%22%20y%3D%227.5%22%20width%3D%226%22%20height%3D%2222.5%22%20fill%3D%22%238a847a%22%2F%3E%3Crect%20x%3D%22100%22%20y%3D%2213.5%22%20width%3D%226%22%20height%3D%2216.5%22%20fill%3D%22%238a847a%22%2F%3E%3Crect%20x%3D%22110%22%20y%3D%223.0%22%20width%3D%226%22%20height%3D%2227.0%22%20fill%3D%22%23e8a02c%22%2F%3E%3Crect%20x%3D%22120%22%20y%3D%229.0%22%20width%3D%226%22%20height%3D%2221.0%22%20fill%3D%22%238a847a%22%2F%3E%3Crect%20x%3D%22130%22%20y%3D%220.0%22%20width%3D%226%22%20height%3D%2230.0%22%20fill%3D%22%238a847a%22%2F%3E%3C%2Fsvg%3E');
  --k-body: 17px;
  --k-body-lh: 24px;
  --k-btn: 52px;
  --k-callout: 16px;
  --k-callout-lh: 22px;
  --k-caption: 12px;
  --k-caption-lh: 16px;
  --k-cardpad: 20px;
  --k-err: #f1eee8;
  --k-err-ico: #f1eee8;
  --k-field: 48px;
  --k-footnote: 13px;
  --k-footnote-lh: 18px;
  --k-gap: 28px;
  --k-headline: 17px;
  --k-headline-lh: 22px;
  --k-info: #8a847a;
  --k-info-ico: #8a847a;
  --k-large-title: 34px;
  --k-large-title-lh: 41px;
  --k-margin: 20px;
  --k-muted: color-mix(in srgb, #f1eee8 28%, #a19f9b);
  --k-ok: #121111;
  --k-ok-ico: #6b6967;
  --k-pri-on-tint: #8a847a;
  --k-pri-text: #8a847a;
  --k-r: min(0px, 16px);
  --k-row: 52px;
  --k-subhead: 15px;
  --k-subhead-lh: 20px;
  --k-tab: 83px;
  --k-tab-label: 10px;
  --k-tab-label-lh: 12px;
  --k-tap: 44px;
  --k-title: 28px;
  --k-title-2: 22px;
  --k-title-2-lh: 28px;
  --k-title-lh: 34px;
  --k-ui: "Inter Tight", -apple-system, sans-serif;
  --k-warn: #f1eee8;
  --k-warn-ico: #f1eee8;
  --sb-card-r: 0px;
  --sb-danger: #f1eee8;
  --sb-danger-on: #121111;
  --sb-danger-text: #f1eee8;
  --sb-focus-auto: #8a847a;
  --sb-focus-offset: 2px;
  --sb-focus-w: 2px;
  --sb-r: 0px;
  --sb-ui-ff: "Inter Tight", -apple-system, sans-serif;
  --sb-ui-ls: 0;
  --sb-ui-tt: none;
}
```

```css
.ab.sb-ab[data-mode="light"] {
  --ab-accent: #0b0a0a;
  --ab-accent-ink: #0b0a0a;
  --ab-accent-mark: #e8a02c;
  --ab-canvas: #ece9e4;
  --ab-ink: #0b0a0a;
  --ab-line: #cac8c3;
  --ab-muted: #535150;
  --ab-on-accent: #ece9e4;
  --ab-on-secondary: #0b0a0a;
  --ab-pri-tint: color-mix(in srgb, #0b0a0a 4%, #ece9e4);
  --ab-primary-text: #0b0a0a;
  --ab-sec-tint: #cdcac5;
  --ab-secondary: #ece9e4;
  --k-err: #0b0a0a;
  --k-err-ico: #0b0a0a;
  --k-info-ico: #7d786f;
  --k-muted: color-mix(in srgb, #0b0a0a 28%, #535150);
  --k-ok: #ece9e4;
  --k-ok-ico: #7c7a77;
  --k-pri-on-tint: #645f58;
  --k-pri-text: #6a665e;
  --k-warn: #0b0a0a;
  --k-warn-ico: #0b0a0a;
  --sb-danger: #0b0a0a;
  --sb-danger-on: #ece9e4;
  --sb-danger-text: #0b0a0a;
}
```

Set per element (in the markup's inline `style` or by a rule inside `kit.css`, not on the root): `--h`, `--k-picked`, `--pr`, `--t`, `--tone`, `--tone-ico`, `--v`, `--wr`.

Optional hooks this style does not set (each `var()` in `kit.css` carries its own fallback, so leave them unset): `--k-arrow-edge`, `--k-callout-edge-w`, `--k-callout-fill`, `--k-callout-r`, `--k-callout-shadow`, `--k-dis-label`, `--k-sheet-r`, `--k-sheet-shadow`, `--mv-hair`, `--mv-hair-strong`, `--sb-focus`.

## Part 3: UI kit source

First comes `kit.css`: every CSS rule that draws the UI kit in this style, in cascade order, grouped by the file it came from. Then each component, with what it is for, its iOS treatment, its states and the reference markup of every state. Port the CSS values exactly; treat the markup as illustrative.

### Kit root

Every selector in `kit.css` is scoped to this root. Rename or fold the scope into your own, but keep the same attributes' meaning (`data-ae` is the style, `data-mode` is light or dark).

```html
<section class="ab sb-ab sb-window sb-kit" data-ae="scent-box-chord" data-mode="dark" data-accent-text="ok" data-hero="poster" data-palette="strips" data-sections="asym" data-highlight="ink" data-states="button" data-subcopy="on" data-hcls="grotesk" data-bcls="neo-grotesk" data-sb-danger="ink" data-k-field="box" data-ab-hs0="1" data-ab-hs-fit="1">
  <!-- a component's reference markup goes here -->
</section>
```

### kit.css

492 rules from 4 files: `baseline`, `css/aesthetic-board.css`, `css/see-built.css`, `inline <style>`.

```css
/* ===== baseline (from css/styles.css) ===== */
*,
::before,
::after {
  box-sizing: border-box;
}

@media (prefers-reduced-motion: reduce) {
  *,
  ::before,
  ::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}

/* ===== css/aesthetic-board.css ===== */
.ab {
  container: ab / inline-size;
  position: relative;
  isolation: isolate;
  overflow: hidden;
  background: var(--ab-canvas);
  color: var(--ab-ink);
  font-family: var(--ab-font-ui, var(--ab-font-b));
  --ab-pad: clamp(20px, 4.4cqw, 44px);
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: 0px;
  text-transform: none;
  text-align: left;
  border-radius: 20px;
  -webkit-font-smoothing: antialiased;
  font-synthesis: none;
}

.ab *,
.ab ::before,
.ab ::after {
  box-sizing: border-box;
}

:where(.ab) button,
:where(.ab) input {
  font: inherit;
  color: inherit;
}

.ab h2,
.ab h3,
.ab p,
.ab ul {
  margin: 0px;
  padding: 0px;
}

.ab i {
  font-style: normal;
}

.ab-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0px;
  font-family: var(--ab-font-h);
  font-weight: 700;
  letter-spacing: -0.02em;
  font-size: clamp(15px, 2cqw, 19px);
}

.ab-wordmark {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ab:not(.ab-slide) .ab-wordmark {
  overflow: visible;
  text-overflow: clip;
  white-space: normal;
  overflow-wrap: anywhere;
}

.ab-mark {
  flex: 0 0 auto;
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: var(--ab-ink);
  color: var(--ab-canvas);
  font: 700 14px/1 var(--ab-font-h);
}

.ab-rule {
  height: 1px;
  background: var(--ab-line);
}

.ab-label,
.ab-fieldlabel {
  font-family: var(--ab-font-label, var(--ab-font-ui, var(--ab-font-b)));
}

.ab-labelrow {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 16px;
}

.ab-label {
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ab-muted);
}

.ab-headline {
  font-family: var(--ab-font-h);
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.03em;
  font-size: calc(clamp(32px, 7.4cqw, 70px) * var(--ab-hl-scale, 1) * var(--ab-hs, 1) * var(--ab-display, 1));
  text-wrap: balance;
  overflow-wrap: normal;
}

.ab[data-ae] .ab-headline:not([data-wrap-last-resort]) {
  overflow-wrap: normal;
}

.ab-hl-glue {
  white-space: nowrap;
}

.ab-subcopy {
  max-width: 36em;
  text-wrap: pretty;
  font-family: var(--ab-font-b);
  font-size: clamp(13.5px, 1.5cqw, 16px);
  line-height: 1.5;
  color: var(--ab-muted);
  margin-top: clamp(14px, 2cqw, 22px) !important;
}

.ab:where([data-highlight="ink"]) .ab-hl {
  color: var(--ab-accent-ink);
  background-image: linear-gradient(transparent 62%, var(--ab-accent-mark, transparent) 62%, var(--ab-accent-mark, transparent) 94%, transparent 94%);
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
}

.ab[data-hero="poster"] .ab-headline {
  font-size: calc(clamp(44px, 12.5cqw, 168px) * var(--ab-hl-scale, 1) * var(--ab-hs, 1) * var(--ab-display, 1));
  line-height: 0.9;
  text-wrap: wrap;
  overflow-wrap: normal;
}

.ab-card {
  padding: clamp(18px, 2.8cqw, 26px);
  border-radius: 16px;
}

.ab-seg {
  display: flex;
  gap: 4px;
  padding: 5px;
  border-radius: 12px;
}

.ab-seg-btn {
  flex: 1 1 0%;
  min-height: 36px;
  padding: 8px 6px;
  border: 0px;
  background: transparent;
  border-radius: 9px;
  font-size: 12px;
  color: var(--ab-muted);
  cursor: pointer;
}

.ab-seg-btn[aria-pressed="true"] {
  color: var(--ab-ink);
  font-weight: 600;
}

.ab-card-title {
  font-family: var(--ab-font-h);
  font-weight: 600;
  font-size: clamp(21px, 2.7cqw, 27px);
  line-height: 1.12;
  letter-spacing: -0.02em;
  margin: 24px 0px 8px !important;
}

.ab-card-body {
  font-family: var(--ab-font-b);
  font-size: 13px;
  color: var(--ab-muted);
  margin-bottom: 22px !important;
}

.ab-cta {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 13px 16px;
  border: 0px;
  border-radius: 10px;
  cursor: pointer;
  background: var(--ab-primary);
  color: var(--ab-on-primary);
  font-size: 13.5px;
  font-weight: 600;
}

.ab-cta-arrow::before {
  content: "↗";
}

.ab-fieldlabel {
  display: block;
  margin-bottom: 10px;
  font-size: 12px;
}

.ab .ab-input {
  display: block;
  width: 100%;
  height: auto;
  margin-bottom: 18px;
  padding: 13px 15px;
  border: 1px solid var(--ab-line);
  border-radius: 10px;
  background: transparent;
  color: inherit;
  font-family: inherit;
  font-size: 15px;
  font-weight: inherit;
  text-transform: none;
  letter-spacing: 0px;
  outline: none;
}

.ab[data-ae] .ab-input:focus-visible {
  outline: 2px solid var(--ab-ink);
  outline-offset: 2px;
}

.ab-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 44px;
  font-size: 13px;
  cursor: pointer;
}

.ab-switch {
  appearance: none;
  position: relative;
  flex: 0 0 auto;
  margin: 0px;
  width: 50px;
  height: 29px;
  border-radius: 20px;
  cursor: pointer;
  background: var(--ab-line);
  transition: background 0.18s;
}

.ab-switch::before {
  content: "";
  position: absolute;
  left: 4px;
  top: 4px;
  width: 21px;
  height: 21px;
  border-radius: 50%;
  background: var(--ab-canvas);
  transition: transform 0.18s;
}

.ab-switch:checked {
  background: var(--ab-primary);
}

.ab-switch:checked::before {
  transform: translateX(21px);
}

.ab-list {
  list-style: none;
}

.ab-row {
  display: grid;
  align-items: center;
  gap: 4px clamp(10px, 2cqw, 20px);
  padding: 13px 2px;
  grid-template-columns: 2.6ch minmax(0px, 1fr) auto minmax(60px, 150px) 4.5ch;
  border-top: 1px solid var(--ab-line);
  font-size: 13px;
}

.ab-row:last-child {
  border-bottom: 1px solid var(--ab-line);
}

.ab-row-bar {
  height: 6px;
  border-radius: 3px;
  background: var(--ab-line);
  overflow: hidden;
}

.ab-row-bar i {
  display: block;
  height: 100%;
  background: var(--ab-secondary);
}

.ab-fit {
  display: inline-block;
  padding: 2px 9px;
  border: 1px solid var(--ab-line);
  border-radius: 999px;
  font-family: var(--ab-font-label, var(--ab-font-ui, var(--ab-font-b)));
  font-size: 11px;
  font-weight: 600;
  line-height: 1.5;
  white-space: nowrap;
  letter-spacing: 0px;
  text-transform: none;
  color: var(--ab-ink);
}

.ab-fit[data-fit="match"] {
  background: var(--ab-sec-tint);
  border-color: transparent;
  color: var(--ab-ink);
}

.ab-type-apply {
  padding: 10px 16px;
  border: 1px solid var(--ab-ink);
  border-radius: 10px;
  background: transparent;
  color: var(--ab-ink);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.ab-type-apply:hover {
  background: var(--ab-pri-tint);
}

.ab-type-apply:focus-visible {
  outline: 2px solid var(--ab-ink);
  outline-offset: 2px;
}

@container ab (max-width: 600px) {
  .ab-headline {
    font-size: calc(clamp(30px, 10.5cqw, 52px) * var(--ab-hl-scale, 1) * var(--ab-hs, 1) * var(--ab-display, 1));
  }

  .ab[data-hero="poster"] .ab-headline {
    font-size: calc(clamp(40px, 14.6cqw, 72px) * var(--ab-hl-scale, 1) * var(--ab-hs, 1) * var(--ab-display, 1));
  }

  .ab-brand {
    flex: 1 1 auto;
  }

  .ab-labelrow {
    flex-wrap: wrap;
    row-gap: 4px;
  }

  .ab-labelrow > .ab-label:last-child:not(:first-child) {
    white-space: nowrap;
  }

  .ab-row {
    grid-template-columns: 2.6ch minmax(0px, 1fr) 4.5ch;
    row-gap: 6px;
  }

  .ab-row-bar {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ab *,
  .ab ::before,
  .ab ::after {
    transition: none !important;
    animation: auto ease 0s 1 normal none running none !important;
  }
}

/* ===== css/see-built.css ===== */
.sb-single > .sb-window {
  min-height: 100%;
}

:is(.ab.sb-ab, .sb-gen) {
  --sb-danger: #c62f2f;
  --sb-danger-line: rgba(198, 47, 47, 0.35);
  --sb-danger-on: #fff;
}

:is(.ab.sb-ab, .sb-gen) {
  --sb-danger-text: color-mix(in srgb, var(--sb-danger) 62%, var(--ab-ink, #111));
}

:is(.ab.sb-ab, .sb-gen)[data-mode="dark"] {
  --sb-danger: #ff7b72;
  --sb-danger-line: rgba(255, 123, 114, 0.4);
  --sb-danger-on: #1a0505;
}

:is(.ab.sb-ab, .sb-gen) .sb-ico {
  display: block;
  flex: 0 0 auto;
}

:is(.ab.sb-ab, .sb-gen) :is(button, a) {
  -webkit-tap-highlight-color: transparent;
}

.ab.sb-ab.sb-window {
  min-height: 100%;
}

.sb-search {
  position: relative;
  width: clamp(180px, 24cqw, 260px);
}

.sb-search > .sb-ico {
  position: absolute;
  left: 12px;
  top: 50%;
  translate: 0px -50%;
  z-index: 1;
  color: color-mix(in srgb, var(--ab-ink) 28%, var(--ab-muted));
  pointer-events: none;
}

:is(.ab.sb-ab, .sb-gen) .sb-search .ab-input {
  margin: 0px;
  padding-top: 10px;
  padding-bottom: 10px;
  padding-left: 36px;
  font-size: 13px;
}

:is(.ab.sb-ab, .sb-gen) .ab-type-apply.sb-icon-btn {
  position: relative;
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  padding: 0px;
  flex: 0 0 auto;
}

.sb-badge {
  position: absolute;
  top: 8px;
  right: 9px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--ab-accent);
  box-shadow: 0 0 0 2px var(--ab-canvas);
}

:is(.ab.sb-ab, .sb-gen) .ab-row[tabindex] {
  cursor: pointer;
}

:is(.ab.sb-ab, .sb-gen) .ab-row[tabindex]:focus-visible {
  outline: 2px solid var(--ab-ink);
  outline-offset: -2px;
}

:is(.ab.sb-ab, .sb-gen) .ab-row.is-picked {
  background-color: var(--ab-pri-tint);
}

:is(.ab.sb-ab, .sb-gen) .sb-field .ab-input {
  margin-bottom: 16px;
}

:is(.ab.sb-ab, .sb-gen) .ab-toggle.sb-tog {
  min-height: 54px;
  padding: 6px 0px;
}

.sb-phone-in {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 54px var(--k-margin, 20px) 0;
}

.sb-phone-in > * {
  flex-shrink: 0;
}

.sb-statusbar {
  position: absolute;
  top: 0px;
  left: 0px;
  right: 0px;
  height: 54px;
  padding: 4px 30px 0px 46px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font: 600 17px / 1 -apple-system, system-ui, sans-serif;
  letter-spacing: 0px;
  color: var(--ab-ink);
  text-transform: none;
}

.sb-sb-r {
  display: flex;
  align-items: center;
  gap: 6px;
}

.sb-sig {
  width: 18px;
  height: 11px;
  background: linear-gradient(90deg, currentcolor 0px, currentcolor 3px, transparent 3px, transparent 5px, currentcolor 5px, currentcolor 8px, transparent 8px, transparent 10px, currentcolor 10px, currentcolor 13px, transparent 13px, transparent 15px, currentcolor 15px, currentcolor 18px);
  clip-path: polygon(0px 75%, 100% 0px, 100% 100%, 0px 100%);
}

.sb-wifi {
  width: 16px;
  height: 11px;
  border-radius: 14px 14px 0px 0px;
  background: currentcolor;
  clip-path: polygon(50% 100%, 0px 20%, 100% 20%);
}

.sb-bat {
  position: relative;
  width: 26px;
  height: 13px;
  border: 1.5px solid;
  border-radius: 4px;
  opacity: 0.9;
}

.sb-bat::after {
  content: "";
  position: absolute;
  inset: 1.5px 6px 1.5px 1.5px;
  border-radius: 1.5px;
  background: currentcolor;
}

.sb-homebar {
  position: absolute;
  z-index: 3;
  bottom: 8px;
  left: 50%;
  width: 134px;
  height: 5px;
  margin-left: -67px;
  border-radius: 3px;
  background: var(--ab-ink);
  opacity: 0.85;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .ab-headline.sb-ob-h {
  max-width: none;
  text-wrap: balance;
  margin: 0px !important;
  font-size: var(--k-large-title, 34px) !important;
  line-height: var(--k-large-title-lh, 41px) !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .ab-subcopy.sb-ob-body {
  max-width: none;
  margin: 12px 0px 0px !important;
  font-size: var(--k-body, 17px) !important;
  line-height: var(--k-body-lh, 24px) !important;
}

.sb-tabs {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: repeat(4, minmax(0px, 1fr));
  align-items: start;
  height: var(--k-tab, 83px);
  margin: auto calc(-1 * var(--k-margin, 20px)) 0;
  padding: 6px 6px 34px;
  border-top: 1px solid var(--ab-line);
  background: color-mix(in srgb, var(--ab-canvas) 92%, transparent);
}

.sb-tab {
  position: relative;
  display: grid;
  justify-items: center;
  gap: 3px;
  min-width: 0px;
  padding: 2px 0px 6px;
  border: 0px;
  background: none;
  cursor: pointer;
  font-family: var(--sb-ui-ff, var(--ab-font-ui));
  font-size: var(--k-tab-label, 10px);
  line-height: var(--k-tab-label-lh, 12px);
  font-weight: 500;
  color: color-mix(in srgb, var(--ab-ink) 28%, var(--ab-muted));
  text-transform: var(--sb-ui-tt, none);
  letter-spacing: var(--sb-ui-ls, 0);
}

.sb-tab span {
  max-width: 100%;
  white-space: nowrap;
}

.sb-tab[aria-current] {
  color: var(--ab-ink);
  font-weight: 600;
}

.sb-tab[aria-current]::before {
  content: "";
  position: absolute;
  bottom: 0px;
  left: 50%;
  width: 16px;
  margin-left: -8px;
  height: 3px;
  border-radius: 3px;
  background: var(--ab-primary);
}

.sb-tab[aria-current] > .sb-ico {
  color: var(--k-pri-text, var(--ab-primary-text, var(--ab-primary)));
}

.sb-tab:focus-visible {
  outline: 2px solid var(--ab-ink);
  outline-offset: -2px;
}

.sb-k-mid {
  margin: 0px 0.12em;
}

:is(.ab.sb-ab, .sb-gen).sb-kit :is(.ab-card, .ab-panel, .ab-list) {
  --k-muted: color-mix(in srgb, var(--ab-ink) 28%, var(--ab-muted));
  --k-picked: color-mix(in srgb, var(--ab-primary) 12%, transparent);
}

:is(.ab.sb-ab, .sb-gen).sb-kit .ab-row.sb-k-row.is-picked {
  background-color: var(--k-picked, var(--ab-pri-tint));
}

:is(.ab.sb-ab, .sb-gen).sb-kit {
  --k-ui: var(--sb-ui-ff, var(--ab-font-ui, var(--ab-font-b)));
  --k-muted: color-mix(in srgb, var(--ab-ink) 28%, var(--ab-muted));
  --k-r: min(var(--sb-r, 12px), 16px);
  --sb-focus-w: 2px;
  --sb-focus-offset: 2px;
}

:where(.ab.sb-ab, .sb-gen).sb-kit .sb-k-focus,
:where(.ab.sb-ab, .sb-gen).sb-kit :where(.sb-k-btn, .sb-k-btn2, .sb-k-textbtn, .sb-k-danger, .sb-k-iconbtn):focus-visible {
  outline: var(--sb-focus-w) solid var(--sb-focus, var(--sb-focus-auto, var(--ab-ink)));
  outline-offset: var(--sb-focus-offset);
}

:is(.ab.sb-ab, .sb-gen).sb-kit :is(.ab-cta.sb-k-btn, .ab-type-apply.sb-k-btn2) {
  width: 100%;
  height: auto;
  display: flex;
  align-items: center;
  gap: 10px;
  white-space: normal;
  min-height: var(--k-btn, 52px) !important;
  padding-top: 0px !important;
  padding-bottom: 0px !important;
  font-size: var(--k-headline, 17px) !important;
  line-height: var(--k-headline-lh, 22px) !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .ab-type-apply.sb-k-btn2 {
  justify-content: center;
  text-align: center;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .ab-cta.sb-k-btn .ab-cta-arrow {
  flex: 0 0 auto;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .ab-type-apply.sb-k-btn2.sb-k-auto {
  width: auto;
  padding-left: 20px !important;
  padding-right: 20px !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-pressed {
  box-shadow: inset 0 0 0 100vmax color-mix(in srgb, var(--ab-ink) 7%, transparent);
}

:is(.ab.sb-ab, .sb-gen).sb-kit :is(.sb-k-btn, .sb-k-btn2, .sb-k-textbtn, .sb-k-danger, .sb-k-iconbtn):disabled {
  cursor: not-allowed;
  color: var(--k-dis-label, var(--k-muted)) !important;
  box-shadow: inset 0 0 0 100vmax color-mix(in srgb, var(--ab-canvas) 58%, transparent) !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit :is(.sb-k-btn, .sb-k-btn2):disabled * {
  color: inherit !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit :is(.sb-k-box, .ab-switch):disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

:is(.ab.sb-ab, .sb-gen).sb-kit :is(.sb-k-check, .ab-toggle).is-disabled {
  cursor: not-allowed;
}

:is(.ab.sb-ab, .sb-gen).sb-kit :is(.sb-k-check, .ab-toggle).is-disabled > span {
  color: var(--k-muted) !important;
}

.sb-k-textbtn {
  min-height: var(--k-tap, 44px);
  padding: 0px 4px;
  border: 0px;
  background: none;
  cursor: pointer;
  font-family: var(--k-ui);
  font-size: var(--k-headline, 17px);
  line-height: var(--k-headline-lh, 22px);
  font-weight: 600;
  color: var(--k-pri-text, var(--ab-primary-text, var(--ab-ink)));
  text-transform: var(--sb-ui-tt, none);
  letter-spacing: var(--sb-ui-ls, 0);
  white-space: nowrap;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-textbtn.sb-k-pressed {
  box-shadow: none;
  color: var(--k-muted);
}

.sb-k-danger {
  width: 100%;
  min-height: var(--k-btn, 52px);
  padding: 0px 20px;
  cursor: pointer;
  border: 1px solid var(--sb-danger);
  border-radius: min(var(--sb-r, 10px), 999px);
  background: var(--sb-danger);
  color: var(--sb-danger-on, #fff);
  font-family: var(--k-ui);
  font-size: var(--k-headline, 17px);
  font-weight: 600;
  text-transform: var(--sb-ui-tt, none);
  letter-spacing: var(--sb-ui-ls, 0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04), 0 6px 16px -8px color-mix(in srgb, var(--sb-danger) 35%, transparent);
}

:is(.ab.sb-ab, .sb-gen)[data-sb-danger="ink"] .sb-k-danger {
  border: 1.5px solid var(--ab-ink);
  background: transparent;
  color: var(--ab-ink);
  box-shadow: none;
}

:is(.ab.sb-ab, .sb-gen)[data-sb-danger="ink"].sb-kit .sb-k-danger.sb-k-pressed {
  background: color-mix(in srgb, var(--ab-ink) 8%, transparent);
}

:is(.ab.sb-ab, .sb-gen).sb-kit .ab-type-apply.sb-k-iconbtn {
  box-sizing: border-box;
  width: var(--k-tap, 44px);
  height: var(--k-tap, 44px);
  min-width: var(--k-tap, 44px) !important;
  min-height: var(--k-tap, 44px) !important;
  padding: 0px !important;
}

.sb-k-plain {
  display: grid;
  place-items: center;
  width: var(--k-tap, 44px);
  height: var(--k-tap, 44px);
  padding: 0px;
  border: 0px;
  background: none;
  color: var(--ab-ink);
  cursor: pointer;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-split {
  display: flex;
  width: 100%;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-split > .sb-k-split-main {
  flex: 1 1 0px;
  width: auto;
  min-width: 0px;
  border-top-right-radius: 0px !important;
  border-bottom-right-radius: 0px !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-split > .sb-k-split-more {
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  box-sizing: border-box;
  width: var(--k-btn, 52px);
  margin-left: -1px;
  border-left: 1px solid color-mix(in srgb, var(--ab-on-primary) 40%, transparent);
  cursor: pointer;
  min-height: var(--k-btn, 52px) !important;
  padding: 0px !important;
  border-top-left-radius: 0px !important;
  border-bottom-left-radius: 0px !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-splitwrap > .sb-k-menu {
  width: min(100%, 240px);
  margin: 6px 0px 0px auto !important;
}

.sb-k-fabbox {
  position: relative;
  width: 100%;
  padding-bottom: 76px;
  overflow: hidden;
  border: 1px solid var(--ab-line);
  border-radius: var(--k-r);
  background: var(--ab-canvas);
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-fabbox > :is(.sb-k-fab, .sb-k-backtop) {
  position: absolute;
  right: 16px;
  bottom: 16px;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .ab-cta.sb-k-fab {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  cursor: pointer;
  min-width: 0px !important;
  min-height: 0px !important;
  padding: 0px !important;
}

:where(.ab.sb-ab, .sb-gen).sb-kit :is(.sb-k-fab, .sb-k-split-more):focus-visible {
  outline: var(--sb-focus-w, 2px) solid var(--sb-focus, var(--sb-focus-auto, var(--ab-ink)));
  outline-offset: var(--sb-focus-offset, 2px);
}

.sb-k-link {
  color: var(--k-pri-text, var(--ab-primary-text, var(--ab-ink)));
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-link.sb-k-pressed {
  box-shadow: none;
  color: var(--k-muted);
}

.sb-k-link:focus-visible {
  outline: var(--sb-focus-w, 2px) solid var(--sb-focus, var(--sb-focus-auto, var(--ab-ink)));
  outline-offset: 2px;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-field .ab-fieldlabel,
:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-selectwrap .ab-fieldlabel {
  margin: 0px 0px 8px !important;
  font-size: var(--k-footnote, 13px) !important;
  line-height: var(--k-footnote-lh, 18px) !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit :is(.sb-k-field, .sb-k-search, .sb-k-selectwrap) .ab-input {
  min-height: 0px;
  line-height: normal;
  height: var(--k-field, 48px) !important;
  margin: 0px !important;
  padding-top: 0px !important;
  padding-bottom: 0px !important;
  font-size: var(--k-body, 17px) !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-field.is-focus .ab-input,
:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-search.is-focus .ab-input {
  border-color: var(--k-pri-text, var(--ab-primary-text)) !important;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--ab-primary) 24%, transparent) !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-field.is-error .ab-input {
  border-color: var(--sb-danger) !important;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--sb-danger) 18%, transparent) !important;
}

[data-sb-danger="ink"][data-k-field="box"].sb-kit .sb-k-field.is-error .ab-input {
  border-width: 2px !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-field .ab-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.sb-k-help {
  font-family: var(--ab-font-b);
  font-size: var(--k-footnote, 13px);
  line-height: var(--k-footnote-lh, 18px);
  color: var(--k-muted);
  margin: 6px 0px 0px !important;
}

.sb-k-help.is-error {
  color: var(--sb-danger-text, var(--sb-danger));
}

.sb-k-search {
  width: 100%;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-search .ab-input {
  padding-left: 44px !important;
}

.sb-k-search > .sb-ico {
  left: 14px;
}

.sb-k-selectwrap {
  width: 100%;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .ab-input.sb-k-select {
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  text-align: left;
  cursor: pointer;
  display: flex !important;
}

.sb-k-menu {
  list-style: none;
  padding: 6px;
  border: 1px solid var(--ab-line);
  border-radius: var(--k-r);
  background: var(--ab-canvas);
  color: var(--ab-ink);
  box-shadow: rgba(0, 0, 0, 0.04) 0px 1px 2px, rgba(0, 0, 0, 0.16) 0px 10px 24px -10px;
  margin: 6px 0px 0px !important;
}

.sb-k-menu li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-height: var(--k-tap, 44px);
  padding: 0px 12px;
  border-radius: max(calc(var(--k-r) - 4px), 0px);
  font-family: var(--ab-font-ui);
  font-size: var(--k-body, 17px);
}

.sb-k-menu li[aria-selected="true"] {
  background: var(--ab-pri-tint);
  font-weight: 600;
}

.sb-k-menu .sb-ico {
  color: var(--k-pri-on-tint, var(--ab-primary-text));
}

.sb-k-check {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: var(--k-tap, 44px);
  font-family: var(--ab-font-ui);
  font-size: var(--k-body, 17px);
  line-height: var(--k-body-lh, 24px);
  cursor: pointer;
}

.sb-k-box {
  appearance: none;
  position: relative;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  margin: 0px;
  cursor: pointer;
  border: 1.5px solid color-mix(in srgb, var(--ab-ink) 72%, transparent);
  border-radius: min(var(--sb-r, 6px), 7px);
  background: transparent;
}

.sb-k-box[type="radio"] {
  border-radius: 50%;
}

.sb-k-box:checked {
  background: var(--ab-primary);
  border-color: var(--ab-primary);
}

.sb-k-box[type="checkbox"]:checked::after {
  content: "";
  width: 12px;
  height: 6px;
  border-left: 2.5px solid var(--ab-on-primary);
  border-bottom: 2.5px solid var(--ab-on-primary);
  transform: translateY(-2px) rotate(-45deg);
}

.sb-k-box[type="radio"]:checked::after {
  content: "";
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--ab-on-primary);
}

.sb-k-box:focus-visible {
  outline: var(--sb-focus-w, 2px) solid var(--sb-focus, var(--sb-focus-auto, var(--ab-ink)));
  outline-offset: var(--sb-focus-offset, 2px);
}

:is(.ab.sb-ab, .sb-gen).sb-kit .ab-toggle.sb-tog {
  width: 100%;
  line-height: var(--k-body-lh, 24px);
  font-size: var(--k-body, 17px) !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .ab-seg {
  width: 100%;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .ab-seg-btn {
  white-space: nowrap;
  min-height: var(--k-tap, 44px) !important;
  font-size: var(--k-subhead, 15px) !important;
  line-height: var(--k-subhead-lh, 20px) !important;
}

.sb-k-slider,
.sb-k-progress {
  width: 100%;
}

.sb-k-slider-h {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
  font-family: var(--ab-font-ui);
  font-size: var(--k-subhead, 15px);
  line-height: var(--k-subhead-lh, 20px);
}

.sb-k-slider-h span:last-child {
  color: var(--k-muted);
  font-variant-numeric: tabular-nums;
}

:is(.ab.sb-ab, .sb-gen) input[type="range"].sb-k-range {
  appearance: none;
  display: block;
  width: 100%;
  height: 28px;
  margin: 0px;
  background: transparent;
  cursor: pointer;
}

:is(.ab.sb-ab, .sb-gen) input[type="range"].sb-k-range::-webkit-slider-runnable-track {
  height: 4px;
  border-radius: 2px;
  background: linear-gradient(90deg, var(--ab-primary) var(--v, 50%), color-mix(in srgb, var(--ab-ink) 16%, transparent) var(--v, 50%));
}

:is(.ab.sb-ab, .sb-gen) input[type="range"].sb-k-range::-webkit-slider-thumb {
  appearance: none;
  width: 28px;
  height: 28px;
  margin-top: -12px;
  border-radius: 50%;
  background: var(--ab-canvas);
  border: 1px solid color-mix(in srgb, var(--ab-ink) 14%, transparent);
  box-shadow: rgba(0, 0, 0, 0.06) 0px 1px 2px, rgba(0, 0, 0, 0.16) 0px 3px 8px -2px;
  transform: none;
}

:is(.ab.sb-ab, .sb-gen) input[type="range"].sb-k-range:focus-visible {
  outline: 2px solid var(--ab-ink);
  outline-offset: 4px;
}

.sb-k-icons {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 20px;
}

.sb-k-icon {
  display: grid;
  justify-items: center;
  gap: 6px;
  color: var(--ab-ink);
  font-family: var(--ab-font-ui);
  font-size: var(--k-caption, 12px);
  line-height: var(--k-caption-lh, 16px);
}

.sb-k-icon > span {
  color: var(--k-muted);
  white-space: nowrap;
}

.sb-k-combo {
  width: 100%;
}

.sb-k-match {
  background: none;
  color: inherit;
  font-weight: 700;
}

.sb-k-listbox {
  width: 100%;
  box-shadow: none;
  margin: 0px !important;
}

.sb-k-listbox li > span {
  flex: 1 1 0%;
  min-width: 0px;
}

.sb-k-listbox .sb-k-box {
  pointer-events: none;
}

.sb-k-stepwrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  font-family: var(--ab-font-ui);
  font-size: var(--k-body, 17px);
  line-height: var(--k-body-lh, 24px);
}

.sb-k-stepper {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.sb-k-step-val {
  min-width: 36px;
  text-align: center;
  font-size: var(--k-body, 17px);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.sb-k-knobwrap {
  display: flex;
  align-items: center;
  gap: 16px;
}

.sb-k-knob {
  position: relative;
  flex: 0 0 auto;
  width: 72px;
  height: 72px;
}

.sb-k-knob-arc {
  position: absolute;
  inset: 0px;
  border-radius: 50%;
  background: conic-gradient(from -135deg, var(--ab-primary) calc(var(--v) * 270deg), color-mix(in srgb, var(--ab-ink) 16%, transparent) 0deg 270deg, transparent 0deg);
  mask: radial-gradient(farthest-side, transparent calc(100% - 6px), rgb(0, 0, 0) calc(100% - 5px));
}

.sb-k-knob-dial {
  position: absolute;
  inset: 10px;
  border-radius: 50%;
  background: var(--ab-canvas);
  border: 1px solid color-mix(in srgb, var(--ab-ink) 14%, transparent);
  box-shadow: rgba(0, 0, 0, 0.06) 0px 1px 2px, rgba(0, 0, 0, 0.16) 0px 3px 8px -2px;
  transform: rotate(calc(-135deg + var(--v) * 270deg));
}

.sb-k-knob-ind {
  position: absolute;
  left: 50%;
  top: 5px;
  width: 3px;
  height: 10px;
  margin-left: -1.5px;
  border-radius: 2px;
  background: var(--ab-ink);
}

.sb-k-knob-txt {
  display: grid;
  gap: 2px;
  font-family: var(--ab-font-ui);
  font-size: var(--k-subhead, 15px);
  line-height: var(--k-subhead-lh, 20px);
}

.sb-k-knob-val {
  color: var(--k-muted);
  font-variant-numeric: tabular-nums;
}

.sb-k-datefield {
  position: relative;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-datefield .ab-input {
  padding-right: 46px !important;
  cursor: pointer;
}

.sb-k-date-ico {
  position: absolute;
  right: 14px;
  top: calc(var(--k-footnote-lh, 18px) + 8px + (var(--k-field, 48px) - 20px) / 2);
  display: grid;
  color: var(--k-muted);
  pointer-events: none;
}

.sb-k-cal {
  width: 100%;
  padding: 8px 8px 12px;
  border: 1px solid var(--ab-line);
  border-radius: var(--k-r);
  background: var(--ab-canvas);
  color: var(--ab-ink);
  font-family: var(--ab-font-ui);
}

.sb-k-cal-head {
  display: grid;
  grid-template-columns: var(--k-tap, 44px) minmax(0, 1fr) var(--k-tap, 44px);
  align-items: center;
}

.sb-k-cal-t {
  text-align: center;
  font-size: var(--k-headline, 17px);
  line-height: var(--k-headline-lh, 22px);
  font-weight: 600;
}

.sb-k-cal-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0px, 1fr));
}

.sb-k-cal-dow {
  display: grid;
  place-items: center;
  height: 28px;
  font-size: var(--k-caption, 12px);
  line-height: var(--k-caption-lh, 16px);
  font-weight: 600;
  color: var(--k-muted);
  text-transform: var(--sb-ui-tt, none);
  letter-spacing: var(--sb-ui-ls, 0);
}

.sb-k-day {
  height: var(--k-tap, 44px);
  padding: 0px;
  border: 0px;
  border-radius: min(var(--sb-r, 12px), 22px);
  background: none;
  color: var(--ab-ink);
  font-style: inherit;
  font-variant-ligatures: inherit;
  font-variant-caps: inherit;
  font-variant-east-asian: inherit;
  font-variant-alternates: inherit;
  font-variant-position: inherit;
  font-variant-emoji: inherit;
  font-weight: inherit;
  font-stretch: inherit;
  line-height: inherit;
  font-family: inherit;
  font-optical-sizing: inherit;
  font-size-adjust: inherit;
  font-kerning: inherit;
  font-feature-settings: inherit;
  font-variation-settings: inherit;
  font-language-override: inherit;
  font-size: var(--k-subhead, 15px);
  font-variant-numeric: tabular-nums;
  cursor: pointer;
}

.sb-k-day.is-out {
  color: var(--k-muted);
}

.sb-k-day.is-today {
  box-shadow: inset 0 0 0 1.5px var(--ab-ink);
}

.sb-k-day.is-range {
  border-radius: 0px;
  background: var(--ab-pri-tint);
  box-shadow: none;
}

.sb-k-day.is-sel {
  background: var(--ab-primary);
  color: var(--ab-on-primary);
  font-weight: 600;
  box-shadow: none;
}

.sb-k-day.is-start {
  border-radius: min(var(--sb-r, 12px), 22px) 0 0 min(var(--sb-r, 12px), 22px);
}

.sb-k-day.is-end {
  border-radius: 0 min(var(--sb-r, 12px), 22px) min(var(--sb-r, 12px), 22px) 0;
}

.sb-k-day:focus-visible {
  outline: var(--sb-focus-w, 2px) solid var(--sb-focus, var(--sb-focus-auto, var(--ab-ink)));
  outline-offset: -2px;
}

.sb-k-wheel {
  --wr: 40px;
  position: relative;
  display: flex;
  width: 100%;
  max-width: 420px;
  height: calc(var(--wr) * 5);
  overflow: hidden;
  border-radius: var(--k-r);
  background: var(--ab-canvas);
}

.sb-k-wheel-col {
  position: relative;
  z-index: 1;
  flex: 1 1 0%;
  min-width: 0px;
}

.sb-k-wheel-item {
  display: grid;
  place-items: center;
  height: var(--wr);
  font-family: var(--ab-font-ui);
  font-size: var(--k-body, 17px);
  color: var(--k-muted);
  font-variant-numeric: tabular-nums;
}

.sb-k-wheel-item.is-d2 {
  font-size: var(--k-subhead, 15px);
}

.sb-k-wheel-item.is-sel {
  color: var(--ab-ink);
  font-weight: 600;
  font-size: var(--k-title-2, 22px);
}

.sb-k-wheel-band {
  position: absolute;
  left: 6px;
  right: 6px;
  z-index: 0;
  top: calc(var(--wr) * 2);
  height: var(--wr);
  border-radius: min(var(--k-r), 12px);
  background: color-mix(in srgb, var(--ab-ink) 8%, transparent);
  pointer-events: none;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .ab-card.sb-k-card {
  display: block;
  width: 100%;
  margin: 0px;
  padding-left: var(--k-cardpad, 20px) !important;
  padding-right: var(--k-cardpad, 20px) !important;
  padding-bottom: var(--k-cardpad, 20px) !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-card .ab-seg {
  margin: 0px !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-card .ab-card-title {
  margin: 16px 0px 6px !important;
  font-size: var(--k-title-2, 22px) !important;
  line-height: var(--k-title-2-lh, 28px) !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-card .ab-card-body {
  margin: 0px 0px 20px !important;
  font-size: var(--k-subhead, 15px) !important;
  line-height: var(--k-subhead-lh, 20px) !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .ab-labelrow.sb-k-section {
  align-items: center;
  min-height: 32px;
  margin: 0px 0px 8px !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-textbtn.sb-k-see {
  margin: -6px 0px;
  font-size: var(--k-subhead, 15px);
  line-height: var(--k-subhead-lh, 20px);
}

.sb-k-chev {
  display: inline-flex;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-section .ab-label {
  font-size: var(--k-footnote, 13px) !important;
  line-height: var(--k-footnote-lh, 18px) !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .ab-list.sb-k-list {
  width: 100%;
  margin: 0px;
  padding: 0px;
  list-style: none;
  display: block !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .ab-row.sb-k-row {
  align-items: center;
  display: grid !important;
  grid-template-columns: auto minmax(0px, 1fr) auto !important;
  grid-template-rows: auto !important;
  gap: 0px 14px !important;
  min-height: var(--k-row, 52px) !important;
  height: auto !important;
  padding: 8px 16px !important;
  aspect-ratio: auto !important;
  font-size: var(--k-body, 17px) !important;
  line-height: var(--k-body-lh, 24px) !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-row > * {
  grid-area: 1 !important;
  position: static !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-list.is-open > .ab-row.sb-k-row {
  padding-left: 0px !important;
  padding-right: 0px !important;
}

.sb-k-lead {
  display: grid;
  place-items: center;
}

.sb-k-ico {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: min(var(--sb-r, 8px), 10px);
  background: var(--ab-pri-tint);
  color: var(--k-pri-on-tint, var(--ab-primary-text));
}

.sb-k-text {
  display: grid;
  min-width: 0px;
}

.sb-k-title {
  min-width: 0px;
  font-weight: 500;
  overflow-wrap: normal;
}

.sb-k-sub {
  font-family: var(--ab-font-b);
  font-size: var(--k-footnote, 13px);
  line-height: var(--k-footnote-lh, 18px);
  color: var(--k-muted);
}

.sb-k-trail {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--k-subhead, 15px);
  color: var(--k-muted);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.sb-k-callout {
  --tone: var(--k-info, var(--ab-primary));
  --tone-ico: var(--k-info-ico, var(--ab-primary-text));
  display: grid;
  grid-template-columns: auto minmax(0px, 1fr);
  gap: 12px;
  width: 100%;
  padding: 14px 16px;
  border: var(--k-callout-edge-w, 1px) solid var(--tone-ico);
  border-radius: var(--k-callout-r, min(var(--sb-card-r, var(--k-r)), 16px));
  background: color-mix(in srgb, var(--tone) var(--k-callout-fill, 12%), var(--ab-canvas));
  color: var(--ab-ink);
  box-shadow: var(--k-callout-shadow, none);
  font-family: var(--ab-font-b);
  font-size: var(--k-callout, 16px);
  line-height: var(--k-callout-lh, 22px);
}

.sb-k-callout[data-tone="success"] {
  --tone: var(--k-ok, var(--ab-secondary));
  --tone-ico: var(--k-ok-ico, var(--k-ok, var(--ab-ink)));
}

.sb-k-callout[data-tone="warning"] {
  --tone: var(--k-warn, var(--ab-accent));
  --tone-ico: var(--k-warn-ico, var(--k-warn, var(--ab-ink)));
}

.sb-k-callout[data-tone="error"] {
  --tone: var(--k-err, var(--sb-danger));
  --tone-ico: var(--k-err-ico, var(--sb-danger-text, var(--sb-danger)));
}

[data-sb-danger="ink"] .sb-k-callout[data-tone="error"] {
  border: 2px solid var(--ab-ink);
  background: var(--ab-canvas);
}

.sb-k-callout > .sb-ico {
  margin-top: 1px;
  color: var(--tone-ico);
}

.sb-k-callout b {
  display: block;
  font-family: var(--ab-font-ui);
  font-weight: 600;
}

.sb-k-sheetbox {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  width: 100%;
  min-height: 300px;
  border-radius: var(--k-r);
  overflow: hidden;
  background: color-mix(in srgb, var(--ab-ink) 6%, var(--ab-canvas));
}

.sb-k-sheetbox::before {
  content: "";
  position: absolute;
  inset: 0px;
  background: rgba(0, 0, 0, 0.38);
}

.sb-k-sheet {
  position: relative;
  display: grid;
  gap: 10px;
  padding: 10px var(--k-margin, 20px) var(--k-margin, 20px);
  border-radius: var(--k-sheet-r, min(var(--sb-card-r, var(--k-r)), 24px)) var(--k-sheet-r, min(var(--sb-card-r, var(--k-r)), 24px)) 0 0;
  background: var(--ab-canvas);
  color: var(--ab-ink);
  box-shadow: var(--k-sheet-shadow, 0 -1px 2px rgba(0, 0, 0, 0.04), 0 -8px 24px -8px rgba(0, 0, 0, 0.14));
}

.sb-k-grab {
  justify-self: center;
  width: 36px;
  height: 5px;
  border-radius: 3px;
  background: var(--ab-line);
}

:is(.ab.sb-ab, .sb-gen).sb-kit .ab-card-title.sb-k-sheet-t {
  margin: 6px 0px 0px !important;
  font-size: var(--k-title-2, 22px) !important;
  line-height: var(--k-title-2-lh, 28px) !important;
}

.sb-k-sheet-b,
.sb-k-para {
  font-family: var(--ab-font-b);
  font-size: var(--k-subhead, 15px);
  line-height: var(--k-subhead-lh, 20px);
  color: var(--k-muted);
  margin: 0px !important;
}

.sb-k-sheet-a {
  display: grid;
  gap: 10px;
  margin-top: 8px;
}

.sb-k-divider {
  display: grid;
  gap: 12px;
  width: 100%;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-divider .ab-labelrow {
  margin: 0px !important;
}

.sb-k-ph {
  display: grid;
  place-items: center;
  width: 100%;
  aspect-ratio: 16 / 10;
  border-radius: min(var(--sb-card-r, var(--k-r)), 12px);
  background: color-mix(in srgb, var(--ab-ink) 8%, var(--ab-canvas));
  color: var(--k-muted);
}

.sb-k-acc > summary {
  list-style: none;
  cursor: pointer;
}

.sb-k-acc > summary::-webkit-details-marker {
  display: none;
}

.sb-k-acc[open] .sb-k-acc-chev {
  transform: rotate(180deg);
}

.sb-k-acc-sum:focus-visible {
  outline: 2px solid var(--ab-ink);
  outline-offset: -2px;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-acc-body {
  font-family: var(--ab-font-b);
  font-size: var(--k-subhead, 15px);
  line-height: var(--k-subhead-lh, 20px);
  color: var(--k-muted);
  margin: 0px !important;
  padding: 4px 16px 16px !important;
}

.sb-k-carousel,
.sb-k-matrix {
  width: 100%;
  min-width: 0px;
}

.sb-k-car-track,
.sb-k-mx-track {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
}

.sb-k-car-track::-webkit-scrollbar,
.sb-k-mx-track::-webkit-scrollbar {
  display: none;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .ab-card.sb-k-car-card {
  flex: 0 0 min(72%, 240px);
  width: auto;
  scroll-snap-align: start;
  padding-top: var(--k-cardpad, 20px) !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-car-card .ab-card-body {
  margin-bottom: 0px !important;
}

.sb-k-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin: 12px 0px 0px;
}

.sb-k-dots i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--ab-ink) 30%, var(--ab-canvas));
}

.sb-k-dots i.is-on {
  background: var(--k-pri-text, var(--ab-primary-text));
}

.sb-k-matrix {
  display: grid;
  gap: 8px;
}

.sb-k-mx-row {
  min-width: 0px;
}

.sb-k-mx-tile {
  flex: 0 0 112px;
  display: grid;
  align-content: start;
  gap: 8px;
  scroll-snap-align: start;
  font-family: var(--ab-font-ui);
  font-size: var(--k-subhead, 15px);
  line-height: var(--k-subhead-lh, 20px);
}

.sb-k-mx-tile .sb-k-ph {
  aspect-ratio: 1 / 1;
}

.sb-k-under {
  position: absolute;
  inset: 0px;
  z-index: 0;
  overflow: hidden;
  padding: 12px;
  background: var(--ab-canvas);
}

.sb-k-overlaybox {
  position: relative;
  display: grid;
  place-items: center;
  width: 100%;
  min-height: 240px;
  overflow: hidden;
  border-radius: var(--k-r);
  background: var(--ab-canvas);
}

.sb-k-scrim {
  position: absolute;
  inset: 0px;
  z-index: 1;
  background: rgba(0, 0, 0, 0.38);
}

.sb-k-overlaybox > .sb-k-scrimnote {
  position: relative;
  z-index: 2;
  width: auto;
  padding: 0px 16px;
}

.sb-k-sheetbox.is-under::before {
  z-index: 1;
}

.sb-k-sheetbox.is-under > :not(.sb-k-under) {
  position: relative;
  z-index: 2;
}

.sb-k-dialogbox {
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.sb-k-sidebox,
.sb-k-drawerbox {
  flex-direction: row;
  align-items: stretch;
  min-height: 380px;
}

.sb-k-sidebox {
  justify-content: flex-end;
}

.sb-k-drawerbox {
  justify-content: flex-start;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .ab-card.sb-k-dialog {
  width: 100%;
  max-width: 340px;
  padding-top: var(--k-cardpad, 20px) !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-dialog .ab-card-title.sb-k-dialog-t {
  margin: 0px 0px 6px !important;
}

.sb-k-dialog-a {
  display: grid;
  grid-template-columns: repeat(2, minmax(0px, 1fr));
  gap: 10px;
}

.sb-k-side,
.sb-k-drawer {
  display: grid;
  align-content: start;
  gap: 8px;
  width: min(80%, 300px);
  padding: 8px 16px 16px;
  background: var(--ab-canvas);
  color: var(--ab-ink);
}

.sb-k-side {
  border-left: 1px solid var(--ab-line);
  border-radius: var(--k-sheet-r, min(var(--sb-card-r, var(--k-r)), 24px)) 0 0 var(--k-sheet-r, min(var(--sb-card-r, var(--k-r)), 24px));
  box-shadow: rgba(0, 0, 0, 0.14) -8px 0px 24px -8px;
}

.sb-k-drawer {
  padding: 12px 8px;
  border-right: 1px solid var(--ab-line);
  border-radius: 0 var(--k-sheet-r, min(var(--sb-card-r, var(--k-r)), 24px)) var(--k-sheet-r, min(var(--sb-card-r, var(--k-r)), 24px)) 0;
  box-shadow: rgba(0, 0, 0, 0.14) 8px 0px 24px -8px;
}

.sb-k-drawer .sb-k-tb-brand {
  justify-self: start;
  padding: 4px 12px 8px;
}

.sb-k-side-h {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-right: -12px;
}

.sb-k-popbox {
  position: relative;
  display: grid;
  align-content: start;
  justify-items: start;
  gap: 12px;
  width: 100%;
  padding: 16px;
  border-radius: var(--k-r);
  background: color-mix(in srgb, var(--ab-ink) 4%, var(--ab-canvas));
}

.sb-k-popbox.is-end {
  justify-items: end;
}

.sb-k-popbox.is-tooltip {
  justify-items: center;
  gap: 0px;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .ab-card.sb-k-pop {
  position: relative;
  width: min(100%, 280px);
  padding-top: var(--k-cardpad, 20px) !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-pop .ab-card-title {
  margin: 0px 0px 6px !important;
  font-size: var(--k-headline, 17px) !important;
  line-height: var(--k-headline-lh, 22px) !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-pop .ab-card-body {
  margin: 0px 0px 8px !important;
}

.sb-k-pop-arrow {
  z-index: 2;
  box-sizing: border-box;
  top: -11px;
  left: 24px;
  width: 14px;
  height: 14px;
  min-width: 14px;
  min-height: 14px;
  margin: 0px;
  padding: 0px;
  border-style: inherit;
  border-color: inherit;
  border-width: var(--k-arrow-edge, 1px) 0 0 var(--k-arrow-edge, 1px);
  background: inherit;
  transform: rotate(45deg);
  position: absolute !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit :is(.sb-k-pop, .sb-k-tip, .sb-k-tooltip) {
  overflow: visible !important;
}

.sb-k-popbox.is-end .sb-k-pop-arrow {
  left: auto;
  right: 16px;
}

.sb-k-popbox > .sb-k-tooltip {
  position: relative;
  order: -1;
  margin-bottom: 10px;
  padding: 6px 10px;
  border-radius: min(var(--sb-r, 8px), 10px);
  background: var(--ab-ink);
  color: var(--ab-canvas);
  font-family: var(--ab-font-ui);
  font-size: var(--k-footnote, 13px);
  line-height: var(--k-footnote-lh, 18px);
  white-space: nowrap;
}

.sb-k-pop-arrow.is-down {
  top: auto;
  bottom: -11px;
  left: 50%;
  margin-left: -7px;
  border-width: 0 var(--k-arrow-edge, 1px) var(--k-arrow-edge, 1px) 0;
}

.sb-k-lightbox {
  position: relative;
  display: grid;
  place-items: center;
  width: 100%;
  min-height: 340px;
  padding: 56px 56px 48px;
  border-radius: var(--k-r);
  background: color-mix(in srgb, var(--ab-ink) 92%, var(--ab-canvas));
  color: var(--ab-canvas);
}

.sb-k-lb-img {
  max-width: 420px;
  background: color-mix(in srgb, var(--ab-canvas) 14%, var(--ab-ink));
  color: var(--ab-canvas);
}

.sb-k-lightbox .sb-k-plain {
  position: absolute;
  color: var(--ab-canvas);
}

.sb-k-lb-close {
  top: 4px;
  right: 4px;
}

.sb-k-lb-prev {
  left: 4px;
  top: 50%;
  margin-top: calc(var(--k-tap, 44px) / -2);
}

.sb-k-lb-next {
  right: 4px;
  top: 50%;
  margin-top: calc(var(--k-tap, 44px) / -2);
}

.sb-k-lb-cap {
  position: absolute;
  left: 0px;
  right: 0px;
  bottom: 14px;
  text-align: center;
  font-family: var(--ab-font-ui);
  font-size: var(--k-footnote, 13px);
  line-height: var(--k-footnote-lh, 18px);
  margin: 0px !important;
}

.sb-k-topbar {
  display: grid;
  grid-template-columns: var(--k-tap, 44px) minmax(0, 1fr) var(--k-tap, 44px);
  align-items: center;
  width: 100%;
  min-height: 44px;
  border-bottom: 1px solid var(--ab-line);
}

.sb-k-tb-title {
  text-align: center;
  font-family: var(--ab-font-ui);
  font-size: var(--k-headline, 17px);
  line-height: var(--k-headline-lh, 22px);
  font-weight: 600;
}

.sb-k-tabbarbox {
  width: 100%;
  overflow: hidden;
  border-radius: var(--k-r);
  border: 1px solid var(--ab-line);
}

.sb-k-tabbarbox .sb-tabs {
  margin: 0px;
  height: auto;
  padding-bottom: 14px;
  border-top: 0px;
}

.sb-k-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0px 24px;
  width: 100%;
  border-bottom: 1px solid var(--ab-line);
}

.sb-k-tabs [role="tab"] {
  position: relative;
  min-height: var(--k-tap, 44px);
  padding: 0px;
  border: 0px;
  background: none;
  cursor: pointer;
  font-family: var(--k-ui);
  font-size: var(--k-subhead, 15px);
  color: var(--k-muted);
  text-transform: var(--sb-ui-tt, none);
  letter-spacing: var(--sb-ui-ls, 0);
  white-space: nowrap;
}

.sb-k-tabs [role="tab"][aria-selected="true"] {
  color: var(--ab-ink);
  font-weight: 600;
}

.sb-k-tabs [role="tab"][aria-selected="true"]::after {
  content: "";
  position: absolute;
  left: 0px;
  right: 0px;
  bottom: -1px;
  height: 2px;
  background: var(--ab-primary);
}

.sb-k-tabs [role="tab"]:focus-visible {
  outline: 2px solid var(--ab-ink);
  outline-offset: 2px;
}

.sb-k-nm-item {
  color: inherit;
  text-decoration: none;
  cursor: pointer;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-nm-children :is(.ab-row.sb-k-row, .ab-row.sb-k-row.is-picked) {
  padding-left: 62px !important;
}

.sb-k-scroll {
  display: grid;
  grid-template-columns: minmax(0px, 1fr) 12px;
  gap: 8px;
  width: 100%;
  height: 168px;
}

.sb-k-scrollbox {
  min-width: 0px;
  overflow: hidden;
}

.sb-k-sbar {
  position: relative;
  border-radius: 999px;
  background: color-mix(in srgb, var(--ab-ink) 8%, transparent);
}

.sb-k-sbar-thumb {
  position: absolute;
  left: 2px;
  right: 2px;
  top: var(--t);
  height: var(--h);
  border-radius: 999px;
  background: color-mix(in srgb, var(--ab-ink) 45%, transparent);
}

.sb-k-cmdmenu {
  width: min(100%, 240px);
}

.sb-k-cmdmenu li {
  gap: 10px;
}

.sb-k-cmdmenu li > span:not(.sb-k-kbd) {
  flex: 1 1 0%;
  min-width: 0px;
}

.sb-k-cmdmenu .sb-ico {
  flex: 0 0 auto;
  color: var(--k-muted);
}

.sb-k-cmdmenu li[aria-selected="true"] .sb-ico {
  color: var(--k-pri-on-tint, var(--ab-primary-text));
}

.sb-k-cmdmenu li.is-danger,
.sb-k-cmdmenu li.is-danger .sb-ico {
  color: var(--sb-danger-text, var(--sb-danger));
}

.sb-k-cmdmenu li.sb-k-menu-sep {
  min-height: 0px;
  height: 1px;
  margin: 4px 8px;
  padding: 0px;
  background: var(--ab-line);
}

.sb-k-ddwrap {
  width: 100%;
}

.sb-k-ctxbox {
  display: grid;
  gap: 12px;
  width: 100%;
  padding: 12px;
  border-radius: var(--k-r);
  background: color-mix(in srgb, var(--ab-ink) 4%, var(--ab-canvas));
}

.sb-k-ctxbox > .sb-k-cmdmenu.sb-k-ctx {
  margin: 0px 0px 0px 56px !important;
}

.sb-k-subwrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: flex-start;
  width: 100%;
}

.sb-k-subwrap > .sb-k-cmdmenu {
  width: min(100%, 220px);
  margin: 0px !important;
}

.sb-k-subwrap > .sb-k-cmdmenu + .sb-k-cmdmenu {
  margin-top: var(--k-tap, 44px) !important;
}

.sb-k-piebox {
  display: grid;
  place-items: center;
  width: 100%;
}

.sb-k-pie {
  --pr: 76px;
  position: relative;
  width: 100%;
  max-width: 224px;
  aspect-ratio: 1 / 1;
}

.sb-k-pie::before {
  content: "";
  position: absolute;
  inset: calc(50% - var(--pr));
  border: 1px solid var(--ab-line);
  border-radius: 50%;
  background: color-mix(in srgb, var(--ab-ink) 3%, transparent);
}

.sb-k-pie-hub {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 14px;
  height: 14px;
  margin: -7px 0px 0px -7px;
  border-radius: 50%;
  background: var(--ab-primary);
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-pie > .sb-k-pie-item {
  position: absolute;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.sb-k-row-inline {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.sb-k-badge,
.sb-k-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 22px;
  min-width: 22px;
  padding: 0px 8px;
  border-radius: 999px;
  font-family: var(--k-ui);
  font-size: var(--k-caption, 12px);
  line-height: var(--k-caption-lh, 16px);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.sb-k-badge,
.sb-k-count.is-accent {
  background: var(--ab-accent);
  color: var(--ab-on-accent);
}

.sb-k-count {
  background: color-mix(in srgb, var(--ab-ink) 10%, transparent);
  color: var(--ab-ink);
}

.sb-k-dotwrap {
  position: relative;
  display: grid;
  place-items: center;
  width: var(--k-tap, 44px);
  height: var(--k-tap, 44px);
  color: var(--ab-ink);
}

.sb-k-dotwrap .sb-badge {
  top: 9px;
  right: 10px;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .ab-row-bar.sb-k-bar {
  width: 100%;
  display: block !important;
  height: 8px !important;
}

.sb-k-toast {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: var(--k-btn, 52px);
  padding: 0px 6px 0px 16px;
  border-radius: min(var(--sb-r, 12px), 14px);
  background: var(--ab-ink);
  color: var(--ab-canvas);
  box-shadow: rgba(0, 0, 0, 0.05) 0px 1px 2px, rgba(0, 0, 0, 0.2) 0px 8px 20px -8px;
  font-family: var(--ab-font-ui);
  font-size: var(--k-subhead, 15px);
  line-height: var(--k-subhead-lh, 20px);
}

.sb-k-toast > span {
  flex: 1 1 0%;
  min-width: 0px;
}

.sb-k-toast button {
  min-height: var(--k-tap, 44px);
  padding: 0px 12px;
  border: 0px;
  background: none;
  color: inherit;
  font: 600 var(--k-subhead, 15px)/1 var(--k-ui);
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.sb-k-empty {
  display: grid;
  justify-items: center;
  gap: 10px;
  width: 100%;
  padding: 20px 12px;
  text-align: center;
}

.sb-k-emptyico {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--ab-pri-tint);
  color: var(--k-pri-on-tint, var(--ab-primary-text));
}

:is(.ab.sb-ab, .sb-gen).sb-kit .ab-card-title.sb-k-empty-t {
  margin: 4px 0px 0px !important;
  font-size: var(--k-title-2, 22px) !important;
  line-height: var(--k-title-2-lh, 28px) !important;
}

.sb-k-empty-b {
  max-width: 28ch;
  font-family: var(--ab-font-b);
  font-size: var(--k-subhead, 15px);
  line-height: var(--k-subhead-lh, 20px);
  color: var(--k-muted);
  margin: 0px 0px 6px !important;
}

.sb-k-av {
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--ab-secondary);
  color: var(--ab-on-secondary);
  font: 600 15px/1 var(--k-ui);
  letter-spacing: 0px;
  text-transform: uppercase;
}

.sb-k-av-s {
  width: 32px;
  height: 32px;
  font-size: 13px;
}

.sb-k-av-l {
  width: 56px;
  height: 56px;
  font-size: 20px;
}

.sb-k-avs {
  display: inline-flex;
  padding-left: 4px;
}

.sb-k-avs .sb-k-av {
  margin-left: -4px;
  box-shadow: 0 0 0 2px var(--ab-canvas) !important;
}

.sb-k-spinner {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--k-muted);
  font-family: var(--ab-font-ui);
  font-size: var(--k-subhead, 15px);
  line-height: var(--k-subhead-lh, 20px);
}

.sb-k-spin {
  flex: 0 0 auto;
  width: 28px;
  height: 28px;
  border-top-style:;
  border-top-width:;
  border-right-color:;
  border-right-style:;
  border-right-width:;
  border-bottom-color:;
  border-bottom-style:;
  border-bottom-width:;
  border-left-color:;
  border-left-style:;
  border-left-width:;
  border-image-source:;
  border-image-slice:;
  border-image-width:;
  border-image-outset:;
  border-image-repeat:;
  border-top-color: var(--ab-primary);
  border-radius: 50%;
}

.sb-k-skel {
  display: grid;
  gap: 14px;
  width: 100%;
}

.sb-k-skel-row {
  display: grid;
  grid-template-columns: auto minmax(0px, 1fr);
  gap: 14px;
  align-items: center;
}

.sb-k-skel-row > span {
  display: grid;
  gap: 8px;
}

.sb-k-skel-av,
.sb-k-skel-line,
.sb-k-skel-block {
  position: relative;
  display: block;
  overflow: hidden;
  border-radius: min(var(--sb-r, 6px), 8px);
  background-color: color-mix(in srgb, var(--ab-ink) 8%, var(--ab-canvas));
}

.sb-k-skel-av {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.sb-k-skel-line {
  height: 12px;
}

.sb-k-skel-line.is-l1 {
  width: 62%;
  height: 14px;
}

.sb-k-skel-line.is-l2 {
  width: 38%;
}

.sb-k-skel-block {
  height: 96px;
  border-radius: min(var(--sb-card-r, var(--k-r)), 12px);
}

@media (prefers-reduced-motion: no-preference) {
  .sb-k-spin {
    animation: 0.9s linear 0s infinite normal none running sb-k-spin;
  }

  .sb-k-skel-av::after,
  .sb-k-skel-line::after,
  .sb-k-skel-block::after {
    content: "";
    position: absolute;
    inset: 0px;
    background: linear-gradient(90deg, transparent 33%, color-mix(in srgb, var(--ab-canvas) 55%, transparent) 50%, transparent 67%) 0 0 / 300% 100% no-repeat;
    animation: 1.4s ease-in-out 0s infinite normal none running sb-k-shimmer;
  }
}

@keyframes sb-k-spin { 
  100% { transform: rotate(360deg); }
}

@keyframes sb-k-shimmer { 
  0% { background-position: 100% 0px; }
  100% { background-position: 0px 0px; }
}

.sb-k-spec {
  display: flex;
  align-items: center;
  min-width: 0px;
}

.sb-k-scr {
  position: relative;
  width: 390px;
  height: 844px;
  border-radius: 54px;
  overflow: hidden;
  container: ab / inline-size;
  background: var(--ab-canvas);
  color: var(--ab-ink);
  text-align: left;
}

.sb-k-scr-in {
  padding-bottom: 34px;
}

.sb-k-scr[data-scr="list"] .sb-k-scr-in {
  padding-bottom: 0px;
}

.sb-k-blk {
  flex-shrink: 0;
  min-width: 0px;
}

.sb-k-blk + .sb-k-blk {
  margin-top: 16px;
}

.sb-k-blk[data-blk="topbar"] + .sb-k-blk {
  margin-top: 12px;
}

.sb-k-blk[data-blk="section"] {
  margin-top: var(--k-gap, 28px);
}

.sb-k-blk[data-blk="section"] + .sb-k-blk {
  margin-top: 0px;
}

.sb-k-blk[data-blk="title"] + .sb-k-blk[data-blk="body"] {
  margin-top: 12px;
}

.sb-k-blk[data-blk="btn-primary"] + .sb-k-blk[data-blk="btn-text"] {
  margin-top: 8px;
  display: grid;
  justify-items: center;
}

.sb-k-blk[data-blk="toggle"] {
  margin-top: 0px;
  padding: 4px 0px;
  border-bottom: 1px solid var(--ab-line);
}

.sb-k-scr[data-scr="form"] .sb-k-blk[data-blk="toggle"] {
  margin-top: 16px;
}

.sb-k-scr[data-scr="onboarding"] .sb-k-blk[data-blk="title"] {
  margin-top: auto;
}

.sb-k-scr[data-scr="onboarding"] .sb-k-blk[data-blk="list"] {
  margin-top: var(--k-gap, 28px);
  margin-bottom: auto;
}

.sb-k-scr[data-scr="onboarding"] .sb-k-blk[data-blk="btn-primary"],
.sb-k-scr[data-scr="form"] .sb-k-blk[data-blk="btn-primary"] {
  margin-top: auto;
  padding-top: 16px;
}

.sb-k-scr[data-scr="settings"] .sb-k-blk[data-blk="btn-destructive"] {
  margin-top: var(--k-gap, 28px);
}

.sb-k-blk.sb-k-fill {
  flex: 1 1 auto;
  min-height: 0px;
  overflow: hidden;
  padding-bottom: 12px;
}

.sb-k-blk.sb-k-fill + .sb-k-blk {
  margin-top: 0px;
}

.sb-k-blk[data-blk="tabbar"] {
  margin: auto calc(-1 * var(--k-margin, 20px)) 0 !important;
}

.sb-k-blk[data-blk="tabbar"] .sb-tabs {
  margin: 0px;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .ab-card-title.sb-k-ltitle {
  overflow-wrap: normal;
  text-wrap: balance;
  margin: 0px !important;
  font-size: var(--k-large-title, 34px) !important;
  line-height: var(--k-large-title-lh, 41px) !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-scr .ab-card.sb-k-card .ab-card-title {
  margin-top: 0px !important;
  font-size: var(--k-title, 28px) !important;
  line-height: var(--k-title-lh, 34px) !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-scr .ab-card.sb-k-card {
  padding-top: var(--k-cardpad, 20px) !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-scr .sb-k-card .ab-card-body {
  margin-bottom: 0px !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-tb-brand {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 0px;
  max-width: 100%;
  line-height: var(--k-headline-lh, 22px);
  font-size: var(--k-headline, 17px) !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-tb-brand .ab-mark {
  width: 28px;
  height: 28px;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .ab-row.sb-k-row.is-nolead {
  grid-template-columns: minmax(0px, 1fr) auto !important;
}

@container ab (max-width: 760px) {
  .sb-search {
    flex: 1 1 140px;
    width: auto;
  }
}

:is(.ab.sb-ab, .sb-gen).sb-kit .ab-subcopy.sb-ob-body {
  display: block !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit :is(.sb-ob-h, .sb-k-ltitle, .sb-home-h) .ab-hl {
  -webkit-box-decoration-break: slice !important;
  box-decoration-break: slice !important;
  padding-left: 0px !important;
  padding-right: 0px !important;
}

/* ===== inline <style> ===== */
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit {
  --ab-primary-text: var(--ab-ink) !important;
  --ab-pri-tint: color-mix(in srgb, var(--ab-ink) 4%, var(--ab-canvas)) !important;
  --ab-accent: var(--ab-ink) !important;
  --ab-on-accent: var(--ab-canvas) !important;
  --ab-secondary: var(--ab-canvas) !important;
  --ab-on-secondary: var(--ab-ink) !important;
}

.ab[data-ae="scent-box-chord"] .ab-cta,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .ab-cta,
.ab[data-ae="scent-box-chord"] .ab-cta.sb-k-btn,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .ab-cta.sb-k-btn,
.ab[data-ae="scent-box-chord"] .ab-type-apply,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .ab-type-apply,
.ab[data-ae="scent-box-chord"] .ab-type-apply.sb-k-btn2,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .ab-type-apply.sb-k-btn2,
.ab[data-ae="scent-box-chord"] .sb-k-textbtn,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-textbtn,
.ab[data-ae="scent-box-chord"] .sb-k-danger,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-danger,
.ab[data-ae="scent-box-chord"] .ab-input,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .ab-input,
.ab[data-ae="scent-box-chord"] .sb-k-field .ab-input,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-field .ab-input,
.ab[data-ae="scent-box-chord"] .sb-k-search .ab-input,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-search .ab-input,
.ab[data-ae="scent-box-chord"] .sb-k-select,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-select,
.ab[data-ae="scent-box-chord"] .ab-seg-btn,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .ab-seg-btn {
  border-radius: 0px;
}

.ab[data-ae="scent-box-chord"] .ab-card,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .ab-card,
.ab[data-ae="scent-box-chord"] .ab-card.sb-k-card,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .ab-card.sb-k-card,
.ab[data-ae="scent-box-chord"] .ab-card.sb-k-dialog,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .ab-card.sb-k-dialog,
.ab[data-ae="scent-box-chord"] .sb-k-dialog,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-dialog,
.ab[data-ae="scent-box-chord"] .sb-k-sheet,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-sheet,
.ab[data-ae="scent-box-chord"] .sb-k-toast,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-toast,
.ab[data-ae="scent-box-chord"] .sb-k-menu,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-menu,
.ab[data-ae="scent-box-chord"] .sb-k-callout,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-callout {
  border-radius: 0px;
}

.ab[data-ae="scent-box-chord"] .sb-k-badge,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-badge,
.ab[data-ae="scent-box-chord"] .sb-k-count,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-count,
.ab[data-ae="scent-box-chord"] .sb-k-tooltip,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-tooltip,
.ab[data-ae="scent-box-chord"] .sb-k-tabs [role="tab"],
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-tabs [role="tab"] {
  border-radius: 0px;
}

.ab[data-ae="scent-box-chord"] .ab-switch,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .ab-switch,
.ab[data-ae="scent-box-chord"] .ab-row-bar,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .ab-row-bar,
.ab[data-ae="scent-box-chord"] .sb-k-bar,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-bar,
.ab[data-ae="scent-box-chord"] .sb-k-av,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-av {
  border-radius: 999px;
}

.ab[data-ae="scent-box-chord"] .ab-rule {
  height: 0px;
  border-right: 0px;
  border-bottom: 0px;
  border-left: 0px;
  border-image: none;
  border-top: 1px solid var(--ab-line);
  background: none;
}

.ab[data-ae="scent-box-chord"] :is(.sb-k-divider, .sb-k-menu-sep) {
  border-color: var(--ab-line);
}

.ab[data-ae="scent-box-chord"] .ab-row,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .ab-row,
.ab[data-ae="scent-box-chord"] .sb-k-row,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-row {
  border-bottom: 1px solid var(--ab-line);
}

.ab[data-ae="scent-box-chord"] .ab-headline {
  font-weight: 800;
  word-spacing: 0em;
}

.ab[data-ae="scent-box-chord"] .ab-brand {
  font-weight: 800;
}

.ab[data-ae="scent-box-chord"] .ab-card-title {
  font-weight: 700;
}

.ab[data-ae="scent-box-chord"] :is(.ab-headline, .ab-hero h1, .ab-hero h2) {
  letter-spacing: -0.035em;
  line-height: 0.92;
}

.ab[data-ae="scent-box-chord"].sb-kit :is(button, input, a, [tabindex]):focus-visible,
.ab[data-ae="scent-box-chord"] :is(.ab-switch, .ab-cta, .ab-seg-btn, .ab-type-apply):focus-visible {
  outline: 2px solid var(--ab-ink);
  outline-offset: 3px;
}

.ab[data-ae="scent-box-chord"] .ab-label,
.ab[data-ae="scent-box-chord"] .ab-fieldlabel,
.ab[data-ae="scent-box-chord"] .sb-k-tb-title,
.ab[data-ae="scent-box-chord"] .ab-brand {
  text-transform: none !important;
  letter-spacing: 0em !important;
}

.ab[data-ae="scent-box-chord"] .ab-cta,
.ab[data-ae="scent-box-chord"] .ab-seg-btn,
.ab[data-ae="scent-box-chord"] .ab-type-apply,
.ab[data-ae="scent-box-chord"] .sb-k-textbtn,
.ab[data-ae="scent-box-chord"] .sb-k-btn,
.ab[data-ae="scent-box-chord"] .sb-k-btn2,
.ab[data-ae="scent-box-chord"] .sb-k-tabs [role="tab"],
.ab[data-ae="scent-box-chord"] .sb-tab,
.ab[data-ae="scent-box-chord"] .sb-k-link {
  text-transform: none !important;
  letter-spacing: 0em !important;
}

.ab[data-ae="scent-box-chord"] .sb-k-split > .sb-k-split-more {
  border-left-color: transparent !important;
}

.ab[data-ae="scent-box-chord"] .ab-cta-arrow::before {
  content: " ";
  font-size: 10px;
}

.ab[data-ae="scent-box-chord"] .ab-cta,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .ab-cta,
.ab[data-ae="scent-box-chord"] .ab-cta.sb-k-btn,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .ab-cta.sb-k-btn {
  background: none;
  box-shadow: none;
  border-radius: 0px;
  color: var(--ab-ink);
  font-size: 17px;
  letter-spacing: 0em;
  text-transform: uppercase;
}

:is(.ab[data-ae="scent-box-chord"] .ab-cta, .ab[data-ae="scent-box-chord"].sb-ab.sb-kit .ab-cta, .ab[data-ae="scent-box-chord"] .ab-cta.sb-k-btn, .ab[data-ae="scent-box-chord"].sb-ab.sb-kit .ab-cta.sb-k-btn):is(:active, .sb-k-pressed, .is-pressed) {
  opacity: 0.7;
  transform: none;
  filter: none;
  background: none !important;
  box-shadow: none !important;
}

:is(.ab[data-ae="scent-box-chord"] .ab-cta, .ab[data-ae="scent-box-chord"].sb-ab.sb-kit .ab-cta, .ab[data-ae="scent-box-chord"] .ab-cta.sb-k-btn, .ab[data-ae="scent-box-chord"].sb-ab.sb-kit .ab-cta.sb-k-btn):is(:focus-visible, .is-focus) {
  outline: 2px solid var(--ab-ink);
  outline-offset: 3px;
}

.ab[data-ae="scent-box-chord"] .ab-type-apply,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .ab-type-apply,
.ab[data-ae="scent-box-chord"] .ab-type-apply.sb-k-btn2,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .ab-type-apply.sb-k-btn2 {
  padding: 0px;
  border: 0px;
  border-radius: 0px;
  background: none;
  box-shadow: none;
}

:is(.ab[data-ae="scent-box-chord"] .ab-type-apply, .ab[data-ae="scent-box-chord"].sb-ab.sb-kit .ab-type-apply, .ab[data-ae="scent-box-chord"] .ab-type-apply.sb-k-btn2, .ab[data-ae="scent-box-chord"].sb-ab.sb-kit .ab-type-apply.sb-k-btn2):is(:active, .sb-k-pressed, .is-pressed) {
  opacity: 0.7;
  transform: none;
  filter: none;
  background: none !important;
  box-shadow: none !important;
}

:is(.ab[data-ae="scent-box-chord"] .ab-type-apply, .ab[data-ae="scent-box-chord"].sb-ab.sb-kit .ab-type-apply, .ab[data-ae="scent-box-chord"] .ab-type-apply.sb-k-btn2, .ab[data-ae="scent-box-chord"].sb-ab.sb-kit .ab-type-apply.sb-k-btn2):is(:focus-visible, .is-focus) {
  outline: 2px solid var(--ab-ink);
  outline-offset: 3px;
}

.ab[data-ae="scent-box-chord"] .sb-k-textbtn,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-textbtn {
  background: none;
  box-shadow: none;
  border-radius: 0px;
  color: var(--ab-ink);
  font-size: 15px;
  letter-spacing: 0em;
  text-transform: uppercase;
}

:is(.ab[data-ae="scent-box-chord"] .sb-k-textbtn, .ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-textbtn):is(:active, .sb-k-pressed, .is-pressed) {
  opacity: 0.7;
  transform: none;
  filter: none;
  background: none !important;
  box-shadow: none !important;
}

.ab[data-ae="scent-box-chord"] .sb-k-iconbtn,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-iconbtn {
  padding: 0px;
  border: 0px;
  border-radius: 0px;
  background: none;
  box-shadow: none;
}

:is(.ab[data-ae="scent-box-chord"] .sb-k-iconbtn, .ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-iconbtn):is(:active, .sb-k-pressed, .is-pressed) {
  opacity: 0.7;
  transform: none;
  filter: none;
  background: none !important;
  box-shadow: none !important;
}

.ab[data-ae="scent-box-chord"] .sb-k-danger,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-danger {
  padding: 0px;
  border: 0px;
  border-radius: 0px;
  background: none;
  box-shadow: none;
}

:is(.ab[data-ae="scent-box-chord"] .sb-k-danger, .ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-danger):is(:active, .sb-k-pressed, .is-pressed) {
  opacity: 0.7;
  transform: none;
  filter: none;
  background: none !important;
  box-shadow: none !important;
}

.ab[data-ae="scent-box-chord"] .ab-input,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .ab-input,
.ab[data-ae="scent-box-chord"] .sb-k-field .ab-input,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-field .ab-input,
.ab[data-ae="scent-box-chord"] .sb-k-search .ab-input,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-search .ab-input {
  padding: 8px 0px 9px;
  border-top: 0px;
  border-right: 0px;
  border-left: 0px;
  border-image: none;
  border-bottom: 1px solid var(--mv-hair-strong);
  border-radius: 0px;
  background: none;
  box-shadow: none;
  font-size: 17px;
  line-height: 1.2;
  transition: border-color 0.15s, box-shadow 0.15s;
}

:is(.ab[data-ae="scent-box-chord"] .ab-input, .ab[data-ae="scent-box-chord"].sb-ab.sb-kit .ab-input, .ab[data-ae="scent-box-chord"] .sb-k-field .ab-input, .ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-field .ab-input, .ab[data-ae="scent-box-chord"] .sb-k-search .ab-input, .ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-search .ab-input):focus-within {
  border-bottom-color: var(--ab-ink);
}

.ab[data-ae="scent-box-chord"] .sb-k-select,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-select {
  padding: 8px 0px 9px;
  border-top: 0px;
  border-right: 0px;
  border-left: 0px;
  border-image: none;
  border-bottom: 1px solid var(--mv-hair-strong);
  border-radius: 0px;
  background: none;
  box-shadow: none;
  font-size: 17px;
  line-height: 1.2;
  transition: border-color 0.15s, box-shadow 0.15s;
}

:is(.ab[data-ae="scent-box-chord"] .sb-k-select, .ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-select):focus-within {
  border-bottom-color: var(--ab-ink);
}

.ab[data-ae="scent-box-chord"] .ab-switch,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .ab-switch {
  background: var(--ab-primary);
  color: var(--ab-on-primary);
  border-color: transparent;
  box-shadow: none;
}

:is(.ab[data-ae="scent-box-chord"] .ab-switch, .ab[data-ae="scent-box-chord"].sb-ab.sb-kit .ab-switch):is([aria-selected="true"], [aria-pressed="true"], [aria-checked="true"], :checked, .is-selected) {
  background: var(--ab-ink);
  color: var(--ab-canvas);
  border-color: var(--ab-ink);
}

.ab[data-ae="scent-box-chord"] .sb-k-box[type="checkbox"],
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-box[type="checkbox"] {
  background: var(--ab-primary);
  color: var(--ab-on-primary);
  border-color: transparent;
  box-shadow: none;
}

:is(.ab[data-ae="scent-box-chord"] .sb-k-box[type="checkbox"], .ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-box[type="checkbox"]):is([aria-selected="true"], [aria-pressed="true"], [aria-checked="true"], :checked, .is-selected) {
  background: var(--ab-ink);
  color: var(--ab-canvas);
  border-color: var(--ab-ink);
}

.ab[data-ae="scent-box-chord"] .sb-k-box[type="radio"],
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-box[type="radio"] {
  background: var(--ab-primary);
  color: var(--ab-on-primary);
  border-color: transparent;
  box-shadow: none;
}

:is(.ab[data-ae="scent-box-chord"] .sb-k-box[type="radio"], .ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-box[type="radio"]):is([aria-selected="true"], [aria-pressed="true"], [aria-checked="true"], :checked, .is-selected) {
  background: var(--ab-ink);
  color: var(--ab-canvas);
  border-color: var(--ab-ink);
}

.ab[data-ae="scent-box-chord"] .sb-k-range::-webkit-slider-runnable-track,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-range::-webkit-slider-runnable-track {
  height: 2px;
  border-radius: 0px;
  background: linear-gradient(90deg, var(--ab-ink) var(--v, 50%), var(--mv-hair) var(--v, 50%));
}

.ab[data-ae="scent-box-chord"] .sb-k-range::-webkit-slider-thumb,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-range::-webkit-slider-thumb {
  width: 16px;
  height: 16px;
  border-radius: 0px;
  border: 1px solid var(--ab-ink);
  background: var(--ab-canvas);
  box-shadow: none;
  margin-top: -7px;
}

.ab[data-ae="scent-box-chord"] .ab-seg {
  gap: 24px;
  padding: 0px;
  border-radius: 0px;
  background: none;
  border-bottom: 1px solid var(--mv-hair);
}

.ab[data-ae="scent-box-chord"] .ab-seg-btn,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .ab-seg-btn {
  flex: 0 0 auto;
  min-height: 0px;
  padding: 0px 0px 10px;
  margin-bottom: -1px;
  border-radius: 0px;
  background: none;
  box-shadow: none;
  border-bottom: 2px solid transparent;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0em;
  text-transform: uppercase;
  color: var(--ab-muted);
  transition: color 0.15s, border-color 0.15s;
}

:is(.ab[data-ae="scent-box-chord"] .ab-seg-btn, .ab[data-ae="scent-box-chord"].sb-ab.sb-kit .ab-seg-btn):hover {
  color: var(--ab-ink);
}

.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .ab-seg-btn {
  letter-spacing: 0em;
  min-height: var(--k-tap, 44px) !important;
  font-size: 14px !important;
}

:is(.ab[data-ae="scent-box-chord"] .ab-seg-btn, .ab[data-ae="scent-box-chord"].sb-ab.sb-kit .ab-seg-btn):is([aria-selected="true"], [aria-pressed="true"], [aria-checked="true"], :checked, .is-selected) {
  color: var(--ab-ink);
  font-weight: 600;
  background: none;
  border-bottom-color: var(--ab-primary);
}

:is(.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .ab-seg-btn):is([aria-selected="true"], [aria-pressed="true"], [aria-checked="true"], :checked, .is-selected) {
  border-bottom-color: var(--ab-ink);
}

:is(.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .ab-seg-btn):is([aria-selected="true"], [aria-pressed="true"], [aria-checked="true"], :checked, .is-selected)::after {
  background: var(--ab-ink);
}

.ab[data-ae="scent-box-chord"] .ab-seg {
  gap: 24px;
  padding: 0px;
  border-radius: 0px;
  background: none;
  border-bottom: 1px solid var(--mv-hair);
}

.ab[data-ae="scent-box-chord"] .sb-k-tabs [role="tab"],
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-tabs [role="tab"] {
  flex: 0 0 auto;
  min-height: 0px;
  padding: 0px 0px 10px;
  margin-bottom: -1px;
  border-radius: 0px;
  background: none;
  box-shadow: none;
  border-bottom: 2px solid transparent;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0em;
  text-transform: uppercase;
  color: var(--ab-muted);
  transition: color 0.15s, border-color 0.15s;
}

:is(.ab[data-ae="scent-box-chord"] .sb-k-tabs [role="tab"], .ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-tabs [role="tab"]):hover {
  color: var(--ab-ink);
}

.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-tabs [role="tab"] {
  letter-spacing: 0em;
  min-height: var(--k-tap, 44px) !important;
  font-size: 14px !important;
}

:is(.ab[data-ae="scent-box-chord"] .sb-k-tabs [role="tab"], .ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-tabs [role="tab"]):is([aria-selected="true"], [aria-pressed="true"], [aria-checked="true"], :checked, .is-selected) {
  color: var(--ab-ink);
  font-weight: 600;
  background: none;
  border-bottom-color: var(--ab-primary);
}

:is(.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-tabs [role="tab"]):is([aria-selected="true"], [aria-pressed="true"], [aria-checked="true"], :checked, .is-selected) {
  border-bottom-color: var(--ab-ink);
}

:is(.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-tabs [role="tab"]):is([aria-selected="true"], [aria-pressed="true"], [aria-checked="true"], :checked, .is-selected)::after {
  background: var(--ab-ink);
}

.ab[data-ae="scent-box-chord"] .ab-card,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .ab-card,
.ab[data-ae="scent-box-chord"] .ab-card.sb-k-card,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .ab-card.sb-k-card {
  padding: 0px;
  border: 0px;
  border-radius: 0px;
  background: none;
  box-shadow: none;
}

.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .ab-card:is(.sb-k-card, .sb-home-card),
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .ab-card.sb-k-card:is(.sb-k-card, .sb-home-card) {
  padding-left: 0px !important;
  padding-right: 0px !important;
  padding-bottom: 0px !important;
}

.ab[data-ae="scent-box-chord"] .ab-row,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .ab-row,
.ab[data-ae="scent-box-chord"] .sb-k-row,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-row {
  padding: 0px;
  border: 0px;
  border-radius: 0px;
  background: none;
  box-shadow: none;
}

:is(.ab[data-ae="scent-box-chord"] .ab-row, .ab[data-ae="scent-box-chord"].sb-ab.sb-kit .ab-row, .ab[data-ae="scent-box-chord"] .sb-k-row, .ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-row)[aria-current="page"],
:is(.ab[data-ae="scent-box-chord"] .ab-row, .ab[data-ae="scent-box-chord"].sb-ab.sb-kit .ab-row, .ab[data-ae="scent-box-chord"] .sb-k-row, .ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-row).is-picked {
  background: none;
  font-style: italic;
  font-weight: 400;
  box-shadow: inset 3px 0 0 var(--ab-ink);
}

.ab[data-ae="scent-box-chord"] .sb-k-badge,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-badge,
.ab[data-ae="scent-box-chord"] .sb-k-count,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-count {
  background: var(--ab-ink);
  color: var(--ab-canvas);
  border-color: transparent;
  box-shadow: none;
}

.ab[data-ae="scent-box-chord"] .ab-row-bar,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .ab-row-bar,
.ab[data-ae="scent-box-chord"] .sb-k-bar,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-bar {
  border-radius: 0px;
  background: none;
  border-bottom: 1px solid var(--ab-line);
  box-shadow: none;
  height: 14px !important;
}

.ab[data-ae="scent-box-chord"] .ab-row-bar i,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .ab-row-bar i,
.ab[data-ae="scent-box-chord"] .sb-k-bar i,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-bar i {
  height: 14px;
  border-radius: 0px;
  background: var(--ab-skyline-a) 0 0 / 30px 14px repeat-x;
}

.ab[data-ae="scent-box-chord"] .sb-k-av,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-av {
  border-radius: 0px;
  background: none;
  box-shadow: inset 0 0 0 1px var(--mv-hair-strong);
}

.ab[data-ae="scent-box-chord"] .sb-k-tooltip,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-tooltip {
  background: var(--ab-ink);
  color: var(--ab-canvas);
  border-color: transparent;
  box-shadow: none;
}

.ab[data-ae="scent-box-chord"] .ab-card.sb-k-dialog,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .ab-card.sb-k-dialog,
.ab[data-ae="scent-box-chord"] .sb-k-dialog,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-dialog {
  border-radius: 0px;
  background: none;
  box-shadow: inset 0 0 0 1px var(--mv-hair-strong);
}

.ab[data-ae="scent-box-chord"] .sb-k-sheet,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-sheet {
  border-radius: 0px;
  background: none;
  box-shadow: inset 0 0 0 1px var(--mv-hair-strong);
}

.ab[data-ae="scent-box-chord"] .sb-k-toast,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-toast {
  border-radius: 0px;
  background: none;
  box-shadow: inset 0 0 0 1px var(--mv-hair-strong);
}

.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-callout {
  border-radius: 0px;
  background: none;
  box-shadow: inset 0 0 0 1px var(--mv-hair-strong);
}

.ab[data-ae="scent-box-chord"] .sb-k-menu,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-menu {
  border-radius: 0px;
  background: none;
  box-shadow: inset 0 0 0 1px var(--mv-hair-strong);
}

.ab[data-ae="scent-box-chord"] .sb-k-topbar,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-topbar {
  background: var(--ab-canvas);
  color: var(--ab-ink);
  border-color: transparent;
  box-shadow: none;
}

.ab[data-ae="scent-box-chord"] .sb-k-split-main,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-split-main,
.ab[data-ae="scent-box-chord"] .sb-k-split-more,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-split-more {
  background: none;
  box-shadow: none;
  border-radius: 0px;
  color: var(--ab-ink);
  font-size: 15px;
  letter-spacing: 0em;
  text-transform: uppercase;
}

.ab[data-ae="scent-box-chord"] .sb-k-fab,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-fab {
  background: none;
  box-shadow: none;
  border-radius: 0px;
  color: var(--ab-ink);
  font-size: 15px;
  letter-spacing: 0em;
  text-transform: uppercase;
}

:is(.ab[data-ae="scent-box-chord"] .sb-k-fab, .ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-fab):is(:active, .sb-k-pressed, .is-pressed) {
  opacity: 0.7;
  transform: none;
  filter: none;
  background: none !important;
  box-shadow: none !important;
}

.ab[data-ae="scent-box-chord"] .sb-k-link,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-link {
  background: none;
  box-shadow: none;
  border-radius: 0px;
  color: var(--ab-ink);
  font-size: 15px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.ab[data-ae="scent-box-chord"] .sb-k-stepper,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-stepper {
  padding: 8px 0px 9px;
  border-top: 0px;
  border-right: 0px;
  border-left: 0px;
  border-image: none;
  border-bottom: 1px solid var(--mv-hair-strong);
  border-radius: 0px;
  background: none;
  box-shadow: none;
  font-family: var(--ab-font-h);
  font-style: italic;
  font-size: 24px;
  line-height: 1.2;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.ab[data-ae="scent-box-chord"] .sb-k-knob-dial,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-knob-dial {
  background: var(--ab-primary);
  color: var(--ab-on-primary);
  border-color: transparent;
  box-shadow: none;
}

.ab[data-ae="scent-box-chord"] .sb-k-datefield .ab-input,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-datefield .ab-input {
  padding: 8px 0px 9px;
  border-top: 0px;
  border-right: 0px;
  border-left: 0px;
  border-image: none;
  border-bottom: 1px solid var(--mv-hair-strong);
  border-radius: 0px;
  background: none;
  box-shadow: none;
  font-size: 17px;
  line-height: 1.2;
  transition: border-color 0.15s, box-shadow 0.15s;
}

:is(.ab[data-ae="scent-box-chord"] .sb-k-datefield .ab-input, .ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-datefield .ab-input):focus-within {
  border-bottom-color: var(--ab-ink);
}

.ab[data-ae="scent-box-chord"] .sb-k-combo-in,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-combo-in {
  padding: 8px 0px 9px;
  border-top: 0px;
  border-right: 0px;
  border-left: 0px;
  border-image: none;
  border-bottom: 1px solid var(--mv-hair-strong);
  border-radius: 0px;
  background: none;
  box-shadow: none;
  font-size: 17px;
  line-height: 1.2;
  transition: border-color 0.15s, box-shadow 0.15s;
}

:is(.ab[data-ae="scent-box-chord"] .sb-k-combo-in, .ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-combo-in):focus-within {
  border-bottom-color: var(--ab-ink);
}

.ab[data-ae="scent-box-chord"] .sb-k-listbox,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-listbox {
  padding: 8px 0px 9px;
  border-top: 0px;
  border-right: 0px;
  border-left: 0px;
  border-image: none;
  border-bottom: 1px solid var(--mv-hair-strong);
  border-radius: 0px;
  background: none;
  box-shadow: none;
  font-size: 17px;
  line-height: 1.2;
  transition: border-color 0.15s, box-shadow 0.15s;
}

:is(.ab[data-ae="scent-box-chord"] .sb-k-listbox, .ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-listbox):focus-within {
  border-bottom-color: var(--ab-ink);
}

.ab[data-ae="scent-box-chord"] .sb-k-cal,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-cal {
  border-radius: 0px;
  background: none;
  box-shadow: inset 0 0 0 1px var(--mv-hair-strong);
}

.ab[data-ae="scent-box-chord"] .sb-k-day,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-day {
  border-radius: 0px;
  background: none;
  box-shadow: inset 0 0 0 1px var(--mv-hair-strong);
}

.ab[data-ae="scent-box-chord"] .sb-k-wheel,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-wheel {
  background: var(--ab-primary);
  color: var(--ab-on-primary);
  border-color: transparent;
  box-shadow: none;
}

.ab[data-ae="scent-box-chord"] .sb-k-acc,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-acc {
  border-radius: 0px;
  background: none;
  box-shadow: inset 0 0 0 1px var(--mv-hair-strong);
}

.ab[data-ae="scent-box-chord"] .sb-k-car-card,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-car-card {
  border-radius: 0px;
  background: none;
  box-shadow: inset 0 0 0 1px var(--mv-hair-strong);
}

.ab[data-ae="scent-box-chord"] .sb-k-mx-tile,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-mx-tile {
  border-radius: 0px;
  background: none;
  box-shadow: inset 0 0 0 1px var(--mv-hair-strong);
}

.ab[data-ae="scent-box-chord"] .sb-k-menu-sep,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-menu-sep,
.ab[data-ae="scent-box-chord"] .sb-k-divider .ab-rule,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-divider .ab-rule {
  background: var(--ab-primary);
  color: var(--ab-on-primary);
  border-color: transparent;
  box-shadow: none;
}

.ab[data-ae="scent-box-chord"] .sb-k-section,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-section {
  font-family: var(--ab-font-h);
  font-size: 14px;
  line-height: 1.2;
}

.ab[data-ae="scent-box-chord"] .sb-k-empty,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-empty {
  border-radius: 0px;
  background: none;
  box-shadow: inset 0 0 0 1px var(--mv-hair-strong);
}

.ab[data-ae="scent-box-chord"] .sb-k-scrim,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-scrim {
  background: color-mix(in srgb, var(--ab-ink) 24%, transparent);
  backdrop-filter: blur(3px);
}

@media (prefers-reduced-transparency: reduce) {
  .ab[data-ae="scent-box-chord"] .sb-k-scrim,
  .ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-scrim {
    backdrop-filter: none;
  }
}

.ab[data-ae="scent-box-chord"] .sb-k-side,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-side {
  border-radius: 0px;
  background: none;
  box-shadow: inset 0 0 0 1px var(--mv-hair-strong);
}

.ab[data-ae="scent-box-chord"] .sb-k-drawer,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-drawer {
  border-radius: 0px;
  background: none;
  box-shadow: inset 0 0 0 1px var(--mv-hair-strong);
}

.ab[data-ae="scent-box-chord"] .sb-k-pop,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-pop {
  border-radius: 0px;
  background: none;
  box-shadow: inset 0 0 0 1px var(--mv-hair-strong);
}

.ab[data-ae="scent-box-chord"] .sb-k-tip,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-tip {
  background: var(--ab-ink);
  color: var(--ab-canvas);
  border-color: transparent;
  box-shadow: none;
}

.ab[data-ae="scent-box-chord"] .sb-k-lightbox,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-lightbox {
  border-radius: 0px;
  background: none;
  box-shadow: inset 0 0 0 1px var(--mv-hair-strong);
}

.ab[data-ae="scent-box-chord"] .sb-k-lb-close,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-lb-close,
.ab[data-ae="scent-box-chord"] .sb-k-lb-prev,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-lb-prev,
.ab[data-ae="scent-box-chord"] .sb-k-lb-next,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-lb-next {
  border-radius: 0px;
  background: none;
  box-shadow: inset 0 0 0 1px var(--mv-hair-strong);
}

.ab[data-ae="scent-box-chord"] .sb-k-tb-title,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-tb-title {
  background: none;
  box-shadow: none;
  border-radius: 0px;
  color: var(--ab-ink);
  font-size: 15px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.ab[data-ae="scent-box-chord"] .sb-tabs,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-tabs {
  background: var(--ab-canvas);
  color: var(--ab-ink);
  border-color: transparent;
  box-shadow: none;
}

.ab[data-ae="scent-box-chord"] .sb-k-navmenu,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-navmenu {
  background: var(--ab-canvas);
  color: var(--ab-ink);
  border-color: transparent;
  box-shadow: none;
}

.ab[data-ae="scent-box-chord"] .sb-k-nm-item,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-nm-item {
  border-radius: 0px;
  background: none;
  box-shadow: inset 0 0 0 1px var(--mv-hair-strong);
}

.ab[data-ae="scent-box-chord"] .sb-k-sbar,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-sbar {
  background: var(--ab-primary);
  color: var(--ab-on-primary);
  border-color: transparent;
  box-shadow: none;
}

.ab[data-ae="scent-box-chord"] .sb-k-dd,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-dd {
  padding: 8px 0px 9px;
  border-top: 0px;
  border-right: 0px;
  border-left: 0px;
  border-image: none;
  border-bottom: 1px solid var(--mv-hair-strong);
  border-radius: 0px;
  background: none;
  box-shadow: none;
  font-size: 17px;
  line-height: 1.2;
  transition: border-color 0.15s, box-shadow 0.15s;
}

:is(.ab[data-ae="scent-box-chord"] .sb-k-dd, .ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-dd):focus-within {
  border-bottom-color: var(--ab-ink);
}

.ab[data-ae="scent-box-chord"] .sb-k-menu [role="menuitem"],
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-menu [role="menuitem"],
.ab[data-ae="scent-box-chord"] .sb-k-menu [role="option"],
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-menu [role="option"] {
  border-radius: 0px;
  background: none;
  box-shadow: inset 0 0 0 1px var(--mv-hair-strong);
}

.ab[data-ae="scent-box-chord"] .sb-k-pie,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-pie,
.ab[data-ae="scent-box-chord"] .sb-k-pie-item,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-pie-item {
  border-radius: 0px;
  background: none;
  box-shadow: inset 0 0 0 1px var(--mv-hair-strong);
}

.ab[data-ae="scent-box-chord"] .sb-k-spin,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-spin {
  background: var(--ab-primary);
  color: var(--ab-on-primary);
  border-color: transparent;
  box-shadow: none;
}

.ab[data-ae="scent-box-chord"] .sb-k-skel-line,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-skel-line,
.ab[data-ae="scent-box-chord"] .sb-k-skel-av,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-skel-av,
.ab[data-ae="scent-box-chord"] .sb-k-skel-block,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-k-skel-block {
  border-radius: 0px;
  background: none;
  box-shadow: inset 0 0 0 1px var(--mv-hair-strong);
}

.ab[data-ae="scent-box-chord"] .sb-badge,
.ab[data-ae="scent-box-chord"].sb-ab.sb-kit .sb-badge {
  background: var(--ab-primary);
  color: var(--ab-on-primary);
  border-color: transparent;
  box-shadow: none;
}
```

### Actions

#### Primary button (`btn-primary`)

Use: The one main action on a screen.

- States: rest, pressed, focus, disabled
- Glossary terms covered: Button, Control

State: rest

```html
<button type="button" class="ab-cta sb-k-btn">
  <span class="ab-cta-label">Continue</span>
  <span class="ab-cta-arrow" aria-hidden="true"></span>
</button>
```

State: pressed

```html
<button type="button" class="ab-cta sb-k-btn is-pressed sb-k-pressed">
  <span class="ab-cta-label">Continue</span>
  <span class="ab-cta-arrow" aria-hidden="true"></span>
</button>
```

State: focus

```html
<button type="button" class="ab-cta sb-k-btn is-focus sb-k-focus">
  <span class="ab-cta-label">Continue</span>
  <span class="ab-cta-arrow" aria-hidden="true"></span>
</button>
```

State: disabled

```html
<button type="button" class="ab-cta sb-k-btn" disabled="">
  <span class="ab-cta-label">Continue</span>
  <span class="ab-cta-arrow" aria-hidden="true"></span>
</button>
```

#### Secondary button (`btn-secondary`)

Use: The alternative next to a primary button.

- States: rest, pressed, focus, disabled
- Glossary terms covered: Button

State: rest

```html
<button type="button" class="ab-type-apply sb-k-btn2">Not now</button>
```

State: pressed

```html
<button type="button" class="ab-type-apply sb-k-btn2 is-pressed sb-k-pressed">Not now</button>
```

State: focus

```html
<button type="button" class="ab-type-apply sb-k-btn2 is-focus sb-k-focus">Not now</button>
```

State: disabled

```html
<button type="button" class="ab-type-apply sb-k-btn2" disabled="">Not now</button>
```

#### Text button (`btn-text`)

Use: Low-emphasis actions: Skip, Cancel, See all.

- States: rest, pressed
- Glossary terms covered: Button

State: rest

```html
<button type="button" class="sb-k-textbtn">See all</button>
```

State: pressed

```html
<button type="button" class="sb-k-textbtn is-pressed sb-k-pressed">See all</button>
```

#### Destructive button (`btn-destructive`)

Use: Delete, remove, sign out.

- States: rest, pressed
- Glossary terms covered: Button

State: rest

```html
<button type="button" class="sb-k-danger">Delete</button>
```

State: pressed

```html
<button type="button" class="sb-k-danger is-pressed sb-k-pressed">Delete</button>
```

#### Icon button (`btn-icon`)

Use: A single icon action in a top bar or row.

- States: rest, pressed
- Glossary terms covered: Button

State: rest

```html
<button aria-label="Notifications" type="button" class="ab-type-apply sb-icon-btn sb-k-iconbtn">
  <svg class="sb-ico" data-i="bell" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"></path><path d="M10 20.5a2 2 0 0 0 4 0"></path></svg>
</button>
```

State: pressed

```html
<button aria-label="Notifications" type="button" class="ab-type-apply sb-icon-btn sb-k-iconbtn is-pressed sb-k-pressed">
  <svg class="sb-ico" data-i="bell" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"></path><path d="M10 20.5a2 2 0 0 0 4 0"></path></svg>
</button>
```

#### Split button (`btn-split`)

Use: A default action plus a menu of related ones on an attached chevron.

- States: rest, open
- Glossary terms covered: Split Button

State: rest

```html
<div class="sb-k-splitwrap">
  <div class="sb-k-split">
    <button type="button" class="ab-cta sb-k-btn sb-k-split-main">
      <span class="ab-cta-label">Open project</span>
    </button>
    <button aria-label="More actions" aria-haspopup="menu" aria-expanded="false" type="button" class="ab-cta sb-k-split-more">
      <svg class="sb-ico" data-i="down" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9.5 6 6 6-6"></path></svg>
    </button>
  </div>
</div>
```

State: open

```html
<div class="sb-k-splitwrap">
  <div class="sb-k-split">
    <button type="button" class="ab-cta sb-k-btn sb-k-split-main">
      <span class="ab-cta-label">Open project</span>
    </button>
    <button aria-label="More actions" aria-haspopup="menu" aria-expanded="true" type="button" class="ab-cta sb-k-split-more">
      <svg class="sb-ico" data-i="down" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9.5 6 6 6-6"></path></svg>
    </button>
  </div>
  <ul class="sb-k-menu sb-k-cmdmenu" role="menu">
    <li role="menuitem" aria-selected="true">
      <svg class="sb-ico" data-i="edit" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m4.5 19.5 1-4.2 9.8-9.8a1.8 1.8 0 0 1 2.5 0l.7.7a1.8 1.8 0 0 1 0 2.5l-9.8 9.8z"></path><path d="m13.5 7.5 3 3"></path></svg>
      <span>Save as draft</span>
    </li>
    <li role="menuitem">
      <svg class="sb-ico" data-i="copy" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="8.5" y="8.5" width="11" height="11" rx="2"></rect><path d="M15.5 8.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7.5a2 2 0 0 0 2 2h2.5"></path></svg>
      <span>Duplicate</span>
    </li>
    <li role="menuitem">
      <svg class="sb-ico" data-i="share" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 15V4M8 7.5l4-4 4 4"></path><path d="M6 11h-.5A1.5 1.5 0 0 0 4 12.5v6A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5v-6a1.5 1.5 0 0 0-1.5-1.5H18"></path></svg>
      <span>Share</span>
    </li>
  </ul>
</div>
```

#### Floating button (`fab`)

Use: The screen's main create action, floating above scrolling content.

- States: rest, pressed
- Glossary terms covered: Floating Button

State: rest

```html
<div class="sb-k-fabbox">
  <ul class="ab-list sb-k-list is-open">
    <li class="ab-row sb-k-row" tabindex="0">
      <span class="sb-k-lead">
        <span class="sb-k-av sb-k-av-s" aria-hidden="true">L</span>
      </span>
      <span class="sb-k-text">
        <span class="sb-k-title">Launch site</span>
        <span class="sb-k-sub">
          Atlas
          <span class="sb-k-mid">·</span>
          Feedback
        </span>
      </span>
      <span class="sb-k-trail">
        45%
        <span class="sb-k-chev">
          <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
        </span>
      </span>
    </li>
    <li class="ab-row sb-k-row" tabindex="0">
      <span class="sb-k-lead">
        <span class="sb-k-av sb-k-av-s" aria-hidden="true">A</span>
      </span>
      <span class="sb-k-text">
        <span class="sb-k-title">Annual report</span>
        <span class="sb-k-sub">Proofs</span>
      </span>
      <span class="sb-k-trail">
        92%
        <span class="sb-k-chev">
          <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
        </span>
      </span>
    </li>
  </ul>
  <button aria-label="New project" type="button" class="ab-cta sb-k-fab">
    <svg class="sb-ico" data-i="plus" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 5v14M5 12h14"></path></svg>
  </button>
</div>
```

State: pressed

```html
<div class="sb-k-fabbox">
  <ul class="ab-list sb-k-list is-open">
    <li class="ab-row sb-k-row" tabindex="0">
      <span class="sb-k-lead">
        <span class="sb-k-av sb-k-av-s" aria-hidden="true">L</span>
      </span>
      <span class="sb-k-text">
        <span class="sb-k-title">Launch site</span>
        <span class="sb-k-sub">
          Atlas
          <span class="sb-k-mid">·</span>
          Feedback
        </span>
      </span>
      <span class="sb-k-trail">
        45%
        <span class="sb-k-chev">
          <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
        </span>
      </span>
    </li>
    <li class="ab-row sb-k-row" tabindex="0">
      <span class="sb-k-lead">
        <span class="sb-k-av sb-k-av-s" aria-hidden="true">A</span>
      </span>
      <span class="sb-k-text">
        <span class="sb-k-title">Annual report</span>
        <span class="sb-k-sub">Proofs</span>
      </span>
      <span class="sb-k-trail">
        92%
        <span class="sb-k-chev">
          <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
        </span>
      </span>
    </li>
  </ul>
  <button aria-label="New project" type="button" class="ab-cta sb-k-fab is-pressed sb-k-pressed">
    <svg class="sb-ico" data-i="plus" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 5v14M5 12h14"></path></svg>
  </button>
</div>
```

#### Link (`link`)

Use: Text that goes to another page or opens a resource.

- States: rest, pressed, focus
- Glossary terms covered: Link

State: rest

```html
<p class="sb-k-para">
  By continuing you accept the
  <a role="link" tabindex="0" class="sb-k-link">terms of use</a>
  .
</p>
```

State: pressed

```html
<p class="sb-k-para">
  By continuing you accept the
  <a role="link" tabindex="0" class="sb-k-link is-pressed sb-k-pressed">terms of use</a>
  .
</p>
```

State: focus

```html
<p class="sb-k-para">
  By continuing you accept the
  <a role="link" tabindex="0" class="sb-k-link is-focus sb-k-focus">terms of use</a>
  .
</p>
```

#### Icon (`icon`)

Use: One line-icon set at fixed sizes, always paired with a label or an accessible name.

- States: rest
- Glossary terms covered: Icon

State: rest

```html
<div class="sb-k-icons">
  <span class="sb-k-icon">
    <svg class="sb-ico" data-i="search" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="6.5"></circle><path d="m16 16 4.5 4.5"></path></svg>
    <span>Search · 20</span>
  </span>
  <span class="sb-k-icon">
    <svg class="sb-ico" data-i="home" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 11.5 12 4l9 7.5"></path><path d="M5.5 10v9.5h13V10"></path></svg>
    <span>Home · 24</span>
  </span>
  <span class="sb-k-icon">
    <svg class="sb-ico" data-i="gear" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="3"></circle><path d="M12 2.5v3M12 18.5v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2.5 12h3M18.5 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"></path></svg>
    <span>Settings · 28</span>
  </span>
</div>
```

### Inputs

#### Text field (`field`)

Use: Single-line entry with a label above it.

- States: rest, focus, error, disabled
- Glossary terms covered: Control, Input Control, Textbox

State: rest

```html
<div class="sb-field sb-k-field is-rest">
  <label class="ab-fieldlabel" for="sb43b-kf44">Email</label>
  <input class="ab-input" type="text" value="" placeholder="you@example.com" autocomplete="off" spellcheck="false">
  <p class="sb-k-help">We send receipts here.</p>
</div>
```

State: focus

```html
<div class="sb-field sb-k-field is-focus">
  <label class="ab-fieldlabel" for="sb43b-kf45">Email</label>
  <input class="ab-input" type="text" value="maya@scentbox.com" placeholder="you@example.com" autocomplete="off" spellcheck="false">
</div>
```

State: error

```html
<div class="sb-field sb-k-field is-error">
  <label class="ab-fieldlabel" for="sb43b-kf46">Email</label>
  <input class="ab-input" type="text" value="hello@" placeholder="you@example.com" autocomplete="off" spellcheck="false" aria-invalid="true">
  <p class="sb-k-help is-error">Enter a full email address.</p>
</div>
```

State: disabled

```html
<div class="sb-field sb-k-field is-disabled">
  <label class="ab-fieldlabel" for="sb43b-kf47">Email</label>
  <input class="ab-input" type="text" value="maya@scentbox.com" placeholder="you@example.com" autocomplete="off" spellcheck="false" disabled="">
</div>
```

#### Search field (`search`)

Use: Search with a leading icon.

- States: rest, focus
- Glossary terms covered: Input Control, Textbox

State: rest

```html
<div class="sb-search sb-k-search is-rest">
  <svg class="sb-ico" data-i="search" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="6.5"></circle><path d="m16 16 4.5 4.5"></path></svg>
  <input class="ab-input" type="text" placeholder="Search projects" value="" aria-label="Search projects" autocomplete="off">
</div>
```

State: focus

```html
<div class="sb-search sb-k-search is-focus">
  <svg class="sb-ico" data-i="search" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="6.5"></circle><path d="m16 16 4.5 4.5"></path></svg>
  <input class="ab-input" type="text" placeholder="Search projects" value="Brand" aria-label="Search projects" autocomplete="off">
</div>
```

#### Select (`select`)

Use: Pick one value from a list.

- States: rest, open
- Glossary terms covered: Dropdown List, Input Control

State: rest

```html
<div class="sb-k-selectwrap">
  <p class="ab-fieldlabel">Show</p>
  <button type="button" class="ab-input sb-k-select" aria-haspopup="listbox" aria-expanded="false">
    <span>Active</span>
    <svg class="sb-ico" data-i="down" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9.5 6 6 6-6"></path></svg>
  </button>
</div>
```

State: open

```html
<div class="sb-k-selectwrap">
  <p class="ab-fieldlabel">Show</p>
  <button type="button" class="ab-input sb-k-select" aria-haspopup="listbox" aria-expanded="true">
    <span>Active</span>
    <svg class="sb-ico" data-i="down" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9.5 6 6 6-6"></path></svg>
  </button>
  <ul class="sb-k-menu" role="listbox">
    <li role="option" aria-selected="true">
      <span>Active</span>
      <svg class="sb-ico" data-i="check" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m5 12.5 4.5 4.5L19 7.5"></path></svg>
    </li>
    <li role="option" aria-selected="false">
      <span>Done</span>
    </li>
    <li role="option" aria-selected="false">
      <span>Everything</span>
    </li>
  </ul>
</div>
```

#### Combo box (`combo`)

Use: Type a value or pick one of the suggestions that match.

- States: rest, open
- Glossary terms covered: Combo Box, Input Control

State: rest

```html
<div class="sb-field sb-k-field sb-k-combo is-rest">
  <label class="ab-fieldlabel" for="sb43b-kc48">Assign to</label>
  <input class="ab-input sb-k-combo-in" type="text" role="combobox" aria-autocomplete="list" aria-expanded="false" value="" placeholder="Type a name" autocomplete="off" spellcheck="false">
</div>
```

State: open

```html
<div class="sb-field sb-k-field sb-k-combo is-focus">
  <label class="ab-fieldlabel" for="sb43b-kc49">Assign to</label>
  <input class="ab-input sb-k-combo-in" type="text" role="combobox" aria-autocomplete="list" aria-expanded="true" value="Ma" placeholder="Type a name" autocomplete="off" spellcheck="false">
  <ul class="sb-k-menu" role="listbox">
    <li role="option" aria-selected="true">
      <span>
        <mark class="sb-k-match">Ma</mark>
        ya Ortiz
      </span>
    </li>
    <li role="option" aria-selected="false">
      <span>
        <mark class="sb-k-match">Ma</mark>
        ra Lindqvist
      </span>
    </li>
    <li role="option" aria-selected="false">
      <span>
        <mark class="sb-k-match">Ma</mark>
        rcus Webb
      </span>
    </li>
  </ul>
</div>
```

#### Listbox (`listbox`)

Use: A visible list of options; pick one or several without opening anything.

- States: single, multiple
- Glossary terms covered: Input Control, Listbox

State: single

```html
<ul class="sb-k-menu sb-k-listbox" role="listbox" aria-label="Needs you">
  <li role="option" aria-selected="true">
    <span>Launch site</span>
    <svg class="sb-ico" data-i="check" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m5 12.5 4.5 4.5L19 7.5"></path></svg>
  </li>
  <li role="option" aria-selected="false">
    <span>Annual report</span>
  </li>
  <li role="option" aria-selected="false">
    <span>Spring campaign</span>
  </li>
</ul>
```

State: multiple

```html
<ul class="sb-k-menu sb-k-listbox" role="listbox" aria-multiselectable="true" aria-label="Needs you">
  <li role="option" aria-selected="true">
    <input class="sb-k-box" type="checkbox" tabindex="-1" aria-hidden="true" checked="">
    <span>Launch site</span>
  </li>
  <li role="option" aria-selected="false">
    <input class="sb-k-box" type="checkbox" tabindex="-1" aria-hidden="true">
    <span>Annual report</span>
  </li>
  <li role="option" aria-selected="true">
    <input class="sb-k-box" type="checkbox" tabindex="-1" aria-hidden="true" checked="">
    <span>Spring campaign</span>
  </li>
</ul>
```

#### Checkbox (`checkbox`)

Use: Multi-select options.

- States: off, on, disabled
- Glossary terms covered: Checkbox, Control, Input Control, State-Switch Control

State: off

```html
<label class="sb-k-check">
  <input class="sb-k-box" type="checkbox">
  <span>Email me receipts</span>
</label>
```

State: on

```html
<label class="sb-k-check">
  <input class="sb-k-box" type="checkbox" checked="">
  <span>Email me receipts</span>
</label>
```

State: disabled

```html
<label class="sb-k-check is-disabled">
  <input class="sb-k-box" type="checkbox" checked="" disabled="">
  <span>Email me receipts</span>
</label>
```

#### Radio (`radio`)

Use: Single choice from a short list.

- States: off, on
- Glossary terms covered: Input Control, Radio Button, State-Switch Control

State: off

```html
<label class="sb-k-check">
  <input class="sb-k-box" type="radio" name="sb43b-kr50">
  <span>Daily</span>
</label>
```

State: on

```html
<label class="sb-k-check">
  <input class="sb-k-box" type="radio" name="sb43b-kr51" checked="">
  <span>Weekly</span>
</label>
```

#### Toggle (`toggle`)

Use: An on/off setting that applies at once.

- States: off, on, disabled
- Glossary terms covered: Control, Input Control, State-Switch Control, Toggle

State: off

```html
<label class="ab-toggle sb-tog" for="sb43b-t52">
  <span>Push notifications</span>
  <input class="ab-switch" type="checkbox">
</label>
```

State: on

```html
<label class="ab-toggle sb-tog" for="sb43b-t53">
  <span>Push notifications</span>
  <input class="ab-switch" type="checkbox" checked="">
</label>
```

State: disabled

```html
<label class="ab-toggle sb-tog is-disabled" for="sb43b-t54">
  <span>Push notifications</span>
  <input class="ab-switch" type="checkbox" checked="" disabled="">
</label>
```

#### Segmented control (`segmented`)

Use: Switch between 2 to 4 views of the same content.

- States: rest
- Glossary terms covered: Input Control, Segmented Button, State-Switch Control

State: rest

```html
<div class="ab-seg" role="group" aria-label="Show">
  <button type="button" class="ab-seg-btn" aria-pressed="true">Active</button>
  <button type="button" class="ab-seg-btn" aria-pressed="false">Done</button>
  <button type="button" class="ab-seg-btn" aria-pressed="false">All</button>
</div>
```

#### Input stepper (`stepper`)

Use: Raise or lower a small whole number one step at a time.

- States: rest, minimum
- Glossary terms covered: Control, Input Control, Input Stepper

State: rest

```html
<div class="sb-k-stepwrap">
  <span class="sb-k-step-l">Quantity</span>
  <div class="sb-k-stepper">
    <button aria-label="Decrease" type="button" class="ab-type-apply sb-icon-btn sb-k-iconbtn sb-k-step">
      <svg class="sb-ico" data-i="minus" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14"></path></svg>
    </button>
    <output class="sb-k-step-val" aria-live="polite">2</output>
    <button aria-label="Increase" type="button" class="ab-type-apply sb-icon-btn sb-k-iconbtn sb-k-step">
      <svg class="sb-ico" data-i="plus" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 5v14M5 12h14"></path></svg>
    </button>
  </div>
</div>
```

State: minimum

```html
<div class="sb-k-stepwrap">
  <span class="sb-k-step-l">Quantity</span>
  <div class="sb-k-stepper">
    <button aria-label="Decrease" type="button" class="ab-type-apply sb-icon-btn sb-k-iconbtn sb-k-step" disabled="">
      <svg class="sb-ico" data-i="minus" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14"></path></svg>
    </button>
    <output class="sb-k-step-val" aria-live="polite">0</output>
    <button aria-label="Increase" type="button" class="ab-type-apply sb-icon-btn sb-k-iconbtn sb-k-step">
      <svg class="sb-ico" data-i="plus" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 5v14M5 12h14"></path></svg>
    </button>
  </div>
</div>
```

#### Slider (`slider`)

Use: A value on a continuous range.

- States: rest
- Glossary terms covered: Control, Input Control, Range Control, Slider

State: rest

```html
<div class="sb-k-slider">
  <div class="sb-k-slider-h">
    <span>Volume</span>
    <span>60%</span>
  </div>
  <input class="sb-k-range" type="range" min="0" max="100" value="60" style="--v:60%" aria-label="Volume">
</div>
```

#### Knob (`knob`)

Use: A value on a range, turned like a dial: audio and other media controls.

- States: rest
- Glossary terms covered: Input Control, Knob, Range Control

State: rest

```html
<div class="sb-k-knobwrap">
  <div class="sb-k-knob" role="slider" aria-label="Gain" aria-valuemin="0" aria-valuemax="100" aria-valuenow="65" style="--v:0.65">
    <span class="sb-k-knob-arc"></span>
    <span class="sb-k-knob-dial">
      <i class="sb-k-knob-ind"></i>
    </span>
  </div>
  <div class="sb-k-knob-txt">
    <b>Gain</b>
    <span class="sb-k-knob-val">65%</span>
  </div>
</div>
```

### Pickers

#### Date picker (`date-field`)

Use: A date shown in a field; tapping it opens the calendar or wheels.

- States: rest, focus
- Glossary terms covered: Date Picker, Picker

State: rest

```html
<div class="sb-field sb-k-field sb-k-datefield is-rest">
  <label class="ab-fieldlabel" for="sb43b-kd55">Due date</label>
  <input class="ab-input" type="text" value="Nov 14, 2026" aria-haspopup="dialog" autocomplete="off" spellcheck="false" readonly="">
  <span class="sb-k-date-ico">
    <svg class="sb-ico" data-i="calendar" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"></rect><path d="M3.5 10h17M8 3v4M16 3v4"></path></svg>
  </span>
</div>
```

State: focus

```html
<div class="sb-field sb-k-field sb-k-datefield is-focus">
  <label class="ab-fieldlabel" for="sb43b-kd56">Due date</label>
  <input class="ab-input" type="text" value="Nov 14, 2026" aria-haspopup="dialog" autocomplete="off" spellcheck="false" readonly="">
  <span class="sb-k-date-ico">
    <svg class="sb-ico" data-i="calendar" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"></rect><path d="M3.5 10h17M8 3v4M16 3v4"></path></svg>
  </span>
</div>
```

#### Calendar picker (`calendar`)

Use: A month grid for choosing a day or a range of days.

- States: single, range
- Glossary terms covered: Calendar Picker, Date Picker, Picker

State: single

```html
<div class="sb-k-cal">
  <div class="sb-k-cal-head">
    <button type="button" class="sb-k-plain" aria-label="Previous month">
      <svg class="sb-ico" data-i="back" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m14.5 6-6 6 6 6"></path></svg>
    </button>
    <span class="sb-k-cal-t">November 2026</span>
    <button type="button" class="sb-k-plain" aria-label="Next month">
      <svg class="sb-ico" data-i="chev" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
    </button>
  </div>
  <div class="sb-k-cal-grid" role="grid">
    <span class="sb-k-cal-dow" aria-hidden="true">M</span>
    <span class="sb-k-cal-dow" aria-hidden="true">T</span>
    <span class="sb-k-cal-dow" aria-hidden="true">W</span>
    <span class="sb-k-cal-dow" aria-hidden="true">T</span>
    <span class="sb-k-cal-dow" aria-hidden="true">F</span>
    <span class="sb-k-cal-dow" aria-hidden="true">S</span>
    <span class="sb-k-cal-dow" aria-hidden="true">S</span>
    <button type="button" class="sb-k-day is-out" tabindex="-1" aria-hidden="true">26</button>
    <button type="button" class="sb-k-day is-out" tabindex="-1" aria-hidden="true">27</button>
    <button type="button" class="sb-k-day is-out" tabindex="-1" aria-hidden="true">28</button>
    <button type="button" class="sb-k-day is-out" tabindex="-1" aria-hidden="true">29</button>
    <button type="button" class="sb-k-day is-out" tabindex="-1" aria-hidden="true">30</button>
    <button type="button" class="sb-k-day is-out" tabindex="-1" aria-hidden="true">31</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 1">1</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 2">2</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 3">3</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 4">4</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 5">5</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 6">6</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 7">7</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 8">8</button>
    <button type="button" class="sb-k-day is-today" tabindex="-1" aria-label="November 9">9</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 10">10</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 11">11</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 12">12</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 13">13</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 14">14</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 15">15</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 16">16</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 17">17</button>
    <button type="button" class="sb-k-day is-sel" tabindex="-1" aria-label="November 18" aria-pressed="true">18</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 19">19</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 20">20</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 21">21</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 22">22</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 23">23</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 24">24</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 25">25</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 26">26</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 27">27</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 28">28</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 29">29</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 30">30</button>
    <button type="button" class="sb-k-day is-out" tabindex="-1" aria-hidden="true">1</button>
    <button type="button" class="sb-k-day is-out" tabindex="-1" aria-hidden="true">2</button>
    <button type="button" class="sb-k-day is-out" tabindex="-1" aria-hidden="true">3</button>
    <button type="button" class="sb-k-day is-out" tabindex="-1" aria-hidden="true">4</button>
    <button type="button" class="sb-k-day is-out" tabindex="-1" aria-hidden="true">5</button>
    <button type="button" class="sb-k-day is-out" tabindex="-1" aria-hidden="true">6</button>
  </div>
</div>
```

State: range

```html
<div class="sb-k-cal">
  <div class="sb-k-cal-head">
    <button type="button" class="sb-k-plain" aria-label="Previous month">
      <svg class="sb-ico" data-i="back" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m14.5 6-6 6 6 6"></path></svg>
    </button>
    <span class="sb-k-cal-t">November 2026</span>
    <button type="button" class="sb-k-plain" aria-label="Next month">
      <svg class="sb-ico" data-i="chev" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
    </button>
  </div>
  <div class="sb-k-cal-grid" role="grid">
    <span class="sb-k-cal-dow" aria-hidden="true">M</span>
    <span class="sb-k-cal-dow" aria-hidden="true">T</span>
    <span class="sb-k-cal-dow" aria-hidden="true">W</span>
    <span class="sb-k-cal-dow" aria-hidden="true">T</span>
    <span class="sb-k-cal-dow" aria-hidden="true">F</span>
    <span class="sb-k-cal-dow" aria-hidden="true">S</span>
    <span class="sb-k-cal-dow" aria-hidden="true">S</span>
    <button type="button" class="sb-k-day is-out" tabindex="-1" aria-hidden="true">26</button>
    <button type="button" class="sb-k-day is-out" tabindex="-1" aria-hidden="true">27</button>
    <button type="button" class="sb-k-day is-out" tabindex="-1" aria-hidden="true">28</button>
    <button type="button" class="sb-k-day is-out" tabindex="-1" aria-hidden="true">29</button>
    <button type="button" class="sb-k-day is-out" tabindex="-1" aria-hidden="true">30</button>
    <button type="button" class="sb-k-day is-out" tabindex="-1" aria-hidden="true">31</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 1">1</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 2">2</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 3">3</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 4">4</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 5">5</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 6">6</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 7">7</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 8">8</button>
    <button type="button" class="sb-k-day is-today" tabindex="-1" aria-label="November 9">9</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 10">10</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 11">11</button>
    <button type="button" class="sb-k-day is-sel is-range is-start" tabindex="-1" aria-label="November 12" aria-pressed="true">12</button>
    <button type="button" class="sb-k-day is-range" tabindex="-1" aria-label="November 13">13</button>
    <button type="button" class="sb-k-day is-range" tabindex="-1" aria-label="November 14">14</button>
    <button type="button" class="sb-k-day is-range" tabindex="-1" aria-label="November 15">15</button>
    <button type="button" class="sb-k-day is-range" tabindex="-1" aria-label="November 16">16</button>
    <button type="button" class="sb-k-day is-range" tabindex="-1" aria-label="November 17">17</button>
    <button type="button" class="sb-k-day is-sel is-range is-end" tabindex="-1" aria-label="November 18" aria-pressed="true">18</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 19">19</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 20">20</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 21">21</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 22">22</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 23">23</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 24">24</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 25">25</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 26">26</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 27">27</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 28">28</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 29">29</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 30">30</button>
    <button type="button" class="sb-k-day is-out" tabindex="-1" aria-hidden="true">1</button>
    <button type="button" class="sb-k-day is-out" tabindex="-1" aria-hidden="true">2</button>
    <button type="button" class="sb-k-day is-out" tabindex="-1" aria-hidden="true">3</button>
    <button type="button" class="sb-k-day is-out" tabindex="-1" aria-hidden="true">4</button>
    <button type="button" class="sb-k-day is-out" tabindex="-1" aria-hidden="true">5</button>
    <button type="button" class="sb-k-day is-out" tabindex="-1" aria-hidden="true">6</button>
  </div>
</div>
```

#### Wheel picker (`wheel`)

Use: Spinning columns of values with the choice in a centre band.

- States: rest
- Glossary terms covered: Picker, Wheel Picker

State: rest

```html
<div class="sb-k-wheel" role="group" aria-label="Time">
  <div class="sb-k-wheel-col" role="listbox" aria-label="Hour">
    <span class="sb-k-wheel-item is-d2" role="option" aria-selected="false">7</span>
    <span class="sb-k-wheel-item is-d1" role="option" aria-selected="false">8</span>
    <span class="sb-k-wheel-item is-d0 is-sel" role="option" aria-selected="true">9</span>
    <span class="sb-k-wheel-item is-d1" role="option" aria-selected="false">10</span>
    <span class="sb-k-wheel-item is-d2" role="option" aria-selected="false">11</span>
  </div>
  <div class="sb-k-wheel-col" role="listbox" aria-label="Minute">
    <span class="sb-k-wheel-item is-d2" role="option" aria-selected="false">10</span>
    <span class="sb-k-wheel-item is-d1" role="option" aria-selected="false">20</span>
    <span class="sb-k-wheel-item is-d0 is-sel" role="option" aria-selected="true">30</span>
    <span class="sb-k-wheel-item is-d1" role="option" aria-selected="false">40</span>
    <span class="sb-k-wheel-item is-d2" role="option" aria-selected="false">50</span>
  </div>
  <i class="sb-k-wheel-band" aria-hidden="true"></i>
</div>
```

#### Wheel-style date picker (`wheel-date`)

Use: Month, day and year as three wheels.

- States: rest
- Glossary terms covered: Date Picker, Picker, Wheel-Style Date Picker

State: rest

```html
<div class="sb-k-wheel" role="group" aria-label="Date">
  <div class="sb-k-wheel-col" role="listbox" aria-label="Month">
    <span class="sb-k-wheel-item is-d2" role="option" aria-selected="false">Sep</span>
    <span class="sb-k-wheel-item is-d1" role="option" aria-selected="false">Oct</span>
    <span class="sb-k-wheel-item is-d0 is-sel" role="option" aria-selected="true">Nov</span>
    <span class="sb-k-wheel-item is-d1" role="option" aria-selected="false">Dec</span>
    <span class="sb-k-wheel-item is-d2" role="option" aria-selected="false">Jan</span>
  </div>
  <div class="sb-k-wheel-col" role="listbox" aria-label="Day">
    <span class="sb-k-wheel-item is-d2" role="option" aria-selected="false">12</span>
    <span class="sb-k-wheel-item is-d1" role="option" aria-selected="false">13</span>
    <span class="sb-k-wheel-item is-d0 is-sel" role="option" aria-selected="true">14</span>
    <span class="sb-k-wheel-item is-d1" role="option" aria-selected="false">15</span>
    <span class="sb-k-wheel-item is-d2" role="option" aria-selected="false">16</span>
  </div>
  <div class="sb-k-wheel-col" role="listbox" aria-label="Year">
    <span class="sb-k-wheel-item is-d2" role="option" aria-selected="false">2024</span>
    <span class="sb-k-wheel-item is-d1" role="option" aria-selected="false">2025</span>
    <span class="sb-k-wheel-item is-d0 is-sel" role="option" aria-selected="true">2026</span>
    <span class="sb-k-wheel-item is-d1" role="option" aria-selected="false">2027</span>
    <span class="sb-k-wheel-item is-d2" role="option" aria-selected="false">2028</span>
  </div>
  <i class="sb-k-wheel-band" aria-hidden="true"></i>
</div>
```

### Containers

#### Card (`card`)

Use: A boxed group of related content and its action.

- States: rest
- Glossary terms covered: Card, Container

State: rest

```html
<div class="ab-card sb-k-card">
  <div class="ab-seg" role="group" aria-label="Show">
    <button type="button" class="ab-seg-btn" aria-pressed="true">Active</button>
    <button type="button" class="ab-seg-btn" aria-pressed="false">Done</button>
  </div>
  <h3 class="ab-card-title">Brand refresh</h3>
  <p class="ab-card-body">
    Fernwood
    <span class="sb-k-mid">·</span>
    round two due Friday
  </p>
  <button type="button" class="ab-cta sb-k-btn">
    <span class="ab-cta-label">Open project</span>
    <span class="ab-cta-arrow" aria-hidden="true"></span>
  </button>
</div>
```

#### List rows (`list`)

Use: Grouped rows: label, value, chevron or control.

- States: rest, pressed
- Glossary terms covered: Container

State: rest

```html
<ul class="ab-list sb-k-list is-open">
  <li class="ab-row sb-k-row" tabindex="0">
    <span class="sb-k-lead">
      <span class="sb-k-av sb-k-av-s" aria-hidden="true">L</span>
    </span>
    <span class="sb-k-text">
      <span class="sb-k-title">Launch site</span>
      <span class="sb-k-sub">
        Atlas
        <span class="sb-k-mid">·</span>
        Feedback
      </span>
    </span>
    <span class="sb-k-trail">
      45%
      <span class="sb-k-chev">
        <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
      </span>
    </span>
  </li>
  <li class="ab-row sb-k-row" tabindex="0">
    <span class="sb-k-lead">
      <span class="sb-k-av sb-k-av-s" aria-hidden="true">A</span>
    </span>
    <span class="sb-k-text">
      <span class="sb-k-title">Annual report</span>
      <span class="sb-k-sub">Proofs</span>
    </span>
    <span class="sb-k-trail">
      92%
      <span class="sb-k-chev">
        <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
      </span>
    </span>
  </li>
  <li class="ab-row sb-k-row" tabindex="0">
    <span class="sb-k-lead">
      <span class="sb-k-av sb-k-av-s" aria-hidden="true">S</span>
    </span>
    <span class="sb-k-text">
      <span class="sb-k-title">Spring campaign</span>
      <span class="sb-k-sub">Brief</span>
    </span>
    <span class="sb-k-trail">
      10%
      <span class="sb-k-chev">
        <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
      </span>
    </span>
  </li>
</ul>
```

State: pressed

```html
<ul class="ab-list sb-k-list">
  <li class="ab-row sb-k-row is-picked" tabindex="0">
    <span class="sb-k-lead">
      <span class="sb-k-av sb-k-av-s" aria-hidden="true">A</span>
    </span>
    <span class="sb-k-text">
      <span class="sb-k-title">Annual report</span>
      <span class="sb-k-sub">Proofs</span>
    </span>
    <span class="sb-k-trail">
      92%
      <span class="sb-k-chev">
        <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
      </span>
    </span>
  </li>
</ul>
```

#### Accordion (`accordion`)

Use: Stacked headings that each open to show their section.

- States: closed, open
- Glossary terms covered: Accordion, Container

State: closed

```html
<div class="ab-list sb-k-list sb-k-accordion">
  <details class="sb-k-acc">
    <summary class="ab-row sb-k-row is-nolead sb-k-acc-sum">
      <span class="sb-k-text">
        <span class="sb-k-title">Launch site</span>
      </span>
      <span class="sb-k-trail">
        <span class="sb-k-chev sb-k-acc-chev">
          <svg class="sb-ico" data-i="down" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9.5 6 6 6-6"></path></svg>
        </span>
      </span>
    </summary>
    <p class="sb-k-acc-body">Feedback · 45% complete. Open it to see who is on it and what comes next.</p>
  </details>
  <details class="sb-k-acc">
    <summary class="ab-row sb-k-row is-nolead sb-k-acc-sum">
      <span class="sb-k-text">
        <span class="sb-k-title">Annual report</span>
      </span>
      <span class="sb-k-trail">
        <span class="sb-k-chev sb-k-acc-chev">
          <svg class="sb-ico" data-i="down" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9.5 6 6 6-6"></path></svg>
        </span>
      </span>
    </summary>
    <p class="sb-k-acc-body">Proofs · 92% complete. Open it to see who is on it and what comes next.</p>
  </details>
  <details class="sb-k-acc">
    <summary class="ab-row sb-k-row is-nolead sb-k-acc-sum">
      <span class="sb-k-text">
        <span class="sb-k-title">Spring campaign</span>
      </span>
      <span class="sb-k-trail">
        <span class="sb-k-chev sb-k-acc-chev">
          <svg class="sb-ico" data-i="down" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9.5 6 6 6-6"></path></svg>
        </span>
      </span>
    </summary>
    <p class="sb-k-acc-body">Brief · 10% complete. Open it to see who is on it and what comes next.</p>
  </details>
</div>
```

State: open

```html
<div class="ab-list sb-k-list sb-k-accordion">
  <details class="sb-k-acc" open="">
    <summary class="ab-row sb-k-row is-nolead sb-k-acc-sum">
      <span class="sb-k-text">
        <span class="sb-k-title">Launch site</span>
      </span>
      <span class="sb-k-trail">
        <span class="sb-k-chev sb-k-acc-chev">
          <svg class="sb-ico" data-i="down" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9.5 6 6 6-6"></path></svg>
        </span>
      </span>
    </summary>
    <p class="sb-k-acc-body">Feedback · 45% complete. Open it to see who is on it and what comes next.</p>
  </details>
  <details class="sb-k-acc">
    <summary class="ab-row sb-k-row is-nolead sb-k-acc-sum">
      <span class="sb-k-text">
        <span class="sb-k-title">Annual report</span>
      </span>
      <span class="sb-k-trail">
        <span class="sb-k-chev sb-k-acc-chev">
          <svg class="sb-ico" data-i="down" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9.5 6 6 6-6"></path></svg>
        </span>
      </span>
    </summary>
    <p class="sb-k-acc-body">Proofs · 92% complete. Open it to see who is on it and what comes next.</p>
  </details>
  <details class="sb-k-acc">
    <summary class="ab-row sb-k-row is-nolead sb-k-acc-sum">
      <span class="sb-k-text">
        <span class="sb-k-title">Spring campaign</span>
      </span>
      <span class="sb-k-trail">
        <span class="sb-k-chev sb-k-acc-chev">
          <svg class="sb-ico" data-i="down" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9.5 6 6 6-6"></path></svg>
        </span>
      </span>
    </summary>
    <p class="sb-k-acc-body">Brief · 10% complete. Open it to see who is on it and what comes next.</p>
  </details>
</div>
```

#### Carousel (`carousel`)

Use: A row of cards that swipes sideways, one page at a time.

- States: rest
- Glossary terms covered: Carousel, Container

State: rest

```html
<div class="sb-k-carousel">
  <div class="sb-k-car-track" role="group" aria-roledescription="carousel" aria-label="Needs you" tabindex="0">
    <div class="ab-card sb-k-card sb-k-car-card">
      <div class="sb-k-ph" aria-hidden="true">
        <svg class="sb-ico" data-i="image" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"></rect><circle cx="9" cy="10" r="1.6"></circle><path d="m4 17.5 5-4.5 4 3.5 3-2.5 4 3.5"></path></svg>
      </div>
      <h3 class="ab-card-title">Launch site</h3>
      <p class="ab-card-body">Feedback · 45%</p>
    </div>
    <div class="ab-card sb-k-card sb-k-car-card">
      <div class="sb-k-ph" aria-hidden="true">
        <svg class="sb-ico" data-i="image" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"></rect><circle cx="9" cy="10" r="1.6"></circle><path d="m4 17.5 5-4.5 4 3.5 3-2.5 4 3.5"></path></svg>
      </div>
      <h3 class="ab-card-title">Annual report</h3>
      <p class="ab-card-body">Proofs · 92%</p>
    </div>
    <div class="ab-card sb-k-card sb-k-car-card">
      <div class="sb-k-ph" aria-hidden="true">
        <svg class="sb-ico" data-i="image" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"></rect><circle cx="9" cy="10" r="1.6"></circle><path d="m4 17.5 5-4.5 4 3.5 3-2.5 4 3.5"></path></svg>
      </div>
      <h3 class="ab-card-title">Spring campaign</h3>
      <p class="ab-card-body">Brief · 10%</p>
    </div>
  </div>
  <div class="sb-k-dots" aria-hidden="true">
    <i class="is-on"></i>
    <i></i>
    <i></i>
  </div>
</div>
```

#### 2D matrix (`matrix`)

Use: Rows of tiles: scroll down through rows, sideways within a row.

- States: rest
- Glossary terms covered: 2D Matrix, Container

State: rest

```html
<div class="sb-k-matrix">
  <div class="sb-k-mx-row">
    <div class="ab-labelrow sb-k-section sb-k-mx-label">
      <span class="ab-label">Needs you</span>
      <button type="button" class="sb-k-textbtn sb-k-see">See all</button>
    </div>
    <div class="sb-k-mx-track">
      <div class="sb-k-mx-tile">
        <div class="sb-k-ph" aria-hidden="true">
          <svg class="sb-ico" data-i="image" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"></rect><circle cx="9" cy="10" r="1.6"></circle><path d="m4 17.5 5-4.5 4 3.5 3-2.5 4 3.5"></path></svg>
        </div>
        <span>Launch site</span>
      </div>
      <div class="sb-k-mx-tile">
        <div class="sb-k-ph" aria-hidden="true">
          <svg class="sb-ico" data-i="image" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"></rect><circle cx="9" cy="10" r="1.6"></circle><path d="m4 17.5 5-4.5 4 3.5 3-2.5 4 3.5"></path></svg>
        </div>
        <span>Annual report</span>
      </div>
      <div class="sb-k-mx-tile">
        <div class="sb-k-ph" aria-hidden="true">
          <svg class="sb-ico" data-i="image" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"></rect><circle cx="9" cy="10" r="1.6"></circle><path d="m4 17.5 5-4.5 4 3.5 3-2.5 4 3.5"></path></svg>
        </div>
        <span>Spring campaign</span>
      </div>
      <div class="sb-k-mx-tile">
        <div class="sb-k-ph" aria-hidden="true">
          <svg class="sb-ico" data-i="image" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"></rect><circle cx="9" cy="10" r="1.6"></circle><path d="m4 17.5 5-4.5 4 3.5 3-2.5 4 3.5"></path></svg>
        </div>
        <span>Brand refresh</span>
      </div>
      <div class="sb-k-mx-tile">
        <div class="sb-k-ph" aria-hidden="true">
          <svg class="sb-ico" data-i="image" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"></rect><circle cx="9" cy="10" r="1.6"></circle><path d="m4 17.5 5-4.5 4 3.5 3-2.5 4 3.5"></path></svg>
        </div>
        <span>Launch site</span>
      </div>
      <div class="sb-k-mx-tile">
        <div class="sb-k-ph" aria-hidden="true">
          <svg class="sb-ico" data-i="image" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"></rect><circle cx="9" cy="10" r="1.6"></circle><path d="m4 17.5 5-4.5 4 3.5 3-2.5 4 3.5"></path></svg>
        </div>
        <span>Spring campaign</span>
      </div>
      <div class="sb-k-mx-tile">
        <div class="sb-k-ph" aria-hidden="true">
          <svg class="sb-ico" data-i="image" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"></rect><circle cx="9" cy="10" r="1.6"></circle><path d="m4 17.5 5-4.5 4 3.5 3-2.5 4 3.5"></path></svg>
        </div>
        <span>Annual report</span>
      </div>
    </div>
  </div>
  <div class="sb-k-mx-row">
    <div class="ab-labelrow sb-k-section sb-k-mx-label">
      <span class="ab-label">Active</span>
      <button type="button" class="sb-k-textbtn sb-k-see">See all</button>
    </div>
    <div class="sb-k-mx-track">
      <div class="sb-k-mx-tile">
        <div class="sb-k-ph" aria-hidden="true">
          <svg class="sb-ico" data-i="image" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"></rect><circle cx="9" cy="10" r="1.6"></circle><path d="m4 17.5 5-4.5 4 3.5 3-2.5 4 3.5"></path></svg>
        </div>
        <span>Brand refresh</span>
      </div>
      <div class="sb-k-mx-tile">
        <div class="sb-k-ph" aria-hidden="true">
          <svg class="sb-ico" data-i="image" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"></rect><circle cx="9" cy="10" r="1.6"></circle><path d="m4 17.5 5-4.5 4 3.5 3-2.5 4 3.5"></path></svg>
        </div>
        <span>Launch site</span>
      </div>
      <div class="sb-k-mx-tile">
        <div class="sb-k-ph" aria-hidden="true">
          <svg class="sb-ico" data-i="image" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"></rect><circle cx="9" cy="10" r="1.6"></circle><path d="m4 17.5 5-4.5 4 3.5 3-2.5 4 3.5"></path></svg>
        </div>
        <span>Spring campaign</span>
      </div>
      <div class="sb-k-mx-tile">
        <div class="sb-k-ph" aria-hidden="true">
          <svg class="sb-ico" data-i="image" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"></rect><circle cx="9" cy="10" r="1.6"></circle><path d="m4 17.5 5-4.5 4 3.5 3-2.5 4 3.5"></path></svg>
        </div>
        <span>Annual report</span>
      </div>
      <div class="sb-k-mx-tile">
        <div class="sb-k-ph" aria-hidden="true">
          <svg class="sb-ico" data-i="image" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"></rect><circle cx="9" cy="10" r="1.6"></circle><path d="m4 17.5 5-4.5 4 3.5 3-2.5 4 3.5"></path></svg>
        </div>
        <span>Launch site</span>
      </div>
      <div class="sb-k-mx-tile">
        <div class="sb-k-ph" aria-hidden="true">
          <svg class="sb-ico" data-i="image" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"></rect><circle cx="9" cy="10" r="1.6"></circle><path d="m4 17.5 5-4.5 4 3.5 3-2.5 4 3.5"></path></svg>
        </div>
        <span>Annual report</span>
      </div>
      <div class="sb-k-mx-tile">
        <div class="sb-k-ph" aria-hidden="true">
          <svg class="sb-ico" data-i="image" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"></rect><circle cx="9" cy="10" r="1.6"></circle><path d="m4 17.5 5-4.5 4 3.5 3-2.5 4 3.5"></path></svg>
        </div>
        <span>Spring campaign</span>
      </div>
    </div>
  </div>
</div>
```

#### Callout (`callout`)

Use: An inline message: info, success, warning, error.

- States: info, success, warning, error
- Glossary terms covered: Container

State: info

```html
<div class="sb-k-callout" data-tone="info" role="status">
  <svg class="sb-ico" data-i="info" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"></circle><path d="M12 11v5.5M12 7.6v.2"></path></svg>
  <div>
    <b>Heads up</b>
    <span>Prices change on the first of next month.</span>
  </div>
</div>
```

State: success

```html
<div class="sb-k-callout" data-tone="success" role="status">
  <svg class="sb-ico" data-i="ok" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"></circle><path d="m8 12.3 2.8 2.8L16.2 9.5"></path></svg>
  <div>
    <b>Saved</b>
    <span>Your changes are live for everyone.</span>
  </div>
</div>
```

State: warning

```html
<div class="sb-k-callout" data-tone="warning" role="status">
  <svg class="sb-ico" data-i="warn" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3.5 21.5 20h-19z"></path><path d="M12 10v4.5M12 17.2v.2"></path></svg>
  <div>
    <b>Almost full</b>
    <span>You have used 90% of your storage.</span>
  </div>
</div>
```

State: error

```html
<div class="sb-k-callout" data-tone="error" role="alert">
  <svg class="sb-ico" data-i="err" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"></circle><path d="m9 9 6 6M15 9l-6 6"></path></svg>
  <div>
    <b>Payment failed</b>
    <span>Update your card to keep your plan.</span>
  </div>
</div>
```

#### Divider and section label (`divider`)

Use: Separates and names groups of content.

- States: rest

State: rest

```html
<div class="sb-k-divider">
  <div class="ab-labelrow sb-k-section">
    <span class="ab-label">Needs you</span>
    <span class="ab-label">3 items</span>
  </div>
  <p class="sb-k-para">Rows in a group sit under one section label.</p>
  <div class="ab-rule"></div>
  <p class="sb-k-para">A rule separates groups.</p>
</div>
```

### Overlays

#### Overlay (`overlay`)

Use: The dimmed layer behind anything modal; tapping it closes non-critical overlays.

- States: rest
- Glossary terms covered: Overlay

State: rest

```html
<div class="sb-k-overlaybox">
  <div class="sb-k-under" aria-hidden="true" inert="">
    <div class="sb-k-topbar">
      <span></span>
      <span class="sb-k-tb-title">Needs you</span>
      <span></span>
    </div>
    <ul class="ab-list sb-k-list is-open">
      <li class="ab-row sb-k-row" tabindex="0">
        <span class="sb-k-lead">
          <span class="sb-k-av sb-k-av-s" aria-hidden="true">L</span>
        </span>
        <span class="sb-k-text">
          <span class="sb-k-title">Launch site</span>
          <span class="sb-k-sub">
            Atlas
            <span class="sb-k-mid">·</span>
            Feedback
          </span>
        </span>
        <span class="sb-k-trail">
          45%
          <span class="sb-k-chev">
            <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
          </span>
        </span>
      </li>
      <li class="ab-row sb-k-row" tabindex="0">
        <span class="sb-k-lead">
          <span class="sb-k-av sb-k-av-s" aria-hidden="true">A</span>
        </span>
        <span class="sb-k-text">
          <span class="sb-k-title">Annual report</span>
          <span class="sb-k-sub">Proofs</span>
        </span>
        <span class="sb-k-trail">
          92%
          <span class="sb-k-chev">
            <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
          </span>
        </span>
      </li>
      <li class="ab-row sb-k-row" tabindex="0">
        <span class="sb-k-lead">
          <span class="sb-k-av sb-k-av-s" aria-hidden="true">S</span>
        </span>
        <span class="sb-k-text">
          <span class="sb-k-title">Spring campaign</span>
          <span class="sb-k-sub">Brief</span>
        </span>
        <span class="sb-k-trail">
          10%
          <span class="sb-k-chev">
            <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
          </span>
        </span>
      </li>
    </ul>
  </div>
  <i class="sb-k-scrim" aria-hidden="true"></i>
  <div class="sb-k-toast sb-k-scrimnote" role="note">
    <span>Tap the dimmed area to close</span>
  </div>
</div>
```

#### Dialog (`dialog`)

Use: A centred box that stops the task for a decision or a warning.

- States: rest
- Glossary terms covered: Dialog, Overlay

State: rest

```html
<div class="sb-k-sheetbox sb-k-dialogbox is-under">
  <div class="sb-k-under" aria-hidden="true" inert="">
    <ul class="ab-list sb-k-list is-open">
      <li class="ab-row sb-k-row" tabindex="0">
        <span class="sb-k-lead">
          <span class="sb-k-av sb-k-av-s" aria-hidden="true">L</span>
        </span>
        <span class="sb-k-text">
          <span class="sb-k-title">Launch site</span>
          <span class="sb-k-sub">
            Atlas
            <span class="sb-k-mid">·</span>
            Feedback
          </span>
        </span>
        <span class="sb-k-trail">
          45%
          <span class="sb-k-chev">
            <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
          </span>
        </span>
      </li>
      <li class="ab-row sb-k-row" tabindex="0">
        <span class="sb-k-lead">
          <span class="sb-k-av sb-k-av-s" aria-hidden="true">A</span>
        </span>
        <span class="sb-k-text">
          <span class="sb-k-title">Annual report</span>
          <span class="sb-k-sub">Proofs</span>
        </span>
        <span class="sb-k-trail">
          92%
          <span class="sb-k-chev">
            <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
          </span>
        </span>
      </li>
      <li class="ab-row sb-k-row" tabindex="0">
        <span class="sb-k-lead">
          <span class="sb-k-av sb-k-av-s" aria-hidden="true">S</span>
        </span>
        <span class="sb-k-text">
          <span class="sb-k-title">Spring campaign</span>
          <span class="sb-k-sub">Brief</span>
        </span>
        <span class="sb-k-trail">
          10%
          <span class="sb-k-chev">
            <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
          </span>
        </span>
      </li>
    </ul>
  </div>
  <div class="ab-card sb-k-card sb-k-dialog" role="dialog" aria-modal="true" aria-labelledby="sb43b-kdl57">
    <h3 class="ab-card-title sb-k-dialog-t">Delete this item?</h3>
    <p class="ab-card-body sb-k-dialog-b">It is removed for everyone and cannot be recovered.</p>
    <div class="sb-k-dialog-a">
      <button type="button" class="ab-type-apply sb-k-btn2">Cancel</button>
      <button type="button" class="sb-k-danger">Delete</button>
    </div>
  </div>
</div>
```

#### Bottom sheet (`sheet`)

Use: A task or set of choices that slides up from the bottom.

- States: rest
- Glossary terms covered: Bottom Sheet

State: rest

```html
<div class="sb-k-sheetbox">
  <div class="sb-k-sheet" role="dialog" aria-label="Leave without saving?">
    <span class="sb-k-grab" aria-hidden="true"></span>
    <h3 class="ab-card-title sb-k-sheet-t">Leave without saving?</h3>
    <p class="sb-k-sheet-b">Your changes to this projects will be lost.</p>
    <div class="sb-k-sheet-a">
      <button type="button" class="ab-cta sb-k-btn">
        <span class="ab-cta-label">Keep editing</span>
        <span class="ab-cta-arrow" aria-hidden="true"></span>
      </button>
      <button type="button" class="ab-type-apply sb-k-btn2">Discard</button>
    </div>
  </div>
</div>
```

#### Side sheet (`side-sheet`)

Use: Supporting content or filters that slide in from the side edge.

- States: rest
- Glossary terms covered: Side Sheet

State: rest

```html
<div class="sb-k-sheetbox sb-k-sidebox is-under">
  <div class="sb-k-under" aria-hidden="true" inert="">
    <ul class="ab-list sb-k-list is-open">
      <li class="ab-row sb-k-row" tabindex="0">
        <span class="sb-k-lead">
          <span class="sb-k-av sb-k-av-s" aria-hidden="true">L</span>
        </span>
        <span class="sb-k-text">
          <span class="sb-k-title">Launch site</span>
          <span class="sb-k-sub">
            Atlas
            <span class="sb-k-mid">·</span>
            Feedback
          </span>
        </span>
        <span class="sb-k-trail">
          45%
          <span class="sb-k-chev">
            <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
          </span>
        </span>
      </li>
      <li class="ab-row sb-k-row" tabindex="0">
        <span class="sb-k-lead">
          <span class="sb-k-av sb-k-av-s" aria-hidden="true">A</span>
        </span>
        <span class="sb-k-text">
          <span class="sb-k-title">Annual report</span>
          <span class="sb-k-sub">Proofs</span>
        </span>
        <span class="sb-k-trail">
          92%
          <span class="sb-k-chev">
            <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
          </span>
        </span>
      </li>
      <li class="ab-row sb-k-row" tabindex="0">
        <span class="sb-k-lead">
          <span class="sb-k-av sb-k-av-s" aria-hidden="true">S</span>
        </span>
        <span class="sb-k-text">
          <span class="sb-k-title">Spring campaign</span>
          <span class="sb-k-sub">Brief</span>
        </span>
        <span class="sb-k-trail">
          10%
          <span class="sb-k-chev">
            <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
          </span>
        </span>
      </li>
    </ul>
  </div>
  <aside class="sb-k-side" role="dialog" aria-label="Filters">
    <div class="sb-k-side-h">
      <h3 class="ab-card-title sb-k-sheet-t">Filters</h3>
      <button type="button" class="sb-k-plain" aria-label="Close">
        <svg class="sb-ico" data-i="close" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 6 12 12M18 6 6 18"></path></svg>
      </button>
    </div>
    <div class="ab-labelrow sb-k-section">
      <span class="ab-label">Status</span>
    </div>
    <label class="sb-k-check">
      <input class="sb-k-box" type="checkbox" checked="">
      <span>Feedback</span>
    </label>
    <label class="sb-k-check">
      <input class="sb-k-box" type="checkbox">
      <span>Proofs</span>
    </label>
    <label class="sb-k-check">
      <input class="sb-k-box" type="checkbox">
      <span>Brief</span>
    </label>
    <div class="sb-k-sheet-a">
      <button type="button" class="ab-cta sb-k-btn">
        <span class="ab-cta-label">Apply</span>
        <span class="ab-cta-arrow" aria-hidden="true"></span>
      </button>
      <button type="button" class="ab-type-apply sb-k-btn2">Reset</button>
    </div>
  </aside>
</div>
```

#### Popup (`popover`)

Use: A small panel attached to the control that opened it.

- States: rest
- Glossary terms covered: Popup

State: rest

```html
<div class="sb-k-popbox">
  <button aria-haspopup="dialog" aria-expanded="true" type="button" class="ab-type-apply sb-k-btn2 sb-k-auto">
    <svg class="sb-ico" data-i="share" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 15V4M8 7.5l4-4 4 4"></path><path d="M6 11h-.5A1.5 1.5 0 0 0 4 12.5v6A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5v-6a1.5 1.5 0 0 0-1.5-1.5H18"></path></svg>
    <span>Share</span>
  </button>
  <div class="ab-card sb-k-card sb-k-pop" role="dialog" aria-label="Share">
    <i class="sb-k-pop-arrow" aria-hidden="true"></i>
    <h3 class="ab-card-title">Share link</h3>
    <p class="ab-card-body">Anyone with the link can view. Only you can edit.</p>
    <button type="button" class="sb-k-textbtn">Copy link</button>
  </div>
</div>
```

#### Popup tip (`popup-tip`)

Use: A one-time hint pointing at a feature, with a way to dismiss it.

- States: rest
- Glossary terms covered: Popup Tip

State: rest

```html
<div class="sb-k-popbox is-end">
  <button aria-label="New project" type="button" class="ab-type-apply sb-icon-btn sb-k-iconbtn sb-k-tip-target">
    <svg class="sb-ico" data-i="plus" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 5v14M5 12h14"></path></svg>
  </button>
  <div class="ab-card sb-k-card sb-k-pop sb-k-tip" role="dialog" aria-label="Tip">
    <i class="sb-k-pop-arrow" aria-hidden="true"></i>
    <h3 class="ab-card-title sb-k-tip-t">Start here</h3>
    <p class="ab-card-body sb-k-tip-b">Tap plus to new project. You can change it later.</p>
    <button type="button" class="sb-k-textbtn">Got it</button>
  </div>
</div>
```

#### Tooltip (`tooltip`)

Use: A short label for a control, shown on hover, focus or long press.

- States: rest
- Glossary terms covered: Tooltip

State: rest

```html
<div class="sb-k-popbox is-tooltip">
  <button aria-describedby="sb43b-ktt58" aria-label="Notifications" type="button" class="ab-type-apply sb-icon-btn sb-k-iconbtn ">
    <svg class="sb-ico" data-i="bell" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"></path><path d="M10 20.5a2 2 0 0 0 4 0"></path></svg>
  </button>
  <div class="sb-k-tooltip" role="tooltip">
    Notifications
    <i class="sb-k-pop-arrow is-down" aria-hidden="true"></i>
  </div>
</div>
```

#### Lightbox (`lightbox`)

Use: One image enlarged over a dark layer, with close and next.

- States: rest
- Glossary terms covered: Lightbox, Overlay

State: rest

```html
<div class="sb-k-lightbox" role="dialog" aria-label="Image 3 of 12">
  <div class="sb-k-lb-img sb-k-ph" aria-hidden="true">
    <svg class="sb-ico" data-i="image" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"></rect><circle cx="9" cy="10" r="1.6"></circle><path d="m4 17.5 5-4.5 4 3.5 3-2.5 4 3.5"></path></svg>
  </div>
  <button type="button" class="sb-k-plain sb-k-lb-close" aria-label="Close">
    <svg class="sb-ico" data-i="close" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 6 12 12M18 6 6 18"></path></svg>
  </button>
  <button type="button" class="sb-k-plain sb-k-lb-prev" aria-label="Previous image">
    <svg class="sb-ico" data-i="back" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m14.5 6-6 6 6 6"></path></svg>
  </button>
  <button type="button" class="sb-k-plain sb-k-lb-next" aria-label="Next image">
    <svg class="sb-ico" data-i="chev" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
  </button>
  <p class="sb-k-lb-cap">3 of 12</p>
</div>
```

### Navigation

#### Top bar (`topbar`)

Use: Screen title, back and one or two icon actions.

- States: rest
- Glossary terms covered: Navigation Bar

State: rest

```html
<div class="sb-k-topbar">
  <button type="button" class="sb-k-plain" aria-label="Back">
    <svg class="sb-ico" data-i="back" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m14.5 6-6 6 6 6"></path></svg>
  </button>
  <span class="sb-k-tb-title">Settings</span>
  <button type="button" class="sb-k-plain" aria-label="More">
    <svg class="sb-ico" data-i="more" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="5.5" cy="12" r="1.2"></circle><circle cx="12" cy="12" r="1.2"></circle><circle cx="18.5" cy="12" r="1.2"></circle></svg>
  </button>
</div>
```

#### Tab bar (`tabbar`)

Use: 3 to 5 top-level destinations at the bottom of a phone.

- States: rest
- Glossary terms covered: Tab Bar

State: rest

```html
<div class="sb-k-tabbarbox">
  <nav class="sb-tabs" aria-label="App">
    <button type="button" class="sb-tab" aria-current="page">
      <svg class="sb-ico" data-i="home" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 11.5 12 4l9 7.5"></path><path d="M5.5 10v9.5h13V10"></path></svg>
      <span>Home</span>
    </button>
    <button type="button" class="sb-tab">
      <svg class="sb-ico" data-i="list" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M8 6h12M8 12h12M8 18h12"></path><circle cx="4" cy="6" r="1"></circle><circle cx="4" cy="12" r="1"></circle><circle cx="4" cy="18" r="1"></circle></svg>
      <span>Projects</span>
    </button>
    <button type="button" class="sb-tab">
      <svg class="sb-ico" data-i="heart" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"></path></svg>
      <span>Inbox</span>
    </button>
    <button type="button" class="sb-tab">
      <svg class="sb-ico" data-i="user" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="8" r="4"></circle><path d="M4 21c1-4 4.2-6 8-6s7 2 8 6"></path></svg>
      <span>Profile</span>
    </button>
  </nav>
</div>
```

#### Tabs (`tabs`)

Use: In-page sections under a title.

- States: rest
- Glossary terms covered: Tab Bar

State: rest

```html
<div class="sb-k-tabs" role="tablist">
  <button type="button" role="tab" aria-selected="true">Overview</button>
  <button type="button" role="tab" aria-selected="false">Activity</button>
  <button type="button" role="tab" aria-selected="false">Members</button>
</div>
```

#### Navigation menu (`nav-menu`)

Use: A vertical list of destinations with the current one marked.

- States: rest
- Glossary terms covered: Menu, Navigation Menu

State: rest

```html
<nav class="ab-list sb-k-list sb-k-navmenu" aria-label="Sections">
  <a role="link" aria-current="page" class="sb-k-nm-item ab-row sb-k-row is-picked" tabindex="0">
    <span class="sb-k-lead">
      <span class="sb-k-ico">
        <svg class="sb-ico" data-i="home" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 11.5 12 4l9 7.5"></path><path d="M5.5 10v9.5h13V10"></path></svg>
      </span>
    </span>
    <span class="sb-k-text">
      <span class="sb-k-title">Overview</span>
    </span>
    <span class="sb-k-trail">
      <svg class="sb-ico" data-i="check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m5 12.5 4.5 4.5L19 7.5"></path></svg>
    </span>
  </a>
  <a role="link" class="sb-k-nm-item ab-row sb-k-row" tabindex="0">
    <span class="sb-k-lead">
      <span class="sb-k-ico">
        <svg class="sb-ico" data-i="list" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M8 6h12M8 12h12M8 18h12"></path><circle cx="4" cy="6" r="1"></circle><circle cx="4" cy="12" r="1"></circle><circle cx="4" cy="18" r="1"></circle></svg>
      </span>
    </span>
    <span class="sb-k-text">
      <span class="sb-k-title">Projects</span>
    </span>
    <span class="sb-k-trail"></span>
  </a>
  <a role="link" class="sb-k-nm-item ab-row sb-k-row" tabindex="0">
    <span class="sb-k-lead">
      <span class="sb-k-ico">
        <svg class="sb-ico" data-i="users" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="9" cy="8" r="3.5"></circle><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5"></path><path d="M16 4.8a3.5 3.5 0 0 1 0 6.4M18.5 14.8c1.5.8 2.6 2.5 3 5.2"></path></svg>
      </span>
    </span>
    <span class="sb-k-text">
      <span class="sb-k-title">Clients</span>
    </span>
    <span class="sb-k-trail"></span>
  </a>
  <a role="link" class="sb-k-nm-item ab-row sb-k-row" tabindex="0">
    <span class="sb-k-lead">
      <span class="sb-k-ico">
        <svg class="sb-ico" data-i="box" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5z"></path><path d="M3.5 7.5 12 12l8.5-4.5M12 12v9"></path></svg>
      </span>
    </span>
    <span class="sb-k-text">
      <span class="sb-k-title">Proposals</span>
    </span>
    <span class="sb-k-trail"></span>
  </a>
</nav>
```

#### Drawer menu (`drawer`)

Use: Navigation hidden behind a menu button, sliding in from the side.

- States: rest
- Glossary terms covered: Drawer Menu, Menu

State: rest

```html
<div class="sb-k-sheetbox sb-k-drawerbox is-under">
  <div class="sb-k-under" aria-hidden="true" inert="">
    <div class="sb-k-topbar">
      <button type="button" class="sb-k-plain" aria-label="Menu">
        <svg class="sb-ico" data-i="menu" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 7h16M4 12h16M4 17h16"></path></svg>
      </button>
      <span class="sb-k-tb-title">Needs you</span>
      <span></span>
    </div>
    <ul class="ab-list sb-k-list is-open">
      <li class="ab-row sb-k-row" tabindex="0">
        <span class="sb-k-lead">
          <span class="sb-k-av sb-k-av-s" aria-hidden="true">L</span>
        </span>
        <span class="sb-k-text">
          <span class="sb-k-title">Launch site</span>
          <span class="sb-k-sub">
            Atlas
            <span class="sb-k-mid">·</span>
            Feedback
          </span>
        </span>
        <span class="sb-k-trail">
          45%
          <span class="sb-k-chev">
            <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
          </span>
        </span>
      </li>
      <li class="ab-row sb-k-row" tabindex="0">
        <span class="sb-k-lead">
          <span class="sb-k-av sb-k-av-s" aria-hidden="true">A</span>
        </span>
        <span class="sb-k-text">
          <span class="sb-k-title">Annual report</span>
          <span class="sb-k-sub">Proofs</span>
        </span>
        <span class="sb-k-trail">
          92%
          <span class="sb-k-chev">
            <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
          </span>
        </span>
      </li>
      <li class="ab-row sb-k-row" tabindex="0">
        <span class="sb-k-lead">
          <span class="sb-k-av sb-k-av-s" aria-hidden="true">S</span>
        </span>
        <span class="sb-k-text">
          <span class="sb-k-title">Spring campaign</span>
          <span class="sb-k-sub">Brief</span>
        </span>
        <span class="sb-k-trail">
          10%
          <span class="sb-k-chev">
            <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
          </span>
        </span>
      </li>
    </ul>
  </div>
  <aside class="sb-k-drawer" role="dialog" aria-label="Menu">
    <span class="ab-brand sb-k-tb-brand">
      <span class="ab-mark" aria-hidden="true">
        <span>S</span>
      </span>
      <span class="ab-wordmark">Scent Box</span>
    </span>
    <nav class="ab-list sb-k-list sb-k-navmenu" aria-label="Sections">
      <a role="link" aria-current="page" class="sb-k-nm-item ab-row sb-k-row is-picked" tabindex="0">
        <span class="sb-k-lead">
          <span class="sb-k-ico">
            <svg class="sb-ico" data-i="home" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 11.5 12 4l9 7.5"></path><path d="M5.5 10v9.5h13V10"></path></svg>
          </span>
        </span>
        <span class="sb-k-text">
          <span class="sb-k-title">Overview</span>
        </span>
        <span class="sb-k-trail">
          <svg class="sb-ico" data-i="check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m5 12.5 4.5 4.5L19 7.5"></path></svg>
        </span>
      </a>
      <a role="link" class="sb-k-nm-item ab-row sb-k-row" tabindex="0">
        <span class="sb-k-lead">
          <span class="sb-k-ico">
            <svg class="sb-ico" data-i="list" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M8 6h12M8 12h12M8 18h12"></path><circle cx="4" cy="6" r="1"></circle><circle cx="4" cy="12" r="1"></circle><circle cx="4" cy="18" r="1"></circle></svg>
          </span>
        </span>
        <span class="sb-k-text">
          <span class="sb-k-title">Projects</span>
        </span>
        <span class="sb-k-trail"></span>
      </a>
      <a role="link" class="sb-k-nm-item ab-row sb-k-row" tabindex="0">
        <span class="sb-k-lead">
          <span class="sb-k-ico">
            <svg class="sb-ico" data-i="users" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="9" cy="8" r="3.5"></circle><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5"></path><path d="M16 4.8a3.5 3.5 0 0 1 0 6.4M18.5 14.8c1.5.8 2.6 2.5 3 5.2"></path></svg>
          </span>
        </span>
        <span class="sb-k-text">
          <span class="sb-k-title">Clients</span>
        </span>
        <span class="sb-k-trail"></span>
      </a>
      <a role="link" class="sb-k-nm-item ab-row sb-k-row" tabindex="0">
        <span class="sb-k-lead">
          <span class="sb-k-ico">
            <svg class="sb-ico" data-i="box" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5z"></path><path d="M3.5 7.5 12 12l8.5-4.5M12 12v9"></path></svg>
          </span>
        </span>
        <span class="sb-k-text">
          <span class="sb-k-title">Proposals</span>
        </span>
        <span class="sb-k-trail"></span>
      </a>
    </nav>
  </aside>
</div>
```

#### Scrollbar (`scrollbar`)

Use: Shows where you are in content that scrolls, and drags it.

- States: rest
- Glossary terms covered: Scrollbar

State: rest

```html
<div class="sb-k-scroll">
  <div class="sb-k-scrollbox">
    <ul class="ab-list sb-k-list is-open">
      <li class="ab-row sb-k-row" tabindex="0">
        <span class="sb-k-lead">
          <span class="sb-k-av sb-k-av-s" aria-hidden="true">L</span>
        </span>
        <span class="sb-k-text">
          <span class="sb-k-title">Launch site</span>
          <span class="sb-k-sub">
            Atlas
            <span class="sb-k-mid">·</span>
            Feedback
          </span>
        </span>
        <span class="sb-k-trail">
          45%
          <span class="sb-k-chev">
            <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
          </span>
        </span>
      </li>
      <li class="ab-row sb-k-row" tabindex="0">
        <span class="sb-k-lead">
          <span class="sb-k-av sb-k-av-s" aria-hidden="true">A</span>
        </span>
        <span class="sb-k-text">
          <span class="sb-k-title">Annual report</span>
          <span class="sb-k-sub">Proofs</span>
        </span>
        <span class="sb-k-trail">
          92%
          <span class="sb-k-chev">
            <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
          </span>
        </span>
      </li>
      <li class="ab-row sb-k-row" tabindex="0">
        <span class="sb-k-lead">
          <span class="sb-k-av sb-k-av-s" aria-hidden="true">S</span>
        </span>
        <span class="sb-k-text">
          <span class="sb-k-title">Spring campaign</span>
          <span class="sb-k-sub">Brief</span>
        </span>
        <span class="sb-k-trail">
          10%
          <span class="sb-k-chev">
            <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
          </span>
        </span>
      </li>
      <li class="ab-row sb-k-row" tabindex="0">
        <span class="sb-k-lead">
          <span class="sb-k-av sb-k-av-s" aria-hidden="true">B</span>
        </span>
        <span class="sb-k-text">
          <span class="sb-k-title">Brand refresh</span>
          <span class="sb-k-sub">
            Fernwood
            <span class="sb-k-mid">·</span>
            In review
          </span>
        </span>
        <span class="sb-k-trail">
          72%
          <span class="sb-k-chev">
            <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
          </span>
        </span>
      </li>
      <li class="ab-row sb-k-row" tabindex="0">
        <span class="sb-k-lead">
          <span class="sb-k-av sb-k-av-s" aria-hidden="true">L</span>
        </span>
        <span class="sb-k-text">
          <span class="sb-k-title">Launch site</span>
          <span class="sb-k-sub">
            Atlas
            <span class="sb-k-mid">·</span>
            Building
          </span>
        </span>
        <span class="sb-k-trail">
          45%
          <span class="sb-k-chev">
            <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
          </span>
        </span>
      </li>
      <li class="ab-row sb-k-row" tabindex="0">
        <span class="sb-k-lead">
          <span class="sb-k-av sb-k-av-s" aria-hidden="true">S</span>
        </span>
        <span class="sb-k-text">
          <span class="sb-k-title">Spring campaign</span>
          <span class="sb-k-sub">
            Marlow
            <span class="sb-k-mid">·</span>
            Planned
          </span>
        </span>
        <span class="sb-k-trail">
          10%
          <span class="sb-k-chev">
            <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
          </span>
        </span>
      </li>
      <li class="ab-row sb-k-row" tabindex="0">
        <span class="sb-k-lead">
          <span class="sb-k-av sb-k-av-s" aria-hidden="true">A</span>
        </span>
        <span class="sb-k-text">
          <span class="sb-k-title">Annual report</span>
          <span class="sb-k-sub">
            Kestrel
            <span class="sb-k-mid">·</span>
            Final proofs
          </span>
        </span>
        <span class="sb-k-trail">
          92%
          <span class="sb-k-chev">
            <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
          </span>
        </span>
      </li>
    </ul>
  </div>
  <div class="sb-k-sbar" role="scrollbar" aria-orientation="vertical" aria-controls="sb43b-ksb59" aria-valuemin="0" aria-valuemax="100" aria-valuenow="20">
    <i class="sb-k-sbar-thumb" style="--t:20%;--h:42%"></i>
  </div>
</div>
```

### Menus

#### Dropdown menu (`dropdown-menu`)

Use: A button that opens a list of commands.

- States: rest, open
- Glossary terms covered: Dropdown Menu, Menu

State: rest

```html
<div class="sb-k-ddwrap">
  <button aria-haspopup="menu" aria-expanded="false" type="button" class="ab-type-apply sb-k-btn2 sb-k-dd">
    <span>Actions</span>
    <svg class="sb-ico" data-i="down" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9.5 6 6 6-6"></path></svg>
  </button>
</div>
```

State: open

```html
<div class="sb-k-ddwrap">
  <button aria-haspopup="menu" aria-expanded="true" type="button" class="ab-type-apply sb-k-btn2 sb-k-dd">
    <span>Actions</span>
    <svg class="sb-ico" data-i="down" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9.5 6 6 6-6"></path></svg>
  </button>
  <ul class="sb-k-menu sb-k-cmdmenu" role="menu">
    <li role="menuitem" aria-selected="true">
      <svg class="sb-ico" data-i="edit" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m4.5 19.5 1-4.2 9.8-9.8a1.8 1.8 0 0 1 2.5 0l.7.7a1.8 1.8 0 0 1 0 2.5l-9.8 9.8z"></path><path d="m13.5 7.5 3 3"></path></svg>
      <span>Edit</span>
    </li>
    <li role="menuitem">
      <svg class="sb-ico" data-i="copy" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="8.5" y="8.5" width="11" height="11" rx="2"></rect><path d="M15.5 8.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7.5a2 2 0 0 0 2 2h2.5"></path></svg>
      <span>Duplicate</span>
    </li>
    <li role="menuitem">
      <svg class="sb-ico" data-i="share" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 15V4M8 7.5l4-4 4 4"></path><path d="M6 11h-.5A1.5 1.5 0 0 0 4 12.5v6A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5v-6a1.5 1.5 0 0 0-1.5-1.5H18"></path></svg>
      <span>Share</span>
    </li>
    <li class="sb-k-menu-sep" role="separator"></li>
    <li role="menuitem" class="is-danger">
      <svg class="sb-ico" data-i="trash" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l.8 12.5h9.4L17.5 7M10 11v5M14 11v5"></path></svg>
      <span>Delete</span>
    </li>
  </ul>
</div>
```

#### Contextual menu (`context-menu`)

Use: Actions for one item, on long press or right click.

- States: rest
- Glossary terms covered: Contextual Menu, Menu

State: rest

```html
<div class="sb-k-ctxbox">
  <ul class="ab-list sb-k-list">
    <li class="ab-row sb-k-row is-picked" tabindex="0">
      <span class="sb-k-lead">
        <span class="sb-k-av sb-k-av-s" aria-hidden="true">L</span>
      </span>
      <span class="sb-k-text">
        <span class="sb-k-title">Launch site</span>
        <span class="sb-k-sub">
          Atlas
          <span class="sb-k-mid">·</span>
          Feedback
        </span>
      </span>
      <span class="sb-k-trail">
        45%
        <span class="sb-k-chev">
          <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
        </span>
      </span>
    </li>
  </ul>
  <ul class="sb-k-menu sb-k-cmdmenu sb-k-ctx" role="menu">
    <li role="menuitem" aria-selected="true">
      <svg class="sb-ico" data-i="folder" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3.5 7v11A1.5 1.5 0 0 0 5 19.5h14a1.5 1.5 0 0 0 1.5-1.5V9.5A1.5 1.5 0 0 0 19 8h-7L10 5.5H5A1.5 1.5 0 0 0 3.5 7z"></path></svg>
      <span>Open</span>
    </li>
    <li role="menuitem">
      <svg class="sb-ico" data-i="edit" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m4.5 19.5 1-4.2 9.8-9.8a1.8 1.8 0 0 1 2.5 0l.7.7a1.8 1.8 0 0 1 0 2.5l-9.8 9.8z"></path><path d="m13.5 7.5 3 3"></path></svg>
      <span>Rename</span>
    </li>
    <li role="menuitem">
      <svg class="sb-ico" data-i="copy" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="8.5" y="8.5" width="11" height="11" rx="2"></rect><path d="M15.5 8.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7.5a2 2 0 0 0 2 2h2.5"></path></svg>
      <span>Duplicate</span>
    </li>
    <li role="menuitem">
      <svg class="sb-ico" data-i="share" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 15V4M8 7.5l4-4 4 4"></path><path d="M6 11h-.5A1.5 1.5 0 0 0 4 12.5v6A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5v-6a1.5 1.5 0 0 0-1.5-1.5H18"></path></svg>
      <span>Share</span>
    </li>
    <li class="sb-k-menu-sep" role="separator"></li>
    <li role="menuitem" class="is-danger">
      <svg class="sb-ico" data-i="trash" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l.8 12.5h9.4L17.5 7M10 11v5M14 11v5"></path></svg>
      <span>Delete</span>
    </li>
  </ul>
</div>
```

#### Submenu (`submenu`)

Use: A menu item that opens a second list of its own.

- States: rest
- Glossary terms covered: Menu, Submenu

State: rest

```html
<div class="sb-k-subwrap">
  <ul class="sb-k-menu sb-k-cmdmenu" role="menu">
    <li role="menuitem">
      <svg class="sb-ico" data-i="edit" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m4.5 19.5 1-4.2 9.8-9.8a1.8 1.8 0 0 1 2.5 0l.7.7a1.8 1.8 0 0 1 0 2.5l-9.8 9.8z"></path><path d="m13.5 7.5 3 3"></path></svg>
      <span>Edit</span>
    </li>
    <li role="menuitem" class="has-sub is-open" aria-selected="true" aria-haspopup="menu">
      <svg class="sb-ico" data-i="folder" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3.5 7v11A1.5 1.5 0 0 0 5 19.5h14a1.5 1.5 0 0 0 1.5-1.5V9.5A1.5 1.5 0 0 0 19 8h-7L10 5.5H5A1.5 1.5 0 0 0 3.5 7z"></path></svg>
      <span>Move to</span>
      <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
    </li>
    <li role="menuitem">
      <svg class="sb-ico" data-i="copy" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="8.5" y="8.5" width="11" height="11" rx="2"></rect><path d="M15.5 8.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7.5a2 2 0 0 0 2 2h2.5"></path></svg>
      <span>Duplicate</span>
    </li>
  </ul>
  <ul class="sb-k-menu sb-k-cmdmenu" role="menu">
    <li role="menuitem" aria-selected="true">
      <span>Inbox</span>
    </li>
    <li role="menuitem">
      <span>Archive</span>
    </li>
    <li role="menuitem">
      <span>Drafts</span>
    </li>
  </ul>
</div>
```

#### Expandable menu (`expandable-menu`)

Use: Navigation items that open in place to show their children.

- States: rest
- Glossary terms covered: Expandable Menu, Menu

State: rest

```html
<nav class="ab-list sb-k-list sb-k-navmenu sb-k-expmenu" aria-label="Sections">
  <a aria-expanded="true" role="link" class="sb-k-nm-item ab-row sb-k-row" tabindex="0">
    <span class="sb-k-lead">
      <span class="sb-k-ico">
        <svg class="sb-ico" data-i="folder" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3.5 7v11A1.5 1.5 0 0 0 5 19.5h14a1.5 1.5 0 0 0 1.5-1.5V9.5A1.5 1.5 0 0 0 19 8h-7L10 5.5H5A1.5 1.5 0 0 0 3.5 7z"></path></svg>
      </span>
    </span>
    <span class="sb-k-text">
      <span class="sb-k-title">Needs you</span>
    </span>
    <span class="sb-k-trail">
      <svg class="sb-ico" data-i="down" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9.5 6 6 6-6"></path></svg>
    </span>
  </a>
  <div class="sb-k-nm-children">
    <a role="link" aria-current="page" class="sb-k-nm-item ab-row sb-k-row is-picked is-nolead" tabindex="0">
      <span class="sb-k-text">
        <span class="sb-k-title">Launch site</span>
      </span>
    </a>
    <a role="link" class="sb-k-nm-item ab-row sb-k-row is-nolead" tabindex="0">
      <span class="sb-k-text">
        <span class="sb-k-title">Annual report</span>
      </span>
    </a>
    <a role="link" class="sb-k-nm-item ab-row sb-k-row is-nolead" tabindex="0">
      <span class="sb-k-text">
        <span class="sb-k-title">Spring campaign</span>
      </span>
    </a>
  </div>
  <a role="link" class="sb-k-nm-item ab-row sb-k-row" tabindex="0">
    <span class="sb-k-lead">
      <span class="sb-k-ico">
        <svg class="sb-ico" data-i="inbox" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3.5 13.5 6 5h12l2.5 8.5V19h-17z"></path><path d="M3.5 13.5H9a3 3 0 0 0 6 0h5.5"></path></svg>
      </span>
    </span>
    <span class="sb-k-text">
      <span class="sb-k-title">Inbox</span>
    </span>
    <span class="sb-k-trail">
      <span class="sb-k-chev">
        <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
      </span>
    </span>
  </a>
  <a role="link" class="sb-k-nm-item ab-row sb-k-row" tabindex="0">
    <span class="sb-k-lead">
      <span class="sb-k-ico">
        <svg class="sb-ico" data-i="chart" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"></path></svg>
      </span>
    </span>
    <span class="sb-k-text">
      <span class="sb-k-title">Reports</span>
    </span>
    <span class="sb-k-trail">
      <span class="sb-k-chev">
        <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
      </span>
    </span>
  </a>
</nav>
```

#### Pie menu (`pie-menu`)

Use: Up to 6 actions in a ring around the press point.

- States: rest
- Glossary terms covered: Menu, Pie Menu

State: rest

```html
<div class="sb-k-piebox">
  <div class="sb-k-pie" role="menu" aria-label="Actions">
    <i class="sb-k-pie-hub" aria-hidden="true"></i>
    <button role="menuitem" style="left:calc(50% + 0.0px);top:calc(50% + -76.0px)" aria-label="Edit" type="button" class="ab-type-apply sb-icon-btn sb-k-iconbtn sb-k-pie-item is-on is-pressed sb-k-pressed">
      <svg class="sb-ico" data-i="edit" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m4.5 19.5 1-4.2 9.8-9.8a1.8 1.8 0 0 1 2.5 0l.7.7a1.8 1.8 0 0 1 0 2.5l-9.8 9.8z"></path><path d="m13.5 7.5 3 3"></path></svg>
    </button>
    <button role="menuitem" style="left:calc(50% + 65.8px);top:calc(50% + -38.0px)" aria-label="Duplicate" type="button" class="ab-type-apply sb-icon-btn sb-k-iconbtn sb-k-pie-item">
      <svg class="sb-ico" data-i="copy" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="8.5" y="8.5" width="11" height="11" rx="2"></rect><path d="M15.5 8.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7.5a2 2 0 0 0 2 2h2.5"></path></svg>
    </button>
    <button role="menuitem" style="left:calc(50% + 65.8px);top:calc(50% + 38.0px)" aria-label="Share" type="button" class="ab-type-apply sb-icon-btn sb-k-iconbtn sb-k-pie-item">
      <svg class="sb-ico" data-i="share" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 15V4M8 7.5l4-4 4 4"></path><path d="M6 11h-.5A1.5 1.5 0 0 0 4 12.5v6A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5v-6a1.5 1.5 0 0 0-1.5-1.5H18"></path></svg>
    </button>
    <button role="menuitem" style="left:calc(50% + 0.0px);top:calc(50% + 76.0px)" aria-label="Favourite" type="button" class="ab-type-apply sb-icon-btn sb-k-iconbtn sb-k-pie-item">
      <svg class="sb-ico" data-i="star" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m12 4 2.4 5 5.4.7-4 3.8 1 5.4-4.8-2.7-4.8 2.7 1-5.4-4-3.8 5.4-.7z"></path></svg>
    </button>
    <button role="menuitem" style="left:calc(50% + -65.8px);top:calc(50% + 38.0px)" aria-label="Move" type="button" class="ab-type-apply sb-icon-btn sb-k-iconbtn sb-k-pie-item">
      <svg class="sb-ico" data-i="folder" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3.5 7v11A1.5 1.5 0 0 0 5 19.5h14a1.5 1.5 0 0 0 1.5-1.5V9.5A1.5 1.5 0 0 0 19 8h-7L10 5.5H5A1.5 1.5 0 0 0 3.5 7z"></path></svg>
    </button>
    <button role="menuitem" style="left:calc(50% + -65.8px);top:calc(50% + -38.0px)" aria-label="Delete" type="button" class="ab-type-apply sb-icon-btn sb-k-iconbtn sb-k-pie-item">
      <svg class="sb-ico" data-i="trash" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l.8 12.5h9.4L17.5 7M10 11v5M14 11v5"></path></svg>
    </button>
  </div>
</div>
```

### Feedback

#### Badge and tag (`badge`)

Use: Status, counts and categories.

- States: neutral, accent
- Glossary terms covered: Badge

State: neutral

```html
<div class="sb-k-row-inline">
  <span class="ab-fit">Draft</span>
  <span class="ab-fit" data-fit="match">Feedback</span>
  <span class="sb-k-count">12</span>
</div>
```

State: accent

```html
<div class="sb-k-row-inline">
  <span class="sb-k-badge">New</span>
  <span class="sb-k-count is-accent">3</span>
  <span class="sb-k-dotwrap">
    <svg class="sb-ico" data-i="bell" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"></path><path d="M10 20.5a2 2 0 0 0 4 0"></path></svg>
    <i class="sb-badge" aria-hidden="true"></i>
  </span>
</div>
```

#### Progress (`progress`)

Use: A bar for known progress.

- States: rest
- Glossary terms covered: Progress Bar, Progress Indicator

State: rest

```html
<div class="sb-k-progress">
  <div class="sb-k-slider-h">
    <span>Uploading 3 files</span>
    <span>62%</span>
  </div>
  <span class="ab-row-bar sb-k-bar" role="progressbar" aria-valuenow="62" aria-valuemin="0" aria-valuemax="100">
    <i style="width:62%"></i>
  </span>
</div>
```

#### Spinner (`spinner`)

Use: Unknown wait under a few seconds.

- States: rest
- Glossary terms covered: Progress Indicator, Spinner

State: rest

```html
<div class="sb-k-spinner" role="status">
  <i class="sb-k-spin" aria-hidden="true"></i>
  <span>Loading</span>
</div>
```

#### Skeleton screen (`skeleton`)

Use: Blocks in the shape of the coming layout while content loads.

- States: rest
- Glossary terms covered: Progress Indicator, Skeleton Screen

State: rest

```html
<div class="sb-k-skel" role="status" aria-busy="true" aria-label="Loading">
  <div class="sb-k-skel-row">
    <i class="sb-k-skel-av"></i>
    <span>
      <i class="sb-k-skel-line is-l1"></i>
      <i class="sb-k-skel-line is-l2"></i>
    </span>
  </div>
  <div class="sb-k-skel-row">
    <i class="sb-k-skel-av"></i>
    <span>
      <i class="sb-k-skel-line is-l1"></i>
      <i class="sb-k-skel-line is-l2"></i>
    </span>
  </div>
  <div class="sb-k-skel-row">
    <i class="sb-k-skel-av"></i>
    <span>
      <i class="sb-k-skel-line is-l1"></i>
      <i class="sb-k-skel-line is-l2"></i>
    </span>
  </div>
  <i class="sb-k-skel-block"></i>
</div>
```

#### Toast (`toast`)

Use: A brief confirmation that disappears by itself.

- States: rest
- Glossary terms covered: Snackbar

State: rest

```html
<div class="sb-k-toast" role="status">
  <svg class="sb-ico" data-i="check" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m5 12.5 4.5 4.5L19 7.5"></path></svg>
  <span>Project opened</span>
  <button type="button">Undo</button>
</div>
```

#### Empty state (`empty`)

Use: What to do when there is nothing here yet.

- States: rest

State: rest

```html
<div class="sb-k-empty">
  <span class="sb-k-emptyico" aria-hidden="true">
    <svg class="sb-ico" data-i="inbox" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3.5 13.5 6 5h12l2.5 8.5V19h-17z"></path><path d="M3.5 13.5H9a3 3 0 0 0 6 0h5.5"></path></svg>
  </span>
  <h3 class="ab-card-title sb-k-empty-t">Nothing here yet</h3>
  <p class="sb-k-empty-b">When you add your first one, it shows up here.</p>
  <button type="button" class="ab-type-apply sb-k-btn2 sb-k-auto">
    <svg class="sb-ico" data-i="plus" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 5v14M5 12h14"></path></svg>
    <span>New project</span>
  </button>
</div>
```

#### Avatar (`avatar`)

Use: A person or account: photo or initials.

- States: rest

State: rest

```html
<div class="sb-k-row-inline">
  <span class="sb-k-av sb-k-av-s" aria-hidden="true">MO</span>
  <span class="sb-k-av" aria-hidden="true">SO</span>
  <span class="sb-k-av sb-k-av-l" aria-hidden="true">LF</span>
  <span class="sb-k-avs">
    <span class="sb-k-av sb-k-av-s" aria-hidden="true">MO</span>
    <span class="sb-k-av sb-k-av-s" aria-hidden="true">SO</span>
    <span class="sb-k-av sb-k-av-s" aria-hidden="true">LF</span>
    <span class="sb-k-av sb-k-av-s" aria-hidden="true">JR</span>
  </span>
</div>
```

## Part 4: Screen layouts

These are the screen patterns every screen is assembled from. Each lists its blocks top to bottom, its rules, and the reference markup of the 390 x 844 phone screen (the device frame is only a presentation aid). Build screens from the Part 3 components in this order and keep the rules.

### Onboarding (`onboarding`)

Use: First run: what the app does and one way in.

Blocks, top to bottom: `topbar`, `title`, `body`, `list`, `btn-primary`, `btn-text`

Rules:

- One Large title and one sentence of body; at most 3 feature rows.
- Content block centred between the top bar and the actions.
- Primary button and one text button pinned above the home indicator.
- No illustration, pattern or art: the brand shows in type, colour and components.

```html
<div class="sb-k-scr" data-scr="onboarding">
  <div class="sb-phone-in sb-k-scr-in">
    <div class="sb-statusbar" aria-hidden="true">
      <span>9:41</span>
      <span class="sb-sb-r">
        <i class="sb-sig"></i>
        <i class="sb-wifi"></i>
        <i class="sb-bat"></i>
      </span>
    </div>
    <div class="sb-k-blk" data-blk="topbar">
      <div class="sb-k-topbar">
        <span></span>
        <span class="sb-k-tb-title">
          <span class="ab-brand sb-k-tb-brand">
            <span class="ab-mark" aria-hidden="true">
              <span>S</span>
            </span>
            <span class="ab-wordmark">Scent Box</span>
          </span>
        </span>
        <span></span>
      </div>
    </div>
    <div class="sb-k-blk" data-blk="title">
      <h2 class="ab-headline sb-ob-h">
        A short tagline that captures the
        <span class="ab-hl-glue">
          <span class="ab-hl">brand</span>
          .
        </span>
      </h2>
    </div>
    <div class="sb-k-blk" data-blk="body">
      <p class="ab-subcopy sb-ob-body">Check in on work, answer client notes and approve proofs between meetings.</p>
    </div>
    <div class="sb-k-blk" data-blk="list">
      <ul class="ab-list sb-k-list is-open">
        <li class="ab-row sb-k-row" tabindex="0">
          <span class="sb-k-lead">
            <span class="sb-k-ico">
              <svg class="sb-ico" data-i="check" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m5 12.5 4.5 4.5L19 7.5"></path></svg>
            </span>
          </span>
          <span class="sb-k-text">
            <span class="sb-k-title">Identity</span>
          </span>
        </li>
        <li class="ab-row sb-k-row" tabindex="0">
          <span class="sb-k-lead">
            <span class="sb-k-ico">
              <svg class="sb-ico" data-i="bell" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"></path><path d="M10 20.5a2 2 0 0 0 4 0"></path></svg>
            </span>
          </span>
          <span class="sb-k-text">
            <span class="sb-k-title">Digital</span>
          </span>
        </li>
        <li class="ab-row sb-k-row" tabindex="0">
          <span class="sb-k-lead">
            <span class="sb-k-ico">
              <svg class="sb-ico" data-i="heart" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"></path></svg>
            </span>
          </span>
          <span class="sb-k-text">
            <span class="sb-k-title">Campaigns</span>
          </span>
        </li>
      </ul>
    </div>
    <div class="sb-k-blk" data-blk="btn-primary">
      <button type="button" class="ab-cta sb-k-btn">
        <span class="ab-cta-label">Get started</span>
        <span class="ab-cta-arrow" aria-hidden="true"></span>
      </button>
    </div>
    <div class="sb-k-blk" data-blk="btn-text">
      <button type="button" class="sb-k-textbtn sb-k-center">I have an account</button>
    </div>
    <div class="sb-homebar" aria-hidden="true"></div>
  </div>
</div>
```

### List (`list`)

Use: A home or index screen: many items, one tap to open.

Blocks, top to bottom: `topbar`, `title`, `search`, `segmented`, `section`, `list`, `tabbar`

Rules:

- Large title that collapses into the top bar on scroll.
- Search and filters sit above the first section, never inside rows.
- Rows are 52pt minimum with one line of title and one of detail; trailing value or chevron.
- The list scrolls under the tab bar and ends above it; nothing hides behind it.

```html
<div class="sb-k-scr" data-scr="list">
  <div class="sb-phone-in sb-k-scr-in">
    <div class="sb-statusbar" aria-hidden="true">
      <span>9:41</span>
      <span class="sb-sb-r">
        <i class="sb-sig"></i>
        <i class="sb-wifi"></i>
        <i class="sb-bat"></i>
      </span>
    </div>
    <div class="sb-k-blk" data-blk="topbar">
      <div class="sb-k-topbar">
        <span></span>
        <span class="sb-k-tb-title"></span>
        <button type="button" class="sb-k-plain" aria-label="New project">
          <svg class="sb-ico" data-i="plus" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 5v14M5 12h14"></path></svg>
        </button>
      </div>
    </div>
    <div class="sb-k-blk" data-blk="title">
      <h2 class="ab-card-title sb-k-ltitle">Needs you</h2>
    </div>
    <div class="sb-k-blk" data-blk="search">
      <div class="sb-search sb-k-search is-rest">
        <svg class="sb-ico" data-i="search" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="6.5"></circle><path d="m16 16 4.5 4.5"></path></svg>
        <input class="ab-input" type="text" placeholder="Search projects" value="" aria-label="Search projects" autocomplete="off">
      </div>
    </div>
    <div class="sb-k-blk" data-blk="segmented">
      <div class="ab-seg" role="group" aria-label="Show">
        <button type="button" class="ab-seg-btn" aria-pressed="true">Active</button>
        <button type="button" class="ab-seg-btn" aria-pressed="false">Done</button>
        <button type="button" class="ab-seg-btn" aria-pressed="false">All</button>
      </div>
    </div>
    <div class="sb-k-blk" data-blk="section">
      <div class="ab-labelrow sb-k-section">
        <span class="ab-label">Active</span>
        <span class="ab-label">7 items</span>
      </div>
    </div>
    <div class="sb-k-blk sb-k-fill" data-blk="list">
      <ul class="ab-list sb-k-list is-open">
        <li class="ab-row sb-k-row" tabindex="0">
          <span class="sb-k-lead">
            <span class="sb-k-av sb-k-av-s" aria-hidden="true">L</span>
          </span>
          <span class="sb-k-text">
            <span class="sb-k-title">Launch site</span>
            <span class="sb-k-sub">
              Atlas
              <span class="sb-k-mid">·</span>
              Feedback
            </span>
          </span>
          <span class="sb-k-trail">
            45%
            <span class="sb-k-chev">
              <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
            </span>
          </span>
        </li>
        <li class="ab-row sb-k-row" tabindex="0">
          <span class="sb-k-lead">
            <span class="sb-k-av sb-k-av-s" aria-hidden="true">A</span>
          </span>
          <span class="sb-k-text">
            <span class="sb-k-title">Annual report</span>
            <span class="sb-k-sub">Proofs</span>
          </span>
          <span class="sb-k-trail">
            92%
            <span class="sb-k-chev">
              <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
            </span>
          </span>
        </li>
        <li class="ab-row sb-k-row" tabindex="0">
          <span class="sb-k-lead">
            <span class="sb-k-av sb-k-av-s" aria-hidden="true">S</span>
          </span>
          <span class="sb-k-text">
            <span class="sb-k-title">Spring campaign</span>
            <span class="sb-k-sub">Brief</span>
          </span>
          <span class="sb-k-trail">
            10%
            <span class="sb-k-chev">
              <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
            </span>
          </span>
        </li>
        <li class="ab-row sb-k-row" tabindex="0">
          <span class="sb-k-lead">
            <span class="sb-k-av sb-k-av-s" aria-hidden="true">B</span>
          </span>
          <span class="sb-k-text">
            <span class="sb-k-title">Brand refresh</span>
            <span class="sb-k-sub">
              Fernwood
              <span class="sb-k-mid">·</span>
              In review
            </span>
          </span>
          <span class="sb-k-trail">
            72%
            <span class="sb-k-chev">
              <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
            </span>
          </span>
        </li>
        <li class="ab-row sb-k-row" tabindex="0">
          <span class="sb-k-lead">
            <span class="sb-k-av sb-k-av-s" aria-hidden="true">L</span>
          </span>
          <span class="sb-k-text">
            <span class="sb-k-title">Launch site</span>
            <span class="sb-k-sub">
              Atlas
              <span class="sb-k-mid">·</span>
              Building
            </span>
          </span>
          <span class="sb-k-trail">
            45%
            <span class="sb-k-chev">
              <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
            </span>
          </span>
        </li>
        <li class="ab-row sb-k-row" tabindex="0">
          <span class="sb-k-lead">
            <span class="sb-k-av sb-k-av-s" aria-hidden="true">S</span>
          </span>
          <span class="sb-k-text">
            <span class="sb-k-title">Spring campaign</span>
            <span class="sb-k-sub">
              Marlow
              <span class="sb-k-mid">·</span>
              Planned
            </span>
          </span>
          <span class="sb-k-trail">
            10%
            <span class="sb-k-chev">
              <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
            </span>
          </span>
        </li>
        <li class="ab-row sb-k-row" tabindex="0">
          <span class="sb-k-lead">
            <span class="sb-k-av sb-k-av-s" aria-hidden="true">A</span>
          </span>
          <span class="sb-k-text">
            <span class="sb-k-title">Annual report</span>
            <span class="sb-k-sub">
              Kestrel
              <span class="sb-k-mid">·</span>
              Final proofs
            </span>
          </span>
          <span class="sb-k-trail">
            92%
            <span class="sb-k-chev">
              <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
            </span>
          </span>
        </li>
      </ul>
    </div>
    <div class="sb-k-blk" data-blk="tabbar">
      <nav class="sb-tabs" aria-label="App">
        <button type="button" class="sb-tab" aria-current="page">
          <svg class="sb-ico" data-i="home" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 11.5 12 4l9 7.5"></path><path d="M5.5 10v9.5h13V10"></path></svg>
          <span>Home</span>
        </button>
        <button type="button" class="sb-tab">
          <svg class="sb-ico" data-i="list" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M8 6h12M8 12h12M8 18h12"></path><circle cx="4" cy="6" r="1"></circle><circle cx="4" cy="12" r="1"></circle><circle cx="4" cy="18" r="1"></circle></svg>
          <span>Projects</span>
        </button>
        <button type="button" class="sb-tab">
          <svg class="sb-ico" data-i="heart" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"></path></svg>
          <span>Inbox</span>
        </button>
        <button type="button" class="sb-tab">
          <svg class="sb-ico" data-i="user" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="8" r="4"></circle><path d="M4 21c1-4 4.2-6 8-6s7 2 8 6"></path></svg>
          <span>Profile</span>
        </button>
      </nav>
    </div>
    <div class="sb-homebar" aria-hidden="true"></div>
  </div>
</div>
```

### Detail (`detail`)

Use: One item: its facts and what you can do with it.

Blocks, top to bottom: `topbar`, `title`, `badge`, `card`, `section`, `list`, `btn-primary`

Rules:

- Back button and at most two icon actions in the top bar.
- Title, status badge, then one summary card with the key numbers.
- Secondary facts as label/value rows in a grouped list.
- One primary action, at the bottom or in the top bar, never both.

```html
<div class="sb-k-scr" data-scr="detail">
  <div class="sb-phone-in sb-k-scr-in">
    <div class="sb-statusbar" aria-hidden="true">
      <span>9:41</span>
      <span class="sb-sb-r">
        <i class="sb-sig"></i>
        <i class="sb-wifi"></i>
        <i class="sb-bat"></i>
      </span>
    </div>
    <div class="sb-k-blk" data-blk="topbar">
      <div class="sb-k-topbar">
        <button type="button" class="sb-k-plain" aria-label="Back">
          <svg class="sb-ico" data-i="back" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m14.5 6-6 6 6 6"></path></svg>
        </button>
        <span class="sb-k-tb-title"></span>
        <button type="button" class="sb-k-plain" aria-label="More">
          <svg class="sb-ico" data-i="more" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="5.5" cy="12" r="1.2"></circle><circle cx="12" cy="12" r="1.2"></circle><circle cx="18.5" cy="12" r="1.2"></circle></svg>
        </button>
      </div>
    </div>
    <div class="sb-k-blk" data-blk="title">
      <h2 class="ab-card-title sb-k-ltitle">Launch site · Atlas</h2>
    </div>
    <div class="sb-k-blk" data-blk="badge">
      <div class="sb-k-row-inline">
        <span class="ab-fit">Feedback</span>
      </div>
    </div>
    <div class="sb-k-blk" data-blk="card">
      <div class="ab-card sb-k-card">
        <h3 class="ab-card-title">45% done</h3>
        <p class="ab-card-body">
          Fernwood
          <span class="sb-k-mid">·</span>
          round two due Friday
        </p>
      </div>
    </div>
    <div class="sb-k-blk" data-blk="section">
      <div class="ab-labelrow sb-k-section">
        <span class="ab-label">Details</span>
      </div>
    </div>
    <div class="sb-k-blk sb-k-fill" data-blk="list">
      <ul class="ab-list sb-k-list is-open">
        <li class="ab-row sb-k-row is-nolead" tabindex="0">
          <span class="sb-k-text">
            <span class="sb-k-title">Status</span>
          </span>
          <span class="sb-k-trail">
            Feedback
            <span class="sb-k-chev">
              <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
            </span>
          </span>
        </li>
        <li class="ab-row sb-k-row is-nolead" tabindex="0">
          <span class="sb-k-text">
            <span class="sb-k-title">Owner</span>
          </span>
          <span class="sb-k-trail">
            Theo Laurent
            <span class="sb-k-chev">
              <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
            </span>
          </span>
        </li>
        <li class="ab-row sb-k-row is-nolead" tabindex="0">
          <span class="sb-k-text">
            <span class="sb-k-title">Updated</span>
          </span>
          <span class="sb-k-trail">
            Today
            <span class="sb-k-chev">
              <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
            </span>
          </span>
        </li>
        <li class="ab-row sb-k-row is-nolead" tabindex="0">
          <span class="sb-k-text">
            <span class="sb-k-title">Progress</span>
          </span>
          <span class="sb-k-trail">
            45%
            <span class="sb-k-chev">
              <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
            </span>
          </span>
        </li>
        <li class="ab-row sb-k-row is-nolead" tabindex="0">
          <span class="sb-k-text">
            <span class="sb-k-title">Default day rate</span>
          </span>
          <span class="sb-k-trail">
            $1,200
            <span class="sb-k-chev">
              <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
            </span>
          </span>
        </li>
      </ul>
    </div>
    <div class="sb-k-blk" data-blk="btn-primary">
      <button type="button" class="ab-cta sb-k-btn">
        <span class="ab-cta-label">Open project</span>
        <span class="ab-cta-arrow" aria-hidden="true"></span>
      </button>
    </div>
    <div class="sb-homebar" aria-hidden="true"></div>
  </div>
</div>
```

### Form (`form`)

Use: Create or edit something.

Blocks, top to bottom: `topbar`, `title`, `field`, `field`, `select`, `toggle`, `callout`, `btn-primary`

Rules:

- Labels above fields; one column; 16pt between fields, 28pt between groups.
- Errors appear under the field in the error colour, plus one callout at the top on submit.
- Primary action names the result ("Save", "Create invoice"), disabled until valid.
- Keyboard never covers the focused field or the primary action.

```html
<div class="sb-k-scr" data-scr="form">
  <div class="sb-phone-in sb-k-scr-in">
    <div class="sb-statusbar" aria-hidden="true">
      <span>9:41</span>
      <span class="sb-sb-r">
        <i class="sb-sig"></i>
        <i class="sb-wifi"></i>
        <i class="sb-bat"></i>
      </span>
    </div>
    <div class="sb-k-blk" data-blk="topbar">
      <div class="sb-k-topbar">
        <button type="button" class="sb-k-plain" aria-label="Back">
          <svg class="sb-ico" data-i="back" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m14.5 6-6 6 6 6"></path></svg>
        </button>
        <span class="sb-k-tb-title"></span>
        <span></span>
      </div>
    </div>
    <div class="sb-k-blk" data-blk="title">
      <h2 class="ab-card-title sb-k-ltitle">New project</h2>
    </div>
    <div class="sb-k-blk" data-blk="field">
      <div class="sb-field sb-k-field is-rest">
        <label class="ab-fieldlabel" for="sb43b-f60">Name</label>
        <input class="ab-input" type="text" value="Brand refresh" autocomplete="off" spellcheck="false">
      </div>
    </div>
    <div class="sb-k-blk" data-blk="field">
      <div class="sb-field sb-k-field is-rest">
        <label class="ab-fieldlabel" for="sb43b-f61">Details</label>
        <input class="ab-input" type="text" value="Fernwood · round two due Friday" autocomplete="off" spellcheck="false">
      </div>
    </div>
    <div class="sb-k-blk" data-blk="select">
      <div class="sb-k-selectwrap">
        <p class="ab-fieldlabel">Show</p>
        <button type="button" class="ab-input sb-k-select" aria-haspopup="listbox" aria-expanded="false">
          <span>Active</span>
          <svg class="sb-ico" data-i="down" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9.5 6 6 6-6"></path></svg>
        </button>
      </div>
    </div>
    <div class="sb-k-blk" data-blk="toggle">
      <label class="ab-toggle sb-tog" for="sb43b-t62">
        <span>Client comments</span>
        <input class="ab-switch" type="checkbox" checked="">
      </label>
    </div>
    <div class="sb-k-blk" data-blk="callout">
      <div class="sb-k-callout" data-tone="info" role="status">
        <svg class="sb-ico" data-i="info" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"></circle><path d="M12 11v5.5M12 7.6v.2"></path></svg>
        <div>
          <b>Heads up</b>
          <span>Prices change on the first of next month.</span>
        </div>
      </div>
    </div>
    <div class="sb-k-blk" data-blk="btn-primary">
      <button type="button" class="ab-cta sb-k-btn">
        <span class="ab-cta-label">Save</span>
        <span class="ab-cta-arrow" aria-hidden="true"></span>
      </button>
    </div>
    <div class="sb-homebar" aria-hidden="true"></div>
  </div>
</div>
```

### Settings (`settings`)

Use: Preferences and account.

Blocks, top to bottom: `topbar`, `title`, `section`, `list`, `toggle`, `section`, `list`, `btn-destructive`

Rules:

- Grouped lists with small uppercase or tracked section labels.
- Each row is a label plus one control: toggle, value with chevron, or nothing.
- Changes apply at once; no Save button.
- Destructive action alone in the last group.

```html
<div class="sb-k-scr" data-scr="settings">
  <div class="sb-phone-in sb-k-scr-in">
    <div class="sb-statusbar" aria-hidden="true">
      <span>9:41</span>
      <span class="sb-sb-r">
        <i class="sb-sig"></i>
        <i class="sb-wifi"></i>
        <i class="sb-bat"></i>
      </span>
    </div>
    <div class="sb-k-blk" data-blk="topbar">
      <div class="sb-k-topbar">
        <button type="button" class="sb-k-plain" aria-label="Back">
          <svg class="sb-ico" data-i="back" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m14.5 6-6 6 6 6"></path></svg>
        </button>
        <span class="sb-k-tb-title"></span>
        <span></span>
      </div>
    </div>
    <div class="sb-k-blk" data-blk="title">
      <h2 class="ab-card-title sb-k-ltitle">Settings</h2>
    </div>
    <div class="sb-k-blk" data-blk="section">
      <div class="ab-labelrow sb-k-section">
        <span class="ab-label">General</span>
      </div>
    </div>
    <div class="sb-k-blk" data-blk="list">
      <ul class="ab-list sb-k-list is-open">
        <li class="ab-row sb-k-row is-nolead" tabindex="0">
          <span class="sb-k-text">
            <span class="sb-k-title">Name</span>
          </span>
          <span class="sb-k-trail">
            Theo Laurent
            <span class="sb-k-chev">
              <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
            </span>
          </span>
        </li>
        <li class="ab-row sb-k-row is-nolead" tabindex="0">
          <span class="sb-k-text">
            <span class="sb-k-title">Language</span>
          </span>
          <span class="sb-k-trail">
            English
            <span class="sb-k-chev">
              <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
            </span>
          </span>
        </li>
        <li class="ab-row sb-k-row is-nolead sb-k-togrow" tabindex="0">
          <span class="sb-k-text">
            <span class="sb-k-title">Notifications</span>
          </span>
          <span class="sb-k-trail">
            <input class="ab-switch" type="checkbox" checked="" aria-label="Notifications">
          </span>
        </li>
      </ul>
    </div>
    <div class="sb-k-blk" data-blk="section">
      <div class="ab-labelrow sb-k-section">
        <span class="ab-label">About</span>
      </div>
    </div>
    <div class="sb-k-blk" data-blk="list">
      <ul class="ab-list sb-k-list is-open">
        <li class="ab-row sb-k-row is-nolead" tabindex="0">
          <span class="sb-k-text">
            <span class="sb-k-title">Help</span>
          </span>
          <span class="sb-k-trail">
            <span class="sb-k-chev">
              <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
            </span>
          </span>
        </li>
        <li class="ab-row sb-k-row is-nolead" tabindex="0">
          <span class="sb-k-text">
            <span class="sb-k-title">Privacy</span>
          </span>
          <span class="sb-k-trail">
            <span class="sb-k-chev">
              <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
            </span>
          </span>
        </li>
        <li class="ab-row sb-k-row is-nolead" tabindex="0">
          <span class="sb-k-text">
            <span class="sb-k-title">Version</span>
          </span>
          <span class="sb-k-trail">
            2.4
            <span class="sb-k-chev">
              <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
            </span>
          </span>
        </li>
      </ul>
    </div>
    <div class="sb-k-blk" data-blk="btn-destructive">
      <button type="button" class="sb-k-danger">Sign out</button>
    </div>
    <div class="sb-homebar" aria-hidden="true"></div>
  </div>
</div>
```

## Part 5: Patterns

Not included: this build is for an App, and app screens carry no patterns or art.

## Part 6: Logo

This brand has no vector logo to inline. Use the logo files from "Save brief + files" and place them as Part 1 says.

## Part 7: Verification checklist

Go through every item before you report back. An unchecked item means the work is not finished.

- [ ] Every colour in the code is a token from Part 2: search for hex values, `rgb(`, `hsl(` and named colours outside the token file and remove them.
- [ ] Every component in every state matches its Part 3 values: colours, sizes, radii, borders, shadows, type and spacing (rest, pressed, focus, disabled, open and the rest of each state list).
- [ ] Tap targets are 44pt or larger for everything tappable; buttons, fields and rows use the Part 1 heights.
- [ ] Type uses only the faces and the phone type scale from Part 1 (sizes, line heights, weights, case, tracking).
- [ ] Light and dark both work and use the designed values; nothing is inverted by a filter.
- [ ] Text contrast is 4.5:1 or better (3:1 for large text and icons), checked on the real backgrounds in both modes.
- [ ] Keyboard focus is visible on every control and uses the focus treatment from Part 3.
- [ ] Motion respects reduced motion: with `prefers-reduced-motion` on, animation stops or shortens as Part 1 says.
- [ ] No art, pattern, texture or decorative band appears in any app screen; the logo is used only where Part 1 puts it.
- [ ] Screens follow the Part 4 block order and rules; placeholder copy has been replaced.
