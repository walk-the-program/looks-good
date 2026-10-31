// Run with: node tests/run.js   (no dependencies)
// Loads the app's plain-script files into a sandbox and checks the logic that
// silently loses or corrupts data when it breaks: saving/loading a brand and
// reading pasted brand colors.
const vm = require('vm');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const ctx = vm.createContext({ console, AESTHETICS: [{ key: 'soft-form' }, { key: 'raw-brutalist' }] });
for (const f of ['js/data.js', 'js/color.js', 'js/blend.js', 'js/persistence.js', 'js/product-sheet.js', 'js/color-import.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
}
const run = code => vm.runInContext(code, ctx);

let failed = 0;
const pendingChecks = [];
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
    bgMode: 'light', logoDataUrl: null,
    content: { brandName: 'Acme' }, aesthetic: 'soft-form',
    locks: { typography: false, color: false, aesthetic: false },
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

// Brands saved while the editor still had Shape presets carry shapePresetKey and locks.shape:
// they load (both ignored), and new saves no longer write either.
{
  const r = run(`(() => {
    const s = freshState();
    applySavedSessionToState({ headingFontName: FONTS[2].name, shapePresetKey: 'geometric', locks: { typography: true, color: false, shape: true, aesthetic: false } }, s);
    const out = serializeState(s);
    return { font: s.headingFont.name === FONTS[2].name, lockT: s.locks.typography === true, noShapeLock: !('shape' in s.locks),
      noPreset: !('shapePreset' in s) && !('shapePresetKey' in out), outLocks: Object.keys(out.locks).join() };
  })()`);
  check('load: an old brand with shapePresetKey and locks.shape still loads, fields ignored', r.font && r.lockT && r.noShapeLock && r.noPreset, JSON.stringify(r));
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
  const off = vm.createContext({ console });
  vm.runInContext(fs.readFileSync(path.join(root, 'js/aesthetics/registry.js'), 'utf8')
    + `\nregisterAesthetic({ key: 'soft-form', name: 'Soft Form', order: 1 }); registerAesthetic({ key: 'raw-brutalist', name: 'Raw', order: 2 });`, off, { filename: 'js/aesthetics/registry.js' });
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
      bgMode: 'light', logoDataUrl: null, content: {}, aesthetic: 'soft-form', locks: {}, dismissed: [], patterns: [] };
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

/* ---- pattern colourways (js/patterns/engine.js) ---- */

{
  const w = { performance: { now: () => 0 } };
  const pc = vm.createContext({ window: w, console });
  vm.runInContext(fs.readFileSync(path.join(root, 'js/patterns/engine.js'), 'utf8'), pc, { filename: 'engine.js' });
  const P = w.Patterns;
  const light = { canvas: '#F6F5F1', ink: '#2E282A', primary: '#E4572E', secondary: '#17BEBB', accent: '#FFC914' };
  const dark = Object.assign({}, light, { canvas: '#2E282A', ink: '#F6F5F1' });
  const brandHexes = Object.values(light).map(h => h.toLowerCase());
  const b = P.inksFor(light, 'brand');
  check('colourways: brand still maps the roles', b.ground === light.canvas && b.ink1 === light.primary && b.ink2 === light.secondary
    && b.spark === light.accent && b.deep === light.ink && !('fixed' in b), JSON.stringify(b));
  const s1 = P.inksFor(light, 'spectrum'), s2 = P.inksFor(dark, 'spectrum');
  check('colourways: spectrum is fixed and never a brand role',
    s1.ink1 === '#e46bb4' && s1.ink2 === '#4fb3e6' && s1.deep === '#8f6bef' && s1.spark === '#ecb23e' && s1.ground === light.canvas
    && s2.ink1 === '#ff8fd0' && s2.spark === '#ffd978' && s1.fixed === true
    && ![s1.ink1, s1.ink2, s1.deep, s1.spark, s1.t1].some(h => brandHexes.includes(h.toLowerCase())), JSON.stringify([s1, s2]));
  const t1 = P.inksFor(light, 'tonal'), t2 = P.inksFor(dark, 'tonal');
  const E = P.E;
  check('colourways: tonal is the canvas shaded 4/8/14% with the primary spark',
    t1.ink1 === E.mix('#000000', light.canvas, 0.08) && t1.ink2 === E.mix('#000000', light.canvas, 0.04) && t1.deep === E.mix('#000000', light.canvas, 0.14)
    && t2.ink1 === E.mix('#ffffff', dark.canvas, 0.08) && t1.spark === light.primary, JSON.stringify([t1, t2]));
  const tt = P.inksFor(light, 'broadcast', { tints: true });
  const teletext = ['#000000', '#ff0000', '#00ff00', '#ffff00', '#0000ff', '#ff00ff', '#00ffff', '#ffffff'];
  check('colourways: broadcast uses only the eight teletext colours',
    [tt.ground, tt.ink1, tt.ink2, tt.deep, tt.spark, tt.t1, tt.t2, tt.mute].every(h => teletext.includes(h))
    && new Set([tt.ground, tt.ink1, tt.ink2, tt.deep, tt.spark, tt.t1, tt.t2, tt.mute]).size === 8, JSON.stringify(tt));
  const pr = P.inksFor(dark, 'primaries'), ea = P.inksFor(light, 'earth');
  check('colourways: primaries fixes its ground; earth keeps the canvas and one brand band',
    pr.ground === '#f1ece2' && pr.ink1 === '#d7332a' && ea.ground === light.canvas && ea.ink1 === light.primary && ea.deep === '#6e3421', JSON.stringify([pr, ea]));
  check('colourways: every listed colourway resolves, same input same inks',
    E.COLORWAYS.every(c => JSON.stringify(P.inksFor(light, c.value, { tints: true })) === JSON.stringify(P.inksFor(Object.assign({}, light), c.value, { tints: true }))),
    'nondeterministic');
}

/* ---- pattern contrast floor (js/patterns/engine.js finalInks) ---- */

{
  const w = { performance: { now: () => 0 } };
  const pc = vm.createContext({ window: w, console });
  for (const f of ['js/patterns/engine.js'].concat(fs.readdirSync(path.join(root, 'js/patterns/families')).filter(f => f.endsWith('.js')).sort().map(f => 'js/patterns/families/' + f))) {
    vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), pc, { filename: f });
  }
  const P = w.Patterns, E = P.E;
  const fin = (tok, cw, params) => P.finalInks('halftone', params || {}, P.inksFor(tok, cw));
  const best = i => Math.max(E.contrast(i.ink1, i.ground), E.contrast(i.ink2, i.ground));
  const pastel = { canvas: '#FCFAF6', ink: '#34394A', primary: '#CFE3F5', secondary: '#F6D7E4', accent: '#FBEEC1' };
  const warm = { canvas: '#F6F5F1', ink: '#2E282A', primary: '#E4572E', secondary: '#17BEBB', accent: '#FFC914' };
  check('contrast floor: a pastel palette never gets drawing inks under 1.6:1 (brand, duotone, mono)',
    ['brand', 'duotone', 'mono'].every(cw => best(fin(pastel, cw)) >= 1.59), JSON.stringify(fin(pastel, 'brand')));
  const raw = P.inksFor(warm, 'brand'), f = fin(warm, 'brand');
  check('contrast floor: a palette that already clears it is returned untouched (byte-identical)',
    f.ink1 === raw.ink1 && f.ink2 === raw.ink2 && f.deep === raw.deep && JSON.stringify(f.pool) === JSON.stringify(raw.pool), JSON.stringify([f, raw]));
  check('contrast floor: fixed colourways are not touched', fin(pastel, 'broadcast').ink1 === P.inksFor(pastel, 'broadcast').ink1, 'fixed');
  check('contrast floor: tone-on-tone and an explicit very low Strength stay quiet',
    best(fin(pastel, 'tonal')) < 1.5 && best(fin(pastel, 'brand', { tone: 0.05 })) < 1.2, 'quiet');
}

/* ---- export and escaping helpers ---- */

{
  const src = fs.readFileSync(path.join(root, 'js/brand-deck.js'), 'utf8');
  const ec = vm.createContext({ console });
  vm.runInContext(src.match(/function bdCalcPx[\s\S]*?\n}\n\nfunction bdPx[\s\S]*?\n}\n/)[0], ec);
  const px = (t, box, img, pos) => vm.runInContext(`bdPx(${JSON.stringify(t)}, ${box}, ${img}, ${!!pos})`, ec);
  check('export: calc() in background-size / -position resolves to px (any px, % and + - * / expression)',
    px('calc(25% - 3px)', 200, 40, true) === 37 && Math.round(px('calc(100% / 6)', 600, 0, false)) === 100 && px('calc(12px * 2)', 50, 10, false) === 24
    && px('calc(100% - 1px)', 50, 10, true) === 39, 'bdPx');
  check('export: a calc() that is not plain arithmetic is ignored, not evaluated', px('calc(alert(1))', 50, 10, false) === 50, 'bdPx guard');
  const ac = vm.createContext({ console });
  vm.runInContext(fs.readFileSync(path.join(root, 'js/app.js'), 'utf8').match(/function escapeHtml[\s\S]*?\n}\n/)[0], ac);
  check('escapeHtml: null and undefined become empty text, markup is escaped',
    vm.runInContext(`[escapeHtml(null), escapeHtml(undefined), escapeHtml('a"<b>&\\'')].join('|')`, ac) === "||a&quot;&lt;b&gt;&amp;&#39;", 'escapeHtml');
}

/* ---- board layout contract (js/aesthetic-board.js) ---- */

{
  const bc = vm.createContext({ console, document: { addEventListener() {}, body: null } });
  vm.runInContext(fs.readFileSync(path.join(root, 'js/aesthetic-board.js'), 'utf8'), bc, { filename: 'aesthetic-board.js' });
  const lay = d => vm.runInContext(`abLayoutOf(${JSON.stringify(d)})`, bc);
  const d0 = lay({});
  check('layout: defaults keep the board order', JSON.stringify(d0.order) === '["hero","palette","type","sections"]'
    && JSON.stringify(d0.sectionOrder) === '["ui","touch","use"]' && d0.hero === 'split' && d0.palette === 'swatches', JSON.stringify(d0));
  const d1 = lay({ layout: { order: ['palette', 'bogus', 'hero', 'palette'], sectionOrder: ['use'], hero: 'bleed', palette: 'list' } });
  check('layout: order is a permutation (unknown and repeats dropped, missing appended)',
    JSON.stringify(d1.order) === '["palette","hero","type","sections"]' && JSON.stringify(d1.sectionOrder) === '["use","ui","touch"]'
    && d1.hero === 'bleed' && d1.palette === 'list', JSON.stringify(d1));
  check('layout: unknown hero / palette fall back (including the removed art-first, type, stack, dots)',
    lay({ layout: { hero: 'diagonal', palette: 'rainbow' } }).hero === 'split'
    && lay({ layout: { palette: 'rainbow' } }).palette === 'swatches'
    && ['art-first', 'type'].every(h => lay({ layout: { hero: h } }).hero === 'split')
    && ['stack', 'dots'].every(p => lay({ layout: { palette: p } }).palette === 'swatches'), 'no fallback');
}

/* ---- font weights (js/aesthetic-board.js: abWeights / abWeight / abWeightNear) ---- */

{
  const bc = vm.createContext({ console, document: { addEventListener() {}, body: null } });
  vm.runInContext(fs.readFileSync(path.join(root, 'js/aesthetic-board.js'), 'utf8'), bc, { filename: 'aesthetic-board.js' });
  const w = (fn, face, n) => vm.runInContext(`${fn}(${JSON.stringify(face)}, ${n})`, bc);
  const two = { weights: '700;400' }, one = { weights: '400' }, many = { weights: '300;400;600;800' };
  check('weights: abWeights sorts and defaults to 400', JSON.stringify(vm.runInContext('abWeights({ weights: "700;400" })', bc)) === '[400,700]'
    && JSON.stringify(vm.runInContext('abWeights(null)', bc)) === '[400]', 'abWeights');
  check('weights: abWeight is the heaviest at or under the cap, else the lightest',
    w('abWeight', two, 800) === 700 && w('abWeight', two, 600) === 400 && w('abWeight', one, 900) === 400 && w('abWeight', { weights: '600;800' }, 400) === 600, 'abWeight');
  check('weights: abWeightNear is the exact weight, else the next one up within 100, else the next down',
    w('abWeightNear', many, 600) === 600 && w('abWeightNear', many, 700) === 800 && w('abWeightNear', many, 500) === 600
    && w('abWeightNear', many, 900) === 800 && w('abWeightNear', two, 500) === 400 && w('abWeightNear', one, 800) === 400, 'abWeightNear');
}

/* ---- hook fallbacks (js/aesthetic-board.js abRun / abHookHtml / abTokens, js/brand-deck.js) ---- */

{
  const warns = [];
  const hc = vm.createContext({
    console: { log: console.log, warn: (...a) => warns.push(a.join(' ')), error: console.error },
    document: { getElementById: () => null, addEventListener() {}, createElement: () => ({}) }, window: {},
  });
  for (const f of ['js/data.js', 'js/color.js', 'js/brand-deck.js', 'js/aesthetic-board.js']) {
    vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), hc, { filename: f });
  }
  const H = code => vm.runInContext(code, hc);
  H('var def = { key: "t1" }');
  check('hooks: a throwing HTML hook gives \'\'', H('abHookHtml(def, () => { throw new Error("x") }, {}, "art")') === '', 'throw');
  check('hooks: a non-string result gives \'\'', H('abHookHtml(def, () => 42, {})') === '' && H('abHookHtml(def, null, {})') === '', 'non-string');
  check('hooks: a failing hook warns once per aesthetic and hook, not on every render',
    (() => { for (let i = 0; i < 5; i++) H('abHookHtml(def, () => { throw 1 }, {}, "art")'); return warns.filter(w => /hook art \(t1\)/.test(w)).length === 1; })(), JSON.stringify(warns));
  check('hooks: tokens() that throws or returns a non-object gives {}',
    H('JSON.stringify(abTokens({ key: "t2", tokens() { throw 1 } }, {}, {}))') === '{}'
    && H('JSON.stringify(abTokens({ key: "t3", tokens() { return "x" } }, {}, {}))') === '{}'
    && H('abTokens({ key: "t4", tokens(t, st) { return { "--a": st.v } } }, {}, { v: 7 })["--a"]') === 7, 'tokens');
  const tk = H(`(() => {
    const st = { colors: { primary: '#2f5bd8', secondary: '#8fb3e8', accent: '#f2a33a', neutralDark: '#14171f', neutralLight: '#f7f8fb' }, bgMode: 'light' };
    const bad = { key: 't5', canvas() { throw 1 }, printPrimary() { throw 1 } };
    const t = boardTokens(st, bad);
    const seen = [];
    boardTokens(st, { key: 't6', canvas(b, s) { seen.push(s === st); return null; }, printPrimary(t, s) { seen.push(s === st); return null; } });
    return { canvas: t.canvas, printed: t.printed, seen: seen.join() };
  })()`);
  check('hooks: canvas() / printPrimary() that throw leave the plain tokens', tk.canvas === '#f7f8fb' && tk.printed === false, JSON.stringify(tk));
  check('hooks: canvas(base, state) and printPrimary(t, state) receive the render state', tk.seen === 'true,true', tk.seen);
  check('hooks: a throwing deck hook gives \'\'', H(`bdCallHook({ key: 'x', deck: { product() { throw 1 } } }, 'product', {})`) === '', 'bdCallHook');
  check('hooks: bdCallHook takes the first function among its names', H(`bdCallHook({ key: 'y', deck: { productStage() { return 'ok' } } }, ['product', 'productStage'], {})`) === 'ok', 'names');
  check('hooks: a throwing deck.marks falls back to the number',
    H(`JSON.stringify(bdMark({ key: 'z', deck: { marks() { throw 1 } } }, {}, 'do', 0))`) === '{"html":"01","own":false}', 'bdMark');
  check('hooks: ctx.labels is the three names and carries material / states / names',
    H(`(() => { const l = abLabelsCtx({ material: 'M', states: ['a', 'b', 'c'], statesKind: 'chip' }); return [l[1], l.map(x => x).join(''), l.material, l.states.length, l.names[2], l.statesKind].join('|'); })()`) === 'b|abc|M|3|c|chip', 'labels');
}

/* ---- bdTextSpills (js/brand-deck.js): a split word, a word past the box, a clean line ---- */

{
  const mk = (words) => {
    const node = { nodeValue: Object.keys(words).join(' ') };
    const el = { getBoundingClientRect: () => ({ left: 0, right: 100, top: 0, bottom: 40, width: 100, height: 40 }) };
    const sc = vm.createContext({
      console, NodeFilter: { SHOW_TEXT: 4 },
      document: {
        getElementById: () => null, addEventListener() {}, createElement: () => ({}),
        createTreeWalker: () => { let i = 0; return { nextNode: () => (i++ ? null : node) }; },
        createRange: () => { const r = { setStart(n, o) { r.o = o; }, setEnd(n, o) { r.e = o; }, getClientRects: () => words[node.nodeValue.slice(r.o, r.e)] }; return r; },
      },
      window: {},
    });
    for (const f of ['js/data.js', 'js/color.js', 'js/brand-deck.js']) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), sc, { filename: f });
    sc.__el = el;
    return () => vm.runInContext('bdTextSpills(__el)', sc) + '/' + vm.runInContext('bdTextSpills(__el, null, true)', sc);
  };
  const r = (l, t, w) => ({ left: l, right: l + w, top: t, bottom: t + 12, width: w, height: 12 });
  check('bdTextSpills: a word split across two lines is a spill', mk({ hello: [r(0, 0, 30), r(0, 14, 20)], world: [r(40, 0, 30)] })() === 'true/true', 'split');
  check('bdTextSpills: one line inside the box is clean', mk({ hello: [r(0, 0, 30)], world: [r(40, 0, 30)] })() === 'false/false', 'inside');
  check('bdTextSpills: a word past the box is a spill, but not with brokenOnly', mk({ hello: [r(0, 0, 30)], world: [r(80, 0, 40)] })() === 'true/false', 'past');
}

/* ---- blend: suite, rules (js/blend.js) ---- */

{
  const w = { performance: { now: () => 0 } };
  const bc = vm.createContext({ window: w, console });
  const famDir = path.join(root, 'js/patterns/families');
  const files = ['js/data.js', 'js/color.js', 'js/patterns/engine.js']
    .concat(fs.readdirSync(famDir).filter(f => f.endsWith('.js')).sort().map(f => 'js/patterns/families/' + f), ['js/patterns/fit.js']);
  for (const f of files) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), bc, { filename: f });
  bc.Patterns = w.Patterns;
  vm.runInContext(fs.readFileSync(path.join(root, 'js/blend.js'), 'utf8'), bc, { filename: 'blend.js' });
  const keys = w.Patterns.suiteKeys();
  const all = { art: true, type: true, color: true, patterns: true, material: true };
  let bad = null, n = 0;
  for (const a of keys) for (const b of keys) {
    if (a === b) continue;
    n++;
    for (const strength of ['bold', 'balanced']) {
      bc.__def = { key: a, blend: { base: { key: a }, donor: { key: b }, strength, channels: all } };
      const out = vm.runInContext('blendSuite(__def)', bc).map(s => s.key);
      const donorLead = w.Patterns.suiteFor(b)[0].key;
      if (out.length > 6 || new Set(out).size !== out.length || (strength === 'bold' && out[0] !== donorLead)) { bad = bad || `${a} x ${b} ${strength}: ${out.join()}`; }
    }
  }
  check(`blendSuite: every base x donor pair (${n}) has at most 6 entries, no family twice, the donor first when bold`, !bad, bad);
  bc.__def = { key: 'a', blend: { base: { key: 'a' }, donor: { key: 'b' }, strength: 'subtle', channels: Object.assign({}, all, { patterns: false }) } };
  check('blendSuite: without the patterns channel it is the base suite',
    JSON.stringify(vm.runInContext('blendSuite(__def)', bc)) === JSON.stringify(w.Patterns.suiteFor('a')), 'not base suite');

  const rules = (granted) => vm.runInContext(`(() => {
    const base = { name: 'Base', rules: { do: [], dont: ['No gradients anywhere'] } };
    const donor = { name: 'Donor', rules: { do: ['Use gradients on every surface'], dont: [] } };
    const r = blendRules(base, donor, ${JSON.stringify(granted)});
    return { dont: r.rules.dont, do: r.rules.do, conflicts: r.conflicts.map(c => c.owner + ':' + c.topic), baseDropped: r.baseDropped };
  })()`, bc);
  const g1 = rules({ color: true });
  check('blendRules: a donor that owns color wins the gradients conflict (base rule dropped, owner donor)',
    g1.dont.length === 0 && g1.do.length === 1 && g1.conflicts.join() === 'donor:gradients' && g1.baseDropped === 1, JSON.stringify(g1));
  const g2 = rules({ art: true });
  check('blendRules: without the color channel the donor rule is dropped and the base keeps its own',
    g2.dont.length === 1 && g2.do.length === 0 && g2.conflicts.length === 0, JSON.stringify(g2));
}

/* ---- font names in js/aesthetic-meta.js exist in FONTS ---- */

{
  const mc = vm.createContext({ console });
  for (const f of ['js/data.js', 'js/color.js', 'js/aesthetic-meta.js']) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), mc, { filename: f });
  const missing = vm.runInContext(`(() => {
    const names = new Set(FONTS.map(f => f.name));
    const out = [];
    Object.keys(AESTHETIC_META).forEach(k => {
      const f = AESTHETIC_META[k].fonts || {};
      ['heading', 'body', 'mono'].forEach(r => ((f[r] && f[r].picks) || []).forEach(n => { if (!names.has(n)) out.push(k + '.' + r + ': ' + n); }));
      (f.pairings || []).forEach(p => p.forEach(n => { if (!names.has(n)) out.push(k + '.pairing: ' + n); }));
    });
    return out;
  })()`, mc);
  check('meta: every font named in aesthetic-meta.js exists in FONTS (a typo silently disables Use recommended fonts and the blend type channel)', missing.length === 0, missing.join('; '));
}

/* ---- undo carries the blend (js/brand-session.js wrappers over js/undo-history.js) ---- */

{
  const uc = vm.createContext({ console });
  uc.window = uc;
  for (const f of ['js/data.js', 'js/color.js', 'js/blend.js', 'js/undo-history.js']) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), uc, { filename: f });
  const src = fs.readFileSync(path.join(root, 'js/brand-session.js'), 'utf8');
  const a = src.indexOf('const pushBase = window.pushUndoSnapshot;');
  const b = src.indexOf("undoBtn.addEventListener('click'");
  check('undo: the brand-session wrappers are where the test expects them', a > 0 && b > a, 'markers moved');
  vm.runInContext(`(function () { ${src.slice(a, b)} })();`, uc);
  const r = vm.runInContext(`(() => {
    const st = { headingFont: FONTS[0], bodyFont: FONTS[1], scheme: 'analogous', hue: 210, colors: generatePalette('analogous', 210),
      typography: {}, aesthetic: 'soft-form', bgMode: 'light', patterns: [], blend: { with: 'raw-brutalist', strength: 'bold', channels: { art: true, type: true, color: true, patterns: true, material: true } } };
    pushUndoSnapshot(st);                                  // with a blend
    st.blend.channels.art = false; st.blend.with = 'clay';
    applyUndoSnapshot(popUndoSnapshot(), st);
    const back = JSON.stringify(st.blend);
    st.blend = null; pushUndoSnapshot(st);                 // without one
    st.blend = { with: 'raw-brutalist', strength: 'subtle', channels: { art: true } };
    applyUndoSnapshot(popUndoSnapshot(), st);
    return { back, none: st.blend };
  })()`, uc);
  check('undo: Undo brings the blend back, and null for a snapshot taken without one',
    r.back === JSON.stringify({ with: 'raw-brutalist', strength: 'bold', channels: { art: true, type: true, color: true, patterns: true, material: true } }) && r.none === null, JSON.stringify(r));
}
// Pattern colourways: the fixed ones carry their documented hexes, toner is the ink alone, the spectrum
// carries its ten blendable stops, and a stop blend is a pure function (same input, same colour).
{
  const pc = vm.createContext({ window: { performance: { now: () => 0 } }, console });
  vm.runInContext(fs.readFileSync(path.join(root, 'js/patterns/engine.js'), 'utf8'), pc, { filename: 'engine.js' });
  const P = pc.window.Patterns;
  const light = { canvas: '#f6f5f1', ink: '#2e282a', primary: '#e4572e', secondary: '#17bebb', accent: '#ffc914' };
  const dark = { canvas: '#2e282a', ink: '#f6f5f1', primary: '#e4572e', secondary: '#17bebb', accent: '#ffc914' };
  const hd = P.inksFor(dark, 'hud'), hl = P.inksFor(light, 'hud');
  check('colourway hud: fixed dark and light hexes',
    hd.fixed && hd.ground === '#05070a' && hd.ink1 === '#00f0ff' && hd.ink2 === '#0a6f7a' && hd.deep === '#5ff6ff' && hd.spark === '#ff2a6d'
    && hl.ground === '#e9ecef' && hl.ink1 === '#007c86' && hl.ink2 === '#7fb6bb' && hl.deep === '#0b0d10' && hl.spark === '#c4124d', JSON.stringify([hd, hl]));
  const tn = P.inksFor(light, 'toner');
  check('colourway toner: one ink on the canvas, no tints',
    tn.fixed && tn.ground === light.canvas && ['ink1', 'ink2', 'spark', 'deep', 't1', 't2', 'mute'].every(k => tn[k] === light.ink), JSON.stringify(tn));
  const sp = P.inksFor(light, 'spectrum');
  const a = P.E.spectrumAt(sp, 0.37), b = P.E.spectrumAt(sp, 0.37);
  check('colourway spectrum: ten stops, a cool spark stop, deterministic blend',
    sp.stops.length === 10 && sp.sparkStops.indexOf(P.E.sparkInk(sp, 0)) === 0 && JSON.stringify(a) === JSON.stringify(b)
    && !P.inksFor(light, 'brand').stops && P.E.sparkInk(P.inksFor(light, 'brand'), 3) === light.accent, JSON.stringify(sp.stops));
  check('colourways listed once each', ['hud', 'toner'].every(v => P.E.COLORWAYS.filter(c => c.value === v && c.fixed).length === 1), '');
}

/* ---- the pure white / black ground (pureBg) ---- */

// pureBg survives a save and reload; a brand that never had the flag comes back off.
{
  const r = run(`(() => {
    const s = freshState(); s.pureBg = true;
    const saved = JSON.parse(JSON.stringify(serializeState(s)));
    const t = freshState();
    applySavedSessionToState(saved, t);
    const off = freshState();
    applySavedSessionToState(JSON.parse(JSON.stringify(serializeState(freshState()))), off);
    return [saved.pureBg, t.pureBg, off.pureBg];
  })()`);
  check('pureBg: serialize/apply round-trip, and off by default', r.join() === 'true,true,false', JSON.stringify(r));
}
// Brands saved before pureBg existed have no field and must load with it off.
{
  const r = run(`(() => { const s = freshState(); s.pureBg = true; applySavedSessionToState({ aestheticKey: 'soft-form', bgMode: 'light' }, s); return s.pureBg; })()`);
  check('pureBg: an old brand without the field loads off', r === false, String(r));
}

/* ---- Classic | Current (aestheticVersion) ---- */

// serialize/apply: default current, classic survives a save and reload, anything else loads current.
{
  const r = run(`(() => {
    const d = freshState();                                     // no aestheticVersion at all
    const s = freshState(); s.aestheticVersion = 'classic';
    const saved = JSON.parse(JSON.stringify(serializeState(s)));
    const t = freshState(); t.aestheticVersion = 'current';
    applySavedSessionToState(saved, t);
    const junk = freshState(); junk.aestheticVersion = 'classic';
    applySavedSessionToState({ aestheticKey: 'soft-form', bgMode: 'light', aestheticVersion: 'ancient' }, junk);
    const old = freshState(); old.aestheticVersion = 'classic';
    applySavedSessionToState({ aestheticKey: 'soft-form', bgMode: 'light' }, old);
    const obj = freshState(); obj.aestheticVersion = 'classic';
    applySavedSessionToState({ aestheticKey: 'soft-form', bgMode: 'light', aestheticVersion: { classic: true } }, obj);
    return [serializeState(d).aestheticVersion, saved.aestheticVersion, t.aestheticVersion, junk.aestheticVersion, old.aestheticVersion, obj.aestheticVersion];
  })()`);
  check('aestheticVersion: default current; classic round-trips; invalid and missing load current',
    r.join() === 'current,classic,classic,current,current,current', JSON.stringify(r));
}
// The resolver: classic defs stay out of AESTHETICS, resolve only when asked for and available.
{
  const reg = vm.createContext({ console });
  vm.runInContext(fs.readFileSync(path.join(root, 'js/aesthetics/registry.js'), 'utf8'), reg, { filename: 'js/aesthetics/registry.js' });
  const r = vm.runInContext(`(() => {
    registerAesthetic({ key: 'a', name: 'A', order: 1 });
    registerAesthetic({ key: 'b', name: 'B', order: 2 });
    registerClassicAesthetic('a', { key: 'a', name: 'A old', order: 1 });
    const st = v => ({ aesthetic: 'a', aestheticVersion: v });
    return {
      listed: AESTHETICS.map(x => x.key).join(),
      classic: resolveAestheticDef(st('classic')).key,
      classicOf: resolveAestheticDef(st('classic')).classicOf,
      current: resolveAestheticDef(st('current')).key,
      unset: resolveAestheticDef({ aesthetic: 'a' }).key,
      noClassic: resolveAestheticDef({ aesthetic: 'b', aestheticVersion: 'classic' }).key,
      byKey: aestheticByKey('a--classic').name,
      unknown: aestheticByKey('zzz--classic').key,
      has: hasClassicAesthetic('a') && !hasClassicAesthetic('b'),
      base: aestheticBaseKey('a--classic') + aestheticBaseKey('b'),
    };
  })()`, reg);
  check('classic: registered outside AESTHETICS (picker never lists it)', r.listed === 'a,b', JSON.stringify(r));
  check('classic: resolves only when asked for and available',
    r.classic === 'a--classic' && r.classicOf === 'a' && r.current === 'a' && r.unset === 'a' && r.noClassic === 'b' && r.has, JSON.stringify(r));
  check('classic: aestheticByKey finds it; unknown falls back; base key strips the suffix',
    r.byKey === 'A old' && r.unknown === 'a' && r.base === 'ab', JSON.stringify(r));
}
// Every generated classic file is current with the tag (re-run dev/make-classic.js when this fails).
{
  const { spawnSync } = require('child_process');
  const gen = spawnSync(process.execPath, [path.join(root, 'dev/make-classic.js'), '--check'], { cwd: root, encoding: 'utf8', env: Object.assign({}, process.env, { ELECTRON_RUN_AS_NODE: '1' }) });
  check('classic: generated files match r6-0-baseline and index.html lists them', gen.status === 0, (gen.stdout + gen.stderr).trim().slice(0, 300));
}

/* ---- start from your logo, and the showcase brands (js/logo-start.js, js/showcase-brands.js) ---- */
{
  // A context with the colour helpers, fonts and font recommendations; AESTHETICS stays empty
  // (no aesthetic files are loaded), which the logo code reads as "every key is allowed".
  const lctx = vm.createContext({ console, AESTHETICS: [] });
  for (const f of ['js/data.js', 'js/color.js', 'js/aesthetics/registry.js', 'js/aesthetic-meta.js', 'js/logo-start.js', 'js/showcase-brands.js']) {
    vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), lctx, { filename: f });
  }
  // Raw RGBA canvases to draw synthetic logos on.
  lctx.canvasOf = (w, h, draw) => {
    const d = new Uint8ClampedArray(w * h * 4);
    const put = (x, y, r, g, b, a = 255) => { if (x >= 0 && y >= 0 && x < w && y < h) { const i = (y * w + x) * 4; d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = a; } };
    const api = {
      rect(x0, y0, x1, y1, c) { for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) put(x, y, c[0], c[1], c[2]); },
      circle(cx, cy, rad, c) { for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const dd = Math.hypot(x - cx, y - cy); if (dd <= rad) put(x, y, c[0], c[1], c[2], dd > rad - 1 ? Math.round(255 * (rad - dd)) : 255); } },
      put,
    };
    draw(api, w, h);
    return { data: d, w, h };
  };
  const logos = {
    black: 'canvasOf(192,192,a=>{a.rect(30,60,162,100,[0,0,0]);a.circle(96,130,22,[0,0,0])})',
    redblue: 'canvasOf(192,192,a=>{a.circle(70,96,50,[220,40,50]);a.circle(120,96,50,[30,70,200])})',
    pastel: 'canvasOf(192,192,(a,w)=>{for(let y=40;y<150;y++)for(let x=20;x<172;x++){const t=x/w;a.put(x,y,Math.round(255*(0.95-0.1*t)),Math.round(190+40*t),Math.round(215+20*(1-t)))}})',
    neon: 'canvasOf(192,192,a=>{a.circle(96,96,60,[57,255,20]);a.rect(60,90,130,102,[255,0,200])})',
    muddy: 'canvasOf(192,192,a=>{a.rect(30,30,162,100,[110,90,60]);a.rect(30,100,162,160,[100,105,60])})',
    white: 'canvasOf(192,192,a=>{a.circle(96,96,60,[250,250,250])})',
  };
  const analyse = k => run2(`(() => { const c = ${logos[k]}; const ex = LogoStart.extract(c.data, c.w, c.h); return { ex, an: LogoStart.analyse(ex) }; })()`);
  function run2(code) { return vm.runInContext(code, lctx); }
  const HEXC = /^#[0-9a-f]{6}$/;
  for (const k of Object.keys(logos)) {
    const { an } = analyse(k);
    const c = an.palette.colors, ck = an.palette.checks;
    check(`logo ${k}: a complete palette of valid hex colours`, ['primary', 'secondary', 'accent', 'neutralDark', 'neutralLight'].every(r => HEXC.test(c[r])), JSON.stringify(c));
    check(`logo ${k}: body text >= 4.5:1 and text on every brand fill >= 4.5:1`,
      ck.body >= 4.5 && ck.onPrimary >= 4.5 && ck.onSecondary >= 4.5 && ck.onAccent >= 4.5, JSON.stringify(ck));
    check(`logo ${k}: gets an aesthetic, a font pairing and a mode`, !!an.aesthetic && !!an.fonts.heading && !!an.fonts.body && (an.bgMode === 'light' || an.bgMode === 'dark'), JSON.stringify([an.aesthetic, an.fonts, an.bgMode]));
    const fonts = run2(`[FONTS.some(f => f.name === ${JSON.stringify(an.fonts.heading)}), FONTS.some(f => f.name === ${JSON.stringify(an.fonts.body)})]`);
    check(`logo ${k}: suggested fonts exist in the library`, fonts[0] && fonts[1], JSON.stringify(an.fonts));
  }
  {
    // Two-colour logo: the palette is the logo's own red and blue, not a purple in between.
    const { ex, an } = analyse('redblue');
    const hues = run2(`(${JSON.stringify(an.palette.colors)}, [hexToHsl(${JSON.stringify(an.palette.colors.primary)}).h, hexToHsl(${JSON.stringify(an.palette.colors.secondary)}).h])`);
    const near = (h, t) => Math.min(Math.abs(h - t), 360 - Math.abs(h - t)) < 25;
    check('logo redblue: primary and secondary are the logo blue and red (no blended purple)',
      (near(hues[0], 225) && near(hues[1], 357)) || (near(hues[0], 357) && near(hues[1], 225)), JSON.stringify(hues));
    check('logo redblue: three clearly different brand hues (accent added)', run2(`(() => { const c = ${JSON.stringify(an.palette.colors)}; const h = ['primary','secondary','accent'].map(k => hexToHsl(c[k]).h); return hueDiff(h[0],h[1]) > 60 && hueDiff(h[0],h[2]) > 30 && hueDiff(h[1],h[2]) > 30; })()`), JSON.stringify(an.palette.colors));
  }
  {
    // One-colour logos: a secondary and accent are derived; neutrals are tinted, not grey.
    const k = analyse('black').an;
    check('logo black: one-colour mark still gets a distinct secondary and accent',
      run2(`(() => { const c = ${JSON.stringify(k.palette.colors)}; return c.primary !== c.secondary && c.secondary !== c.accent && c.primary !== c.accent; })()`), JSON.stringify(k.palette.colors));
    check('logo black: light and dark neutrals exist, far apart', run2(`contrastRatio(${JSON.stringify(k.palette.colors.neutralLight)}, ${JSON.stringify(k.palette.colors.neutralDark)})`) >= 10, 'neutral contrast');
    const w = analyse('white').an;
    check('logo white: a white mark goes on a dark canvas', w.palette.tone === 'light' && w.bgMode === 'dark', `${w.palette.tone} ${w.bgMode}`);
    const nl = run2(`hexToHsl(${JSON.stringify(k.palette.colors.neutralLight)})`);
    check('logo black: the light neutral is tinted (not pure grey)', nl.s >= 8, JSON.stringify(nl));
  }
  {
    // Anti-alias fringe: a hard red/blue edge with a purple seam must not make purple the lead colour.
    const r = run2(`(() => { const c = canvasOf(192,192,a=>{a.rect(20,20,96,172,[220,40,50]);a.rect(97,20,172,172,[30,70,200]);a.rect(96,20,97,172,[125,55,125])}); const ex = LogoStart.extract(c.data, c.w, c.h); return ex.chromatic.map(x => Math.round(x.h)); })()`);
    check('extract: one-pixel colour seam between two colours is ignored', r.length === 2, JSON.stringify(r));
  }
  {
    // A JPG-style white box is knocked out; a logo that fills its frame is left alone.
    const r = run2(`(() => {
      const w = 80, h = 60, d = new Uint8ClampedArray(w*h*4).fill(255);
      for (let y = 20; y < 40; y++) for (let x = 30; x < 50; x++) { const i = (y*w+x)*4; d[i]=200; d[i+1]=30; d[i+2]=30; }
      const changed = LogoStart.knockOutWhite(d, w, h);
      const corner = d[3], mid = d[((30*w)+40)*4+3];
      const full = new Uint8ClampedArray(w*h*4); for (let i = 0; i < w*h; i++) { full[i*4]=20; full[i*4+1]=60; full[i*4+2]=160; full[i*4+3]=255; }
      return { changed, corner, mid, fullChanged: LogoStart.knockOutWhite(full, w, h) };
    })()`);
    check('knockOutWhite: white box becomes transparent, the mark stays', r.changed && r.corner === 0 && r.mid === 255, JSON.stringify(r));
    check('knockOutWhite: a full-bleed coloured logo is not touched', r.fullChanged === false, JSON.stringify(r));
  }
  check('nameFromFile: tidies a file name into a brand name',
    run2(`[LogoStart.nameFromFile('acme-logo_FINAL (2).png'), LogoStart.nameFromFile('IMG_4432.jpg'), LogoStart.nameFromFile('north star.svg')]`).join('|') === 'Acme||North Star', 'got ' + run2(`[LogoStart.nameFromFile('acme-logo_FINAL (2).png'), LogoStart.nameFromFile('IMG_4432.jpg'), LogoStart.nameFromFile('north star.svg')]`).join('|'));

  /* the showcase brands */
  const sb = run2('ShowcaseBrands.brands.map(b => ({ name: b.name, aesthetic: b.aesthetic, colors: b.colors, h: b.headingFont, bd: b.bodyFont, mode: b.bgMode, tagline: b.tagline, logo: b.logo.mark }))');
  check('showcase: twelve brands with unique names', sb.length === 12 && new Set(sb.map(b => b.name.toLowerCase())).size === 12, `${sb.length}`);
  const fav = ['soft-form', 'bento-grid', 'dystopian-luxury', 'old-web', 'pirate-broadcast', 'xerox-punk', 'gorpcore', 'naive-doodle', 'acid-graphics', 'mesh-gradient', 'radical-memphis', 'corporate-vandalism'];
  check('showcase: every brand uses one of the favourite aesthetics, and every aesthetic file exists',
    sb.every(b => fav.includes(b.aesthetic) && fs.existsSync(path.join(root, 'js/aesthetics', b.aesthetic + '.js'))), sb.map(b => b.aesthetic).join(','));
  check('showcase: every font exists in the font library', run2(`ShowcaseBrands.brands.every(b => FONTS.some(f => f.name === b.headingFont) && FONTS.some(f => f.name === b.bodyFont))`), 'missing font');
  const weak = run2(`ShowcaseBrands.brands.map(b => {
    const c = b.colors, dark = b.bgMode === 'dark';
    const canvas = dark ? c.neutralDark : c.neutralLight, ink = dark ? c.neutralLight : c.neutralDark;
    return { n: b.name, body: contrastRatio(ink, canvas), p: contrastRatio(c.primary, pickReadableText(c.primary)), s: contrastRatio(c.secondary, pickReadableText(c.secondary)), a: contrastRatio(c.accent, pickReadableText(c.accent)) };
  }).filter(x => x.body < 7 || x.p < 4.5 || x.s < 4.5 || x.a < 4.5).map(x => x.n + ' ' + [x.body, x.p, x.s, x.a].map(v => v.toFixed(1)).join('/'))`);
  check('showcase: body text >= 7:1 and text on primary, secondary and accent >= 4.5:1 in every brand', weak.length === 0, weak.join('; '));
  const marks = run2('ShowcaseBrands.brands.every(b => /^<svg[\\s\\S]*<\\/svg>$/.test(ShowcaseBrands.logoSvg(b)) && ShowcaseBrands.logoSvg(b).length < 4000)');
  check('showcase: each brand has a small SVG logo', marks, 'logo svg');
}

/* ---- product sheet in a saved brand (js/persistence.js, js/product-sheet.js) ---- */

{
  const r = run(`(() => {
    const st = freshState();
    st.product = parseProductSheet('# Product: P\\nPurpose: p\\nCore action: c\\n## Screen: Home\\nJob: j\\nPrimary action: none\\nContent:\\n1. text: hi', 'f.md').product;
    st.productApprovals = { home: { status: 'approved', note: 'ok', sig: productScreenSig(st, st.product.screens[0]), at: '2026-10-18T00:00:00.000Z' }, ghost: 5 };
    const saved = JSON.parse(JSON.stringify(serializeState(st)));
    st.product.screens[0].job = 'changed after save';
    const back = freshState(); back.product = { junk: 1 }; back.productApprovals = { x: 1 };
    applySavedSessionToState(saved, back);
    const old = JSON.parse(JSON.stringify(serializeState(freshState()))); delete old.product; delete old.productApprovals;
    const o = freshState(); o.product = saved.product; o.productApprovals = saved.productApprovals;
    applySavedSessionToState(old, o);
    const bad = freshState(); applySavedSessionToState(Object.assign({}, saved, { product: { screens: 'x' } }), bad);
    return { name: back.product.name, job: back.product.screens[0].job, ap: back.productApprovals, status: productApprovalStatus(back), nullSave: serializeState(freshState()).product, oldP: o.product, oldA: o.productApprovals, badP: bad.product, badA: bad.productApprovals };
  })()`);
  check('product: a saved brand round-trips its product and approvals (a copy, not a reference); the approval still counts after load',
    r.name === 'P' && r.job === 'j' && r.ap.home.status === 'approved' && r.ap.home.note === 'ok' && !('ghost' in r.ap) && r.status.allApproved === true && r.nullSave === null, JSON.stringify(r));
  check('product: an older save without a product loads as null / {}; a malformed product loads as null',
    r.oldP === null && JSON.stringify(r.oldA) === '{}' && r.badP === null && JSON.stringify(r.badA) === '{}', JSON.stringify(r));
}

/* ---- AI brief: Building choice and the UI kit section (js/ai-brief.js, js/ui-kit.js) ---- */

{
  const store = {};
  const bc = vm.createContext({ console, localStorage: { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); } } });
  for (const f of ['js/ui-kit.js', 'js/ai-brief.js']) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), bc, { filename: f });
  const B = code => vm.runInContext(code, bc);
  const acme = '{ content: { brandName: "Acme" } }', zed = '{ content: { brandName: "Zed" } }';
  check('brief: Building defaults to App', B(`aibGetSurface(${acme})`) === 'app', 'default');
  B(`aibSetSurface(${acme}, 'both'); aibSetSurface(${zed}, 'bogus')`);
  check('brief: Building is stored per brand and ignores unknown values', B(`aibGetSurface(${acme})`) === 'both' && B(`aibGetSurface(${zed})`) === 'both', 'surface');
  B(`aibSetSurface(${zed}, 'web')`);
  check('brief: another brand keeps its own Building choice', B(`aibGetSurface(${acme})`) === 'both' && B(`aibGetSurface(${zed})`) === 'web', 'per brand');
  const items = B('UI_KIT.reduce((n, g) => n + g.items.length, 0)');
  const miss = B(`(() => {
    aibComponentRows = () => ['Card', 'Primary button', 'Secondary button', 'Ghost / tertiary link', 'Input field, rest', 'Input field, focus', 'Segmented control, selected',
      'Toggle, on', 'Toggle, off', 'Tag / chip', 'Badge ("New", notification)', 'Progress / data bar', 'List row, selected'].map(n => [n, '--canvas', '--ink', 'none']);
    const ctx = { def: {}, cur: { t: {}, extras: {} }, rows: [], radius: { control: 8, field: 8, card: 12 } };
    const d = aibKitRowData(ctx);
    return UI_KIT.reduce((a, g) => a.concat(g.items), []).filter(i => !d[i.id] || d[i.id].length !== 4).map(i => i.id).join();
  })()`);
  check(`brief: the kit table has a row for all ${items} UI_KIT items`, miss === '', 'missing: ' + miss);
  // iOS column, screen layouts and dark pairs, from a stub context (aibComponentRows is already stubbed above).
  const kitOut = B(`(() => {
    const rows = [['--canvas', '#fff', '#111'], ['--ink', '#000', '#eee'], ['--line', '#ccc', '#ccc']].map(([token, l, d]) => ({ token, get: m => (m === 'dark' ? d : l) }));
    const mk = (swift, modes) => ({ def: {}, cur: { t: {} , extras: {} }, rows, modes, swift, swiftOnly: false, app: true, radius: { control: 8, field: 8, card: 12 }, tok: s => String(s) });
    const kit = c => aibSecKit(c).join('\\n');
    return [kit(mk(true, ['light', 'dark'])), kit(mk(false, ['light', 'dark'])), kit(mk(true, ['light'])), aibSecScreens({ app: true }).join('\\n'), aibSecScreens({ app: false }).length];
  })()`);
  // These contexts are App-only (app: true, no site), so the table leaves out the website / desktop items (web: true).
  const nItems = +B("UI_KIT.reduce((a, g) => a.concat(g.items), []).filter(i => !i.web).length"), nNative = +B("UI_KIT.reduce((a, g) => a.concat(g.items), []).filter(i => !i.web && /^native:/.test(i.ios)).length");
  check('brief: SwiftUI target adds an iOS column with a row per kit item and the native/custom line',
    /\| Element \| Use \| iOS \| Fill/.test(kitOut[0]) && (kitOut[0].match(/\| (Native `[^`]+`, tinted|Custom) \|/g) || []).length === nItems && (kitOut[0].match(/\| Native `/g) || []).length === nNative && /Native rows: use the system control/.test(kitOut[0]) && /\| Toggle \|[^\n]*Native `Toggle`, tinted/.test(kitOut[0]), kitOut[0].slice(0, 700));
  // Every UI_KIT id has a drawing in the Built view (js/see-built.js needs a DOM, so its KIT_SPEC keys are read from the source).
  {
    const src = fs.readFileSync(path.join(root, 'js/see-built.js'), 'utf8');
    const spec = src.slice(src.indexOf('const KIT_SPEC = {'), src.indexOf('const KIT_WIDE'));
    const ids = JSON.parse(B("JSON.stringify(UI_KIT.reduce((a, g) => a.concat(g.items.map(i => i.id)), []))"));
    const miss = ids.filter(id => !new RegExp(`^\\s{4}(?:'${id}'|${id}):\\s*\\(`, 'm').test(spec));
    check(`kit: all ${ids.length} UI_KIT ids have a KIT_SPEC drawing in the Built view`, miss.length === 0, 'missing: ' + miss.join());
    const parts = B("UI_KIT.reduce((a, g) => a.concat(g.items), []).filter(i => !AIB_KIT_PARTS[i.id]).map(i => i.id).join()");
    check('brief: every UI_KIT id has an AIB_KIT_PARTS entry for the measured rows', parts === '', 'missing: ' + parts);
  }
  // The glossary covers 61 NN/g terms, each built from kit items that exist.
  {
    const g = JSON.parse(B("JSON.stringify({ n: UI_KIT_GLOSSARY.length, dup: UI_KIT_GLOSSARY.length - new Set(UI_KIT_GLOSSARY.map(t => t.term)).size, bad: UI_KIT_GLOSSARY.filter(t => !t.ids.length || t.ids.some(id => !UI_KIT.some(grp => grp.items.some(i => i.id === id)))).map(t => t.term) })"));
    check('kit: the glossary maps 61 distinct NN/g terms to items that exist in UI_KIT', g.n === 61 && g.dup === 0 && g.bad.length === 0, JSON.stringify(g));
  }
  // App-only briefs leave out the website / desktop items; Website and Both briefs keep every item.
  {
    const names = JSON.parse(B("JSON.stringify(UI_KIT.reduce((a, g) => a.concat(g.items), []).filter(i => i.web).map(i => i.name))"));
    const all = JSON.parse(B("JSON.stringify(UI_KIT.reduce((a, g) => a.concat(g.items.map(i => i.name)), []))"));
    const tbl = site => B(`(() => {
      const rows = [['--canvas', '#fff', '#fff']].map(([token, l, d]) => ({ token, get: m => (m === 'dark' ? d : l) }));
      return aibSecKit({ def: {}, cur: { t: {}, extras: {} }, rows, modes: ['light'], swift: false, app: true, site: ${site}, radius: { control: 8, field: 8, card: 12 }, tok: s => String(s) }).join('\\n');
    })()`);
    const appOnly = tbl(false), both = tbl(true);
    const has = (out, n) => out.split('\n').some(l => l.startsWith(`| ${n} |`));
    check(`brief: an App-only kit table lists none of the ${names.length} web items`, names.length > 0 && names.every(n => !has(appOnly, n)) && all.filter(n => !names.includes(n)).every(n => has(appOnly, n)), names.filter(n => has(appOnly, n)).join());
    check('brief: a Both brief lists every kit item, web ones included', all.every(n => has(both, n)), all.filter(n => !has(both, n)).join());
    check('brief: an App-only brief drops a group whose items are all web (no empty group heading)', !/### [^\n]*\n\n\|[^\n]*\n\|[^\n]*\n\n/.test(appOnly), 'empty group');
  }
  check('brief: a Web-only target has no iOS column and no native/custom line', !/\| iOS \|/.test(kitOut[1]) && !/Native rows/.test(kitOut[1]), kitOut[1].slice(0, 400));
  check('brief: kit Fill/Text show light and dark values where a dark palette exists', /--canvas \(#fff \/ #111\)/.test(kitOut[0]) && /--ink \(#000 \/ #eee\)/.test(kitOut[0]) && !/--line \(#/.test(kitOut[0]), kitOut[0].slice(0, 800));
  check('brief: a single-palette brief keeps the kit cells without dark pairs', !/--canvas \(#/.test(kitOut[2]), kitOut[2].slice(0, 300));
  check('brief: App briefs list all five screen layouts with numbered components and the closing line',
    (kitOut[3].match(/^### /gm) || []).length === 5 && /^## Screen layouts/.test(kitOut[3]) && /### Onboarding[\s\S]*1\. Top bar\n2\. Large title\n3\. Body text/.test(kitOut[3]) && /Section label/.test(kitOut[3]) && /with no hero areas or decorative headers\.$/.test(kitOut[3]), kitOut[3].slice(0, 400));
  check('brief: a Website-only brief has no screen layouts', kitOut[4] === 0, 'web');
  const rule = B(`(() => { const out = aibSecAppRules({ app: true, site: false }); return out[0] + '|' + (out[1] === UI_KIT_SURFACES.app.rule) + '|' + /none of it belongs in the app/.test(out.join('\\n')); })()`);
  check('brief: App UI rules carry the surface rule and the no-art line', rule === '## App UI rules|true|true', rule);
  check('brief: a website-only brief has no App UI rules', B('aibSecAppRules({ app: false, site: true }).length') === 0, 'web');
  // Surface rules: no new colours in apps; the website hero shows the product, never the board art.
  check('kit: the app rule forbids colours outside the palette', /Never introduce a colour that is not in the palette: destructive and status colours come from it too\./.test(B('UI_KIT_SURFACES.app.rule')), 'app rule');
  check('kit: the web rule puts the product in the hero and keeps the board art off the website',
    /The hero shows the product: a real screen built from the UI kit\./.test(B('UI_KIT_SURFACES.web.rule')) && /never put it on the website/.test(B('UI_KIT_SURFACES.web.rule')) && !/may add the hero illustration/.test(B('UI_KIT_SURFACES.web.rule')), 'web rule');
  const webRules = B(`[aibSecWebRules({ app: false, site: true }).join('|'), aibSecWebRules({ app: true, site: true }).length, aibSecWebRules({ app: true, site: false }).length].join('#')`);
  check('brief: Website-only briefs carry the Website rules section; App and Both do not repeat it', webRules === '## Website rules|' + B('UI_KIT_SURFACES.web.rule') + '#0#0', webRules);
  // Destructive / error colour comes from the palette (js/ui-kit.js uiKitDanger).
  const dz = B(`JSON.stringify([
    uiKitDanger({ primary: '#2e6f95', secondary: '#d93a3a', accent: '#f2c14e', ink: '#1b1b1f', canvas: '#faf8f5' }),
    uiKitDanger({ primary: '#a85a4a', secondary: '#e8d9b5', accent: '#5b7f6a', ink: '#1f2421', canvas: '#f6f4ef' }),
    uiKitDanger({ primary: '#5b7f6a', secondary: '#e8d9b5', accent: '#c9a227', ink: '#1f2421', canvas: '#f6f4ef' }),
    uiKitDanger({ primary: '#2e6f95', secondary: '#c9b8b5', accent: '#f2c14e', ink: '#1b1b1f', canvas: '#ffffff' })])`);
  const [dzSec, dzPri, dzNone, dzGrey] = JSON.parse(dz);
  check('kit: a reddish palette colour distinct from the primary is the filled destructive colour (shaded to hold 4.5:1 on the canvas)', dzSec.role === 'secondary' && dzSec.color === dzSec.text && dzSec.fill === true && B(`UIK_COLOR.con(UIK_COLOR.parse('${dzSec.color}'), UIK_COLOR.parse('#faf8f5'))`) >= 4.5, JSON.stringify(dzSec));
  // --on-error: whichever label scores best on the one error colour, 4.5:1 on it and the error 4.5:1 on the canvas, light and dark, for reddish palettes
  const onErr = JSON.parse(B(`JSON.stringify([
    ['#9c5048', '#1d1c26', '#f6f4ef'], ['#cd776c', '#f2f0ea', '#16151a'], ['#ad574c', '#1d1c26', '#fbf7f2'], ['#de5777', '#f2f0ea', '#171717'], ['#bc002d', '#1d1c26', '#ffffff'],
    ['#ff6b57', '#10131a', '#fff7f2'], ['#e8261c', '#f5f5f5', '#0a0a0a'], ['#7a1f2b', '#f5f5f5', '#120a0c'], ['#ff3d7f', '#2a1020', '#fff5f8'], ['#d93a3a', '#f2f2f2', '#6b6b6b']]
    .map(([c, ink, canvas]) => { const d = uiKitDanger({ primary: '#2e6f95', secondary: c, accent: '#f2c14e', ink, canvas }); const K = UIK_COLOR, P = K.parse;
      return { c, ink, canvas, role: d.role, text: d.text, on: d.on, onR: K.con(P(d.on), P(d.text)), cvR: K.con(P(d.text), P(canvas)) }; }))`));
  check('kit: --on-error holds 4.5:1 on the error colour and the error holds 4.5:1 on the canvas (palettes with a red, both modes)', onErr.filter(r => r.role).length >= 8 && onErr.every(r => !r.role || (r.onR >= 4.5 && r.cvR >= 4.5)), JSON.stringify(onErr.filter(r => r.role && !(r.onR >= 4.5 && r.cvR >= 4.5))));
  check('kit: when the reddish colour is the primary, destructive is an outline in it (never filled)', dzPri.role === 'primary' && dzPri.fill === false, JSON.stringify(dzPri));
  check('kit: no reddish colour (or a greyed one) means ink, never a stock red', dzNone.role === null && dzNone.color === '#1f2421' && dzGrey.role === null, JSON.stringify([dzNone, dzGrey]));
  const tone = B(`JSON.stringify(uiKitTone('#e8d9b5', { ink: '#1f2421', canvas: '#f6f4ef' }, 3, 0.12))`);
  check('kit: a pale status tone is shaded toward the ink until its icon holds 3:1', JSON.parse(tone).color === '#e8d9b5' && JSON.parse(tone).ico !== '#e8d9b5', tone);
  const rules = B(`(() => {
    const fx = (app, site) => aibSecRules({ app, site, def: { rules: { do: ['Use one hero band', 'Keep corners square'], dont: ['Add a glow behind titles'] } }, scale: { wantH: 0, wantB: 0 } }).join('\\n');
    return [fx(true, false), fx(true, true), fx(false, true)];
  })()`);
  check('brief: App drops hero, band and glow rules', !/hero|glow/.test(rules[0]) && /square/.test(rules[0]), rules[0]);
  check('brief: Both lists them under Website only', /Website only[\s\S]*hero band[\s\S]*glow/.test(rules[1]), rules[1]);
  check('brief: Website keeps every rule where it was', /hero band[\s\S]*square[\s\S]*glow/.test(rules[2]) && !/Website only/.test(rules[2]), rules[2]);
  // Board prose in an App-only brief: art sentences and clauses go, Website and Both keep the text.
  const prose = B(`(() => {
    const app = { app: true, site: false }, both = { app: true, site: true }, web = { app: false, site: true };
    const use = 'The page: the headline sits on it in ink beside the band; white cards sit on it and carry the layered shadows.';
    const list = 'The one solid pill CTA, switch "on", focus ring, progress bars and the first color of the striations.';
    const sum = 'A soft mesh of luminous brand colour with fine striations and grain beside dark ink, carried into the product as gradient actions.';
    return [aibAppText(app, use, 'x'), aibAppText(app, list, 'x'), aibAppText(app, 'The hero illustration over a pattern.', 'Screen background.'),
      aibAppText(app, sum, 'fallback', { subject: true }), aibAppText(both, use, 'x') === use, aibAppText(web, use, 'x') === use,
      aibAppText(app, 'Plain text with 4.5:1 contrast. Second sentence.', 'x')];
  })()`);
  check('brief: App text drops the clause about the band and keeps the rest', prose[0] === 'white cards sit on it and carry the layered shadows.', prose[0]);
  check('brief: App text drops one item from a list', prose[1] === 'The one solid pill CTA, switch "on", focus ring, progress bars.', prose[1]);
  check('brief: App text falls back to a plain description when nothing is left', prose[2] === 'Screen background.', prose[2]);
  check('brief: App summary whose subject is art falls back whole', prose[3] === 'fallback', prose[3]);
  check('brief: Both and Website keep the original text; clean text is untouched', prose[4] === true && prose[5] === true && prose[6] === 'Plain text with 4.5:1 contrast. Second sentence.', JSON.stringify(prose));
  const blendRows = B(`(() => {
    blendBriefLines = () => ['## Blend: X', '| Channel | Source | What it controls |', '| Art | B | hero art. |', '| Type | A | faces. |', '| Patterns | A + B | Suite. |'];
    return [aibSecBlend({ app: true, site: false, def: { blend: {} }, state: {}, cur: { t: {} } }).join('\\n'),
      aibSecBlend({ app: true, site: true, def: { blend: {} }, state: {}, cur: { t: {} } }).join('\\n'),
      aibSecBlend({ app: false, site: true, def: { blend: {} }, state: {}, cur: { t: {} } }).join('\\n')];
  })()`);
  check('brief: App blend table marks Art and Patterns as not used in the app', /\| Art \| — \| Not used in the app \(website and brand board only\)\. \|/.test(blendRows[0]) && /\| Patterns \| — \| Not used in the app/.test(blendRows[0]) && /\| Type \| A \| faces\. \|/.test(blendRows[0]), blendRows[0]);
  check('brief: Both appends Website only to the Art and Patterns rows', /hero art\. Website only\. \|/.test(blendRows[1]) && /Suite\. Website only\. \|/.test(blendRows[1]) && !/faces\. Website only/.test(blendRows[1]), blendRows[1]);
  check('brief: Website blend table is unchanged', /\| Art \| B \| hero art\. \|/.test(blendRows[2]) && !/Website only|Not used/.test(blendRows[2]), blendRows[2]);
}

/* ---- AI brief: App brief from the measured UI kit (js/ai-brief.js aibKitModel and the App sections) ---- */

{
  const mc = vm.createContext({
    console: { log: console.log, warn() {}, error: console.error },
    document: { getElementById: () => null, addEventListener() {}, createElement: () => ({ style: {} }), querySelectorAll: () => [] },
    window: {}, localStorage: { getItem: () => null, setItem() {} },
  });
  for (const f of ['js/data.js', 'js/color.js', 'js/brand-deck.js', 'js/aesthetics/registry.js', 'js/aesthetics/dystopian-luxury.js', 'js/aesthetics/pirate-broadcast.js',
    'js/aesthetic-meta.js', 'js/ui-kit.js', 'js/aesthetic-board.js', 'js/blend.js', 'js/color-roles.js', 'js/product-sheet.js', 'js/ai-brief.js']) {
    vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), mc, { filename: f });
  }
  const M = code => vm.runInContext(code, mc);
  // aibKitSnap data as the UI kit tab measured it (2026-10-18): Dystopian Luxury's ink-block primary button with its
  // 6pt primary square, Pirate Broadcast's teletext-green mono button; their cards (hairline vs scanlines + ring).
  M(`var kbox = o => Object.assign({ bg: 'rgba(0, 0, 0, 0)', img: 'none', color: 'rgb(0, 0, 0)', ff: 'Lato, sans-serif', fs: 17, fw: '400', fst: 'normal', tt: 'none', ls: 0, deco: 'none',
      r: [0, 0, 0, 0], b: [0, 1, 2, 3].map(() => ({ w: 0, s: 'none', c: 'rgb(0, 0, 0)' })), sh: 'none', op: 1, tf: 'none', bd: 'none', ol: '', pad: [0, 0, 0, 0], h: 52, w: 318, filter: 'none', clip: 'none' }, o);
    var kitDL = { mode: 'light', chrome: { title: kbox({ fs: 34, h: 41 }) }, cells: {
      'btn-primary': { rest: { button: { box: kbox({ bg: 'rgb(15, 17, 15)', color: 'rgb(247, 248, 247)', pad: [0, 20, 0, 20] }), before: kbox({ bg: 'rgb(158, 174, 41)', w: 6, h: 6, content: '""', text: '', at: [null, null, null, null] }) } },
        pressed: { button: { box: kbox({ bg: 'rgb(248, 248, 247)', color: 'rgb(15, 17, 15)', sh: 'rgb(15, 17, 15) 0px 0px 0px 1px inset', pad: [0, 20, 0, 20] }) } } },
      card: { rest: { card: { box: kbox({ b: [{ w: 1, s: 'solid', c: 'rgba(37, 38, 28, 0.16)' }].concat([1, 2, 3].map(() => ({ w: 0, s: 'none', c: 'rgb(0, 0, 0)' }))), pad: [16, 0, 0, 0], h: 236 }) } } } } };
    var kitPB = { mode: 'light', chrome: { title: kbox({ fs: 34, h: 41, ff: 'ui-monospace, monospace', fw: '700', tt: 'uppercase' }) }, cells: {
      'btn-primary': { rest: { button: { box: kbox({ bg: 'rgb(0, 255, 0)', color: 'rgb(0, 0, 0)', ff: 'ui-monospace, "SF Mono", monospace', fw: '700', tt: 'uppercase', ls: 1.7, pad: [0, 14, 0, 16] }) } } },
      card: { rest: { card: { box: kbox({ bg: 'rgb(0, 0, 0)', img: 'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.3) 0px, rgba(0, 0, 0, 0.3) 0.3px, rgba(0, 0, 0, 0) 0.3px, rgba(0, 0, 0, 0) 0.9px), none', sh: 'rgba(255, 255, 255, 0.22) 0px 0px 0px 2px', pad: [20, 20, 20, 20], h: 226 }) } } } } };
    var kstate = key => { const st = { headingFont: FONTS[0], bodyFont: FONTS[0], typography: { headingSize: 44, bodySize: 16, headingWeight: 700, bodyWeight: 400 }, colors: { primary: '#9eae29', secondary: '#7598d1', accent: '#a126ed', neutralDark: '#25261c', neutralLight: '#f8f8f7' },
      bgMode: 'light', pureBg: false, content: { brandName: 'Signl', tagline: 'Scroll math, not social media' }, aesthetic: key, aestheticVersion: 'current', blend: null, locks: {}, patterns: [] }; return st; };`);
  const rowOf = (md, el) => (md.split('\n').find(l => l.startsWith('| ' + el + ' |')) || '');
  const briefs = M(`[buildAiBrief(kstate('dystopian-luxury'), { surface: 'app', target: 'web', noProbe: true, kitSnap: kitDL }),
    buildAiBrief(kstate('pirate-broadcast'), { surface: 'app', target: 'web', noProbe: true, kitSnap: kitPB }),
    buildAiBrief(kstate('dystopian-luxury'), { surface: 'app', target: 'web', noProbe: true }),
    buildAiBrief(kstate('dystopian-luxury'), { surface: 'web', target: 'web', noProbe: true })]`);
  const [dl, pb, dlStatic, dlWeb] = briefs;
  // Without a product, every brief is exactly what it was before the product sheet (hash and length taken before the change).
  // Re-pinned 2026-10-30 (Round 11) after the kit gained focus / disabled states: the three kit-aware briefs differ from the old pin only in
  // the kit table's State column (secondary focus, checkbox and toggle disabled), the Focus colour row and one keyboard-focus rule line; the web brief is unchanged.
  // Re-pinned 2026-10-31 (UI kit glossary round) after the kit gained 39 components: the three App briefs differ only by the new kit rows (the website / desktop ones left out); the web brief is unchanged.
  {
    const fnv = str => { let h = 0x811c9dc5; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16); };
    const got = briefs.map(b => fnv(b) + ':' + b.length), want = ['4e3e7dfc:23797', '9a179386:23086', 'e01a7aec:37667', '4ae58906:13293'];
    check('product: briefs without a product are byte-identical to before', JSON.stringify(got) === JSON.stringify(want), JSON.stringify(got));
  }
  /* ---- product sheet (js/product-sheet.js) and its brief section ---- */
  {
    const SHEET = fs.readFileSync(path.join(root, 'docs/product-sheet-format.md'), 'utf8').match(/```markdown\n([\s\S]*?)```/)[1];
    mc.SHEET = SHEET;
    const R = M(`parseProductSheet(SHEET, 'product-sheet.md')`);
    const P = R.product, home = P && P.screens[0];
    check('product: the contract example parses to the exact model',
      JSON.stringify(R.warnings) === '[]' && P.name === 'Signl' && P.purpose === 'Fast mental math that feels like a feed but leaves you sharper.'
      && P.coreAction === 'Start a two-minute sprint.' && JSON.stringify(P.tabs) === '["Home","Modes","Stats"]' && P.source === 'product-sheet.md' && P.raw === SHEET && P.screens.length === 1
      && home.id === 'home' && home.name === 'Home' && home.job === "Show I'm improving and get me into a run in one tap." && home.primary === 'Start sprint'
      && home.chrome === 'tabbar' && home.fold === 'Rating, Start and Daily fit above the tab bar at default text size.' && home.signature === 'tab bar'
      && JSON.stringify(home.notes) === '[]' && home.blocks.length === 6
      && JSON.stringify(home.blocks[0]) === '{"rank":1,"type":"hero-numeral","text":"1,482","props":{"label":"Arithmetic rating","meta":"+60 this week"}}'
      && JSON.stringify(home.blocks[1]) === '{"rank":2,"type":"text","text":"12-day streak · 3 runs today","props":{}}'
      && home.blocks[2].props.points === '1310,1350,1342,1400,1420,1482' && home.blocks[3].type === 'action' && home.blocks[3].props.meta === '2:00 · Arithmetic'
      && home.blocks[5].props.rows === 'Drill your slowest — 7×8, 15% of 340 — 1:00'
      && JSON.stringify(home.states) === JSON.stringify({ empty: 'New player. Welcome headline, Take placement as the only primary action.', loading: 'none; all data is on the device.', error: 'none.', firstRun: 'Getting-started line under the action: 0 of 3 steps.' }),
      JSON.stringify(R).slice(0, 600));
    const bad = M(`(() => { const out = [];
      ['', null, undefined, 'just words\\nand more', '# Product:\\n## Screen:\\nContent:\\n1. nonsense: x | broken\\n1. text', '## Screen: A\\n## Screen: A\\nJob: j\\nPrimary action: none\\nChrome: sideways\\nWhat is this\\nContent:\\n1. text: hi\\n2. wobble: x\\nStates:\\n- Odd: y'].forEach(t => { try { out.push(parseProductSheet(t, 's')); } catch (e) { out.push('THROW ' + e.message); } });
      return out; })()`);
    check('product: malformed input never throws and warns with line numbers', bad.every(b => typeof b === 'object') && bad[0].product === null && bad[1].product === null && bad[0].warnings.length > 0 && bad[3].warnings.every(w => typeof w.line === 'number'), JSON.stringify(bad.map(b => b.warnings && b.warnings.length)));
    const b5 = bad[5], s1 = b5.product.screens[0], s0 = b5.product.screens[1];
    check('product: malformed sheet keeps unknown lines in notes, slugs unique, bad chrome falls back, states default',
      s1.id === 'a' && s0.id === 'a-2' && s0.chrome === 'topbar' && s0.primary === null && s0.notes.includes('What is this') && s0.notes.some(n => /wobble/.test(n)) && s0.notes.includes('- Odd: y')
      && s0.states.empty === 'not specified' && b5.warnings.every(w => typeof w.line === 'number' && w.message) && b5.warnings.some(w => w.line === 5 && /Chrome/.test(w.message)) && s1.blocks.length === 0 && b5.warnings.some(w => /no Content/.test(w.message)) && s0.blocks.length === 1,
      JSON.stringify(b5.warnings));
    check('product: a bare text has no product and warns; a sheet with only a screen still returns a product',
      bad[3].product === null && bad[3].warnings.length > 0 && bad[4].product !== null && bad[4].product.screens.length === 1 && bad[4].warnings.some(w => /Unknown block type/.test(w.message)), JSON.stringify(bad[3].warnings));

    // signature
    mc.P = P;
    const sig = M(`(() => { const st = kstate('dystopian-luxury'); st.scheme = 'analogous'; st.product = JSON.parse(JSON.stringify(P));
      const sc = st.product.screens[0], a = productScreenSig(st, sc);
      const v = f => { const s2 = JSON.parse(JSON.stringify(st)); s2.headingFont = st.headingFont; s2.bodyFont = st.bodyFont; f(s2); return productScreenSig(s2, s2.product.screens[0]); };
      return { a, again: productScreenSig(st, sc), re: /^[0-9a-f]{8}$/.test(a),
        aes: v(s => { s.aesthetic = 'pirate-broadcast'; }), col: v(s => { s.colors.primary = '#112233'; }), screen: v(s => { s.product.screens[0].job = 'Other'; }),
        block: v(s => { s.product.screens[0].blocks[0].text = '9'; }), same: v(s => { s.bgMode = 'dark'; s.content.brandName = 'X'; }) }; })()`);
    check('product: the signature is stable and changes with the aesthetic, colours and screen, not otherwise',
      sig.re && sig.a === sig.again && sig.aes !== sig.a && sig.col !== sig.a && sig.screen !== sig.a && sig.block !== sig.a && sig.same === sig.a, JSON.stringify(sig));

    // approval status
    const ap = M(`(() => { const st = kstate('dystopian-luxury'); st.product = parseProductSheet(SHEET + '\\n## Screen: Modes\\nJob: j\\nPrimary action: none\\nContent:\\n1. text: hi\\n## Screen: Stats\\nJob: j\\nPrimary action: none\\nContent:\\n1. text: hi\\n', 'x').product;
      const [h, m, t] = st.product.screens; const r = [];
      r.push(productApprovalStatus(st)); r.push(productApprovalStatus({}));
      st.productApprovals = { home: { status: 'approved', note: '', sig: productScreenSig(st, h), at: 'x' }, modes: { status: 'changes', note: 'n', sig: productScreenSig(st, m), at: 'x' }, stats: { status: 'approved', note: '', sig: 'stale', at: 'x' } };
      r.push(productApprovalStatus(st));
      st.productApprovals.modes = { status: 'approved', note: '', sig: productScreenSig(st, m), at: 'x' }; st.productApprovals.stats.sig = productScreenSig(st, t);
      r.push(productApprovalStatus(st));
      st.colors.primary = '#010203'; r.push(productApprovalStatus(st));
      return r; })()`);
    check('product: approval status counts pending, stale (changed since approved) and approved',
      JSON.stringify(ap[0]) === '{"total":3,"approved":0,"stale":0,"pending":3,"allApproved":false}' && JSON.stringify(ap[1]) === '{"total":0,"approved":0,"stale":0,"pending":0,"allApproved":false}'
      && JSON.stringify(ap[2]) === '{"total":3,"approved":1,"stale":1,"pending":1,"allApproved":false}' && JSON.stringify(ap[3]) === '{"total":3,"approved":3,"stale":0,"pending":0,"allApproved":true}'
      && JSON.stringify(ap[4]) === '{"total":3,"approved":0,"stale":3,"pending":0,"allApproved":false}', JSON.stringify(ap));

    // brief with a product
    M(`var pstate = key => { const st = kstate(key); st.product = parseProductSheet(SHEET, 'x').product; st.productApprovals = {}; return st; };`);
    const withP = M(`(() => { const st = pstate('dystopian-luxury'); const o = { surface: 'app', target: 'web', noProbe: true, kitSnap: kitDL };
      const pend = buildAiBriefChecked(st, o);
      const sc = st.product.screens[0]; st.productApprovals = { home: { status: 'approved', note: '', sig: productScreenSig(st, sc), at: 'x' } };
      const ok = buildAiBriefChecked(st, o);
      return { pend: pend.md, pi: pend.issues, oi: ok.issues, web: buildAiBrief(st, { surface: 'web', target: 'web', noProbe: true }), comps: buildAiBrief(st, Object.assign({ comps: true }, o)) }; })()`);
    const md = withP.pend;
    check('product: the App brief with a product has a Guided Product screens section, no Built screens or Screen layouts, and the product header',
      /\n## Product screens \(Guided\)\n/.test(md) && !/## Built screens|## Screen layouts|Built screens/.test(md) && /\nProduct: Signl\. Fast mental math/.test(md)
      && /### Home\n- Job: Show I'm improving/.test(md) && /  1\. Hero numeral "1,482", labelled "Arithmetic rating", with "\+60 this week"\./.test(md)
      && /Fold budget: Rating, Start and Daily/.test(md) && /Signature placement: tab bar\./.test(md) && /  - Error: none\./.test(md) && /comps are viewable in Branding Designer only|Comps of these screens are viewable in Branding Designer only/.test(md) && !/comps\/home-light/.test(md)
      && /comps\/home-light\.png, comps\/home-dark\.png/.test(withP.comps) && !/## Product screens/.test(withP.web), md.slice(md.indexOf('## Product screens') - 20, md.indexOf('## Product screens') + 400));
    check('product: lint adds unapproved-screens (N of M approved) until every screen is approved',
      withP.pi.some(i => i.code === 'unapproved-screens' && i.section === 'Product screens' && i.message === 'Approve every product screen first (0 of 1 approved)') && !withP.oi.some(i => i.code === 'unapproved-screens'), JSON.stringify(withP.pi.map(i => i.code)));
    mc.SAMPLE_SECTION = md.slice(md.indexOf('## Product screens'), md.indexOf('\n## ', md.indexOf('## Product screens') + 5));

    // zip: comps from ProductScreens.compPng, or none
    pendingChecks.push((async () => {
      const run2 = async (withPS, reject) => {
        mc.window.ProductScreens = withPS ? { compPng: (st, id, mode) => (reject ? Promise.reject(new Error('no')) : Promise.resolve(new Uint8Array([137, 80, id.length, mode.length]))) } : undefined;
        const files = await M(`aibFiles(pstate('dystopian-luxury'), { surface: 'app', target: 'web', noProbe: true, kitSnap: kitDL })`);
        return files.map(f => f.name);
      };
      const a = await run2(true, false), b = await run2(false), c = await run2(true, true);
      check('product: the zip carries comps/<id>-light.png and -dark.png; without compPng, or when it rejects, no comps',
        a.includes('comps/home-light.png') && a.includes('comps/home-dark.png') && !b.some(n => /^comps\//.test(n)) && !c.some(n => /^comps\//.test(n)) && a.includes('BRIEF.md'), JSON.stringify([a, b, c]));
    })().catch(e => check('product: the zip carries comps', false, e.stack)));
  }
  check('kit: the App brief has the "How … shows up in the app" signature', /### How Dystopian Luxury shows up in the app\n- Corners: /.test(dl) && /### How Pirate Broadcast shows up in the app/.test(pb), dl.slice(0, 1500));
  check('kit: the App brief pastes a full :root token block with `color-scheme: light` and a dark block', /```css\n:root \{\n  color-scheme: light;\n  --canvas: #[0-9a-f]{6};/.test(dl) && /:root\[data-theme="dark"\] \{\n  color-scheme: dark;/.test(dl), (dl.match(/## Tokens \(CSS\)[\s\S]*/) || [''])[0].slice(0, 600));
  check('kit: App briefs never point at tokens.css or a full-bleed hero', !/tokens\.css|full-bleed hero/.test(dl + pb + dlStatic), 'tokens.css / full-bleed hero');
  const pDL = rowOf(dl, 'Primary button'), pPB = rowOf(pb, 'Primary button');
  check('kit: measured primary button rows differ between Dystopian Luxury and Pirate Broadcast',
    pDL && pPB && pDL !== pPB && /\| --ab-dl-ink \|/.test(pDL) && /a 6pt --primary square, before the text/.test(pDL) && /pressed: fill --canvas/.test(pDL) && /\| --ab-tt-green \|/.test(pPB) && /uppercase, tracking \+0\.1em/.test(pPB), pDL + '\n' + pPB);
  check('kit: measured rows name the corner set, the shadow and the card surface as drawn',
    /square corners/.test(pDL) && /top 1pt solid --ink at 16%|top 1pt solid --ab-dl-hair/.test(rowOf(dl, 'Card')) && /a 2pt --ab-tt-line ring outside the edge/.test(rowOf(pb, 'Card')) && /fine horizontal lines of --ab-tt-scan every 1pt/.test(rowOf(pb, 'Card')), rowOf(dl, 'Card') + '\n' + rowOf(pb, 'Card'));
  check('kit: an App brief with a measured kit drops the board recipes and the generic press and pressed lines',
    !/## Shape and materials/.test(dl) && !/- \*\*Crop strip\*\*/.test(dl) && !/- Press: /.test(dl) && /\| Pressed and disabled \| as each UI kit row states/.test(dl) && !/One primary-filled action per view/.test(dl), dl.match(/## States[\s\S]*?\n\n/)[0]);
  check('kit: App briefs carry phone chrome, the spacing scale with 28, the icon spec and screen density',
    /status bar takes 54pt/.test(dl) && /home indicator 34pt/.test(dl) && /top bar is 44pt/.test(dl) && /4, 8, 12, 16, 20, 24, 28, 32/.test(dl) && /16pt chevron icon/.test(dl) && /at least 6 rows/.test(dl) && /Settings is a tab/.test(dl), 'phone');
  check('kit: no raw CSS leaks into the App brief outside its code blocks',
    !/linear-gradient\(|clip-path|polygon\(|counter\(|::before|::after|\d+\.\d+x\d/.test((dl + pb).replace(/```[\s\S]*?```/g, '')), (dl + pb).replace(/```[\s\S]*?```/g, '').match(/.{0,60}(linear-gradient\(|clip-path|::before|::after).{0,40}/) || 'clean');
  check('kit: shadows and textures are described in words', /a 2pt --ab-tt-line ring outside the edge/.test(pb) && /fine horizontal lines of/.test(pb), 'words');
  const pairName = M(`(() => { const c = aibContext(kstate('dystopian-luxury'), { surface: 'app', target: 'web', noProbe: true }); const n = aibKitNamer(c);
    const card = n('rgb(255, 255, 255)|rgb(47, 53, 43)', 'card'); const v = c.kitVars[card];
    const ink = n(c.rows.find(r => r.token === '--ink').get(c.modes[0]) + '|' + c.rows.find(r => r.token === '--ink').get(c.modes[1]), 'x');
    return [card, v ? v.get({ mode: 'light' }) + '/' + v.get({ mode: 'dark' }) : '', ink].join('|'); })()`);
  check('kit: a colour measured in light and dark is named only by a token matching both (else a kit token with both values)',
    /^--kit-card\|#ffffff\/#2f352b\|--ink$/.test(pairName), pairName);
  check('kit: pseudo-element text is read with counters as N, and arrows are named by shape',
    M(`aibPseudoText('"ITEM " counter(sb-item, decimal-leading-zero) "  /  2026.114." counter(sb-item)')`) === 'ITEM N  /  2026.114.N' && M(`AIB_GLYPH_NAME['↗']`) === 'an up-right diagonal arrow' && !M(`AIB_ARROW_GLYPH.test('>')`), 'pseudo text');
  const cssBlock = (dl.match(/```css\n([\s\S]*?)```/) || ['', ''])[1];
  const undef = (cssBlock.match(/var\((--[a-z0-9-]+)\)/g) || []).map(v => v.slice(4, -1)).filter(k => cssBlock.indexOf(k + ':') < 0);
  check('kit: every var() in the App token block is defined in it', undef.length === 0, undef.join(', '));
  check('kit: App briefs state no zero sizes ("0pt", "0x0pt")', !/\b0pt\b|0x0pt/.test((dl + pb).replace(/```[\s\S]*?```/g, '')), ((dl + pb).match(/.{30}(\b0pt\b|0x0pt).{20}/) || ['none'])[0]);
  check('kit: a knob moved right of centre reads "at the right"', /at the right$/.test(M(`aibPlace({ pos: 'absolute', at: [2, 22, null, 2], w: 27, h: 27, tf: 'matrix(1, 0, 0, 1, 20, 0)' }, { w: 51, h: 31 }, '::before')`)), M(`aibPlace({ pos: 'absolute', at: [2, 22, null, 2], w: 27, h: 27, tf: 'matrix(1, 0, 0, 1, 20, 0)' }, { w: 51, h: 31 }, '::before')`));
  check('kit: without a page to measure in, the App brief keeps the generic rows and says so in one line',
    /These are the generic kit rows/.test(dlStatic) && !/### How Dystopian Luxury shows up/.test(dlStatic) && !/These are the generic kit rows/.test(dl), 'static');
  check('kit: the Website brief keeps its sections and gets no kit measurement', !/### How /.test(dlWeb) && /## Components/.test(dlWeb) && !/These are the generic kit rows/.test(dlWeb), 'web');
  check('kit: pattern placement is quiet section backgrounds, never a full-bleed hero',
    M('AIB_USE_SHORT.hero') === 'Patterns only as quiet section backgrounds; never a full-bleed hero' && /^Patterns only as quiet section backgrounds; never a full-bleed hero/.test(M('AIB_USE_RULES.hero.rule')), M('AIB_USE_SHORT.hero'));
  check('blend: borrowed art is board and deck only, never on the website or in app screens',
    /never on the website or in app screens/.test(fs.readFileSync(path.join(root, 'js/blend.js'), 'utf8')) && !/landing page hero; never in app screens/.test(fs.readFileSync(path.join(root, 'js/blend.js'), 'utf8')), 'blend.js');
  // Tiers, header wording and Why this works in the real briefs.
  const heads = md => md.split('\n').filter(l => /^## /.test(l));
  const noTier = [dl, pb, dlStatic, dlWeb].map(md => heads(md).filter(h => !/\((?:Locked|Guided|Free)\)$/.test(h))).reduce((a, b) => a.concat(b), []);
  check('brief: every ## heading ends with (Locked), (Guided) or (Free)', noTier.length === 0 && /^## Colors \(Locked\)$/m.test(dl) && /^## Screen layouts \(Free\)$/m.test(dl) && /^## App UI rules \(Guided\)$/m.test(dl), noTier.join(' | '));
  check('brief: the header names the tiers and no longer says "invent nothing" or "Every value is final"',
    !/invent nothing|Every value is final/i.test(dl + pb + dlStatic + dlWeb) && /Sections are marked Locked, Guided or Free\. Locked values are final/.test(dl) && /Free means design it for this product: layout, screen structure and how many sections a screen has\./.test(dlWeb), dl.slice(0, 700));
  const built = M('aibSecBuilt.toString()').replace(/\\'/g, "'");
  check('brief: Built screens are a sample composition, not a spec of the product\'s screens', /sample composition/.test(built) && /not the sample app's content, screen list or exact positions/.test(built) && !/Build these two screens to match/.test(built), 'aibSecBuilt');
  check('why: no section while the principles are absent', !/Why this works/.test(dl) && !/Why this works/.test(dlWeb), 'absent');
  M(`window.AESTHETIC_PRINCIPLES = { 'dystopian-luxury': { principles: [{ rule: 'Let ink carry the weight.', board: 'Black blocks on bone.', app: 'The primary is an ink block with a lime \`--primary\` square.' }], traps: [{ element: 'The poster collage', instead: 'Leave it out.' }, { element: 'Marquee text', instead: 'Use a plain caption.' }] } }`);
  const withWhy = M(`[buildAiBrief(kstate('dystopian-luxury'), { surface: 'app', target: 'web', noProbe: true, kitSnap: kitDL }), buildAiBrief(kstate('dystopian-luxury'), { surface: 'web', target: 'web', noProbe: true }), buildAiBrief(kstate('pirate-broadcast'), { surface: 'app', target: 'web', noProbe: true, kitSnap: kitPB })]`);
  check('why: with data, an App brief has the section after the App UI rules and before Colors, in the stated format',
    /## App UI rules \(Guided\)[\s\S]*\n## Why this works \(Guided\)\n[^\n]*\n\n1\. \*\*Let ink carry the weight\.\*\* On the board: Black blocks on bone\. In the app: The primary is an ink block with a lime `--primary` square\.\n\nLiteral traps — board elements that do not reach the app as drawn:\n- The poster collage: Leave it out\.\n- Marquee text: Use a plain caption\.\n\n## Colors/.test(withWhy[0]), (withWhy[0].match(/## Why this works[\s\S]{0,500}/) || ['none'])[0]);
  check('why: a Website brief and an aesthetic without data have no section', !/Why this works/.test(withWhy[1]) && !/Why this works/.test(withWhy[2]), 'omitted');
  M(`delete window.AESTHETIC_PRINCIPLES`);
  // The lint on the real briefs runs without error and returns plain-English issues with a section.
  const realLint = M(`JSON.stringify([aiBriefLint(kstate('dystopian-luxury'), { surface: 'app', target: 'web', noProbe: true, kitSnap: kitDL }), aiBriefLint(kstate('pirate-broadcast'), { surface: 'both', target: 'both', noProbe: true })])`);
  check('lint: aiBriefLint builds its own context and returns issues shaped { code, section, message }', JSON.parse(realLint).every(list => Array.isArray(list) && list.every(i => i.code && i.section && i.message)), realLint.slice(0, 400));

}

/* ---- AI brief: tiers, Why this works and the lint (js/ai-brief.js) ---- */

{
  const lc = vm.createContext({ console, window: {}, localStorage: { getItem: () => null, setItem() {} } });
  for (const f of ['js/color.js', 'js/ui-kit.js', 'js/ai-brief.js']) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), lc, { filename: f });
  const L = code => vm.runInContext(code, lc);
  // Why this works: the formatter is pure, so a fixture object stands in for js/aesthetic-principles.js.
  L(`var fx = [{ name: 'Soft Form', principles: [
      { rule: 'Give every control one material.', board: 'Fields are recessed, buttons raised', app: '\`--primary\` fills one button per screen.' },
      { rule: 'Keep one big type step.', board: 'A large headline.', app: 'Large title 34pt.' }],
    traps: [{ element: 'The hero art.', instead: 'Leave it out.' }, { element: 'Glass card', instead: 'Use a raised card.' }] }];`);
  const one = L(`aibWhyLines(fx).join('\\n')`);
  check('why: heading, numbered "rule / On the board / In the app" lines, and the traps list',
    /^## Why this works\n/.test(one) && /\n1\. \*\*Give every control one material\.\*\* On the board: Fields are recessed, buttons raised\. In the app: `--primary` fills one button per screen\.\n2\. \*\*Keep one big type step\.\*\* On the board: A large headline\. In the app: Large title 34pt\./.test(one)
    && /\nLiteral traps — board elements that do not reach the app as drawn:\n- The hero art: Leave it out\.\n- Glass card: Use a raised card\.$/.test(one) && !/### /.test(one), one);
  const two = L(`aibWhyLines(fx.concat([{ name: 'Liquid Glass', principles: [{ rule: 'R', board: 'b', app: 'a' }], traps: [] }])).join('\\n')`);
  check('why: two aesthetics get a sub-heading each; no traps means no traps line', /### Soft Form\n1\./.test(two) && /### Liquid Glass\n1\. \*\*R\*\* On the board: b\. In the app: a\.$/.test(two) && (two.match(/Literal traps/g) || []).length === 1, two);
  check('why: nothing to say renders nothing', L(`aibWhyLines([]).length + aibWhyLines(null).length`) === 0, 'empty');
  check('why: a SwiftUI-only brief gets Palette. names through the token mapper', /Palette\.primary/.test(L(`aibWhyLines(fx, aibSwiftTok).join('\\n')`)), 'tok');
  const look = L(`(() => {
    const ctx = { def: { key: 'soft-form', name: 'Soft Form' }, key: 'soft-form' };
    const none = aibPrinciplesFor(ctx).length;               // no global at all
    window.AESTHETIC_PRINCIPLES = { 'soft-form': { principles: [{ rule: 'R', board: 'b', app: 'a' }], traps: [{ element: 'e', instead: 'i' }] }, 'liquid-glass': { principles: [{ rule: 'Q', board: 'b', app: 'a' }], traps: [] } };
    const base = aibPrinciplesFor(ctx).map(e => e.name).join();
    const miss = aibPrinciplesFor({ def: { key: 'raw-brutalist', name: 'Raw' }, key: 'raw-brutalist' }).length;   // key not in the data
    const blend = aibPrinciplesFor({ def: { key: 'soft-form', name: 'Soft Form', blend: { base: { key: 'soft-form', name: 'Soft Form' }, donor: { key: 'liquid-glass', name: 'Liquid Glass' } } }, key: 'soft-form' }).map(e => e.name).join();
    const web = aibSecWhy({ app: false, def: ctx.def, key: 'soft-form' }).length;
    delete window.AESTHETIC_PRINCIPLES;
    return [none, base, miss, blend, web].join('|');
  })()`);
  check('why: a missing global or key renders nothing; a blend adds the donor; a website-only brief has no section', look === '0|Soft Form|0|Soft Form,Liquid Glass|0', look);
  check('tiers: headings take their tier; "Blend: X" follows Blend; unlisted sections are Guided',
    L(`[aibTierHeading('## Colors'), aibTierHeading('## Screen layouts'), aibTierHeading('## Blend: A × B'), aibTierHeading('## Something new'), aibTierHeading('## Colors (Locked)'), aibTierHeading('### Sub')].join('|')`)
    === '## Colors (Locked)|## Screen layouts (Free)|## Blend: A × B (Guided)|## Something new (Guided)|## Colors (Locked)|### Sub', 'tiers');

  // aibLint on synthetic input: one fixture per check, and a clean brief.
  L(`var lint = (over, md) => { const ctx = Object.assign({ app: true, swiftOnly: false, modes: [{ mode: 'light' }, { mode: 'dark' }], rows: [
      { token: '--canvas', get: m => (m.mode === 'light' ? '#ffffff' : '#111111'), job: '', on: [['--ink', m => (m.mode === 'light' ? '#222222' : '#eeeeee')]] },
      { token: '--ink', get: m => (m.mode === 'light' ? '#222222' : '#eeeeee'), job: '', on: [] },
      { token: '--primary', get: m => (m.mode === 'light' ? '#2255cc' : '#6688ee'), job: '', on: [['--on-primary', m => (m.mode === 'light' ? '#ffffff' : '#101010')]] },
      { token: '--on-primary', get: m => (m.mode === 'light' ? '#ffffff' : '#101010'), job: '', on: [] },
      { token: '--accent-ink', get: m => (m.mode === 'light' ? '#996600' : '#ffcc66'), job: '', on: [] }] }, over); return aibLint(ctx, md); };
    var table = (rows) => '## Components (Locked)\\n| Element | Fill | Text | Edge |\\n| --- | --- | --- | --- |\\n' + rows + '\\n';
    var okMd = '# Brief\\nIntro.\\n\\n## Colors (Locked)\\nUse \`--primary\` and \`--ink\`.\\n\\n' + table('| Primary button | \`--primary\` | \`--on-primary\` | none |\\n| Card | \`--canvas\` | \`--ink\` | 1px |') +
      '\\n## Do and don\\'t (Guided)\\n- Do: Keep the surface calm.\\n- Don\\'t: Use stock red.\\n\\n## Shape and materials (Locked)\\n- **Card**: border: 1px solid var(--ink);\\n\\n## Tokens (CSS) (Locked)\\n\`\`\`css\\n:root { --canvas: #fff; --ink: #222; --primary: #25c; --on-primary: #fff; background: linear-gradient(135deg, #ff0000, #0000ff); }\\n\`\`\`\\n';`);
  const clean = L(`JSON.stringify(lint({}, okMd))`);
  check('lint: a consistent brief has no issues', clean === '[]', clean);
  const bad = (over, md) => JSON.parse(L(`JSON.stringify(lint(${over}, ${md}))`));
  const c1 = bad(`{ rows: [{ token: '--muted', get: () => '#cccccc', job: '', on: [] }, { token: '--canvas', get: () => '#ffffff', job: '', on: [['--muted', () => '#aaaaaa']] }, { token: '--accent-ink', get: () => '#eeeeaa', job: '', on: [] }] }`, 'okMd');
  check('lint: a stated text-on-fill pair under 4.5:1 is flagged in each mode; accent-ink under 3:1 too',
    c1.filter(i => i.code === 'contrast' && /`--muted` text \(#aaaaaa\) on `--canvas`/.test(i.message)).length === 2 && c1.some(i => /accent-ink/.test(i.message) && /needs 3:1/.test(i.message)) && c1.every(i => i.section && i.message), JSON.stringify(c1));
  const c2 = bad(`{}`, `okMd.replace('| Card | \`--canvas\` | \`--ink\` | 1px |', '| Card | \`--primary\` | \`--ink\` | 1px |')`);
  check('lint: a component Fill/Text pair under 4.5:1 is flagged in each mode', c2.filter(i => i.code === 'contrast' && /^Card: `--ink` text .* on a `--primary` fill/.test(i.message)).length === 2 && c2.every(i => i.section === 'Components'), JSON.stringify(c2));
  const c3 = bad(`{ rows: [{ token: '--canvas', get: m => (m.mode === 'light' ? '#ffffff' : '#111111'), job: '', on: [] }, { token: '--primary', get: m => (m.mode === 'light' ? '#2255cc' : '#121212'), job: '', on: [] }, { token: '--on-primary', get: () => '#ffffff', job: '', on: [] }] }`, 'okMd');
  check('lint: a filled primary action that matches the canvas is flagged (black on black in dark mode); an edge excuses it',
    c3.length === 1 && c3[0].code === 'primary-on-canvas' && /dark mode/.test(c3[0].message) && !/light mode/.test(c3[0].message)
    && bad(`{ rows: [{ token: '--canvas', get: () => '#111111', job: '', on: [] }, { token: '--primary', get: () => '#121212', job: '', on: [] }, { token: '--on-primary', get: () => '#ffffff', job: '', on: [] }] }`, `okMd.replace('| Primary button | \`--primary\` | \`--on-primary\` | none |', '| Primary button | \`--primary\` | \`--on-primary\` | 1px solid --ink |')`).length === 0, JSON.stringify(c3));
  const c4 = bad(`{}`, `okMd.replace('- Do: Keep the surface calm.', '- Do: Use no shadows anywhere on the surface.').replace('- **Card**: border: 1px solid var(--ink);', '- **Card**: box-shadow: 0 8px 24px rgba(0,0,0,0.2);')`);
  check('lint: a "no shadows" rule against a box-shadow recipe is flagged; box-shadow: none and a 0-blur ring are not',
    c4.length === 1 && c4[0].code === 'recipe-vs-prose' && /shadow/.test(c4[0].message)
    && bad(`{}`, `okMd.replace('- Do: Keep the surface calm.', '- Do: Use no shadows anywhere.').replace('border: 1px solid var(--ink);', 'box-shadow: none; box-shadow: 0 0 0 1px var(--ink);')`).length === 0
    && bad(`{}`, `okMd.replace('- Do: Keep the surface calm.', '- Do: Use no shadows anywhere.').replace('border: 1px solid var(--ink);', 'box-shadow: 0 0 0 1px var(--ink);')`).length === 0, JSON.stringify(c4));
  const c5 = bad(`{}`, `okMd.replace('- Do: Keep the surface calm.', '- Do: Never use gradients; keep fills flat.')`);
  check('lint: a "no gradients" rule against a gradient in the tokens is flagged', c5.length === 1 && c5[0].code === 'recipe-vs-prose' && /gradient/.test(c5[0].message), JSON.stringify(c5));
  const c6 = bad(`{}`, `okMd.replace('Use \`--primary\` and \`--ink\`.', 'Use \`--primary\` and \`--brand-glow\`.')`);
  check('lint: a --token named in the text with no value is flagged; --on-* and a defined token are not', c6.length === 1 && c6[0].code === 'undefined-token' && /--brand-glow/.test(c6[0].message)
    && bad(`{}`, `okMd.replace('Use \`--primary\` and \`--ink\`.', 'Use \`--primary\`, \`--ink\` and the \`--on-*\` token.')`).length === 0, JSON.stringify(c6));
  const c7 = bad(`{}`, `okMd.replace('#ff0000, #0000ff', '#ff0000, #FF0000')`);
  check('lint: a gradient whose stops are all one colour is flagged; a sized single-colour line is not',
    c7.length === 1 && c7[0].code === 'flat-gradient'
    && bad(`{}`, `okMd.replace('linear-gradient(135deg, #ff0000, #0000ff);', 'linear-gradient(var(--ink),var(--ink)) center / 100% 1px no-repeat;')`).length === 0, JSON.stringify(c7));
  // --ab-* names resolve to the Colors tokens: the aesthetic's own canvas (or a panel equal to it) is --canvas.
  const cf = JSON.parse(L(`JSON.stringify([
    aibCardFill({ cardFill: '--ab-canvas' }, { canvas: '#112233' }, {}),
    aibCardFill({ cardFill: '--ab-panel' }, { canvas: '#F4F1E8' }, { '--ab-panel': '#f4f1e8' }),
    aibCardFill({ cardFill: '--ab-sheet' }, { canvas: '#D9D4C4' }, { '--ab-sheet': '#E9E3D0' })])`));
  check('brief: a card fill that is the canvas under another name is written --canvas; a real paper keeps its token and value', cf[0] === '--canvas' && cf[1] === '--canvas' && cf[2] === '--ab-sheet (#E9E3D0)', JSON.stringify(cf));
  // --card-ink / --card-muted: defined where --ink does not read on the card ground, from the aesthetic or the most readable colour.
  const ci = JSON.parse(L(`JSON.stringify((() => {
    const mk = (mode, ink, canvas, extras) => ({ mode, t: { ink, canvas, muted: ink, mix: (a, b, k) => a }, extras });
    const def = { cardFill: '--ab-sheet', cardInk: { ink: { light: '--ab-sheet-ink', dark: '--ab-sheet-ink' }, muted: { light: '#4a463b', dark: '#4a463b' } } };
    const ex = { '--ab-sheet': '#E9E3D0', '--ab-sheet-ink': '#0d0d0d' };
    const dark = mk('dark', '#f6f5f9', '#0b0b0c', ex), light = mk('light', '#1b1b1f', '#D9D4C4', ex);
    return { needs: aibNeedsCardInk(def, [light, dark]), dark: aibCardInkValue(def, dark), light: aibCardInkValue(def, light),
      plain: aibNeedsCardInk({ cardFill: '--ab-sheet' }, [mk('light', '#1b1b1f', '#D9D4C4', ex)]), fb: aibCardInkValue({ cardFill: '--ab-sheet' }, dark) };
  })())`));
  check('brief: card ink is defined when --ink fails on the card ground, from the aesthetic data, else the most readable colour',
    ci.needs === true && ci.plain === false && ci.dark.ink === '#0d0d0d' && ci.dark.muted === '#4a463b' && ci.fb.ink === '#000000', JSON.stringify(ci));
  check('lint: the confirm text counts the problems and ends with the question',
    /^This brief has 2 problems an agent would have to guess at:\n\n- a\n- b\n\nExport anyway\?$/.test(L(`aibLintMessage([{ message: 'a' }, { message: 'b' }])`)) && L(`aibLintConfirm([])`) === true, 'confirm');
}

// Not run here (they need a real DOM): that blended tokens(t, state) see the view's fonts end to end, and the
// render timings. They are covered by the in-browser sweeps in docs/round6/.

Promise.all(pendingChecks).then(() => {
  console.log(failed ? `\n${failed} failed` : '\nall passed');
  process.exit(failed ? 1 : 0);
});
