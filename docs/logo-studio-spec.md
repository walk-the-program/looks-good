# Logo Studio — spec

Status: draft, 2026-10-20. Owner: Walker.

## How the Nominal logo was actually made

This spec comes out of making the Nominal Studios logo by hand. That took about a dozen rounds, and the drawing was the easy part. The hard parts were:

1. **Placing the crop line exactly.** Browsers position type by line box, not by cap height. Hiding "the bottom 15% of the caps" meant working out Instrument Serif's metrics (720 cap height, 990/310 ascent and descent) and turning them into a crop line in em units.
2. **A legibility trade-off nobody would predict.** A deep crop hides the L's foot, so NOMINAL reads as NOMINAI. I tried a shallow crop, then a crop that changes with size. Walker preferred the deep crop anyway. The tool has to warn about this, not silently fix it.
3. **The mockup and the export disagreed.** CSS letter-spacing adds space after the last letter too, so the browser's word box came out 0.12em narrower than the real glyph run. That trimmed the L's foot. The export had to be built from shaped glyphs, not from the HTML box.
4. **Outlines needed a toolchain the Mac doesn't have.** Getting font-independent SVGs took fontTools, brotli and HarfBuzz in a temporary Python environment, plus a Swift script using macOS's SVG renderer for the PNGs. The finished generator is `docs/mockups/nominal-logo/build_logo.py`.
5. **Size testing caught real problems.** At 26–40px the strip and the L merged. The N monogram needed centring on its outline rather than its advance width.

Lesson for the product: a useful logo tool is not a blank canvas. It is a small set of typographic decisions (face, tracking, device, secondary line, alignment), plus the checks I ran by hand: size tests, letters that stop reading, and export fidelity.

## Problem statement

Branding Designer builds a full brand (palette, type, style, deck and AI brief) from a name, but the logo has to come from somewhere else. Owners without a logo get a brand with an empty slot, or they leave the app to make one by hand. That took a skilled designer plus an AI about a dozen iterations for Nominal. The brief and deck are only as good as the mark they carry, so a missing logo weakens every export.

## Goals

1. An owner with no logo gets a usable wordmark lockup, in the brand's own fonts and colours, in under 5 minutes from opening the editor.
2. The exported SVG matches the on-screen preview to within 0.5% of its width. That's the bug that bit the Nominal export.
3. Every export includes a working small-size version and a monogram, so favicon, app icon and avatar are covered without extra work.
4. The logo flows into the board, deck, brief and the brief's .zip with no manual re-upload.
5. The tool flags legibility failures (letters that disappear at small sizes, merged shapes) before export.

## Non-goals

- **A freeform Canva-style canvas** (free shapes, layers, rotation, image placement). That's the large build and the wrong product. The app's strength is opinionated, rule-driven output, and a blank canvas throws that away. See phase 3.
- **Illustrated or pictorial marks** (icons, symbols, mascots). That needs drawing tools or image generation. Image generation means a paid model API, which is out of bounds.
- **Font upload.** v1 uses the app's local font library, which keeps exports offline and licence-clean.
- **Trademark search or uniqueness checks.** That's a legal service, not a design tool.
- **Animation or motion logos.** Not needed for the brief or deck.

## User stories

**Owner without a logo**
- As a new owner, I want the app to propose a few wordmarks for my brand name in my brand's fonts and style, so I start from good options instead of a blank page.
- As an owner, I want to adjust tracking, case, weight and a secondary line (like "Studios"), so the mark feels like mine without my needing design skills.
- As an owner, I want a style's signature device (the Dystopian Luxury crop strip, a Riso offset, a Swiss rule) offered as a logo treatment, so the mark matches the board it lives on.
- As an owner, I want to see my logo at 16, 32, 64 and 200px side by side, so I know it holds up before I commit.
- As an owner, I want a warning when a letter stops reading, with a suggested fix, so I don't ship "NOMINAI" by accident.
- As an owner, I want one Export button that gives me SVG and PNG, light and dark, the full logo, the wordmark and the monogram, so I'm done in one step.

**Owner with a logo**
- As an owner who already uploads a logo, I want my upload to keep working exactly as today, so the new tool never gets in my way.

**AI agent reading the brief**
- As a coding agent, I want the brief to list the logo files, the clear space and the minimum size for each version, so I place the mark correctly without guessing.

**Edge cases**
- Long names (more than 14 characters) get a two-line or reduced-tracking proposal instead of a lockup that overflows.
- Names with non-Latin characters fall back to a face that has the glyphs, and the tool says which face it switched to.
- A name with a missing glyph never exports with tofu boxes (□).

## Requirements

### P0 — must have

**1. Lockup presets from brand state.** Three to six proposals are generated from the brand name, heading and body fonts, colours and active style. Each one is a recipe (face, case, tracking, device, secondary line, alignment), not a picture.
- [ ] Changing the brand's fonts or colours regenerates the proposals live.
- [ ] Every active style contributes at least one preset. Signature-device presets come from the style's `signature` field.

**2. Parameter panel.** Controls for case, tracking (−0.10 to +0.30em), weight where the face allows it, the secondary line (text, face, tracking, spread or set, alignment left/centre/right), the device (none, strip, rule, box) and the crop depth for strip devices.
- [ ] Every control updates the preview within one frame.
- [ ] Settings save with the brand (state.content.logo) and go through undo like other brand edits.

**3. Shaped-glyph engine.** Layout uses real glyph advances and kerning (the same shaping the browser does), not CSS boxes. The preview and the export come from the same geometry.
- [ ] Exported SVG width matches the preview to within 0.5%.
- [ ] Trailing letter-spacing is never included in the word width.

**4. Outlined SVG export, offline.** Text is converted to paths in the app, with no network and no installs. PNGs are rendered at 2400px wide (full logo and wordmark) and at 1024/180/32px (monogram).
- [ ] The exported SVG opens identically in Safari, Figma and Illustrator with the fonts not installed.
- [ ] The export works with the network off.

**5. Size test strip and legibility check.** The preview shows 16, 32, 64 and 200px versions. A check flags hidden distinguishing features: a crop that hides a letter's foot (L, E, Z), a stroke under 1 device pixel, letters whose outlines merge.
- [ ] On a Nominal-like deep crop, the check names the L and offers "lift the crop for small sizes".
- [ ] Warnings never block export.

**6. Monogram.** The first letter (or two letters) uses the same device, centred on its outline, in a square tile, light and dark.
- [ ] Centring uses outline bounds, not advance width.

**7. Integration.** The created logo becomes the brand's logo everywhere an uploaded one appears: board, deck, Present, share, brand guide, and the brief and its .zip. The brief gains a Logo section listing the files, minimum sizes and clear space.
- [ ] Uploading an image still overrides the generated logo, and removing the upload brings the generated one back.

### P1 — nice to have

- **Variant compare.** Pin two or three recipes side by side, like the A/A-set comparison used for Nominal.
- **Clear-space and minimum-size spec**, drawn and exported as a one-page PDF.
- **Mockup scenes:** business card, site header, app icon on a home screen and an avatar, reusing the scenes from `docs/mockups/nominal-logo.html`.
- **Per-character nudges** for manual kerning on one pair, such as the overlapping MI and IN in Nominal.

### P2 — future, design for it now

- **Simple marks:** geometric primitives (circle, square, bar) placed by rule relative to the wordmark. This is the first step toward Canva-like editing, kept on a grid.
- **Font upload**, with licence acknowledgement.
- **Freeform canvas (phase 3).** Only if real demand appears. The recipe model should stay serialisable so a later editor can open any recipe as editable layers.

## Success metrics

- **Leading (first 2 weeks):**
  - At least 60% of new brands without an uploaded logo export a generated one.
  - The median time from opening the editor to the first export is under 5 minutes.
- **Quality:**
  - Zero exports with a preview/export width mismatch over 0.5% (automated test).
  - Zero exports with missing glyphs.
- **Lagging (1–2 months):**
  - Fewer than 20% of brands that exported a generated logo later replace it with an upload.

## Open questions

- **Engineering, blocking:** how the app gets glyph outlines from local woff2 files offline. One option is to vendor opentype.js plus a woff2 decoder (wasm). The other is to ship TTF copies of the logo-eligible faces. That's a size trade-off.
- **Engineering, blocking:** whether shaping (kerning) can be done in the app without HarfBuzz. opentype.js covers pair kerning but not every GPOS feature. HarfBuzz compiled to wasm (harfbuzzjs) is exact but heavier.
- **Engineering:** PNG export inside the Mac app. Rendering the SVG to a canvas inside the WebView should work and avoids the Swift step used for Nominal.
- **Design:** which device catalogue ships first. Strip and crop (proven on Nominal), rule, box and offset are the likely set.
- **Design:** whether the logo editor is a new sidebar tab or replaces the current "Logo & background" section.

## Size and phasing

- **Phase 1 (the spec above):** a wordmark lockup builder. It's medium-to-large: a new shaping and outline engine, an editor panel, export, and wiring into existing views. The engine is the risky part; the editor UI is ordinary. It fits a handful of agent build rounds, with the engine built and tested first in isolation against the Nominal geometry, since `build_logo.py` already gives the expected output.
- **Phase 2:** monogram polish, mockup scenes, and the clear-space PDF.
- **Phase 3 (not recommended for now):** a Canva-like freeform canvas. This is the huge build Walker anticipated: object model, selection and transform handles, snapping, layers, multi-select, text editing on canvas, history, and a shape and icon library. It would be several times the size of phases 1 and 2 combined, and it competes with Canva on Canva's own ground.
