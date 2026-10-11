# Patterns round 2 — from 18 to 53 families (integrated)

Goal: Branding Designer covers the full breadth of generative pattern techniques, driven by brand
color roles, available in the Patterns view, the brief cart, the AI brief (with Source pointers)
and the deck. Everything is original code written for this project.

**Licensing rule (unchanged):** ~/Desktop/Ptrn is a private mirror of a third party's tools
("do not redistribute; not for publishing, uploading or version control"). Workers must not open,
read, grep or copy anything under ~/Desktop/Ptrn. The technique briefs below are written in our own
words and are the only spec. Names are ours.

## Engine contract (unchanged)
`Patterns.register({key, name, blurb, ink[], vector, seamless, common:{grain}, params[], render})`
per js/patterns/engine.js; common params scale/grain/tints/tone; ink slots ground/ink1/ink2/spark
(+ deep/t1/t2/mute/pool/ramp); determinism (same seed+params+inks+size → identical output); spark
≤ 5% area; tone honored via runFamily; render ≤ 120 ms at 1200×800 (heavy families render at a
lower internal resolution and upscale crisply); new family files must be added to
`Patterns.FAMILY_FILES` / `LOAD_ORDER` in js/patterns/fit.js and to index.html + dev lab + the
harness loaders (t5/harness.js, t5/src-verify.js).

Each family also gets a `category` (new field, used by the picker): one of
`Halftone & print`, `Stripes & op-art`, `Pixel & grid`, `Organic & cellular`, `Glitch & signal`,
`Collage & poster`, `Botanical & line`, `Soft color`. Existing 18 get categories too.

## New families (33) — technique briefs

### Halftone & print
1. **thermal** "Thermal screen" — turbulent fBm field posterised into heat-map bands (ramp across
   all inks), then printed through a ringed/round halftone screen whose dot size follows the band.
2. **cutup** "Cut-up hills" — one soft hilly field (stacked sine/noise ridges) sliced into 3–6
   rectangular pieces; each piece prints the same field with its own screen (dots, lines, stipple)
   and its own ink pair.
3. **sonar** "Coastline" — a landmass cut from noise at a threshold; interior filled with a halftone
   that thins toward the coast; the coast dissolves into two-ink speckle; optional contour lines.
4. **inkstill** "Riso still life" — acid flat cut-out masses (blobby polygons), 1-bit pixel line
   work tracing simple plant/vessel outlines, blocks of dithered noise, registration marks.

### Stripes & op-art
5. **warpcheck** "Warped check" — checkerboard / slash pattern pushed through a smooth displacement
   (wave, taper or bulge) — razor clean, high contrast, works in neon-on-dark colorways.
6. **burst** "Dash burst" — rays of short dashes radiating from a centre, laid in stacked inks with
   bead accents along some rays, slight bend, print grain.
7. **ribbonrise** "Banded counterchange" — even bar field with large concentric colour bands rising
   from a chosen edge that phase-invert the bars where they cross.

### Pixel & grid
8. **bloomgrid** "Mirrored pixel bloom" — soft rings spreading from the centre, quantised into big
   square pixels, mirrored on both axes, with a quiet empty middle for a headline.
9. **kaleidopix** "Pixel kaleidoscope" — collage of zebra stripes, pixel stairs, dot rows, bursts,
   chevrons and checks in one quadrant, folded/mirrored across the sheet, snapped to a coarse grid.
10. **pixelgrid** "Pixel grid art" — seeded pixel compositions on a grid with modes (blocks, dots,
    crosses, diagonals), optional per-cell motion phase for animation readiness (static here).
11. **parcels** "Pixel parcels" — chunky two-tone block fields (rect packing) with a hairline survey
    grid and tick labels floating on top.
12. **prismpix** "Pixel aurora" — chunky pixel streams of a hot chromatic ramp (built from brand
    inks + spark) flowing over a dark dot-grid field.
13. **totem** "Pixel totem" — mirrored central panel of woven pixel motifs inside a static border
    frame, all on one grid; banner proportions friendly.
14. **slipgrid** "Slipped grid" — field smeared into vertical streaks, rows slipped sideways,
    quantised to coarse cells with dark gutters and scattered inks.
15. **tokens** "Grid tokens" — outlined circles and squares on a grid that chain and merge into
    compound capsule/blob forms where neighbours connect.
16. **relief** "Routed board" — seamless tile: columns of pattern blocks (stripes, dots, checks)
    under routed traces (orthogonal lines with rounded corners and pads) that wrap at every edge.

### Organic & cellular
17. **colony** "Cell colony" — soft metaball cells fusing where they meet, banded into concentric
    rings of the inks, with film grain or stipple.
18. **tissue** "Cell tissue" — Voronoi-like cells in a loose grid, each filled with dithered colour
    bands edge→core, crossed by branching veins.
19. **seafan** "Sea fan" — ribbed branching coral (recursive forking strokes) across a dark ground,
    torn-paper lobes behind, a dot screen over the top.
20. **pebbles** "Pebble field" — irregular pebble silhouettes strewn across the ground, each fill
    eaten from the rim inward by a crumbled edge or a halftone fade.
21. **marble** "Cut marbling" — poured-paint marbling (domain-warped noise) sliced into flat vector
    shapes (posterised contours), over a sparse starry/dotted ground.
22. **thermalstreak** "Heat smear" — heat field posterised into hard bands, smeared sideways into
    long horizontal streaks, a few torn bands slid out of line.
23. **waves** "Solarised waves" — rows of skewed waves with curling crests, combed into strands,
    small oil-drop rings, heights mapped round a false-colour ramp of the inks.

### Glitch & signal
24. **snow** "TV snow leaves" — stacked pointed leaf shapes filled with static over marbled colour,
    checker lenses, stair-step edges, comb stripes, asterisk marks.
25. **onebit** "One-bit glitch" — two-colour 1-bit crush of moiré, scanlines, noise and blocks.
26. **satellite** "Corrupt satellite" — marbled noise ground under mosaics of clashing pixel blocks,
    solid bars and sliced bands (deterministic shuffle — never sort with a random comparator).

### Collage & poster
27. **panels** "Panel collage" — the frame recursively carved into rectangles; each gets flat
    colour, hard stripes, stacked chevrons, a grainy ramp or a drawn grid.
28. **flyposter** "Fly-poster" — sweep of colour bands into hard vertical stripes, halftone and solid
    blocks punched over, plus a dense grid of tiny type marks (abstract glyphs, not words).
29. **festival** "Festival" — chunky colour patches, one big freehand looping doodle line, and a
    constellation of connected dots.
30. **patchwork** "Glyph patchwork" — ragged blobs and stepped blocks layered on a grid, each filled
    with circles, pluses, stripes, squares or dots in one ink.
31. **specimens** "Colour specimens" — grid of abstract colour blocks on a light ground, each a
    small study: marbling, tendrils, fans, rings or spikes.

### Botanical & line
32. **sprigs** "Marker botanicals" — blooms, leaves and stems in a thick marker line, packed edge to
    edge, seamless tile.
33. **blades** "Scattered blades" + **rods** "Chained rods" (two families):
    - blades: curved blade shapes thrown across a ground in one ink, printed unevenly (ink-take
      texture on a rough sheet);
    - rods: branching chains of rods wandering and forking, second ink printed slightly off true so
      a thick edge shows on one side.

### Soft color
34. **neonspray** "Neon spray" — vertical fluorescent streaks bleeding over soft pastel patches,
    airbrush edges, gentle grain.

(That is 34 entries incl. blades + rods split; total families ≈ 52.)

## Integration (task P3) — done
Status: integrated. 53 families (18 + 35) are loaded in index.html, the dev lab, `Patterns.FAMILY_FILES`
/ `LOAD_ORDER`, and available in the picker (categories + search + lazy thumbnails), brand suites,
brief cart, AI brief Source pointers, deck and dev lab. Harness and src-verify pass for all 53.
src-verify note: snow, satellite and aura create canvases via `document.createElement`, so the node
check stubs `createElement` and compares draw-call hashes rather than pixels (done for every family).
Seamless vector tiles of relief and sprigs exceed the 8 KB brief cap, so the brief says to attach the
exported SVG (caps unchanged); their "Copy CSS tile" works.

Original task text:
- Picker: category tabs/chips + search field above "All families"; thumbnails lazy-render on
  scroll (IntersectionObserver), cached by family+inks+tone; keep 390px usable.
- fit.js: revisit every aesthetic's 6-pattern suite using the bigger library where a new family
  fits better (e.g. Xerox → thermal/onebit, Blueprint → relief/tokens in mono, Groovy → waves/
  burst, Pixel Arcade → prismpix/totem/bloomgrid, Editorial → specimens/marble quiet, Aurora →
  neonspray at low tone? only if it reads as dev-tool restrained). Keep tone rules for quiet
  aesthetics.
- Brief/cart/Source: FAMILY_FILES map, src-verify passes for all families.
- Dev lab sheets: all families × 3 palettes; suites all 26.

## Acceptance
1. All new families render designed, legible textures at defaults on warm/green/blue-pink palettes
   (contact sheets reviewed), within budget, deterministic, no NaN/throws across a param sweep.
2. Vector/seamless flags honest (SVG export valid; tiles seamless in 3×3 sheets).
3. Picker usable with ~52 families; suites coherent for all 26 aesthetics.
4. Harness + src-verify pass for all families; no "Ptrn" in any app code, UI text or brief output.
