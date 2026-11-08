/* ---------------------------------------------------------------------
   studio-simple.js — the studio editor's Simple view, as pure logic (no DOM, no storage).

   A person with no design-system knowledge picks paper, surface, corners, lines, type feel, touches, art and words.
   Every control is a spec -> spec function over the same aesthetic spec (spec 2) the full panels edit: nothing here
   adds a field to the file, and an agent that edits the JSON never needs this module.

   Loads as a plain script before js/studio.js (window.StudioSimple); also require()-able in node.

     ctx = { catalog, sources, customs, fonts }
       catalog  SPEC_LAB.catalog() (array of moves)
       sources  { blank, 'soft-form--moves', 'acid-graphics--moves', 'editorial-serif--moves', darkroom } -> spec  (the Surface presets)
       customs  [{ key, name, spec }]  the person's other styles ("Same as one of my styles")
       fonts    FONTS from js/data.js ({ name, cls, ... })

     read(id, spec, ctx)            -> the current option id, or 'custom' (set some other way), or null (not set)
     apply(id, spec, value, ctx)    -> a NEW spec (inputs are never mutated); auto text follows the choice
     controls ids: paper surface corners lines headFeel bodyFeel labels spacing art   (touches: touchesOn / setTouch)
     autoText(spec, ctx)            -> { 'descriptor': text, 'build.surface': text, ... } what Simple would write now
     refreshAuto(before, after, ctx, { force })
                                    -> after, with every auto field that was empty or equal to autoText(before) rewritten.
                                       `force` rewrites them all (a brand-new style made from a starter).
------------------------------------------------------------------------ */
(function () {
  'use strict';

  const isObj = v => !!v && typeof v === 'object' && !Array.isArray(v);
  const clone = v => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));
  const arr = v => (Array.isArray(v) ? v : []);
  const str = v => (typeof v === 'string' ? v : '');
  const sortKeys = v => (Array.isArray(v) ? v.map(sortKeys) : isObj(v) ? Object.keys(v).sort().reduce((o, k) => { o[k] = sortKeys(v[k]); return o; }, {}) : v);
  const canon = v => JSON.stringify(sortKeys(v));
  const same = (a, b) => canon(a) === canon(b);
  const HEX = /^#[0-9a-f]{6}$/i;
  const lc = s => String(s).toLowerCase();

  /* ---------------------------------------------------------------- colour helpers */
  function hexToHsl(hex) {
    const n = parseInt(hex.slice(1), 16), r = (n >> 16 & 255) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
    let h = 0, s = 0;
    if (d) {
      s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
      h *= 60;
    }
    return { h, s, l };
  }
  function hslToHex({ h, s, l }) {
    const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    const x = v => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, '0');
    return '#' + x(f(0)) + x(f(8)) + x(f(4));
  }
  // The deep version of a paper colour: same hue, calmer, very dark, so dark mode stays readable.
  function deepOf(hex) {
    const { h, s } = hexToHsl(hex);
    if (s < 0.08) return '#131312';
    return hslToHex({ h, s: Math.min(s * 0.8, 0.3), l: 0.09 });
  }

  /* ---------------------------------------------------------------- catalog and entry helpers */
  const IDX = new WeakMap();
  function hooksOf(ctx) {
    const cat = (ctx && ctx.catalog) || [];
    if (IDX.has(cat)) return IDX.get(cat);
    const m = {};
    for (const x of cat) m[x.id] = arr(x.hooks).filter(h => h !== 'tokens');
    IDX.set(cat, m);
    return m;
  }
  const isCanvasMove = (id, ctx) => hooksOf(ctx)[id] && hooksOf(ctx)[id].includes('canvas');
  const listOf = (spec, name) => arr(spec[name]);
  function find(spec, id) {
    for (const l of ['colour', 'moves']) { const i = listOf(spec, l).findIndex(e => e && e.move === id); if (i >= 0) return { list: l, i, e: spec[l][i] }; }
    return null;
  }
  const has = (spec, id) => !!find(spec, id);
  function drop(spec, pred) {
    for (const l of ['colour', 'moves']) if (Array.isArray(spec[l])) spec[l] = spec[l].filter(e => !(e && pred(e)));
  }
  const dropIds = (spec, ids) => drop(spec, e => ids.includes(e.move));
  function put(spec, listName, move, params, scope) {
    const f = find(spec, move);
    if (f) { f.e.params = Object.assign(isObj(f.e.params) ? f.e.params : {}, params || {}); return f.e; }
    if (!Array.isArray(spec[listName])) spec[listName] = [];
    const e = { move, params: clone(params || {}) };
    if (scope) e.scope = scope;
    spec[listName].push(e);
    return e;
  }
  const plainNum = v => (typeof v === 'number' && isFinite(v) ? v : null);

  /* ---------------------------------------------------------------- the option tables */
  const PAPERS = [
    { id: 'white', name: 'White', word: 'White', phrase: 'white paper', light: '#ffffff' },
    { id: 'warm', name: 'Warm white', word: 'Warm', phrase: 'warm white paper', light: '#faf6ee' },
    { id: 'cream', name: 'Cream', word: 'Cream', phrase: 'cream paper', light: '#f3ead9' },
    { id: 'kraft', name: 'Kraft', word: 'Kraft', phrase: 'kraft paper', light: '#d8bd93' },
    { id: 'newsprint', name: 'Newsprint', word: 'Newsprint', phrase: 'newsprint', light: '#e6e1d2' },
    { id: 'cool', name: 'Cool grey', word: 'Cool', phrase: 'cool grey paper', light: '#e7eaee' },
    { id: 'ink', name: 'Ink black', word: 'Ink', phrase: 'ink-black paper', light: '#f2f1ee', dark: '#0e0e0d', mode: 'dark' },
  ];
  const BRAND_PAPER = { id: 'brand', name: 'Follow the brand colour', word: 'Brand-tinted', phrase: 'paper tinted from the brand colour' };
  const paperOf = id => PAPERS.find(p => p.id === id) || null;

  // Surface presets: a kit (all its components) from a source spec, plus the moves and colour recipes that kit's
  // materials need (their tokens). Canvas recipes are never taken: Paper owns the canvas.
  const SURFACES = [
    { id: 'print', name: 'Flat print', line: 'Hairline rules and flat ink. No shadows.', source: 'editorial-serif--moves',
      moves: ['kit-cell-frame', 'focus-ring'], colour: ['state-colour-derivation'], word: 'Printed', strip: 'Page',
      phrase: 'flat printed surfaces divided by hairline rules', mech: 'flat ink on stock, divided by hairline rules, with no shadows anywhere',
      surface: 'Flat fills divided by hairline rules; no shadows.', press: 'Hover swaps the key to ink and a press darkens it one step. Nothing moves and nothing casts a shadow.',
      do: 'Divide everything with hairline rules.', dont: 'Add drop shadows or glows.' },
    { id: 'outline', name: 'Outline and hard shadow', line: 'Ink borders and a hard offset shadow.', source: 'blank',
      moves: [], colour: [], word: 'Hard-edged', strip: 'Edge and shadow',
      phrase: 'ink-bordered surfaces with a hard offset shadow', mech: 'flat fills with an ink border and a hard offset shadow, no blur',
      surface: 'Flat fills with an ink border and a hard offset shadow (no blur).', press: 'The surface travels 4 px right and down as its hard shadow closes, 100 ms ease-out; release returns it.',
      do: 'Keep one border weight on every surface.', dont: 'Use blur shadows.' },
    { id: 'soft', name: 'Soft raised', line: 'Surfaces pressed up out of, or into, the page.', source: 'soft-form--moves',
      moves: ['kit-cell-frame', 'focus-ring', 'media-fallbacks', 'recessed-groups', 'material-discs', 'socketed-swatch', 'brand-mark-key', 'inline-fit-tags'], colour: ['relief-pair', 'muted-contrast-floor'], word: 'Soft', strip: 'Touch & depth',
      phrase: 'soft raised and recessed surfaces lit from the top left', mech: 'raised and recessed surfaces made from the page colour itself, lit from the top left',
      surface: 'Raised and recessed surfaces filled with the page colour; a paired dark and light shadow makes the form.', press: 'A raised control becomes recessed: its paired shadows swap to inset over 140 ms, ease-in-out. The light never moves.',
      do: 'Light every surface from the top left.', dont: 'Light surfaces from more than one direction.' },
    { id: 'blocks', name: 'Bold blocks', line: 'Two-colour blocks, tickets and hard edges.', source: 'acid-graphics--moves',
      moves: ['kit-cell-frame', 'focus-ring'], colour: ['pair-colour-tints', 'equal-luminance-clash', 'primary-reprint'], word: 'Blocky', strip: 'Blocks',
      phrase: 'two-colour blocks, tickets and hard edges', mech: 'two clashing colours that meet edge to edge in blocks, tickets and legend switches',
      surface: 'Two-colour blocks, tickets and legend switches with hard edges; the second colour is derived from the primary.', press: 'Hover flips and stretches the block and a press sinks it; the selected item switches to the second colour.',
      do: 'Let the colour blocks meet edge to edge.', dont: 'Soften the blocks with blur or gradients.' },
    { id: 'film', name: 'Film frame', line: 'Hairline frames and film-edge cards.', source: 'darkroom',
      moves: ['focus-ring'], colour: ['muted-contrast-floor'], word: 'Framed', strip: 'Frame and tray',
      phrase: 'hairline frames, film-edge cards and recessed trays', mech: 'hairline frames for holding things, film-edge cards and recessed trays for containers',
      surface: 'Hairline frames for holding things, film-edge cards and recessed trays for containers; no outer shadows.', press: 'Rest is a hairline frame; a press sinks it 1 px over 120 ms; the selected item is marked with a rule, not a fill.',
      do: 'Hold content in hairline frames and recessed trays.', dont: 'Put a glow or a blur shadow on a control.' },
  ];
  const surfaceOf = id => SURFACES.find(s => s.id === id) || null;
  const SURFACE_MOVES = Array.from(new Set(SURFACES.flatMap(s => s.moves)));
  const SURFACE_COLOUR = Array.from(new Set(SURFACES.flatMap(s => s.colour)));
  // What "Same as one of my styles" takes from the other style besides its kit: material, state and a11y moves, the
  // kit-support moves above, and its colour recipes that do not set the canvas.
  const SUPPORT_CATEGORIES = ['material', 'state', 'a11y'];

  const CORNERS = [
    { id: 'square', name: 'Square', base: 0, pill: false, phrase: 'square corners', say: 'square' },
    { id: 'slight', name: 'Slight', base: 4, pill: false, phrase: 'slightly rounded corners', say: 'slightly rounded' },
    { id: 'rounded', name: 'Rounded', base: 12, pill: false, phrase: 'rounded corners', say: 'rounded' },
    { id: 'pill', name: 'Pill', base: 12, pill: true, phrase: 'pill-shaped buttons and tags', say: 'rounded, with pill-shaped buttons and tags' },
  ];
  const LINES = [
    { id: 'none', name: 'None', phrase: 'no extra outlines', stroke: 1.5 },
    { id: 'hairline', name: 'Hairline', phrase: 'hairline rules', stroke: 1.5 },
    { id: 'bold', name: 'Bold', phrase: 'bold outlines', stroke: 2 },
    { id: 'heavy', name: 'Heavy', phrase: 'heavy outlines', stroke: 3 },
  ];
  const SPACINGS = [
    { id: 'tight', name: 'Tight', phrase: 'set tight' },
    { id: 'normal', name: 'Normal', phrase: 'set at normal spacing' },
    { id: 'loose', name: 'Loose', phrase: 'set loose' },
  ];
  const LABELS = [
    { id: 'mono', name: 'Mono caps', phrase: 'mono capitals', type: 'mono' },
    { id: 'sans', name: 'Sans', phrase: 'a plain sans', type: 'sans' },
    { id: 'serif', name: 'Serif', phrase: 'a serif', type: 'serif' },
  ];
  const CAPS_MOVES = ['caps-mono-labels', 'mono-ui-labels'];

  // Type feel = a font class. `avoid` lists the classes that would fight it.
  const FEELS = {
    heavy: { name: 'Heavy display', word: 'Heavy', say: 'heavy display', blurb: 'black-weight headlines that hold a page on their own', avoid: ['didone', 'script', 'groovy'] },
    condensed: { name: 'Condensed', word: 'Condensed', say: 'condensed', blurb: 'tall, narrow letters that stack tightly', avoid: ['didone', 'script', 'wide'] },
    wide: { name: 'Wide', word: 'Wide', say: 'wide', blurb: 'extended letters that read like signage', avoid: ['didone', 'script', 'condensed'] },
    'neo-grotesk': { name: 'Plain sans', word: 'Plain-sans', say: 'neutral sans', blurb: 'neutral, tight sans letters that stay out of the way', avoid: ['script', 'groovy', 'blackletter'] },
    grotesk: { name: 'Quirky sans', word: 'Quirky', say: 'quirky grotesque', blurb: 'grotesques with a little character', avoid: ['script', 'blackletter', 'pixel'] },
    geometric: { name: 'Geometric', word: 'Geometric', say: 'geometric sans', blurb: 'letters built from circles and squares', avoid: ['didone', 'script', 'blackletter'] },
    humanist: { name: 'Humanist', word: 'Humanist', say: 'humanist sans', blurb: 'warm sans letters with a calligraphic hand', avoid: ['techno', 'pixel', 'groovy'] },
    rounded: { name: 'Friendly rounded', word: 'Rounded', say: 'rounded', blurb: 'soft, rounded terminals', avoid: ['didone', 'techno', 'blackletter'] },
    didone: { name: 'High-contrast serif', word: 'Serif', say: 'high-contrast serif', blurb: 'thick and thin strokes with a magazine feel', avoid: ['rounded', 'techno', 'pixel', 'groovy'] },
    'text-serif': { name: 'Book serif', word: 'Bookish', say: 'book serif', blurb: 'sturdy serif letters made for reading', avoid: ['techno', 'pixel', 'groovy'] },
    'old-style': { name: 'Old-style serif', word: 'Old-style', say: 'old-style serif', blurb: 'classic serif letters with a calligraphic stress', avoid: ['techno', 'pixel', 'groovy'] },
    'soft-serif': { name: 'Soft serif', word: 'Soft-serif', say: 'soft serif', blurb: 'friendly display serifs with soft shapes', avoid: ['techno', 'pixel', 'condensed'] },
    slab: { name: 'Slab', word: 'Slab', say: 'slab serif', blurb: 'blocky slab serifs with a poster feel', avoid: ['didone', 'script', 'rounded'] },
    deco: { name: 'Deco', word: 'Deco', say: 'Art Deco', blurb: 'geometric capitals with a 1920s feel', avoid: ['rounded', 'pixel', 'groovy'] },
    techno: { name: 'Techno', word: 'Techno', say: 'techno', blurb: 'squared, sci-fi letters', avoid: ['didone', 'script', 'old-style'] },
    groovy: { name: 'Groovy', word: 'Groovy', say: 'groovy', blurb: 'fat 70s display letters', avoid: ['didone', 'techno', 'condensed'] },
    typewriter: { name: 'Typewriter', word: 'Typed', say: 'typewriter', blurb: 'slab letters with the feel of a typed page', avoid: ['didone', 'wide', 'rounded'] },
    mono: { name: 'Monospace', word: 'Mono', say: 'monospace', blurb: 'fixed-width letters like code', avoid: ['didone', 'script', 'groovy'] },
    hand: { name: 'Handwritten', word: 'Handwritten', say: 'handwritten', blurb: 'casual hand-lettered shapes', avoid: ['techno', 'blackletter', 'didone'] },
  };
  const HEAD_FEELS = ['heavy', 'condensed', 'wide', 'neo-grotesk', 'geometric', 'rounded', 'didone', 'soft-serif', 'slab', 'deco', 'techno', 'groovy', 'typewriter', 'hand'];
  const BODY_FEELS = ['neo-grotesk', 'grotesk', 'geometric', 'humanist', 'rounded', 'text-serif', 'old-style', 'slab', 'mono'];

  /* Touches: board-level details that look right with their default settings on any style and don't set a hook, so
     no touch can displace Paper, Art or another touch. Each is added with scope "board". */
  const TOUCHES = [
    { id: 'tear-line', group: 'Printed stock', name: 'Tear line', line: 'A dotted tear-off line with a small caption between sections.' },
    { id: 'stamped-label', group: 'Printed stock', name: 'Rubber stamp', line: 'The kicker looks stamped: a double frame, a slight tilt and worn ink.' },
    { id: 'swatch-keyline', group: 'Printed stock', name: 'Swatch outlines', line: 'Every colour chip gets a solid outline, so even a paper-coloured chip reads.' },
    { id: 'coupon-foot', group: 'Printed stock', name: 'Coupon strip', line: 'A perforated tear-off strip with a caps line closes the deck cover (see the Deck cover tab).' },
    { id: 'double-rule', group: 'Lines and frames', name: 'Double rule', line: 'A thick line over a thin one under the masthead, like a newspaper.' },
    { id: 'line-grid', group: 'Lines and frames', name: 'Grid lines', line: 'A faint 12-column grid shows through behind the layout.' },
    { id: 'ticker-strip', group: 'Lines and frames', name: 'Ticker strip', line: 'Repeating ticker text runs along the edges of the board.' },
    { id: 'barcode-serial', group: 'Numbers and marks', name: 'Barcode and serial', line: 'A barcode and a serial number sit under the label row.' },
    { id: 'catalogue-number', group: 'Numbers and marks', name: 'Catalogue numbers', line: 'A dateline on top and numbered plates, like a catalogue.' },
    { id: 'section-number-marker', group: 'Numbers and marks', name: 'Numbered sections', line: 'Each section label gets a small numeral in front of it.' },
    { id: 'highlight-underline', group: 'Headline', name: 'Underlined key word', line: 'The highlighted word in the headline gets an underline.' },
    { id: 'hanging-drop-cap', group: 'Headline', name: 'Drop cap', line: 'The first paragraph of long text starts with a large hanging capital.' },
  ];
  const TOUCH_GROUPS = Array.from(new Set(TOUCHES.map(t => t.group)));
  const touchOf = id => TOUCHES.find(t => t.id === id) || null;

  /* ---------------------------------------------------------------- Paper */
  function canvasEntries(spec, ctx) {
    const out = [];
    for (const l of ['colour', 'moves']) listOf(spec, l).forEach(e => { if (e && isCanvasMove(e.move, ctx)) out.push(e); });
    return out;
  }
  function readPaper(spec, ctx) {
    const es = canvasEntries(spec, ctx);
    if (!es.length) return null;
    if (es.length > 1) return 'custom';
    const e = es[0], p = isObj(e.params) ? e.params : {};
    if (e.move === 'tinted-neutral-canvas') return 'brand';
    if (e.move === 'warm-paper-canvas' && p.keep === 0 && p.warmDark === true && isObj(p.cream) && HEX.test(str(p.cream.light)) && HEX.test(str(p.cream.dark))) {
      const hit = PAPERS.find(x => lc(x.light) === lc(p.cream.light));
      return hit ? hit.id : 'color:' + lc(p.cream.light);
    }
    return 'custom';
  }
  function applyPaper(spec, value, ctx) {
    let recipe;
    const wasInk = readPaper(spec, ctx) === 'ink';
    if (value === 'brand') recipe = { move: 'tinted-neutral-canvas', params: { tint: 14, paperMix: 0.15 } };
    else {
      const p = paperOf(value);
      let light, dark;
      if (p) { light = p.light; dark = p.dark || deepOf(p.light); }
      else if (/^color:#[0-9a-f]{6}$/i.test(String(value))) { light = lc(value.slice(6)); dark = deepOf(light); }
      else return spec;
      recipe = { move: 'warm-paper-canvas', params: { cream: { light, dark }, keep: 0, warmDark: true } };
      if (p && p.mode) spec.mode = p.mode;
    }
    if (wasInk && !(paperOf(value) && paperOf(value).mode)) spec.mode = 'light';
    drop(spec, e => isCanvasMove(e.move, ctx));
    if (!Array.isArray(spec.colour)) spec.colour = [];
    spec.colour.unshift(recipe);
    return spec;
  }

  /* ---------------------------------------------------------------- Surface */
  const SIGS = new WeakMap();      // a kit is compared by its canonical text; the text is kept per kit object (edits make new objects)
  const kitSig = spec => {
    const k = spec && isObj(spec.kit) ? spec.kit : null;
    if (!k) return '{}';
    if (!SIGS.has(k)) SIGS.set(k, canon(k));
    return SIGS.get(k);
  };
  function readSurface(spec, ctx) {
    const k = kitSig(spec);
    const src = (ctx && ctx.sources) || {};
    for (const s of SURFACES) if (src[s.source] && kitSig(src[s.source]) === k) return s.id;
    for (const c of arr(ctx && ctx.customs)) if (c.spec && kitSig(c.spec) === k && c.spec.kit && Object.keys(c.spec.kit).length) return 'style:' + c.key;
    return Object.keys(spec.kit || {}).length ? 'custom' : null;
  }
  // The support entries a source spec brings with its kit.
  function supportOf(src, preset, ctx) {
    const moves = [], colour = [];
    const wantMove = e => (preset ? preset.moves.includes(e.move) : (SUPPORT_CATEGORIES.includes(catCat(e.move, ctx)) || SURFACE_MOVES.includes(e.move)));
    const wantColour = e => !isCanvasMove(e.move, ctx) && (preset ? preset.colour.includes(e.move) : true);
    for (const e of listOf(src, 'moves')) if (e && (isColourMove(e.move, ctx) ? wantColour(e) : wantMove(e))) moves.push(clone(e));
    for (const e of listOf(src, 'colour')) if (e && wantColour(e)) colour.push(clone(e));
    return { moves, colour };
  }
  function catCat(id, ctx) { const m = arr(ctx && ctx.catalog).find(x => x.id === id); return m ? m.category : ''; }
  const isColourMove = (id, ctx) => catCat(id, ctx) === 'colour';
  function applySurface(spec, value, ctx) {
    let src, preset = null, sup;
    if (String(value).startsWith('style:')) {
      const c = arr(ctx && ctx.customs).find(x => x.key === value.slice(6));
      if (!c || !c.spec || !isObj(c.spec.kit)) return spec;
      src = c.spec; sup = supportOf(src, null, ctx);
    } else {
      preset = surfaceOf(value);
      src = preset && ((ctx && ctx.sources) || {})[preset.source];
      if (!src || !isObj(src.kit)) return spec;
      sup = supportOf(src, preset, ctx);
    }
    // Remove every surface-support entry (so switching never piles them up), keep Paper and the touches.
    // Simple has no other colour control, so every non-canvas colour recipe belongs to the previous surface.
    const supportMoves = SURFACE_MOVES.concat(arr(ctx && ctx.catalog).filter(m => SUPPORT_CATEGORIES.includes(m.category)).map(m => m.id));
    drop(spec, e => !isCanvasMove(e.move, ctx) && (isColourMove(e.move, ctx) || supportMoves.includes(e.move)));
    spec.kit = clone(src.kit);
    spec.moves = arr(spec.moves).concat(sup.moves);
    spec.colour = arr(spec.colour).concat(sup.colour);
    if (isObj(src.build)) {
      spec.build = isObj(spec.build) ? spec.build : {};
      for (const k of ['cls', 'press', 'motion']) if (src.build[k] !== undefined) spec.build[k] = clone(src.build[k]);
    }
    return spec;
  }

  /* ---------------------------------------------------------------- Corners and lines */
  function readCorners(spec) {
    const f = find(spec, 'corner-radius');
    if (!f) return null;
    const p = isObj(f.e.params) ? f.e.params : {};
    const base = p.base === undefined ? 8 : plainNum(p.base);
    if (base === null || (p.pill !== undefined && typeof p.pill !== 'boolean')) return 'custom';
    if (p.pill === true) return 'pill';
    return base <= 1 ? 'square' : base <= 7 ? 'slight' : base <= 24 ? 'rounded' : 'custom';
  }
  function applyCorners(spec, value) {
    const c = CORNERS.find(x => x.id === value);
    if (!c) return spec;
    const e = put(spec, 'moves', 'corner-radius', {});
    e.params.base = c.base;
    if (c.pill) e.params.pill = true; else delete e.params.pill;
    return spec;
  }
  function readLines(spec) {
    const hb = find(spec, 'heavy-border'), hr = find(spec, 'hairline-rule');
    if (hb && hr) return 'custom';
    if (hb) { const w = hb.e.params && hb.e.params.width !== undefined ? plainNum(hb.e.params.width) : 3; return w === null ? 'custom' : w <= 3 ? 'bold' : 'heavy'; }
    if (hr) { const w = hr.e.params && hr.e.params.width !== undefined ? plainNum(hr.e.params.width) : 1; return w === null ? 'custom' : w <= 1.5 ? 'hairline' : 'custom'; }
    return 'none';
  }
  function applyLines(spec, value) {
    if (!LINES.some(x => x.id === value)) return spec;
    dropIds(spec, ['heavy-border', 'hairline-rule']);
    if (value === 'hairline') put(spec, 'moves', 'hairline-rule', { width: 1 });
    else if (value === 'bold') put(spec, 'moves', 'heavy-border', { width: 3 });
    else if (value === 'heavy') put(spec, 'moves', 'heavy-border', { width: 5 });
    return spec;
  }

  /* ---------------------------------------------------------------- Type */
  function fontsOf(spec) { return isObj(spec.meta) && isObj(spec.meta.fonts) ? spec.meta.fonts : null; }
  function readFeel(role, spec) {
    const f = fontsOf(spec);
    const cls = f && isObj(f[role]) ? arr(f[role].classes) : [];
    if (!cls.length) return null;
    const table = role === 'heading' ? HEAD_FEELS : BODY_FEELS;
    const hit = cls.find(c => table.includes(c));
    return hit || 'custom';
  }
  function ensureFonts(spec) {
    if (!isObj(spec.meta)) spec.meta = { family: 'graphic' };
    if (!isObj(spec.meta.fonts)) spec.meta.fonts = {};
    const f = spec.meta.fonts;
    for (const r of ['heading', 'body']) { if (!isObj(f[r])) f[r] = { picks: [] }; if (!Array.isArray(f[r].picks)) f[r].picks = []; }
    if (!Array.isArray(f.pairings)) f.pairings = [];
    return f;
  }
  function picksFor(cls, n, ctx) {
    const list = arr(ctx && ctx.fonts).filter(x => x && x.cls === cls).map(x => x.name);
    return list.slice(0, n);
  }
  function applyFeel(role, spec, value, ctx) {
    const table = role === 'heading' ? HEAD_FEELS : BODY_FEELS;
    if (!table.includes(value)) return spec;
    const f = ensureFonts(spec);
    f[role].classes = [value];
    const picks = picksFor(value, role === 'heading' ? 3 : 2, ctx);
    if (picks.length) f[role].picks = picks;
    const other = role === 'heading' ? 'body' : 'heading';
    const used = [value].concat(arr(f[other].classes));
    f.avoid = [];
    [value].concat(arr(f[other].classes)).forEach(c => (FEELS[c] ? FEELS[c].avoid : []).forEach(a => { if (!used.includes(a) && !f.avoid.includes(a)) f.avoid.push(a); }));
    const hp = f.heading.picks, bp = f.body.picks;
    const pairs = [];
    if (hp[0] && bp[0]) pairs.push([hp[0], bp[0]]);
    if (hp[1] && bp[0]) pairs.push([hp[1], bp[0]]);
    if (hp[0] && bp[1]) pairs.push([hp[0], bp[1]]);
    if (pairs.length) f.pairings = pairs;
    else if (!f.pairings.length) f.pairings = [['Inter', 'Inter']];
    return spec;
  }
  function readLabels(spec) {
    const t = isObj(spec.type) ? spec.type.label : undefined;
    const caps = CAPS_MOVES.some(id => has(spec, id));
    if (t === undefined && !caps) return null;
    if (t === 'mono' && has(spec, 'caps-mono-labels')) return 'mono';
    if ((t === 'sans' || t === 'serif') && !caps) return t;
    return 'custom';
  }
  function applyLabels(spec, value) {
    const l = LABELS.find(x => x.id === value);
    if (!l) return spec;
    if (!isObj(spec.type)) spec.type = {};
    spec.type.label = l.type;
    dropIds(spec, CAPS_MOVES);
    if (value === 'mono') put(spec, 'moves', 'caps-mono-labels', {});
    return spec;
  }
  function readSpacing(spec) {
    const f = find(spec, 'tight-display-tracking');
    if (!f) return 'normal';
    const p = isObj(f.e.params) ? f.e.params : {};
    const t = p.tracking === undefined ? -0.04 : plainNum(p.tracking);
    if (t === null) return 'custom';
    return t <= -0.02 ? 'tight' : t >= 0.01 ? 'loose' : 'custom';
  }
  function applySpacing(spec, value) {
    if (!SPACINGS.some(x => x.id === value)) return spec;
    dropIds(spec, ['tight-display-tracking']);
    if (value === 'tight') put(spec, 'moves', 'tight-display-tracking', { tracking: -0.04, leading: 0.95 });
    else if (value === 'loose') put(spec, 'moves', 'tight-display-tracking', { tracking: 0.02, leading: 1.15 });
    return spec;
  }

  /* ---------------------------------------------------------------- Art */
  function artGenerators(ctx) { return arr(ctx && ctx.catalog).filter(m => arr(m.hooks).includes('art') && m.category === 'art'); }
  function readArt(spec, ctx) {
    const hero = isObj(spec.art) ? spec.art.hero : null;
    if (!hero) return 'none';
    if (hero.kind === 'svg' || hero.kind === 'image') return 'upload';
    if (hero.kind === 'generator') return artGenerators(ctx).some(m => m.id === hero.move) ? hero.move : 'custom';
    return 'custom';
  }
  // 'none' | generator move id. ("upload" needs a file: the editor sets that through its art map.)
  function applyArt(spec, value, ctx) {
    if (value === 'none') { delete spec.art; return spec; }
    if (!artGenerators(ctx).some(m => m.id === value)) return spec;
    spec.art = Object.assign({}, isObj(spec.art) ? spec.art : {}, { hero: { kind: 'generator', move: value, params: {} } });
    return spec;
  }

  /* ---------------------------------------------------------------- Touches */
  const touchesOn = spec => TOUCHES.filter(t => has(spec, t.id)).map(t => t.id);
  function setTouch(spec, id, on, ctx) {
    if (!touchOf(id)) return spec;
    const next = clone(spec);
    dropIds(next, [id]);
    if (on) { if (!Array.isArray(next.moves)) next.moves = []; next.moves.push({ move: id, params: {}, scope: 'board' }); }
    return refreshAuto(spec, next, ctx);
  }

  /* ---------------------------------------------------------------- Words and basics */
  function setWords(spec, field, value, ctx) {
    if (field !== 'motto' && field !== 'kicker') return spec;
    spec = clone(spec);
    const before = spec[field];
    spec[field] = String(value);
    // the motto and kicker are also printed as specimen copy
    if (isObj(spec.copy) && isObj(spec.copy[field]) && spec.copy[field].text === before) spec.copy[field].text = spec[field];
    return spec;
  }
  function setMode(spec, mode, ctx) {
    if (mode !== 'light' && mode !== 'dark') return spec;
    const next = clone(spec);
    next.mode = mode;
    return refreshAuto(spec, next, ctx);
  }

  /* ---------------------------------------------------------------- the controls */
  const CONTROLS = {
    paper: { name: 'Paper', read: readPaper, apply: applyPaper },
    surface: { name: 'Surface', read: readSurface, apply: applySurface },
    corners: { name: 'Corners', read: readCorners, apply: applyCorners },
    lines: { name: 'Lines', read: readLines, apply: applyLines },
    headFeel: { name: 'Headline feel', read: (s) => readFeel('heading', s), apply: (s, v, c) => applyFeel('heading', s, v, c) },
    bodyFeel: { name: 'Body feel', read: (s) => readFeel('body', s), apply: (s, v, c) => applyFeel('body', s, v, c) },
    labels: { name: 'Labels', read: readLabels, apply: applyLabels },
    spacing: { name: 'Headline spacing', read: readSpacing, apply: applySpacing },
    art: { name: 'Art', read: readArt, apply: applyArt },
  };

  function read(id, spec, ctx) {
    const c = CONTROLS[id];
    return c ? c.read(spec || {}, ctx || {}) : null;
  }

  // The plain name of an option, for the change log ("paper: cream → kraft").
  function nameOf(id, value, ctx) {
    if (value === null || value === undefined) return 'default';
    if (value === 'custom') return 'custom';
    const t = { paper: () => (value === 'brand' ? BRAND_PAPER.name : String(value).startsWith('color:') ? 'custom colour ' + value.slice(6) : (paperOf(value) || {}).name),
      surface: () => (String(value).startsWith('style:') ? 'same as ' + (((arr(ctx && ctx.customs).find(c => c.key === value.slice(6))) || {}).name || value.slice(6)) : (surfaceOf(value) || {}).name),
      corners: () => (CORNERS.find(x => x.id === value) || {}).name,
      lines: () => (LINES.find(x => x.id === value) || {}).name,
      headFeel: () => (FEELS[value] || {}).name, bodyFeel: () => (FEELS[value] || {}).name,
      labels: () => (LABELS.find(x => x.id === value) || {}).name,
      spacing: () => (SPACINGS.find(x => x.id === value) || {}).name,
      art: () => (value === 'none' ? 'none' : value === 'upload' ? 'your own image' : value) };
    const n = t[id] && t[id]();
    return n ? lc(n) : String(value);
  }

  // The change-log line for one Simple edit: "paper: cream → kraft".
  function labelFor(id, beforeSpec, value, ctx) {
    const c = CONTROLS[id];
    if (!c) return id;
    const b = c.read(beforeSpec || {}, ctx || {});
    return `${lc(c.name)}: ${nameOf(id, b, ctx)} → ${nameOf(id, value, ctx)}`;
  }

  function apply(id, spec, value, ctx) {
    const c = CONTROLS[id];
    if (!c) return spec;
    const next = c.apply(clone(spec), value, ctx || {}) || spec;
    return refreshAuto(spec, next, ctx);
  }

  /* ---------------------------------------------------------------- auto text */
  const FEEL_WORD = id => (FEELS[id] ? FEELS[id].word : 'Custom');
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const join = (a, last) => (a.length <= 1 ? a.join('') : a.slice(0, -1).join(', ') + ' ' + (last || 'and') + ' ' + a[a.length - 1]);

  // Everything the Simple choices say about a spec, in plain words.
  function facts(spec, ctx) {
    const paper = readPaper(spec, ctx);
    const surf = readSurface(spec, ctx);
    const corners = readCorners(spec), lines = readLines(spec), spacing = readSpacing(spec), labels = readLabels(spec);
    const head = readFeel('heading', spec), body = readFeel('body', spec);
    const p = paper === 'brand' ? BRAND_PAPER : paperOf(paper);
    const preset = surfaceOf(surf);
    const other = String(surf).startsWith('style:') ? arr(ctx && ctx.customs).find(c => c.key === surf.slice(6)) : null;
    const f = fontsOf(spec) || {};
    return {
      paper, p, paperWord: p ? p.word : paper && paper.startsWith('color:') ? 'Coloured' : 'Plain',
      paperPhrase: p ? p.phrase : paper && paper.startsWith('color:') ? 'a custom paper colour' : 'the default page colour',
      surf, preset, other,
      surfWord: preset ? preset.word : other ? 'Borrowed' : 'Custom',
      surfPhrase: preset ? preset.phrase : other ? `surfaces borrowed from ${other.name}` : 'its own mix of surfaces',
      corners: CORNERS.find(x => x.id === corners) || null, lines: LINES.find(x => x.id === lines) || null,
      spacing: SPACINGS.find(x => x.id === spacing) || null, labels: LABELS.find(x => x.id === labels) || null,
      head: FEELS[head] ? head : null, body: FEELS[body] ? body : null,
      touches: touchesOn(spec).map(id => touchOf(id).name.toLowerCase()),
      art: readArt(spec, ctx), avoid: arr(f.avoid),
    };
  }

  function autoText(spec, ctx) {
    const x = facts(spec, ctx);
    const hf = x.head ? FEELS[x.head] : null, bf = x.body ? FEELS[x.body] : null;
    const out = {};
    out.descriptor = [x.surfWord, x.paperWord, hf ? hf.word : 'Custom'].join(' · ');
    const type = hf && bf ? `${hf.say} headlines over ${bf.say} text` : hf ? `${hf.say} headlines` : bf ? `${bf.say} text` : 'its own type';
    const bits = [x.corners ? x.corners.phrase : '', x.lines && x.lines.id !== 'none' ? x.lines.phrase : ''].filter(Boolean);
    out.summary = `${cap(x.surfPhrase)} on ${x.paperPhrase}, with ${type}${bits.length ? ' and ' + join(bits) : ''}.${x.touches.length ? ' Signature details: ' + join(x.touches) + '.' : ''}`;
    out.coreTrick = x.preset
      ? `${cap(x.preset.mech)}, on ${x.paperPhrase}${hf ? `; the ${hf.say} headlines carry the voice` : ''}.`
      : `${cap(x.surfPhrase)} on ${x.paperPhrase}${hf ? `, with ${hf.say} headlines carrying the voice` : ''}.`;
    const edge = `Corners are ${x.corners ? x.corners.say : 'set by hand'}${x.lines && x.lines.id !== 'none' ? ', with ' + x.lines.phrase : ''}.`;
    const own = x.other && x.other.spec && isObj(x.other.spec.build) ? x.other.spec.build : {};
    out['build.surface'] = x.preset ? `${x.preset.surface} ${edge}` : str(own.surface) ? `${own.surface} ${edge}` : `Surfaces are ${x.surfPhrase}. ${edge}`;
    out['build.pressText'] = x.preset ? x.preset.press : str(own.pressText) ? own.pressText : 'A press changes the surface one step, using the states of the kit.';
    const stroke = x.lines ? x.lines.stroke : 2;
    out['build.icons'] = `Stroke ${stroke} px, ${x.corners && x.corners.id === 'square' ? 'square caps and joins' : 'round caps and joins'}, outline at rest; a selected icon fills solid.`;
    out['build.appIcon'] = `A ${x.corners && x.corners.id === 'square' ? 'square' : x.corners && x.corners.id === 'pill' ? 'round' : 'rounded'} tile in the page colour (${x.paperPhrase}), ${x.lines && x.lines.id === 'none' ? 'no border' : x.lines && x.lines.id === 'hairline' ? 'a hairline border' : 'an ink border'}, with one bold glyph in the primary colour.`;
    out['meta.fonts.why'] = hf && bf ? `${cap(hf.say)} headlines (${hf.blurb}) over ${bf.say} text, so the surfaces and the paper carry the look and the type stays readable.`
      : hf ? `${cap(hf.say)} headlines: ${hf.blurb}.` : bf ? `${cap(bf.say)} text: ${bf.blurb}.` : '';
    out['labels.material'] = x.preset ? x.preset.strip : 'Surface';
    const doR = [x.preset ? x.preset.do : '', x.corners ? ({ square: 'Keep every corner square.', slight: 'Keep corners slightly rounded, the same everywhere.', rounded: 'Round every corner by the same amount.', pill: 'Make buttons and tags full pills.' })[x.corners.id] : '',
      hf ? `Set headlines in ${hf.say} type${x.spacing && x.spacing.id !== 'normal' ? ', ' + x.spacing.phrase : ''}.` : ''].filter(Boolean);
    const dont = [x.preset ? x.preset.dont : '', x.avoid.length ? `Set headlines in ${join(x.avoid.slice(0, 3).map(c => (FEELS[c] ? FEELS[c].say : c)), 'or')} type.` : '', 'Use more than one headline typeface.'].filter(Boolean);
    out['rules.do'] = doR;
    out['rules.dont'] = dont;
    return out;
  }

  const getAt = (o, p) => p.split('.').reduce((a, k) => (a == null ? undefined : a[k]), o);
  function setAt(o, p, v) {
    const ks = p.split('.');
    let a = o;
    for (let i = 0; i < ks.length - 1; i++) { if (!isObj(a[ks[i]])) a[ks[i]] = {}; a = a[ks[i]]; }
    a[ks[ks.length - 1]] = v;
  }
  const isEmpty = v => v === undefined || v === null || (typeof v === 'string' && !v.trim()) || (Array.isArray(v) && (!v.length || v.every(s => !String(s).trim())));
  // Only fields the spec already has a home for are written: build, meta.fonts and labels are never invented.
  const homeExists = (spec, p) => {
    if (p.startsWith('build.')) return isObj(spec.build);
    if (p === 'meta.fonts.why') return !!fontsOf(spec);
    if (p === 'labels.material') return isObj(spec.labels);
    return true;
  };

  function refreshAuto(before, after, ctx, opts) {
    ctx = ctx || {};
    const force = !!(opts && opts.force);
    const was = autoText(before || {}, ctx), now = autoText(after, ctx);
    const out = clone(after);
    for (const p of Object.keys(now)) {
      if (!homeExists(out, p) || isEmpty(now[p])) continue;
      const cur = getAt(out, p);
      // Simple's own text (empty, or what Simple wrote last time) is rewritten; a person's edit is never touched.
      // `force` (a new style from a starter) also replaces the starter's wording, but keeps a core trick the person typed.
      const write = force ? (p === 'coreTrick' ? isEmpty(cur) : true) : isEmpty(cur) || same(cur, was[p]);
      if (write) setAt(out, p, now[p]);
    }
    return out;
  }

  const api = {
    CONTROLS, PAPERS, BRAND_PAPER, SURFACES, CORNERS, LINES, SPACINGS, LABELS, FEELS, HEAD_FEELS, BODY_FEELS, TOUCHES, TOUCH_GROUPS,
    read, apply, nameOf, labelFor, autoText, refreshAuto, touchesOn, setTouch, setWords, setMode, artGenerators, deepOf,
  };
  if (typeof window !== 'undefined') window.StudioSimple = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
