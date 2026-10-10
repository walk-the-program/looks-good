/* ---------------------------------------------------------------------
   color-roles.js — the five universal color jobs. Every brand color has
   exactly one role, a "never" rule and a coverage target, so nobody (human
   or AI) uses the secondary color "for whatever it wants".

   An aesthetic may override any field per role through its `roles` map
   (see aestheticByKey in js/aesthetics/registry.js, when present).
------------------------------------------------------------------------ */

const DEFAULT_COLOR_ROLES = {
  canvas: {
    label: 'Canvas',
    job: 'Background',
    use: 'Page and panel backgrounds, same-material controls',
    never: 'Text',
    coverage: '60–70%',
  },
  ink: {
    label: 'Ink',
    job: 'Text & icons',
    use: 'Headlines, body text, icons, hairlines (as a tint)',
    never: 'Large background fields in light mode',
    coverage: '15–20%',
  },
  primary: {
    label: 'Primary',
    job: 'Main action',
    use: 'The one main action per view, selected and active states, the focus ring',
    never: 'Body text, decorative fills, more than one CTA per view',
    coverage: '≈10%',
  },
  secondary: {
    label: 'Secondary',
    job: 'Support',
    use: 'Secondary buttons, tags and chips, a second data series, supporting illustration, selected-row tint',
    never: 'The main CTA, body text, page background',
    coverage: '≈10–15%',
  },
  accent: {
    label: 'Accent',
    job: 'One spark',
    use: 'One highlight per view: a headline word, a "new" badge, the focal point of the art',
    never: 'Buttons, body text, borders, large fills',
    coverage: '≤5%',
  },
};

// Defaults merged per role with the selected aesthetic's overrides.
function colorRolesFor(state) {
  const override = (typeof aestheticByKey === 'function' && state)
    ? (aestheticByKey(state.aesthetic) || {}).roles
    : null;
  const out = {};
  Object.keys(DEFAULT_COLOR_ROLES).forEach(role => {
    out[role] = Object.assign({}, DEFAULT_COLOR_ROLES[role], (override && override[role]) || {});
  });
  return out;
}

// Which role a brand color key plays. Light mode: Light = canvas, Dark = ink.
// Dark mode swaps them.
function colorRoleKeyFor(colorKey, bgMode) {
  const dark = bgMode === 'dark';
  switch (colorKey) {
    case 'primary': return 'primary';
    case 'secondary': return 'secondary';
    case 'accent': return 'accent';
    case 'neutralDark': return dark ? 'canvas' : 'ink';
    case 'neutralLight': return dark ? 'ink' : 'canvas';
    default: return null;
  }
}
