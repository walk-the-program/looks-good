/* ---------------------------------------------------------------------
   data.js — static reference data: fonts, curated pairings, shape/style
   presets, color scheme definitions. No logic here, just the raw palette
   of choices the rest of the app randomizes over.
------------------------------------------------------------------------ */

// Curated Google Fonts, tagged by broad category so rules.js can reason
// about pairings without hardcoding every combination.
//
// `cls` is the font's one primary class from FONT_CLASSES below. The font
// recommendations in js/aesthetic-meta.js speak in these classes.
//
// `weights` must only list weights the family actually publishes: the
// Google Fonts css2 endpoint answers 400 for the WHOLE request if any one
// family/weight is wrong, which would silently drop every webfont on the
// page. Every entry below was verified against the live endpoint.
//
// `ital: '400'` (or '400;700') marks families whose true italic is served at
// those weights; googleFamilyParam (below) then requests it so italic text is
// not a synthesized oblique.
const FONTS = [
  /* ---- Serif ---- */
  { name: 'Playfair Display', css: '"Playfair Display", Georgia, serif', category: 'serif', weights: '400;700', ital: '400', cls: 'didone' },
  { name: 'Lora', css: '"Lora", Georgia, serif', category: 'serif', weights: '400;600', ital: '400', cls: 'text-serif' },
  { name: 'Merriweather', css: '"Merriweather", Georgia, serif', category: 'serif', weights: '400;700', cls: 'text-serif' },
  { name: 'Source Serif 4', css: '"Source Serif 4", Georgia, serif', category: 'serif', weights: '400;600', ital: '400', cls: 'text-serif' },
  { name: 'Libre Baskerville', css: '"Libre Baskerville", Georgia, serif', category: 'serif', weights: '400;700', cls: 'text-serif' },
  { name: 'Cormorant Garamond', css: '"Cormorant Garamond", Georgia, serif', category: 'serif', weights: '400;600', ital: '400', cls: 'old-style' },
  { name: 'EB Garamond', css: '"EB Garamond", Georgia, serif', category: 'serif', weights: '400;600', ital: '400', cls: 'old-style' },
  { name: 'Crimson Pro', css: '"Crimson Pro", Georgia, serif', category: 'serif', weights: '400;600', cls: 'old-style' },
  { name: 'Newsreader', css: '"Newsreader", Georgia, serif', category: 'serif', weights: '400;600', ital: '400', cls: 'text-serif' },
  { name: 'Instrument Serif', css: '"Instrument Serif", Georgia, serif', category: 'serif', weights: '400', ital: '400', cls: 'soft-serif' },
  { name: 'DM Serif Display', css: '"DM Serif Display", Georgia, serif', category: 'serif', weights: '400', cls: 'didone' },
  { name: 'Libre Caslon Text', css: '"Libre Caslon Text", Georgia, serif', category: 'serif', weights: '400;700', ital: '400', cls: 'old-style' },
  { name: 'Spectral', css: '"Spectral", Georgia, serif', category: 'serif', weights: '400;600', ital: '400', cls: 'old-style' },
  { name: 'Literata', css: '"Literata", Georgia, serif', category: 'serif', weights: '400;600', ital: '400', cls: 'text-serif' },
  { name: 'Gloock', css: '"Gloock", Georgia, serif', category: 'serif', weights: '400', cls: 'soft-serif' },
  { name: 'Fraunces', css: '"Fraunces", Georgia, serif', category: 'serif', weights: '400;600', ital: '400', cls: 'soft-serif' },

  /* ---- Sans-serif ---- */
  { name: 'Inter', css: '"Inter", -apple-system, sans-serif', category: 'sans', weights: '400;500;700', cls: 'neo-grotesk' },
  { name: 'Poppins', css: '"Poppins", -apple-system, sans-serif', category: 'sans', weights: '400;600', cls: 'geometric' },
  { name: 'Work Sans', css: '"Work Sans", -apple-system, sans-serif', category: 'sans', weights: '400;600', cls: 'grotesk' },
  { name: 'DM Sans', css: '"DM Sans", -apple-system, sans-serif', category: 'sans', weights: '400;700', cls: 'geometric' },
  { name: 'Manrope', css: '"Manrope", -apple-system, sans-serif', category: 'sans', weights: '400;700', cls: 'geometric' },
  { name: 'Plus Jakarta Sans', css: '"Plus Jakarta Sans", -apple-system, sans-serif', category: 'sans', weights: '400;600', cls: 'geometric' },
  { name: 'Outfit', css: '"Outfit", -apple-system, sans-serif', category: 'sans', weights: '400;600', cls: 'geometric' },
  { name: 'Sora', css: '"Sora", -apple-system, sans-serif', category: 'sans', weights: '400;600', cls: 'geometric' },
  { name: 'Urbanist', css: '"Urbanist", -apple-system, sans-serif', category: 'sans', weights: '400;600', cls: 'geometric' },
  { name: 'Figtree', css: '"Figtree", -apple-system, sans-serif', category: 'sans', weights: '400;600', cls: 'humanist' },
  { name: 'Onest', css: '"Onest", -apple-system, sans-serif', category: 'sans', weights: '400;600', cls: 'neo-grotesk' },
  { name: 'Geist', css: '"Geist", -apple-system, sans-serif', category: 'sans', weights: '400;600', cls: 'neo-grotesk' },
  { name: 'Instrument Sans', css: '"Instrument Sans", -apple-system, sans-serif', category: 'sans', weights: '400;600', cls: 'neo-grotesk' },
  { name: 'Public Sans', css: '"Public Sans", -apple-system, sans-serif', category: 'sans', weights: '400;600', cls: 'neo-grotesk' },
  { name: 'Karla', css: '"Karla", -apple-system, sans-serif', category: 'sans', weights: '400;600', cls: 'grotesk' },
  { name: 'Rubik', css: '"Rubik", -apple-system, sans-serif', category: 'sans', weights: '400;600', cls: 'rounded' },
  { name: 'Nunito Sans', css: '"Nunito Sans", -apple-system, sans-serif', category: 'sans', weights: '400;700', cls: 'humanist' },
  { name: 'Raleway', css: '"Raleway", -apple-system, sans-serif', category: 'sans', weights: '400;600', cls: 'humanist' },
  { name: 'Montserrat', css: '"Montserrat", -apple-system, sans-serif', category: 'sans', weights: '400;700', cls: 'geometric' },
  { name: 'Lato', css: '"Lato", -apple-system, sans-serif', category: 'sans', weights: '400;700', cls: 'humanist' },
  { name: 'Josefin Sans', css: '"Josefin Sans", -apple-system, sans-serif', category: 'sans', weights: '400;600', cls: 'geometric' },
  { name: 'Archivo', css: '"Archivo", -apple-system, sans-serif', category: 'sans', weights: '400;600', cls: 'neo-grotesk' },
  { name: 'Red Hat Display', css: '"Red Hat Display", -apple-system, sans-serif', category: 'sans', weights: '400;700', cls: 'geometric' },
  { name: 'Lexend', css: '"Lexend", -apple-system, sans-serif', category: 'sans', weights: '400;600', cls: 'geometric' },
  { name: 'Jost', css: '"Jost", -apple-system, sans-serif', category: 'sans', weights: '400;600', cls: 'geometric' },
  { name: 'IBM Plex Sans', css: '"IBM Plex Sans", -apple-system, sans-serif', category: 'sans', weights: '400;600', cls: 'neo-grotesk' },
  { name: 'Space Grotesk', css: '"Space Grotesk", -apple-system, sans-serif', category: 'sans', weights: '400;600', cls: 'grotesk' },
  { name: 'Syne', css: '"Syne", -apple-system, sans-serif', category: 'sans', weights: '400;700', cls: 'grotesk' },
  { name: 'Inter Tight', css: '"Inter Tight", -apple-system, sans-serif', category: 'sans', weights: '400;500;600;700;800', cls: 'neo-grotesk' },
  { name: 'Bricolage Grotesque', css: '"Bricolage Grotesque", -apple-system, sans-serif', category: 'sans', weights: '400;600;800', cls: 'grotesk' },
  { name: 'Fredoka', css: '"Fredoka", -apple-system, sans-serif', category: 'sans', weights: '400;500;600;700', cls: 'rounded' },
  { name: 'Baloo 2', css: '"Baloo 2", -apple-system, sans-serif', category: 'sans', weights: '400;600;800', cls: 'rounded' },

  /* ---- Display ---- */
  { name: 'Bebas Neue', css: '"Bebas Neue", -apple-system, sans-serif', category: 'display', weights: '400', cls: 'condensed' },
  { name: 'Abril Fatface', css: '"Abril Fatface", Georgia, serif', category: 'display', weights: '400', cls: 'didone' },
  { name: 'Anton', css: '"Anton", -apple-system, sans-serif', category: 'display', weights: '400', cls: 'condensed' },
  { name: 'Oswald', css: '"Oswald", -apple-system, sans-serif', category: 'display', weights: '400;600', cls: 'condensed' },
  { name: 'Righteous', css: '"Righteous", -apple-system, sans-serif', category: 'display', weights: '400', cls: 'groovy' },
  { name: 'Big Shoulders Display', css: '"Big Shoulders Display", -apple-system, sans-serif', category: 'display', weights: '400;700', cls: 'condensed' },
  { name: 'Archivo Black', css: '"Archivo Black", -apple-system, sans-serif', category: 'display', weights: '400', cls: 'heavy' },
  { name: 'Dela Gothic One', css: '"Dela Gothic One", -apple-system, sans-serif', category: 'display', weights: '400', cls: 'heavy' },
  { name: 'Bodoni Moda', css: '"Bodoni Moda", Georgia, serif', category: 'display', weights: '400;700', ital: '400', cls: 'didone' },
  { name: 'Italiana', css: '"Italiana", Georgia, serif', category: 'display', weights: '400', cls: 'deco' },
  { name: 'Cinzel', css: '"Cinzel", Georgia, serif', category: 'display', weights: '400;700', cls: 'deco' },
  { name: 'Marcellus', css: '"Marcellus", Georgia, serif', category: 'display', weights: '400', cls: 'deco' },
  { name: 'Yeseva One', css: '"Yeseva One", Georgia, serif', category: 'display', weights: '400', cls: 'didone' },
  { name: 'Unbounded', css: '"Unbounded", -apple-system, sans-serif', category: 'display', weights: '400;600', cls: 'wide' },
  { name: 'Michroma', css: '"Michroma", -apple-system, sans-serif', category: 'display', weights: '400', cls: 'wide' },
  { name: 'Orbitron', css: '"Orbitron", -apple-system, sans-serif', category: 'display', weights: '400;600;800', cls: 'techno' },
  { name: 'Chakra Petch', css: '"Chakra Petch", -apple-system, sans-serif', category: 'display', weights: '400;500;700', cls: 'techno' },
  { name: 'Rajdhani', css: '"Rajdhani", -apple-system, sans-serif', category: 'display', weights: '400;600;700', cls: 'techno' },
  { name: 'Poiret One', css: '"Poiret One", -apple-system, sans-serif', category: 'display', weights: '400', cls: 'deco' },
  { name: 'Limelight', css: '"Limelight", Georgia, serif', category: 'display', weights: '400', cls: 'deco' },
  { name: 'Shrikhand', css: '"Shrikhand", Georgia, serif', category: 'display', weights: '400', cls: 'groovy' },
  { name: 'Bagel Fat One', css: '"Bagel Fat One", -apple-system, sans-serif', category: 'display', weights: '400', cls: 'groovy' },
  { name: 'Press Start 2P', css: '"Press Start 2P", monospace', category: 'display', weights: '400', cls: 'pixel' },
  { name: 'Silkscreen', css: '"Silkscreen", monospace', category: 'display', weights: '400;700', cls: 'pixel' },
  { name: 'Pixelify Sans', css: '"Pixelify Sans", -apple-system, sans-serif', category: 'display', weights: '400;600', cls: 'pixel' },
  { name: 'Grenze Gotisch', css: '"Grenze Gotisch", Georgia, serif', category: 'display', weights: '400;700', cls: 'blackletter' },
  { name: 'Pirata One', css: '"Pirata One", Georgia, serif', category: 'display', weights: '400', cls: 'blackletter' },
  { name: 'Cinzel Decorative', css: '"Cinzel Decorative", Georgia, serif', category: 'display', weights: '400;700', cls: 'deco' },
  { name: 'Barlow Condensed', css: '"Barlow Condensed", -apple-system, sans-serif', category: 'display', weights: '400;600;800', cls: 'condensed' },

  /* ---- Slab serif ---- */
  { name: 'Roboto Slab', css: '"Roboto Slab", Georgia, serif', category: 'slab', weights: '400;700', cls: 'slab' },
  { name: 'Zilla Slab', css: '"Zilla Slab", Georgia, serif', category: 'slab', weights: '400;600', cls: 'slab' },
  { name: 'Arvo', css: '"Arvo", Georgia, serif', category: 'slab', weights: '400;700', cls: 'slab' },
  { name: 'Bitter', css: '"Bitter", Georgia, serif', category: 'slab', weights: '400;700', cls: 'slab' },
  { name: 'Domine', css: '"Domine", Georgia, serif', category: 'slab', weights: '400;700', cls: 'text-serif' },
  { name: 'Alfa Slab One', css: '"Alfa Slab One", Georgia, serif', category: 'slab', weights: '400', cls: 'slab' },

  /* ---- Monospace ---- */
  { name: 'JetBrains Mono', css: '"JetBrains Mono", monospace', category: 'mono', weights: '400;600', cls: 'mono' },
  { name: 'IBM Plex Mono', css: '"IBM Plex Mono", monospace', category: 'mono', weights: '400;600', cls: 'mono' },
  { name: 'Space Mono', css: '"Space Mono", monospace', category: 'mono', weights: '400;700', cls: 'mono' },
  { name: 'DM Mono', css: '"DM Mono", monospace', category: 'mono', weights: '400;500', cls: 'mono' },
  { name: 'Fira Code', css: '"Fira Code", monospace', category: 'mono', weights: '400;600', cls: 'mono' },
  { name: 'Geist Mono', css: '"Geist Mono", monospace', category: 'mono', weights: '400;600', cls: 'mono' },
  { name: 'Azeret Mono', css: '"Azeret Mono", monospace', category: 'mono', weights: '400;600', cls: 'mono' },
  { name: 'VT323', css: '"VT323", monospace', category: 'mono', weights: '400', cls: 'pixel' },
  { name: 'Special Elite', css: '"Special Elite", "Courier New", monospace', category: 'mono', weights: '400', cls: 'typewriter' },
  { name: 'Courier Prime', css: '"Courier Prime", "Courier New", monospace', category: 'mono', weights: '400;700', ital: '400;700', cls: 'typewriter' },
  { name: 'Share Tech Mono', css: '"Share Tech Mono", monospace', category: 'mono', weights: '400', cls: 'mono' },
];

// Google Fonts css2 family parameter for a FONTS entry. Entries with
// `ital: '400'` also request the true italic (tuples sorted: all `0,` before
// all `1,`, weights ascending); others use the plain `:wght@` form.
function googleFamilyParam(font, weights) {
  const name = encodeURIComponent(font.name).replace(/%20/g, '+');
  const w = String(weights || font.weights || '400;700').split(';').map(Number).filter(Boolean).sort((a, b) => a - b);
  if (!font.ital) return `family=${name}:wght@${w.join(';')}`;
  const tuples = w.map(n => `0,${n}`).concat(String(font.ital).split(';').map(Number).filter(Boolean).sort((a, b) => a - b).map(n => `1,${n}`));
  return `family=${name}:ital,wght@${tuples.join(';')}`;
}

// Font class taxonomy. Every FONTS entry carries exactly one `cls` key from
// here. `label` is the plain-words name shown on the board and in the brief,
// `blurb` says what the class looks like.
const FONT_CLASSES = {
  'neo-grotesk': { label: 'neo-grotesk', blurb: 'neutral, tight, Swiss-descended sans' },
  'grotesk': { label: 'grotesk', blurb: 'quirky grotesques with character' },
  'geometric': { label: 'geometric sans', blurb: 'circle and square construction' },
  'humanist': { label: 'humanist sans', blurb: 'calligraphic, warm sans' },
  'rounded': { label: 'rounded', blurb: 'soft terminals' },
  'condensed': { label: 'condensed', blurb: 'tall, narrow display' },
  'heavy': { label: 'heavy display', blurb: 'black-weight display grotesk' },
  'wide': { label: 'wide', blurb: 'extended display' },
  'techno': { label: 'techno', blurb: 'squared, sci-fi' },
  'didone': { label: 'didone', blurb: 'high-contrast vertical stress' },
  'old-style': { label: 'old-style serif', blurb: 'garalde and Venetian text serifs' },
  'text-serif': { label: 'text serif', blurb: 'transitional and modern text serifs' },
  'soft-serif': { label: 'soft serif', blurb: 'display serifs with soft or quirky shapes' },
  'deco': { label: 'deco', blurb: 'Art Deco and inscriptional caps' },
  'groovy': { label: 'groovy', blurb: '70s fat display' },
  'pixel': { label: 'pixel', blurb: 'bitmap faces' },
  'slab': { label: 'slab serif', blurb: 'slab serifs' },
  'mono': { label: 'monospace', blurb: 'fixed-width faces' },
  'typewriter': { label: 'typewriter', blurb: 'strike-on typewriter and photocopied-office faces' },
  'blackletter': { label: 'Blackletter', blurb: 'broken-stroke gothic letters with spiked, angular forms' },
};

// Hand-picked [heading, body] combinations that are known to work. A
// shuffle leans on these most of the time so results stay usable; the rest
// of the time it draws from the wider list. Every name here must exist in
// FONTS above.
const PAIRINGS = [
  ['Playfair Display', 'Inter'],
  ['Playfair Display', 'Lato'],
  ['Fraunces', 'Work Sans'],
  ['DM Serif Display', 'DM Sans'],
  ['Cormorant Garamond', 'Montserrat'],
  ['EB Garamond', 'Inter'],
  ['Libre Baskerville', 'Karla'],
  ['Instrument Serif', 'Instrument Sans'],
  ['Newsreader', 'Public Sans'],
  ['Literata', 'Figtree'],
  ['Spectral', 'Karla'],
  ['Bodoni Moda', 'Manrope'],
  ['Bebas Neue', 'Work Sans'],
  ['Anton', 'Inter'],
  ['Oswald', 'Lora'],
  ['Archivo Black', 'Archivo'],
  ['Space Grotesk', 'Inter'],
  ['Syne', 'Lora'],
  ['Cinzel', 'Raleway'],
  ['Marcellus', 'Jost'],
  ['Roboto Slab', 'Nunito Sans'],
  ['Zilla Slab', 'Rubik'],
  ['Alfa Slab One', 'Lato'],
  ['Sora', 'Source Serif 4'],
  ['Poppins', 'Lora'],
  ['Inter Tight', 'Inter'],
  ['Bricolage Grotesque', 'DM Sans'],
  ['Fredoka', 'Nunito Sans'],
  ['Chakra Petch', 'IBM Plex Sans'],
  ['Shrikhand', 'Work Sans'],
  ['Michroma', 'IBM Plex Sans'],
];

// Shape/style archetypes. These drive border-radius, shadow, border
// weight and a small decorative motif in the preview + slides.
// `decorative` keys in use across the app: square, circle, triangle, bar, ring.
const SHAPE_PRESETS = [
  {
    key: 'minimal', name: 'Minimal & Sharp',
    radius: '4px', radiusLg: '6px',
    shadow: 'none', shadowLg: '0 1px 3px rgba(0,0,0,.08)',
    borderWidth: '1px', decorative: 'square',
    personality: 'Restrained corners, no shadow, thin hairline borders. Reads as engineering-grade, precise, trustworthy — good for technical or B2B products.',
  },
  {
    key: 'refined', name: 'Modern & Refined',
    radius: '12px', radiusLg: '16px',
    shadow: '0 2px 8px rgba(0,0,0,.05)', shadowLg: '0 12px 32px rgba(0,0,0,.06)',
    borderWidth: '1px', decorative: 'ring',
    personality: 'Medium corners with shadows light enough to read as depth rather than decoration. The current default for SaaS dashboards and product marketing sites.',
  },
  {
    key: 'soft', name: 'Soft & Friendly',
    radius: '20px', radiusLg: '28px',
    shadow: '0 6px 16px rgba(0,0,0,.10)', shadowLg: '0 16px 40px rgba(0,0,0,.14)',
    borderWidth: '0px', decorative: 'circle',
    personality: 'Large rounded corners and soft diffuse shadows feel approachable and low-friction — common in consumer apps, wellness and education brands.',
  },
  {
    key: 'classic', name: 'Corporate Classic',
    radius: '8px', radiusLg: '10px',
    shadow: '0 2px 6px rgba(0,0,0,.08)', shadowLg: '0 10px 24px rgba(0,0,0,.10)',
    borderWidth: '1px', decorative: 'bar',
    personality: 'Small consistent radius, subtle elevation. Dependable and professional — the safest default for finance, enterprise, or legal brands.',
  },
  {
    key: 'geometric', name: 'Bold & Geometric',
    radius: '0px', radiusLg: '0px',
    shadow: '6px 6px 0 var(--accent)', shadowLg: '10px 10px 0 var(--accent)',
    borderWidth: '3px', decorative: 'triangle',
    personality: 'Hard edges with an offset "sticker" shadow in the accent color. Confident and energetic — fits creative, youth or event brands.',
  },
];

// Hue-offset recipes for the 3 accent colors relative to a random base
// hue. Order is [primary, secondary, accent].
//
// 'custom' is not a real recipe — it has no offsets and is never used to
// derive colors. It's the scheme the app switches to (automatically or
// explicitly) whenever colors no longer follow any formula, so further
// primary/scheme changes stop overwriting hand-picked colors.
const COLOR_SCHEMES = {
  monochromatic: { label: 'Monochromatic', offsets: [0, 0, 0] },
  analogous: { label: 'Analogous', offsets: [0, 30, -30] },
  complementary: { label: 'Complementary', offsets: [0, 0, 180] },
  splitComplementary: { label: 'Split-Complementary', offsets: [0, 150, 210] },
  triadic: { label: 'Triadic', offsets: [0, 120, 240] },
  custom: { label: 'Custom', offsets: null },
};
