/* ---------------------------------------------------------------------
   data.js — static reference data: fonts, curated pairings, shape/style
   presets, color scheme definitions. No logic here, just the raw palette
   of choices the rest of the app randomizes over.
------------------------------------------------------------------------ */

// Curated Google Fonts, tagged by broad category so rules.js can reason
// about pairings without hardcoding every combination.
//
// `weights` must only list weights the family actually publishes: the
// Google Fonts css2 endpoint answers 400 for the WHOLE request if any one
// family/weight is wrong, which would silently drop every webfont on the
// page. Every entry below was verified against the live endpoint.
const FONTS = [
  /* ---- Serif ---- */
  { name: 'Playfair Display', css: '"Playfair Display", Georgia, serif', category: 'serif', weights: '400;700' },
  { name: 'Lora', css: '"Lora", Georgia, serif', category: 'serif', weights: '400;600' },
  { name: 'Merriweather', css: '"Merriweather", Georgia, serif', category: 'serif', weights: '400;700' },
  { name: 'Source Serif 4', css: '"Source Serif 4", Georgia, serif', category: 'serif', weights: '400;600' },
  { name: 'Libre Baskerville', css: '"Libre Baskerville", Georgia, serif', category: 'serif', weights: '400;700' },
  { name: 'Cormorant Garamond', css: '"Cormorant Garamond", Georgia, serif', category: 'serif', weights: '400;600' },
  { name: 'EB Garamond', css: '"EB Garamond", Georgia, serif', category: 'serif', weights: '400;600' },
  { name: 'Crimson Pro', css: '"Crimson Pro", Georgia, serif', category: 'serif', weights: '400;600' },
  { name: 'Newsreader', css: '"Newsreader", Georgia, serif', category: 'serif', weights: '400;600' },
  { name: 'Instrument Serif', css: '"Instrument Serif", Georgia, serif', category: 'serif', weights: '400' },
  { name: 'DM Serif Display', css: '"DM Serif Display", Georgia, serif', category: 'serif', weights: '400' },
  { name: 'Libre Caslon Text', css: '"Libre Caslon Text", Georgia, serif', category: 'serif', weights: '400;700' },
  { name: 'Spectral', css: '"Spectral", Georgia, serif', category: 'serif', weights: '400;600' },
  { name: 'Literata', css: '"Literata", Georgia, serif', category: 'serif', weights: '400;600' },
  { name: 'Gloock', css: '"Gloock", Georgia, serif', category: 'serif', weights: '400' },
  { name: 'Fraunces', css: '"Fraunces", Georgia, serif', category: 'serif', weights: '400;600' },

  /* ---- Sans-serif ---- */
  { name: 'Inter', css: '"Inter", -apple-system, sans-serif', category: 'sans', weights: '400;500;700' },
  { name: 'Poppins', css: '"Poppins", -apple-system, sans-serif', category: 'sans', weights: '400;600' },
  { name: 'Work Sans', css: '"Work Sans", -apple-system, sans-serif', category: 'sans', weights: '400;600' },
  { name: 'DM Sans', css: '"DM Sans", -apple-system, sans-serif', category: 'sans', weights: '400;700' },
  { name: 'Manrope', css: '"Manrope", -apple-system, sans-serif', category: 'sans', weights: '400;700' },
  { name: 'Plus Jakarta Sans', css: '"Plus Jakarta Sans", -apple-system, sans-serif', category: 'sans', weights: '400;600' },
  { name: 'Outfit', css: '"Outfit", -apple-system, sans-serif', category: 'sans', weights: '400;600' },
  { name: 'Sora', css: '"Sora", -apple-system, sans-serif', category: 'sans', weights: '400;600' },
  { name: 'Urbanist', css: '"Urbanist", -apple-system, sans-serif', category: 'sans', weights: '400;600' },
  { name: 'Figtree', css: '"Figtree", -apple-system, sans-serif', category: 'sans', weights: '400;600' },
  { name: 'Onest', css: '"Onest", -apple-system, sans-serif', category: 'sans', weights: '400;600' },
  { name: 'Geist', css: '"Geist", -apple-system, sans-serif', category: 'sans', weights: '400;600' },
  { name: 'Instrument Sans', css: '"Instrument Sans", -apple-system, sans-serif', category: 'sans', weights: '400;600' },
  { name: 'Public Sans', css: '"Public Sans", -apple-system, sans-serif', category: 'sans', weights: '400;600' },
  { name: 'Karla', css: '"Karla", -apple-system, sans-serif', category: 'sans', weights: '400;600' },
  { name: 'Rubik', css: '"Rubik", -apple-system, sans-serif', category: 'sans', weights: '400;600' },
  { name: 'Nunito Sans', css: '"Nunito Sans", -apple-system, sans-serif', category: 'sans', weights: '400;700' },
  { name: 'Raleway', css: '"Raleway", -apple-system, sans-serif', category: 'sans', weights: '400;600' },
  { name: 'Montserrat', css: '"Montserrat", -apple-system, sans-serif', category: 'sans', weights: '400;700' },
  { name: 'Lato', css: '"Lato", -apple-system, sans-serif', category: 'sans', weights: '400;700' },
  { name: 'Josefin Sans', css: '"Josefin Sans", -apple-system, sans-serif', category: 'sans', weights: '400;600' },
  { name: 'Archivo', css: '"Archivo", -apple-system, sans-serif', category: 'sans', weights: '400;600' },
  { name: 'Red Hat Display', css: '"Red Hat Display", -apple-system, sans-serif', category: 'sans', weights: '400;700' },
  { name: 'Lexend', css: '"Lexend", -apple-system, sans-serif', category: 'sans', weights: '400;600' },
  { name: 'Jost', css: '"Jost", -apple-system, sans-serif', category: 'sans', weights: '400;600' },
  { name: 'IBM Plex Sans', css: '"IBM Plex Sans", -apple-system, sans-serif', category: 'sans', weights: '400;600' },
  { name: 'Space Grotesk', css: '"Space Grotesk", -apple-system, sans-serif', category: 'sans', weights: '400;600' },
  { name: 'Syne', css: '"Syne", -apple-system, sans-serif', category: 'sans', weights: '400;700' },

  /* ---- Display ---- */
  { name: 'Bebas Neue', css: '"Bebas Neue", -apple-system, sans-serif', category: 'display', weights: '400' },
  { name: 'Abril Fatface', css: '"Abril Fatface", Georgia, serif', category: 'display', weights: '400' },
  { name: 'Anton', css: '"Anton", -apple-system, sans-serif', category: 'display', weights: '400' },
  { name: 'Oswald', css: '"Oswald", -apple-system, sans-serif', category: 'display', weights: '400;600' },
  { name: 'Righteous', css: '"Righteous", -apple-system, sans-serif', category: 'display', weights: '400' },
  { name: 'Big Shoulders Display', css: '"Big Shoulders Display", -apple-system, sans-serif', category: 'display', weights: '400;700' },
  { name: 'Archivo Black', css: '"Archivo Black", -apple-system, sans-serif', category: 'display', weights: '400' },
  { name: 'Dela Gothic One', css: '"Dela Gothic One", -apple-system, sans-serif', category: 'display', weights: '400' },
  { name: 'Bodoni Moda', css: '"Bodoni Moda", Georgia, serif', category: 'display', weights: '400;700' },
  { name: 'Italiana', css: '"Italiana", Georgia, serif', category: 'display', weights: '400' },
  { name: 'Cinzel', css: '"Cinzel", Georgia, serif', category: 'display', weights: '400;700' },
  { name: 'Marcellus', css: '"Marcellus", Georgia, serif', category: 'display', weights: '400' },
  { name: 'Yeseva One', css: '"Yeseva One", Georgia, serif', category: 'display', weights: '400' },
  { name: 'Unbounded', css: '"Unbounded", -apple-system, sans-serif', category: 'display', weights: '400;600' },

  /* ---- Slab serif ---- */
  { name: 'Roboto Slab', css: '"Roboto Slab", Georgia, serif', category: 'slab', weights: '400;700' },
  { name: 'Zilla Slab', css: '"Zilla Slab", Georgia, serif', category: 'slab', weights: '400;600' },
  { name: 'Arvo', css: '"Arvo", Georgia, serif', category: 'slab', weights: '400;700' },
  { name: 'Bitter', css: '"Bitter", Georgia, serif', category: 'slab', weights: '400;700' },
  { name: 'Domine', css: '"Domine", Georgia, serif', category: 'slab', weights: '400;700' },
  { name: 'Alfa Slab One', css: '"Alfa Slab One", Georgia, serif', category: 'slab', weights: '400' },

  /* ---- Monospace ---- */
  { name: 'JetBrains Mono', css: '"JetBrains Mono", monospace', category: 'mono', weights: '400;600' },
  { name: 'IBM Plex Mono', css: '"IBM Plex Mono", monospace', category: 'mono', weights: '400;600' },
  { name: 'Space Mono', css: '"Space Mono", monospace', category: 'mono', weights: '400;700' },
  { name: 'DM Mono', css: '"DM Mono", monospace', category: 'mono', weights: '400;500' },
  { name: 'Fira Code', css: '"Fira Code", monospace', category: 'mono', weights: '400;600' },
  { name: 'Geist Mono', css: '"Geist Mono", monospace', category: 'mono', weights: '400;600' },
  { name: 'Azeret Mono', css: '"Azeret Mono", monospace', category: 'mono', weights: '400;600' },
];

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
