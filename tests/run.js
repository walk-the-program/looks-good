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
  const bc = vm.createContext({ console });
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
  const bc = vm.createContext({ console });
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
    const st = { headingFont: FONTS[0], bodyFont: FONTS[1], scheme: 'analogous', hue: 210, colors: generatePalette('analogous', 210), shapePreset: SHAPE_PRESETS[0],
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

// Not run here (they need a real DOM): that blended tokens(t, state) see the view's fonts end to end, and the
// render timings. They are covered by the in-browser sweeps in docs/round6/.

console.log(failed ? `\n${failed} failed` : '\nall passed');
process.exit(failed ? 1 : 0);
