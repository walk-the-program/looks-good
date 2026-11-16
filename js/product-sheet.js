/* -----------------------------------------------------------------------
   product-sheet.js — the product sheet (docs/product-sheet-format.md):
   parseProductSheet(text, sourceName), productScreenSig(state, screen) and
   productApprovalStatus(state). Pure: no DOM, so tests load it in a vm.
----------------------------------------------------------------------- */

const PRODUCT_BLOCK_TYPES = ['title', 'hero-numeral', 'text', 'action', 'action-secondary', 'link', 'card', 'list', 'stats',
  'chart', 'segmented', 'toggle', 'field', 'keypad', 'tiles', 'callout', 'progress', 'chord'];
const PRODUCT_CHROMES = ['tabbar', 'topbar', 'none'];
const PRODUCT_MAC_CHROMES = ['sidebar', 'toolbar', 'none'];
const PRODUCT_PLATFORMS = ['iphone', 'mac'];
const PRODUCT_STATE_KEYS = { empty: 'empty', loading: 'loading', error: 'error', 'first run': 'firstRun' };

function productSlug(name) {
  return String(name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'screen';
}

/* ---- chord blocks and Mac columns: shared by the parser, the renderer (js/product-screens.js) and the brief (js/ai-brief.js) ---- */

const PRODUCT_CHORD_LABELS = ['inside', 'below', 'none'];
const PRODUCT_CHORD_ORIENTS = ['horizontal', 'vertical'];

// '#rgb' or '#rrggbb' -> '#rrggbb' in lower case; anything else -> null. The only way a content colour reaches a style="".
function productHex(v) {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(v == null ? '' : v).trim());
  if (!m) return null;
  const h = m[1].toLowerCase();
  return '#' + (h.length === 3 ? h.replace(/./g, c => c + c) : h);
}

// A chord's `items` ("label = weight = #colour; ...", the parts in any order) -> { items: [{ label, weight, color }], problems: [string] }.
// A missing weight is 1; a missing or invalid colour is null (the style draws a tonal step).
function productChordItems(str) {
  const items = [], problems = [];
  String(str == null ? '' : str).split(';').map(s => s.trim()).filter(Boolean).forEach((raw, i) => {
    let color = null, weight = null;
    const rest = [];
    raw.split('=').map(s => s.trim()).filter(Boolean).forEach(b => {
      if (color === null && productHex(b)) color = productHex(b);
      else if (weight === null && Number.isFinite(Number(b)) && Number(b) > 0) weight = Number(b);
      else rest.push(b);
    });
    const li = rest.findIndex(b => b.charAt(0) !== '#');
    const label = li >= 0 ? rest.splice(li, 1)[0] : '';
    const name = label ? `"${label}"` : `#${i + 1}`;
    if (!label) problems.push(`Chord item ${name} has no label.`);
    rest.forEach(b => {
      if (b.charAt(0) !== '#' && (Number.isFinite(Number(b)) || weight === null)) problems.push(`Chord item ${name}: weight "${b}" is not a number above 0; uses 1.`);
      else problems.push(`Chord item ${name}: colour "${b}" is not #rgb or #rrggbb; drawn in the style's tonal steps.`);
    });
    items.push({ label, weight: weight === null ? 1 : weight, color });
  });
  return { items, problems };
}

// The chord's `labels` and `orient`, with the sheet's fallbacks (inside, horizontal).
function productChordOpts(props) {
  const p = props || {};
  const l = String(p.labels == null ? '' : p.labels).trim().toLowerCase(), o = String(p.orient == null ? '' : p.orient).trim().toLowerCase();
  return { labels: PRODUCT_CHORD_LABELS.indexOf(l) >= 0 ? l : 'inside', orient: PRODUCT_CHORD_ORIENTS.indexOf(o) >= 0 ? o : 'horizontal' };
}

// A block that sits in the pinned bottom bar: the keypad, and actions marked `pin: bottom`.
function productBlockPinned(b) {
  return !!b && (b.type === 'keypad' || ((b.type === 'action' || b.type === 'action-secondary') && /^bottom$/i.test((b.props && b.props.pin) || '')));
}

// Which Mac column a block sits in: 'side' | 'main' | 'inspector'. Mac only; pinned blocks and iPhone are always 'main'.
function productColumnOf(block, platform) {
  if (platform !== 'mac' || !block || productBlockPinned(block)) return 'main';
  const c = String((block.props && block.props.column) == null ? '' : block.props.column).trim().toLowerCase();
  return c === 'side' || c === 'sidebar' ? 'side' : c === 'inspector' ? 'inspector' : 'main';
}

// Screen chrome depends on the platform. iPhone: tabbar | topbar | none (default topbar). Mac: sidebar | toolbar | none,
// where tabbar reads as sidebar and topbar as toolbar; the default is sidebar when the product has Tabs, else toolbar.
function resolveChromes(product, warn) {
  const mac = product.platform === 'mac';
  product.screens.forEach(scr => {
    const c = scr._chrome, line = scr._chromeLine;
    delete scr._chrome; delete scr._chromeLine;
    const fallback = mac ? (product.tabs.length ? 'sidebar' : 'toolbar') : 'topbar';
    if (c == null) { scr.chrome = fallback; return; }
    if (mac) {
      const mapped = c === 'tabbar' ? 'sidebar' : c === 'topbar' ? 'toolbar' : c;
      if (PRODUCT_MAC_CHROMES.indexOf(mapped) >= 0) scr.chrome = mapped;
      else { scr.chrome = fallback; warn(line, `Chrome "${c}" is not sidebar, toolbar or none; using ${fallback}.`); }
    } else if (PRODUCT_CHROMES.indexOf(c) >= 0) scr.chrome = c;
    else { scr.chrome = 'topbar'; warn(line, `Chrome "${c}" is not tabbar, topbar or none; using topbar.`); }
  });
}

// Never throws. Returns { product, warnings: [{ line, message }] }; product is null when the text holds neither
// a "# Product:" line nor a screen.
function parseProductSheet(text, sourceName) {
  const warnings = [];
  const warn = (line, message) => warnings.push({ line, message });
  const raw = text == null ? '' : String(text);
  const product = { name: '', purpose: '', coreAction: '', platform: 'iphone', tabs: [], screens: [], source: sourceName == null ? null : String(sourceName), raw };
  try {
    const lines = raw.replace(/^﻿/, '').split(/\r\n|\r|\n/);
    let hasHeader = false, scr = null, mode = null; // mode: 'content' | 'states' | null
    const ids = Object.create(null);   // a screen called "constructor" must not collide with Object.prototype
    const closeScreen = () => {
      if (!scr) return;
      if (!scr.job) warn(scr._line, `Screen "${scr.name}" has no Job line.`);
      if (!scr._hasPrimary) warn(scr._line, `Screen "${scr.name}" has no Primary action line (write "none" if it has no main action).`);
      if (!scr.blocks.length) warn(scr._line, `Screen "${scr.name}" has no Content blocks.`);
      delete scr._line; delete scr._hasPrimary; delete scr._seen;
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
      if (type === 'chord') {
        const ch = productChordItems(props.items);
        if (!ch.items.length) warn(n, 'Chord has no items; nothing is drawn.');
        ch.problems.forEach(msg => warn(n, msg));
        if (props.labels != null && PRODUCT_CHORD_LABELS.indexOf(props.labels.toLowerCase()) < 0) warn(n, `Chord labels "${props.labels}" is not inside, below or none; uses inside.`);
        if (props.orient != null && PRODUCT_CHORD_ORIENTS.indexOf(props.orient.toLowerCase()) < 0) warn(n, `Chord orient "${props.orient}" is not horizontal or vertical; uses horizontal.`);
      }
      if (props.column) {
        const c = props.column.toLowerCase();
        if (product.platform !== 'mac') warn(n, 'column applies to Mac windows; drawn in the single column.');
        else if (['side', 'sidebar', 'main', 'content', 'inspector'].indexOf(c) < 0) warn(n, `Column "${props.column}" is not side, main or inspector; uses main.`);
        else if (c !== 'main' && c !== 'content' && productBlockPinned(scr.blocks[scr.blocks.length - 1])) warn(n, 'Pinned blocks sit at the foot of the main column; column ignored.');
      }
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
        scr = { id, name: name || 'Screen', job: '', primary: null, chrome: 'topbar', fold: null, signature: null, blocks: [], _chrome: null, _chromeLine: 0,
          states: { empty: 'not specified', loading: 'not specified', error: 'not specified', firstRun: 'not specified' }, notes: [], _line: n, _hasPrimary: false };
        product.screens.push(scr);
        mode = null;
        return;
      }
      if (/^#{1,6}\s/.test(line) && !scr) { warn(n, 'Unrecognised heading ignored.'); return; }
      if (!scr) {
        if ((m = /^(Purpose|Core action|Tabs|Platform)\s*:\s*(.*)$/i.exec(line))) {
          const key = m[1].toLowerCase();
          if (key === 'purpose') product.purpose = m[2].trim();
          else if (key === 'core action') product.coreAction = m[2].trim();
          else if (key === 'platform') {
            const p = m[2].trim().toLowerCase().replace(/\s+/g, '');
            const q = p === 'macos' ? 'mac' : p;
            if (PRODUCT_PLATFORMS.indexOf(q) >= 0) product.platform = q;
            else { product.platform = 'iphone'; warn(n, `Platform "${m[2].trim()}" is not iphone or mac; using iphone.`); }
          } else product.tabs = m[2].split(',').map(s => s.trim()).filter(Boolean);
        } else warn(n, `Line outside any screen was ignored: "${line.slice(0, 40)}".`);
        return;
      }
      // inside a screen
      if (mode === 'content' && (m = /^(\d+)[.)]\s*(.*)$/.exec(line))) {
        scr._seen = (scr._seen || 0) + 1;   // numbered lines seen, so an unknown block (kept in notes) does not shift the check
        if (+m[1] !== scr._seen) warn(n, `Block number ${m[1]} is out of order; ranked by position.`);
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
          scr._chrome = val.toLowerCase().replace(/\s+/g, ''); scr._chromeLine = n;   // resolved once Platform is known
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
    resolveChromes(product, warn);
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
  if (st.product && st.product.platform === 'mac') look.platform = 'mac';   // iPhone sigs stay as they were
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
