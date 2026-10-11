/* 30 Acid Graphics — toxic, warped, loud. References: AIGA Eye on Design on acid graphics
   and rave culture (vibrating colour, warped type, op-art, antidesign), Saville's gridded
   calm under the Haçienda noise, The Designers Republic's invented sponsors, Tomato's
   type blocks, Anja Kaiser's flat layer stacks, rave flyers' who / where / when.

   Mechanism. COLOUR THAT VIBRATES: the client primary is pushed to full chroma (the "acid")
   and paired with a computed CLASH colour 165 degrees away at EQUAL luminance, so the edge
   between them shimmers. Type is warped by squeezing the face horizontally (a wide face
   at a big size, scaleX < 1: tall stretched letters with no layout cost) and the last
   headline word is an outline with an offset echo. The art is a flyer: an op-art ripple
   (repeating radial bands in the pair, bent by a displacement filter), one chrome word,
   mono who / where / when blocks, a ticket stub, invented sponsor marks and an event
   strip. Underneath everything runs a hidden 12-column grid at 4-6% (the calm), and a
   neutral rest area (black / white) keeps density from becoming noise. Chrome is a
   one-word accent only (Y2K Chrome owns chrome). tokens() overrides --ab-primary with
   the acid and exposes --ab-clash. */
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
  highlightNote: 'The last word is an outline only (no fill, a 2px stroke): in the clash colour on black, in ink on the acid field in light mode, with a solid offset echo behind it in the acid. In running UI text the highlight word is plain ink.',

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
      use: 'One spot colour: the ticket stub, one asterisk spark in the marquee, the focus ring',
      never: 'Buttons, body text, borders, large fills',
      coverage: '≤4%',
    },
  },

  canvas(b) {
    if (b.isDark) { const h = b.hexToHsl(b.canvas); return b.hslToHex(h.h, Math.min(h.s, 12), 2.4); }
    return b.mix('#ffffff', b.canvas, 0.85);
  },

  tokens(t) {
    const hf = typeof state !== 'undefined' && state && state.headingFont;
    const cls = hf && hf.cls;
    const ws = String((hf && hf.weights) || '400').split(';').map(Number).filter(Boolean);
    const le = ws.filter(x => x <= 900);
    const hw = le.length ? Math.max(...le) : Math.min(...ws);
    const acid = acPush(t.primary), clash = acClash(acid), d = t.isDark;
    const brand = typeof effectiveContent === 'function' ? String(effectiveContent().brandName || '') : '';
    const nm = brand.toUpperCase().replace(/['"\\;{}]/g, '').slice(0, 28);
    // horizontal squeeze that makes the headline tall: wide faces take the most
    const sx = { wide: 0.62, techno: 0.66, heavy: 0.72, condensed: 1, 'neo-grotesk': 0.78, grotesk: 0.78 }[cls] ?? 0.8;
    const on = hex => (t.contrast('#050505', hex) >= t.contrast('#ffffff', hex) ? '#050505' : '#ffffff');
    return {
      '--ab-type-pick-w': hw,
      '--ac-hw': hw,
      '--ab-primary': acid,
      '--ab-on-primary': on(acid),
      '--ab-pri-tint': t.mix(acid, t.canvas, 0.14),
      '--ab-acid': acid,
      '--ab-clash': clash,
      '--ab-on-acid': on(acid),
      '--ab-on-clash': on(clash),
      '--ac-sx': sx,
      '--ac-fg': d ? acid : t.ink,
      '--ac-fg2': d ? clash : t.ink,
      '--ac-on-canvas': d ? acid : t.ink,
      '--ac-grid': t.alpha(t.ink, d ? 0.045 : 0.065),
      '--ac-acid-a': t.alpha(acid, 0.12),
      '--ac-clash-a': t.alpha(clash, 0.12),
      '--ac-brand': `'${nm}'`,
      '--ab-tr': (cls && { condensed: 0.4, heavy: 0.5, wide: 0.5, techno: 0.5 }[cls]) ?? 1,
    };
  },

  art(ctx) {
    const t = ctx.t, e = escapeHtml;
    const id = 'ac' + (++seq);
    const first = String(ctx.brandName || '').trim().split(/\s+/)[0] || 'LIVE';
    const word = e(first.toUpperCase().slice(0, 12));
    const wsz = (20 * Math.min(1, 4.4 / Math.max(first.length, 1))).toFixed(2);
    const name = e(String(ctx.brandName || '').trim().toUpperCase());
    const marks = [
      '<svg viewBox="0 0 12 12" width="11" height="11" aria-hidden="true"><path d="M6 .6 11 3.3v5.4L6 11.4 1 8.7V3.3Z" fill="none" stroke="currentColor" stroke-width="1.4"/></svg><b>HYPERFLUX</b>',
      '<svg viewBox="0 0 12 12" width="11" height="11" aria-hidden="true"><path d="M6 1 11.4 10.8H.6Z" fill="currentColor"/></svg><b>OUTRA</b>',
      '<svg viewBox="0 0 12 12" width="11" height="11" aria-hidden="true"><path d="M6 1a5 5 0 1 0 0 10Z" fill="currentColor"/><circle cx="6" cy="6" r="5" fill="none" stroke="currentColor" stroke-width="1.2"/></svg><b>DEEPLOOP</b>',
    ].map(m => `<span>${m}</span>`).join('');
    return `<svg class="acd" width="0" height="0" aria-hidden="true" focusable="false" style="position:absolute;width:0;height:0;overflow:hidden"><defs>
      <filter id="acw" x="-8%" y="-8%" width="116%" height="116%" color-interpolation-filters="sRGB">
        <feTurbulence type="turbulence" baseFrequency="0.004 0.02" numOctaves="1" seed="5" result="w"/>
        <feDisplacementMap in="SourceGraphic" in2="w" scale="30" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
      <filter id="acr" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB">
        <feTurbulence type="turbulence" baseFrequency="0.011 0.008" numOctaves="1" seed="${seq + 2}" result="w"/>
        <feDisplacementMap in="SourceGraphic" in2="w" scale="46" xChannelSelector="R" yChannelSelector="B"/>
      </filter>
    </defs></svg>
    <div class="aca" id="${id}">
      <div class="aca-rip"></div>
      <div class="aca-top"><span>FRI 23.10</span><span>N° 030</span></div>
      <p class="aca-word"><span style="font-size:${wsz}cqw">${word}</span></p>
      <div class="aca-grid">
        <div><b>DATE</b>FRI 23.10 → SAT 04:00</div>
        <div><b>PLACE</b>WAREHOUSE 04</div>
        <div><b>DOORS</b>23:00 · NO RE-ENTRY</div>
        <div><b>LINEUP</b>${name} / VOID.EXE</div>
      </div>
      <div class="aca-ticket"><i>✱</i>ADMIT ONE<b>18+</b></div>
      <div class="aca-spons">${marks}</div>
      <div class="aca-strip"><span>✱ DOORS 23:00 ✱ SIGNAL ROOM ✱ NO PHOTOS ✱ BRING EARPLUGS ✱ DOORS 23:00 ✱ SIGNAL ROOM ✱</span></div>
    </div>`;
  },

  materials: [
    { name: 'Vibrating pair', css: 'background: {acid}; border: 2px solid {clash}; /* the client primary pushed to full chroma beside its clash: primary hue +165 degrees at equal luminance, so the edge shimmers; never thin text on that edge */' },
    { name: 'Op-art ripple', css: 'background: repeating-radial-gradient(circle at 50% 50%, {acid} 0 9px, {clash} 9px 18px); filter: url(#acr); /* 8-14px bands in the pair, bent by a turbulence displacement; at 20% opacity as a card background */' },
    { name: 'Warped headline', css: 'text-transform: uppercase; transform: scaleX(.62); width: 161%; /* a wide face at a big size squeezed horizontally = tall stretched letters; the last word is an outline: -webkit-text-stroke: 2px {clash}; color: transparent; with an offset echo in {acid} */' },
    { name: 'Ticket stub', css: 'background: {accent}; color: {onAccent}; transform: skewX(-8deg); font: 700 10px ui-monospace, Menlo, monospace; /* half-circle perforation cut-outs on both sides; also the tab shape: a dashed 2px divider with a notch top and bottom */' },
    { name: 'Event strip', css: 'background: {clash}; color: #050505; font: 700 10.5px ui-monospace, Menlo, monospace; letter-spacing: .12em; /* a band of uppercase info (date, place, doors, line-up) separated by asterisks; marquee in motion, a fixed slice at rest */' },
    { name: 'Chrome word', css: 'background: linear-gradient(180deg, #F4F7FA 0 46%, #6C7480 48%, #C9CED6 52% 72%, #5A6068); -webkit-background-clip: text; color: transparent; /* chrome for ONE word only; the system is colour, not chrome */' },
    { name: 'Hidden grid', css: 'background: repeating-linear-gradient(90deg, {ink} 0 1px, transparent 1px calc(100% / 12)); opacity: .05; /* 12 columns under everything: the calm that lets 5-9 overlapping layers read */' },
  ],

  rules: {
    do: [
      'Pair the dominant acid with its computed clash colour (primary hue +165 degrees at equal luminance) and let them meet edge to edge.',
      'Warp only the headline (a wide face squeezed horizontally, last word outlined); keep dates, tabs, strips and labels in clean mono caps.',
      'Keep a neutral rest area of about 30% and a hidden 12-column grid under 5 to 9 overlapping layers.',
      'Use tickets, perforated tabs, event strips and invented sponsor marks as the interface vocabulary.',
    ],
    dont: [
      'Set thin type on a vibrating edge, or neon text on neon; body copy stays ink on the neutral.',
      'Warp everything equally or drop the grid; without a resting area there is no hierarchy.',
      'Turn it into Y2K Chrome: chrome is a one-word accent, never the system, and no glossy blobs.',
      'Use drug iconography, smileys, real flyers or real sponsor marks; invent marks.',
    ],
  },
  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    principles: [
      ['Colour that vibrates', 'Two near-equal-luminance hues meet edge to edge.'],
      ['Warp with a reason', 'Stretch the headline; keep the information layer clean.'],
      ['Order underneath the noise', 'A hidden calm grid holds the dense layout together.'],
    ],
    do: [
      'Pair the primary with a computed clash colour.',
      'Stretch or skew only the headline.',
      'Keep dates, tabs and strips scannable.',
    ],
    dont: [
      'Put thin type on a vibrating edge.',
      'Warp everything equally.',
      'Use chrome as the system.',
    ],
  },
});
})();
