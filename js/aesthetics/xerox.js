/* 22 Xerox — toner, raw, copied. Reference: 80s-90s punk and hardcore flyers,
   Pettibon-era zines, xerox-revival posters, office ephemera. Black toner on white
   paper: hard threshold contrast, speckle and dropouts, edge burn, dirty-drum
   streaks, slightly skewed copies, taped paste-up scraps, a black copier-edge band.
   Colour comes from the paper, not the ink: accent and secondary are coloured paper
   stocks (one scrap each); primary is the single misregistered overprint pass. Tape
   copies grey. Black is spent big: a lid-open toner field in the art, a reversed toner
   band per view, a black copier edge. Dark mode is the lid-open black with white paper
   scraps pasted on it (a negative copy), never white toner.
   Mechanism: the generation loss is real SVG filtering, not raster images. art()
   emits one hidden <svg> that defines the filters (fixed ids, so the css can use
   filter:url(#xrx-...)):
     xrx-copy   feTurbulence -> feDisplacementMap (toothed edges) -> feComponentTransfer
                discrete alpha (threshold) with a high-frequency feTurbulence dropout mask
     xrx-toner  the same, tighter, with more dropouts (solid black blocks)
     xrx-edge / xrx-rule  toothed paper and ruled-line edges
     xrx-g2 / xrx-g5      a smooth gradient pushed through feTurbulence + a steep
                feComponentTransfer threshold: 2nd and 5th generation of the same image.
   The hero art is a copied image: a 45-degree dot screen sized by a contrasty tone
   ramp, blurred and re-thresholded so dots fuse into slabs and drop out (masked by the
   brand initial), on a skewed sheet whose left 38% is the lid-open black field fading
   into the paper through the gen-5 threshold, with a taped scrap on coloured stock and
   a misregistered primary overprint block. */
(function () {
let seq = 0;
const XR_HASH = (x, y) => { const v = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453; return v - Math.floor(v); };

function xrDefs() {
  const sRGB = 'color-interpolation-filters="sRGB"';
  const thr = '<feComponentTransfer><feFuncA type="discrete" tableValues="0 0 0 1 1 1"/></feComponentTransfer>';
  const holes = (freq, seed, cut) => `<feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="2" seed="${seed}" result="n"/>`
    + `<feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -55 0 0 0 ${(55 * cut + 1).toFixed(1)}" result="h"/>`;
  const noiseGray = seed => `<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="${seed}" result="n"/>`
    + '<feColorMatrix in="n" type="matrix" values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1" result="ng"/>';
  const gen = (id, amt, slope, mid) => `<filter id="${id}" x="0" y="0" width="100%" height="100%" ${sRGB}>${noiseGray(5)}
      <feComposite in="SourceGraphic" in2="ng" operator="arithmetic" k1="0" k2="1" k3="${amt}" k4="${(-amt / 2).toFixed(3)}" result="m"/>
      <feComponentTransfer in="m"><feFuncR type="linear" slope="${slope}" intercept="${(0.5 - slope * mid).toFixed(2)}"/><feFuncG type="linear" slope="${slope}" intercept="${(0.5 - slope * mid).toFixed(2)}"/><feFuncB type="linear" slope="${slope}" intercept="${(0.5 - slope * mid).toFixed(2)}"/></feComponentTransfer></filter>`;
  return `<svg class="xr-defs" width="0" height="0" aria-hidden="true" focusable="false" style="position:absolute;width:0;height:0;overflow:hidden"><defs>
    <filter id="xrx-copy" x="-4%" y="-6%" width="108%" height="112%" ${sRGB}>
      <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="8" result="w"/>
      <feDisplacementMap in="SourceGraphic" in2="w" scale="4.5" xChannelSelector="R" yChannelSelector="G" result="d"/>
      ${holes('0.015 0.5', 2, 0.8)}
      <feComposite in="d" in2="h" operator="in" result="e"/>
      <feComponentTransfer in="e"><feFuncA type="discrete" tableValues="0 0 0 1 1 1"/></feComponentTransfer>
    </filter>
    <filter id="xrx-toner" x="-4%" y="-8%" width="108%" height="116%" ${sRGB}>
      <feTurbulence type="fractalNoise" baseFrequency="0.07" numOctaves="2" seed="3" result="w"/>
      <feDisplacementMap in="SourceGraphic" in2="w" scale="3" xChannelSelector="R" yChannelSelector="G" result="d"/>
      ${holes(0.55, 6, 0.665)}
      <feComposite in="d" in2="h" operator="in" result="e"/>
      <feComponentTransfer in="e"><feFuncA type="discrete" tableValues="0 0 0 1 1 1"/></feComponentTransfer>
    </filter>
    <filter id="xrx-edge" x="-3%" y="-6%" width="106%" height="112%" ${sRGB}>
      <feTurbulence type="fractalNoise" baseFrequency="0.11" numOctaves="2" seed="4" result="w"/>
      <feDisplacementMap in="SourceGraphic" in2="w" scale="3.4" xChannelSelector="R" yChannelSelector="G" result="d"/>
      <feComponentTransfer in="d"><feFuncA type="discrete" tableValues="0 0 0 1 1 1"/></feComponentTransfer>
    </filter>
    <filter id="xrx-lite" x="-3%" y="-8%" width="106%" height="116%" ${sRGB}>
      <feTurbulence type="fractalNoise" baseFrequency="0.16" numOctaves="2" seed="12" result="w"/>
      <feDisplacementMap in="SourceGraphic" in2="w" scale="1.5" xChannelSelector="R" yChannelSelector="G" result="d"/>
      <feComponentTransfer in="d"><feFuncA type="discrete" tableValues="0 0 0 1 1 1"/></feComponentTransfer>
    </filter>
    <filter id="xrx-rule" x="-2%" y="-400%" width="104%" height="900%" ${sRGB}>
      <feTurbulence type="fractalNoise" baseFrequency="0.16 0.5" numOctaves="2" seed="9" result="w"/>
      <feDisplacementMap in="SourceGraphic" in2="w" scale="3" xChannelSelector="R" yChannelSelector="G" result="d"/>
      <feComponentTransfer in="d"><feFuncA type="discrete" tableValues="0 0 0 1 1 1"/></feComponentTransfer>
    </filter>
    ${gen('xrx-g2', 0.35, 2.4, 0.5)}
    ${gen('xrx-g5', 0.6, 9, 0.46)}
    <clipPath id="xrx-torn" clipPathUnits="objectBoundingBox"><path d="M0 0H1V0.3L0.92 0.4L0.84 0.28L0.75 0.43L0.67 0.3L0.58 0.46L0.5 0.29L0.41 0.42L0.33 0.27L0.24 0.4L0.16 0.26L0.08 0.38L0 0.3Z"/></clipPath>
  </defs></svg>`;
}

registerAesthetic({
  key: 'xerox', order: 22,
  name: 'Xerox',
  descriptor: 'Toner · Raw · Copied',
  influences: 'Photocopy zines / Punk flyers / Office ephemera',
  summary: 'Black toner on white paper: hard contrast, speckle, edge burn and taped-on scraps.',
  motto: 'Copy of a copy of a copy.',
  kicker: 'Copy 02 of 50',
  mode: 'light',
  slideShape: 'minimal',
  labels: { material: 'Copy', states: ['Original', '2nd gen', '5th gen'], statesKind: 'swatch' },
  layout: { hero: 'poster', palette: 'swatches', sections: 'two-col' },
  type: { ui: 'body', label: 'body', display: 1 },
  highlight: 'custom',
  highlightNote: 'The word stays toner (ink) or the readable text colour on a flat primary overprint block, offset and tilted about 1 degree like a second pass that did not register; no outline, no gradient, no accent.',
  cardFill: '--ab-scrap',

  roles: {
    canvas: {
      use: 'The copy paper (slightly dulled), with clustered dust, a drum streak and edge burn laid over it; in dark mode the lid-open black field',
      never: 'Text, or a pure-white digital panel; scraps pasted on it are the lighter paper',
    },
    ink: {
      use: 'Black toner, spent big: the headline, a reversed toner band per view, the lid-open field in the art, every rule, the main action block, selected states and status labels',
      never: 'Soft greys or gradients; toner is solid, dropped-out or absent',
      coverage: '30–40%',
    },
    primary: {
      use: 'The overprint: a flat fluorescent block behind the highlight word, offset under the one main action and the selected switch, and one block over the art',
      never: 'Smooth fills, body text, a second CTA, more than one block per view area',
      coverage: '≈8–10%',
    },
    secondary: {
      use: 'A second coloured paper stock: one pasted scrap (the 02 panel) copied in toner',
      never: 'Ink of any kind: tape, fills, bars, buttons or text',
      coverage: '≈5–8%',
    },
    accent: {
      use: 'Coloured paper stock for one scrap in the art, and a highlighter swipe over one text line',
      never: 'Buttons, borders, headline text, tape',
      coverage: '≤5%',
    },
  },

  // Light paper is dulled a little so the lighter scraps and tape read as pasted on. Dark mode is the
  // copier's own dark: the lid-open black field (88% black), with white paper scraps pasted on it.
  canvas(b) { return b.isDark ? b.mix('#000000', b.canvas, 0.88) : b.mix('#d6d3cb', b.canvas, 0.18); },

  tokens(t) {
    const st = typeof state !== 'undefined' ? state : null;
    const hf = st && st.headingFont;
    const d = t.isDark;
    const ws = String((hf && hf.weights) || '400').split(';').map(Number).filter(Boolean);
    const le = ws.filter(x => x <= 900);
    const hw = le.length ? Math.max(...le) : Math.min(...ws);
    // the highlight word reads on the flat primary block: toner or white, whichever contrasts more
    const hlInk = t.contrast(t.ink, t.primary) >= t.contrast(t.onPrimary, t.primary) ? t.ink : t.onPrimary;
    // scraps are always paper with toner type, so in dark mode (a black field) they carry their own ink
    const paper = d ? t.mix('#ffffff', t.canvas, 0.9) : t.mix('#ffffff', t.canvas, 0.62);
    const toner = d ? '#141414' : t.ink;
    const stockA = t.mix(t.accent, paper, 0.5);       // coloured paper stock, not ink
    const stockB = t.mix(t.secondary, paper, 0.24);
    const mutedOn = bg => { let m = t.mix(toner, bg, 0.62); for (let k = 0; k < 8 && t.contrast(m, bg) < 4.6; k++) m = t.mix(toner, m, 0.25); return m; };
    return {
      '--ab-tr': (hf && { wide: 0.4, techno: 0.4 }[hf.cls]) ?? 1,
      '--ab-type-pick-w': hw,
      '--ab-hw': hw,
      '--ab-scrap': paper,
      '--xr-paper': paper,
      '--xr-toner': toner,
      '--xr-paper-muted': mutedOn(paper),
      '--xr-stock-a': stockA,
      '--xr-stock-a-muted': mutedOn(stockA),
      '--xr-stock-b': stockB,
      '--xr-stock-b-muted': mutedOn(stockB),
      '--ab-hl-ink': hlInk,
      '--ab-tape': t.alpha(toner, 0.13),
      '--ab-tape-edge': t.alpha(toner, 0.32),
      '--ab-blend': d ? 'screen' : 'multiply',
      '--ab-toner-soft': t.alpha(t.ink, 0.5),
      '--ab-hi': t.contrast(t.ink, t.accent) >= 4.5 ? t.accent : t.mix(t.accent, t.canvas, 0.4),
    };
  },

  art(ctx) {
    const t = ctx.t;
    const id = 'xr' + (++seq);
    const W = 224, H = 200;
    // the copy is always paper with toner on it (in dark mode a white sheet on the black field)
    const toner = t.isDark ? '#141414' : t.ink;
    const paper = t.isDark ? t.mix('#ffffff', t.canvas, 0.9) : t.mix('#ffffff', t.canvas, 0.62);
    const stock = t.mix(t.accent, paper, 0.5);
    // A copied photo, not a screen: a 45-degree dot screen sized by a contrasty tone ramp
    // (0.05-1, gamma 0.6), blurred and re-thresholded so dots fuse into slabs in the shadows
    // and drop out in the highlights; masked by the initial and fading into the lid-open black.
    const P = 7, dots = [];
    for (let j = 0; j * P / 2 < H; j++) {
      for (let i = 0; i * P < W; i++) {
        const x = i * P + (j % 2) * P / 2 + 3, y = j * P / 2 + 2;
        if (x < 40 || x > 216 || y < 10 || y > 188) continue;
        const ramp = 0.6 * (1 - (x - 40) / 176) + 0.4 * (y / H) + 0.28 * Math.exp(-(((x - 96) / 34) ** 2 + ((y - 150) / 30) ** 2));
        let d = 0.05 + 0.95 * Math.pow(Math.max(0, Math.min(1, ramp + (XR_HASH(i, j) - 0.5) * 0.3)), 1.7);
        d = Math.max(0.05, Math.min(1, d));
        dots.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(3.4 * Math.sqrt(d)).toFixed(2)}"/>`);
      }
    }
    // a few stray toner specks, bunched like dust on the glass
    let specks = '';
    for (let k = 0; k < 22; k++) {
      const c = k % 3 === 0 ? [176, 150] : k % 3 === 1 ? [128, 22] : [200, 112];
      const x = c[0] + (XR_HASH(k, 3) - 0.5) * 30, y = c[1] + (XR_HASH(k, 7) - 0.5) * 26, r = 0.35 + XR_HASH(k, 11) * 0.9;
      specks += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}"/>`;
    }
    const font = 'font-family:var(--ab-font-label,var(--ab-font-b),monospace)';
    // tear-off tab strip (fills the paper left of the art): a solid band, then 7 cut tabs
    // carrying the brand name rotated -90deg; the third tab has been torn off (xrx-torn stub)
    const nm = escapeHtml(String(ctx.brandName || '').trim());
    const tabs = [0, 1, 2, 3, 4, 5, 6].map(i => i === 2 ? '<span class="xrt-tab is-torn"></span>' : `<span class="xrt-tab"><span>${nm}</span></span>`).join('');
    const strip = `<div class="xrt" aria-hidden="true"><div class="xrt-band"><b>TAKE ONE —</b><i>COPY 02 OF 50</i></div><div class="xrt-tabs">${tabs}</div></div>`;
    return `${xrDefs()}<div class="xra"><svg viewBox="0 0 ${W} ${H}" width="100%" height="100%" focusable="false" preserveAspectRatio="xMidYMid meet">
      <defs>
        <mask id="${id}m" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><text x="142" y="178" text-anchor="middle" font-size="182" fill="#fff" style="font-family:var(--ab-font-h);font-weight:var(--ab-hw,900)">${ctx.initial}</text></mask>
        <filter id="${id}t" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="1.1"/><feComponentTransfer><feFuncA type="discrete" tableValues="0 0 1 1"/></feComponentTransfer></filter>
        <linearGradient id="${id}r" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#fff"/></linearGradient>
      </defs>
      <g filter="url(#xrx-copy)">
        <rect x="2" y="2" width="220" height="196" fill="${paper}"/>
        <g mask="url(#${id}m)"><g filter="url(#${id}t)" fill="${toner}">${dots.join('')}</g></g>
        <g fill="${toner}" opacity=".85">${specks}</g>
      </g>
      <g filter="url(#xrx-rule)" fill="${toner}">
        <path d="M0 189H224V200H0Z"/><path d="M224 0V13L212 0Z"/>
      </g>
      <g filter="url(#xrx-g5)" style="mix-blend-mode:multiply"><rect x="0" y="0" width="66" height="200" fill="#000"/><rect x="66" y="0" width="52" height="200" fill="url(#${id}r)"/></g>
      <rect x="92" y="96" width="104" height="80" fill="${t.primary}" transform="rotate(1.6 144 136)" style="mix-blend-mode:multiply" opacity=".94"/>
      <g transform="rotate(-90 12 150)" fill="${paper}" style="${font}" font-size="5.4" letter-spacing=".5" font-weight="700"><text x="12" y="152">XEROX · COPY 02/50 · 2ND GEN · LID OPEN</text></g>
      <g transform="rotate(3.2 180 40)">
        <g filter="url(#xrx-edge)">
          <rect x="142" y="17" width="76" height="46" fill="${toner}" transform="translate(1.3 1.8)"/>
          <rect x="142" y="17" width="76" height="46" fill="${stock}"/>
        </g>
        <g fill="${toner}" style="${font}" font-weight="700" font-size="7.4" letter-spacing=".5"><text x="147" y="30">NO. 02 OF 50</text><text x="147" y="42">DO NOT FOLD.</text><text x="147" y="54" font-weight="400" font-size="6.2">COPY THE COPY.</text></g>
        <rect x="133" y="11" width="26" height="12" fill="${toner}" opacity=".14" stroke="${toner}" stroke-opacity=".3" stroke-width=".6" transform="rotate(-32 146 17)"/>
        <rect x="204" y="53" width="26" height="12" fill="${toner}" opacity=".14" stroke="${toner}" stroke-opacity=".3" stroke-width=".6" transform="rotate(-32 217 59)"/>
      </g>
      <path d="M176 0V200" stroke="${toner}" stroke-opacity=".1" stroke-width="7" fill="none" filter="url(#xrx-rule)"/>
    </svg></div>${strip}`;
  },

  materials: [
    { name: 'Toner block', css: 'background: {ink}; color: {canvas}; filter: url(#xrx-toner); /* solid black with toothed edges and dropout specks; one reversed band per view and the lid-open field, never a gradient */' },
    { name: 'Primary overprint', css: 'background: {primary}; transform: translate(5px, 5px) rotate(.6deg); mix-blend-mode: multiply; /* the one second pass, off-register behind the highlight word, the main action and one art block */' },
    { name: 'Paper stock', css: 'background: color-mix(in srgb, {accent} 50%, {scrap}); /* colour lives in the paper: one scrap on accent stock, one on secondary stock, toner type on both */' },
    { name: 'Paper scrap + copy shadow', css: 'background: {scrap}; filter: url(#xrx-edge) drop-shadow(1px 2px 0 {ink}); transform: rotate(-.5deg); /* a pasted scrap: lighter paper, toothed cut edge, a 1px toner shadow line */' },
    { name: 'Tape', css: 'background: {tape}; border: 1px solid {tapeEdge}; width: 38px; height: 16px; transform: rotate(-32deg); /* tape copies grey: toner at 13%, edges at 32% */' },
    { name: 'Copier noise', css: 'clustered dust (two-octave feTurbulence mask), one vertical drum streak 32px wide at 7% toner with a turbulent edge, horizontal toner-loss streaks through the headline, edge burn' },
    { name: 'Generation loss', css: 'background: linear-gradient(135deg, {ink}, {canvas}); filter: url(#xrx-g5); /* the same ramp through feTurbulence and a steep threshold: gen 1 smooth, gen 2 grainy, gen 5 blocks and dropouts */' },
  ],

  rules: {
    do: [
      'Spend on black: one reversed toner band per view, a lid-open black field in the art, a black copier edge; paper and toner only, threshold-crisp.',
      'Copy an image, not a filter: shadows fuse into slabs, highlights drop out, the edge falls into black.',
      'Take colour from the paper: one scrap on coloured stock, the primary as one misregistered overprint pass, tape copied grey.',
      'Degrade with structure: clustered dust, one drum streak down the sheet, horizontal toner-loss streaks; not an even speckle.',
    ],
    dont: [
      'Use smooth fills, soft shadows or gradients except the one generation-loss sample; copies have only toner and paper.',
      'Set the headline as cut-out ransom letters in mixed faces; one heavy face, copied, is the identity.',
      'Use coloured tape, coloured progress fills or a row of saturated chips; colour is the paper, not the ink.',
      'Print white toner on dark grey; dark mode is the lid-open black with white paper pasted on.',
    ],
  },
  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    principles: [
      ['Spend on black', 'Toner bands, a lid-open field, hard thresholds.'],
      ['Copy an image', 'Shadows fuse into slabs; highlights drop out.'],
      ['Colour is the paper', 'Coloured stock and one overprint pass.'],
    ],
    do: [
      'Set type in one heavy uppercase face.',
      'Reverse one band per view out of toner.',
      'Take colour from the paper stock.',
    ],
    dont: [
      'Use smooth fills or soft shadows.',
      'Use coloured tape or coloured bars.',
      'Print white toner on grey.',
    ],
  },
});
})();
