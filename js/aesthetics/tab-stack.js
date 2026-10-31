/* 52 Tab Stack — chunky, stacked, index-tab. Reference: dark operations-app screens that fan their
   categories as rounded colour cards tucked under one another like a file of index tabs, with
   chunky condensed headings, small monospace detail and white circular arrow chips. Ours, not
   1:1: the five card colours are the brand's own hues (primary, secondary, accent) plus derived
   companions, each lifted until one near-black text colour reads on it at 7:1 or better; the
   ground is a charcoal (dark) or a pale sage-grey (light); everything is a 24px card, a pill or a
   circle; headings are condensed capitals, details are mono, and the only icon chip is a circle
   with a diagonal arrow.

   Board and website only: a fanned stack of colour tab-cards carrying the brand initial and mono
   tags, with a few loose ink doodle marks (a star, a squiggle, a ring, tick lines). App screens
   (.sb-ab, .sb-kit) draw no art, doodle or texture: just the card system, the pills and the chips. */

// --- colour work -------------------------------------------------------------------------------

function tbHueDist(a, b) { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; }
const tbClamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// The one text colour for every card: the primary's hue at 7% lightness, barely tinted.
function tbOnColor(primary) {
  const h = hexToHsl(primary);
  return hslToHex(h.h, Math.min(h.s, 26), 7);
}

// A card colour: a hue and saturation, lightness raised from `l0` until `on` reads on it at 7:1.
function tbCard(h, s, l0, on) {
  let l = l0, hex = hslToHex(h, s, l);
  while (contrastRatio(hex, on) < 7 && l < 95) { l += 1; hex = hslToHex(h, s, l); }
  return hex;
}

// Five card colours: the brand's distinct hues first (primary, secondary, accent), then companions
// rotated from the first hue until there are five, each at least 30 degrees from the others. A grey
// brand stays grey (five different greys) rather than inventing a hue.
function tbCards(t) {
  const on = tbOnColor(t.primary);
  const picked = [];
  [t.primary, t.secondary, t.accent].map(hexToHsl).forEach(c => {
    if (c.s >= 12 && picked.every(p => tbHueDist(p.h, c.h) >= 24)) picked.push({ h: c.h, s: c.s });
  });
  const p0 = hexToHsl(t.primary);
  const base = picked[0] || { h: p0.h, s: p0.s };
  const sat = picked.length ? tbClamp(picked.reduce((a, p) => a + p.s, 0) / picked.length, 52, 86) : base.s;
  for (const step of [150, 210, 60, 300, 100, 260, 20, 340, 180]) {
    if (picked.length >= 5) break;
    const h = (base.h + step) % 360;
    if (picked.every(p => tbHueDist(p.h, h) >= 30)) picked.push({ h, s: base.s < 12 ? base.s : sat });
  }
  while (picked.length < 5) picked.push({ h: base.h, s: base.s < 12 ? base.s : sat });
  const L0 = [70, 73, 68, 72, 66];
  return picked.slice(0, 5).map((p, i) => tbCard(p.h, p.s < 12 ? p.s : tbClamp(p.s, 50, 88), L0[i], on));
}

// A lightness walk of one hue until it holds `floor`:1 on every ground given.
function tbPush(hex, grounds, floor, dir) {
  const h = hexToHsl(hex);
  let l = h.l, out = hex;
  while (!grounds.every(g => contrastRatio(out, g) >= floor) && l > 3 && l < 97) { l += dir; out = hslToHex(h.h, h.s, l); }
  return out;
}

registerAesthetic({
  key: 'tab-stack', order: 52,
  name: 'Tab Stack',
  descriptor: 'Stacked · Chunky · Index-tab',
  influences: 'Operations-app card stacks / Index tabs / Condensed capitals',
  summary: 'Rounded colour cards fanned like a file of index tabs, on a charcoal or sage ground, with condensed capitals, small mono details and white circular arrow chips.',
  motto: 'Stack it. Tab it. Ship it.',
  kicker: 'Tab stack',
  mode: 'dark',
  slideShape: 'soft',
  labels: { material: 'Tabs & chips', states: ['Rest', 'Hover', 'Pressed'], statesKind: 'button' },
  // Editable specimen copy (Brand > Advanced > Specimen copy).
  copy: {
    motto: { label: 'Motto', text: 'Stack it. Tab it. Ship it.', warm: 'Stack it. Tab it. Enjoy it.' },
    kicker: { label: 'Kicker above the headline', text: 'Tab stack' },
    state0: { label: 'State 1 name', text: 'Rest' },
    state1: { label: 'State 2 name', text: 'Hover' },
    state2: { label: 'State 3 name', text: 'Pressed' },
    tagA: { label: 'Stack art: first tab tag', text: 'Intake' },
    tagB: { label: 'Stack art: second tab tag', text: 'Review' },
    tagC: { label: 'Stack art: third tab tag', text: 'Build' },
    tagD: { label: 'Stack art: fourth tab tag', text: 'Ship' },
    tagE: { label: 'Stack art: front tab tag', text: 'Live' },
    artCap: { label: 'Stack art: caption', text: 'Five tabs, one file' },
    matStack: { label: 'Material slide: stacked cards', text: 'Stacked cards' },
    matStackCap: { label: 'Material slide: stacked cards caption', text: 'Each card tucks under the next' },
    matPill: { label: 'Material slide: pill and chip', text: 'Pill and chip' },
    matPillOpt: { label: 'Material slide: pill select value', text: 'This week' },
    matPillCap: { label: 'Material slide: pill caption', text: 'White pill, circular arrow chip' },
    matChart: { label: 'Material slide: chart in a card', text: 'Chart in a card' },
    matChartCap: { label: 'Material slide: chart caption', text: 'Bars filled in the card ink' },
    matSegA: { label: 'Material slide: segment one', text: 'Day' },
    matSegB: { label: 'Material slide: segment two', text: 'Week' },
    matSegC: { label: 'Material slide: segment three', text: 'Month' },
  },
  layout: { hero: 'split', palette: 'swatches', sections: 'two-col' },
  type: { ui: 'body', label: 'body', display: 1 },
  highlight: 'custom',
  highlightNote: 'The last word of the headline sits on its own small colour tab (a card colour, 0.18em corners) with the card text colour on it; never an outline and never a shadow.',
  cardFill: '--ab-tb-a',

  roles: {
    canvas: {
      use: 'The ground: a charcoal in dark mode, a pale sage-grey in light mode; the colour cards stack on it',
      never: 'A card fill, or text',
      coverage: '45–55%',
    },
    ink: {
      use: 'Headlines and body text on the ground, the selected segment fill, and the circular icon button on the ground',
      never: 'A large filled field in light mode, or text on a colour card (cards carry their own near-black)',
      coverage: '15–20%',
    },
    primary: {
      use: 'The first card colour in the stack, the main pill button, switch "on" and progress fill',
      never: 'Body text, a second main button on one view',
      coverage: '≈15%',
    },
    secondary: {
      use: 'The second card colour in the stack and the avatar fills',
      never: 'The main button, body text, the ground',
      coverage: '≈12%',
    },
    accent: {
      use: 'The third card colour in the stack and the one tab behind the highlighted headline word',
      never: 'Body text, buttons, borders',
      coverage: '≈8%',
    },
  },

  // Dark: a charcoal with the faintest tint of the primary hue. Light: a pale sage-grey leaning
  // a quarter of the way toward the primary's hue. Either is moved only as far as needed to hold
  // 7:1 against the brand ink.
  canvas(b) {
    const h = hexToHsl(b.primary);
    let g;
    if (b.isDark) {
      g = hslToHex(h.s < 10 ? hexToHsl(b.canvas).h : h.h, 8, 11.5);
      for (let l = 11.5; l > 3 && contrastRatio(b.ink, g) < 7; l -= 0.5) g = hslToHex(h.s < 10 ? hexToHsl(b.canvas).h : h.h, 8, l);
    } else {
      const delta = (((h.h - 140) % 360) + 540) % 360 - 180;     // shortest signed hue distance from sage
      const hue = h.s < 10 ? 140 : (140 + delta * 0.25 + 360) % 360;
      g = hslToHex(hue, 12, 87);
      for (let l = 87; l < 97 && contrastRatio(b.ink, g) < 7; l += 0.5) g = hslToHex(hue, 12, l);
    }
    return g;
  },

  // The primary is printed as the first card colour: a saturated colour kept at lightness where a
  // near-black label reads (dark ground), or pushed deeper until it holds 3:1 on the sage ground and
  // the readable label colour holds 4.6:1 on it (light ground).
  printPrimary(t) {
    const h = hexToHsl(t.primary);
    const s = h.s < 12 ? h.s : tbClamp(h.s, 52, 88);
    if (t.isDark) return tbCard(h.h, s, 70, tbOnColor(t.primary));
    const ok = hex => contrastRatio(hex, t.canvas) >= 3.2 && contrastRatio(hex, pickReadableText(hex)) >= 4.6;
    let l = 62, hex = hslToHex(h.h, s, l);
    while (!ok(hex) && l > 12) { l -= 1; hex = hslToHex(h.h, s, l); }
    return hex;
  },

  tokens(t, view) {
    const d = t.isDark, ground = t.canvas, ink = t.ink;
    const on = tbOnColor(t.primary);
    const hp = hexToHsl(t.primary);
    const onDark = hslToHex(hp.h, Math.min(hp.s, 20), 96);                       // light text / glyph on the near-black
    const cards = tbCards(t);
    // surfaces on the ground: a field bed, the tab bar, a sheet, a menu
    const raised = d ? t.mix(ink, ground, 0.08) : t.mix('#ffffff', ground, 0.6);
    // the white pill: ink itself in dark; a near-white in light with an edge
    const pill = d ? ink : t.mix('#ffffff', ground, 0.82);
    const onPill = d ? on : ink;
    // edges of fields, pills and unselected segments: ink eased toward the ground until 3.05:1 on every bed
    const beds = d ? [ground, raised] : [ground, raised, pill];     // dark: the pill is ink itself and carries no edge
    let edge = t.mix(ink, ground, 0.55);
    for (let k = 0.55; k <= 1.001 && beds.some(b => t.contrast(edge, b) < 3.05); k += 0.05) edge = t.mix(ink, ground, k);
    // muted text on the ground and on the raised surface
    let muted = t.muted;
    for (let k = 0.1; k <= 1.001 && [ground, raised].some(b => t.contrast(muted, b) < 4.6); k += 0.1) muted = t.mix(ink, t.muted, k);
    // the primary as text (links, a selected label) on the ground and the raised surface
    const pp = t.printPrimary;
    const priText = d ? tbPush(pp, [ground, raised], 4.6, +1) : tbPush(pp, [ground, raised], 4.6, -1);
    // hover: the primary a step toward its label colour, only while the label still reads
    let hover = t.mix(t.onPrimary, pp, 0.12);
    if (t.contrast(t.onPrimary, hover) < Math.min(4.6, t.contrast(t.onPrimary, pp))) hover = pp;
    const hf = view && view.headingFont;
    const hw = typeof abWeightNear === 'function' ? abWeightNear(hf, 800) : 800;
    return {
      '--ab-muted': muted,
      '--ab-line': t.mix(ink, ground, d ? 0.16 : 0.14),
      '--ab-tb-a': cards[0], '--ab-tb-b': cards[1], '--ab-tb-c': cards[2], '--ab-tb-d': cards[3], '--ab-tb-e': cards[4],
      '--ab-tb-on': on,
      '--ab-tb-on-dark': onDark,
      '--ab-tb-pill': pill, '--ab-tb-on-pill': onPill,
      '--ab-tb-field': d ? raised : pill,
      '--ab-tb-raised': raised,
      '--ab-tb-edge': edge,
      '--ab-pri-tint': cards[0],
      '--ab-sec-tint': cards[1],
      '--ab-primary-text': priText,
      '--ab-pri-hover': hover,
      '--ab-hw': hw,
    };
  },

  // Hero art (board, deck cover): a fanned stack of five colour tab-cards, each tucked under the next, the
  // front one carrying the brand initial; every card has a mono tag and a circular arrow chip. A few loose ink
  // marks (star, squiggle, ring, tick lines) are scattered round the stack. Website / board art only.
  art(ctx) {
    const e = escapeHtml;
    const tags = ['tagA', 'tagB', 'tagC', 'tagD', 'tagE'].map(k => abCopy(this, k));
    const cls = ['tba-a', 'tba-b', 'tba-c', 'tba-d', 'tba-e'];
    // card i: x, y, width, height, fan angle (about the bottom-left of the stack)
    const geo = [[46, 22, 372, 176, -3], [52, 72, 372, 176, -1.5], [58, 122, 372, 176, 0], [64, 172, 372, 166, 1.5], [70, 214, 372, 112, 3]];
    const cards = geo.map((g, i) => {
      const [x, y, w, h, a] = g;
      const arrow = `<g class="tba-chip" transform="translate(${x + w - 34} ${y + 27})"><circle r="15"/><path d="M-5 5 L5 -5 M-4 -5 H5 V4"/></g>`;
      const tag = `<text class="tba-tag" x="${x + 24}" y="${y + 32}">${tags[i]}</text>`;
      const rect = `<rect class="tba-card ${cls[i]}" x="${x}" y="${y}" width="${w}" height="${h}" rx="26"/>`;
      const ini = i === 4 ? `<text class="tba-ini" x="${x + 26}" y="${y + 108}">${e(ctx.initial)}</text>` : '';
      return `<g transform="rotate(${a} ${x} ${y + h})">${rect}${tag}${arrow}${ini}</g>`;
    }).join('');
    const doodles = `<g class="tba-ink" fill="none">
      <path d="M470 40 l7 18 l19 1 l-15 12 l5 19 l-16 -11 l-16 11 l5 -19 l-15 -12 l19 -1 z"/>
      <path d="M452 196 c10 -16 20 16 30 0 s20 16 30 0"/>
      <circle cx="486" cy="270" r="14"/>
      <path d="M22 70 l14 -6 M20 86 l16 0 M22 102 l14 6"/>
      <path d="M440 120 q22 -12 40 4"/>
    </g>`;
    return `<div class="tba">
      <svg class="tba-svg" viewBox="0 0 520 350" role="img" aria-label="${e(ctx.brandName || '')}" focusable="false">${cards}${doodles}</svg>
      <p class="tba-cap"><span>${abCopy(this, 'artCap')}</span><b>${e(ctx.brandName || '')}</b></p>
    </div>`;
  },

  materials: [
    { name: 'Ground', css: 'background: {canvas}; /* dark: a charcoal; light: a pale sage-grey; the cards stack on it */' },
    { name: 'Colour cards', css: 'background: {tbA} | {tbB} | {tbC} | {tbD} | {tbE}; color: {tbOn}; border-radius: 24px; /* five card colours drawn from the brand hues plus derived companions, in this order; one near-black text colour on every card; no border, no shadow */' },
    { name: 'Tab stack', css: 'margin-top: -20px; border-radius: 24px; /* a card tucks 20px under the next, later cards above earlier ones; each takes the next colour in order; the front one is whole */' },
    { name: 'Main pill button', css: 'background: {primary}; color: {onPrimary}; border-radius: 999px; min-height: 52px; /* on a card it flips to {tbOn} with {tbOnDark} text; the arrow chip is a circle in the label colour */' },
    { name: 'Pill select', css: 'background: {tbPill}; color: {tbOnPill}; border-radius: 999px; min-height: 44px; /* white pill; in light mode a 1.5px {tbEdge} edge */' },
    { name: 'Field', css: 'background: {tbField}; border: 1.5px solid {tbEdge}; border-radius: 16px; color: {ink}; /* on a card: {tbOnDark} fill, 2px {tbOn} edge */' },
    { name: 'Circular chip', css: 'width: 40px; height: 40px; border-radius: 50%; background: {ink}; color: {canvas}; /* a diagonal arrow or a plus; on a card the chip is {tbOn} with a {tbOnDark} glyph */' },
  ],

  rules: {
    do: [
      'Stack cards like index tabs: each tucks 20px under the next, 24px corners, later cards above earlier ones, one colour per card in the brand order.',
      'Put the one near-black text colour on every card; keep the ground charcoal in dark mode and sage-grey in light mode.',
      'Set headings in condensed capitals and every detail (labels, tags, numbers, buttons) in the mono body face.',
      'Use pills for selects and buttons and a plain circle for every icon button; the arrow is the diagonal one.',
      'Pull a pressed card or row up a few pixels, like drawing a tab out of the file.',
    ],
    dont: [
      'Draw doodles, tags or the fanned stack in the app; they belong on the board and the website.',
      'Add outlines, shadows or gradients to a card.',
      'Set text on a card in anything but its near-black, or add a hue that is not a brand colour or a derived companion.',
      'Use serif faces or a mixed-case heading.',
    ],
  },

  deck: {
    // Material slide: the pieces as small specimens: a stack of three cards, the pill select beside a
    // circular chip and a segmented pill, and a bar chart filled in the card ink.
    materialArt(ctx) {
      const init = ctx.initial || (ctx.brandName ? String(ctx.brandName).trim()[0] : '') || 'A';
      const I = escapeHtml(String(init).toUpperCase());
      const bars = [46, 70, 38, 86, 58, 100, 64].map(h => `<i style="height:${h}%"></i>`).join('');
      return `<div class="tbm">
        <div class="tbm-col">
          <div class="tbm-stack" aria-hidden="true"><span class="tbm-c tbm-c1">${abCopy(this, 'tagA')}</span><span class="tbm-c tbm-c2">${abCopy(this, 'tagB')}</span><span class="tbm-c tbm-c3">${I}</span></div>
          <b class="tbm-l">${abCopy(this, 'matStack')}</b><span class="tbm-cap">${abCopy(this, 'matStackCap')}</span>
        </div>
        <div class="tbm-col">
          <div class="tbm-row"><span class="tbm-pill">${abCopy(this, 'matPillOpt')}</span><span class="tbm-chip" aria-hidden="true">↗</span></div>
          <div class="tbm-seg" aria-hidden="true"><span class="is-on">${abCopy(this, 'matSegA')}</span><span>${abCopy(this, 'matSegB')}</span><span>${abCopy(this, 'matSegC')}</span></div>
          <b class="tbm-l">${abCopy(this, 'matPill')}</b><span class="tbm-cap">${abCopy(this, 'matPillCap')}</span>
        </div>
        <div class="tbm-col">
          <div class="tbm-chart" aria-hidden="true">${bars}</div>
          <b class="tbm-l">${abCopy(this, 'matChart')}</b><span class="tbm-cap">${abCopy(this, 'matChartCap')}</span>
        </div>
      </div>`;
    },
    principles: [
      ['A file of tabs', 'Colour cards tuck under one another, the front one whole.'],
      ['Capitals up front, mono behind', 'Condensed capitals lead; every detail is small mono.'],
      ['Pills and circles only', 'Selects are white pills, icon buttons are plain circles.'],
    ],
    do: [
      'Stack cards 20px apart.',
      'Keep one near-black text colour on cards.',
      'Pull a pressed card up.',
    ],
    dont: [
      'Outline or shadow a card.',
      'Put the stack art in the app.',
      'Set a heading in mixed case.',
    ],
  },
});
