/* 45 Old Web — Handmade, Beveled, Hyperlinked. A black starfield homepage with grey bevelled windows, blue links, a visitor counter and a row of badges.
   STUB (P6 scaffold): header metadata, deck copy and placeholder art only. The builder
   replaces art(), adds tokens()/roles/materials/rules and fills css/aesthetics/old-web.css.
   Direction: docs/research/round6.md (section for this aesthetic). */
registerAesthetic({
  key: 'old-web', order: 45,
  name: 'Old Web',
  descriptor: 'Handmade · Beveled · Hyperlinked',
  influences: 'Web 1.0 homepages / Windows 95 chrome / GeoCities',
  summary: 'A black starfield homepage with grey bevelled windows, blue links, a visitor counter and a row of badges.',
  motto: 'Default HTML, made with love.',
  kicker: 'Best viewed at 800x600',
  mode: 'dark',
  slideShape: 'minimal',
  labels: { material: 'Bevels', states: ['Raised', 'Visited', 'Sunken'], statesKind: 'button' },
  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    principles: [
      ['Default HTML, made with love', 'Plain markup, earnestly decorated.'],
      ['Bevel, link, badge, repeat', 'The same few parts, used everywhere.'],
      ['Fully usable', 'Chaotic on the surface and still easy to navigate.'],
    ],
    do: [
      'Use the exact four-tone bevel on every control.',
      'Keep links blue and underlined; visited purple.',
      'Add a visitor counter and a row of badges.',
    ],
    dont: [
      'Use OS logos or real GIF assets.',
      'Add gloss or rounded buttons; that\'s Aero.',
      'Set body text on busy tiles.',
    ],
  },

  // Placeholder art: replace with the signature artwork.
  art(ctx) {
    const t = ctx.t;
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="presentation"><rect width="100" height="100" fill="${t.ink}"/><g fill="${t.canvas}"><circle cx="14" cy="16" r="1"/><circle cx="82" cy="12" r="1"/><circle cx="90" cy="70" r="1"/><circle cx="10" cy="80" r="1"/></g><rect x="18" y="26" width="64" height="48" fill="#c0c0c0" stroke="#fff" stroke-width="2"/><rect x="21" y="29" width="58" height="9" fill="${t.primary}"/><rect x="26" y="46" width="22" height="9" fill="#c0c0c0" stroke="#444" stroke-width="1.5"/><path d="M54 52h20" stroke="${t.accent}" stroke-width="2"/></svg>`;
  },

  materials: [],
  rules: { do: [], dont: [] },
});
