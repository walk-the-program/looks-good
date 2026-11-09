/* aesthetic-sheets.js
   Keeps the page's style recalculations cheap. index.html links ~73 stylesheets under css/aesthetics/
   (every style, plus the "classic" copies), ~25,000 rules, each scoped by the board root's
   data-ae="<key>". The browser matches all of them on every restyle of a board, so the Built view's UI kit
   (~3,300 elements) restyles in ~90 ms instead of ~13 ms. While the Built view is the only thing on screen,
   the sheets of styles it does not draw are switched off (sheet.disabled = true).

   Public: window.AestheticSheets
     sync()          disable the sheets the page does not need right now, or enable all of them (see eligible())
     touch(key)      called by abRootAttrs (js/aesthetic-board.js) for every data-ae it writes: a board of a style
                     whose sheet is off turns every sheet back on at once, before the markup is inserted
     enableAll()     turn every aesthetic sheet on
     state()         { trimmed, disabled, indexed, sheets } for diagnostics

   Safety rules (when in doubt a sheet stays on):
     - only <link> sheets under css/aesthetics/ are managed; custom styles' own <style> sheets never are
     - a sheet is managed only if EVERY selector of EVERY style rule is scoped to one or more
       [data-ae="key"] (or :is([data-ae=a], [data-ae=b])) and its cssRules are readable
     - a sheet that defines @keyframes / @font-face / @property used or also defined by another sheet
       (the cascade or a shared name could change) is never disabled
     - sync() trims only when the brand workspace is the active mode, the Built tab is showing, and no other
       style surface (style gallery, studio, reveal wall) is open; touch() undoes it for anything else
       that draws a board (share export, onboarding, presentations, AI brief, ...)

   The functions marked "pure" take plain data, so tests/run.js can run them without a DOM. */
(function () {
  'use strict';

  /* ---------------- pure: selectors -> data-ae keys ---------------- */

  // Split on commas that are not inside (), [] or a string.
  function splitTop(s) {
    const out = [];
    let d = 0, q = null, cur = '';
    for (const ch of String(s)) {
      if (q) { cur += ch; if (ch === q) q = null; continue; }
      if (ch === '"' || ch === "'") { q = ch; cur += ch; continue; }
      if (ch === '(' || ch === '[') d++; else if (ch === ')' || ch === ']') d--;
      if (ch === ',' && d === 0) { out.push(cur); cur = ''; continue; }
      cur += ch;
    }
    out.push(cur);
    return out.map(x => x.trim()).filter(Boolean);
  }

  const ATTR = '\\[\\s*data-ae\\s*([~|^$*]?=)?\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\]\\s"\']+))\\s*\\]';

  function parenDepthAt(s, i) {
    let d = 0;
    for (let k = 0; k < i; k++) { if (s[k] === '(') d++; else if (s[k] === ')') d--; }
    return d;
  }

  // Index of the ")" that closes the "(" at `open`, or -1.
  function closeOf(s, open) {
    let d = 0, q = null;
    for (let k = open; k < s.length; k++) {
      const ch = s[k];
      if (q) { if (ch === q) q = null; continue; }
      if (ch === '"' || ch === "'") q = ch;
      else if (ch === '(') d++;
      else if (ch === ')' && --d === 0) return k;
    }
    return -1;
  }

  // One comma-free selector: { keys, scoped }. A :is() / :where() whose every argument is itself scoped counts as
  // scoped to the union of their keys (it matches only if one argument does); data-ae anywhere else inside a
  // function (:not, :has, ...) or with an operator other than = is not scoped.
  function scopeOfPart(part) {
    const keys = [];
    let scoped = true;
    let out = '', at = 0, m;
    const fn = /:(?:is|where)\(/g;   // local: the recursion below must not share its position
    while ((m = fn.exec(part))) {
      if (m.index < at) continue;
      const open = m.index + m[0].length - 1, close = closeOf(part, open);
      if (close < 0) break;
      const args = splitTop(part.slice(open + 1, close)).map(scopeOfPart);
      if (args.length && args.every(a => a.scoped)) {
        args.forEach(a => keys.push(...a.keys));
        out += part.slice(at, m.index) + '[data-ae="@"]';   // stands in for "one of the keys"
        at = close + 1;
        fn.lastIndex = at;
      }
    }
    out += part.slice(at);
    const re = new RegExp(ATTR, 'g');
    let n = 0;
    while ((m = re.exec(out))) {
      n++;
      const k = m[2] !== undefined ? m[2] : m[3] !== undefined ? m[3] : m[4];
      if (m[1] !== '=' || parenDepthAt(out, m.index) > 0) scoped = false;
      if (k !== '@') keys.push(k);
    }
    if (!n) scoped = false;
    return { keys, scoped };
  }

  // pure. selectorText -> { keys: [data-ae values], scoped: bool }. scoped is true only when every
  // comma-separated part of the selector is confined to the listed keys.
  function scopeOfSelector(selectorText) {
    const keys = new Set();
    let scoped = true;
    splitTop(selectorText).forEach(part => {
      const r = scopeOfPart(part);
      r.keys.forEach(k => keys.add(k));
      if (!r.scoped) scoped = false;
    });
    return { keys: [...keys], scoped };
  }

  /* ---------------- pure: sheets ---------------- */

  // pure. rules: [{ t: 'style', sel, anim? } | { t: 'group', rules } | { t: 'keyframes', name } |
  //                 { t: 'fontface' } | { t: 'other' }]  ->  { keys, safe, defines, uses }
  // `anim` is a style rule's animation-name (to find @keyframes shared between sheets).
  function analyzeRules(rules) {
    const info = { keys: new Set(), safe: true, defines: new Set(), uses: new Set(), fonts: false };
    (function walk(list) {
      list.forEach(r => {
        if (r.t === 'style') {
          const s = scopeOfSelector(r.sel);
          s.keys.forEach(k => info.keys.add(k));
          if (!s.scoped) info.safe = false;
          if (r.anim) String(r.anim).split(/[\s,]+/).forEach(n => { if (n) info.uses.add(n); });
        } else if (r.t === 'group') walk(r.rules || []);
        else if (r.t === 'keyframes') info.defines.add(r.name);
        else if (r.t === 'fontface') info.fonts = true;
        else info.safe = false;     // @import, @layer, @property, @namespace ...: leave the sheet alone
      });
    })(rules);
    if (!info.keys.size) info.safe = false;
    return info;
  }

  // pure. infos: analyzeRules results (or null for an unreadable sheet) -> managed[]: true where the sheet may be disabled.
  // A sheet is unmanaged when unsafe, when it has @font-face, or when a @keyframes name it defines is defined in or
  // used by another sheet.
  function manageable(infos) {
    const definedIn = new Map(), usedIn = new Map();
    infos.forEach((inf, i) => {
      if (!inf) return;
      inf.defines.forEach(n => { (definedIn.get(n) || definedIn.set(n, new Set()).get(n)).add(i); });
      inf.uses.forEach(n => { (usedIn.get(n) || usedIn.set(n, new Set()).get(n)).add(i); });
    });
    return infos.map((inf, i) => {
      if (!inf || !inf.safe || inf.fonts) return false;
      for (const n of inf.defines) {
        if (definedIn.get(n).size > 1) return false;
        const u = usedIn.get(n);
        if (u && [...u].some(j => j !== i)) return false;
      }
      return true;
    });
  }

  // pure. The data-ae values a board drawn from `def` can carry: the def itself (a classic copy keeps its own key),
  // its classic base, and the base and donor of a blend or curated combo.
  function neededKeys(def) {
    const out = new Set();
    const add = d => { if (d && d.key) { out.add(d.key); if (d.classicOf) out.add(d.classicOf); } };
    add(def);
    if (def && def.blend) { add(def.blend.base); add(def.blend.donor); }
    return out;
  }

  // pure. Which sheet indices stay on: unmanaged sheets, and managed ones sharing a key with `needed`.
  function enabledIndices(infos, managed, needed) {
    const on = new Set();
    infos.forEach((inf, i) => {
      if (!managed[i] || [...inf.keys].some(k => needed.has(k))) on.add(i);
    });
    return on;
  }

  /* ---------------- browser ---------------- */

  const MANAGED_RE = /\/css\/aesthetics\//;
  let sheets = null;          // [{ sheet, info, managed }] once indexed
  let enabledKeys = null;     // Set of data-ae keys the on sheets cover while trimmed; null = everything on
  let trimmed = false;
  const held = new Set();     // keys other surfaces drew while trimmed: stay fully on until they are the current brand's keys, or the page is ineligible
  let lastSig = '';

  function ruleToPlain(r) {
    const C = window.CSSRule;
    if (r.type === (C && C.STYLE_RULE || 1)) return { t: 'style', sel: r.selectorText, anim: r.style && r.style.animationName && r.style.animationName !== 'none' ? r.style.animationName : '' };
    if (r.type === (C && C.KEYFRAMES_RULE || 7)) return { t: 'keyframes', name: r.name };
    if (r.type === (C && C.FONT_FACE_RULE || 5)) return { t: 'fontface' };
    if (r.type === (C && C.MEDIA_RULE || 4) || r.type === (C && C.SUPPORTS_RULE || 12) || (r.cssRules && !r.selectorText && r.type !== 7)) {
      // @media / @supports / @container: their inner rules decide (a nested style rule inherits its parent's scope)
      return { t: 'group', rules: Array.from(r.cssRules || []).map(ruleToPlain) };
    }
    return { t: 'other' };
  }

  function index() {
    if (sheets) return sheets;
    const list = [];
    Array.from(document.styleSheets).forEach(sheet => {
      const href = sheet.href || '';
      if (!MANAGED_RE.test(href)) return;
      let info = null;
      try { const rs = Array.from(sheet.cssRules); info = rs.length ? analyzeRules(rs.map(ruleToPlain)) : null; } catch (e) { info = null; }   // unreadable (cross-origin / file://)
      list.push({ sheet, info });
    });
    const managed = manageable(list.map(x => x.info));
    list.forEach((x, i) => { x.managed = managed[i]; });
    sheets = list;
    return sheets;
  }

  function enableAll() {
    if (sheets) sheets.forEach(x => { if (x.sheet.disabled) x.sheet.disabled = false; });
    enabledKeys = null;
    trimmed = false;
  }

  // The Built tab is the only surface that may trim. Every check is "is something else drawing styles": any
  // doubt returns false.
  function eligible() {
    if (typeof document === 'undefined' || !document.body) return false;
    if (document.body.dataset.view !== 'editor') return false;                       // Brands / Patterns / Logos / Styles homes
    if (typeof boardView === 'undefined' || boardView !== 'built') return false;     // Board, Compare, Patterns, Deck, Brief
    if (window.StyleGallery && StyleGallery.isOpen()) return false;
    if (window.Studio && Studio.isOpen()) return false;
    if (document.querySelector('.m-worlds')) return false;                           // the reveal wall (js/reveal.js)
    return true;
  }

  function currentDef() {
    try {
      if (typeof abView === 'function') return abView().def;
      if (typeof resolveAestheticDef === 'function' && typeof state !== 'undefined') return resolveAestheticDef(state);
    } catch (e) { /* fall through */ }
    return null;
  }

  function sync() {
    if (!eligible()) { held.clear(); lastSig = ''; if (trimmed || (sheets && sheets.some(x => x.sheet.disabled))) enableAll(); return; }
    if (document.readyState !== 'complete') return;       // sheets may still be loading: index them once they are all in
    const def = currentDef();
    if (!def) { enableAll(); return; }
    const need = neededKeys(def);
    // another surface drew a style that is not this brand's: leave everything on (a style the brand itself just
    // switched to, drawn first by the sidebar preview, does not count)
    if (held.size) { if ([...held].every(k => need.has(k))) held.clear(); else return; }
    const sig = [...need].sort().join('|');
    if (trimmed && sig === lastSig) return;
    const idx = index();
    if (!idx.length) return;
    const infos = idx.map(x => x.info), managed = idx.map(x => x.managed);
    const on = enabledIndices(infos, managed, need);
    const keys = new Set();
    idx.forEach((x, i) => {
      const want = on.has(i);
      if (x.sheet.disabled === want) x.sheet.disabled = !want;
      if (want && x.info) x.info.keys.forEach(k => keys.add(k));
    });
    need.forEach(k => keys.add(k));
    enabledKeys = keys;
    trimmed = true;
    lastSig = sig;
  }

  // Called for every data-ae the board code writes.
  function touch(key) {
    if (!trimmed || !enabledKeys || enabledKeys.has(key)) return;
    enableAll();
    held.add(key);
  }

  // Leaving or entering the brand workspace (Brands / Patterns / Logos / Styles homes set body[data-view]).
  function watchView() {
    if (typeof MutationObserver !== 'function' || !document.body) return;
    new MutationObserver(() => sync()).observe(document.body, { attributes: true, attributeFilter: ['data-view'] });
  }
  if (typeof document !== 'undefined' && document.addEventListener) { if (document.body) watchView(); else document.addEventListener('DOMContentLoaded', watchView); }
  // Index the sheets once the page is idle, so the first Built draw does not pay for it.
  if (typeof window.addEventListener === 'function') window.addEventListener('load', () => { (window.requestIdleCallback || (f => setTimeout(f, 1500)))(() => { try { index(); } catch (e) { /* indexed on demand */ } }); });

  window.AestheticSheets = {
    sync, touch, enableAll,
    state: () => ({ trimmed, held: [...held], indexed: !!sheets, sheets: sheets ? sheets.length : 0, managed: sheets ? sheets.filter(x => x.managed).length : 0, disabled: sheets ? sheets.filter(x => x.sheet.disabled).length : 0 }),
    // pure helpers (tests/run.js)
    scopeOfSelector, analyzeRules, manageable, neededKeys, enabledIndices, splitTop,
  };
})();
