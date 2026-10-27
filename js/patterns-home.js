/* ---------------------------------------------------------------------
   patterns-home.js — Patterns mode: the Brands | Patterns switch, the
   pattern grid, and the tool view (an iframe of a page under ptrn/, the
   private Ptrn mirror that dev/sync-ptrn.py builds).

   Views: body[data-view="patterns"]. The grid and the open tool live in the
   same section; the open tool is remembered in the URL hash (#pattern=slug)
   and the last home mode in localStorage, so a launch lands where you left.
------------------------------------------------------------------------ */

const PatternsHome = (function () {
  const MODE_KEY = 'bd.homeMode';
  const CATALOG_URL = 'ptrn/catalog.json';
  const THEME_CSS = ['/fonts/fonts.css', '/css/ptrn-theme.css'];
  const HOME_PATHS = ['/ptrn/', '/ptrn/index.html'];

  const $ = id => document.getElementById(id);
  const el = {
    section: $('patterns'), count: $('ptCount'), bar: $('ptBar'), search: $('ptSearch'),
    source: $('ptSource'), cat: $('ptCat'), surprise: $('ptSurprise'), grid: $('ptGrid'),
    missing: $('ptMissing'), none: $('ptNone'), clear: $('ptClear'),
    tool: $('ptTool'), frame: $('ptFrame'), name: $('ptToolName'), toolCat: $('ptToolCat'),
    brand: $('ptBrand'), toolBrand: $('ptToolBrand'),
    back: $('ptBack'), prev: $('ptPrev'), next: $('ptNext'),
  };

  let catalog = null;          // null = not loaded, [] = failed or empty
  let loading = null;
  let visible = [];            // the filtered list, in grid order
  let openSlug = null;
  const filters = { q: '', source: 'all', cat: '' };

  /* ---------- storage + hash ---------- */

  const readMode = () => { try { return localStorage.getItem(MODE_KEY); } catch (e) { return null; } };
  const saveMode = m => { try { localStorage.setItem(MODE_KEY, m); } catch (e) { /* private mode: not remembered */ } };

  function hashSlug() {
    const m = /[#&]pattern=([^&]+)/.exec(location.hash);
    if (!m) return null;
    try { return decodeURIComponent(m[1]); } catch (e) { return null; }
  }
  function setHash(slug) {
    const base = location.pathname + location.search;
    try { history.replaceState(null, '', slug ? base + '#pattern=' + encodeURIComponent(slug) : base); } catch (e) { /* ignore */ }
  }

  /* ---------- brand colours ----------
     The tools keep one "My colors" set in localStorage ("ptrn.mycolors"), read when a
     tool loads. Choosing a brand writes that brand's colours there (switched on); the
     user's own set is parked under BACKUP_KEY first and put back on "No brand". */

  const BRAND_KEY = 'bd.ptrn.brand';
  const BACKUP_KEY = 'bd.ptrn.mycolors.backup';
  const MYC_KEY = 'ptrn.mycolors';
  const NONE = '__none__';
  const ROLE_ORDER = ['primary', 'accent', 'secondary', 'neutralDark', 'neutralLight'];
  let brands = [];             // [{ id, name, cols }]
  let brandId = '';

  const lsGet = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } };
  const lsDel = k => { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } };

  function brandCols(rec) {
    const c = (rec.savedState && rec.savedState.colors) || (rec.draftState && rec.draftState.colors) || {};
    const out = [];
    ROLE_ORDER.forEach(k => {
      const h = typeof c[k] === 'string' && /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.test(c[k].trim()) ? c[k].trim().toLowerCase() : null;
      if (!h) return;
      const full = h.startsWith('#') ? h : '#' + h;
      if (!out.includes(full)) out.push(full);
    });
    return out;
  }

  // Put the chosen brand's colours where the tools read them, or put the user's own set back.
  function writeColours() {
    const b = brands.find(x => x.id === brandId);
    if (b && b.cols.length) {
      if (lsGet(BACKUP_KEY) === null) lsSet(BACKUP_KEY, lsGet(MYC_KEY) === null ? NONE : lsGet(MYC_KEY));
      lsSet(MYC_KEY, JSON.stringify({ v: 1, cols: b.cols, on: true }));
    } else {
      const bk = lsGet(BACKUP_KEY);
      if (bk !== null) {
        if (bk === NONE) lsDel(MYC_KEY); else lsSet(MYC_KEY, bk);
        lsDel(BACKUP_KEY);
      }
    }
  }

  function renderBrandSelects() {
    const html = '<option value="">No brand</option>' +
      brands.map(b => `<option value="${escapeHtml(b.id)}">${escapeHtml(b.name)}</option>`).join('');
    [el.brand, el.toolBrand].forEach(s => { s.innerHTML = html; s.value = brandId; });
  }

  async function refreshBrands() {
    try {
      const recs = await LibraryStore.list();
      brands = recs.map(r => ({ id: r.id, name: (r.name || '').trim() || 'Untitled brand', cols: brandCols(r) }))
        .filter(b => b.cols.length)
        .sort((a, b) => a.name.localeCompare(b.name));
    } catch (e) { brands = []; }
    if (!brandId) brandId = lsGet(BRAND_KEY) || '';
    if (brandId && !brands.some(b => b.id === brandId)) { brandId = ''; lsDel(BRAND_KEY); }
    writeColours();
    renderBrandSelects();
  }

  function chooseBrand(id) {
    brandId = id || '';
    if (brandId) lsSet(BRAND_KEY, brandId); else lsDel(BRAND_KEY);
    writeColours();
    renderBrandSelects();
    if (openSlug === null && catalog) { restoreArt(); applyThumbs(true); } else { thumbRun++; thumbQueue = []; }
    if (openSlug !== null) {      // a tool reads the set when it loads: reload it
      const t = bySlug(openSlug);
      if (t) { el.frame.classList.remove('is-ready'); el.frame.src = 'about:blank'; el.frame.src = t.href; setTimeout(() => el.frame.classList.add('is-ready'), 1500); }
    }
  }

  // The tool's own "+" button adds an ink; answer its colour picker with the next brand colour
  // so the swatch row can hold the whole brand, then let the tool's My colors listener refit.
  function growSwatches(win, doc) {
    const b = brands.find(x => x.id === brandId);
    if (!b) return;
    const host = doc.getElementById('swatches');
    if (!host) return;
    if (!host.querySelector('.sw-add')) return;
    const have = () => host.querySelectorAll('.sw').length;
    const origPick = win.__pickColour;
    win.__pickColour = (anchor, commit) => commit(b.cols[Math.min(have(), b.cols.length - 1)]);
    try {
      // the row is rebuilt on every add, so find the button again each time
      for (let n = 0; n < 12 && have() < b.cols.length; n++) {
        const btn = host.querySelector('.sw-add');
        const before = have();
        if (!btn) break;
        btn.click();
        if (have() === before) break;
      }
    } finally { win.__pickColour = origPick; }
    try { win.dispatchEvent(new win.StorageEvent('storage', { key: MYC_KEY })); } catch (e) { /* tool refits on its next change */ }
  }

  /* ---------- brand thumbnails ----------
     With a brand chosen, every card re-renders its tool in the brand colours: a hidden,
     off-screen iframe loads the tool (which reads ptrn.mycolors), we wait for it to draw,
     then snapshot its biggest canvas or svg into a small image. At most THUMB_JOBS run at
     once. Snapshots are cached per brand colour set + tool. Failures keep the static art. */

  const THUMB_JOBS = 3, THUMB_TIMEOUT = 7000, THUMB_W = 480;
  const thumbCache = new Map();   // sig|slug -> data URL
  const thumbFailed = new Set();  // sig|slug
  let thumbRun = 0;               // bumps whenever the brand changes: stale work stops
  let thumbQueue = [];
  let thumbActive = 0;
  const thumbStats = { done: 0, failed: [], total: 0 };

  function brandSig() {
    const b = brands.find(x => x.id === brandId);
    return b && b.cols.length ? b.cols.join(',') : '';
  }
  const thumbKey = slug => brandSig() + '|' + slug;

  function cardFor(slug) {
    return Array.prototype.find.call(el.grid.children, c => c.dataset.slug === slug) || null;
  }

  function paintCard(slug, url) {
    const card = cardFor(slug);
    if (!card) return;
    const img = card.querySelector('img');
    card.classList.remove('is-pending');
    if (!img || !url) return;
    if (!img.dataset.art) img.dataset.art = img.getAttribute('src');
    img.classList.add('is-swap');
    img.src = url;
    requestAnimationFrame(() => img.classList.remove('is-swap'));
  }

  function restoreArt() {
    Array.prototype.forEach.call(el.grid.children, card => {
      card.classList.remove('is-pending');
      const img = card.querySelector('img');
      if (img && img.dataset.art) { img.src = img.dataset.art; delete img.dataset.art; }
    });
  }

  function snapshot(win, doc) {
    const area = n => { const r = n.getBoundingClientRect(); return r.width * r.height; };
    const cvs = Array.prototype.filter.call(doc.querySelectorAll('canvas'), c => c.width > 16 && c.height > 16 && area(c) > 1000)
      .sort((a, b) => area(b) - area(a));
    const svgs = Array.prototype.filter.call(doc.querySelectorAll('svg'), n => area(n) > 20000)
      .sort((a, b) => area(b) - area(a));
    const out = document.createElement('canvas');
    const fit = (w, h) => { const k = Math.min(1, THUMB_W / w); out.width = Math.round(w * k); out.height = Math.round(h * k); return out.getContext('2d'); };
    for (const c of cvs) {
      try {
        const g = fit(c.width, c.height);
        g.fillStyle = '#fff'; g.fillRect(0, 0, out.width, out.height);
        g.drawImage(c, 0, 0, out.width, out.height);
        const px = g.getImageData(0, 0, Math.min(out.width, 64), Math.min(out.height, 64)).data;   // throws if tainted
        let blank = true;
        for (let i = 0; i < px.length; i += 4) if (px[i] !== 255 || px[i + 1] !== 255 || px[i + 2] !== 255) { blank = false; break; }
        if (!blank) return out.toDataURL('image/jpeg', 0.85);
      } catch (e) { /* tainted or empty: try the next one */ }
    }
    if (svgs.length) {
      const s = svgs[0], r = s.getBoundingClientRect();
      const clone = s.cloneNode(true);
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      clone.setAttribute('width', r.width); clone.setAttribute('height', r.height);
      return { svg: new win.XMLSerializer().serializeToString(clone), w: r.width, h: r.height };
    }
    return null;
  }

  function svgToJpeg(snap) {
    return new Promise(resolve => {
      const im = new Image();
      im.onload = () => {
        try {
          const k = Math.min(1, THUMB_W / snap.w), c = document.createElement('canvas');
          c.width = Math.round(snap.w * k); c.height = Math.round(snap.h * k);
          const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
          g.drawImage(im, 0, 0, c.width, c.height);
          resolve(c.toDataURL('image/jpeg', 0.85));
        } catch (e) { resolve(null); }
      };
      im.onerror = () => resolve(null);
      im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(snap.svg);
    });
  }

  // Load one tool off-screen and resolve with a data URL (or null).
  function captureTool(t, run) {
    return new Promise(resolve => {
      const f = document.createElement('iframe');
      f.className = 'pt-thumb-frame';
      f.setAttribute('aria-hidden', 'true');
      f.setAttribute('inert', '');
      f.tabIndex = -1;
      f.setAttribute('allow', '');
      let done = false, timer = null;
      const finish = url => {
        if (done) return;
        done = true; clearTimeout(timer);
        f.src = 'about:blank';
        f.remove();
        resolve(url || null);
      };
      timer = setTimeout(() => finish(null), THUMB_TIMEOUT);
      f.addEventListener('load', () => {
        let win, doc;
        try { win = f.contentWindow; doc = win.document; } catch (e) { return finish(null); }
        if (!doc || doc.location.href === 'about:blank') return;
        try { growSwatches(win, doc); } catch (e) { /* keep going with what the tool drew */ }
        let tries = 0;
        const poll = () => {
          if (done) return;
          if (run !== thumbRun) return finish(null);
          let snap = null;
          try { snap = snapshot(win, doc); } catch (e) { /* retry */ }
          if (snap && ++tries >= 1) {
            // settle briefly so the redraw after the colour change lands, then take it again
            setTimeout(async () => {
              if (done) return;
              let again = null;
              try { again = snapshot(win, doc) || snap; } catch (e) { again = snap; }
              if (again && again.svg) again = await svgToJpeg(again);
              finish(again);
            }, 700);
            return;
          }
          setTimeout(poll, 250);
        };
        setTimeout(poll, 400);
      });
      document.body.appendChild(f);
      f.src = t.href;
    });
  }

  function pumpThumbs() {
    while (thumbActive < THUMB_JOBS && thumbQueue.length) {
      const run = thumbRun, sig = brandSig(), t = thumbQueue.shift(), key = sig + '|' + t.slug;
      if (!sig) return;
      if (thumbCache.has(key) || thumbFailed.has(key)) continue;
      thumbActive++;
      captureTool(t, run).then(url => {
        thumbActive--;
        if (run === thumbRun) {
          if (url) { thumbCache.set(key, url); thumbStats.done++; paintCard(t.slug, url); }
          else { thumbFailed.add(key); thumbStats.failed.push(t.slug); paintCard(t.slug, null); }
          if (el.section) el.section.dataset.thumbs = thumbStats.done + '/' + thumbStats.total;
        }
        pumpThumbs();
      });
    }
  }

  // Bring the grid in line with the chosen brand: cached thumbs now, the rest rendered in the background.
  function applyThumbs(restart) {
    if (restart) { thumbRun++; thumbQueue = []; }
    const sig = brandSig();
    if (!sig) { restoreArt(); return; }
    if (!catalog || !visible.length) return;
    const todo = [];
    visible.forEach(t => {
      const key = sig + '|' + t.slug;
      if (thumbCache.has(key)) paintCard(t.slug, thumbCache.get(key));
      else if (!thumbFailed.has(key)) { const c = cardFor(t.slug); if (c) c.classList.add('is-pending'); todo.push(t); }
    });
    // visible cards first (by grid position), then everything else in the catalog
    const queued = new Set(thumbQueue.map(t => t.slug));
    todo.forEach(t => { if (!queued.has(t.slug)) thumbQueue.push(t); });
    if (restart) {
      thumbStats.done = 0; thumbStats.failed = []; thumbStats.total = catalog.length;
      thumbStats.done = catalog.filter(t => thumbCache.has(sig + '|' + t.slug)).length;
      catalog.forEach(t => { const k = sig + '|' + t.slug; if (!thumbCache.has(k) && !thumbFailed.has(k) && !queued.has(t.slug) && !todo.includes(t)) thumbQueue.push(t); });
    }
    pumpThumbs();
  }

  /* ---------- catalog ---------- */

  function load() {
    if (!loading) {
      loading = fetch(CATALOG_URL, { cache: 'no-cache' })
        .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(list => { catalog = Array.isArray(list) ? list : []; })
        .catch(() => { catalog = []; });
    }
    return loading;
  }

  const bySlug = slug => (catalog || []).find(t => t.slug === slug);
  const sourceLabel = t => (t.source === 'mine' ? 'Mine' : 'Ptrn');

  /* ---------- grid ---------- */

  function buildCategories() {
    const counts = {};
    catalog.forEach(t => { counts[t.cat] = (counts[t.cat] || 0) + 1; });
    const names = Object.keys(counts).sort((a, b) => a.localeCompare(b));
    el.cat.innerHTML = '<option value="">All categories</option>' +
      names.map(n => `<option value="${escapeHtml(n)}">${escapeHtml(n)} (${counts[n]})</option>`).join('');
    el.cat.value = filters.cat;
  }

  function applyFilters() {
    const q = filters.q.trim().toLowerCase();
    visible = catalog.filter(t =>
      (filters.source === 'all' || t.source === filters.source) &&
      (!filters.cat || t.cat === filters.cat) &&
      (!q || (t.name + ' ' + t.cat + ' ' + t.desc).toLowerCase().includes(q)));
  }

  function renderGrid() {
    const total = catalog.length;
    if (!total) {
      el.count.textContent = '';
      el.bar.hidden = true; el.grid.hidden = true; el.none.hidden = true; el.missing.hidden = false;
      return;
    }
    el.missing.hidden = true; el.bar.hidden = false;
    applyFilters();
    const n = visible.length;
    el.count.textContent = n === total ? `${total} patterns` : `${n} of ${total} patterns`;
    el.none.hidden = n > 0;
    el.grid.hidden = n === 0;
    el.grid.innerHTML = visible.map(t => `
      <button type="button" class="pt-card" data-slug="${escapeHtml(t.slug)}" title="${escapeHtml(t.desc)}">
        <span class="pt-art"><img src="${escapeHtml(t.art)}" alt="" loading="lazy" decoding="async" /></span>
        <span class="pt-name">${escapeHtml(t.name)}</span>
        <span class="pt-meta">${escapeHtml(t.cat)} &middot; ${sourceLabel(t)}</span>
      </button>`).join('');
    applyThumbs(false);
  }

  function syncSourceButtons() {
    el.source.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.source === filters.source)));
  }

  function clearFilters() {
    filters.q = ''; filters.source = 'all'; filters.cat = '';
    el.search.value = ''; el.cat.value = '';
    syncSourceButtons();
    renderGrid();
  }

  /* ---------- views ---------- */

  function setView(view) {
    document.body.dataset.view = view;
    window.scrollTo(0, 0);
  }

  function leaveLogos() { if (typeof LogosHome !== 'undefined') LogosHome.hide(); }

  function showBrands() {
    leaveLogos();
    closeTool(true);
    saveMode('brands');
    setView('library');
  }

  async function showGrid() {
    leaveLogos();
    saveMode('patterns');
    setView('patterns');
    closeTool(true);
    await Promise.all([load(), refreshBrands()]);
    if (!el.cat.options.length || el.cat.options.length === 1) buildCategories();
    renderGrid();
    applyThumbs(true);
  }

  /* ---------- tool ---------- */

  function injectTheme(doc) {
    if (doc.getElementById('bd-ptrn-theme')) return Promise.resolve();
    return Promise.all(THEME_CSS.map((href, i) => new Promise(resolve => {
      const link = doc.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      if (i === THEME_CSS.length - 1) link.id = 'bd-ptrn-theme';
      link.onload = link.onerror = resolve;
      doc.head.appendChild(link);
    })));
  }

  // Esc and [ ] work whichever document has focus. Arrows stay with the tool.
  function onKey(e) {
    if (openSlug === null || e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target;
    if (t && (t.isContentEditable || /^(input|textarea|select)$/i.test(t.tagName))) return;
    if (document.body.classList.contains('has-dialog')) return;
    if (e.key === 'Escape') {
      const d = el.frame.contentDocument;
      if (d && d.querySelector('.pop:not([hidden]), .pick-menu:not([hidden]), .cpick')) return;  // the tool's own popover takes Esc
      e.preventDefault(); showGrid();
    } else if (e.key === '[') { e.preventDefault(); step(-1); }
    else if (e.key === ']') { e.preventDefault(); step(1); }
  }

  function onFrameLoad() {
    let win, doc;
    try { win = el.frame.contentWindow; doc = win.document; } catch (e) { return; }
    if (!openSlug || !doc || doc.location.href === 'about:blank') return;
    if (HOME_PATHS.includes(win.location.pathname)) { showGrid(); return; }   // the tool linked home: back to our grid
    doc.addEventListener('keydown', onKey);
    growSwatches(win, doc);
    injectTheme(doc).then(() => el.frame.classList.add('is-ready'));
  }

  function openTool(slug) {
    const t = bySlug(slug);
    if (!t) return false;
    openSlug = slug;
    el.name.textContent = t.name;
    el.toolCat.textContent = `${t.cat} · ${sourceLabel(t)}`;
    el.section.dataset.tool = 'open';
    el.tool.hidden = false;
    $('ptHome').hidden = true;
    $('ptTop').hidden = true;
    el.frame.classList.remove('is-ready');
    el.frame.src = t.href;
    setHash(slug);
    setTimeout(() => el.frame.classList.add('is-ready'), 1500);   // never leave the frame blank if a stylesheet stalls
    el.back.focus({ preventScroll: true });
    return true;
  }

  function closeTool(quiet) {
    if (openSlug === null && el.tool.hidden) return;
    openSlug = null;
    el.tool.hidden = true;
    delete el.section.dataset.tool;
    $('ptHome').hidden = false;
    $('ptTop').hidden = false;
    el.frame.removeAttribute('src');
    el.frame.src = 'about:blank';
    setHash(null);
  }

  function step(dir) {
    const list = visible.length && visible.some(t => t.slug === openSlug) ? visible : catalog;
    if (!list || !list.length) return;
    const i = list.findIndex(t => t.slug === openSlug);
    openTool(list[(i + dir + list.length) % list.length].slug);
  }

  function surprise() {
    const list = visible.filter(t => t.slug !== openSlug);
    if (list.length) openTool(list[Math.floor(Math.random() * list.length)].slug);
  }

  /* ---------- launch ---------- */

  // Called once the Library has finished starting (js/library-ui.js), because that
  // sets data-view itself. A pinned tool in the URL wins, then the remembered mode.
  async function start() {
    const slug = hashSlug();
    if (slug) {
      await showGrid();
      if (!openTool(slug)) setHash(null);
    } else if (readMode() === 'patterns') {
      await showGrid();
    }
  }

  function wire() {
    document.querySelectorAll('.mode-switch button').forEach(b => b.addEventListener('click', () => {
      if (b.dataset.mode === 'patterns') showGrid();
      else if (b.dataset.mode === 'logos') { closeTool(true); if (typeof LogosHome !== 'undefined') LogosHome.show(); }
      else showBrands();
    }));
    el.search.addEventListener('input', () => { filters.q = el.search.value; renderGrid(); });
    el.source.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (!b) return;
      filters.source = b.dataset.source;
      syncSourceButtons();
      renderGrid();
    });
    el.cat.addEventListener('change', () => { filters.cat = el.cat.value; renderGrid(); });
    el.brand.addEventListener('change', () => chooseBrand(el.brand.value));
    el.toolBrand.addEventListener('change', () => chooseBrand(el.toolBrand.value));
    el.surprise.addEventListener('click', surprise);
    el.clear.addEventListener('click', clearFilters);
    el.grid.addEventListener('click', e => {
      const card = e.target.closest('.pt-card');
      if (card) openTool(card.dataset.slug);
    });
    el.back.addEventListener('click', showGrid);
    el.prev.addEventListener('click', () => step(-1));
    el.next.addEventListener('click', () => step(1));
    el.frame.addEventListener('load', onFrameLoad);
    document.addEventListener('keydown', onKey);
  }

  wire();
  // Avoid a flash of the Library when a Patterns launch is coming.
  if (hashSlug() || readMode() === 'patterns') document.body.dataset.view = 'patterns';

  return { start, showGrid, showBrands };
})();
