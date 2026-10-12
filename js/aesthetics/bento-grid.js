/* 15 Bento Grid — modular, clear, product-proud. Reference: apple.com feature
   grids, Linear / Vercel feature bentos. The whole board is a grid of rounded
   tiles (radius 28, no borders, one very soft shadow) set on a slightly darker
   canvas: a 2x2-style hero tile beside a product tile (a phone mock showing the
   brand's primary), a wide palette tile, a type tile, and each numbered section
   as its own tile grid. Stat tiles carry huge numerals; the main action is the
   one solid primary tile; one tile is secondary-tinted. */
registerAesthetic({
  key: 'bento-grid', order: 15,
  name: 'Bento Grid',
  descriptor: 'Modular · Clear · Product-proud',
  influences: 'Apple feature grids / Bento layouts / Product marketing',
  summary: 'A grid of rounded tiles, each one making a single point.',
  motto: 'One tile, one idea.',
  kicker: 'Everything in its tile',
  mode: 'light',
  slideShape: 'refined',
  labels: { material: 'Tiles', states: ['Rest', 'Hover', 'Pressed'], statesKind: 'button' },
  layout: { hero: 'split', palette: 'chips', sections: 'stacked' },
  type: { ui: 'sans', label: 'sans', display: 1 },
  highlight: 'ink',
  cardFill: '--ab-tile',

  roles: {
    canvas: {
      use: 'The board behind the grid, slightly darker than the tiles so the tiles read as raised; the gaps between tiles are canvas',
      never: 'Text, or a tile with a border',
      coverage: '25–35%',
    },
    ink: {
      use: 'Headlines, the huge stat numerals, body text and the selected segment',
      never: 'A filled tile (no black tiles in light mode)',
      coverage: '15–20%',
    },
    primary: {
      use: 'The solid action tile (01), the hero numeral tile, the headline word, the rendered primitive, switch "on" and the product mock',
      never: 'Body text, a second solid tile, tile borders',
      coverage: '≈10–12%',
    },
    secondary: {
      use: 'The product stage tint, the 72% stat tile, the status tags and every progress bar (progress is a data series)',
      never: 'The main action, body text',
      coverage: '≈10–15%',
    },
    accent: {
      use: 'One spark: the "new" dot on the product mock and the footer dot',
      never: 'Tile fills, buttons, borders',
      coverage: '≤3%',
    },
  },

  // the board is a step darker than the tiles that sit on it (light mode)
  canvas(b) {
    return b.isDark ? null : b.mix(b.canvas, b.ink, 0.95);
  },

  tokens(t) {
    const d = t.isDark;
    // interface face: the brand's own sans if it has one, else Inter (never a display face at 11px)
    const stU = typeof state !== 'undefined' ? state : null;
    const sansF = stU && [stU.bodyFont, stU.headingFont].find(f => f && f.category === 'sans');
    const uiFace = sansF ? (sansF === stU.bodyFont ? 'var(--ab-font-b)' : 'var(--ab-font-h)') : '"Inter", "Helvetica Neue", Helvetica, Arial, sans-serif';
    const tile = d ? t.mix('#ffffff', t.canvas, 0.065) : t.mix('#ffffff', t.canvas, 0.8);
    const hf = typeof state !== 'undefined' && state.headingFont;
    return {
      '--ab-font-ui': uiFace, '--ab-font-label': uiFace,
      '--ab-type-pick-w': 600,
      '--ab-tile': tile,
      '--ab-tile-sec': t.mix(t.secondary, tile, d ? 0.24 : 0.2),
      '--ab-tile-pri': t.mix(t.primary, tile, d ? 0.2 : 0.14),
      '--ab-tile-line': t.alpha(t.ink, d ? 0.1 : 0.08),
      '--ab-sub': d ? t.mix('#000000', tile, 0.2) : t.mix(t.ink, tile, 0.045),
      '--ab-shadow': d
        ? '0 1px 0 rgba(255,255,255,0.05) inset, 0 12px 30px -16px rgba(0,0,0,0.6)'
        : `0 1px 2px ${t.alpha(t.ink, 0.04)}, 0 14px 30px -18px ${t.alpha(t.ink, 0.22)}`,
      '--ab-shadow-hi': d
        ? '0 1px 0 rgba(255,255,255,0.08) inset, 0 20px 40px -16px rgba(0,0,0,0.7)'
        : `0 2px 4px ${t.alpha(t.ink, 0.05)}, 0 22px 40px -16px ${t.alpha(t.ink, 0.3)}`,
      '--ab-pri-hover': t.mix(t.primary, '#ffffff', 0.88),
      '--ab-pri-press': t.mix(t.primary, '#000000', 0.82),
      '--ab-on-pri-press': t.readable(t.mix(t.primary, '#000000', 0.82)),
    };
  },

  // The product tile: a phone showing the brand (a primary health card with a ring,
  // two list rows, a tab bar), rising from the bottom edge and cropped by it, with two
  // floating chips ("new" in accent, status in secondary). Pure HTML, sized in the
  // art box's own units (css/aesthetics/bento-grid.css).
  art(ctx) {
    const e = escapeHtml;
    const name = e(ctx.brandName);
    return `<div class="bna">
      <div class="bna-phone">
        <i class="bna-island"></i>
        <div class="bna-screen">
          <div class="bna-bar"><span>9:41</span><span class="bna-sig"><i></i><i></i><i></i></span></div>
          <div class="bna-top"><span class="bna-av">${e(ctx.initial)}</span><b>${name}</b><i class="bna-bell"></i></div>
          <div class="bna-card">
            <div><small>Brand health</small><strong>72%</strong><em>On track</em></div>
            <svg viewBox="0 0 44 44" focusable="false"><circle cx="22" cy="22" r="16" fill="none" stroke="currentColor" stroke-opacity=".25" stroke-width="5"/><circle cx="22" cy="22" r="16" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" pathLength="100" stroke-dasharray="72 100" transform="rotate(-90 22 22)"/></svg>
          </div>
          <div class="bna-row"><i class="bna-d1"></i><span>Brand refresh</span><em>In review</em></div>
          <div class="bna-row"><i class="bna-d2"></i><span>Launch site</span><em>Building</em></div>
          <div class="bna-row"><i class="bna-d3"></i><span>Spring campaign</span><em>Planned</em></div>
          <div class="bna-tabs"><i class="on"></i><i></i><i></i><i></i></div>
        </div>
      </div>
      <div class="bna-chip bna-c1"><i></i>Direction saved</div>
      <div class="bna-chip bna-c2"><b>72%</b>on track</div>
    </div>`;
  },

  materials: [
    { name: 'Board', css: 'background: {canvas}; /* a step darker than the tiles; the gaps between tiles are this color */' },
    { name: 'Tile', css: 'background: {tile}; border: 0; border-radius: 28px; box-shadow: none; /* flat on the darker canvas; no borders, no shadow; hover scale(1.01) */' },
    { name: 'Colour tile', css: 'background: the role colour; color: its readable text colour; border-radius: 28px; /* a palette swatch is a whole tile, filled edge to edge, label inside at 13px */' },
    { name: 'Primary tile (main action)', css: 'background: {primary}; color: {onPrimary}; border-radius: 28px; padding: 22px; /* the 01 action: a square tile beside the title tile, label bottom-left (22px, 600), 40px arrow circle top-right at on-primary 18%; exactly one per view; hover {priHover}, pressed {priPress} */' },
    { name: 'Secondary-tinted tile', css: 'background: {tileSec}; border-radius: 28px; /* the product stage; 20% secondary over the tile white */' },
    { name: 'Secondary-tinted stat tile', css: 'background: {secTint}; border-radius: 28px; /* the 72% tile: huge numeral in ink, tabular, tracking -0.05em; its progress bar is {secondary} */' },
    { name: 'Numeral tile', css: 'background: {primary}; color: {onPrimary}; border-radius: 28px; font-size: 120px; /* one huge number, one small label */' },
  ],

  rules: {
    do: [
      'Build every block as a rounded tile (radius 28) on a slightly darker canvas; separate tiles with a 14px gap, never a border, rule or shadow.',
      'Make each tile say one thing; give stats a huge numeral in the heading face with a small label.',
      'Fill exactly one tile solid primary (the action tile beside the title) and tint the product stage and the lead stat tile with secondary; the rest are plain tile white.',
      'Vary spans (a 2-row hero, 1x1 stats, wide bars) so one tile dominates, and put imagery or a render in most tiles.',
    ],
    dont: [
      'Add tile borders, shadows or glow; contrast between tile and canvas is the whole depth.',
      'Fill a tile with ink or accent, or place two solid primary tiles in one view.',
      'Nest a tile inside a tile; one radius level (28), controls are pills.',
      'Crowd copy: one idea per tile, with generous padding.',
    ],
  },
  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    // Patterns slide: bento has no pattern culture; its material is the tile system itself
    // (2x2, 2x1, 1x1, 1x2, annotated with spans, gap 14 and radius 28).
    patternsStage(ctx) {
      const tile = (cls, span, name) => `<div class="bns-t ${cls}"><b>${span}</b><span>${name}</span></div>`;
      return `<div class="bns">
        ${tile('bns-22', '2×2', 'Hero tile')}
        ${tile('bns-21', '2×1', 'Wide tile')}
        ${tile('bns-11', '1×1', 'Stat tile')}
        ${tile('bns-12', '1×2', 'Tall tile')}
        ${tile('bns-11b', '1×1', 'Action tile')}
        ${tile('bns-21b', '2×1', 'Gap 14 · radius 28 · no borders')}
      </div>`;
    },
    // Material slide: the tile materials as a small bento (flat tile, colour tile, numeral
    // tile, render tile), instead of repeating the hero phone.
    materialArt(ctx) {
      return `<div class="bnm">
        <div class="bnm-t bnm-render"><span>Render tile</span></div>
        <div class="bnm-t bnm-num"><b>72%</b><span>Numeral tile</span></div>
        <div class="bnm-t bnm-colour"><span>Colour tile</span></div>
        <div class="bnm-t bnm-flat"><b>One idea.</b><span>Flat tile</span></div>
      </div>`;
    },
    principles: [
      ['One tile, one idea', 'Each block says a single thing, with room around it.'],
      ['Rounded tiles, no borders', 'Radius 28, flat on a darker canvas, 14px gaps.'],
      ['One tile leads', 'A two-row hero; stats get one huge numeral.'],
    ],
    do: [
      'Build every block as a rounded tile.',
      'Give stats a huge numeral and a small label.',
      'Let one tile dominate the grid.',
    ],
    dont: [
      'Add tile borders or heavy shadows.',
      'Fill a tile with ink or accent.',
      'Nest a tile inside a tile.',
    ],
  },
});
