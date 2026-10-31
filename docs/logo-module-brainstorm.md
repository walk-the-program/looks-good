# Logos module — brainstorm

Status: brainstorm, 2026-10-20. Supersedes the scope in `logo-studio-spec.md`; the Logo Studio engine and presets already built become parts of this module.

## The shape of it

A third home mode beside **Brands | Patterns**: **Logos**. It works like Patterns:
- **Home:** a grid of logo documents, with search and a "New logo" button.
- **Editor:** opens a logo full screen. It's a canvas editor in the Canva / Figma mould.
- **Brand link:** a logo can be attached to one or more brands. Attaching it puts it on the board, deck, brief and .zip through the `brandLogo()` path that already exists.

**The benchmark isn't all of Canva.** Most of Canva is photos, a template marketplace, video and docs. For logos, the right target is Canva's ease of editing plus Illustrator's clean vector output. That second half is where Canva is actually weak: its logos export with live text, and clean SVG is a paid feature. Ours exports outlined vectors for free, because the engine already does that.

**What Canva can't do is know the brand.** Colours, fonts and style rules come from the brand system and stay linked. Change the brand ink and every logo using it updates. That's the reason to build this instead of telling people to use Canva.

## Everything it needs

### 1. Module shell
- A Logos tab in the home switch (Brands | Patterns | Logos), with the last mode remembered, like Patterns.
- **Logo library:**
  - Thumbnails, name, attached brands and last edited.
  - Search, plus filter by brand.
  - Duplicate, rename and delete with undo.
- **New logo from:**
  - A blank canvas.
  - A brand: pulls in its name, fonts and palette, then offers starting points.
  - A preset: the current Logo Studio recipes (Set, Rule, Box, Strip, Spaced line) open as editable layers.
  - A template.
  - An import: SVG or image, see section 3.
- Attach to brand / detach. A brand's Logo tab shows the attached logo with "Edit in Logos", and keeps the upload option.
- Autosave, plus named versions ("v1 approved") you can restore.

### 2. Canvas and viewport
- **Artboard:**
  - Presets: square 1000, horizontal 3:1, stacked 1:1, app icon 1024, social avatar.
  - Custom size, and fit-to-content for export.
- **Navigation:**
  - Zoom: pinch, ⌘+/−, zoom to fit, zoom to selection, 100%.
  - Pan with space-drag or two fingers.
- **Guides:**
  - Rulers, with guides dragged out of them.
  - An optional grid with a set spacing.
  - Pixel preview at real export size.
- **Backgrounds:** switch the artboard ground between the brand's canvas, ink, white and dark to check contrast. This replaces the size tests' single ground.
- **Overlays:** clear space and minimum size, toggleable.

### 3. Objects
- **Text:** a layer with live editing on the canvas (see section 6).
- **Shapes:**
  - Rectangle with per-corner radius, ellipse, line, polygon (number of sides), star (points and inner radius), arrow.
  - Bars and strips as first-class shapes, since several styles use them.
- **Pen tool:**
  - Bézier paths, with node editing: add and delete points, corner and smooth, and close path.
  - A pencil tool with smoothing.
- **Icons:** a searchable, offline library (Lucide or Phosphor, vendored, MIT/ISC). Each icon comes in as editable vector.
- **Import:** paste or drop an SVG (it becomes editable paths) or a PNG/JPG (it becomes a locked image layer, usable as a tracing reference).
- **Groups,** with nesting.
- **Boolean operations:** union, subtract, intersect, exclude. These are essential for logos: knockouts, monograms in shapes, the Nominal strip crop.
- **Masks and clipping:** clip a group to a shape. That's how the cropped-word look is done generically.
- **Outline text:** turn text into editable glyph paths for per-letter surgery. The engine already makes the outlines.

### 4. Selection and transform
- **Selecting:** click, shift-click, marquee, select-all, select same fill, and selecting into groups (double-click to enter).
- **Handles:** resize (shift keeps proportions, alt resizes from centre), rotate (shift snaps to 15°), and flip horizontal or vertical.
- **Inspector:** numbers for X, Y, W, H and rotation, with the proportion lock. Arithmetic works in fields, so "120+8" is valid.
- **Nudging:** arrows move 1 unit, shift-arrows move 10.
- **Copying:** duplicate with ⌘D or alt-drag. Copy and paste work across logos, and paste in place.
- **Snapping:**
  - To object edges and centres, the artboard, guides and the grid.
  - Smart spacing guides (equal gaps) and pink distance labels, like Figma.

### 5. Arrange and align
- Align left, centre, right, top, middle and bottom, relative to the selection or the artboard.
- Distribute horizontally or vertically, by spacing or by centres, and tidy up into a grid.
- **Layers panel:**
  - Reorder by drag.
  - Rename, lock, hide and collapse groups.
  - It doubles as the accessible keyboard tree for the canvas.
- Bring forward or backward, and to front or back.

### 6. Typography
- **Font picker:**
  - Brand fonts first, then the full local library: 164 files in `fonts/logo-manifest.json`, searchable, with previews in your own text.
  - Fonts outside the logo set are shown but disabled, with the reason.
- **Settings:** weight, italic and variable axes (wght, opsz, wdth where present), size, letter spacing, line height, case, and paragraph alignment.
- **Per-character work:**
  - Kerning: put the cursor between two letters and press ⌥←/→.
  - Baseline shift.
  - A different colour per character.
- **OpenType features:** ligatures, small caps, oldstyle and lining figures, and stylistic sets, wherever the font has them.
- **Text on a path:** circle and arc, for badges and emblems.
- **Linked brand text:** text tied to the brand name, so it follows a rename. That's the word-source logic already built.

### 7. Colour, fills and strokes
- **Brand swatches by role** (ink, primary, secondary, accent, canvas):
  - Linked by default: a brand palette change updates the logo.
  - "Unlink" freezes a hex.
- Custom colours: picker, hex, eyedropper, opacity and recent colours.
- **Strokes:** width; inside, centre or outside; caps; joins; dashes. Outline strokes become fills at export.
- Gradients: linear and radial. Optional, and off in strict styles.
- **Pattern fill** from the Patterns module: a pattern clipped into a shape or into text. This joins the two modules.
- **Colour versions:**
  - Full colour, one-colour ink, reversed (white) and greyscale.
  - Generated automatically, and editable for each version.

### 8. History and safety
- Undo and redo for every operation, including the inspector and layer changes.
- A version timeline: restore, and compare two versions side by side.
- An "approved" lock that stops accidental edits to a shipped logo.

### 9. Starting points and generation
- **Logo types as templates:** wordmark, lettermark/monogram, emblem/badge, combination mark (symbol plus word), and horizontal and stacked lockups.
- **Style templates:** each of the 45 styles contributes a starter that uses its signature device (strip, offset, rule, box, sticker, stamp…).
- **Shuffle:** like the app's "Shuffle everything", it permutes font, tracking, device and layout within the brand's rules and the style's rules. Pin the bits you like and shuffle the rest. This is the app's own idea applied to logos; Canva has no equivalent.
- No paid model API is involved: generation is rules and permutation, like the rest of the app.

### 10. The logo system (where it beats Canva)
- **One master, many outputs:**
  - Primary lockup, horizontal, stacked, wordmark, monogram/favicon, and app icon (square with padding).
  - Each output is a linked arrangement of the master's parts, not a copy.
- **Responsive set:** which version to use at which width, using the minimum sizes measured by the legibility checks.
- **Clear space and minimum size,** shown on the canvas and written into the brief.
- **Legibility checks** (already built for presets, extended to any document): cropped-off feet, strokes under 1 pixel, merged counters, text that's too small, and low contrast against each brand background.
- **Size test strip** at 16, 32, 64 and 200, plus favicon and app-icon previews.

### 11. Export
- SVG: outlined and clean, with optional padding and artboard or tight bounds.
- PNG at any size, with or without a transparent background.
- PDF for print.
- Favicon set (ico, 16, 32, 180) and app icon sets for iOS and Android.
- Social avatar sizes.
- One "Download logo pack" .zip: all versions, plus a one-page usage sheet.
- Attached logos go into the brand's brief .zip automatically. That part already works.

### 12. Mockups
- Business card, site header, app icon on a home screen, social profile, merch (tote, cap, sticker) and signage.
- They use the HTML mockup scenes from `docs/mockups/nominal-logo.html`, rebuilt as reusable scenes.

### 13. Keyboard and interaction
- **Tools:** V select, A direct select, T text, R rectangle, O ellipse, L line, P pen, I eyedropper, H hand.
- **Commands:**
  - ⌘G and ⇧⌘G group and ungroup; ⌘D duplicate; ⌘Z and ⇧⌘Z undo and redo.
  - ⌘C, ⌘V and ⇧⌘V copy, paste and paste in place.
  - ⌘[ and ⌘] reorder; ⌥⌘ and the align keys align.
  - Delete removes the selection.
- Right-click menus, plus the app's command palette with logo commands added.
- Hover tooltips that show the shortcut.
- Touch and trackpad gestures for zoom and pan.

### 14. Foundations (the engineering)
- **Document model:** a JSON scene graph (artboard, layers, groups, text runs, paths, styles, links to brand tokens). Recipes from Logo Studio convert into it.
- **Renderer:** the SVG DOM. Logos are vector, so what you see is the exported file, and the export can't drift from the screen (the bug that bit the first Nominal export).
- **Geometry:**
  - Bézier maths, hit-testing, bounds, snapping.
  - Boolean operations through a vendored library: paper.js, or a smaller path-boolean library. This is the biggest technical risk.
- **Text:** HarfBuzz shaping and outlines (done). On-canvas editing: caret, selection and IME. Text on a path.
- **Storage:** logo documents saved like brands (library store, and the Mac app's file storage), with a size budget per document.
- **Performance:** smooth dragging with a few hundred nodes; outlines cached per glyph.

## My take

- **Keep it vector-only and brand-linked.** Photos, filters and drop shadows are Canva features that make worse logos. Leave them out on purpose.
- **Booleans, masks and outline-to-paths are the features that separate a logo tool from a text tool.** Without them it's a fancier Logo Studio.
- **The risk sits in three places:** the pen and node editing feel, boolean operations, and on-canvas text editing. Everything else is standard.

## Suggested phases

1. **Canvas core:**
   - Module shell and library.
   - Artboard, zoom and pan.
   - Text, shapes, select/transform, align and distribute, layers, undo.
   - Brand swatches and fonts.
   - SVG and PNG export, and attach to brand.
   - Presets open as layers.
2. **Vector power:** pen and node editing, boolean operations, masks, outline text, icons library, SVG import.
3. **Logo system:** master and linked outputs, colour versions, legibility checks on any document, clear space, logo pack export, mockups.
4. **Delight:** shuffle with pins, style templates, text on a path, OpenType features, version compare, pattern fills.

## Decisions (2026-10-20, Walker)

- **Scope:** logos only. Other brand graphics can come later.
- **Pen tool, boolean operations and masks:** phase 2. Phase 1 is the canvas core.
- **Brand link:** linked by default. A logo made from a brand follows that brand's colours and fonts, and each one can be unlinked.
- **Logo Studio:** stays in the brand's Logo tab as the quick path, with an "Open in Logos" button for full editing.
- **Still open:** bundling an open-source icon set (Lucide) and a geometry library (paper.js). These are phase 2 items.

## Questions that were open before building

1. **Logos only, or any brand graphic?** Should the module also make social posts, banners or app-store art? That changes artboards, templates and the name (a "Design" module, not "Logos").
2. **Brand-linked by default?** Should a new logo start attached to the brand you came from, with its colours linked, or start standalone like a pattern?
3. **Are the pen tool and boolean operations in the first release?** They make it a real logo tool, but they're the costliest part.
4. **Vendoring:** is an open-source icon set (Lucide, ISC licence) and a geometry library (paper.js, MIT) acceptable to bundle offline?
5. **What happens to Logo Studio?** The Logo tab panel could become the quick path ("pick a preset") with an "Open in Logos" button, or be removed in favour of the module.
