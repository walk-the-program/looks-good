# Aesthetics, color picker and AI brief — build plan

Status ledger and shared contract for this round. Coordinator: Opus (main session).
Workers: Sonnet (`efficient-sonnet`). Max two workers at once.

## Requested outcome

1. Replace the generic "Live preview" card with a **Design language board** modeled on the
   Soft Form study: header (wordmark + "DESIGN LANGUAGE / <AESTHETIC>"), hero (kicker,
   headline, signature art), palette with each color's job, `01 / Interface` (card with
   segmented control, title, body, primary action), `02 / <material label>` (field, toggle,
   three material/state samples), `03 / In use` (a small dense list), footer (motto +
   influences). Rendered in the brand's own fonts and colors.
2. **Ten aesthetics** to choose from (sidebar panel + "Compare all" grid showing all ten boards
   at once in the current brand).
3. **Inline color picker**: no OS color panel. Role chips + an always-visible HSV wheel,
   brightness slider and hex field inside the Color palette panel.
4. **Paste brand colors**: paste any text from a brand guide, hexes/rgb are extracted, labeled
   lines ("Primary: #…", "Background …") are honored, the rest auto-assigned; review and apply.
5. **Color roles everywhere**: every color has an explicit job, a "never" rule and a coverage
   target. Shown on the board and in the picker, and exported in a **Copy AI brief** markdown
   so an AI building from it cannot use secondary "for whatever it wants".

Exclusions: no backend, no build step, no new dependencies, no paid APIs. Slides keep their
current look (an aesthetic only sets the slide shape preset).

## Acceptance criteria (owner → check)

| # | Criterion | Owner | Check |
|---|-----------|-------|-------|
| A1 | Board replaces old preview; uses brand fonts, colors, name, tagline, logo | W1 | visual |
| A2 | Aesthetic panel lists 10; selecting updates board, persists with the brand, undoable | W1 | reload + undo |
| A3 | Compare-all grid renders all 10 boards in current brand; clicking one selects it | W1 | visual |
| A4 | Each of the 10 aesthetics matches its spec below and is visibly distinct | W1/W3/W4 | visual, coordinator |
| A5 | Inline picker: wheel drag, brightness, hex entry; one drag = one undo step; no native color input | W2 | interaction |
| A6 | Scheme logic preserved: editing primary under a scheme re-derives; editing others → Custom | W2 | interaction |
| A7 | Paste import: labeled + unlabeled text, <5 and >5 colors, reassignment, apply = one undo step | W2 | unit-ish script + UI |
| A8 | Role guidance (use / never / coverage) shown for the selected color, aesthetic-aware | W2 | visual |
| A9 | Copy AI brief: exact hexes for every token incl. derived, role rules, contrast pairs, type, materials, do/don't, CSS vars | W5 | output inspection |
| A10 | No console errors; library tiles, slides, brand guide, PNG/PDF export still work; Mac build script still succeeds | all, coordinator | browser + build |

## Universal color roles (defaults; an aesthetic may override text and coverage)

Five brand colors map to fixed jobs. Light mode: canvas = Light, ink = Dark. Dark mode swaps.

| Role | Source | Use for | Never for | Coverage |
|------|--------|---------|-----------|----------|
| Canvas | Light (dark mode: Dark) | Page and panel backgrounds, same-material controls | Text | 60–70% |
| Ink | Dark (dark mode: Light) | Headlines, body text, icons, hairlines (as a tint), selected-segment fill in some aesthetics | Large background fields in light mode | 15–20% |
| Primary | Primary | The ONE main action per view, selected/active state (tab, nav, toggle on), focus ring | Body text, decorative fills, more than one CTA per view | ≈10% |
| Secondary | Secondary | Secondary buttons (outline/tonal), tags/chips, second data series, supporting illustration shape, selected-row tint | The main CTA, body text, page background | ≈10–15% |
| Accent | Accent | One spark per view: the highlighted headline word, "new"/notification badges, the art's focal highlight | Buttons, body text, borders, large fills | ≤5% |

Derived tokens are computed, never invented by an AI: `muted` (ink → canvas 40%), `line`
(ink → canvas 85%), `on-primary`, `on-secondary`, `on-accent` (readable text), `pri-tint`
(primary → canvas 88%), `sec-tint` (secondary → canvas 84%). All get exact hexes in the brief.

## Shared interface contract (rev 1)

Files and load order (all plain `<script>`, no modules):

- `js/color-roles.js` (W2) — `const DEFAULT_COLOR_ROLES = { canvas, ink, primary, secondary, accent }`,
  each `{ label, job, use, never, coverage }` (job = 2–4 words, e.g. "Main action").
  `function colorRolesFor(state)` → defaults merged with `aestheticByKey(state.aesthetic)?.roles`.
- `js/aesthetics/registry.js` (W1) — `const AESTHETICS = []`, `registerAesthetic(def)`,
  `aestheticByKey(key)` (falls back to first), sorted by `def.order`.
- `js/aesthetics/<key>.js` — one file per aesthetic calling `registerAesthetic({...})`.
- `css/aesthetics/<key>.css` — that aesthetic's styles, every selector scoped under
  `.ab[data-ae="<key>"]`.
- `js/aesthetic-board.js` + `css/aesthetic-board.css` (W1) — shared board markup, base
  layout, token computation, compare grid, sidebar panel.

Aesthetic definition:

```js
registerAesthetic({
  key: 'soft-form', order: 1,
  name: 'Soft Form',
  descriptor: 'Warm · Graphic · Tactile',        // shown top-right of palette row
  influences: 'Bauhaus / Neumorphism / Prism',   // footer right
  summary: 'One sentence a client would understand.',
  motto: 'Precise structure. Soft edges.',       // footer left
  mode: 'dark',                                  // recommended bgMode, applied on explicit selection
  slideShape: 'soft',                            // SHAPE_PRESETS key, applied unless shape is locked
  labels: { material: 'Touch & depth', states: ['Flat', 'Raised', 'Recessed'] },
  roles: { primary: { use, never, coverage }, ... },   // partial overrides of DEFAULT_COLOR_ROLES
  tokens(t) { return { '--ab-shadow': ..., }; },        // optional extra CSS vars from base tokens
  art(ctx) { return '<svg …>'; },                       // signature art, decorative, aria-hidden
  materials: [{ name: 'Raised control', css: 'background: {canvas}; box-shadow: …' }],
  rules: { do: ['…'], dont: ['…'] },
});
```

Base tokens object `t` passed to `tokens()` and `art()` (`ctx.t`), all hex strings unless noted:
`canvas, ink, muted, line, primary, onPrimary, secondary, onSecondary, accent, onAccent,
priTint, secTint, isDark (bool)`, helpers `mix(a, b, amount)`, `alpha(hex, a)` → rgba string,
`contrast(a, b)`, `readable(bg)`. `ctx` also has `brandName`, `initial`, `logoDataUrl`.
Base CSS vars on `.ab`: `--ab-canvas --ab-ink --ab-muted --ab-line --ab-primary --ab-on-primary
--ab-secondary --ab-on-secondary --ab-accent --ab-on-accent --ab-pri-tint --ab-sec-tint
--ab-font-h --ab-font-b`. `{token}` placeholders in `materials[].css` resolve to the same names
(`{canvas}`, `{primary}`, `{onPrimary}` …) at export time.

State: `state.aesthetic` (key string, default `'soft-form'`), `state.locks.aesthetic`.
Persisted by `serializeState`/`applySavedSessionToState` as `aestheticKey`.

Board anatomy: W1 records the exact class list here after building (section "Board anatomy").

## The ten aesthetics

Every board holds the same content so they compare honestly. Copy: headline = brand tagline
(last word wrapped in `.ab-hl` = accent role); segments "Design / Build / Launch"; card title
"Your next good idea."; card body "A little structure. Room to play."; CTA "Save direction";
field label "Project name" value "Something good"; toggle "Focus mode"; list rows
"Brand refresh · In review · 72%", "Launch site · Building · 45%", "Spring campaign · Planned · 10%".

### 01 Soft Form — Warm · Graphic · Tactile
Influences: Bauhaus / Neumorphism / Prism. Mode: dark. Slide shape: `soft`. Material label
"Touch & depth", states Flat / Raised / Recessed.
Source of truth: `~/.claude/skills/soft-form-design/assets/approved-reference.html`,
`assets/tokens.css`, `references/visual-system.md` — match those materials (raised/recessed are
the canvas color with paired shadows, glass with iridescent ring, glossy solid primary, ink-fill
selected segment, recessed switch with glossy knob, fixed top-left light). Shadow/highlight
derived from canvas (light: highlight white 79%, shadow = canvas darkened ~25% at 60%;
dark: highlight white 7%, shadow black 53%). Art: the skill forbids reproducing the
reference's sphere / quarter-circle / capsule composition, so compose new geometry from the same
materials: a recessed rounded plinth, a raised canvas semicircle sitting on it, a primary disc,
a secondary vertical bar, and a glass rounded-square lens crossing the disc and bar with a
clipped, slightly scaled duplicate underneath to suggest refraction. Accent: headline word + footer dot. Type: headline weight
500–600, tracking −0.04em; labels uppercase 11px, tracking .14em. Control radius 10–12, panel 24.

### 02 Raw Brutalist — Exposed · Severe · Honest
Influences: Swiss print / Brutalist web / Terminal. Mode: light. Slide shape: `geometric`.
Material label "Hard surfaces", states Default / Hover / Pressed.
Zero radius everywhere. 2px ink borders on every control and panel. Raised = `6px 6px 0 ink`;
pressed = translate(6px,6px) and no shadow. Faint 12-column grid lines across the hero
(ink at ~5%). Headline huge, uppercase, line-height .88, tracking −0.03em; it may be cropped by
the hero edge. All labels monospace (`ui-monospace, "SF Mono", Menlo, monospace`), uppercase,
numbered `[01]`, arrows `→`. Primary = flat CTA block with ink border and `→`. Secondary =
tag strips and the table's status cells. Accent = a highlighter band *behind* the headline word
(background, ink text), never accent-colored text. Segmented = joined boxes sharing borders,
selected = ink fill with canvas text. Field = 2px box, mono value, block caret. Toggle = square
track and square knob with "ON"/"OFF" mono text. Art: giant brand initial in the heading font
cropped by a bordered box, a primary block, ink barcode stripes, mono caption "FIG. 01".
List = bordered table, mono columns. Monochrome discipline: color only where a role says so.

### 03 Neo-Brutal Pop — Chunky · Playful · Loud
Influences: Neo-brutalism / Memphis / Sticker culture. Mode: light. Slide shape: `geometric`.
Material label "Stickers & squish", states Rest / Lift / Squish.
Canvas = Light mixed 6% toward secondary. 2.5px ink outlines; radius 14 controls / 20 cards;
`4px 4px 0 ink` offset shadow; lift = translate(−2,−2) + 6px shadow; squish = translate(4,4) + 0.
Cards filled with `sec-tint`-strength secondary (≈35% into canvas). Headline weight 800, mixed
case; highlight word sits in an accent pill rotated −2°. CTA primary fill + ink border.
Segmented = pill track, selected primary fill. Toggle = outlined pill, ink knob. Art: overlapping
rotated stickers — primary rounded square (8°), secondary outlined circle, accent starburst
(SVG polygon) carrying the brand initial, ink squiggle. List rows are separate outlined pills with
colored initial avatars. Roles override: secondary coverage ≈20% (card fills).

### 04 Retro-Futurist — Analog · Orbital · Glowing
Influences: 1970s space age / Mission control / Synthwave. Mode: dark. Slide shape: `refined`.
Material label "Console", states Idle / Armed / Engaged.
Canvas = Dark pushed darker if lightness > 18%. Panels are bezels: radius 18, vertical gradient
(canvas +6% light → canvas −4%), 1px top inner highlight, deep outer shadow. Screens are inset
with 2px scanlines (black ~8%) and a faint glow. Headline uppercase, tracking .02em, chrome
gradient fill (ink → muted → ink with a hard horizon line at 55%) via background-clip:text.
Labels mono uppercase with ◉ lamps. Primary = illuminated pill: primary fill, `0 0 24px`
primary at 50%, inner top highlight. Secondary = readouts (segmented LED bars, telemetry
values, chart line). Accent = status lamps (glowing dots) + headline word. Segmented = chunky
bevelled keys, selected key lit primary. Toggle = pill with an LED lamp (off dim, on accent glow).
Field = CRT screen, mono value in secondary, blinking caret (static under reduced motion).
Art: synthwave sun (circle, gradient primary→accent, sliced by horizontal gaps) over a
perspective grid floor in secondary, plus an orbit ellipse with a small planet. List =
telemetry rows with mono values and 10-segment LED meters. Motto "All systems nominal."

### 05 Liquid Glass — Fluid · Luminous · Layered
Influences: Liquid glass / visionOS / Optical refraction. Mode: light. Slide shape: `soft`.
Material label "Optics", states Clear / Tinted / Frosted.
Board background = canvas with 3–4 large blurred blobs of primary, secondary, accent (radial
gradients, ~40px blur) — the wallpaper glass sits on. Panels: canvas at ~45% (dark ~35%),
`backdrop-filter: blur(24px) saturate(180%)`, 1px border white 50%, inset top specular
`0 1px 0 white 70%`, inset bottom `0 -1px 0 white 15%`, shadow `0 8px 32px` black 12%.
Radius: panels 28, controls capsule. Primary CTA = primary at ~88% under a specular top-half
gradient, white rim. Segmented = glass capsule track, selected = brighter clear "lens" pill.
Toggle = capsule; knob = clear glass droplet (radial white, rim). Art: a glass lens (squircle)
over brand-colored shapes; inside it a clipped duplicate of the shapes scaled ~1.15 and offset
(simulated refraction — label it that way in code comments), with a faint red/blue edge split
for chromatic aberration. Provide an opaque fallback under
`@media (prefers-reduced-transparency: reduce)`. Blur is not refraction: keep both mechanisms.

### 06 Holo Iridescent — Pearl · Spectral · Precise
Influences: Holographic foil / Y2K chrome / Luxury packaging. Mode: light. Slide shape: `refined`.
Material label "Finish", states Matte / Pearl / Foil.
Canvas = Light with a pearl sheen (≤5% wash of a fixed decorative spectrum: pink #ffd6f0,
cyan #c9f6ff, lilac #e3d4ff, mint #d6ffe9). The spectrum is decorative only, never a brand
role. Cards: white-ish 70%, 1px holographic border (conic spectrum via padding-box/border-box
background trick), radius 20. Primary CTA = solid primary with a static diagonal foil sheen band
and a holographic 1px edge. Headline word = accent fading into the spectrum via
background-clip:text. Segmented = hairline track; selected = chrome pill (silver gradient
#f4f4f6 → #d9dbe1 → #fff → #c9ccd4) with ink text. Toggle: chrome knob, on-track primary.
Field: hairline border, holographic focus ring. Art: holographic orb (conic spectrum + white
radial highlight), a foil ribbon (rotated rounded rect, linear spectrum), a thin primary ring.
List: chrome hairlines, tiny spectral dots. No motion; foil is static.

### 07 Aurora Noir — Precise · Nocturnal · Charged
Influences: Dev-tool UI / Swiss grid / Aurora light. Mode: dark. Slide shape: `minimal`.
Material label "Surfaces", states Rest / Hover / Focus.
Canvas = Dark pushed to lightness ≤ 8%. Background grid of 48px squares (white 3%) faded by a
radial mask. Aurora glow at top of hero: primary + secondary radial gradients, heavy blur.
Cards: white 3% fill, 1px white 8% border, 1px top highlight gradient (transparent → white 30%
→ transparent). One featured card gets a primary→secondary gradient border. Headline weight
600, tracking −0.045em, vertical gradient fill ink → muted. Labels mono 11px muted, `⌘K` kbd
hint. Primary CTA = primary fill, inner top highlight, `0 8px 24px` primary 35% glow.
Secondary = ghost buttons with hairline + second aurora color + chart series. Accent = status
dot and "New" badge (accent text on 15% accent tint). Segmented: track white 4%, selected
white 10% with white 12% border. Toggle 32×18, on = primary. Field: white 3%, border white 10%,
focus ring primary 40% 3px. Art: thin concentric rings (white 8%) with one bright arc in a
primary→secondary gradient and a few connected nodes. List = the densest of the ten: table
with mono IDs, status pills, small avatars, right-aligned tabular numbers.

### 08 Bauhaus Poster — Constructive · Flat · Rhythmic
Influences: Bauhaus 1923 / Constructivism / Swiss poster. Mode: light. Slide shape: `minimal`.
Material label "Form", states Flat / Outlined / Filled.
No shadows, no gradients, no blur — anywhere. Geometry only: circles, half/quarter circles,
rectangles, 45° and −15° diagonals. Controls are either radius 0 or fully round, never in
between. 2px ink borders. Headline uppercase weight 700–800, tight; the kicker runs vertically
(`writing-mode: vertical-rl`) beside the headline. Primary CTA = flat primary rectangle ending
in an ink circle holding the arrow. Segmented = flat blocks, selected primary. Toggle = rect
track with a circle knob. Field = 3px ink bottom rule only, uppercase label. Art: large primary
circle, secondary quarter circle, accent half circle, an ink diagonal bar, a small ink square;
flat overlaps (no blend modes). List rows lead with big numerals "01 02 03". Roles override:
secondary and accent may be large planes inside the art only (coverage note says so); UI rules
unchanged.

### 09 Clay — Puffy · Joyful · Tangible
Influences: Claymorphism / Toy design / Soft 3D. Mode: light. Slide shape: `soft`.
Material label "Clay", states Rest / Hover / Pressed.
Canvas = Light mixed 8% toward secondary. Objects are colored, not canvas-colored (this is the
difference from Soft Form). Clay formula: outer `0 18px 36px -12px` shadow (object color
darkened, 45%), inset `0 -8px 16px` black 12%, inset `0 8px 14px` white 60%. Radius 32 cards,
capsule controls. Primary CTA = primary clay capsule with a primary-darkened colored drop shadow.
Chips = secondary clay beans. Accent = the headline word in an accent clay pill + the art's
focal object. Segmented = inset tray, selected = puffy near-white pill. Toggle = fat 64×36
recessed track, big clay ball knob. Field = inset tray radius 20. Hover = lift −3px with
larger shadow; pressed = scale .97, smaller shadow. Art: CSS 3D primitives via radial
gradients — primary sphere, secondary torus (thick ring with shading), accent capsule rotated,
each with a soft elliptical cast shadow. List rows = chunky clay cards with clay avatars.

### 10 Riso Print — Inked · Grainy · Human
Influences: Risograph zines / Screen print / Editorial. Mode: light. Slide shape: `minimal`.
Material label "Ink", states Solid ink / Overprint / Halftone.
Canvas = Light warmed slightly, with paper grain (inline SVG feTurbulence noise data URI,
multiply, ~8%). Primary and secondary act as two riso inks: `mix-blend-mode: multiply` where
they overlap, with 2–3px misregistration offsets. Halftone = radial-gradient dot pattern
(~6px) in secondary for shading. Headline in primary ink with a misregistered secondary shadow
(`text-shadow: 3px 2px 0` secondary, multiply look). Accent = a third fluorescent ink used tiny:
a hand-drawn SVG circle around the highlight word, stamp marks. Primary CTA = flat primary ink
block, radius 2, grain overlay. Segmented = 1.5px ink outline boxes radius 4, selected primary
ink. Toggle = outlined pill, halftone knob. Field = 1.5px ink box on paper. Art: two overlapping
ink shapes (primary circle, secondary halftone rectangle) multiplied, misregistered duplicate,
accent stamp/asterisk. List rows separated by dashed ink rules.

## Tasks

| ID | Owner | Depends | Writes | Status |
|----|-------|---------|--------|--------|
| T1 | W1 Sonnet | — | registry, board js/css, 01/02/05 aesthetic files, 7 stub files, index.html workspace + Aesthetic panel + tags, app.js render/preview/state/shuffle, persistence.js, brand-session.js, styles.css (old preview styles) | ready |
| T2 | W2 Sonnet | — | js/color-roles.js, js/color-picker.js, js/color-import.js, css/color-picker.css, index.html Color palette panel + its tags, app.js color handlers/controls sync | ready |
| T3 | W3 Sonnet | T1 | 03, 04, 06, 09 aesthetic js/css files only | planned |
| T4 | W4 Sonnet | T1 | 07, 08, 10 aesthetic js/css files only | planned |
| T5 | W5 Sonnet | T1–T4 | js/ai-brief.js, sidebar-foot button, brand guide color-roles page | planned |
| T6 | Coordinator | all | review, visual QA, Mac build, README | planned |

## Board anatomy

Written by T1 (W1) after building. Source of truth: `js/aesthetic-board.js` (`boardHtml`),
`css/aesthetic-board.css`.

**Globals** (plain scripts): `AESTHETICS`, `registerAesthetic`, `aestheticByKey` (registry.js);
`boardTokens(state, def)`, `boardVars`, `boardRoles`, `boardHtml(state, def)`, `abLens(sceneHtml, o)`,
`renderAestheticBoard()`, `abAlpha`, `abInitial`; app.js: `chooseAesthetic(key)` (one undo step + render),
`applyAesthetic(key)` (sets aesthetic, bgMode, shapePreset unless locked), `randomizeAesthetic()`.
`applyPreviewTheme()` remains as an alias of `renderAestheticBoard()` because suggest-ui.js calls it.

**Contract additions (rev 1.1, additive):**
- `def.kicker` (string, hero kicker; falls back to `descriptor`).
- `def.canvas(base)` optional: returns an adjusted canvas hex before tokens are derived
  (`base = {canvas, ink, isDark, primary, secondary, accent, mix, hexToHsl, hslToHex}`). Soft Form uses it.
- `boardTokens` result also has `accentText` / `primaryText` (accent/primary if >= 3:1 on canvas, else fallback)
  and `muted` is pulled toward ink until it reaches 4.5:1 on canvas.
- `materials[].css` placeholders: `{name}` resolves `t[name]` first, else the extra var `tokens(t)['--ab-' + kebab(name)]`
  (e.g. `{lo}` -> `--ab-lo`, `{glassSolid}` -> `--ab-glass-solid`).
- Undo: brand-session.js wraps `pushUndoSnapshot`/`applyUndoSnapshot` so snapshots also carry `aesthetic` and `bgMode`.
- Compare tiles render `boardHtml(state, def)` for each def with `state.aesthetic` overridden only inside `boardRoles`.

**DOM** (root `section.ab[data-ae=key][data-mode=light|dark]`, inline base vars, size container named `ab`):

```
.ab > .ab-in
  header.ab-head: .ab-brand (.ab-mark>span initial + .ab-wordmark | img.ab-logo), .ab-tag (<b> aesthetic name)
  .ab-rule
  .ab-hero: .ab-hero-copy (.ab-kicker, h2.ab-headline > .ab-hl), .ab-art[aria-hidden] (def.art output)
  .ab-rule
  .ab-palette: .ab-labelrow (.ab-label x2), .ab-swatches > .ab-swatch[data-role=canvas|ink|primary|secondary|accent]
               (.ab-chip, b.ab-sw-role, .ab-sw-job "job · coverage", code.ab-sw-hex)
  .ab-rule
  .ab-sections
    .ab-sec.ab-sec-ui: .ab-labelrow > .ab-label > i.ab-n "01" + span; .ab-card >
         .ab-seg[role=group] > button.ab-seg-btn[aria-pressed] x3, h3.ab-card-title, p.ab-card-body,
         button.ab-cta > .ab-cta-label + .ab-cta-arrow (glyph via ::before, per aesthetic)
    .ab-sec.ab-sec-touch: label row "02" + def.labels.material; .ab-panel >
         label.ab-fieldlabel, input.ab-input, label.ab-toggle > span + input.ab-switch[checkbox], .ab-status,
         .ab-states > .ab-state > .ab-disc[data-s=0|1|2] + .ab-state-name
    .ab-sec.ab-sec-use: label row "03"; ul.ab-list > li.ab-row >
         .ab-row-n, .ab-av (hidden by default), .ab-row-name, .ab-row-status, .ab-row-bar>i, .ab-row-pct
  footer.ab-foot: .ab-motto (> i.ab-dot), .ab-infl
```

**Rules for aesthetic CSS:** scope every selector under `.ab[data-ae="key"]`; restyle the classes above (do not
change markup); use `cqw` units for art (`.ab-art` is a size container); narrow layout via `@container ab (max-width: 600px)`;
the app's `input[type=text]` rule is outranked by `.ab .ab-input` (use `.ab[data-ae] .ab-input`). Provide
`prefers-reduced-motion` handling (no transitions on press) and, for translucency, `prefers-reduced-transparency`.
Extra CSS vars come from `def.tokens(t)` (applied inline on the root, so `var(--ab-...)` works everywhere in the board).
`abLens(scene, {x,y,w,h,scale,dx,dy,cls})` builds a lens holding a clipped, scaled duplicate of the art scene
(simulated refraction) — reused by Soft Form and Liquid Glass.

**Interactions** (delegated in `wireBoardInteractions`): segment click switches stage copy, CTA click relabels,
switch toggles status text; the field is a real input. Compare tiles are `inert` and scaled with CSS `zoom`
(design width 900px, or 500px on one column).

**Stubs:** the 7 unbuilt aesthetics have a js file (descriptors, placeholder SVG art, empty materials/rules) and an
empty css file; their owners replace `art`, add `tokens`/`canvas` if needed, `materials`, `rules`, and fill the css.
