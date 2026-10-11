/* ---------------------------------------------------------------------
   patterns/fit.js — aesthetic fit: six tuned patterns for each of the 36
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
                 cybersigilism 0.5-0.6, biomechanical-gothic 0.45-0.5, dystopian-luxury 0.45-0.5; a few single entries are
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
      ['gradpanes', 'Chrome strips', 'brand', { rows: 6, cols: 3, gap: 0.5, steps: 8, radius: 0 }],
      ['aura', 'Lens flare', 'brand', { layout: 'ribbon', blobs: 6, strength: 0.95, soft: 0.8, mode: 'glow' }],
      ['thermalstreak', 'Heat smear', 'brand', { bands: 6, smear: 16, slides: 2, rough: 0.3, flip: 'bright' }],
      ['flow', 'Swirl', 'brand', { field: 'swirl', strands: 6, gap: 2, bend: 0.9, weight: 0.9 }],
      ['halftone', 'Bubble screen', 'brand', { cell: 2.2, levels: 5, shape: 'ring', field: 'warp', duo: true }],
      ['neonspray', 'Neon spray', 'brand', { streaks: 12, pastel: 0.7, bleed: 1, spray: 0.6 }],
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
      ['modulargrid', 'Panel grid', 'mono', { cols: 9, merge: 0.6, gap: 0.5, empty: 0.2 }],
      ['glyphgrid', 'Key caps', 'mono', { glyphs: 'blocks', cell: 3.8, bands: 5, duo: true }],
      ['signal', 'Scanlines', 'mono', { px: 0.7, bands: 20, noise: 0.35, blank: 0.2 }],
      ['relief', 'Routed board', 'mono', { cols: 4, traces: 7, blocks: 4, trace: 1 }],
      ['zigzag', 'Tread plate', 'mono', { style: 'stair', colors: 'two', band: 5, amp: 3, period: 7, phase: 'interlock' }],
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
      ['waves', 'Solar waves', 'brand', { rows: 6, crests: 3, curl: 1.9, strands: 10, drops: 4 }],
      ['burst', 'Dash burst', 'brand', { rays: 60, layers: 3, bend: 0.5, beads: 0.5, origin: 'centre' }],
      ['ribbonrise', 'Banded rise', 'brand', { edge: 'bottom', bar: 1.7, bands: 5, shift: 0.12, ring: true }],
      ['aura', 'Sunset', 'brand', { layout: 'horizon', blobs: 5, strength: 0.95, soft: 0.8, grain: 0.35 }],
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
      ['colony', 'Tracked cells', 'mono', { cells: 30, rings: 4, fuse: 1.1, finish: 'stipple', nuclei: true }],
      ['onebit', 'One-bit footage', 'mono', { zones: 6, pixel: 0.8, dither: 'mixed', pair: 'ink1', glitch: 0.5 }],
      ['terrain', 'Dithered footage', 'mono', { levels: 5, pix: 0.6, dither: 1, style: 'hills' }],
      ['tissue', 'Detection cells', 'brand', { cell: 10, loose: 0.8, levels: 4, veins: 0.5, wall: 0.7 }],
      ['signal', 'Dropout', 'mono', { px: 0.6, bands: 22, noise: 0.6, blank: 0.2 }],
      ['glyphgrid', 'Crosshairs', 'brand', { glyphs: 'crosses', cell: 3.4, bands: 5, duo: false }],
    ],
    'xerox': [
      ['thermal', 'Heat screen', 'mono', { bands: 4, cell: 1.5, turb: 1, shape: 'round', flat: true }],
      ['onebit', 'Toner crush', 'mono', { zones: 6, pixel: 1, dither: 'mixed', pair: 'ink1', glitch: 0.5 }],
      ['halftone', 'Threshold dots', 'mono', { cell: 2.4, levels: 2, shape: 'round', angle: 45, field: 'clouds', duo: false, grain: 0.35 }],
      ['stipple', 'Toner stipple', 'mono', { density: 1.2, dot: 1, field: 'ridges', duo: false, grain: 0.3 }],
      ['tornbands', 'Pasted strips', 'mono', { bands: 6, tear: 1.3, tilt: -1.5, minis: 'stripes', shadow: 0.3 }],
      ['signal', 'Copy glitch', 'mono', { px: 0.7, bands: 22, noise: 0.7, blank: 0.12, grain: 0.35 }],
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
      ['glyphgrid', 'Pictogram field', 'brand', { glyphs: 'shapes', cell: 5, bands: 5, duo: true }],
      ['patchwork', 'Picture patches', 'brand', { cell: 8, layers: 40, ragged: 0.5, motif: 'mixed', dotgrid: true }],
      ['festival', 'Doodle line', 'brand', { patches: 6, loops: 0.6, weight: 1.1, stars: 2, echo: false }],
      ['arcrise', 'Rising sun', 'brand', { origin: 'bottom', bands: 5, bars: false, suns: 1 }],
      ['counterchange', 'Eye', 'brand', { figure: 'circle', bar: 4.4, dir: 'h', size: 0.6, nest: 2, second: true }],
      ['sprigs', 'Marker sprigs', 'brand', { size: 1.1, line: 1, mix: 0.5, fills: 0.85, slip: 0.5 }],
    ],
    'corporate-vandalism': [
      ['glyphgrid', 'Form field', 'mono', { glyphs: 'blocks', cell: 3.4, bands: 4, duo: false }],
      ['onebit', 'Photocopy bureau', 'mono', { zones: 4, pixel: 1.6, dither: 'threshold', pair: 'ink1', glitch: 0.1 }],
      ['parcels', 'Parcel labels', 'mono', { cell: 1.6, size: 1, every: 8, labels: true }],
      ['modulargrid', 'Ledger cells', 'mono', { cols: 8, style: 'line', merge: 0.5, gap: 0.5, empty: 0.2 }],
      ['signal', 'Barcode run', 'mono', { px: 0.9, bands: 14, noise: 0.25, blank: 0.3 }],
      ['relief', 'Circuit memo', 'mono', { cols: 4, traces: 5, blocks: 3, trace: 0.8 }],
    ],
    'religious-futurism': [
      ['kaleidopix', 'Glass mosaic', 'brand', { px: 1.6, patches: 1, fold: 'quad' }, 0.6],
      ['specimens', 'Rose windows', 'brand', { cols: 4, gap: 1, round: 1.2, study: 'fans', line: 0.8 }, 0.55],
      ['marble', 'Veined stone', 'mono', { bands: 6, warp: 1, cover: 0.6, stars: 0.1, outline: false }, 0.5],
      ['burst', 'Radiant mandorla', 'brand', { rays: 48, layers: 2, bend: 0.1, beads: 0.3, origin: 'centre' }, 0.4],
      ['modulargrid', 'Ashlar bays', 'mono', { cols: 6, style: 'line', merge: 0.4, gap: 0.6, empty: 0.2 }, 0.45],
      ['pixelquilt', 'Leaded panes', 'brand', { px: 1.2, block: 8, motifs: 'geometric', big: 0.1 }, 0.55],
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
      ['neonspray', 'Neon spray', 'brand', { streaks: 12, pastel: 0.1, bleed: 1.1, spray: 0.7 }],
      ['oprings', 'Vibrating rings', 'brand', { mode: 'lens', centres: 2, freq: 24, warp: 0.6, bands: 'two' }],
      ['ribbonrise', 'Ticket tabs', 'brand', { edge: 'bottom', bar: 1.8, bands: 5, shift: 0.2, ring: true }],
      ['thermal', 'Heat melt', 'brand', { bands: 6, cell: 1.2, turb: 1.6, shape: 'mixed', flat: false }],
    ],
    'cybersigilism': [
      ['rods', 'Thorn rods', 'mono', { density: 1.1, thick: 0.6, length: 4.5, fork: 0.7, slip: 0.4, second: 'ink2' }, 0.6],
      ['flow', 'Silver filaments', 'mono', { field: 'swirl', strands: 3, gap: 1.8, bend: 1.6, weight: 0.6 }, 0.55],
      ['seafan', 'Mirrored fans', 'mono', { fans: 2, branch: 1.2, ribs: false, screen: 0.2, lobes: 2 }, 0.6],
      ['blades', 'Fine blades', 'mono', { count: 260, size: 0.9, curve: 0.6, take: 0.6, ink: 'ink2' }, 0.6],
      ['stipple', 'Silver dust', 'mono', { density: 0.7, dot: 0.7, layout: 'random', mirror: 'none', field: 'clouds', duo: false }, 0.5],
      ['glyphgrid', 'Etched marks', 'mono', { glyphs: 'crosses', cell: 5, bands: 3, duo: false }, 0.5],
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
      ['rods', 'Vertebral rods', 'mono', { density: 1.3, thick: 1.1, length: 3.5, fork: 0.3, slip: 0.2, second: 'deep' }, 0.45],
      ['seafan', 'Rib lattice', 'mono', { fans: 2, branch: 1, ribs: true, screen: 0.5, lobes: 3 }, 0.5],
      ['tissue', 'Cast membrane', 'mono', { cell: 12, loose: 0.5, levels: 4, veins: 0.5, wall: 0.8 }, 0.45],
      ['colony', 'Spore colony', 'mono', { cells: 40, rings: 3, fuse: 1.2, finish: 'film', nuclei: true }, 0.45],
      ['waves', 'Tubing runs', 'mono', { rows: 6, crests: 3, curl: 1.4, strands: 10, drops: 0 }, 0.45],
      ['relief', 'Bone relief', 'mono', { cols: 4, traces: 4, blocks: 4, trace: 0.9 }, 0.5],
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
