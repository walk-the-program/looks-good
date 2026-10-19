/* -----------------------------------------------------------------------
   product-sheet.js — the product sheet (docs/product-sheet-format.md):
   parseProductSheet(text, sourceName), productScreenSig(state, screen) and
   productApprovalStatus(state). Pure: no DOM, so tests load it in a vm.
----------------------------------------------------------------------- */

const PRODUCT_BLOCK_TYPES = ['title', 'hero-numeral', 'text', 'action', 'action-secondary', 'link', 'card', 'list', 'stats',
  'chart', 'segmented', 'toggle', 'field', 'keypad', 'tiles'];
const PRODUCT_CHROMES = ['tabbar', 'topbar', 'none'];
const PRODUCT_STATE_KEYS = { empty: 'empty', loading: 'loading', error: 'error', 'first run': 'firstRun' };

function productSlug(name) {
  return String(name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'screen';
}

// Never throws. Returns { product, warnings: [{ line, message }] }; product is null when the text holds neither
// a "# Product:" line nor a screen.
function parseProductSheet(text, sourceName) {
  const warnings = [];
  const warn = (line, message) => warnings.push({ line, message });
  const raw = text == null ? '' : String(text);
  const product = { name: '', purpose: '', coreAction: '', tabs: [], screens: [], source: sourceName == null ? null : String(sourceName), raw };
  try {
    const lines = raw.replace(/^﻿/, '').split(/\r\n|\r|\n/);
    let hasHeader = false, scr = null, mode = null; // mode: 'content' | 'states' | null
    const ids = {};
    const closeScreen = () => {
      if (!scr) return;
      if (!scr.job) warn(scr._line, `Screen "${scr.name}" has no Job line.`);
      if (!scr._hasPrimary) warn(scr._line, `Screen "${scr.name}" has no Primary action line (write "none" if it has no main action).`);
      if (!scr.blocks.length) warn(scr._line, `Screen "${scr.name}" has no Content blocks.`);
      delete scr._line; delete scr._hasPrimary;
      scr = null; mode = null;
    };
    const parseBlock = (body, n) => {
      const parts = body.split('|').map(s => s.trim());
      const head = /^([a-z][a-z-]*)\s*:\s*([\s\S]*)$/i.exec(parts[0]) || /^([a-z][a-z-]*)\s*$/i.exec(parts[0]);
      const type = head ? head[1].toLowerCase() : '';
      if (!head || PRODUCT_BLOCK_TYPES.indexOf(type) < 0) {
        warn(n, `Unknown block type "${type || parts[0].slice(0, 20)}"; kept in the screen's notes.`);
        scr.notes.push(body);
        return;
      }
      const props = {};
      let textMain = head[2] != null ? head[2].trim() : '';
      parts.slice(1).forEach(p => {
        const kv = /^([a-z][a-z0-9 -]*?)\s*:\s*([\s\S]*)$/i.exec(p);
        if (kv) props[kv[1].toLowerCase()] = kv[2].trim();
        else if (p) { warn(n, `"${p.slice(0, 30)}" is not "key: value"; added to the block text.`); textMain += (textMain ? ' | ' : '') + p; }
      });
      scr.blocks.push({ rank: scr.blocks.length + 1, type, text: textMain, props });
    };

    lines.forEach((rawLine, i) => {
      const n = i + 1, line = rawLine.trim();
      if (!line) return;
      let m;
      if ((m = /^#\s+Product\s*:\s*(.*)$/i.exec(line))) {
        if (hasHeader) { warn(n, 'A second "# Product:" line was ignored.'); return; }
        hasHeader = true; product.name = m[1].trim(); mode = null;
        if (!product.name) warn(n, 'The product has no name.');
        return;
      }
      if ((m = /^##\s+Screen\s*:\s*(.*)$/i.exec(line))) {
        closeScreen();
        const name = m[1].trim();
        if (!name) warn(n, 'A screen has no name.');
        let id = productSlug(name), k = 2;
        while (ids[id]) id = productSlug(name) + '-' + k++;
        ids[id] = true;
        scr = { id, name: name || 'Screen', job: '', primary: null, chrome: 'topbar', fold: null, signature: null, blocks: [],
          states: { empty: 'not specified', loading: 'not specified', error: 'not specified', firstRun: 'not specified' }, notes: [], _line: n, _hasPrimary: false };
        product.screens.push(scr);
        mode = null;
        return;
      }
      if (/^#{1,6}\s/.test(line) && !scr) { warn(n, 'Unrecognised heading ignored.'); return; }
      if (!scr) {
        if ((m = /^(Purpose|Core action|Tabs)\s*:\s*(.*)$/i.exec(line))) {
          const key = m[1].toLowerCase();
          if (key === 'purpose') product.purpose = m[2].trim();
          else if (key === 'core action') product.coreAction = m[2].trim();
          else product.tabs = m[2].split(',').map(s => s.trim()).filter(Boolean);
        } else warn(n, `Line outside any screen was ignored: "${line.slice(0, 40)}".`);
        return;
      }
      // inside a screen
      if (mode === 'content' && (m = /^(\d+)[.)]\s*(.*)$/.exec(line))) {
        if (+m[1] !== scr.blocks.length + 1) warn(n, `Block number ${m[1]} is out of order; ranked by position.`);
        parseBlock(m[2], n);
        return;
      }
      if (mode === 'states' && (m = /^[-*]\s*([A-Za-z ]+?)\s*:\s*(.*)$/.exec(line))) {
        const key = PRODUCT_STATE_KEYS[m[1].trim().toLowerCase()];
        if (key) scr.states[key] = m[2].trim() || 'not specified';
        else { warn(n, `Unknown state "${m[1].trim()}"; kept in the screen's notes.`); scr.notes.push(line); }
        return;
      }
      if ((m = /^(Job|Primary action|Chrome|Fold|Signature|Content|States)\s*:\s*(.*)$/i.exec(line))) {
        const key = m[1].toLowerCase(), val = m[2].trim();
        mode = null;
        if (key === 'job') scr.job = val;
        else if (key === 'primary action') { scr._hasPrimary = true; scr.primary = !val || /^none\.?$/i.test(val) ? null : val; }
        else if (key === 'chrome') {
          const c = val.toLowerCase().replace(/\s+/g, '');
          if (PRODUCT_CHROMES.indexOf(c) >= 0) scr.chrome = c;
          else warn(n, `Chrome "${val}" is not tabbar, topbar or none; using topbar.`);
        } else if (key === 'fold') scr.fold = !val || /^none\.?$/i.test(val) ? null : val;
        else if (key === 'signature') scr.signature = !val || /^none\.?$/i.test(val) ? null : val;
        else if (key === 'content') { mode = 'content'; if (val) { warn(n, 'Text after "Content:" on the same line was kept in the screen\'s notes.'); scr.notes.push(val); } }
        else if (key === 'states') { mode = 'states'; if (val) { warn(n, 'Text after "States:" on the same line was kept in the screen\'s notes.'); scr.notes.push(val); } }
        return;
      }
      warn(n, `Unrecognised line kept in the screen's notes: "${line.slice(0, 40)}".`);
      scr.notes.push(line);
    });
    closeScreen();
    if (!hasHeader) warn(1, 'Missing "# Product: <name>" line.');
    if (!product.purpose) warn(1, 'Missing "Purpose:" line.');
    if (!product.coreAction) warn(1, 'Missing "Core action:" line.');
    if (!product.screens.length) warn(1, 'No "## Screen:" sections found.');
  } catch (err) {
    warn(0, 'The sheet could not be read completely: ' + (err && err.message));
  }
  if (!product.name && !product.screens.length) return { product: null, warnings };
  return { product, warnings };
}

// JSON with sorted keys, so the same data always hashes the same.
function productStable(v) {
  if (v === undefined) return 'null';
  if (v === null || typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map(productStable).join(',') + ']';
  return '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + productStable(v[k])).join(',') + '}';
}

function productHash(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16).padStart(8, '0');
}

// The screen plus the look it is drawn in. An approval holds only while this stays the same.
function productScreenSig(state, screen) {
  const st = state || {};
  const look = {
    aesthetic: st.aesthetic || null,
    blend: st.blend || null,
    colors: st.colors || null,
    heading: st.headingFont && st.headingFont.name || null,
    body: st.bodyFont && st.bodyFont.name || null,
    scheme: st.scheme || null,
    typography: st.typography || null,
  };
  return productHash(productStable({ screen: screen || null, look }));
}

// { total, approved, stale, pending, allApproved }. An approval counts only while its sig is current.
function productApprovalStatus(state) {
  const out = { total: 0, approved: 0, stale: 0, pending: 0, allApproved: false };
  const product = state && state.product;
  if (!product || !Array.isArray(product.screens)) return out;
  const ap = (state.productApprovals && typeof state.productApprovals === 'object') ? state.productApprovals : {};
  product.screens.forEach(sc => {
    out.total++;
    const a = ap[sc.id];
    if (a && a.status === 'approved') {
      if (a.sig === productScreenSig(state, sc)) out.approved++; else out.stale++;
    } else out.pending++;
  });
  out.allApproved = out.total > 0 && out.approved === out.total;
  return out;
}
