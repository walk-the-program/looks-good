# Branding Designer

A local, no-build-step tool for rapidly auditioning brand combinations —
fonts and color palettes, set in an aesthetic that draws its own corners, borders and shadows — with live heuristic
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

This compiles the Swift wrapper as one universal binary (Apple silicon and
Intel, macOS 13 or later), generates the icon, copies `index.html`, `css/`,
`js/`, `fonts/` and `vendor/` into the bundle, ad-hoc signs it, and installs
**Branding Designer.app** to `/Applications` (or `~/Applications` if that
isn't writable). Re-run it after any web change; it quits the installed copy
first. Your session autosave and window size and position persist between
launches. The browser version (`python3 -m http.server`) is unchanged.

**Works offline.** Every Google Font the app uses is bundled in `fonts/`
(118 families, latin subset, about 4 MB) and html2canvas and jsPDF are in
`vendor/`. The page loads these local copies first; Google Fonts and the CDN
are only a fallback for anything missing. After adding a font to `FONTS` in
`js/data.js`, refresh the copies and the credits:

```bash
python3 dev/vendor-fonts.py          # fetches from fonts.googleapis.com / fonts.gstatic.com
swift dev/font-credits.swift         # rewrites fonts/CREDITS.txt (shown in About)
python3 dev/vendor-fonts.py --check  # exit 1 if a FONTS family has no local copy
```

**Exports in the app** (slide PNGs, Download all, Download PDF) are painted
by WebKit itself through a native bridge (`capture` in `mac/main.swift`), so
they match the screen, glass, blend modes and filters included, and take
about a quarter of a second per slide. In a browser, html2canvas is used.

**Showcase mode** (the switch in the library header, or View > Showcase Mode,
Shift-Cmd-D) offers only the 20 favourite aesthetics and hides the owner
tools (Classic/Current, the recommendations panel); locks, type fine-tuning
and pattern settings fold under **Refine** in the sidebar.

### Signing and notarizing (needs a paid Apple Developer account)

The build is ad-hoc signed, so on another Mac Gatekeeper warns the first time
(right-click > Open, or System Settings > Privacy & Security > Open Anyway).
With a Developer ID, sign and notarize the installed app like this, replacing
`TEAMID` and the Apple ID details:

```bash
APP="/Applications/Branding Designer.app"
# 1. Sign with the Developer ID certificate and the hardened runtime.
codesign --force --deep --options runtime --timestamp \
  --sign "Developer ID Application: Your Name (TEAMID)" "$APP"
codesign --verify --deep --strict --verbose=2 "$APP"
# 2. Zip, submit to Apple's notary service and wait for the result.
#    (Once: xcrun notarytool store-credentials bd-notary --apple-id you@example.com \
#            --team-id TEAMID --password <app-specific password>)
ditto -c -k --keepParent "$APP" "Branding Designer.zip"
xcrun notarytool submit "Branding Designer.zip" --keychain-profile bd-notary --wait
# 3. Staple the ticket so the app opens without a network check, then re-zip to share.
xcrun stapler staple "$APP"
spctl --assess --type execute --verbose "$APP"     # should say: source=Notarized Developer ID
ditto -c -k --keepParent "$APP" "Branding Designer.zip"
```

The app needs no entitlements beyond the hardened runtime (WKWebView,
file panels and the clipboard work under it).

## Brand library

The app opens on a **Library**: a grid of tiles, one per saved brand, most
recently edited first. Each tile is a live rendering of the brand (primary
field, logo or "Aa", name in its heading font, a palette band, corners from
its style). **New brand** asks for a name and tagline, then opens the
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
**Aesthetic** panel picks one of 41 aesthetics, narrowed by family chips (Tactile, Graphic,
Digital, Print & editorial, Luminous; the choice is remembered, and Shuffle and
Compare work within it), lockable, with Shuffle aesthetic; choosing one also takes its recommended Light/Dark mode. **Compare all** shows all 41 boards at once
in the current brand (built only while that view is open; off-screen tiles skip layout with `content-visibility`); click a tile to select it. The choice is saved with the
brand and is one Undo step. Compare tiles use each aesthetic's recommended
mode (what selecting it gives you); the main board stays in the brand's current
mode. Files: `js/aesthetic-board.js`,
`css/aesthetic-board.css`, `js/aesthetics/<key>.js` and
`css/aesthetics/<key>.css` (see `docs/aesthetics-plan.md`).

**Blend with.** Under the aesthetic list, **Blend with** mixes a second aesthetic (the
donor) into the one you chose (the base). The base keeps structure, layout, mode
and every accessibility rule; the donor supplies up to five channels: art, type,
color, patterns and material. Subtle, Balanced and Bold are presets; the channel
chips make any combination. The board, the deck, the pattern suite and the AI
brief all follow the blend, and it is saved with the brand and carried by Undo.
Nothing is hand-tuned per pair: any two aesthetics work. Blend, deck and
patterns all render through one entry point, `aestheticView(state)`
(`js/blend.js`); details in `docs/blend.md`. A kill switch (`BLEND_ENABLED` in
`js/blend.js`) turns the feature off without touching saved brands.

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

## Patterns mode (Ptrn tools)

The **Brands | Patterns** switch at the top of the opening screen toggles between your brand library and a browsable grid of 105 pattern tools: 52 mirrored Ptrn tools and 53 of my own pattern families. Open one to use it full-window inside Branding Designer's own top bar (`Esc` goes back, `[` and `]` step through the list). The last mode and the open tool are remembered, and `css/ptrn-theme.css` restyles the tools in Branding Designer's look.

The tools live in `ptrn/`, which is **git-ignored on purpose**: it is a private mirror of `~/Desktop/Ptrn/site`, and the mirrored tools are not for publishing. Only the integration code is committed. To create or refresh the mirror:

```
python3 dev/sync-ptrn.py            # or: --source /path/to/Ptrn/site
```

It copies the site, rewrites asset paths to `/ptrn/...`, turns off the "framed means embed" auto-detect so tools show their full controls, and writes `ptrn/catalog.json`. Without `ptrn/`, Patterns mode shows a "not installed yet" message. `mac/build.sh` bundles `ptrn/` when it exists.

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

Under Typography and Color palette the editor can show one quiet
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
  triadic / custom) with editable swatches. Corners, borders and shadows
  come from the chosen aesthetic. Most shuffles draw from a list of hand-picked
  heading/body pairings so results stay usable; **Swap** flips the two
  faces, and a live specimen under the pickers shows what the current pair
  actually looks like. "Shuffle everything" (or hit **space**) rerolls
  anything not locked; per-section lock toggles and shuffle buttons let
  you pin down the parts you like while rerolling the rest. **Undo** steps
  back one combo at a time, and your whole session (fonts, colors,
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
js/data.js               font list, curated pairings,
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
js/aesthetic-board.js    design language board, Compare all, Aesthetic panel, family filter,
                         the safe hook runner and the font-weight helpers aesthetics share
js/blend.js              blend two aesthetics (aestheticView, channels, merged rules); css/blend.css
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

html2canvas and jsPDF load from `vendor/` and every font from `fonts/`
(`fonts/fonts.css`), with the CDN and Google Fonts only as a fallback — no
bundler, no npm install.

No framework, no bundler — open `index.html` through a static server and
edit the files directly.

## Tests

`node tests/run.js` checks saving/loading a brand (including old or hand-edited files), the "Paste brand colors" reader, pattern colourways and the pattern contrast floor, the board layout contract, hook fallbacks (a throwing aesthetic hook falls back and warns once), the weight helpers, blend rules and pattern suites for every base and donor pair, the font names in `js/aesthetic-meta.js`, that Undo carries the blend, and the AI brief: Locked / Guided / Free section tags, the Why this works section, and the brief lint (contrast, rules against recipes, undefined tokens, flat gradients). No dependencies. Checks that need a real DOM (render timing, deck fitting, exports) are run in a browser against `dev/deck-gore.js`, the deck overlap checker (load it after `js/brand-deck.js` in a test page).

## Rolling back round 6

Round 6 (the blend engine, 48 aesthetics, fixed pattern colourways, the deck framework) is tagged phase by phase in git. `docs/round6/ROLLBACK.md` lists every tag, how to return to one, how to restore a single aesthetic, and how to switch the blend feature off without git.
