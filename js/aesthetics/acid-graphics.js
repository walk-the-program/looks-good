/* 30 Acid Graphics — toxic, warped, loud. References: The Designers Republic (invented
   corporate marks, slogans, catalogue numbers, katakana), Tomato (type as texture at many
   scales), Weirdcore and Braulio Amado (warped display type), Studio Feixen (vibrating colour
   pairs), rave flyers' who / where / when.

   Mechanism. COLOUR THAT VIBRATES: the client primary is pushed to full chroma (the "acid")
   and paired with a computed CLASH colour 165 degrees away at EQUAL luminance; the palette
   shows the pair and its measured luminance delta. EVERY display line is distorted (def.headline):
   the first line's letters stretch 1.4-2.2x on a wave, the middle line is compressed to 62%
   width and stretched, the last line is an outline with two offset echoes (acid, clash); the
   section titles get the same treatment smaller. The board carries the flyer: a field band
   per section (ripple, strobe rays, warped check at 12-25%), a dense info strip on every
   section header (catalogue no., BPM, katakana, invented sponsors, barcode) and a line-up
   bill for the type. The flyer: op-art ripples (BLURRED displacement), an outlined
   triple-echo name (no chrome: chrome belongs to Y2K Chrome), who / where / when, a
   perforated stub with a serial, a katakana spine, a warning pictogram row and a wall of
   invented sponsor marks at mixed sizes, over a hidden 12-column grid. Export-safe: no CSS
   masks (the ticket notches are radial-gradient backgrounds). */
(function () {
let seq = 0;
const AC_CLAMP = (v, a, b) => Math.max(a, Math.min(b, v));

// primary pushed to full chroma; a muted primary falls back to the fixed acid green
function acPush(primary) {
  const c = hexToHsl(primary);
  if (c.s < 24) return '#B6FF00';
  const l = c.h > 52 && c.h < 170 ? 50 : c.h >= 170 && c.h < 285 ? 58 : 54;
  return hslToHex(c.h, 100, l);
}
// hue +165 degrees, full chroma, lightness searched until the relative luminance equals the acid's
function acClash(acid) {
  const c = hexToHsl(acid), target = relativeLuminance(acid), h = (c.h + 165) % 360;
  let lo = 8, hi = 92;
  for (let i = 0; i < 18; i++) {
    const mid = (lo + hi) / 2;
    if (relativeLuminance(hslToHex(h, 100, mid)) < target) lo = mid; else hi = mid;
  }
  return hslToHex(h, 100, (lo + hi) / 2);
}

registerAesthetic({
  key: 'acid-graphics', order: 30,
  name: 'Acid Graphics',
  descriptor: 'Toxic · Warped · Loud',
  influences: 'Rave flyers / Op-art / Warped type',
  summary: 'Vibrating colour pairs, stretched type and dense information over a hidden calm grid.',
  motto: 'Turn it up until it hums.',
  kicker: 'Doors at midnight',
  mode: 'dark',
  slideShape: 'minimal',
  labels: { material: 'Signal', states: ['Idle', 'Strobe', 'Melt'], statesKind: 'button' },
  layout: { hero: 'split', palette: 'strips', sections: 'two-col', subcopy: true },
  type: { ui: 'body', label: 'mono', display: 1 },
  highlight: 'custom',
  highlightNote: 'The last headline line is an outline only (no fill, a 2px stroke in the clash colour on black, ink on the acid field in light mode) with two offset echoes in the acid and the clash; the lines above are stretched on a wave and compressed. In running UI text the highlight word is plain ink.',

  roles: {
    canvas: {
      use: 'The neutral rest area (about 30% of every view): #050505 black in dark mode, stark white in light mode; a hidden 12-column grid runs under it at 4–6%',
      never: 'Text, gradients, a tinted wash; it is the silence that lets the density breathe',
      coverage: '30–40%',
    },
    ink: {
      use: 'White (dark) or black (light) body copy, mono info labels, the numerals and the 12-column grid lines',
      never: 'Vibrating pairs: thin ink type is never set on an acid / clash edge',
      coverage: '15–20%',
    },
    primary: {
      use: 'The dominant ACID: the client primary pushed to full chroma (lightness 50–58%; a muted primary falls back to #B6FF00): the headline, the main action fill, the selected ticket tab, the ripple, the progress stripes. Its computed CLASH partner is the primary hue +165 degrees at equal luminance',
      never: 'Thin text on a vibrating edge, a neutral flat fill, a second CTA',
      coverage: '≈25–30%',
    },
    secondary: {
      use: 'The pattern\'s second band and tinted shadow: the second card\'s stripes, the progress track, sponsor marks',
      never: 'The main action, body text, replacing the computed clash colour',
      coverage: '≈10%',
    },
    accent: {
      use: 'One spot colour (a fixed #B6FF00 lime when the accent is soft): the ticket stub, one asterisk spark in the marquee, the focus ring',
      never: 'Buttons, body text, borders, large fills',
      coverage: '≤4%',
    },
  },

  canvas(b) {
    if (b.isDark) { const h = b.hexToHsl(b.canvas); return b.hslToHex(h.h, Math.min(h.s, 12), 2.4); }
    return b.mix('#ffffff', b.canvas, 0.85);
  },

  // The primary is printed as the acid (full chroma); the palette still shows the brand hex.
  printPrimary(t) { return acPush(t.primary); },

  tokens(t) {
    const hf = typeof state !== 'undefined' && state && state.headingFont;
    const cls = hf && hf.cls;
    const ws = String((hf && hf.weights) || '400').split(';').map(Number).filter(Boolean);
    const le = ws.filter(x => x <= 900);
    const hw = le.length ? Math.max(...le) : Math.min(...ws);
    const acid = t.printPrimary, clash = acClash(acid), d = t.isDark;
    const brand = typeof effectiveContent === 'function' ? String(effectiveContent().brandName || '') : '';
    const nm = brand.toUpperCase().replace(/['"\\;{}]/g, '').slice(0, 28);
    // wide faces keep their natural width, so the type size comes down by this factor and the block is stretched taller instead (--ac-sy)
    const fs = { wide: 0.7, techno: 0.74, heavy: 0.8, condensed: 1, 'neo-grotesk': 0.86, grotesk: 0.86 }[cls] ?? 0.84;
    const sy = cls === 'condensed' ? 1.12 : 1.2;
    // a fluorescent accent keeps its colour; a soft one lends its spot to a fixed acid lime (ticket stub and 18+ tab only)
    const ah = hexToHsl(t.accent);
    const spark = ah.s < 70 || ah.l > 78 ? '#B6FF00' : t.accent;
    const on = hex => (t.contrast('#050505', hex) >= t.contrast('#ffffff', hex) ? '#050505' : '#ffffff');
    // equaliser bars for progress (acid, a fixed skyline of heights), as an export-safe data URI
    const eqH = [0.55, 0.9, 0.7, 1, 0.45, 0.8, 0.6, 0.95, 0.5, 0.75];
    const eq = `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="14" viewBox="0 0 60 14" preserveAspectRatio="none">${eqH.map((h, i) => `<rect x="${i * 6}" y="${(14 * (1 - h)).toFixed(1)}" width="4" height="${(14 * h).toFixed(1)}" fill="${i % 3 === 2 ? clash : acid}"/>`).join('')}</svg>`;
    const dY = Math.abs(relativeLuminance(acid) - relativeLuminance(clash));
    // em width of one capital in the heading face, so the headline wrapper can fit its longest line
    const cw = { wide: 0.96, techno: 0.86, heavy: 0.78, condensed: 0.5, display: 0.72 }[cls] ?? 0.68;
    return {
      '--ab-type-pick-w': hw,
      '--ac-hw': hw,
      '--ab-acid': acid,
      '--ab-clash': clash,
      '--ab-on-acid': on(acid),
      '--ab-on-clash': on(clash),
      '--ac-fs': fs,
      '--ac-sy': sy,
      '--ac-spark': spark,
      '--ac-on-spark': on(spark),
      '--ac-fg': d ? acid : t.ink,
      '--ac-fg2': d ? clash : t.ink,
      '--ac-on-canvas': d ? acid : t.ink,
      '--ac-grid': t.alpha(t.ink, d ? 0.045 : 0.065),
      '--ac-acid-a': t.alpha(acid, 0.12),
      '--ac-clash-a': t.alpha(clash, 0.12),
      '--ac-brand': `'${nm}'`,
      '--ac-cw': cw,
      '--ac-eq': `url("data:image/svg+xml,${encodeURIComponent(eq)}")`,
      '--ac-pair': `"VIBRATING PAIR\\A ACID ${acid.toUpperCase()} × CLASH ${clash.toUpperCase()}\\A Δ LUMINANCE ${dY.toFixed(3)}"`,
      '--ab-tr': (cls && { condensed: 0.4, heavy: 0.5, wide: 0.5, techno: 0.5 }[cls]) ?? 1,
    };
  },

  // Every display line is warped: line 1 letters stretch on a wave (1.4-2.2x), the middle line is compressed
  // to 62% width and stretched, the last line is an outline with two offset echoes. Lines of at most 8 letters, stacked like a poster;
  // the wrapper sizes the type so the longest line fits the column (--acn letters x --ac-cw em each).
  headline(ctx, text) {
    const e = escapeHtml;
    const words = String(text || '').trim().split(/\s+/).filter(Boolean);
    if (!words.length) return '';
    const lines = [];
    let cur = [], n = 0;
    words.forEach(w => { if (cur.length && n + w.length + 1 > 8) { lines.push(cur); cur = []; n = 0; } cur.push(w); n += w.length + (cur.length > 1 ? 1 : 0); });
    if (cur.length) lines.push(cur);
    const maxN = Math.max(...lines.map(l => l.join(' ').length));
    const html = lines.map((l, li) => {
      const last = li === lines.length - 1 && lines.length > 1;
      const mid = !last && li === 1;   // one line is compressed; the others ride the stretch wave
      const str = Array.from(l.join(' '));
      let mx = 1;
      const letters = str.map((ch, i) => {
        if (ch === ' ') return '<span class="ac-sp"> </span>';
        const sy = last ? 1.5 : mid ? 1.8 : 1.4 + 0.8 * (0.5 + 0.5 * Math.sin(i * 0.9 + li * 1.7 + 0.6));
        mx = Math.max(mx, sy);
        return `<span class="ac-l" style="--s:${sy.toFixed(2)}">${e(ch)}</span>`;
      }).join('');
      return `<span class="acl${last ? ' acl-out' : mid ? ' acl-x' : ''}" style="--mx:${mx.toFixed(2)}">${letters}</span>`;
    }).join('');
    return `<span class="ach" style="--acn:${maxN}">${html}</span>`;
  },

  art(ctx) {
    const t = ctx.t, e = escapeHtml;
    const id = 'ac' + (++seq);
    const first = String(ctx.brandName || '').trim().split(/\s+/)[0] || 'LIVE';
    const word = e(first.toUpperCase().slice(0, 12));
    const wsz = (20 * Math.min(1, 4.4 / Math.max(first.length, 1))).toFixed(2);
    const name = e(String(ctx.brandName || '').trim().toUpperCase());
    const marks = [
      '<svg viewBox="0 0 12 12" width="11" height="11" aria-hidden="true"><path d="M6 .6 11 3.3v5.4L6 11.4 1 8.7V3.3Z" fill="none" stroke="currentColor" stroke-width="1.4"/></svg><b>HYPERFLUX™</b>',
      '<svg viewBox="0 0 12 12" width="11" height="11" aria-hidden="true"><path d="M6 1 11.4 10.8H.6Z" fill="currentColor"/></svg><b>OUTRA</b>',
      '<svg viewBox="0 0 12 12" width="11" height="11" aria-hidden="true"><path d="M6 1a5 5 0 1 0 0 10Z" fill="currentColor"/><circle cx="6" cy="6" r="5" fill="none" stroke="currentColor" stroke-width="1.2"/></svg><b>DEEPLOOP</b>',
      '<svg viewBox="0 0 12 12" width="11" height="11" aria-hidden="true"><path d="M1 1h10v10H1Z M3.5 3.5h5v5h-5Z" fill="none" stroke="currentColor" stroke-width="1.2"/></svg><b>KVLT.IO</b>',
      '<svg viewBox="0 0 12 12" width="11" height="11" aria-hidden="true"><path d="M6 1v10M1 6h10M2.5 2.5l7 7M9.5 2.5l-7 7" stroke="currentColor" stroke-width="1.2"/></svg><b>NOVA®</b>',
      '<svg viewBox="0 0 12 12" width="11" height="11" aria-hidden="true"><path d="M1 9 4 3l2.4 4L8 5l3 4Z" fill="currentColor"/></svg><b>PEAK-9</b>',
      '<svg viewBox="0 0 12 12" width="11" height="11" aria-hidden="true"><path d="M1 6h10M6 1v10" stroke="currentColor" stroke-width="2.4"/></svg><b>SYNTHOS</b>',
      '<svg viewBox="0 0 12 12" width="11" height="11" aria-hidden="true"><path d="M1 11 6 1l5 10" fill="none" stroke="currentColor" stroke-width="1.6"/></svg><b>ACIDHAUS®</b>',
      '<svg viewBox="0 0 12 12" width="11" height="11" aria-hidden="true"><circle cx="6" cy="6" r="4.6" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="6" cy="6" r="1.6" fill="currentColor"/></svg><b>VECTOR-7</b>',
      '<svg viewBox="0 0 12 12" width="11" height="11" aria-hidden="true"><path d="M1 1h10L1 11h10" fill="none" stroke="currentColor" stroke-width="1.6"/></svg><b>NULLSET</b>',
    ].map(m => `<span>${m}</span>`).join('');
    // warning pictograms: no cameras, ear protection, 18+, strobe
    const picto = ['<path d="M2 4h3l1-1.5h4L11 4h3v8H2Z" fill="none" stroke="currentColor" stroke-width="1.3"/><circle cx="8" cy="8" r="2.2" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M1 15 15 1" stroke="currentColor" stroke-width="1.6"/>',
      '<path d="M4 9a4 4 0 0 1 8 0v4h-2V9a2 2 0 0 0-4 0v4H4Z" fill="currentColor"/>',
      '<rect x="1.5" y="1.5" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="8" y="11" text-anchor="middle" font-size="6.4" font-weight="700" fill="currentColor" font-family="ui-monospace,monospace">18+</text>',
      '<path d="M8 1.5 15 14.5H1Z" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M8 6v4.4M8 11.8v1.2" stroke="currentColor" stroke-width="1.5"/>',
      '<path d="M8 1v3M8 12v3M1 8h3M12 8h3M3 3l2 2M11 11l2 2M13 3l-2 2M5 11l-2 2" stroke="currentColor" stroke-width="1.4"/><circle cx="8" cy="8" r="2" fill="currentColor"/>',
    ].map(g => `<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">${g}</svg>`).join('');
    const reg = '<svg class="aca-reg" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><g fill="none"><circle cx="8" cy="8" r="4.6" stroke="#050505" stroke-width="3.2"/><path d="M8 0v16M0 8h16" stroke="#050505" stroke-width="3.2"/><circle cx="8" cy="8" r="4.6" stroke="#fff" stroke-width="1.2"/><path d="M8 0v16M0 8h16" stroke="#fff" stroke-width="1.2"/></g></svg>';
    return `<svg class="acd" width="0" height="0" aria-hidden="true" focusable="false" style="position:absolute;width:0;height:0;overflow:hidden"><defs>
      <filter id="acw" x="-8%" y="-12%" width="116%" height="124%" color-interpolation-filters="sRGB">
        <feTurbulence type="turbulence" baseFrequency="0.006 0.009" numOctaves="1" seed="5" result="w0"/>
        <feGaussianBlur in="w0" stdDeviation="6" result="w"/>
        <feDisplacementMap in="SourceGraphic" in2="w" scale="18" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
      <filter id="acr" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB">
        <feTurbulence type="turbulence" baseFrequency="0.011 0.008" numOctaves="1" seed="${seq + 2}" result="w0"/>
        <feGaussianBlur in="w0" stdDeviation="4" result="w"/>
        <feDisplacementMap in="SourceGraphic" in2="w" scale="34" xChannelSelector="R" yChannelSelector="B"/>
      </filter>
    </defs></svg>
    <div class="aca" id="${id}">
      <div class="aca-rip"></div>
      ${reg}<span class="aca-reg-b">${reg}</span>
      <div class="aca-top"><span>FRI 23.10</span><span class="aca-no">N° 030<i class="aca-bc" aria-hidden="true"></i></span></div>
      <div class="aca-rip2"></div>
      <p class="aca-word"><span style="font-size:${wsz}cqw" data-w="${word}">${word}</span></p>
      <p class="aca-slogan">DANCE · FEEL · REPEAT™ <em>ダンス ・ リピート</em></p>
      <div class="aca-grid">
        <div><b>DATE</b>FRI 23.10 → SAT 04:00</div>
        <div><b>PLACE</b>WAREHOUSE 04</div>
        <div><b>DOORS</b>23:00 · NO RE-ENTRY</div>
        <div><b>LINEUP</b>${name} / VOID.EXE</div>
      </div>
      <div class="aca-ticket"><i>✱</i>ADMIT ONE<b>18+</b><em>№ 000417</em></div>
      <p class="aca-kata" aria-hidden="true">シグナル・ルーム・ダンス・リピート</p>
      <div class="aca-picto">${picto}</div>
      <p class="aca-spine" aria-hidden="true">CAT.NO ACG-030 ✱ ${name}™ ✱ 1-800-NO-SLEEP ✱ ®2026 ✱ SIGNAL ROOM ✱ ACG-030</p>
      <div class="aca-spons">${marks}</div>
      <div class="aca-strip"><span>✱ DOORS 23:00 ✱ SIGNAL ROOM ✱ NO PHOTOS ✱ BRING EARPLUGS ✱ DOORS 23:00 ✱ SIGNAL ROOM ✱</span></div>
    </div>`;
  },

  materials: [
    { name: 'Vibrating pair', css: 'background: {acid}; border: 2px solid {clash}; /* the client primary pushed to full chroma beside its clash: primary hue +165 degrees at equal luminance, so the edge shimmers; never thin text on that edge */' },
    { name: 'Op-art ripple', css: 'background: repeating-radial-gradient(circle at 50% 50%, {acid} 0 9px, {clash} 9px 18px); filter: url(#acr); /* 8-14px bands in the pair, bent by a BLURRED turbulence displacement (smooth edges, no stair steps) and run edge to edge with no vignette; at 20% opacity as a card background */' },
    { name: 'Warped headline', css: 'text-transform: uppercase; /* every display line is distorted: line 1 letters scaleY 1.4–2.2 on a wave (from the baseline), the middle line scaleX(.62) and stretched, the last line an outline (-webkit-text-stroke: 2px {clash}; color: transparent) with two offset echoes in {acid} and {clash}; section titles get the same treatment smaller */' },
    { name: 'Ticket stub', css: 'background: {accent} (a fixed #B6FF00 lime when the accent is soft); color: {onAccent}; transform: skewX(-8deg); font: 700 10px ui-monospace, Menlo, monospace; /* half-circle perforation cut-outs on both sides; also the tab shape: a dashed 2px divider with a notch top and bottom */' },
    { name: 'Event strip', css: 'background: {clash}; color: #050505; font: 700 10.5px ui-monospace, Menlo, monospace; letter-spacing: .12em; /* a band of uppercase info (date, place, doors, line-up) separated by asterisks; marquee in motion, a fixed slice at rest */' },
    { name: 'Echo name', css: 'color: transparent; -webkit-text-stroke: 2px {acid}; filter: drop-shadow(.06em .06em 0 {clash}) drop-shadow(.06em .06em 0 {ink}); /* the flyer name as an outlined triple echo: the vibration is the effect, never chrome */' },
    { name: 'Field band', css: 'background: repeating-radial-gradient({acid} 0 8px, {clash} 8px 16px); opacity: .18; /* one per section, behind its header: ripple, strobe rays or warped check at 12–25% */' },
    { name: 'Hidden grid', css: 'background: repeating-linear-gradient(90deg, {ink} 0 1px, transparent 1px calc(100% / 12)); opacity: .05; /* 12 columns under everything: the calm that lets 5-9 overlapping layers read */' },
  ],

  rules: {
    do: [
      'Pair the dominant acid with its computed clash colour (primary hue +165 degrees at equal luminance) and let them meet edge to edge.',
      'Distort every display line differently (stretch on a wave, compress one line, outline-echo the last) and the section titles too; keep dates, tabs, strips and labels in clean mono caps.',
      'Keep a neutral rest area of about 30% and a hidden 12-column grid under 5 to 9 overlapping layers, with micro-type (catalogue numbers, trademark slogans, barcodes, registration marks) in every margin.',
      'Carry the flyer through the board: a field band and a dense info strip (catalogue no., BPM, katakana, sponsors, barcode) on every section; type listed like a line-up.',
      'Use tickets, perforated tabs, ON AIR switches, equaliser bars and invented sponsor marks as the interface vocabulary.',
    ],
    dont: [
      'Set thin type on a vibrating edge, or neon text on neon; body copy stays ink on the neutral.',
      'Warp every line the same way or drop the grid; without a resting area there is no hierarchy.',
      'Use chrome, glossy gradients or blobs: that is Y2K Chrome; here the vibration of two colours is the effect.',
      'Use drug iconography, smileys, real flyers or real sponsor marks; invent marks.',
    ],
  },
  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    principles: [
      ['Colour that vibrates', 'Two near-equal-luminance hues meet edge to edge.'],
      ['Warp every line', 'Stretch, compress, echo: each display line differently.'],
      ['Order underneath the noise', 'A hidden calm grid holds the dense layout together.'],
    ],
    do: [
      'Pair the primary with a computed clash colour.',
      'Distort every display line differently.',
      'Keep dates, tabs and strips scannable.',
    ],
    dont: [
      'Put thin type on a vibrating edge.',
      'Warp every line the same way.',
      'Use chrome or gloss.',
    ],
  },
});
})();
