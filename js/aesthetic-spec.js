/* Spec runtime. Always loaded by index.html (with js/moves/*.js); the lab specs still need ?movelab=1,
   custom styles load through js/custom-aesthetics.js. Turns a pure-data aesthetic spec (spec 2:
   aesthetic.json) into a normal registerAesthetic def plus a generated, scoped <style id="spec-<key>">.
   Contract: docs/aesthetic-spec/SPEC-v2.md; docs: dev/move-lab/README.md.

   Public globals: registerMove, registerSpecAesthetic, unregisterSpecAesthetic, KIT_COMPONENTS,
   specContrastFit, SPEC_LAB, specSanitizeSvg, specAllowedImage, SPEC_SVG_RULES. */
(function () {
'use strict';

const MOVES = {};          // move id -> move
const MATERIALS = {};      // material name -> { move, material }
const STATES = {};         // state name -> { move, state }
const SPECS = {};          // spec key -> { spec, def, css }
const CSS = {};            // spec key -> generated stylesheet text
window.SPEC_LAB = { moves: MOVES, materials: MATERIALS, states: STATES, specs: SPECS, css: CSS };   // + catalog, loadSpecs (below)

/* Spec fields that are not copied onto the def (they drive the build instead). */
const BUILD_FIELDS = ['spec', 'colour', 'moves', 'kit', 'meta', 'build', 'art'];
/* Def hooks a move may not provide through `hooks` (tokens has its own composer). */
const RESERVED_HOOKS = ['tokens'];

/* ---------------- kit component map ---------------- */
/* component name -> selector fragments, relative to the scope S = .ab[data-ae="<key>"].
   The same S matches the board, the Built kit/phone screens (.ab.sb-ab.sb-kit) and every
   deck slide (.ab.ab-slide). Each fragment is emitted per scope (see listFor):
   all  -> `S frag` (board, deck) and `S.sb-ab.sb-kit frag` (kit; the extra classes outrank css/see-built.css)
   board-> `S:not(.sb-ab) frag`      kit -> `S.sb-ab.sb-kit frag`
   The first 28 are the v1 set (names and meaning unchanged). The rest cover every other component
   the Built kit renders (js/ui-kit.js UI_KIT items drawn by js/see-built.js KIT_SPEC). */
const KIT_COMPONENTS = {
  // ---- v1 set (28) ----
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
  // ---- v2 additions: buttons and links ----
  'button-split':     ['.sb-k-split-main', '.sb-k-split-more'],
  'button-fab':       ['.sb-k-fab'],
  'button-back-top':  ['.sb-k-backtop'],
  'link':             ['.sb-k-link'],
  // ---- inputs ----
  'stepper':          ['.sb-k-stepper'],
  'knob':             ['.sb-k-knob-dial'],
  'date-field':       ['.sb-k-datefield .ab-input'],
  'combo':            ['.sb-k-combo-in'],
  'listbox':          ['.sb-k-listbox'],
  'calendar':         ['.sb-k-cal'],
  'calendar-day':     ['.sb-k-day'],
  'wheel':            ['.sb-k-wheel'],
  // ---- containers ----
  'accordion':        ['.sb-k-acc'],
  'carousel-card':    ['.sb-k-car-card'],
  'matrix-tile':      ['.sb-k-mx-tile'],
  'divider':          ['.sb-k-menu-sep', '.sb-k-divider .ab-rule'],
  'section-label':    ['.sb-k-section'],
  'empty-state':      ['.sb-k-empty'],
  // ---- overlays ----
  'overlay-scrim':    ['.sb-k-scrim'],
  'side-sheet':       ['.sb-k-side'],
  'drawer':           ['.sb-k-drawer'],
  'popover':          ['.sb-k-pop'],
  'popup-tip':        ['.sb-k-tip'],
  'lightbox':         ['.sb-k-lightbox'],
  'lightbox-control': ['.sb-k-lb-close', '.sb-k-lb-prev', '.sb-k-lb-next'],
  // ---- navigation and menus ----
  'topbar-title':     ['.sb-k-tb-title'],
  'tabbar':           ['.sb-tabs'],
  'nav-menu':         ['.sb-k-navmenu'],
  'nav-item':         ['.sb-k-nm-item'],
  'breadcrumbs':      ['.sb-k-crumbs'],
  'anchor-nav':       ['.sb-k-anchors'],
  'scrollbar':        ['.sb-k-sbar'],
  'dropdown-trigger': ['.sb-k-dd'],
  'menu-item':        ['.sb-k-menu [role="menuitem"]', '.sb-k-menu [role="option"]'],
  'mega-menu':        ['.sb-k-mega-panel'],
  'menubar':          ['.sb-k-menubar'],
  'ribbon':           ['.sb-k-ribbon'],
  'pie-menu':         ['.sb-k-pie', '.sb-k-pie-item'],
  // ---- status and feedback ----
  'spinner':          ['.sb-k-spin'],
  'skeleton':         ['.sb-k-skel-line', '.sb-k-skel-av', '.sb-k-skel-block'],
  'notification-dot': ['.sb-badge'],
  'kbd':              ['.sb-k-kbd'],
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

/* ---------------- SVG / image sanitiser (art slot) ---------------- */
/* The rule list is data so a checker can import it (window.SPEC_SVG_RULES, or module.exports in node).
   specSanitizeSvg(text, opts?) -> { svg, stripped: ['element:script', 'attr:onload', 'href:http://x', 'style:@import', ...] }
   opts.parser     DOMParser-like (parseFromString(text, 'image/svg+xml')); default new DOMParser()
   opts.serializer XMLSerializer-like (serializeToString(node)); default new XMLSerializer()
   opts.fit        'cover' | 'contain': sets preserveAspectRatio on the root (slice | meet)
   Returns svg '' (and a `parse-error` / `root:<name>` entry) when the text is not a single <svg> document. */
const SPEC_SVG_RULES = [
  { id: 'element', what: 'remove these elements (and everything inside)', names: ['script', 'foreignobject', 'iframe', 'object', 'embed'] },
  { id: 'attr', what: 'remove every event-handler attribute', pattern: '^on' },
  { id: 'href', what: 'remove href / xlink:href unless it is #fragment or data:image/(png|jpeg|webp|gif)', attrs: ['href', 'xlink:href'], allow: ['^#', '^data:image/(png|jpeg|webp|gif)[;,]'] },
  { id: 'style', what: 'remove a <style> element or style="" attribute with @import, or url() to a target that is not #fragment / data:image/…', forbid: ['@import'], urlAllow: ['^#', '^data:image/(png|jpeg|webp|gif)[;,]'] },
];
const SVG_ALLOW_HREF = SPEC_SVG_RULES[2].allow.map(r => new RegExp(r, 'i'));
const SVG_ALLOW_URL = SPEC_SVG_RULES[3].urlAllow.map(r => new RegExp(r, 'i'));
const SVG_BAD_ELEMENTS = new Set(SPEC_SVG_RULES[0].names);
const SVG_ON = new RegExp(SPEC_SVG_RULES[1].pattern, 'i');

/* Reports the first offence in a CSS text: '@import' or 'url(<target>)', else ''. */
function cssOffence(text) {
  if (/@import/i.test(text)) return '@import';
  const re = /url\(\s*(['"]?)(.*?)\1\s*\)/gi;
  let m;
  while ((m = re.exec(text))) {
    const target = m[2].trim();
    if (!SVG_ALLOW_URL.some(r => r.test(target))) return `url(${target})`;
  }
  return '';
}

function specSanitizeSvg(text, opts) {
  opts = opts || {};
  const stripped = [];
  let doc;
  try {
    const parser = opts.parser || new DOMParser();
    doc = parser.parseFromString(String(text), 'image/svg+xml');
  } catch (err) { return { svg: '', stripped: ['parse-error'] }; }
  if (!doc || !doc.documentElement || doc.getElementsByTagName('parsererror').length) return { svg: '', stripped: ['parse-error'] };
  const root = doc.documentElement;
  const rootName = String(root.localName || root.nodeName).toLowerCase();
  if (rootName !== 'svg') return { svg: '', stripped: [`root:${rootName}`] };

  const walk = el => {
    for (const child of Array.from(el.childNodes || [])) {
      if (child.nodeType !== 1) continue;
      const name = String(child.localName || child.nodeName).toLowerCase();
      if (SVG_BAD_ELEMENTS.has(name)) { stripped.push(`element:${name}`); el.removeChild(child); continue; }
      if (name === 'style') {
        const bad = cssOffence(child.textContent || '');
        if (bad) { stripped.push(`style:${bad}`); el.removeChild(child); continue; }
      }
      for (const attr of Array.from(child.attributes || [])) {
        const an = String(attr.name).toLowerCase();
        if (SVG_ON.test(an)) { stripped.push(`attr:${an}`); child.removeAttribute(attr.name); }
        else if (an === 'href' || an === 'xlink:href') {
          const v = String(attr.value).trim();
          if (!SVG_ALLOW_HREF.some(r => r.test(v))) { stripped.push(`href:${v.slice(0, 60)}`); child.removeAttribute(attr.name); }
        } else if (an === 'style') {
          const bad = cssOffence(attr.value || '');
          if (bad) { stripped.push(`style:${bad}`); child.removeAttribute(attr.name); }
        }
      }
      walk(child);
    }
  };
  // the root itself carries attributes too
  for (const attr of Array.from(root.attributes || [])) {
    const an = String(attr.name).toLowerCase();
    if (SVG_ON.test(an)) { stripped.push(`attr:${an}`); root.removeAttribute(attr.name); }
    else if ((an === 'href' || an === 'xlink:href') && !SVG_ALLOW_HREF.some(r => r.test(String(attr.value).trim()))) { stripped.push(`href:${attr.value}`); root.removeAttribute(attr.name); }
    else if (an === 'style' && cssOffence(attr.value || '')) { stripped.push(`style:${cssOffence(attr.value)}`); root.removeAttribute(attr.name); }
  }
  walk(root);
  if (opts.fit === 'cover' || opts.fit === 'contain') root.setAttribute('preserveAspectRatio', `xMidYMid ${opts.fit === 'cover' ? 'slice' : 'meet'}`);
  const ser = opts.serializer || new XMLSerializer();
  return { svg: ser.serializeToString(root), stripped };
}

/* Allowed `image` sources: a relative path (no scheme, no leading /, no ..) to png/jpg/jpeg/webp/gif,
   or a data:image/(png|jpeg|webp|gif);base64 URL. */
function specAllowedImage(src) {
  if (typeof src !== 'string' || !src || src.length > 2000000) return false;
  if (/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(src)) return true;
  if (/^[a-z][a-z0-9+.-]*:/i.test(src) || src.startsWith('/') || src.startsWith('\\') || src.includes('..') || /[?#\\]/.test(src)) return false;
  return /^[A-Za-z0-9._\- /]+\.(png|jpe?g|webp|gif)$/i.test(src);
}

const escAttr = v => String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* ---------------- registerMove ---------------- */
function registerMove(m) {
  if (!m || typeof m.id !== 'string' || !m.id) { console.error('registerMove: missing id', m); return null; }
  if (MOVES[m.id]) { console.error(`registerMove: duplicate move id "${m.id}" ignored (the first one wins)`); return null; }
  for (const [kind, reg] of [['material', MATERIALS], ['state', STATES]]) {
    const name = m[kind] && m[kind].name;
    if (name && reg[name]) { console.error(`registerMove: ${kind} name "${name}" (move "${m.id}") already belongs to "${reg[name].move.id}"; move ignored (the first one wins)`); return null; }
  }
  m.params = m.params || {};
  if (typeof m.what !== 'string') m.what = '';
  if (m.libraryId === undefined) m.libraryId = null;
  MOVES[m.id] = m;
  if (m.material && m.material.name) MATERIALS[m.material.name] = { move: m, material: m.material };
  if (m.state && m.state.name) STATES[m.state.name] = { move: m, state: m.state };
  return m;
}

/* SPEC_LAB.catalog(): one entry per registered move.
   { id, libraryId, category, tier, what, params: [{ name, kind, default, range|null, options|null }],
     material: name|null, state: name|null, hooks: [names] } */
function catalog() {
  return Object.values(MOVES).map(m => ({
    id: m.id, libraryId: m.libraryId, category: m.category || null, tier: m.tier || null, what: m.what,
    params: Object.entries(m.params).map(([name, d]) => ({ name, kind: d.kind, default: d.default, range: d.range || null, options: d.options || null, selector: !!d.selector })),
    material: (m.material && m.material.name) || null,
    state: (m.state && m.state.name) || null,
    hooks: Object.keys(m.hooks || {}),
  }));
}
SPEC_LAB.catalog = catalog;
SPEC_LAB.paramProblem = paramProblem;

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

const KEY_RE = /^[a-z0-9][a-z0-9-]{1,46}[a-z0-9]$/;
const REQUIRED_V2 = ['name', 'descriptor', 'coreTrick', 'mode', 'colour', 'moves', 'kit'];
const SCOPES = ['all', 'board', 'kit'];
/* Top-level fields an untrusted spec (an imported bundle) may carry: the SPEC-v2 section 2 list. Anything
   else is refused, so a bundle cannot set a def field the app reads as code (classicOf, tokens, ...). */
const UNTRUSTED_FIELDS = ['spec', 'key', 'order', 'name', 'descriptor', 'influences', 'summary', 'coreTrick', 'motto', 'kicker', 'mode',
  'lineage', 'meta', 'build', 'labels', 'copy', 'layout', 'type', 'roles', 'rules', 'highlight', 'slideShape', 'highlightNote', 'deck', 'colour', 'moves', 'kit', 'art'];
const isObj = v => !!v && typeof v === 'object' && !Array.isArray(v);
const SPEC_LIMITS = { string: 4000, nodes: 20000, depth: 12 };

/* First problem in an untrusted spec, or ''. Walks every value: no __proto__ / constructor / prototype keys,
   no < or > in any string (names and copy are printed into HTML), bounded size and depth. */
function untrustedProblem(spec) {
  let nodes = 0;
  const walk = (v, path, depth) => {
    if (++nodes > SPEC_LIMITS.nodes) return 'spec is too large (more than 20000 values)';
    if (depth > SPEC_LIMITS.depth) return `${path} is nested deeper than ${SPEC_LIMITS.depth} levels`;
    if (typeof v === 'string') {
      if (v.length > SPEC_LIMITS.string) return `${path} is longer than ${SPEC_LIMITS.string} characters`;
      if (/[<>]/.test(v)) return `${path} contains < or >, which is not allowed in an imported style`;
      return '';
    }
    if (Array.isArray(v)) { for (let i = 0; i < v.length; i++) { const r = walk(v[i], `${path}[${i}]`, depth + 1); if (r) return r; } return ''; }
    if (v && typeof v === 'object') {
      for (const k of Object.keys(v)) {
        if (k === '__proto__' || k === 'constructor' || k === 'prototype') return `${path} has a forbidden key "${k}"`;
        const r = walk(v[k], `${path}.${k}`, depth + 1); if (r) return r;
      }
    }
    return '';
  };
  return walk(spec, 'spec', 0);
}

/* Shape check of deck / highlightNote (brand-deck tuning). Plain data only: numbers and short strings; the
   untrustedProblem walk has already refused < and > anywhere in the spec. Returns a problem or ''. */
function deckProblem(d, note) {
  if (note !== undefined && !(typeof note === 'string' && note.length <= 400)) return 'highlightNote must be a string of at most 400 characters';
  if (d === undefined) return '';
  const str = (s, max) => typeof s === 'string' && s.length <= max;
  const strs = (a, cap, max) => Array.isArray(a) && a.length <= cap && a.every(s => str(s, max));
  if (!isObj(d)) return 'deck must be an object';
  const extra = Object.keys(d).filter(k => !['coverDisplay', 'coverMin', 'principles', 'do', 'dont', 'marks'].includes(k));
  if (extra.length) return `deck has field(s) not allowed in an imported style: ${extra.join(', ')}`;
  if (d.coverDisplay !== undefined && !(typeof d.coverDisplay === 'number' && d.coverDisplay >= 0.2 && d.coverDisplay <= 2)) return 'deck.coverDisplay must be a number from 0.2 to 2';
  if (d.coverMin !== undefined && !(typeof d.coverMin === 'number' && d.coverMin >= 16 && d.coverMin <= 64)) return 'deck.coverMin must be a number from 16 to 64';
  if (d.principles !== undefined && !(Array.isArray(d.principles) && d.principles.length <= 6 && d.principles.every(p => Array.isArray(p) && p.length === 2 && str(p[0], 120) && str(p[1], 300)))) return 'deck.principles must be up to 6 [title, line] pairs of short strings';
  for (const f of ['do', 'dont']) if (d[f] !== undefined && !strs(d[f], 8, 300)) return `deck.${f} must be up to 8 short strings`;
  if (d.marks !== undefined && !(isObj(d.marks) && Object.keys(d.marks).every(k => k === 'do' || k === 'dont') && Object.values(d.marks).every(s => str(s, 4)))) return 'deck.marks must be { do, dont } strings of at most 4 characters';
  return '';
}

/* Shape check of meta / build before they enter the live AESTHETIC_META / AESTHETIC_BUILD tables (the app
   reads fonts.heading.classes, BUILD_CLASSES[cls].states ... without guards). Returns a problem or ''. */
function metaProblem(m) {
  if (m === undefined) return '';
  const strs = a => Array.isArray(a) && a.every(x => typeof x === 'string');
  if (!isObj(m)) return 'meta must be an object';
  if (typeof AESTHETIC_FAMILIES !== 'undefined' && !AESTHETIC_FAMILIES.some(f => f.key === m.family)) return 'meta.family is not a known family';
  const f = m.fonts;
  if (!isObj(f)) return 'meta.fonts is missing';
  for (const role of ['heading', 'body']) {
    if (!isObj(f[role]) || !strs(f[role].picks)) return `meta.fonts.${role}.picks must be an array of font names`;
    if (f[role].classes !== undefined && !strs(f[role].classes)) return `meta.fonts.${role}.classes must be an array of strings`;
  }
  if (f.mono !== undefined && (!isObj(f.mono) || !strs(f.mono.picks))) return 'meta.fonts.mono.picks must be an array of font names';
  if (f.avoid !== undefined && !strs(f.avoid)) return 'meta.fonts.avoid must be an array of strings';
  if (!Array.isArray(f.pairings) || !f.pairings.length || !f.pairings.every(p => strs(p) && p.length === 2)) return 'meta.fonts.pairings must be a non-empty array of [heading, body] pairs';
  return '';
}
function buildProblem(b) {
  if (b === undefined) return '';
  if (!isObj(b)) return 'build must be an object';
  if (typeof BUILD_CLASSES !== 'undefined' && !(typeof b.cls === 'string' && Object.prototype.hasOwnProperty.call(BUILD_CLASSES, b.cls))) return 'build.cls is not a known build class';
  if (b.states !== undefined && !isObj(b.states)) return 'build.states must be an object';
  return '';
}

/* validateSpec(spec, opts): true when the spec may be registered. Every refusal is a console.error naming the
   key, and is pushed onto opts.errors (an array) when the caller wants the text. opts.untrusted (imported
   bundles) adds the strict checks above. */
function validateSpec(spec, opts) {
  const key = spec && spec.key;
  const file = opts && opts.file ? ` (${opts.file})` : '';
  const no = msg => { console.error(msg); if (opts && opts.errors) opts.errors.push(msg.replace(/^registerSpecAesthetic\([^)]*\)[^:]*: /, '')); return false; };
  if (!spec || typeof spec !== 'object' || typeof key !== 'string' || !key) return no(`registerSpecAesthetic${file}: spec needs a string key`);
  const bad = impureAt(spec, 'spec');
  if (bad) return no(`registerSpecAesthetic("${key}")${file}: spec must be pure data; ${bad} is not JSON data (functions are rejected). Not registered.`);
  if (JSON.stringify(JSON.parse(JSON.stringify(spec))) !== JSON.stringify(spec)) return no(`registerSpecAesthetic("${key}")${file}: spec does not survive a JSON round trip. Not registered.`);
  if (spec.spec !== undefined && spec.spec !== 2) return no(`registerSpecAesthetic("${key}")${file}: "spec" must be 2, got ${JSON.stringify(spec.spec)}. Not registered.`);
  if (opts && (opts.json || opts.untrusted) && spec.spec !== 2) return no(`registerSpecAesthetic("${key}")${file}: aesthetic.json needs "spec": 2. Not registered.`);
  if (!KEY_RE.test(key)) return no(`registerSpecAesthetic("${key}")${file}: key must be lowercase kebab-case, 3 to 48 characters. Not registered.`);
  if (key.endsWith('--classic') || (typeof hasClassicAesthetic === 'function' && hasClassicAesthetic(key))) return no(`registerSpecAesthetic("${key}")${file}: key belongs to a built-in style. Not registered.`);
  if (SPECS[key] || (typeof AESTHETICS !== 'undefined' && AESTHETICS.some(a => a.key === key))) {
    return no(`registerSpecAesthetic("${key}")${file}: key already used by a built-in or another spec. Not registered.`);
  }
  if (spec.spec === 2) {
    const missing = REQUIRED_V2.filter(f => spec[f] === undefined);
    if (missing.length) return no(`registerSpecAesthetic("${key}")${file}: missing required field(s): ${missing.join(', ')}. Not registered.`);
    if (!Array.isArray(spec.colour) || !Array.isArray(spec.moves) || !spec.kit || typeof spec.kit !== 'object' || Array.isArray(spec.kit)) {
      return no(`registerSpecAesthetic("${key}")${file}: colour and moves must be arrays, kit an object. Not registered.`);
    }
  }
  if (opts && opts.untrusted) {
    const extra = Object.keys(spec).filter(k => !UNTRUSTED_FIELDS.includes(k));
    if (extra.length) return no(`registerSpecAesthetic("${key}")${file}: field(s) not allowed in an imported style: ${extra.join(', ')}. Not registered.`);
    for (const f of ['name', 'descriptor', 'coreTrick']) if (typeof spec[f] !== 'string' || !spec[f].trim()) return no(`registerSpecAesthetic("${key}")${file}: "${f}" must be a non-empty string. Not registered.`);
    if (spec.mode !== 'light' && spec.mode !== 'dark') return no(`registerSpecAesthetic("${key}")${file}: "mode" must be light or dark. Not registered.`);
    if (spec.order !== undefined && !(typeof spec.order === 'number' && Number.isFinite(spec.order))) return no(`registerSpecAesthetic("${key}")${file}: "order" must be a number. Not registered.`);
    if (spec.colour.length > 20 || spec.moves.length > 200 || Object.keys(spec.kit).length > 120) return no(`registerSpecAesthetic("${key}")${file}: too many moves or kit entries. Not registered.`);
    const why = untrustedProblem(spec) || metaProblem(spec.meta) || buildProblem(spec.build) || deckProblem(spec.deck, spec.highlightNote);
    if (why) return no(`registerSpecAesthetic("${key}")${file}: ${why}. Not registered.`);
  }
  for (const f of ['name', 'descriptor', 'influences']) {
    if (typeof spec[f] !== 'string') console.warn(`spec "${key}": ${f} missing (the board prints "undefined")`);
  }
  return true;
}

/* ---------------- params ---------------- */
const isPair = v => !!v && typeof v === 'object' && !Array.isArray(v) && ('light' in v || 'dark' in v);

/* Text and colour params are written into CSS (content: "...", selectors, values) and into hook HTML, so a
   value a spec supplies (not the move's own default) may not carry anything that could leave its place:
   braces, semicolons, angle brackets, double quotes, backslashes, control characters, comments, url(),
   @import, expression(), javascript:. A text param flagged `selector` (a CSS selector fragment) also may not
   carry combinators or commas, so it cannot widen the rule beyond the style's own scope. */
const TEXT_BAD = /[{}<>;"\\\u0000-\u001f]|\/\*|\*\/|url\s*\(|@import|expression\s*\(|javascript:/i;
const SELECTOR_BAD = /[,>+~|*]/;
const COLOUR_OK = /^(#[0-9a-f]{3,8}|(?:rgb|hsl)a?\([-0-9.,%\s/a-z]*\)|[a-z]{3,24}|var\(--[a-z0-9-]+\))$/i;
function paramProblem(d, v) {
  if (d.kind === 'colour') {
    if (typeof v !== 'string') return 'is not a string';
    if (v !== d.default && !COLOUR_OK.test(v)) return 'is not a plain colour (hex, rgb(), hsl() or a colour name)';
  } else if (d.kind === 'text') {
    if (typeof v !== 'string') return 'is not a string';
    if (v !== d.default) {
      if (v.length > 200) return 'is longer than 200 characters';
      // a selector fragment may carry attribute selectors ([role="menuitem"]); they are set aside before the check
      if (TEXT_BAD.test(d.selector ? v.replace(/\[[\w-]+(?:[~|^$*]?=(?:"[^"\\]*"|'[^'\\]*'))?\]/g, '') : v)) return 'has a character or word that is not allowed in text params ({ } < > ; " \\ url( @import)';
      if (d.selector && SELECTOR_BAD.test(v)) return 'is a selector fragment: no commas or combinators';
    }
  }
  return '';
}

/* One value checked against the move's declared param; returns the (clamped / defaulted) value. */
function coerce(d, v, label, key) {
  const bad = why => { console.warn(`spec "${key}": ${label} ${why}; using default`); return d.default; };
  if (d.kind === 'number') {
    if (typeof v !== 'number' || !Number.isFinite(v)) return bad('is not a number');
    if (d.range && (v < d.range[0] || v > d.range[1])) return Math.min(d.range[1], Math.max(d.range[0], v));
  } else if (d.kind === 'enum') {
    if (!(d.options || []).includes(v)) return bad(`must be one of ${(d.options || []).join('|')}`);
  } else if (d.kind === 'bool') {
    if (typeof v !== 'boolean') return bad('is not a boolean');
  } else if (d.kind === 'colour' || d.kind === 'text') {
    const why = paramProblem(d, v);
    if (why) return bad(why);
  }
  return v;
}

/* Params of one spec entry resolved against the move's declared params.
   Returns { light, dark, pair }: `pair` is true when any value was a { light, dark } pair; light / dark are
   the plain param objects for each mode (identical when no pair). */
function resolveParams(move, given, key) {
  const g = given || {};
  for (const name of Object.keys(g)) {
    if (!move.params[name]) console.warn(`spec "${key}": move "${move.id}" has no param "${name}" (skipped)`);
  }
  const light = {}, dark = {};
  let pair = false;
  for (const [name, d] of Object.entries(move.params)) {
    const has = Object.prototype.hasOwnProperty.call(g, name);
    const raw = has ? g[name] : d.default;
    if (has && isPair(raw)) {
      pair = true;
      for (const k of Object.keys(raw)) if (k !== 'light' && k !== 'dark') console.warn(`spec "${key}": ${move.id}.${name} pair has unknown side "${k}" (ignored)`);
      for (const [side, out] of [['light', light], ['dark', dark]]) {
        if (!(side in raw)) { console.warn(`spec "${key}": ${move.id}.${name} pair lacks "${side}"; using default`); out[name] = d.default; }
        else out[name] = coerce(d, raw[side], `${move.id}.${name}.${side}`, key);
      }
    } else {
      light[name] = dark[name] = coerce(d, raw, `${move.id}.${name}`, key);
    }
  }
  return { light, dark, pair };
}

/* ---------------- selector helpers ---------------- */
/* Scope narrowing of a base scope B (S, or SD in the dark pass). */
function scopeSel(B, scope) {
  return scope === 'board' ? `${B}:not(.sb-ab)` : scope === 'kit' ? `${B}.sb-ab.sb-kit` : B;
}
function listFor(B, frags, scope) {
  const out = [];
  for (const f of frags) {
    if (scope === 'board') out.push(`${B}:not(.sb-ab) ${f}`);
    else if (scope === 'kit') out.push(`${B}.sb-ab.sb-kit ${f}`);
    else { out.push(`${B} ${f}`); out.push(`${B}.sb-ab.sb-kit ${f}`); }
  }
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

/* ---------------- loader (lab only) ---------------- */
function xhrText(url) {
  const x = new XMLHttpRequest();
  try { x.open('GET', url, false); x.send(); } catch (err) { return { err: String(err && err.message || err) }; }
  if (x.status !== 200 && !(x.status === 0 && x.responseText)) return { err: `HTTP ${x.status}` };
  return { text: x.responseText };
}
/* SPEC_LAB.loadSpecs('dev/move-lab/specs/index.json'): loads { specs: [folder...] } and each
   <folder>/aesthetic.json. A missing or invalid file logs one console.error naming the file; the rest load. */
function loadSpecs(indexUrl) {
  const dir = indexUrl.replace(/[^/]*$/, '');
  const fetchJson = url => {
    const r = xhrText(url);
    if (r.err) { console.error(`spec loader: cannot read ${url} (${r.err})`); return null; }
    try { return JSON.parse(r.text); } catch (err) { console.error(`spec loader: ${url} is not valid JSON (${err.message})`); return null; }
  };
  const idx = fetchJson(indexUrl);
  if (!idx) return;
  if (!idx || !Array.isArray(idx.specs)) { console.error(`spec loader: ${indexUrl} needs { "specs": [folder names] }`); return; }
  for (const folder of idx.specs) {
    if (typeof folder !== 'string' || !/^[a-z0-9][a-z0-9-]*$/.test(folder)) { console.error(`spec loader: ${indexUrl} lists an invalid folder name ${JSON.stringify(folder)}`); continue; }
    const file = `${dir}${folder}/aesthetic.json`;
    const json = fetchJson(file);
    if (json) registerSpecAesthetic(json, { base: `${dir}${folder}/`, file, json: true });
  }
}
SPEC_LAB.loadSpecs = loadSpecs;

/* ---------------- registerSpecAesthetic ---------------- */
/* registerSpecAesthetic(spec, opts?)  opts: { base: 'dev/move-lab/specs/<key>/', file, json: true,
     files: { 'art/hero.svg': '<svg...', 'art/x.png': 'data:image/png;base64,...' }  art already fetched by the caller,
     untrusted: true  an imported bundle: strict checks (field whitelist, no < > in strings, meta/build shape),
                      art only from `files`, never from a path,
     errors: []       receives the text of every refusal,
     quietHooks: true no "hook X ignored; Y provides it" notes (the app's own loads; the checker still prints them) }.
   A spec object without `spec: 2` is the v1 JS-spec form: DEPRECATED, kept only so the three legacy JS
   specs (dev/move-lab/specs/{soft-form,acid-graphics,editorial-serif}.js) keep loading until they are
   migrated to aesthetic.json; JSON files always require spec 2.
   The lab tag loads before js/aesthetic-meta.js, whose load-time validator warns about any
   registered style without a meta/build entry. So when the tables do not exist yet, registration
   is deferred to DOMContentLoaded (our listener is added before the app's init listener). */
const DEFERRED = [];
function registerSpecAesthetic(spec, opts) {
  opts = opts || {};
  if (typeof AESTHETIC_META === 'undefined' || typeof AESTHETIC_BUILD === 'undefined') {
    if (!DEFERRED.length) document.addEventListener('DOMContentLoaded', () => { while (DEFERRED.length) registerSpecAesthetic(...DEFERRED.shift()); });
    DEFERRED.push([spec, opts]);
    return null;
  }
  if (!validateSpec(spec, opts)) return null;
  const key = spec.key;
  const entries = [];       // [{ move, raw, P, scope }] colour first, then moves, in spec order
  const byId = {};
  const scopeOf = (e, where) => {
    const sc = e && e.scope;
    if (sc === undefined) return 'all';
    if (!SCOPES.includes(sc)) { console.warn(`spec "${key}": ${where} scope "${sc}" must be ${SCOPES.join('|')}; using all`); return 'all'; }
    return sc;
  };
  const addEntry = (move, raw, scope) => {
    const item = { move, raw: raw || {}, P: resolveParams(move, raw, key), scope };
    entries.push(item); byId[move.id] = item;
    return item;
  };
  for (const list of [spec.colour || [], spec.moves || []]) {
    for (const e of list) {
      const move = e && MOVES[e.move];
      if (!move) { console.warn(`spec "${key}": unknown move "${e && e.move}" (skipped)`); continue; }
      addEntry(move, e.params, scopeOf(e, `move "${move.id}"`));
    }
  }
  const S = `.ab[data-ae="${key}"]`;
  const SD = `${S}[data-mode="dark"]`;

  /* ctx for one call. side: which base scope the CSS is written on ('light' = S, 'dark' = SD); mode: the
     value of ctx.mode ('any' when the entry has no pairs and css is written once). */
  const makeCtx = (scope, side, mode, bus) => {
    const B = side === 'dark' ? SD : S;
    return {
      spec, key, scope, mode, bus: bus || {}, ON, specContrastFit,
      S: scopeSel(B, scope), SD: scopeSel(SD, scope),
      sel: c => [].concat(c).map(n => KIT_COMPONENTS[n] ? listFor(B, KIT_COMPONENTS[n], scope) : '').filter(Boolean).join(',\n'),
    };
  };

  const def = {};
  for (const k of Object.keys(spec)) if (!BUILD_FIELDS.includes(k) && k !== 'classicOf') def[k] = JSON.parse(JSON.stringify(spec[k]));
  if (!def.mode) def.mode = 'light';

  // tokens: every move's tokens(t, p, ctx, state) merged in order (colour moves first), later wins.
  // ctx.bus is a fresh object per pass (per render, per mode); each tokens() may read and write it, and the
  // returned --props are merged into it too.
  // A move used only as a kit material / state (spec.kit.<comp>.material / .state) is not an entry, but its tokens()
  // still run, after the listed entries, with default params and scope 'kit'. Its move-level css() is not emitted.
  const kitOnly = [], seenKit = {};
  for (const rule of Object.values(spec.kit || {})) {
    if (!rule || typeof rule !== 'object') continue;
    const hits = [MATERIALS[rule.material]].concat([].concat(rule.state || []).map(n => STATES[n]));
    for (const hit of hits) {
      const m = hit && hit.move;
      if (!m || byId[m.id] || seenKit[m.id]) continue;
      seenKit[m.id] = true;
      kitOnly.push({ move: m, P: resolveParams(m, {}, key), scope: 'kit' });
    }
  }
  const withTokens = entries.concat(kitOnly).filter(e => typeof e.move.tokens === 'function');
  if (withTokens.length) {
    def.tokens = function (t, ...rest) {   // rest = the framework's extra args (the view state)
      const out = {}, bus = {};
      const mode = t && t.isDark ? 'dark' : 'light';
      for (const it of withTokens) {
        try {
          const r = it.move.tokens(t, it.P[mode], makeCtx(it.scope, 'light', mode, bus), ...rest) || {};
          Object.assign(out, r); Object.assign(bus, r);
        } catch (err) { console.warn(`move ${it.move.id} tokens (${key}) failed:`, err); }
      }
      return out;
    };
  }

  // art.hero: generator -> that move's art hook; svg / image -> a hook that returns the sanitised markup.
  const artCss = [];
  let artOwner = null;
  const hero = spec.art && spec.art.hero;
  if (spec.art !== undefined && (typeof spec.art !== 'object' || spec.art === null)) console.warn(`spec "${key}": art must be an object (skipped)`);
  else if (hero) {
    if (hero.kind === 'generator') {
      const move = MOVES[hero.move];
      if (!move || !move.hooks || typeof move.hooks.art !== 'function') console.warn(`spec "${key}": art.hero generator "${hero.move}" is not a move with an art hook (skipped)`);
      else {
        // the generator's params come from art.hero.params over the same move's entry in `moves` (if any)
        // Already in `moves`: reuse that entry (its css is already emitted); art.hero.params then give the hook its own
        // params without a second css pass. Not in `moves`: the move joins the spec as a board-scoped entry.
        const base = byId[move.id];
        let item;
        if (!base) item = addEntry(move, hero.params, 'board');
        else if (!hero.params) item = base;
        else item = { move, raw: Object.assign({}, base.raw, hero.params), P: resolveParams(move, Object.assign({}, base.raw, hero.params), key), scope: base.scope };
        artOwner = { move, item };
      }
    } else if (hero.kind === 'svg') {
      // Source of the file: opts.files (text already fetched by the caller, path -> text) first; a trusted
      // spec with only opts.base falls back to a synchronous read (the lab).
      const files = opts.files || (opts.untrusted ? {} : null);
      let text = null, err = '';
      if (typeof hero.src !== 'string' || !/^[A-Za-z0-9._\- /]+\.svg$/i.test(hero.src) || hero.src.includes('..') || hero.src.startsWith('/')) err = 'art.hero.src must be a relative .svg path';
      else if (files && typeof files[hero.src] === 'string') text = files[hero.src];
      else if (opts.base && !opts.untrusted && !files) { const r = xhrText(opts.base + hero.src); if (r.err) err = `cannot read art ${opts.base}${hero.src} (${r.err})`; else text = r.text; }
      else err = files ? `art file ${hero.src} is not in the supplied files` : 'art.hero svg needs a base folder (loaded from aesthetic.json)';
      if (err) (err.startsWith('cannot read') ? console.error : console.warn)(`spec "${key}": ${err} (art skipped)`);
      else {
        const { svg, stripped } = specSanitizeSvg(text, { fit: hero.fit === 'contain' ? 'contain' : 'cover' });
        if (!svg) console.error(`spec "${key}": ${hero.src} is not a usable SVG (${stripped.join(', ')}); art skipped`);
        else {
          if (stripped.length) console.warn(`spec "${key}": sanitised ${hero.src}, stripped: ${stripped.join(', ')}`);
          const html = `<div class="spec-hero spec-hero-svg" role="img" aria-label="${escAttr(hero.alt || '')}">${svg}</div>`;
          def.art = () => html;
        }
      }
    } else if (hero.kind === 'image') {
      const files = opts.files || (opts.untrusted ? {} : null);
      let url = '';
      if (!specAllowedImage(hero.src)) console.warn(`spec "${key}": art.hero.src must be a relative png/jpg/webp/gif path or a data:image URL (skipped)`);
      else if (hero.src.startsWith('data:')) url = hero.src;
      else if (files && typeof files[hero.src] === 'string' && files[hero.src].startsWith('data:') && specAllowedImage(files[hero.src])) url = files[hero.src];
      else if (!opts.untrusted) url = (opts.base || '') + hero.src;
      else console.warn(`spec "${key}": art image ${hero.src} is not in the supplied files as a data:image URL (skipped)`);
      if (url) {
        const html = `<img class="spec-hero spec-hero-img" src="${escAttr(url)}" alt="${escAttr(hero.alt || '')}" style="object-fit:${hero.fit === 'contain' ? 'contain' : 'cover'}">`;
        def.art = () => html;
      }
    } else console.warn(`spec "${key}": art.hero kind "${hero.kind}" must be generator|svg|image (skipped)`);
    if (def.art) artCss.push(`${S} .ab-art > .spec-hero { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }\n${S} .ab-art > .spec-hero-svg > svg { display: block; width: 100%; height: 100%; }`);
  }

  // hooks: first provider wins; fn is called as fn.call(def, p, ctx, ...hookArgs). p and ctx.mode follow the
  // mode found in the hook's arguments (a .isDark or .t.isDark), light otherwise.
  const owner = {};
  const argMode = args => {
    for (const a of args) {
      if (a && typeof a === 'object') {
        if (typeof a.isDark === 'boolean') return a.isDark ? 'dark' : 'light';
        if (a.t && typeof a.t.isDark === 'boolean') return a.t.isDark ? 'dark' : 'light';
      }
    }
    return 'light';
  };
  const wireHook = (it, name, fn) => {
    owner[name] = it.move.id;
    def[name] = function (...args) {
      const mode = argMode(args);
      return fn.call(this, it.P[mode], makeCtx(it.scope, 'light', 'any', null), ...args);
    };
  };
  if (artOwner) wireHook(artOwner.item, 'art', artOwner.move.hooks.art);
  else if (def.art) owner.art = 'art.hero';
  for (const it of entries) {
    for (const [name, fn] of Object.entries(it.move.hooks || {})) {
      if (RESERVED_HOOKS.includes(name) || typeof fn !== 'function') { console.warn(`move ${it.move.id}: hook "${name}" ignored`); continue; }
      if (owner[name]) { if (owner[name] !== it.move.id && !opts.quietHooks) console.warn(`spec "${key}": hook "${name}" from "${it.move.id}" ignored; "${owner[name]}" provides it`); continue; }
      wireHook(it, name, fn);
    }
  }

  // css: each move's css(S, p, ctx), then kit materials / states per component. An entry with any
  // { light, dark } pair param is written twice: light values on S, dark values on SD (higher specificity).
  const parts = [];
  const emit = (label, P, scope, fn) => {
    if (!P.pair) {
      try { parts.push(`/* ${label} */\n${fn(P.light, makeCtx(scope, 'light', 'any')) || ''}`); }
      catch (err) { console.warn(`${label} (${key}) failed:`, err); }
      return;
    }
    for (const side of ['light', 'dark']) {
      try { parts.push(`/* ${label}${side === 'dark' ? ' (dark)' : ''} */\n${fn(P[side], makeCtx(scope, side, side)) || ''}`); }
      catch (err) { console.warn(`${label} ${side} (${key}) failed:`, err); }
    }
  };
  for (const it of entries) {
    if (typeof it.move.css !== 'function') continue;
    emit(`move ${it.move.id}`, it.P, it.scope, (p, c) => it.move.css(c.S, p, c));
  }
  const paramsOf = (move, over) => {
    const base = byId[move.id];
    if (!over) return base ? base.P : resolveParams(move, {}, key);
    return resolveParams(move, Object.assign({}, base ? base.raw : {}, over), key);
  };
  for (const [comp, rule] of Object.entries(spec.kit || {})) {
    const frags = KIT_COMPONENTS[comp];
    if (!frags) { console.warn(`spec "${key}": unknown kit component "${comp}" (skipped)`); continue; }
    const scope = scopeOf(rule, `kit.${comp}`);
    const over = (rule && rule.params) || {};
    const run = (kind, name, reg) => {
      const hit = reg[name];
      if (!hit) { console.warn(`spec "${key}": kit.${comp} unknown ${kind} "${name}" (skipped)`); return; }
      const P = paramsOf(hit.move, over[name] || over[hit.move.id]);
      emit(`${comp}: ${kind} ${name}`, P, scope, (p, c) => hit[kind].css(c.S, listFor(c.mode === 'dark' ? SD : S, frags, scope), p, Object.assign(c, { component: comp })));
    };
    if (rule && rule.material) run('material', rule.material, MATERIALS);
    for (const s of [].concat((rule && rule.state) || [])) run('state', s, STATES);
  }
  for (const c of artCss) parts.push(`/* art.hero */\n${c}`);
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

/* unregisterSpecAesthetic(key): undoes registerSpecAesthetic (def, generated <style>, meta/build entries).
   Returns false when the key is not a registered spec. */
function unregisterSpecAesthetic(key) {
  if (!SPECS[key]) return false;
  delete SPECS[key]; delete CSS[key];
  const old = document.getElementById('spec-' + key);
  if (old) old.remove();
  if (typeof unregisterAesthetic === 'function') unregisterAesthetic(key);
  return true;
}

window.registerMove = registerMove;
window.registerSpecAesthetic = registerSpecAesthetic;
window.unregisterSpecAesthetic = unregisterSpecAesthetic;
window.KIT_COMPONENTS = KIT_COMPONENTS;
window.specContrastFit = specContrastFit;
window.specSanitizeSvg = specSanitizeSvg;
window.specAllowedImage = specAllowedImage;
window.SPEC_SVG_RULES = SPEC_SVG_RULES;
if (typeof module !== 'undefined' && module.exports) module.exports = { specSanitizeSvg, specAllowedImage, SPEC_SVG_RULES };
})();
