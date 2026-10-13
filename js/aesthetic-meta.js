/* ---------------------------------------------------------------------
   aesthetic-meta.js — per-aesthetic data that lives outside the aesthetic
   definition files: the family it belongs to (sidebar filter) and its font
   recommendations (board "Type" block, sidebar hint, AI brief).

   Keyed by aesthetic key, so an aesthetic file never needs to know about it.
   Everything reading this goes through aestheticMeta(key) and tolerates a
   missing entry (no filter family, no recommendation).

   Font classes are the FONT_CLASSES keys in data.js; every FONTS entry has
   one `cls`. Picks and pairings are FONTS names, and the first pairing is what
   "Use recommended fonts" applies. Spec: docs/aesthetics-round3.md.

   Load order: after data.js and the aesthetic files, before aesthetic-board.js.
   Plain <script>, no modules.
------------------------------------------------------------------------ */

// Ordered, so the sidebar chips and Compare filter read the same way everywhere.
const AESTHETIC_FAMILIES = [
  { key: 'tactile', label: 'Tactile' },
  { key: 'graphic', label: 'Graphic' },
  { key: 'digital', label: 'Digital' },
  { key: 'print', label: 'Print & editorial' },
  { key: 'luminous', label: 'Luminous' },
];

// Avoid lists may use one pseudo class that is not a FONTS `cls`:
// 'serif' (every serif-ish class below). 'script' is a real class since round 6.
const AESTHETIC_SERIF_CLASSES = ['didone', 'old-style', 'text-serif', 'soft-serif', 'deco', 'slab', 'blackletter', 'woodtype'];

const AESTHETIC_META = {
  'soft-form': {
    family: 'tactile',
    fonts: {
      heading: { classes: ['geometric', 'neo-grotesk'], picks: ['Manrope', 'Inter Tight', 'Instrument Sans'] },
      body: { classes: ['neo-grotesk'], picks: ['Inter', 'Instrument Sans'] },
      avoid: ['didone', 'condensed', 'pixel', 'groovy'],
      why: 'Bauhaus with feeling: a geometric sans with soft terminals at a tight 600, so the shadows and materials carry the rest.',
      pairings: [['Manrope', 'Inter'], ['Inter Tight', 'Inter'], ['Instrument Sans', 'Instrument Sans']],
    },
  },
  'raw-brutalist': {
    family: 'graphic',
    fonts: {
      heading: { classes: ['heavy', 'neo-grotesk', 'condensed'], picks: ['Archivo Black', 'Inter Tight', 'Anton'] },
      body: { classes: ['neo-grotesk'], picks: ['Inter', 'Archivo', 'IBM Plex Sans'] },
      mono: { picks: ['JetBrains Mono', 'IBM Plex Mono', 'Space Mono'] },
      avoid: ['soft-serif', 'rounded', 'deco', 'groovy'],
      why: 'Severe, honest layouts want a black-weight headline or a plain grotesk, because anything decorative softens the point.',
      pairings: [['Archivo Black', 'Archivo'], ['Inter Tight', 'Inter'], ['Anton', 'IBM Plex Sans']],
    },
  },
  'neo-brutal-pop': {
    family: 'graphic',
    fonts: {
      heading: { classes: ['grotesk', 'geometric', 'heavy'], picks: ['Bricolage Grotesque', 'Syne', 'Unbounded'] },
      body: { classes: ['grotesk', 'geometric'], picks: ['DM Sans', 'Rubik', 'Work Sans'] },
      avoid: ['text-serif', 'old-style', 'deco', 'didone'],
      why: 'Chunky outlines and stickers pair with grotesks that have attitude and weight, never delicate or thin-stroked serifs.',
      pairings: [['Bricolage Grotesque', 'DM Sans'], ['Syne', 'DM Sans'], ['Unbounded', 'Rubik']],
    },
  },
  'retro-futurist': {
    family: 'luminous',
    fonts: {
      heading: { classes: ['wide', 'techno', 'condensed'], picks: ['Syncopate', 'Michroma', 'Unbounded', 'Big Shoulders Display'] },
      body: { classes: ['neo-grotesk'], picks: ['IBM Plex Sans', 'Inter'] },
      mono: { picks: ['Space Mono', 'IBM Plex Mono', 'VT323'], note: 'VT323 for readouts' },
      avoid: ['old-style', 'rounded', 'groovy'],
      why: 'Mission-control panels read as engineered when headlines are wide or techno and the body stays a plain grotesk, with mono for readouts.',
      pairings: [['Syncopate', 'IBM Plex Sans'], ['Michroma', 'IBM Plex Sans'], ['Unbounded', 'Inter']],
    },
  },
  'liquid-glass': {
    family: 'tactile',
    fonts: {
      heading: { classes: ['neo-grotesk'], picks: ['Inter', 'Geist', 'Onest'] },
      body: { classes: ['neo-grotesk'], picks: ['Inter', 'Geist'] },
      avoid: ['slab', 'didone', 'condensed', 'pixel'],
      why: 'Apple\'s voice is SF Pro, so its closest open proxy, Inter set large and bold over a 17px body, reads native under glass.',
      pairings: [['Inter', 'Inter'], ['Geist', 'Geist'], ['Onest', 'Inter']],
    },
  },
  'holo-iridescent': {
    family: 'luminous',
    fonts: {
      heading: { classes: ['wide', 'soft-serif', 'geometric'], picks: ['Unbounded', 'Instrument Serif', 'Syne', 'Sora'] },
      body: { classes: ['neo-grotesk'], picks: ['Inter', 'Geist'] },
      avoid: ['slab', 'condensed', 'old-style'],
      why: 'Light, wide and large is the luxury-packaging voice: an extended face at a light weight lets the foil be the statement.',
      pairings: [['Unbounded', 'Inter'], ['Instrument Serif', 'Geist'], ['Syne', 'Inter']],
    },
  },
  'aurora-noir': {
    family: 'digital',
    fonts: {
      heading: { classes: ['neo-grotesk'], picks: ['Geist', 'Inter Tight', 'Instrument Serif'] },
      body: { classes: ['neo-grotesk'], picks: ['Inter', 'Geist'] },
      mono: { picks: ['Geist Mono', 'JetBrains Mono'] },
      avoid: ['rounded', 'groovy', 'deco'],
      why: 'Dev-tool interfaces read as precise in Geist with Geist Mono labels; for an editorial headline, a serif display face over the same UI.',
      pairings: [['Geist', 'Geist'], ['Instrument Serif', 'Geist'], ['Inter Tight', 'Inter']],
    },
  },
  'bauhaus-poster': {
    family: 'graphic',
    fonts: {
      heading: { classes: ['geometric'], picks: ['Jost', 'Josefin Sans', 'Outfit', 'Urbanist'] },
      body: { classes: ['geometric', 'neo-grotesk'], picks: ['Jost', 'Work Sans'] },
      avoid: ['text-serif', 'old-style', 'techno', 'groovy'],
      why: 'Geometric construction is the Bauhaus idea in letterform, and circles and straight strokes echo the poster shapes.',
      pairings: [['Jost', 'Jost'], ['Outfit', 'Work Sans'], ['Josefin Sans', 'Jost']],
    },
  },
  'clay': {
    family: 'tactile',
    fonts: {
      heading: { classes: ['rounded', 'geometric'], picks: ['Fredoka', 'Baloo 2', 'Lexend', 'Rubik'] },
      body: { classes: ['rounded', 'humanist'], picks: ['Rubik', 'Nunito Sans', 'Figtree'] },
      avoid: ['condensed', 'didone', 'mono', 'techno'],
      why: 'Puffy, toy-like objects call for rounded terminals and friendly shapes that look as soft as the material.',
      pairings: [['Fredoka', 'Nunito Sans'], ['Baloo 2', 'Rubik'], ['Lexend', 'Figtree']],
    },
  },
  'riso-print': {
    family: 'print',
    fonts: {
      heading: { classes: ['condensed', 'grotesk', 'heavy'], picks: ['Big Shoulders Display', 'Bricolage Grotesque', 'Anton'] },
      body: { classes: ['grotesk', 'text-serif'], picks: ['Work Sans', 'Literata', 'Spectral'] },
      mono: { picks: ['Space Mono', 'DM Mono'] },
      avoid: ['geometric', 'techno', 'pixel'],
      why: 'Zine printing loves a condensed or characterful headline over a warm, readable text face, with mono for stamps and captions.',
      pairings: [['Big Shoulders Display', 'Work Sans'], ['Bricolage Grotesque', 'Literata'], ['Anton', 'Spectral']],
    },
  },
  'editorial-serif': {
    family: 'print',
    fonts: {
      heading: { classes: ['didone', 'soft-serif'], picks: ['Playfair Display', 'Bodoni Moda', 'Instrument Serif', 'Gloock'] },
      body: { classes: ['text-serif', 'old-style'], picks: ['Newsreader', 'Source Serif 4', 'Libre Caslon Text', 'EB Garamond'] },
      mono: { picks: ['Inter'], note: 'sans for captions' },
      avoid: ['rounded', 'techno', 'pixel', 'groovy'],
      why: 'A magazine page is carried by high-contrast serif display over a book-quality text serif, with weight coming from contrast rather than boldness.',
      pairings: [['Instrument Serif', 'Newsreader'], ['Bodoni Moda', 'Source Serif 4'], ['Playfair Display', 'Libre Caslon Text']],
    },
  },
  'cyber-hud': {
    family: 'digital',
    fonts: {
      heading: { classes: ['techno', 'wide'], picks: ['Orbitron', 'Chakra Petch', 'Rajdhani', 'Michroma'] },
      body: { classes: ['techno', 'neo-grotesk'], picks: ['Rajdhani', 'Chakra Petch', 'IBM Plex Sans'] },
      mono: { picks: ['JetBrains Mono', 'Space Mono'] },
      avoid: ['serif', 'rounded', 'groovy'],
      why: 'Angular panels and live readouts call for squared techno faces, with mono for data and no serifs or soft curves.',
      pairings: [['Orbitron', 'Rajdhani'], ['Chakra Petch', 'IBM Plex Sans'], ['Michroma', 'Chakra Petch']],
    },
  },
  'bento-grid': {
    family: 'digital',
    fonts: {
      heading: { classes: ['neo-grotesk', 'geometric'], picks: ['Inter Tight', 'Geist', 'Manrope', 'Plus Jakarta Sans'] },
      body: { classes: ['neo-grotesk'], picks: ['Inter', 'Geist'] },
      avoid: ['groovy', 'pixel', 'deco', 'condensed'],
      why: 'Product tiles stay clear with a neutral grotesk, and the big stat numerals do the expressive work.',
      pairings: [['Inter Tight', 'Inter'], ['Manrope', 'Inter'], ['Geist', 'Geist']],
    },
  },
  'mesh-gradient': {
    family: 'digital',
    fonts: {
      heading: { classes: ['geometric', 'neo-grotesk'], picks: ['Plus Jakarta Sans', 'Inter Tight', 'Manrope', 'Sora'] },
      body: { classes: ['neo-grotesk'], picks: ['Inter', 'Public Sans'] },
      avoid: ['slab', 'condensed', 'pixel'],
      why: 'Fintech marketing signals precision with a large, light headline at tight tracking over crisp, quiet cards.',
      pairings: [['Plus Jakarta Sans', 'Inter'], ['Inter Tight', 'Public Sans'], ['Sora', 'Inter']],
    },
  },
  'industrial-device': {
    family: 'tactile',
    fonts: {
      heading: { classes: ['grotesk', 'neo-grotesk'], picks: ['Geist', 'Inter Tight', 'Space Grotesk'] },
      body: { classes: ['neo-grotesk'], picks: ['Geist', 'Inter'] },
      mono: { picks: ['Azeret Mono', 'IBM Plex Mono', 'Space Mono', 'Doto'], note: 'Doto for numerals and the display only' },
      avoid: ['serif', 'rounded', 'groovy'],
      why: 'Device panels read as machined with a precise grotesk and monospace labels, never serif or rounded.',
      pairings: [['Space Grotesk', 'Inter'], ['Geist', 'Geist'], ['Inter Tight', 'Inter']],
    },
  },
  'pixel-arcade': {
    family: 'digital',
    fonts: {
      heading: { classes: ['pixel'], picks: ['Press Start 2P', 'Silkscreen', 'Pixelify Sans'] },
      body: { classes: ['pixel', 'mono'], picks: ['VT323', 'Space Mono', 'JetBrains Mono'] },
      mono: { picks: ['VT323'] },
      avoid: ['serif', 'geometric', 'script'],
      why: 'Everything sits on a pixel grid, so bitmap faces keep edges crisp while VT323 or a mono handles longer text.',
      pairings: [['Silkscreen', 'VT323'], ['Press Start 2P', 'Space Mono'], ['Pixelify Sans', 'JetBrains Mono']],
    },
  },
  'blueprint': {
    family: 'print',
    fonts: {
      heading: { classes: ['mono'], picks: ['IBM Plex Mono', 'Share Tech Mono', 'Space Mono'] },
      body: { classes: ['neo-grotesk'], picks: ['IBM Plex Sans', 'Inter'] },
      mono: { picks: ['IBM Plex Mono', 'JetBrains Mono'] },
      avoid: ['groovy', 'deco', 'soft-serif', 'rounded'],
      why: 'Technical drawings use single-stroke template lettering: mono capitals for titles and annotations, a plain sans for reading.',
      pairings: [['Share Tech Mono', 'IBM Plex Sans'], ['IBM Plex Mono', 'IBM Plex Sans'], ['IBM Plex Mono', 'Inter']],
    },
  },
  'blob-tracking': {
    family: 'digital',
    fonts: {
      heading: { classes: ['mono', 'neo-grotesk'], picks: ['IBM Plex Mono', 'Inter Tight', 'Geist', 'Archivo'] },
      body: { classes: ['neo-grotesk'], picks: ['Inter', 'Geist'] },
      mono: { picks: ['Geist Mono', 'JetBrains Mono', 'IBM Plex Mono'] },
      avoid: ['serif', 'rounded', 'groovy', 'deco'],
      why: 'Detection overlays read as clinical when the headline is a neutral grotesk and every ID, coordinate and confidence label is mono.',
      pairings: [['IBM Plex Mono', 'Inter'], ['Inter Tight', 'Inter'], ['Geist', 'Geist']],
    },
  },
  'xerox': {
    family: 'print',
    fonts: {
      heading: { classes: ['heavy', 'neo-grotesk'], picks: ['Arimo', 'Archivo Black', 'Archivo', 'Public Sans'] },
      body: { classes: ['typewriter', 'grotesk'], picks: ['IBM Plex Mono', 'Courier Prime', 'Work Sans'] },
      mono: { picks: ['IBM Plex Mono', 'Courier Prime'] },
      avoid: ['rounded', 'soft-serif', 'deco', 'geometric'],
      why: 'A photocopied flyer needs one blunt headline face, the office Arial-class bold or a black grotesk, over typewriter or plain grotesk text, because copying turns anything delicate to mush.',
      pairings: [['Arimo', 'IBM Plex Mono'], ['Archivo Black', 'IBM Plex Mono'], ['Archivo Black', 'Courier Prime'], ['Archivo', 'IBM Plex Mono']],
    },
  },
  'micrographics': {
    family: 'graphic',
    fonts: {
      heading: { classes: ['neo-grotesk', 'heavy'], picks: ['Archivo Black', 'IBM Plex Sans', 'Inter Tight', 'Geist'] },
      body: { classes: ['neo-grotesk'], picks: ['Inter', 'IBM Plex Sans'] },
      mono: { picks: ['Geist Mono', 'Azeret Mono', 'IBM Plex Mono'] },
      avoid: ['serif', 'groovy', 'rounded', 'deco'],
      why: 'One heavy headline and a giant glyph against 8px mono microtype is the whole contrast, so the faces must stay precise and stay out of each other\'s way.',
      pairings: [['Archivo Black', 'IBM Plex Sans'], ['IBM Plex Sans', 'IBM Plex Mono'], ['Inter Tight', 'Inter']],
    },
  },
  'mixed-type': {
    family: 'graphic',
    fonts: {
      heading: { classes: ['soft-serif', 'didone', 'grotesk'], picks: ['Instrument Serif', 'Playfair Display', 'Bricolage Grotesque', 'Fraunces'] },
      body: { classes: ['neo-grotesk'], picks: ['Inter', 'Instrument Sans'] },
      mono: { picks: ['DM Mono', 'Space Mono'] },
      avoid: ['pixel', 'techno', 'groovy'],
      why: 'Switching between a serif italic, a heavy grotesk and a mono inside one headline works only when the rest of the page stays on one quiet face.',
      pairings: [['Instrument Serif', 'Instrument Sans'], ['Bricolage Grotesque', 'Inter'], ['Playfair Display', 'Inter']],
    },
  },
  'ascii-art': {
    family: 'digital',
    fonts: {
      heading: { classes: ['mono'], picks: ['JetBrains Mono', 'IBM Plex Mono', 'Space Mono'] },
      body: { classes: ['mono'], picks: ['IBM Plex Mono', 'JetBrains Mono'] },
      mono: { picks: ['Space Mono'] },
      avoid: ['serif', 'rounded', 'groovy', 'deco'],
      why: 'Characters on a grid are the medium, so every face is fixed-width and the headline is a mono or a pixel font.',
      pairings: [['JetBrains Mono', 'IBM Plex Mono'], ['IBM Plex Mono', 'JetBrains Mono'], ['Space Mono', 'IBM Plex Mono']],
    },
  },
  'corporate-vandalism': {
    family: 'graphic',
    fonts: {
      heading: { classes: ['neo-grotesk', 'heavy'], picks: ['Archivo', 'Archivo Black', 'Public Sans'] },
      body: { classes: ['neo-grotesk'], picks: ['Public Sans', 'IBM Plex Sans'] },
      mono: { picks: ['IBM Plex Mono', 'Space Mono'] },
      avoid: ['soft-serif', 'groovy', 'deco', 'rounded'],
      why: 'The joke only lands inside a flawless, bored shell, so the type is plain procurement-software grotesk with mono for receipts and fine print.',
      pairings: [['Public Sans', 'Public Sans'], ['Archivo', 'Public Sans'], ['Archivo Black', 'IBM Plex Sans']],
    },
  },
  'xerox-punk': {
    family: 'print',
    fonts: {
      heading: { classes: ['condensed', 'heavy', 'slab'], picks: ['Bebas Neue', 'Anton', 'Alfa Slab One'] },
      body: { classes: ['typewriter'], picks: ['Special Elite', 'Courier Prime'] },
      mono: { picks: ['Courier Prime'] },
      avoid: ['soft-serif', 'geometric', 'deco', 'rounded'],
      why: 'A pasted wall wants cut-out headline tiles in blunt condensed and heavy faces, with typewriter text as the scrap of paper underneath.',
      pairings: [['Bebas Neue', 'Special Elite'], ['Anton', 'Courier Prime'], ['Alfa Slab One', 'Special Elite']],
    },
  },
  'acid-graphics': {
    family: 'luminous',
    fonts: {
      heading: { classes: ['wide', 'heavy', 'techno'], picks: ['Tilt Warp', 'Syncopate', 'Michroma'] },
      body: { classes: ['grotesk', 'neo-grotesk'], picks: ['Space Grotesk', 'Inter'] },
      mono: { picks: ['Kode Mono', 'Space Mono'] },
      avoid: ['serif', 'rounded', 'deco'],
      why: 'Warped, stretched headlines need an extended or heavy face that survives distortion, while the dense info layer stays in a plain grotesk and mono.',
      pairings: [['Tilt Warp', 'Inter'], ['Syncopate', 'Space Grotesk'], ['Michroma', 'Kode Mono']],
    },
  },
  'radical-memphis': {
    family: 'graphic',
    fonts: {
      heading: { classes: ['heavy', 'geometric', 'groovy'], picks: ['Archivo Black', 'Jost', 'Righteous', 'Outfit'] },
      body: { classes: ['geometric'], picks: ['DM Sans', 'Jost'] },
      avoid: ['text-serif', 'old-style', 'techno', 'pixel', 'mono'],
      why: 'Laminate patterns and clashing colours already shout, so the type is a heavy or geometric sans that stays flat and confident beside them.',
      pairings: [['Archivo Black', 'DM Sans'], ['Jost', 'Jost'], ['Righteous', 'DM Sans']],
    },
  },
  'pirate-broadcast': {
    family: 'digital',
    fonts: {
      heading: { classes: ['pixel', 'mono', 'condensed'], picks: ['VT323', 'Share Tech Mono', 'Doto', 'Bebas Neue'] },
      body: { classes: ['mono'], picks: ['IBM Plex Mono', 'Share Tech Mono'] },
      mono: { picks: ['VT323'], note: 'VT323 for teletext readouts' },
      avoid: ['serif', 'rounded', 'groovy'],
      why: 'Teletext pages and chyrons are fixed-width or tall condensed caps on a character grid, so the type behaves like broadcast hardware.',
      pairings: [['VT323', 'IBM Plex Mono'], ['Share Tech Mono', 'IBM Plex Mono'], ['Bebas Neue', 'IBM Plex Mono']],
    },
  },
  'dystopian-luxury': {
    family: 'print',
    fonts: {
      heading: { classes: ['neo-grotesk', 'didone'], picks: ['Archivo', 'Inter Tight', 'Bodoni Moda'] },
      body: { classes: ['neo-grotesk'], picks: ['Arimo', 'Inter', 'Public Sans'] },
      mono: { picks: ['Courier Prime', 'IBM Plex Mono'] },
      avoid: ['groovy', 'rounded', 'pixel', 'techno', 'deco'],
      why: 'Severity comes from removal, so a huge cropped grotesk or a single didone masthead sits over small clinical labels in a typewriter mono.',
      pairings: [['Archivo', 'Arimo'], ['Inter Tight', 'Inter'], ['Bodoni Moda', 'Arimo']],
    },
  },
  'frutiger-aero': {
    family: 'luminous',
    fonts: {
      heading: { classes: ['humanist', 'geometric'], picks: ['Source Sans 3', 'Nunito Sans', 'Figtree'] },
      body: { classes: ['humanist'], picks: ['Source Sans 3', 'Nunito Sans'] },
      avoid: ['serif', 'condensed', 'heavy', 'pixel', 'typewriter', 'hand'],
      why: 'A friendly humanist sans in light weights is the face of 2000s tech optimism, and it lets the gloss do the talking.',
      pairings: [['Source Sans 3', 'Source Sans 3'], ['Figtree', 'Nunito Sans'], ['Nunito Sans', 'Source Sans 3']],
    },
  },
  'naive-doodle': {
    family: 'graphic',
    fonts: {
      heading: { classes: ['hand', 'rounded'], picks: ['Patrick Hand', 'Caveat', 'Fredoka', 'Baloo 2'] },
      body: { classes: ['geometric', 'humanist'], picks: ['DM Sans', 'Nunito Sans'] },
      avoid: ['didone', 'deco', 'techno', 'blackletter', 'condensed', 'mono'],
      why: 'A readable hand for headlines and a tidy sans for everything else keep the charm without hurting legibility.',
      pairings: [['Patrick Hand', 'DM Sans'], ['Fredoka', 'Nunito Sans'], ['Caveat', 'DM Sans']],
    },
  },
  'japanese-minimal': {
    family: 'print',
    fonts: {
      heading: { classes: ['neo-grotesk', 'text-serif'], picks: ['Zen Kaku Gothic New', 'Shippori Mincho', 'Inter'] },
      body: { classes: ['neo-grotesk', 'humanist'], picks: ['Zen Kaku Gothic New', 'Inter'] },
      mono: { picks: ['IBM Plex Mono'] },
      avoid: ['groovy', 'heavy', 'pixel', 'hand', 'script', 'woodtype', 'blackletter', 'deco'],
      why: 'Modern Japanese minimalism reads through quiet, even gothic type and generous space, with a mincho only for rare emphasis.',
      pairings: [['Zen Kaku Gothic New', 'Zen Kaku Gothic New'], ['Shippori Mincho', 'Zen Kaku Gothic New'], ['Inter', 'Inter']],
    },
  },
  'mid-century': {
    family: 'graphic',
    fonts: {
      heading: { classes: ['geometric', 'slab'], picks: ['Jost', 'Alfa Slab One', 'Josefin Sans'] },
      body: { classes: ['geometric'], picks: ['Jost', 'DM Sans'] },
      mono: { picks: ['JetBrains Mono', 'IBM Plex Mono'] },
      avoid: ['pixel', 'blackletter', 'script', 'didone', 'groovy'],
      why: 'Tracked geometric caps with one slab word read as 1950s civil-defence print, and a plain mono runs the green terminal UI.',
      pairings: [['Jost', 'DM Sans'], ['Alfa Slab One', 'Jost'], ['Josefin Sans', 'DM Sans']],
    },
  },
  'transit-wayfinding': {
    family: 'graphic',
    fonts: {
      heading: { classes: ['neo-grotesk', 'grotesk'], picks: ['Overpass', 'Inter Tight', 'Public Sans', 'Barlow'] },
      body: { classes: ['neo-grotesk'], picks: ['Overpass', 'Public Sans', 'Inter'] },
      avoid: ['serif', 'groovy', 'hand', 'script', 'pixel', 'deco'],
      why: 'Highway-sign and Swiss-descended grotesks are built to be read at a glance from a distance.',
      pairings: [['Overpass', 'Overpass'], ['Inter Tight', 'Public Sans'], ['Barlow', 'Inter']],
    },
  },
  'gorpcore': {
    family: 'tactile',
    fonts: {
      heading: { classes: ['condensed', 'techno'], picks: ['Barlow Condensed', 'Saira Stencil', 'Big Shoulders Display'] },
      body: { classes: ['grotesk', 'neo-grotesk'], picks: ['Barlow', 'Inter', 'IBM Plex Sans'] },
      mono: { picks: ['JetBrains Mono', 'IBM Plex Mono'] },
      avoid: ['serif', 'groovy', 'script', 'hand', 'deco', 'rounded'],
      why: 'Condensed and stencil faces with a plain DIN-like body read like gear labels and spec sheets.',
      pairings: [['Barlow Condensed', 'Barlow'], ['Saira Stencil', 'Inter'], ['Big Shoulders Display', 'IBM Plex Sans']],
    },
  },
  'old-web': {
    family: 'digital',
    fonts: {
      heading: { classes: ['text-serif', 'condensed', 'hand'], picks: ['Tinos', 'Anton', 'Comic Neue'] },
      body: { classes: ['text-serif'], picks: ['Tinos'] },
      mono: { picks: ['Courier Prime'] },
      avoid: ['deco', 'soft-serif', 'didone', 'geometric', 'script', 'blackletter'],
      why: 'Times body text, an Impact-style headline and one Comic Sans moment are the honest defaults of the 1990s web.',
      pairings: [['Anton', 'Tinos'], ['Tinos', 'Tinos'], ['Comic Neue', 'Tinos']],
    },
  },
};

/* ---------------- helpers ---------------- */

// The meta entry for an aesthetic key, or null (callers must tolerate null).
function aestheticMeta(key) {
  return AESTHETIC_META[key] || null;
}

function aestheticFamilyOf(key) {
  const m = aestheticMeta(key);
  return m ? m.family : null;
}

function aestheticFamilyLabel(familyKey) {
  const f = AESTHETIC_FAMILIES.find(x => x.key === familyKey);
  return f ? f.label : '';
}

// Does font class `cls` fall under an avoid entry (a class key or a pseudo class)?
function fontClassIn(cls, list) {
  return (list || []).some(a => a === cls || (a === 'serif' && AESTHETIC_SERIF_CLASSES.includes(cls)));
}

// 'match'    the face is one of the picks or sits in a recommended class,
// 'avoid'    its class is on the avoid list,
// 'consider' anything else. `recBlock` is fonts.heading / fonts.body / fonts.mono.
function fontFit(font, recBlock, avoid) {
  if (!font) return 'consider';
  if (fontClassIn(font.cls, avoid)) return 'avoid';
  if (recBlock) {
    if ((recBlock.picks || []).includes(font.name)) return 'match';
    if ((recBlock.classes || []).includes(font.cls)) return 'match';
  }
  return 'consider';
}

// Plain-words class list: "neo-grotesk or geometric sans".
function fontClassWords(classes) {
  const words = (classes || []).map(c => (FONT_CLASSES[c] ? FONT_CLASSES[c].label : c));
  if (words.length <= 1) return words.join('');
  if (words.length === 2) return words.join(' or ');
  return words.slice(0, -1).join(', ') + ' or ' + words[words.length - 1];
}

// The brand's current faces measured against an aesthetic's recommendation.
// Returns null when there is no recommendation for the key.
function fontFitFor(key, state) {
  const m = aestheticMeta(key);
  if (!m) return null;
  const f = m.fonts;
  return {
    heading: fontFit(state.headingFont, f.heading, f.avoid),
    body: fontFit(state.bodyFont, f.body, f.avoid),
  };
}

// Startup check: every pick, pairing and family must resolve. Prints nothing
// when the data is consistent. Registered aesthetics without an entry are
// allowed (the board falls back gracefully) but reported once.
(function validateAestheticMeta() {
  const names = new Set(FONTS.map(f => f.name));
  const classes = new Set(Object.keys(FONT_CLASSES));
  const famKeys = new Set(AESTHETIC_FAMILIES.map(f => f.key));
  const problems = [];
  Object.keys(AESTHETIC_META).forEach(key => {
    const m = AESTHETIC_META[key];
    if (!famKeys.has(m.family)) problems.push(`${key}: unknown family "${m.family}"`);
    const f = m.fonts;
    ['heading', 'body'].forEach(role => {
      (f[role].classes || []).forEach(c => { if (!classes.has(c)) problems.push(`${key}.${role}: unknown class "${c}"`); });
    });
    (f.avoid || []).forEach(c => { if (!classes.has(c) && c !== 'serif') problems.push(`${key}.avoid: unknown class "${c}"`); });
    [].concat(f.heading.picks, f.body.picks, f.mono ? f.mono.picks : [], ...(f.pairings || []))
      .forEach(n => {
        if (!names.has(n)) { problems.push(`${key}: font "${n}" is not in FONTS`); return; }
        const cls = FONTS.find(x => x.name === n).cls;
        if (fontClassIn(cls, f.avoid)) problems.push(`${key}: font "${n}" (${cls}) is on its own avoid list`);
      });
    if (!f.pairings || !f.pairings.length) problems.push(`${key}: no pairings`);
  });
  if (typeof AESTHETICS !== 'undefined') {
    AESTHETICS.forEach(a => { if (!AESTHETIC_META[a.key]) problems.push(`${a.key}: no entry in AESTHETIC_META`); });
  }
  if (problems.length) console.warn('aesthetic-meta: ' + problems.join('; '));
})();
