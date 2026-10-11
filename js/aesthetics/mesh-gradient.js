/* 16 Mesh Gradient — fluid, optimistic, precise. Reference: stripe.com's angled
   mesh hero, Ramp and Mercury marketing. A saturated mesh of five overlapping
   radial gradients (primary, secondary, accent, a deepened primary and a
   primary/secondary blend) fills a band across the top of the board, clipped to a
   -6deg diagonal at its lower edge; the nav and headline sit on it in white or ink,
   whichever the computed mesh needs. Below the band everything is opaque and
   crisp: white cards with layered primary-tinted shadows, hairlines, radius 12.
   The hero art is a real product fragment (revenue card, API snippet, payout
   chip) straddling the diagonal. Distinct from Liquid Glass: no glass, no blur on
   surfaces, no translucency. */
registerAesthetic({
  key: 'mesh-gradient', order: 16,
  name: 'Mesh Gradient',
  descriptor: 'Fluid · Optimistic · Precise',
  influences: 'Stripe / Fintech marketing / Gradient mesh',
  summary: 'A saturated mesh gradient over crisp, layered white cards.',
  motto: 'Fluid on top, exact underneath.',
  kicker: 'Gradient, with discipline',
  mode: 'light',
  slideShape: 'refined',
  labels: { material: 'Surfaces', states: ['Rest', 'Hover', 'Pressed'], statesKind: 'button' },
  layout: { hero: 'split', palette: 'swatches', sections: 'two-col' },
  type: { ui: 'sans', label: 'sans', display: 0.92 },
  highlight: 'custom',
  highlightNote: 'The word keeps the mesh text color (white or ink, computed for contrast on the mesh) and carries a thick accent underline swash beneath it; no fill, no color change. When the accent would not hold 3:1 on the mesh the swash falls back to the text color at 55%.',
  cardFill: '--ab-paper',

  roles: {
    canvas: {
      use: 'The page below the mesh band; white cards sit on it and carry the layered shadows',
      never: 'Text, or the fill of a gradient',
    },
    primary: {
      use: 'The one solid pill CTA, switch "on", focus ring, progress bars, the sparkline and the main light of the mesh',
      never: 'Body text, card fills, a second CTA',
    },
    secondary: {
      use: 'The second light of the mesh, the second end of progress bars, status dots and the gradient on section labels',
      never: 'The main CTA, body text, page background',
    },
    accent: {
      use: 'One light in the mesh, the thick swash under the highlighted headline word and the small delta chip',
      never: 'Buttons, body text, borders, card fills',
      coverage: '≤5%',
    },
  },

  tokens(t) {
    const d = t.isDark;
    const sat = (hex, add) => { const h = hexToHsl(hex); return hslToHex(h.h, Math.min(100, h.s + add), h.l); };
    // Mesh lights: the brand colours pushed a little more saturated.
    const p = sat(t.primary, 10), s = sat(t.secondary, 8), a = sat(t.accent, 8);
    // The headline sits over the deep left of the mesh: deep primary under a primary wash.
    // Its colour is chosen for contrast on that zone, then the zone is nudged until it holds >= 5:1.
    const hp = hexToHsl(p);
    const deepAt = l => hslToHex(hp.h, Math.min(100, hp.s + 6), l);
    const zoneOf = dp => t.mix(dp, p, 0.7);
    // light primaries get a dark ink headline over a lightened deep; others get white over a darkened one
    const lightBrand = t.contrast('#ffffff', p) < t.contrast('#101014', p) * 0.9 && hp.l > 62;
    let ink = lightBrand ? '#101014' : '#ffffff';
    let l = lightBrand ? Math.max(78, hp.l) : Math.min(34, hp.l);
    let deep = deepAt(l), zone = zoneOf(deep);
    for (let i = 0; i < 30 && t.contrast(ink, zone) < 7.4; i++) {
      l += lightBrand ? 2 : -2;
      deep = deepAt(Math.max(4, Math.min(96, l)));
      zone = zoneOf(deep);
    }
    // worst case behind the copy: the zone itself, and the primary light bleeding in at 40%
    const dim = t.mix(ink, zone, 0.82);
    const swash = t.contrast(a, zone) >= 3 ? a : t.mix(ink, zone, 0.55);
    // syntax colours for the code tile: brand colours lifted until they read on the dark tile
    const codeBgFinal = d ? t.mix(t.canvas, '#000000', 0.55) : t.mix(t.ink, '#04050b', 0.4);
    const lift = hex => { let c = hex; for (let k = 1; k <= 20 && t.contrast(c, codeBgFinal) < 6; k++) c = t.mix('#ffffff', c, k * 0.05); return c; };
    const paper = d ? t.mix(t.ink, t.canvas, 0.07) : '#ffffff';
    const pa = x => t.alpha(t.primary, x);
    const shadow = d
      ? `0 1px 1px rgba(0,0,0,.4), 0 6px 18px -6px rgba(0,0,0,.5), 0 24px 48px -24px ${pa(0.35)}`
      : `0 1px 1px ${pa(0.06)}, 0 6px 18px -6px ${pa(0.18)}, 0 24px 48px -24px ${pa(0.3)}`;
    return {
      '--ab-m-p': p, '--ab-m-s': s, '--ab-m-a': a,
      '--ab-m-mid': t.mix('#ffffff', p, 0.22),   // a lighter primary (not a primary/secondary blend, which goes grey)
      '--ab-mesh-deep': deep,
      '--ab-mesh-zone': zone,
      '--ab-mesh-ink': ink,
      '--ab-mesh-dim': dim,
      '--ab-mesh-swash': swash,
      '--ab-mesh-glass': t.alpha(ink, 0.14),
      '--ab-mesh-glass-line': t.alpha(ink, 0.3),
      '--ab-paper': paper,
      '--ab-shadow': shadow,
      '--ab-shadow-lift': d
        ? `0 1px 1px rgba(0,0,0,.4), 0 10px 24px -6px rgba(0,0,0,.55), 0 32px 56px -24px ${pa(0.45)}`
        : `0 1px 1px ${pa(0.08)}, 0 10px 24px -6px ${pa(0.26)}, 0 32px 56px -24px ${pa(0.38)}`,
      '--ab-hair': t.alpha(t.ink, d ? 0.14 : 0.09),
      '--ab-fill': t.alpha(t.ink, d ? 0.07 : 0.045),
      '--ab-ring': pa(0.3),
      '--ab-cta-sh': `0 1px 1px ${pa(0.2)}, 0 8px 20px -6px ${pa(0.55)}, inset 0 1px 0 rgba(255,255,255,.28)`,
      '--ab-code-bg': codeBgFinal,
      '--ab-code-ink': t.mix('#ffffff', codeBgFinal, 0.88),
      '--ab-code-dim': t.mix('#ffffff', codeBgFinal, 0.5),
      '--ab-code-k': lift(t.secondary),
      '--ab-code-s': lift(t.accent),
      '--ab-code-n': lift(t.primary),
      '--ab-code-line': 'rgba(255,255,255,.1)',
    };
  },

  // A product fragment, the way Stripe shows the product on its mesh: a revenue
  // card with a sparkline, an API request in a dark mono tile, and a payout chip.
  // Real HTML styled by css/aesthetics/mesh-gradient.css; positions are % of the art box.
  art(ctx) {
    const e = escapeHtml;
    const name = e(ctx.brandName);
    const pts = [38, 34, 40, 30, 33, 24, 28, 18, 21, 12, 15, 6];
    const xs = pts.map((y, i) => `${(i * (200 / (pts.length - 1))).toFixed(1)},${y}`);
    const line = 'M' + xs.join(' L');
    const area = `M0,56 L${xs.join(' L')} L200,56 Z`;
    return `<div class="mga">
      <div class="mga-card mga-rev">
        <div class="mga-row"><span class="mga-lbl">Gross volume</span><span class="mga-chip"><i></i>+12.4%</span></div>
        <div class="mga-num">$48,210<small>.00</small></div>
        <svg class="mga-spark" viewBox="0 0 200 56" preserveAspectRatio="none" focusable="false">
          <path class="mga-area" d="${area}"/><path class="mga-line" d="${line}" vector-effect="non-scaling-stroke"/>
        </svg>
        <div class="mga-axis"><span>Mon</span><span>Wed</span><span>Fri</span><span>Today</span></div>
      </div>
      <div class="mga-card mga-code">
        <div class="mga-dots"><i></i><i></i><i></i><code>POST /v1/charges</code></div>
        <pre><span class="c">{</span>
  <span class="k">"amount"</span>: <span class="n">4200</span>,
  <span class="k">"currency"</span>: <span class="s">"usd"</span>,
  <span class="k">"customer"</span>: <span class="s">"cus_${e(ctx.initial.toLowerCase())}9"</span>
<span class="c">}</span>
<span class="ok">200 OK</span>  <span class="c">·  142 ms</span></pre>
      </div>
      <div class="mga-card mga-pay">
        <span class="mga-av">${e(ctx.initial)}</span>
        <span class="mga-pt"><b>Payout sent</b><em>${name}</em></span>
        <span class="mga-amt">$1,280</span>
      </div>
    </div>`;
  },

  materials: [
    { name: 'Mesh band', css: 'background: radial-gradient(48% 72% at 88% 78%, {mS}, transparent 68%), radial-gradient(36% 58% at 76% 6%, {mA}, transparent 66%), radial-gradient(44% 64% at 48% 34%, {mMid}, transparent 70%), radial-gradient(64% 92% at 8% 12%, {meshDeep}, transparent 72%), radial-gradient(70% 100% at 30% 112%, {mP}, transparent 70%), {meshDeep}; /* five distinct color fields (secondary lower right, accent top right, light primary centre, deep primary left, primary bottom) over a deep base, clipped to a -6deg diagonal at the bottom edge; copy on it is {meshInk} */' },
    { name: 'White card', css: 'background: {paper}; border: 1px solid {hair}; border-radius: 12px; box-shadow: {shadow}; /* layered: 1px contact, 6px 18px mid, 24px 48px ambient, tinted with primary at low alpha */' },
    { name: 'Primary pill', css: 'background: {primary}; color: {onPrimary}; border-radius: 999px; font-weight: 600; box-shadow: {ctaSh}; /* arrow nudges 3px right on hover; pressed: translateY(1px) and a smaller shadow */' },
    { name: 'Selected segment', css: 'background: {paper}; color: {primaryText}; border-radius: 8px; box-shadow: {shadow}; /* track: {fill}, 1px {hair} */' },
    { name: 'Field focus', css: 'background: {paper}; border: 1px solid {primary}; border-radius: 8px; box-shadow: 0 0 0 4px {ring};' },
    { name: 'Code tile', css: 'background: {codeBg}; color: {codeInk}; border-radius: 12px; font: 12px/1.65 ui-monospace, "SF Mono", Menlo, monospace; /* keys {codeK}, strings {codeS}, numbers {codeN} */' },
    { name: 'Section label underline', css: 'width: 28px; height: 2px; background: linear-gradient(90deg, {primary}, {secondary}); /* under every section label */' },
  ],

  rules: {
    do: [
      'Build the mesh from five overlapping radial lights (primary, secondary, accent, a deepened primary and a blend) over a deep base, and cut its lower edge at -6 degrees.',
      'Set the headline and nav on the mesh in white or ink, whichever holds 5:1 on the deep left of the mesh; never in a brand color.',
      'Keep everything below the mesh opaque: white cards, 1px hairline, radius 12, three layered shadows tinted with primary at low alpha.',
      'Show real product detail on the mesh edge (a metric card, an API snippet in mono) so the gradient reads as a product, not a wallpaper.',
    ],
    dont: [
      'Add glass, backdrop blur or translucent panels; that is Liquid Glass.',
      'Run the mesh behind body copy, forms or lists; it belongs to the hero band only.',
      'Use a flat black shadow or a hard offset shadow; depth is three soft layers.',
      'Fill cards or buttons with the mesh, or set text over it in secondary or accent.',
    ],
  },
  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    principles: [
      ['Fluid on top, exact underneath', 'A saturated mesh above crisp white cards.'],
      ['The mesh stays in the hero', 'Never behind body copy, forms or lists.'],
      ['Layered, tinted shadows', 'Opaque cards with a hairline and three soft shadows.'],
    ],
    do: [
      'Keep everything below the mesh opaque.',
      'Set the headline in white or ink on the mesh.',
      'Show real product detail at the mesh edge.',
    ],
    dont: [
      'Add glass or translucent panels.',
      'Run the mesh behind body copy.',
      'Use flat black or hard shadows.',
    ],
  },
});
