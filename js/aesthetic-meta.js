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
      heading: { classes: ['heavy', 'neo-grotesk', 'condensed'], picks: ['Archivo Black', 'Archivo'] },
      body: { classes: ['mono', 'neo-grotesk'], picks: ['IBM Plex Mono', 'Archivo'] },
      mono: { picks: ['JetBrains Mono', 'IBM Plex Mono', 'Space Mono'] },
      avoid: ['soft-serif', 'rounded', 'deco', 'groovy'],
      why: 'Severe, honest layouts want a black-weight headline or a plain grotesk, because anything decorative softens the point.',
      pairings: [['Archivo Black', 'IBM Plex Mono'], ['Archivo Black', 'Archivo'], ['Archivo', 'IBM Plex Mono']],
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
      heading: { classes: ['rounded', 'geometric'], picks: ['Rubik', 'Lexend', 'Baloo 2'] },
      body: { classes: ['rounded', 'humanist'], picks: ['Figtree', 'Nunito Sans', 'Rubik'] },
      avoid: ['condensed', 'didone', 'mono', 'techno'],
      why: 'Dimensional objects want a grown-up frame: softened corners at 600 stay friendly without reading as a children\'s app.',
      pairings: [['Rubik', 'Figtree'], ['Lexend', 'Figtree'], ['Fredoka', 'Nunito Sans']],
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
      heading: { classes: ['didone', 'soft-serif'], picks: ['Bodoni Moda', 'Playfair Display', 'Instrument Serif', 'Gloock'] },
      body: { classes: ['text-serif', 'old-style'], picks: ['Newsreader', 'Source Serif 4', 'Libre Caslon Text', 'EB Garamond'] },
      mono: { picks: ['Inter'], note: 'sans for captions' },
      avoid: ['rounded', 'techno', 'pixel', 'groovy'],
      why: 'A magazine page is carried by high-contrast serif display over a book-quality text serif, with weight coming from contrast rather than boldness.',
      pairings: [['Bodoni Moda', 'Newsreader'], ['Playfair Display', 'Source Serif 4'], ['Instrument Serif', 'Newsreader']],
    },
  },
  'neo-deco': {
    family: 'luminous',
    fonts: {
      heading: { classes: ['deco', 'didone'], picks: ['Limelight', 'Poiret One', 'Bodoni Moda', 'Italiana'] },
      body: { classes: ['geometric'], picks: ['Jost', 'Josefin Sans', 'Raleway'], note: 'light weights' },
      avoid: ['heavy', 'pixel', 'rounded', 'grotesk'],
      why: 'Brass deco wants fat display caps (Broadway / Cassandre class) with a gilt inline, or a high-contrast didone, over a light geometric sans.',
      pairings: [['Limelight', 'Josefin Sans'], ['Bodoni Moda', 'Jost'], ['Italiana', 'Jost']],
    },
  },
  'y2k-chrome': {
    family: 'luminous',
    fonts: {
      heading: { classes: ['wide', 'heavy'], picks: ['Dela Gothic One', 'Unbounded', 'Michroma', 'Syne'] },
      body: { classes: ['geometric'], picks: ['Sora', 'Outfit', 'Plus Jakarta Sans'] },
      avoid: ['old-style', 'slab', 'text-serif'],
      why: 'Chrome lettering needs heavy, wide forms to hold the metallic gradient, with a clean geometric sans for the copy.',
      pairings: [['Dela Gothic One', 'Sora'], ['Unbounded', 'Sora'], ['Syne', 'Plus Jakarta Sans']],
    },
  },
  'cyber-hud': {
    family: 'digital',
    fonts: {
      heading: { classes: ['techno', 'condensed'], picks: ['Tektur', 'Saira Condensed', 'Chakra Petch', 'Orbitron'] },
      body: { classes: ['condensed', 'neo-grotesk'], picks: ['Saira Condensed', 'IBM Plex Sans', 'Chakra Petch'] },
      mono: { picks: ['JetBrains Mono', 'Space Mono'] },
      avoid: ['serif', 'rounded', 'groovy'],
      why: 'Angular panels and live readouts call for squared techno faces, with mono for data and no serifs or soft curves.',
      pairings: [['Tektur', 'Saira Condensed'], ['Chakra Petch', 'IBM Plex Sans'], ['Orbitron', 'Rajdhani']],
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
      heading: { classes: ['pixel'], picks: ['Silkscreen', 'Jersey 10', 'Press Start 2P', 'Pixelify Sans'] },
      body: { classes: ['pixel', 'mono'], picks: ['VT323', 'Space Mono', 'JetBrains Mono'] },
      mono: { picks: ['VT323'] },
      avoid: ['serif', 'geometric', 'script'],
      why: 'Everything sits on a pixel grid, so bitmap faces keep edges crisp while VT323 or a mono handles longer text.',
      pairings: [['Silkscreen', 'VT323'], ['Jersey 10', 'VT323'], ['Press Start 2P', 'Space Mono']],
    },
  },
  'groovy-70s': {
    family: 'graphic',
    fonts: {
      heading: { classes: ['groovy', 'soft-serif'], picks: ['Bagel Fat One', 'Fraunces', 'Shrikhand', 'Righteous'] },
      body: { classes: ['humanist', 'soft-serif'], picks: ['Work Sans', 'Rubik', 'Lora'] },
      avoid: ['techno', 'mono', 'condensed', 'pixel'],
      why: '70s supergraphics need a fat, soft display face and a warm body that feels printed rather than engineered.',
      pairings: [['Bagel Fat One', 'Work Sans'], ['Fraunces', 'Rubik'], ['Shrikhand', 'Lora']],
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
      heading: { classes: ['soft-serif', 'didone', 'grotesk'], picks: ['Fraunces', 'Bricolage Grotesque', 'Instrument Serif', 'Gloock'] },
      body: { classes: ['neo-grotesk'], picks: ['Inter', 'Instrument Sans'] },
      mono: { picks: ['DM Mono', 'Space Mono'] },
      avoid: ['pixel', 'techno', 'groovy'],
      why: 'Switching between a serif italic, a heavy grotesk and a mono inside one headline works only when the rest of the page stays on one quiet face.',
      pairings: [['Fraunces', 'Instrument Sans'], ['Bricolage Grotesque', 'Inter'], ['Gloock', 'Instrument Sans']],
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
  'rebus': {
    family: 'graphic',
    fonts: {
      heading: { classes: ['slab', 'heavy'], picks: ['Zilla Slab', 'Roboto Slab', 'Arvo', 'Archivo Black'] },
      body: { classes: ['grotesk', 'neo-grotesk'], picks: ['Work Sans', 'Inter'] },
      avoid: ['didone', 'old-style', 'techno', 'pixel', 'rounded'],
      why: 'A slab or hard grotesk gives the pictograms a letter to match, as with Glaser\'s American Typewriter and Rand\'s City.',
      pairings: [['Zilla Slab', 'Work Sans'], ['Roboto Slab', 'Inter'], ['Archivo Black', 'Work Sans']],
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
  'religious-futurism': {
    family: 'luminous',
    fonts: {
      heading: { classes: ['wide', 'old-style'], picks: ['Michroma', 'Unbounded', 'Cormorant Garamond'] },
      body: { classes: ['old-style', 'neo-grotesk'], picks: ['EB Garamond', 'Inter'] },
      mono: { picks: ['DM Mono'] },
      avoid: ['groovy', 'pixel', 'rounded', 'heavy'],
      why: 'A hairline, widely tracked extended face with a quiet text serif gives the cathedral its stillness (the Dune 2021 move), with tiny mono annotations as the liturgical footnotes.',
      pairings: [['Michroma', 'EB Garamond'], ['Unbounded', 'EB Garamond'], ['Cormorant Garamond', 'EB Garamond']],
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
  'cybersigilism': {
    family: 'luminous',
    fonts: {
      heading: { classes: ['neo-grotesk', 'blackletter'], picks: ['Inter Tight', 'Grenze Gotisch', 'Texturina'] },
      body: { classes: ['neo-grotesk'], picks: ['Inter', 'Geist'] },
      mono: { picks: ['Geist Mono'] },
      avoid: ['rounded', 'groovy', 'heavy', 'pixel'],
      why: 'A thin, tight grotesk sits beside hairline art; a spiky blackletter is the only alternative, and stock fat blackletter (Pirata One) stays out.',
      pairings: [['Inter Tight', 'Inter'], ['Grenze Gotisch', 'Inter'], ['Texturina', 'Geist']],
    },
  },
  'industrial-hazard': {
    family: 'tactile',
    fonts: {
      heading: { classes: ['condensed'], picks: ['Big Shoulders Display', 'Barlow Condensed', 'Oswald', 'Anton'] },
      body: { classes: ['neo-grotesk'], picks: ['IBM Plex Sans', 'Inter'] },
      mono: { picks: ['IBM Plex Mono', 'Azeret Mono'] },
      avoid: ['serif', 'rounded', 'groovy', 'deco'],
      why: 'Stamped signage and panel legends are condensed, uppercase and blunt, with a plain grotesk for instructions and mono for serial numbers.',
      pairings: [['Big Shoulders Display', 'IBM Plex Sans'], ['Barlow Condensed', 'IBM Plex Sans'], ['Oswald', 'Inter']],
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
  'biomechanical-gothic': {
    family: 'luminous',
    fonts: {
      heading: { classes: ['old-style', 'didone'], picks: ['Cormorant Garamond', 'Italiana'] },
      body: { classes: ['text-serif', 'old-style'], picks: ['Spectral', 'EB Garamond'] },
      mono: { picks: ['IBM Plex Mono'] },
      avoid: ['rounded', 'groovy', 'pixel', 'geometric', 'blackletter'],
      why: 'Light inscriptional and high-contrast serifs read as carved relics; blackletter pushes the structure toward costume-store metal, so it stays out.',
      pairings: [['Cormorant Garamond', 'Spectral'], ['Italiana', 'Spectral'], ['Cormorant Garamond', 'EB Garamond']],
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
  'wabi-sabi': {
    family: 'tactile',
    fonts: {
      heading: { classes: ['text-serif', 'old-style'], picks: ['Shippori Mincho', 'Cormorant Garamond', 'EB Garamond'] },
      body: { classes: ['humanist'], picks: ['Zen Kaku Gothic New', 'Figtree'] },
      avoid: ['heavy', 'condensed', 'groovy', 'pixel', 'techno', 'rounded', 'hand'],
      why: 'A sharp mincho serif with a light gothic sans reads calm and crafted, and neither ever raises its voice.',
      pairings: [['Shippori Mincho', 'Zen Kaku Gothic New'], ['Cormorant Garamond', 'Zen Kaku Gothic New'], ['EB Garamond', 'Figtree']],
    },
  },
  'dark-academia': {
    family: 'print',
    fonts: {
      heading: { classes: ['old-style', 'didone'], picks: ['IM Fell English', 'Cormorant Garamond', 'Playfair Display'] },
      body: { classes: ['old-style'], picks: ['EB Garamond', 'Crimson Pro', 'Spectral'] },
      mono: { picks: ['Courier Prime'] },
      avoid: ['geometric', 'rounded', 'techno', 'pixel', 'groovy', 'wide', 'blackletter'],
      why: 'Old-style book faces with a little printing irregularity make every screen feel like a page from the stacks.',
      pairings: [['IM Fell English', 'EB Garamond'], ['Cormorant Garamond', 'Crimson Pro'], ['Playfair Display', 'Spectral']],
    },
  },
  'mid-century': {
    family: 'graphic',
    fonts: {
      heading: { classes: ['geometric', 'script', 'slab'], picks: ['Jost', 'Josefin Sans', 'Yellowtail', 'Alfa Slab One'] },
      body: { classes: ['geometric'], picks: ['Jost', 'DM Sans'] },
      avoid: ['techno', 'pixel', 'blackletter', 'mono', 'condensed', 'didone'],
      why: 'A Futura-style geometric with one brush-script word is the signature 1950s pairing.',
      pairings: [['Jost', 'DM Sans'], ['Yellowtail', 'Jost'], ['Josefin Sans', 'Karla']],
    },
  },
  'art-nouveau': {
    family: 'print',
    fonts: {
      heading: { classes: ['deco', 'soft-serif', 'old-style'], picks: ['Federant', 'Fraunces', 'Marcellus', 'Cormorant Garamond'] },
      body: { classes: ['old-style'], picks: ['EB Garamond', 'Spectral'] },
      avoid: ['techno', 'pixel', 'heavy', 'condensed', 'mono', 'geometric'],
      why: 'Period sign lettering for display and a classic Garamond for text keep ornament in the headings and clarity in the body.',
      pairings: [['Federant', 'EB Garamond'], ['Fraunces', 'Spectral'], ['Marcellus', 'Cormorant Garamond']],
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
  'big-top': {
    family: 'graphic',
    fonts: {
      heading: { classes: ['woodtype', 'slab', 'didone'], picks: ['Rye', 'Alfa Slab One', 'Abril Fatface'] },
      body: { classes: ['grotesk', 'slab'], picks: ['Karla', 'Bitter'] },
      avoid: ['techno', 'pixel', 'mono', 'blackletter', 'hand', 'wide'],
      why: 'Wood-type display faces carry the showbill, and a plain sans keeps the programme readable.',
      pairings: [['Rye', 'Karla'], ['Alfa Slab One', 'Bitter'], ['Abril Fatface', 'Karla']],
    },
  },
  'gummy': {
    family: 'tactile',
    fonts: {
      heading: { classes: ['groovy', 'rounded'], picks: ['Bagel Fat One', 'Fredoka', 'Baloo 2'] },
      body: { classes: ['humanist', 'geometric', 'rounded'], picks: ['Nunito Sans', 'DM Sans', 'Fredoka'] },
      avoid: ['serif', 'condensed', 'techno', 'blackletter', 'mono', 'typewriter'],
      why: 'Fat rounded display faces look as soft and squishy as the jelly they sit on.',
      pairings: [['Bagel Fat One', 'Nunito Sans'], ['Fredoka', 'Fredoka'], ['Baloo 2', 'DM Sans']],
    },
  },
  'curio-cabinet': {
    family: 'print',
    fonts: {
      heading: { classes: ['old-style', 'didone'], picks: ['Libre Caslon Text', 'Bodoni Moda', 'Cormorant Garamond'] },
      body: { classes: ['text-serif'], picks: ['Newsreader', 'Literata'] },
      mono: { picks: ['Courier Prime', 'DM Mono'] },
      avoid: ['heavy', 'techno', 'pixel', 'groovy', 'rounded', 'hand'],
      why: 'Caslon and typewritten labels make every item look catalogued by hand.',
      pairings: [['Libre Caslon Text', 'Newsreader'], ['Bodoni Moda', 'Literata'], ['Cormorant Garamond', 'Newsreader']],
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
