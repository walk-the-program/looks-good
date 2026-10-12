/* 24 Mixed Type — loud, editorial, witty. Reference: Commercial Type's banded homepage,
   Collins' Mailchimp system (Cooper against Graphik), It's Nice That section heads, Dinamo,
   the Songtrust / Upwork billboards (Eye on Design): the mixed headline IS the image.
   Poster scale (up to 220px), one full-bleed colour band per line (paper, ink, primary),
   one voice per line plus one swap inside it, an inline type-object chip at cap height,
   cap heights aligned (not font sizes). Below the headline the mix carries into the UI:
   tabs, numerals and percentages each take a voice; no cards, no pills.

   Mechanism. The headline is drawn by def.headline(ctx, text): the framework puts it in
   the real, visible <h2 aria-label> (board hero, deck cover, Principles, Closing) and the
   deck fit code sizes it; the hook sets it word by word in the voices. The art box is the specimen: the same
   four voices shown as "Aa" with cap line / x-height / baseline guides, a glyph set
   split across the voices and a size scale.

   Voices (resolved per brand by mtVoices): B = the brand's own heading face, I = a
   serif italic, H = a heavy grotesk, M = a mono; the contrast faces never repeat the
   brand's family. Each voice carries a size factor k = capHeight(B) / capHeight(voice)
   so capitals line up on one line. Cap heights come from MT_METRICS (measured in
   Chromium) or, for any other brand face, from a canvas measurement when it is loaded. */

// [capHeight, xHeight] per 1 em, from canvas measureText on "H" / "x"
const MT_METRICS = {
  'Instrument Serif': [0.720, 0.510], 'Playfair Display': [0.708, 0.525], 'Fraunces': [0.700, 0.470],
  'Bricolage Grotesque': [0.660, 0.528], 'Archivo Black': [0.688, 0.528], 'Inter Tight': [0.728, 0.546],
  'Inter': [0.728, 0.546], 'DM Mono': [0.700, 0.496], 'Space Mono': [0.700, 0.496], 'DM Sans': [0.700, 0.504],
  'Lexend': [0.700, 0.529], 'Instrument Sans': [0.720, 0.510], 'Gloock': [0.700, 0.480],
};
const MT_CAT_METRICS = { serif: [0.70, 0.48], sans: [0.71, 0.52], display: [0.70, 0.52], mono: [0.70, 0.50], slab: [0.70, 0.50] };
const mtMeasured = {};

function mtFace(name) {
  return (typeof FONTS !== 'undefined' && FONTS.find(f => f.name === name)) || null;
}

function mtWeight(font, prefer) {
  const have = String(font.weights || '400').split(';').map(Number);
  for (const w of prefer) if (have.includes(w)) return w;
  return have[0] || 400;
}

// [cap, x] for a font, preferring the table, then a canvas measurement of the
// loaded face, then the category default.
function mtMetrics(font, weight, style) {
  if (MT_METRICS[font.name]) return MT_METRICS[font.name];
  const key = font.name + weight + style;
  if (mtMeasured[key]) return mtMeasured[key];
  const spec = `${style} ${weight} 1000px "${font.name}"`;
  try {
    if (document.fonts && document.fonts.check(spec)) {
      const c = document.createElement('canvas').getContext('2d');
      c.font = spec;
      const cap = c.measureText('H').actualBoundingBoxAscent / 1000;
      const xh = c.measureText('x').actualBoundingBoxAscent / 1000;
      if (cap > 0.4 && cap < 1) return (mtMeasured[key] = [cap, xh || cap * 0.7]);
    }
  } catch (err) { /* fall back to the category default */ }
  return MT_CAT_METRICS[font.category] || MT_CAT_METRICS.sans;
}

// First candidate whose name differs from the brand's heading face.
function mtPick(names, avoid) {
  for (const n of names) {
    const f = mtFace(n);
    if (f && f.name !== avoid) return f;
  }
  return mtFace(names[0]);
}

// The four voices for a state. Each: { key, font, weight, style, k, cap, x, label }.
function mtVoices(st) {
  const brand = st.headingFont;
  const bw = brand.cls === 'didone' || brand.cls === 'soft-serif' || brand.cls === 'old-style' || brand.cls === 'text-serif' || brand.cls === 'deco'
    ? mtWeight(brand, [400, 500, 600]) : mtWeight(brand, [600, 700, 500, 400]);
  const defs = [
    { key: 'b', font: brand, weight: bw, style: 'normal', label: 'Heading' },
    // the italic may share the brand's family (Fraunces roman + Fraunces italic are two voices)
    { key: 'i', font: mtFace('Fraunces') || mtPick(['Instrument Serif', 'Gloock'], ''), weight: 400, style: 'italic', label: 'Italic' },
    { key: 'h', font: mtPick(['Bricolage Grotesque', 'Inter Tight', 'Archivo Black'], brand.name), weight: 0, style: 'normal', label: 'Heavy' },
    { key: 'm', font: mtPick(['DM Mono', 'Space Mono'], brand.name), weight: 400, style: 'normal', label: 'Mono' },
  ];
  // the fifth voice: a condensed grotesk for numbers and navigation (not part of the specimen's four)
  const nar = mtPick(['Big Shoulders Display', 'Anton'], brand.name);
  defs[2].weight = mtWeight(defs[2].font, [800, 700, 400]);
  const capB = mtMetrics(brand, bw, 'normal')[0];
  defs.forEach(v => {
    const [cap, x] = mtMetrics(v.font, v.weight, v.style);
    v.cap = cap; v.x = x; v.k = Math.round((capB / cap) * 1000) / 1000;
  });
  defs.narrow = nar ? { font: nar, weight: mtWeight(nar, [700, 400]) } : null;
  return defs;
}

const MT_STOP = new Set(('a an the and or but nor for of to in on at by with from as is are be was were should would could can will do does did your our my their it its this that these those not no so up out into over than then more most').split(' '));

// Break the words into at most three lines with the most even character counts.
function mtLines(words) {
  const n = words.length;
  if (n <= 3) return words.map(w => [w]);
  const len = a => a.join(' ').length;
  let best = null;
  for (let i = 1; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      const L = [words.slice(0, i), words.slice(i, j), words.slice(j)];
      const score = Math.max(...L.map(len));
      if (!best || score < best.score) best = { L, score };
    }
  }
  return best.L;
}

// One voice per line (heavy, brand, italic: the last line holds the highlight word in the
// italic), plus one swap inside each line of two or more words: a function word goes to
// the mono, else the first word takes the next voice in the cycle.
const MT_LINE_VOICE = ['h', 'b', 'i'];
const MT_SWAP = { h: 'i', b: 'm', i: 'm' };
function mtHeadlineHtml(tagline, ctx) {
  const words = String(tagline || '').trim().split(/\s+/).filter(Boolean);
  if (!words.length) return '';
  const lines = mtLines(words);
  const nL = lines.length;
  let chipDone = false;
  return lines.map((ws, li) => {
    const lv = nL === 1 ? 'i' : MT_LINE_VOICE[Math.min(li, 2) + (nL === 2 && li === 1 ? 1 : 0)];
    let swapAt = -1;
    if (ws.length > 1) {
      swapAt = ws.findIndex(w => MT_STOP.has(w.toLowerCase().replace(/[^a-z']/g, '')));
      if (swapAt < 0) swapAt = li === nL - 1 ? 0 : ws.length - 1;
      if (li === nL - 1 && swapAt === ws.length - 1) swapAt = 0;   // the highlight stays in the line's italic
    }
    // effective width in "average characters": heavy caps run wide, the italic narrow
    const W = { h: 1.28, b: 1, i: 0.88, m: 1.12 };
    const eff = ws.reduce((n, w, wi) => n + w.length * W[wi === swapAt ? MT_SWAP[lv] : lv], 0) + (ws.length - 1) * 0.5
      + (ctx && nL >= 2 && li === Math.floor(nL / 2) ? 1.6 : 0);
    const fit = Math.min(1, 9.4 / Math.max(1, eff));
    const body = ws.map((w, wi) => {
      const m = w.match(/^([\s\S]*?)([.,;:!?…]*)$/);
      const last = li === nL - 1 && wi === ws.length - 1;
      const v = wi === swapAt ? MT_SWAP[lv] : lv;
      return `<span class="mt-w${last ? ' mt-hl' : ''}" data-v="${v}">${escapeHtml(m[1])}${last ? '<i class="mt-ast" aria-hidden="true">*</i>' : ''}${escapeHtml(m[2])}</span>`;
    });
    // an inline type-object chip at cap height after the first word of the middle line
    if (!chipDone && ctx && nL >= 2 && li === Math.floor(nL / 2) && body.length) {
      chipDone = true;
      const chip = ctx.logoDataUrl
        ? `<span class="mt-chip mt-chip--img"><img src="${escapeHtml(ctx.logoDataUrl)}" alt="" /></span>`
        : `<span class="mt-chip"><i>${escapeHtml(ctx.initial || 'A')}</i></span>`;
      body.splice(1, 0, chip);
    }
    return `<span class="mt-line" data-band="${nL === 1 ? 0 : li}" data-v="${lv}" style="--mt-fit:${fit.toFixed(3)}">${body.join(' ')}</span>`;
  }).join('');
}

const MT_GLYPHS = [
  ['h', 'A–Z', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'],
  ['i', 'a–z', 'abcdefghijklmnopqrstuvwxyz'],
  ['m', '0–9', '0123456789 &@#?!%'],
];

function mtCell(v, n) {
  const size = 54 * v.k;
  const base = 66;
  const capY = base - v.cap * size;
  const xY = base - v.x * size;
  const wLabel = v.style === 'italic' ? 'Italic ' + v.weight : (v.weight >= 700 ? 'Bold ' : v.weight >= 500 ? 'Medium ' : 'Regular ') + v.weight;
  return `<figure class="mt-cell" data-v="${v.key}">
        <p class="mt-cell-k"><b>0${n}</b>${escapeHtml(v.label)}</p>
        <svg viewBox="0 0 124 80" width="100%" focusable="false">
          <g class="mt-guides"><line x1="0" x2="124" y1="${base}" y2="${base}"/><line class="mt-cap" x1="0" x2="124" y1="${capY.toFixed(1)}" y2="${capY.toFixed(1)}"/><line class="mt-xh" x1="0" x2="124" y1="${xY.toFixed(1)}" y2="${xY.toFixed(1)}"/></g>
          <text x="4" y="${base}" class="mt-aa" font-size="${size.toFixed(1)}" style="font-family:var(--mt-f-${v.key});font-weight:var(--mt-w-${v.key});font-style:${v.style}">Aa</text>
          <g class="mt-gl" font-size="4.6"><text x="121" y="${base - 2}" text-anchor="end">base</text><text x="121" y="${(capY - 2).toFixed(1)}" text-anchor="end">cap</text></g>
        </svg>
        <p class="mt-cell-n" style="font-family:var(--mt-f-${v.key});font-weight:var(--mt-w-${v.key});font-style:${v.style}">${escapeHtml(v.font.name)}</p>
        <p class="mt-cell-m">${escapeHtml(wLabel)} · cap ${v.cap.toFixed(2)}</p>
      </figure>`;
}

registerAesthetic({
  key: 'mixed-type', order: 24,
  name: 'Mixed Type',
  descriptor: 'Loud · Banded · Witty',
  influences: 'Commercial Type / Collins for Mailchimp / Eye on Design billboards',
  summary: 'A poster-scale headline in colour bands, one voice per line, with the mix carried into the interface.',
  motto: 'Many voices, one page.',
  kicker: 'Specimen No. 4',
  mode: 'light',
  slideShape: 'refined',
  labels: { material: 'Bands', states: ['Paper', 'Ink', 'Spark'], statesKind: 'chip' },
  layout: { hero: 'centered', palette: 'swatches', sections: 'two-col', subcopy: false },
  type: { ui: 'body' },
  highlight: 'custom',
  highlightNote: 'The last word is set in the serif italic voice in the band\'s own text colour (no accent colour) and ends in a small asterisk; colour comes from the primary band behind its line.',
  cardFill: '--canvas',

  roles: {
    canvas: { use: 'Paper: the page and the first headline band; sections sit straight on it under 2px ink rules', never: 'Text', coverage: '55–65%' },
    ink: { use: 'Type, 2px section rules, list bars, and the second headline band (with paper type)', never: 'Tinted cards', coverage: '20–28%' },
    primary: { use: 'The third headline band (the highlight line), the type-object chip, the one CTA and the selected tab', never: 'Body text, a second CTA, specimen decoration', coverage: '≈10–14%' },
    secondary: { use: 'Reserved: a chart\'s second series. Not used on the board', never: 'Status pills, bars, headline words, backgrounds', coverage: '≤2%' },
    accent: { use: 'Reserved: one sticker at most. The highlight word is italic in the band\'s text colour, not accent', never: 'Headline words, buttons, body text, borders', coverage: '≤1%' },
  },

  // The mixed headline for the real <h2> (the framework wraps it, escapes the label and sizes it).
  headline(ctx, text) { return mtHeadlineHtml(text, ctx); },

  tokens(t) {
    const st = typeof state !== 'undefined' ? state : null;
    const vars = {
      '--ab-type-pick-w': 400,
      '--ab-font-label': 'var(--mt-f-m, ui-monospace), ui-monospace, Menlo, monospace',
      '--ab-guide': t.alpha(t.ink, 0.28),
    };
    if (st && st.headingFont) {
      mtVoices(st).forEach(v => {
        vars[`--mt-f-${v.key}`] = v.font.css;
        vars[`--mt-w-${v.key}`] = v.weight;
        vars[`--mt-k-${v.key}`] = v.k;
      });
      const nv = mtVoices(st).narrow;
      if (nv) { vars['--mt-f-n'] = nv.font.css; vars['--mt-w-n'] = nv.weight; }
    }
    return vars;
  },

  art(ctx) {
    const voices = mtVoices(ctx.state);
    const e = escapeHtml;
    // warm the contrast faces so they are ready by the next paint (cap sizes do not depend on it)
    if (typeof window !== 'undefined' && window.loadFontFamily) voices.forEach(v => { if (v.key !== 'b') window.loadFontFamily(v.font); });
    const cells = voices.map((v, i) => mtCell(v, i + 1)).join('');
    const glyphs = MT_GLYPHS.map(([key, lab, str]) => {
      const v = voices.find(x => x.key === key);
      return `<div class="mt-grow" data-v="${key}"><span class="mt-grow-k">${lab}</span><span class="mt-grow-s" style="font-family:var(--mt-f-${key});font-weight:var(--mt-w-${key});font-style:${v.style}">${e(str)}</span></div>`;
    }).join('');
    const scale = [11, 16, 24, 36, 54].map(n => `<span class="mt-sc" style="font-size:${n}px"><i>Aa</i><b>${n}</b></span>`).join('');
    const ks = voices.map(v => v.k.toFixed(2)).join(' / ');
    return `<div class="mt">
      <p class="mt-lead"><span class="mt-lead-k">Fig. 1</span><span class="mt-lead-t">A design language for ${e(ctx.brandName)}: four voices on one baseline grid, sized to a shared cap height (× ${ks}).</span></p>
      <div class="mt-spec">
        <div class="mt-cells">${cells}</div>
        <div class="mt-lower">
          <div class="mt-glyphs">${glyphs}</div>
          <div class="mt-scale" style="font-family:var(--mt-f-b);font-weight:var(--mt-w-b)"><p class="mt-scale-k">Scale · px</p><div class="mt-scale-row">${scale}</div></div>
        </div>
      </div>
    </div>`;
  },

  materials: [
    { name: 'Heading voice', css: 'font-family: the brand heading face; /* content words alternate between it and the heavy voice; sized 1x, the other voices are scaled to its cap height */' },
    { name: 'Italic voice', css: 'font-family: Fraunces; font-style: italic; font-weight: 400; /* the highlight line (on the primary band) and swapped words; scaled so its capitals match the heading voice */' },
    { name: 'Headline bands', css: 'each line on its own full-bleed band: line 1 {canvas} with {ink} type, line 2 {ink} with {canvas} type, line 3 {primary} with {onPrimary} type; up to 220px; one voice per line plus one swap' },
    { name: 'Condensed voice', css: 'font-family: Big Shoulders Display 700; /* the fifth voice: numbers, percentages and the nav */' },
    { name: 'Heavy voice', css: 'font-family: Bricolage Grotesque 800, Inter Tight 800 or Archivo Black; text-transform: uppercase; letter-spacing: -0.02em; /* content words, scaled to match cap height */' },
    { name: 'Mono voice', css: 'font-family: DM Mono or Space Mono; font-weight: 400; letter-spacing: -0.04em; /* function words (for, the, should) and all small labels */' },
    { name: 'Section rule', css: 'border-top: 2px solid {ink}; background: transparent; border-radius: 0; padding-inline: 0; /* no cards, no tinted panels */' },
    { name: 'Specimen guide', css: 'stroke: {ink} at 28%; stroke-width: 0.5; /* baseline solid, cap line dashed, x-height dotted behind each "Aa" */' },
    { name: 'Primary action', css: 'background: {primary}; color: {onPrimary}; border: 0; border-radius: 0; padding: 14px 18px;' },
  ],

  rules: {
    do: [
      'Set the headline at poster scale, one line per full-bleed band (paper, ink, primary), one voice per line plus one swap.',
      'Match capital heights across voices, not font sizes.',
      'Carry the mix into the interface: tabs, numerals and percentages each take one voice; a control never mixes inside itself.',
      'Put one inline image or type object at cap height inside the headline.',
    ],
    dont: [
      'Use more than four faces, or mix faces inside a button, a field or a list row.',
      'Match the voices by font size; compare capital heights and adjust.',
      'Shrink the headline to a modest H1; at small sizes the face changes look like a loading glitch.',
      'Use tinted cards, pills or a yellow highlight word.',
    ],
  },
  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    coverDisplay: 1.3,
    principles: [
      ['Many voices, one page', 'One voice per line, one swap inside it.'],
      ['Poster scale, in bands', 'Paper, ink and primary bands behind the lines.'],
      ['Match cap heights', 'Compare capitals, not font sizes.'],
    ],
    do: [
      'Set the headline in bands at poster scale.',
      'Give tabs and numbers their own voices.',
      'Match cap heights, not font sizes.',
    ],
    dont: [
      'Use more than four faces.',
      'Mix faces inside a button or field.',
      'Use tinted cards or pills.',
    ],
  },
});
