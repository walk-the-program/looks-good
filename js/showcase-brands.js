/* ---------------------------------------------------------------------
   showcase-brands.js — twelve fictional brands that look good, so the library
   never opens on "Acme Co." and a demo always has something real to click.

   Each one has a hand-picked palette, font pairing and one of the owner's favourite
   aesthetics, plus believable copy and an original geometric logo drawn as SVG.
   Every name, tagline and quote is invented.

   ShowcaseBrands.load() adds the ones whose name is not already in the library
   (matching is by name, ignoring case), through the same path as any new brand, and
   never touches brands that are there already.

   Depends on onboarding.js (createFromPreset), library-store.js. Plain <script>.
------------------------------------------------------------------------ */

const ShowcaseBrands = (function () {
  'use strict';

  /* ---------- logos: a geometric mark plus the name, as SVG ----------
     Text is fitted with textLength so it holds its width in any system font. */

  const MARKS = {
    // a coffee cup seen from above: ring, crema half-moon, steam dot
    kiln: (c) => `<circle cx="24" cy="24" r="22" fill="${c.p}"/><path d="M24 9a15 15 0 0 1 0 30z" fill="${c.s}"/><circle cx="24" cy="24" r="6" fill="${c.bg}"/>`,
    // four tiles, one of them turned
    tessel: (c) => `<rect x="3" y="3" width="19" height="19" rx="5" fill="${c.p}"/><rect x="26" y="3" width="19" height="19" rx="5" fill="${c.a}"/><rect x="3" y="26" width="19" height="19" rx="5" fill="${c.s}"/><rect x="26" y="26" width="19" height="19" rx="9.5" fill="${c.ink}"/>`,
    // an orbit: ring, tilted ring, planet
    orrery: (c) => `<circle cx="24" cy="24" r="20" fill="none" stroke="${c.p}" stroke-width="4"/><ellipse cx="24" cy="24" rx="20" ry="8" fill="none" stroke="${c.s}" stroke-width="3" transform="rotate(-28 24 24)"/><circle cx="24" cy="24" r="6.5" fill="${c.a}"/>`,
    // a peak and a rope line
    highline: (c) => `<path d="M2 42 20 8l11 20 5-8 10 22z" fill="${c.p}"/><path d="M20 8l7 13-7 6-6-6z" fill="${c.s}"/><rect x="2" y="42" width="44" height="4" fill="${c.ink}"/>`,
    // a page with a folded corner
    dogear: (c) => `<path d="M6 4h26l10 10v30H6z" fill="${c.p}"/><path d="M32 4v10h10z" fill="${c.s}"/><rect x="12" y="24" width="24" height="3" fill="${c.bg}"/><rect x="12" y="32" width="16" height="3" fill="${c.bg}"/>`,
    // a rising sun held in a pill
    softhours: (c) => `<rect x="4" y="6" width="40" height="36" rx="18" fill="${c.s}"/><circle cx="24" cy="30" r="12" fill="${c.p}"/><rect x="4" y="30" width="40" height="12" rx="0" fill="${c.s}"/><rect x="10" y="30" width="28" height="3" rx="1.5" fill="${c.bg}"/>`,
    // two circles and the line between flights
    layover: (c) => `<circle cx="14" cy="24" r="12" fill="${c.p}"/><circle cx="34" cy="24" r="12" fill="${c.s}"/><path d="M14 24h20" stroke="${c.bg}" stroke-width="4" stroke-linecap="round"/><circle cx="24" cy="24" r="3.4" fill="${c.a}"/>`,
    // four petals / broadcast arcs
    bloom: (c) => `<path d="M24 24V4a20 20 0 0 1 20 20z" fill="${c.p}"/><path d="M24 24h20a20 20 0 0 1-20 20z" fill="${c.s}"/><path d="M24 24v20A20 20 0 0 1 4 24z" fill="${c.a}"/><path d="M24 24H4A20 20 0 0 1 24 4z" fill="${c.ink}"/>`,
    // circle, triangle, squiggle
    parlor: (c) => `<circle cx="13" cy="14" r="9" fill="${c.p}"/><path d="M26 22h20L36 5z" fill="${c.s}"/><path d="M4 36q5-8 10 0t10 0 10 0 10 0" fill="none" stroke="${c.a}" stroke-width="5" stroke-linecap="round"/>`,
    // a lantern: cap, glass, glow
    lantern: (c) => `<rect x="16" y="2" width="16" height="5" rx="2.5" fill="${c.ink}"/><path d="M13 9h22l4 26H9z" fill="${c.p}"/><circle cx="24" cy="23" r="7" fill="${c.bg}"/><rect x="11" y="37" width="26" height="6" rx="3" fill="${c.ink}"/>`,
    // a crescent moon over a line
    vesper: (c) => `<circle cx="24" cy="24" r="21" fill="${c.p}"/><circle cx="33" cy="17" r="17" fill="${c.bg}"/><circle cx="38" cy="36" r="3" fill="${c.a}"/>`,
    // a civic building: roof and three columns
    municipal: (c) => `<path d="M24 3 46 16H2z" fill="${c.p}"/><rect x="7" y="20" width="8" height="19" fill="${c.s}"/><rect x="20" y="20" width="8" height="19" fill="${c.s}"/><rect x="33" y="20" width="8" height="19" fill="${c.s}"/><rect x="3" y="42" width="42" height="4" fill="${c.ink}"/>`,
  };

  // letterCase: how the wordmark is set; weight and tracking make each one different.
  function logoSvg(b) {
    // Which way the wordmark reads depends on what the aesthetic puts behind the logo (Gorpcore
    // sets it on a dark band even in light mode, Old Web on a light window bar even in dark mode).
    const light = b.logo.ink ? b.logo.ink === 'light' : b.bgMode === 'dark';
    const bg = light ? b.colors.neutralDark : b.colors.neutralLight;
    const ink = light ? b.colors.neutralLight : b.colors.neutralDark;
    const c = { p: b.colors.primary, s: b.colors.secondary, a: b.colors.accent, bg, ink };
    const text = b.logo.caps ? b.name.toUpperCase() : b.name;
    const size = b.logo.size || 21;
    const textW = Math.round(text.length * size * (b.logo.caps ? 0.78 : 0.56) * (b.logo.wide || 1));
    const W = 48 + 12 + textW;
    const family = b.logo.family || 'Avenir Next, Helvetica Neue, Arial, sans-serif';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} 48" width="${W * 2}" height="96"><g>${MARKS[b.logo.mark](c)}</g>`
      + `<text x="60" y="${24 + Math.round(size * 0.36)}" font-family="${family}" font-size="${size}" font-weight="${b.logo.weight || 700}" fill="${ink}" textLength="${textW}" lengthAdjust="spacingAndGlyphs"${b.logo.style ? ` font-style="${b.logo.style}"` : ''}>${text.replace(/&/g, '&amp;')}</text></svg>`;
  }
  function svgUrl(svg) {
    return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
  }

  /* ---------- the brands ----------
     mode 'dark' / 'light' follows the aesthetic's own recommended mode. */

  const BRANDS = [
    {
      id: 'little-kiln', name: 'Little Kiln Coffee', tagline: 'Roasted small. Poured slow.',
      aesthetic: 'naive-doodle', bgMode: 'light',
      colors: { primary: '#b5472a', secondary: '#f0b84a', accent: '#2f6b57', neutralDark: '#2a1c15', neutralLight: '#fbf3e6' },
      headingFont: 'Fraunces', bodyFont: 'Work Sans',
      content: { sectionTitle: 'From our roastery', quoteText: 'The first cup on a Thursday is always the best one.', quoteAuthor: 'Ines, head roaster' },
      logo: { mark: 'kiln', weight: 700, family: 'Georgia, Times New Roman, serif', size: 20 },
    },
    {
      id: 'tessel', name: 'Tessel', tagline: 'Money that keeps up with you.',
      aesthetic: 'bento-grid', bgMode: 'light',
      colors: { primary: '#3345e0', secondary: '#bfcaff', accent: '#0f9d7a', neutralDark: '#0f1430', neutralLight: '#f4f6ff' },
      headingFont: 'Inter Tight', bodyFont: 'Inter',
      content: { sectionTitle: 'Everything in one place', quoteText: 'I stopped checking five apps. Now I open one.', quoteAuthor: 'Dara, early user' },
      logo: { mark: 'tessel', weight: 700, size: 24 },
    },
    {
      id: 'orrery', name: 'Orrery', tagline: 'Sound, in orbit.',
      aesthetic: 'acid-graphics', bgMode: 'dark',
      colors: { primary: '#c8f23a', secondary: '#ff3dd6', accent: '#2fd8f0', neutralDark: '#0b0b12', neutralLight: '#f1f1f8' },
      headingFont: 'Michroma', bodyFont: 'IBM Plex Sans',
      content: { sectionTitle: 'Built by hand, one at a time', quoteText: 'It sounds like the inside of a clock that learned to sing.', quoteAuthor: 'Mika, producer' },
      logo: { mark: 'orrery', weight: 700, caps: true, size: 21, wide: 1.1 },
    },
    {
      id: 'highline', name: 'Highline Climbing', tagline: 'Climb something today.',
      aesthetic: 'gorpcore', bgMode: 'light',
      colors: { primary: '#e0560f', secondary: '#2d4a3a', accent: '#f0c22b', neutralDark: '#18221d', neutralLight: '#f1efe6' },
      headingFont: 'Barlow Condensed', bodyFont: 'Barlow',
      content: { sectionTitle: 'Routes reset every week', quoteText: 'I came for the walls. I stayed for the Tuesday crew.', quoteAuthor: 'Priya, member since 2022' },
      logo: { mark: 'highline', ink: 'light', weight: 800, caps: true, size: 19, family: 'Arial Narrow, Helvetica Neue, Arial, sans-serif', wide: 0.95 },
    },
    {
      id: 'dog-ear', name: 'Dog-Ear Books', tagline: 'Used, loved, loudly recommended.',
      aesthetic: 'xerox-punk', bgMode: 'dark',
      colors: { primary: '#ff4a1c', secondary: '#f7d33b', accent: '#38b6ff', neutralDark: '#121212', neutralLight: '#f4efe2' },
      headingFont: 'Bebas Neue', bodyFont: 'Special Elite',
      content: { sectionTitle: 'Staff picks', quoteText: 'Every book here was read by someone who could not stop talking about it.', quoteAuthor: 'Theo, owner' },
      logo: { mark: 'dogear', weight: 800, caps: true, size: 19, family: 'Courier New, Courier, monospace', wide: 1.0 },
    },
    {
      id: 'soft-hours', name: 'Soft Hours', tagline: 'Skin care for slow mornings.',
      aesthetic: 'soft-form', bgMode: 'light',
      colors: { primary: '#a85a4a', secondary: '#ecd0c4', accent: '#6f8f78', neutralDark: '#2b2322', neutralLight: '#f6eeeb' },
      headingFont: 'Manrope', bodyFont: 'Inter',
      content: { sectionTitle: 'Made in small batches', quoteText: 'The first moisturiser I have ever finished.', quoteAuthor: 'Hana, verified buyer' },
      logo: { mark: 'softhours', weight: 600, size: 22 },
    },
    {
      id: 'layover', name: 'Layover', tagline: 'Plan the part between flights.',
      aesthetic: 'mesh-gradient', bgMode: 'light',
      colors: { primary: '#5a3ff0', secondary: '#ff8a5c', accent: '#14b8b0', neutralDark: '#1a1436', neutralLight: '#f7f4ff' },
      headingFont: 'Plus Jakarta Sans', bodyFont: 'Inter',
      content: { sectionTitle: 'Cities worth missing a connection for', quoteText: 'We booked one trip and found three more on the way.', quoteAuthor: 'Sam and Rue, travellers' },
      logo: { mark: 'layover', weight: 700, size: 24 },
    },
    {
      id: 'static-bloom', name: 'Static Bloom Records', tagline: 'Independent music from the edge of the dial.',
      aesthetic: 'pirate-broadcast', bgMode: 'dark',
      colors: { primary: '#ff4f5e', secondary: '#ffd23f', accent: '#43e0a2', neutralDark: '#131017', neutralLight: '#f0eadd' },
      headingFont: 'Bebas Neue', bodyFont: 'IBM Plex Mono',
      content: { sectionTitle: 'New on the label', quoteText: 'We press what we cannot stop listening to.', quoteAuthor: 'Lou, label founder' },
      logo: { mark: 'bloom', weight: 800, caps: true, size: 17, family: 'Menlo, Courier New, monospace', wide: 0.95 },
    },
    {
      id: 'parlor-toys', name: 'Parlor Toys', tagline: 'Toys that are a little bit too fun.',
      aesthetic: 'radical-memphis', bgMode: 'light',
      colors: { primary: '#d8206a', secondary: '#ffd60a', accent: '#00a99d', neutralDark: '#1d1748', neutralLight: '#fff8ec' },
      headingFont: 'Archivo Black', bodyFont: 'DM Sans',
      content: { sectionTitle: 'Our wobbliest bestsellers', quoteText: 'My kid ignored the box. My coworkers fought over the toy.', quoteAuthor: 'Jo, customer' },
      logo: { mark: 'parlor', weight: 900, size: 22, family: 'Arial Black, Helvetica Neue, Arial, sans-serif', wide: 1.05 },
    },
    {
      id: 'lantern-web', name: 'Lantern Web Co-op', tagline: 'Small web hosting, run by people.',
      aesthetic: 'old-web', bgMode: 'dark',
      colors: { primary: '#ffb21a', secondary: '#6fb3ff', accent: '#ff6b6b', neutralDark: '#13151e', neutralLight: '#f2eee2' },
      headingFont: 'Tinos', bodyFont: 'Tinos',
      content: { sectionTitle: 'Pages we keep lit', quoteText: 'A real person answered my email in nine minutes.', quoteAuthor: 'Marguerite, member' },
      logo: { mark: 'lantern', ink: 'dark', weight: 700, size: 19, family: 'Times New Roman, Georgia, serif', wide: 1.0 },
    },
    {
      id: 'vesper', name: 'Vesper & Co.', tagline: 'Fragrance for the hour after dusk.',
      aesthetic: 'dystopian-luxury', bgMode: 'light',
      colors: { primary: '#3b3a52', secondary: '#c9c3d6', accent: '#b0805a', neutralDark: '#16151d', neutralLight: '#f3f1f4' },
      headingFont: 'Bodoni Moda', bodyFont: 'Arimo',
      content: { sectionTitle: 'The evening collection', quoteText: 'It smells like a room you want to stay in.', quoteAuthor: 'Leila, subscriber' },
      logo: { mark: 'vesper', weight: 400, caps: true, size: 18, family: 'Didot, Bodoni 72, Georgia, serif', wide: 1.2 },
    },
    {
      id: 'municipal', name: 'Municipal Savings', tagline: 'The credit union that reads the fine print.',
      aesthetic: 'corporate-vandalism', bgMode: 'light',
      colors: { primary: '#1c4fb8', secondary: '#f5c400', accent: '#d6361e', neutralDark: '#101828', neutralLight: '#f5f6f8' },
      headingFont: 'Public Sans', bodyFont: 'Public Sans',
      content: { sectionTitle: 'Rates, plainly stated', quoteText: 'They showed me the fees before I asked.', quoteAuthor: 'Dennis, member' },
      logo: { mark: 'municipal', weight: 800, size: 19, family: 'Helvetica Neue, Arial, sans-serif', wide: 1.0 },
    },
  ];

  function presetOf(b) {
    return {
      name: b.name, tagline: b.tagline, colors: b.colors,
      headingFont: b.headingFont, bodyFont: b.bodyFont, aesthetic: b.aesthetic, bgMode: b.bgMode,
      content: b.content, logoDataUrl: svgUrl(logoSvg(b)), source: 'showcase',
    };
  }

  const nameKey = s => String(s || '').trim().toLowerCase();

  // Adds every showcase brand whose name is not in the library yet. The first one listed ends
  // up on top (the library sorts by last edit). Returns { added, skipped }.
  async function load() {
    const existing = new Set((await LibraryStore.list()).map(r => nameKey(r.name)));
    const todo = BRANDS.filter(b => !existing.has(nameKey(b.name)));
    const base = Date.now();
    for (let i = 0; i < todo.length; i++) {
      await Onboarding.createFromPreset(presetOf(todo[i]), { open: false, at: base - i * 1000 });
    }
    return { added: todo.length, skipped: BRANDS.length - todo.length };
  }

  return {
    brands: BRANDS,
    names: () => BRANDS.map(b => b.name),
    presetOf, logoSvg, svgUrl,
    // The brand the empty library animates: coffee, with its logo.
    example: () => presetOf(BRANDS[0]),
    load,
  };
})();

if (typeof window !== 'undefined') window.ShowcaseBrands = ShowcaseBrands;
