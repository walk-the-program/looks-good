/* ---------------------------------------------------------------------
   patterns/fit.js — aesthetic fit: six tuned patterns for each of the 26
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
                 liquid-glass 0.6 (Aura 1), blueprint 0.55 (all mono). Pass entry.params
                 (or params + { tone }) to Patterns.render / renderSVG / tileCSS.
     Patterns.suiteKeys()            -> every aesthetic key that has a suite

   Each entry is [family, name, colorway, params, tone?] (tone defaults to 1). Nothing here invents a
   colour: the colorway only chooses how the brand roles map to inks.
------------------------------------------------------------------------ */
(function (global) {
  'use strict';
  const P = global.Patterns;

  const FIT = {
    'soft-form': [
      ['aura', 'Quiet glow', 'brand', { layout: 'horizon', blobs: 4, strength: 0.6, soft: 1, grain: 0.22 }, 0.45],
      ['gradpanes', 'Pressed panes', 'brand', { rows: 3, cols: 3, gap: 1.4, radius: 3.4, steps: 0, grain: 0.12 }, 0.45],
      ['halftone', 'Soft screen', 'duotone', { cell: 1.35, levels: 4, shape: 'round', field: 'clouds', duo: false }, 0.45],
      ['gradpanes', 'Long panes', 'brand', { rows: 2, cols: 4, gap: 1.4, radius: 3.4, steps: 0, grain: 0.12 }, 0.45],
      ['stipple', 'Fine stipple', 'duotone', { density: 1.1, dot: 0.9, duo: false, field: 'warp' }, 0.45],
      ['glyphgrid', 'Dot matrix', 'duotone', { glyphs: 'shapes', cell: 3.8, bands: 5, duo: false }, 0.45],
    ],
    'raw-brutalist': [
      ['modulargrid', 'Slab grid', 'mono', { cols: 7, merge: 0.8, gap: 0, empty: 0.12 }],
      ['counterchange', 'Hard counter', 'mono', { figure: 'square', bar: 5, dir: 'v', size: 0.6, nest: 2, second: false }],
      ['zigzag', 'Stair teeth', 'mono', { style: 'stair', colors: 'two', band: 8, amp: 4, period: 11, phase: 'parallel', grain: 0.2 }],
      ['signal', 'Static', 'mono', { px: 0.8, bands: 18, noise: 0.5 }],
      ['weave', 'Tape rows', 'mono', { rhythm: 'even', skew: 0, bands: 7, gap: 0.5 }],
      ['glyphgrid', 'Block field', 'mono', { glyphs: 'blocks', cell: 4.2, bands: 5, duo: false }],
    ],
    'neo-brutal-pop': [
      ['arcrise', 'Sticker sunrise', 'brand', { origin: 'bottom', bands: 5, bars: false, suns: 1 }],
      ['modulargrid', 'Pop blocks', 'brand', { cols: 6, merge: 0.9, gap: 0.9, empty: 0.1 }],
      ['zigzag', 'Chunky zig', 'brand', { style: 'chevron', colors: 'three', band: 9, amp: 6, period: 14, phase: 'parallel' }],
      ['counterchange', 'Arch bars', 'brand', { figure: 'arch', bar: 4.4, dir: 'v', size: 0.7, nest: 1 }],
      ['pixelquilt', 'Sticker quilt', 'brand', { px: 1.3, block: 6, motifs: 'geometric', big: 0.2 }],
      ['halftone', 'Big dots', 'brand', { cell: 3.4, levels: 3, shape: 'round', field: 'clouds', duo: true }],
    ],
    'retro-futurist': [
      ['flow', 'Orbit lines', 'brand', { field: 'swirl', strands: 5, gap: 2.2, bend: 0.8 }],
      ['oprings', 'Scope rings', 'brand', { mode: 'lens', centres: 2, freq: 16, warp: 0.05, bands: 'two' }],
      ['halftone', 'Ring screen', 'brand', { cell: 2, levels: 4, shape: 'ring', angle: 0, field: 'ridges', duo: false }],
      ['glyphgrid', 'Console marks', 'brand', { glyphs: 'crosses', cell: 3.6, bands: 5, duo: true }],
      ['signal', 'Telemetry', 'brand', { px: 0.55, bands: 24, noise: 0.5, blank: 0.14 }],
      ['typeterrain', 'Readout', 'brand', { charset: 'code', style: 'hills', size: 1.3 }],
    ],
    'liquid-glass': [
      ['aura', 'Glass light', 'brand', { layout: 'scatter', blobs: 6, strength: 0.95, soft: 0.9, grain: 0.18 }, 1],
      ['flow', 'Refraction', 'duotone', { field: 'waves', strands: 3, gap: 3, bend: 1.3, weight: 0.8 }, 0.6],
      ['gradpanes', 'Glass panes', 'brand', { rows: 3, cols: 3, gap: 1.2, radius: 4, steps: 0, grain: 0.1 }, 0.6],
      ['flow', 'Currents', 'duotone', { field: 'waves', strands: 6, gap: 2.4, bend: 0.9, weight: 0.9 }, 0.6],
      ['halftone', 'Bubble screen', 'brand', { cell: 2.4, levels: 5, shape: 'ring', field: 'clouds', duo: true }, 0.6],
      ['stipple', 'Dew', 'duotone', { density: 0.9, dot: 1.1, field: 'warp', duo: false }, 0.6],
    ],
    'holo-iridescent': [
      ['aura', 'Spectral haze', 'brand', { layout: 'ribbon', blobs: 7, strength: 0.9, soft: 0.85, mode: 'glow' }],
      ['flow', 'Light threads', 'brand', { field: 'flow', strands: 7, gap: 1.6, bend: 1.1, weight: 0.8 }],
      ['aura', 'Prism bands', 'brand', { layout: 'ribbon', blobs: 9, strength: 0.9, soft: 0.45, mode: 'paint' }],
      ['gradpanes', 'Foil strips', 'brand', { rows: 5, cols: 4, gap: 0.5, steps: 7, radius: 0 }],
      ['halftone', 'Ring screen', 'brand', { cell: 1.6, levels: 5, shape: 'ring', field: 'warp', duo: true }],
      ['stipple', 'Star dust', 'brand', { density: 1.2, dot: 0.8, field: 'clouds', duo: true }],
    ],
    'aurora-noir': [
      ['flow', 'Filaments', 'brand', { field: 'flow', strands: 5, gap: 2.4, bend: 0.8, weight: 0.8 }, 0.35],
      ['aura', 'Faint aura', 'brand', { layout: 'ribbon', blobs: 4, strength: 0.55, soft: 1, mode: 'glow', grain: 0.3 }, 0.35],
      ['modulargrid', 'Hairline grid', 'brand', { cols: 9, style: 'line', merge: 0.5, gap: 0.8, empty: 0.3 }, 0.35],
      ['stipple', 'Night dust', 'brand', { density: 1, dot: 0.8, field: 'warp', duo: true }, 0.35],
      ['glyphgrid', 'Cross marks', 'brand', { glyphs: 'crosses', cell: 3.4, bands: 4, duo: false }, 0.35],
      ['halftone', 'Fine screen', 'brand', { cell: 1.2, levels: 4, shape: 'round', field: 'clouds', duo: false }, 0.25],
    ],
    'bauhaus-poster': [
      ['counterchange', 'Counterchange', 'brand', { figure: 'circle', bar: 3.6, dir: 'v', size: 0.66, nest: 2, second: true }],
      ['arcrise', 'Arc rise', 'brand', { origin: 'bottom', bands: 6, bars: true, suns: 1, bar: 3.2 }],
      ['modulargrid', 'Modular grid', 'brand', { cols: 8, merge: 0.6, gap: 0, empty: 0.1 }],
      ['chevron', 'Chevron', 'brand', { bands: 7, slope: 45, mirror: 'quad', rhythm: 'even', colors: 'four' }],
      ['oprings', 'Target', 'brand', { mode: 'rings', centres: 1, freq: 16, warp: 0, bands: 'two' }],
      ['glyphgrid', 'Marks', 'brand', { glyphs: 'geometric', cell: 4, bands: 5, duo: true }],
    ],
    'clay': [
      ['aura', 'Soft lumps', 'brand', { layout: 'scatter', blobs: 5, strength: 0.85, soft: 0.8, grain: 0.14 }],
      ['gradpanes', 'Pillow panes', 'brand', { rows: 3, cols: 3, gap: 1.6, radius: 4, steps: 0, grain: 0.1 }],
      ['stipple', 'Fingerprints', 'brand', { density: 1.1, dot: 1.2, field: 'warp', duo: true }],
      ['halftone', 'Soft dots', 'brand', { cell: 2.6, levels: 4, shape: 'round', field: 'warp', duo: true, grain: 0.1 }],
      ['glyphgrid', 'Pebbles', 'brand', { glyphs: 'shapes', cell: 4.4, bands: 5, duo: true }],
      ['zigzag', 'Wave ribbons', 'brand', { style: 'rounded', colors: 'four', band: 8, amp: 4, period: 12, phase: 'parallel' }],
    ],
    'riso-print': [
      ['tornbands', 'Torn collage', 'brand', { bands: 7, tear: 1.1, tilt: -2.5, minis: 'mixed', shadow: 0.5 }],
      ['halftone', 'Riso halftone', 'brand', { cell: 1.9, levels: 5, shape: 'round', angle: 15, field: 'clouds', duo: true, grain: 0.3 }],
      ['stipple', 'Riso stipple', 'brand', { density: 1.1, dot: 1, field: 'warp', duo: true, grain: 0.28 }],
      ['counterchange', 'Off-register bars', 'brand', { figure: 'circle', bar: 3, dir: 'd', size: 0.6, nest: 2, grain: 0.3 }],
      ['zigzag', 'Zine zigzag', 'brand', { style: 'rounded', colors: 'three', band: 7, amp: 4.5, period: 10, phase: 'interlock', grain: 0.3 }],
      ['glyphgrid', 'Stamp marks', 'brand', { glyphs: 'geometric', cell: 3.6, bands: 5, duo: true, grain: 0.3 }],
    ],
    'editorial-serif': [
      ['stipple', 'Engraved stipple', 'mono', { density: 1.1, dot: 0.9, field: 'clouds', duo: false }],
      ['weave', 'Pinstripe', 'mono', { rhythm: 'pinstripe', skew: 0, bands: 9, gap: 0.3, stripe: 0.9 }],
      ['flow', 'Engraved lines', 'mono', { field: 'waves', strands: 5, gap: 2, bend: 0.8, weight: 0.8 }],
      ['halftone', 'Newsprint', 'mono', { cell: 1.2, levels: 5, shape: 'round', angle: 45, field: 'clouds', duo: false, grain: 0.22 }],
      ['modulargrid', 'Ruled grid', 'mono', { cols: 10, style: 'line', merge: 0.4, gap: 0.6, empty: 0.4 }],
      ['glyphgrid', 'Fleurons', 'mono', { glyphs: 'crosses', cell: 4, bands: 4, duo: false }],
    ],
    'neo-deco': [
      ['chevron', 'Gilt chevrons', 'brand', { bands: 8, slope: 52, mirror: 'quad', rhythm: 'even', colors: 'four' }],
      ['arcrise', 'Sunburst arcs', 'brand', { origin: 'bottom', bands: 9, bars: true, suns: 1, bar: 2.4 }],
      ['counterchange', 'Arch inlay', 'brand', { figure: 'arch', bar: 2.6, dir: 'v', size: 0.7, nest: 3, second: true }],
      ['zigzag', 'Stepped frieze', 'brand', { style: 'stair', colors: 'four', band: 6, amp: 4, period: 8, phase: 'interlock' }],
      ['modulargrid', 'Gilt lattice', 'brand', { cols: 10, style: 'line', merge: 0.3, gap: 0.5, empty: 0.2 }],
      ['glyphgrid', 'Diamonds', 'brand', { glyphs: 'geometric', cell: 3.6, bands: 5, duo: true }],
    ],
    'y2k-chrome': [
      ['gradpanes', 'Chrome strips', 'brand', { rows: 6, cols: 3, gap: 0.5, steps: 8, radius: 0 }],
      ['aura', 'Lens flare', 'brand', { layout: 'ribbon', blobs: 6, strength: 0.95, soft: 0.8, mode: 'glow' }],
      ['aura', 'Chrome haze', 'brand', { layout: 'ribbon', blobs: 10, strength: 0.8, soft: 0.35, mode: 'paint', grain: 0.2 }],
      ['flow', 'Swirl', 'brand', { field: 'swirl', strands: 6, gap: 2, bend: 0.9, weight: 0.9 }],
      ['halftone', 'Bubble screen', 'brand', { cell: 2.2, levels: 5, shape: 'ring', field: 'warp', duo: true }],
      ['glyphgrid', 'Sparkles', 'brand', { glyphs: 'shapes', cell: 3.8, bands: 5, duo: true }],
    ],
    'cyber-hud': [
      ['signal', 'Data glitch', 'brand', { px: 0.55, bands: 26, noise: 0.75, blank: 0.1 }],
      ['modulargrid', 'HUD grid', 'brand', { cols: 10, style: 'line', merge: 0.6, gap: 0.8, empty: 0.25 }],
      ['glyphgrid', 'Reticles', 'brand', { glyphs: 'crosses', cell: 3.2, bands: 5, duo: true }],
      ['typeterrain', 'Binary field', 'brand', { charset: 'binary', style: 'ridges', size: 1.3, levels: 6 }],
      ['halftone', 'Scan dots', 'brand', { cell: 1.5, levels: 4, shape: 'square', angle: 0, field: 'ridges', duo: true }],
      ['flow', 'Circuit flow', 'brand', { field: 'waves', strands: 3, gap: 2.4, bend: 1.4, weight: 1 }],
    ],
    'bento-grid': [
      ['modulargrid', 'Tile grid', 'brand', { cols: 6, merge: 1, gap: 1.6, empty: 0.12 }],
      ['gradpanes', 'Gradient tiles', 'brand', { rows: 3, cols: 3, gap: 1.6, radius: 3, steps: 0, grain: 0.1 }],
      ['glyphgrid', 'Block marks', 'brand', { glyphs: 'blocks', cell: 4.4, bands: 5, duo: true }],
      ['aura', 'Tile glow', 'brand', { layout: 'scatter', blobs: 5, strength: 0.85, soft: 0.8 }],
      ['halftone', 'Dot tiles', 'duotone', { cell: 2.2, levels: 4, shape: 'round', field: 'clouds', duo: false }],
      ['pixelquilt', 'Dither tiles', 'brand', { px: 1, block: 8, motifs: 'dither', big: 0.3 }],
    ],
    'mesh-gradient': [
      ['aura', 'Mesh wash', 'brand', { layout: 'scatter', blobs: 8, strength: 1, soft: 0.95, grain: 0.2 }],
      ['gradpanes', 'Ramp panes', 'brand', { rows: 3, cols: 3, gap: 0, steps: 0, radius: 0, grain: 0.18 }],
      ['halftone', 'Soft screen', 'brand', { cell: 2.4, levels: 5, shape: 'round', field: 'warp', duo: true }],
      ['stipple', 'Grain stipple', 'brand', { density: 1, dot: 1, field: 'warp', duo: true }],
      ['flow', 'Silk', 'brand', { field: 'waves', strands: 7, gap: 2, bend: 0.9, weight: 0.8 }],
      ['aura', 'Ribbon wash', 'brand', { layout: 'ribbon', blobs: 6, strength: 0.9, soft: 0.6, grain: 0.2 }],
    ],
    'industrial-device': [
      ['modulargrid', 'Panel grid', 'mono', { cols: 9, merge: 0.6, gap: 0.5, empty: 0.2 }],
      ['glyphgrid', 'Key caps', 'mono', { glyphs: 'blocks', cell: 3.8, bands: 5, duo: true }],
      ['signal', 'Scanlines', 'mono', { px: 0.7, bands: 20, noise: 0.35, blank: 0.2 }],
      ['typeterrain', 'Label field', 'mono', { charset: 'dots', style: 'hills', size: 1.2 }],
      ['zigzag', 'Tread plate', 'mono', { style: 'stair', colors: 'two', band: 5, amp: 3, period: 7, phase: 'interlock' }],
      ['pixelquilt', 'Grille', 'brand', { px: 0.8, block: 8, motifs: 'geometric', big: 0.1 }],
    ],
    'pixel-arcade': [
      ['pixelquilt', 'Pixel quilt', 'brand', { px: 1, block: 8, motifs: 'all', big: 0.16 }],
      ['signal', 'Signal mosaic', 'brand', { px: 0.8, bands: 20, noise: 0.7, blank: 0.1 }],
      ['typeterrain', 'Type terrain', 'brand', { charset: 'ascii', style: 'hills', size: 1.9, levels: 6 }],
      ['terrain', 'Pixel terrain', 'brand', { levels: 6, pix: 0.7, dither: 0.7, style: 'islands' }],
      ['glyphgrid', 'Sprites', 'brand', { glyphs: 'blocks', cell: 3.6, bands: 5, duo: true }],
      ['zigzag', 'Step bands', 'brand', { style: 'stair', colors: 'four', band: 7, amp: 4, period: 8, phase: 'interlock' }],
    ],
    'groovy-70s': [
      ['arcrise', 'Rainbow rise', 'brand', { origin: 'bottom', bands: 9, bars: false, suns: 2 }],
      ['zigzag', 'Wavy stripes', 'brand', { style: 'rounded', colors: 'four', band: 7, amp: 5, period: 14, phase: 'parallel' }],
      ['oprings', 'Concentric', 'brand', { mode: 'rings', centres: 1, freq: 16, warp: 0.18, bands: 'two' }],
      ['flow', 'Smoke', 'brand', { field: 'waves', strands: 6, gap: 2.2, bend: 1, weight: 1.2 }],
      ['halftone', 'Big dots', 'brand', { cell: 3, levels: 4, shape: 'round', field: 'warp', duo: true, grain: 0.25 }],
      ['aura', 'Sunset', 'brand', { layout: 'horizon', blobs: 5, strength: 0.95, soft: 0.8, grain: 0.35 }],
    ],
    'blueprint': [
      ['modulargrid', 'Drafting grid', 'mono', { cols: 10, style: 'line', merge: 0.5, gap: 0.6, empty: 0.3 }, 0.55],
      ['flow', 'Contour lines', 'mono', { field: 'flow', strands: 3, gap: 2.6, bend: 0.8, weight: 0.8 }, 0.55],
      ['glyphgrid', 'Survey marks', 'mono', { glyphs: 'crosses', cell: 3.6, bands: 4, duo: false }, 0.55],
      ['flow', 'Elevation', 'mono', { field: 'swirl', strands: 1, gap: 2.2, bend: 0.6, weight: 0.8 }, 0.55],
      ['stipple', 'Plot points', 'mono', { density: 0.9, dot: 1.2, layout: 'lattice', field: 'clouds', duo: false }, 0.55],
      ['halftone', 'Ring screen', 'mono', { cell: 1.9, levels: 4, shape: 'ring', field: 'ridges', duo: false }, 0.55],
    ],
    'blob-tracking': [
      ['terrain', 'Dithered footage', 'mono', { levels: 5, pix: 0.6, dither: 1, style: 'hills' }],
      ['stipple', 'Detection field', 'brand', { density: 1, dot: 0.8, field: 'warp', duo: true }],
      ['signal', 'Dropout', 'mono', { px: 0.6, bands: 22, noise: 0.6, blank: 0.2 }],
      ['glyphgrid', 'Crosshairs', 'brand', { glyphs: 'crosses', cell: 3.4, bands: 5, duo: false }],
      ['halftone', 'Screen', 'mono', { cell: 1.5, levels: 4, shape: 'round', field: 'clouds', duo: false }],
      ['flow', 'Motion trails', 'brand', { field: 'flow', strands: 3, gap: 2.8, bend: 0.7, weight: 0.9 }],
    ],
    'xerox': [
      ['halftone', 'Threshold dots', 'mono', { cell: 2.4, levels: 2, shape: 'round', angle: 45, field: 'clouds', duo: false, grain: 0.35 }],
      ['stipple', 'Toner stipple', 'mono', { density: 1.2, dot: 1, field: 'ridges', duo: false, grain: 0.3 }],
      ['signal', 'Copy glitch', 'mono', { px: 0.7, bands: 22, noise: 0.7, blank: 0.12, grain: 0.35 }],
      ['tornbands', 'Pasted strips', 'mono', { bands: 6, tear: 1.3, tilt: -1.5, minis: 'stripes', shadow: 0.3 }],
      ['terrain', 'Threshold terrain', 'mono', { levels: 3, pix: 0.8, dither: 0.9, style: 'ridges' }],
      ['typeterrain', 'Typewritten', 'mono', { charset: 'ascii', style: 'warp', size: 1.5 }],
    ],
    'micrographics': [
      ['glyphgrid', 'Micro marks', 'mono', { glyphs: 'crosses', cell: 2.6, bands: 5, duo: false }],
      ['modulargrid', 'Spec grid', 'mono', { cols: 12, style: 'line', merge: 0.4, gap: 0.4, empty: 0.4 }],
      ['typeterrain', 'Micro type', 'mono', { charset: 'code', style: 'hills', size: 0.9, levels: 6 }],
      ['stipple', 'Registration dots', 'mono', { density: 0.8, dot: 0.7, layout: 'lattice', field: 'clouds', duo: false }],
      ['weave', 'Hairline stripes', 'mono', { rhythm: 'pinstripe', skew: 0, bands: 12, gap: 0.4, stripe: 0.7 }],
      ['signal', 'Barcode field', 'mono', { px: 0.5, bands: 28, noise: 0.3, blank: 0.3 }],
    ],
    'mixed-type': [
      ['typeterrain', 'Mixed type', 'brand', { charset: 'dots', style: 'warp', size: 1.6 }],
      ['tornbands', 'Cut-ups', 'brand', { bands: 6, tear: 0.9, tilt: 1.5, minis: 'mixed', shadow: 0.4 }],
      ['zigzag', 'Zig bands', 'brand', { style: 'chevron', colors: 'three', band: 8, amp: 4.5, period: 10, phase: 'parallel' }],
      ['glyphgrid', 'Glyphs', 'brand', { glyphs: 'shapes', cell: 4, bands: 5, duo: true }],
      ['weave', 'Ribbons', 'brand', { rhythm: 'mixed', skew: 0, bands: 7, gap: 0.5 }],
      ['halftone', 'Screen', 'brand', { cell: 2.2, levels: 4, shape: 'round', field: 'warp', duo: true }],
    ],
    'ascii-art': [
      ['typeterrain', 'ASCII terrain', 'brand', { charset: 'ascii', style: 'warp', size: 1.9, levels: 8 }],
      ['typeterrain', 'Dot map', 'brand', { charset: 'dots', style: 'hills', size: 1.7, levels: 7 }],
      ['typeterrain', 'Code ridge', 'brand', { charset: 'code', style: 'ridges', size: 1.8, levels: 6 }],
      ['glyphgrid', 'Cursor field', 'brand', { glyphs: 'crosses', cell: 3.2, bands: 5, duo: true }],
      ['signal', 'Line noise', 'brand', { px: 0.55, bands: 24, noise: 0.6, blank: 0.2 }],
      ['terrain', 'Density map', 'mono', { levels: 5, pix: 0.6, dither: 0.8, style: 'hills' }],
    ],
    'rebus': [
      ['glyphgrid', 'Pictogram field', 'brand', { glyphs: 'shapes', cell: 5, bands: 5, duo: true }],
      ['modulargrid', 'Picture tiles', 'brand', { cols: 6, merge: 0.5, gap: 1.2, empty: 0.15 }],
      ['arcrise', 'Rising sun', 'brand', { origin: 'bottom', bands: 5, bars: false, suns: 1 }],
      ['counterchange', 'Eye', 'brand', { figure: 'circle', bar: 4.4, dir: 'h', size: 0.6, nest: 2, second: true }],
      ['zigzag', 'Water', 'brand', { style: 'rounded', colors: 'two', band: 8, amp: 4, period: 12, phase: 'parallel' }],
      ['pixelquilt', 'Rebus quilt', 'brand', { px: 1.2, block: 6, motifs: 'geometric', big: 0.2 }],
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
