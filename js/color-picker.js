/* ---------------------------------------------------------------------
   color-picker.js — the inline color picker in the Color palette panel.

   Replaces five native <input type="color"> swatches. In the WKWebView Mac
   app those open the system NSColorPanel (two macOS menus to reach the
   wheel); everything here is drawn in the page instead.

     role rows   pick which of the five colors is being edited
     wheel       HSV wheel on <canvas> (hue = angle, saturation = radius),
                 draggable handle, arrow keys, other palette colors as dots
     brightness  slider with a live gradient track
     hex         #rgb / #rrggbb, with or without #; Enter or blur applies
     guide       the selected color's job, never-rule, coverage and contrast
     import      "Paste brand colors" review + apply

   Undo: one drag, one keyboard burst or one hex commit = one undo step
   (pushUndoSnapshot is called lazily, just before the first real change of
   a burst). The unsaved marker needs nothing extra: brand-session compares
   serialized state on every render().

   Depends on color.js, color-roles.js, color-import.js, undo-history.js.
   app.js calls ColorPicker.init() once and ColorPicker.sync() from
   updateControlsFromState(), so the picker follows scheme changes, shuffles,
   undo, session restore and library opens.
------------------------------------------------------------------------ */

const ColorPicker = (function () {
  const $ = id => document.getElementById(id);
  const KEYS = ['primary', 'secondary', 'accent', 'neutralDark', 'neutralLight'];
  const NAMES = { primary: 'Primary', secondary: 'Secondary', accent: 'Accent', neutralDark: 'Dark', neutralLight: 'Light' };
  const LETTERS = { primary: 'P', secondary: 'S', accent: 'A', neutralDark: 'D', neutralLight: 'L' };
  const WHEEL_SIZE = 188;          // CSS px; the bitmap is scaled by devicePixelRatio
  const IDLE_MS = 700;             // a keyboard burst ends after this much quiet

  let ready = false;
  let selected = 'primary';
  let hsv = null;                  // { h: 0-360, s: 0-1, v: 0-1 } of the selected color
  let drawn = { v: -1, dpr: 0 };   // what the wheel bitmap currently shows
  let editing = false;             // inside an undo burst
  let pointerHeld = false;
  let idleTimer = 0;
  let raf = 0;
  let pending = null;
  let imp = { colors: [], assign: {}, source: {} };

  const esc = s => escapeHtml(s);   // app.js

  /* ---------- color math (HSV is local; HSL/contrast come from color.js) ---------- */

  function hsvToHex(h, s, v) {
    h = ((h % 360) + 360) % 360;
    const f = n => {
      const k = (n + h / 60) % 6;
      return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
    };
    const to = x => Math.round(x * 255).toString(16).padStart(2, '0');
    return '#' + to(f(5)) + to(f(3)) + to(f(1));
  }

  // `prev` keeps hue (and saturation at v=0) where a hex can't say: greys and black.
  function hexToHsv(hex, prev) {
    const { r, g, b } = hexToRgb(hex);
    const R = r / 255, G = g / 255, B = b / 255;
    const max = Math.max(R, G, B), min = Math.min(R, G, B), d = max - min;
    let h = prev ? prev.h : 0;
    if (d > 0) {
      if (max === R) h = ((G - B) / d + (G < B ? 6 : 0)) * 60;
      else if (max === G) h = ((B - R) / d + 2) * 60;
      else h = ((R - G) / d + 4) * 60;
    }
    const s = max === 0 ? (prev ? prev.s : 0) : d / max;
    return { h, s, v: max };
  }

  function normalizeHex(text) {
    let t = String(text || '').trim().replace(/^#/, '').toLowerCase();
    if (/^[0-9a-f]{3}$/.test(t)) t = t.split('').map(c => c + c).join('');
    else if (/^[0-9a-f]{8}$/.test(t)) t = t.slice(0, 6);         // alpha dropped
    return /^[0-9a-f]{6}$/.test(t) ? '#' + t : null;
  }

  const canvasHex = () => (state.bgMode === 'dark' ? state.colors.neutralDark : state.colors.neutralLight);
  const inkHex = () => (state.bgMode === 'dark' ? state.colors.neutralLight : state.colors.neutralDark);

  /* ---------- undo bursts + committing a change ---------- */

  function endBurst() {
    editing = false;
    clearTimeout(idleTimer);
    idleTimer = 0;
  }

  // Apply one color edit. Returns true when the palette actually changed.
  function change(key, hex) {
    if (state.colors[key] === hex) return false;
    if (!editing) { pushUndoSnapshot(state); editing = true; }
    clearTimeout(idleTimer);
    if (!pointerHeld) idleTimer = setTimeout(endBurst, IDLE_MS);
    setBrandColor(key, hex);           // app.js: scheme rules live there
    render();
    return true;
  }

  function queue(fn) {
    pending = fn;
    if (!raf) raf = requestAnimationFrame(flush);
  }
  function flush() {
    raf = 0;
    const fn = pending;
    pending = null;
    if (fn) fn();
  }
  function flushNow() {
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    flush();
  }

  // Push the working hsv to the palette (and repaint the picker even if the
  // quantised hex did not move, so the handle follows the pointer).
  function commitHsv() {
    if (!change(selected, hsvToHex(hsv.h, hsv.s, hsv.v))) sync();
  }

  /* ---------- wheel ---------- */

  function drawWheel() {
    const dpr = window.devicePixelRatio || 1;
    const v = Math.max(hsv.v, 0.08);       // a pure-black wheel would hide the geometry
    const key = Math.round(v * 255);
    if (drawn.v === key && drawn.dpr === dpr) return;
    drawn = { v: key, dpr };
    const canvas = $('cpWheelCanvas');
    const px = Math.round(WHEEL_SIZE * dpr);
    if (canvas.width !== px) { canvas.width = px; canvas.height = px; }
    const ctx = canvas.getContext('2d');
    const img = ctx.createImageData(px, px);
    const c = px / 2, R = c;
    for (let y = 0; y < px; y++) {
      for (let x = 0; x < px; x++) {
        const dx = x + 0.5 - c, dy = y + 0.5 - c;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const i = (y * px + x) * 4;
        const a = Math.max(0, Math.min(1, R - dist + 0.5));        // anti-aliased rim
        if (a === 0) { img.data[i + 3] = 0; continue; }
        const hue = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360;
        const sat = Math.min(1, dist / R);
        const { r, g, b } = hexToRgb(hsvToHex(hue, sat, v));
        img.data[i] = r; img.data[i + 1] = g; img.data[i + 2] = b;
        img.data[i + 3] = Math.round(a * 255);
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  function place(el, h, s) {
    const rad = h * Math.PI / 180;
    el.style.left = (50 + Math.cos(rad) * s * 50) + '%';
    el.style.top = (50 + Math.sin(rad) * s * 50) + '%';
  }

  function wheelPoint(e) {
    const rect = $('cpWheel').getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    const R = rect.width / 2;
    return {
      h: (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360,
      s: Math.min(1, Math.sqrt(dx * dx + dy * dy) / R),
    };
  }

  function wireWheel() {
    const wheel = $('cpWheel');
    const handle = $('cpHandle');

    const move = e => {
      const p = wheelPoint(e);
      queue(() => { hsv = { h: p.h, s: p.s, v: hsv.v }; commitHsv(); });
    };
    wheel.addEventListener('pointerdown', e => {
      if (e.button !== 0 || e.target.closest('.cp-dot')) return;
      e.preventDefault();
      pointerHeld = true;
      wheel.setPointerCapture(e.pointerId);
      handle.focus({ preventScroll: true });
      move(e);
    });
    wheel.addEventListener('pointermove', e => { if (pointerHeld && wheel.hasPointerCapture(e.pointerId)) move(e); });
    const release = () => {
      if (!pointerHeld) return;
      flushNow();
      pointerHeld = false;
      endBurst();
    };
    wheel.addEventListener('pointerup', release);
    wheel.addEventListener('pointercancel', release);
    wheel.addEventListener('lostpointercapture', release);

    handle.addEventListener('keydown', e => {
      if (e.key === ' ') { e.preventDefault(); e.stopPropagation(); return; }   // Space is the app-wide shuffle key
      const step = e.shiftKey ? 10 : 1;
      let { h, s, v } = hsv;
      if (e.key === 'ArrowRight') h += step;
      else if (e.key === 'ArrowLeft') h -= step;
      else if (e.key === 'ArrowUp') s = Math.min(1, s + step / 100);
      else if (e.key === 'ArrowDown') s = Math.max(0, s - step / 100);
      else return;
      e.preventDefault();
      hsv = { h: (h + 360) % 360, s, v };
      commitHsv();
    });
  }

  /* ---------- brightness + hex ---------- */

  function wireControls() {
    const slider = $('cpBright');
    slider.addEventListener('pointerdown', () => { pointerHeld = true; });
    slider.addEventListener('input', () => {
      const v = Number(slider.value) / 100;
      queue(() => { hsv = { h: hsv.h, s: hsv.s, v }; commitHsv(); });
    });
    const releaseSlider = () => {
      if (!pointerHeld) return;
      flushNow();
      pointerHeld = false;
      endBurst();
    };
    slider.addEventListener('pointerup', releaseSlider);
    slider.addEventListener('pointercancel', releaseSlider);

    const hexEl = $('cpHex');
    const commitHex = () => {
      const hex = normalizeHex(hexEl.value);
      if (!hex) { sync(true); hexEl.classList.remove('is-invalid'); hexEl.removeAttribute('aria-invalid'); return; }
      endBurst();
      if (hex !== state.colors[selected]) hsv = hexToHsv(hex, hsv);
      change(selected, hex);
      endBurst();
      sync(true);
    };
    hexEl.addEventListener('input', () => {
      const bad = hexEl.value.trim() !== '' && !normalizeHex(hexEl.value) && !/^#?[0-9a-fA-F]{0,5}$/.test(hexEl.value.trim());
      hexEl.classList.toggle('is-invalid', bad);
      if (bad) hexEl.setAttribute('aria-invalid', 'true'); else hexEl.removeAttribute('aria-invalid');
    });
    hexEl.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); commitHex(); }
      else if (e.key === 'Escape') { sync(true); }
    });
    hexEl.addEventListener('blur', commitHex);

    // A burst never outlives the picker's focus: Undo, another panel, a click
    // elsewhere all start the next edit as a fresh undo step.
    $('colorPicker').addEventListener('focusout', () => { if (!pointerHeld) endBurst(); });
    document.addEventListener('pointerup', () => { if (pointerHeld) { flushNow(); pointerHeld = false; endBurst(); } });
  }

  function select(key) {
    if (!KEYS.includes(key) || key === selected) return;
    endBurst();
    selected = key;
    hsv = null;
    sync();
  }

  function wireRoles() {
    $('cpRoles').addEventListener('click', e => {
      const btn = e.target.closest('.cp-role');
      if (btn) select(btn.dataset.key);
    });
    $('cpDots').addEventListener('click', e => {
      const dot = e.target.closest('.cp-dot');
      if (dot) select(dot.dataset.key);
    });
  }

  /* ---------- paint ---------- */

  function contrastRow(label, a, b) {
    const ratio = contrastRatio(a, b);
    const level = ratio >= 4.5 ? ['AA', 'pass'] : ratio >= 3 ? ['AA large', 'warn'] : ['Fails AA', 'bad'];
    return `<div class="cp-contrast-row"><span>${esc(label)}</span><b>${ratio.toFixed(1)}:1</b><i class="cp-pill cp-pill-${level[1]}">${level[0]}</i></div>`;
  }

  function paintGuide() {
    const roleKey = colorRoleKeyFor(selected, state.bgMode);
    const role = colorRolesFor(state)[roleKey];
    const hex = state.colors[selected];
    const canvas = canvasHex();
    const rows = [];
    if (roleKey === 'canvas') {
      rows.push(contrastRow('Ink on it', inkHex(), hex));
    } else if (roleKey === 'ink') {
      rows.push(contrastRow('On canvas', hex, canvas));
    } else {
      rows.push(contrastRow('On canvas', hex, canvas));
      const on = pickReadableText(hex);
      rows.push(contrastRow(`${on === '#ffffff' ? 'White' : 'Dark'} text on it`, on, hex));
    }
    $('cpGuide').innerHTML = `
      <div class="cp-guide-head"><b>${esc(role.label)}</b><span>${esc(role.job)}</span></div>
      <dl>
        <dt>Use for</dt><dd>${esc(role.use)}</dd>
        <dt>Never for</dt><dd>${esc(role.never)}</dd>
        <dt>Coverage</dt><dd>${esc(role.coverage)}</dd>
      </dl>
      <div class="cp-contrast" aria-label="Contrast">${rows.join('')}</div>`;
  }

  // forceHex: refresh the hex field even though it has focus (after a commit).
  function sync(forceHex) {
    if (!ready) init();
    const c = state.colors;
    if (!c) return;
    const roles = colorRolesFor(state);

    document.querySelectorAll('#cpRoles .cp-role').forEach(btn => {
      const key = btn.dataset.key;
      const hex = c[key];
      btn.style.setProperty('--cp-sw', hex);
      btn.querySelector('.cp-role-hex').textContent = hex.toUpperCase();
      btn.querySelector('small').textContent = roles[colorRoleKeyFor(key, state.bgMode)].job;
      btn.setAttribute('aria-pressed', key === selected ? 'true' : 'false');
    });

    const hex = c[selected];
    if (!hsv || hsvToHex(hsv.h, hsv.s, hsv.v) !== hex) hsv = hexToHsv(hex, hsv);

    drawWheel();
    place($('cpHandle'), hsv.h, hsv.s);
    $('cpHandle').style.setProperty('--cp-sw', hex);
    $('cpHandle').setAttribute('aria-valuenow', Math.round(hsv.h));
    $('cpHandle').setAttribute('aria-valuetext',
      `${NAMES[selected]}: hue ${Math.round(hsv.h)} degrees, saturation ${Math.round(hsv.s * 100)} percent`);

    document.querySelectorAll('#cpDots .cp-dot').forEach(dot => {
      const key = dot.dataset.key;
      dot.hidden = key === selected;
      if (key === selected) return;
      const p = hexToHsv(c[key]);
      place(dot, p.h, p.s);
      dot.style.background = c[key];
      dot.style.color = pickReadableText(c[key]);
      dot.setAttribute('aria-label', `Select ${NAMES[key]}, ${c[key]}`);
      dot.title = `${NAMES[key]} ${c[key].toUpperCase()}`;
    });

    const slider = $('cpBright');
    slider.value = Math.round(hsv.v * 100);
    slider.style.setProperty('--cp-track', `linear-gradient(to right, #000000, ${hsvToHex(hsv.h, hsv.s, 1)})`);
    slider.setAttribute('aria-valuetext', `${Math.round(hsv.v * 100)} percent`);

    const hexEl = $('cpHex');
    if (forceHex || document.activeElement !== hexEl) {
      hexEl.value = hex.toUpperCase();
      hexEl.classList.remove('is-invalid');
      hexEl.removeAttribute('aria-invalid');
    }
    const hsl = hexToHsl(hex);
    $('cpReadout').textContent = `H ${Math.round(hsl.h)}°  S ${Math.round(hsl.s)}%  L ${Math.round(hsl.l)}%`;
    $('cpSelectedName').textContent = NAMES[selected];

    paintGuide();
    if (imp.colors.length) renderImport();     // "kept" rows track the live palette
  }

  /* ---------- paste brand colors ---------- */

  function parseImport() {
    const colors = extractColors($('cpPaste').value);
    const result = assignRoles(colors, state.colors);
    imp = { colors, assign: {}, source: {} };
    IMPORT_ROLE_KEYS.forEach(k => { imp.assign[k] = result.roles[k].index; imp.source[k] = result.roles[k].source; });
    renderImport();
  }

  const importHex = k => (imp.assign[k] >= 0 ? imp.colors[imp.assign[k]].hex : state.colors[k]);

  function renderImport() {
    const rows = $('cpImpRows');
    const note = $('cpImpNote');
    const text = $('cpPaste').value.trim();
    $('cpImpApply').disabled = !imp.colors.length;
    $('cpImpClear').disabled = !text;

    if (!imp.colors.length) {
      rows.innerHTML = '';
      note.hidden = !text;
      note.textContent = 'No colors found. Use hex like #E4572E or rgb(228, 87, 46).';
      return;
    }
    const active = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.impRole : null;
    rows.innerHTML = IMPORT_ROLE_KEYS.map(k => {
      const hex = importHex(k);
      const opts = [`<option value="-1"${imp.assign[k] === -1 ? ' selected' : ''}>Keep ${esc(state.colors[k].toUpperCase())}</option>`]
        .concat(imp.colors.map((c, i) => `<option value="${i}"${imp.assign[k] === i ? ' selected' : ''}>${esc(c.hex.toUpperCase())}</option>`));
      return `<div class="cp-imp-row">
        <i class="cp-imp-sw" style="background:${esc(hex)}"></i>
        <span class="cp-imp-name">${NAMES[k]}</span>
        <select data-imp-role="${k}" aria-label="${NAMES[k]} color">${opts.join('')}</select>
        <em class="cp-tag cp-tag-${imp.source[k]}">${imp.source[k]}</em>
      </div>`;
    }).join('');
    if (active) { const el = rows.querySelector(`[data-imp-role="${active}"]`); if (el) el.focus(); }

    const used = new Set(IMPORT_ROLE_KEYS.map(k => imp.assign[k]));
    const unused = imp.colors.map((c, i) => i).filter(i => !used.has(i));
    note.hidden = false;
    note.innerHTML = unused.length
      ? 'Unused: ' + unused.map(i => `<span class="cp-unused"><i style="background:${esc(imp.colors[i].hex)}"></i>${esc(imp.colors[i].hex.toUpperCase())}</span>`).join(' ')
      : `${imp.colors.length} color${imp.colors.length === 1 ? '' : 's'} found.`;
  }

  function swapImport(role, idx) {
    const prev = imp.assign[role];
    if (idx !== -1) {
      const other = IMPORT_ROLE_KEYS.find(k => k !== role && imp.assign[k] === idx);
      if (other) { imp.assign[other] = prev; imp.source[other] = prev === -1 ? 'kept' : 'swapped'; }
    }
    imp.assign[role] = idx;
    imp.source[role] = idx === -1 ? 'kept' : 'swapped';
    renderImport();
  }

  function applyImport() {
    if (!imp.colors.length) return;
    const next = {};
    IMPORT_ROLE_KEYS.forEach(k => { next[k] = importHex(k); });
    const same = IMPORT_ROLE_KEYS.every(k => next[k] === state.colors[k]) && state.scheme === 'custom';
    if (same) { showToast('Those colors are already in the palette'); return; }
    endBurst();
    applyBrandColors(next);            // app.js: one undo step, scheme -> custom
    showToast('Colors applied. Undo brings them back.');
  }

  function wireImport() {
    $('cpPaste').addEventListener('input', parseImport);
    $('cpImpRows').addEventListener('change', e => {
      const sel = e.target.closest('select[data-imp-role]');
      if (sel) swapImport(sel.dataset.impRole, Number(sel.value));
    });
    $('cpImpApply').addEventListener('click', applyImport);
    $('cpImpClear').addEventListener('click', () => {
      $('cpPaste').value = '';
      imp = { colors: [], assign: {}, source: {} };
      renderImport();
      $('cpPaste').focus();
    });
  }

  /* ---------- setup ---------- */

  function init() {
    if (ready) return;
    ready = true;
    const dots = $('cpDots');
    dots.innerHTML = KEYS.map(k =>
      `<button type="button" class="cp-dot" data-key="${k}" tabindex="-1">${LETTERS[k]}</button>`).join('');
    wireWheel();
    wireControls();
    wireRoles();
    wireImport();
    renderImport();
  }

  return { init, sync, select };
})();

window.ColorPicker = ColorPicker;
window.refreshColorPicker = () => ColorPicker.sync();
