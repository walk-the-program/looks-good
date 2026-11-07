/* Spec runtime (move lab, prototype). Loaded ONLY when the URL has ?movelab=1 (see index.html
   and dev/move-lab/lab.js). Turns a pure-data aesthetic spec into a normal registerAesthetic
   def plus a generated, scoped <style id="spec-<key>">. Contract: dev/move-lab/README.md.

   Public globals: registerMove, registerSpecAesthetic, KIT_COMPONENTS, specContrastFit, SPEC_LAB. */
(function () {
'use strict';

const MOVES = {};          // move id -> move
const MATERIALS = {};      // material name -> { move, material }
const STATES = {};         // state name -> { move, state }
const SPECS = {};          // spec key -> { spec, def, css }
const CSS = {};            // spec key -> generated stylesheet text
window.SPEC_LAB = { moves: MOVES, materials: MATERIALS, states: STATES, specs: SPECS, css: CSS };

/* Spec fields that are not copied onto the def (they drive the build instead). */
const BUILD_FIELDS = ['colour', 'moves', 'kit', 'meta', 'build'];
/* Def hooks a move may not provide through `hooks` (tokens has its own composer). */
const RESERVED_HOOKS = ['tokens'];

/* ---------------- kit component map ---------------- */
/* component name -> selector fragments, relative to the scope S = .ab[data-ae="<key>"].
   The same S matches the board, the Built kit/phone screens (.ab.sb-ab.sb-kit) and every
   deck slide (.ab.ab-slide). Each fragment is emitted twice: `S frag` (board, deck) and
   `S.sb-ab.sb-kit frag` (kit; the extra classes outrank css/see-built.css). */
const KIT_COMPONENTS = {
  'button-primary':   ['.ab-cta', '.ab-cta.sb-k-btn'],
  'button-secondary': ['.ab-type-apply', '.ab-type-apply.sb-k-btn2'],
  'button-ghost':     ['.sb-k-textbtn'],
  'button-icon':      ['.sb-k-iconbtn'],
  'button-danger':    ['.sb-k-danger'],
  'field':            ['.ab-input', '.sb-k-field .ab-input', '.sb-k-search .ab-input'],
  'select':           ['.sb-k-select'],
  'switch':           ['.ab-switch'],
  'checkbox':         ['.sb-k-box[type="checkbox"]'],
  'radio':            ['.sb-k-box[type="radio"]'],
  'slider':           ['.sb-k-range'],
  'segmented':        ['.ab-seg-btn'],
  'tabs':             ['.sb-k-tabs [role="tab"]'],
  'card':             ['.ab-card', '.ab-card.sb-k-card'],
  'panel':            ['.ab-panel'],
  'list-row':         ['.ab-row', '.sb-k-row'],
  'chip':             ['.sb-k-chip'],
  'badge':            ['.sb-k-badge', '.sb-k-count'],
  'progress':         ['.ab-row-bar', '.sb-k-bar'],
  'avatar':           ['.sb-k-av', '.ab-av'],
  'tooltip':          ['.sb-k-tooltip'],
  'modal':            ['.ab-card.sb-k-dialog', '.sb-k-dialog'],
  'sheet':            ['.sb-k-sheet'],
  'toast':            ['.sb-k-toast'],
  'callout':          ['.sb-k-callout'],
  'menu':             ['.sb-k-menu'],
  'navbar':           ['.sb-k-navbar'],
  'topbar':           ['.sb-k-topbar'],
};

/* ---------------- colour helper ---------------- */
/* specContrastFit(fg, bg, min = 4.5): fg nudged in lightness (hue and saturation kept) until it
   reaches `min` contrast on bg. Direction: away from bg's luminance. Falls back to black/white. */
function specContrastFit(fg, bg, min) {
  min = min || 4.5;
  if (contrastRatio(fg, bg) >= min) return fg;
  const hsl = hexToHsl(fg);
  const dir = relativeLuminance(bg) > 0.4 ? -1 : 1;
  for (let l = hsl.l; l >= 0 && l <= 100; l += dir) {
    const c = hslToHex(hsl.h, hsl.s, l);
    if (contrastRatio(c, bg) >= min) return c;
  }
  return contrastRatio('#ffffff', bg) >= contrastRatio('#000000', bg) ? '#ffffff' : '#000000';
}

/* ---------------- registerMove ---------------- */
function registerMove(m) {
  if (!m || typeof m.id !== 'string' || !m.id) { console.error('registerMove: missing id', m); return null; }
  if (MOVES[m.id]) console.warn(`registerMove: "${m.id}" re-registered`);
  m.params = m.params || {};
  MOVES[m.id] = m;
  if (m.material && m.material.name) MATERIALS[m.material.name] = { move: m, material: m.material };
  if (m.state && m.state.name) STATES[m.state.name] = { move: m, state: m.state };
  return m;
}

/* ---------------- spec validation ---------------- */
/* Returns the path of the first non-data value (function, symbol, undefined, NaN, class
   instance...), or '' when the spec is pure JSON data. */
function impureAt(v, path) {
  const t = typeof v;
  if (v === null || t === 'string' || t === 'boolean') return '';
  if (t === 'number') return Number.isFinite(v) ? '' : path;
  if (t !== 'object') return path;                       // function, symbol, undefined, bigint
  if (Array.isArray(v)) {
    for (let i = 0; i < v.length; i++) { const r = impureAt(v[i], `${path}[${i}]`); if (r) return r; }
    return '';
  }
  const proto = Object.getPrototypeOf(v);
  if (proto !== Object.prototype && proto !== null) return path;
  for (const k of Object.keys(v)) { const r = impureAt(v[k], `${path}.${k}`); if (r) return r; }
  return '';
}

function validateSpec(spec) {
  const key = spec && spec.key;
  if (!spec || typeof spec !== 'object' || typeof key !== 'string' || !key) {
    console.error('registerSpecAesthetic: spec needs a string key', spec); return false;
  }
  const bad = impureAt(spec, 'spec');
  if (bad) { console.error(`registerSpecAesthetic("${key}"): spec must be pure data; ${bad} is not JSON data (functions are rejected). Not registered.`); return false; }
  if (JSON.stringify(JSON.parse(JSON.stringify(spec))) !== JSON.stringify(spec)) {
    console.error(`registerSpecAesthetic("${key}"): spec does not survive a JSON round trip. Not registered.`); return false;
  }
  for (const f of ['name', 'descriptor', 'influences']) {
    if (typeof spec[f] !== 'string') console.warn(`spec "${key}": ${f} missing (the board prints "undefined")`);
  }
  return true;
}

/* Params of one spec entry resolved against the move's declared params. */
function resolveParams(move, given, key) {
  const out = {};
  const g = given || {};
  for (const name of Object.keys(g)) {
    if (!move.params[name]) console.warn(`spec "${key}": move "${move.id}" has no param "${name}" (skipped)`);
  }
  for (const [name, d] of Object.entries(move.params)) {
    let v = Object.prototype.hasOwnProperty.call(g, name) ? g[name] : d.default;
    const bad = why => { console.warn(`spec "${key}": ${move.id}.${name} ${why}; using default`); v = d.default; };
    if (d.kind === 'number') {
      if (typeof v !== 'number' || !Number.isFinite(v)) bad('is not a number');
      else if (d.range && (v < d.range[0] || v > d.range[1])) v = Math.min(d.range[1], Math.max(d.range[0], v));
    } else if (d.kind === 'enum') {
      if (!(d.options || []).includes(v)) bad(`must be one of ${(d.options || []).join('|')}`);
    } else if (d.kind === 'bool') {
      if (typeof v !== 'boolean') bad('is not a boolean');
    } else if (d.kind === 'colour' || d.kind === 'text') {
      if (typeof v !== 'string') bad('is not a string');
    }
    out[name] = v;
  }
  return out;
}

/* ---------------- selector helpers ---------------- */
function listFor(S, frags) {
  const out = [];
  for (const f of frags) { out.push(`${S} ${f}`); out.push(`${S}.sb-ab.sb-kit ${f}`); }
  return out.join(',\n');
}
/* State selectors derived from a component's selector list. */
const ON = {
  hover:    sel => `:is(${sel}):is(:hover, .is-hover)`,
  press:    sel => `:is(${sel}):is(:active, .sb-k-pressed, .is-pressed)`,
  focus:    sel => `:is(${sel}):is(:focus-visible, .is-focus)`,
  selected: sel => `:is(${sel}):is([aria-selected="true"], [aria-pressed="true"], [aria-checked="true"], :checked, .is-selected)`,
  disabled: sel => `:is(${sel}):is(:disabled, .is-disabled)`,
};

/* ---------------- registerSpecAesthetic ---------------- */
/* The lab tag loads before js/aesthetic-meta.js, whose load-time validator warns about any
   registered style without a meta/build entry. So when the tables do not exist yet, registration
   is deferred to DOMContentLoaded (our listener is added before the app's init listener). */
const DEFERRED = [];
function registerSpecAesthetic(spec) {
  if (typeof AESTHETIC_META === 'undefined' || typeof AESTHETIC_BUILD === 'undefined') {
    if (!DEFERRED.length) document.addEventListener('DOMContentLoaded', () => { while (DEFERRED.length) registerSpecAesthetic(DEFERRED.shift()); });
    DEFERRED.push(spec);
    return null;
  }
  if (!validateSpec(spec)) return null;
  const key = spec.key;
  const entries = [];       // [{ move, p }] colour first, then moves, in spec order
  const byId = {};
  for (const list of [spec.colour || [], spec.moves || []]) {
    for (const e of list) {
      const move = e && MOVES[e.move];
      if (!move) { console.warn(`spec "${key}": unknown move "${e && e.move}" (skipped)`); continue; }
      const item = { move, p: resolveParams(move, e.params, key) };
      entries.push(item); byId[move.id] = item;
    }
  }
  const S = `.ab[data-ae="${key}"]`;
  const SD = `${S}[data-mode="dark"]`;
  const sel = c => [].concat(c).map(n => KIT_COMPONENTS[n] ? listFor(S, KIT_COMPONENTS[n]) : '').filter(Boolean).join(',\n');
  const ctx = { spec, key, S, SD, ON, sel, mode: 'any', specContrastFit };

  const def = {};
  for (const k of Object.keys(spec)) if (!BUILD_FIELDS.includes(k)) def[k] = JSON.parse(JSON.stringify(spec[k]));
  if (!def.mode) def.mode = 'light';

  // tokens: every move's tokens(t, p, ctx) merged in order, later wins.
  const withTokens = entries.filter(e => typeof e.move.tokens === 'function');
  if (withTokens.length) {
    def.tokens = function (t, ...rest) {   // rest = the framework's extra args (the view state)
      const out = {};
      for (const { move, p } of withTokens) {
        try { Object.assign(out, move.tokens(t, p, Object.assign({}, ctx, { mode: t && t.isDark ? 'dark' : 'light' }), ...rest) || {}); }
        catch (err) { console.warn(`move ${move.id} tokens (${key}) failed:`, err); }
      }
      return out;
    };
  }

  // hooks: first provider wins; fn is called as fn.call(def, p, ctx, ...hookArgs).
  const owner = {};
  for (const { move, p } of entries) {
    for (const [name, fn] of Object.entries(move.hooks || {})) {
      if (RESERVED_HOOKS.includes(name) || typeof fn !== 'function') { console.warn(`move ${move.id}: hook "${name}" ignored`); continue; }
      if (owner[name]) { console.warn(`spec "${key}": hook "${name}" from "${move.id}" ignored; "${owner[name]}" provides it`); continue; }
      owner[name] = move.id;
      def[name] = function (...args) { return fn.call(this, p, ctx, ...args); };
    }
  }

  // css: each move's css(S, p, ctx), then kit materials / states per component.
  const parts = [];
  for (const { move, p } of entries) {
    if (typeof move.css !== 'function') continue;
    try { parts.push(`/* move ${move.id} */\n${move.css(S, p, ctx) || ''}`); }
    catch (err) { console.warn(`move ${move.id} css (${key}) failed:`, err); }
  }
  const paramsOf = (move, over) => {
    const base = byId[move.id] ? byId[move.id].p : resolveParams(move, {}, key);
    return over ? resolveParams(move, Object.assign({}, base, over), key) : base;
  };
  for (const [comp, rule] of Object.entries(spec.kit || {})) {
    const frags = KIT_COMPONENTS[comp];
    if (!frags) { console.warn(`spec "${key}": unknown kit component "${comp}" (skipped)`); continue; }
    const sel = listFor(S, frags);
    const over = (rule && rule.params) || {};
    const run = (kind, name, reg) => {
      const hit = reg[name];
      if (!hit) { console.warn(`spec "${key}": kit.${comp} unknown ${kind} "${name}" (skipped)`); return; }
      const p = paramsOf(hit.move, over[name] || over[hit.move.id]);
      try { parts.push(`/* ${comp}: ${kind} ${name} */\n${hit[kind].css(S, sel, p, Object.assign({}, ctx, { component: comp })) || ''}`); }
      catch (err) { console.warn(`${kind} ${name} css (${key}, ${comp}) failed:`, err); }
    };
    if (rule && rule.material) run('material', rule.material, MATERIALS);
    for (const s of [].concat((rule && rule.state) || [])) run('state', s, STATES);
  }
  const css = parts.join('\n\n');
  CSS[key] = css;

  const old = document.getElementById('spec-' + key);
  if (old) old.remove();
  const style = document.createElement('style');
  style.id = 'spec-' + key;
  style.textContent = css;
  document.head.appendChild(style);

  // meta / build: pure data in the shape of an AESTHETIC_META / AESTHETIC_BUILD entry, written into
  // the live tables under the spec key (aesthetic-meta.js itself is not edited).
  if (spec.meta && typeof AESTHETIC_META !== 'undefined') AESTHETIC_META[key] = JSON.parse(JSON.stringify(spec.meta));
  if (spec.build && typeof AESTHETIC_BUILD !== 'undefined') AESTHETIC_BUILD[key] = JSON.parse(JSON.stringify(spec.build));

  registerAesthetic(def);
  SPECS[key] = { spec, def, css };
  return def;
}

window.registerMove = registerMove;
window.registerSpecAesthetic = registerSpecAesthetic;
window.KIT_COMPONENTS = KIT_COMPONENTS;
window.specContrastFit = specContrastFit;
})();
