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
      heading: { classes: ['heavy', 'neo-grotesk', 'condensed'], picks: ['Arimo', 'Archivo Black', 'Inter Tight', 'Anton'] },
      body: { classes: ['neo-grotesk'], picks: ['Tinos', 'Inter', 'Archivo', 'IBM Plex Sans'] },
      mono: { picks: ['JetBrains Mono', 'IBM Plex Mono', 'Space Mono'] },
      avoid: ['soft-serif', 'rounded', 'deco', 'groovy'],
      why: 'Severe, honest layouts want a black-weight headline or a plain grotesk, because anything decorative softens the point.',
      pairings: [['Arimo', 'Tinos'], ['Archivo Black', 'Archivo'], ['Inter Tight', 'Inter'], ['Anton', 'IBM Plex Sans']],
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
      pairings: [['Michroma', 'IBM Plex Sans'], ['Syncopate', 'IBM Plex Sans'], ['Unbounded', 'Inter']],
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
      body: { classes: ['pixel', 'mono'], picks: ['DM Sans', 'VT323', 'Space Mono', 'JetBrains Mono'] },
      mono: { picks: ['VT323'] },
      avoid: ['serif', 'script'],
      why: 'Everything sits on a pixel grid, so bitmap faces keep edges crisp while VT323 or a mono handles longer text.',
      pairings: [['Pixelify Sans', 'DM Sans'], ['Silkscreen', 'VT323'], ['Press Start 2P', 'Space Mono'], ['Pixelify Sans', 'JetBrains Mono']],
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
      avoid: ['pixel', 'blackletter', 'script', 'didone', 'groovy'],
      why: 'Tracked geometric caps with one heavy slab word read as mid-century modern print; stay on warm cream paper.',
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
  'wpa-screenprint': {
    family: 'print',
    fonts: {
      heading: { classes: ['condensed', 'slab'], picks: ['Oswald', 'Barlow Condensed', 'Bebas Neue', 'Alfa Slab One'] },
      body: { classes: ['humanist'], picks: ['Nunito Sans', 'Source Sans 3', 'Figtree'] },
      avoid: ['techno', 'pixel', 'blackletter', 'script', 'groovy', 'didone'],
      why: 'Travel-poster screenprints set condensed or slab caps with open tracking over a friendly humanist text face, so the display reads at a glance and the body stays easy.',
      pairings: [['Oswald', 'Nunito Sans'], ['Barlow Condensed', 'Source Sans 3'], ['Alfa Slab One', 'Figtree']],
    },
  },
  'data-pebble': {
    family: 'digital',
    fonts: {
      heading: { classes: ['soft-serif', 'text-serif'], picks: ['Newsreader', 'Fraunces', 'Source Serif 4', 'Instrument Serif'] },
      body: { classes: ['neo-grotesk', 'humanist'], picks: ['Instrument Sans', 'Figtree', 'Public Sans', 'DM Sans'] },
      avoid: ['pixel', 'groovy', 'condensed', 'blackletter', 'deco', 'slab'],
      why: 'Big light serif figures with lining tabular numerals lead, and a clean grotesque carries the labels. Newsreader at display size is the lightest bundled serif; Instrument Serif has one fine weight.',
      pairings: [['Newsreader', 'Instrument Sans'], ['Fraunces', 'Figtree'], ['Source Serif 4', 'Public Sans'], ['Instrument Serif', 'Instrument Sans']],
    },
  },
  'toy-press': {
    family: 'tactile',
    fonts: {
      heading: { classes: ['rounded'], picks: ['Fredoka', 'Baloo 2'] },
      body: { classes: ['humanist', 'rounded'], picks: ['Nunito Sans', 'Rubik'] },
      avoid: ['serif', 'mono', 'condensed', 'techno', 'pixel', 'blackletter', 'script', 'deco', 'groovy'],
      why: 'Chunky pressable keys need a rounded display face with soft terminals (Fredoka at 700, Baloo 2 at 800) over a friendly humanist or rounded text face, so labels stay easy and never read as childish.',
      pairings: [['Fredoka', 'Nunito Sans'], ['Baloo 2', 'Nunito Sans'], ['Fredoka', 'Rubik'], ['Baloo 2', 'Rubik']],
    },
  },
  'live-tile': {
    family: 'digital',
    fonts: {
      heading: { classes: ['neo-grotesk', 'humanist'], picks: ['Inter Tight', 'Lato', 'Figtree'] },
      body: { classes: ['humanist', 'neo-grotesk'], picks: ['Lato', 'Figtree', 'Inter Tight'] },
      avoid: ['serif', 'script', 'slab', 'heavy', 'wide', 'condensed', 'groovy', 'deco', 'pixel', 'blackletter', 'hand'],
      why: 'Tile labels, huge panorama titles and pivot headings are all type, so a light humanist or neo-grotesk sans does the whole job. Set the headings in the lightest weight the face has: Inter Tight is the only recommended face with a true 300, so it leads; Lato and Figtree fall back to 400.',
      pairings: [['Inter Tight', 'Lato'], ['Lato', 'Lato'], ['Figtree', 'Figtree'], ['Inter Tight', 'Figtree']],
    },
  },
  'mainframe': {
    family: 'digital',
    fonts: {
      heading: { classes: ['neo-grotesk'], picks: ['IBM Plex Sans', 'Public Sans', 'Geist', 'Inter'] },
      body: { classes: ['neo-grotesk', 'humanist'], picks: ['IBM Plex Sans', 'Public Sans', 'Inter'] },
      mono: { picks: ['IBM Plex Mono'], note: 'labels, values and numbering, with tabular figures' },
      avoid: ['script', 'hand', 'rounded', 'woodtype', 'blackletter', 'groovy', 'pixel', 'soft-serif', 'deco', 'didone', 'heavy', 'wide'],
      why: 'An operations-room look wants a plain, even grotesque for headings and body (IBM Plex Sans: light 300 for the big expressive headings, 600 for productive titles) and a matching mono (IBM Plex Mono) for labels, values and numbering. Nothing rounded, scripted or display.',
      pairings: [['IBM Plex Sans', 'IBM Plex Sans'], ['Public Sans', 'IBM Plex Sans'], ['Geist', 'IBM Plex Sans'], ['Inter', 'Inter']],
    },
  },
  'tonal-shape': {
    family: 'graphic',
    fonts: {
      heading: { classes: ['geometric', 'rounded'], picks: ['Outfit', 'Plus Jakarta Sans', 'Sora', 'Urbanist'] },
      body: { classes: ['humanist', 'geometric'], picks: ['Figtree', 'Nunito Sans', 'Plus Jakarta Sans'] },
      avoid: ['serif', 'mono', 'typewriter', 'condensed', 'techno', 'pixel', 'groovy', 'blackletter', 'deco', 'slab', 'script'],
      why: 'Friendly geometric headings at a medium-bold weight over a warm humanist body keep pill buttons and soft tonal surfaces legible and fun; serifs, mono and condensed faces fight the rounded shapes. Outfit publishes 400 and 600 here, so headings use 600.',
      pairings: [['Outfit', 'Figtree'], ['Plus Jakarta Sans', 'Figtree'], ['Sora', 'Figtree'], ['Urbanist', 'Nunito Sans']],
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
  return AESTHETIC_META[typeof aestheticBaseKey === 'function' ? aestheticBaseKey(key) : key] || null;
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

/* ---------------- build recipes (the AI brief's States, Motion, Accessibility, Icons, App icon) ----------------
   Deterministic rules, no AI: every aesthetic belongs to one material class (BUILD_CLASSES) and may
   override any field of it in AESTHETIC_BUILD. aestheticBuild(key) returns the merged record; an
   aesthetic with no entry here is classed from its materials by aibDeriveClass (js/ai-brief.js).

   Text uses token names (`--ink`, `--error`); the brief rewrites them to Palette.ink for SwiftUI.
   Numbers are CSS px = SwiftUI pt. `sh` is the rest shadow: a hard offset (x, y, blur 0), a soft
   pair (d = offset, blur, ds/blurS for small controls), or a glow (r, a). SwiftUI radius = CSS blur / 2.
   `states[k]` is [colour role, visual]; the focus row's colour is computed from the palette.
   `sw` picks the SwiftUI recipe (hard | soft | glass | glow | flat | stepped).
   Optional `accentOverride` and `secondaryOverride` { light, dark?, on?, note } (`on` = the label colour the board uses on it): the look draws its own accent whatever the brand
   accent is; light/dark name an extras key ('--ab-x', read from the board's tokens function per mode),
   a hex, or a function(m) of the mode record { mode, t, extras }. The brief prints that value.
   Optional `fixedInks` [{ token, light, dark?, on?, job, decorativeOnly }]: extra colours the look
   adds regardless of the palette; same value sources; `on` is the label colour on it; they become
   rows of the Colors table, tokens.css and Theme.swift.
   Optional `ambient`: a sentence describing an always-on background motion; the brief prints it
   (paused under Reduce Motion) instead of "nothing else animates idly".
------------------------------------------------------------------------ */

const BUILD_EASE = {
  out: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
  inout: 'cubic-bezier(0.4, 0, 0.2, 1)',
  spring: 'cubic-bezier(0.3, 1.6, 0.5, 1)',
  gel: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  steps: 'steps(4, end)',
};

const BUILD_CLASSES = {
  hard: {
    sw: 'hard', name: 'hard-shadow', line: 2,
    sh: { x: 4, y: 4, blur: 0 }, lift: { x: 6, y: 6 }, press: { dx: 4, dy: 4, ms: 100 },
    motion: { fast: 100, base: 160, slow: 240, ease: 'out' },
    surface: 'Flat fills with a solid outline and a hard offset shadow (no blur).',
    pressText: 'The surface travels 4pt right and down while its hard shadow goes to 0, so it lands flat on the page; release returns it. 100 ms, ease-out.',
    states: {
      pressed: ['No colour change', 'Travels (4,4) as the hard shadow goes to 0, 100 ms ease-out, landing flat on the page.'],
      disabled: ['`--line` fill, `--muted` label and outline', 'No shadow and no press response: a flat, empty slab.'],
      empty: ['`--ink` outline and icon, `--muted` copy', 'Dashed 2pt outline on `--canvas` with one icon, a headline, one line of copy and one primary action.'],
      loading: ['`--ink` blocks on `--line`', 'Three solid squares stepping in turn, or a bar with a 2pt `--ink` outline; no blur, no easing.'],
      error: ['`--error`', '2pt `--error` outline and hard shadow on the field; an alert icon and the message in `--error` below. Never colour alone.'],
    },
    reduceMotion: 'Swap rest and pressed instantly with no travel animation; toggles jump to their end state, no spring.',
    reduceTransparency: 'Nothing is translucent; no change.',
    increaseContrast: 'Outlines go to 3pt, `--muted` text becomes `--ink`, the shadow stays solid.',
    icons: 'Stroke 2.5pt, round caps and joins, 2pt corners on boxy glyphs. Outline at rest; selected fills solid with a 2pt `--ink` outline.',
    iconWeight: 'semibold',
    appIcon: 'Full-bleed `{primary}` tile with one chunky glyph or sticker shape in `{accent}`, a 3pt `{ink}` outline and a hard `{ink}` offset shadow (6pt, 6pt) inside the tile; flat, no gradients, no text.',
  },
  soft: {
    sw: 'soft', name: 'soft raised and recessed', line: 0,
    sh: { d: 6, blur: 13, ds: 3, blurS: 7 }, press: { ms: 140 },
    motion: { fast: 120, base: 180, slow: 320, ease: 'inout' },
    surface: 'Surfaces share the canvas colour; paired highlight and shadow make them raised or recessed.',
    pressText: 'A raised control becomes recessed: the paired shadows swap to inset over 140 ms; a glossy action also sinks 1pt and scales to 0.99.',
    states: {
      pressed: ['No colour change', 'Raised becomes recessed (paired shadows swap to inset, 140 ms ease-in-out); the glossy action also sinks 1pt and scales to 0.99.'],
      disabled: ['`--muted` label on `--canvas`', 'Flat: no shadows, no gloss, printed onto the surface; ignores presses.'],
      empty: ['`--ink` headline, `--muted` copy', 'A recessed well holding one outline icon, a headline, one line of copy and one raised or glossy action.'],
      loading: ['`--line` track, `--primary` fill', 'Recessed track filling left to right, or a raised disc easing between raised and recessed every 1.2 s; never a shimmer sweep.'],
      error: ['`--error`', 'The field keeps its recessed well and gains a 1.5pt `--error` rim; alert icon and message below. Shadows stay neutral.'],
    },
    reduceMotion: 'Swap raised and recessed instantly; no scale, no shadow morph, no idle shimmer.',
    reduceTransparency: 'Glass panels become opaque `--canvas` with a 1pt `--line` rim; raised shadows stay.',
    increaseContrast: 'Add a 1pt `--muted` outline to raised and recessed surfaces (relief alone is low contrast), set `--muted` text to `--ink`, thicken the focus ring to 4pt.',
    icons: 'Stroke 1.75pt, round caps and joins, 2pt corners on geometric forms. Outline at rest; selected sits on a chip filled with `--ink`, glyph in `--canvas`. No gradients inside glyphs.',
    iconWeight: 'regular',
    appIcon: '`{canvas}` tile with one raised disc, a recessed ring and a `{primary}` semicircle, lit from the top left by a soft highlight and shadow pair; no text, no other colour.',
  },
  glass: {
    sw: 'glass', name: 'glass and luminous', line: 1,
    sh: { d: 0, blur: 24 }, press: { scale: 0.97, ms: 150 },
    motion: { fast: 150, base: 250, slow: 400, ease: 'spring' },
    surface: 'Translucent material over the scene with a 1pt light rim.',
    pressText: 'Scale to 0.97 with a spring (response 0.3 s) and a brighter rim.',
    states: {
      pressed: ['`--ink` at 12% over the material', 'Scales to 0.97 with a spring (0.3 s) and a brighter rim.'],
      disabled: ['`--muted` label', 'Material at 40% opacity, no rim highlight, no press response.'],
      empty: ['`--ink` headline, `--muted` copy', 'A glass panel holding one icon, a headline, one line of copy and one action.'],
      loading: ['`--primary` on the material', 'A progress arc or lens sweep inside the panel; never a spinner on bare canvas.'],
      error: ['`--error`', 'Rim and caret in `--error`; alert icon and message below the field; the material itself stays neutral.'],
    },
    reduceMotion: 'No parallax, shimmer or morphing lenses; press is an instant 12% `--ink` wash.',
    reduceTransparency: 'Replace every material with opaque `--canvas` (selected: `--pri-tint`) and keep the rim as `--line`.',
    increaseContrast: 'Rim becomes 1.5pt `--ink` at 60%, panel fill opaque `--canvas`, `--muted` text becomes `--ink`.',
    icons: 'Stroke 1.5pt, round caps, monochrome, outline at rest and the filled variant when selected; the glyph sits on its material in `--ink`.',
    iconWeight: 'regular',
    appIcon: '`{canvas}` tile with one translucent rounded lens (white at 25%, 1pt white rim at 50%) over a `{primary}` shape; no text.',
  },
  glow: {
    sw: 'glow', name: 'neon and glow', line: 1,
    sh: { r: 8, a: 0.5 }, press: { scale: 0.98, ms: 120 },
    motion: { fast: 120, base: 200, slow: 320, ease: 'out' },
    surface: 'Near-black panels with a 1pt coloured edge and a soft glow of the same colour.',
    pressText: 'Glow radius grows from 8 to 14 and the control scales to 0.98 over 120 ms.',
    states: {
      pressed: ['Glow colour at full strength', 'Glow radius 8 to 14 and scale 0.98 in 120 ms.'],
      disabled: ['`--muted` at 50%', 'No glow; a 1pt `--line` edge; ignores presses.'],
      empty: ['`--muted` copy, `--primary` icon', 'A 1pt edge frame with corner brackets, a headline, one line of copy and one action.'],
      loading: ['`--primary` on `--line`', 'A segmented bar filling block by block, or a blinking cursor block at 1 s.'],
      error: ['`--error`', 'Edge and glow switch to `--error`; message in caps with an alert icon.'],
    },
    reduceMotion: 'Freeze pulses, scanlines, flicker and glow breathing at their rest state; press is an instant glow change.',
    reduceTransparency: 'Replace glow halos with a solid 1pt edge in the same colour; panel fills opaque.',
    increaseContrast: 'Edges go to 2pt at full strength, glow halos are dropped, body text is `--ink`.',
    icons: 'Stroke 1.5pt, square caps, chamfered or 0pt corners, in the glow colour; fills only for status dots.',
    iconWeight: 'regular',
    appIcon: '`{canvas}` tile with one monoline glyph in `{primary}` and a soft `{primary}` glow at 40%; no text.',
  },
  flat: {
    sw: 'flat', name: 'flat colour and hairlines', line: 1,
    sh: {}, press: { opacity: 0.85, ms: 120 },
    motion: { fast: 120, base: 180, slow: 280, ease: 'out' },
    surface: 'Flat fills divided by hairlines; no shadows.',
    pressText: 'Colour change only, no movement: a filled button drops to 85% opacity, a secondary or ghost control takes a `--pri-tint` wash. 120 ms, ease-out.',
    states: {
      pressed: ['`--pri-tint` wash (secondary, ghost) or the fill at 85% (primary)', 'Colour change only, 120 ms ease-out; no movement.'],
      disabled: ['`--line` fill, `--muted` label', 'No hover or press response.'],
      empty: ['`--ink` headline, `--muted` copy', 'One outline icon, a headline, one line of copy and one action on the plain canvas; no box or illustration.'],
      loading: ['`--line` track, `--primary` fill', 'Indeterminate bar, or skeleton blocks in `--line` easing between 100% and 60% opacity every 1.2 s.'],
      error: ['`--error`', '1.5pt `--error` edge on the field; alert icon and message below in `--error`.'],
    },
    reduceMotion: 'Replace slides and fades with an instant state swap; colour changes stay.',
    reduceTransparency: 'Nothing is translucent; scrims become opaque `--canvas`.',
    increaseContrast: 'Hairlines become 2pt `--ink`, `--muted` text becomes `--ink`, tints get a 1pt `--ink` edge.',
    icons: 'Stroke 1.5pt, round caps and joins, 0 to 2pt corners, outline at rest and filled in `--ink` when selected.',
    iconWeight: 'regular',
    appIcon: 'Full-bleed `{primary}` tile with one simple glyph (or the brand initial in the heading face) in `{onPrimary}`; flat, no shadow, no gradient.',
  },
  stepped: {
    sw: 'stepped', name: 'pixel, bevel and stepped', line: 2,
    sh: {}, press: { ms: 0 },
    motion: { fast: 0, base: 120, slow: 200, ease: 'steps' },
    surface: 'Square 2pt-edged blocks; depth, where any, is a hard bevel; nothing is smoothed.',
    pressText: 'Fill and label swap instantly (`--ink` and `--canvas`); bevelled controls flip their highlight and shadow edges. No easing.',
    states: {
      pressed: ['Fill and label swap (`--ink` and `--canvas`)', 'Instant inversion with no easing; bevels flip highlight and shadow edges.'],
      disabled: ['`--muted` label, dotted `--muted` edge', 'No fill; ignores presses.'],
      empty: ['`--ink` headline, `--muted` copy', 'A boxed message with one pixel icon, one line of copy and one action.'],
      loading: ['`--primary` on `--line`', 'Blocks filling one at a time in 4 steps, or a blinking cursor; no smooth motion.'],
      error: ['`--error`', '2pt `--error` border and an inverted label bar carrying the message with a pixel alert icon.'],
    },
    reduceMotion: 'Stop blinking cursors, marquees and stepped animations on their first frame.',
    reduceTransparency: 'Nothing is translucent; no change.',
    increaseContrast: 'Borders go to 3pt `--ink`, bevels use `--ink` and `--canvas`, `--muted` text becomes `--ink`.',
    icons: 'Pixel-grid glyphs on a 16pt grid, 2pt square strokes, no curves smoothed, solid fills.',
    iconWeight: 'bold',
    appIcon: 'A 16x16 pixel-grid glyph in `{primary}` on a `{canvas}` tile, scaled up with nearest-neighbour; no smoothing, no text.',
  },
};

// key -> { cls, ...overrides }. Hand-tuned: soft-form and neo-brutal-pop (shipped); the rest take their
// class and only the fields that differ. modes: { only, because } marks a dark-only or light-only look.
const AESTHETIC_BUILD = {
  'soft-form': {
    cls: 'soft',
    press: { ms: 140 },
    motion: { fast: 120, base: 180, slow: 320, ease: 'inout' },
    pressText: 'A raised control becomes recessed: the paired shadows swap to inset over 140 ms (ease-in-out). The glossy primary action also sinks 1pt and scales to 0.99 with an inset 1,2,4 shadow. The light never moves: top left, always.',
    icons: 'Stroke 1.75pt, round caps and joins, 2pt corners on geometric forms (circle, square, semicircle). Outline at rest; selected sits on a chip filled with `--ink`, glyph in `--canvas`. No gradients inside glyphs.',
    appIcon: '`{canvas}` tile carrying one raised disc off-centre inside a recessed well, with a `{primary}` semicircle crossing the well rim, lit from the top left by the same highlight and shadow pair as the UI; no text, no other colour.',
  },
  'neo-brutal-pop': {
    cls: 'hard',
    surface: 'Flat colour fields (primary, secondary, accent) with ink borders and a hard offset shadow (no blur); decoration is stickers (starburst, flower, !).',
    line: 2,
    sh: { x: 4, y: 4, blur: 0 }, lift: { x: 6, y: 6 }, press: { dx: 4, dy: 4, ms: 100 },
    motion: { fast: 100, base: 160, slow: 240, ease: 'out' },
    pressText: 'The "squish": at rest a 4pt hard shadow; pointer hover lifts (-2,-2) with the shadow at 6pt; pressed translates (4,4) and the shadow goes to 0. 100 ms. Toggles settle with a springy overshoot (cubic-bezier(0.3, 1.6, 0.5, 1), 160 ms).',
    icons: 'Stroke 2.5pt, round caps and joins, chunky; stickers are solid fills with a 2pt `--ink` outline and a 4pt hard shadow. Outline icons at rest, solid when selected.',
    appIcon: 'Full-bleed `{primary}` tile with one sticker shape (starburst or flower) in `{accent}`, a 3pt `{ink}` outline and a hard `{ink}` offset shadow (6pt, 6pt) inside the tile; flat, no gradients, no text.',
  },
  'raw-brutalist': {
    cls: 'hard', shadowInk: true,
    sh: { x: 0, y: 0, blur: 0 }, lift: { x: 0, y: 0 }, press: { dx: 1, dy: 1, ms: 80 },
    motion: { fast: 80, base: 120, slow: 200, ease: 'out' },
    surface: 'Flat fills with a solid outline and no shadow of any kind (no offset, no blur); depth comes from the outline and the ink block alone. Light ground by default.',
    pressText: 'No shadows. On hover the control inverts: an `--ink` block with `--canvas` text. On press it flips back (canvas fill, ink text) and translates (1,1); 80 ms, ease-out; toggles do not animate.',
    states: {
      pressed: ['Fill and label flip (`--ink` and `--canvas`)', 'Inverts on hover, flips on press and translates (1,1), 80 ms ease-out; no shadow at any state.'],
      error: ['`--error`', '2pt `--error` outline on the field; an alert icon and the message in `--error` below. Never colour alone.'],
    },
    icons: 'Stroke 2pt, square caps and miter joins, 0pt corners; outline only, solid `--ink` fill when selected.',
    iconWeight: 'medium',
    appIcon: '`{canvas}` tile with a 6pt `{ink}` frame and one heavy block glyph in `{ink}`; flat, no shadow, no gradients, no text beyond a single letter.',
  },
  'liquid-glass': {
    cls: 'glass',
    press: { scale: 0.97, ms: 220 },
    motion: { fast: 220, base: 250, slow: 400, ease: 'gel' },
    pressText: 'Gel: the control swells to 1.03 on hover and squeezes to 0.97 on press, 220 ms with cubic-bezier(0.34, 1.56, 0.64, 1) so it overshoots and settles; the selected tab\'s glass slides to its new position with the same curve.',
    surface: 'Regular material panels and floating glass controls over the scene; on iOS 26 or later use the system glass effect (`glassEffect`), otherwise the regular material.',
  },
  'cyber-hud': {
    cls: 'glow', modes: { only: 'dark', because: 'neon edges and glow only read against a near-black ground' },
    surface: 'Near-black panels with a 1pt neon edge and a soft glow of the same colour. The neon is the primary hue at full saturation (blues pushed toward azure); a hot second signal comes from the secondary hue. HUD readouts are mono. Hazard stripes (#FCE205 on near-black) are decorative only.',
    fixedInks: [
      { token: '--hazard', light: '--ab-haz', on: '--ab-haz-ink', job: 'Hazard yellow #FCE205: warning stripes and caution bars on near-black.', decorativeOnly: true },
    ],
  },
  'retro-futurist': {
    cls: 'glow',
    surface: 'Near-black panels with a 1pt coloured edge and a soft glow of the same colour. Controls are pill keys; progress is an LED ladder (a row of lamps lighting in turn); each stat gets a dial; status is a lamp plus a text label; exactly one hot-orange alert lamp is allowed per screen.',
  },
  'blob-tracking': { cls: 'glow', modes: { only: 'dark', because: 'detection overlays sit on dark footage plates' } },
  'acid-graphics': { cls: 'glow', surface: 'Near-black panels with a 1pt coloured edge and a soft glow of the same colour. The clash colour is fluorescent (chartreuse or hot magenta) and labels on it are black.' },
  'aurora-noir': { cls: 'glass', surface: 'The aurora is three soft colour clouds (accent, primary, secondary) above the hero, plus one wide beam and a horizon arc. The interface itself is flat: no colour wash over cards or text. The featured card has a 2px top edge in the beam colour.', modes: { only: 'dark', because: 'its aurora beams and hairlines only read as light on a near-black ground' } },
  'holo-iridescent': { cls: 'glass', surface: 'Translucent material over the scene with a 1pt light rim. Foil appears only on the CTA rim, the selected tab and card rims.' },
  'frutiger-aero': { cls: 'glass', surface: 'Translucent material over the scene with a 1pt light rim. The product UI itself carries the sky gradient, bubbles and glossy glass.' },
  'clay': { cls: 'soft', sh: { d: 8, blur: 18, ds: 4, blurS: 9 }, surface: 'Surfaces share the canvas colour; paired highlight and shadow make them raised or recessed. Clay objects use a pastel tonal ramp of the primary; the capsule CTA keeps the full primary; the hero sphere has a smiling face.' },
  'industrial-device': { cls: 'soft' },
  'radical-memphis': { cls: 'hard', surface: 'Flat fills with a solid outline and a hard offset shadow (no blur). Laminate patterns (zig-zag, terrazzo, dots, checker, bacterio) frame the product UI and never sit behind text.' },
  'riso-print': { cls: 'hard', sh: { x: 3, y: 3, blur: 0 }, accentOverride: { light: '--ab-accent', note: 'a fluorescent riso ink: pink, or orange when the primary is pink or red' }, surface: 'Flat fills with a solid outline and a hard offset shadow (no blur), like overprinted ink. The accent prints fluorescent pink; if the primary is pink or red, the accent prints orange instead.', modes: { only: 'light', because: 'it imitates ink on uncoated paper; there is no dark paper' } },
  'pixel-arcade': {
    cls: 'stepped', modes: { only: 'dark', because: 'sprites and dither are tuned for a CRT-black ground' },
    surface: 'Square 2pt-edged blocks; depth, where any, is a hard bevel; nothing is smoothed. Charts are stepped blocks (bars and gauges built from whole squares, no smooth curves); micro-labels are set in Silkscreen.',
    icons: '8x8 pixel sprites, solid fills, scaled up with nearest-neighbour; no curves smoothed, no outlines-only glyphs.',
    appIcon: 'An 8x8 pixel sprite in `{primary}` on a `{canvas}` tile, scaled up with nearest-neighbour; no smoothing, no text.',
  },
  'ascii-art': { cls: 'stepped', surface: 'Square 2pt-edged blocks; depth, where any, is a hard bevel; nothing is smoothed. Heading and body must both be mono.', modes: { only: 'dark', because: 'it is a phosphor terminal; light characters on black are the medium' } },
  'pirate-broadcast': { cls: 'stepped', modes: { only: 'dark', because: 'teletext is bright text on a black screen' } },
  'old-web': { cls: 'stepped' },
  'data-pebble': {
    cls: 'flat',
    surface: 'Solid cards (white in light, a raised tint of the ground in dark) with a 1pt hairline tinted to the ground hue, an 18pt corner and one very soft shadow tinted with the primary (never grey-black): 0 1pt 2pt primary 6%, 0 14pt 32pt -18pt primary 28%. Controls are pills; the toggle knob stays round. The app carries no decoration: pebbles appear only as data marks (a stat tile\'s pebble sparkline, pebble progress of five pebbles filling left to right, the pebble-shaped avatar and row glyph).',
    pressText: 'The main pill moves one step darker in light mode (lighter in dark) and scales to 0.985 over 140 ms ease-out; secondary and text controls take a `--pri-tint` wash.',
  },
  'toy-press': {
    cls: 'hard',
    shadowToken: '--lip', edgeToken: '--edge',
    line: 2,
    sh: { x: 0, y: 4, blur: 0 }, lift: { x: 0, y: 0 }, press: { dx: 0, dy: 4, ms: 80 },
    motion: { fast: 80, base: 140, slow: 220, ease: 'out' },
    surface: 'A flat toy-keycap kit. Every pressable (main key, secondary key, icon key, segment, checkbox, switch track and knob, tab, a pressed list row) sits on a solid lip of its own darker shade: `box-shadow: 0 4px 0 <lip>` under 52pt keys and 3px under small controls; the lip is the face shaded darker (HSL lightness down 9 to 24 points, same hue, never black, never blurred, one depth per size everywhere). The main key\'s lip is `--lip` (the primary shaded); secondary keys, fields, boxes and the switch track use `--edge` as their 2px border and lip. Cards and list rows are flat trays: a 2px `--line` border with a 4px bottom border, no shadow. Corners 16pt (14pt for fields and small keys, pills for badges); no gradient anywhere. App screens carry no keycap or toy-block art; that is for the board and website.',
    pressText: 'Pressed = the control drops by its lip depth (4pt keys, 3pt small controls) while the lip collapses to 0: `transform: translateY(4px); box-shadow: 0 0 0 <lip>`, 80 ms ease-out; release returns it. Hover only lightens the face (`--pri-hover` on the main key, `--surface-2` on a secondary key) and never moves it. A switch knob drops 3pt while pressed and slides 24pt on change. No bounce. Keyboard focus is a 3pt ring in the focus colour, 3pt offset, outside the lip.',
    states: {
      pressed: ['Face unchanged; the key drops 4pt (3pt small) and its lip collapses to 0', '80 ms ease-out; a secondary key also takes `--surface-2`. No other colour change.'],
      disabled: ['A flat face (ink 10% into the canvas, 14% in dark), `--muted` label, a lip of that face shaded darker', 'Keeps its lip, never moves, ignores hover, press and focus.'],
      error: ['`--error`', 'The field border (`--edge`) and its lip become `--error` and a 12pt helper line in `--error` sits under it with an alert icon; the lip stays at its depth. Never colour alone.'],
      empty: ['`--ink` headline, `--muted` copy', 'A flat tray card (2px `--line` border, 4px bottom border) with one icon, a headline, one line of copy and one main key on its lip; no dashed outline.'],
      loading: ['`--on-primary` on the primary key', 'The main key keeps its face and its lip; its label is replaced by a progress indicator (three dots in turn, or a spinner) in `--on-primary`; no press response while it runs. With Reduce Motion the indicator sits still.'],
    },
    fixedInks: [
      { token: '--lip', light: '--ab-lip', job: 'The lip under the main key, the progress highlight\'s base and the highlight word\'s text lip: the brand primary shaded darker (same hue, lightness down 9 to 24 points, never black). Use it only as a hard 0-blur offset shadow or text-shadow, never as a fill or text colour.', decorativeOnly: false },
      { token: '--edge', light: '--ab-edge', job: 'The 2px border and the lip of secondary keys, small keys, boxes and the switch track, and the field border: the ink mixed into the canvas until it holds 3:1 against the canvas and the card.', decorativeOnly: false },
    ],
    icons: 'Stroke 2.25pt, round caps and joins, chunky 2pt-rounded corners; outline at rest, solid when selected. In a list row a glyph sits in a 12pt-rounded tile tinted `--sec-tint`.',
    iconWeight: 'bold',
    appIcon: 'Full-bleed `{primary}` tile with one chunky keycap (a rounded square in `{primary}` over a darker same-hue lip) carrying the brand initial in the heading face in `{onPrimary}`; flat, no gradient, no shadow blur.',
  },
  'live-tile': {
    cls: 'flat',
    line: 2,
    press: { opacity: 1, scale: 0.97, ms: 100 },
    motion: { fast: 100, base: 140, slow: 220, ease: 'out' },
    surface: 'Flat rectangles with zero corner radius and zero shadow everywhere (a radio stays round so it reads as a radio). Colour lives on solid tiles on a 4-column grid with 8pt gaps: the primary, the secondary, one accent tile at most per view, and an ink-tinted neutral; a tile\'s label sits bottom-left at 13pt, a count or glyph top-right. Cards and panels are the ground itself: no fill, no border. Fields and secondary buttons are 2pt-edged rectangles. The app carries no tile-wall art, no flipping tiles and no ambient motion.',
    pressText: 'The control tilts toward the finger: it scales to 0.97 over 100 ms (ease-out) and back on release, with no colour change. A focused field fills with `--ink` and sets its text in `--canvas`.',
    accentOverride: { light: '--ab-lt-acc', on: '--ab-lt-on-acc', note: 'the brand accent pushed (toward black or white) until it holds 3:1 on the ground and a label on it holds 4.5:1; it fills one tile per view and is never text or a button' },
    secondaryOverride: { light: '--ab-lt-sec', on: '--ab-lt-on-sec', note: 'the brand secondary pushed until it holds 3:1 on the ground and a label on it holds 4.5:1; it fills supporting tiles only' },
    fixedInks: [
      { token: '--tile-neutral', light: '--ab-lt-neu', on: '--ab-lt-on-neu', job: 'Neutral tile: the ink eased toward the ground until it holds 3:1 on it; the third tile colour and the avatar / icon tile.', decorativeOnly: false },
      { token: '--track', light: '--ab-lt-track', job: 'Unfilled track of a slider or progress bar: the ink eased toward the ground until it holds 3:1 on it.', decorativeOnly: false },
    ],
    states: {
      pressed: ['No colour change', 'Scales to 0.97 and back, 100 ms ease-out; no veil, no shadow.'],
      disabled: ['`--canvas` veil over the fill, `--muted` label', 'The 2pt edge of a secondary button or field stays; no press response.'],
      loading: ['`--ink` squares on `--canvas`', 'Five 5pt squares sliding left to right in a row, each 0.17 s behind the last; on the web board only. With Reduce Motion they sit still, evenly spaced.'],
    },
    reduceMotion: 'Tiles stop flipping and the five squares sit still and evenly spaced; the press tilt is dropped and the state swaps instantly.',
    icons: 'Stroke 1.5pt, square caps and joins, no rounded corners; outline at rest and filled in `--ink` when selected. A glyph sits top-right of a tile, in the tile\'s label colour.',
    appIcon: '`{canvas}` tile with one flat `{primary}` rectangle and a smaller `{secondary}` one beside it, the brand initial in the heading face, light weight, lowercase, on the larger; zero radius inside the tile, no shadow, no gradient.',
  },
  'mainframe': {
    cls: 'flat',
    line: 1,
    motion: { fast: 110, base: 110, slow: 160, ease: 'out' },
    surface: 'Layers instead of shadows, on an 8pt grid (every size and gap a multiple of 8, 4 only for fine-tuning): canvas, layer 1 (canvas shaded 4% toward the ink; cards, panels, lists, sheets) and layer 2 (8%; a field inside a card, the table header row). A component takes the next layer up from the one it sits on. Corners are 0 everywhere except a tag, which is a full pill. There is no shadow except on overlays (sheet, dialog, menu, toast): 0 2pt 6pt ink 12%, 0 16pt 32pt -8pt ink 28%. Fields are a filled layer with a 1pt bottom rule in the muted ink and no other border. Buttons are 48pt tall rectangles with the label left-aligned and the icon flush right with 16pt padding; the main one is filled `--primary`, the secondary is filled `--ink` with on-ink text, the third level is text only. Tables and lists use 1pt hairlines, a header row on layer 2 in 14pt semibold, and values in IBM Plex Mono with tabular figures. App screens carry no art: the stripe raster, the punch-card perforation divider and the hanging numbering column are board and website only.',
    pressText: 'The main button moves one step darker in light mode (lighter in dark) and the secondary one step toward the canvas, both over 110 ms ease-out with no scale or travel. Text buttons take no wash; their label dims to `--muted`.',
    states: {
      error: ['`--error`', '2pt inset outline in `--error` on the field (the bottom rule goes away) and a 12pt helper line in `--error` under it. Never colour alone.'],
    },
    icons: 'Simple 1.5pt outline glyphs on a 16pt or 24pt grid, square caps, no fills at rest; the selected tab or nav item draws a 2pt `--primary` bar, not a filled glyph.',
    appIcon: '`{canvas}` tile with the brand initial in `{primary}` cut by horizontal stripes of uneven pitch and width (the barcode-like raster), a 1pt `{ink}` hairline frame inset 8pt; flat, no gradients, no shadow.',
  },
  'tonal-shape': {
    cls: 'flat',
    line: 0,
    sh: {}, press: { ms: 180 },
    motion: { fast: 120, base: 180, slow: 280, ease: 'spring' },
    surface: 'Tonal surfaces, no shadows and no hairline borders: each container is a few percent more of the primary over the canvas than the one beneath it (low about 8%, mid 12%, high 18%; dark mirrors it over a deep tinted canvas). Buttons are full pills, cards and sheets have 28pt corners, small containers (fields, callouts, toast, menus) 12pt. Fields and unselected segments carry a 1pt `--ab-tn-outline` edge. The brand has one signature shape, seeded from its name, used only as a container: the avatar, the icon button (or floating action button), the leading icon of a list row and the empty-state icon.',
    pressText: 'A pill squishes: its corner morphs from full pill to a 12pt corner over 180 ms with a slight overshoot (`cubic-bezier(0.34, 1.56, 0.64, 1)`) while its fill moves a state-layer step (hover 10%, pressed 16% of `--on-primary` over `--primary`). An icon button in the signature shape scales to 0.92. With Reduce Motion the corner and fill change at once.',
    states: {
      pressed: ['Fill steps toward `--on-primary` (10% hover, 16% pressed); a secondary or text control takes a `--ab-tn-pc` wash', 'The pill morphs to a 12pt corner over 180 ms with a slight overshoot; an icon button scales to 0.92. Reduce Motion: instant swap, no overshoot.'],
      disabled: ['`--line` fill, `--muted` label', 'Keeps its shape; no hover or press response, no squish.'],
      empty: ['`--ink` headline, `--muted` copy', 'The brand\'s signature shape in `--ab-tn-pc` holding one outline icon, a headline, one line of copy and one pill action.'],
    },
    reduceMotion: 'The pill corner and fill swap instantly: no morph, no overshoot, no icon-button scale.',
    increaseContrast: 'Fields and segments take a 2pt `--ink` edge, `--muted` text becomes `--ink`, tonal containers get a 1pt `--ink` edge.',
    icons: 'Stroke 1.75pt, round caps and joins, outline at rest. A selected tab sits on a 60 x 32pt pill filled with `--ab-tn-pc` with the glyph in `--ab-tn-on-pc`; a list-row or empty-state icon sits inside the brand\'s signature shape filled with `--ab-tn-pc`.',
    iconWeight: 'regular',
    appIcon: 'Full-bleed `{canvas}` tile with one large signature shape (a soft rounded polygon or scalloped disc) filled with `{primary}` and the brand initial in the heading face inside it in `{onPrimary}`; flat, no shadow, no gradient.',
  },
  'wpa-screenprint': {
    cls: 'hard',
    line: 1.5,
    sh: { x: 2, y: 2, blur: 0 }, lift: { x: 3, y: 3 }, press: { dx: 2, dy: 2, ms: 120 },
    motion: { fast: 120, base: 140, slow: 220, ease: 'out' },
    surface: 'Flat rounded tiles (14px cards, 8px controls) with a 1.5px ink edge and no blur or gradient. The only depth is a hard 2px down-right offset block in the second spot ink (`--offset`) behind the main button, the stamp tags and the poster card; never behind body text. App screens carry no poster, grain, pattern or band.',
    pressText: 'The main button travels 2pt right and down while its hard offset block closes to 0, so it lands flat on the paper; hover lifts it 1pt up and left with the block at 3pt. 120 ms, ease-out. Toggles slide without bounce.',
    accentOverride: { light: '--wp-f3', on: '--wp-on-f3', note: 'the brand accent printed as spot ink 3: muted (saturation capped at 40%) and moved just far enough for a label on it to hold 4.7:1' },
    secondaryOverride: { light: '--wp-f2', on: '--wp-on-f2', note: 'the brand secondary printed as spot ink 2: muted (saturation capped at 40%) and moved just far enough for a label on it to hold 4.7:1' },
    fixedInks: [
      { token: '--forest', light: '--wp-forest', job: 'Forest ink #23392F: the deep ink of the art (near ridge, title strip) and the label colour on a light spot ink. In light mode the board draws its text in it.', decorativeOnly: false },
      { token: '--spot-1', light: '--wp-a1', job: 'Spot ink 1, the brand primary muted for print: the sun in the art and the toggle knob.', decorativeOnly: true },
      { token: '--offset', light: '--wp-off', job: 'The offset block: spot ink 2 printed 2px down and right behind the main button and the poster card.', decorativeOnly: true },
    ],
    states: { pressed: ['No colour change', 'Travels (2,2) as the hard offset block closes to 0, 120 ms ease-out, landing flat on the paper.'] },
    icons: 'Simple flat glyphs with a 2pt stroke and square caps (pine, sun, lake wave, trail marker), no gradients; the glyph in a list row sits in a small flat spot-ink tile.',
    appIcon: '`{canvas}` tile with a flat `{primary}` sun disc over two stacked ridgelines in `{secondary}` and `{ink}`, the overlap a darker third tone; no text, no gradients.',
  },
  'mid-century': {
    cls: 'flat',
    accentOverride: { light: '--mc-acc', note: 'the brand accent warmed toward 1950s yellow like the other mid-century inks' },
    secondaryOverride: { light: '--mc-sec', on: '--mc-on-sec', note: 'the brand secondary warmed toward 1950s yellow like the other mid-century inks' },
    fixedInks: [
      { token: '--mustard', light: '--mc-mustard', on: '--mc-on-mustard', job: 'Period mustard: card header bands, seals, avatar and chip fills.', decorativeOnly: false },
      { token: '--teal', light: '--mc-teal', on: '--mc-on-teal', job: 'Period teal: selected segment, switch on, focus ring, panel bands.', decorativeOnly: false },
      { token: '--tomato', light: '--mc-tomato', on: '--mc-on-tomato', job: 'Period tomato: list bands, badges, seals.', decorativeOnly: false },
      { token: '--olive', light: '--mc-olive', on: '--mc-on-olive', job: 'Period olive: quick-action bands and positive-delta dots.', decorativeOnly: false },
      { token: '--aqua', light: '--mc-aqua', on: '--mc-on-aqua', job: 'Period aqua: hover washes and icon buttons.', decorativeOnly: false },
      { token: '--walnut', light: '--mc-on-mustard', job: 'Walnut #2F2018, the poster ink: the label colour on mustard and aqua, and the line colour in art. It is already --ink in light mode; in dark mode --ink is cream, so use walnut only where a dark ink sits on a period fill.', decorativeOnly: false },
    ],
    press: { opacity: 1, ms: 180 },
    motion: { fast: 180, base: 180, slow: 280, ease: 'out' },
    surface: 'Flat warm-cream paper fills divided by thin hairlines; no shadows.',
    pressText: 'A playful tilt, no shadows: on hover the control lifts translateY(-2px) and rotates -1.2deg; pressed it drops to translateY(1px) at scale 0.98; 180 ms, ease-out. Works in both light and dark modes.',
    states: { pressed: ['No colour change', 'Hover lifts 2pt and tilts -1.2deg; pressed sits 1pt down at scale 0.98, 180 ms ease-out; no shadow.'] },
    icons: 'Simple geometric glyphs with flat fills (circle, square, triangle), no gradients; bullets are starbursts or dots.',
    appIcon: 'Full-bleed `{primary}` tile with one simple geometric shape or starburst in `{accent}`; flat, no shadow, no gradient, no text.',
  },
  'blueprint': { cls: 'flat', modes: { only: 'dark', because: 'pale linework on blueprint blue is the medium' } },
  'xerox': { cls: 'flat', surface: 'Flat fills divided by hairlines; no shadows. Dust and noise appear only on the sheet margins, never over UI text.', modes: { only: 'light', because: 'it imitates toner on white paper; there is no dark paper' } },
  'bauhaus-poster': {
    cls: 'flat',
    press: { opacity: 1, dx: 2, dy: 2, ms: 0 },
    motion: { fast: 0, base: 120, slow: 200, ease: 'out' },
    surface: 'Flat fills divided by hairlines; no shadows. Poster red #EE4035 and poster yellow #F6C90E are fixed decorative planes (art, stripes and shapes only, never text or controls); the blue plane is always the brand primary. The vertical kicker appears in the hero only. Headlines are lowercase.',
    pressText: 'Instant, no easing and no shadow: the control travels (2,2) when pressed and returns on release; colour does not change.',
    states: { pressed: ['No colour change', 'Travels (2,2) instantly (0 ms), no shadow, no easing.'] },
    fixedInks: [
      { token: '--poster-red', light: '--ab-bau-red', job: 'Poster red #EE4035: the red plane in the hero art, stripes and shapes.', decorativeOnly: true },
      { token: '--poster-yellow', light: '--ab-bau-yellow', job: 'Poster yellow #F6C90E: the yellow plane in the hero art, stripes and shapes.', decorativeOnly: true },
    ],
  },
  'editorial-serif': { cls: 'flat', surface: 'Flat fills divided by hairlines; no shadows. A drop cap is used on long-form article text only, never on cards, captions or short copy.' },
  'bento-grid': { cls: 'flat' },
  'mesh-gradient': {
    cls: 'flat',
    surface: 'Flat fills divided by hairlines; no shadows. The primary action is a 135deg two-stop gradient from `--primary` to the same hue shifted +28deg.',
    ambient: '12 to 20 s slow drift of the mesh behind the content, translate and rotate only (never scale or colour change)',
    reduceMotion: 'Replace slides and fades with an instant state swap; colour changes stay.',
  },
  'micrographics': { cls: 'flat', surface: 'Flat fills divided by hairlines; no shadows. One huge number per screen, with tiny mono micro-labels.' }, 'mixed-type': { cls: 'flat' },
  'dystopian-luxury': { cls: 'flat' }, 'naive-doodle': { cls: 'flat', surface: 'Flat fills divided by hairlines; no shadows. The ground is 24px graph paper at about 10% ink.' }, 'japanese-minimal': {
    cls: 'flat',
    surface: 'Flat fills divided by hairlines; no shadows. The accent is a fixed vermilion #BC002D (lifted only on a dark ground), not the client accent. No pattern band on the deck cover or closing.',
    accentOverride: { light: '--ab-jm-dot', note: 'a fixed vermilion (the hinomaru dot, #BC002D, lifted only on a dark ground), whatever the brand accent' },
  },
  'transit-wayfinding': { cls: 'flat', surface: 'Flat fills divided by hairlines; no shadows. Route colour appears as numbered line badges and route bars.' }, 'gorpcore': { cls: 'flat' }, 'xerox-punk': { cls: 'flat' },
  'corporate-vandalism': { cls: 'flat' },
};

// Merged build record for an aesthetic key, or null when the key has no entry (the brief then
// derives a class from the materials). Overrides replace whole fields, except states, which
// merge per state.
function aestheticBuild(key) {
  const base = typeof aestheticBaseKey === 'function' ? aestheticBaseKey(key) : key;
  const o = AESTHETIC_BUILD[base];
  if (!o) return null;
  const cls = BUILD_CLASSES[o.cls];
  const out = Object.assign({}, cls, o, { cls: o.cls });
  out.states = Object.assign({}, cls.states, o.states || {});
  return out;
}

(function validateBuild() {
  const problems = [];
  Object.keys(AESTHETIC_BUILD).forEach(k => {
    if (!BUILD_CLASSES[AESTHETIC_BUILD[k].cls]) problems.push(`${k}: unknown build class "${AESTHETIC_BUILD[k].cls}"`);
  });
  if (typeof AESTHETICS !== 'undefined') AESTHETICS.forEach(a => { if (!AESTHETIC_BUILD[a.key]) problems.push(`${a.key}: no entry in AESTHETIC_BUILD (derived from materials)`); });
  if (problems.length) console.warn('aesthetic-meta build: ' + problems.join('; '));
})();
