# Branding Designer

A local, no-build-step tool for rapidly auditioning brand combinations —
fonts, color palettes, and shape/style language — with live heuristic
design feedback and a ten-slide brand deck rendered in the selected aesthetic. The
app chrome is a light warm-grey workspace so the only colors on screen
are the brand's own.

## Run it

No dependencies, no build step. From this folder, start any static file
server, for example:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

or, if you have Node:

```bash
npx serve .
```

Requires an internet connection on first load (it pulls the type family
set from Google Fonts, plus html2canvas/jsPDF for PNG/PDF export, from
CDNs); everything else runs entirely client-side — no backend, no
analytics, no data leaves your machine.

## Mac app

A native macOS build (AppKit + WKWebView, no Electron) lives in `mac/`.
To build and install it:

```bash
./mac/build.sh
```

This compiles the Swift wrapper, generates the icon, copies the current
`index.html`, `css/` and `js/` into the bundle, vendors html2canvas and
jsPDF (from `mac/vendor/`) so PNG/PDF export works offline, ad-hoc signs
it, and installs **Branding Designer.app** to `/Applications` (or
`~/Applications` if that isn't writable). Re-run it after any web change;
it quits a running copy first. Your session autosave persists between
launches. The browser version (`python3 -m http.server`) is unchanged.

## Brand library

The app opens on a **Library**: a grid of tiles, one per saved brand, most
recently edited first. Each tile is a live rendering of the brand (primary
field, logo or "Aa", name in its heading font, a palette band, corners from
its shape preset). **New brand** asks for a name and tagline, then opens the
editor on a fresh random combination. The tile's "..." menu (or right-click)
has Open, Rename, Duplicate and Delete.

In the editor, shuffling and editing never change the saved brand until you
press **Save** (Cmd+S). The sidebar header shows the brand name with
"Saved" or "Unsaved changes", plus **Revert**, **Save as new brand** and a
"Library" back link that asks Save / Don't save / Cancel when there are edits.
A separate working draft is autosaved, so quitting with unsaved edits and
reopening the brand restores them, still marked unsaved, with a Revert link.
Undo history is per session.

Storage goes through `js/library-store.js`: one JSON file per brand in
`~/Library/Application Support/Branding Designer/brands/<id>.json` in the Mac
app, IndexedDB in a browser. The old single-session autosave is imported once
as a brand. The Mac app has a File menu (New Brand, Save, Save as New Brand,
Revert to Saved, Back to Library).

## Design language board and aesthetics

The old "Live preview" card is now a **Design language board** modeled on a
design-language study sheet: wordmark and "Design language / <aesthetic>"
header, hero (kicker, your tagline with the last word in the accent color,
signature art), a palette row that names each color's job and coverage,
`01 / Interface`, `02 / <material>` and `03 / In use` sections, and a footer.
It renders in the brand's own fonts, colors, name and logo. The sidebar's
**Aesthetic** panel picks one of twenty aesthetics, narrowed by family chips (Tactile, Graphic,
Digital, Print & editorial, Luminous; the choice is remembered, and Shuffle and
Compare work within it), lockable, with Shuffle aesthetic; choosing one also takes its recommended Light/Dark mode and, unless
Shape is locked, its slide shape. **Compare all** shows the boards at once
in the current brand (built only while that view is open); click a tile to select it. The choice is saved with the
brand and is one Undo step. Compare tiles use each aesthetic's recommended
mode (what selecting it gives you); the main board stays in the brand's current
mode. Files: `js/aesthetic-board.js`,
`css/aesthetic-board.css`, `js/aesthetics/<key>.js` and
`css/aesthetics/<key>.css` (see `docs/aesthetics-plan.md`).

The second refinement round gave each aesthetic its own layout, interface
typeface and headline-highlight treatment, calibrated against real references
(for example near-white paper cards on Neo-Brutal Pop's colored grid, and a
compact translucent hero card over Liquid Glass's scene). **Copy AI brief**
reads those same declarations, so its component map and highlight wording match
what the board shows.

**Font recommendations.** Every aesthetic recommends type: font classes for
headings and body (and mono where it matters), three picks rendered in their own
faces, what to avoid, a one-line reason, and a fit check of the brand's current
fonts (fits / consider / avoid). It appears as a **Type** section on the board,
as a line in the Typography panel, and as a "Recommended type" subsection of the
AI brief. **Use recommended fonts** applies the aesthetic's first pairing (one
Undo step; blocked by the Typography lock). Every font in `js/data.js` carries a
class (`cls`, see `FONT_CLASSES`); the recommendations and families live in
`js/aesthetic-meta.js`, keyed by aesthetic key. Sixteen Google Fonts were added
for this (Inter Tight, Bricolage Grotesque, Fredoka, Baloo 2, Michroma, Orbitron,
Chakra Petch, Rajdhani, Poiret One, Limelight, Shrikhand, Bagel Fat One, Press
Start 2P, Silkscreen, Pixelify Sans, VT323).

## Patterns

A third workspace view, **Patterns** (next to Board and Compare all), is a
generative pattern studio driven by the same brand colors. Fifty-three original
generators in eight categories (Halftone & print, Stripes & op-art, Pixel &
grid, Organic & cellular, Glitch & signal, Collage & poster, Botanical & line,
Soft color) paint a large live canvas; the **All families** picker has category
chips with counts and a search box (name, look or category). Thumbnails draw as
they scroll into view. paint a large live canvas. Patterns never invent colors:
ground is the canvas, ink 1 the primary, ink 2 the secondary, and the accent
is a spark under 5% of the area. **Colorway** switches between Brand, Mono,
Duotone and Night, **+ tints** adds lighter mixes, and every family's own
controls are built from its schema. Seed plus parameters reproduce the same
pixels; **New variation** reseeds. The **Brand suite** is six patterns tuned
to the current aesthetic (click to load). **Add to brief** (on the canvas, and
the + on every suite and family thumbnail) works like a shopping cart: the
**Brief · N** button in the workspace header (and the "Includes N patterns" line
under **Copy AI brief**) opens a tray listing what you added, with a **Use** for
each (hero background, section band, card texture, divider strip or accent
detail), an **Include SVG** toggle for vector families, a per-pattern **Copy**,
**Copy full AI brief** and **Copy patterns only**. Patterns in the brief are
saved with the brand, are one Undo step, and show up in the **Patterns** deck
slide (slide 7), as the strip on the cover and closing slides, and in the AI
brief with their exact colors, settings, placement rules and an SVG tile or
snippet. Export PNG at 1x, 2x or 4K, SVG for the vector
families, or **Copy CSS tile** (a seamless 128px background) for the
families that tile. Files: `js/patterns/` (engine, families, aesthetic fit),
`js/patterns-ui.js`, `js/pattern-cart.js`, `js/patterns-deck.js`, `css/patterns.css`; spec in
`docs/patterns.md`. `dev/patterns-lab.html` is a developer test bench only and
is not part of the app or the Mac build's runtime.

## Color roles, picker and paste import

Every color has one job, a "never" rule and a coverage target (canvas, ink,
primary, secondary, accent; an aesthetic may tighten them). They show on the
board's palette row and in the picker. The **Color palette** panel has an
inline picker (no OS color panel): role chips, an always-visible hue/saturation
wheel, a brightness slider and a hex field. **Paste brand colors** takes any
text from a brand guide: hexes and rgb() values are found, labeled lines such
as "Primary: #..." or "Background ..." are honored, the rest are auto-assigned,
and you review and apply the result as one Undo step. Files:
`js/color-roles.js`, `js/color-picker.js`, `js/color-import.js`,
`css/color-picker.css`.

## Copy AI brief

**Copy AI brief** (sidebar, above "Copy brand as CSS") puts a Markdown brief on
the clipboard to paste into an AI coding tool, so it stops using the secondary
color "for whatever it wants". It lists every color token with its exact hex
(including derived canvas, ink, muted, line, on-* and tints), each role's use /
never / coverage, hard rules (one primary action per view, accent at 5% or
less, text only in ink, muted or on-* tokens), a component-by-component color
map, contrast ratios, fonts with a Google Fonts URL, the aesthetic's material
recipes with real values, a Patterns section (ink mapping, the six families that fit the aesthetic,
each pattern added to the brief with its use, exact inks, settings and SVG), do / don't lists and a CSS variables block. It
describes the current brand in its current mode and aesthetic. File:
`js/ai-brief.js` (`buildAiBrief(state)`, no DOM access).

## Suggestions

Under Typography, Color palette and Shape the editor can show one quiet
suggestion line (`js/suggest.js` is a pure engine, `js/suggest-ui.js` the
display). Apply previews on hover, goes through the normal state path (so Undo
works and the brand becomes unsaved), the refresh arrow shows the next one and
x dismisses it for that brand. Locked sections get none.

## What it does

- **Brand copy in one place** — the sidebar's **Brand** panel holds the
  brand name and tagline, plus a collapsed **Slide copy** subpanel for the
  section title, quote and quote author. Everything downstream — the live
  preview, the brand deck and the brand guide — renders from those
  fields, and blank fields fall back to a sensible default rather than
  rendering an empty line.
- **Combination engine** — pick heading/body fonts from 85+ Google Fonts
  grouped by category (serif, sans, display, slab, mono), a color scheme
  (monochromatic / analogous / complementary / split-complementary /
  triadic / custom) with editable swatches, and a shape/style preset
  (Minimal & Sharp, Modern & Refined, Soft & Friendly, Corporate Classic,
  Bold & Geometric). Most shuffles draw from a list of hand-picked
  heading/body pairings so results stay usable; **Swap** flips the two
  faces, and a live specimen under the pickers shows what the current pair
  actually looks like. "Shuffle everything" (or hit **space**) rerolls
  anything not locked; per-section lock toggles and shuffle buttons let
  you pin down the parts you like while rerolling the rest. **Undo** steps
  back one combo at a time, and your whole session (fonts, colors, shape,
  typography, text, logo) autosaves to `localStorage` and restores itself
  next time you open the page — **Start fresh** clears it.
- **Typography fine-tuning** — independent size, weight, and letter-spacing
  sliders for heading and body, plus a text-case control (Normal /
  UPPERCASE / lowercase / Capitalize Each Word) for each. These live-update
  the preview card only; the brand deck shows the type scale they imply.
- **Design language recommendations** — a rule-based list that checks
  WCAG contrast (body text, primary button, accent) against real
  thresholds, flags risky/strong font pairings by category (serif,
  sans, display, mono), and reads the palette's hue/saturation/lightness
  relationships to call out clashing, flat, or well-separated color
  choices.
- **Brand deck** — ten 16:9 brand-guideline slides rendered *inside* the
  selected aesthetic, so the slides and the board always agree: cover,
  principles, color system (roles, proportion bar, contrast pairs),
  typography (face specimens, type scale, the recommended faces and how the
  current ones fit), interface (segmented control, CTA, field, toggle and
  the three states), material and graphics (the signature art plus the
  aesthetic's material names), patterns (the patterns in the brief, or the aesthetic's
  suite), in product (a composed app screen), do and
  don't, and a closing slide. Each slide is its own `.ab[data-ae]` root at a
  fixed 1280x720, so every aesthetic's CSS applies unchanged; the cards
  shrink them with CSS `zoom`. The brand name, tagline, logo, fonts and
  palette all come from the current brand. The deck is built lazily (when
  the section is near the viewport, in idle time), so it never slows
  aesthetic switching. Each slide has a **Download PNG** button (rasterized
  at 2x from an off-screen 1280x720 clone via html2canvas); **Download all**
  saves the PNGs one at a time and **Download PDF** writes a 1280x720
  landscape PDF, one image per slide (jsPDF). html2canvas cannot reproduce
  `backdrop-filter`, conic gradients or some blend modes, so an aesthetic
  that leans on them exports flatter than it looks on screen.
- **Quick brand guide deck** — "Open brand guide" assembles a 6-page deck
  (cover, color palette with hex + contrast notes, color roles with use /
  never / coverage and key contrast pairs, type specimen, logo & style,
  voice/quote) from your current picks, viewable in a modal and
  exportable as a standalone **HTML** file or straight to a downloaded
  **PDF** (via html2canvas + jsPDF — no browser print dialog involved).
- **Export** — "Copy brand as CSS variables" puts a ready-to-paste
  `:root { --primary: ...; }` block (now including the typography
  fine-tuning vars) on your clipboard; "Copy AI brief" copies the full
  Markdown brand brief described above.

## Project structure

```
index.html
css/styles.css           app chrome — the light workspace, the sidebar's
                         collapsible sections, and the live "preview-scope"
                         theme surface
css/patterns.css         Patterns view and pattern deck styles
css/brand-deck.css       the brand deck: slide cards + neutral slide styles
                         (`.ab-slide`, `.ab-deck-*`)
js/data.js               font list, curated pairings, shape presets,
                         color-scheme recipes
js/color.js              HSL/hex conversion, WCAG contrast math, palette generation
js/rules.js              the recommendation/heuristics engine
js/brand-deck.js         the ten-slide brand deck (DECK_SLIDES), fit pass, PNG/PDF export,
                         plus the shared slMix/slVisible/slFit/slRadius helpers
js/persistence.js        session autosave/restore via localStorage
js/undo-history.js       bounded undo stack for shuffle actions
js/library-store.js      brand storage: native files or IndexedDB
js/library-ui.js         Library screen, tiles, in-page dialogs
js/brand-session.js      open brand, save/revert/draft, editor save state
js/suggest.js            suggestion engine (pure functions)
js/suggest-ui.js         inline suggestion lines
js/font-picker.js        visual font picker (replaces the selects' look, keeps them as state)
js/aesthetics/           registry + one file per aesthetic (styles in css/aesthetics/)
js/aesthetic-board.js    design language board, Compare all, Aesthetic panel, family filter
js/aesthetic-meta.js     per-aesthetic family and font recommendations
js/color-roles.js        the five color roles (use / never / coverage)
js/color-picker.js       inline HSV picker; js/color-import.js parses pasted colors
js/patterns/             pattern engine, 53 families in 8 categories, aesthetic fit (suites)
js/patterns-ui.js        Patterns workspace view and the brief-cart storage (PatternPins)
js/pattern-cart.js       Brief tray (header button, sidebar line)
js/patterns-deck.js      Patterns deck slide and cover/closing strips
js/ai-brief.js           Markdown AI brief (buildAiBrief)
js/brand-guide.js        brand guide deck content + styles
js/export-html.js        standalone HTML export of the brand guide
js/export-pdf.js         PDF export via html2canvas + jsPDF (real file, no print dialog)
js/app.js                state, rendering, event wiring
js/brand-guide-ui.js     brand guide modal open/close/export wiring
```

html2canvas and jsPDF are loaded via CDN `<script>` tags in `index.html`
(same pattern as the Google Fonts `<link>`) — no bundler, no npm install.

No framework, no bundler — open `index.html` through a static server and
edit the files directly.

## Tests

`node tests/run.js` checks saving/loading a brand (including old or hand-edited files) and the "Paste brand colors" reader. No dependencies. The deck overlap checker lives in `dev/deck-gore.js` (load it after `js/brand-deck.js` in a test page).
