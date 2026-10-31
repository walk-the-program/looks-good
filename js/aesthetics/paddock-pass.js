/* 54 Paddock Pass — a race-day credential. Reference: the look of sci-fi motorsport tickets and
   team liveries (ideas only: no assets, names or marks). Our spin: the brand becomes a team
   livery. One hi-vis strip runs down the leading edge, drawn from the brightest of the brand's
   three colours (or a neon companion when the palette has none); a race numeral is generated from
   the brand name (FNV-1a, so the same name always gets the same number); dividers are ticket-stub
   perforations; spec rows are ruled hairlines with the label left in micro caps and the value
   right in mono.

   Ground: a pale ice blue-grey (dark: a deep navy), cards a step whiter (dark: a step lighter).
   Squared technical display type (a condensed or techno face), body in a plain grotesque, values
   in a mono face. Square corners everywhere, 4px hi-vis strip on the left edge of a card,
   rectangular buttons with a small chevron, boxed number badges as the tag component.

   Board and website only: the livery panel (race numeral in a box, angled stripe bands, chevrons,
   a dot-matrix block, tick-marked rules, a perforated stub), the full-height leading strip and the
   perforation divider. App screens (.sb-ab, the UI kit) carry no art, pattern or texture; there the
   look is type, hairline rows, square components and the 4px card strip.

   Text is only ever ink / muted / an on-* colour. The hi-vis colour is a fill (strip, badge) and its
   label is --ab-pp-hv-on; it is never text. */

/* ---------- seeded details (board / deck art, derived from the brand name) ---------- */

// Same brand name, same numbers: FNV-1a over the trimmed, lower-cased name.
function ppHash(str) {
  let h = 2166136261;
  const s = String(str == null ? '' : str).trim().toLowerCase();
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  h ^= h >>> 15; h = Math.imul(h, 2246822507) >>> 0; h ^= h >>> 13;
  return h >>> 0;
}

// Small seeded PRNG for the dot-matrix block and the stub barcode.
function ppRand(seed) {
  let a = (seed * 2654435761 + 40503) >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// The credential's data, all derived from the brand name: a two-digit race number (10..99), a
// zone, a gate and a sector time. Data, not flavour copy; the words around them are def.copy.
function ppInfo(name) {
  const h = ppHash(name);
  return {
    h,
    num: String(10 + (h % 90)),
    zone: 'Z-' + (1 + ((h >>> 8) % 12)),
    gate: 'G' + (1 + ((h >>> 13) % 9)),
    sector: (1 + ((h >>> 17) % 2)) + '.' + String(100 + ((h >>> 5) % 900)),
  };
}

/* ---------- colour ---------- */

// The ice (light) or navy (dark) ground: a trace of the brand hue over a fixed blue-grey.
function ppGround(b) {
  const h = b.hexToHsl(b.primary);
  const toward = (a, base, k) => { const d = ((a - base + 540) % 360) - 180; return (base + d * k + 360) % 360; };
  if (b.isDark) return b.hslToHex(Math.round(toward(h.h, 222, 0.1)), 36, 8);
  return b.hslToHex(Math.round(toward(h.h, 204, 0.1)), 30, 93);
}

// Card fill: a step whiter than the ice (dark: a step lighter than the navy).
const ppPanelOf = (t, ground) => t.mix('#ffffff', ground, t.isDark ? 0.045 : 0.6);

// The hi-vis colour: the brightest of the brand's three colours that is saturated enough to read as
// a colour (luminance >= ~0.35, saturation >= 35), pushed to a hi-vis saturation and a mid-light
// lightness; otherwise a neon companion. contrast against black is a monotone luminance proxy.
const PP_NEON = '#e4ff2e';
let ppSeq = 0;
function ppHiVis(t) {
  let best = null, bestL = 0;
  [t.accent, t.secondary, t.primary].forEach(c => {
    if (!c || hexToHsl(c).s < 35) return;
    const L = contrastRatio(c, '#000000');
    if (L > bestL) { bestL = L; best = c; }
  });
  if (!best || bestL < 8) return PP_NEON;
  const h = hexToHsl(best);
  return hslToHex(h.h, Math.max(h.s, 88), Math.max(48, Math.min(h.l, 66)));
}

registerAesthetic({
  key: 'paddock-pass', order: 54,
  name: 'Paddock Pass',
  descriptor: 'Livery · Credential · Technical',
  influences: 'Race-day credentials / Team liveries / Ticket stubs',
  summary: 'A race-day credential: a hi-vis strip down the leading edge, a race numeral made from the brand name, ticket-stub perforations and ruled spec rows with mono values, on an ice-blue ground in squared technical type.',
  motto: 'One strip. One number. Race-day clear.',
  kicker: 'Paddock pass',
  mode: 'light',
  slideShape: 'geometric',
  labels: { material: 'Livery & controls', states: ['Rest', 'Hover', 'Pressed'], statesKind: 'button' },
  // Editable specimen copy (Brand > Advanced > Specimen copy).
  copy: {
    motto: { label: 'Motto', text: 'One strip. One number. Race-day clear.', warm: 'One strip. One number. All yours.' },
    kicker: { label: 'Kicker above the headline', text: 'Paddock pass' },
    state0: { label: 'State 1 name', text: 'Rest' },
    state1: { label: 'State 2 name', text: 'Hover' },
    state2: { label: 'State 3 name', text: 'Pressed' },
    artTitle: { label: 'Livery panel title', text: 'Paddock pass' },
    artNo: { label: 'Livery panel: numeral label', text: 'Race no.' },
    artRow0: { label: 'Livery panel: row 1 label', text: 'Team' },
    artRow1: { label: 'Livery panel: row 2 label', text: 'Zone' },
    artRow2: { label: 'Livery panel: row 3 label', text: 'Gate' },
    artStub: { label: 'Livery panel: stub line', text: 'Admit one' },
    artSector: { label: 'Livery panel: stub sector label', text: 'Sector' },
    artCap: { label: 'Livery panel caption', text: 'Number made from the brand name' },
    cardNumber: { label: 'Material card: race numeral', text: 'Race numeral' },
    cardNumberCap: { label: 'Race numeral card caption', text: 'Same name, same number' },
    cardStub: { label: 'Material card: ticket stub', text: 'Stub and spec rows' },
    cardControls: { label: 'Material card: controls', text: 'Button and badge' },
    stubRow0: { label: 'Stub specimen: row 1 label', text: 'Zone' },
    stubRow1: { label: 'Stub specimen: row 2 label', text: 'Gate' },
    stubRow2: { label: 'Stub specimen: row 3 label', text: 'Sector' },
    btnLabel: { label: 'Button sample', text: 'Continue' },
    tagLabel: { label: 'Badge sample label', text: 'Live' },
    segOn: { label: 'Segment sample: selected', text: 'Day' },
    segOff: { label: 'Segment sample: other', text: 'Week' },
  },
  layout: { hero: 'split', palette: 'strips', sections: 'two-col' },
  type: { ui: 'sans', label: 'sans', display: 1 },
  highlight: 'ink',
  cardFill: '--ab-pp-panel',

  roles: {
    canvas: {
      use: 'The ground: a pale ice blue-grey (dark: a deep navy). Cards sit one step whiter on it (dark: one step lighter); everything else is ruled with hairlines',
      never: 'Text, or the hi-vis colour',
      coverage: '55–65%',
    },
    ink: {
      use: 'Headlines, body text, hairline rules and tick marks, the race numeral box, the selected segment and the boxed number badges',
      never: 'A large soft wash; it is the line colour, used crisp',
      coverage: '15–20%',
    },
    primary: {
      use: 'The one main rectangular button per view, links, the lead data series and progress fill, the angled stripe band on the board',
      never: 'The hi-vis strip, a card fill, body text under 16px that is not a link',
      coverage: '≈10%',
    },
    secondary: {
      use: 'The comparison data series, the second stripe band on the board and the avatar fill',
      never: 'The main action, body text, the page ground',
      coverage: '≈10%',
    },
    accent: {
      use: 'One spark: the highlighted word in a headline. The hi-vis strip and the highlight badge take the brightest of the palette (or a neon companion) and are fills only',
      never: 'Text on the pale ground, buttons, card fills, body text',
      coverage: '≤3%',
    },
  },

  // Pale ice in light, deep navy in dark. Pure ground (state.pureBg) replaces it.
  canvas(b) { return ppGround(b); },

  // The primary stays the brand colour; it moves (the least it can, same hue) only when it would not
  // hold 3:1 on the ground and on a card, or when neither white nor dark text would reach 4.6:1 on it.
  printPrimary(t) {
    const h = hexToHsl(t.primary);
    const beds = [t.canvas, ppPanelOf(t, t.canvas)];
    const ok = hex => beds.every(b => contrastRatio(hex, b) >= 3) && Math.max(contrastRatio(hex, '#ffffff'), contrastRatio(hex, '#141414')) >= 4.6;
    if (ok(t.primary)) return t.primary;
    for (let dl = 1; dl <= 60; dl++) {
      const first = t.isDark ? 1 : -1;
      for (const sgn of [first, -first]) {
        const l = h.l + sgn * dl;
        if (l < 4 || l > 96) continue;
        const hex = hslToHex(h.h, h.s, l);
        if (ok(hex)) return hex;
      }
    }
    return t.primary;
  },

  tokens(t, view) {
    const d = t.isDark, ink = t.ink, ground = t.canvas, pp = t.printPrimary;
    const panel = ppPanelOf(t, ground);
    const panel2 = d ? t.mix('#ffffff', ground, 0.1) : t.mix(ink, panel, 0.06);   // hover / selected row
    const hv = ppHiVis(t), hvOn = t.readable(hv);
    // muted: holds 4.6:1 on the ground, the card and the row step it can sit on
    const beds = [ground, panel, panel2];
    let muted = t.muted;
    for (let k = 0.1; k <= 1.001 && beds.some(b => t.contrast(muted, b) < 4.6); k += 0.1) muted = t.mix(ink, t.muted, k);
    // edge: the ink pulled toward the ground until it holds 3:1 on the ground and the card (fields, checkboxes, segments)
    let edge = t.mix(ink, ground, 0.6);
    for (let k = 0.6; k <= 1.001 && [ground, panel].some(b => t.contrast(edge, b) < 3.1); k += 0.04) edge = t.mix(ink, ground, k);
    const rule = t.mix(ink, ground, d ? 0.26 : 0.2);          // hairlines and perforations (decorative)
    const track = t.mix(ink, ground, d ? 0.2 : 0.14);         // empty progress / slider track
    // the chevron on the race-numeral box: hi-vis where it holds 3:1 on the ink box (light mode), else the canvas
    const chev = t.contrast(hv, ink) >= 3 ? hv : ground;
    const hf = view && view.headingFont;
    const hw = typeof abWeightNear === 'function' ? abWeightNear(hf, 700) : 700;
    return {
      '--ab-muted': muted,
      '--ab-line': rule,
      '--ab-pp-panel': panel,
      '--ab-pp-panel2': panel2,
      '--ab-pp-hv': hv,
      '--ab-pp-hv-on': hvOn,
      '--ab-pp-chev': chev,
      '--ab-pp-edge': edge,
      '--ab-pp-rule': rule,
      '--ab-pp-track': track,
      '--ab-pri-hover': d ? t.mix('#ffffff', pp, 0.14) : t.mix('#000000', pp, 0.14),
      '--ab-pri-press': d ? t.mix('#ffffff', pp, 0.26) : t.mix('#000000', pp, 0.26),
      '--ab-primary-text': pp,
      '--ab-hw': hw,
    };
  },

  // Hero art (board, deck cover): the livery panel. Left of a perforation: a spec header with a tick
  // ruler, the race numeral in an ink box (hi-vis chevrons on it) beside a dot-matrix block, three
  // ruled spec rows and a tick scale. Right of it: the ticket stub with angled stripe bands, a
  // barcode and the sector time. A hi-vis strip runs down the left edge. Decorative; every value is
  // also written as text.
  art(ctx) {
    const e = escapeHtml;
    const name = ctx.brandName || '';
    const info = ppInfo(name), rnd = ppRand(info.h);
    const id = 'ppc' + (++ppSeq);
    // dot matrix: 12 x 17 pitch 8; every dot is drawn dim, the lit ones thin out toward the right
    let dim = '', lit = '';
    for (let r = 0; r < 17; r++) {
      for (let c = 0; c < 12; c++) {
        const p = `M${210 + c * 8} ${66 + r * 8}h0`;
        dim += p;
        if (rnd() < 0.82 - c * 0.06 - Math.abs(r - 8) * 0.012) lit += p;
      }
    }
    // tick ruler along y: a tick every 6 units, a long one every 5th
    const ruler = (x0, x1, y) => { let d = ''; for (let x = x0, i = 0; x <= x1; x += 6, i++) d += `M${x} ${y}v${i % 5 === 0 ? 9 : 5}`; return d; };
    // barcode on the stub
    let bars = '', bx = 338;
    while (bx < 498) { const w = 1 + Math.floor(rnd() * 3); bars += `<rect x="${bx}" y="252" width="${w}" height="44"/>`; bx += w + 1 + Math.floor(rnd() * 3); }
    const team = name.trim().toUpperCase();
    const teamTxt = team.length > 14 ? team.slice(0, 13) + '…' : team;
    const rows = [[abCopy(this, 'artRow0'), teamTxt], [abCopy(this, 'artRow1'), info.zone], [abCopy(this, 'artRow2'), info.gate]].map((r, i) => {
      const top = 220 + i * 28;
      return `<text class="ppa-lab" x="40" y="${top + 19}">${r[0]}</text><text class="ppa-val" x="296" y="${top + 19}" text-anchor="end">${e(r[1])}</text><path class="ppa-rule" d="M40 ${top + 28}H296"/>`;
    }).join('');
    const chevs = [0, 1, 2].map(i => `<path class="ppa-chev" d="M${52 + i * 11} 66l6 6l-6 6"/>`).join('');
    return `<div class="ppa">
      <svg class="ppa-svg" viewBox="0 0 520 340" role="img" aria-label="${abCopy(this, 'artTitle')} ${info.num}" focusable="false">
        <defs><clipPath id="${id}"><rect x="318" y="0" width="202" height="232"/></clipPath></defs>
        <rect class="ppa-panel" x="0.5" y="0.5" width="519" height="339"/>
        <g clip-path="url(#${id})">
          <path class="ppa-band is-hv" d="M430 0h44l-110 232h-44z"/>
          <path class="ppa-band is-ink" d="M484 0h10l-110 232h-10z"/>
          <path class="ppa-band is-pri" d="M504 0h52l-110 232h-52z"/>
        </g>
        <rect class="ppa-hv" x="0" y="0" width="16" height="340"/>
        <path class="ppa-rule is-ink" d="M16.5 0V340"/>
        <text class="ppa-lab" x="40" y="34">${abCopy(this, 'artTitle')}</text>
        <path class="ppa-tick" d="${ruler(160, 298, 26)}"/>
        <rect class="ppa-box" x="40" y="58" width="150" height="148"/>
        ${chevs}
        <text class="ppa-num" x="115" y="142" dy=".35em" text-anchor="middle" textLength="112" lengthAdjust="spacingAndGlyphs">${info.num}</text>
        <text class="ppa-boxlab" x="52" y="196">${abCopy(this, 'artNo')}</text>
        <path class="ppa-dim" d="${dim}"/>
        <path class="ppa-lit" d="${lit}"/>
        ${rows}
        <path class="ppa-tick is-long" d="${ruler(40, 298, 313)}"/>
        <path class="ppa-perf" d="M308 14V326"/>
        <circle class="ppa-notch" cx="308" cy="0" r="10"/><circle class="ppa-notch" cx="308" cy="340" r="10"/>
        <g class="ppa-bars">${bars}</g>
        <text class="ppa-lab" x="338" y="318">${abCopy(this, 'artStub')}</text>
        <text class="ppa-val" x="498" y="318" text-anchor="end">${abCopy(this, 'artSector')} ${info.sector}</text>
      </svg>
      <p class="ppa-cap"><span>${abCopy(this, 'artCap')}</span><b>${e(info.num)}</b></p>
    </div>`;
  },

  materials: [
    { name: 'Ground', css: 'background: {canvas}; /* a pale ice blue-grey with a trace of the brand hue (dark: a deep navy); nothing is shaded, rules do the separating */' },
    { name: 'Card and panel', css: 'background: {ppPanel}; border: 1px solid {ppRule}; border-left: 4px solid {ppHv}; border-radius: 0; box-shadow: none; /* one step whiter than the ground (dark: one step lighter); the 4px hi-vis strip is a fill, the hairline is decorative */' },
    { name: 'Hi-vis strip', css: 'background: {ppHv}; color: {ppHvOn}; /* the brightest of the palette pushed to hi-vis saturation, or a neon companion; a fill only, never text on the ground; the label on it is {ppHvOn} */' },
    { name: 'Hairline rule and spec row', css: 'border-bottom: 1px solid {ppRule}; /* label left in 11px micro caps ({muted}), value right in mono ({ink}); the row steps to {ppPanel2} when picked */' },
    { name: 'Edge (fields, checkboxes, segments)', css: 'border: 1px solid {ppEdge}; border-radius: 0; /* the ink pulled toward the ground until it holds 3:1 on the ground and on a card */' },
    { name: 'Main button', css: 'background: {primary}; color: {onPrimary}; border-radius: 0; min-height: 48px; padding: 0 16px; text-transform: uppercase; letter-spacing: 0.06em; /* label left, a small chevron flush right; hover {priHover}, pressed {priPress} */' },
    { name: 'Secondary button', css: 'background: transparent; color: {ink}; border: 1.5px solid {ink}; border-radius: 0; /* same size and chevron as the main button */' },
    { name: 'Boxed number badge (tag)', css: 'border: 1.5px solid {ink}; color: {ink}; border-radius: 0; min-width: 24px; min-height: 24px; font-family: mono; /* an outlined box; the highlight badge is filled {ppHv} with {ppHvOn} */' },
  ],

  rules: {
    do: [
      'Run one hi-vis strip down the leading edge of the board; on a card it is a 4px strip on the left edge.',
      'Set labels in 11px micro caps and values in mono, one per ruled row: label left, value right.',
      'Keep every corner square. Buttons are rectangles with a small chevron flush right.',
      'Draw the race numeral from the brand name and box it: ink fill, canvas numerals.',
      'Use the hi-vis colour as a fill (strip, highlight badge) with its own on-colour label.',
    ],
    dont: [
      'Set text in the hi-vis colour on the pale ground, or any text outside ink, muted or an on-* colour.',
      'Put the livery panel, stripe bands, dot-matrix block or perforation in the app; they are board and website art only.',
      'Round any corner, or add a shadow to a card or button.',
      'Use more than one hi-vis strip per card or per board edge.',
    ],
  },

  deck: {
    // Material slide: the real pieces as specimens: the boxed race numeral on its hi-vis strip, a
    // perforated stub with ruled spec rows, and a button with a boxed badge and segmented control.
    materialArt(ctx) {
      const e = escapeHtml;
      const info = ppInfo(ctx.brandName);
      const spec = [[abCopy(this, 'stubRow0'), info.zone], [abCopy(this, 'stubRow1'), info.gate], [abCopy(this, 'stubRow2'), info.sector]]
        .map(r => `<div class="ppm-row"><span>${r[0]}</span><b>${e(r[1])}</b></div>`).join('');
      return `<div class="ppm">
        <div class="ppm-card is-strip">
          <span class="ppm-l">${abCopy(this, 'cardNumber')}</span>
          <div class="ppm-num" aria-hidden="true"><i class="ppm-chev"></i>${e(info.num)}</div>
          <span class="ppm-cap">${abCopy(this, 'cardNumberCap')}</span>
        </div>
        <div class="ppm-card">
          <span class="ppm-l">${abCopy(this, 'cardStub')}</span>
          <div class="ppm-perf" aria-hidden="true"></div>
          <div class="ppm-rows">${spec}</div>
        </div>
        <div class="ppm-card">
          <span class="ppm-l">${abCopy(this, 'cardControls')}</span>
          <span class="ppm-btn"><span>${abCopy(this, 'btnLabel')}</span><i class="ppm-chev" aria-hidden="true"></i></span>
          <div class="ppm-tags"><span class="ppm-badge">${e(info.num)}</span><span class="ppm-badge is-hv">${abCopy(this, 'tagLabel')}</span></div>
          <div class="ppm-seg" aria-hidden="true"><span class="is-on">${abCopy(this, 'segOn')}</span><span>${abCopy(this, 'segOff')}</span></div>
        </div>
      </div>`;
    },
    principles: [
      ['One strip, one number', 'A hi-vis strip and a race numeral made from the brand name carry the identity.'],
      ['Ruled, not boxed', 'Hairlines and perforations separate things; label left in micro caps, value right in mono.'],
      ['Square and technical', 'Square corners, rectangular buttons with a chevron, boxed number badges.'],
    ],
    do: [
      'Keep the strip to a fill.',
      'Rule rows with hairlines.',
      'Box the race numeral.',
    ],
    dont: [
      'Set text in the hi-vis colour.',
      'Round a corner.',
      'Put the livery art in the app.',
    ],
  },
});
