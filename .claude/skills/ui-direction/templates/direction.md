# Direction: {{App name}}

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

- Who and when: {{who opens it, where they are, how often, for how long}}
- The moment that matters: {{the one use moment the whole UI is built around}}
- Should feel: {{two or three feelings, in the user's own words}}
- Must never feel: {{the specific wrong feelings, including every look the owner already killed}}
- Owner notes so far: {{quotes from the app's ROUNDS.md, decisions.md and earlier rounds.json; "none yet" if new}}

## 2. Content shape

<!-- Every main object or piece of data the screens show. "Drawn as" is the form it takes on screen;
"Not as" is the generic form you refuse. At least three rows. -->

| Object | What it really is | Drawn as | Not as |
| --- | --- | --- | --- |
| {{object}} | {{its real nature}} | {{its on-screen form}} | {{the generic form}} |
| {{object}} | {{its real nature}} | {{its on-screen form}} | {{the generic form}} |
| {{object}} | {{its real nature}} | {{its on-screen form}} | {{the generic form}} |

## 3. The world

<!-- Physical or cultural artifacts from the product's own domain, outside software. Take a mechanism
(how it organises, labels, orders or reveals), never a picture of it. At least three rows. -->

| Artifact | Mechanism to take | Where it lands in the UI |
| --- | --- | --- |
| {{artifact}} | {{mechanism}} | {{screen and element}} |
| {{artifact}} | {{mechanism}} | {{screen and element}} |
| {{artifact}} | {{mechanism}} | {{screen and element}} |

Software precedents:
- {{app}}: keep {{what}}, break {{what}}
- {{app}}: keep {{what}}, break {{what}}

## 4. Thesis

Thesis: {{one sentence: what the eye goes to, the mechanism that makes it, what steps back}}
Tension: {{word}} but {{word}}: {{which side wins where}}
Signature: {{the one thing a person would remember, the screen it lives on, and the product fact it comes from}}
Principles:
1. {{a rule that settles a future argument}}
2. {{a rule that settles a future argument}}
3. {{a rule that settles a future argument}}

## 5. Directions

<!-- Three real answers to the thesis question, not three paints. They must differ on at least three
of: structure, type, colour strategy, material, density, signature. Write "Chosen:" after the round 1
critic review. -->

### A. {{name}}
- Thesis: {{one sentence}}
- Structure: {{navigation, layout, density}}
- Type: {{families and why}}
- Colour: {{strategy}}
- Material: {{how things are held and pressed}}
- Signature: {{the memorable thing}}

### B. {{name}}
- Thesis: {{one sentence}}
- Structure: {{navigation, layout, density}}
- Type: {{families and why}}
- Colour: {{strategy}}
- Material: {{how things are held and pressed}}
- Signature: {{the memorable thing}}

### C. {{name}}
- Thesis: {{one sentence}}
- Structure: {{navigation, layout, density}}
- Type: {{families and why}}
- Colour: {{strategy}}
- Material: {{how things are held and pressed}}
- Signature: {{the memorable thing}}

Chosen: {{A, B, C or a named merge, and why, after the round 1 review}}

## 6. System

<!-- The chosen direction as decisions, each with its reason in this product's terms. -->

### Layout
{{navigation model, window or screen structure, grid, density, where the primary action lives}}

### Type
{{families, the scale with sizes, which style does which job, numerals, case}}

### Colour
{{the strategy, what each role is for, coverage, how dark mode differs}}

### Material and shape
{{surface for doing, surface for holding, radius family, borders, shadow or none}}

### Motion
{{press, select, and the signature moment: what moves, how fast, why}}

### Words
{{label voice, the product's own vocabulary, empty and first-run lines}}

### Craft
{{the edge everything aligns to, spacing steps, selected and focus states, icon style}}

## 7. Defaults ledger

<!-- Every reflex gets a decision: "keep" with a reason in this product's terms, or "change" naming what
replaces it. Add a row for any other default you catch yourself using.
Why each reads as generic: .claude/skills/ui-direction/references/defaults-ledger.md -->

| Reflex | Decision | Why, for this product |
| --- | --- | --- |
| One neutral sans for everything (Inter, DM Sans, Geist, Manrope, SF) | {{keep or change}} | {{reason}} |
| Tracked uppercase micro-labels above values | {{keep or change}} | {{reason}} |
| Every group in a card, all cards the same fill and radius | {{keep or change}} | {{reason}} |
| Radius 12 to 20 on everything | {{keep or change}} | {{reason}} |
| Off-white canvas, near-black ink, one muted accent | {{keep or change}} | {{reason}} |
| Full-width pill primary button inside the content | {{keep or change}} | {{reason}} |
| An icon on a button that adds no meaning | {{keep or change}} | {{reason}} |
| Numbers in stat tiles | {{keep or change}} | {{reason}} |
| Ratings as text glyphs | {{keep or change}} | {{reason}} |
| A Mac window drawn as one centred column | {{keep or change}} | {{reason}} |
| Grey tint as the selected state | {{keep or change}} | {{reason}} |
| A hairline under every row | {{keep or change}} | {{reason}} |
| Soft blurred drop shadow | {{keep or change}} | {{reason}} |
| Chips for every tag | {{keep or change}} | {{reason}} |
| Section headers as one plain word | {{keep or change}} | {{reason}} |
| Empty state as "No X yet" plus a button | {{keep or change}} | {{reason}} |

## 8. Beyond the renderer

<!-- Ideas the product-sheet renderer cannot draw (layout, a custom chart, the signature moment). Each
gets an HTML mock under app/mocks/, rendered with `node dev/lg.js shot` into the round's renders folder.
The Mock path is relative to the app/ folder and must exist. If the renderer draws every idea, replace
the table with this exact line:
None: the renderer draws every idea. -->

| Idea | Why it matters | Mock |
| --- | --- | --- |
| {{idea}} | {{why}} | {{mocks/<file>.html}} |
