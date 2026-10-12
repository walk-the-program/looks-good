/* ---------------------------------------------------------------------
   patterns/fit.js — aesthetic fit: six tuned patterns for each of the 48
   aesthetics (keys match js/aesthetics/*.js).

     Patterns.suiteFor(aestheticKey) -> [{ key, name, colorway, params, tone }]
       key       pattern family key
       name      short display name for the suite wall
       colorway  'brand' | 'mono' | 'duotone' | 'night'
       params    overrides on top of the family defaults (render() fills the rest);
                 includes params.tone, equal to entry.tone
       tone      number 0..1, default 1. Lower = quieter: ink contrast/saturation moves
                 toward the ground and the spark shrinks (see engine.js, "Tone"). Quiet
                 suites: aurora-noir 0.35 (Fine screen 0.25), soft-form 0.45,
                 liquid-glass 0.6 (Aura 1), blueprint 0.55 (all mono), round 5: religious-futurism 0.5-0.6,
                 cybersigilism 0.5-0.6, biomechanical-gothic 0.45-0.5, dystopian-luxury 0.45-0.5, round 6: wabi-sabi 0.4-0.5; a few single entries are
                 softened in clay (0.85) and editorial-serif (0.75). Pass entry.params
                 (or params + { tone }) to Patterns.render / renderSVG / tileCSS.
     Patterns.suiteKeys()            -> every aesthetic key that has a suite

   Each entry is [family, name, colorway, params, tone?] (tone defaults to 1). A suite never repeats a
   family. The FIRST entry of a suite drives the deck's cover band and closing strip
   (js/patterns-deck.js leadEntry), so lead with a pattern that is safe at that size and obeys the
   aesthetic's own rule (no hazard stripes, targets, reef colour or noise band on a cover). Nothing here invents a colour: the colorway only chooses how the brand roles map to inks.
------------------------------------------------------------------------ */
(function (global) {
  'use strict';
  const P = global.Patterns;

  const FIT = {
    'soft-form': [
      ['aura', 'Quiet glow', 'brand', { layout: 'horizon', blobs: 4, strength: 0.6, soft: 1, grain: 0.22 }, 0.45],
      ['gradpanes', 'Pressed panes', 'brand', { rows: 3, cols: 3, gap: 1.4, radius: 3.4, steps: 0, grain: 0.12 }, 0.45],
      ['tokens', 'Soft capsules', 'brand', { cell: 7, link: 0.75, density: 0.65, fill: 'tint' }, 0.45],
      ['halftone', 'Soft screen', 'duotone', { cell: 1.35, levels: 4, shape: 'round', field: 'clouds', duo: false }, 0.45],
      ['pebbles', 'River stones', 'brand', { size: 1.2, gap: 0.8, erode: 0.35, mode: 'halftone', lit: 0.5 }, 0.45],
      ['glyphgrid', 'Dot matrix', 'duotone', { glyphs: 'shapes', cell: 3.8, bands: 5, duo: false }, 0.45],
    ],
    'raw-brutalist': [
      ['modulargrid', 'Slab grid', 'mono', { cols: 7, merge: 0.8, gap: 0, empty: 0.12 }],
      ['counterchange', 'Hard counter', 'mono', { figure: 'square', bar: 5, dir: 'v', size: 0.6, nest: 2, second: false }],
      ['zigzag', 'Stair teeth', 'mono', { style: 'stair', colors: 'two', band: 8, amp: 4, period: 11, phase: 'parallel', grain: 0.2 }],
      ['onebit', 'Hard crush', 'mono', { zones: 5, pixel: 1.4, dither: 'threshold', pair: 'ink1', glitch: 0.3 }],
      ['panels', 'Slab panels', 'mono', { depth: 4, gutter: 0.3, pitch: 1.1, flat: 0.45, frame: true }],
      ['glyphgrid', 'Block field', 'mono', { glyphs: 'blocks', cell: 4.2, bands: 5, duo: false }],
    ],
    'neo-brutal-pop': [
      ['arcrise', 'Sticker sunrise', 'brand', { origin: 'bottom', bands: 5, bars: false, suns: 1 }],
      ['panels', 'Sticker panels', 'brand', { depth: 4, gutter: 0.8, pitch: 1.1, flat: 0.4, frame: true }],
      ['patchwork', 'Pop patches', 'brand', { cell: 8, layers: 36, ragged: 0.4, motif: 'mixed', dotgrid: false }],
      ['festival', 'Doodle party', 'brand', { patches: 6, loops: 0.7, weight: 1.3, stars: 2, echo: true }],
      ['zigzag', 'Chunky zig', 'brand', { style: 'chevron', colors: 'three', band: 9, amp: 6, period: 14, phase: 'parallel' }],
      ['halftone', 'Big dots', 'brand', { cell: 3.4, levels: 3, shape: 'round', field: 'clouds', duo: true }],
    ],
    'retro-futurist': [
      ['flow', 'Orbit lines', 'brand', { field: 'swirl', strands: 5, gap: 2.2, bend: 0.8 }],
      ['oprings', 'Scope rings', 'brand', { mode: 'lens', centres: 2, freq: 16, warp: 0.05, bands: 'two' }],
      ['halftone', 'Ring screen', 'brand', { cell: 2, levels: 4, shape: 'ring', angle: 0, field: 'ridges', duo: false }],
      ['burst', 'Sunburst', 'brand', { rays: 72, layers: 3, bend: 0.3, beads: 0.5, origin: 'low' }],
      ['warpcheck', 'Warp grid', 'brand', { pattern: 'check', warp: 'bulge', cells: 22, amp: 0.55, waves: 2, second: true }],
      ['typeterrain', 'Readout', 'brand', { charset: 'code', style: 'hills', size: 1.3 }],
    ],
    'liquid-glass': [
      ['aura', 'Glass light', 'brand', { layout: 'scatter', blobs: 6, strength: 0.95, soft: 0.9, grain: 0.18 }, 1],
      ['flow', 'Refraction', 'duotone', { field: 'waves', strands: 3, gap: 3, bend: 1.3, weight: 0.8 }, 0.6],
      ['gradpanes', 'Glass panes', 'brand', { rows: 3, cols: 3, gap: 1.2, radius: 4, steps: 0, grain: 0.1 }, 0.6],
      ['waves', 'Currents', 'brand', { rows: 5, crests: 2.5, curl: 1.4, strands: 8, drops: 3 }, 0.6],
      ['halftone', 'Bubble screen', 'brand', { cell: 2.4, levels: 5, shape: 'ring', field: 'clouds', duo: true }, 0.6],
      ['neonspray', 'Light leaks', 'brand', { streaks: 8, pastel: 0.95, bleed: 1.5, spray: 0.3 }, 0.6],
    ],
    'holo-iridescent': [
      ['aura', 'Spectral haze', 'brand', { layout: 'ribbon', blobs: 7, strength: 0.9, soft: 0.85, mode: 'glow' }],
      ['flow', 'Light threads', 'brand', { field: 'flow', strands: 7, gap: 1.6, bend: 1.1, weight: 0.8 }],
      ['neonspray', 'Neon haze', 'brand', { streaks: 11, pastel: 0.8, bleed: 1.2, spray: 0.5 }],
      ['gradpanes', 'Foil strips', 'brand', { rows: 5, cols: 4, gap: 0.5, steps: 7, radius: 0 }],
      ['marble', 'Pearl marbling', 'brand', { bands: 5, warp: 1.1, cover: 0.7, stars: 0.5, outline: false }],
      ['halftone', 'Ring screen', 'brand', { cell: 1.6, levels: 5, shape: 'ring', field: 'warp', duo: true }],
    ],
    'aurora-noir': [
      ['flow', 'Filaments', 'brand', { field: 'flow', strands: 5, gap: 2.4, bend: 0.8, weight: 0.8 }, 0.35],
      ['aura', 'Faint aura', 'brand', { layout: 'ribbon', blobs: 4, strength: 0.55, soft: 1, mode: 'glow', grain: 0.3 }, 0.35],
      ['modulargrid', 'Hairline grid', 'brand', { cols: 9, style: 'line', merge: 0.5, gap: 0.8, empty: 0.3 }, 0.35],
      ['seafan', 'Deep coral', 'brand', { fans: 2, branch: 0.9, ribs: true, screen: 0.5, lobes: 2 }, 0.35],
      ['stipple', 'Night dust', 'brand', { density: 1, dot: 0.8, field: 'warp', duo: true }, 0.35],
      ['halftone', 'Fine screen', 'brand', { cell: 1.2, levels: 4, shape: 'round', field: 'clouds', duo: false }, 0.25],
    ],
    'bauhaus-poster': [
      ['counterchange', 'Counterchange', 'brand', { figure: 'circle', bar: 3.6, dir: 'v', size: 0.66, nest: 2, second: true }],
      ['ribbonrise', 'Banded rise', 'brand', { edge: 'bottom', bar: 2, bands: 4, shift: 0.12, ring: true }],
      ['panels', 'Panel study', 'brand', { depth: 5, gutter: 0.5, pitch: 1, flat: 0.3, frame: false }],
      ['specimens', 'Colour studies', 'brand', { cols: 4, gap: 1.1, round: 0, study: 'rings', line: 1 }],
      ['chevron', 'Chevron', 'brand', { bands: 7, slope: 45, mirror: 'quad', rhythm: 'even', colors: 'four' }],
      ['oprings', 'Target', 'brand', { mode: 'rings', centres: 1, freq: 16, warp: 0, bands: 'two' }],
    ],
    'clay': [
      ['aura', 'Soft lumps', 'brand', { layout: 'scatter', blobs: 5, strength: 0.85, soft: 0.8, grain: 0.14 }],
      ['gradpanes', 'Pillow panes', 'brand', { rows: 3, cols: 3, gap: 1.6, radius: 4, steps: 0, grain: 0.1 }],
      ['specimens', 'Glazed tiles', 'brand', { cols: 3, gap: 1.6, round: 3, study: 'marbling', line: 1.2 }, 0.85],
      ['pebbles', 'Pebbles', 'brand', { size: 1.3, gap: 0.6, erode: 0.3, mode: 'halftone', lit: 0.6 }, 0.85],
      ['stipple', 'Fingerprints', 'brand', { density: 1.1, dot: 1.2, field: 'warp', duo: true }],
      ['zigzag', 'Wave ribbons', 'brand', { style: 'rounded', colors: 'four', band: 8, amp: 4, period: 12, phase: 'parallel' }],
    ],
    'riso-print': [
      ['tornbands', 'Torn collage', 'brand', { bands: 7, tear: 1.1, tilt: -2.5, minis: 'mixed', shadow: 0.5 }],
      ['cutup', 'Cut-up hills', 'brand', { pieces: 5, cell: 1.5, hills: 1, slip: 0.55 }],
      ['inkstill', 'Riso still life', 'brand', { px: 0.8, masses: 4, vessels: 2, dither: 2, marks: true }],
      ['sonar', 'Coastline', 'brand', { land: 0.45, size: 1, speckle: 0.7, contours: true }],
      ['halftone', 'Riso halftone', 'brand', { cell: 1.9, levels: 5, shape: 'round', angle: 15, field: 'clouds', duo: true, grain: 0.3 }],
      ['blades', 'Inked blades', 'brand', { count: 260, size: 1, curve: 0.6, take: 0.6, ink: 'ink1' }],
    ],
    'editorial-serif': [
      ['stipple', 'Engraved stipple', 'mono', { density: 1.1, dot: 0.9, field: 'clouds', duo: false }],
      ['weave', 'Pinstripe', 'mono', { rhythm: 'pinstripe', skew: 0, bands: 9, gap: 0.3, stripe: 0.9 }],
      ['flow', 'Engraved lines', 'mono', { field: 'waves', strands: 5, gap: 2, bend: 0.8, weight: 0.8 }],
      ['halftone', 'Newsprint', 'mono', { cell: 1.2, levels: 5, shape: 'round', angle: 45, field: 'clouds', duo: false, grain: 0.22 }],
      ['specimens', 'Plate studies', 'mono', { cols: 4, gap: 1.4, round: 0, study: 'mixed', line: 0.8 }, 0.75],
      ['marble', 'Endpaper', 'mono', { bands: 4, warp: 0.9, cover: 0.55, stars: 0.3, outline: true }, 0.75],
    ],
    'neo-deco': [
      ['chevron', 'Gilt chevrons', 'brand', { bands: 8, slope: 52, mirror: 'quad', rhythm: 'even', colors: 'four' }],
      ['arcrise', 'Sunburst arcs', 'brand', { origin: 'bottom', bands: 9, bars: true, suns: 1, bar: 2.4 }],
      ['counterchange', 'Arch inlay', 'brand', { figure: 'arch', bar: 2.6, dir: 'v', size: 0.7, nest: 3, second: true }],
      ['zigzag', 'Stepped frieze', 'brand', { style: 'stair', colors: 'four', band: 6, amp: 4, period: 8, phase: 'interlock' }],
      ['modulargrid', 'Gilt lattice', 'brand', { cols: 10, style: 'line', merge: 0.3, gap: 0.5, empty: 0.2 }],
      ['burst', 'Gilt rays', 'brand', { rays: 90, layers: 2, bend: 0.1, beads: 0.7, origin: 'low' }],
    ],
    'y2k-chrome': [
      ['gradpanes', 'Chrome strips', 'night', { rows: 6, cols: 3, gap: 0.5, steps: 0, radius: 0 }],
      ['oprings', 'Chrome target', 'brand', { mode: 'rings', centres: 1, freq: 16, warp: 0.2, bands: 'three' }],
      ['glyphgrid', 'Icon grid', 'mono', { glyphs: 'geometric', cell: 3.4, bands: 4, duo: false }],
      ['chevron', 'Speed chevrons', 'brand', { bands: 10, slope: 38, mirror: 'quad', rhythm: 'varied', colors: 'three' }],
      ['aura', 'Lens flare', 'brand', { layout: 'ribbon', blobs: 6, strength: 0.95, soft: 0.8, mode: 'glow' }],
      ['halftone', 'Bubble screen', 'brand', { cell: 2.2, levels: 5, shape: 'ring', field: 'warp', duo: true }],
    ],
    'cyber-hud': [
      ['signal', 'Data glitch', 'brand', { px: 0.55, bands: 26, noise: 0.75, blank: 0.1 }],
      ['modulargrid', 'HUD grid', 'brand', { cols: 10, style: 'line', merge: 0.6, gap: 0.8, empty: 0.25 }],
      ['slipgrid', 'Slipped feed', 'brand', { cell: 2.5, slip: 0.6, streak: 1.2, gutter: 0.12, scatter: 0.4 }],
      ['onebit', 'One-bit scan', 'brand', { zones: 6, pixel: 0.9, dither: 'bayer', pair: 'ink1', glitch: 0.5 }],
      ['satellite', 'Corrupt feed', 'brand', { mosaic: 0.8, block: 1.5, bars: 0.5, slices: 3, tear: 0.5 }],
      ['typeterrain', 'Binary field', 'brand', { charset: 'binary', style: 'ridges', size: 1.3, levels: 6 }],
    ],
    'bento-grid': [
      ['modulargrid', 'Tile grid', 'brand', { cols: 6, merge: 1, gap: 1.6, empty: 0.12 }],
      ['gradpanes', 'Gradient tiles', 'brand', { rows: 3, cols: 3, gap: 1.6, radius: 3, steps: 0, grain: 0.1 }],
      ['tokens', 'Token chains', 'brand', { cell: 6, link: 0.6, density: 0.7, fill: 'mixed' }],
      ['parcels', 'Block parcels', 'brand', { cell: 1.6, size: 1.35, every: 8, labels: false }],
      ['aura', 'Tile glow', 'brand', { layout: 'scatter', blobs: 5, strength: 0.85, soft: 0.8 }],
      ['pixelquilt', 'Dither tiles', 'brand', { px: 1, block: 8, motifs: 'dither', big: 0.3 }],
    ],
    'mesh-gradient': [
      ['aura', 'Mesh wash', 'brand', { layout: 'scatter', blobs: 8, strength: 1, soft: 0.95, grain: 0.2 }],
      ['gradpanes', 'Ramp panes', 'brand', { rows: 3, cols: 3, gap: 0, steps: 0, radius: 0, grain: 0.18 }],
      ['neonspray', 'Soft spray', 'brand', { streaks: 9, pastel: 0.9, bleed: 1.4, spray: 0.4 }],
      ['waves', 'Ribbon waves', 'brand', { rows: 6, crests: 3, curl: 1.6, strands: 10, drops: 2 }],
      ['flow', 'Silk', 'brand', { field: 'waves', strands: 7, gap: 2, bend: 0.9, weight: 0.8 }],
      ['halftone', 'Soft screen', 'brand', { cell: 2.4, levels: 5, shape: 'round', field: 'warp', duo: true }],
    ],
    'industrial-device': [
      ['halftone', 'Perforation', 'mono', { cell: 2.4, levels: 3, shape: 'round', angle: 0, field: 'clouds', duo: false, scale: 0.8 }],
      ['glyphgrid', 'Key caps', 'mono', { glyphs: 'blocks', cell: 3.8, bands: 5, duo: true }],
      ['specimens', 'CMF chips', 'brand', { cols: 4, gap: 1, round: 0.4, study: 'mixed', line: 0.8 }],
      ['modulargrid', 'Panel grid', 'mono', { cols: 9, merge: 0.6, gap: 0.5, empty: 0.2 }],
      ['relief', 'Routed board', 'mono', { cols: 4, traces: 7, blocks: 4, trace: 1 }],
      ['tokens', 'Indicator lamps', 'mono', { cell: 5, link: 0.3, density: 0.6, fill: 'open' }],
    ],
    'pixel-arcade': [
      ['pixelquilt', 'Pixel quilt', 'brand', { px: 1, block: 8, motifs: 'all', big: 0.16 }],
      ['prismpix', 'Pixel aurora', 'brand', { px: 1.7, streams: 4, glow: 1, dots: true }],
      ['totem', 'Pixel totem', 'brand', { px: 1.4, panel: 0.56, band: 5, frame: 2 }],
      ['bloomgrid', 'Pixel bloom', 'brand', { px: 3, levels: 4, rings: 4, calm: 0.5, dither: false }],
      ['kaleidopix', 'Kaleidoscope', 'brand', { px: 1.8, patches: 1, fold: 'quad' }],
      ['terrain', 'Pixel terrain', 'brand', { levels: 6, pix: 0.7, dither: 0.7, style: 'islands' }],
    ],
    'groovy-70s': [
      ['arcrise', 'Rainbow rise', 'brand', { origin: 'bottom', bands: 9, bars: false, suns: 2 }],
      ['zigzag', 'Wavy stripes', 'brand', { style: 'rounded', colors: 'four', band: 7, amp: 5, period: 14, phase: 'parallel' }],
      ['ribbonrise', 'Corner stripes', 'brand', { edge: 'bottom', bar: 1.7, bands: 5, shift: 0.12, ring: true }],
      ['burst', 'Solid sunburst', 'brand', { rays: 24, layers: 1, bend: 0, beads: 0, origin: 'low' }],
      ['patchwork', 'Flower-power dots', 'brand', { cell: 8, layers: 40, ragged: 0.3, motif: 'circles', dotgrid: false }],
      ['oprings', 'Concentric rings', 'brand', { mode: 'rings', centres: 1, freq: 12, warp: 0, bands: 'four' }],
    ],
    'blueprint': [
      ['modulargrid', 'Drafting grid', 'mono', { cols: 10, style: 'line', merge: 0.5, gap: 0.6, empty: 0.3 }, 0.55],
      ['relief', 'Routed traces', 'mono', { cols: 4, traces: 9, blocks: 3, trace: 0.8 }, 0.55],
      ['tokens', 'Node chains', 'mono', { cell: 5.4, link: 0.6, density: 0.6, fill: 'open' }, 0.55],
      ['rods', 'Wiring', 'mono', { density: 1.2, thick: 0.7, length: 3.4, fork: 0.5, slip: 0.4, second: 'ground' }, 0.55],
      ['flow', 'Contour lines', 'mono', { field: 'flow', strands: 3, gap: 2.6, bend: 0.8, weight: 0.8 }, 0.55],
      ['glyphgrid', 'Survey marks', 'mono', { glyphs: 'crosses', cell: 3.6, bands: 4, duo: false }, 0.55],
    ],
    'blob-tracking': [
      ['onebit', 'One-bit footage', 'mono', { zones: 6, pixel: 0.8, dither: 'bayer', pair: 'ink1', glitch: 0.1 }],
      ['terrain', 'Dithered footage', 'mono', { levels: 5, pix: 0.6, dither: 1, style: 'hills' }],
      ['signal', 'Dropout', 'mono', { px: 0.6, bands: 22, noise: 0.6, blank: 0.2 }],
      ['modulargrid', 'Bounding boxes', 'mono', { cols: 9, style: 'line', merge: 0.7, gap: 0.6, empty: 0.35 }],
      ['parcels', 'Track IDs', 'mono', { cell: 1.4, size: 1, every: 8, labels: true }],
      ['glyphgrid', 'Crosshairs', 'mono', { glyphs: 'crosses', cell: 3.4, bands: 5, duo: false }],
    ],
    'xerox': [
      ['halftone', 'Copied screen', 'mono', { cell: 3.2, levels: 2, shape: 'round', angle: 45, field: 'warp', duo: false, grain: 0.5 }],
      ['onebit', 'Toner crush', 'mono', { zones: 6, pixel: 1, dither: 'threshold', pair: 'ink1', glitch: 0.05 }],
      ['tornbands', 'Paste-up', 'mono', { bands: 5, tear: 1, tilt: -0.8, minis: 'stripes', shadow: 0.2 }],
      ['stipple', 'Toner stipple', 'mono', { density: 1.2, dot: 1, field: 'ridges', duo: false, grain: 0.3 }],
      ['glyphgrid', 'Registration marks', 'mono', { glyphs: 'crosses', cell: 3.8, bands: 4, duo: false, grain: 0.3 }],
      ['sonar', 'Copied contours', 'mono', { land: 0.4, size: 1, speckle: 0.5, contours: true }],
    ],
    'micrographics': [
      ['relief', 'Micro board', 'mono', { cols: 5, traces: 10, blocks: 4, trace: 0.7 }],
      ['tokens', 'Micro tokens', 'mono', { cell: 4, link: 0.5, density: 0.7, fill: 'open' }],
      ['parcels', 'Parcel ticks', 'mono', { cell: 1.2, size: 1.2, every: 8, labels: true }],
      ['modulargrid', 'Spec grid', 'mono', { cols: 12, style: 'line', merge: 0.4, gap: 0.4, empty: 0.4 }],
      ['typeterrain', 'Micro type', 'mono', { charset: 'code', style: 'hills', size: 0.9, levels: 6 }],
      ['signal', 'Barcode field', 'mono', { px: 0.5, bands: 28, noise: 0.3, blank: 0.3 }],
    ],
    'mixed-type': [
      ['typeterrain', 'Mixed type', 'brand', { charset: 'dots', style: 'warp', size: 1.6 }],
      ['flyposter', 'Fly-poster', 'brand', { stripe: 1.3, harden: 0.65, blocks: 5, marks: 2, angle: 18 }],
      ['specimens', 'Type specimens', 'brand', { cols: 4, gap: 1.1, round: 0, study: 'mixed', line: 1 }],
      ['tornbands', 'Cut-ups', 'brand', { bands: 6, tear: 0.9, tilt: 1.5, minis: 'mixed', shadow: 0.4 }],
      ['zigzag', 'Zig bands', 'brand', { style: 'chevron', colors: 'three', band: 8, amp: 4.5, period: 10, phase: 'parallel' }],
      ['glyphgrid', 'Glyphs', 'brand', { glyphs: 'shapes', cell: 4, bands: 5, duo: true }],
    ],
    'ascii-art': [
      ['typeterrain', 'ASCII terrain', 'brand', { charset: 'ascii', style: 'warp', size: 1.9, levels: 8 }],
      ['onebit', 'One-bit dither', 'brand', { zones: 5, pixel: 1.2, dither: 'bayer', pair: 'ink1', glitch: 0.3 }],
      ['glyphgrid', 'Cursor field', 'brand', { glyphs: 'crosses', cell: 3.2, bands: 5, duo: true }],
      ['signal', 'Line noise', 'brand', { px: 0.55, bands: 24, noise: 0.6, blank: 0.2 }],
      ['terrain', 'Density map', 'mono', { levels: 5, pix: 0.6, dither: 0.8, style: 'hills' }],
      ['pixelgrid', 'Cell field', 'duotone', { cell: 2.7, mode: 'crosses', zones: 5, density: 0.65, phase: 0 }],
    ],
    'rebus': [
      ['counterchange', 'Eye', 'brand', { figure: 'circle', bar: 4.4, dir: 'h', size: 0.6, nest: 2, second: true }],
      ['modulargrid', 'Construction grid', 'mono', { cols: 12, style: 'line', merge: 0.25, gap: 0.3, empty: 0.4 }],
      ['patchwork', 'Picture patches', 'brand', { cell: 8, layers: 40, ragged: 0.5, motif: 'mixed', dotgrid: true }],
      ['specimens', 'Pictogram sheet', 'brand', { cols: 4, gap: 0.8, round: 0, study: 'rings', line: 1 }],
      ['weave', 'Logotype stripes', 'brand', { bands: 9, rhythm: 'even', skew: 0, gap: 0.2, stripe: 1.2 }],
      ['glyphgrid', 'Pictogram field', 'mono', { glyphs: 'geometric', cell: 5, bands: 4, duo: false }],
    ],
    'corporate-vandalism': [
      ['warpcheck', 'Envelope tint', 'mono', { pattern: 'slash', warp: 'wave', cells: 40, amp: 0.1, waves: 1, second: false }, 0.5],
      ['chevron', 'Hazard stripe', 'mono', { bands: 12, slope: 45, mirror: 'x', rhythm: 'even', colors: 'two' }],
      ['signal', 'Redaction run', 'mono', { px: 0.9, bands: 14, noise: 0.25, blank: 0.35 }],
      ['pixelgrid', 'Perforation', 'mono', { cell: 3.6, mode: 'dots', zones: 2, density: 0.5, phase: 0 }],
      ['modulargrid', 'Form grid', 'mono', { cols: 8, style: 'line', merge: 0.2, gap: 0.5, empty: 0.2 }],
      ['parcels', 'Parcel labels', 'mono', { cell: 1.6, size: 1, every: 8, labels: true }],
    ],
    'religious-futurism': [
      ['bloomgrid', 'Pixel bloom', 'brand', { px: 3, levels: 4, rings: 4, calm: 0.7, dither: false }, 0.5],
      ['specimens', 'Rose windows', 'brand', { cols: 4, gap: 1, round: 1.2, study: 'fans', line: 0.8 }, 0.55],
      ['gradpanes', 'Gradient panes', 'brand', { rows: 4, cols: 3, gap: 0.8, steps: 0, radius: 0, grain: 0.25 }, 0.55],
      ['arcrise', 'Apse and pipes', 'brand', { origin: 'bottom', bands: 7, bars: true, suns: 1, bar: 3 }, 0.55],
      ['marble', 'Veined stone', 'mono', { bands: 6, warp: 1, cover: 0.6, stars: 0.1, outline: false }, 0.5],
      ['burst', 'Radiant mandorla', 'brand', { rays: 48, layers: 2, bend: 0.1, beads: 0.3, origin: 'centre' }, 0.4],
    ],
    'xerox-punk': [
      ['tornbands', 'Wheatpaste layers', 'brand', { bands: 7, tear: 1.4, tilt: 2.5, minis: 'mixed', shadow: 0.6 }],
      ['onebit', 'Toner crush', 'mono', { zones: 5, pixel: 1.5, dither: 'threshold', pair: 'ink1', glitch: 0.5 }],
      ['flyposter', 'Bill posting', 'brand', { stripe: 1.6, harden: 0.8, blocks: 4, marks: 2, angle: -12 }],
      ['cutup', 'Cut-up sheets', 'brand', { pieces: 5, cell: 1.6, hills: 1.2, slip: 0.6 }],
      ['halftone', 'Coarse screen', 'mono', { cell: 4, levels: 3, shape: 'square', angle: 20, field: 'warp', duo: false }],
      ['snow', 'Dead channel', 'duotone', { cols: 5, static: 0.5, stairs: 0.3, lenses: 0.2, marks: 0.4 }],
    ],
    'acid-graphics': [
      ['warpcheck', 'Warped check', 'brand', { pattern: 'check', warp: 'wave', cells: 24, amp: 0.8, waves: 3, second: true }],
      ['burst', 'Strobe rays', 'brand', { rays: 96, layers: 3, bend: 0.6, beads: 0.2, origin: 'corner' }],
      ['typeterrain', 'Stretched type', 'brand', { charset: 'code', style: 'warp', size: 2.4, levels: 8 }],
      ['oprings', 'Vibrating rings', 'brand', { mode: 'lens', centres: 2, freq: 24, warp: 0.6, bands: 'two' }],
      ['ribbonrise', 'Ticket tabs', 'brand', { edge: 'bottom', bar: 1.8, bands: 5, shift: 0.2, ring: true }],
      ['weave', 'Stretch ramp', 'brand', { bands: 12, rhythm: 'mixed', skew: 1, gap: 0.2, stripe: 1.5 }],
    ],
    'cybersigilism': [
      ['flow', 'Silver filaments', 'mono', { field: 'swirl', strands: 3, gap: 1.8, bend: 1.6, weight: 0.6 }, 0.55],
      ['specimens', 'Thorn sigils', 'mono', { cols: 3, gap: 1.2, round: 0, study: 'spikes', line: 0.8 }, 0.55],
      ['stipple', 'Silver dust', 'mono', { density: 0.7, dot: 0.7, layout: 'random', mirror: 'none', field: 'clouds', duo: false }, 0.5],
      ['glyphgrid', 'Etched marks', 'mono', { glyphs: 'crosses', cell: 5, bands: 3, duo: false }, 0.5],
      ['rods', 'Thorn rods', 'mono', { density: 1.1, thick: 0.6, length: 4.5, fork: 0.7, slip: 0.4, second: 'ink2' }, 0.6],
      ['kaleidopix', 'Mirrored glyphs', 'mono', { px: 1.8, patches: 1, fold: 'quad' }, 0.5],
    ],
    'industrial-hazard': [
      ['panels', 'Steel plates', 'mono', { depth: 4, gutter: 0.4, pitch: 1, flat: 0.5, frame: true }, 0.6],
      ['relief', 'Panel traces', 'mono', { cols: 3, traces: 8, blocks: 4, trace: 1.1 }],
      ['slipgrid', 'Indicator lamps', 'mono', { cell: 2.4, slip: 0.2, streak: 1, gutter: 0.18, scatter: 0.3 }],
      ['modulargrid', 'Bay grid', 'mono', { cols: 6, style: 'filled', merge: 0.4, gap: 0.3, empty: 0.15 }],
      ['zigzag', 'Tread plate', 'mono', { style: 'stair', band: 6, amp: 3, period: 9, phase: 'parallel', colors: 'two' }],
      ['chevron', 'Hazard stripes', 'mono', { bands: 14, slope: 45, mirror: 'x', rhythm: 'even', colors: 'two' }],
    ],
    'radical-memphis': [
      ['patchwork', 'Terrazzo', 'brand', { cell: 7, layers: 56, ragged: 0.6, motif: 'mixed', dotgrid: false }],
      ['panels', 'Laminate stack', 'brand', { depth: 5, gutter: 0.6, pitch: 1.2, flat: 0.3, frame: false }],
      ['festival', 'Squiggle party', 'brand', { patches: 7, loops: 0.8, weight: 1.2, stars: 3, echo: true }],
      ['zigzag', 'Zig laminate', 'brand', { style: 'chevron', colors: 'four', band: 8, amp: 5, period: 12, phase: 'interlock' }],
      ['pebbles', 'Speckle top', 'brand', { size: 1, gap: 1.2, erode: 0.5, mode: 'crumble', lit: 0.3 }],
      ['glyphgrid', 'Primitive field', 'brand', { glyphs: 'shapes', cell: 5, bands: 5, duo: true }],
    ],
    'biomechanical-gothic': [
      ['waves', 'Tubing runs', 'mono', { rows: 6, crests: 3, curl: 1.4, strands: 10, drops: 0 }, 0.45],
      ['colony', 'Spore colony', 'mono', { cells: 40, rings: 3, fuse: 1.2, finish: 'film', nuclei: true }, 0.45],
      ['tissue', 'Cast membrane', 'mono', { cell: 12, loose: 0.5, levels: 4, veins: 0.5, wall: 0.8 }, 0.45],
      ['pebbles', 'Ossicles', 'mono', { size: 1.1, gap: 1, erode: 0.4, mode: 'crumble', lit: 0.3 }, 0.45],
      ['marble', 'Bone grain', 'mono', { bands: 7, warp: 1.4, cover: 0.7, stars: 0, outline: false }, 0.45],
      ['sonar', 'Cast contours', 'mono', { land: 0.4, size: 1, speckle: 0.5, contours: true }, 0.45],
    ],
    'pirate-broadcast': [
      ['pixelgrid', 'Block graphics', 'brand', { cell: 2.4, mode: 'crosses', zones: 4, density: 0.7, phase: 0 }, 0.7],
      ['signal', 'Dead air', 'brand', { px: 0.8, bands: 10, noise: 0.25, blank: 0.4 }],
      ['satellite', 'Intercept', 'brand', { mosaic: 0.6, block: 1.6, bars: 0.5, slices: 3, tear: 0.5 }],
      ['typeterrain', 'Teletext hills', 'brand', { charset: 'code', size: 1.2, levels: 6, style: 'ridges' }],
      ['snow', 'Static', 'night', { cols: 6, static: 0.6, stairs: 0.5, lenses: 0.3, marks: 0.6 }],
      ['warpcheck', 'Roll bars', 'duotone', { pattern: 'slash', warp: 'taper', cells: 18, amp: 0.4, waves: 2, second: false }],
    ],
    'dystopian-luxury': [
      ['modulargrid', 'Cold modules', 'mono', { cols: 10, style: 'line', merge: 0.3, gap: 0.8, empty: 0.35 }, 0.5],
      ['halftone', 'Clinical screen', 'mono', { cell: 1.2, levels: 4, shape: 'round', angle: 15, field: 'clouds', duo: false }, 0.45],
      ['stipple', 'Dust grain', 'mono', { density: 0.7, dot: 0.7, layout: 'random', mirror: 'none', field: 'clouds', duo: false }, 0.45],
      ['terrain', 'Survey contours', 'mono', { levels: 4, pix: 0.4, dither: 0.3, style: 'ridges' }, 0.45],
      ['parcels', 'Accession tags', 'mono', { cell: 1.2, size: 0.8, every: 12, labels: true }, 0.5],
      ['glyphgrid', 'Registration marks', 'mono', { glyphs: 'crosses', cell: 5, bands: 3, duo: false }, 0.45],
    ],
    // Round 6 (37-48). Leads chosen so no new suite opens with a family another aesthetic already leads with.
    'frutiger-aero': [
      ['colony', 'Bubbles', 'brand', { cells: 20, rings: 2, fuse: 0.8, finish: 'film', nuclei: false }],
      ['aura', 'Sky glow', 'brand', { layout: 'horizon', blobs: 5, soft: 1, mode: 'glow', strength: 0.8 }],
      ['blades', 'Meadow', 'brand', { count: 420, size: 0.9, curve: 0.5, take: 0.7, ink: 'ink2' }],
      ['terrain', 'Rolling hills', 'brand', { levels: 4, pix: 0.3, dither: 0, style: 'hills' }],
      ['flow', 'Aurora swoosh', 'duotone', { field: 'swirl', strands: 3, gap: 3, bend: 1.6, weight: 2 }],
      ['oprings', 'Lens rings', 'brand', { mode: 'lens', centres: 1, freq: 9, warp: 0.05, bands: 'two' }, 0.6],
    ],
    'naive-doodle': [
      ['sprigs', 'Marker garden', 'brand', { size: 1.2, line: 1.4, mix: 0.6, fills: 0.7, slip: 0.8 }],
      ['zigzag', 'Wiggle lines', 'brand', { style: 'rounded', band: 6, amp: 3, period: 8, phase: 'drift', colors: 'three' }],
      ['festival', 'Scribble stars', 'brand', { patches: 4, loops: 0.9, weight: 1.6, stars: 3, echo: false }],
      ['arcrise', 'Crayon sun', 'brand', { origin: 'bottom', bands: 4, suns: 1, bars: true, bar: 5 }],
      ['tokens', 'Stickers', 'brand', { cell: 6, link: 0.2, density: 0.5, fill: 'mixed' }],
      ['patchwork', 'Doodle quilt', 'brand', { cell: 9, layers: 24, ragged: 0.9, motif: 'circles', dotgrid: false }],
    ],
    'wabi-sabi': [
      ['oprings', 'Raked garden', 'mono', { mode: 'rings', centres: 2, freq: 11, warp: 0.18, bands: 'two' }, 0.45],
      ['marble', 'Suminagashi', 'mono', { bands: 6, warp: 1.4, cover: 0.5, stars: 0, outline: false }, 0.5],
      ['stipple', 'Washi fibre', 'mono', { density: 0.5, dot: 0.6, layout: 'random', mirror: 'none', field: 'clouds', duo: false }, 0.4],
      ['pebbles', 'Stepping stones', 'brand', { size: 1.5, gap: 1.8, erode: 0.6, mode: 'crumble', lit: 0.3 }, 0.5],
      ['terrain', 'Ink-wash ridges', 'duotone', { levels: 3, pix: 0.6, dither: 0.15, style: 'ridges' }, 0.5],
      ['weave', 'Tatami', 'mono', { bands: 6, rhythm: 'even', gap: 0.2, stripe: 0.8 }, 0.45],
    ],
    'dark-academia': [
      ['marble', 'Endpapers', 'brand', { bands: 7, warp: 2, cover: 0.85, stars: 0.3, outline: false }, 0.75],
      ['weave', 'Tweed', 'brand', { bands: 10, rhythm: 'pinstripe', gap: 0.1, stripe: 0.7 }],
      ['halftone', 'Steel engraving', 'mono', { cell: 1.1, levels: 5, shape: 'round', angle: 45, field: 'ridges', duo: false }, 0.6],
      ['sprigs', 'Pressed flowers', 'night', { size: 0.8, line: 0.7, mix: 0.3, fills: 0.4, slip: 0.2 }, 0.6],
      ['counterchange', 'Library arches', 'night', { figure: 'arch', bar: 2.4, dir: 'v', size: 0.7, nest: 2, second: false }],
      ['modulargrid', 'Ledger', 'mono', { cols: 12, style: 'line', merge: 0.2, gap: 0.6, empty: 0.3 }, 0.5],
    ],
    'mid-century': [
      ['burst', 'Atomic stars', 'brand', { rays: 24, layers: 1, bend: 0, beads: 1, origin: 'centre' }],
      ['halftone', 'Screen print', 'brand', { cell: 3, levels: 3, shape: 'round', angle: 15, field: 'clouds', duo: true }],
      ['counterchange', 'Girard diamonds', 'brand', { figure: 'diamond', bar: 3, dir: 'v', size: 0.6, nest: 2, second: true }],
      ['tokens', 'Molecules', 'brand', { cell: 6, link: 0.9, density: 0.5, fill: 'open' }],
      ['zigzag', 'Rickrack', 'brand', { style: 'rounded', colors: 'three', band: 5, amp: 3, period: 7, phase: 'parallel' }],
      ['panels', 'Cut planes', 'brand', { depth: 3, gutter: 0.8, pitch: 1.3, flat: 0.6, frame: false }],
    ],
    'art-nouveau': [
      ['blades', 'Iris stems', 'brand', { count: 120, size: 1.8, curve: 0.9, take: 0.3, ink: 'ink1' }],
      ['flow', 'Whiplash', 'brand', { field: 'swirl', strands: 4, gap: 2, bend: 2.2, weight: 1.4 }],
      ['arcrise', 'Halo', 'brand', { origin: 'bottom', bands: 6, suns: 1, bars: false }],
      ['sprigs', 'Botanical frieze', 'brand', { size: 1.1, line: 1, mix: 0.5, fills: 0.8, slip: 0.3 }],
      ['waves', 'Japonisme waves', 'brand', { rows: 5, crests: 2.5, curl: 2.6, strands: 12, drops: 0 }],
      ['specimens', 'Tendril studies', 'brand', { cols: 3, gap: 1, round: 3, study: 'tendrils', line: 1 }],
    ],
    'transit-wayfinding': [
      ['ribbonrise', 'Line bands', 'brand', { edge: 'left', bar: 2.4, bands: 5, ring: false }],
      ['relief', 'Route board', 'brand', { cols: 4, traces: 9, blocks: 3, trace: 1.4 }],
      ['tokens', 'Stations', 'brand', { cell: 6, link: 1, density: 0.6, fill: 'open' }],
      ['counterchange', 'Line bullets', 'brand', { figure: 'circle', bar: 2, dir: 'v', size: 0.5, nest: 1, second: false }],
      ['modulargrid', 'Sign modules', 'mono', { cols: 8, style: 'filled', merge: 0.6, gap: 0.3, empty: 0.2 }],
      ['glyphgrid', 'Pictogram grid', 'mono', { glyphs: 'shapes', cell: 5, bands: 4, duo: false }],
    ],
    'gorpcore': [
      ['terrain', 'Topo contours', 'brand', { levels: 7, pix: 0.3, dither: 0, style: 'ridges' }],
      ['sonar', 'Lake map', 'brand', { land: 0.5, size: 1, speckle: 0.3, contours: true }],
      ['weave', 'Ripstop', 'mono', { bands: 14, rhythm: 'even', gap: 0.05, stripe: 0.6 }],
      ['pebbles', 'Scree', 'brand', { size: 0.8, gap: 0.2, erode: 0.5, mode: 'halftone', lit: 0.7 }],
      ['parcels', 'Gear tags', 'mono', { cell: 1.6, size: 1, every: 6, labels: true }],
      ['zigzag', 'Switchbacks', 'brand', { style: 'chevron', colors: 'two', band: 6, amp: 8, period: 12, phase: 'parallel', vertical: true }],
    ],
    'old-web': [
      ['kaleidopix', 'Clip-art tile', 'brand', { px: 1.4, patches: 1, fold: 'quad' }],
      ['pixelquilt', 'Tiled wallpaper', 'brand', { px: 1, block: 6, motifs: 'all', big: 0.1 }],
      ['stipple', 'Starfield', 'night', { density: 0.6, dot: 0.8, layout: 'random', mirror: 'none', field: 'clouds', duo: true }],
      ['marble', 'Marble GIF', 'brand', { bands: 8, warp: 2.5, cover: 0.9, stars: 0, outline: false }],
      ['gradpanes', 'WordArt bands', 'brand', { rows: 2, cols: 7, gap: 0.4, steps: 8, radius: 0 }],
      ['pixelgrid', 'Construction tape', 'brand', { cell: 2.5, mode: 'diagonals', zones: 2, density: 1, phase: 0 }],
    ],
    'big-top': [
      ['weave', 'Awning stripes', 'brand', { bands: 8, rhythm: 'even', gap: 0, stripe: 2.5 }],
      ['burst', 'Tent canopy', 'brand', { rays: 28, layers: 1, bend: 0, beads: 0.8, origin: 'low' }],
      ['zigzag', 'Bunting', 'brand', { style: 'chevron', band: 10, amp: 6, period: 8, phase: 'interlock', colors: 'three' }],
      ['counterchange', 'Ring', 'brand', { figure: 'circle', bar: 3, dir: 'v', size: 0.8, nest: 3, second: true }],
      ['festival', 'Confetti', 'brand', { patches: 8, loops: 0.2, weight: 0.8, stars: 4, echo: true }],
      ['halftone', 'Lithograph dots', 'brand', { cell: 2.2, levels: 4, shape: 'round', angle: 15, field: 'clouds', duo: true }],
    ],
    'gummy': [
      ['tokens', 'Gummy drops', 'brand', { cell: 7, link: 0, density: 0.6, fill: 'tint' }],
      ['colony', 'Jelly cells', 'brand', { cells: 22, rings: 3, fuse: 1.4, finish: 'film', nuclei: true }],
      ['zigzag', 'Gummy worms', 'brand', { style: 'rounded', colors: 'four', band: 8, amp: 5, period: 10, phase: 'interlock' }],
      ['warpcheck', 'Wobble check', 'brand', { pattern: 'check', warp: 'bulge', cells: 10, amp: 0.5, waves: 1, second: true }],
      ['oprings', 'Jelly lens', 'brand', { mode: 'eyes', centres: 3, freq: 8, warp: 0.3, bands: 'three' }],
      ['halftone', 'Sugar dust', 'mono', { cell: 0.9, levels: 3, shape: 'round', field: 'clouds', duo: false }, 0.6],
    ],
    'curio-cabinet': [
      ['specimens', 'Specimen trays', 'brand', { cols: 5, gap: 0.6, round: 0, study: 'mixed', line: 0.8 }],
      ['modulargrid', 'Type case', 'mono', { cols: 10, style: 'line', merge: 0.7, gap: 0.4, empty: 0 }, 0.6],
      ['pebbles', 'Mineral drawer', 'brand', { size: 1, gap: 1.2, erode: 0.4, mode: 'mixed', lit: 0.8 }],
      ['inkstill', 'Still life', 'brand', { px: 0.8, masses: 4, vessels: 3, dither: 1, marks: false }],
      ['parcels', 'Tags', 'mono', { cell: 1.4, size: 1, every: 6, labels: true }, 0.6],
      ['seafan', 'Coral specimen', 'night', { fans: 1, branch: 1.2, ribs: false, screen: 0.3, lobes: 2 }, 0.7],
    ],
  };

  // Where each family lives, so a brief can point an AI tool at the exact generator.
  // Keep in step with the P.register() calls in js/patterns/families/*.js (checked by
  // the brief harness: every registered key must appear here, in the right file).
  const FAMILY_FILES = {
    'field.js':   ['halftone', 'stipple', 'terrain', 'typeterrain'],
    'stripe.js':  ['zigzag', 'weave', 'oprings', 'counterchange', 'chevron', 'arcrise'],
    'grid.js':    ['pixelquilt', 'gradpanes', 'glyphgrid', 'modulargrid', 'signal'],
    'texture.js': ['tornbands', 'aura', 'flow'],
    'print2.js':  ['thermal', 'cutup', 'sonar', 'inkstill'],
    'op2.js':     ['warpcheck', 'burst', 'ribbonrise', 'neonspray'],
    'pixel2.js':  ['bloomgrid', 'kaleidopix', 'pixelgrid', 'parcels', 'prismpix', 'totem', 'slipgrid', 'tokens', 'relief'],
    'organic2.js': ['colony', 'tissue', 'seafan', 'pebbles', 'marble', 'thermalstreak', 'waves'],
    'glitch2.js': ['snow', 'onebit', 'satellite'],
    'collage2.js': ['panels', 'flyposter', 'festival', 'patchwork', 'specimens', 'sprigs', 'blades', 'rods'],
  };
  const FILE_OF = {};
  Object.keys(FAMILY_FILES).forEach(f => FAMILY_FILES[f].forEach(k => { FILE_OF[k] = 'js/patterns/families/' + f; }));

  P.ENGINE_FILE = 'js/patterns/engine.js';
  // Plain scripts, no dependencies, in index.html order: engine, the family files, then fit.js.
  P.LOAD_ORDER = ['js/patterns/engine.js'].concat(Object.keys(FAMILY_FILES).map(f => 'js/patterns/families/' + f), ['js/patterns/fit.js']);
  P.FAMILY_FILES = FILE_OF;                       // { familyKey: 'js/patterns/families/<file>.js' }
  P.fileOf = key => FILE_OF[key] || null;

  P.fit = FIT;
  P.suiteKeys = () => Object.keys(FIT);
  P.suiteFor = function (aestheticKey) {
    const rows = FIT[aestheticKey] || FIT['bauhaus-poster'];
    return rows.map(r => {
      const tone = r[4] == null ? 1 : r[4];
      return { key: r[0], name: r[1], colorway: r[2], params: Object.assign({}, r[3], { tone }), tone };
    });
  };
})(window);
