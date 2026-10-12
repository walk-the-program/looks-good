// Run with: node tests/run.js   (no dependencies)
// Loads the app's plain-script files into a sandbox and checks the logic that
// silently loses or corrupts data when it breaks: saving/loading a brand and
// reading pasted brand colors.
const vm = require('vm');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const ctx = vm.createContext({ console, AESTHETICS: [{ key: 'soft-form' }, { key: 'raw-brutalist' }] });
for (const f of ['js/data.js', 'js/color.js', 'js/blend.js', 'js/persistence.js', 'js/color-import.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
}
const run = code => vm.runInContext(code, ctx);

let failed = 0;
function check(name, ok, detail) {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${ok ? '' : ' — ' + detail}`);
  if (!ok) failed++;
}

// A fresh editor state, shaped like app.js's.
run(`function freshState() {
  return {
    headingFont: FONTS[0], bodyFont: FONTS[1],
    typography: { headingSize: 44, bodySize: 16, headingWeight: 700, bodyWeight: 400,
                  headingTracking: 0, bodyTracking: 0, headingCase: 'none', bodyCase: 'none' },
    scheme: 'analogous', hue: 210, colors: generatePalette('analogous', 210),
    shapePreset: SHAPE_PRESETS[0], bgMode: 'light', logoDataUrl: null,
    content: { brandName: 'Acme' }, aesthetic: 'soft-form',
    locks: { typography: false, color: false, shape: false, aesthetic: false },
    dismissed: [], patterns: [],
  };
}`);

/* ---- saving and loading a brand ---- */

// The saved copy must not change when the editor changes afterwards.
{
  const r = run(`(() => {
    const s = freshState();
    const saved = serializeState(s);
    const before = JSON.stringify(saved);
    s.content.brandName = 'Edited'; s.typography.headingSize = 80; s.locks.color = true;
    return { before, after: JSON.stringify(saved) };
  })()`);
  check('serialize: later edits do not reach the saved copy', r.before === r.after, 'saved copy changed');
}
{
  const r = run(`(() => {
    const saved = serializeState(freshState());
    const s = freshState();
    applySavedSessionToState(saved, s);
    s.content.brandName = 'Edited'; s.colors.primary = '#000000';
    return saved.content.brandName + ' ' + saved.colors.primary;
  })()`);
  check('apply: editing the loaded brand does not change the saved record', !/Edited|#000000/.test(r), r);
}
// Old or hand-edited files must load with sane values and never throw.
const partials = {
  'unknown scheme': `{ scheme: 'tetradic' }`,
  'partial colors': `{ colors: { primary: '#ff0000' } }`,
  'bad hex colors': `{ colors: { primary: 'red', secondary: '#00ff00', accent: '#0000ff', neutralDark: '#111111', neutralLight: '#eeeeee' } }`,
  'unknown font': `{ headingFontName: 'No Such Font' }`,
  'empty record': `{}`,
};
for (const [name, rec] of Object.entries(partials)) {
  const r = run(`(() => {
    const s = freshState();
    applySavedSessionToState(${rec}, s);
    const keys = ['primary', 'secondary', 'accent', 'neutralDark', 'neutralLight'];
    const colorsOk = keys.every(k => /^#[0-9a-f]{6}$/i.test(s.colors[k]));
    let paletteOk = true;
    try { derivePalette(s.colors.primary, s.scheme); } catch (e) { paletteOk = false; }
    return { colorsOk, paletteOk, font: !!s.headingFont };
  })()`);
  check(`load ${name}: valid palette, scheme and font`, r.colorsOk && r.paletteOk && r.font, JSON.stringify(r));
}

/* ---- blending two aesthetics (js/blend.js) ---- */

{
  const r = run(`(() => {
    const s = freshState();
    s.blend = { with: 'raw-brutalist', strength: 'balanced', channels: { art: true, type: true, color: false, patterns: true, material: false } };
    const saved = serializeState(s);
    const before = JSON.stringify(saved.blend);
    s.blend.channels.color = true; s.blend.with = 'x';
    const t = freshState();
    applySavedSessionToState(JSON.parse(JSON.stringify(saved)), t);
    return { before, after: JSON.stringify(saved.blend), loaded: JSON.stringify(t.blend) };
  })()`);
  check('blend: serialize copies the blend (later edits do not reach the saved copy)', r.before === r.after, r.after);
  check('blend: a saved blend loads back unchanged', r.loaded === r.before, r.loaded);
}
check('blend: brands saved before blends load with null', run(`(() => { const s = freshState(); s.blend = { with: 'raw-brutalist', strength: 'bold' }; applySavedSessionToState({ aestheticKey: 'soft-form' }, s); return s.blend; })()`) === null, 'not null');
check('blend: unblended state serializes blend: null', run(`serializeState(freshState()).blend`) === null, 'not null');
const blendCases = {
  'unknown donor': `{ with: 'no-such-aesthetic', strength: 'bold' }`,
  'donor equals base': `{ with: 'soft-form', strength: 'bold' }`,
  'non-boolean channel': `{ with: 'raw-brutalist', strength: 'custom', channels: { art: 'yes' } }`,
  'channels not an object': `{ with: 'raw-brutalist', channels: [true] }`,
  'no channel on': `{ with: 'raw-brutalist', channels: { art: false } }`,
  'no channels, custom strength': `{ with: 'raw-brutalist', strength: 'custom' }`,
  'a string': `'raw-brutalist'`,
};
for (const [name, rec] of Object.entries(blendCases)) {
  const v = run(`(() => { const s = freshState(); applySavedSessionToState({ aestheticKey: 'soft-form', blend: ${rec} }, s); return s.blend; })()`);
  check(`blend: invalid (${name}) loads as null`, v === null, JSON.stringify(v));
}
{
  const r = run(`JSON.stringify(normalizeBlend({ with: 'raw-brutalist', strength: 'subtle' }, 'soft-form'))`);
  check('blend: a named strength without channels takes its preset', r === JSON.stringify({ with: 'raw-brutalist', strength: 'subtle', channels: { art: true, type: false, color: false, patterns: true, material: false } }), r);
  const c = run(`normalizeBlend({ with: 'raw-brutalist', strength: 'bold', channels: { art: true, material: true } }, 'soft-form').strength`);
  check('blend: strength is re-derived from the channels (custom)', c === 'custom', c);
  const b = run(`normalizeBlend({ with: 'raw-brutalist', strength: 'custom', channels: { art: true, type: true, color: true, patterns: true, material: true } }, 'soft-form').strength`);
  check('blend: channels matching a preset name it', b === 'bold', b);
}
// Kill switch: BLEND_ENABLED = false ignores the blend everywhere but keeps saved blends.
{
  const off = vm.createContext({ console, AESTHETICS: [{ key: 'soft-form', name: 'Soft Form' }, { key: 'raw-brutalist', name: 'Raw' }], aestheticByKey: k => off.AESTHETICS.find(a => a.key === k) || off.AESTHETICS[0] });
  for (const f of ['js/data.js', 'js/color.js', 'js/blend.js', 'js/persistence.js']) {
    let src = fs.readFileSync(path.join(root, f), 'utf8');
    if (f === 'js/blend.js') {
      if (!/const BLEND_ENABLED = true;/.test(src)) check('kill switch constant present', false, 'const BLEND_ENABLED = true; not found');
      src = src.replace('const BLEND_ENABLED = true;', 'const BLEND_ENABLED = false;');
    }
    vm.runInContext(src, off, { filename: f });
  }
  const r = vm.runInContext(`(() => {
    const s = { headingFont: FONTS[0], bodyFont: FONTS[1], typography: {}, scheme: 'analogous', hue: 210, colors: generatePalette('analogous', 210),
      shapePreset: SHAPE_PRESETS[0], bgMode: 'light', logoDataUrl: null, content: {}, aesthetic: 'soft-form', locks: {}, dismissed: [], patterns: [] };
    applySavedSessionToState({ aestheticKey: 'soft-form', blend: { with: 'raw-brutalist', strength: 'bold' } }, s);
    const v = aestheticView(s);
    return { kept: !!s.blend, saved: !!serializeState(s).blend, active: blendActive(s), same: v.def === aestheticByKey('soft-form') && v.state === s };
  })()`, off);
  check('kill switch: saved blend loads and saves untouched', r.kept && r.saved, JSON.stringify(r));
  check('kill switch: blend ignored by the renderers', r.active === null && r.same, JSON.stringify(r));
}

/* ---- pasting brand colors ---- */

const roles = text => run(`(() => {
  const r = assignRoles(extractColors(${JSON.stringify(text)}), {});
  return Object.fromEntries(Object.entries(r.roles).map(([k, v]) => [k, v.hex]));
})()`);
{
  const r = roles('Primary: #E4572E\nSecondary #17BEBB\nAccent: #FFC914\nText #2E282A\nBackground: #F6F5F1');
  check('paste: labels before colors', r.primary === '#e4572e' && r.secondary === '#17bebb' && r.accent === '#ffc914'
    && r.neutralDark === '#2e282a' && r.neutralLight === '#f6f5f1', JSON.stringify(r));
}
{
  const r = roles('#E4572E Primary #29335C Secondary #F3A712 Accent');
  check('paste: labels after colors', r.primary === '#e4572e' && r.secondary === '#29335c' && r.accent === '#f3a712', JSON.stringify(r));
}
{
  const hexes = run(`extractColors('See issue #123 and &#169; 2026, color #fff').map(c => c.hex)`);
  check('paste: issue numbers and HTML entities are not colors', JSON.stringify(hexes) === '["#ffffff"]', JSON.stringify(hexes));
}
check('paste: empty text', run(`extractColors('').length`) === 0, 'found colors in empty text');
{
  const hexes = run(`extractColors('rgb(300, -1, 20)').map(c => c.hex)`);
  check('paste: out-of-range rgb() never makes an invalid hex', hexes.every(h => /^#[0-9a-f]{6}$/.test(h)), JSON.stringify(hexes));
}

console.log(failed ? `\n${failed} failed` : '\nall passed');
process.exit(failed ? 1 : 0);
