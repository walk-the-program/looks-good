/* ---------------------------------------------------------------------
   pattern-cart.js — the brief "cart": the patterns a user has added to the AI
   brief, as a small tray that works from every workspace view.

   - Header button "Brief · N" (#briefCart) and a line under "Copy AI brief"
     (#aibNote, "Includes N patterns") both open the tray (#briefTray).
   - The tray lists state.patterns (PatternPins, js/patterns-ui.js): thumbnail,
     name, colorway, a "use" select, an include-SVG toggle (vector families), a
     per-item Copy, and remove. Footer: "Copy full AI brief" and "Copy patterns
     only" (buildAiBrief / buildPatternsBrief / buildPatternItemBrief,
     js/ai-brief.js).
   - Every change goes through PatternPins (undoable, marks the brand unsaved).
     app.js render() calls PatternCart.refresh() after each state change.
   - Wide screens: a popover next to its opener. <= 720px: a bottom sheet with a
     backdrop. Esc or a click outside closes; Tab stays inside while open.

   Needs patterns-ui.js (PatternPins), the engine (Patterns), ai-brief.js and
   app.js (state, showToast, copyText). Plain script.
------------------------------------------------------------------------ */

const PatternCart = (function () {
  const SHEET_MAX = 720;      // px: at or below this the tray is a bottom sheet
  const THUMB_W = 144, THUMB_H = 81;

  const $ = id => document.getElementById(id);
  const esc = s => escapeHtml(s);   // app.js
  const P = () => window.Patterns;

  let tray = null, backdrop = null;
  let isOpen = false;
  let opener = null;
  let lastSig = '';
  let wired = false;
  const thumbs = new Map();

  const items = () => PatternPins.list();
  const famName = key => ((P().get(key) || {}).name) || key;
  const cwLabel = v => (P().E.COLORWAYS.find(c => c.value === v) || {}).label || v;
  const sheetMode = () => window.matchMedia('(max-width: ' + SHEET_MAX + 'px)').matches;
  const countWord = n => (n === 0 ? 'No patterns added' : n === 1 ? 'Includes 1 pattern' : `Includes ${n} patterns`);

  /* ---------------- thumbnails (cached) ---------------- */

  function thumbFor(entry) {
    const inks = P().inksFor(state, entry.colorway, { tints: !!(entry.params && entry.params.tints) });
    const key = [entry.key, JSON.stringify(entry.params), entry.colorway, entry.seed, inks.ground, inks.ink1, inks.ink2, inks.spark, inks.deep, inks.t1, inks.t2].join('|');
    let off = thumbs.get(key);
    if (!off) {
      off = document.createElement('canvas');
      P().render(off, entry.key, entry.params, inks, entry.seed, { width: THUMB_W, height: THUMB_H, dpr: 1, setStyle: false });
      thumbs.set(key, off);
      if (thumbs.size > 60) thumbs.delete(thumbs.keys().next().value);
    }
    return off;
  }

  /* ---------------- markup ---------------- */

  function itemHtml(p, i) {
    const f = P().list().find(x => x.key === p.key) || {};
    const name = famName(p.key);
    const kind = f.vector ? (f.seamless ? 'Vector, seamless' : 'Vector') : 'Raster';
    const uses = PatternPins.USES.map(u => `<option value="${u.value}"${u.value === p.use ? ' selected' : ''}>${esc(u.label)}</option>`).join('');
    const svg = f.vector
      ? `<label class="cart-svg"><input type="checkbox" data-act="svg"${p.svg ? ' checked' : ''} /> Include SVG</label>`
      : '<span class="cart-note">Raster: attach PNG</span>';
    return `<li class="cart-item" data-i="${i}">
      <span class="cart-thumb"><canvas width="${THUMB_W}" height="${THUMB_H}" aria-hidden="true"></canvas></span>
      <div class="cart-meta">
        <b class="cart-name">${esc(name)}</b>
        <span class="cart-sub">${esc(kind)} · seed ${esc(p.seed)}</span>
        <span class="cart-chip">${esc(cwLabel(p.colorway))}</span>
      </div>
      <button type="button" class="cart-rm" data-act="rm" aria-label="Remove ${esc(name)} from brief" title="Remove from brief">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>
      </button>
      <div class="cart-opts">
        <label class="cart-use"><span>Use</span><select data-act="use" aria-label="Use for ${esc(name)}">${uses}</select></label>
        ${svg}
        <button type="button" class="btn btn-ghost btn-small cart-copy" data-act="copy" title="Copy this pattern's brief block">Copy</button>
      </div>
    </li>`;
  }

  function renderTray() {
    const list = items();
    $('briefTrayCount').textContent = `${list.length} of ${PatternPins.PIN_MAX}`;
    $('briefTrayBody').innerHTML = list.length
      ? `<ul class="cart-list">${list.map(itemHtml).join('')}</ul>`
      : '<p class="cart-empty">Nothing added yet. Use <b>Add to brief</b> in the Patterns view and the pattern, with its colors, where to use it and its SVG, goes into the AI brief.</p>';
    $('briefTrayBody').querySelectorAll('.cart-item').forEach((li, i) => {
      const cv = li.querySelector('canvas');
      const off = thumbFor(list[i]);
      cv.getContext('2d').drawImage(off, 0, 0);
    });
    $('briefCopyPatterns').disabled = list.length === 0;
  }

  /* ---------------- header button, sidebar line ---------------- */

  function syncLabels() {
    const n = items().length;
    const btn = $('briefCart');
    if (btn) {
      $('briefCartCount').textContent = String(n);
      btn.classList.toggle('is-empty', n === 0);
      btn.setAttribute('aria-label', `Patterns in your AI brief: ${n}. Open the list`);
    }
    const note = $('aibNote');
    if (note) {
      note.textContent = countWord(n);
      note.classList.toggle('is-empty', n === 0);
    }
  }

  // Called from render() after every state change; cheap when nothing in the cart moved.
  function refresh() {
    if (!wired) return;
    syncLabels();
    if (!isOpen) return;
    const c = state.colors || {};
    const sig = items().map(PatternPins.fullSig).join('\n') + '|' + [c.primary, c.secondary, c.accent, c.neutralDark, c.neutralLight, state.aesthetic, state.aestheticVersion, state.bgMode].join(',');
    if (sig === lastSig) return;
    lastSig = sig;
    renderTray();
    place();
  }

  // A short pulse on the header button after something is added.
  function pulse() {
    const btn = $('briefCart');
    if (!btn) return;
    btn.classList.remove('is-pulse');
    void btn.offsetWidth;
    btn.classList.add('is-pulse');
  }

  /* ---------------- open / close ---------------- */

  function place() {
    if (!isOpen) return;
    if (sheetMode()) {
      ['left', 'top', 'bottom', 'maxHeight'].forEach(k => { tray.style[k] = ''; });
      return;
    }
    const margin = 12;
    const r = (opener || $('briefCart')).getBoundingClientRect();
    const w = tray.offsetWidth, h = tray.offsetHeight;
    const left = Math.max(margin, Math.min(r.right - w, window.innerWidth - w - margin));
    const below = window.innerHeight - r.bottom - margin * 2;
    const above = r.top - margin * 2;
    tray.style.left = left + 'px';
    if (h <= below || below >= above) {
      tray.style.top = (r.bottom + 8) + 'px';
      tray.style.bottom = '';
      tray.style.maxHeight = Math.max(220, below) + 'px';
    } else {
      tray.style.top = 'auto';
      tray.style.bottom = (window.innerHeight - r.top + 8) + 'px';
      tray.style.maxHeight = Math.max(220, above) + 'px';
    }
  }

  function open(from) {
    if (isOpen) return close(true);
    opener = from || $('briefCart');
    isOpen = true;
    lastSig = '';
    tray.hidden = false;
    backdrop.hidden = false;
    document.body.classList.add('has-cart');
    tray.classList.toggle('is-sheet', sheetMode());
    $('briefCart').setAttribute('aria-expanded', 'true');
    refresh();
    place();
    tray.focus({ preventScroll: true });
  }

  function close(restoreFocus) {
    if (!isOpen) return;
    isOpen = false;
    tray.hidden = true;
    backdrop.hidden = true;
    document.body.classList.remove('has-cart');
    $('briefCart').setAttribute('aria-expanded', 'false');
    if (restoreFocus && opener) opener.focus({ preventScroll: true });
  }

  /* ---------------- copy ---------------- */

  function copy(text, okMessage) {
    return copyText(text)
      .then(() => showToast(okMessage))
      .catch(() => showToast('Clipboard blocked. Try again from the app window'));
  }

  /* ---------------- events ---------------- */

  // After a change rebuilds the list, put focus back on the control that was used.
  function keepFocus(sel) {
    const el = sel && tray.querySelector(sel);
    if (el) el.focus({ preventScroll: true });
    else tray.focus({ preventScroll: true });
  }

  function onTrayClick(e) {
    const act = e.target.closest('[data-act]');
    const li = e.target.closest('.cart-item');
    if (act && li) {
      const i = Number(li.dataset.i);
      const entry = items()[i];
      if (!entry) return;
      if (act.dataset.act === 'rm') {
        PatternPins.removeAt(i);
        const left = items().length;
        keepFocus(left ? `.cart-item[data-i="${Math.min(i, left - 1)}"] [data-act="rm"]` : '#briefTrayClose');
      } else if (act.dataset.act === 'copy') {
        copy(buildPatternItemBrief(state, i), `Copied ${famName(entry.key)} brief`);
      }
      return;
    }
    if (e.target.closest('#briefTrayClose')) return close(true);
    if (e.target.closest('#briefCopyFull')) {
      const n = items().length;
      return copy(buildAiBrief(state), n ? `AI brief copied, with ${n} ${n === 1 ? 'pattern' : 'patterns'}` : 'AI brief copied');
    }
    if (e.target.closest('#briefCopyPatterns')) {
      const n = items().length;
      if (n) copy(buildPatternsBrief(state), `Copied ${n} ${n === 1 ? 'pattern' : 'patterns'} (Patterns section only)`);
    }
  }

  function onTrayChange(e) {
    const act = e.target.dataset && e.target.dataset.act;
    const li = e.target.closest('.cart-item');
    if (!act || !li) return;
    const i = Number(li.dataset.i);
    if (act === 'use') PatternPins.patch(i, { use: e.target.value });
    else if (act === 'svg') PatternPins.patch(i, { svg: e.target.checked });
    else return;
    keepFocus(`.cart-item[data-i="${i}"] [data-act="${act}"]`);
  }

  function onKeydown(e) {
    if (!isOpen) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      return close(true);
    }
    if (e.key !== 'Tab') return;
    const f = Array.from(tray.querySelectorAll('button:not(:disabled), select, input, [href]')).filter(el => el.offsetParent !== null);
    if (!f.length) { e.preventDefault(); return tray.focus(); }
    const first = f[0], last = f[f.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && (active === first || active === tray)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
    else if (!tray.contains(active)) { e.preventDefault(); first.focus(); }
  }

  function wire() {
    tray = $('briefTray');
    backdrop = $('briefBackdrop');
    if (!tray || !backdrop || !$('briefCart')) return;
    wired = true;
    $('briefCart').addEventListener('click', () => open($('briefCart')));
    const note = $('aibNote');
    if (note) note.addEventListener('click', () => open(note));
    tray.addEventListener('click', onTrayClick);
    tray.addEventListener('change', onTrayChange);
    document.addEventListener('keydown', onKeydown, true);
    // click outside closes (the opener buttons toggle on their own)
    document.addEventListener('pointerdown', e => {
      if (!isOpen) return;
      if (tray.contains(e.target) || e.target.closest('#briefCart, #aibNote')) return;
      close(false);
    }, true);
    const reflow = () => { if (isOpen) { tray.classList.toggle('is-sheet', sheetMode()); place(); } };
    window.addEventListener('resize', reflow);
    window.addEventListener('scroll', reflow, { passive: true });
    syncLabels();
  }

  document.addEventListener('DOMContentLoaded', wire);

  return {
    refresh, pulse, open, close,
    isOpen: () => isOpen,
  };
})();
