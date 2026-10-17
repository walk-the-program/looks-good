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

  /* A tile is a flat card on the brand's own canvas: logo or initial, the name in the
     brand's heading font, the aesthetic's name, and the palette strip. The canvas, ink and
     faces come from the same view the board renders (blend and pure ground included), built
     from a throwaway state so the open brand's `state` is never touched. Any failure falls
     back to the brand's light/dark neutral, then to the page's own colours. */
  function tileLook(rec) {
    const saved = rec.draftState || rec.savedState || {};
    const colors = (rec.savedState && rec.savedState.colors) || saved.colors || {};
    const out = {
      canvas: saved.bgMode === 'dark' ? colors.neutralDark : colors.neutralLight,
      ink: saved.bgMode === 'dark' ? colors.neutralLight : colors.neutralDark,
      font: FONTS.find(f => f.name === saved.headingFontName) || FONTS[0],
      aesthetic: '',
    };
    try {
      const st = freshState();
      st.colors = generatePalette('analogous', 210);
      const { logoDataUrl, ...rest } = saved;
      applySavedSessionToState(rest, st);
      const v = abView(st);
      const t = boardTokens(v.state, v.def);
      out.canvas = t.canvas; out.ink = t.ink; out.muted = t.muted;
      out.font = v.state.headingFont;
      out.aesthetic = aestheticByKey(st.aesthetic).name || '';
    } catch (e) { /* keep the neutrals */ }
    return out;
  }

  // The name's size is estimated from its length in tileHtml; once the face is loaded, shrink
  // it until no word overflows the column and the name takes at most 3 lines (wide faces such
  // as pixel fonts run past any per-character estimate).
  function fitName(art) {
    const el = art.querySelector('.tile-name');
    if (!el) return;
    let size = parseFloat(el.style.fontSize) || 10;
    const fits = () => {
      const px = parseFloat(getComputedStyle(el).fontSize) || 1;
      return el.scrollWidth <= el.clientWidth + 1 && el.getBoundingClientRect().height <= px * 1.04 * 3 + 2;
    };
    while (size > 3.5 && !fits()) {
      size = Math.max(3.5, size * 0.93);
      el.style.fontSize = size.toFixed(2) + 'cqw';
    }
  }

  // Loads the tile's heading face once the tile nears the viewport, then reveals the type.
  function paintTile(art) {
    const done = () => { fitName(art); art.classList.remove('is-loading'); };
    const font = FONTS.find(f => f.name === art.dataset.font);
    return font && window.loadFontFamily ? window.loadFontFamily(font).then(done, done) : done();
  }

  const tileObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => {
        entries.forEach(en => {
          if (!en.isIntersecting) return;
          tileObserver.unobserve(en.target);
          paintTile(en.target);
        });
      }, { rootMargin: '200px' })
    : null;

  // Relative luminance of a CSS rgb() colour, and the average of a logo's opaque pixels.
  const relLum = (r, g, b) => {
    const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  function tileLum(css) {
    const m = String(css || '').match(/[\d.]+/g);
    if (!m || m.length < 3 || (m.length > 3 && Number(m[3]) < 0.5)) return null;
    return relLum(+m[0], +m[1], +m[2]);
  }
  // The share of a wide logo's opaque wordmark pixels within 1.6:1 of the canvas luminance.
  function logoLostShare(img, bg) {
    if (bg == null) return null;
    try {
      const c = document.createElement('canvas');
      c.width = 120; c.height = 40;
      const x = c.getContext('2d');
      x.drawImage(img, 0, 0, c.width, c.height);
      const d = x.getImageData(0, 0, c.width, c.height).data;
      // A logo drawn on its own filled background already carries its contrast.
      const at = (px, py) => d[(py * c.width + px) * 4 + 3];
      if ([at(1, 1), at(c.width - 2, 1), at(1, c.height - 2), at(c.width - 2, c.height - 2)].every(a => a > 200)) return 0;
      // Only the right two thirds: in a wide lockup that is the wordmark, which is what
      // goes missing; a mark often uses the canvas colour on purpose.
      let lost = 0, n = 0;
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] <= 128 || (i / 4) % c.width < c.width / 3) continue;
        const l = relLum(d[i], d[i + 1], d[i + 2]);
        n++;
        if ((Math.max(l, bg) + 0.05) / (Math.min(l, bg) + 0.05) < 1.6) lost++;
      }
      return n ? lost / n : null;
    } catch (err) { return null; }
  }

  function tileHtml(rec) {
    const s = rec.savedState || {};
    const colors = s.colors || {};
    const look = tileLook(rec);
    const primary = colors.primary || '#444444';
    const canvas = look.canvas || '#f4f4f4';
    const ink = look.ink || pickReadableText(canvas);
    const muted = look.muted || slMix(canvas, ink, 0.4);
    const fontCss = look.font.css.replace(/"/g, "'");
    const initial = ([...(rec.name || '').trim()][0] || '?').toUpperCase();
    const mark = s.logoDataUrl
      ? `<span class="tile-mark has-logo"><img src="${escapeHtml(s.logoDataUrl)}" alt="" /></span>`
      : `<span class="tile-mark" style="background:${escapeHtml(primary)};color:${pickReadableText(primary)}">${escapeHtml(initial)}</span>`;
    const band = ['primary', 'secondary', 'accent', 'neutralDark', 'neutralLight']
      .map(k => `<i style="background:${escapeHtml(colors[k] || '#cccccc')}"></i>`).join('');
    // Wrap only between words (max 3 lines); a lone word gets one line sized to fit.
    const words = String(rec.name || '').trim().split(/\s+/).filter(Boolean);
    const nameSize = slFit(rec.name, { max: 15, min: 5, widthPct: 80, lines: words.length > 1 ? 3 : 1, glyph: 0.6 });
    return `
      <article class="tile" tabindex="0" data-id="${rec.id}" aria-label="${escapeHtml(rec.name)}">
        <div class="tile-art is-loading" data-font="${escapeHtml(look.font.name)}"
             style="--t-bg:${escapeHtml(canvas)};--t-ink:${escapeHtml(ink)};--t-muted:${escapeHtml(muted)};--t-font:${fontCss}">
          ${mark}
          <span class="tile-body">
            <span class="tile-name" style="font-size:${nameSize}cqw">${escapeHtml(rec.name)}</span>
            ${look.aesthetic ? `<span class="tile-kind">${escapeHtml(look.aesthetic)}</span>` : ''}
          </span>
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
    // Showcase on: only the showcase brands are shown (if any are loaded); the rest stay saved.
    const sc = typeof window.isShowcase === 'function' && window.isShowcase();
    const scBrands = records.filter(r => r.source === 'showcase' ||
      (typeof ShowcaseBrands !== 'undefined' && ShowcaseBrands.names().some(nm => nm.toLowerCase() === String(r.name || '').trim().toLowerCase())));
    const shown = sc && scBrands.length ? scBrands : records;
    empty.hidden = has;
    grid.hidden = !has;
    const n = n => `${n} ${n === 1 ? 'brand' : 'brands'}`;
    let count = '';
    if (has && sc && scBrands.length) {
      const hidden = records.length - scBrands.length;
      count = `${scBrands.length} showcase ${scBrands.length === 1 ? 'brand' : 'brands'}` + (hidden ? ` · ${hidden} of your own hidden while Showcase is on` : '');
    } else if (has && sc) count = 'Showcase is on: load the showcase brands to show them off';
    else if (has) count = `${n(records.length)}, most recently edited first`;
    $('libCount').textContent = count;
    const plus = `
      <button type="button" class="tile tile-new" id="libPlus" aria-label="New brand">
        <div class="tile-art"><span class="tile-plus">+</span></div>
        <div class="tile-meta"><div class="tile-text"><div class="tile-title">New brand</div><div class="tile-sub">Start from a fresh combination</div></div></div>
      </button>`;
    grid.innerHTML = plus + shown.map(tileHtml).join('');
    // A wide logo (mark plus wordmark) gets a wider plate (css .tile-mark.is-wide).
    // If its ink would vanish on the tile's canvas, it sits on a small light or dark plate.
    grid.querySelectorAll('.tile-mark.has-logo img').forEach(img => {
      const wide = () => {
        if (!(img.naturalWidth > img.naturalHeight * 1.6)) return;
        const mark = img.parentNode;
        mark.classList.add('is-wide');
        const art = mark.closest('.tile-art') || mark.parentNode;
        const bg = tileLum(getComputedStyle(art).backgroundColor), lost = logoLostShare(img, bg);
        // Much of the logo (usually its wordmark) close to the canvas: a plate that is the
        // opposite of the canvas, which is what those pixels contrast with.
        if (lost != null && lost > 0.35) mark.classList.add(bg < 0.2 ? 'on-light' : 'on-dark');
      };
      if (img.complete) wide(); else img.addEventListener('load', wide, { once: true });
    });
    grid.querySelectorAll('.tile-art[data-font]').forEach(a => {
      if (tileObserver) tileObserver.observe(a); else paintTile(a);
    });
    if (window.Onboarding) Onboarding.libraryChanged(records);   // empty-state example, showcase button
  }

  /* ---------- actions ---------- */

  async function newBrandFlow() {
    // The three-way dialog (your logo / three questions / a name) lives in js/onboarding.js;
    // the plain form below is what remains if that file is not loaded.
    if (window.Onboarding && Onboarding.newBrand) return Onboarding.newBrand(plainNewBrandFlow);
    return plainNewBrandFlow();
  }

  async function plainNewBrandFlow() {
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
    if (typeof PatternsHome !== 'undefined') PatternsHome.start();   // may switch to the remembered Patterns mode
  }

  return { init, refresh, newBrandFlow };
})();

document.addEventListener('DOMContentLoaded', () => LibraryUI.init());
