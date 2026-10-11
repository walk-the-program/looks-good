/* ---------------------------------------------------------------------
   suggest-ui.js — shows at most one quiet suggestion line under the
   Typography, Color palette and Shape sections. Never applies anything on
   its own: Apply goes through the normal state path (Undo works, the brand
   is marked unsaved); hovering Apply previews the change and restores on
   leave; x dismisses it for this brand.
------------------------------------------------------------------------ */

(function () {
  // Typography shows font and type-tuning suggestions in one slot.
  const SLOTS = [
    { slot: 'typography', sections: ['fonts', 'type'] },
    { slot: 'colors', sections: ['colors'] },
    { slot: 'shape', sections: ['shape'] },
  ];
  const ICON = '<svg class="sg-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3Z"/></svg>';

  const cycle = {};          // slot -> index into that slot's ranked list
  const lastSig = {};        // slot -> signature of the ranked list (reset cycle when it changes)
  const shown = {};          // slot -> id currently displayed
  let prev = null;           // fonts at the previous render, to know what just changed
  let previewing = null;     // saved fields while a hover preview is active

  const $ = id => document.getElementById(id);

  /* ---------- preview (never touches saved/draft state) ---------- */

  function paintPreview() {
    applyPreviewTheme();
    renderFontSpecimen();
    // The brand deck is skipped on purpose: a hover preview only retints the board.
  }
  function patchFields(patch) {
    if (patch.headingFont) state.headingFont = fontByName(patch.headingFont);
    if (patch.bodyFont) state.bodyFont = fontByName(patch.bodyFont);
    if (patch.scheme) state.scheme = patch.scheme;
    if (patch.colors) state.colors = Object.assign({}, patch.colors);
    if (patch.shapePreset) state.shapePreset = SHAPE_PRESETS.find(p => p.key === patch.shapePreset) || state.shapePreset;
    if (patch.typography) state.typography = Object.assign({}, state.typography, patch.typography);
  }
  function startPreview(patch) {
    endPreview();
    previewing = {
      headingFont: state.headingFont, bodyFont: state.bodyFont, scheme: state.scheme,
      colors: state.colors, shapePreset: state.shapePreset, typography: state.typography,
    };
    patchFields(patch);
    paintPreview();
  }
  // Anything that persists or compares state (draft autosave, quit flush, the
  // "Unsaved changes" check) must see what is committed, never a hover preview.
  const PREVIEW_FIELDS = ['headingFont', 'bodyFont', 'scheme', 'colors', 'shapePreset', 'typography'];
  window.withCommittedState = function (fn) {
    if (!previewing) return fn();
    const live = {};
    PREVIEW_FIELDS.forEach(k => { live[k] = state[k]; });
    Object.assign(state, previewing);
    try { return fn(); } finally { Object.assign(state, live); }
  };

  function endPreview() {
    if (!previewing) return;
    Object.assign(state, previewing);
    previewing = null;
    paintPreview();
  }

  /* ---------- actions ---------- */

  function applySuggestion(s) {
    endPreview();
    pushUndoSnapshot(state, !!s.apply.typography);
    patchFields(s.apply);
    render();
    showToast('Applied. Undo brings it back.');
  }
  function dismissSuggestion(s) {
    endPreview();
    if (!state.dismissed.includes(s.id)) state.dismissed.push(s.id);
    render();
  }

  /* ---------- rendering ---------- */

  function whatChanged() {
    const changed = !prev ? null
      : prev.body !== state.bodyFont.name && prev.heading === state.headingFont.name ? 'body'
      : prev.heading !== state.headingFont.name && prev.body === state.bodyFont.name ? 'heading' : null;
    prev = { heading: state.headingFont.name, body: state.bodyFont.name };
    return changed;
  }

  function lineHtml(s, hasMore) {
    return `
      ${ICON}
      <p class="sg-text" title="${escapeHtml(s.why)}">${escapeHtml(s.text)}</p>
      <div class="sg-actions">
        <button type="button" class="sg-apply">Apply</button>
        ${hasMore ? '<button type="button" class="sg-next" title="Show another suggestion" aria-label="Show another suggestion">↻</button>' : ''}
        <button type="button" class="sg-dismiss" title="Dismiss for this brand" aria-label="Dismiss suggestion">×</button>
      </div>`;
  }

  function renderSlot(conf, all, changedFresh) {
    const el = $('sg-' + conf.slot);
    if (!el) return;
    const list = all.filter(s => conf.sections.includes(s.section));
    const sig = list.map(s => s.id).join('|');
    if (sig !== lastSig[conf.slot]) { cycle[conf.slot] = 0; lastSig[conf.slot] = sig; }
    const s = list.length ? list[(cycle[conf.slot] || 0) % list.length] : null;
    const id = s ? s.id + '#' + (cycle[conf.slot] || 0) : '';
    if (shown[conf.slot] === id && !changedFresh) return;   // nothing new: don't touch the DOM
    shown[conf.slot] = id;

    if (!s) { el.hidden = true; el.innerHTML = ''; return; }
    el.hidden = false;
    el.classList.remove('is-in');
    el.innerHTML = lineHtml(s, list.length > 1);
    void el.offsetWidth;            // restart the fade
    el.classList.add('is-in');

    const apply = el.querySelector('.sg-apply');
    apply.addEventListener('click', () => applySuggestion(s));
    apply.addEventListener('mouseenter', () => startPreview(s.apply));
    apply.addEventListener('focus', () => startPreview(s.apply));
    apply.addEventListener('mouseleave', endPreview);
    apply.addEventListener('blur', endPreview);
    el.querySelector('.sg-dismiss').addEventListener('click', () => dismissSuggestion(s));
    const next = el.querySelector('.sg-next');
    if (next) next.addEventListener('click', () => {
      endPreview();
      cycle[conf.slot] = ((cycle[conf.slot] || 0) + 1) % list.length;
      shown[conf.slot] = null;
      renderSuggestions();
    });
  }

  function renderSuggestions() {
    if (document.body.dataset.view !== 'editor') return;
    if (previewing) return;     // a hover preview owns the screen
    const all = Suggest.compute(state, { changed: whatChanged() });
    SLOTS.forEach(conf => renderSlot(conf, all, false));
  }

  window.renderSuggestions = renderSuggestions;
  window.endSuggestPreview = endPreview;
  // A newly opened brand shouldn't inherit the previous brand's "what changed".
  window.resetSuggestionContext = () => { prev = null; Object.keys(shown).forEach(k => { shown[k] = null; lastSig[k] = null; }); };
})();
