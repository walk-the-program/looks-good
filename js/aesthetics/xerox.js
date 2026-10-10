/* 22 Xerox — toner, raw, copied. Reference: 80s-90s punk and hardcore flyers,
   Pettibon-era zines, xerox-revival posters, office ephemera. Black toner on white
   paper: hard threshold contrast, speckle and dropouts, edge burn, dirty-drum
   streaks, slightly skewed copies, taped paste-up scraps, a black copier-edge band.
   Colour is a second pass only: primary is a fluorescent overprint block, accent a
   highlighter swipe, secondary the tape. Never a smooth UI fill.
   Mechanism: the generation loss is real SVG filtering, not raster images. art()
   emits one hidden <svg> that defines the filters (fixed ids, so the css can use
   filter:url(#xrx-...)):
     xrx-copy   feTurbulence -> feDisplacementMap (toothed edges) -> feComponentTransfer
                discrete alpha (threshold) with a high-frequency feTurbulence dropout mask
     xrx-toner  the same, tighter, with more dropouts (solid black blocks)
     xrx-edge / xrx-rule  toothed paper and ruled-line edges
     xrx-g2 / xrx-g5      a smooth gradient pushed through feTurbulence + a steep
                feComponentTransfer threshold: 2nd and 5th generation of the same image.
   The hero art is a coarse halftone (45-degree dot screen sized by a tone ramp,
   masked by the brand initial set in the heading face) on a skewed copy with a
   black copier band, a taped scrap and a misregistered primary overprint block. */
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
      ${holes(0.7, 2, 0.72)}
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
      use: 'The copy paper (slightly dulled), with toner speckle, edge burn and two faint drum streaks laid over it',
      never: 'Text, or a pure-white digital panel; scraps pasted on it are the lighter paper',
    },
    ink: {
      use: 'Black toner: the headline, every rule, the main action block, selected states, status labels and the copier band',
      never: 'Soft greys or gradients; toner is solid, dropped-out or absent',
      coverage: '20–25%',
    },
    primary: {
      use: 'The overprint: a flat fluorescent block behind the highlight word, offset under the one main action and the selected switch, and one block over the art',
      never: 'Smooth fills, body text, a second CTA, more than one block per view area',
      coverage: '≈8–10%',
    },
    secondary: {
      use: 'The tape: translucent strips holding scraps down, plus the track under confidence bars and the second pass in the 2nd-generation sample',
      never: 'Buttons, body text, large panels',
      coverage: '≈5–8%',
    },
    accent: {
      use: 'A highlighter swipe over one line of text (the sub-copy lead and one caption in the art), a copy shows it in grey but ours keeps it',
      never: 'Buttons, borders, headline text, fills larger than a text line',
      coverage: '≤3%',
    },
  },

  // Light paper is dulled a little so the lighter scraps and tape read as pasted on.
  canvas(b) { return b.isDark ? null : b.mix('#d6d3cb', b.canvas, 0.18); },

  tokens(t) {
    const st = typeof state !== 'undefined' ? state : null;
    const hf = st && st.headingFont;
    const d = t.isDark;
    const ws = String((hf && hf.weights) || '400').split(';').map(Number).filter(Boolean);
    const le = ws.filter(x => x <= 900);
    const hw = le.length ? Math.max(...le) : Math.min(...ws);
    // the highlight word reads on the flat primary block: toner or white, whichever contrasts more
    const hlInk = t.contrast(t.ink, t.primary) >= t.contrast(t.onPrimary, t.primary) ? t.ink : t.onPrimary;
    return {
      '--ab-tr': (hf && { wide: 0.4, techno: 0.4 }[hf.cls]) ?? 1,
      '--ab-type-pick-w': hw,
      '--ab-hw': hw,
      '--ab-scrap': d ? t.mix(t.ink, t.canvas, 0.1) : t.mix('#ffffff', t.canvas, 0.62),
      '--ab-hl-ink': hlInk,
      '--ab-tape': t.alpha(t.secondary, d ? 0.55 : 0.5),
      '--ab-tape-edge': t.alpha(t.secondary, 0.8),
      '--ab-blend': d ? 'screen' : 'multiply',
      '--ab-toner-soft': t.alpha(t.ink, 0.5),
      '--ab-hi': t.contrast(t.ink, t.accent) >= 4.5 ? t.accent : t.mix(t.accent, t.canvas, 0.4),
    };
  },

  art(ctx) {
    const t = ctx.t;
    const id = 'xr' + (++seq);
    const W = 224, H = 200;
    const toner = t.ink;
    const paper = t.isDark ? t.mix(t.ink, t.canvas, 0.1) : t.mix('#ffffff', t.canvas, 0.62);
    const blend = t.isDark ? 'screen' : 'multiply';
    const hi = t.contrast(t.ink, t.accent) >= 4.5 ? t.accent : t.mix(t.accent, t.canvas, 0.4);
    // 45-degree dot screen: staggered rows, dot radius from a tone ramp (darker bottom-left)
    const P = 7, dots = [];
    for (let j = 0; j * P / 2 < H; j++) {
      for (let i = 0; i * P < W; i++) {
        const x = i * P + (j % 2) * P / 2 + 3, y = j * P / 2 + 2;
        if (x < 22 || x > 206 || y < 12 || y > 186) continue;
        let d = 0.18 + 0.82 * (0.62 * (1 - x / W) + 0.38 * (y / H)) + (XR_HASH(i, j) - 0.5) * 0.25;
        d = Math.max(0.05, Math.min(1, d));
        dots.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(3.3 * Math.sqrt(d)).toFixed(2)}"/>`);
      }
    }
    // a few stray toner specks on the sheet
    let specks = '';
    for (let k = 0; k < 16; k++) {
      const x = 20 + XR_HASH(k, 3) * 196, y = 6 + XR_HASH(k, 7) * 190, r = 0.35 + XR_HASH(k, 11) * 0.9;
      specks += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}"/>`;
    }
    const font = 'font-family:var(--ab-font-label,var(--ab-font-b),monospace)';
    // tear-off tab strip (fills the paper left of the art): a solid band, then 7 cut tabs
    // carrying the brand name rotated -90deg; the third tab has been torn off (xrx-torn stub)
    const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const nm = esc(String(ctx.brandName || '').trim());
    const tabs = [0, 1, 2, 3, 4, 5, 6].map(i => i === 2 ? '<span class="xrt-tab is-torn"></span>' : `<span class="xrt-tab"><span>${nm}</span></span>`).join('');
    const strip = `<div class="xrt" aria-hidden="true"><div class="xrt-band"><b>TAKE ONE —</b><i>COPY 02 OF 50</i></div><div class="xrt-tabs">${tabs}</div></div>`;
    return `${xrDefs()}<div class="xra"><svg viewBox="0 0 ${W} ${H}" width="100%" height="100%" focusable="false" preserveAspectRatio="xMidYMid meet">
      <defs><mask id="${id}m" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><text x="100" y="177" text-anchor="middle" font-size="184" fill="#fff" style="font-family:var(--ab-font-h);font-weight:var(--ab-hw,900)">${ctx.initial}</text></mask></defs>
      <g filter="url(#xrx-copy)">
        <rect x="2" y="2" width="220" height="196" fill="${paper}"/>
        <g mask="url(#${id}m)" fill="${toner}">${dots.join('')}</g>
        <g fill="${toner}" opacity=".85">${specks}</g>
      </g>
      <g filter="url(#xrx-rule)" fill="${toner}">
        <path d="M0 0H15V200H0Z"/><path d="M0 187H224V200H0Z"/><path d="M224 0V13L212 0Z"/>
      </g>
      <rect x="84" y="94" width="108" height="82" fill="${t.primary}" transform="rotate(1.6 138 135)" style="mix-blend-mode:${blend}" opacity=".94"/>
      <g transform="rotate(-90 9 150)" fill="${paper}" style="${font}" font-size="5.4" letter-spacing=".5" font-weight="700"><text x="9" y="152">XEROX · COPY 02/50 · 2ND GEN</text></g>
      <g transform="rotate(3.2 180 40)">
        <g filter="url(#xrx-edge)">
          <rect x="142" y="17" width="76" height="46" fill="${toner}" transform="translate(1.3 1.8)"/>
          <rect x="142" y="17" width="76" height="46" fill="${t.isDark ? t.mix(t.ink, t.canvas, 0.16) : '#ffffff'}"/>
        </g>
        <rect x="147" y="35" width="56" height="8.5" fill="${hi}" style="mix-blend-mode:${blend}"/>
        <g fill="${toner}" style="${font}" font-weight="700" font-size="7.4" letter-spacing=".5"><text x="147" y="30">NO. 02 OF 50</text><text x="147" y="42">DO NOT FOLD.</text><text x="147" y="54" font-weight="400" font-size="6.2">COPY THE COPY.</text></g>
        <rect x="133" y="11" width="26" height="12" fill="${t.secondary}" opacity=".6" transform="rotate(-32 146 17)"/>
        <rect x="204" y="53" width="26" height="12" fill="${t.secondary}" opacity=".6" transform="rotate(-32 217 59)"/>
      </g>
      <path d="M70 0V200M170 0V200" stroke="${toner}" stroke-opacity=".09" stroke-width="1" fill="none"/>
    </svg></div>${strip}`;
  },

  materials: [
    { name: 'Toner block', css: 'background: {ink}; color: {canvas}; filter: url(#xrx-toner); /* solid black with toothed edges and dropout specks; the only dark fill, never a gradient */' },
    { name: 'Primary overprint', css: 'background: {primary}; transform: translate(5px, 5px) rotate(.6deg); /* a flat second pass printed off-register behind a toner block, the highlight word or an art block (multiply on light, screen on dark) */' },
    { name: 'Highlighter swipe', css: 'background: linear-gradient(transparent 14%, {accent} 14% 88%, transparent 88%); /* one text line only; the copy shows it, so it stays flat */' },
    { name: 'Paper scrap + copy shadow', css: 'background: {scrap}; filter: url(#xrx-edge) drop-shadow(1px 2px 0 {ink}); transform: rotate(-.5deg); /* a pasted scrap: lighter paper, toothed cut edge, a 1px toner shadow line like a paste-up shows on a copy */' },
    { name: 'Tape', css: 'background: {tape}; border: 1px solid {tapeEdge}; width: 38px; height: 16px; transform: rotate(-32deg); /* translucent washi tape in secondary across a scrap corner */' },
    { name: 'Toner speckle + edge burn', css: 'background: radial-gradient(ellipse at 50% 50%, transparent 60%, rgba(0,0,0,.30) 100%); mix-blend-mode: multiply; /* plus a feTurbulence field thresholded with feComponentTransfer: sparse black flecks; two faint 1px vertical drum streaks */' },
    { name: 'Copier edge band', css: 'background: {ink}; filter: url(#xrx-rule); /* a black band 12px wide along one or two page edges where the lid did not close */' },
    { name: 'Generation loss', css: 'background: linear-gradient(135deg, {ink}, {canvas}); filter: url(#xrx-g5); /* the same ramp through feTurbulence and a steep threshold: gen 1 smooth, gen 2 grainy, gen 5 blocks and dropouts */' },
  ],

  rules: {
    do: [
      'Set type in one heavy face, uppercase, with threshold-crisp toothed edges; the highlight word sits on a flat primary block that is offset about 1 degree.',
      'Build components like a paste-up: lighter paper scraps, slight rotation (under 1.2 degrees), a 1px toner shadow line and a strip of secondary tape.',
      'Spend color as a second pass: primary overprint behind the highlight word and under the one main action, accent only as a highlighter swipe over one line.',
      'Degrade on purpose: speckle, dropouts, edge burn, a black copier band and two faint drum streaks.',
    ],
    dont: [
      'Use smooth fills, soft shadows or gradients except the one generation-loss sample; copies have only toner and paper.',
      'Set the headline as cut-out ransom letters in mixed faces; one heavy face, copied, is the identity.',
      'Add soft ink grain or two-ink overlap everywhere (that is Riso) or thick hard offset shadows on every box (that is Raw Brutalist).',
      'Round corners or use neon; toner is black, color is only the overprint and the highlighter.',
    ],
  },
});
})();
