/* 07 Aurora Noir — precise, nocturnal, charged. A near-black dev-tool surface:
   hairline cards on a faded 48px grid, a quiet aurora of primary + secondary
   at the top, mono detail, and the densest list of the ten. Translucent fills
   are alphas of the ink color, so the same recipe works if the brand is
   switched to light mode. */
/* 07 Aurora Noir — precise, nocturnal, charged. Reference: linear.app, Vercel,
   Raycast. A near-black surface of hairline cards on a faded 48px grid; a solid
   ink headline over a two-tone statement; a product-UI fragment (a dark app
   window) on a very faint aurora; an ink-filled main action with brand primary
   reserved for state (selected, focus, progress, status). Translucent fills are
   alphas of the ink color, so the same recipe works if the brand is switched to
   light mode. */
registerAesthetic({
  key: 'aurora-noir', order: 7,
  name: 'Aurora Noir',
  descriptor: 'Precise · Nocturnal · Charged',
  influences: 'Dev-tool UI / Swiss grid / Aurora light',
  summary: 'A near-black, exact interface with hairline surfaces and a quiet aurora glow.',
  motto: 'Quiet. Exact. Charged.',
  kicker: 'Built for the dark',
  mode: 'dark',
  slideShape: 'minimal',
  labels: { material: 'Surfaces', states: ['Rest', 'Hover', 'Focus'], statesKind: 'button' },
  layout: { hero: 'centered', sections: 'asym' },
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
      use: 'State only: the switch "on", the focus ring, progress bars, the status dot and the first aurora color (mostly seen as glow)',
      never: 'The main action fill, body text, card fills, a second CTA',
      coverage: '≈8–10%',
    },
    secondary: {
      use: 'Ghost-button hover, the second aurora color, the second chart series and the featured-card border',
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
    // The aurora is faint (<= 18% alpha) and sits behind the app window only;
    // it must never push ink text under ~6:1 where it shows.
    const wash = (hex, start) => {
      let a = start;
      while (a > 0.06 && t.contrast(t.ink, t.mix(hex, t.canvas, a)) < 6) a -= 0.02;
      return a;
    };
    const mid = t.mix(t.primary, t.secondary, 0.5);
    const a1 = wash(t.primary, d ? 0.18 : 0.14);
    const a2 = wash(t.secondary, d ? 0.17 : 0.13);
    const a3 = wash(mid, d ? 0.12 : 0.09);
    return {
      '--ab-tr': (typeof state !== 'undefined' && state.headingFont && { condensed: 0, heavy: 0, wide: 0.4, techno: 0.4 }[state.headingFont.cls]) ?? 1,
      
      '--ab-hair': t.alpha(t.ink, d ? 0.09 : 0.1),
      '--ab-hair2': t.alpha(t.ink, d ? 0.14 : 0.16),
      '--ab-fill': t.alpha(t.ink, d ? 0.035 : 0.035),
      '--ab-fill2': t.alpha(t.ink, d ? 0.06 : 0.055),
      '--ab-fill-sel': t.alpha(t.ink, d ? 0.11 : 0.1),
      '--ab-grid': t.alpha(t.ink, d ? 0.035 : 0.06),
      '--ab-top': t.alpha(t.ink, d ? 0.32 : 0.2),
      '--ab-solid': t.mix(t.ink, t.canvas, d ? 0.045 : 0.04),
      '--ab-glow': t.alpha(t.primary, 0.35),
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
    };
  },

  // A product-UI fragment, the way Linear shows the product: a dark app window
  // (sidebar of 4 items, an issue header with a mono ID, 3 property rows) in a
  // 1px hairline frame. Real HTML, styled by css/aesthetics/aurora-noir.css;
  // the faint aurora behind it is drawn by .ab-art::before.
  art(ctx) {
    const e = escapeHtml;
    const name = e(ctx.brandName);
    const nav = ['Inbox', 'My issues', 'Projects', 'Cycles']
      .map((n, i) => `<li${i === 1 ? ' class="on"' : ''}><i></i><span>${n}</span>${i === 0 ? '<em>3</em>' : ''}</li>`).join('');
    return `<div class="ana"><div class="ana-win">
      <aside class="ana-side">
        <div class="ana-ws"><i class="ana-wsmark">${e(ctx.initial)}</i><b>${name}</b></div>
        <ul class="ana-nav">${nav}</ul>
        <div class="ana-grp">Teams</div>
        <ul class="ana-nav ana-nav-sub"><li><i></i><span>Design</span></li><li><i></i><span>Brand</span></li></ul>
      </aside>
      <div class="ana-main">
        <div class="ana-crumb"><span>Brand</span><span class="ana-sep">/</span><code>AN-142</code></div>
        <div class="ana-title">Refresh the brand system</div>
        <div class="ana-desc">Align type, color and surfaces across the product and the site.</div>
        <dl class="ana-props">
          <div><dt>Status</dt><dd><i class="ana-dot"></i>In progress</dd></div>
          <div><dt>Assignee</dt><dd><i class="ana-av">${e(ctx.initial)}</i>${name}</dd></div>
          <div><dt>Progress</dt><dd><span class="ana-bar"><i></i></span><code>72%</code></dd></div>
        </dl>
        <div class="ana-log"><i></i><span>Status changed to <b>In progress</b></span><code>2m</code></div>
        <div class="ana-log"><i></i><span>${name} added <b>Brand refresh</b> to the cycle</span><code>1h</code></div>
        <div class="ana-log"><i></i><span>Issue created</span><code>3d</code></div>
      </div>
    </div></div>`;
  },

  materials: [
    { name: 'Hairline surface', css: 'background: {fill}; border: 1px solid {hair}; border-radius: 14px; /* plus a 1px top highlight: linear-gradient(90deg, transparent, {top}, transparent) */' },
    { name: 'Featured card', css: 'background: linear-gradient({solid}, {solid}) padding-box, linear-gradient(135deg, {primary}, {secondary}) border-box; border: 1px solid transparent; border-radius: 14px;' },
    { name: 'Main action (ink pill)', css: 'background: {ink}; color: {canvas}; border-radius: 999px; font-weight: 600; /* hover: background {inkHover}; primary is never the fill */' },
    { name: 'Selected segment (lifted chip)', css: 'background: {sel}; border: 1px solid {selLine}; color: {ink}; /* neutral lifted chip for the selected segment, ink text; the switch "on", focus ring and progress fills use {primary} */' },
    { name: 'Product window', css: 'background: {solid}; border: 1px solid {hair2}; border-radius: 12px; /* sits on a faint aurora: primary and secondary at 18% alpha or less, 40px blur, behind the window only */' },
    { name: 'Ghost action', css: 'background: transparent; color: {ink}; border: 1px solid {hair2}; border-radius: 8px; /* hover: border-color {secondary} */' },
    { name: 'Field focus', css: 'background: {fill}; border: 1px solid {primary}; border-radius: 8px; box-shadow: 0 0 0 3px {ring};' },
    { name: 'New badge', css: 'color: {accentText}; background: {accTint}; border: 1px solid {accLine}; border-radius: 999px; font: 500 10px ui-monospace, "SF Mono", Menlo, monospace; letter-spacing: .06em; text-transform: uppercase;' },
  ],

  rules: {
    do: [
      'Build every surface from alphas of the ink color (3% fill, 8% hairline); never a second solid background.',
      'Fill the one main action with ink (canvas-colored label); show brand primary only in selected states, the focus ring, progress bars and the status dot.',
      'Keep the aurora faint (18% alpha or less) and behind the product window only; everything else stays flat and sharp.',
      'Set IDs, timestamps and numbers in mono with tabular figures, right-aligned in tables.',
      'Give one card per view the primary-to-secondary gradient border and keep the rest plain hairlines.',
    ],
    dont: [
      'Add drop shadows or blurred panels to cards; depth comes from the 1px top highlight alone.',
      'Fill the main action with primary, set the headline in a gradient, or spread the aurora below the hero or tint it with the accent.',
      'Use accent for anything bigger than a dot, a badge or one headline word.',
      'Round controls past 8px or cards past 14px; this look is exact, not soft.',
    ],
  },
});
