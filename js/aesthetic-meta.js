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

// Avoid lists may use two pseudo classes that are not a FONTS `cls`:
// 'serif' (every serif-ish class below) and 'script' (the library has none yet).
const AESTHETIC_SERIF_CLASSES = ['didone', 'old-style', 'text-serif', 'soft-serif', 'deco', 'slab'];

const AESTHETIC_META = {
  'soft-form': {
    family: 'tactile',
    fonts: {
      heading: { classes: ['neo-grotesk', 'geometric'], picks: ['Inter Tight', 'Instrument Sans', 'Manrope'] },
      body: { classes: ['neo-grotesk'], picks: ['Inter', 'Instrument Sans'] },
      avoid: ['didone', 'condensed', 'pixel', 'groovy'],
      why: 'Soft, tactile surfaces need a quiet face, so a neutral grotesk lets the shadows and materials carry the personality.',
      pairings: [['Inter Tight', 'Inter'], ['Manrope', 'Inter'], ['Instrument Sans', 'Instrument Sans']],
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
      heading: { classes: ['grotesk', 'geometric', 'heavy'], picks: ['Space Grotesk', 'Bricolage Grotesque', 'Lexend'] },
      body: { classes: ['grotesk', 'geometric'], picks: ['Space Grotesk', 'DM Sans', 'Rubik'] },
      avoid: ['text-serif', 'old-style', 'deco', 'didone'],
      why: 'Chunky outlines and stickers pair with grotesks that have attitude and weight, never delicate or thin-stroked serifs.',
      pairings: [['Bricolage Grotesque', 'DM Sans'], ['Space Grotesk', 'Space Grotesk'], ['Lexend', 'Rubik']],
    },
  },
  'retro-futurist': {
    family: 'luminous',
    fonts: {
      heading: { classes: ['wide', 'techno', 'condensed'], picks: ['Michroma', 'Orbitron', 'Unbounded', 'Big Shoulders Display'] },
      body: { classes: ['neo-grotesk'], picks: ['IBM Plex Sans', 'Inter'] },
      mono: { picks: ['Space Mono', 'IBM Plex Mono', 'VT323'], note: 'VT323 for readouts' },
      avoid: ['old-style', 'rounded', 'groovy'],
      why: 'Mission-control panels read as engineered when headlines are wide or techno and the body stays a plain grotesk, with mono for readouts.',
      pairings: [['Michroma', 'IBM Plex Sans'], ['Unbounded', 'Inter'], ['Orbitron', 'IBM Plex Sans']],
    },
  },
  'liquid-glass': {
    family: 'tactile',
    fonts: {
      heading: { classes: ['neo-grotesk'], picks: ['Inter Tight', 'Geist', 'Onest'] },
      body: { classes: ['neo-grotesk'], picks: ['Inter', 'Geist'] },
      avoid: ['slab', 'didone', 'condensed', 'pixel'],
      why: 'Translucent layers are busy enough, so the type stays a clean neo-grotesk that holds its shape over blur.',
      pairings: [['Inter Tight', 'Inter'], ['Geist', 'Geist'], ['Onest', 'Inter']],
    },
  },
  'holo-iridescent': {
    family: 'luminous',
    fonts: {
      heading: { classes: ['wide', 'soft-serif', 'geometric'], picks: ['Unbounded', 'Syne', 'Instrument Serif', 'Sora'] },
      body: { classes: ['neo-grotesk'], picks: ['Inter', 'Geist'] },
      avoid: ['slab', 'condensed', 'old-style'],
      why: 'Foil and spectrum do the decorating, so an extended or soft-serif headline adds luxury-packaging polish over a neutral body.',
      pairings: [['Syne', 'Inter'], ['Instrument Serif', 'Geist'], ['Unbounded', 'Inter']],
    },
  },
  'aurora-noir': {
    family: 'digital',
    fonts: {
      heading: { classes: ['neo-grotesk'], picks: ['Inter Tight', 'Geist', 'Inter'] },
      body: { classes: ['neo-grotesk'], picks: ['Inter', 'Geist'] },
      mono: { picks: ['Geist Mono', 'JetBrains Mono'] },
      avoid: ['soft-serif', 'rounded', 'groovy', 'deco'],
      why: 'Dev-tool interfaces read as precise because the face disappears; a neutral neo-grotesk at tight tracking is the whole voice.',
      pairings: [['Inter Tight', 'Inter'], ['Geist', 'Geist'], ['Inter', 'Inter']],
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
  'neo-deco': {
    family: 'luminous',
    fonts: {
      heading: { classes: ['deco', 'didone'], picks: ['Poiret One', 'Limelight', 'Italiana', 'Cinzel', 'Bodoni Moda'] },
      body: { classes: ['geometric'], picks: ['Jost', 'Josefin Sans', 'Raleway'], note: 'light weights' },
      avoid: ['heavy', 'pixel', 'rounded', 'grotesk'],
      why: 'Gilded symmetry wants inscriptional or high-contrast display caps, set wide, over a light geometric sans.',
      pairings: [['Italiana', 'Jost'], ['Limelight', 'Josefin Sans'], ['Cinzel', 'Raleway']],
    },
  },
  'y2k-chrome': {
    family: 'luminous',
    fonts: {
      heading: { classes: ['wide', 'heavy'], picks: ['Unbounded', 'Syne', 'Dela Gothic One', 'Michroma'] },
      body: { classes: ['geometric'], picks: ['Sora', 'Outfit', 'Plus Jakarta Sans'] },
      avoid: ['old-style', 'slab', 'text-serif'],
      why: 'Chrome lettering needs heavy, wide forms to hold the metallic gradient, with a clean geometric sans for the copy.',
      pairings: [['Unbounded', 'Sora'], ['Dela Gothic One', 'Outfit'], ['Syne', 'Plus Jakarta Sans']],
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
      heading: { classes: ['geometric', 'neo-grotesk'], picks: ['Sora', 'Plus Jakarta Sans', 'Inter Tight', 'Manrope'] },
      body: { classes: ['neo-grotesk'], picks: ['Inter', 'Public Sans'] },
      avoid: ['slab', 'condensed', 'pixel'],
      why: 'Fintech marketing reads confident in a geometric or neo-grotesk headline at tight tracking, over crisp, quiet cards.',
      pairings: [['Sora', 'Inter'], ['Plus Jakarta Sans', 'Inter'], ['Inter Tight', 'Public Sans']],
    },
  },
  'industrial-device': {
    family: 'tactile',
    fonts: {
      heading: { classes: ['grotesk', 'neo-grotesk'], picks: ['Space Grotesk', 'Inter', 'Archivo'] },
      body: { classes: ['neo-grotesk'], picks: ['Inter', 'IBM Plex Sans'] },
      mono: { picks: ['Azeret Mono', 'IBM Plex Mono', 'Space Mono'] },
      avoid: ['serif', 'rounded', 'groovy'],
      why: 'Device panels read as machined with a precise grotesk and monospace labels, never serif or rounded.',
      pairings: [['Space Grotesk', 'Inter'], ['Archivo', 'IBM Plex Sans'], ['Inter', 'Inter']],
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
  'groovy-70s': {
    family: 'graphic',
    fonts: {
      heading: { classes: ['groovy', 'soft-serif'], picks: ['Shrikhand', 'Bagel Fat One', 'Righteous', 'Fraunces'] },
      body: { classes: ['humanist', 'soft-serif'], picks: ['Work Sans', 'Rubik', 'Lora'] },
      avoid: ['techno', 'mono', 'condensed', 'pixel'],
      why: '70s supergraphics need a fat, soft display face and a warm body that feels printed rather than engineered.',
      pairings: [['Shrikhand', 'Work Sans'], ['Fraunces', 'Rubik'], ['Bagel Fat One', 'Lora']],
    },
  },
  'blueprint': {
    family: 'print',
    fonts: {
      heading: { classes: ['neo-grotesk', 'condensed'], picks: ['Archivo', 'IBM Plex Sans', 'Big Shoulders Display'] },
      body: { classes: ['mono'], picks: ['IBM Plex Mono', 'JetBrains Mono'] },
      mono: { picks: ['IBM Plex Mono', 'Space Mono'] },
      avoid: ['groovy', 'deco', 'soft-serif', 'rounded'],
      why: 'Technical drawings use plain engineering lettering: a neutral or condensed sans for titles and monospace for annotations.',
      pairings: [['IBM Plex Sans', 'IBM Plex Mono'], ['Archivo', 'JetBrains Mono'], ['Big Shoulders Display', 'IBM Plex Mono']],
    },
  },
  'blob-tracking': {
    family: 'digital',
    fonts: {
      heading: { classes: ['neo-grotesk'], picks: ['Inter Tight', 'Geist', 'Archivo'] },
      body: { classes: ['neo-grotesk'], picks: ['Inter', 'Geist'] },
      mono: { picks: ['Geist Mono', 'JetBrains Mono', 'IBM Plex Mono'] },
      avoid: ['serif', 'rounded', 'groovy', 'deco'],
      why: 'Detection overlays read as clinical when the headline is a neutral grotesk and every ID, coordinate and confidence label is mono.',
      pairings: [['Inter Tight', 'Inter'], ['Geist', 'Geist'], ['Archivo', 'Inter']],
    },
  },
  'xerox': {
    family: 'print',
    fonts: {
      heading: { classes: ['condensed', 'heavy'], picks: ['Anton', 'Archivo Black', 'Bebas Neue'] },
      body: { classes: ['typewriter', 'grotesk'], picks: ['Courier Prime', 'Special Elite', 'Work Sans'] },
      mono: { picks: ['Courier Prime'] },
      avoid: ['rounded', 'soft-serif', 'deco', 'geometric'],
      why: 'A photocopied flyer needs one blunt, heavy headline face over typewriter or plain grotesk text, because copying turns anything delicate to mush.',
      pairings: [['Anton', 'Courier Prime'], ['Archivo Black', 'Work Sans'], ['Bebas Neue', 'Special Elite']],
    },
  },
  'micrographics': {
    family: 'graphic',
    fonts: {
      heading: { classes: ['neo-grotesk', 'heavy'], picks: ['Inter Tight', 'Archivo Black', 'Geist'] },
      body: { classes: ['neo-grotesk'], picks: ['Inter', 'IBM Plex Sans'] },
      mono: { picks: ['Geist Mono', 'Azeret Mono', 'IBM Plex Mono'] },
      avoid: ['serif', 'groovy', 'rounded', 'deco'],
      why: 'One huge neutral headline against 8px mono microtype is the whole contrast, so both faces must stay precise and stay out of each other\'s way.',
      pairings: [['Inter Tight', 'Inter'], ['Archivo Black', 'IBM Plex Sans'], ['Geist', 'Geist']],
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
      heading: { classes: ['mono', 'pixel'], picks: ['JetBrains Mono', 'IBM Plex Mono', 'VT323', 'Space Mono'] },
      body: { classes: ['mono'], picks: ['IBM Plex Mono', 'JetBrains Mono'] },
      mono: { picks: ['VT323'] },
      avoid: ['serif', 'rounded', 'groovy', 'deco'],
      why: 'Characters on a grid are the medium, so every face is fixed-width and the headline is a mono or a pixel font.',
      pairings: [['JetBrains Mono', 'IBM Plex Mono'], ['VT323', 'JetBrains Mono'], ['Space Mono', 'IBM Plex Mono']],
    },
  },
  'rebus': {
    family: 'graphic',
    fonts: {
      heading: { classes: ['heavy', 'geometric', 'rounded'], picks: ['Bricolage Grotesque', 'Archivo Black', 'Lexend', 'Fredoka'] },
      body: { classes: ['geometric', 'neo-grotesk'], picks: ['DM Sans', 'Inter'] },
      avoid: ['didone', 'old-style', 'techno', 'pixel'],
      why: 'Flat pictograms sit in the line at the weight of the letters, so the headline needs a heavy, friendly sans that matches their bold shapes.',
      pairings: [['Bricolage Grotesque', 'DM Sans'], ['Archivo Black', 'Inter'], ['Fredoka', 'DM Sans']],
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
    (f.avoid || []).forEach(c => { if (!classes.has(c) && c !== 'serif' && c !== 'script') problems.push(`${key}.avoid: unknown class "${c}"`); });
    [].concat(f.heading.picks, f.body.picks, f.mono ? f.mono.picks : [], ...(f.pairings || []))
      .forEach(n => { if (!names.has(n)) problems.push(`${key}: font "${n}" is not in FONTS`); });
    if (!f.pairings || !f.pairings.length) problems.push(`${key}: no pairings`);
  });
  if (typeof AESTHETICS !== 'undefined') {
    AESTHETICS.forEach(a => { if (!AESTHETIC_META[a.key]) problems.push(`${a.key}: no entry in AESTHETIC_META`); });
  }
  if (problems.length) console.warn('aesthetic-meta: ' + problems.join('; '));
})();
