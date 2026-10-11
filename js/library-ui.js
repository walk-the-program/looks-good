/* ---------------------------------------------------------------------
   library-ui.js — the Library (home) screen, plus the small in-page dialog
   helper used by the New brand, rename, save-as and unsaved-changes flows.

   Dialogs are in-page (not window.prompt) so they can hold two required
   fields and three buttons. The destructive confirm for Delete deliberately
   uses window.confirm(), which the Mac app shows as a native sheet.
------------------------------------------------------------------------ */

const Dialogs = (function () {
  function open({ title, message, fields = [], buttons }) {
    return new Promise(resolve => {
      const previousFocus = document.activeElement;
      const overlay = document.createElement('div');
      overlay.className = 'dlg-overlay';
      overlay.innerHTML = `
        <form class="dlg" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}" novalidate>
          <h2 class="dlg-title">${escapeHtml(title)}</h2>
          ${message ? `<p class="dlg-message">${escapeHtml(message)}</p>` : ''}
          ${fields.map((f, i) => `
            <label class="field dlg-field">
              <span>${escapeHtml(f.label)}</span>
              <input type="text" name="${escapeHtml(f.name)}" data-i="${i}" value="${escapeHtml(f.value || '')}"
                     placeholder="${escapeHtml(f.placeholder || '')}" autocomplete="off" spellcheck="false" />
            </label>`).join('')}
          <p class="dlg-error" hidden></p>
          <div class="dlg-actions">
            ${buttons.map(b => `<button type="button" class="btn ${b.primary ? 'btn-primary' : 'btn-ghost'}" data-id="${b.id}">${escapeHtml(b.label)}</button>`).join('')}
          </div>
        </form>`;
      document.body.appendChild(overlay);
      document.body.classList.add('has-dialog');

      const form = overlay.querySelector('form');
      const error = overlay.querySelector('.dlg-error');
      const inputs = Array.from(form.querySelectorAll('input'));
      const primary = buttons.find(b => b.primary) || buttons[0];
      const cancel = buttons.find(b => b.cancel) || buttons[buttons.length - 1];

      function close(id, values) {
        overlay.remove();
        document.body.classList.remove('has-dialog');
        if (previousFocus && previousFocus.focus) previousFocus.focus();
        resolve({ id, values });
      }
      function submit(btn) {
        if (btn.cancel || btn.id === 'cancel' || btn.id === 'discard') return close(btn.id, null);
        const values = {};
        for (const f of fields) {
          const v = inputs[fields.indexOf(f)].value.trim();
          if (f.required && !v) {
            error.textContent = `${f.label} is required.`;
            error.hidden = false;
            inputs[fields.indexOf(f)].focus();
            return;
          }
          values[f.name] = v;
        }
        close(btn.id, values);
      }

      form.addEventListener('submit', e => { e.preventDefault(); submit(primary); });
      overlay.querySelectorAll('button[data-id]').forEach(el => {
        el.addEventListener('click', () => submit(buttons.find(b => b.id === el.dataset.id)));
      });
      inputs.forEach(i => i.addEventListener('input', () => { error.hidden = true; }));
      overlay.addEventListener('mousedown', e => { if (e.target === overlay) close(cancel.id, null); });
      overlay.addEventListener('keydown', e => {
        e.stopPropagation();   // keep Space-to-shuffle and friends out of dialogs
        if (e.key === 'Escape') { e.preventDefault(); close(cancel.id, null); }
        if (e.key === 'Enter' && e.target.tagName === 'BUTTON') return;  // let the focused button act
        if (e.key === 'Tab') {
          const items = Array.from(overlay.querySelectorAll('input, button'));
          const first = items[0], last = items[items.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      });
      (inputs[0] || overlay.querySelector('.btn-primary') || overlay.querySelector('button')).focus();
      if (inputs[0]) inputs[0].select();
    });
  }

  return {
    // Resolves to { field: value } or null when cancelled.
    async form({ title, message, fields, confirm = 'OK' }) {
      const r = await open({
        title, message, fields,
        buttons: [{ id: 'ok', label: confirm, primary: true }, { id: 'cancel', label: 'Cancel', cancel: true }],
      });
      return r.id === 'ok' ? r.values : null;
    },
    async prompt({ title, label, value, confirm }) {
      const v = await this.form({ title, fields: [{ name: 'v', label, value, required: true }], confirm });
      return v ? v.v : null;
    },
    // Resolves to the clicked button id.
    async choose({ title, message, buttons }) {
      const r = await open({ title, message, buttons });
      return r.id;
    },
  };
})();

const LibraryUI = (function () {
  const $ = id => document.getElementById(id);
  const MIGRATED_KEY = 'brandingDesigner.libraryMigrated.v1';
  let records = [];
  let menuEl = null;

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

  /* ---------- one-time import of the old single autosaved session ---------- */

  async function migrate() {
    if (localStorage.getItem(MIGRATED_KEY)) return;
    localStorage.setItem(MIGRATED_KEY, '1');
    const old = loadSession();
    if (!old) return;
    const name = ((old.content && old.content.brandName) || '').trim() || 'Untitled brand';
    const now = Date.now();
    await LibraryStore.put({
      id: LibraryStore.newId(), name, createdAt: now, updatedAt: now,
      savedState: old, draftState: null,
    });
  }

  /* ---------- tiles ---------- */

  const tileFontObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => {
        entries.forEach(en => {
          if (!en.isIntersecting) return;
          const art = en.target;
          tileFontObserver.unobserve(art);
          const font = FONTS.find(f => f.name === art.dataset.font);
          const done = () => art.classList.remove('is-loading');
          if (font && window.loadFontFamily) window.loadFontFamily(font).then(done, done); else done();
        });
      }, { rootMargin: '200px' })
    : null;

  function tileHtml(rec) {
    const s = rec.savedState || {};
    const colors = s.colors || {};
    const font = FONTS.find(f => f.name === s.headingFontName) || FONTS[0];
    const preset = SHAPE_PRESETS.find(p => p.key === s.shapePresetKey) || SHAPE_PRESETS[0];
    const primary = colors.primary || '#444444';
    const ink = pickReadableText(primary);
    const radius = slRadius(preset.radiusLg, '8px');
    const fontCss = font.css.replace(/"/g, "'");
    const mark = s.logoDataUrl
      ? `<img src="${s.logoDataUrl}" alt="" />`
      : 'Aa';
    const band = ['primary', 'secondary', 'accent', 'neutralDark', 'neutralLight']
      .map(k => `<i style="background:${escapeHtml(colors[k] || '#cccccc')}"></i>`).join('');
    const nameSize = slFit(rec.name, { max: 12, min: 6, widthPct: 78, lines: 2, glyph: 0.6 });
    return `
      <article class="tile" tabindex="0" data-id="${rec.id}" aria-label="${escapeHtml(rec.name)}">
        <div class="tile-art is-loading" data-font="${escapeHtml(font.name)}"
             style="--t-bg:${escapeHtml(primary)};--t-ink:${ink};--t-radius:${radius};--t-font:${fontCss}">
          <span class="tile-mark">${mark}</span>
          <span class="tile-name" style="font-size:${nameSize}cqw">${escapeHtml(rec.name)}</span>
          <span class="tile-band">${band}</span>
        </div>
        <div class="tile-meta">
          <div class="tile-text">
            <div class="tile-title">${escapeHtml(rec.name)}</div>
            <div class="tile-sub">${rec.draftState ? '<i class="save-dot" aria-hidden="true"></i>Unsaved changes · ' : ''}Edited ${timeAgo(rec.updatedAt)}</div>
          </div>
          <button type="button" class="tile-more" aria-label="Actions for ${escapeHtml(rec.name)}" aria-haspopup="menu">…</button>
        </div>
      </article>`;
  }

  async function refresh() {
    try { records = await LibraryStore.list(); } catch (e) { records = []; }
    if (LibraryStore.skipped) showToast(LibraryStore.skipped === 1 ? '1 brand file couldn’t be read' : `${LibraryStore.skipped} brand files couldn’t be read`);
    records.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    const grid = $('libGrid');
    const empty = $('libEmpty');
    const has = records.length > 0;
    empty.hidden = has;
    grid.hidden = !has;
    $('libCount').textContent = has ? `${records.length} ${records.length === 1 ? 'brand' : 'brands'}, most recently edited first` : '';
    const plus = `
      <button type="button" class="tile tile-new" id="libPlus" aria-label="New brand">
        <div class="tile-art"><span class="tile-plus">+</span></div>
        <div class="tile-meta"><div class="tile-text"><div class="tile-title">New brand</div><div class="tile-sub">Start from a fresh combination</div></div></div>
      </button>`;
    grid.innerHTML = plus + records.map(tileHtml).join('');
    grid.querySelectorAll('.tile-art[data-font]').forEach(a => {
      if (tileFontObserver) tileFontObserver.observe(a); else a.classList.remove('is-loading');
    });
  }

  /* ---------- actions ---------- */

  async function newBrandFlow() {
    const v = await Dialogs.form({
      title: 'New brand',
      fields: [
        { name: 'name', label: 'Brand name', placeholder: 'e.g. Northwind Provisions', required: true },
        { name: 'tagline', label: 'Tagline', placeholder: 'e.g. Good food, simply sourced', required: true },
      ],
      confirm: 'Create brand',
    });
    if (v) await BrandSession.createBrand(v.name, v.tagline);
  }

  function setBrandName(rec, name) {
    rec.name = name;
    [rec.savedState, rec.draftState].forEach(s => {
      if (s && s.content) s.content.brandName = name;
    });
  }

  async function rename(rec) {
    const name = await Dialogs.prompt({ title: 'Rename brand', label: 'Brand name', value: rec.name, confirm: 'Rename' });
    if (!name || name === rec.name) return;
    setBrandName(rec, name);
    await LibraryStore.put(rec);
    await refresh();
  }

  async function duplicate(rec) {
    const copy = JSON.parse(JSON.stringify(rec));
    const now = Date.now();
    copy.id = LibraryStore.newId();
    copy.createdAt = now;
    copy.updatedAt = now;
    copy.draftState = null;
    setBrandName(copy, `${rec.name} copy`);
    await LibraryStore.put(copy);
    await refresh();
  }

  async function remove(rec) {
    if (!window.confirm(`Delete “${rec.name}”? This can’t be undone.`)) return;
    await LibraryStore.remove(rec.id);
    await refresh();
  }

  /* ---------- tile menu ---------- */

  function closeMenu() {
    if (menuEl) { menuEl.remove(); menuEl = null; }
  }
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
    menuEl.addEventListener('click', async e => {
      const act = e.target.closest('button')?.dataset.act;
      if (!act) return;
      closeMenu();
      if (act === 'open') BrandSession.openBrand(rec.id);
      if (act === 'rename') rename(rec);
      if (act === 'duplicate') duplicate(rec);
      if (act === 'delete') remove(rec);
    });
  }

  function recordFor(el) {
    const tile = el.closest('.tile[data-id]');
    return tile ? records.find(r => r.id === tile.dataset.id) : null;
  }

  function wire() {
    const grid = $('libGrid');
    $('libNew').addEventListener('click', newBrandFlow);
    $('libEmptyNew').addEventListener('click', newBrandFlow);

    grid.addEventListener('click', e => {
      if (e.target.closest('#libPlus')) return newBrandFlow();
      const more = e.target.closest('.tile-more');
      const rec = recordFor(e.target);
      if (!rec) return;
      if (more) {
        const r = more.getBoundingClientRect();
        e.stopPropagation();
        return showMenu(rec, r.left, r.bottom + 4, more);
      }
      BrandSession.openBrand(rec.id);
    });
    grid.addEventListener('keydown', e => {
      const tile = e.target.closest('.tile[data-id]');
      if (!tile || e.target !== tile) return;
      if (e.key === 'Enter') { e.preventDefault(); BrandSession.openBrand(tile.dataset.id); }
      if (e.key === 'ContextMenu' || (e.key === 'F10' && e.shiftKey)) {
        const rec = recordFor(tile), r = tile.getBoundingClientRect();
        e.preventDefault();
        if (rec) showMenu(rec, r.left + 12, r.top + 12, tile);
      }
    });
    grid.addEventListener('contextmenu', e => {
      const rec = recordFor(e.target);
      if (!rec) return;
      e.preventDefault();
      showMenu(rec, e.clientX, e.clientY, null);
    });
    document.addEventListener('mousedown', e => { if (menuEl && !menuEl.contains(e.target)) closeMenu(); });
    window.addEventListener('blur', closeMenu);
  }

  async function init() {
    BrandSession.wire();
    wire();
    try { await migrate(); } catch (e) { /* a failed import must not block the app */ }
    await refresh();
    document.body.dataset.view = 'library';
  }

  return { init, refresh, newBrandFlow };
})();

document.addEventListener('DOMContentLoaded', () => LibraryUI.init());
