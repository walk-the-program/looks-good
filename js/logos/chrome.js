/* ---------------------------------------------------------------------
   logos/chrome.js — LogoChrome: the working chrome around the Logos canvas (contract §3, T10).

   js/logos/home.js calls LogoChrome.mount(ctx) when an editor opens and LogoChrome.unmount() when it
   closes. ctx = { editor, doc, tokens, home, slots:{ toolbar, canvas, inspector, layers, zoom,
   exportBtn, top } }. Everything here edits through the LogoEditor API, so undo / redo and autosave
   come for free; this file never touches the document directly.

   Parts: toolbar (tools), layers panel (tree, rename, hide / lock, drag to reorder), inspector
   (artboard when nothing is selected, else transform / align / text / fill / stroke / shape),
   zoom control, undo / redo + narrow-screen panel toggles in the top bar, and the export dialog
   (SVG, PNG, logo pack .zip).

   Rebuild vs sync: the inspector and layers are rebuilt only when their structure changes (selection,
   node types, tree shape); every other change just re-syncs the values, and a field that has focus
   is never overwritten while the user types.

   Depends on LogoEditor, LogoDoc, LogoRender, LogoEngine; aibZip (js/ai-brief.js) for the pack.
   Plain <script>; exposes one global.
------------------------------------------------------------------------ */

const LogoChrome = (function () {
  'use strict';

  const MIXED = { mixed: true };
  const ROLES = [['ink', 'Ink'], ['primary', 'Primary'], ['secondary', 'Secondary'], ['accent', 'Accent'], ['canvas', 'Canvas'], ['white', 'White']];
  const ROLE_LABEL = { ink: 'Ink', primary: 'Primary', secondary: 'Secondary', accent: 'Accent', canvas: 'Canvas', white: 'White' };
  const ARTBOARDS = [
    { label: 'Horizontal 1200 × 600', w: 1200, h: 600 },
    { label: 'Square 1000 × 1000', w: 1000, h: 1000 },
    { label: 'Stacked 800 × 1000', w: 800, h: 1000 },
    { label: 'App icon 1024 × 1024', w: 1024, h: 1024 }
  ];
  const TOOLS = [
    ['select', 'Select', 'V', 'select'], ['text', 'Text', 'T', 'text'], ['rect', 'Rectangle', 'R', 'rect'],
    ['ellipse', 'Ellipse', 'O', 'ellipse'], ['line', 'Line', 'L', 'line'], ['polygon', 'Polygon', '', 'polygon'],
    ['star', 'Star', '', 'star'], ['hand', 'Hand', 'H', 'hand']
  ];
  const FILL_TYPES = ['text', 'rect', 'ellipse', 'polygon', 'star'];
  const STROKE_TYPES = ['rect', 'ellipse', 'line', 'polygon', 'star'];
  const WEIGHT_NAME = { 100: 'Thin', 200: 'ExtraLight', 300: 'Light', 400: 'Regular', 500: 'Medium', 600: 'SemiBold', 700: 'Bold', 800: 'ExtraBold', 900: 'Black' };
  const NS = 'http://www.w3.org/2000/svg';

  /* ======================= icons ======================= */
  const ICONS = {
    select: '<path d="M6 3l12 7.5-5.2 1.3L10.5 17z"/>',
    text: '<path d="M5 7V5h14v2M12 5v14M9 19h6"/>',
    rect: '<rect x="4" y="5.5" width="16" height="13" rx="1.2"/>',
    ellipse: '<ellipse cx="12" cy="12" rx="8.5" ry="6.5"/>',
    line: '<path d="M5 19 19 5"/>',
    polygon: '<path d="M12 3.5l7.4 4.3v8.4L12 20.5l-7.4-4.3V7.8z"/>',
    star: '<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.2 1 5.9L12 17l-5.2 2.8 1-5.9-4.3-4.2 5.9-.8z"/>',
    hand: '<path d="M8 13V6.5a1.5 1.5 0 013 0V11m0-1V4.8a1.5 1.5 0 013 0V11m0-4.2a1.5 1.5 0 013 0V14a6 6 0 01-6 6h-.6a6 6 0 01-4.8-2.4L4.2 14a1.5 1.5 0 012.3-1.8L8 14"/>',
    group: '<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/><path d="M13 7h4v4M11 17H7v-4" stroke-dasharray="2 2"/>',
    ungroup: '<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.6"/>',
    eyeOff: '<path d="M4 4l16 16M10 6a9 9 0 012-.5c6 0 9.5 6.5 9.5 6.5a16 16 0 01-3 3.8M6.5 7.6A16 16 0 002.5 12S6 18.5 12 18.5a9 9 0 003.4-.7"/>',
    lock: '<rect x="5.5" y="10.5" width="13" height="9" rx="1.5"/><path d="M8.5 10.5V8a3.5 3.5 0 017 0v2.5"/>',
    unlock: '<rect x="5.5" y="10.5" width="13" height="9" rx="1.5"/><path d="M8.5 10.5V8a3.5 3.5 0 016.6-1.6"/>',
    chevron: '<path d="m9 6 6 6-6 6"/>',
    undo: '<path d="M9 7 4.5 11.5 9 16M5 11.5h8.5a5 5 0 010 10H12" transform="translate(0 -3)"/>',
    redo: '<path d="m15 7 4.5 4.5L15 16M19 11.5h-8.5a5 5 0 000 10H12" transform="translate(0 -3)"/>',
    link: '<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/>',
    unlink: '<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7M4 4l3 3M20 20l-3-3"/>',
    flipH: '<path d="M12 3v18" stroke-dasharray="2 2"/><path d="M9 7 4 17h5zM15 7l5 10h-5z"/>',
    flipV: '<path d="M3 12h18" stroke-dasharray="2 2"/><path d="M7 9 17 4v5zM7 15l10 5v-5z" transform="translate(0 0)"/>',
    alignLeft: '<path d="M4 3v18"/><rect x="7" y="6" width="13" height="4" rx="0.8"/><rect x="7" y="14" width="8" height="4" rx="0.8"/>',
    alignHCenter: '<path d="M12 3v18"/><rect x="5" y="6" width="14" height="4" rx="0.8"/><rect x="8" y="14" width="8" height="4" rx="0.8"/>',
    alignRight: '<path d="M20 3v18"/><rect x="4" y="6" width="13" height="4" rx="0.8"/><rect x="9" y="14" width="8" height="4" rx="0.8"/>',
    alignTop: '<path d="M3 4h18"/><rect x="6" y="7" width="4" height="13" rx="0.8"/><rect x="14" y="7" width="4" height="8" rx="0.8"/>',
    alignVCenter: '<path d="M3 12h18"/><rect x="6" y="5" width="4" height="14" rx="0.8"/><rect x="14" y="8" width="4" height="8" rx="0.8"/>',
    alignBottom: '<path d="M3 20h18"/><rect x="6" y="4" width="4" height="13" rx="0.8"/><rect x="14" y="9" width="4" height="8" rx="0.8"/>',
    distH: '<path d="M4 4v16M20 4v16"/><rect x="9.5" y="7" width="5" height="10" rx="0.8"/>',
    distV: '<path d="M4 4h16M4 20h16"/><rect x="7" y="9.5" width="10" height="5" rx="0.8"/>',
    forward: '<rect x="4" y="9" width="11" height="11" rx="1" fill="currentColor" fill-opacity="0.18"/><rect x="9" y="4" width="11" height="11" rx="1"/>',
    backward: '<rect x="9" y="4" width="11" height="11" rx="1" fill="currentColor" fill-opacity="0.18"/><rect x="4" y="9" width="11" height="11" rx="1"/>',
    front: '<rect x="3.5" y="10.5" width="9" height="9" rx="1" fill="currentColor" fill-opacity="0.18"/><rect x="8" y="3.5" width="9" height="9" rx="1"/><path d="M19 7v3m0-3-1.5 1.5M19 7l1.5 1.5"/>',
    back: '<rect x="8" y="3.5" width="9" height="9" rx="1" fill="currentColor" fill-opacity="0.18"/><rect x="3.5" y="10.5" width="9" height="9" rx="1"/>',
    duplicate: '<rect x="8.5" y="8.5" width="11" height="11" rx="1.5"/><path d="M15.5 8.5V6A1.5 1.5 0 0014 4.5H6A1.5 1.5 0 004.5 6v8A1.5 1.5 0 006 15.5h2.5"/>',
    trash: '<path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12M10.5 11v5M13.5 11v5"/>',
    minus: '<path d="M6 12h12"/>',
    plus: '<path d="M6 12h12M12 6v12"/>',
    layers: '<path d="m12 4 8.5 4.5L12 13 3.5 8.5zM3.5 12.5 12 17l8.5-4.5M3.5 16 12 20.5 20.5 16"/>',
    panel: '<rect x="3.5" y="4.5" width="17" height="15" rx="1.5"/><path d="M14.5 4.5v15"/>',
    alL: '<path d="M4 6h16M4 10h10M4 14h16M4 18h10"/>',
    alC: '<path d="M4 6h16M7 10h10M4 14h16M7 18h10"/>',
    alR: '<path d="M4 6h16M10 10h10M4 14h16M10 18h10"/>',
    none: '<path d="M5 19 19 5"/>'
  };
  function ico(name, size) {
    const s = size || 16;
    return '<svg class="lc-ico" viewBox="0 0 24 24" width="' + s + '" height="' + s + '" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || '') + '</svg>';
  }
  const TYPE_ICON = { text: 'text', rect: 'rect', ellipse: 'ellipse', line: 'line', polygon: 'polygon', star: 'star', group: 'group' };

  /* ======================= small helpers ======================= */
  let S = null;            // the live session
  let uid = 0;

  function h(tag, props, kids) {
    const e = document.createElement(tag);
    if (props) Object.keys(props).forEach(function (k) {
      const v = props[k];
      if (v == null || v === false) return;
      if (k === 'class') e.className = v;
      else if (k === 'text') e.textContent = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k === 'style') e.style.cssText = v;
      else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? '' : v);
    });
    (kids || []).forEach(function (c) { if (c) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }
  const clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  const fmtNum = function (v) { return String(Math.round(v * 100) / 100); };
  const same = function (a, b) { return JSON.stringify(a) === JSON.stringify(b); };
  const toast = function (m) { if (typeof showToast === 'function') showToast(m); };

  function ibtn(iconName, title, onClick, cls) {
    return h('button', { type: 'button', class: 'lc-ib' + (cls ? ' ' + cls : ''), title: title, 'aria-label': title.replace(/\s*\(.*\)$/, ''), html: ico(iconName), onclick: onClick });
  }

  // Safe arithmetic for number fields: + - * / ( ) and "%" (percent of the current value). No eval.
  function calc(src, base) {
    const s = String(src).replace(/×/g, '*').replace(/−/g, '-').replace(/\s+/g, '');
    if (!s || /[^0-9+\-*/().%]/.test(s)) return null;
    let i = 0;
    const pct = function (v) { if (v != null && s[i] === '%') { i++; return base * v / 100; } return v; };
    function factor() {
      if (s[i] === '+') { i++; return factor(); }
      if (s[i] === '-') { i++; const v = factor(); return v == null ? null : -v; }
      if (s[i] === '(') {
        i++;
        const v = expr();
        if (v == null || s[i] !== ')') return null;
        i++;
        return pct(v);
      }
      const m = /^(\d*\.?\d+|\d+\.)/.exec(s.slice(i));
      if (!m) return null;
      i += m[0].length;
      return pct(parseFloat(m[0]));
    }
    function term() {
      let v = factor();
      while (v != null && (s[i] === '*' || s[i] === '/')) {
        const op = s[i++], r = factor();
        if (r == null) return null;
        v = op === '*' ? v * r : v / r;
      }
      return v;
    }
    function expr() {
      let v = term();
      while (v != null && (s[i] === '+' || s[i] === '-')) {
        const op = s[i++], r = term();
        if (r == null) return null;
        v = op === '+' ? v + r : v - r;
      }
      return v;
    }
    const v = expr();
    return v != null && i === s.length && isFinite(v) ? v : null;
  }

  function common(list, fn) {
    if (!list.length) return undefined;
    const first = fn(list[0]);
    for (let i = 1; i < list.length; i++) if (!same(first, fn(list[i]))) return MIXED;
    return first;
  }

  const selIds = function () { return S.ed.selection().filter(function (id) { return S.ed.node(id); }); };
  const selNodes = function () { return selIds().map(function (id) { return S.ed.node(id); }); };
  const tokens = function () { return S.ed.tokens ? S.ed.tokens() : S.ctx.tokens; };
  const hexOf = function (ref) { return LogoDoc.resolveColor(ref, tokens()) || '#000000'; };

  function locate(id) {          // { list, parent } of a node in the document
    let found = null;
    (function walk(list, parent) {
      list.forEach(function (n) {
        if (n.id === id) found = { list: list, parent: parent, node: n };
        else if (n.children && !found) walk(n.children, n);
      });
    })(S.ed.doc().nodes, null);
    return found;
  }

  /* ======================= popovers ======================= */
  function closePop() {
    if (!S || !S.pop) return;
    const p = S.pop;
    S.pop = null;
    document.removeEventListener('pointerdown', p.onDown, true);
    document.removeEventListener('keydown', p.onKey, true);
    p.el.remove();
    if (p.onClose) p.onClose();
  }
  // Floating panel anchored to an element (fixed position, so inspector scrolling never clips it).
  function openPop(anchor, content, o) {
    o = o || {};
    closePop();
    const el = h('div', { class: 'lc-pop' + (o.cls ? ' ' + o.cls : '') }, [content]);
    document.body.appendChild(el);
    const r = anchor.getBoundingClientRect(), pw = el.offsetWidth, ph = el.offsetHeight;
    let left = o.align === 'right' ? r.right - pw : r.left;
    left = clamp(left, 8, window.innerWidth - pw - 8);
    let top = o.above ? r.top - ph - 6 : r.bottom + 6;
    if (top + ph > window.innerHeight - 8) top = Math.max(8, o.above ? top : r.top - ph - 6);
    if (top < 8) top = 8;
    el.style.left = left + 'px';
    el.style.top = top + 'px';
    if (o.matchWidth) el.style.minWidth = r.width + 'px';
    const p = {
      el: el, onClose: o.onClose,
      onDown: function (e) { if (!el.contains(e.target) && !anchor.contains(e.target)) closePop(); },
      onKey: function (e) { if (e.key === 'Escape') { e.stopPropagation(); closePop(); if (anchor.focus) anchor.focus(); } }
    };
    document.addEventListener('pointerdown', p.onDown, true);
    document.addEventListener('keydown', p.onKey, true);
    S.pop = p;
    return el;
  }

  /* ======================= controls =======================
     Each control returns { el, sync() }; the panel registers it so values follow the document. */

  function reg(c) { S.syncs.push(c.sync); return c.el; }

  function numField(o) {
    const inp = h('input', { type: 'text', class: 'lc-num-in', inputmode: 'decimal', autocomplete: 'off', spellcheck: 'false', 'aria-label': o.aria || o.label });
    const el = h('label', { class: 'lc-num' + (o.cls ? ' ' + o.cls : '') }, [h('span', { class: 'lc-num-l', text: o.label }), inp, o.unit ? h('em', { class: 'lc-num-u', text: o.unit }) : null]);
    let shown = '';
    function sync() {
      const dis = o.disabled ? o.disabled() : false;
      inp.disabled = !!dis;
      el.classList.toggle('is-disabled', !!dis);
      if (document.activeElement === inp) return;
      const v = o.get();
      if (v === MIXED) { inp.value = ''; inp.placeholder = 'Mixed'; shown = ''; }
      else if (v == null) { inp.value = ''; inp.placeholder = '–'; shown = ''; }
      else { inp.value = fmtNum(v); inp.placeholder = ''; shown = inp.value; }
    }
    function put(v) {
      if (o.min != null) v = Math.max(o.min, v);
      if (o.max != null) v = Math.min(o.max, v);
      if (o.int) v = Math.round(v);
      o.set(v);
      const nv = o.get();
      if (typeof nv === 'number') { inp.value = fmtNum(nv); shown = inp.value; }
    }
    function commit() {
      const txt = inp.value.trim();
      if (txt === shown) return;
      const cur = o.get();
      const v = calc(txt, typeof cur === 'number' ? cur : 0);
      if (v == null) { inp.value = shown; return; }
      put(v);
    }
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { commit(); inp.select(); }
      else if (e.key === 'Escape') { inp.value = shown; inp.blur(); }
      else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        const cur = o.get();
        if (typeof cur !== 'number') return;
        e.preventDefault();
        put(cur + (e.key === 'ArrowUp' ? 1 : -1) * (o.step || 1) * (e.shiftKey ? 10 : 1));
        inp.select();
      }
    });
    inp.addEventListener('blur', commit);
    inp.addEventListener('focus', function () { inp.select(); });
    return { el: el, sync: sync };
  }

  function slider(o) {
    const range = h('input', { type: 'range', class: 'lc-range', min: o.min, max: o.max, step: o.step || 1, 'aria-label': o.label });
    const num = numField({ label: '', aria: o.label, cls: 'lc-num-slim', min: o.min, max: o.max, step: o.step, get: o.get, set: o.set, unit: o.unit });
    const el = h('div', { class: 'lc-slider' }, [h('span', { class: 'lc-slider-l', text: o.label }), range, num.el]);
    range.addEventListener('input', function () { o.set(Number(range.value)); num.sync(); });
    function sync() {
      const v = o.get();
      if (typeof v === 'number' && document.activeElement !== range) range.value = v;
      range.classList.toggle('is-mixed', v === MIXED);
      num.sync();
    }
    return { el: el, sync: sync };
  }

  function segmented(o) {   // o.options [{v,label|icon,title}], get(), set(v), label
    const btns = o.options.map(function (op) {
      return h('button', {
        type: 'button', title: op.title || op.label || '', 'aria-label': op.title || op.label,
        html: op.icon ? ico(op.icon) : null, text: op.icon ? null : op.label,
        onclick: function () { o.set(op.v); }
      });
    });
    const el = h('div', { class: 'seg lc-seg', role: 'group', 'aria-label': o.label }, btns);
    function sync() {
      const v = o.get();
      btns.forEach(function (b, i) { b.setAttribute('aria-pressed', v !== MIXED && v === o.options[i].v ? 'true' : 'false'); });
    }
    return { el: el, sync: sync };
  }

  function toggleBtn(o) {
    const b = h('button', { type: 'button', class: 'lc-ib lc-toggle', title: o.title, 'aria-label': o.title, onclick: function () { o.set(!o.get()); sync(); } });
    function sync() {
      const on = !!o.get();
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.innerHTML = ico(on ? o.iconOn : o.iconOff);
    }
    return { el: b, sync: sync };
  }

  function field(label, control) {
    return h('div', { class: 'lc-field' }, [h('div', { class: 'lc-label', text: label }), control]);
  }
  function section(title, kids) {
    return h('section', { class: 'lc-sec' }, [title ? h('h3', { class: 'lc-sec-t', text: title }) : null].concat(kids));
  }

  function normHex(v) {
    let s = String(v || '').trim().replace(/^#/, '');
    if (/^[0-9a-f]{3}$/i.test(s)) s = s.replace(/(.)/g, '$1$1');
    return /^[0-9a-f]{6}$/i.test(s) ? '#' + s.toUpperCase() : null;
  }

  // o: label, get() -> ColorRef|null|MIXED, set(ref|null, merge), allowNone
  function colorControl(o) {
    const key = 'color:' + (++uid);
    const swatches = ROLES.map(function (r) {
      const b = h('button', { type: 'button', class: 'lc-sw', 'aria-label': r[1] + ' (linked to the brand)', title: r[1] + ' — linked to the brand', onclick: function () { o.set({ ref: r[0] }); } },
        [h('span', { class: 'lc-sw-c' }), h('span', { class: 'lc-sw-l', html: ico('link', 9) })]);
      b._role = r[0];
      return b;
    });
    const none = o.allowNone ? h('button', { type: 'button', class: 'lc-sw lc-sw-none', 'aria-label': 'No ' + o.label.toLowerCase(), title: 'None', onclick: function () { o.set(null); } }, [h('span', { class: 'lc-sw-c', html: ico('none', 14) })]) : null;
    const pick = h('input', { type: 'color', class: 'lc-pick', 'aria-label': 'Custom ' + o.label.toLowerCase() + ' colour', title: 'Custom colour' });
    const hex = h('input', { type: 'text', class: 'lc-hex', maxlength: '7', autocomplete: 'off', spellcheck: 'false', 'aria-label': o.label + ' hex', placeholder: '#RRGGBB' });
    const unlink = h('button', { type: 'button', class: 'lc-link-btn', title: 'Turn the linked colour into a fixed hex colour', html: ico('unlink', 13) + '<span>Unlink</span>', onclick: function () {
      const cur = o.get();
      if (cur && cur.ref) o.set({ hex: hexOf(cur).toUpperCase() });
    } });
    const status = h('span', { class: 'lc-color-status' });
    const el = h('div', { class: 'lc-color' }, [
      h('div', { class: 'lc-sws' }, swatches.concat(none ? [none] : [])),
      h('div', { class: 'lc-color-row' }, [pick, hex, unlink]),
      status
    ]);
    pick.addEventListener('input', function () { o.set({ hex: pick.value.toUpperCase() }, key); hex.value = pick.value.toUpperCase(); });
    function commitHex() {
      const v = normHex(hex.value);
      if (!v) { sync(true); return; }
      const cur = o.get();
      if (cur && cur.hex && cur.hex.toUpperCase() === v) { hex.value = v; return; }
      o.set({ hex: v });
    }
    hex.addEventListener('keydown', function (e) { if (e.key === 'Enter') { commitHex(); hex.select(); } else if (e.key === 'Escape') { hex.blur(); } });
    hex.addEventListener('blur', commitHex);
    function sync(force) {
      const cur = o.get();
      swatches.forEach(function (b) {
        const c = hexOf({ ref: b._role });
        b.firstChild.style.background = c;
        b.setAttribute('aria-pressed', cur && cur !== MIXED && cur.ref === b._role ? 'true' : 'false');
      });
      if (none) none.setAttribute('aria-pressed', cur === null ? 'true' : 'false');
      const isRef = !!(cur && cur !== MIXED && cur.ref);
      unlink.hidden = !isRef;
      if (cur === MIXED) { status.textContent = 'Mixed'; pick.value = '#000000'; }
      else if (cur === null) { status.textContent = 'None'; }
      else if (cur === undefined) { status.textContent = ''; }
      else {
        const c = hexOf(cur);
        status.textContent = isRef ? 'Linked to ' + ROLE_LABEL[cur.ref] + ' · ' + c.toUpperCase() : 'Custom colour';
        pick.value = c.length === 7 ? c.toLowerCase() : '#000000';
      }
      if (force || document.activeElement !== hex) hex.value = cur && cur !== MIXED ? hexOf(cur).toUpperCase() : '';
      hex.placeholder = cur === MIXED ? 'Mixed' : '#RRGGBB';
    }
    return { el: el, sync: sync };
  }

  /* ======================= fonts ======================= */
  function fontTable() {
    return S.fonts;         // { family: [{weight, style}] } once the manifest has loaded, else null
  }
  function weightsOf(family) {
    const t = fontTable();
    return t && t[family] ? t[family] : null;
  }
  function closestFace(list, weight, style) {
    let pool = list.filter(function (f) { return f.style === (style || 'normal'); });
    if (!pool.length) pool = list;
    let best = pool[0];
    pool.forEach(function (f) { if (Math.abs(f.weight - weight) < Math.abs(best.weight - weight)) best = f; });
    return best;
  }
  function fontLabel(font) {
    const tk = tokens().fonts || {};
    if (font.ref === 'heading') return 'Brand heading (' + (tk.heading && tk.heading.family) + ')';
    if (font.ref === 'body') return 'Brand body (' + (tk.body && tk.body.family) + ')';
    return font.family;
  }

  function fontPicker(o) {   // o.get() -> FontRef|MIXED, o.set(fontRef)
    const btn = h('button', { type: 'button', class: 'lc-font-btn', 'aria-haspopup': 'listbox' });
    function sync() {
      const f = o.get();
      if (f === MIXED || !f) { btn.textContent = 'Mixed'; btn.style.fontFamily = ''; return; }
      const r = LogoDoc.resolveFont(f, tokens());
      btn.textContent = fontLabel(f);
      btn.style.fontFamily = "'" + r.family + "', var(--font-ui, system-ui), sans-serif";
      btn.title = fontTable() && !fontTable()[r.family] ? r.family + ' is not in the logo font set; Inter is used instead' : '';
    }
    function choose(newRef) {
      const cur = o.get();
      const curW = cur && cur !== MIXED ? LogoDoc.resolveFont(cur, tokens()) : { weight: 400, style: 'normal' };
      const fam = newRef.ref ? LogoDoc.resolveFont({ ref: newRef.ref }, tokens()).family : newRef.family;
      const list = weightsOf(fam);
      let w = curW.weight, st = curW.style;
      if (list && list.length) { const f = closestFace(list, w, st); w = f.weight; st = f.style; }
      o.set(Object.assign({}, newRef, { weight: w, style: st || 'normal' }));
      closePop();
    }
    btn.addEventListener('click', function () {
      if (S.pop && S.pop.owner === btn) { closePop(); return; }
      const cur = o.get(), curRef = cur && cur !== MIXED ? cur : null;
      const search = h('input', { type: 'search', class: 'lc-font-search', placeholder: 'Search fonts', 'aria-label': 'Search fonts', autocomplete: 'off', spellcheck: 'false' });
      const list = h('div', { class: 'lc-font-list', role: 'listbox' });
      function item(label, family, disabled, selected, onPick, note) {
        const b = h('button', { type: 'button', class: 'lc-font-item', role: 'option', 'aria-selected': selected ? 'true' : 'false', disabled: disabled, onclick: onPick,
          style: "font-family:'" + family + "', system-ui, sans-serif" }, [h('span', { text: label }), note ? h('small', { text: note }) : null]);
        return b;
      }
      function fill() {
        const q = search.value.trim().toLowerCase();
        list.innerHTML = '';
        const t = fontTable(), tk = tokens().fonts || {};
        if (!q) {
          ['heading', 'body'].forEach(function (k) {
            const fam = tk[k] && tk[k].family;
            const ok = !t || !!t[fam];
            list.appendChild(item(fontLabel({ ref: k }), fam, !ok, !!(curRef && curRef.ref === k), function () { choose({ ref: k }); }, ok ? '' : 'not in logo fonts'));
          });
          list.appendChild(h('div', { class: 'lc-font-sep', text: 'All fonts' }));
        }
        if (!t) { list.appendChild(h('div', { class: 'lc-font-empty', text: 'Loading fonts…' })); return; }
        const fams = Object.keys(t).sort(function (a, b) { return a.localeCompare(b); }).filter(function (f) { return !q || f.toLowerCase().indexOf(q) >= 0; });
        fams.forEach(function (f) {
          list.appendChild(item(f, f, false, !!(curRef && !curRef.ref && curRef.family === f), function () { choose({ family: f }); }));
        });
        if (!fams.length) list.appendChild(h('div', { class: 'lc-font-empty', text: 'No fonts match' }));
      }
      fill();
      search.addEventListener('input', fill);
      const pop = openPop(btn, h('div', { class: 'lc-font-pop' }, [search, list]), { matchWidth: true, cls: 'lc-pop-font' });
      S.pop.owner = btn;
      const selected = list.querySelector('[aria-selected="true"]');
      if (selected && selected.scrollIntoView) selected.scrollIntoView({ block: 'nearest' });
      search.focus();
      return pop;
    });
    return { el: btn, sync: sync };
  }

  function weightSelect(o) {   // o.family() -> resolved family, o.get() -> {weight, style}|MIXED, o.set(weight, style)
    const sel = h('select', { class: 'lc-select', 'aria-label': 'Weight' });
    let sig = '';
    function sync() {
      const cur = o.get();
      const fam = o.family();
      const list = (fam && weightsOf(fam)) || [];
      const items = list.slice();
      if (cur && cur !== MIXED && !items.some(function (f) { return f.weight === cur.weight && f.style === cur.style; })) items.push({ weight: cur.weight, style: cur.style });
      items.sort(function (a, b) { return a.weight - b.weight || (a.style < b.style ? -1 : 1); });
      const next = items.map(function (f) { return f.weight + '|' + f.style; }).join(',') + (cur === MIXED ? '|M' : '');
      if (next !== sig) {
        sig = next;
        sel.innerHTML = '';
        if (cur === MIXED) sel.appendChild(h('option', { value: '', text: 'Mixed' }));
        items.forEach(function (f) {
          sel.appendChild(h('option', { value: f.weight + '|' + f.style, text: (WEIGHT_NAME[f.weight] || f.weight) + ' ' + f.weight + (f.style === 'italic' ? ' italic' : '') }));
        });
      }
      sel.value = cur && cur !== MIXED ? cur.weight + '|' + cur.style : '';
      sel.disabled = !items.length && cur !== MIXED;
    }
    sel.addEventListener('change', function () {
      if (!sel.value) return;
      const p = sel.value.split('|');
      o.set(Number(p[0]), p[1]);
    });
    return { el: sel, sync: sync };
  }

  /* ======================= inspector ======================= */
  const brandName = function () {
    const chip = S.ctx.slots.top && S.ctx.slots.top.querySelector('#leBrand');
    return chip ? chip.textContent : '';
  };

  function buildInspector() {
    closePop();
    const root = S.ctx.slots.inspector;
    S.syncs = [];
    const wrap = h('div', { class: 'lc-insp' });
    const ids = selIds();
    if (!ids.length) artboardPanel(wrap); else selectionPanel(wrap, ids);
    root.innerHTML = '';
    root.appendChild(wrap);
    S.inspKey = inspKey();
    syncInspector();
  }
  function inspKey() {
    const ids = selIds();
    const ns = ids.map(function (id) { return S.ed.node(id); });
    let extra = '';
    if (ns.length === 1 && ns[0].type === 'text') extra = (ns[0].letterSpread ? 'S' : '') + (/\n/.test(ns[0].text) ? 'N' : '');
    return ids.join(',') + '|' + ns.map(function (n) { return n.type; }).join(',') + '|' + extra + '|' + (S.fonts ? 'f' : '');
  }
  function syncInspector() {
    S.syncs.forEach(function (fn) { try { fn(); } catch (e) { console.error(e); } });
  }
  function refreshInspector() {
    if (S.inspKey !== inspKey()) { buildInspector(); return; }
    syncInspector();
  }

  function artboardPanel(wrap) {
    const e = S.ed;
    const ab = function () { return e.doc().artboard; };
    const presets = h('select', { class: 'lc-select', 'aria-label': 'Artboard size preset' },
      ARTBOARDS.map(function (a, i) { return h('option', { value: String(i), text: a.label }); }).concat([h('option', { value: 'custom', text: 'Custom' })]));
    presets.addEventListener('change', function () {
      const a = ARTBOARDS[Number(presets.value)];
      if (a) e.setArtboard({ w: a.w, h: a.h });
    });
    S.syncs.push(function () {
      const i = ARTBOARDS.findIndex(function (a) { return a.w === ab().w && a.h === ab().h; });
      presets.value = i >= 0 ? String(i) : 'custom';
    });
    const w = numField({ label: 'W', min: 16, max: 20000, int: true, get: function () { return ab().w; }, set: function (v) { e.setArtboard({ w: v }); } });
    const hh = numField({ label: 'H', min: 16, max: 20000, int: true, get: function () { return ab().h; }, set: function (v) { e.setArtboard({ h: v }); } });
    const bg = colorControl({ label: 'Background', allowNone: true, get: function () { return ab().bg == null ? null : ab().bg; }, set: function (ref) { e.setArtboard({ bg: ref }); } });
    const brand = h('div', { class: 'lc-brand-note' });
    S.syncs.push(function () {
      const name = brandName();
      const linked = !!e.doc().brandId && name && !/^(No brand|Brand removed)$/.test(name);
      brand.innerHTML = '';
      brand.appendChild(h('strong', { text: linked ? name : 'No brand' }));
      brand.appendChild(h('span', { text: linked ? 'Linked colours and fonts follow this brand.' : 'Linked colours and fonts use the defaults.' }));
    });
    wrap.appendChild(h('div', { class: 'lc-head' }, [h('h2', { class: 'lc-title', text: 'Artboard' })]));
    wrap.appendChild(section('Size', [presets, h('div', { class: 'lc-grid2' }, [reg(w), reg(hh)])]));
    wrap.appendChild(section('Background', [reg(bg)]));
    wrap.appendChild(section('Brand', [brand]));
    wrap.appendChild(h('p', { class: 'lc-hint', text: 'Select a layer to edit it. Hold Shift to select several.' }));
  }

  function selectionPanel(wrap, ids) {
    const e = S.ed;
    const N = selNodes;
    const types = N().map(function (n) { return n.type; });
    const allType = types.every(function (t) { return t === types[0]; }) ? types[0] : null;
    const single = ids.length === 1;
    const allText = allType === 'text';
    const fillIds = function () { return selIds().filter(function (id) { return FILL_TYPES.indexOf(e.node(id).type) >= 0; }); };
    const strokeIds = function () { return selIds().filter(function (id) { return STROKE_TYPES.indexOf(e.node(id).type) >= 0; }); };
    const upd = function (patch, merge) { e.update(selIds(), patch, merge ? { merge: merge + ':' + selIds().join(',') } : undefined); };

    const first = N()[0];
    wrap.appendChild(h('div', { class: 'lc-head' }, [
      h('h2', { class: 'lc-title', text: single ? (first.name || first.type) : ids.length + ' layers selected' }),
      h('span', { class: 'lc-sub', text: single ? first.type : (allType || 'mixed types') })
    ]));

    /* ----- text ----- */
    if (allText) {
      const ta = h('textarea', { class: 'lc-textarea', rows: '3', 'aria-label': 'Text', spellcheck: 'false' });
      ta.addEventListener('input', function () { upd({ text: ta.value }, 'text'); });
      S.syncs.push(function () {
        const v = common(N(), function (n) { return n.text; });
        ta.placeholder = v === MIXED ? 'Mixed' : '';
        if (document.activeElement !== ta) ta.value = v === MIXED || v == null ? '' : v;
      });
      const font = fontPicker({
        get: function () { return common(N(), function (n) { return n.font; }); },
        set: function (f) { upd({ font: f }); }
      });
      const famOf = function () {
        const f = common(N(), function (n) { return LogoDoc.resolveFont(n.font, tokens()).family; });
        return f === MIXED ? null : f;
      };
      const wt = weightSelect({
        family: famOf,
        get: function () {
          const v = common(N(), function (n) { const r = LogoDoc.resolveFont(n.font, tokens()); return { weight: r.weight, style: r.style }; });
          return v;
        },
        set: function (w, st) {
          selIds().forEach(function (id) {
            const n = e.node(id);
            if (n) e.update([id], { font: Object.assign({}, n.font, { weight: w, style: st }) });
          });
        }
      });
      const size = numField({ label: 'Size', min: 1, max: 2000, step: 1, get: function () { return common(N(), function (n) { return n.size; }); }, set: function (v) { upd({ size: v }); } });
      const track = slider({ label: 'Letter spacing', min: -200, max: 400, step: 1, get: function () { return common(N(), function (n) { return n.tracking || 0; }); }, set: function (v) { upd({ tracking: v }, 'tracking'); } });
      const lh = numField({ label: 'Line', aria: 'Line height', min: 0.5, max: 4, step: 0.05, get: function () { return common(N(), function (n) { return n.lineHeight; }); }, set: function (v) { upd({ lineHeight: Math.round(v * 100) / 100 }); } });
      const cs = segmented({ label: 'Letter case', get: function () { return common(N(), function (n) { return n.case || 'as-typed'; }); }, set: function (v) { upd({ case: v }); },
        options: [{ v: 'as-typed', label: 'Aa', title: 'As typed' }, { v: 'upper', label: 'AA', title: 'Uppercase' }, { v: 'lower', label: 'aa', title: 'Lowercase' }] });
      const al = segmented({ label: 'Text align', get: function () { return common(N(), function (n) { return n.align || 'left'; }); }, set: function (v) { upd({ align: v }); },
        options: [{ v: 'left', icon: 'alL', title: 'Align left' }, { v: 'center', icon: 'alC', title: 'Align centre' }, { v: 'right', icon: 'alR', title: 'Align right' }] });
      const kids = [ta, field('Font', reg(font)), h('div', { class: 'lc-grid2' }, [field('Weight', reg(wt)), reg(size)]), reg(track), h('div', { class: 'lc-grid2' }, [reg(lh), h('span')]),
        h('div', { class: 'lc-grid2 lc-segs' }, [reg(cs), reg(al)])];
      if (single && (first.letterSpread || !/\n/.test(first.text))) {
        const chk = h('input', { type: 'checkbox', class: 'lc-check' });
        chk.addEventListener('change', function () { upd({ letterSpread: chk.checked }); });
        S.syncs.push(function () { const n = e.node(ids[0]); chk.checked = !!(n && n.letterSpread); });
        kids.push(h('label', { class: 'lc-checkrow', title: 'Spread the letters edge to edge across the layer width' }, [chk, h('span', { text: 'Spread letters to fit width' })]));
      }
      wrap.appendChild(section('Text', kids));
    }

    /* ----- transform ----- */
    const box = function () {
      const list = selIds();
      if (list.length === 1) { const n = e.node(list[0]); return { x: n.x, y: n.y, w: n.w, h: n.h }; }
      let u = null;
      list.forEach(function (id) { u = LogoDoc.geom.union(u, e.worldBox(id)); });
      return u ? { x: u[0], y: u[1], w: u[2] - u[0], h: u[3] - u[1] } : null;
    };
    const wb = function () {
      const list = selIds();
      if (list.length === 1) { const b = e.worldBox(list[0]); return { x: b[0], y: b[1] }; }
      const b = box(); return b ? { x: b.x, y: b.y } : null;
    };
    const lock = { on: true };
    const sizeLocked = function () {
      return single && (first.type === 'text' || first.type === 'line') ? true : false;
    };
    const fx = numField({ label: 'X', step: 1, get: function () { const b = wb(); return b ? b.x : null; }, set: function (v) { const b = wb(); if (b) e.nudge(v - b.x, 0); } });
    const fy = numField({ label: 'Y', step: 1, get: function () { const b = wb(); return b ? b.y : null; }, set: function (v) { const b = wb(); if (b) e.nudge(0, v - b.y); } });
    const textFixed = function () { return single && first.type === 'text'; };
    const fw = numField({ label: 'W', min: 1, step: 1,
      disabled: function () { const n = single && e.node(ids[0]); return !single || (n && n.type === 'text' && !n.letterSpread); },
      get: function () { const b = box(); return b ? b.w : null; },
      set: function (v) {
        const n = e.node(ids[0]);
        if (!n) return;
        const patch = { w: v };
        if (lock.on && n.w > 0 && n.h > 0 && n.type !== 'text') patch.h = Math.round(v * n.h / n.w * 100) / 100;
        e.update([n.id], patch);
      } });
    const fh = numField({ label: 'H', min: 0, step: 1,
      disabled: function () { return !single || textFixed(); },
      get: function () { const b = box(); return b ? b.h : null; },
      set: function (v) {
        const n = e.node(ids[0]);
        if (!n) return;
        const patch = { h: v };
        if (lock.on && n.w > 0 && n.h > 0) patch.w = Math.round(v * n.w / n.h * 100) / 100;
        e.update([n.id], patch);
      } });
    const rot = numField({ label: '∠', aria: 'Rotation', unit: '°', step: 1, get: function () { return common(N(), function (n) { return n.rotation || 0; }); },
      set: function (v) { upd({ rotation: LogoDoc.geom.normAngle(v) }); } });
    const lockBtn = toggleBtn({ title: 'Keep proportions', iconOn: 'link', iconOff: 'unlink', get: function () { return lock.on; }, set: function (v) { lock.on = v; } });
    const opacity = slider({ label: 'Opacity', min: 0, max: 100, step: 1, unit: '%',
      get: function () { const v = common(N(), function (n) { return Math.round((n.opacity == null ? 1 : n.opacity) * 100); }); return v; },
      set: function (v) { upd({ opacity: clamp(v, 0, 100) / 100 }, 'opacity'); } });
    wrap.appendChild(section('Transform', [
      h('div', { class: 'lc-grid2' }, [reg(fx), reg(fy)]),
      h('div', { class: 'lc-grid2 lc-wh' }, [reg(fw), reg(fh)]),
      h('div', { class: 'lc-row-tools' }, [reg(rot), reg(lockBtn),
        ibtn('flipH', 'Flip horizontal', function () { e.flip(selIds(), 'h'); }),
        ibtn('flipV', 'Flip vertical', function () { e.flip(selIds(), 'v'); })]),
      reg(opacity)
    ]));
    S.syncs.push(function () { lockBtn.el.classList.toggle('is-off', !single); });

    /* ----- align & arrange ----- */
    const relOf = function () { return selIds().length < 2 ? 'artboard' : S.alignRel; };
    const alignDefs = [['left', 'alignLeft', 'Align left'], ['hcenter', 'alignHCenter', 'Align horizontal centres'], ['right', 'alignRight', 'Align right'],
      ['top', 'alignTop', 'Align top'], ['vcenter', 'alignVCenter', 'Align vertical centres'], ['bottom', 'alignBottom', 'Align bottom']];
    const alignRow = h('div', { class: 'lc-btnrow' }, alignDefs.map(function (a) {
      return ibtn(a[1], a[2] + (relOf() === 'artboard' ? ' to the artboard' : ''), function () { e.align(a[0], relOf()); });
    }));
    const relSeg = segmented({ label: 'Align relative to', get: function () { return relOf(); }, set: function (v) { if (selIds().length >= 2 || v === 'artboard') { S.alignRel = v; syncInspector(); } },
      options: [{ v: 'selection', label: 'Selection' }, { v: 'artboard', label: 'Artboard' }] });
    S.syncs.push(function () {
      const sb = relSeg.el.firstChild;
      sb.disabled = selIds().length < 2;
      alignDefs.forEach(function (a, i) { alignRow.children[i].title = a[2] + (relOf() === 'artboard' ? ' to the artboard' : ' within the selection'); });
    });
    const alignKids = [alignRow, reg(relSeg)];
    if (ids.length >= 3) {
      alignKids.push(h('div', { class: 'lc-btnrow' }, [
        ibtn('distH', 'Distribute horizontally', function () { e.distribute('h'); }),
        ibtn('distV', 'Distribute vertically', function () { e.distribute('v'); })]));
    }
    wrap.appendChild(section('Align', alignKids));

    const order = function (where) {
      const list = selIds().map(function (id) { const loc = locate(id); return { id: id, i: loc ? loc.list.indexOf(loc.node) : 0 }; });
      const up = where === 'forward' || where === 'front';
      list.sort(function (a, b) { return up ? b.i - a.i : a.i - b.i; });
      list.forEach(function (it) { e.reorder(it.id, where); });
    };
    const grp = ibtn('group', 'Group (⌘G)', function () { if (selIds().length >= 2) e.group(selIds()); });
    const ungrp = ibtn('ungroup', 'Ungroup (⇧⌘G)', function () { const l = selIds(); if (l.length === 1) e.ungroup(l[0]); });
    grp.disabled = ids.length < 2;
    ungrp.disabled = !(single && first.type === 'group');
    wrap.appendChild(section('Arrange', [h('div', { class: 'lc-btnrow' }, [
      grp, ungrp,
      ibtn('forward', 'Bring forward (⌘])', function () { order('forward'); }),
      ibtn('backward', 'Send backward (⌘[)', function () { order('backward'); }),
      ibtn('front', 'Bring to front', function () { order('front'); }),
      ibtn('back', 'Send to back', function () { order('back'); }),
      ibtn('duplicate', 'Duplicate (⌘D)', function () { e.duplicate(selIds()); }),
      ibtn('trash', 'Delete', function () { e.remove(selIds()); })
    ])]));

    /* ----- fill / stroke ----- */
    const hasFill = fillIds().length > 0, hasStroke = strokeIds().length > 0;
    if (hasFill) {
      const fill = colorControl({ label: 'Fill', allowNone: !allText,
        get: function () { return common(fillIds().map(function (id) { return e.node(id); }), function (n) { return n.fill == null ? null : n.fill; }); },
        set: function (ref, merge) { e.update(fillIds(), { fill: ref }, merge ? { merge: merge } : undefined); } });
      wrap.appendChild(section(allText ? 'Colour' : 'Fill', [reg(fill)]));
    }
    if (hasStroke) {
      const lineOnly = allType === 'line';
      const stroke = colorControl({ label: 'Stroke', allowNone: !lineOnly,
        get: function () { return common(strokeIds().map(function (id) { return e.node(id); }), function (n) { return n.stroke == null ? null : n.stroke; }); },
        set: function (ref, merge) {
          const patch = { stroke: ref };
          const ns = strokeIds().map(function (id) { return e.node(id); });
          if (ref && ns.some(function (n) { return !(n.strokeWidth > 0); })) patch.strokeWidth = 8;
          e.update(strokeIds(), patch, merge ? { merge: merge } : undefined);
        } });
      const sw = numField({ label: 'Width', min: 0, step: 1, get: function () { return common(strokeIds().map(function (id) { return e.node(id); }), function (n) { return n.strokeWidth; }); },
        set: function (v) { e.update(strokeIds(), { strokeWidth: v }); },
        disabled: function () { const c = common(strokeIds().map(function (id) { return e.node(id); }), function (n) { return n.stroke == null ? null : n.stroke; }); return c === null; } });
      wrap.appendChild(section(lineOnly ? 'Line' : 'Stroke', [reg(stroke), h('div', { class: 'lc-grid2' }, [reg(sw), h('span')])]));
    }

    /* ----- shape specifics ----- */
    const shape = [];
    if (allType === 'rect') {
      shape.push(h('div', { class: 'lc-grid2' }, [reg(numField({ label: 'Radius', min: 0, step: 1, get: function () { return common(N(), function (n) { return n.radius || 0; }); }, set: function (v) { upd({ radius: v }); } })), h('span')]));
    }
    if (allType === 'polygon') {
      shape.push(h('div', { class: 'lc-grid2' }, [reg(numField({ label: 'Sides', min: 3, max: 12, int: true, step: 1, get: function () { return common(N(), function (n) { return n.sides; }); }, set: function (v) { upd({ sides: v }); } })), h('span')]));
    }
    if (allType === 'star') {
      shape.push(h('div', { class: 'lc-grid2' }, [reg(numField({ label: 'Points', min: 3, max: 24, int: true, step: 1, get: function () { return common(N(), function (n) { return n.points; }); }, set: function (v) { upd({ points: v }); } })), h('span')]));
      shape.push(reg(slider({ label: 'Inner', min: 10, max: 95, step: 1, unit: '%',
        get: function () { return common(N(), function (n) { return Math.round(n.inner * 100); }); },
        set: function (v) { upd({ inner: clamp(v, 10, 95) / 100 }, 'inner'); } })));
    }
    if (allType === 'line') {
      shape.push(field('Line ends', reg(segmented({ label: 'Line caps', get: function () { return common(N(), function (n) { return n.cap || 'butt'; }); }, set: function (v) { upd({ cap: v }); },
        options: [{ v: 'butt', label: 'Flat' }, { v: 'round', label: 'Round' }, { v: 'square', label: 'Square' }] }))));
    }
    if (shape.length) wrap.appendChild(section('Shape', shape));
  }

  /* ======================= toolbar ======================= */
  function buildToolbar() {
    const root = S.ctx.slots.toolbar;
    root.innerHTML = '';
    root.classList.add('lc-toolbar');
    root.setAttribute('role', 'toolbar');
    root.setAttribute('aria-label', 'Tools');
    S.toolBtns = {};
    TOOLS.forEach(function (t) {
      const b = h('button', {
        type: 'button', class: 'lc-ib lc-tool', 'data-tool': t[0], title: t[1] + (t[2] ? ' (' + t[2] + ')' : ''), 'aria-label': t[1],
        html: ico(t[3], 18), onclick: function () { S.ed.setTool(t[0]); focusCanvas(); }
      });
      S.toolBtns[t[0]] = b;
      root.appendChild(b);
    });
    syncTools();
  }
  function syncTools() {
    const cur = S.ed.tool();
    Object.keys(S.toolBtns).forEach(function (k) { S.toolBtns[k].setAttribute('aria-pressed', k === cur ? 'true' : 'false'); });
  }
  function focusCanvas() { try { S.ctx.slots.canvas.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }

  /* ======================= top bar extras ======================= */
  function buildTop() {
    const top = S.ctx.slots.top, exportBtn = S.ctx.slots.exportBtn;
    const undo = ibtn('undo', 'Undo (⌘Z)', function () { S.ed.undo(); });
    const redo = ibtn('redo', 'Redo (⇧⌘Z)', function () { S.ed.redo(); });
    const tLayers = ibtn('layers', 'Layers', function () { togglePanel('layers'); }, 'lc-narrow-1100');
    const tInsp = ibtn('panel', 'Inspector', function () { togglePanel('insp'); }, 'lc-narrow-760');
    const grp = h('div', { class: 'lc-top-tools' }, [undo, redo, tLayers, tInsp]);
    top.insertBefore(grp, exportBtn);
    S.topEls = { grp: grp, undo: undo, redo: redo };
    S.exportPrev = { disabled: exportBtn.disabled, title: exportBtn.title };
    exportBtn.disabled = false;
    exportBtn.title = 'Export the logo';
    S.onExport = function () { openExport(); };
    exportBtn.addEventListener('click', S.onExport);
    syncHistory();
  }
  function syncHistory() {
    S.topEls.undo.disabled = !S.ed.canUndo();
    S.topEls.redo.disabled = !S.ed.canRedo();
  }
  function togglePanel(which) {
    const root = S.root;
    const attr = which === 'layers' ? 'data-lc-layers' : 'data-lc-insp';
    const open = root.getAttribute(attr) === 'open';
    root.removeAttribute('data-lc-layers'); root.removeAttribute('data-lc-insp');
    if (!open) root.setAttribute(attr, 'open');
  }

  /* ======================= zoom ======================= */
  function buildZoom() {
    const root = S.ctx.slots.zoom;
    root.innerHTML = '';
    const out = ibtn('minus', 'Zoom out (⌘−)', function () { S.ed.zoom('out'); });
    const inn = ibtn('plus', 'Zoom in (⌘+)', function () { S.ed.zoom('in'); });
    const pct = h('button', { type: 'button', class: 'lc-zoom-pct', title: 'Zoom options', 'aria-haspopup': 'menu', text: '100%' });
    pct.addEventListener('click', function () {
      if (S.pop && S.pop.owner === pct) { closePop(); return; }
      const items = [['Fit to screen', 'fit', '⌘0'], ['50%', 0.5, ''], ['100%', 1, ''], ['200%', 2, ''], ['Zoom to selection', 'selection', '']];
      const menu = h('div', { class: 'lc-menu', role: 'menu' }, items.map(function (it) {
        const b = h('button', { type: 'button', role: 'menuitem', onclick: function () { S.ed.zoom(it[1]); closePop(); focusCanvas(); } }, [h('span', { text: it[0] }), it[2] ? h('kbd', { text: it[2] }) : null]);
        if (it[1] === 'selection') b.disabled = !selIds().length;
        return b;
      }));
      openPop(pct, menu, { above: true, align: 'right' });
      S.pop.owner = pct;
    });
    root.classList.add('lc-zoom');
    root.appendChild(out); root.appendChild(pct); root.appendChild(inn);
    S.zoomPct = pct;
    syncZoom();
  }
  function syncZoom() { if (S.zoomPct) S.zoomPct.textContent = Math.round(S.ed.zoomLevel() * 100) + '%'; }

  /* ======================= layers ======================= */
  function layerRows() {
    const rows = [];
    (function walk(list, depth, parent, hiddenAnc) {
      for (let i = list.length - 1; i >= 0; i--) {
        const n = list[i];
        rows.push({ n: n, depth: depth, parent: parent });
        if (n.type === 'group' && !S.collapsed[n.id]) walk(n.children, depth + 1, n, false);
      }
    })(S.ed.doc().nodes, 0, null, false);
    return rows;
  }
  const layerName = function (n) { return n.type === 'text' && (!n.name || n.name === 'Text') ? (String(n.text).split('\n')[0] || 'Text') : (n.name || n.type); };
  function layersKey(rows) {
    return rows.map(function (r) { return [r.n.id, r.depth, layerName(r.n), r.n.hidden ? 1 : 0, r.n.locked ? 1 : 0, r.n.type, S.collapsed[r.n.id] ? 1 : 0].join('~'); }).join('|');
  }
  function buildLayers(force) {
    if (S.renaming) return;
    const rows = layerRows();
    const key = layersKey(rows);
    if (!force && key === S.layersKey) { syncLayerSel(); return; }
    S.layersKey = key;
    const list = S.layerList;
    const top = list.scrollTop;
    list.innerHTML = '';
    if (!rows.length) list.appendChild(h('p', { class: 'lc-layers-empty', text: 'No layers yet. Pick a tool and draw on the canvas.' }));
    rows.forEach(function (r) {
      const n = r.n;
      const row = h('div', { class: 'lc-row' + (n.hidden ? ' is-hidden' : '') + (n.locked ? ' is-locked' : ''), role: 'treeitem', draggable: 'true', 'data-id': n.id, 'data-parent': r.parent ? r.parent.id : '', style: 'padding-left:' + (6 + r.depth * 14) + 'px' });
      row.appendChild(n.type === 'group'
        ? h('button', { type: 'button', class: 'lc-chev' + (S.collapsed[n.id] ? '' : ' is-open'), 'data-act': 'toggle', 'aria-label': S.collapsed[n.id] ? 'Expand group' : 'Collapse group', html: ico('chevron', 12) })
        : h('span', { class: 'lc-chev-sp' }));
      row.appendChild(h('span', { class: 'lc-row-ico', html: ico(TYPE_ICON[n.type] || 'rect', 14) }));
      row.appendChild(h('span', { class: 'lc-row-name', text: layerName(n) }));
      row.appendChild(h('button', { type: 'button', class: 'lc-row-btn' + (n.locked ? ' is-on' : ''), 'data-act': 'lock', title: n.locked ? 'Unlock' : 'Lock', 'aria-label': n.locked ? 'Unlock layer' : 'Lock layer', 'aria-pressed': n.locked ? 'true' : 'false', html: ico(n.locked ? 'lock' : 'unlock', 14) }));
      row.appendChild(h('button', { type: 'button', class: 'lc-row-btn' + (n.hidden ? ' is-on' : ''), 'data-act': 'hide', title: n.hidden ? 'Show' : 'Hide', 'aria-label': n.hidden ? 'Show layer' : 'Hide layer', 'aria-pressed': n.hidden ? 'true' : 'false', html: ico(n.hidden ? 'eyeOff' : 'eye', 14) }));
      list.appendChild(row);
    });
    list.scrollTop = top;
    syncLayerSel();
  }
  function syncLayerSel() {
    const sel = S.ed.selection();
    S.layerList.querySelectorAll('.lc-row').forEach(function (r) {
      const on = sel.indexOf(r.getAttribute('data-id')) >= 0;
      r.classList.toggle('is-sel', on);
      r.setAttribute('aria-selected', on ? 'true' : 'false');
    });
  }
  function startRename(row) {
    const id = row.getAttribute('data-id'), n = S.ed.node(id);
    if (!n) return;
    const nameEl = row.querySelector('.lc-row-name');
    const inp = h('input', { type: 'text', class: 'lc-rename', value: layerName(n), 'aria-label': 'Layer name', maxlength: '80', spellcheck: 'false' });
    S.renaming = true;
    row.draggable = false;
    nameEl.replaceWith(inp);
    inp.focus(); inp.select();
    let done = false;
    function finish(save) {
      if (done) return;
      done = true;
      S.renaming = false;
      const v = inp.value.trim();
      if (save && v && v !== layerName(n)) S.ed.update([id], { name: v });
      buildLayers(true);
    }
    inp.addEventListener('keydown', function (e) {
      e.stopPropagation();
      if (e.key === 'Enter') finish(true);
      else if (e.key === 'Escape') finish(false);
    });
    inp.addEventListener('blur', function () { finish(true); });
  }
  function wireLayers() {
    const list = S.layerList;
    list.addEventListener('click', function (e) {
      const row = e.target.closest('.lc-row');
      if (!row || e.target.closest('.lc-rename')) return;
      const id = row.getAttribute('data-id');
      const act = e.target.closest('[data-act]');
      if (act) {
        const a = act.getAttribute('data-act'), n = S.ed.node(id);
        if (a === 'toggle') { S.collapsed[id] = !S.collapsed[id]; buildLayers(true); }
        else if (a === 'lock' && n) S.ed.update([id], { locked: !n.locked });
        else if (a === 'hide' && n) S.ed.update([id], { hidden: !n.hidden });
        return;
      }
      if (e.shiftKey || e.metaKey || e.ctrlKey) {
        const cur = S.ed.selection(), i = cur.indexOf(id);
        S.ed.select(i >= 0 ? cur.filter(function (x) { return x !== id; }) : cur.concat([id]));
      } else {
        S.ed.select([id]);
      }
      list.focus({ preventScroll: true });
    });
    list.addEventListener('dblclick', function (e) {
      const row = e.target.closest('.lc-row');
      if (!row || e.target.closest('[data-act]') || e.target.closest('.lc-rename')) return;
      startRename(row);
    });
    list.addEventListener('keydown', function (e) {
      if (e.target.closest('.lc-rename')) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const rows = Array.prototype.slice.call(list.querySelectorAll('.lc-row'));
        if (!rows.length) return;
        const sel = S.ed.selection();
        let i = rows.findIndex(function (r) { return sel.indexOf(r.getAttribute('data-id')) >= 0; });
        i = i < 0 ? (e.key === 'ArrowDown' ? 0 : rows.length - 1) : clamp(i + (e.key === 'ArrowDown' ? 1 : -1), 0, rows.length - 1);
        const id = rows[i].getAttribute('data-id');
        S.ed.select(e.shiftKey ? sel.concat(sel.indexOf(id) >= 0 ? [] : [id]) : [id]);
        rows[i].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        S.ed.remove(selIds());
      } else if (e.key === 'Enter' || e.key === 'F2') {
        const sel = S.ed.selection();
        const row = sel.length === 1 && list.querySelector('.lc-row[data-id="' + sel[0] + '"]');
        if (row) { e.preventDefault(); startRename(row); }
      }
    });
    // drag to reorder, within one parent
    let dragId = null;
    function clearDrop() { list.querySelectorAll('.drop-above,.drop-below').forEach(function (r) { r.classList.remove('drop-above', 'drop-below'); }); }
    list.addEventListener('dragstart', function (e) {
      const row = e.target.closest && e.target.closest('.lc-row');
      if (!row || S.renaming) { e.preventDefault(); return; }
      dragId = row.getAttribute('data-id');
      row.classList.add('is-drag');
      e.dataTransfer.effectAllowed = 'move';
      try { e.dataTransfer.setData('text/plain', dragId); } catch (err) { /* ignore */ }
    });
    list.addEventListener('dragend', function () {
      dragId = null; clearDrop();
      list.querySelectorAll('.is-drag').forEach(function (r) { r.classList.remove('is-drag'); });
    });
    list.addEventListener('dragover', function (e) {
      if (!dragId) return;
      const row = e.target.closest('.lc-row');
      clearDrop();
      if (!row || row.getAttribute('data-id') === dragId) return;
      const a = locate(dragId), b = locate(row.getAttribute('data-id'));
      if (!a || !b || a.list !== b.list) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      const r = row.getBoundingClientRect();
      row.classList.add(e.clientY < r.top + r.height / 2 ? 'drop-above' : 'drop-below');
    });
    list.addEventListener('drop', function (e) {
      if (!dragId) return;
      const row = e.target.closest('.lc-row');
      const above = row && row.classList.contains('drop-above');
      clearDrop();
      if (!row) return;
      e.preventDefault();
      const a = locate(dragId), b = locate(row.getAttribute('data-id'));
      const id = dragId;
      dragId = null;
      if (!a || !b || a.list !== b.list || a.node === b.node) return;
      const i = a.list.indexOf(a.node), r = a.list.indexOf(b.node);
      const rAfter = r - (i < r ? 1 : 0);                 // target index once the dragged layer is lifted out
      const finalIdx = above ? rAfter + 1 : rAfter;       // above in the panel = later in the document
      if (finalIdx !== i) S.ed.reorder(id, finalIdx);
    });
  }

  /* ======================= export ======================= */
  const slugify = function (s) {
    const t = String(s || 'logo').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    return t || 'logo';
  };
  function download(name, blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 20000);
  }
  const bytes = async function (blob) { return new Uint8Array(await blob.arrayBuffer()); };

  // The text layer the monogram letter comes from: the visually highest one on the
  // artboard (smallest y, group offsets added), the same rule LogoAttach uses for brands.
  function topText() {
    const out = [];
    (function walk(list, ox, oy) {
      (list || []).forEach(function (n) {
        if (!n || n.hidden) return;
        if (n.type === 'group') walk(n.children, ox + (n.x || 0), oy + (n.y || 0));
        else if (n.type === 'text' && String(n.text || '').trim()) out.push({ n: n, x: ox + (n.x || 0), y: oy + (n.y || 0) });
      });
    })(S.ed.doc().nodes, 0, 0);
    out.sort(function (a, b) { return a.y - b.y || a.x - b.x; });
    return out.length ? out[0].n : null;
  }

  async function monogramSVGs(node, tk) {
    const f = LogoDoc.resolveFont(node.font, tk);
    const letter = Array.from(String(node.text)).filter(function (c) { return !/\s/.test(c); })[0] || '?';
    const rec = function (family) {
      return { word: letter, case: node.case === 'upper' || node.case === 'lower' ? node.case : 'as-typed',
        wordFont: { family: family, weight: f.weight, style: f.style, axes: f.axes }, tracking: 0, device: { type: 'none' }, monogram: { letters: 1 } };
    };
    let er = rec(f.family), faces;
    try { faces = await LogoEngine.load(er); }
    catch (e) { er = rec('Inter'); faces = await LogoEngine.load(er); }
    const layout = LogoEngine.monogram(er, faces);
    const ink = tk.colors.ink;
    return {
      light: LogoEngine.toSVG(layout, { fill: ink, bg: '#FFFFFF' }),
      dark: LogoEngine.toSVG(layout, { fill: '#FFFFFF', bg: ink })
    };
  }

  // One SVG / PNG of the document. o: { colour:'design'|'white'|'ink', box, pad, bg (hex|null), transparent }
  async function renderSVG(o) {
    const tk = tokens(), doc = S.ed.doc();
    const fill = o.colour === 'white' ? '#FFFFFF' : o.colour === 'ink' ? tk.colors.ink : undefined;
    const d = o.keepBg ? doc : Object.assign({}, doc, { artboard: Object.assign({}, doc.artboard, { bg: null }) });
    return LogoRender.toSVG(d, tk, { fill: fill, box: o.box, pad: o.pad || 0, bg: o.bg || undefined });
  }
  async function renderPNG(o, width) {
    return LogoEngine.toPNG(await renderSVG(o), width);
  }

  function contentSize(box, pad) {
    const doc = S.ed.doc();
    let b = null;
    if (box === 'content') { try { b = LogoRender.boundsSync(doc.nodes, tokens()); } catch (e) { b = null; } }
    if (!b) b = [0, 0, doc.artboard.w, doc.artboard.h];
    return { w: b[2] - b[0] + pad * 2, h: b[3] - b[1] + pad * 2 };
  }

  function openExport() {
    if (S.dlg) return;
    closePop();
    const ses = S;                                  // the dialog can outlive unmount() while an export runs
    const doc = S.ed.doc(), tk = tokens();
    const slug = slugify(doc.name);
    const prev = document.activeElement;
    const st = { format: 'svg', colour: 'design', box: 'artboard', pad: 0, width: 2048, custom: false, bgMode: 'transparent' };
    const overlay = h('div', { class: 'dlg-overlay lc-export-overlay' });
    const form = h('form', { class: 'dlg lc-export', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Export logo', novalidate: true });
    overlay.appendChild(form);
    const mkSeg = function (label, options, key, after) {
      const btns = options.map(function (op) {
        return h('button', { type: 'button', text: op[1], onclick: function () { st[key] = op[0]; if (key === 'width') st.custom = false; paint(); if (after) after(); } });
      });
      const el = h('div', { class: 'seg lc-seg', role: 'group', 'aria-label': label }, btns);
      return { el: el, paint: function () { btns.forEach(function (b, i) { b.setAttribute('aria-pressed', st[key] === options[i][0] && !(key === 'width' && st.custom) ? 'true' : 'false'); }); } };
    };
    const fmt = mkSeg('Format', [['svg', 'SVG'], ['png', 'PNG'], ['pack', 'Logo pack']], 'format');
    const col = mkSeg('Colour', [['design', 'As designed'], ['white', 'All white'], ['ink', 'All ink']], 'colour');
    const box = mkSeg('Bounds', [['artboard', 'Artboard'], ['content', 'Content (tight)']], 'box');
    const widths = mkSeg('PNG width', [[512, '512'], [1024, '1024'], [2048, '2048'], [4096, '4096']], 'width');
    const bgm = mkSeg('PNG background', [['transparent', 'Transparent'], ['solid', 'With background']], 'bgMode');
    const customBtn = h('button', { type: 'button', text: 'Custom', onclick: function () { st.custom = true; paint(); customIn.focus(); } });
    widths.el.appendChild(customBtn);
    const customIn = h('input', { type: 'text', class: 'lc-export-custom', inputmode: 'numeric', 'aria-label': 'Custom PNG width in pixels', value: '1600', autocomplete: 'off' });
    customIn.addEventListener('focus', function () { st.custom = true; paint(); });
    customIn.addEventListener('input', function () { const v = parseInt(customIn.value, 10); if (v > 0) { st.width = clamp(v, 16, 8192); } paint(); });
    const padIn = h('input', { type: 'text', class: 'lc-export-pad', inputmode: 'decimal', 'aria-label': 'Padding', value: '0', autocomplete: 'off' });
    padIn.addEventListener('input', function () { const v = calc(padIn.value, 0); st.pad = v != null && v >= 0 ? clamp(v, 0, 5000) : 0; paint(); });
    const info = h('p', { class: 'lc-export-info' });
    const packNote = h('div', { class: 'lc-export-pack' });
    const err = h('p', { class: 'dlg-error', hidden: true });
    const go = h('button', { type: 'submit', class: 'btn btn-primary', text: 'Export' });
    const cancel = h('button', { type: 'button', class: 'btn btn-ghost', text: 'Cancel' });
    const mono = topText();

    const row = function (label, el, cls) { return h('div', { class: 'lc-export-row' + (cls ? ' ' + cls : ''), }, [h('div', { class: 'lc-label', text: label }), el]); };
    const rows = {
      colour: row('Colour', col.el), box: row('Bounds', h('div', { class: 'lc-export-inline' }, [box.el, h('label', { class: 'lc-export-padl' }, [h('span', { text: 'Padding' }), padIn, h('em', { text: 'px' })])])),
      width: row('Width', h('div', { class: 'lc-export-inline' }, [widths.el, customIn, h('em', { text: 'px' })])), bg: row('Background', bgm.el)
    };
    form.appendChild(h('h2', { class: 'dlg-title', text: 'Export' }));
    form.appendChild(row('Format', fmt.el));
    form.appendChild(rows.colour); form.appendChild(rows.box); form.appendChild(rows.width); form.appendChild(rows.bg);
    form.appendChild(packNote);
    form.appendChild(info);
    form.appendChild(err);
    form.appendChild(h('div', { class: 'dlg-actions' }, [cancel, go]));

    packNote.appendChild(h('p', { class: 'dlg-message', text: 'A .zip with the logo as SVG and 2400 px PNG (as designed, all white, all ink), a monogram of the first letter of your topmost text layer (light and dark; SVG and 1024, 180 and 32 px PNG) and a favicon set (16, 32 and 180 px).' }));
    if (!mono) packNote.appendChild(h('p', { class: 'dlg-message lc-warn', text: 'Add a text layer to include the monogram and favicons.' }));

    function paint() {
      [fmt, col, box, widths, bgm].forEach(function (s) { s.paint(); });
      customBtn.setAttribute('aria-pressed', st.custom ? 'true' : 'false');
      const png = st.format === 'png', svg = st.format === 'svg', pack = st.format === 'pack';
      rows.colour.hidden = pack; rows.box.hidden = pack; rows.width.hidden = !png; rows.bg.hidden = !png; packNote.hidden = !pack;
      customIn.disabled = !st.custom;
      go.textContent = pack ? 'Export pack' : 'Export ' + (png ? 'PNG' : 'SVG');
      const sz = contentSize(st.box, st.pad);
      if (png) {
        const W = st.width, H = Math.max(1, Math.round(W * sz.h / sz.w));
        info.textContent = W + ' × ' + H + ' px';
      } else if (svg) {
        info.textContent = Math.round(sz.w) + ' × ' + Math.round(sz.h) + ' units';
      } else info.textContent = '';
      info.hidden = pack;
    }
    function close() {
      overlay.remove();
      document.body.classList.remove('has-dialog');
      document.removeEventListener('keydown', onKey, true);
      ses.dlg = null;
      if (prev && prev.focus) prev.focus();
    }
    function onKey(e) { if (e.key === 'Escape') { e.stopPropagation(); if (!ses.exporting) close(); } }
    cancel.addEventListener('click', function () { if (!ses.exporting) close(); });
    overlay.addEventListener('pointerdown', function (e) { if (e.target === overlay && !ses.exporting) close(); });
    document.addEventListener('keydown', onKey, true);
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (ses.exporting) return;
      ses.exporting = true;
      go.disabled = true; cancel.disabled = true;
      const label = go.textContent;
      go.textContent = 'Preparing…';
      err.hidden = true;
      try {
        const msg = await runExport(st, slug, tk);
        close();
        toast(msg);
      } catch (ex) {
        console.error('Logo export failed', ex);
        err.textContent = 'Could not export: ' + (ex && ex.message ? ex.message : 'something went wrong');
        err.hidden = false;
        go.disabled = false; cancel.disabled = false; go.textContent = label;
      } finally { ses.exporting = false; }
    });
    document.body.appendChild(overlay);
    document.body.classList.add('has-dialog');
    ses.dlg = { close: close };
    paint();
    form.querySelector('.seg button').focus();
  }

  async function runExport(st, slug, tk) {
    const doc = S.ed.doc();
    const sfx = st.colour === 'white' ? '-white' : st.colour === 'ink' ? '-ink' : '';
    const bgFor = function () {
      if (st.bgMode !== 'solid') return null;
      if (st.colour === 'white') return tk.colors.ink;
      if (st.colour === 'ink') return '#FFFFFF';
      return LogoDoc.resolveColor(doc.artboard.bg, tk) || '#FFFFFF';
    };
    if (st.format === 'svg') {
      const svg = await renderSVG({ colour: st.colour, box: st.box, pad: st.pad, keepBg: true });
      const name = slug + '-logo' + sfx + '.svg';
      download(name, new Blob([svg], { type: 'image/svg+xml' }));
      return 'Saved ' + name;
    }
    if (st.format === 'png') {
      const blob = await renderPNG({ colour: st.colour, box: st.box, pad: st.pad, bg: bgFor() }, st.width);
      const name = slug + '-logo' + sfx + '-' + st.width + '.png';
      download(name, blob);
      return 'Saved ' + name;
    }
    if (typeof aibZip !== 'function') throw new Error('the zip writer is not available');
    const files = [];
    const add = function (name, data) { files.push({ name: slug + '-' + name, data: data }); };
    for (const v of [['logo', 'design'], ['logo-white', 'white'], ['logo-ink', 'ink']]) {
      const o = { colour: v[1], box: 'content', pad: 0 };
      add(v[0] + '.svg', await renderSVG(o));
      add(v[0] + '.png', await bytes(await renderPNG(o, 2400)));
    }
    const node = topText();
    if (node) {
      const m = await monogramSVGs(node, tk);
      for (const v of [['logo-mono-light', m.light], ['logo-mono-dark', m.dark]]) {
        add(v[0] + '.svg', v[1]);
        for (const px of [1024, 180, 32]) add(v[0] + '-' + px + '.png', await bytes(await LogoEngine.toPNG(v[1], px)));
      }
      for (const px of [16, 32, 180]) add('favicon-' + px + '.png', await bytes(await LogoEngine.toPNG(m.dark, px)));
    }
    const blob = new Blob([aibZip(files)], { type: 'application/zip' });
    const name = slug + '-logo-pack.zip';
    download(name, blob);
    return 'Saved ' + name + ' (' + files.length + ' files)';
  }

  /* ======================= mount / unmount ======================= */
  function schedule() {
    if (!S || S.raf) return;
    const mine = S;
    mine.raf = 1;
    Promise.resolve().then(function () {          // after the editor finishes the command that fired the event
      if (S !== mine) return;
      S.raf = 0;
      try {
        buildLayers(false);
        refreshInspector();
        syncHistory();
        syncTools();
        syncZoom();
      } catch (e) { console.error('LogoChrome refresh failed', e); }
    });
  }

  function mount(ctx) {
    if (S) unmount();
    const slots = ctx.slots;
    S = {
      ctx: ctx, ed: ctx.editor, syncs: [], pop: null, dlg: null, fonts: null, inspKey: '', layersKey: '', collapsed: {},
      alignRel: 'selection', renaming: false, exporting: false, raf: 0, handlers: [], root: slots.top.closest('.le') || slots.inspector.closest('.le')
    };
    const e = S.ed;
    buildToolbar();
    buildTop();
    buildZoom();

    // layers panel: a sticky head and the list
    slots.layers.innerHTML = '';
    slots.layers.classList.add('lc-layers');
    S.layerList = h('div', { class: 'lc-layer-list', role: 'tree', 'aria-label': 'Layers', tabindex: '0' });
    slots.layers.appendChild(h('div', { class: 'lc-layers-head' }, [h('h3', { class: 'lc-sec-t', text: 'Layers' })]));
    slots.layers.appendChild(S.layerList);
    wireLayers();
    slots.inspector.classList.add('lc-inspector');

    ['change', 'select', 'history', 'tool', 'zoom'].forEach(function (ev) {
      const fn = function () { schedule(); };
      e.on(ev, fn);
      S.handlers.push([ev, fn]);
    });
    buildLayers(true);
    buildInspector();

    // font families for the picker (every family in the logo manifest)
    if (typeof LogoEngine !== 'undefined' && LogoEngine.manifest) {
      const mine = S;
      LogoEngine.manifest().then(function (list) {
        if (S !== mine) return;
        const t = {};
        list.forEach(function (f) {
          const a = t[f.family] = t[f.family] || [];
          const w = Array.isArray(f.weight) ? f.weight[0] : f.weight;
          if (!a.some(function (x) { return x.weight === w && x.style === f.style; })) a.push({ weight: w, style: f.style || 'normal' });
        });
        S.fonts = t;
        schedule();
      }).catch(function (err) { console.error('LogoChrome: font list failed', err); });
    }
  }

  function unmount() {
    if (!S) return;
    const s = S;
    try { closePop(); } catch (e) { /* ignore */ }
    if (s.dlg) { try { s.dlg.close(); } catch (e) { /* ignore */ } }
    s.handlers.forEach(function (p) { try { s.ed.off(p[0], p[1]); } catch (e) { /* ignore */ } });
    const slots = s.ctx.slots;
    if (s.onExport) slots.exportBtn.removeEventListener('click', s.onExport);
    if (s.exportPrev) { slots.exportBtn.disabled = s.exportPrev.disabled; slots.exportBtn.title = s.exportPrev.title; }
    if (s.topEls) s.topEls.grp.remove();
    [slots.toolbar, slots.layers, slots.inspector, slots.zoom].forEach(function (el) { el.innerHTML = ''; });
    slots.toolbar.classList.remove('lc-toolbar'); slots.layers.classList.remove('lc-layers');
    slots.inspector.classList.remove('lc-inspector'); slots.zoom.classList.remove('lc-zoom');
    if (s.root) { s.root.removeAttribute('data-lc-layers'); s.root.removeAttribute('data-lc-insp'); }
    S = null;
  }

  return { mount: mount, unmount: unmount, calc: calc };
})();
