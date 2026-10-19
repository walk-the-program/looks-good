/* ---------------------------------------------------------------------
   patterns/fit.js — aesthetic fit: six tuned patterns for each of the 35
   aesthetics (keys match js/aesthetics/*.js).

     Patterns.suiteFor(aestheticKey) -> [{ key, name, colorway, params, tone }]
       key       pattern family key
       name      short display name for the suite wall
       colorway  'brand' | 'mono' | 'duotone' | 'night', or a FIXED colourway from
                 engine.js E.COLORWAYS: 'tonal' (soft-form), 'spectrum' (holo-iridescent),
                 'primaries' (bauhaus-poster), 'broadcast' (pirate-broadcast),
                 'safety' (hazard tape in micrographics), 'hud' (cyber-hud Data slabs), 'toner' (all of xerox)
       params    overrides on top of the family defaults (render() fills the rest);
                 includes params.tone, equal to entry.tone
       tone      number 0..1, default 1. Lower = quieter: ink contrast/saturation moves
                 toward the ground and the spark shrinks (see engine.js, "Tone"). Quiet
                 suites: aurora-noir 0.35-0.5, liquid-glass 0.5-0.6 (Glass light 1), blueprint
                 0.55 (all mono), dystopian-luxury 0.3-0.45, japanese-minimal 0.3-0.4,
                 retro-futurist 0.6-0.8, cyber-hud 0.55-0.7; soft-form is
                 tonal at full tone with two quiet mono entries (0.2); single entries are softened
                 in clay (0.85), editorial-serif (0.6-0.75), frutiger-aero (0.55-0.8),
                 micrographics (0.7), and a few others. Pass entry.params
                 (or params + { tone }) to Patterns.render / renderSVG / tileCSS.
     Patterns.suiteKeys()            -> every aesthetic key that has a suite

   Each entry is [family, name, colorway, params, tone?] (tone defaults to 1). A suite never repeats a
   family. The FIRST entry of a suite drives the deck's cover band and closing strip
   (js/patterns-deck.js leadEntry), so lead with a pattern that is safe at that size and obeys the
   aesthetic's own rule (no hazard stripes, targets, reef colour or noise band on a cover).
   GLOBAL LEAD OWNERSHIP (round 6): no two suites that render a deck cover band or closing strip
   share a first family, so every deck cover reads as its own aesthetic. Exempt (both deck.coverBand
   and deck.closingStrip false, lead seen only on the Patterns slide): liquid-glass, holo-iridescent,
   aurora-noir. The ownership table is in docs/patterns.md, "Round 6 suite
   ownership"; change a lead only by taking a family no band/strip aesthetic leads with (halftone, terrain, arcrise, cutup, burst, neonspray, bloomgrid, kaleidopix, prismpix, totem, colony, seafan, marble, thermalstreak, waves, snow, panels, flyposter, festival, blades, rods) or by
   swapping with its owner. Nothing here invents a colour except the fixed
   colourways above, which are documented exceptions: otherwise the colorway only chooses how the
   brand roles map to inks.
------------------------------------------------------------------------ */
(function (global) {
  'use strict';
  const P = global.Patterns;

  const FIT = {
    'soft-form': [
      ['tissue', 'Quilted cells', 'tonal', { cell: 14, loose: 0.5, levels: 4, veins: 0, wall: 0.4 }],
      ['chevron', 'Pressed facets', 'mono', { bands: 7, slope: 30, mirror: 'quad', rhythm: 'even', colors: 'three' }, 0.2],
      ['pebbles', 'River stones', 'tonal', { size: 1.2, gap: 0.8, erode: 0.35, mode: 'crumble', lit: 0 }],
      ['gradpanes', 'Pressed panes', 'tonal', { rows: 3, cols: 4, gap: 1.6, radius: 3.4, steps: 0, grain: 0.12 }],
      ['modulargrid', 'Bauhaus forms', 'tonal', { cols: 6, style: 'filled', merge: 0.6, gap: 1.2, empty: 0.1 }],
      ['oprings', 'Ripples', 'mono', { mode: 'rings', centres: 2, freq: 10, warp: 0, bands: 'two' }, 0.2],
    ],
    'raw-brutalist': [
      ['glyphgrid', 'Block field', 'mono', { glyphs: 'blocks', cell: 4.2, bands: 5, duo: false }],
      ['modulargrid', 'Slab grid', 'mono', { cols: 7, merge: 0.8, gap: 0, empty: 0.12 }],
      ['counterchange', 'Hard counter', 'mono', { figure: 'square', bar: 5, dir: 'v', size: 0.6, nest: 2, second: false }],
      ['zigzag', 'Stair teeth', 'mono', { style: 'stair', colors: 'two', band: 8, amp: 4, period: 11, phase: 'parallel', grain: 0.2 }],
      ['onebit', 'Hard crush', 'mono', { zones: 5, pixel: 1.4, dither: 'threshold', pair: 'ink1', glitch: 0.3 }],
      ['panels', 'Slab panels', 'mono', { depth: 4, gutter: 0.3, pitch: 1.1, flat: 0.45, frame: true }],
    ],
    'neo-brutal-pop': [
      ['tokens', 'Chunky capsules', 'brand', { cell: 10, link: 0.3, density: 1, fill: 'mixed', grain: 0 }],
      ['halftone', 'Big dots', 'duotone', { cell: 4, levels: 3, shape: 'round', field: 'clouds', duo: true }],
      ['tornbands', 'Torn stickers', 'brand', { bands: 6, tear: 0.8, tilt: -3, minis: 'mixed', shadow: 1 }],
      ['cutup', 'Cut-out sheets', 'brand', { pieces: 4, cell: 2, hills: 0.5, slip: 0.4 }],
      ['kaleidopix', 'Sticker sheet', 'brand', { px: 2.2, patches: 1.2, fold: 'quad' }],
      ['pixelquilt', 'Pixel quilt', 'brand', { px: 1.2, block: 6, motifs: 'geometric', big: 0.3 }],
    ],
    'retro-futurist': [
      ['gradpanes', 'Horizon', 'mono', { rows: 4, cols: 2, steps: 10, gap: 0.4, radius: 0 }, 0.8],
      ['flow', 'Trajectories', 'mono', { field: 'swirl', strands: 2, gap: 3.2, bend: 0.6, weight: 0.5 }, 0.6],
      ['halftone', 'Ring screen', 'mono', { cell: 2, levels: 4, shape: 'ring', angle: 0, field: 'ridges', duo: false }, 0.6],
      ['modulargrid', 'Standards grid', 'mono', { cols: 12, style: 'line' }, 0.6],
      ['glyphgrid', 'Registration marks', 'mono', { glyphs: 'crosses', cell: 5, bands: 3 }, 0.6],
      ['typeterrain', 'Readout', 'mono', { charset: 'code', style: 'hills', size: 2 }, 0.8],
    ],
    'liquid-glass': [
      ['counterchange', 'Lens bars', 'mono', { figure: 'circle', bar: 2.2, dir: 'v', size: 0.75, nest: 1, second: false }, 0.6],
      ['warpcheck', 'Lens grid', 'mono', { pattern: 'check', warp: 'bulge', cells: 22, amp: 0.45, second: false }, 0.6],
      ['aura', 'Glass light', 'brand', { layout: 'scatter', blobs: 6, strength: 0.95, soft: 0.9, grain: 0.18 }, 1],
      ['weave', 'Reeded glass', 'mono', { bands: 3, rhythm: 'even', skew: 0, gap: 0.5, stripe: 0.6 }, 0.6],
      ['burst', 'Caustics', 'mono', { rays: 64, layers: 2, bend: 0.6, beads: 0, origin: 'corner' }, 0.6],
      ['colony', 'Droplets', 'mono', { cells: 22, rings: 2, fuse: 0.8, finish: 'film', nuclei: false }, 0.5],
    ],
    'holo-iridescent': [
      ['oprings', 'Interference', 'spectrum', { mode: 'saddle', centres: 1, freq: 36, warp: 0, bands: 'three' }, 0.75],
      ['aura', 'Spectral haze', 'spectrum', { layout: 'ribbon', blobs: 7, strength: 1, soft: 0.85, mode: 'paint' }],
      ['specimens', 'Foil swatches', 'spectrum', { cols: 4, gap: 0.8, round: 2, study: 'fans', line: 1 }],
      ['burst', 'Prism rays', 'spectrum', { rays: 96, layers: 1, bend: 0.3, beads: 0.2, origin: 'low' }],
      ['weave', 'Lamination', 'spectrum', { bands: 12, rhythm: 'pinstripe', skew: 0.3, gap: 0.2, stripe: 1 }],
      ['stipple', 'Pearl dust', 'spectrum', { density: 0.9, dot: 0.7, layout: 'random', mirror: 'none', field: 'clouds', duo: true }],
    ],
    'aurora-noir': [
      ['typeterrain', 'Readout', 'mono', { charset: 'code', style: 'hills', size: 1.2 }, 0.45],
      ['burst', 'Beam', 'mono', { rays: 24, layers: 1, bend: 0, beads: 0, origin: 'corner' }, 0.5],
      ['signal', 'Packet log', 'mono', { px: 0.6, bands: 18, noise: 0.3, blank: 0.25 }, 0.4],
      ['weave', 'Scanlines', 'mono', { bands: 16, rhythm: 'pinstripe', skew: 0, gap: 0, stripe: 0.5 }, 0.35],
      ['panels', 'Windows', 'mono', { depth: 5, gutter: 0.4, pitch: 0.8, flat: 0.6, frame: true }, 0.35],
      ['relief', 'Traces', 'mono', { cols: 4, traces: 9, blocks: 2, trace: 0.6 }, 0.35],
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
      ['zigzag', 'Wave ribbons', 'brand', { style: 'rounded', colors: 'four', band: 8, amp: 4, period: 12, phase: 'parallel' }],
      ['aura', 'Soft lumps', 'brand', { layout: 'scatter', blobs: 5, strength: 0.85, soft: 0.8, grain: 0.14 }],
      ['gradpanes', 'Pillow panes', 'brand', { rows: 3, cols: 3, gap: 1.6, radius: 4, steps: 0, grain: 0.1 }],
      ['specimens', 'Glazed tiles', 'brand', { cols: 3, gap: 1.6, round: 3, study: 'marbling', line: 1.2 }, 0.85],
      ['pebbles', 'Pebbles', 'brand', { size: 1.3, gap: 0.6, erode: 0.3, mode: 'halftone', lit: 0.6 }, 0.85],
      ['stipple', 'Fingerprints', 'brand', { density: 1.1, dot: 1.2, field: 'warp', duo: true }],
    ],
    'riso-print': [
      ['inkstill', 'Riso still life', 'brand', { px: 0.8, masses: 4, vessels: 2, dither: 2, marks: true }],
      ['tornbands', 'Torn collage', 'brand', { bands: 7, tear: 1.1, tilt: -2.5, minis: 'mixed', shadow: 0.5 }],
      ['cutup', 'Cut-up hills', 'brand', { pieces: 5, cell: 1.5, hills: 1, slip: 0.55 }],
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
    'cyber-hud': [
      ['satellite', 'Corrupt feed', 'brand', { mosaic: 0.8, block: 1.5, bars: 0.5, slices: 3, tear: 0.5 }],
      ['signal', 'Data glitch', 'brand', { px: 0.55, bands: 26, noise: 0.75, blank: 0.1 }],
      ['modulargrid', 'HUD grid', 'brand', { cols: 10, style: 'line', merge: 0.6, gap: 0.8, empty: 0.25 }],
      ['slipgrid', 'Slipped feed', 'brand', { cell: 2.5, slip: 0.6, streak: 1.2, gutter: 0.12, scatter: 0.4 }],
      ['onebit', 'One-bit scan', 'brand', { zones: 6, pixel: 0.9, dither: 'bayer', pair: 'ink1', glitch: 0.5 }],
      ['typeterrain', 'Binary field', 'brand', { charset: 'binary', style: 'ridges', size: 1.3, levels: 6 }],
    ],
    'bento-grid': [
      ['modulargrid', 'Tile grid', 'brand', { cols: 8, merge: 1, gap: 1.6, empty: 0 }],
      ['parcels', 'Block parcels', 'brand', { cell: 1.6, size: 1.35, every: 8, labels: false }],
      ['colony', 'Rendered cells', 'brand', { cells: 20, rings: 3, fuse: 1.1, finish: 'film', nuclei: false }],
      ['prismpix', 'Pixel streams', 'brand', { px: 1.6, streams: 3, glow: 0.8, dots: true }],
      ['thermal', 'Heat tiles', 'brand', { bands: 4, cell: 1.6, turb: 0.6, shape: 'round', flat: true }],
      ['sonar', 'Product map', 'brand', { land: 0.45, size: 1, speckle: 0.4, contours: true }],
    ],
    'mesh-gradient': [
      ['flow', 'Silk', 'brand', { field: 'waves', strands: 3, gap: 2.6, bend: 1, weight: 2 }],
      ['waves', 'Combed silk', 'brand', { rows: 3, crests: 1.5, curl: 0.6, strands: 16, drops: 0 }],
      ['ribbonrise', 'Striations', 'brand', { edge: 'left', bar: 0.8, bands: 3, shift: 0.3, ring: false }],
      ['sonar', 'Contours', 'brand', { land: 0.25, size: 1.4, speckle: 0, contours: true }],
      ['gradpanes', 'Ramp panes', 'brand', { rows: 3, cols: 3, gap: 0, steps: 0, radius: 0, grain: 0.18 }],
      ['stipple', 'Fine grain', 'brand', { density: 0.7, dot: 0.6, layout: 'random', mirror: 'none', field: 'ridges', duo: true }],
    ],
    'industrial-device': [
      ['relief', 'Routed board', 'mono', { cols: 4, traces: 7, blocks: 4, trace: 1 }],
      ['halftone', 'Speaker grille', 'mono', { cell: 2.2, levels: 2, shape: 'round', angle: 0, field: 'ridges', duo: false, scale: 0.6 }],
      ['weave', 'Keybed', 'mono', { bands: 3, rhythm: 'pinstripe', skew: 0, gap: 0.5, stripe: 1.6 }],
      ['glyphgrid', 'Key caps', 'mono', { glyphs: 'blocks', cell: 3.8, bands: 5, duo: true }],
      ['tokens', 'Indicator lamps', 'mono', { cell: 5, link: 0.3, density: 0.6, fill: 'open' }],
      ['specimens', 'CMF chips', 'brand', { cols: 4, gap: 1, round: 0.4, study: 'mixed', line: 0.8 }],
    ],
    'pixel-arcade': [
      ['pixelquilt', 'Pixel quilt', 'brand', { px: 1, block: 8, motifs: 'all', big: 0.16 }],
      ['prismpix', 'Pixel aurora', 'brand', { px: 1.7, streams: 4, glow: 1, dots: true }],
      ['totem', 'Pixel totem', 'brand', { px: 1.4, panel: 0.56, band: 5, frame: 2 }],
      ['bloomgrid', 'Pixel bloom', 'brand', { px: 3, levels: 4, rings: 4, calm: 0.5, dither: false }],
      ['kaleidopix', 'Kaleidoscope', 'brand', { px: 1.8, patches: 1, fold: 'quad' }],
      ['terrain', 'Pixel terrain', 'brand', { levels: 6, pix: 0.7, dither: 0.7, style: 'islands' }],
    ],
    'blueprint': [
      ['weave', 'Section hatch', 'mono', { bands: 3, rhythm: 'pinstripe', skew: 1, gap: 0, stripe: 0.6, spark: false }, 0.55],
      ['glyphgrid', 'Survey marks', 'mono', { glyphs: 'crosses', cell: 3.6, bands: 4, duo: false }, 0.55],
      ['tokens', 'Node chains', 'mono', { cell: 5.4, link: 0.6, density: 0.6, fill: 'open' }, 0.55],
      ['relief', 'Routed traces', 'mono', { cols: 4, traces: 9, blocks: 3, trace: 0.8 }, 0.55],
      ['rods', 'Wiring', 'mono', { density: 1.2, thick: 0.7, length: 3.4, fork: 0.5, slip: 0.4, second: 'ground' }, 0.55],
      ['flow', 'Contour lines', 'mono', { field: 'flow', strands: 3, gap: 2.6, bend: 0.8, weight: 0.8 }, 0.55],
    ],
    'blob-tracking': [
      ['onebit', 'One-bit footage', 'mono', { zones: 6, pixel: 0.8, dither: 'bayer', pair: 'ink1', glitch: 0.1 }],
      ['terrain', 'Dithered footage', 'mono', { levels: 5, pix: 0.6, dither: 1, style: 'hills' }],
      ['signal', 'Dropout', 'mono', { px: 0.6, bands: 22, noise: 0.6, blank: 0.2 }],
      ['pixelgrid', 'Detection grid', 'mono', { mode: 'crosses', cell: 3, zones: 2, density: 0.4 }],
      ['parcels', 'Track IDs', 'mono', { cell: 2.2, size: 1.6, every: 4, labels: true }],
      ['glyphgrid', 'Crosshairs', 'mono', { glyphs: 'crosses', cell: 3.4, bands: 5, duo: false }],
    ],
    'xerox': [
      ['thermal', 'Toner heat', 'toner', { bands: 3, cell: 2.2, turb: 0.9, shape: 'round', flat: true }],
      ['halftone', 'Copied screen', 'toner', { cell: 3.2, levels: 2, shape: 'round', angle: 45, field: 'warp', duo: false, grain: 0.5 }],
      ['onebit', 'Toner crush', 'toner', { zones: 6, pixel: 1, dither: 'threshold', pair: 'ink1', glitch: 0.05 }],
      ['signal', 'Drum streaks', 'toner', { px: 0.6, bands: 22, noise: 0.45, blank: 0.3 }],
      ['stipple', 'Toner stipple', 'toner', { density: 1.2, dot: 1, field: 'ridges', duo: false, grain: 0.3 }],
      ['glyphgrid', 'Registration marks', 'toner', { glyphs: 'crosses', cell: 3.8, bands: 4, duo: false, grain: 0.3 }],
    ],
    'micrographics': [
      ['parcels', 'Parcel ticks', 'mono', { cell: 1.2, size: 1.2, every: 8, labels: true }, 0.7],
      ['signal', 'Barcode field', 'mono', { px: 0.5, bands: 28, noise: 0.3, blank: 0.3 }],
      ['relief', 'Micro board', 'mono', { cols: 5, traces: 10, blocks: 4, trace: 0.7 }],
      ['tokens', 'Micro tokens', 'mono', { cell: 4, link: 0.5, density: 0.7, fill: 'open' }],
      ['typeterrain', 'Micro type', 'mono', { charset: 'code', style: 'hills', size: 0.9, levels: 6 }],
      ['chevron', 'Hazard tape', 'safety', { bands: 10, slope: 45, mirror: 'x', rhythm: 'even', colors: 'two' }],
    ],
    'mixed-type': [
      ['specimens', 'Type specimens', 'brand', { cols: 4, gap: 1.1, round: 0, study: 'mixed', line: 1 }],
      ['typeterrain', 'Mixed type', 'brand', { charset: 'dots', style: 'warp', size: 1.6 }],
      ['flyposter', 'Fly-poster', 'brand', { stripe: 1.3, harden: 0.65, blocks: 5, marks: 2, angle: 18 }],
      ['tornbands', 'Cut-ups', 'brand', { bands: 6, tear: 0.9, tilt: 1.5, minis: 'mixed', shadow: 0.4 }],
      ['zigzag', 'Zig bands', 'brand', { style: 'chevron', colors: 'three', band: 8, amp: 4.5, period: 10, phase: 'parallel' }],
      ['glyphgrid', 'Glyphs', 'brand', { glyphs: 'shapes', cell: 4, bands: 5, duo: true }],
    ],
    'ascii-art': [
      ['typeterrain', 'ASCII terrain', 'brand', { charset: 'ascii', style: 'warp', size: 1.9, levels: 8 }],
      ['modulargrid', 'Line grid', 'mono', { cols: 10, style: 'line', merge: 0.3, gap: 0.2, empty: 0.35 }],
      ['glyphgrid', 'Block glyphs', 'brand', { glyphs: 'blocks', cell: 3.2, bands: 5, duo: true }],
      ['signal', 'Line noise', 'brand', { px: 0.55, bands: 24, noise: 0.6, blank: 0.2 }],
      ['terrain', 'Dither map', 'mono', { levels: 5, pix: 0.6, dither: 0.8, style: 'hills' }],
      ['pixelgrid', 'Cell field', 'duotone', { cell: 2.7, mode: 'crosses', zones: 5, density: 0.65, phase: 0 }],
    ],
    'corporate-vandalism': [
      ['signal', 'Redaction run', 'mono', { px: 0.9, bands: 14, noise: 0.25, blank: 0.35 }],
      ['warpcheck', 'Envelope tint', 'mono', { pattern: 'slash', warp: 'wave', cells: 40, amp: 0.1, waves: 1, second: false }, 0.5],
      ['chevron', 'Hazard stripe', 'mono', { bands: 12, slope: 45, mirror: 'x', rhythm: 'even', colors: 'two' }],
      ['pixelgrid', 'Perforation', 'mono', { cell: 3.6, mode: 'dots', zones: 2, density: 0.5, phase: 0 }],
      ['modulargrid', 'Form grid', 'mono', { cols: 8, style: 'line', merge: 0.2, gap: 0.5, empty: 0.2 }],
      ['parcels', 'Parcel labels', 'mono', { cell: 1.6, size: 1, every: 8, labels: true }],
    ],
    'xerox-punk': [
      ['tornbands', 'Wheatpaste layers', 'brand', { bands: 7, tear: 1.4, tilt: 2.5, minis: 'mixed', shadow: 0.6 }],
      ['patchwork', 'Ransom patches', 'brand', { cell: 7, layers: 36, ragged: 0.7, motif: 'mixed', dotgrid: false }],
      ['flyposter', 'Bill posting', 'mono', { stripe: 1.6, harden: 0.8, blocks: 4, marks: 2, angle: -12 }],
      ['cutup', 'Cut-up sheets', 'brand', { pieces: 5, cell: 1.6, hills: 1.2, slip: 0.6 }],
      ['halftone', 'Coarse screen', 'mono', { cell: 4, levels: 3, shape: 'square', angle: 20, field: 'warp', duo: false }],
      ['snow', 'Dead channel', 'duotone', { cols: 5, static: 0.9, stairs: 0, lenses: 0, marks: 0 }],
    ],
    'acid-graphics': [
      ['warpcheck', 'Warped check', 'brand', { pattern: 'check', warp: 'wave', cells: 24, amp: 0.8, waves: 3, second: true }],
      ['burst', 'Strobe rays', 'brand', { rays: 96, layers: 3, bend: 0.6, beads: 0.2, origin: 'corner' }],
      ['typeterrain', 'Stretched type', 'brand', { charset: 'code', style: 'warp', size: 2.4, levels: 8 }],
      ['oprings', 'Vibrating rings', 'brand', { mode: 'lens', centres: 2, freq: 24, warp: 0.6, bands: 'two' }],
      ['ribbonrise', 'Ticket tabs', 'brand', { edge: 'bottom', bar: 1.8, bands: 5, shift: 0.2, ring: true }],
      ['weave', 'Stretch ramp', 'brand', { bands: 12, rhythm: 'mixed', skew: 1, gap: 0.2, stripe: 1.5 }],
    ],
    'radical-memphis': [
      ['patchwork', 'Terrazzo', 'brand', { cell: 7, layers: 56, ragged: 0.6, motif: 'mixed', dotgrid: false }],
      ['festival', 'Bacterio', 'mono', { patches: 2, loops: 1, weight: 0.9, stars: 0, echo: false }],
      ['zigzag', 'Zig laminate', 'brand', { style: 'chevron', colors: 'four', band: 8, amp: 5, period: 12, phase: 'interlock' }],
      ['snow', 'Checker lenses', 'brand', { cols: 5, static: 0.2, stairs: 0.6, lenses: 0.7, marks: 0.7 }],
      ['blades', 'Shard terrazzo', 'brand', { count: 300, size: 0.8, curve: 0.4, take: 0.9, ink: 'ink1' }],
      ['sprigs', 'Du Pasquier sprigs', 'brand', { size: 1.1, line: 1.4, mix: 0.5, fills: 0.9, slip: 0.3 }],
    ],
    'pirate-broadcast': [
      ['pixelgrid', 'Sixel mosaic', 'broadcast', { mode: 'blocks', cell: 2, zones: 6 }],
      ['signal', 'Dead air', 'broadcast', { px: 0.6, bands: 14, noise: 0.35, blank: 0.3 }],
      ['gradpanes', 'Colour bars', 'broadcast', { rows: 2, cols: 7, steps: 0, gap: 0 }],
      ['typeterrain', 'Teletext hills', 'broadcast', { charset: 'code', size: 1.2, levels: 6, style: 'ridges' }],
      ['modulargrid', 'Character grid', 'mono', { style: 'line', cols: 16, merge: 0, empty: 0.6 }],
      ['glyphgrid', 'Mosaic glyphs', 'broadcast', { glyphs: 'blocks', cell: 3, bands: 3 }],
    ],
    'dystopian-luxury': [
      ['slipgrid', 'Archive drawers', 'mono', { cell: 4, slip: 0.9, streak: 1, gutter: 0, scatter: 0 }, 0.3],
      ['halftone', 'Clinical screen', 'mono', { cell: 1.2, levels: 4, shape: 'round', angle: 15, field: 'clouds', duo: false }, 0.45],
      ['stipple', 'Dust', 'mono', { density: 0.5, dot: 0.6, layout: 'random', mirror: 'none', field: 'clouds', duo: false }, 0.3],
      ['onebit', 'Photocopied label', 'mono', { zones: 3, pixel: 0.6, dither: 'threshold', pair: 'ink1', glitch: 0 }, 0.35],
      ['weave', 'Twill', 'mono', { rhythm: 'even', skew: 0.6, bands: 16, gap: 0.4, stripe: 0.5 }, 0.3],
      ['flow', 'Hairline drift', 'mono', { field: 'waves', strands: 3, gap: 3, bend: 0.4, weight: 0.5 }, 0.35],
    ],
    // Round 6 (37-48).
    'frutiger-aero': [
      ['aura', 'Sky glow', 'brand', { layout: 'horizon', blobs: 5, soft: 0.8, mode: 'paint', strength: 1 }],
      ['flow', 'Aurora swoosh', 'brand', { field: 'swirl', strands: 3, gap: 3, bend: 1.6, weight: 2 }],
      ['blades', 'Meadow', 'brand', { count: 420, size: 0.9, curve: 0.5, take: 0.7, ink: 'ink2' }],
      ['colony', 'Bubbles', 'duotone', { cells: 20, rings: 2, fuse: 0.8, finish: 'film', nuclei: false }, 0.55],
      ['waves', 'Rolling water', 'brand', { rows: 5, crests: 2, curl: 1.2, strands: 8, drops: 3 }, 0.8],
      ['burst', 'Sunrise', 'brand', { rays: 32, layers: 2, bend: 0.4, beads: 0, origin: 'low' }, 0.8],
    ],
    'naive-doodle': [
      ['sprigs', 'Marker garden', 'duotone', { size: 1.2, line: 1.4, mix: 0.6, fills: 0.7, slip: 0.8 }],
      ['zigzag', 'Wiggle lines', 'brand', { style: 'rounded', band: 6, amp: 3, period: 8, phase: 'drift', colors: 'three' }],
      ['festival', 'Scribble stars', 'brand', { patches: 4, loops: 0.9, weight: 1.6, stars: 3, echo: false }],
      ['blades', 'Grass tufts', 'brand', { count: 200, size: 1, curve: 0.6, take: 0, ink: 'ink1', grain: 0 }],
      ['tokens', 'Stickers', 'brand', { cell: 6, link: 0.2, density: 0.5, fill: 'mixed' }],
      ['patchwork', 'Doodle quilt', 'brand', { cell: 9, layers: 24, ragged: 0.9, motif: 'circles', dotgrid: false }],
    ],
    'japanese-minimal': [
      ['pebbles', 'Stepping stones', 'mono', { size: 1.5, gap: 1.8, erode: 0.6, mode: 'crumble', lit: 0.3 }, 0.35],
      ['counterchange', 'Shoji bars', 'mono', { figure: 'square', bar: 1.6, dir: 'v', size: 0.5, nest: 1, second: false }, 0.4],
      ['weave', 'Hairline weave', 'mono', { bands: 12, rhythm: 'pinstripe', skew: 0, gap: 0.6, stripe: 0.5, spark: false }, 0.35],
      ['stipple', 'Washi fibre', 'mono', { density: 0.5, dot: 0.5, layout: 'random', mirror: 'none', field: 'clouds', duo: false }, 0.35],
      ['modulargrid', 'Tatami rule', 'mono', { cols: 8, style: 'line' }, 0.3],
      ['gradpanes', 'Paper panes', 'tonal', { rows: 2, cols: 3, gap: 2.2, radius: 0, steps: 0, grain: 0.05 }, 0.3],
    ],
    'mid-century': [
      ['chevron', 'Girard chevrons', 'brand', { bands: 12, slope: 25, mirror: 'x', rhythm: 'varied', colors: 'three', grain: 0 }],
      ['burst', 'Atomic stars', 'brand', { rays: 24, layers: 1, bend: 0, beads: 1, origin: 'centre', grain: 0 }],
      ['oprings', 'Atomic rings', 'brand', { mode: 'rings', centres: 2, freq: 8, warp: 0, bands: 'three', grain: 0 }],
      ['counterchange', 'Girard diamonds', 'brand', { figure: 'diamond', bar: 3, dir: 'v', size: 0.6, nest: 2, second: true, grain: 0 }],
      ['zigzag', 'Rickrack', 'brand', { style: 'chevron', colors: 'three', band: 6, amp: 3, period: 10, phase: 'interlock', grain: 0 }],
      ['panels', 'Cut planes', 'brand', { depth: 3, gutter: 0.8, pitch: 1.3, flat: 0.6, frame: false, grain: 0 }],
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
      ['sonar', 'Lake map', 'mono', { land: 0.25, size: 2, speckle: 0, contours: true }, 0.45],
      ['terrain', 'Relief', 'mono', { levels: 5, pix: 0.3, dither: 0.5, style: 'hills' }, 0.5],
      ['weave', 'Ripstop', 'mono', { bands: 14, rhythm: 'even', gap: 0.05, stripe: 0.6 }],
      ['pebbles', 'Scree', 'brand', { size: 0.8, gap: 0.2, erode: 0.3, mode: 'crumble', lit: 0.7 }],
      ['parcels', 'Gear tags', 'mono', { cell: 1.6, size: 1, every: 6, labels: true }],
      ['zigzag', 'Switchbacks', 'brand', { style: 'chevron', colors: 'two', band: 6, amp: 8, period: 12, phase: 'parallel', vertical: true }],
    ],
    'wpa-screenprint': [
      ['cutup', 'Ridgelines', 'brand', { pieces: 5, cell: 1.5, hills: 1.2, slip: 0.3 }],
      ['arcrise', 'Sun and bands', 'brand', { origin: 'bottom', bands: 6, suns: 1, bars: false }],
      ['sonar', 'Lake map', 'brand', { land: 0.4, size: 1, speckle: 0, contours: true }],
      ['zigzag', 'Trail bands', 'brand', { style: 'chevron', colors: 'three', band: 7, amp: 6, period: 11, phase: 'parallel' }],
      ['weave', 'Lake lines', 'brand', { bands: 9, rhythm: 'even', gap: 0.15, stripe: 0.7 }],
      ['stipple', 'Pine grain', 'brand', { density: 0.9, dot: 0.9, field: 'clouds', duo: true }, 0.8],
    ],
    'old-web': [
      ['oprings', 'Hypno GIF', 'brand', { mode: 'rings', centres: 2, freq: 14, warp: 0.2, bands: 'three' }],
      ['marble', 'Marble GIF', 'brand', { bands: 5, warp: 1.6, cover: 0.9, stars: 0, outline: true }],
      ['pixelquilt', 'Tiled wallpaper', 'brand', { px: 1, block: 6, motifs: 'all', big: 0.1 }],
      ['stipple', 'Starfield', 'night', { density: 0.6, dot: 0.8, layout: 'random', mirror: 'none', field: 'clouds', duo: true }],
      ['gradpanes', 'WordArt bands', 'brand', { rows: 2, cols: 7, gap: 0.4, steps: 8, radius: 0 }],
      ['pixelgrid', 'Construction tape', 'brand', { cell: 2.5, mode: 'diagonals', zones: 2, density: 1, phase: 0 }],
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
    const rows = FIT[String(aestheticKey).replace(/--classic$/, '')] || FIT['bauhaus-poster'];
    return rows.map(r => {
      const tone = r[4] == null ? 1 : r[4];
      return { key: r[0], name: r[1], colorway: r[2], params: Object.assign({}, r[3], { tone }), tone };
    });
  };
})(window);
