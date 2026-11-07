/* ---------------------------------------------------------------------
   styles-home.js — Styles mode: the fourth home (Brands | Patterns | Logos | Styles).

   Every style (the 45 built-ins plus custom ones, see js/custom-aesthetics.js) drawn as a tile with
   real brand colours, a detail view for one style, "Use on a brand", and for custom styles Import,
   Export, Duplicate, Rename, Delete and the read-only round history.

   Views: body[data-view="styles"]; the grid and the open style share #styles. The last home mode is
   remembered in localStorage 'bd.homeMode' (shared with js/patterns-home.js and js/logos/home.js).

   Boards are drawn from a throwaway state built from the chosen saved brand (the Brands home does the
   same for its tiles), never from the editor's `state`. boardHtml() reads the brand's words through
   effectiveContent(), which looks at the global state.content, so that one field is swapped for the
   synchronous draw and put straight back (a try/finally; nothing else runs in between).

   Public: window.StylesHome = { start, show, hide, isOpen }
------------------------------------------------------------------------ */

const StylesHome = (function () {
  const MODE_KEY = 'bd.homeMode';
  const BRAND_KEY = 'bd.styles.brand';
  const SHADE_KEY = 'bd.styles.shade';
  const BOARD_W = 900;

  const $ = id => document.getElementById(id);
  const esc = s => escapeHtml(String(s == null ? '' : s));
  const el = {
    section: $('styles'), gridView: $('stGridView'), detail: $('stDetail'),
    count: $('stCount'), importBtn: $('stImport'), bar: $('stBar'), search: $('stSearch'),
    source: $('stSource'), family: $('stFamily'), brand: $('stBrand'), shade: $('stShade'),
    none: $('stNone'), noneTitle: $('stNoneTitle'), noneText: $('stNoneText'), clear: $('stClear'),
    grid: $('stGrid'), status: $('stStatus'),
    back: $('stBack'), dBrand: $('stDBrand'), dShade: $('stDShade'),
    dFrame: $('stDFrame'), dBoard: $('stDBoard'), dInfo: $('stDInfo'), dActions: $('stDActions'), dRounds: $('stDRounds'),
  };

  const filters = { q: '', source: 'all', family: '' };
  let brands = [];          // [{ id, name, saved }]
  let brandId = '';
  let shade = 'light';      // preview mode: 'light' | 'dark'
  let openKey = null;
  let visible = [];
  let dirty = false;        // the library changed while another home was showing
  let io = null, queue = [], pumping = false, run = 0;
  let statusTimer = null, boardRO = null;

  const lsGet = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* not remembered */ } };
  const lsDel = k => { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } };
  const readMode = () => lsGet(MODE_KEY);
  const saveMode = m => lsSet(MODE_KEY, m);
  const active = () => document.body.dataset.view === 'styles';
  const hasCustom = () => typeof CustomAesthetics !== 'undefined';

  /* ---------- the styles ---------- */

  // 'builtin' | 'folder' | 'mine' | 'lab' (the ?movelab=1 specs, which source() reports as null)
  const srcOf = key => (hasCustom() ? CustomAesthetics.source(key) || 'lab' : 'builtin');
  const isYours = key => { const s = srcOf(key); return s === 'folder' || s === 'mine'; };
  const defOf = key => AESTHETICS.find(a => a.key === key) || null;
  const pool = () => aePool().filter(d => d && d.key);

  function familyOptions() {
    const counts = {};
    pool().forEach(d => { const f = aestheticFamilyOf(d.key); if (f) counts[f] = (counts[f] || 0) + 1; });
    return AESTHETIC_FAMILIES.filter(f => counts[f.key]).map(f => ({ key: f.key, label: f.label, n: counts[f.key] }));
  }

  function matches(d, q) {
    if (filters.source === 'builtin' && srcOf(d.key) !== 'builtin') return false;
    if (filters.source === 'yours' && !isYours(d.key)) return false;
    if (filters.family && aestheticFamilyOf(d.key) !== filters.family) return false;
    if (!q) return true;
    return `${d.name} ${d.descriptor || ''} ${d.influences || ''} ${d.summary || ''}`.toLowerCase().includes(q);
  }

  /* ---------- brand colours ---------- */

  async function refreshBrands() {
    try {
      const recs = await LibraryStore.list();
      brands = recs.map(r => ({ id: r.id, name: (r.name || '').trim() || 'Untitled brand', saved: r.savedState || r.draftState || null }))
        .filter(b => b.saved && b.saved.colors)
        .sort((a, b) => a.name.localeCompare(b.name));
    } catch (e) { brands = []; }
    if (!brandId) brandId = lsGet(BRAND_KEY) || '';
    if (brandId && !brands.some(b => b.id === brandId)) { brandId = ''; lsDel(BRAND_KEY); }
    paintBrandSelects();
  }

  function paintBrandSelects() {
    const html = '<option value="">Neutral</option>' + brands.map(b => `<option value="${esc(b.id)}">${esc(b.name)}</option>`).join('');
    [el.brand, el.dBrand].forEach(s => { s.innerHTML = html; s.value = brandId; });
  }

  // The brand every board is drawn with: a throwaway state, never the editor's.
  function baseState() {
    const st = freshState();
    st.colors = generatePalette('analogous', 210);
    const b = brands.find(x => x.id === brandId);
    if (b) {
      try { const { logoDataUrl, ...rest } = b.saved; applySavedSessionToState(rest, st); } catch (e) { /* keep the neutral */ }
    }
    return st;
  }

  // Draw one style's board HTML for the base state. Returns { html, def, st } or null.
  function drawBoard(base, key) {
    const d = defOf(key);
    if (!d) return null;
    const st = Object.assign({}, base, { aesthetic: key, aestheticVersion: 'current', blend: null, bgMode: shade, pureBg: false });
    const keep = state.content;
    try {
      state.content = st.content || {};
      const v = abView(st);
      return { html: boardHtml(v.state, v.def), def: v.def, st: v.state };
    } finally { state.content = keep; }
  }

  function loadFonts(st) {
    if (typeof window.loadFontFamily !== 'function') return Promise.resolve();
    return Promise.all([st.headingFont, st.bodyFont].filter(Boolean).map(f => { try { return window.loadFontFamily(f); } catch (e) { return null; } }));
  }

  /* ---------- grid ---------- */

  function tileHtml(d) {
    const yours = isYours(d.key), folder = srcOf(d.key) === 'folder';
    const tagShown = yours ? `<span class="st-tag" title="${folder ? 'Folder style: lives in custom-aesthetics/' + esc(d.key) + '/' : 'Your style'}">Yours</span>` : '';
    return `<button type="button" class="st-card" data-key="${esc(d.key)}" aria-label="${esc(d.name)}: ${esc(d.descriptor || '')}" title="${esc(d.summary || d.name)}">
      <span class="st-frame"><span class="st-board" inert></span></span>
      <span class="st-meta"><span class="st-num">${esc(aestheticNumber(d.key))}</span><span class="st-name">${esc(d.name)}</span>${tagShown}<span class="st-desc">${esc(d.descriptor || '')}</span></span>
    </button>`;
  }

  function renderGrid() {
    const all = pool();
    const q = filters.q.trim().toLowerCase();
    visible = all.filter(d => matches(d, q));
    const yours = all.filter(d => isYours(d.key)).length;
    const lab = all.filter(d => srcOf(d.key) === 'lab').length;
    const total = all.length;
    const parts = `${total - yours - lab} built in · ${yours} yours${lab ? ` · ${lab} lab` : ''}`;
    el.count.textContent = visible.length === total ? `${total} styles · ${parts}` : `${visible.length} of ${total} styles · ${parts}`;
    const none = visible.length === 0;
    el.none.hidden = !none;
    el.grid.hidden = none;
    if (none) {
      const onlyYours = filters.source === 'yours' && !filters.q.trim() && !filters.family;
      el.noneTitle.textContent = onlyYours ? 'No styles of your own yet' : 'No styles match';
      el.noneText.textContent = onlyYours
        ? 'No styles of your own yet. Import a style file, or add a folder to custom-aesthetics/.'
        : 'Try a different search or clear the filters.';
      el.clear.hidden = onlyYours;
    }
    el.grid.innerHTML = visible.map(tileHtml).join('');
    redraw();
  }

  function buildFamilySelect() {
    const opts = familyOptions();
    el.family.innerHTML = '<option value="">All families</option>' + opts.map(f => `<option value="${esc(f.key)}">${esc(f.label)} (${f.n})</option>`).join('');
    if (filters.family && !opts.some(f => f.key === filters.family)) filters.family = '';
    el.family.value = filters.family;
  }

  function fit() {
    const f = el.grid.querySelector('.st-frame');
    if (f && f.clientWidth) el.grid.style.setProperty('--st-zoom', (f.clientWidth / BOARD_W).toFixed(4));
  }

  function fillTile(tile, base) {
    const box = tile.querySelector('.st-board');
    if (!box) return;
    const b = drawBoard(base, tile.dataset.key);
    if (!b) return;
    box.style.setProperty('--font-heading', b.st.headingFont.css);
    box.style.setProperty('--font-body', b.st.bodyFont.css);
    const tpl = document.createElement('template');
    tpl.innerHTML = b.html;
    // Only the top of a board shows in a tile: its first two blocks.
    const inner = tpl.content.querySelector('.ab-in');
    if (inner) {
      let blocks = 0;
      Array.from(inner.children).forEach(c => {
        const chrome = c.classList.contains('ab-head') || c.classList.contains('ab-rule');
        if (blocks >= 2) c.remove(); else if (!chrome) blocks++;
      });
    }
    box.replaceChildren(tpl.content);
    if (b.def.blend && box.firstElementChild) {
      if (typeof blendClearArtText === 'function') blendClearArtText(box.firstElementChild);
      if (typeof blendLegibility === 'function') blendLegibility(box.firstElementChild);
    }
    loadFonts(b.st);
    tile.dataset.filled = '1';
    tile.classList.add('is-filled');
  }

  function pump(myRun, base) {
    if (pumping) return;
    pumping = true;
    const step = () => {
      if (myRun !== run) { pumping = false; return; }
      const t0 = performance.now();
      do {
        const t = queue.shift();
        if (!t) { pumping = false; return; }
        if (t.isConnected && !t.dataset.filled) {
          try { fillTile(t, base); } catch (e) { console.error('Styles: could not draw ' + t.dataset.key, e); t.dataset.filled = '1'; }
        }
      } while (performance.now() - t0 < 12);
      setTimeout(step, 0);
    };
    setTimeout(step, 0);
  }

  // (Re)draw every tile lazily: they fill as they come near the screen, a few per frame.
  function redraw() {
    run++;
    pumping = false; queue = [];
    if (io) io.disconnect();
    const myRun = run;
    const base = baseState();
    Array.from(el.grid.children).forEach(t => { delete t.dataset.filled; t.classList.remove('is-filled'); });
    fit();
    if (!('IntersectionObserver' in window)) { queue = Array.from(el.grid.children); pump(myRun, base); return; }
    io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting && !en.target.dataset.filled) { queue.push(en.target); io.unobserve(en.target); }
      });
      queue.sort((a, b) => a.offsetTop - b.offsetTop || a.offsetLeft - b.offsetLeft);
      pump(myRun, base);
    }, { rootMargin: '300px 0px' });
    Array.from(el.grid.children).forEach(t => io.observe(t));
  }

  function syncSeg(seg, attr, val) {
    seg.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset[attr] === val)));
  }

  function clearFilters() {
    filters.q = ''; filters.source = 'all'; filters.family = '';
    el.search.value = ''; el.family.value = '';
    syncSeg(el.source, 'source', 'all');
    renderGrid();
  }

  /* ---------- messages and dialogs ---------- */

  function say(text) {
    el.status.textContent = text;
    el.status.hidden = !text;
    clearTimeout(statusTimer);
    if (text) statusTimer = setTimeout(() => { el.status.hidden = true; el.status.textContent = ''; }, 5000);
  }

  const tell = (title, message) => Dialogs.choose({ title, message, buttons: [{ id: 'ok', label: 'OK', primary: true, cancel: true }] });

  /* ---------- import ---------- */

  async function onClash(key) {
    const name = ((hasCustom() && CustomAesthetics.list().find(x => x.key === key)) || {}).name || key;
    const buttons = [];
    if (srcOf(key) === 'mine') buttons.push({ id: 'replace', label: 'Replace', primary: true });
    buttons.push({ id: 'copy', label: 'Keep both', primary: srcOf(key) !== 'mine' }, { id: 'cancel', label: 'Cancel', cancel: true });
    const id = await Dialogs.choose({ title: 'Style already here', message: `A style called ${name} is already here.`, buttons });
    return id === 'replace' || id === 'copy' ? id : 'cancel';
  }

  async function importFile(file) {
    let text;
    try { text = await file.text(); } catch (e) { return tell('Could not read the file', 'That file could not be read.'); }
    const r = await CustomAesthetics.importText(text, { onClash });
    if (r.cancelled) return;
    if (!r.ok) return tell('Could not import this style', r.error || 'The file is not a Looks Good style.');
    say('Imported.');
    if (r.key && defOf(r.key)) { filters.q = ''; el.search.value = ''; openStyle(r.key); }
  }

  function pickFile() {
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = '.json,application/json';
    inp.addEventListener('change', () => { const f = inp.files && inp.files[0]; if (f) importFile(f); });
    inp.click();
  }

  /* ---------- detail ---------- */

  function chip(cls, text) { return `<span class="st-chip st-chip-${cls}">${esc(text)}</span>`; }

  function roundsHtml(key) {
    const data = hasCustom() ? CustomAesthetics.rounds(key) : null;
    const rs = data && Array.isArray(data.rounds) ? data.rounds : [];
    if (!rs.length) return '';
    const noteCount = rs.reduce((n, r) => n + (Array.isArray(r.notes) ? r.notes.length : 0), 0);
    const list = a => (Array.isArray(a) ? a : []);
    return `<h3 class="st-h">Rounds <i>${rs.length} ${rs.length === 1 ? 'round' : 'rounds'}${noteCount ? ' · ' + noteCount + ' ' + (noteCount === 1 ? 'note' : 'notes') : ''}</i></h3>
      <ol class="st-rounds">${rs.map(r => {
        const notes = list(r.notes).slice().sort((a, b) => (a && a.status === 'open' ? 0 : 1) - (b && b.status === 'open' ? 0 : 1));
        return `<li class="st-round">
          <div class="st-round-head"><strong>Round ${esc(r.n)}</strong><span>${esc([r.date, r.by].filter(Boolean).join(' · '))}</span></div>
          ${r.summary ? `<p class="st-round-sum">${esc(r.summary)}</p>` : ''}
          ${list(r.changes).length ? `<ul class="st-changes">${list(r.changes).map(c => `<li>${esc(c)}</li>`).join('')}</ul>` : ''}
          ${list(r.variants).length ? `<div class="st-sub">Variants</div><ul class="st-vars">${list(r.variants).map(v => `<li>${chip(String(v && v.verdict || 'open').toLowerCase().replace(/[^a-z]/g, ''), v && v.verdict || 'open')}<span>${esc(v && v.change)}</span></li>`).join('')}</ul>` : ''}
          ${notes.length ? `<div class="st-sub">Notes</div><ul class="st-notes">${notes.map(n => {
            const open = n && n.status === 'open';
            const done = n && n.doneIn != null ? ` (round ${n.doneIn})` : '';
            return `<li>${chip(open ? 'open' : 'done', (n && n.status || 'open') + (open ? '' : done))}<span class="st-note-target">${esc(n && n.target)}</span><span>${esc(n && n.text)}</span></li>`;
          }).join('')}</ul>` : ''}
        </li>`;
      }).join('')}</ol>`;
  }

  function fitDetail() {
    const w = el.dFrame.clientWidth;
    const b = el.dBoard.firstElementChild;
    if (!w || !b) return;
    const z = Math.min(1, w / BOARD_W);
    el.dBoard.style.setProperty('--st-dzoom', z.toFixed(4));
    el.dFrame.style.height = Math.ceil(b.offsetHeight * z) + 'px';
  }

  function paintDetail() {
    const d = defOf(openKey);
    if (!d) return showGrid();
    const base = baseState();
    const b = drawBoard(base, openKey);
    if (b) {
      el.dBoard.style.setProperty('--font-heading', b.st.headingFont.css);
      el.dBoard.style.setProperty('--font-body', b.st.bodyFont.css);
      el.dBoard.innerHTML = b.html;
      if (b.def.blend && el.dBoard.firstElementChild) {
        if (typeof blendClearArtText === 'function') blendClearArtText(el.dBoard.firstElementChild);
        if (typeof blendLegibility === 'function') blendLegibility(el.dBoard.firstElementChild);
      }
      fitDetail();
      loadFonts(b.st).then(fitDetail);
      if (boardRO) boardRO.disconnect();
      if ('ResizeObserver' in window && el.dBoard.firstElementChild) { boardRO = new ResizeObserver(fitDetail); boardRO.observe(el.dBoard.firstElementChild); boardRO.observe(el.dFrame); }
    }
    const src = srcOf(openKey);
    const fam = aestheticFamilyLabel(aestheticFamilyOf(openKey));
    const row = (k, v) => (v ? `<div class="st-row"><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>` : '');
    el.dInfo.innerHTML = `
      <div class="st-d-num">${esc(aestheticNumber(openKey))}${isYours(openKey) ? '<span class="st-tag">Yours</span>' : src === 'lab' ? '<span class="st-tag">Lab</span>' : ''}</div>
      <h2 class="st-d-name">${esc(d.name)}</h2>
      <p class="st-d-desc">${esc(d.descriptor || '')}</p>
      ${d.summary ? `<p class="st-d-sum">${esc(d.summary)}</p>` : ''}
      <dl class="st-dl">
        ${row('Core trick', d.coreTrick)}
        ${row('Influences', d.influences)}
        ${row('Family', fam)}
        ${row('Looks best', d.mode === 'dark' ? 'Dark' : d.mode === 'light' ? 'Light' : '')}
      </dl>`;
    const yours = isYours(openKey);
    el.dActions.innerHTML = `
      <button type="button" class="btn btn-primary" data-act="use">Use on a brand</button>
      ${yours ? `<button type="button" class="btn btn-ghost" data-act="export">Export</button>
      <button type="button" class="btn btn-ghost" data-act="duplicate">Duplicate</button>` : ''}
      ${src === 'mine' ? `<button type="button" class="btn btn-ghost" data-act="rename">Rename</button>
      <button type="button" class="btn btn-ghost st-danger" data-act="delete">Delete</button>` : ''}
      ${src === 'folder' ? `<p class="st-folder-note">Lives in custom-aesthetics/${esc(openKey)}/</p>` : ''}`;
    el.dRounds.innerHTML = yours ? roundsHtml(openKey) : '';
  }

  function openStyle(key) {
    if (!defOf(key)) return;
    openKey = key;
    el.section.dataset.detail = 'open';
    el.gridView.hidden = true;
    el.detail.hidden = false;
    window.scrollTo(0, 0);
    paintDetail();
    el.back.focus({ preventScroll: true });
  }

  function showGrid() {
    const was = openKey;
    openKey = null;
    delete el.section.dataset.detail;
    el.detail.hidden = true;
    el.gridView.hidden = false;
    if (boardRO) boardRO.disconnect();
    el.dBoard.innerHTML = '';
    if (was) {
      const card = Array.from(el.grid.children).find(c => c.dataset.key === was);
      if (card) card.focus({ preventScroll: false });
    }
  }

  /* ---------- actions ---------- */

  function pickBrand(key) {
    return new Promise(resolve => {
      const previous = document.activeElement;
      const ov = document.createElement('div');
      ov.className = 'dlg-overlay';
      ov.innerHTML = `<div class="dlg st-pick" role="dialog" aria-modal="true" aria-label="Use on a brand">
        <h2 class="dlg-title">Use on a brand</h2>
        <p class="dlg-message">${esc(defOf(key).name)} is applied to the brand you choose. Nothing is saved until you save the brand.</p>
        <div class="st-pick-list">${brands.map(b => `<button type="button" class="btn btn-ghost" data-id="${esc(b.id)}">${esc(b.name)}</button>`).join('') || '<p class="st-pick-none">No saved brands yet.</p>'}</div>
        <div class="dlg-actions"><button type="button" class="btn btn-primary" data-id="__new__">New brand</button><button type="button" class="btn btn-ghost" data-id="__cancel__">Cancel</button></div>
      </div>`;
      document.body.appendChild(ov);
      document.body.classList.add('has-dialog');
      const close = v => { ov.remove(); document.body.classList.remove('has-dialog'); if (previous && previous.focus) previous.focus(); resolve(v); };
      ov.addEventListener('click', e => {
        const b = e.target.closest('button[data-id]');
        if (b) close(b.dataset.id === '__cancel__' ? null : b.dataset.id);
        else if (e.target === ov) close(null);
      });
      ov.addEventListener('keydown', e => {
        e.stopPropagation();
        if (e.key === 'Escape') { e.preventDefault(); close(null); }
        if (e.key === 'Tab') {
          const items = Array.from(ov.querySelectorAll('button'));
          const first = items[0], last = items[items.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      });
      (ov.querySelector('.st-pick-list button') || ov.querySelector('.btn-primary')).focus();
    });
  }

  async function useOnBrand() {
    const key = openKey;
    if (!key || !defOf(key)) return;
    const choice = await pickBrand(key);
    if (!choice) return;
    if (choice === '__new__') {
      await LibraryUI.newBrandFlow();
      // The dialog closes before the brand exists: wait (bounded) for the editor to open it, then apply.
      for (let i = 0; i < 40 && active(); i++) await new Promise(r => setTimeout(r, 200));
      if (document.body.dataset.view === 'editor') chooseAesthetic(key);
      return;
    }
    await BrandSession.openBrand(choice);
    if (document.body.dataset.view === 'editor') chooseAesthetic(key);
  }

  async function act(name) {
    const key = openKey;
    if (!key) return;
    const d = defOf(key);
    if (name === 'use') return useOnBrand();
    if (name === 'export') {
      const r = await CustomAesthetics.exportFile(key);
      if (r.cancelled) return;
      return r.ok ? say(`Saved ${r.filename}.`) : tell('Could not export', r.error || 'The style could not be saved.');
    }
    if (name === 'duplicate') {
      const nm = await Dialogs.prompt({ title: 'Duplicate style', label: 'Name', value: `${d.name} copy`, confirm: 'Duplicate' });
      if (!nm) return;
      const r = await CustomAesthetics.duplicate(key, { name: nm });
      if (!r.ok) return tell('Could not duplicate', r.error || 'The style could not be copied.');
      say('Duplicated.');
      if (r.key && defOf(r.key)) openStyle(r.key);
      return;
    }
    if (name === 'rename') {
      const nm = await Dialogs.prompt({ title: 'Rename style', label: 'Name', value: d.name, confirm: 'Rename' });
      if (!nm || nm === d.name) return;
      const r = await CustomAesthetics.rename(key, nm);
      if (!r.ok) return tell('Could not rename', r.error || 'The style could not be renamed.');
      return;
    }
    if (name === 'delete') {
      if (!window.confirm(`Delete ${d.name}? Brands using it switch to Soft Form. This can't be undone.`)) return;
      const r = await CustomAesthetics.remove(key);
      if (!r.ok) return tell('Could not delete', r.error || 'The style could not be deleted.');
    }
  }

  /* ---------- keeping in step ---------- */

  async function rebuild() {
    buildFamilySelect();
    renderGrid();
    if (openKey) { if (defOf(openKey)) paintDetail(); else showGrid(); }
  }

  function onLibraryChange() {
    if (!active()) { dirty = true; return; }
    rebuild();
  }

  function setShade(v) {
    shade = v === 'dark' ? 'dark' : 'light';
    lsSet(SHADE_KEY, shade);
    syncSeg(el.shade, 'shade', shade);
    syncSeg(el.dShade, 'shade', shade);
    if (openKey) paintDetail(); else redraw();
  }

  function setBrand(id) {
    brandId = id || '';
    if (brandId) lsSet(BRAND_KEY, brandId); else lsDel(BRAND_KEY);
    paintBrandSelects();
    if (openKey) paintDetail(); else redraw();
  }

  /* ---------- views ---------- */

  async function show() {
    saveMode('styles');
    document.body.dataset.view = 'styles';
    window.scrollTo(0, 0);
    await refreshBrands();
    buildFamilySelect();
    syncSeg(el.shade, 'shade', shade);
    syncSeg(el.dShade, 'shade', shade);
    dirty = false;
    renderGrid();
    if (openKey) { if (defOf(openKey)) paintDetail(); else showGrid(); }
  }

  function hide() { /* the next home sets data-view itself */ }

  async function start() {
    if (readMode() === 'styles') await show();
  }

  function onKey(e) {
    if (!active() || e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
    if (document.body.classList.contains('has-dialog')) return;
    const t = e.target;
    const typing = t && (t.isContentEditable || /^(input|textarea|select)$/i.test(t.tagName));
    if (openKey) {
      if (e.key === 'Escape' && !typing) { e.preventDefault(); showGrid(); }
      return;
    }
    if (e.key === '/' && !typing) { e.preventDefault(); el.search.focus(); el.search.select(); return; }
    if (e.key === 'Escape' && t === el.search && el.search.value) { el.search.value = ''; filters.q = ''; renderGrid(); return; }
    const card = t && t.closest && t.closest('.st-card');
    if (!card || !/^Arrow/.test(e.key)) return;
    const cards = Array.from(el.grid.children);
    const i = cards.indexOf(card);
    let cols = 1;
    while (cols < cards.length && cards[cols].offsetTop === cards[0].offsetTop) cols++;
    const next = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'ArrowDown' ? i + cols : i - cols;
    if (next >= 0 && next < cards.length) { e.preventDefault(); cards[next].focus(); }
  }

  function wire() {
    el.importBtn.addEventListener('click', pickFile);
    el.search.addEventListener('input', () => { filters.q = el.search.value; renderGrid(); });
    el.source.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (!b) return;
      filters.source = b.dataset.source;
      syncSeg(el.source, 'source', filters.source);
      renderGrid();
    });
    el.family.addEventListener('change', () => { filters.family = el.family.value; renderGrid(); });
    [el.brand, el.dBrand].forEach(s => s.addEventListener('change', () => setBrand(s.value)));
    [el.shade, el.dShade].forEach(seg => seg.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (b) setShade(b.dataset.shade);
    }));
    el.clear.addEventListener('click', clearFilters);
    el.grid.addEventListener('click', e => {
      const card = e.target.closest('.st-card');
      if (card) openStyle(card.dataset.key);
    });
    el.back.addEventListener('click', showGrid);
    el.dActions.addEventListener('click', e => {
      const b = e.target.closest('button[data-act]');
      if (b) act(b.dataset.act);
    });
    document.addEventListener('keydown', onKey);
    if ('ResizeObserver' in window) new ResizeObserver(() => { if (active() && !openKey) fit(); }).observe(el.grid);
    window.addEventListener('resize', () => { if (active() && openKey) fitDetail(); });
    if (hasCustom()) CustomAesthetics.onChange(onLibraryChange);
  }

  if (!el.section) return { start() {}, show() {}, hide() {}, isOpen: () => false };
  shade = lsGet(SHADE_KEY) === 'dark' ? 'dark' : 'light';
  wire();
  // Avoid a flash of the Library when a Styles launch is coming.
  if (readMode() === 'styles') document.body.dataset.view = 'styles';

  return { start, show, hide, isOpen: active };
})();
