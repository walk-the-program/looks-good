/* ---------------------------------------------------------------------
   home.js — LogosHome: the third home mode (Brands | Patterns | Logos).

   Two views share <section id="logos">: the logo library (grid, search, New logo
   dialog) and the full-screen editor shell (#logoEditor) that hosts LogoEditor (T8)
   and the chrome (T10). Documents are saved through LogoStore, 800 ms after the last
   change and when leaving. Routing: body[data-view="logos"], #logo=<id> in the URL,
   last home mode in localStorage 'bd.homeMode'.

   Chrome hook (for T10): when an editor opens, LogoChrome.mount(ctx) is called with
     ctx = { editor, doc, tokens, home: LogosHome,
             slots: { toolbar, canvas, inspector, layers, zoom, exportBtn, top } }
   and LogoChrome.unmount() (if defined) when it closes. A 'logos:open' / 'logos:close'
   CustomEvent is also dispatched on #logoEditor.
------------------------------------------------------------------------ */

const LogosHome = (function () {
  const MODE_KEY = 'bd.homeMode';
  const SAVE_DELAY = 800;
  const $ = id => document.getElementById(id);
  const esc = s => escapeHtml(String(s == null ? '' : s));
  const toast = m => { if (typeof showToast === 'function') showToast(m); };

  const ARTBOARDS = [
    { id: 'horizontal', label: 'Horizontal 1200 × 600', w: 1200, h: 600 },
    { id: 'square', label: 'Square 1000 × 1000', w: 1000, h: 1000 },
    { id: 'stacked', label: 'Stacked 800 × 1000', w: 800, h: 1000 },
    { id: 'icon', label: 'App icon 1024 × 1024', w: 1024, h: 1024 },
  ];

  const el = {
    section: $('logos'), home: $('lgHome'), count: $('lgCount'), bar: $('lgBar'), search: $('lgSearch'),
    empty: $('lgEmpty'), none: $('lgNone'), grid: $('lgGrid'),
    editor: $('logoEditor'), back: $('leBack'), name: $('leName'), brand: $('leBrand'), status: $('leStatus'),
    toolbar: $('leToolbar'), canvas: $('leCanvas'), inspector: $('leInspector'), layers: $('leLayers'),
    zoom: $('leZoom'), exportBtn: $('leExportBtn'), top: $('leTop'),
  };

  let records = [];
  let brandNames = {};
  let q = '';
  let menuEl = null;
  let current = null;       // { editor, tokens, brand, name, dirty, pushed, timer, id }
  let saveChain = Promise.resolve();
  let opening = null;

  /* ---------- small helpers ---------- */

  const readMode = () => { try { return localStorage.getItem(MODE_KEY); } catch (e) { return null; } };
  const saveMode = m => { try { localStorage.setItem(MODE_KEY, m); } catch (e) { /* not remembered */ } };
  const clone = o => JSON.parse(JSON.stringify(o));

  function newId() {
    const r = new Uint8Array(3);
    crypto.getRandomValues(r);
    const rnd = Array.from(r, x => x.toString(36)).join('').slice(0, 4).padEnd(4, '0');
    return 'lg_' + Date.now().toString(36) + rnd;
  }

  function timeAgo(ts) {
    const s = Math.max(0, (Date.now() - ts) / 1000);
    if (s < 60) return 'just now';
    const m = Math.floor(s / 60);
    if (m < 60) return `${m} ${m === 1 ? 'minute' : 'minutes'} ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} ${h === 1 ? 'hour' : 'hours'} ago`;
    const d = Math.floor(h / 24);
    if (d < 30) return `${d} ${d === 1 ? 'day' : 'days'} ago`;
    return new Date(ts).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  const svgUrl = svg => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);

  function hashId() {
    const m = /[#&]logo=([^&]+)/.exec(location.hash);
    if (!m) return null;
    try { return decodeURIComponent(m[1]); } catch (e) { return null; }
  }
  function setHash(id, push) {
    const base = location.pathname + location.search;
    const url = id ? base + '#logo=' + encodeURIComponent(id) : base;
    try { history[push ? 'pushState' : 'replaceState'](null, '', url); } catch (e) { /* ignore */ }
  }

  function setView() {
    document.body.dataset.view = 'logos';
    window.scrollTo(0, 0);
  }

  /* ---------- the library: list + grid ---------- */

  async function refresh() {
    try { records = await LogoStore.list(); } catch (e) { records = []; toast('Could not read saved logos'); }
    const skipped = LogoStore.skipped();
    if (skipped) toast(skipped === 1 ? '1 logo file couldn’t be read' : `${skipped} logo files couldn’t be read`);
    brandNames = {};
    if (records.some(r => r.brandId)) {
      try { (await LibraryStore.list()).forEach(b => { brandNames[b.id] = b.name; }); } catch (e) { /* names are optional */ }
    }
    render();
  }

  function cardHtml(rec) {
    const name = rec.name || 'Untitled logo';
    const brand = rec.brandId ? (brandNames[rec.brandId] || '') : '';
    const art = rec.preview
      ? `<img src="${svgUrl(rec.preview)}" alt="" loading="lazy" decoding="async" />`
      : '<span class="lg-blank">Empty</span>';
    return `
      <article class="tile lg-tile" tabindex="0" data-id="${esc(rec.id)}" aria-label="${esc(name)}">
        <div class="tile-art lg-art">${art}</div>
        <div class="tile-meta">
          <div class="tile-text">
            <div class="tile-title">${esc(name)}</div>
            ${brand ? `<div class="tile-sub lg-brand">${esc(brand)}</div>` : ''}
            <div class="tile-sub">Edited ${timeAgo(rec.updatedAt || rec.createdAt || Date.now())}</div>
          </div>
          <button type="button" class="tile-more" aria-label="Actions for ${esc(name)}" aria-haspopup="menu">…</button>
        </div>
      </article>`;
  }

  function render() {
    const total = records.length;
    const needle = q.trim().toLowerCase();
    const shown = needle
      ? records.filter(r => ((r.name || '') + ' ' + (brandNames[r.brandId] || '')).toLowerCase().includes(needle))
      : records;
    el.count.textContent = total
      ? (needle ? `${shown.length} of ${total} logos` : `${total} ${total === 1 ? 'logo' : 'logos'}, most recently edited first`)
      : '';
    el.empty.hidden = total > 0;
    el.bar.hidden = total === 0;
    el.none.hidden = !(total > 0 && shown.length === 0);
    el.grid.hidden = shown.length === 0;
    el.grid.innerHTML = shown.map(cardHtml).join('');
  }

  const recordFor = node => {
    const tile = node.closest('.tile[data-id]');
    return tile ? records.find(r => r.id === tile.dataset.id) : null;
  };

  /* ---------- card actions ---------- */

  async function rename(rec) {
    const name = await Dialogs.prompt({ title: 'Rename logo', label: 'Logo name', value: rec.name, confirm: 'Rename' });
    if (!name || name === rec.name) return;
    const full = (await LogoStore.get(rec.id)) || rec;
    full.name = name;
    full.updatedAt = Date.now();
    await LogoStore.put(full);
    await refresh();
  }

  async function duplicate(rec) {
    const full = (await LogoStore.get(rec.id)) || rec;
    const copy = clone(full);
    const now = Date.now();
    copy.id = newId();
    copy.name = `${full.name || 'Untitled logo'} copy`;
    copy.createdAt = now;
    copy.updatedAt = now;
    copy.attached = [];
    await LogoStore.put(copy);
    await refresh();
  }

  async function remove(rec) {
    if (!window.confirm(`Delete “${rec.name || 'Untitled logo'}”? This can’t be undone.`)) return;
    await LogoStore.remove(rec.id);
    await refresh();
  }

  function closeMenu() { if (menuEl) { menuEl.remove(); menuEl = null; } }
  function showMenu(rec, x, y, returnFocusTo) {
    closeMenu();
    menuEl = document.createElement('div');
    menuEl.className = 'tile-menu';
    menuEl.setAttribute('role', 'menu');
    menuEl.innerHTML = ['Open', 'Rename', 'Duplicate', 'Delete'].map(l =>
      `<button type="button" role="menuitem" data-act="${l.toLowerCase()}" class="${l === 'Delete' ? 'is-danger' : ''}">${l}</button>`).join('');
    document.body.appendChild(menuEl);
    const r = menuEl.getBoundingClientRect();
    menuEl.style.left = Math.max(8, Math.min(x, window.innerWidth - r.width - 8)) + 'px';
    menuEl.style.top = Math.max(8, Math.min(y, window.innerHeight - r.height - 8)) + 'px';
    const items = Array.from(menuEl.querySelectorAll('button'));
    items[0].focus();
    menuEl.addEventListener('keydown', e => {
      e.stopPropagation();
      const i = items.indexOf(document.activeElement);
      if (e.key === 'Escape') { closeMenu(); if (returnFocusTo) returnFocusTo.focus(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length].focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
    });
    menuEl.addEventListener('click', e => {
      const act = e.target.closest('button') && e.target.closest('button').dataset.act;
      if (!act) return;
      closeMenu();
      if (act === 'open') open(rec.id, { push: true });
      if (act === 'rename') rename(rec);
      if (act === 'duplicate') duplicate(rec);
      if (act === 'delete') remove(rec);
    });
  }

  /* ---------- tokens ---------- */

  async function tokensFor(brandId) {
    if (!brandId) return { tokens: LogoDoc.defaultTokens(), brand: null };
    let rec = null;
    try { rec = await LibraryStore.get(brandId); } catch (e) { /* treated as missing */ }
    if (!rec || !rec.savedState) return { tokens: LogoDoc.defaultTokens(), brand: null, missing: true };
    return { tokens: (typeof LogoAttach !== 'undefined' ? LogoAttach.tokensOf : LogoDoc.tokensFromBrandState)(rec.savedState), brand: rec };
  }

  /* ---------- new logo ---------- */

  function textSpec(name, st) {
    const t = st && st.typography;
    const weight = (t && Number(t.headingWeight)) || 600;
    return { type: 'text', name: 'Wordmark', text: name, font: { ref: 'heading', weight }, size: 160, fill: { ref: 'ink' } };
  }

  // Logo Studio's preset recipes (js/logo-studio.js presetSpecs / presetRecipe), computed from a
  // saved brand record instead of the live editor state.
  async function presetRecipes(rec) {
    const st = rec.savedState || {};
    const name = String((st.content && st.content.brandName) || rec.name || '').trim();
    const man = await LogoEngine.manifest();
    const has = fam => man.some(e => e.family.toLowerCase() === String(fam).toLowerCase());
    const weightsOf = fam => {
      const all = man.filter(e => e.family.toLowerCase() === String(fam).toLowerCase());
      const normal = all.filter(e => e.style === 'normal');
      const out = [];
      (normal.length ? normal : all).forEach(e => (Array.isArray(e.weight) ? e.weight : [e.weight]).forEach(w => { if (!out.includes(w)) out.push(w); }));
      return out.sort((a, b) => a - b);
    };
    const nearest = (fam, want) => { const ws = weightsOf(fam); return ws.length ? ws.reduce((b, w) => Math.abs(w - want) < Math.abs(b - want) ? w : b, ws[0]) : want; };
    const head = st.headingFontName, body = st.bodyFontName;
    if (!name) throw new Error('This brand has no name yet');
    if (!has(head)) throw new Error(head + ' is not in the logo font set');
    const hw = (st.typography && Number(st.typography.headingWeight)) > 0 ? Number(st.typography.headingWeight) : 400;
    const weight = nearest(head, hw);
    const f = await LogoEngine.face(head, { weight });
    const cap = f.capHeight * 1000 / f.upem;
    const words = name.split(/\s+/).filter(Boolean);
    const tail = words.slice(1).join(' ');
    const r = Math.round;
    const device = type => type === 'strip' ? { type, crop: r(cap * 0.85), height: r(cap * 0.236), gap: 0 }
      : type === 'rule' ? { type, crop: 0, height: r(cap * 0.085), gap: r(cap * 0.11) }
      : type === 'box' ? { type, crop: 0, height: r(cap * 0.1), gap: r(cap * 0.125) }
      : { type: 'none', crop: 0, height: 0, gap: 0 };
    const secondary = (extra) => (tail && has(body)) ? Object.assign({
      text: tail, textSource: 'tail', font: { family: 'body', weight: nearest(body, 500) }, size: 118, gap: 90, spread: true, align: 'left', tracking: 0,
    }, extra) : null;
    let signature = false;
    try { const def = aestheticByKey(st.aesthetic); signature = !!(def && def.signature); } catch (e) { /* no strip */ }

    const specs = [{ id: 'set', label: 'Set', recipe: { case: 'as-typed', tracking: 0, device: 'none', secondary: null } }];
    const spaced = secondary({ spread: false, tracking: 260 });
    if (spaced) specs.push({ id: 'spaced', label: 'Spaced line', recipe: { case: 'upper', tracking: 20, device: 'none', secondary: spaced } });
    specs.push(
      { id: 'rule', label: 'Rule', recipe: { case: 'upper', tracking: 40, device: 'rule', secondary: null } },
      { id: 'box', label: 'Box', recipe: { case: 'upper', tracking: 60, device: 'box', secondary: null } });
    if (signature) specs.push({ id: 'strip', label: 'Strip', recipe: { case: 'upper', tracking: -40, device: 'strip', secondary: secondary({}) } });

    return specs.map(s => {
      const rc = Object.assign({}, s.recipe);
      rc.device = device(rc.device);
      rc.wordSource = rc.secondary ? 'head' : 'name';
      rc.word = rc.secondary ? words[0] : name;
      rc.wordFont = { family: 'heading', weight, style: 'normal' };
      rc.mono = { letters: 1 };
      return { id: s.id, label: s.label, recipe: rc };
    });
  }

  async function presetThumbs(rec, tokens) {
    const specs = await presetRecipes(rec);
    return Promise.all(specs.map(async s => {
      try {
        const d = LogoDoc.create({ name: rec.name, brandId: rec.id });
        d.nodes = (await LogoDoc.fromRecipe(s.recipe)).nodes;
        const svg = await LogoRender.toSVG(d, tokens, { box: 'content', pad: 0 });
        return { id: s.id, label: s.label, recipe: s.recipe, svg };
      } catch (e) {
        return { id: s.id, label: s.label, reason: String(e && e.message || e).replace(/^LogoEngine:\s*/, '') };
      }
    }));
  }

  function newLogoDialog() {
    return new Promise(async resolve => {
      let brands = [];
      try { brands = (await LibraryStore.list()).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)); } catch (e) { /* none */ }
      const previousFocus = document.activeElement;
      const overlay = document.createElement('div');
      overlay.className = 'dlg-overlay';
      overlay.innerHTML = `
        <form class="dlg lg-dlg" role="dialog" aria-modal="true" aria-label="New logo" novalidate>
          <h2 class="dlg-title">New logo</h2>
          <div class="seg lg-seg" role="group" aria-label="Start from">
            <button type="button" data-kind="blank" aria-pressed="true">Blank</button>
            <button type="button" data-kind="brand" aria-pressed="false">From a brand</button>
            <button type="button" data-kind="preset" aria-pressed="false">From a preset</button>
          </div>
          <label class="field dlg-field"><span>Logo name</span>
            <input type="text" name="name" placeholder="e.g. Northwind mark" autocomplete="off" spellcheck="false" /></label>
          <label class="field dlg-field" data-for="brand" hidden><span>Brand</span>
            <select name="brand">${brands.map(b => `<option value="${esc(b.id)}">${esc(b.name)}</option>`).join('')}</select></label>
          <p class="dlg-message lg-nobrand" hidden>Save a brand first, then start a logo from it.</p>
          <div class="lg-presets" data-for="preset" role="radiogroup" aria-label="Preset" hidden></div>
          <label class="field dlg-field"><span>Artboard</span>
            <select name="artboard">${ARTBOARDS.map(a => `<option value="${a.id}">${a.label}</option>`).join('')}</select></label>
          <p class="dlg-error" hidden></p>
          <div class="dlg-actions">
            <button type="button" class="btn btn-ghost" data-id="cancel">Cancel</button>
            <button type="submit" class="btn btn-primary" data-id="create">Create logo</button>
          </div>
        </form>`;
      document.body.appendChild(overlay);
      document.body.classList.add('has-dialog');

      const form = overlay.querySelector('form');
      const err = overlay.querySelector('.dlg-error');
      const nameIn = form.elements.name, brandSel = form.elements.brand, boardSel = form.elements.artboard;
      const presetBox = overlay.querySelector('.lg-presets');
      const noBrand = overlay.querySelector('.lg-nobrand');
      let kind = 'blank', nameTouched = false, presets = [], pickedPreset = null, presetSeq = 0;

      const brandRec = () => brands.find(b => b.id === brandSel.value) || null;
      const showErr = m => { err.textContent = m; err.hidden = !m; };

      function close(result) {
        overlay.remove();
        document.body.classList.remove('has-dialog');
        if (previousFocus && previousFocus.focus) previousFocus.focus();
        resolve(result);
      }

      async function loadPresets() {
        const rec = brandRec();
        const my = ++presetSeq;
        pickedPreset = null; presets = [];
        if (!rec) { presetBox.innerHTML = ''; return; }
        presetBox.innerHTML = '<p class="lg-presets-note">Building previews…</p>';
        let tokens, list;
        try {
          tokens = LogoDoc.tokensFromBrandState(rec.savedState);
          list = await presetThumbs(rec, tokens);
        } catch (e) {
          if (my !== presetSeq) return;
          presetBox.innerHTML = `<p class="lg-presets-note">${esc(String(e && e.message || e).replace(/^LogoEngine:\s*/, ''))}</p>`;
          return;
        }
        if (my !== presetSeq) return;
        presets = list;
        pickedPreset = (list.find(p => p.recipe) || {}).id || null;
        presetBox.innerHTML = list.map(p => `
          <button type="button" role="radio" class="lg-preset" data-id="${esc(p.id)}" aria-checked="${p.id === pickedPreset}" ${p.recipe ? '' : 'disabled'}>
            <span class="lg-preset-art">${p.svg ? `<img alt="" src="${svgUrl(p.svg)}" />` : `<small>${esc(p.reason || 'Unavailable')}</small>`}</span>
            <span class="lg-preset-label">${esc(p.label)}</span>
          </button>`).join('');
      }

      function syncBrandName() {
        const rec = brandRec();
        if (rec && !nameTouched) nameIn.value = rec.name;
      }

      function setKind(k) {
        kind = k;
        overlay.querySelectorAll('.lg-seg button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.kind === k)));
        const needsBrand = k !== 'blank';
        overlay.querySelector('[data-for="brand"]').hidden = !needsBrand || !brands.length;
        noBrand.hidden = !(needsBrand && !brands.length);
        presetBox.hidden = k !== 'preset' || !brands.length;
        showErr('');
        if (needsBrand) syncBrandName();
        else if (!nameTouched) nameIn.value = '';
        if (k === 'preset') loadPresets();
      }

      overlay.querySelector('.lg-seg').addEventListener('click', e => {
        const b = e.target.closest('button[data-kind]');
        if (b) setKind(b.dataset.kind);
      });
      nameIn.addEventListener('input', () => { nameTouched = !!nameIn.value.trim(); showErr(''); });
      brandSel.addEventListener('change', () => { syncBrandName(); if (kind === 'preset') loadPresets(); });
      presetBox.addEventListener('click', e => {
        const b = e.target.closest('.lg-preset');
        if (!b || b.disabled) return;
        pickedPreset = b.dataset.id;
        presetBox.querySelectorAll('.lg-preset').forEach(x => x.setAttribute('aria-checked', String(x === b)));
      });

      form.addEventListener('submit', e => {
        e.preventDefault();
        const name = nameIn.value.trim();
        if (!name) { showErr('Logo name is required.'); nameIn.focus(); return; }
        const board = ARTBOARDS.find(a => a.id === boardSel.value) || ARTBOARDS[0];
        if (kind === 'blank') return close({ kind, name, board });
        const rec = brandRec();
        if (!rec) { showErr('Pick a brand.'); return; }
        if (kind === 'brand') return close({ kind, name, board, brand: rec });
        const p = presets.find(x => x.id === pickedPreset && x.recipe);
        if (!p) { showErr('Pick a preset that can be built.'); return; }
        close({ kind, name, board, brand: rec, recipe: p.recipe });
      });
      overlay.querySelector('[data-id="cancel"]').addEventListener('click', () => close(null));
      overlay.addEventListener('mousedown', e => { if (e.target === overlay) close(null); });
      overlay.addEventListener('keydown', e => {
        e.stopPropagation();
        if (e.key === 'Escape') { e.preventDefault(); close(null); }
        if (e.key === 'Tab') {
          const items = Array.from(overlay.querySelectorAll('input, select, button:not([disabled])')).filter(n => n.offsetParent !== null);
          const first = items[0], last = items[items.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      });
      nameIn.focus();
    });
  }

  async function newLogoFlow() {
    if (typeof LogoDoc === 'undefined') { toast('The logo editor is not loaded'); return; }
    const r = await newLogoDialog();
    if (!r) return;
    const doc = LogoDoc.create({ name: r.name, brandId: r.brand ? r.brand.id : null });
    doc.artboard = Object.assign({}, doc.artboard, { w: r.board.w, h: r.board.h });
    const seed = { specs: [], recipe: null };
    if (r.kind === 'brand') seed.specs.push(textSpec(r.brand.name, r.brand.savedState));
    if (r.kind === 'preset') {
      try { doc.nodes = LogoAttach.fitNodes((await LogoDoc.fromRecipe(r.recipe)).nodes, doc.artboard, 0.8); seed.recipe = true; }
      catch (e) { toast(String(e && e.message || e).replace(/^LogoEngine:\s*/, '')); return; }
    }
    doc.updatedAt = doc.createdAt = doc.createdAt || Date.now();
    await LogoStore.put(clone(doc));      // exists in the library even if the editor fails to open
    await open(doc.id, { doc, seed, push: true });
  }

  /* ---------- the editor shell ---------- */

  function setStatus(s) {
    el.status.textContent = s;
    el.status.classList.toggle('is-busy', s === 'Saving…');
    el.status.classList.toggle('is-bad', s === 'Not saved');
  }

  function paintBrandChip(c) {
    const link = !!c.brand;
    el.brand.style.cursor = link ? 'pointer' : '';
    if (link) { el.brand.setAttribute('role', 'button'); el.brand.tabIndex = 0; } else { el.brand.removeAttribute('role'); el.brand.removeAttribute('tabindex'); }
    if (c.brand) { el.brand.textContent = c.brand.name; el.brand.title = 'Colours and fonts follow this brand. Click to open the brand.'; el.brand.classList.add('is-linked'); }
    else {
      el.brand.textContent = c.brandMissing ? 'Brand removed' : 'No brand';
      el.brand.title = c.brandMissing ? 'The linked brand no longer exists; default colours and fonts are used' : 'Using default colours and fonts';
      el.brand.classList.remove('is-linked');
    }
  }

  function onChange() {
    if (!current) return;
    current.dirty = true;
    setStatus('Saving…');
    clearTimeout(current.timer);
    current.timer = setTimeout(() => { saveNow().catch(() => {}); }, SAVE_DELAY);
  }

  // Writes the open logo now. The preview and updatedAt are refreshed first.
  function saveNow() {
    const c = current;
    if (!c || !c.dirty) return saveChain;
    clearTimeout(c.timer);
    c.dirty = false;
    setStatus('Saving…');
    saveChain = saveChain.then(async () => {
      const doc = clone(c.editor.doc());
      doc.name = c.name;
      doc.brandId = c.brandId;
      doc.updatedAt = Date.now();
      // Attach / detach write the stored copy's `attached` list; the editor's own copy can be stale.
      try { const stored = await LogoStore.get(doc.id); if (stored && Array.isArray(stored.attached)) doc.attached = stored.attached; } catch (e) { /* keep ours */ }
      try { doc.preview = await LogoRender.toSVG(doc, c.tokens, { box: 'artboard' }); }
      catch (e) { console.warn('Logo preview failed:', e); }
      try {
        await LogoStore.put(doc);
        if (typeof LogoAttach !== 'undefined') LogoAttach.onSaved(doc);
        if (current === c && !c.dirty) setStatus('Saved');
      } catch (e) {
        c.dirty = true;
        if (current === c) setStatus('Not saved');
        toast('Could not save the logo');
        throw e;
      }
    });
    saveChain = saveChain.catch(() => {});
    return saveChain;
  }

  function seedEditor(ed, seed) {
    if (!seed) return;
    try {
      if (seed.specs && seed.specs.length) {
        const ids = seed.specs.map(s => ed.add(s));
        ed.select(ids);
      } else if (seed.recipe) {
        const ids = (ed.doc().nodes || []).map(n => n.id);
        if (ids.length) {
          // Centre the whole lockup on the artboard: group, align the group, ungroup.
          const g = ed.group(ids);
          ed.select([g]);
          ed.align('hcenter', 'artboard');
          ed.align('vcenter', 'artboard');
          ed.ungroup(g);
        }
        ed.select([]);
      }
    } catch (e) { console.warn('Logos: seeding the editor failed', e); }
  }

  async function open(id, opts) {
    opts = opts || {};
    if (opening) await opening.catch(() => {});
    if (current && current.id === id) return true;
    opening = openInner(id, opts);
    try { return await opening; } finally { opening = null; }
  }

  async function openInner(id, opts) {
    if (current) await closeEditor({ replace: true, skipHash: true });
    if (typeof LogoEditor === 'undefined' || typeof LogoDoc === 'undefined') {
      toast('The logo editor is not loaded');
      setHash(null); show(true); return false;
    }
    const doc = opts.doc || await LogoStore.get(id);
    if (!doc) {
      toast('That logo isn’t here any more');
      setHash(null); show(true); return false;
    }
    const { tokens, brand, missing } = await tokensFor(doc.brandId);
    saveMode('logos');
    setView();
    el.section.dataset.editor = 'open';
    el.home.hidden = true;
    el.editor.hidden = false;
    if (!opts.fromHash) setHash(id, !!opts.push);
    const c = current = {
      id, tokens, brand, brandMissing: !!missing, brandId: doc.brandId || null,
      name: doc.name || 'Untitled logo', dirty: false, timer: null, pushed: !!opts.push && !opts.fromHash, editor: null,
    };
    el.name.value = c.name;
    paintBrandChip(c);
    setStatus('Saved');
    try {
      c.editor = LogoEditor.mount(el.canvas, doc, { tokens });
    } catch (e) {
      console.error(e);
      toast('Could not open the logo editor');
      current = null;
      el.editor.hidden = true; el.home.hidden = false; delete el.section.dataset.editor;
      return false;
    }
    c.editor.on('change', onChange);
    seedEditor(c.editor, opts.seed);
    if (opts.seed) onChange();     // a new logo gets its preview and first autosave
    const ctx = {
      editor: c.editor, doc: c.editor.doc(), tokens, home: LogosHome,
      slots: { toolbar: el.toolbar, canvas: el.canvas, inspector: el.inspector, layers: el.layers, zoom: el.zoom, exportBtn: el.exportBtn, top: el.top },
    };
    try { if (typeof LogoChrome !== 'undefined' && LogoChrome.mount) LogoChrome.mount(ctx); }
    catch (e) { console.error('LogoChrome.mount failed', e); }
    el.editor.dispatchEvent(new CustomEvent('logos:open', { detail: ctx }));
    return true;
  }

  async function closeEditor(o) {
    o = o || {};
    const c = current;
    if (!c) return;
    await saveNow().catch(() => {});
    if (current !== c) return;
    try { if (typeof LogoChrome !== 'undefined' && LogoChrome.unmount) LogoChrome.unmount(); } catch (e) { /* ignore */ }
    el.editor.dispatchEvent(new CustomEvent('logos:close'));
    try { c.editor.destroy(); } catch (e) { /* ignore */ }
    el.canvas.innerHTML = '';
    current = null;
    el.editor.hidden = true;
    el.home.hidden = false;
    delete el.section.dataset.editor;
    if (!o.skipHash && hashId()) setHash(null);
    if (!o.skipRefresh) await refresh();
  }

  function backClicked() {
    const c = current;
    if (c && c.pushed && history.length > 1) { history.back(); return; }   // popstate closes it
    closeEditor();
  }

  /* ---------- views ---------- */

  async function show(quiet) {
    saveMode('logos');
    setView();
    if (current) await closeEditor({ skipRefresh: true });
    el.home.hidden = false;
    await refresh();
  }

  // Called by the Brands / Patterns switch so a leftover editor is saved and closed.
  function hide() {
    if (current) closeEditor({ skipRefresh: true });
  }

  function onHash() {
    const id = hashId();
    if (id) {
      if (!current || current.id !== id) open(id, { fromHash: true });
    } else if (current) {
      closeEditor();
    }
  }

  async function start() {
    const id = hashId();
    if (id) { await refresh(); await open(id, { fromHash: true }); }
    else if (readMode() === 'logos') await show();
  }

  /* ---------- editor chrome wiring ---------- */

  function commitName() {
    if (!current) return;
    const v = el.name.value.trim() || 'Untitled logo';
    el.name.value = v;
    if (v !== current.name) { current.name = v; onChange(); }
  }

  // Re-resolves the brand link (after Attach or a brand edit) and re-renders.
  async function refreshTokens() {
    if (!current) return null;
    const t = await tokensFor(current.brandId);
    current.tokens = t.tokens; current.brand = t.brand; current.brandMissing = !!t.missing;
    paintBrandChip(current);
    current.editor.setTokens(t.tokens);
    return t.tokens;
  }

  /* ---------- use in brand (js/logos/attach.js) ---------- */

  let attachBtn = null;
  function ensureAttachButton() {
    if (!attachBtn) {
      attachBtn = document.createElement('button');
      attachBtn.type = 'button';
      attachBtn.className = 'btn btn-ghost btn-small';
      attachBtn.id = 'leUseInBrand';
      attachBtn.textContent = 'Use in brand…';
      attachBtn.addEventListener('click', async () => {
        const c = current;
        if (!c || typeof LogoAttach === 'undefined') return;
        attachBtn.disabled = true;
        try { await LogoAttach.openPicker(c.id); } catch (e) { console.error(e); toast('Could not open the brand list'); }
        attachBtn.disabled = false;
      });
    }
    if (!attachBtn.isConnected) el.top.insertBefore(attachBtn, el.exportBtn && el.exportBtn.parentNode === el.top ? el.exportBtn : null);
  }

  // The brand chip opens the linked brand in the brand editor.
  async function openLinkedBrand() {
    const c = current;
    if (!c || !c.brand || typeof BrandSession === 'undefined') return;
    const id = c.brand.id;
    await closeEditor({ skipRefresh: true });
    saveMode('brands');
    if (!(await BrandSession.backToLibrary())) return;      // asks about unsaved edits in a brand left open
    await BrandSession.openBrand(id);
  }

  function wire() {
    $('lgNew').addEventListener('click', newLogoFlow);
    $('lgEmptyNew').addEventListener('click', newLogoFlow);
    el.search.addEventListener('input', () => { q = el.search.value; render(); });
    $('lgClear').addEventListener('click', () => { q = ''; el.search.value = ''; render(); });

    el.grid.addEventListener('click', e => {
      const rec = recordFor(e.target);
      if (!rec) return;
      const more = e.target.closest('.tile-more');
      if (more) {
        const r = more.getBoundingClientRect();
        e.stopPropagation();
        return showMenu(rec, r.left, r.bottom + 4, more);
      }
      open(rec.id, { push: true });
    });
    el.grid.addEventListener('keydown', e => {
      const tile = e.target.closest('.tile[data-id]');
      if (!tile || e.target !== tile) return;
      const rec = recordFor(tile);
      if (!rec) return;
      if (e.key === 'Enter') { e.preventDefault(); open(rec.id, { push: true }); }
      if (e.key === 'ContextMenu' || (e.key === 'F10' && e.shiftKey)) {
        const r = tile.getBoundingClientRect();
        e.preventDefault();
        showMenu(rec, r.left + 12, r.top + 12, tile);
      }
    });
    el.grid.addEventListener('contextmenu', e => {
      const rec = recordFor(e.target);
      if (!rec) return;
      e.preventDefault();
      showMenu(rec, e.clientX, e.clientY, null);
    });
    document.addEventListener('mousedown', e => { if (menuEl && !menuEl.contains(e.target)) closeMenu(); });
    window.addEventListener('blur', closeMenu);

    el.back.addEventListener('click', backClicked);
    ensureAttachButton();
    el.editor.addEventListener('logos:open', ensureAttachButton);    // the chrome may rebuild the top bar
    el.brand.addEventListener('click', openLinkedBrand);
    el.brand.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLinkedBrand(); } });
    el.name.addEventListener('input', () => { if (current) { current.name = el.name.value.trim() || current.name; onChange(); } });
    el.name.addEventListener('blur', commitName);
    el.name.addEventListener('keydown', e => {
      e.stopPropagation();    // typing a name must not reach the canvas shortcuts
      if (e.key === 'Enter') { e.preventDefault(); el.name.blur(); }
      if (e.key === 'Escape') { e.preventDefault(); el.name.value = current ? current.name : ''; el.name.blur(); }
    });

    window.addEventListener('popstate', onHash);
    window.addEventListener('hashchange', onHash);
    window.addEventListener('pagehide', () => { if (current) saveNow().catch(() => {}); });
    document.addEventListener('visibilitychange', () => { if (document.hidden && current) saveNow().catch(() => {}); });
  }

  wire();
  // Avoid a flash of the Library when a Logos launch is coming.
  if (hashId() || readMode() === 'logos') document.body.dataset.view = 'logos';

  return {
    start, show, hide, open, saveNow, refreshTokens,
    current: () => (current ? { doc: current.editor.doc(), editor: current.editor, tokens: current.tokens } : null),
  };
})();
