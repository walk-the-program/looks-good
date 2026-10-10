/* 02 Raw Brutalist — exposed, severe, honest. Zero radius, 2px ink borders,
   hard offset shadows, monospace labels, color only where a role says so. */
registerAesthetic({
  key: 'raw-brutalist', order: 2,
  name: 'Raw Brutalist',
  descriptor: 'Exposed · Severe · Honest',
  influences: 'Swiss print / Brutalist web / Terminal',
  summary: 'Hard edges, thick borders and plain mechanics, with nothing hidden or softened.',
  motto: 'Nothing hidden. Nothing soft.',
  kicker: 'Index of hard surfaces',
  mode: 'light',
  slideShape: 'geometric',
  labels: { material: 'Hard surfaces', states: ['Default', 'Hover', 'Pressed'] },

  roles: {
    primary: {
      use: 'The one flat CTA block per view and the "on" state of toggles',
      never: 'Body text, decoration, a second CTA',
    },
    secondary: {
      use: 'Tag strips and the status cells of tables',
      never: 'The main CTA, body text, page background',
    },
    accent: {
      use: 'A highlighter band behind one headline word (background only, ink text on it)',
      never: 'Colored text, buttons, borders, large fills',
    },
  },

  tokens(t) {
    return { '--ab-grid': t.alpha(t.ink, t.isDark ? 0.1 : 0.06) };
  },

  art(ctx) {
    return `<div class="rba">
      <div class="rba-frame"><span class="rba-initial">${escapeHtml(ctx.initial)}</span></div>
      <i class="rba-block"></i>
      <i class="rba-bars"></i>
      <span class="rba-cap">FIG. 01</span>
    </div>`;
  },

  materials: [
    { name: 'Hard surface', css: 'background: {canvas}; border: 2px solid {ink}; border-radius: 0; box-shadow: 6px 6px 0 {ink};' },
    { name: 'Pressed state', css: 'transform: translate(6px, 6px); box-shadow: none;' },
    { name: 'Primary action block', css: 'background: {primary}; color: {onPrimary}; border: 2px solid {ink}; border-radius: 0; box-shadow: 6px 6px 0 {ink}; font: 600 13px ui-monospace, "SF Mono", Menlo, monospace; text-transform: uppercase;' },
    { name: 'Selected segment', css: 'background: {ink}; color: {canvas}; /* joined boxes share 2px {ink} borders */' },
    { name: 'Field', css: 'background: {canvas}; border: 2px solid {ink}; border-radius: 0; font: 15px ui-monospace, "SF Mono", Menlo, monospace; caret-color: {ink};' },
    { name: 'Highlighter band', css: 'background: {accent}; color: {onAccent}; padding: 0 .06em; /* behind one headline word, never colored text */' },
  ],

  rules: {
    do: [
      'Use zero radius and 2px ink borders on every control and panel.',
      'Cast a hard offset shadow (6px 6px 0 ink) for raised things, and remove it entirely when pressed.',
      'Set labels in monospace, uppercase, numbered like [01], with plain arrows.',
      'Keep the page monochrome: color appears only where a color role says so.',
    ],
    dont: [
      'Round any corner, blur any shadow or add a gradient.',
      'Set the accent as text color; it is only ever the highlighter band behind a word.',
      'Soften the headline: it stays huge, uppercase and may be cropped by its box.',
      'Spend primary on anything but the single main action and active states.',
    ],
  },
});
