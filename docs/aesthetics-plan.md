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
  tokens(t, state) { return { '--ab-shadow': ..., }; }, // optional extra CSS vars from base tokens; `state` = the state being rendered
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
| T1 | W1 Sonnet | — | registry, board js/css, 01/02/05 aesthetic files, 7 stub files, index.html workspace + Aesthetic panel + tags, app.js render/preview/state/shuffle, persistence.js, brand-session.js, styles.css (old preview styles) | built (files present, loads in T5 checks); coordinator acceptance pending |
| T2 | W2 Sonnet | — | js/color-roles.js, js/color-picker.js, js/color-import.js, css/color-picker.css, index.html Color palette panel + its tags, app.js color handlers/controls sync | built (files present, loads in T5 checks); coordinator acceptance pending |
| T3 | W3 Sonnet | T1 | 03, 04, 06, 09 aesthetic js/css files only | built (all 10 aesthetics registered with art/materials/rules; CSS files non-empty); coordinator acceptance pending |
| T4 | W4 Sonnet | T1 | 07, 08, 10 aesthetic js/css files only | built (all 10 aesthetics registered with art/materials/rules; CSS files non-empty); coordinator acceptance pending |
| T5 | W5 Sonnet | T1–T4 | js/ai-brief.js, sidebar-foot button, brand guide color-roles page | submitted (Compare uses def.mode; dead swatch CSS removed; README updated) |
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
- `def.canvas(base, state)` optional: returns an adjusted canvas hex before tokens are derived
  (`base = {canvas, ink, isDark, primary, secondary, accent, mix, hexToHsl, hslToHex}`). Soft Form uses it.
- `boardTokens` result also has `accentText` / `primaryText` (accent/primary if >= 3:1 on canvas, else fallback)
  and `muted` is pulled toward ink until it reaches 4.5:1 on canvas.
- `materials[].css` placeholders: `{name}` resolves `t[name]` first, else the extra var `tokens(t)['--ab-' + kebab(name)]`
  (e.g. `{lo}` -> `--ab-lo`, `{glassSolid}` -> `--ab-glass-solid`).
- Accent highlight fallback (T4): `boardTokens` also returns `accentLow` (true when accent < 3:1 on the canvas) and the root carries
  `data-accent-text="ok|low"`. In `low` the base CSS renders `.ab-hl` as ink text on an accent highlighter band
  (`.ab:where([data-accent-text="low"]) .ab-hl`, specificity 0,2,0), so the accent is always visible. Any aesthetic rule
  `.ab[data-ae="key"] .ab-hl` (0,3,0) overrides it; an aesthetic that restyles the accent word should also handle
  `.ab[data-ae="key"][data-accent-text="low"] .ab-hl` (set `background-image: none` if it draws its own).
  `--ab-accent-text` is unchanged (accent, else primary, else ink) for other uses such as badges.
- Undo: brand-session.js wraps `pushUndoSnapshot`/`applyUndoSnapshot` so snapshots also carry `aesthetic` and `bgMode`.
- Compare tiles render `boardHtml(state, def)` for each def with `state.aesthetic` overridden only inside `boardRoles`.

**Round 2 hooks (R1, additive; defaults keep the previous look, except the default highlight is now `ink` and every hero gains the sub-copy line):**

All optional on the def. Unknown values fall back to the default. Resolved by `abLayoutOf(def)`, `abTypeFor(def)`,
`abHighlightOf(def)` in `js/aesthetic-board.js`; the board root carries the resolved choices as data attributes so
aesthetic CSS can key off them.

| Def field | Values (default first) | Root attribute / CSS var | Effect |
|-----------|------------------------|--------------------------|--------|
| `layout.hero` | `'split'`, `'centered'`, `'poster'`, `'scene'` | `data-hero` | split: copy left, art right. centered: statement centered (max 62cqw), art full width below (`--ab-art-ratio`, default 16/7; `--ab-art-ratio-narrow` default 4/3). poster: headline spans the full width at ~12.5cqw (cap 168px), art absolutely placed bottom-right, cropped by the board edge (`--ab-poster-art-w`, default 34cqw; `--ab-art-ratio` default 1); below 600px the art drops below the headline. scene: `.ab-art` becomes a full-width rounded framed panel (`--ab-art-ratio`, default 21/10) and `.ab-hero-copy` overlays its lower left on a frosted canvas substrate (58cqw wide); below 600px the panel sits above the copy. |
| `layout.palette` | `'swatches'`, `'strips'`, `'chips'` | `data-palette`, `.ab-swatches[data-kind]` | strips: one full-width band, each `.ab-swatch` is a flex band weighted by `--cov` (coverage %), filled with `--sw`, text `--sw-on`, `.ab-chip` hidden, labels inside (stacked rows below 600px). chips: compact pill row (dot, role, hex; job hidden). Every `.ab-swatch` always carries inline `--sw` (hex), `--sw-on` (readable text colour on it) and `--cov` (number). |
| `layout.sections` | `'two-col'`, `'stacked'`, `'asym'` | `data-sections` | two-col: 1.1fr / 1fr (today). stacked: one column. asym: 7fr / 5fr (01 left, 02 right; `.ab-sec-use` still spans). One column below 600px for all. |
| `layout.subcopy` | `true`, `false` | `data-subcopy="on\|off"` | `false` omits the line (`p.ab-subcopy`) from the markup. |
| `type.ui` | `'body'`, `'heading'`, `'sans'`, `'mono'` | `--ab-font-ui` | Face for tabs, buttons, list cells, field values (`.ab { font-family }`). `'sans'` = the body face if its FONTS category is `sans`, else the heading face if `sans`, else a `mono` face, else a `display` face, else the heading face. `'mono'` = `ui-monospace, "SF Mono", Menlo, monospace`. Default `'body'` (today). Resolved by `abResolveFace(kind, state)` -> `{name, expr}`. |
| `type.label` | same | `--ab-font-label` | Small caps captions: `.ab-label .ab-kicker .ab-tag .ab-fieldlabel .ab-status .ab-state .ab-foot .ab-sw-job`. Defaults to the `ui` face. |
| `type.display` | number, default 1 | `--ab-display` | Multiplies headline size (all hero layouts and the narrow size). Headline = `clamp(...cqw...) * --ab-hl-scale * --ab-hs * --ab-display`. Base sizes per hero: split `clamp(32px, 7.4cqw, 70px)`, centered `clamp(40px, 8.4cqw, 104px)`, poster `clamp(44px, 12.5cqw, 168px)`, scene `clamp(30px, 5.6cqw, 78px)`. An aesthetic that sets its own `.ab-headline` font-size should multiply by `var(--ab-display, 1)`. |
| `highlight` | `'ink'`, `'band'`, `'custom'` | `data-highlight`, `--ab-accent-ink` | ink: `.ab-hl` is `t.accentInk` text. band: `--ab-accent` fill, `--ab-on-accent` text, padded. custom: the framework draws nothing; the aesthetic styles `.ab-hl` (use `--ab-accent-ink` where it needs a text colour). The base rules sit in `:where()` so any `.ab[data-ae] .ab-hl` rule still wins. The AI brief describes the treatment from this field. |
| `labels.statesKind` | `'swatch'`, `'button'`, `'chip'` | `data-states`, `.ab-states[data-kind]` | swatch: three `.ab-disc[data-s]` + `.ab-state-name` (today). button: three non-interactive clones of the CTA, `span.ab-cta.ab-state-ctl.is-rest\|is-hover\|is-pressed[data-s=0..2]` (label "Save", arrow hidden) + `.ab-state-name`; the aesthetic's own CSS must give the states by also targeting `.ab-cta.is-hover` / `.ab-cta.is-pressed` (and may style `[data-s="2"]` for a third state such as focus). chip: `.ab-state-chip[data-s]` holding the state name, no separate name. |
| `ctaFill` | `'primary'`, `'ink'` | none (CSS decides) | Documents that the main action is not primary-filled; only the AI brief reads it (component map, hard rule 1, contrast pair). Aurora Noir uses `'ink'`. |
| `def.cardFill` | token name, e.g. `'--ab-paper'` (optional) | none (CSS decides) | Token used for cards and panels. The AI brief's "Card / panel" row reads it. Default `--canvas`. |
| `def.highlightNote` | one sentence (string) | none | Describes a `highlight: 'custom'` treatment. The AI brief uses it verbatim (hard rule 8 and the component map). |

- The AI brief derives highlight wording only from `def.highlight`; the old `AIB_BAND_HL` fallback list was removed.
- Token `t.accentInk` (`abAccentInk`): the accent itself when it is already >= 3:1 on the canvas, else the same hue and
  saturation shaded toward black (light canvas) or tinted toward white (dark canvas) one HSL lightness step at a time
  until it reaches 3:1; ink if none does. On a light canvas a yellow or yellow-green accent (hue 38-80) is not darkened at
  constant hue (that turns olive): at each step it uses `h' = h - min(14, (h - 34) * 0.6)` and `s' = max(s, 85)`, so
  yellows go amber. Other hues and the dark-canvas (lightening) branch are unchanged. CSS var `--ab-accent-ink`; listed as `--accent-ink` in the AI brief tokens table.
  `t.accentText` / `--ab-accent-text` is unchanged (accent, else primary, else ink). `data-accent-text="ok|low"` still exists.
- Sub-copy: every hero gets `p.ab-subcopy` inside `.ab-hero-copy`, after the headline:
  `<span class="ab-sub-lead">A design language for <Brand></span><span class="ab-sub-rest"> — type, color and material in one place.</span>`.
  Reading copy, so it is pinned to `--ab-font-b` and muted; an aesthetic may restyle the two spans (Aurora Noir sets the
  lead in ink and the rest muted, in the UI face) or hide it with `layout.subcopy: false`.
- `.ab-art` is a size container in every layout; art sized in `cqw` follows the art box, and `@container (max-width: Npx)`
  queries written inside art CSS (unnamed) apply to the art box itself. `.ab` also defines `--ab-pad` (the board padding,
  usable inside `.ab-in`).
- Aurora Noir (hero centered, sections asym, states button, ink CTA) and Liquid Glass (hero scene, states chip) are the
  reference implementations of these hooks.

**DOM** (root `section.ab[data-ae=key][data-mode=light|dark][data-hero][data-palette][data-sections][data-highlight][data-states][data-subcopy][data-hcls][data-bcls]`, inline base vars, size container named `ab`):

`data-hcls` / `data-bcls` carry the heading and body face's `FONTS[].cls` (`didone`, `soft-serif`, `pixel`, `deco`, ...; empty when unset), so an aesthetic can adapt to the face in CSS without reading globals (e.g. `.ab[data-ae="neo-deco"][data-hcls="deco"] .ab-card-title`).

```
.ab > .ab-in
  header.ab-head: .ab-brand (.ab-mark>span initial + .ab-wordmark | img.ab-logo), .ab-tag (span.ab-tag-pre "Design language / " + <b> aesthetic name)
  .ab-rule
  .ab-hero: .ab-hero-copy (.ab-kicker, h2.ab-headline > .ab-hl, p.ab-subcopy > .ab-sub-lead + .ab-sub-rest), .ab-art[aria-hidden] (def.art output)
  .ab-rule
  .ab-palette: .ab-labelrow (.ab-label x2), .ab-swatches[data-kind] > .ab-swatch[data-role=canvas|ink|primary|secondary|accent][--sw,--sw-on,--cov]
               (.ab-chip, b.ab-sw-role, .ab-sw-job "job · coverage", code.ab-sw-hex)
  .ab-rule
  .ab-sections
    .ab-sec.ab-sec-ui: .ab-labelrow > .ab-label > i.ab-n "01" + span; .ab-card >
         .ab-seg[role=group] > button.ab-seg-btn[aria-pressed] x3, h3.ab-card-title, p.ab-card-body,
         button.ab-cta > .ab-cta-label + .ab-cta-arrow (glyph via ::before, per aesthetic)
    .ab-sec.ab-sec-touch: label row "02" + def.labels.material; .ab-panel >
         label.ab-fieldlabel, input.ab-input, label.ab-toggle > span + input.ab-switch[checkbox], .ab-status,
         .ab-states[data-kind=swatch|button|chip] > .ab-state > (.ab-disc[data-s] | span.ab-cta.ab-state-ctl.is-* | .ab-state-chip[data-s]) + .ab-state-name
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

**Round 3 additions (F1):**

- `js/aesthetic-meta.js` (loaded after the aesthetic files, before `aesthetic-board.js`): `AESTHETIC_META[key] = { family, fonts: { heading:{classes,picks}, body:{classes,picks}, mono?:{picks,note?}, avoid:[], why, pairings:[[h,b],…] } }`,
  `AESTHETIC_FAMILIES` (ordered `{key,label}`), helpers `aestheticMeta(key)` (null when missing), `aestheticFamilyOf`, `fontFit(font, recBlock, avoid)` -> `'match'|'consider'|'avoid'`
  (a pick or a font in a recommended class matches; a font whose class is in `avoid` is avoid; `'serif'` in `avoid` means every serif class), `fontFitFor(key, state)`, `fontClassWords(classes)`.
  It prints a `console.warn` at startup if any pick, pairing, class or family is unknown, or if a pick or pairing face sits in its own aesthetic's `avoid` list (round 6), and prints nothing otherwise. A missing entry only means "no Type block, no family chip".
- `FONT_CLASSES` and a `cls` on every `FONTS` entry (data.js).
- Type block, between the palette's rule and `01`: `section.ab-type[data-cols=2|3][data-applied] > .ab-labelrow, .ab-type-grid > .ab-type-col[data-role=heading|body|mono]
  (p.ab-type-role, p.ab-type-class, ul.ab-type-picks > li.ab-type-pick[style font-family], p.ab-type-fit > .ab-type-cur + span.ab-fit[data-fit=match|consider|avoid]), .ab-type-foot
  (p.ab-type-avoid > .ab-type-k, p.ab-type-why, .ab-type-act > button.ab-type-apply + span.ab-type-pair)`, followed by an `.ab-rule`. An aesthetic restyles it from its own css
  under `.ab[data-ae="key"] .ab-type…` (it is neutral by default, built from `--ab-*` tokens); do not change the markup. The apply button is wired in `wireBoardInteractions` and
  calls `applyRecommendedFonts()` (app.js: first pairing, one undo step, honours `locks.typography`).
  Framework behaviour (aesthetics may override any of it from scoped css):
  - The first `.ab-type-pick` is the lead (it is the face "Use recommended fonts" applies): `clamp(22px, 3.1cqw, 32px)`, the rest stay at the base size. Pick weight is `var(--ab-type-pick-w, 400)`; an aesthetic sets `--ab-type-pick-w` in `tokens()` to its headline weight (Pop 700, Raw 400, Bauhaus 600, Groovy 400, Bento 600).
  - `.ab-fit[data-fit=match]` is a neutral tag (secondary tint, ink text), not primary; `.ab-type-fit` is a grid, so the pill sits under "Your heading: X".
  - The mono column is only emitted when `fonts.mono` has a pick that is not also in `fonts.body.picks` (Pixel Arcade's VT323 is a body pick, so it renders 2 columns).
- Narrow boards (container <= 600px): `.ab-tag-pre` is hidden and `.ab-tag` is `white-space: nowrap` with no width cap (aesthetic css must not re-add a narrow `.ab-tag { max-width }`; the brand name is never truncated); `.ab-brand` grows; `.ab-labelrow` wraps (the descriptor drops under the label); list rows use `2.6ch / 1fr / 4.5ch` with the name on row 1 (wrapping), the status pill under it and the percent at the right. Aesthetics with their own narrow `.ab-row` grid (Blueprint, Pixel) keep it.
- True italics: FONTS entries with `ital: '400'` (Instrument Serif, Playfair Display, Bodoni Moda, Newsreader, Fraunces, Source Serif 4, Lora, Literata, EB Garamond, Cormorant Garamond, Libre Caslon Text, Spectral) are requested as `family=Name:ital,wght@0,w1;0,w2;1,400` (`googleFamilyParam` in data.js; used by app.js `googleFontChunkUrls` and export-html.js). `font-style: italic` therefore renders the real italic, not an oblique. Tuples are sorted `0,` before `1,`, weights ascending; every chunk URL was checked for HTTP 200.
- Sidebar: `#aeFamilies > button.ae-fam[data-family]` filters `#aeList` (stored in localStorage `bd.aestheticFamily`); `visibleAesthetics()` is the filtered list used by the tiles, prev/next, **Shuffle aesthetic**
  (so Shuffle everything and the Space shortcut too) and Compare all. Typography panel: `#fontRec` (`#frText`, `#frFit`, `#applyRecFonts`). Each tile needs a `[data-motif="<key>"]` rule in aesthetic-board.css.
- Compare all builds its tiles only while that view is open; the hidden view's DOM is emptied.
- AI brief: Typography gets a `### Recommended type for <name>` subsection (`aibTypeRecommendation` in ai-brief.js).

**Brand deck hooks (D1; spec in docs/brand-deck.md):**

- `aesthetic-board.js` exposes `abBoardParts(state, def)`; `boardHtml` is `P.rootOpen() + P.head() + P.hero() + P.palette() + P.type() + sections + P.foot()`
  and its output is byte-identical to before the refactor. Builders on `P`: `rootOpen(extraClass, extraAttrs)`, `head(pre, name)`, `art()`, `hero()`, `swatches()`, `palette()`, `type()`,
  `card()` (01 card), `panel()` (02 field/toggle/states), `list()` (03 rows), `secUi() / secTouch() / secUse()`, `foot()`; data on `P`: `t` (tokens), `copy`, `roles`, `layout`, `labels`,
  `brand`, `style`, `uid`.
- `js/brand-deck.js` renders ten slides (`DECK_SLIDES`: cover, principles, color, typography, interface, material, patterns, product, dodont, closing). Each is `section.ab.ab-slide[data-ae][data-slide=key]`
  at 1280x720 (`overflow: clip`), so every aesthetic's scoped css applies to the shared `.ab-*` classes inside it. Slide chrome: `.ab-in.ab-slide-in > .ab-head (Brand guidelines / <title>) +
  .ab-rule + .ab-slide-body > one wrapper element + .ab-foot.ab-slide-foot (dot + aesthetic name, "n / 10")`.
- An aesthetic may restyle any `.ab-deck-*` class with `.ab[data-ae="key"].ab-slide ...` (neutral defaults in css/brand-deck.css, which loads after the aesthetic css). Classes: `ab-deck-cover`,
  `ab-deck-principles / -lead / -plist / -principle / -ptitle / -pline`, `ab-deck-color / -roles / -role / -lower / -ratio / -bar / -seg / -legend / -pairs / -pair / -pchip`,
  `ab-deck-type / -faces / -face / -aa / -scalecol / -scale / -sample / -rec`, `ab-deck-sections`, `ab-deck-material / -stage / -matcol / -mats / -mat / -note`,
  `ab-deck-app / -side / -nav / -screen / -screenbody`, `ab-deck-dodont / -col / -rules / -rule / -mark`, `ab-deck-closing / -closemain / -contact / -mail`. `--dk-r` (root var) is the container
  radius taken from the shape preset; `--dk-fs` is a heading's base px.
- Reused board classes inside slides: `.ab-hero / -hero-copy / -kicker / -headline / -hl / -art` (cover), `.ab-swatches` (color), `.ab-card / .ab-panel / .ab-list / .ab-row` (interface, product),
  `.ab-label / .ab-n` (labels, numbers), `.ab-fit` (do / don't tags, type fit), `.ab-foot / .ab-dot / .ab-motto / .ab-infl` (slide footer).
- Fit pass (`bdFitDeck`, runs after the build and again when webfonts load): cover / principles / closing shrink `--ab-hs` (every headline multiplies it) down to a floor, then any slide
  whose body is still taller than its box is scaled with `transform: scale()` on its wrapper (floor 0.55). Aesthetics need no per-slide size rules. Headlines inside `.ab-deck-*` are forced
  visible (Mixed Type / Rebus hide the real `.ab-headline`) and fall back to ink when the inherited colour would not read on the canvas (liquid glass white-on-scene).
- Deferred: `render()` only marks the deck stale (`renderBrandDeck()`); slides are built when `#deckSection` is within 600px of the viewport, in idle time. Hover previews skip the deck.
- Export (`rasterizeDeckSlide(key, scale)`): off-screen 1280x720 clone, html2canvas with an `onclone` pass that rewrites `color(srgb ...)` (what `color-mix()` computes to) to rgba and swaps
  checkbox inputs for spans (html2canvas throws on both). `downloadDeckSlidePng`, `buildBrandDeckPdf(scale)` (jsPDF, landscape 1280x720 px pages, JPEG per slide).
- Extension points: push `{ key, title, name?, foot?, pattern?, build(P, state, def, t) -> body HTML }` into `DECK_SLIDES` (or `registerDeckSlide(slide, afterKey)`); assign `deckPatternHook =
  (P, slideKey) => HTML` to lay a background pattern behind slides flagged `pattern: true` (cover and closing). Both are no-ops until used.

**Patterns hooks (PU; spec in docs/patterns.md):**

- Workspace view toggle is `Board | Compare all | Patterns` (`boardView` in aesthetic-board.js: `'board' | 'compare' | 'patterns'`, UI only, never saved). `renderAestheticBoard()` shows
  `#patternsView` for `'patterns'`, empties the board and Compare DOM, and calls `PatternsUI.setVisible(on)` (js/patterns-ui.js), which draws nothing while hidden.
- `state.patterns` = pinned patterns `[{ key, params, colorway, seed }]` (max 8, immutable entries: always replace the array). Saved by `serializeState` / `applySavedSessionToState`
  (normalised through `PatternPins.normalizeList`), reset by `resetState`, and carried in every undo snapshot (brand-session.js wraps `pushUndoSnapshot` / `applyUndoSnapshot`).
  Pin and unpin are one undo step and mark the brand unsaved like any other edit.
- Pattern inks come from `Patterns.inksFor(state | P.t, colorway)`, which uses `boardTokens`, so patterns match the board exactly (ground = canvas, ink1 = primary, ink2 = secondary,
  spark = accent).
- **Tone (quiet patterns), CAO-4 P1.** `tone` is a common numeric pattern param, 0..1, default 1 (js/patterns/engine.js header has the same text). It is in every family's schema
  (`Patterns.defaults(key).tone === 1`, `Patterns.resolve` clamps it), so it travels in `params` and in pins (`state.patterns[i].params.tone`).
  - `tone < 1` = quieter. Every non-ground ink (ink1, ink2, deep, t1, t2, mute) becomes `mix(ink, ground, tone)`; the spark ink keeps its colour, but the spark area budget (and the aura
    spark radius) shrinks to `clamp(tone, 0.5, 1)` of normal, so any tone <= 0.5 halves the spark. Families see it as `env.tone` / `env.sparkK`.
  - `Patterns.render`, `renderSVG` and `tileCSS` all honor `params.tone`. Pass `entry.params` as is, or `Object.assign({}, params, { tone })`. Same seed + params + tone = identical pixels.
  - `Patterns.suiteFor(key)` returns `{ key, name, colorway, params, tone }`; `entry.tone` and `entry.params.tone` are the same number (default 1). Quiet suites in js/patterns/fit.js:
    aurora-noir 0.35 (Halftone "Fine screen" 0.25), soft-form 0.45, liquid-glass 0.6 (Aura "Glass light" stays 1), blueprint 0.55 with every entry colorway `mono`.
  - Patterns view: "Strength" slider (0-100%, under Colorway) writes `tone`; suite presets set its default; picking a family from "All families" keeps the current strength.
  - Op-art rings: fit entries use `warp <= 0.18`, `freq >= 16`, `bands: 'two'`; only retro-futurist ("Scope rings", lens), bauhaus-poster ("Target") and groovy-70s ("Concentric") keep it.
  - Aura spark: drawn with the same feathered falloff as the colour fields, radius capped at 6% of the short side. The aura family's own old "Strength" param is labelled "Intensity" (key still `strength`).
- Patterns view layout (js/patterns-ui.js, css/patterns.css): suite captions are the family name only, with the colorway as a canvas-coloured chip over the thumbnail's bottom-left;
  "In use" previews (card 85:55, phone wallpaper 9:19.5, poster 3:4) render the working pattern at each aspect from the board tokens (`--pt-*` vars set on `#patternsView`) and brand fonts;
  at container width <= 760px `#patternsView.is-narrow` orders canvas, exports, "Adjust pattern" (`<details>`, closed), In use, suite, pinned, all families.
- Deck (js/patterns-deck.js, loaded after brand-deck.js): `registerDeckSlide({ key: 'patterns' }, 'material')` adds slide 07 (pinned patterns, else the six-pattern suite, as `<img>` data URLs;
  classes `ab-deck-patterns / -ptgrid / -pt / -ptcw`); `deckPatternHook` returns the cover's pattern as a full-width bottom band (`.pt-deck-band`, 132px) and the closing slide's as a 288px side strip down the left edge (`.pt-deck-strip`).
  css/patterns.css pads `.ab-slide-in` away from the strip with `:has(> .ab-deck-pattern > .pt-deck-strip)`, so slide text never sits on a pattern. `bdFitDeck` is wrapped to shrink the
  closing headline until the copy block clears the contact row.
- AI brief: `aibPatternLines(state, def)` adds a `## Patterns` section (ink mapping, the aesthetic's six families, pinned patterns' parameters; seamless pins get a CSS tile size note, never the data URI).

**Stubs:** the 7 unbuilt aesthetics have a js file (descriptors, placeholder SVG art, empty materials/rules) and an
empty css file; their owners replace `art`, add `tokens`/`canvas` if needed, `materials`, `rules`, and fill the css.

**Round 4 keys (P4 scaffold):** `blob-tracking` (21), `xerox` (22), `micrographics` (23), `mixed-type` (24), `ascii-art` (25), `rebus` (26); spec in docs/aesthetics-round4.md. New font class `typewriter` (Special Elite, Courier Prime with true italics `ital: '400;700'`).

**Round 5 keys (P5 scaffold):** `corporate-vandalism` (27), `religious-futurism` (28), `xerox-punk` (29), `acid-graphics` (30), `cybersigilism` (31), `industrial-hazard` (32), `radical-memphis` (33), `biomechanical-gothic` (34), `pirate-broadcast` (35), `dystopian-luxury` (36); spec in docs/aesthetics-round5.md. New font class `blackletter` (Grenze Gotisch, Pirata One; counted as serif-ish for `avoid: ['serif']`), plus Cinzel Decorative (deco), Barlow Condensed (condensed), Share Tech Mono (mono).

**Round 6 keys (R6 scaffold):** `frutiger-aero` (37), `naive-doodle` (38), `wabi-sabi` (39), `dark-academia` (40), `mid-century` (41), `art-nouveau` (42), `transit-wayfinding` (43), `gorpcore` (44), `old-web` (45), `big-top` (46), `gummy` (47), `curio-cabinet` (48). 48 aesthetics in all. Sidebar tiles: the 36 earlier keys have bespoke `[data-motif]` rules in css/aesthetic-board.css; every other key falls back to a neutral hairline card and dot (`.ae-motif:not(<the 36 keys>)`). When a bespoke motif lands, add its rules **and** its key to that `:not()` list.

**Round 5 framework hooks (X0-R5.1 … R5.8; all optional and additive: an aesthetic that defines none of them renders byte-identically to before):**

- **`def.headline(ctx, text)` -> HTML string** (X0-R5.1). For an aesthetic that draws its own headline (ransom tiles, rebus, mixed type).
  - Where: the hero h2 (board, deck cover) and the deck's Principles and Closing h2, all built by `abHeadlineH2(def, ctx, text, extraClass, extraAttrs)` in `js/aesthetic-board.js`.
  - Called with `ctx` (the art ctx: `t, key, state, brandName, tagline, initial, logoDataUrl`) and `text`, the plain trimmed headline string (the tagline on the board and cover, `def.motto` on Principles and Closing). `text` is NOT escaped: the hook must escape everything it prints (`escapeHtml`) and returns inner HTML.
  - The framework wraps it: `<h2 class="ab-headline ab-headline--custom[ ab-deck-h]" aria-label="${escaped text}"><span aria-hidden="true">${hook HTML}</span></h2>`. The h2 stays in the normal slot, so `bdFitHeadline` / `bdFitCover` measure and fit it like any headline (the hook's markup should size its glyphs in `em` so the h2's font-size drives it). The aria-label is the real text for assistive tech.
  - A hook that returns a non-string or `''` falls back to the standard `.ab-hl` headline. Do not hide `.ab-headline` in the aesthetic css any more (the old visually-hidden pattern in mixed-type, rebus, xerox-punk is deleted when they migrate); `css/brand-deck.css` still carries the visually-hidden override for aesthetics that have not migrated.
- **`def.printPrimary(t) -> '#rrggbb'`** (X0-R5.2). The hex the primary is *printed* as (Xerox Punk and Acid Graphics push it to Day-Glo). Called once in `boardTokens` with the token object before the primary is touched (`t.primary` = brand hex, `t.canvas`, `t.ink`, `t.isDark`, `t.mix`, `t.alpha`, `t.contrast`, `t.readable`, ...). A return value that is not `#rrggbb`, or equals the brand primary, is ignored.
  - Token result (always present): `t.printPrimary` (= `t.primary` when no hook), `t.printed` (boolean). **`t.primary` always stays the brand hex** (patterns, brief placeholders, palette). When printed: `t.onPrimary` = readable text on `t.printPrimary`, `t.priTint` = mix(`printPrimary`, canvas, .12), `t.primaryText` = `printPrimary` if >= 3:1 on the canvas else ink.
  - CSS: `--ab-primary` = `t.printPrimary`, `--ab-on-primary`, `--ab-pri-tint` and `--ab-primary-text` follow it; `--ab-primary-brand` (only when printed) = the brand hex. An aesthetic's `tokens()` still wins over all of these (the old override pattern keeps working until it migrates; delete it when moving to the hook).
  - Palette: the primary swatch is filled with the brand hex, its label colour (`--sw-on`) is chosen for the brand hex, and it gets a second line `<code class="ab-sw-print">prints as #XXXXXX</code>` (11px muted mono; inherits the swatch colour in `strips`).
  - Deck Color slide: the "Action" contrast pair uses `onPrimary` on `printPrimary`.
  - AI brief (printed only): token rows `--primary-print` and `--on-primary-print` (`--primary` and `--on-primary` stay the brand pair that `brandCssText` defines), a paragraph under the token table, `--primary-print` / `--on-primary-print` in the component map (button, selected segment, toggle, field focus, row edge, progress, focus ring) and in hard rule 7, the contrast pairs `--on-primary-print on --primary-print`, `--on-primary on --primary`, `--primary-print on --canvas` and `--primary on --canvas`, and `--primary-print` / `--on-primary-print` in the derived CSS block.
- **`def.deck.coverDisplay` (number > 0)** (X0-R5.3). The deck cover headline starts at `coverDisplay x` the cover base size (`min(132px, 11.5cqw)`) instead of `type.display`, then `bdFitCover` fits it as before (the soft floor scales with it too). Board and other slides keep using `type.display`. Delivered to the fit code as the slide's `--dk-cover-display` var (set in `bdSlideHtml`, cover only).
- **Permanent Marker** (X0-R5.4) is in `FONTS` (`display`, class `groovy`) and in no recommendation list; css2 and every chunk URL return 200.
- **Biomechanical Gothic type recommendation** (X0-R5.5, revised round 6 by fx66): pairings Cormorant Garamond / Spectral, Italiana / Spectral, Cormorant Garamond / EB Garamond; heading classes old-style, didone (picks Cormorant Garamond, Italiana); Cinzel, Marcellus and Grenze Gotisch are no longer recommended; `blackletter` stays on its `avoid` list. Cormorant Garamond now loads 300/400/600 so the light inscriptional weight is real.
- **Deck "In product" card** (X0-R5.6; superseded in round 6, see "Round 6 framework hooks"): `.ab-deck-ctacard` is `color-mix(in srgb, var(--ab-ink) 4%, var(--ab-canvas))`, not the primary tint.
- **Deck Color slide** (X0-R5.7): renders the board's own `<div class="ab-swatches" data-kind="${layout.palette}">${P.swatches()}</div>` (inside `.ab-deck-sws`), so an aesthetic's `.ab-swatches` / `.ab-swatch` / `.ab-chip` css applies unchanged; the proportion bar and contrast pairs stay below. The old `.ab-deck-sw*` classes are gone.
- **Deck Interface slide** (X0-R5.8): each component cell holds `.ab-deck-cellbody > .ab-deck-cellzoom` (the part), `zoom: 1.45`; the states row `.ab-deck-uistates` is `zoom: 1.2`; cell min-height 170px; segmented buttons min-width 60px, CTA min-width 150px, toggle gap 16px so the zoomed parts fit a cell. Aesthetics that style the cell body (Pirate Broadcast) keep working: the zoom sits on the inner wrapper.

**Blend hooks (BL, round 6; spec in docs/blend.md):**

- `aestheticView(state)` (js/blend.js) is what the board, deck, Patterns view and brief render: the base def, or a blended copy of it (`def.blend` set, `def.key` still the base). `abView()` / `aibView()` wrap it.
- `abBoardParts` exposes `P.states()` (the 02 states row) and `P.panelPre()` (empty; markup laid first inside `.ab-panel`), and calls `blendParts(P)` for a blended def. Unblended output is unchanged.
- Nested donor scopes inside a blended board: `.ab.ab-blend-art` (hero art), `.ab.ab-blend-orn` (02 ornament layer), `.ab.ab-blend-scope` (material samples), each `data-ae="<donor>"`. Aesthetic CSS needs no changes; a donor's `.ab[data-ae] .ab-art ...` rules style its art inside the base's box. Avoid generic descendant rules such as `.ab[data-ae="key"] .ab-art svg { width: 100% }` where a class would do: they also reach a donor's art when this aesthetic is the base.
- Blended roots carry `data-blend`, `data-blend-ch`, and when used `data-blend-type` / `data-blend-hl`.

**Round 6 framework hooks (FW; all optional. An aesthetic that defines none of them renders a byte-identical board: `boardHtml` was diffed for all 48 aesthetics in both modes. The deck's In product and Do/Don't slides changed for everyone, by design.)**

Board structure (`def.layout`, js/aesthetic-board.js):
- **`layout.order`**: the board's blocks between the header and the footer, any permutation of `['hero', 'palette', 'type', 'sections']` (default that order). Unknown or repeated keys are dropped and missing ones appended, so nothing leaves the board. A hero or palette is followed by an `.ab-rule` unless it is last; the type block carries its own rule. DOM order, so the 390px layout follows it.
- **`layout.sectionOrder`**: the three numbered sections inside `.ab-sections`, a permutation of `['ui', 'touch', 'use']` (01 Interface, 02 material panel, 03 In use). `.ab-sec-use` still spans both columns in `two-col`/`asym`; restyle `.ab-sections` if the new order wants another grid.
- **`layout.hero`** adds `bleed` (the art runs edge to edge above the copy; `--ab-art-ratio` default 21/8, narrow `--ab-art-ratio-narrow` 4/3). Its rule is `.ab[data-ae][data-hero="bleed"]` (0,4,0) so it beats an adopter's own split-hero grid; refine with `.ab[data-ae="key"][data-hero="bleed"]`. Rules go through `.ab-hero > .ab-art`, so a blend donor's art is never hit. Deck cover: bleed's art sits beside the copy, on the right. (`art-first` and `type` were removed in the round 6 cleanup: no aesthetic used them; an unknown hero falls back to `split`.)
- **`layout.palette`** adds `list` (a ruled index: 28px chip, role, job, hex; job hidden at 390px). The deck Color slide uses the same markup. The aesthetic's own `.ab-chip` styling still wins over the kind's chip shape. (`stack` and `dots` were removed in the round 6 cleanup: unused; an unknown palette falls back to `swatches`.)
- `layout.sections` (`two-col` / `stacked` / `asym`) is unchanged and honoured on the board at every width (one column under 600px).

Components:
- **`def.states(ctx)` -> HTML**: the aesthetic's own state component (instead of the shared three discs / buttons / chips). Returns the inner HTML of `<div class="ab-states" data-kind="custom">`; the root gets `data-states="custom"`. `ctx` = the art ctx (`t, key, state, brandName, tagline, initial, logoDataUrl`) + `labels` (the three `def.labels.states` names), `parts` (the board parts) and `e` (escapeHtml). Escape what you print. `''`, a non-string or a throw keeps the `statesKind` row. A blend's donor materials still replace it on a blended board. Deck Interface slide: a custom states row is not forced into the 3-column grid.
- **`def.panels = { card(ctx), panel(ctx), list(ctx) }`** -> HTML: real markup for the 01 card, the 02 panel or the 03 list (one element's outer HTML; e.g. Editorial Serif's text page as real paragraphs instead of CSS generated content). `ctx` = art ctx + `parts`, `e`, `labels`, `rows` (`AB_ROWS`), `stages` (`AB_STAGES`). The default markup stays on `P.cardBase()` / `P.panelBase()` / `P.listBase()`; the deck takes the segmented control, CTA, toggle and states from the default markup when your markup lacks them.

Fonts: **`font-synthesis: none`** on every `.ab` (board and deck). A face is shown only in the weights and styles it has (FONTS `weights` / `ital`): asking Michroma or Anton for 600/700, or for italic, gets the real 400 upright, never a smeared fake. Ask for weights the face has.

Deck (`def.deck`, js/brand-deck.js; every function hook gets `ctx` = art ctx + `parts` (abBoardParts: `card()`, `list()`, `panel()`, `states()`, `art()`, `swatches()`, `head(pre, name)`, `brand`, `t`, `layout`, `labels`), `def`, `slide`, `e`, `rows`, `stages`; a hook that returns `''`/non-string or throws falls back to the default):
- **In product, default (slide 08)**: no longer a SaaS mock. A screen frame holding the board's own parts in their own section wrappers: `.ab-sec.ab-sec-use` (labelrow "01 Projects", `P.list()`, the panel's `.ab-toggle`) and `.ab-sec.ab-sec-ui` (labelrow "02 Next step", `P.card()`), so every scoped rule of the aesthetic applies. Frame: `.ab-deck-prod[data-prod="board"] > .ab-deck-prodframe`, border = the aesthetic's own card border (`--dk-frame-bd`, else a hairline), radius `--dk-r`. `bdFitProduct` zooms the frame 1.3 → 1 while nothing is cut, then widens the list column (`data-fit="wide"`), then stacks the two sections (`data-fit="stack"`, down to 0.72). The old `.ab-deck-app / -side / -nav / -screen* / -chip / -dot / -row / -rname / -rpct / -ctacard` classes are gone: delete rules that target them.
- **`def.deck.product(ctx)`** (alias **`productStage`**) -> HTML: a bespoke product scene (poster wall, packaging, showroom, app tiles…) that replaces the slide body, inside `<div class="ab-deck-prod" data-prod="custom">` (flex: 1, full body box, `position: relative`). Size it to the box (it is about 1168×560 at 1280×720) and let `bdScaleToFit` handle the rest.
- **Do and don't (slide 09)**: two columns headed "Do" / "Don’t" in the aesthetic's headline face (`h3.ab-headline.ab-deck-h.ab-deck-ddhead`, `--dk-fs: 104px`, shrunk together by `bdFitDoDont` until both fit; Don’t in `--ab-muted`), three rules each as equal ruled bands. Markers are text, no discs: `.ab-deck-mark`, default the rule number (01–03) in the label face, coloured `--dk-mark-do` (default `--ab-primary-text`) / `--dk-mark-dont` (default `--ab-muted`).
- **`def.deck.marks`**: `{ do: '✓', dont: '✕' }` (strings, set as text, class `is-own`, 22px) or a function `(ctx, kind, i) -> HTML` (`kind` 'do' | 'dont', `i` 0–2).
- **`def.deck.radius`** (number of px, or a CSS length): the deck container radius `--dk-r` (Interface cells, Color bar and chips, Patterns stage, In product frame). Default: **the aesthetic's own card radius**, read from a hidden probe `.ab-sec-ui .ab-card` in the slide (smallest px corner, clamped 0–28px; 12px if none). Never the user's shape preset any more.
- **`def.deck.materialArt(ctx)`** -> HTML: Material-slide art distinct from the board hero art (stage gets `data-stage="own"`). Replaces hiding extra markup in `art()` behind `.ab-slide[data-slide="material"]` rules. `materialStage: 'pattern'` still wins.
- **`def.deck.patternsStage(ctx)`** -> HTML: replaces the Patterns slide body (Bento's tile system, Rebus's own glyph wallpaper). `ctx` adds `entries` (the wall's patterns), `pinned`, `patternImg(entry, w, h)` (data URL), `nameOf(entry)`, `colorwayLabel(value)`. Wrapped in `<div class="ab-deck-patterns" data-stage="custom">`.
- **`def.deck.coverBand: false`** drops the cover's pattern band (no more `!important` hiding against the base `:has()` rule); **`def.deck.closingStrip: false`** drops the closing strip.
- **`def.deck.coverMin`** (px, 16–64): the cover headline's floor (default 64). With a small `coverDisplay` (e.g. `coverDisplay: 0.22, coverMin: 24`) the cover statement can be caption-sized (Dystopian Luxury).
- **Text floor opt-out**: `bdMinText` lifts slide text under 12px with an inline `!important`. Set the inherited custom property `--dk-min-text: off` on an element or component (e.g. `.ab[data-ae="key"].ab-slide .ab-seg { --dk-min-text: off; }`) to keep your own sizes there, or `--dk-min-text: 11` for your own floor. Text at `font-size: 0` (counters drawn by `::before`) is never lifted. The deck gore check still reports text under 12px, so opt out only where the text stays legible.
- Footer: the slide footer's 12px size is now `:where(.ab.ab-slide[data-ae]) .ab-slide-foot .ab-motto / .ab-infl` (0,2,0), so an aesthetic's own foot rules win.

Patterns: fixed colourways `spectrum`, `tonal`, `broadcast`, `primaries`, `earth`, `brass`, `safety` (exact inks in docs/patterns.md, "Fixed colourways"). fit.js entries may use them as the colorway value.

## Round 6 cleanup: the framework contract aesthetics can rely on

**Render state as an argument (no more reading the global `state`).** The framework passes the view state it is rendering (a blend swaps the faces, so it is not always the editor's `state`) as the last argument of the hooks that compute values: `tokens(t, state)`, `canvas(base, state)`, `printPrimary(t, state)`. `art(ctx)`, `headline(ctx, text)`, `states(ctx)`, `panels.*(ctx)` and `deck.*(ctx)` get it as `ctx.state`. Read fonts, weights and copy from there. Hooks that ignore the argument keep working, but a blended render then sizes weights for the wrong font (29 aesthetics did this); migrate by replacing `typeof state !== 'undefined' && state && state.headingFont` with `state.headingFont` (the argument) or `ctx.state.headingFont`. Copy comes from `ctx.brandName` / `ctx.tagline`, not `effectiveContent()`.

**Typography lock.** `ctx.state.headingFont` / `bodyFont` are always the faces actually on the board: the user's own when typography is locked (a blend's type channel never overrides a lock), the aesthetic's or donor's pairing otherwise. `ctx.typographyLocked` is true while `state.locks.typography` is on; a hook that would choose a face of its own must not when it is true.

**Weights: use the shared helpers, never parse `font.weights` by hand.** In `js/aesthetic-board.js`, available wherever it is loaded (the browser, and the node harness, which loads it before any aesthetic runs a hook; call them inside `tokens`/`art`, not at file top level):
- `abWeights(face)` -> ascending numbers, `[400]` when none are listed.
- `abWeight(face, cap)` -> the heaviest published weight at or under `cap`; the lightest when all are above (a single-weight face stays at its one weight).
- `abWeightNear(face, wanted)` -> `wanted` if published, else the next one up within 100, else the next down, else the next up.
`font-synthesis` is off, so a weight the face does not publish would render as a neighbour.

**One safe runner for every hook.** `abRun(def, hook, fn, args, fallback)` (and `abHookHtml` / `abTokens` on top of it) wraps `art`, `headline`, `tokens`, `canvas`, `printPrimary`, `states`, `panels.*`, `deck.*` (including `marks`), and the deck's pattern and stage hooks. A throwing hook falls back (empty art, the default headline, `{}` tokens, the plain canvas, no printed primary, the default slide piece) and `console.warn`s once per aesthetic and hook. `this` is the def. A hook that returns a non-string where HTML is expected counts as empty.

**`ctx.labels` is one shape everywhere**: an array of the three state names that also carries `.material`, `.states` (the same array), `.names` and `.statesKind`. `ctx.labels[i]`, `ctx.labels.map(...)`, `ctx.labels.material` and `ctx.labels.states[i]` all work in `states`, `panels`, `art`, `headline` and every `deck.*` hook. (Before, `states()` got the array and `panels` / `deck.*` got the object; the two aesthetics that read it, cybersigilism and xerox, use the array form and are unchanged.)

**Escaping.** `escapeHtml` is null-safe (`null` / `undefined` give `''`). Use it, or `ctx.e`, instead of a private escape helper. The board escapes the logo URL itself.

**Shared helpers for blends and probes** (`js/aesthetic-board.js`): `abRootAttrs(def, t, state, over)` writes the root's data attributes once (the board, a blend's donor scope and the blend probe all use it), `abStyle(vars)` the inline style, `abResolveMaterial(css, t, extras, onMissing)` the `{placeholder}` resolver (the brief keeps unresolved names visible, a blend sample paints `transparent`), `abView(state = state)` the view (base, or the blend). `blendDonorTokens(donor, t, state)` takes the state too.

**The brief reports what the board draws.** The Typography section's heading and body lines, and the Shape line, come from an off-screen probe board when a DOM exists (`aibProbeBoard`: headline size at a 900px board, weight, case, tracking, and the card, button, field and swatch radii as rendered). Without a DOM the brief names only the editor's baseline settings and omits radii. Inline `data:` URIs in token and material dumps are replaced by `url(<inline SVG, copy it from css/aesthetics/<key>.css ...>)`.

**Board header.** On the board a long brand name wraps (two lines, or breaks inside a long word) and the "Design language / ..." tag drops below it when the row is full; there is no ellipsis and no overlap. Deck slides keep one line (`bdFitBrandName` shrinks it). An aesthetic that fixes its header's height (Mesh Gradient's `--mg-head`) should use `min-height`.

**Blends.** `blendLegibility(root)` (js/blend.js, after layout) adds a canvas plate behind the headline where the base lays it over the donor's art (`data-bl-scrim`, `--bl-scrim`), and gives the highlight word the headline's own colour (or ink, black, white) when the donor's highlight would be under 3:1 on the ground it really sits on. `BL_HERO_RATIO` includes `bleed`.

**Patterns.** `Patterns.finalInks` enforces a contrast floor: the stronger of ink1 / ink2 reaches 1.6:1 against the ground (all non-ground inks move toward black or white together, in 5% steps), so a suite tile never goes blank on a pastel or very dark palette. Palettes that already clear it are untouched; fixed colourways, `tonal` (floor 1.12) and a Strength under 0.5 (floor scales down) are exempt or softened. The cover band and closing strip layer above an aesthetic's `z-index: 0` wallpaper pseudo-element on the slide root.

**Export.** See `docs/brand-deck.md` "Export sanitizer": inset and `0 0 0 Npx` rings export correctly (the export host is on screen, invisible), and any calc() in background-size / -position is resolved for html2canvas, so aesthetics need no workaround for them.

**Focus.** `.ab[data-ae] .ab-input:focus-visible` has a default 2px ink ring (the board's `.ab .ab-input { outline: none }` reset removed the browser's, and nine aesthetics had no focus indicator at all). An aesthetic that styles focus itself with its own `:focus` / `:focus-visible` rule still wins. Check: focus the board's field in every aesthetic and confirm an outline or a changed border / shadow.

**Weights in the brief and the CSS block.** `brandCssText` (the "CSS variables" block in the brief and Copy CSS) and the brief's Typography lines print `abWeightNear(face, weight)`, never the editor's raw 700: a single-weight face (Anton, Tilt Warp, VT323) is given its one real weight.

**Pattern `night` colourway.** The ground is always the darker of canvas and ink (on a dark canvas that is the canvas itself); the primary / secondary / accent are lifted to contrast with it. It used to paint the light ink as the ground on dark canvases.

**Export (PNG / PDF).** Before html2canvas clones a slide, `bdPrepareExportClone` (js/brand-deck.js) makes inline svg self-contained (filters, masks and gradients the art takes from another svg in the page are copied into its own `<defs>`; attributes broken by unescaped quotes are dropped; `var()` in attributes is resolved) and bakes into bitmaps the things html2canvas cannot draw: a background of four or more gradient layers, a `cover` / `contain` picture background, and `object-fit` on an `<img>`. See docs/brand-deck.md "Export sanitizer".
