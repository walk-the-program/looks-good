/* 16 Mesh Gradient — fluid, optimistic, precise. Reference: stripe.com today (a
   luminous fan of fine striations bleeding off the top right of a white page,
   dark ink headline), Stripe Sessions, Ramp and Mercury. The gradient stays
   luminous and saturated and the type is dark ink on white beside it, never
   white on a darkened mesh. The band is confined to the right and top with a
   sheared left edge and a diagonal lower cut; over it runs a field of 140 fine
   striations in the brand colors. Below, everything is opaque and crisp: white
   cards with neutral navy layered shadows. The hero art is the brand's own
   product fragment (a project card, a type-spec tile, an approval chip)
   straddling the cut. Under the striations lies a soft multi-point mesh of the brand
   colours with a fine grain over it (css hero::before / ::after), and the gradient is carried
   into the product UI (a header glow, a gradient primary action, chart fill and progress
   bars). Distinct from Liquid Glass: no glass, no blur on cards, and the mesh is a band of
   colour behind the work, never behind translucent panels. */
let mgSeq = 0;   // unique SVG ids per rendered board

registerAesthetic({
  key: 'mesh-gradient', order: 16,
  name: 'Mesh Gradient',
  descriptor: 'Fluid · Optimistic · Precise',
  influences: 'Stripe / Fintech marketing / Gradient mesh',
  summary: 'A soft mesh of luminous brand colour with fine striations and grain beside dark ink on white, carried into the product as gradient actions, charts and bars, over crisp, layered white cards.',
  motto: 'Fluid on top, exact underneath.',
  kicker: 'Fluid on top, exact underneath',
  mode: 'light',
  slideShape: 'refined',
  labels: { material: 'Surfaces', states: ['Rest', 'Hover', 'Pressed'], statesKind: 'button' },
  // product-first (Ramp, Stripe): the interface sections follow the hero, the palette and type come after
  layout: { hero: 'split', palette: 'swatches', sections: 'two-col', order: ['hero', 'sections', 'palette', 'type'] },
  type: { ui: 'sans', label: 'sans', display: 1.2 },
  highlight: 'custom',
  highlightNote: 'The word stays ink and carries a thick accent underline swash beneath its lower half; no fill, no color change.',
  cardFill: '--ab-paper',

  roles: {
    canvas: {
      use: 'The page: the headline sits on it in ink beside the band; white cards sit on it and carry the layered shadows',
      never: 'Text, or the fill of a gradient',
    },
    primary: {
      use: 'The one solid pill CTA, switch "on", focus ring, progress bars, the sparkline and the first color of the striations',
      never: 'Body text, card fills, a second CTA',
    },
    secondary: {
      use: 'The last color of the striations, the second end of progress bars and status dots',
      never: 'The main CTA, body text, page background',
    },
    accent: {
      use: 'The middle color of the striations, the thick swash under the highlighted headline word and the small delta chip',
      never: 'Buttons, body text, borders, card fills',
      coverage: '≤5%',
    },
  },

  tokens(t) {
    const d = t.isDark;
    const sat = (hex, add) => { const h = hexToHsl(hex); return hslToHex(h.h, Math.min(100, h.s + add), h.l); };
    // The lights stay luminous: the brand colours pushed a little more saturated, never darkened.
    const p = sat(t.primary, 10), s = sat(t.secondary, 8), a = sat(t.accent, 8);
    // syntax colours for the type-spec tile: brand colours lifted until they read on the dark tile
    const codeBgFinal = d ? t.mix(t.canvas, '#000000', 0.55) : t.mix(t.ink, '#04050b', 0.4);
    const lift = hex => { let c = hex; for (let k = 1; k <= 20 && t.contrast(c, codeBgFinal) < 6; k++) c = t.mix('#ffffff', c, k * 0.05); return c; };
    const paper = d ? t.mix(t.ink, t.canvas, 0.07) : '#ffffff';
    // muted labels sit on paper and on the 4.5-7% ink fills over it (segmented track, list
    // header): pull them toward ink until they hold 4.6:1 on that fill
    const fillBg = t.mix(t.ink, paper, d ? 0.07 : 0.045);
    let muted = t.muted;
    for (let k = 0.05; k <= 1.001 && (t.contrast(muted, fillBg) < 4.6 || t.contrast(muted, t.canvas) < 4.5); k += 0.05) muted = t.mix(t.ink, t.muted, k);
    // Neutral, layered navy shadows (no brand tint in the lighting).
    const shadow = d
      ? '0 1px 1px rgba(0,0,0,.4), 0 13px 27px -5px rgba(0,0,0,.55), 0 8px 16px -8px rgba(0,0,0,.6)'
      : '0 1px 1px rgba(10,37,64,.06), 0 13px 27px -5px rgba(50,50,93,.25), 0 8px 16px -8px rgba(0,0,0,.3)';
    // the second stop of every gradient in the product: the primary turned 28 degrees along the
    // wheel, held at a lightness where the primary's own label still reads at 4.5:1
    const ph = hexToHsl(t.printPrimary || t.primary), onP = t.onPrimary;
    let hue = hslToHex((ph.h + 28) % 360, Math.min(100, ph.s + 6), ph.l);
    for (let k = 1; k <= 30 && t.contrast(onP, hue) < 4.5; k++) {
      const lum = ph.l + (onP === '#ffffff' || onP === '#FFFFFF' ? -k : k);
      hue = hslToHex((ph.h + 28) % 360, Math.min(100, ph.s + 6), Math.max(0, Math.min(100, lum)));
    }
    return {
      '--ab-muted': muted,
      '--ab-m-hue': hue,
      '--ab-m-p': p, '--ab-m-s': s, '--ab-m-a': a,
      '--ab-m-mid': t.mix('#ffffff', p, 0.22),
      // the band's ground: white with a 12% primary tint (a dark tint in dark mode)
      // (t.mix(a, b, k) = k of a over b)
      // The band keeps its light-mode luminosity in dark mode too (a luminous band on a dark
      // page): a dark tint turned the field into a muddy rust slab. No text sits on it; the
      // cards over it are opaque paper and carry their own contrast.
      '--ab-m-base': t.mix(p, '#ffffff', 0.12),
      '--ab-m-blend': 'multiply',
      '--ab-mesh-swash': t.accent,
      '--ab-paper': paper,
      '--ab-shadow': shadow,
      '--ab-shadow-lift': d
        ? '0 1px 1px rgba(0,0,0,.4), 0 30px 60px -12px rgba(0,0,0,.6), 0 18px 36px -18px rgba(0,0,0,.7)'
        : '0 1px 1px rgba(10,37,64,.06), 0 30px 60px -12px rgba(50,50,93,.25), 0 18px 36px -18px rgba(0,0,0,.3)',
      '--ab-hair': t.alpha(t.ink, d ? 0.14 : 0.09),
      '--ab-fill': t.alpha(t.ink, d ? 0.07 : 0.045),
      '--ab-ring': t.alpha(t.primary, 0.3),
      '--ab-cta-sh': d ? '0 1px 1px rgba(0,0,0,.4), 0 6px 14px -4px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.2)'
        : '0 1px 1px rgba(10,37,64,.08), 0 6px 14px -4px rgba(50,50,93,.3), inset 0 1px 0 rgba(255,255,255,.28)',
      '--ab-code-bg': codeBgFinal,
      '--ab-code-ink': t.mix('#ffffff', codeBgFinal, 0.88),
      '--ab-code-dim': t.mix('#ffffff', codeBgFinal, 0.5),
      '--ab-code-k': lift(t.secondary),
      '--ab-code-s': lift(t.accent),
      '--ab-code-n': lift(t.primary),
      '--ab-code-line': 'rgba(255,255,255,.1)',
      '--ab-type-pick-w': 300,
    };
  },

  // A striated field (Stripe's current mechanism) and the brand's own product
  // fragment straddling the cut: a project card with a sparkline, a type-spec
  // tile in mono and an approval chip. Real HTML styled by
  // css/aesthetics/mesh-gradient.css; positions are % of the art box.
  art(ctx) {
    const e = escapeHtml;
    const t = ctx.t;
    const id = 'mgs' + (++mgSeq);
    // 140 fine strokes: path i is y = 30 + 70 sin(0.012x + 0.045i) + 1.25i (the review's
    // 0.9i spacing, opened up so the fan fills the band), i.e. the base curve shifted by
    // (-3.75i, 1.25i - 30), so one path is drawn and reused with <use>.
    const base = [];
    for (let x = -540; x <= 420; x += 10) base.push(`${x} ${(60 + 70 * Math.sin(x * 0.012)).toFixed(1)}`);
    const sat = (hex, add) => { const h = hexToHsl(hex); return hslToHex(h.h, Math.min(100, h.s + add), h.l); };
    const ramp = [sat(t.primary, 10), sat(t.accent, 8), sat(t.secondary, 8), t.mix('#ffffff', sat(t.primary, 10), 0.22)];
    const colorAt = f => { const k = Math.min(2.999, f * 3); const i = Math.floor(k); return t.mix(ramp[i + 1], ramp[i], k - i); };
    let uses = '';
    for (let i = 0; i < 140; i++) uses += `<use href="#${id}p" transform="translate(${(-3.75 * i).toFixed(2)} ${(1.25 * i - 30).toFixed(1)})" stroke="${colorAt(i / 139)}"/>`;
    const field = `<svg class="mga-field" viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" focusable="false" aria-hidden="true"><defs>
        <path id="${id}p" d="M${base.join(' L')}" fill="none" stroke-width="1"/>
        <linearGradient id="${id}f" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".3" stop-color="#fff"/></linearGradient>
        <mask id="${id}m"><rect width="400" height="240" fill="url(#${id}f)"/></mask>
      </defs><g mask="url(#${id}m)" opacity=".9">${uses}</g></svg>`;
    // data from the board's own projects (AB_ROWS) and the brand's heading face
    const row = (typeof AB_ROWS !== 'undefined' && AB_ROWS[0]) || ['Brand refresh', 'In review', 72];
    const hf = (ctx.state && ctx.state.headingFont && ctx.state.headingFont.name) || 'Heading';
    const bf = (ctx.state && ctx.state.bodyFont && ctx.state.bodyFont.name) || 'Body';
    const pts = [38, 34, 40, 30, 33, 24, 28, 18, 21, 12, 15, 6];
    const xs = pts.map((y, i) => `${(i * (200 / (pts.length - 1))).toFixed(1)},${y}`);
    const line = 'M' + xs.join(' L');
    const area = `M0,56 L${xs.join(' L')} L200,56 Z`;
    return `<div class="mga">${field}
      <div class="mga-card mga-rev">
        <div class="mga-row"><span class="mga-lbl">${e(row[0])}</span><span class="mga-chip"><i></i>${e(row[1])}</span></div>
        <div class="mga-num">${row[2]}<small>%</small></div>
        <svg class="mga-spark" viewBox="0 0 200 56" preserveAspectRatio="none" focusable="false">
          <path class="mga-area" d="${area}"/><path class="mga-line" d="${line}" vector-effect="non-scaling-stroke"/>
        </svg>
        <div class="mga-axis"><span>Brief</span><span>Draft</span><span>Review</span><span>Thu</span></div>
      </div>
      <div class="mga-card mga-code">
        <div class="mga-dots"><i></i><i></i><i></i><code>type.spec</code></div>
        <pre><span class="k">H1</span>    <span class="n">300</span><span class="c">/64</span>  <span class="s">${e(hf)}</span>
<span class="k">H2</span>    <span class="n">400</span><span class="c">/32</span>  <span class="s">${e(hf)}</span>
<span class="k">Body</span>  <span class="n">400</span><span class="c">/16</span>  <span class="s">${e(bf)}</span>
<span class="ok">AA</span>    <span class="c">ink on canvas</span></pre>
      </div>
      <div class="mga-card mga-pay">
        <span class="mga-av">${e(ctx.initial)}</span>
        <span class="mga-pt"><b>Approved</b><em>by ${e(ctx.brandName)}</em></span>
        <span class="mga-amt">v3</span>
      </div>
    </div>`;
  },

  // 01: the default card plus a short detail list (owner, due, reviewers) above the action,
  // the way a fintech dashboard card reads; it also fills the card beside the taller 02 panel.
  // 03: the default rows under a real "Recent projects" header.
  panels: {
    card(ctx) {
      const e = ctx.e;
      const meta = `<dl class="mg-meta"><div><dt>Owner</dt><dd>${e(ctx.brandName)}</dd></div>`
        + '<div><dt>Due</dt><dd>Thu</dd></div><div><dt>Reviewers</dt><dd>3</dd></div></dl>';
      return ctx.parts.cardBase().replace('<button type="button" class="ab-cta"', `${meta}\n          <button type="button" class="ab-cta"`);
    },
    list(ctx) {
      return ctx.parts.listBase().replace('<ul class="ab-list">', '<div class="ab-list"><p class="mg-lhead">Recent projects</p><ul class="mg-rows">').replace(/<\/ul>\s*$/, '</ul></div>');
    },
  },

  materials: [
    { name: 'Striated field', css: 'background: {mBase}; /* 140 fine strokes (0.7px, 55% opacity), each path y = 60 + 70 sin(0.012x + 0.045i) + 0.9i, colored along i from {mP} to {mA} to {mS} to {mMid}, multiplied on the light band, fading in from the left; the band sits top right with a -12deg sheared left edge and a diagonal lower cut */' },
    { name: 'Opaque card', css: 'background: {paper}; border: 1px solid {hair}; border-radius: 12px; box-shadow: {shadow}; /* layered neutral navy: 1px contact, 13px 27px mid, 8px 16px close */' },
    { name: 'Primary pill', css: 'background: {primary}; color: {onPrimary}; border-radius: 999px; font-weight: 600; box-shadow: {ctaSh}; /* compact, never full width; the arrow nudges 3px right on hover */' },
    { name: 'Selected segment', css: 'background: {paper}; color: {ink}; border-radius: 8px; box-shadow: inset 0 -2px 0 {primary}, {shadow}; /* ink label, a 2px primary underline; track: {fill}, 1px {hair} */' },
    { name: 'Field focus', css: 'background: {paper}; border: 1px solid {primary}; border-radius: 8px; box-shadow: 0 0 0 4px {ring};' },
    { name: 'Spec tile', css: 'background: {codeBg}; color: {codeInk}; border-radius: 12px; font: 12px/1.65 ui-monospace, "SF Mono", Menlo, monospace; /* labels {codeK}, faces {codeS}, numbers {codeN} */' },
  ],

  rules: {
    do: [
      'Keep the gradient luminous and saturated, and set the headline beside it in dark ink on white.',
      'Build the field from fine striations that follow one direction; detail comes from hundreds of hairlines.',
      'Keep everything below the band opaque: white cards, 1px hairline, radius 12, neutral navy layered shadows.',
      'Show the brand\'s own product on the band edge (a project card, a type spec) so the gradient reads as a product.',
      'Lay a soft mesh of the brand colours under the striations, with 4-6% grain over it, and carry the gradient into the product: a glow behind the page title, a 135deg two-stop primary action, chart fills and progress bars.',
    ],
    dont: [
      'Add glass, backdrop blur or translucent panels; that is Liquid Glass.',
      'Darken the gradient to make white type legible; move the type off it instead.',
      'Put the soft mesh behind cards as a translucent or blurred layer; it is a band behind the work, and cards stay opaque.',
      'Tint shadows with the brand color, or use pill badges for labels.',
    ],
  },
  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    principles: [
      ['Luminous color, ink type', 'The field stays bright; the words sit on white.'],
      ['Soft mesh, fine lines', 'A blended field under hundreds of hairlines, with grain.'],
      ['Exact underneath', 'Opaque cards, a hairline, neutral layered shadows.'],
    ],
    do: [
      'Set the headline in ink beside the field.',
      'Build the field from fine striations.',
      'Show your own product at the band edge.',
    ],
    dont: [
      'Darken the gradient behind white type.',
      'Put blurred colour behind cards.',
      'Tint shadows with the brand color.',
    ],
  },
});
