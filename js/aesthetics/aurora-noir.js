/* 07 Aurora Noir — precise, nocturnal, charged. Reference: Linear (the Method's
   hairline horizon), Raycast's light sculpture, Resend, Vercel. A near-black
   surface of hairline cards on a 48px grid; a solid ink headline over a two-tone
   statement; a product window (the brand's own studio tool, not Linear's) lit by
   an aurora that is a light, not a fog: a sharp beam from above and a bright
   hairline horizon arc beneath the window. An ink-filled main action with brand
   primary reserved for state. Translucent fills are alphas of the ink color, so
   the same recipe works if the brand is switched to light mode. */
let anSeq = 0;   // unique SVG ids per rendered board

registerAesthetic({
  key: 'aurora-noir', order: 7,
  name: 'Aurora Noir',
  descriptor: 'Precise · Nocturnal · Charged',
  influences: 'Dev-tool UI / Swiss grid / Aurora light',
  summary: 'A near-black, exact interface with hairline surfaces, lit by one sharp beam of aurora light.',
  motto: 'Quiet. Exact. Charged.',
  kicker: 'Built for the dark',
  mode: 'dark',
  slideShape: 'minimal',
  labels: { material: 'Surfaces', states: ['Rest', 'Hover', 'Focus'], statesKind: 'button' },
  // the issues table leads the sections, the way a dev tool opens on its list
  layout: { hero: 'centered', sections: 'asym', sectionOrder: ['use', 'ui', 'touch'] },
  type: { ui: 'sans', label: 'mono' },
  highlight: 'ink',
  // The main action is filled with ink (near-white on the dark canvas), the
  // way Linear's is; brand primary is reserved for state.
  ctaFill: 'ink',

  roles: {
    canvas: {
      use: 'The near-black page (lightness capped at 8%) and the base under every translucent surface',
      never: 'Text, or a lighter "card" fill; surfaces are 3% ink alpha, not a second background',
      coverage: '70–80%',
    },
    ink: {
      use: 'Headlines, text, the fill of the one main action (canvas-colored label on it) and hairlines as alphas',
      never: 'Large background fields in light mode',
    },
    primary: {
      use: 'State only: the switch "on", the focus ring, progress bars, the status dot, and the first color of the beam and horizon arc',
      never: 'The main action fill, body text, card fills, a second CTA',
      coverage: '≈8–10%',
    },
    secondary: {
      use: 'Ghost-button hover, the second color of the beam and horizon arc, the second chart series',
      never: 'The main action, body text, page background',
      coverage: '≈8–12%',
    },
    accent: {
      use: 'The "New" badge, the focus-mode status dot and the highlighted headline word (shaded to read as text); header and footer dots stay muted',
      never: 'Buttons, body text, borders, aurora washes',
      coverage: '≤3%',
    },
  },

  // Dark canvases are pushed down to lightness <= 8% (and desaturated a bit):
  // the aurora needs real black to glow against.
  canvas(b) {
    if (!b.isDark) return null;
    const h = b.hexToHsl(b.canvas);
    return h.l > 8 ? b.hslToHex(h.h, Math.min(h.s, 28), 8) : b.canvas;
  },

  tokens(t) {
    const d = t.isDark;
    // The aurora is a light: the beam and the horizon arc run at real strength.
    // No text sits on them (the window is opaque, the headline is above the beam),
    // so there is no contrast loop to dim them.
    const mid = t.mix(t.primary, t.secondary, 0.5);
    const a1 = d ? 0.55 : 0.42, a2 = d ? 0.5 : 0.38, a3 = d ? 0.3 : 0.24;
    return {
      '--ab-hair': t.alpha(t.ink, d ? 0.09 : 0.1),
      '--ab-hair2': t.alpha(t.ink, d ? 0.14 : 0.16),
      '--ab-fill': t.alpha(t.ink, d ? 0.035 : 0.035),
      '--ab-fill2': t.alpha(t.ink, d ? 0.06 : 0.055),
      '--ab-fill-sel': t.alpha(t.ink, d ? 0.11 : 0.1),
      '--ab-grid': t.alpha(t.ink, 0.06),
      '--ab-top': t.alpha(t.ink, d ? 0.32 : 0.2),
      '--ab-solid': t.mix(t.ink, t.canvas, d ? 0.045 : 0.04),
      '--ab-ring': t.alpha(t.primary, 0.4),
      // neutral lifted chip (Linear-style): ink at 9-10%, never primary
      '--ab-sel': t.alpha(t.ink, d ? 0.1 : 0.08),
      '--ab-sel-line': t.alpha(t.ink, d ? 0.16 : 0.14),
      '--ab-ink-hover': t.mix(t.ink, t.canvas, 0.86),
      '--ab-cta-kbd': t.alpha(t.canvas, 0.14),
      '--ab-au1': t.alpha(t.primary, a1.toFixed(2)),
      '--ab-au2': t.alpha(t.secondary, a2.toFixed(2)),
      '--ab-au3': t.alpha(mid, a3.toFixed(2)),
      '--ab-pri-a': t.alpha(t.primary, 0.36),
      '--ab-sec-a': t.alpha(t.secondary, 0.36),
      '--ab-acc-tint': t.alpha(t.accent, 0.15),
      '--ab-acc-line': t.alpha(t.accent, 0.32),
      '--ab-type-pick-w': 600,
    };
  },

  // A product window for the brand's own studio work (briefs, reviews, assets,
  // releases; teams Identity and Web; IDs prefixed from the brand initial) in a
  // 1px hairline frame. Real HTML, styled by css/aesthetics/aurora-noir.css. The
  // light: a beam from above (.ab-art::before) and a hairline horizon arc under
  // the window (the SVG below, primary to white to secondary).
  art(ctx) {
    const e = escapeHtml;
    const name = e(ctx.brandName);
    const id = 'ana' + (++anSeq);
    const pre = (ctx.initial && /[A-Za-z0-9]/.test(ctx.initial) ? ctx.initial.toUpperCase() : 'B') + 'S';
    const t = ctx.t;
    const nav = ['Briefs', 'Reviews', 'Assets', 'Releases']
      .map((n, i) => `<li${i === 1 ? ' class="on"' : ''}><i></i><span>${n}</span>${i === 0 ? '<em>3</em>' : ''}</li>`).join('');
    return `<div class="ana"><div class="ana-win">
      <aside class="ana-side">
        <div class="ana-ws"><i class="ana-wsmark">${e(ctx.initial)}</i><b>${name}</b></div>
        <ul class="ana-nav">${nav}</ul>
        <div class="ana-grp">Teams</div>
        <ul class="ana-nav ana-nav-sub"><li><i></i><span>Identity</span></li><li><i></i><span>Web</span></li></ul>
      </aside>
      <div class="ana-main">
        <div class="ana-crumb"><span>Identity</span><span class="ana-sep">/</span><code>${pre}-142</code></div>
        <div class="ana-title">Refresh the brand system</div>
        <div class="ana-desc">Align type, color and surfaces across the product and the site.</div>
        <dl class="ana-props">
          <div><dt>Status</dt><dd><i class="ana-dot"></i>In progress</dd></div>
          <div><dt>Assignee</dt><dd><i class="ana-av">${e(ctx.initial)}</i>${name}</dd></div>
          <div><dt>Progress</dt><dd><span class="ana-bar"><i></i></span><code>72%</code></dd></div>
        </dl>
        <div class="ana-log"><i></i><span>Status changed to <b>In progress</b></span><code>2m</code></div>
        <div class="ana-log"><i></i><span>${name} added <b>Brand refresh</b> to the review</span><code>1h</code></div>
        <div class="ana-log"><i></i><span>Brief opened</span><code>3d</code></div>
      </div>
    </div>
    <svg class="ana-arc" viewBox="0 0 1000 120" preserveAspectRatio="none" focusable="false" aria-hidden="true"><defs>
      <linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${t.primary}" stop-opacity="0"/><stop offset=".22" stop-color="${t.primary}"/><stop offset=".5" stop-color="#ffffff"/><stop offset=".78" stop-color="${t.secondary}"/><stop offset="1" stop-color="${t.secondary}" stop-opacity="0"/></linearGradient></defs>
      <ellipse cx="500" cy="118" rx="520" ry="96" fill="none" stroke="url(#${id}g)" stroke-width="3" opacity=".35" style="filter:blur(3px)"/>
      <ellipse cx="500" cy="118" rx="520" ry="96" fill="none" stroke="url(#${id}g)" stroke-width="1.2" opacity=".8" vector-effect="non-scaling-stroke"/>
    </svg></div>`;
  },

  // 03: the issues table as real markup: a caption row, brand-prefixed mono IDs
  // (<initial>S-101...) and a footer total computed from the rows.
  panels: {
    list(ctx) {
      const e = ctx.e;
      const pre = (ctx.initial && /[A-Za-z0-9]/.test(ctx.initial) ? ctx.initial.toUpperCase() : 'B') + 'S';
      let i = 0;
      const rows = ctx.parts.listBase().replace(/<ul class="ab-list">|<\/ul>/g, '')
        .replace(/<span class="ab-row-n">\d+<\/span>/g, () => `<span class="ab-row-n">${e(pre)}-${101 + i++}</span>`);
      const avg = ctx.rows.reduce((a, r) => a + r[2], 0) / Math.max(1, ctx.rows.length);
      return `<div class="ab-list"><p class="an-lcap">Issues · ${ctx.rows.length} open · sorted by updated</p>`
        + `<ul class="an-rows">${rows}</ul><p class="an-lfoot">Σ ${avg.toFixed(1)}% avg · updated 2m ago</p></div>`;
    },
  },

  materials: [
    { name: 'Hairline surface', css: 'background: {fill}; border: 1px solid {hair}; border-radius: 14px; /* plus a 1px top highlight: linear-gradient(90deg, transparent, {top}, transparent) */' },
    { name: 'Featured card', css: 'background: linear-gradient(90deg, transparent, {au1}, {au2}, transparent) top / 100% 1px no-repeat, {solid}; border: 1px solid {hair2}; border-radius: 14px; /* the beam colors on the top 1px only */' },
    { name: 'Main action (ink pill)', css: 'background: {ink}; color: {canvas}; border-radius: 999px; font-weight: 600; /* hover: background {inkHover}; primary is never the fill */' },
    { name: 'Selected segment (lifted chip)', css: 'background: {sel}; border: 1px solid {selLine}; color: {ink}; /* neutral lifted chip for the selected segment, ink text; the switch "on", focus ring and progress fills use {primary} */' },
    { name: 'Aurora beam', css: 'background: conic-gradient(from 180deg at 50% -18%, transparent 158deg, {au1} 170deg, rgba(255,255,255,.22) 180deg, {au2} 190deg, transparent 202deg); filter: blur(14px); /* a sharp light from above, plus a 1px horizon arc under the window (primary, white, secondary at 80%) */' },
    { name: 'Product window', css: 'background: {solid}; border: 1px solid {hair2}; border-radius: 12px; box-shadow: inset 0 1px 0 rgba(255,255,255,.14), 0 -1px 0 {au1}; /* opaque; lit along its top edge by the beam */' },
    { name: 'Ghost action', css: 'background: transparent; color: {ink}; border: 1px solid {hair2}; border-radius: 8px; /* hover: border-color {secondary} */' },
    { name: 'Field focus', css: 'background: {fill}; border: 1px solid {primary}; border-radius: 8px; box-shadow: 0 0 0 3px {ring};' },
    { name: 'New badge', css: 'color: {accentText}; background: {accTint}; border: 1px solid {accLine}; border-radius: 999px; font: 500 10px ui-monospace, "SF Mono", Menlo, monospace; letter-spacing: .06em; text-transform: uppercase;' },
  ],

  rules: {
    do: [
      'Build every surface from alphas of the ink color (3% fill, 8% hairline); never a second solid background.',
      'Fill the one main action with ink (canvas-colored label); show brand primary only in selected states, the focus ring, progress bars and the status dot.',
      'Make the aurora a light: one sharp beam from above and a hairline horizon arc, at full strength, behind the opaque window; everything else stays flat and sharp.',
      'Set IDs, timestamps and numbers in mono with tabular figures, right-aligned in tables.',
      'Give one card per view the beam colors along its top edge only; the rest are plain hairlines.',
    ],
    dont: [
      'Add drop shadows or blurred panels to cards; depth comes from the 1px top highlight alone.',
      'Fill the main action with primary, set the headline in a gradient, or turn the aurora into a blurred fog.',
      'Use accent for anything bigger than a dot, a badge or one headline word.',
      'Round controls past 8px or cards past 14px; this look is exact, not soft.',
    ],
  },
  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    principles: [
      ['Quiet, exact, charged', 'Hairline surfaces on a near-black field.'],
      ['Surfaces are alphas of ink', 'A 3% fill and an 8% hairline; no second background.'],
      ['The aurora is a light', 'One sharp beam and a hairline horizon, not a fog.'],
    ],
    do: [
      'Build surfaces from alphas of the ink color.',
      'Fill the main action with ink.',
      'Set numbers in mono with tabular figures.',
    ],
    dont: [
      'Add drop shadows or blurred panels.',
      'Fill the main action with primary.',
      'Round cards past 14px.',
    ],
  },
});
