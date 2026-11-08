/* ---------------------------------------------------------------------
   studio.js — the aesthetic studio's editor (inside the Styles section). A "mine" style is edited with dials
   and a live preview; every change autosaves to the stored bundle (CustomAesthetics.save).

   Public: window.Studio
     open(key)                 -> Promise<boolean>. Opens the editor for a stored ("mine") style. Folder and
                                  built-in styles are refused (Edit a copy first: CustomAesthetics.duplicate).
     close()                   -> Promise. Flushes the autosave, removes every temporary style, returns to Styles.
     isOpen()                  -> boolean
     current()                 -> { key, spec, bundle } | null. Fresh copies: spec is the aesthetic (spec 2) with the
                                  real key; bundle is the whole stored bundle ({ format, version, aesthetic, rounds,
                                  art, versions? }) as it would be saved now.
     apply(nextSpec, { label, art? })
                               -> an undoable change: replaces the spec (its key is forced to the real key), saves,
                                  re-renders panels and preview, and emits 'change'. `art` replaces the art files map.
     patchBundle({ rounds?, versions? })
                               -> sets the bundle's rounds.json data and/or version snapshots (not undoable) and
                                  schedules a save. For the round panel.
     previewEl()               -> the preview container (#sdStage). data-stu-tab on it is the drawn tab.
     renderInto(el, spec, { tab, art?, shade?, brand? })
                               -> { ok, errors }. Draws any spec (a variant) into `el` as 'board' | 'kit' | 'deck' |
                                  'stress' (default 'board') under a temporary style key, with the editor's brand
                                  colours and Light / Dark unless overridden. Temporary keys start with "studio--"
                                  and are removed when the editor closes (a small cache is kept while it is open).
     on(event, fn) -> off()    -> 'change' fn({ before, after, label, source }) after every edit, undo, redo or
                                  apply (source: 'edit' | 'undo' | 'redo' | 'apply'); 'open' fn({ key });
                                  'close' fn({ key }); 'preview' fn({ ok, errors }) after the preview redraws.
   The right column is <aside id="studioRound" class="stu-round"> (empty, labelled; the round panel fills it).
------------------------------------------------------------------------ */

const Studio = (function () {
  'use strict';

  const TEMP = 'studio--';
  const BRAND_KEY = 'bd.styles.brand';      // shared with the Styles home
  const SHADE_KEY = 'bd.styles.shade';
  const BOARD_W = 900;
  const UNDO_CAP = 100;
  const SAVE_MS = 600, PREVIEW_MS = 150, CACHE_MAX = 12;
  const STRESS = [
    { id: 'muted-beige', label: 'Muted beige', primary: '#d8cbb4' },
    { id: 'neon-green', label: 'Neon green', primary: '#39ff14' },
    { id: 'deep-navy', label: 'Deep navy', primary: '#0b1d4a' },
    { id: 'near-white', label: 'Near-white primary', primary: '#f7f7f2' },
    { id: 'pure-red', label: 'Pure red', primary: '#ff0000' },
    { id: 'grey-only', label: 'Grey only', primary: '#808080' },
  ];
  const CATEGORIES = [['shape', 'Shape'], ['structure', 'Structure'], ['type', 'Type'], ['material', 'Material'], ['state', 'State'], ['colour', 'Colour'], ['layout', 'Layout'], ['a11y', 'Accessibility'], ['art', 'Art']];
  const KIT_GROUPS = [
    ['Controls that act', ['button-primary', 'button-secondary', 'button-ghost', 'button-icon', 'button-danger', 'button-split', 'button-fab', 'button-back-top']],
    ['Fields that take input', ['field', 'select', 'date-field', 'combo', 'listbox', 'stepper']],
    ['Choosers', ['switch', 'checkbox', 'radio', 'slider', 'segmented', 'tabs', 'chip', 'knob', 'wheel', 'calendar-day']],
    ['Surfaces that hold', ['card', 'panel', 'list-row', 'accordion', 'calendar', 'matrix-tile', 'carousel-card', 'empty-state']],
    ['Overlays', ['modal', 'sheet', 'drawer', 'side-sheet', 'popover', 'lightbox', 'lightbox-control', 'tooltip', 'popup-tip', 'overlay-scrim']],
    ['Navigation', ['navbar', 'topbar', 'topbar-title', 'tabbar', 'nav-menu', 'nav-item', 'breadcrumbs', 'anchor-nav', 'link', 'menu', 'menu-item', 'mega-menu', 'menubar', 'ribbon', 'pie-menu', 'dropdown-trigger']],
    ['Feedback', ['toast', 'callout', 'badge', 'notification-dot', 'spinner', 'skeleton']],
    ['Data display', ['progress', 'avatar', 'kbd', 'divider', 'section-label', 'scrollbar']],
  ];
  const SCOPES = ['all', 'board', 'kit'];

  const $ = id => document.getElementById(id);
  const esc = s => escapeHtml(String(s == null ? '' : s));
  const clone = v => JSON.parse(JSON.stringify(v));
  const isObj = v => !!v && typeof v === 'object' && !Array.isArray(v);
  const isPair = v => isObj(v) && ('light' in v || 'dark' in v);
  const lsGet = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* not remembered */ } };
  const lsDel = k => { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } };

  const el = {
    section: $('styles'), root: $('studio'), back: $('sdBack'), title: $('sdTitle'), saveState: $('sdSave'),
    undo: $('sdUndo'), redo: $('sdRedo'), exportBtn: $('sdExport'), panels: $('sdPanels'), stage: $('sdStage'),
    tabs: $('sdTabs'), brand: $('sdBrand'), shade: $('sdShade'), errors: $('sdErrors'), round: $('studioRound'),
  };

  /* ---------------- state ---------------- */
  let S = null;                  // the open style: { key, spec, art, rounds, versions, undo, redo, tab, goodKey }
  let brands = [];
  let brandId = '';
  let shade = 'light';
  let catalog = null, byId = {}, materials = [], states = [], artMoves = [];
  const listeners = { change: [], open: [], close: [], preview: [] };
  const openSecs = new Set(['identity', 'moves']);
  const openDetails = new Set();
  const cache = new Map();       // signature -> { key }  (temporary registered styles, oldest first)
  let seq = 0;
  let previewTimer = null, saveTimer = null, saving = false, saveAgain = false, lastError = '';
  let roMap = new WeakMap();

  const emit = (name, arg) => listeners[name].slice().forEach(fn => { try { fn(arg); } catch (e) { console.error('studio: listener failed', e); } });
  function on(name, fn) {
    if (!listeners[name] || typeof fn !== 'function') return () => {};
    listeners[name].push(fn);
    return () => { const i = listeners[name].indexOf(fn); if (i >= 0) listeners[name].splice(i, 1); };
  }

  /* ---------------- catalog ---------------- */
  function loadCatalog() {
    catalog = SPEC_LAB.catalog();
    byId = {};
    catalog.forEach(m => { byId[m.id] = m; });
    materials = catalog.filter(m => m.material).map(m => m.material).sort();
    states = catalog.filter(m => m.state).map(m => m.state).sort();
    artMoves = catalog.filter(m => m.hooks.includes('art'));
  }
  const declsOfMaterial = name => { const r = SPEC_LAB.materials[name]; return r ? r.move.params : {}; };
  const declsOfState = name => { const r = SPEC_LAB.states[name]; return r ? r.move.params : {}; };
  const paramsOf = id => { const m = byId[id]; return m ? m.params : []; };

  /* ---------------- paths ---------------- */
  function getAt(obj, path) {
    let o = obj;
    for (const k of path.split('.')) { if (o == null) return undefined; o = o[k]; }
    return o;
  }
  function setAt(obj, path, value) {
    const ks = path.split('.');
    let o = obj;
    for (let i = 0; i < ks.length - 1; i++) {
      const k = ks[i];
      if (o[k] == null || typeof o[k] !== 'object') o[k] = /^\d+$/.test(ks[i + 1]) ? [] : {};
      o = o[k];
    }
    o[ks[ks.length - 1]] = value;
  }
  function delAt(obj, path) {
    const ks = path.split('.');
    let o = obj;
    for (let i = 0; i < ks.length - 1; i++) { o = o[ks[i]]; if (o == null) return; }
    const last = ks[ks.length - 1];
    if (Array.isArray(o)) o.splice(+last, 1); else delete o[last];
  }

  /* ---------------- checks before the runtime sees a spec ---------------- */
  function precheck(spec) {
    const out = [];
    for (const f of ['name', 'descriptor', 'coreTrick']) if (typeof spec[f] !== 'string' || !spec[f].trim()) out.push(`${f === 'coreTrick' ? 'Core trick' : f[0].toUpperCase() + f.slice(1)} can't be empty.`);
    const walk = (v, p) => {
      if (typeof v === 'string') { if (/[<>]/.test(v)) out.push(`${p} contains < or >, which is not allowed.`); }
      else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${p}[${i}]`));
      else if (isObj(v)) Object.keys(v).forEach(k => walk(v[k], p ? `${p}.${k}` : k));
    };
    walk(spec, '');
    return out.slice(0, 6);
  }

  /* ---------------- temporary registered styles ---------------- */
  const artSig = art => Object.keys(art || {}).sort().map(k => `${k}:${String(art[k]).length}`).join(',');

  // Registers `spec` under a temporary key (cached). -> { ok, key } | { ok:false, errors }
  function register(spec, art) {
    const sig = JSON.stringify(spec) + '|' + artSig(art);
    const hit = cache.get(sig);
    if (hit) { cache.delete(sig); cache.set(sig, hit); return { ok: true, key: hit.key }; }
    const pre = precheck(spec);
    if (pre.length) return { ok: false, errors: pre };
    const key = `${TEMP}s${++seq}`;
    const errors = [];
    const def = registerSpecAesthetic(Object.assign(clone(spec), { key }), { untrusted: true, files: art || {}, errors, file: 'studio preview', quietHooks: true });
    if (!def) return { ok: false, errors: errors.map(e => e.split(key).join(S ? S.key : 'this style')).slice(0, 6).concat(errors.length ? [] : ['The style could not be drawn.']) };
    cache.set(sig, { key });
    while (cache.size > CACHE_MAX) {
      const victim = Array.from(cache.entries()).find(([, v]) => !(S && v.key === S.goodKey));
      if (!victim) break;
      cache.delete(victim[0]);
      unregisterSpecAesthetic(victim[1].key);
    }
    return { ok: true, key };
  }

  function dropTemp() {
    cache.clear();
    Object.keys(SPEC_LAB.specs).filter(k => k.startsWith(TEMP)).forEach(k => unregisterSpecAesthetic(k));
  }

  /* ---------------- drawing ---------------- */
  function withState(st, fn) {
    const saved = Object.assign({}, state);
    const added = Object.keys(st).filter(k => !(k in state));
    Object.assign(state, st);
    try { return fn(); } finally { added.forEach(k => { delete state[k]; }); Object.assign(state, saved); }
  }

  // The neutral brand: the checker's pinned blue, derived once, so a redraw never shifts the colours.
  const NEUTRAL_PALETTE = derivePalette('#2f5d8a', 'analogous');

  function baseState(id) {
    const st = freshState();
    st.colors = Object.assign({}, NEUTRAL_PALETTE);
    const b = brands.find(x => x.id === (id === undefined ? brandId : id));
    if (b) { try { const { logoDataUrl, ...rest } = b.saved; applySavedSessionToState(rest, st); } catch (e) { /* keep the neutral */ } }
    return st;
  }
  const viewState = (base, key, mode) => Object.assign({}, base, { aesthetic: key, aestheticVersion: 'current', blend: null, bgMode: mode, pureBg: false });

  function loadFonts(st) {
    if (typeof window.loadFontFamily !== 'function') return Promise.resolve();
    return Promise.all([st.headingFont, st.bodyFont].filter(Boolean).map(f => { try { return window.loadFontFamily(f); } catch (e) { return null; } }));
  }

  function boardOf(key, base, mode) {
    const st = viewState(base, key, mode);
    return withState(st, () => { const v = abView(st); return { html: boardHtml(v.state, v.def), def: v.def, st: v.state }; });
  }

  function fitFrame(frame) {
    const inner = frame.firstElementChild;
    const w = frame.clientWidth;
    if (!inner || !w) return;
    const z = Math.min(1, w / BOARD_W);
    inner.style.setProperty('--stu-zoom', z.toFixed(4));
    const h = (frame.dataset.top ? Math.min(inner.offsetHeight, +frame.dataset.top) : inner.offsetHeight) * z;
    frame.style.height = Math.ceil(h) + 'px';
  }

  function watch(host, fn) {
    const old = roMap.get(host);
    if (old) old.disconnect();
    if (!('ResizeObserver' in window)) return;
    const ro = new ResizeObserver(fn);
    ro.observe(host);
    roMap.set(host, ro);
  }

  function boardFrame(host, key, base, mode, opts) {
    const b = boardOf(key, base, mode);
    const frame = document.createElement('div');
    frame.className = 'stu-frame';
    const inner = document.createElement('div');
    inner.className = 'stu-board';
    inner.setAttribute('inert', '');
    inner.style.setProperty('--font-heading', b.st.headingFont.css);
    inner.style.setProperty('--font-body', b.st.bodyFont.css);
    inner.innerHTML = b.html;
    if (opts && opts.top) {
      // The top of the board only: its first two blocks (as the Styles home tiles).
      const root = inner.querySelector('.ab-in');
      if (root) {
        let blocks = 0;
        Array.from(root.children).forEach(c => {
          const chrome = c.classList.contains('ab-head') || c.classList.contains('ab-rule');
          if (blocks >= 2) c.remove(); else if (!chrome) blocks++;
        });
      }
    }
    frame.appendChild(inner);
    host.appendChild(frame);
    if (b.def.blend && inner.firstElementChild) {
      if (typeof blendClearArtText === 'function') blendClearArtText(inner.firstElementChild);
      if (typeof blendLegibility === 'function') blendLegibility(inner.firstElementChild);
    }
    fitFrame(frame);
    loadFonts(b.st).then(() => { if (frame.isConnected) fitFrame(frame); });
    return frame;
  }

  function drawBoard(host, key, base, mode) {
    boardFrame(host, key, base, mode);
    watch(host, () => host.querySelectorAll('.stu-frame').forEach(fitFrame));
  }

  function drawKit(host, key, base, mode) {
    const st = viewState(base, key, mode);
    const box = document.createElement('div');
    box.className = 'sb-view stu-kit';
    host.appendChild(box);
    withState(st, () => { SeeBuilt.kitInto(box, { mode }); });
    watch(host, () => {});
  }

  function drawDeck(host, key, base, mode) {
    const st = viewState(base, key, mode);
    const grid = document.createElement('div');
    grid.className = 'slide-grid deck-grid stu-deck';
    host.appendChild(grid);
    withState(st, () => {
      const v = abView(st);
      const s = Object.assign({}, v.state, { content: effectiveContent() });
      const i = Math.max(0, DECK_SLIDES.findIndex(sl => sl.key === 'cover'));
      grid.innerHTML = bdCardHtml(s, v.def, DECK_SLIDES[i], i, DECK_SLIDES.length);
      const foot = grid.querySelector('.slide-card-foot');
      if (foot) foot.remove();
      setBoardFonts(grid);
      const fit = () => { withState(st, () => { bdZoomCards(grid); bdApplyRadius(grid, v.def); bdFitDeck(grid); }); };
      fit();
      loadFonts(v.state).then(() => { if (grid.isConnected) fit(); });
      watch(host, () => { if (grid.isConnected) bdZoomCards(grid); });
    });
  }

  function drawStress(host, key, mode) {
    const wrap = document.createElement('div');
    wrap.className = 'stu-stress';
    host.appendChild(wrap);
    STRESS.forEach(p => {
      const cell = document.createElement('figure');
      cell.className = 'stu-stress-cell';
      cell.innerHTML = `<figcaption>${esc(p.label)} <i>${esc(p.primary)}</i></figcaption>`;
      wrap.appendChild(cell);
      const base = baseState('');
      base.colors = derivePalette(p.primary, 'analogous');
      base.scheme = 'analogous';
      base.hue = Math.round(hexToHsl(p.primary).h);
      const frame = boardFrame(cell, key, base, mode, { top: true });
      frame.dataset.top = '520';
      fitFrame(frame);
    });
    watch(host, () => host.querySelectorAll('.stu-frame').forEach(fitFrame));
  }

  function drawInto(host, key, tab, mode, brand) {
    host.innerHTML = '';
    host.dataset.stuTab = tab;
    const base = baseState(brand);
    if (tab === 'kit') drawKit(host, key, base, mode);
    else if (tab === 'deck') drawDeck(host, key, base, mode);
    else if (tab === 'stress') drawStress(host, key, mode);
    else drawBoard(host, key, base, mode);
  }

  /* renderInto(el, spec, { tab, art, shade, brand }) -> { ok, errors } */
  function renderInto(host, spec, opts) {
    opts = opts || {};
    if (!host || !spec) return { ok: false, errors: ['Nothing to draw.'] };
    const r = register(spec, opts.art || (S && S.art) || {});
    if (!r.ok) return { ok: false, errors: r.errors };
    try { drawInto(host, r.key, opts.tab || 'board', opts.shade === 'dark' ? 'dark' : opts.shade === 'light' ? 'light' : shade, opts.brand); }
    catch (e) { console.error('studio: could not draw a style', e); return { ok: false, errors: ['The preview could not be drawn.'] }; }
    return { ok: true, errors: [] };
  }

  /* ---------------- preview ---------------- */
  function showErrors(errors) {
    el.errors.hidden = !errors.length;
    el.errors.innerHTML = errors.length ? `<strong>This change can't be drawn yet.</strong><ul>${errors.map(e => `<li>${esc(e)}</li>`).join('')}</ul><span>The preview keeps the last version that worked.</span>` : '';
  }

  function refreshPreview() {
    previewTimer = null;
    if (!S) return;
    const r = register(S.spec, S.art);
    S.valid = r.ok;
    S.errors = r.ok ? [] : r.errors;
    showErrors(S.errors);
    if (r.ok) {
      S.goodKey = r.key;
      try { drawInto(el.stage, r.key, S.tab, shade, brandId); } catch (e) { console.error('studio: could not draw the preview', e); }
    } else if (!S.goodKey) {
      el.stage.innerHTML = '<p class="stu-empty">There is nothing valid to draw yet.</p>';
    }
    paintSave();
    emit('preview', { ok: r.ok, errors: S.errors.slice() });
  }
  function schedulePreview(ms) {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(refreshPreview, ms === undefined ? PREVIEW_MS : ms);
  }

  /* ---------------- saving ---------------- */
  const bundleNow = () => {
    const b = { format: 'looks-good-aesthetic', version: 1, aesthetic: clone(S.spec), rounds: S.rounds ? clone(S.rounds) : null, art: clone(S.art) };
    if (S.versions && S.versions.length) b.versions = clone(S.versions);
    return b;
  };

  function paintSave() {
    if (!S) return;
    let text = 'Saved', cls = 'is-saved';
    if (S.errors && S.errors.length) { text = 'Not saved'; cls = 'is-bad'; }
    else if (lastError) { text = 'Not saved'; cls = 'is-bad'; }
    else if (saving || saveTimer || S.dirty) { text = 'Saving…'; cls = 'is-saving'; }
    el.saveState.textContent = text;
    el.saveState.className = 'stu-save ' + cls;
    el.saveState.title = lastError || '';
  }

  function scheduleSave() {
    if (!S) return;
    S.dirty = true;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => { saveTimer = null; doSave(); }, SAVE_MS);
    paintSave();
  }

  async function doSave() {
    if (!S) return;
    if (saving) { saveAgain = true; return; }
    if (previewTimer) refreshPreview();          // validate what is about to be written
    if (!S.valid) { paintSave(); return; }       // an invalid edit is never written; the last good one stays stored
    saving = true;
    const key = S.key;
    const snapshot = bundleNow();
    const r = await CustomAesthetics.save(key, snapshot);
    saving = false;
    if (!S || S.key !== key) return;
    lastError = r.ok ? '' : r.error || 'The style could not be saved.';
    if (r.ok && !saveAgain && !saveTimer) S.dirty = false;
    if (saveAgain) { saveAgain = false; scheduleSave(); }
    paintSave();
  }

  async function flush() {
    if (!S) return;
    clearTimeout(saveTimer); saveTimer = null;
    while (saving) await new Promise(r => setTimeout(r, 30));
    if (S && S.dirty) await doSave();
  }

  /* ---------------- history and edits ---------------- */
  function paintHistory() {
    el.undo.disabled = !S || !S.undo.length;
    el.redo.disabled = !S || !S.redo.length;
    el.title.textContent = S ? S.spec.name || S.key : '';
  }

  function afterChange(before, after, label, source, sections) {
    paintHistory();
    if (sections === 'all') renderPanels(); else if (sections) [].concat(sections).forEach(renderSection);
    schedulePreview();
    scheduleSave();
    emit('change', { before: clone(before), after: clone(after), label: label || '', source });
  }

  function commit(next, art, label, o) {
    o = o || {};
    const before = S.spec;
    const now = Date.now();
    const top = S.undo[S.undo.length - 1];
    if (o.coalesce && top && top.coalesce === o.coalesce && now - top.t < 1500) top.t = now;
    else {
      S.undo.push({ spec: S.spec, art: S.art, label, coalesce: o.coalesce || null, t: now });
      if (S.undo.length > UNDO_CAP) S.undo.shift();
    }
    S.redo = [];
    S.spec = next;
    S.art = art;
    afterChange(before, next, label, o.source || 'edit', o.sections);
  }

  function edit(mutate, label, o) {
    const next = clone(S.spec);
    mutate(next);
    if (!(o && o.art) && JSON.stringify(next) === JSON.stringify(S.spec)) return;
    commit(next, (o && o.art) || S.art, label, o);
  }

  function step(from, to, source) {
    const e = from.pop();
    if (!e) return;
    to.push({ spec: S.spec, art: S.art, label: e.label, coalesce: null, t: 0 });
    const before = S.spec;
    S.spec = e.spec; S.art = e.art;
    afterChange(before, S.spec, e.label, source, 'all');
  }
  const undo = () => { if (S) step(S.undo, S.redo, 'undo'); };
  const redo = () => { if (S) step(S.redo, S.undo, 'redo'); };

  function apply(nextSpec, opts) {
    if (!S || !isObj(nextSpec)) return;
    opts = opts || {};
    const next = clone(nextSpec);
    next.key = S.key;
    commit(next, opts.art ? clone(opts.art) : S.art, opts.label || 'Change', { source: 'apply', sections: 'all' });
  }

  function patchBundle(patch) {
    if (!S || !isObj(patch)) return;
    if ('rounds' in patch) S.rounds = patch.rounds ? clone(patch.rounds) : null;
    if ('versions' in patch) S.versions = Array.isArray(patch.versions) ? clone(patch.versions) : [];
    scheduleSave();
  }

  /* ---------------- form pieces ---------------- */
  const fid = (() => { let n = 0; return () => 'sdf' + (++n); })();

  function fText(path, label, val, o) {
    o = o || {};
    const id = fid();
    const ph = o.ph ? ` placeholder="${esc(o.ph)}"` : '';
    const tag = o.area ? `<textarea id="${id}" data-p="${path}" data-t="text" rows="${o.rows || 3}" spellcheck="true"${ph}>${esc(val)}</textarea>`
      : `<input type="text" id="${id}" data-p="${path}" data-t="text" value="${esc(val)}" autocomplete="off" spellcheck="false"${ph} />`;
    return `<div class="stu-f ${o.req && !String(val || '').trim() ? 'is-bad' : ''}"><label for="${id}">${esc(label)}${o.req ? ' <b>required</b>' : ''}</label>${tag}${o.help ? `<small>${esc(o.help)}</small>` : ''}</div>`;
  }
  function fList(path, label, arr, help, ph) {
    const id = fid();
    return `<div class="stu-f"><label for="${id}">${esc(label)}</label><input type="text" id="${id}" data-p="${path}" data-t="list" value="${esc((arr || []).join(', '))}" autocomplete="off" spellcheck="false"${ph ? ` placeholder="${esc(ph)}"` : ''} />${help ? `<small>${esc(help)}</small>` : ''}</div>`;
  }
  function fSelect(path, label, val, options, o) {
    const id = fid();
    const opts = options.slice();
    if (val != null && val !== '' && !opts.some(x => (Array.isArray(x) ? x[0] : x) === val)) opts.push(val);
    return `<div class="stu-f"><label for="${id}">${esc(label)}</label><select id="${id}"${path ? ` data-p="${path}"` : ''} data-t="${(o && o.t) || 'sel'}">${o && o.empty ? `<option value="">${esc(o.empty)}</option>` : ''}${opts.map(x => { const [v, t] = Array.isArray(x) ? x : [x, x]; return `<option value="${esc(v)}"${v === val ? ' selected' : ''}>${esc(t)}</option>`; }).join('')}</select></div>`;
  }
  function fSeg(path, label, val, options) {
    return `<div class="stu-f"><span class="stu-lab">${esc(label)}</span><div class="seg" role="group" aria-label="${esc(label)}">${options.map(o => `<button type="button" data-seg="${esc(path)}" data-val="${esc(o)}" aria-pressed="${o === val}">${esc(o)}</button>`).join('')}</div></div>`;
  }

  /* ---------------- dials ---------------- */
  function stepFor(d) {
    const [lo, hi] = d.range || [0, 100];
    const span = hi - lo;
    const intLike = Number.isInteger(d.default) && Number.isInteger(lo) && Number.isInteger(hi);
    return intLike && span >= 10 ? 1 : span <= 2 ? 0.01 : span <= 10 ? 0.05 : 0.1;
  }
  const short = v => (typeof v === 'number' ? String(Math.round(v * 1000) / 1000) : String(v));

  function control(d, v, path) {
    const p = esc(path);
    if (d.kind === 'number') {
      const r = d.range;
      const n = typeof v === 'number' ? v : d.default;
      return `<span class="stu-num">${r ? `<input type="range" data-p="${p}" data-t="num" data-name="${esc(d.name)}" min="${r[0]}" max="${r[1]}" step="${stepFor(d)}" value="${n}" aria-label="${esc(d.name)}" />` : ''}<input type="number" data-p="${p}" data-t="num" data-name="${esc(d.name)}" ${r ? `min="${r[0]}" max="${r[1]}"` : ''} step="${r ? stepFor(d) : 'any'}" value="${n}" aria-label="${esc(d.name)} value" /></span>`;
    }
    if (d.kind === 'enum') {
      const opts = d.options || [];
      if (opts.length <= 4) return `<div class="seg stu-seg" role="group" aria-label="${esc(d.name)}">${opts.map(o => `<button type="button" data-seg="${p}" data-val="${esc(o)}" data-name="${esc(d.name)}" aria-pressed="${o === v}">${esc(o)}</button>`).join('')}</div>`;
      return `<select data-p="${p}" data-t="sel" data-name="${esc(d.name)}" aria-label="${esc(d.name)}">${opts.map(o => `<option value="${esc(o)}"${o === v ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
    }
    if (d.kind === 'bool') return `<label class="stu-switch"><input type="checkbox" role="switch" data-p="${p}" data-t="bool" data-name="${esc(d.name)}"${v ? ' checked' : ''} /><i></i><span>${v ? 'On' : 'Off'}</span></label>`;
    if (d.kind === 'colour') {
      const hex = typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v);
      return `<span class="stu-colour"><input type="color" data-p="${p}" data-t="col" data-name="${esc(d.name)}" value="${hex ? v : '#808080'}" aria-label="${esc(d.name)} colour"${hex ? '' : ' class="is-unset"'} /><input type="text" data-p="${p}" data-t="colour" data-name="${esc(d.name)}" value="${esc(v)}" autocomplete="off" spellcheck="false" aria-label="${esc(d.name)}" /></span>`;
    }
    return `<input type="text" data-p="${p}" data-t="ptext" data-name="${esc(d.name)}" value="${esc(v)}" autocomplete="off" spellcheck="false" aria-label="${esc(d.name)}" />`;
  }

  // One param dial. `base` is the path of the params object (e.g. "moves.2.params").
  function dial(d, base, given) {
    const path = `${base}.${d.name}`;
    const has = given !== undefined;
    const pair = isPair(given);
    const cur = has ? given : d.default;
    const meta = `default ${short(d.default)}${d.range ? ` · ${d.range[0]}–${d.range[1]}` : d.options ? ` · ${d.options.length} options` : ''}`;
    let body;
    if (pair) {
      const side = k => `<div class="stu-side"><span class="stu-side-l">${k === 'light' ? 'Light' : 'Dark'}</span>${control(d, k in cur ? cur[k] : d.default, `${path}.${k}`)}</div>`;
      body = side('light') + side('dark');
    } else body = control(d, cur, path);
    return `<div class="stu-dial${has ? ' is-set' : ''}" data-dial="${esc(path)}" data-name="${esc(d.name)}">
      <div class="stu-dial-h"><span class="stu-dial-n">${esc(d.name)}</span><span class="stu-dial-m">${esc(meta)}</span>${has ? `<button type="button" class="stu-link" data-act="reset" data-path="${esc(path)}" title="Back to the default">Reset</button>` : ''}</div>
      <div class="stu-dial-b">${body}</div>
      <label class="stu-differ"><input type="checkbox" data-differ="${esc(path)}" data-name="${esc(d.name)}" aria-label="${esc(d.name)} differs in light and dark"${pair ? ' checked' : ''} /> Light / Dark differ</label>
    </div>`;
  }

  function dialsHtml(decls, base, given) {
    const list = Array.isArray(decls) ? decls : Object.entries(decls).map(([name, d]) => Object.assign({ name }, d));
    if (!list.length) return '<p class="stu-note">No dials.</p>';
    return list.map(d => dial(d, base, (given || {})[d.name])).join('');
  }

  /* ---------------- panels ---------------- */
  const SECTIONS = [
    { id: 'identity', title: 'Identity', html: identityHtml },
    { id: 'colour', title: 'Colour', html: () => entriesHtml('colour') },
    { id: 'moves', title: 'Material & moves', html: () => entriesHtml('moves') },
    { id: 'kit', title: 'Kit', html: kitHtml },
    { id: 'type', title: 'Type', html: typeHtml },
    { id: 'art', title: 'Art', html: artHtml },
    { id: 'voice', title: 'Voice', html: voiceHtml },
    { id: 'rules', title: 'Rules', html: rulesHtml },
  ];

  function identityHtml() {
    const s = S.spec;
    const fam = typeof AESTHETIC_FAMILIES !== 'undefined' ? AESTHETIC_FAMILIES.map(f => [f.key, f.label]) : [];
    const cls = typeof BUILD_CLASSES !== 'undefined' ? Object.keys(BUILD_CLASSES) : [];
    const lay = s.layout || {};
    const noMeta = !s.meta ? '<p class="stu-note">This style has no family or font data yet.</p><button type="button" class="btn btn-ghost btn-small" data-act="add-meta">Add family and fonts</button>' : '';
    return [
      fText('name', 'Name', s.name, { req: true }),
      fText('descriptor', 'Descriptor', s.descriptor, { req: true, help: 'Three words, separated by dots.', ph: 'Word · Word · Word' }),
      fText('summary', 'Summary', s.summary || '', { area: true, rows: 2, help: 'One sentence a stranger understands.', ph: 'One sentence a stranger understands.' }),
      fText('coreTrick', 'Core trick', s.coreTrick, { area: true, rows: 3, req: true, help: 'The mechanism, not the mood: what makes it work.' }),
      fText('influences', 'Influences', s.influences || '', { area: true, rows: 2, help: 'Plain list of what this draws on.', ph: 'Plain list of what this draws on' }),
      fSeg('mode', 'Looks best in', s.mode, ['light', 'dark']),
      s.meta ? fSelect('meta.family', 'Family', s.meta.family, fam) : noMeta,
      cls.length && s.build ? fSelect('build.cls', 'Build class', s.build.cls, cls) : '',
      isObj(s.build) ? `<div class="stu-sub">Build notes</div>
        ${fText('build.surface', 'Surface', s.build.surface || '', { area: true, rows: 2, help: 'One sentence on how surfaces are made. Keep it true to the look.' })}
        ${fText('build.pressText', 'Press behaviour', s.build.pressText || '', { area: true, rows: 2, help: 'What a press does: how far the surface moves, how long, which easing.' })}
        ${fText('build.icons', 'Icons', s.build.icons || '', { area: true, rows: 2, help: 'Stroke weight, caps, corners and how a selected icon looks.' })}
        ${fText('build.appIcon', 'App icon', s.build.appIcon || '', { area: true, rows: 2, help: 'The app icon in one sentence: tile, border, glyph, colour.' })}` : '',
      `<div class="stu-row2">${fSelect('layout.hero', 'Hero layout', lay.hero, ['split', 'centered', 'poster', 'scene'], { empty: 'Default' })}${fSelect('layout.palette', 'Palette layout', lay.palette, ['swatches', 'chips', 'list', 'strips'], { empty: 'Default' })}</div>`,
      `<div class="stu-row2">${fSelect('layout.sections', 'Sections', lay.sections, ['two-col', 'asym', 'stacked'], { empty: 'Default' })}${fSelect('slideShape', 'Slide shape', s.slideShape, ['minimal', 'soft', 'refined', 'geometric', 'classic'], { empty: 'Default' })}</div>`,
    ].join('');
  }

  // "Not in effect" words for an entry whose hooks an earlier entry already provides (order logic: StudioRounds.hookOrder).
  function shadowNote(list, i, ho) {
    const sh = ho.shadowed[`${list}.${i}`];
    if (!sh || !sh.length) return '';
    const m = byId[S.spec[list][i].move];
    const mine = ((m && m.hooks) || []).filter(h => h !== 'tokens');
    const all = mine.every(h => sh.some(x => x.hook === h));
    const who = by => (by === 'art.hero' ? 'the hero art' : `${by} above`);
    const parts = sh.map(x => `${who(x.by)} already ${StudioRounds.hookWords(x.hook)}`);
    const fix = sh.some(x => x.by === 'art.hero') ? 'Change the hero art or remove this one.' : 'Move this one up or remove that one.';
    return `<p class="stu-shadow" role="note"><b>${all ? 'Not in effect' : 'Partly not in effect'}:</b> ${esc(parts.join('; '))}. ${fix}</p>`;
  }

  function entryHtml(list, i, e, ho) {
    const m = byId[e.move];
    const base = `${list}.${i}.params`;
    const key = `${list}.${i}`;
    const scope = e.scope || 'all';
    return `<details class="stu-entry" data-d="${key}"${openDetails.has(key) ? ' open' : ''}>
      <summary><span class="stu-entry-n">${esc(e.move)}</span>${m ? `<span class="stu-tier">${esc(m.tier || '')}</span>` : '<span class="stu-tier is-bad">unknown</span>'}${ho.shadowed[key] ? '<span class="stu-tier is-bad">not in effect</span>' : ''}</summary>
      <div class="stu-entry-b">
        ${shadowNote(list, i, ho)}
        <p class="stu-what">${esc(m ? m.what : 'This move is not in the catalog.')}</p>
        <div class="stu-entry-bar">
          <label>Applies to <select data-p="${key}.scope" data-t="scope" aria-label="Scope of ${esc(e.move)}">${SCOPES.map(sc => `<option value="${sc}"${sc === scope ? ' selected' : ''}>${sc === 'all' ? 'Board and kit' : sc === 'board' ? 'Board only' : 'Kit only'}</option>`).join('')}</select></label>
          <span class="stu-btns">
            <button type="button" class="btn btn-ghost btn-small" data-act="up" data-list="${list}" data-i="${i}" aria-label="Move up"${i === 0 ? ' disabled' : ''}>Up</button>
            <button type="button" class="btn btn-ghost btn-small" data-act="down" data-list="${list}" data-i="${i}" aria-label="Move down"${i === S.spec[list].length - 1 ? ' disabled' : ''}>Down</button>
            <button type="button" class="btn btn-ghost btn-small st-danger" data-act="remove" data-list="${list}" data-i="${i}">Remove</button>
          </span>
        </div>
        ${m ? dialsHtml(m.params, base, e.params) : ''}
      </div>
    </details>`;
  }

  function entriesHtml(list) {
    const items = S.spec[list] || [];
    const ho = StudioRounds.hookOrder(S.spec, catalog);
    return `${items.length ? items.map((e, i) => entryHtml(list, i, e, ho)).join('') : `<p class="stu-note">No ${list === 'colour' ? 'colour recipes' : 'moves'} yet.</p>`}
      <button type="button" class="btn btn-ghost btn-small stu-add" data-act="add" data-list="${list}">${list === 'colour' ? 'Add colour recipe' : 'Add move'}</button>`;
  }

  function kitGroups() {
    const known = new Set(KIT_GROUPS.flatMap(g => g[1]));
    const groups = KIT_GROUPS.map(([name, comps]) => [name, comps.filter(c => KIT_COMPONENTS[c])]);
    const rest = Object.keys(KIT_COMPONENTS).filter(c => !known.has(c));
    if (rest.length) groups.push(['Other', rest]);
    return groups;
  }

  // The dials of a kit row's material and states. Drawn only while the row is open (70 rows would be a lot of DOM).
  function kitDials(comp) {
    const e = (S.spec.kit || {})[comp];
    if (!e) return '';
    const mat = e.material || '';
    const sts = [].concat(e.state || []);
    const base = `kit.${comp}.params`;
    const given = e.params || {};
    const dials = [];
    if (mat && Object.keys(declsOfMaterial(mat)).length) dials.push(`<div class="stu-sub">Material: ${esc(mat)}</div>${dialsHtml(declsOfMaterial(mat), `${base}.${mat}`, given[mat])}`);
    sts.forEach(sn => { if (Object.keys(declsOfState(sn)).length) dials.push(`<div class="stu-sub">State: ${esc(sn)}</div>${dialsHtml(declsOfState(sn), `${base}.${sn}`, given[sn])}`); });
    return dials.join('');
  }

  function kitRow(comp, group) {
    const e = (S.spec.kit || {})[comp];
    const mat = e && e.material || '';
    const sts = e ? [].concat(e.state || []) : [];
    const key = `kit.${comp}`;
    const free = states.filter(x => !sts.includes(x));
    return `<details class="stu-entry stu-kit-row${e ? '' : ' is-empty'}" data-d="${key}"${openDetails.has(key) ? ' open' : ''}>
      <summary><span class="stu-entry-n">${esc(comp)}</span><span class="stu-tier">${esc(mat || 'not mapped')}${sts.length ? ' · ' + sts.length + (sts.length === 1 ? ' state' : ' states') : ''}</span></summary>
      <div class="stu-entry-b">
        <div class="stu-row2">
          <div class="stu-f"><label>Material</label><select data-kit="${comp}" data-t="kitmat" aria-label="Material of ${esc(comp)}"><option value="">None</option>${materials.map(m => `<option value="${esc(m)}"${m === mat ? ' selected' : ''}>${esc(m)}</option>`).join('')}</select></div>
          <div class="stu-f"><label>Applies to</label><select data-p="${key}.scope" data-t="scope" aria-label="Scope of ${esc(comp)}"${e ? '' : ' disabled'}>${SCOPES.map(sc => `<option value="${sc}"${sc === ((e && e.scope) || 'all') ? ' selected' : ''}>${sc === 'all' ? 'Board and kit' : sc === 'board' ? 'Board only' : 'Kit only'}</option>`).join('')}</select></div>
        </div>
        <div class="stu-f"><span class="stu-lab">States</span>
          <div class="stu-chips">${sts.map(sn => `<span class="stu-chip">${esc(sn)}<button type="button" data-act="rm-state" data-kit="${comp}" data-state="${esc(sn)}" aria-label="Remove ${esc(sn)}">×</button></span>`).join('') || '<span class="stu-note">None</span>'}</div>
          <select data-kit="${comp}" data-t="kitstate" aria-label="Add a state to ${esc(comp)}"><option value="">Add a state…</option>${free.map(x => `<option value="${esc(x)}">${esc(x)}</option>`).join('')}</select>
        </div>
        <div data-lazy="${esc(comp)}">${openDetails.has(key) ? kitDials(comp) : ''}</div>
        <button type="button" class="btn btn-ghost btn-small" data-act="apply-group" data-kit="${comp}" data-group="${esc(group)}"${e ? '' : ' disabled'}>Apply to group</button>
      </div>
    </details>`;
  }

  function kitHtml() {
    return kitGroups().map(([name, comps]) => `<div class="stu-group"><div class="stu-group-h">${esc(name)}<i>${comps.filter(c => (S.spec.kit || {})[c]).length}/${comps.length}</i></div>${comps.map(c => kitRow(c, name)).join('')}</div>`).join('');
  }

  function typeHtml() {
    const s = S.spec;
    const t = s.type || {};
    const f = ((s.meta || {}).fonts) || {};
    if (!s.meta) return '<p class="stu-note">This style has no font data yet. Add it in Identity.</p>';
    const classes = typeof FONT_CLASSES !== 'undefined' ? Object.keys(FONT_CLASSES) : [];
    const cls = role => classes.length ? `<div class="stu-f"><span class="stu-lab">${role} font classes</span><div class="stu-chips stu-toggles">${classes.map(c => `<button type="button" data-act="font-class" data-role="${role}" data-cls="${esc(c)}" aria-pressed="${((f[role] || {}).classes || []).includes(c)}">${esc(c)}</button>`).join('')}</div></div>` : '';
    return [
      `<div class="stu-row2">${fSelect('type.ui', 'UI text', t.ui, ['sans', 'body', 'serif', 'mono'], { empty: 'Default' })}${fSelect('type.label', 'Labels', t.label, ['mono', 'sans', 'serif', 'body'], { empty: 'Default' })}</div>`,
      dial({ name: 'display', kind: 'number', default: 1, range: [0.6, 2] }, 'type', t.display),
      fSelect('highlight', 'Headline highlight', s.highlight, ['ink', 'band', 'custom'], { empty: 'Default' }),
      '<div class="stu-sub">Fonts to recommend</div>',
      fList('meta.fonts.heading.picks', 'Heading picks', (f.heading || {}).picks, 'Font names from the font picker, separated by commas.', 'e.g. a heavy display or neo-grotesk'),
      cls('heading'),
      fList('meta.fonts.body.picks', 'Body picks', (f.body || {}).picks),
      cls('body'),
      fList('meta.fonts.mono.picks', 'Mono picks', (f.mono || {}).picks),
      fList('meta.fonts.avoid', 'Avoid (font classes)', f.avoid, 'Font classes this look should not use.'),
      fText('meta.fonts.why', 'Why these fonts', f.why || '', { area: true, rows: 2, ph: 'One sentence on why these font classes carry the look' }),
    ].join('');
  }

  function artHtml() {
    const hero = (S.spec.art || {}).hero || null;
    const kind = hero ? hero.kind : 'none';
    let body = '';
    if (kind === 'generator') {
      const m = byId[hero.move];
      body = `<div class="stu-f"><label for="sdArtMove">Art move</label><select id="sdArtMove" data-t="artmove">${artMoves.map(a => `<option value="${esc(a.id)}"${a.id === hero.move ? ' selected' : ''}>${esc(a.id)}</option>`).join('')}</select><small>${esc(m ? m.what : '')}</small></div>${m ? dialsHtml(m.params, 'art.hero.params', hero.params) : ''}`;
    } else if (kind === 'svg' || kind === 'image') {
      const have = hero.src && S.art[hero.src];
      body = `<div class="stu-f"><label for="sdArtFile">${kind === 'svg' ? 'SVG file' : 'Image file (png, jpeg, webp or gif)'}</label><input type="file" id="sdArtFile" data-t="artfile" accept="${kind === 'svg' ? '.svg,image/svg+xml' : 'image/png,image/jpeg,image/webp,image/gif'}" /><small>${have ? `Stored as ${esc(hero.src)} (${Math.round(String(have).length / 1024)} KB).` : 'No file yet.'} The art appears on the board and deck, never on app screens.</small></div>
        <div class="stu-row2">${fSeg('art.hero.fit', 'Fit', hero.fit || 'cover', ['cover', 'contain'])}</div>
        ${fText('art.hero.alt', 'Alt text', hero.alt || '', { help: 'Say what the art shows.' })}`;
    }
    return `${fSelect('', 'Kind', kind, [['none', 'No art'], ['generator', 'Generated by a move'], ['svg', 'SVG file'], ['image', 'Image file']], { t: 'artkind' })}${body}<p class="stu-note" id="sdArtMsg" role="status"></p>`;
  }

  function voiceHtml() {
    const s = S.spec;
    const lab = s.labels || {};
    const states3 = [0, 1, 2].map(i => fText(`labels.states.${i}`, `State ${i + 1} name`, (lab.states || [])[i] || ''));
    const copy = Object.entries(s.copy || {}).map(([k, v]) => `<div class="stu-copy"><div class="stu-sub">${esc(k)}</div>${fText(`copy.${k}.label`, 'Label', (v || {}).label || '')}${fText(`copy.${k}.text`, 'Text', (v || {}).text || '', { area: true, rows: 2 })}</div>`).join('');
    return [
      fText('motto', 'Motto', s.motto || '', { help: 'A short line.', ph: 'Short line' }),
      fText('kicker', 'Kicker above the headline', s.kicker || '', { help: 'Left empty, the board prints the descriptor.', ph: 'Kicker above the headline' }),
      '<div class="stu-sub">Material strip</div>',
      fText('labels.material', 'Material name', lab.material || '', { ph: 'e.g. Hard offset' }),
      `<div class="stu-row3">${states3.join('')}</div>`,
      fSelect('labels.statesKind', 'States drawn as', lab.statesKind, ['button', 'swatch', 'chip'], { empty: 'Default' }),
      copy ? `<div class="stu-sub">Specimen copy</div>${copy}` : '',
    ].join('');
  }

  function rulesHtml() {
    const r = S.spec.rules || {};
    const one = (k, title) => `<div class="stu-f"><span class="stu-lab">${title}</span>${(r[k] || []).map((t, i) => `<div class="stu-rule"><input type="text" data-p="rules.${k}.${i}" data-t="text" value="${esc(t)}" aria-label="${title} ${i + 1}" autocomplete="off" /><button type="button" class="btn btn-ghost btn-small" data-act="rule-rm" data-k="${k}" data-i="${i}" aria-label="Remove ${title} ${i + 1}">Remove</button></div>`).join('')}<button type="button" class="btn btn-ghost btn-small stu-add" data-act="rule-add" data-k="${k}">Add</button></div>`;
    return one('do', 'Do') + one('dont', "Don't");
  }

  function renderSection(id) {
    const sec = el.panels.querySelector(`[data-sec="${id}"]`);
    if (!sec) return;
    const body = sec.querySelector('.stu-sec-b');
    if (!openSecs.has(id)) { body.innerHTML = ''; body.dataset.stale = '1'; return; }
    const def = SECTIONS.find(s => s.id === id);
    body.innerHTML = def.html();
    delete body.dataset.stale;
  }

  function renderPanels() {
    const top = el.panels.scrollTop;
    el.panels.innerHTML = SECTIONS.map(s => `<section class="stu-sec" data-sec="${s.id}"><button type="button" class="stu-sec-h" aria-expanded="${openSecs.has(s.id)}" aria-controls="sdsec-${s.id}"><span>${s.title}</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button><div class="stu-sec-b" id="sdsec-${s.id}"${openSecs.has(s.id) ? '' : ' hidden'}></div></section>`).join('');
    SECTIONS.forEach(s => { if (openSecs.has(s.id)) renderSection(s.id); });
    el.panels.scrollTop = top;
  }

  /* ---------------- panel events ---------------- */
  function sectionOf(node) { const s = node.closest('[data-sec]'); return s ? s.dataset.sec : null; }

  // Light / Dark pair side of a path: "moves.2.params.base.light" -> { path: "moves.2.params.base", side: "light" }
  function splitSide(path) { const m = path.match(/^(.*)\.(light|dark)$/); return m ? { path: m[1], side: m[2] } : { path, side: null }; }

  function declFor(node) {
    // The param declaration behind a dial control: found from the dial's path and the spec entry it belongs to.
    const path = (node.dataset.p || node.dataset.seg || node.dataset.differ || node.dataset.path || '');
    const parts = splitSide(path).path.split('.');
    const name = node.dataset.name || parts[parts.length - 1];
    if (parts[0] === 'type' && name === 'display') return { name, kind: 'number', default: 1, range: [0.6, 2] };
    if (parts[0] === 'art') { const m = byId[((S.spec.art || {}).hero || {}).move]; return m ? m.params.find(p => p.name === name) : null; }
    if (parts[0] === 'kit') { const owner = parts[parts.length - 2]; const d = declsOfMaterial(owner)[name] || declsOfState(owner)[name]; return d ? Object.assign({ name }, d) : null; }
    const e = (S.spec[parts[0]] || [])[+parts[1]];
    const m = e && byId[e.move];
    return m ? m.params.find(p => p.name === name) : null;
  }

  function parseValue(d, node) {
    const t = node.dataset.t;
    if (d.kind === 'number') {
      const n = parseFloat(node.value);
      if (!Number.isFinite(n)) return { skip: true };
      return { value: d.range ? Math.min(d.range[1], Math.max(d.range[0], n)) : n };
    }
    if (d.kind === 'bool') return { value: node.checked };
    if (d.kind === 'enum') return { value: node.dataset.val !== undefined ? node.dataset.val : node.value };
    const v = node.value;
    const why = typeof paramProblem === 'function' ? paramProblem(d, v) : (SPEC_LAB.paramProblem ? SPEC_LAB.paramProblem(d, v) : '');
    if (why) return { error: `${d.name} ${why}` };
    return { value: v };
  }

  function onParam(node) {
    const d = declFor(node);
    if (!d) return false;
    const path = node.dataset.p;
    const r = parseValue(d, node);
    const dialEl = node.closest('.stu-dial');
    if (r.error) { if (dialEl) { dialEl.classList.add('is-bad'); dialEl.title = r.error; } return true; }
    if (dialEl) { dialEl.classList.remove('is-bad'); dialEl.removeAttribute('title'); }
    if (r.skip) return true;
    if (d.kind === 'colour' && node.dataset.t === 'col') { const txt = node.parentElement.querySelector('[data-t="colour"]'); if (txt) txt.value = r.value; }
    if (d.kind === 'colour' && node.dataset.t === 'colour') { const col = node.parentElement.querySelector('[data-t="col"]'); if (col && /^#[0-9a-f]{6}$/i.test(r.value)) col.value = r.value; }
    // keep the paired range and number box in step, and the switch label
    if (d.kind === 'number') node.closest('.stu-num').querySelectorAll('input').forEach(i => { if (i !== node) i.value = r.value; });
    if (d.kind === 'bool') { const sp = node.parentElement.querySelector('span'); if (sp) sp.textContent = r.value ? 'On' : 'Off'; }
    const before = getAt(S.spec, path);
    edit(spec => setAt(spec, path, r.value), `${d.name}: ${short(before === undefined ? d.default : before)} → ${short(r.value)}`, { coalesce: 'p:' + path });
    const ds = dialEl;
    if (ds && !ds.classList.contains('is-set')) {
      // first change on a default dial: show Reset without rebuilding the control under the pointer
      ds.classList.add('is-set');
      const h = ds.querySelector('.stu-dial-h');
      if (h && !h.querySelector('[data-act="reset"]')) h.insertAdjacentHTML('beforeend', `<button type="button" class="stu-link" data-act="reset" data-path="${esc(splitSide(path).path)}" title="Back to the default">Reset</button>`);
    }
    return true;
  }

  // An edit can change other fields shown in the panels (the motto is also the specimen copy). Bring every other
  // text field up to the spec, leaving the one being typed in alone.
  function syncTextFields(except) {
    el.panels.querySelectorAll('[data-t="text"][data-p]').forEach(f => {
      if (f === except || f === document.activeElement) return;
      const v = getAt(S.spec, f.dataset.p);
      const want = typeof v === 'string' ? v : '';
      if (f.value !== want) f.value = want;
    });
  }

  function onInput(e) {
    const n = e.target;
    if (!S || !n.dataset) return;
    const t = n.dataset.t;
    if (!t || n.dataset.differ !== undefined) return;
    if (t === 'num' || t === 'colour' || t === 'ptext' || t === 'col') { onParam(n); return; }
    if (t === 'text') {
      const path = n.dataset.p;
      const before = getAt(S.spec, path);
      const val = n.value;
      edit(spec => {
        setAt(spec, path, val);
        // the motto and kicker are also printed as specimen copy
        if ((path === 'motto' || path === 'kicker') && spec.copy && spec.copy[path] && spec.copy[path].text === before) spec.copy[path].text = val;
        if (path.startsWith('labels.states.')) { const a = spec.labels.states; for (let i = 0; i < a.length; i++) if (typeof a[i] !== 'string') a[i] = ''; }
      }, `${path.replace(/^meta\.fonts\./, '').replace(/\.\d+$/, '')} edited`, { coalesce: 'p:' + path });
      syncTextFields(n);
      const f = n.closest('.stu-f');
      if (f) f.classList.toggle('is-bad', (path === 'name' || path === 'descriptor' || path === 'coreTrick') && !val.trim());
    } else if (t === 'list') {
      const arr = n.value.split(',').map(x => x.trim()).filter(Boolean);
      edit(spec => setAt(spec, n.dataset.p, arr), `${n.dataset.p.replace(/^meta\.fonts\./, '')} changed`, { coalesce: 'p:' + n.dataset.p });
    }
  }

  function onChange(e) {
    const n = e.target;
    if (!S || !n.dataset) return;
    const t = n.dataset.t;
    if (n.dataset.differ !== undefined) return toggleDiffer(n);
    if (t === 'bool') return void onParam(n);
    if (t === 'num' || t === 'colour' || t === 'ptext' || t === 'col') return;
    if (t === 'sel') {
      const path = n.dataset.p;
      if (n.dataset.name) return void onParam(n);
      const val = n.value;
      const before = getAt(S.spec, path);
      edit(spec => { if (val === '') delAt(spec, path); else setAt(spec, path, val); }, `${path.split('.').slice(-1)[0]}: ${before == null ? 'default' : before} → ${val || 'default'}`, { sections: null });
    } else if (t === 'scope') {
      const path = n.dataset.p;
      const val = n.value;
      edit(spec => { if (val === 'all') delAt(spec, path); else setAt(spec, path, val); }, `scope of ${path.split('.').slice(1, -1).join(' ')}: ${val}`);
    } else if (t === 'kitmat') setKitMaterial(n.dataset.kit, n.value);
    else if (t === 'kitstate') { if (n.value) addKitState(n.dataset.kit, n.value); }
    else if (t === 'artkind') setArtKind(n.value);
    else if (t === 'artmove') edit(spec => { spec.art.hero.move = n.value; spec.art.hero.params = {}; }, `art move: ${n.value}`, { sections: ['art', 'colour', 'moves'] });
    else if (t === 'artfile') { const f = n.files && n.files[0]; if (f) uploadArt(f); }
  }

  function toggleDiffer(n) {
    const path = n.dataset.differ;
    const d = declFor(n);
    if (!d) return;
    const cur = getAt(S.spec, path);
    const plain = isPair(cur) ? (('light' in cur) ? cur.light : cur.dark) : (cur === undefined ? d.default : cur);
    edit(spec => {
      if (n.checked) setAt(spec, path, { light: plain, dark: plain });
      else setAt(spec, path, plain);
    }, `${d.name}: ${n.checked ? 'Light and Dark now differ' : 'one value for both modes'}`, { sections: sectionOf(n) });
  }

  function onClick(e) {
    const seg = e.target.closest('button[data-seg]');
    if (seg && S) {
      const path = seg.dataset.seg;
      const val = seg.dataset.val;
      const d = seg.dataset.name ? declFor(seg) : null;
      const before = getAt(S.spec, path);
      edit(spec => setAt(spec, path, val), `${(d ? d.name : path.split('.').slice(-1)[0])}: ${before == null ? 'default' : short(before)} → ${val}`);
      seg.parentElement.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === seg)));
      return;
    }
    const head = e.target.closest('.stu-sec-h');
    if (head) {
      const id = head.parentElement.dataset.sec;
      const open = !openSecs.has(id);
      if (open) openSecs.add(id); else openSecs.delete(id);
      head.setAttribute('aria-expanded', String(open));
      head.parentElement.querySelector('.stu-sec-b').hidden = !open;
      if (open) renderSection(id);
      return;
    }
    const b = e.target.closest('button[data-act]');
    if (!b || !S) return;
    const act = b.dataset.act;
    const list = b.dataset.list, i = +b.dataset.i;
    if (act === 'add') return pickMove(list);
    if (act === 'remove') { const name = S.spec[list][i].move; return edit(spec => { spec[list].splice(i, 1); }, `removed ${name}`, { sections: ['colour', 'moves'] }); }
    if (act === 'up' || act === 'down') {
      const j = act === 'up' ? i - 1 : i + 1;
      if (j < 0 || j >= S.spec[list].length) return;
      return edit(spec => { const t = spec[list][i]; spec[list][i] = spec[list][j]; spec[list][j] = t; }, `moved ${S.spec[list][i].move} ${act}`, { sections: ['colour', 'moves'] });
    }
    if (act === 'reset') {
      const path = b.dataset.path;
      return edit(spec => delAt(spec, path), `${path.split('.').slice(-1)[0]}: back to default`, { sections: sectionOf(b) });
    }
    if (act === 'add-meta') return edit(spec => { spec.meta = { family: 'graphic', fonts: { heading: { classes: [], picks: ['Inter'] }, body: { classes: [], picks: ['Inter'] }, pairings: [['Inter', 'Inter']] } }; }, 'added family and font data', { sections: 'all' });
    if (act === 'rm-state') return removeKitState(b.dataset.kit, b.dataset.state);
    if (act === 'apply-group') return applyGroup(b.dataset.kit, b.dataset.group);
    if (act === 'rule-add') return edit(spec => { spec.rules = spec.rules || {}; (spec.rules[b.dataset.k] = spec.rules[b.dataset.k] || []).push(''); }, `added a ${b.dataset.k === 'do' ? 'do' : "don't"} rule`, { sections: 'rules' });
    if (act === 'rule-rm') return edit(spec => { spec.rules[b.dataset.k].splice(+b.dataset.i, 1); }, `removed a ${b.dataset.k === 'do' ? 'do' : "don't"} rule`, { sections: 'rules' });
    if (act === 'font-class') {
      const role = b.dataset.role, c = b.dataset.cls;
      return edit(spec => {
        spec.meta = spec.meta || {}; spec.meta.fonts = spec.meta.fonts || {};
        const f = spec.meta.fonts[role] = spec.meta.fonts[role] || { picks: [] };
        const set = new Set(f.classes || []);
        if (set.has(c)) set.delete(c); else set.add(c);
        f.classes = Array.from(set);
      }, `${role} font class ${c}`, { sections: 'type' });
    }
  }

  /* ---------------- kit edits ---------------- */
  function normaliseKit(entry) {
    if (!entry.material && (!entry.state || !entry.state.length)) return null;
    if (Array.isArray(entry.state)) { if (!entry.state.length) delete entry.state; else if (entry.state.length === 1) entry.state = entry.state[0]; }
    return entry;
  }
  function setKitMaterial(comp, mat) {
    edit(spec => {
      spec.kit = spec.kit || {};
      const e = spec.kit[comp] || {};
      const old = e.material;
      if (mat) e.material = mat; else delete e.material;
      if (e.params && old && old !== mat) delete e.params[old];
      const n = normaliseKit(e);
      if (n) spec.kit[comp] = n; else delete spec.kit[comp];
    }, `${comp}: material ${((S.spec.kit || {})[comp] || {}).material || 'none'} → ${mat || 'none'}`, { sections: 'kit' });
    openDetails.add('kit.' + comp);
  }
  function addKitState(comp, name) {
    edit(spec => {
      spec.kit = spec.kit || {};
      const e = spec.kit[comp] || {};
      e.state = [].concat(e.state || [], name);
      spec.kit[comp] = normaliseKit(e);
    }, `${comp}: added state ${name}`, { sections: 'kit' });
  }
  function removeKitState(comp, name) {
    edit(spec => {
      const e = spec.kit[comp];
      if (!e) return;
      e.state = [].concat(e.state || []).filter(x => x !== name);
      if (e.params) delete e.params[name];
      const n = normaliseKit(e);
      if (n) spec.kit[comp] = n; else delete spec.kit[comp];
    }, `${comp}: removed state ${name}`, { sections: 'kit' });
  }
  function applyGroup(comp, group) {
    const g = kitGroups().find(x => x[0] === group);
    const src = (S.spec.kit || {})[comp];
    if (!g || !src) return;
    edit(spec => { g[1].forEach(c => { if (c !== comp) spec.kit[c] = clone(src); }); }, `${group}: every component now wears ${comp}'s material and states`, { sections: 'kit' });
  }

  /* ---------------- art edits ---------------- */
  const heroFiles = art => Object.keys(art).filter(k => /^art\/hero\./i.test(k));
  function setArtKind(kind) {
    const art = Object.assign({}, S.art);
    heroFiles(art).forEach(k => delete art[k]);
    const keepAlt = ((S.spec.art || {}).hero || {}).alt || '';
    edit(spec => {
      if (kind === 'none') { delete spec.art; return; }
      spec.art = spec.art || {};
      if (kind === 'generator') spec.art.hero = { kind, move: (artMoves[0] || {}).id, params: {} };
      else spec.art.hero = { kind, src: kind === 'svg' ? 'art/hero.svg' : 'art/hero.png', fit: 'cover', alt: keepAlt };
    }, `art: ${kind === 'none' ? 'removed' : kind}`, { art, sections: ['art', 'colour', 'moves'] });
  }

  function artMsg(text) { const m = $('sdArtMsg'); if (m) m.textContent = text; }

  async function uploadArt(file) {
    const hero = (S.spec.art || {}).hero;
    if (!hero) return;
    try {
      if (hero.kind === 'svg') {
        const text = await file.text();
        if (!/<svg[\s>]/i.test(text)) return artMsg('That file is not an SVG.');
        if (text.length > 600000) return artMsg('That SVG is bigger than 600 KB.');
        const art = Object.assign({}, S.art);
        heroFiles(art).forEach(k => delete art[k]);
        art['art/hero.svg'] = text;
        edit(spec => { spec.art.hero.src = 'art/hero.svg'; }, `art: uploaded ${file.name}`, { art, sections: 'art' });
      } else {
        if (file.size > 1200000) return artMsg('That image is bigger than 1.2 MB. Use a smaller one.');
        const url = await new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(String(fr.result)); fr.onerror = () => rej(fr.error); fr.readAsDataURL(file); });
        if (!specAllowedImage(url)) return artMsg('Use a png, jpeg, webp or gif image.');
        const ext = url.startsWith('data:image/jpeg') ? 'jpg' : url.slice(11, url.indexOf(';'));
        const art = Object.assign({}, S.art);
        heroFiles(art).forEach(k => delete art[k]);
        art[`art/hero.${ext}`] = url;
        edit(spec => { spec.art.hero.src = `art/hero.${ext}`; }, `art: uploaded ${file.name}`, { art, sections: 'art' });
      }
    } catch (err) { artMsg('That file could not be read.'); }
  }

  /* ---------------- move picker ---------------- */
  function pickMove(list) {
    const previous = document.activeElement;
    const ov = document.createElement('div');
    ov.className = 'dlg-overlay';
    const pool = catalog.filter(m => list === 'colour' ? m.category === 'colour' : m.category !== 'colour');
    ov.innerHTML = `<div class="dlg stu-picker" role="dialog" aria-modal="true" aria-label="${list === 'colour' ? 'Add colour recipe' : 'Add move'}">
      <h2 class="dlg-title">${list === 'colour' ? 'Add colour recipe' : 'Add move'}</h2>
      <input type="search" class="pt-search" placeholder="Search ${pool.length} ${list === 'colour' ? 'recipes' : 'moves'}" aria-label="Search the catalog" autocomplete="off" spellcheck="false" />
      <div class="stu-picker-list" role="list"></div>
      <div class="dlg-actions"><button type="button" class="btn btn-ghost" data-close>Cancel</button></div>
    </div>`;
    document.body.appendChild(ov);
    document.body.classList.add('has-dialog');
    const box = ov.querySelector('.stu-picker-list');
    const search = ov.querySelector('input');
    const used = new Set((S.spec[list] || []).map(e => e.move));
    const ho = StudioRounds.hookOrder(S.spec, catalog);
    // A move whose hook an earlier entry already provides would be added but ignored for that hook.
    const taken = m => (m.hooks || []).filter(h => h !== 'tokens' && ho.owners[h]).map(h => `${ho.owners[h].move === 'art.hero' ? 'the hero art' : ho.owners[h].move} ${StudioRounds.hookWords(h)}`);
    const draw = () => {
      const q = search.value.trim().toLowerCase();
      const hit = pool.filter(m => !q || `${m.id} ${m.what} ${m.category}`.toLowerCase().includes(q));
      box.innerHTML = hit.length ? CATEGORIES.map(([cat, label]) => {
        const ms = hit.filter(m => m.category === cat);
        return ms.length ? `<div class="stu-cat">${label}</div>` + ms.map(m => `<button type="button" class="stu-pick" data-id="${esc(m.id)}" role="listitem"><span class="stu-pick-h"><b>${esc(m.id)}</b><span class="stu-tier">${esc(m.tier || '')}</span>${used.has(m.id) ? '<span class="stu-tier">in use</span>' : ''}${taken(m).length ? `<span class="stu-tier is-bad">replaces nothing: ${esc(taken(m).join('; '))}</span>` : ''}</span><span class="stu-pick-w">${esc(m.what)}</span></button>`).join('') : '';
      }).join('') : '<p class="stu-note">Nothing matches.</p>';
    };
    draw();
    const close = id => {
      ov.remove(); document.body.classList.remove('has-dialog');
      if (previous && previous.focus) previous.focus();
      if (id) {
        edit(spec => { spec[list].push({ move: id, params: {} }); }, `added ${id}`, { sections: ['colour', 'moves'] });
        openDetails.add(`${list}.${S.spec[list].length - 1}`);
        renderSection(list);
      }
    };
    search.addEventListener('input', draw);
    ov.addEventListener('click', e => {
      const p = e.target.closest('.stu-pick');
      if (p) close(p.dataset.id);
      else if (e.target === ov || e.target.closest('[data-close]')) close(null);
    });
    ov.addEventListener('keydown', e => {
      e.stopPropagation();
      if (e.key === 'Escape') { e.preventDefault(); close(null); }
    });
    search.focus();
  }

  /* ---------------- chrome: tabs, brand, shade ---------------- */
  function syncSeg(seg, attr, val) { seg.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset[attr] === val))); }

  async function refreshBrands() {
    try {
      const recs = await LibraryStore.list();
      brands = recs.map(r => ({ id: r.id, name: (r.name || '').trim() || 'Untitled brand', saved: r.savedState || r.draftState || null }))
        .filter(b => b.saved && b.saved.colors).sort((a, b) => a.name.localeCompare(b.name));
    } catch (e) { brands = []; }
    brandId = lsGet(BRAND_KEY) || '';
    if (brandId && !brands.some(b => b.id === brandId)) brandId = '';
    el.brand.innerHTML = '<option value="">Neutral</option>' + brands.map(b => `<option value="${esc(b.id)}">${esc(b.name)}</option>`).join('');
    el.brand.value = brandId;
  }

  /* ---------------- open / close ---------------- */
  async function open(key) {
    if (!el.root) return false;
    if (S) await close();
    if (typeof CustomAesthetics === 'undefined' || CustomAesthetics.source(key) !== 'mine') return false;
    const b = await CustomAesthetics.bundle(key);
    if (!b) return false;
    loadCatalog();
    S = { key, spec: b.aesthetic, art: b.art || {}, rounds: b.rounds || null, versions: b.versions || [], undo: [], redo: [], tab: 'board', valid: true, errors: [], goodKey: null, dirty: false };
    lastError = '';
    shade = lsGet(SHADE_KEY) === 'dark' ? 'dark' : 'light';
    await refreshBrands();
    el.section.dataset.studio = 'open';
    document.documentElement.classList.add('studio-open');
    el.root.hidden = false;
    syncSeg(el.tabs, 'tab', S.tab);
    syncSeg(el.shade, 'shade', shade);
    renderPanels();
    paintHistory();
    paintSave();
    showErrors([]);
    window.scrollTo(0, 0);
    refreshPreview();
    emit('open', { key });
    el.back.focus({ preventScroll: true });
    return true;
  }

  async function close() {
    if (!S) return;
    const key = S.key;
    clearTimeout(previewTimer); previewTimer = null;
    await flush();
    S = null;
    dropTemp();
    el.stage.innerHTML = '';
    el.panels.innerHTML = '';
    el.root.hidden = true;
    delete el.section.dataset.studio;
    document.documentElement.classList.remove('studio-open');
    emit('close', { key });
    if (typeof StylesHome !== 'undefined' && StylesHome.afterStudio) StylesHome.afterStudio(key);
  }

  function onKey(e) {
    if (!S) return;
    if (document.body.classList.contains('has-dialog')) return;
    const mod = e.metaKey || e.ctrlKey;
    if (mod && !e.altKey && (e.key === 'z' || e.key === 'Z')) { e.preventDefault(); e.stopPropagation(); if (e.shiftKey) redo(); else undo(); }
    else if (mod && !e.altKey && (e.key === 'y' || e.key === 'Y')) { e.preventDefault(); redo(); }
  }

  function wire() {
    if (!el.root) return;
    el.back.addEventListener('click', () => close());
    el.undo.addEventListener('click', undo);
    el.redo.addEventListener('click', redo);
    el.exportBtn.addEventListener('click', async () => {
      if (!S) return;
      await flush();
      const r = await CustomAesthetics.exportFile(S.key);
      if (!r.ok) lastError = r.error || 'The style could not be exported.';
      paintSave();
    });
    el.tabs.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (!b || !S) return;
      S.tab = b.dataset.tab;
      syncSeg(el.tabs, 'tab', S.tab);
      schedulePreview(0);
    });
    el.shade.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (!b || !S) return;
      shade = b.dataset.shade === 'dark' ? 'dark' : 'light';
      lsSet(SHADE_KEY, shade);
      syncSeg(el.shade, 'shade', shade);
      schedulePreview(0);
    });
    el.brand.addEventListener('change', () => {
      brandId = el.brand.value;
      if (brandId) lsSet(BRAND_KEY, brandId); else lsDel(BRAND_KEY);
      schedulePreview(0);
    });
    el.panels.addEventListener('input', onInput);
    el.panels.addEventListener('change', onChange);
    el.panels.addEventListener('click', onClick);
    el.panels.addEventListener('toggle', e => {
      const d = e.target;
      if (d.dataset && d.dataset.d) {
        if (d.open) openDetails.add(d.dataset.d); else openDetails.delete(d.dataset.d);
        const lazy = d.open && d.querySelector('[data-lazy]');
        if (lazy && S && !lazy.firstChild) lazy.innerHTML = kitDials(lazy.dataset.lazy);
      }
    }, true);
    document.addEventListener('keydown', onKey, true);
    document.addEventListener('visibilitychange', () => { if (document.hidden && S && S.dirty) { clearTimeout(saveTimer); saveTimer = null; doSave(); } });
    window.addEventListener('pagehide', () => { if (S && S.dirty) { clearTimeout(saveTimer); saveTimer = null; doSave(); } });
  }
  wire();

  const current = () => (S ? { key: S.key, spec: clone(S.spec), bundle: bundleNow() } : null);

  return { open, close, isOpen: () => !!S, current, apply, patchBundle, previewEl: () => el.stage, renderInto, on, TEMP_PREFIX: TEMP };
})();

window.Studio = Studio;
